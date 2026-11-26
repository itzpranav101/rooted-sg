// Meco deck engine: arrow keys / clicker / click / swipe. Every slide has builds (steps); each press reveals the next one.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const slides = $$('.slide'), N = slides.length, count = $('#count'), prog = $('#prog i');
let cur = -1, step = 0, busy = false;

/* ---------- scale the 1920x1080 stage to the window ---------- */
function fit() { const s = Math.min(innerWidth / 1920, innerHeight / 1080); $$('.stage').forEach(st => st.style.transform = `translate(${-960 * s}px,${-540 * s}px) scale(${s})`); document.documentElement.style.setProperty('--sc', s); }
addEventListener('resize', fit); fit();

/* ---------- prepare ---------- */
function splitWords(el) { if (el.dataset.sp) return; el.dataset.sp = 1;
  const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const m = document.createElement('span'); m.className = 'mask'; m.innerHTML = `<span>${w}</span>`; f.append(m); } }); c.replaceWith(f); } else if (c.nodeType === 1) walk(c); }); walk(el); }
$$('.h1,.h2,.h3').forEach(splitWords);
$$('.draw').forEach(p => { try { p.setAttribute('pathLength', 1); p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; } catch (e) {} });
$$('[data-count]').forEach(el => { const to = el.dataset.count, dec = (to.split('.')[1] || '').length, str = parseFloat(to).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }), suf = el.dataset.suffix || '', ds = str.replace(/\D/g, '');
  el.setAttribute('aria-label', str + suf);
  el.innerHTML = '<span class="od">' + [...str].map(ch => /\d/.test(ch) ? '<span class="od-c"><span class="od-s">' + '0123456789'.repeat(3).split('').map(d => '<i>' + d + '</i>').join('') + '</span></span>' : '<span class="od-p">' + ch + '</span>').join('') + (suf ? '<span class="od-p">' + suf + '</span>' : '') + '</span>';
  $$('.od-s', el).forEach((s, i) => s.dataset.d = ds[i]); });
const inRange = (v, n) => { const [a, b] = String(v).split('-').map(Number); return n >= a && n <= (b ?? 9999); };

