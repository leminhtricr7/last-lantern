# Prismor, Khepsar and Rimvald (map 3, 4 and 5 bosses), built on one humanoid rig.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build

def rig(f, p, C, cx, ground, hip_h, torso_h, shw, arm_l, leg_w, arm_w, lean=0):
    """draws legs, torso and arms; returns key points. C = dict of tone lists: back, mid, front"""
    t = p['t'] * 2 * math.pi; walk = p['walk']; rec = p['recoil']
    bob = abs(math.sin(t)) * 1.5 if walk else math.sin(t) * 0.7
    cx = cx - 4 * rec + lean
    hy = ground - hip_h + (2 * p['strike']) - bob * (1 if walk else 0.4)
    sy = hy - torso_h - 2 * p['raise_'] + 2 * p['strike']
    sx = cx + 2 * p['strike'] - 3 * rec
    # legs (planted foot slides back, swinging foot lifts)
    for side, tones in ((-1, C['back']), (1, C['front'])):
        ph = t + (0 if side < 0 else math.pi)
        fx = cx + side * 3 + (math.sin(ph) * 7 if walk else side * 3)
        lift = max(0, math.cos(ph)) * 4 if walk else 0
        kx = (cx + side * 3 + fx) / 2 + 2; ky = (hy + ground) / 2 - lift
        f.part([('cap', (cx + side * 3, hy), (kx, ky), leg_w, leg_w - 0.5), ('cap', (kx, ky), (fx, ground - 2 - lift - (leg_w - 1)), leg_w - 0.5, leg_w - 1), ('rect', fx - leg_w, ground - 3 - lift, leg_w * 2 + 3, 3)], tones)
    arms = {}
    # back arm
    for side, tones in ((-1, C['back']),):
        a = math.radians(15 + 25 * p['raise_'] * 6 + (math.sin(t) * 18 if walk else 0) - 30 * p['cast'])
        sh = (sx - shw, sy + 3); el = (sh[0] + math.sin(a) * arm_l * 0.5, sh[1] + math.cos(a) * arm_l * 0.5)
        hd = (el[0] + math.sin(a * 0.8) * arm_l * 0.5, el[1] + math.cos(a * 0.8) * arm_l * 0.5)
        f.part([('cap', sh, el, arm_w, arm_w - 0.5), ('cap', el, hd, arm_w - 0.5, arm_w - 0.5)], tones); arms['back'] = hd
    return dict(cx=cx, hy=hy, sx=sx, sy=sy, t=t, bob=bob, arms=arms)

def front_arm(f, p, k, shw, arm_l, arm_w, tones, extra_a=0):
    t = k['t']; walk = p['walk']
    a = 10 - (math.sin(t) * 18 if walk else 0) + 120 * p['raise_'] + 45 * p['cast'] + extra_a * (1 - p['raise_'])
    if p['strike']: a = 50
    a = math.radians(a)
    sh = (k['sx'] + shw, k['sy'] + 3); el = (sh[0] + math.sin(a) * arm_l * 0.5, sh[1] + math.cos(a) * arm_l * 0.5)
    a2 = a * 1.05 + math.radians(55 * p['raise_'] + 35 * p['strike'])   # the elbow folds: the fist rises close to the head
    hd = (el[0] + math.sin(a2) * arm_l * 0.5, el[1] + math.cos(a2) * arm_l * 0.5)
    f.part([('cap', sh, el, arm_w, arm_w - 0.5), ('cap', el, hd, arm_w - 0.5, arm_w - 0.5)], tones)
    return hd

