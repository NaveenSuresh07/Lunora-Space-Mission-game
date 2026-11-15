/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Graphics Engine: 16-Color PICO-8 Palette, 5x7 Bitmap Font, Particles & Shake
 */

export const PALETTE = [
  '#000000', // 0: black
  '#1D2B53', // 1: dark blue / navy
  '#7E2553', // 2: dark purple / plum
  '#008751', // 3: dark green
  '#AB5236', // 4: brown
  '#5F574F', // 5: dark grey
  '#C2C3C7', // 6: light grey
  '#FFF1E8', // 7: white
  '#FF004D', // 8: red
  '#FFA300', // 9: orange
  '#FFEC27', // 10: yellow
  '#00E436', // 11: green / lime
  '#29ADFF', // 12: sky blue
  '#83769C', // 13: indigo / lavender
  '#FF77A8', // 14: pink
  '#FFCCAA'  // 15: peach
];

// Screen Shake State
let shakeDuration = 0;
let shakeIntensity = 0;
let shakeX = 0;
let shakeY = 0;

// Particle System State
const particles = [];

// Built-in 5x7 Bitmap Font
// Each character encoded as 5 columns of 7-bit values (MSB top)
const FONT = {
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
  '!': [0x00, 0x00, 0x5F, 0x00, 0x00],
  '"': [0x00, 0x07, 0x00, 0x07, 0x00],
  '#': [0x14, 0x7F, 0x14, 0x7F, 0x14],
  '$': [0x24, 0x2A, 0x7F, 0x2A, 0x12],
  '%': [0x23, 0x13, 0x08, 0x64, 0x62],
  '&': [0x36, 0x49, 0x55, 0x22, 0x50],
  '\'': [0x00, 0x05, 0x03, 0x00, 0x00],
  '(': [0x00, 0x1C, 0x22, 0x41, 0x00],
  ')': [0x00, 0x41, 0x22, 0x1C, 0x00],
  '*': [0x14, 0x08, 0x3E, 0x08, 0x14],
  '+': [0x08, 0x08, 0x3E, 0x08, 0x08],
  ',': [0x00, 0x50, 0x30, 0x00, 0x00],
  '-': [0x08, 0x08, 0x08, 0x08, 0x08],
  '.': [0x00, 0x60, 0x60, 0x00, 0x00],
  '/': [0x20, 0x10, 0x08, 0x04, 0x02],
  '0': [0x3E, 0x51, 0x49, 0x45, 0x3E],
  '1': [0x00, 0x42, 0x7F, 0x40, 0x00],
  '2': [0x42, 0x61, 0x51, 0x49, 0x46],
  '3': [0x21, 0x41, 0x45, 0x4B, 0x31],
  '4': [0x18, 0x14, 0x12, 0x7F, 0x10],
  '5': [0x27, 0x45, 0x45, 0x45, 0x39],
  '6': [0x3C, 0x4A, 0x49, 0x49, 0x30],
  '7': [0x01, 0x71, 0x09, 0x05, 0x03],
  '8': [0x36, 0x49, 0x49, 0x49, 0x36],
  '9': [0x06, 0x49, 0x49, 0x29, 0x1E],
  ':': [0x00, 0x36, 0x36, 0x00, 0x00],
  ';': [0x00, 0x56, 0x36, 0x00, 0x00],
  '<': [0x08, 0x14, 0x22, 0x41, 0x00],
  '=': [0x14, 0x14, 0x14, 0x14, 0x14],
  '>': [0x00, 0x41, 0x22, 0x14, 0x08],
  '?': [0x02, 0x01, 0x51, 0x09, 0x06],
  '@': [0x32, 0x49, 0x79, 0x41, 0x3E],
  'A': [0x7E, 0x11, 0x11, 0x11, 0x7E],
  'B': [0x7F, 0x49, 0x49, 0x49, 0x36],
  'C': [0x3E, 0x41, 0x41, 0x41, 0x22],
  'D': [0x7F, 0x41, 0x41, 0x22, 0x1C],
  'E': [0x7F, 0x49, 0x49, 0x49, 0x41],
  'F': [0x7F, 0x09, 0x09, 0x09, 0x01],
  'G': [0x3E, 0x41, 0x49, 0x49, 0x7A],
  'H': [0x7F, 0x08, 0x08, 0x08, 0x7F],
  'I': [0x00, 0x41, 0x7F, 0x41, 0x00],
  'J': [0x20, 0x40, 0x41, 0x3F, 0x01],
  'K': [0x7F, 0x08, 0x14, 0x22, 0x41],
  'L': [0x7F, 0x40, 0x40, 0x40, 0x40],
  'M': [0x7F, 0x02, 0x0C, 0x02, 0x7F],
  'N': [0x7F, 0x04, 0x08, 0x10, 0x7F],
  'O': [0x3E, 0x41, 0x41, 0x41, 0x3E],
  'P': [0x7F, 0x09, 0x09, 0x09, 0x06],
  'Q': [0x3E, 0x41, 0x51, 0x21, 0x5E],
  'R': [0x7F, 0x09, 0x19, 0x29, 0x46],
  'S': [0x46, 0x49, 0x49, 0x49, 0x31],
  'T': [0x01, 0x01, 0x7F, 0x01, 0x01],
  'U': [0x3F, 0x40, 0x40, 0x40, 0x3F],
  'V': [0x1F, 0x20, 0x40, 0x20, 0x1F],
  'W': [0x7F, 0x20, 0x18, 0x20, 0x7F],
  'X': [0x63, 0x14, 0x08, 0x14, 0x63],
  'Y': [0x07, 0x08, 0x70, 0x08, 0x07],
  'Z': [0x61, 0x51, 0x49, 0x45, 0x43],
  '[': [0x00, 0x7F, 0x41, 0x41, 0x00],
  '\\': [0x02, 0x04, 0x08, 0x10, 0x20],
  ']': [0x00, 0x41, 0x41, 0x7F, 0x00],
  '^': [0x04, 0x02, 0x01, 0x02, 0x04],
  '_': [0x40, 0x40, 0x40, 0x40, 0x40],
  '★': [0x14, 0x3E, 0x7F, 0x3E, 0x14],
  '☆': [0x14, 0x22, 0x41, 0x22, 0x14],
  '♥': [0x0E, 0x1F, 0x3E, 0x1F, 0x0E],
  '▲': [0x20, 0x30, 0x3E, 0x30, 0x20],
  '▼': [0x04, 0x0C, 0x7C, 0x0C, 0x04],
  '►': [0x7F, 0x3E, 0x1C, 0x08, 0x00],
  '◄': [0x00, 0x08, 0x1C, 0x3E, 0x7F]
};

