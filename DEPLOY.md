# Deployment Guide — Flags of the World

## Prerequisites

- Cloudflare account (Workers Paid plan, $5/mo — required for Durable Objects)
- Node.js 18+

---

## Step 1 — Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens your browser to authorize wrangler.

---

## Step 2 — Create the KV Namespace

```bash
npx wrangler kv namespace create FLAGS_KV
```

You'll get output like:
```
{ binding = "FLAGS_KV", id = "abc123..." }
```

Also create a preview namespace (for local dev):
```bash
npx wrangler kv namespace create FLAGS_KV --preview
```

---

## Step 3 — Update wrangler.toml

Replace the placeholder KV IDs in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "FLAGS_KV"
id = "YOUR_KV_NAMESPACE_ID"          # from step 2
preview_id = "YOUR_PREVIEW_ID"       # from step 2 (--preview)
```

---

## Step 4 — Deploy

```bash
npm run deploy
```

Wrangler will:
1. Bundle your TypeScript Worker
2. Create the Durable Object class (`GameRoom`)
3. Deploy to Cloudflare's edge network

Your game will be live at:
```
https://flags-of-the-world.<your-subdomain>.workers.dev
```

---

## Step 5 — Custom Domain (optional)

In the Cloudflare dashboard → Workers & Pages → your worker → Settings → Domains & Routes, add your custom domain.

---

## Local Development

```bash
npm run dev
```

Runs the worker locally at `http://localhost:8787` with Miniflare (full Durable Objects + KV support).

---

## Architecture

```
Browser
  │
  ├─ HTTP GET /          → Serves the SPA (HTML/CSS/JS)
  ├─ POST /api/scores    → Saves game scores to KV
  ├─ GET  /api/stats/:u  → Fetches user progress from KV
  ├─ GET  /api/leaderboard → Global rankings from KV
  ├─ POST /api/rooms     → Creates a new multiplayer room code
  └─ WS   /ws/room/:code → WebSocket → Durable Object (GameRoom)
                               │
                               └─ Real-time game state for all players
```

### Storage (Cloudflare KV)

| Key pattern               | Contents                                      |
|--------------------------|-----------------------------------------------|
| `stats:{username}`       | Personal stats: accuracy, history, flag data  |
| `leaderboard:singleplayer` | Global top-100 single player scores          |
| `leaderboard:multiplayer`  | Global top-100 multiplayer scores            |

### Durable Objects

Each multiplayer room is a `GameRoom` Durable Object that:
- Holds all WebSocket connections for the room
- Manages game state (questions, answers, scores, timer)
- Auto-advances questions after the time limit
- Saves final scores to KV when the game ends
