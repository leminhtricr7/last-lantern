# A tiny pixel-art kit for LAST LANTERN sprites (phase 3).
# Parts are drawn as hard-edged shapes (no anti-aliasing) and shaded automatically with one light from the top-left:
# a light rim on the top/left edges, a dark rim on the bottom/right edges, a darker lower band with a 2x2 dither.
# Glowing details (lava, eyes, fire) are drawn flat on top. A 1-pixel outline is added around the whole figure.
# Every frame is checked against the character's palette (max 16 colours).
from PIL import Image, ImageDraw
import math, json, os

def hexc(h):
    h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)

class Frame:
    def __init__(self, w, h, outline):
        self.w, self.h = w, h
        self.img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        self.outline = hexc(outline)
        self.fx = []          # particles drawn after the outline (smoke, sparks)

    # ---- shapes into a 1-bit mask ----
    @staticmethod
    def _draw(d, shapes):
        for s in shapes:
            k = s[0]
            if k == 'poly': d.polygon([(round(x), round(y)) for x, y in s[1]], fill=1)
            elif k == 'ell': x, y, rx, ry = s[1:5]; d.ellipse([round(x - rx), round(y - ry), round(x + rx), round(y + ry)], fill=1)
            elif k == 'rect': x, y, w, h = s[1:5]; d.rectangle([round(x), round(y), round(x + w - 1), round(y + h - 1)], fill=1)
            elif k == 'cap':   # a thick segment with round ends
                (x0, y0), (x1, y1), r0, r1 = s[1], s[2], s[3], s[4]
                dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy) or 1; nx, ny = -dy / L, dx / L
                d.polygon([(round(x0 + nx * r0), round(y0 + ny * r0)), (round(x1 + nx * r1), round(y1 + ny * r1)), (round(x1 - nx * r1), round(y1 - ny * r1)), (round(x0 - nx * r0), round(y0 - ny * r0))], fill=1)
                d.ellipse([round(x0 - r0), round(y0 - r0), round(x0 + r0), round(y0 + r0)], fill=1)
                d.ellipse([round(x1 - r1), round(y1 - r1), round(x1 + r1), round(y1 + r1)], fill=1)

    def part(self, shapes, tones, band=0.62, cut=None):
        """tones = [dark, mid, light, highlight]; cut = shapes removed from this part (holes)"""
        m = Image.new('1', (self.w, self.h), 0); d = ImageDraw.Draw(m); self._draw(d, shapes)
        if cut: c = Image.new('1', (self.w, self.h), 0); self._draw(ImageDraw.Draw(c), cut); m = Image.composite(Image.new('1', m.size, 0), m, c)
        bb = m.getbbox()
        if not bb: return
        top, bot = bb[1], bb[3] - 1; H = max(1, bot - top)
        mp = m.load(); out = self.img.load(); T = [hexc(t) for t in tones]
        ins = lambda x, y: 0 <= x < self.w and 0 <= y < self.h and mp[x, y]
        for y in range(bb[1], bb[3]):
            t = (y - top) / H
            for x in range(bb[0], bb[2]):
                if not mp[x, y]: continue
                br = not ins(x + 1, y) or not ins(x, y + 1)
                tl = not ins(x - 1, y) or not ins(x, y - 1)
                if br and not tl: c = T[0]
                elif tl and not br: c = T[3] if (not ins(x - 1, y) and not ins(x, y - 1)) else T[2]
                elif tl and br: c = T[1]
                elif t > band + 0.06: c = T[0]
                elif t > band: c = T[0] if (x + y) % 2 == 0 else T[1]   # a thin dithered seam between mid and shadow
                elif t < 0.06: c = T[2]
                else: c = T[1]
                out[x, y] = c

    def px(self, x, y, col):
        x, y = round(x), round(y)
        if 0 <= x < self.w and 0 <= y < self.h: self.img.load()[x, y] = hexc(col)
    def line(self, pts, col, only_on_body=True):
        """a 1-pixel polyline (cracks, seams); with only_on_body it never paints outside the figure"""
        p = self.img.load(); c = hexc(col)
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
            for i in range(n + 1):
                x = round(x0 + (x1 - x0) * i / n); y = round(y0 + (y1 - y0) * i / n)
                if 0 <= x < self.w and 0 <= y < self.h and (not only_on_body or p[x, y][3]): p[x, y] = c
    def flat(self, shapes, col):
        """a flat (glowing / unshaded) shape"""
        m = Image.new('1', (self.w, self.h), 0); self._draw(ImageDraw.Draw(m), shapes)
        self.img.paste(Image.new('RGBA', m.size, hexc(col)), (0, 0), m)

    def finish(self, flash=False):
        src = self.img.load(); w, h = self.w, self.h
        out = self.img.copy(); o = out.load()
        for y in range(h):
            for x in range(w):
                if src[x, y][3]: continue
                if any(0 <= x + dx < w and 0 <= y + dy < h and src[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): o[x, y] = self.outline
        for x, y, col in self.fx:
            x, y = round(x), round(y)
            if 0 <= x < w and 0 <= y < h and not o[x, y][3]: o[x, y] = hexc(col)
        if flash:
            for y in range(h):
                for x in range(w):
                    if o[x, y][3]: o[x, y] = (255, 255, 255, 255)
        return out

def save_set(name, folder, cell, anchor, states, palette, notes=''):
    """states: {state: (frames[list of Images], fps, loop)} -> one PNG strip per state + <name>.json"""
    os.makedirs(folder, exist_ok=True)
    meta = {'name': name, 'cell': list(cell), 'anchor': list(anchor), 'facing': 'right', 'palette': palette, 'notes': notes, 'states': {}}
    for st, (frames, fps, loop) in states.items():
        strip = Image.new('RGBA', (cell[0] * len(frames), cell[1]), (0, 0, 0, 0))
        for i, f in enumerate(frames): strip.paste(f, (i * cell[0], 0))
        strip.save(os.path.join(folder, '%s_%s.png' % (name, st)))
        meta['states'][st] = {'frames': len(frames), 'fps': fps, 'loop': loop, 'file': '%s_%s.png' % (name, st)}
    with open(os.path.join(folder, name + '.json'), 'w', encoding='utf-8') as fo: json.dump(meta, fo, indent=1, ensure_ascii=False)
    return meta

def preview(name, folder, states, cell, scale, out_dir):
    """a labelled contact sheet and one animated GIF per state (nearest-neighbour, for people to look at)"""
    from PIL import ImageFont
    os.makedirs(out_dir, exist_ok=True)
    rows = list(states.items()); maxn = max(len(v[0]) for _, v in rows)
    W = 90 + maxn * (cell[0] * scale + 6); H = len(rows) * (cell[1] * scale + 10) + 10
    sheet = Image.new('RGBA', (W, H), (34, 30, 52, 255)); d = ImageDraw.Draw(sheet)
    for r, (st, (frames, fps, loop)) in enumerate(rows):
        y = 10 + r * (cell[1] * scale + 10)
        d.text((8, y + cell[1] * scale // 2 - 12), '%s\n%d f / %d fps' % (st, len(frames), fps), fill=(230, 230, 240, 255))
        for i, f in enumerate(frames):
            x = 90 + i * (cell[0] * scale + 6)
            d.rectangle([x - 1, y - 1, x + cell[0] * scale, y + cell[1] * scale], outline=(70, 64, 96, 255))
            sheet.alpha_composite(f.resize((cell[0] * scale, cell[1] * scale), Image.NEAREST), (x, y))
    sheet.save(os.path.join(out_dir, name + '_sheet.png'))
    for st, (frames, fps, loop) in rows:
        bg = (40, 34, 58)
        fr = []
        for f in frames:
            b = Image.new('RGBA', f.size, bg + (255,)); b.alpha_composite(f); fr.append(b.convert('RGB').resize((cell[0] * scale, cell[1] * scale), Image.NEAREST))
        fr[0].save(os.path.join(out_dir, '%s_%s.gif' % (name, st)), save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=0 if loop else 1, disposal=2)

def check(name, states, cell, anchor, palette, ground=True):
    """hard checks: palette size, clean alpha, padding, feet on the anchor line, loop seams"""
    pal = set(hexc(c)[:3] for c in palette); issues = []
    for st, (frames, fps, loop) in states.items():
        for i, f in enumerate(frames):
            px = f.load(); w, h = f.size; bb = f.getbbox()
            cols = set()
            for y in range(h):
                for x in range(w):
                    r, g, b, a = px[x, y]
                    if a not in (0, 255): issues.append('%s[%d] half-transparent pixel' % (st, i)); break
                    if a: cols.add((r, g, b))
            extra = cols - pal - {(255, 255, 255)}
            if extra: issues.append('%s[%d] %d colours outside the palette' % (st, i, len(extra)))
            if bb and (bb[0] < 1 or bb[1] < 1 or bb[2] > w - 1 or bb[3] > h - 1): issues.append('%s[%d] touches the cell edge %s' % (st, i, bb))
            if ground and st not in ('death',) and bb and bb[3] != anchor[1] + 1 and st not in ('slam', 'tele', 'cast', 'hurt'):
                issues.append('%s[%d] feet at %d, anchor %d' % (st, i, bb[3] - 1, anchor[1]))
    return issues

# ---------------- shared animation parts (phase 3B) ----------------
import random
def recolor(img, mapping):
    """a palette swap (rage forms): {'#old': '#new'}"""
    m = {hexc(a)[:3]: hexc(b) for a, b in mapping.items()}; out = img.copy(); p = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            c = p[x, y]
            if c[3] and c[:3] in m: p[x, y] = m[c[:3]]
    return out

def shatter(img, k, ground, seed=5, ember=None):
    """death: the figure breaks into 4x4 chunks that fall to the ground and scatter, then fade out (k: 0..1)"""
    w, h = img.size; out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); rnd = random.Random(seed); src = img.load(); o = out.load()
    bb = img.getbbox()
    if not bb: return out
    cx = (bb[0] + bb[2]) / 2
    for by in range(bb[1], bb[3], 4):
        for bx in range(bb[0], bb[2], 4):
            vx = (bx - cx) * 0.25 + rnd.uniform(-2, 2); fall = (ground - by) * min(1, k * 1.4 * rnd.uniform(0.7, 1.1))
            keep = rnd.random() > max(0, k - 0.55) * 2.2   # chunks disappear in the second half
            if not keep: continue
            dx = round(vx * k * 3); dy = round(fall)
            for y in range(by, min(by + 4, bb[3])):
                for x in range(bx, min(bx + 4, bb[2])):
                    c = src[x, y]
                    if not c[3]: continue
                    nx, ny = x + dx, min(ground, y + dy)
                    if 1 <= nx < w - 1 and 1 <= ny < h - 1 and not o[nx, ny][3]: o[nx, ny] = c
    if ember and k < 0.9:
        for i in range(int(10 * (1 - k))):
            x = round(cx + rnd.uniform(-14, 14)); y = round(ground - rnd.uniform(2, 24) * (1 - k))
            if 1 <= x < w - 1 and 1 <= y < h - 1: o[x, y] = hexc(ember)
    return out

def std_states(draw, rage_map, ground, walk_frames=8, ember=None, slam_hit_fx=None):
    """the standard boss set from one drawing function draw(p) -> Frame-finished image. p keys:
    t (loop phase 0..1), walk (bool), raise (0..1 wind-up), strike (0..1 impact), cast (0..1), recoil (0..1), flash"""
    D = lambda **k: draw(dict(dict(t=0, walk=False, raise_=0, strike=0, cast=0, recoil=0, flash=False), **k))
    idle = [D(t=i / 6) for i in range(6)]
    walk = [D(t=i / walk_frames, walk=True) for i in range(walk_frames)]
    tele = [D(t=i / 4, raise_=(i + 1) / 4) for i in range(4)]
    slam = [D(t=0.1, raise_=1), D(t=0.2, raise_=0.5), D(t=0.3, strike=1), D(t=0.4, strike=1), D(t=0.5, strike=0.5), D(t=0.6, strike=0.2)]
    cast = [D(t=i / 6, cast=c) for i, c in enumerate([0.2, 0.5, 0.9, 1, 1, 0.5])]
    hurt = [D(recoil=0.6), D(recoil=1, flash=True), D(recoil=0.4)]
    last = D(recoil=1, t=0.5)
    death = [D(recoil=0.7, t=0.1), D(recoil=1, t=0.3, flash=True), D(recoil=1, t=0.5), last] + [shatter(last, (i + 1) / 6, ground, ember=ember) for i in range(6)]
    rage = [recolor(f, rage_map) for f in [D(t=i / 6, rage=True) for i in range(6)]]
    return {'idle': (idle, 8, True), 'walk': (walk, 10, True), 'tele': (tele, 8, False), 'slam': (slam, 12, False), 'cast': (cast, 10, False),
            'hurt': (hurt, 12, False), 'death': (death, 10, False), 'rage': (rage, 10, True)}

def build(name, draw_states, cell, anchor, palette, notes, ground_check=True, skip=()):
    import os as _os
    root = _os.path.join(_os.path.dirname(__file__), '..', '..')
    folder = _os.path.join(root, 'assets', 'sprites', name)
    save_set(name, folder, cell, anchor, draw_states, palette, notes)
    preview(name, folder, draw_states, cell, 3, _os.path.join(root, 'docs', 'sprites_3B'))
    issues = [i for i in check(name, {k: v for k, v in draw_states.items() if k not in skip}, cell, anchor, palette, ground=ground_check)]
    for i in issues: print('CHECK', i)
    print(name, 'ok', sum(len(v[0]) for v in draw_states.values()), 'frames')

def fit_states(states, cell, anchor, margin=2):
    """grows the cell (never shrinks) so every frame keeps a free border of `margin` px; the anchor moves with the
    padding, so the figure stays exactly where it was relative to its feet"""
    W, H = cell; L = T = R = B = 0
    for frames, fps, loop in states.values():
        for f in frames:
            bb = f.getbbox()
            if not bb: continue
            L = max(L, margin - bb[0]); T = max(T, margin - bb[1]); R = max(R, bb[2] + margin - W); B = max(B, bb[3] + margin - H)
    if not (L or T or R or B): return states, cell, anchor
    NW, NH = W + L + R, H + T + B; out = {}
    for st, (frames, fps, loop) in states.items():
        nf = []
        for f in frames:
            c = Image.new('RGBA', (NW, NH), (0, 0, 0, 0)); c.paste(f, (L, T)); nf.append(c)
        out[st] = (nf, fps, loop)
    return out, (NW, NH), (anchor[0] + L, anchor[1] + T)
