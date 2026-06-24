# Asset drop-in guide

> ⚠️ This file is superseded by **[README.md](./README.md)**, which documents the
> current setup (separate logo overlay, static scene placeholder instead of
> video, `customDone` to finish, the thumbnail step for stickers, etc.).

Quick pointers — see the README for the full detail:

```
public/
├─ img/
│  ├─ bg1.png                ← sticker-page background (NO logo baked in)
│  ├─ bg2.png                ← thank-you-page background (NO logo baked in)
│  ├─ logo.png               ← ETIHAD VIBE logo, overlaid by the app
│  ├─ Spot.png               ← location pin icon
│  └─ scene-placeholder.svg  ← image shown in the scene box
│
├─ stickers/                 ← animated sticker WebPs (order = icon id to TD)
│  └─ thumbs/                ← static tray thumbnails — run scripts/make_thumbs.py
│
└─ fonts/                    ← EtihadAltis brand fonts
```

- **Add a sticker:** drop the `.webp` in `public/stickers/`, run
  `python scripts/make_thumbs.py`, then add it to `CONFIG.stickers` in
  `src/main.js`. Filename case must match exactly.
- **Layout nudging:** CSS variables at the top of `src/style.css` (see README §5).
- **WebSocket:** `CONFIG.wsUrl` in `src/main.js` (see README §6).
- **One-visit gate:** `?reset` in the URL, or bump `STORAGE_KEY` (see README §7).
