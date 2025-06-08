import supabase from '../utils/supabaseClient.js';

/**
 * Handles incoming POST requests to update the carrier sentiment of a call in the database.
 *
 * Reads the request body, parses JSON to extract sentiment details,
 * updates the corresponding record in the "calls" table, and responds with a status.
 *
 * @param {import('http').IncomingMessage} req - The HTTP request object.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 * @returns {void}
 */

export default function carrierSentimentController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { callId, sentiment, mc_number } = JSON.parse(body);
      console.log('Carrier sentiment for call:', callId, sentiment, mc_number);

      const sentimentData = { sentiment, mc_number };
      const { error: sentimentError } = await supabase
        .from('calls')
        .update(sentimentData)
        .eq('call_id', callId);
      if (sentimentError) console.error('Supabase update error (carrier_sentiment):', sentimentError);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (err) {
      console.error('Error in /carrier-sentiment:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
}
