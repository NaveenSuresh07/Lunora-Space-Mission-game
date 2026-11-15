# Space Mission Design Game 🛰️

> An educational, aerospace systems-engineering web game where players balance physical trade-offs to design, launch, and operate interplanetary robotic spacecraft. Built for the **NASA Space Apps Challenge 2026**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-blue?style=for-the-badge&logo=github)](https://username.github.io/mission-design-game/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🎮 How to Play

1. **Pick a Mission:** Choose between Low Earth Orbit (*Earth Observer*), Lunar Polar Orbit (*Lunar Mapper*), or deep interplanetary space (*Mars Climate Orbiter*).
2. **Engineer Your Spacecraft:** Select your bus platform, power supply, telecommunications antenna, propulsion engine, and science instruments across responsive design tabs.
3. **Balance the Physics Meters:** Keep your spacecraft under budget ($M), ensure solar power satisfies subsystem wattage, and tune propellant mass to hit required $\Delta v$ (km/s) using the live slider.
4. **Choose a Launcher:** Pair your craft with a rocket capable of lifting its total wet mass into orbit.
5. **Simulate & Analyze:** Pass the Flight Readiness Review (FRR), launch your probe through stage separation, deep-space cruise weather (micrometeoroids & solar flares), orbital insertion, and scientific operations to receive your final score, grade (S/A/B/C/F), and post-flight engineering tips.

---

## 🔬 How the Physics Model Works

The game models foundational aerospace trade-offs in an approachable, interactive simulation:

* **Tsiolkovsky Rocket Equation:**
  $$\Delta v = I_{\text{sp}} \cdot g_0 \cdot \ln\left(\frac{m_{\text{wet}}}{m_{\text{dry}}}\right)$$
  Higher specific impulse ($I_{\text{sp}}$) engines (like Hall-effect ion drives) yield far more velocity per kilogram of fuel, but draw continuous high electrical power and entail long spiral transfers.
* **Inverse-Square Law for Solar Power:**
  $$P_{\text{solar}} = \text{Area} \cdot \left(\frac{1361\text{ W/m}^2}{r_{\text{AU}}^2}\right) \cdot \eta$$
  At Mars ($1.52\text{ AU}$), solar irradiance is reduced by $(1.52)^2 \approx 2.31\times$, requiring massive solar wings or nuclear RTGs (Radioisotope Thermoelectric Generators).
* **RF Link Budget & Downlink:**
  Telemetry bandwidth scales with transmitter power and antenna gain, attenuated by planetary link distance loss:
  $$\text{Downlink Rate} = \min\left(200, \frac{P_{\text{tx}} \cdot \text{Gain}}{\text{LinkLoss}} \times 10\right)\text{ GB/day}$$
* **Payload Fraction & Bus Structural Limits:**
  Instruments cannot exceed the bus platform's maximum structural payload capacity.

> **Disclaimer:** All numeric parameters and rates are educational, simplified game approximations inspired by real NASA and ESA flight missions.

---

## 🛠️ Tech Stack

* **Zero Frameworks / Zero Build Steps:** Pure Vanilla HTML5, CSS3, and ES6 JavaScript Modules.
* **Pure Game Architecture:** Decoupled game engine (`engine.js`, `validate.js`, `simulate.js`, `score.js`) contains pure functions with zero DOM dependencies.
* **Deterministic Simulation:** Mulberry32 pseudo-random number generator for reproducible seed-based flight outcomes.
* **Interactive Canvas:** HTML5 2D Canvas for real-time orbital Hohmann transfer trajectory animations and ambient starry deep space.
* **Accessibility:** Full keyboard navigability, high-contrast dark theme, and dual indicator design (never relies on color alone).

---

## 🚀 Running Locally

No npm install, compilation, or server setup required. Serve the root directory using any static web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node npx serve
npx serve .

# Open in browser:
# http://localhost:8000
```

---

## 🏆 NASA Space Apps Challenge Alignment

* **Planetary Science & Exploration:** Teaches the real-world trade-offs faced by mission planners on flagship missions like *Landsat-9*, *Lunar Reconnaissance Orbiter (LRO)*, and *Mars Reconnaissance Orbiter (MRO)*.
* **Systems Thinking:** Demonstrates how changing one variable (e.g. adding a heavy spectrometer) cascades into propellant mass, launch vehicle size, power deficits, and RF data bottlenecks.

---

## 📜 License & Disclosures

Built as part of the NASA Space Apps Challenge 2026. Assisted by Google Antigravity.
Open source under the [MIT License](LICENSE).
