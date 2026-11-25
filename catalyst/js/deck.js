/* ROOTED SG · Catalyst deck engine.
   One click = one script line. Each line fires its own GSAP timeline, timed to the words inside the line,
   so the motion lands on the phrase being spoken. ←/→ (or a clicker) move line by line. */
(() => {
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
S.ready = { chrome: false, reset() { gsap.set('.ready-mark', { autoAlpha: 1 }); }, beats: [] };

/* ---------- COLD OPEN: the 2022 chicken shock, then the import map ---------- */
(function () { const R = (n => () => (n = (n * 16807) % 2147483647) / 2147483647)(5), c = 450; let s = '<g id="impLines" fill="none" stroke="#0B5A32" stroke-width="1.4" opacity=".45">', dots = '<g id="impDots">';
  for (let k = 0; k < 187; k++) { const a = R() * Math.PI * 2, r = 170 + Math.pow(R(), .7) * 260, x = c + Math.cos(a) * r, y = c + Math.sin(a) * r * .92, mx = (x + c) / 2 + Math.sin(a) * 40, my = (y + c) / 2 - Math.cos(a) * 40;
    s += `<path pathLength="1" d="M${x.toFixed(1)} ${y.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${c} ${c}"/>`; dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4 + R() * 4).toFixed(1)}" fill="#0A0A0A"/>`; }
  $('#impMap').innerHTML = s + '</g>' + dots + `</g><g id="impSG"><circle cx="${c}" cy="${c}" r="70" fill="#0B5A32" opacity=".12" class="sgp"/><circle cx="${c}" cy="${c}" r="26" fill="#0B5A32"/><text x="${c}" y="${c + 72}" text-anchor="middle" font-family="DM Mono, monospace" font-size="26" letter-spacing="3" fill="#0B5A32" font-weight="500">SINGAPORE</text></g>`; })();
S.cold = {
  chrome: false,
  reset() { hide('#imp .ie', '#ib1', '#ib2', $$('#trans > div'), '#imp .src', '#impSG', $$('#shock span')); gsap.set('#imp', { autoAlpha: 1 }); gsap.set('#ib1', { y: 0 }); gsap.set('#trans', { autoAlpha: 1, y: 0 });
    gsap.set($$('#impLines path'), { strokeDasharray: 1, strokeDashoffset: 1, stroke: '#0B5A32', opacity: 1 }); gsap.set($$('#impDots circle'), { scale: 0, transformOrigin: '50% 50%', fill: '#0A0A0A' }); gsap.set('#impSG circle', { fill: '#0B5A32' }); zero('#s-cold'); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('#imp .ie', { y: 16 }), .1); tl.fromTo('#impSG', { autoAlpha: 0, scale: 0, transformOrigin: '450px 450px' }, { autoAlpha: 1, scale: 1, duration: .9, ease: 'back.out(2)' }, .3);
      const t = W(i, 'More than'); tl.add(rise('#ib1', { y: 50 }), t - .5); tl.add(count($('#ib1 [data-n]'), 90, 1.6), t - .2);
      const T = $$('#trans > div'); ['ship,', 'truck', 'plane.'].forEach((w, k) => tl.fromTo(T[k], { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, W(i, w) - .1));
      const P = $$('#impLines path'), D = $$('#impDots circle'); tl.to(D.slice(0, 40), { scale: 1, duration: .4, ease: 'back.out(3)', stagger: .03 }, W(i, 'arrives') - .4); tl.to(P.slice(0, 40), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .03 }, W(i, 'arrives')); return tl; },
    i => { const tl = gsap.timeline(), P = $$('#impLines path'), D = $$('#impDots circle'); tl.to('#trans', { autoAlpha: 0, y: 20, duration: .5 }, 0); tl.to('#ib1', { y: -10, duration: .5 }, 0); tl.to('#ib1', { autoAlpha: 0, duration: .5 }, .2);
      tl.add(rise('#ib2', { y: 50 }), .5); tl.add(count($('#ib2 [data-n]'), 187, 2.4), .7); tl.to(D.slice(40), { scale: 1, duration: .4, ease: 'back.out(3)', stagger: { each: .009, from: 'random' } }, .5); tl.to(P.slice(40), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: { each: .009, from: 'random' } }, .8);
      tl.add(rise('#imp .src', { y: 10 }), 1.6);
      const cut = P.filter((_, k) => k % 6 === 0), cutD = D.filter((_, k) => k % 6 === 0), S2 = $$('#shock span');
      tl.add(pop(S2[0], { s: .7 }), W(i, 'One closed')); tl.to(cut.slice(0, cut.length / 2), { stroke: '#984421', strokeDashoffset: -1, duration: 1, ease: 'power2.in', stagger: .02 }, W(i, 'One closed') + .2); tl.to(cutD.slice(0, cutD.length / 2), { fill: '#984421', duration: .3, stagger: .02 }, W(i, 'One closed'));
      tl.add(pop(S2[1], { s: .7 }), W(i, 'one bad')); tl.to(cut.slice(cut.length / 2), { stroke: '#984421', strokeDashoffset: -1, duration: 1, ease: 'power2.in', stagger: .02 }, W(i, 'one bad') + .2); tl.to(cutD.slice(cutD.length / 2), { fill: '#984421', duration: .3, stagger: .02 }, W(i, 'one bad'));
      tl.to('#impSG circle', { fill: '#984421', duration: .4 }, W(i, 'our shelves')); tl.fromTo('#impSG', { scale: 1 }, { scale: 1.12, transformOrigin: '450px 450px', yoyo: true, repeat: 3, duration: .18 }, W(i, 'instantly.')); return tl; }
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
      tl.to('#fsA', { scaleX: 8 / 25, duration: 1.4, ease: E2 }, W(i, 'Today,')); tl.add(count($$('#fsTwo [data-n]')[0], 8, 1.2), W(i, 'Today,')); tl.add(rise('#fsTwo .src', { y: 10 }), W(i, 'Today,') + .6); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#fsTwo', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, 0); tl.set('#tools', { autoAlpha: 1 }, .4); tl.add(rise('#tools .eyebrow', { y: 14 }), .4); const C = $$('#tools .tc');
      [W(i, 'eight hundred'), W(i, 'over two thousand allotment'), W(i, 'over two thousand community')].forEach((t, k) => { tl.fromTo(C[k], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, t); tl.add(count($('[data-n]', C[k]), +$('[data-n]', C[k]).dataset.n, k ? 1.4 : 2.6), t + .2); });
      tl.add(F1.tween({ a: 1 }, 3.4), W(i, 'eight hundred') + .2); tl.add(rise('#fieldKey', { y: 10 }), W(i, 'eight hundred') + 1.4); return tl; },
    i => { const tl = gsap.timeline(); tl.add(F1.tween({ g: 1 }, 2.4), 0); const t = W(i, 'Yet one'); tl.to('#tools', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, t - .5);
      tl.add(F1.tween({ d: 1 }, 2.6), t + .4); tl.fromTo('#gapZero', { autoAlpha: 0, scale: .85 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: E2 }, t + .2);
      const t2 = W(i, 'Singapore counts'); tl.to(['#field', '#fieldKey'], { autoAlpha: 0, y: 40, duration: .8 }, t2 - .4); tl.add(rise('#gapLine', { y: 40, d: 1.1 }), t2); return tl; }
  ]
};

