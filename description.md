# Lunora: Mission Architect 🛰️
## System Architecture, Design Specification & Aerospace Science Documentation

**Challenge:** NASA Space Apps Challenge 2026 — *Space Mission Design Game*  
**Game Title:** Lunora: Mission Architect  
**Live Application URL:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)  
**Public Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)  
**Architecture:** Zero-dependency static web application (Vanilla HTML5, modern CSS Grid/Flexbox, ES6 Modules, Web Audio API, Canvas 2D)  
**Test Suite:** Native Node.js test runner (`node --test tests/*.test.js`)

---

## 1. Executive Summary & Vision

**Lunora: Mission Architect** is a guided space mission design simulation engineered to bring authentic aerospace trade-offs to students, educators, and space enthusiasts.

Rather than relying on twitch reflexes or punishing arcade mechanics, **Lunora: Mission Architect** puts the focus where real mission engineering happens: **in the trade studies and design decisions made before a rocket leaves the pad**.

Players act as Lead Systems Engineers for NASA robotic exploration missions. In a sleek, responsive interface, players configure deep-space probes across critical subsystems—**Launch Booster**, **Structural Bus**, **Electrical Power**, **Telecommunications**, and **Scientific Instrumentation**—while balancing strict mission constraints:
1. **Total Mission Budget ($M)**
2. **Launch Vehicle Mass Capacity (kg)**
3. **Solar Irradiance Flux ($1/r^2$) & Nighttime Shadows**
4. **Deep Space Network (DSN) Telemetry Bandwidth (Mb/day)**
5. **Chassis Payload Constraints & Surface Landing Requirements**

Once an architect balances their spacecraft, they launch their mission into an animated, watchable milestone flight simulator. The simulator tests the probe through five key flight stages—ascent, staging, deep-space transit, orbital insertion / touchdown, and science downlink—delivering a comprehensive debrief with 1,000-point scoring, star ratings, actionable aerospace hints, and authentic NASA planetary facts.

---

## 2. Technical Stack & Architecture

Lunora was developed with strict zero-dependency architectural standards:

```
[ Client Web Browser (Desktop / Tablet / Mobile) ]
       │
       ├── index.html (Semantic HTML5 shell, Open Graph meta, SVG Favicon)
       ├── css/style.css (Dark aerospace theme, responsive CSS Grid / Flexbox, tokens)
       │
       └── js/ (Pure ES6 Modules, Zero Build Step)
            ├── data.js    — NASA planetary datasets, hardware catalog, mission rules
            ├── state.js   — Centralized reactive state store, history stack (undo/redo), auto-fix engine
            ├── engine.js  — Systems evaluation equations, feasibility checks, flight simulation model
            ├── ui.js      — Dynamic DOM screen renderers, live SVG blueprint generator, HUD updates
            └── main.js    — Application lifecycle coordinator, audio synthesizer, canvas flight particle engine
```

### Architectural Highlights
- **Zero Build Step:** Runs directly in any modern browser without Webpack, Vite, Babel, or npm compilation.
- **100% Static Deployment:** Can be served by GitHub Pages, Python's `http.server`, or any static CDN.
- **Responsive Layout:** Powered by CSS Grid, Flexbox, `clamp()`, and `100dvh` to ensure flawless rendering across phones, tablets, and widescreen 4K displays.
- **Synthesized Audio:** Uses the browser's native `AudioContext` to generate pleasant UI chimes, auto-fix notifications, liftoff rumbles, and victory fanfares without downloading a single `.mp3` or `.wav` file.
- **Dynamic SVG Blueprinting:** A scalable vector graphics generator dynamically renders the spacecraft layout in real time as components are swapped.

---

## 3. Aerospace Physics & Mathematical Models

All game logic in `js/engine.js` is derived from textbook astrodynamics and NASA mission design principles:

### 3.1 Solar Irradiance & The Inverse-Square Law
Solar flux diminishes with the square of the distance from the Sun ($r$ in Astronomical Units):

