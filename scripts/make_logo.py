#!/usr/bin/env python3
"""
Render the "ETIHAD / VIBE" wordmark to public/img/logo.png (white, transparent).

The logo is overlaid by the app as its own element (a fixed distance from the
top) so it stays put across devices. It is NOT baked into the background images.
If you have the official logo artwork, just drop it in as public/img/logo.png
(transparent PNG) instead of running this.

    python scripts/make_logo.py

Requires Pillow:  pip install Pillow
"""
import os

from PIL import Image, ImageDraw, ImageFont

FONT = os.path.join("public", "fonts", "EtihadAltis-Medium_V3.ttf")
OUT = os.path.join("public", "img", "logo.png")
W, H = 1000, 460


def draw_spaced(draw, text, font, y, tracking, width, color=(255, 255, 255, 255)):
    widths = [draw.textlength(ch, font=font) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (width - total) / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=color)
        x += w + tracking


def main() -> None:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_spaced(d, "ETIHAD", ImageFont.truetype(FONT, 230), 40, 18, W)
    draw_spaced(d, "VIBE", ImageFont.truetype(FONT, 96), 310, 40, W)
    img.save(OUT)
    print("wrote", OUT, img.size)


if __name__ == "__main__":
    main()
