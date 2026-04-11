const pool = require('../config/db');

// Map of userId -> WebSocket connection
const clients = new Map();

function setupChatWs(wss) {
  wss.on('connection', (ws, req) => {
    // Extract userId from path: /ws/chat/{userId}
    const userId = req.url.split('/').pop();
    if (!userId) return ws.close();

    clients.set(userId, ws);
    console.log(`Chat WS connected: user ${userId}`);

    ws.on('message', async (raw) => {
      try {
        const { sender, receiver, content } = JSON.parse(raw);
        if (!sender || !receiver || !content) return;

        // Persist message
        const { rows } = await pool.query(
          `INSERT INTO chat_messages (sender_id, receiver_id, content, created_at)
           VALUES ($1, $2, $3, NOW()) RETURNING id, sender_id AS sender, receiver_id AS receiver, content, created_at AS timestamp`,
          [sender, receiver, content]
        );
        const message = rows[0];

        // Deliver to receiver if online
        const receiverWs = clients.get(String(receiver));
        if (receiverWs && receiverWs.readyState === 1) {
          receiverWs.send(JSON.stringify(message));
        }

        // Echo back to sender with timestamp
        ws.send(JSON.stringify(message));
      } catch (err) {
        console.error('Chat WS message error:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`Chat WS disconnected: user ${userId}`);
    });
  });
}

module.exports = setupChatWs;
module.exports.clients = clients;
