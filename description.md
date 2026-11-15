# Lunora: Space Mission Game 🛰️🕹️
## Complete System Architecture, Game Design & Technical Specification Document

**Challenge:** NASA Space Apps Challenge 2026 — *Space Mission Design Game*  
**Game Title:** Lunora: Space Mission Game  
**Version:** Pixel Arcade Edition v3 (480×270 Challenge-Complete)  
**Live Game URL:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)  
**Public Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)  
**Palette:** PICO-8 Strict 16-Color Palette  
**Tech Stack:** Vanilla HTML5 Canvas, ES6 JavaScript Modules, Web Audio API, Zero External Assets/Dependencies  

---

## 1. Executive Summary & Overview

**Lunora: Space Mission Game** is an authentic retro 16-color pixel-art arcade and systems engineering simulator. Built for the NASA Space Apps Challenge 2026, it translates authentic aerospace trade-offs, astrodynamics equations, and flight operations into an engaging real-time arcade loop.

Players step into the shoes of mission architects and flight operators. After selecting a mission destination (Earth, Moon, Mars, or Jupiter), players configure an exploratory probe across ten engineering subsystems: orbital profile, bus chassis, electrical power source, battery chemistry, telemetry communications, attitude control (ADCS), propulsion engine, scientific instruments, chemical propellant mass, and launch booster. 

Engineering design decisions directly determine the probe's real-time flight mechanics:
- **Mass and engine selection** dictate agility and cruising speed.
- **Propellant velocity margin ($\Delta v$)** scales the green capture zone in the planetary insertion timing minigame.
- **Power and battery reserves** dictate whether scientific instruments function during nighttime planetary eclipses.
- **Antenna dish gain and transmit wattage** throttle the real-time downlink stream to Earth's 70-meter Deep Space Network antennas.
- **Attitude determination pointing accuracy** determines scientific target acquisition precision.

Lunora supports solo play as well as hot-seat multiplayer (1 to 4 players) simulating NASA's iconic flight console disciplines: **Planner**, **Engineer**, **Scientist**, and **Comms**. Before any spacecraft clears the pad, all four consoles must cast a unanimous **GO** in a verbal consensus poll.

---

## 2. Zero-Asset Technical Architecture

Lunora was engineered with strict zero-dependency architectural constraints:

