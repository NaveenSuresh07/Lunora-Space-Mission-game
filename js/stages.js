/**
 * Lunora: Mission Control Arcade (v2) - Arcade Stages (NASA Mission Segments)
 * Stage 1: LAUNCH (Launch Segment)
 * Stage 2: CRUISE & ORBIT (Space Segment)
 * Stage 3: OPERATIONS (Ground Segment)
 * Stage 4: SCIENCE DELIVERY (User Segment)
 */

import { input, sfx, particles, popups, camera, clamp, lerp } from './core.js';

// ============================================================================
// STAGE 1: LAUNCH (Launch Segment)
// Vertical gravity-turn ascent, Max-Q throttle management, Stage separation
// ============================================================================
export class LaunchStage {
  constructor(game) {
    this.game = game;
    this.mission = null;
    this.vehicle = null;
    this.stats = null;
    this.difficulty = 'engineer';

    this.altitude = 0; // 0 to 100 km
    this.rocketX = 480;
    this.rocketVx = 0;
    this.corridorCenter = 480;
    this.corridorWidth = 140;

    this.throttle = 0;
    this.fuel = 100;
    this.integrity = 100;
    this.staged = false;
    this.maxQAlert = false;
    this.maxQPassed = false;
    this.stagingPrompt = false;
    this.orbitAccuracy = 1.0;

    this.introTimer = 3.5;
    this.finished = false;
  }

  enter(payload) {
    this.mission = payload.mission;
    this.vehicle = payload.vehicle;
    this.stats = payload.stats;
    this.difficulty = payload.difficulty || 'engineer';

    this.altitude = 0;
    this.rocketX = 480;
    this.rocketVx = 0;
    this.corridorWidth = Math.round(160 * this.vehicle.corridor);
    if (this.difficulty === 'cadet') this.corridorWidth *= 1.35;

    this.throttle = 0;
    this.fuel = this.stats.totalFuel;
    this.integrity = 100;
    this.staged = false;
    this.maxQAlert = false;
    this.maxQPassed = false;
    this.stagingPrompt = false;
    this.orbitAccuracy = 1.0;
    this.introTimer = 3.0;
    this.finished = false;
  }

  exit() {
    sfx.setRumble(false);
  }

  update(dt) {
    if (this.introTimer > 0) {
      this.introTimer -= dt;
      if (input.action && this.introTimer < 2.5) this.introTimer = 0;
      return;
    }

    if (this.finished) return;

    // Controls
    const throttleUp = input.action || input.up;
    const targetThrottle = throttleUp && this.fuel > 0 ? 1.0 : 0.0;
    this.throttle = lerp(this.throttle, targetThrottle, 0.12);

    // Sound Rumble
    sfx.setRumble(this.throttle > 0.05, this.throttle);

    // Consume fuel
    if (this.throttle > 0.1) {
      this.fuel = Math.max(0, this.fuel - this.throttle * 8 * dt);
    }

    // Steering (Pitch nudge)
    const steerForce = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    this.rocketVx += steerForce * 22 * this.stats.accel * dt;
    this.rocketVx *= 0.94; // Drag
    this.rocketX = clamp(this.rocketX + this.rocketVx * 60 * dt, 120, 840);

    // Altitude climbing
    const climbSpeed = this.throttle * (2.8 * this.stats.accel);
    this.altitude = Math.min(100, this.altitude + climbSpeed * dt * 5.5);

    // Dynamic Corridor Curve (Gravity turn)
    const turnAngle = (this.altitude / 100) * Math.PI;
    this.corridorCenter = 480 + Math.sin(turnAngle) * 160;

    // Particle exhaust
    if (this.throttle > 0.1) {
      const plumeColor = this.staged ? '#4dd0ff' : '#ffb84d';
      particles.emitPlume(this.rocketX, 420, 8 * this.throttle, 3, plumeColor);
    }

    // Corridor deviation check
    const distFromCenter = Math.abs(this.rocketX - this.corridorCenter);
    const halfWidth = this.corridorWidth / 2;
    if (distFromCenter > halfWidth) {
      const penalty = (distFromCenter - halfWidth) * 0.001 * dt;
      this.orbitAccuracy = Math.max(0.2, this.orbitAccuracy - penalty);
      this.fuel = Math.max(0, this.fuel - 5 * dt); // Excess fuel to steer back
    }

    // Max-Q Zone (35 km to 55 km)
    if (this.altitude >= 35 && this.altitude <= 55) {
      this.maxQAlert = true;
      if (this.throttle > 0.55) {
        // High throttle during Max-Q causes aerodynamic structural stress!
        this.integrity = Math.max(20, this.integrity - 14 * dt);
        camera.shake(4, 0.1);
        if (Math.random() < 0.2) {
          particles.emitSparks(this.rocketX, 390, 4, '#ff5d6c');
        }
      }
    } else {
      if (this.maxQAlert && !this.maxQPassed) {
        this.maxQPassed = true;
        this.maxQAlert = false;
        popups.add('+50 MAX-Q SURVIVED', 480, 200, '#3ddc97', 22);
        sfx.blip(800, 0.15);
      }
      this.maxQAlert = false;
    }

    // Staging Window (68 km to 82 km)
    if (this.altitude >= 68 && this.altitude <= 82 && !this.staged) {
      this.stagingPrompt = true;
      if (input.isJustPressed('KeyS') || (input.action && this.stagingPrompt)) {
        this.staged = true;
        this.stagingPrompt = false;
        camera.shake(8, 0.35);
        sfx.staging();
        particles.emitSparks(this.rocketX, 420, 25, '#ffffff');
        popups.add('+100 PERFECT STAGING!', 480, 220, '#4dd0ff', 24);
        this.orbitAccuracy = Math.min(1.0, this.orbitAccuracy + 0.15);
      }
    } else {
      this.stagingPrompt = false;
    }

    // Staging missed
    if (this.altitude > 82 && !this.staged) {
      this.staged = true; // Auto-separated late
      this.fuel = Math.max(0, this.fuel - 25);
      popups.add('LATE STAGING (-25 FUEL)', 480, 220, '#ffb84d', 20);
    }

    // Reached 100 km orbit altitude
    if (this.altitude >= 100 && !this.finished) {
      this.finished = true;
      sfx.success();
      popups.add('ORBITAL ASCENT COMPLETE!', 480, 260, '#3ddc97', 28);
      setTimeout(() => {
        this.game.go('cruise', {
          mission: this.mission,
          vehicle: this.vehicle,
          parts: this.stats.parts,
          stats: this.stats,
          difficulty: this.difficulty,
          stage1: {
            orbitAccuracy: Math.round(this.orbitAccuracy * 100) / 100,
            remainingFuel: Math.round(this.fuel),
            integrity: Math.round(this.integrity)
          }
        });
      }, 1800);
    }
  }

