/**
 * Unit Tests: Physics & Systems Engineering Engine
 * Run with: node --test tests/engine.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  dryMass,
  wetMass,
  payloadMass,
  totalCost,
  effectiveBudget,
  powerGenerated,
  powerUsed,
  deltaV,
  deltaVNeeded,
  downlinkGbPerDay,
  totalSchedule,
  makeFlightStats
} from '../js/model/engine.js';

import {
  MISSIONS,
  ORBITS,
  BUSES,
  POWER,
  BATTERIES,
  COMMS,
  ADCS,
  PROPULSION,
  INSTRUMENTS,
  LAUNCHERS,
  DIFFICULTIES
} from '../js/model/data.js';

test('engine: dry mass, wet mass, and payload mass', () => {
  const state = {
    bus: BUSES[1], // 500kg
    power: POWER[1], // 70kg
    battery: BATTERIES[0], // 15kg
    comms: COMMS[1], // 25kg
    adcs: ADCS[0], // 10kg
    propulsion: PROPULSION[0], // 60kg
    instruments: [INSTRUMENTS[0], INSTRUMENTS[1]], // 20kg + 30kg = 50kg
    propellantKg: 1000
  };

  const expectedDry = 500 + 70 + 15 + 25 + 10 + 60 + 50; // 730kg
  assert.equal(dryMass(state), expectedDry);
  assert.equal(payloadMass(state), 50);
  assert.equal(wetMass(state), expectedDry + 1000);
});

test('engine: Tsiolkovsky delta-V formula', () => {
  const state = {
    bus: BUSES[0], // 150kg
    power: POWER[0], // 25kg
    battery: BATTERIES[0], // 15kg
    comms: COMMS[0], // 5kg
    adcs: ADCS[0], // 10kg
    propulsion: PROPULSION[0], // 60kg, Isp 320s
    instruments: [INSTRUMENTS[0]], // 20kg
    propellantKg: 285 // Dry = 285kg, Wet = 570kg (wet/dry = 2.0)
  };

  const dv = deltaV(state);
  // dv = 320 * 9.80665 * ln(2) / 1000 ≈ 2.175 km/s
  assert.ok(dv >= 2.16 && dv <= 2.19, `Expected ~2.175 km/s, got ${dv}`);
});

test('engine: solar irradiance inverse-square law', () => {
  // 1 m² solar array (areaM2 = 1, efficiency = 0.28)
  const powerSys = POWER[0];

  // Earth @ 1.0 AU: 1 * 1361 * 0.28 ≈ 381 W
  const earthState = { power: powerSys, mission: MISSIONS[0] };
  assert.equal(powerGenerated(earthState), 381.1);

  // Mars @ 1.52 AU: 1 * (1361 / 1.52²) * 0.28 ≈ 164.9 W
  const marsState = { power: powerSys, mission: MISSIONS[2] };
  assert.equal(powerGenerated(marsState), 164.9);

  // Jupiter @ 5.2 AU: 1 * (1361 / 5.2²) * 0.28 ≈ 14.1 W
  const jupState = { power: powerSys, mission: MISSIONS[3] };
  assert.equal(powerGenerated(jupState), 14.1);

  // Nuclear RTG: invariant across all distances
  const rtgState = { power: POWER[4], mission: MISSIONS[3] }; // RTG MMRTG (110W)
  assert.equal(powerGenerated(rtgState), 110);
});

test('engine: schedule calculation uses critical path', () => {
  const state = {
    bus: BUSES[1], // devMonths 9
    power: POWER[1], // devMonths 3
    battery: BATTERIES[1], // devMonths 3
    comms: COMMS[2], // devMonths 6
    adcs: ADCS[1], // devMonths 5
    propulsion: PROPULSION[0], // devMonths 4
    instruments: [INSTRUMENTS[2]], // Radar devMonths 9
    launcher: LAUNCHERS[1] // leadMonths 4
  };

  // bus(9) + max(3, 3, 6, 5, 4, 9) + launcher(4) = 9 + 9 + 4 = 22 months
  assert.equal(totalSchedule(state), 22);
});

test('engine: difficulty budget multiplier', () => {
  const mission = MISSIONS[1]; // Moon budget $250M

  assert.equal(effectiveBudget({ mission, difficulty: DIFFICULTIES[0] }), 325); // Rookie 1.3x
  assert.equal(effectiveBudget({ mission, difficulty: DIFFICULTIES[1] }), 250); // Engineer 1.0x
  assert.equal(effectiveBudget({ mission, difficulty: DIFFICULTIES[2] }), 200); // Director 0.8x
});
