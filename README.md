# Rooted SG — website

Five pages (Home, The app, RootStake, How it works, The story), light + dark.

- Edit copy in `_src/*.body.html`, then run `python3 build.py` to regenerate the `.html` pages.
- Edit the team of five in `js/team.js`.
- Preview locally: `./start.command` (needs a server; ES modules + STL files don't load from `file://`).
- 3D: real RootStake CAD (`assets/models/*.stl`) rendered live with three.js. App screens and the film in `media/` are from the real iOS build and the RootStake film.
