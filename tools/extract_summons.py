# Cuts the artist's summon design sheets (art/summon_sheets/<kind>.webp) into game sprite strips.
# Needs rembg (birefnet-general-lite model) for background removal. Usage:  python tools/extract_summons.py [kind ...]
# Output: assets/summons/<kind>_<anim>.png  +  assets/summons/manifest.json
import sys, os, json
import numpy as np
from PIL import Image
from rembg import remove, new_session

SRC, OUT = 'art/summon_sheets', 'assets/summons'
UP = 3            # upscale before background removal (better masks on small frames)
OUT_SCALE = 2     # stored frames are 2x the sheet's pixels
SES = new_session('birefnet-general-lite')

def cut(img, box):
    """box in sheet pixels -> RGBA (at UP scale) with the background removed"""
    c = img.crop(box)
    c = c.resize((c.width * UP, c.height * UP), Image.LANCZOS)
    o = remove(c, session=SES)
    a = np.asarray(o).copy()
    al = a[..., 3].astype(np.float32)
    al = np.clip((al - 60) * (255 / 140), 0, 255)          # harden soft edges and drop faint background haze
    a[..., 3] = al.astype(np.uint8)
    return a

def label(mask):
    """4-connected components; returns label image and sizes"""
    h, w = mask.shape; lab = np.zeros((h, w), np.int32); sizes = [0]; n = 0
    for y in range(h):
        row = mask[y]
        for x in range(w):
            if row[x] and not lab[y, x]:
                n += 1; stack = [(y, x)]; lab[y, x] = n; cnt = 0
                while stack:
                    cy, cx = stack.pop(); cnt += 1
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; stack.append((ny, nx))
                sizes.append(cnt)
    return lab, sizes