```
[ Browser Client / Canvas 480x270 ]
        │
        ├── CRT Scanline & Phosphor Filter (CSS Pseudo-Element)
        ├── Dynamic Canvas Scaling (CSS min(98vw, 96vh * 16/9), image-rendering: pixelated)
        └── Virtual Touch D-Pad & Action Buttons (Mobile Auto-Detect)
        │
┌───────┴──────────────────────────────────────────────────────────────────┐
│                             js/main.js                                   │
│            Game Loop (60 FPS requestAnimationFrame), Scene Manager,       │
│               Global State, URL Hash Share Serializer/Deserializer       │
└───────┬──────────────────────────────────┬───────────────────────────────┘
        │                                  │
┌───────▼──────────────────────┐   ┌───────▼───────────────────────────────┐
│        js/core/              │   │        js/model/                      │
│ ├── gfx.js (16-Color, Font,  │   │ ├── data.js (Missions, Parts Catalog) │
│ │   Primitives, Shake, FX)   │   │ ├── engine.js (Physics, Astrodynamics)│
│ ├── audio.js (Web Audio Synth│   │ ├── validate.js (Go/No-Go Decision)   │
│ │   Square/Tri/Noise, BGM)   │   │ ├── score.js (100-Pt Model, Debrief)  │
│ ├── input.js (Keys, Touch,   │   │ ├── events.js (Space Weather System)  │
│ │   Pressed/Held States)     │   │ └── codex.js (Educational Handbook)   │
│ └── sprites.js (String-Map   │   └───────────────────────────────────────┘
│     Procedural Pixel Art)    │
└──────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────────────────────────┐
│                            js/scenes/                                    │
│  boot.js       -> BIOS telemetry diagnostic boot sequence                │
│  title.js      -> Retro arcade title, parallax starfield, hotkeys        │
│  select.js     -> Mission destination, difficulty tiers, team roles      │
│  hangar.js     -> Modular gantry bay, live composite probe, 6 HUD bars   │
│  gonogo.js     -> NASA flight director verbal poll (4 console roles)     │
│  launch.js     -> Pad countdown, engine ignition, staging, reliability   │
│  cruise.js     -> Side-scrolling hazard dodge runner, light delay ticker │
│  insertion.js  -> Retro-fire capture timing minigame, dynamic green zone │
│  ops.js        -> Planetary orbit scan run, day/night eclipse, DSN link  │
│  report.js     -> 100-pt scorecard, letter grades, debrief suggestions   │
│  codex.js      -> In-game astrodynamics reference handbook (`H` key)     │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Characteristics:
1. **No External Images:** Every sprite (probes, rockets, launch pads, thruster flames, asteroids, micrometeoroids, planets Earth/Moon/Mars/Jupiter, explosions, hearts, icons) is procedural—encoded as string matrices and drawn via direct canvas buffer fills.
2. **No Audio Files:** All sound effects (blips, select beeps, retro thruster burns, alarm sirens, explosive crashes, victory fanfares) and the looping Hangar ambient bassline are synthesized on the fly via the browser's native `AudioContext` using square, triangle, and bandpass-filtered white noise oscillators.
3. **Embedded Custom Font:** A custom 5×7 bitmapped character matrix powers all text rendering with support for 1x micro labels and 2x headings, bypassing external web font downloads.
4. **Resolution & Scaling:** Internal resolution is fixed at native **480×270 pixels** (16:9 widescreen arcade standard). It is scaled to any display using integer-friendly CSS aspect-ratio containment and `image-rendering: pixelated;`.
5. **Portability:** Served statically by any simple web server (`python -m http.server`, `npx serve`, or GitHub Pages). Runs on all modern desktop and mobile browsers.

---

## 3. Strict 16-Color PICO-8 Palette

All visuals adhere to the authentic PICO-8 color palette:

| Index | Hex Code | Visual Role in Game |
|:---:|:---:|:---|
| `0` | `#000000` | Deep space background, shadow zones, borders |
| `1` | `#1D2B53` | Dark blue, night side of planets, gantry shadows |
| `2` | `#7E2553` | Dark crimson, panel bevels, critical warning alerts |
| `3` | `#008751` | Dark emerald, nominal resource bar backings |
| `4` | `#AB5236` | Terracotta / Mars atmospheric rim, Martian surface |
| `5` | `#5F574F` | Charcoal slate, bus structural bulkheads, gantry steel |
| `6` | `#C2C3C7` | Lunar grey, antenna dishes, radar booms, instruments |
| `7` | `#FFF1E8` | Titanium white, spacecraft hulls, star specks, active text |
| `8` | `#FF004D` | Hazard red, solar flare beams, collision explosions, NO-GO |
| `9` | `#FFA300` | Thruster orange, solar panels, heat shields, caution warnings |
| `10` | `#FFEC27` | Optical yellow, camera lenses, target reticles, countdown |
| `11` | `#00E436` | Neon green, capture burn sweet-spot, GO consensus, full battery |
| `12` | `#29ADFF` | Azure blue, Earth oceans, Jupiter bands, DSN radio waves |
| `13` | `#83769C` | Indigo lavender, spectrometer prisms, sensor cones |
| `14` | `#FF77A8` | Magnetometer magenta, magnetometer sensor booms |
| `15` | `#FFCCAA` | Warm peach, thruster sparks, star dust, UI selection cursor |

---

## 4. Astrodynamics & Physics Formulas

Lunora incorporates simplified real-world physics formulas derived from NASA public flight baselines:

### 4.1. Structural Mass & Wet Mass
$$\text{Dry Mass } (m_{\text{dry}}) = m_{\text{bus}} + m_{\text{power}} + m_{\text{battery}} + m_{\text{comms}} + m_{\text{adcs}} + m_{\text{engine}} + \sum m_{\text{instruments}}$$
$$\text{Wet Mass } (m_{\text{wet}}) = m_{\text{dry}} + m_{\text{propellant}}$$
$$\text{Payload Mass } (m_{\text{payload}}) = \sum m_{\text{instruments}} \le \text{Bus Maximum Payload}$$

