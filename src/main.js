import './style.css';

// import.meta.env.BASE_URL resolves asset paths correctly whether the site is
// served from the domain root or a /Etihad-Airlines/ subpath on GitHub Pages.
const BASE = import.meta.env.BASE_URL;

const startPageHTML = `
  <div id="scene" style="width:100%; height:300px; position:relative; overflow:hidden; background:#000;">
    <video id="player" muted playsinline loop
           style="width:100%; height:100%; object-fit:cover; display:block;"></video>
  </div>
  <div id="tray" style="margin-top:10px;"></div>
  <div id="controls" style="margin-top:10px;">
    <button id="saveBtn">Save</button>
    <button id="resetBtn">Reset</button>
  </div>
`;

let dragged = null;

const stickerList = ['⭐', '🟦', '❤️', '🟢', '☁️', '💎', '🌙', '🔺', '☀️', '❄️'];

// Files live in public/videos/ and are served at <base>videos/<n>.mp4
const videoSources = Array.from({ length: 11 }, (_, i) => `${BASE}videos/${i}.mp4`);

let player = null;

function init() {
  document.body.innerHTML = startPageHTML;

  const scene = document.getElementById('scene');
  player = document.getElementById('player');
  const tray = document.getElementById('tray');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  stickerList.forEach((emoji, i) => {
    const el = document.createElement('div');
    el.className = 'sticker';
    el.textContent = emoji;
    el.style.fontSize = '32px';
    el.style.display = 'inline-block';
    el.style.cursor = 'grab';
    el.style.touchAction = 'none';
    el.style.padding = '6px';
    el.style.userSelect = 'none';

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragged = { id: i, emoji };
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointerup', (e) => {
      if (!dragged) return;
      const rect = scene.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px >= 0 && py >= 0 && px <= rect.width && py <= rect.height) {
        const nx = px / rect.width;
        const ny = py / rect.height;
        console.log('dropped', dragged.emoji, 'at', nx.toFixed(4), ny.toFixed(4));
        placeSticker(scene, dragged.emoji, px, py, dragged.id);
        sendSafe(`${nx.toFixed(4)} ${ny.toFixed(4)} ${dragged.id}`);
      }
      dragged = null;
    });

    el.addEventListener('pointercancel', () => { dragged = null; });

    tray.appendChild(el);
  });

  // Save sends the save signal over the socket, then opens the email page.
  saveBtn.addEventListener('click', () => {
    sendSafe('save');
    showEmailPage();
  });
  resetBtn.addEventListener('click', () => {
    sendSafe('reset');
    scene.querySelectorAll('.placed-sticker').forEach((el) => el.remove());
  });
}

function placeSticker(scene, emoji, x, y, id) {
  const el = document.createElement('div');
  el.className = 'placed-sticker';
  el.textContent = emoji;
  el.dataset.id = id;            // remember which sticker this is, to re-send on move
  el.style.position = 'absolute';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.fontSize = '32px';
  el.style.userSelect = 'none';
  el.style.cursor = 'grab';
  el.style.touchAction = 'none';
  // pointerEvents stays default (auto) so the placed sticker can be grabbed.

  let moving = false;
  let lastSent = 0;             // timestamp throttle for live sends

  // Send the current normalized position, throttled to ~60ms so we update TD
  // live while dragging without flooding the socket.
  function sendPos(px, py, force) {
    const now = performance.now();
    if (!force && now - lastSent < 60) return;
    lastSent = now;
    const rect = scene.getBoundingClientRect();
    const nx = px / rect.width;
    const ny = py / rect.height;
    sendSafe(`${nx.toFixed(4)} ${ny.toFixed(4)} ${id}`);
  }

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();         // don't let the scene treat this as a new drop
    moving = true;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = 'grabbing';
  });

  el.addEventListener('pointermove', (e) => {
    if (!moving) return;
    const rect = scene.getBoundingClientRect();
    // clamp inside the scene so it can't be dragged off-frame
    const px = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const py = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    el.style.left = px + 'px';
    el.style.top = py + 'px';
    sendPos(px, py, false);      // live update to TD while dragging
  });

  el.addEventListener('pointerup', (e) => {
    if (!moving) return;
    moving = false;
    el.style.cursor = 'grab';
    const rect = scene.getBoundingClientRect();
    const px = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const py = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    sendPos(px, py, true);       // force-send final resting position
    console.log('moved', emoji, 'to', (px / rect.width).toFixed(4), (py / rect.height).toFixed(4));
  });

  el.addEventListener('pointercancel', () => { moving = false; el.style.cursor = 'grab'; });

  scene.appendChild(el);
}

