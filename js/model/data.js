/**
 * Space Mission Design Game: Pixel Arcade v3
 * NASA-Derived Reference Model Data & Challenge Specifications
 */

export const MISSIONS = [
  {
    id: 'leo',
    name: 'Earth Observer',
    stage: 1,
    target: 'LEO',
    inspiredBy: 'Landsat-9 / Terra',
    sunDistanceAU: 1.0,
    linkLoss: 1,
    oneWayLightSec: 0.002,
    deltaVNeeded: 0.0,
    budget: 120,
    deadlineMonths: 18,
    durationDays: 365,
    minScience: 20,
    minDataGb: 1500,
    stars: '★☆☆',
    desc: '700km sun-synchronous orbit. Zero transfer Δv. Tight budget.'
  },
  {
    id: 'moon',
    name: 'Lunar Mapper',
    stage: 2,
    target: 'Moon',
    inspiredBy: 'Lunar Reconnaissance Orbiter (LRO)',
    sunDistanceAU: 1.0,
    linkLoss: 40,
    oneWayLightSec: 1.3,
    deltaVNeeded: 4.0,
    budget: 250,
    deadlineMonths: 24,
    durationDays: 180,
    minScience: 40,
    minDataGb: 600,
    stars: '★★☆',
    desc: 'Polar lunar mapping. 4.0 km/s TLI & capture burn. 1.3s light lag.'
  },
  {
    id: 'mars',
    name: 'Mars Climate Orbiter',
    stage: 3,
    target: 'Mars',
    inspiredBy: 'Mars Reconnaissance Orbiter / MAVEN',
    sunDistanceAU: 1.52,
    linkLoss: 1200,
    oneWayLightSec: 720,
    deltaVNeeded: 5.5,
    budget: 400,
    deadlineMonths: 30,
    durationDays: 687,
    minScience: 60,
    minDataGb: 3000,
    stars: '★★★',
    desc: 'Deep space. 1.52 AU solar drop-off (43%). 12 min light delay.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter Moons Explorer',
    stage: 4,
    target: 'Jupiter',
    inspiredBy: 'Juno / Europa Clipper',
    sunDistanceAU: 5.2,
    linkLoss: 4000,
    oneWayLightSec: 2400,
    deltaVNeeded: 7.0,
    budget: 700,
    deadlineMonths: 40,
    durationDays: 400,
    minScience: 40,
    minDataGb: 1500,
    stars: '★★★★',
    desc: 'Boss stage! 5.2 AU weak solar (14 W/m²). Extreme radiation belts.'
  }
];

export const ORBITS = [
  {
    id: 'low',
    name: 'Low Orbit',
    sciMult: 1.15,
    downlinkMult: 0.8,
    capacityMult: 1.0,
    deltaVMod: 0.3,
    radChance: 0.10,
    desc: 'Sharper imaging (+15% sci), but shorter ground station contact passes.'
  },
  {
    id: 'mid',
    name: 'Mid / Sun-Sync',
    sciMult: 1.0,
    downlinkMult: 1.0,
    capacityMult: 0.95,
    deltaVMod: 0.0,
    radChance: 0.15,
    desc: 'Standard baseline orbit. Balanced lighting and contact windows.'
  },
  {
    id: 'high',
    name: 'High Orbit',
    sciMult: 0.85,
    downlinkMult: 1.3,
    capacityMult: 0.8,
    deltaVMod: -0.2,
    radChance: 0.30,
    desc: 'Longer line-of-sight passes (+30% DL), but blurrier sensors (-15% sci) and radiation.'
  }
];

