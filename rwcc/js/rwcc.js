// ROOTED SG for RWCC: page animations and small cursor effects.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, lite = document.documentElement.classList.contains('lite');
const seen = (el, cb, thr = .35) => { if (!el) return; new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); cb(el); } }, { threshold: thr }).observe(el); };
const whileVisible = (el, fn, ms) => { if (!el || reduced) return; let t = 0, vis = false; new IntersectionObserver(es => { vis = es[0].isIntersecting; clearInterval(t); if (vis) { fn(); t = setInterval(fn, ms); } }, { threshold: .3 }).observe(el); };
const fmt = n => Math.round(n).toLocaleString('en-US');

/* ---- the problem: 100 sprouts ---- */
(() => { const w = $('#rwdots'); if (!w) return; for (let i = 0; i < 100; i++) { const d = document.createElement('i'); d.style.setProperty('--i', i); w.appendChild(d); } const ds = [...w.children];
  const T = { 84: 'of people want to grow plants at home (83.9%, top-2-box interest, mean 4.32 out of 5).', 23: 'tried to grow something, and gave up (23.4%). People say they want to, but don\'t manage to.', 18: 'have kept a plant alive for more than a year (18%). This is the gap Rooted SG is built for.' };
  const set = n => { ds.forEach((d, i) => d.classList.toggle('on', i < n)); w.classList.toggle('warm', n === 23); $('#dn').textContent = n; $('#dtxt').textContent = T[n]; $$('.dots-ui .tfilter button').forEach(b => b.classList.toggle('on', +b.dataset.d === n)); };
  $$('.dots-ui .tfilter button').forEach(b => b.addEventListener('click', () => set(+b.dataset.d))); seen(w, () => set(84), .4); })();

/* ---- Pareto ---- */
(() => { const c = $('#parchart'); if (!c) return; const bars = $$('.b', c), vals = $$('.vals text', c);
  bars.forEach((b, i) => { const v = +b.dataset.v, h = v / 50 * 262; b.setAttribute('y', 276); b.setAttribute('height', 0); b._h = h; b._y = 276 - h; vals[i].setAttribute('y', 276 - h - 8); });
  seen(c, () => { c.classList.add('go'); bars.forEach(b => { b.setAttribute('y', b._y); b.setAttribute('height', b._h); }); }, .4); })();
['#wbars', '#dbars', '#ring', '#cmp', '#reach', '#sens', '#fcchart', '#ctlchart', '#conv', '#docflow', '#ba'].forEach(s => seen($(s), el => el.classList.add('go'), .3));
$$('#cmp .cr:not(.head)').forEach((r, i) => $$('svg', r).forEach((svg, k) => { svg.style.setProperty('--r', i); svg.style.setProperty('--c', k); }));
$$('#conv li').forEach((l, i) => l.style.setProperty('--k', i)); $$('#ba .br:not(.head)').forEach((r, i) => $$('.a', r).forEach(a => a.style.setProperty('--r', i)));

/* ---- phone tabs on the home page ---- */
(() => { const pills = $$('.rw-pills button'), phs = $$('.rw-stage .ph'), cap = $('#rwcap'); if (!pills.length) return;
  const C = [['Today', 'One key number. It only grows while your plants stay alive.'], ['Mojo', 'Tells you which plant needs you first.'], ['Plant Doctor', 'The AI finds clues. You make the call.'], ['Verified check-in', 'Real plant, fresh photo, valid time.'], ['Guardian Path', 'Real plant science, one card at a time.'], ['Roots', 'Neighbours share what they grow.']];
  let cur = 0, auto = true; const set = i => { cur = i; pills.forEach((p, k) => p.classList.toggle('on', k === i)); phs.forEach((p, k) => p.classList.toggle('on', k === i)); cap.innerHTML = `<b>${C[i][0]}</b><span>${C[i][1]}</span>`; };
  pills.forEach((p, i) => p.addEventListener('click', () => { auto = false; set(i); })); setInterval(() => { if (auto && !document.hidden) set((cur + 1) % 6); }, 3600); })();

