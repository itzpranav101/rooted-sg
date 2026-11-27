/* ROOTED SG · Pitch Perfect deck engine.
   One click = one script line. Each line fires its own GSAP timeline, timed to the words inside the line,
   so the motion lands on the phrase being spoken. ←/→ (or a clicker) move line by line. */
(() => {
/* every tween runs 10% faster; start positions stay tied to the spoken words, so sync is unchanged */
(() => { const F = .9; const fix = v => { if (v && typeof v === 'object' && !v.__f) { v.duration = (v.duration == null ? .5 : v.duration) * F; } return v; };
  [gsap, gsap.timeline().constructor.prototype].forEach(T => { ['to', 'from'].forEach(m => { const o = T[m]; if (o && !o.__w) { T[m] = function (t, v, ...r) { return o.call(this, t, fix(v), ...r); }; T[m].__w = 1; } });
    const f = T.fromTo; if (f && !f.__w) { T.fromTo = function (t, a, b, ...r) { return f.call(this, t, a, fix(b), ...r); }; T.fromTo.__w = 1; } }); })();
const Q = new URLSearchParams(location.search);
if (Q.has('presenter')) return presenter();
const MIRROR = Q.has('mirror');

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const fmt = (v, d = 0) => Number(v).toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d });
const E = 'power3.out', E2 = 'expo.out';

/* ---------- fit the 1920×1080 stage to any screen ---------- */
function fit() { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `scale(${s})`; stage.style.left = (innerWidth - 1920 * s) / 2 + 'px'; stage.style.top = (innerHeight - 1080 * s) / 2 + 'px'; }
addEventListener('resize', fit); fit();

/* ---------- word timing: when, inside line i, is this phrase said? ---------- */
const norm = w => w.toLowerCase().replace(/[^a-z0-9{}-]/g, '');
function W(i, phrase, nth = 0) {
  if (window.__cue) window.__cue(i, phrase);
  const L = LINES[i], ws = L.text.split(/\s+/).map(norm), ps = phrase.split(/\s+/).map(norm);
  let hit = -1, seen = 0;
  for (let k = 0; k <= ws.length - ps.length; k++) if (ps.every((p, j) => ws[k + j] === p)) { if (seen++ === nth) { hit = k; break; } }
  if (hit < 0) { console.warn('phrase not found', i, phrase); hit = 0; }
  return hit / ws.length * L.speak;
}

/* ---------- small animation helpers ---------- */
function count(el, to, d = 1.6, dec) { if (!el) return gsap.timeline(); dec = dec ?? +(el.dataset.d || 0); const o = { v: parseFloat(String(el.textContent).replace(/,/g, '')) || 0 }; return gsap.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: () => el.textContent = fmt(o.v, dec), onComplete: () => el.textContent = fmt(to, dec) }); }
const drawIn = (els, d = 1.2, ease = 'power2.inOut') => gsap.fromTo(els, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease });
const rise = (els, o = {}) => gsap.fromTo(els, { autoAlpha: 0, y: o.y ?? 40 }, { autoAlpha: 1, y: 0, duration: o.d ?? .9, ease: o.ease || E, stagger: o.st ?? .08 });
const pop = (els, o = {}) => gsap.fromTo(els, { autoAlpha: 0, scale: o.s ?? .6 }, { autoAlpha: 1, scale: 1, duration: o.d ?? .7, ease: 'back.out(1.7)', stagger: o.st ?? .06 });
const out = (els, o = {}) => gsap.to(els, { autoAlpha: 0, y: o.y ?? -30, duration: o.d ?? .5, ease: 'power2.in', stagger: o.st ?? 0 });
const hide = (...els) => gsap.set(els.flat().filter(Boolean), { autoAlpha: 0 });
const zero = sc => $$('[data-n]', typeof sc === 'string' ? $(sc) : sc).forEach(e => e.textContent = '0');

/* =====================================================================
   SCENES · reset() sets the first frame, beats[k] is the timeline for the k-th line of the scene
   ===================================================================== */
const S = {};

/* ---------- READY ---------- */
const CC = buildCity($('#cityC'), 23);
$('#cvTeam').innerHTML = ['P', 'A', 'I', 'N'].map(k => `<span>${SPEAKERS[k].name}</span>`).join('');
S.ready = { chrome: false,
  reset() { hide('#cvTop', '#cvBrand', '#cvSub', '#cvTeam', '#cvHint', '.cv1', '.cv2', '#s-ready .cloud'); gsap.set('.cv-ul path', { strokeDashoffset: 1 }); CC.wins.forEach(w => w.classList.remove('on')); gsap.set($$('#cityC .bl'), { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.set('#cvTeam', { xPercent: -50 }); },
  play() { const tl = gsap.timeline(); tl.fromTo('#s-ready .cloud', { autoAlpha: 0, x: -120 }, { autoAlpha: 1, x: 0, duration: 2.2, ease: E2, stagger: .25 }, 0);
    tl.to($$('#cityC .bl'), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .04 }, .2); lightUp(CC, 1, 5.5, 1.2, tl);
    tl.fromTo('#cvTop', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, .5); tl.fromTo('#cvBrand', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E2 }, .7);
    tl.fromTo('.cv1', { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: E2 }, .9); tl.fromTo('.cv2', { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: E2 }, 1.15);
    tl.to('.cv-ul path', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 2); tl.fromTo('#cvSub', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E2 }, 2.1);
    tl.fromTo('#cvTeam', { autoAlpha: 0, y: 40, xPercent: -50 }, { autoAlpha: 1, y: 0, xPercent: -50, duration: 1.1, ease: E2 }, 2.6); tl.fromTo('#cvHint', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8, ease: E2 }, 3.3);
    tl.to('#cvHint', { y: -8, duration: .7, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 4.2); return tl; },
  beats: [] };

/* ---------- the million-balcony city (hook and vision) ---------- */
function buildCity(svg, seed) {
  const R = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(seed); let s = '', x = 30, k = 0;
  while (x < 1890) { const w = 90 + R() * 70 | 0, hgt = 220 + R() * 360 | 0, top = 600 - hgt; s += `<g class="blk" data-k="${k++}"><rect class="bl" x="${x}" y="${top}" width="${w}" height="${hgt}" rx="4" pathLength="1"/>`;
    const cols = Math.max(2, Math.floor((w - 16) / 22)), rows = Math.floor((hgt - 24) / 30);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += `<rect class="wn" x="${x + 10 + c * ((w - 20) / cols) + 2}" y="${top + 14 + r * 30}" width="${(w - 20) / cols - 6}" height="16" rx="3"/>`;
    s += '</g>'; x += w + 10 + R() * 26; }
  svg.innerHTML = s + `<path class="gl" d="M0 602H1920"/>`;
  const wins = [...svg.querySelectorAll('.wn')]; const order = wins.map((w, j) => [w, R()]).sort((a, b) => a[1] - b[1]).map(a => a[0]); return { blocks: [...svg.querySelectorAll('.blk')], wins, order };
}
const CA = buildCity($('#cityA'), 17), CB = buildCity($('#cityB'), 17);
const lightUp = (C, frac, d, t, tl) => { const list = C.order.slice(0, Math.round(C.order.length * frac)); const n = list.length; list.forEach((w, j) => tl.add(() => w.classList.add('on'), t + j / n * d)); };
S.hook = {
  chrome: false,
  reset() { hide('#hkA', '#hkN', '.hk-h em'); CA.wins.forEach(w => w.classList.remove('on')); gsap.set(CA.blocks, { y: 0, autoAlpha: 1 }); gsap.set($$('#cityA .bl'), { strokeDasharray: 1, strokeDashoffset: 1 }); zero('#s-hook'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.fromTo('#hkA', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E }, .1); tl.fromTo('.hk1', { scale: 1.06 }, { scale: 1, duration: 1.4, ease: E }, .1); tl.set('.hk-h em', { autoAlpha: 0 }, 0); tl.fromTo('.hk-h em', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, W(i, 'But what') - .1);
      tl.to($$('#cityA .bl'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .05 }, .3);
      const t = W(i, 'a million') - 1.2; tl.add(rise('#hkN', { y: 40 }), t); tl.add(count($('#hkN [data-n]'), 1000000, 3), t + .2);
      lightUp(CA, .55, LINES[i].speak - t, t + .3, tl); return tl; }
  ]
};
S.vision = {
  chrome: false,
  reset() { hide('#viT', '#viC', $$('#viT > *')); CB.wins.forEach(w => w.classList.remove('on')); gsap.set($$('#cityB .bl'), { strokeDasharray: 1, strokeDashoffset: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.set('#viT', { autoAlpha: 1 }, 0); tl.fromTo($$('#viT > *'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E, stagger: .3 }, .1);
      tl.fromTo('#cityB', { y: 120 }, { y: 0, duration: 1.4, ease: E2 }, 0); lightUp(CB, 1, 5.5, W(i, 'Every block') , tl);
      tl.add(pop('#viC', { s: .7 }), W(i, 'every living')); return tl; }
  ]
};

/* ---------- COLD OPEN: the 2022 chicken shock, then the import map ---------- */
(function () { const R = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(5), c = 450; let s = '<g id="impLines" fill="none" stroke="#0B5A32" stroke-width="1.4" opacity=".45">', dots = '<g id="impDots">';
  for (let k = 0; k < 187; k++) { const a = R() * Math.PI * 2, r = 170 + Math.pow(R(), .7) * 260, x = c + Math.cos(a) * r, y = c + Math.sin(a) * r * .92, mx = (x + c) / 2 + Math.sin(a) * 40, my = (y + c) / 2 - Math.cos(a) * 40;
    s += `<path pathLength="1" d="M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${c} ${c}"/>`; dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4 + R() * 4).toFixed(1)}" fill="#0A0A0A"/>`; }
  $('#impMap').innerHTML = s + '</g>' + dots + `</g><g id="impSG"><circle cx="${c}" cy="${c}" r="70" fill="#0B5A32" opacity=".12" class="sgp"/><circle cx="${c}" cy="${c}" r="26" fill="#0B5A32"/><text x="${c}" y="${c + 72}" text-anchor="middle" font-family="DM Mono, monospace" font-size="26" letter-spacing="3" fill="#0B5A32" font-weight="500">SINGAPORE</text></g>`; })();
S.cold = {
  chrome: false,
  reset() { hide('#imp .ie', '#ib1', '#ib2', $$('#trans > div'), '#imp .src', '#impSG', $$('#shock span'), '#teamV', $$('#teamV > *'), $$('#team .mem')); gsap.set('#imp', { autoAlpha: 1, y: 0 }); gsap.set('#ib1', { y: 0 }); gsap.set('#trans', { autoAlpha: 1, y: 0 });
    gsap.set($$('#impLines path'), { strokeDasharray: 1, strokeDashoffset: 1, stroke: '#0B5A32', opacity: 1 }); gsap.set($$('#impDots circle'), { scale: 0, transformOrigin: '50% 50%', fill: '#0A0A0A' }); gsap.set('#impSG circle', { fill: '#0B5A32' }); $$('#team .mem').forEach(m => m.classList.remove('on')); zero('#s-cold'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('#imp .ie', { y: 16 }), .1); tl.fromTo('#impSG', { autoAlpha: 0, scale: 0, svgOrigin: '450 450' }, { autoAlpha: 1, scale: 1, duration: .9, ease: 'back.out(2)' }, .3);
      tl.add(rise('#ib1', { y: 50 }), .2); tl.add(count($('#ib1 [data-n]'), 90, 1.8), .4);
      const T = $$('#trans > div'); ['ship,', 'truck,', 'plane.'].forEach((w, k) => tl.fromTo(T[k], { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, w) - .1));
      const P = $$('#impLines path'), Dd = $$('#impDots circle'); tl.to(Dd.slice(0, 40), { scale: 1, duration: .4, ease: 'back.out(3)', stagger: .03 }, W(i, 'came from') - .2); tl.to(P.slice(0, 40), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .03 }, W(i, 'came from'));
      tl.to('#impSG circle', { fill: '#984421', duration: .5 }, W(i, "We don't")); tl.to('#impSG circle', { fill: '#0B5A32', duration: .5 }, W(i, 'those journeys.') + .6); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#imp', { autoAlpha: 0, y: -30, duration: .6, ease: 'power2.in' }, 0); tl.set('#teamV', { autoAlpha: 1 }, .3);
      tl.fromTo($$('#teamV > .eyebrow, #teamV > .h2'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: E, stagger: .2 }, W(i, "we're Rooted") - .4); tl.set('#team', { autoAlpha: 1 }, 0);
      const m = $$('#team .mem'); [W(i, "I'm Pranav,"), W(i, 'Anandita,'), W(i, 'Pranav', 1), W(i, 'Jiya,')].forEach((t, k) => tl.fromTo(m[k], { autoAlpha: 0, scale: .9 }, { autoAlpha: 1, scale: 1, duration: .8, ease: E2 }, Math.max(.4 + k * .2, t)));
      tl.add(() => m.forEach(x => x.classList.add('on')), W(i, 'problem to solve.')); return tl; },
    i => { const tl = gsap.timeline(), P = $$('#impLines path'), Dd = $$('#impDots circle'); tl.to('#teamV', { autoAlpha: 0, y: -30, duration: .6, ease: 'power2.in' }, 0); tl.fromTo('#imp', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .8, ease: E }, .4);
      tl.set('#trans', { autoAlpha: 0 }, .3); tl.set('#ib1', { autoAlpha: 0 }, .3);
      tl.add(rise('#ib2', { y: 50 }), .7); tl.add(count($('#ib2 [data-n]'), 180, 2.4), .9); tl.to(Dd.slice(40), { scale: 1, duration: .4, ease: 'back.out(3)', stagger: { each: .009, from: 'random' } }, .7); tl.to(P.slice(40), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: { each: .009, from: 'random' } }, 1);
      tl.add(rise('#imp .src', { y: 10 }), 1.8);
      const cut = P.filter((_, k) => k % 5 === 0), cutD = Dd.filter((_, k) => k % 5 === 0), S2 = $$('#shock span'), n3 = Math.ceil(cut.length / 3);
      [W(i, 'Every one'), W(i, 'point of failure'), W(i, 'in our hands.')].forEach((t, k) => { tl.add(pop(S2[k], { s: .7 }), t); tl.to(cut.slice(k * n3, (k + 1) * n3), { stroke: '#984421', strokeDashoffset: -1, duration: 1, ease: 'power2.in', stagger: .02 }, t + .2); tl.to(cutD.slice(k * n3, (k + 1) * n3), { fill: '#984421', duration: .3, stagger: .02 }, t); });
      tl.to('#impSG circle', { fill: '#984421', duration: .4 }, W(i, 'in our hands.') + .3); return tl; }
  ]
};

