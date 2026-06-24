# Etihad VIBE — Interactive Sticker Experience

A single-page web app for an installation: visitors see a destination scene,
drag **stickers** onto it, and every action is streamed live over a **WebSocket**
to a TouchDesigner (TD) machine that renders the stickers on the big screen.

There is no framework — it's plain JavaScript + CSS bundled with **Vite**. Almost
everything you'll want to change lives in **one config block** at the top of
`src/main.js`.

---

## 1. Run it locally

```bash
npm install        # first time only
npm run dev        # start the dev server (prints a http://localhost:5173 URL)
```

Open the printed URL. Edits to `src/` reload instantly.

Other commands:

```bash
npm run build      # production build into dist/
npm run preview    # serve the built dist/ locally to sanity-check a build
```

Requirements: **Node 18+**. For the asset helper scripts you also need
**Python 3** with Pillow (`pip install Pillow`).

---

## 2. Project layout

```
Etihad-Airlines/
├─ index.html            ← page shell + <meta viewport> (zoom disabled here)
├─ vite.config.js        ← base: './' so it works under any subpath
├─ src/
│  ├─ main.js            ← ALL the logic + the CONFIG block (start here)
│  └─ style.css          ← all styling + the layout variables (:root)
├─ public/               ← static assets, copied to the site as-is
│  ├─ img/               ← backgrounds, logo, location pin, scene placeholder
│  ├─ stickers/          ← the animated sticker WebPs
│  │  └─ thumbs/         ← auto-generated static tray thumbnails (don't hand-edit)
│  └─ fonts/             ← EtihadAltis brand fonts
├─ scripts/              ← Python helpers (thumbnails, logo)
└─ dist/                 ← build output (generated; what gets deployed)
```

> Anything in `public/` is served at the site root. A file at
> `public/stickers/SUN.webp` is referenced in code as `stickers/SUN.webp`
> (prefixed with `BASE`, see below).

---

## 3. The CONFIG block (the one thing you edit most)

Top of `src/main.js`:

```js
const CONFIG = {
  wsUrl: 'wss://hybrid-websocket-df7faa7008b8.herokuapp.com',

  page1Bg: `${BASE}img/bg1.png`,   // sticker page background
  page2Bg: `${BASE}img/bg2.png`,   // thank-you page background

  scenePlaceholder: `${BASE}img/scene-placeholder.svg`, // image in the scene box

  stickers: [
    { src: `${BASE}stickers/BOBA.webp`, alt: 'Boba' },
    // …
  ],

  cities: ['New York', 'Paris', 'London', 'Tokyo', 'Phuket', 'Mumbai'],

  locationIcon: `${BASE}img/Spot.png`,
  logo: `${BASE}img/logo.png`,
};
```

`BASE` is `import.meta.env.BASE_URL` — it makes asset paths work whether the site
is served from the domain root or a subpath. **Always write paths as
`` `${BASE}folder/file.ext` ``** — never a leading `/`.

---

## 4. How to add / change content

### 4.1 Add or replace a sticker  ⚠️ two steps

1. Drop the animated `.webp` into `public/stickers/` (e.g. `public/stickers/PLANE.webp`).
2. **Regenerate the tray thumbnails** (the tray uses small static images for speed):

   ```bash
   python scripts/make_thumbs.py
   ```

3. Add an entry to `CONFIG.stickers` in `src/main.js`:

   ```js
   { src: `${BASE}stickers/PLANE.webp`, alt: 'Plane' },
   ```

> **Why the thumbnail step?** The tray must not animate a dozen large WebPs at
> once (it makes mobile very slow). The tray shows a tiny static first-frame
> thumbnail from `public/stickers/thumbs/`; the full animation is only used for
> the drag-ghost and the placed sticker. If you skip `make_thumbs.py`, the new
> sticker's tray tile will be a broken image.
>
> **Filename case matters.** The production server (Vercel/Linux) is
> case-sensitive. If the file is `PLANE.webp`, the config must say `PLANE.webp`,
> not `plane.webp`. (This already bit us once.)

**Sticker id:** the array index in `CONFIG.stickers` is the `iconId` sent to
TouchDesigner. Reordering the array remaps the ids — keep TD in sync.

### 4.2 Change the destinations / city names

Edit `CONFIG.cities`. The server sends an integer `n`; the app shows
`cities[n]` under the logo (e.g. `0` → "New York"). See §6.

### 4.3 Swap a background image

