import './style.css';

// import.meta.env.BASE_URL resolves asset paths correctly whether the site is
// served from the domain root or a /Etihad-Airlines/ subpath on GitHub Pages.
const BASE = import.meta.env.BASE_URL;

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Each page is ONE baked image. You only supply: two page images, the sticker
// gifs, and the videos. Swap these to reskin a city — nothing else changes.
const CONFIG = {
  wsUrl: 'wss://hybrid-websocket-df7faa7008b8.herokuapp.com',

  // The two full-screen artworks (clouds + logo + PARIS / the thank-you scene).
  page1Bg: `${BASE}img/bg1.png`,
  page2Bg: `${BASE}img/bg2.png`,

  // Scene area: a static placeholder image (no video). The websocket integer
  // still drives the city label below the logo.
  scenePlaceholder: `${BASE}img/scene-placeholder.svg`,

  // Red area: the side-scroll tray. ARRAY ORDER = icon id sent over the socket.
  // Add/remove freely; the arrows and dots adapt. Animated .gif works.
  stickers: [
    { src: `${BASE}stickers/26_06_26_Airplane.webp`,        alt: 'Airplane',          scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Apple.webp`,           alt: 'Apple',             scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Bag Phone.webp`,       alt: 'Bag Phone',         scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Bag Pizza.webp`,       alt: 'Bag Pizza',         scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Bag.webp`,             alt: 'Bag',               scale: 1.2 },
    { src: `${BASE}stickers/26_06_26_Bagget.webp`,          alt: 'Baguette',          scale: 1.2 },
    { src: `${BASE}stickers/26_06_26_Bobba.webp`,           alt: 'Boba',              scale: 1.7 },
    { src: `${BASE}stickers/26_06_26_Boxing.webp`,          alt: 'Boxing',            scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Bus.webp`,             alt: 'Bus',               scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Cloud.webp`,           alt: 'Cloud',             scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Dog.webp`,             alt: 'Dog',               scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Dumpling.webp`,        alt: 'Dumpling',          scale: 1.5 },
    { src: `${BASE}stickers/26_06_26_Elephant.webp`,        alt: 'Elephant',          scale: 1.2 },
    { src: `${BASE}stickers/26_06_26_Flower Pink.webp`,     alt: 'Flower Pink',       scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Flower White.webp`,    alt: 'Flower White',      scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Guard.webp`,           alt: 'Guard',             scale: 1.2 },
    { src: `${BASE}stickers/26_06_26_Heart.webp`,           alt: 'Heart',             scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Hot Air Balloon.webp`, alt: 'Hot Air Balloon',   scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Hot Dog Camera.webp`,  alt: 'Hot Dog Camera',    scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Liberty.webp`,         alt: 'Liberty',           scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Macaroon.webp`,        alt: 'Macaroon',          scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Mango.webp`,           alt: 'Mango',             scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Mime.webp`,            alt: 'Mime',              scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Peacock.webp`,         alt: 'Peacock',           scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Pretzil.webp`,         alt: 'Pretzel',           scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Rainbow.webp`,         alt: 'Rainbow',           scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Ramen.webp`,           alt: 'Ramen',             scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Sandwhich.webp`,       alt: 'Sandwich',          scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Star.webp`,            alt: 'Star',              scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Sun.webp`,             alt: 'Sun',               scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Surf.webp`,            alt: 'Surf',              scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Take.webp`,            alt: 'Take',              scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Ticket.webp`,          alt: 'Ticket',            scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Vacation Phone.webp`,  alt: 'Vacation Phone',    scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Vacation Starfish.webp`, alt: 'Vacation Starfish', scale: 1.0 },
    { src: `${BASE}stickers/26_06_26_Yellow Taxi.webp`,     alt: 'Yellow Taxi',       scale: 1.0 },
  ],

  appUrl: 'https://example.com/app', // download button target on page 2

  // Maps websocket integer → city name shown in the location label.
  cities: ['New York', 'Paris', 'London', 'Tokyo', 'Phuket', 'Mumbai'],

  locationIcon: `${BASE}img/Spot.png`,

  // Etihad VIBE logo, overlaid as its own element (a fixed distance from
  // top) so it stays put across devices. Remove it from page1Bg/page2Bg.
  logo: `${BASE}img/logo.png`,
};

