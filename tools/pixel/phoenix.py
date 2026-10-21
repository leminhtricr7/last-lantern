# The Relit Phoenix (summon of the Pyreplume sword) - phase 3A sample.
# A firebird: crimson body, wings that burn from red at the root to gold at the feather tips, a crest of three
# flame plumes, three long flame streamers for a tail, embers around it. Facing right, cell 80x80, a flyer: the
# anchor is the centre of its body (40, 40).
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, save_set, preview, check

OUT = '#2a0a0a'
R0, R1, R2, O, G, Y, WH = '#5a0e0c', '#8a1a12', '#d8381a', '#ff7a1a', '#ffc23a', '#ffe86a', '#fff6d0'
A0, A1, A2 = '#3e3842', '#6a6270', '#a8a0aa'
PAL = [OUT, R0, R1, R2, O, G, Y, WH, A0, A1, A2]
W = H = 80; ANCHOR = (42, 46)

def mix(fire, ash, k):   # fire colours turn to ash as k goes 0 -> 1 (death)
    return ash if k >= 0.5 else fire

def wing(f, S, a, span, tones, tip_tones, far=False):
    """a = wing angle in degrees: 90 = straight up, 0 = level (pointing back), negative = down. The leading edge runs
    shoulder -> wrist -> tip; long feathers hang off its trailing side and burn from red to gold at the ends."""
    r = math.radians(a); d = (-math.cos(r) * 0.75, -math.sin(r)); L0 = math.hypot(*d); d = (d[0] / L0, d[1] / L0)
    r2 = math.radians(a - 22); d2 = (-math.cos(r2) * 0.85, -math.sin(r2)); L1 = math.hypot(*d2); d2 = (d2[0] / L1, d2[1] / L1)
    wr = (S[0] + d[0] * span, S[1] + d[1] * span); tp = (wr[0] + d2[0] * span * 0.95, wr[1] + d2[1] * span * 0.95)
    def edge(t): return (S[0] + (wr[0] - S[0]) * 2 * t, S[1] + (wr[1] - S[1]) * 2 * t) if t < 0.5 else (wr[0] + (tp[0] - wr[0]) * (2 * t - 1), wr[1] + (tp[1] - wr[1]) * (2 * t - 1))
    n = (d[1], -d[0])                     # the trailing side of the wing
    if n[1] < 0 and abs(n[1]) > abs(n[0]): n = (-n[0], -n[1])
    feathers = []
    pts = [S, wr, tp]
    for i in range(7, 0, -1):
        t = i / 7.4; e = edge(t); L = 5 + 9 * t
        tipf = (e[0] + n[0] * L - d2[0] * 2, e[1] + n[1] * L - d2[1] * 2); notch = (e[0] + n[0] * L * 0.45, e[1] + n[1] * L * 0.45)
        pts += [tipf, notch]; feathers.append((notch, tipf, 1.6 + t))
    pts.append((S[0] + n[0] * 5, S[1] + n[1] * 5))
    f.part([('poly', pts)], tones, band=0.75)
    for notch, tipf, w in feathers: f.part([('cap', notch, tipf, w, 1.0)], tip_tones)   # burning feather ends

