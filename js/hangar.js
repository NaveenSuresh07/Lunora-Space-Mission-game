/**
 * Lunora: Mission Control Arcade (v2) - Hangar (Build Phase)
 * Interactive 6x4 Bay Grid, Live Telemetry Gauges, Vehicle Selector, Auto-Build, Blocker Checker
 */

import { VEHICLES, PARTS, ALL_PARTS, computeStats, autoBuild } from './data.js';
import { sfx } from './core.js';

export class HangarScene {
  constructor(game) {
    this.game = game;
    this.mission = null;
    this.difficulty = 'engineer';
    this.vehicle = VEHICLES[0];
    this.placedParts = [];
    this.history = [];
    this.activeTab = 'power';
    this.selectedPartId = null;
  }

  enter(payload = {}) {
    this.mission = payload.mission || this.game.currentMission;
    this.difficulty = payload.difficulty || this.game.difficulty || 'engineer';

    // Set initial vehicle appropriate for mission
    if (this.mission.target === 'leo') {
      this.vehicle = VEHICLES[0];
    } else if (this.mission.target === 'moon') {
      this.vehicle = VEHICLES[1];
    } else {
      this.vehicle = VEHICLES[2];
    }

    // Auto-populate default starter build
    this.history = [];
    const build = autoBuild(this.mission, this.difficulty);
    this.vehicle = build.vehicle;
    this.placedParts = build.placedParts;

    this.renderDOM();
  }

  exit() {
    const ui = document.getElementById('ui');
    if (ui) ui.innerHTML = '';
  }

  pushHistory() {
    this.history.push({
      vehicleId: this.vehicle.id,
      parts: JSON.parse(JSON.stringify(this.placedParts))
    });
    if (this.history.length > 20) this.history.shift();
  }

  undo() {
    if (this.history.length === 0) return;
    const prev = this.history.pop();
    this.vehicle = VEHICLES.find(v => v.id === prev.vehicleId) || this.vehicle;
    this.placedParts = prev.parts;
    sfx.click();
    this.renderDOM();
  }

  reset() {
    this.pushHistory();
    this.placedParts = [];
    sfx.click();
    this.renderDOM();
  }

  applyAutoBuild() {
    this.pushHistory();
    const build = autoBuild(this.mission, this.difficulty);
    this.vehicle = build.vehicle;
    this.placedParts = build.placedParts;
    sfx.pickup();
    this.renderDOM();
  }

  // Grid management (6 columns x 4 rows)
  canPlace(c, r, w, h, ignoreIndex = -1) {
    if (c + w > 6 || r + h > 4) return false;
    for (let i = 0; i < this.placedParts.length; i++) {
      if (i === ignoreIndex) continue;
      const p = this.placedParts[i];
      const [pw, ph] = p.size;
      const overlap = !(c + w <= p.gridX || c >= p.gridX + pw || r + h <= p.gridY || r >= p.gridY + ph);
      if (overlap) return false;
    }
    return true;
  }

  addPart(partTemplate) {
    // Find first available spot in 6x4 grid
    const [w, h] = partTemplate.size;
    let placed = false;
    for (let r = 0; r < 4 && !placed; r++) {
      for (let c = 0; c < 6 && !placed; c++) {
        if (this.canPlace(c, r, w, h)) {
          this.pushHistory();
          this.placedParts.push({
            ...partTemplate,
            gridX: c,
            gridY: r
          });
          placed = true;
          sfx.click();
        }
      }
    }
    if (!placed) {
      sfx.hit();
      alert('No space available in the 6×4 Spacecraft Bay for this component! Remove an existing part or resize.');
    }
    this.renderDOM();
  }

  removePart(index) {
    this.pushHistory();
    this.placedParts.splice(index, 1);
    sfx.click();
    this.renderDOM();
  }

  launch() {
    const stats = computeStats(this.vehicle, this.placedParts, this.mission, this.difficulty);
    if (!stats.isLaunchReady) {
      sfx.hit();
      return;
    }
    sfx.success();
    this.exit();
    this.game.go('launch', {
      mission: this.mission,
      vehicle: this.vehicle,
      parts: this.placedParts,
      stats,
      difficulty: this.difficulty
    });
  }

  renderDOM() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    const stats = computeStats(this.vehicle, this.placedParts, this.mission, this.difficulty);
    const m = this.mission;

