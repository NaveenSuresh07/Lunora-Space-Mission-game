/**
 * Lunora: Mission Architect
 * Application Controller, Screen Router, Audio Synth & Flight Animation Canvas
 */

import { MISSIONS, VEHICLES, BUSES, POWER, INSTRUMENTS, COMMS, ARIA_HINTS } from './data.js';
import { state, loadSavedProgress, saveProgress, pushHistory, undoDesign, resetDesignForMission, applyRecommendedBuild, autoFixBlockers } from './state.js';
import { evaluate, simulateFlight } from './engine.js';
import { renderHUD, renderSpacecraftSVG, renderStepContent, renderFlightScreen, renderDebriefScreen } from './ui.js';

// --- Web Audio Synthesizer (Zero asset dependencies) ---
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const sfx = {
  click() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  },
  select() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  },
  confirm() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.1);
      });
    } catch (e) {}
  },
  autofix() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.09, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.12);
      });
    } catch (e) {}
  },
  launch() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2.0);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  },
  win() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch (e) {}
  }
};

// --- App Initialization ---
const appRoot = document.getElementById('app');

function init() {
  loadSavedProgress();
  showTitleScreen();
}

// --- Screen 1: Title & Mission Select ---
function showTitleScreen() {
  state.currentScreen = 'title';
  renderTitle();
}

function renderTitle() {
  appRoot.innerHTML = `
    <header class="app-header">
      <div class="header-logo">
        <span class="logo-icon">🛰️</span>
        <div>
          <h1 class="logo-title">LUNORA: MISSION ARCHITECT</h1>
          <div class="logo-sub">NASA Space Apps Challenge 2026 · Systems Engineering Simulator</div>
        </div>
      </div>
      <div class="difficulty-toggle-box">
        <label for="diff-select" class="diff-label">FLIGHT TIER:</label>
        <select id="diff-select" class="diff-select">
          <option value="cadet" ${state.difficulty === 'cadet' ? 'selected' : ''}>CADET (+40% Budget, Auto-Fix)</option>
          <option value="engineer" ${state.difficulty === 'engineer' ? 'selected' : ''}>ENGINEER (Standard NASA Physics)</option>
          <option value="director" ${state.difficulty === 'director' ? 'selected' : ''}>DIRECTOR (Tight Margins & Weather)</option>
        </select>
      </div>
    </header>

    <main class="title-main">
      <div class="hero-banner">
        <h2>DESIGN. BALANCE. SIMULATE.</h2>
        <p>Step into the shoes of Lunora Space Agency's Lead Mission Architect. Balance mass, power, communication budgets, and launch trajectory constraints to explore Earth, the Moon, Mars, and the Outer Solar System.</p>
      </div>

      <div class="missions-selection-grid">
        ${MISSIONS.map(m => {
          const isUnlocked = m.id <= state.unlockedMissionId;
          const completed = state.completedMissions[m.id];
          return `
            <div class="mission-select-card ${isUnlocked ? 'mission-unlocked' : 'mission-locked'}" data-mission-id="${m.id}">
              <div class="mcard-top">
                <span class="mcard-target">${m.targetName.toUpperCase()}</span>
                <span class="mcard-budget">BUDGET: $${m.budget}M</span>
              </div>
              <h3 class="mcard-title">${m.id}. ${m.name}</h3>
              <div class="mcard-sub">${m.subtitle}</div>
              <p class="mcard-desc">${m.desc}</p>
              
              <div class="mcard-bottom">
                ${isUnlocked ? `
                  <div class="mcard-stars">
                    ${completed ? Array(completed.stars).fill('★').join('') : '☆☆☆'}
                    ${completed ? `<span class="score-tag">${completed.score} PTS</span>` : ''}
                  </div>
                  <button class="btn-start-mission" data-mission-id="${m.id}">
                    ${completed ? 'RE-FLY MISSION ►' : 'LAUNCH MISSION ►'}
                  </button>
                ` : `
                  <div class="locked-text">🔒 COMPLETE PREVIOUS MISSION TO UNLOCK</div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </main>

    <footer class="app-footer">
      <div>Lunora: Mission Architect · Built with Plain HTML/CSS/JS · Zero Dependencies · Real NASA Physics</div>
      <div><a href="#rules" id="link-rules">Mission Codex & Astrodynamics Equations</a></div>
    </footer>
  `;

  // Attach Title Listeners
  document.getElementById('diff-select').addEventListener('change', (e) => {
    sfx.click();
    state.difficulty = e.target.value;
    saveProgress();
  });

  document.querySelectorAll('.btn-start-mission').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sfx.confirm();
      const mId = parseInt(e.currentTarget.getAttribute('data-mission-id'), 10);
      const chosen = MISSIONS.find(m => m.id === mId);
      if (chosen) {
        resetDesignForMission(chosen);
        showDesignerScreen();
      }
    });
  });
}

