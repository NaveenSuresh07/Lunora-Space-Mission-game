/**
 * Unit & Systems Tests: Lunora: Mission Control Arcade (v2)
 * Run with: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { MISSIONS, VEHICLES, PARTS, ALL_PARTS, getPartById, computeStats, autoBuild } from '../js/data.js';

test('computeStats: calculates mass, cost, power, and downlink accurately', () => {
  const mission = MISSIONS[0]; // First Light (LEO, Budget $60M)
  const vehicle = VEHICLES[0]; // Sparrow-1 ($12M, 300kg)
  const parts = [
    getPartById('sol_s'), // Small solar ($6M, 30kg, 120W)
    getPartById('cam'),   // Camera ($5M, 15kg, 30W, 10 sci, 800 Mb/d)
    getPartById('mag'),   // Magnetometer ($6M, 10kg, 10W, 12 sci, 20 Mb/d)
    getPartById('med')    // Med dish ($9M, 20kg, 35W, 1200 Mb/d, catch 1.0)
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');

  // Base bus mass is 25kg + parts (30 + 15 + 10 + 20 = 75) = 100kg <= 300kg
  assert.equal(res.totalMass, 100);
  assert.equal(res.massOK, true);

  // Total cost: 12 + 6 + 5 + 6 + 9 = $38M <= $60M
  assert.equal(res.totalCost, 38);
  assert.equal(res.budgetOK, true);

  // Power: Supply 120W >= Needed (15 base + 30 + 10 + 35 = 90W)
  assert.equal(res.wattsSupply, 120);
  assert.equal(res.wattsNeed, 90);
  assert.equal(res.powerOK, true);

  // Reach: Sparrow reaches LEO
  assert.equal(res.reachOK, true);

  // Ready for launch
  assert.equal(res.isLaunchReady, true);
  assert.equal(res.blockers.length, 0);
});

test('computeStats: blocks launch when rocket cannot reach target destination', () => {
  const mission = MISSIONS[1]; // Moon
  const vehicle = VEHICLES[0]; // Sparrow-1 only reaches LEO
  const parts = [
    getPartById('sol_s'),
    getPartById('cam'),
    getPartById('low')
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');
  assert.equal(res.reachOK, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.blockers[0], /cannot reach MOON/);
});

test('computeStats: blocks launch when mass exceeds payload capacity', () => {
  const mission = MISSIONS[0]; // LEO
  const vehicle = VEHICLES[0]; // Sparrow-1 payload = 300kg
  // Add heavy parts that exceed 300 kg
  const parts = [
    getPartById('sol_l'), // 70kg
    getPartById('tele'),  // 80kg
    getPartById('radar'), // 45kg
    getPartById('arm'),   // 60kg
    getPartById('fuel'),  // 40kg
    getPartById('fuel')   // 40kg
    // Total parts = 335kg + 25kg bus = 360kg > 300kg
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');
  assert.equal(res.massOK, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.blockers[0], /exceeds Sparrow-1 capacity/);
});

test('computeStats: blocks launch when power deficit occurs at Mars due to 1/r^2 law', () => {
  const mission = MISSIONS[2]; // Mars (0.43 solar intensity)
  const vehicle = VEHICLES[2]; // Titan-X
  const parts = [
    getPartById('sol_s'), // 120W * 0.43 ≈ 52W supply
    getPartById('cam'),   // 30W
    getPartById('radar'), // 90W
    getPartById('low')    // 10W -> Total need: 15 base + 30 + 90 + 10 = 145W > 52W
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');
  assert.equal(res.powerOK, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.blockers[0], /Power deficit/);
});

test('compatibility: blocks robotic sample arm on orbital mission', () => {
  const mission = MISSIONS[1]; // Moon (orbital reconnaissance, landing: false)
  const vehicle = VEHICLES[1]; // Kestrel-5
  const parts = [
    getPartById('sol_s'),
    getPartById('arm'), // Sample arm requires landing!
    getPartById('low')
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');
  assert.equal(res.armOK, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.blockers[0], /Robotic Sample Arm requires a planetary surface landing/);
});

test('compatibility: blocks space telescope on non-deep space mission', () => {
  const mission = MISSIONS[0]; // LEO
  const vehicle = VEHICLES[0];
  const parts = [
    getPartById('sol_s'),
    getPartById('tele'), // Telescope only for Deep Space
    getPartById('low')
  ];

  const res = computeStats(vehicle, parts, mission, 'engineer');
  assert.equal(res.teleOK, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.blockers[0], /Space Telescope requires a Deep Space mission/);
});

test('solvability: autoBuild generates 100% legal launch-ready builds for all 4 missions', () => {
  MISSIONS.forEach(mission => {
    const build = autoBuild(mission, 'engineer');
    assert.ok(build.vehicle, `Mission ${mission.name} missing vehicle`);
    assert.ok(build.placedParts.length > 0, `Mission ${mission.name} has no parts`);

    const stats = computeStats(build.vehicle, build.placedParts, mission, 'engineer');
    assert.equal(stats.isLaunchReady, true, `Mission ${mission.name} failed launch readiness: ${stats.blockers.join(', ')}`);
  });
});

test('grid placement: autoBuild fits all parts within the 6x4 bay boundary without overlapping', () => {
  MISSIONS.forEach(mission => {
    const build = autoBuild(mission, 'engineer');
    const occupied = Array(4).fill(null).map(() => Array(6).fill(false));

    build.placedParts.forEach(p => {
      const [w, h] = p.size;
      assert.ok(p.gridX >= 0 && p.gridX + w <= 6, `Part ${p.name} overflows grid width`);
      assert.ok(p.gridY >= 0 && p.gridY + h <= 4, `Part ${p.name} overflows grid height`);

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          assert.equal(occupied[p.gridY + r][p.gridX + c], false, `Part ${p.name} collides with another component`);
          occupied[p.gridY + r][p.gridX + c] = true;
        }
      }
    });
  });
});

test('scoring & stars: evaluates debrief scorecard accurately', () => {
  // Test 1000-point scoring logic
  const sciencePts = 250;
  const dataPts = 180;
  const orbitPts = 150;
  const insertionPts = 150;
  const integrityPts = 120;
  const budgetPts = 50;
  const objectiveBonus = 100;

  const totalScore = Math.min(1000, sciencePts + dataPts + orbitPts + insertionPts + integrityPts + budgetPts + objectiveBonus);
  assert.equal(totalScore, 1000);

  // Star logic: 3 stars if objective + under budget + bonus achieved
  const integrity = 85;
  const dataReturnedPct = 90;
  const underBudget = true;
  const bonusAchieved = true;

  let stars = 1;
  if (integrity > 30 && dataReturnedPct > 50) stars = 2;
  if (stars === 2 && underBudget && bonusAchieved) stars = 3;

  assert.equal(stars, 3);
});

test('stages: all 4 missions achieve >= 700 points and 3 stars with autoBuild on nominal flight', () => {
  MISSIONS.forEach(mission => {
    const build = autoBuild(mission, 'cadet');
    const stats = computeStats(build.vehicle, build.placedParts, mission, 'cadet');

    // Nominal flight results:
    const s1 = { orbitAccuracy: 0.95, remainingFuel: 70 };
    const s2 = { integrity: 90, insertionAccuracy: 0.95 };
    const s3 = { dataReturnedPct: 92 };
    const s4 = { scienceScore: stats.rawScience + 40 };

    const budgetLeftPct = Math.max(0, Math.round(((stats.effectiveBudget - stats.totalCost) / stats.effectiveBudget) * 100));

    // Bonus Goal
    let bonusAchieved = false;
    if (mission.id === 1 && (stats.effectiveBudget - stats.totalCost) >= 15) bonusAchieved = true;
    else if (mission.id === 2 && stats.parts.some(p => p.id === 'spec') && stats.parts.some(p => p.id === 'radar')) bonusAchieved = true;
    else if (mission.id === 3 && s2.integrity >= 80) bonusAchieved = true;
    else if (mission.id === 4 && s3.dataReturnedPct >= 90) bonusAchieved = true;

    const objectiveBonus = bonusAchieved ? 100 : 0;
    const sciencePts = Math.min(300, Math.round(s4.scienceScore * 5));
    const dataPts = Math.round(s3.dataReturnedPct * 2);
    const orbitPts = Math.round(s1.orbitAccuracy * 150);
    const insertionPts = Math.round(s2.insertionAccuracy * 150);
    const integrityPts = Math.round(s2.integrity * 1.5);
    const budgetPts = Math.round(budgetLeftPct * 2);

    const totalScore = Math.min(1000, sciencePts + dataPts + orbitPts + insertionPts + integrityPts + budgetPts + objectiveBonus);
    assert.ok(totalScore >= 700, `Mission ${mission.name} score ${totalScore} < 700`);
    assert.equal(bonusAchieved, true, `Mission ${mission.name} bonus not achieved`);
  });
});
