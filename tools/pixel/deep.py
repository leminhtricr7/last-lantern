# Morvella, Oktavor and Vorgrub (map 7, 8, 9 bosses) - the big creatures of the deep lands.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build

# ======================= Morvella, the Swamp's Lullaby =======================
def morvella():
    OUT = '#100818'; M0, M1, M2, M3 = '#3a1a5a', '#6a2a8a', '#9a4ab8', '#c87ae0'
    D0, D1 = '#7ee8c0', '#d8fff0'; ST0, ST1, ST2 = '#8a8a7a', '#c8d0b8', '#e8f0d8'
    R0, R1 = '#4a3a2a', '#7a5a3a'; FACE, EYE = '#e8e0d0', '#2a1a3a'
    PAL = [OUT, M0, M1, M2, M3, D0, D1, ST0, ST1, ST2, R0, R1, FACE, EYE, '#ff3a5a', '#8a1a3a']
    W, H, G = 112, 112, 108
    def draw(p):
        f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
        sway = math.sin(t) * 2 + (3 * math.sin(t * 2) if p['walk'] else 0); rec = p['recoil']
        cx = 56 - 4 * rec; top = 18 - 4 * p['raise_'] + 6 * p['strike'] + math.sin(t) * 1
        # root feet spreading on the ground
        for i, dx in enumerate([-22, -10, 6, 20]):
            k = (math.sin(t + i) * 2 if p['walk'] else 0)
            f.part([('cap', (cx + dx * 0.3, G - 22), (cx + dx + k, G - 4), 3, 2), ('ell', cx + dx + k, G - 3, 4, 2)], [R0, R0, R1, R1])
        # stalk and the skirt of gills
        f.part([('poly', [(cx - 9, top + 34), (cx + 9, top + 34), (cx + 12, G - 16), (cx - 12, G - 16)])], [ST0, ST1, ST2, ST2], band=0.6)
        for i in range(7): f.part([('poly', [(cx - 18 + i * 6, G - 22), (cx - 15 + i * 6, G - 8 - (i % 2) * 3), (cx - 12 + i * 6, G - 22)])], [M0, M1, M2, M2])
        # root arms
        ra = 30 * p['cast'] + 60 * p['raise_'] - 20 * p['strike']
        for s, tones in ((-1, [R0, R0, R1, R1]), (1, [R0, R1, R1, ST0])):
            a = math.radians(40 + ra + sway * 3) * s
            sh = (cx + s * 9, top + 40); el = (sh[0] + math.sin(a) * 14, sh[1] + math.cos(a) * 12)
            hd = (el[0] + s * 8, el[1] + 10 - 18 * (p['cast'] + p['raise_']))
            f.part([('cap', sh, el, 3, 2.5), ('cap', el, hd, 2.5, 1.5)], tones)
            for j in range(3): f.part([('cap', hd, (hd[0] + s * (3 + j * 2), hd[1] + (j - 1) * 4), 1.2, 0.7)], tones)
        # the face under the cap: kind, sleeping, unsettling
        FY = top + 38
        f.part([('ell', cx + 3, FY, 10, 9)], [ST0, FACE, FACE, ST2])
        shut = not (p['cast'] > 0.5 or p['raise_'] > 0.6 or p.get('rage'))
        if shut:
            f.line([(cx + 1, FY - 2), (cx + 4, FY - 1)], EYE, False); f.line([(cx + 7, FY - 2), (cx + 10, FY - 1)], EYE, False)
        else:
            eye = '#ff3a5a' if p.get('rage') else D0
            f.flat([('rect', cx + 1, FY - 3, 3, 2), ('rect', cx + 7, FY - 3, 3, 2)], eye)
        f.line([(cx + 3, FY + 4), (cx + 6, FY + 5), (cx + 9, FY + 4)], ST0, False)
        # the great cap with glowing spots
        cap_w = 34 + 2 * p['raise_']
        f.part([('ell', cx + sway * 0.5, top + 14, cap_w, 15), ('rect', cx - cap_w + 2 + sway * 0.5, top + 14, cap_w * 2 - 4, 6)], [M0, M1, M2, M3], band=0.7)
        for i, (dx, dy, r) in enumerate([(-20, 8, 3), (-8, 2, 4), (6, 5, 3), (18, 9, 3), (-14, 16, 2), (12, 15, 2), (0, 12, 2)]):
            glow = D1 if (math.sin(t * 2 + i) > 0.5 or p['cast'] > 0.5) else D0
            f.flat([('ell', cx + dx + sway * 0.5, top + dy, r, r * 0.8)], glow)
        f.line([(cx - cap_w + 3 + sway * 0.5, top + 20), (cx + cap_w - 3 + sway * 0.5, top + 20)], M0)
        # drifting spores
        for i in range(8):
            u = (p['t'] + i * 0.13) % 1
            f.fx.append((cx - 30 + i * 9 + math.sin(u * 6 + i) * 3, top + 10 - u * 14 + (i % 3) * 20, D0 if i % 2 else D1))
        return f.finish(p['flash'])
    st = std_states(draw, {M1: '#8a1a3a', M2: '#c03a5a', D0: '#ff3a5a'}, G, ember=D0)
    build('morvella', st, (W, H), (W // 2, G), PAL + ['#c03a5a'], "Morvella, the Swamp's Lullaby (map 7). Glides on root feet.", skip=('walk',))

# ======================= Oktavor, Drowner of the Eighth Tower =======================
def oktavor():
    OUT = '#12060c'; K0, K1, K2, K3 = '#3a0e22', '#6a1a3a', '#9a2a4a', '#c8506a'
    SU, SU2 = '#e8a0b0', '#ffd0d8'; EY, EY2 = '#ffd34e', '#14060a'; BK = '#1a1418'
    CH0, CH1 = '#4a4a5a', '#8a8aa0'; SC = '#e8c8a0'
    PAL = [OUT, K0, K1, K2, K3, SU, SU2, EY, EY2, BK, CH0, CH1, SC, '#ff3a2a', '#5a2a8a', '#8a4ab8']
    W, H, G = 144, 120, 116
    def draw(p):
        f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi; rec = p['recoil']
        cx = 72 - 5 * rec; hy = 44 + math.sin(t) * 2 - 4 * p['raise_'] + 6 * p['strike']
        # eight tentacles curling out from under the head
        for i in range(8):
            side = -1 if i < 4 else 1; j = i % 4
            base = (cx + (j - 1.5) * 6, hy + 20)
            reach = 26 + j * 6 + 10 * p['raise_'] * (1 if j == 3 and side > 0 else 0)
            pts = [base]
            for k in range(1, 8):
                u = k / 7; wav = math.sin(t * (1.5 if p['walk'] else 1) + i + u * 4) * 6 * u
                ang = side * (0.5 + j * 0.25) + wav * 0.05 + (side * p['strike'] * 0.4 if j > 1 else 0)
                x = base[0] + math.sin(ang) * reach * u * 1.4 + wav * 0.5
                y = base[1] + math.cos(ang) * reach * u * 0.9 + (G - base[1] - 6) * u * u * (0.6 if not p['raise_'] else 0.3)
                pts.append((x, min(G - 3, y)))
            tones = [K0, K0, K1, K2] if (i % 2 == 0) else [K0, K1, K2, K3]
            f.part([('cap', pts[k], pts[k + 1], 4.5 - k * 0.55, 4 - k * 0.55) for k in range(7)], tones)
            for k in (2, 3, 4): f.px(pts[k][0], pts[k][1] + 2, SU)
            if i == 6 and p['raise_'] > 0.5:   # a tentacle grips a broken piece of the tower
                f.part([('rect', pts[6][0] - 3, pts[6][1] - 6, 6, 8)], [CH0, CH0, CH1, CH1])
        # chain wrapped around two arms
        for k in range(6): f.px(cx - 14 + k * 3, hy + 30 + (k % 2), CH1)
        # the mantle (head) with a scar shaped like an anchor
        f.part([('ell', cx - 4, hy - 6, 22, 24), ('ell', cx + 2, hy + 10, 18, 12)], [K0, K1, K2, K3], band=0.7)
        f.line([(cx - 14, hy - 14), (cx - 14, hy + 2)], SC); f.line([(cx - 18, hy - 10), (cx - 10, hy - 10)], SC); f.line([(cx - 18, hy + 1), (cx - 14, hy + 4), (cx - 10, hy + 1)], SC)
        # eyes: golden with a horizontal slit
        rage = p.get('rage')
        for ex in (cx + 4, cx + 16):
            f.flat([('ell', ex, hy + 8, 4, 3.5)], '#ff3a2a' if rage else EY)
            f.flat([('rect', ex - 3, hy + 8, 6, 1)], EY2)
        f.part([('poly', [(cx + 8, hy + 14), (cx + 13, hy + 14), (cx + 10, hy + 20 + 3 * p['cast'])])], [BK, BK, CH0, CH0])   # beak
        # bubbles
        for i in range(6):
            u = (p['t'] + i * 0.17) % 1; f.fx.append((cx - 26 + i * 10, hy - 26 - u * 16, SU2 if i % 2 else CH1))
        if p['cast'] > 0.5:   # ink / water jet
            for i in range(10): f.fx.append((cx + 22 + i * 3, hy + 18 + math.sin(i) * 2, '#8a4ab8' if i % 2 else '#5a2a8a'))
        return f.finish(p['flash'])
    st = std_states(draw, {K1: '#5a2a8a', K2: '#8a4ab8', EY: '#ff3a2a'}, G, ember=SU2)
    build('oktavor', st, (W, H), (W // 2, G), PAL, 'Oktavor, Drowner of the Eighth Tower (map 8). Swims: "walk" is its swim cycle.', skip=('walk', 'idle', 'rage', 'cast', 'hurt', 'tele', 'slam'))

# ======================= Vorgrub, the Ember Eater =======================
def vorgrub():
    OUT = '#100806'; W0, W1, W2, W3 = '#3a2418', '#5e3c26', '#8a5c3a', '#b88a5a'
    BN, BN2 = '#d8c8a8', '#f4ecd8'; F0, F1, F2 = '#8a1a0a', '#ff6a1a', '#ffd34e'; DIRT, ROCK = '#4a3a2a', '#6a5a4a'
    PAL = [OUT, W0, W1, W2, W3, BN, BN2, F0, F1, F2, DIRT, ROCK, '#2a1a3a', '#5a2a5a', '#ff3a2a']
    W, H, G = 112, 128, 124
    def draw(p):
        f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi; rec = p['recoil']
        rise = 1 - 0.35 * p['strike']
        # body: rings rising out of the ground in an S curve, leaning forward
        segs = []
        for k in range(9):
            u = k / 8
            x = 50 - 4 * rec + math.sin(u * 3 + t * (1.2 if p['walk'] else 0.5)) * (8 + 4 * u) + u * 10 + 10 * p['raise_'] * u - 6 * p['strike'] * u
            y = G - 17 - u * 88 * rise + 10 * p['raise_'] * u * u
            segs.append((x, y, 17 - u * 4))
        for k in range(8, -1, -1):
            x, y, r = segs[k]; tones = [W0, W1, W2, W3] if k % 2 else [W0, W1, W2, W2]
            f.part([('ell', x, y, r, r * 0.8)], tones)
            f.line([(x - r + 2, y + r * 0.5), (x + r - 2, y + r * 0.5)], W0)
            if 1 <= k <= 7: f.part([('poly', [(x - 3, y - r * 0.6), (x - 9, y - r * 0.8 - 6), (x, y - r * 0.7)])], [BN, BN, BN2, BN2])   # bone spikes on the back
        # head: a round mouth with rings of teeth and the embers burning inside
        hx, hy, hr = segs[8][0] + 6, segs[8][1] - 2, 15
        f.part([('ell', hx, hy, hr, hr)], [W0, W1, W2, W3])
        mo = 9 + 3 * p['cast'] + 2 * p['raise_']
        f.flat([('ell', hx + 3, hy + 2, mo, mo)], F0); f.flat([('ell', hx + 3, hy + 2, mo - 3, mo - 3)], F1 if not p.get('rage') else F2)
        f.flat([('ell', hx + 3, hy + 2, max(1, mo - 6), max(1, mo - 6))], F2)
        for ring, rr_ in ((0, mo), (1, mo - 3)):
            for i in range(12):
                a = i / 12 * 2 * math.pi + ring * 0.26
                x = hx + 3 + math.cos(a) * rr_; y = hy + 2 + math.sin(a) * rr_
                f.part([('poly', [(x, y), (x - math.cos(a) * 3 + 1, y - math.sin(a) * 3), (x - math.cos(a) * 3 - 1, y - math.sin(a) * 3 + 1)])], [BN, BN, BN2, BN2])
        # dirt and rocks at the base
        for i in range(9):
            f.part([('ell', 30 + i * 7, G - 4 - (i % 3), 4 + (i % 2), 3)], [DIRT, DIRT, ROCK, ROCK])
        if p['cast'] > 0.5:
            for i in range(10): a = i * 0.6; f.fx.append((hx + 18 + i * 2, hy + math.sin(a) * 5, F2 if i % 2 else F1))
        if p['strike'] > 0.6:
            for i in range(10): f.fx.append((20 + i * 8, G - 4 - (i % 3) * 3, ROCK if i % 2 else DIRT))
        return f.finish(p['flash'])
    st = std_states(draw, {W1: '#2a1a3a', W2: '#5a2a5a', F1: '#ff3a2a'}, G, ember=F1)
    build('vorgrub', st, (W, H), (W // 2, G), PAL, 'Vorgrub, the Ember Eater (map 9). Burrows: the game hides it while underground.', skip=('walk',))

if __name__ == '__main__':
    for n in sys.argv[1:] or ['morvella', 'oktavor', 'vorgrub']: globals()[n]()
