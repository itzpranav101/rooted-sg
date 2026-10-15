// MECO resources page: poster viewer, the scroll-through pitch deck, in-place PDF readers, essay and films.
(() => {
if (!document.querySelector('#deck')) return;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lite = document.documentElement.classList.contains('lite'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, coarse = matchMedia('(pointer:coarse)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

/* ---- poster lightbox ---- */
const lb = document.createElement('div'); lb.className = 'mr-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Poster viewer');
lb.innerHTML = '<header><b></b><div><a class="btn" download>PDF <i>↓</i></a><button class="btn line" type="button">Close <i>×</i></button></div></header><div class="stagebox"><img alt=""></div>'; document.body.appendChild(lb);
const lbImg = $('img', lb), lbT = $('b', lb), lbA = $('a', lb), lbX = $('button', lb); let lastFocus = null;
const open = b => { lastFocus = b; lbImg.src = b.dataset.full; lbImg.alt = b.dataset.title; lbT.textContent = b.dataset.title; lbA.href = b.dataset.pdf; lb.classList.add('open'); document.body.style.overflow = 'hidden'; lbX.focus(); };
const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
$$('.mr-view').forEach(b => b.addEventListener('click', () => open(b))); lbX.addEventListener('click', close); lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('stagebox')) close(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });

/* ---- posters drift as you scroll ---- */
if (hasGsap && !reduced && !lite) $$('.mr-poster').forEach(p => gsap.fromTo(p, { y: -(+p.dataset.drift || 0) * .5 }, { y: +p.dataset.drift || 0, ease: 'none', scrollTrigger: { trigger: '.mr-posters', start: 'top bottom', end: 'bottom top', scrub: true } }));

/* ---- the deck ---- */
(() => {
  const root = $('#deck'); if (!root) return;
  const imgs = $$('.dk-s', root), n = imgs.length, thumbs = $$('#dkthumbs button'), num = $('#dknum'), cap = $('#dkcap'), bar = $('#dkbar'), strip = $('#dkthumbs');
  let cur = -1;
  const load = i => [i - 1, i, i + 1, i + 2].forEach(k => { const im = imgs[k]; if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } });
  const show = i => { i = Math.max(0, Math.min(n - 1, i)); if (i === cur) return; cur = i; load(i);
    imgs.forEach((im, k) => { im.classList.toggle('on', k === i); im.classList.toggle('past', k < i); });
    thumbs.forEach((t, k) => t.classList.toggle('on', k === i)); num.textContent = String(i + 1).padStart(2, '0'); cap.textContent = imgs[i].alt.replace(/^Slide \d+: /, ''); bar.style.transform = `scaleX(${(i + 1) / n})`;
    const t = thumbs[i]; if (t) strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' }); };
  let st = null; const pin = hasGsap && !lite && !reduced && matchMedia('(min-width:700px)').matches && !coarse;
  if (pin) st = ScrollTrigger.create({ trigger: root, pin: true, start: 'top top', end: () => '+=' + Math.round(innerHeight * 8), scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: s => { root.classList.toggle('moved', s.progress > .015); show(Math.floor(s.progress * n * .9999)); } });
  else root.classList.add('static');
  const go = i => { i = Math.max(0, Math.min(n - 1, i)); if (st) scrollTo({ top: st.start + (i + .5) / n * (st.end - st.start), behavior: reduced ? 'auto' : 'smooth' }); else show(i); };
  $('#dkprev').addEventListener('click', () => go(cur - 1)); $('#dkn').addEventListener('click', () => go(cur + 1)); thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  addEventListener('keydown', e => { if (lb.classList.contains('open') || !/^Arrow(Left|Right)$/.test(e.key) || /input|textarea|select/i.test(e.target.tagName)) return; const r = root.getBoundingClientRect(); if (r.top > innerHeight * .5 || r.bottom < innerHeight * .5) return; e.preventDefault(); go(cur + (e.key === 'ArrowRight' ? 1 : -1)); });
  let sx = 0; $('#dkstage').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true }); $('#dkstage').addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) go(cur + (d < 0 ? 1 : -1)); }, { passive: true });
  show(0);
})();

/* ---- read a PDF in place (a new tab on phones, where embedded PDFs do not render) ---- */
$$('.mr-file[data-src]').forEach(f => { const btn = $('[data-read]', f); let box = null;
  btn.addEventListener('click', () => { const url = f.dataset.src; if (lite || coarse) { window.open(url, '_blank', 'noopener'); return; }
    if (box) { box.remove(); box = null; btn.firstChild.textContent = 'Read here '; return; }
    box = document.createElement('div'); box.className = 'mr-embed'; box.innerHTML = `<iframe src="${url}#view=FitH" title="${$('b', f).textContent}"></iframe>`; f.appendChild(box); btn.firstChild.textContent = 'Hide '; }); });

/* ---- the two film boxes: they open the link in js/meco-resources.js ---- */
$$('.mr-vid').forEach(a => { const u = (window.MECO_RES || {})[a.dataset.key]; if (u) a.href = u; else { a.classList.add('soon'); a.removeAttribute('target'); a.setAttribute('aria-disabled', 'true'); a.addEventListener('click', e => e.preventDefault()); $('.mv-cta em', a).textContent = 'MP4 link coming soon'; $('.mv-cta i', a).textContent = ''; } });
if (hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); addEventListener('load', () => ScrollTrigger.refresh()); }
})();
