/**
 * Scene: Orbital Science Operations & Telemetry Downlink
 */

import { gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { sfx } from '../core/audio.js';
import {
  drawCompositeShip,
  drawSprite,
  SPRITE_EARTH,
  SPRITE_MOON,
  SPRITE_MARS
} from '../core/sprites.js';

let orbitAngle = 0;
let orbitSpeed = 1.2;
let opsTimer = 30; // 30-second science window
let packetBuffer = 0;
const bufferMax = 20;
let packetsDelivered = 0;
let scienceScoreTotal = 0;
let targets = [];
let downlinkPackets = []; // { x, y, tx, ty, progress }
let brownoutTimer = 0;
let inBrownout = false;
let packetAccumulator = 0;

export const opsScene = {
  enter(state) {
    orbitAngle = 0;
    orbitSpeed = 1.2;
    opsTimer = 30;
    packetBuffer = 0;
    packetsDelivered = 0;
    scienceScoreTotal = 0;
    downlinkPackets = [];
    brownoutTimer = 0;
    inBrownout = false;
    packetAccumulator = 0;

    // Generate scan targets based on installed instruments
    targets = [];
    const insts = (state.flight && state.flight.instruments && state.flight.instruments.length > 0)
      ? state.flight.instruments
      : [{ id: 'camera', name: 'Camera', science: 20, dataGbPerDay: 6, colorIdx: 10 }];

    for (let i = 0; i < 5; i++) {
      const inst = insts[i % insts.length];
      targets.push({
        inst,
        angle: (i * Math.PI * 2) / 5,
        colorIdx: inst.colorIdx !== undefined ? inst.colorIdx : 10,
        scanned: false,
        cooldown: 0
      });
    }
  },

  update(dt, state, sceneManager) {
    opsTimer -= dt;

    // 1. Orbital Maneuvering (Left / Right adjusts speed)
    let curSpeed = orbitSpeed;
    if (input.isDown('LEFT')) curSpeed -= 0.6;
    if (input.isDown('RIGHT')) curSpeed += 0.6;
    orbitAngle += curSpeed * dt;

    // 2. Power Brownout Cycle (if power < 100%)
    const powerPct = (state.flight && state.flight.powerPct) ? state.flight.powerPct : 100;
    if (powerPct < 100) {
      brownoutTimer += dt;
      if (!inBrownout && brownoutTimer > 8.0) {
        inBrownout = true;
        brownoutTimer = 0;
        sfx.cancel();
      } else if (inBrownout && brownoutTimer > 3.0) {
        inBrownout = false;
        brownoutTimer = 0;
      }
    }

    // 3. Scan Targets Rotation & Cooldown
    for (const t of targets) {
      t.angle += 0.25 * dt; // slow planet rotation
      if (t.cooldown > 0) {
        t.cooldown -= dt;
        if (t.cooldown <= 0) t.scanned = false;
      }
    }

    // 4. Scanning with SPACE
    if (input.isPressed('ACTION') && !inBrownout) {
      // Find target within alignment
      let hitTarget = null;
      for (const t of targets) {
        if (t.scanned) continue;
        let diff = Math.abs((orbitAngle % (Math.PI * 2)) - (t.angle % (Math.PI * 2)));
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < 0.35) {
          hitTarget = t;
          break;
        }
      }

      if (hitTarget) {
        hitTarget.scanned = true;
        hitTarget.cooldown = 4.0;
        sfx.scan();

        // Science reward
        const sciGain = Math.max(5, Math.round(hitTarget.inst.science / 3));
        scienceScoreTotal += sciGain;

        // Data packets to buffer
        const genPkt = Math.max(1, Math.round(hitTarget.inst.dataGbPerDay));
        packetBuffer = Math.min(bufferMax + 5, packetBuffer + genPkt);

        // Sparkle particles
        const cx = 160 + Math.cos(hitTarget.angle) * 35;
        const cy = 95 + Math.sin(hitTarget.angle) * 35;
        gfx.spawnParticles(cx, cy, 14, hitTarget.colorIdx, 45, 0.4);
      }
    }

    // 5. RF Telemetry Downlink Stream
    const pps = (state.flight && state.flight.downlinkPps) ? state.flight.downlinkPps : 2.0;
    if (packetBuffer > 0) {
      packetAccumulator += pps * dt;
      while (packetAccumulator >= 1.0 && packetBuffer > 0) {
        packetAccumulator -= 1.0;
        packetBuffer--;
        packetsDelivered++;

        // Spawn visual flying data bit towards ground station (top-right X: 300, Y: 15)
        const shipX = 160 + Math.cos(orbitAngle) * 58;
        const shipY = 95 + Math.sin(orbitAngle) * 58;
        downlinkPackets.push({
          x: shipX,
          y: shipY,
          tx: 295,
          ty: 15,
          t: 0
        });
      }
    }

    // Update animated packets flying to Earth
    for (let i = downlinkPackets.length - 1; i >= 0; i--) {
      const p = downlinkPackets[i];
      p.t += dt * 2.5;
      p.x += (p.tx - p.x) * dt * 3;
      p.y += (p.ty - p.y) * dt * 3;
      if (p.t >= 1.0) {
        downlinkPackets.splice(i, 1);
      }
    }

    // 6. End of Science Ops Window
    if (opsTimer <= 0) {
      sfx.win();

      // Scaled data and science validation
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
    gfx.rect(ctx, 0, 0, 320, 180, 0);

    const isMars = state.mission && state.mission.id === 'mars';
    const isMoon = state.mission && state.mission.id === 'moon';
    const planetSpr = isMars ? SPRITE_MARS : (isMoon ? SPRITE_MOON : SPRITE_EARTH);

    // Orbit Path Ring
    gfx.circleb(ctx, 160, 95, 58, 1);

    // Draw Planet at Center (160, 95)
    drawSprite(ctx, planetSpr, 145, 80, 2);

    // Draw Surface Scan Targets
    for (const t of targets) {
      const tx = 160 + Math.cos(t.angle) * 32;
      const ty = 95 + Math.sin(t.angle) * 32;

      if (!t.scanned) {
        const pulse = Math.floor(opsTimer * 6) % 2 === 0;
        gfx.circle(ctx, tx, ty, pulse ? 3 : 2, t.colorIdx);
        gfx.px(ctx, tx, ty, 7);
      } else {
        gfx.px(ctx, tx, ty, 5); // dimmed out when scanned
      }
    }

    // Draw Orbiting Spacecraft
    const shipX = 160 + Math.cos(orbitAngle) * 58;
    const shipY = 95 + Math.sin(orbitAngle) * 58;
    drawCompositeShip(ctx, state, shipX, shipY, 1, false);

    // Draw Animated Downlink Telemetry Bits
    for (const p of downlinkPackets) {
      gfx.px(ctx, p.x, p.y, 12);
    }

    // Draw Top Ground Station (Earth antenna)
    gfx.rect(ctx, 275, 4, 40, 20, 1);
    gfx.rectb(ctx, 275, 4, 40, 20, 12);
    gfx.text(ctx, 'EARTH', 282, 7, 7, 1);
    gfx.text(ctx, 'DSN LINK', 278, 15, 11, 1);

    // Top HUD
    gfx.rect(ctx, 0, 0, 260, 24, 1);
    gfx.text(ctx, `OPS TIME: ${Math.max(0, Math.ceil(opsTimer))}S`, 8, 4, 10, 1);
    gfx.text(ctx, `SCI: ${scienceScoreTotal} PTS (MIN: ${state.mission ? state.mission.minScience : 40})`, 80, 4, 11, 1);

    // Downlink Rate
    const dlRate = (state.flight && state.flight.downlinkPps) ? state.flight.downlinkPps : 2.0;
    gfx.text(ctx, `DOWNLINK: ${dlRate} PKT/S`, 8, 14, 12, 1);
    gfx.text(ctx, `DELIVERED: ${packetsDelivered} PKTS`, 130, 14, 7, 1);

    // Brownout Warning Banner
    if (inBrownout) {
      const blink = Math.floor(opsTimer * 8) % 2 === 0;
      gfx.rect(ctx, 70, 40, 180, 20, 8);
      gfx.centerText(ctx, blink ? 'POWER BROWNOUT! SENSORS OFFLINE!' : '', 46, 10, 1);
    }

    // Bottom Packet Buffer Bar
    const bufY = 162;
    gfx.rect(ctx, 10, bufY, 300, 14, 1);
    gfx.rectb(ctx, 10, bufY, 300, 14, packetBuffer >= bufferMax ? 8 : 12);

    gfx.text(ctx, 'BUFFER', 16, bufY + 3, 7, 1);
    const bufPct = Math.min(100, Math.round((packetBuffer / bufferMax) * 100));
    gfx.bar(ctx, 60, bufY + 3, 160, 8, bufPct, packetBuffer >= bufferMax ? 8 : 12, 0);
    gfx.text(ctx, `${packetBuffer}/${bufferMax} PKT`, 228, bufY + 3, packetBuffer >= bufferMax ? 8 : 7, 1);
  }
};
