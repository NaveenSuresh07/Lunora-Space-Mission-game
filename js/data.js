/**
 * Lunora: Mission Control Arcade (v2) - Game Data & Astrodynamics Models
 * All numeric values represent educational aerospace parameters.
 */

export const MISSIONS = [
  {
    id: 1,
    key: 'first-light',
    name: 'First Light',
    subtitle: 'Low Earth Orbit Earth Observation',
    target: 'leo',
    budget: 60,
    sun: 1.0,
    days: 30,
    rank: 'Cadet',
    cml: 1,
    objective: 'Photograph Earth from orbit and stream multispectral imagery',
    real: 'CubeSat 101 / Planet Labs & NASA SmallSats',
    discovery: 'High-resolution multispectral imagery maps river basins, crop yields, and coastal delta dynamics.',
    bonusGoal: 'Complete mission with >$15M budget reserve',
    nasaFact: 'NASA’s CubeSat 101 standard paved the way for compact, low-cost satellites using standardized 10×10×10 cm form factors.'
  },
  {
    id: 2,
    key: 'lunora-orbiter',
    name: 'Lunora Orbiter',
    subtitle: 'Lunar Polar Reconnaissance',
    target: 'moon',
    budget: 120,
    sun: 1.0,
    days: 90,
    rank: 'Analyst',
    cml: 2,
    objective: 'Map the Moon and identify permanently shadowed crater water-ice candidates',
    real: 'Lunar Reconnaissance Orbiter (LRO)',
    discovery: 'Hydrogen emission spikes confirm volatile water-ice deposits inside Shackleton Crater rim.',
    bonusGoal: 'Equip both Spectrometer and Radar',
    nasaFact: 'LRO has collected more data than all other planetary missions combined, creating unprecedented 3D elevation maps of the Moon.'
  },
  {
    id: 3,
    key: 'red-dust-rover',
    name: 'Red Dust Rover',
    subtitle: 'Mars Surface Astrobiology',
    target: 'mars',
    budget: 260,
    sun: 0.43, // 1 / (1.52)^2
    days: 180,
    rank: 'Engineer',
    cml: 3,
    landing: true,
    objective: 'Survive Mars entry and deploy a surface rover to sample sedimentary rock',
    real: 'Mars Curiosity & Perseverance Rovers',
    discovery: 'Analysis of lacustrine mudstone confirms organic carbon compounds and ancient habitable aquatic chemistry.',
    bonusGoal: 'Survive interplanetary cruise with >80% Mission Integrity',
    nasaFact: 'Mars receives less than half the sunlight of Earth. NASA’s Curiosity and Perseverance rovers rely on nuclear MMRTGs for steady electricity.'
  },
  {
    id: 4,
    key: 'deep-eye',
    name: 'Deep Eye',
    subtitle: 'Deep Space Infrared Observatory',
    target: 'deep',
    budget: 300,
    sun: 0.15, // Outer solar system / L2 point derating
    days: 400,
    rank: 'Architect',
    cml: 4,
    landing: false,
    objective: 'Deploy a deep-space telescope to characterize exoplanet atmospheres',
    real: 'James Webb Space Telescope (JWST) & Roman',
    discovery: 'Transmission spectroscopy detects methane and water vapor signatures in the atmosphere of an alien super-Earth.',
    bonusGoal: 'Return >90% of all telemetry data via High-Gain dish',
    nasaFact: 'JWST orbits the Sun-Earth L2 Lagrange point 1.5 million kilometers away, chilled to -233°C to detect primordial infrared light.'
  }
];

