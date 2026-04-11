// Map of userId -> WebSocket connection
const clients = new Map();

function setupCallWs(wss) {
  wss.on('connection', (ws, req) => {
    // Extract userId from path: /ws/call/{userId}
    const userId = req.url.split('/').pop();
    if (!userId) return ws.close();

    clients.set(userId, ws);
    console.log(`Call WS connected: user ${userId}`);

    ws.on('message', (raw) => {
      try {
        const message = JSON.parse(raw);
        const { type, to } = message;

        if (!type || !to) return;

        // Forward signaling message to target user
        const targetWs = clients.get(String(to));
        if (targetWs && targetWs.readyState === 1) {
          targetWs.send(JSON.stringify({ ...message, from: userId }));
        }
      } catch (err) {
        console.error('Call WS message error:', err.message);
      }
    });

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`Call WS disconnected: user ${userId}`);
    });
  });
}

module.exports = setupCallWs;
