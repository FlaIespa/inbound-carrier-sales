import { searchLoads } from '../utils/loadsearch.js';

/**
 * Controller for load details endpoint (/load-details)
 */
export default function loadDetailsController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { origin, destination } = JSON.parse(body);
      console.log('Load search requested:', { origin, destination });

      const matches = await searchLoads(origin, destination);

      if (!matches || matches.length === 0) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ found: false }));
      }

      const load = matches[0];
      const responseLoad = {
        load_id: load.load_id || 'Not specified',
        origin: load.origin || 'Not specified',
        destination: load.destination || 'Not specified',
        pickup: load.pickup_datetime || 'Not specified',
        delivery: load.delivery_datetime || 'Not specified',
        equipment: load.equipment_type || 'Not specified',
        weight: load.weight || 'Not specified',
        rate: load.loadboard_rate || 'Not specified',
        notes: load.notes || 'Not specified',
        commodity: load.commodity_type || 'Not specified',
        pieces: load.num_of_pieces || 'Not specified',
        miles: load.miles || 'Not specified',
        dimensions: load.dimensions || 'Not specified',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ found: true, load: responseLoad }));
    } catch (err) {
      console.error('Error in /load-details:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
}