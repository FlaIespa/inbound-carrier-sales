import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import supabase from './utils/supabaseClient.js';
import { searchLoads } from './utils/loadsearch.js';
import { verifyMCNumber } from './utils/fmcsa.js';

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.MY_SECRET_API_KEY; // 🔐 Load the API key from environment variables

// In-memory call states: { callId: { verifiedMC: true, carrierName: string, mcNumber: string } }
const callStates = {};

const server = http.createServer(async (req, res) => {
  // ✅ Check for API key header first
  const requestApiKey = req.headers['x-api-key'];
  console.log('🛡️ Server expected API key:', API_KEY);
  console.log('🛡️ Client provided API key:', requestApiKey);

  if (requestApiKey !== API_KEY) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Unauthorized' }));
  }

  // MC number verification endpoint
  if (req.method === 'POST' && req.url === '/mc-number') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        // 1) pull both callId and mc_number
        const { call_id, mc_number } = JSON.parse(body);
        console.log('🔍 MC number verification requested for call:', call_id, mc_number);

        // 2) validate format
        if (!mc_number || !/^\d+$/.test(mc_number)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: false, error: 'Invalid MC number format' }));
        }

        // 3) verify with FMCSA
        const { valid, carrierName } = await verifyMCNumber(mc_number);

        const { data, error: carrrierError } = await supabase
          .from('calls')
          .insert({call_id: call_id, carrier_name: carrierName, mc_number: mc_number})

        if (carrrierError)
          console.error('❌ Supabase insert error (carrier_name):', carrrierError);




        if (valid) {
          console.log(`✅ MC number verified for carrier: ${carrierName}`);

          // 5) store in-memory for this call’s session
          callStates[call_id] = {
            verifiedMC: true,
            carrierName,
            mcNumber: mc_number
          };

          // 6) respond success
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: true, carrierName }));
        } else {
          console.log('❌ MC number invalid or not active.');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: false }));
        }
      } catch (err) {
        console.error('❌ Error in /mc-number:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    });
  }

  // ✅ Existing webhook event handler
  else if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        console.log('✅ Webhook event received:', event.eventType);

        const { eventType, callId, payload } = event;
        const state = callStates[callId] || {};

        if (eventType === 'message.received' && payload) {
          const transcriptRaw =
            payload.transcript || payload['payload.transcript'];
          if (transcriptRaw) {
            let transcriptData;
            try {
              transcriptData = JSON.parse(transcriptRaw);
            } catch (err) {
              console.error('❌ Error parsing transcript JSON:', err);
            }

            if (Array.isArray(transcriptData)) {
              const userMessages = transcriptData.filter(
                (msg) => msg.role === 'user' && msg.content
              );

              if (userMessages.length > 0 && !state.verifiedMC) {
                const lastUserMsg = userMessages[userMessages.length - 1];
                const spokenText = lastUserMsg.content.trim();

                if (/^\d+$/.test(spokenText)) {
                  console.log('🔍 Attempting MC verification via webhook…', spokenText);
                  const { valid, carrierName } = await verifyMCNumber(spokenText);

                  if (valid) {
                    console.log(`✅ MC number verified for carrier: ${carrierName}`);
                    callStates[callId] = {
                      verifiedMC: true,
                      carrierName,
                      mcNumber: spokenText
                    };
                  } else {
                    console.log('❌ MC number invalid or not active.');
                  }
                }
              }
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } catch (err) {
        console.error('❌ Invalid JSON or error in processing:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad JSON');
      }
    });
  }

  // ✅ Existing load details endpoint
  else if (req.method === 'POST' && req.url === '/load-details') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { origin, destination } = JSON.parse(body);
        console.log('🔍 Load search requested:', { origin, destination });

        const matches = await searchLoads(origin, destination);

        if (matches.length === 0) {
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
        console.error('❌ Error in /load-details:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    });
  }

  // 🚀 New endpoint: Final Offer
  else if (req.method === 'POST' && req.url === '/final-offer') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { callId, finalOffer, mc_number } = JSON.parse(body);
        console.log(`MC number: ${mc_number}`);
        console.log(`💰 Final offer for call ${callId}: ${finalOffer} (MC: ${mc_number})`);

        const { error: offerError } = await supabase
          .from('calls')
          .update({
            call_id: callId,
            final_offer: finalOffer,
            mc_number: mc_number
          })
          .eq('call_id', callId);
        if (offerError)
          console.error('❌ Supabase insert error (final_offers):', offerError);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error('❌ Error in /final-offer:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    });
  }

  // 🚀 New endpoint: Call Outcome
  else if (req.method === 'POST' && req.url === '/call-outcome') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { callId, outcome, mc_number } = JSON.parse(body);
        console.log(`📞 Call outcome for ${callId}: ${outcome} (MC: ${mc_number})`);

        const callOutcome = {
          call_id: callId,
          outcome: outcome,
          mc_number: mc_number
        }

        const { data, error: outcomeError } = await supabase
          .from('calls')
          .update(callOutcome)
          .eq('call_id', callId);

        if (outcomeError)
          console.error('❌ Supabase insert error (call_outcomes):', outcomeError);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error('❌ Error in /call-outcome:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    });
  }

  // 🚀 New endpoint: Carrier Sentiment
  else if (req.method === 'POST' && req.url === '/carrier-sentiment') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { callId, sentiment, mc_number } = JSON.parse(body);
        console.log(`😊 Carrier sentiment for ${callId}: ${sentiment} (MC: ${mc_number})`);

        const carrierSentiment = {
          call_id: callId,
          sentiment: sentiment,
          mc_number: mc_number
        }

        const { error: sentimentError } = await supabase
          .from('calls')
          .update(carrierSentiment)
          .eq('call_id', callId);
        
        if (sentimentError)
          console.error('❌ Supabase insert error (carrier_sentiments):', sentimentError);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (err) {
        console.error('❌ Error in /carrier-sentiment:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
    });
  }

  // Default 404 for everything else
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}/webhook`);
  console.log(`✅ Server listening on http://localhost:${PORT}/load-details`);
  console.log(`✅ Server listening on http://localhost:${PORT}/mc-number`);
  console.log(`✅ Server listening on http://localhost:${PORT}/final-offer`);
  console.log(`✅ Server listening on http://localhost:${PORT}/call-outcome`);
  console.log(`✅ Server listening on http://localhost:${PORT}/carrier-sentiment`);
});
