import finalOfferController from '../controllers/finalOfferController.js';

/**
 * Route handler for the final offer endpoint.
 *
 * Checks if the incoming request matches the POST /final-offer route,
 * and delegates to the finalOfferController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleFinalOffer(req, res) {
  if (req.method === 'POST' && req.url === '/final-offer') {
    finalOfferController(req, res);
    return true;
  }
  return false;
}