/* ---------- THE GAP: the goal, the tools, and the number nobody keeps ---------- */
function Field(cv, cols, rows, opt = {}) {
  const g = cv.getContext('2d'); const st = { a: 0, g: 0, d: 0, ok: 0 };
  const W2 = cv.clientWidth || 1680, H2 = cv.clientHeight || 430, DPR = 2; cv.width = W2 * DPR; cv.height = H2 * DPR;
  const R = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(opt.seed || 7);
  const pts = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pts.push({ c, r, x: (c + .5) / cols * W2 + (R() - .5) * 8, y: (r + .5) / rows * H2 + (R() - .5) * 6, j: R() });
  function draw() {
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W2, H2); g.lineCap = 'round';
    const sz = Math.min(W2 / cols, H2 / rows);
    for (const p of pts) {
      const ka = clamp(st.a * 1.7 - p.c / cols * .7 - p.j * .05); if (ka <= 0) continue;
      const kg = clamp(st.g * 1.6 - p.j * .6), kd = clamp(st.d * 1.5 - p.j * .5);
      g.globalAlpha = ka * (opt.keep ? 1 : (1 - kd * .85));
      const col = kd > .3 ? '#0A0A0A' : '#0B5A32';
      if (kg < .05) { g.fillStyle = col; g.beginPath(); g.arc(p.x, p.y, sz * .2 * ka, 0, 7); g.fill(); continue; }
      const h = sz * .62 * kg * (1 - kd * .4), by = p.y + sz * .3;
      g.strokeStyle = col; g.lineWidth = Math.max(1.2, sz * .07);
      g.beginPath(); g.moveTo(p.x, by); g.lineTo(p.x + kd * sz * .2, by - h); g.stroke();
      const lw = sz * .26 * kg; g.fillStyle = kd > .3 ? 'rgba(10,10,10,0)' : '#E4F0E8';
      [[-1, .55], [1, .8]].forEach(([s, f]) => { const yy = by - h * f, dr = kd * 1.2 * s; g.save(); g.translate(p.x + kd * sz * .2 * f, yy); g.rotate(s * -.5 + dr); g.beginPath(); g.ellipse(s * lw * .6, 0, lw * .6, lw * .28, 0, 0, 7); g.fill(); g.stroke(); g.restore(); });
      if (opt.keep && st.ok > 0) { const k = clamp(st.ok * 1.6 - p.j * .6); if (k > 0) { g.globalAlpha = k; g.fillStyle = '#0B5A32'; g.beginPath(); g.arc(p.x + sz * .26, by - h - sz * .02, sz * .12, 0, 7); g.fill(); } }
    }
  }
  return { st, draw, tween: (vars, d = 2) => gsap.to(st, { ...vars, duration: d, ease: 'power1.inOut', onUpdate: draw }) };
}
let F1, F2;
S.gap = {
  chrome: false,
  reset() { F1 = F1 || Field($('#field'), 43, 20); Object.assign(F1.st, { a: 0, g: 0, d: 0 }); F1.draw(); hide('#fsTwo', $$('#fsTwo > *'), '#tools', $$('#tools .tc'), '#gapZero', '#gapLine', '#fieldKey'); gsap.set(['#fsA', '#fsB'], { scaleX: 0 }); gsap.set('#field', { autoAlpha: 1, y: 0 }); zero('#s-gap'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.set('#fsTwo', { autoAlpha: 1 }, 0); tl.add(rise($$('#fsTwo > .eyebrow, #fsTwo > .h2'), { st: .2 }), 0); tl.add(rise($$('#fsTwo .fsb'), { st: .2, y: 30 }), W(i, 'By 2035,') - .2);
      tl.to('#fsB', { scaleX: 20 / 25, duration: 1.8, ease: E2 }, W(i, 'twenty percent')); tl.add(count($$('#fsTwo [data-n]')[1], 20, 1.6), W(i, 'twenty percent'));
      tl.to('#fsA', { scaleX: 8 / 25, duration: 1.4, ease: E2 }, W(i, 'Right now,')); tl.add(count($$('#fsTwo [data-n]')[0], 8, 1.2), W(i, 'Right now,')); tl.add(rise('#fsTwo .src', { y: 10 }), W(i, 'Right now,') + .6); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#fsTwo', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, 0); tl.set('#tools', { autoAlpha: 1 }, .4); tl.add(rise('#tools .eyebrow', { y: 14 }), .4); const C = $$('#tools .tc');
      [W(i, 'eight hundred'), W(i, 'over two thousand four hundred'), W(i, 'over seventeen hundred')].forEach((t, k) => { tl.fromTo(C[k], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, t); tl.add(count($('[data-n]', C[k]), +$('[data-n]', C[k]).dataset.n, k ? 1.4 : 2.6), t + .2); });
      tl.add(F1.tween({ a: 1 }, 3.4), W(i, 'eight hundred') + .2); tl.add(rise('#fieldKey', { y: 10 }), W(i, 'eight hundred') + 1.4); return tl; },
    i => { const tl = gsap.timeline(); tl.add(F1.tween({ g: 1 }, 2.4), 0); const t = W(i, 'But nobody'); tl.to('#tools', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, t - .5);
      tl.add(F1.tween({ d: 1 }, 2.6), t + .4); tl.fromTo('#gapZero', { autoAlpha: 0, scale: .85 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: E2 }, t + .2);
      const t2 = W(i, 'Singapore counts'); tl.to(['#field', '#fieldKey'], { autoAlpha: 0, y: 40, duration: .8 }, t2 - .4); tl.add(rise('#gapLine', { y: 40, d: 1.1 }), t2); return tl; }
  ]
};

/* ---------- HERO: the heymeco.xyz opening, app only ---------- */
$('#team').innerHTML = ['P', 'A', 'I', 'N'].map(k => { const s = SPEAKERS[k]; return `<div class="mem" data-k="${k}"><div class="ini">${s.short[0]}</div><div><b>${s.name}</b><span>${s.part}</span></div></div>`; }).join('');
$('#clNames').innerHTML = ['P', 'A', 'I', 'N'].map(k => SPEAKERS[k].name).join(' <b>·</b> ');
S.hero = {
  chrome: true, sec: 'Rooted SG',
  reset() { hide('#heroEye', $$('#heroH .hl'), $$('#heroTrio li'), $$('#heroStage .ph'), $$('#heroStage .chip')); gsap.set('#heroStage', { autoAlpha: 1, y: 0 }); gsap.set('#heroTrio', { autoAlpha: 1, y: 0 }); gsap.set($$('#s-hero .alive path'), { strokeDashoffset: 1 }); gsap.set('.hero-wrap', { y: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('#heroEye', { y: 20 }), 0); tl.add(rise($$('#heroH .hl'), { y: 34, d: 1.1, st: .18 }), .1);
      tl.add(drawIn($('#s-hero .alive .ul path'), 1, 'power2.out'), 1.0); $$('#s-hero .alive .sp path').forEach((p, k) => tl.add(drawIn(p, .5, 'power2.out'), [1.8, 2.1, 2.3][k]));
      const t = W(i, 'the first way'); tl.add(rise($$('#heroTrio li'), { y: 24, st: .14 }), t);
      const ph = $$('#heroStage .ph'); tl.fromTo(ph, { autoAlpha: 0, y: 380 }, { autoAlpha: 1, y: 0, duration: 1.6, ease: E2, stagger: { each: .14, from: 'center' } }, W(i, 'an app') - .3);
      tl.add(pop($$('#heroStage .chip'), { st: .25 }), W(i, 'only earn')); return tl; },
    i => { const tl = gsap.timeline(); tl.to($$('#heroStage .chip'), { scale: 1.06, yoyo: true, repeat: 1, duration: .3, stagger: .2 }, W(i, 'three thousand')); return tl; }
  ]
};

/* ---------- SURVEY: 100 dots, the say-do gap ---------- */
$('#dots').innerHTML = Array.from({ length: 100 }, () => '<i></i>').join('');
const dots = $$('#dots i');
S.survey = {
  sec: 'The problem',
  reset() { hide('#svBig', '#sv1', '#sv2', '#dotsCap', dots); dots.forEach(d => d.className = ''); zero('#s-survey'); gsap.set(['.sv-left .eyebrow', '.sv-h', '.sv-src2'], { autoAlpha: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.sv-left .eyebrow', '.sv-h'], { st: .15 }), 0); tl.add(rise('#svBig'), W(i, 'We did') + .2); tl.add(count($('#svBig [data-n]'), 3043, 2.2), W(i, 'We did') + .4);
      tl.fromTo(dots, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)', stagger: { each: .012, grid: [10, 10], from: 'center' } }, W(i, 'real people,')); tl.add(rise('.sv-src2', { y: 10 }), W(i, 'before writing')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#sv1'), 0); tl.add(count($('#sv1 [data-n]'), 70.9, 2), .2);
      dots.slice(0, 71).forEach((d, k) => tl.add(() => d.classList.add('g'), .25 + k * .028)); tl.fromTo(dots.slice(0, 71), { scale: .7 }, { scale: 1, duration: .5, ease: 'back.out(3)', stagger: .028 }, .25);
      tl.add(() => $('#dotsCap').innerHTML = '<b>70.9%</b> want to grow at home', 0); tl.add(rise('#dotsCap', { y: 10 }), .3); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#sv2'), .2); tl.add(count($('#sv2 [data-n]'), 51.2, 2), .5);
      tl.add(() => dots.forEach(d => d.classList.remove('g')), .3); dots.slice(0, 51).forEach((d, k) => tl.add(() => d.classList.add('a'), .5 + k * .03)); tl.fromTo(dots.slice(0, 51), { scale: .7 }, { scale: 1, duration: .5, ease: 'back.out(3)', stagger: .03 }, .5);
      tl.add(() => $('#dotsCap').innerHTML = '<b>The say-do gap</b>', W(i, 'say-do')); tl.fromTo('#dotsCap', { scale: .9 }, { scale: 1, duration: .6, ease: 'back.out(2)' }, W(i, 'say-do')); return tl; }
  ]
};

/* ---------- PARETO ---------- */
const PA = [['Forgetting, or no time', 36.1, 'Habit'], ['No one to ask', 26.7, 'Knowledge'], ['Losing motivation', 24.0, 'Motivation'], ['Don\'t know where to look for help', 16.3, '']];
(function () { const p = $('#pareto'); p.style.height = '500px'; p.style.top = '330px';
  PA.forEach(([l, v, t], k) => { const b = document.createElement('div'); b.className = 'bar' + (k === 3 ? ' dim' : ''); b.style.left = (56 + k * 282) + 'px'; b.innerHTML = `${t ? `<span class="tg">${t}</span>` : ''}<span class="v"><span>0</span>%</span><div class="col" style="height:${v / 36.1 * 380}px"></div><span class="lb">${l}</span>`; p.appendChild(b); }); })();
S.pareto = {
  sec: 'The problem',
  reset() { hide('.pa-eye', '.pa-h', '#paSide', '.pa-src', $$('#pareto .bar .v'), $$('#pareto .bar .lb'), $$('#pareto .bar .tg')); gsap.set($$('#pareto .col'), { scaleY: 0 }); gsap.set($$('.pa-axis path'), { strokeDashoffset: 1 }); $$('#pareto .v span').forEach(e => e.textContent = '0'); $$('.pa-strike span').forEach(s => s.style.setProperty('--s', 0)); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.pa-eye', '.pa-h'], { st: .12 }), 0); tl.add(drawIn($$('.pa-axis path'), 1.2), .5); tl.add(rise($$('#pareto .lb'), { y: 14, st: .12 }), W(i, 'We put')); tl.add(rise('.pa-src', { y: 10 }), W(i, 'Pareto')); return tl; },
    i => { const tl = gsap.timeline(), bars = $$('#pareto .bar'); const at = [0, W(i, 'No one'), W(i, 'Losing'), W(i, 'Losing') + 2.6];
      bars.forEach((b, k) => { tl.to($('.col', b), { scaleY: 1, duration: 1.2, ease: E2 }, at[k]); tl.add(rise($('.v', b), { y: 20 }), at[k] + .2); tl.add(count($('.v span', b), PA[k][1], 1.2, 1), at[k] + .2); }); return tl; },
    i => { const tl = gsap.timeline(); tl.add(pop($$('#pareto .tg'), { st: .15 }), 0); tl.add(rise('#paSide'), 0);
      [W(i, 'Space'), W(i, 'money'), W(i, 'money') + .7].forEach((t, k) => { const s = $$('.pa-strike span')[k]; tl.fromTo(s, { '--s': 0 }, { '--s': 1, duration: .5, ease: 'power2.out' }, t + .3); }); tl.fromTo($$('#pareto .bar:not(.dim) .col'), { scaleY: 1 }, { scaleY: 1.04, yoyo: true, repeat: 1, duration: .3, stagger: .15 }, W(i, 'three causes')); return tl; }
  ]
};

