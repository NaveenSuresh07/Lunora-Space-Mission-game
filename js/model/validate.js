/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Flight Readiness Validator (Pure Functions)
 */

import {
  dryMass,
  wetMass,
  payloadMass,
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData,
  launchCapacityOk
} from './engine.js';

export function validate(state) {
  const errors = [];
  const warnings = [];

  if (!state.mission) errors.push('No mission selected');
  if (!state.bus) errors.push('No bus platform');
  if (!state.power) errors.push('No power system');
  if (!state.comms) errors.push('No antenna');
  if (!state.propulsion) errors.push('No engine');
  if (!Array.isArray(state.instruments) || state.instruments.length === 0) {
    errors.push('No instruments selected');
  }
  if (!state.launcher) errors.push('No rocket selected');

  const pMass = payloadMass(state);
  if (state.bus && pMass > state.bus.maxPayloadKg) {
    errors.push(`Payload (${pMass}kg) > Bus max (${state.bus.maxPayloadKg}kg)`);
  }

  const cost = totalCost(state);
  if (state.mission && cost > state.mission.budget) {
    errors.push(`Cost ($${cost}M) > Budget ($${state.mission.budget}M)`);
  }

  const wet = wetMass(state);
  if (state.launcher && !launchCapacityOk(state)) {
    errors.push(`Wet mass (${wet}kg) > Rocket (${state.launcher.payloadToLeoKg}kg)`);
  }

  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  if (state.power && pGen < pUsed) {
    errors.push(`Power deficit: ${pGen}W gen < ${pUsed}W used`);
  }

  const dv = deltaV(state);
  if (state.mission && state.mission.deltaVNeeded > 0 && dv < state.mission.deltaVNeeded) {
    errors.push(`Short Δv: ${dv} km/s < ${state.mission.deltaVNeeded} km/s req`);
  }

  // Warnings
  if (state.power && pGen >= pUsed && pGen > 0) {
    const margin = (pGen - pUsed) / pGen;
    if (margin < 0.15) {
      warnings.push(`Low power margin (${Math.round(margin * 100)}%)`);
    }
  }

  if (state.mission && state.mission.deltaVNeeded > 0 && dv >= state.mission.deltaVNeeded) {
    const margin = (dv - state.mission.deltaVNeeded) / state.mission.deltaVNeeded;
    if (margin < 0.10) {
      warnings.push(`Tight Δv margin (${Math.round(margin * 100)}%)`);
    }
  }

  const dl = downlinkGbPerDay(state);
  const gen = dailyData(state);
  if (state.comms && gen > 0 && dl < gen) {
    warnings.push(`Downlink (${dl}GB/d) < Data (${gen}GB/d)`);
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}
