// ROOTED SG — animation engine: Lenis + GSAP ScrollTrigger, theme, chrome, transitions
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement, page = document.body.dataset.page;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
gsap.registerPlugin(ScrollTrigger);

/* ---------- theme ---------- */
function setTheme(t, x, y) {
  const apply = () => { root.dataset.theme = t; try { localStorage.setItem('rs-theme', t); } catch (e) {} dispatchEvent(new Event('themechange')); };
  if (!document.startViewTransition || reduced || x == null) return apply();
  const tr = document.startViewTransition(apply);
  tr.ready.then(() => { const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 1000, easing: 'cubic-bezier(.22,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }); }).catch(() => {});
}

/* ---------- chrome ---------- */
const leaf = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11"/><path d="M12 11C12 6 8.5 3.5 4 4c0 4.5 3 7.5 8 7z"/><path d="M12 14c0-3.2 2.6-5.5 7-5.2 0 3.6-2.6 6-7 5.2z"/></svg>';
const pages = [['index.html', 'Home', 'home'], ['app.html', 'The app', 'app'], ['rootstake.html', 'RootStake', 'rootstake'], ['how-it-works.html', 'How it works', 'how'], ['impact.html', 'The story', 'impact']];
const names = { home: 'Singapore', app: 'The app', rootstake: 'RootStake', how: 'How it works', impact: 'The story' };
document.body.insertAdjacentHTML('afterbegin', `
<div class="grain"></div>
<header class="top" id="top"><a class="mark" href="index.html" data-t>${leaf}<span>Rooted SG</span><small>${names[page] || ''}</small></a>
<div class="tools"><button class="pillbtn sq" id="themeBtn" aria-label="Toggle light and dark"><i class="themeic"></i></button>
<button class="pillbtn" id="menuBtn"><span class="burger"><i></i><i></i></span><span>Menu</span></button></div></header>
<div class="index" id="index"><button class="pillbtn xbtn" id="xBtn">Close</button>
<nav class="list"><div class="label" style="margin-bottom:16px">Index</div>${pages.map((p, i) => `<a href="${p[0]}" data-t class="${p[2] === page ? 'cur' : ''}"><span class="n">0${i + 1}</span><span class="t">${p[1]}</span></a>`).join('')}</nav>
<div class="side"><p class="serif d4">Don't count what we plant.<br><em>Count what we keep alive.</em></p><p class="label" style="margin-top:20px">Rooted SG · Singapore 2026</p></div></div>
<div class="curtain" id="curtain"><div class="cm">${leaf}<span>Rooted SG</span></div></div>
<div class="cur" id="cur"></div><div class="cur-r" id="curR"></div>`);

document.body.insertAdjacentHTML('beforeend', `
<footer class="foot"><div class="wrap">
<div class="cols"><div><p class="serif d4" style="max-width:15em">Don't count what we plant. <em>Count what we keep alive.</em></p></div>
<div><div class="label" style="margin-bottom:12px">Pages</div>${pages.map(p => `<a href="${p[0]}" data-t>${p[1]}</a>`).join('')}</div>
<div><div class="label" style="margin-bottom:12px">Inside</div><a href="rootstake.html#parts" data-t>The probe</a><a href="how-it-works.html#loop" data-t>The loop</a><a href="how-it-works.html#tiers" data-t>What is real</a></div>
<div><div class="label" style="margin-bottom:12px">Entry</div><a href="impact.html#entries" data-t>IYEC 2026</a><a href="impact.html#team" data-t>The team</a></div></div>
<div class="big" id="bigword" aria-hidden="true">${'Rooted SG'.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
<div class="fine label"><span>© 2026 Rooted SG · Singapore</span><span>Every number here comes from our survey, our build, or a named source.</span></div></div></footer>`);

$('#themeBtn').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', r.left + r.width / 2, r.top + r.height / 2); });

/* ---------- smooth scroll ---------- */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new Lenis({ lerp: .085, wheelMultiplier: .95, smoothTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -20, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' }); }));

/* ---------- index overlay ---------- */
const idx = $('#index'); let idxOpen = false;
function openIdx(o) {
  idxOpen = o; lenis && (o ? lenis.stop() : lenis.start());
  if (o) { idx.style.visibility = 'visible'; gsap.to(idx, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' }); gsap.fromTo('.index .list a', { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: .07, ease: 'expo.out', delay: .35 }); gsap.fromTo('.index .side,.index .list .label', { opacity: 0 }, { opacity: 1, delay: .7, duration: .8 }); }
  else gsap.to(idx, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'expo.inOut', onComplete: () => idx.style.visibility = 'hidden' });
}
$('#menuBtn').onclick = () => openIdx(true); $('#xBtn').onclick = () => openIdx(false);
addEventListener('keydown', e => { if (e.key === 'Escape' && idxOpen) openIdx(false); });

/* ---------- page transitions ---------- */
const curtain = $('#curtain');
gsap.set(curtain, { yPercent: 100 });
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-t],a[href$=".html"],a[href*=".html#"]'); if (!a || a.target || e.metaKey || e.ctrlKey) return;
  const u = new URL(a.href, location.href); if (u.origin !== location.origin || u.pathname === location.pathname) return;
  e.preventDefault(); try { sessionStorage.setItem('rs-nav', '1'); } catch (er) {}
  gsap.to(curtain, { yPercent: 0, duration: .85, ease: 'expo.inOut', onComplete: () => location.href = u.href });
  gsap.fromTo('.cm', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6, delay: .35, ease: 'expo.out' });
});
addEventListener('pageshow', e => { if (e.persisted) gsap.set(curtain, { yPercent: 100 }); });

/* ---------- preloader ---------- */
let seenPre = false, fromNav = false; try { seenPre = sessionStorage.getItem('rs-pre'); fromNav = sessionStorage.getItem('rs-nav'); sessionStorage.removeItem('rs-nav'); } catch (e) {}
function boot() { document.dispatchEvent(new Event('rs:ready')); }
if (!seenPre && !fromNav && !reduced) {
  lenis && lenis.stop();
  document.body.insertAdjacentHTML('beforeend', `<div class="pre" id="pre"><div class="row"><span class="label">Rooted SG</span><span class="label">Singapore · 2026</span></div>
  <div><div class="big"><span id="preN">0</span><small>verified<br>plant-days</small></div><div class="bar"><i id="preBar"></i></div></div></div>`);
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => { try { sessionStorage.setItem('rs-pre', '1'); } catch (e) {} } })
    .to(o, { v: 314, duration: 2.1, ease: 'power3.inOut', onUpdate: () => $('#preN').textContent = Math.round(o.v) }, 0)
    .to('#preBar', { scaleX: 1, duration: 2.1, ease: 'power3.inOut' }, 0)
    .to('#pre .big', { yPercent: -30, opacity: 0, duration: .7, ease: 'power3.in' }, 2.25)
    .to('#pre', { yPercent: -100, duration: 1, ease: 'expo.inOut', onStart: () => setTimeout(boot, 450) }, 2.5)
    .add(() => { $('#pre').remove(); lenis && lenis.start(); });
} else if (fromNav) {
  gsap.set(curtain, { yPercent: 0 });
  gsap.fromTo('.cm', { opacity: 1 }, { opacity: 0, duration: .4, delay: .15 });
  gsap.to(curtain, { yPercent: -100, duration: .95, ease: 'expo.inOut', delay: .25, onStart: () => setTimeout(boot, 350) });
} else setTimeout(boot, 80);

