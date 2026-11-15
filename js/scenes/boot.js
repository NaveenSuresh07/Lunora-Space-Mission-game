/**
 * Scene: Boot Sequence (Ground Systems Online)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';

let timer = 0;
const bootLogs = [
  'DSN TELEMETRY INTERFACE: ONLINE',
  'TRAJECTORY FLIGHT COMPUTER: INITIALIZED',
  'PICO-8 16-COLOR DISPLAY BUS: 480X270 ACTIVE',
  'ASTRODYNAMICS ENGINE: LOADED (NASA PUBLIC DATA)',
  'MISSION CONTROL CONSOLES: PLANNER / ENG / SCI / COMMS READY',
  'ALL SYSTEMS NOMINAL. ENTER TO INITIALIZE MISSION.'
];

export const bootScene = {
  enter(state) {
    timer = 0;
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (input.isPressed('ENTER') || input.isPressed('ACTION') || timer > 2.8) {
      sfx.confirm();
      sceneManager.go('title');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    gfx.rect(ctx, 20, 20, 440, 230, 1);
    gfx.rectb(ctx, 20, 20, 440, 230, 12);

    gfx.text(ctx, 'NASA MISSION CONTROL SYSTEM BOOT V3.0', 35, 32, 10, 1);
    gfx.line(ctx, 20, 46, 460, 46, 12);

    const visibleLines = Math.min(bootLogs.length, Math.floor(timer * 2.5) + 1);
    let y = 60;
    for (let i = 0; i < visibleLines; i++) {
      gfx.text(ctx, `> ${bootLogs[i]}`, 35, y, i === visibleLines - 1 ? 11 : 7, 1);
      y += 18;
    }

    if (timer > 1.8) {
      if (Math.floor(timer * 3) % 2 === 0) {
        gfx.centerText(ctx, '► PRESS ENTER TO ENTER MISSION CONTROL ◄', 215, 10, 1);
      }
    }
  }
};