/* ---------- 5 WHYS: a taproot dug into the soil ---------- */
const wyN = $$('#s-whys .wyn');
S.whys = {
  sec: 'Root cause',
  reset() { hide('.wy-head', wyN, '#root', '#wyPlant', '#wyGlow'); gsap.set(['#wySoil', '#wySoilP'], { autoAlpha: 0 }); gsap.set(['#wyGround', '#wyTap', ...$$('#wySide path')], { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.killTweensOf('#wyGlow .ring'); gsap.set('#wyGlow .ring', { scale: 1, opacity: 0, svgOrigin: '960 860' }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.wy-head', { y: 20 }), 0); tl.to('#wyGround', { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, .1);
      tl.fromTo(['#wySoil', '#wySoilP'], { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, .3); tl.fromTo('#wyPlant', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, .4);
      const at = [W(i, 'why, five'), W(i, 'to dig'), W(i, 'People forget'), W(i, 'Nothing reminds them,'), W(i, 'nobody can see')], seg = [.16, .36, .55, .75, 1], side = $$('#wySide path');
      at.forEach((t, k) => { tl.to('#wyTap', { strokeDashoffset: 1 - seg[k], duration: 1, ease: 'power2.inOut' }, t); if (side[k]) tl.to(side[k], { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' }, t + .5); if (k === 4 && side[5]) tl.to(side[5], { strokeDashoffset: 0, duration: 1.1 }, t + .7);
        tl.fromTo(wyN[k], { autoAlpha: 0, x: wyN[k].dataset.s === 'l' ? -60 : 60 }, { autoAlpha: 1, x: 0, duration: .9, ease: E2 }, t + .5); tl.fromTo($('i', wyN[k]), { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(2.5)' }, t + .5); });
      return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#wyGlow', { autoAlpha: 0, scale: 0, svgOrigin: '960 860' }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, 0);
      tl.fromTo('#wyGlow .ring', { scale: 1, opacity: .9, svgOrigin: '960 860' }, { scale: 2.6, opacity: 0, duration: 1.8, ease: 'power1.out', stagger: .9, repeat: 3 }, .2);
      tl.to(wyN.slice(0, 4), { autoAlpha: .35, duration: .6 }, W(i, 'Plants die')); tl.fromTo('#root', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'Plants die') - .2);
      tl.to('#wyPlant .leaff', { fill: '#F4E2B3', stroke: '#8A5A00', duration: 1.6, stagger: .15 }, W(i, 'Nobody sees')); return tl; }
  ]
};

/* ---------- NATIONAL + COMPARISON ---------- */
$$('#cmp .cr:not(.head)').forEach(r => r.dataset.v.split(' ').forEach(v => { const s = document.createElement('span'); s.innerHTML = `<i class="mk ${v}">${v === 'y' ? '<svg><use href="#check"/></svg>' : ''}</i>`; r.appendChild(s); }));
S.national = {
  sec: 'Solution scan',
  reset() { hide('#naLeft', '#naRight', $$('#cmp .cr'), $$('#inq .iq')); gsap.set($$('#cmp .mk'), { scale: 0 }); gsap.set($$('#inq i'), { scale: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('#naLeft'), 0); const Q = $$('#inq .iq');
      [W(i, 'packets sent,'), W(i, 'plots allotted,'), W(i, 'trees planted.'), W(i, 'None of')].forEach((t, k) => { tl.fromTo(Q[k], { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: .7, ease: E2 }, t); tl.to($('i', Q[k]), { scale: 1, duration: .5, ease: 'back.out(2.6)' }, t + .25); });
      tl.fromTo(Q[3], { scale: 1 }, { scale: 1.04, yoyo: true, repeat: 1, duration: .25 }, W(i, 'None of') + .8); return tl; },
    i => { const tl = gsap.timeline(), rows = $$('#cmp .cr'); tl.add(rise('#naRight', { y: 30 }), 0); tl.add(rise(rows[0], { y: 10 }), .3);
      const at = [W(i, 'Plant apps'), W(i, 'Habit apps'), W(i, 'Planting drives'), W(i, 'Planting drives') + 1.2, W(i, 'Not one')];
      rows.slice(1).forEach((r, k) => { tl.fromTo(r, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: .7, ease: E2 }, at[k]); tl.to($$('.mk', r), { scale: 1, duration: .5, ease: 'back.out(2.4)', stagger: .12 }, at[k] + .25); });
      tl.fromTo(rows[5], { scale: .96 }, { scale: 1, duration: .8, ease: 'back.out(2)' }, at[4] + .2); return tl; }
  ]
};

/* ---------- TARGET ---------- */
const gaugeSet = v => { gsap.set('#gNeedle', { rotation: -90 + v / 50 * 180, svgOrigin: '300 310' }); gsap.set('#gFill', { strokeDashoffset: 100 - v * 2 }); $('#gNum').textContent = Math.round(v); };
const gaugeTo = (v, d) => { const o = { v: parseFloat($('#gNum').textContent) }; return gsap.to(o, { v, duration: d, ease: 'power2.inOut', onUpdate: () => gaugeSet(o.v), onComplete: () => gaugeSet(v) }); };
S.target = {
  sec: 'Target setting',
  reset() { hide('.tg-eye', '#gauge', '.tg-right .h3', '.tg-right .lead', '.tg-right .src', $$('#smart div'), '#stoprule'); gaugeSet(0); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.tg-eye', '#gauge'], { st: .15 }), 0); tl.add(gaugeTo(18, 1.6), .5); tl.add(rise('.tg-right .h3'), W(i, 'lift')); tl.add(gaugeTo(30, 2.2), W(i, 'to thirty')); tl.add(rise('.tg-right .lead'), W(i, 'A twelve-point'));
      tl.add(rise($$('#smart div'), { y: 30, st: .16 }), W(i, 'one measurable') + .4); tl.add(rise('.tg-right .src', { y: 10 }), W(i, 'eighteen')); return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#stoprule', { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E2 }, .2); tl.fromTo('#stoprule em', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: .8 }, W(i, 'less than')); return tl; }
  ]
};

/* ---------- PLANT-DAY ---------- */
const pdImgs = $$('#pdPh img'); const pdShow = k => pdImgs.forEach((im, j) => im.classList.toggle('on', j === k));
S.plantday = {
  sec: 'The app',
  reset() { hide('.pd-phone', $$('.pd-right > *'), $$('#checks > div'), '#mojo', '.bubble', '#solves1', '#plus1'); pdShow(0); $('#pdNum').textContent = '0'; $('#mojoImg').src = 'media/mojo/idle.gif'; gsap.set($$('#checks svg'), { scale: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.fromTo('.pd-phone', { autoAlpha: 0, y: 160, rotation: -6 }, { autoAlpha: 1, y: 0, rotation: -2, duration: 1.4, ease: E2 }, 0);
      tl.add(rise($$('.pd-right > .eyebrow, .pd-right > .h3'), { st: .12 }), .2); const t = W(i, 'verified Plant-Day.'); tl.add(rise('.pd-count'), t - .3); tl.add(count($('#pdNum'), 314, 2.6), t); return tl; },
    i => { const tl = gsap.timeline(), c = $$('#checks > div'); tl.add(() => pdShow(1), .1); tl.set('#checks', { autoAlpha: 1 }, 0);
      ['A real', 'A fresh', 'The right'].forEach((w, k) => { const t = W(i, w); tl.fromTo(c[k], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .7, ease: E2 }, t); tl.to($('svg', c[k]), { scale: 1, duration: .5, ease: 'back.out(3)' }, t + .3); });
      const t = W(i, 'Miss one'); tl.fromTo('#plus1', { autoAlpha: 0, y: 40, scale: .6 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(2)' }, t - 1.6); tl.to('#plus1', { autoAlpha: 0, y: -50, duration: .5 }, t - .7); tl.add(count($('#pdNum'), 315, .4), t - .7); tl.fromTo('#pdNum', { scale: 1 }, { scale: 1.08, yoyo: true, repeat: 1, duration: .2 }, t - .7); return tl; },
    i => { const tl = gsap.timeline(); tl.add(() => pdShow(2), 0); tl.fromTo('#mojo', { autoAlpha: 0, x: -300 }, { autoAlpha: 1, x: 0, duration: 1.1, ease: 'back.out(1.4)' }, W(i, 'Mojo,'));
      tl.fromTo('.bubble', { autoAlpha: 0, scale: .5, transformOrigin: '0% 100%' }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, W(i, 'tells you')); tl.add(() => $('#mojoImg').src = 'media/mojo/happy.gif', W(i, 'Once a day,'));
      tl.add(pop('#solves1', { s: .8 }), W(i, 'The first cause') + .3); return tl; }
  ]
};

/* ---------- MOJO: why a character works ---------- */
const mjSet = (g, t) => { $('#mjBig').src = 'media/mojo/' + g + '.gif'; if (t) $('#mjTxt').textContent = t; };
S.mojo = {
  sec: 'Mojo',
  reset() { hide('#mjStage', $$('.mj-right > *'), $$('#mjCards .mjc'), '#mjRules', $$('#mjRules .mjr'), '#mjState'); gsap.set('#mjCards', { autoAlpha: 1, y: 0 }); mjSet('idle', 'Mojo · watching your plants'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.fromTo('#mjStage', { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.6)' }, 0); tl.add(rise($$('.mj-right > .eyebrow, .mj-right > .h3'), { st: .15 }), W(i, 'just there') - .4);
      tl.set('.mj-right .mj-cards', { autoAlpha: 1 }, 0); const C = $$('#mjCards .mjc'); [W(i, 'MIT,'), W(i, 'Stanford'), W(i, 'Harvard'), W(i, 'stay with')].forEach((t, k) => tl.fromTo(C[k], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .9, ease: E2 }, t));
      tl.add(() => mjSet('think'), W(i, 'Research')); tl.add(() => mjSet('happy'), W(i, 'small wins.')); tl.fromTo('#mjBig', { y: 0 }, { y: -26, yoyo: true, repeat: 1, duration: .3, ease: 'power2.out' }, W(i, 'small wins.')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#mjCards', { autoAlpha: 0, y: -30, duration: .5 }, 0); tl.set('#mjRules', { autoAlpha: 1 }, .3); tl.set('#mjState', { autoAlpha: 1 }, 0); const R = $$('#mjRules .mjr');
      tl.fromTo(R[0], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'cheers')); tl.add(() => mjSet('happy', 'Checked in · Mojo celebrates'), W(i, 'cheers')); tl.fromTo('#mjBig', { y: 0 }, { y: -30, yoyo: true, repeat: 3, duration: .22 }, W(i, 'cheers'));
      tl.fromTo(R[1], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'visibly worries')); tl.add(() => mjSet('sad', 'Pandan ignored · Mojo worries'), W(i, 'visibly worries'));
      tl.fromTo(R[2], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'Once a day,')); tl.add(() => mjSet('idle', 'One nudge a day · never twice'), W(i, 'Once a day,')); tl.add(() => mjSet('happy', 'A friendship, not a chore'), W(i, 'a friend')); return tl; }
  ]
};

/* ---------- PLANT DOCTOR: the leaf view from the site, then a full camera sequence ---------- */
const leafCv = $('canvas[data-deckleaf]'); const LP = { p: 0 };
const setP = (v, snap) => { LP.p = v; leafCv.dataset.p = v; if (snap && window.__deckleaf) window.__deckleaf.setP(v); };
const pTo = (v, d, ease = 'sine.inOut') => gsap.to(LP, { p: v, duration: d, ease, onUpdate: () => leafCv.dataset.p = LP.p, onComplete: () => setP(v, true) });
const drSteps = $$('#drSteps .st'); const stepTo = k => { const tl = gsap.timeline(); drSteps.forEach((s, j) => { if (j !== k) tl.to(s, { autoAlpha: 0, y: -30, duration: .45 }, 0); }); tl.fromTo(drSteps[k], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: E }, .3); return tl; };
(function () { let v = '<path d="M180 700V80" stroke-width="5"/>'; for (let k = 0; k < 8; k++) { const y = 640 - k * 68, sp = 120 - Math.abs(k - 3) * 10; v += `<path d="M180 ${y}C${180 - sp * .5} ${y - 30} ${180 - sp} ${y - 60} ${180 - sp * 1.15} ${y - 96}" stroke-width="2.6"/><path d="M180 ${y - 20}C${180 + sp * .5} ${y - 50} ${180 + sp} ${y - 80} ${180 + sp * 1.15} ${y - 116}" stroke-width="2.6"/>`; } $('#camVeins').innerHTML = v; })();
const camF = $('#camFocus');
function camReset() {
  hide('#cam', $$('#clues .clue')); gsap.set(leafCv, { autoAlpha: 1 }); gsap.set('#camPh', { y: 0 }); $('#camLeaf').classList.remove('frozen');
  gsap.set(camF, { x: 180, y: 330, scale: 1.4, autoAlpha: 0 }); $$('#camFocus *').forEach(e => e.setAttribute('stroke', '#F2C14E'));
  gsap.set($$('#camLes circle'), { scale: .5, opacity: .55, transformOrigin: '50% 50%' }); gsap.set('#camGrid', { opacity: 0 }); gsap.set('#camScan', { opacity: 0, y: 0 });
  gsap.set($$('#camDet circle'), { scale: 0, transformOrigin: '50% 50%' }); gsap.set('#camOutline', { strokeDashoffset: 1 }); gsap.set('#camFlash', { opacity: 0 });
  gsap.set('#camSheet', { y: 460 }); gsap.set('#camToast', { autoAlpha: 0 }); gsap.set($$('#camPlan .ck'), { opacity: 0 }); gsap.set('#tap', { opacity: 0, scale: .4, transformOrigin: '50% 50%' });
  $('#camStatus').textContent = 'FOCUSING…'; $('#camStatus').setAttribute('fill', '#F2C14E'); gsap.set(['#camShutter', '#camTop'], { autoAlpha: 1 }); gsap.set('#camView', { scale: 1, transformOrigin: '50% 50%' });
}
S.doctor = {
  sec: 'Plant Doctor',
  reset() { hide(drSteps, '#solves2'); setP(0, true); gsap.set('.dr-vis', { autoAlpha: 1 }); camReset(); },
  beats: [
    i => { const tl = gsap.timeline(); tl.fromTo('.dr-vis', { autoAlpha: 0, scale: .96 }, { autoAlpha: 1, scale: 1, duration: 1, ease: E }, 0); tl.add(stepTo(0), .2); tl.add(pTo(.2, 4.2), W(i, 'Plant Doctor,')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(stepTo(1), 0); tl.add(pTo(.66, LINES[i].speak + .3, 'none'), 0); return tl; },
    i => { const tl = gsap.timeline(); tl.add(stepTo(2), 0); tl.to(leafCv, { autoAlpha: 0, duration: .6 }, 0); tl.set('#cam', { autoAlpha: 1 }, 0); tl.fromTo('#cam', { opacity: 0 }, { opacity: 1, duration: .6 }, 0);
      tl.fromTo('#camPh', { y: 760 }, { y: 0, duration: 1.3, ease: E2 }, .1); tl.to($$('#camLes circle'), { scale: 1, opacity: 1, duration: 3, ease: 'power1.inOut', stagger: .25 }, .4);
      const f0 = .9; tl.to(camF, { autoAlpha: 1, duration: .2 }, f0); tl.to(camF, { x: 110, y: 250, duration: .45, ease: 'power2.inOut' }, f0 + .1); tl.to(camF, { x: 250, y: 440, duration: .5, ease: 'power2.inOut' }, f0 + .6); tl.to(camF, { x: 128, y: 360, scale: 1, duration: .45, ease: 'back.out(1.6)' }, f0 + 1.15);
      tl.add(() => { $$('#camFocus *').forEach(e => e.setAttribute('stroke', '#A3E68B')); $('#camStatus').textContent = 'LOCKED'; $('#camStatus').setAttribute('fill', '#A3E68B'); }, f0 + 1.6);
      const ts = Math.max(f0 + 2, W(i, 'The app') - .5); tl.to('#shutIn', { scale: .72, transformOrigin: '50% 50%', duration: .12, yoyo: true, repeat: 1 }, ts); tl.to('#camFlash', { opacity: .95, duration: .06 }, ts + .1); tl.to('#camFlash', { opacity: 0, duration: .5 }, ts + .18);
      tl.add(() => { $('#camLeaf').classList.add('frozen'); $('#camStatus').textContent = 'ANALYSING'; }, ts + .15); tl.to('#camView', { scale: .965, duration: .3, yoyo: true, repeat: 1 }, ts + .15); tl.to(['#camShutter', camF], { autoAlpha: 0, duration: .3 }, ts + .3);
      tl.to('#camGrid', { opacity: .55, duration: .4 }, ts + .5); tl.set('#camScan', { opacity: 1 }, ts + .5); tl.fromTo('#camScan', { y: 40 }, { y: 740, duration: 1.8, ease: 'none' }, ts + .5); tl.to(['#camScan', '#camGrid'], { opacity: 0, duration: .4 }, ts + 2.3);
      const C = $$('#clues .clue');
      tl.to($$('#camDet circle'), { scale: 1, duration: .5, ease: 'back.out(2.5)', stagger: .12 }, W(i, 'colour,')); tl.fromTo(C[0], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'colour,'));
      tl.to('#camOutline', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, W(i, 'fullness')); tl.fromTo(C[1], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'fullness'));
      tl.fromTo(C[2], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'light,')); tl.add(() => { $('#camStatus').textContent = '5 CLUES FOUND'; $('#camStatus').setAttribute('fill', '#A3E68B'); }, W(i, 'into clues.'));
      tl.to(C, { scale: 1.03, duration: .2, yoyo: true, repeat: 1, stagger: .1 }, W(i, 'into clues.')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(stepTo(3), 0); tl.to('#camTop', { autoAlpha: 0, duration: .3 }, 0); tl.to('#camSheet', { y: 0, duration: 1, ease: E2 }, .2);
      const t = W(i, 'You make'); tl.to('#tap', { opacity: .35, scale: 1, duration: .15 }, t + .3); tl.to('#tap', { opacity: 0, scale: 2.6, duration: .6 }, t + .45); tl.to('#btnYes', { scale: 1.06, transformOrigin: '50% 50%', duration: .15, yoyo: true, repeat: 1 }, t + .3);
      tl.add(pop('#solves2', { s: .8 }), t); $$('#camPlan .ck').forEach((c, k) => tl.to(c, { opacity: 1, duration: .3 }, W(i, 'step-by-step') + k * .45));
      tl.fromTo('#camToast', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'back.out(2)' }, W(i, 'step-by-step') + 1.6); return tl; }
  ]
};

/* ---------- GUARDIAN PATH + ROOTS ---------- */
const GPN = [['sun', 'Light', 'done'], ['drop', 'Watering', 'done'], ['fungus', 'Leaf fungus', 'now'], ['bug', 'Pests', 'lock'], ['soil', 'Soil health', 'lock'], ['basket', 'Harvest', 'lock']];
const gpTrail = $('#gpPath .trail'); const gpPt = f => { const L = gpTrail.getTotalLength(), p = gpTrail.getPointAtLength(L * f), s = Math.min(560 / 600, 720 / 760); return [p.x * s + (560 - 600 * s) / 2, p.y * s + (720 - 760 * s) / 2]; };
$('#gpNodes').innerHTML = GPN.map(([e, n, s], k) => { const [x, y] = gpPt(k / 5); return `<div class="gpn ${s}" style="left:${x}px;top:${y}px"><i><svg class="ico"><use href="#ic-${e}"/></svg></i><span>${n}</span></div>`; }).join('');
const gpM = { f: 0 }; const gpMojo = () => { const [x, y] = gpPt(gpM.f); gsap.set('#gpMojo', { x: 520 + x - 150, y: 280 + y - 150 }); };
S.grow = {
  sec: 'The app',
  reset() { hide('#rt', $$('#gp > *'), $$('#gpNodes .gpn'), $$('#gpCard .qo'), $$('#gpChips .chip'), $$('#rt > *'), $$('#listings .lst'), '#match', $$('#match > *'), '#opts', $$('#opts .op'), '#comm', $$('#comm .chip')); gsap.set('#gp', { autoAlpha: 1, x: 0 }); gsap.set(gpTrail, { strokeDashoffset: 1 }); gsap.set('#gpPath', { autoAlpha: 1 }); gsap.set('#gpNodes', { autoAlpha: 1 }); gsap.set('#gpChips', { autoAlpha: 1 }); gsap.set($$('.marrow path'), { strokeDashoffset: 1 }); $('#gpCard .qo.ok').classList.remove('on'); gpM.f = 0; gpMojo(); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.gp-head'), 0); tl.fromTo('.gp-ph', { autoAlpha: 0, y: 160 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E2 }, .2); tl.fromTo('.gp-ph img', { scale: 1.12, yPercent: 4 }, { scale: 1, yPercent: 0, duration: 5, ease: 'power1.out' }, .2);
      const t = W(i, 'Guardian Path.'); tl.to(gpTrail, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, t - .4);
      $$('#gpNodes .gpn').forEach((n, k) => tl.fromTo(n, { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2.4)' }, t - .2 + k * .3));
      tl.fromTo('#gpMojo', { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, t + .4); tl.to(gpM, { f: .4, duration: 2, ease: 'power1.inOut', onUpdate: gpMojo }, t + .5);
      tl.fromTo('#gpCard', { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 1, ease: E2 }, W(i, 'identify diseases,')); tl.add(rise($$('#gpCard .qo'), { y: 16, st: .15 }), W(i, 'we teach'));
      tl.add(() => $('#gpCard .qo.ok').classList.add('on'), W(i, 'understand them,')); tl.fromTo('#gpCard .qo.ok', { scale: 1 }, { scale: 1.04, yoyo: true, repeat: 1, duration: .2 }, W(i, 'understand them,'));
      const ch = $$('#gpChips .chip'); [W(i, 'streaks,'), W(i, 'levels'), W(i, 'weekly leagues.')].forEach((tt, k) => tl.add(pop(ch[k], { s: .6 }), tt)); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#gp', { autoAlpha: 0, x: -120, duration: .7, ease: 'power2.in' }, 0); tl.set('#rt', { autoAlpha: 1 }, .3); tl.add(rise('#rtHead', { y: 40 }), W(i, 'For the first') - .3);
      tl.fromTo('.rt-ph', { autoAlpha: 0, y: 200 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E2 }, .4); tl.fromTo('.rt-ph2', { autoAlpha: 0, y: 240, rotation: 12 }, { autoAlpha: 1, y: 0, rotation: 5, duration: 1.3, ease: E2 }, .6); tl.set('#listings', { autoAlpha: 1 }, 0);
      const L = $$('#listings .lst'); L.forEach((l, k) => tl.fromTo(l, { autoAlpha: 0, x: 120 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'the plants') + k * .35));
      tl.fromTo('#listings .lst:first-child', { boxShadow: '0 0 0 0 rgba(11,90,50,0)' }, { boxShadow: '0 0 0 6px rgba(11,90,50,1)', duration: .5 }, W(i, 'find each other.')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#listings', { autoAlpha: 0, x: 60, duration: .5 }, 0); tl.set('#match', { autoAlpha: 1 }, .3); const M = $$('#match > *');
      tl.fromTo(M[0], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: .8, ease: E2 }, W(i, 'too much') - .3); tl.set(M[1], { autoAlpha: 1 }, W(i, 'meets')); tl.to($$('.marrow path'), { strokeDashoffset: 0, duration: .8, ease: 'power2.out', stagger: .4 }, W(i, 'meets'));
      tl.fromTo(M[2], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: .8, ease: E2 }, W(i, 'needs a seedling.') - .2); tl.fromTo(M[3], { autoAlpha: 0, y: 30, scale: .95 }, { autoAlpha: 1, y: 0, scale: 1, duration: .8, ease: 'back.out(1.8)' }, W(i, 'Surplus stops'));
      tl.add(() => { $('#rtHead .h3').innerHTML = 'A whole street becomes <em>a farm</em>.'; }, W(i, 'a whole street') - .3); tl.fromTo('#rtHead .h3', { autoAlpha: .2 }, { autoAlpha: 1, duration: .6 }, W(i, 'a whole street') - .3); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#match', { autoAlpha: 0, y: -30, duration: .5 }, 0); tl.set('#opts', { autoAlpha: 1 }, .3); const O = $$('#opts .op');
      [W(i, 'sell it,'), W(i, 'swap it,'), W(i, 'give it')].forEach((t, k) => tl.fromTo(O[k], { autoAlpha: 0, y: 60, rotation: k - 1 }, { autoAlpha: 1, y: 0, rotation: 0, duration: .8, ease: E2 }, t));
      tl.add(() => { $('#rtHead .h3').innerHTML = 'Strangers become <em>a growing community</em>.'; }, W(i, "Neighbours who've") - .3); tl.fromTo('#rtHead .h3', { autoAlpha: .2 }, { autoAlpha: 1, duration: .6 }, W(i, "Neighbours who've") - .3);
      tl.set('#comm', { autoAlpha: 1 }, 0); const C = $$('#comm .chip'); [W(i, 'advice,'), W(i, 'cuttings and'), W(i, 'harvests,')].forEach((t, k) => tl.add(pop(C[k], { s: .6 }), t)); return tl; }
  ]
};
const rtH0 = $('#rtHead .h3').innerHTML; const _gr = S.grow.reset; S.grow.reset = () => { $('#rtHead .h3').innerHTML = rtH0; _gr(); };

/* ---------- CV PIPELINE ---------- */
const nodes = $$('#pipe .node');
const nodeX = k => nodes[k].offsetLeft + nodes[k].offsetWidth / 2 - 16;
const exg = (() => { const cv = $('#exgCv'), g = cv.getContext('2d'), C = 26, R = 15, px = 20, st = { s: 0 }; const rnd = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(11); const cells = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const dx = (c - 13) / 7, dy = (r - 6) / 5.5, leafy = dx * dx + dy * dy < 1 + rnd() * .35 && r < 11, pot = r >= 11 && Math.abs(c - 13) < 5 - (r - 11) * .3; let col;
    if (leafy) col = `rgb(${40 + rnd() * 50|0},${110 + rnd() * 70|0},${40 + rnd() * 40|0})`; else if (pot) col = `rgb(${120 + rnd() * 30|0},${74 + rnd() * 20|0},${50 + rnd() * 15|0})`; else col = `rgb(${214 + rnd() * 20|0},${204 + rnd() * 18|0},${186 + rnd() * 16|0})`; cells.push({ r, c, leafy, col }); }
  function draw() { g.clearRect(0, 0, cv.width, cv.height); for (const p of cells) { const k = clamp(st.s * 1.4 - p.c / C * .4); g.fillStyle = k > .5 ? (p.leafy ? '#0B5A32' : '#FFFFFF') : p.col; g.fillRect(p.c * px, p.r * px, px - 1, px - 1); }
    if (st.s > 0 && st.s < 1) { const x = (st.s * 1.4 - .2) * C * px; g.fillStyle = '#0B5A32'; g.fillRect(x, 0, 4, cv.height); } }
  draw(); return { st, draw, to: (v, d) => gsap.to(st, { s: v, duration: d, ease: 'none', onUpdate: draw }) }; })();
function travel(pkt, toK, d) { return gsap.fromTo(pkt, { x: nodeX(0), autoAlpha: 1 }, { x: nodeX(toK), duration: d, ease: 'power1.inOut' }); }
S.pipeline = {
  sec: 'Technology',
  reset() { hide('#ppHead', nodes, '#pkt1', '#pkt2', '#pkt3', $$('#rejects .rj'), '#exg'); gsap.set('#ppIntro', { autoAlpha: 0, y: 0, scale: 1 }); gsap.set('#pipePath', { strokeDashoffset: 1 }); nodes.forEach(n => n.classList.remove('hit', 'pass')); exg.st.s = 0; exg.draw(); $('#rejects').style.flexDirection = 'column'; $('#rejects').style.top = '680px'; $('#rejects').style.gap = '14px'; },
  beats: [
    i => { const tl = gsap.timeline(); tl.fromTo('#ppIntro', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E }, .1); tl.fromTo('#ppIntro em', { color: '#0A0A0A' }, { color: '#0B5A32', duration: .8 }, W(i, 'real.')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#ppIntro', { autoAlpha: 0, y: -60, scale: .9, duration: .6, ease: 'power2.in' }, 0); tl.add(rise('#ppHead'), .4);
      tl.add(rise(nodes, { y: 50, st: .12 }), W(i, 'computer-vision') - .5); tl.add(drawIn('#pipePath', 1.8), W(i, 'computer-vision'));
      tl.add(travel($('#pkt1'), 6, 2.6), W(i, 'runs right')); tl.add(() => nodes[6].classList.add('pass'), W(i, 'runs right') + 2.6); tl.fromTo(nodes[6], { scale: 1 }, { scale: 1.08, yoyo: true, repeat: 1, duration: .25 }, W(i, 'runs right') + 2.6); return tl; },
    i => { const tl = gsap.timeline(); tl.set('#pkt1', { autoAlpha: 0 }, 0); nodes[6].classList.remove('pass');
      const t1 = W(i, 'An Excess'); tl.add(() => nodes[2].classList.add('pass'), t1); tl.add(rise('#exg', { y: 30 }), t1); tl.add(exg.to(1, 2.4), t1 + .4);
      const t2 = W(i, 'A perceptual'); tl.add(travel($('#pkt2'), 3, 1.4), t2); tl.add(() => nodes[3].classList.add('hit'), t2 + 1.4); tl.to('#pkt2', { scale: 0, duration: .3 }, t2 + 1.4); tl.add(rise('#rj2', { y: 16 }), t2 + 1.3);
      const t3 = W(i, 'Blur detection'); tl.add(travel($('#pkt3'), 1, .9), t3); tl.add(() => nodes[1].classList.add('hit'), t3 + .9); tl.to('#pkt3', { scale: 0, duration: .3 }, t3 + .9); tl.add(rise('#rj1', { y: 16 }), t3 + .8);
      const t4 = W(i, "You can't"); tl.add(travel($('#pkt1'), 6, 2), t4 - .6); tl.add(() => nodes[6].classList.add('pass'), t4 + 1.4); tl.add(rise('#rj3', { y: 16 }), t4 + 1.2); return tl; }
  ]
};

/* ---------- OUR MODEL ---------- */
(function () {
  const leafSvg = (k) => { const t = [['#E4F0E8', '#0B5A32', 0], ['#F4E2B3', '#8A5A00', 3], ['#E4F0E8', '#0B5A32', 2], ['#F1D7C8', '#984421', 4]][k % 4]; return `<svg viewBox="0 0 40 40"><path d="M6 34C8 16 18 6 34 6c0 16-10 26-28 28z" fill="${t[0]}" stroke="${t[1]}" stroke-width="2"/><path d="M8 32 30 10" stroke="${t[1]}" stroke-width="1.6"/>${Array.from({ length: t[2] }, (_, j) => `<circle cx="${16 + j * 4}" cy="${22 - j * 3}" r="2" fill="${t[1]}"/>`).join('')}</svg>`; };
  $('#mdData').innerHTML = Array.from({ length: 25 }, (_, k) => `<i>${leafSvg(k * 7 % 11)}</i>`).join('');
  const H = [440, 380, 320, 270, 220, 170, 130, 96]; $('#mdNet').innerHTML = H.map((h, k) => `<div class="blk${k % 3 === 1 ? ' g' : ''}" style="width:${54 - k * 3}px;height:${h}px"></div>`).join('');
  let w = ''; for (let a = 0; a < 6; a++) for (let b = 0; b < 3; b++) w += `<path pathLength="1" d="M400 ${60 + a * 66}C470 ${60 + a * 66} 470 ${100 + b * 130} 540 ${100 + b * 130}"/>`;
  for (let b = 0; b < 4; b++) w += `<path pathLength="1" d="M1180 230C1240 230 1240 ${75 + b * 112} 1300 ${75 + b * 112}"/>`;
  $('#mdWires').innerHTML = w;
})();
const confSet = (v) => { const f = $('#confFill'); f.style.transform = `scaleX(${v})`; f.style.background = v >= .7 ? 'var(--green)' : 'var(--alert)'; };
S.model = {
  sec: 'Technology',
  reset() { hide('.md-head', $$('#mdData i'), $$('#mdNet .blk'), $$('#mdOut > div'), $$('.ml'), '#mdDevice'); gsap.set('#mdFlow', { autoAlpha: 1, scale: 1, y: 0 }); gsap.set($$('#mdWires path'), { strokeDashoffset: 1, strokeDasharray: 1 }); gsap.set($$('#mdOut i'), { scaleX: 0 }); $('.quant .num.g').textContent = '32'; confSet(0); $('#confRead').innerHTML = '&nbsp;'; },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.md-head'), 0); const t = W(i, 'We fine-tuned');
      tl.fromTo($$('#mdData i'), { autoAlpha: 0, scale: .3 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2)', stagger: { each: .04, grid: [5, 5], from: 'random' } }, W(i, 'own trained') - .2); tl.add(rise('#ml1', { y: 14 }), W(i, 'hundreds'));
      tl.add(drawIn($$('#mdWires path').slice(0, 18), 1.2), t - .4); tl.fromTo($$('#mdNet .blk'), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: .8, ease: E2, stagger: .09 }, t); tl.add(rise('#ml2', { y: 14 }), t + .4);
      tl.add(drawIn($$('#mdWires path').slice(18), .8), t + 1.2); tl.add(rise($$('#mdOut > div'), { y: 16, st: .12 }), t + 1.5); tl.to($$('#mdOut i'), { scaleX: k => [.82, .58, .7, .9][k], duration: 1.2, ease: E2, stagger: .12 }, t + 1.8); tl.add(rise('#ml3', { y: 14 }), t + 2.2);
      tl.to($$('#mdNet .blk'), { scaleY: 1.06, duration: .3, yoyo: true, repeat: 3, stagger: .06, ease: 'sine.inOut' }, t + 2.4); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#mdFlow', { autoAlpha: 0, scale: .55, y: -40, duration: .9, ease: 'power3.in' }, 0); tl.fromTo('#mdDevice', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, .6);
      const q = $('.quant .num.g'), t = W(i, 'eight-bit'); const qo = { v: 32 }; tl.to(qo, { v: 8, duration: 1, ease: 'power2.inOut', onUpdate: () => q.textContent = Math.round(qo.v) }, t);
      const c = { v: 0 }; tl.to(c, { v: .9, duration: 1.2, ease: E2, onUpdate: () => confSet(c.v) }, W(i, 'calibrated')); tl.add(() => $('#confRead').innerHTML = 'Confident → <b>shows its clues</b>', W(i, 'calibrated') + .6);
      tl.to(c, { v: .32, duration: 1.2, ease: 'power2.inOut', onUpdate: () => confSet(c.v) }, W(i, 'When it')); tl.add(() => $('#confRead').innerHTML = 'Unsure → <b style="color:var(--alert)">asks for a retake</b>', W(i, 'asks')); return tl; }
  ]
};

/* ---------- ROOTS MARKETPLACE ---------- */
(function () { const s = 85, cx = 450, cy = 410, hx = []; for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) { if (Math.abs(q + r) > 2) continue; hx.push([cx + s * Math.sqrt(3) * (q + r / 2), cy + s * 1.5 * r]); }
  const hex = ([x, y]) => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 180 * (60 * k - 30); return `${(x + (s - 4) * Math.cos(a)).toFixed(1)},${(y + (s - 4) * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const growers = [0, 2, 4, 6, 9, 11, 13, 15, 17], me = 9; const arcs = [[9, 4], [9, 13], [2, 9], [15, 11], [6, 0], [17, 13]];
  let h = hx.map((p, k) => `<polygon class="hx${k === me ? ' me' : ''}" points="${hex(p)}" pathLength="1"/>`).join('');
  h += arcs.map(([a, b]) => { const [x1, y1] = hx[a], [x2, y2] = hx[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 90; return `<path class="arc" pathLength="1" d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}"/><circle class="ad" r="9"><animateMotion dur="2.4s" repeatCount="indefinite" path="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}"/></circle>`; }).join('');
  h += growers.map(k => `<g class="gw" transform="translate(${hx[k][0]} ${hx[k][1]})"><circle r="30"/><path d="M-12 1l8 8 16-17"/></g>`).join('');
  h += `<text class="melab" x="${hx[me][0]}" y="${hx[me][1] + 62}" text-anchor="middle">YOUR NEIGHBOURHOOD</text>`;
  $('#mkMap').innerHTML = `<style>.hx{fill:#fff;stroke:#0A0A0A;stroke-width:2.5;stroke-dasharray:1;stroke-dashoffset:1}.hx.me{fill:#E4F0E8;stroke:#0B5A32;stroke-width:4}.arc{fill:none;stroke:#0B5A32;stroke-width:3.5;stroke-dasharray:1;stroke-dashoffset:1}.ad{fill:#0B5A32;opacity:0}.gw circle{fill:#0B5A32}.gw path{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.melab{font-family:'DM Mono',monospace;font-size:21px;letter-spacing:2px;fill:#0B5A32;font-weight:500}</style>` + h; })();