/* ---- habit loop ---- */
(() => { const w = $('#hloop'); if (!w) return; const li = $$('.hl-steps li', w), img = $('#hlimg'), st = $('#hlstreak'); let cur = 0, hold = false;
  const set = i => { cur = i; li.forEach((l, k) => l.classList.toggle('on', k === i)); img.src = `media/mojo/${li[i].dataset.m}.gif`; st.textContent = i === 2 ? 6 : 5; };
  li.forEach((l, i) => { l.addEventListener('click', () => { hold = true; set(i); }); l.addEventListener('pointerenter', () => { hold = true; set(i); }); l.addEventListener('pointerleave', () => hold = false); });
  whileVisible(w, () => { if (!hold) set((cur + 1) % 3); }, 3000); })();

/* ---- mistake-proofing gates: loops by itself ---- */
(() => { const w = $('#gates'); if (!w) return; const gs = $$('.gate', w), ls = $$('.gl', w); const run = () => { gs.forEach(g => g.classList.remove('ok')); ls.forEach(l => l.classList.remove('ok')); [0, 1, 2, 3].forEach(i => setTimeout(() => { gs[i].classList.add('ok'); if (ls[i]) ls[i].classList.add('ok'); }, 500 + i * 750)); };
  if (reduced) { gs.forEach(g => g.classList.add('ok')); ls.forEach(l => l.classList.add('ok')); return; } whileVisible(w, run, 5200); })();
(() => { const k = $('#kz'); if (!k) return; const li = $$('li', k); let i = 0; whileVisible(k, () => { li.forEach((l, n) => l.classList.toggle('on', n === i)); i = (i + 1) % li.length; }, 1100); })();

/* ---- road map ---- */
(() => { const r = $('#road'); if (!r) return; const rd = $$('.rd', r); let i = 0; whileVisible(r, () => { rd.forEach((d, n) => d.classList.toggle('on', n <= i)); i = (i + 1) % (rd.length + 1); }, 1700); })();

/* ---- the arithmetic ---- */
(() => { const S = $('#i-s'); if (!S) return; const ids = { s: $('#i-s'), st: $('#i-st'), p: $('#i-p'), u: $('#i-u') };
  const upd = () => { const s = +ids.s.value, st = +ids.st.value, p = +ids.p.value, u = +ids.u.value, hh = s * st, pl = hh * p, r = pl * u / 100;
    $('#v-s').textContent = s; $('#v-st').textContent = st; $('#v-p').textContent = p.toFixed(1); $('#v-u').textContent = u; $('#o-h').textContent = fmt(hh); $('#o-pl').textContent = fmt(pl); $('#o-u').textContent = `18% → ${18 + u}%`; $('#o-r').textContent = fmt(r); };
  Object.values(ids).forEach(i => i.addEventListener('input', upd)); $('#c-reset').addEventListener('click', () => { ids.s.value = 60; ids.st.value = 120; ids.p.value = 2.1; ids.u.value = 12; upd(); }); upd(); })();

/* ---- story: rings of people, nine months ---- */
(() => { const svg = $('.mv-fig svg'); if (!svg) return; const N = 'http://www.w3.org/2000/svg';
  const ring = (g, n, r, rad, seed) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + seed + (i % 3) * .05, rr = r + ((i * 37) % 13 - 6); const c = document.createElementNS(N, 'circle'); c.setAttribute('cx', 210 + Math.cos(a) * rr); c.setAttribute('cy', 210 + Math.sin(a) * rr); c.setAttribute('r', rad); c.style.setProperty('--d', (i * 55) + 'ms'); g.appendChild(c); } };
  ring($('.g1', svg), 5, 58, 6, -1.2); ring($('.g2', svg), 22, 124, 4.6, .3); ring($('.g3', svg), 64, 190, 3.4, .1);
  const lis = $$('.mv-steps li'), box = $('.mvmt'); let cur = 0, hold = false;
  const set = i => { cur = i; box.dataset.stage = i + 1; lis.forEach((l, k) => l.classList.toggle('on', k === i)); };
  lis.forEach((l, i) => { ['pointerenter', 'focus', 'click'].forEach(ev => l.addEventListener(ev, () => { hold = true; set(i); })); l.addEventListener('pointerleave', () => hold = false); l.tabIndex = 0; });
  set(0); setInterval(() => { if (!hold && !document.hidden) set((cur + 1) % 3); }, 3800); })();
