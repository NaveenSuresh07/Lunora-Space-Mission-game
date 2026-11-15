/**
 * Lunora: Mission Control Arcade (v2) - Debrief Screen (The Learning Layer)
 * 1000-Point Scorecard, Segment Grades (A-D), CML Progression, Real NASA Mission Match, Patch Generator
 */

import { sfx, particles, saveProgress, loadProgress } from './core.js';

export class DebriefScene {
  constructor(game) {
    this.game = game;
    this.payload = null;
    this.scoreData = null;
  }

  enter(payload) {
    this.payload = payload;
    this.calculateScore();
    this.renderDOM();
    sfx.fanfare();
    particles.emitConfetti(480, 160, 60);
  }

  exit() {
    const ui = document.getElementById('ui');
    if (ui) ui.innerHTML = '';
  }

  calculateScore() {
    const m = this.payload.mission;
    const stats = this.payload.stats;
    const s1 = this.payload.stage1 || { orbitAccuracy: 0.8, remainingFuel: 50 };
    const s2 = this.payload.stage2 || { integrity: 80, insertionAccuracy: 0.8 };
    const s3 = this.payload.stage3 || { dataReturnedPct: 85 };
    const s4 = this.payload.stage4 || { scienceScore: 50 };

    const budgetLeftPct = Math.max(0, Math.round(((stats.effectiveBudget - stats.totalCost) / stats.effectiveBudget) * 100));

    // Bonus Goal Evaluation
    let bonusAchieved = false;
    if (m.id === 1 && (stats.effectiveBudget - stats.totalCost) >= 15) {
      bonusAchieved = true;
    } else if (m.id === 2 && stats.parts.some(p => p.id === 'spec') && stats.parts.some(p => p.id === 'radar')) {
      bonusAchieved = true;
    } else if (m.id === 3 && s2.integrity >= 80) {
      bonusAchieved = true;
    } else if (m.id === 4 && s3.dataReturnedPct >= 90) {
      bonusAchieved = true;
    }

    const objectiveBonus = bonusAchieved ? 100 : 0;

    // Component Scores
    const sciencePts = Math.min(300, Math.round(s4.scienceScore * 5));
    const dataPts = Math.round(s3.dataReturnedPct * 2);
    const orbitPts = Math.round(s1.orbitAccuracy * 150);
    const insertionPts = Math.round(s2.insertionAccuracy * 150);
    const integrityPts = Math.round(s2.integrity * 1.5);
    const budgetPts = Math.round(budgetLeftPct * 2);

    const totalScore = Math.min(1000, sciencePts + dataPts + orbitPts + insertionPts + integrityPts + budgetPts + objectiveBonus);

    // Stars
    let stars = 1;
    if (s2.integrity > 30 && s3.dataReturnedPct > 50) stars = 2;
    if (stars === 2 && stats.totalCost <= stats.effectiveBudget && bonusAchieved) stars = 3;

    // Segment Grades & Actionable Feedback
    const getGrade = (val) => val >= 90 ? 'A' : (val >= 75 ? 'B' : (val >= 60 ? 'C' : 'D'));

    const launchVal = Math.round(s1.orbitAccuracy * 100);
    const spaceVal = Math.round((s2.integrity * 0.5) + (s2.insertionAccuracy * 50));
    const groundVal = s3.dataReturnedPct;
    const userVal = Math.min(100, Math.round((s4.scienceScore / 60) * 100));

    const grades = {
      launch: {
        grade: getGrade(launchVal),
        tip: launchVal >= 85
          ? 'Exceptional launch corridor tracking and smooth staging.'
          : 'Rocket drifted from the ascent corridor or took Max-Q stress. Consider throttling down during peak aerodynamic pressure.'
      },
      space: {
        grade: getGrade(spaceVal),
        tip: s2.insertionAccuracy >= 0.8
          ? 'Flawless orbit insertion retro-burn at target planetary arrival.'
          : 'Insertion timing was slightly off-nominal. Carrying more propellant fuel widens the capture sweet spot.'
      },
      ground: {
        grade: getGrade(groundVal),
        tip: groundVal >= 85
          ? 'Deep Space Network stations captured nearly all telemetry stream.'
          : 'Data was lost during occultation or low antenna gain. Upgrading to a Medium or High-Gain dish widens reception.'
      },
      user: {
        grade: getGrade(userVal),
        tip: userVal >= 80
          ? 'High combo multiplier delivered maximum peer-reviewed science value!'
          : 'Sorting combo broke. Match falling data packets rapidly with keys 1, 2, 3, 4.'
      }
    };

    // Save High Score & Unlock CML
    const saved = loadProgress();
    const prevBest = saved.bestScores[m.key] || 0;
    const isNewBest = totalScore > prevBest;
    if (isNewBest) {
      saved.bestScores[m.key] = totalScore;
    }
    saved.unlockedCml = Math.max(saved.unlockedCml, m.cml + 1);
    saveProgress(saved);

    this.scoreData = {
      totalScore,
      prevBest: Math.max(totalScore, prevBest),
      isNewBest,
      stars,
      bonusAchieved,
      sciencePts,
      dataPts,
      orbitPts,
      insertionPts,
      integrityPts,
      budgetPts,
      objectiveBonus,
      grades
    };
  }

  renderDOM() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    const m = this.payload.mission;
    const d = this.scoreData;