/* ---------- cursor + magnetic ---------- */
if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
  document.body.classList.add('has-cursor');
  const cur = $('#cur'), ring = $('#curR'), mx = gsap.quickTo(cur, 'x', { duration: .08 }), my = gsap.quickTo(cur, 'y', { duration: .08 }), rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
  addEventListener('pointermove', e => { mx(e.clientX); my(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,[data-cursor]'); const label = t && t.dataset.cursor;
    gsap.to(ring, { scale: t ? (label ? 2.2 : 1.6) : 1, duration: .5, ease: 'power3' }); gsap.to(cur, { scale: t ? 0 : 1, duration: .3 });
    ring.classList.toggle('big', !!label); ring.textContent = label || '';
  });
  $$('.btn,.pillbtn,[data-mag]').forEach(b => { const s = b.classList.contains('btn') ? .28 : .2;
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * s, y: (e.clientY - r.top - r.height / 2) * s, duration: .5, ease: 'power3' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.4)' })); });
}

/* ---------- top bar hide ---------- */
const top = $('#top'); let lastY = 0;
(lenis || { on: (n, f) => addEventListener('scroll', () => f({ scroll: scrollY })) }).on('scroll', ({ scroll }) => { top.classList.toggle('hide', scroll > lastY && scroll > 500 && !idxOpen); lastY = scroll; });

/* ---------- text splitting ---------- */
function splitWords(el, cls) {
  if (el.dataset.done) return $$('.' + cls, el); el.dataset.done = 1;
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement('span'); s.className = cls === 'wm' ? 'wm' : 'w'; s.innerHTML = cls === 'wm' ? `<span>${w}</span>` : w; f.append(s); } }); c.replaceWith(f); }
    else if (c.nodeType === 1) walk(c); });
  walk(el); return $$('.' + cls, el);
}
const st = document.createElement('style'); st.textContent = `.wm{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .07em .14em;margin:0 -.07em -.14em}.wm>span{display:inline-block;will-change:transform}.w{display:inline}`; document.head.appendChild(st);

