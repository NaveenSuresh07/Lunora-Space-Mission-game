# Project rules
- Vanilla HTML5 Canvas + JS ES modules. NO frameworks, NO build step, NO backend, NO external image/audio files, works offline.
- Internal canvas 480x270, CSS-scaled to fill the window (16:9, letterboxed), image-rendering: pixelated, ctx.imageSmoothingEnabled=false. F toggles fullscreen.
- 16-colour PICO-8 palette only. 5x7 pixel font drawn from code (1x labels, 2x headings/numbers). No gradients, no anti-aliasing, no rounded shapes.
- Sprites = arrays of strings mapped to palette indices, defined in code. Sound = Web Audio square/triangle/noise only, started after the first key press.
- Game logic in js/model/ is pure (no DOM/canvas). Scenes only call it. Scene API: enter(), update(dt), draw(ctx), onKey(key).
- Data comes from data/nasa_reference.json and js/model/data.js. Every number is a simplified game value inspired by NASA/public figures; show "Sources" in the UI.
- Keyboard first (arrows/WASD, SPACE, ENTER, ESC) + touch buttons. Colour is never the only signal (use icons/blink/text).
- Do not add features I did not ask for. Ask before changing the file structure. Commit-friendly small changes.
