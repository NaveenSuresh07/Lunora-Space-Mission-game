/**
 * Scene: Title Screen (Arcade Style)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { drawSprite, SPRITE_ROCKET, SPRITE_FLAME_1, SPRITE_FLAME_2 } from '../core/sprites.js';

let timer = 0;
let stars = [];

export const titleScene = {
  enter(state) {
    timer = 0;
    // Parallax stars
    stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 180,
      speed: Math.random() * 25 + 5,
      col: Math.random() > 0.4 ? 6 : 7
    }));
  },

  update(dt, state, sceneManager) {
    timer += dt;

    // Scroll stars
    for (const s of stars) {
      s.x -= s.speed * dt;
      if (s.x < 0) {
        s.x = 320;
        s.y = Math.random() * 180;
      }
    }

    if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
      sfx.confirm();
      sceneManager.go('select');
    }
  },

  draw(ctx, state) {
    // Clear dark space background
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    // Draw stars
    for (const s of stars) {
      gfx.px(ctx, s.x, s.y, s.col);
    }

    // Bobbing rocket sprite
    const bob = Math.sin(timer * 4) * 4;
    drawSprite(ctx, SPRITE_ROCKET, 155, 30 + bob, 1);
    const flame = Math.floor(timer * 12) % 2 === 0 ? SPRITE_FLAME_1 : SPRITE_FLAME_2;
    drawSprite(ctx, flame, 158, 54 + bob, 1);

    // Arcade Title
    gfx.centerText(ctx, 'MISSION DESIGNER', 68, 10, 2);
    gfx.centerText(ctx, 'PIXEL ARCADE EDITION', 86, 12, 1);

    // Blinking start banner
    if (Math.floor(timer * 2.5) % 2 === 0) {
      gfx.centerText(ctx, '► PRESS ENTER OR SPACE ◄', 115, 7, 1);
    }

    // Controls hints
    gfx.centerText(ctx, 'ARROWS: NAVIGATE   SPACE/ENTER: SELECT', 142, 5, 1);

    // Disclaimer
    gfx.centerText(ctx, 'NASA SPACE APPS 2026 · SIMPLIFIED ASTRODYNAMICS', 165, 13, 1);
  }
};
