// Minimal client for the multiplayer shooter.
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
let ws;
let myId = null;
const players = {}; // id -> {x,y,angle,hp}
const bullets = []; // {x,y,vx,vy,ttl}

function connect() {
  const loc = window.location;
  const wsurl = (loc.protocol === 'https:' ? 'wss://' : 'ws://') + loc.host;
  ws = new WebSocket(wsurl);
  ws.onopen = () => statusEl.textContent = 'conectado';
  ws.onmessage = (ev) => {
    const data = JSON.parse(ev.data);
    if (data.type === 'init') {
      myId = data.id;
      Object.assign(players, data.players);
    } else if (data.type === 'players') {
      // replace
      Object.keys(players).forEach(k=>delete players[k]);
      Object.assign(players, data.players);
    } else if (data.type === 'shoot') {
      bullets.push({x:data.x,y:data.y,vx:data.vx,vy:data.vy,ttl:200});
    }
  };
  ws.onclose = () => statusEl.textContent = 'desconectado — recarregue para reconectar';
}

// input
const input = {up:false,down:false,left:false,right:false};
window.addEventListener('keydown', e => {
  if (e.key==='w') input.up=true;
  if (e.key==='s') input.down=true;
  if (e.key==='a') input.left=true;
  if (e.key==='d') input.right=true;
});
window.addEventListener('keyup', e => {
  if (e.key==='w') input.up=false;
  if (e.key==='s') input.down=false;
  if (e.key==='a') input.left=false;
  if (e.key==='d') input.right=false;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const me = players[myId];
  if (!me) return;
  const dx = mx - me.x, dy = my - me.y;
  const mag = Math.hypot(dx,dy) || 1;
  const speed = 8;
  const vx = dx/mag*speed, vy = dy/mag*speed;
  // local bullet
  bullets.push({x: me.x + vx, y: me.y + vy, vx, vy, ttl:200});
  if (ws && ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({type:'shoot', x: me.x, y: me.y, vx, vy}));
});

function update(dt) {
  // simple local control for my player
  const me = players[myId];
  if (me) {
    const speed = 200 * dt;
    if (input.up) me.y -= speed;
    if (input.down) me.y += speed;
    if (input.left) me.x -= speed;
    if (input.right) me.x += speed;
    // send update
    if (ws && ws.readyState===WebSocket.OPEN) {
      ws.send(JSON.stringify({type:'update', x: me.x, y: me.y, angle: 0, hp: me.hp}));
    }
  }
  // update bullets
  for (let i = bullets.length-1; i>=0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.ttl--;
    if (b.ttl<=0) bullets.splice(i,1);
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background grid
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // players
  for (const id in players) {
    const p = players[id];
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
    ctx.fillStyle = (id===myId) ? '#7fffd4' : '#ffcc00';
    ctx.fill();
    // name/id
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(id === myId ? 'Você' : id, p.x-14, p.y-20);
    // hp bar
    ctx.fillStyle = '#000';
    ctx.fillRect(p.x-16, p.y+16, 32, 4);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(p.x-16, p.y+16, 32 * (p.hp/100 || 1), 4);
  }
  // bullets
  for (const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

let last = performance.now();
function loop(now) {
  const dt = (now - last)/1000;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

connect();
requestAnimationFrame(loop);