// One-visit gate. Bump this string to re-open the experience for everyone.
const STORAGE_KEY = 'etihadVibeCompleted_v1';

// ── State ───────────────────────────────────────────────────────────────────
let dragged = null;
let nextStickerId = 0; // unique id per placed sticker; resets on Reset
let app = null;

// ── Boot ────────────────────────────────────────────────────────────────────
function boot() {
  app = document.getElementById('app');

  preventZoom();

  // ?reset clears the one-visit flag — handy for testing on the same device.
  if (new URLSearchParams(location.search).has('reset')) {
    localStorage.removeItem(STORAGE_KEY);
  }

  connect(); // websocket runs for the whole session; updateLocation() no-ops on page 2

  if (hasCompleted()) renderThanksPage();
  else renderStickerPage();
}

// iOS Safari ignores user-scalable=no, so kill the gestures explicitly:
// pinch-zoom, double-tap-to-zoom, and desktop ctrl/⌘ + wheel zoom.
function preventZoom() {
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((type) =>
    document.addEventListener(type, (e) => e.preventDefault(), { passive: false })
  );

  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch < 350) e.preventDefault(); // double-tap zoom
    lastTouch = now;
  }, { passive: false });

  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault(); // trackpad pinch / ctrl+wheel
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
      e.preventDefault();
    }
  });
}

function hasCompleted() {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
  catch { return false; }
}
function markCompleted() {
  try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* private mode */ }
}

// No separate thumbs for these stickers — use the same source image.
const thumbOf = (src) => src;

// ── Page 1: sticker builder ─────────────────────────────────────────────────
function renderStickerPage() {
  app.innerHTML = `
    <div class="page page-sticker" style="background-image:url('${CONFIG.page1Bg}')">
      <img class="brand-logo" src="${CONFIG.logo}" alt="Etihad VIBE" draggable="false">
      <div class="location-label" id="locationLabel" style="visibility:hidden">
        <img src="${CONFIG.locationIcon}" alt="">
        <span id="locationText"></span>
      </div>

      <div class="lower">
        <div id="scene" class="scene">
          <img class="scene-placeholder" src="${CONFIG.scenePlaceholder}" alt="" draggable="false">
        </div>

        <section class="sticker-panel">
          <h2>Drag your stickers!</h2>
          <div class="tray-row">
            <button class="tray-arrow" id="trayPrev" aria-label="Previous stickers">&#8249;</button>
            <div id="tray" class="tray"></div>
            <button class="tray-arrow" id="trayNext" aria-label="More stickers">&#8250;</button>
          </div>
          <div id="dots" class="dots"></div>
        </section>

        <div class="actions">
          <button id="resetBtn" class="btn btn-reset">Reset</button>
        </div>
      </div>
    </div>
  `;

  const scene = document.getElementById('scene');
  const tray = document.getElementById('tray');

  CONFIG.stickers.forEach((sticker, i) => {
    const el = document.createElement('div');
    el.className = 'sticker';
    // Tray uses a tiny static thumbnail (first frame). The heavy animated webp
    // is only loaded for the drag ghost and the placed sticker, so the tray
    // doesn't animate a dozen large files at once.
    el.innerHTML = `<img src="${thumbOf(sticker.src)}" alt="${sticker.alt}" draggable="false" loading="lazy" style="transform:scale(${sticker.scale ?? 1})">`;

    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const ghost = document.createElement('div');
      ghost.className = 'drag-ghost';
      ghost.innerHTML = `<img src="${sticker.src}" alt="${sticker.alt}" draggable="false" style="transform:scale(${sticker.scale ?? 1})">`;
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      document.body.appendChild(ghost);
      dragged = { icon: i, src: sticker.src, alt: sticker.alt, scale: sticker.scale, ghost };
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!dragged?.ghost) return;
      dragged.ghost.style.left = e.clientX + 'px';
      dragged.ghost.style.top = e.clientY + 'px';
    });

    el.addEventListener('pointerup', (e) => {
      if (!dragged) return;
      dragged.ghost?.remove();
      const rect = scene.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px >= 0 && py >= 0 && px <= rect.width && py <= rect.height) {
        const nx = px / rect.width;
        const ny = py / rect.height;
        const instanceId = nextStickerId++;
        placeSticker(scene, dragged, nx, ny, dragged.icon, instanceId);
        // message format: x y instanceId iconId
        sendSafe(`${nx.toFixed(4)} ${ny.toFixed(4)} ${instanceId} ${dragged.icon}`);
      }
      dragged = null;
    });

    el.addEventListener('pointercancel', () => { dragged?.ghost?.remove(); dragged = null; });

    tray.appendChild(el);
  });

  setupTrayNav();

  document.getElementById('resetBtn').addEventListener('click', () => {
    sendSafe('reset');
    scene.querySelectorAll('.placed-sticker').forEach((el) => el.remove());
    nextStickerId = 0;
  });
}

