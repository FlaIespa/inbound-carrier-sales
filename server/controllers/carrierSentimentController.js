import supabase from '../utils/supabaseClient.js';

/**
 * Controller for carrier sentiment endpoint (/carrier-sentiment)
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
