"""Cut Quoc's boss frames out of the reference sheets in assets/ref/ and save game-ready sprite strips.

  python tools/cut_quoc.py

Input : assets/ref/quoc_forms.webp (7 rows: imp, hellhound, chained demon, iron general, winged archdemon, ashen titan, eclipse)
        assets/ref/quoc_lord.webp  (5 poses of Quoc the Dark Lord)
Output: assets/quoc/form0.png .. form7.png  (frames side by side, feet on the bottom edge)
        assets/quoc/portrait_smirk.png, portrait_roar.png (cutscene bust), face.png (dialogue portrait)
        assets/quoc/forms.json (cell sizes and frame counts)
"""
import json, os
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'assets', 'quoc')
os.makedirs(OUT, exist_ok=True)


def flood_bg(a, tol, seeds, refrow):
    """Background = pixels connected to the seeds whose colour stays within tol of that row's background colour.
    (A fixed reference per row, no drift - so dark bodies on dark backgrounds survive.)"""
    from PIL import ImageDraw
    cand = np.abs(a - refrow[:, None, :]).max(axis=2) <= tol
    img = Image.fromarray(np.where(cand, 255, 0).astype(np.uint8), 'L').copy()
    for (y, x) in seeds:
        if img.getpixel((x, y)) == 255: ImageDraw.floodfill(img, (x, y), 128)
    return np.array(img) == 128


def runs(occ, min_w, merge):
    out, s = [], None
    for i, v in enumerate(occ):
        if v and s is None: s = i
        if not v and s is not None: out.append([s, i]); s = None
    if s is not None: out.append([s, len(occ)])
    merged = []
    for r in out:
        if merged and r[0] - merged[-1][1] <= merge: merged[-1][1] = r[1]
        else: merged.append(r)
    return [r for r in merged if r[1] - r[0] >= min_w]