### 4.2. Tsiolkovsky Rocket Equation ($\Delta v$)
$$\Delta v = \frac{I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{m_{\text{wet}}}{m_{\text{dry}}}\right)}{1000} \quad (\text{km/s})$$
*Where standard gravity $g_0 = 9.80665\text{ m/s}^2$.*  
- Chemical thruster: $I_{\text{sp}} = 320\text{ s}$.
- Next-Gen Ion engine: $I_{\text{sp}} = 3000\text{ s}$.

### 4.3. Solar Power & Inverse-Square Law
$$P_{\text{solar}} = \text{Area } (m^2) \cdot \left(\frac{1361\text{ W/m}^2}{r_{\text{AU}}^2}\right) \cdot \eta_{\text{efficiency}} \quad (\text{with } \eta = 0.28)$$
- At Earth ($1.0\text{ AU}$): Solar irradiance is $1361\text{ W/m}^2$.
- At Mars ($1.52\text{ AU}$): Solar irradiance drops by $1 / (1.52)^2 \approx 43\%$ ($589\text{ W/m}^2$).
- At Jupiter ($5.2\text{ AU}$): Solar irradiance drops to $\approx 3.7\%$ ($50.3\text{ W/m}^2 \times 0.28 \approx 14\text{ W/m}^2$). Solar wings become impractical, making nuclear RTGs essential.
- RTGs (MMRTG / Dual RTG): Provide invariant continuous output ($110\text{ W}$ or $220\text{ W}$) unaffected by distance or eclipses.

### 4.4. Power Balance & Eclipse Shadow
$$\Delta P = P_{\text{generated}} - P_{\text{demanded}}$$
$$P_{\text{demanded}} = P_{\text{bus}} + P_{\text{comms}} + P_{\text{engine, extra}} + \sum P_{\text{instruments}}$$
During nighttime planetary shadow passes in Orbit Ops:
$$P_{\text{available, eclipse}} = P_{\text{demanded}} \cdot \text{Battery Coverage Ratio}$$
- Basic Li-Ion Battery: $60\%$ coverage $\implies$ instruments suffer brownouts without manual power-down.
- Advanced Space Battery: $100\%$ coverage $\implies$ continuous orbital science.

### 4.5. Telemetry Downlink Throughput & Light Delay
$$\text{Downlink Rate (GB/day)} = \min\left(200, \frac{P_{\text{tx}} \cdot G_{\text{antenna}}}{\text{Link Loss}}\right) \cdot \text{Orbit Contact Multiplier}$$
- Light-time delay is computed from real-world vacuum light speed ($c \approx 300,000\text{ km/s}$):
  - LEO: $0.002\text{ s}$
  - Moon: $1.3\text{ s}$
  - Mars: $720\text{ s}$ ($12\text{ minutes}$)
  - Jupiter: $2400\text{ s}$ ($40\text{ minutes}$)

### 4.6. Project Schedule & Development Lead Time
$$\text{Total Schedule (months)} = t_{\text{bus}} + \max(t_{\text{power}}, t_{\text{battery}}, t_{\text{comms}}, t_{\text{adcs}}, t_{\text{engine}}, t_{\text{instruments}}) + t_{\text{launcher}}$$
If the total schedule exceeds the mission deadline by $> 6\text{ months}$, the launch window closes, triggering an automatic launch scrub.

---

## 5. Subsystem Component Catalog

Lunora features 10 fully configured subsystem categories:

### 5.1. Missions & Destinations
| Mission | Destination | Target Heritage | Distance | Req. $\Delta v$ | Budget | Deadline | Min Sci | Min Data |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Earth Observer** | LEO (700 km Sun-Sync) | Landsat-9 / Terra | 1.0 AU | 0.0 km/s | $120M | 18 mo | 20 pts | 1,500 GB |
| **Lunar Mapper** | Polar Moon Orbit | Lunar Reconnaissance Orbiter | 1.0 AU | 4.0 km/s | $250M | 24 mo | 40 pts | 600 GB |
| **Mars Climate Orbiter** | Mars Aerocentric | MRO / MAVEN | 1.52 AU | 5.5 km/s | $400M | 30 mo | 60 pts | 3,000 GB |
| **Jupiter Moons Explorer** | Jovian System (Boss) | Juno / Europa Clipper | 5.2 AU | 7.0 km/s | $700M | 40 mo | 40 pts | 1,500 GB |