export const VEHICLES = [
  {
    id: 'sparrow',
    name: 'Sparrow-1',
    cost: 12,
    payload: 300,
    corridor: 0.55,
    reliability: 0.90,
    reach: ['leo'],
    thrust: 420,
    tag: 'Budget Booster',
    desc: 'Light two-stage rocket. Economical, but strictly confined to Low Earth Orbit.'
  },
  {
    id: 'kestrel',
    name: 'Kestrel-5',
    cost: 40,
    payload: 1500,
    corridor: 0.75,
    reliability: 0.94,
    reach: ['leo', 'moon'],
    thrust: 2100,
    tag: 'Proven Workhorse',
    desc: 'Reliable medium-lift booster. Capable of reaching Earth orbit and trans-lunar injection.'
  },
  {
    id: 'titan',
    name: 'Titan-X',
    cost: 95,
    payload: 4500,
    corridor: 1.0,
    reliability: 0.96,
    reach: ['leo', 'moon', 'mars', 'deep'],
    thrust: 6500,
    tag: 'Interplanetary Flagship',
    desc: 'Super-heavy booster with cryogenic upper stage. Sends massive payloads to Mars and deep space.'
  }
];

export const PARTS = {
  power: [
    {
      id: 'bat',
      category: 'power',
      name: 'Battery Only',
      cost: 2,
      mass: 20,
      watts: 40,
      size: [1, 1],
      sunDependent: false,
      icon: '🔋',
      desc: 'Non-rechargeable chemical battery. Constant 40W. Inexpensive, but limited lifetime.'
    },
    {
      id: 'sol_s',
      category: 'power',
      name: 'Small Solar Array',
      cost: 6,
      mass: 30,
      watts: 120,
      size: [2, 1],
      sunDependent: true,
      icon: '☀️',
      desc: 'Produces 120W at Earth. Yield drops with distance by inverse-square law.'
    },
    {
      id: 'sol_l',
      category: 'power',
      name: 'Large Solar Wings',
      cost: 12,
      mass: 70,
      watts: 300,
      size: [2, 2],
      sunDependent: true,
      icon: '🛰️',
      desc: 'Generates 300W at Earth. High mass, but provides strong power across inner solar system.'
    },
    {
      id: 'rtg',
      category: 'power',
      name: 'MMRTG Nuclear Generator',
      cost: 30,
      mass: 55,
      watts: 150,
      size: [1, 2],
      sunDependent: false,
      icon: '☢️',
      desc: 'Plutonium-238 radioisotope generator. Continuous 150W regardless of distance or planetary eclipse.'
    }
  ],
  instruments: [
    {
      id: 'cam',
      category: 'instruments',
      name: 'Multispectral Camera',
      cost: 5,
      mass: 15,
      watts: 30,
      data: 800,
      science: 10,
      size: [1, 1],
      tags: ['imaging'],
      icon: '📷',
      desc: 'High-res visible & infrared optics for surface mapping.'
    },
    {
      id: 'spec',
      category: 'instruments',
      name: 'Imaging Spectrometer',
      cost: 12,
      mass: 30,
      watts: 50,
      data: 300,
      science: 25,
      size: [1, 2],
      tags: ['geology', 'atmosphere'],
      icon: '🌈',
      desc: 'Disperses light into spectra to determine rock mineralogy and atmospheric gases.'
    },
    {
      id: 'radar',
      category: 'instruments',
      name: 'Subsurface Radar',
      cost: 18,
      mass: 45,
      watts: 90,
      data: 500,
      science: 30,
      size: [2, 2],
      tags: ['geology'],
      icon: '📡',
      desc: 'Ground-penetrating radar pulses that detect subsurface aquifers and bedrock.'
    },
    {
      id: 'mag',
      category: 'instruments',
      name: 'Magnetometer Boom',
      cost: 6,
      mass: 10,
      watts: 10,
      data: 20,
      science: 12,
      size: [1, 1],
      tags: ['magnetic'],
      icon: '🧲',
      desc: 'Ultra-low power boom measuring crustal fields and solar wind interactions.'
    },
    {
      id: 'arm',
      category: 'instruments',
      name: 'Robotic Sample Arm',
      cost: 22,
      mass: 60,
      watts: 40,
      data: 50,
      science: 40,
      size: [1, 2],
      needs: 'landing',
      tags: ['geology'],
      icon: '🦾',
      desc: 'Articulated core drill and soil scooper. Only usable on planetary surface missions.'
    },
    {
      id: 'tele',
      category: 'instruments',
      name: 'Space Telescope',
      cost: 35,
      mass: 80,
      watts: 60,
      data: 900,
      science: 45,
      size: [2, 2],
      tags: ['imaging'],
      only: ['deep'],
      icon: '🔭',
      desc: 'Cryogenic infrared reflector for deep-space exoplanet astronomy.'
    }
  ],
  comms: [
    {
      id: 'low',
      category: 'comms',
      name: 'Low-Gain Patch',
      cost: 3,
      mass: 5,
      watts: 10,
      down: 200,
      catch: 0.6,
      size: [1, 1],
      icon: '📶',
      desc: 'Broad-beam antenna. Inexpensive (200 Mb/d), but small reception cone.'
    },
    {
      id: 'med',
      category: 'comms',
      name: 'Medium Parabolic Dish',
      cost: 9,
      mass: 20,
      watts: 35,
      down: 1200,
      catch: 1.0,
      size: [2, 1],
      icon: '📡',
      desc: '0.8m steerable reflector. Delivers 1,200 Mb/d with standard reception.'
    },
    {
      id: 'high',
      category: 'comms',
      name: 'High-Gain Deep Space Dish',
      cost: 18,
      mass: 40,
      watts: 70,
      down: 5000,
      catch: 1.5,
      size: [2, 2],
      icon: '🛰️',
      desc: '2.4m precision dish. Pairs with Earth’s 70m DSN dishes (5,000 Mb/d).'
    }
  ],
  extras: [
    {
      id: 'fuel',
      category: 'extras',
      name: 'Extra Fuel Tank',
      cost: 8,
      mass: 40,
      size: [1, 2],
      icon: '⛽',
      desc: '+100 Propellant reserve. Widens insertion burn capture sweet spot.'
    },
    {
      id: 'therm',
      category: 'extras',
      name: 'Thermal Shield',
      cost: 7,
      mass: 25,
      size: [1, 1],
      icon: '🛡️',
      desc: 'Ablative thermal insulation. Halves solar flare and entry friction damage.'
    },
    {
      id: 'store',
      category: 'extras',
      name: 'Data Storage Buffer',
      cost: 6,
      mass: 10,
      size: [1, 1],
      icon: '💾',
      desc: '+1,500 Mb onboard telemetry storage during planetary blackout.'
    }
  ]
};

