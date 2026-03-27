const { PeerServer } = require('peer');
const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 10000;

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

const server = http.createServer(app);

// path:'/' means PeerJS WebSocket endpoint is at /peerjs
// which matches what the client connects to when client also uses path:'/'
const peerServer = PeerServer({
  server,
  path: '/',
  proxied: true,
  allow_discovery: false,
  concurrent_limit: 500,
  cleanup_out_msgs: 1000,
  alive_timeout: 60000,
  key: 'peerjs',
});

peerServer.on('connection', client => console.log(`[+] ${client.getId()}`));
peerServer.on('disconnect', client => console.log(`[-] ${client.getId()}`));

server.listen(PORT, () => console.log(`Broker on port ${PORT}`));
