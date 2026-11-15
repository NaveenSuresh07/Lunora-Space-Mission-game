/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Procedural & Text-Map Sprites (16-Color Palette)
 * Zero external asset files.
 */

import { gfx, PALETTE } from './gfx.js';

export function drawSprite(ctx, spriteMap, x, y, scale = 1, flipX = false, flipY = false) {
  if (!Array.isArray(spriteMap)) return;
  const h = spriteMap.length;
  const w = spriteMap[0].length;

  for (let r = 0; r < h; r++) {
    const row = spriteMap[r];
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch !== '.' && ch !== ' ') {
        const colIdx = parseInt(ch, 16);
        ctx.fillStyle = PALETTE[colIdx] || '#fff';
        const drawX = flipX ? (x + (w - 1 - c) * scale) : (x + c * scale);
        const drawY = flipY ? (y + (h - 1 - r) * scale) : (y + r * scale);
        ctx.fillRect(Math.floor(drawX), Math.floor(drawY), scale, scale);
      }
    }
  }
}

// 7x7 Heart Sprites for HP
export const SPRITE_HEART = [
  '.88.88.',
  '8888888',
  '8888888',
  '8888888',
  '.88888.',
  '..888..',
  '...8...'
];

export const SPRITE_HEART_EMPTY = [
  '.55.55.',
  '5..5..5',
  '5.....5',
  '5.....5',
  '.5...5.',
  '..5.5..',
  '...5...'
];

// Rocket Flight Sprite (10x24)
export const SPRITE_ROCKET = [
  '....77....',
  '...7777...',
  '...7667...',
  '..766667..',
  '..766667..',
  '..768867..',
  '..768867..',
  '..766667..',
  '..766667..',
  '..766667..',
  '..766667..',
  '..766667..',
  '..766667..',
  '.87666678.',
  '.87666678.',
  '8876666788',
  '8876666788',
  '8876666788',
  '.8.5555.8.',
  '...5445...',
  '...4994...',
  '..49aa94..',
  '..9aaaa9..',
  '..aaaaaa..'
];

// Rocket Launchpad Gantry (16x32)
export const SPRITE_LAUNCHPAD = [
  '5555............',
  '5..5............',
  '5555....77......',
  '5..5...7777.....',
  '5555...7667.....',
  '5..5..766667....',
  '5555..766667....',
  '5..5..768867....',
  '5555..768867....',
  '5..5..766667....',
  '5555..766667....',
  '5..5..766667....',
  '5555..766667....',
  '5..5..766667....',
  '5555.87666678...',
  '5..58876666788..',
  '55558876666788..',
  '5..58876666788..',
  '5555.8.5555.8...',
  '5..5...5445.....',
  '5555...4994.....',
  '5..5..49aa94....',
  '5555..9aaaa9....',
  '5..5..aaaaaa....',
  '5555555555555555',
  '5555555555555555',
  '..5..........5..',
  '..5..........5..',
  '..5..........5..',
  '4444444444444444',
  '4444444444444444',
  '4444444444444444'
];

// Flame exhaust animation frames
export const SPRITE_FLAME_1 = [
  '.99.',
  '9aa9',
  '9aa9',
  '.aa.',
  '.99.',
  '..9.'
];

export const SPRITE_FLAME_2 = [
  '9aa9',
  'aaaa',
  '9aa9',
  '.99.',
  '..a.',
  '...9'
];

// Asteroids
export const SPRITE_ASTEROID_SM = [
  '.55.',
  '5445',
  '5405',
  '.55.'
];

export const SPRITE_ASTEROID_MED = [
  '..5555..',
  '.544445.',
  '54044445',
  '54404445',
  '54444045',
  '54444445',
  '.544445.',
  '..5555..'
];

export const SPRITE_ASTEROID_LG = [
  '...555555...',
  '..54444445..',
  '.5404444445.',
  '544404444445',
  '544444404445',
  '540444444445',
  '544444044045',
  '544444444445',
  '.5440444445.',
  '..55555555..'
];

export const SPRITE_MICROMETEOROID = [
  '.aa.',
  'aaaa',
  'aaaa',
  '.aa.'
];

