import carrierSentimentController from '../controllers/carrierSentimentController.js';

/**
 * Route handler for the carrier sentiment endpoint.
 *
 * Checks if the incoming request matches the POST /carrier-sentiment route,
 * and delegates to the carrierSentimentController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleCarrierSentiment(req, res) {
  if (req.method === 'POST' && req.url === '/carrier-sentiment') {
    carrierSentimentController(req, res);
    return true;
  }
  return false;
}