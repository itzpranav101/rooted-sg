// ROOTED SG for RWCC: scroll-driven sequences. Everything here is driven by scroll position.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, lite = document.documentElement.classList.contains('lite');
const ok = !!(window.gsap && window.ScrollTrigger);
const fmt = n => Math.round(n).toLocaleString('en-US');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
if (reduced) document.documentElement.classList.add('rs-static');
if (/[?&]review\b/.test(location.search)) document.documentElement.classList.add('review');
$$('.mc-val').forEach(v => new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { v.classList.add('in'); o.disconnect(); } }, { threshold: .25 }).observe(v));

/* ---- play looping vignettes only while visible ---- */
$$('.dl-card,.stk-card').forEach(c => new IntersectionObserver(es => c.classList.toggle('in', es[0].isIntersecting), { threshold: .25 }).observe(c));

/* ---- small stuff that needs no scrolling library ---- */
const tick = $('#rstick');
if (tick && !reduced) { let tk = false; const upd = () => { tk = false; const w = tick.scrollWidth / 3; tick.style.transform = `translate3d(${-((scrollY * .55) % w)}px,0,0)`; }; addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(upd); } }, { passive: true }); upd(); }
const gr = $('#clsgr'); if (gr) for (let i = 0; i < 32; i++) { const d = document.createElement('i'); d.style.setProperty('--k', i); gr.appendChild(d); }

/* ---- side rail: where am I on this page ---- */
(() => {
  if (lite) return;
  const secs = $$('main > section[id]').filter(s => s.id !== 'rwclose');
  if (secs.length < 3) return;
  const rail = document.createElement('nav'); rail.className = 'rs-rail'; rail.setAttribute('aria-label', 'Sections on this page');
  secs.forEach(s => { const t = ($('.sechead .label b', s) || $('.rs-top .label b', s) || {}).textContent || s.id; const a = document.createElement('a'); a.href = '#' + s.id; a.innerHTML = `<span>${t}</span>`; a.setAttribute('aria-label', t); a.addEventListener('click', e => { e.preventDefault(); s.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }); rail.appendChild(a); });
  document.body.appendChild(rail);
  const links = $$('a', rail);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = secs.indexOf(e.target); links.forEach((l, k) => l.classList.toggle('on', k === i)); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));
})();

/* ---- tilt cards toward the pointer ---- */
if (!lite && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  $$('.member,.rw-proof>div,.dl-card,.mv-do>div,.nine-cols>div,.bw-cell').forEach(c => {
    c.classList.add('rs-tilt');
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5, m = Math.hypot(x, y) || 1; c.style.rotate = `${y.toFixed(3)} ${(-x).toFixed(3)} 0 ${Math.min(5, m * 9).toFixed(2)}deg`; });
    c.addEventListener('pointerleave', () => { c.style.rotate = ''; });
  });
}

if (!ok) return;

/* ---- helpers ---- */
const pinned = (el, scrolls, cb, extra = {}) => ScrollTrigger.create(Object.assign({ trigger: el, pin: true, start: 'top top', end: () => '+=' + Math.round(scrolls * innerHeight), scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
  onUpdate: s => { el.classList.toggle('moved', s.progress > .015); cb(s.progress); } }, extra));
// timeline driven by scroll, with a little easing so it never feels jerky
const drive = (el, scrolls, tl) => { if (reduced) { tl.progress(1); return; } pinned(el, scrolls, p => gsap.to(tl, { progress: p, duration: .55, ease: 'power3.out', overwrite: true })); };

/* =========================================================
   HOME: fourteen days with one plant
   ========================================================= */
