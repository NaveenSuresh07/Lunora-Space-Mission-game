/**
 * Scene: Launchpad Liftoff & Ascent (480x270)
 */

import { gfx } from '../core/gfx.js';
import { sfx } from '../core/audio.js';
import {
  drawSprite,
  SPRITE_LAUNCHPAD,
  SPRITE_ROCKET,
  SPRITE_FLAME_1,
  SPRITE_FLAME_2,
  SPRITE_EXPLOSIONS
} from '../core/sprites.js';

let phase = 'COUNTDOWN'; // COUNTDOWN, ASCENT, EXPLODING, SUCCESS
let timer = 0;
let rocketY = 160;
let gantryX = 210;
let explosionFrame = 0;
let hasRolledFailure = false;
let failed = false;

export const launchScene = {
  enter(state) {
    phase = 'COUNTDOWN';
    timer = 0;
    rocketY = 160;
    gantryX = 210;
    explosionFrame = 0;
    hasRolledFailure = false;
    failed = false;
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (phase === 'COUNTDOWN') {
      // Retract gantry
      if (timer > 1.0) {
        gantryX = Math.max(160, gantryX - 40 * dt);
      }
      if (timer > 3.0) {
        phase = 'ASCENT';
        timer = 0;
        sfx.burn();
        gfx.shake(5, 1.5);
      }
    } else if (phase === 'ASCENT') {
      rocketY -= 45 * dt;

      // Exhaust particles
      if (Math.random() > 0.2) {
        gfx.spawnParticles(240, rocketY + 36, 4, 6, 25, 0.4);
      }
      if (Math.random() > 0.3) {
        gfx.spawnParticles(240, rocketY + 36, 3, 9, 35, 0.3);
      }

      // Check failure roll mid-ascent (at timer ~ 1.8s)
      if (timer > 1.8 && !hasRolledFailure) {
        hasRolledFailure = true;
        const roll = Math.random();
        const rel = state.launcher ? state.launcher.reliability : 0.95;
        if (roll > rel) {
          failed = true;
          phase = 'EXPLODING';
          timer = 0;
          sfx.explosion();
          gfx.shake(12, 0.8);
          gfx.spawnParticles(240, rocketY + 15, 35, 8, 90, 0.8);
          gfx.spawnParticles(240, rocketY + 15, 35, 9, 80, 0.6);
        }
      }

      if (timer > 3.8 && !failed) {
        phase = 'SUCCESS';
        timer = 0;
        sfx.confirm();
      }
    } else if (phase === 'EXPLODING') {
      explosionFrame = Math.min(3, Math.floor(timer * 6));
      if (timer > 2.0) {
        state.flightResult = {
          success: false,
          failReason: 'launch',
          scienceEarned: 0,
          dataDelivered: 0
        };
        sceneManager.go('report');
      }
    } else if (phase === 'SUCCESS') {
      if (timer > 1.8) {
        if (state.mission && state.mission.id === 'leo') {
          sceneManager.go('ops');
        } else {
          sceneManager.go('cruise');
        }
      }
    }
  },

  draw(ctx, state) {
    const progress = Math.min(1.0, Math.max(0, (160 - rocketY) / 160));
    const skyCol = progress > 0.7 ? 0 : (progress > 0.3 ? 1 : 12);
    gfx.rect(ctx, 0, 0, 480, 270, skyCol);

    // Stars emerge as sky darkens
    if (progress > 0.4) {
      gfx.px(ctx, 60, 40, 7);
      gfx.px(ctx, 130, 70, 6);
      gfx.px(ctx, 350, 35, 7);
      gfx.px(ctx, 420, 80, 6);
      gfx.px(ctx, 270, 25, 7);
      gfx.px(ctx, 190, 110, 6);
    }

    // Ground & Pad (scrolls downward)
    const groundY = 220 + progress * 80;
    if (groundY < 270) {
      gfx.rect(ctx, 0, groundY, 480, 270 - groundY, 4);
      gfx.line(ctx, 0, groundY, 480, groundY, 5);
      // Retracting Gantry
      drawSprite(ctx, SPRITE_LAUNCHPAD, gantryX, groundY - 32, 1.2);
    }

    if (phase === 'COUNTDOWN') {
      drawSprite(ctx, SPRITE_ROCKET, 235, rocketY, 1.5);

      const count = 3 - Math.floor(timer);
      const countStr = count > 0 ? `T-MINUS 0${count}` : 'MAIN ENGINE IGNITION!';
      gfx.rect(ctx, 140, 50, 200, 28, 1);
      gfx.rectb(ctx, 140, 50, 200, 28, 10);
      gfx.centerText(ctx, countStr, 59, 10, 1);
    } else if (phase === 'ASCENT') {
      drawSprite(ctx, SPRITE_ROCKET, 235, rocketY, 1.5);
      const flame = Math.floor(timer * 15) % 2 === 0 ? SPRITE_FLAME_1 : SPRITE_FLAME_2;
      drawSprite(ctx, flame, 239, rocketY + 36, 1.5);

      gfx.centerText(ctx, 'MAX-Q FLIGHT PROFILE', 35, 10, 1);
      gfx.centerText(ctx, `VELOCITY: ${Math.round(progress * 7800)} M/S`, 50, 7, 1);
    } else if (phase === 'EXPLODING') {
      drawSprite(ctx, SPRITE_EXPLOSIONS[explosionFrame], 225, rocketY, 2.5);
      gfx.centerText(ctx, 'CRITICAL LAUNCH VEHICLE ANOMALY', 50, 8, 1);
      gfx.centerText(ctx, 'VEHICLE STRUCTURAL BREAKUP', 68, 8, 1);
    } else if (phase === 'SUCCESS') {
      drawSprite(ctx, SPRITE_ROCKET, 235, rocketY, 1.5);
      gfx.rect(ctx, 110, 90, 260, 36, 1);
      gfx.rectb(ctx, 110, 90, 260, 36, 11);
      gfx.centerText(ctx, 'STAGE SEPARATION CONFIRMED', 98, 11, 1);
      gfx.centerText(ctx, 'ORBITAL INJECTION TRAJECTORY NOMINAL!', 112, 7, 1);
    }

    // Top Status Bar
    gfx.rect(ctx, 0, 0, 480, 16, 1);
    gfx.text(ctx, `LAUNCH VEHICLE: ${state.launcher ? state.launcher.name.toUpperCase() : 'BOOSTER'}`, 12, 4, 7, 1);
    gfx.text(ctx, `RELIABILITY: ${state.launcher ? (state.launcher.reliability * 100).toFixed(0) : 95}%`, 330, 4, 11, 1);
  }
};
