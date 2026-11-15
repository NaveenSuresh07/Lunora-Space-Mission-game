/**
 * Unit Tests: Flight Readiness Validator & Team Role Rules
 * Run with: node --test tests/validate.test.js
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
  LAUNCHERS
} from '../js/model/data.js';

test('validate: all 4 consoles approve baseline LEO design', () => {
  const state = {
    mission: MISSIONS[0], // Earth Observer
    orbit: ORBITS[0],
    bus: BUSES[0], // Small Bus
    power: POWER[0], // Solar S
    battery: BATTERIES[0],
    comms: COMMS[0],
    adcs: ADCS[0],
    propulsion: PROPULSION[0],
    instruments: [INSTRUMENTS[0]], // Camera
    propellantKg: 0,
    launcher: LAUNCHERS[0] // Light Scout
  };

  const res = validate(state);
  assert.equal(res.isValid, true, `Expected valid, got errors: ${res.errors.join('; ')}`);
  assert.equal(res.roleVerdicts.planner.go, true);
  assert.equal(res.roleVerdicts.engineer.go, true);
  assert.equal(res.roleVerdicts.scientist.go, true);
  assert.equal(res.roleVerdicts.comms.go, true);
});

test('validate: planner vetoes when cost exceeds budget', () => {
  const state = {
    mission: MISSIONS[0], // LEO Budget $120M
    orbit: ORBITS[0],
    bus: BUSES[2], // Large Bus $140M
    power: POWER[4], // RTG $90M -> already $230M!
    battery: BATTERIES[0],
    comms: COMMS[0],
    adcs: ADCS[0],
    propulsion: PROPULSION[0],
    instruments: [INSTRUMENTS[0]],
    propellantKg: 0,
    launcher: LAUNCHERS[0]
  };

  const res = validate(state);
  assert.equal(res.isValid, false);
  assert.equal(res.roleVerdicts.planner.go, false);
  assert.match(res.roleVerdicts.planner.reason, /Over budget/);
});

test('validate: engineer vetoes when spacecraft exceeds launcher capacity', () => {
  const state = {
    mission: MISSIONS[0],
    orbit: ORBITS[0],
    bus: BUSES[2], // 1200kg
    power: POWER[2], // 160kg
    battery: BATTERIES[1], // 40kg
    comms: COMMS[2], // 60kg
    adcs: ADCS[1], // 25kg
    propulsion: PROPULSION[0], // 60kg
    instruments: [INSTRUMENTS[0]], // 20kg -> Dry ~1565kg
    propellantKg: 200, // Wet ~1765kg
    launcher: LAUNCHERS[0] // Max 1500kg
  };

  const res = validate(state);
  assert.equal(res.isValid, false);
  assert.equal(res.roleVerdicts.engineer.go, false);
  assert.match(res.roleVerdicts.engineer.reason, /too heavy/);
});

test('validate: scientist vetoes when instruments exceed bus payload limit', () => {
  const state = {
    mission: MISSIONS[0],
    orbit: ORBITS[0],
    bus: BUSES[0], // Small bus max payload: 60kg
    power: POWER[0],
    battery: BATTERIES[0],
    comms: COMMS[0],
    adcs: ADCS[0],
    propulsion: PROPULSION[0],
    // Camera(20kg) + Spectrometer(30kg) + Radar(60kg) = 110kg > 60kg
    instruments: [INSTRUMENTS[0], INSTRUMENTS[1], INSTRUMENTS[2]],
    propellantKg: 0,
    launcher: LAUNCHERS[1]
  };

  const res = validate(state);
  assert.equal(res.isValid, false);
  assert.equal(res.roleVerdicts.scientist.go, false);
  assert.match(res.roleVerdicts.scientist.reason, /exceed bus mass limit/);
});