  render(ctx) {
    // Sky background gradient shifting from lower atmosphere to deep space
    const progress = this.altitude / 100;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 540);
    if (progress < 0.4) {
      skyGradient.addColorStop(0, '#111a33');
      skyGradient.addColorStop(1, '#24335e');
    } else if (progress < 0.75) {
      skyGradient.addColorStop(0, '#070b1a');
      skyGradient.addColorStop(1, '#111a33');
    } else {
      skyGradient.addColorStop(0, '#050813');
      skyGradient.addColorStop(1, '#070b1a');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 960, 540);

    // Parallax background stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const starY = (i * 37 + this.altitude * 8) % 540;
      const starX = (i * 97) % 960;
      const starSize = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(starX, starY, starSize, starSize);
    }

    // Ascent Corridor
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.maxQAlert ? 'rgba(255, 93, 108, 0.4)' : 'rgba(77, 208, 255, 0.35)';
    ctx.strokeRect(this.corridorCenter - this.corridorWidth / 2, 40, this.corridorWidth, 460);

    // Guide center dashed line
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = 'rgba(77, 208, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(this.corridorCenter, 40);
    ctx.lineTo(this.corridorCenter, 500);
    ctx.stroke();
    ctx.restore();

    // Max-Q Visual Zone Band
    if (this.altitude >= 30 && this.altitude <= 60) {
      ctx.fillStyle = 'rgba(255, 93, 108, 0.12)';
      ctx.fillRect(0, 140, 960, 220);
      ctx.fillStyle = '#ff5d6c';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('⚡ MAX-Q REGION: THROTTLE DOWN TO <50% !', 940, 170);
    }

    // Rocket Body
    ctx.save();
    ctx.translate(this.rocketX, 400);

    // Rocket fuselage
    ctx.fillStyle = '#e8eeff';
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(10, -10);
    ctx.lineTo(10, 20);
    ctx.lineTo(-10, 20);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fill();

    // Nose cone
    ctx.fillStyle = '#4dd0ff';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(8, -20);
    ctx.lineTo(-8, -20);
    ctx.closePath();
    ctx.fill();

    // First Stage Booster (disappears after staging)
    if (!this.staged) {
      ctx.fillStyle = '#93a1c9';
      ctx.fillRect(-12, 18, 24, 18);
      // Fins
      ctx.fillStyle = '#ff5d6c';
      ctx.beginPath();
      ctx.moveTo(-12, 26);
      ctx.lineTo(-20, 36);
      ctx.lineTo(-12, 36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(12, 26);
      ctx.lineTo(20, 36);
      ctx.lineTo(12, 36);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // HUD Overlay
    this.renderHUD(ctx);

    // Intro Card
    if (this.introTimer > 0) {
      this.renderIntro(ctx);
    }
  }

  renderHUD(ctx) {
    ctx.fillStyle = 'rgba(17, 26, 51, 0.88)';
    ctx.fillRect(20, 20, 920, 60);
    ctx.strokeStyle = '#24335e';
    ctx.strokeRect(20, 20, 920, 60);

    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    // Altitude
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('ALTITUDE', 40, 42);
    ctx.fillStyle = '#e8eeff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.altitude)} km / 100 km`, 40, 65);

    // Throttle
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('THROTTLE', 260, 42);
    ctx.fillStyle = this.throttle > 0.6 && this.maxQAlert ? '#ff5d6c' : '#4dd0ff';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.throttle * 100)}%`, 260, 65);

    // Propellant Fuel
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('PROPELLANT FUEL', 460, 42);
    ctx.fillStyle = this.fuel > 30 ? '#3ddc97' : '#ffb84d';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.fuel)} Δv`, 460, 65);

    // Corridor Accuracy
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('ORBIT ACCURACY', 680, 42);
    ctx.fillStyle = this.orbitAccuracy > 0.8 ? '#3ddc97' : '#ffb84d';
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.orbitAccuracy * 100)}%`, 680, 65);

    // Staging prompt indicator
    if (this.stagingPrompt) {
      ctx.fillStyle = '#3ddc97';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 STAGING WINDOW OPEN! PRESS [S] OR [SPACE] TO SEPARATE! 🔥', 480, 115);
    }
  }

  renderIntro(ctx) {
    ctx.fillStyle = 'rgba(7, 11, 26, 0.92)';
    ctx.fillRect(160, 120, 640, 280);
    ctx.strokeStyle = '#4dd0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 120, 640, 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4dd0ff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('STAGE 1: LAUNCH SEGMENT', 480, 160);

    ctx.fillStyle = '#e8eeff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('GOAL: Pilot the rocket through the ascent corridor to 100 km orbit.', 480, 205);
    ctx.fillText('CONTROLS: Hold [SPACE] or [W] for Throttle. [A] / [D] to steer pitch.', 480, 235);
    ctx.fillStyle = '#ffb84d';
    ctx.fillText('CRITICAL: Ease throttle (<50%) inside MAX-Q to prevent structural stress!', 480, 270);
    ctx.fillStyle = '#3ddc97';
    ctx.fillText('TAP [S] in the green staging window to jettison the heavy booster.', 480, 305);

    ctx.fillStyle = '#93a1c9';
    ctx.font = 'italic 14px "Segoe UI", sans-serif';
    ctx.fillText('Press [SPACE] or tap screen to launch', 480, 365);
  }
}

// ============================================================================
// STAGE 2: CRUISE & ORBIT (Space Segment)
// Deep-space hazard dodging, Subsystem power management, Orbit insertion burn
// ============================================================================
export class CruiseStage {
  constructor(game) {
    this.game = game;
    this.mission = null;
    this.stats = null;
    this.stage1Data = null;

    this.shipX = 140;
    this.shipY = 270;
    this.shipVy = 0;
    this.integrity = 100;
    this.fuel = 100;
    this.battery = 100; // 0 to 100%

    // Subsystem Power Toggles
    this.powerToggles = {
      heaters: true,     // 15W
      instruments: true, // stats.wattsNeed - 15 - comms
      comms: true        // 35W
    };

    this.distanceProgress = 0; // 0 to 100%
    this.hazards = [];
    this.pickups = [];
    this.inShadow = false;

    // Insertion burn state
    this.insertionMode = false;
    this.burnRingRadius = 140;
    this.targetSweetSpot = 45;
    this.burnAccuracy = 0;
    this.burnExecuted = false;

    this.introTimer = 3.5;
    this.finished = false;
  }

  enter(payload) {
    this.mission = payload.mission;
    this.stats = payload.stats;
    this.stage1Data = payload.stage1 || { remainingFuel: 100, integrity: 100, orbitAccuracy: 1.0 };
    this.difficulty = payload.difficulty || 'engineer';

    this.shipX = 140;
    this.shipY = 270;
    this.shipVy = 0;
    this.integrity = this.stage1Data.integrity;
    this.fuel = this.stage1Data.remainingFuel;
    this.battery = 100;

    this.distanceProgress = 0;
    this.hazards = [];
    this.pickups = [];
    this.inShadow = false;

    this.insertionMode = false;
    this.burnRingRadius = 150;
    this.burnAccuracy = 0;
    this.burnExecuted = false;
    this.introTimer = 3.0;
    this.finished = false;
  }

  exit() {}

  update(dt) {
    if (this.introTimer > 0) {
      this.introTimer -= dt;
      if (input.action && this.introTimer < 2.5) this.introTimer = 0;
      return;
    }

    if (this.finished) return;

    if (!this.insertionMode) {
      this.updateCruise(dt);
    } else {
      this.updateInsertion(dt);
    }
  }

  updateCruise(dt) {
    // Distance progression
    const cruiseRate = this.difficulty === 'director' ? 3.0 : 2.5;
    this.distanceProgress = Math.min(100, this.distanceProgress + cruiseRate * dt);

    // Ship vertical movement
    const moveY = (input.up ? -1 : 0) + (input.down ? 1 : 0);
    this.shipVy += moveY * 30 * dt;
    this.shipVy *= 0.90;
    this.shipY = clamp(this.shipY + this.shipVy * 60 * dt, 60, 440);

    // Shadow pass (between 45% and 65% distance)
    this.inShadow = (this.distanceProgress >= 45 && this.distanceProgress <= 65);

    // Electrical Power Balancing
    let activeWattsDraw = 10; // Base computer
    if (this.powerToggles.heaters) activeWattsDraw += 15;
    if (this.powerToggles.instruments) activeWattsDraw += Math.max(20, this.stats.wattsNeed * 0.5);
    if (this.powerToggles.comms) activeWattsDraw += 25;

    // Solar generation drops to 0 in shadow (unless RTG is equipped!)
    const hasRTG = this.stats.parts.some(p => p.id === 'rtg');
    let currentPowerSupply = this.stats.wattsSupply;
    if (this.inShadow && !hasRTG) {
      currentPowerSupply = 0; // Solar panels dark!
    }

    if (activeWattsDraw > currentPowerSupply) {
      const deficitRatio = (activeWattsDraw - currentPowerSupply) / 50;
      this.battery = Math.max(0, this.battery - deficitRatio * 5 * dt);
      if (this.battery <= 0) {
        // Battery depleted: thermal loss damages integrity!
        this.integrity = Math.max(15, this.integrity - 6 * dt);
        if (Math.random() < 0.1) camera.shake(2, 0.1);
      }
    } else {
      // Recharging
      this.battery = Math.min(100, this.battery + 8 * dt);
    }

    // Toggle Hotkeys (1: Heaters, 2: Instruments, 3: Comms)
    if (input.isJustPressed('Digit1')) this.powerToggles.heaters = !this.powerToggles.heaters;
    if (input.isJustPressed('Digit2')) this.powerToggles.instruments = !this.powerToggles.instruments;
    if (input.isJustPressed('Digit3')) this.powerToggles.comms = !this.powerToggles.comms;

    // Spawn hazards (Micrometeoroids & Debris)
    if (Math.random() < 0.045) {
      this.hazards.push({
        x: 980,
        y: 60 + Math.random() * 380,
        vx: -(3 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 1.5,
        radius: 12 + Math.random() * 10,
        type: Math.random() > 0.3 ? 'asteroid' : 'flare'
      });
    }

    // Spawn pickups (Fuel & Repair Kits)
    if (Math.random() < 0.015) {
      this.pickups.push({
        x: 980,
        y: 80 + Math.random() * 340,
        vx: -2.5,
        type: Math.random() > 0.5 ? 'fuel' : 'repair'
      });
    }

    // Update hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.x += h.vx;
      h.y += h.vy;

      // Collision detection with probe
      const dx = h.x - this.shipX;
      const dy = h.y - this.shipY;
      const dist = Math.hypot(dx, dy);
      if (dist < h.radius + 16) {
        // Impact!
        const baseDmg = h.type === 'flare' ? 18 : 22;
        const actualDmg = (h.type === 'flare' && this.stats.hasThermal) ? baseDmg * 0.5 : baseDmg;
        this.integrity = Math.max(10, this.integrity - actualDmg);
        camera.shake(6, 0.25);
        sfx.hit();
        particles.emitSparks(this.shipX, this.shipY, 15, h.type === 'flare' ? '#ff5d6c' : '#ffb84d');
        popups.add(`-${Math.round(actualDmg)}% INTEGRITY`, this.shipX, this.shipY - 20, '#ff5d6c', 18);
        this.hazards.splice(i, 1);
        continue;
      }

      if (h.x < -50) this.hazards.splice(i, 1);
    }

    // Update pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.x += p.vx;

      const dist = Math.hypot(p.x - this.shipX, p.y - this.shipY);
      if (dist < 26) {
        sfx.pickup();
        if (p.type === 'fuel') {
          this.fuel = Math.min(200, this.fuel + 30);
          popups.add('+30 FUEL', this.shipX, this.shipY - 20, '#3ddc97', 20);
        } else {
          this.integrity = Math.min(100, this.integrity + 20);
          popups.add('+20% INTEGRITY', this.shipX, this.shipY - 20, '#4dd0ff', 20);
        }
        particles.emitSparks(p.x, p.y, 12, '#3ddc97');
        this.pickups.splice(i, 1);
        continue;
      }

      if (p.x < -30) this.pickups.splice(i, 1);
    }

    // Transit finished: Trigger Orbit Insertion Burn!
    if (this.distanceProgress >= 100) {
      this.insertionMode = true;
      this.burnRingRadius = 150;
      sfx.blip(500, 0.2);
    }
  }

  updateInsertion(dt) {
    // Ring shrinks toward sweet spot (45 px radius)
    this.burnRingRadius -= 45 * dt;

    // Fuel reserves widen sweet-spot window!
    const sweetSpotWidth = Math.max(14, 18 + (this.fuel / 100) * 16);

    if (input.isJustPressed('Space') && !this.burnExecuted) {
      this.burnExecuted = true;
      const diff = Math.abs(this.burnRingRadius - this.targetSweetSpot);
      if (diff <= sweetSpotWidth / 2) {
        // Perfect insertion!
        this.burnAccuracy = 1.0;
        camera.shake(8, 0.4);
        sfx.success();
        particles.emitConfetti(480, 270, 40);
        popups.add('🎯 PERFECT ORBITAL INSERTION (+150 PTS)', 480, 220, '#3ddc97', 26);
      } else {
        // Minor deviation
        const accuracy = Math.max(0.4, 1.0 - (diff / 60));
        this.burnAccuracy = Math.round(accuracy * 100) / 100;
        camera.shake(4, 0.2);
        sfx.staging();
        popups.add(`ORBIT CAPTURED (${Math.round(this.burnAccuracy * 100)}% ACCURACY)`, 480, 220, '#ffb84d', 22);
      }

      setTimeout(() => {
        this.game.go('ops', {
          mission: this.mission,
          vehicle: this.vehicle,
          parts: this.stats.parts,
          stats: this.stats,
          difficulty: this.difficulty,
          stage1: this.stage1Data,
          stage2: {
            integrity: Math.round(this.integrity),
            batteryLeft: Math.round(this.battery),
            insertionAccuracy: this.burnAccuracy
          }
        });
      }, 2000);
    }

    // Auto-fail insertion if ring shrinks too small without hitting Space
    if (this.burnRingRadius < 15 && !this.burnExecuted) {
      this.burnExecuted = true;
      this.burnAccuracy = 0.35;
      sfx.hit();
      popups.add('OVER-BURN: CAPTURE MARGIN REDUCED', 480, 220, '#ff5d6c', 22);
      setTimeout(() => {
        this.game.go('ops', {
          mission: this.mission,
          vehicle: this.vehicle,
          parts: this.stats.parts,
          stats: this.stats,
          difficulty: this.difficulty,
          stage1: this.stage1Data,
          stage2: {
            integrity: Math.round(this.integrity),
            batteryLeft: Math.round(this.battery),
            insertionAccuracy: 0.35
          }
        });
      }, 2000);
    }
  }

  render(ctx) {
    // Deep Space Background
    ctx.fillStyle = this.inShadow ? '#02040a' : '#070b1a';
    ctx.fillRect(0, 0, 960, 540);

    // Parallax Stars drifting left
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const starX = (i * 73 - (this.distanceProgress * 20)) % 960;
      const actualX = starX < 0 ? starX + 960 : starX;
      const starY = (i * 47) % 540;
      ctx.fillRect(actualX, starY, (i % 2 === 0 ? 1 : 2), (i % 2 === 0 ? 1 : 2));
    }

    // Destination Planet on the right
    const planetX = 850 + (100 - this.distanceProgress) * 4;
    ctx.save();
    ctx.beginPath();
    ctx.arc(planetX, 270, 110, 0, Math.PI * 2);
    const planetColor = this.mission.target === 'mars' ? '#ab5236' : (this.mission.target === 'moon' ? '#c2c3c7' : '#4dd0ff');
    ctx.fillStyle = planetColor;
    ctx.fill();
    ctx.restore();

    if (!this.insertionMode) {
      // Hazards
      this.hazards.forEach(h => {
        ctx.save();
        if (h.type === 'flare') {
          ctx.fillStyle = 'rgba(255, 93, 108, 0.75)';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        } else {
          ctx.fillStyle = '#5f574f';
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#93a1c9';
          ctx.stroke();
        }
        ctx.restore();
      });

      // Pickups
      this.pickups.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.type === 'fuel' ? '#3ddc97' : '#4dd0ff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.type === 'fuel' ? '⛽' : '🔧', p.x, p.y + 4);
        ctx.restore();
      });

      // Spacecraft
      ctx.save();
      ctx.translate(this.shipX, this.shipY);
      // Hull
      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(-18, -12, 36, 24);
      // Solar wings
      ctx.fillStyle = this.inShadow ? '#24335e' : '#4dd0ff';
      ctx.fillRect(-14, -32, 28, 16);
      ctx.fillRect(-14, 16, 28, 16);
      // Dish
      ctx.fillStyle = '#c2c3c7';
      ctx.beginPath();
      ctx.arc(18, 0, 10, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Orbit Insertion Burn Target Graphic
      ctx.save();
      ctx.translate(480, 270);

      // Sweet Spot Ring
      const sweetWidth = Math.max(14, 18 + (this.fuel / 100) * 16);
      ctx.beginPath();
      ctx.arc(0, 0, this.targetSweetSpot, 0, Math.PI * 2);
      ctx.lineWidth = sweetWidth;
      ctx.strokeStyle = 'rgba(61, 220, 151, 0.4)';
      ctx.stroke();

      // Shrinking Ring
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2, this.burnRingRadius), 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#e8eeff';
      ctx.font = 'bold 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS [SPACE] IN GREEN ZONE TO EXECUTE RETRO-BURN!', 0, 120);
      ctx.restore();
    }

    // Top HUD
    this.renderHUD(ctx);

    // Intro Card
    if (this.introTimer > 0) {
      this.renderIntro(ctx);
    }
  }

  renderHUD(ctx) {
    ctx.fillStyle = 'rgba(17, 26, 51, 0.88)';
    ctx.fillRect(20, 15, 920, 55);
    ctx.strokeStyle = '#24335e';
    ctx.strokeRect(20, 15, 920, 55);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    // Transit Progress
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('TRANSIT DISTANCE', 35, 33);
    ctx.fillStyle = '#4dd0ff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.distanceProgress)}%`, 35, 54);

    // Mission Integrity
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('INTEGRITY', 210, 33);
    ctx.fillStyle = this.integrity > 60 ? '#3ddc97' : (this.integrity > 30 ? '#ffb84d' : '#ff5d6c');
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.integrity)}%`, 210, 54);

    // Battery
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('BATTERY POWER', 360, 33);
    ctx.fillStyle = this.battery > 50 ? '#3ddc97' : '#ff5d6c';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.battery)}% ${this.inShadow ? '🌙 (SHADOW)' : '☀️'}`, 360, 54);

    // Fuel remaining
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('PROP RESERVE', 560, 33);
    ctx.fillStyle = '#3ddc97';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.round(this.fuel)} Δv`, 560, 54);

    // Bottom Power Manager Toggle Ticker
    ctx.fillStyle = 'rgba(7, 11, 26, 0.9)';
    ctx.fillRect(240, 485, 480, 40);
    ctx.strokeStyle = '#24335e';
    ctx.strokeRect(240, 485, 480, 40);

    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e8eeff';
    ctx.fillText(
      `POWER TOGGLES:  [1] Heaters: ${this.powerToggles.heaters ? 'ON' : 'OFF'}  |  [2] Science: ${this.powerToggles.instruments ? 'ON' : 'OFF'}  |  [3] Comms: ${this.powerToggles.comms ? 'ON' : 'OFF'}`,
      480, 510
    );
  }

  renderIntro(ctx) {
    ctx.fillStyle = 'rgba(7, 11, 26, 0.92)';
    ctx.fillRect(160, 120, 640, 280);
    ctx.strokeStyle = '#4dd0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 120, 640, 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4dd0ff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('STAGE 2: SPACE SEGMENT (CRUISE & INSERTION)', 480, 160);

    ctx.fillStyle = '#e8eeff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('GOAL: Navigate deep-space hazards and execute precision orbit insertion burn.', 480, 205);
    ctx.fillText('CONTROLS: [W] / [S] or Up/Down to dodge hazards. Collect green fuel cells.', 480, 235);
    ctx.fillStyle = '#ffb84d';
    ctx.fillText('POWER LESSON: In shadow zones, press [1], [2], [3] to shed power load!', 480, 270);
    ctx.fillStyle = '#3ddc97';
    ctx.fillText('At arrival, tap [SPACE] inside the green capture circle to secure orbit.', 480, 305);

    ctx.fillStyle = '#93a1c9';
    ctx.font = 'italic 14px "Segoe UI", sans-serif';
    ctx.fillText('Press [SPACE] or tap screen to start cruise', 480, 365);
  }
}

// ============================================================================
// STAGE 3: OPERATIONS (Ground Segment)
// Top-down Earth with 3 DSN stations (Goldstone, Madrid, Canberra), Telemetry Catch
// ============================================================================
export class OpsStage {
  constructor(game) {
    this.game = game;
    this.mission = null;
    this.stats = null;
    this.stage1Data = null;
    this.stage2Data = null;

    this.timer = 40; // 40-second operations run
    this.orbitAngle = 0; // Spacecraft orbit around Earth
    this.activeStation = 0; // 0: Goldstone (0°), 1: Madrid (120°), 2: Canberra (240°)
    this.groundAngle = 0; // Earth rotation
    this.stationAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

    this.packets = [];
    this.dataProduced = 0;
    this.dataReturned = 0;
    this.bufferStored = 0;
    this.bufferCapacity = 1000;

    this.introTimer = 3.5;
    this.finished = false;
  }

  enter(payload) {
    this.mission = payload.mission;
    this.stats = payload.stats;
    this.stage1Data = payload.stage1;
    this.stage2Data = payload.stage2;
    this.difficulty = payload.difficulty || 'engineer';

    this.timer = 35;
    this.orbitAngle = 0;
    this.activeStation = 0;
    this.groundAngle = 0;
    this.packets = [];
    this.dataProduced = 0;
    this.dataReturned = 0;
    this.bufferStored = 0;
    this.bufferCapacity = this.stats.totalBuffer;

    this.introTimer = 3.0;
    this.finished = false;
  }

  exit() {}

  update(dt) {
    if (this.introTimer > 0) {
      this.introTimer -= dt;
      if (input.action && this.introTimer < 2.5) this.introTimer = 0;
      return;
    }

    if (this.finished) return;

    this.timer -= dt;

    // Orbiting spacecraft around Earth
    this.orbitAngle += 0.8 * dt;

    // Station selection hotkeys (1, 2, 3 or Left/Right)
    if (input.isJustPressed('Digit1')) this.activeStation = 0;
    if (input.isJustPressed('Digit2')) this.activeStation = 1;
    if (input.isJustPressed('Digit3')) this.activeStation = 2;

    if (input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyA')) {
      this.activeStation = (this.activeStation + 2) % 3;
      sfx.click();
    }
    if (input.isJustPressed('ArrowRight') || input.isJustPressed('KeyD')) {
      this.activeStation = (this.activeStation + 1) % 3;
      sfx.click();
    }

    // Spacecraft coordinates (radius 180 px from Earth center at 480, 270)
    const craftX = 480 + Math.cos(this.orbitAngle) * 190;
    const craftY = 270 + Math.sin(this.orbitAngle) * 190;

    // Occultation / Blackout check (behind Earth: X between 420 and 540, Y < 270)
    const inBlackout = Math.sin(this.orbitAngle) < -0.3;

    // Telemetry generation
    if (Math.random() < 0.22) {
      this.dataProduced += 25;
      if (inBlackout) {
        // Stored in buffer during blackout
        if (this.bufferStored < this.bufferCapacity) {
          this.bufferStored += 25;
        } else {
          popups.add('BUFFER OVERFLOW! DATA LOST', craftX, craftY - 20, '#ff5d6c', 16);
        }
      } else {
        // Stream packet toward Earth
        this.packets.push({
          x: craftX,
          y: craftY,
          vx: (480 - craftX) * 0.015,
          vy: (270 - craftY) * 0.015,
          value: 25
        });

        // Flush buffer if any stored
        if (this.bufferStored > 0) {
          this.bufferStored -= 25;
          this.packets.push({
            x: craftX + (Math.random() - 0.5) * 20,
            y: craftY + (Math.random() - 0.5) * 20,
            vx: (480 - craftX) * 0.018,
            vy: (270 - craftY) * 0.018,
            value: 25
          });
        }
      }
    }

    // Active Ground Station position & reception cone
    const stAngle = this.stationAngles[this.activeStation];
    const stX = 480 + Math.cos(stAngle) * 65;
    const stY = 270 + Math.sin(stAngle) * 65;
    const catchRadius = 55 * this.stats.catchWidth;

    // Update packets
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;

      // Check distance to active DSN station
      const dist = Math.hypot(p.x - stX, p.y - stY);
      if (dist < catchRadius) {
        // Caught by DSN dish!
        this.dataReturned += p.value;
        sfx.blip(800 + Math.random() * 400, 0.04);
        particles.emitSparks(stX, stY, 4, '#4dd0ff');
        this.packets.splice(i, 1);
        continue;
      }

      // If packet hits Earth surface without being caught, it is lost
      const distEarth = Math.hypot(p.x - 480, p.y - 270);
      if (distEarth < 60) {
        this.packets.splice(i, 1);
      }
    }

    // Time expired: Stage Complete
    if (this.timer <= 0 && !this.finished) {
      this.finished = true;
      sfx.success();
      const returnRatio = this.dataProduced > 0 ? Math.min(1.0, this.dataReturned / this.dataProduced) : 1.0;
      popups.add(`OPS COMPLETE: ${Math.round(returnRatio * 100)}% DATA DOWNLINKED!`, 480, 220, '#3ddc97', 24);

      setTimeout(() => {
        this.game.go('science', {
          mission: this.mission,
          vehicle: this.vehicle,
          parts: this.stats.parts,
          stats: this.stats,
          difficulty: this.difficulty,
          stage1: this.stage1Data,
          stage2: this.stage2Data,
          stage3: {
            dataReturnedPct: Math.round(returnRatio * 100)
          }
        });
      }, 2000);
    }
  }

  render(ctx) {
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);

    // Orbit Path ellipse
    ctx.save();
    ctx.strokeStyle = 'rgba(77, 208, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(480, 270, 190, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Central Earth
    ctx.save();
    ctx.beginPath();
    ctx.arc(480, 270, 65, 0, Math.PI * 2);
    ctx.fillStyle = '#1d2b53';
    ctx.fill();
    ctx.strokeStyle = '#4dd0ff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Continent details
    ctx.fillStyle = '#008751';
    ctx.beginPath();
    ctx.arc(470, 260, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(500, 280, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // DSN Stations (Goldstone, Madrid, Canberra)
    const stationNames = ['GOLDSTONE (US)', 'MADRID (ES)', 'CANBERRA (AU)'];
    this.stationAngles.forEach((angle, idx) => {
      const sx = 480 + Math.cos(angle) * 65;
      const sy = 270 + Math.sin(angle) * 65;
      const isActive = idx === this.activeStation;

      ctx.save();
      // Dish icon
      ctx.fillStyle = isActive ? '#3ddc97' : '#93a1c9';
      ctx.beginPath();
      ctx.arc(sx, sy, isActive ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();

      // Active reception cone
      if (isActive) {
        const catchR = 55 * this.stats.catchWidth;
        ctx.strokeStyle = 'rgba(61, 220, 151, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, catchR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#3ddc97';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stationNames[idx], sx, sy + 24);
      }
      ctx.restore();
    });

    // Spacecraft
    const craftX = 480 + Math.cos(this.orbitAngle) * 190;
    const craftY = 270 + Math.sin(this.orbitAngle) * 190;

    ctx.save();
    ctx.translate(craftX, craftY);
    ctx.fillStyle = '#e8eeff';
    ctx.fillRect(-10, -8, 20, 16);
    ctx.fillStyle = '#4dd0ff';
    ctx.fillRect(-8, -18, 16, 8);
    ctx.fillRect(-8, 10, 16, 8);
    ctx.restore();

    // Data Packets
    this.packets.forEach(p => {
      ctx.save();
      ctx.fillStyle = '#4dd0ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Top HUD
    this.renderHUD(ctx);

    // Intro Card
    if (this.introTimer > 0) {
      this.renderIntro(ctx);
    }
  }

  renderHUD(ctx) {
    ctx.fillStyle = 'rgba(17, 26, 51, 0.88)';
    ctx.fillRect(20, 15, 920, 55);
    ctx.strokeStyle = '#24335e';
    ctx.strokeRect(20, 15, 920, 55);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    // Comms Window Timer
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('OPS TIME REMAINING', 35, 33);
    ctx.fillStyle = this.timer > 10 ? '#e8eeff' : '#ffb84d';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.max(0, Math.round(this.timer))}s`, 35, 54);

    // Data Downlink Percentage
    const returnRatio = this.dataProduced > 0 ? Math.min(1.0, this.dataReturned / this.dataProduced) : 1.0;
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('DATA DOWNLINKED', 230, 33);
    ctx.fillStyle = returnRatio > 0.8 ? '#3ddc97' : '#ffb84d';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${this.dataReturned} Mb (${Math.round(returnRatio * 100)}%)`, 230, 54);

    // Onboard Buffer
    const bufferPct = Math.round((this.bufferStored / this.bufferCapacity) * 100);
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('ONBOARD BUFFER', 480, 33);
    ctx.fillStyle = bufferPct > 80 ? '#ff5d6c' : '#4dd0ff';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${this.bufferStored} Mb / ${this.bufferCapacity} Mb (${bufferPct}%)`, 480, 54);

    // Station Switcher Instructions
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('ACTIVE DSN DISH', 720, 33);
    ctx.fillStyle = '#3ddc97';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText(`STATION [${this.activeStation + 1}]  (KEYS 1, 2, 3)`, 720, 54);
  }

  renderIntro(ctx) {
    ctx.fillStyle = 'rgba(7, 11, 26, 0.92)';
    ctx.fillRect(160, 120, 640, 280);
    ctx.strokeStyle = '#4dd0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 120, 640, 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4dd0ff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('STAGE 3: GROUND SEGMENT (OPERATIONS)', 480, 160);

    ctx.fillStyle = '#e8eeff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('GOAL: Downlink telemetry packets from orbit to Earth ground stations.', 480, 205);
    ctx.fillText('CONTROLS: Press [1], [2], [3] or Left/Right to rotate active DSN dish.', 480, 235);
    ctx.fillStyle = '#ffb84d';
    ctx.fillText('BLACKOUT LESSON: Behind Earth, comms sever! Data buffers until line-of-sight.', 480, 270);
    ctx.fillStyle = '#3ddc97';
    ctx.fillText('Bigger antennas provide wider DSN catch areas; storage buffers prevent overflows.', 480, 305);

    ctx.fillStyle = '#93a1c9';
    ctx.font = 'italic 14px "Segoe UI", sans-serif';
    ctx.fillText('Press [SPACE] or tap screen to start operations', 480, 365);
  }
}

