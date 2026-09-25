// Multi-game groundwork. The platform is game-agnostic; Valorant is the first
// title live. Adding a game later means flipping `active` and wiring its
// provider adapter on the backend — the rest of the UI reads from here.
export const GAMES = [
  { id: 'valorant', name: 'Valorant', provider: 'riot', active: true },
  { id: 'league', name: 'League of Legends', provider: 'riot', active: false },
  { id: 'rocket-league', name: 'Rocket League', provider: 'epic', active: false },
  { id: 'cs2', name: 'Counter-Strike 2', provider: 'steam', active: false },
]

export const ACTIVE_GAMES = GAMES.filter((g) => g.active)
export const ACTIVE_GAME = ACTIVE_GAMES[0] || GAMES[0]
