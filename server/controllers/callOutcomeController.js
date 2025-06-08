import supabase from '../utils/supabaseClient.js';

/**
 * Controller for call outcome endpoint (/call-outcome)
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
