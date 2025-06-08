import supabase from '../utils/supabaseClient.js';
import { verifyMCNumber } from '../utils/fmcsa.js';
import { setState } from '../services/callStates.js';

/**
 * Controller for MC number verification endpoint (/mc-number)
 */
export default function mcNumberController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { call_id, mc_number } = JSON.parse(body);
      console.log('MC number verification requested for call:', call_id, mc_number);

      // Validate MC number format
      if (!mc_number || !/^\d+$/.test(mc_number)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ valid: false, error: 'Invalid MC number format' }));
      }

      // Verify with FMCSA API
      const { valid, carrierName } = await verifyMCNumber(mc_number);

      // Insert carrier info into Supabase
      const { data, error: carrierError } = await supabase
        .from('calls')
        .insert({ call_id, carrier_name: carrierName, mc_number });
      if (carrierError) console.error('Supabase insert error (carrier_name):', carrierError);

      if (valid) {
        console.log(`MC number verified for carrier: ${carrierName}`);

        // Store in-memory session state
        setState(call_id, { verifiedMC: true, carrierName, mcNumber: mc_number });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ valid: true, carrierName }));
      } else {
        console.log('MC number invalid or not active.');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ valid: false }));
      }
    } catch (err) {
      console.error('Error in /mc-number:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
}
