// server/index.js

import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { searchLoads } from './utils/loadsearch.js';
import { verifyMCNumber } from './utils/fmcsa.js';

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.MY_SECRET_API_KEY; // 🔐 Load the API key from environment variables

// In-memory call states: { callId: { verifiedMC: true, carrierName: string } }
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

  // 🔥 Dedicated endpoint for direct MC number verification
  if (req.method === 'POST' && req.url === '/mc-number') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { mc_number } = JSON.parse(body);
        console.log('🔍 MC number verification requested:', mc_number);

        if (!mc_number || !/^\d+$/.test(mc_number)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ valid: false, error: 'Invalid MC number format' }));
        }

        const { valid, carrierName } = await verifyMCNumber(mc_number);

        if (valid) {
          console.log(`✅ MC number verified for carrier: ${carrierName}`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: true, carrierName }));
        } else {
          console.log('❌ MC number invalid or not active.');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false }));
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
          const transcriptRaw = payload.transcript || payload['payload.transcript'];
          if (transcriptRaw) {
            let transcriptData;
            try {
              transcriptData = JSON.parse(transcriptRaw);
            } catch (err) {
              console.error('❌ Error parsing transcript JSON:', err);
            }

            if (transcriptData && Array.isArray(transcriptData)) {
              const userMessages = transcriptData.filter(
                (msg) => msg.role === 'user' && msg.content
              );

              if (userMessages.length > 0) {
                const lastUserMsg = userMessages[userMessages.length - 1];
                const spokenText = lastUserMsg.content.trim();

                if (!state.verifiedMC && /^\d+$/.test(spokenText)) {
                  console.log('🔍 Attempting MC verification…');
                  const { valid, carrierName } = await verifyMCNumber(spokenText);

                  if (valid) {
                    console.log(`✅ MC number verified for carrier: ${carrierName}`);
                    callStates[callId] = { verifiedMC: true, carrierName };
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
    req.on('end', () => {
      try {
        const { origin, destination } = JSON.parse(body);
        console.log('🔍 Load search requested:', { origin, destination });

        const matches = searchLoads(origin, destination);

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
});
