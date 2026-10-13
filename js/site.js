// ROOTED SG — site engine: themes, chrome, side menu, scroll choreography. Native scroll (no smoothing layer), no preloader, no page curtain.
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement, page = document.body.dataset.page;
const hasGsap = !!window.gsap;
if (hasGsap) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

/* ---------- theme: 5 skins x light/dark ---------- */
const SKINS = [
  ['glasshouse', 'Glasshouse', 'Frosted glass, soft curves', ['#0E2E1F', '#A3E68B', '#ED9D76']],
  ['nightsoil', 'Nightsoil', 'Brutalist, hard edges, terminal', ['#0F0F0E', '#C6FF3D', '#FF7A2E']],
  ['kopi', 'Kopi', 'Kopitiam paper, stamps, tickets', ['#2A1A10', '#FF9A5C', '#E8C28A']],
  ['monsoon', 'Monsoon', 'Rain, hairlines, glowing glass', ['#081A24', '#5CE1E6', '#FF8A7A']],
  ['chalk', 'Chalk', 'Hand-drawn notebook and marker', ['#1D211E', '#F6E27A', '#F4A6C0']]];
function flash() { root.classList.add('theming'); clearTimeout(flash.t); flash.t = setTimeout(() => root.classList.remove('theming'), 520); }
function setMode(m) { flash(); root.dataset.mode = m; try { localStorage.setItem('rs-mode2', m); } catch (e) {} dispatchEvent(new Event('themechange')); }
function setSkin(k) {
  flash(); root.dataset.skin = k; try { localStorage.setItem('rs-skin', k); } catch (e) {}
  const F = window.__fonts, l = $('#skinfonts'); if (F && l && F[k]) l.href = 'https://fonts.googleapis.com/css2?' + F[k] + '&display=swap';
  markSkin(); dispatchEvent(new Event('themechange'));
}
function markSkin() { $$('.sk,.theme[data-skin]').forEach(e => e.classList.toggle('on', e.dataset.skin === root.dataset.skin)); }

/* ---------- chrome ---------- */
const leaf = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11"/><path d="M12 11C12 6 8.5 3.5 4 4c0 4.5 3 7.5 8 7z"/><path d="M12 14c0-3.2 2.6-5.5 7-5.2 0 3.6-2.6 6-7 5.2z"/></svg>';
const pages = [['index.html', 'Home', 'home'], ['app.html', 'The app', 'app'], ['rootstake.html', 'RootStake', 'rootstake'], ['how-it-works.html', 'How it works', 'how'], ['impact.html', 'The story', 'impact']];
const names = { home: 'Singapore', app: 'The app', rootstake: 'RootStake', how: 'How it works', impact: 'The story' };
document.body.insertAdjacentHTML('afterbegin', `
<div class="sprog" id="sprog"><i></i></div>
<header class="top" id="top"><a class="mark" href="index.html">${leaf}<span>Rooted SG</span><small>${names[page] || ''}</small></a>
<div class="tools"><button class="pillbtn" id="skinBtn" aria-label="Choose a theme" aria-expanded="false"><span class="sws"></span><span>Theme</span></button><button class="pillbtn sq" id="themeBtn" aria-label="Toggle light and dark"><i class="themeic"></i></button>
<button class="pillbtn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="index"><span class="burger"><i></i><i></i></span><span>Menu</span></button></div></header>
<div class="skins" id="skins"><div class="label" style="padding:4px 10px 10px">Five themes · each in light and dark</div>${SKINS.map(k => `<button class="sk" data-skin="${k[0]}"><span class="sw">${k[3].map(c => `<i style="background:${c}"></i>`).join('')}</span><span><b>${k[1]}</b><small>${k[2]}</small></span></button>`).join('')}</div>
<div class="scrim" id="scrim"></div>
<aside class="index" id="index" aria-hidden="true"><div class="ihead"><span class="label">Index</span><button class="pillbtn xbtn" id="xBtn">Close <span aria-hidden="true">✕</span></button></div>
<nav class="list" aria-label="Pages">${pages.map((p, i) => `<a href="${p[0]}" class="${p[2] === page ? 'cur' : ''}"${p[2] === page ? ' aria-current="page"' : ''}><span class="n">0${i + 1}</span><span class="t">${p[1]}</span><span class="ar">→</span></a>`).join('')}<a href="index.html#meco" class="meco-link"><span class="n">06</span><span class="t">Meco</span><span class="ar">→</span></a></nav>
<div class="side"><p class="serif d4">Don't count what we plant.<br><em>Count what we keep alive.</em></p><p class="label" style="margin-top:20px">Rooted SG · Singapore 2026<br>Meco = Measure + Eco</p></div></aside>`);

