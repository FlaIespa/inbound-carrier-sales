import supabase from '../utils/supabaseClient.js';

/**
 * Controller for final offer endpoint (/final-offer)
 */
export default function finalOfferController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { callId, finalOffer, mc_number } = JSON.parse(body);
      console.log('Final offer for call:', callId, finalOffer, mc_number);

      const { error: offerError } = await supabase
        .from('calls')
        .update({ final_offer: finalOffer, mc_number })
        .eq('call_id', callId);
      if (offerError) console.error('Supabase update error (final_offer):', offerError);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (err) {
      console.error('Error in /final-offer:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error');
    }
  });
}