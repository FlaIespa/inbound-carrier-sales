import { getState, setState } from '../services/callStates.js';
import { verifyMCNumber } from '../utils/fmcsa.js';

/**
 * Controller for webhook events endpoint (/webhook)
 */
export default function webhookController(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const event = JSON.parse(body);
      console.log('Webhook event received:', event.eventType);

      const { eventType, callId, payload } = event;
      const state = getState(callId);

      if (eventType === 'message.received' && payload) {
        const transcriptRaw = payload.transcript || payload['payload.transcript'];
        if (transcriptRaw) {
          let transcriptData;
          try {
            transcriptData = JSON.parse(transcriptRaw);
          } catch (err) {
            console.error('Error parsing transcript JSON:', err);
          }

          if (Array.isArray(transcriptData)) {
            const userMessages = transcriptData.filter(
              msg => msg.role === 'user' && msg.content
            );

            if (userMessages.length > 0 && !state.verifiedMC) {
              const lastUserMsg = userMessages[userMessages.length - 1];
              const spokenText = lastUserMsg.content.trim();

              if (/^\d+$/.test(spokenText)) {
                console.log('Attempting MC verification via webhook:', spokenText);
                const { valid, carrierName } = await verifyMCNumber(spokenText);

                if (valid) {
                  console.log(`MC number verified for carrier: ${carrierName}`);
                  setState(callId, { verifiedMC: true, carrierName, mcNumber: spokenText });
                } else {
                  console.log('MC number invalid or not active.');
                }
              }
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } catch (err) {
      console.error('Invalid JSON or error processing webhook:', err);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad JSON');
    }
  });
}
