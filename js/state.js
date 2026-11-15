/**
 * Lunora: Mission Architect
 * State Management, Undo/Redo Stack & LocalStorage Persistence
 */

import { MISSIONS, VEHICLES, BUSES, POWER, INSTRUMENTS, COMMS } from './data.js';

const STORAGE_KEY = 'lunora_architect_save_v1';

export const state = {
  currentScreen: 'title', // 'title', 'select', 'designer', 'flight', 'debrief', 'codex'
  mission: MISSIONS[0],
  difficulty: 'engineer', // 'cadet', 'engineer', 'director'
  currentStep: 1, // 1: Mission Brief, 2: Launcher, 3: Bus & Power, 4: Instruments, 5: Comms & Review
  unlockedMissionId: 1,
  completedMissions: {}, // { [id]: { score, stars, date } }

  design: {
    vehicle: null,
    bus: null,
    power: null,
    instruments: [],
    comms: null
  },

  history: [],
  ariaTipIndex: 0,
  flightResult: null
};

// Initialize from LocalStorage if available
export function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.unlockedMissionId) state.unlockedMissionId = data.unlockedMissionId;
      if (data.completedMissions) state.completedMissions = data.completedMissions;
      if (data.difficulty) state.difficulty = data.difficulty;
    }
  } catch (e) {
    console.warn('Could not read saved progress', e);
  }
}

export function saveProgress() {
  try {
    const data = {
      unlockedMissionId: state.unlockedMissionId,
      completedMissions: state.completedMissions,
      difficulty: state.difficulty
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save progress', e);
  }
}

export function pushHistory() {
  const snapshot = {
    vehicle: state.design.vehicle ? state.design.vehicle.id : null,
    bus: state.design.bus ? state.design.bus.id : null,
    power: state.design.power ? state.design.power.id : null,
    instruments: state.design.instruments.map(i => i.id),
    comms: state.design.comms ? state.design.comms.id : null
  };
  state.history.push(JSON.stringify(snapshot));
  if (state.history.length > 25) state.history.shift();
}

export function undoDesign() {
  if (state.history.length === 0) return false;
  const raw = state.history.pop();
  const snap = JSON.parse(raw);
  state.design.vehicle = snap.vehicle ? VEHICLES.find(v => v.id === snap.vehicle) : null;
  state.design.bus = snap.bus ? BUSES.find(b => b.id === snap.bus) : null;
  state.design.power = snap.power ? POWER.find(p => p.id === snap.power) : null;
  state.design.instruments = snap.instruments ? snap.instruments.map(id => INSTRUMENTS.find(i => i.id === id)).filter(Boolean) : [];
  state.design.comms = snap.comms ? COMMS.find(c => c.id === snap.comms) : null;
  return true;
}

export function resetDesignForMission(mission) {
  state.mission = mission;
  state.history = [];
  state.design = {
    vehicle: VEHICLES[0],
    bus: BUSES[0],
    power: POWER[1], // small solar
    instruments: [INSTRUMENTS[0]], // camera
    comms: COMMS[0]
  };
  state.currentStep = 1;
  state.ariaTipIndex = 0;
  state.flightResult = null;
}

export function applyRecommendedBuild(mission) {
  pushHistory();
  const rec = mission.recommended;
  if (!rec) return;

  state.design.vehicle = VEHICLES.find(v => v.id === rec.vehicle) || VEHICLES[0];
  state.design.bus = BUSES.find(b => b.id === rec.bus) || BUSES[0];
  state.design.power = POWER.find(p => p.id === rec.power) || POWER[1];
  state.design.instruments = rec.instruments.map(id => INSTRUMENTS.find(i => i.id === id)).filter(Boolean);
  state.design.comms = COMMS.find(c => c.id === rec.comms) || COMMS[0];
}

// Auto-Fix Assistant: Automatically solves current blocker
export function autoFixBlockers(evaluation) {
  pushHistory();
  const checks = evaluation.checks;
  const m = state.mission;

  // 1. If reach is invalid, upgrade rocket
  if (!checks.reach) {
    const validRocket = VEHICLES.find(v => v.reach.includes(m.target));
    if (validRocket) state.design.vehicle = validRocket;
  }

  // 2. If mass exceeds vehicle, upgrade rocket or downgrade bus
  if (!checks.mass) {
    const neededPayload = evaluation.mass;
    const biggerRocket = VEHICLES.find(v => v.payload >= neededPayload && v.reach.includes(m.target));
    if (biggerRocket) {
      state.design.vehicle = biggerRocket;
    } else if (state.design.bus.id === 'heavy' && !m.landing) {
      state.design.bus = BUSES.find(b => b.id === 'medium');
    }
  }

  // 3. If power is deficient, upgrade power system
  if (!checks.power) {
    if (m.target === 'mars' || m.target === 'deep') {
      state.design.power = POWER.find(p => p.id === 'rtg_dual') || POWER.find(p => p.id === 'rtg') || POWER.find(p => p.id === 'solar_l');
    } else {
      state.design.power = POWER.find(p => p.id === 'solar_l') || POWER.find(p => p.id === 'solar_s');
    }
  }

  // 4. If landing required and no lander bus, equip lander bus
  if (!checks.landing && m.landing) {
    state.design.bus = BUSES.find(b => b.hasLander) || BUSES[2];
  }

  // 5. If cost exceeds budget, trim redundant high-cost items
  if (!checks.budget) {
    if (state.design.instruments.length > 2) {
      // Keep only top 2 science instruments
      state.design.instruments.sort((a, b) => b.science - a.science);
      state.design.instruments = state.design.instruments.slice(0, 2);
    }
    if (state.design.comms.id === 'high') {
      state.design.comms = COMMS.find(c => c.id === 'med');
    }
  }
}
