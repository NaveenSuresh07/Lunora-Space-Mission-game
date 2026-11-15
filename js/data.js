/**
 * Lunora: Mission Architect
 * Game Data: Missions, Vehicles, Components, and NASA Reference Facts
 */

export const MISSIONS = [
  {
    id: 1,
    key: 'first-light',
    name: 'First Light',
    subtitle: 'Earth Observation Satellite',
    target: 'leo',
    targetName: 'Low Earth Orbit (700 km)',
    budget: 60,
    days: 30,
    sunPower: 1.0,
    tutorial: true,
    desc: 'Deploy Lunora-1 into Low Earth Orbit to capture high-resolution multispectral imagery of Earth’s climate zones.',
    objective: 'Launch a functional satellite into LEO and downlink Earth observation data.',
    bonusGoal: 'Return at least 2 distinct science types',
    nasaFact: 'NASA’s Landsat program has continuously observed Earth’s land surfaces since 1972, providing crucial data for agriculture, water management, and climate science.',
    recommended: {
      vehicle: 'sparrow',
      bus: 'small',
      power: 'solar_s',
      instruments: ['cam', 'mag'],
      comms: 'med'
    }
  },
  {
    id: 2,
    key: 'lunora-orbiter',
    name: 'Lunora Orbiter',
    subtitle: 'Lunar Polar Reconnaissance',
    target: 'moon',
    targetName: 'Lunar Polar Orbit',
    budget: 120,
    days: 90,
    sunPower: 1.0,
    desc: 'Enter a low polar orbit around the Moon to map surface minerals, topography, and permanently shadowed polar craters.',
    objective: 'Reach Lunar orbit with sufficient communications and power to map topography and surface minerals.',
    bonusGoal: 'Complete mission under budget by >$15M',
    nasaFact: 'NASA’s Lunar Reconnaissance Orbiter (LRO) has been orbiting the Moon since 2009, creating the most detailed 3D topographic map of any celestial body to date.',
    recommended: {
      vehicle: 'falcon',
      bus: 'medium',
      power: 'solar_s',
      instruments: ['cam', 'spec'],
      comms: 'med'
    }
  },
  {
    id: 3,
    key: 'red-dust-rover',
    name: 'Red Dust Rover',
    subtitle: 'Mars Surface Astrobiology',
    target: 'mars',
    targetName: 'Mars Jezero Plains',
    budget: 260,
    days: 180,
    sunPower: 0.43, // 1 / (1.52)^2
    landing: true,
    desc: 'Perform interplanetary transit to Mars, survive atmospheric entry, and deploy a surface rover to search for ancient biosignatures.',
    objective: 'Deploy a surface lander/rover on Mars with autonomous communications and dust-resistant power.',
    bonusGoal: 'Equip both Sample Arm and Subsurface Radar',
    nasaFact: 'Because sunlight at Mars is only 43% of Earth’s intensity, and dust storms can block over 99% of sunlight, NASA rovers like Curiosity and Perseverance use nuclear RTGs for steady power.',
    recommended: {
      vehicle: 'atlas',
      bus: 'heavy',
      power: 'rtg_dual',
      instruments: ['cam', 'radar', 'arm'],
      comms: 'med'
    }
  },
  {
    id: 4,
    key: 'comet-chaser',
    name: 'Comet Chaser',
    subtitle: 'Outer Solar System Sample Return',
    target: 'deep',
    targetName: 'Jupiter Trojan Asteroid (5.2 AU)',
    budget: 320,
    days: 400,
    sunPower: 0.037, // 1 / (5.2)^2 ≈ 3.7%
    landing: false,
    desc: 'Venture beyond the Asteroid Belt to rendezvous with a pristine primordial Trojan asteroid and analyze its volatile organic chemistry.',
    objective: 'Navigate deep space past 5 AU, maintain long-distance DSN telemetry, and return comprehensive asteroid science.',
    bonusGoal: 'Achieve >80 Science points using high-gain comms',
    nasaFact: 'Radio signals traveling between Earth and Jupiter take up to 50 minutes one-way. Spacecraft like NASA’s Lucy and Juno must execute maneuvers autonomously.',
    recommended: {
      vehicle: 'atlas',
      bus: 'medium',
      power: 'rtg_dual',
      instruments: ['cam', 'spec', 'radar', 'mag'],
      comms: 'high'
    }
  }
];

