/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Main Entry Point, Game Loop & Scene Manager
 */

import { input } from './core/input.js';
import { audio } from './core/audio.js';
import { gfx } from './core/gfx.js';

import { titleScene } from './scenes/title.js';
import { selectScene } from './scenes/select.js';
import { hangarScene } from './scenes/hangar.js';
import { launchScene } from './scenes/launch.js';
import { cruiseScene } from './scenes/cruise.js';
import { insertionScene } from './scenes/insertion.js';
import { opsScene } from './scenes/ops.js';
import { reportScene } from './scenes/report.js';

// Global Game State
export const state = {
  mission: null,
  bus: null,
  power: null,
  comms: null,
  propulsion: null,
  instruments: [],
  propellantKg: 1800,
  launcher: null,
  flight: null,
  flightResult: null
};

// Scene Manager Registry
const scenes = {
  title: titleScene,
  select: selectScene,
  hangar: hangarScene,
  launch: launchScene,
  cruise: cruiseScene,
  insertion: insertionScene,
  ops: opsScene,
  report: reportScene
};

let currentSceneName = 'title';
let currentScene = titleScene;

export const sceneManager = {
  go(name) {
    if (scenes[name]) {
      currentSceneName = name;
      currentScene = scenes[name];
      if (currentScene.enter) {
        currentScene.enter(state);
      }
    }
  },
  getCurrentName() {
    return currentSceneName;
  }
};

// Canvas Setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Audio Unlock on First User Interaction
let audioStarted = false;
function unlockAudio() {
  if (!audioStarted) {
    audioStarted = true;
    audio.init();
  }
}
window.addEventListener('keydown', (e) => {
  unlockAudio();
  if (e.code === 'KeyM') {
    audio.toggleMute();
  }
});
window.addEventListener('pointerdown', unlockAudio);

// Input Initialization
input.init();

// Enter Initial Scene
sceneManager.go('title');

// Fixed Timestep Game Loop
let lastTime = performance.now();

function gameLoop(now) {
  const rawDt = (now - lastTime) / 1000;
  const dt = Math.min(0.08, Math.max(0.001, rawDt));
  lastTime = now;

  // 1. Update Graphics (Shake & Particles)
  gfx.update(dt);

  // 2. Update Current Scene
  if (currentScene && currentScene.update) {
    currentScene.update(dt, state, sceneManager);
  }

  // 3. Clear Input Pulse
  input.update();

  // 4. Render Current Scene
  ctx.save();
  gfx.begin(ctx);
  if (currentScene && currentScene.draw) {
    currentScene.draw(ctx, state);
  }
  gfx.end(ctx);
  ctx.restore();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