def clean(a, keep_ratio=0.06):
    """remove small specks: keep components bigger than keep_ratio of the largest"""
    small = Image.fromarray(a).resize((a.shape[1] // UP, a.shape[0] // UP), Image.BILINEAR)
    m = np.asarray(small)[..., 3] > 90
    lab, sizes = label(m)
    if len(sizes) <= 1: return a
    big = max(sizes[1:]); keep = np.zeros(len(sizes), bool)
    for i in range(1, len(sizes)): keep[i] = sizes[i] >= big * keep_ratio
    km = keep[lab]
    km = np.asarray(Image.fromarray((km * 255).astype(np.uint8)).resize((a.shape[1], a.shape[0]), Image.NEAREST)) > 0
    b = a.copy(); b[..., 3] = np.where(km, b[..., 3], 0); return b

def clean_center(a):
    """keep the figure standing in the middle of the cell (and pieces that overlap it), drop neighbours"""
    small = Image.fromarray(a).resize((a.shape[1] // UP, a.shape[0] // UP), Image.BILINEAR)
    m = np.asarray(small)[..., 3] > 90
    lab, sizes = label(m)
    if len(sizes) <= 1: return a
    w = m.shape[1]; best, bs = 0, 0; info = {}
    for i in range(1, len(sizes)):
        ys, xs = np.where(lab == i); info[i] = (xs.min(), xs.max(), xs.mean())
        if abs(xs.mean() - w / 2) < w * 0.3 and sizes[i] > bs: best, bs = i, sizes[i]
    if not best: return clean(a)
    x0, x1, _ = info[best]; pad = (x1 - x0) * 0.15
    keep = np.zeros(len(sizes), bool); keep[best] = True
    for i in range(1, len(sizes)):
        if i != best and sizes[i] >= bs * 0.03 and info[i][1] - info[i][0] > 2 and info[i][1] >= x0 - pad and info[i][0] <= x1 + pad: keep[i] = True
    km = np.asarray(Image.fromarray((keep[lab] * 255).astype(np.uint8)).resize((a.shape[1], a.shape[0]), Image.NEAREST)) > 0
    b = a.copy(); b[..., 3] = np.where(km, b[..., 3], 0); return b

def bbox(a, thr=40):
    ys, xs = np.where(a[..., 3] > thr)
    if len(xs) == 0: return None
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def anchor_x(a):
    """horizontal anchor = centre of the lowest 35% of the figure (its feet / legs)"""
    bb = bbox(a); x0, y0, x1, y1 = bb; yc = int(y1 - (y1 - y0) * 0.35)
    ys, xs = np.where(a[yc:y1, x0:x1, 3] > 40)
    return x0 + (xs.mean() if len(xs) else (x1 - x0) / 2)

def segments(a, n_last=None, min_w=8):
    """split a band into figures by empty columns; returns list of (x0, x1) in band coords"""
    col = (a[..., 3] > 60).sum(axis=0) > 2
    segs = []; x = 0; w = len(col)
    while x < w:
        if col[x]:
            s = x
            while x < w and (col[x] or (x + 1 < w and col[x + 1]) or (x + 2 < w and col[x + 2])): x += 1
            if x - s >= min_w * UP: segs.append((s, x))
        x += 1
    if n_last: segs = segs[-n_last:]
    return segs

def peaks(a, n=8, min_sep=38):
    """centres of the n right-most figures in a band (peaks of the column coverage)"""
    prof = (a[..., 3] > 60).sum(axis=0).astype(float)
    k = 12 * UP; prof = np.convolve(prof, np.ones(k) / k, mode='same')
    order = np.argsort(-prof); picked = []
    for i in order:
        if prof[i] < prof.max() * 0.22: break
        if all(abs(i - p) >= min_sep * UP for p in picked): picked.append(int(i))
        if len(picked) >= n + 3: break
    picked.sort()
    return picked[-n:]

def strip(frames, kind, name, man):
    """bottom-align frames on their feet anchor, pack into one strip of square cells"""
    fr = []
    for a in frames:
        bb = bbox(a)
        if not bb: continue
        ax = anchor_x(a); x0, y0, x1, y1 = bb
        fr.append((a, ax, bb))
    if not fr: return
    left = max(ax - bb[0] for a, ax, bb in fr); right = max(bb[2] - ax for a, ax, bb in fr)
    hmax = max(bb[3] - bb[1] for a, ax, bb in fr); half = max(left, right)
    S = int(max(hmax, half * 2) + 4)
    sheet = Image.new('RGBA', (S * len(fr), S), (0, 0, 0, 0))
    chs = []
    for i, (a, ax, bb) in enumerate(fr):
        im = Image.fromarray(a).crop(bb)
        ox = int(round(i * S + S / 2 - (ax - bb[0]))); oy = S - (bb[3] - bb[1])
        sheet.alpha_composite(im, (ox, oy)); chs.append(bb[3] - bb[1])
    k = OUT_SCALE / UP
    sheet = sheet.resize((max(1, int(sheet.width * k)), max(1, int(sheet.height * k))), Image.LANCZOS)
    sheet.save(f'{OUT}/{kind}_{name}.png')
    man.setdefault(kind, {})[name] = {'n': len(fr), 'ch': round(float(np.median(chs)) * k, 1), 's': sheet.height}

def single(a, kind, name, man, scale=1.0):
    bb = bbox(a)
    if not bb: return
    im = Image.fromarray(a).crop(bb)
    k = scale / UP; im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
    im.save(f'{OUT}/{kind}_{name}.png')
    man.setdefault(kind, {})[name] = {'n': 1, 'ch': im.height, 's': im.height, 'w': im.width}

def cells(img, x0f, x1f, y0, y1, n):
    W = img.width; xs = np.linspace(W * x0f, W * x1f, n + 1)
    return [cut(img, (int(xs[i]) + 2, y0, int(xs[i + 1]) - 2, y1)) for i in range(n)]

def do(kind, man):
    img = Image.open(f'{SRC}/{kind}.webp').convert('RGB'); W = img.width
    # walk: the 8 right-most figures in the walk band
    BX, BY0, BY1 = 90, 205, 297          # walk band (stops above the F1..F8 labels)
    band = cut(img, (BX, BY0, W - 4, BY1))
    pk = peaks(band); sp = (np.median(np.diff(pk)) if len(pk) > 1 else 60 * UP) / UP; hw = sp * 0.75
    walk = [clean_center(cut(img, (int(max(0, BX + c / UP - hw)), BY0, int(min(W, BX + c / UP + hw)), BY1))) for c in pk]
    strip(walk, kind, 'walk', man)
    # attack: row 1 = F1 F2 F3 F4, row 2 = F5 F6 (F7 is the impact explosion)
    r1 = cells(img, 0.01, 0.995, 330, 458, 4); r2 = cells(img, 0.01, 0.995, 458, 597, 4)
    strip([clean_center(a) for a in r1 + r2[:1]], kind, 'attack', man)
    # hurt (3) and death (5)
    hurt = [clean_center(a) for a in cells(img, 0.01, 0.495, 628, 725, 3)]
    strip(hurt, kind, 'hurt', man)
    strip(hurt[:1], kind, 'idle', man)
    db = cut(img, (int(W * 0.505), 628, int(W * 0.995), 725)); cw = db.shape[1] / 5
    strip([clean_center(db[:, int(i * cw):int((i + 1) * cw)]) for i in range(5)], kind, 'death', man)
    # final (ancient) form
    ev = clean(cut(img, (int(W * 0.645), 765, W - 6, 932)), 0.2)
    single(ev, kind, 'evo', man, 1.0)
    print('done', kind, {k: v['n'] for k, v in man[kind].items()})

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    mp = f'{OUT}/manifest.json'
    man = json.load(open(mp)) if os.path.exists(mp) else {}
    kinds = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(SRC) if f.endswith('.webp'))
    for k in kinds:
        man.pop(k, None); do(k, man)
        json.dump(man, open(mp, 'w'), indent=1)
