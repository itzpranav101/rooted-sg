// ROOTED SG — "one module, one plant, a whole farm": a scroll-driven multi-scale line drawing.
// farm → plant → stem → cross-section → cells → current paths → fungal colony → signal → back to the farm.
// Black and white line art; green only for keywords. Illustrative drawing, not measured data.
(() => {
const cv = document.querySelector('canvas[data-tissue]'); if (!cv) return;
const g = cv.getContext('2d');
const TAU = Math.PI * 2, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const mk = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let W = 0, H = 0, D = 1, U = 1, C = {}, ps = 0, vis = false, last = performance.now(), buildT = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function colors() { const cs = getComputedStyle(document.documentElement); C.fg = cs.getPropertyValue('--text').trim() || '#111'; C.gr = cs.getPropertyValue('--green').trim() || '#0a5c32'; C.mono = cs.getPropertyValue('--mono').trim() || 'monospace'; }

/* ---------------- drawing helpers ---------------- */
function frame(c, d, u) { c.setTransform(d, 0, 0, d, 0, 0); c.translate(W / 2, H / 2); c.scale(u, u); c.lineCap = 'round'; c.lineJoin = 'round'; }
function bmp(fn) { const o = document.createElement('canvas'); o.width = Math.max(2, Math.round(W * D)); o.height = Math.max(2, Math.round(H * D)); const c = o.getContext('2d'); frame(c, D, U); c.strokeStyle = C.fg; c.fillStyle = C.fg; fn(c); return o; }
function txt(c, s, x, y, o = {}) { c.save(); c.globalAlpha *= o.a ?? 1; c.fillStyle = o.col || C.fg; c.font = `${o.w || 400} ${o.s || 2}px ${C.mono}`; c.textAlign = o.al || 'left'; c.textBaseline = 'middle'; c.fillText(s, x, y); c.restore(); }
function tag(c, s, x, y, tx, ty, a = 1, al) { c.save(); al = al || (tx >= x ? 'left' : 'right'); c.font = `400 1.9px ${C.mono}`; const tw = c.measureText(s).width, hx = Math.min(W / U / 2, 70) - 2.5, hy = H / U / 2 - 4; if (al === 'right') tx = Math.max(tx, -hx + tw + .8); else tx = Math.min(tx, hx - tw - .8); tx = clamp(tx, -hx, hx); ty = clamp(ty, -hy, hy); c.globalAlpha *= a; c.strokeStyle = C.fg; c.lineWidth = .14; c.beginPath(); c.moveTo(x, y); c.lineTo(tx, ty); c.stroke(); c.fillStyle = C.gr; c.beginPath(); c.arc(x, y, .55, 0, TAU); c.fill(); txt(c, s, tx + (tx >= x ? .8 : -.8), ty, { col: C.gr, s: 1.9, al: al || (tx >= x ? 'left' : 'right') }); c.restore(); }
function leaf(c, x, y, len, ang, w = .34) {
  c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * .25, -len * w, len * .7, -len * w * .8, len, 0); c.bezierCurveTo(len * .7, len * w * .8, len * .25, len * w, 0, 0); c.stroke();
  c.lineWidth *= .55; c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .96, 0); for (let k = 1; k < 7; k++) { const u = k / 7; c.moveTo(len * u * .95, 0); c.lineTo(len * (u + .13), -len * w * .6 * (1 - u * .55)); c.moveTo(len * u * .95, 0); c.lineTo(len * (u + .13), len * w * .6 * (1 - u * .55)); } c.stroke(); c.restore();
}
function hex(c, x, y, r, rot = 0, j = null) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = rot + k / 6 * TAU, rr = r * (j ? 1 + (j[k] - .5) * .16 : 1); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function zoomAbout(c, s, fx, fy) { c.translate(fx, fy); c.scale(s, s); c.translate(-fx, -fy); }

/* ---------------- world data ---------------- */
const VES = [[-6, -4], [9, -8], [3, 10]];            // xylem vessels in the cell view
const PHL = [[-23, 9, 5], [23, -3, 5]];              // phloem sieve tubes
const FARM_FP = { x: 0, y: 11.7 };                  // the plant that carries the module
const farm = { cols: 23, rows: 14 };
const fpos = (i, j) => { const t = j / (farm.rows - 1), k = .55 + .6 * t; return { x: (i - (farm.cols - 1) / 2) * 4.3 * k, y: -24 + t * 58, k }; };
let cells = [], hyph = [], spores = [], hyphMax = 1;
function buildCells() {
  const R = mk(11), r = 7.4, w = r * 1.5, h = Math.sqrt(3) * r; cells = [];
  for (let q = -9; q <= 9; q++) for (let s = -7; s <= 7; s++) {
    const x = q * w, y = s * h + (q & 1 ? h / 2 : 0); if (Math.abs(x) > 60 || Math.abs(y) > 60) continue;
    if (VES.some(v => Math.hypot(v[0] - x, v[1] - y) < 12.5) || PHL.some(v => Math.hypot(v[0] - x, v[1] - y) < 10)) continue;
    cells.push({ x: x + (R() - .5) * 1.4, y: y + (R() - .5) * 1.4, r: r * (.92 + R() * .1), j: Array.from({ length: 6 }, R), rot: (R() - .5) * .08, dmg: 1e9, nuc: [(R() - .5) * 2.2, (R() - .5) * 2.2] });
  }
}
function buildHyphae() {
  const R = mk(5); hyph = []; spores = []; const stack = [{ x: -4, y: 56, a: -Math.PI / 2, w: 1.15, life: 150, gen: 0, age: 0 }];
  let guard = 0; const ang = (a, b) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
  while (stack.length && guard++ < 9000 && hyph.length < 1700) {
    const t = stack.pop();
    while (t.life > 0 && hyph.length < 1700) {
      let near = null, nd = 1e9; VES.forEach(v => { const d = Math.hypot(v[0] - t.x, v[1] - t.y); if (d < nd) { nd = d; near = v; } });
      if (t.gen < 3 && near) t.a += clamp(ang(t.a, Math.atan2(near[1] - t.y, near[0] - t.x)), -.09, .09) * (t.gen ? .5 : 1);
      t.a += (R() - .5) * .27; const nx = t.x + Math.cos(t.a) * .85, ny = t.y + Math.sin(t.a) * .85; t.age += .85; t.life--;
      hyph.push({ x0: t.x, y0: t.y, x1: nx, y1: ny, w: t.w, age: t.age, sep: hyph.length % 4 === 0 });
      t.x = nx; t.y = ny;
      if (Math.abs(t.x) > 52 || t.y < -54 || t.y > 58) break;
      if (t.gen < 4 && R() < (t.gen ? .045 : .028)) stack.push({ x: t.x, y: t.y, a: t.a + (R() < .5 ? -1 : 1) * (.55 + R() * .6), w: t.w * .68, life: t.life * .55 + 10, gen: t.gen + 1, age: t.age });
    }
    if (t.gen > 0 && R() < .8) spores.push({ x: t.x, y: t.y, a: R() * TAU, age: t.age });
  }
  hyph.sort((a, b) => a.age - b.age); hyphMax = hyph[hyph.length - 1].age;
  cells.forEach(c => { for (const s of hyph) { if (Math.hypot(s.x1 - c.x, s.y1 - c.y) < c.r * .95) { c.dmg = Math.min(c.dmg, s.age); } } });
}

