/**
 * Scene: Mission Codex & Aerospace Engineering Handbook (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { CODEX_ENTRIES } from '../model/codex.js';

let selectedIndex = 0;
let previousScene = 'hangar';

export const codexScene = {
  enter(state, prevScene = 'hangar') {
    selectedIndex = 0;
    if (prevScene && prevScene !== 'codex') {
      previousScene = prevScene;
    }
  },

  update(dt, state, sceneManager) {
    if (input.isPressed('UP')) {
      sfx.select();
      selectedIndex = (selectedIndex - 1 + CODEX_ENTRIES.length) % CODEX_ENTRIES.length;
    }
    if (input.isPressed('DOWN')) {
      sfx.select();
      selectedIndex = (selectedIndex + 1) % CODEX_ENTRIES.length;
    }
    if (input.isPressed('ESC') || input.isPressed('H') || input.isPressed('ENTER')) {
      sfx.cancel();
      sceneManager.go(previousScene || 'hangar');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    // Header
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.line(ctx, 0, 26, 480, 26, 12);
    gfx.centerText(ctx, 'NASA MISSION CODEX: SYSTEMS ENGINEERING HANDBOOK', 8, 10, 1);

    // Left List (X: 12, Y: 34, W: 160, H: 200)
    gfx.rect(ctx, 12, 34, 160, 200, 1);
    gfx.rectb(ctx, 12, 34, 160, 200, 5);

    let y = 42;
    for (let i = 0; i < CODEX_ENTRIES.length; i++) {
      const entry = CODEX_ENTRIES[i];
      const isSel = i === selectedIndex;

      if (isSel) {
        gfx.rect(ctx, 16, y - 2, 152, 13, 2);
        gfx.text(ctx, '►', 14, y, 10, 1);
      }

      gfx.text(ctx, entry.title.slice(0, 19), 24, y, isSel ? 7 : 6, 1);
      y += 16;
    }

    // Right Content Panel (X: 180, Y: 34, W: 288, H: 200)
    const cur = CODEX_ENTRIES[selectedIndex];
    gfx.rect(ctx, 180, 34, 288, 200, 1);
    gfx.rectb(ctx, 180, 34, 288, 200, 12);

    gfx.text(ctx, cur.category, 192, 42, 14, 1);
    gfx.text(ctx, cur.title, 192, 54, 10, 1);
    gfx.line(ctx, 180, 68, 468, 68, 5);

    let cy = 76;
    for (const line of cur.text) {
      gfx.text(ctx, line, 192, cy, 7, 1);
      cy += 12;
    }

    // Footer
    gfx.rect(ctx, 0, 244, 480, 26, 1);
    gfx.centerText(ctx, 'UP / DOWN: BROWSE TOPICS   ESC / H: RESUME FLIGHT', 252, 7, 1);
  }
};
