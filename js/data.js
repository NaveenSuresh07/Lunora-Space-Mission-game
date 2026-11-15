/**
 * Space Mission Design Game - Game Data
 * NASA Space Apps Challenge 2026
 * All values are simplified game parameters inspired by aerospace physics.
 */

export const MISSIONS = [
  {
    id: 'leo',
    name: 'Earth Observer',
    destination: 'Low Earth Orbit (LEO)',
    sunDistanceAU: 1.0,
    linkLoss: 1,
    deltaVNeeded: 0, // Injected directly into target orbit by launcher
    budget: 120, // $M
    durationDays: 365,
    minScience: 20,
    minDataGb: 1500,
    icon: '🌍',
    realInspiration: 'Inspired by Landsat-9, Terra, and Copernicus Earth observation missions.',
    description: 'Monitor global climate, deforestation, and ocean currents from a 700km sun-synchronous orbit.'
  },
  {
    id: 'moon',
    name: 'Lunar Mapper',
    destination: 'Lunar Polar Orbit',
    sunDistanceAU: 1.0,
    linkLoss: 40,
    deltaVNeeded: 4.0, // km/s (trans-lunar injection + lunar capture)
    budget: 250, // $M
    durationDays: 180,
    minScience: 40,
    minDataGb: 600,
    icon: '🌕',
    realInspiration: 'Inspired by NASA Lunar Reconnaissance Orbiter (LRO) and Clementine.',
    description: 'Map permanently shadowed craters at the lunar south pole to prospect for water ice deposits.'
  },
  {
    id: 'mars',
    name: 'Mars Climate Orbiter',
    destination: 'Mars Science Orbit',
    sunDistanceAU: 1.52,
    linkLoss: 1200,
    deltaVNeeded: 5.5, // km/s (trans-Mars injection + Mars orbit insertion)
    budget: 400, // $M
    durationDays: 687, // 1 Martian year
    minScience: 60,
    minDataGb: 3000,
    icon: '🔴',
    realInspiration: 'Inspired by Mars Reconnaissance Orbiter (MRO) and Mars Global Surveyor.',
    description: 'Investigate the Martian atmosphere, seasonal dust storms, and search for subsurface hydrated minerals.'
  }
];

export const BUSES = [
  {
    id: 'small',
    name: 'Small Bus',
    category: 'Bus',
    massKg: 150,
    cost: 20,
    powerDrawW: 40,
    reliability: 0.95,
    maxPayloadKg: 60,
    icon: '🛰️',
    tooltip: 'Compact micro-satellite bus. High baseline reliability, but limited payload mass capacity.',
    realWorld: 'Commonly used in small-sat constellations and university research probes.'
  },
  {
    id: 'medium',
    name: 'Medium Bus',
    category: 'Bus',
    massKg: 500,
    cost: 60,
    powerDrawW: 120,
    reliability: 0.93,
    maxPayloadKg: 250,
    icon: '🛸',
    tooltip: 'Standard deep-space exploration platform. Excellent balance between cost, capacity, and power draw.',
    realWorld: 'Similar to the Mars Odyssey and Dawn spacecraft platforms.'
  },
  {
    id: 'large',
    name: 'Large Bus',
    category: 'Bus',
    massKg: 1200,
    cost: 140,
    powerDrawW: 250,
    reliability: 0.90,
    maxPayloadKg: 600,
    icon: '🚢',
    tooltip: 'Heavy flagship bus with radiation-shielded avionics. Immune to solar flares during cruise.',
    realWorld: 'Flagship class similar to Cassini-Huygens and Europa Clipper.'
  }
];

