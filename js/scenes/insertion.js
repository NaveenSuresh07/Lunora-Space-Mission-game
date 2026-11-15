/**
 * Scene: Orbital Insertion Burn Timing Challenge (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import {
  drawCompositeShip,
  drawSprite,
  SPRITE_MOON,
  SPRITE_MARS,
  SPRITE_JUPITER
} from '../core/sprites.js';

let markerPos = 0;
let markerDir = 1;
let statePhase = 'AIMING'; // AIMING, BURNING, CAPTURED, MISSED
let timer = 0;
let shipX = 70;
let shipY = 120;

export const insertionScene = {
  enter(state) {
    markerPos = 0;
    markerDir = 1;
    statePhase = 'AIMING';
    timer = 0;
    shipX = 70;
    shipY = 120;
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (statePhase === 'AIMING') {
      markerPos += markerDir * 1.6 * dt;
      if (markerPos >= 1.0) {
        markerPos = 1.0;
        markerDir = -1;
      } else if (markerPos <= 0.0) {
        markerPos = 0.0;
        markerDir = 1;
      }

      if (input.isPressed('ACTION') || input.isPressed('ENTER')) {
        statePhase = 'BURNING';
        timer = 0;
        sfx.burn();
        gfx.shake(6, 0.4);

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
      shipX += 45 * dt;
      shipY += Math.sin(timer * 5) * 30 * dt;

      if (timer > 2.0) {
        sceneManager.go('ops');
      }
    } else if (statePhase === 'MISSED') {
      shipX += 110 * dt;
      shipY -= 60 * dt;

      if (timer > 2.4) {
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
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    // Target Planet on right
    const mId = state.mission ? state.mission.id : 'moon';
    const planetSpr = mId === 'jupiter' ? SPRITE_JUPITER : (mId === 'mars' ? SPRITE_MARS : SPRITE_MOON);
    drawSprite(ctx, planetSpr, 320, 80, 2.5);

    // Header
    gfx.rect(ctx, 0, 0, 480, 24, 1);
    gfx.text(ctx, 'ORBITAL CAPTURE INSERTION BURN', 15, 7, 10, 1);
    gfx.text(ctx, `TARGET: ${state.mission ? state.mission.target.toUpperCase() : 'ORBIT'}`, 330, 7, 7, 1);
    gfx.line(ctx, 0, 24, 480, 24, 5);

    // Approaching spacecraft
    const isThrusting = statePhase === 'BURNING' || statePhase === 'CAPTURED';
    drawCompositeShip(ctx, state, shipX, shipY, 2.0, isThrusting);

    // Timing Bar Box at bottom (X: 80, Y: 200, W: 320, H: 55)
    const barX = 90;
    const barY = 222;
    const barW = 300;
    const barH = 16;

    gfx.rect(ctx, barX - 15, barY - 22, barW + 30, 50, 1);
    gfx.rectb(ctx, barX - 15, barY - 22, barW + 30, 50, 5);

    if (statePhase === 'AIMING') {
      gfx.centerText(ctx, 'PRESS SPACE / ENTER WHEN NEEDLE IS IN THE GREEN ZONE', barY - 15, 7, 1);
    } else if (statePhase === 'CAPTURED') {
      gfx.centerText(ctx, 'PERFECT RETRO-FIRE! ORBIT INSERTION CONFIRMED!', barY - 15, 11, 1);
    } else if (statePhase === 'MISSED') {
      gfx.centerText(ctx, 'BURN MISSED! SPACECRAFT ESCAPED ON FLYBY TRAJECTORY!', barY - 15, 8, 1);
    }

    // Bar background
    gfx.rect(ctx, barX, barY, barW, barH, 5);

    // Green Capture Zone
    const zonePct = (state.flight && state.flight.insertionZonePct) ? state.flight.insertionZonePct : 20;
    const zoneW = Math.round(barW * (zonePct / 100));
    const zoneX = barX + Math.round((barW - zoneW) / 2);
    gfx.rect(ctx, zoneX, barY, zoneW, barH, 11);
    gfx.rectb(ctx, zoneX, barY, zoneW, barH, 7);

    // Moving Needle
    const needleX = barX + Math.round(markerPos * (barW - 5));
    gfx.rect(ctx, needleX, barY - 3, 5, barH + 6, 10);
    gfx.rectb(ctx, needleX, barY - 3, 5, barH + 6, 7);
  }
};
