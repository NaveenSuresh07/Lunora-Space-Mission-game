/**
 * Lunora: Mission Architect
 * Systems Engineering Evaluation, Flight Milestone Simulator & Scoring
 */

export function evaluate(design, mission, difficulty = 'engineer') {
  if (!design || !mission) return null;

  const vehicle = design.vehicle;
  const bus = design.bus;
  const power = design.power;
  const comms = design.comms;
  const instruments = Array.isArray(design.instruments) ? design.instruments : [];

  // 1. Difficulty Multipliers
  let budgetMult = 1.0;
  if (difficulty === 'cadet') budgetMult = 1.4;
  else if (difficulty === 'director') budgetMult = 0.85;

  const effectiveBudget = Math.round(mission.budget * budgetMult);

  // 2. Mass Calculations
  const instrumentMass = instruments.reduce((acc, i) => acc + (i.mass || 0), 0);
  const busMass = bus ? bus.mass : 0;
  const powerMass = power ? power.mass : 0;
  const commsMass = comms ? comms.mass : 0;
  const totalMass = busMass + powerMass + commsMass + instrumentMass;

  // 3. Cost Calculations
  const vehicleCost = vehicle ? vehicle.cost : 0;
  const busCost = bus ? bus.cost : 0;
  const powerCost = power ? power.cost : 0;
  const commsCost = comms ? comms.cost : 0;
  const instrumentCost = instruments.reduce((acc, i) => acc + (i.cost || 0), 0);
  const totalCost = vehicleCost + busCost + powerCost + commsCost + instrumentCost;

  // 4. Power Calculations
  const busHouseWatts = bus ? bus.houseWatts : 0;
  const commsWatts = comms ? comms.watts : 0;
  const instrumentWatts = instruments.reduce((acc, i) => acc + (i.watts || 0), 0);
  const powerNeeded = busHouseWatts + commsWatts + instrumentWatts;

  let powerSupply = 0;
  if (power) {
    if (power.id === 'rtg' || power.id === 'rtg_dual' || power.id === 'battery') {
      powerSupply = power.watts;
    } else {
      // Solar diminishes with distance
      powerSupply = Math.round(power.watts * mission.sunPower * 10) / 10;
    }
  }

  // 5. Data & Telemetry Calculations
  const dataGenerated = instruments.reduce((acc, i) => acc + (i.dataMbd || 0), 0);
  const dataDownlink = comms ? comms.downMbd : 0;
  const dataFactor = Math.min(1.0, dataDownlink / Math.max(dataGenerated, 1));

  // 6. Science Score Preview
  const rawScience = instruments.reduce((acc, i) => acc + (i.science || 0), 0);
  const scienceScore = Math.round(rawScience * (0.4 + 0.6 * dataFactor));

  // 7. System Feasibility Checks
  const reachOK = vehicle ? vehicle.reach.includes(mission.target) : false;
  const massOK = vehicle ? totalMass <= vehicle.payload : false;
  const busPayloadOK = bus ? instrumentMass <= bus.maxPayload : false;
  const budgetOK = totalCost <= effectiveBudget;
  const powerOK = powerSupply >= powerNeeded;
  const landingOK = !mission.landing || (bus && bus.hasLander);
  const hasInstruments = instruments.length > 0;

  // Check if sample arm is equipped without a lander
  const armNeedsLanderOK = !instruments.some(i => i.needsLander) || (bus && bus.hasLander);

  const checks = {
    reach: reachOK,
    mass: massOK,
    busPayload: busPayloadOK,
    budget: budgetOK,
    power: powerOK,
    landing: landingOK,
    instruments: hasInstruments,
    armLander: armNeedsLanderOK
  };

  const isLaunchReady = reachOK && massOK && busPayloadOK && budgetOK && powerOK && landingOK && hasInstruments && armNeedsLanderOK;

  // 8. Flight Success Probability (%)
  const vRel = vehicle ? vehicle.reliability : 0.90;
  const powerRatio = powerNeeded > 0 ? Math.min(1.0, powerSupply / powerNeeded) : 1.0;
  const margin = effectiveBudget > 0 ? Math.max(0, (effectiveBudget - totalCost) / effectiveBudget) : 0;

  let successP = vRel * (powerOK ? 1.0 : (0.4 + 0.4 * powerRatio)) * (0.9 + Math.min(0.1, margin));
  if (difficulty === 'cadet') {
    successP = Math.min(0.99, successP + 0.08);
  } else if (difficulty === 'director') {
    successP = Math.max(0.50, successP - 0.05);
  }

  const successPercentage = Math.round(successP * 100);

  // 9. Identify Primary Blocker for Guidance
  let primaryBlocker = null;
  if (!reachOK) {
    primaryBlocker = `${vehicle ? vehicle.name : 'Rocket'} cannot reach ${mission.targetName.split(' ')[0]}. Select a larger launcher.`;
  } else if (!massOK) {
    primaryBlocker = `Spacecraft mass (${totalMass} kg) exceeds rocket capacity (${vehicle.payload} kg).`;
  } else if (!busPayloadOK) {
    primaryBlocker = `Instruments (${instrumentMass} kg) exceed ${bus.name} limit (${bus.maxPayload} kg).`;
  } else if (!powerOK) {
    primaryBlocker = `Power deficit: Generating ${powerSupply}W < ${powerNeeded}W needed.`;
  } else if (!budgetOK) {
    primaryBlocker = `Over budget: $${totalCost}M exceeds $${effectiveBudget}M limit.`;
  } else if (!landingOK) {
    primaryBlocker = `Mission target requires a planetary Lander Bus!`;
  } else if (!armNeedsLanderOK) {
    primaryBlocker = `Sample Arm requires a Lander Bus to operate on the surface.`;
  } else if (!hasInstruments) {
    primaryBlocker = `No scientific instruments equipped.`;
  }

  return {
    checks,
    isLaunchReady,
    primaryBlocker,
    mass: totalMass,
    instrumentMass,
    maxPayload: bus ? bus.maxPayload : 100,
    vehiclePayload: vehicle ? vehicle.payload : 500,
    cost: totalCost,
    budget: effectiveBudget,
    rawBudget: mission.budget,
    powerNeeded,
    powerSupply,
    dataGenerated,
    dataDownlink,
    dataFactor,
    rawScience,
    scienceScore,
    successPercentage,
    successP
  };
}