$$I(r) = I_0 \times \left(\frac{1}{r^2}\right)$$

Where $I_0 = 1361\text{ W/m}^2$ at Earth ($1.0\text{ AU}$).
- **Low Earth Orbit ($1.0\text{ AU}$):** $1.0\times$ solar intensity ($100\%$).
- **The Moon ($1.0\text{ AU}$):** $1.0\times$ solar intensity ($100\%$).
- **Mars ($1.52\text{ AU}$):** $1 / (1.52)^2 \approx 0.433$ ($43.3\%$ intensity).
- **Jupiter Trojan Asteroids ($5.2\text{ AU}$):** $1 / (5.2)^2 \approx 0.037$ ($3.7\%$ intensity).

A 140W solar array at Earth produces approximately $60.2\text{W}$ at Mars and only $5.2\text{W}$ at Jupiter, requiring missions to the outer solar system to adopt Radioisotope Thermoelectric Generators (MMRTGs) powered by Plutonium-238 decay heat.

### 3.2 Telemetry Link Budget & Science Efficiency
Scientific sensors produce data volumes (Mb/day) that must be downlinked to Earth's 70-meter Deep Space Network dishes:

$$\text{Data Factor} = \min\left(1.0, \frac{\text{Antenna Downlink Rate}}{\sum \text{Instrument Data Generation Rate}}\right)$$

The effective science points returned by the mission are scaled according to telemetry throughput:

$$\text{Science Score} = \text{Raw Science} \times \left(0.40 + 0.60 \times \text{Data Factor}\right)$$

If an architect equips high-bandwidth sensors (such as imaging cameras and radar sounders) without an adequate parabolic dish antenna, data buffers saturate and up to $60\%$ of potential science returns are lost.

### 3.3 Flight Success Probability
Mission reliability is computed from launch vehicle heritage, power margin, and financial reserve:

$$P_{\text{success}} = V_{\text{rel}} \times P_{\text{power}} \times \left(0.90 + \min(0.10, \text{Budget Margin})\right)$$

Where:
- $V_{\text{rel}}$ is booster reliability ($90\%$ to $97\%$).
- $P_{\text{power}} = 1.0$ if power supply $\ge$ power draw, else $(0.4 + 0.4 \times \frac{\text{supply}}{\text{needed}})$.
- Budget Margin = $\frac{\text{Budget} - \text{Cost}}{\text{Budget}}$.

In **Cadet Mode**, random flight failures are eliminated for fully validated spacecraft, providing a rewarding learning environment for first-time players.

---

## 4. Hardware Catalog & Planetary Missions

### 4.1 Missions

| ID | Mission Name | Destination | Budget | Solar Intensity | Target Objective |
|:---:|:---|:---|:---:|:---:|:---|
| 1 | **First Light** | Low Earth Orbit (500 km) | $60M | 100% | LEO Earth remote sensing and high-rate telemetry demonstration. |
| 2 | **Lunora Orbiter** | Lunar Polar Orbit | $120M | 100% | Polar orbital reconnaissance mapping surface minerals and shadowed craters. |
| 3 | **Red Dust Rover** | Mars Jezero Crater | $260M | 43% | Surface astrobiology rover requiring heavy lander bus and dust-tolerant power. |
| 4 | **Comet Chaser** | Jupiter Trojan Asteroid (5.2 AU) | $320M | 3.7% | Deep space rendezvous requiring long-range DSN comms and nuclear power. |

### 4.2 Launch Boosters

| ID | Booster | Cost | Lift Capacity | Reliability | Reach Profiles |
|:---|:---|:---:|:---:|:---:|:---|
| `sparrow` | **Sparrow-1** | $12M | 350 kg | 90% | LEO only |
| `falcon` | **Kestrel-5** | $40M | 1,600 kg | 95% | LEO, Moon |
| `atlas` | **Titan-X Heavy** | $95M | 5,000 kg | 97% | LEO, Moon, Mars, Deep Space |

