/**
 * Lunora: Mission Architect
 * Modern Responsive UI Renderer, SVG Visualizer, Step Wizard & HUD
 */

import { MISSIONS, VEHICLES, BUSES, POWER, INSTRUMENTS, COMMS, ARIA_HINTS } from './data.js';
import { state, pushHistory, undoDesign, applyRecommendedBuild, autoFixBlockers } from './state.js';
import { evaluate } from './engine.js';

export function renderHUD(evaluation) {
  const m = state.mission;
  const costPct = Math.round((evaluation.cost / evaluation.budget) * 100);
  const massPct = Math.round((evaluation.mass / evaluation.vehiclePayload) * 100);
  const powerPct = evaluation.powerNeeded > 0 ? Math.round((evaluation.powerSupply / evaluation.powerNeeded) * 100) : 100;
  const dataPct = evaluation.dataGenerated > 0 ? Math.round((evaluation.dataDownlink / evaluation.dataGenerated) * 100) : 100;

  // Status colors: green <85%, amber 85-100%, red >100%
  const getBudgetClass = (pct) => pct > 100 ? 'status-bad' : (pct >= 85 ? 'status-warn' : 'status-good');
  const getMassClass = (pct) => pct > 100 ? 'status-bad' : (pct >= 85 ? 'status-warn' : 'status-good');
  const getPowerClass = (pct) => pct < 100 ? 'status-bad' : (pct < 115 ? 'status-warn' : 'status-good');
  const getDataClass = (pct) => pct < 100 ? 'status-warn' : 'status-good';

  return `
    <div class="hud-panel">
      <div class="hud-header">
        <div class="hud-title">MISSION TELEMETRY HUD</div>
        <div class="hud-badge ${evaluation.isLaunchReady ? 'badge-go' : 'badge-nogo'}">
          ${evaluation.isLaunchReady ? '● FLIGHT READY' : '▲ HOLD / BLOCKERS'}
        </div>
      </div>

      <!-- Success Probability Meter -->
      <div class="hud-success-box">
        <div class="success-ring-label">ESTIMATED SUCCESS PROBABILITY</div>
        <div class="success-val-large ${evaluation.successPercentage >= 80 ? 'text-good' : (evaluation.successPercentage >= 60 ? 'text-warn' : 'text-bad')}">
          ${evaluation.successPercentage}%
        </div>
        <div class="hud-sub">Based on launch vehicle reliability & power margins</div>
      </div>

      <!-- Resource Gauges -->
      <div class="gauge-group">
        <!-- Budget -->
        <div class="gauge-item">
          <div class="gauge-label">
            <span>BUDGET</span>
            <span class="${getBudgetClass(costPct)}">$${evaluation.cost}M / $${evaluation.budget}M (${costPct}%)</span>
          </div>
          <div class="gauge-bar-bg">
            <div class="gauge-bar-fill ${getBudgetClass(costPct)}" style="width: ${Math.min(100, costPct)}%"></div>
          </div>
        </div>

        <!-- Mass -->
        <div class="gauge-item">
          <div class="gauge-label">
            <span>MASS</span>
            <span class="${getMassClass(massPct)}">${evaluation.mass} / ${evaluation.vehiclePayload} kg (${massPct}%)</span>
          </div>
          <div class="gauge-bar-bg">
            <div class="gauge-bar-fill ${getMassClass(massPct)}" style="width: ${Math.min(100, massPct)}%"></div>
          </div>
        </div>

        <!-- Power -->
        <div class="gauge-item">
          <div class="gauge-label">
            <span>POWER</span>
            <span class="${getPowerClass(powerPct)}">${evaluation.powerSupply}W / ${evaluation.powerNeeded}W needed</span>
          </div>
          <div class="gauge-bar-bg">
            <div class="gauge-bar-fill ${getPowerClass(powerPct)}" style="width: ${Math.min(100, powerPct)}%"></div>
          </div>
        </div>

        <!-- Telemetry Downlink -->
        <div class="gauge-item">
          <div class="gauge-label">
            <span>DOWNLINK</span>
            <span class="${getDataClass(dataPct)}">${evaluation.dataDownlink} / ${evaluation.dataGenerated} Mb/d</span>
          </div>
          <div class="gauge-bar-bg">
            <div class="gauge-bar-fill ${getDataClass(dataPct)}" style="width: ${Math.min(100, Math.min(100, dataPct))}%"></div>
          </div>
        </div>

        <!-- Science Return Preview -->
        <div class="gauge-item science-item">
          <div class="gauge-label">
            <span>PREVIEW SCIENCE SCORE</span>
            <span class="text-accent">${evaluation.scienceScore} PTS</span>
          </div>
        </div>
      </div>

      <!-- Blocker Alert / Auto-Fix -->
      ${!evaluation.isLaunchReady ? `
        <div class="blocker-card">
          <div class="blocker-title">⚠️ FLIGHT BLOCKER</div>
          <div class="blocker-desc">${evaluation.primaryBlocker}</div>
          <button id="btn-autofix" class="btn-autofix" aria-label="Auto-solve current engineering blocker">
            ⚡ AUTO-RESOLVE BLOCKER
          </button>
        </div>
      ` : `
        <div class="ready-card">
          <div class="ready-title">✓ ALL SYSTEMS NOMINAL</div>
          <div class="ready-desc">Probe satisfies all mass, power, reach, and budget envelopes.</div>
        </div>
      `}

      <!-- Quick Action Buttons -->
      <div class="hud-actions">
        <button id="btn-preset" class="btn-secondary" title="Equip NASA baseline build">
          ★ RECOMMENDED BUILD
        </button>
        <button id="btn-undo" class="btn-secondary" title="Undo last hardware change">
          ⤺ UNDO
        </button>
      </div>
    </div>
  `;
}

