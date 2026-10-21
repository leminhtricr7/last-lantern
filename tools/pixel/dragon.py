# Ignar (the young dragon of map 1) and Ignarok's three forms (map 6): Ashscale, of Three Furies, the Duskflame.
# Side view facing right, flyers: the anchor is the centre of the body. Wings flap through 6 positions.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, build, fit_states, shatter

COL = {
 0: dict(out='#2a0e06', body=['#8a3a12', '#c8601e', '#f08a3a', '#ffc070'], belly=['#c89030', '#ffd060', '#ffe8a0', '#fff4d0'], wing=['#6a2410', '#a8401a', '#e0703a', '#ffa060'], horn=['#a89878', '#e8dfc0'], eye='#fff033', fire=['#ff6a1a', '#ffd34e', '#fff6c0']),
 1: dict(out='#1e0608', body=['#5a0e14', '#8e2028', '#c83a30', '#f06a4a'], belly=['#a87020', '#d9a030', '#ffd34e', '#ffe8a0'], wing=['#3a0810', '#6a1420', '#a02a30', '#d04a40'], horn=['#a89878', '#e8dfc0'], eye='#ffe033', fire=['#ff6a1a', '#ffd34e', '#fff6c0']),
 2: dict(out='#1e0608', body=['#5a0e14', '#8e2028', '#c83a30', '#f06a4a'], belly=['#a87020', '#d9a030', '#ffd34e', '#ffe8a0'], wing=['#3a0810', '#6a1420', '#a02a30', '#d04a40'], horn=['#a89878', '#e8dfc0'], eye='#ffe033', fire=['#ff6a1a', '#ffd34e', '#fff6c0']),
 3: dict(out='#06040e', body=['#120c24', '#2a1c4a', '#4a2a78', '#6a4aa0'], belly=['#2a1a48', '#4a2a78', '#7a4ab0', '#a07ad0'], wing=['#0a0818', '#1a1238', '#3a2468', '#5a3a90'], horn=['#6a5a88', '#a898c8'], eye='#ff3aff', fire=['#7a2aff', '#c08aff', '#ffd0ff']),
}
SIZE = {0: 0.62, 1: 1.0, 2: 1.12, 3: 1.0}

def head(f, x, y, s, C, open_):
    o = round(open_ * 4 * s)
    f.part([('poly', [(x - 6 * s, y - 2 * s), (x - 12 * s, y - 9 * s), (x - 18 * s, y - 15 * s), (x - 8 * s, y - 7 * s)])], [C['horn'][0], C['horn'][0], C['horn'][1], C['horn'][1]])   # horn
    f.part([('poly', [(x - 7 * s, y - 5 * s), (x + 4 * s, y - 6 * s), (x + 14 * s, y - 2 * s), (x + 14 * s, y + 1 * s), (x - 6 * s, y + 3 * s)])], C['body'])   # upper jaw and skull
    f.part([('poly', [(x - 5 * s, y + 2 * s), (x + 12 * s, y + 2 * s + o), (x + 10 * s, y + 5 * s + o), (x - 5 * s, y + 6 * s)])], C['body'])            # lower jaw
    if o: f.flat([('poly', [(x - 2 * s, y + 2 * s), (x + 12 * s, y + 1 * s), (x + 11 * s, y + 2 * s + o), (x - 2 * s, y + 4 * s)])], C['fire'][0])
    for i in range(3): f.px(x + (3 + i * 3.5) * s, y + 1.5 * s, C['horn'][1]); f.px(x + (3 + i * 3.5) * s, y + 2 * s + o, C['horn'][1])   # teeth
    f.flat([('rect', x + 1 * s, y - 4 * s, max(2, 3 * s), max(1, 2 * s))], C['eye']); f.px(x + 2 * s, y - 4 * s, '#ffffff')
    f.px(x + 12 * s, y - 2 * s, C['out'])   # nostril

