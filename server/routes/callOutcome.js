import callOutcomeController from '../controllers/callOutcomeController.js';

/**
 * Route handler for the call outcome endpoint.
 *
 * Checks if the incoming request matches the POST /call-outcome route,
 * and delegates to the callOutcomeController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleCallOutcome(req, res) {
  if (req.method === 'POST' && req.url === '/call-outcome') {
    callOutcomeController(req, res);
    return true;
  }
  return false;
}