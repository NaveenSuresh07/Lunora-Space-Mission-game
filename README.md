# Space Mission Design Game: Pixel Arcade v3 🛰️🕹️
### Bigger Screen (480×270) · Challenge-Complete · NASA Space Apps Challenge 2026

> An authentic retro 16-color pixel-art arcade game where players engineer real deep-space probes and fly the missions themselves. Powered by real NASA-derived public figures, multi-role team Go/No-Go voting, orbital selection, and post-flight telemetry debriefs.

[![PICO-8 Palette](https://img.shields.io/badge/Palette-PICO--8_16_Color-ff004d?style=for-the-badge)](https://www.lexaloffle.com/pico-8.php)
[![Canvas Resolution](https://img.shields.io/badge/Screen-480x270_Pixelated-29adff?style=for-the-badge)](#)
[![Fullscreen](https://img.shields.io/badge/Hotkey-F_Fullscreen-00e436?style=for-the-badge)](#)
[![Zero Asset Dependencies](https://img.shields.io/badge/Assets-Zero_External_Files-ffa300?style=for-the-badge)](#)

---

## 🎮 What Changed in v3

1. **Bigger Screen (480×270 Native):** Exactly 4× pixel scaling on 1080p monitors. Fullscreen toggle with `F`. Fills the window with authentic pixel-art aspect ratio and subtle CRT scanlines.
2. **Challenge-Complete:**
   - **4 Team Roles (1–4 Players Hot-Seat):** Planner, Engineer, Scientist, Comms.
   - **NASA Go / No-Go Poll:** Real-time Flight Director console poll before liftoff. Unanimous GO authorizes launch; NO-GO highlights deficits for re-engineering.
   - **Orbit Presets:** Low, Mid (Sun-Sync), and High orbits modifying science resolution, downlink passes, launcher capacity, and radiation risk.
   - **Schedule as a Resource:** Component lead times & development months. Missed launch windows lead to NO-GO aborts.
   - **Batteries & ADCS:** Eclipse shadow brownout protection and arcsecond pointing accuracy.
   - **Mission Codex (`H` key):** In-game educational handbook explaining the astrodynamics and equations.
   - **Flight Recorder:** Post-mission event analysis with cause $\to$ effect timeline and 3 actionable engineering suggestions.
   - **Shareable Design Codes:** Encoded into the browser URL hash for 1-click sharing.

---

## 🕹️ Complete Gameplay Flow

```
BOOT  →  TITLE  →  STAGE SELECT  →  HANGAR (build probe)  →  GO/NO-GO POLL  →  LAUNCH  →  CRUISE DODGE  →  INSERTION BURN  →  ORBIT OPS  →  REPORT
(online)  (arcade)   (LEO/Moon/Mars/Jup) (modular workshop)     (4 team consoles)  (liftoff)   (hazards/flares)  (timing zone)      (scan & DSN)    (recorder + hi-score)
```

1. **Boot Sequence:** Terminal diagnostics verifying telemetry links and astrodynamics engines.
2. **Title:** Big 2x pixel logo, parallax starfield, drifting planet, chiptune theme.
3. **Stage Select:** Earth Observer (LEO), Lunar Mapper (Moon), Mars Climate Orbiter (Mars), and the Jupiter Moons Explorer boss stage. Choose difficulty: ROOKIE, ENGINEER, or FLIGHT DIRECTOR.
4. **Hangar Workshop:** Gantry bay on left updates your spacecraft composite in real time as you swap parts. Right menu configures Orbit, Bus, Power, Batteries, Comms, ADCS, Engines, Instruments, Propellant, and Rocket Boosters. Top HUD monitors 6 live resources: Budget, Mass, Power, $\Delta v$, Downlink, and Schedule.
5. **Go / No-Go Console Poll:** NASA-style poll of all 4 consoles:
   - *Planner:* Budget and launch window schedule.
   - *Engineer:* Structural mass, power balance, and $\Delta v$ velocity reserves.
   - *Scientist:* Instrument mass limits and science goals.
   - *Comms:* Telemetry antenna throughput and line-of-sight link budget.
6. **Launch:** Pad countdown, flame exhaust, camera shake, and atmospheric ascent. Rocket reliability determines flight survival.
7. **Cruise (Hazard Dodge):** Side-scrolling deep-space transit. Dodge asteroids, micrometeoroids (reduce solar wattage), and telegraphed solar flare beams. Light-time latency ticker displays ground signal delay.
8. **Insertion Burn:** Precision retro-burn minigame. Hitting SPACE inside the green capture zone secures orbit; propellant reserves dynamically widen the green zone.
9. **Orbit Ops:** Orbit the target planet with daytime and nighttime eclipse shadow sides (tests batteries!). Scan glowing surface targets matching your instruments, buffer telemetry packets, and beam them to Earth's 70-meter Deep Space Network dishes.
10. **Mission Report:** 100-point score across 6 categories (Flight, Science, Data, Resource/Schedule, Margins, Teamwork), letter grade (S, A, B, C, F), Flight Recorder debrief suggestions, high-score table, and shareable design hash.

---

## 🔬 Real NASA Data Layer & Sources

All values are derived from publicly available NASA, JPL, and NIST figures (see [data/sources.md](data/sources.md)):

* **Solar Irradiance:** 1361 W/m² at 1 AU (NASA SORCE measurement). Diminishes by $1/r^2$: at Mars (1.52 AU) it is ~43% of Earth, at Jupiter (5.2 AU) it is ~3.7% (~14 W/m²).
* **Planetary Distances:** Earth 1.0 AU, Mars 1.52 AU, Jupiter 5.2 AU (NASA Planetary Fact Sheet).
* **Light-Time Delays:** Moon ~1.3s, Mars ~3–22 min, Jupiter ~35–50 min (NASA Deep Space Network).
* **MMRTG Power:** 110W electrical, ~45 kg mass (NASA Radioisotope Power Systems).
* **Heritage Probes:** Landsat-9, Lunar Reconnaissance Orbiter (LRO), Mars Reconnaissance Orbiter (MRO), and Juno.

---

## 🕹️ Controls & Hotkeys

| Key | Action |
|---|---|
| **Arrows / W, A, S, D** | Navigate menus / Fly spacecraft in Cruise / Adjust orbit speed |
| **SPACE / ENTER** | Select / Toggle instruments / Fire retro-engine / Scan planetary targets |
| **F** | **Toggle Fullscreen Mode** |
| **H** | **Open Mission Codex Handbook** (accessible anywhere) |
| **M** | **Toggle Audio Mute** |
| **ESC** | Back / Return to Hangar |

---

## 🛠️ Zero-Asset Tech Stack

* **Resolution:** Native 480×270 canvas scaled with CSS `image-rendering: pixelated;`.
* **Palette:** Strict 16-color PICO-8 retro palette.
* **Procedural Sprites:** Zero image files. All sprites drawn from string maps in code.
* **Synthesized Audio:** Zero audio files. Pure Web Audio square, triangle, and noise waves.
* **Embedded Font:** Custom 5×7 bitmapped character generator (1x labels, 2x headings).

---

## 🚀 Running Locally

```bash
# Serve statically with Python 3:
python -m http.server 8080

# Or with Node.js:
npx serve .
```

Navigate to `http://localhost:8080`.

---

## 🏆 NASA Space Apps Challenge 2026 Alignment

Built as a solo rapid build for the NASA Space Apps Challenge 2026 using Google Antigravity.
All numbers are simplified educational game values inspired by real astrodynamics.
Licensed under the [MIT License](LICENSE).


