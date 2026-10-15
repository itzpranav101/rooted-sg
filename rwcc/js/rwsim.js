// ROOTED SG for RWCC: the Monte Carlo results chart, the live re-run, the sensitivity bars.
(() => {
const R = window.RWSIM, svg = document.getElementById('mcsvg'); if (!R || !svg) return;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg', fmt = n => Math.round(n).toLocaleString('en-US');
const el = (n, a = {}, p = svg) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
const x0 = 44, x1 = 684, yb = 282, top = 44, MAX = 6000, bins = R.hist.counts, N = R.trials, B = bins.length;
const xOf = v => x0 + Math.min(v, MAX) / MAX * (x1 - x0), freq = bins.map(c => c / N);
const maxF = Math.max(...freq.slice(1)), sy = (yb - top - 26) / maxF, bw = (x1 - x0) / B;
const barH = f => Math.min(f * sy, yb - top - 4);
// 90% band
el('rect', { class: 'band', x: xOf(R.extra.p5), y: top - 6, width: xOf(R.extra.p95) - xOf(R.extra.p5), height: yb - top + 6 });
// axis
el('path', { class: 'ax', d: `M${x0} ${yb}H${x1}` });
for (let v = 0; v <= MAX; v += 1000) { el('path', { class: 'ax', d: `M${xOf(v)} ${yb}v5` }); el('text', { class: 'tk', x: xOf(v), y: yb + 18, 'text-anchor': 'middle' }).textContent = fmt(v); }
el('text', { class: 'tk', x: x1, y: yb + 36, 'text-anchor': 'end' }).textContent = 'Extra plants alive at twelve months, year three';
// bars
freq.forEach((f, i) => { const h = barH(f); const r = el('rect', { class: 'b' + (i === 0 ? ' f' : ''), x: x0 + i * bw + 1, y: yb - h, width: bw - 2, height: h }); r.style.setProperty('--i', i); });
// the pilot-misses bar runs off the top: mark the break
const bx = x0 + 1; el('path', { class: 'brk', d: `M${bx - 2} ${top + 22}l${bw / 2} -4l${bw / 2} 4` });
const pm = Math.round(freq[0] * 100);
[`Amber bar: ${pm}% of runs.`, 'The pilot misses +5 points,', 'so we stay at two schools.'].forEach((t, i) => { el('text', { class: 'an', x: x1, y: top + 96 + i * 14, 'text-anchor': 'end' }).textContent = t; });
// markers
const mark = (v, cls, label, anchor, dy, off) => { const x = xOf(v); el('path', { class: 'mk ' + cls, d: `M${x} ${top - 6}V${yb}` }); const t = el('text', { class: 'ml ' + cls, x: x + (anchor === 'end' ? -6 : 6), y: top + dy, 'text-anchor': anchor }); t.textContent = label; };
mark(R.extra.p50, 'med', `Median ${fmt(Math.round(R.extra.p50 / 10) * 10)}`, 'end', -12);
mark(R.base_case, 'base', `Our base case ${fmt(R.base_case)}`, 'start', -12);
mark(R.extra.p95, 'p95', `95th percentile ${fmt(Math.round(R.extra.p95 / 10) * 10)}`, 'start', 6);
// live outline
const live = el('path', { class: 'lv', d: '' });
const chart = $('#mcchart'); new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { chart.classList.add('go'); o.disconnect(); } }, { threshold: .3 }).observe(chart);

/* ---- the same model, run again in the browser ---- */
const tri = (a, c, b) => { const u = Math.random(), F = (c - a) / (b - a); return u < F ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c)); };
function run(n) { const counts = new Array(B).fill(0), xs = []; let clear = 0;
  for (let i = 0; i < n; i++) { const sch = tri(20, 60, 120), st = tri(90, 120, 150), pl = tri(1.5, 2.1, 3), up = tri(0, .12, .15), ok = up >= .05; if (ok) clear++; const hh = (ok ? sch : 2) * st, ex = hh * pl * up; xs.push(ex); counts[Math.min(B - 1, Math.floor(ex / (MAX / B)))]++; }
  xs.sort((a, b) => a - b); const q = p => xs[Math.min(n - 1, Math.floor(p / 100 * n))]; return { counts, med: q(50), lo: q(5), hi: q(95), ge1k: xs.filter(v => v >= 1000).length / n, clear: clear / n }; }