(() => {
  const root = $('#fortnight'); if (!root) return;
  const svg = $('#fnsvg'), sel = id => '#' + id;
  const ATT = { fnL1: [320, 225], fnR1: [320, 215], fnL2: [320, 175], fnR2: [320, 165], fnT: [320, 115] };
  Object.entries(ATT).forEach(([id, o]) => gsap.set(sel(id), { svgOrigin: o.join(' '), scale: 0 }));
  gsap.set('#fnstem', { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set('#fnsun', { x: 110, y: 110 });
  gsap.set('#fncan', { x: 100, y: 124, opacity: 0, svgOrigin: '200 140' });
  gsap.set('#fnflower', { svgOrigin: '320 62', scale: 0, opacity: 0 });
  gsap.set(svg, { '--wilt': 0, '--dry': 0 });
  const drops = $$('#fndrops circle');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to('#fnstem', { strokeDashoffset: 0, duration: 5, ease: 'power2.out' }, 0);
  [['fnL1', .8], ['fnR1', 1.4], ['fnL2', 2.6], ['fnR2', 3.2], ['fnT', 4.4]].forEach(([id, t]) => tl.to(sel(id), { scale: 1, duration: .8, ease: 'back.out(2)' }, t));
  tl.to('#fntag', { opacity: 1, duration: .5 }, .4);
  tl.to('#fnsun', { x: 530, duration: 14 }, 0);
  tl.to('#fnsun', { keyframes: [{ y: 52, duration: 7, ease: 'sine.out' }, { y: 110, duration: 7, ease: 'sine.in' }] }, 0);
  tl.to('#fnflash', { opacity: .55, duration: .08 }, 1.3).to('#fnflash', { opacity: 0, duration: .3 }, 1.4);
  tl.to('#fnflash', { opacity: .55, duration: .08 }, 10.2).to('#fnflash', { opacity: 0, duration: .3 }, 10.3);
  // forgotten days: the plant wilts, the soil dries
  tl.to(svg, { '--wilt': 1, '--dry': 1, duration: 2.6, ease: 'power1.inOut' }, 5.1);
  tl.to(['#fnL1', '#fnL2'], { rotation: -44, duration: 2.6, ease: 'power1.inOut' }, 5.1).to(['#fnR1', '#fnR2'], { rotation: 44, duration: 2.6, ease: 'power1.inOut' }, 5.1).to('#fnT', { rotation: 26, duration: 2.6, ease: 'power1.inOut' }, 5.1);
  tl.to('#fnzz', { opacity: 1, duration: .5 }, 5.8).to('#fnzz', { opacity: 0, duration: .5 }, 8);
  // the fix
  tl.to('#fncan', { opacity: 1, x: 170, rotation: 20, duration: .8, ease: 'power2.out' }, 8.2);
  [0, 1].forEach(r => drops.forEach((d, j) => { const t0 = 8.9 + r * .95 + j * .22; tl.fromTo(d, { x: 268 + j * 3, y: 146, opacity: 1 }, { y: 250, duration: .55, ease: 'power1.in', immediateRender: false }, t0).set(d, { opacity: 0 }, t0 + .56); }));
  tl.to(svg, { '--wilt': 0, '--dry': 0, duration: 1.8, ease: 'power1.inOut' }, 9.3);
  tl.to(['#fnL1', '#fnR1', '#fnL2', '#fnR2', '#fnT'], { rotation: 0, duration: 1.8, ease: 'power1.inOut' }, 9.3);
  tl.to('#fncan', { opacity: 0, x: 90, rotation: 0, duration: .6 }, 10.6);
  tl.to('#fnflower', { opacity: 1, scale: 1, duration: .9, ease: 'back.out(2.2)' }, 11.4);
  tl.to({}, { duration: .001 }, 13.999);

  const CAP = [[0, 'Day 1 · Name a real plant', 'Pandan, on the windowsill. Only living plants count.'], [1, 'Day 2 · Check in with a photo', 'A fresh photo at the right time. The app checks it is real.'], [2.2, 'Days 3 to 5 · Verified, so the day counts', 'A small habit, one verified day at a time.'], [5, 'Day 6 · Life gets busy', 'No check-in. Three days go by, and the plant starts to droop.'], [6.5, 'Day 7 · Mojo notices first', 'A gentle nudge, before the plant is lost.'], [8, 'Day 9 · The Plant Doctor finds the clue', 'The AI suggests dry soil. You make the call.'], [9.6, 'Day 10 · A small fix, and the plant lifts', 'The record resumes. The gap stays honest.'], [11.2, 'Day 14 · It flowers', '11 verified Plant-Days, and 3 gaps that never count.']];
  const cards = $$('.fn-c', root), cap = $('#fncap'), capB = $('b', cap), capP = $('p', cap), dayEl = $('#fnday'), scoreEl = $('#fnscore'), nameEl = $('#fnname');
  const ticks = $('#fnticks'); for (let i = 0; i < 14; i++) ticks.appendChild(document.createElement('i'));
  const tk = [...ticks.children]; let last = { c: '', k: -1, d: -1 };
  const NAME = 'PANDAN';
  const render = () => {
    const t = tl.time(), day = Math.min(14, Math.floor(t) + 1);
    const c = t < 1.2 ? 'name' : t < 2.2 ? 'check' : t < 5 ? 'ok' : t < 6.5 ? '' : t < 8 ? 'nudge' : t < 9.6 ? 'doc' : t < 11.2 ? 'ok' : 'done';
    if (c !== last.c) { last.c = c; cards.forEach(x => x.classList.toggle('on', x.dataset.c === c)); }
    if (t < 1.2) nameEl.textContent = NAME.slice(0, Math.min(6, Math.floor(t / .14))) || ' ';
    let k = 0; CAP.forEach((x, i) => { if (t >= x[0]) k = i; });
    if (k !== last.k) { last.k = k; capB.textContent = CAP[k][1]; capP.textContent = CAP[k][2]; gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, overwrite: true }); }
    if (day !== last.d) { last.d = day; dayEl.textContent = String(day).padStart(2, '0'); const missed = Math.min(Math.max(day - 5, 0), 3); scoreEl.textContent = day - missed;
      tk.forEach((el, i) => { const n = i + 1, miss = n >= 6 && n <= 8; el.className = (n <= day ? (miss ? 'm' : 'v') : '') + (n === day ? ' c' : ''); }); }
  };
  tl.eventCallback('onUpdate', render); render();
  drive(root, 5, tl);
})();

