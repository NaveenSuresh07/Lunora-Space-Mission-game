/**
 * Space Mission Design Game: Pixel Arcade v3
 * NASA Space Apps Scoring & Post-Flight Debrief Tips
 */

import {
  totalCost,
  effectiveBudget,
  powerGenerated,
  powerUsed,
  deltaV,
  deltaVNeeded,
  downlinkGbPerDay,
  dailyData,
  totalSchedule
} from './engine.js';

export function calculateScore(state, flightResult = {}) {
  const mission = state.mission;
  const cost = totalCost(state);
  const budget = effectiveBudget(state);
  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const dv = deltaV(state);
  const dvReq = deltaVNeeded(state);
  const dlRate = downlinkGbPerDay(state);
  const genRate = dailyData(state);
  const schedule = totalSchedule(state);
  const deadline = mission ? mission.deadlineMonths : 24;

  const success = !!flightResult.success;
  const missionSuccess = !!flightResult.missionSuccess;
  const scienceEarned = Number(flightResult.scienceEarned) || 0;
  const dataDelivered = Number(flightResult.dataDelivered) || 0;
  const allGoFirstPoll = !!state.allGoFirstPoll;

  // 1. Mission Performance (30 pts)
  let performancePts = 0;
  if (success) {
    performancePts = missionSuccess ? 30 : 20;
  } else {
    performancePts = 0;
  }

  // 2. Scientific Value (20 pts)
  const targetSci = (mission && mission.minScience) ? mission.minScience : 20;
  const sciRatio = Math.min(1.0, scienceEarned / targetSci);
  const sciencePts = Math.round(sciRatio * 20 * 10) / 10;

  // 3. Data Return (10 pts)
  const targetData = (mission && mission.minDataGb) ? mission.minDataGb : 1000;
  const dataRatio = Math.min(1.0, dataDelivered / targetData);
  const dataPts = Math.round(dataRatio * 10 * 10) / 10;

  // 4. Resource Efficiency (15 pts: budget savings + on-time schedule)
  let budgetScore = 0;
  if (budget > 0) {
    const budgetSaved = Math.max(0, Math.min(1.0, (budget - cost) / budget));
    budgetScore = budgetSaved * 8; // max 8 pts
  }
  let scheduleScore = 0;
  if (schedule <= deadline) {
    scheduleScore = 7; // max 7 pts
  } else if (schedule <= deadline + 3) {
    scheduleScore = 4;
  } else {
    scheduleScore = 1;
  }
  const efficiencyPts = Math.round((budgetScore + scheduleScore) * 10) / 10;

  // 5. Quality of Decisions / Engineering Margins (15 pts)
  let decisionPts = 0;
  if (pGen > 0 && pGen >= pUsed && (pGen - pUsed) / pGen >= 0.15) {
    decisionPts += 5; // Power margin >= 15%
  }
  if (dvReq === 0 || (dv >= dvReq && (dv - dvReq) / dvReq >= 0.10)) {
    decisionPts += 5; // Delta-V margin >= 10%
  }
  if (dlRate >= genRate) {
    decisionPts += 5; // No comms bottleneck
  }

  // 6. Teamwork & Consensus (10 pts)
  let teamworkPts = allGoFirstPoll ? 10 : 5;

  const totalScore = Math.max(0, Math.min(100, Math.round(
    performancePts + sciencePts + dataPts + efficiencyPts + decisionPts + teamworkPts
  )));

  let grade = 'F';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else grade = 'F';

  // Plain-English Flight Recorder Recommendations
  const tips = [];
  const suggestions = [];

  if (!success) {
    if (flightResult.failReason === 'launch') {
      tips.push('Rocket Failure: Launch vehicles have inherent statistical risk. Medium/Heavy boosters carry higher flight reliability.');
      suggestions.push({ category: 'LAUNCHER', text: 'Upgrade to Medium or Heavy booster' });
    } else if (flightResult.failReason === 'cruise') {
      tips.push('Lost in Cruise: Spacecraft was destroyed by deep-space hazards. Large Bus shields against solar flares; dodging keeps probe alive.');
      suggestions.push({ category: 'BUS', text: 'Consider Large Bus for flare immunity' });
    } else if (flightResult.failReason === 'insertion') {
      tips.push('Missed Insertion: Capture burn missed window. Adding propellant widens the green timing zone.');
      suggestions.push({ category: 'FUEL', text: 'Increase propellant to widen timing zone' });
    }
  }

  if (pGen > 0 && (pGen - pUsed) / pGen < 0.15) {
    tips.push('Fragile Power Margin: Under 15% surplus causes instrument brownouts when damaged by micrometeoroids.');
    suggestions.push({ category: 'POWER', text: 'Upgrade solar array or equip an RTG' });
  }

  if (dlRate < genRate) {
    tips.push(`Comms Bottleneck: Generated ${genRate}GB/d but only downlinked ${dlRate}GB/d. Antenna was too weak!`);
    suggestions.push({ category: 'COMMS', text: 'Upgrade to High Gain Dish' });
  }

  if (schedule > deadline) {
    tips.push(`Schedule Overrun: Development took ${schedule} mo vs ${deadline} mo deadline. Choose parts with shorter lead times.`);
    suggestions.push({ category: 'BUS', text: 'Choose subsystems with fewer dev months' });
  }

  if (tips.length === 0) {
    tips.push('Flawless aerospace engineering execution! All resource envelopes respected.');
  }

  return {
    totalScore,
    grade,
    breakdown: {
      performance: { points: performancePts, max: 30, label: 'FLIGHT' },
      science: { points: sciencePts, max: 20, label: 'SCIENCE' },
      data: { points: dataPts, max: 10, label: 'DATA' },
      efficiency: { points: efficiencyPts, max: 15, label: 'RESOURCE' },
      decisions: { points: decisionPts, max: 15, label: 'MARGINS' },
      teamwork: { points: teamworkPts, max: 10, label: 'TEAMWORK' }
    },
    tips,
    suggestions
  };
}
