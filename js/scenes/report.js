/**
 * Scene: Arcade Mission Report & High Scores
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { calculateScore } from '../model/score.js';

let timer = 0;
let scoreData = null;
let displayScore = 0;
let selectedButton = 0; // 0: Retry, 1: New Mission, 2: Title
let initials = ['A', 'A', 'A'];
let initialCursor = 0;
let enteringInitials = false;
let highScores = [];

function loadHighScores(missionId) {
  try {
    const raw = localStorage.getItem(`arcade_hiscores_${missionId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { initials: 'NEI', score: 95 },
    { initials: 'BUZ', score: 88 },
    { initials: 'YUR', score: 80 }
  ];
}

function saveHighScores(missionId, list) {
  try {
    localStorage.setItem(`arcade_hiscores_${missionId}`, JSON.stringify(list));
  } catch (e) {}
}

export const reportScene = {
  enter(state) {
    timer = 0;
    displayScore = 0;
    selectedButton = 0;
    initials = ['A', 'A', 'A'];
    initialCursor = 0;

    scoreData = calculateScore(state, state.flightResult || {});

    const mId = state.mission ? state.mission.id : 'moon';
    highScores = loadHighScores(mId);

    // Check if new high score
    if (scoreData.totalScore > highScores[highScores.length - 1].score) {
      enteringInitials = true;
    } else {
      enteringInitials = false;
    }
  },

  update(dt, state, sceneManager) {
    timer += dt;

    // Count-up animation
    if (displayScore < scoreData.totalScore) {
      displayScore = Math.min(scoreData.totalScore, Math.floor(timer * 50));
    }

    if (enteringInitials) {
      // 3-letter initials entry
      if (input.isPressed('UP')) {
        sfx.select();
        let code = initials[initialCursor].charCodeAt(0) + 1;
        if (code > 90) code = 65; // 'Z' -> 'A'
        initials[initialCursor] = String.fromCharCode(code);
      }
      if (input.isPressed('DOWN')) {
        sfx.select();
        let code = initials[initialCursor].charCodeAt(0) - 1;
        if (code < 65) code = 90; // 'A' -> 'Z'
        initials[initialCursor] = String.fromCharCode(code);
      }
      if (input.isPressed('RIGHT') || input.isPressed('ACTION')) {
        sfx.confirm();
        if (initialCursor < 2) {
          initialCursor++;
        } else {
          // Save high score
          const mId = state.mission ? state.mission.id : 'moon';
          highScores.push({ initials: initials.join(''), score: scoreData.totalScore });
          highScores.sort((a, b) => b.score - a.score);
          highScores = highScores.slice(0, 3);
          saveHighScores(mId, highScores);
          enteringInitials = false;
        }
      }
      if (input.isPressed('LEFT') && initialCursor > 0) {
        initialCursor--;
        sfx.select();
      }
      return;
    }

    // Menu navigation
    if (input.isPressed('LEFT')) {
      sfx.select();
      selectedButton = (selectedButton - 1 + 3) % 3;
    }
    if (input.isPressed('RIGHT')) {
      sfx.select();
      selectedButton = (selectedButton + 1) % 3;
    }
    if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
      sfx.confirm();
      if (selectedButton === 0) {
        // Retry same mission
        sceneManager.go('hangar');
      } else if (selectedButton === 1) {
        // New mission
        sceneManager.go('select');
      } else {
        // Title
        sceneManager.go('title');
      }
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    const res = state.flightResult || {};
    const success = !!res.success;
    const titleCol = success ? 11 : 8;
    const titleText = success
      ? (res.missionSuccess ? 'MISSION ACCOMPLISHED!' : 'PARTIAL SUCCESS')
      : 'MISSION TERMINATED!';

    // Top Header Banner
    gfx.rect(ctx, 0, 0, 320, 20, 1);
    gfx.centerText(ctx, titleText, 6, titleCol, 1);
    gfx.line(ctx, 0, 20, 320, 20, 5);

    // Left Box: Score & Grade (X: 10, Y: 26, W: 110, H: 84)
    gfx.rect(ctx, 10, 26, 110, 84, 1);
    gfx.rectb(ctx, 10, 26, 110, 84, 12);

    gfx.centerText(ctx, 'TOTAL SCORE', 31, 6, 1);
    gfx.text(ctx, `${displayScore}`, 35, 42, 10, 2);

    // Grade Badge
    const gradeColors = { S: 10, A: 11, B: 12, C: 13, F: 8 };
    const gCol = gradeColors[scoreData.grade] || 7;
    gfx.rect(ctx, 42, 65, 45, 20, gCol);
    gfx.text(ctx, `GRADE ${scoreData.grade}`, 46, 71, 0, 1);

    gfx.text(ctx, `TARGET: ${state.mission ? state.mission.target.toUpperCase() : 'LEO'}`, 24, 95, 7, 1);

    // Right Box: Category Bars (X: 126, Y: 26, W: 184, H: 84)
    gfx.rect(ctx, 126, 26, 184, 84, 1);
    gfx.rectb(ctx, 126, 26, 184, 84, 5);

    gfx.text(ctx, 'TELEMETRY BREAKDOWN', 134, 31, 10, 1);

    const b = scoreData.breakdown;
    const rows = [
      { label: 'SURVIVAL', pts: b.mission.points, max: 40, col: 11 },
      { label: 'SCIENCE', pts: b.science.points, max: 25, col: 10 },
      { label: 'DATA DL', pts: b.data.points, max: 15, col: 12 },
      { label: 'BUDGET', pts: b.budget.points, max: 10, col: 11 },
      { label: 'MARGINS', pts: b.margins.points, max: 10, col: 14 }
    ];

    let ry = 42;
    for (const r of rows) {
      gfx.text(ctx, r.label, 134, ry, 6, 1);
      const pct = Math.min(100, Math.round((r.pts / r.max) * 100));
      gfx.bar(ctx, 192, ry, 70, 6, pct, r.col, 0);
      gfx.text(ctx, `${r.pts}`, 270, ry, 7, 1);
      ry += 11;
    }

    // Middle Strip: Engineering Debrief Tips or High Scores
    if (enteringInitials) {
      gfx.rect(ctx, 10, 115, 300, 36, 2);
      gfx.rectb(ctx, 10, 115, 300, 36, 10);
      gfx.centerText(ctx, 'NEW HIGH SCORE! ENTER INITIALS:', 120, 10, 1);

      const cx = 145;
      for (let i = 0; i < 3; i++) {
        const isCur = i === initialCursor;
        const x = cx + i * 14;
        if (isCur && Math.floor(timer * 4) % 2 === 0) {
          gfx.rect(ctx, x - 2, 131, 10, 10, 7);
          gfx.text(ctx, initials[i], x, 133, 0, 1);
        } else {
          gfx.text(ctx, initials[i], x, 133, 10, 1);
        }
      }
      gfx.centerText(ctx, 'UP/DOWN: LETTER   RIGHT: NEXT', 143, 7, 1);
    } else {
      // Tips card
      gfx.rect(ctx, 10, 115, 300, 36, 1);
      gfx.rectb(ctx, 10, 115, 300, 36, 5);

      gfx.text(ctx, 'SYSTEMS DEBRIEF:', 16, 120, 10, 1);
      const tip1 = scoreData.tips[0] || 'Clean orbital trajectory executed.';
      const tip2 = scoreData.tips[1] || 'Subsystems satisfied baseline performance.';
      gfx.text(ctx, tip1.toUpperCase().slice(0, 48), 16, 130, 7, 1);
      gfx.text(ctx, tip2.toUpperCase().slice(0, 48), 16, 140, 6, 1);
    }

    // Bottom Action Buttons
    const buttons = ['RETRY', 'NEW MISSION', 'TITLE'];
    const bx = [25, 125, 235];
    for (let i = 0; i < buttons.length; i++) {
      const isSel = i === selectedButton;
      gfx.rect(ctx, bx[i], 158, 65, 16, isSel ? 10 : 1);
      gfx.rectb(ctx, bx[i], 158, 65, 16, isSel ? 7 : 5);
      gfx.text(ctx, buttons[i], bx[i] + 6, 163, isSel ? 0 : 7, 1);
    }
  }
};