Replace `public/img/bg1.png` (sticker page) or `public/img/bg2.png` (thank-you
page). Keep them portrait. The logo is a **separate overlay** now — make sure
your backgrounds do **not** have the logo baked in (or you'll see two).

### 4.4 Change the logo

The logo is overlaid as its own element so it sits the same on every device.
Replace `public/img/logo.png` with the official transparent PNG, or regenerate
the placeholder from the brand font:

```bash
python scripts/make_logo.py
```

Position/size are controlled by CSS variables (`--logo-top`) and the `.brand-logo`
rule in `style.css` (see §5).

### 4.5 Change the scene placeholder image

Replace `public/img/scene-placeholder.svg` (the image shown in the big box).
Any image format works — update `CONFIG.scenePlaceholder` if you change the
filename/extension.

### 4.6 Change the headline / button text

The headline and the **Reset** button are plain text in `renderStickerPage()`
in `src/main.js` — edit them directly.

---

## 5. Layout & styling (`src/style.css`)

The whole experience is a fixed-aspect "stage" (`#app`). On phones it fills the
whole viewport (no letterbox bars); on desktop it's a centered portrait stage.

Tunable variables live in `:root` at the top of `style.css`:

| Variable           | Controls                                                |
| ------------------ | ------------------------------------------------------- |
| `--design-w/-h`    | Aspect ratio of your artwork (currently 1206×2622)      |
| `--logo-top`       | Logo distance from the top (px)                         |
| `--location-top`   | Vertical position of the "NEW YORK" label               |
| `--scene-top`      | Where the scene + panel + buttons column begins         |
| `--panel-side`     | Left/right inset of that column                          |
| `--actions-bottom` | Gap from the Reset button to the bottom edge            |
| `--tray-gap`       | Gap between sticker tiles (4 always fit per row)         |
| `--panel-bg`       | Sticker panel background (dark translucent)             |
| `--tile-bg`        | Sticker tile background (gray)                          |
| `--placed`         | On-screen size of a sticker dropped on the scene        |

Notes:
- **The scene, panel and buttons are one flex column** (`.lower`), so the buttons
  can never overlap the stickers regardless of screen height.
- **The tray always shows 4 columns × 2 rows** and scales the tiles to the
  width; extra stickers scroll horizontally (arrows + dots).
- Sizes use `cqw` (container units), so they scale with the stage.

---

## 6. WebSocket — where it is and how it works

**Where:** the URL is `CONFIG.wsUrl` at the top of `src/main.js`. All the socket
code is in the **"WebSocket with heartbeat + auto-reconnect"** section near the
bottom of the same file (`connect()`, `startHeartbeat()`, `sendSafe()`, …).

Current server: `wss://hybrid-websocket-df7faa7008b8.herokuapp.com` (Heroku). To
point at a different relay, change `wsUrl` — nothing else.

### Messages the app SENDS (to TouchDesigner)

| Message                          | When                                              |
| -------------------------------- | ------------------------------------------------- |
| `connected`                      | On (re)connect; TD clears its sticker slots       |
| `ping`                           | Every 30s heartbeat (Heroku idle-kills at ~55s)   |
| `<x> <y> <instanceId> <iconId>`  | A sticker is placed or dragged (positions are 0–1, throttled ~60ms) |
| `reset`                          | The **Reset** button is pressed                   |

`x y` are normalized (0–1) coordinates within the scene box. `iconId` is the
index into `CONFIG.stickers`. `instanceId` is a unique number per placed sticker.

### Messages the app RECEIVES (from the server)

| Message        | Effect                                                          |
| -------------- | -------------------------------------------------------------- |
| `0` … `N`      | Sets the destination label to `CONFIG.cities[n]`               |
| `customDone`   | Ends the experience → jumps to the thank-you page              |
| `ping`/`pong`  | Ignored (heartbeat)                                            |
| anything else  | Logged to the console                                          |

> There is **no Done button** in the UI anymore — the experience is finished by
> the operator/server sending **`customDone`**.

The socket auto-reconnects on drop and when the phone returns from background.

---

## 7. The "one-visit" gate

After completion the app stores `etihadVibeCompleted_v1` in `localStorage`, so
reloads land on the thank-you page.

- **Reopen on one device while testing:** visit the URL with `?reset` appended
  (e.g. `…vercel.app/?reset`). It clears the flag.
- **Reopen for everyone:** bump the `STORAGE_KEY` string in `src/main.js`.

---

## 8. Deploying

The site is hosted on **Vercel** (`etihad-airlines.vercel.app`). Pushing to the
connected GitHub branch triggers a build & deploy.

```bash
git add -A
git commit -m "Your change"
git push
```

After deploy, **hard-refresh** on test devices (mobile browsers cache
aggressively) to make sure you're seeing the new version.

The repo also includes a committed `dist/` build. If you change deployment, note
that `npm run build` regenerates it.

---

## 9. Gotchas / lessons learned

- **Filename case** must match exactly between the file, `CONFIG`, and any
  references — local Windows hides mismatches, the server does not.
- **Re-run `make_thumbs.py`** after every sticker change, or the tray tile breaks.
- **Don't bake the logo into the backgrounds** — it's a separate overlay now.
- **Animated WebPs are heavy.** Keep them reasonable; many large ones placed at
  once on the scene can still tax low-end phones.
- The original animated sticker files are never modified by the scripts — only
  `public/stickers/thumbs/` is (re)generated.

---

## 10. Quick reference: "I want to…"

| Task                         | Where                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| Add a sticker                | `public/stickers/` + `make_thumbs.py` + `CONFIG.stickers`       |
| Rename a destination         | `CONFIG.cities`                                                  |
| Change the WebSocket server  | `CONFIG.wsUrl`                                                   |
| Swap a background            | `public/img/bg1.png` / `bg2.png`                                |
| Replace the logo             | `public/img/logo.png` (or `make_logo.py`)                       |
| Move the logo / location     | `--logo-top` / `--location-top` in `style.css`                  |
| Edit headline / button text  | `renderStickerPage()` in `main.js`                              |
| Reset the one-visit gate     | `?reset` in URL, or bump `STORAGE_KEY`                          |
| Deploy                       | `git push` (Vercel auto-builds)                                 |
```
