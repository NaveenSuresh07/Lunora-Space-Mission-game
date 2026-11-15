# Lunora: Mission Control Arcade 🛰️🕹️
## Complete Technical Architecture, Aerospace Engineering & Game Design Specification (v2)

**Challenge:** NASA Space Apps Challenge 2026 — *Space Mission Design Game*  
**Game Title:** Lunora: Mission Control Arcade  
**Version:** 2.0 (Playable 2D Arcade & Systems Engineering Simulator)  
**Live Application URL:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)  
**Public Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)  
**Internal Resolution:** Fixed 960×540 Logical Canvas with Dynamic Retina Scaling (`dpr`)  
**Tech Stack:** Pure Vanilla HTML5 Canvas, Modern CSS Grid & Flexbox, ES6 Modules, Native Web Audio API, Zero External Assets/Dependencies  
**Test Suite:** Native Node.js Test Runner (`node --test tests/*.test.js`)

---

## 1. Executive Summary & Design Philosophy

**Lunora: Mission Control Arcade** was designed to solve a fundamental problem in educational aerospace games: *how to make authentic systems engineering trade-offs tangible, thrilling, and educational without reducing the experience to passive multiple-choice forms or ungrounded sci-fi fantasy.*

The core design principle is:
> **Design is the strategy layer. Arcade is the execution layer. Debrief is the learning layer.**

Players act as the Mission Director at Lunora Space Agency. In each mission, players:
1. **Plan & Architect:** In a tactile Hangar workshop, players arrange modular components (power supplies, science instruments, high-gain antennas, propellant tanks, thermal shields) into a 6×4 spacecraft internal bay, constrained by vehicle lift mass, mission budgets, and target solar irradiance.
2. **Fly the 4 Real NASA Mission Segments:**
   - **Launch Segment:** Pilot vertical gravity-turn ascent, ease throttle during Max-Q aerodynamic stress, and cleanly separate stages.
   - **Space Segment:** Navigate deep space, survive micrometeoroids and solar flares, manage subsystem power draw during planetary shadow passes, and execute precision orbit insertion retro-burns.
   - **Ground Segment:** Point Earth’s Deep Space Network (DSN) ground dishes (Goldstone, Madrid, Canberra) to downlink scientific telemetry packets, buffering data through occultation blackouts.
   - **User Segment:** Sort incoming multispectral, geological, and magnetic telemetry packets into scientific domains to trigger discovery combo multipliers.
3. **Debrief:** Receive an authentic post-flight evaluation with a 1,000-point scorecard, 1–3 star ratings, Concept Maturity Level (CML 1–4) promotions, segment-by-segment letter grades (A–D) with actionable engineering tips, and a match to an authentic NASA heritage mission.

---

## 2. Technical Architecture & File Organization

Lunora was developed with strict zero-dependency architectural constraints:

```
[ Web Browser Client (Desktop / Tablet / Smartphone) ]
       │
       ├── index.html (Responsive viewport shell, 960x540 canvas, UI overlay mount)
       ├── css/style.css (Aerospace dark theme, responsive grid/flexbox, zero overflow)
       │
       └── js/ (Vanilla ES6 JavaScript Modules)
            ├── data.js     — NASA planetary datasets, hardware parts catalog, computeStats, autoBuild
            ├── core.js     — 60 FPS fixed-timestep loop, input manager (keys + touch), Web Audio synth, particles, popups, camera shake
            ├── hangar.js   — Interactive 6x4 bay grid, booster selection, live telemetry meters, auto-fix
            ├── stages.js   — The 4 playable NASA arcade stages (Launch, Cruise, Operations, Science)
            ├── debrief.js  — 1000-pt scorecard, segment grades (A-D), CML ladder, NASA discovery card
            └── main.js     — Scene manager, canvas retina fitting, lifecycle coordinator
```

### Key Technical Attributes
1. **Fixed 960×540 Logical Resolution:** The internal rendering buffer is locked to 960×540 (16:9 widescreen standard). CSS containment ensures it scales cleanly across any window width or device orientation without letterboxing distortion or horizontal overflow:
   ```css
   canvas#game {
     width: min(100vw, calc(100dvh * (16 / 9)));
     aspect-ratio: 16 / 9;
   }
   ```
2. **Sharp Retina Rendering:** The canvas backing buffer dynamically scales to the display’s device pixel ratio (`dpr = min(window.devicePixelRatio || 1, 2)`), maintaining crisp vector rendering on 4K and Apple Retina displays.
3. **Synthesized Web Audio (Zero Audio Files):** All sound effects—including rocket exhaust rumble (low-pass filtered white noise), UI clicks, pickup chimes, damage thuds, staging whooshes, and victory fanfares—are generated in real time using the browser's native `AudioContext` with zero network overhead.
4. **Touch & Mobile Support:** Touch interactions automatically map to throttle, pitch nudge, and subsystem toggles, enabling seamless gameplay on iOS and Android phones.
5. **No Build Step:** 100% compatible with static hosting (GitHub Pages, Python `http.server`, etc.).