/* ---------------- build helpers: everything draws itself ---------------- */
const ease = x => 1 - Math.pow(1 - clamp(x), 3), sub = (b, a, z) => clamp((b - a) / (z - a));
function dpath(c, k, len, fn) { if (k <= 0) return; c.save(); if (k < 1) c.setLineDash([Math.max(.001, len * k), len * 4]); c.beginPath(); fn(c); c.stroke(); c.restore(); }
function poly(c, pts, k) { if (k <= 0 || pts.length < 2) return; const n = (pts.length - 1) * clamp(k), m = Math.floor(n); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= m; i++) c.lineTo(pts[i][0], pts[i][1]); if (m < pts.length - 1) { const f = n - m, A = pts[m], B = pts[m + 1]; c.lineTo(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f); } c.stroke(); }
function pop(c, x, y, k, fn) { if (k <= 0) return; c.save(); c.globalAlpha *= clamp(k * 1.6); c.translate(x, y); const s = .55 + .45 * ease(k); c.scale(s, s); c.translate(-x, -y); fn(c); c.restore(); }
const SEC = (() => { const R = mk(31), cortex = [], pith = []; [31.6, 28.5, 25.4, 22.3].forEach((rr, ri) => { const n = Math.round(TAU * rr / 3.9); for (let k = 0; k < n; k++) cortex.push({ ri, k, n, rr, a: (k + R() * .2) / n * TAU, rx: 1.45 + R() * .2, dot: R() < .3 }); }); for (let k = 0; k < 22; k++) { const a = R() * TAU, rr = Math.sqrt(R()) * 11.5; pith.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, r: 2.6 + R() * 1.6, dot: R() < .5, k }); } return { cortex, pith }; })();
const ROOTS = (() => { const R = mk(21), out = []; for (let k = 0; k < 9; k++) { let x = 16, y = 32, a = Math.PI / 2 + (k - 4) * .28; const pts = [[x, y]]; for (let n = 0; n < 14; n++) { a += (R() - .5) * .5; x += Math.cos(a) * 1.3; y += Math.sin(a) * 1.3; pts.push([x, y]); } out.push(pts); } return out; })();
const FARMR = (() => { const R = mk(3), o = []; for (let j = 0; j < farm.rows; j++) for (let i = 0; i < farm.cols; i++) o.push([R(), R(), R()]); return o; })();