// 4 Explosion Animation Frames
export const SPRITE_EXPLOSIONS = [
  [
    '..99..',
    '.9aa9.',
    '9aaaa9',
    '9aaaa9',
    '.9aa9.',
    '..99..'
  ],
  [
    '..8998..',
    '.89aa98.',
    '89aaaa98',
    '9aaaaaa9',
    '9aaaaaa9',
    '89aaaa98',
    '.89aa98.',
    '..8998..'
  ],
  [
    '.8.9..8.',
    '8.9aa9.8',
    '.9aaaa9.',
    '9a.77.a9',
    '9a.77.a9',
    '.9aaaa9.',
    '8.9aa9.8',
    '.8.9..8.'
  ],
  [
    '8..9..8.',
    '.8...8..',
    '..9.9...',
    '9..7..9.',
    '..9.9...',
    '.8...8..',
    '8..9..8.'
  ]
];

// Planets
export const SPRITE_EARTH = [
  '.......111111.......',
  '....111c11111111....',
  '...11cc3311111111...',
  '..11cc333111177111..',
  '.111133331117777111.',
  '.111113311111771111.',
  '11111111111111111111',
  '11113331111333111111',
  '11133333113333311111',
  '11113331111333111111',
  '.111111111111111111.',
  '.111117711111111111.',
  '..1117777111133311..',
  '...11177111133311...',
  '....111111111111....',
  '.......111111.......'
];

export const SPRITE_MOON = [
  '.....666666.....',
  '...6655666666...',
  '..650056655666..',
  '.66500565005666.',
  '.66655665005666.',
  '6666666665566666',
  '6655666666666556',
  '6500566556665005',
  '6500565005665005',
  '6655665005666556',
  '.66666655666666.',
  '.66666666666666.',
  '..666556666666..',
  '...6655666666...',
  '.....666666.....'
];

export const SPRITE_MARS = [
  '.....777777.....',
  '...7799999977...',
  '..999449999999..',
  '.99944449999999.',
  '.99994499944999.',
  '9999999994444999',
  '9944999999449999',
  '9444499999999999',
  '9444499999999999',
  '9944999944999999',
  '.99999944449999.',
  '.99999994499999.',
  '..999999999999..',
  '...9999999999...',
  '.....999999.....'
];

/**
 * Composite Spacecraft Pixel Renderer
 * Dynamically draws the ship based on current state (bus, solar array, comms, engine, instruments)
 */