function playVideo(n) {
  const src = videoSources[n];
  if (!src) { console.warn('no video mapped for', n); return; }
  if (!player) { console.warn('player not on screen'); return; }
  player.src = src;
  player.play().catch((err) => console.warn('play blocked:', err));
}

function showEmailPage() {
  // Don't wipe the body — overlay the email page on top so the scene and its
  // placed stickers stay alive underneath.
  if (document.getElementById('emailOverlay')) return; // already open

  const overlay = document.createElement('div');
  overlay.id = 'emailOverlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(255,255,255,0.97)';
  overlay.style.zIndex = '1000';
  overlay.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center;
                justify-content:center; min-height:100%; gap:20px;
                font-family:sans-serif; text-align:center; padding:20px;
                box-sizing:border-box;">
      <h2>Enter your email</h2>
      <input id="emailInput" type="email" inputmode="email" autocomplete="email"
             placeholder="you@example.com"
             style="padding:14px 16px; font-size:18px; width:100%; max-width:400px;
                    border:1px solid #ccc; border-radius:8px; box-sizing:border-box;" />
      <button id="sendBtn"
         style="padding:14px 28px; font-size:18px; background:#0a84ff; color:#fff;
                border:none; border-radius:8px; cursor:pointer;">Send</button>
      <p id="emailMsg" style="margin:0; min-height:20px; color:#0a84ff;"></p>
      <button id="backBtn"
         style="padding:12px 24px; font-size:16px; background:#333; color:#fff;
                border:none; border-radius:8px; cursor:pointer;">← Back to start</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#emailInput');
  const sendBtn = overlay.querySelector('#sendBtn');
  const msg = overlay.querySelector('#emailMsg');

  function submit() {
    const email = input.value.trim();
    // simple sanity check before sending
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.style.color = '#d00';
      msg.textContent = 'Please enter a valid email.';
      return;
    }
    sendSafe(`email ${email}`);
    msg.style.color = '#0a84ff';
    msg.textContent = 'Sent!';
    sendBtn.disabled = true;
  }

  sendBtn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  // Just close the overlay — the scene underneath (with stickers) is still there.
  overlay.querySelector('#backBtn').addEventListener('click', () => overlay.remove());
}

// ── WebSocket with heartbeat + auto-reconnect ──────────────────────────────
const WS_URL = 'wss://hybrid-websocket-df7faa7008b8.herokuapp.com';

let socket = null;
let heartbeatTimer = null;
let reconnectTimer = null;

function connect() {
  socket = new WebSocket(WS_URL);

  socket.addEventListener('open', () => {
    console.log('connected');
    socket.send('connected');
    startHeartbeat();
  });

  socket.addEventListener('close', () => {
    console.log('socket closed — reconnecting in 2s');
    stopHeartbeat();
    scheduleReconnect();
  });

  socket.addEventListener('error', (err) => {
    console.warn('socket error:', err);
    // an error is normally followed by a close event, which handles reconnect
  });

  socket.addEventListener('message', (e) => {
    const data = e.data.trim();
    if (data === 'ping' || data === 'pong') return; // ignore heartbeat echoes
    if (data.startsWith('https://pub-')) { showEmailPage(); return; }
    const n = parseInt(data, 10);
    if (String(n) === data && n >= 0 && n <= 10) {
      playVideo(n);
    } else {
      console.log('server said:', e.data);
    }
  });
}

// Heroku closes any connection idle for 55s. Push a tiny message every 30s
// to keep the router from treating it as idle.
function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send('ping');
    }
  }, 30000);
}

function stopHeartbeat() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}

function scheduleReconnect() {
  if (reconnectTimer) return; // already scheduled
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 2000);
}

// When the phone wakes / the tab comes back to the foreground, the socket has
// often died silently. Reconnect if it's not open.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      stopHeartbeat();
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      connect();
    }
  }
});

function sendSafe(msg) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    console.warn('socket not open, dropped message:', msg);
  }
}

connect();
init();