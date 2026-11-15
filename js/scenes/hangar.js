/**
 * Scene: Spacecraft Assembly Hangar (Pixel Workshop)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio, sfx } from '../core/audio.js';
import {
  BUSES,
  POWER,
  COMMS,
  PROPULSION,
  INSTRUMENTS,
  LAUNCHERS
} from '../model/data.js';
import {
  dryMass,
  wetMass,
  totalCost,
  powerGenerated,
  powerUsed,
  deltaV,
  downlinkGbPerDay,
  dailyData,
  launchCapacityOk,
  makeFlightStats
} from '../model/engine.js';
import { validate } from '../model/validate.js';
import { drawCompositeShip } from '../core/sprites.js';

const CATEGORIES = ['BUS', 'POWER', 'COMMS', 'PROPULSION', 'INSTRUMENTS', 'FUEL', 'LAUNCHER'];

let selectedCategory = 0;
let instrumentSubIndex = 0;
let timer = 0;
let launchCheckActive = false;
let validationResult = null;

export const hangarScene = {
  enter(state) {
    timer = 0;
    launchCheckActive = false;
    selectedCategory = 0;
    instrumentSubIndex = 0;

    // Set sensible defaults if null
    if (!state.bus) state.bus = BUSES[1]; // Medium
    if (!state.power) state.power = POWER[1]; // Solar M
    if (!state.comms) state.comms = COMMS[1]; // Medium
    if (!state.propulsion) state.propulsion = PROPULSION[0]; // Chemical
    if (!Array.isArray(state.instruments) || state.instruments.length === 0) {
      state.instruments = [INSTRUMENTS[0]]; // Camera
    }
    if (!state.launcher) state.launcher = LAUNCHERS[1]; // Medium Workhorse
    if (state.propellantKg === undefined) state.propellantKg = 1800;

    audio.startHangarBGM();
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (launchCheckActive) {
      if (input.isPressed('ESC') || input.isPressed('DOWN') || input.isPressed('UP')) {
        launchCheckActive = false;
        sfx.cancel();
      } else if (input.isPressed('ENTER') || input.isPressed('ACTION')) {
        if (validationResult && validationResult.isValid) {
          sfx.confirm();
          audio.stopBGM();
          state.flight = makeFlightStats(state);
          sceneManager.go('launch');
        } else {
          sfx.cancel();
          launchCheckActive = false;
        }
      }
      return;
    }

    // Category navigation
    if (input.isPressed('UP')) {
      sfx.select();
      selectedCategory = (selectedCategory - 1 + CATEGORIES.length) % CATEGORIES.length;
    }
    if (input.isPressed('DOWN')) {
      sfx.select();
      selectedCategory = (selectedCategory + 1) % CATEGORIES.length;
    }

    // Option Cycling within Category
    if (input.isPressed('LEFT')) {
      this.cycleOption(state, -1);
    }
    if (input.isPressed('RIGHT')) {
      this.cycleOption(state, 1);
    }

    // Space toggles instrument selection
    if (selectedCategory === 4 && input.isPressed('ACTION')) {
      const curInst = INSTRUMENTS[instrumentSubIndex];
      const idx = state.instruments.findIndex(i => i.id === curInst.id);
      if (idx >= 0) {
        state.instruments.splice(idx, 1);
        sfx.cancel();
      } else {
        state.instruments.push(curInst);
        sfx.confirm();
      }
    }

    // Check Flight Readiness / Launch
    if (input.isPressed('ENTER')) {
      validationResult = validate(state);
      launchCheckActive = true;
      if (validationResult.isValid) {
        sfx.confirm();
      } else {
        sfx.cancel();
      }
    }

    if (input.isPressed('ESC')) {
      audio.stopBGM();
      sfx.cancel();
      sceneManager.go('select');
    }
  },

  cycleOption(state, dir) {
    sfx.select();
    if (selectedCategory === 0) { // BUS
      let idx = BUSES.findIndex(b => b.id === state.bus.id);
      idx = (idx + dir + BUSES.length) % BUSES.length;
      state.bus = BUSES[idx];
    } else if (selectedCategory === 1) { // POWER
      let idx = POWER.findIndex(p => p.id === state.power.id);
      idx = (idx + dir + POWER.length) % POWER.length;
      state.power = POWER[idx];
    } else if (selectedCategory === 2) { // COMMS
      let idx = COMMS.findIndex(c => c.id === state.comms.id);
      idx = (idx + dir + COMMS.length) % COMMS.length;
      state.comms = COMMS[idx];
    } else if (selectedCategory === 3) { // PROPULSION
      let idx = PROPULSION.findIndex(p => p.id === state.propulsion.id);
      idx = (idx + dir + PROPULSION.length) % PROPULSION.length;
      state.propulsion = PROPULSION[idx];
    } else if (selectedCategory === 4) { // INSTRUMENTS (select sub-instrument)
      instrumentSubIndex = (instrumentSubIndex + dir + INSTRUMENTS.length) % INSTRUMENTS.length;
    } else if (selectedCategory === 5) { // FUEL
      const step = 100;
      state.propellantKg = Math.max(0, Math.min(5000, (state.propellantKg || 0) + dir * step));
    } else if (selectedCategory === 6) { // LAUNCHER
      let idx = LAUNCHERS.findIndex(l => l.id === state.launcher.id);
      idx = (idx + dir + LAUNCHERS.length) % LAUNCHERS.length;
      state.launcher = LAUNCHERS[idx];
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    // Draw Top 5 HUD Meters Bar (Y: 0 to 22)
    this.drawHUD(ctx, state);

    // Left Half: Assembly Bay (X: 6, Y: 26, W: 138, H: 136)
    gfx.rect(ctx, 6, 26, 138, 136, 1);
    gfx.rectb(ctx, 6, 26, 138, 136, 5);

    // Blueprint grid lines
    for (let gx = 16; gx < 144; gx += 16) {
      gfx.line(ctx, gx, 27, gx, 161, 0);
    }
    for (let gy = 36; gy < 162; gy += 16) {
      gfx.line(ctx, 7, gy, 143, gy, 0);
    }

    gfx.text(ctx, 'ASSEMBLY BAY', 12, 30, 6, 1);

    // Draw the dynamic assembled ship in center of bay
    drawCompositeShip(ctx, state, 75, 88, 2, false);

    // Sub-specs summary under ship
    const dry = dryMass(state);
    const wet = wetMass(state);
    const dv = deltaV(state);
    gfx.text(ctx, `DRY: ${dry}KG  WET: ${wet}KG`, 12, 142, 7, 1);
    gfx.text(ctx, `DELTA-V: ${dv} KM/S`, 12, 151, 10, 1);

    // Right Half: Subsystem Configuration Menu (X: 148, Y: 26, W: 166, H: 136)
    gfx.rect(ctx, 148, 26, 166, 136, 1);
    gfx.rectb(ctx, 148, 26, 166, 136, 12);

    gfx.text(ctx, 'SUBSYSTEMS', 154, 30, 10, 1);

    // List Categories
    const startY = 42;
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const isSel = i === selectedCategory;
      const y = startY + i * 11;

      if (isSel) {
        gfx.text(ctx, `►`, 152, y, 10, 1);
        gfx.rect(ctx, 160, y - 1, 148, 9, 2);
      }

      gfx.text(ctx, cat, 162, y, isSel ? 7 : 6, 1);

      // Short value on the right
      let valStr = '';
      if (i === 0) valStr = state.bus.name.split(' ')[0];
      else if (i === 1) valStr = state.power.type.toUpperCase();
      else if (i === 2) valStr = state.comms.id.toUpperCase();
      else if (i === 3) valStr = state.propulsion.id === 'ion' ? 'ION' : 'CHEM';
      else if (i === 4) valStr = `${state.instruments.length} INST`;
      else if (i === 5) valStr = `${state.propellantKg}KG`;
      else if (i === 6) valStr = state.launcher.name.split(' ')[0];

      gfx.text(ctx, valStr, 255, y, isSel ? 10 : 7, 1);
    }

    // Detail Panel at bottom of right half (Y: 120 to 158)
    gfx.line(ctx, 148, 120, 314, 120, 5);
    this.drawItemDetails(ctx, state);

    // Bottom Action Prompt
    gfx.centerText(ctx, 'ARROWS: SELECT/CYCLE   ENTER: LAUNCH CHECK', 168, 7, 1);

    // If Launch Check modal is open, overlay it
    if (launchCheckActive) {
      this.drawLaunchCheckModal(ctx, state);
    }
  },

  drawHUD(ctx, state) {
    gfx.rect(ctx, 0, 0, 320, 22, 1);
    gfx.line(ctx, 0, 22, 320, 22, 5);

    const cost = totalCost(state);
    const budget = state.mission ? state.mission.budget : 250;
    const costViolated = cost > budget;

    const wet = wetMass(state);
    const cap = state.launcher ? state.launcher.payloadToLeoKg : 5000;
    const massViolated = wet > cap;

    const pGen = powerGenerated(state);
    const pUsed = powerUsed(state);
    const powerViolated = pGen < pUsed;

    const dv = deltaV(state);
    const dvReq = state.mission ? state.mission.deltaVNeeded : 0;
    const dvViolated = dvReq > 0 && dv < dvReq;

    const dl = downlinkGbPerDay(state);
    const gen = dailyData(state);
    const dataWarn = gen > 0 && dl < gen;

    const blink = Math.floor(timer * 5) % 2 === 0;

    // 1. Budget Bar (X: 4, W: 58)
    const costPct = Math.min(100, Math.round((cost / budget) * 100));
    gfx.text(ctx, `$${cost}/${budget}M`, 4, 3, (costViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 4, 12, 58, 6, costPct, costViolated ? 8 : 11, 1);

    // 2. Mass Bar (X: 66, W: 58)
    const massPct = Math.min(100, Math.round((wet / cap) * 100));
    gfx.text(ctx, `${wet}/${cap}K`, 66, 3, (massViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 66, 12, 58, 6, massPct, massViolated ? 8 : 11, 1);

    // 3. Power Bar (X: 128, W: 58)
    const pPct = pUsed > 0 ? Math.min(100, Math.round((pGen / pUsed) * 100)) : 100;
    gfx.text(ctx, `PWR:${pGen}W`, 128, 3, (powerViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 128, 12, 58, 6, pPct, powerViolated ? 8 : 10, 1);

    // 4. Delta-V Bar (X: 190, W: 58)
    const dvPct = dvReq > 0 ? Math.min(100, Math.round((dv / dvReq) * 100)) : 100;
    gfx.text(ctx, `DV:${dv}/${dvReq}`, 190, 3, (dvViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 190, 12, 58, 6, dvPct, dvViolated ? 8 : 11, 1);

    // 5. Data Bar (X: 252, W: 64)
    const dataPct = (gen + dl > 0) ? Math.min(100, Math.round((Math.min(dl, gen) / gen) * 100)) : 100;
    gfx.text(ctx, `DL:${dl}GB`, 252, 3, (dataWarn && blink) ? 9 : 7, 1);
    gfx.bar(ctx, 252, 12, 64, 6, dataPct, dataWarn ? 9 : 12, 1);
  },

  drawItemDetails(ctx, state) {
    const y = 124;
    if (selectedCategory === 0) {
      const b = state.bus;
      gfx.text(ctx, `◄ ${b.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `MASS: ${b.massKg}KG  COST: $${b.cost}M`, 154, y + 10, 6, 1);
      gfx.text(ctx, `PAYLOAD MAX: ${b.maxPayloadKg}KG`, 154, y + 20, 10, 1);
      gfx.text(ctx, b.desc.toUpperCase(), 154, y + 29, 13, 1);
    } else if (selectedCategory === 1) {
      const p = state.power;
      gfx.text(ctx, `◄ ${p.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `MASS: ${p.massKg}KG  COST: $${p.cost}M`, 154, y + 10, 6, 1);
      const au = state.mission ? state.mission.sunDistanceAU : 1.0;
      const gen = p.type === 'rtg' ? p.fixedW : Math.round(p.areaM2 * (1361 / (au * au)) * 0.28);
      gfx.text(ctx, `GEN @ TARGET: ${gen} WATTS`, 154, y + 20, 11, 1);
      gfx.text(ctx, p.desc.toUpperCase(), 154, y + 29, 13, 1);
    } else if (selectedCategory === 2) {
      const c = state.comms;
      gfx.text(ctx, `◄ ${c.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `MASS: ${c.massKg}KG  COST: $${c.cost}M`, 154, y + 10, 6, 1);
      const loss = state.mission ? state.mission.linkLoss : 1;
      const dl = Math.min(200, Math.round(((c.txPowerW * c.gain / loss) * 10) * 10) / 10);
      gfx.text(ctx, `DOWNLINK: ${dl} GB/DAY`, 154, y + 20, 12, 1);
      gfx.text(ctx, c.desc.toUpperCase(), 154, y + 29, 13, 1);
    } else if (selectedCategory === 3) {
      const pr = state.propulsion;
      gfx.text(ctx, `◄ ${pr.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `ISP: ${pr.ispSec}S  COST: $${pr.cost}M`, 154, y + 10, 6, 1);
      gfx.text(ctx, `EXTRA PWR: ${pr.extraPowerW}W`, 154, y + 20, 10, 1);
      gfx.text(ctx, pr.desc.toUpperCase(), 154, y + 29, 13, 1);
    } else if (selectedCategory === 4) {
      const inst = INSTRUMENTS[instrumentSubIndex];
      const installed = state.instruments.some(i => i.id === inst.id);
      gfx.text(ctx, `◄ ${inst.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `SPACE = [${installed ? 'INSTALLED X' : 'EQUIP +'}]`, 154, y + 10, installed ? 11 : 9, 1);
      gfx.text(ctx, `SCI: +${inst.science}  DATA: ${inst.dataGbPerDay}GB`, 154, y + 20, 10, 1);
      gfx.text(ctx, inst.desc.toUpperCase(), 154, y + 29, 13, 1);
    } else if (selectedCategory === 5) {
      gfx.text(ctx, `◄ PROPELLANT TANK ►`, 154, y, 7, 1);
      gfx.text(ctx, `AMOUNT: ${state.propellantKg} KG`, 154, y + 10, 10, 1);
      gfx.text(ctx, `COST: $${((state.propellantKg || 0) * 0.01).toFixed(1)}M`, 154, y + 20, 6, 1);
      gfx.text(ctx, `LEFT/RIGHT: ADJUST PROPELLANT`, 154, y + 29, 13, 1);
    } else if (selectedCategory === 6) {
      const l = state.launcher;
      gfx.text(ctx, `◄ ${l.name.toUpperCase()} ►`, 154, y, 7, 1);
      gfx.text(ctx, `CAPACITY: ${l.payloadToLeoKg}KG LEO`, 154, y + 10, 6, 1);
      gfx.text(ctx, `COST: $${l.cost}M  REL: ${(l.reliability * 100).toFixed(0)}%`, 154, y + 20, 11, 1);
      gfx.text(ctx, l.desc.toUpperCase(), 154, y + 29, 13, 1);
    }
  },

  drawLaunchCheckModal(ctx, state) {
    // Backdrop
    gfx.rect(ctx, 20, 30, 280, 126, 0);
    gfx.rectb(ctx, 20, 30, 280, 126, validationResult.isValid ? 11 : 8);

    gfx.rect(ctx, 22, 32, 276, 16, validationResult.isValid ? 3 : 2);
    gfx.centerText(ctx, validationResult.isValid ? 'READY FOR FLIGHT' : 'LAUNCH BLOCKED: ERRORS', 36, 7, 1);

    if (!validationResult.isValid) {
      let ey = 55;
      for (let i = 0; i < Math.min(4, validationResult.errors.length); i++) {
        gfx.text(ctx, `X ${validationResult.errors[i].toUpperCase()}`, 30, ey, 8, 1);
        ey += 11;
      }
      gfx.centerText(ctx, 'PRESS ESC TO FIX DESIGN', 136, 9, 1);
    } else {
      gfx.centerText(ctx, 'ALL CRITICAL CHECKS NOMINAL', 62, 11, 1);
      gfx.centerText(ctx, `TOTAL MASS: ${wetMass(state)} KG`, 76, 7, 1);
      gfx.centerText(ctx, `TOTAL COST: $${totalCost(state)}M`, 88, 7, 1);
      gfx.centerText(ctx, `DELTA-V: ${deltaV(state)} KM/S`, 100, 10, 1);

      if (validationResult.warnings.length > 0) {
        gfx.centerText(ctx, `ADVISORY: ${validationResult.warnings[0].toUpperCase()}`, 115, 9, 1);
      }

      if (Math.floor(timer * 3) % 2 === 0) {
        gfx.centerText(ctx, '► PRESS ENTER TO IGNITE ◄', 136, 10, 1);
      }
    }
  }
};