/* ---------- scroll choreography ---------- */
function init() {
  // headline mask reveals
  $$('[data-split]').forEach(h => { const ws = $$('.wm>span', h).length ? $$('.wm>span', h) : splitWords(h, 'wm').map(w => w.firstChild);
    gsap.set(ws, { yPercent: 115, rotate: 4 });
    ScrollTrigger.create({ trigger: h, start: 'top 88%', once: true, onEnter: () => gsap.to(ws, { yPercent: 0, rotate: 0, duration: 1.3, stagger: .055, ease: 'expo.out' }) }); });
  // scrubbed word fill
  $$('[data-words]').forEach(el => { const ws = splitWords(el, 'w'); gsap.set(ws, { opacity: .14 });
    gsap.to(ws, { opacity: 1, stagger: .5, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 48%', scrub: .6 } }); });
  // generic reveal
  $$('[data-reveal]').forEach(el => { const kids = el.hasAttribute('data-stagger') ? [...el.children] : [el]; gsap.set(el, { opacity: 1 });
    gsap.fromTo(kids, { y: 56, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }); });
  // clip image reveal
  $$('[data-clip]').forEach(el => { const im = el.firstElementChild;
    gsap.fromTo(el, { clipPath: 'inset(14% 14% 14% 14% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: .6 } });
    if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 30%', scrub: .6 } }); });
  // rules draw
  $$('.rule[data-draw]').forEach(r => gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 92%', once: true } }));
  // parallax
  $$('[data-par]').forEach(el => gsap.to(el, { y: () => -parseFloat(el.dataset.par) * 220, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  // counters
  $$('[data-count]').forEach(el => { const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2.4, ease: 'expo.out', onUpdate: () => el.textContent = o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '') }) }); });
  // ledger lines
  $$('.lrow').forEach(r => ScrollTrigger.create({ trigger: r, start: 'top 80%', once: true, onEnter: () => gsap.to(r, { '--s': 1, duration: 1.8, ease: 'expo.out' }) }));
  // bytes
  $$('.bytes').forEach(b => ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: () => b.classList.add('go') }));
  // marquee, velocity-linked
  $$('.marq-t').forEach(t => { t.innerHTML += t.innerHTML; const tw = gsap.to(t, { xPercent: -50, repeat: -1, duration: 38, ease: 'none' });
    lenis && lenis.on('scroll', ({ velocity }) => { gsap.to(tw, { timeScale: 1 + Math.min(Math.abs(velocity) * .6, 5), duration: .3, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1.2, delay: .3, overwrite: false }); }); });
  // tilting phones
  $$('.tilt').forEach(w => { const p = $('.ph', w) || w; const rx = gsap.quickTo(p, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(p, 'rotationY', { duration: .8, ease: 'power3' }); gsap.set(w, { perspective: 1200 });
    w.addEventListener('pointermove', e => { const r = w.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 12); }); w.addEventListener('pointerleave', () => { rx(0); ry(0); }); });
  // phone float on scroll
  $$('[data-rise]').forEach(el => gsap.fromTo(el, { y: 120, rotate: parseFloat(el.dataset.rise) || 4 }, { y: -40, rotate: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .8 } }));
  // frame grow (Craft hero screenshot, Apple style)
  $$('[data-grow]').forEach(f => gsap.fromTo(f, { scale: .9, borderRadius: 34 }, { scale: 1, borderRadius: 8, ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 20%', scrub: .6 } }));
  // big wordmark
  const bw = $$('#bigword span'); gsap.set(bw, { yPercent: 105 }); ScrollTrigger.create({ trigger: '#bigword', start: 'top 95%', once: true, onEnter: () => gsap.to(bw, { yPercent: 0, duration: 1.4, stagger: .06, ease: 'expo.out' }) });
  // horizontal tracks
  $$('.hs').forEach(hs => { const tr = $('.hs-track', hs), bar = $('.hs-bar .rule i', hs), dist = () => tr.scrollWidth - innerWidth;
    if (matchMedia('(max-width:900px)').matches) { /* stack on mobile */ hs.style.height = 'auto'; tr.style.cssText = 'flex-direction:column;height:auto'; $$('.hs-panel', hs).forEach(p => p.style.height = 'auto'); return; }
    const tw = gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: hs, pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist() * 1.1, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => bar && gsap.set(bar, { scaleX: s.progress }) } });
    $$('.hs-panel .ph', hs).forEach(ph => gsap.fromTo(ph, { rotationY: 18, y: 40 }, { rotationY: -18, y: -40, ease: 'none', scrollTrigger: { trigger: ph.closest('.hs-panel'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } }));
    $$('.hs-panel h3', hs).forEach(h => gsap.fromTo(h, { x: 80, opacity: .2 }, { x: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: h.closest('.hs-panel'), containerAnimation: tw, start: 'left 90%', end: 'left 40%', scrub: true } })); });
  // pinned scrubbed sequences (the Apple moments)
  $$('[data-pin]').forEach(pin => {
    const len = parseFloat(pin.dataset.pin) || 4, steps = $$('.pin-step,.cap', pin), cv = $$('canvas[data-scene]', pin), cnt = $('.pin-count b', pin), bar = $('.pin-count .rule i', pin), vis = $('.pin-vis', pin);
    let cur = -1;
    const show = i => { if (i === cur) return; const old = steps[cur], nw = steps[i]; cur = i;
      if (old) gsap.to(old, { opacity: 0, y: -34, duration: .45, ease: 'power2.in', onComplete: () => { if (steps[cur] !== old) old.style.visibility = 'hidden'; } });
      if (nw) { nw.style.visibility = 'visible'; gsap.fromTo(nw, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .9, delay: .25, ease: 'expo.out' }); const hs = $$('.d3,.d4', nw); }
      $$('.pscr', pin).forEach((x, k) => x.classList.toggle('on', k === i));
      if (cnt) cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0'); };
    if (steps.length) { steps.forEach(s => { s.style.opacity = 0; s.style.visibility = 'hidden'; }); }
    ScrollTrigger.create({ trigger: pin, pin: true, start: 'top top', end: '+=' + len * 100 + '%', scrub: true, anticipatePin: 1,
      onUpdate: s => { const p = s.progress; cv.forEach(c => c.dataset.p = p.toFixed(4)); if (bar) gsap.set(bar, { scaleX: p });
        if (steps.length) show(Math.min(steps.length - 1, Math.floor(p * steps.length * .9999)));
        pin.style.setProperty('--p', p); } });
    show(0);
  });
  // hero intro
  document.addEventListener('rs:ready', () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    $$('[data-intro]').forEach((el, i) => tl.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, .05 * i));
    const hw = $$('.hero-h .wm>span'); if (hw.length) tl.fromTo(hw, { yPercent: 118, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 1.5, stagger: .07 }, 0);
    $$('.cloud').forEach((c, i) => tl.fromTo(c, { x: i % 2 ? 160 : -160, opacity: 0 }, { x: 0, opacity: 1, duration: 2.4 }, 0));
    $$('[data-intro-cv]').forEach(c => tl.fromTo(c, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: 1.8 }, .2));
  }, { once: true });
  document.addEventListener('rs:ready', () => ScrollTrigger.refresh(), { once: true });
  // clouds drift
  $$('.cloud').forEach((c, i) => gsap.to(c, { y: -90 - i * 30, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: '+=900', scrub: true } }));
}
if (window.TEAM) $$('[data-team]').forEach(w => { w.innerHTML = window.TEAM.map(m => `<div class="member" data-reveal><div class="ph-box"><span>${m.name.trim()[0]}</span></div><h4>${m.name}</h4><span class="label">${m.role}</span></div>`).join(''); });
// hero headline needs masks before intro
$$('.hero-h').forEach(h => splitWords(h, 'wm'));
gsap.set('[data-intro],[data-intro-cv]', { opacity: 0 });
init();