export const gfx = {
  palette(idx) {
    return PALETTE[idx % 16] || '#000000';
  },

  px(ctx, x, y, colIdx) {
    ctx.fillStyle = this.palette(colIdx);
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  },

  rect(ctx, x, y, w, h, colIdx) {
    ctx.fillStyle = this.palette(colIdx);
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  },

  rectb(ctx, x, y, w, h, colIdx) {
    ctx.strokeStyle = this.palette(colIdx);
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, Math.floor(w) - 1, Math.floor(h) - 1);
  },

  line(ctx, x0, y0, x1, y1, colIdx) {
    ctx.strokeStyle = this.palette(colIdx);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.floor(x0) + 0.5, Math.floor(y0) + 0.5);
    ctx.lineTo(Math.floor(x1) + 0.5, Math.floor(y1) + 0.5);
    ctx.stroke();
  },

  bar(ctx, x, y, w, h, pct, colIdx = 11, bgColIdx = 1) {
    const clamped = Math.max(0, Math.min(100, pct));
    const fillW = Math.round((w - 2) * (clamped / 100));
    this.rect(ctx, x, y, w, h, bgColIdx);
    if (fillW > 0) {
      this.rect(ctx, x + 1, y + 1, fillW, h - 2, colIdx);
    }
    this.rectb(ctx, x, y, w, h, 6);
  },

  circle(ctx, cx, cy, r, colIdx) {
    ctx.fillStyle = this.palette(colIdx);
    ctx.beginPath();
    ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
    ctx.fill();
  },

  circleb(ctx, cx, cy, r, colIdx) {
    ctx.strokeStyle = this.palette(colIdx);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(Math.floor(cx) + 0.5, Math.floor(cy) + 0.5, Math.floor(r), 0, Math.PI * 2);
    ctx.stroke();
  },

  textWidth(str, scale = 1) {
    return str.length * (6 * scale);
  },

  text(ctx, str, x, y, colIdx = 7, scale = 1) {
    ctx.fillStyle = this.palette(colIdx);
    const upper = str.toUpperCase();
    let curX = Math.floor(x);
    const curY = Math.floor(y);

    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      const glyph = FONT[ch] || FONT['?'];
      for (let c = 0; c < 5; c++) {
        const colBits = glyph[c];
        for (let r = 0; r < 7; r++) {
          if ((colBits >> r) & 1) {
            ctx.fillRect(curX + c * scale, curY + r * scale, scale, scale);
          }
        }
      }
      curX += 6 * scale;
    }
  },

  centerText(ctx, str, y, colIdx = 7, scale = 1) {
    const w = this.textWidth(str, scale);
    const x = Math.floor((320 - w) / 2);
    this.text(ctx, str, x, y, colIdx, scale);
    return x;
  },

  shake(intensity = 4, duration = 0.25) {
    shakeIntensity = intensity;
    shakeDuration = duration;
  },

  spawnParticles(x, y, count = 10, colIdx = 10, speed = 40, lifetime = 0.4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: colIdx,
        life: lifetime * (Math.random() * 0.5 + 0.7),
        maxLife: lifetime
      });
    }
  },

  update(dt) {
    // Update Shake
    if (shakeDuration > 0) {
      shakeDuration -= dt;
      shakeX = (Math.random() * 2 - 1) * shakeIntensity;
      shakeY = (Math.random() * 2 - 1) * shakeIntensity;
    } else {
      shakeX = 0;
      shakeY = 0;
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  },

  begin(ctx) {
    ctx.save();
    if (shakeDuration > 0) {
      ctx.translate(Math.round(shakeX), Math.round(shakeY));
    }
  },

  end(ctx) {
    // Draw Particles before restore
    for (const p of particles) {
      ctx.fillStyle = this.palette(p.color);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
    }
    ctx.restore();
  }
};