/* =========================================================
   PROBLEM: out of every 100 people
   ========================================================= */
(() => {
  const root = $('#funnel'); if (!root) return;
  const g = $('#fugrid'); for (let i = 0; i < 100; i++) g.appendChild(document.createElement('i'));
  const ds = [...g.children], big = $('#fun'), lab = $('#fulab'), txt = $('#futxt'), keys = $$('.fu-keys span', root);
  const T = ['Scroll to count them. Out of every 100 people we surveyed:', 'want to grow plants at home (83.9%, mean 4.32 out of 5).', 'tried to grow something, and gave up (23.4%). People say they want to, but do not manage to.', 'have kept a plant alive for more than a year (18%). This is the gap Rooted SG is built for.'];
  const L = ['of 100', 'want to', 'tried, and gave up', 'kept one alive for a year'];
  let sig = '';
  const render = p => {
    let st = new Array(100).fill(''), n = 0, ph = 0;
    if (p >= .05) { const a = clamp((p - .05) / .28); const lit = Math.round(84 * a); for (let i = 0; i < lit; i++) st[i] = 'w'; n = lit; ph = 1; }
    if (p >= .40) { const q = clamp((p - .40) / .22), w = Math.round(23 * q), f = Math.round(61 * q); for (let i = 0; i < 84; i++) st[i] = 'w'; for (let i = 0; i < w; i++) st[i] = 't'; for (let i = 0; i < f; i++) st[83 - i] = 'f'; n = 84 - f; ph = 2; }
    if (p >= .68) { const r = clamp((p - .68) / .22), k = Math.round(18 * r), f2 = Math.round(5 * r); for (let i = 0; i < 84; i++) st[i] = i < 23 ? 't' : 'f'; for (let i = 0; i < k; i++) st[i] = 'k'; for (let i = 0; i < f2; i++) st[22 - i] = 'f'; n = 23 - f2; ph = 3; }
    const s = st.join('') + ph; if (s === sig) return; sig = s;
    ds.forEach((d, i) => { const c = st[i]; if (d.className !== c) d.className = c; });
    big.textContent = n; lab.textContent = L[ph]; txt.textContent = T[ph]; keys.forEach((k, i) => k.classList.toggle('on', i === ph - 1));
  };
  render(0);
  if (reduced) { render(1); return; }
  pinned(root, 4.5, render);
})();

