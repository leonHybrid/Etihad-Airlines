# Asset drop-in guide

Each page is a single baked image. You only provide **two page artworks**, the
**sticker gifs**, and the **videos** — everything interactive is drawn on top by
the app. Paths resolve against `import.meta.env.BASE_URL`, so they work from the
domain root and from a `/Etihad-Airlines/` GitHub Pages subpath. Put files in
`public/`; edit only the `CONFIG` block at the top of `src/main.js`.

```
public/
├─ img/
│  ├─ page1.jpg          ← FULL page-1 artwork: clouds + ETIHAD VIBE logo + 📍 PARIS
│  │                       (leave the lower area empty — the scene, sticker panel
│  │                        and buttons are drawn on top by the app)
│  ├─ page2.jpg          ← FULL thank-you artwork: clouds + plane + headline +
│  │                       luggage etc. baked in (only the download button overlays)
│  └─ scene-poster.jpg   ← still shown in the video area before a video arrives
│
├─ stickers/             ← the side-scroll tray (animated .gif is fine)
│  ├─ sun.gif
│  ├─ wave.gif
│  └─ … (order in CONFIG.stickers = the icon id sent to TouchDesigner)
│
└─ videos/               ← the video area, driven by the websocket
   ├─ 0.mp4 … (CONFIG.videoCount - 1).mp4
```

## Lining overlays up with your artwork
Because the art is baked in, the app needs to know where the empty zones are.
All overlay positions are **CSS variables** at the top of `src/style.css`, as
percentages of the screen — nudge these until they sit in the right gaps:

```
--scene-top / --scene-left / --scene-width / --scene-height   (video area)
--panel-top / --panel-side                                    (sticker panel)
--actions-bottom / --actions-side                             (Reset / Done)
--dl-top / --dl-side                                          (download button)
--design-w / --design-h                                       (your art's aspect ratio)
```

Set `--design-w` / `--design-h` to your exported image's pixel size so the stage
matches the art's aspect exactly (currently iPhone 16/17 Pro, 1206×2622).

## Notes
- **One-visit gate:** tapping **Done** sets `etihadVibeCompleted_v1` in
  localStorage; every later visit lands on the thank-you page. Visit `?reset` to
  clear it while testing, or bump `STORAGE_KEY` to reopen for everyone.
- **Sticker ids:** array index in `CONFIG.stickers` is the `iconId` sent over the
  socket. Reorder = remap.
- **Live text** still rendered by the app (so it uses the Poppins webfont in
  `index.html`): "Select your stickers!", **Reset**, **Done**, and the download
  button label. Swap the font for the licensed Etihad face when you have it. If
  you'd rather bake the panel/buttons into `page1.jpg` too, say so and I'll switch
  those to image hit-areas.