/**
 * Dynamic SVG Spacecraft Blueprint Visualizer
 */
export function renderSpacecraftSVG(design, evaluation) {
  const bus = design.bus;
  const power = design.power;
  const comms = design.comms;
  const vehicle = design.vehicle;
  const instruments = design.instruments || [];

  const hasSolarWings = power && (power.id === 'solar_s' || power.id === 'solar_l');
  const isLargeSolar = power && power.id === 'solar_l';
  const hasRTG = power && (power.id === 'rtg' || power.id === 'rtg_dual');
  const hasDish = comms && (comms.id === 'med' || comms.id === 'high');
  const isLargeDish = comms && comms.id === 'high';
  const isLander = bus && bus.hasLander;

  return `
    <div class="blueprint-canvas-box">
      <svg class="spacecraft-svg" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="busGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1e2c52" />
            <stop offset="50%" stop-color="#2d437a" />
            <stop offset="100%" stop-color="#141f3d" />
          </linearGradient>
          <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#29adff" />
            <stop offset="50%" stop-color="#166db8" />
            <stop offset="100%" stop-color="#0b3761" />
          </linearGradient>
          <linearGradient id="rocketGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#c2c3c7" />
            <stop offset="50%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#83769c" />
          </linearGradient>
        </defs>

        <!-- Blueprint Grid -->
        <g stroke="rgba(36, 51, 94, 0.4)" stroke-width="1">
          <line x1="20" y1="40" x2="380" y2="40" />
          <line x1="20" y1="80" x2="380" y2="80" />
          <line x1="20" y1="120" x2="380" y2="120" />
          <line x1="20" y1="160" x2="380" y2="160" />
          <line x1="20" y1="200" x2="380" y2="200" />
          <line x1="100" y1="20" x2="100" y2="220" />
          <line x1="200" y1="20" x2="200" y2="220" />
          <line x1="300" y1="20" x2="300" y2="220" />
        </g>

        <!-- Rocket Booster Adapter Ring & Upper Stage -->
        <path d="M 180,185 L 220,185 L 230,225 L 170,225 Z" fill="url(#rocketGrad)" stroke="#5f574f" stroke-width="1.5" />
        <text x="200" y="215" font-size="9" fill="#111a33" text-anchor="middle" font-weight="bold">${vehicle ? vehicle.name.split(' ')[0] : 'BOOSTER'}</text>

        <!-- Solar Wings Left and Right -->
        ${hasSolarWings ? `
          <!-- Left Solar Array -->
          <rect x="${isLargeSolar ? 45 : 95}" y="115" width="${isLargeSolar ? 80 : 45}" height="28" fill="url(#solarGrad)" stroke="#4dd0ff" stroke-width="1.5" rx="3" />
          <line x1="${isLargeSolar ? 85 : 117}" y1="115" x2="${isLargeSolar ? 85 : 117}" y2="143" stroke="#e8eeff" stroke-width="1" />
          <!-- Right Solar Array -->
          <rect x="260" y="115" width="${isLargeSolar ? 80 : 45}" height="28" fill="url(#solarGrad)" stroke="#4dd0ff" stroke-width="1.5" rx="3" />
          <line x1="${isLargeSolar ? 300 : 282}" y1="115" x2="${isLargeSolar ? 300 : 282}" y2="143" stroke="#e8eeff" stroke-width="1" />
        ` : ''}

        <!-- RTG Nuclear Generator Cask -->
        ${hasRTG ? `
          <rect x="95" y="120" width="35" height="20" fill="#ffa300" stroke="#7e2553" stroke-width="1.5" rx="4" />
          <line x1="102" y1="120" x2="102" y2="140" stroke="#000" stroke-width="1" />
          <line x1="112" y1="120" x2="112" y2="140" stroke="#000" stroke-width="1" />
          <line x1="122" y1="120" x2="122" y2="140" stroke="#000" stroke-width="1" />
          <text x="112" y="134" font-size="8" fill="#000" font-weight="bold" text-anchor="middle">RTG</text>
        ` : ''}

        <!-- Spacecraft Central Bus Chassis -->
        <rect x="155" y="100" width="90" height="60" fill="url(#busGrad)" stroke="#4dd0ff" stroke-width="2" rx="${isLander ? 8 : 4}" />
        <rect x="165" y="110" width="70" height="40" fill="none" stroke="#24335e" stroke-width="1" />
        <text x="200" y="133" font-size="10" fill="#e8eeff" text-anchor="middle" font-weight="bold">${bus ? bus.name.split(' ')[0] : 'BUS'}</text>

        <!-- Lander Legs / Descent Gear -->
        ${isLander ? `
          <line x1="160" y1="160" x2="140" y2="190" stroke="#c2c3c7" stroke-width="3" />
          <line x1="240" y1="160" x2="260" y2="190" stroke="#c2c3c7" stroke-width="3" />
          <circle cx="138" cy="190" r="4" fill="#5f574f" />
          <circle cx="262" cy="190" r="4" fill="#5f574f" />
        ` : ''}

        <!-- Antenna Dish or Patch Mounted on Top Deck -->
        ${hasDish ? `
          <!-- Parabolic Dish -->
          <ellipse cx="200" cy="${isLargeDish ? 60 : 75}" rx="${isLargeDish ? 40 : 25}" ry="${isLargeDish ? 14 : 9}" fill="#c2c3c7" stroke="#ffffff" stroke-width="2" />
          <line x1="200" y1="${isLargeDish ? 60 : 75}" x2="200" y2="100" stroke="#ffffff" stroke-width="2" />
          <circle cx="200" cy="${isLargeDish ? 50 : 66}" r="3" fill="#ff004d" />
        ` : `
          <!-- Low Gain Patch Antenna -->
          <rect x="195" y="88" width="10" height="12" fill="#ffa300" stroke="#fff" stroke-width="1.5" />
          <line x1="200" y1="78" x2="200" y2="88" stroke="#ffa300" stroke-width="2" />
        `}

        <!-- Installed Scientific Instruments -->
        ${instruments.map((inst, idx) => {
          const x = 165 + idx * 16;
          const y = 92;
          const colors = { cam: '#ffec27', spec: '#00e436', radar: '#29adff', mag: '#ff77a8', arm: '#ffa300' };
          const col = colors[inst.id] || '#ffffff';
          return `
            <circle cx="${x}" cy="${y}" r="4.5" fill="${col}" stroke="#111a33" stroke-width="1.5">
              <title>${inst.name}</title>
            </circle>
          `;
        }).join('')}
      </svg>
      <div class="blueprint-caption">
        LIVE SCHEMATIC: ${vehicle ? vehicle.name : 'Booster'} + ${bus ? bus.name : 'Chassis'} + ${instruments.length} Scientific Sensors
      </div>
    </div>
  `;
}