def wing(f, S, a, span, C, near):
    """a: 90 = raised, 0 = level (pointing back), negative = down. Four fingers fan out from the wrist towards the
    back and down, the membrane stretched between them."""
    ang = lambda deg: (-math.cos(math.radians(deg)), -math.sin(math.radians(deg)))   # 0 deg = backwards (left)
    d = ang(a); wr = (S[0] + d[0] * span * 0.42, S[1] + d[1] * span * 0.42)
    tips = []
    for i, (da, L) in enumerate([(12, 0.62), (-14, 0.6), (-40, 0.52), (-66, 0.4)]):
        e = ang(a + da); tips.append((wr[0] + e[0] * span * L, wr[1] + e[1] * span * L))
    back = (S[0] - span * 0.32, S[1] + span * 0.12)
    tones = C['wing'] if near else [C['wing'][0], C['wing'][0], C['wing'][1], C['wing'][1]]
    pts = [S, wr, tips[0]]
    for i in range(1, 4):   # scalloped trailing edge between the fingers
        m = ((tips[i - 1][0] + tips[i][0]) / 2, (tips[i - 1][1] + tips[i][1]) / 2)
        pts += [(m[0] + (wr[0] - m[0]) * 0.25, m[1] + (wr[1] - m[1]) * 0.25), tips[i]]
    pts += [((tips[3][0] + back[0]) / 2, (tips[3][1] + back[1]) / 2 + 2), back]
    f.part([('poly', pts)], tones, band=0.8)
    bone = C['horn'][1] if near else C['horn'][0]
    f.part([('cap', S, wr, 2.2 * span / 66, 1.6 * span / 66)], [bone, bone, bone, bone] if near else tones)
    for t in tips: f.line([wr, t], bone)
    f.px(wr[0] - 1, wr[1] - 1, C['horn'][1])   # claw on the wrist

def dragon(form, p, flash=False):
    C = COL[form]; s = SIZE[form]; W, H = round(150 * s) + 10, round(110 * s) + 10
    f = Frame(W, H, C['out'])
    cx, cy = W / 2, H / 2 + 4 * s
    flap = p.get('wing', 0); open_ = p.get('mouth', 0); pose = p.get('pose', 'fly')
    # far wing
    wing(f, (cx - 4 * s, cy - 8 * s), flap + 12, 62 * s, C, False)
    # tail: thick to thin, swaying, with a spade tip
    sway = p.get('tail', 0)
    pts = [(cx - 12 * s - i * 9 * s, cy + 2 * s + math.sin(sway + i * 0.7) * 3 * s * (i / 6) + i * 1.2 * s) for i in range(7)]
    f.part([('cap', pts[i], pts[i + 1], (9 - i * 1.2) * s, (8 - i * 1.2) * s) for i in range(6)], C['body'])
    tp = pts[-1]; f.part([('poly', [(tp[0] + 2 * s, tp[1] - 4 * s), (tp[0] - 9 * s, tp[1] - 1 * s), (tp[0] + 2 * s, tp[1] + 4 * s)])], [C['wing'][1], C['wing'][2], C['wing'][3], C['wing'][3]])
    # legs: tucked in flight, down when perched
    for side, tone in ((-1, [C['body'][0]] * 2 + C['body'][1:3]), (1, C['body'])):
        hip = (cx + side * 8 * s, cy + 6 * s)
        if pose == 'perch': kn, ft = (hip[0] + 3 * s, hip[1] + 10 * s), (hip[0] + 1 * s, hip[1] + 20 * s)
        else: kn, ft = (hip[0] - 4 * s, hip[1] + 8 * s), (hip[0] - 12 * s, hip[1] + 10 * s)
        f.part([('cap', hip, kn, 4 * s, 3 * s), ('cap', kn, ft, 3 * s, 2.2 * s)], tone)
        for i in range(3): f.px(ft[0] + (i - 1) * 2 * s, ft[1] + 2 * s, C['horn'][1])
    # body
    f.part([('ell', cx, cy, 20 * s, 12 * s)], C['body'], band=0.6)
    f.part([('ell', cx + 3 * s, cy + 6 * s, 15 * s, 5 * s)], C['belly'], band=0.9)
    for i in range(5): f.line([(cx - 9 * s + i * 5 * s, cy + 3 * s), (cx - 8 * s + i * 5 * s, cy + 10 * s)], C['belly'][0])
    for i in range(7): f.part([('poly', [(cx - 18 * s + i * 6 * s, cy - 9 * s), (cx - 15 * s + i * 6 * s, cy - 16 * s - (i % 2) * 2 * s), (cx - 12 * s + i * 6 * s, cy - 10 * s)])], [C['wing'][1], C['wing'][2], C['wing'][3], C['wing'][3]])   # back spikes
    # neck(s) and head(s)
    necks = [(0, 0)] if form != 2 else [(-6, 10), (0, 0), (8, -8)]
    for k, (dy, dx) in enumerate(necks):
        nb = (cx + 14 * s, cy - 4 * s); hp = (cx + (34 + dx) * s, cy - (18 - dy * 1.6) * s + p.get('neck', 0) * s)
        mid = ((nb[0] + hp[0]) / 2 + 2 * s, (nb[1] + hp[1]) / 2 - 3 * s)
        f.part([('cap', nb, mid, 7 * s, 6 * s), ('cap', mid, hp, 6 * s, 5 * s)], C['body'])
        head(f, hp[0] + 2 * s, hp[1], s * (0.85 if form == 2 else 1), C, open_ if (form != 2 or k == 1 or open_ > 0.5) else 0)
    # near wing
    wing(f, (cx + 2 * s, cy - 7 * s), flap, 66 * s, C, True)
    # fire breath
    if p.get('fire'):
        hx = cx + 52 * s; hy = cy - 16 * s
        for i in range(10):
            x = hx + i * 4 * s; y = hy + math.sin(i * 1.3 + p.get('tail', 0)) * 2 * s + i * 0.8 * s; r = (2 + i * 0.5) * s
            f.flat([('ell', x, y, r, r * 0.8)], C['fire'][0]); f.flat([('ell', x, y, r * 0.6, r * 0.5)], C['fire'][1])
        f.flat([('ell', hx, hy, 2 * s, 2 * s)], C['fire'][2])
    if form == 3:   # shadow wisps
        for i in range(7): f.fx.append((cx - 30 * s + i * 10 * s, cy + 18 * s + ((p.get('tail', 0) * 4 + i * 3) % 8), C['fire'][0] if i % 2 else C['wing'][2]))
    if p.get('glow'):
        f.fx.append((cx + 48 * s, cy - 18 * s, C['fire'][1])); f.fx.append((cx + 47 * s, cy - 17 * s, C['fire'][2]))
    return f.finish(flash)