### 5.2. Orbital Profiles
| Orbit Profile | Science Mult | Downlink Mult | Payload Cap Mult | $\Delta v$ Mod | Radiation Risk | Operational Trade-off |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Low Orbit** | +15% (1.15x) | -20% (0.80x) | 1.00x | +0.3 km/s | 10% | Sharper imaging; shorter ground station passes. |
| **Mid / Sun-Sync**| 1.00x | 1.00x | 0.95x | 0.0 km/s | 15% | Balanced solar exposure and regular ground contact. |
| **High Orbit** | -15% (0.85x) | +30% (1.30x) | 0.80x | -0.2 km/s | 30% | Long contact passes; lower sensor resolution; high radiation. |

### 5.3. Spacecraft Bus Platforms
| Bus Platform | Dry Mass | Cost | House Power | Max Payload | Dev Time | Flight HP | Special Attributes |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Small Bus** | 150 kg | $20M | 40 W | 60 kg | 6 mo | 3 HP | Agile and lightweight; small payload limit. |
| **Medium Bus**| 500 kg | $60M | 120 W | 250 kg | 9 mo | 4 HP | Standard deep-space platform. |
| **Large Bus** | 1,200 kg | $140M | 250 W | 600 kg | 14 mo | 6 HP | Heavy flagship chassis; immune to solar flare instant-kills. |

### 5.4. Power Generation Systems
| Power System | Type | Area | Mass | Cost | Power Output | Dev Time | Operational Behavior |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Solar Array S** | Solar | 1 m² | 25 kg | $8M | ~380W @ 1 AU | 2 mo | Inward planets only. Chokes past Mars. |
| **Solar Array M** | Solar | 3 m² | 70 kg | $20M | ~1140W @ 1 AU | 3 mo | Balanced deep-space solar wings. |
| **Solar Array L** | Solar | 8 m² | 160 kg | $45M | ~3040W @ 1 AU | 4 mo | Large deployables; needed for Mars solar flux. |
| **RTG MMRTG** | Nuclear | 0 m² | 45 kg | $90M | 110 W constant | 12 mo | Plutonium-238 decay; constant power everywhere. |
| **Dual RTG** | Nuclear | 0 m² | 90 kg | $170M | 220 W constant | 14 mo | Essential for Jupiter (5.2 AU weak solar). |

### 5.5. Energy Storage Batteries
| Battery Model | Mass | Cost | Eclipse Shadow Coverage | Dev Time | Notes |
|:---|:---:|:---:|:---:|:---:|:---|
| **Basic Li-Ion Battery** | 15 kg | $4M | 60% electrical coverage | 1 mo | Causes sensor brownouts during shadow passes. |
| **Advanced Space Battery** | 40 kg | $12M | 100% electrical coverage | 3 mo | Sustains full instrument suite throughout eclipse. |

### 5.6. Communications Antennas
| Antenna Subsystem | Gain | Tx Power | Mass | Cost | Power Draw | Dev Time | Telemetry Capability |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Low Gain Patch** | 1x | 10 W | 5 kg | $4M | 15 W | 2 mo | Omnidirectional. Suitable for LEO only. |
| **Medium Gain Dish** | 30x | 10 W | 25 kg | $15M | 40 W | 4 mo | 0.8m parabolic reflector. Solid at Moon. |
| **High Gain Dish** | 60x | 40 W | 60 kg | $35M | 80 W | 6 mo | 2.5m motorized dish. Required for deep space gigabytes. |

### 5.7. Attitude Determination & Control (ADCS)
| ADCS System | Mass | Cost | Pointing Multiplier | Dev Time | Impact on Gameplay |
|:---|:---:|:---:|:---:|:---:|:---|
| **Basic Reaction Wheels** | 10 kg | $6M | 1.0x pointing | 2 mo | Standard target hit window in Orbit Ops. |
| **Star Trackers & Precise ADCS** | 25 kg | $18M | 1.5x pointing | 5 mo | +50% target hit window; auto-recovers from radiation anomalies. |

### 5.8. Propulsion Engines
| Engine Type | Specific Impulse ($I_{\text{sp}}$) | Dry Mass | Cost | Extra Power | Dev Time | Mission Impact |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **Bipropellant Chemical** | 320 s | 60 kg | $15M | 0 W | 4 mo | High instantaneous thrust; fast flight transfer. |
| **Next-Gen Ion Drive** | 3,000 s | 90 kg | $40M | +150 W | 8 mo | 10x propellant efficiency; -30% flight agility, draws 150W continuous. |

