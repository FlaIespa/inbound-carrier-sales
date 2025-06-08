// server/routes/webhook.js
import webhookController from '../controllers/webhookController.js';

export function handleWebhook(req, res) {
  if (req.method === 'POST' && req.url === '/webhook') {
    webhookController(req, res);
    return true;
  }
  return false;
}