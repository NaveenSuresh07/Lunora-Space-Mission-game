/**
 * Scene: Orbital Science Operations & Earth Telemetry Downlink (480x270)
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
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
let brownoutTimer = 0;
let inBrownout = false;
let packetAccumulator = 0;

export const opsScene = {
  enter(state) {
    orbitAngle = 0;
    orbitSpeed = 1.1;
    opsTimer = 35;
    packetBuffer = 0;
    packetsDelivered = 0;
    scienceScoreTotal = 0;
    downlinkPackets = [];
    brownoutTimer = 0;
    inBrownout = false;
    packetAccumulator = 0;

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

    // Power Brownout
    const powerPct = (state.flight && state.flight.powerPct) ? state.flight.powerPct : 100;
    if (powerPct < 100 || (inEclipse && batteryCover < 1.0)) {
      brownoutTimer += dt;
      if (!inBrownout && brownoutTimer > 7.0) {
        inBrownout = true;
        brownoutTimer = 0;
        sfx.cancel();
      } else if (inBrownout && brownoutTimer > 3.0) {
        inBrownout = false;
        brownoutTimer = 0;
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
    const scanWin = (state.flight && state.flight.scanWindow) ? state.flight.scanWindow : 0.35;
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
      const estDataGb = Math.round(packetsDelivered * (minData / 20));

      const missionSuccess = scienceScoreTotal >= minSci * 0.7 && estDataGb >= minData * 0.5;

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
    gfx.rect(ctx, 0, 0, 395, 30, 1);
    gfx.text(ctx, `OPS TIME: ${Math.max(0, Math.ceil(opsTimer))}S`, 10, 6, 10, 1);
    gfx.text(ctx, `SCIENCE: ${scienceScoreTotal} PTS (GOAL: ${state.mission ? state.mission.minScience : 40})`, 95, 6, 11, 1);

    const normAngle = ((orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const earthFacing = (normAngle > Math.PI || normAngle < Math.PI * 0.2);
    gfx.text(ctx, `CONTACT: ${earthFacing ? 'LINK ACTIVE (DSN)' : 'OCCULTED (BLIND)'}`, 10, 18, earthFacing ? 11 : 8, 1);
    gfx.text(ctx, `DELIVERED: ${packetsDelivered} PKTS`, 230, 18, 7, 1);

    // Brownout Banner
    if (inBrownout) {
      const blink = Math.floor(opsTimer * 8) % 2 === 0;
      gfx.rect(ctx, 110, 48, 260, 24, 8);
      gfx.centerText(ctx, blink ? 'POWER BROWNOUT! SENSORS OFFLINE!' : '', 56, 10, 1);
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