export const VEHICLES = [
  {
    id: 'sparrow',
    name: 'Sparrow-1',
    type: 'Light Booster',
    cost: 12,
    payload: 350,
    reliability: 0.90,
    reach: ['leo'],
    tag: 'Budget Scout',
    desc: 'Cost-effective two-stage small launcher. Strictly limited to Low Earth Orbit payloads.',
    tooltip: 'Low cost ($12M) with 350 kg capacity. Perfect for small Earth satellites, but cannot reach the Moon or deep space.'
  },
  {
    id: 'falcon',
    name: 'Kestrel-5',
    type: 'Medium Workhorse',
    cost: 40,
    payload: 1600,
    reliability: 0.95,
    reach: ['leo', 'moon'],
    tag: 'Proven Reliable',
    desc: 'Proven medium-lift orbital launcher. Delivers probes to LEO and trans-lunar injection trajectories.',
    tooltip: 'Workhorse booster with 1,600 kg capacity and 95% reliability. Reaches Earth orbit and Lunar trajectories.'
  },
  {
    id: 'atlas',
    name: 'Titan-X Heavy',
    type: 'Super Heavy Lift',
    cost: 95,
    payload: 5000,
    reliability: 0.97,
    reach: ['leo', 'moon', 'mars', 'deep'],
    tag: 'Interplanetary Flagship',
    desc: 'Heavy lift vehicle with high-energy cryogenic upper stage. Sends massive probes anywhere in the solar system.',
    tooltip: 'Flagship launcher with 5,000 kg capacity and 97% reliability. Required for Mars landers and deep-space missions.'
  }
];

export const BUSES = [
  {
    id: 'small',
    name: 'Micro-Bus',
    cost: 6,
    mass: 35,
    houseWatts: 15,
    maxPayload: 60,
    tag: 'Lightweight',
    hasLander: false,
    desc: 'Compact aluminum chassis. Ultra-low structural mass, but limits payload to 60 kg.',
    tooltip: 'Weighs only 35 kg and draws 15W. Great for tight budgets, but cannot carry heavy radar or sample arms.'
  },
  {
    id: 'medium',
    name: 'Standard Orbiter Bus',
    cost: 16,
    mass: 100,
    houseWatts: 35,
    maxPayload: 160,
    tag: 'Versatile',
    hasLander: false,
    desc: 'Balanced 3-axis stabilized bus with reaction wheels and multi-panel gantry mountings.',
    tooltip: '100 kg platform capable of supporting up to 160 kg of instruments. Standard for lunar and orbital probes.'
  },
  {
    id: 'heavy',
    name: 'Explorer Lander Bus',
    cost: 35,
    mass: 220,
    houseWatts: 60,
    maxPayload: 320,
    tag: 'Heavy Lander',
    hasLander: true,
    desc: 'Reinforced aeroshell, thermal heat shield, and landing thrusters. Required for planetary surface landings.',
    tooltip: 'Equipped with retro-thrusters and landing gear. Heavy (220 kg), but essential for landing on Mars.'
  }
];

export const POWER = [
  {
    id: 'battery',
    name: 'Li-Ion Battery Only',
    cost: 2,
    mass: 25,
    watts: 45,
    tag: 'Temporary',
    desc: 'Non-rechargeable high-density chemical battery. Inexpensive, but expires rapidly.',
    tooltip: 'Provides fixed 45W. Cannot recharge from the Sun. Suitable only for short LEO technology demonstrations.',
    note: 'Expires quickly. Suitable only for short-duration LEO sprints.'
  },
  {
    id: 'solar_s',
    name: 'Compact Solar Array (1.5 m²)',
    cost: 7,
    mass: 30,
    watts: 140,
    tag: 'Inner Solar System',
    desc: 'Deployable rigid photovoltaic wings. Generates strong power at Earth and Moon.',
    tooltip: 'Produces 140W at 1 AU. Output drops by inverse-square law at Mars (~60W) and Jupiter (~5W).'
  },
  {
    id: 'solar_l',
    name: 'Deployable Solar Wings (6 m²)',
    cost: 16,
    mass: 85,
    watts: 380,
    tag: 'High Output',
    desc: 'Dual tracking solar arrays with articulated sun-sensors. Sustains power at Mars distances.',
    tooltip: 'Produces 380W at Earth, and ~160W at Mars. Heavy (85 kg), but avoids costly nuclear systems.'
  },
  {
    id: 'rtg',
    name: 'MMRTG Nuclear Generator (150W)',
    cost: 38,
    mass: 55,
    watts: 150,
    tag: 'Deep Space RTG',
    desc: 'Radioisotope Thermoelectric Generator using Plutonium-238 decay heat. Continuous invariant wattage.',
    tooltip: 'Produces steady 150W anywhere—inside planetary shadows, dust storms, or 5+ AU deep space.',
    note: 'Constant output invariant to distance or day/night shadows.'
  },
  {
    id: 'rtg_dual',
    name: 'Dual MMRTG System (280W)',
    cost: 52,
    mass: 85,
    watts: 280,
    tag: 'High-Power Nuclear',
    desc: 'Twin Plutonium-238 nuclear generators. Sustains heavy radar sounders and surface drill arms simultaneously in deep space.',
    tooltip: 'Steady 280W output anywhere. Sustains heavy landers and outer-planet radar instruments.',
    note: 'Constant output invariant to distance or day/night shadows.'
  }
];

