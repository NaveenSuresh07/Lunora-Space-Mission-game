/**
 * Space Mission Design Game: Pixel Arcade v3
 * Dynamic Flight Events & Space Hazards
 */

export const RANDOM_EVENTS = {
  hangar: [
    {
      id: 'budget_cut',
      name: 'CONGRESSIONAL BUDGET TRIM',
      desc: 'Fiscal policy adjustment reduces overall program allocation by 10%.',
      apply(state) {
        if (!state.budgetCutApplied) {
          state.budgetCutApplied = true;
          return 'Mission budget trimmed by 10%!';
        }
        return null;
      }
    }
  ],
  launch: [
    {
      id: 'weather_scrub',
      name: 'UPPER LEVEL WIND SHEAR',
      desc: 'Anvil clouds and wind shear violate launch commit criteria. T-0 scrubbed; +1 month schedule.',
      apply(state) {
        state.weatherScrubMonths = (state.weatherScrubMonths || 0) + 1;
        return 'Launch delayed by 1 month due to spaceport weather scrub!';
      }
    }
  ],
  cruise: [
    {
      id: 'solar_storm',
      name: 'CORONAL MASS EJECTION STORM',
      desc: 'Intense coronal mass ejection incoming. Flare waves accelerate!',
      speedMult: 1.4
    },
    {
      id: 'meteor_shower',
      name: 'COMETARY DEBRIS STREAM',
      desc: 'Spacecraft enters dense dust trail. Micrometeoroid frequency doubled!',
      spawnMult: 2.0
    }
  ],
  ops: [
    {
      id: 'component_anomaly',
      name: 'TRANSIENT SENSOR SEU GLITCH',
      desc: 'Single Event Upset detected in instrument bus. Autonomous recovery requires Precise ADCS or ground upload lag.',
      apply(state) {
        const hasPrecise = state.adcs && state.adcs.id === 'adcs_precise';
        return hasPrecise
          ? 'Precise ADCS autonomously rebooted sensor suite in 1s!'
          : 'Sensor offline 4s waiting for Earth ground command uplink!';
      }
    },
    {
      id: 'science_opportunity',
      name: 'OPPORTUNISTIC TRANSIENT PHENOMENON',
      desc: 'Active cryogenic geyser / volcanic plume detected! Bonus science available.',
      bonusSci: 15
    }
  ]
};

export function triggerPhaseEvent(phase, state) {
  if (!RANDOM_EVENTS[phase]) return null;
  const chance = (state.difficulty && state.difficulty.eventChance) ? state.difficulty.eventChance : 0.5;
  if (Math.random() > chance) return null;

  const pool = RANDOM_EVENTS[phase];
  const ev = pool[Math.floor(Math.random() * pool.length)];
  if (!state.eventsEncountered) state.eventsEncountered = [];
  state.eventsEncountered.push(ev);
  return ev;
}
