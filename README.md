# Rooted SG — website

Five pages (Home, The app, RootStake, How it works, The story), five themes × light/dark.
**Meco** = the RootStake module + the Rooted SG app, as one bundle (heymeco.xyz).

- Edit copy in `_src/*.body.html`, then run `python3 build.py` to regenerate the `.html` pages.
- Team of five: `js/team.js`.
- Themes: `css/skins.css` (Glasshouse default = white/black with green keywords, Nightsoil, Kopi, Monsoon, Chalk). Same layout in every theme; each has its own type, shapes, buttons, cards, background.
- 3D scenes (three.js): `js/scenes.js` — probe assembly (tube, moisture board, pH electrode), house module, stem electrode, system walkthrough.
- Farm → plant → stem → cells → fungal colony → signal animation: `js/tissue.js` (2D canvas, scroll-driven, illustrative).
- Preview locally: `./start.command` (needs a server; ES modules and STL files don't load from `file://`).
