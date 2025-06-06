// server/index.js

// 1. Load environment variables from server/.env
import http from 'http';
import { HappyRobotClient } from '@happyrobot-ai/happyrobot-js';
import dotenv from 'dotenv';
dotenv.config();

// 2. Initialize the HappyRobot client
const happyClient = new HappyRobotClient({
  apiKey: process.env.HAPPYROBOT_API_KEY,
  organizationId: process.env.HAPPYROBOT_ORG_ID,
});

// 3. In-memory store for call state (simple demo; use a DB for production)
const callStates = {};

// 4. Helper: Send a TTS message back to the caller
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

// 5. Create the HTTP server
const PORT = process.env.PORT || 4000;
const server = http.createServer(async (req, res) => {
  // Only accept POST /webhook
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    // Accumulate incoming data chunks
    req.on('data', (chunk) => {
      body += chunk;
    });

    // When the full body has arrived, parse JSON and handle it
    req.on('end', async () => {
      let event;
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('Invalid JSON in request body:', err);
        res.writeHead(400);
        return res.end('Bad JSON');
      }

      // 6. Immediately acknowledge receipt with 200 OK
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received' }));

      // 7. Handle the event asynchronously
      const { eventType, callId, payload } = event;
      console.log(`Received event: ${eventType} for callId: ${callId}`);

      if (eventType === 'call.initiated') {
        // Initialize call state and ask for MC number
        callStates[callId] = { stage: 'awaiting_mc', counterRounds: 0, transcriptChunks: [] };
        await sendMessageToCaller(callId, 'Hello! Please provide your MC number to verify eligibility.');
      } else if (eventType === 'message.received') {
        const text = payload.text.trim();
        console.log(`Call ${callId} user said: "${text}" (Current stage: ${callStates[callId]?.stage})`);
        // For now, we just log. Later we will branch based on stage.
      } else if (eventType === 'call.ended') {
        console.log(`Call ${callId} ended. Final state:`, callStates[callId]);
        delete callStates[callId];
      } else {
        console.log(`Unhandled eventType: ${eventType}`);
      }
    });
  } else {
    // Not the route we want, return 404
    res.writeHead(404);
    res.end();
  }
});

// 8. Start the server
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}/webhook`);
});