export function drawCompositeShip(ctx, state, x, y, scale = 1, thrusting = false) {
  const bus = state.bus ? state.bus.id : 'medium';
  const power = state.power ? state.power.id : 'solar_m';
  const comms = state.comms ? state.comms.id : 'medium';
  const prop = state.propulsion ? state.propulsion.id : 'chemical';
  const insts = Array.isArray(state.instruments) ? state.instruments : [];

  const centerX = Math.floor(x);
  const centerY = Math.floor(y);

  // 1. Draw Solar Arrays / RTG Wings
  if (power === 'solar_s') {
    // 1-panel wings
    gfx.rect(ctx, centerX - 14 * scale, centerY - 2 * scale, 6 * scale, 4 * scale, 12);
    gfx.rect(ctx, centerX + 8 * scale, centerY - 2 * scale, 6 * scale, 4 * scale, 12);
    gfx.line(ctx, centerX - 8 * scale, centerY, centerX - 5 * scale, centerY, 6);
    gfx.line(ctx, centerX + 5 * scale, centerY, centerX + 8 * scale, centerY, 6);
  } else if (power === 'solar_m') {
    // 2-panel articulated wings
    gfx.rect(ctx, centerX - 20 * scale, centerY - 4 * scale, 12 * scale, 8 * scale, 12);
    gfx.rect(ctx, centerX + 8 * scale, centerY - 4 * scale, 12 * scale, 8 * scale, 12);
    // Grid lines
    gfx.line(ctx, centerX - 14 * scale, centerY - 4 * scale, centerX - 14 * scale, centerY + 3 * scale, 1);
    gfx.line(ctx, centerX + 14 * scale, centerY - 4 * scale, centerX + 14 * scale, centerY + 3 * scale, 1);
    gfx.line(ctx, centerX - 8 * scale, centerY, centerX - 5 * scale, centerY, 6);
    gfx.line(ctx, centerX + 5 * scale, centerY, centerX + 8 * scale, centerY, 6);
  } else if (power === 'solar_l') {
    // Massive 3-panel deployable wings
    gfx.rect(ctx, centerX - 26 * scale, centerY - 6 * scale, 18 * scale, 12 * scale, 12);
    gfx.rect(ctx, centerX + 8 * scale, centerY - 6 * scale, 18 * scale, 12 * scale, 12);
    // Cells
    gfx.line(ctx, centerX - 20 * scale, centerY - 6 * scale, centerX - 20 * scale, centerY + 5 * scale, 1);
    gfx.line(ctx, centerX - 14 * scale, centerY - 6 * scale, centerX - 14 * scale, centerY + 5 * scale, 1);
    gfx.line(ctx, centerX + 14 * scale, centerY - 6 * scale, centerX + 14 * scale, centerY + 5 * scale, 1);
    gfx.line(ctx, centerX + 20 * scale, centerY - 6 * scale, centerX + 20 * scale, centerY + 5 * scale, 1);
  } else if (power === 'rtg') {
    // Nuclear RTG cylinder
    gfx.rect(ctx, centerX - 14 * scale, centerY - 3 * scale, 7 * scale, 6 * scale, 5);
    gfx.line(ctx, centerX - 14 * scale, centerY, centerX - 8 * scale, centerY, 10);
  }

  // 2. Draw Bus Body
  if (bus === 'small') {
    gfx.rect(ctx, centerX - 4 * scale, centerY - 4 * scale, 8 * scale, 8 * scale, 10);
    gfx.rectb(ctx, centerX - 4 * scale, centerY - 4 * scale, 8 * scale, 8 * scale, 9);
  } else if (bus === 'large') {
    gfx.rect(ctx, centerX - 7 * scale, centerY - 7 * scale, 14 * scale, 14 * scale, 6);
    gfx.rectb(ctx, centerX - 7 * scale, centerY - 7 * scale, 14 * scale, 14 * scale, 13);
    // Radiation shielding pattern
    gfx.rect(ctx, centerX - 4 * scale, centerY - 4 * scale, 8 * scale, 8 * scale, 5);
  } else {
    // Medium Bus
    gfx.rect(ctx, centerX - 5 * scale, centerY - 5 * scale, 10 * scale, 10 * scale, 10);
    gfx.rectb(ctx, centerX - 5 * scale, centerY - 5 * scale, 10 * scale, 10 * scale, 9);
    gfx.px(ctx, centerX - 2 * scale, centerY - 2 * scale, 7);
  }

  // 3. Draw Comms Antenna
  if (comms === 'low') {
    // Small patch antenna
    gfx.line(ctx, centerX, centerY - 5 * scale, centerX, centerY - 9 * scale, 7);
    gfx.px(ctx, centerX, centerY - 9 * scale, 8);
  } else if (comms === 'medium') {
    // Parabolic Horn Dish
    gfx.line(ctx, centerX, centerY - 5 * scale, centerX, centerY - 8 * scale, 7);
    gfx.circle(ctx, centerX, centerY - 9 * scale, 3 * scale, 7);
    gfx.px(ctx, centerX, centerY - 9 * scale, 12);
  } else if (comms === 'high') {
    // Large Steerable Dish
    gfx.line(ctx, centerX + 1 * scale, centerY - 5 * scale, centerX + 1 * scale, centerY - 8 * scale, 7);
    gfx.circle(ctx, centerX + 1 * scale, centerY - 10 * scale, 5 * scale, 7);
    gfx.circle(ctx, centerX + 1 * scale, centerY - 10 * scale, 3 * scale, 1);
    gfx.px(ctx, centerX + 1 * scale, centerY - 10 * scale, 12);
  }

  // 4. Draw Instruments (colored sensor ports)
  insts.forEach((inst, idx) => {
    const col = inst.colorIdx !== undefined ? inst.colorIdx : 11;
    const offset = (idx - Math.floor(insts.length / 2)) * 3 * scale;
    gfx.px(ctx, centerX + 4 * scale, centerY + offset, col);
  });

  // 5. Draw Propulsion Engine & Exhaust Flame
  if (prop === 'ion') {
    // Ion thruster ring
    gfx.rect(ctx, centerX - 7 * scale, centerY - 2 * scale, 2 * scale, 4 * scale, 12);
    if (thrusting) {
      // Cyan glowing plasma plume
      gfx.circle(ctx, centerX - 10 * scale, centerY, 2 * scale, 12);
      gfx.px(ctx, centerX - 12 * scale, centerY, 7);
    }
  } else {
    // Chemical Bell Thruster
    gfx.rect(ctx, centerX - 7 * scale, centerY - 3 * scale, 2 * scale, 6 * scale, 5);
    if (thrusting) {
      // Orange/Yellow fire
      gfx.rect(ctx, centerX - 11 * scale, centerY - 2 * scale, 4 * scale, 4 * scale, 9);
      gfx.rect(ctx, centerX - 9 * scale, centerY - 1 * scale, 3 * scale, 2 * scale, 10);
    }
  }
}
