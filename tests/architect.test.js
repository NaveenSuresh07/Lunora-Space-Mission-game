/**
 * Unit & Systems Tests: Lunora: Mission Architect Engine
 * Run with: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { MISSIONS, VEHICLES, BUSES, POWER, INSTRUMENTS, COMMS } from '../js/data.js';
import { evaluate, simulateFlight } from '../js/engine.js';
import { state, resetDesignForMission, applyRecommendedBuild, autoFixBlockers, undoDesign, pushHistory } from '../js/state.js';

test('evaluate: calculates mass, cost, power, and downlink accurately', () => {
  const mission = MISSIONS[0]; // First Light (LEO, Budget $60M)
  const design = {
    vehicle: VEHICLES[0], // Sparrow-1 ($12M, 350kg)
    bus: BUSES[0], // Micro-Bus ($6M, 35kg, 15W, maxPayload 60kg)
    power: POWER[1], // Compact Solar ($7M, 30kg, 140W @ 1 AU)
    instruments: [INSTRUMENTS[0], INSTRUMENTS[3]], // Camera (15kg, 25W, $6M) + Magnetometer (8kg, 10W, $5M) = 23kg, 35W, $11M
    comms: COMMS[0] // Low-gain ($4M, 6kg, 10W, downMbd 300)
  };

  const res = evaluate(design, mission, 'engineer');

  // Total Mass = 35 + 30 + 6 + 23 = 94 kg <= 350 kg
  assert.equal(res.mass, 94);
  assert.equal(res.checks.mass, true);

  // Total Cost = 12 + 6 + 7 + 4 + 11 = $40M <= $60M
  assert.equal(res.cost, 40);
  assert.equal(res.checks.budget, true);

  // Power: Supply 140W >= Needed (15 + 10 + 35 = 60W)
  assert.equal(res.powerSupply, 140);
  assert.equal(res.powerNeeded, 60);
  assert.equal(res.checks.power, true);

  // Reach: Sparrow reaches LEO
  assert.equal(res.checks.reach, true);

  // Launch readiness: all pass
  assert.equal(res.isLaunchReady, true);
  assert.equal(res.primaryBlocker, null);
});

test('evaluate: blocks launch when rocket cannot reach target destination', () => {
  const mission = MISSIONS[1]; // Moon
  const design = {
    vehicle: VEHICLES[0], // Sparrow-1 can only reach LEO
    bus: BUSES[0],
    power: POWER[1],
    instruments: [INSTRUMENTS[0]],
    comms: COMMS[0]
  };

  const res = evaluate(design, mission, 'engineer');
  assert.equal(res.checks.reach, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.primaryBlocker, /cannot reach/);
});

test('evaluate: blocks launch when power deficit occurs at Mars', () => {
  const mission = MISSIONS[2]; // Mars (0.43 solar intensity)
  const design = {
    vehicle: VEHICLES[2], // Titan-X
    bus: BUSES[2], // Heavy Lander (60W)
    power: POWER[1], // Compact solar (140W * 0.43 ≈ 60W)
    instruments: [INSTRUMENTS[0], INSTRUMENTS[2]], // Camera (25W) + Radar (85W) = 110W
    comms: COMMS[1] // Medium dish (35W) -> Total needed: 60 + 110 + 35 = 205W
  };

  const res = evaluate(design, mission, 'engineer');
  assert.equal(res.checks.power, false);
  assert.equal(res.isLaunchReady, false);
  assert.match(res.primaryBlocker, /Power deficit/);
});

test('solvability: all 4 missions pass validation with their recommended builds', () => {
  MISSIONS.forEach(mission => {
    resetDesignForMission(mission);
    applyRecommendedBuild(mission);
    const res = evaluate(state.design, mission, 'engineer');
    assert.equal(res.isLaunchReady, true, `Mission ${mission.name} recommended build failed: ${res.primaryBlocker}`);
  });
});

test('autofix: automatically solves reach and power deficits', () => {
  const mission = MISSIONS[2]; // Mars
  resetDesignForMission(mission);
  // Intentionally invalid design: Sparrow (can't reach Mars) and Battery (low power)
  state.design.vehicle = VEHICLES[0];
  state.design.power = POWER[0];

  let evalData = evaluate(state.design, mission, 'engineer');
  assert.equal(evalData.isLaunchReady, false);

  // Apply autoFix
  autoFixBlockers(evalData);
  evalData = evaluate(state.design, mission, 'engineer');
  assert.equal(evalData.checks.reach, true, 'Auto-fix should upgrade launch vehicle for Mars');
  assert.equal(evalData.checks.power, true, 'Auto-fix should upgrade power system for Mars');
});

test('simulation: produces 3 stars and high score on complete mission design', () => {
  const mission = MISSIONS[0]; // First Light
  resetDesignForMission(mission);
  applyRecommendedBuild(mission); // Camera + Magnetometer = 2 science types (Bonus Goal!)

  const evalData = evaluate(state.design, mission, 'cadet');
  const sim = simulateFlight(state.design, mission, evalData, 'cadet');

  assert.equal(sim.survived, true);
  assert.equal(sim.stars, 3);
  assert.ok(sim.totalScore >= 700, `Expected score >= 700, got ${sim.totalScore}`);
  assert.ok(sim.hints.length > 0);
  assert.ok(sim.nasaFact.length > 0);
});

test('evaluate: blocks launch when sample arm is equipped without lander bus', () => {
  const mission = MISSIONS[1]; // Moon (orbital reconnaissance, no landing required)
  resetDesignForMission(mission);
  state.design.vehicle = VEHICLES[1]; // Kestrel-5 ($40M, reaches Moon)
  state.design.bus = BUSES[1]; // Standard Orbiter Bus ($16M, not a lander!)
  state.design.power = POWER[1]; // Compact Solar ($7M, 140W)
  state.design.instruments = [INSTRUMENTS.find(i => i.id === 'arm')]; // Arm (75kg, $28M, needs lander)
  state.design.comms = COMMS[0]; // Low-gain ($4M)
  // Total cost: 40 + 16 + 7 + 28 + 4 = $95M <= $120M budget

  const evalData = evaluate(state.design, mission, 'engineer');
  assert.equal(evalData.checks.armLander, false);
  assert.equal(evalData.isLaunchReady, false);
  assert.match(evalData.primaryBlocker, /Sample Arm requires a Lander Bus/);
});

test('evaluate: blocks launch when instruments exceed bus max payload', () => {
  const mission = MISSIONS[0];
  resetDesignForMission(mission);
  state.design.bus = BUSES[0]; // Micro-Bus max payload = 60 kg
  // Radar (50kg) + Camera (15kg) = 65kg > 60kg limit
  state.design.instruments = [
    INSTRUMENTS.find(i => i.id === 'radar'),
    INSTRUMENTS.find(i => i.id === 'cam')
  ];

  const evalData = evaluate(state.design, mission, 'engineer');
  assert.equal(evalData.checks.busPayload, false);
  assert.equal(evalData.isLaunchReady, false);
  assert.match(evalData.primaryBlocker, /exceed Micro-Bus limit/);
});

test('state: undo restores previous design state accurately', () => {
  const mission = MISSIONS[0];
  resetDesignForMission(mission);
  applyRecommendedBuild(mission);

  const prevPowerId = state.design.power.id;
  pushHistory();
  // Modify power
  state.design.power = POWER[0];
  assert.notEqual(state.design.power.id, prevPowerId);

  // Undo
  const success = undoDesign();
  assert.equal(success, true);
  assert.equal(state.design.power.id, prevPowerId);
});

test('simulation: all 4 missions achieve 3 stars and >=700 points with recommended builds in cadet mode', () => {
  MISSIONS.forEach(mission => {
    resetDesignForMission(mission);
    applyRecommendedBuild(mission);

    const evalData = evaluate(state.design, mission, 'cadet');
    assert.equal(evalData.isLaunchReady, true, `Mission ${mission.name} not launch ready`);

    const sim = simulateFlight(state.design, mission, evalData, 'cadet');
    assert.equal(sim.survived, true, `Mission ${mission.name} failed flight`);
    assert.equal(sim.stars, 3, `Mission ${mission.name} achieved ${sim.stars} stars instead of 3`);
    assert.ok(sim.totalScore >= 700, `Mission ${mission.name} score ${sim.totalScore} < 700`);
  });
});