// --- Screen 2: Step Designer Wizard ---
function showDesignerScreen() {
  state.currentScreen = 'designer';
  renderDesigner();
}

function renderDesigner() {
  const evalData = evaluate(state.design, state.mission, state.difficulty);
  const m = state.mission;

  // ARIA advisor advice based on step
  const tips = ARIA_HINTS[`step${state.currentStep}`] || ARIA_HINTS.step1;
  const currentTip = tips[state.ariaTipIndex % tips.length];

  appRoot.innerHTML = `
    <!-- Top Step Navigation Bar -->
    <header class="app-header wizard-header">
      <div class="wizard-mission-tag">
        <button id="btn-back-title" class="btn-icon" title="Return to mission selection">◀ EXIT</button>
        <div>
          <strong class="text-accent">${m.name.toUpperCase()}</strong>: ${m.subtitle}
        </div>
      </div>

      <!-- 5-Step Progress Pills -->
      <nav class="steps-nav" aria-label="Mission design steps">
        <button class="step-pill ${state.currentStep === 1 ? 'step-active' : (state.currentStep > 1 ? 'step-done' : '')}" data-step="1">1. OBJECTIVE</button>
        <button class="step-pill ${state.currentStep === 2 ? 'step-active' : (state.currentStep > 2 ? 'step-done' : '')}" data-step="2">2. LAUNCHER</button>
        <button class="step-pill ${state.currentStep === 3 ? 'step-active' : (state.currentStep > 3 ? 'step-done' : '')}" data-step="3">3. BUS & POWER</button>
        <button class="step-pill ${state.currentStep === 4 ? 'step-active' : (state.currentStep > 4 ? 'step-done' : '')}" data-step="4">4. INSTRUMENTS</button>
        <button class="step-pill ${state.currentStep === 5 ? 'step-active' : (state.currentStep > 5 ? 'step-done' : '')}" data-step="5">5. COMMS & REVIEW</button>
      </nav>
    </header>

    <!-- ARIA Advisor Banner -->
    <aside class="aria-banner" aria-label="ARIA flight advisor">
      <div class="aria-avatar">🤖 ARIA</div>
      <div class="aria-text">"${currentTip}"</div>
      <button id="btn-next-tip" class="btn-aria-next" title="Next engineering tip">NEXT TIP ⟳</button>
    </aside>

    <!-- Main Workspace (Left: Interactive Schematic & Cards, Right: Live HUD) -->
    <main class="designer-main">
      <section class="left-stage">
        <!-- Interactive Spacecraft SVG Schematic -->
        ${renderSpacecraftSVG(state.design, evalData)}

        <!-- Active Step Selection Cards -->
        <div id="step-content-area">
          ${renderStepContent(state.currentStep, evalData)}
        </div>
      </section>

      <!-- Right Column: Always Visible HUD -->
      <aside class="right-hud">
        ${renderHUD(evalData)}
      </aside>
    </main>

    <!-- Bottom Step Navigation Footer -->
    <footer class="designer-footer">
      <button id="btn-prev-step" class="btn-secondary" ${state.currentStep === 1 ? 'disabled' : ''}>
        ◀ PREVIOUS STEP
      </button>

      <div class="footer-center-status">
        ${evalData.isLaunchReady
          ? '<span class="text-good">✓ ALL SYSTEMS GO FOR LAUNCH</span>'
          : `<span class="text-bad">▲ ${evalData.primaryBlocker}</span>`
        }
      </div>

      ${state.currentStep < 5 ? `
        <button id="btn-next-step" class="btn-primary">
          NEXT STEP: ${getStepName(state.currentStep + 1)} ▶
        </button>
      ` : `
        <button id="btn-launch-mission" class="btn-launch" ${!evalData.isLaunchReady ? 'disabled' : ''}>
          🚀 AUTHORIZE LAUNCH & FLY MISSION
        </button>
      `}
    </footer>
  `;

  attachDesignerEvents(evalData);
}

function getStepName(step) {
  const names = ['', 'OBJECTIVE', 'LAUNCHER', 'BUS & POWER', 'INSTRUMENTS', 'COMMS & REVIEW'];
  return names[step] || '';
}

