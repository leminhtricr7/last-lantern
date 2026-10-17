"""Cut the three new bosses (Spore Queen, Kraken, Gravemaw) out of assets/ref/new_bosses.webp.
Grows the background from the panel edges: first pixels close to the backdrop colour, then the smoke / glow
that surrounds each monster (rules per panel), drops the labels and saves assets/bosses/<id>.png at game size."""
import os
from collections import deque
import numpy as np
from PIL import Image

SRC = 'assets/ref/new_bosses.webp'
OUT = 'assets/bosses'
os.makedirs(OUT, exist_ok=True)
img = Image.open(SRC).convert('RGB')
LABEL_TOP = 270
BG = np.array([14, 13, 20])

def eatable(pid, p):
    r, g, b = int(p[0]), int(p[1]), int(p[2]); mx, mn = max(r, g, b), min(r, g, b); sat = mx - mn
    if abs(r - BG[0]) + abs(g - BG[1]) + abs(b - BG[2]) < 30: return True        # the backdrop itself
    if pid == 'sporequeen': return (g > r + 4 and g > b and mx < 150) or (mx < 48 and sat < 26)   # green spore glow, dark haze
    if pid == 'kraken': return (sat < 26 and mx < 110) or (mx < 44)                                 # grey smoke
    if pid == 'gravemaw': return (sat < 22 and mx < 70) or (mx < 40)                                # dust in the dark
    return False

for pid, x0, x1, tw in [('sporequeen', 0, 340, 104), ('kraken', 342, 682, 170), ('gravemaw', 684, 1024, 110)]:
    a = np.array(img.crop((x0, 0, x1, LABEL_TOP)))
    h, w, _ = a.shape
    bg = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1): q.append((x, y))
    for y in range(h):
        for x in (0, w - 1): q.append((x, y))
    while q:
        x, y = q.popleft()
        if bg[y, x] or not eatable(pid, a[y, x]): continue
        bg[y, x] = True
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not bg[ny, nx]: q.append((nx, ny))
    keep = ~bg
    # drop small floating specks: keep only pixels with enough solid neighbours
    k2 = keep.copy()
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            if keep[y, x] and keep[y - 1:y + 2, x - 1:x + 2].sum() < 4: k2[y, x] = False
    # close the silhouette: dilate, take everything not reachable from the edges, erode back -> fills holes in dark bodies
    from PIL import ImageFilter, ImageDraw
    R = {'sporequeen': 11, 'kraken': 7, 'gravemaw': 11}[pid]
    dil = Image.fromarray((k2 * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(R))
    pad = Image.new('L', (w + 2, h + 2), 0); pad.paste(dil, (1, 1)); ImageDraw.floodfill(pad, (0, 0), 128)
    inside = np.array(pad)[1:-1, 1:-1] != 128
    closed = np.array(Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(R))) > 0
    k2 = closed | k2
    # keep the big connected pieces only (drops loose dust and spores)
    lab = np.zeros((h, w), int); sizes = {}; cur = 0
    for y in range(h):
        for x in range(w):
            if k2[y, x] and not lab[y, x]:
                cur += 1; st = [(x, y)]; lab[y, x] = cur; n = 0
                while st:
                    cx, cy = st.pop(); n += 1
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h and k2[ny, nx] and not lab[ny, nx]: lab[ny, nx] = cur; st.append((nx, ny))
                sizes[cur] = n
    big = max(sizes.values())
    k2 = np.isin(lab, [i for i, n in sizes.items() if n >= max(400, big * 0.02)])
    rgba = np.dstack([a, (k2 * 255).astype(np.uint8)])
    out = Image.fromarray(rgba, 'RGBA'); out = out.crop(out.getbbox())
    out.save(os.path.join(OUT, pid + '_full.png'))
    th = round(out.height * tw / out.width)
    small = np.array(out.resize((tw, th), Image.LANCZOS))
    small[..., 3] = np.where(small[..., 3] > 120, 255, 0)
    Image.fromarray(small).save(os.path.join(OUT, pid + '.png'))
    print(pid, out.size, '->', (tw, th))
