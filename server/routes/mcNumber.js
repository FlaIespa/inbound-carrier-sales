import mcNumberController from '../controllers/mcNumberController.js';

/**
 * Route handler for the MC number verification endpoint.
 *
 * Checks if the incoming request matches the POST /mc-number route,
 * and delegates to the mcNumberController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleMcNumber(req, res) {
  if (req.method === 'POST' && req.url === '/mc-number') {
    mcNumberController(req, res);
    return true;
  }
  return false;
}