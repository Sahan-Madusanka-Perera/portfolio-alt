"""Turn public/me/portrait.jpg into the particle portrait the hero draws.

    uv venv scripts/.venv --python 3.12
    uv pip install --python scripts/.venv torch transformers pillow numpy
    scripts/.venv/bin/python scripts/make-portrait.py

Steps
  1. Cut the subject out of its white background (flood fill from the borders, so bright skin
     highlights inside the figure are kept), then feather the mask a little.
  2. Estimate relative depth with Depth Anything V2 Small (runs locally; the photo never leaves
     the machine, only the model weights are downloaded once from Hugging Face).
  3. Sample points with a probability that favours detail: luminance edges (eyes, hair, collar)
     get more points than flat cloth. Each point keeps its position, depth and brightness.
  4. Write two binary files, a 48k set for desktop and a 20k set for phones, plus two poster
     images (one per theme) that show the same points as a still, for reduced motion, weak
     devices and the first paint.

Binary layout (little endian), shuffled so any prefix is an even sample:
    magic "PPT1" | uint32 count | int16 xyz[count*3] (scaled by 32767) | uint8 lum[count]
x and y are in [-1, 1] with y up and the image aspect kept (x spans [-aspect, aspect] / max);
z is in [-1, 1], larger is nearer the viewer.
"""

from __future__ import annotations

import struct
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "me" / "portrait.jpg"
OUT = ROOT / "public" / "me"
SIZES = {"portrait-48k.bin": 48_000, "portrait-20k.bin": 20_000}
WORK_W = 720  # working resolution; depth runs at this size
SEED = 7


def cut_out(img: Image.Image) -> np.ndarray:
    """Mask of the subject: 1 inside, 0 for the white background connected to the border."""
    marker = (255, 0, 255)
    flood = img.copy()
    w, h = flood.size
    # Seed the fill along every border pixel that is near white.
    arr = np.asarray(img).astype(np.int16)
    for x, y in [(x, 0) for x in range(0, w, 6)] + [(x, h - 1) for x in range(0, w, 6)] + [(0, y) for y in range(0, h, 6)] + [(w - 1, y) for y in range(0, h, 6)]:
        r, g, b = arr[y, x]
        if min(r, g, b) > 225 and flood.getpixel((x, y)) != marker:
            ImageDraw.floodfill(flood, (x, y), marker, thresh=38)
    f = np.asarray(flood)
    bg = (f[..., 0] == 255) & (f[..., 1] == 0) & (f[..., 2] == 255)
    mask = Image.fromarray((~bg * 255).astype(np.uint8))
    # Close pinholes, then feather the edge so the outline dissolves rather than cuts.
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(2.2))
    return np.asarray(mask).astype(np.float32) / 255.0


def estimate_depth(img: Image.Image) -> np.ndarray:
    from transformers import pipeline

    pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
    depth = pipe(img)["predicted_depth"]
    d = depth.squeeze().detach().cpu().numpy().astype(np.float32)
    d = np.asarray(Image.fromarray(d).resize(img.size, Image.BICUBIC))
    return d  # relative inverse depth: larger means nearer


def detail_weight(gray: np.ndarray) -> np.ndarray:
    gx = np.zeros_like(gray)
    gy = np.zeros_like(gray)
    gx[:, 1:-1] = gray[:, 2:] - gray[:, :-2]
    gy[1:-1, :] = gray[2:, :] - gray[:-2, :]
    mag = np.sqrt(gx * gx + gy * gy)
    mag8 = np.clip(mag / (np.percentile(mag, 99) + 1e-6) * 255, 0, 255).astype(np.uint8)
    mag8 = np.asarray(Image.fromarray(mag8).filter(ImageFilter.GaussianBlur(1.5)))
    return mag8.astype(np.float32) / 255.0


