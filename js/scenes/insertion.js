/**
 * Scene: Orbital Insertion Burn (Precision Timing Game)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import {
  drawCompositeShip,
  drawSprite,
  SPRITE_MOON,
  SPRITE_MARS
} from '../core/sprites.js';

let markerPos = 0; // 0 to 1
let markerDir = 1;
let statePhase = 'AIMING'; // AIMING, BURNING, CAPTURED, MISSED
let timer = 0;
let shipX = 50;
let shipY = 85;

export const insertionScene = {
  enter(state) {
    markerPos = 0;
    markerDir = 1;
    statePhase = 'AIMING';
    timer = 0;
    shipX = 50;
    shipY = 85;
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (statePhase === 'AIMING') {
      // Ping-pong marker
      markerPos += markerDir * 1.5 * dt;
      if (markerPos >= 1.0) {
        markerPos = 1.0;
        markerDir = -1;
      } else if (markerPos <= 0.0) {
        markerPos = 0.0;
        markerDir = 1;
      }

      // Player fires main retro-engine!
      if (input.isPressed('ACTION') || input.isPressed('ENTER')) {
        statePhase = 'BURNING';
        timer = 0;
        sfx.burn();
        gfx.shake(5, 0.4);

        // Calculate if inside the green insertion zone
        const zonePct = (state.flight && state.flight.insertionZonePct) ? state.flight.insertionZonePct : 20;
        const zoneFraction = zonePct / 100;
        const minZ = 0.5 - zoneFraction / 2;
        const maxZ = 0.5 + zoneFraction / 2;

        if (markerPos >= minZ && markerPos <= maxZ) {
          statePhase = 'CAPTURED';
          sfx.win();
        } else {
          statePhase = 'MISSED';
          sfx.lose();
        }
      }
    } else if (statePhase === 'CAPTURED') {
      // Ship swings into orbit around planet
      shipX += 30 * dt;
      shipY += Math.sin(timer * 5) * 20 * dt;

      if (timer > 1.8) {
        sceneManager.go('ops');
      }
    } else if (statePhase === 'MISSED') {
      // Ship skips past planet into deep space
      shipX += 80 * dt;
      shipY -= 40 * dt;

      if (timer > 2.2) {
        state.flightResult = {
          success: false,
          failReason: 'insertion',
          scienceEarned: 0,
          dataDelivered: 0
        };
        sceneManager.go('report');
      }
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    // Planet on the right
    const isMars = state.mission && state.mission.id === 'mars';
    const planetSpr = isMars ? SPRITE_MARS : SPRITE_MOON;
    drawSprite(ctx, planetSpr, 215, 60, 2);

    // Title / Guidance HUD
    gfx.rect(ctx, 0, 0, 320, 18, 1);
    gfx.text(ctx, 'ORBITAL CAPTURE INSERTION BURN', 8, 5, 10, 1);
    gfx.text(ctx, `TARGET: ${state.mission ? state.mission.target.toUpperCase() : 'ORBIT'}`, 215, 5, 7, 1);
    gfx.line(ctx, 0, 18, 320, 18, 5);

    // Spacecraft
    const isThrusting = statePhase === 'BURNING' || statePhase === 'CAPTURED';
    drawCompositeShip(ctx, state, shipX, shipY, 1.5, isThrusting);

    // Insertion Timing Bar UI (at bottom)
    const barX = 60;
    const barY = 142;
    const barW = 200;
    const barH = 14;

    gfx.rect(ctx, barX - 10, barY - 18, barW + 20, 42, 1);
    gfx.rectb(ctx, barX - 10, barY - 18, barW + 20, 42, 5);

    // Instructions
    if (statePhase === 'AIMING') {
      gfx.centerText(ctx, 'PRESS SPACE IN GREEN CAPTURE ZONE', barY - 13, 7, 1);
    } else if (statePhase === 'CAPTURED') {
      gfx.centerText(ctx, 'PERFECT CAPTURE BURN! ORBIT ACHIEVED!', barY - 13, 11, 1);
    } else if (statePhase === 'MISSED') {
      gfx.centerText(ctx, 'BURN MISSED! ESCAPING INTO HELIOCENTRIC ORBIT!', barY - 13, 8, 1);
    }

    // Gray background bar
    gfx.rect(ctx, barX, barY, barW, barH, 5);

    // Green Capture Zone
    const zonePct = (state.flight && state.flight.insertionZonePct) ? state.flight.insertionZonePct : 20;
    const zoneW = Math.round(barW * (zonePct / 100));
    const zoneX = barX + Math.round((barW - zoneW) / 2);
    gfx.rect(ctx, zoneX, barY, zoneW, barH, 11);
    gfx.rectb(ctx, zoneX, barY, zoneW, barH, 7);

    // Moving Needle Indicator
    const needleX = barX + Math.round(markerPos * (barW - 4));
    gfx.rect(ctx, needleX, barY - 2, 4, barH + 4, 10);
    gfx.rectb(ctx, needleX, barY - 2, 4, barH + 4, 7);
  }
};
