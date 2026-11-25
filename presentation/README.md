# Rooted SG · Catalyst Challenge deck

A 9-minute, four-speaker pitch in the heymeco.xyz Glasshouse (light) design, app only (no RootStake).
Every animation is fired by the script line it belongs to, and timed to the words inside that line.

- `index.html`: the deck (1920×1080 stage, scales to any screen). Serve it, don't open it as a file:
  `python3 -m http.server` from the repo root, then open `/presentation/`.
- `index.html?presenter` (or press **P** in the deck): presenter view with the current and next line, the timer against the 9:00 plan, and a live preview. It stays in sync with the deck through BroadcastChannel (same browser).
- `script.html`: the printable script.
- `js/script.js`: **the single source**. It holds the lines, speakers, pilot figures (`PILOT`) and timing. Change a number here and the slide and script both update.

Keys: → / Space / clicker = next line, ← = back, F = full screen, P = presenter, C = caption, A = auto rehearsal on the 9:00 plan, V = read lines aloud, Home = start.

Fonts and GSAP are bundled locally, so the deck runs offline.
