/**
 * Scene: Spacecraft Assembly Hangar (480x270 Pixel Workshop)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio, sfx } from '../core/audio.js';
import {
  ORBITS,
  BUSES,
  POWER,
  BATTERIES,
  COMMS,
  ADCS,
  PROPULSION,
  INSTRUMENTS,
  LAUNCHERS,
  ROLES
} from '../model/data.js';
import {
  dryMass,
  wetMass,
  totalCost,
  effectiveBudget,
  powerGenerated,
  powerUsed,
  deltaV,
  deltaVNeeded,
  downlinkGbPerDay,
  dailyData,
  launcherCapacity,
  totalSchedule,
  makeFlightStats
} from '../model/engine.js';
import { validate } from '../model/validate.js';
import { drawCompositeShip } from '../core/sprites.js';

const CATEGORIES = [
  'ORBIT',
  'BUS',
  'POWER',
  'BATTERY',
  'COMMS',
  'ADCS',
  'ENGINE',
  'INSTRUMENTS',
  'FUEL',
  'LAUNCHER'
];

let selectedCategory = 0;
let instrumentSubIndex = 0;
let timer = 0;

export const hangarScene = {
  enter(state) {
    timer = 0;
    selectedCategory = 0;
    instrumentSubIndex = 0;

    // Set standard defaults
    if (!state.orbit) state.orbit = ORBITS[1]; // Mid / Sun-sync
    if (!state.bus) state.bus = BUSES[1]; // Medium Bus
    if (!state.power) state.power = POWER[1]; // Solar M
    if (!state.battery) state.battery = BATTERIES[0]; // Basic
    if (!state.comms) state.comms = COMMS[1]; // Medium Dish
    if (!state.adcs) state.adcs = ADCS[0]; // Basic
    if (!state.propulsion) state.propulsion = PROPULSION[0]; // Chemical
    if (!Array.isArray(state.instruments) || state.instruments.length === 0) {
      state.instruments = [INSTRUMENTS[0]]; // Camera
    }
    if (!state.launcher) state.launcher = LAUNCHERS[1]; // Medium Booster
    if (state.propellantKg === undefined) state.propellantKg = 1800;

    audio.startHangarBGM();
  },

  update(dt, state, sceneManager) {
    timer += dt;

    if (input.isPressed('UP')) {
      sfx.select();
      selectedCategory = (selectedCategory - 1 + CATEGORIES.length) % CATEGORIES.length;
    }
    if (input.isPressed('DOWN')) {
      sfx.select();
      selectedCategory = (selectedCategory + 1) % CATEGORIES.length;
    }

    if (input.isPressed('LEFT')) {
      this.cycleOption(state, -1);
    }
    if (input.isPressed('RIGHT')) {
      this.cycleOption(state, 1);
    }

    // Toggle instrument
    if (selectedCategory === 7 && input.isPressed('ACTION')) {
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

    // Go to Go/No-Go Poll
    if (input.isPressed('ENTER')) {
      sfx.confirm();
      audio.stopBGM();
      state.flight = makeFlightStats(state);
      sceneManager.go('gonogo');
    }

    // Hotkey for Codex
    if (input.isPressed('H')) {
      sfx.confirm();
      sceneManager.go('codex');
    }

    if (input.isPressed('ESC')) {
      audio.stopBGM();
      sfx.cancel();
      sceneManager.go('select');
    }
  },

  cycleOption(state, dir) {
    sfx.select();
    if (selectedCategory === 0) { // ORBIT
      let idx = ORBITS.findIndex(o => o.id === state.orbit.id);
      idx = (idx + dir + ORBITS.length) % ORBITS.length;
      state.orbit = ORBITS[idx];
    } else if (selectedCategory === 1) { // BUS
      let idx = BUSES.findIndex(b => b.id === state.bus.id);
      idx = (idx + dir + BUSES.length) % BUSES.length;
      state.bus = BUSES[idx];
    } else if (selectedCategory === 2) { // POWER
      let idx = POWER.findIndex(p => p.id === state.power.id);
      idx = (idx + dir + POWER.length) % POWER.length;
      state.power = POWER[idx];
    } else if (selectedCategory === 3) { // BATTERY
      let idx = BATTERIES.findIndex(b => b.id === state.battery.id);
      idx = (idx + dir + BATTERIES.length) % BATTERIES.length;
      state.battery = BATTERIES[idx];
    } else if (selectedCategory === 4) { // COMMS
      let idx = COMMS.findIndex(c => c.id === state.comms.id);
      idx = (idx + dir + COMMS.length) % COMMS.length;
      state.comms = COMMS[idx];
    } else if (selectedCategory === 5) { // ADCS
      let idx = ADCS.findIndex(a => a.id === state.adcs.id);
      idx = (idx + dir + ADCS.length) % ADCS.length;
      state.adcs = ADCS[idx];
    } else if (selectedCategory === 6) { // ENGINE
      let idx = PROPULSION.findIndex(p => p.id === state.propulsion.id);
      idx = (idx + dir + PROPULSION.length) % PROPULSION.length;
      state.propulsion = PROPULSION[idx];
    } else if (selectedCategory === 7) { // INSTRUMENTS
      instrumentSubIndex = (instrumentSubIndex + dir + INSTRUMENTS.length) % INSTRUMENTS.length;
    } else if (selectedCategory === 8) { // FUEL
      state.propellantKg = Math.max(0, Math.min(5000, (state.propellantKg || 0) + dir * 100));
    } else if (selectedCategory === 9) { // LAUNCHER
      let idx = LAUNCHERS.findIndex(l => l.id === state.launcher.id);
      idx = (idx + dir + LAUNCHERS.length) % LAUNCHERS.length;
      state.launcher = LAUNCHERS[idx];
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    // 1. Top 6 HUD Resource Bars Bar (Y: 0 to 24)
    this.drawTopHUD(ctx, state);

    // 2. Left 54% Spacecraft Assembly Bay (X: 10, Y: 28, W: 245, H: 200)
    gfx.rect(ctx, 10, 28, 245, 204, 1);
    gfx.rectb(ctx, 10, 28, 245, 204, 5);

    // Blue-print grid
    for (let gx = 25; gx < 255; gx += 20) gfx.line(ctx, gx, 29, gx, 231, 0);
    for (let gy = 40; gy < 232; gy += 20) gfx.line(ctx, 11, gy, 254, gy, 0);

    gfx.text(ctx, 'ASSEMBLY BAY: LIVE PROBE INTEGRATION', 18, 33, 6, 1);

    // Draw the modular composite ship
    drawCompositeShip(ctx, state, 130, 115, 2.2, false);

    // Left Bottom Specs Readout
    const dry = dryMass(state);
    const wet = wetMass(state);
    const dv = deltaV(state);
    const dvReq = deltaVNeeded(state);
    const pGen = powerGenerated(state);
    const pUsed = powerUsed(state);

    gfx.text(ctx, `DRY: ${dry}KG   WET: ${wet}KG`, 18, 195, 7, 1);
    gfx.text(ctx, `DELTA-V: ${dv} / ${dvReq} KM/S`, 18, 207, dv >= dvReq ? 10 : 8, 1);
    gfx.text(ctx, `POWER: ${pGen}W GEN / ${pUsed}W LOAD`, 18, 219, pGen >= pUsed ? 11 : 8, 1);

    // 3. Right 46% Subsystems Menu (X: 260, Y: 28, W: 210, H: 204)
    gfx.rect(ctx, 260, 28, 210, 204, 1);
    gfx.rectb(ctx, 260, 28, 210, 204, 12);

    gfx.text(ctx, 'SUBSYSTEMS CATALOG', 270, 33, 10, 1);

    // Which team role owns current category
    const activeRole = this.getActiveRole(selectedCategory);
    gfx.text(ctx, `ROLE: [${activeRole.name}]`, 370, 33, 13, 1);

    const startY = 46;
    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const isSel = i === selectedCategory;
      const y = startY + i * 11;

      if (isSel) {
        gfx.text(ctx, '►', 264, y, 10, 1);
        gfx.rect(ctx, 272, y - 1, 192, 9, 2);
      }

      gfx.text(ctx, cat, 274, y, isSel ? 7 : 6, 1);

      let valStr = '';
      if (i === 0) valStr = state.orbit.name.split(' ')[0];
      else if (i === 1) valStr = state.bus.name.split(' ')[0];
      else if (i === 2) valStr = state.power.type.toUpperCase();
      else if (i === 3) valStr = state.battery.id === 'bat_adv' ? 'ADV' : 'BASIC';
      else if (i === 4) valStr = state.comms.id.toUpperCase();
      else if (i === 5) valStr = state.adcs.id === 'adcs_precise' ? 'PRECISE' : 'BASIC';
      else if (i === 6) valStr = state.propulsion.id === 'ion' ? 'ION' : 'CHEM';
      else if (i === 7) valStr = `${state.instruments.length} INST`;
      else if (i === 8) valStr = `${state.propellantKg}KG`;
      else if (i === 9) valStr = state.launcher.name.split(' ')[0];

      gfx.text(ctx, valStr, 395, y, isSel ? 10 : 7, 1);
    }

    // Detail Box at bottom right (Y: 158 to 226)
    gfx.line(ctx, 260, 158, 470, 158, 5);
    this.drawDetailsBox(ctx, state);

    // 4. Bottom Control Bar (Y: 236 to 270)
    gfx.rect(ctx, 0, 236, 480, 34, 1);
    gfx.line(ctx, 0, 236, 480, 236, 5);
    gfx.centerText(ctx, 'ARROWS: SELECT/CYCLE   SPACE: TOGGLE INST   ENTER: GO/NO-GO POLL   H: CODEX', 248, 7, 1);
  },

  getActiveRole(catIdx) {
    if (catIdx === 0 || catIdx === 9) return ROLES[0]; // PLANNER
    if ([1, 2, 3, 6, 8].includes(catIdx)) return ROLES[1]; // ENGINEER
    if (catIdx === 7) return ROLES[2]; // SCIENTIST
    return ROLES[3]; // COMMS
  },

  drawTopHUD(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 26, 1);
    gfx.line(ctx, 0, 26, 480, 26, 5);

    const cost = totalCost(state);
    const budget = effectiveBudget(state);
    const costViolated = cost > budget;

    const wet = wetMass(state);
    const cap = launcherCapacity(state);
    const massViolated = wet > cap;

    const pGen = powerGenerated(state);
    const pUsed = powerUsed(state);
    const powerViolated = pGen < pUsed;

    const dv = deltaV(state);
    const dvReq = deltaVNeeded(state);
    const dvViolated = dvReq > 0 && dv < dvReq;

    const dl = downlinkGbPerDay(state);
    const gen = dailyData(state);
    const dataWarn = gen > 0 && dl < gen;

    const sched = totalSchedule(state);
    const deadline = state.mission ? state.mission.deadlineMonths : 24;
    const schedViolated = sched > deadline + 6;
    const schedWarn = sched > deadline;

    const blink = Math.floor(timer * 5) % 2 === 0;

    // 6 HUD meters across 480 px (each ~75 px wide)
    // 1. BUDGET (X: 5)
    gfx.text(ctx, `$${cost}/${budget}M`, 5, 4, (costViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 5, 15, 70, 7, Math.min(100, Math.round((cost / budget) * 100)), costViolated ? 8 : 11, 0);

    // 2. MASS (X: 82)
    gfx.text(ctx, `${wet}/${cap}KG`, 82, 4, (massViolated && blink) ? 8 : 7, 1);
    gfx.bar(ctx, 82, 15, 70, 7, Math.min(100, Math.round((wet / cap) * 100)), massViolated ? 8 : 11, 0);

    // 3. POWER (X: 160)
    gfx.text(ctx, `PWR:${pGen}/${pUsed}W`, 160, 4, (powerViolated && blink) ? 8 : 7, 1);
    const pPct = pUsed > 0 ? Math.min(100, Math.round((pGen / pUsed) * 100)) : 100;
    gfx.bar(ctx, 160, 15, 70, 7, pPct, powerViolated ? 8 : 10, 0);

    // 4. DELTA-V (X: 238)
    gfx.text(ctx, `DV:${dv}/${dvReq}`, 238, 4, (dvViolated && blink) ? 8 : 7, 1);
    const dvPct = dvReq > 0 ? Math.min(100, Math.round((dv / dvReq) * 100)) : 100;
    gfx.bar(ctx, 238, 15, 70, 7, dvPct, dvViolated ? 8 : 11, 0);

    // 5. DATA (X: 316)
    gfx.text(ctx, `DL:${dl}GB/D`, 316, 4, (dataWarn && blink) ? 9 : 7, 1);
    const dPct = (gen + dl > 0) ? Math.min(100, Math.round((Math.min(dl, gen) / gen) * 100)) : 100;
    gfx.bar(ctx, 316, 15, 70, 7, dPct, dataWarn ? 9 : 12, 0);

    // 6. SCHEDULE (X: 395)
    gfx.text(ctx, `TIME:${sched}/${deadline}MO`, 395, 4, (schedViolated && blink) ? 8 : (schedWarn ? 9 : 7), 1);
    const sPct = Math.min(100, Math.round((sched / deadline) * 100));
    gfx.bar(ctx, 395, 15, 75, 7, sPct, schedViolated ? 8 : (schedWarn ? 9 : 14), 0);
  },

  drawDetailsBox(ctx, state) {
    const y = 163;
    if (selectedCategory === 0) {
      const o = state.orbit;
      gfx.text(ctx, `◄ ${o.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `SCI: x${o.sciMult}  DL: x${o.downlinkMult}`, 265, y + 11, 10, 1);
      gfx.text(ctx, `RAD CHANCE: ${(o.radChance * 100).toFixed(0)}%`, 265, y + 22, 14, 1);
      gfx.text(ctx, o.desc.toUpperCase(), 265, y + 33, 6, 1);
    } else if (selectedCategory === 1) {
      const b = state.bus;
      gfx.text(ctx, `◄ ${b.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `MASS: ${b.massKg}KG  COST: $${b.cost}M  DEV: ${b.devMonths}MO`, 265, y + 11, 6, 1);
      gfx.text(ctx, `PAYLOAD MAX: ${b.maxPayloadKg}KG  HP: ${b.hearts}`, 265, y + 22, 10, 1);
      gfx.text(ctx, b.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 2) {
      const p = state.power;
      gfx.text(ctx, `◄ ${p.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `MASS: ${p.massKg}KG  COST: $${p.cost}M  DEV: ${p.devMonths}MO`, 265, y + 11, 6, 1);
      const au = state.mission ? state.mission.sunDistanceAU : 1.0;
      const gen = p.type === 'rtg' ? p.fixedW : Math.round(p.areaM2 * (1361 / (au * au)) * 0.28);
      gfx.text(ctx, `YIELD @ TARGET: ${gen} WATTS`, 265, y + 22, 11, 1);
      gfx.text(ctx, p.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 3) {
      const bat = state.battery;
      gfx.text(ctx, `◄ ${bat.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `MASS: ${bat.massKg}KG  COST: $${bat.cost}M  DEV: ${bat.devMonths}MO`, 265, y + 11, 6, 1);
      gfx.text(ctx, `ECLIPSE SHADOW COVERAGE: ${(bat.eclipseCoverage * 100).toFixed(0)}%`, 265, y + 22, 10, 1);
      gfx.text(ctx, bat.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 4) {
      const c = state.comms;
      gfx.text(ctx, `◄ ${c.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `MASS: ${c.massKg}KG  COST: $${c.cost}M  DEV: ${c.devMonths}MO`, 265, y + 11, 6, 1);
      const dl = downlinkGbPerDay(state);
      gfx.text(ctx, `DOWNLINK @ TARGET: ${dl} GB/DAY`, 265, y + 22, 12, 1);
      gfx.text(ctx, c.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 5) {
      const a = state.adcs;
      gfx.text(ctx, `◄ ${a.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `MASS: ${a.massKg}KG  COST: $${a.cost}M  DEV: ${a.devMonths}MO`, 265, y + 11, 6, 1);
      gfx.text(ctx, `POINTING ACCURACY: x${a.pointingMult} (+HIT WINDOW)`, 265, y + 22, 10, 1);
      gfx.text(ctx, a.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 6) {
      const pr = state.propulsion;
      gfx.text(ctx, `◄ ${pr.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `ISP: ${pr.ispSec}S  COST: $${pr.cost}M  DEV: ${pr.devMonths}MO`, 265, y + 11, 6, 1);
      gfx.text(ctx, `EXTRA POWER DRAW: ${pr.extraPowerW}W`, 265, y + 22, 10, 1);
      gfx.text(ctx, pr.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 7) {
      const inst = INSTRUMENTS[instrumentSubIndex];
      const installed = state.instruments.some(i => i.id === inst.id);
      gfx.text(ctx, `◄ ${inst.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `SPACE = [${installed ? 'INSTALLED X' : 'EQUIP +'}]  DEV: ${inst.devMonths}MO`, 265, y + 11, installed ? 11 : 9, 1);
      gfx.text(ctx, `SCI: +${inst.science} PTS  DATA: ${inst.dataGbPerDay} GB/D`, 265, y + 22, 10, 1);
      gfx.text(ctx, inst.desc.toUpperCase(), 265, y + 33, 13, 1);
    } else if (selectedCategory === 8) {
      gfx.text(ctx, `◄ PROPELLANT STORAGE TANK ►`, 265, y, 7, 1);
      gfx.text(ctx, `PROPELLANT MASS: ${state.propellantKg} KG`, 265, y + 11, 10, 1);
      gfx.text(ctx, `COST: $${((state.propellantKg || 0) * 0.01).toFixed(1)}M`, 265, y + 22, 6, 1);
      gfx.text(ctx, 'LEFT/RIGHT: ADJUST PROPELLANT BY 100KG', 265, y + 33, 13, 1);
    } else if (selectedCategory === 9) {
      const l = state.launcher;
      gfx.text(ctx, `◄ ${l.name.toUpperCase()} ►`, 265, y, 7, 1);
      gfx.text(ctx, `LEO CAPACITY: ${l.payloadToLeoKg}KG  LEAD: ${l.leadMonths}MO`, 265, y + 11, 6, 1);
      gfx.text(ctx, `COST: $${l.cost}M  RELIABILITY: ${(l.reliability * 100).toFixed(0)}%`, 265, y + 22, 11, 1);
      gfx.text(ctx, l.desc.toUpperCase(), 265, y + 33, 13, 1);
    }
  }
};