---

## 3. Real NASA Mission Segments & Stage Mechanics

### Stage 1: Launch Segment (Ascent & Staging)
- **NASA Segment:** Launch Segment (Pad operations, atmospheric ascent, staging, orbit insertion).
- **Arcade Genre:** Vertical corridor runner & precision staging timing.
- **Physics & Gameplay Mechanics:**
  - The rocket climbs vertically from 0 to 100 km through three parallax cloud/sky layers.
  - A glowing **ascent corridor** guides the rocket along its nominal gravity-turn trajectory. Corridor width is dictated by the booster's `corridor` stat (0.55 for Sparrow, 0.75 for Kestrel, 1.0 for Titan-X). Spacecraft mass sets vertical acceleration and steering inertia.
  - **Max-Q Aerodynamic Stress (35–55 km):** Dynamic pressure peaks. The rocket vibrates and screen flashes red. Players must throttle down (<50%) or take structural integrity damage. Surviving Max-Q awards `+50 MAX-Q SURVIVED`.
  - **Stage Separation (68–82 km):** Booster propellant burns out. Tapping `S` or `Space` in the green window separates the heavy lower stage, awarding `+100 PERFECT STAGING` and restoring agility.
- **Output:** `orbitAccuracy` (0 to 1) and remaining `fuel` passed into Stage 2.

### Stage 2: Space Segment (Cruise & Orbit Insertion)
- **NASA Segment:** Space Segment (Deep-space transit, thermal/power management, orbital capture).
- **Arcade Genre:** Side-scrolling hazard avoidance & orbital mechanics retro-burn timing.
- **Physics & Gameplay Mechanics:**
  - Spacecraft cruises rightward through interplanetary space toward the destination planet.
  - Steer vertically to dodge space debris, micrometeoroids, and solar radiation flares. Thermal shields reduce flare damage by 50%.
  - Pickups provide fuel replenishment (+30 fuel) and structural nano-repairs (+20% integrity).
  - **Subsystem Power Balancing (Bottom HUD):**
    - Toggles: `Heaters` (15W), `Science` (variable), `Comms` (25W).
    - During planetary shadow passes or at Mars/Deep Space distances, solar irradiance diminishes by the inverse-square law ($1/r^2$). If active power draw exceeds supply, the battery drains! Players can toggle non-essential subsystems off to prevent freeze damage. RTGs bypass this limitation entirely.
  - **Orbit Insertion Burn (Planetary Arrival):**
    - Upon reaching the target, a shrinking targeting ring approaches the planet's capture orbit.
    - A green capture corridor appears. Its width is dynamically expanded by remaining propellant reserves.
    - Pressing `Space` inside the green zone captures orbit, triggering a slow-motion beat and `+150 PERFECT CAPTURE`.
- **Output:** `integrity` (0 to 100), `batteryLeft`, and `insertionAccuracy` (0 to 1).

### Stage 3: Ground Segment (Operations & DSN Tracking)
- **NASA Segment:** Ground Segment (Deep Space Network tracking stations, command & telemetry downlinks).
- **Arcade Genre:** Orbit tracking & telemetry packet reception.
- **Physics & Gameplay Mechanics:**
  - Top-down view of planet Earth with the three primary NASA Deep Space Network complexes spaced 120° apart:
    - **Goldstone (California, USA 🇺🇸)**
    - **Madrid (Spain 🇪🇸)**
    - **Canberra (Australia 🇦🇺)**
  - Player's spacecraft circles Earth on a high orbital path, beaming scientific telemetry packets downward.
  - Players point the active DSN antenna dish (using keys `1`, `2`, `3` or `A`/`D`) to align reception with the orbiting probe. Dish reception width scales with antenna size (Low-Gain: 0.6×, Medium: 1.0×, High-Gain: 1.5×).
  - **Occultation Blackout:** When the spacecraft passes behind Earth, line-of-sight is lost! Data accumulates in the onboard buffer. Storage buffer components (`store`) prevent buffer overflow data loss. When emerging into line-of-sight, stored packets flush out in a rapid telemetry burst!
- **Output:** `dataReturnedPct` (0 to 100%).