def frame_rgba(a, mask, x0, x1, y0, y1):
    sub = a[y0:y1, x0:x1].astype(np.uint8)
    m = mask[y0:y1, x0:x1]
    ys, xs = np.nonzero(m)
    if len(ys) == 0: return None
    sub = sub[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    rgba = np.dstack([sub, (m * 255).astype(np.uint8)])
    return Image.fromarray(rgba, 'RGBA')


def shrink(img, target_h):
    k = target_h / img.height
    w, h = max(1, round(img.width * k)), max(1, round(img.height * k))
    rgb = img.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')   # premultiplied: no dark halos
    arr = np.asarray(rgb).copy()
    arr[..., 3] = np.where(arr[..., 3] >= 110, 255, 0)                        # crisp pixel edges
    return Image.fromarray(arr, 'RGBA'), k


def strip(frames, name):
    """Put frames side by side in equal cells, feet on the bottom edge, centred on the body."""
    cw = max(f.width for f in frames) + 2
    ch = max(f.height for f in frames) + 2
    sheet = Image.new('RGBA', (cw * len(frames), ch), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        al = np.asarray(f)[..., 3] > 0
        lower = al[int(f.height * 0.45):]                                    # centre on the body/legs, not on effects
        cols = np.nonzero(lower.any(axis=0))[0]
        cx = (cols.min() + cols.max()) / 2 if len(cols) else f.width / 2
        x = int(round(i * cw + cw / 2 - cx)); x = min(max(x, i * cw), i * cw + cw - f.width)
        sheet.alpha_composite(f, (x, ch - 1 - f.height))
    sheet.save(os.path.join(OUT, name))
    return {'cw': cw, 'ch': ch, 'n': len(frames)}


manifest = {}

# ---------------- the 7 monster forms ----------------
src = Image.open(os.path.join(ROOT, 'assets', 'ref', 'quoc_forms.webp')).convert('RGB')
a = np.asarray(src).astype(np.int32)
H, W, _ = a.shape
bands = [(0, 184), (185, 369), (370, 553), (554, 737), (738, 920), (921, 1105), (1106, H)]
label_end = [600, 520, 540, 628, 500, 545, 575]                     # right edge of the text label in each row
targets = [44, 42, 70, 74, 66, 96, 108]                            # in-game height of each form (pixels)
mask = np.zeros((H, W), bool)
for bi, (y0, y1) in enumerate(bands):
    seeds = [(y, x) for y in (y0 + 2, y1 - 3) for x in range(0, W, 7)] + [(y, W - 2) for y in range(y0 + 2, y1 - 2, 5)]
    band = a[y0:y1]
    ref = np.median(a[y0:y1, 1950:1998], axis=1)
    bg = flood_bg(band, 7, [(y - y0, x) for (y, x) in seeds], ref)
    m = ~bg
    m[:, :label_end[bi]] = False                                    # drop the row label
    mask[y0:y1] = m
mask[1190:, 1850:] = False                                          # watermark star
for fi, (y0, y1) in enumerate(bands):
    occ = mask[y0 + 100:y1 - 4].sum(axis=0) > 2                    # lower part of the row: bodies, never the label
    rs = runs(occ, 40, 26)
    if fi == 6:  # the eclipse beam touches the vortex frame: split them at the gap
        rs = [q for r in rs for q in ([[r[0], 1640], [1640, r[1]]] if r[0] < 1640 < r[1] else [r])]
    frames = []
    for r in rs:
        x0, x1 = max(0, r[0] - 40), min(W, r[1] + 40)
        # keep only the pixels connected to this frame (neighbouring frames may enter the margin)
        sub = mask[y0:y1, x0:x1].copy()
        lab = np.zeros_like(sub, np.int32); nid = 0; keep = set()
        ys, xs = np.nonzero(sub)
        # flood components on a 2px-dilated mask so wisps stay attached to the body
        dil = sub.copy()
        for d in (1, 2):
            dil[d:, :] |= sub[:-d, :]; dil[:-d, :] |= sub[d:, :]; dil[:, d:] |= sub[:, :-d]; dil[:, :-d] |= sub[:, d:]
        seen = np.zeros_like(dil)
        cx0, cx1 = r[0] - x0, r[1] - x0
        for sy in range(dil.shape[0] - 1, 99, -1):
            for sx in range(cx0, cx1):
                if dil[sy, sx] and not seen[sy, sx]:
                    q = deque([(sy, sx)]); seen[sy, sx] = True
                    while q:
                        y, x = q.popleft()
                        for dy in (-1, 0, 1):
                            for dx in (-1, 0, 1):
                                ny, nx = y + dy, x + dx
                                if 0 <= ny < dil.shape[0] and 0 <= nx < dil.shape[1] and dil[ny, nx] and not seen[ny, nx]:
                                    seen[ny, nx] = True; q.append((ny, nx))
        fm = np.zeros_like(mask); fm[y0:y1, x0:x1] = sub & seen
        img = frame_rgba(a, fm, x0, x1, y0, y1)
        if img is not None and img.height > 40: frames.append(img)
    hs = sorted(f.height for f in frames)
    ref_h = hs[len(hs) // 2]
    small = [shrink(f, max(8, round(targets[fi] * f.height / ref_h)))[0] for f in frames]
    manifest['form' + str(fi + 1)] = strip(small, 'form%d.png' % (fi + 1))
    print('form', fi + 1, 'frames', len(frames), [f.size for f in small])

# ---------------- Quoc the Dark Lord (form 0) + portraits ----------------
src = Image.open(os.path.join(ROOT, 'assets', 'ref', 'quoc_lord.webp')).convert('RGB')
a = np.asarray(src).astype(np.int32)
H, W, _ = a.shape
seeds = [(y, x) for y in (2, H - 3) for x in range(0, W, 5)] + [(y, x) for x in (2, W - 3) for y in range(0, H, 5)]
ref = np.median(np.concatenate([a[:, :10], a[:, W - 10:]], axis=1), axis=1)
mask = ~flood_bg(a, 7, seeds, ref)
mask[560:, 860:] = False                                            # watermark star
rows = [(0, 345), (345, H)]
lord = []
for (y0, y1) in rows:
    occ = mask[y0:y1].sum(axis=0) > 3
    for r in runs(occ, 60, 30):
        img = frame_rgba(a, mask, r[0], r[1], y0, y1)
        if img is not None and img.height > 120: lord.append(img)
print('lord poses', len(lord), [f.size for f in lord])
hs = sorted(f.height for f in lord); ref_h = hs[len(hs) // 2]
small = [shrink(f, round(78 * f.height / ref_h))[0] for f in lord]
manifest['form0'] = strip(small, 'form0.png')


def bust(img, name, w, h):
    top = img.crop((0, 0, img.width, int(img.height * 0.62)))
    k = h / top.height                                              # same head size for every pose
    t2 = top.resize((round(top.width * k), round(top.height * k)), Image.LANCZOS)
    canvas = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    canvas.paste(t2, ((w - t2.width) // 2, h - t2.height), t2)
    canvas.save(os.path.join(OUT, name))


bust(lord[1], 'portrait_smirk.png', 150, 128)
bust(lord[4] if len(lord) > 4 else lord[-1], 'portrait_roar.png', 150, 128)
face = lord[0].crop((int(lord[0].width * 0.06), 0, int(lord[0].width * 0.94), int(lord[0].height * 0.5)))   # head and shoulders for the dialogue frame
face = face.resize((round(48 * face.width / face.height), 48), Image.LANCZOS)
if face.width > 44: face = face.crop(((face.width - 44) // 2, 0, (face.width - 44) // 2 + 44, 48))
face.save(os.path.join(OUT, 'face.png'))
json.dump(manifest, open(os.path.join(OUT, 'forms.json'), 'w'), indent=1)
print(json.dumps(manifest))