# ======================= Prismor =======================
def prismor():
    OUT = '#0c0e18'; S0, S1, S2, S3 = '#262c3e', '#3e4660', '#5e6a88', '#8a96b0'
    P0, P1, P2, P3 = '#3a1a6a', '#6a3ab0', '#a86aff', '#e0c8ff'; CY, WH = '#6ee7f2', '#f4fcff'
    PAL = [OUT, S0, S1, S2, S3, P0, P1, P2, P3, CY, WH, '#ff3a2a', '#ff6a3a', '#ffb08a']
    W, H, G = 96, 92, 88
    C = dict(back=[S0, S0, S1, S2], mid=[S1, S2, S3, S3], front=[S1, S2, S3, WH])
    def draw(p):
        f = Frame(W, H, OUT)
        k = rig(f, p, C, 44, G, 26, 22, 13, 30, 5, 5)
        sx, sy, hy = k['sx'], k['sy'], k['hy']
        # crystal cluster on the back
        for i, (dx, h, w) in enumerate([(-12, 16, 4), (-6, 22, 5), (0, 14, 4), (-17, 10, 3)]):
            f.part([('poly', [(sx + dx - w, sy + 4), (sx + dx, sy - h), (sx + dx + w, sy + 4)])], [P0, P1, P2, P3])
        # torso slab
        f.part([('poly', [(sx - 15, sy), (sx + 14, sy - 2), (sx + 12, hy), (sx - 11, hy + 1)])], C['mid'], band=0.62)
        # imprisoned light in the heart
        g = 0.5 + 0.5 * math.sin(k['t'] * (1 + p['cast'] * 3))
        f.part([('poly', [(sx - 1, sy + 6), (sx + 6, sy + 11), (sx - 1, sy + 18), (sx - 7, sy + 11)])], [P1, P2, P3, WH])
        f.flat([('rect', sx - 2, sy + 9, 3, 4)], CY if g > 0.4 or p['cast'] > 0.5 else P2)
        if p['cast'] > 0.5: f.flat([('rect', sx - 3, sy + 8, 5, 6)], WH)
        f.line([(sx - 10, sy + 4), (sx - 5, sy + 8)], S0); f.line([(sx + 7, sy + 16), (sx + 10, hy - 2)], S0)
        # head: smooth stone, no mouth, two white slits
        hx, hdy = sx + 2, sy - 7
        f.part([('rect', hx - 6, hdy - 6, 13, 10)], C['front'])
        eye = '#ff3a2a' if p.get('rage') else WH
        f.flat([('rect', hx, hdy - 2, 3, 1), ('rect', hx + 4, hdy - 2, 2, 1)], eye)
        # front arm ends in a crystal blade
        hd = front_arm(f, p, k, 13, 30, 5.5, C['front'])
        bl = 9 if not (p['raise_'] or p['strike']) else 6
        f.part([('poly', [(hd[0] - 3, hd[1] - 2), (hd[0] + bl, hd[1] + 4), (hd[0] - 1, hd[1] + 5)])], [P1, P2, P3, WH])
        f.part([('ell', sx + 12, sy + 2, 6, 5), ('ell', sx - 13, sy + 2, 5, 4)], C['front'])
        if p['strike'] > 0.6:
            for i in range(8): f.fx.append((hd[0] - 6 + i * 3, G - 2 - (i % 3) * 2, P3 if i % 2 else CY))
        return f.finish(p['flash'])
    st = std_states(draw, {S1: '#4a2a3a', S2: '#7a3a4a', CY: '#ff6a3a', P2: '#ff6a3a', P3: '#ffb08a'}, G, ember=P2)
    build('prismor', st, (W, H), (W // 2, G), PAL + ['#4a2a3a', '#7a3a4a'], 'Prismor, the Silent Prism (map 3).', skip=('walk',))

# ======================= Khepsar =======================
def khepsar():
    OUT = '#140c06'; B0, B1, B2, B3 = '#6a5a3a', '#a89068', '#d8c498', '#f4e8c8'
    N0, N1, N2 = '#8a6a14', '#d8a82a', '#ffe08a'; L0, L1 = '#1a3a8a', '#3a6ad8'
    SK, EYE, SAND = '#2a1a10', '#ffd34e', '#e8c890'
    PAL = [OUT, B0, B1, B2, B3, N0, N1, N2, L0, L1, SK, EYE, SAND, '#ff3a2a']
    W, H, G = 92, 118, 114
    C = dict(back=[B0, B0, B1, B1], mid=[B0, B1, B2, B3], front=[B0, B1, B2, B3])
    def draw(p):
        f = Frame(W, H, OUT)
        k = rig(f, p, C, 42, G, 32, 26, 9, 30, 3.5, 3.5)
        sx, sy, hy = k['sx'], k['sy'], k['hy']
        # robe of wrappings, torn at the hem, sand trickling out
        f.part([('poly', [(sx - 10, sy), (sx + 10, sy), (sx + 13, hy + 12), (sx + 6, hy + 10), (sx + 2, hy + 14), (sx - 4, hy + 10), (sx - 12, hy + 12)])], C['mid'], band=0.6)
        for i in range(5): f.line([(sx - 9, sy + 4 + i * 6), (sx + 10, sy + 6 + i * 6)], B0)
        if p['walk'] or p['t'] > 0.4: f.fx.append((sx + 3, hy + 15 + (p['t'] * 6) % 4, SAND))
        # head: nemes headdress with faded stripes, gaunt face, sleepy glowing eyes
        hx, hdy = sx + 2, sy - 9
        f.part([('poly', [(hx - 11, hdy - 6), (hx + 7, hdy - 8), (hx + 9, hdy + 9), (hx + 4, hdy + 2), (hx - 9, hdy + 12)])], [N0, N1, N2, N2])
        for i in range(4): f.line([(hx - 10, hdy - 3 + i * 4), (hx + 7, hdy - 4 + i * 4)], L0)
        f.part([('rect', hx - 2, hdy - 4, 9, 9)], [SK, B0, B1, B1])
        eye = '#ff3a2a' if p.get('rage') else EYE
        lid = 1 if p['cast'] < 0.5 and not p['raise_'] else 2
        f.flat([('rect', hx + 1, hdy - 1, 2, lid), ('rect', hx + 4, hdy - 1, 2, lid)], eye)
        f.part([('rect', hx + 1, hdy + 5, 4, 5)], [N0, N1, N2, N2])   # false beard
        f.flat([('rect', hx - 1, hdy - 9, 3, 3)], L1)                 # cobra on the brow
        # front arm with the scarab staff
        hd = front_arm(f, p, k, 9, 30, 3.5, C['front'], extra_a=20)
        f.part([('cap', (hd[0], hd[1] - 22), (hd[0], hd[1] + 20), 1.3, 1.3)], [N0, N1, N1, N2])
        f.part([('ell', hd[0], hd[1] - 25, 4, 3.5)], [L0, L1, L1, N2]); f.px(hd[0] + 1, hd[1] - 26, EYE)
        f.part([('ell', hd[0], hd[1], 2.5, 2.5)], C['front'])
        if p['cast'] > 0.4:
            for i in range(10): a = i * 0.63 + p['t'] * 6; f.fx.append((hd[0] + math.cos(a) * 9, hd[1] - 25 + math.sin(a) * 6, SAND if i % 2 else EYE))
        return f.finish(p['flash'])
    st = std_states(draw, {L1: '#8a2a2a', L0: '#5a1414', EYE: '#ff3a2a', N2: '#ffb08a'}, G, ember=SAND)
    build('khepsar', st, (W, H), (W // 2, G), PAL + ['#8a2a2a', '#5a1414', '#ffb08a'], 'Khepsar, the One Who Begged to Sleep (map 4).', skip=('walk',))

# ======================= Rimvald =======================
def rimvald():
    OUT = '#060c1a'; C0, C1, C2, C3 = '#14244a', '#24447a', '#3a6aaa', '#6a9ad8'
    I0, I1, I2, WH = '#6ac0e8', '#a8e4ff', '#e0f8ff', '#ffffff'; SK = '#c8d8e8'; HEART = '#bff3ff'
    PAL = [OUT, C0, C1, C2, C3, I0, I1, I2, WH, SK, HEART, '#ff3a5a', '#8a1a2a', '#c03a4a']
    W, H, G = 92, 118, 114
    C = dict(back=[C0, C0, C1, C2], mid=[C0, C1, C2, C3], front=[C0, C1, C2, C3])
    def draw(p):
        f = Frame(W, H, OUT)
        k = rig(f, p, C, 42, G, 30, 26, 12, 30, 4, 4)
        sx, sy, hy = k['sx'], k['sy'], k['hy']
        # cloak flaring wide, frosted hem
        sway = math.sin(k['t']) * 2 + (3 if p['walk'] else 0)
        f.part([('poly', [(sx - 14, sy - 1), (sx + 12, sy - 1), (sx + 17, G - 3), (sx - 22 - sway, G - 3)])], C['mid'], band=0.55)
        for i in range(6): f.px(sx - 20 + i * 7 - sway * (1 - i / 6), G - 4, I2)
        # chest: the cracked ice heart
        f.part([('poly', [(sx + 1, sy + 5), (sx + 7, sy + 10), (sx + 1, sy + 16), (sx - 5, sy + 10)])], [I0, I1, I2, WH])
        heart = '#ff3a5a' if p.get('rage') else (WH if p['cast'] > 0.5 else HEART)
        f.flat([('rect', sx, sy + 9, 2, 3)], heart); f.line([(sx - 2, sy + 7), (sx + 3, sy + 13)], C0)
        # head: pale face, icicle beard, crown of ice spikes
        hx, hdy = sx + 2, sy - 7
        f.part([('rect', hx - 5, hdy - 5, 11, 10)], [C1, SK, SK, WH])
        for i in range(4): f.part([('poly', [(hx - 4 + i * 3, hdy + 4), (hx - 2 + i * 3, hdy + 11 - (i % 2) * 3), (hx + i * 3, hdy + 4)])], [I0, I1, I2, WH])
        eye = '#ff3a5a' if p.get('rage') else I0
        f.flat([('rect', hx, hdy - 1, 2, 2), ('rect', hx + 3, hdy - 1, 2, 2)], eye)
        for i, h in enumerate([7, 11, 9, 13, 8]):
            f.part([('poly', [(hx - 6 + i * 3, hdy - 4), (hx - 5 + i * 3, hdy - 4 - h), (hx - 3 + i * 3, hdy - 4)])], [I0, I1, I2, WH])
        # front arm holding an ice staff
        hd = front_arm(f, p, k, 12, 30, 4, C['front'], extra_a=15)
        f.part([('cap', (hd[0], hd[1] - 20), (hd[0], hd[1] + 18), 1.3, 1.3)], [I0, I1, I1, I2])
        f.part([('poly', [(hd[0] - 4, hd[1] - 20), (hd[0], hd[1] - 30), (hd[0] + 4, hd[1] - 20), (hd[0], hd[1] - 17)])], [I0, I1, I2, WH])
        f.part([('ell', hd[0], hd[1], 2.5, 2.5)], [C1, SK, SK, WH])
        # cold mist
        for i in range(5): f.fx.append((sx - 10 + i * 6 + math.sin(k['t'] + i) * 2, G - 6 - (i % 3) * 4, I2 if i % 2 else I1))
        if p['cast'] > 0.4:
            for i in range(8): a = i * 0.8 + p['t'] * 6; f.fx.append((hd[0] + math.cos(a) * 8, hd[1] - 26 + math.sin(a) * 7, WH if i % 2 else I1))
        return f.finish(p['flash'])
    st = std_states(draw, {C1: '#8a1a2a', C2: '#c03a4a', I0: '#ff3a5a'}, G, ember=I1)
    build('rimvald', st, (W, H), (W // 2, G), PAL, 'Rimvald, the Self-Frozen Heart (map 5).', skip=('walk',))

if __name__ == '__main__':
    which = sys.argv[1:] or ['prismor', 'khepsar', 'rimvald']
    for n in which: globals()[n]()
