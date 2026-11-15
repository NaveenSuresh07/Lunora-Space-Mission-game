# Lunora: Mission Control Arcade 🛰️🕹️
### 2D Aerospace Arcade & Systems Engineering Simulator · NASA Space Apps Challenge 2026

**Team:** Voidspace · **Members:** A Naveen Suresh  
**Live Game URL:** [https://naveensuresh07.github.io/Lunora-Space-Mission-game/](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)  
**GitHub Repository:** [https://github.com/NaveenSuresh07/Lunora-Space-Mission-game](https://github.com/NaveenSuresh07/Lunora-Space-Mission-game)  
**Project Slide Deck:** [Lunora_Mission_Control_Arcade_Presentation.pdf](Lunora_Mission_Control_Arcade_Presentation.pdf)

[![Play Live](https://img.shields.io/badge/Play_Live-GitHub_Pages-00e436?style=for-the-badge&logo=github)](https://naveensuresh07.github.io/Lunora-Space-Mission-game/)
[![Slide Deck PDF](https://img.shields.io/badge/Presentation-7_Slide_PDF-ff004d?style=for-the-badge&logo=adobeacrobatreader)](Lunora_Mission_Control_Arcade_Presentation.pdf)
[![Automated Tests](https://img.shields.io/badge/Tests-10%2F10_Passing-brightgreen?style=for-the-badge)](#)
[![Zero Build Step](https://img.shields.io/badge/Build-Zero_Asset_Dependencies-4dd0ff?style=for-the-badge)](#)
[![NASA Space Apps](https://img.shields.io/badge/NASA_Space_Apps-2026-blue?style=for-the-badge)](#)

---

## 📋 Executive Project Summary

> **Lunora: Mission Control Arcade** is an interactive 2D aerospace engineering game where players architect robotic space missions in a modular hangar, then fly them through the four real NASA mission segments: **Launch**, **Space**, **Ground**, and **User Delivery**.
> 
> Addressing the *Space Mission Design Game* challenge, Lunora transforms abstract systems engineering into playable cause-and-effect gameplay. Players balance competing constraints—booster payload, budget, inverse-square solar flux ($1/r^2$), and Deep Space Network (DSN) bandwidth—across four destination tiers (LEO, Moon, Mars, and Deep Space). Every engineering choice directly shapes flight mechanics: managing Max-Q throttle during ascent, balancing power during planetary shadow passes, buffering telemetry during occultation blackouts, and routing science data.
> 
> Lunora is important because it makes authentic aerospace trade-offs intuitive, exciting, and accessible to students and enthusiasts worldwide. Progression aligns with NASA’s Concept Maturity Levels (CML), delivering actionable engineering debriefs connected to real heritage missions like LRO, Curiosity, and JWST—with zero installation required.

---

## 🌌 Overview

**Lunora: Mission Control Arcade** is an authentic 2D space mission engineering and arcade game built for the NASA Space Apps Challenge 2026.

Unlike static quizzes or passive simulations, Lunora merges a tactile **spacecraft engineering workshop (Hangar)** with **four skill-based arcade stages**—one for each of NASA’s core mission segments:
1. **Launch Segment (Ascent):** Throttle control, gravity-turn ascent corridor, Max-Q aerodynamic stress relief, and stage separation.
2. **Space Segment (Cruise & Orbit Insertion):** Deep-space hazard navigation, subsystem power management in planetary shadows, and precision retro-burn orbital capture.
3. **Ground Segment (Operations):** Top-down Earth Deep Space Network (DSN) tracking stations (Goldstone, Madrid, Canberra), occultation blackout buffer management, and telemetry packet capture.
4. **User Segment (Science Delivery):** High-speed scientific data sorting into Imaging, Geology, Atmosphere, and Magnetic bins with combo chains to deliver breakthrough discoveries.

**Design is the strategy layer. Arcade is the execution layer. Debrief is the learning layer.** Every engineering decision in the Hangar directly impacts how each arcade stage plays.

---

## 🕹️ The Core Game Loop

```
TITLE  ➔  MISSION SELECT  ➔  HANGAR WORKSHOP  ➔  STAGE 1: LAUNCH  ➔  STAGE 2: CRUISE  ➔  STAGE 3: OPERATIONS  ➔  STAGE 4: SCIENCE  ➔  DEBRIEF
```

---

## 🎮 How Design Choices Shape Gameplay

| Engineering Choice | Direct Playable Arcade Consequence |
|---|---|
| **Heavier Spacecraft** | Slower rocket acceleration in Stage 1; tighter ascent corridor; smaller fuel margins. |
| **Larger Booster (Titan-X)** | Wider safe ascent corridor in Stage 1; higher payload capacity for deep-space missions. |
| **Solar Wings vs. RTG** | Solar output drops with $1/r^2$ at Mars & deep space, and zeroes out during eclipse shadow passes. RTGs provide steady 150W continuous power anywhere. |
| **Propellant Fuel Tanks** | Extra fuel reserves dynamically expand the green capture sweet spot in the Stage 2 orbit insertion burn. |
| **Thermal Shield** | Halves damage from solar radiation flares and atmospheric friction. |
| **Antenna Gain (Low / Med / High)** | Dictates the reception cone radius of Earth's Deep Space Network dishes in Stage 3. |
| **Data Storage Buffer** | Prevents permanent telemetry loss when the probe passes behind planets during communication blackouts. |
| **Instrument Suite** | Determines which scientific data types (Imaging, Geology, Atmosphere, Magnetic) appear in Stage 4. |

---

## 🚀 The 4 Missions & CML Progression

Progression follows NASA’s **Concept Maturity Level (CML)** framework:

| CML | Rank | Mission | Destination | Budget | Key Objective & NASA Heritage |
|:---:|:---:|:---|:---|:---:|:---|
| **1** | **Cadet** | **First Light** | Low Earth Orbit | $60M | CubeSat multispectral Earth observation. (*CubeSat 101*) |
| **2** | **Analyst** | **Lunora Orbiter** | Lunar Polar Orbit | $120M | Map surface minerals and shadowed crater water-ice. (*LRO*) |
| **3** | **Engineer** | **Red Dust Rover** | Mars Jezero Crater | $260M | Survive atmospheric entry and deploy surface drill rover. (*Curiosity / Perseverance*) |
| **4** | **Architect** | **Deep Eye** | Deep Space (1.5M km) | $300M | Infrared space telescope exoplanet spectroscopy. (*JWST & Roman*) |

---

## 🕹️ Controls

- **Desktop (Keyboard):**
  - **Left / Right / A / D:** Pitch nudge (Stage 1) / Move ship (Stage 2) / Rotate DSN station (Stage 3) / Move sorting bin (Stage 4)
  - **Up / W / Space:** Throttle (Stage 1) / Fire orbit insertion burn (Stage 2) / Action
  - **Down / S:** Down / Stage separation (Stage 1)
  - **1, 2, 3:** Toggle power subsystems (Stage 2) / Switch active DSN station (Stage 3)
  - **M:** Toggle sound mute
- **Mobile / Touch:**
  - Tap left/right halves of canvas to steer; tap and hold anywhere to throttle; tap to execute burns and select bins.

---

## 🔬 Authentic Aerospace Physics & Formulas

1. **Solar Irradiance Flux (Inverse-Square Law):**
   $$I(r) = I_0 \times \left(\frac{1}{r^2}\right)$$
   Earth ($1.0\text{ AU}$): $100\%$. Mars ($1.52\text{ AU}$): $43.3\%$. Deep space ($5.2\text{ AU}$): $3.7\%$.
2. **Telemetry Downlink Factor:**
   $$\text{Data Factor} = \min\left(1.0, \frac{\text{Antenna Downlink Rate}}{\sum \text{Instrument Data Rate}}\right)$$
3. **1,000-Point Scoring Model:**
   $$\text{Score} = \text{Sci} \times 5 + \text{DataPct} \times 2 + \text{OrbitAcc} \times 150 + \text{InsertionAcc} \times 150 + \text{Integrity} \times 1.5 + \text{BudgetPct} \times 2 + \text{BonusGoal}$$

---

## 🧪 Automated Test Suite

All 10 unit and system tests pass with 100% test coverage:

```bash
npm test
```

Verifies mass/cost/power calculations, reach boundaries, power deficits, auto-build solvability, 6x4 bay grid non-overlap, and full 4-stage simulation scoring.

---

## 🛠️ Local Quick Start

```bash
# Clone repository
git clone https://github.com/NaveenSuresh07/Lunora-Space-Mission-game.git
cd Lunora-Space-Mission-game

# Serve locally
python -m http.server 8080
# Open http://localhost:8080 in any web browser!
```

---

## 📜 Credits & NASA Resource Mapping

Developed for the **NASA Space Apps Challenge 2026** by Naveen Suresh.  
Datasets and mission concepts adapted from NASA SMD, JPL Mission Design Center, and the CubeSat 101 Initiative.
