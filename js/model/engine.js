/**
 * Space Mission Design Game: Pixel Arcade v3
 * Physics & Systems Engineering Engine (Pure Functions)
 */

export function dryMass(state) {
  let mass = 0;
  if (state.bus) mass += state.bus.massKg || 0;
  if (state.power) mass += state.power.massKg || 0;
  if (state.battery) mass += state.battery.massKg || 0;
  if (state.comms) mass += state.comms.massKg || 0;
  if (state.adcs) mass += state.adcs.massKg || 0;
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
  if (state.battery) cost += state.battery.cost || 0;
  if (state.comms) cost += state.comms.cost || 0;
  if (state.adcs) cost += state.adcs.cost || 0;
  if (state.propulsion) cost += state.propulsion.cost || 0;
  if (Array.isArray(state.instruments)) {
    cost += state.instruments.reduce((acc, inst) => acc + (inst.cost || 0), 0);
  }
  if (state.launcher) cost += state.launcher.cost || 0;
  cost += (Number(state.propellantKg) || 0) * 0.01;

  // Apply difficulty budget multiplier if applicable
  return Math.round(cost * 100) / 100;
}

export function effectiveBudget(state) {
  if (!state.mission) return 250;
  const mult = (state.difficulty && state.difficulty.budgetMult) ? state.difficulty.budgetMult : 1.0;
  return Math.round(state.mission.budget * mult);
}

export function powerGenerated(state) {
  if (!state.power) return 0;
  if (state.power.type === 'rtg') {
    return state.power.fixedW || 110;
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

export function deltaVNeeded(state) {
  if (!state.mission) return 0;
  if (state.mission.id === 'leo') return 0;
  const mod = (state.orbit && state.orbit.deltaVMod) ? state.orbit.deltaVMod : 0;
  return Math.max(0, Math.round((state.mission.deltaVNeeded + mod) * 10) / 10);
}

export function downlinkGbPerDay(state) {
  if (!state.comms) return 0;
  const loss = state.mission ? state.mission.linkLoss : 1;
  const baseDl = Math.min(200, ((state.comms.txPowerW * state.comms.gain) / loss) * 10);
  const mult = (state.orbit && state.orbit.downlinkMult) ? state.orbit.downlinkMult : 1.0;
  return Math.round(baseDl * mult * 100) / 100;
}

export function dailyData(state) {
  if (!Array.isArray(state.instruments)) return 0;
  const total = state.instruments.reduce((acc, inst) => acc + (inst.dataGbPerDay || 0), 0);
  return Math.round(total * 100) / 100;
}

export function scienceScore(state) {
  if (!Array.isArray(state.instruments)) return 0;
  const raw = state.instruments.reduce((acc, inst) => acc + (inst.science || 0), 0);
  const mult = (state.orbit && state.orbit.sciMult) ? state.orbit.sciMult : 1.0;
  return Math.round(raw * mult);
}

export function launcherCapacity(state) {
  if (!state.launcher) return 0;
  const mult = (state.orbit && state.orbit.capacityMult) ? state.orbit.capacityMult : 1.0;
  return Math.round(state.launcher.payloadToLeoKg * mult);
}

export function launchCapacityOk(state) {
  if (!state.launcher) return false;
  return wetMass(state) <= launcherCapacity(state);
}

/**
 * Schedule formula:
 * schedule = bus.devMonths + max(power, battery, comms, adcs, engine, instruments devMonths) + launcher.leadMonths
 */
export function totalSchedule(state) {
  let busMonths = state.bus ? (state.bus.devMonths || 6) : 6;
  const subsystemMonths = [
    state.power ? state.power.devMonths || 0 : 0,
    state.battery ? state.battery.devMonths || 0 : 0,
    state.comms ? state.comms.devMonths || 0 : 0,
    state.adcs ? state.adcs.devMonths || 0 : 0,
    state.propulsion ? state.propulsion.devMonths || 0 : 0
  ];
  if (Array.isArray(state.instruments)) {
    state.instruments.forEach(i => subsystemMonths.push(i.devMonths || 0));
  }
  const maxSubsystem = Math.max(0, ...subsystemMonths);
  const launcherMonths = state.launcher ? (state.launcher.leadMonths || 4) : 4;

  return busMonths + maxSubsystem + launcherMonths;
}

/**
 * Maps the static engineering design to real-time arcade flight parameters.
 */
export function makeFlightStats(state) {
  const bus = state.bus || { hearts: 3 };
  const hearts = bus.hearts || 3;
  const dry = dryMass(state);
  const isIon = state.propulsion && state.propulsion.id === 'ion';

  // Move speed in Cruise: base 100 px/s, slowed by dry mass or ion engine
  const moveSpeed = Math.round(100 * Math.max(0.5, Math.min(1.0, 1 - dry / 6000)) * (isIon ? 0.7 : 1.0));

  const dv = deltaV(state);
  const need = deltaVNeeded(state);
  const fuelPct = need > 0 ? Math.min(120, Math.round((100 * dv) / need)) : 100;

  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const powerPct = pUsed > 0 ? Math.min(150, Math.round((100 * pGen) / pUsed)) : 100;

  // Insertion timing zone width
  let insertionZonePct = 50;
  if (need > 0) {
    const margin = dv / need;
    const minFloor = (state.difficulty && state.difficulty.id === 'director') ? 12 : 20;
    // Base 35% at dv == need, reaching 50% at 1.25x margin
    insertionZonePct = Math.max(minFloor, Math.min(50, Math.round(35 + 60 * (margin - 1))));
  }

  // Scan window scaling from ADCS and difficulty
  const pointingMult = state.adcs ? (state.adcs.pointingMult || 1.0) : 1.0;
  const diffScanMult = (state.difficulty && state.difficulty.scanWindowMult) ? state.difficulty.scanWindowMult : 1.0;
  const scanWindow = 0.45 * pointingMult * diffScanMult;

  // Battery coverage in eclipse (Rookie gets auto 100% coverage)
  let batteryCover = state.battery ? (state.battery.eclipseCoverage || 0.6) : 0.6;
  if (state.difficulty && state.difficulty.autoSystems) {
    batteryCover = 1.0;
  }

  // Downlink rate
  const dlGb = downlinkGbPerDay(state);
  const downlinkPps = Math.max(0.3, Math.round((dlGb / 10) * 10) / 10);

  const radChance = state.orbit ? (state.orbit.radChance || 0.15) : 0.15;
  const oneWayLightSec = state.mission ? (state.mission.oneWayLightSec || 0) : 0;

  return {
    hearts,
    maxHearts: hearts,
    moveSpeed,
    fuelPct,
    powerPct,
    insertionZonePct,
    scanWindow,
    batteryCover,
    downlinkPps,
    radChance,
    oneWayLightSec,
    instruments: Array.isArray(state.instruments) ? [...state.instruments] : [],
    bufferSize: 20
  };
}
