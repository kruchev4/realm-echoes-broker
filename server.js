const { ExpressPeerServer } = require('peer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

app.set('trust proxy', true);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Realm of Echoes PeerJS Broker' });
});

const server = app.listen(PORT, () => {
  console.log(`Broker running on port ${PORT}`);
});

// ExpressPeerServer attaches to the existing express server
// and handles WebSocket upgrades correctly through Render's proxy
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  proxied: true,
  allow_discovery: false,
  concurrent_limit: 500,
  alive_timeout: 60000,
  key: 'peerjs',
});

// Mount at /peerjs — client connects to /peerjs/peerjs
app.use('/peerjs', peerServer);

peerServer.on('connection', client => console.log(`[+] ${client.getId()}`));
peerServer.on('disconnect', client => console.log(`[-] ${client.getId()}`));
