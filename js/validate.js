/**
 * Space Mission Design Game - Design Validation
 * NASA Space Apps Challenge 2026
 * Pure functions with NO DOM access.
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

/**
 * Validates the current spacecraft design state.
 * Returns { errors: string[], warnings: string[], isValid: boolean }
 * Errors block launch; warnings provide advisory feedback.
 */
export function validate(state) {
  const errors = [];
  const warnings = [];

  // 1. Missing selections (Errors)
  if (!state.mission) {
    errors.push('No target mission selected.');
  }
  if (!state.bus) {
    errors.push('Spacecraft bus platform is missing.');
  }
  if (!state.power) {
    errors.push('Electrical power system is missing.');
  }
  if (!state.comms) {
    errors.push('Communications antenna system is missing.');
  }
  if (!state.propulsion) {
    errors.push('Propulsion system is missing.');
  }
  if (!Array.isArray(state.instruments) || state.instruments.length === 0) {
    errors.push('At least one scientific instrument must be installed.');
  }
  if (!state.launcher) {
    errors.push('Launch vehicle has not been selected.');
  }

  // 2. Physical & engineering constraints (Errors)
  const pMass = payloadMass(state);
  if (state.bus && pMass > state.bus.maxPayloadKg) {
    errors.push(
      `Instrument payload mass (${pMass} kg) exceeds bus capacity (${state.bus.maxPayloadKg} kg).`
    );
  }

  const cost = totalCost(state);
  if (state.mission && cost > state.mission.budget) {
    errors.push(
      `Total mission cost ($${cost}M) exceeds maximum budget ($${state.mission.budget}M).`
    );
  }

  const wet = wetMass(state);
  if (state.launcher && !launchCapacityOk(state)) {
    errors.push(
      `Spacecraft wet mass (${wet} kg) exceeds launcher payload capacity (${state.launcher.payloadToLeoKg} kg).`
    );
  }

  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  if (state.power && pGen < pUsed) {
    errors.push(
      `Power deficit: generating ${pGen} W, but spacecraft subsystems require ${pUsed} W.`
    );
  }

  const dv = deltaV(state);
  if (state.mission && state.mission.deltaVNeeded > 0 && dv < state.mission.deltaVNeeded) {
    errors.push(
      `Insufficient Δv: spacecraft has ${dv} km/s, but mission trajectory requires ${state.mission.deltaVNeeded} km/s.`
    );
  }

  // 3. Advisory Warnings (Do not block launch)
  if (state.power && pGen >= pUsed && pGen > 0) {
    const margin = (pGen - pUsed) / pGen;
    if (margin < 0.15) {
      warnings.push(
        `Low power margin (${Math.round(margin * 100)}%): micrometeoroids, solar flares, or distance could cause brownouts.`
      );
    }
  }

  if (state.mission && state.mission.deltaVNeeded > 0 && dv >= state.mission.deltaVNeeded) {
    const dvReq = state.mission.deltaVNeeded;
    const dvMargin = (dv - dvReq) / dvReq;
    if (dvMargin < 0.10) {
      warnings.push(
        `Tight Δv reserve (${Math.round(dvMargin * 100)}%): trajectory insertion and orbital maintenance burns have almost zero contingency.`
      );
    }
  }

  const dl = downlinkGbPerDay(state);
  const gen = dailyData(state);
  if (state.comms && gen > 0 && dl < gen) {
    warnings.push(
      `Downlink bottleneck: instruments generate ${gen} GB/day, but antenna throughput is limited to ${dl} GB/day.`
    );
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  };
}
