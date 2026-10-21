# Measures the visible body of each boss sheet (idle frames): the box around the solid core of the figure, leaving out
# thin parts that should not hurt on touch (staffs, legs of spiders, tentacle tips, smoke, horns' tips).
# A column or row counts as body when at least 30% of it (within the figure's box) is filled.
import json, os, sys
from PIL import Image
def body(folder, name, scale=1.0):
    m = json.load(open(os.path.join(folder, name + '.json'), encoding='utf-8')); cw, ch = m['cell']; ax, ay = m['anchor']
    strip = Image.open(os.path.join(folder, m['states']['idle']['file'])).convert('RGBA')
    n = m['states']['idle']['frames']; acc = [[0] * cw for _ in range(ch)]
    for i in range(n):
        f = strip.crop((i * cw, 0, (i + 1) * cw, ch)).load()
        for y in range(ch):
            for x in range(cw):
                if f[x, y][3]: acc[y][x] += 1
    on = [[acc[y][x] * 2 >= n for x in range(cw)] for y in range(ch)]
    ys = [y for y in range(ch) if any(on[y])]; xs = [x for x in range(cw) if any(on[y][x] for y in range(ch))]
    y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
    colfill = [sum(on[y][x] for y in range(y0, y1 + 1)) / (y1 - y0 + 1) for x in range(cw)]
    cols = [x for x in range(x0, x1 + 1) if colfill[x] >= 0.3]
    rowfill = [sum(on[y][x] for x in cols) / max(1, len(cols)) for y in range(ch)]
    rows = [y for y in range(y0, y1 + 1) if rowfill[y] >= 0.12]
    bx0, bx1, by0 = min(cols), max(cols), min(rows)
    w = round((bx1 - bx0 + 1) * scale); h = round((ay - by0 + 1) * scale)
    off = round(((bx0 + bx1) / 2 - ax) * scale)   # body centre minus anchor (x), in world pixels
    return w, h, off
if __name__ == '__main__':
    root = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'sprites')
    out = {}
    for n in sorted(os.listdir(root)):
        if n == 'phoenix': continue
        out[n] = body(os.path.join(root, n), n, 1.5 if n == 'oktavor' else 1.0)
    print(json.dumps(out))