// ============================================================================
// STAGE 4: SCIENCE DELIVERY (User Segment)
// Match & sort incoming telemetry into science bins (Imaging, Geology, Atmosphere, Magnetic)
// ============================================================================
export class ScienceStage {
  constructor(game) {
    this.game = game;
    this.mission = null;
    this.stats = null;
    this.stage1Data = null;
    this.stage2Data = null;
    this.stage3Data = null;

    this.timer = 25; // 25-second sorting run
    this.tiles = [];
    this.activeBin = 0; // 0: Imaging, 1: Geology, 2: Atmosphere, 3: Magnetic
    this.sciencePoints = 0;
    this.combo = 0;

    this.availableTypes = [];
    this.introTimer = 3.5;
    this.finished = false;
  }

  enter(payload) {
    this.mission = payload.mission;
    this.stats = payload.stats;
    this.stage1Data = payload.stage1;
    this.stage2Data = payload.stage2;
    this.stage3Data = payload.stage3;
    this.difficulty = payload.difficulty || 'engineer';

    this.timer = 25;
    this.tiles = [];
    this.activeBin = 0;
    this.sciencePoints = this.stats.rawScience || 20;
    this.combo = 0;

    // Detect instrument types player carried
    const types = new Set();
    this.stats.parts.forEach(p => {
      if (p.tags) p.tags.forEach(t => types.add(t));
    });
    this.availableTypes = types.size > 0 ? Array.from(types) : ['imaging', 'geology'];

    this.introTimer = 3.0;
    this.finished = false;
  }

