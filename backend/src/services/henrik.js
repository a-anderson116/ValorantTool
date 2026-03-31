const axios = require('axios');

const HENRIK_BASE = 'https://api.henrikdev.tech/valorant';
const headers = process.env.HENRIK_API_KEY
  ? { Authorization: process.env.HENRIK_API_KEY }
  : {};

const henrik = axios.create({ baseURL: HENRIK_BASE, headers });

// Get match by ID
async function getMatch(matchId) {
  const { data } = await henrik.get(`/v2/match/${matchId}`);
  return data.data;
}

// Get player match history by name+tag
async function getPlayerMatches(name, tag, region = 'na', count = 10) {
  const { data } = await henrik.get(
    `/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=${count}`
  );
  return data.data;
}

// Get player profile/MMR
async function getPlayerMMR(name, tag, region = 'na') {
  const { data } = await henrik.get(
    `/v2/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
  return data.data;
}

// Get player account info
async function getPlayerAccount(name, tag) {
  const { data } = await henrik.get(
    `/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
  return data.data;
}

module.exports = { getMatch, getPlayerMatches, getPlayerMMR, getPlayerAccount };