export const BUSES = [
  { id: 'small', name: 'Small Bus', massKg: 150, cost: 20, powerDrawW: 40, reliability: 0.95, maxPayloadKg: 60, devMonths: 6, hearts: 3, desc: '3 HP. Light & reliable, but tiny payload.' },
  { id: 'medium', name: 'Medium Bus', massKg: 500, cost: 60, powerDrawW: 120, reliability: 0.93, maxPayloadKg: 250, devMonths: 9, hearts: 4, desc: '4 HP. Standard deep-space platform.' },
  { id: 'large', name: 'Large Bus', massKg: 1200, cost: 140, powerDrawW: 250, reliability: 0.90, maxPayloadKg: 600, devMonths: 14, hearts: 6, desc: '6 HP. Heavy flagship. Immune to solar flare kills!' }
];

export const POWER = [
  { id: 'solar_s', name: 'Solar Array S (1m²)', type: 'solar', areaM2: 1, massKg: 25, cost: 8, fixedW: 0, devMonths: 2, desc: '1 m² compact array. Light, inner planets only.' },
  { id: 'solar_m', name: 'Solar Array M (3m²)', type: 'solar', areaM2: 3, massKg: 70, cost: 20, fixedW: 0, devMonths: 3, desc: '3 m² tracking array. Excellent at 1 AU.' },
  { id: 'solar_l', name: 'Solar Array L (8m²)', type: 'solar', areaM2: 8, massKg: 160, cost: 45, fixedW: 0, devMonths: 4, desc: '8 m² deployable wings. Needed at Mars (1.52 AU).' },
  { id: 'rtg1', name: 'RTG MMRTG (110W)', type: 'rtg', areaM2: 0, massKg: 45, cost: 90, fixedW: 110, devMonths: 12, desc: 'Plutonium-238 MMRTG. Constant 110W anywhere.' },
  { id: 'rtg2', name: 'Dual RTG (220W)', type: 'rtg', areaM2: 0, massKg: 90, cost: 170, fixedW: 220, devMonths: 14, desc: 'Twin nuclear RTGs. Essential for Jupiter (5.2 AU).' }
];

export const BATTERIES = [
  { id: 'bat_basic', name: 'Basic Li-Ion Battery', massKg: 15, cost: 4, eclipseCoverage: 0.60, devMonths: 1, desc: 'Covers 60% of eclipse shadow electrical demand.' },
  { id: 'bat_adv', name: 'Advanced Space Battery', massKg: 40, cost: 12, eclipseCoverage: 1.00, devMonths: 3, desc: 'Covers 100% of eclipse load. Zero sensor brownouts in shadow.' }
];

export const COMMS = [
  { id: 'low', name: 'Low Gain Patch', gain: 1, txPowerW: 10, massKg: 5, cost: 4, powerDrawW: 15, devMonths: 2, desc: 'Omnidirectional patch. Cheap, but chokes at Mars.' },
  { id: 'medium', name: 'Medium Gain Dish', gain: 30, txPowerW: 10, massKg: 25, cost: 15, powerDrawW: 40, devMonths: 4, desc: '0.8m parabolic dish. Solid for Moon, marginal at Mars.' },
  { id: 'high', name: 'High Gain Dish (2.5m)', gain: 60, txPowerW: 40, massKg: 60, cost: 35, powerDrawW: 80, devMonths: 6, desc: 'Motorized dish. Essential for gigabytes from deep space.' }
];

export const ADCS = [
  { id: 'adcs_basic', name: 'Basic Reaction Wheels', massKg: 10, cost: 6, pointingMult: 1.0, devMonths: 2, desc: 'Standard 3-axis stabilization. Standard scan hit window.' },
  { id: 'adcs_precise', name: 'Star Trackers & Precise ADCS', massKg: 25, cost: 18, pointingMult: 1.5, devMonths: 5, desc: 'Arcsecond accuracy (+50% scan hit window & autonomous recovery).' }
];

