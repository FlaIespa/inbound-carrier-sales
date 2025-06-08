// server/routes/carrierSentiment.js
import carrierSentimentController from '../controllers/carrierSentimentController.js';

export function handleCarrierSentiment(req, res) {
  if (req.method === 'POST' && req.url === '/carrier-sentiment') {
    carrierSentimentController(req, res);
    return true;
  }
  return false;
}