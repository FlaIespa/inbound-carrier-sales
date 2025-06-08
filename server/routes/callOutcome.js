
// server/routes/callOutcome.js
import callOutcomeController from '../controllers/callOutcomeController.js';

export function handleCallOutcome(req, res) {
  if (req.method === 'POST' && req.url === '/call-outcome') {
    callOutcomeController(req, res);
    return true;
  }
  return false;
}