### 4.3 Spacecraft Buses

| ID | Bus Name | Cost | Mass | House Power Draw | Max Payload | Lander Equipped |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| `small` | **Micro-Bus** | $6M | 35 kg | 15 W | 60 kg | No |
| `medium` | **Standard Orbiter Bus** | $16M | 100 kg | 35 W | 160 kg | No |
| `heavy` | **Explorer Lander Bus** | $35M | 220 kg | 60 W | 320 kg | **Yes** |

### 4.4 Electrical Power Systems

| ID | Power System | Cost | Mass | Base Wattage | Effective @ Mars | Effective @ Jupiter |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| `battery` | **Li-Ion Battery Only** | $2M | 25 kg | 45 W | 45 W (expires) | 45 W (expires) |
| `solar_s` | **Compact Solar Array (1.5 m²)** | $7M | 30 kg | 140 W | ~60 W | ~5 W |
| `solar_l` | **Deployable Solar Wings (6 m²)** | $16M | 85 kg | 380 W | ~163 W | ~14 W |
| `rtg` | **MMRTG Nuclear Generator (150W)** | $38M | 55 kg | 150 W | 150 W | 150 W |
| `rtg_dual` | **Dual MMRTG System (280W)** | $52M | 85 kg | 280 W | 280 W | 280 W |

### 4.5 Telecommunications Antennas

| ID | Antenna Type | Cost | Mass | Power Draw | Downlink Throughput |
|:---|:---|:---:|:---:|:---:|:---:|
| `low` | **Low-Gain Patch Antenna** | $4M | 6 kg | 10 W | 300 Mb/day |
| `med` | **Medium Parabolic Dish (0.8m)** | $12M | 22 kg | 35 W | 1,500 Mb/day |
| `high` | **High-Gain Deep Space Antenna (2.4m)** | $24M | 48 kg | 75 W | 6,000 Mb/day |

### 4.6 Scientific Instruments

| ID | Instrument | Cost | Mass | Power | Data | Science | Special Requirements |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---|
| `cam` | **Multispectral Camera** | $6M | 15 kg | 25 W | 800 Mb/d | 15 pts | None |
| `spec` | **Imaging Spectrometer** | $14M | 28 kg | 45 W | 350 Mb/d | 25 pts | None |
| `radar` | **Subsurface Sounding Radar** | $20M | 50 kg | 85 W | 600 Mb/d | 35 pts | None |
| `mag` | **Fluxgate Magnetometer Boom** | $5M | 8 kg | 10 W | 40 Mb/d | 12 pts | None |
| `arm` | **Robotic Sample Arm & Drill** | $28M | 75 kg | 50 W | 80 Mb/d | 45 pts | **Requires Lander Bus** |

---

## 5. User Interface & Gameplay Flow

The user interface follows a modern, dark aerospace control console motif (`#070b1a` deep space navy, `#111a33` panel slate, and `#4dd0ff` telemetry cyan).

```
┌────────────────────────────────────────────────────────────────────────┐
│  LUNORA: MISSION ARCHITECT           STEP 3 OF 5: POWER & TELEMETRY    │
├────────────────────────────────────────────────────────────────────────┤
│  MISSION HUD                                                           │
│  [BUDGET: $192M / $260M]  [MASS: 412 / 5000 KG]  [POWER: 280W / 215W]  │
├──────────────────────────────────┬─────────────────────────────────────┤
│  SPACECRAFT BLUEPRINT (SVG)      │  SUBSYSTEM SELECTION CARDS          │
│                                  │                                     │
│     [═══]  (Solar Arrays / RTG)  │  [Card 1] Compact Solar Array       │
│     ┌───┐                        │  [Card 2] Deployable Solar Wings    │
│    (│ H │) (Lander Bus Chassis)  │  [Card 3] MMRTG Nuclear Generator   │
│     └───┘                        │  [Card 4] Dual MMRTG System         │
│     ( v )  (Parabolic Dish)      │                                     │
│                                  │  [Card 5] Low-Gain Patch Antenna    │
│                                  │  [Card 6] Medium Parabolic Dish     │
│                                  │  [Card 7] High-Gain Deep Space Dish │
├──────────────────────────────────┴─────────────────────────────────────┤
│  ARIA ADVISOR: "Mars sunlight is weak (43%). Consider RTG power."      │
│  [ < PREVIOUS ]  [ ↺ UNDO ]  [ 💡 AUTO-FIX ]  [ NEXT STEP > ]          │
└────────────────────────────────────────────────────────────────────────┘
```

