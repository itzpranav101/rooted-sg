// MOJO — the carrot who shows people around. He sits in the page flow, in a short aside above the part he is talking about,
// and runs in when it scrolls into view. On every page the last stop is the "next" band, where he walks the loop to the next page.
(() => {
const page = document.body.dataset.page, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NEXT = { home: ['rootstake.html', 'The RootStake module'], rootstake: ['app.html', 'The Rooted SG app'], app: ['how-it-works.html', 'How it works'], how: ['impact.html', 'The story'], impact: ['index.html', 'Home'] };
const SAYS = { home: 'Ready? Next stop is the module.', rootstake: "That's the measuring half. Now the counting half.", app: 'Next, why any of this exists.', how: 'One more stop: the story behind the numbers.', impact: 'And back to the start. The loop closes.' };
const click = sel => () => { const e = $(sel); if (e) e.click(); };
const to = u => () => { location.href = u; };
// [target, where, mood, text, action?, centered?]
const BEATS = {
  home: [
    ['.hero-row', 'prepend', 'happy', "Hi, I'm Mojo. Four things are coming up. Tap one if it catches your eye.", ['Why we built it', to('how-it-works.html#origin')], true],
    ['#mname', 'before', 'happy', 'Watch the words squeeze together as you scroll.'],
    ['.bundle', 'after', 'think', 'Two halves, one bundle. Curious about the measuring half first?', ['Open the module', to('rootstake.html')]],
    ['#seq', 'before', 'idle', "That's the probe. It goes in the soil. Keep scrolling and it comes apart."],
    ['.pstage', 'before', 'happy', 'Poke the tabs. Each one is a real screen.', null, true],
    ['.themes', 'before', 'happy', 'Try a theme. The whole site changes shape.', ['Surprise me', () => { const t = $$('.theme'); const c = t[Math.floor(Math.random() * t.length)]; if (c) c.click(); }]],
  ],
  rootstake: [
    ['#parts', 'before', 'happy', 'This is the measuring half. Scroll slowly and every part slides into its slot.'],
    ['.power-grid', 'before', 'idle', 'It mostly sleeps. That is how the battery lasts.'],
    ['#stem', 'before', 'think', 'Two tiny needles. Watch where the current goes.'],
    ['#tissue', 'before', 'happy', 'Now the big one: a whole farm, down to a single cell.'],
    ['.dose-card', 'before', 'happy', 'Drag the slider. See when the pump decides.', ['Run it for me', click('#dsim')]],
  ],
  app: [
    ['#walk', 'before', 'happy', 'The counting half. Real screens, straight off an iPhone.'],
    ['.try-grid', 'before', 'happy', 'Go on, tap the button. See what a day looks like.', ['Check in for me', click('#tbtn')]],
  ],
  how: [
    ['#origin', 'before', 'sad', 'It started somewhere small. Scroll and watch the table fill up, then the worries, then the answers.'],
    ['.loopfig', 'before', 'happy', 'Hover the circles. One reading goes all the way round.'],
    ['#tt', 'before', 'think', 'Every number says how real it is. Try the filters above.'],
  ],
  impact: [
    ['#gap', 'before', 'sad', 'Nobody records how many survive. Watch the field.'],
    ['.dots-card', 'before', 'idle', 'Each dot is a person. Flip between the two groups.'],
    ['.dont', 'before', 'think', 'Tap a card. We would rather be checked than impressed.'],
    ['.team', 'before', 'happy', 'These are the humans.'],
  ],
}[page] || [];
const hidden = (() => { try { return localStorage.getItem('rs-mojo-off') === '1'; } catch (e) { return false; } })();
['idle', 'happy', 'think', 'sad', 'run'].forEach(m => { const i = new Image(); i.src = `media/mojo/${m}.gif`; });

/* asides in the page flow */
function build([sel, where, mood, text, action, center]) {
  const t = $(sel); if (!t) return;
  if (t.hasAttribute('data-pin')) return buildStage(t, mood, text, action);
  const w = document.createElement('div'); w.className = 'wrap ma-wrap' + (center ? ' center' : '');
  w.innerHTML = `<aside class="mojo-aside" aria-label="A note from Mojo"><img class="ma-img" src="media/mojo/idle.gif" alt="" width="96" height="104"><div class="ma-bub"><p></p><div class="ma-acts"></div><button class="ma-x" type="button" aria-label="Hide Mojo">×</button></div></aside>`;
  if (where === 'after') t.after(w); else if (where === 'prepend') { w.className = 'ma-row'; t.prepend(w); } else t.before(w);
  const a = $('.mojo-aside', w), img = $('.ma-img', w), p = $('p', w), acts = $('.ma-acts', w);
  p.textContent = text; p.style.minHeight = '1.4em';
  if (action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = action[0]; b.addEventListener('click', action[1]); acts.appendChild(b); }
  $('.ma-x', w).addEventListener('click', () => { $$('.ma-wrap').forEach(e => e.remove()); try { localStorage.setItem('rs-mojo-off', '1'); } catch (e) {} });
  let done = false;
  new IntersectionObserver((es, o) => { if (!es[0].isIntersecting || done) return; done = true; o.disconnect();
    if (reduced) { a.classList.add('in'); img.src = `media/mojo/${mood}.gif`; return; }
    a.classList.add('run'); img.src = 'media/mojo/run.gif';
    setTimeout(() => { a.classList.remove('run'); a.classList.add('in'); img.src = `media/mojo/${mood}.gif`; reveal(p, text); }, 750); }, { threshold: .55, rootMargin: '-96px 0px -3% 0px' }).observe(a);
}
/* pinned sections: Mojo rides inside the stage card for the first moments, then steps out of the way */
function buildStage(pin, mood, text, action) {
  const vis = $('.pin-vis', pin); if (!vis) return;
  const a = document.createElement('aside'); a.className = 'mojo-aside stage'; a.setAttribute('aria-label', 'A note from Mojo');
  a.innerHTML = `<img class="ma-img" src="media/mojo/idle.gif" alt="" width="96" height="104"><div class="ma-bub"><p></p><div class="ma-acts"></div><button class="ma-x" type="button" aria-label="Hide Mojo">×</button></div>`;
  vis.appendChild(a); const img = $('.ma-img', a), p = $('p', a), acts = $('.ma-acts', a); p.style.minHeight = '1.4em';
  if (action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = action[0]; b.addEventListener('click', action[1]); acts.appendChild(b); }
  $('.ma-x', a).addEventListener('click', () => { $$('.ma-wrap,.mojo-aside').forEach(e => e.remove()); try { localStorage.setItem('rs-mojo-off', '1'); } catch (e) {} });
  let on = false, played = false, inView = false;
  new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { threshold: .2 }).observe(pin);
  const tick = () => { const pr = parseFloat(getComputedStyle(pin).getPropertyValue('--p')) || 0, want = inView && pr < .12 && (pin.getBoundingClientRect().top <= 8);
    if (want && !on) { on = true; a.classList.add('in'); img.src = played ? `media/mojo/${mood}.gif` : 'media/mojo/run.gif'; if (!played) { played = true; setTimeout(() => { img.src = `media/mojo/${mood}.gif`; reveal(p, text); }, reduced ? 0 : 700); if (reduced) p.textContent = text; } }
    else if (!want && on) { on = false; a.classList.remove('in'); } };
  addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
}
const SPROUT = '<svg viewBox="0 0 48 40" width="40" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="sp g0" pathLength="1" d="M5 36H43"/><path class="sp g1" pathLength="1" d="M24 36V14"/><path class="sp g2" pathLength="1" d="M24 26C15 26 11 20 11 13c8 0 13 5 13 13"/><path class="sp g3" pathLength="1" d="M24 20C32 20 36 14 36 8c-8 0-12 5-12 12"/></svg>';
/* a little plant grows in the bubble, then the words type in */
function reveal(p, text) { if (reduced) { p.textContent = text; return; } const bub = p.closest('.ma-bub'); p.textContent = ''; bub.classList.add('typing'); const s = document.createElement('span'); s.className = 'ma-sprout'; s.innerHTML = SPROUT; bub.insertBefore(s, p); setTimeout(() => { s.classList.add('out'); setTimeout(() => { s.remove(); typeIn(p, text); }, 220); }, 950); }
function typeIn(p, text) { p.textContent = ''; let i = 0; const bub = p.closest('.ma-bub'); const t = setInterval(() => { p.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); bub && bub.classList.remove('typing'); } }, 16); }
if (!hidden) BEATS.forEach(build);

/* next band: Mojo runs along the loop to the next stop, then says one line */
const band = $('.nextband');
if (band) { const nb = $('.nb-mojo', band), tr = $('.nb-track', band);
  new IntersectionObserver((es, o) => { if (!es[0].isIntersecting) return; o.disconnect(); band.classList.add('go'); nb.src = 'media/mojo/run.gif';
    setTimeout(() => { nb.src = 'media/mojo/happy.gif'; const d = document.createElement('div'); d.className = 'nb-say'; d.innerHTML = `<span></span><a href="${NEXT[page][0]}">Go</a>`; $('span', d).textContent = SAYS[page]; tr.appendChild(d); }, reduced ? 0 : 1950); }, { threshold: .5 }).observe(band); }
})();
