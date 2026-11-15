/**
 * Scene: Mission Control Stage & Difficulty Select (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { MISSIONS, DIFFICULTIES } from '../model/data.js';
import {
  drawSprite,
  SPRITE_EARTH,
  SPRITE_MOON,
  SPRITE_MARS,
  SPRITE_JUPITER
} from '../core/sprites.js';

let selectedIndex = 0;
let difficultyIndex = 1; // 0: Rookie, 1: Engineer, 2: Flight Director
let playerCount = 1; // 1 to 4 players
let selectMode = 'STAGE'; // 'STAGE', 'DIFFICULTY', 'PLAYERS'
let timer = 0;

export const selectScene = {
  enter(state) {
    timer = 0;
    selectedIndex = 0;
    selectMode = 'STAGE';
    if (state.mission) {
      const idx = MISSIONS.findIndex(m => m.id === state.mission.id);
      if (idx >= 0) selectedIndex = idx;
    }
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (input.isPressed('TAB')) {
      sfx.select();
      selectMode = selectMode === 'STAGE' ? 'DIFFICULTY' : (selectMode === 'DIFFICULTY' ? 'PLAYERS' : 'STAGE');
      return;
    }

    if (selectMode === 'STAGE') {
      if (input.isPressed('LEFT')) {
        sfx.select();
        selectedIndex = (selectedIndex - 1 + MISSIONS.length) % MISSIONS.length;
      }
      if (input.isPressed('RIGHT')) {
        sfx.select();
        selectedIndex = (selectedIndex + 1) % MISSIONS.length;
      }
      if (input.isPressed('DOWN')) {
        sfx.select();
        selectMode = 'DIFFICULTY';
      }
      if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
        sfx.confirm();
        state.mission = MISSIONS[selectedIndex];
        state.difficulty = DIFFICULTIES[difficultyIndex];
        state.playerCount = playerCount;
        sceneManager.go('hangar');
      }
    } else if (selectMode === 'DIFFICULTY') {
      if (input.isPressed('LEFT')) {
        sfx.select();
        difficultyIndex = (difficultyIndex - 1 + DIFFICULTIES.length) % DIFFICULTIES.length;
      }
      if (input.isPressed('RIGHT')) {
        sfx.select();
        difficultyIndex = (difficultyIndex + 1) % DIFFICULTIES.length;
      }
      if (input.isPressed('UP')) {
        sfx.select();
        selectMode = 'STAGE';
      }
      if (input.isPressed('DOWN')) {
        sfx.select();
        selectMode = 'PLAYERS';
      }
      if (input.isPressed('ENTER')) {
        selectMode = 'STAGE';
        sfx.confirm();
      }
    } else if (selectMode === 'PLAYERS') {
      if (input.isPressed('LEFT')) {
        sfx.select();
        playerCount = Math.max(1, playerCount - 1);
      }
      if (input.isPressed('RIGHT')) {
        sfx.select();
        playerCount = Math.min(4, playerCount + 1);
      }
      if (input.isPressed('UP')) {
        sfx.select();
        selectMode = 'DIFFICULTY';
      }
      if (input.isPressed('ENTER')) {
        selectMode = 'STAGE';
        sfx.confirm();
      }
    }

    if (input.isPressed('ESC')) {
      sfx.cancel();
      sceneManager.go('title');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    // Mission Control Top Header
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.line(ctx, 0, 26, 480, 26, 12);
    gfx.centerText(ctx, 'NASA MISSION CONTROL: TARGET DESTINATION', 8, 10, 1);

    const planetSprites = [SPRITE_EARTH, SPRITE_MOON, SPRITE_MARS, SPRITE_JUPITER];
    const planetX = [60, 170, 280, 390];
    const planetY = 62;

    // 4 Mission Destination Cards
    for (let i = 0; i < MISSIONS.length; i++) {
      const m = MISSIONS[i];
      const isSel = (i === selectedIndex && selectMode === 'STAGE');
      const x = planetX[i];
      const y = planetY;

      // Selection Frame
      if (isSel) {
        const pulse = Math.floor(timer * 4) % 2 === 0 ? 10 : 7;
        gfx.rectb(ctx, x - 45, y - 24, 90, 78, pulse);
        gfx.text(ctx, '▲', x - 3, y + 58, 10, 1);
      } else {
        gfx.rectb(ctx, x - 45, y - 24, 90, 78, 5);
      }

      // Planet Sprite
      drawSprite(ctx, planetSprites[i], x - 10, y - 12, 1);

      // Label & Difficulty
      gfx.centerText(ctx, m.target, y + 22, (i === selectedIndex) ? 10 : 6, 1);
      gfx.text(ctx, m.stars, x - 12, y + 34, 9, 1);
      gfx.text(ctx, `$${m.budget}M`, x - 14, y + 44, 11, 1);
    }

    // Detail Panel for selected stage (Y: 135 to 198)
    const cur = MISSIONS[selectedIndex];
    gfx.rect(ctx, 15, 135, 450, 68, 1);
    gfx.rectb(ctx, 15, 135, 450, 68, 12);

    gfx.text(ctx, `MISSION: ${cur.name.toUpperCase()} (STAGE ${cur.stage})`, 25, 142, 7, 1);
    gfx.text(ctx, `HERITAGE: ${cur.inspiredBy.toUpperCase()}`, 250, 142, 6, 1);

    gfx.text(ctx, `BUDGET: $${cur.budget}M`, 25, 154, 11, 1);
    gfx.text(ctx, `DEADLINE: ${cur.deadlineMonths} MONTHS`, 160, 154, 10, 1);
    gfx.text(ctx, `DELTA-V: ${cur.deltaVNeeded > 0 ? cur.deltaVNeeded + ' KM/S' : 'DIRECT'}`, 310, 154, 12, 1);

    const lightStr = cur.oneWayLightSec < 1 ? '<1s' : (cur.oneWayLightSec < 60 ? `${cur.oneWayLightSec}s` : `${Math.round(cur.oneWayLightSec / 60)} min`);
    gfx.text(ctx, `ONE-WAY LIGHT TIME: ${lightStr}`, 25, 166, 14, 1);
    gfx.text(ctx, `MIN SCIENCE: ${cur.minScience} PTS`, 250, 166, 11, 1);

    gfx.text(ctx, cur.desc.toUpperCase(), 25, 180, 6, 1);

    // Difficulty & Player Selectors (Y: 210 to 240)
    // Difficulty
    const diff = DIFFICULTIES[difficultyIndex];
    const diffActive = selectMode === 'DIFFICULTY';
    gfx.rect(ctx, 15, 210, 240, 28, 1);
    gfx.rectb(ctx, 15, 210, 240, 28, diffActive ? 10 : 5);
    gfx.text(ctx, `DIFFICULTY: ◄ ${diff.name} ►`, 25, 216, diffActive ? 10 : 7, 1);
    gfx.text(ctx, diff.desc.toUpperCase(), 25, 226, 6, 1);

    // Players Selector (1 to 4 Players Hot-Seat)
    const playActive = selectMode === 'PLAYERS';
    gfx.rect(ctx, 265, 210, 200, 28, 1);
    gfx.rectb(ctx, 265, 210, 200, 28, playActive ? 10 : 5);
    const pStr = playerCount === 1 ? '1 PLAYER (SOLO)' : `${playerCount} PLAYERS (HOT-SEAT ROLES)`;
    gfx.text(ctx, `CREW: ◄ ${pStr} ►`, 275, 216, playActive ? 10 : 7, 1);
    gfx.text(ctx, 'PLANNER, ENG, SCI, COMMS', 275, 226, 13, 1);

    // Footer prompt
    gfx.centerText(ctx, 'TAB/UP/DOWN: SWITCH MENU   ENTER: ASSEMBLE PROBE IN HANGAR', 252, 7, 1);
  }
};