function attachDesignerEvents(evalData) {
  // Navigation
  document.getElementById('btn-back-title').addEventListener('click', () => {
    sfx.click();
    showTitleScreen();
  });

  const prevBtn = document.getElementById('btn-prev-step');
  if (prevBtn && !prevBtn.disabled) {
    prevBtn.addEventListener('click', () => {
      sfx.click();
      state.currentStep = Math.max(1, state.currentStep - 1);
      renderDesigner();
    });
  }

  const nextBtn = document.getElementById('btn-next-step');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      sfx.click();
      state.currentStep = Math.min(5, state.currentStep + 1);
      renderDesigner();
    });
  }

  document.querySelectorAll('.step-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      sfx.click();
      state.currentStep = parseInt(e.currentTarget.getAttribute('data-step'), 10);
      renderDesigner();
    });
  });

  // ARIA next tip
  document.getElementById('btn-next-tip').addEventListener('click', () => {
    sfx.click();
    state.ariaTipIndex++;
    renderDesigner();
  });

  // Card Selection inside Step Content
  document.querySelectorAll('.card-item').forEach(card => {
    card.addEventListener('click', (e) => {
      const type = card.getAttribute('data-type');
      const id = card.getAttribute('data-id');
      pushHistory();

      if (type === 'vehicle') {
        const v = VEHICLES.find(x => x.id === id);
        if (v && v.reach.includes(state.mission.target)) {
          state.design.vehicle = v;
          sfx.select();
        } else {
          state.design.vehicle = v; // Allow selecting to see warning
          sfx.click();
        }
      } else if (type === 'bus') {
        state.design.bus = BUSES.find(x => x.id === id);
        sfx.select();
      } else if (type === 'power') {
        state.design.power = POWER.find(x => x.id === id);
        sfx.select();
      } else if (type === 'instrument') {
        const inst = INSTRUMENTS.find(x => x.id === id);
        if (inst) {
          const idx = state.design.instruments.findIndex(i => i.id === id);
          if (idx >= 0) {
            state.design.instruments.splice(idx, 1);
            sfx.click();
          } else {
            state.design.instruments.push(inst);
            sfx.select();
          }
        }
      } else if (type === 'comms') {
        state.design.comms = COMMS.find(x => x.id === id);
        sfx.select();
      }

      renderDesigner();
    });
  });

  // Auto-Fix Button
  const autoFixBtn = document.getElementById('btn-autofix');
  if (autoFixBtn) {
    autoFixBtn.addEventListener('click', () => {
      sfx.autofix();
      autoFixBlockers(evalData);
      renderDesigner();
    });
  }

  // Recommended Build Button
  const presetBtn = document.getElementById('btn-preset');
  if (presetBtn) {
    presetBtn.addEventListener('click', () => {
      sfx.confirm();
      applyRecommendedBuild(state.mission);
      renderDesigner();
    });
  }

  // Undo Button
  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (undoDesign()) {
        sfx.click();
        renderDesigner();
      }
    });
  }

  // Launch Button
  const launchBtn = document.getElementById('btn-launch-mission');
  if (launchBtn && !launchBtn.disabled) {
    launchBtn.addEventListener('click', () => {
      sfx.launch();
      const flightResult = simulateFlight(state.design, state.mission, evalData, state.difficulty);
      state.flightResult = flightResult;
      showFlightScreen(flightResult, evalData);
    });
  }
}