const JOURNEY = [['index.html', 'Home', 'home', 'What Meco is.'], ['rootstake.html', 'The module', 'rootstake', 'The measuring half, taken apart.'], ['app.html', 'The app', 'app', 'The counting half, in real screens.'], ['how-it-works.html', 'How it works', 'how', 'Why we built it, and the loop that ties it together.'], ['impact.html', 'The story', 'impact', 'The gap we are closing, and the people behind it.']];
const jIdx = Math.max(0, JOURNEY.findIndex(j => j[2] === page)), jNext = JOURNEY[(jIdx + 1) % JOURNEY.length], wraps = jIdx === JOURNEY.length - 1;
const nextBand = `<section class="nextband" aria-label="Next stop"><div class="wrap">
<div class="nb-track" style="--from:${jIdx * 25}%;--to:${(jIdx + 1) % 5 * 25}%"><i class="nb-line"></i>${JOURNEY.map((j, i) => `<a class="nb-dot ${i < jIdx ? 'done' : ''} ${i === jIdx ? 'cur' : ''}" href="${j[0]}" style="left:${i * 25}%" aria-label="${j[1]}"><span>${j[1]}</span></a>`).join('')}<img class="nb-mojo" src="media/mojo/idle.gif" alt="" width="96" height="104"></div>
<span class="label">${wraps ? 'The loop closes' : 'Next stop'}</span>
<a class="nb-link" href="${jNext[0]}"><span class="nb-t">${wraps ? 'Back to the start' : jNext[1]}</span><span class="nb-s">${wraps ? 'Home, where it all began.' : jNext[3]}</span><i>→</i></a>
</div></section>`;
document.body.insertAdjacentHTML('beforeend', nextBand + `
<footer class="foot"><div class="wrap">
<div class="cols"><div><p class="serif d4" style="max-width:15em">Don't count what we plant. <em>Count what we keep alive.</em></p></div>
<div><div class="label" style="margin-bottom:12px">Pages</div>${pages.map(p => `<a href="${p[0]}">${p[1]}</a>`).join('')}</div>
<div><div class="label" style="margin-bottom:12px">Inside</div><a href="index.html#meco">Meco · heymeco.xyz</a><a href="rootstake.html#parts">The probe</a><a href="rootstake.html#tissue">The tissue</a><a href="how-it-works.html#origin">Why we built it</a><a href="how-it-works.html#loop">The loop</a><a href="how-it-works.html#tiers">What is real</a></div>
<div><div class="label" style="margin-bottom:12px">Entry</div><a href="impact.html#entries">IYEC 2026</a><a href="impact.html#team">The team</a></div></div>
<div class="big" id="bigword" aria-hidden="true">${'Rooted SG'.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
<div class="fine label"><span>© 2026 Rooted SG · Singapore · Meco = Measure + Eco</span><span>Every number here comes from our survey, our build, or a named source.</span></div></div></footer>`);

$('#themeBtn').addEventListener('click', () => setMode(root.dataset.mode === 'dark' ? 'light' : 'dark'));
const skinsEl = $('#skins'), skinBtn = $('#skinBtn');
const skinOpen = o => { skinsEl.classList.toggle('open', o); skinBtn.setAttribute('aria-expanded', o); };
skinBtn.addEventListener('click', e => { e.stopPropagation(); skinOpen(!skinsEl.classList.contains('open')); });
document.addEventListener('click', e => { if (!e.target.closest('#skins,#skinBtn')) skinOpen(false); });
document.addEventListener('click', e => { const t = e.target.closest('.sk,.theme[data-skin]'); if (!t) return; setSkin(t.dataset.skin); });
$$('.theme[data-skin]').forEach(t => { t.tabIndex = 0; t.setAttribute('role', 'button'); t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSkin(t.dataset.skin); } }); });
markSkin();
{ const sw = $('.sws'); const upd = () => { const k = SKINS.find(x => x[0] === root.dataset.skin) || SKINS[0]; sw.innerHTML = k[3].map(c => `<i style="background:${c}"></i>`).join(''); }; upd(); addEventListener('themechange', upd); }

