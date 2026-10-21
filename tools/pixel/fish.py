# Phase 6 fish samples: Lantern Carp (B, small) and Abyss Lantern Angler (SS, big). Same state set for every fish:
# idle, swim, hooked (struck on the line), thrash (fighting), hurt (white flash), death (belly up, dissolves).
# The body is a chain of tapered segments along a "spine" that waves with phase t, so every size can share the code.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageOps
from pix import Frame, save_set, preview, check, hexc

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')

def spine(n, x0, x1, y, amp, t, tw, curl=0.0, arch=0.0, head=0.0):
    """n nodes from the nose (x0) to the tail base (x1); the tail waves more than the head; curl bends the body into a C"""
    pts = []
    for i in range(n):
        u = i / (n - 1)
        x = x0 + (x1 - x0) * u
        yy = y + amp * math.sin(t - u * tw) * (u ** 1.3) * 2.2 + curl * (u ** 1.6) * 6 - arch * math.sin(u * math.pi) * 3 - head * (1 - u) * 3
        pts.append((x, yy))
    return pts

def caps(pts, rad):
    return [('cap', pts[i], pts[i + 1], rad[i], rad[i + 1]) for i in range(len(pts) - 1)]

def dissolve(img, k, seed=3):
    """death: pixels drop out in a fixed random order as k goes 0..1"""
    out = img.copy(); p = out.load(); w, h = img.size
    for y in range(h):
        for x in range(w):
            if p[x, y][3] and ((x * 73 + y * 151 + seed * 31) % 97) / 97.0 < k: p[x, y] = (0, 0, 0, 0)
    return out

def states_for(draw, cell, deathfn=None):
    D = lambda **k: draw(dict(dict(t=0, amp=0.4, curl=0, arch=0, head=0, flash=False, rec=0, jaw=0, dead=False), **k))
    idle = [D(t=i / 6 * 2 * math.pi, amp=0.35) for i in range(6)]
    swim = [D(t=i / 8 * 2 * math.pi, amp=1.0) for i in range(8)]
    hooked = [D(t=0.5 * i, amp=0.5, arch=a, head=h, jaw=1) for i, (a, h) in enumerate([(0.5, 0.6), (1.0, 1.0), (0.8, 0.8)])]
    thrash = [D(t=i * 1.6, amp=1.5, curl=c, jaw=1) for i, c in enumerate([1, -1, 0.9, -0.9])]
    hurt = [D(amp=0.6, rec=1, flash=True), D(amp=0.5, rec=0.5)]
    first = D(amp=0.3, rec=1)
    death = [D(amp=0.4, rec=1, flash=True), first] + [D(amp=0.2, t=i, dead=True, k=(i + 1) / 5) for i in range(4)]
    return {'idle': (idle, 7, True), 'swim': (swim, 10, True), 'hooked': (hooked, 10, False), 'thrash': (thrash, 12, True), 'hurt': (hurt, 12, False), 'death': (death, 8, False)}

def finish_frame(f, p, cell):
    img = f.finish(flash=p['flash'])
    if p.get('dead'):
        w, h = img.size; cy = cell[1] // 2
        img = ImageOps.flip(img)                                  # belly up
        sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); k = p['k']
        sh.paste(img, (0, -int(k * 2)))                           # rises a little as it floats up
        img = dissolve(sh, max(0, k - 0.45) * 1.8)
    return img

