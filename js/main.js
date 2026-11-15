/**
 * Lunora: Mission Control Arcade (v2) - Main Game Engine & Scene Orchestrator
 * Fixed logical resolution (960x540), 60 FPS game loop, scene manager, touch controls
 */

import { MISSIONS } from './data.js';
import { input, sfx, particles, popups, camera, loadProgress } from './core.js';
import { HangarScene } from './hangar.js';
import { LaunchStage, CruiseStage, OpsStage, ScienceStage } from './stages.js';
import { DebriefScene } from './debrief.js';

// ============================================================================
// TITLE SCENE
// ============================================================================
class TitleScene {
  constructor(game) {
    this.game = game;
  }

  enter() {
    this.renderDOM();
  }

  exit() {
    const ui = document.getElementById('ui');
    if (ui) ui.innerHTML = '';
  }

  renderDOM() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    ui.innerHTML = `
      <div class="title-container panel">
        <div class="title-hero">
          <div class="agency-badge">LUNORA SPACE AGENCY · NASA SPACE APPS 2026</div>
          <h1 class="title-logo">LUNORA</h1>
          <h2 class="title-sub">MISSION CONTROL ARCADE</h2>
          <p class="title-tagline">
            Design real deep-space probes in the modular hangar, then fly through the four real NASA mission segments:
            <strong>Launch</strong>, <strong>Space</strong>, <strong>Ground</strong>, and <strong>User Delivery</strong>.
          </p>
        </div>

        <div class="title-actions">
          <button id="btn-start" class="btn-hero-launch">⚡ COMMENCE MISSION DESIGN</button>
          
          <div class="difficulty-picker">
            <span class="diff-label">FLIGHT DIFFICULTY:</span>
            <button class="btn-diff ${this.game.difficulty === 'cadet' ? 'diff-active' : ''}" data-diff="cadet">CADET (+40% Budget)</button>
            <button class="btn-diff ${this.game.difficulty === 'engineer' ? 'diff-active' : ''}" data-diff="engineer">ENGINEER (Standard)</button>
            <button class="btn-diff ${this.game.difficulty === 'director' ? 'diff-active' : ''}" data-diff="director">DIRECTOR (Tight Margin)</button>
          </div>
        </div>

        <div class="title-footer-tips">
          <span>🎮 CONTROLS: Arrow Keys / WASD + [SPACE] to Throttle/Select</span>
          <span>🔊 MUTE: Press [M] at any time</span>
        </div>
      </div>
    `;

    const btnStart = ui.querySelector('#btn-start');
    if (btnStart) {
      btnStart.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('select');
      };
    }

    ui.querySelectorAll('.btn-diff').forEach(btn => {
      btn.onclick = () => {
        this.game.difficulty = btn.dataset.diff;
        sfx.click();
        this.renderDOM();
      };
    });
  }

  update(dt) {
    if (Math.random() < 0.2) {
      particles.spawn(Math.random() * 960, 540, (Math.random() - 0.5) * 0.5, -(1 + Math.random() * 2), '#4dd0ff', 1.5, 3.0);
    }
  }

  render(ctx) {
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);

    // Decorative planet
    ctx.save();
    ctx.beginPath();
    ctx.arc(820, 140, 160, 0, Math.PI * 2);
    ctx.fillStyle = '#111a33';
    ctx.fill();
    ctx.strokeStyle = '#24335e';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(820, 140, 150, 0, Math.PI * 2);
    ctx.fillStyle = '#1d2b53';
    ctx.fill();
    ctx.restore();
  }
}

// ============================================================================
// STAGE SELECT SCENE
// ============================================================================
class SelectScene {
  constructor(game) {
    this.game = game;
  }

  enter() {
    this.renderDOM();
  }

  exit() {
    const ui = document.getElementById('ui');
    if (ui) ui.innerHTML = '';
  }

  renderDOM() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    const saved = loadProgress();

