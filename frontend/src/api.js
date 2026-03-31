import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE })

export const fetchMatch = (matchId) =>
  api.get(`/match/${matchId}`).then(r => r.data.data)

export const fetchPlayer = (region, name, tag, count = 20) =>
  api.get(`/player/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?count=${count}`)
    .then(r => r.data.data)

export const scoutTeam = (players, count = 15) =>
  api.post('/team/scout', { players, count }).then(r => r.data.data)

export const generateReport = (payload) =>
  api.post('/report/generate', payload, { responseType: 'blob' }).then(r => r.data)

export default api