/* =========================================================
   APP: an example day, sideways
   ========================================================= */
(() => {
  const root = $('#dayinlife'); if (!root) return;
  const view = $('.dl-view', root), track = $('#dltrack'), bar = $('#dlbar'), cards = $$('.dl-card', root);
  const dist = () => Math.max(0, track.scrollWidth - (view.clientWidth - parseFloat(getComputedStyle(view).paddingLeft)));
  if (reduced) { view.style.overflowX = 'auto'; return; }
  ScrollTrigger.create({ trigger: root, pin: true, start: 'top top', end: () => '+=' + Math.round(dist() * 1.15 + innerHeight * .25), scrub: .5, anticipatePin: 1, invalidateOnRefresh: true,
    onUpdate: s => { root.classList.toggle('moved', s.progress > .015); gsap.set(track, { x: -dist() * clamp(s.progress / .92) }); bar.style.transform = `scaleX(${s.progress})`; } });
})();

/* =========================================================
   stacked cards: each one tucks under the next
   ========================================================= */
['#whostk', '#valstk'].forEach(sel => { const stk = $(sel); if (!stk || reduced) return; const cs = $$('.stk-card', stk);
  if (matchMedia('(max-width:760px)').matches) return;
  cs.forEach((c, i) => { if (i === 0) return; ScrollTrigger.create({ trigger: c, start: 'top 92%', end: () => 'top ' + (74 + i * 18 + 6), scrub: true, animation: gsap.to(cs[i - 1], { scale: .94, opacity: .55, ease: 'none' }) }); }); });

/* =========================================================
   IMPACT: one school, then sixty
   ========================================================= */
