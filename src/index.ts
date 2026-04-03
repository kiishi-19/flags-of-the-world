import { GameRoom } from "./game-room";
import { COUNTRIES } from "./countries";
import { getHTML } from "./frontend/html";
import type { Env } from "./types";

export { GameRoom };
export type { Env };

// Generate a random 6-char room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // ─── WebSocket room connections ───────────────────────────────────────────
    if (path.startsWith("/ws/room/")) {
      const roomCode = path.split("/")[3];
      if (!roomCode) return new Response("Room code required", { status: 400 });

      const id = env.GAME_ROOM.idFromName(roomCode);
      const room = env.GAME_ROOM.get(id);
      return room.fetch(request);
    }

    // ─── API routes ───────────────────────────────────────────────────────────

    // Create a room
    if (path === "/api/rooms" && request.method === "POST") {
      const body = await request.json<{ roomCode?: string }>();
      const roomCode = body.roomCode || generateRoomCode();
      return jsonResponse({ roomCode });
    }

    // Get room state
    if (path.startsWith("/api/rooms/") && request.method === "GET") {
      const roomCode = path.split("/")[3];
      const id = env.GAME_ROOM.idFromName(roomCode);
      const room = env.GAME_ROOM.get(id);
      const res = await room.fetch(new Request(`https://internal/state`));
      const state = await res.json();
      return jsonResponse(state);
    }

    // Save single-player score
    if (path === "/api/scores" && request.method === "POST") {
      const body = await request.json<{
        username: string;
        score: number;
        correct: number;
        total: number;
        continent: string;
        timePerQuestion: number;
        sessionData: Array<{ code: string; correct: boolean; timeMs: number }>;
      }>();

      const { username, score, correct, total, continent, sessionData } = body;
      const now = Date.now();

      // Update user stats
      const statsKey = `stats:${username}`;
      const existing = await env.FLAGS_KV.get<{
        totalGames: number;
        totalScore: number;
        bestScore: number;
        totalCorrect: number;
        totalAnswered: number;
        history: Array<{ score: number; correct: number; total: number; date: number; continent: string }>;
        flagStats: Record<string, { correct: number; wrong: number }>;
      }>(statsKey, "json");

      const stats = existing || {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        totalCorrect: 0,
        totalAnswered: 0,
        history: [],
        flagStats: {},
      };

      stats.totalGames++;
      stats.totalScore += score;
      stats.bestScore = Math.max(stats.bestScore, score);
      stats.totalCorrect += correct;
      stats.totalAnswered += total;

      // Track per-flag performance
      for (const item of sessionData || []) {
        if (!stats.flagStats[item.code]) {
          stats.flagStats[item.code] = { correct: 0, wrong: 0 };
        }
        if (item.correct) {
          stats.flagStats[item.code].correct++;
        } else {
          stats.flagStats[item.code].wrong++;
        }
      }

      // Keep last 50 sessions
      stats.history.unshift({ score, correct, total, date: now, continent });
      stats.history = stats.history.slice(0, 50);

      await env.FLAGS_KV.put(statsKey, JSON.stringify(stats), {
        expirationTtl: 60 * 60 * 24 * 365,
      });

      // Update global leaderboard
      const lbKey = `leaderboard:singleplayer`;
      const leaderboard = await env.FLAGS_KV.get<Array<{ username: string; score: number; date: number }>>(lbKey, "json") || [];

      // Upsert: keep user's best score on leaderboard
      const idx = leaderboard.findIndex(e => e.username === username);
      if (idx >= 0) {
        if (score > leaderboard[idx].score) {
          leaderboard[idx] = { username, score, date: now };
        }
      } else {
        leaderboard.push({ username, score, date: now });
      }

      leaderboard.sort((a, b) => b.score - a.score);
      const top100 = leaderboard.slice(0, 100);

      await env.FLAGS_KV.put(lbKey, JSON.stringify(top100), {
        expirationTtl: 60 * 60 * 24 * 365,
      });

      return jsonResponse({ success: true, stats });
    }

    // Get user stats
    if (path.startsWith("/api/stats/") && request.method === "GET") {
      const username = decodeURIComponent(path.split("/")[3]);
      const statsKey = `stats:${username}`;
      const stats = await env.FLAGS_KV.get(statsKey, "json");
      return jsonResponse(stats || null);
    }

    // Get global leaderboard
    if (path === "/api/leaderboard" && request.method === "GET") {
      const mode = url.searchParams.get("mode") || "singleplayer";
      const lbKey = `leaderboard:${mode}`;
      const leaderboard = await env.FLAGS_KV.get(lbKey, "json") || [];
      return jsonResponse(leaderboard);
    }

    // Get countries list
    if (path === "/api/countries" && request.method === "GET") {
      return jsonResponse(COUNTRIES);
    }

    // ─── Serve frontend ───────────────────────────────────────────────────────
    return new Response(getHTML(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