  exit() {}

  update(dt) {
    if (this.introTimer > 0) {
      this.introTimer -= dt;
      if (input.action && this.introTimer < 2.5) this.introTimer = 0;
      return;
    }

    if (this.finished) return;

    this.timer -= dt;

    // Move bin selector (Keys 1, 2, 3, 4 or Left/Right)
    if (input.isJustPressed('Digit1')) this.activeBin = 0;
    if (input.isJustPressed('Digit2')) this.activeBin = 1;
    if (input.isJustPressed('Digit3')) this.activeBin = 2;
    if (input.isJustPressed('Digit4')) this.activeBin = 3;

    if (input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyA')) {
      this.activeBin = Math.max(0, this.activeBin - 1);
      sfx.click();
    }
    if (input.isJustPressed('ArrowRight') || input.isJustPressed('KeyD')) {
      this.activeBin = Math.min(3, this.activeBin + 1);
      sfx.click();
    }

    // Spawn falling data tiles
    if (Math.random() < 0.05) {
      const colIndex = Math.floor(Math.random() * 4);
      const categoryMap = ['imaging', 'geology', 'atmosphere', 'magnetic'];
      const chosenType = categoryMap[colIndex];

      this.tiles.push({
        x: 210 + colIndex * 180,
        y: 80,
        colIndex,
        type: chosenType,
        speed: 2.2 + Math.random() * 1.5
      });
    }

    // Update tiles
    const catcherY = 430;
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const tile = this.tiles[i];
      tile.y += tile.speed * 60 * dt;

      // Near catch zone
      if (tile.y >= catcherY - 20 && tile.y <= catcherY + 25) {
        if (this.activeBin === tile.colIndex) {
          // Correct match!
          this.combo++;
          const pts = 10 * this.combo;
          this.sciencePoints += pts;
          sfx.pickup();
          particles.emitSparks(tile.x, tile.y, 8, '#3ddc97');
          popups.add(`+${pts} (${this.combo}x COMBO!)`, tile.x, tile.y - 20, '#3ddc97', 18);
          this.tiles.splice(i, 1);
          continue;
        }
      }

      // Missed tile
      if (tile.y > 480) {
        if (this.combo > 2) {
          popups.add('COMBO LOST', tile.x, 460, '#ff5d6c', 16);
        }
        this.combo = 0;
        this.tiles.splice(i, 1);
      }
    }