S.market = {
  sec: 'Roots community',
  reset() { gsap.set($$('#mkMap .hx'), { strokeDashoffset: 1 }); $$('#mkMap .hx').forEach(x => x.classList.remove('lit')); gsap.set($$('#mkMap .arc'), { strokeDashoffset: 1 }); hide($$('#mkMap .gw'), $$('#mkMap .ad'), '#mkMap .melab', $$('.mk-right > *'), $$('#mkList li')); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise($$('.mk-right > .eyebrow, .mk-right > .h3'), { st: .12 }), 0); tl.to($$('#mkMap .hx'), { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut', stagger: { each: .05, from: 'center' } }, .1);
      tl.set('#mkList', { autoAlpha: 1 }, 0); tl.add(rise('#mkMap .melab', { y: 10 }), .9);
      tl.fromTo($$('#mkMap .gw'), { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2.4)', stagger: .1 }, W(i, 'verified Plant-Days,'));
      tl.to($$('#mkMap .arc'), { strokeDashoffset: 0, duration: 1, ease: 'power2.out', stagger: .2 }, W(i, 'who can')); tl.to($$('#mkMap .ad'), { autoAlpha: 1, duration: .3, stagger: .2 }, W(i, 'who can') + .8);
      const L = $$('#mkList li'); [W(i, 'Every listing'), W(i, 'neighbourhood level,')].forEach((t, k) => tl.fromTo(L[k], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, t)); return tl; },
    i => { const tl = gsap.timeline(), L = $$('#mkList li'), HX = $$('#mkMap .hx'); tl.fromTo(L[2], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'street by'));
      const order = HX.map((x, k) => [x, Math.hypot(+x.getAttribute('points').split(' ')[0].split(',')[0] - 450, +x.getAttribute('points').split(' ')[0].split(',')[1] - 410)]).sort((a, b) => a[1] - b[1]).map(a => a[0]);
      order.forEach((x, k) => tl.add(() => x.classList.add('lit'), W(i, 'street by') + .4 + k * .28)); tl.to($$('#mkMap .gw'), { scale: 1.15, yoyo: true, repeat: 1, duration: .3, stagger: .1 }, W(i, 'grows itself.')); return tl; }
  ]
};