export const PROPULSION = [
  { id: 'chemical', name: 'Bipropellant Chemical', ispSec: 320, dryMassKg: 60, cost: 15, extraPowerW: 0, devMonths: 4, special: 'none', desc: 'Proven 320s Isp liquid thruster. Fast transfers.' },
  { id: 'ion', name: 'Next-Gen Ion Thruster', ispSec: 3000, dryMassKg: 90, cost: 40, extraPowerW: 150, devMonths: 8, special: 'loses 120 operating days', desc: '3000s extreme efficiency. Slow spiral, +150W load.' }
];

export const INSTRUMENTS = [
  { id: 'camera', name: 'Optical Framing Camera', massKg: 20, cost: 12, powerDrawW: 25, science: 20, dataGbPerDay: 6, devMonths: 4, colorIdx: 10, colorHex: '#FFEC27', desc: 'Visual terrain mapping. 20 sci pts, 6 GB/day.' },
  { id: 'spectrometer', name: 'Infrared Spectrometer', massKg: 30, cost: 25, powerDrawW: 40, science: 30, dataGbPerDay: 2, devMonths: 6, colorIdx: 11, colorHex: '#00E436', desc: 'Mineral & gas composition. 30 sci pts, 2 GB/d.' },
  { id: 'radar', name: 'Subsurface Radar Sounder', massKg: 60, cost: 45, powerDrawW: 90, science: 40, dataGbPerDay: 4, devMonths: 9, colorIdx: 12, colorHex: '#29ADFF', desc: 'Subterranean ice sounding. 40 sci pts, 4 GB/d.' },
  { id: 'magnetometer', name: 'Fluxgate Magnetometer', massKg: 5, cost: 6, powerDrawW: 8, science: 10, dataGbPerDay: 0.1, devMonths: 2, colorIdx: 14, colorHex: '#FF77A8', desc: 'Magnetic field boom. 10 sci pts, 0.1 GB/d.' }
];

export const LAUNCHERS = [
  { id: 'small', name: 'Light Scout Booster', payloadToLeoKg: 1500, cost: 15, reliability: 0.90, leadMonths: 2, desc: 'Low cost, 1500kg max, 90% flight reliability.' },
  { id: 'medium', name: 'Medium Workhorse', payloadToLeoKg: 5000, cost: 70, reliability: 0.95, leadMonths: 4, desc: 'Proven booster, 5000kg max, 95% flight reliability.' },
  { id: 'heavy', name: 'Heavy Super-Lift', payloadToLeoKg: 12000, cost: 150, reliability: 0.97, leadMonths: 6, desc: 'Flagship booster, 12000kg max, 97% reliability.' }
];

export const DIFFICULTIES = [
  { id: 'rookie', name: 'ROOKIE', budgetMult: 1.3, eventChance: 0.5, autoSystems: true, desc: 'Budget x1.3, fewer events, auto Battery/ADCS.' },
  { id: 'engineer', name: 'ENGINEER', budgetMult: 1.0, eventChance: 1.0, autoSystems: false, desc: 'Standard NASA flight values and full subsystem control.' },
  { id: 'director', name: 'FLIGHT DIRECTOR', budgetMult: 0.8, eventChance: 1.5, autoSystems: false, desc: 'Budget x0.8, severe space weather, tightest margins.' }
];

export const ROLES = [
  { id: 'planner', name: 'PLANNER', icon: '📋', categories: ['ORBIT', 'LAUNCHER'], desc: 'Owns mission, orbit, launch vehicle, budget & deadline.' },
  { id: 'engineer', name: 'ENGINEER', icon: '⚙️', categories: ['BUS', 'POWER', 'BATTERY', 'ENGINE', 'FUEL'], desc: 'Owns bus structural mass, power balance, propulsion & Δv.' },
  { id: 'scientist', name: 'SCIENTIST', icon: '🔬', categories: ['INSTRUMENTS'], desc: 'Owns scientific instrument suite & science return goals.' },
  { id: 'comms', name: 'COMMS', icon: '📡', categories: ['COMMS', 'ADCS'], desc: 'Owns antenna telemetry link, ADCS pointing & downlink rate.' }
];
