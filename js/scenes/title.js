/**
 * Scene: Title Screen (480x270 Arcade)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { drawSprite, SPRITE_ROCKET, SPRITE_FLAME_1, SPRITE_FLAME_2, SPRITE_EARTH } from '../core/sprites.js';

let timer = 0;
let stars = [];

export const titleScene = {
  enter(state) {
    timer = 0;
    stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * 480,
      y: Math.random() * 270,
      speed: Math.random() * 30 + 8,
      col: Math.random() > 0.4 ? 6 : 7
    }));
  },

  update(dt, state, sceneManager) {
    timer += dt;

    for (const s of stars) {
      s.x -= s.speed * dt;
      if (s.x < 0) {
        s.x = 480;
        s.y = Math.random() * 270;
      }
    }

    if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
      sfx.confirm();
      sceneManager.go('select');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    for (const s of stars) {
      gfx.px(ctx, s.x, s.y, s.col);
    }

    // Drifting Planet in background
    const planetX = 390 - (timer * 3) % 520;
    drawSprite(ctx, SPRITE_EARTH, planetX, 40, 2);

    // Bobbing Rocket
    const bob = Math.sin(timer * 4) * 5;
    drawSprite(ctx, SPRITE_ROCKET, 235, 38 + bob, 1.5);
    const flame = Math.floor(timer * 12) % 2 === 0 ? SPRITE_FLAME_1 : SPRITE_FLAME_2;
    drawSprite(ctx, flame, 239, 74 + bob, 1.5);

    // Big 2X Pixel Logo
    gfx.centerText(ctx, 'SPACE MISSION DESIGNER', 95, 10, 2);
    gfx.centerText(ctx, 'PIXEL ARCADE V3 · NASA SPACE APPS 2026', 122, 12, 1);

    // Blinking Start Prompt
    if (Math.floor(timer * 2.5) % 2 === 0) {
      gfx.centerText(ctx, '► PRESS ENTER OR SPACE TO START ◄', 158, 7, 1);
    }

    // Hotkey Controls Bar
    gfx.rect(ctx, 40, 192, 400, 24, 1);
    gfx.rectb(ctx, 40, 192, 400, 24, 13);
    gfx.centerText(ctx, 'ARROWS/WASD: MOVE   ENTER: SELECT   F: FULLSCREEN   H: CODEX   M: MUTE', 200, 7, 1);

    // Educational Disclaimer
    gfx.centerText(ctx, 'ALL FIGURES ARE SIMPLIFIED GAME APPROXIMATIONS INSPIRED BY REAL NASA DATA', 245, 5, 1);
  }
};