export const POWER = [
  {
    id: 'solar_s',
    name: 'Solar Array S (1 m²)',
    type: 'solar',
    areaM2: 1,
    massKg: 25,
    cost: 8,
    fixedW: 0,
    icon: '🔆',
    tooltip: 'Compact deployable solar panels. Solar wattage scales with 1/distance² from the Sun.',
    realWorld: 'Ultra-light GaAs solar cells suited for inner-planet and LEO operations.'
  },
  {
    id: 'solar_m',
    name: 'Solar Array M (3 m²)',
    type: 'solar',
    areaM2: 3,
    massKg: 70,
    cost: 20,
    fixedW: 0,
    icon: '☀️',
    tooltip: 'Mid-sized articulated solar wings providing reliable 1kW+ power in Earth/Lunar space.',
    realWorld: 'Standard dual-wing tracking solar arrays used on modern lunar orbiters.'
  },
  {
    id: 'solar_l',
    name: 'Solar Array L (8 m²)',
    type: 'solar',
    areaM2: 8,
    massKg: 160,
    cost: 45,
    fixedW: 0,
    icon: '⭐',
    tooltip: 'Large deployable solar wings designed to generate ample power even in weak Martian sunlight.',
    realWorld: 'Comparable to the massive solar arrays powering Juno and Mars Reconnaissance Orbiter.'
  },
  {
    id: 'rtg',
    name: 'RTG (Radioisotope Generator)',
    type: 'rtg',
    areaM2: 0,
    massKg: 45,
    cost: 90,
    fixedW: 250,
    icon: '☢️',
    tooltip: 'Decaying Plutonium-238 provides a constant 250W unaffected by distance from the Sun or eclipses.',
    realWorld: 'Nuclear RTGs powered Voyager 1 & 2, New Horizons, and Curiosity.'
  }
];

export const COMMS = [
  {
    id: 'low',
    name: 'Low-Gain Patch Antenna',
    gain: 1,
    txPowerW: 10,
    massKg: 5,
    cost: 4,
    powerDrawW: 15,
    icon: '📶',
    tooltip: 'Omnidirectional patch antenna. Lightweight and inexpensive, but deep space link loss severely throttles data rate.',
    realWorld: 'Essential for launch vehicle separation and emergency safemode comms.'
  },
  {
    id: 'medium',
    name: 'Medium-Gain Horn Dish',
    gain: 30,
    txPowerW: 10,
    massKg: 25,
    cost: 15,
    powerDrawW: 40,
    icon: '📡',
    tooltip: '0.8-meter parabolic dish. Good throughput at Earth/Moon; requires careful pointing and struggles at Mars.',
    realWorld: 'Typical X-band high-efficiency horn antenna used on lunar surveyors.'
  },
  {
    id: 'high',
    name: 'High-Gain Steerable Dish',
    gain: 60,
    txPowerW: 40,
    massKg: 60,
    cost: 35,
    powerDrawW: 80,
    icon: '🛰️',
    tooltip: '2.5-meter motorized Ka/X-band dish with 40W amplifier. Necessary to beam gigabytes back from deep space.',
    realWorld: 'Similar to the 3-meter high-gain antenna powering Mars Reconnaissance Orbiter telemetry.'
  }
];

export const PROPULSION = [
  {
    id: 'chemical',
    name: 'Bipropellant Chemical Engine',
    ispSec: 320,
    dryMassKg: 60,
    cost: 15,
    extraPowerW: 0,
    special: 'none',
    icon: '🔥',
    tooltip: 'Hydrazine / Nitrogen Tetroxide bipropellant. High thrust and rapid orbital injection with 320s Isp.',
    realWorld: 'Standard flight-proven liquid apogee engine used across interplanetary probes.'
  },
  {
    id: 'ion',
    name: 'Next-Gen Ion Electric Thruster',
    ispSec: 3000,
    dryMassKg: 90,
    cost: 40,
    extraPowerW: 150,
    special: 'loses 120 operating days',
    icon: '⚡',
    tooltip: 'Extremely fuel-efficient 3000s Isp xenon ion drive. Draws +150W and takes a slow 120-day transfer spiral.',
    realWorld: 'Hall-effect ion thrusters powered Dawn to Vesta & Ceres and SMART-1 to the Moon.'
  }
];

