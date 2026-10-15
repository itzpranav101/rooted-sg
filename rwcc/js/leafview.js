// ROOTED SG for RWCC: "From a garden to a diagnosis". A scroll-driven line drawing:
// garden → one plant → one leaf → its cells → a fungus spreading through them → the yellow the camera sees → the phone → the Plant Doctor.
(() => {
const cv = document.querySelector('canvas[data-leaf]'); if (!cv) return;
const g = cv.getContext('2d');
const TAU = Math.PI * 2, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const mk = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let W = 0, H = 0, D = 1, U = 1, C = {}, ps = 0, vis = false, last = performance.now(), buildT = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const AMBER = '#D9A92E';
function colors() { const cs = getComputedStyle(document.documentElement); C.fg = cs.getPropertyValue('--text').trim() || '#111'; C.gr = cs.getPropertyValue('--green').trim() || '#0a5c32'; C.mono = cs.getPropertyValue('--mono').trim() || 'monospace'; }

/* ---------------- helpers ---------------- */
const ease = x => 1 - Math.pow(1 - clamp(x), 3), sub = (b, a, z) => clamp((b - a) / (z - a));
function frame(c, d, u) { c.setTransform(d, 0, 0, d, 0, 0); c.translate(W / 2, H / 2); c.scale(u, u); c.lineCap = 'round'; c.lineJoin = 'round'; }
function bmp(fn) { const o = document.createElement('canvas'); o.width = Math.max(2, Math.round(W * D)); o.height = Math.max(2, Math.round(H * D)); const c = o.getContext('2d'); frame(c, D, U); c.strokeStyle = C.fg; c.fillStyle = C.fg; fn(c); return o; }
function txt(c, s, x, y, o = {}) { c.save(); c.globalAlpha *= o.a ?? 1; c.fillStyle = o.col || C.fg; c.font = `${o.w || 400} ${o.s || 2}px ${C.mono}`; c.textAlign = o.al || 'left'; c.textBaseline = 'middle'; c.fillText(s, x, y); c.restore(); }
function tag(c, s, x, y, tx, ty, a = 1, al, col) { if (a <= .01) return; c.save(); al = al || (tx >= x ? 'left' : 'right'); c.font = `400 1.9px ${C.mono}`; const tw = c.measureText(s).width, hx = W / U / 2 - 2.5, hy = H / U / 2 - 4; if (al === 'right') tx = Math.max(tx, -hx + tw + .8); else tx = Math.min(tx, hx - tw - .8); tx = clamp(tx, -hx, hx); ty = clamp(ty, -hy, hy); c.globalAlpha *= a; c.strokeStyle = C.fg; c.lineWidth = .14; c.beginPath(); c.moveTo(x, y); c.lineTo(tx, ty); c.stroke(); c.fillStyle = col || C.gr; c.beginPath(); c.arc(x, y, .55, 0, TAU); c.fill(); txt(c, s, tx + (tx >= x ? .8 : -.8), ty, { col: col || C.gr, s: 1.9, al }); c.restore(); }
function leafPath(c, len, w) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(len * .25, -len * w, len * .7, -len * w * .8, len, 0); c.bezierCurveTo(len * .7, len * w * .8, len * .25, len * w, 0, 0); }
function leaf(c, x, y, len, ang, w = .34) {
  c.save(); c.translate(x, y); c.rotate(ang); leafPath(c, len, w); c.stroke();
  c.lineWidth *= .55; c.beginPath(); c.moveTo(0, 0); c.lineTo(len * .96, 0); for (let k = 1; k < 7; k++) { const u = k / 7; c.moveTo(len * u * .95, 0); c.lineTo(len * (u + .13), -len * w * .6 * (1 - u * .55)); c.moveTo(len * u * .95, 0); c.lineTo(len * (u + .13), len * w * .6 * (1 - u * .55)); } c.stroke(); c.restore();
}
function hex(c, x, y, r, rot = 0, j = null) { c.beginPath(); for (let k = 0; k < 6; k++) { const a = rot + k / 6 * TAU, rr = r * (j ? 1 + (j[k] - .5) * .16 : 1); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
function zoomAbout(c, s, fx, fy) { c.translate(fx, fy); c.scale(s, s); c.translate(-fx, -fy); }
function dpath(c, k, len, fn) { if (k <= 0) return; c.save(); if (k < 1) c.setLineDash([Math.max(.001, len * k), len * 4]); c.beginPath(); fn(c); c.stroke(); c.restore(); }
function pop(c, x, y, k, fn) { if (k <= 0) return; c.save(); c.globalAlpha *= clamp(k * 1.6); c.translate(x, y); const s = .55 + .45 * ease(k); c.scale(s, s); c.translate(-x, -y); fn(c); c.restore(); }
function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }

/* ---------------- world data ---------------- */
const VES = [[-6, -4], [9, -8], [3, 10]];             // leaf veins, in the cell view
const FARM_FP = { x: 0, y: 11.7 };
const farm = { cols: 23, rows: 14 };
const fpos = (i, j) => { const t = j / (farm.rows - 1), k = .55 + .6 * t; return { x: (i - (farm.cols - 1) / 2) * 4.3 * k, y: -24 + t * 58, k }; };
let cells = [], hyph = [], spores = [], hyphMax = 1, pits = [];
function buildCells() {
  const R = mk(11), r = 7.4, w = r * 1.5, h = Math.sqrt(3) * r; cells = [];
  for (let q = -9; q <= 9; q++) for (let s = -7; s <= 7; s++) {
    const x = q * w, y = s * h + (q & 1 ? h / 2 : 0); if (Math.abs(x) > 60 || Math.abs(y) > 60) continue;
    if (VES.some(v => Math.hypot(v[0] - x, v[1] - y) < 12.5)) continue;
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
  cells.forEach(c => { for (const s of hyph) { if (Math.hypot(s.x1 - c.x, s.y1 - c.y) < c.r * .95) c.dmg = Math.min(c.dmg, s.age); } });
  pits = []; hyph.forEach(sg => VES.forEach(v => { const d0 = Math.hypot(sg.x0 - v[0], sg.y0 - v[1]), d1 = Math.hypot(sg.x1 - v[0], sg.y1 - v[1]); if ((d0 - 8.2) * (d1 - 8.2) < 0) pits.push({ x: (sg.x0 + sg.x1) / 2, y: (sg.y0 + sg.y1) / 2, age: sg.age }); }));
}
const FARMR = (() => { const R = mk(3), o = []; for (let j = 0; j < farm.rows; j++) for (let i = 0; i < farm.cols; i++) o.push([R(), R(), R()]); return o; })();

/* ---------------- the leaf ---------------- */
const LV = { x: -46, y: 26, len: 100, ang: -.5 }, LP = { x: 0, y: 4, len: 50, ang: -Math.PI / 2 };
const lgeo = k => ({ x: lerp(LV.x, LP.x, k), y: lerp(LV.y, LP.y, k), len: lerp(LV.len, LP.len, k), ang: lerp(LV.ang, LP.ang, k) });
const lpt = (G, u, v) => { const ca = Math.cos(G.ang), sa = Math.sin(G.ang), lx = u * G.len, ly = v * G.len * .34 * .55; return [G.x + lx * ca - ly * sa, G.y + lx * sa + ly * ca]; };
const PAT = [[.6, .3, 3.6], [.42, -.34, 3], [.76, -.22, 3.2], [.28, .3, 2.4], [.55, -.04, 2.8], [.88, .12, 2]];

/* ---------------- farm ---------------- */
function drawFarm(c, b) {
  const a = fpos(0, 0), bb = fpos(farm.cols - 1, 0), d = fpos(0, farm.rows - 1), e = fpos(farm.cols - 1, farm.rows - 1);
  c.lineWidth = .16; c.globalAlpha = .45 * ease(sub(b, 0, .3)); dpath(c, ease(sub(b, 0, .35)), 150, c => { for (let x = -62; x <= 62; x += 2) c[x === -62 ? 'moveTo' : 'lineTo'](x, -33 - 2.4 * Math.sin(x * .09) - 1.4 * Math.sin(x * .23 + 1)); });
  c.lineWidth = .14; for (let i = 0; i < 26; i++) { const x = -60 + i * 4.7 + (i * 7 % 3), y = -33 - 2.4 * Math.sin(x * .09) - 1.4 * Math.sin(x * .23 + 1), r = 1 + (i % 3) * .4, k = ease(sub(b, .12 + i * .008, .4 + i * .008)); if (k > 0) { c.beginPath(); c.arc(x, y - r * k, r * k, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - r * k * .6); c.stroke(); } }
  c.globalAlpha = .4; c.lineWidth = .16; dpath(c, ease(sub(b, .04, .4)), 460, c => { c.moveTo(a.x - 4, a.y - 3); c.lineTo(bb.x + 4, bb.y - 3); c.lineTo(e.x + 5, e.y + 4); c.lineTo(d.x - 5, d.y + 4); c.closePath(); });
  for (let j = 0; j < farm.rows; j++) { const p0 = fpos(0, j), p1 = fpos(farm.cols - 1, j); c.globalAlpha = .14; dpath(c, ease(sub(b, .1 + (farm.rows - j) * .012, .5 + (farm.rows - j) * .012)), 120, c => { c.moveTo(p0.x - 3, p0.y + 1.2 * p0.k); c.lineTo(p1.x + 3, p1.y + 1.2 * p1.k); }); }
  c.lineCap = 'round';
  for (let j = 0; j < farm.rows; j++) for (let i = 0; i < farm.cols; i++) {
    if (i === 11 && j === 8) continue; const p = fpos(i, j), s = p.k, pp = clamp(b * 1.9 - ((farm.rows - 1 - j) / farm.rows) * .62 - Math.abs(i - 11) / farm.cols * .35 - .12), R = FARMR[j * farm.cols + i]; if (pp <= 0) continue;
    const gg = ease(pp), lk = ease(pp * 1.5 - .45); c.globalAlpha = (.5 + .3 * (j / farm.rows)) * clamp(pp * 3); c.lineWidth = .17 * s;
    c.beginPath(); c.moveTo(p.x, p.y + 1 * s); c.lineTo(p.x, p.y + 1 * s - 1.2 * s * gg); c.stroke();
    if (lk > 0) for (let k = 0; k < 3; k++) { const an = -Math.PI / 2 + (k - 1) * (.8 + R[k] * .3), L = lk * s; c.beginPath(); c.moveTo(p.x, p.y - .2 * s); c.quadraticCurveTo(p.x + Math.cos(an) * .9 * L, p.y - .2 * s + Math.sin(an) * .9 * L, p.x + Math.cos(an) * 1.5 * L, p.y - .2 * s + Math.sin(an) * 1.5 * L - .2 * s); c.stroke(); }
  }
  c.globalAlpha = 1;
}
function drawCells(c, b) {
  cells.forEach(ce => { const dl = clamp(Math.hypot(ce.x, ce.y) / 70) * .55, cp = clamp((b * 1.5 - dl) / .45); if (cp <= 0) return; const op = clamp((cp - .55) / .45); c.save(); c.translate(ce.x, ce.y); const sc = .5 + .5 * ease(cp); c.scale(sc, sc); c.translate(-ce.x, -ce.y);
    c.lineWidth = .3; c.globalAlpha = .55 * clamp(cp * 2); hex(c, ce.x, ce.y, ce.r, ce.rot, ce.j); c.stroke();
    c.lineWidth = .13; c.globalAlpha = .3 * clamp(cp * 2); hex(c, ce.x, ce.y, ce.r * .86, ce.rot, ce.j); c.stroke();
    if (op > 0) { c.globalAlpha = .22 * op; c.beginPath(); c.ellipse(ce.x - ce.nuc[0] * .5, ce.y - ce.nuc[1] * .5, ce.r * .5 * op, ce.r * .44 * op, ce.rot, 0, TAU); c.stroke();
      c.globalAlpha = .6 * op; c.lineWidth = .16; c.beginPath(); c.arc(ce.x + ce.nuc[0], ce.y + ce.nuc[1], 1.25 * op, 0, TAU); c.stroke(); c.beginPath(); c.arc(ce.x + ce.nuc[0] + .2, ce.y + ce.nuc[1], .35, 0, TAU); c.fill(); }
    c.restore(); });
  c.globalAlpha = 1;
  VES.forEach(([x, y], vi) => { const k = ease(sub(b, .3 + vi * .08, .75 + vi * .08)); if (k <= 0) return; c.lineWidth = .62; dpath(c, k, 55, c => c.arc(x, y, 8.2, -Math.PI / 2, -Math.PI / 2 + TAU)); c.lineWidth = .2; dpath(c, ease(k * 1.2 - .1), 44, c => c.arc(x, y, 6.6, -Math.PI / 2, -Math.PI / 2 + TAU));
    if (k > .6) { c.lineWidth = .14; const n = Math.floor(14 * sub(k, .6, 1)); for (let q = 0; q < n; q++) { const a = q / 14 * TAU + vi; c.beginPath(); c.moveTo(x + Math.cos(a) * 6.6, y + Math.sin(a) * 6.6); c.lineTo(x + Math.cos(a) * 8.2, y + Math.sin(a) * 8.2); c.stroke(); } } });
}
const cacheF = {};
function blit(o) { g.drawImage(o, -W / 2 / U, -H / 2 / U, W / U, H / U); }
function layer(key, b, fn) { if (b >= .999) { if (!cacheF[key]) cacheF[key] = bmp(c => fn(c, 1)); blit(cacheF[key]); } else if (b > 0) fn(g, b); }
function build() { colors(); buildCells(); buildHyphae(); Object.keys(cacheF).forEach(k => delete cacheF[k]); }

/* ---------------- render ---------------- */
const T = (a, b) => sstep(a, b, ps);
function render(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const tt = reduced ? 0 : now / 1000;
  buildT = reduced ? 1 : Math.min(1, buildT + dt / 3.4); const target = parseFloat(cv.dataset.p || 0); ps += (target - ps) * Math.min(1, dt * 9); if (Math.abs(target - ps) < .0005) ps = target;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); frame(g, D, U); g.strokeStyle = C.fg; g.fillStyle = C.fg;
  const fx = FARM_FP.x, fy = FARM_FP.y;

  // ----- 1 · THE GARDEN -----
  const bF = Math.max(buildT, ps > .3 ? 1 : T(0, .06)), aF = 1 - T(.08, .15), sF = lerp(1, 4.6, T(.08, .15));
  if (aF > .01) { g.save(); g.globalAlpha = aF; zoomAbout(g, sF, fx, fy); layer('farm', bF, drawFarm);
    { const gk = ease(sub(bF, .55, .8)); g.lineWidth = .24; g.beginPath(); g.moveTo(fx, fy + 1.4); g.lineTo(fx, fy + 1.4 - 2.6 * gk); g.stroke();
      for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + (k - 2) * .62, L = ease(gk * 1.4 - .4); if (L > 0) { g.beginPath(); g.moveTo(fx, fy - .4); g.quadraticCurveTo(fx + Math.cos(an) * 1.6 * L, fy - .4 + Math.sin(an) * 1.6 * L, fx + Math.cos(an) * 2.5 * L, fy - .4 + Math.sin(an) * 2.5 * L); g.stroke(); } } }
    for (let k = 0; k < 3; k++) { const t = ((tt * .5 + k / 3) % 1); g.save(); g.globalAlpha *= (1 - t); g.strokeStyle = C.gr; g.lineWidth = .18; g.setLineDash([.7, .7]); g.beginPath(); g.arc(fx, fy - .4, lerp(1.6, 8, t), 0, TAU); g.stroke(); g.restore(); }
    g.save(); g.strokeStyle = C.gr; g.lineWidth = .35; g.beginPath(); g.arc(fx, fy - .4, 4.6, 0, TAU); g.stroke(); g.restore();
    g.restore(); }
  { const a1 = (1 - T(.05, .09)) * aF; tag(g, 'ONE PLANT · ONE PHONE', fx, fy - 4, 18, -31, a1, 'left'); tag(g, 'every plant has someone looking after it', 21, 8, 30, 20, a1 * .9, 'left'); }

  // ----- 2 · THE LEAF (also returns, rotated, inside the phone) -----
  const ph = T(.7, .8), leafA = Math.max(T(.12, .17) * (1 - T(.3, .36)), T(.69, .74));
  if (leafA > .01) { const G = lgeo(ph), bl = ease(sub(ps, .12, .21)), keepB = ps > .5 ? 1 : bl;
    g.save(); g.globalAlpha = leafA;
    if (ps < .5) zoomAbout(g, lerp(1, 7.2, T(.24, .32)), ...lpt(lgeo(0), .5, -.04));
    const zs = ps < .5 ? lerp(1, 7.2, T(.24, .32)) : 1; g.lineWidth = .4 / Math.pow(zs, .75); g.save(); g.translate(G.x, G.y); g.rotate(G.ang); leafPath(g, G.len * keepB, .34); g.globalAlpha *= .1; g.fillStyle = C.gr; g.fill(); g.restore();
    leaf(g, G.x, G.y, G.len * keepB, G.ang, .34); g.beginPath(); g.moveTo(G.x, G.y); g.lineTo(G.x - Math.cos(G.ang) * 12 * keepB * (1 - ph), G.y - Math.sin(G.ang) * 12 * keepB * (1 - ph)); g.stroke();
    // yellow patches the camera can see
    const pg = T(.62, .78);
    if (pg > 0) { PAT.forEach(([u, v, r], i) => { const k = ease(clamp(pg * 1.6 - i * .12)); if (k <= 0) return; const [x, y] = lpt(G, u, v), rr = r * (G.len / 100) * k; g.save(); g.globalAlpha *= .85; g.fillStyle = AMBER; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.globalAlpha = .55; g.strokeStyle = C.fg; g.lineWidth = .16; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.stroke(); g.setLineDash([.5, .6]); g.beginPath(); g.arc(x, y, rr * 1.5, 0, TAU); g.stroke(); g.setLineDash([]); g.fillStyle = C.fg; g.globalAlpha = .6; for (let m = 0; m < 3; m++) { g.beginPath(); g.arc(x + Math.cos(i + m * 2.1) * rr * .45, y + Math.sin(i + m * 2.1) * rr * .45, .22, 0, TAU); g.fill(); } g.restore(); }); }
    g.restore();
    const lab = leafA * (1 - T(.2, .24)) * T(.14, .18); const Gv = lgeo(0); const tip = lpt(Gv, 1, 0), mid = lpt(Gv, .5, .2);
    tag(g, 'ONE LEAF', tip[0] - 4, tip[1] + 2, 24, -38, lab, 'left'); tag(g, 'THE LEAF LOOKS FINE', mid[0], mid[1], -40, -26, lab * .9, 'right');
  }

  // ----- 3 · THE CELLS -----
  const aC = T(.28, .35) * (1 - T(.68, .74));
  if (aC > .01) { g.save(); g.globalAlpha = aC; zoomAbout(g, lerp(.35, 1, T(.28, .35)), 0, 0); layer('cells', T(.3, .4), drawCells);
    const grow = T(.45, .58), dmg = T(.52, .66), spo = T(.56, .68), maxA = grow * hyphMax;
    // chloroplasts: the green that feeds the plant. They fade where the fungus has been.
    const ch = T(.34, .4);
    if (ch > .01) cells.forEach(ce => { const k = clamp((maxA - ce.dmg) / 14) * dmg, op = ch * .8; for (let m = 0; m < 5; m++) { const a = ce.rot + m / 5 * TAU + ce.j[m]; g.save(); g.globalAlpha = op * (1 - k * .85); g.fillStyle = k > .45 ? AMBER : C.gr; g.beginPath(); g.ellipse(ce.x + Math.cos(a) * ce.r * .66, ce.y + Math.sin(a) * ce.r * .66, .7, .4, a, 0, TAU); g.fill(); g.restore(); } });
    // labels on healthy tissue
    const lab = T(.36, .4) * (1 - T(.44, .47));
    if (lab > .01) { const c0 = cells.reduce((b, c) => (Math.hypot(c.x + 26, c.y + 26) < Math.hypot(b.x + 26, b.y + 26) ? c : b)); const c1 = cells.reduce((b, c) => (Math.hypot(c.x - 30, c.y - 24) < Math.hypot(b.x - 30, b.y - 24) ? c : b));
      tag(g, 'CELL WALL', c0.x - c0.r * .9, c0.y, c0.x - 40, c0.y - 14, lab, 'right'); tag(g, 'NUCLEUS', c0.x + c0.nuc[0], c0.y + c0.nuc[1], c0.x - 30, c0.y + 8, lab, 'right');
      tag(g, 'CHLOROPLASTS (THE GREEN)', c1.x + c1.r * .6, c1.y - c1.r * .3, c1.x + 12, c1.y - 24, lab, 'left'); tag(g, 'LEAF VEIN', VES[0][0] - 1, VES[0][1] - 8.2, -30, -40, lab, 'right'); }
    if (grow > .001) {
      cells.forEach(ce => { const k = clamp((maxA - ce.dmg) / 14) * dmg; if (k < .02) return; g.save(); g.globalAlpha = k * .55; g.lineWidth = .14; g.beginPath(); hex(g, ce.x, ce.y, ce.r * .84, ce.rot, ce.j); g.clip(); for (let h = -ce.r; h < ce.r; h += 1.15) { g.moveTo(ce.x - ce.r, ce.y + h); g.lineTo(ce.x + ce.r, ce.y + h - ce.r * .9); } g.stroke(); g.restore();
        g.save(); g.globalAlpha = k * .9; g.lineWidth = .3; g.strokeStyle = AMBER; g.setLineDash([.9, 1.1]); hex(g, ce.x, ce.y, ce.r * .8, ce.rot, ce.j); g.stroke(); g.restore(); });
      VES.forEach(([x, y], vi) => { const k = dmg * clamp((maxA - 40 - vi * 8) / 30); if (k < .02) return; g.save(); g.globalAlpha = k * .7; const R = mk(vi + 40); for (let n = 0; n < 60; n++) { const a = R() * TAU, r = Math.sqrt(R()) * 6.2; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, .22 + R() * .3, 0, TAU); g.fill(); } g.restore(); });
      g.save(); g.strokeStyle = C.fg; g.fillStyle = C.fg; let n = 0; while (n < hyph.length && hyph[n].age <= maxA) n++;
      for (let i = 0; i < n; i++) { const s = hyph[i]; g.lineWidth = s.w * .42; g.beginPath(); g.moveTo(s.x0, s.y0); g.lineTo(s.x1, s.y1); g.stroke(); if (s.sep) { const a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0) + Math.PI / 2, r = s.w * .5; g.lineWidth = .1; g.beginPath(); g.moveTo(s.x1 + Math.cos(a) * r, s.y1 + Math.sin(a) * r); g.lineTo(s.x1 - Math.cos(a) * r, s.y1 - Math.sin(a) * r); g.stroke(); } }
      if (grow < .999) { const s = hyph[Math.max(0, n - 1)]; g.strokeStyle = C.gr; g.lineWidth = .25; g.beginPath(); g.arc(s.x1, s.y1, 1.4 + Math.sin(tt * 8) * .3, 0, TAU); g.stroke(); }
      if (spo > .01) { g.globalAlpha = spo; g.lineWidth = .18; spores.forEach(sp => { if (sp.age > maxA + 5) return; g.save(); g.translate(sp.x, sp.y); g.rotate(sp.a); g.beginPath(); g.ellipse(1.2, 0, 1.15, .6, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(3.2, .3, .9, .5, 0, 0, TAU); g.stroke(); g.restore(); }); }
      g.restore();
      // pits, swirling spores, the plant's own plugs, browning
      g.save(); g.strokeStyle = C.gr; g.lineWidth = .24; pits.forEach(pt => { if (pt.age > maxA) return; const k = clamp((maxA - pt.age) / 6); g.globalAlpha = k; g.beginPath(); g.arc(pt.x, pt.y, .9 + (1 - k) * 1.6, 0, TAU); g.stroke(); }); g.restore();
      const sv = VES[0]; g.save(); g.lineWidth = .16; for (let i = 0; i < 11; i++) { const born = .22 + i * .045; if (grow < born) continue; const a = tt * (.5 + (i % 4) * .13) * (i % 2 ? 1 : -1) + i * 1.9, r = 1.4 + (i * 2.3) % 4.4; g.save(); g.translate(sv[0] + Math.cos(a) * r, sv[1] + Math.sin(a) * r); g.rotate(a * 2); g.globalAlpha = clamp((grow - born) * 8); g.beginPath(); g.ellipse(0, 0, .95, .45, 0, 0, TAU); g.stroke(); g.restore(); } g.restore();
      const ty = clamp((dmg - .05) * 1.6); if (ty > 0) { const v2 = VES[1]; g.save(); g.lineWidth = .22; g.globalAlpha = ty; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .4, r0 = 7.1, rr = (1.1 + (i % 3) * .5) * ty; g.beginPath(); g.arc(v2[0] + Math.cos(a) * (r0 - rr * .6), v2[1] + Math.sin(a) * (r0 - rr * .6), rr, 0, TAU); g.stroke(); } g.restore(); }
      // a day-by-day readout
      const prog = clamp(grow * .6 + dmg * .4 + spo * .15), day = Math.round(prog * 14), marks = [[0, 'A spore lands'], [4, 'Hyphae reach the vein'], [9, 'Cells lose their green'], [12, 'The leaf still looks fine']];
      let mk2 = marks[0]; marks.forEach(m => { if (day >= m[0]) mk2 = m; });
      g.save(); const bx0 = -30, bx1 = 30, by = 43.5; g.globalAlpha = clamp(grow * 6) * (1 - T(.64, .68)); g.lineWidth = .24; g.strokeStyle = C.fg; g.beginPath(); g.moveTo(bx0, by); g.lineTo(bx1, by); g.stroke();
      marks.forEach(m => { const x = lerp(bx0, bx1, m[0] / 14); g.beginPath(); g.moveTo(x, by - .8); g.lineTo(x, by + .8); g.stroke(); });
      g.fillStyle = C.gr; g.beginPath(); g.arc(lerp(bx0, bx1, day / 14), by, 1, 0, TAU); g.fill();
      txt(g, 'DAY ' + day, bx0, by - 3.2, { s: 2, col: C.gr, w: 500 }); txt(g, mk2[1], bx1, by - 3.2, { s: 1.8, al: 'right' }); g.restore();
      const t1 = T(.46, .5) * (1 - T(.55, .58)), t2 = T(.56, .6) * (1 - T(.66, .69));
      const p0 = hyph[Math.max(0, Math.min(n - 1, 300))];
      tag(g, 'FUNGAL HYPHAE', p0.x1, p0.y1, -44, 35, t1, 'right'); tag(g, 'ENTERING THE VEIN', VES[0][0], VES[0][1] + 3, 22, 33, t1, 'left');
      const pt = pits.find(q => q.age <= maxA) || pits[0]; if (pt) tag(g, 'THROUGH THE WALL AT A PIT', pt.x, pt.y, -48, -20, T(.48, .52) * (1 - T(.57, .6)), 'right');
      const dc = cells.find(c => c.dmg < 60) || cells[0]; tag(g, 'CELLS FAIL, GREEN FADES', dc.x, dc.y, -46, -34, t2, 'right'); tag(g, 'VEIN CLOGGED', VES[0][0], VES[0][1], 24, -36, t2, 'left'); tag(g, 'THE PLANT PLUGS ITS OWN PIPE', VES[1][0] - 5, VES[1][1] + 4, 12, -44, T(.6, .63) * (1 - T(.67, .7)), 'left'); }
    g.restore(); }

  // ----- 4 · THE PHONE: what the camera can see -----
  const aPh = T(.76, .8);
  if (aPh > .01) { g.save(); g.globalAlpha = aPh; const pw = 50, phh = 96, px = -pw / 2, py = -48;
    g.lineWidth = .5; rrect(g, px, py, pw, phh, 6); g.stroke(); g.lineWidth = .2; rrect(g, px + 1.6, py + 1.6, pw - 3.2, phh - 3.2, 4.6); g.stroke(); g.lineWidth = .3; g.beginPath(); g.moveTo(-5, py + 3.6); g.lineTo(5, py + 3.6); g.stroke();
    // viewfinder + scan
    const vf = [[-20, -42], [20, -42], [-20, 6], [20, 6]]; g.lineWidth = .4; g.strokeStyle = C.gr; vf.forEach(([x, y], i) => { g.beginPath(); g.moveTo(x - Math.sign(x) * 5, y); g.lineTo(x, y); g.lineTo(x, y + (i < 2 ? 5 : -5)); g.stroke(); });
    const sc = T(.8, .86); if (sc > 0 && sc < 1) { g.save(); g.strokeStyle = C.gr; g.lineWidth = .3; g.globalAlpha *= Math.sin(sc * Math.PI); const y = lerp(-42, 6, sc); g.beginPath(); g.moveTo(-20, y); g.lineTo(20, y); g.stroke(); g.globalAlpha *= .25; g.fillStyle = C.gr; g.fillRect(-20, y - 5, 40, 5); g.restore(); }
    // clues
    const G = lgeo(1), cl = [['YELLOWING', 0, 22, -8], ['DARK SPOTS', 2, -22, -22], ['A SHARE OF THE LEAVES', 1, 22, -26]];
    cl.forEach(([s, pi, tx, ty], i) => { const a = T(.84 + i * .014, .87 + i * .014) * (1 - T(.9, .93)); const [x, y] = lpt(G, PAT[pi][0], PAT[pi][1]); tag(g, s, x, y, tx > 0 ? 29 : -29, ty, a, tx > 0 ? 'left' : 'right', AMBER); });
    // the result card
    const rk = T(.9, .95);
    if (rk > .01) { g.save(); g.globalAlpha *= rk; g.translate(0, (1 - rk) * 6); g.fillStyle = C.fg; g.globalAlpha *= .06; rrect(g, -21.5, 8, 43, 36, 3); g.fill(); g.restore(); g.save(); g.globalAlpha *= rk; g.translate(0, (1 - rk) * 6); g.lineWidth = .24; rrect(g, -21.5, 8, 43, 36, 3); g.stroke();
      txt(g, 'PLANT DOCTOR', -19, 11.6, { s: 1.5, a: .6 }); txt(g, 'Possible leaf fungus', -19, 16, { s: 2.2, w: 500 }); txt(g, 'You make the call.', -19, 20, { s: 1.7, col: C.gr });
      [['Remove affected leaves', .96], ['Give it more airflow', .975], ['Check in tomorrow', .99]].forEach(([s, at], i) => { const y = 26 + i * 5.2, k = T(at - .02, at + .01); g.save(); g.globalAlpha *= .4 + .6 * k; g.lineWidth = .24; g.strokeStyle = C.gr; g.beginPath(); g.arc(-17.5, y, 1.3, 0, TAU); g.stroke(); if (k > .3) { g.lineWidth = .35; g.beginPath(); g.moveTo(-18.3, y); g.lineTo(-17.6, y + .8); g.lineTo(-16.4, y - .8); g.stroke(); } g.restore(); txt(g, s, -14.5, y, { s: 1.75 }); });
      const ok = T(.985, 1); if (ok > 0) { g.save(); g.globalAlpha *= ok; g.fillStyle = C.gr; g.beginPath(); g.roundRect ? g.roundRect(-19, 38.4, 38, 4.2, 2.1) : g.rect(-19, 38.4, 38, 4.2); g.fill(); txt(g, '+1 verified Plant-Day', 0, 40.5, { s: 1.7, col: getComputedStyle(document.documentElement).getPropertyValue('--on-accent').trim() || '#fff', al: 'center', w: 500 }); g.restore(); }
      g.restore(); }
    g.restore(); }

  // HUD: ladder + scale
  { g.save(); const lad = ['GARDEN', 'PLANT', 'LEAF', 'CELLS', 'CAMERA', 'APP'], idx = ps < .1 ? 0 : ps < .2 ? 1 : ps < .3 ? 2 : ps < .68 ? 3 : ps < .88 ? 4 : 5; let x = -47; const hy = -46.8;
    lad.forEach((l, i) => { txt(g, l, x, hy, { s: 1.7, col: i === idx ? C.gr : C.fg, a: i === idx ? 1 : .35, w: i === idx ? 500 : 400 }); x += l.length * 1.18 + 2.6; });
    const scl = ['≈ 10 m', '≈ 10 cm', '≈ 5 cm', '≈ 100 µm', '≈ 12 cm', ''][idx]; if (scl) { g.lineWidth = .3; g.strokeStyle = C.fg; g.globalAlpha = .8; g.beginPath(); g.moveTo(-47, 46); g.lineTo(-47, 47.6); g.lineTo(-33, 47.6); g.lineTo(-33, 46); g.stroke(); txt(g, scl, -31.5, 47.2, { s: 1.7, a: .8 }); }
    g.restore(); }
}

function fit() { const r = cv.getBoundingClientRect(); const w = Math.round(r.width), h = Math.round(r.height); if (!w || !h) return; D = document.documentElement.classList.contains('lite') ? 1 : Math.min(devicePixelRatio || 1, 1.75); W = w; H = h; U = Math.min(W, H) / 100; cv.width = Math.round(W * D); cv.height = Math.round(H * D); build(); }
new ResizeObserver(fit).observe(cv);
new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(cv);
addEventListener('themechange', () => { if (W) build(); });
(function loop(now) { if (vis && W) render(now); requestAnimationFrame(loop); })(performance.now());
fit(); document.fonts && document.fonts.ready.then(() => { if (W) build(); });
window.__leaf = { setP: v => { cv.dataset.p = v; ps = v; } };
})();