### 5.9. Scientific Instruments
| Instrument | Mass | Cost | Power Draw | Science Value | Data Rate | Dev Time | Sensor Palette Code |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Optical Framing Camera** | 20 kg | $12M | 25 W | 20 pts | 6 GB/day | 4 mo | `#FFEC27` (Yellow visual terrain) |
| **Infrared Spectrometer** | 30 kg | $25M | 40 W | 30 pts | 2 GB/day | 6 mo | `#00E436` (Green mineral/gas) |
| **Subsurface Radar Sounder**| 60 kg | $45M | 90 W | 40 pts | 4 GB/day | 9 mo | `#29ADFF` (Blue ice sounding) |
| **Fluxgate Magnetometer** | 5 kg | $6M | 8 W | 10 pts | 0.1 GB/day| 2 mo | `#FF77A8` (Pink magnetic boom) |

### 5.10. Launch Vehicles
| Launch Vehicle | Max Payload to LEO | Cost | Flight Reliability | Lead Time | Operational Risk |
|:---|:---:|:---:|:---:|:---:|:---|
| **Light Scout Booster** | 1,500 kg | $15M | 90% | 2 mo | 10% launch failure probability. |
| **Medium Workhorse** | 5,000 kg | $70M | 95% | 4 mo | 5% launch failure probability. |
| **Heavy Super-Lift** | 12,000 kg | $150M | 97% | 6 mo | 3% launch failure probability. |

---

## 6. Game Loop & Scene-by-Scene Breakdown

```
[ BOOT SEQUENCE ]
       │  (Terminal diagnostics, engine verification)
       ▼
[ TITLE SCREEN ]
       │  (Parallax stars, drifting planet, chiptune theme)
       ▼
[ STAGE & DIFFICULTY SELECT ]
       │  (Select target mission, difficulty, 1-4 players)
       ▼
[ HANGAR WORKSHOP ] ◄────────────────────────────────────────┐
       │  (Modular probe assembly, live composite rendering, │
       │   6 real-time resource meters)                      │
       ▼                                                     │
[ GO / NO-GO CONSOLE POLL ] ─────────────────────────────────┘ (NO-GO Abort: Re-engineer)
       │  (Consensus vote: Planner, Engineer, Scientist, Comms)
       ▼  (Unanimous GO authorizes countdown)
[ LAUNCH PAD LIFTOFF ]
       │  (Gantry retract, countdown, ignition plume, reliability roll)
       ▼
[ CRUISE HAZARD DODGE ]
       │  (Side-scroller: dodge asteroids, dust, coronal mass ejections)
       ▼
[ INSERTION BURN MINIGAME ]
       │  (Retro-fire timing: hit SPACE in dynamic green capture zone)
       ▼
[ PLANETARY ORBIT OPS ]
       │  (Day/night eclipse shadow, battery drain, target scanning, DSN beam)
       ▼
[ MISSION REPORT CARD ]
       │  (100-pt scorecard, S/A/B/C/F grades, Flight Recorder tips, URL share)
       ▼
[ MISSION CODEX HANDBOOK ] (`H` hotkey accessible in any scene)
```

### Detailed Scene Mechanics:

1. **Boot Sequence (`js/scenes/boot.js`):**
   - Emulates vintage flight computers running hardware diagnostics.
   - Text terminal prints memory allocation, astrodynamics math libraries, and DSN frequency locks before transferring to Title.

2. **Title Screen (`js/scenes/title.js`):**
   - Animated 2x pixel title logo with CRT flicker.
   - Multi-layer parallax starfield with celestial bodies drifting across the screen.
   - Audio synthesizer plays a rolling 8-bit chiptune bassline.
   - Displays key hotkeys: `[SPACE]` Start, `[F]` Fullscreen, `[H]` Codex Handbook, `[M]` Mute Audio.

