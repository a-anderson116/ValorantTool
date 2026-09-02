// POST /api/auth/logout
// Sessions are stateless signed tokens, so logout is client-side (the browser
// discards the token). This endpoint exists so the frontend's logout call
// succeeds; there is nothing to invalidate server-side.
export default function handler(req, res) {
  return res.json({ success: true })
}
