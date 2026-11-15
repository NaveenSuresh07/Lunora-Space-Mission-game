/**
 * Scene: Arcade Mission Report, Flight Recorder & High Scores (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { calculateScore } from '../model/score.js';

let timer = 0;
let scoreData = null;
let displayScore = 0;
let selectedButton = 0; // 0: Retry, 1: Rebuild, 2: New Mission, 3: Title
let initials = ['A', 'A', 'A'];
let initialCursor = 0;
let enteringInitials = false;
let highScores = [];
let shareCopiedTimer = 0;

function loadHighScores(mId, diffId) {
  try {
    const raw = localStorage.getItem(`arcade_hiscores_${mId}_${diffId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { initials: 'NEI', score: 96 },
    { initials: 'BUZ', score: 88 },
    { initials: 'YUR', score: 82 }
  ];
}

function saveHighScores(mId, diffId, list) {
  try {
    localStorage.setItem(`arcade_hiscores_${mId}_${diffId}`, JSON.stringify(list));
  } catch (e) {}
}

export const reportScene = {
  enter(state) {
    timer = 0;
    displayScore = 0;
    selectedButton = 0;
    initials = ['A', 'A', 'A'];
    initialCursor = 0;
    shareCopiedTimer = 0;

    scoreData = calculateScore(state, state.flightResult || {});

    const mId = state.mission ? state.mission.id : 'moon';
    const dId = state.difficulty ? state.difficulty.id : 'engineer';
    highScores = loadHighScores(mId, dId);

    if (scoreData.totalScore > highScores[highScores.length - 1].score) {
      enteringInitials = true;
    } else {
      enteringInitials = false;
    }

    // Generate Shareable Design Hash
    try {
      const designPayload = {
        m: state.mission ? state.mission.id : 'moon',
        o: state.orbit ? state.orbit.id : 'mid',
        b: state.bus ? state.bus.id : 'medium',
        p: state.power ? state.power.id : 'solar_m',
        bat: state.battery ? state.battery.id : 'bat_basic',
        c: state.comms ? state.comms.id : 'medium',
        a: state.adcs ? state.adcs.id : 'adcs_basic',
        pr: state.propulsion ? state.propulsion.id : 'chemical',
        i: state.instruments ? state.instruments.map(x => x.id) : [],
        f: state.propellantKg || 1800,
        l: state.launcher ? state.launcher.id : 'medium'
      };
      window.location.hash = btoa(JSON.stringify(designPayload));
    } catch (e) {}
  },

  update(dt, state, sceneManager) {
    timer += dt;
    if (shareCopiedTimer > 0) shareCopiedTimer -= dt;

    if (displayScore < scoreData.totalScore) {
      displayScore = Math.min(scoreData.totalScore, Math.floor(timer * 45));
    }

    if (enteringInitials) {
      if (input.isPressed('UP')) {
        sfx.select();
        let code = initials[initialCursor].charCodeAt(0) + 1;
        if (code > 90) code = 65;
        initials[initialCursor] = String.fromCharCode(code);
      }
      if (input.isPressed('DOWN')) {
        sfx.select();
        let code = initials[initialCursor].charCodeAt(0) - 1;
        if (code < 65) code = 90;
        initials[initialCursor] = String.fromCharCode(code);
      }
      if (input.isPressed('RIGHT') || input.isPressed('ACTION')) {
        sfx.confirm();
        if (initialCursor < 2) {
          initialCursor++;
        } else {
          const mId = state.mission ? state.mission.id : 'moon';
          const dId = state.difficulty ? state.difficulty.id : 'engineer';
          highScores.push({ initials: initials.join(''), score: scoreData.totalScore });
          highScores.sort((a, b) => b.score - a.score);
          highScores = highScores.slice(0, 3);
          saveHighScores(mId, dId, highScores);
          enteringInitials = false;
        }
      }
      if (input.isPressed('LEFT') && initialCursor > 0) {
        initialCursor--;
        sfx.select();
      }
      return;
    }

    // Button navigation
    if (input.isPressed('LEFT')) {
      sfx.select();
      selectedButton = (selectedButton - 1 + 4) % 4;
    }
    if (input.isPressed('RIGHT')) {
      sfx.select();
      selectedButton = (selectedButton + 1) % 4;
    }
    if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
      sfx.confirm();
      if (selectedButton === 0) {
        sceneManager.go('hangar'); // Retry
      } else if (selectedButton === 1) {
        // Rebuild with suggestions
        sceneManager.go('hangar');
      } else if (selectedButton === 2) {
        sceneManager.go('select'); // New Mission
      } else {
        sceneManager.go('title'); // Title
      }
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    const res = state.flightResult || {};
    const success = !!res.success;
    const titleCol = success ? 11 : 8;
    const titleText = success
      ? (res.missionSuccess ? 'MISSION ACCOMPLISHED!' : 'PARTIAL SUCCESSFUL ARRIVAL')
      : 'MISSION TERMINATED: VEHICLE LOST';

    // Top Header Banner
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.centerText(ctx, titleText, 8, titleCol, 1);
    gfx.line(ctx, 0, 26, 480, 26, 5);

    // Left Box: Score & Letter Grade (X: 12, Y: 32, W: 160, H: 120)
    gfx.rect(ctx, 12, 32, 160, 120, 1);
    gfx.rectb(ctx, 12, 32, 160, 120, 12);

    gfx.centerText(ctx, 'TOTAL SCORE', 38, 6, 1);
    gfx.text(ctx, `${displayScore}`, 50, 52, 10, 2);

    const gradeColors = { S: 10, A: 11, B: 12, C: 13, F: 8 };
    const gCol = gradeColors[scoreData.grade] || 7;
    gfx.rect(ctx, 55, 84, 75, 26, gCol);
    gfx.text(ctx, `GRADE ${scoreData.grade}`, 62, 91, 0, 1);

    gfx.text(ctx, `TARGET: ${state.mission ? state.mission.target.toUpperCase() : 'LEO'}`, 24, 124, 7, 1);
    gfx.text(ctx, `DIFF: ${state.difficulty ? state.difficulty.name : 'STD'}`, 24, 136, 6, 1);

    // Right Box: 6 Scoring Categories (X: 180, Y: 32, W: 288, H: 120)
    gfx.rect(ctx, 180, 32, 288, 120, 1);
    gfx.rectb(ctx, 180, 32, 288, 120, 5);

    gfx.text(ctx, 'SYSTEMS ENGINEERING SCORE BREAKDOWN', 190, 38, 10, 1);

    const b = scoreData.breakdown;
    const rows = [
      { label: 'FLIGHT SURVIVAL', pts: b.performance.points, max: 30, col: 11 },
      { label: 'SCIENCE OBJECTIVES', pts: b.science.points, max: 20, col: 10 },
      { label: 'DATA TELEMETRY', pts: b.data.points, max: 10, col: 12 },
      { label: 'RESOURCE & TIME', pts: b.efficiency.points, max: 15, col: 11 },
      { label: 'DECISION MARGINS', pts: b.decisions.points, max: 15, col: 14 },
      { label: 'TEAMWORK CONSENSUS', pts: b.teamwork.points, max: 10, col: 13 }
    ];

    let ry = 52;
    for (const r of rows) {
      gfx.text(ctx, r.label, 190, ry, 6, 1);
      const pct = Math.min(100, Math.round((r.pts / r.max) * 100));
      gfx.bar(ctx, 335, ry, 85, 7, pct, r.col, 0);
      gfx.text(ctx, `${r.pts}/${r.max}`, 428, ry, 7, 1);
      ry += 14;
    }

    // Middle Box: Flight Recorder Recommendations or Initials Entry
    if (enteringInitials) {
      gfx.rect(ctx, 12, 160, 456, 52, 2);
      gfx.rectb(ctx, 12, 160, 456, 52, 10);
      gfx.centerText(ctx, 'NEW HIGH SCORE! ENTER 3-LETTER CALLSIGN:', 168, 10, 1);

      const cx = 220;
      for (let i = 0; i < 3; i++) {
        const isCur = i === initialCursor;
        const x = cx + i * 20;
        if (isCur && Math.floor(timer * 4) % 2 === 0) {
          gfx.rect(ctx, x - 3, 184, 14, 14, 7);
          gfx.text(ctx, initials[i], x, 187, 0, 1);
        } else {
          gfx.text(ctx, initials[i], x, 187, 10, 1);
        }
      }
      gfx.centerText(ctx, 'UP/DOWN: CHANGE LETTER   RIGHT/SPACE: NEXT', 202, 7, 1);
    } else {
      // Flight Recorder Tab
      gfx.rect(ctx, 12, 160, 456, 56, 1);
      gfx.rectb(ctx, 12, 160, 456, 56, 5);

      gfx.text(ctx, 'FLIGHT RECORDER ANALYSIS & RECOMMENDATIONS:', 20, 166, 10, 1);
      const tip1 = scoreData.tips[0] || 'Clean orbital trajectory executed.';
      const tip2 = scoreData.tips[1] || 'Subsystems satisfied baseline performance.';
      gfx.text(ctx, `> ${tip1.toUpperCase().slice(0, 68)}`, 20, 178, 7, 1);
      gfx.text(ctx, `> ${tip2.toUpperCase().slice(0, 68)}`, 20, 190, 6, 1);
      gfx.text(ctx, 'URL SHARE CODE COPIED IN BROWSER ADDRESS HASH', 20, 202, 12, 1);
    }

    // Bottom Navigation Buttons (Y: 228)
    const buttons = ['RETRY', 'REBUILD', 'NEW MISSION', 'TITLE'];
    const bx = [20, 130, 245, 370];
    const bw = [95, 100, 110, 85];

    for (let i = 0; i < buttons.length; i++) {
      const isSel = i === selectedButton;
      gfx.rect(ctx, bx[i], 228, bw[i], 24, isSel ? 10 : 1);
      gfx.rectb(ctx, bx[i], 228, bw[i], 24, isSel ? 7 : 5);
      gfx.text(ctx, buttons[i], bx[i] + 10, 236, isSel ? 0 : 7, 1);
    }
  }
};
