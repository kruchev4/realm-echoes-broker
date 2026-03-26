const { PeerServer } = require('peer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 9000;

// Health check endpoint (Render needs this to know the server is alive)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Realm of Echoes PeerJS Broker',
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Realm of Echoes broker running on port ${PORT}`);
});

// Mount PeerJS on /peerjs path
const peerServer = PeerServer({
  server,
  path: '/peerjs',
  allow_discovery: false,
  proxied: true,            // important — Render sits behind a proxy
  concurrent_limit: 200,   // free tier is plenty for this game
  cleanup_out_msgs: 1000,
});

peerServer.on('connection', client => {
  console.log(`[+] peer connected: ${client.getId()}`);
});
peerServer.on('disconnect', client => {
  console.log(`[-] peer disconnected: ${client.getId()}`);
});
