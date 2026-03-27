const { PeerServer } = require('peer');
const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 10000;

// Trust proxy - critical for Render
app.set('trust proxy', true);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Realm of Echoes PeerJS Broker' });
});

// Health check for UptimeRobot
app.get('/health', (req, res) => res.sendStatus(200));

const server = http.createServer(app);

const peerServer = PeerServer({
  server,
  path: '/',
  proxied: true,
  allow_discovery: false,
  concurrent_limit: 500,
  cleanup_out_msgs: 1000,
  alive_timeout: 60000,
  key: 'peerjs',
  ssl: {},  // Let Render handle SSL termination
});

peerServer.on('connection', client => console.log(`[+] ${client.getId()}`));
peerServer.on('disconnect', client => console.log(`[-] ${client.getId()}`));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PeerJS broker running on 0.0.0.0:${PORT}`);
});
