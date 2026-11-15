/**
 * Space Mission Design Game - Main Entry Point
 * NASA Space Apps Challenge 2026
 */

import { state, resetState } from './state.js';
import { render, go } from './ui.js';
import {
  MISSIONS,
  BUSES,
  POWER,
  COMMS,
  PROPULSION,
  INSTRUMENTS,
  LAUNCHERS
} from './data.js';
import {
  dryMass,
  wetMass,
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData
} from './engine.js';
import { validate } from './validate.js';

// --- Console Verification Test (Step 3.1 Sanity Check) ---
function runConsoleTest() {
  const moon = MISSIONS.find(m => m.id === 'moon');
  const mediumBus = BUSES.find(b => b.id === 'medium');
  const solarM = POWER.find(p => p.id === 'solar_m');
  const medComms = COMMS.find(c => c.id === 'medium');
  const chemProp = PROPULSION.find(p => p.id === 'chemical');
  const camera = INSTRUMENTS.find(i => i.id === 'camera');
  const spectrometer = INSTRUMENTS.find(i => i.id === 'spectrometer');
  const medLauncher = LAUNCHERS.find(l => l.id === 'medium');

  const testState = {
    mission: moon,
    bus: mediumBus,
    power: solarM,
    comms: medComms,
    propulsion: chemProp,
    instruments: [camera, spectrometer],
    propellantKg: 1850,
    launcher: medLauncher
  };

  console.group('🚀 [SMDG Sanity Check: Baseline Moon Configuration]');
  console.log('Dry Mass:', dryMass(testState), 'kg');
  console.log('Wet Mass:', wetMass(testState), 'kg');
  console.log(`Total Cost: $${totalCost(testState)}M (Budget: $${moon.budget}M)`);
  console.log(`Power: ${powerGenerated(testState)}W generated vs ${powerUsed(testState)}W used`);
  console.log(`Delta-V: ${deltaV(testState)} km/s (Required: ${moon.deltaVNeeded} km/s)`);
  console.log(`Downlink: ${downlinkGbPerDay(testState)} GB/day vs Produced: ${dailyData(testState)} GB/day`);
  const val = validate(testState);
  console.log('Validation Errors:', val.errors);
  console.log('Validation Warnings:', val.warnings);
  console.groupEnd();
}

// --- Dynamic Ambient Starfield Canvas ---
function initStarfield() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const starCount = 120;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.7 + 0.3,
    speed: Math.random() * 0.2 + 0.05
  }));

  function animateStars() {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.fill();
    }
    requestAnimationFrame(animateStars);
  }

  animateStars();
}

// --- Wire Global Event Handlers ---
function initGlobalEvents() {
  // Modal toggle
  const tutorialModal = document.getElementById('tutorial-modal');
  const btnHowToPlay = document.getElementById('btn-how-to-play');
  const btnCloseTutorial = document.getElementById('btn-close-tutorial');
  const btnGotIt = document.getElementById('btn-got-it');
  const btnRestart = document.getElementById('btn-restart');

  btnHowToPlay?.addEventListener('click', () => {
    tutorialModal?.classList.remove('hidden');
  });

  btnCloseTutorial?.addEventListener('click', () => {
    tutorialModal?.classList.add('hidden');
  });

  btnGotIt?.addEventListener('click', () => {
    tutorialModal?.classList.add('hidden');
  });

  tutorialModal?.addEventListener('click', (e) => {
    if (e.target === tutorialModal) {
      tutorialModal.classList.add('hidden');
    }
  });

  // Global reset
  btnRestart?.addEventListener('click', () => {
    if (confirm('Restart mission design from the beginning?')) {
      resetState();
      go(state, 'title');
    }
  });
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  runConsoleTest();
  initStarfield();
  initGlobalEvents();
  render(state);
});
