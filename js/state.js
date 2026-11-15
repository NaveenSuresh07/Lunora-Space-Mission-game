/**
 * Space Mission Design Game - State Management
 * NASA Space Apps Challenge 2026
 */

export const state = {
  screen: 'title', // 'title' | 'mission' | 'design' | 'launcher' | 'review' | 'sim' | 'results'
  designTab: 'bus', // 'bus' | 'power' | 'comms' | 'propulsion' | 'instruments'
  mission: null, // Selected mission object
  bus: null, // Selected bus object
  power: null, // Selected power object
  comms: null, // Selected comms object
  propulsion: null, // Selected propulsion object
  instruments: [], // Array of selected instrument objects
  propellantKg: 0, // Propellant mass in kg (0 - 5000)
  launcher: null, // Selected launcher object
  result: null, // Simulation results and scoring object
  currentSeed: null, // Seed used in simulation
  simSpeed: 1, // 1 = normal (900ms), 2 = fast (450ms)
  showTutorial: false,
  bestScores: {} // { [missionId]: number }
};

// Load saved best scores from localStorage
try {
  const saved = localStorage.getItem('smdg_best_scores');
  if (saved) {
    state.bestScores = JSON.parse(saved);
  }
} catch (e) {
  console.warn('Could not load best scores from localStorage:', e);
}

export function saveBestScore(missionId, score) {
  if (!state.bestScores[missionId] || score > state.bestScores[missionId]) {
    state.bestScores[missionId] = score;
    try {
      localStorage.setItem('smdg_best_scores', JSON.stringify(state.bestScores));
    } catch (e) {
      console.warn('Could not save best score:', e);
    }
  }
}

export function resetDesign() {
  state.bus = null;
  state.power = null;
  state.comms = null;
  state.propulsion = null;
  state.instruments = [];
  state.propellantKg = 0;
  state.launcher = null;
  state.result = null;
  state.designTab = 'bus';
}

export function resetState() {
  state.screen = 'title';
  state.mission = null;
  resetDesign();
}
