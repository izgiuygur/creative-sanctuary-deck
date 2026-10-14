"""Turn a picked doodle (drawing on white) into a transparent WebP for the card.

usage: python3 art-v2/export_art.py <img> <out.webp>

White becomes transparent with a colour-to-alpha step (so soft edges stay soft on any card
colour), the image is cropped to the drawing, and scaled to fit 840x1050: three times the
280x350 art box, sharp on high-density phone screens.
"""
import sys
import cv2
import numpy as np

MAX_W, MAX_H = 840, 1050


def main(src, dst):
    rgb = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    # Colour to alpha against white: the least white channel decides how opaque a pixel is.
    alpha = 1 - rgb.min(axis=2)
    alpha[alpha < 0.06] = 0  # paper noise and faint JPEG-ish speckle
    safe = np.maximum(alpha, 1e-6)[..., None]
    colour = np.clip((rgb - (1 - safe)) / safe, 0, 1)
    ys, xs = np.nonzero(alpha > 0.25)
    pad = 6
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, rgb.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, rgb.shape[1])
    rgba = np.dstack([colour, alpha])[y0:y1, x0:x1]
    k = min(MAX_W / (x1 - x0), MAX_H / (y1 - y0), 1.0)
    if k < 1:
        rgba = cv2.resize(rgba, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    out = (np.clip(rgba, 0, 1) * 255).round().astype(np.uint8)
    cv2.imwrite(dst, cv2.cvtColor(out, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_WEBP_QUALITY, 90])
    h, w = out.shape[:2]
    print(f"{dst}: {w}x{h}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