(() => {
  const root = $('#scale'); if (!root) return;
  const stage = $('#scstage'), world = $('#scworld');
  const W = 1000, GAP = 14, bw = (W - GAP * 9) / 10, bh = bw * 10 / 12, WH = bh * 6 + GAP * 5;
  world.style.width = W + 'px'; world.style.gap = GAP + 'px';
  const blocks = [];
  for (let i = 0; i < 60; i++) { const b = document.createElement('div'); b.className = 'sc-b' + (i === 0 ? ' one' : ''); if (i === 0) { for (let k = 0; k < 120; k++) b.appendChild(document.createElement('i')); } else { b.style.opacity = 0; const sp = document.createElement('span'); sp.className = 'sp'; b.appendChild(sp); } world.appendChild(b); blocks.push(b); }
  const dots = $$('i', blocks[0]);
  const els = { s: $('#sc-s'), st: $('#sc-st'), p: $('#sc-p'), cap: $('#sccap'), form: $('#scform') };
  const CAP = [['One school', '120 students, each with about two plants at home.'], ['Then sixty', 'Sixty schools by year three is the base case in our forecast.'], ['The extra plants kept alive', 'A 12-point rise in survival across 60 schools is 1,814 more plants alive after twelve months. A forecast, not a result.']];
  let sw = 0, sh = 0, sz = 1, so = 1, capI = -1;
  const measure = () => { sw = stage.clientWidth; sh = stage.clientHeight; sz = (sh * .84) / bh; so = Math.min(sw / W, sh / WH) * .94; };
  const dist = i => { const c = i % 10, r = Math.floor(i / 10); return (c + r) / 14; };
  const render = p => {
    if (!sw) measure();
    const fill = clamp(p / .22), e = ease(clamp((p - .26) / .3)), r = clamp((p - .64) / .28);
    const lit = Math.round(120 * fill); dots.forEach((d, i) => d.classList.toggle('on', i < lit));
    const s = sz * Math.pow(so / sz, e);
    const tz = { x: sw / 2 - (bw / 2) * sz, y: sh / 2 - (bh / 2) * sz }, to = { x: (sw - W * so) / 2, y: (sh - WH * so) / 2 };
    world.style.transform = `translate(${lerp(tz.x, to.x, e)}px,${lerp(tz.y, to.y, e)}px) scale(${s})`;
    blocks.forEach((b, i) => { if (i === 0) return; const a = clamp((e - dist(i) * .7) / .3); b.style.opacity = a; const sp = b.firstChild; const q = clamp((r - (i / 60) * .6) / .4); sp.style.scale = ease(q); b.classList.toggle('fill', q > .5); });
    const sch = 1 + Math.round(59 * e), pl = 1814 * r;
    els.s.textContent = sch; els.st.textContent = fmt(sch * 120 * (fill < 1 ? Math.max(fill, .001) : 1)); els.p.textContent = fmt(pl);
    const ci = p < .26 ? 0 : p < .62 ? 1 : 2; if (ci !== capI) { capI = ci; els.cap.innerHTML = `<b>${CAP[ci][0]}</b><p>${CAP[ci][1]}</p>`; } els.form.classList.toggle('on', r > .95);
  };
  ScrollTrigger.addEventListener('refreshInit', () => { measure(); });
  measure(); render(0);
  if (reduced) { render(1); return; }
  pinned(root, 5, render);
})();

/* =========================================================
   ABOUT: the grandparents' table
   ========================================================= */
