# Rooted SG — website

Five pages (Home, The app, RootStake, How it works, The story), five themes × light/dark.
**Meco** = the RootStake module + the Rooted SG app, as one bundle (heymeco.xyz).

- Edit copy in `_src/*.body.html`, then run `python3 build.py` to regenerate the `.html` pages.
- Team of five: `js/team.js`.
- Themes: `css/skins.css` (Glasshouse default = white/black with green keywords, Nightsoil, Kopi, Monsoon, Chalk). Same layout in every theme; each has its own type, shapes, buttons, cards, background.
- Mojo, the carrot guide: `js/mojo.js` + `media/mojo/*.gif` (sad, idle, happy, think, run). He sits in short asides above sections; edit the BEATS table to change where and what he says.
- 3D scenes (three.js): `js/scenes.js` — probe assembly (tube, moisture board, pH electrode), house module, stem electrode, system walkthrough.
- Farm → plant → stem → cells → fungal colony → signal animation: `js/tissue.js` (2D canvas, scroll-driven, illustrative).
- Preview locally: `./start.command` (needs a server; ES modules and STL files don't load from `file://`).

## RWCC edition (`rwcc/`)
A separate, app-only version for the RWCC competition: only Rooted SG, with no RootStake, no Meco and no hardware.
- Pages: Home, The problem, The app, Impact and pilot, Our story. Edit copy in `rwcc/_src/*.body.html`, then run `python3 build.py` inside `rwcc/`.
- Own engine and storage keys (`rwcc/js/site.js`, `rwcc/js/mojo.js`, `rwcc/js/rwcc.js`), same five themes in `rwcc/css/`.
- Real app screens, the two mascots and the two background photos came from the competition slide deck (`rwcc/media/`).
- Served at `/rwcc/` on the same domain.

## MECO resources page (`meco.html`)
Posters, the pitch deck (scroll-through viewer) and every PDF, to read in place or download. Files live in `media/meco/`; deck slide images are in `media/meco/deck/`. Add the essay and the films in `js/meco-resources.js` and they appear on the page automatically.