/* ---------- steps ---------- */
function applyStep(sl, n, animate = true) {
  $$('[data-s]', sl).forEach(el => { const on = inRange(el.dataset.s, n), isDraw = el.classList.contains('draw') || el.querySelector?.('.draw');
    if (el.classList.contains('draw')) { gsap.to(el, { strokeDashoffset: on ? 0 : 1, duration: animate ? 1.4 : 0, ease: 'power2.inOut' }); return; }
    gsap.to(el, { opacity: on ? 1 : 0, y: on ? 0 : 30, duration: animate ? .7 : 0, ease: 'expo.out', overwrite: 'auto', onStart: () => { el.style.pointerEvents = on ? 'auto' : 'none'; } });
    $$('.draw', el).forEach(p => gsap.to(p, { strokeDashoffset: on ? 0 : 1, duration: animate ? 1.4 : 0, ease: 'power2.inOut', delay: on ? .15 : 0 })); });
  $$('[data-simg]', sl).forEach(im => im.classList.toggle('on', inRange(im.dataset.simg, n)));
  const ps = (sl.dataset.ps || '').split(',').map(Number).filter(v => !isNaN(v));
  if (ps.length) { const t = ps[Math.min(n, ps.length - 1)]; $$('canvas[data-scene]', sl).forEach(c => { const o = { v: parseFloat(c.dataset.p || 0) }; gsap.to(o, { v: t, duration: animate ? 2.2 : 0, ease: 'power2.inOut', overwrite: true, onUpdate: () => c.dataset.p = o.v.toFixed(4) }); }); }
  const vid = $('video', sl); if (vid && sl.dataset.play) { if (n >= +sl.dataset.play) { vid.muted = false; vid.play().catch(() => { vid.muted = true; vid.play(); }); } else vid.pause(); }
  $$('[data-count]', sl).forEach(c => { const host = c.closest('[data-s]'); if (host && inRange(host.dataset.s, n)) roll(c, animate); });
  $$('[data-pop]', sl).forEach(el => { if (el.dataset.pop === String(n) && animate) gsap.fromTo(el, { scale: .96 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.5)' }); });
}
const stepsOf = sl => +sl.dataset.steps || 0;
function roll(el, animate) { $$('.od-s', el).forEach((st, k) => { const to = -(20 + +st.dataset.d) / 30 * 100; if (st.dataset.done && animate) return; st.dataset.done = 1; gsap.fromTo(st, { yPercent: animate ? 0 : to }, { yPercent: to, duration: animate ? 2.2 + k * .12 : 0, ease: 'expo.inOut' }); }); }

/* ---------- enter / leave ---------- */
function show(i, dir, startStep) {
  if (i < 0 || i >= N || busy || i === cur) return; busy = true;
  const prev = slides[cur], next = slides[i]; next.classList.add('on');
  const st = $('.stage', next);
  // base state
  $$('[data-s]', next).forEach(el => { if (!el.classList.contains('draw')) gsap.set(el, { opacity: 0, y: 30 }); });
  $$('.a', next).forEach(el => gsap.set(el, { opacity: 0 }));
  $$('.h1 .mask>span,.h2 .mask>span,.h3 .mask>span', next).forEach(el => gsap.set(el, { yPercent: 118, rotate: 4 }));
  const tl = gsap.timeline(); gsap.delayedCall(.5, () => { busy = false; });
  if (prev) tl.to(prev, { opacity: 0, x: dir > 0 ? -80 : 80, duration: .45, ease: 'power2.in', onComplete: () => { prev.classList.remove('on'); gsap.set(prev, { clearProps: 'all' }); const v = $('video', prev); v && v.pause(); } }, 0);
  tl.fromTo(next, { opacity: 0, x: dir > 0 ? 100 : -100 }, { opacity: 1, x: 0, duration: .7, ease: 'expo.out' }, prev ? .25 : 0);
  const t0 = prev ? .4 : .05;
  $$('.h1 .mask>span,.h2 .mask>span,.h3 .mask>span', next).forEach((el, k) => tl.to(el, { yPercent: 0, rotate: 0, duration: 1.3, ease: 'expo.out' }, t0 + k * .04));
  $$('.a', next).forEach((el, k) => { const f = el.dataset.from; const from = { opacity: 0, y: f ? 0 : 60 }; if (f === 'left') from.x = -140; if (f === 'right') from.x = 140; if (f === 'scale') { from.scale = .9; from.y = 0; } tl.fromTo(el, from, { opacity: 1, y: 0, x: 0, scale: 1, duration: 1.2, ease: 'expo.out' }, t0 + .2 + k * .07); });
  $$('.draw:not([data-s])', next).forEach((p, k) => tl.to(p, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, t0 + .3 + k * .15));
  $$('[data-count]', next).filter(el => !el.closest('[data-s]')).forEach(el => $$('.od-s', el).forEach((s, k) => { s.dataset.done = 1; tl.fromTo(s, { yPercent: 0 }, { yPercent: -(20 + +s.dataset.d) / 30 * 100, duration: 2.4 + k * .14, ease: 'expo.inOut' }, t0 + .3); }));
  cur = i; step = startStep ?? 0;
  $$('canvas[data-scene]', next).forEach(c => { const ps = (next.dataset.ps || '').split(',').map(Number); c.dataset.p = (ps[0] ?? 0); });
  applyStep(next, step, false);
  update();
}
function update() { count.innerHTML = `<b>${String(cur + 1).padStart(2, '0')}</b> / ${String(N).padStart(2, '0')}`; prog.style.transform = `scaleX(${(cur + 1) / N})`; history.replaceState(null, '', '#' + (cur + 1)); }

function next() { const sl = slides[cur]; if (step < stepsOf(sl)) { step++; applyStep(sl, step); } else show(cur + 1, 1); }
function prev() { const sl = slides[cur]; if (step > 0) { step--; applyStep(sl, step); } else if (cur > 0) { const p = slides[cur - 1]; show(cur - 1, -1, stepsOf(p)); } }

/* ---------- input: keyboard, clicker, click, swipe ---------- */
const NEXT = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter', 'n', 'N', '.'], PREV = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p', 'P', ','];
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (NEXT.includes(e.key)) { e.preventDefault(); next(); hideHint(); }
  else if (PREV.includes(e.key)) { e.preventDefault(); prev(); hideHint(); }
  else if (e.key === 'Home') { e.preventDefault(); show(0, -1); }
  else if (e.key === 'End') { e.preventDefault(); show(N - 1, 1, stepsOf(slides[N - 1])); }
  else if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
  else if (e.key === 'k' || e.key === 'K') { const v = $('video', slides[cur]); v && (v.paused ? v.play() : v.pause()); }
});
$('#navL').onclick = () => { prev(); hideHint(); }; $('#navR').onclick = () => { next(); hideHint(); };
let tx = 0, ty = 0; addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev(); }, { passive: true });
let wl = 0; addEventListener('wheel', e => { e.preventDefault(); const n = performance.now(); if (Math.abs(e.deltaY) < 30 || busy || e.ctrlKey || n - wl < 1000) return; wl = n; e.deltaY > 0 ? next() : prev(); }, { passive: false });
let hintT; const hint = $('#hint'); function hideHint() { clearTimeout(hintT); gsap.to(hint, { opacity: 0, y: 20, duration: .5, onComplete: () => hint.style.display = 'none' }); }
hintT = setTimeout(hideHint, 7000);

const start = clamp((parseInt(location.hash.slice(1)) || 1) - 1, 0, N - 1);
show(start, 1);
window.deck = { next, prev, show };
})();
