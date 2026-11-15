# Space Mission Design Game: Pixel Arcade Edition 🚀🕹️

> An authentic retro 16-color pixel-art arcade game where players engineer real deep-space probes and fly the missions themselves. Built for the **NASA Space Apps Challenge 2026**.

[![PICO-8 Palette](https://img.shields.io/badge/Style-PICO--8_Palette-ff004d?style=for-the-badge)](https://www.lexaloffle.com/pico-8.php)
[![Canvas Resolution](https://img.shields.io/badge/Canvas-320x180_Pixelated-29adff?style=for-the-badge)](#)
[![Zero Dependencies](https://img.shields.io/badge/Tech-Vanilla_JS_+_Web_Audio-00e436?style=for-the-badge)](#)

---

## 🎮 The Arcade Loop

```
TITLE  →  SELECT STAGE  →  HANGAR (build ship)  →  LAUNCH  →  CRUISE  →  INSERTION BURN  →  ORBIT OPS  →  MISSION REPORT
 (arcade)   (LEO/Moon/Mars)   (pixel workshop)    (animated)  (dodge!)    (timing game)    (scan+downlink)   (score + hi-score)
```

1. **Title:** Retro arcade intro with parallax stars and chiptune sound.
2. **Select Stage:** Choose between Earth Observer (LEO), Lunar Mapper (Moon), or Mars Climate Orbiter (Mars).
3. **The Hangar:** Modular pixel workshop! As you change bus, solar wings, dishes, instruments, fuel, and rocket, your pixel spacecraft updates live on the assembly grid. The 5 top HUD meters (Budget, Mass, Power, Δv, Data) turn red when violated.
4. **Launch:** Animated launchpad liftoff with smoke particles, screen shake, and staging. Rocket reliability determines survival.
5. **Cruise (Side-Scroller):** Dodge asteroids, micrometeoroids (reduce solar wattage), and telegraphed solar flare particle beams!
6. **Insertion Burn (Timing Challenge):** Time your retro-fire when the needle aligns with the green orbital capture zone. Higher Δv margins widen the green zone!
7. **Orbit Ops:** Orbit the target planet, rotate with the terrain, and scan color-coded surface targets matched to your instruments. Buffer science packets and beam them across deep space to Earth via DSN link!
8. **Mission Report:** Arcade score count-up (0–100), letter grades (S, A, B, C, F), telemetry category bars, debrief tips, and 3-letter initial high score entry.

---

## ⚙️ Design → Gameplay Mechanics

Your engineering choices visibly dictate how the spacecraft handles in flight:

| Design Metric | Formula / Gameplay Mapping | In-Game Consequence |
|---|---|---|
| **Hull Integrity (HP)** | Small: 3 Hearts, Medium: 4 Hearts, Large: 6 Hearts | How many asteroid or flare collisions you can absorb in Cruise. |
| **Maneuver Speed** | $70\text{ px/s} \times \text{clamp}(1 - m_{\text{dry}}/6000) \times (\text{Ion ? } 0.7 : 1.0)$ | Heavier dry mass and low-thrust ion drives make the probe slower to dodge hazards. |
| **Attitude Fuel %** | $100 \times \Delta v / \Delta v_{\text{needed}}$ | Every evasive dodge in Cruise expends a small burst of propellant. |
| **Power Margin %** | $100 \times P_{\text{generated}} / P_{\text{used}}$ | Under 100% power triggers periodic brownouts in Orbit Ops. |
| **Capture Zone Width** | $\text{clamp}(10 + 40 \times (\text{Margin} - 1) \times 5, 8, 50)\%$ | Larger $\Delta v$ propellant margins make orbital capture significantly easier. |
| **Instrument Colors** | Camera (Yellow), Spectrometer (Lime), Radar (Cyan), Magnetometer (Pink) | Surface scan targets appear only for scientific instruments you installed. |
| **Downlink Speed** | $\max(0.3, \text{DownlinkGbPerDay} / 10)\text{ pkts/sec}$ | High-Gain dishes drain the packet buffer swiftly to prevent lost science. |

---

## 🕹️ Controls

| Action | Keyboard | Touch Controls |
|---|---|---|
| **Navigate / Move** | Arrow Keys or W / A / S / D | On-screen D-Pad (▲, ▼, ◄, ►) |
| **Select / Scan / Fire** | SPACE or ENTER | Action Button A |
| **Back / Launch Check** | ENTER / ESC | Action Button B |
| **Audio Mute** | Key M | — |

---

## 🛠️ Zero-Asset Tech Stack

* **Internal Canvas Resolution:** Strict **320×180** native resolution, scaled up crisp with CSS `image-rendering: pixelated;`.
* **16-Color Palette:** PICO-8 inspired retro palette.
* **No Image Files:** All sprites (rockets, composite ships, planets, asteroids, flares, flames) are procedurally drawn or mapped from ASCII hex strings in code.
* **No Audio Files:** Pure synthesized Web Audio API square, triangle, and lowpass-filtered noise oscillators.
* **Built-in Font:** Pure 5×7 bitmapped character font rendered directly to canvas without external font downloads.

---

## 🚀 Running Locally

Serve the workspace statically with any server:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 🏆 NASA Space Apps Challenge 2026

Built as a solo rapid build for the NASA Space Apps Challenge 2026 using Google Antigravity.
All numbers are simplified educational game values inspired by real astrodynamics.
Licensed under the [MIT License](LICENSE).
