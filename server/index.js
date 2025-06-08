import http from 'http';
import { PORT } from './config/config.js';
import auth from './middlewares/auth.js';
import { handleMcNumber } from './routes/mcNumber.js';
import { handleWebhook } from './routes/webhook.js';
import { handleLoadDetails } from './routes/loadDetails.js';
import { handleFinalOffer } from './routes/finalOffer.js';
import { handleCallOutcome } from './routes/callOutcome.js';
import { handleCarrierSentiment } from './routes/carrierSentiment.js';

/**
 * Main entrypoint for the HTTP server.
 *
 * Sets up request authentication, delegates to route handlers,
 * and provides a default 404 response for unmatched routes.
 */

const server = http.createServer(async (req, res) => {
    /**
   * Request listener handling authentication and routing.
   *
   * @param {import('http').IncomingMessage} req  - The HTTP request object.
   * @param {import('http').ServerResponse}    res - The HTTP response object.
   * @returns {void}
   */
  if (!auth(req, res)) return;

  // Route handling
  if (handleMcNumber(req, res)) return;
  if (handleWebhook(req, res)) return;
  if (handleLoadDetails(req, res)) return;
  if (handleFinalOffer(req, res)) return;
  if (handleCallOutcome(req, res)) return;
  if (handleCarrierSentiment(req, res)) return;

  // Default 404 response
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start server
server.listen(PORT, '0.0.0.0' , () => {
  console.log(`Server listening on port ${PORT}`);
});
