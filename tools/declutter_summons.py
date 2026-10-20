# Third pass over the summon strips: removes pieces of the NEIGHBOURING figure that the first cut kept (a second dragon's wing,
# another phoenix, a stray tail...), then re-packs every strip on the figure's feet and updates the manifest.
# Keeps: the biggest piece, small bits right next to it, and pieces that lie mostly inside its box. Attack strips keep their
# effects in front of the figure (fireballs, slashes).
# Usage: python tools/declutter_summons.py   (Pillow + numpy)
import json
import numpy as np
from PIL import Image
import importlib.util, sys
spec = importlib.util.spec_from_file_location('cs', 'tools/clean_summons.py')
OUT = 'assets/summons'

def label(mask):
    h, w = mask.shape; lab = np.zeros((h, w), np.int32); sizes = [0]; n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1; st = [(y, x)]; lab[y, x] = n; c = 0
                while st:
                    cy, cx = st.pop(); c += 1
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1), (cy + 1, cx + 1), (cy - 1, cx - 1), (cy + 1, cx - 1), (cy - 1, cx + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; st.append((ny, nx))
                sizes.append(c)
    return lab, sizes

def declutter(a, attack):
    m = a[..., 3] > 40
    lab, sizes = label(m)
    if len(sizes) <= 2: return a, 0
    boxes = {}
    for i in range(1, len(sizes)):
        ys, xs = np.where(lab == i); boxes[i] = (xs.min(), ys.min(), xs.max(), ys.max())
    main = max(range(1, len(sizes)), key=lambda i: sizes[i])
    mx0, my0, mx1, my1 = boxes[main]; keep = np.zeros(len(sizes), bool); keep[main] = True; dropped = 0
    # which way the figure faces: the side with more of its mass in the top half is the head (front)
    for i in range(1, len(sizes)):
        if i == main: continue
        x0, y0, x1, y1 = boxes[i]; area = (x1 - x0 + 1) * (y1 - y0 + 1)
        ix = max(0, min(x1, mx1) - max(x0, mx0) + 1); iy = max(0, min(y1, my1) - max(y0, my0) + 1)
        inside = ix * iy / area
        gap = max(mx0 - x1, x0 - mx1, my0 - y1, y0 - my1, 0)
        small = sizes[i] < sizes[main] * 0.08
        if inside >= 0.7 or (small and gap <= 4) or (attack and sizes[i] < sizes[main] * 0.6 and gap <= 40 and inside > 0):
            keep[i] = True
        elif attack and sizes[i] < sizes[main] * 0.5 and abs((y0 + y1) / 2 - (my0 + my1) / 2) < (my1 - my0) * 0.6 and gap <= 60 and sizes[i] > 12:
            keep[i] = True   # an effect in front of the figure (fireball, slash)
        else:
            dropped += 1
    b = a.copy(); b[..., 3] = np.where(keep[lab], b[..., 3], 0)
    return b, dropped

def bbox(a):
    ys, xs = np.where(a[..., 3] > 40)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None
def anchor_x(a, bb):
    x0, y0, x1, y1 = bb; yc = int(y1 - (y1 - y0) * 0.35)
    ys, xs = np.where(a[yc:y1, x0:x1, 3] > 40)
    return x0 + (xs.mean() if len(xs) else (x1 - x0) / 2)
def pack(frames):
    fr = []
    for a in frames:
        bb = bbox(a)
        if bb: fr.append((a, anchor_x(a, bb), bb))
    half = max(max(ax - bb[0], bb[2] - ax) for a, ax, bb in fr); hmax = max(bb[3] - bb[1] for a, ax, bb in fr)
    S = int(max(hmax, half * 2) + 4)
    out = Image.new('RGBA', (S * len(fr), S), (0, 0, 0, 0)); chs = []
    for i, (a, ax, bb) in enumerate(fr):
        im = Image.fromarray(a).crop(bb)
        out.alpha_composite(im, (int(round(i * S + S / 2 - (ax - bb[0]))), S - (bb[3] - bb[1]))); chs.append(bb[3] - bb[1])
    return out, {'n': len(fr), 'ch': float(np.median(chs)), 's': S}

man = json.load(open(f'{OUT}/manifest.json'))
total = 0
for kind, strips in man.items():
    for name in list(strips):
        if name == 'evo': continue
        meta = strips[name]; im = np.asarray(Image.open(f'{OUT}/{kind}_{name}.png').convert('RGBA')); S = im.shape[0]; n = meta['n']; cw = im.shape[1] // n
        frames = []; drop = 0
        for i in range(n):
            c = im[:, i * cw:(i + 1) * cw].copy(); c2, d = declutter(c, name == 'attack'); drop += d
            if bbox(c2): frames.append(c2)
        out, m2 = pack(frames); out.save(f'{OUT}/{kind}_{name}.png'); strips[name] = m2; total += drop
        if drop: print(kind, name, 'removed', drop, 'stray pieces')
json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=1)
print('done, removed', total)

# frames where two figures are fused (much wider than the clean ones) or a frame lost half the figure (much shorter): drop them
man = json.load(open(f'{OUT}/manifest.json'))
for kind, strips in man.items():
    for name in ('walk', 'idle', 'hurt'):
        if name not in strips: continue
        meta = strips[name]; im = np.asarray(Image.open(f'{OUT}/{kind}_{name}.png').convert('RGBA')); n = meta['n']; cw = im.shape[1] // n
        cells = [im[:, i * cw:(i + 1) * cw].copy() for i in range(n)]; bbs = [bbox(c) for c in cells]
        ws = sorted(b[2] - b[0] for b in bbs); hs = [b[3] - b[1] for b in bbs]; hmed = float(np.median(hs))
        narrow = float(np.mean(ws[:max(1, int(round(n * 0.4)))]))
        keep = [c for c, b in zip(cells, bbs) if (b[2] - b[0]) <= narrow * 1.3 and (b[3] - b[1]) >= hmed * 0.8]
        if len(keep) >= 3 and len(keep) < n:
            out, m2 = pack(keep); out.save(f'{OUT}/{kind}_{name}.png'); strips[name] = m2; print(kind, name, 'dropped', n - len(keep), 'fused/broken frames')
json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=1)

# frames whose figure was sliced by the sheet's grid (a long straight vertical edge on its left or right side): drop them
def cut_edge(c):
    a = c[..., 3] > 40; ys, xs = np.where(a)
    if not len(xs): return 0
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max(); h = y1 - y0 + 1
    def run(col):
        best = cur = 0
        for v in a[y0:y1 + 1, col]: cur = cur + 1 if v else 0; best = max(best, cur)
        return best / h
    return max(run(x0), run(x1))
man = json.load(open(f'{OUT}/manifest.json'))
for kind, strips in man.items():
    for name in ('walk', 'death', 'hurt', 'idle', 'attack'):
        if name not in strips: continue
        meta = strips[name]; im = np.asarray(Image.open(f'{OUT}/{kind}_{name}.png').convert('RGBA')); n = meta['n']; cw = im.shape[1] // n
        cells = [im[:, i * cw:(i + 1) * cw].copy() for i in range(n)]
        lim = 0.45 if name == 'walk' else 0.9
        keep = [c for c in cells if cut_edge(c) <= lim]
        if len(keep) < n and len(keep) >= (3 if name == 'walk' else 2):
            out, m2 = pack(keep); out.save(f'{OUT}/{kind}_{name}.png'); strips[name] = m2; print(kind, name, 'dropped', n - len(keep), 'sliced frames')
json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=1)