const btn = $('#mcrun'), out = $('#mclive'); let runs = 0;
btn.addEventListener('click', () => { const n = 5000, r = run(n); runs++;
  const d = r.counts.map((c, i) => `${i ? 'L' : 'M'}${(x0 + (i + .5) * bw).toFixed(1)} ${(yb - barH(c / n)).toFixed(1)}`).join('');
  live.setAttribute('d', d); live.classList.remove('draw'); void live.getBoundingClientRect(); live.classList.add('draw');
  out.innerHTML = `<b>Run ${runs}:</b> ${fmt(n)} new trials in your browser. Median <b>${fmt(Math.round(r.med / 10) * 10)}</b> · 9 in 10 between <b>${fmt(Math.round(r.lo / 10) * 10)}</b> and <b>${fmt(Math.round(r.hi / 10) * 10)}</b> · <b>${Math.round(r.ge1k * 100)}%</b> keep 1,000 or more · pilot clears in <b>${Math.round(r.clear * 100)}%</b>. The outline is your run; the bars are our 100,000.`; });

/* ---- what moves the result ---- */
const tor = $('#mctor'); if (tor) { tor.innerHTML = R.tornado.map((t, i) => `<div class="tr" style="--i:${i};--w:${Math.abs(t.rho).toFixed(3)}"><span>${t.name}</span><i><b></b></i><em>${t.rho.toFixed(2)}</em></div>`).join('') + '<p class="label">Rank correlation with the result, across 100,000 runs. Survival uplift ranks first because it also decides whether we scale at all.</p>';
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { tor.classList.add('go'); o.disconnect(); } }, { threshold: .4 }).observe(tor); }

/* ---- the four steps light up in turn ---- */
const fl = $('#mcflow'); if (fl && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const li = $$('li', fl); let i = 0, t = 0; new IntersectionObserver(es => { clearInterval(t); if (es[0].isIntersecting) { const f = () => { li.forEach((l, k) => l.classList.toggle('on', k === i)); i = (i + 1) % li.length; }; f(); t = setInterval(f, 1500); } }, { threshold: .4 }).observe(fl); }
})();

/* ---- tech stack: the check-in prints itself ---- */
(() => {
  const term = document.querySelector('#txterm code'), pipe = [...document.querySelectorAll('#txpipe li')]; if (!term) return;
  const L = [['check_in(photo)', '', -1], ['  ├─ timestamp      ', 'valid', 1], ['  ├─ perceptual hash', 'distinct from last photo', 2], ['  ├─ vegetation     ', 'living plant cover found', 3], ['  ├─ clues          ', 'yellowing · spots', 4], ['  └─ confidence     ', 'above threshold, else ask for a retake', 5], ['', '', -1], ['result → Plant-Day +1 · "AI suggested" · you decide', '', 6]];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; let t = 0, run = 0;
  const draw = n => { term.innerHTML = L.slice(0, n).map(([a, b, k]) => b ? `<span class="dim">${a}</span> <span class="ok">${b}</span>` : (a.startsWith('result') ? `<span class="ok">${a}</span>` : a)).join('\n') + (n < L.length ? '<span class="cur"></span>' : ''); pipe.forEach((p, i) => p.classList.toggle('on', n > 0 && i <= (L[Math.min(n, L.length) - 1][2] < 0 ? (n >= L.length ? 6 : 0) : L[n - 1][2]))); };
  if (reduced) { draw(L.length); pipe.forEach(p => p.classList.add('on')); return; }
  new IntersectionObserver(es => { clearInterval(t); if (es[0].isIntersecting) { let n = 0; draw(0); t = setInterval(() => { n++; if (n > L.length + 4) n = 0; draw(Math.min(n, L.length)); }, 700); } }, { threshold: .3 }).observe(term.parentElement);
})();

/* ---- out of 100 runs ---- */
(() => {
  const box = document.getElementById('mc100'), grid = document.getElementById('mc100g'); if (!box || !window.RWSIM) return;
  const R = window.RWSIM, fail = Math.round((1 - R.p_pilot_clears) * 100), under = Math.round((1 - R.p_extra_ge_1000) * 100) - fail, mid = Math.round((R.p_extra_ge_1000 - R.p_extra_ge_1814) * 100), top = 100 - fail - under - mid;
  const seq = [['fail', fail], ['low', under], ['mid', mid], ['top', top]], N = { fail, low: under, mid, top };
  let i = 0; seq.forEach(([k, n]) => { for (let j = 0; j < n; j++) { const d = document.createElement('i'); d.className = 'd-' + k; d.style.setProperty('--i', i++); grid.appendChild(d); } });
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); box.classList.add('go'); [...box.querySelectorAll('[data-n]')].forEach(b => { const to = N[b.dataset.n], t0 = performance.now(); (function tick(t) { const k = Math.min(1, (t - t0) / 1400); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0); }); } }, { threshold: .35 }).observe(box);
  const rg = document.getElementById('mcrgs'); if (rg) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { rg.classList.add('go'); o.disconnect(); } }, { threshold: .3 }).observe(rg);
})();