export function renderStepContent(step, evaluation) {
  const m = state.mission;

  // STEP 1: MISSION BRIEF
  if (step === 1) {
    return `
      <div class="step-container">
        <div class="step-header">
          <h2>STEP 1: MISSION OBJECTIVE & PARAMETERS</h2>
          <p class="step-desc">Review your flight parameters, destination constraints, and primary science targets.</p>
        </div>

        <div class="brief-card">
          <div class="brief-banner">
            <span class="brief-tag">${m.targetName.toUpperCase()}</span>
            <span class="brief-budget">BUDGET: $${evaluation.budget}M (${state.difficulty.toUpperCase()} TIER)</span>
          </div>
          <h3 class="brief-mission-name">${m.name}: ${m.subtitle}</h3>
          <p class="brief-desc-text">${m.desc}</p>

          <div class="brief-grid">
            <div class="brief-stat-chip">
              <span class="chip-label">PRIMARY OBJECTIVE</span>
              <span class="chip-val">${m.objective}</span>
            </div>
            <div class="brief-stat-chip">
              <span class="chip-label">BONUS STAR GOAL</span>
              <span class="chip-val text-accent">★ ${m.bonusGoal}</span>
            </div>
            <div class="brief-stat-chip">
              <span class="chip-label">SOLAR INTENSITY</span>
              <span class="chip-val">${Math.round(m.sunPower * 100)}% of Earth</span>
            </div>
            <div class="brief-stat-chip">
              <span class="chip-label">MISSION DURATION</span>
              <span class="chip-val">${m.days} Days</span>
            </div>
          </div>

          <div class="nasa-callout">
            <span class="callout-icon">🔬</span>
            <div>
              <strong>NASA HERITAGE INSIGHT:</strong> ${m.nasaFact}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // STEP 2: LAUNCH VEHICLE
  if (step === 2) {
    return `
      <div class="step-container">
        <div class="step-header">
          <h2>STEP 2: SELECT LAUNCH VEHICLE</h2>
          <p class="step-desc">Choose a booster rocket with sufficient payload lift and orbital reach for ${m.targetName}.</p>
        </div>

        <div class="cards-grid">
          ${VEHICLES.map(v => {
            const isSelected = state.design.vehicle && state.design.vehicle.id === v.id;
            const canReach = v.reach.includes(m.target);
            return `
              <div class="card-item ${isSelected ? 'card-selected' : ''} ${!canReach ? 'card-disabled' : ''}" data-type="vehicle" data-id="${v.id}">
                <div class="card-top">
                  <span class="card-tag">${v.tag}</span>
                  <span class="card-cost">$${v.cost}M</span>
                </div>
                <h3 class="card-title">${v.name}</h3>
                <div class="card-type-sub">${v.type}</div>
                <p class="card-desc">${v.desc}</p>
                <div class="chip-row">
                  <span class="mini-chip">PAYLOAD: ${v.payload} KG</span>
                  <span class="mini-chip">RELIABILITY: ${Math.round(v.reliability * 100)}%</span>
                  <span class="mini-chip ${canReach ? 'text-good' : 'text-bad'}">${canReach ? '✓ REACHES TARGET' : '✗ CANNOT REACH TARGET'}</span>
                </div>
                <button class="btn-select ${isSelected ? 'btn-selected' : ''}">
                  ${isSelected ? '✓ SELECTED' : 'SELECT ROCKET'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // STEP 3: BUS & POWER
  if (step === 3) {
    return `
      <div class="step-container">
        <div class="step-header">
          <h2>STEP 3: SPACECRAFT BUS & POWER SYSTEM</h2>
          <p class="step-desc">Pick a bus chassis to hold your payload, then install a power system capable of generating wattage at ${m.targetName}.</p>
        </div>

        <h3 class="section-title">SPACECRAFT BUS CHASSIS</h3>
        <div class="cards-grid">
          ${BUSES.map(b => {
            const isSelected = state.design.bus && state.design.bus.id === b.id;
            return `
              <div class="card-item ${isSelected ? 'card-selected' : ''}" data-type="bus" data-id="${b.id}">
                <div class="card-top">
                  <span class="card-tag">${b.tag}</span>
                  <span class="card-cost">$${b.cost}M</span>
                </div>
                <h3 class="card-title">${b.name}</h3>
                <p class="card-desc">${b.desc}</p>
                <div class="chip-row">
                  <span class="mini-chip">MASS: ${b.mass} KG</span>
                  <span class="mini-chip">MAX PAYLOAD: ${b.maxPayload} KG</span>
                  <span class="mini-chip">DRAW: ${b.houseWatts}W</span>
                  ${b.hasLander ? '<span class="mini-chip text-accent">✓ LANDER EQUIPPED</span>' : ''}
                </div>
                <button class="btn-select ${isSelected ? 'btn-selected' : ''}">
                  ${isSelected ? '✓ SELECTED' : 'SELECT BUS'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <h3 class="section-title" style="margin-top: 24px;">ELECTRICAL POWER SYSTEM</h3>
        <div class="cards-grid">
          ${POWER.map(p => {
            const isSelected = state.design.power && state.design.power.id === p.id;
            const yieldW = p.id === 'rtg' || p.id === 'rtg_dual' || p.id === 'battery' ? p.watts : Math.round(p.watts * m.sunPower);
            return `
              <div class="card-item ${isSelected ? 'card-selected' : ''}" data-type="power" data-id="${p.id}">
                <div class="card-top">
                  <span class="card-tag">${p.tag}</span>
                  <span class="card-cost">$${p.cost}M</span>
                </div>
                <h3 class="card-title">${p.name}</h3>
                <p class="card-desc">${p.desc}</p>
                <div class="chip-row">
                  <span class="mini-chip">MASS: ${p.mass} KG</span>
                  <span class="mini-chip ${yieldW >= 100 ? 'text-good' : (yieldW >= 50 ? 'text-warn' : 'text-bad')}">YIELD @ TARGET: ${yieldW} WATTS</span>
                </div>
                <button class="btn-select ${isSelected ? 'btn-selected' : ''}">
                  ${isSelected ? '✓ SELECTED' : 'SELECT POWER'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // STEP 4: SCIENTIFIC INSTRUMENTS
  if (step === 4) {
    return `
      <div class="step-container">
        <div class="step-header">
          <h2>STEP 4: SCIENTIFIC INSTRUMENT SUITE</h2>
          <p class="step-desc">Equip complementary sensors. Instruments generate scientific points, but demand mass, electrical wattage, and telemetry downlink bandwidth.</p>
        </div>

        <div class="cards-grid">
          ${INSTRUMENTS.map(i => {
            const isSelected = state.design.instruments.some(inst => inst.id === i.id);
            const needsLanderBlocked = i.needsLander && (!state.design.bus || !state.design.bus.hasLander);
            return `
              <div class="card-item ${isSelected ? 'card-selected' : ''} ${needsLanderBlocked ? 'card-warning' : ''}" data-type="instrument" data-id="${i.id}">
                <div class="card-top">
                  <span class="card-tag">${i.tag}</span>
                  <span class="card-cost">$${i.cost}M</span>
                </div>
                <h3 class="card-title">${i.name}</h3>
                <p class="card-desc">${i.desc}</p>
                <div class="chip-row">
                  <span class="mini-chip text-accent">★ +${i.science} SCIENCE</span>
                  <span class="mini-chip">MASS: ${i.mass} KG</span>
                  <span class="mini-chip">POWER: ${i.watts}W</span>
                  <span class="mini-chip">DATA: ${i.dataMbd} Mb/d</span>
                  ${i.needsLander ? '<span class="mini-chip text-warn">REQUIRES LANDER BUS</span>' : ''}
                </div>
                <button class="btn-select ${isSelected ? 'btn-selected' : ''}">
                  ${isSelected ? '✓ EQUIPPED (CLICK TO REMOVE)' : '+ EQUIP INSTRUMENT'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // STEP 5: COMMS & REVIEW
  if (step === 5) {
    return `
      <div class="step-container">
        <div class="step-header">
          <h2>STEP 5: TELEMETRY COMMS & FLIGHT REVIEW</h2>
          <p class="step-desc">Select an antenna dish to downlink your collected telemetry back to Earth's Deep Space Network stations.</p>
        </div>

        <h3 class="section-title">COMMUNICATIONS ANTENNA</h3>
        <div class="cards-grid">
          ${COMMS.map(c => {
            const isSelected = state.design.comms && state.design.comms.id === c.id;
            return `
              <div class="card-item ${isSelected ? 'card-selected' : ''}" data-type="comms" data-id="${c.id}">
                <div class="card-top">
                  <span class="card-tag">${c.tag}</span>
                  <span class="card-cost">$${c.cost}M</span>
                </div>
                <h3 class="card-title">${c.name}</h3>
                <p class="card-desc">${c.desc}</p>
                <div class="chip-row">
                  <span class="mini-chip">MASS: ${c.mass} KG</span>
                  <span class="mini-chip">POWER: ${c.watts}W</span>
                  <span class="mini-chip text-good">DOWNLINK: ${c.downMbd} Mb/d</span>
                </div>
                <button class="btn-select ${isSelected ? 'btn-selected' : ''}">
                  ${isSelected ? '✓ SELECTED' : 'SELECT ANTENNA'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Pre-Launch Review Summary -->
        <h3 class="section-title" style="margin-top: 24px;">PRE-LAUNCH MISSION READINESS REVIEW</h3>
        <div class="review-table-card">
          <div class="review-row">
            <span>TARGET DESTINATION:</span>
            <strong>${m.targetName.toUpperCase()}</strong>
          </div>
          <div class="review-row">
            <span>LAUNCH BOOSTER:</span>
            <strong>${state.design.vehicle ? state.design.vehicle.name : 'NONE'} (${state.design.vehicle ? Math.round(state.design.vehicle.reliability * 100) : 0}% Reliability)</strong>
          </div>
          <div class="review-row">
            <span>BUS PLATFORM:</span>
            <strong>${state.design.bus ? state.design.bus.name : 'NONE'}</strong>
          </div>
          <div class="review-row">
            <span>ELECTRICAL SUPPLY:</span>
            <strong>${state.design.power ? state.design.power.name : 'NONE'} (${evaluation.powerSupply}W @ Target)</strong>
          </div>
          <div class="review-row">
            <span>INSTALLED PAYLOAD:</span>
            <strong>${state.design.instruments.map(i => i.name).join(', ') || 'NONE'}</strong>
          </div>
          <div class="review-row">
            <span>ANTENNA DOWNLINK:</span>
            <strong>${state.design.comms ? state.design.comms.name : 'NONE'} (${evaluation.dataDownlink} Mb/d capacity)</strong>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

/**
 * Watchable Animated Flight Screen
 */
export function renderFlightScreen(flightResult, evaluation) {
  const m = state.mission;

  return `
    <div class="flight-screen-container">
      <div class="flight-header">
        <div>
          <h2>MISSION TIMELINE: ${m.name.toUpperCase()} FLIGHT</h2>
          <p class="flight-sub">Simulating real-time launch trajectory, interplanetary transit, and DSN telemetry.</p>
        </div>
        <div id="flight-status-badge" class="flight-live-badge">● TELEMETRY STREAMING</div>
      </div>

      <!-- Animated Stage Canvas Box -->
      <div class="flight-viewport">
        <canvas id="flight-canvas" width="800" height="240"></canvas>
        <div id="flight-ticker" class="flight-ticker">INITIATING TERMINAL COUNTDOWN SEQUENCE (T-0)...</div>
      </div>

      <!-- Milestone Trackers -->
      <div class="milestones-row">
        ${flightResult.milestones.map((ms, idx) => `
          <div class="milestone-node" id="ms-node-${idx}">
            <div class="ms-icon">${ms.icon}</div>
            <div class="ms-title">${ms.name}</div>
            <div class="ms-status" id="ms-status-${idx}">PENDING</div>
          </div>
        `).join('')}
      </div>

      <div class="flight-controls">
        <button id="btn-skip-flight" class="btn-secondary">SKIP TO DEBRIEF ⏭</button>
      </div>
    </div>
  `;
}

/**
 * Debrief Screen
 */
export function renderDebriefScreen(flightResult, evaluation) {
  const m = state.mission;
  const stars = flightResult.stars;
  const survived = flightResult.survived;

  let starDisplay = '';
  for (let s = 1; s <= 3; s++) {
    starDisplay += `<span class="star-icon ${s <= stars ? 'star-filled' : 'star-dim'}">★</span>`;
  }

  return `
    <div class="debrief-container">
      <div class="debrief-header ${survived ? 'debrief-success' : 'debrief-failed'}">
        <div class="debrief-stars">${starDisplay}</div>
        <h1 class="debrief-title">${survived ? (stars === 3 ? 'OUTSTANDING MISSION SUCCESS!' : 'PRIMARY MISSION ACCOMPLISHED!') : 'CRITICAL MISSION ANOMALY!'}</h1>
        <div class="debrief-score-badge">TOTAL SCORE: ${flightResult.totalScore} / 1000 PTS</div>
      </div>

      <div class="debrief-grid">
        <!-- Results Column -->
        <div class="debrief-card">
          <h3>FLIGHT PERFORMANCE AUDIT</h3>
          <div class="debrief-stat-row">
            <span>Mission Destination:</span>
            <strong>${m.targetName}</strong>
          </div>
          <div class="debrief-stat-row">
            <span>Scientific Return:</span>
            <strong class="text-accent">${evaluation.scienceScore} Science Points</strong>
          </div>
          <div class="debrief-stat-row">
            <span>Budget Accounting:</span>
            <strong class="${evaluation.cost <= evaluation.budget ? 'text-good' : 'text-bad'}">Spent $${evaluation.cost}M of $${evaluation.budget}M</strong>
          </div>
          <div class="debrief-stat-row">
            <span>Bonus Star Objective:</span>
            <strong class="${flightResult.bonusAchieved ? 'text-good' : 'text-warn'}">${flightResult.bonusAchieved ? '✓ ACHIEVED (+100 PTS)' : '✗ MISSED'}</strong>
          </div>
        </div>

        <!-- Actionable Advice Column -->
        <div class="debrief-card">
          <h3>WHAT ARIA WOULD CHANGE (AEROSPACE ADVICE)</h3>
          <ul class="advice-list">
            ${flightResult.hints.map(h => `<li>${h}</li>`).join('')}
          </ul>

          <div class="nasa-callout" style="margin-top: 16px;">
            <span>🚀</span>
            <div><strong>NASA FACT:</strong> ${flightResult.nasaFact}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="debrief-actions">
        <button id="btn-retry-mission" class="btn-secondary">↺ RETRY MISSION</button>
        ${(survived && state.unlockedMissionId < 4) ? `
          <button id="btn-next-mission" class="btn-primary">NEXT MISSION ►</button>
        ` : `
          <button id="btn-select-screen" class="btn-primary">MISSION ARCHIVES ►</button>
        `}
      </div>
    </div>
  `;
}