function drawFarm(c, b) {
  const a = fpos(0, 0), bb = fpos(farm.cols - 1, 0), d = fpos(0, farm.rows - 1), e = fpos(farm.cols - 1, farm.rows - 1);
  // horizon: hills and tree line
  c.lineWidth = .16; c.globalAlpha = .45 * ease(sub(b, 0, .3)); dpath(c, ease(sub(b, 0, .35)), 150, c => { for (let x = -62; x <= 62; x += 2) c[x === -62 ? 'moveTo' : 'lineTo'](x, -33 - 2.4 * Math.sin(x * .09) - 1.4 * Math.sin(x * .23 + 1)); });
  c.lineWidth = .14; for (let i = 0; i < 26; i++) { const x = -60 + i * 4.7 + (i * 7 % 3), y = -33 - 2.4 * Math.sin(x * .09) - 1.4 * Math.sin(x * .23 + 1), r = 1 + (i % 3) * .4, k = ease(sub(b, .12 + i * .008, .4 + i * .008)); if (k > 0) { c.beginPath(); c.arc(x, y - r * k, r * k, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - r * k * .6); c.stroke(); } }
  c.globalAlpha = .4; c.lineWidth = .16; dpath(c, ease(sub(b, .04, .4)), 460, c => { c.moveTo(a.x - 4, a.y - 3); c.lineTo(bb.x + 4, bb.y - 3); c.lineTo(e.x + 5, e.y + 4); c.lineTo(d.x - 5, d.y + 4); c.closePath(); });
  for (let j = 0; j < farm.rows; j++) { const p0 = fpos(0, j), p1 = fpos(farm.cols - 1, j); c.globalAlpha = .14; dpath(c, ease(sub(b, .1 + (farm.rows - j) * .012, .5 + (farm.rows - j) * .012)), 120, c => { c.moveTo(p0.x - 3, p0.y + 1.2 * p0.k); c.lineTo(p1.x + 3, p1.y + 1.2 * p1.k); }); }
  // fence posts at the corners
  c.globalAlpha = .5; c.lineWidth = .22; [[a.x - 4, a.y - 3], [bb.x + 4, bb.y - 3], [d.x - 5, d.y + 4], [e.x + 5, e.y + 4]].forEach(([x, y], i) => { const k = ease(sub(b, .3 + i * .03, .5 + i * .03)); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 3 * k); c.stroke(); });
  // plants sprout in a wave: near rows first, rippling out from the middle
  c.lineCap = 'round';
  for (let j = 0; j < farm.rows; j++) for (let i = 0; i < farm.cols; i++) {
    if (i === 11 && j === 8) continue; const p = fpos(i, j), s = p.k, pp = clamp(b * 1.9 - ((farm.rows - 1 - j) / farm.rows) * .62 - Math.abs(i - 11) / farm.cols * .35 - .12), R = FARMR[j * farm.cols + i]; if (pp <= 0) continue;
    const g = ease(pp), lk = ease(pp * 1.5 - .45); c.globalAlpha = (.5 + .3 * (j / farm.rows)) * clamp(pp * 3); c.lineWidth = .17 * s;
    c.beginPath(); c.moveTo(p.x, p.y + 1 * s); c.lineTo(p.x, p.y + 1 * s - 1.2 * s * g); c.stroke();
    if (lk > 0) for (let k = 0; k < 3; k++) { const an = -Math.PI / 2 + (k - 1) * (.8 + R[k] * .3), L = lk * s; c.beginPath(); c.moveTo(p.x, p.y - .2 * s); c.quadraticCurveTo(p.x + Math.cos(an) * .9 * L, p.y - .2 * s + Math.sin(an) * .9 * L, p.x + Math.cos(an) * 1.5 * L, p.y - .2 * s + Math.sin(an) * 1.5 * L - .2 * s); c.stroke(); }
  }
  c.globalAlpha = 1;
}
let plantClip = { x: 17.8, y: 1 };
const PBEZ = (cx, cy) => [[cx + 4.2, cy], [cx + 12, cy - 8], [-2, -4], [-24, 20]];
function bez(P, u) { const m = 1 - u; return [m * m * m * P[0][0] + 3 * m * m * u * P[1][0] + 3 * m * u * u * P[2][0] + u * u * u * P[3][0], m * m * m * P[0][1] + 3 * m * m * u * P[1][1] + 3 * m * u * u * P[2][1] + u * u * u * P[3][1]]; }
function drawPlant(c, b, tt = 0) {
  const sx = t => 16 + 3 * Math.sin(t * 5), sy = t => 32 - t * 62;
  c.lineWidth = .3; dpath(c, ease(sub(b, 0, .14)), 100, c => { c.moveTo(-50, 32); c.lineTo(50, 32); });
  c.save(); c.globalAlpha = .45 * sub(b, .04, .2); c.lineWidth = .15; for (let x = -50; x < 50; x += 2.3) { c.beginPath(); c.moveTo(x, 32); c.lineTo(x - 1.4, 34.6 + ((x * 7) % 3) * .4); c.stroke(); } for (let x = -49; x < 50; x += 4.1) { c.beginPath(); c.arc(x, 38 + ((x * 3) % 4), .35, 0, TAU); c.stroke(); } c.restore();
  c.lineWidth = .22; ROOTS.forEach((pts, k) => poly(c, pts, ease(sub(b, .06 + k * .018, .46))));
  const tm = ease(sub(b, .14, .52)); c.lineWidth = .32;
  for (const o of [-1.5, 1.5]) { if (tm <= 0) break; c.beginPath(); for (let k = 0; k <= 40 * tm; k++) { const t = k / 40; c[k ? 'lineTo' : 'moveTo'](sx(t) + o * (1 - t * .45), sy(t)); } c.stroke(); }
  c.lineWidth = .28; [[.28, -.45, 20], [.4, Math.PI + .5, 19], [.55, -.4, 19], [.66, Math.PI + .45, 17], [.8, -.5, 15], [.9, Math.PI + .5, 12], [.99, -1.35, 10]].forEach(([t, a, l]) => { const lk = ease((tm - t) / .16 + (tm >= t ? 0 : -1)); if (lk <= 0) return; c.save(); c.globalAlpha *= lk; leaf(c, sx(t), sy(t), l * lk, a, .3); c.restore(); });
  // the house module builds itself, piece by piece
  const hb = sub(b, .48, .8); c.lineWidth = .34;
  dpath(c, ease(sub(hb, 0, .3)), 70, c => { c.moveTo(-41, 30); c.lineTo(-41, 15); c.lineTo(-24, 15); c.lineTo(-24, 30); c.closePath(); });
  dpath(c, ease(sub(hb, .25, .55)), 32, c => { c.moveTo(-43.5, 15); c.lineTo(-32.5, 6); c.lineTo(-21.5, 15); });
  c.lineWidth = .2; dpath(c, ease(sub(hb, .5, .75)), 40, c => { c.moveTo(-38.5, 12.6); c.lineTo(-32.5, 7.6); c.moveTo(-36, 13.8); c.lineTo(-30, 8.8); c.moveTo(-26.5, 12.6); c.lineTo(-32.5, 7.6); c.moveTo(-29, 13.8); c.lineTo(-35, 8.8); });
  dpath(c, ease(sub(hb, .6, .85)), 30, c => { c.rect(-37, 20, 9, 5); }); if (hb > .85) { c.beginPath(); c.arc(-26.5, 24, .6, 0, TAU); c.stroke(); }
  // soil probe drops into the soil, tube follows
  const pb = ease(sub(b, .6, .78)); if (pb > 0) { c.save(); c.globalAlpha *= clamp(pb * 3); c.translate(0, (1 - pb) * -22); c.lineWidth = .32; c.strokeRect(-9.8, 20, 3.6, 18); c.beginPath(); c.moveTo(-9.8, 38); c.lineTo(-8, 40.4); c.lineTo(-6.2, 38); c.stroke(); c.restore(); }
  c.lineWidth = .28; dpath(c, ease(sub(b, .74, .88)), 40, c => { c.moveTo(-24, 27); c.bezierCurveTo(-18, 27, -12, 14, -8, 19.5); });
  // clip clicks onto the stem, wire runs to the house
  const cy = sy(.5), cx = sx(.5); plantClip = { x: cx, y: cy }; const ck = ease(sub(b, .78, .9));
  if (ck > 0) { c.save(); c.globalAlpha *= clamp(ck * 2); c.translate(cx, cy); c.scale(.6 + .4 * ck, .6 + .4 * ck); c.translate(-cx, -cy); c.lineWidth = .35; c.strokeRect(cx - 4.2, cy - 1.4, 2.4, 2.8); c.strokeRect(cx + 1.8, cy - 1.4, 2.4, 2.8); c.lineWidth = .2; c.beginPath(); c.moveTo(cx - 1.8, cy - .4); c.lineTo(cx - .3, cy - .4); c.moveTo(cx + 1.8, cy + .4); c.lineTo(cx + .3, cy + .4); c.stroke(); c.restore(); }
  c.lineWidth = .24; dpath(c, ease(sub(b, .84, 1)), 70, c => { c.moveTo(cx + 4.2, cy); c.bezierCurveTo(cx + 12, cy - 8, -2, -4, -24, 20); });
}
function drawStemSide(c, b) {
  const R = mk(9); c.lineWidth = .4; for (const x of [-14, 14]) dpath(c, ease(sub(b, 0, .5)), 110, c => { c.moveTo(x, -52); c.lineTo(x, 52); });
  c.save(); c.lineWidth = .16; c.globalAlpha = .55; for (const x of [-12.2, 12.2]) dpath(c, ease(sub(b, .1, .6)), 110, c => { c.moveTo(x, -52); c.lineTo(x, 52); });
  for (let y = -50, i = 0; y < 50; y += 2.6, i++) for (const x of [-13.1, 13.1]) { if (ease(sub(b, .2 + (i / 40) * .3, .5 + (i / 40) * .3)) <= 0) continue; c.beginPath(); c.moveTo(x - .9, y + R() * .5); c.lineTo(x + .9, y + R() * .5); c.stroke(); }
  c.globalAlpha = .8; for (let k = 0; k < 7; k++) { const x = -7.5 + k * 2.5, kk = ease(sub(b, .3 + k * .06, .8 + k * .03)); c.lineWidth = .22; dpath(c, kk, 110, c => { for (let y = -52; y <= 52; y += 2) c[y === -52 ? 'moveTo' : 'lineTo'](x + Math.sin(y * .2 + k) * .25, y); }); c.lineWidth = .12; for (let y = -50; y < 50; y += 3.2) { if ((y + 52) / 104 > kk) break; c.beginPath(); c.moveTo(x - .5, y); c.lineTo(x + .5, y); c.stroke(); } }
  c.restore();
}
function drawSection(c, b) {
  c.lineWidth = .5; dpath(c, ease(sub(b, 0, .3)), 240, c => c.arc(0, 0, 36, -Math.PI / 2, -Math.PI / 2 + TAU)); c.lineWidth = .18; dpath(c, ease(sub(b, .05, .35)), 230, c => c.arc(0, 0, 33.8, -Math.PI / 2, -Math.PI / 2 + TAU));
  c.lineWidth = .14; const tk = ease(sub(b, .05, .4)); for (let k = 0; k < 96 * tk; k++) { const a = k / 96 * TAU - Math.PI / 2; c.beginPath(); c.moveTo(Math.cos(a) * 33.8, Math.sin(a) * 33.8); c.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); c.stroke(); }
  c.lineWidth = .17; SEC.cortex.forEach(ce => { const k = sub(b, .22 + ce.ri * .09 + (ce.k / ce.n) * .12, .34 + ce.ri * .09 + (ce.k / ce.n) * .12); if (k <= 0) return; const x = Math.cos(ce.a) * ce.rr, y = Math.sin(ce.a) * ce.rr; c.save(); c.globalAlpha = .6 * clamp(k * 2); c.translate(x, y); c.rotate(ce.a); const sc = .5 + .5 * ease(k); c.scale(sc, sc); c.beginPath(); c.ellipse(0, 0, ce.rx, (TAU * ce.rr / ce.n) * .46, 0, 0, TAU); c.stroke(); if (ce.dot) { c.beginPath(); c.arc(.2, 0, .32, 0, TAU); c.stroke(); } c.restore(); });
  for (let k = 0; k < 9; k++) { const kk = ease(sub(b, .55 + k * .035, .78 + k * .035)); if (kk <= 0) continue; const a = k / 9 * TAU + .2; c.save(); c.rotate(a); c.translate(17.5, 0); c.scale(kk, kk); c.globalAlpha *= clamp(kk * 2);
    c.lineWidth = .3; c.beginPath(); c.moveTo(-3.8, -3.2); c.bezierCurveTo(3, -5.4, 5.6, -2.4, 5.6, 0); c.bezierCurveTo(5.6, 2.4, 3, 5.4, -3.8, 3.2); c.bezierCurveTo(-4.8, 1.4, -4.8, -1.4, -3.8, -3.2); c.stroke();
    c.lineWidth = .22; [[-2.2, -1.5, 1.5], [-2.2, 1.5, 1.5], [-.2, 0, 1.9]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.lineWidth = .1; c.beginPath(); c.arc(x, y, r * .72, 0, TAU); c.stroke(); c.lineWidth = .22; });
    c.lineWidth = .16; for (let m = 0; m < 6; m++) { c.beginPath(); c.arc(3.2 + (m % 2) * .5, -2 + m * .8, .5, 0, TAU); c.stroke(); } c.setLineDash([.5, .5]); c.beginPath(); c.arc(0, 0, 4.2, -.9, .9); c.stroke(); c.setLineDash([]); c.restore(); }
  c.lineWidth = .2; SEC.pith.forEach(pc => { const k = sub(b, .74 + (pc.k / 22) * .16, .9 + (pc.k / 22) * .1); if (k <= 0) return; pop(c, pc.x, pc.y, k, c => { c.beginPath(); c.arc(pc.x, pc.y, pc.r, 0, TAU); c.stroke(); if (pc.dot) { c.beginPath(); c.arc(pc.x + .4, pc.y - .3, .5, 0, TAU); c.stroke(); } }); });
}
function drawCells(c, b) {
  const NT = [[-33, 0], [33, 0]], dist = (x, y) => Math.min(Math.hypot(x - NT[0][0], y - NT[0][1]), Math.hypot(x - NT[1][0], y - NT[1][1]));
  cells.forEach(ce => { const dl = clamp(dist(ce.x, ce.y) / 70) * .55, cp = clamp((b * 1.5 - dl) / .45); if (cp <= 0) return; const op = clamp((cp - .55) / .45); c.save(); c.translate(ce.x, ce.y); const sc = .5 + .5 * ease(cp); c.scale(sc, sc); c.translate(-ce.x, -ce.y);
    c.lineWidth = .3; c.globalAlpha = .55 * clamp(cp * 2); hex(c, ce.x, ce.y, ce.r, ce.rot, ce.j); c.stroke();
    c.lineWidth = .13; c.globalAlpha = .3 * clamp(cp * 2); hex(c, ce.x, ce.y, ce.r * .86, ce.rot, ce.j); c.stroke();
    if (op > 0) { c.globalAlpha = .22 * op; c.beginPath(); c.ellipse(ce.x - ce.nuc[0] * .5, ce.y - ce.nuc[1] * .5, ce.r * .5 * op, ce.r * .44 * op, ce.rot, 0, TAU); c.stroke();
      c.globalAlpha = .6 * op; c.lineWidth = .16; c.beginPath(); c.arc(ce.x + ce.nuc[0], ce.y + ce.nuc[1], 1.25 * op, 0, TAU); c.stroke(); c.beginPath(); c.arc(ce.x + ce.nuc[0] + .2, ce.y + ce.nuc[1], .35, 0, TAU); c.fill();
      c.globalAlpha = .38 * op; for (let k = 0; k < 5; k++) { const a = ce.rot + k / 5 * TAU + ce.j[k]; c.beginPath(); c.ellipse(ce.x + Math.cos(a) * ce.r * .66, ce.y + Math.sin(a) * ce.r * .66, .6, .32, a, 0, TAU); c.fill(); }
      c.globalAlpha = .7 * op; for (let k = 0; k < 6; k += 2) { const a = ce.rot + (k + .5) / 6 * TAU; c.beginPath(); c.arc(ce.x + Math.cos(a) * ce.r * .87, ce.y + Math.sin(a) * ce.r * .87, .2, 0, TAU); c.fill(); } }
    c.restore(); });
  c.globalAlpha = 1;
  VES.forEach(([x, y], vi) => { const k = ease(sub(b, .3 + vi * .08, .75 + vi * .08)); if (k <= 0) return; c.lineWidth = .62; dpath(c, k, 55, c => c.arc(x, y, 8.2, -Math.PI / 2, -Math.PI / 2 + TAU)); c.lineWidth = .2; dpath(c, ease(k * 1.2 - .1), 44, c => c.arc(x, y, 6.6, -Math.PI / 2, -Math.PI / 2 + TAU)); if (k > .6) { c.lineWidth = .14; const n = Math.floor(14 * sub(k, .6, 1)); for (let q = 0; q < n; q++) { const a = q / 14 * TAU + vi; c.beginPath(); c.moveTo(x + Math.cos(a) * 6.6, y + Math.sin(a) * 6.6); c.lineTo(x + Math.cos(a) * 8.2, y + Math.sin(a) * 8.2); c.stroke(); } c.save(); c.globalAlpha = .35 * sub(k, .7, 1); c.lineWidth = .12; for (let q = 0; q < 3; q++) { c.beginPath(); c.arc(x, y, 5.6 - q * 1.4, .6 * q, TAU - .6 * q); c.stroke(); } c.restore(); } });
  PHL.forEach(([x, y, r], pi) => { const k = ease(sub(b, .45 + pi * .1, .9)); if (k <= 0) return; c.lineWidth = .4; dpath(c, k, 34, c => c.arc(x, y, r, 0, TAU)); if (k > .5) { c.lineWidth = .12; for (let q = -2; q <= 2; q++) { c.beginPath(); c.moveTo(x - r + 1, y + q * 1.4); c.lineTo(x + r - 1, y + q * 1.4); c.stroke(); }
    [[r + 3.6, -3.2, 2.5], [r + 4.4, 2.4, 2.3], [-r - 3.6, 3, 2.5]].forEach(([dx, dy, rr], ci) => { const ck = sub(k, .5 + ci * .12, 1); pop(c, x + dx, y + dy, ck, c => { c.lineWidth = .3; c.beginPath(); c.arc(x + dx, y + dy, rr, 0, TAU); c.stroke(); c.lineWidth = .1; for (let m = 0; m < 9; m++) { c.beginPath(); c.arc(x + dx + Math.cos(m * 2.4) * rr * .5 * (m % 3 ? .9 : .4), y + dy + Math.sin(m * 2.4) * rr * .5 * (m % 3 ? .9 : .4), .22, 0, TAU); c.stroke(); } }); }); } });
}
const cacheF = {};
function layer(key, b, fn) { if (b >= .999) { if (!cacheF[key]) cacheF[key] = bmp(c => fn(c, 1)); blit(cacheF[key]); } else if (b > 0) fn(g, b, 0); }
function build() { colors(); buildCells(); if (!hyph.length) buildHyphae(); Object.keys(cacheF).forEach(k => delete cacheF[k]); }
function blit(o) { g.drawImage(o, -W / 2 / U, -H / 2 / U, W / U, H / U); }

