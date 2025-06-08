import { API_KEY } from '../config/config.js';

/**
 * Middleware to authenticate requests using an API key.
 *
 * Checks the `x-api-key` header against the configured API_KEY.
 * If the keys do not match, responds with a 401 Unauthorized error.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if authentication succeeds and processing should continue;
 *                    `false` if authentication fails (response already sent).
 */

export default function auth(req, res) {
  const requestApiKey = req.headers['x-api-key'];
  console.log('Server expected API key:', API_KEY);
  console.log('Client provided API key:', requestApiKey);

  if (requestApiKey !== API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return false;  
  }

  return true;  
}
