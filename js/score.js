/**
 * Space Mission Design Game - Scoring & Assessment
 * NASA Space Apps Challenge 2026
 * Pure functions with NO DOM access.
 */

import {
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData
} from './engine.js';

/**
 * Computes comprehensive mission score out of 100 points, grade, breakdown, and educational debrief tips.
 */
export function calculateScore(state, result) {
  const mission = state.mission;
  const cost = totalCost(state);
  const pGen = powerGenerated(state);
  const pUsed = powerUsed(state);
  const dv = deltaV(state);
  const dvNeeded = mission ? mission.deltaVNeeded : 0;
  const dlRate = downlinkGbPerDay(state);
  const genRate = dailyData(state);

  // 1. Mission Survival & Execution (40 pts)
  let missionPoints = 0;
  if (result.success) {
    if (result.missionSuccess) {
      missionPoints = 40;
    } else {
      // Spacecraft survived and captured, but fell short of baseline science or telemetry
      missionPoints = 25;
    }
  } else {
    missionPoints = 0; // Destroyed in launch, cruise, or insertion
  }

  // 2. Science Return (25 pts)
  const sciRatio = mission && mission.minScience > 0
    ? Math.min(1.0, (result.science || 0) / mission.minScience)
    : 0;
  const sciencePoints = Math.round(sciRatio * 25 * 10) / 10;

  // 3. Data Downlink Throughput (15 pts)
  const dataRatio = mission && mission.minDataGb > 0
    ? Math.min(1.0, (result.dataGb || 0) / mission.minDataGb)
    : 0;
  const dataPoints = Math.round(dataRatio * 15 * 10) / 10;

  // 4. Budget Efficiency (10 pts)
  let budgetPoints = 0;
  if (mission && mission.budget > 0) {
    const remaining = mission.budget - cost;
    const efficiency = Math.max(0, Math.min(1.0, remaining / mission.budget));
    budgetPoints = Math.round(efficiency * 10 * 10) / 10;
  }

  // 5. Engineering Margins (10 pts)
  let powerMarginOk = false;
  let dvMarginOk = false;
  let marginPoints = 0;

  if (pGen > 0 && pGen >= pUsed) {
    const pMargin = (pGen - pUsed) / pGen;
    if (pMargin >= 0.15) {
      powerMarginOk = true;
      marginPoints += 5;
    }
  }

  if (dvNeeded === 0) {
    dvMarginOk = true;
    marginPoints += 5;
  } else if (dv >= dvNeeded) {
    const dvMargin = (dv - dvNeeded) / dvNeeded;
    if (dvMargin >= 0.10) {
      dvMarginOk = true;
      marginPoints += 5;
    }
  }

  const rawTotal = missionPoints + sciencePoints + dataPoints + budgetPoints + marginPoints;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  // Grade Assignment
  let grade = 'F';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else grade = 'F';

  // Plain-English Educational Tips & Analysis
  const tips = [];

  if (!result.success) {
    if (result.phaseFailed === 'Launch') {
      tips.push({
        type: 'critical',
        category: 'Launch Reliability',
        text: 'Rocket failure: Launch vehicles carry inherent statistical risk. Light or budget boosters save capital but sacrifice flight reliability compared to heavy workhorse launchers.'
      });
    } else if (result.phaseFailed === 'Cruise') {
      tips.push({
        type: 'critical',
        category: 'Space Weather',
        text: 'Solar flare catastrophe: The spacecraft succumbed to intense radiation. Choosing the Large Bus provides radiation-hardened shielding immune to solar flares.'
      });
    } else if (result.phaseFailed === 'Insertion') {
      tips.push({
        type: 'critical',
        category: 'Orbital Mechanics',
        text: 'Flyby failure: Spacecraft lacked sufficient Δv to decelerate into closed orbit. Add more propellant or upgrade to high-Isp propulsion.'
      });
    }
  }

  if (pGen > 0 && (pGen - pUsed) / pGen < 0.15) {
    tips.push({
      type: 'warning',
      category: 'Power Margin',
      text: 'Fragile power margin (<15%): Real missions face solar cell degradation, dust obscuration, and micrometeoroids. A larger array or RTG safeguards against brownouts.'
    });
  }

  if (mission && mission.sunDistanceAU > 1.2 && state.power && state.power.type === 'solar' && state.power.areaM2 < 8) {
    tips.push({
      type: 'info',
      category: 'Inverse-Square Law',
      text: 'Solar drop-off in deep space: Sunlight intensity diminishes with 1/r². At Mars (1.52 AU), panels produce only ~43% of their Earth output. Consider Solar Array L or an RTG.'
    });
  }

  if (dlRate < genRate) {
    tips.push({
      type: 'warning',
      category: 'Communications Bottleneck',
      text: `Telemetry bottleneck: Onboard instruments generated ${genRate} GB/day, but the antenna could only downlink ${dlRate} GB/day. Upgrading to a Medium or High-Gain dish prevents stranded science.`
    });
  }

  if (dvNeeded > 0 && dv >= dvNeeded && (dv - dvNeeded) / dvNeeded < 0.10) {
    tips.push({
      type: 'warning',
      category: 'Propulsion Margin',
      text: 'Razor-thin Δv reserve (<10%): Trajectory correction maneuvers and reaction control dumping require contingency propellant.'
    });
  }

  if (cost > mission.budget * 0.92) {
    tips.push({
      type: 'info',
      category: 'Cost Control',
      text: 'High budget expenditure: Little contingency fund remained. Right-sizing the launch vehicle or bus can optimize cost efficiency.'
    });
  }

  if (state.propulsion && state.propulsion.id === 'ion') {
    tips.push({
      type: 'info',
      category: 'Electric Propulsion',
      text: 'Ion thruster dynamics: Ion drives achieve extraordinary specific impulse (3000s Isp) saving tons of propellant, but their low thrust requires a 120-day spiral transfer that reduces primary science operating days.'
    });
  }

  return {
    totalScore,
    grade,
    breakdown: {
      mission: { points: missionPoints, max: 40, label: 'Mission Survival & Orbit' },
      science: { points: sciencePoints, max: 25, label: 'Scientific Objectives' },
      data: { points: dataPoints, max: 15, label: 'Data Telemetry Return' },
      budget: { points: budgetPoints, max: 10, label: 'Budget Efficiency' },
      margins: { points: marginPoints, max: 10, label: 'Engineering Margins' }
    },
    tips
  };
}