// Flattened parts lookup
export const ALL_PARTS = [
  ...PARTS.power,
  ...PARTS.instruments,
  ...PARTS.comms,
  ...PARTS.extras
];

export function getPartById(id) {
  return ALL_PARTS.find(p => p.id === id) || null;
}

/**
 * Calculates derived stats & feasibility checks for a given configuration
 */
export function computeStats(vehicle, placedParts = [], mission, difficulty = 'engineer') {
  const baseBusMass = 25; // Base chassis structural mass
  const baseHouseWatts = 15; // Avionics, ADCS, internal computer
  const baseFuel = 100;
  const baseBuffer = 1000;

  // Difficulty Budget Multiplier
  let budgetMultiplier = 1.0;
  if (difficulty === 'cadet') budgetMultiplier = 1.40;
  else if (difficulty === 'director') budgetMultiplier = 0.85;

  const effectiveBudget = Math.round(mission.budget * budgetMultiplier);

  // Sum parts
  let partsCost = 0;
  let partsMass = 0;
  let wattsNeed = baseHouseWatts;
  let wattsSupply = 0;
  let extraFuel = 0;
  let extraBuffer = 0;
  let hasThermal = false;
  let catchWidth = 0.6;
  let downlinkRate = 200;
  let dataProduced = 0;
  let rawScience = 0;

  placedParts.forEach(p => {
    partsCost += p.cost;
    partsMass += p.mass;

    if (p.category === 'power') {
      if (p.sunDependent) {
        wattsSupply += Math.round(p.watts * mission.sun);
      } else {
        wattsSupply += p.watts;
      }
    } else {
      wattsNeed += (p.watts || 0);
    }

    if (p.category === 'instruments') {
      dataProduced += (p.data || 0);
      rawScience += (p.science || 0);
    }

    if (p.category === 'comms') {
      downlinkRate = p.down || 200;
      catchWidth = p.catch || 0.6;
    }

    if (p.id === 'fuel') extraFuel += 100;
    if (p.id === 'store') extraBuffer += 1500;
    if (p.id === 'therm') hasThermal = true;
  });

  const vehicleCost = vehicle ? vehicle.cost : 0;
  const totalCost = vehicleCost + partsCost;
  const totalMass = baseBusMass + partsMass;
  const totalFuel = baseFuel + extraFuel;
  const totalBuffer = baseBuffer + extraBuffer;

  // Acceleration / Handling in Launch & Cruise
  const thrust = vehicle ? vehicle.thrust : 500;
  const accel = Math.max(0.4, Math.min(2.0, (thrust / totalMass) * 0.15));

  // Feasibility Checks
  const reachOK = vehicle ? vehicle.reach.includes(mission.target) : false;
  const massOK = vehicle ? totalMass <= vehicle.payload : false;
  const budgetOK = totalCost <= effectiveBudget;
  const powerOK = wattsSupply >= wattsNeed;

  const hasInstruments = placedParts.some(p => p.category === 'instruments');
  const hasPower = placedParts.some(p => p.category === 'power');
  const hasComms = placedParts.some(p => p.category === 'comms');

  // Compatibility Rules
  const hasSampleArm = placedParts.some(p => p.id === 'arm');
  const armOK = !hasSampleArm || !!mission.landing;

  const hasTelescope = placedParts.some(p => p.id === 'tele');
  const teleOK = !hasTelescope || mission.target === 'deep';

  const blockers = [];
  if (!vehicle) {
    blockers.push('No launch vehicle selected.');
  } else if (!reachOK) {
    blockers.push(`${vehicle.name} cannot reach ${mission.target.toUpperCase()}. Select a larger booster.`);
  }

  if (vehicle && !massOK) {
    blockers.push(`Mass (${totalMass} kg) exceeds ${vehicle.name} capacity (${vehicle.payload} kg).`);
  }

  if (!budgetOK) {
    blockers.push(`Cost ($${totalCost}M) exceeds budget ($${effectiveBudget}M).`);
  }

  if (!hasPower) {
    blockers.push('No electrical power source installed.');
  } else if (!powerOK) {
    blockers.push(`Power deficit: Generating ${wattsSupply}W < ${wattsNeed}W required at ${mission.target.toUpperCase()}.`);
  }

  if (!hasComms) {
    blockers.push('No telecommunications antenna equipped.');
  }

  if (!hasInstruments) {
    blockers.push('No scientific instruments installed.');
  }

  if (!armOK) {
    blockers.push('Robotic Sample Arm requires a planetary surface landing mission.');
  }

  if (!teleOK) {
    blockers.push('Space Telescope requires a Deep Space mission destination.');
  }

  const isLaunchReady = blockers.length === 0;

  return {
    vehicle,
    parts: placedParts,
    totalCost,
    effectiveBudget,
    totalMass,
    payloadLimit: vehicle ? vehicle.payload : 0,
    wattsSupply,
    wattsNeed,
    totalFuel,
    totalBuffer,
    catchWidth,
    downlinkRate,
    dataProduced,
    rawScience,
    hasThermal,
    accel,
    reachOK,
    massOK,
    budgetOK,
    powerOK,
    hasInstruments,
    hasPower,
    hasComms,
    armOK,
    teleOK,
    isLaunchReady,
    blockers
  };
}

