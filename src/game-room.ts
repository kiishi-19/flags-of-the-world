import { COUNTRIES, generateQuestion, type Country } from "./countries";
import type { Env } from "./types";

interface Player {
  id: string;
  username: string;
  score: number;
  streak: number;
  answeredCurrent: boolean;
  isReady: boolean;
}

interface GameState {
  status: "waiting" | "countdown" | "playing" | "question" | "results" | "finished";
  currentQuestion: number;
  totalQuestions: number;
  currentFlag: string;
  currentCorrect: string;
  currentOptions: Array<{ code: string; name: string }>;
  questionStartTime: number;
  questionTimeLimit: number;
  players: Record<string, Player>;
  hostId: string;
  roomCode: string;
  settings: RoomSettings;
}

interface RoomSettings {
  totalQuestions: number;
  timePerQuestion: number;
  continent: string;
}

interface WebSocketSession {
  socket: WebSocket;
  playerId: string;
  username: string;
}

export class GameRoom {
  private state: DurableObjectState;
  private sessions: Map<string, WebSocketSession> = new Map();
  private gameState: GameState | null = null;
  private questionTimer: ReturnType<typeof setTimeout> | null = null;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }

    if (url.pathname.endsWith("/state")) {
      const gs = await this.state.storage.get<GameState>("gameState");
      return new Response(JSON.stringify(gs || null), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const username = url.searchParams.get("username") || "Anonymous";
    const playerId = url.searchParams.get("playerId") || crypto.randomUUID();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();

    const session: WebSocketSession = { socket: server, playerId, username };
    this.sessions.set(playerId, session);

    // Load or init game state
    if (!this.gameState) {
      this.gameState = await this.state.storage.get<GameState>("gameState") || null;
    }

    server.addEventListener("message", async (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        await this.handleMessage(playerId, username, msg);
      } catch (e) {
        server.send(JSON.stringify({ type: "error", message: "Invalid message" }));
      }
    });

    server.addEventListener("close", async () => {
      this.sessions.delete(playerId);
      if (this.gameState && this.gameState.players[playerId]) {
        // Mark player as disconnected but keep their score
        delete this.gameState.players[playerId];
        await this.saveAndBroadcast();
      }
    });

    // Send current state to new player
    if (this.gameState) {
      server.send(JSON.stringify({ type: "state", state: this.gameState }));
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleMessage(playerId: string, username: string, msg: any): Promise<void> {
    switch (msg.type) {
      case "join":
        await this.handleJoin(playerId, username, msg);
        break;
      case "ready":
        await this.handleReady(playerId);
        break;
      case "start":
        await this.handleStart(playerId, msg.settings);
        break;
      case "answer":
        await this.handleAnswer(playerId, msg.answer);
        break;
      case "next":
        await this.handleNext(playerId);
        break;
      case "restart":
        await this.handleRestart(playerId);
        break;
    }
  }

  private async handleJoin(playerId: string, username: string, msg: any): Promise<void> {
    const roomCode = msg.roomCode;

    if (!this.gameState) {
      // Create new room
      this.gameState = {
        status: "waiting",
        currentQuestion: 0,
        totalQuestions: msg.settings?.totalQuestions || 10,
        currentFlag: "",
        currentCorrect: "",
        currentOptions: [],
        questionStartTime: 0,
        questionTimeLimit: msg.settings?.timePerQuestion || 15,
        players: {},
        hostId: playerId,
        roomCode,
        settings: {
          totalQuestions: msg.settings?.totalQuestions || 10,
          timePerQuestion: msg.settings?.timePerQuestion || 15,
          continent: msg.settings?.continent || "all",
        },
      };
    }

    if (this.gameState.status !== "waiting" && !this.gameState.players[playerId]) {
      const session = this.sessions.get(playerId);
      if (session) {
        session.socket.send(JSON.stringify({ type: "error", message: "Game already in progress" }));
      }
      return;
    }

    this.gameState.players[playerId] = {
      id: playerId,
      username,
      score: 0,
      streak: 0,
      answeredCurrent: false,
      isReady: false,
    };

    await this.saveAndBroadcast();
  }

  private async handleReady(playerId: string): Promise<void> {
    if (!this.gameState || !this.gameState.players[playerId]) return;
    this.gameState.players[playerId].isReady = true;
    await this.saveAndBroadcast();
  }

  private async handleStart(playerId: string, settings?: RoomSettings): Promise<void> {
    if (!this.gameState || this.gameState.hostId !== playerId) return;
    if (this.gameState.status !== "waiting") return;

    if (settings) {
      this.gameState.settings = settings;
      this.gameState.totalQuestions = settings.totalQuestions;
      this.gameState.questionTimeLimit = settings.timePerQuestion;
    }

    this.gameState.status = "countdown";
    await this.saveAndBroadcast();

    // 3 second countdown
    await new Promise(r => setTimeout(r, 3000));
    await this.nextQuestion();
  }

  private async nextQuestion(): Promise<void> {
    if (!this.gameState) return;

    this.gameState.currentQuestion++;

    if (this.gameState.currentQuestion > this.gameState.totalQuestions) {
      await this.endGame();
      return;
    }

    // Reset answered status
    for (const pid in this.gameState.players) {
      this.gameState.players[pid].answeredCurrent = false;
    }

    const continent = this.gameState.settings.continent;
    const pool = continent === "all"
      ? COUNTRIES
      : COUNTRIES.filter(c => c.continent === continent);

    const { correct, options } = generateQuestion(pool);

    this.gameState.status = "question";
    this.gameState.currentFlag = correct.code;
    this.gameState.currentCorrect = correct.code;
    this.gameState.currentOptions = options.map(o => ({ code: o.code, name: o.name }));
    this.gameState.questionStartTime = Date.now();

    await this.saveAndBroadcast();

    // Auto-advance after time limit
    const timeLimit = this.gameState.questionTimeLimit * 1000;
    if (this.questionTimer) clearTimeout(this.questionTimer);
    this.questionTimer = setTimeout(async () => {
      if (this.gameState && this.gameState.status === "question") {
        await this.showQuestionResults();
      }
    }, timeLimit + 500);
  }

  private async showQuestionResults(): Promise<void> {
    if (!this.gameState) return;
    this.gameState.status = "results";
    await this.saveAndBroadcast();

    // Auto-advance after 3 seconds
    await new Promise(r => setTimeout(r, 3000));
    await this.nextQuestion();
  }

  private async handleAnswer(playerId: string, answer: string): Promise<void> {
    if (!this.gameState || this.gameState.status !== "question") return;
    const player = this.gameState.players[playerId];
    if (!player || player.answeredCurrent) return;

    player.answeredCurrent = true;

    const timeElapsed = (Date.now() - this.gameState.questionStartTime) / 1000;
    const timeLimit = this.gameState.questionTimeLimit;
    const isCorrect = answer === this.gameState.currentCorrect;

    if (isCorrect) {
      // Speed bonus: more points for faster answers
      const speedBonus = Math.max(0, Math.floor((timeLimit - timeElapsed) / timeLimit * 500));
      const basePoints = 1000;
      const streakBonus = player.streak * 100;
      const earned = basePoints + speedBonus + streakBonus;
      player.score += earned;
      player.streak++;

      const session = this.sessions.get(playerId);
      if (session) {
        session.socket.send(JSON.stringify({
          type: "answer_result",
          correct: true,
          points: earned,
          streak: player.streak,
          speedBonus,
          streakBonus,
        }));
      }
    } else {
      player.streak = 0;
      const session = this.sessions.get(playerId);
      if (session) {
        session.socket.send(JSON.stringify({
          type: "answer_result",
          correct: false,
          points: 0,
          streak: 0,
          correctAnswer: this.gameState.currentCorrect,
        }));
      }
    }

    // Check if all players answered
    const allAnswered = Object.values(this.gameState.players).every(p => p.answeredCurrent);
    if (allAnswered) {
      if (this.questionTimer) clearTimeout(this.questionTimer);
      await this.showQuestionResults();
    } else {
      await this.saveAndBroadcast();
    }
  }

  private async handleNext(playerId: string): Promise<void> {
    if (!this.gameState || this.gameState.hostId !== playerId) return;
    if (this.gameState.status === "results") {
      await this.nextQuestion();
    }
  }

  private async handleRestart(playerId: string): Promise<void> {
    if (!this.gameState || this.gameState.hostId !== playerId) return;

    // Reset scores but keep players
    for (const pid in this.gameState.players) {
      this.gameState.players[pid].score = 0;
      this.gameState.players[pid].streak = 0;
      this.gameState.players[pid].answeredCurrent = false;
      this.gameState.players[pid].isReady = false;
    }
    this.gameState.status = "waiting";
    this.gameState.currentQuestion = 0;
    await this.saveAndBroadcast();
  }

  private async endGame(): Promise<void> {
    if (!this.gameState) return;
    this.gameState.status = "finished";
    await this.saveAndBroadcast();

    // Save scores to KV
    try {
      const players = Object.values(this.gameState.players);
      const sorted = players.sort((a, b) => b.score - a.score);

      for (const player of sorted) {
        const key = `leaderboard:multiplayer:${player.username}`;
        const existing = await this.env.FLAGS_KV.get<{ best: number; games: number }>(key, "json");
        const newBest = existing ? Math.max(existing.best, player.score) : player.score;
        const games = existing ? existing.games + 1 : 1;
        await this.env.FLAGS_KV.put(key, JSON.stringify({ best: newBest, games }), {
          expirationTtl: 60 * 60 * 24 * 365, // 1 year
        });
      }
    } catch (e) {
      // KV not configured yet, skip
    }
  }

  private async saveAndBroadcast(): Promise<void> {
    if (!this.gameState) return;
    await this.state.storage.put("gameState", this.gameState);
    const msg = JSON.stringify({ type: "state", state: this.gameState });
    for (const session of this.sessions.values()) {
      try {
        session.socket.send(msg);
      } catch (e) {
        // Socket closed
      }
    }
  }
}
