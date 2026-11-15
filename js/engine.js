/**
 * Space Mission Design Game - Physics & Engineering Engine
 * NASA Space Apps Challenge 2026
 * Pure functions with NO DOM access.
 * All formulas are simplified game approximations inspired by real orbital mechanics & aerospace engineering.
 */

/**
 * Calculates total dry mass (kg) of the spacecraft bus, subsystems, and instruments.
 * dryMass = bus + power + comms + propulsion + instruments
 */
export function dryMass(state) {
  let mass = 0;
  if (state.bus) mass += state.bus.massKg || 0;
  if (state.power) mass += state.power.massKg || 0;
  if (state.comms) mass += state.comms.massKg || 0;
  if (state.propulsion) mass += state.propulsion.dryMassKg || 0;
  if (Array.isArray(state.instruments)) {
    mass += state.instruments.reduce((acc, inst) => acc + (inst.massKg || 0), 0);
  }
  return mass;
}

/**
 * Calculates total payload mass (kg) from instruments.
 */
export function payloadMass(state) {
  if (!Array.isArray(state.instruments)) return 0;
  return state.instruments.reduce((acc, inst) => acc + (inst.massKg || 0), 0);
}

/**
 * Calculates total wet mass (kg) including propellant.
 * wetMass = dryMass + propellantKg
 */
export function wetMass(state) {
  const dry = dryMass(state);
  const prop = Number(state.propellantKg) || 0;
  return dry + prop;
}

/**
 * Calculates total mission cost ($M).
 * cost = parts + launcher + propellantKg * 0.01
 */
export function totalCost(state) {
  let cost = 0;
  if (state.bus) cost += state.bus.cost || 0;
  if (state.power) cost += state.power.cost || 0;
  if (state.comms) cost += state.comms.cost || 0;
  if (state.propulsion) cost += state.propulsion.cost || 0;
  if (Array.isArray(state.instruments)) {
    cost += state.instruments.reduce((acc, inst) => acc + (inst.cost || 0), 0);
  }
  if (state.launcher) cost += state.launcher.cost || 0;
  const prop = Number(state.propellantKg) || 0;
  cost += prop * 0.01;
  return Math.round(cost * 100) / 100;
}

/**
 * Calculates electrical power generated (Watts).
 * solarW = areaM2 * (1361 / sunDistanceAU²) * 0.28 (RTG = fixed watts)
 */
export function powerGenerated(state) {
  if (!state.power) return 0;
  if (state.power.type === 'rtg') {
    return state.power.fixedW || 250;
  }
  const au = (state.mission && state.mission.sunDistanceAU) ? state.mission.sunDistanceAU : 1.0;
  const solarW = (state.power.areaM2 || 0) * (1361 / (au * au)) * 0.28;
  return Math.round(solarW * 10) / 10;
}

/**
 * Calculates electrical power consumed by bus, comms, instruments, and propulsion (Watts).
 * powerUsed = bus + comms + instruments + (ion extra)
 */
export function powerUsed(state) {
  let power = 0;
  if (state.bus) power += state.bus.powerDrawW || 0;
  if (state.comms) power += state.comms.powerDrawW || 0;
  if (Array.isArray(state.instruments)) {
    power += state.instruments.reduce((acc, inst) => acc + (inst.powerDrawW || 0), 0);
  }
  if (state.propulsion && state.propulsion.extraPowerW) {
    power += state.propulsion.extraPowerW;
  }
  return Math.round(power * 10) / 10;
}

/**
 * Tsiolkovsky Rocket Equation calculation for delta-V (km/s).
 * deltaV = ispSec * 9.80665 * ln(wetMass / dryMass) / 1000 (km/s)
 */
export function deltaV(state) {
  if (!state.propulsion) return 0;
  const dry = dryMass(state);
  const wet = wetMass(state);
  if (dry <= 0 || wet <= dry) return 0;

  const isp = state.propulsion.ispSec || 0;
  const dv = (isp * 9.80665 * Math.log(wet / dry)) / 1000;
  return Math.round(dv * 100) / 100;
}

/**
 * Daily telemetry downlink bandwidth limit (GB/day).
 * downlink = min(200, (txPowerW * gain / linkLoss) * 10) (GB/day)
 */
export function downlinkGbPerDay(state) {
  if (!state.comms) return 0;
  const loss = (state.mission && state.mission.linkLoss) ? state.mission.linkLoss : 1;
  const tx = state.comms.txPowerW || 0;
  const gain = state.comms.gain || 0;
  const downlink = Math.min(200, ((tx * gain) / loss) * 10);
  return Math.round(downlink * 100) / 100;
}

/**
 * Total daily data produced by all onboard science instruments (GB/day).
 * dataPerDay = sum of instrument dataGbPerDay
 */
export function dailyData(state) {
  if (!Array.isArray(state.instruments)) return 0;
  const total = state.instruments.reduce((acc, inst) => acc + (inst.dataGbPerDay || 0), 0);
  return Math.round(total * 100) / 100;
}

/**
 * Raw baseline science score from selected instruments.
 */
export function scienceScore(state) {
  if (!Array.isArray(state.instruments)) return 0;
  return state.instruments.reduce((acc, inst) => acc + (inst.science || 0), 0);
}

/**
 * Validates if the launcher has sufficient payload capacity to lift the spacecraft.
 * launchCapacityOk = wetMass <= launcher.payloadToLeoKg
 */
export function launchCapacityOk(state) {
  if (!state.launcher) return false;
  return wetMass(state) <= state.launcher.payloadToLeoKg;
}
