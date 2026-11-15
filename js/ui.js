/**
 * Space Mission Design Game - UI Renderer
 * NASA Space Apps Challenge 2026
 * Pure UI layer: reads state and re-renders to the DOM.
 */

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
  payloadMass,
  wetMass,
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData,
  scienceScore,
  launchCapacityOk
} from './engine.js';

import { validate } from './validate.js';
import { runMission } from './simulate.js';
import { calculateScore } from './score.js';
import { saveBestScore, resetDesign, resetState } from './state.js';

let simInterval = null;
let orbitAnimFrame = null;

/**
 * Screen transition helper.
 */
export function go(state, screenName) {
  state.screen = screenName;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render(state);
}

/**
 * Main render function. Reads state and renders sticky meters + current screen.
 */
export function render(state) {
  renderMeters(state);
  renderScreen(state);
}

/**
 * Renders the top sticky live telemetry & engineering meters.
 */
function renderMeters(state) {
  const container = document.getElementById('meters-bar');
  if (!container) return;

  const cost = totalCost(state);
  const budget = state.mission ? state.mission.budget : null;
  const costViolated = budget !== null && cost > budget;

  const wet = wetMass(state);
  const cap = state.launcher ? state.launcher.payloadToLeoKg : null;
  const massViolated = cap !== null && wet > cap;

  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const powerViolated = state.power && pGen < pUsed;
  const powerMargin = pGen > 0 ? (pGen - pUsed) / pGen : 0;
  const powerWarn = !powerViolated && state.power && pGen > 0 && powerMargin < 0.15;

  const dv = deltaV(state);
  const dvNeeded = state.mission ? state.mission.deltaVNeeded : 0;
  const dvViolated = state.mission && dvNeeded > 0 && dv < dvNeeded;
  const dvMargin = dvNeeded > 0 && dv >= dvNeeded ? (dv - dvNeeded) / dvNeeded : 1;
  const dvWarn = !dvViolated && dvNeeded > 0 && dvMargin < 0.10;

  const dl = downlinkGbPerDay(state);
  const gen = dailyData(state);
  const dataWarn = state.comms && gen > 0 && dl < gen;

  const costFill = budget ? Math.min(100, (cost / budget) * 100) : 0;
  const massFill = cap ? Math.min(100, (wet / cap) * 100) : 0;
  const powerFill = (pGen + pUsed > 0) ? Math.min(100, (pUsed / Math.max(pGen, pUsed)) * 100) : 0;
  const dvFill = dvNeeded > 0 ? Math.min(100, (dv / dvNeeded) * 100) : (dv > 0 ? 100 : 0);
  const dataFill = (gen + dl > 0) ? Math.min(100, (Math.min(dl, gen) / gen) * 100) : 0;

  container.innerHTML = `
    <!-- Budget Meter -->
    <div class="meter-card ${costViolated ? 'violated' : ''}" title="Mission cost vs maximum budget">
      <div class="meter-header">
        <span>💰 Budget</span>
        <span class="meter-status-pill">${costViolated ? '⚠️ OVER' : 'OK'}</span>
      </div>
      <div class="meter-value-row">
        <span class="meter-val">$${cost}M</span>
        <span class="meter-limit">/ ${budget ? `$${budget}M` : '—'}</span>
      </div>
      <div class="meter-progress">
        <div class="meter-fill" style="width: ${costFill}%;"></div>
      </div>
    </div>

    <!-- Mass Meter -->
    <div class="meter-card ${massViolated ? 'violated' : ''}" title="Wet mass vs launcher lift capacity">
      <div class="meter-header">
        <span>⚖️ Wet Mass</span>
        <span class="meter-status-pill">${massViolated ? '⚠️ HEAVY' : (cap ? 'OK' : 'NO RKT')}</span>
      </div>
      <div class="meter-value-row">
        <span class="meter-val">${wet} kg</span>
        <span class="meter-limit">/ ${cap ? `${cap} kg` : '—'}</span>
      </div>
      <div class="meter-progress">
        <div class="meter-fill" style="width: ${massFill}%;"></div>
      </div>
    </div>

    <!-- Power Meter -->
    <div class="meter-card ${powerViolated ? 'violated' : (powerWarn ? 'warning' : '')}" title="Generated electrical power vs subsystem demand">
      <div class="meter-header">
        <span>⚡ Power</span>
        <span class="meter-status-pill">${powerViolated ? '⚠️ DEFICIT' : (powerWarn ? '⚠️ LOW' : 'OK')}</span>
      </div>
      <div class="meter-value-row">
        <span class="meter-val">${pGen}W</span>
        <span class="meter-limit">/ ${pUsed}W req</span>
      </div>
      <div class="meter-progress">
        <div class="meter-fill" style="width: ${powerFill}%;"></div>
      </div>
    </div>

    <!-- Delta-V Meter -->
    <div class="meter-card ${dvViolated ? 'violated' : (dvWarn ? 'warning' : '')}" title="Available velocity change Δv vs trajectory requirement">
      <div class="meter-header">
        <span>🚀 Delta-V</span>
        <span class="meter-status-pill">${dvViolated ? '⚠️ SHORT' : (dvWarn ? '⚠️ TIGHT' : 'OK')}</span>
      </div>
      <div class="meter-value-row">
        <span class="meter-val">${dv} km/s</span>
        <span class="meter-limit">/ ${dvNeeded} req</span>
      </div>
      <div class="meter-progress">
        <div class="meter-fill" style="width: ${dvFill}%;"></div>
      </div>
    </div>

    <!-- Data Meter -->
    <div class="meter-card ${dataWarn ? 'warning' : ''}" title="Instrument generation rate vs downlink capacity">
      <div class="meter-header">
        <span>📡 Downlink</span>
        <span class="meter-status-pill">${dataWarn ? '⚠️ CHOKED' : 'OK'}</span>
      </div>
      <div class="meter-value-row">
        <span class="meter-val">${dl} GB/d</span>
        <span class="meter-limit">/ ${gen} gen</span>
      </div>
      <div class="meter-progress">
        <div class="meter-fill" style="width: ${dataFill}%;"></div>
      </div>
    </div>
  `;
}

