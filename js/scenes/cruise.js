/**
 * Scene: Interplanetary Cruise (480x270 Hazard Dodge Runner)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import {
  drawCompositeShip,
  drawSprite,
  SPRITE_HEART,
  SPRITE_HEART_EMPTY,
  SPRITE_ASTEROID_SM,
  SPRITE_ASTEROID_MED,
  SPRITE_ASTEROID_LG,
  SPRITE_MICROMETEOROID,
  SPRITE_EXPLOSIONS
} from '../core/sprites.js';

let shipX = 45;
let shipY = 135;
let invulnTimer = 0;
let cruiseTimer = 0;
let totalDuration = 30; // Moon 30s, Mars 45s, Jupiter 55s
let stars = [];
let hazards = [];
let flare = null;
let spawnTimer = 0;
let flareSpawnTimer = 0;
let isDead = false;
let deathTimer = 0;

export const cruiseScene = {
  enter(state) {
    shipX = 45;
    shipY = 135;
    invulnTimer = 0;
    cruiseTimer = 0;
    isDead = false;
    deathTimer = 0;
    hazards = [];
    flare = null;
    spawnTimer = 0;
    flareSpawnTimer = 4.0;

    const mId = state.mission ? state.mission.id : 'moon';
    totalDuration = mId === 'jupiter' ? 55 : (mId === 'mars' ? 45 : 30);

    stars = Array.from({ length: 65 }, () => ({
      x: Math.random() * 480,
      y: 24 + Math.random() * 225,
      speed: Math.random() * 40 + 12,
      col: Math.random() > 0.5 ? 6 : 7
    }));
  },

  update(dt, state, sceneManager) {
    if (isDead) {
      deathTimer += dt;
      if (deathTimer > 2.0) {
        state.flightResult = {
          success: false,
          failReason: 'cruise',
          scienceEarned: 0,
          dataDelivered: 0
        };
        sceneManager.go('report');
      }
      return;
    }

    cruiseTimer += dt;
    if (invulnTimer > 0) invulnTimer -= dt;

    // Starfield scroll
    for (const s of stars) {
      s.x -= s.speed * dt;
      if (s.x < 0) {
        s.x = 480;
        s.y = 24 + Math.random() * 225;
      }
    }

    // Player ship movement
    const speed = (state.flight && state.flight.moveSpeed) ? state.flight.moveSpeed : 85;
    let moved = false;

    if (input.isDown('UP')) {
      shipY = Math.max(30, shipY - speed * dt);
      moved = true;
    }
    if (input.isDown('DOWN')) {
      shipY = Math.min(240, shipY + speed * dt);
      moved = true;
    }
    if (input.isDown('LEFT')) {
      shipX = Math.max(20, shipX - speed * dt * 0.7);
      moved = true;
    }
    if (input.isDown('RIGHT')) {
      shipX = Math.min(180, shipX + speed * dt * 0.7);
      moved = true;
    }

    if (moved && state.flight) {
      state.flight.fuelPct = Math.max(0, state.flight.fuelPct - 0.3 * dt);
    }

    // Hazard Spawning
    spawnTimer += dt;
    if (spawnTimer > 1.2) {
      spawnTimer = 0;
      const isMicro = Math.random() > 0.55;
      hazards.push({
        type: isMicro ? 'micro' : (Math.random() > 0.6 ? 'ast_med' : 'ast_sm'),
        x: 495,
        y: 35 + Math.random() * 205,
        vx: isMicro ? -160 : -(Math.random() * 45 + 75),
        vy: (Math.random() * 30 - 15)
      });
    }

    // Solar Flare Column
    flareSpawnTimer += dt;
    if (!flare && flareSpawnTimer > 8.0) {
      flareSpawnTimer = 0;
      flare = {
        x: 90 + Math.random() * 260,
        width: 44,
        warningTimer: 1.2,
        activeTimer: 0.9
      };
    }

    if (flare) {
      if (flare.warningTimer > 0) {
        flare.warningTimer -= dt;
      } else if (flare.activeTimer > 0) {
        flare.activeTimer -= dt;
        if (shipX >= flare.x - 12 && shipX <= flare.x + flare.width && invulnTimer <= 0) {
          invulnTimer = 1.0;
          if (state.bus && state.bus.id === 'large') {
            sfx.hit();
            gfx.shake(4, 0.2);
            gfx.spawnParticles(shipX, shipY, 20, 12, 60, 0.4);
          } else {
            const roll = Math.random();
            const rel = state.bus ? state.bus.reliability : 0.93;
            if (roll > rel) {
              this.killShip(state);
            } else {
              this.damageShip(state, 1);
            }
          }
        }
      } else {
        flare = null;
      }
    }

    // Update Hazards & Collision Check
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt;

      const radius = h.type === 'ast_med' ? 8 : (h.type === 'ast_sm' ? 5 : 4);
      const dist = Math.hypot(shipX - h.x, shipY - h.y);

      if (dist < radius + 10 && invulnTimer <= 0) {
        hazards.splice(i, 1);
        invulnTimer = 0.9;
        if (h.type === 'micro') {
          if (state.flight) {
            state.flight.powerPct = Math.max(0, state.flight.powerPct - 15);
          }
          sfx.hit();
          gfx.shake(3, 0.2);
          gfx.spawnParticles(h.x, h.y, 10, 9, 45, 0.3);
        } else {
          this.damageShip(state, 1);
        }
        continue;
      }

      if (h.x < -30) {
        hazards.splice(i, 1);
      }
    }

    // Arrival
    if (cruiseTimer >= totalDuration) {
      sfx.confirm();
      sceneManager.go('insertion');
    }
  },

  damageShip(state, dmg) {
    if (!state.flight) return;
    state.flight.hearts -= dmg;
    sfx.hit();
    gfx.shake(7, 0.3);
    gfx.spawnParticles(shipX, shipY, 20, 8, 70, 0.5);

    if (state.flight.hearts <= 0) {
      this.killShip(state);
    }
  },

  killShip(state) {
    isDead = true;
    deathTimer = 0;
    if (state.flight) state.flight.hearts = 0;
    sfx.explosion();
    gfx.shake(14, 0.8);
    gfx.spawnParticles(shipX, shipY, 50, 8, 100, 0.8);
    gfx.spawnParticles(shipX, shipY, 50, 9, 85, 0.6);
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    for (const s of stars) {
      gfx.px(ctx, s.x, s.y, s.col);
    }

    // Solar Flare Column
    if (flare) {
      if (flare.warningTimer > 0) {
        const blink = Math.floor(cruiseTimer * 10) % 2 === 0;
        if (blink) {
          gfx.rect(ctx, flare.x, 24, flare.width, 226, 8);
          gfx.text(ctx, 'FLARE DETECTED!', flare.x + 2, 36, 10, 1);
        }
      } else if (flare.activeTimer > 0) {
        gfx.rect(ctx, flare.x, 24, flare.width, 226, 9);
        gfx.rect(ctx, flare.x + 8, 24, flare.width - 16, 226, 10);
        gfx.rect(ctx, flare.x + 16, 24, flare.width - 32, 226, 7);
      }
    }

    // Hazards
    for (const h of hazards) {
      if (h.type === 'micro') {
        drawSprite(ctx, SPRITE_MICROMETEOROID, h.x - 3, h.y - 3, 1.2);
      } else if (h.type === 'ast_med') {
        drawSprite(ctx, SPRITE_ASTEROID_MED, h.x - 6, h.y - 6, 1.2);
      } else {
        drawSprite(ctx, SPRITE_ASTEROID_SM, h.x - 3, h.y - 3, 1.2);
      }
    }

    // Spacecraft or Explosion
    if (isDead) {
      const expFrame = Math.min(3, Math.floor(deathTimer * 5));
      drawSprite(ctx, SPRITE_EXPLOSIONS[expFrame], shipX - 12, shipY - 12, 3);
      gfx.centerText(ctx, 'HULL INTEGRITY COMPROMISED', 110, 8, 1);
      gfx.centerText(ctx, 'SPACECRAFT LOST IN TRANSIT', 128, 8, 1);
    } else {
      const visible = invulnTimer <= 0 || (Math.floor(invulnTimer * 12) % 2 === 0);
      if (visible) {
        drawCompositeShip(ctx, state, shipX, shipY, 1.4, true);
      }
    }

    // Top HUD
    this.drawHUD(ctx, state);

    // Bottom Mission Control Ticker Line
    this.drawBottomTicker(ctx, state);
  },

  drawHUD(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 24, 1);
    gfx.line(ctx, 0, 24, 480, 24, 5);

    const f = state.flight || { hearts: 3, maxHearts: 3, fuelPct: 100, powerPct: 100 };

    // Hearts
    for (let i = 0; i < f.maxHearts; i++) {
      const spr = i < f.hearts ? SPRITE_HEART : SPRITE_HEART_EMPTY;
      drawSprite(ctx, spr, 12 + i * 12, 7, 1.2);
    }

    // Fuel
    gfx.text(ctx, 'FUEL', 105, 8, 10, 1);
    gfx.bar(ctx, 135, 8, 65, 8, f.fuelPct, 10, 0);

    // Power
    gfx.text(ctx, 'POWER', 215, 8, 11, 1);
    gfx.bar(ctx, 255, 8, 65, 8, f.powerPct, f.powerPct < 100 ? 9 : 11, 0);

    // Distance
    const prog = Math.min(100, Math.round((cruiseTimer / totalDuration) * 100));
    gfx.text(ctx, 'TRANSIT', 335, 8, 12, 1);
    gfx.bar(ctx, 385, 8, 85, 8, prog, 12, 0);
  },

  drawBottomTicker(ctx, state) {
    gfx.rect(ctx, 0, 250, 480, 20, 1);
    gfx.line(ctx, 0, 250, 480, 250, 5);

    const lightSec = state.mission ? state.mission.oneWayLightSec : 0;
    const lightStr = lightSec < 1 ? '<1s' : (lightSec < 60 ? `${lightSec}s` : `${Math.round(lightSec / 60)} min`);

    gfx.text(ctx, `MISSION CONTROL LINK: DSN 70M ARRAY`, 12, 256, 10, 1);
    gfx.text(ctx, `ONE-WAY LIGHT DELAY: ${lightStr}`, 300, 256, 14, 1);
  }
};