    ui.innerHTML = `
      <div class="select-container panel">
        <header class="select-header">
          <div>
            <button id="btn-back-title" class="btn-micro">‹ MAIN MENU</button>
            <h2 class="select-heading">SELECT EXPLORATION TARGET</h2>
          </div>
          <span class="cml-status-pill">UNLOCKED: CML ${saved.unlockedCml} RANK</span>
        </header>

        <div class="mission-cards-grid">
          ${MISSIONS.map(m => {
            const isUnlocked = m.cml <= saved.unlockedCml;
            const best = saved.bestScores[m.key] || 0;
            return `
              <div class="mission-card ${!isUnlocked ? 'card-locked' : ''}" data-mid="${m.id}">
                <div class="mcard-top">
                  <span class="mcard-rank">${m.rank.toUpperCase()} · CML ${m.cml}</span>
                  <span class="mcard-budget">$${m.budget}M BUDGET</span>
                </div>
                <h3 class="mcard-name">${m.name}</h3>
                <span class="mcard-subtitle">${m.subtitle}</span>
                <p class="mcard-obj">${m.objective}</p>
                <div class="mcard-meta">
                  <span>Sun: ${Math.round(m.sun * 100)}%</span>
                  <span>Duration: ${m.days}d</span>
                  <span>${best > 0 ? `🏆 Best: ${best} pts` : 'Not flown yet'}</span>
                </div>
                <button class="btn-select-mission ${!isUnlocked ? 'btn-disabled' : ''}">
                  ${isUnlocked ? 'CONFIGURE IN HANGAR ›' : `LOCKED (REACH CML ${m.cml})`}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const btnBack = ui.querySelector('#btn-back-title');
    if (btnBack) {
      btnBack.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('title');
      };
    }

    ui.querySelectorAll('.mission-card:not(.card-locked)').forEach(card => {
      card.onclick = () => {
        const mid = parseInt(card.dataset.mid, 10);
        const m = MISSIONS.find(item => item.id === mid);
        if (m) {
          sfx.click();
          this.exit();
          this.game.currentMission = m;
          this.game.go('hangar', { mission: m, difficulty: this.game.difficulty });
        }
      };
    });
  }

  update(dt) {}

  render(ctx) {
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);
  }
}

// ============================================================================
// GAME APPLICATION CONTROLLER
// ============================================================================
class LunoraGame {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.currentMission = MISSIONS[0];
    this.difficulty = 'engineer';

    this.scenes = {
      title: new TitleScene(this),
      select: new SelectScene(this),
      hangar: new HangarScene(this),
      launch: new LaunchStage(this),
      cruise: new CruiseStage(this),
      ops: new OpsStage(this),
      science: new ScienceStage(this),
      debrief: new DebriefScene(this)
    };

    this.currentScene = this.scenes.title;
    this.lastTime = 0;
    this.accumulator = 0;
    this.DT = 1 / 60;

    this.init();
  }

  init() {
    this.fitCanvas();
    window.addEventListener('resize', () => this.fitCanvas());

    // Start with title
    this.currentScene.enter();

    // Loop
    requestAnimationFrame(t => this.frame(t));
  }

  fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = 960 * dpr;
    this.canvas.height = 540 * dpr;
    this.ctx.setTransform(this.canvas.width / 960, 0, 0, this.canvas.height / 540, 0, 0);
  }

  go(sceneName, payload = {}) {
    if (this.currentScene && this.currentScene.exit) {
      this.currentScene.exit();
    }
    const nextScene = this.scenes[sceneName];
    if (nextScene) {
      this.currentScene = nextScene;
      if (this.currentScene.enter) {
        this.currentScene.enter(payload);
      }
    }
  }

  frame(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= this.DT) {
      if (this.currentScene && this.currentScene.update) {
        this.currentScene.update(this.DT);
      }
      particles.update(this.DT);
      popups.update(this.DT);
      camera.update(this.DT);
      input.endFrame();
      this.accumulator -= this.DT;
    }

    // Render Canvas
    this.ctx.save();
    this.ctx.translate(camera.offsetX, camera.offsetY);
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(this.ctx);
    }
    particles.render(this.ctx);
    popups.render(this.ctx);
    this.ctx.restore();

    requestAnimationFrame(t => this.frame(t));
  }
}

// Bootstrap application on window load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new LunoraGame();
});
