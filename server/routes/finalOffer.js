// server/routes/finalOffer.js
import finalOfferController from '../controllers/finalOfferController.js';

export function handleFinalOffer(req, res) {
  if (req.method === 'POST' && req.url === '/final-offer') {
    finalOfferController(req, res);
    return true;
  }
  return false;
}