/* ---------- BUILT + KAIZEN ---------- */
const kz = { a: 0 }, kzSet = () => {};

S.built = {
  sec: 'Implementation',
  reset() { hide('.bt-eye', '.bt-h', $$('#tiles .tile'), '#kaizen', $$('#kaizen .kz')); gsap.set('#tiles', { autoAlpha: 1, y: 0 }); zero('#s-built'); kz.a = 0; kzSet(); },
  beats: [
    i => { const tl = gsap.timeline(), T = $$('#tiles .tile'); tl.add(rise(['.bt-eye', '.bt-h'], { st: .12 }), 0);
      [W(i, 'SwiftUI on'), W(i, 'Seventy-one'), W(i, '167'), W(i, '167') + 2.2].forEach((t, k) => { tl.fromTo(T[k], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, t); const n = $('[data-n]', T[k]); tl.add(count(n, +n.dataset.n, k === 1 ? 2.4 : 1.6), t + .2);
        const v = $$('.viz > *', T[k]); if (k === 0) tl.fromTo(v, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'back.out(2)', stagger: .2 }, t + .3); if (k === 1) tl.fromTo(v, { scaleX: 0 }, { scaleX: 1, duration: .6, ease: E2, stagger: .12 }, t + .3); if (k === 2) tl.fromTo(v, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .25, stagger: .009 }, t + .2); if (k === 3) tl.fromTo(v, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .3, stagger: { each: .012, from: 'random' } }, t + .2); }); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#tiles', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, 0); tl.to('.bt-h', { autoAlpha: 0, duration: .4 }, 0); tl.fromTo('#kaizen', { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: E2 }, .4);
      const K = $$('#kaizen .kz'); [W(i, 'real hands'), W(i, 'watched where'), W(i, 'simplified'), W(i, 'tested again')].forEach((t, k) => { tl.to(kz, { a: (k + 1) / 4, duration: 1.4, ease: 'power2.inOut', onUpdate: kzSet }, Math.max(.6, t - .4)); tl.fromTo(K[k], { autoAlpha: 0, x: k === 0 || k === 3 ? -40 : 40 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, Math.max(.8, t)); }); return tl; }
  ]
};

/* ---------- PILOT: a plant grows through the pilot while the numbers land ---------- */
const NW = PILOT.weeks || 13;
$('#plCal').innerHTML = Array.from({ length: NW }, () => `<div>${'<i></i>'.repeat(7)}</div>`).join('');
const calCells = []; $$('#plCal div').forEach(c => calCells.push(...$$('i', c)));
(function () { let s = `<path d="M240 500h160l-20 56H260z" fill="#fff" stroke="#0A0A0A" stroke-width="5" stroke-linejoin="round"/><path d="M220 500h200" stroke="#0A0A0A" stroke-width="6" stroke-linecap="round"/><path id="plStem" d="M320 500V480" fill="none" stroke="#0B5A32" stroke-width="7" stroke-linecap="round"/>`;
  for (let k = 0; k < 8; k++) { const sd = k % 2 ? 1 : -1; s += `<g class="pll" data-k="${k}"><path d="M0 0c${sd * 30} -38 ${sd * 84} -44 ${sd * 118} -30c${sd * -24} 40 ${sd * -80} 50 ${sd * -118} 30z" fill="#E4F0E8" stroke="#0B5A32" stroke-width="4" stroke-linejoin="round"/></g>`; }
  s += `<g id="plFlower"><circle r="16" fill="#D9A92E"/>${Array.from({ length: 6 }, (_, k) => `<ellipse rx="13" ry="24" fill="#fff" stroke="#0B5A32" stroke-width="3" transform="rotate(${k * 60}) translate(0 -26)"/>`).join('')}<circle r="12" fill="#D9A92E"/></g>`;
  $('#plPlant').innerHTML = s; })();
