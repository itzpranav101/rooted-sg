// ROOTED SG for RWCC: the cover page (drifting leaves, pointer depth, counting chip) and the opening of the inner pages.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, lite = document.documentElement.classList.contains('lite');
const page = document.body.dataset.page;

/* ---- the cover ---- */
const cover = $('.rw-cover');
if (cover) {
  // the chip counts up once it has floated in
  const n = $('.cv-n', cover); if (n) { const to = +n.dataset.to; if (reduced) n.textContent = to; else setTimeout(() => { const t0 = performance.now(); (function tick(t) { const k = Math.min(1, (t - t0) / 1800); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0); }, 2100); }
  // pointer depth on the phones and chips
  const stage = $('.cv-stage', cover);
  if (stage && !reduced && !lite && matchMedia('(hover:hover) and (pointer:fine)').matches) cover.addEventListener('pointermove', e => { const r = cover.getBoundingClientRect(); stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3)); stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3)); }, { passive: true });
  // leaves and pollen drift up the cover
  const cv = $('.rw-leaves', cover);
  if (cv && !reduced && !lite) {
    const g = cv.getContext('2d'); let W = 0, H = 0, vis = true, dpr = 1; const P = [];
    const css = () => getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#A3E68B';
    let col = css();
    const fit = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = cover.clientWidth; H = cover.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
    const mk = (init) => ({ x: Math.random() * W, y: init ? Math.random() * H : H + 30, s: 5 + Math.random() * 11, v: .18 + Math.random() * .42, a: Math.random() * 6.28, w: .006 + Math.random() * .014, r: Math.random() * 6.28, dr: (Math.random() - .5) * .012, o: .12 + Math.random() * .32, leaf: Math.random() < .55 });
    fit(); for (let i = 0; i < 38; i++) P.push(mk(true));
    addEventListener('resize', fit); addEventListener('themechange', () => { col = css(); });
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(cover);
    const draw = () => { requestAnimationFrame(draw); if (!vis || document.hidden) return; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.fillStyle = col; g.strokeStyle = col;
      for (const p of P) { p.y -= p.v; p.a += p.w; p.r += p.dr; p.x += Math.sin(p.a * 3) * .35; if (p.y < -30) Object.assign(p, mk(false)); g.globalAlpha = p.o * Math.min(1, (H - p.y) / 120) * Math.min(1, p.y / 80 + .2);
        g.save(); g.translate(p.x, p.y); g.rotate(p.r);
        if (p.leaf) { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(p.s * .5, -p.s * .55, p.s * 1.2, -p.s * .35, p.s * 1.4, 0); g.bezierCurveTo(p.s * 1.2, p.s * .35, p.s * .5, p.s * .55, 0, 0); g.fill(); g.globalAlpha *= .6; g.lineWidth = .8; g.beginPath(); g.moveTo(0, 0); g.lineTo(p.s * 1.2, 0); g.stroke(); }
        else { g.beginPath(); g.arc(0, 0, p.s * .13, 0, 6.28); g.fill(); }
        g.restore(); } };
    draw();
  }
}

/* ---- the opening of the inner pages: a ghost number, a vine that grows, and Mojo peeking in ---- */
const ph = $('.rw-ph');
if (ph && page !== 'home') {
  const num = { problem: '01', app: '02', impact: '03', story: '04' }[page] || '';
  const d = document.createElement('div'); d.className = 'ph-deco'; d.setAttribute('aria-hidden', 'true');
  d.innerHTML = `${num ? `<span class="ph-num">${num}</span>` : ''}<svg class="ph-vine" viewBox="0 0 360 120"><path pathLength="1" d="M0 112C60 108 110 112 170 106S280 100 360 108"/><path pathLength="1" d="M70 109V70M70 86c-14 0-22-8-22-20 12 0 22 8 22 20zM70 80c14 0 22-8 22-20-12 0-22 8-22 20z"/><path pathLength="1" d="M170 106V44M170 78c-18 0-28-10-28-26 16 0 28 10 28 26zM170 66c18 0 28-10 28-26-16 0-28 10-28 26z"/><path pathLength="1" d="M270 101V60M270 82c-14 0-22-8-22-20 12 0 22 8 22 20z"/></svg>${lite ? '' : '<img class="ph-mojo" src="media/mojo.png" alt="" width="86" height="106">'}`;
  ph.prepend(d);
}
})();
