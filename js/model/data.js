/**
 * Space Mission Design Game: Pixel Arcade Edition
 * Data definitions (reused from v1)
 */

export const MISSIONS = [
  {
    id: 'leo',
    name: 'Earth Observer',
    target: 'LEO',
    sunDistanceAU: 1.0,
    linkLoss: 1,
    deltaVNeeded: 0,
    budget: 120,
    durationDays: 365,
    minScience: 20,
    minDataGb: 1500,
    stars: '★☆☆',
    desc: '700km polar orbit. Zero transit Δv. Tight budget.'
  },
  {
    id: 'moon',
    name: 'Lunar Mapper',
    target: 'Moon',
    sunDistanceAU: 1.0,
    linkLoss: 40,
    deltaVNeeded: 4.0,
    budget: 250,
    durationDays: 180,
    minScience: 40,
    minDataGb: 600,
    stars: '★★☆',
    desc: 'Lunar polar orbit. 4 km/s burn. Moderate link loss.'
  },
  {
    id: 'mars',
    name: 'Mars Climate Orbiter',
    target: 'Mars',
    sunDistanceAU: 1.52,
    linkLoss: 1200,
    deltaVNeeded: 5.5,
    budget: 400,
    durationDays: 687,
    minScience: 60,
    minDataGb: 3000,
    stars: '★★★',
    desc: 'Deep space. 1.52 AU solar drop-off. 1200 link loss.'
  }
];

export const BUSES = [
  { id: 'small', name: 'Small Bus', massKg: 150, cost: 20, powerDrawW: 40, reliability: 0.95, maxPayloadKg: 60, hearts: 3, desc: '3 HP. Light & reliable, but tiny payload.' },
  { id: 'medium', name: 'Medium Bus', massKg: 500, cost: 60, powerDrawW: 120, reliability: 0.93, maxPayloadKg: 250, hearts: 4, desc: '4 HP. Standard deep-space platform.' },
  { id: 'large', name: 'Large Bus', massKg: 1200, cost: 140, powerDrawW: 250, reliability: 0.90, maxPayloadKg: 600, hearts: 6, desc: '6 HP. Heavy flagship. Immune to flare kills!' }
];

export const POWER = [
  { id: 'solar_s', name: 'Solar Array S', type: 'solar', areaM2: 1, massKg: 25, cost: 8, fixedW: 0, desc: '1 m² solar array. Light, low power.' },
  { id: 'solar_m', name: 'Solar Array M', type: 'solar', areaM2: 3, massKg: 70, cost: 20, fixedW: 0, desc: '3 m² tracking array. Good at 1 AU.' },
  { id: 'solar_l', name: 'Solar Array L', type: 'solar', areaM2: 8, massKg: 160, cost: 45, fixedW: 0, desc: '8 m² giant wings. Essential for Mars.' },
  { id: 'rtg', name: 'RTG Nuclear', type: 'rtg', areaM2: 0, massKg: 45, cost: 90, fixedW: 250, desc: 'Plutonium-238. Steady 250W anywhere.' }
];

export const COMMS = [
  { id: 'low', name: 'Low Gain Patch', gain: 1, txPowerW: 10, massKg: 5, cost: 4, powerDrawW: 15, desc: 'Omni patch. Cheap, but chokes at Mars.' },
  { id: 'medium', name: 'Medium Gain Dish', gain: 30, txPowerW: 10, massKg: 25, cost: 15, powerDrawW: 40, desc: '0.8m parabolic dish. Solid for Moon.' },
  { id: 'high', name: 'High Gain Dish', gain: 60, txPowerW: 40, massKg: 60, cost: 35, powerDrawW: 80, desc: '2.5m steerable dish. Essential for Mars data.' }
];

export const PROPULSION = [
  { id: 'chemical', name: 'Chemical Engine', ispSec: 320, dryMassKg: 60, cost: 15, extraPowerW: 0, special: 'none', desc: 'Standard 320s bipropellant thruster.' },
  { id: 'ion', name: 'Ion Thruster', ispSec: 3000, dryMassKg: 90, cost: 40, extraPowerW: 150, special: 'loses 120 operating days', desc: '3000s extreme efficiency. Slow cruise, +150W.' }
];

export const INSTRUMENTS = [
  { id: 'camera', name: 'Optical Camera', massKg: 20, cost: 12, powerDrawW: 25, science: 20, dataGbPerDay: 6, colorIdx: 10, colorHex: '#FFEC27', desc: 'Visual imaging. 20 sci pts, 6 GB/day.' },
  { id: 'spectrometer', name: 'Spectrometer', massKg: 30, cost: 25, powerDrawW: 40, science: 30, dataGbPerDay: 2, colorIdx: 11, colorHex: '#00E436', desc: 'Mineral & gas analysis. 30 sci pts, 2 GB/d.' },
  { id: 'radar', name: 'Subsurface Radar', massKg: 60, cost: 45, powerDrawW: 90, science: 40, dataGbPerDay: 4, colorIdx: 12, colorHex: '#29ADFF', desc: 'Ice & subterranean sounding. 40 sci pts.' },
  { id: 'magnetometer', name: 'Magnetometer', massKg: 5, cost: 6, powerDrawW: 8, science: 10, dataGbPerDay: 0.1, colorIdx: 14, colorHex: '#FF77A8', desc: 'Magnetic field boom. 10 sci pts, 0.1 GB/d.' }
];

export const LAUNCHERS = [
  { id: 'small', name: 'Light Scout', payloadToLeoKg: 1500, cost: 15, reliability: 0.90, desc: 'Low cost, 1500kg max, 90% flight reliability.' },
  { id: 'medium', name: 'Medium Workhorse', payloadToLeoKg: 5000, cost: 70, reliability: 0.95, desc: 'Proven booster, 5000kg max, 95% reliability.' },
  { id: 'heavy', name: 'Heavy Super-Lift', payloadToLeoKg: 12000, cost: 150, reliability: 0.97, desc: 'Flagship booster, 12000kg max, 97% reliability.' }
];
