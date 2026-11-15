/**
 * Space Mission Design Game - Mission Simulation
 * NASA Space Apps Challenge 2026
 * Pure functions with NO DOM access.
 */

import {
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData,
  scienceScore
} from './engine.js';

/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Deterministic for fair balance testing and replayability.
 */
export function mulberry32(seed) {
  let s = Math.floor(seed) >>> 0;
  return function() {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Runs the phase-by-phase mission simulation.
 * Returns { success, science, dataGb, log: [{ phase, text, good, bad, type }], cost, details }
 */
export function runMission(state, seed = Date.now()) {
  const rng = mulberry32(seed);
  const log = [];
  const cost = totalCost(state);

  let powerFactor = 1.0;
  let sciFactor = 1.0;
  let dataFactor = 1.0;

  // --- Phase 1: Launch ---
  log.push({
    phase: 'Launch',
    text: `Liftoff of ${state.launcher.name}! Ascending through dense atmospheric flight...`,
    type: 'neutral'
  });

  const launchRoll = rng();
  if (launchRoll > state.launcher.reliability) {
    log.push({
      phase: 'Launch',
      text: `CRITICAL LAUNCH FAILURE: Booster anomaly during second stage burn (roll: ${(launchRoll * 100).toFixed(1)}% vs reliability: ${(state.launcher.reliability * 100).toFixed(0)}%). Spacecraft lost before achieving orbit.`,
      bad: true,
      type: 'bad'
    });
    return {
      success: false,
      phaseFailed: 'Launch',
      science: 0,
      dataGb: 0,
      log,
      cost,
      seed
    };
  }

  log.push({
    phase: 'Launch',
    text: `Nominal staging and fairing deployment! Spacecraft injected onto translunar / interplanetary trajectory with 100% booster success.`,
    good: true,
    type: 'good'
  });

  // --- Phase 2: Cruise ---
  log.push({
    phase: 'Cruise',
    text: `Spacecraft departs Earth vicinity and begins transit towards ${state.mission.destination}. Solar arrays deployed and attitude aligned.`,
    type: 'neutral'
  });

  // Event A: Micrometeoroid Impact (35% probability)
  if (rng() < 0.35) {
    powerFactor *= 0.85;
    log.push({
      phase: 'Cruise',
      text: `EVENT: High-velocity micrometeoroid collision pierced outer panel layers. Solar array generation degraded by 15%.`,
      bad: true,
      type: 'bad'
    });
  } else {
    log.push({
      phase: 'Cruise',
      text: `Micrometeoroid detector reports benign deep-space environment. Solar arrays operating at nominal efficiency.`,
      good: true,
      type: 'good'
    });
  }

  // Event B: Solar Flare / Coronal Mass Ejection (35% probability)
  if (rng() < 0.35) {
    if (state.bus.id === 'large') {
      log.push({
        phase: 'Cruise',
        text: `EVENT: Severe coronal mass ejection! The Large Bus heavy radiation shielding absorbed the energetic particle storm with zero damage.`,
        good: true,
        type: 'good'
      });
    } else {
      const flareRoll = rng();
      if (flareRoll > state.bus.reliability) {
        log.push({
          phase: 'Cruise',
          text: `CRITICAL FAILURE: Intense solar particle event penetrated light bus shielding, frying the main command avionics. Spacecraft lost in cruise.`,
          bad: true,
          type: 'bad'
        });
        return {
          success: false,
          phaseFailed: 'Cruise',
          science: 0,
          dataGb: 0,
          log,
          cost,
          seed
        };
      } else {
        log.push({
          phase: 'Cruise',
          text: `EVENT: Solar flare detected. Spacecraft bus autonomous fault protection successfully recovered all subsystems without hardware loss.`,
          good: true,
          type: 'good'
        });
      }
    }
  } else {
    log.push({
      phase: 'Cruise',
      text: `Space weather remained calm during transfer. Radiation dosimeters indicate nominal levels.`,
      good: true,
      type: 'good'
    });
  }

  // --- Phase 3: Insertion ---
  log.push({
    phase: 'Insertion',
    text: `Arriving at target. Initiating main engine burn for target orbit capture...`,
    type: 'neutral'
  });

  const dv = deltaV(state);
  const dvNeeded = state.mission.deltaVNeeded || 0;

  if (dv < dvNeeded) {
    log.push({
      phase: 'Insertion',
      text: `MISSION FAILURE: Available delta-V (${dv.toFixed(2)} km/s) insufficient for capture burn (${dvNeeded.toFixed(2)} km/s needed). Spacecraft skipped off atmosphere or escaped into deep heliocentric orbit.`,
      bad: true,
      type: 'bad'
    });
    return {
      success: false,
      phaseFailed: 'Insertion',
      science: 0,
      dataGb: 0,
      log,
      cost,
      seed
    };
  }

  const remainingDv = (dv - dvNeeded).toFixed(2);
  log.push({
    phase: 'Insertion',
    text: `SUCCESSFUL CAPTURE: Orbit insertion burn completed. Expended ${dvNeeded.toFixed(2)} km/s Δv with ${remainingDv} km/s reserve remaining. Spacecraft captured in operational science orbit!`,
    good: true,
    type: 'good'
  });

  // --- Phase 4: Operations ---
  let operatingDays = state.mission.durationDays;
  if (state.propulsion.id === 'ion' && state.mission.id !== 'leo') {
    operatingDays = Math.max(1, state.mission.durationDays - 120);
    log.push({
      phase: 'Operations',
      text: `Low-thrust ion transfer required 120 days of orbital spiraling. Effective science mission duration reduced to ${operatingDays} days.`,
      type: 'neutral'
    });
  } else {
    log.push({
      phase: 'Operations',
      text: `Commencing science survey operations for full planned duration of ${operatingDays} days.`,
      type: 'neutral'
    });
  }

  // Power verification in target operational orbit
  const pGen = powerGenerated(state) * powerFactor;
  const pUsed = powerUsed(state);
  if (pGen < pUsed) {
    sciFactor *= 0.5;
    log.push({
      phase: 'Operations',
      text: `POWER DEFICIT: Available power (${pGen.toFixed(0)}W) is below subsystem demand (${pUsed}W). Mission control forced to duty-cycle instruments; total science output cut by 50%!`,
      bad: true,
      type: 'bad'
    });
  } else {
    log.push({
      phase: 'Operations',
      text: `Power budget healthy: generating ${pGen.toFixed(0)}W vs ${pUsed}W demand (+${(pGen - pUsed).toFixed(0)}W margin). All instruments functioning continuously.`,
      good: true,
      type: 'good'
    });
  }

  // Operations Event A: Antenna Fault (30% probability, Low comms only)
  if (state.comms.id === 'low') {
    if (rng() < 0.30) {
      dataFactor *= 0.75;
      log.push({
        phase: 'Operations',
        text: `EVENT: Thermal cycling degraded Low-Gain antenna feed horn. Downlink throughput reduced by 25%.`,
        bad: true,
        type: 'bad'
      });
    } else {
      log.push({
        phase: 'Operations',
        text: `Low-Gain antenna link maintained baseline link budget.`,
        good: true,
        type: 'good'
      });
    }
  }

  // Operations Event B: Extended Mission / Transient Science (30% probability)
  if (rng() < 0.30) {
    sciFactor *= 1.15;
    log.push({
      phase: 'Operations',
      text: `EVENT: Ground team observed high-priority transient phenomena! Extended observation campaign granted; science returns boosted by +15%!`,
      good: true,
      type: 'good'
    });
  }

  // --- Phase 5: End & Telemetry Harvest ---
  const dlRate = downlinkGbPerDay(state);
  const genRate = dailyData(state);
  const totalGenGb = genRate * operatingDays;
  const totalDlCapGb = dlRate * operatingDays;
  const rawDataGb = Math.min(totalGenGb, totalDlCapGb);
  const finalDataGb = Math.round(rawDataGb * dataFactor * 10) / 10;

  const rawScience = scienceScore(state);
  const finalScience = Math.round(rawScience * sciFactor * 10) / 10;

  const metScience = finalScience >= state.mission.minScience;
  const metData = finalDataGb >= state.mission.minDataGb;
  const missionSuccess = metScience && metData;

  log.push({
    phase: 'End',
    text: `MISSION SUMMARY: Collected ${finalScience} science pts (target: ${state.mission.minScience}), Downlinked ${finalDataGb} GB telemetry (target: ${state.mission.minDataGb} GB).`,
    good: missionSuccess,
    bad: !missionSuccess,
    type: missionSuccess ? 'good' : 'bad'
  });

  return {
    success: true,
    missionSuccess,
    science: finalScience,
    dataGb: finalDataGb,
    operatingDays,
    powerFactor,
    sciFactor,
    dataFactor,
    log,
    cost,
    seed
  };
}
