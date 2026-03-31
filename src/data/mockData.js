export const MOCK_TEAMS = [
  { id: 'sfu-esports', name: 'SFU Esports', school: 'Simon Fraser University', region: 'CCPL', rank: 'Diamond III', wins: 8, losses: 2, logo: 'SFU' },
  { id: 'ubc-thunder', name: 'UBC Thunder', school: 'Univ. of British Columbia', region: 'CCPL', rank: 'Ascendant I', wins: 9, losses: 1, logo: 'UBC' },
  { id: 'uvic-vikes', name: 'UVic Vikes', school: 'Univ. of Victoria', region: 'CCPL', rank: 'Diamond II', wins: 6, losses: 4, logo: 'UVI' },
  { id: 'sfu-esports-b', name: 'SFU Esports B', school: 'Simon Fraser University', region: 'CCPL', rank: 'Platinum I', wins: 4, losses: 6, logo: 'SFB' },
]

export const MOCK_PLAYERS = {
  'sfu-esports': [
    { puuid: 'p1', name: '297rackie', tag: 'wav', role: 'Duelist', agent: 'Jett', acs: 229, kd: 1.6, adr: 246.7, hs: 52, kast: 74, fk: 5, fd: 2, rating: 8.4 },
    { puuid: 'p2', name: 'conndoor', tag: 'yoyo', role: 'Controller', agent: 'Omen', acs: 198, kd: 0.9, adr: 117.4, hs: 22, kast: 70, fk: 4, fd: 2, rating: 6.9 },
    { puuid: 'p3', name: 'Asiaken', tag: '201', role: 'Initiator', agent: 'Sova', acs: 178, kd: 0.8, adr: 134.6, hs: 18, kast: 52, fk: 2, fd: 1, rating: 6.1 },
    { puuid: 'p4', name: 'EagleIMD', tag: '4382', role: 'Sentinel', agent: 'Cypher', acs: 154, kd: 0.9, adr: 108.6, hs: 26, kast: 70, fk: 0, fd: 4, rating: 5.8 },
    { puuid: 'p5', name: 'Panini', tag: '3178', role: 'Controller', agent: 'Viper', acs: 68, kd: 0.3, adr: 53.3, hs: 35, kast: 52, fk: 0, fd: 3, rating: 3.2 },
  ],
  'ubc-thunder': [
    { puuid: 'p6', name: 'nndy', tag: 'dpi', role: 'Duelist', agent: 'Reyna', acs: 293, kd: 1.7, adr: 195.2, hs: 49, kast: 91, fk: 2, fd: 0, rating: 9.1 },
    { puuid: 'p7', name: 'Pizzaguy', tag: '022', role: 'Initiator', agent: 'Fade', acs: 228, kd: 1.7, adr: 194.8, hs: 21, kast: 74, fk: 3, fd: 2, rating: 8.2 },
    { puuid: 'p8', name: 'Evan11', tag: '2737', role: 'Controller', agent: 'Brimstone', acs: 210, kd: 0.9, adr: 131.3, hs: 28, kast: 70, fk: 4, fd: 4, rating: 7.1 },
    { puuid: 'p9', name: 'yuzu', tag: 'LMONZ', role: 'Sentinel', agent: 'Killjoy', acs: 150, kd: 0.8, adr: 94.9, hs: 13, kast: 57, fk: 2, fd: 2, rating: 5.4 },
    { puuid: 'p10', name: 'hyakki', tag: '8888', role: 'Duelist', agent: 'Neon', acs: 115, kd: 0.6, adr: 76.0, hs: 14, kast: 48, fk: 1, fd: 3, rating: 4.1 },
  ]
}