/* ---------- widgets ---------- */
// index list with hover phone
$$('.idx').forEach(w => { const li = $$('li', w), ph = $$('.ph', w); const set = i => { li.forEach((l, k) => l.classList.toggle('on', k === i)); ph.forEach((p, k) => p.classList.toggle('on', k === i)); };
  li.forEach((l, i) => { l.addEventListener('pointerenter', () => set(i)); l.addEventListener('click', () => set(i)); }); set(0); });
// film
$$('.film').forEach(f => { const v = $('video', f), prog = $('.prog i', f), time = $('.time', f), chs = $$('.chapters button');
  const toggle = () => { if (v.paused) { v.muted = false; v.play(); } else v.pause(); };
  f.addEventListener('click', toggle); v.addEventListener('play', () => { f.classList.add('playing'); f.classList.remove('paused'); }); v.addEventListener('pause', () => f.classList.add('paused'));
  v.addEventListener('timeupdate', () => { prog.style.transform = `scaleX(${v.currentTime / v.duration || 0})`; const t = v.currentTime; time && (time.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`);
    let k = -1; chs.forEach((c, i) => { if (t >= +c.dataset.t) k = i; }); chs.forEach((c, i) => c.classList.toggle('on', i === k)); });
  chs.forEach(c => c.addEventListener('click', () => { v.currentTime = +c.dataset.t; v.muted = false; v.play(); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); })); });
addEventListener('load', () => ScrollTrigger.refresh());
})();
