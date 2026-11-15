/**
 * Lunora: Mission Control Arcade (v2) - Core Engine
 * Canvas scaling (960x540), Web Audio synth, Particle engine, Input, Popups, Juice
 */

// 1. Math & Utility Functions
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

// Seeded PRNG for reproducible arcade challenge
export function createRNG(seed = 123456789) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 2. Storage System
const STORAGE_KEY = 'lunora_arcade_v2_save';

export function saveProgress(data) {
  try {
    const existing = loadProgress();
    const merged = { ...existing, ...data, lastPlayed: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    // Ignore storage errors in private browsing
  }
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { unlockedCml: 1, bestScores: {}, soundMuted: false };
  } catch (e) {
    return { unlockedCml: 1, bestScores: {}, soundMuted: false };
  }
}

// 3. Audio Synthesizer (Zero asset dependencies)
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.rumbleNode = null;
    this.rumbleGain = null;
    this.initDone = false;
  }

  init() {
    if (this.initDone) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initDone = true;
        const saved = loadProgress();
        this.muted = !!saved.soundMuted;
      }
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  }

  ensureRunning() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    saveProgress({ soundMuted: this.muted });
    if (this.muted && this.rumbleGain) {
      this.rumbleGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.muted;
  }

  click() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  blip(freq = 600, duration = 0.08) {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  pickup() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.09, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.12);
    });
  }

  hit() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  staging() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  success() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const t = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.14, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.35);
    });
  }

  fanfare() {
    if (this.muted || !this.ctx) return;
    this.ensureRunning();
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1174.66]
    ];
    const t = this.ctx.currentTime;
    chords.forEach((chord, step) => {
      chord.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + step * 0.16);
        gain.gain.setValueAtTime(0.12, t + step * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, t + step * 0.16 + (step === 3 ? 0.8 : 0.25));
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + step * 0.16);
        osc.stop(t + step * 0.16 + (step === 3 ? 0.8 : 0.25));
      });
    });
  }

  // Sustained rocket rumble generator
  setRumble(active = false, throttle = 1.0) {
    if (this.muted || !this.ctx) {
      if (this.rumbleGain) this.rumbleGain.gain.setValueAtTime(0, this.ctx ? this.ctx.currentTime : 0);
      return;
    }
    this.ensureRunning();

    if (!this.rumbleNode) {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.rumbleGain = this.ctx.createGain();
      this.rumbleGain.gain.setValueAtTime(0, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.rumbleGain);
      this.rumbleGain.connect(this.ctx.destination);
      whiteNoise.start();
      this.rumbleNode = whiteNoise;
    }

    if (this.rumbleGain) {
      const targetGain = active && !this.muted ? Math.min(0.22, 0.08 + throttle * 0.14) : 0;
      this.rumbleGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }
}

export const sfx = new SoundSystem();

// 4. Input Management (Keyboard + Touch)
class InputManager {
  constructor() {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.action = false; // Space / Action
    this.secondary = false; // Shift / S / Sep

    this.keysDown = new Set();
    this.justPressedKeys = new Set();

    this.touchZone = null;
    this.init();
  }

  init() {
    window.addEventListener('keydown', e => {
      sfx.ensureRunning();
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keysDown.has(e.code)) {
        this.justPressedKeys.add(e.code);
      }
      this.keysDown.add(e.code);
      this.sync();
    });

    window.addEventListener('keyup', e => {
      this.keysDown.delete(e.code);
      this.sync();
    });

