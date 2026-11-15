/**
 * Scene: Mission Stage Selection
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { MISSIONS } from '../model/data.js';
import { drawSprite, SPRITE_EARTH, SPRITE_MOON, SPRITE_MARS } from '../core/sprites.js';

let selectedIndex = 0;
let timer = 0;

export const selectScene = {
  enter(state) {
    timer = 0;
    selectedIndex = 0;
    if (state.mission) {
      const idx = MISSIONS.findIndex(m => m.id === state.mission.id);
      if (idx >= 0) selectedIndex = idx;
    }
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (input.isPressed('LEFT')) {
      sfx.select();
      selectedIndex = (selectedIndex - 1 + MISSIONS.length) % MISSIONS.length;
    }
    if (input.isPressed('RIGHT')) {
      sfx.select();
      selectedIndex = (selectedIndex + 1) % MISSIONS.length;
    }
    if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
      sfx.confirm();
      state.mission = MISSIONS[selectedIndex];
      sceneManager.go('hangar');
    }
    if (input.isPressed('ESC')) {
      sfx.cancel();
      sceneManager.go('title');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    // Header
    gfx.rect(ctx, 0, 0, 320, 22, 1);
    gfx.centerText(ctx, 'SELECT MISSION DESTINATION', 7, 10, 1);
    gfx.line(ctx, 0, 22, 320, 22, 12);

    const planetSprites = [SPRITE_EARTH, SPRITE_MOON, SPRITE_MARS];
    const planetX = [60, 160, 260];
    const planetY = 55;

    // Draw the 3 stages
    for (let i = 0; i < MISSIONS.length; i++) {
      const m = MISSIONS[i];
      const isSel = i === selectedIndex;
      const x = planetX[i];
      const y = planetY;

      // Draw Planet
      drawSprite(ctx, planetSprites[i], x - 10, y - 10, 1);

      // Label & Difficulty
      gfx.text(ctx, m.target, x - (m.target.length * 3), y + 18, isSel ? 10 : 6, 1);
      gfx.text(ctx, m.stars, x - 9, y + 27, isSel ? 9 : 5, 1);

      // Selector Box
      if (isSel) {
        const pulse = Math.floor(timer * 4) % 2 === 0 ? 10 : 7;
        gfx.rectb(ctx, x - 26, y - 20, 52, 58, pulse);
        gfx.text(ctx, '▲', x - 3, y + 37, 10, 1);
      }
    }

    // Detail Panel for selected mission
    const cur = MISSIONS[selectedIndex];
    gfx.rect(ctx, 16, 105, 288, 54, 1);
    gfx.rectb(ctx, 16, 105, 288, 54, 12);

    // Mission Details
    gfx.text(ctx, `${cur.name.toUpperCase()}`, 24, 111, 7, 1);
    gfx.text(ctx, `BUDGET: $${cur.budget}M`, 170, 111, 11, 1);

    gfx.text(ctx, `DV REQ: ${cur.deltaVNeeded > 0 ? cur.deltaVNeeded + ' KM/S' : 'DIRECT'}`, 24, 122, 10, 1);
    gfx.text(ctx, `LINK LOSS: ${cur.linkLoss}X`, 170, 122, 9, 1);

    gfx.text(ctx, `MIN SCI: ${cur.minScience} PTS`, 24, 133, 11, 1);
    gfx.text(ctx, `MIN DATA: ${cur.minDataGb} GB`, 170, 133, 12, 1);

    gfx.text(ctx, cur.desc.toUpperCase(), 24, 145, 6, 1);

    // Footer prompt
    gfx.centerText(ctx, '◄ LEFT / RIGHT: CHOOSE   ENTER: ASSEMBLE SHIP ►', 168, 7, 1);
  }
};
