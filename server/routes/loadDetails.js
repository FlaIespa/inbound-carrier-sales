// server/routes/loadDetails.js
import loadDetailsController from '../controllers/loadDetailsController.js';

export function handleLoadDetails(req, res) {
  if (req.method === 'POST' && req.url === '/load-details') {
    loadDetailsController(req, res);
    return true;
  }
  return false;
}