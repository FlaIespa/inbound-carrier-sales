import http from 'http';
import { PORT } from './config/config.js';
import auth from './middlewares/auth.js';
import { handleMcNumber } from './routes/mcNumber.js';
import { handleWebhook } from './routes/webhook.js';
import { handleLoadDetails } from './routes/loadDetails.js';
import { handleFinalOffer } from './routes/finalOffer.js';
import { handleCallOutcome } from './routes/callOutcome.js';
import { handleCarrierSentiment } from './routes/carrierSentiment.js';

// Create HTTP server and delegate to route handlers
const server = http.createServer(async (req, res) => {
  // Authenticate request
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
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
