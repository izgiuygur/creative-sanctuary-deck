"""Centreline-trace a line drawing into stroked SVG paths.
usage: trace.py in.jpg out.svg stroke_width [--measure]
"""
import sys
import numpy as np
import cv2
from skimage.morphology import skeletonize
from scipy.ndimage import gaussian_filter1d, distance_transform_edt

src, out, sw = sys.argv[1], sys.argv[2], float(sys.argv[3])
img = cv2.imread(src)
h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mask = gray < 170
mask = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)).astype(bool)
skel = skeletonize(mask)
dt = distance_transform_edt(mask)
thick = float(np.median(2 * dt[skel]))
print(f"size {w}x{h} median line thickness {thick:.2f}px")

ys, xs = np.nonzero(skel)
pts = set(zip(ys.tolist(), xs.tolist()))
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def nbrs(p):
    y, x = p
    res = [(y + dy, x + dx) for dy, dx in N8 if (y + dy, x + dx) in pts]
    # drop diagonal neighbours already reachable through an orthogonal one
    orth = [q for q in res if q[0] == y or q[1] == x]
    keep = []
    for q in res:
        if q[0] != y and q[1] != x:
            if any(abs(q[0] - o[0]) + abs(q[1] - o[1]) == 1 for o in orth):
                continue
        keep.append(q)
    return keep


deg = {p: len(nbrs(p)) for p in pts}
nodes = {p for p, d in deg.items() if d != 2}
visited = set()
lines = []


def walk(start, nxt):
    path = [start, nxt]
    visited.add((start, nxt))
    visited.add((nxt, start))
    prev, cur = start, nxt
    while cur not in nodes:
        cand = [q for q in nbrs(cur) if q != prev]
        if not cand:
            break
        q = cand[0]
        visited.add((cur, q))
        visited.add((q, cur))
        path.append(q)
        prev, cur = cur, q
        if cur == start:
            break
    return path


for n in nodes:
    for q in nbrs(n):
        if (n, q) not in visited:
            lines.append(walk(n, q))
# closed loops with no junctions
seen = {p for l in lines for p in l}
for p in pts:
    if p not in seen and deg[p] == 2:
        q = nbrs(p)[0]
        if (p, q) not in visited:
            l = walk(p, q)
            lines.append(l)
            seen.update(l)

SPUR = max(6.0, thick * 1.6)
paths = []
for l in lines:
    a, b = l[0], l[-1]
    length = len(l)
    is_spur = (deg.get(a, 0) == 1) != (deg.get(b, 0) == 1) and length < SPUR
    if is_spur:
        continue
    closed = a == b and length > 8
    arr = np.array(l, dtype=float)[:, ::-1]  # x, y
    if length > 8:
        mode = "wrap" if closed else "nearest"
        sm = np.stack([gaussian_filter1d(arr[:, 0], 2.5, mode=mode), gaussian_filter1d(arr[:, 1], 2.5, mode=mode)], 1)
        if not closed:
            sm[0], sm[-1] = arr[0], arr[-1]
        step = 7
        idx = list(range(0, length, step))
        if idx[-1] != length - 1:
            idx.append(length - 1)
        p = sm[idx]
    else:
        p = arr
    n = len(p)
    d = f"M{p[0][0]:.1f} {p[0][1]:.1f}"
    if n == 2:
        d += f"L{p[1][0]:.1f} {p[1][1]:.1f}"
    else:
        for i in range(n - 1):
            p0 = p[i - 1] if i > 0 else (p[-2] if closed else p[i])
            p1, p2 = p[i], p[i + 1]
            p3 = p[i + 2] if i + 2 < n else (p[1] if closed else p2)
            c1 = p1 + (p2 - p0) / 6
            c2 = p2 - (p3 - p1) / 6
            d += f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    paths.append(d)

# bounding box of the drawing, for consistent framing
x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
# Fit every drawing into the same box on the card and give it the same on-card line weight.
MAX_W, MAX_H = 280.0, 350.0
bw, bh = x1 - x0, y1 - y0
scale = min(MAX_W / bw, MAX_H / bh)
units = sw / scale  # sw is the on-card stroke in px
pad = units
vb = f"{x0 - pad:.1f} {y0 - pad:.1f} {bw + 2 * pad:.1f} {bh + 2 * pad:.1f}"
rw, rh = (bw + 2 * pad) * scale, (bh + 2 * pad) * scale
print(f"bbox {bw}x{bh} scale {scale:.3f} rendered {rw:.0f}x{rh:.0f} stroke units {units:.2f} paths {len(paths)}")
body = "".join(f'<path d="{d}"/>' for d in paths)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{rw:.0f}" height="{rh:.0f}" viewBox="{vb}" fill="none" stroke="#1a407d" '
       f'stroke-width="{units:.2f}" stroke-linecap="round" stroke-linejoin="round">{body}</svg>')
open(out, "w").write(svg)
print("bytes", len(svg))
