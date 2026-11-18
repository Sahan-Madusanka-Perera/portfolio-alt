"""Cut the About photo out of its white studio background and save it as a transparent WebP.

Reuses the flood-fill mask from make-portrait.py. Run: python3 scripts/make-cutout.py
"""

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("make_portrait", ROOT / "scripts" / "make-portrait.py")
mp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mp)

img = Image.open(ROOT / "public" / "me" / "portrait.jpg").convert("RGB")
w, h = img.size
mask = mp.cut_out(img)
rgba = np.dstack([np.asarray(img), (mask * 255).astype(np.uint8)])
out = Image.fromarray(rgba, "RGBA").resize((900, round(900 * h / w)), Image.LANCZOS)
dest = ROOT / "public" / "me" / "portrait-cutout.webp"
out.save(dest, "WEBP", quality=82, method=6)
print(dest.name, out.size, dest.stat().st_size // 1024, "KB")
