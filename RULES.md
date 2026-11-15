# Project rules
- Vanilla HTML/CSS/JavaScript with ES modules. NO frameworks, NO build step, NO backend, NO npm dependencies.
- Must run by serving the folder statically (python3 -m http.server / npx serve) and on GitHub Pages.
- Files: index.html, css/style.css, js/{main,state,data,engine,validate,simulate,score,ui}.js
- Game logic (engine, validate, simulate, score) must be pure functions with no DOM access.
- UI reads `state` and re-renders after every change via render().
- Keep code simple and commented. Prefer small functions.
- All numbers are simplified game values inspired by real physics; label them as such in the UI.
- Dark space theme, mobile-friendly, keyboard-accessible, never rely on colour alone.
- Do not add features I did not ask for. Ask before changing the file structure.
