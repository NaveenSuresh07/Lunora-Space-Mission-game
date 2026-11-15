/**
 * Space Mission Design Game: Pixel Arcade v3
 * Flight Readiness Validator & Team Role Go/No-Go Decision Engine
 */

import {
  dryMass,
  wetMass,
  payloadMass,
  totalCost,
  effectiveBudget,
  powerGenerated,
  powerUsed,
  deltaV,
  deltaVNeeded,
  downlinkGbPerDay,
  dailyData,
  scienceScore,
  launcherCapacity,
  totalSchedule
} from './engine.js';

export function validate(state, difficulty = null) {
  const errors = [];
  const warnings = [];

  const roleVerdicts = {
    planner: { go: true, reason: 'Budget and schedule nominal' },
    engineer: { go: true, reason: 'Power, mass, and propulsion nominal' },
    scientist: { go: true, reason: 'Science payload meets objectives' },
    comms: { go: true, reason: 'Telemetry downlink link budget closed' }
  };

  const budget = effectiveBudget(state);
  const cost = totalCost(state);
  const schedule = totalSchedule(state);
  const deadline = state.mission ? state.mission.deadlineMonths : 24;

  // 1. PLANNER CHECKS
  if (!state.mission) {
    errors.push('No target mission selected');
    roleVerdicts.planner = { go: false, reason: 'No mission selected' };
  } else if (!state.launcher) {
    errors.push('No launch vehicle selected');
    roleVerdicts.planner = { go: false, reason: 'No rocket booster selected' };
  } else if (cost > budget) {
    errors.push(`Cost ($${cost}M) exceeds budget ($${budget}M)`);
    roleVerdicts.planner = { go: false, reason: `Over budget ($${cost}M > $${budget}M)` };
  } else if (schedule > deadline + 6) {
    errors.push(`Schedule (${schedule} mo) misses launch window (deadline ${deadline} mo + 6 mo limit)`);
    roleVerdicts.planner = { go: false, reason: `Missed launch window (${schedule} mo > ${deadline + 6} mo limit)` };
  } else if (schedule > deadline) {
    warnings.push(`Schedule delay (${schedule} mo vs ${deadline} mo deadline)`);
  }

  // 2. ENGINEER CHECKS
  if (!state.bus) {
    errors.push('No bus platform selected');
    roleVerdicts.engineer = { go: false, reason: 'No bus platform selected' };
  } else if (!state.power) {
    errors.push('No electrical power system');
    roleVerdicts.engineer = { go: false, reason: 'No electrical power system' };
  } else if (!state.propulsion) {
    errors.push('No propulsion engine');
    roleVerdicts.engineer = { go: false, reason: 'No propulsion engine' };
  } else {
    const wet = wetMass(state);
    const cap = launcherCapacity(state);
    const pGen = powerGenerated(state);
    const pUsed = powerUsed(state);
    const dv = deltaV(state);
    const dvReq = deltaVNeeded(state);

    if (state.launcher && wet > cap) {
      errors.push(`Wet mass (${wet}kg) exceeds rocket capacity (${cap}kg)`);
      roleVerdicts.engineer = { go: false, reason: `Spacecraft too heavy for rocket (${wet}kg > ${cap}kg)` };
    } else if (pGen < pUsed) {
      errors.push(`Power deficit: generating ${pGen}W < ${pUsed}W used`);
      roleVerdicts.engineer = { go: false, reason: `Subsystem power deficit (${pGen}W < ${pUsed}W)` };
    } else if (dvReq > 0 && dv < dvReq) {
      errors.push(`Short Δv: ${dv} km/s < ${dvReq} km/s required`);
      roleVerdicts.engineer = { go: false, reason: `Insufficient propellant Δv (${dv} < ${dvReq} km/s)` };
    }

    if (pGen >= pUsed && pGen > 0 && (pGen - pUsed) / pGen < 0.15) {
      warnings.push(`Low power margin (${Math.round(((pGen - pUsed) / pGen) * 100)}%)`);
    }
    if (dvReq > 0 && dv >= dvReq && (dv - dvReq) / dvReq < 0.10) {
      warnings.push(`Tight Δv margin (${Math.round(((dv - dvReq) / dvReq) * 100)}%)`);
    }
  }

  // 3. SCIENTIST CHECKS
  if (!Array.isArray(state.instruments) || state.instruments.length === 0) {
    errors.push('At least one instrument required');
    roleVerdicts.scientist = { go: false, reason: 'No science instruments installed' };
  } else {
    const pMass = payloadMass(state);
    const maxPayload = state.bus ? state.bus.maxPayloadKg : 250;
    const sci = scienceScore(state);
    const minSci = state.mission ? state.mission.minScience : 20;

    if (pMass > maxPayload) {
      errors.push(`Payload mass (${pMass}kg) exceeds bus capacity (${maxPayload}kg)`);
      roleVerdicts.scientist = { go: false, reason: `Instruments exceed bus mass limit (${pMass}kg > ${maxPayload}kg)` };
    } else if (sci < minSci) {
      errors.push(`Science score (${sci}) below mission threshold (${minSci})`);
      roleVerdicts.scientist = { go: false, reason: `Science score below goal (${sci} < ${minSci})` };
    }
  }

  // 4. COMMS CHECKS
  if (!state.comms) {
    errors.push('No communications antenna selected');
    roleVerdicts.comms = { go: false, reason: 'No antenna selected' };
  } else {
    const dl = downlinkGbPerDay(state);
    const gen = dailyData(state);
    const minData = state.mission ? state.mission.minDataGb : 600;
    const days = state.mission ? state.mission.durationDays : 180;
    const totalDlCapacity = dl * days;

    if (totalDlCapacity < minData * 0.8) {
      errors.push(`Antenna downlink throughput too low to meet mission data threshold`);
      roleVerdicts.comms = { go: false, reason: `Downlink choked: cannot deliver ${minData}GB` };
    } else if (gen > 0 && dl < gen) {
      warnings.push(`Telemetry bottleneck: instruments collect ${gen}GB/d, downlink is ${dl}GB/d`);
    }
  }

  const isValid = errors.length === 0 &&
    roleVerdicts.planner.go &&
    roleVerdicts.engineer.go &&
    roleVerdicts.scientist.go &&
    roleVerdicts.comms.go;

  return {
    errors,
    warnings,
    roleVerdicts,
    isValid
  };
}
