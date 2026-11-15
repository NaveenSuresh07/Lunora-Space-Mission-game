/**
 * Scene: Rocket Launch & Ascent
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
let rocketY = 100;
let explosionFrame = 0;
let hasRolledFailure = false;
let failed = false;

export const launchScene = {
  enter(state) {
    phase = 'COUNTDOWN';
    timer = 0;
    rocketY = 100;
    explosionFrame = 0;
    hasRolledFailure = false;
    failed = false;
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (phase === 'COUNTDOWN') {
      if (timer < 1.0) {
        // T-3
      } else if (timer < 2.0) {
        // T-2
      } else if (timer < 3.0) {
        // T-1
      } else {
        phase = 'ASCENT';
        timer = 0;
        sfx.burn();
        gfx.shake(4, 1.5);
      }
    } else if (phase === 'ASCENT') {
      // Rocket ascends
      rocketY -= 35 * dt;

      // Billowing smoke/exhaust particles
      if (Math.random() > 0.3) {
        gfx.spawnParticles(160, rocketY + 28, 3, 6, 20, 0.4);
      }
      if (Math.random() > 0.4) {
        gfx.spawnParticles(160, rocketY + 28, 2, 9, 30, 0.3);
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
          gfx.shake(10, 0.8);
          gfx.spawnParticles(160, rocketY + 10, 30, 8, 80, 0.8);
          gfx.spawnParticles(160, rocketY + 10, 30, 9, 70, 0.6);
        }
      }

      // If survived to orbit
      if (timer > 3.8 && !failed) {
        phase = 'SUCCESS';
        timer = 0;
        sfx.confirm();
      }
    } else if (phase === 'EXPLODING') {
      explosionFrame = Math.min(3, Math.floor(timer * 6));
      if (timer > 1.8) {
        state.flightResult = {
          success: false,
          failReason: 'launch',
          scienceEarned: 0,
          dataDelivered: 0
        };
        sceneManager.go('report');
      }
    } else if (phase === 'SUCCESS') {
      if (timer > 1.5) {
        // If mission is LEO (no cruise needed), go directly to ops! Else cruise!
        if (state.mission && state.mission.id === 'leo') {
          sceneManager.go('ops');
        } else {
          sceneManager.go('cruise');
        }
      }
    }
  },

  draw(ctx, state) {
    // Sky gradient turns from ground blue to space black
    const progress = Math.min(1.0, Math.max(0, (100 - rocketY) / 120));
    const skyCol = progress > 0.7 ? 0 : (progress > 0.3 ? 1 : 12);
    gfx.rect(ctx, 0, 0, 320, 180, skyCol);

    // Stars reveal as sky darkens
    if (progress > 0.4) {
      gfx.px(ctx, 40, 30, 7);
      gfx.px(ctx, 90, 50, 6);
      gfx.px(ctx, 230, 25, 7);
      gfx.px(ctx, 280, 60, 6);
      gfx.px(ctx, 180, 15, 7);
      gfx.px(ctx, 130, 80, 6);
    }

    // Launchpad ground (scrolls down as rocket rises)
    const groundY = 145 + progress * 60;
    if (groundY < 180) {
      gfx.rect(ctx, 0, groundY, 320, 180 - groundY, 4);
      gfx.line(ctx, 0, groundY, 320, groundY, 5);
      // Gantry
      drawSprite(ctx, SPRITE_LAUNCHPAD, 140, groundY - 30, 1);
    }

    if (phase === 'COUNTDOWN') {
      // Rocket parked on pad
      drawSprite(ctx, SPRITE_ROCKET, 155, rocketY, 1);

      // Countdown Text
      const count = 3 - Math.floor(timer);
      const countStr = count > 0 ? `T-MINUS 0${count}` : 'IGNITION!';
      gfx.rect(ctx, 90, 40, 140, 24, 1);
      gfx.rectb(ctx, 90, 40, 140, 24, 10);
      gfx.centerText(ctx, countStr, 48, 10, 1);
    } else if (phase === 'ASCENT') {
      // Ascending Rocket
      drawSprite(ctx, SPRITE_ROCKET, 155, rocketY, 1);

      // Flame exhaust
      const flame = Math.floor(timer * 15) % 2 === 0 ? SPRITE_FLAME_1 : SPRITE_FLAME_2;
      drawSprite(ctx, flame, 158, rocketY + 24, 1);

      gfx.centerText(ctx, 'MAX-Q ASCENT PHASE', 20, 10, 1);
      gfx.centerText(ctx, `VELOCITY: ${Math.round(progress * 7800)} M/S`, 32, 7, 1);
    } else if (phase === 'EXPLODING') {
      drawSprite(ctx, SPRITE_EXPLOSIONS[explosionFrame], 150, rocketY, 2);
      gfx.centerText(ctx, 'CRITICAL LAUNCH VEHICLE ANOMALY', 35, 8, 1);
      gfx.centerText(ctx, 'SPACECRAFT LOST', 50, 8, 1);
    } else if (phase === 'SUCCESS') {
      drawSprite(ctx, SPRITE_ROCKET, 155, rocketY, 1);
      gfx.rect(ctx, 70, 70, 180, 28, 1);
      gfx.rectb(ctx, 70, 70, 180, 28, 11);
      gfx.centerText(ctx, 'STAGE SEPARATION NOMINAL', 76, 11, 1);
      gfx.centerText(ctx, 'TRANSIT TRAJECTORY REACHED!', 88, 7, 1);
    }

    // Top status strip
    gfx.rect(ctx, 0, 0, 320, 12, 1);
    gfx.text(ctx, `LAUNCH: ${state.launcher ? state.launcher.name.toUpperCase() : 'ROCKET'}`, 8, 3, 7, 1);
    gfx.text(ctx, `RELIABILITY: ${state.launcher ? (state.launcher.reliability * 100).toFixed(0) : 95}%`, 200, 3, 11, 1);
  }
};
