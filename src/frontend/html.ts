import { COUNTRY_FACTS } from './facts';

export function getHTML(): string {
  const factsJSON = JSON.stringify(COUNTRY_FACTS);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Flags of the World</title>
<script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
<style>
  /* ─── Reset & Base ─────────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0e1a;
    --surface: #111827;
    --surface2: #1a2235;
    --border: #1f2d45;
    --accent: #00d4ff;
    --accent2: #7c3aed;
    --green: #10b981;
    --red: #ef4444;
    --yellow: #f59e0b;
    --text: #e2e8f0;
    --text-dim: #64748b;
    --text-muted: #334155;
    --radius: 12px;
    --shadow: 0 4px 32px rgba(0,0,0,0.5);
  }
  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; }
  body { min-height: 100vh; display: flex; flex-direction: column; }

  /* ─── Scrollbar ─────────────────────────────────────────────────── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ─── Typography ────────────────────────────────────────────────── */
  h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; letter-spacing: -1px; }
  h2 { font-size: 1.5rem; font-weight: 700; }
  h3 { font-size: 1.1rem; font-weight: 600; }

  /* ─── Layout ────────────────────────────────────────────────────── */
  .screen { display: none; min-height: 100vh; flex-direction: column; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.3s ease; }
  .screen.active { display: flex; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 32px; box-shadow: var(--shadow); width: 100%; max-width: 520px; }
  .card-wide { max-width: 800px; }
  .card-xl { max-width: 1100px; }

  /* ─── Inputs & Buttons ───────────────────────────────────────────── */
  input, select {
    width: 100%; padding: 12px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-size: 1rem;
    outline: none; transition: border-color 0.2s;
  }
  input:focus, select:focus { border-color: var(--accent); }
  input::placeholder { color: var(--text-dim); }
  select option { background: var(--surface2); }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border: none; border-radius: 8px; font-size: 0.95rem;
    font-weight: 600; cursor: pointer; transition: all 0.15s; text-decoration: none;
    white-space: nowrap;
  }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-primary:hover { background: #00b8e0; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,212,255,0.35); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: var(--red); color: #fff; }
  .btn-danger:hover { background: #dc2626; }
  .btn-purple { background: var(--accent2); color: #fff; }
  .btn-purple:hover { background: #6d28d9; transform: translateY(-1px); }
  .btn-lg { padding: 16px 32px; font-size: 1.05rem; border-radius: 10px; }
  .btn-sm { padding: 8px 16px; font-size: 0.85rem; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
  .btn-full { width: 100%; }

  /* ─── Home Screen ───────────────────────────────────────────────── */
  #screen-home { background: radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 60%),
                              radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 60%),
                              var(--bg); }
  .home-logo { text-align: center; margin-bottom: 48px; }
  .home-logo .globe { font-size: 64px; display: block; margin-bottom: 16px; filter: drop-shadow(0 0 32px rgba(0,212,255,0.5)); }
  .home-logo h1 { background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .home-logo p { color: var(--text-dim); margin-top: 8px; font-size: 1.05rem; }
  .home-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
  .home-stat { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
  .home-stat .val { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
  .home-stat .lbl { font-size: 0.8rem; color: var(--text-dim); margin-top: 4px; }
  .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
  .mode-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; cursor: pointer; transition: all 0.2s; text-align: center; }
  .mode-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,255,0.15); }
  .mode-card .icon { font-size: 2.5rem; margin-bottom: 12px; display: block; }
  .mode-card h3 { margin-bottom: 6px; }
  .mode-card p { font-size: 0.85rem; color: var(--text-dim); }

  /* ─── Nav Bar ───────────────────────────────────────────────────── */
  .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,14,26,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
  .nav-brand { font-weight: 700; font-size: 1.1rem; color: var(--accent); cursor: pointer; }
  .nav-user { display: flex; align-items: center; gap: 12px; }
  .nav-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: #000; }
  .nav-links { display: flex; gap: 8px; }
  .nav-link { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; transition: all 0.15s; }
  .nav-link:hover, .nav-link.active { color: var(--text); background: var(--surface2); }

  /* ─── Setup Screen ──────────────────────────────────────────────── */
  .setup-header { text-align: center; margin-bottom: 32px; }
  .setup-header .icon { font-size: 3rem; display: block; margin-bottom: 12px; }
  .form-group { margin-bottom: 20px; }
  .form-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; font-weight: 500; color: var(--text-dim); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .option-pills { display: flex; flex-wrap: wrap; gap: 8px; }
  .pill { padding: 8px 16px; border: 1px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; background: var(--surface2); }
  .pill:hover { border-color: var(--accent); }
  .pill.selected { border-color: var(--accent); background: rgba(0,212,255,0.1); color: var(--accent); }
  .divider { height: 1px; background: var(--border); margin: 24px 0; }

  /* ─── Game Screen ───────────────────────────────────────────────── */
  #screen-game { padding-top: 80px; background: var(--bg); }
  .game-header { width: 100%; max-width: 720px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; gap: 16px; }
  .game-progress { flex: 1; }
  .progress-bar { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 3px; transition: width 0.4s ease; }
  .progress-text { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px; }
  .game-score-display { text-align: right; }
  .game-score-display .score-val { font-size: 1.5rem; font-weight: 800; color: var(--accent); }
  .game-score-display .streak-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 2px 10px; font-size: 0.8rem; color: var(--yellow); margin-top: 4px; }

  .flag-container { position: relative; margin-bottom: 32px; }
  .flag-img {
    width: min(480px, 90vw); height: auto; max-height: 280px; object-fit: contain;
    border-radius: 12px; border: 2px solid var(--border);
    box-shadow: 0 8px 48px rgba(0,0,0,0.6);
    display: block; transition: transform 0.2s;
  }
  .flag-img.reveal { animation: flagReveal 0.5s ease; }
  @keyframes flagReveal { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .timer-ring { position: absolute; top: -16px; right: -16px; }
  .timer-svg { transform: rotate(-90deg); }
  .timer-bg { fill: none; stroke: var(--surface2); stroke-width: 4; }
  .timer-progress { fill: none; stroke: var(--accent); stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 0.5s linear, stroke 0.3s; }
  .timer-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: var(--accent); }

  .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: min(480px, 90vw); }
  .option-btn {
    padding: 16px 20px; background: var(--surface); border: 2px solid var(--border);
    border-radius: 10px; color: var(--text); font-size: 0.95rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s; text-align: left; position: relative; overflow: hidden;
  }
  .option-btn:hover:not(:disabled) { border-color: var(--accent); background: rgba(0,212,255,0.06); transform: translateY(-1px); }
  .option-btn.correct { border-color: var(--green); background: rgba(16,185,129,0.12); color: var(--green); }
  .option-btn.wrong { border-color: var(--red); background: rgba(239,68,68,0.1); color: var(--red); }
  .option-btn.reveal-correct { animation: pulse-green 0.5s ease; }
  @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 100% { box-shadow: 0 0 0 12px rgba(16,185,129,0); } }
  .option-btn .option-key { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

  .score-popup {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--surface); border: 1px solid var(--green); border-radius: 16px;
    padding: 24px 40px; text-align: center; z-index: 200;
    animation: scorePopup 0.8s ease forwards;
  }
  @keyframes scorePopup {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    40% { transform: translate(-50%, -50%) scale(0.95); }
    60% { transform: translate(-50%, -50%) scale(1.02); }
    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -70%) scale(0.9); }
  }
  .score-popup .pts { font-size: 2rem; font-weight: 800; color: var(--green); }
  .score-popup .breakdown { font-size: 0.85rem; color: var(--text-dim); margin-top: 6px; display: flex; flex-direction: column; gap: 3px; }
  .score-popup .speed-label { font-size: 1rem; font-weight: 700; margin-bottom: 4px; letter-spacing: 0.5px; }

  /* ─── Fact Card ─────────────────────────────────────────────────── */
  /* backdrop behind the fact card */
  .fact-overlay {
    position: fixed; inset: 0; z-index: 249;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(3px);
    animation: overlayIn 0.3s ease;
  }
  .fact-overlay.fade-out { animation: overlayOut 0.35s ease forwards; }
  @keyframes overlayIn  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes overlayOut { from { opacity: 1; } to { opacity: 0; } }

  .fact-card {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 250;
    width: min(520px, 92vw);
    background: linear-gradient(145deg, #0f1f38 0%, #131f35 100%);
    border: 1px solid rgba(0,212,255,0.25);
    border-radius: 20px;
    padding: 28px 28px 24px;
    display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.08);
    animation: factPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes factPop {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.82); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  .fact-card.slide-down {
    animation: factDismiss 0.3s ease forwards;
  }
  @keyframes factDismiss {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to   { opacity: 0; transform: translate(-50%, -46%) scale(0.93); }
  }
  .fact-card-top { display: flex; align-items: center; gap: 16px; }
  .fact-card .fc-flag { width: 96px; height: auto; border-radius: 8px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
  .fact-card .fc-body { flex: 1; min-width: 0; }
  .fact-card .fc-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 5px; }
  .fact-card .fc-country { font-size: 1.15rem; font-weight: 800; margin-bottom: 0; }
  .fact-card .fc-divider { height: 1px; background: rgba(255,255,255,0.07); }
  .fact-card .fc-text { font-size: 0.92rem; color: #b0bfcf; line-height: 1.65; }
  .fact-card .fc-timer-bar { height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; margin-top: 4px; }
  .fact-card .fc-timer-fill { height: 100%; background: var(--accent); border-radius: 2px; animation: timerShrink var(--fact-duration, 5s) linear forwards; }
  @keyframes timerShrink { from { width: 100%; } to { width: 0%; } }

  /* ─── Multiplayer Game ──────────────────────────────────────────── */
  .mp-players-bar { width: 100%; max-width: 720px; display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .mp-player-chip { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 8px 14px; transition: border-color 0.2s; }
  .mp-player-chip.answered { border-color: var(--green); }
  .mp-player-chip .mp-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #000; }
  .mp-player-chip .mp-name { font-size: 0.85rem; font-weight: 600; }
  .mp-player-chip .mp-score { font-size: 0.8rem; color: var(--accent); margin-left: 4px; }

  /* ─── Results Screen ────────────────────────────────────────────── */
  #screen-results { padding-top: 80px; }
  .results-header { text-align: center; margin-bottom: 32px; }
  .results-badge { font-size: 4rem; margin-bottom: 16px; display: block; }
  .results-score { font-size: 3rem; font-weight: 800; color: var(--accent); }
  .results-sub { color: var(--text-dim); margin-top: 8px; }
  .results-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .result-stat { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
  .result-stat .rs-val { font-size: 1.4rem; font-weight: 700; }
  .result-stat .rs-lbl { font-size: 0.8rem; color: var(--text-dim); margin-top: 4px; }
  .flag-review { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; max-height: 320px; overflow-y: auto; padding: 4px; }
  .flag-review-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .flag-review-item img { width: 80px; height: auto; border-radius: 4px; }
  .flag-review-item .fr-name { font-size: 0.8rem; text-align: center; }
  .flag-review-item.correct-flag { border-color: rgba(16,185,129,0.4); }
  .flag-review-item.wrong-flag { border-color: rgba(239,68,68,0.4); }
  .flag-review-item .fr-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; }
  .badge-correct { background: rgba(16,185,129,0.15); color: var(--green); }
  .badge-wrong { background: rgba(239,68,68,0.1); color: var(--red); }

  /* ─── Stats/Profile Screen ──────────────────────────────────────── */
  #screen-stats { padding-top: 80px; padding-bottom: 40px; }
  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .stat-card .sc-val { font-size: 1.8rem; font-weight: 700; color: var(--accent); }
  .stat-card .sc-lbl { font-size: 0.85rem; color: var(--text-dim); margin-top: 4px; }

  .chart-container { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
  .chart-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 16px; color: var(--text-dim); }
  .chart-bars { display: flex; gap: 6px; align-items: flex-end; height: 120px; }
  .chart-bar-wrap { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; }
  .chart-bar { width: 100%; border-radius: 4px 4px 0 0; background: var(--accent); transition: height 0.5s ease; min-width: 8px; opacity: 0.85; }
  .chart-bar:hover { opacity: 1; }
  .chart-bar-lbl { font-size: 0.65rem; color: var(--text-muted); white-space: nowrap; }

  .worst-flags { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .worst-flag-item { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
  .worst-flag-item img { width: 64px; height: auto; border-radius: 4px; margin-bottom: 8px; }
  .worst-flag-item .wf-name { font-size: 0.8rem; margin-bottom: 4px; }
  .worst-flag-item .wf-accuracy { font-size: 0.85rem; font-weight: 600; }
  .accuracy-bar { height: 4px; background: var(--surface); border-radius: 2px; overflow: hidden; margin-top: 6px; }
  .accuracy-fill { height: 100%; border-radius: 2px; }

  /* ─── Leaderboard Screen ────────────────────────────────────────── */
  #screen-leaderboard { padding-top: 80px; padding-bottom: 40px; }
  .lb-table { width: 100%; border-collapse: collapse; }
  .lb-table th { text-align: left; padding: 12px 16px; font-size: 0.8rem; color: var(--text-dim); font-weight: 600; border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.5px; }
  .lb-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .lb-table tr:last-child td { border-bottom: none; }
  .lb-table tr:hover td { background: var(--surface2); }
  .lb-table tr.me td { background: rgba(0,212,255,0.05); }
  .lb-rank { font-weight: 700; font-size: 1.1rem; }
  .rank-1 { color: #ffd700; }
  .rank-2 { color: #c0c0c0; }
  .rank-3 { color: #cd7f32; }
  .lb-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; color: #000; }
  .lb-user { display: flex; align-items: center; gap: 12px; }
  .lb-score { font-weight: 700; font-size: 1.1rem; color: var(--accent); }

  /* ─── Lobby Screen ──────────────────────────────────────────────── */
  .room-code-display { background: var(--surface2); border: 2px dashed var(--border); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
  .room-code-display .rc-label { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 8px; }
  .room-code-display .rc-code { font-size: 2.5rem; font-weight: 800; letter-spacing: 8px; color: var(--accent); cursor: pointer; }
  .room-code-display .rc-copy { font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; }
  .lobby-players { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; max-height: 240px; overflow-y: auto; }
  .lobby-player { display: flex; align-items: center; gap: 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; }
  .lobby-player .lp-ready { margin-left: auto; font-size: 0.8rem; }
  .ready-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--red); margin-right: 6px; }
  .ready-dot.ready { background: var(--green); }

  /* ─── MP Results ────────────────────────────────────────────────── */
  .mp-podium { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 32px; }
  .podium-place { display: flex; flex-direction: column; align-items: center; }
  .podium-avatar { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #000; margin-bottom: 8px; }
  .podium-bar { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; border-radius: 8px 8px 0 0; padding: 12px 20px; width: 120px; }
  .podium-rank { font-size: 1.5rem; }
  .podium-name { font-size: 0.9rem; font-weight: 600; margin-top: 6px; }
  .podium-score { font-size: 0.85rem; color: var(--text-dim); margin-top: 2px; }
  .podium-1st .podium-bar { background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); height: 140px; }
  .podium-2nd .podium-bar { background: rgba(192,192,192,0.1); border: 1px solid rgba(192,192,192,0.3); height: 100px; }
  .podium-3rd .podium-bar { background: rgba(205,127,50,0.1); border: 1px solid rgba(205,127,50,0.3); height: 80px; }

  /* ─── Toast ─────────────────────────────────────────────────────── */
  .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 500; display: flex; flex-direction: column; gap: 8px; }
  .toast { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 20px; font-size: 0.9rem; box-shadow: var(--shadow); animation: toastIn 0.3s ease; max-width: 320px; }
  .toast.success { border-color: var(--green); color: var(--green); }
  .toast.error { border-color: var(--red); color: var(--red); }
  @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

  /* ─── Countdown ─────────────────────────────────────────────────── */
  .countdown-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 300; }
  .countdown-num { font-size: 10rem; font-weight: 900; color: var(--accent); animation: countdownPop 1s ease; }
  @keyframes countdownPop { 0% { transform: scale(0.5); opacity: 0; } 30% { transform: scale(1.2); opacity: 1; } 60% { transform: scale(0.95); } 80% { opacity: 1; } 100% { opacity: 0; transform: scale(1.5); } }

  /* ─── Tabs ───────────────────────────────────────────────────────── */
  .tabs { display: flex; gap: 4px; background: var(--surface2); border-radius: 8px; padding: 4px; margin-bottom: 24px; }
  .tab { flex: 1; padding: 8px; border: none; background: none; color: var(--text-dim); cursor: pointer; border-radius: 6px; font-size: 0.9rem; font-weight: 500; transition: all 0.15s; }
  .tab.active { background: var(--surface); color: var(--text); }

  /* ─── Responsive ─────────────────────────────────────────────────── */
  @media (max-width: 600px) {
    .form-row { grid-template-columns: 1fr; }
    .results-stats { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .mode-grid { grid-template-columns: 1fr; }
    .options-grid { grid-template-columns: 1fr 1fr; }
    .home-stats { grid-template-columns: 1fr; }
  }

  /* ─── Difficulty Badges ─────────────────────────────────────────── */
  .diff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .diff-card {
    border: 2px solid var(--border); border-radius: 10px; padding: 14px 10px;
    text-align: center; cursor: pointer; transition: all 0.15s; background: var(--surface2);
  }
  .diff-card:hover { transform: translateY(-2px); }
  .diff-card .dc-icon  { font-size: 1.6rem; display: block; margin-bottom: 6px; }
  .diff-card .dc-label { font-weight: 700; font-size: 0.95rem; }
  .diff-card .dc-sub   { font-size: 0.75rem; color: var(--text-dim); margin-top: 3px; }
  .diff-card.selected  { border-color: var(--accent); background: rgba(0,212,255,0.07); }
  .diff-easy   { --dc: #10b981; }
  .diff-medium { --dc: #f59e0b; }
  .diff-hard   { --dc: #ef4444; }
  .diff-card.selected .dc-label { color: var(--dc, var(--accent)); }

  /* ─── Shape Canvas ───────────────────────────────────────────────── */
  .shape-canvas {
    width: min(480px, 90vw); height: 260px;
    border-radius: 12px; border: 2px solid var(--border);
    box-shadow: 0 8px 48px rgba(0,0,0,0.6);
    background: rgba(7,15,30,0.9);
    display: block;
  }
  .shape-loading {
    width: min(480px, 90vw); height: 260px; border-radius: 12px;
    border: 2px solid var(--border); background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-dim); font-size: 0.9rem; gap: 10px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }

  /* ─── Continent Hint (Easy mode) ────────────────────────────────── */
  .continent-hint {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3);
    border-radius: 20px; padding: 4px 14px; font-size: 0.82rem;
    color: var(--green); font-weight: 600; margin-bottom: 14px;
  }

  /* ─── Animations & Utils ─────────────────────────────────────────── */
  .glow { text-shadow: 0 0 20px rgba(0,212,255,0.5); }
  .text-accent { color: var(--accent); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-dim { color: var(--text-dim); }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-4 { margin-bottom: 16px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .font-bold { font-weight: 700; }
  .text-sm { font-size: 0.875rem; }
  .hidden { display: none !important; }
  .w-full { width: 100%; }
</style>
</head>
<body>

<!-- ─── Toast Container ──────────────────────────────────────────── -->
<div class="toast-container" id="toasts"></div>

<!-- ─── Navbar (shown after login) ──────────────────────────────── -->
<nav class="navbar hidden" id="navbar">
  <div class="nav-brand" onclick="showHome()">Flags of the World</div>
  <div class="nav-links">
    <button class="nav-link" onclick="showScreen('screen-stats')">My Stats</button>
    <button class="nav-link" onclick="showScreen('screen-leaderboard')">Leaderboard</button>
  </div>
  <div class="nav-user">
    <div class="nav-avatar" id="nav-avatar">?</div>
    <span id="nav-username" style="font-size:0.9rem;font-weight:600;"></span>
    <button class="btn btn-sm btn-secondary" onclick="logout()">Logout</button>
  </div>
</nav>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: LOGIN
═══════════════════════════════════════════════════════════════════ -->
<div class="screen active" id="screen-login" style="background: radial-gradient(ellipse at 30% 60%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(124,58,237,0.09) 0%, transparent 60%), var(--bg);">
  <div style="text-align:center;margin-bottom:40px;">
    <span style="font-size:72px;display:block;margin-bottom:20px;filter:drop-shadow(0 0 40px rgba(0,212,255,0.6));">🌍</span>
    <h1 style="background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Flags of the World</h1>
    <p style="color:var(--text-dim);margin-top:10px;font-size:1.1rem;">Test your flag knowledge. Challenge your friends.</p>
  </div>
  <div class="card" style="max-width:400px;">
    <h2 style="margin-bottom:8px;">Enter your name</h2>
    <p style="color:var(--text-dim);font-size:0.9rem;margin-bottom:24px;">Your progress will be saved automatically.</p>
    <div class="form-group">
      <input type="text" id="login-username" placeholder="Your username" maxlength="20" autocomplete="off" />
    </div>
    <button class="btn btn-primary btn-full btn-lg" onclick="handleLogin()">Start Playing</button>
    <p style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:16px;">No account needed — just pick a name</p>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: HOME
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-home">
  <div style="width:100%;max-width:520px;">
    <div class="home-logo">
      <span class="globe">🌍</span>
      <h1>Flags of the World</h1>
      <p>Welcome back, <span id="home-username" class="text-accent"></span></p>
    </div>
    <div class="home-stats" id="home-stats">
      <div class="home-stat"><div class="val" id="hs-games">0</div><div class="lbl">Games Played</div></div>
      <div class="home-stat"><div class="val" id="hs-best">0</div><div class="lbl">Best Score</div></div>
      <div class="home-stat"><div class="val" id="hs-accuracy">—</div><div class="lbl">Accuracy</div></div>
    </div>
    <div class="mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
      <div class="mode-card" onclick="showScreen('screen-sp-setup')">
        <span class="icon">🎯</span>
        <h3>Flag Quiz</h3>
        <p>Identify flags from around the world</p>
      </div>
      <div class="mode-card" onclick="showScreen('screen-shapes-setup')">
        <span class="icon">🗺️</span>
        <h3>Shape Quiz</h3>
        <p>Identify countries by their shape</p>
      </div>
      <div class="mode-card" onclick="showScreen('screen-mp-setup')">
        <span class="icon">⚡</span>
        <h3>Multiplayer</h3>
        <p>Compete with friends in real-time</p>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-secondary btn-full" onclick="showScreen('screen-stats')">My Stats</button>
      <button class="btn btn-secondary btn-full" onclick="showScreen('screen-leaderboard')">Leaderboard</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: SINGLE PLAYER SETUP
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-sp-setup">
  <div class="card">
    <div class="setup-header">
      <span class="icon">🎯</span>
      <h2>Flag Quiz</h2>
      <p class="text-dim mt-2">Choose your difficulty</p>
    </div>
    <div class="form-group">
      <div class="diff-grid">
        <div class="diff-card diff-easy selected" id="sp-diff-easy" onclick="setDifficulty('sp','easy')">
          <span class="dc-icon">🟢</span>
          <div class="dc-label">Easy</div>
          <div class="dc-sub">20s · 10 questions<br>Options from mixed regions</div>
        </div>
        <div class="diff-card diff-medium" id="sp-diff-medium" onclick="setDifficulty('sp','medium')">
          <span class="dc-icon">🟡</span>
          <div class="dc-label">Medium</div>
          <div class="dc-sub">15s · 20 questions<br>Options from same continent</div>
        </div>
        <div class="diff-card diff-hard" id="sp-diff-hard" onclick="setDifficulty('sp','hard')">
          <span class="dc-icon">🔴</span>
          <div class="dc-label">Hard</div>
          <div class="dc-sub">8s · 30 questions<br>Similar-looking flags</div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Region Filter</label>
      <div class="option-pills" id="sp-continent-pills">
        <div class="pill selected" data-val="all" onclick="selectPill(this,'sp-continent')">All</div>
        <div class="pill" data-val="Africa" onclick="selectPill(this,'sp-continent')">Africa</div>
        <div class="pill" data-val="Americas" onclick="selectPill(this,'sp-continent')">Americas</div>
        <div class="pill" data-val="Asia" onclick="selectPill(this,'sp-continent')">Asia</div>
        <div class="pill" data-val="Europe" onclick="selectPill(this,'sp-continent')">Europe</div>
        <div class="pill" data-val="Oceania" onclick="selectPill(this,'sp-continent')">Oceania</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-top:8px;">
      <button class="btn btn-secondary" onclick="showHome()">Back</button>
      <button class="btn btn-primary btn-full" onclick="startSinglePlayer('flags')">Start Game</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: SHAPES SETUP
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-shapes-setup">
  <div class="card">
    <div class="setup-header">
      <span class="icon">🗺️</span>
      <h2>Shape Quiz</h2>
      <p class="text-dim mt-2">Identify countries by their silhouette</p>
    </div>
    <div class="form-group">
      <div class="diff-grid">
        <div class="diff-card diff-easy selected" id="sh-diff-easy" onclick="setDifficulty('sh','easy')">
          <span class="dc-icon">🟢</span>
          <div class="dc-label">Easy</div>
          <div class="dc-sub">20s · 10 questions<br>Continent shown as hint</div>
        </div>
        <div class="diff-card diff-medium" id="sh-diff-medium" onclick="setDifficulty('sh','medium')">
          <span class="dc-icon">🟡</span>
          <div class="dc-label">Medium</div>
          <div class="dc-sub">15s · 20 questions<br>No hints</div>
        </div>
        <div class="diff-card diff-hard" id="sh-diff-hard" onclick="setDifficulty('sh','hard')">
          <span class="dc-icon">🔴</span>
          <div class="dc-label">Hard</div>
          <div class="dc-sub">8s · 30 questions<br>Same-continent options</div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label>Region Filter</label>
      <div class="option-pills" id="sh-continent-pills">
        <div class="pill selected" data-val="all" onclick="selectPill(this,'sh-continent')">All</div>
        <div class="pill" data-val="Africa" onclick="selectPill(this,'sh-continent')">Africa</div>
        <div class="pill" data-val="Americas" onclick="selectPill(this,'sh-continent')">Americas</div>
        <div class="pill" data-val="Asia" onclick="selectPill(this,'sh-continent')">Asia</div>
        <div class="pill" data-val="Europe" onclick="selectPill(this,'sh-continent')">Europe</div>
        <div class="pill" data-val="Oceania" onclick="selectPill(this,'sh-continent')">Oceania</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;margin-top:8px;">
      <button class="btn btn-secondary" onclick="showHome()">Back</button>
      <button class="btn btn-primary btn-full" onclick="startSinglePlayer('shapes')">Start Game</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: MULTIPLAYER SETUP
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-mp-setup">
  <div class="card">
    <div class="setup-header">
      <span class="icon">⚡</span>
      <h2>Multiplayer</h2>
      <p class="text-dim mt-2">Create or join a room</p>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="switchTab(this,'mp-create')">Create Room</button>
      <button class="tab" onclick="switchTab(this,'mp-join')">Join Room</button>
    </div>
    <!-- Create -->
    <div id="mp-create">
      <div class="form-group">
        <label>Difficulty</label>
        <div class="diff-grid">
          <div class="diff-card diff-easy" id="mp-diff-easy" onclick="setDifficulty('mp','easy')">
            <span class="dc-icon">🟢</span><div class="dc-label">Easy</div><div class="dc-sub">20s · mixed options</div>
          </div>
          <div class="diff-card diff-medium selected" id="mp-diff-medium" onclick="setDifficulty('mp','medium')">
            <span class="dc-icon">🟡</span><div class="dc-label">Medium</div><div class="dc-sub">15s · same continent</div>
          </div>
          <div class="diff-card diff-hard" id="mp-diff-hard" onclick="setDifficulty('mp','hard')">
            <span class="dc-icon">🔴</span><div class="dc-label">Hard</div><div class="dc-sub">8s · similar flags</div>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Questions</label>
        <div class="option-pills" id="mp-questions-pills">
          <div class="pill" data-val="10" onclick="selectPill(this,'mp-questions')">10</div>
          <div class="pill selected" data-val="15" onclick="selectPill(this,'mp-questions')">15</div>
          <div class="pill" data-val="20" onclick="selectPill(this,'mp-questions')">20</div>
        </div>
      </div>
      <div class="form-group">
        <label>Region</label>
        <div class="option-pills" id="mp-continent-pills">
          <div class="pill selected" data-val="all" onclick="selectPill(this,'mp-continent')">All</div>
          <div class="pill" data-val="Africa" onclick="selectPill(this,'mp-continent')">Africa</div>
          <div class="pill" data-val="Americas" onclick="selectPill(this,'mp-continent')">Americas</div>
          <div class="pill" data-val="Asia" onclick="selectPill(this,'mp-continent')">Asia</div>
          <div class="pill" data-val="Europe" onclick="selectPill(this,'mp-continent')">Europe</div>
          <div class="pill" data-val="Oceania" onclick="selectPill(this,'mp-continent')">Oceania</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn btn-secondary" onclick="showHome()">Back</button>
        <button class="btn btn-primary btn-full" onclick="createRoom()">Create Room</button>
      </div>
    </div>
    <!-- Join -->
    <div id="mp-join" class="hidden">
      <div class="form-group">
        <label>Room Code</label>
        <input type="text" id="join-code-input" placeholder="Enter 6-letter code" maxlength="6" style="text-transform:uppercase;letter-spacing:4px;font-size:1.2rem;text-align:center;" />
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn btn-secondary" onclick="showHome()">Back</button>
        <button class="btn btn-primary btn-full" onclick="joinRoom()">Join Room</button>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: LOBBY
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-lobby">
  <div class="card" style="max-width:480px;">
    <div class="room-code-display">
      <div class="rc-label">Room Code</div>
      <div class="rc-code" id="lobby-code" onclick="copyRoomCode()">------</div>
      <div class="rc-copy">Click to copy</div>
    </div>
    <h3 style="margin-bottom:12px;">Players <span id="lobby-count" class="text-dim text-sm">(0)</span></h3>
    <div class="lobby-players" id="lobby-players"></div>
    <div id="lobby-host-controls" class="hidden">
      <button class="btn btn-primary btn-full btn-lg" id="lobby-start-btn" onclick="startMultiplayer()">Start Game</button>
    </div>
    <div id="lobby-waiting-msg" class="hidden">
      <p class="text-dim text-sm" style="text-align:center;">Waiting for host to start the game...</p>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: GAME (Single Player & Multiplayer)
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-game">
  <!-- MP players bar -->
  <div class="mp-players-bar hidden" id="mp-players-bar"></div>

  <!-- Header -->
  <div class="game-header">
    <div class="game-progress">
      <div class="progress-text">Question <span id="q-current">0</span> of <span id="q-total">0</span></div>
      <div class="progress-bar"><div class="progress-fill" id="q-progress" style="width:0%"></div></div>
    </div>
    <div class="game-score-display">
      <div class="score-val" id="g-score">0</div>
      <div><span class="streak-badge" id="streak-badge"><span>🔥</span><span id="streak-count">0</span> streak</span></div>
    </div>
  </div>

  <!-- Continent hint (Easy mode) -->
  <div id="continent-hint" class="continent-hint hidden"></div>

  <!-- Flag / Shape + Timer -->
  <div class="flag-container">
    <img id="flag-img" class="flag-img" src="" alt="Flag" />
    <canvas id="shape-canvas" class="shape-canvas hidden" width="480" height="260"></canvas>
    <div class="timer-ring">
      <svg class="timer-svg" width="64" height="64" viewBox="0 0 64 64">
        <circle class="timer-bg" cx="32" cy="32" r="28" />
        <circle class="timer-progress" id="timer-circle" cx="32" cy="32" r="28" stroke-dasharray="175.9" stroke-dashoffset="0" />
      </svg>
      <div class="timer-text" id="timer-text">15</div>
    </div>
  </div>

  <!-- Options -->
  <div class="options-grid" id="options-grid"></div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: RESULTS
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-results">
  <div class="card card-wide">
    <div class="results-header">
      <span class="results-badge" id="results-badge">🏆</span>
      <div class="results-score" id="results-score">0</div>
      <div class="results-sub" id="results-sub">pts</div>
    </div>
    <div class="results-stats">
      <div class="result-stat">
        <div class="rs-val text-green" id="r-correct">0</div>
        <div class="rs-lbl">Correct</div>
      </div>
      <div class="result-stat">
        <div class="rs-val text-red" id="r-wrong">0</div>
        <div class="rs-lbl">Wrong</div>
      </div>
      <div class="result-stat">
        <div class="rs-val text-accent" id="r-accuracy">0%</div>
        <div class="rs-lbl">Accuracy</div>
      </div>
      <div class="result-stat">
        <div class="rs-val" id="r-best-streak">0</div>
        <div class="rs-lbl">Best Streak</div>
      </div>
    </div>
    <div class="divider"></div>
    <h3 class="mb-4">Flag Review</h3>
    <div class="flag-review" id="flag-review"></div>
    <div style="display:flex;gap:12px;margin-top:24px;">
      <button class="btn btn-secondary" onclick="showHome()">Home</button>
      <button class="btn btn-primary btn-full" onclick="playAgain()">Play Again</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: MULTIPLAYER RESULTS
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-mp-results">
  <div class="card card-wide">
    <h2 style="text-align:center;margin-bottom:24px;">Game Over!</h2>
    <div class="mp-podium" id="mp-podium"></div>
    <div class="divider"></div>
    <h3 class="mb-4">Full Scoreboard</h3>
    <table class="lb-table" id="mp-final-table">
      <thead><tr><th>#</th><th>Player</th><th>Score</th></tr></thead>
      <tbody id="mp-final-tbody"></tbody>
    </table>
    <div style="display:flex;gap:12px;margin-top:24px;">
      <button class="btn btn-secondary btn-full" onclick="showHome()">Home</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: MY STATS
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-stats">
  <div class="card card-xl" style="max-width:900px;">
    <div class="flex items-center justify-between mb-4">
      <h2>My Progress</h2>
      <button class="btn btn-secondary btn-sm" onclick="showHome()">Back</button>
    </div>
    <div class="stats-grid" id="stats-overview"></div>
    <div class="chart-container">
      <div class="chart-title">Score History (last 20 games)</div>
      <div class="chart-bars" id="score-chart"></div>
    </div>
    <div class="chart-container">
      <div class="chart-title">Accuracy History (last 20 games)</div>
      <div class="chart-bars" id="accuracy-chart"></div>
    </div>
    <div id="weak-flags-section" class="hidden">
      <h3 style="margin-bottom:16px;color:var(--text-dim);">Flags to Practice</h3>
      <div class="worst-flags" id="worst-flags"></div>
    </div>
    <div id="no-stats-msg" class="hidden" style="text-align:center;padding:48px;color:var(--text-dim);">
      <p style="font-size:3rem;margin-bottom:16px;">📊</p>
      <p>No stats yet. Play some games first!</p>
      <button class="btn btn-primary mt-4" onclick="showHome()">Play Now</button>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════
     SCREEN: LEADERBOARD
═══════════════════════════════════════════════════════════════════ -->
<div class="screen" id="screen-leaderboard">
  <div class="card card-wide">
    <div class="flex items-center justify-between mb-4">
      <h2>Leaderboard</h2>
      <button class="btn btn-secondary btn-sm" onclick="showHome()">Back</button>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="switchLbTab(this,'singleplayer')">Single Player</button>
      <button class="tab" onclick="switchLbTab(this,'multiplayer')">Multiplayer</button>
    </div>
    <div id="lb-empty" class="hidden" style="text-align:center;padding:48px;color:var(--text-dim);">
      <p style="font-size:3rem;margin-bottom:12px;">🏆</p>
      <p>No scores yet. Be the first!</p>
    </div>
    <table class="lb-table" id="lb-table">
      <thead><tr><th>#</th><th>Player</th><th>Best Score</th><th>Date</th></tr></thead>
      <tbody id="lb-tbody"></tbody>
    </table>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════
const state = {
  username: '',
  playerId: '',
  // Single Player
  sp: {
    questions: 20, timePerQ: 15, continent: 'all',
    pool: [], current: 0, score: 0, streak: 0, bestStreak: 0,
    correct: 0, wrong: 0, sessions: [], timer: null, timeLeft: 0,
    answered: false, currentCorrect: '',
  },
  // Multiplayer
  mp: {
    ws: null, roomCode: '', isHost: false,
    settings: { totalQuestions: 15, timePerQuestion: 15, continent: 'all' },
    localScore: 0,
  },
  currentMode: 'sp',
};

// Pill selections
const pillState = {
  'sp-questions': '20', 'sp-time': '15', 'sp-continent': 'all',
  'sh-continent': 'all',
  'mp-questions': '15', 'mp-time': '15', 'mp-continent': 'all',
};

// ═══════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════
function flagUrl(code) {
  return \`https://flagcdn.com/w320/\${code}.png\`;
}

function avatarColor(name) {
  const colors = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];
  let hash = 0;
  for (let c of name) hash = (hash << 5) - hash + c.charCodeAt(0);
  return colors[Math.abs(hash) % colors.length];
}

function avatarInitial(name) { return (name || '?')[0].toUpperCase(); }

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = \`toast \${type}\`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function randId() { return Math.random().toString(36).substr(2, 12); }

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
function showScreen(id) {
  hideFactCard();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  // Auto-load data whenever these screens are shown
  if (id === 'screen-stats') loadStats();
  if (id === 'screen-leaderboard') loadLeaderboard();
}

function showHome() {
  // Disconnect WS if any
  if (state.mp.ws) {
    state.mp.ws.close();
    state.mp.ws = null;
  }
  loadHomeStats();
  showScreen('screen-home');
}

function logout() {
  localStorage.removeItem('fotw_username');
  localStorage.removeItem('fotw_playerId');
  document.getElementById('navbar').classList.add('hidden');
  showScreen('screen-login');
}

function switchTab(btn, targetId) {
  btn.closest('.card, .card-wide').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const panel = btn.closest('.card, .card-wide');
  panel.querySelectorAll('[id^="mp-create"],[id^="mp-join"]').forEach(p => p.classList.add('hidden'));
  document.getElementById(targetId).classList.remove('hidden');
}

function switchLbTab(btn, mode) {
  btn.closest('.card, .card-wide').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  loadLeaderboard(mode);
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════
function handleLogin() {
  const input = document.getElementById('login-username');
  const name = input.value.trim();
  if (!name || name.length < 2) { toast('Enter a name (min 2 chars)', 'error'); return; }
  state.username = name;
  state.playerId = localStorage.getItem('fotw_playerId') || randId();
  localStorage.setItem('fotw_username', name);
  localStorage.setItem('fotw_playerId', state.playerId);
  initApp();
}

function initApp() {
  document.getElementById('navbar').classList.remove('hidden');
  document.getElementById('nav-username').textContent = state.username;
  const av = document.getElementById('nav-avatar');
  av.textContent = avatarInitial(state.username);
  av.style.background = \`linear-gradient(135deg, \${avatarColor(state.username)}, #7c3aed)\`;
  document.getElementById('home-username').textContent = state.username;
  loadHomeStats();
  showScreen('screen-home');
}

// Auto-login
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('fotw_username');
  if (saved) {
    document.getElementById('login-username').value = saved;
    state.username = saved;
    state.playerId = localStorage.getItem('fotw_playerId') || randId();
    localStorage.setItem('fotw_playerId', state.playerId);
    initApp();
  }
  document.getElementById('login-username').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
});

// ═══════════════════════════════════════════════════════════════════
// HOME STATS
// ═══════════════════════════════════════════════════════════════════
function applyHomeStats(stats) {
  if (!stats) return;
  document.getElementById('hs-games').textContent = stats.totalGames;
  document.getElementById('hs-best').textContent = stats.bestScore.toLocaleString();
  const acc = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) + '%'
    : '—';
  document.getElementById('hs-accuracy').textContent = acc;
}

async function loadHomeStats() {
  // Show local data immediately (instant)
  applyHomeStats(getLocalStats());

  // Then fetch from server and update if server has more complete data
  try {
    const res = await fetch(\`/api/stats/\${encodeURIComponent(state.username)}\`);
    if (res.ok) {
      const serverStats = await res.json();
      if (serverStats && serverStats.totalGames > 0) {
        const merged = mergeStats(getLocalStats(), serverStats);
        try { localStorage.setItem(LOCAL_STATS_KEY(), JSON.stringify(merged)); } catch {}
        applyHomeStats(merged);
      }
    }
  } catch(e) { /* server unavailable, local data already shown */ }
}

// ═══════════════════════════════════════════════════════════════════
// PILL SELECTION
// ═══════════════════════════════════════════════════════════════════
function selectPill(el, group) {
  el.closest('.option-pills').querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  pillState[group] = el.dataset.val;
}

// ═══════════════════════════════════════════════════════════════════
// COUNTRY FACTS (embedded from facts.ts at build time)
// ═══════════════════════════════════════════════════════════════════
const COUNTRY_FACTS = ${factsJSON};

// ═══════════════════════════════════════════════════════════════════
// DIFFICULTY & SIMILAR FLAGS
// ═══════════════════════════════════════════════════════════════════
const DIFFICULTY_PRESETS = {
  easy:   { questions: 10, timePerQ: 20, strategy: 'different_continent' },
  medium: { questions: 20, timePerQ: 15, strategy: 'same_continent'      },
  hard:   { questions: 30, timePerQ:  8, strategy: 'similar_flags'       },
};

// Flags that look visually similar — used for Hard mode wrong options
const SIMILAR_FLAGS = {
  ro:['td','ad'],          td:['ro','ad'],          // Romania ≈ Chad (nearly identical)
  id:['mc','pl'],          mc:['id','pl'],          pl:['id','mc'],   // red/white pairs
  ie:['ci'],               ci:['ie'],               // Ireland ↔ Ivory Coast (mirrored)
  dk:['no','se','fi','is'],no:['dk','is','se'],     se:['fi','dk','no'],
  fi:['se','ee','no'],     is:['no','dk'],          ee:['fi','lv'],
  nl:['lu','ru','hr'],     lu:['nl','ru'],          ru:['nl','hr','sk'],
  hr:['nl','ru','sk','si'],sk:['ru','hr','si'],     si:['sk','ru','hr'],
  fr:['be','ml','it'],     be:['fr','de','ml'],     de:['be','et'],
  it:['mx','hu'],          mx:['it'],               hu:['it','bg'],
  et:['de','gn','cm'],     gn:['ml','sn','cm'],     ml:['gn','sn'],
  sn:['ml','gn','cm'],     cm:['gn','sn','et'],     gh:['et','gn','ml'],
  jo:['ps','ae'],          ps:['jo','ae'],          ae:['jo','ps','ye'],
  ye:['sy','eg'],          sy:['ye','eg','ir'],     eg:['ye','sy'],
  au:['nz','fj'],          nz:['au'],               fj:['au'],
  pk:['my','tn'],          my:['pk'],               tn:['pk','tr'],
  tr:['tn','az'],          az:['tr'],               ng:['ro','td'],
  za:['zw','zb'],          lv:['ee','fr'],          lt:['ee','lv'],
  bg:['hu'],               ir:['tj','ae'],          tj:['ir','af'],
  af:['tj','ir'],          kz:['ru','az'],          mx:['it','do'],
};

// Difficulty selection (shared between flag quiz and shape quiz)
const diffState = { sp: 'easy', sh: 'easy', mp: 'medium' };

function setDifficulty(prefix, level) {
  diffState[prefix] = level;
  ['easy','medium','hard'].forEach(l => {
    const el = document.getElementById(\`\${prefix}-diff-\${l}\`);
    if (el) el.classList.toggle('selected', l === level);
  });
}

// ═══════════════════════════════════════════════════════════════════
// COUNTRY SHAPES (TopoJSON)
// ═══════════════════════════════════════════════════════════════════
// ISO 3166-1 numeric → alpha-2 (world-atlas uses numeric IDs)
const ISO_NUM = {
  4:'af',8:'al',12:'dz',20:'ad',24:'ao',28:'ag',32:'ar',36:'au',40:'at',
  50:'bd',51:'am',52:'bb',56:'be',64:'bt',68:'bo',70:'ba',72:'bw',76:'br',
  96:'bn',100:'bg',104:'mm',108:'bi',112:'by',116:'kh',120:'cm',124:'ca',
  132:'cv',140:'cf',144:'lk',148:'td',152:'cl',156:'cn',170:'co',174:'km',
  178:'cg',180:'cd',188:'cr',191:'hr',192:'cu',196:'cy',203:'cz',204:'bj',
  208:'dk',212:'dm',214:'do',218:'ec',226:'gq',231:'et',232:'er',233:'ee',
  242:'fj',246:'fi',250:'fr',262:'dj',266:'ga',268:'ge',270:'gm',276:'de',
  288:'gh',296:'ki',300:'gr',308:'gd',320:'gt',324:'gn',328:'gy',332:'ht',
  340:'hn',344:'hk',348:'hu',356:'in',360:'id',364:'ir',368:'iq',372:'ie',
  376:'il',380:'it',384:'ci',388:'jm',392:'jp',398:'kz',400:'jo',404:'ke',
  408:'kp',410:'kr',414:'kw',417:'kg',418:'la',422:'lb',426:'ls',428:'lv',
  430:'lr',434:'ly',438:'li',440:'lt',442:'lu',450:'mg',454:'mw',458:'my',
  462:'mv',466:'ml',470:'mt',478:'mr',480:'mu',484:'mx',492:'mc',496:'mn',
  498:'md',499:'me',504:'ma',508:'mz',512:'om',516:'na',520:'nr',524:'np',
  528:'nl',540:'nc',548:'vu',554:'nz',558:'ni',562:'ne',566:'ng',578:'no',
  583:'fm',584:'mh',585:'pw',586:'pk',590:'pa',598:'pg',600:'py',604:'pe',
  608:'ph',616:'pl',620:'pt',624:'gw',626:'tl',634:'qa',642:'ro',643:'ru',
  646:'rw',659:'kn',662:'lc',670:'vc',678:'st',682:'sa',686:'sn',688:'rs',
  694:'sl',702:'sg',703:'sk',704:'vn',705:'si',706:'so',710:'za',716:'zw',
  724:'es',728:'ss',729:'sd',740:'sr',748:'sz',752:'se',756:'ch',760:'sy',
  762:'tj',764:'th',768:'tg',776:'to',780:'tt',784:'ae',788:'tn',792:'tr',
  795:'tm',798:'tv',800:'ug',804:'ua',807:'mk',818:'eg',826:'gb',834:'tz',
  840:'us',854:'bf',858:'uy',860:'uz',862:'ve',882:'ws',887:'ye',894:'zm',
};
// Reverse: alpha-2 → numeric
const ALPHA_TO_NUM = Object.fromEntries(Object.entries(ISO_NUM).map(([n,a])=>[a,+n]));

// Countries too small to render meaningfully at 110m resolution — excluded from shapes
const SHAPES_EXCLUDED = new Set([
  'ad','bb','bh','bs','cv','dm','gd','ki','kn','lc','li','mc','mh','mt','mu',
  'mv','nr','pw','sb','sc','sg','sm','st','to','tt','tv','vc','va','ws','fm',
]);

let worldGeoData = null; // cached TopoJSON features after first load

async function loadWorldData() {
  if (worldGeoData) return worldGeoData;
  const r = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const topo = await r.json();
  worldGeoData = window['topojson'].feature(topo, topo.objects.countries).features;
  return worldGeoData;
}

function renderCountryShape(canvas, alpha2) {
  const numId = ALPHA_TO_NUM[alpha2];
  if (!worldGeoData || !numId) return false;
  const feature = worldGeoData.find(f => +f.id === numId);
  if (!feature) return false;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Collect all coordinates to find bounding box
  const pts = [];
  const collect = ring => ring.forEach(c => pts.push(c));
  const geom = feature.geometry;
  if (geom.type === 'Polygon')      geom.coordinates.forEach(collect);
  else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => p.forEach(collect));
  if (!pts.length) return false;

  let [x0,x1,y0,y1] = [Infinity,-Infinity,Infinity,-Infinity];
  pts.forEach(([x,y]) => { x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); y1=Math.max(y1,y); });

  const PAD = 0.12;
  const rx = x1-x0 || 1, ry = y1-y0 || 1;
  const scale = Math.min(W*(1-2*PAD)/rx, H*(1-2*PAD)/ry);
  const ox = (W - rx*scale)/2 - x0*scale;
  const oy = (H + ry*scale)/2 + y0*scale;
  const proj = ([x,y]) => [x*scale+ox, -y*scale+oy];

  function drawPolygon(rings) {
    ctx.beginPath();
    rings.forEach(ring => {
      const [sx,sy] = proj(ring[0]); ctx.moveTo(sx,sy);
      ring.slice(1).forEach(c => { const [px,py]=proj(c); ctx.lineTo(px,py); });
      ctx.closePath();
    });
  }

  ctx.shadowColor = 'rgba(0,212,255,0.5)';
  ctx.shadowBlur = 16;
  ctx.fillStyle   = 'rgba(0,212,255,0.15)';
  ctx.strokeStyle = 'rgba(0,212,255,0.9)';
  ctx.lineWidth   = 1.5;

  if (geom.type === 'Polygon')      { drawPolygon(geom.coordinates); ctx.fill(); ctx.stroke(); }
  else geom.coordinates.forEach(p => { drawPolygon(p); ctx.fill(); ctx.stroke(); });

  ctx.shadowBlur = 0;
  return true;
}

// Speed tier helpers
function getSpeedTier(timeElapsed, timeLimit) {
  const pct = timeElapsed / timeLimit;
  if (pct <= 0.20) return { label: 'INSTANT ⚡', color: '#00d4ff', bonus: 1500 };
  if (pct <= 0.40) return { label: 'LIGHTNING 🔥', color: '#f59e0b', bonus: 1000 };
  if (pct <= 0.60) return { label: 'QUICK ✓',    color: '#10b981', bonus:  600 };
  if (pct <= 0.80) return { label: 'GOOD 👍',    color: '#a3e635', bonus:  300 };
  return                   { label: 'JUST IN TIME ⏱️', color: '#94a3b8', bonus:  100 };
}

// ═══════════════════════════════════════════════════════════════════
// SINGLE PLAYER
// ═══════════════════════════════════════════════════════════════════
const ALL_COUNTRIES = [
  {code:'dz',name:'Algeria',continent:'Africa'},{code:'ao',name:'Angola',continent:'Africa'},{code:'bj',name:'Benin',continent:'Africa'},{code:'bw',name:'Botswana',continent:'Africa'},{code:'bf',name:'Burkina Faso',continent:'Africa'},{code:'bi',name:'Burundi',continent:'Africa'},{code:'cv',name:'Cape Verde',continent:'Africa'},{code:'cm',name:'Cameroon',continent:'Africa'},{code:'cf',name:'Central African Republic',continent:'Africa'},{code:'td',name:'Chad',continent:'Africa'},{code:'km',name:'Comoros',continent:'Africa'},{code:'cg',name:'Republic of the Congo',continent:'Africa'},{code:'cd',name:'DR Congo',continent:'Africa'},{code:'dj',name:'Djibouti',continent:'Africa'},{code:'eg',name:'Egypt',continent:'Africa'},{code:'gq',name:'Equatorial Guinea',continent:'Africa'},{code:'er',name:'Eritrea',continent:'Africa'},{code:'sz',name:'Eswatini',continent:'Africa'},{code:'et',name:'Ethiopia',continent:'Africa'},{code:'ga',name:'Gabon',continent:'Africa'},{code:'gm',name:'Gambia',continent:'Africa'},{code:'gh',name:'Ghana',continent:'Africa'},{code:'gn',name:'Guinea',continent:'Africa'},{code:'gw',name:'Guinea-Bissau',continent:'Africa'},{code:'ci',name:"Ivory Coast",continent:'Africa'},{code:'ke',name:'Kenya',continent:'Africa'},{code:'ls',name:'Lesotho',continent:'Africa'},{code:'lr',name:'Liberia',continent:'Africa'},{code:'ly',name:'Libya',continent:'Africa'},{code:'mg',name:'Madagascar',continent:'Africa'},{code:'mw',name:'Malawi',continent:'Africa'},{code:'ml',name:'Mali',continent:'Africa'},{code:'mr',name:'Mauritania',continent:'Africa'},{code:'mu',name:'Mauritius',continent:'Africa'},{code:'ma',name:'Morocco',continent:'Africa'},{code:'mz',name:'Mozambique',continent:'Africa'},{code:'na',name:'Namibia',continent:'Africa'},{code:'ne',name:'Niger',continent:'Africa'},{code:'ng',name:'Nigeria',continent:'Africa'},{code:'rw',name:'Rwanda',continent:'Africa'},{code:'st',name:'São Tomé and Príncipe',continent:'Africa'},{code:'sn',name:'Senegal',continent:'Africa'},{code:'sc',name:'Seychelles',continent:'Africa'},{code:'sl',name:'Sierra Leone',continent:'Africa'},{code:'so',name:'Somalia',continent:'Africa'},{code:'za',name:'South Africa',continent:'Africa'},{code:'ss',name:'South Sudan',continent:'Africa'},{code:'sd',name:'Sudan',continent:'Africa'},{code:'tz',name:'Tanzania',continent:'Africa'},{code:'tg',name:'Togo',continent:'Africa'},{code:'tn',name:'Tunisia',continent:'Africa'},{code:'ug',name:'Uganda',continent:'Africa'},{code:'zm',name:'Zambia',continent:'Africa'},{code:'zw',name:'Zimbabwe',continent:'Africa'},
  {code:'ag',name:'Antigua and Barbuda',continent:'Americas'},{code:'ar',name:'Argentina',continent:'Americas'},{code:'bs',name:'Bahamas',continent:'Americas'},{code:'bb',name:'Barbados',continent:'Americas'},{code:'bz',name:'Belize',continent:'Americas'},{code:'bo',name:'Bolivia',continent:'Americas'},{code:'br',name:'Brazil',continent:'Americas'},{code:'ca',name:'Canada',continent:'Americas'},{code:'cl',name:'Chile',continent:'Americas'},{code:'co',name:'Colombia',continent:'Americas'},{code:'cr',name:'Costa Rica',continent:'Americas'},{code:'cu',name:'Cuba',continent:'Americas'},{code:'dm',name:'Dominica',continent:'Americas'},{code:'do',name:'Dominican Republic',continent:'Americas'},{code:'ec',name:'Ecuador',continent:'Americas'},{code:'sv',name:'El Salvador',continent:'Americas'},{code:'gd',name:'Grenada',continent:'Americas'},{code:'gt',name:'Guatemala',continent:'Americas'},{code:'gy',name:'Guyana',continent:'Americas'},{code:'ht',name:'Haiti',continent:'Americas'},{code:'hn',name:'Honduras',continent:'Americas'},{code:'jm',name:'Jamaica',continent:'Americas'},{code:'mx',name:'Mexico',continent:'Americas'},{code:'ni',name:'Nicaragua',continent:'Americas'},{code:'pa',name:'Panama',continent:'Americas'},{code:'py',name:'Paraguay',continent:'Americas'},{code:'pe',name:'Peru',continent:'Americas'},{code:'kn',name:'Saint Kitts and Nevis',continent:'Americas'},{code:'lc',name:'Saint Lucia',continent:'Americas'},{code:'vc',name:'Saint Vincent and the Grenadines',continent:'Americas'},{code:'sr',name:'Suriname',continent:'Americas'},{code:'tt',name:'Trinidad and Tobago',continent:'Americas'},{code:'us',name:'United States',continent:'Americas'},{code:'uy',name:'Uruguay',continent:'Americas'},{code:'ve',name:'Venezuela',continent:'Americas'},
  {code:'af',name:'Afghanistan',continent:'Asia'},{code:'am',name:'Armenia',continent:'Asia'},{code:'az',name:'Azerbaijan',continent:'Asia'},{code:'bh',name:'Bahrain',continent:'Asia'},{code:'bd',name:'Bangladesh',continent:'Asia'},{code:'bt',name:'Bhutan',continent:'Asia'},{code:'bn',name:'Brunei',continent:'Asia'},{code:'kh',name:'Cambodia',continent:'Asia'},{code:'cn',name:'China',continent:'Asia'},{code:'cy',name:'Cyprus',continent:'Asia'},{code:'ge',name:'Georgia',continent:'Asia'},{code:'in',name:'India',continent:'Asia'},{code:'id',name:'Indonesia',continent:'Asia'},{code:'ir',name:'Iran',continent:'Asia'},{code:'iq',name:'Iraq',continent:'Asia'},{code:'il',name:'Israel',continent:'Asia'},{code:'jp',name:'Japan',continent:'Asia'},{code:'jo',name:'Jordan',continent:'Asia'},{code:'kz',name:'Kazakhstan',continent:'Asia'},{code:'kw',name:'Kuwait',continent:'Asia'},{code:'kg',name:'Kyrgyzstan',continent:'Asia'},{code:'la',name:'Laos',continent:'Asia'},{code:'lb',name:'Lebanon',continent:'Asia'},{code:'my',name:'Malaysia',continent:'Asia'},{code:'mv',name:'Maldives',continent:'Asia'},{code:'mn',name:'Mongolia',continent:'Asia'},{code:'mm',name:'Myanmar',continent:'Asia'},{code:'np',name:'Nepal',continent:'Asia'},{code:'kp',name:'North Korea',continent:'Asia'},{code:'om',name:'Oman',continent:'Asia'},{code:'pk',name:'Pakistan',continent:'Asia'},{code:'ps',name:'Palestine',continent:'Asia'},{code:'ph',name:'Philippines',continent:'Asia'},{code:'qa',name:'Qatar',continent:'Asia'},{code:'sa',name:'Saudi Arabia',continent:'Asia'},{code:'sg',name:'Singapore',continent:'Asia'},{code:'kr',name:'South Korea',continent:'Asia'},{code:'lk',name:'Sri Lanka',continent:'Asia'},{code:'sy',name:'Syria',continent:'Asia'},{code:'tw',name:'Taiwan',continent:'Asia'},{code:'tj',name:'Tajikistan',continent:'Asia'},{code:'th',name:'Thailand',continent:'Asia'},{code:'tl',name:'Timor-Leste',continent:'Asia'},{code:'tr',name:'Turkey',continent:'Asia'},{code:'tm',name:'Turkmenistan',continent:'Asia'},{code:'ae',name:'United Arab Emirates',continent:'Asia'},{code:'uz',name:'Uzbekistan',continent:'Asia'},{code:'vn',name:'Vietnam',continent:'Asia'},{code:'ye',name:'Yemen',continent:'Asia'},
  {code:'al',name:'Albania',continent:'Europe'},{code:'ad',name:'Andorra',continent:'Europe'},{code:'at',name:'Austria',continent:'Europe'},{code:'by',name:'Belarus',continent:'Europe'},{code:'be',name:'Belgium',continent:'Europe'},{code:'ba',name:'Bosnia and Herzegovina',continent:'Europe'},{code:'bg',name:'Bulgaria',continent:'Europe'},{code:'hr',name:'Croatia',continent:'Europe'},{code:'cz',name:'Czech Republic',continent:'Europe'},{code:'dk',name:'Denmark',continent:'Europe'},{code:'ee',name:'Estonia',continent:'Europe'},{code:'fi',name:'Finland',continent:'Europe'},{code:'fr',name:'France',continent:'Europe'},{code:'de',name:'Germany',continent:'Europe'},{code:'gr',name:'Greece',continent:'Europe'},{code:'hu',name:'Hungary',continent:'Europe'},{code:'is',name:'Iceland',continent:'Europe'},{code:'ie',name:'Ireland',continent:'Europe'},{code:'it',name:'Italy',continent:'Europe'},{code:'xk',name:'Kosovo',continent:'Europe'},{code:'lv',name:'Latvia',continent:'Europe'},{code:'li',name:'Liechtenstein',continent:'Europe'},{code:'lt',name:'Lithuania',continent:'Europe'},{code:'lu',name:'Luxembourg',continent:'Europe'},{code:'mt',name:'Malta',continent:'Europe'},{code:'md',name:'Moldova',continent:'Europe'},{code:'mc',name:'Monaco',continent:'Europe'},{code:'me',name:'Montenegro',continent:'Europe'},{code:'nl',name:'Netherlands',continent:'Europe'},{code:'mk',name:'North Macedonia',continent:'Europe'},{code:'no',name:'Norway',continent:'Europe'},{code:'pl',name:'Poland',continent:'Europe'},{code:'pt',name:'Portugal',continent:'Europe'},{code:'ro',name:'Romania',continent:'Europe'},{code:'ru',name:'Russia',continent:'Europe'},{code:'sm',name:'San Marino',continent:'Europe'},{code:'rs',name:'Serbia',continent:'Europe'},{code:'sk',name:'Slovakia',continent:'Europe'},{code:'si',name:'Slovenia',continent:'Europe'},{code:'es',name:'Spain',continent:'Europe'},{code:'se',name:'Sweden',continent:'Europe'},{code:'ch',name:'Switzerland',continent:'Europe'},{code:'ua',name:'Ukraine',continent:'Europe'},{code:'gb',name:'United Kingdom',continent:'Europe'},{code:'va',name:'Vatican City',continent:'Europe'},
  {code:'au',name:'Australia',continent:'Oceania'},{code:'fj',name:'Fiji',continent:'Oceania'},{code:'ki',name:'Kiribati',continent:'Oceania'},{code:'mh',name:'Marshall Islands',continent:'Oceania'},{code:'fm',name:'Micronesia',continent:'Oceania'},{code:'nr',name:'Nauru',continent:'Oceania'},{code:'nz',name:'New Zealand',continent:'Oceania'},{code:'pw',name:'Palau',continent:'Oceania'},{code:'pg',name:'Papua New Guinea',continent:'Oceania'},{code:'ws',name:'Samoa',continent:'Oceania'},{code:'sb',name:'Solomon Islands',continent:'Oceania'},{code:'to',name:'Tonga',continent:'Oceania'},{code:'tv',name:'Tuvalu',continent:'Oceania'},{code:'vu',name:'Vanuatu',continent:'Oceania'},
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions(total, continent, difficulty = 'medium', shapesOnly = false) {
  let pool = continent === 'all' ? ALL_COUNTRIES : ALL_COUNTRIES.filter(c => c.continent === continent);
  if (shapesOnly) pool = pool.filter(c => !SHAPES_EXCLUDED.has(c.code));
  const shuffled = shuffle(pool);

  return shuffled.slice(0, Math.min(total, shuffled.length)).map(correct => {
    let wrongPool;
    if (difficulty === 'easy') {
      // Options from different continents — visually very different
      wrongPool = ALL_COUNTRIES.filter(c => c.code !== correct.code && c.continent !== correct.continent);
      if (wrongPool.length < 3) wrongPool = ALL_COUNTRIES.filter(c => c.code !== correct.code);
    } else if (difficulty === 'hard') {
      // Similar-looking flags first, then same continent to fill gaps
      const similar = (SIMILAR_FLAGS[correct.code] || [])
        .map(code => ALL_COUNTRIES.find(c => c.code === code)).filter(Boolean);
      const sameContinent = ALL_COUNTRIES.filter(c => c.code !== correct.code && c.continent === correct.continent);
      wrongPool = [...similar, ...sameContinent].filter((c,i,a) => a.findIndex(x=>x.code===c.code)===i);
      if (wrongPool.length < 3) wrongPool = [...wrongPool, ...ALL_COUNTRIES.filter(c=>c.code!==correct.code)].filter((c,i,a)=>a.findIndex(x=>x.code===c.code)===i);
    } else {
      // Medium: same continent
      wrongPool = ALL_COUNTRIES.filter(c => c.code !== correct.code && c.continent === correct.continent);
      if (wrongPool.length < 3) wrongPool = ALL_COUNTRIES.filter(c => c.code !== correct.code);
    }
    const wrong = shuffle(wrongPool).slice(0, 3);
    const options = shuffle([...wrong, correct]);
    return { correct, options };
  });
}

async function startSinglePlayer(gameMode = 'flags') {
  const prefix = gameMode === 'shapes' ? 'sh' : 'sp';
  const difficulty = diffState[prefix] || 'medium';
  const preset = DIFFICULTY_PRESETS[difficulty];
  const continent = pillState[\`\${prefix}-continent\`] || 'all';
  const shapesOnly = gameMode === 'shapes';

  const sp = state.sp;
  sp.questions = preset.questions;
  sp.timePerQ  = preset.timePerQ;
  sp.continent = continent;
  sp.difficulty = difficulty;
  sp.gameMode  = gameMode;
  sp.pool = generateQuestions(preset.questions, continent, difficulty, shapesOnly);
  sp.current = 0; sp.score = 0; sp.streak = 0; sp.bestStreak = 0;
  sp.correct = 0; sp.wrong = 0; sp.sessions = [];
  state.currentMode = 'sp';

  document.getElementById('mp-players-bar').classList.add('hidden');
  showScreen('screen-game');

  if (gameMode === 'shapes') {
    // Pre-load world data; show loading state
    document.getElementById('flag-img').classList.add('hidden');
    document.getElementById('shape-canvas').classList.remove('hidden');
    try {
      await loadWorldData();
    } catch(e) {
      toast('Could not load world map data — check your connection', 'error');
      showHome(); return;
    }
  } else {
    document.getElementById('flag-img').classList.remove('hidden');
    document.getElementById('shape-canvas').classList.add('hidden');
  }

  loadQuestion();
}

function loadQuestion() {
  const sp = state.sp;
  if (sp.current >= sp.pool.length) { endSinglePlayer(); return; }

  const q = sp.pool[sp.current];
  sp.answered = false;
  sp.currentCorrect = q.correct.code;

  // Update header
  document.getElementById('q-current').textContent = sp.current + 1;
  document.getElementById('q-total').textContent = sp.pool.length;
  document.getElementById('q-progress').style.width = ((sp.current / sp.pool.length) * 100) + '%';
  document.getElementById('g-score').textContent = sp.score.toLocaleString();
  document.getElementById('streak-count').textContent = sp.streak;
  document.getElementById('streak-badge').style.display = sp.streak >= 2 ? 'inline-flex' : 'none';

  // Continent hint — shown on Easy mode
  const hintEl = document.getElementById('continent-hint');
  if (sp.difficulty === 'easy') {
    hintEl.textContent = '📍 ' + q.correct.continent;
    hintEl.classList.remove('hidden');
  } else {
    hintEl.classList.add('hidden');
  }

  // Flag or Shape
  const isShapes = sp.gameMode === 'shapes';
  const img    = document.getElementById('flag-img');
  const canvas = document.getElementById('shape-canvas');
  if (isShapes) {
    img.classList.add('hidden');
    canvas.classList.remove('hidden');
    renderCountryShape(canvas, q.correct.code);
  } else {
    canvas.classList.add('hidden');
    img.classList.remove('hidden');
    img.src = flagUrl(q.correct.code);
    img.className = 'flag-img reveal';
  }

  // Options
  const grid = document.getElementById('options-grid');
  const keys = ['A', 'B', 'C', 'D'];
  grid.innerHTML = q.options.map((opt, i) =>
    \`<button class="option-btn" id="opt-\${i}" onclick="handleSPAnswer('\${opt.code}', this)">
      \${opt.name}
      <span class="option-key">\${keys[i]}</span>
    </button>\`
  ).join('');

  // Keyboard shortcuts
  document.onkeydown = (e) => {
    const map = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const btn = document.getElementById(\`opt-\${idx}\`);
      if (btn && !btn.disabled) handleSPAnswer(q.options[idx].code, btn);
    }
  };

  // Timer
  startTimer(sp.timePerQ, () => {
    if (!sp.answered) handleSPAnswer(null, null);
  });
}

let timerInterval = null;
function startTimer(seconds, onExpire) {
  if (timerInterval) clearInterval(timerInterval);
  const circle = document.getElementById('timer-circle');
  const text = document.getElementById('timer-text');
  const circumference = 175.9;
  let left = seconds;

  function update() {
    const pct = left / seconds;
    circle.style.strokeDashoffset = circumference * (1 - pct);
    text.textContent = left;
    if (pct > 0.5) { circle.style.stroke = 'var(--accent)'; text.style.color = 'var(--accent)'; }
    else if (pct > 0.25) { circle.style.stroke = 'var(--yellow)'; text.style.color = 'var(--yellow)'; }
    else { circle.style.stroke = 'var(--red)'; text.style.color = 'var(--red)'; }
  }

  update();
  timerInterval = setInterval(() => {
    left--;
    update();
    if (left <= 0) {
      clearInterval(timerInterval);
      onExpire();
    }
  }, 1000);
}

function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

function handleSPAnswer(code, btn) {
  const sp = state.sp;
  if (sp.answered) return;
  sp.answered = true;
  stopTimer();
  document.onkeydown = null;

  const timeElapsed = sp.timePerQ - parseInt(document.getElementById('timer-text').textContent);
  const isCorrect = code === sp.currentCorrect;

  // Visual feedback on options
  document.querySelectorAll('.option-btn').forEach((b, i) => {
    b.disabled = true;
    const opt = sp.pool[sp.current].options[i];
    if (opt.code === sp.currentCorrect) {
      b.classList.add('correct', 'reveal-correct');
    } else if (b === btn && !isCorrect) {
      b.classList.add('wrong');
    }
  });

  // Score — speed tier determines bonus
  if (isCorrect) {
    const tier = getSpeedTier(timeElapsed, sp.timePerQ);
    const streakBonus = sp.streak * 150;
    const earned = 500 + tier.bonus + streakBonus;
    sp.score += earned;
    sp.streak++;
    sp.bestStreak = Math.max(sp.bestStreak, sp.streak);
    sp.correct++;
    showScorePopup(earned, tier, streakBonus);
  } else {
    sp.streak = 0;
    sp.wrong++;
  }

  sp.sessions.push({ code: sp.currentCorrect, correct: isCorrect, timeMs: timeElapsed * 1000 });

  // Show country fact then advance
  showFactCard(sp.currentCorrect, () => {
    sp.current++;
    loadQuestion();
  });
}

function showScorePopup(total, tier, streakBonus) {
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.style.borderColor = tier.color;
  el.innerHTML = \`
    <div class="pts" style="color:\${tier.color}">+\${total.toLocaleString()}</div>
    <div class="breakdown">
      <span class="speed-label" style="color:\${tier.color}">\${tier.label}</span>
      <span>Base 500 &nbsp;·&nbsp; Speed +\${tier.bonus}</span>
      \${streakBonus > 0 ? \`<span>Streak 🔥 +\${streakBonus}</span>\` : ''}
    </div>
  \`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

const FACT_DURATION = 5000; // ms the card stays visible
let factCardEl = null;
let factOverlayEl = null;

function showFactCard(countryCode, onDone) {
  // Clean up any existing card
  if (factCardEl)    { factCardEl.remove();    factCardEl    = null; }
  if (factOverlayEl) { factOverlayEl.remove(); factOverlayEl = null; }

  const country = ALL_COUNTRIES.find(c => c.code === countryCode);
  const fact    = COUNTRY_FACTS[countryCode];
  if (!country) { setTimeout(onDone, 400); return; }

  // Backdrop
  const overlay = document.createElement('div');
  overlay.className = 'fact-overlay';
  document.body.appendChild(overlay);
  factOverlayEl = overlay;

  // Card
  const card = document.createElement('div');
  card.className = 'fact-card';
  card.style.setProperty('--fact-duration', (FACT_DURATION / 1000) + 's');
  card.innerHTML = \`
    <div class="fact-card-top">
      <img class="fc-flag" src="\${flagUrl(countryCode)}" alt="\${country.name}">
      <div class="fc-body">
        <div class="fc-label">Did you know?</div>
        <div class="fc-country">\${country.name}</div>
      </div>
    </div>
    <div class="fc-divider"></div>
    <div class="fc-text">\${fact || country.name + ' is located in ' + country.continent + '.'}</div>
    <div class="fc-timer-bar"><div class="fc-timer-fill"></div></div>
  \`;
  document.body.appendChild(card);
  factCardEl = card;

  // Dismiss on click (for impatient players)
  overlay.addEventListener('click', () => dismissFactCard(onDone));
  card.addEventListener('click',    () => dismissFactCard(onDone));

  // Auto-dismiss after FACT_DURATION
  setTimeout(() => {
    if (factCardEl === card) dismissFactCard(onDone);
  }, FACT_DURATION);
}

function dismissFactCard(onDone) {
  const card    = factCardEl;
  const overlay = factOverlayEl;
  if (!card) return;

  factCardEl    = null;
  factOverlayEl = null;

  card.classList.add('slide-down');
  if (overlay) overlay.classList.add('fade-out');

  setTimeout(() => {
    card.remove();
    if (overlay) overlay.remove();
    if (onDone) onDone();
  }, 350);
}

function hideFactCard() {
  if (factCardEl)    { factCardEl.remove();    factCardEl    = null; }
  if (factOverlayEl) { factOverlayEl.remove(); factOverlayEl = null; }
}

// ─── localStorage stats helpers ──────────────────────────────────────────────
const LOCAL_STATS_KEY = () => \`fotw_stats:\${state.username}\`;

function getLocalStats() {
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveLocalStats(sessionPayload) {
  try {
    const existing = getLocalStats();
    const stats = existing || {
      totalGames: 0, totalScore: 0, bestScore: 0,
      totalCorrect: 0, totalAnswered: 0, history: [], flagStats: {},
    };

    stats.totalGames++;
    stats.totalScore += sessionPayload.score;
    stats.bestScore = Math.max(stats.bestScore, sessionPayload.score);
    stats.totalCorrect += sessionPayload.correct;
    stats.totalAnswered += sessionPayload.total;

    for (const item of sessionPayload.sessionData || []) {
      if (!stats.flagStats[item.code]) stats.flagStats[item.code] = { correct: 0, wrong: 0 };
      if (item.correct) stats.flagStats[item.code].correct++;
      else stats.flagStats[item.code].wrong++;
    }

    stats.history.unshift({
      score: sessionPayload.score,
      correct: sessionPayload.correct,
      total: sessionPayload.total,
      date: Date.now(),
      continent: sessionPayload.continent,
    });
    stats.history = stats.history.slice(0, 50);

    localStorage.setItem(LOCAL_STATS_KEY(), JSON.stringify(stats));
    return stats;
  } catch(e) {
    console.error('localStorage write failed:', e);
    return null;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

async function endSinglePlayer() {
  const sp = state.sp;
  stopTimer();
  document.onkeydown = null;

  const sessionPayload = {
    username: state.username,
    score: sp.score,
    correct: sp.correct,
    total: sp.pool.length,
    continent: sp.continent,
    timePerQuestion: sp.timePerQ,
    sessionData: sp.sessions,
  };

  // 1. Save locally first — always works, instant
  saveLocalStats(sessionPayload);

  // 2. Sync to server in the background — for leaderboard (don't block the UI)
  fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionPayload),
  }).then(res => {
    if (!res.ok) console.warn('Server sync failed with status:', res.status);
  }).catch(e => {
    console.warn('Server sync unavailable (offline or not deployed):', e.message);
  });

  // Show results
  const accuracy = Math.round((sp.correct / sp.pool.length) * 100);
  document.getElementById('results-score').textContent = sp.score.toLocaleString();
  document.getElementById('results-sub').textContent = \`pts · Rank: \${getRankLabel(accuracy)}\`;
  document.getElementById('results-badge').textContent = getRankEmoji(accuracy);
  document.getElementById('r-correct').textContent = sp.correct;
  document.getElementById('r-wrong').textContent = sp.wrong;
  document.getElementById('r-accuracy').textContent = accuracy + '%';
  document.getElementById('r-best-streak').textContent = sp.bestStreak;

  // Flag review
  const review = document.getElementById('flag-review');
  review.innerHTML = sp.sessions.map(s => {
    const country = ALL_COUNTRIES.find(c => c.code === s.code);
    return \`<div class="flag-review-item \${s.correct ? 'correct-flag' : 'wrong-flag'}">
      <img src="\${flagUrl(s.code)}" alt="\${country?.name}" loading="lazy">
      <div class="fr-name">\${country?.name || s.code}</div>
      <span class="fr-badge \${s.correct ? 'badge-correct' : 'badge-wrong'}">\${s.correct ? 'Correct' : 'Wrong'}</span>
    </div>\`;
  }).join('');

  showScreen('screen-results');
}

function getRankLabel(acc) {
  if (acc >= 95) return 'S';
  if (acc >= 85) return 'A';
  if (acc >= 70) return 'B';
  if (acc >= 55) return 'C';
  return 'D';
}
function getRankEmoji(acc) {
  if (acc >= 95) return '🏆';
  if (acc >= 85) return '🥇';
  if (acc >= 70) return '🥈';
  if (acc >= 55) return '🥉';
  return '📚';
}

function playAgain() { showScreen('screen-sp-setup'); }

// ═══════════════════════════════════════════════════════════════════
// MULTIPLAYER
// ═══════════════════════════════════════════════════════════════════
async function createRoom() {
  const diff = DIFFICULTY_PRESETS[diffState['mp'] || 'medium'];
  const settings = {
    totalQuestions: parseInt(pillState['mp-questions']),
    timePerQuestion: diff.timePerQ,
    continent: pillState['mp-continent'],
    difficulty: diffState['mp'] || 'medium',
  };
  const res = await fetch('/api/rooms', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
  const { roomCode } = await res.json();
  state.mp.roomCode = roomCode;
  state.mp.isHost = true;
  state.mp.settings = settings;
  connectRoom(roomCode, true);
}

async function joinRoom() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (code.length !== 6) { toast('Enter a valid 6-letter room code', 'error'); return; }
  state.mp.roomCode = code;
  state.mp.isHost = false;
  connectRoom(code, false);
}

function connectRoom(roomCode, isHost) {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(\`\${proto}://\${location.host}/ws/room/\${roomCode}?username=\${encodeURIComponent(state.username)}&playerId=\${state.playerId}\`);
  state.mp.ws = ws;

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'join',
      roomCode,
      settings: state.mp.settings,
    }));
    document.getElementById('lobby-code').textContent = roomCode;
    showScreen('screen-lobby');
    if (isHost) {
      document.getElementById('lobby-host-controls').classList.remove('hidden');
      document.getElementById('lobby-waiting-msg').classList.add('hidden');
    } else {
      document.getElementById('lobby-host-controls').classList.add('hidden');
      document.getElementById('lobby-waiting-msg').classList.remove('hidden');
    }
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    handleWSMessage(msg);
  };

  ws.onerror = () => toast('Connection error', 'error');
  ws.onclose = () => {
    if (state.mp.ws === ws) {
      toast('Disconnected from room');
    }
  };
}

let countdownShown = false;
function handleWSMessage(msg) {
  if (msg.type === 'state') {
    const gs = msg.state;
    if (!gs) return;
    updateLobby(gs);

    if (gs.status === 'countdown' && !countdownShown) {
      countdownShown = true;
      showCountdown(3, () => { countdownShown = false; });
    } else if (gs.status === 'question') {
      showMPQuestion(gs);
    } else if (gs.status === 'results') {
      showMPResults(gs);
    } else if (gs.status === 'finished') {
      showMPFinalResults(gs);
    }
  } else if (msg.type === 'answer_result') {
    handleMPAnswerResult(msg);
  }
}

function updateLobby(gs) {
  if (gs.status !== 'waiting' && gs.status !== 'countdown') return;
  const players = Object.values(gs.players);
  document.getElementById('lobby-count').textContent = \`(\${players.length})\`;
  document.getElementById('lobby-players').innerHTML = players.map(p => \`
    <div class="lobby-player">
      <div class="nav-avatar" style="width:32px;height:32px;background:linear-gradient(135deg,\${avatarColor(p.username)},#7c3aed);display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:0.8rem;font-weight:700;color:#000;">\${avatarInitial(p.username)}</div>
      <span style="font-weight:600;">\${p.username}</span>
      \${p.id === gs.hostId ? '<span style="font-size:0.75rem;color:var(--accent);margin-left:4px;">Host</span>' : ''}
      <span class="lp-ready"><span class="ready-dot \${p.isReady ? 'ready' : ''}"></span>\${p.isReady ? 'Ready' : 'Waiting'}</span>
    </div>
  \`).join('');
}

function copyRoomCode() {
  navigator.clipboard.writeText(state.mp.roomCode).then(() => toast('Room code copied!', 'success'));
}

function startMultiplayer() {
  if (!state.mp.ws) return;
  state.mp.ws.send(JSON.stringify({ type: 'start', settings: state.mp.settings }));
}

function showCountdown(from, cb) {
  const overlay = document.createElement('div');
  overlay.className = 'countdown-overlay';
  const num = document.createElement('div');
  num.className = 'countdown-num';
  overlay.appendChild(num);
  document.body.appendChild(overlay);

  let n = from;
  function tick() {
    num.textContent = n;
    num.style.animation = 'none';
    void num.offsetWidth;
    num.style.animation = 'countdownPop 1s ease';
    if (n <= 0) {
      setTimeout(() => { overlay.remove(); cb(); }, 800);
      return;
    }
    n--;
    setTimeout(tick, 1000);
  }
  tick();
}

let mpAnswered = false;
let mpCurrentState = null;

function showMPQuestion(gs) {
  hideFactCard(); // clear any lingering fact from previous round
  mpAnswered = false;
  mpCurrentState = gs;
  state.mp.localScore = gs.players[state.playerId]?.score || 0;
  state.currentMode = 'mp';

  // Update players bar
  const bar = document.getElementById('mp-players-bar');
  bar.classList.remove('hidden');
  bar.innerHTML = Object.values(gs.players).sort((a,b) => b.score - a.score).map(p => \`
    <div class="mp-player-chip \${p.answeredCurrent ? 'answered' : ''}" id="mpchip-\${p.id}">
      <div class="mp-avatar" style="background:linear-gradient(135deg,\${avatarColor(p.username)},#7c3aed);">\${avatarInitial(p.username)}</div>
      <span class="mp-name">\${p.username}</span>
      <span class="mp-score">\${p.score.toLocaleString()}</span>
    </div>
  \`).join('');

  document.getElementById('q-current').textContent = gs.currentQuestion;
  document.getElementById('q-total').textContent = gs.totalQuestions;
  document.getElementById('q-progress').style.width = ((gs.currentQuestion / gs.totalQuestions) * 100) + '%';
  document.getElementById('g-score').textContent = (gs.players[state.playerId]?.score || 0).toLocaleString();
  const myStreak = gs.players[state.playerId]?.streak || 0;
  document.getElementById('streak-count').textContent = myStreak;
  document.getElementById('streak-badge').style.display = myStreak >= 2 ? 'inline-flex' : 'none';

  const img = document.getElementById('flag-img');
  img.src = flagUrl(gs.currentFlag);
  img.className = 'flag-img reveal';

  const grid = document.getElementById('options-grid');
  const keys = ['A','B','C','D'];
  grid.innerHTML = gs.currentOptions.map((opt, i) =>
    \`<button class="option-btn" id="mp-opt-\${i}" onclick="handleMPAnswer('\${opt.code}', this)">
      \${opt.name}
      <span class="option-key">\${keys[i]}</span>
    </button>\`
  ).join('');

  document.onkeydown = (e) => {
    const map = {'a':0,'b':1,'c':2,'d':3,'1':0,'2':1,'3':2,'4':3};
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      const btn = document.getElementById(\`mp-opt-\${idx}\`);
      if (btn && !btn.disabled) handleMPAnswer(gs.currentOptions[idx].code, btn);
    }
  };

  const elapsed = (Date.now() - gs.questionStartTime) / 1000;
  const remaining = Math.max(0, gs.questionTimeLimit - elapsed);
  startTimer(Math.ceil(remaining), () => {});

  showScreen('screen-game');
}

function handleMPAnswer(code, btn) {
  if (mpAnswered || !state.mp.ws) return;
  mpAnswered = true;
  document.onkeydown = null;
  stopTimer();

  document.querySelectorAll('[id^="mp-opt-"]').forEach(b => b.disabled = true);
  if (btn) btn.style.opacity = '0.7';

  state.mp.ws.send(JSON.stringify({ type: 'answer', answer: code }));
}

function handleMPAnswerResult(msg) {
  if (msg.correct) {
    document.querySelectorAll('[id^="mp-opt-"]').forEach(b => {
      if (b.textContent.trim().startsWith(ALL_COUNTRIES.find(c => c.code === mpCurrentState?.currentCorrect)?.name || '')) {
        b.classList.add('correct', 'reveal-correct');
      }
    });
    showScorePopup(msg.points, msg.speedBonus || 0, msg.streakBonus || 0);
  } else {
    document.querySelectorAll('[id^="mp-opt-"]').forEach(b => {
      const correctName = ALL_COUNTRIES.find(c => c.code === msg.correctAnswer)?.name;
      if (b.textContent.trim().includes(correctName || '')) {
        b.classList.add('correct');
      }
    });
  }
}

function showMPResults(gs) {
  // Show country fact during the 3-second results window
  showFactCard(gs.currentCorrect, () => {});

  // Update the players bar
  const bar = document.getElementById('mp-players-bar');
  bar.innerHTML = Object.values(gs.players).sort((a,b) => b.score - a.score).map(p => \`
    <div class="mp-player-chip answered" id="mpchip-\${p.id}">
      <div class="mp-avatar" style="background:linear-gradient(135deg,\${avatarColor(p.username)},#7c3aed);">\${avatarInitial(p.username)}</div>
      <span class="mp-name">\${p.username}</span>
      <span class="mp-score">\${p.score.toLocaleString()}</span>
    </div>
  \`).join('');
}

function showMPFinalResults(gs) {
  stopTimer();
  document.onkeydown = null;
  if (state.mp.ws) { state.mp.ws.close(); state.mp.ws = null; }

  const players = Object.values(gs.players).sort((a,b) => b.score - a.score);

  // Podium
  const podium = document.getElementById('mp-podium');
  const [first, second, third] = [players[0], players[1], players[2]];
  podium.innerHTML = \`
    \${second ? \`<div class="podium-place podium-2nd">
      <div class="podium-avatar" style="width:52px;height:52px;background:linear-gradient(135deg,\${avatarColor(second.username)},#7c3aed);font-size:1.2rem;">\${avatarInitial(second.username)}</div>
      <div class="podium-bar"><span class="podium-rank">🥈</span><div class="podium-name">\${second.username}</div><div class="podium-score">\${second.score.toLocaleString()} pts</div></div>
    </div>\` : ''}
    \${first ? \`<div class="podium-place podium-1st">
      <div class="podium-avatar" style="width:64px;height:64px;background:linear-gradient(135deg,\${avatarColor(first.username)},#7c3aed);font-size:1.4rem;">\${avatarInitial(first.username)}</div>
      <div class="podium-bar"><span class="podium-rank">🏆</span><div class="podium-name">\${first.username}</div><div class="podium-score">\${first.score.toLocaleString()} pts</div></div>
    </div>\` : ''}
    \${third ? \`<div class="podium-place podium-3rd">
      <div class="podium-avatar" style="width:44px;height:44px;background:linear-gradient(135deg,\${avatarColor(third.username)},#7c3aed);font-size:1rem;">\${avatarInitial(third.username)}</div>
      <div class="podium-bar"><span class="podium-rank">🥉</span><div class="podium-name">\${third.username}</div><div class="podium-score">\${third.score.toLocaleString()} pts</div></div>
    </div>\` : ''}
  \`;

  // Full table
  document.getElementById('mp-final-tbody').innerHTML = players.map((p, i) => \`
    <tr class="\${p.id === state.playerId ? 'me' : ''}">
      <td class="lb-rank \${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}">\${i + 1}</td>
      <td><div class="lb-user">
        <div class="lb-avatar" style="background:linear-gradient(135deg,\${avatarColor(p.username)},#7c3aed);">\${avatarInitial(p.username)}</div>
        \${p.username}\${p.id === state.playerId ? ' <span style="font-size:0.75rem;color:var(--accent);">(you)</span>' : ''}
      </div></td>
      <td class="lb-score">\${p.score.toLocaleString()}</td>
    </tr>
  \`).join('');

  showScreen('screen-mp-results');
}

// ═══════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════

// Merge two stat objects — takes the one with more games as base,
// then folds in any flag-level data the other has that was missed.
function mergeStats(a, b) {
  if (!a && !b) return null;
  if (!a) return b;
  if (!b) return a;

  // Use the object with more recorded games as the base (more complete history)
  const [base, extra] = a.totalGames >= b.totalGames ? [a, b] : [b, a];

  // Deep-merge flagStats: add counts from the extra source for any flags
  // that the base doesn't already have a more complete record of
  const merged = JSON.parse(JSON.stringify(base)); // deep clone
  for (const [code, extraStat] of Object.entries(extra.flagStats || {})) {
    if (!merged.flagStats[code]) {
      merged.flagStats[code] = extraStat;
    } else {
      // Only add if extra has more attempts recorded for this flag
      const baseTotal = merged.flagStats[code].correct + merged.flagStats[code].wrong;
      const extraTotal = extraStat.correct + extraStat.wrong;
      if (extraTotal > baseTotal) {
        merged.flagStats[code] = extraStat;
      }
    }
  }
  return merged;
}

function renderStats(stats) {
  document.getElementById('no-stats-msg').classList.add('hidden');
  document.getElementById('weak-flags-section').classList.remove('hidden');

  const acc = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;
  const avgScore = stats.totalGames > 0 ? Math.round(stats.totalScore / stats.totalGames) : 0;

  document.getElementById('stats-overview').innerHTML = \`
    <div class="stat-card"><div class="sc-val">\${stats.totalGames}</div><div class="sc-lbl">Games Played</div></div>
    <div class="stat-card"><div class="sc-val">\${stats.bestScore.toLocaleString()}</div><div class="sc-lbl">Best Score</div></div>
    <div class="stat-card"><div class="sc-val">\${acc}%</div><div class="sc-lbl">Overall Accuracy</div></div>
    <div class="stat-card"><div class="sc-val">\${avgScore.toLocaleString()}</div><div class="sc-lbl">Avg Score</div></div>
    <div class="stat-card"><div class="sc-val">\${stats.totalCorrect}</div><div class="sc-lbl">Total Correct</div></div>
    <div class="stat-card"><div class="sc-val">\${stats.totalAnswered}</div><div class="sc-lbl">Total Answered</div></div>
  \`;

  const history = stats.history.slice(0, 20).reverse();
  const maxScore = Math.max(...history.map(h => h.score), 1);
  document.getElementById('score-chart').innerHTML = history.map(h => \`
    <div class="chart-bar-wrap">
      <div class="chart-bar" style="height:\${Math.max(4, (h.score / maxScore) * 100)}px;" title="\${h.score.toLocaleString()} pts"></div>
      <div class="chart-bar-lbl">\${formatDate(h.date)}</div>
    </div>
  \`).join('');

  document.getElementById('accuracy-chart').innerHTML = history.map(h => {
    const a = h.total > 0 ? Math.round((h.correct / h.total) * 100) : 0;
    const color = a >= 80 ? 'var(--green)' : a >= 60 ? 'var(--yellow)' : 'var(--red)';
    return \`<div class="chart-bar-wrap">
      <div class="chart-bar" style="height:\${Math.max(4, a)}px;background:\${color};" title="\${a}%"></div>
      <div class="chart-bar-lbl">\${a}%</div>
    </div>\`;
  }).join('');

  const flagStats = stats.flagStats || {};
  const worstFlags = Object.entries(flagStats)
    .map(([code, s]) => {
      const total = s.correct + s.wrong;
      const acc = total > 0 ? Math.round((s.correct / total) * 100) : 0;
      return { code, acc, total, ...s };
    })
    .filter(f => f.total >= 2)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 12);

  if (worstFlags.length > 0) {
    document.getElementById('worst-flags').innerHTML = worstFlags.map(f => {
      const country = ALL_COUNTRIES.find(c => c.code === f.code);
      const color = f.acc >= 80 ? 'var(--green)' : f.acc >= 50 ? 'var(--yellow)' : 'var(--red)';
      return \`<div class="worst-flag-item">
        <img src="\${flagUrl(f.code)}" alt="\${country?.name}" loading="lazy">
        <div class="wf-name">\${country?.name || f.code}</div>
        <div class="wf-accuracy" style="color:\${color}">\${f.acc}%</div>
        <div class="accuracy-bar"><div class="accuracy-fill" style="width:\${f.acc}%;background:\${color};"></div></div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">\${f.correct}/\${f.total} correct</div>
      </div>\`;
    }).join('');
  } else {
    document.getElementById('worst-flags').innerHTML = '<p class="text-dim text-sm">Play more games to see your weak spots!</p>';
  }
}

async function loadStats() {
  const localStats = getLocalStats();

  // Show local data immediately if we have it (no wait)
  if (localStats && localStats.totalGames > 0) {
    renderStats(localStats);
  }

  // Always fetch from server — it may have data from other devices/browsers
  // or games played before the localStorage fix was applied
  try {
    const res = await fetch(\`/api/stats/\${encodeURIComponent(state.username)}\`);
    if (res.ok) {
      const serverStats = await res.json();
      if (serverStats && serverStats.totalGames > 0) {
        // Merge: whichever has more games wins as base, then fold in flag data from the other
        const merged = mergeStats(localStats, serverStats);
        // Write merged result back to localStorage so future loads are complete
        try { localStorage.setItem(LOCAL_STATS_KEY(), JSON.stringify(merged)); } catch {}
        // Re-render with the merged (more complete) data
        renderStats(merged);
        return;
      }
    }
  } catch(e) {
    console.warn('Server stats fetch failed, using local cache only:', e.message);
  }

  // If server had nothing and local had nothing either
  if (!localStats || localStats.totalGames === 0) {
    showNoStats();
  }
}

function showNoStats() {
  document.getElementById('stats-overview').innerHTML = '';
  document.getElementById('score-chart').innerHTML = '';
  document.getElementById('accuracy-chart').innerHTML = '';
  document.getElementById('weak-flags-section').classList.add('hidden');
  document.getElementById('no-stats-msg').classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════════
async function loadLeaderboard(mode = 'singleplayer') {
  try {
    const res = await fetch(\`/api/leaderboard?mode=\${mode}\`);
    const data = await res.json();
    if (!data || data.length === 0) {
      document.getElementById('lb-table').classList.add('hidden');
      document.getElementById('lb-empty').classList.remove('hidden');
      return;
    }
    document.getElementById('lb-table').classList.remove('hidden');
    document.getElementById('lb-empty').classList.add('hidden');
    document.getElementById('lb-tbody').innerHTML = data.map((entry, i) => \`
      <tr class="\${entry.username === state.username ? 'me' : ''}">
        <td class="lb-rank \${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}">\${i + 1}</td>
        <td><div class="lb-user">
          <div class="lb-avatar" style="background:linear-gradient(135deg,\${avatarColor(entry.username)},#7c3aed);">\${avatarInitial(entry.username)}</div>
          \${entry.username}\${entry.username === state.username ? ' <span style="font-size:0.75rem;color:var(--accent);">(you)</span>' : ''}
        </div></td>
        <td class="lb-score">\${entry.score.toLocaleString()}</td>
        <td class="text-dim text-sm">\${formatDate(entry.date)}</td>
      </tr>
    \`).join('');
  } catch(e) {}
}
</script>
</body>
</html>`;
}