def local_tone(gray: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Brightness for each particle. The photo is lit from the front and the face is close to
    white, so plain luminance flattens the eyes and mouth. Local contrast (the pixel against a
    blurred neighbourhood) brings the features back; a floor keeps dark hair and cloth visible."""
    g8 = (gray * 255).astype(np.uint8)
    blur = np.asarray(Image.fromarray(g8).filter(ImageFilter.GaussianBlur(14))).astype(np.float32) / 255.0
    local = gray - blur
    inside = mask > 0.5
    base = (gray - np.percentile(gray[inside], 5)) / (np.percentile(gray[inside], 99) - np.percentile(gray[inside], 5) + 1e-6)
    t = 0.55 * np.clip(base, 0, 1) + 0.45 * np.clip(0.5 + local * 5.0, 0, 1)
    t = np.clip(t, 0, 1) ** 1.35
    return np.clip(0.1 + 0.9 * t, 0, 1)


def main() -> None:
    rng = np.random.default_rng(SEED)
    src = Image.open(SRC).convert("RGB")
    scale = WORK_W / src.width
    img = src.resize((WORK_W, round(src.height * scale)), Image.LANCZOS)
    w, h = img.size

    mask = cut_out(img)
    print(f"mask covers {mask.mean():.1%} of the frame")

    cache = ROOT / "scripts" / ".cache" / "portrait-depth.npy"
    if cache.exists() and np.load(cache).shape == (h, w):
        depth = np.load(cache)
    else:
        depth = estimate_depth(img)
        cache.parent.mkdir(parents=True, exist_ok=True)
        np.save(cache, depth)
    inside = mask > 0.5
    lo, hi = np.percentile(depth[inside], [2, 98])
    z = np.clip((depth - lo) / (hi - lo + 1e-6), 0, 1) * 2 - 1  # [-1, 1], near = +1

    gray = np.asarray(img.convert("L")).astype(np.float32) / 255.0
    tone = local_tone(gray, mask)
    weight = mask * (0.28 + 0.72 * detail_weight(gray))
    # Faces read through the eyes: a soft extra weight on the upper third of the subject.
    ys = np.linspace(0, 1, h)[:, None]
    weight *= 1.0 + 1.1 * np.exp(-((ys - 0.36) ** 2) / 0.018)
    # The body dissolves towards the bottom of the frame, so the eye goes to the face.
    t = np.clip((ys - 0.58) / 0.42, 0, 1)
    weight *= 1.0 - 0.88 * (t * t * (3 - 2 * t))
    p = (weight / weight.sum()).ravel()

    n_max = max(SIZES.values())
    idx = rng.choice(p.size, size=n_max, replace=False, p=p)
    py, px = np.divmod(idx, w)
    # Jitter inside the pixel so the grid never shows.
    fx = px + rng.random(n_max)
    fy = py + rng.random(n_max)

    m = max(w, h)
    x = (fx / w * 2 - 1) * (w / m)
    y = -(fy / h * 2 - 1) * (h / m)
    zz = z[py, px]
    lum = tone[py, px]

    order = rng.permutation(n_max)
    x, y, zz, lum = x[order], y[order], zz[order], lum[order]

    for name, count in SIZES.items():
        xyz = np.stack([x[:count], y[:count], zz[:count]], axis=1)
        q = np.round(np.clip(xyz, -1, 1) * 32767).astype("<i2")
        l8 = np.round(lum[:count] * 255).astype(np.uint8)
        with open(OUT / name, "wb") as f:
            f.write(b"PPT1")
            f.write(struct.pack("<I", count))
            f.write(q.tobytes())
            f.write(l8.tobytes())
        print(f"wrote {name}: {count} points, {(OUT / name).stat().st_size / 1024:.0f} KB")

    # Posters: the 48k set drawn as the WebGL scene draws it, one per theme, transparent.
    # Dark theme: bright points where the face is bright. Light theme: ink where it is dark.
    for theme in ("dark", "light"):
        pw, ph = 560, round(560 * h / w)
        n_poster = 30_000
        k = 2
        poster = Image.new("RGBA", (pw * k, ph * k), (0, 0, 0, 0))
        draw = ImageDraw.Draw(poster)
        sx = (x * m / w + 1) / 2 * pw * k
        sy = (-y * m / h + 1) / 2 * ph * k
        ink = (236, 233, 226) if theme == "dark" else (20, 20, 19)
        for i in range(n_poster):
            a = lum[i] if theme == "dark" else 1.0 - lum[i]
            r = (1.0 + 0.6 * (zz[i] + 1) / 2) * k * 0.72
            draw.ellipse((sx[i] - r, sy[i] - r, sx[i] + r, sy[i] + r), fill=(*ink, int(255 * (0.08 + 0.92 * a))))
        poster = poster.resize((pw, ph), Image.LANCZOS)
        path = OUT / f"portrait-poster-{theme}.webp"
        poster.save(path, "WEBP", quality=60, method=6)
        print(f"wrote {path.name}: {path.stat().st_size / 1024:.0f} KB")

if __name__ == "__main__":
    main()
