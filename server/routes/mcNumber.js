// server/routes/mcNumber.js
import mcNumberController from '../controllers/mcNumberController.js';

export function handleMcNumber(req, res) {
  if (req.method === 'POST' && req.url === '/mc-number') {
    mcNumberController(req, res);
    return true;
  }
  return false;
}