3. **Stage & Difficulty Select (`js/scenes/select.js`):**
   - Choose from 4 destinations: Earth Observer, Lunar Mapper, Mars Climate Orbiter, Jupiter Moons Explorer.
   - Choose difficulty tier:
     - **Rookie:** $1.3\times$ budget multiplier, 50% fewer space hazards, automated battery and ADCS management.
     - **Engineer:** Standard NASA reference flight values and manual control of all ten subsystems.
     - **Flight Director:** $0.8\times$ budget restriction, severe solar storm frequency, tightest margins.
   - Configure hot-seat crew: 1, 2, 3, or 4 players assigned to consoles (Planner, Engineer, Scientist, Comms).

4. **Hangar Workshop (`js/scenes/hangar.js`):**
   - **Gantry Bay (Left):** Real-time modular pixel composite renderer. As parts are selected, the visual spacecraft updates instantly—chassis size changes, solar wings extend, RTG plutonium casks mount, antenna dishes snap to gantry trusses, and thruster bells attach.
   - **Configuration Tabs (Right):** Subsystem selectors covering Orbit, Bus, Power, Battery, Comms, ADCS, Propulsion, Instruments (multi-select), Propellant Slider ($0\text{ to }3000\text{ kg}$), and Launcher.
   - **Live HUD Resource Meters (Top):**
     1. *BUDGET:* Total expenditure vs. mission budget allowance.
     2. *MASS:* Wet mass vs. launch vehicle payload capacity.
     3. *POWER:* Generated solar/RTG wattage vs. subsystem draw.
     4. *$\Delta v$:* Computed velocity change vs. required orbital trajectory.
     5. *DOWNLINK:* Daily downlink throughput vs. instrument data production.
     6. *SCHEDULE:* Development timeline vs. orbital launch window.

5. **NASA Go / No-Go Poll (`js/scenes/gonogo.js`):**
   - Recreates the iconic pre-launch verbal consensus protocol.
   - Each discipline evaluates the design independently:
     - **Planner:** Evaluates budget surplus/deficit and launch window lead times.
     - **Engineer:** Evaluates structural integrity, power margin, and trajectory $\Delta v$.
     - **Scientist:** Evaluates instrument payload mass vs. bus limit and science return minimums.
     - **Comms:** Evaluates antenna throughput and radio line-of-sight link budget.
   - All four consoles must register **GO**. Any **NO-GO** displays the specific engineering violation and aborts the countdown back to the Hangar for re-engineering.

6. **Launch Pad Liftoff (`js/scenes/launch.js`):**
   - Tower gantry arm swings away from the rocket.
   - Animated T-minus countdown ($T-3, T-2, T-1$, Ignition).
   - Camera shakes violently as particle plumes erupt from the flame trench.
   - Rocket ascends through atmospheric layers with stage separation.
   - Launcher reliability rating rolls against a flight survival check.

7. **Cruise Hazard Dodge (`js/scenes/cruise.js`):**
   - Side-scrolling arcade runner simulating interplanetary transit.
   - Controls: Move up and down (`UP`/`DOWN` or `W`/`S`) to avoid deep-space hazards:
     - **Asteroids:** Fast-moving kinetic hazards that reduce spacecraft HP.
     - **Micrometeoroid Clouds:** Pepper the spacecraft, causing structural damage and diminishing solar array output.
     - **Coronal Mass Ejections (CME):** Telegraphed solar flare beams that sweep across the screen. Small/Medium buses take severe damage; Large Buses are shielded.
   - Agility and vertical speed are governed by probe mass and engine choice (Ion drives have lower thrust).
   - Telemetry latency ticker dynamically counts up real-time DSN light delay.

8. **Planetary Insertion Burn (`js/scenes/insertion.js`):**
   - Critical trajectory timing minigame as the probe approaches the target planet.
   - A target reticle oscillates across an orbital capture meter.
   - Pressing `SPACE` triggers the retro-burn.
   - Hitting the **green capture zone** inserts the probe into orbit. Missing the zone skips off the atmosphere or crashes into the planet.
   - **Dynamic Sizing:** Sparing more propellant $\Delta v$ margin widens the green capture zone, directly rewarding conservative aerospace engineering!

9. **Planetary Orbit Operations (`js/scenes/ops.js`):**
   - The probe enters an orbital path around the planet, cycling between illuminated daytime and dark nighttime eclipse phases.
   - **Battery Test:** During eclipse shadow, solar arrays produce 0W. Basic batteries trigger instrument brownouts; Advanced Space Batteries maintain continuous sensor sweeps.
   - **Science Scanning:** Surface features glow with color codes matching specific instruments (Optical Yellow, Spectrometer Green, Radar Blue, Magnetometer Pink).
   - Pressing `SPACE` over a matching target collects scientific data packets into the on-board buffer.
   - **DSN Telemetry Downlink:** When in line-of-sight with Earth, data packets stream down to ground stations, converting collected data into secured mission points.