/**
 * Screen router that injects current screen HTML and attaches event handlers.
 */
function renderScreen(state) {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Clear running simulation timers if leaving sim screen
  if (state.screen !== 'sim') {
    if (simInterval) clearInterval(simInterval);
    if (orbitAnimFrame) cancelAnimationFrame(orbitAnimFrame);
  }

  switch (state.screen) {
    case 'title':
      renderTitleScreen(main, state);
      break;
    case 'mission':
      renderMissionScreen(main, state);
      break;
    case 'design':
      renderDesignScreen(main, state);
      break;
    case 'launcher':
      renderLauncherScreen(main, state);
      break;
    case 'review':
      renderReviewScreen(main, state);
      break;
    case 'sim':
      renderSimScreen(main, state);
      break;
    case 'results':
      renderResultsScreen(main, state);
      break;
    default:
      renderTitleScreen(main, state);
  }
}

/**
 * Screen 1: Title & Pitch Screen
 */
function renderTitleScreen(main, state) {
  main.innerHTML = `
    <div class="title-hero">
      <div class="hero-badge">NASA Space Apps Challenge 2026</div>
      <h2 class="hero-title">Space Mission Design Game</h2>
      <p class="hero-subtitle">
        Can you balance the merciless physics of deep space? Choose your destination, configure your spacecraft subsystems, manage mass, power, and bandwidth, and launch your mission into the solar system.
      </p>

      <div class="hero-actions">
        <button id="btn-start-game" class="btn btn-primary btn-lg">
          <span class="icon" aria-hidden="true">🚀</span> Choose Destination Mission
        </button>
        <button id="btn-hero-how" class="btn btn-secondary btn-lg">
          <span class="icon" aria-hidden="true">📖</span> Mission Rules & Physics
        </button>
      </div>

      <div class="hero-stats-grid">
        <div class="stat-box">
          <div class="icon">🌍</div>
          <h4>Earth Observer</h4>
          <p>700 km Sun-synchronous. High downlink, zero transfer Δv, tight budget.</p>
          ${state.bestScores['leo'] ? `<div class="card-badge" style="margin-top:6px; color:#38bdf8;">Best: ${state.bestScores['leo']}/100</div>` : ''}
        </div>
        <div class="stat-box">
          <div class="icon">🌕</div>
          <h4>Lunar Mapper</h4>
          <p>4.0 km/s transfer burn. Moderate link loss, high science potential.</p>
          ${state.bestScores['moon'] ? `<div class="card-badge" style="margin-top:6px; color:#38bdf8;">Best: ${state.bestScores['moon']}/100</div>` : ''}
        </div>
        <div class="stat-box">
          <div class="icon">🔴</div>
          <h4>Mars Climate Orbiter</h4>
          <p>1.52 AU distance. Extreme link loss, solar drop-off, 5.5 km/s Δv.</p>
          ${state.bestScores['mars'] ? `<div class="card-badge" style="margin-top:6px; color:#38bdf8;">Best: ${state.bestScores['mars']}/100</div>` : ''}
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-start-game')?.addEventListener('click', () => {
    go(state, 'mission');
  });

  document.getElementById('btn-hero-how')?.addEventListener('click', () => {
    document.getElementById('tutorial-modal')?.classList.remove('hidden');
  });
}

/**
 * Screen 2: Mission Selector
 */
function renderMissionScreen(main, state) {
  const cardsHtml = MISSIONS.map(m => {
    const isSelected = state.mission && state.mission.id === m.id;
    const best = state.bestScores[m.id];
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-mission-id="${m.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${m.icon}</span>
            <div>
              <div class="card-title">${m.name}</div>
              <div class="card-badge">${m.destination}</div>
            </div>
          </div>
          ${best ? `<span class="card-badge" style="color:var(--accent-cyan);">Best: ${best}</span>` : ''}
        </div>

        <div class="card-body">
          <p>${m.description}</p>
          <div class="real-world-note">${m.realInspiration}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Budget</span>
              <span class="stat-val">$${m.budget}M</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Δv Needed</span>
              <span class="stat-val">${m.deltaVNeeded > 0 ? `${m.deltaVNeeded} km/s` : '0 (Direct)'}</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Distance</span>
              <span class="stat-val">${m.sunDistanceAU} AU</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Duration</span>
              <span class="stat-val">${m.durationDays} days</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Min Science</span>
              <span class="stat-val">${m.minScience} pts</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Min Data</span>
              <span class="stat-val">${m.minDataGb} GB</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  main.innerHTML = `
    <div class="screen-header">
      <div class="screen-badge">Step 1 of 4</div>
      <h2 class="screen-title">Select Mission Objective</h2>
      <p class="screen-desc">Each planetary destination imposes radical differences in solar radiation, RF link attenuation, and orbital mechanics.</p>
    </div>

    <div class="cards-grid">
      ${cardsHtml}
    </div>

    <div class="stepper-nav">
      <button id="btn-mission-back" class="btn btn-secondary">
        ← Back to Title
      </button>
      <button id="btn-mission-next" class="btn btn-primary" ${!state.mission ? 'disabled' : ''}>
        Configure Spacecraft Subsystems →
      </button>
    </div>
  `;

  // Attach selection handlers
  main.querySelectorAll('.card-item[data-mission-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-mission-id');
      const mission = MISSIONS.find(m => m.id === id);
      if (mission) {
        state.mission = mission;
        go(state, 'design');
      }
    });
  });

  document.getElementById('btn-mission-back')?.addEventListener('click', () => {
    go(state, 'title');
  });

  document.getElementById('btn-mission-next')?.addEventListener('click', () => {
    if (state.mission) go(state, 'design');
  });
}

/**
 * Screen 3: Spacecraft Design (Tabs: Bus, Power, Comms, Propulsion, Instruments)
 */
function renderDesignScreen(main, state) {
  const tabs = [
    { id: 'bus', label: '1. Bus', selected: !!state.bus },
    { id: 'power', label: '2. Power', selected: !!state.power },
    { id: 'comms', label: '3. Comms', selected: !!state.comms },
    { id: 'propulsion', label: '4. Propulsion', selected: !!state.propulsion },
    { id: 'instruments', label: '5. Instruments', selected: state.instruments && state.instruments.length > 0 }
  ];

  const tabsHtml = tabs.map(t => `
    <button class="tab-btn ${state.designTab === t.id ? 'active' : ''}" data-tab="${t.id}">
      <span>${t.label}</span>
      <span class="tab-indicator-badge">${t.selected ? '✓' : '—'}</span>
    </button>
  `).join('');

  let cardsHtml = '';
  if (state.designTab === 'bus') {
    cardsHtml = renderBusCards(state);
  } else if (state.designTab === 'power') {
    cardsHtml = renderPowerCards(state);
  } else if (state.designTab === 'comms') {
    cardsHtml = renderCommsCards(state);
  } else if (state.designTab === 'propulsion') {
    cardsHtml = renderPropulsionCards(state);
  } else if (state.designTab === 'instruments') {
    cardsHtml = renderInstrumentCards(state);
  }

  main.innerHTML = `
    <div class="screen-header">
      <div class="screen-badge">Step 2 of 4 · Target: ${state.mission ? state.mission.name : 'Unknown'}</div>
      <h2 class="screen-title">Design Spacecraft Subsystems</h2>
      <p class="screen-desc">Select platform bus, power generation, telecommunications, propulsion, and scientific instruments.</p>
    </div>

    <!-- Subsystem Tabs -->
    <nav class="design-tabs-nav" aria-label="Subsystem Tabs">
      ${tabsHtml}
    </nav>

    <!-- Cards Grid for active tab -->
    <div class="cards-grid">
      ${cardsHtml}
    </div>

    <!-- Propellant Slider Panel (shown under propulsion tab or always on design screen) -->
    <div class="propellant-control-panel">
      <div class="slider-header">
        <h3>
          <span>⛽ Propellant Tank:</span>
          <span class="slider-val-readout">${state.propellantKg} kg</span>
        </h3>
        <span class="meter-status-pill" style="font-family:var(--font-mono);">
          Generated Δv: <strong>${deltaV(state)} km/s</strong> (Req: ${state.mission ? state.mission.deltaVNeeded : 0} km/s)
        </span>
      </div>

      <input
        type="range"
        id="propellant-slider"
        class="propellant-slider"
        min="0"
        max="5000"
        step="25"
        value="${state.propellantKg}"
        aria-label="Spacecraft propellant mass in kilograms"
      />

      <div class="slider-presets">
        <span style="font-size:0.8rem; color:var(--text-dim); align-self:center;">Presets:</span>
        <button class="btn btn-ghost btn-sm" id="btn-prop-0">Empty (0 kg)</button>
        <button class="btn btn-ghost btn-sm" id="btn-prop-500">+500 kg</button>
        <button class="btn btn-ghost btn-sm" id="btn-prop-1000">+1000 kg</button>
        <button class="btn btn-ghost btn-sm" id="btn-prop-match" style="color:var(--accent-cyan); border-color:var(--accent-cyan);">
          🎯 Match Target Δv
        </button>
        <button class="btn btn-ghost btn-sm" id="btn-prop-max">Max (5000 kg)</button>
      </div>
    </div>

    <div class="stepper-nav">
      <button id="btn-design-back" class="btn btn-secondary">
        ← Missions
      </button>
      <div style="display:flex; gap:8px;">
        <button id="btn-design-next-tab" class="btn btn-ghost">
          Next Tab →
        </button>
        <button id="btn-design-to-launcher" class="btn btn-primary">
          Select Launcher Rocket →
        </button>
      </div>
    </div>
  `;

  // Attach tab switching handlers
  main.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.designTab = btn.getAttribute('data-tab');
      render(state);
    });
  });

  // Attach card selection handlers
  attachCardHandlers(main, state);

  // Propellant Slider handler
  const slider = document.getElementById('propellant-slider');
  slider?.addEventListener('input', (e) => {
    state.propellantKg = parseInt(e.target.value, 10) || 0;
    renderMeters(state);
    // Update live readouts without full DOM wipe for butter-smooth sliding
    const readout = main.querySelector('.slider-val-readout');
    if (readout) readout.textContent = `${state.propellantKg} kg`;
    const dvPill = main.querySelector('.slider-header strong');
    if (dvPill) dvPill.textContent = `${deltaV(state)} km/s`;
  });

  // Presets
  document.getElementById('btn-prop-0')?.addEventListener('click', () => {
    state.propellantKg = 0;
    render(state);
  });
  document.getElementById('btn-prop-500')?.addEventListener('click', () => {
    state.propellantKg = Math.min(5000, state.propellantKg + 500);
    render(state);
  });
  document.getElementById('btn-prop-1000')?.addEventListener('click', () => {
    state.propellantKg = Math.min(5000, state.propellantKg + 1000);
    render(state);
  });
  document.getElementById('btn-prop-max')?.addEventListener('click', () => {
    state.propellantKg = 5000;
    render(state);
  });

  // Auto-tune propellant to match target deltaV
  document.getElementById('btn-prop-match')?.addEventListener('click', () => {
    autoMatchDeltaV(state);
    render(state);
  });

  // Nav buttons
  document.getElementById('btn-design-back')?.addEventListener('click', () => {
    go(state, 'mission');
  });

  document.getElementById('btn-design-next-tab')?.addEventListener('click', () => {
    const tabOrder = ['bus', 'power', 'comms', 'propulsion', 'instruments'];
    const idx = tabOrder.indexOf(state.designTab);
    if (idx < tabOrder.length - 1) {
      state.designTab = tabOrder[idx + 1];
      render(state);
    } else {
      go(state, 'launcher');
    }
  });

  document.getElementById('btn-design-to-launcher')?.addEventListener('click', () => {
    go(state, 'launcher');
  });
}

function autoMatchDeltaV(state) {
  if (!state.mission || !state.propulsion || state.mission.deltaVNeeded <= 0) return;
  const targetDv = state.mission.deltaVNeeded * 1.05; // 5% safe buffer
  const dry = dryMass(state);
  if (dry <= 0) return;
  const isp = state.propulsion.ispSec;
  // deltaV = isp * 9.80665 * ln(wet / dry) / 1000
  // wet / dry = exp(deltaV * 1000 / (isp * 9.80665))
  // wet = dry * exp(...)
  // prop = wet - dry
  const ratio = Math.exp((targetDv * 1000) / (isp * 9.80665));
  const neededProp = Math.ceil(dry * (ratio - 1));
  state.propellantKg = Math.min(5000, Math.max(0, Math.round(neededProp / 25) * 25));
}

function renderBusCards(state) {
  const pMass = payloadMass(state);
  return BUSES.map(b => {
    const isSelected = state.bus && state.bus.id === b.id;
    const overCapacity = pMass > b.maxPayloadKg;
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-select-type="bus" data-id="${b.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${b.icon}</span>
            <div>
              <div class="card-title">${b.name}</div>
              <div class="card-badge">Reliability: ${(b.reliability * 100).toFixed(0)}%</div>
            </div>
          </div>
          ${isSelected ? '<span class="card-badge" style="background:var(--accent-cyan); color:#000;">SELECTED</span>' : ''}
        </div>
        <div class="card-body">
          <p>${b.tooltip}</p>
          <div class="real-world-note">${b.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Dry Mass</span>
              <span class="stat-val">${b.massKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Cost</span>
              <span class="stat-val">$${b.cost}M</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Power Draw</span>
              <span class="stat-val">${b.powerDrawW} W</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Max Payload</span>
              <span class="stat-val" style="color:${overCapacity ? 'var(--accent-rose)' : '#fff'};">${b.maxPayloadKg} kg</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPowerCards(state) {
  const au = state.mission ? state.mission.sunDistanceAU : 1.0;
  return POWER.map(p => {
    const isSelected = state.power && state.power.id === p.id;
    const genW = p.type === 'rtg' ? p.fixedW : Math.round(p.areaM2 * (1361 / (au * au)) * 0.28);
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-select-type="power" data-id="${p.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${p.icon}</span>
            <div>
              <div class="card-title">${p.name}</div>
              <div class="card-badge">${p.type.toUpperCase()}</div>
            </div>
          </div>
          ${isSelected ? '<span class="card-badge" style="background:var(--accent-cyan); color:#000;">SELECTED</span>' : ''}
        </div>
        <div class="card-body">
          <p>${p.tooltip}</p>
          <div class="real-world-note">${p.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Generates @ Target</span>
              <span class="stat-val" style="color:var(--accent-emerald);">${genW} W</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Mass</span>
              <span class="stat-val">${p.massKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Cost</span>
              <span class="stat-val">$${p.cost}M</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Panel Area</span>
              <span class="stat-val">${p.areaM2 > 0 ? `${p.areaM2} m²` : 'N/A (Nuclear)'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCommsCards(state) {
  const loss = state.mission ? state.mission.linkLoss : 1;
  return COMMS.map(c => {
    const isSelected = state.comms && state.comms.id === c.id;
    const dl = Math.round(Math.min(200, (c.txPowerW * c.gain / loss) * 10) * 10) / 10;
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-select-type="comms" data-id="${c.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${c.icon}</span>
            <div>
              <div class="card-title">${c.name}</div>
              <div class="card-badge">Gain: ${c.gain}x</div>
            </div>
          </div>
          ${isSelected ? '<span class="card-badge" style="background:var(--accent-cyan); color:#000;">SELECTED</span>' : ''}
        </div>
        <div class="card-body">
          <p>${c.tooltip}</p>
          <div class="real-world-note">${c.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Downlink @ Target</span>
              <span class="stat-val" style="color:var(--accent-cyan);">${dl} GB/day</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">RF Power</span>
              <span class="stat-val">${c.txPowerW} W</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Mass</span>
              <span class="stat-val">${c.massKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Cost</span>
              <span class="stat-val">$${c.cost}M</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPropulsionCards(state) {
  return PROPULSION.map(p => {
    const isSelected = state.propulsion && state.propulsion.id === p.id;
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-select-type="propulsion" data-id="${p.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${p.icon}</span>
            <div>
              <div class="card-title">${p.name}</div>
              <div class="card-badge">Isp: ${p.ispSec}s</div>
            </div>
          </div>
          ${isSelected ? '<span class="card-badge" style="background:var(--accent-cyan); color:#000;">SELECTED</span>' : ''}
        </div>
        <div class="card-body">
          <p>${p.tooltip}</p>
          <div class="real-world-note">${p.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Specific Impulse</span>
              <span class="stat-val">${p.ispSec} sec</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Dry Mass</span>
              <span class="stat-val">${p.dryMassKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Cost</span>
              <span class="stat-val">$${p.cost}M</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Extra Power Draw</span>
              <span class="stat-val">${p.extraPowerW} W</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderInstrumentCards(state) {
  return INSTRUMENTS.map(i => {
    const isSelected = state.instruments && state.instruments.some(inst => inst.id === i.id);
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-select-type="instrument" data-id="${i.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${i.icon}</span>
            <div>
              <div class="card-title">${i.name}</div>
              <div class="card-badge">+${i.science} Science</div>
            </div>
          </div>
          <span class="card-badge" style="${isSelected ? 'background:var(--accent-emerald); color:#000;' : ''}">
            ${isSelected ? 'INSTALLED ✓' : '+ INSTALL'}
          </span>
        </div>
        <div class="card-body">
          <p>${i.tooltip}</p>
          <div class="real-world-note">${i.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">Science Yield</span>
              <span class="stat-val" style="color:var(--accent-emerald);">+${i.science} pts</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Daily Data Output</span>
              <span class="stat-val">${i.dataGbPerDay} GB/d</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Mass</span>
              <span class="stat-val">${i.massKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Cost</span>
              <span class="stat-val">$${i.cost}M</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function attachCardHandlers(main, state) {
  main.querySelectorAll('.card-item[data-select-type]').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-select-type');
      const id = card.getAttribute('data-id');

      if (type === 'bus') {
        state.bus = BUSES.find(b => b.id === id);
      } else if (type === 'power') {
        state.power = POWER.find(p => p.id === id);
      } else if (type === 'comms') {
        state.comms = COMMS.find(c => c.id === id);
      } else if (type === 'propulsion') {
        state.propulsion = PROPULSION.find(p => p.id === id);
      } else if (type === 'instrument') {
        const inst = INSTRUMENTS.find(i => i.id === id);
        const idx = state.instruments.findIndex(i => i.id === id);
        if (idx >= 0) {
          state.instruments.splice(idx, 1);
        } else {
          state.instruments.push(inst);
        }
      }

      render(state);
    });
  });
}

/**
 * Screen 4: Launcher Selector
 */
function renderLauncherScreen(main, state) {
  const wet = wetMass(state);
  const cardsHtml = LAUNCHERS.map(l => {
    const isSelected = state.launcher && state.launcher.id === l.id;
    const canLift = wet <= l.payloadToLeoKg;
    return `
      <div class="card-item ${isSelected ? 'selected' : ''}" data-launcher-id="${l.id}" role="button" tabindex="0">
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${l.icon}</span>
            <div>
              <div class="card-title">${l.name}</div>
              <div class="card-badge">Reliability: ${(l.reliability * 100).toFixed(0)}%</div>
            </div>
          </div>
          ${isSelected ? '<span class="card-badge" style="background:var(--accent-cyan); color:#000;">SELECTED</span>' : ''}
        </div>
        <div class="card-body">
          <p>${l.tooltip}</p>
          <div class="real-world-note">${l.realWorld}</div>
          <div class="card-stats-table">
            <div class="stat-entry">
              <span class="stat-label">LEO Payload Capacity</span>
              <span class="stat-val" style="color:${canLift ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${l.payloadToLeoKg} kg</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Launch Cost</span>
              <span class="stat-val">$${l.cost}M</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Success Rate</span>
              <span class="stat-val">${(l.reliability * 100).toFixed(0)}%</span>
            </div>
            <div class="stat-entry">
              <span class="stat-label">Craft Wet Mass</span>
              <span class="stat-val">${wet} kg</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  main.innerHTML = `
    <div class="screen-header">
      <div class="screen-badge">Step 3 of 4</div>
      <h2 class="screen-title">Select Launch Vehicle</h2>
      <p class="screen-desc">Rockets are the single most expensive subsystem. Choose a rocket with enough payload capacity to lift your wet mass into orbital injection.</p>
    </div>

    <div class="cards-grid">
      ${cardsHtml}
    </div>

    <div class="stepper-nav">
      <button id="btn-launcher-back" class="btn btn-secondary">
        ← Back to Spacecraft Design
      </button>
      <button id="btn-launcher-to-review" class="btn btn-primary" ${!state.launcher ? 'disabled' : ''}>
        Review Flight Readiness →
      </button>
    </div>
  `;

  main.querySelectorAll('.card-item[data-launcher-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-launcher-id');
      state.launcher = LAUNCHERS.find(l => l.id === id);
      render(state);
    });
  });

  document.getElementById('btn-launcher-back')?.addEventListener('click', () => {
    go(state, 'design');
  });

  document.getElementById('btn-launcher-to-review')?.addEventListener('click', () => {
    if (state.launcher) go(state, 'review');
  });
}