/* ---------- side menu: slides in from the right on a solid panel ---------- */
const idx = $('#index'), scrim = $('#scrim'), menuBtn = $('#menuBtn'); let idxOpen = false;
function openIdx(o) {
  idxOpen = o; skinOpen(false);
  root.classList.toggle('menu-open', o); idx.setAttribute('aria-hidden', !o); menuBtn.setAttribute('aria-expanded', o);
  if (o) setTimeout(() => $('#xBtn').focus({ preventScroll: true }), 60); else menuBtn.focus({ preventScroll: true });
}
menuBtn.onclick = () => openIdx(true); $('#xBtn').onclick = () => openIdx(false); scrim.onclick = () => openIdx(false);
addEventListener('keydown', e => { if (e.key === 'Escape') { if (idxOpen) openIdx(false); skinOpen(false); } });
$$('#index a').forEach(a => a.addEventListener('click', () => { if (new URL(a.href, location.href).pathname === location.pathname) openIdx(false); }));

/* ---------- navigation: cross-document view transitions in CSS; here only prefetch ---------- */
const pre = new Set();
function prefetch(a) { try { const u = new URL(a.href, location.href); if (u.origin !== location.origin || pre.has(u.pathname) || u.pathname === location.pathname) return; pre.add(u.pathname); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname; document.head.appendChild(l); } catch (e) {} }
document.addEventListener('pointerover', e => { const a = e.target.closest('a[href$=".html"],a[href*=".html#"]'); if (a) prefetch(a); }, { passive: true });
document.addEventListener('touchstart', e => { const a = e.target.closest('a[href$=".html"],a[href*=".html#"]'); if (a) prefetch(a); }, { passive: true });
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { if (a.getAttribute('href') === '#') return; const t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }));

/* ---------- top bar: hide on scroll down, scroll progress ---------- */
const top = $('#top'), sp = $('#sprog i'); let lastY = 0, tick = false;
addEventListener('scroll', () => { if (tick) return; tick = true; requestAnimationFrame(() => { tick = false; const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  top.classList.toggle('scrolled', y > 24); root.classList.toggle('scrolled-page', y > 60); top.classList.toggle('hide', y > lastY + 4 && y > 500 && !idxOpen); if (y < lastY - 4 || y < 500) top.classList.remove('hide'); lastY = y; sp.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }); }, { passive: true });

/* ---------- text splitting ---------- */
function splitWords(el, cls) {
  if (el.dataset.done) return $$('.' + cls, el); el.dataset.done = 1;
  const walk = n => [...n.childNodes].forEach(c => {
    if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement('span'); s.className = cls === 'wm' ? 'wm' : 'w'; s.innerHTML = cls === 'wm' ? `<span>${w}</span>` : w; f.append(s); } }); c.replaceWith(f); }
    else if (c.nodeType === 1) walk(c); });
  walk(el); return $$('.' + cls, el);
}
const st = document.createElement('style'); st.textContent = `.wm{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .07em .14em;margin:0 -.07em -.14em}.wm>span{display:inline-block;will-change:transform}.w{display:inline}`; document.head.appendChild(st);

/* ---------- odometer numbers: each digit is a rolling drum ---------- */
function odometer(el) {
  const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
  const txt = to.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '');
  el.setAttribute('aria-label', txt); el.classList.add('odo'); el.innerHTML = '';
  const drums = [];
  [...txt].forEach(ch => {
    const c = document.createElement('span'); c.className = 'od'; c.setAttribute('aria-hidden', 'true');
    if (/\d/.test(ch)) { const col = document.createElement('span'); col.className = 'od-col'; col.innerHTML = Array.from({ length: 20 }, (_, i) => `<i>${i % 10}</i>`).join(''); c.appendChild(col); drums.push([col, +ch]); }
    else { c.className = 'od od-s'; c.textContent = ch === ' ' ? ' ' : ch; }
    el.appendChild(c);
  });
  if (!hasGsap || reduced) { drums.forEach(([col, d]) => col.style.transform = `translateY(${-(10 + d) * 5}%)`); return; }
  gsap.set(drums.map(d => d[0]), { yPercent: 0 });
  ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => drums.forEach(([col, d], i) =>
    gsap.to(col, { yPercent: -(10 + d) * 5, duration: 1.4 + (drums.length - i) * .22, delay: i * .06, ease: 'expo.out' })) });
}