/* ---------- HERO: the heymeco.xyz opening, app only ---------- */
$('#team').innerHTML = ['P', 'A', 'I', 'N'].map(k => { const s = SPEAKERS[k]; return `<div class="mem" data-k="${k}"><div class="ini">${s.short[0]}</div><div><b>${s.name}</b><span>${s.part}</span></div></div>`; }).join('');
$('#clNames').innerHTML = ['P', 'A', 'I', 'N'].map(k => SPEAKERS[k].name).join(' <b>·</b> ');
S.hero = {
  chrome: true, sec: 'Rooted SG',
  reset() { hide('#heroEye', $$('#heroH .hl'), $$('#heroTrio li'), $$('#heroStage .ph'), $$('#heroStage .chip'), $$('#team .mem')); gsap.set('#heroStage', { autoAlpha: 1, y: 0 }); gsap.set('#heroTrio', { autoAlpha: 1, y: 0 }); gsap.set($$('#s-hero .alive path'), { strokeDashoffset: 1 }); $$('#team .mem').forEach(m => m.classList.remove('on')); gsap.set('.hero-wrap', { y: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('#heroEye', { y: 20 }), 0); tl.add(rise($$('#heroH .hl'), { y: 34, d: 1.1, st: .18 }), .1);
      tl.add(drawIn($('#s-hero .alive .ul path'), 1, 'power2.out'), 1.0); $$('#s-hero .alive .sp path').forEach((p, k) => tl.add(drawIn(p, .5, 'power2.out'), [1.8, 2.1, 2.3][k]));
      const t = W(i, 'the first way'); tl.add(rise($$('#heroTrio li'), { y: 24, st: .14 }), t);
      const ph = $$('#heroStage .ph'); tl.fromTo(ph, { autoAlpha: 0, y: 380 }, { autoAlpha: 1, y: 0, duration: 1.6, ease: E2, stagger: { each: .14, from: 'center' } }, W(i, 'an app') - .3);
      tl.add(pop($$('#heroStage .chip'), { st: .25 }), W(i, 'earned by')); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#heroStage', { y: 500, autoAlpha: 0, duration: 1, ease: 'power3.in' }, 0); tl.to('#heroTrio', { autoAlpha: 0, y: 20, duration: .5 }, 0); tl.to('.hero-wrap', { y: 40, duration: 1.2, ease: E }, .3);
      const m = $$('#team .mem'); [W(i, "I'm Pranav"), W(i, 'Aashrith,'), W(i, 'Isha'), W(i, 'Anandita,')].forEach((t, k) => tl.fromTo(m[k], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, Math.max(.6 + k * .2, t))); return tl; },
    i => { const tl = gsap.timeline(); tl.add(() => $$('#team .mem').forEach(m => m.classList.toggle('on', m.dataset.k === 'A')), W(i, 'Aashrith.')); tl.fromTo('#team .mem[data-k=A]', { y: 0 }, { y: -26, duration: .8, ease: 'back.out(2)' }, W(i, 'Aashrith.')); return tl; }
  ]
};