export const INSTRUMENTS = [
  {
    id: 'camera',
    name: 'High-Res Multispectral Camera',
    massKg: 20,
    cost: 12,
    powerDrawW: 25,
    science: 20,
    dataGbPerDay: 6,
    icon: '📷',
    tooltip: 'Visual and near-infrared optical imaging for surface topography and geological features.',
    realWorld: 'Comparable to the HiRISE camera on MRO and LROC on LRO.'
  },
  {
    id: 'spectrometer',
    name: 'Thermal IR & Gamma Spectrometer',
    massKg: 30,
    cost: 25,
    powerDrawW: 40,
    science: 30,
    dataGbPerDay: 2,
    icon: '🔬',
    tooltip: 'Analyzes mineral composition, volatile abundance, and atmospheric chemistry signatures.',
    realWorld: 'Similar to CRISM on MRO and the Diviner Lunar Radiometer on LRO.'
  },
  {
    id: 'radar',
    name: 'Synthetic Aperture Subsurface Radar',
    massKg: 60,
    cost: 45,
    powerDrawW: 90,
    science: 40,
    dataGbPerDay: 4,
    icon: '📡',
    tooltip: 'Ground-penetrating radar sweeps to detect subsurface ice sheets and geological strata.',
    realWorld: 'Similar to the SHARAD radar on MRO and Mini-RF on LRO.'
  },
  {
    id: 'magnetometer',
    name: 'Boom-Mounted Fluxgate Magnetometer',
    massKg: 5,
    cost: 6,
    powerDrawW: 8,
    science: 10,
    dataGbPerDay: 0.1,
    icon: '🧭',
    tooltip: 'Ultra-low-power instrument boom measuring planetary magnetic fields and solar wind interaction.',
    realWorld: 'Lightweight booms flown on planetary orbiters including MAVEN and Lunar Prospector.'
  }
];

export const LAUNCHERS = [
  {
    id: 'small',
    name: 'Light Scout Rocket',
    payloadToLeoKg: 1500,
    cost: 15,
    reliability: 0.90,
    icon: '🚀',
    tooltip: 'Low-cost commercial light booster. Affordable for tight budgets, but 90% flight reliability carries risk.',
    realWorld: 'Inspired by Pegasus, Electron, and small commercial launch systems.'
  },
  {
    id: 'medium',
    name: 'Medium Lift Workhorse',
    payloadToLeoKg: 5000,
    cost: 70,
    reliability: 0.95,
    icon: '🛸',
    tooltip: 'Proven medium-lift orbital launcher. Reliable 95% success rate with 5,000 kg capacity.',
    realWorld: 'Inspired by Falcon 9 and Atlas V 401 class launch vehicles.'
  },
  {
    id: 'heavy',
    name: 'Heavy Super-Booster',
    payloadToLeoKg: 12000,
    cost: 150,
    reliability: 0.97,
    icon: '🛰️',
    tooltip: 'Heavy-lift rocket with 12,000 kg capacity and 97% reliability. High cost, but lifts heavy deep-space probes.',
    realWorld: 'Inspired by Falcon Heavy, Delta IV Heavy, and Ariane 5.'
  }
];

export const EVENTS = {
  cruise: [
    {
      id: 'micrometeoroid',
      name: 'Micrometeoroid Impact',
      chance: 0.35,
      impact: 'Power degraded by 15%',
      text: 'A high-velocity micrometeoroid scored a glancing hit on the solar array, degrading power output by 15%.'
    },
    {
      id: 'solar_flare',
      name: 'Coronal Mass Ejection (Solar Flare)',
      chance: 0.35,
      impact: 'Bus radiation test (Large bus is immune)',
      text: 'An intense coronal mass ejection bathed the spacecraft in severe ionising radiation.'
    }
  ],
  operations: [
    {
      id: 'antenna_fault',
      name: 'Feed Horn Degradation',
      chance: 0.30,
      impact: 'Telemetry data throughput down 25% (Low comms only)',
      text: 'Thermal cycling caused antenna feed impedance mismatch, cutting daily downlink by 25%.'
    },
    {
      id: 'extended_mission',
      name: 'Bonus Science Discovery',
      chance: 0.30,
      impact: 'Science returns increased by 15%',
      text: 'Ground controllers detected an unexpected transient phenomenon, boosting scientific yield by 15%!'
    }
  ]
};
