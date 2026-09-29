#!/usr/bin/env python3
"""
Derive every still used on the site from the brand film itself.

    FFMPEG=/path/to/ffmpeg python3 scripts/extract-stills.py

Requires ffmpeg and Pillow (with AVIF + WebP support).
Frame times were chosen by edge-variance (sharpest frame inside each shot).
"""
import os
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FILM = ROOT / "public/videos/marmara-blue-hero.mp4"
OUT = ROOT / "public/images/stills"
POSTER = ROOT / "public/images/marmara-blue-poster.jpg"
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")

# id -> source time in seconds (keep in sync with src/data/film.js)
STILLS = {
    "wake": 0.9,
    "davul": 3.7,
    "arch": 5.1,
    "couple": 5.9,
    "silk": 7.1,
    "festoon": 9.1,
    "night": 11.7,
    "night-2": 12.3,
    "aerial": 15.5,
    "aerial-far": 16.7,
}
WIDTHS = (480, 720)


def grab(t: float) -> Image.Image:
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "f.png"
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t}",
             "-i", str(FILM), "-frames:v", "1", str(png)],
            check=True,
        )
        return Image.open(png).convert("RGB").copy()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    # Poster = the film's very first frame, so the fallback never "jumps".
    grab(0).save(POSTER, "JPEG", quality=82, optimize=True, progressive=True)

    for name, t in STILLS.items():
        frame = grab(t)
        for w in WIDTHS:
            h = round(frame.height * w / frame.width)
            im = frame if w == frame.width else frame.resize((w, h), Image.LANCZOS)
            base = OUT / f"{name}-{w}"
            im.save(f"{base}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
            im.save(f"{base}.webp", "WEBP", quality=78, method=6)
            im.save(f"{base}.avif", "AVIF", quality=60, speed=4)
        print(f"{name:<11} t={t:>5.2f}s  ok")


if __name__ == "__main__":
    main()