/* ---------- SURVEY: 100 dots, the say-do gap ---------- */
$('#dots').innerHTML = Array.from({ length: 100 }, () => '<i></i>').join('');
const dots = $$('#dots i');
S.survey = {
  sec: 'The problem',
  reset() { hide('#svBig', '#sv1', '#sv2', '#dotsCap', dots); dots.forEach(d => d.className = ''); zero('#s-survey'); gsap.set(['.sv-left .eyebrow', '.sv-h', '.sv-src'], { autoAlpha: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise(['.sv-left .eyebrow', '.sv-h'], { st: .15 }), 0); tl.add(rise('#svBig'), W(i, 'Three thousand') - .3); tl.add(count($('#svBig [data-n]'), 3043, 2.2), W(i, 'Three thousand'));
      tl.fromTo(dots, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)', stagger: { each: .012, grid: [10, 10], from: 'center' } }, W(i, 'Three thousand') + .2); tl.add(rise('.sv-src', { y: 10 }), W(i, 'answered')); return tl; },
    i => { const tl = gsap.timeline(); tl.add(rise('#sv1'), 0); tl.add(count($('#sv1 [data-n]'), 70.9, 2), .2);
      dots.slice(0, 71).forEach((d, k) => tl.add(() => d.classList.add('g'), .25 + k * .028)); tl.fromTo(dots.slice(0, 71), { scale: .7 }, { scale: 1, duration: .5, ease: 'back.out(3)', stagger: .028 }, .25);
      tl.add(() => $('#dotsCap').innerHTML = '<b>70.9%</b> want to grow at home', 0); tl.add(rise('#dotsCap', { y: 10 }), .3); return tl; },
    i => { const tl = gsap.timeline(); tl.add(out('#sv1'), 0); tl.add(rise('#sv2'), .35); tl.add(count($('#sv2 [data-n]'), 51.2, 2), .5);
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
    i => { const tl = gsap.timeline(); tl.add(rise(['.pa-eye', '.pa-h'], { st: .12 }), 0); tl.add(drawIn($$('.pa-axis path'), 1.2), .5); tl.add(rise($$('#pareto .lb'), { y: 14, st: .12 }), W(i, 'We ranked')); tl.add(rise('.pa-src', { y: 10 }), W(i, 'Pareto')); return tl; },
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
  reset() { hide('.wy-head', wyN, '#root', '#wyPlant', '#wyGlow'); gsap.set(['#wySoil', '#wySoilP'], { autoAlpha: 0 }); gsap.set(['#wyGround', '#wyTap', ...$$('#wySide path')], { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.killTweensOf('#wyGlow .ring'); gsap.set('#wyGlow .ring', { scale: 1, opacity: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.wy-head', { y: 20 }), 0); tl.to('#wyGround', { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, .1);
      tl.fromTo(['#wySoil', '#wySoilP'], { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, .3); tl.fromTo('#wyPlant', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, .4);
      const at = [W(i, 'why, five'), W(i, 'digging'), W(i, 'People forget'), W(i, 'Nothing reminds them,'), W(i, 'nobody can see')], seg = [.16, .36, .55, .75, 1], side = $$('#wySide path');
      at.forEach((t, k) => { tl.to('#wyTap', { strokeDashoffset: 1 - seg[k], duration: 1, ease: 'power2.inOut' }, t); if (side[k]) tl.to(side[k], { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' }, t + .5); if (k === 4 && side[5]) tl.to(side[5], { strokeDashoffset: 0, duration: 1.1 }, t + .7);
        tl.fromTo(wyN[k], { autoAlpha: 0, x: wyN[k].dataset.s === 'l' ? -60 : 60 }, { autoAlpha: 1, x: 0, duration: .9, ease: E2 }, t + .5); tl.fromTo($('i', wyN[k]), { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(2.5)' }, t + .5); });
      return tl; },
    i => { const tl = gsap.timeline(); tl.fromTo('#wyGlow', { autoAlpha: 0, scale: 0, transformOrigin: '960px 860px' }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, 0);
      tl.add(() => gsap.fromTo('#wyGlow .ring', { scale: 1, opacity: .9 }, { scale: 3.2, opacity: 0, duration: 1.8, ease: 'power1.out', stagger: .9, repeat: -1 }), .2);
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
const gaugeSet = v => { gsap.set('#gNeedle', { rotation: -90 + v / 50 * 180 }); gsap.set('#gFill', { strokeDashoffset: 100 - v * 2 }); $('#gNum').textContent = Math.round(v); };
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
      const t = W(i, 'Miss any'); tl.fromTo('#plus1', { autoAlpha: 0, y: 40, scale: .6 }, { autoAlpha: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(2)' }, t - 1.6); tl.to('#plus1', { autoAlpha: 0, y: -50, duration: .5 }, t - .7); tl.add(count($('#pdNum'), 315, .4), t - .7); tl.fromTo('#pdNum', { scale: 1 }, { scale: 1.08, yoyo: true, repeat: 1, duration: .2 }, t - .7); return tl; },
    i => { const tl = gsap.timeline(); tl.add(() => pdShow(2), 0); tl.fromTo('#mojo', { autoAlpha: 0, x: -300 }, { autoAlpha: 1, x: 0, duration: 1.1, ease: 'back.out(1.4)' }, W(i, 'Mojo,'));
      tl.fromTo('.bubble', { autoAlpha: 0, scale: .5, transformOrigin: '0% 100%' }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, W(i, 'tells you')); tl.add(() => $('#mojoImg').src = 'media/mojo/happy.gif', W(i, 'Once a day,'));
      tl.add(pop('#solves1', { s: .8 }), W(i, 'Cause number one') + .3); return tl; }
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
const GPN = [['☀️', 'Light', 'done'], ['💧', 'Watering', 'done'], ['🍂', 'Leaf fungus', 'now'], ['🐛', 'Pests', 'lock'], ['🌱', 'Soil health', 'lock'], ['🧺', 'Harvest', 'lock']];
const gpTrail = $('#gpPath .trail'); const gpPt = f => { const L = gpTrail.getTotalLength(), p = gpTrail.getPointAtLength(L * f), s = Math.min(560 / 600, 720 / 760); return [p.x * s + (560 - 600 * s) / 2, p.y * s + (720 - 760 * s) / 2]; };
$('#gpNodes').innerHTML = GPN.map(([e, n, s], k) => { const [x, y] = gpPt(k / 5); return `<div class="gpn ${s}" style="left:${x}px;top:${y}px"><i>${e}</i><span>${n}</span></div>`; }).join('');
const gpM = { f: 0 }; const gpMojo = () => { const [x, y] = gpPt(gpM.f); gsap.set('#gpMojo', { x: 520 + x - 60, y: 280 + y - 118 }); };
S.grow = {
  sec: 'The app',
  reset() { hide('#rt', $$('#gp > *'), $$('#gpNodes .gpn'), $$('#gpCard .qo'), $$('#gpChips .chip'), $$('#rt > *'), $$('#listings .lst')); gsap.set('#gp', { autoAlpha: 1, x: 0 }); gsap.set(gpTrail, { strokeDashoffset: 1 }); gsap.set('#gpPath', { autoAlpha: 1 }); gsap.set('#gpNodes', { autoAlpha: 1 }); gsap.set('#gpChips', { autoAlpha: 1 }); $('#gpCard .qo.ok').classList.remove('on'); gpM.f = 0; gpMojo(); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise('.gp-head'), 0); tl.fromTo('.gp-ph', { autoAlpha: 0, y: 160 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E2 }, .2); tl.fromTo('.gp-ph img', { scale: 1.12, yPercent: 4 }, { scale: 1, yPercent: 0, duration: 5, ease: 'power1.out' }, .2);
      const t = W(i, 'Guardian Path,'); tl.to(gpTrail, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut' }, t - .4);
      $$('#gpNodes .gpn').forEach((n, k) => tl.fromTo(n, { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2.4)' }, t - .2 + k * .3));
      tl.fromTo('#gpMojo', { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, t + .4); tl.to(gpM, { f: .4, duration: 2, ease: 'power1.inOut', onUpdate: gpMojo }, t + .5);
      const t2 = W(i, 'we teach'); tl.fromTo('#gpCard', { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 1, ease: E2 }, W(i, 'identify diseases,')); tl.add(rise($$('#gpCard .qo'), { y: 16, st: .15 }), t2);
      tl.add(() => $('#gpCard .qo.ok').classList.add('on'), W(i, 'understand them.')); tl.fromTo('#gpCard .qo.ok', { scale: 1 }, { scale: 1.04, yoyo: true, repeat: 1, duration: .2 }, W(i, 'understand them.')); return tl; },
    i => { const tl = gsap.timeline(), ch = $$('#gpChips .chip'); [W(i, 'streaks,'), W(i, 'levels'), W(i, 'weekly leagues.')].forEach((t, k) => tl.add(pop(ch[k], { s: .6 }), t));
      const t = W(i, 'And on Roots,'); tl.to('#gp', { autoAlpha: 0, x: -120, duration: .7, ease: 'power2.in' }, t - .3); tl.set('#rt', { autoAlpha: 1 }, t); tl.add(rise('.rt-head'), t + .2);
      tl.fromTo('.rt-ph', { autoAlpha: 0, y: 200 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: E2 }, t + .2); tl.fromTo('.rt-ph2', { autoAlpha: 0, y: 240, rotation: 12 }, { autoAlpha: 1, y: 0, rotation: 5, duration: 1.3, ease: E2 }, t + .4); tl.set('#listings', { autoAlpha: 1 }, t);
      const L = $$('#listings .lst'); [W(i, 'like a'), W(i, 'neighbours trade') + .2, W(i, 'what they')].sort((a, b) => a - b).forEach((tt, k) => tl.fromTo(L[[1, 2, 0][k]], { autoAlpha: 0, x: 120 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, tt));
      tl.fromTo('#listings .lst:first-child', { boxShadow: '0 0 0 0 rgba(11,90,50,0)' }, { boxShadow: '0 0 0 6px rgba(11,90,50,1)', duration: .5 }, W(i, '421')); return tl; }
  ]
};

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
      tl.add(travel($('#pkt1'), 6, 2.6), W(i, 'running')); tl.add(() => nodes[6].classList.add('pass'), W(i, 'running') + 2.6); tl.fromTo(nodes[6], { scale: 1 }, { scale: 1.08, yoyo: true, repeat: 1, duration: .25 }, W(i, 'running') + 2.6); return tl; },
    i => { const tl = gsap.timeline(); tl.set('#pkt1', { autoAlpha: 0 }, 0); nodes[6].classList.remove('pass');
      const t1 = W(i, 'An Excess'); tl.add(() => nodes[2].classList.add('pass'), t1); tl.add(rise('#exg', { y: 30 }), t1); tl.add(exg.to(1, 2.4), t1 + .4);
      const t2 = W(i, 'A perceptual'); tl.add(travel($('#pkt2'), 3, 1.4), t2); tl.add(() => nodes[3].classList.add('hit'), t2 + 1.4); tl.to('#pkt2', { scale: 0, duration: .3 }, t2 + 1.4); tl.add(rise('#rj2', { y: 16 }), t2 + 1.3);
      const t3 = W(i, 'Blur detection'); tl.add(travel($('#pkt3'), 1, .9), t3); tl.add(() => nodes[1].classList.add('hit'), t3 + .9); tl.to('#pkt3', { scale: 0, duration: .3 }, t3 + .9); tl.add(rise('#rj1', { y: 16 }), t3 + .8);
      const t4 = W(i, 'Nothing can'); tl.add(travel($('#pkt1'), 6, 2), t4 - .6); tl.add(() => nodes[6].classList.add('pass'), t4 + 1.4); tl.add(rise('#rj3', { y: 16 }), t4 + 1.2); return tl; }
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
      const q = $('.quant .num.g'), t = W(i, 'eight-bit'); tl.add(() => { const o = { v: 32 }; gsap.to(o, { v: 8, duration: 1, ease: 'power2.inOut', onUpdate: () => q.textContent = Math.round(o.v) }); }, t); tl.set(q, { textContent: 8 }, t + 1.05);
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
  sec: 'Roots marketplace',
  reset() { gsap.set($$('#mkMap .hx'), { strokeDashoffset: 1 }); gsap.set($$('#mkMap .arc'), { strokeDashoffset: 1 }); hide($$('#mkMap .gw'), $$('#mkMap .ad'), '#mkMap .melab', $$('.mk-right > *'), $$('#mkList li')); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise($$('.mk-right > .eyebrow, .mk-right > .h3'), { st: .12 }), 0); tl.to($$('#mkMap .hx'), { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut', stagger: { each: .05, from: 'center' } }, .1);
      tl.set('#mkList', { autoAlpha: 1 }, 0); tl.add(rise('#mkMap .melab', { y: 10 }), .9);
      tl.fromTo($$('#mkMap .gw'), { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(2.4)', stagger: .1 }, W(i, 'verified record'));
      tl.to($$('#mkMap .arc'), { strokeDashoffset: 0, duration: 1, ease: 'power2.out', stagger: .2 }, W(i, 'trust data')); tl.to($$('#mkMap .ad'), { autoAlpha: 1, duration: .3, stagger: .2 }, W(i, 'trust data') + .8);
      const L = $$('#mkList li'); [W(i, 'Every listing'), W(i, 'and locations'), W(i, 'private by')].forEach((t, k) => tl.fromTo(L[k], { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, t)); return tl; }
  ]
};

/* ---------- BUILT + KAIZEN ---------- */
(function () { const k = $('#kaizen'); k.style.cssText = 'top:350px;width:560px;height:560px;margin-left:-280px'; const sv = $('svg', k); sv.setAttribute('viewBox', '0 0 560 560'); sv.style.cssText = 'inset:0;width:560px;height:560px'; $('.kz-ring', k).setAttribute('cx', 280); $('.kz-ring', k).setAttribute('cy', 280); $('.kz-ring', k).setAttribute('r', 210);
  const pos = [['-500px', '60px', 'right'], ['580px', '60px', 'left'], ['580px', '360px', 'left'], ['-500px', '360px', 'right']]; $$('.kz', k).forEach((e, j) => { e.style.cssText = `left:${pos[j][0]};top:${pos[j][1]};text-align:${pos[j][2]};width:440px;right:auto`; }); })();
const kz = { a: 0 }; const kzSet = () => { const a = kz.a * Math.PI * 2 - Math.PI / 2; $('#kzDot').setAttribute('cx', 280 + 210 * Math.cos(a)); $('#kzDot').setAttribute('cy', 280 + 210 * Math.sin(a)); };
(function () { const T = $$('#tiles .tile'); const add = (t, cls, html) => { const v = document.createElement('div'); v.className = 'viz ' + cls; v.innerHTML = html; t.appendChild(v); };
  add(T[0], 'phones', '<div>iOS</div><div>Android</div>'); add(T[1], 'code', [.9, .6, .75, .4, .85, .55, .7, .3, .8].map(w => `<i style="width:${w * 100}%"></i>`).join(''));
  add(T[2], 'tests', '<i></i>'.repeat(167)); add(T[3], 'people', '<i></i>'.repeat(60)); })();
S.built = {
  sec: 'Implementation',
  reset() { hide('.bt-eye', '.bt-h', $$('#tiles .tile'), '#kaizen', $$('#kaizen .kz')); gsap.set('#tiles', { autoAlpha: 1, y: 0 }); zero('#s-built'); kz.a = 0; kzSet(); },
  beats: [
    i => { const tl = gsap.timeline(), T = $$('#tiles .tile'); tl.add(rise(['.bt-eye', '.bt-h'], { st: .12 }), 0);
      [W(i, 'native SwiftUI'), W(i, 'Sixty-nine'), W(i, '167'), W(i, '167') + 2.2].forEach((t, k) => { tl.fromTo(T[k], { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1, ease: E2 }, t); const n = $('[data-n]', T[k]); tl.add(count(n, +n.dataset.n, k === 1 ? 2.4 : 1.6), t + .2);
        const v = $$('.viz > *', T[k]); if (k === 0) tl.fromTo(v, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'back.out(2)', stagger: .2 }, t + .3); if (k === 1) tl.fromTo(v, { scaleX: 0 }, { scaleX: 1, duration: .6, ease: E2, stagger: .12 }, t + .3); if (k === 2) tl.fromTo(v, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .25, stagger: .009 }, t + .2); if (k === 3) tl.fromTo(v, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .3, stagger: { each: .012, from: 'random' } }, t + .2); }); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#tiles', { autoAlpha: 0, y: -40, duration: .6, ease: 'power2.in' }, 0); tl.to('.bt-h', { autoAlpha: 0, duration: .4 }, 0); tl.fromTo('#kaizen', { autoAlpha: 0, scale: .8 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: E2 }, .4);
      const K = $$('#kaizen .kz'); [W(i, 'real hands'), W(i, 'we watched'), W(i, 'simplified'), W(i, 'tested again')].forEach((t, k) => { tl.to(kz, { a: (k + 1) / 4, duration: 1.4, ease: 'power2.inOut', onUpdate: kzSet }, Math.max(.6, t - .4)); tl.fromTo(K[k], { autoAlpha: 0, x: k === 0 || k === 3 ? -40 : 40 }, { autoAlpha: 1, x: 0, duration: .8, ease: E2 }, Math.max(.8, t)); }); return tl; }
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
  reset() { HS.h = 0; HS.m = 0; drawHist(); hide($$('.fc-left > *'), '#fcBig', '#ladder', '#histNotes'); gsap.set('#hist', { autoAlpha: 1 }); gsap.set($$('#ladder .rung i'), { scaleY: 0 }); hide($$('#ladder .rung b, #ladder .rung span')); $('#runsN').textContent = '0'; zero('#fcBig'); gsap.set('#fcRuns', { autoAlpha: 0 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(rise($$('.fc-left > .eyebrow, #fcH'), { st: .12 }), 0); tl.add(rise('#fcRuns'), W(i, 'we forecast')); const t = W(i, 'one hundred');
      tl.to(HS, { h: 1, duration: 5.5, ease: 'power1.inOut', onUpdate: drawHist }, t - .8); tl.add(count($('#runsN'), 100000, 5.5), t - .8); tl.add(rise('.fc-left > .src', { y: 10 }), t); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#hist', { autoAlpha: 0, duration: .5 }, 0); tl.set('#ladder', { autoAlpha: 1 }, .3); const R = $$('#ladder .rung');
      [W(i, 'two schools.'), W(i, 'Then twenty.'), W(i, 'sixty schools,')].forEach((t, k) => { tl.to($('i', R[k]), { scaleY: 1, duration: 1.2, ease: E2 }, t); tl.add(rise($$('b, span', R[k]), { y: 14, st: .1 }), t + .3); }); return tl; },
    i => { const tl = gsap.timeline(); tl.to('#ladder', { autoAlpha: 0, duration: .5 }, 0); tl.to('#hist', { autoAlpha: 1, duration: .6 }, .3); tl.add(() => { HS.h = 1; drawHist(); }, .3); tl.to(HS, { m: 1, duration: 1, onUpdate: drawHist }, .8);
      tl.to('#fcRuns', { autoAlpha: 0, y: -20, duration: .5 }, 0); tl.set('#fcBig', { autoAlpha: 1 }, .4); const B = $$('#fcBig > div'); tl.add(rise(B[0]), .4); tl.add(count($('[data-n]', B[0]), 1814, 1.8), .5);
      const t = W(i, 'three point three'); tl.add(rise(B[1]), t - .3); tl.add(count($('[data-n]', B[1]), 3.3, 1.4, 1), t); tl.add(rise('#histNotes', { y: 16 }), t + 1.5); return tl; }
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
      [W(i, 'The models'), W(i, 'schools run'), W(i, 'and neighbours')].forEach((t, k) => { tl.fromTo(P[k], { autoAlpha: 0, y: 90, rotation: k - 1 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 1, ease: E2 }, t); tl.fromTo($$('svg > *', P[k]), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: .15 }, t + .2); });
      const t = W(i, 'directly on') + .6; tl.add(rise('#suBand', { y: 30 }), t); tl.add(count($('#suBand [data-n]'), 48000, 1.6), t + .2); return tl; }
  ]
};

/* ---------- CLOSE ---------- */
(function () { const B = 380; $('#clPanSvg').innerHTML = `<path d="M130 ${B}h140l-18 40h-104z" fill="#fff" stroke="#0A0A0A" stroke-width="5" stroke-linejoin="round"/>` + [-38, -24, -10, 4, 18, 32, 44].map((a, i) => { const r = a * Math.PI / 180, L = 230 + (i % 3) * 40, tx = 200 + Math.sin(r) * L, ty = B - Math.cos(r) * L, nx = Math.cos(r) * 13, ny = Math.sin(r) * 13; return `<path class="blade" pathLength="1" d="M${200 - nx} ${B - ny}Q${(200 + tx) / 2 - nx * 1.4} ${(B + ty) / 2 - ny * 1.4} ${tx} ${ty}Q${(200 + tx) / 2 + nx * 1.4} ${(B + ty) / 2 + ny * 1.4} ${200 + nx} ${B + ny}z" fill="#E4F0E8" stroke="#0B5A32" stroke-width="4" stroke-linejoin="round"/>`; }).join(''); })();
S.close = {
  chrome: false,
  reset() { F2 = F2 || Field($('#field2'), 43, 20, { keep: true, seed: 31 }); Object.assign(F2.st, { a: 0, g: 0, d: 0, ok: 0 }); F2.draw(); hide('#clImagine', '#clQuote', $$('#clQuote p'), '#clEnd', '#clNames', '#clThanks', '#clPandan'); gsap.set($$('#clPanSvg .blade'), { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 }); gsap.set('#field2', { autoAlpha: 1 }); gsap.set($$('#clEnd .alive path'), { strokeDashoffset: 1 }); },
  beats: [
    i => { const tl = gsap.timeline(); tl.add(F2.tween({ a: 1 }, 2.6), .1); tl.add(rise('#clImagine', { y: 50, d: 1.1 }), W(i, 'Imagine')); tl.add(F2.tween({ g: 1 }, 3), W(i, 'Imagine') + .2); tl.add(F2.tween({ ok: 1 }, 2.4), W(i, 'exactly how')); return tl; },
    i => { const tl = gsap.timeline(); tl.to(['#clImagine', '#field2'], { autoAlpha: 0, duration: .8 }, 0); const q = $$('#clQuote p');
      tl.fromTo('#clPandan', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: E2 }, .3); tl.to($$('#clPanSvg .blade'), { strokeDashoffset: 0, fillOpacity: 1, duration: 1.1, ease: 'power2.out', stagger: .1 }, .4);
      tl.fromTo('#clPandan .chip', { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .6, ease: 'back.out(2)' }, W(i, 'Still alive,'));
      const tb = W(i, 'Because a'); tl.to('#clPandan', { autoAlpha: 0, y: -40, duration: .6 }, tb - .4); tl.set('#clQuote', { autoAlpha: 1, y: 0 }, tb - .2);
      tl.fromTo(q[0], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E }, tb); tl.fromTo(q[1], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: E }, W(i, 'It dies'));
      const t = W(i, 'We are'); tl.to('#clQuote', { autoAlpha: 0, y: -40, duration: .6 }, t - .3); tl.fromTo('#clEnd', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: E }, t);
      tl.add(drawIn($('#clEnd .alive .ul path'), 1, 'power2.out'), t + .9); $$('#clEnd .alive .sp path').forEach((p, k) => tl.add(drawIn(p, .5, 'power2.out'), t + 1.6 + k * .25));
      tl.add(rise('#clNames', { y: 20 }), t + 1.2); tl.add(rise('#clThanks', { y: 30, d: 1.2 }), W(i, 'Thank you.')); return tl; }
  ]
};

/* =====================================================================
   ENGINE
   ===================================================================== */
const ORDER = []; LINES.forEach(l => { if (!ORDER.includes(l.scene)) ORDER.push(l.scene); });
const first = {}; LINES.forEach(l => { if (first[l.scene] == null) first[l.scene] = l.i; });
let cur = -1, curScene = 'ready', live = [];
const chan = 'BroadcastChannel' in window ? new BroadcastChannel('rooted-catalyst') : null;
function sceneEl(n) { return $('#s-' + n); }
function killLive() { live.forEach(t => t.kill()); live = []; }
function setChrome(n, i) {
  const sc = S[n], on = sc.chrome !== false && n !== 'ready';
  gsap.to('#chrome', { autoAlpha: on ? 1 : 0, duration: .5 });
  if (i >= 0) $('#secTxt').innerHTML = `<b>${LINES[i].crit}</b> · ${sc.sec || ''}`;
  gsap.to('#secpill', { autoAlpha: on && n !== 'hero' ? 1 : 0, duration: .4 });
  gsap.to('#prog', { scaleX: (i + 1) / LINES.length, duration: .8, ease: E });
}
function speaker(i) {
  if (i < 0) return; const L = LINES[i], p = LINES[i - 1];
  const show = (i === 6) || (i > 0 && p.who !== L.who);
  if (!show) return; const s = SPEAKERS[L.who];
  $('#spAv').textContent = s.short[0]; $('#spName').textContent = s.name; $('#spPart').textContent = s.part;
  gsap.killTweensOf('#speaker'); gsap.timeline().fromTo('#speaker', { autoAlpha: 0, y: -30, xPercent: -50 }, { autoAlpha: 1, y: 0, duration: .7, ease: E2 }, .6).to('#speaker', { autoAlpha: 0, y: -20, duration: .5 }, 6.2);
}
function caption(i) { $('#caption').innerHTML = i < 0 ? '' : `<b>${SPEAKERS[LINES[i].who].name} · line ${i + 1} of ${LINES.length}</b>${fillTokens(LINES[i].text)}`; }

function go(i, opts = {}) {
  i = Math.max(-1, Math.min(LINES.length - 1, i));
  const n = i < 0 ? 'ready' : LINES[i].scene, sc = S[n], local = i < 0 ? -1 : i - first[n];
  const stepForward = i === cur + 1 && n === curScene;
  killLive(); gsap.killTweensOf('#speaker'); gsap.set('#speaker', { autoAlpha: 0 });
  if (n !== curScene) {
    const o = sceneEl(curScene), nx = sceneEl(n);
    gsap.killTweensOf([o, nx]);
    gsap.to(o, { autoAlpha: 0, y: -24, duration: .5, ease: 'power2.in', onComplete: () => { o.classList.remove('on'); gsap.set(o, { y: 0 }); } });
    sc.reset(); for (let k = 0; k < local; k++) { const t = sc.beats[k](first[n] + k); t.progress(1); t.kill(); }
    nx.classList.add('on'); gsap.fromTo(nx, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: E, delay: .35 });
    if (local >= 0) live.push(sc.beats[local](i).delay(.45));
  } else if (local >= 0) {
    if (!stepForward) { sc.reset(); for (let k = 0; k < local; k++) { const t = sc.beats[k](first[n] + k); t.progress(1); t.kill(); } }
    live.push(sc.beats[local](i));
  } else sc.reset();
  cur = i; curScene = n; setChrome(n, i); speaker(i); caption(i);
  if (!opts.remote && chan) chan.postMessage({ i });
  try { if (!MIRROR) history.replaceState(null, '', '#' + (i + 1)); } catch (e) {}
  if (auto) schedule();
}
if (chan) chan.onmessage = e => { if (typeof e.data.i === 'number' && e.data.i !== cur) go(e.data.i, { remote: true }); if (e.data.ask) chan.postMessage({ i: cur }); };

/* ---------- rehearsal: auto-advance on the 9:00 plan, optional voice ---------- */
let auto = false, voice = false, timer;
function schedule() { clearTimeout(timer); if (!auto) return; if (voice) return speak(); const d = cur < 0 ? 1.5 : LINES[cur].dur; timer = setTimeout(() => cur < LINES.length - 1 ? go(cur + 1) : toggleAuto(false), d * 1000); }
function speak() { speechSynthesis.cancel(); if (cur < 0) { timer = setTimeout(() => go(0), 1200); return; } const L = LINES[cur], u = new SpeechSynthesisUtterance(fillTokens(L.text, false).replace(/\[(\w+)\]/g, 'so many')); const vs = speechSynthesis.getVoices().filter(v => /^en/.test(v.lang)); if (vs.length) u.voice = vs[['P', 'A', 'I', 'N'].indexOf(L.who) % vs.length]; u.rate = 1.0; u.onend = () => { if (auto && voice) timer = setTimeout(() => cur < LINES.length - 1 ? go(cur + 1) : toggleAuto(false), SCRIPT[cur][4] * 1000); }; speechSynthesis.speak(u); }
function toggleAuto(v = !auto) { auto = v; document.body.classList.toggle('auto', auto); $('#autoflag').textContent = voice ? 'REHEARSAL · VOICE' : 'REHEARSAL · AUTO'; if (!auto) { clearTimeout(timer); try { speechSynthesis.cancel(); } catch (e) {} } else schedule(); }

/* ---------- input ---------- */
if (!MIRROR) {
  addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter', 'n'].includes(k)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(-1); else if (k === 'End') go(LINES.length - 1);
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); }
    else if (k === 'p' || k === 'P') window.open(location.pathname + '?presenter', 'rooted-presenter', 'width=1400,height=900');
    else if (k === 'c' || k === 'C') document.body.classList.toggle('showcap');
    else if (k === 'a' || k === 'A') { voice = false; toggleAuto(); }
    else if (k === 'v' || k === 'V') { voice = true; toggleAuto(!auto || !voice ? true : false); }
    else if (k === '?' || k === 'h') document.body.classList.toggle('showhelp');
    else if (k === 'Escape') { document.body.classList.remove('showhelp', 'showcap'); toggleAuto(false); }
  });
  stage.addEventListener('click', () => go(cur + 1));
  stage.addEventListener('contextmenu', e => { e.preventDefault(); go(cur - 1); });
  let idle; addEventListener('mousemove', () => { document.body.classList.remove('hidecursor'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('hidecursor'), 2000); });
}

/* ---------- start ---------- */
Object.keys(S).forEach(n => { if (n !== 'ready') S[n].reset(); });
$('#s-ready').classList.add('on'); gsap.set('#s-ready', { autoAlpha: 1 }); gsap.set('#chrome', { autoAlpha: 0 }); setChrome('ready', -1);
const start = parseInt(location.hash.slice(1)) - 1;
const boot = () => { if (start >= 0) go(start); else if (chan && MIRROR) chan.postMessage({ ask: 1 }); };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(boot, 50));
window.DECK = { go, get cur() { return cur; }, W, ff: () => live.forEach(t => t.progress(1)) };

/* =====================================================================
   ===================================================================== */
})();
/* PRESENTER VIEW  (?presenter) · the script, the timer, a live preview */

function presenter() {
  document.title = 'Presenter · Rooted SG';
  document.body.innerHTML = `
  <style>
  body{overflow:auto;background:#F3F3F1;font-family:'Hanken Grotesk',sans-serif;color:#0A0A0A;cursor:auto}
  .pv{display:grid;grid-template-columns:1.35fr 1fr;gap:28px;padding:28px;min-height:100vh}
  .pv .now{background:#fff;border-radius:28px;padding:34px 40px;box-shadow:inset 0 0 0 2px #0B5A32}
  .who{display:flex;align-items:center;gap:16px;font-family:'DM Mono',monospace;font-size:20px;letter-spacing:.12em;text-transform:uppercase}
  .who i{width:54px;height:54px;border-radius:50%;background:#0B5A32;color:#fff;display:grid;place-items:center;font:italic 30px Newsreader,serif}
  .who b{color:#0B5A32;font-weight:500}
  .line{font-family:Newsreader,serif;font-size:46px;line-height:1.2;letter-spacing:-.02em;margin-top:22px}
  .next{margin-top:24px;background:#fff;border-radius:24px;padding:24px 30px;box-shadow:inset 0 0 0 1.5px rgba(10,10,10,.16)}
  .next .line{font-size:30px;margin-top:10px}
  .side{display:flex;flex-direction:column;gap:20px}
  .prev{width:100%;aspect-ratio:16/9;border:0;border-radius:18px;background:#fff;box-shadow:0 20px 40px -24px rgba(0,0,0,.4)}
  .clock{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .clock div{background:#fff;border-radius:20px;padding:18px 22px}
  .clock span{display:block;font-family:'DM Mono',monospace;font-size:15px;letter-spacing:.12em;text-transform:uppercase}
  .clock b{display:block;font:300 52px/1.1 Newsreader,serif;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
  .ok{color:#0B5A32}.late{color:#984421}
  .btns{display:flex;gap:12px}.btns button{flex:1;font:500 20px 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase;padding:18px;border-radius:99px;border:0;background:#121A15;color:#fff;cursor:pointer}
  .btns button.l{background:#fff;color:#0A0A0A;box-shadow:inset 0 0 0 2px #0A0A0A}
  .list{grid-column:1/-1;background:#fff;border-radius:24px;padding:10px 0;max-height:none}
  .list div{display:grid;grid-template-columns:70px 120px 1fr 80px;gap:16px;padding:12px 26px;font-size:19px;line-height:1.4;cursor:pointer}
  .list div.on{background:#E4F0E8}
  .list div span{font-family:'DM Mono',monospace;font-size:15px;letter-spacing:.08em}
  mark.todo{background:#FBF1D6;color:#6B4A00;outline:2px dashed #D9A92E;border-radius:6px;padding:0 4px}
  </style>
  <div class="pv">
    <div><div class="now"><div class="who" id="who"></div><div class="line" id="line"></div></div><div class="next"><div class="who" id="nwho"></div><div class="line" id="nline"></div></div></div>
    <div class="side"><iframe class="prev" id="prev" src="${location.pathname}?mirror"></iframe>
      <div class="clock"><div><span>Elapsed</span><b id="el">0:00</b></div><div><span>Plan here</span><b id="plan">0:00</b></div><div><span>Ahead / behind</span><b id="dl">0:00</b></div></div>
      <div class="btns"><button class="l" id="bp">← Back</button><button id="bn">Next →</button><button class="l" id="br">Reset clock</button></div></div>
    <div class="list" id="list"></div>
  </div>`;
  const ch = new BroadcastChannel('rooted-catalyst'); let cur = -1, t0 = null;
  const m = s => { const a = Math.abs(s), r = `${Math.floor(a / 60)}:${String(Math.floor(a % 60)).padStart(2, '0')}`; return s < 0 ? '−' + r : r; };
  const list = document.getElementById('list');
  list.innerHTML = LINES.map(l => `<div data-i="${l.i}"><span>${String(l.i + 1).padStart(2, '0')}</span><span>${SPEAKERS[l.who].short} · ${m(l.at)}</span><p>${fillTokens(l.text)}</p><span>${l.dur.toFixed(1)}s</span></div>`).join('');
  list.onclick = e => { const d = e.target.closest('[data-i]'); if (d) send(+d.dataset.i); };
  function show(i) { cur = i; const L = LINES[i], N = LINES[i + 1];
    document.getElementById('who').innerHTML = L ? `<i>${SPEAKERS[L.who].short[0]}</i>${SPEAKERS[L.who].name} · <b>${L.crit}</b> · line ${i + 1}/${LINES.length}` : 'Ready · press Next to start';
    document.getElementById('line').innerHTML = L ? fillTokens(L.text) : 'The cold open starts on the first click.';
    document.getElementById('nwho').innerHTML = N ? `Next · ${SPEAKERS[N.who].name}${N.who !== (L || {}).who ? ' <b>· handover</b>' : ''}` : 'End';
    document.getElementById('nline').innerHTML = N ? fillTokens(N.text) : '';
    document.getElementById('plan').textContent = L ? m(L.at) : '0:00';
    [...list.children].forEach(d => d.classList.toggle('on', +d.dataset.i === i)); const on = list.children[i]; on && on.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (i >= 0 && t0 == null) t0 = performance.now(); }
  function send(i) { i = Math.max(-1, Math.min(LINES.length - 1, i)); ch.postMessage({ i }); show(i); }
  ch.onmessage = e => { if (typeof e.data.i === 'number') show(e.data.i); };
  ch.postMessage({ ask: 1 });
  document.getElementById('bn').onclick = () => send(cur + 1); document.getElementById('bp').onclick = () => send(cur - 1); document.getElementById('br').onclick = () => { t0 = cur >= 0 ? performance.now() - LINES[cur].at * 1000 : null; };
  addEventListener('keydown', e => { if (['ArrowRight', ' ', 'PageDown', 'ArrowDown'].includes(e.key)) { e.preventDefault(); send(cur + 1); } if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); send(cur - 1); } });
  setInterval(() => { if (t0 == null) return; const el = (performance.now() - t0) / 1000; document.getElementById('el').textContent = m(el); if (cur >= 0) { const d = LINES[cur].at - el, D = document.getElementById('dl'); D.textContent = (d >= 0 ? '+' : '') + m(d); D.className = d >= -5 ? 'ok' : 'late'; } }, 250);
  show(-1);
}