def states(form):
    flaps = [75, 50, 15, -25, 5, 45]
    D = lambda **k: dragon(form, k, k.pop('flash', False) if 'flash' in k else False)
    idle = [dragon(form, dict(wing=flaps[i], tail=i / 6 * 6.28)) for i in range(6)]
    fly = [dragon(form, dict(wing=flaps[i] * 0.7 - 10, tail=i / 6 * 6.28 * 2, neck=2)) for i in range(6)]
    tele = [dragon(form, dict(wing=60 + i * 8, tail=i, neck=-3 - i, mouth=0.2 * i, glow=i > 1)) for i in range(4)]
    breath = [dragon(form, dict(wing=20 - i * 6, tail=i, neck=2, mouth=1, fire=i > 0)) for i in range(6)]
    dive = [dragon(form, dict(wing=95 - i * 10, tail=i, neck=4, mouth=0.5)) for i in range(4)]   # wings folded back (the game tilts the body)
    perch = [dragon(form, dict(wing=85 - i * 3, tail=i, pose='perch', neck=-2 + i)) for i in range(4)]
    hurt = [dragon(form, dict(wing=-30, neck=-4, mouth=0.6)), dragon(form, dict(wing=-35, neck=-5, mouth=0.7), True), dragon(form, dict(wing=10, neck=-2))]
    last = dragon(form, dict(wing=-50, neck=6, mouth=0.8))
    H = last.size[1]
    death = [dragon(form, dict(wing=-20, neck=-4, mouth=1)), dragon(form, dict(wing=-40, neck=2, mouth=1), True), dragon(form, dict(wing=-50, neck=6, mouth=0.8)), last] + [shatter(last, (i + 1) / 6, H - 3, ember=COL[form]['fire'][1]) for i in range(6)]
    evo = [dragon(form, dict(wing=flaps[i % 6], tail=i, mouth=0.5 + 0.5 * (i % 2), glow=True), i in (3, 4)) for i in range(8)]
    st = {'idle': (idle, 10, True), 'walk': (fly, 12, True), 'tele': (tele, 8, False), 'cast': (breath, 12, False), 'dive': (dive, 10, False),
          'perch': (perch, 8, False), 'hurt': (hurt, 12, False), 'death': (death, 10, False), 'evo': (evo, 12, False)}
    return st

NAMES = {0: ('ignar', 'Ignar, the Lost Hatchling (map 1).'), 1: ('ignarok1', 'Ignarok Ashscale (map 6, form 1).'), 2: ('ignarok2', 'Ignarok of Three Furies (map 6, form 2).'), 3: ('ignarok3', 'Ignarok the Duskflame (map 6, form 3).')}
if __name__ == '__main__':
    for form in [int(a) for a in sys.argv[1:]] or [0, 1, 2, 3]:
        name, note = NAMES[form]; st = states(form); W, H = st['idle'][0][0].size
        st, cell, anc = fit_states(st, (W, H), (W // 2, H // 2))
        C = COL[form]; pal = [C['out']] + C['body'] + C['belly'] + C['wing'] + C['horn'] + [C['eye'], '#ffffff'] + C['fire']
        build(name, st, cell, anc, pal, note + ' Flyer: anchor = body centre.', ground_check=False)