/**
 * Watchable Flight Simulator: Generates milestones and outcomes
 */
export function simulateFlight(design, mission, evaluation, difficulty = 'engineer') {
  const milestones = [
    { id: 1, name: 'Liftoff & Atmospheric Ascent', icon: '🚀', duration: 4 },
    { id: 2, name: 'Stage Separation & Parking Orbit', icon: '🌍', duration: 4 },
    { id: 3, name: 'Deep Space Transit & Solar Alignment', icon: '☀️', duration: 5 },
    { id: 4, name: mission.landing ? 'Atmospheric Entry & Touchdown' : 'Planetary Orbital Insertion', icon: mission.landing ? '🪂' : '🪐', duration: 5 },
    { id: 5, name: 'Science Operations & DSN Telemetry Stream', icon: '📡', duration: 6 }
  ];

  const roll = Math.random();
  let survived = true;
  let failedMilestoneIndex = -1;
  let failureReason = '';

  // In Cadet mode, no random failure rolls if design passed all checks!
  if (difficulty !== 'cadet') {
    if (roll > evaluation.successP) {
      survived = false;
      // Fail at launch, cruise, or landing
      const stageRoll = Math.random();
      if (stageRoll < 0.25) {
        failedMilestoneIndex = 0;
        failureReason = 'Booster combustion anomaly during ascent stage.';
      } else if (stageRoll < 0.6) {
        failedMilestoneIndex = 2;
        failureReason = 'Loss of attitude control and thermal power brownout in deep space.';
      } else {
        failedMilestoneIndex = 3;
        failureReason = mission.landing
          ? 'Descent thruster cutoff anomaly during touchdown.'
          : 'Retro-fire timing skipped orbital capture into deep space.';
      }
    }
  }

  // Bonus Goal Assessment
  let bonusAchieved = false;
  if (mission.id === 1 && design.instruments.length >= 2) {
    bonusAchieved = true;
  } else if (mission.id === 2 && (evaluation.budget - evaluation.cost) >= 15) {
    bonusAchieved = true;
  } else if (mission.id === 3 && design.instruments.some(i => i.id === 'arm') && design.instruments.some(i => i.id === 'radar')) {
    bonusAchieved = true;
  } else if (mission.id === 4 && evaluation.scienceScore >= 80 && design.comms && design.comms.id === 'high') {
    bonusAchieved = true;
  }

  // Star Rating Calculation:
  // 1 Star: Mission successfully launched
  // 2 Stars: Primary objective met and operations achieved
  // 3 Stars: Objective met + under budget + bonus goal achieved
  let stars = 0;
  if (survived) {
    stars = 2;
    if (evaluation.cost <= evaluation.budget && bonusAchieved) {
      stars = 3;
    }
  } else if (failedMilestoneIndex > 0) {
    stars = 1; // Launched and reached partial flight
  }

  // 1000-Point Score:
  // Base Science: up to 600 pts
  // Budget leftover: up to 200 pts
  // Reliability margin: up to 100 pts
  // Bonus goal: 100 pts
  let totalScore = 0;
  if (survived) {
    const maxMissionSci = (mission.id === 1 ? 30 : (mission.id === 2 ? 50 : (mission.id === 3 ? 80 : 100)));
    const sciRatio = Math.min(1.0, evaluation.scienceScore / maxMissionSci);
    const sciPts = Math.round(sciRatio * 600);
    const budgetPct = Math.max(0, (evaluation.budget - evaluation.cost) / evaluation.budget);
    const budgetPts = Math.round(budgetPct * 200);
    const marginPts = Math.round((evaluation.successP - 0.7) * 333);
    const bonusPts = bonusAchieved ? 100 : 0;
    totalScore = Math.max(100, Math.min(1000, sciPts + budgetPts + marginPts + bonusPts));
  } else {
    totalScore = Math.round(failedMilestoneIndex * 60 + 40);
  }

  // Tailored Aerospace Recommendations
  const hints = [];
  if (!survived) {
    hints.push(`Flight Incident: ${failureReason}`);
    if (evaluation.cost > evaluation.budget * 0.95) {
      hints.push('Budget was stretched tight. Allocating a 10% contingency reserve improves flight resilience.');
    } else {
      hints.push('Consider choosing a launch vehicle with higher statistical reliability (e.g. Titan-X).');
    }
  } else {
    if (evaluation.dataFactor < 0.85) {
      hints.push(`Telemetry Bottleneck: Instruments produce ${evaluation.dataGenerated} Mb/day, but antenna downlinks ${evaluation.dataDownlink} Mb/day. Upgrading to a Medium or High-Gain dish recovers lost science.`);
    }
    if (evaluation.powerSupply > evaluation.powerNeeded * 1.8) {
      hints.push(`Power Surplus: Generating ${evaluation.powerSupply}W for only ${evaluation.powerNeeded}W draw. You could carry more scientific sensors or switch to a lighter power system.`);
    }
    if (!bonusAchieved) {
      hints.push(`Bonus Objective Missed: ${mission.bonusGoal}. Tweak your hardware allocation to reach 3 stars!`);
    }
    if (hints.length === 0) {
      hints.push('Masterclass engineering execution! All resource margins and scientific targets satisfied.');
    }
  }

  return {
    milestones,
    survived,
    failedMilestoneIndex,
    failureReason,
    stars,
    totalScore,
    bonusAchieved,
    hints,
    nasaFact: mission.nasaFact
  };
}
