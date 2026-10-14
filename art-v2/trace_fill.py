"""Trace a flat-colour doodle to a filled SVG, keeping every colour it uses.

usage: python3 art-v2/trace_fill.py <img> <out.svg> [ink_hex]

The generator draws fine details (outlines between shapes, small faces, stamps) in a paler
shade of the ink, so a plain ink / yellow / paper split loses them. Instead: everything that
isn't paper is drawn first as one ink silhouette, then each other colour found in the drawing
(yellow, the pale detail lines, any white inside a shape) is traced as its own layer on top.
Colours close to the ink or the sun yellow are snapped to the exact palette values.
The drawing is cropped to its bounding box and fitted into the common 280x350 art box.
"""
import sys
import cv2
import numpy as np

MAX_W, MAX_H = 280, 350
YELLOW = "#f6ec5e"
PAPER_HEX = "#ffffff"


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def to_lab(rgb):
    px = np.uint8(np.clip(rgb, 0, 255)).reshape(-1, 1, 3)
    return cv2.cvtColor(px, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)


def contours(mask, min_area, eps):
    # Upscale and blur lightly before thresholding: smooth edges without closing thin lines.
    big = cv2.resize(mask, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    big = cv2.GaussianBlur(big, (0, 0), 1.3)
    _, big = cv2.threshold(big, 127, 255, cv2.THRESH_BINARY)
    cs, _ = cv2.findContours(big, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if abs(cv2.contourArea(c)) < min_area * 9:
            continue
        c = cv2.approxPolyDP(c, eps, True).reshape(-1, 2) / 3.0
        if len(c) >= 3:
            out.append(c)
    return out


def path_d(pts, ox, oy, k):
    # Closed Catmull-Rom spline through the points, written as cubic Beziers.
    p = (pts - [ox, oy]) * k
    n = len(p)
    d = [f"M{p[0][0]:.1f} {p[0][1]:.1f}"]
    for i in range(n):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % n], p[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d.append(f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    return " ".join(d) + "Z"


def main(src, dst, ink="#1a407d"):
    rgb = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2RGB).astype(np.float32)
    h, w, _ = rgb.shape
    lab = to_lab(rgb.reshape(-1, 3)).reshape(h, w, 3)

    # Paper: very light and nearly colourless.
    chroma = np.hypot(lab[..., 1] - 128, lab[..., 2] - 128)
    paper = (lab[..., 0] > 236) & (chroma < 10)
    drawn = ~paper

    # Find the drawing's own colours among the non-paper pixels.
    samples = lab[drawn]
    rng = np.random.default_rng(0)
    pick = samples[rng.choice(len(samples), min(len(samples), 60000), replace=False)]
    K = 6
    _, _, centres = cv2.kmeans(pick, K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5), 3, cv2.KMEANS_PP_CENTERS)
    labels = np.argmin(np.linalg.norm(lab[..., None, :] - centres[None, None], axis=3), axis=2)

    # Anti-aliased edges form their own thin clusters: a halo between the drawing and the
    # paper. Most of a halo's pixels touch paper; pale detail lines sit inside shapes and
    # mostly don't. Keep the real colours and hand halo pixels to the nearest real colour.
    edge = cv2.dilate(paper.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    real = []
    for i in range(K):
        m = drawn & (labels == i)
        n = m.sum()
        if n > 150 and (m & edge).sum() / n < 0.55:
            real.append(i)
    cand = np.vstack([centres[real], to_lab(hex_rgb(PAPER_HEX)[None])])
    near = np.argmin(np.linalg.norm(lab[..., None, :] - cand[None, None], axis=3), axis=2)
    drawn = drawn & (near < len(real))
    labels = np.where(near < len(real), np.array(real)[np.minimum(near, len(real) - 1)], -1)
    centres = {i: centres[i] for i in real}

    ink_lab, yel_lab, white_lab = (to_lab(hex_rgb(x)[None])[0] for x in (ink, YELLOW, PAPER_HEX))
    # Name each cluster: ink, yellow, or a detail colour kept as it is.
    named = {}
    # Only the one shade nearest the ink becomes the ink; darker or paler shades of it
    # (a figure in front of a cloud, outlines between envelopes) keep their own colour.
    ink_i = min(centres, key=lambda i: np.linalg.norm(centres[i] - ink_lab))
    for i, c in centres.items():
        di, dy, dw = (np.linalg.norm(c - ref) for ref in (ink_lab, yel_lab, white_lab))
        if i == ink_i and di < 40:
            hexc = "ink"
        elif dy < 30:
            hexc = YELLOW
        elif dw < 22:
            hexc = PAPER_HEX
        else:
            r, g, b = cv2.cvtColor(np.uint8([[c]]), cv2.COLOR_LAB2RGB)[0, 0]
            hexc = f"#{r:02x}{g:02x}{b:02x}"
        named.setdefault(hexc, np.zeros((h, w), bool))
        named[hexc] |= drawn & (labels == i)

    ys, xs = np.nonzero(drawn)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    k = min(MAX_W / (x1 - x0), MAX_H / (y1 - y0))
    vw, vh = (x1 - x0) * k, (y1 - y0) * k

    parts = []
    base = " ".join(path_d(c, x0, y0, k) for c in contours(drawn.astype(np.uint8) * 255, 14, 2.6))
    parts.append(f'<path fill="currentColor" fill-rule="evenodd" d="{base}"/>')
    # Lighter layers last, so pale lines sit on top of the shapes they cross.
    others = [(c, m) for c, m in named.items() if c != "ink"]
    others.sort(key=lambda cm: -cm[1].sum())
    for colour, mask in others:
        d = " ".join(path_d(c, x0, y0, k) for c in contours(mask.astype(np.uint8) * 255, 6, 1.8))
        if d:
            parts.append(f'<path fill="{colour}" fill-rule="evenodd" d="{d}"/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw:.1f} {vh:.1f}" color="{ink}">' + "".join(parts) + "</svg>\n"
    open(dst, "w").write(svg)
    print(f"{dst}: {vw:.0f}x{vh:.0f}, {len(svg) / 1024:.1f} KB, layers: {', '.join(c for c, _ in others) or 'ink only'}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