10. **Mission Report Card & Debrief (`js/scenes/report.js`):**
    - Comprehensive 100-point aerospace evaluation across six scoring categories.
    - Grades awarded: **S** ($\ge 90$), **A** ($\ge 80$), **B** ($\ge 65$), **C** ($\ge 50$), **F** ($< 50$).
    - **Flight Recorder Analysis:** Generates plain-English cause-and-effect explanations of anomalies encountered during flight and provides actionable design tips for the next iteration.
    - Local leaderboard stores high scores per mission.
    - **Shareable Spacecraft Hash:** Encodes the player's complete build into a base64 URL hash, enabling instant sharing with other players.

11. **Mission Codex Handbook (`js/scenes/codex.js`):**
    - Accessible at any moment during gameplay by pressing the `H` hotkey.
    - Interactive handbook explaining the real science and equations:
      - *Tsiolkovsky Rocket Equation & Exponential Fuel Curves*
      - *Inverse-Square Law & Deep-Space Solar Irradiance*
      - *Deep Space Network & Relativistic Light Lag*
      - *Nuclear RTG Decay Heat & Plutonium-238*
      - *Orbital Selection: LEO vs. Sun-Sync vs. High Orbits*
      - *NASA Go/No-Go Consensus Operations*

---

## 7. Scoring Model & Evaluation Criteria

Lunora implements a multi-dimensional 100-point evaluation model:

| Evaluation Dimension | Maximum Points | Criteria & Scoring Function |
|:---|:---:|:---|
| **1. Flight Performance** | **30 pts** | Complete orbital insertion: 30 pts. Partial survival / cruise complete: 20 pts. Launch/burn failure: 0 pts. |
| **2. Scientific Return** | **20 pts** | Ratio of science collected vs. mission target: $\min\left(1.0, \frac{\text{Sci}}{\text{Target}}\right) \times 20$. |
| **3. Data Delivery** | **10 pts** | Ratio of telemetry successfully beamed to DSN: $\min\left(1.0, \frac{\text{Data}}{\text{Target}}\right) \times 10$. |
| **4. Resource Efficiency** | **15 pts** | Budget savings: up to 8 pts. On-time launch schedule: 7 pts ($\le \text{deadline}$), 4 pts ($\le +3\text{ mo}$), 1 pt ($> +3\text{ mo}$). |
| **5. Decision Quality & Margins** | **15 pts** | Power margin $\ge 15\%$: 5 pts. $\Delta v$ velocity reserve $\ge 10\%$: 5 pts. Comms link without bottleneck: 5 pts. |
| **6. Teamwork & Consensus** | **10 pts** | Unanimous GO on first console poll: 10 pts. Resolved after re-engineering: 5 pts. |
| **TOTAL** | **100 pts** | **Letter Grades:** S (90–100), A (80–89), B (65–79), C (50–64), F (<50) |

---

## 8. Space Weather & Dynamic Flight Events

To reflect the unpredictability of spaceflight, Lunora includes an event engine parameterized by difficulty tier:

```javascript
// Sample Event Triggers in js/model/events.js
HANGAR: "CONGRESSIONAL BUDGET TRIM"
  -> Fiscal policy adjustment cuts mission allocation by 10%.
LAUNCH: "UPPER LEVEL WIND SHEAR"
  -> High-altitude wind commit criteria violated; countdown scrubbed (+1 month schedule).
CRUISE: "CORONAL MASS EJECTION STORM"
  -> Solar flare wave velocity increases by 40%.
CRUISE: "COMETARY DEBRIS STREAM"
  -> Spacecraft enters dense dust trail; micrometeoroid spawn frequency doubled.
OPS:    "SINGLE EVENT UPSET (SEU)"
  -> Cosmic ray hits sensor bus. Precise ADCS autonomously reboots sensors; standard ADCS must wait for ground command uplink.
OPS:    "OPPORTUNISTIC TRANSIENT PHENOMENON"
  -> Active cryogenic geyser detected! +15 bonus science points available.
```

