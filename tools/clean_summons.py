# Second pass over the cut summon strips: removes caption text, frame labels and grid lines that the
# background remover kept, drops empty frames, and re-packs every strip on the figure's feet.
# Usage: python tools/clean_summons.py   (only needs Pillow + numpy)
import json
import numpy as np
from PIL import Image

OUT = 'assets/summons'

def label(mask):
    h, w = mask.shape; lab = np.zeros((h, w), np.int32); sizes = [0]; n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1; st = [(y, x)]; lab[y, x] = n; c = 0
                while st:
                    cy, cx = st.pop(); c += 1
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; st.append((ny, nx))
                sizes.append(c)
    return lab, sizes

def clean_frame(a):
    """keep the biggest figure and the pieces that touch its box; drop text above, labels below, thin lines"""
    m = a[..., 3] > 50
    lab, sizes = label(m)
    if len(sizes) <= 1: return None
    boxes = {}
    for i in range(1, len(sizes)):
        ys, xs = np.where(lab == i); boxes[i] = (xs.min(), ys.min(), xs.max(), ys.max())
    cand = [i for i in range(1, len(sizes)) if boxes[i][2] - boxes[i][0] > 3 and boxes[i][3] - boxes[i][1] > 3]
    if not cand: return None
    main = max(cand, key=lambda i: sizes[i])
    x0, y0, x1, y1 = boxes[main]; px, py = (x1 - x0) * 0.12, (y1 - y0) * 0.08
    keep = np.zeros(len(sizes), bool); keep[main] = True
    for i in cand:
        bx0, by0, bx1, by1 = boxes[i]
        if i == main or sizes[i] < sizes[main] * 0.02: continue
        if by0 >= y1 - 1 or by1 <= y0 + 1: continue   # wholly below the feet (frame labels) or above the head (captions)
        if bx1 >= x0 - px and bx0 <= x1 + px: keep[i] = True
    if sizes[main] < 60: return None
    b = a.copy(); b[..., 3] = np.where(keep[lab], b[..., 3], 0)
    return b

def no_thin_lines(a):
    """erase 1-2 px wide vertical lines (the grid behind the hurt/death frames)"""
    m = (a[..., 3] > 40).astype(np.int32); h, w = m.shape
    pad = np.pad(m, ((0, 0), (3, 3)))
    near = sum(pad[:, 3 + d:3 + d + w] for d in (-3, -2, 2, 3))
    b = a.copy(); b[..., 3] = np.where((m == 1) & (near == 0), 0, b[..., 3]); return b

DROP = {('clones', 'death'), ('angel', 'death')}   # these cells only held labels / loose feathers

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
    if not fr: return None, None
    half = max(max(ax - bb[0], bb[2] - ax) for a, ax, bb in fr); hmax = max(bb[3] - bb[1] for a, ax, bb in fr)
    S = int(max(hmax, half * 2) + 4)
    out = Image.new('RGBA', (S * len(fr), S), (0, 0, 0, 0)); chs = []
    for i, (a, ax, bb) in enumerate(fr):
        im = Image.fromarray(a).crop(bb)
        out.alpha_composite(im, (int(round(i * S + S / 2 - (ax - bb[0]))), S - (bb[3] - bb[1]))); chs.append(bb[3] - bb[1])
    return out, {'n': len(fr), 'ch': float(np.median(chs)), 's': S}

man = json.load(open(f'{OUT}/manifest.json'))
for kind, strips in man.items():
    for name in list(strips):
        if name == 'evo':
            a = np.asarray(Image.open(f'{OUT}/{kind}_evo.png').convert('RGBA')).copy(); c = clean_frame(a)
            if c is not None:
                bb = bbox(c); Image.fromarray(c).crop(bb).save(f'{OUT}/{kind}_evo.png'); strips['evo'].update({'ch': int(bb[3] - bb[1]), 's': int(bb[3] - bb[1]), 'w': int(bb[2] - bb[0])})
            continue
        if (kind, name) in DROP:
            del strips[name]; print('dropped', kind, name); continue
        meta = strips[name]; im = np.asarray(Image.open(f'{OUT}/{kind}_{name}.png').convert('RGBA')); S = im.shape[0]
        cells = [im[:, i * S:(i + 1) * S].copy() for i in range(meta['n'])]
        if name in ('death', 'hurt', 'idle'): cells = [no_thin_lines(c) for c in cells]
        frames = [clean_frame(c) for c in cells]
        frames = [f for f in frames if f is not None]
        area = [int((f[..., 3] > 40).sum()) for f in frames]
        frames = [f for f, ar in zip(frames, area) if ar >= max(area or [0]) * (0.12 if name == 'death' else 0.3)]
        if name == 'walk' and len(frames) > 3:   # frames that still hold a piece of the neighbouring figure are much wider: drop them
            wd = [bbox(f)[2] - bbox(f)[0] for f in frames]; med = float(np.median(wd))
            keep = [f for f, w in zip(frames, wd) if w <= med * 1.3]
            if len(keep) >= 3: frames = keep
        out, m = pack(frames) if frames else (None, None)
        if out is None or (name == 'death' and m['n'] < 2):
            del strips[name]; print('dropped', kind, name); continue
        out.save(f'{OUT}/{kind}_{name}.png'); strips[name] = m
    print('cleaned', kind, {k: v['n'] for k, v in strips.items()})
json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=1)