// Position is stored as a percentage of the scene so stickers survive a resize
// and stay aligned to the scaling stage.
function placeSticker(scene, sticker, nx, ny, iconId, instanceId) {
  const el = document.createElement('div');
  el.className = 'placed-sticker';
  el.dataset.icon = iconId;         // which sticker graphic
  el.dataset.instance = instanceId; // which placed instance (unique)
  el.style.left = (nx * 100) + '%';
  el.style.top = (ny * 100) + '%';
  el.innerHTML = `<img src="${sticker.src}" alt="${sticker.alt}" draggable="false" style="transform:scale(${sticker.scale ?? 1})">`;

  let moving = false;
  let lastSent = 0;

  // Throttled (~60ms) live position so TouchDesigner updates while dragging
  // without flooding the socket.
  function sendPos(nx2, ny2, force) {
    const now = performance.now();
    if (!force && now - lastSent < 60) return;
    lastSent = now;
    sendSafe(`${nx2.toFixed(4)} ${ny2.toFixed(4)} ${instanceId} ${iconId}`);
  }

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation(); // don't let the scene treat this as a new drop
    moving = true;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener('pointermove', (e) => {
    if (!moving) return;
    const rect = scene.getBoundingClientRect();
    const nx2 = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    const ny2 = Math.max(0, Math.min((e.clientY - rect.top) / rect.height, 1));
    el.style.left = (nx2 * 100) + '%';
    el.style.top = (ny2 * 100) + '%';
    sendPos(nx2, ny2, false);
  });

  el.addEventListener('pointerup', (e) => {
    if (!moving) return;
    moving = false;
    const rect = scene.getBoundingClientRect();
    const nx2 = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    const ny2 = Math.max(0, Math.min((e.clientY - rect.top) / rect.height, 1));
    sendPos(nx2, ny2, true); // force-send final resting position
  });

  el.addEventListener('pointercancel', () => { moving = false; });

  scene.appendChild(el);
}

// Replay every placed sticker to TD. Called on (re)connect, since TD clears its
// sticker slots whenever a fresh 'connected' arrives.
function resyncStickers() {
  const scene = document.getElementById('scene');
  if (!scene) return;
  scene.querySelectorAll('.placed-sticker').forEach((el) => {
    const nx = parseFloat(el.style.left) / 100;
    const ny = parseFloat(el.style.top) / 100;
    sendSafe(`${nx.toFixed(4)} ${ny.toFixed(4)} ${el.dataset.instance} ${el.dataset.icon}`);
  });
}