/* ---------- subtle magnetic snap connectors between sections ---------- */
$$('main > section.sec, main > section.closing').forEach(sec => { const prev = sec.previousElementSibling; if (!prev || prev.tagName === 'HEADER' || prev.classList.contains('mag') || prev.classList.contains('ma-wrap')) return;
  sec.insertAdjacentHTML('beforebegin', '<div class="mag" aria-hidden="true"><i class="ln t"></i><i class="ln b"></i><i class="mg a"></i><i class="mg b"></i><span class="ring"></span></div>'); });

/* ---------- scroll choreography ---------- */
function init() {
  $$('[data-split]').forEach(h => { const ws = $$('.wm>span', h).length ? $$('.wm>span', h) : splitWords(h, 'wm').map(w => w.firstChild);
    gsap.set(ws, { yPercent: 115, rotate: 4 });
    ScrollTrigger.create({ trigger: h, start: 'top 90%', once: true, onEnter: () => gsap.to(ws, { yPercent: 0, rotate: 0, duration: 1.1, stagger: .045, ease: 'expo.out' }) }); });
  $$('[data-words]').forEach(el => { const ws = splitWords(el, 'w'); gsap.set(ws, { opacity: .14 });
    gsap.to(ws, { opacity: 1, stagger: .5, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 48%', scrub: .4 } }); });
  $$('[data-reveal]').forEach(el => { const kids = el.hasAttribute('data-stagger') ? [...el.children] : [el];
    gsap.fromTo(kids, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); });
  $$('[data-clip]').forEach(el => { const im = el.firstElementChild;
    gsap.fromTo(el, { clipPath: 'inset(14% 14% 14% 14% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: .4 } });
    if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'bottom 30%', scrub: .4 } }); });
  $$('.rule[data-draw]').forEach(r => gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 92%', once: true } }));
  $$('[data-par]').forEach(el => gsap.to(el, { y: () => -parseFloat(el.dataset.par) * 220, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('[data-count]').forEach(odometer);
  $$('.lrow').forEach(r => ScrollTrigger.create({ trigger: r, start: 'top 82%', once: true, onEnter: () => gsap.to(r, { '--s': 1, duration: 1.6, ease: 'expo.out' }) }));
  $$('.bytes').forEach(b => ScrollTrigger.create({ trigger: b, start: 'top 88%', once: true, onEnter: () => b.classList.add('go') }));
  $$('#mname').forEach(el => { if (reduced) { el.style.setProperty('--k', 1); return; } ScrollTrigger.create({ trigger: $('.mn-words', el), start: 'top 88%', end: 'top 30%', scrub: .4, onUpdate: s => el.style.setProperty('--k', s.progress.toFixed(3)) }); });
  $$('.mag').forEach(m => { if (reduced) { m.style.setProperty('--k', 1); m.classList.add('snapped'); return; } ScrollTrigger.create({ trigger: m, start: 'top 85%', end: 'center 55%', scrub: .35, onUpdate: s => { m.style.setProperty('--k', s.progress.toFixed(3)); m.classList.toggle('snapped', s.progress > .97); } }); });
  $$('.marq-t').forEach(t => { t.innerHTML += t.innerHTML; gsap.to(t, { xPercent: -50, repeat: -1, duration: 38, ease: 'none' }); });
  $$('.tilt').forEach(w => { const p = $('.ph', w) || w; const rx = gsap.quickTo(p, 'rotationX', { duration: .8, ease: 'power3' }), ry = gsap.quickTo(p, 'rotationY', { duration: .8, ease: 'power3' }); gsap.set(w, { perspective: 1200 });
    w.addEventListener('pointermove', e => { const r = w.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 16); rx(-((e.clientY - r.top) / r.height - .5) * 12); }); w.addEventListener('pointerleave', () => { rx(0); ry(0); }); });
  $$('[data-rise]').forEach(el => gsap.fromTo(el, { y: 90, rotate: parseFloat(el.dataset.rise) || 4 }, { y: -30, rotate: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .5 } }));
  $$('[data-grow]').forEach(f => gsap.fromTo(f, { scale: .92 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 25%', scrub: .4 } }));
  const bw = $$('#bigword span'); gsap.set(bw, { yPercent: 105 }); ScrollTrigger.create({ trigger: '#bigword', start: 'top 98%', once: true, onEnter: () => gsap.to(bw, { yPercent: 0, duration: 1.2, stagger: .05, ease: 'expo.out' }) });
  $$('.hs').forEach(hs => { const tr = $('.hs-track', hs), bar = $('.hs-bar .rule i', hs), dist = () => tr.scrollWidth - innerWidth;
    if (matchMedia('(max-width:900px)').matches) { hs.style.height = 'auto'; tr.style.cssText = 'flex-direction:column;height:auto'; $$('.hs-panel', hs).forEach(p => p.style.height = 'auto'); return; }
    gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: hs, pin: true, scrub: .6, start: 'top top', end: () => '+=' + dist() * 1.1, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => bar && gsap.set(bar, { scaleX: s.progress }) } }); });
  // pinned scrubbed sequences
  $$('[data-pin]').forEach(pin => {
    const len = parseFloat(pin.dataset.pin) || 4, steps = $$('.pin-step,.cap', pin), cv = $$('canvas[data-scene],canvas[data-tissue]', pin), cnt = $('.pin-count b', pin), bar = $('.pin-count .rule i', pin);
    let cur = -1;
    const show = i => { if (i === cur) return; const old = steps[cur], nw = steps[i]; cur = i;
      if (old) gsap.to(old, { opacity: 0, y: -26, duration: .3, ease: 'power2.in', overwrite: true, onComplete: () => { if (steps[cur] !== old) old.style.visibility = 'hidden'; } });
      if (nw) { nw.style.visibility = 'visible'; gsap.fromTo(nw, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .7, delay: .12, ease: 'expo.out', overwrite: true }); }
      $$('.chapnav i', pin).forEach((x, k) => x.classList.toggle('on', k === i));
      $$('.pscr', pin).forEach((x, k) => x.classList.toggle('on', k === i));
      if (cnt) cnt.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0'); };
    steps.forEach(s => { s.style.opacity = 0; s.style.visibility = 'hidden'; });
    ScrollTrigger.create({ trigger: pin, pin: true, start: 'top top', end: '+=' + len * 100 + '%', scrub: true, anticipatePin: 1,
      onUpdate: s => { const p = s.progress; cv.forEach(c => c.dataset.p = p.toFixed(4)); if (bar) bar.style.transform = `scaleX(${p})`;
        if (steps.length) show(Math.min(steps.length - 1, Math.floor(p * steps.length * .9999)));
        pin.style.setProperty('--p', p); } });
    show(0);
  });
  $$('.cloud').forEach((c, i) => gsap.to(c, { y: -90 - i * 30, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: '+=900', scrub: true } }));
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
}
if (window.TEAM) $$('[data-team]').forEach(w => { w.innerHTML = window.TEAM.map((m, i) => `<div class="member" data-reveal style="--k:${i}"><div class="ph-box"><span>${m.name.trim()[0]}</span><i class="no">0${i + 1}</i></div><h4>${m.name}</h4>${m.role ? `<span class="label">${m.role}</span>` : ''}</div>`).join(''); });
$$('.hero-h').forEach(h => h.setAttribute('data-hero', ''));
if (hasGsap) init();

/* ---------- widgets ---------- */
$$('.idx').forEach(w => { const li = $$('li', w), ph = $$('.ph', w); const set = i => { li.forEach((l, k) => l.classList.toggle('on', k === i)); ph.forEach((p, k) => p.classList.toggle('on', k === i)); };
  li.forEach((l, i) => { l.addEventListener('pointerenter', () => set(i)); l.addEventListener('click', () => set(i)); }); set(0); });
$$('.film').forEach(f => { const v = $('video', f), prog = $('.prog i', f), time = $('.time', f), chs = $$('.chapters button');
  const toggle = () => { if (v.paused) { v.muted = false; v.play(); } else v.pause(); };
  f.addEventListener('click', toggle); v.addEventListener('play', () => { f.classList.add('playing'); f.classList.remove('paused'); }); v.addEventListener('pause', () => f.classList.add('paused'));
  v.addEventListener('timeupdate', () => { prog.style.transform = `scaleX(${v.currentTime / v.duration || 0})`; const t = v.currentTime; time && (time.textContent = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`);
    let k = -1; chs.forEach((c, i) => { if (t >= +c.dataset.t) k = i; }); chs.forEach((c, i) => c.classList.toggle('on', i === k)); });
  chs.forEach(c => c.addEventListener('click', () => { v.currentTime = +c.dataset.t; v.muted = false; v.play(); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); })); });
})();
