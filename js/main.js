/**
 * Space Mission Design Game: Pixel Arcade v3
 * Main Entry Point, 480x270 Game Loop & Scene Router
 */

import { input } from './core/input.js';
import { audio } from './core/audio.js';
import { gfx } from './core/gfx.js';

import { bootScene } from './scenes/boot.js';
import { titleScene } from './scenes/title.js';
import { selectScene } from './scenes/select.js';
import { hangarScene } from './scenes/hangar.js';
import { gonogoScene } from './scenes/gonogo.js';
import { launchScene } from './scenes/launch.js';
import { cruiseScene } from './scenes/cruise.js';
import { insertionScene } from './scenes/insertion.js';
import { opsScene } from './scenes/ops.js';
import { reportScene } from './scenes/report.js';
import { codexScene } from './scenes/codex.js';

// Global Game State
export const state = {
  mission: null,
  orbit: null,
  bus: null,
  power: null,
  battery: null,
  comms: null,
  adcs: null,
  propulsion: null,
  instruments: [],
  propellantKg: 1800,
  launcher: null,
  difficulty: null,
  playerCount: 1,
  flight: null,
  flightResult: null,
  allGoFirstPoll: false,
  firstPollAttempted: false
};

// Scene Registry
const scenes = {
  boot: bootScene,
  title: titleScene,
  select: selectScene,
  hangar: hangarScene,
  gonogo: gonogoScene,
  launch: launchScene,
  cruise: cruiseScene,
  insertion: insertionScene,
  ops: opsScene,
  report: reportScene,
  codex: codexScene
};

let currentSceneName = 'boot';
let currentScene = bootScene;
let previousSceneName = 'hangar';

export const sceneManager = {
  go(name) {
    if (scenes[name]) {
      if (currentSceneName !== 'codex') {
        previousSceneName = currentSceneName;
      }
      currentSceneName = name;
      currentScene = scenes[name];
      if (currentScene.enter) {
        currentScene.enter(state, previousSceneName);
      }
    }
  },
  getCurrentName() {
    return currentSceneName;
  }
};

// Canvas Setup (480x270)
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

// Global Key Listeners (Fullscreen, Mute, Codex)
window.addEventListener('keydown', (e) => {
  unlockAudio();

  // F toggles Fullscreen
  if (e.code === 'KeyF') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // M toggles Audio Mute
  if (e.code === 'KeyM') {
    audio.toggleMute();
  }

  // H toggles Codex
  if (e.code === 'KeyH') {
    if (currentSceneName === 'codex') {
      sceneManager.go(previousSceneName || 'hangar');
    } else {
      sceneManager.go('codex');
    }
  }
});

window.addEventListener('pointerdown', unlockAudio);

// Input Initialization
input.init();

// Check for Shareable Design in URL Hash
try {
  if (window.location.hash && window.location.hash.length > 5) {
    const raw = atob(window.location.hash.substring(1));
    const payload = JSON.parse(raw);
    state.savedSharedDesign = payload;
  }
} catch (e) {}

// Boot Game
sceneManager.go('boot');

// 60 FPS Game Loop
let lastTime = performance.now();

function gameLoop(now) {
  const rawDt = (now - lastTime) / 1000;
  const dt = Math.min(0.08, Math.max(0.001, rawDt));
  lastTime = now;

  gfx.update(dt);

  if (currentScene && currentScene.update) {
    currentScene.update(dt, state, sceneManager);
  }

  input.update();

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