/**
 * Auto-Build Generator: Creates an optimized, 100% legal loadout for any mission
 */
export function autoBuild(mission, difficulty = 'engineer') {
  let vehicleId = 'sparrow';
  const partIds = [];

  if (mission.id === 1) {
    // First Light: LEO, Budget $60M
    vehicleId = 'sparrow'; // $12M
    partIds.push('sol_s'); // $6M, 30kg, 120W
    partIds.push('cam');   // $5M, 15kg, 30W, 10 sci
    partIds.push('mag');   // $6M, 10kg, 10W, 12 sci
    partIds.push('med');   // $9M, 20kg, 35W
    // Total cost: 12 + 6 + 5 + 6 + 9 = $38M <= $60M (Bonus goal achieved!)
  } else if (mission.id === 2) {
    // Lunora Orbiter: Moon, Budget $120M
    vehicleId = 'kestrel'; // $40M
    partIds.push('sol_l');  // $12M, 70kg, 300W
    partIds.push('spec');   // $12M, 30kg, 50W, 25 sci
    partIds.push('radar');  // $18M, 45kg, 90W, 30 sci (Bonus goal: spec + radar!)
    partIds.push('med');    // $9M, 20kg, 35W
    partIds.push('fuel');   // $8M, 40kg (+100 fuel)
    // Total cost: 40 + 12 + 12 + 18 + 9 + 8 = $99M <= $120M
  } else if (mission.id === 3) {
    // Red Dust Rover: Mars, Budget $260M
    vehicleId = 'titan';   // $95M
    partIds.push('rtg');    // $30M, 55kg, 150W steady
    partIds.push('arm');    // $22M, 60kg, 40W, 40 sci (lander required)
    partIds.push('cam');    // $5M, 15kg, 30W, 10 sci
    partIds.push('therm');  // $7M, 25kg (50% heat resist)
    partIds.push('med');    // $9M, 20kg, 35W
    partIds.push('fuel');   // $8M, 40kg
    // Total cost: 95 + 30 + 22 + 5 + 7 + 9 + 8 = $176M <= $260M
  } else if (mission.id === 4) {
    // Deep Eye: Deep Space, Budget $300M
    vehicleId = 'titan';   // $95M
    partIds.push('rtg');    // $30M, 55kg, 150W steady
    partIds.push('tele');   // $35M, 80kg, 60W, 45 sci
    partIds.push('high');   // $18M, 40kg, 70W (High-Gain dish for bonus goal!)
    partIds.push('store');  // $6M, 10kg (+1500 buffer)
    partIds.push('fuel');   // $8M, 40kg
    // Total cost: 95 + 30 + 35 + 18 + 6 + 8 = $192M <= $300M
  }

  const vehicle = VEHICLES.find(v => v.id === vehicleId);
  const parts = partIds.map(id => getPartById(id)).filter(Boolean);

  // Position parts onto 6x4 bay grid
  // Grid width: 6, height: 4
  const placedParts = [];
  const occupied = Array(4).fill(null).map(() => Array(6).fill(false));

  function canPlace(r, c, w, h) {
    if (r + h > 4 || c + w > 6) return false;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        if (occupied[r + i][c + j]) return false;
      }
    }
    return true;
  }

  function markOccupied(r, c, w, h) {
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        occupied[r + i][c + j] = true;
      }
    }
  }

  for (const part of parts) {
    const [w, h] = part.size;
    let placed = false;
    for (let r = 0; r < 4 && !placed; r++) {
      for (let c = 0; c < 6 && !placed; c++) {
        if (canPlace(r, c, w, h)) {
          markOccupied(r, c, w, h);
          placedParts.push({
            ...part,
            gridX: c,
            gridY: r
          });
          placed = true;
        }
      }
    }
    if (!placed) {
      // Fallback
      placedParts.push({ ...part, gridX: 0, gridY: 0 });
    }
  }

  return {
    vehicle,
    placedParts
  };
}