### Stage 4: User Segment (Science Delivery)
- **NASA Segment:** User Segment (Science data processing, analysis, and discovery dissemination).
- **Arcade Genre:** High-speed data packet routing & combo chaining.
- **Physics & Gameplay Mechanics:**
  - Science analyzer console featuring four domain collection bins:
    - 🔵 **Imaging** (Multispectral Cameras, Space Telescopes)
    - 🟠 **Geology** (Spectrometers, Ground Radars, Core Drill Arms)
    - 🟢 **Atmosphere** (Atmospheric Spectrometry)
    - 🟣 **Magnetic** (Fluxgate Magnetometers)
  - Only data types corresponding to the instruments equipped by the player appear.
  - Players route incoming packets into matching bins using keys `1`, `2`, `3`, `4` or `Left`/`Right`.
  - Consecutive correct matches build a **Combo Multiplier** (`x2`, `x3`, `x4`!), yielding massive science points and unlocking the mission's authentic NASA scientific discovery.
- **Output:** Final `scienceScore` points.

---

## 4. Hardware Catalog & Spacecraft Engineering Data

All parameters are balanced educational representations grounded in public NASA/JPL figures:

### 4.1 Launch Boosters

| Booster | Cost ($M) | Lift Payload | Safe Corridor Width | Reliability | Max Reach | Description |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Sparrow-1** | $12M | 300 kg | ±55% | 90% | LEO only | Light two-stage launcher. Low cost, but strictly LEO. |
| **Kestrel-5** | $40M | 1,500 kg | ±75% | 94% | LEO, Moon | Medium-lift workhorse for Earth and Lunar trajectories. |
| **Titan-X Heavy** | $95M | 4,500 kg | ±100% | 96% | LEO, Moon, Mars, Deep | Flagship heavy booster required for Mars and deep space. |

### 4.2 Power Subsystems

| Power System | Cost ($M) | Mass (kg) | Power Output (W) | Grid Size | Sun-Dependent | Notes |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Battery Only** | $2M | 20 kg | 40 W | 1×1 | No | Non-rechargeable chemical cell. Cheap, but limited life. |
| **Small Solar Array** | $6M | 30 kg | 120 W | 2×1 | Yes | Produces 120W at Earth. Yield drops with $1/r^2$. |
| **Large Solar Wings** | $12M | 70 kg | 300 W | 2×2 | Yes | Produces 300W at Earth; high output across inner solar system. |
| **MMRTG Nuclear Generator** | $30M | 55 kg | 150 W | 1×2 | No | Plutonium-238 decay heat. Steady 150W in shadow and deep space. |

### 4.3 Scientific Instruments

| Instrument | Cost ($M) | Mass (kg) | Power Draw (W) | Data (Mb/d) | Science Pts | Grid Size | Compatibility Rule |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Multispectral Camera** | $5M | 15 kg | 30 W | 800 | 10 | 1×1 | None |
| **Imaging Spectrometer** | $12M | 30 kg | 50 W | 300 | 25 | 1×2 | None |
| **Subsurface Radar** | $18M | 45 kg | 90 W | 500 | 30 | 2×2 | None |
| **Magnetometer Boom** | $6M | 10 kg | 10 W | 20 | 12 | 1×1 | None |
| **Robotic Sample Arm** | $22M | 60 kg | 40 W | 50 | 40 | 1×2 | **Requires surface landing mission (Mars)** |
| **Space Telescope** | $35M | 80 kg | 60 W | 900 | 45 | 2×2 | **Only available for Deep Space (Deep Eye)** |

### 4.4 Telecommunications Antennas

| Antenna | Cost ($M) | Mass (kg) | Power Draw (W) | Downlink (Mb/d) | DSN Catch Radius | Grid Size |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Low-Gain Patch** | $3M | 5 kg | 10 W | 200 | 0.6× | 1×1 |
| **Medium Parabolic Dish** | $9M | 20 kg | 35 W | 1,200 | 1.0× | 2×1 |
| **High-Gain Deep Space Dish** | $18M | 40 kg | 70 W | 5,000 | 1.5× | 2×2 |

### 4.5 Extra Utility Modules

| Module | Cost ($M) | Mass (kg) | Grid Size | Playable Benefit |
|:---|:---:|:---:|:---:|:---|
| **Extra Fuel Tank** | $8M | 40 kg | 1×2 | +100 Propellant fuel reserve. Widens Stage 2 orbit insertion capture zone. |
| **Thermal Shield** | $7M | 25 kg | 1×1 | 50% damage reduction against solar flares and entry heat. |
| **Data Storage Buffer** | $6M | 10 kg | 1×1 | +1,500 Mb telemetry buffer capacity during planetary occultation blackout. |

---

## 5. Missions & Concept Maturity Levels (CML)

Progression follows NASA’s Jet Propulsion Laboratory (JPL) **Concept Maturity Level (CML)** framework:

```
CML 1 (Cadet)  ➔  CML 2 (Analyst)  ➔  CML 3 (Engineer)  ➔  CML 4 (Architect)
```

