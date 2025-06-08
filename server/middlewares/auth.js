// server/middlewares/auth.js

import { API_KEY } from '../config/config.js';

export default function auth(req, res) {
  const requestApiKey = req.headers['x-api-key'];
  console.log('Server expected API key:', API_KEY);
  console.log('Client provided API key:', requestApiKey);

  if (requestApiKey !== API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return false;  // stop further handling
  }

  return true;  // continue to route handler
}
