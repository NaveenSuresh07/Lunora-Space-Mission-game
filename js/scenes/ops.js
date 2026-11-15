/**
 * Scene: Orbital Science Operations & Earth Telemetry Downlink (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import { downlinkGbPerDay, dailyData } from '../model/engine.js';
import { triggerPhaseEvent } from '../model/events.js';
import {
  drawCompositeShip,
  drawSprite,
  SPRITE_EARTH,
  SPRITE_MOON,
  SPRITE_MARS,
  SPRITE_JUPITER
} from '../core/sprites.js';

let orbitAngle = 0;
let orbitSpeed = 1.1;
let opsTimer = 35;
let packetBuffer = 0;
const bufferMax = 20;
let packetsDelivered = 0;
let scienceScoreTotal = 0;
let targets = [];
let downlinkPackets = [];
let eclipseTimer = 0;
let brownoutTimer = 0;
let inBrownout = false;
let isDimmed = false;
let packetAccumulator = 0;
let opsEvent = null;

export const opsScene = {
  enter(state) {
    orbitAngle = 0;
    orbitSpeed = 1.1;
    opsTimer = 35;
    packetBuffer = 0;
    packetsDelivered = 0;
    scienceScoreTotal = 0;
    downlinkPackets = [];
    eclipseTimer = 0;
    brownoutTimer = 0;
    inBrownout = false;
    isDimmed = false;
    packetAccumulator = 0;
    opsEvent = triggerPhaseEvent('ops', state);

    // Generate scan targets matching installed instruments
    targets = [];
    const insts = (state.flight && state.flight.instruments && state.flight.instruments.length > 0)
      ? state.flight.instruments
      : [{ id: 'camera', name: 'Camera', science: 20, dataGbPerDay: 6, colorIdx: 10 }];

    for (let i = 0; i < 6; i++) {
      const inst = insts[i % insts.length];
      targets.push({
        inst,
        angle: (i * Math.PI * 2) / 6,
        colorIdx: inst.colorIdx !== undefined ? inst.colorIdx : 10,
        scanned: false,
        cooldown: 0
      });
    }

    if (opsEvent && opsEvent.id === 'science_opportunity') {
      targets.push({
        inst: { id: 'geyser', name: 'Cryo-Plume', science: 45, dataGbPerDay: 5, colorIdx: 11 },
        angle: Math.PI * 0.9,
        colorIdx: 11,
        scanned: false,
        cooldown: 0
      });
    }
  },

  update(dt, state, sceneManager) {
    opsTimer -= dt;

    // 1. Orbital Maneuver (Left / Right adjusts speed)
    let curSpeed = orbitSpeed;
    if (input.isDown('LEFT')) curSpeed -= 0.6;
    if (input.isDown('RIGHT')) curSpeed += 0.6;
    orbitAngle += curSpeed * dt;

    // 2. Eclipse Shadow & Battery Check (Right half of planet is shadow)
    const normAngle = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const inEclipse = (normAngle > Math.PI * 0.25 && normAngle < Math.PI * 0.75);
    const batteryCover = state.flight ? state.flight.batteryCover : 0.6;
    const powerPct = (state.flight && state.flight.powerPct) ? state.flight.powerPct : 100;

    // Track continuous eclipse duration & recovery
    if (inEclipse) {
      eclipseTimer += dt;
      if (batteryCover < 1.0) {
        // Basic battery: partial strain after 2.0s, full brownout after 5.5s of continuous shadow
        if (eclipseTimer > 5.5) {
          if (!inBrownout) {
            inBrownout = true;
            sfx.cancel();
          }
        } else if (eclipseTimer > 2.0) {
          isDimmed = true;
        }
      } else {
        // Advanced Space Battery: full coverage throughout eclipse!
        isDimmed = false;
        inBrownout = false;
      }
    } else {
      // In sunlight: immediately reset eclipse timer and recover from shadow brownouts!
      eclipseTimer = 0;
      isDimmed = false;
      if (powerPct >= 100) {
        inBrownout = false;
        brownoutTimer = 0;
      } else {
        // Systemic power deficit even in sunlight:
        brownoutTimer += dt;
        if (!inBrownout && brownoutTimer > 5.0) {
          inBrownout = true;
          brownoutTimer = 0;
          sfx.cancel();
        } else if (inBrownout && brownoutTimer > 2.0) {
          inBrownout = false;
          brownoutTimer = 0;
        }
      }
    }

    // 3. Targets rotation
    for (const t of targets) {
      t.angle += 0.2 * dt;
      if (t.cooldown > 0) {
        t.cooldown -= dt;
        if (t.cooldown <= 0) t.scanned = false;
      }
    }

    // 4. Science Scan with SPACE
    let scanWin = (state.flight && state.flight.scanWindow) ? state.flight.scanWindow : 0.45;
    if (isDimmed) scanWin *= 0.5;

    if (input.isPressed('ACTION') && !inBrownout) {
      let hitTarget = null;
      for (const t of targets) {
        if (t.scanned) continue;
        let diff = Math.abs((orbitAngle % (Math.PI * 2)) - (t.angle % (Math.PI * 2)));
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < scanWin) {
          hitTarget = t;
          break;
        }
      }

      if (hitTarget) {
        hitTarget.scanned = true;
        hitTarget.cooldown = 4.5;
        sfx.scan();

        const sciGain = Math.max(5, Math.round(hitTarget.inst.science / 3));
        scienceScoreTotal += sciGain;

        const genPkt = Math.max(1, Math.round(hitTarget.inst.dataGbPerDay));
        packetBuffer = Math.min(bufferMax + 6, packetBuffer + genPkt);

        const cx = 240 + Math.cos(hitTarget.angle) * 48;
        const cy = 135 + Math.sin(hitTarget.angle) * 48;
        gfx.spawnParticles(cx, cy, 16, hitTarget.colorIdx, 55, 0.4);
      }
    }

    // 5. Downlink Stream (Earth-Facing Half only: normAngle between 1.25pi and 1.75pi)
    const earthFacing = (normAngle > Math.PI || normAngle < Math.PI * 0.2);
    const pps = (state.flight && state.flight.downlinkPps) ? state.flight.downlinkPps : 2.5;

    if (earthFacing && packetBuffer > 0) {
      packetAccumulator += pps * dt;
      while (packetAccumulator >= 1.0 && packetBuffer > 0) {
        packetAccumulator -= 1.0;
        packetBuffer--;
        packetsDelivered++;

        const shipX = 240 + Math.cos(orbitAngle) * 80;
        const shipY = 135 + Math.sin(orbitAngle) * 80;
        downlinkPackets.push({
          x: shipX,
          y: shipY,
          tx: 440,
          ty: 20,
          t: 0
        });
      }
    }

    // Update animated packets
    for (let i = downlinkPackets.length - 1; i >= 0; i--) {
      const p = downlinkPackets[i];
      p.t += dt * 2.5;
      p.x += (p.tx - p.x) * dt * 3.5;
      p.y += (p.ty - p.y) * dt * 3.5;
      if (p.t >= 1.0) {
        downlinkPackets.splice(i, 1);
      }
    }

    // 6. Ops Completion
    if (opsTimer <= 0) {
      sfx.win();

      const minSci = state.mission ? state.mission.minScience : 40;
      const minData = state.mission ? state.mission.minDataGb : 1000;
      const dlGbPerDay = downlinkGbPerDay(state);
      const dailyGen = dailyData(state);
      const durationDays = state.mission ? state.mission.durationDays : 180;

      // Realistic delivered telemetry calculation based on the probe's instruments & antenna:
      const maxDeliverable = Math.min(dailyGen, dlGbPerDay) * durationDays;
      const estDataGb = Math.round(packetsDelivered * (maxDeliverable / 20));

      const missionSuccess = scienceScoreTotal >= minSci && estDataGb >= minData;

      state.flightResult = {
        success: true,
        missionSuccess,
        scienceEarned: scienceScoreTotal,
        dataDelivered: estDataGb
      };

      sceneManager.go('report');
    }
  },

  draw(ctx, state) {
    gfx.rect(ctx, 0, 0, 480, 270, 0);

    const mId = state.mission ? state.mission.id : 'moon';
    const planetSpr = mId === 'jupiter' ? SPRITE_JUPITER : (mId === 'mars' ? SPRITE_MARS : (mId === 'moon' ? SPRITE_MOON : SPRITE_EARTH));

    // Orbit Path Ring (Center 240, 135, radius 80)
    gfx.circleb(ctx, 240, 135, 80, 1);

    // Planet at Center
    drawSprite(ctx, planetSpr, 220, 115, 2.5);

    // Eclipse Shadow Overlay on bottom/right of planet
    gfx.circleb(ctx, 240, 135, 48, 5);

    // Targets on surface
    for (const t of targets) {
      const tx = 240 + Math.cos(t.angle) * 44;
      const ty = 135 + Math.sin(t.angle) * 44;

      if (!t.scanned) {
        const pulse = Math.floor(opsTimer * 6) % 2 === 0;
        gfx.circle(ctx, tx, ty, pulse ? 4 : 3, t.colorIdx);
        gfx.px(ctx, tx, ty, 7);
      } else {
        gfx.px(ctx, tx, ty, 5);
      }
    }

    // Orbiting Spacecraft
    const shipX = 240 + Math.cos(orbitAngle) * 80;
    const shipY = 135 + Math.sin(orbitAngle) * 80;
    drawCompositeShip(ctx, state, shipX, shipY, 1.4, false);

    // Flying packets
    for (const p of downlinkPackets) {
      gfx.px(ctx, p.x, p.y, 12);
    }

    // Earth Ground Station (Top Right X: 415, Y: 6)
    gfx.rect(ctx, 400, 6, 70, 26, 1);
    gfx.rectb(ctx, 400, 6, 70, 26, 12);
    gfx.text(ctx, 'EARTH DSN', 410, 10, 7, 1);
    gfx.text(ctx, '70M DISH', 414, 20, 11, 1);

    // Top HUD
    gfx.rect(ctx, 0, 0, 395, 34, 1);
    gfx.text(ctx, `OPS TIME: ${Math.max(0, Math.ceil(opsTimer))}S`, 10, 6, 10, 1);
    gfx.text(ctx, `SCIENCE: ${scienceScoreTotal} PTS (GOAL: ${state.mission ? state.mission.minScience : 40})`, 95, 6, 11, 1);

    const normAngle = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const inEclipse = (normAngle > Math.PI * 0.25 && normAngle < Math.PI * 0.75);
    const earthFacing = (normAngle > Math.PI || normAngle < Math.PI * 0.2);
    gfx.text(ctx, `CONTACT: ${earthFacing ? 'LINK ACTIVE (DSN)' : 'OCCULTED (BLIND)'}`, 10, 16, earthFacing ? 11 : 8, 1);
    gfx.text(ctx, `DELIVERED: ${packetsDelivered} PKTS`, 230, 16, 7, 1);

    // Battery / Power telemetry
    const batteryCover = state.flight ? state.flight.batteryCover : 0.6;
    const powerPct = (state.flight && state.flight.powerPct) ? state.flight.powerPct : 100;
    if (inEclipse) {
      if (batteryCover >= 1.0) {
        gfx.text(ctx, 'POWER: 100% (ADVANCED CELLS SUSTAIN SHADOW)', 10, 25, 11, 1);
      } else if (inBrownout) {
        const blink = Math.floor(opsTimer * 6) % 2 === 0;
        gfx.text(ctx, blink ? 'POWER: BROWNOUT! RECOVERING IN SUNLIGHT...' : '', 10, 25, 8, 1);
      } else if (isDimmed) {
        gfx.text(ctx, `POWER: BATTERY STRAIN (DIM CONE: ${Math.max(0, Math.ceil(5.5 - eclipseTimer))}S)`, 10, 25, 9, 1);
      } else {
        gfx.text(ctx, `POWER: ECLIPSE SHADOW (${Math.max(0, Math.ceil(5.5 - eclipseTimer))}S REMAINING)`, 10, 25, 10, 1);
      }
    } else {
      if (powerPct < 100) {
        gfx.text(ctx, `POWER: DEFICIT (${powerPct}%) - GENERATOR INSUFFICIENT`, 10, 25, 8, 1);
      } else {
        gfx.text(ctx, 'POWER: NOMINAL (SOLAR CHARGING IN SUNLIGHT)', 10, 25, 11, 1);
      }
    }

    // Brownout Banner
    if (inBrownout) {
      const blink = Math.floor(opsTimer * 8) % 2 === 0;
      gfx.rect(ctx, 110, 52, 260, 22, 8);
      gfx.centerText(ctx, blink ? 'POWER BROWNOUT! SENSORS OFFLINE IN ECLIPSE!' : '', 58, 10, 1);
    }

    // Bottom Packet Buffer Bar (Y: 242)
    const bufY = 246;
    gfx.rect(ctx, 15, bufY, 450, 18, 1);
    gfx.rectb(ctx, 15, bufY, 450, 18, packetBuffer >= bufferMax ? 8 : 12);

    gfx.text(ctx, 'BUFFER', 25, bufY + 5, 7, 1);
    const bufPct = Math.min(100, Math.round((packetBuffer / bufferMax) * 100));
    gfx.bar(ctx, 80, bufY + 5, 260, 10, bufPct, packetBuffer >= bufferMax ? 8 : 12, 0);
    gfx.text(ctx, `${packetBuffer}/${bufferMax} PACKETS`, 355, bufY + 5, packetBuffer >= bufferMax ? 8 : 7, 1);
  }
};
