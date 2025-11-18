// Minimal Node + WebSocket server that serves static files and relays player state.
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory state
const players = new Map(); // id -> {x,y,angle,hp}
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', function connection(ws) {
  const id = (Math.random() + 1).toString(36).substr(2,9);
  players.set(id, { x: 300, y: 200, angle: 0, hp: 100 });
  ws.send(JSON.stringify({ type: 'init', id, players: Object.fromEntries(players) }));
  broadcast({ type: 'players', players: Object.fromEntries(players) });

  ws.on('message', function incoming(message) {
    let data;
    try { data = JSON.parse(message); } catch(e){ return; }
    if (data.type === 'update') {
      const p = players.get(id);
      if (!p) return;
      p.x = data.x; p.y = data.y; p.angle = data.angle; p.hp = data.hp ?? p.hp;
      broadcast({ type: 'players', players: Object.fromEntries(players) });
    }
    if (data.type === 'shoot') {
      // relay shots to all clients
      broadcast({ type: 'shoot', id, x: data.x, y: data.y, vx: data.vx, vy: data.vy });
    }
  });

  ws.on('close', () => {
    players.delete(id);
    broadcast({ type: 'players', players: Object.fromEntries(players) });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