const PW = { w: 0 };
function plSet() { const w = PW.w, h = 20 + w / NW * 400, top = 500 - h; $('#plStem').setAttribute('d', `M320 500C${316 + Math.sin(w) * 6} ${500 - h * .5} ${324} ${500 - h * .8} 320 ${top}`);
  $$('#plPlant .pll').forEach(g => { const k = +g.dataset.k, at = (k + .6) * NW / 9, s = clamp((w - at) / 1.4), y = 470 - (k + 1) * (h / 9.2); g.setAttribute('transform', `translate(320 ${y}) scale(${(.95 - k * .05) * s + .001})`); });
  const fs = clamp((w - NW + .8) / .8); $('#plFlower').setAttribute('transform', `translate(320 ${top - 10}) scale(${fs + .001})`);
  $('#plWk').textContent = Math.max(1, Math.ceil(w)); calCells.forEach((c, k) => c.classList.toggle('on', k < w * 7)); }
const pk = k => $$(`#plM [data-k="${k}"]`).filter(e => !e.classList.contains('ring'));
function plCount(tl, k, t, d = 1.6) { pk(k).forEach(e => tl.add(count(e, PILOT[k] || 0, d), t)); const r = $(`#plM .ring[data-k="${k}"] .rf`); if (r) tl.to(r, { strokeDashoffset: 100 - (PILOT[k] || 0), duration: d + .4, ease: E2 }, t); }
function drawChart() {
  const svg = $('#ccSvg'), W0 = 1500, H0 = 560, P = { l: 120, r: 40, t: 30, b: 70 }, vals = PILOT.curve || [], n = Math.max(2, vals.length);
  const lo = Math.max(0, Math.floor((Math.min(...vals, 100) - 15) / 10) * 10), hi = 100;
  const X = k => P.l + k / (n - 1) * (W0 - P.l - P.r), Y = v => P.t + (1 - (v - lo) / (hi - lo)) * (H0 - P.t - P.b);
  let s = `<style>.ax{stroke:#0A0A0A;stroke-width:2.5;fill:none}.gl{stroke:rgba(10,10,10,.12);stroke-width:1.5}.tx{font-family:'DM Mono',monospace;font-size:22px;fill:#0A0A0A;letter-spacing:1px}.ln{fill:none;stroke:#0B5A32;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}.lim{stroke:#0A0A0A;stroke-width:2.5;stroke-dasharray:10 8}.cl{stroke:#984421;stroke-width:3}.pt{fill:#0B5A32;stroke:#fff;stroke-width:4}</style>`;
  for (let v = lo; v <= hi; v += 10) s += `<line class="gl" x1="${P.l}" x2="${W0 - P.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="tx" x="${P.l - 16}" y="${Y(v) + 8}" text-anchor="end">${v}%</text>`;
  for (let k = 0; k < n; k++) s += `<text class="tx" x="${X(k)}" y="${H0 - P.b + 42}" text-anchor="middle">W${k + 1}</text>`;
  s += `<path class="ax" d="M${P.l} ${P.t}V${H0 - P.b}H${W0 - P.r}"/>`;
  if (vals.length) { const m = vals.reduce((a, b) => a + b, 0) / vals.length, sd = Math.sqrt(vals.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, vals.length - 1)), u = Math.min(hi, m + 3 * sd), l = Math.max(lo, m - 3 * sd);
    s += `<line class="lim" x1="${P.l}" x2="${W0 - P.r}" y1="${Y(u)}" y2="${Y(u)}"/><line class="lim" x1="${P.l}" x2="${W0 - P.r}" y1="${Y(l)}" y2="${Y(l)}"/><line class="cl" x1="${P.l}" x2="${W0 - P.r}" y1="${Y(m)}" y2="${Y(m)}"/>`;
    s += `<path class="ln" id="ccLine" pathLength="1" d="M${vals.map((v, k) => `${X(k)} ${Y(v)}`).join('L')}"/>` + vals.map((v, k) => `<circle class="pt" cx="${X(k)}" cy="${Y(v)}" r="11"/>`).join(''); }
  svg.innerHTML = s; $('.cc-key').innerHTML = '<span><i class="k1"></i>Weekly survival</span><span><i class="k2"></i>Control limits (±3σ)</span><span><i class="k3"></i>Centre line (mean)</span>';
}
drawChart();
S.pilot = {
  sec: 'The pilot',
  reset() { PW.w = 0; plSet(); hide('.pl-head', '#plGrow', $$('#plM .m'), '#cchart', '.pl-src'); gsap.set('#plM', { autoAlpha: 1, y: 0 }); $$('#plM .num[data-k], #plM span[data-k]').forEach(e => e.textContent = '0'); gsap.set($$('#plM .rf'), { strokeDashoffset: 100 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.pl-head'), 0); tl.fromTo('#plGrow', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, .2); tl.to(PW, { w: NW, duration: LINES[i].speak - .6, ease: 'none', onUpdate: plSet }, .6);
      tl.add(rise('.pl-src', { y: 10 }), 1); tl.add(rise('#plM .m1'), W(i, '{users}') - .3); plCount(tl, 'users', W(i, '{users}')); plCount(tl, 'plants', W(i, '{plants}')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#plM .m2'), 0); plCount(tl, 'plantDays', .2, 2.6); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#plM .m3'), 0); plCount(tl, 'weekly', W(i, '{weekly}')); plCount(tl, 'survival', W(i, '{survival}')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#plM .m4'), 0); plCount(tl, 'flags', W(i, '{flags}')); plCount(tl, 'trades', W(i, '{trades}')); return tl; },
    i => { const tl = gsap.timeline(); tl.to(['#plGrow', '#plM'], { autoAlpha: 0, y: -30, duration: .6, ease: 'power2.in' }, 0); tl.fromTo('#cchart', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, .5); const ln = $('#ccLine');
      if (ln) { tl.fromTo(ln, { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 3.4, ease: 'power1.inOut' }, 1); tl.fromTo($$('#ccSvg .pt'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .4, ease: 'back.out(3)', stagger: 3.4 / (PILOT.curve.length) }, 1); } return tl; }
  ]
};

/* ---------- PILOT → FORECAST: what 186 users taught us ---------- */
$('#lnUsers').innerHTML = '<i></i>'.repeat(PILOT.users || 186); $('.lnN').textContent = (PILOT.users || 186).toLocaleString('en-SG');
const lnU = $$('#lnUsers i');
S.learn = {
  sec: 'What we learned',
  reset() { hide('.ln-head', $$('#lnCards .lc'), '#lnQ'); lnU.forEach(u => u.classList.remove('on')); gsap.set(lnU, { scale: 0 }); gsap.set($$('#lnFlow path'), { strokeDashoffset: 1 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.ln-head'), 0); tl.to(lnU, { scale: 1, duration: .35, ease: 'back.out(3)', stagger: { each: .008, grid: [14, 14], from: 'start' } }, .3);
      const t = W(i, 'Every check-in,'); lnU.forEach((u, k) => tl.add(() => u.classList.add('on'), t + (k / lnU.length) * 3.4)); tl.to($$('#lnFlow path'), { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .25 }, W(i, 'how people')); return tl; },
    i => { const tl = gsap.timeline(), C = $$('#lnCards .lc'); [W(i, 'which reminders'), W(i, 'which problems'), W(i, 'how fast')].forEach((t, k) => tl.fromTo(C[k], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: .9, ease: E2 }, t));
      tl.fromTo('#lnQ', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, W(i, 'So where')); return tl; }
  ]
};

/* ---------- FORECAST: Monte Carlo ---------- */
const HS = { h: 0, m: 0 };
function drawHist() {
  const cv = $('#hist'), g = cv.getContext('2d'), W0 = cv.width, H0 = cv.height, P = { l: 40, r: 30, t: 40, b: 110 }, c = RWSIM.hist.counts, mx = Math.max(...c.slice(1)), n = c.length, bw = (W0 - P.l - P.r) / n;
  g.clearRect(0, 0, W0, H0); g.font = "500 34px 'DM Mono', monospace"; g.textAlign = 'center';
  for (let k = 0; k < n; k++) { const kk = clamp(HS.h * 1.6 - k / n * .6), v = Math.min(c[k], mx * 1.05); if (kk <= 0) continue; const h = v / (mx * 1.05) * (H0 - P.t - P.b) * kk, x = P.l + k * bw;
    g.fillStyle = (k * 100 <= 1814 && 1814 < (k + 1) * 100) ? '#0A0A0A' : '#0B5A32'; g.globalAlpha = k === 0 ? .25 : 1; g.fillRect(x + 2, H0 - P.b - h, bw - 4, h); g.globalAlpha = 1;
    if (HS.h < 1) { const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(k + 9); for (let d = 0; d < 4; d++) { const f = (HS.h * 6 + R()) % 1, yy = P.t + f * (H0 - P.b - h - P.t); if (yy < H0 - P.b - h - 6) { g.fillStyle = '#0B5A32'; g.globalAlpha = .7 * (1 - HS.h); g.beginPath(); g.arc(x + bw / 2, yy, 5, 0, 7); g.fill(); g.globalAlpha = 1; } } } }
  g.strokeStyle = '#0A0A0A'; g.lineWidth = 4; g.beginPath(); g.moveTo(P.l, H0 - P.b); g.lineTo(W0 - P.r, H0 - P.b); g.stroke(); g.fillStyle = '#0A0A0A';
  for (let v = 0; v <= 6000; v += 1000) { const x = P.l + v / 100 * bw; g.fillText(v.toLocaleString('en-SG'), x, H0 - P.b + 48); }
  g.fillText('EXTRA PLANTS ALIVE AT 12 MONTHS · YEAR 3', W0 / 2, H0 - 14);
  if (HS.m > 0) { g.globalAlpha = HS.m; [[1464, 'MEDIAN 1,464', '#0A0A0A', [14, 10]], [1814, 'BASE CASE 1,814', '#0B5A32', []]].forEach(([v, l, col, dash], j) => { const x = P.l + v / 100 * bw; g.strokeStyle = col; g.lineWidth = 6; g.setLineDash(dash); g.beginPath(); g.moveTo(x, H0 - P.b); g.lineTo(x, P.t + 60 + j * 90); g.stroke(); g.setLineDash([]); g.fillStyle = col; g.textAlign = 'left'; g.font = "500 38px 'DM Mono', monospace"; g.fillText(l, x + 16, P.t + 74 + j * 90); g.textAlign = 'center'; g.font = "500 34px 'DM Mono', monospace"; }); g.globalAlpha = 1; }
}
S.forecast = {
  sec: 'The forecast',
  reset() { HS.h = 0; HS.m = 0; drawHist(); hide($$('.fc-left > *'), '#fcBig', '#ladder', '#histNotes', $$('#fcM .tagchip'), $$('#fcM .fg')); gsap.set('#hist', { autoAlpha: 1 }); gsap.set($$('#ladder .rung i'), { scaleY: 0 }); hide($$('#ladder .rung b, #ladder .rung span')); $('#runsN').textContent = '0'; zero('#fcBig'); gsap.set('#fcRuns', { autoAlpha: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise($$('.fc-left > .eyebrow, #fcH'), { st: .12 }), 0); tl.add(rise('#fcRuns'), W(i, 'Monte Carlo') - .3); const ML = $$('#fcM .mlc'), FC = $$('#fcM .fc'), FG = $$('#fcM .fg'); tl.add(rise(FG[0], { y: 10 }), W(i, 'keeps retraining') - .2); tl.fromTo(ML, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2)', stagger: .18 }, W(i, 'machine-learning')); tl.add(rise(FG[1], { y: 10 }), W(i, 'feeds a') - .2); [W(i, 'Monte Carlo'), W(i, 'Sobol')].forEach((t, k) => tl.add(pop(FC[k], { s: .6 }), t)); tl.fromTo(FC.slice(2), { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(2)', stagger: .2 }, W(i, 'and more,')); const t = W(i, 'one hundred');
      tl.to(HS, { h: 1, duration: 5.5, ease: 'power1.inOut', onUpdate: drawHist }, t - .8); tl.add(count($('#runsN'), 100000, 5.5), t - .8); tl.add(rise('.fc-left > .src', { y: 10 }), t); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#hist', { autoAlpha: 0, duration: .5 }, 0); tl.to('.fc-left > .src', { autoAlpha: 0, duration: .4 }, 0); tl.set('#ladder', { autoAlpha: 1 }, .3); const R = $$('#ladder .rung');
      [W(i, 'Two pilot'), W(i, 'twenty in'), W(i, 'sixty by')].forEach((t, k) => { tl.to($('i', R[k]), { scaleY: 1, duration: 1.2, ease: E2 }, t); tl.add(rise($$('b, span', R[k]), { y: 14, st: .1 }), t + .3); }); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#ladder', { autoAlpha: 0, duration: .5 }, 0); tl.to('#hist', { autoAlpha: 1, duration: .6 }, .3); tl.add(() => { HS.h = 1; drawHist(); }, .3); tl.to(HS, { m: 1, duration: 1, onUpdate: drawHist }, .8);
      tl.to('#fcRuns', { autoAlpha: 0, y: -20, duration: .5 }, 0); tl.set('#fcBig', { autoAlpha: 1 }, .4); const B = $$('#fcBig > div'); tl.add(rise(B[0]), .4); tl.add(count($('[data-n]', B[0]), 1814, 1.8), .5);
      const t = W(i, 'three point three'); tl.add(rise(B[1]), t - .3); tl.add(count($('[data-n]', B[1]), 3.3, 1.4, 1), t); tl.add(rise('#histNotes', { y: 16 }), t + 1.5); tl.to('.fc-left > .src', { autoAlpha: 0, duration: .4 }, t + 1.2); return tl; }
  ]
};
$$('#fcBig .num').forEach(n => n.style.fontSize = '140px');

/* ---------- SUSTAIN ---------- */
$$('#pillars svg > *').forEach(e => { e.setAttribute('pathLength', 1); e.style.strokeDasharray = 1; }); $$('#pillars svg').forEach(s => s.style.cssText = 'width:120px;height:120px');
S.sustain = {
  sec: 'Sustainability',
  reset() { hide('.su-eye', '.su-h', $$('#pillars .pl'), '#suBand'); zero('#s-sustain'); },
  beats: [
    i => { const tl = gsap.timeline(), P = $$('#pillars .pl'); tl.add(rise(['.su-eye', '.su-h'], { st: .12 }), 0);
      [W(i, 'The models'), W(i, 'schools run'), W(i, 'and every street')].forEach((t, k) => { tl.fromTo(P[k], { autoAlpha: 0, y: 90, rotation: k - 1 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 1, ease: E2 }, t); tl.fromTo($$('svg > *', P[k]), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .15 }, t + .2); });
      const t = W(i, 'keeps its own') + .6; tl.add(rise('#suBand', { y: 30 }), t); tl.add(count($('#suBand [data-n]'), 48000, 1.6), t + .2); return tl; }
  ]
};