// --- Screen 3: Watchable Animated Flight Simulator ---
function showFlightScreen(flightResult, evaluation) {
  state.currentScreen = 'flight';
  appRoot.innerHTML = renderFlightScreen(flightResult, evaluation);

  const canvas = document.getElementById('flight-canvas');
  const ctx = canvas.getContext('2d');
  const ticker = document.getElementById('flight-ticker');
  let currentMilestone = 0;
  let stageTimer = 0;
  let animId = null;

  // Skip button
  document.getElementById('btn-skip-flight').addEventListener('click', () => {
    cancelAnimationFrame(animId);
    showDebriefScreen(flightResult, evaluation);
  });

  const milestoneMessages = [
    `IGNITION! Main engines at 100% thrust. Liftoff of ${state.design.vehicle.name}!`,
    `T+120s: Stage separation confirmed. Spacecraft entered stable parking orbit.`,
    `Trans-injection burn complete. Spacecraft on course for ${state.mission.targetName}.`,
    state.mission.landing
      ? `Atmospheric deceleration verified. Parachute deployed, descent thrusters firing.`
      : `Retro-burn executed. Spacecraft captured into target orbit.`,
    `Telemetry lock established with Earth DSN dishes. Scientific data streaming home!`
  ];

  function animateFlight() {
    stageTimer += 0.016;

    // Draw animated space background
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const sx = (i * 37 + stageTimer * 30) % canvas.width;
      const sy = (i * 23) % canvas.height;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Animation based on current milestone
    const progressInStage = (stageTimer % 4) / 4;

    if (currentMilestone === 0) {
      // Rocket liftoff
      const ry = 220 - progressInStage * 180;
      ctx.fillStyle = '#c2c3c7';
      ctx.fillRect(390, ry, 20, 50);
      // Flame
      ctx.fillStyle = Math.random() > 0.5 ? '#ffa300' : '#ff004d';
      ctx.beginPath();
      ctx.moveTo(395, ry + 50);
      ctx.lineTo(405, ry + 50);
      ctx.lineTo(400, ry + 75);
      ctx.fill();
    } else if (currentMilestone === 1) {
      // Earth Orbit & Staging
      ctx.fillStyle = '#29adff';
      ctx.beginPath();
      ctx.arc(100, 300, 220, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(380 + Math.sin(stageTimer * 3) * 20, 100, 30, 20);
    } else if (currentMilestone === 2) {
      // Deep space transit & Solar Wings
      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(360, 100, 40, 25);
      ctx.fillStyle = '#29adff';
      ctx.fillRect(320, 105, 38, 15);
      ctx.fillRect(402, 105, 38, 15);
    } else if (currentMilestone === 3) {
      // Target Planet
      ctx.fillStyle = state.mission.target === 'mars' ? '#ab5236' : (state.mission.target === 'deep' ? '#5f574f' : '#c2c3c7');
      ctx.beginPath();
      ctx.arc(680, 120, 60, 0, Math.PI * 2);
      ctx.fill();

      // Probe approaching
      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(200 + progressInStage * 300, 110, 35, 20);
    } else {
      // Operations & Beaming packets to Earth
      ctx.fillStyle = '#29adff';
      ctx.beginPath();
      ctx.arc(80, 120, 45, 0, Math.PI * 2);
      ctx.fill();

      // Probe in orbit
      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(600, 110, 35, 20);

      // Radio pulses
      const pulseX = 600 - progressInStage * 480;
      ctx.fillStyle = '#3ddc97';
      ctx.beginPath();
      ctx.arc(pulseX, 120, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Step milestone every 4 seconds
    const targetMilestone = Math.min(4, Math.floor(stageTimer / 3.8));
    if (targetMilestone !== currentMilestone) {
      currentMilestone = targetMilestone;
      sfx.click();

      // Check if mission failed at this milestone
      if (!flightResult.survived && currentMilestone === flightResult.failedMilestoneIndex) {
        ticker.innerText = `CRITICAL ANOMALY: ${flightResult.failureReason}`;
        ticker.classList.add('ticker-fail');
        cancelAnimationFrame(animId);
        setTimeout(() => showDebriefScreen(flightResult, evaluation), 2500);
        return;
      }

      ticker.innerText = milestoneMessages[currentMilestone] || 'Operations Nominal.';
      const node = document.getElementById(`ms-node-${currentMilestone}`);
      const status = document.getElementById(`ms-status-${currentMilestone}`);
      if (node && status) {
        node.classList.add('ms-active');
        status.innerText = 'NOMINAL';
        status.classList.add('text-good');
      }
    }

    if (stageTimer > 18.5) {
      cancelAnimationFrame(animId);
      showDebriefScreen(flightResult, evaluation);
      return;
    }

    animId = requestAnimationFrame(animateFlight);
  }

  animId = requestAnimationFrame(animateFlight);
}

// --- Screen 4: Debrief Screen ---
function showDebriefScreen(flightResult, evaluation) {
  state.currentScreen = 'debrief';

  // Save completion
  if (flightResult.survived) {
    sfx.win();
    const prev = state.completedMissions[state.mission.id] || { score: 0, stars: 0 };
    state.completedMissions[state.mission.id] = {
      score: Math.max(prev.score, flightResult.totalScore),
      stars: Math.max(prev.stars, flightResult.stars),
      date: new Date().toISOString()
    };
    if (state.mission.id === state.unlockedMissionId && state.unlockedMissionId < 4) {
      state.unlockedMissionId++;
    }
    saveProgress();
  }

  appRoot.innerHTML = renderDebriefScreen(flightResult, evaluation);

  document.getElementById('btn-retry-mission').addEventListener('click', () => {
    sfx.click();
    showDesignerScreen();
  });

  const nextBtn = document.getElementById('btn-next-mission');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      sfx.confirm();
      const nextMission = MISSIONS.find(m => m.id === state.mission.id + 1);
      if (nextMission) {
        resetDesignForMission(nextMission);
        showDesignerScreen();
      }
    });
  }

  const selectBtn = document.getElementById('btn-select-screen');
  if (selectBtn) {
    selectBtn.addEventListener('click', () => {
      sfx.click();
      showTitleScreen();
    });
  }
}

// Kickoff
window.addEventListener('DOMContentLoaded', init);
