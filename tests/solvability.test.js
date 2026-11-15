/**
 * Solvability Tests: Ensure every mission is mathematically achievable.
 * Run with: node --test tests/solvability.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { validate } from '../js/model/validate.js';
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

test('solvability: Earth Observer (LEO) has valid baseline design', () => {
  const state = {
    mission: MISSIONS[0],
    orbit: ORBITS[0],
    bus: BUSES[0],
    power: POWER[0],
    battery: BATTERIES[0],
    comms: COMMS[0],
    adcs: ADCS[0],
    propulsion: PROPULSION[0],
    instruments: [INSTRUMENTS[0]],
    propellantKg: 0,
    launcher: LAUNCHERS[0],
    difficulty: DIFFICULTIES[1]
  };

  const res = validate(state);
  assert.equal(res.isValid, true, `LEO validation failed: ${res.errors.join('; ')}`);
});

test('solvability: Lunar Mapper has valid baseline design', () => {
  const state = {
    mission: MISSIONS[1],
    orbit: ORBITS[1],
    bus: BUSES[1],
    power: POWER[1],
    battery: BATTERIES[0],
    comms: COMMS[1],
    adcs: ADCS[0],
    propulsion: PROPULSION[0],
    instruments: [INSTRUMENTS[0], INSTRUMENTS[1]],
    propellantKg: 1900,
    launcher: LAUNCHERS[1],
    difficulty: DIFFICULTIES[1]
  };

  const res = validate(state);
  assert.equal(res.isValid, true, `Moon validation failed: ${res.errors.join('; ')}`);
});

test('solvability: Mars Climate Orbiter has valid baseline design', () => {
  const state = {
    mission: MISSIONS[2],
    orbit: ORBITS[1],
    bus: BUSES[1],
    power: POWER[2], // Solar L
    battery: BATTERIES[1],
    comms: COMMS[2], // High Gain Dish
    adcs: ADCS[1],
    propulsion: PROPULSION[1], // Ion Drive (3000s Isp)
    instruments: [INSTRUMENTS[0], INSTRUMENTS[1], INSTRUMENTS[2]],
    propellantKg: 350,
    launcher: LAUNCHERS[1],
    difficulty: DIFFICULTIES[1]
  };

  const res = validate(state);
  assert.equal(res.isValid, true, `Mars validation failed: ${res.errors.join('; ')}`);
});

test('solvability: Jupiter Moons Explorer has valid Nuclear RTG and Juno Solar designs', () => {
  // Path A: Triple RTG with Ion Propulsion
  const stateRTG = {
    mission: MISSIONS[3],
    orbit: ORBITS[1],
    bus: BUSES[0], // Small Bus
    power: POWER.find(p => p.id === 'rtg3'), // Triple RTG (340W)
    battery: BATTERIES[1],
    comms: COMMS[2], // High Gain Dish
    adcs: ADCS[1],
    propulsion: PROPULSION[1], // Ion Drive
    instruments: [INSTRUMENTS[1], INSTRUMENTS[3]], // Spectrometer + Magnetometer (40 sci)
    propellantKg: 350,
    launcher: LAUNCHERS[1], // Medium
    difficulty: DIFFICULTIES[1]
  };

  const resRTG = validate(stateRTG);
  assert.equal(resRTG.isValid, true, `Jupiter RTG design failed: ${resRTG.errors.join('; ')}`);

  // Path B: Juno-style Giant Solar Arrays (24 m²)
  const stateJuno = {
    mission: MISSIONS[3],
    orbit: ORBITS[1],
    bus: BUSES[0],
    power: POWER.find(p => p.id === 'solar_juno'), // 24 m² Juno Solar Array
    battery: BATTERIES[1],
    comms: COMMS[2],
    adcs: ADCS[1],
    propulsion: PROPULSION[1],
    instruments: [INSTRUMENTS[1], INSTRUMENTS[3]],
    propellantKg: 350,
    launcher: LAUNCHERS[1],
    difficulty: DIFFICULTIES[1]
  };

  const resJuno = validate(stateJuno);
  assert.equal(resJuno.isValid, true, `Jupiter Juno Solar design failed: ${resJuno.errors.join('; ')}`);
});