    // Budget gauge percentage
    const budgetPct = Math.round((stats.totalCost / stats.effectiveBudget) * 100);
    const budgetColor = budgetPct > 100 ? 'var(--bad)' : (budgetPct >= 85 ? 'var(--warn)' : 'var(--good)');

    // Mass gauge percentage
    const massLimit = this.vehicle ? this.vehicle.payload : 1;
    const massPct = Math.round((stats.totalMass / massLimit) * 100);
    const massColor = massPct > 100 ? 'var(--bad)' : (massPct >= 85 ? 'var(--warn)' : 'var(--good)');

    // Power gauge
    const powerOK = stats.powerOK;
    const powerColor = powerOK ? 'var(--good)' : 'var(--bad)';

    // Data throughput
    const dataDownlinkRatio = stats.dataProduced > 0 ? Math.min(1.0, stats.downlinkRate / stats.dataProduced) : 1.0;
    const dataColor = dataDownlinkRatio >= 0.85 ? 'var(--good)' : (dataDownlinkRatio >= 0.5 ? 'var(--warn)' : 'var(--bad)');

    // Available parts in current tab
    const currentTabParts = PARTS[this.activeTab] || [];

    // Occupied grid matrix for rendering 6x4
    const gridOccupied = Array(4).fill(null).map(() => Array(6).fill(null));
    this.placedParts.forEach((part, idx) => {
      const [w, h] = part.size;
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (part.gridY + r < 4 && part.gridX + c < 6) {
            gridOccupied[part.gridY + r][part.gridX + c] = { part, index: idx, isRoot: r === 0 && c === 0 };
          }
        }
      }
    });

    ui.innerHTML = `
      <div class="hangar-container panel">
        <!-- Top Mission Header & Live Telemetry HUD -->
        <header class="hangar-header">
          <div class="mission-tag-group">
            <button id="btn-back-brief" class="btn-micro">‹ MISSIONS</button>
            <span class="mission-title-badge">${m.name.toUpperCase()}</span>
            <span class="mission-dest-chip">DEST: ${m.target.toUpperCase()} (${m.days} DAYS)</span>
            <span class="mission-sun-chip">SOLAR INTENSITY: ${Math.round(m.sun * 100)}%</span>
            <span class="difficulty-chip ${this.difficulty}">${this.difficulty.toUpperCase()} MODE</span>
          </div>
          <div class="header-actions">
            <button id="btn-autobuild" class="btn-primary-action" title="Automatically equip an optimal flight-ready configuration">⚡ AUTO-BUILD</button>
            <button id="btn-undo" class="btn-secondary" title="Revert last change">↺ UNDO</button>
            <button id="btn-reset" class="btn-secondary" title="Clear all bay slots">✕ RESET</button>
          </div>
        </header>

        <!-- Live Telemetry Meters -->
        <div class="telemetry-bar">
          <div class="meter-cell">
            <div class="meter-labels">
              <span>BUDGET</span>
              <span style="color: ${budgetColor}">$${stats.totalCost}M / $${stats.effectiveBudget}M (${budgetPct}%)</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${Math.min(100, budgetPct)}%; background: ${budgetColor};"></div>
            </div>
          </div>

          <div class="meter-cell">
            <div class="meter-labels">
              <span>TOTAL MASS</span>
              <span style="color: ${massColor}">${stats.totalMass} kg / ${this.vehicle ? this.vehicle.payload : 0} kg (${massPct}%)</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${Math.min(100, massPct)}%; background: ${massColor};"></div>
            </div>
          </div>

          <div class="meter-cell">
            <div class="meter-labels">
              <span>ELECTRICAL POWER</span>
              <span style="color: ${powerColor}">${stats.wattsSupply}W supply / ${stats.wattsNeed}W draw</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${stats.wattsNeed > 0 ? Math.min(100, (stats.wattsSupply / stats.wattsNeed) * 100) : 100}%; background: ${powerColor};"></div>
            </div>
          </div>

          <div class="meter-cell">
            <div class="meter-labels">
              <span>DATA TELEMETRY</span>
              <span style="color: ${dataColor}">${stats.downlinkRate} Mb/d down / ${stats.dataProduced} Mb/d gen</span>
            </div>
            <div class="meter-track">
              <div class="meter-fill" style="width: ${Math.min(100, dataDownlinkRatio * 100)}%; background: ${dataColor};"></div>
            </div>
          </div>
        </div>

        <!-- Main Workshop Split Screen -->
        <div class="hangar-body">
          <!-- Left: Booster Selection & 6x4 Spacecraft Bay -->
          <div class="hangar-left">
            <h3 class="section-label">1. LAUNCH BOOSTER</h3>
            <div class="vehicle-card-row">
              ${VEHICLES.map(v => {
                const isSelected = this.vehicle.id === v.id;
                const canReach = v.reach.includes(m.target);
                return `
                  <div class="vehicle-card ${isSelected ? 'vehicle-selected' : ''} ${!canReach ? 'vehicle-locked' : ''}" data-vid="${v.id}">
                    <div class="vcard-top">
                      <span class="vcard-name">${v.name}</span>
                      <span class="vcard-cost">$${v.cost}M</span>
                    </div>
                    <div class="vcard-desc">${v.tag}</div>
                    <div class="vcard-stats">
                      <span>Lift: ${v.payload} kg</span>
                      <span>Corridor: ±${Math.round(v.corridor * 100)}%</span>
                    </div>
                    ${!canReach ? '<span class="vcard-warning">⚠ CANNOT REACH ' + m.target.toUpperCase() + '</span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <div class="bay-header-row">
              <h3 class="section-label">2. SPACECRAFT INTERNAL BAY (6×4 CELLS)</h3>
              <span class="bay-hint">Click a placed part to remove it</span>
            </div>

            <!-- 6x4 Bay Grid -->
            <div class="bay-grid">
              ${Array.from({ length: 4 }).map((_, r) => `
                <div class="bay-row">
                  ${Array.from({ length: 6 }).map((_, c) => {
                    const item = gridOccupied[r][c];
                    if (!item) {
                      return `<div class="bay-cell bay-empty" data-r="${r}" data-c="${c}"></div>`;
                    }
                    if (item.isRoot) {
                      const [w, h] = item.part.size;
                      return `
                        <div class="bay-cell bay-occupied ${item.part.category}"
                             style="grid-column: span ${w}; grid-row: span ${h};"
                             data-pindex="${item.index}"
                             title="Click to remove ${item.part.name}">
                          <span class="bay-item-icon">${item.part.icon}</span>
                          <span class="bay-item-name">${item.part.name}</span>
                          <span class="bay-remove-badge">✕</span>
                        </div>
                      `;
                    }
                    return ''; // Handled by CSS grid-span
                  }).join('')}
                </div>
              `).join('')}
            </div>

            <!-- Derived Flight Parameters -->
            <div class="flight-specs-box">
              <div class="spec-pill"><strong>THRUST ACCEL:</strong> ${stats.accel.toFixed(2)}x</div>
              <div class="spec-pill"><strong>PROP RES:</strong> ${stats.totalFuel} Δv</div>
              <div class="spec-pill"><strong>DSN CONE:</strong> ±${Math.round(stats.catchWidth * 60)}°</div>
              <div class="spec-pill"><strong>BUFFER:</strong> ${stats.totalBuffer} Mb</div>
              <div class="spec-pill"><strong>HEAT SHIELD:</strong> ${stats.hasThermal ? '50% RESIST' : 'NONE'}</div>
            </div>
          </div>

          <!-- Right: Modular Parts Tray -->
          <div class="hangar-right">
            <h3 class="section-label">3. SUBSYSTEM COMPONENTS</h3>
            <div class="parts-nav">
              <button class="nav-tab ${this.activeTab === 'power' ? 'tab-active' : ''}" data-tab="power">POWER</button>
              <button class="nav-tab ${this.activeTab === 'instruments' ? 'tab-active' : ''}" data-tab="instruments">SCIENCE</button>
              <button class="nav-tab ${this.activeTab === 'comms' ? 'tab-active' : ''}" data-tab="comms">COMMS</button>
              <button class="nav-tab ${this.activeTab === 'extras' ? 'tab-active' : ''}" data-tab="extras">EXTRAS</button>
            </div>

            <div class="parts-list">
              ${currentTabParts.map(part => {
                let isLocked = false;
                let lockReason = '';
                if (part.needs === 'landing' && !m.landing) {
                  isLocked = true;
                  lockReason = 'Requires a planetary surface landing mission';
                }
                if (part.only && !part.only.includes(m.target)) {
                  isLocked = true;
                  lockReason = `Only available for ${part.only.join(', ').toUpperCase()} missions`;
                }

                // Count currently placed of this part
                const countPlaced = this.placedParts.filter(p => p.id === part.id).length;

                return `
                  <div class="part-card ${isLocked ? 'part-locked' : ''}" data-pid="${part.id}">
                    <div class="part-card-header">
                      <span class="part-icon">${part.icon}</span>
                      <div class="part-title-box">
                        <span class="part-name">${part.name}</span>
                        <span class="part-sub">${part.size[0]}×${part.size[1]} cells · ${part.mass} kg</span>
                      </div>
                      <span class="part-price">$${part.cost}M</span>
                    </div>
                    <p class="part-desc">${part.desc}</p>
                    <div class="part-footer">
                      <div class="part-stats-row">
                        ${part.watts ? `<span class="part-stat">${part.category === 'power' ? '+' : '-'}${part.watts}W</span>` : ''}
                        ${part.science ? `<span class="part-stat text-good">+${part.science} Sci</span>` : ''}
                        ${part.down ? `<span class="part-stat">${part.down} Mb/d</span>` : ''}
                      </div>
                      ${isLocked ? `<span class="locked-text">🔒 ${lockReason}</span>` : `
                        <button class="btn-install ${countPlaced > 0 ? 'installed' : ''}">
                          ${countPlaced > 0 ? `+ ADD ANOTHER (${countPlaced})` : '+ INSTALL'}
                        </button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Launch Readiness Footer -->
        <footer class="hangar-footer">
          <div class="status-summary">
            ${stats.isLaunchReady ? `
              <div class="ready-badge">
                <span class="ready-icon">✓</span>
                <div class="ready-text">
                  <strong>SYSTEMS GO FOR FLIGHT!</strong>
                  <span>All flight safety, mass, and power constraints verified.</span>
                </div>
              </div>
            ` : `
              <div class="blocker-badge">
                <span class="blocker-icon">⚠</span>
                <div class="blocker-text">
                  <strong>HOLD LAUNCH: ${stats.blockers[0]}</strong>
                  <span>Resolve constraint deficit or tap Auto-Build above.</span>
                </div>
              </div>
            `}
          </div>

          <button id="btn-launch" class="btn-launch-primary ${!stats.isLaunchReady ? 'launch-disabled' : ''}">
            🚀 PROCEED TO STAGE 1: LAUNCH
          </button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const ui = document.getElementById('ui');
    if (!ui) return;

    // Back to missions
    const btnBack = ui.querySelector('#btn-back-brief');
    if (btnBack) {
      btnBack.onclick = () => {
        sfx.click();
        this.exit();
        this.game.go('select');
      };
    }

    // Auto-Build
    const btnAuto = ui.querySelector('#btn-autobuild');
    if (btnAuto) {
      btnAuto.onclick = () => this.applyAutoBuild();
    }

    // Undo
    const btnUndo = ui.querySelector('#btn-undo');
    if (btnUndo) {
      btnUndo.onclick = () => this.undo();
    }

    // Reset
    const btnReset = ui.querySelector('#btn-reset');
    if (btnReset) {
      btnReset.onclick = () => this.reset();
    }

    // Vehicle cards
    ui.querySelectorAll('.vehicle-card').forEach(card => {
      card.onclick = () => {
        const vid = card.dataset.vid;
        const v = VEHICLES.find(item => item.id === vid);
        if (v && v.id !== this.vehicle.id) {
          this.pushHistory();
          this.vehicle = v;
          sfx.click();
          this.renderDOM();
        }
      };
    });

    // Tab buttons
    ui.querySelectorAll('.nav-tab').forEach(tab => {
      tab.onclick = () => {
        const t = tab.dataset.tab;
        if (t && t !== this.activeTab) {
          this.activeTab = t;
          sfx.click();
          this.renderDOM();
        }
      };
    });

    // Install part buttons
    ui.querySelectorAll('.part-card:not(.part-locked)').forEach(card => {
      card.onclick = (e) => {
        const pid = card.dataset.pid;
        const part = ALL_PARTS.find(p => p.id === pid);
        if (part) {
          this.addPart(part);
        }
      };
    });

    // Remove part from bay
    ui.querySelectorAll('.bay-occupied').forEach(cell => {
      cell.onclick = (e) => {
        e.stopPropagation();
        const pindex = parseInt(cell.dataset.pindex, 10);
        if (!isNaN(pindex)) {
          this.removePart(pindex);
        }
      };
    });

    // Launch button
    const btnLaunch = ui.querySelector('#btn-launch');
    if (btnLaunch) {
      btnLaunch.onclick = () => this.launch();
    }
  }

  update(dt) {
    // No continuous animation needed for static hangar DOM
  }

  render(ctx) {
    // Clear canvas behind the DOM hangar
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);
  }
}