---

## 9. Controls, Inputs & Mobile Layout

Lunora supports full keyboard navigation on desktop as well as touch interfaces on mobile devices:

### Keyboard Hotkeys:
- `▲ / ▼ / ◄ / ►` or `W / A / S / D`: Move selection cursor / steer spacecraft in Cruise / adjust orbit velocity.
- `SPACE` or `ENTER`: Select part / toggle instrument / fire retro-engine / scan scientific targets.
- `F`: Toggle Fullscreen arcade mode.
- `H`: Open Mission Codex Handbook.
- `M`: Toggle audio mute.
- `ESC`: Back / Return to Hangar.

### Mobile & Tablet Touch Interface:
On touchscreen devices, a virtual gamepad overlays beneath the CRT screen:
- **Directional D-Pad:** 4-way direction buttons (Up, Down, Left, Right).
- **Action Buttons:** Button `A` (Space / Action) and Button `B` (Enter / Select).

---

## 10. File & Directory Manifest

```
mission-design-game/
├── index.html                   # HTML5 host container, viewport meta, CRT shader overlay, touch DOM
├── README.md                    # Project overview, player guide, NASA citations, live link
├── RULES.md                     # Standing development rules and constraints
├── description.md               # Complete game specifications and technical architecture document
├── css/
│   └── style.css                # Pixelated canvas scaling, arcade bezel, CRT scanlines, responsive UI
├── data/
│   ├── sources.md               # NASA references, textbook citations, and physical constants
│   ├── nasa_reference.json      # Structured scientific dataset (irradiance, AU distances, RTG power)
│   └── raw/                     # Raw public space apps datasets
└── js/
    ├── main.js                  # Main entry point, 60fps loop, scene manager, URL hash decoder
    ├── core/
    │   ├── audio.js             # Web Audio API procedural sound effects and chiptune synth
    │   ├── gfx.js               # Canvas renderer, 16-color palette, 5x7 font, screen shake, particles
    │   ├── input.js             # Keyboard and virtual touch input tracker
    │   └── sprites.js           # String-mapped procedural pixel art sprites and composite ship builder
    ├── model/
    │   ├── data.js              # Complete catalog of missions, orbits, buses, subsystems, roles
    │   ├── engine.js            # Pure physical calculation engine (mass, power, dv, comms, schedule)
    │   ├── validate.js          # Flight readiness rules and 4-role Go/No-Go validator
    │   ├── score.js             # 100-point scoring algorithm and Flight Recorder debrief tips
    │   ├── events.js            # Dynamic random space weather and flight anomaly events
    │   └── codex.js             # In-game educational handbook entries
    └── scenes/
        ├── boot.js              # System diagnostic boot sequence
        ├── title.js             # Arcade title screen with parallax stars
        ├── select.js            # Stage, difficulty, and crew role selection
        ├── hangar.js            # Interactive modular spacecraft workshop with live HUD bars
        ├── gonogo.js            # NASA-style verbal consensus poll for 4 flight consoles
        ├── launch.js            # Launch pad countdown, staging, and reliability check
        ├── cruise.js            # Side-scrolling hazard avoidance runner with light delay ticker
        ├── insertion.js         # Orbital capture retro-burn timing minigame
        ├── ops.js               # Planetary orbit survey, day/night eclipse, buffer downlink
        ├── report.js            # Mission report card, letter grades, debrief tips, share code
        └── codex.js             # In-game astrodynamics reference handbook viewer
```

---

## 11. NASA Space Apps Challenge Alignment

Lunora: Space Mission Game fulfills all criteria set forth by the **NASA Space Apps Challenge 2026**:
1. **Interactive Educational Experience:** Teaches fundamental principles of space mission design (Tsiolkovsky equation, solar inverse-square law, link budget, and power envelopes) through hands-on gameplay.
2. **Team Collaboration:** Simulates realistic flight director consensus through 1–4 player hot-seat roles.
3. **Transparent Science Data:** Built upon verifiable figures from NASA planetary missions (Landsat-9, LRO, MAVEN, Juno, and DSN).
4. **Accessible to All:** Zero-barrier web architecture requiring no downloads, accounts, or installation. Accessible on desktop, tablet, and mobile.
