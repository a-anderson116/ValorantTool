require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const matchRoutes = require('./routes/match');
const playerRoutes = require('./routes/player');
const teamRoutes = require('./routes/team');
const reportRoutes = require('./routes/report');
const authRoutes = require('./routes/auth');
const { requireSession } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api/', limiter);

// Auth is public (it establishes the session). Everything that returns player
// or match data requires a valid RSO session — opt-in is enforced per-route.
app.use('/api/auth', authRoutes);
app.use('/api/match', requireSession, matchRoutes);
app.use('/api/player', requireSession, playerRoutes);
app.use('/api/team', requireSession, teamRoutes);
app.use('/api/report', requireSession, reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.listen(PORT, () => console.log(`VCT Tool backend running on port ${PORT}`));
