import loadDetailsController from '../controllers/loadDetailsController.js';

/**
 * Route handler for the load details endpoint.
 *
 * Checks if the incoming request matches the POST /load-details route,
 * and delegates to the loadDetailsController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleLoadDetails(req, res) {
  if (req.method === 'POST' && req.url === '/load-details') {
    loadDetailsController(req, res);
    return true;
  }
  return false;
}