    // Handle audio mute hotkey
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyM') {
        sfx.toggleMute();
      }
    });

    // Pointer / Touch input mapping for canvas
    const handlePointer = (e, isDown) => {
      sfx.ensureRunning();
      if (!isDown) {
        this.sync();
        return;
      }
      const canvas = document.getElementById('game');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 960;
      const y = ((e.clientY - rect.top) / rect.height) * 540;

      if (x < 320) {
        this.left = true;
        this.right = false;
      } else if (x > 640) {
        this.right = true;
        this.left = false;
      }

      if (y < 220) {
        this.up = true;
        this.down = false;
      } else if (y > 360) {
        this.down = true;
        this.up = false;
      }

      this.action = true;
      this.justPressedKeys.add('Space');
    };

    window.addEventListener('pointerdown', e => {
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('.panel')) {
        handlePointer(e, true);
      }
    });

    window.addEventListener('pointerup', e => {
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('.panel')) {
        handlePointer(e, false);
      }
    });
  }

  sync() {
    this.left = this.keysDown.has('ArrowLeft') || this.keysDown.has('KeyA');
    this.right = this.keysDown.has('ArrowRight') || this.keysDown.has('KeyD');
    this.up = this.keysDown.has('ArrowUp') || this.keysDown.has('KeyW');
    this.down = this.keysDown.has('ArrowDown') || this.keysDown.has('KeyS');
    this.action = this.keysDown.has('Space') || this.keysDown.has('Enter') || this.up;
    this.secondary = this.keysDown.has('ShiftLeft') || this.keysDown.has('KeyS');
  }

  isJustPressed(code) {
    return this.justPressedKeys.has(code);
  }

  endFrame() {
    this.justPressedKeys.clear();
  }
}

export const input = new InputManager();

// 5. Particle System
class ParticleSystem {
  constructor(maxParticles = 300) {
    this.max = maxParticles;
    this.pool = [];
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        life: 0,
        maxLife: 1,
        color: '#4dd0ff',
        shape: 'circle'
      });
    }
  }

  spawn(x, y, vx, vy, color = '#4dd0ff', size = 3, maxLife = 0.8, shape = 'circle') {
    const p = this.pool.find(item => !item.active);
    if (!p) return;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.size = size;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.shape = shape;
  }

  emitPlume(x, y, baseVy = 5, spread = 2, color = '#ffb84d') {
    for (let i = 0; i < 3; i++) {
      const vx = (Math.random() - 0.5) * spread;
      const vy = baseVy + (Math.random() - 0.5) * 2;
      const col = Math.random() > 0.4 ? color : (Math.random() > 0.5 ? '#ff5d6c' : '#ffffff');
      this.spawn(x, y, vx, vy, col, 2 + Math.random() * 3, 0.4 + Math.random() * 0.3);
    }
  }

  emitSparks(x, y, count = 12, color = '#ffb84d') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.spawn(x, y, vx, vy, color, 1.5 + Math.random() * 2, 0.3 + Math.random() * 0.4);
    }
  }

  emitConfetti(x = 480, y = 200, count = 50) {
    const colors = ['#4dd0ff', '#3ddc97', '#ffb84d', '#ff5d6c', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 2, col, 3 + Math.random() * 3, 1.2 + Math.random() * 0.8, 'square');
    }
  }

  update(dt) {
    this.pool.forEach(p => {
      if (!p.active) return;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        return;
      }
      p.x += p.vx;
      p.y += p.vy;
    });
  }

  render(ctx) {
    this.pool.forEach(p => {
      if (!p.active) return;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
}

export const particles = new ParticleSystem(350);

// 6. Floating Score & Text Popups
class PopupManager {
  constructor() {
    this.popups = [];
  }

  add(text, x, y, color = '#4dd0ff', size = 18) {
    this.popups.push({
      text,
      x,
      y,
      color,
      size,
      life: 1.2,
      maxLife: 1.2,
      vy: -1.2
    });
  }

  update(dt) {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      p.y += p.vy;
      if (p.life <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  render(ctx) {
    this.popups.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${p.size}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    });
  }
}

export const popups = new PopupManager();

// 7. Screen Shake Juice
export const camera = {
  shakeTimer: 0,
  shakeIntensity: 0,
  offsetX: 0,
  offsetY: 0,

  shake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  },

  update(dt) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }
};