(() => {
  const root = $('#table'); if (!root) return;
  const svg = $('#tbsvg'), plants = $$('.tbp', svg), oks = $$('.ok', svg), pulses = $$('.pulse', svg), lines = $$('#tblines p');
  plants.forEach(pl => { const cx = +pl.dataset.cx; gsap.set($('.stm', pl), { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.set($('.lL', pl), { svgOrigin: `${cx} 190`, scale: 0 }); gsap.set($('.lR', pl), { svgOrigin: `${cx} 176`, scale: 0 }); gsap.set($('.lT', pl), { svgOrigin: `${cx} 156`, scale: 0 }); gsap.set(pl, { '--w': 0 }); });
  oks.forEach(o => { const m = o.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/); gsap.set(o, { svgOrigin: `${m[1]} ${m[2]}`, scale: 0 }); });
  gsap.set('#tbphone', { svgOrigin: '320 314', scale: .2, opacity: 0 }); gsap.set(lines, { opacity: 0, y: 14 });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  plants.forEach((pl, i) => { const s = i * .32; tl.to($('.stm', pl), { strokeDashoffset: 0, duration: .9, ease: 'power2.out' }, s).to($('.lL', pl), { scale: 1, duration: .5, ease: 'back.out(2)' }, s + .5).to($('.lR', pl), { scale: 1, duration: .5, ease: 'back.out(2)' }, s + .65).to($('.lT', pl), { scale: 1, duration: .5, ease: 'back.out(2)' }, s + .8); });
  const show = (i, a, b) => { tl.to(lines[i], { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, a); if (b != null) tl.to(lines[i], { opacity: 0, y: -12, duration: .35 }, b); };
  show(0, .2, 2.6); show(1, 3, 4.9); show(2, 5, 6.5); show(3, 6.7);
  [1, 3].forEach(i => { const pl = plants[i]; tl.to(pl, { '--w': 1, duration: 1.6, ease: 'power1.inOut' }, 3.2).to($('.lL', pl), { rotation: -38, duration: 1.6, ease: 'power1.inOut' }, 3.2).to($('.lR', pl), { rotation: 38, duration: 1.6, ease: 'power1.inOut' }, 3.2).to($('.lT', pl), { rotation: 22, duration: 1.6, ease: 'power1.inOut' }, 3.2); });
  tl.to('#tbphone', { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.8)' }, 5.2);
  [0, 2, 4].forEach((i, k) => tl.to(oks[i], { scale: 1, duration: .45, ease: 'back.out(2.4)' }, 5.7 + k * .3));
  pulses.forEach(pu => { const cx = +pu.getAttribute('cx'); [0, 1].forEach(r => tl.fromTo(pu, { attr: { r: 24 }, opacity: .9 }, { attr: { r: 52 }, opacity: 0, duration: .9, ease: 'power1.out', immediateRender: false }, 6.2 + r * 1.0)); });
  [1, 3].forEach(i => { const pl = plants[i]; tl.to(pl, { '--w': 0, duration: 1.4, ease: 'power1.inOut' }, 7.3).to([$('.lL', pl), $('.lR', pl), $('.lT', pl)], { rotation: 0, duration: 1.4, ease: 'power1.inOut' }, 7.3); });
  [1, 3].forEach((i, k) => tl.to(oks[i], { scale: 1, duration: .45, ease: 'back.out(2.4)' }, 8.8 + k * .3));
  tl.to({}, { duration: .001 }, 9.999);
  const txt = $('#tbtxt'); tl.eventCallback('onUpdate', () => { const t = tl.time(); const n = [5.7, 6, 6.3, 8.8, 9.1].filter(x => t >= x + .2).length; txt.textContent = n + ' / 5'; });
  drive(root, 4.5, tl);
})();

/* =========================================================
   ABOUT: what nine months grew
   ========================================================= */
(() => {
  const root = $('#built'); if (!root) return;
  const cells = $$('.bw-cell', root), nums = cells.map(c => $('[data-n]', c)), vine = $('#bwvine');
  gsap.set(vine, { strokeDasharray: 1, strokeDashoffset: 1 });
  const render = p => { cells.forEach((c, i) => { const a = clamp((p - .06 - i * .13) / .22); c.classList.toggle('on', a > 0); nums[i].textContent = fmt(+nums[i].dataset.n * ease(a)); }); vine.style.strokeDashoffset = 1 - p; };
  render(0); if (reduced) { render(1); return; }
  pinned(root, 3.4, render);
})();



/* ---- magnetic snap: when scrolling settles near the top of a section, it pulls into place ---- */
(() => {
  if (reduced || lite || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const heads = () => $$('main > section:not(.rs-pin):not([data-pin]), main > header, main > .rs-tick');
  let t = 0, busy = false, dragging = false;
  addEventListener('pointerdown', () => { dragging = true; }); addEventListener('pointerup', () => { dragging = false; });
  const settle = () => {
    if (busy || dragging || document.hidden) return;
    if (ScrollTrigger.getAll().some(s => s.pin && s.isActive)) return;   // never fight a pinned scene
    const vh = innerHeight; let best = null;
    heads().forEach(el => { const top = el.getBoundingClientRect().top; if (Math.abs(top) < vh * .16 && Math.abs(top) > 3 && (!best || Math.abs(top) < Math.abs(best.top))) best = { el, top }; });
    if (!best) return;
    busy = true; scrollTo({ top: scrollY + best.top, behavior: 'smooth' }); setTimeout(() => { busy = false; }, 800);
  };
  addEventListener('scroll', () => { if (busy) return; clearTimeout(t); t = setTimeout(settle, 140); }, { passive: true });
})();

ScrollTrigger.sort(); ScrollTrigger.refresh(); addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
