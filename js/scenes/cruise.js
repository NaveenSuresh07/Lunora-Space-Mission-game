/**
 * Scene: Interplanetary Cruise (Side-Scrolling Asteroid & Flare Dodge)
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
  SPRITE_MICROMETEOROID,
  SPRITE_EXPLOSIONS
} from '../core/sprites.js';

let shipX = 35;
let shipY = 90;
let invulnTimer = 0;
let cruiseTimer = 0;
let totalDuration = 25; // Moon: 25s, Mars: 40s
let stars = [];
let hazards = [];
let flare = null; // { x, warningTimer, activeTimer, width }
let spawnTimer = 0;
let flareSpawnTimer = 0;
let isDead = false;
let deathTimer = 0;

export const cruiseScene = {
  enter(state) {
    shipX = 35;
    shipY = 90;
    invulnTimer = 0;
    cruiseTimer = 0;
    isDead = false;
    deathTimer = 0;
    hazards = [];
    flare = null;
    spawnTimer = 0;
    flareSpawnTimer = 3.0; // first flare at 3s

    const mId = state.mission ? state.mission.id : 'moon';
    totalDuration = mId === 'mars' ? 40 : 25;

    // Background parallax stars
    stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * 320,
      y: 18 + Math.random() * 155,
      speed: Math.random() * 35 + 10,
      col: Math.random() > 0.5 ? 6 : 7
    }));
  },

  update(dt, state, sceneManager) {
    if (isDead) {
      deathTimer += dt;
      if (deathTimer > 1.8) {
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

    // 1. Starfield Scroll
    for (const s of stars) {
      s.x -= s.speed * dt;
      if (s.x < 0) {
        s.x = 320;
        s.y = 18 + Math.random() * 155;
      }
    }

    // 2. Player Movement
    const speed = (state.flight && state.flight.moveSpeed) ? state.flight.moveSpeed : 60;
    let moved = false;

    if (input.isDown('UP')) {
      shipY = Math.max(22, shipY - speed * dt);
      moved = true;
    }
    if (input.isDown('DOWN')) {
      shipY = Math.min(165, shipY + speed * dt);
      moved = true;
    }
    if (input.isDown('LEFT')) {
      shipX = Math.max(15, shipX - speed * dt * 0.7);
      moved = true;
    }
    if (input.isDown('RIGHT')) {
      shipX = Math.min(120, shipX + speed * dt * 0.7);
      moved = true;
    }

    // Attitude fuel burn
    if (moved && state.flight) {
      state.flight.fuelPct = Math.max(0, state.flight.fuelPct - 0.4 * dt);
    }

    // 3. Hazard Spawning
    spawnTimer += dt;
    if (spawnTimer > 1.4) {
      spawnTimer = 0;
      const isMicro = Math.random() > 0.6;
      hazards.push({
        type: isMicro ? 'micro' : (Math.random() > 0.5 ? 'ast_med' : 'ast_sm'),
        x: 330,
        y: 25 + Math.random() * 135,
        vx: isMicro ? -130 : -(Math.random() * 30 + 55),
        vy: (Math.random() * 20 - 10)
      });
    }

    // 4. Solar Flare Beam Event
    flareSpawnTimer += dt;
    if (!flare && flareSpawnTimer > 7.0) {
      flareSpawnTimer = 0;
      flare = {
        x: 60 + Math.random() * 160,
        width: 36,
        warningTimer: 1.2,
        activeTimer: 0.8
      };
    }

    if (flare) {
      if (flare.warningTimer > 0) {
        flare.warningTimer -= dt;
      } else if (flare.activeTimer > 0) {
        flare.activeTimer -= dt;
        // Check flare collision with ship
        if (shipX >= flare.x - 8 && shipX <= flare.x + flare.width && invulnTimer <= 0) {
          invulnTimer = 1.0;
          if (state.bus && state.bus.id === 'large') {
            // Shielded by Large Bus!
            sfx.hit();
            gfx.shake(3, 0.2);
            gfx.spawnParticles(shipX, shipY, 15, 12, 50, 0.4);
          } else {
            // Bus reliability check
            const roll = Math.random();
            const rel = state.bus ? state.bus.reliability : 0.93;
            if (roll > rel) {
              // Lethal electronics destruction!
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

    // 5. Update Hazards & Collision Check
    for (let i = hazards.length - 1; i >= 0; i--) {
      const h = hazards[i];
      h.x += h.vx * dt;
      h.y += h.vy * dt;

      // Hitbox check
      const radius = h.type === 'ast_med' ? 6 : (h.type === 'ast_sm' ? 4 : 3);
      const dist = Math.hypot(shipX - h.x, shipY - h.y);

      if (dist < radius + 8 && invulnTimer <= 0) {
        hazards.splice(i, 1);
        invulnTimer = 0.9;
        if (h.type === 'micro') {
          // Micrometeoroid reduces power by 15%
          if (state.flight) {
            state.flight.powerPct = Math.max(0, state.flight.powerPct - 15);
          }
          sfx.hit();
          gfx.shake(3, 0.2);
          gfx.spawnParticles(h.x, h.y, 8, 9, 40, 0.3);
        } else {
          // Asteroid hit = lose 1 heart
          this.damageShip(state, 1);
        }
        continue;
      }

      // Remove off-screen
      if (h.x < -20) {
        hazards.splice(i, 1);
      }
    }

    // 6. Arrival at Destination
    if (cruiseTimer >= totalDuration) {
      sfx.confirm();
      sceneManager.go('insertion');
    }
  },

  damageShip(state, dmg) {
    if (!state.flight) return;
    state.flight.hearts -= dmg;
    sfx.hit();
    gfx.shake(6, 0.3);
    gfx.spawnParticles(shipX, shipY, 15, 8, 60, 0.5);

    if (state.flight.hearts <= 0) {
      this.killShip(state);
    }
  },

  killShip(state) {
    isDead = true;
    deathTimer = 0;
    if (state.flight) state.flight.hearts = 0;
    sfx.explosion();
    gfx.shake(12, 0.7);
    gfx.spawnParticles(shipX, shipY, 40, 8, 80, 0.8);
    gfx.spawnParticles(shipX, shipY, 40, 9, 70, 0.6);
  },

  draw(ctx, state) {
    // Space Background
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    // Stars
    for (const s of stars) {
      gfx.px(ctx, s.x, s.y, s.col);
    }

    // Draw Solar Flare Column / Beam
    if (flare) {
      if (flare.warningTimer > 0) {
        // Telegraph warning lines
        const blink = Math.floor(cruiseTimer * 10) % 2 === 0;
        if (blink) {
          gfx.rect(ctx, flare.x, 18, flare.width, 162, 8);
          gfx.text(ctx, 'FLARE!', flare.x + 2, 28, 10, 1);
        }
      } else if (flare.activeTimer > 0) {
        // Active energetic particle beam
        gfx.rect(ctx, flare.x, 18, flare.width, 162, 9);
        gfx.rect(ctx, flare.x + 6, 18, flare.width - 12, 162, 10);
        gfx.rect(ctx, flare.x + 12, 18, flare.width - 24, 162, 7);
      }
    }

    // Draw Hazards
    for (const h of hazards) {
      if (h.type === 'micro') {
        drawSprite(ctx, SPRITE_MICROMETEOROID, h.x - 2, h.y - 2, 1);
      } else if (h.type === 'ast_med') {
        drawSprite(ctx, SPRITE_ASTEROID_MED, h.x - 4, h.y - 4, 1);
      } else {
        drawSprite(ctx, SPRITE_ASTEROID_SM, h.x - 2, h.y - 2, 1);
      }
    }

    // Draw Spacecraft (or Explosion if dead)
    if (isDead) {
      const expFrame = Math.min(3, Math.floor(deathTimer * 5));
      drawSprite(ctx, SPRITE_EXPLOSIONS[expFrame], shipX - 8, shipY - 8, 2);
      gfx.centerText(ctx, 'HULL INTEGRITY COMPROMISED', 70, 8, 1);
      gfx.centerText(ctx, 'MISSION TERMINATED IN CRUISE', 85, 8, 1);
    } else {
      const visible = invulnTimer <= 0 || (Math.floor(invulnTimer * 12) % 2 === 0);
      if (visible) {
        drawCompositeShip(ctx, state, shipX, shipY, 1, true);
      }
    }

    // Top HUD Bar (Hearts, Fuel, Power, Progress)
    this.drawHUD(ctx, state);
  },

  drawHUD(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 18, 1);
    gfx.line(ctx, 0, 18, 320, 18, 5);

    const f = state.flight || { hearts: 3, maxHearts: 3, fuelPct: 100, powerPct: 100 };

    // 1. Hearts (HP)
    for (let i = 0; i < f.maxHearts; i++) {
      const spr = i < f.hearts ? SPRITE_HEART : SPRITE_HEART_EMPTY;
      drawSprite(ctx, spr, 8 + i * 9, 5, 1);
    }

    // 2. Fuel % Bar
    gfx.text(ctx, 'FUEL', 70, 6, 10, 1);
    gfx.bar(ctx, 94, 6, 40, 6, f.fuelPct, 10, 0);

    // 3. Power % Bar
    gfx.text(ctx, 'PWR', 142, 6, 11, 1);
    gfx.bar(ctx, 162, 6, 40, 6, f.powerPct, f.powerPct < 100 ? 9 : 11, 0);

    // 4. Transit Progress Bar
    const prog = Math.min(100, Math.round((cruiseTimer / totalDuration) * 100));
    gfx.text(ctx, 'DIST', 210, 6, 12, 1);
    gfx.bar(ctx, 234, 6, 75, 6, prog, 12, 0);
  }
};