def phoenix(p, flash=False):
    f = Frame(W, H, OUT)
    ash = p.get('ash', 0); fire_t = [R1, R2, O, Y]; far_t = [R0, R1, R2, R2]
    if ash >= 0.5: fire_t, far_t = [A0, A1, A2, A2], [A0, A0, A1, A1]
    bx, by = 42 + p.get('dx', 0), 46 + p.get('dy', 0)
    a = p.get('wing', 30); tail = p.get('tail', 0.0); glow = p.get('glow', 0.5); scale = p.get('scale', 1.0)
    # embers drifting around (particles)
    if ash < 0.5:
        for i in range(p.get('embers', 6)):
            t = (p.get('seed', 0) + i * 0.23) % 1   # seed = phase of the loop
            f.fx.append((bx - 14 - t * 16 + math.sin(i * 2 + t * 6) * 3, by + 6 - t * 18 + i % 3, G if i % 2 else O))
    # far wing (behind, darker)
    wing(f, (bx - 2, by - 4), a + 14, 15 * scale, far_t, [R1, R2, O, O] if ash < 0.5 else [A0, A0, A1, A1], True)
    # tail: three flame streamers waving behind
    if ash < 0.5:
        for j, (col, ln, off) in enumerate([(R2, 22, -3), (O, 26, 0), (G, 20, 3)]):
            pts = []
            for i in range(7):
                t = i / 6; x = bx - 8 - t * ln * min(scale, 1.05); y = by + 2 + off * t * 1.6 + math.sin(tail + t * 4 + j) * 3 * t
                pts.append((x, y))
            f.part([('cap', pts[i], pts[i + 1], 3.2 - i * 0.4, 3.0 - i * 0.4) for i in range(6)], [R1, col, Y if j else G, Y])
    else:
        f.part([('poly', [(bx - 8, by), (bx - 20, by + 3), (bx - 8, by + 4)])], fire_t)
    # body and head
    f.part([('ell', bx, by, 9 * scale, 6 * scale), ('cap', (bx + 4, by - 3), (bx + 9, by - 10), 4, 3)], fire_t, band=0.65)   # body and a tall neck
    if ash < 0.5: f.flat([('ell', bx + 2, by + 2, 5, 2.5)], G)   # glowing breast
    hx, hy = bx + 11, by - 12
    f.part([('ell', hx, hy, 4.5, 4)], fire_t)
    f.part([('poly', [(hx + 3, hy - 2), (hx + 10, hy + 1), (hx + 3, hy + 2)])], [mix(O, A0, ash), mix(G, A1, ash), mix(Y, A2, ash), mix(Y, A2, ash)])   # beak
    f.px(hx + 1, hy - 1, WH if ash < 0.5 else A2); f.px(hx + 2, hy - 1, OUT)
    # crest: three flame plumes sweeping back
    if ash < 0.5:
        cf = 1 + glow * 0.6
        for i, (col, L) in enumerate([(R2, 9), (O, 12), (G, 8)]):
            ang = math.radians(150 - i * 18 + math.sin(tail + i) * 6)
            tip = (hx - 1 + math.cos(ang) * L * cf, hy - 3 - math.sin(ang) * L * cf)
            f.part([('cap', (hx - 1, hy - 3), tip, 1.6, 0.8)], [R1, col, Y, Y])
    # near wing
    wing(f, (bx + 1, by - 3), a, 17 * scale, fire_t, [O, G, Y, WH] if ash < 0.5 else [A1, A1, A2, A2])
    # hot glow on the breast when charged
    if glow > 0.8 and ash < 0.5: f.flat([('ell', bx + 2, by + 2, 3, 1.5)], WH)
    # fireballs (attack)
    for (x, y, r) in p.get('balls', []):
        f.flat([('ell', x, y, r, r)], O); f.flat([('ell', x, y, r - 1.2, r - 1.2)], Y)
    # death: ash crumbles away
    if p.get('crumble', 0) > 0:
        c = p['crumble']; img = f.img.load(); import random; rnd = random.Random(7)
        for y in range(H):
            for x in range(W):
                if img[x, y][3] and rnd.random() < c: img[x, y] = (0, 0, 0, 0)
        for i in range(int(18 * c)):
            f.fx.append((bx - 10 + rnd.random() * 24, min(H - 3, by + 4 + c * 22 * rnd.random()), A1 if i % 2 else A2))
    return f.finish(flash)

def hover():
    return [phoenix(dict(wing=30 + 55 * math.sin(i / 6 * 2 * math.pi), dy=round(-2 * math.sin(i / 6 * 2 * math.pi + 0.6)), tail=i / 6 * 2 * math.pi, seed=i / 6)) for i in range(6)]
