#!/usr/bin/env python3
"""
Generate the static tray thumbnails for every animated sticker.

The selection tray must NOT animate a dozen large WebP files at once (it makes
the page very slow on mobile). So the tray shows a tiny static thumbnail (the
first frame) of each sticker, while the full animated WebP is only loaded for
the drag-ghost and the sticker that gets placed on the scene.

Run this whenever you add or replace a file in public/stickers/.

    python scripts/make_thumbs.py

Requires Pillow:  pip install Pillow
"""
import glob
import os

from PIL import Image

STICKERS_DIR = os.path.join("public", "stickers")
THUMBS_DIR = os.path.join(STICKERS_DIR, "thumbs")
MAX_SIZE = (220, 220)   # thumbnails are displayed small; keep them tiny
QUALITY = 82


def main() -> None:
    os.makedirs(THUMBS_DIR, exist_ok=True)
    files = sorted(glob.glob(os.path.join(STICKERS_DIR, "*.webp")))
    if not files:
        print("No .webp stickers found in", STICKERS_DIR)
        return

    for path in files:
        im = Image.open(path)
        im.seek(0)                       # first frame only
        frame = im.convert("RGBA")
        frame.thumbnail(MAX_SIZE, Image.LANCZOS)
        out = os.path.join(THUMBS_DIR, os.path.basename(path))
        frame.save(out, "WEBP", quality=QUALITY, method=6)
        print(f"{os.path.basename(path):18} -> {out}  {os.path.getsize(out)//1024} KB")


if __name__ == "__main__":
    main()
