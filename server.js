const { PeerServer } = require('peer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS — allow requests from any origin (game is hosted on vpickplus.us)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

// Health check — Render uses this to confirm the server is alive
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Realm of Echoes PeerJS Broker' });
});

// Start HTTP server first, then mount PeerJS on it
const server = app.listen(PORT, () => {
  console.log(`Realm of Echoes broker running on port ${PORT}`);
});

// PeerJS mounted at /peerjs
const peerServer = PeerServer({
  server,
  path: '/peerjs',
  proxied: true,
  allow_discovery: false,
  concurrent_limit: 200,
  cleanup_out_msgs: 1000,
  alive_timeout: 60000,
  key: 'peerjs',
});

peerServer.on('connection', client => {
  console.log(`[+] ${client.getId()}`);
});
peerServer.on('disconnect', client => {
  console.log(`[-] ${client.getId()}`);
});