/**
 * Screen 5: Review & Flight Readiness Review (FRR)
 */
function renderReviewScreen(main, state) {
  const val = validate(state);
  const cost = totalCost(state);
  const dry = dryMass(state);
  const wet = wetMass(state);
  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const dv = deltaV(state);
  const dl = downlinkGbPerDay(state);
  const gen = dailyData(state);
  const sci = scienceScore(state);

  let statusCardHtml = '';
  if (val.errors.length > 0) {
    statusCardHtml = `
      <div class="validation-box errors">
        <h4><span>🚫</span> Launch Prohibited: Critical Flight Constraints Violated (${val.errors.length})</h4>
        <ul class="validation-list">
          ${val.errors.map(err => `<li>${err}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let warningCardHtml = '';
  if (val.warnings.length > 0) {
    warningCardHtml = `
      <div class="validation-box warnings">
        <h4><span>⚠️</span> Engineering Advisories (${val.warnings.length})</h4>
        <ul class="validation-list">
          ${val.warnings.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let nominalCardHtml = '';
  if (val.errors.length === 0 && val.warnings.length === 0) {
    nominalCardHtml = `
      <div class="validation-box nominal">
        <h4><span>✓</span> Flight Readiness Review Nominal</h4>
        <ul class="validation-list">
          <li>All spacecraft engineering margins, power balance, and orbital velocity budgets passed inspection!</li>
        </ul>
      </div>
    `;
  }

  main.innerHTML = `
    <div class="screen-header">
      <div class="screen-badge">Step 4 of 4 · Pre-Flight Review</div>
      <h2 class="screen-title">Flight Readiness Review (FRR)</h2>
      <p class="screen-desc">Verify your spacecraft configuration before ignition. All critical errors must be resolved to authorize countdown.</p>
    </div>

    ${statusCardHtml}
    ${warningCardHtml}
    ${nominalCardHtml}

    <div class="review-summary-grid">
      <!-- Specifications -->
      <div class="spec-list-card">
        <h3>🛰️ Spacecraft Architecture</h3>
        <div class="spec-row">
          <span class="spec-name">Mission</span>
          <span class="spec-val">${state.mission ? state.mission.name : 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Bus Platform</span>
          <span class="spec-val">${state.bus ? state.bus.name : 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Power Generation</span>
          <span class="spec-val">${state.power ? state.power.name : 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Communications</span>
          <span class="spec-val">${state.comms ? state.comms.name : 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Propulsion</span>
          <span class="spec-val">${state.propulsion ? state.propulsion.name : 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Instruments (${state.instruments.length})</span>
          <span class="spec-val">${state.instruments.map(i => i.name).join(', ') || 'None'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Launch Vehicle</span>
          <span class="spec-val">${state.launcher ? state.launcher.name : 'None'}</span>
        </div>
      </div>

      <!-- Engineering Metrics -->
      <div class="spec-list-card">
        <h3>📊 Telemetry & Systems Budget</h3>
        <div class="spec-row">
          <span class="spec-name">Dry Mass / Wet Mass</span>
          <span class="spec-val">${dry} kg / ${wet} kg</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Propellant Mass</span>
          <span class="spec-val">${state.propellantKg} kg</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Launcher Margin</span>
          <span class="spec-val">${state.launcher ? `${state.launcher.payloadToLeoKg - wet} kg reserve` : '—'}</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Total Cost / Budget</span>
          <span class="spec-val">$${cost}M / $${state.mission ? state.mission.budget : 0}M</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Power Generation / Load</span>
          <span class="spec-val">${pGen}W / ${pUsed}W</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Delta-V / Required</span>
          <span class="spec-val">${dv} km/s / ${state.mission ? state.mission.deltaVNeeded : 0} km/s</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Data Downlink / Generated</span>
          <span class="spec-val">${dl} GB/d / ${gen} GB/d</span>
        </div>
        <div class="spec-row">
          <span class="spec-name">Total Science Potential</span>
          <span class="spec-val" style="color:var(--accent-emerald);">${sci} pts (Min: ${state.mission ? state.mission.minScience : 0})</span>
        </div>
      </div>
    </div>

    <div class="stepper-nav">
      <button id="btn-review-back" class="btn btn-secondary">
        ← Edit Spacecraft Design
      </button>
      <button id="btn-authorize-launch" class="btn btn-primary btn-lg" ${!val.isValid ? 'disabled' : ''}>
        🚀 Authorize Ignition & Launch
      </button>
    </div>
  `;

  document.getElementById('btn-review-back')?.addEventListener('click', () => {
    go(state, 'design');
  });

  document.getElementById('btn-authorize-launch')?.addEventListener('click', () => {
    if (val.isValid) {
      state.currentSeed = Date.now();
      state.result = runMission(state, state.currentSeed);
      go(state, 'sim');
    }
  });
}

/**
 * Screen 6: Live Simulation & Telemetry Stream
 */
function renderSimScreen(main, state) {
  if (!state.result) {
    go(state, 'review');
    return;
  }

  const logs = state.result.log;
  let currentLogIndex = 0;
  const speed = state.simSpeed || 1;
  const delay = speed === 2 ? 450 : 900;

  main.innerHTML = `
    <div class="screen-header">
      <div class="screen-badge">Mission Telemetry Link Active</div>
      <h2 class="screen-title">Flight Execution & Operations</h2>
      <p class="screen-desc">Monitoring real-time telemetry, stage separation, radiation weather, and orbital operations.</p>
    </div>

    <div class="sim-container">
      <!-- Orbit Trajectory Canvas -->
      <div class="orbit-visualizer-box">
        <canvas id="orbit-canvas" width="800" height="220" aria-label="Orbital transfer trajectory visualization"></canvas>
      </div>

      <!-- Phase Progress Stepper -->
      <div class="sim-phase-stepper" aria-label="Mission Phases">
        <div class="phase-node active" data-phase="Launch">
          <div class="node-dot">1</div>
          <span class="node-label">Launch</span>
        </div>
        <div class="phase-node" data-phase="Cruise">
          <div class="node-dot">2</div>
          <span class="node-label">Cruise</span>
        </div>
        <div class="phase-node" data-phase="Insertion">
          <div class="node-dot">3</div>
          <span class="node-label">Insertion</span>
        </div>
        <div class="phase-node" data-phase="Operations">
          <div class="node-dot">4</div>
          <span class="node-label">Operations</span>
        </div>
        <div class="phase-node" data-phase="End">
          <div class="node-dot">5</div>
          <span class="node-label">End</span>
        </div>
      </div>

      <!-- Live Flight Director Telemetry Log -->
      <div class="telemetry-log-card">
        <div class="log-header">
          <h3><span>📡</span> Ground Station Downlink Stream</h3>
          <div style="display:flex; gap:8px;">
            <button id="btn-sim-speed" class="btn btn-ghost btn-sm">Speed: ${speed}x</button>
            <button id="btn-sim-skip" class="btn btn-secondary btn-sm">Skip to Results ⏭</button>
          </div>
        </div>
        <div id="sim-log-entries" class="log-entries" role="log" aria-live="polite">
          <!-- Filled dynamically by step timer -->
        </div>
      </div>
    </div>
  `;

  // Start Canvas animation
  startOrbitAnimation(state);

  const entriesContainer = document.getElementById('sim-log-entries');

  function updatePhaseMarkers(phase) {
    const phases = ['Launch', 'Cruise', 'Insertion', 'Operations', 'End'];
    const currentIdx = phases.indexOf(phase);
    main.querySelectorAll('.phase-node').forEach((node, idx) => {
      node.classList.remove('active', 'completed');
      if (idx < currentIdx) node.classList.add('completed');
      else if (idx === currentIdx) node.classList.add('active');
    });
  }

  function appendLogEntry(entry) {
    if (!entriesContainer) return;
    const item = document.createElement('div');
    item.className = `log-entry ${entry.type || 'neutral'}`;
    item.innerHTML = `
      <span class="log-phase-badge">[${entry.phase}]</span>
      <span>${entry.text}</span>
    `;
    entriesContainer.appendChild(item);
    entriesContainer.scrollTop = entriesContainer.scrollHeight;
    updatePhaseMarkers(entry.phase);
  }

  // Reveal log entries step-by-step
  appendLogEntry(logs[0]);
  currentLogIndex = 1;

  simInterval = setInterval(() => {
    if (currentLogIndex < logs.length) {
      appendLogEntry(logs[currentLogIndex]);
      currentLogIndex++;
    } else {
      clearInterval(simInterval);
      setTimeout(() => {
        go(state, 'results');
      }, 1200);
    }
  }, delay);

  // Speed toggle
  document.getElementById('btn-sim-speed')?.addEventListener('click', () => {
    state.simSpeed = state.simSpeed === 1 ? 2 : 1;
    clearInterval(simInterval);
    render(state);
  });

  // Skip directly to results
  document.getElementById('btn-sim-skip')?.addEventListener('click', () => {
    clearInterval(simInterval);
    go(state, 'results');
  });
}

/**
 * 2D Canvas Orbital Visualizer
 */
function startOrbitAnimation(state) {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    if (state.screen !== 'sim') return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Earth at left
    const earthX = 90;
    const earthY = h / 2;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // Earth label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Earth', earthX, earthY + 45);

    // Target Body at right
    const targetX = w - 100;
    const targetY = h / 2;
    const targetName = state.mission ? state.mission.name : 'Target';
    const isMars = state.mission && state.mission.id === 'mars';
    const isMoon = state.mission && state.mission.id === 'moon';

    ctx.beginPath();
    ctx.arc(targetX, targetY, isMoon ? 18 : 24, 0, Math.PI * 2);
    ctx.fillStyle = isMars ? '#dc2626' : (isMoon ? '#94a3b8' : '#0ea5e9');
    ctx.fill();
    ctx.strokeStyle = isMars ? '#f87171' : '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(targetName, targetX, targetY + 42);

    // Transfer orbit path (elliptical curve)
    ctx.beginPath();
    ctx.moveTo(earthX, earthY);
    ctx.quadraticCurveTo(w / 2, 35, targetX, targetY);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Moving spacecraft
    t = (t + 0.005) % 1.0;
    // Quadratic bezier formula
    const p0x = earthX;
    const p0y = earthY;
    const p1x = w / 2;
    const p1y = 35;
    const p2x = targetX;
    const p2y = targetY;

    const probeX = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
    const probeY = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

    // Draw glowing spacecraft dot
    ctx.beginPath();
    ctx.arc(probeX, probeY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw spacecraft symbol
    ctx.font = '14px sans-serif';
    ctx.fillText('🛰️', probeX, probeY - 10);

    orbitAnimFrame = requestAnimationFrame(draw);
  }

  draw();
}

/**
 * Screen 7: Results & Systems Engineering Debrief
 */
function renderResultsScreen(main, state) {
  if (!state.result) {
    go(state, 'mission');
    return;
  }

  const scoreData = calculateScore(state, state.result);
  const gradeClass = `grade-${scoreData.grade.toLowerCase()}`;

  // Save best score to state and localStorage
  if (state.mission) {
    saveBestScore(state.mission.id, scoreData.totalScore);
  }

  const outcomeTitle = state.result.success
    ? (state.result.missionSuccess ? 'MISSION ACCOMPLISHED' : 'PARTIAL MISSION SUCCESS')
    : `MISSION TERMINATED IN ${state.result.phaseFailed?.toUpperCase() || 'FLIGHT'}`;

  const outcomeSub = state.result.success
    ? (state.result.missionSuccess
      ? 'All baseline science objectives and telemetry downlink goals achieved!'
      : 'Spacecraft survived insertion, but missed primary data or science targets.')
    : 'Catastrophic anomaly encountered. Spacecraft lost.';

  // Per-category score bars
  const barsHtml = Object.values(scoreData.breakdown).map(b => {
    const pct = Math.min(100, Math.round((b.points / b.max) * 100));
    return `
      <div class="score-bar-row">
        <div class="score-bar-label-group">
          <span>${b.label}</span>
          <span style="font-family:var(--font-mono); font-weight:700;">${b.points} / ${b.max} pts</span>
        </div>
        <div class="score-bar-track">
          <div class="score-bar-fill" style="width: ${pct}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  // Tips HTML
  const tipsHtml = scoreData.tips.map(tip => `
    <div class="tip-card ${tip.type}">
      <div class="tip-body">
        <div class="tip-title">${tip.category}</div>
        <p>${tip.text}</p>
      </div>
    </div>
  `).join('');

  main.innerHTML = `
    <div class="results-hero">
      <div class="grade-badge-wrap ${gradeClass}">
        <span class="grade-char">${scoreData.grade}</span>
      </div>
      <div class="results-score-total">${scoreData.totalScore} / 100 PTS</div>
      <h2 class="results-verdict">${outcomeTitle}</h2>
      <p style="color:var(--text-muted); font-size:0.95rem; max-width:600px;">${outcomeSub}</p>

      <!-- Category Score Breakdown Bars -->
      <div class="score-bars-card">
        ${barsHtml}
      </div>
    </div>

    <!-- Educational Debrief Tips -->
    <div class="screen-header">
      <div class="screen-badge">Mission Engineering Debrief</div>
      <h3 class="screen-title" style="font-size:1.3rem;">Post-Flight Analysis & Systems Lessons</h3>
    </div>

    <div class="tips-container">
      ${tipsHtml || '<p style="color:var(--text-muted);">No major design penalties incurred. Outstanding aerospace systems execution!</p>'}
    </div>

    <div class="stepper-nav" style="margin-top:32px;">
      <button id="btn-try-again" class="btn btn-secondary btn-lg">
        🔄 Try Again (Same Mission)
      </button>
      <button id="btn-new-mission" class="btn btn-primary btn-lg">
        🌍 Select New Mission →
      </button>
    </div>
  `;

  document.getElementById('btn-try-again')?.addEventListener('click', () => {
    // Keep mission, reset result, go to design
    state.result = null;
    go(state, 'design');
  });

  document.getElementById('btn-new-mission')?.addEventListener('click', () => {
    resetDesign();
    state.mission = null;
    go(state, 'mission');
  });
}
