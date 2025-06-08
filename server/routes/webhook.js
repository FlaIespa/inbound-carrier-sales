import webhookController from '../controllers/webhookController.js';

/**
 * Route handler for the webhook events endpoint.
 *
 * Checks if the incoming request matches the POST /webhook route,
 * and delegates to the webhookController if so.
 *
 * @param {import('http').IncomingMessage} req  - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {boolean} `true` if the request was handled; `false` otherwise.
 */

export function handleWebhook(req, res) {
  if (req.method === 'POST' && req.url === '/webhook') {
    webhookController(req, res);
    return true;
  }
  return false;
}