### The 5 Wizard Steps
1. **Target Selection:** Review destination profiles, scientific objectives, and environmental constraints.
2. **Booster & Chassis:** Choose the rocket booster and spacecraft bus, monitoring lift capacity and lander requirements.
3. **Power & Telemetry:** Select electrical generation and communications antennas, monitoring solar distance derating.
4. **Scientific Payload:** Equip multispectral cameras, spectrometers, sounding radars, and surface arms within mass and power limits.
5. **Flight Readiness Review:** View a NASA-style subsystem readiness board. If errors exist, the **Auto-Fix** assistant can solve them with a single click.

---

## 6. Scoring, Star Rating & Post-Flight Debriefing

The post-mission report breaks down spacecraft performance across four key dimensions:

$$\text{Total Score} = \text{Science Pts (600)} + \text{Budget Margin Pts (200)} + \text{Reliability Pts (100)} + \text{Bonus Goal (100)}$$

- **Science Points (Up to 600):** Scaled relative to the mission's expected target threshold.
- **Budget Reserves (Up to 200):** Earned by completing the mission under the maximum budget ceiling.
- **Reliability Margin (Up to 100):** Earned by selecting high-reliability boosters and maintaining power margins.
- **Bonus Mission Goal (100):** Awarded for achieving unique operational challenges (e.g., dual science suites, extreme budget efficiency, or deep-space sample return).

### Star Rating Tiers
- **⭐ 1 Star:** Successfully cleared the launch pad and achieved partial flight trajectory.
- **⭐⭐ 2 Stars:** Successfully reached target destination and conducted primary science operations.
- **⭐⭐⭐ 3 Stars:** Flawless mission execution, fully under budget, with bonus objective achieved.

---

## 7. Automated Test Suite

A comprehensive automated test suite in `tests/architect.test.js` exercises the engine and state management:

| Test Case | Description | Result |
|---|---|:---:|
| `evaluate: mass, cost, power, downlink` | Verifies accuracy of arithmetic calculations. | **PASS** |
| `evaluate: blocks invalid rocket reach` | Ensures small boosters cannot launch interplanetary missions. | **PASS** |
| `evaluate: detects Mars power deficit` | Validates solar irradiance attenuation formula at 1.52 AU. | **PASS** |
| `solvability: all 4 recommended builds` | Confirms all 4 missions pass validation with baseline configs. | **PASS** |
| `autofix: solves reach and power deficits` | Verifies one-click automated resolution of design blockers. | **PASS** |
| `simulation: 3 stars on complete design` | Confirms complete designs achieve 3 stars and $\ge 700$ points. | **PASS** |
| `evaluate: sample arm requires lander` | Ensures surface drill arms cannot fly on orbital-only buses. | **PASS** |
| `evaluate: instruments exceed bus capacity` | Prevents exceeding structural chassis payload limits. | **PASS** |
| `state: undo restores previous design state` | Verifies snapshot stack integrity during design revisions. | **PASS** |
| `simulation: all 4 missions achieve 3 stars` | Brute-force validation of all 4 missions in Cadet difficulty. | **PASS** |

Run tests at any time via:
```bash
npm test
```

---

## 8. Deployment & Public Access

- **Public GitHub Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)
- **Live Production URL:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)
- **Hosting Method:** GitHub Pages via branch `main`.

No server setup, API keys, or database dependencies are required. Any standard modern web browser will immediately load and run the game.