1. **Mission 1: First Light (CML 1 — Cadet)**
   - Target: Low Earth Orbit (500 km) · Solar Flux: 100% · Budget: $60M
   - Objective: Photograph Earth from orbit and test high-rate telemetry downlinks.
   - Real NASA Match: *CubeSat 101 / SmallSat Constellations*.
   - Discovery: High-resolution multispectral imagery maps river basins, crop yields, and coastal delta dynamics.
   - Bonus Goal: Complete mission with >$15M budget reserve.
2. **Mission 2: Lunora Orbiter (CML 2 — Analyst)**
   - Target: Lunar Polar Orbit · Solar Flux: 100% · Budget: $120M
   - Objective: Map the Moon and identify permanently shadowed crater water-ice candidates.
   - Real NASA Match: *Lunar Reconnaissance Orbiter (LRO)*.
   - Discovery: Hydrogen emission spikes confirm volatile water-ice deposits inside Shackleton Crater rim.
   - Bonus Goal: Equip both Spectrometer and Radar.
3. **Mission 3: Red Dust Rover (CML 3 — Engineer)**
   - Target: Mars Jezero Crater · Solar Flux: 43.3% · Budget: $260M · Landing: Yes
   - Objective: Survive Mars atmospheric entry and deploy a surface rover to sample sedimentary rock.
   - Real NASA Match: *Mars Curiosity & Perseverance Rovers*.
   - Discovery: Fluvial mudstone analysis confirms organic carbon compounds and ancient habitable aquatic chemistry.
   - Bonus Goal: Survive interplanetary cruise with >80% Mission Integrity.
4. **Mission 4: Deep Eye (CML 4 — Architect)**
   - Target: Deep Space (Sun-Earth L2) · Solar Flux: 15% · Budget: $300M · Landing: No
   - Objective: Deploy a cryogenic infrared telescope to detect exoplanet atmospheric compositions.
   - Real NASA Match: *James Webb Space Telescope (JWST) & Roman*.
   - Discovery: Transmission spectroscopy detects methane and water vapor signatures on an alien super-Earth.
   - Bonus Goal: Return >90% of all telemetry data via High-Gain dish.

---

## 6. Scoring, Star Rating & NASA Debriefing Model

### 1,000-Point Score Formula
$$\text{Total Score} = \text{Sci} \times 5 + \text{DataPct} \times 2 + \text{OrbitAcc} \times 150 + \text{InsertionAcc} \times 150 + \text{Integrity} \times 1.5 + \text{BudgetPct} \times 2 + \text{BonusGoal}$$

### Star Rating Tiers
- **⭐ 1 Star:** Mission completed through Stage 4.
- **⭐⭐ 2 Stars:** Primary objectives met with >30% integrity and >50% data downlink.
- **⭐⭐⭐ 3 Stars:** Flawless mission under budget with the mission bonus objective achieved!

### NASA Mission Segment Grades (A to D)
Every post-flight debrief breaks down performance across all four NASA mission segments with actionable engineering tips:
- **Launch Segment:** Evaluates ascent corridor tracking and staging timing.
- **Space Segment:** Evaluates hazard avoidance, power management in shadow, and insertion precision.
- **Ground Segment:** Evaluates Deep Space Network telemetry throughput and buffer overflow avoidance.
- **User Segment:** Evaluates telemetry packet matching and discovery combo chains.

---

## 7. Automated Test Suite & Solvability Verification

The repository includes a comprehensive unit and integration test suite in `tests/arcade.test.js`:

```bash
> npm test

✔ computeStats: calculates mass, cost, power, and downlink accurately (1.4ms)
✔ computeStats: blocks launch when rocket cannot reach target destination (0.19ms)
✔ computeStats: blocks launch when mass exceeds payload capacity (0.12ms)
✔ computeStats: blocks launch when power deficit occurs at Mars due to 1/r^2 law (0.11ms)
✔ compatibility: blocks robotic sample arm on orbital mission (0.10ms)
✔ compatibility: blocks space telescope on non-deep space mission (0.09ms)
✔ solvability: autoBuild generates 100% legal launch-ready builds for all 4 missions (0.50ms)
✔ grid placement: autoBuild fits all parts within the 6x4 bay boundary without overlapping (0.28ms)
✔ scoring & stars: evaluates debrief scorecard accurately (0.10ms)
✔ stages: all 4 missions achieve >= 700 points and 3 stars with autoBuild on nominal flight (0.31ms)

ℹ tests 10 | suites 0 | pass 10 | fail 0 | duration_ms 89ms
```

---

## 8. Deployment & Public Access

- **Public Production Link:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)
- **Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)
- **Deployment Branch:** `main` (hosted via GitHub Pages).
- **Run Locally:** Any static file server (`python -m http.server 8080` or `npx serve .`). No compilation, build step, or runtime dependencies required.