/* ---------- CLOSE ---------- */
(function () { const B = 380; $('#clPanSvg').innerHTML = `<path d="M130 ${B}h140l-18 40h-104z" fill="#fff" stroke="#0A0A0A" stroke-width="5" stroke-linejoin="round"/>` + [-38, -24, -10, 4, 18, 32, 44].map((a, i) => { const r = a * Math.PI / 180, L = 230 + (i % 3) * 40, tx = 200 + Math.sin(r) * L, ty = B - Math.cos(r) * L, nx = Math.cos(r) * 13, ny = Math.sin(r) * 13; return `<path class="blade" pathLength="1" d="M${200 - nx} ${B - ny}Q${(200 + tx) / 2 - nx * 1.4} ${(B + ty) / 2 - ny * 1.4} ${tx} ${ty}Q${(200 + tx) / 2 + nx * 1.4} ${(B + ty) / 2 + ny * 1.4} ${200 + nx} ${B + ny}z" fill="#E4F0E8" stroke="#0B5A32" stroke-width="4" stroke-linejoin="round"/>`; }).join(''); })();
S.close = {
  chrome: false,
  reset() { F2 = F2 || Field($('#field2'), 43, 20, { keep: true, seed: 31 }); Object.assign(F2.st, { a: 0, g: 0, d: 0, ok: 0 }); F2.draw(); hide('#clMission', '#clImagine', '#clQuote', $$('#clQuote p'), '#clEnd', '#clNames', '#clThanks', '#clPandan'); gsap.set($$('#clPanSvg .blade'), { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 }); gsap.set('#field2', { autoAlpha: 1 }); gsap.set($$('#clEnd .alive path'), { strokeDashoffset: 1 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(F2.tween({ a: 1 }, 2.6), .1); tl.add(rise('#clImagine', { y: 50, d: 1.1 }), W(i, 'Imagine')); tl.add(F2.tween({ g: 1 }, 3), W(i, 'Imagine') + .2); tl.add(F2.tween({ ok: 1 }, 2.4), W(i, 'actually see')); return tl; },
    i => { const tl = gsap.timeline(); tl.to(['#clImagine', '#field2'], { autoAlpha: 0, duration: .8 }, 0); tl.set('#clMission', { autoAlpha: 1 }, .3);
      tl.fromTo($$('#clMission > .eyebrow, #clMission > .h1'), { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E, stagger: .2 }, .4); tl.fromTo('#clMission em', { color: '#0A0A0A' }, { color: '#0B5A32', duration: 1 }, W(i, 'a nation')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#clMission', { autoAlpha: 0, y: -40, duration: .6 }, 0); const q = $$('#clQuote p'); tl.set('#clQuote', { autoAlpha: 1, y: 0 }, .3);
      tl.fromTo(q[0], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E }, .4); tl.fromTo(q[1], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E }, W(i, 'It dies'));
      const t = W(i, "We're Rooted"); tl.fromTo('#clQuote p:nth-child(2) em', { color: '#0B5A32' }, { color: '#984421', duration: .6 }, W(i, "Singapore can't")); tl.to('#clQuote', { autoAlpha: 0, y: -40, duration: .6 }, W(i, "so we'll") - .1); tl.fromTo('#clEnd', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, W(i, "so we'll"));
      tl.add(drawIn($('#clEnd .alive .ul path'), 1, 'power2.out'), W(i, 'every plant that')); $$('#clEnd .alive .sp path').forEach((p, k) => tl.add(drawIn(p, .5, 'power2.out'), W(i, 'its own future.') + k * .25));
      tl.add(rise('#clNames', { y: 20 }), t); tl.add(rise('#clThanks', { y: 30, d: 1.2 }), W(i, 'Thank you.')); return tl; }
  ]
};


/* =====================================================================
   ROOTSTAKE · four scenes. The CAD scenes and the tissue animation are driven by one number, p (0-1),
   tweened to the words of each line.
   ===================================================================== */
const rsTo = (sel, v, d = 2.6, ease = 'sine.inOut') => { const cv = $(sel), o = { v: parseFloat(cv.dataset.p || 0) }; return gsap.to(o, { v, duration: d, ease, onUpdate: () => { cv.dataset.p = o.v.toFixed(4); } }); };
const rsSet = (sel, v) => { const cv = $(sel); cv.dataset.p = v; if (cv.__tissue) cv.__tissue.setP(v); };
const rsIn = (n, tl, i) => { tl.fromTo('#rs' + n + 'V', { autoAlpha: 0, x: -120 }, { autoAlpha: 1, x: 0, duration: 1.2, ease: E2 }, 0); tl.add(rise($$('#rs' + n + 'T > .eyebrow, #rs' + n + 'T > .h2'), { st: .15 }), .3); };
const rsPts = (n, tl, i, words, at) => $$('#rs' + n + 'T .rs-pt').forEach((e, k) => { if (words[k]) { const t = Math.max(.2, W(i, words[k]) - .2); tl.fromTo(e, { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, t); tl.fromTo($('svg', e), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: .6, ease: 'back.out(2.2)' }, t + .1); } });
S.rs1 = { sec: 'RootStake', reset() { hide('#rs1V', $$('#rs1V figure'), $$('#rs1T > *'), $$('#rs1T .rs-pt'), $$('#rs1T .tr')); },
  beats: [
    i => { const tl = gsap.timeline(); tl.set('#rs1V', { autoAlpha: 1 }, 0); tl.fromTo('#rs1V .f1', { autoAlpha: 0, clipPath: 'inset(0 100% 0 0 round 28px)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0 round 28px)', duration: 1.5, ease: 'power3.inOut' }, .1); tl.fromTo('#rs1V .f1 img', { scale: 1.25 }, { scale: 1.04, duration: 16, ease: 'power1.out' }, .1); tl.add(rise($$('#rs1T > .eyebrow, #rs1T > .h2'), { st: .15 }), .5); return tl; },
    i => { const tl = gsap.timeline(), r = $$('#rs1T .rs-pt'); tl.set('#rs1T > *', { autoAlpha: 1 }, 0); tl.set(r, { autoAlpha: 0 }, 0); tl.set($$('#rs1T .tr'), { autoAlpha: 0 }, 0); [['house module', 0], ['soil probe', 1]].forEach(([w, k]) => tl.fromTo(r[k], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, w) - .2));
      ['f2', 'f3'].forEach((f, k) => { const t = W(i, k ? 'tube that' : 'soil probe') - .2; tl.fromTo('#rs1V .' + f, { autoAlpha: 0, clipPath: 'inset(100% 0 0 0 round 28px)' }, { autoAlpha: 1, clipPath: 'inset(0% 0 0 0 round 28px)', duration: 1.2, ease: 'power3.inOut' }, t); tl.fromTo('#rs1V .' + f + ' img', { scale: 1.3 }, { scale: 1.05, duration: 12, ease: 'power1.out' }, t); tl.fromTo('#rs1V .' + f + ' figcaption', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .6 }, t + .9); }); tl.fromTo(r[2], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'tube that') + .2); return tl; },
    i => { const tl = gsap.timeline(), t = $$('#rs1T .tr'); tl.set('#rs1T > *', { autoAlpha: 1 }, 0); tl.set(t, { autoAlpha: 0 }, 0); [['house, the', 0], ['in progress', 1], ['ion sensing', 2]].forEach(([w, k]) => { const at = W(i, w) - .2; tl.fromTo(t[k], { autoAlpha: 0, y: 40, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .9, ease: 'back.out(1.6)' }, at); tl.fromTo(t[k], { boxShadow: '0 0 0 0 rgba(11,90,50,.45)' }, { boxShadow: '0 0 0 26px rgba(11,90,50,0)', duration: 1.2, ease: 'power2.out' }, at + .3); }); return tl; }
  ] };
S.rs2 = { sec: 'RootStake', reset() { hide('#rs2V', '#rs2Sig', $$('#rs2T > *'), $$('#rs2T .rs-pt')); rsSet('#rs2Cv', .06); },
  beats: [
    i => { const tl = gsap.timeline(); rsIn(2, tl, i); tl.add(rsTo('#rs2Cv', .17, 2.6), W(i, 'two halves') - .3); tl.add(rsTo('#rs2Cv', .28, 2.4), W(i, 'many versions') - .2); rsPts(2, tl, i, ['many versions']); return tl; },
    i => { const tl = gsap.timeline(), r = $$('#rs2T .rs-pt'); tl.set('#rs2T > *', { autoAlpha: 1 }, 0); tl.set(r.slice(1), { autoAlpha: 0 }, 0);
      tl.add(rsTo('#rs2Cv', .5, 2.8), W(i, 'moisture fork') - .4); tl.add(rsTo('#rs2Cv', .58, 2), W(i, 'thin tube') - .3); tl.add(rsTo('#rs2Cv', .64, 2), W(i, 'pH sensor') - .3); tl.add(rsTo('#rs2Cv', .76, 2.4), W(i, 'Close it') - .3); tl.add(rsTo('#rs2Cv', .96, 3), W(i, 'exits at the nose') - .6);
      tl.fromTo('#rs2Sig', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, W(i, 'Close it')); tl.fromTo('#sgBar', { scaleX: .04 }, { scaleX: .96, duration: 5, ease: 'power2.inOut' }, W(i, 'exits at the nose') - 1.2); tl.fromTo(r[1], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'moisture fork')); tl.fromTo(r[2], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'thin tube')); tl.fromTo(r[3], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'exits at the nose')); return tl; }
  ] };
S.rs3 = { sec: 'RootStake', reset() { hide('#rs3V', '#rs3Sig', $$('#rs3T > *'), $$('#rs3T .rs-pt')); rsSet('#rs3Cv', .14); },
  beats: [
    i => { const tl = gsap.timeline(); rsIn(3, tl, i); tl.add(rsTo('#rs3Cv', .3, 3.2), W(i, 'extremely thin') - .6); tl.add(rsTo('#rs3Cv', .41, 3), W(i, 'stop in') - .3); rsPts(3, tl, i, ['extremely thin']); return tl; },
    i => { const tl = gsap.timeline(), r = $$('#rs3T .rs-pt'); tl.set('#rs3T > *', { autoAlpha: 1 }, 0); tl.set(r.slice(1), { autoAlpha: 0 }, 0); tl.add(rsTo('#rs3Cv', .47, 2.4), W(i, 'goes around') - .5); tl.add(rsTo('#rs3Cv', .56, 3), W(i, 'straight through') - .5); tl.add(rsTo('#rs3Cv', .6, 4, 'none'), W(i, 'trend') - 1.5);
      tl.fromTo('#rs3Sig', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, W(i, 'goes around') - .3); tl.add(drawIn($('#sg1'), 2.2, 'power2.inOut'), W(i, 'goes around')); tl.add(drawIn($('#sg2'), 2.6, 'power2.inOut'), W(i, 'straight through')); tl.to('#sgGap', { opacity: 1, duration: .6 }, W(i, 'trend')); tl.fromTo(r[1], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'goes around')); tl.fromTo(r[2], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'straight through')); tl.fromTo(r[3], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'trend') - .2); return tl; }
  ] };
S.rs4 = { sec: 'RootStake', reset() { hide('#rs4V', '#rs4Sig', $$('#rs4T > *'), $$('#rs4T .rs-pt')); rsSet('#rs4Cv', 0); },
  beats: [
    i => { const tl = gsap.timeline(), r = $$('#rs4T .rs-pt'); rsIn(4, tl, i); tl.add(rsTo('#rs4Cv', .08, 2.2), .6); tl.add(rsTo('#rs4Cv', .13, 2.6), W(i, 'one module') - .3); tl.add(rsTo('#rs4Cv', .62, 4.2), W(i, 'takes hold') - 1); tl.add(rsTo('#rs4Cv', .78, 3.2), W(i, 'membranes leak') - .3);
      tl.fromTo(r[0], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'one module')); tl.fromTo('#rs4Sig', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, W(i, 'takes hold')); tl.add(drawIn($('#sg4'), 4, 'power1.inOut'), W(i, 'takes hold') + .3); tl.fromTo(r[1], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'membranes leak')); return tl; },
    i => { const tl = gsap.timeline(), r = $$('#rs4T .rs-pt'); tl.set('#rs4T > *', { autoAlpha: 1 }, 0); tl.set(r.slice(2), { autoAlpha: 0 }, 0); tl.add(rsTo('#rs4Cv', .86, 3), 0); tl.add(rsTo('#rs4Cv', .985, 4.5), W(i, 'shared weather') - .8); tl.fromTo(r[2], { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, 'never claims')); return tl; }
  ] };

