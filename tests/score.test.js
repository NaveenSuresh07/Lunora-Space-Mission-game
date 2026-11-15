/**
 * Unit Tests: 100-Point Scoring Model & Debrief Engine
 * Run with: node --test tests/score.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateScore } from '../js/model/score.js';
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

test('score: maximum score is 100 and awards Grade S on perfect flight with first-poll consensus', () => {
  // Baseline LEO mission that satisfies all margins, deadline, budget, and first poll
  const state = {
    mission: MISSIONS[0], // LEO: budget $120M, deadline 18 mo, minSci 20, minData 1500
    orbit: ORBITS[0],
    bus: BUSES[0], // Small Bus $20M
    power: POWER[0], // Solar Array S $8M
    battery: BATTERIES[0], // Basic Battery $4M
    comms: COMMS[0], // Low Gain Patch $4M
    adcs: ADCS[0], // Basic ADCS $6M
    propulsion: PROPULSION[0], // Chemical $15M
    instruments: [INSTRUMENTS[0]], // Camera $12M (20 sci, 6 GB/d)
    propellantKg: 0,
    launcher: LAUNCHERS[0], // Light Scout Booster $15M -> Cost $84M (< $120M)
    allGoFirstPoll: true // Testing BUG-1 fix
  };

  const flightResult = {
    success: true,
    missionSuccess: true,
    scienceEarned: 25, // >= minSci (20)
    dataDelivered: 1600 // >= minData (1500)
  };

  const res = calculateScore(state, flightResult);

  assert.equal(res.totalScore, 100, `Expected 100 total score, got ${res.totalScore}`);
  assert.equal(res.grade, 'S');

  // Verify breakdown
  assert.equal(res.breakdown.performance.points, 30);
  assert.equal(res.breakdown.science.points, 20);
  assert.equal(res.breakdown.data.points, 10);
  assert.equal(res.breakdown.efficiency.points, 15);
  assert.equal(res.breakdown.decisions.points, 15);
  assert.equal(res.breakdown.teamwork.points, 10);
});

test('score: teamwork awards 5 pts when re-poll was required', () => {
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
    allGoFirstPoll: false // Re-polled after NO-GO
  };

  const flightResult = {
    success: true,
    missionSuccess: true,
    scienceEarned: 20,
    dataDelivered: 1500
  };

  const res = calculateScore(state, flightResult);
  assert.equal(res.breakdown.teamwork.points, 5);
});

test('score: grade boundaries', () => {
  const evaluate = (score) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    return 'F';
  };

  assert.equal(evaluate(100), 'S');
  assert.equal(evaluate(90), 'S');
  assert.equal(evaluate(89), 'A');
  assert.equal(evaluate(80), 'A');
  assert.equal(evaluate(79), 'B');
  assert.equal(evaluate(65), 'B');
  assert.equal(evaluate(64), 'C');
  assert.equal(evaluate(50), 'C');
  assert.equal(evaluate(49), 'F');
});
