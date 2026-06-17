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

// Prepared ahead of the user's tap so navigator.share() runs inside the
// gesture (required by Safari).
let preparedFile = null;

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
        placeSticker(scene, dragged.emoji, px, py);
        sendSafe(`${nx.toFixed(4)} ${ny.toFixed(4)} ${dragged.id}`);
      }
      dragged = null;
    });

    el.addEventListener('pointercancel', () => { dragged = null; });

    tray.appendChild(el);
  });

  saveBtn.addEventListener('click', () => sendSafe('save'));
  resetBtn.addEventListener('click', () => {
    sendSafe('reset');
    scene.querySelectorAll('.placed-sticker').forEach((el) => el.remove());
  });
}

function placeSticker(scene, emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'placed-sticker';
  el.textContent = emoji;
  el.style.position = 'absolute';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.transform = 'translate(-50%, -50%)';
  el.style.fontSize = '32px';
  el.style.userSelect = 'none';
  el.style.pointerEvents = 'none';
  scene.appendChild(el);
}

function playVideo(n) {
  const src = videoSources[n];
  if (!src) { console.warn('no video mapped for', n); return; }
  if (!player) { console.warn('player not on screen'); return; }
  player.src = src;
  player.play().catch((err) => console.warn('play blocked:', err));
}

// Fetch the video on page load and build a File, so the tap can share instantly.
function prepareFile(url) {
  preparedFile = null;
  const btn = document.getElementById('shareBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }

  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const ext = (url.split('.').pop().split('?')[0] || 'mp4').toLowerCase();
      const type = blob.type || (ext === 'mov' ? 'video/quicktime' : 'video/mp4');
      preparedFile = new File([blob], `sticker-video.${ext}`, { type });
      if (btn) { btn.disabled = false; btn.textContent = '⬇ Save to gallery'; }
    })
    .catch((err) => {
      console.warn('prepare failed:', err);
      if (btn) { btn.disabled = false; btn.textContent = '⬇ Open video'; }
    });
}

// Calls navigator.share() directly inside the tap (no await before it).
function onShareClick(url) {
  if (preparedFile && navigator.canShare && navigator.canShare({ files: [preparedFile] })) {
    navigator.share({ files: [preparedFile], title: 'Your video' })
      .catch((err) => { if (err && err.name !== 'AbortError') console.warn('share failed:', err); });
    return;
  }
  if (preparedFile) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(preparedFile);
    a.download = preparedFile.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    return;
  }
  window.open(url, '_blank');
}

function showDownloadPage(url) {
  player = null;
  document.body.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center;
                justify-content:center; min-height:80vh; gap:20px;
                font-family:sans-serif; text-align:center; padding:20px;">
      <h2>Your video is ready</h2>
      <video src="${url}" controls playsinline muted
             style="width:100%; max-width:400px; border-radius:8px; background:#000;"></video>
      <button id="shareBtn" disabled
         style="padding:14px 28px; font-size:18px; background:#0a84ff; color:#fff;
                border:none; border-radius:8px; cursor:pointer;">Preparing…</button>
      <button id="backBtn"
         style="padding:12px 24px; font-size:16px; background:#333; color:#fff;
                border:none; border-radius:8px; cursor:pointer;">← Back to start</button>
    </div>
  `;
  document.getElementById('shareBtn').addEventListener('click', () => onShareClick(url));
  document.getElementById('backBtn').addEventListener('click', init);
  prepareFile(url);
}

const socket = new WebSocket('wss://hybrid-websocket-df7faa7008b8.herokuapp.com');

socket.addEventListener('open', () => { console.log('connected'); socket.send('connected'); });
socket.addEventListener('close', () => console.log('socket closed'));
socket.addEventListener('error', (err) => console.warn('socket error:', err));

socket.addEventListener('message', (e) => {
  const data = e.data.trim();
  if (data.startsWith('https://pub-')) { showDownloadPage(data); return; }
  const n = parseInt(data, 10);
  if (String(n) === data && n >= 0 && n <= 10) {
    playVideo(n);
  } else {
    console.log('server said:', e.data);
  }
});

function sendSafe(msg) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    console.warn('socket not open, dropped message:', msg);
  }
}

init();