import supabase from '../utils/supabaseClient.js';

/**
 * Handles incoming POST requests to update the outcome of a call in the database.
 *
 * This controller reads the request body, parses JSON to extract call details,
 * updates the corresponding record in the "calls" table, and responds with a status.
 *
 * @param {import('http').IncomingMessage} req - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {void}
 */

export default function callOutcomeController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { callId, outcome, mc_number } = JSON.parse(body);
      console.log('Call outcome for call:', callId, outcome, mc_number);

      const outcomeData = { outcome, mc_number };
      const { error: outcomeError } = await supabase
        .from('calls')
        .update(outcomeData)
        .eq('call_id', callId);
      if (outcomeError) console.error('Supabase update error (call_outcome):', outcomeError);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (err) {
      console.error('Error in /call-outcome:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
}
