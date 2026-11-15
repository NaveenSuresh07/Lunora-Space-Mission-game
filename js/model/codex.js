/**
 * Space Mission Design Game: Pixel Arcade v3
 * Mission Codex Handbook: The Science & Engineering Behind the Game
 */

export const CODEX_ENTRIES = [
  {
    id: 'rocket_equation',
    title: 'TSIOLKOVSKY ROCKET EQUATION',
    category: 'PROPULSION & DELTA-V',
    text: [
      'Δv = Isp * g0 * ln(m_wet / m_dry)',
      '',
      'Named after Konstantin Tsiolkovsky (1903). Every kilometer',
      'per second of velocity change demands exponential propellant',
      'mass. Heavier dry mass requires drastically more fuel.',
      'High-Isp thrusters (like 3000s Ion drives) save enormous fuel,',
      'but generate low thrust and draw heavy continuous wattage.'
    ]
  },
  {
    id: 'solar_flux',
    title: 'INVERSE-SQUARE LAW (SOLAR POWER)',
    category: 'ELECTRICAL POWER',
    text: [
      'P = Area * (1361 W/m² / r_AU²) * 0.28',
      '',
      'Solar irradiance diminishes with the square of distance.',
      'At Mars (1.52 AU), solar intensity is (1.52)² ≈ 2.31x weaker,',
      'producing only ~43% of Earth output. At Jupiter (5.2 AU),',
      'sunlight delivers a mere 14 W/m², making RTGs or colossal',
      'deployable solar wings (like NASA Juno) essential.'
    ]
  },
  {
    id: 'dsn_latency',
    title: 'DEEP SPACE NETWORK & LIGHT DELAY',
    category: 'COMMUNICATIONS',
    text: [
      'Radio waves travel at light speed (~300,000 km/s).',
      'One-way light time: Moon ≈ 1.3s, Mars ≈ 3 to 22 minutes,',
      'Jupiter ≈ 35 to 50 minutes. Because real-time joysticking',
      'is impossible, distant spacecraft must perform autonomous',
      'fault-protection, star-tracking, and scheduled downlinks.'
    ]
  },
  {
    id: 'rtg_power',
    title: 'NUCLEAR RTG GENERATORS',
    category: 'ELECTRICAL POWER',
    text: [
      'Radioisotope Thermoelectric Generators convert the natural',
      'decay heat of Plutonium-238 into electricity via thermocouples.',
      'Unlike solar arrays, RTGs output steady wattage inside planetary',
      'shadows, during dust storms, or in deep outer space. Flown on',
      'Voyager 1 & 2, Cassini, New Horizons, Curiosity, and Perseverance.'
    ]
  },
  {
    id: 'orbits_selection',
    title: 'ORBITS: LOW, SUN-SYNC, HIGH',
    category: 'ORBITAL MECHANICS',
    text: [
      'Low Orbit: Closer to target surface (+15% imagery science),',
      'but ground contact passes are short and atmospheric drag exists.',
      'Sun-Sync: Crosses equator at same local solar time daily,',
      'ideal for uniform climate and environmental monitoring (Landsat).',
      'High Orbit: Wide line-of-sight (+30% downlink), but blurrier.'
    ]
  },
  {
    id: 'gonogo_poll',
    title: 'NASA GO / NO-GO POLL CONSENSUS',
    category: 'FLIGHT OPERATIONS',
    text: [
      'Before launch or burns, Flight Directors conduct verbal polls',
      'of console operators: Flight Dynamics, Propulsion, GNC, EECOM.',
      'Every discipline must confirm GO. A single red parameter (mass,',
      'power, or trajectory) aborts countdown. True mission success',
      'depends on interdisciplinary systems engineering.'
    ]
  }
];