/* ---------- FEASIBILITY: built and tested ---------- */
S.built = { sec: 'Feasibility', reset() { hide('.bt-eye', '.bt-h', $$('#tiles .tile'), '#btNote'); gsap.set('#tiles', { autoAlpha: 1, y: 0 }); zero('#s-built'); },
  beats: [
    i => { const tl = gsap.timeline(), T = $$('#tiles .tile'); tl.add(rise(['.bt-eye', '.bt-h'], { st: .12 }), 0);
      [['for iPhone', 0], ['a hundred and sixty', 1]].forEach(([w, k]) => { const t = W(i, w); tl.fromTo(T[k], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, t); const n = $('[data-n]', T[k]); tl.add(count(n, +n.dataset.n, 1.8), t + .2); }); return tl; },
    i => { const tl = gsap.timeline(), T = $$('#tiles .tile'); [['three hundred', 2], ['four-plant', 3]].forEach(([w, k]) => { const t = W(i, w); tl.fromTo(T[k], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, t); const n = $('[data-n]', T[k]); tl.add(count(n, +n.dataset.n, k === 2 ? 2.4 : 1.6), t + .2); });
      tl.add(rise('#btNote', { y: 20 }), W(i, 'A small test,')); return tl; }
  ] };

/* ---------- MARKET POTENTIAL ---------- */
S.mk = { sec: 'Market', reset() { hide('.mk-eye', '.mk-h', $$('.mk-r'), '#mkH', '#mkG'); gsap.set($$('.mk-rings .ring'), { strokeDashoffset: 1 }); gsap.set('.mk-rings', { autoAlpha: 1 }); zero('#s-mk'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.mk-eye', '.mk-h'], { st: .12 }), 0); tl.to('#mkC1', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, W(i, 'one and a half') - .3); tl.add(rise('#mkR1', { y: 40 }), W(i, 'one and a half')); tl.add(count($('#mkR1 [data-n]'), 1.49, 2, 2), W(i, 'one and a half') + .2); tl.add(pop('#mkH', { s: .8 }), W(i, 'three in four')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#mkC2', { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, W(i, 'one in two') - .3); tl.add(rise('#mkR2', { y: 40 }), W(i, 'one in two')); tl.add(count($('#mkR2 [data-n]'), 750, 2.2), W(i, 'seven hundred')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#mkC3', { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, W(i, 'seven thousand') - .3); tl.add(rise('#mkR3', { y: 40 }), W(i, 'seven thousand')); tl.add(count($('#mkR3 [data-n]'), 7200, 2.2), W(i, 'seven thousand') + .2); tl.add(rise('#mkG', { y: 30 }), W(i, 'wider market')); return tl; }
  ] };

/* ---------- BUSINESS MODEL ---------- */
S.bm = { sec: 'Business model', reset() { hide('.bm-eye', '.bm-h', $$('.bm-c'), '#bmEq'); zero('#s-bm'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.bm-eye', '.bm-h'], { st: .15 }), 0); return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#bmC1', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'One:')); tl.add(count($('#bmC1 [data-n]'), 30, 1.6), W(i, 'thirty dollars')); return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#bmC2', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'Two:')); tl.fromTo('#bmC3', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'Three:')); return tl; },
    i => { const tl = gsap.timeline(); tl.set('#bmEq', { autoAlpha: 1 }, 0); tl.fromTo($$('#bmEq > *'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, ease: E2, stagger: .45 }, W(i, 'seven thousand two hundred') - .3); tl.add(count($('#bmEq [data-n]'), 43200, 2.4), W(i, 'forty-three thousand') - .6); return tl; }
  ] };

/* ---------- IMPACT ---------- */
S.imp = { sec: 'Impact', reset() { hide('.imp-eye', '.imp-h', $$('.imp-t')); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.imp-eye', '.imp-h'], { st: .15 }), 0); tl.fromTo('#impT1', { autoAlpha: 0, y: 70, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: E2 }, W(i, 'Climate action')); return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#impT2', { autoAlpha: 0, y: 70, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: E2 }, W(i, 'Quality education')); return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#impT3', { autoAlpha: 0, y: 70, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: E2 }, W(i, 'Good health')); tl.fromTo('#impT4', { autoAlpha: 0, y: 70, scale: .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: E2 }, W(i, 'technology:')); return tl; }
  ] };

/* ---------- WHAT IS NEXT ---------- */
S.road = { sec: 'Next', reset() { hide('.rd-eye', '.rd-h', $$('.rd-s'), '#rdM'); gsap.set('#rdLine', { scaleX: 0 }); gsap.set('.rd-line', { autoAlpha: 0 }); zero('#s-road'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.rd-eye', '.rd-h'], { st: .15 }), 0); tl.set('.rd-line', { autoAlpha: 1 }, 0); tl.to('#rdLine', { scaleX: .34, duration: 1.4, ease: E2 }, W(i, 'First, we publish')); tl.fromTo('#rdS1', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'First, we publish')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#rdLine', { scaleX: 1, duration: 6, ease: 'power1.inOut' }, W(i, 'Then we pilot') - .3); tl.fromTo('#rdS2', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'Then we pilot'));
      tl.fromTo('#rdS3', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, W(i, 'we expand')); tl.add(rise('#rdM', { y: 40 }), W(i, 'one number')); return tl; }
  ] };

/* =====================================================================
   ENGINE
   ===================================================================== */
const ORDER = []; LINES.forEach(l => { if (!ORDER.includes(l.scene)) ORDER.push(l.scene); });
const first = {}; LINES.forEach(l => { if (first[l.scene] == null) first[l.scene] = l.i; });
let cur = -1, curScene = 'ready', live = [];
const chan = null;
function sceneEl(n) { return $('#s-' + n); }
function killLive() { live.forEach(t => t.kill()); live = []; }
function setChrome(n, i) {
  const sc = S[n], on = sc.chrome !== false && n !== 'ready';
  gsap.to('#chrome', { autoAlpha: on ? 1 : 0, duration: .5 });
  if (i >= 0) $('#secTxt').innerHTML = `<b>${LINES[i].crit}</b>`;
  gsap.to('#secpill', { autoAlpha: on ? 1 : 0, duration: .4 });
  timeline(i);
}
const TOT = LINES.length ? LINES[LINES.length - 1].at + LINES[LINES.length - 1].dur : 1, PB = { f: 0 };
const pbSet = () => { gsap.set('#prog', { scaleX: PB.f }); gsap.set('#knob', { left: (PB.f * 100) + '%' }); };
function timeline(i) { gsap.killTweensOf(PB); if (i < 0) { PB.f = 0; return pbSet(); } const L = LINES[i]; PB.f = L.at / TOT; pbSet(); gsap.to(PB, { f: (L.at + L.dur) / TOT, duration: L.dur, ease: 'none', onUpdate: pbSet }); }
function speaker(i) { return; /* speaker name pill removed */
  if (i < 0) return; const L = LINES[i], p = LINES[i - 1];
  const show = L.text.startsWith("I'm Pranav") || (i > 0 && p.who !== L.who);
  if (!show) return; const s = SPEAKERS[L.who];
  $('#spAv').textContent = s.short[0]; $('#spName').textContent = s.name; $('#spPart').textContent = s.part;
  gsap.killTweensOf('#speaker'); gsap.timeline().fromTo('#speaker', { autoAlpha: 0, scale: .96, xPercent: -50, y: 0 }, { autoAlpha: 1, scale: 1, duration: .8, ease: 'power2.out' }, .6).to('#speaker', { autoAlpha: 0, duration: .6, ease: 'power1.in' }, 6.2);
}
function caption(i) { $('#caption').innerHTML = i < 0 ? '' : `<b>line ${i + 1} of ${LINES.length}</b>${fillTokens(LINES[i].text)}`; }

function go(i, opts = {}) {
  i = Math.max(-1, Math.min(LINES.length - 1, i));
  const n = i < 0 ? 'ready' : LINES[i].scene, sc = S[n], local = i < 0 ? -1 : i - first[n];
  const stepForward = i === cur + 1 && n === curScene;
  live.forEach(t => t.progress(1)); killLive(); gsap.killTweensOf('#speaker'); gsap.set('#speaker', { autoAlpha: 0 });
  if (n !== curScene) {
    const o = sceneEl(curScene), nx = sceneEl(n);
    gsap.killTweensOf([o, nx]);
    gsap.to(o, { autoAlpha: 0, y: -24, duration: .5, ease: 'power2.in', onComplete: () => { o.classList.remove('on'); gsap.set(o, { y: 0 }); } });
    sc.reset(); for (let k = 0; k < local; k++) { const t = sc.beats[k](first[n] + k); t.progress(1); t.kill(); }
    nx.classList.add('on'); gsap.fromTo(nx, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: E, delay: .35 });
    if (local >= 0) live.push(sc.beats[local](i).delay(.45)); else if (sc.play) live.push(sc.play().delay(.5));
  } else if (local >= 0) {
    if (!stepForward) { sc.reset(); for (let k = 0; k < local; k++) { const t = sc.beats[k](first[n] + k); t.progress(1); t.kill(); } }
    live.push(sc.beats[local](i));
  } else { sc.reset(); if (sc.play) live.push(sc.play().delay(.3)); }
  cur = i; curScene = n; setChrome(n, i); speaker(i); caption(i);
  if (!opts.remote && chan) chan.postMessage({ i });
  try { if (!MIRROR) history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
  autoLines();
}
if (chan) chan.onmessage = e => { if (typeof e.data.i === 'number' && e.data.i !== cur) go(e.data.i, { remote: true }); if (e.data.ask) chan.postMessage({ i: cur }); };

/* ---------- one click per scene: its lines play on their own, timed to the words ---------- */
let linesTimer, paused = false, PACE = 1;
function autoLines() { clearTimeout(linesTimer); if (paused || cur < 0) return; const L = LINES[cur], N = LINES[cur + 1]; if (!N || N.scene !== L.scene) return; linesTimer = setTimeout(() => go(cur + 1), L.dur * PACE * 1000); }
function nextScene() { if (cur < 0) return go(0); const nl = LINES[cur + 1]; if (nl && nl.scene === curScene) return go(cur + 1); const k = ORDER.indexOf(curScene); if (k + 1 < ORDER.length) go(first[ORDER[k + 1]]); }
function prevScene() { const k = ORDER.indexOf(curScene); if (cur < 0) return; if (cur > first[curScene]) return go(first[curScene]); if (k > 0) go(first[ORDER[k - 1]]); else go(-1); }
function toast(t) { let e = $('#toast'); if (!e) { e = document.createElement('div'); e.id = 'toast'; e.style.cssText = 'position:absolute;left:50%;bottom:60px;transform:translateX(-50%);z-index:90;background:#121A15;color:#F8F6F1;padding:14px 34px;border-radius:99px;font:400 30px Hanken Grotesk,sans-serif;pointer-events:none'; stage.appendChild(e); } e.textContent = t; gsap.killTweensOf(e); gsap.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }); gsap.to(e, { autoAlpha: 0, delay: 1.6, duration: .5 }); }
/* ---------- (rehearsal mode kept for practice) ---------- */
let auto = false, voice = false, timer;
function schedule() { clearTimeout(timer); if (!auto) return; if (voice) return speak(); const d = cur < 0 ? 1.5 : LINES[cur].dur; timer = setTimeout(() => cur < LINES.length - 1 ? go(cur + 1) : toggleAuto(false), d * 1000); }
function speak() { speechSynthesis.cancel(); if (cur < 0) { timer = setTimeout(() => go(0), 1200); return; } const L = LINES[cur], u = new SpeechSynthesisUtterance(fillTokens(L.text, false).replace(/\[(\w+)\]/g, 'so many')); const vs = speechSynthesis.getVoices().filter(v => /^en/.test(v.lang)); if (vs.length) u.voice = vs[['P', 'A', 'I', 'N'].indexOf(L.who) % vs.length]; u.rate = 1.0; u.onend = () => { if (auto && voice) timer = setTimeout(() => cur < LINES.length - 1 ? go(cur + 1) : toggleAuto(false), SCRIPT[cur][4] * 1000); }; speechSynthesis.speak(u); }
function toggleAuto(v = !auto) { auto = v; document.body.classList.toggle('auto', auto); $('#autoflag').textContent = voice ? 'REHEARSAL · VOICE' : 'REHEARSAL · AUTO'; if (!auto) { clearTimeout(timer); try { speechSynthesis.cancel(); } catch (e) {} } else schedule(); }

/* ---------- input ---------- */
if (!MIRROR) {
  addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter', 'n', '.'].includes(k)) { e.preventDefault(); nextScene(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', ','].includes(k)) { e.preventDefault(); prevScene(); }
    else if (k === 'k' || k === 'K') { paused = !paused; toast(paused ? 'Paused' : 'Playing'); autoLines(); }
    else if (k === '[') { PACE = Math.min(2.5, PACE + .15); toast('Slower'); }
    else if (k === ']') { PACE = Math.max(.5, PACE - .15); toast('Faster'); }
    else if (k === 'Home') go(-1); else if (k === 'End') go(first[ORDER[ORDER.length - 1]]);
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
    
    else if (k === 'c' || k === 'C') document.body.classList.toggle('showcap');
    
    
    else if (k === '?' || k === 'h') document.body.classList.toggle('showhelp');
    else if (k === 'Escape') { document.body.classList.remove('showhelp', 'showcap'); toggleAuto(false); }
  });
  stage.addEventListener('click', () => nextScene());
  stage.addEventListener('contextmenu', e => { e.preventDefault(); prevScene(); });
  let tx = 0; addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true }); addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) dx < 0 ? nextScene() : prevScene(); }, { passive: true });
  let idle; addEventListener('mousemove', () => { document.body.classList.remove('hidecursor'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('hidecursor'), 2000); });
}

/* ---------- start ---------- */
Object.keys(S).forEach(n => { if (n !== 'ready') S[n].reset(); });
$('#s-ready').classList.add('on'); gsap.set('#s-ready', { autoAlpha: 1 }); gsap.set('#chrome', { autoAlpha: 0 }); setChrome('ready', -1); S.ready.play();
const start = parseInt(location.hash.slice(1)) - 1;
const boot = () => { if (start >= 0) go(start); else if (chan && MIRROR) chan.postMessage({ ask: 1 }); };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(boot, 50));
window.DECK = { go, get cur() { return cur; }, W, ff: () => live.forEach(t => t.progress(1)), liveDur: () => Math.max(0, ...live.map(t => t.totalDuration() + t.delay())) };

/* =====================================================================
   ===================================================================== */
})();
