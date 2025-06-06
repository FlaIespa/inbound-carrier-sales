// server/index.js

// 1. Import core modules and load environment variables
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

// 2. Import the HappyRobot SDK (CommonJS package) as a default, then extract .default.HappyRobotClient
import HappyRobotSDK from '@happyrobot-ai/happyrobot-js';            // Default import from a CommonJS package :contentReference[oaicite:0]{index=0}
// When imported as an ES module, CommonJS modules typically put their “real” export under .default:
const HappyRobotClient = HappyRobotSDK.default;                       // Grab the actual constructor from the “default” property :contentReference[oaicite:1]{index=1}

// 3. Import MC verification utility
import { verifyMCNumber } from './utils/fmcsa.js';

// 4. Instantiate the HappyRobot client using your API key & Organization ID
const happyClient = new HappyRobotClient({
  apiKey: process.env.HAPPYROBOT_API_KEY,      // e.g., "b7fa2590..." :contentReference[oaicite:2]{index=2}
  organizationId: process.env.HAPPYROBOT_ORG_ID // e.g., "019742b6-..." :contentReference[oaicite:3]{index=3}
});

// 5. In-memory object to track each call's state
const callStates = {};

// 6. Helper function to send a TTS message to the caller
async function sendMessageToCaller(callId, message) {
  try {
    await happyClient.sendMessage({
      callId,
      message,
    });
  } catch (err) {
    console.error('Error sending message to caller:', err);
  }
}

// 7. Create and start the HTTP server to listen for HappyRobot webhooks
const PORT = process.env.PORT || 4000;
const server = http.createServer(async (req, res) => {
  // Only handle POST requests to /webhook
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    // Accumulate data chunks
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

      // Immediately acknowledge receipt (HTTP 200)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received' }));

      const { eventType, callId, payload } = event;
      console.log(`Received event: ${eventType} for callId: ${callId}`);

      if (eventType === 'call.initiated') {
        // Step 1: New call—ask for MC number
        callStates[callId] = { stage: 'awaiting_mc', counterRounds: 0, transcriptChunks: [] };
        await sendMessageToCaller(callId, 'Hello! Please provide your MC number to verify eligibility.');
      } else if (eventType === 'message.received') {
        // Step 2: Handle incoming speech (text) from the caller
        const text = payload.text.trim();
        const state = callStates[callId];
        const currentStage = state?.stage;
        console.log(`Call ${callId} said: "${text}" (Stage: ${currentStage})`);

        if (currentStage === 'awaiting_mc') {
          // Extract digits only (e.g., "MC 12345" → "12345")
          const mcNumber = text.replace(/\D/g, '');
          console.log(`Verifying MC number: ${mcNumber}`);

          // Call the FMCSA utility to verify Active authority
          const verification = await verifyMCNumber(mcNumber);
          if (!verification.valid) {
            // Invalid MC: inform the caller and hang up
            await sendMessageToCaller(callId, 'Sorry, we could not verify your MC number or you are not authorized. Goodbye.');
            try {
              await happyClient.hangup({ callId });
            } catch (err) {
              console.error('Error hanging up:', err);
            }
            delete callStates[callId];
          } else {
            // Valid MC: move to load search stage and ask for origin/destination
            state.stage = 'awaiting_search_criteria';
            state.mcNumber = mcNumber;
            state.carrierName = verification.carrierName;
            await sendMessageToCaller(
              callId,
              `Thanks, ${verification.carrierName}. Which load origin and destination are you interested in?`
            );
          }
        } else {
          // Other stages (e.g., awaiting_search_criteria) will be implemented next
          console.log(`Ignoring message; current stage is ${currentStage}`);
        }
      } else if (eventType === 'call.ended') {
        // Step 3: Clean up state on call end
        console.log(`Call ${callId} ended. State:`, callStates[callId]);
        delete callStates[callId];
      } else {
        // Unhandled event types
        console.log(`Unhandled eventType: ${eventType}`);
      }
    });
  } else {
    // Return 404 for any other route/method
    res.writeHead(404);
    res.end();
  }
});

// Start listening on the specified port
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}/webhook`);
});