def move():
    return [phoenix(dict(wing=8 + 35 * math.sin(i / 6 * 2 * math.pi), dx=2, dy=round(-1 * math.sin(i / 6 * 2 * math.pi)), tail=i / 6 * 2 * math.pi * 2, seed=i / 6, embers=9)) for i in range(6)]
def tele():   # wings raised high, crest flaring, rising a little
    return [phoenix(dict(wing=40 + 20 * i, dy=-i, glow=0.5 + i * 0.17, tail=i, seed=i, embers=6 + i * 2)) for i in range(4)]
def attack():  # a great downstroke throws fireballs forward
    W_ = [100, 70, 10, -28, -32, 10]
    out = []
    for i, w in enumerate(W_):
        balls = [] if i < 2 else [(56 + (i - 2) * 3 + k * 5, 56 + (i - 2) * 3 + k * 4, 3 - k * 0.5) for k in range(min(3, i - 1))]
        out.append(phoenix(dict(wing=w, dy=2 if i in (2, 3) else 0, dx=1 if i in (2, 3) else 0, glow=1.0 if i in (1, 2) else 0.6, tail=i, seed=i, balls=balls)))
    return out
def hurt():
    return [phoenix(dict(wing=-10, dx=-3, dy=-1, tail=1, seed=0)), phoenix(dict(wing=-20, dx=-4, dy=-1, tail=2, seed=1), flash=True), phoenix(dict(wing=10, dx=-2, tail=3, seed=2))]
def death():   # the flames die, the bird turns to grey ash, the ash crumbles away
    out = []
    for i in range(8):
        k = i / 7
        out.append(phoenix(dict(wing=24 - i * 3, dy=min(i * 2, 5), ash=0 if i < 2 else 1, crumble=max(0, (i - 3) / 4.5), tail=i, seed=i, embers=6 - i, glow=0.2)))
    return out
def spawn():   # an ember swells into a ball of fire that bursts into the bird
    out = []
    for i in range(6):
        if i < 3:
            f = Frame(W, H, OUT); r = 2 + i * 4
            f.flat([('ell', 42, 46, r, r)], O); f.flat([('ell', 42, 46, max(1, r - 2), max(1, r - 2))], Y); f.flat([('ell', 42, 46, max(1, r - 4), max(1, r - 4))], WH)
            for j in range(6 + i * 4): ang = j * 1.1 + i; f.fx.append((42 + math.cos(ang) * (r + 3), 46 + math.sin(ang) * (r + 3), G if j % 2 else O))
            out.append(f.finish())
        else: out.append(phoenix(dict(wing=95 - (i - 3) * 30, glow=1.0, tail=i, seed=i, embers=14 - i * 2, scale=0.85 + (i - 3) * 0.05)))
    return out
def evo():   # the summon grows into its great form: a white-hot flare, then bigger wings and a longer tail
    out = []
    for i in range(8):
        k = i / 7
        out.append(phoenix(dict(wing=30 + 60 * math.sin(k * math.pi), glow=1.0, tail=i, seed=i, embers=8 + i, scale=1.0 + 0.12 * k), flash=(i == 3)))
    return out

STATES = {'idle': (hover(), 10, True), 'walk': (move(), 12, True), 'tele': (tele(), 8, False), 'attack': (attack(), 12, False),
          'hurt': (hurt(), 12, False), 'death': (death(), 10, False), 'spawn': (spawn(), 12, False), 'evo': (evo(), 10, False)}

if __name__ == '__main__':
    root = os.path.join(os.path.dirname(__file__), '..', '..')
    folder = os.path.join(root, 'assets', 'sprites', 'phoenix')
    save_set('phoenix', folder, (W, H), ANCHOR, STATES, PAL, 'Relit Phoenix (Pyreplume). A flyer: "walk" is its flight cycle; the anchor is the centre of the body.')
    preview('phoenix', folder, STATES, (W, H), 3, os.path.join(root, 'docs', 'sprites_3A'))
    for i in check('phoenix', STATES, (W, H), ANCHOR, PAL, ground=False): print('CHECK', i)
    print('ok')
