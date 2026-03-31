require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const matchRoutes = require('./routes/match');
const playerRoutes = require('./routes/player');
const teamRoutes = require('./routes/team');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api/', limiter);

app.use('/api/match', matchRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/report', reportRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.listen(PORT, () => console.log(`VCT Tool backend running on port ${PORT}`));