    // Timer Finished
    if (this.timer <= 0 && !this.finished) {
      this.finished = true;
      sfx.fanfare();
      popups.add('SCIENCE DISCOVERY DELIVERED!', 480, 220, '#3ddc97', 28);

      setTimeout(() => {
        this.game.go('debrief', {
          mission: this.mission,
          vehicle: this.vehicle,
          parts: this.stats.parts,
          stats: this.stats,
          difficulty: this.difficulty,
          stage1: this.stage1Data,
          stage2: this.stage2Data,
          stage3: this.stage3Data,
          stage4: {
            scienceScore: Math.round(this.sciencePoints)
          }
        });
      }, 2200);
    }
  }

  render(ctx) {
    ctx.fillStyle = '#070b1a';
    ctx.fillRect(0, 0, 960, 540);

    // 4 Column Bins Backgrounds
    const binColors = ['#4dd0ff', '#ffb84d', '#3ddc97', '#93a1c9'];
    const binNames = ['1: IMAGING', '2: GEOLOGY', '3: ATMOSPHERE', '4: MAGNETIC'];

    for (let c = 0; c < 4; c++) {
      const bx = 120 + c * 180;
      ctx.fillStyle = c === this.activeBin ? 'rgba(77, 208, 255, 0.08)' : 'rgba(17, 26, 51, 0.4)';
      ctx.fillRect(bx, 80, 180, 420);
      ctx.strokeStyle = '#24335e';
      ctx.strokeRect(bx, 80, 180, 420);

      // Bin bottom label
      ctx.fillStyle = c === this.activeBin ? '#3ddc97' : '#93a1c9';
      ctx.font = 'bold 14px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(binNames[c], bx + 90, 475);
    }

    // Active Catcher Box
    const catcherX = 120 + this.activeBin * 180;
    ctx.save();
    ctx.fillStyle = 'rgba(61, 220, 151, 0.35)';
    ctx.fillRect(catcherX + 10, 420, 160, 30);
    ctx.strokeStyle = '#3ddc97';
    ctx.lineWidth = 3;
    ctx.strokeRect(catcherX + 10, 420, 160, 30);
    ctx.restore();

    // Falling Tiles
    this.tiles.forEach(t => {
      ctx.save();
      ctx.fillStyle = binColors[t.colIndex];
      ctx.fillRect(t.x - 35, t.y - 15, 70, 30);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(t.x - 35, t.y - 15, 70, 30);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.type.toUpperCase(), t.x, t.y + 5);
      ctx.restore();
    });

    // Top HUD
    this.renderHUD(ctx);

    // Intro Card
    if (this.introTimer > 0) {
      this.renderIntro(ctx);
    }
  }

  renderHUD(ctx) {
    ctx.fillStyle = 'rgba(17, 26, 51, 0.88)';
    ctx.fillRect(20, 15, 920, 55);
    ctx.strokeStyle = '#24335e';
    ctx.strokeRect(20, 15, 920, 55);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#93a1c9';
    ctx.fillText('ANALYSIS TIME', 35, 33);
    ctx.fillStyle = this.timer > 8 ? '#e8eeff' : '#ffb84d';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${Math.max(0, Math.round(this.timer))}s`, 35, 54);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('SCIENCE YIELD', 240, 33);
    ctx.fillStyle = '#3ddc97';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${this.sciencePoints} PTS`, 240, 54);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('COMBO CHAIN', 480, 33);
    ctx.fillStyle = this.combo > 1 ? '#4dd0ff' : '#93a1c9';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.fillText(`${this.combo}x COMBO`, 480, 54);

    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.fillStyle = '#93a1c9';
    ctx.fillText('BIN SELECTOR', 720, 33);
    ctx.fillStyle = '#e8eeff';
    ctx.font = 'bold 15px "Segoe UI", sans-serif';
    ctx.fillText('KEYS [1, 2, 3, 4] OR [A / D]', 720, 54);
  }

  renderIntro(ctx) {
    ctx.fillStyle = 'rgba(7, 11, 26, 0.92)';
    ctx.fillRect(160, 120, 640, 280);
    ctx.strokeStyle = '#4dd0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 120, 640, 280);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4dd0ff';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.fillText('STAGE 4: USER SEGMENT (SCIENCE DELIVERY)', 480, 160);

    ctx.fillStyle = '#e8eeff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText('GOAL: Sort incoming telemetry packets into matching scientific domains.', 480, 205);
    ctx.fillText('CONTROLS: Use [1, 2, 3, 4] or [A] / [D] to move the collector tray.', 480, 235);
    ctx.fillStyle = '#3ddc97';
    ctx.fillText('Consecutive correct matches trigger combo chains for massive science multipliers!', 480, 275);

    ctx.fillStyle = '#93a1c9';
    ctx.font = 'italic 14px "Segoe UI", sans-serif';
    ctx.fillText('Press [SPACE] or tap screen to begin sorting', 480, 355);
  }
}
