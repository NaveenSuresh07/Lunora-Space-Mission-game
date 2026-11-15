/**
 * Scene: NASA Go / No-Go Flight Readiness Poll (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { validate } from '../model/validate.js';
import { ROLES } from '../model/data.js';

let timer = 0;
let pollStep = 0;
let pollResults = null;
let allGo = false;

export const gonogoScene = {
  enter(state) {
    timer = 0;
    pollStep = 0;

    pollResults = validate(state, state.difficulty);
    allGo = pollResults.isValid;

    if (state.firstPollAttempted === undefined) {
      state.firstPollAttempted = true;
      if (allGo) {
        state.allGoFirstPoll = true;
      }
    }
  },

  update(dt, state, sceneManager) {
    timer += dt;

    // Step through role announcements every 0.6s
    if (pollStep < 4 && timer > (pollStep + 1) * 0.5) {
      pollStep++;
      if (pollStep === 4) {
        if (allGo) sfx.win();
        else sfx.cancel();
      } else {
        sfx.select();
      }
    }

    if (pollStep >= 4) {
      if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
        if (allGo) {
          sfx.confirm();
          sceneManager.go('launch');
        } else {
          sfx.cancel();
          sceneManager.go('hangar');
        }
      }
      if (input.isPressed('ESC')) {
        sfx.cancel();
        sceneManager.go('hangar');
      }
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    // Mission Control Header
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.line(ctx, 0, 26, 480, 26, 12);
    gfx.centerText(ctx, 'FLIGHT READINESS REVIEW: GO / NO-GO CONSOLE POLL', 8, 10, 1);

    const rolesList = [
      { key: 'planner', name: 'FLIGHT PLANNER', role: ROLES[0], verdict: pollResults.roleVerdicts.planner },
      { key: 'engineer', name: 'CHIEF ENGINEER', role: ROLES[1], verdict: pollResults.roleVerdicts.engineer },
      { key: 'scientist', name: 'PROJECT SCIENTIST', role: ROLES[2], verdict: pollResults.roleVerdicts.scientist },
      { key: 'comms', name: 'TELEMETRY & COMMS', role: ROLES[3], verdict: pollResults.roleVerdicts.comms }
    ];

    const boxY = [35, 82, 129, 176];

    for (let i = 0; i < 4; i++) {
      const r = rolesList[i];
      const revealed = pollStep > i;
      const y = boxY[i];

      gfx.rect(ctx, 25, y, 430, 40, 1);
      gfx.rectb(ctx, 25, y, 430, 40, revealed ? (r.verdict.go ? 11 : 8) : 5);

      // Icon & Role Name
      gfx.text(ctx, `${r.role.icon} ${r.name}`, 35, y + 8, 7, 1);

      if (revealed) {
        // Verdict Badge
        const isGo = r.verdict.go;
        gfx.rect(ctx, 360, y + 6, 80, 16, isGo ? 3 : 2);
        gfx.rectb(ctx, 360, y + 6, 80, 16, isGo ? 11 : 8);
        gfx.text(ctx, isGo ? 'GO FOR FLIGHT' : 'NO-GO (HOLD)', 365, y + 11, isGo ? 11 : 8, 1);

        // Explanation Reason
        gfx.text(ctx, r.verdict.reason.toUpperCase(), 35, y + 24, isGo ? 10 : 9, 1);
      } else {
        gfx.text(ctx, 'POLLING CONSOLE...', 365, y + 11, 5, 1);
      }
    }

    // Flight Director Verdict Banner
    if (pollStep >= 4) {
      gfx.rect(ctx, 25, 222, 430, 36, 1);
      gfx.rectb(ctx, 25, 222, 430, 36, allGo ? 11 : 8);

      if (allGo) {
        gfx.centerText(ctx, 'ALL CONSOLES REPORT GO! FLIGHT DIRECTOR CLEARS COUNTDOWN!', 228, 11, 1);
        if (Math.floor(timer * 3) % 2 === 0) {
          gfx.centerText(ctx, '► PRESS ENTER TO PROCEED TO LAUNCH PAD ◄', 242, 10, 1);
        }
      } else {
        gfx.centerText(ctx, 'COUNTDOWN ABORTED! RESOLVE NO-GO DEFICITS BEFORE FLIGHT.', 228, 8, 1);
        gfx.centerText(ctx, '► PRESS ENTER OR ESC TO RETURN TO HANGAR WORKSHOP ◄', 242, 7, 1);
      }
    }
  }
};