(() => { const g = $('#ninegrid'); if (!g) return; let n = 0;
  for (let m = 0; m < 9; m++) { const col = document.createElement('div'); col.className = 'nm'; for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) { const i = document.createElement('i'); const wk = d >= 5, off = (!wk && ((m * 7 + w * 3 + d * 5) % 9 === 0)) || (wk && (m * 5 + w * 2 + d) % 11 === 0); i.className = off ? 'off' : wk ? 'we' : 'wk'; i.style.setProperty('--d', (n++ * 9) + 'ms'); col.appendChild(i); } g.appendChild(col); }
  seen(g, () => g.classList.add('go'), .35); })();
$$('.dcard').forEach(c => c.addEventListener('click', () => { const o = c.getAttribute('aria-expanded') === 'true'; c.setAttribute('aria-expanded', !o); }));

/* ---- small cursor: a dot, a soft ring, a faint trail; nothing hides the real cursor ---- */
if (!lite && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  const dot = document.createElement('div'), ring = document.createElement('div'); dot.className = 'rw-cur'; ring.className = 'rw-curr'; document.body.append(dot, ring);
  const trail = Array.from({ length: 6 }, () => { const t = document.createElement('i'); t.className = 'rw-trail'; document.body.appendChild(t); return { el: t, x: 0, y: 0 }; });
  let mx = -100, my = -100, rx = -100, ry = -100, moved = 0;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; moved = performance.now(); dot.classList.add('on'); ring.classList.add('on'); const t = e.target.closest ? e.target.closest('a,button,[role=button],input,label,.ph,.pill,.dcard,.tile') : null; dot.classList.toggle('link', !!t); ring.classList.toggle('link', !!t); }, { passive: true });
  addEventListener('pointerdown', e => { ring.classList.add('down'); const r = document.createElement('i'); r.className = 'rw-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 750); });
  addEventListener('pointerup', () => ring.classList.remove('down'));
  document.addEventListener('pointerleave', () => { dot.classList.remove('on'); ring.classList.remove('on'); });
  const loop = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; dot.style.transform = `translate(${mx}px,${my}px)`; ring.style.transform = `translate(${rx}px,${ry}px)`;
    let px = rx, py = ry; trail.forEach((t, i) => { t.x += (px - t.x) * (.34 - i * .03); t.y += (py - t.y) * (.34 - i * .03); t.el.style.transform = `translate(${t.x}px,${t.y}px) scale(${1 - i * .13})`; t.el.style.opacity = (performance.now() - moved < 400 ? (.35 - i * .05) : 0); px = t.x; py = t.y; });
    requestAnimationFrame(loop); };
  loop();
  // buttons lean slightly toward the cursor
  $$('.btn,.rw-pills button').forEach(b => { b.classList.add('rw-magnet'); b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px,${(e.clientY - r.top - r.height / 2) * .18}px)`; }); b.addEventListener('pointerleave', () => b.style.transform = ''); });
  // sprouts and mascots on the home hero drift a little with the mouse
  const hero = $('.rw-hero'); if (hero) hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; const m = $('.rw-mascots'), s = $('.rw-sprouts'); if (m) m.style.translate = `${-x * 22}px ${-y * 10}px`; if (s) s.style.translate = `${x * 14}px ${y * 6}px`; }, { passive: true });
}
/* ---- small scroll touches: a soft parallax on the hero photo, and a quiet fade on the header bar ---- */
if (!reduced) { const bg = $('.rw-bg'); let tk = false; addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { tk = false; if (bg) bg.style.transform = `translate3d(0,${Math.min(scrollY, 900) * .18}px,0) scale(1.06)`; }); }, { passive: true }); }
})();