export const MOCK_MATCHES = [
  {
    id: '83046fd9-4118-414f-a99e-78a357407023',
    date: '2026-02-10T20:49:00Z',
    map: 'Bind',
    mode: 'Custom',
    duration: '45m 46s',
    teamA: { id: 'sfu-esports', name: 'SFU Esports', score: 10, side_start: 'Attack' },
    teamB: { id: 'ubc-thunder', name: 'UBC Thunder', score: 13, side_start: 'Defense' },
    winner: 'ubc-thunder',
    avgRank: 'Diamond III',
    rounds: [
      { num: 1, winner: 'B', type: 'Pistol', outcome: 'Elimination', economy_a: 800, economy_b: 800 },
      { num: 2, winner: 'B', type: 'Eco', outcome: 'Elimination', economy_a: 1900, economy_b: 3800 },
      { num: 3, winner: 'A', type: 'Force', outcome: 'Defuse', economy_a: 2400, economy_b: 4100 },
      { num: 4, winner: 'A', type: 'Full', outcome: 'Elimination', economy_a: 3900, economy_b: 1200 },
      { num: 5, winner: 'A', type: 'Full', outcome: 'Time', economy_a: 4200, economy_b: 2800 },
      { num: 6, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 3500, economy_b: 4100 },
      { num: 7, winner: 'B', type: 'Full', outcome: 'Defuse', economy_a: 2100, economy_b: 3900 },
      { num: 8, winner: 'A', type: 'Eco', outcome: 'Elimination', economy_a: 4400, economy_b: 900 },
      { num: 9, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 2800, economy_b: 4200 },
      { num: 10, winner: 'A', type: 'Full', outcome: 'Elimination', economy_a: 3900, economy_b: 3800 },
      { num: 11, winner: 'B', type: 'Pistol', outcome: 'Elimination', economy_a: 800, economy_b: 800 },
      { num: 12, winner: 'A', type: 'Eco', outcome: 'Spike', economy_a: 4100, economy_b: 1400 },
      { num: 13, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 2100, economy_b: 3900 },
      { num: 14, winner: 'B', type: 'Full', outcome: 'Defuse', economy_a: 3600, economy_b: 4200 },
      { num: 15, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 2900, economy_b: 3800 },
      { num: 16, winner: 'A', type: 'Full', outcome: 'Spike', economy_a: 3700, economy_b: 3100 },
      { num: 17, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 3400, economy_b: 3900 },
      { num: 18, winner: 'A', type: 'Force', outcome: 'Defuse', economy_a: 2200, economy_b: 4100 },
      { num: 19, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 3800, economy_b: 3700 },
      { num: 20, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 2600, economy_b: 4000 },
      { num: 21, winner: 'A', type: 'Full', outcome: 'Spike', economy_a: 4100, economy_b: 2800 },
      { num: 22, winner: 'B', type: 'Full', outcome: 'Elimination', economy_a: 3200, economy_b: 4200 },
      { num: 23, winner: 'B', type: 'Full', outcome: 'Defuse', economy_a: 2900, economy_b: 3900 },
    ]
  },
  {
    id: 'match-002',
    date: '2026-02-17T19:00:00Z',
    map: 'Haven',
    mode: 'Custom',
    duration: '38m 12s',
    teamA: { id: 'sfu-esports', name: 'SFU Esports', score: 13, side_start: 'Defense' },
    teamB: { id: 'uvic-vikes', name: 'UVic Vikes', score: 7, side_start: 'Attack' },
    winner: 'sfu-esports',
    avgRank: 'Diamond II',
    rounds: Array.from({ length: 20 }, (_, i) => ({
      num: i + 1,
      winner: i % 3 === 0 ? 'B' : 'A',
      type: ['Full','Full','Eco','Force','Pistol'][i % 5],
      outcome: ['Elimination','Defuse','Spike','Time'][i % 4],
      economy_a: 2800 + Math.floor(Math.random() * 1800),
      economy_b: 1800 + Math.floor(Math.random() * 2000),
    }))
  }
]

export const MAP_WIN_RATES = {
  'sfu-esports': [
    { map: 'Bind', wins: 3, losses: 2, wr: 60 },
    { map: 'Haven', wins: 4, losses: 1, wr: 80 },
    { map: 'Split', wins: 2, losses: 3, wr: 40 },
    { map: 'Ascent', wins: 3, losses: 2, wr: 60 },
    { map: 'Icebox', wins: 1, losses: 3, wr: 25 },
    { map: 'Lotus', wins: 2, losses: 1, wr: 67 },
    { map: 'Pearl', wins: 1, losses: 2, wr: 33 },
  ],
  'ubc-thunder': [
    { map: 'Bind', wins: 4, losses: 1, wr: 80 },
    { map: 'Haven', wins: 2, losses: 3, wr: 40 },
    { map: 'Split', wins: 4, losses: 1, wr: 80 },
    { map: 'Ascent', wins: 3, losses: 2, wr: 60 },
    { map: 'Icebox', wins: 3, losses: 1, wr: 75 },
    { map: 'Lotus', wins: 2, losses: 2, wr: 50 },
    { map: 'Pearl', wins: 3, losses: 1, wr: 75 },
  ]
}

export const AGENT_COLORS = {
  Jett: '#5BB8C4', Reyna: '#B44FAC', Omen: '#6B5FA0',
  Sova: '#4B8BBE', Cypher: '#C9B26A', Viper: '#3FA464',
  Fade: '#8B6B9A', Brimstone: '#D4703A', Killjoy: '#F5C542',
  Neon: '#5B9BD5', Phoenix: '#E8873A', Sage: '#6FC4A0',
  Breach: '#C4784B', Skye: '#7BAF5C', Astra: '#9B6BB5',
}

export const ROLE_COLORS = {
  Duelist: '#FF4655',
  Controller: '#00C8BE',
  Initiator: '#FFD700',
  Sentinel: '#7B9BAF',
}
