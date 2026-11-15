/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Retro Chiptune Audio Engine (Web Audio API)
 * Pure synthesized square/triangle waves and noise. Zero external audio files.
 */

let ctx = null;
let isMuted = false;
let bgmOsc = null;
let bgmGain = null;
let bgmTimer = null;

function getContext() {
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      ctx = new AudioContext();
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export const audio = {
  init() {
    getContext();
  },

  isMuted() {
    return isMuted;
  },

  toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      this.stopBGM();
    }
    return isMuted;
  },

  beep(freq = 440, duration = 0.08, type = 'square', volume = 0.15) {
    if (isMuted) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);

      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  noise(duration = 0.2, volume = 0.2) {
    if (isMuted) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const bufferSize = ac.sampleRate * duration;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ac.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ac.currentTime + duration);

      const gain = ac.createGain();
      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      whiteNoise.start();
    } catch (e) {}
  },

  startHangarBGM() {
    if (isMuted || bgmTimer) return;
    const ac = getContext();
    if (!ac) return;

    // Gentle 8-bit bassline loop: A2 -> E2 -> F2 -> D2
    const notes = [110, 82.4, 87.3, 73.4];
    let step = 0;

    bgmTimer = setInterval(() => {
      if (isMuted) return;
      this.beep(notes[step % notes.length], 0.14, 'triangle', 0.08);
      step++;
    }, 280);
  },

  stopBGM() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }
};

export const sfx = {
  select() {
    audio.beep(580, 0.04, 'square', 0.1);
  },
  confirm() {
    audio.beep(523, 0.06, 'square', 0.12);
    setTimeout(() => audio.beep(659, 0.08, 'square', 0.14), 60);
  },
  cancel() {
    audio.beep(300, 0.06, 'square', 0.12);
    setTimeout(() => audio.beep(200, 0.09, 'square', 0.12), 60);
  },
  hit() {
    audio.noise(0.18, 0.25);
  },
  explosion() {
    audio.noise(0.5, 0.4);
    audio.beep(90, 0.4, 'sawtooth', 0.2);
  },
  scan() {
    audio.beep(784, 0.06, 'sine', 0.15);
    setTimeout(() => audio.beep(1046, 0.08, 'sine', 0.18), 70);
  },
  burn() {
    audio.beep(65, 0.15, 'sawtooth', 0.18);
  },
  win() {
    const melody = [523, 659, 784, 1046];
    melody.forEach((f, idx) => {
      setTimeout(() => audio.beep(f, 0.12, 'square', 0.18), idx * 100);
    });
  },
  lose() {
    const melody = [440, 415, 392, 349];
    melody.forEach((f, idx) => {
      setTimeout(() => audio.beep(f, 0.14, 'square', 0.18), idx * 120);
    });
  }
};
