/**
 * Scene: Orbital Insertion Burn Timing Challenge (480x270)
 * Redesigned for playability, fair difficulty tiers, and 2nd-chance recovery burns.
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
let statePhase = 'AIMING'; // AIMING, BURNING, SKIMMING, CAPTURED, MISSED
let timer = 0;
let shipX = 70;
let shipY = 120;
let hasRetried = false;
let lastErrorPct = 0;
let hitFeedbackText = '';

export const insertionScene = {
  enter(state) {
    markerPos = 0;
    markerDir = 1;
    statePhase = 'AIMING';
    timer = 0;
    shipX = 70;
    shipY = 120;
    hasRetried = false;
    lastErrorPct = 0;
    hitFeedbackText = '';
  },

  update(dt, state, sceneManager) {
    timer += dt;

    const markerSpeed = (state.difficulty && state.difficulty.markerSpeed)
      ? state.difficulty.markerSpeed
      : 1.0;

    const baseZone = (state.flight && state.flight.insertionZonePct) ? state.flight.insertionZonePct : 35;
    const fuelMod = (state.flight && state.flight.fuelPct) ? Math.min(1.0, state.flight.fuelPct / 100) : 1.0;
    const minFloor = (state.difficulty && state.difficulty.id === 'director') ? 12 : 20;
    const zonePct = Math.max(minFloor, Math.round(baseZone * fuelMod));

    const zoneFraction = zonePct / 100;
    const minZ = 0.5 - zoneFraction / 2;
    const maxZ = 0.5 + zoneFraction / 2;

    if (statePhase === 'AIMING') {
      markerPos += markerDir * markerSpeed * dt;
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

        if (markerPos >= minZ && markerPos <= maxZ) {
          statePhase = 'CAPTURED';
          const centerDist = Math.abs(markerPos - 0.5);
          hitFeedbackText = centerDist < 0.05
            ? 'BULLSEYE! PERFECT CIRCULAR ORBIT CAPTURE!'
            : 'ORBIT INSERTION SUCCESSFUL! TRAJECTORY LOCKED!';
          sfx.win();
        } else {
          // Missed the zone: calculate distance from zone edge
          lastErrorPct = Math.round(Math.abs(markerPos - 0.5) * 100 - (zonePct / 2));

          const curFuel = (state.flight && state.flight.fuelPct) ? state.flight.fuelPct : 100;
          if (!hasRetried && curFuel >= 15) {
            // Second chance recovery burn via atmospheric skimming!
            hasRetried = true;
            statePhase = 'SKIMMING';
            timer = 0;
            state.flight.fuelPct = Math.max(0, curFuel - 15);
            sfx.hit();
            gfx.shake(5, 0.3);
            hitFeedbackText = 'MISSED PRIMARY! SKIMMING UPPER ATMOSPHERE FOR RECOVERY BURN!';
          } else {
            statePhase = 'MISSED';
            hitFeedbackText = 'CAPTURE BURN MISSED! TRAJECTORY ESCAPES ON HYPERBOLIC FLYBY!';
            sfx.lose();
          }
        }
      }
    } else if (statePhase === 'SKIMMING') {
      // Atmospheric aerobraking skid - gives player a second chance!
      shipX += 30 * dt;
      shipY += Math.sin(timer * 8) * 15 * dt;

      if (timer > 2.0) {
        statePhase = 'AIMING';
        timer = 0;
        shipX = 70;
        shipY = 120;
        markerPos = 0.1;
        markerDir = 1;
      }
    } else if (statePhase === 'CAPTURED') {
      shipX += 45 * dt;
      shipY += Math.sin(timer * 5) * 30 * dt;

      if (timer > 2.2) {
        sceneManager.go('ops');
      }
    } else if (statePhase === 'MISSED') {
      shipX += 110 * dt;
      shipY -= 60 * dt;

      if (timer > 2.5) {
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
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.text(ctx, 'ORBITAL CAPTURE INSERTION BURN', 15, 8, 10, 1);
    const diffName = state.difficulty ? state.difficulty.name : 'ENGINEER';
    gfx.text(ctx, `TARGET: ${state.mission ? state.mission.target.toUpperCase() : 'ORBIT'} [${diffName}]`, 290, 8, 7, 1);
    gfx.line(ctx, 0, 26, 480, 26, 5);

    // Approaching spacecraft
    const isThrusting = statePhase === 'BURNING' || statePhase === 'CAPTURED' || statePhase === 'SKIMMING';
    drawCompositeShip(ctx, state, shipX, shipY, 2.0, isThrusting);

    // Timing Bar Box at bottom (X: 70, Y: 212, W: 340, H: 50)
    const barX = 80;
    const barY = 222;
    const barW = 320;
    const barH = 16;

    gfx.rect(ctx, barX - 15, barY - 26, barW + 30, 52, 1);
    gfx.rectb(ctx, barX - 15, barY - 26, barW + 30, 52, 5);

    // Dynamic zone computation
    const baseZone = (state.flight && state.flight.insertionZonePct) ? state.flight.insertionZonePct : 35;
    const fuelMod = (state.flight && state.flight.fuelPct) ? Math.min(1.0, state.flight.fuelPct / 100) : 1.0;
    const minFloor = (state.difficulty && state.difficulty.id === 'director') ? 12 : 20;
    const zonePct = Math.max(minFloor, Math.round(baseZone * fuelMod));

    const zoneW = Math.round(barW * (zonePct / 100));
    const zoneX = barX + Math.round((barW - zoneW) / 2);

    // Banner Text
    if (statePhase === 'AIMING') {
      if (hasRetried) {
        const blink = Math.floor(timer * 6) % 2 === 0;
        gfx.centerText(ctx, blink ? '⚠ RECOVERY BURN: HIT GREEN ZONE NOW! ⚠' : '', barY - 18, 9, 1);
      } else {
        gfx.centerText(ctx, 'PRESS SPACE / ENTER WHEN NEEDLE IS IN THE GREEN ZONE', barY - 18, 7, 1);
      }
    } else if (statePhase === 'SKIMMING') {
      const blink = Math.floor(timer * 8) % 2 === 0;
      gfx.centerText(ctx, blink ? 'AEROBRAKING SKIM... PREPARING SECOND RETRO-BURN!' : '', barY - 18, 9, 1);
    } else if (statePhase === 'CAPTURED') {
      gfx.centerText(ctx, hitFeedbackText, barY - 18, 11, 1);
    } else if (statePhase === 'MISSED') {
      gfx.centerText(ctx, hitFeedbackText, barY - 18, 8, 1);
    }

    // Bar background
    gfx.rect(ctx, barX, barY, barW, barH, 5);

    // Green Capture Zone
    gfx.rect(ctx, zoneX, barY, zoneW, barH, 11);
    gfx.rectb(ctx, zoneX, barY, zoneW, barH, 7);

    // Center Reference Line
    gfx.line(ctx, barX + Math.round(barW / 2), barY - 2, barX + Math.round(barW / 2), barY + barH + 2, 7);

    // Moving Needle
    const needleX = barX + Math.round(markerPos * (barW - 5));
    gfx.rect(ctx, needleX, barY - 4, 5, barH + 8, 10);
    gfx.rectb(ctx, needleX, barY - 4, 5, barH + 8, 7);

    // Bottom Telemetry Strip
    const fuelVal = Math.round(state.flight ? state.flight.fuelPct : 100);
    gfx.text(ctx, `CAPTURE ZONE: ${zonePct}% WIDTH (DV MARGIN)`, barX - 10, barY + 20, 11, 1);
    gfx.text(ctx, `FUEL: ${fuelVal}%${hasRetried ? ' (RETRY USED)' : ''}`, barX + 220, barY + 20, fuelVal < 25 ? 8 : 10, 1);
  }
};