export const INSTRUMENTS = [
  {
    id: 'cam',
    name: 'Multispectral Camera',
    cost: 6,
    mass: 15,
    watts: 25,
    dataMbd: 800,
    science: 15,
    tag: 'Imaging',
    desc: 'High-resolution optical telescope for terrain topography, geology, and landing site mapping.',
    tooltip: 'Returns 15 Science. Generates 800 Mb/day of data. High scientific value with moderate power draw.'
  },
  {
    id: 'spec',
    name: 'Infrared Spectrometer',
    cost: 14,
    mass: 28,
    watts: 45,
    dataMbd: 350,
    science: 25,
    tag: 'Mineralogy',
    desc: 'Analyzes light absorption spectra to identify surface minerals, hydrated salts, and atmospheric gases.',
    tooltip: 'Returns 25 Science. Efficient data generation (350 Mb/day). Key for locating water ice and organic compounds.'
  },
  {
    id: 'radar',
    name: 'Subsurface Sounding Radar',
    cost: 20,
    mass: 50,
    watts: 85,
    dataMbd: 600,
    science: 35,
    tag: 'Deep Probing',
    desc: 'Transmits ground-penetrating radar pulses to map underground aquifers, ice sheets, and lava tubes.',
    tooltip: 'Returns 35 Science. Draws 85W of electrical power and weighs 50 kg. High reward for well-powered craft.'
  },
  {
    id: 'mag',
    name: 'Fluxgate Magnetometer Boom',
    cost: 5,
    mass: 8,
    watts: 10,
    dataMbd: 40,
    science: 12,
    tag: 'Fields & Particles',
    desc: 'Deployable 2-meter carbon fiber boom that measures crustal magnetic fields and solar wind interactions.',
    tooltip: 'Returns 12 Science for just 8 kg and 10W. Tiny data output (40 Mb/day). Great budget-friendly science adder.'
  },
  {
    id: 'arm',
    name: 'Robotic Sample Arm & Drill',
    cost: 28,
    mass: 75,
    watts: 50,
    dataMbd: 80,
    science: 45,
    tag: 'Surface Sample',
    needsLander: true,
    desc: 'Articulated robotic arm with core drill and onboard sample chemistry chamber. Requires a Lander Bus.',
    tooltip: 'Returns a massive 45 Science. Requires a Lander Bus to operate on a planetary surface.'
  }
];

export const COMMS = [
  {
    id: 'low',
    name: 'Low-Gain Patch Antenna',
    cost: 4,
    mass: 6,
    watts: 10,
    downMbd: 300,
    tag: 'Omnidirectional',
    desc: 'Broad-beam antenna with zero moving parts. Reliable in LEO, but throughput chokes at interplanetary distances.',
    tooltip: 'Downlinks up to 300 Mb/day. Inexpensive and lightweight. Perfect for Earth orbit, but weak past the Moon.'
  },
  {
    id: 'med',
    name: 'Medium Parabolic Dish (0.8m)',
    cost: 12,
    mass: 22,
    watts: 35,
    downMbd: 1500,
    tag: 'Steerable Dish',
    desc: 'Motorized parabolic reflector dish. Delivers crisp gigabit downlinks from the Moon and moderate rates from Mars.',
    tooltip: 'Downlinks up to 1,500 Mb/day. Standard for lunar orbiters and balanced Mars science packages.'
  },
  {
    id: 'high',
    name: 'High-Gain Deep Space Antenna (2.4m)',
    cost: 24,
    mass: 48,
    watts: 75,
    downMbd: 6000,
    tag: 'Deep Space DSN',
    desc: 'Large deployable high-frequency dish. Pairs with Earth’s 70-meter Deep Space Network dishes for massive telemetry.',
    tooltip: 'Downlinks up to 6,000 Mb/day. Draws 75W and weighs 48 kg. Essential for transmitting high-res camera and radar data from Jupiter.'
  }
];

export const ARIA_HINTS = {
  step1: [
    "Welcome to Mission Control! I am ARIA, your flight systems advisor.",
    "Review your mission target, available budget, and scientific objectives before selecting hardware.",
    "Remember: every gram of payload requires rocket fuel to reach orbit."
  ],
  step2: [
    "Your launch vehicle must have enough payload capacity to lift the entire spacecraft wet mass.",
    "Check the booster's target reach: a Sparrow cannot reach the Moon or Mars, no matter how light your probe is!",
    "Cheaper rockets save budget for instruments, but ensure you don't exceed payload limits."
  ],
  step3: [
    "Match your power system to your destination. Solar power drops off with the square of distance from the Sun.",
    "At Mars (1.52 AU), solar intensity drops to ~43%. At Jupiter (5.2 AU), it drops to under 4%!",
    "Nuclear RTGs provide constant power regardless of distance or night-time shadow passes."
  ],
  step4: [
    "Scientific instruments define your mission score. Select complementary sensors to unlock bonus objectives.",
    "Watch your power budget: running spectrometers and ground radars simultaneously demands serious wattage.",
    "The Robotic Sample Arm offers immense science return, but requires a Lander bus to touch down."
  ],
  step5: [
    "Instruments that collect gigabytes of data are useless if your antenna cannot beam it home to Earth.",
    "If your data generation exceeds your downlink rate, data is backlogged and lost, penalizing science points.",
    "Balance transmitter power draw against your spacecraft's electrical generation."
  ]
};
