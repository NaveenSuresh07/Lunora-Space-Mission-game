/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Scoring & Debrief Tips (Pure Functions)
 */

import {
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData
} from './engine.js';

export function calculateScore(state, flightResult = {}) {
  const mission = state.mission;
  const cost = totalCost(state);
  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const dv = deltaV(state);
  const dvNeeded = mission ? mission.deltaVNeeded : 0;
  const dlRate = downlinkGbPerDay(state);
  const genRate = dailyData(state);

  const success = !!flightResult.success;
  const missionSuccess = !!flightResult.missionSuccess;
  const scienceEarned = Number(flightResult.scienceEarned) || 0;
  const dataDelivered = Number(flightResult.dataDelivered) || 0;

  // 1. Mission Survival & Execution (40 pts)
  let missionPoints = 0;
  if (success) {
    missionPoints = missionSuccess ? 40 : 25;
  } else {
    missionPoints = 0;
  }

  // 2. Science Return (25 pts)
  const targetSci = (mission && mission.minScience) ? mission.minScience : 20;
  const sciRatio = Math.min(1.0, scienceEarned / targetSci);
  const sciencePoints = Math.round(sciRatio * 25 * 10) / 10;

  // 3. Data Downlink (15 pts)
  const targetData = (mission && mission.minDataGb) ? mission.minDataGb : 1000;
  const dataRatio = Math.min(1.0, dataDelivered / targetData);
  const dataPoints = Math.round(dataRatio * 15 * 10) / 10;

  // 4. Budget Efficiency (10 pts)
  let budgetPoints = 0;
  if (mission && mission.budget > 0) {
    const remaining = mission.budget - cost;
    const eff = Math.max(0, Math.min(1.0, remaining / mission.budget));
    budgetPoints = Math.round(eff * 10 * 10) / 10;
  }

  // 5. Engineering Margins (10 pts)
  let marginPoints = 0;
  if (pGen > 0 && pGen >= pUsed && (pGen - pUsed) / pGen >= 0.15) {
    marginPoints += 5;
  }
  if (dvNeeded === 0 || (dv >= dvNeeded && (dv - dvNeeded) / dvNeeded >= 0.10)) {
    marginPoints += 5;
  }

  const rawTotal = missionPoints + sciencePoints + dataPoints + budgetPoints + marginPoints;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  let grade = 'F';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else grade = 'F';

  // Plain-English Debrief Tips
  const tips = [];

  if (!success) {
    if (flightResult.failReason === 'launch') {
      tips.push('Rocket Failure: Launch vehicles have statistical risk. Medium/Heavy boosters carry higher flight reliability.');
    } else if (flightResult.failReason === 'cruise') {
      tips.push('Lost in Cruise: Spacecraft was destroyed by hazards. Choose Large Bus for flare immunity or dodge obstacles!');
    } else if (flightResult.failReason === 'insertion') {
      tips.push('Missed Insertion: Burn missed the capture window. Carry more propellant to widen the green timing zone!');
    } else {
      tips.push('Mission Aborted: Critical flight failure occurred.');
    }
  }

  if (pGen > 0 && (pGen - pUsed) / pGen < 0.15) {
    tips.push('Fragile Power Margin: Under 15% surplus causes instrument brownouts when damaged by micrometeoroids.');
  }

  if (mission && mission.sunDistanceAU > 1.2 && state.power && state.power.type === 'solar' && state.power.areaM2 < 8) {
    tips.push('Solar Drop-Off at Mars: Solar intensity drops with 1/r². Array L or RTG is needed in deep space.');
  }

  if (dlRate < genRate) {
    tips.push(`Comms Bottleneck: Generated ${genRate}GB/d but only downlinked ${dlRate}GB/d. Antenna was too weak!`);
  }

  if (dvNeeded > 0 && dv >= dvNeeded && (dv - dvNeeded) / dvNeeded < 0.10) {
    tips.push('Tight Δv Margin: Barely met orbital requirements, making the insertion timing window very narrow.');
  }

  if (cost > (mission ? mission.budget * 0.92 : 100)) {
    tips.push('Heavy Expenditure: Nearly 100% of capital spent. Downsizing buses or launchers preserves contingency funds.');
  }

  return {
    totalScore,
    grade,
    breakdown: {
      mission: { points: missionPoints, max: 40, label: 'SURVIVAL' },
      science: { points: sciencePoints, max: 25, label: 'SCIENCE' },
      data: { points: dataPoints, max: 15, label: 'DATA' },
      budget: { points: budgetPoints, max: 10, label: 'BUDGET' },
      margins: { points: marginPoints, max: 10, label: 'MARGINS' }
    },
    tips
  };
}
