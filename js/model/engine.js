/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Engineering & Physics Engine (Pure Functions)
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

export function payloadMass(state) {
  if (!Array.isArray(state.instruments)) return 0;
  return state.instruments.reduce((acc, inst) => acc + (inst.massKg || 0), 0);
}

export function wetMass(state) {
  return dryMass(state) + (Number(state.propellantKg) || 0);
}

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
  cost += (Number(state.propellantKg) || 0) * 0.01;
  return Math.round(cost * 100) / 100;
}

export function powerGenerated(state) {
  if (!state.power) return 0;
  if (state.power.type === 'rtg') {
    return state.power.fixedW || 250;
  }
  const au = state.mission ? state.mission.sunDistanceAU : 1.0;
  const watts = (state.power.areaM2 || 0) * (1361 / (au * au)) * 0.28;
  return Math.round(watts * 10) / 10;
}

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

export function deltaV(state) {
  if (!state.propulsion) return 0;
  const dry = dryMass(state);
  const wet = wetMass(state);
  if (dry <= 0 || wet <= dry) return 0;
  const isp = state.propulsion.ispSec || 0;
  const dv = (isp * 9.80665 * Math.log(wet / dry)) / 1000;
  return Math.round(dv * 100) / 100;
}

export function downlinkGbPerDay(state) {
  if (!state.comms) return 0;
  const loss = state.mission ? state.mission.linkLoss : 1;
  const dl = Math.min(200, ((state.comms.txPowerW * state.comms.gain) / loss) * 10);
  return Math.round(dl * 100) / 100;
}

export function dailyData(state) {
  if (!Array.isArray(state.instruments)) return 0;
  const total = state.instruments.reduce((acc, inst) => acc + (inst.dataGbPerDay || 0), 0);
  return Math.round(total * 100) / 100;
}

export function scienceScore(state) {
  if (!Array.isArray(state.instruments)) return 0;
  return state.instruments.reduce((acc, inst) => acc + (inst.science || 0), 0);
}

export function launchCapacityOk(state) {
  if (!state.launcher) return false;
  return wetMass(state) <= state.launcher.payloadToLeoKg;
}

/**
 * Maps the static engineering design to real-time arcade gameplay parameters.
 */
export function makeFlightStats(state) {
  const bus = state.bus || { hearts: 3 };
  const hearts = bus.hearts || 3;
  const dry = dryMass(state);
  const isIon = state.propulsion && state.propulsion.id === 'ion';

  // Move speed in Cruise (px/sec): base 70, slowed by heavy dry mass or ion thruster
  const moveSpeed = Math.round(70 * Math.max(0.5, Math.min(1.0, 1 - dry / 6000)) * (isIon ? 0.7 : 1.0));

  // Fuel %: 100% = target deltaV achieved
  const dv = deltaV(state);
  const dvNeeded = state.mission ? state.mission.deltaVNeeded : 0;
  const fuelPct = dvNeeded > 0 ? Math.min(120, Math.round((100 * dv) / dvNeeded)) : 100;

  // Power %: generation vs demand
  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const powerPct = pUsed > 0 ? Math.min(150, Math.round((100 * pGen) / pUsed)) : 100;

  // Insertion timing bar green-zone width (percent of bar width 8% - 50%)
  let insertionZonePct = 50;
  if (dvNeeded > 0) {
    const margin = dv / dvNeeded;
    insertionZonePct = Math.max(8, Math.min(50, Math.round(10 + 40 * (margin - 1) * 5)));
  }

  // Downlink packets per second in Ops
  const dlGb = downlinkGbPerDay(state);
  const downlinkPps = Math.max(0.3, Math.round((dlGb / 10) * 10) / 10);

  return {
    hearts,
    maxHearts: hearts,
    moveSpeed,
    fuelPct,
    powerPct,
    insertionZonePct,
    instruments: Array.isArray(state.instruments) ? [...state.instruments] : [],
    bufferSize: 20,
    downlinkPps
  };
}
