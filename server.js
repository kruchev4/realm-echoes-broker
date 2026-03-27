const { PeerServer } = require('peer');
const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS for all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Realm of Echoes PeerJS Broker', peers: 0 });
});

// Create HTTP server explicitly
const server = http.createServer(app);

// Mount PeerJS — path must match what client sends
// Client uses path:'/' so PeerJS appends 'peerjs' → connects to /peerjs
const peerServer = PeerServer({
  server,
  path: '/peerjs',
  proxied: true,
  allow_discovery: false,
  concurrent_limit: 500,
  cleanup_out_msgs: 1000,
  alive_timeout: 60000,
  key: 'peerjs',
});

peerServer.on('connection', client => {
  console.log(`[+] peer: ${client.getId()}`);
});
peerServer.on('disconnect', client => {
  console.log(`[-] peer: ${client.getId()}`);
});

server.listen(PORT, () => {
  console.log(`PeerJS broker listening on port ${PORT}`);
});
