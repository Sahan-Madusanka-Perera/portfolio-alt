"""Lint the architecture diagrams in src/data/projects.ts: boxes inside the 1000x560 viewBox,
no overlapping boxes, every edge label fits its visible segment, no label pill over a box.
Mirrors the sizing in src/components/work/ArchitectureDiagram.tsx."""
import math, re, sys
from pathlib import Path

src = (Path(__file__).resolve().parent.parent / "src/data/projects.ts").read_text()
W, H, NH = 1000, 560, 66
def width(label, sub): return min(270, max(176, len(label) * 8.4 + 36, len(sub or "") * 7.85 + 32))
problems = 0
for m in re.finditer(r'slug: "([^"]+)"', src):
    slug = m.group(1)
    ns = src.index("nodes: [", m.end()); ne = src.index("\n      ],", ns)
    es = src.index("edges: [", ne); ee = src.index("\n      ],", es)
    nodes = {i: (l, sb, float(x), float(y)) for i, l, sb, x, y in re.findall(r'\{ id: "([^"]+)", label: "([^"]+)"(?:, sub: "([^"]*)")?, x: (\d+), y: (\d+)', src[ns:ne])}
    boxes = {i: (x - width(l, sb) / 2, x + width(l, sb) / 2, y - NH / 2, y + NH / 2) for i, (l, sb, x, y) in nodes.items()}
    def report(msg):
        global problems
        problems += 1
        print(f"{slug}: {msg}")
    for i, (x0, x1, y0, y1) in boxes.items():
        if x0 < 0 or x1 > W or y0 < 0 or y1 > H: report(f"{i} outside the viewBox")
        for j, (a0, a1, b0, b1) in boxes.items():
            if i < j and x0 < a1 and a0 < x1 and y0 < b1 and b0 < y1: report(f"{i} overlaps {j}")
    for f, t, lab in re.findall(r'\{ from: "([^"]+)", to: "([^"]+)"(?:, label: "([^"]+)")?', src[es:ee]):
        a, b = nodes[f], nodes[t]
        for k in range(1, 40):
            px, py = a[2] + (b[2] - a[2]) * k / 40, a[3] + (b[3] - a[3]) * k / 40
            for i, (x0, x1, y0, y1) in boxes.items():
                if i not in (f, t) and x0 - 4 < px < x1 + 4 and y0 - 4 < py < y1 + 4:
                    report(f"edge {f} to {t} runs behind {i}")
                    break
            else:
                continue
            break
        if not lab: continue
        def exit_pt(a, b, pad):
            dx, dy = b[2] - a[2], b[3] - a[3]
            hw, hh = width(a[0], a[1]) / 2 + pad, NH / 2 + pad
            k = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
            return a[2] + dx * k, a[3] + dy * k
        p1, p2 = exit_pt(a, b, 6), exit_pt(b, a, 10)
        mx, my = (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2
        lw = len(lab) * 7.9 + 20
        pill = (mx - lw / 2, mx + lw / 2, my - 12, my + 12)
        for i, (x0, x1, y0, y1) in boxes.items():
            if pill[0] < x1 and x0 < pill[1] and pill[2] < y1 and y0 < pill[3]: report(f"label '{lab}' ({f} to {t}) sits on {i}")
print("diagrams ok" if not problems else f"{problems} problem(s)")
sys.exit(1 if problems else 0)