# ===================== Lantern Carp (B, 24x14 body in a 32x20 cell) =====================
CARP = dict(OUT='#2a1208', D='#a8461a', M='#e0702a', L='#ff9a3a', H='#ffc878', FD='#b8501c', FM='#f08a3a', FL='#ffc27a', GLOW='#fff6c0', EYE='#14101c', WHITE='#ffffff', BELLY='#ffe6a8')
def carp_draw(p):
    c = CARP; f = Frame(48, 32, c['OUT']); t = p['t']; rec = p['rec']
    pts = spine(7, 34 - 2 * rec, 13 - 2 * rec, 16 + rec * 1, p['amp'], t, 2.4, p['curl'], p['arch'], p['head'])
    rad = [2.9, 4.6, 5.1, 4.5, 3.3, 2.0, 1.1]
    xb, yb = pts[-1]; wag = math.sin(t * 2 - 2.4) * 2.2 * (0.5 + p['amp'])
    # tail fin, dorsal and pectoral fins first (behind the body)
    f.part([('poly', [(xb + 1, yb), (xb - 6, yb - 5 - abs(wag) * 0.3 + wag * 0.4), (xb - 4, yb), (xb - 6, yb + 5 + abs(wag) * 0.3 + wag * 0.4)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    d2, d3, d4 = pts[2], pts[3], pts[4]; fl = math.sin(t * 2) * 1.2
    f.part([('poly', [(d2[0] + 1, d2[1] - 4.4), (d3[0] + 1 + fl, d3[1] - 8.2), (d4[0] - 1, d4[1] - 3.6), (d3[0], d3[1] - 3)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    p1 = pts[2]; f.part([('poly', [(p1[0] + 1, p1[1] + 3), (p1[0] - 4 - fl * 0.5, p1[1] + 7), (p1[0] - 1, p1[1] + 4)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    f.part(caps(pts, rad), [c['D'], c['M'], c['L'], c['H']], band=0.62)
    # lantern spots along the back: they pulse, and the belly is pale
    n0 = pts[1]; f.line([(n0[0] - 1, n0[1] + 3), (pts[3][0], pts[3][1] + 3.2), (pts[4][0], pts[4][1] + 2.2)], c['BELLY'])
    for i, (a, b) in enumerate([(1, -3.4), (2, -3.9), (3, -3.2)]):
        x, y = pts[a]; f.px(x - 1, y + b + 0.6, c['GLOW'] if math.sin(t * 2 + i * 2) > -0.3 else c['H'])
    # head: eye, mouth, barbels
    hx, hy = pts[0]; ex, ey = hx - 3.2, hy - 1.6
    f.flat([('rect', round(ex), round(ey), 2, 2)], c['WHITE']); f.px(ex + 1, ey + 1, c['EYE'])
    f.px(hx + 1.5, hy + 1.5, c['EYE'] if p['jaw'] else c['D'])
    f.line([(hx + 1, hy + 2), (hx + 3, hy + 3.5)], c['L'], False); f.line([(hx, hy + 2.5), (hx + 1.5, hy + 4.5)], c['L'], False)
    return finish_frame(f, p, (48, 32))

# ===================== Abyss Lantern Angler (SS, ~60x44 body in an 84x60 cell) =====================
ANG = dict(OUT='#0a0812', D='#1a1c3a', M='#2c2f62', L='#454a8c', H='#6a70b8', FD='#2a1e52', FM='#4a3a8a', FL='#7a66c0', TEETH='#eef0f8', EYE='#ffd34e', PUP='#14101c', BULB='#ffe88a', BULB2='#fff8d0', GLOW='#7ef0ff', STALK='#3a2a6a', MOUTH='#5a1428')
def ang_draw(p):
    c = ANG; f = Frame(96, 72, c['OUT']); t = p['t']; rec = p['rec']
    cx, cy = 48 - 3 * rec + math.sin(t) * 0.4, 36 + math.sin(t * 2) * 1.2 - p['head'] * 1.5
    jaw = p['jaw'] * 5 + (3 if p['amp'] > 1 else 0)
    # tail: a tapering chain behind the body
    tp = spine(6, cx - 10, cx - 30, cy + 2, p['amp'] * 1.3, t, 2.6, p['curl'], p['arch'], 0)
    f.part(caps(tp, [9, 7.5, 6, 4.6, 3.2, 2]), [c['D'], c['M'], c['L'], c['H']], band=0.66)
    xb, yb = tp[-1]; wag = math.sin(t * 2 - 2.6) * 3 * (0.5 + p['amp'])
    f.part([('poly', [(xb + 1, yb), (xb - 9, yb - 11 + wag * 0.4), (xb - 6, yb), (xb - 9, yb + 11 + wag * 0.4)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    # dorsal spines and the pectoral fin
    for i, dx in enumerate([-8, -1, 6]):
        sw = math.sin(t * 2 + i) * 1.5; f.part([('poly', [(cx + dx - 3, cy - 11), (cx + dx - 1 + sw, cy - 19 + i), (cx + dx + 3, cy - 11)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    pf = math.sin(t * 2) * 3; f.part([('poly', [(cx - 3, cy + 7), (cx - 15, cy + 15 + pf), (cx - 7, cy + 14 + pf), (cx + 3, cy + 10)])], [c['FD'], c['FM'], c['FL'], c['FL']], band=0.8)
    # lower jaw (hinged at the back), then the big body and head
    f.part([('poly', [(cx - 2, cy + 5), (cx + 22, cy + 2 + jaw), (cx + 21, cy + 8 + jaw), (cx, cy + 14)])], [c['D'], c['M'], c['L'], c['H']], band=0.7)
    f.part([('ell', cx, cy, 17, 14), ('ell', cx + 9, cy - 3, 12, 10)], [c['D'], c['M'], c['L'], c['H']], band=0.64)
    # the mouth: a dark red inside between the jaws, then needle teeth pointing down from the upper jaw and up from the lower one
    x0, x1 = cx + 6, cx + 22; ly = lambda x: cy + 2 + jaw * (x - (cx - 2)) / 24.0
    if jaw > 0.5: f.flat([('poly', [(x0, cy + 2), (x1, cy + 2), (x1, ly(x1) + 1), (x0, ly(x0) + 1)])], c['MOUTH'])
    for i in range(7):
        x = cx + 8 + i * 2.2; f.flat([('poly', [(x, cy + 2), (x + 1.1, cy + 5 + (i % 2)), (x + 2.2, cy + 2)])], c['TEETH'])
    for i in range(6):
        x = cx + 9 + i * 2.6; y = ly(x); f.flat([('poly', [(x, y + 1), (x + 1.3, y - 2), (x + 2.6, y + 1)])], c['TEETH'])
    # the eye
    ex, ey = cx + 9, cy - 6
    f.flat([('ell', ex, ey, 3.2, 3.2)], c['EYE']); f.flat([('ell', ex + 0.8, ey, 1.4, 2.2)], c['PUP']); f.px(ex - 0.8, ey - 1.2, '#ffffff')
    # glowing dots along the flank
    for i, (dx, dy) in enumerate([(-10, 2), (-5, 5), (0, 7), (-14, -3), (-6, -7), (3, 9)]):
        f.px(cx + dx, cy + dy, c['GLOW'] if math.sin(t * 2 + i * 1.3) > -0.2 else c['H'])
    # the lure: a stalk from the forehead, swaying, with a glowing bulb (dims when the fish dies)
    sway = math.sin(t + 1) * 2.5 + (p['curl'] * 3); gl = 0.3 if p.get('dead') else 1
    s0 = (cx + 6, cy - 12); s1 = (cx + 13 + sway * 0.5, cy - 24); s2 = (cx + 24 + sway, cy - 22 + abs(sway) * 0.3)
    f.line([s0, s1, s2], c['STALK'], False); f.line([(s0[0] + 1, s0[1]), (s1[0] + 1, s1[1]), (s2[0], s2[1])], c['STALK'], False)
    f.flat([('ell', s2[0], s2[1] + 2, 4.2, 4.2)], c['BULB']); f.flat([('ell', s2[0] - 0.8, s2[1] + 1.2, 2.2, 2.2)], c['BULB2'])
    if gl > 0.5:
        for k in range(8):
            a = k / 8 * 2 * math.pi + t * 0.3; r = 7 + (k % 2) * 2; f.fx.append((s2[0] + math.cos(a) * r, s2[1] + 2 + math.sin(a) * r, c['GLOW'] if k % 2 else c['BULB']))
    return finish_frame(f, p, (96, 72))

def build_one(name, draw, cell, anchor, pal, scale, notes):
    st = states_for(draw, cell)
    # the death frames carry their own k; the draw functions read p['k'] only when dead
    folder = os.path.join(ROOT, 'assets', 'sprites', name)
    meta = save_set(name, folder, cell, anchor, st, pal, notes)
    out = os.path.join(ROOT, 'docs', 'sprites_6'); preview(name, folder, st, cell, scale, out)
    for i in check(name, st, cell, anchor, pal, ground=False): print('CHECK', i)
    print(name, 'ok', sum(len(v[0]) for v in st.values()), 'frames')

if __name__ == '__main__':
    build_one('f_lanterncarp', carp_draw, (48, 32), (24, 16), list(CARP.values()), 6, 'Lantern Carp (rank B). Faces right; anchor = body centre; flip around the anchor.')
    build_one('f_abysslantern', ang_draw, (96, 72), (48, 36), list(ANG.values()), 3, 'Abyss Lantern Angler (rank SS). Faces right; anchor = body centre; flip around the anchor.')
