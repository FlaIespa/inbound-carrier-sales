// server/index.js

import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { verifyMCNumber } from './utils/fmcsa.js';
import { searchLoads } from './utils/loadsearch.js';

const callStates = {};
const PORT = process.env.PORT || 4000;

// Spoken-friendly number helper
function spokenNumber(n) {
  if (n === 1500) return "fifteen hundred";
  if (n === 1200) return "twelve hundred";
  if (n === 1750) return "seventeen fifty";
  if (n === 1000) return "one thousand";
  return n.toString(); // fallback for other numbers
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      let event;
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('Invalid JSON:', err);
        res.writeHead(400);
        return res.end('Bad JSON');
      }

      const { eventType, callId, payload } = event;
      let responseText = '';
      const state = callStates[callId] || {};

      console.log(`Event: ${eventType}, CallID: ${callId}, Current Stage: ${state.stage || 'none'}`);

      if (eventType === 'call.initiated') {
        if (!callStates[callId]) {
          callStates[callId] = { stage: 'awaiting_mc' };
        }
        responseText = 'Hello! Could you please provide your MC number so I can verify your eligibility to book loads?';
      }

      else if (eventType === 'message.received') {
        const transcript = payload.transcript || [];
        const text = (transcript.length > 0 ? transcript[transcript.length - 1].text : '').trim();
        console.log(`User: ${text}`);

        if (state.stage === 'awaiting_mc' && state.mcNumber) {
          responseText = `I have already verified your MC number (${state.mcNumber}). What route are you interested in today? Please say: "from [Origin] to [Destination]."`;
          state.stage = 'awaiting_search_criteria';
          callStates[callId] = state; // save updated state
        } else {
          switch (state.stage) {
            case 'awaiting_mc': {
              const mcNumber = text;
              const verification = await verifyMCNumber(mcNumber);
              if (verification.valid) {
                state.stage = 'awaiting_search_criteria';
                state.mcNumber = mcNumber;
                state.carrierName = verification.carrierName;
                responseText = `Thank you, ${verification.carrierName}! I have successfully verified your MC number and confirmed you’re eligible to book loads. ` +
                                `Now, what route are you interested in today? Please say: "from [Origin] to [Destination]."`;
              } else {
                responseText = 'I couldn’t verify your MC number. Could you please repeat it or provide another number?';
              }
              break;
            }

            case 'awaiting_search_criteria': {
              const lower = text.toLowerCase();
              const fromIndex = lower.indexOf('from ');
              const toIndex = lower.indexOf(' to ');
              if (fromIndex !== -1 && toIndex !== -1 && toIndex > fromIndex) {
                const origin = text.substring(fromIndex + 5, toIndex).trim();
                const destination = text.substring(toIndex + 4).trim();

                const matches = searchLoads(origin, destination);
                if (matches.length === 0) {
                  responseText = `I couldn’t find loads from ${origin} to ${destination}. Could you try another route?`;
                } else {
                  const load = matches[0];
                  state.stage = 'negotiating';
                  state.load = load;
                  state.negotiationRounds = 0;

                  const spokenRate = spokenNumber(load.loadboard_rate);
                  const spokenWeight = spokenNumber(load.weight);

                  responseText =
                    `Here are the details for load ${load.load_id}: ` +
                    `Origin: ${load.origin}. Destination: ${load.destination}. ` +
                    `Pickup on ${new Date(load.pickup_datetime).toLocaleString()}. Delivery on ${new Date(load.delivery_datetime).toLocaleString()}. ` +
                    `Equipment type: ${load.equipment_type}. ` +
                    `Rate: ${spokenRate} dollars. ` +
                    `Notes: ${load.notes}. ` +
                    `Weight: ${spokenWeight} pounds. ` +
                    `Commodity: ${load.commodity_type}. ` +
                    `Number of pieces: ${load.num_of_pieces}. ` +
                    `Miles: ${load.miles}. ` +
                    `Dimensions: ${load.dimensions}. ` +
                    `Would you like to accept this rate or make a counter offer?`;
                }
              } else {
                responseText = 'Could you please share the route in the format: "from [Origin] to [Destination]"?';
              }
              break;
            }

            case 'negotiating': {
              state.negotiationRounds++;
              const offer = parseInt(text.replace(/\D/g, '')) || null;

              if (/accept/i.test(text)) {
                responseText = 'Excellent! I’ll transfer you to a human sales rep to finalize the booking.';
                state.stage = 'transfer';
                state.agreementReached = true;
              } else if (offer) {
                const minAccept = state.load.loadboard_rate * 0.9;
                const maxAccept = state.load.loadboard_rate * 1.1;

                const offerSpoken = spokenNumber(offer);
                const targetSpoken = spokenNumber(state.load.loadboard_rate);

                if (offer >= minAccept && offer <= maxAccept) {
                  responseText = `Great! ${offerSpoken} dollars works for us. I’ll transfer you to a human sales rep to finalize the booking.`;
                  state.stage = 'transfer';
                  state.agreementReached = true;
                  state.carrierOffer = offer;
                } else if (state.negotiationRounds < 3) {
                  responseText = `Your offer of ${offerSpoken} dollars is noted. Could you meet me closer to ${targetSpoken} dollars?`;
                } else {
                  responseText = 'We’ve reached the maximum negotiation rounds. I’ll transfer you to a human sales rep to wrap this up.';
                  state.stage = 'transfer';
                  state.carrierOffer = offer;
                }
              } else {
                responseText = 'Could you please state an offer amount, or say "accept" to confirm the load?';
              }
              break;
            }

            case 'transfer': {
              responseText = 'Transferring you to a human sales rep now. Thank you!';
              break;
            }

            default: {
              responseText = 'I didn’t catch that. Could you please repeat?';
              break;
            }
          }

          callStates[callId] = state; // save updated state
        }
      }

      else if (eventType === 'call.ended') {
        console.log(`Call ${callId} ended. Final data:`, callStates[callId]);
        delete callStates[callId];
        responseText = 'Call ended. Goodbye!';
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ text: responseText }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}/webhook`);
});
