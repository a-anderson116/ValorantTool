# VCT Scout — Valorant Collegiate Tool

A dedicated match intelligence and scouting platform for collegiate Valorant programs.

## Features
- Match import via tracker.gg URL or Riot Match ID
- Full scoreboard: ACS, K/D, ADR, HS%, KAST, FK/FD, Rating
- Round-by-round viewer with economy charts
- Team scouting dashboard with map pool analysis
- Player profiles with performance radar
- AI-generated scouting reports (exportable)
- Map ban recommendations
- Riot API ready (awaiting Tournament API approval)

## Stack
- React 18 + Vite
- Tailwind CSS
- Recharts (data visualization)
- React Router v6
- Henrik's Unofficial Valorant API (fallback)
- Riot Games API (val/match/v1, val/ranked/v1)

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel --prod
```

### Option B — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

## Riot API Setup

1. Go to developer.riotgames.com
2. Register a new application
3. Request access to:
   - `VAL-MATCH-V1` (match data)
   - `VAL-MATCH-V1/TIMELINES` (kill events)
   - `VAL-RANKED-V1` (rank verification)
4. Add your API key to `.env`:
   ```
   VITE_RIOT_API_KEY=your_key_here
   ```

## For Riot API Submission
- Live URL: [your-vercel-url].vercel.app
- Product: Collegiate esports scouting platform
- Requested APIs: val/match/v1, val/match/v1/timelines, val/ranked/v1
- Use case: Non-commercial, educational, collegiate program support
- Users: Coaches and analysts at accredited universities
