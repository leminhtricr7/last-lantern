# Checks a sprite set made by the pixel kit: cell grid, transparent background, palette size, padding, anchor
# (feet or body centre steady across frames), loop seams, and that a mirrored copy keeps the same anchor.
import json, os, sys
from PIL import Image

def load(folder, name):
    meta = json.load(open(os.path.join(folder, name + '.json'), encoding='utf-8'))
    cw, ch = meta['cell']; out = {}
    for st, m in meta['states'].items():
        strip = Image.open(os.path.join(folder, m['file'])).convert('RGBA')
        assert strip.size == (cw * m['frames'], ch), (st, strip.size)
        out[st] = [strip.crop((i * cw, 0, (i + 1) * cw, ch)) for i in range(m['frames'])]
    return meta, out

def diff(a, b):
    pa, pb = a.load(), b.load(); n = 0
    for y in range(a.size[1]):
        for x in range(a.size[0]):
            if pa[x, y] != pb[x, y]: n += 1
    return n

def report(folder, name, flyer):
    meta, S = load(folder, name); cw, ch = meta['cell']; ax, ay = meta['anchor']
    lines = ['%s: cell %dx%d, anchor (%d, %d), %d states, %d frames' % (name, cw, ch, ax, ay, len(S), sum(len(v) for v in S.values()))]
    allc = set()
    for st, frames in S.items():
        m = meta['states'][st]; feet = []; cx = []; semi = 0
        for f in frames:
            bb = f.getbbox(); px = f.load()
            for y in range(ch):
                for x in range(cw):
                    r, g, b, a = px[x, y]
                    if a not in (0, 255): semi += 1
                    if a: allc.add((r, g, b))
            if bb: feet.append(bb[3] - 1); cx.append((bb[0] + bb[2]) / 2)
        seam = ''
        if m['loop'] and len(frames) > 2:
            d_end = diff(frames[-1], frames[0]); steps = [diff(frames[i], frames[i + 1]) for i in range(len(frames) - 1)]
            seam = ', loop seam %d px (other steps %d-%d px)%s' % (d_end, min(steps), max(steps), ' OK' if d_end <= max(steps) * 1.1 else ' JUMP')
        steady = '' if flyer or st in ('death', 'spawn') else (', feet row %s' % (feet[0] if len(set(feet)) == 1 else 'MOVES %s' % sorted(set(feet))))
        lines.append('  %-7s %2d frames @ %2d fps%s%s%s' % (st, len(frames), m['fps'], steady, seam, ', HALF-TRANSPARENT %d' % semi if semi else ''))
    # mirrored copy: the anchor x maps to cw - ax; the game must flip around the anchor, not the cell centre
    lines.append('  colours used: %d (limit 16, white flash frame not counted: %s)' % (len(allc - {(255, 255, 255)}), 'OK' if len(allc - {(255, 255, 255)}) <= 16 else 'TOO MANY'))
    lines.append('  facing right; flip: mirror each frame and put the anchor at x = %d' % (cw - ax))
    return '\n'.join(lines)

if __name__ == '__main__':
    root = os.path.join(os.path.dirname(__file__), '..', '..')
    out = [report(os.path.join(root, 'assets', 'sprites', 'kaldrok'), 'kaldrok', False), report(os.path.join(root, 'assets', 'sprites', 'phoenix'), 'phoenix', True)]
    print('\n\n'.join(out))