    ui.innerHTML = `
      <div class="debrief-container panel">
        <!-- Debrief Header -->
        <header class="debrief-header">
          <div class="header-left">
            <span class="debrief-tag">MISSION POST-FLIGHT EVALUATION</span>
            <h1 class="debrief-title">${m.name.toUpperCase()} · ${m.rank.toUpperCase()} RANK</h1>
            <span class="cml-badge">CONCEPT MATURITY LEVEL: CML ${m.cml} ACHIEVED</span>
          </div>

          <div class="stars-display">
            <span class="star-icon ${d.stars >= 1 ? 'star-lit' : ''}">★</span>
            <span class="star-icon ${d.stars >= 2 ? 'star-lit' : ''}">★</span>
            <span class="star-icon ${d.stars >= 3 ? 'star-lit' : ''}">★</span>
          </div>
        </header>

        <!-- Scoreboard Overview -->
        <div class="debrief-score-row">
          <div class="score-card-main">
            <span class="score-label">OVERALL MISSION SCORE</span>
            <div class="score-number">${d.totalScore} <span class="score-max">/ 1,000</span></div>
            ${d.isNewBest ? '<span class="new-best-pill">🏆 NEW PERSONAL BEST!</span>' : `<span class="pb-pill">BEST: ${d.prevBest}</span>`}
          </div>

          <!-- Breakdown Pillars -->
          <div class="breakdown-grid">
            <div class="breakdown-item">
              <span class="b-label">SCIENCE YIELD</span>
              <span class="b-val">+${d.sciencePts}</span>
            </div>
            <div class="breakdown-item">
              <span class="b-label">DSN TELEMETRY</span>
              <span class="b-val">+${d.dataPts}</span>
            </div>
            <div class="breakdown-item">
              <span class="b-label">ORBIT ASCENT</span>
              <span class="b-val">+${d.orbitPts}</span>
            </div>
            <div class="breakdown-item">
              <span class="b-label">INSERTION BURN</span>
              <span class="b-val">+${d.insertionPts}</span>
            </div>
            <div class="breakdown-item">
              <span class="b-label">CRAFT INTEGRITY</span>
              <span class="b-val">+${d.integrityPts}</span>
            </div>
            <div class="breakdown-item">
              <span class="b-label">BUDGET MARGIN</span>
              <span class="b-val">+${d.budgetPts}</span>
            </div>
            <div class="breakdown-item ${d.bonusAchieved ? 'bonus-pass' : ''}">
              <span class="b-label">BONUS GOAL</span>
              <span class="b-val">+${d.objectiveBonus}</span>
            </div>
          </div>
        </div>

        <!-- NASA 4 Mission Segments Report -->
        <h3 class="section-label" style="margin-top: 14px;">NASA MISSION SEGMENTS PERFORMANCE</h3>
        <div class="segments-grid">
          <div class="segment-card">
            <div class="segment-top">
              <span class="seg-name">1. LAUNCH SEGMENT</span>
              <span class="seg-grade grade-${d.grades.launch.grade}">${d.grades.launch.grade}</span>
            </div>
            <p class="seg-tip">${d.grades.launch.tip}</p>
          </div>

          <div class="segment-card">
            <div class="segment-top">
              <span class="seg-name">2. SPACE SEGMENT</span>
              <span class="seg-grade grade-${d.grades.space.grade}">${d.grades.space.grade}</span>
            </div>
            <p class="seg-tip">${d.grades.space.tip}</p>
          </div>

          <div class="segment-card">
            <div class="segment-top">
              <span class="seg-name">3. GROUND SEGMENT</span>
              <span class="seg-grade grade-${d.grades.ground.grade}">${d.grades.ground.grade}</span>
            </div>
            <p class="seg-tip">${d.grades.ground.tip}</p>
          </div>

          <div class="segment-card">
            <div class="segment-top">
              <span class="seg-name">4. USER SEGMENT</span>
              <span class="seg-grade grade-${d.grades.user.grade}">${d.grades.user.grade}</span>
            </div>
            <p class="seg-tip">${d.grades.user.tip}</p>
          </div>
        </div>

        <!-- Real NASA Mission Match & Scientific Discovery Card -->
        <div class="discovery-box">
          <div class="disc-left">
            <span class="disc-tag">AUTHENTIC NASA HERITAGE MATCH</span>
            <h4 class="disc-title">${m.real}</h4>
            <p class="disc-fact">${m.nasaFact}</p>
          </div>
          <div class="disc-right">
            <span class="disc-tag" style="color: #3ddc97;">SCIENTIFIC DISCOVERY DELIVERED</span>
            <p class="disc-result">"${m.discovery}"</p>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <footer class="debrief-footer">
          <button id="btn-redesign" class="btn-secondary">🛠️ REDESIGN IN HANGAR</button>
          <button id="btn-retry-stage" class="btn-secondary">↺ RETRY MISSION</button>
          <button id="btn-next-mission" class="btn-primary-action">NEXT MISSION (STAGE SELECT) ›</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    const btnRedesign = ui.querySelector('#btn-redesign');
    if (btnRedesign) {
      btnRedesign.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('hangar', { mission: this.payload.mission, difficulty: this.payload.difficulty });
      };
    }

    const btnRetry = ui.querySelector('#btn-retry-stage');
    if (btnRetry) {
      btnRetry.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('launch', {
          mission: this.payload.mission,
          vehicle: this.payload.vehicle,
          parts: this.payload.parts,
          stats: this.payload.stats,
          difficulty: this.payload.difficulty
        });
      };
    }

    const btnNext = ui.querySelector('#btn-next-mission');
    if (btnNext) {
      btnNext.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('select');
      };
    }
  }

  update(dt) {}

  render(ctx) {
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);
  }
}