// ── Tray side-scroll: arrows + pagination dots ──────────────────────────────
function setupTrayNav() {
  const tray = document.getElementById('tray');
  const prev = document.getElementById('trayPrev');
  const next = document.getElementById('trayNext');
  const dots = document.getElementById('dots');

  const tileWidth = () => tray.querySelector('.sticker')?.getBoundingClientRect().width ?? tray.clientWidth / 4;
  prev.addEventListener('click', () => tray.scrollBy({ left: -tileWidth() * 4, behavior: 'smooth' }));
  next.addEventListener('click', () => tray.scrollBy({ left: tileWidth() * 4, behavior: 'smooth' }));

  const pageCount = () => Math.max(1, Math.round(tray.scrollWidth / tray.clientWidth));

  function renderDots() {
    const pages = pageCount();
    dots.innerHTML = pages <= 1
      ? ''
      : Array.from({ length: pages }, () => '<span class="dot"></span>').join('');
    updateState();
  }

  function updateState() {
    const max = tray.scrollWidth - tray.clientWidth;
    prev.disabled = tray.scrollLeft <= 2;
    next.disabled = tray.scrollLeft >= max - 2;
    const dotEls = dots.querySelectorAll('.dot');
    if (!dotEls.length) return;
    const active = max <= 0 ? 0 : Math.round((tray.scrollLeft / max) * (dotEls.length - 1));
    dotEls.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  tray.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', renderDots);
  renderDots();
  setTimeout(renderDots, 300); // settle after gifs load and change scrollWidth
}

// ── Page 2: thank you — single image + one button overlay ───────────────────
function renderThanksPage() {
  app.innerHTML = `
    <div class="page page-thanks" style="background-image:url('${CONFIG.page2Bg}')">
     
    </div>
  `;
}

// ── City label driven by the socket ─────────────────────────────────────────
// The integer the server sends selects the destination shown under the logo.
function updateLocation(n) {
  const city = CONFIG.cities[n];
  if (!city) return;
  const el = document.getElementById('locationText'); // absent on the thanks page
  if (el) {
    el.textContent = city;
    const label = document.getElementById('locationLabel');
    if (label) label.style.visibility = 'visible'; // reveal only after first real signal
  }
}

// ── WebSocket with heartbeat + auto-reconnect ───────────────────────────────
let socket = null;
let heartbeatTimer = null;
let reconnectTimer = null;

function connect() {
  socket = new WebSocket(CONFIG.wsUrl);

  socket.addEventListener('open', () => {
    socket.send('connected');
    startHeartbeat();
    resyncStickers(); // repopulate TD after it clears on 'connected'
  });

  socket.addEventListener('close', () => {
    stopHeartbeat();
    scheduleReconnect();
  });

  socket.addEventListener('error', (err) => {
    console.warn('socket error:', err); // a close event normally follows
  });

  socket.addEventListener('message', (e) => {
    const data = e.data.trim();
    console.log('raw message:', JSON.stringify(e.data));
    if (data === 'ping' || data === 'pong') return;

    // Remote trigger to finish the experience and jump to the thank-you page.
    if (data === 'customDone') {
      markCompleted();
      renderThanksPage();
      return;
    }

    const n = parseInt(data, 10);
    if (String(n) === data && n >= 0 && n < CONFIG.cities.length) {
      updateLocation(n);
    } else {
      console.log('server said:', e.data);
    }
  });
}

// Heroku closes connections idle for 55s; nudge every 30s to stay alive.
function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send('ping');
  }, 30000);
}
function stopHeartbeat() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}
function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => { reconnectTimer = null; connect(); }, 2000);
}

// Phones silently kill sockets when backgrounded; reconnect on return.
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
  if (socket && socket.readyState === WebSocket.OPEN) socket.send(msg);
  else console.warn('socket not open, dropped message:', msg);
}

boot();