/* ---------------- dynamic overlays ---------------- */
const T = (a, b) => sstep(a, b, ps);
function needle(c, x0, y0, x1, y1, w0 = .5) { c.beginPath(); const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * w0, ny = Math.cos(a) * w0; c.moveTo(x0 + nx, y0 + ny); c.lineTo(x1, y1); c.lineTo(x0 - nx, y0 - ny); c.closePath(); c.fillStyle = C.fg; c.fill(); }
function ring(c, x, y, t, r0, r1, a = 1) { c.save(); c.globalAlpha *= a * (1 - t); c.lineWidth = .18; c.setLineDash([.7, .7]); c.beginPath(); c.arc(x, y, lerp(r0, r1, t), 0, TAU); c.stroke(); c.restore(); }
function digits(c, v, x, y, size, col) { // rolling-drum numerals
  const s = v.toFixed(2); c.save(); c.font = `300 ${size}px ${C.mono}`; c.fillStyle = col; c.textBaseline = 'middle'; c.textAlign = 'center'; const cw = size * .62;
  [...s].forEach((ch, i) => { const cx = x + (i - (s.length - 1) / 2) * cw; if (ch === '.') { c.fillText('.', cx, y); return; } const d = +ch, spin = i * .5; c.save(); c.beginPath(); c.rect(cx - cw / 2, y - size * .62, cw, size * 1.24); c.clip(); c.fillText(String(d), cx, y); c.restore(); }); c.restore();
}
function roll(c, from, to, k, x, y, size, col) { // odometer between two values
  const a = from.toFixed(2), b = to.toFixed(2), cw = size * .62; c.save(); c.font = `300 ${size}px ${C.mono}`; c.fillStyle = col; c.textBaseline = 'middle'; c.textAlign = 'center';
  [...b].forEach((ch, i) => { const cx = x + (i - (b.length - 1) / 2) * cw; if (ch === '.') { c.fillText('.', cx, y); return; } const f = +a[i], t = +ch, e = clamp(k * 1.4 - (b.length - i) * .06), pos = lerp(f, f + ((t - f + 10) % 10) + (f === t ? 0 : 10), sstep(0, 1, e)); c.save(); c.beginPath(); c.rect(cx - cw / 2, y - size * .62, cw, size * 1.24); c.clip(); for (let n = Math.floor(pos) - 1; n <= Math.ceil(pos) + 1; n++) c.fillText(String(((n % 10) + 10) % 10), cx, y + (n - pos) * size * 1.15); c.restore(); }); c.restore();
}

