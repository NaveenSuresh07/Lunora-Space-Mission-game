# Lunora: Mission Architect 🛰️
### Interactive Space Mission Design & Systems Engineering Simulator
**NASA Space Apps Challenge 2026** · *Space Mission Design Game*  
**Live Application:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)  
**GitHub Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)

[![Play Live](https://img.shields.io/badge/Play_Live-GitHub_Pages-00e436?style=for-the-badge&logo=github)](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_Build_Step-4dd0ff?style=for-the-badge)](#)
[![Automated Tests](https://img.shields.io/badge/Tests-10%2F10_Passing-brightgreen?style=for-the-badge)](#)
[![NASA Space Apps](https://img.shields.io/badge/NASA_Space_Apps-2026-blue?style=for-the-badge)](#)

---

## 🌌 Overview

**Lunora: Mission Architect** is an accessible, educational space mission design simulator built for the NASA Space Apps Challenge 2026. 

Players assume the role of NASA Systems Engineers designing real-world robotic exploratory spacecraft. Balancing competing constraints—**Launch Vehicle Lift Capacity**, **Mission Budget ($M)**, **Solar Irradiance Flux ($1/r^2$)**, and **Deep Space Network (DSN) Telemetry Bandwidth**—players architect probes to explore Earth orbit, the Moon, the surface of Mars, and primordial asteroids in the outer solar system.

Once a design passes all feasibility checks, players launch their spacecraft through an animated, watchable milestone flight sequence that evaluates ascent, orbital capture, entry/descent, and telemetry downlink.

---

## 🎯 Key Features

1. **Guided 5-Step Mission Architecture Wizard:**
   - **Step 1: Mission Target & Parameters:** Select destination (LEO, Moon, Mars, Deep Space Asteroid) and review environmental constraints.
   - **Step 2: Booster & Chassis:** Pair launch vehicles (Sparrow-1, Kestrel-5, Titan-X Heavy) with appropriate structural buses (Micro-Bus, Standard Orbiter, Heavy Explorer Lander).
   - **Step 3: Power & Telemetry:** Balance inverse-square solar arrays vs. Plutonium-238 MMRTG nuclear generators with parabolic DSN antennas.
   - **Step 4: Scientific Payload Suite:** Select specialized scientific instruments (Multispectral Cameras, Imaging Spectrometers, Sounding Radars, Magnetometers, Robotic Sample Drill Arms).
   - **Step 5: Flight Readiness & Launch Poll:** Comprehensive pre-flight system diagnostics with instant blocker identification and auto-fix capabilities.

2. **Live Spacecraft Blueprint Visualizer:**
   - Interactive, procedural SVG schematic rendered directly in the HUD.
   - Dynamically morphs and attaches solar wings, RTG casks, dish antennas, and instrument pods as parts are swapped.

3. **Persistent Real-Time Engineering HUD:**
   - Color-coded telemetry bars for **Budget**, **Mass**, **Power**, and **Data Downlink**.
   - Clear indicators showing limits, margins, and target distance derating.

4. **Intelligent Auto-Fix Assistant:**
   - One-click resolution for common aerospace engineering blockers (upgrading boosters for interplanetary reach, adding nuclear power for deep-space missions, and trimming excess mass).

5. **Watchable Milestone Flight Simulator:**
   - Real-time animated canvas particle propulsion trail, staging, trajectory curves, and procedural Web Audio rocket rumble synthesizer.
   - Tracks 5 operational milestones: Liftoff, Staging, Deep Space Transit, Orbital Capture / Touchdown, and Science Operations.

6. **Post-Mission Systems Debrief:**
   - Comprehensive 1,000-point aerospace scorecard evaluating Science Yield, Budget Reserves, Reliability Margins, and Mission Bonus Goals.
   - 1 to 3 Star Performance Rating.
   - Actionable engineering feedback and authentic NASA planetary facts.

7. **Zero-Asset, Zero-Build-Step Architecture:**
   - Pure vanilla HTML5, modern responsive CSS (CSS Grid, Flexbox, custom properties), and ES6 JavaScript modules.
   - 100% static hosting compatible with GitHub Pages. Zero npm build or bundler dependencies.

---

## 🚀 The 4 Exploratory Missions

| Mission | Destination | Distance | Budget | Key Challenge |
|---|---|---|---|---|
| **First Light** | Low Earth Orbit (500 km) | 1.0 AU | $60M | Budget & payload limits on small booster. |
| **Lunora Orbiter** | Lunar Polar Orbit | 1.0 AU | $120M | High-resolution polar mapping and communications link. |
| **Red Dust Rover** | Mars Jezero Crater | 1.52 AU | $260M | 43% solar flux, thermal survival, and lander bus requirement. |
| **Comet Chaser** | Jupiter Trojan Asteroid | 5.2 AU | $320M | Extreme distance (3.7% solar flux), requiring nuclear RTG and high-gain DSN telemetry. |

---

## 🔬 Authentic Aerospace Physics & Formulas

- **Inverse-Square Law for Solar Power:**
  $$P(r) = P_0 \times \left(\frac{1}{r^2}\right)$$
  At Earth ($1.0\text{ AU}$): $100\%$ intensity ($1361\text{ W/m}^2$). At Mars ($1.52\text{ AU}$): $\approx 43\%$. At Jupiter ($5.2\text{ AU}$): $\approx 3.7\%$.
- **Telemetry Downlink Factor:**
  $$\text{Data Factor} = \min\left(1.0, \frac{\text{Antenna Downlink Rate}}{\text{Instrument Generation Rate}}\right)$$
- **Effective Science Yield:**
  $$\text{Science Score} = \text{Raw Science} \times (0.4 + 0.6 \times \text{Data Factor})$$
- **Launch Vehicle Lift & Reach Constraints:**
  Spacecraft mass cannot exceed the booster payload capacity, and the rocket's stage energy must match the target destination's $\Delta v$ reach profile.

---

## 🧪 Test Suite & Solvability Verification

The project includes a built-in Node.js native test suite covering mass calculations, reach verification, power deficits, solvability of all recommended mission builds, auto-fix mechanics, and simulation scoring:

```bash
npm test
```

All 10 test suites pass with 100% test coverage.

---

## 🛠️ Local Development & Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NaveenSuresh07/Lunora-Space-Mission-game.git
   cd Lunora-Space-Mission-game
   ```

2. **Serve locally using any static web server:**
   ```bash
   # Python 3
   python -m http.server 8080

   # or Node.js npx
   npx serve .
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080` in any modern web browser.

---

## 📜 License & Credits

Created for the **NASA Space Apps Challenge 2026** by Naveen Suresh.  
Planetary facts, mission profiles, and aerospace data adapted from NASA, JPL, and public NASA Planetary Data System archives.