function render(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const tt = reduced ? 0 : now / 1000;
  buildT = reduced ? 1 : Math.min(1, buildT + dt / 3.8); const target = parseFloat(cv.dataset.p || 0); ps += (target - ps) * Math.min(1, dt * 9); if (Math.abs(target - ps) < .0005) ps = target;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); frame(g, D, U); g.strokeStyle = C.fg; g.fillStyle = C.fg;
  const fx = FARM_FP.x, fy = FARM_FP.y;

  // ----- 1 · FARM -----
  const bF = Math.max(buildT, ps > .5 ? 1 : T(0, .06)), aF = Math.max(1 - T(.09, .17), T(.89, .96)), sF = ps > .5 ? lerp(2.4, 1, T(.89, .96)) : lerp(1, 4.6, T(.09, .17));
  if (aF > .01) { g.save(); g.globalAlpha = aF; zoomAbout(g, sF, fx, fy); layer('farm', bF, drawFarm);
    // the one plant with a module: it grows, then its house goes up
    { const gk = ease(sub(bF, .55, .8)), hk = ease(sub(bF, .78, .95)); g.lineWidth = .24; g.beginPath(); g.moveTo(fx, fy + 1.4); g.lineTo(fx, fy + 1.4 - 2.6 * gk); g.stroke();
      for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + (k - 2) * .62, L = ease(gk * 1.4 - .4); if (L > 0) { g.beginPath(); g.moveTo(fx, fy - .4); g.quadraticCurveTo(fx + Math.cos(an) * 1.6 * L, fy - .4 + Math.sin(an) * 1.6 * L, fx + Math.cos(an) * 2.5 * L, fy - .4 + Math.sin(an) * 2.5 * L); g.stroke(); } }
      if (hk > 0) { g.lineWidth = .3; dpath(g, hk, 12, c => { c.rect(fx - 4.2, fy - .2, 1.8, 1.5); }); dpath(g, ease(hk * 1.3 - .3), 6, c => { c.moveTo(fx - 4.7, fy - .2); c.lineTo(fx - 3.3, fy - 1.5); c.lineTo(fx - 1.9, fy - .2); }); } }
    const al = T(.9, .96); for (let k = 0; k < 3; k++) ring(g, fx, fy, ((tt * .5 + k / 3) % 1), 1.6, 8, 1);
    if (al > .01) { g.save(); g.globalAlpha *= al; g.strokeStyle = C.gr; g.lineWidth = .35; g.beginPath(); g.arc(fx, fy - .4, 5.2 + Math.sin(tt * 3) * .3, 0, TAU); g.stroke(); g.setLineDash([.9, .9]); g.beginPath(); g.arc(fx, fy - .4, 8.8, 0, TAU); g.stroke(); g.restore(); }
    g.restore(); }
  // farm captions (screen space, not zoomed)
  { const a1 = (1 - T(.05, .09)) * 1, a2 = T(.9, .95);
    tag(g, 'ONE MODULE · ONE PLANT', fx, fy - 4, 18, -31, a1 * aF, 'left'); tag(g, 'every other plant: no module', 21, 8, 30, 20, a1 * aF * .9, 'left');
    if (a2 > .01) { g.save(); g.globalAlpha = a2; const bx = -48, by = 29; g.lineWidth = .3; g.strokeStyle = C.fg; g.beginPath(); g.roundRect(bx, by, 52, 15, 1.6); g.stroke(); txt(g, 'ROOTED SG APP · NOW', bx + 2.2, by + 3.2, { s: 1.7, a: .65 }); txt(g, 'Stem reading changed on this plant', bx + 2.2, by + 7.5, { s: 2.1, w: 500 }); txt(g, 'Check this plant. Neighbours: no change seen.', bx + 2.2, by + 11.4, { s: 1.7, col: C.gr }); g.restore(); } }

  // ----- 2 · PLANT + HOUSE MODULE -----
  const bP = T(.1, .2), aP = T(.1, .17) * (1 - T(.2, .27));
  if (aP > .01) { g.save(); g.globalAlpha = aP; const s = ps < .18 ? lerp(.35, 1, T(.1, .17)) : lerp(1, 3.4, T(.2, .27)); zoomAbout(g, s, plantClip.x, plantClip.y); layer('plant', bP, drawPlant);
    if (bP > .995) { const P = PBEZ(plantClip.x, plantClip.y); g.fillStyle = C.gr; for (let n = 0; n < 4; n++) { const u = (tt * .35 + n / 4) % 1, q = bez(P, u); g.globalAlpha = aP * Math.sin(u * Math.PI); g.beginPath(); g.arc(q[0], q[1], .55, 0, TAU); g.fill(); } g.globalAlpha = aP; }
    g.restore(); g.save(); g.globalAlpha = aP; const s2 = ps < .18 ? lerp(.35, 1, T(.1, .17)) : lerp(1, 3.4, T(.2, .27)); const k = (x, y) => [(x - plantClip.x) * s2 + plantClip.x, (y - plantClip.y) * s2 + plantClip.y];
    const lab = (s, x, y, tx, ty, a) => { const p = k(x, y), q = k(tx, ty); tag(g, s, p[0], p[1], q[0], q[1], a * clamp(1 - T(.2, .24)), tx >= x ? 'left' : 'right'); };
    lab('HOUSE MODULE · ESP32-S3 · SOLAR', -32, 13, -46, -4, aP); lab('SOIL PROBE', -8, 30, -30, 43, aP); lab('STEM ELECTRODE', plantClip.x, plantClip.y, 38, -12, aP); lab('WIRE', -8, 20, -6, 8, aP * .8);
    g.restore(); }

  // ----- 3 · STEM (side) → CROSS-SECTION -----
  const aS = T(.2, .27) * (1 - T(.4, .46)), sS = ps < .3 ? lerp(.4, 1, T(.2, .27)) : lerp(1, 3.1, T(.4, .46));
  if (aS > .01) { const side = 1 - T(.3, .34), sect = T(.3, .34); g.save(); g.globalAlpha = aS; zoomAbout(g, sS, 0, 0);
    if (side > .01) { g.save(); g.globalAlpha *= side; layer('side', T(.205, .275), drawStemSide); const ins = T(.22, .29), tipL = lerp(-18, -5, ins), tipR = lerp(18, 5, ins);
      g.lineWidth = .4; g.strokeRect(-29, -7, 11, 14); g.strokeRect(18, -7, 11, 14); g.beginPath(); g.moveTo(-18, -4); g.lineTo(-18, 4); g.moveTo(18, -4); g.lineTo(18, 4); g.stroke();
      needle(g, -18, 0, tipL, 0, .5); needle(g, 18, 0, tipR, 0, .5);
      g.lineWidth = .3; g.beginPath(); g.moveTo(29, 0); g.bezierCurveTo(40, 0, 44, -16, 50, -30); g.moveTo(-29, 0); g.bezierCurveTo(-40, -6, -40, -20, -42, -34); g.stroke();
      tag(g, 'TITANIUM MICRO-NEEDLE', -17, -.3, -49, -17, side * (1 - T(.28, .31))); tag(g, 'OUTER SKIN', 14, 28, 24, 36, side * (1 - T(.28, .31)), 'left'); tag(g, 'CONDUCTING TISSUE', 2, 12, 20, 18, side * (1 - T(.28, .31)), 'left');
      g.restore(); }
    if (sect > .01) { g.save(); g.globalAlpha *= sect; layer('sect', T(.3, .39), drawSection); const ins = 1;
      needle(g, -62, 0, -17.6, 0, .55); needle(g, 62, 0, 17.6, 0, .55);
      g.save(); g.strokeStyle = C.gr; g.lineWidth = .22; g.setLineDash([.8, .9]); g.lineDashOffset = -tt * 6; g.beginPath(); g.moveTo(-17.6, 0); g.bezierCurveTo(-8, -9, 8, -9, 17.6, 0); g.stroke(); g.restore();
      const a = sect * (1 - T(.39, .42));
      tag(g, 'EPIDERMIS', 0, -35.5, 14, -46, a, 'left'); tag(g, 'CORTEX', 14, -24, 28, -34, a, 'left'); tag(g, 'VASCULAR BUNDLE', 12.2, 13.4, 28, 26, a, 'left'); tag(g, 'PITH', -4, 3, -24, 22, a, 'right'); tag(g, 'NEEDLE TIP IN THE XYLEM', -17.6, 0, -49, 40, a, 'right');
      g.restore(); }
    g.restore(); }

  // ----- 4 · CELLS -----
  const aC = T(.4, .47) * (1 - T(.79, .835));
  if (aC > .01) { g.save(); g.globalAlpha = aC; zoomAbout(g, lerp(.35, 1, T(.4, .47)), 0, 0); layer('cells', T(.4, .5), drawCells);
    // needles
    needle(g, -62, 0, -33, 0, .55); needle(g, 62, 0, 33, 0, .55);
    // current (step 6)
    const low = T(.5, .52) * (1 - T(.553, .56)), hi = T(.556, .565) * (1 - T(.6, .62)), cur = Math.max(low, hi);
    if (cur > .01) { g.save(); g.globalAlpha *= cur; g.fillStyle = C.gr; g.strokeStyle = C.fg;
      if (low > .01) { g.globalAlpha *= low / Math.max(cur, .01); [[-26, .5], [-15, .8], [15, .8], [26, .5]].forEach(([cy, al], pi) => { g.save(); g.globalAlpha *= al; g.lineWidth = .12; g.setLineDash([.6, .8]); g.beginPath(); g.moveTo(-33, 0); g.quadraticCurveTo(0, cy * 1.9, 33, 0); g.stroke(); g.restore(); for (let n = 0; n < 6; n++) { const u = ((tt * .26 + n / 6 + pi * .13) % 1), x = lerp(-33, 33, u), y = 2 * (1 - u) * u * cy * 1.9; g.globalAlpha = (Math.sin(u * Math.PI)) * .95; g.beginPath(); g.arc(x, y, .5, 0, TAU); g.fill(); } }); g.globalAlpha = 1; }
      if (hi > .01) { g.globalAlpha *= hi / Math.max(cur, .01); [-3, 0, 3].forEach((cy, pi) => { g.save(); g.lineWidth = .12; g.setLineDash([.6, .8]); g.globalAlpha *= .6; g.beginPath(); g.moveTo(-33, cy); g.lineTo(33, cy); g.stroke(); g.restore(); for (let n = 0; n < 10; n++) { const u = ((tt * .9 + n / 10 + pi * .21) % 1), x = lerp(-33, 33, u); g.beginPath(); g.arc(x, cy + Math.sin(x * 3 + tt * 12) * .25, .45, 0, TAU); g.fill(); } }); g.globalAlpha = 1;
        // membrane crossings flash where the line meets cell walls
        cells.forEach(ce => { if (Math.abs(ce.y) < ce.r && Math.abs(ce.x) < 34) { const u = (tt * .9) % 1, xx = lerp(-33, 33, u); if (Math.abs(xx - (ce.x - ce.r * .8)) < 1.2) { g.save(); g.strokeStyle = C.gr; g.lineWidth = .25; g.beginPath(); g.arc(ce.x - ce.r * .8, 0, 1.4, 0, TAU); g.stroke(); g.restore(); } } }); }
      g.restore();
      txt(g, low > hi ? '1 kHz' : '100 kHz', 0, -42, { s: 4.2, col: C.gr, al: 'center', w: 300 }); txt(g, low > hi ? 'around the cells' : 'through the cells', 0, -37.6, { s: 1.9, al: 'center', a: .8 }); }
    // cell part labels (step 5)
    const lab = (1 - T(.495, .52)) * T(.43, .47);
    if (lab > .01) { const c0 = cells.reduce((b, c) => (Math.hypot(c.x + 26, c.y + 26) < Math.hypot(b.x + 26, b.y + 26) ? c : b)); const c1 = cells.reduce((b, c) => (Math.hypot(c.x - 30, c.y - 24) < Math.hypot(b.x - 30, b.y - 24) ? c : b));
      tag(g, 'CELL WALL', c0.x - c0.r * .9, c0.y, c0.x - 40, c0.y - 14, lab, 'right'); tag(g, 'NUCLEUS', c0.x + c0.nuc[0], c0.y + c0.nuc[1], c0.x - 30, c0.y + 8, lab, 'right'); tag(g, 'VACUOLE', c1.x - c1.nuc[0] * .5, c1.y - c1.nuc[1] * .5 + 3, c1.x + 8, c1.y + 22, lab, 'left'); tag(g, 'CHLOROPLASTS', c1.x + c1.r * .6, c1.y - c1.r * .3, c1.x + 12, c1.y - 24, lab, 'left');
      tag(g, 'XYLEM VESSEL', VES[0][0] - 1, VES[0][1] - 8.2, -30, -40, lab, 'right'); tag(g, 'PHLOEM SIEVE TUBE', PHL[1][0], PHL[1][1] - 5, 28, -38, lab, 'left'); tag(g, 'COMPANION CELL', PHL[0][0] + 8.6, PHL[0][1] - 3.2, -10, 40, lab, 'left'); tag(g, 'NEEDLE TIP', -33, 0, -50, 8, lab, 'right'); }
    // fungus (steps 7-8)
    const grow = T(.6, .69), dmg = T(.69, .78), spo = T(.73, .8), maxA = grow * hyphMax;
    if (grow > .001) {
      // damaged cells: hatch + broken membrane
      cells.forEach(ce => { const k = clamp((maxA - ce.dmg) / 14) * dmg; if (k < .02) return; g.save(); g.globalAlpha = k * .55; g.lineWidth = .14; g.beginPath(); hex(g, ce.x, ce.y, ce.r * .84, ce.rot, ce.j); g.clip(); for (let h = -ce.r; h < ce.r; h += 1.15) { g.moveTo(ce.x - ce.r, ce.y + h); g.lineTo(ce.x + ce.r, ce.y + h - ce.r * .9); } g.stroke(); g.restore();
        g.save(); g.globalAlpha = k * .9; g.lineWidth = .3; g.strokeStyle = C.gr; g.setLineDash([.9, 1.1]); hex(g, ce.x, ce.y, ce.r * .8, ce.rot, ce.j); g.stroke(); g.restore(); });
      // clogged vessels
      VES.forEach(([x, y], vi) => { const k = dmg * clamp((maxA - 40 - vi * 8) / 30); if (k < .02) return; g.save(); g.globalAlpha = k * .7; const R = mk(vi + 40); for (let n = 0; n < 60; n++) { const a = R() * TAU, r = Math.sqrt(R()) * 6.2; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, .22 + R() * .3, 0, TAU); g.fill(); } g.restore(); });
      // hyphae
      g.save(); g.strokeStyle = C.fg; g.fillStyle = C.fg; let n = 0; while (n < hyph.length && hyph[n].age <= maxA) n++;
      for (let i = 0; i < n; i++) { const s = hyph[i]; g.lineWidth = s.w * .42; g.globalAlpha = 1; g.beginPath(); g.moveTo(s.x0, s.y0); g.lineTo(s.x1, s.y1); g.stroke(); if (s.sep) { const a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0) + Math.PI / 2, r = s.w * .5; g.lineWidth = .1; g.beginPath(); g.moveTo(s.x1 + Math.cos(a) * r, s.y1 + Math.sin(a) * r); g.lineTo(s.x1 - Math.cos(a) * r, s.y1 - Math.sin(a) * r); g.stroke(); } }
      // growing tips glow
      if (grow < .999) { const s = hyph[Math.max(0, n - 1)]; g.strokeStyle = C.gr; g.lineWidth = .25; g.beginPath(); g.arc(s.x1, s.y1, 1.4 + Math.sin(tt * 8) * .3, 0, TAU); g.stroke(); }
      if (spo > .01) { g.globalAlpha = spo; g.lineWidth = .18; spores.forEach(sp => { if (sp.age > maxA + 5) return; g.save(); g.translate(sp.x, sp.y); g.rotate(sp.a); g.beginPath(); g.ellipse(1.2, 0, 1.15, .6, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(3.2, .3, .9, .5, 0, 0, TAU); g.stroke(); g.restore(); }); }
      g.restore();
      const t1 = T(.6, .64) * (1 - T(.69, .72)), t2 = T(.72, .76) * (1 - T(.79, .82));
      tag(g, 'FUNGAL HYPHAE (septate)', hyph[Math.max(0, Math.min(n - 1, 300))].x1, hyph[Math.max(0, Math.min(n - 1, 300))].y1, -44, 46, t1, 'right'); tag(g, 'ENTERING THE XYLEM', VES[0][0], VES[0][1] + 3, 22, 40, t1, 'left');
      tag(g, 'MEMBRANES LEAK', cells.find(c => c.dmg < 60)?.x ?? 0, cells.find(c => c.dmg < 60)?.y ?? 0, -46, -34, t2, 'right'); tag(g, 'VESSEL CLOGGED', VES[0][0], VES[0][1], 24, -36, t2, 'left'); tag(g, 'SPORES FORM', spores[3]?.x ?? 0, spores[3]?.y ?? 0, 30, 38, t2, 'left'); }
    g.restore(); }

  // ----- 5 · THE SIGNAL (impedance spectrum) -----
  const aG = T(.82, .86) * (1 - T(.89, .93));
  if (aG > .01) { g.save(); g.globalAlpha = aG; const x0 = -36, x1 = 38, y0 = 30, y1 = -18, k = T(.82, .88), curve = (a, b, f) => b + (1 - b) * (1 / (1 + Math.pow(f / 12, 1.4)));
    g.lineWidth = .3; g.beginPath(); g.moveTo(x0, y1 - 3); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
    txt(g, 'IMPEDANCE |Z|', x0 - .5, y1 - 4.5, { s: 1.8, a: .7 }); txt(g, 'FREQUENCY  1 kHz → 100 kHz', x1, y0 + 4, { s: 1.8, a: .7, al: 'right' });
    [1, 10, 100].forEach((f, i) => { const x = lerp(x0, x1, Math.log10(f) / 2); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 1); g.stroke(); txt(g, f + ' kHz', x, y0 + 2.8, { s: 1.6, al: 'center', a: .6 }); });
    const path = (b, dash, w, kk) => { g.save(); g.lineWidth = w; if (dash) g.setLineDash([1.1, 1]); g.beginPath(); const N = 80, nn = Math.floor(N * kk); for (let i = 0; i <= nn; i++) { const f = Math.pow(10, i / N * 2), x = lerp(x0, x1, i / N), y = lerp(y0, y1, curve(0, b, f)); g[i ? 'lineTo' : 'moveTo'](x, y); } g.stroke(); g.restore(); };
    path(.35, true, .3, k); path(.62, false, .5, clamp(k * 1.2 - .1));
    const kk2 = clamp(k * 1.2 - .1); if (kk2 > .6) { txt(g, 'HEALTHY: big gap', x1, lerp(y0, y1, curve(0, .35, 100)) + 4.5, { s: 1.8, a: .8, al: 'right' }); txt(g, 'COLONISED: gap closes', x1, lerp(y0, y1, curve(0, .62, 100)) - 4.2, { s: 1.8, col: C.gr, w: 500, al: 'right' }); }
    // numerals
    g.save(); g.globalAlpha *= T(.84, .88); txt(g, 'HIGH ÷ LOW RATIO · ILLUSTRATIVE', 38, -42, { s: 1.7, a: .7, al: 'right' }); roll(g, .35, .62, T(.85, .89), 25, -35, 7.6, C.fg); txt(g, 'healthy .35 → colonised .62', 38, -28.6, { s: 1.7, col: C.gr, al: 'right' }); g.restore();
    g.restore(); }

  // HUD: ladder + scale + honesty note
  { g.save(); const lad = ['FARM', 'PLANT', 'STEM', 'TISSUE', 'CELLS', 'SIGNAL'], idx = ps < .1 ? 0 : ps < .2 ? 1 : ps < .3 ? 2 : ps < .4 ? 3 : ps < .8 ? 4 : ps < .9 ? 5 : 0; let x = -47; const hy = -46.8;
    lad.forEach((l, i) => { g.font = `400 1.7px ${C.mono}`; txt(g, l, x, hy, { s: 1.7, col: i === idx ? C.gr : C.fg, a: i === idx ? 1 : .35, w: i === idx ? 500 : 400 }); x += l.length * 1.18 + 2.6; });
    const sc = ps < .1 ? '≈ 10 m' : ps < .2 ? '≈ 10 cm' : ps < .3 ? '≈ 2 mm' : ps < .4 ? '≈ 1 mm' : ps < .8 ? '≈ 100 µm' : ps < .9 ? '' : '≈ 10 m'; if (sc) { g.lineWidth = .3; g.strokeStyle = C.fg; g.globalAlpha = .8; g.beginPath(); g.moveTo(-47, 46); g.lineTo(-47, 47.6); g.lineTo(-33, 47.6); g.lineTo(-33, 46); g.stroke(); txt(g, sc, -31.5, 47.2, { s: 1.7, a: .8 }); }
    txt(g, 'ILLUSTRATIVE · NOT MEASURED DATA', 47, 47.2, { s: 1.5, a: .45, al: 'right' }); g.restore(); }
}

/* ---------------- lifecycle ---------------- */
function fit() { const r = cv.getBoundingClientRect(); const w = Math.round(r.width), h = Math.round(r.height); if (!w || !h) return; D = Math.min(devicePixelRatio || 1, 1.75); W = w; H = h; U = Math.min(W, H) / 100; cv.width = Math.round(W * D); cv.height = Math.round(H * D); build(); }
new ResizeObserver(fit).observe(cv);
new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(cv);
addEventListener('themechange', () => { if (W) build(); });
function loop(now) { if (vis && W) render(now); requestAnimationFrame(loop); }
fit(); document.fonts && document.fonts.ready.then(() => { if (W) build(); });
requestAnimationFrame(loop);
window.__tissue = { setP: v => { cv.dataset.p = v; ps = v; } };
})();
