# The two gatekeepers of map 10: Mr Shorty Phong (the Tall-Hat Butler -> the Tall-Hat Fiend) and
# Doctor Sy (the Green-Coat Poisoner -> the Venom Wyrm).
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build, fit_states
from giants import rig, front_arm

OUT = '#0a0612'
P0, P1, P2, P3 = '#2a0e3a', '#4a1a6a', '#7a3aa8', '#a86ad8'      # Shorty's purple
SKIN, SKIN2, WHITE, GOLD, GOLD2, RED = '#c8906a', '#f2c394', '#f6f3e9', '#c89a1c', '#ffd34e', '#e0453a'
G0, G1, G2, G3 = '#10281a', '#1c4a30', '#2f7a4a', '#5aa86a'      # Sy's green
POI, POI2, BEAK, BLACK = '#7ed957', '#d8ffb0', '#d8d0b0', '#14120e'
RAGE_SH = {P1: '#6a1430', P2: '#a02a4a', P3: '#d85a7a'}
RAGE_SY = {G1: '#3a2a10', G2: '#7a5a14', POI: '#ffb02a'}

def shorty(p):
    W, H, G = 64, 72, 68; f = Frame(W, H, OUT)
    C = dict(back=[OUT, P0, P1, P2], mid=[P0, P1, P2, P3], front=[P0, P1, P2, P3])
    k = rig(f, p, dict(back=[OUT, '#14121f', '#2a2836', '#2a2836'], front=[OUT, '#14121f', '#2a2836', '#3a3846'], mid=C['mid']), 30, G, 16, 18, 7, 20, 2.5, 2.5)
    sx, sy, hy = k['sx'], k['sy'], k['hy']
    f.part([('poly', [(sx - 7, sy), (sx + 7, sy), (sx + 8, hy + 2), (sx - 4, hy + 2), (sx - 9, hy + 8), (sx - 8, hy)])], C['mid'], band=0.6)   # tailcoat
    f.part([('rect', sx - 2, sy + 1, 5, 12)], [WHITE, WHITE, WHITE, WHITE]); f.px(sx, sy + 1, RED); f.px(sx + 1, sy + 1, RED); f.px(sx, sy + 6, GOLD2)
    hx, hdy = sx + 1, sy - 7
    f.part([('ell', hx, hdy, 7, 7)], [SKIN, SKIN, SKIN2, SKIN2])
    f.flat([('ell', hx + 4, hdy - 1, 2.5, 2.5)], GOLD2); f.px(hx + 4, hdy - 1, '#d8f0ff' if not p.get('rage') else RED)   # monocle
    f.px(hx + 1, hdy - 1, OUT)
    f.line([(hx - 1, hdy + 3), (hx + 2, hdy + 2), (hx + 5, hdy + 3)], OUT); f.px(hx - 2, hdy + 2, OUT); f.px(hx + 6, hdy + 2, OUT)   # curled moustache
    f.part([('rect', hx - 6, hdy - 19, 12, 13), ('rect', hx - 9, hdy - 7, 18, 2)], [OUT, '#14121f', '#2a2836', '#3a3846'])         # the tall hat
    f.flat([('rect', hx - 6, hdy - 10, 12, 2)], P2)
    hd = front_arm(f, p, k, 7, 20, 2.5, C['front'], extra_a=10)
    f.part([('cap', (hd[0] + 1, hd[1] - 2), (hd[0] + 3, G - 3), 1, 1)], [GOLD, GOLD, GOLD2, GOLD2]); f.part([('ell', hd[0] + 1, hd[1] - 3, 2, 2)], [GOLD, GOLD2, GOLD2, GOLD2])   # cane
    f.part([('ell', hd[0], hd[1], 2, 2)], [WHITE, WHITE, WHITE, WHITE])
    if p['cast'] > 0.4:
        for i in range(6): a = i * 1.05 + p['t'] * 8; f.fx.append((hd[0] + 6 + math.cos(a) * 4, hd[1] - 6 + math.sin(a) * 4, P3 if i % 2 else GOLD2))
    return f.finish(p['flash']), (W, H, G)

def shorty_fiend(p):
    W, H, G = 96, 96, 92; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
    C = dict(back=[OUT, P0, P1, P2], mid=[P0, P1, P2, P3], front=[P0, P1, P2, P3])
    k = rig(f, p, C, 44, G, 18, 26, 14, 34, 4.5, 4.5); sx, sy, hy = k['sx'], k['sy'], k['hy']
    f.part([('ell', sx, sy + 12, 18, 18)], C['mid'], band=0.62)
    hx, hdy = sx + 3, sy - 2
    f.part([('rect', hx - 9, hdy - 26, 18, 22), ('rect', hx - 14, hdy - 6, 28, 3)], [OUT, '#14121f', '#2a2836', '#3a3846'])   # the hat that swallowed him
    f.flat([('rect', hx - 9, hdy - 10, 18, 3)], RED if p.get('rage') else P2)
    mo = 4 + round(4 * (p['cast'] + p['strike']))
    f.flat([('rect', hx - 12, hdy + 3, 26, mo + 3)], OUT)                     # the grin cut across his face
    for i in range(8): f.part([('poly', [(hx - 11 + i * 3, hdy + 3), (hx - 8 + i * 3, hdy + 3), (hx - 9.5 + i * 3, hdy + 7)])], [WHITE, WHITE, WHITE, WHITE]); f.part([('poly', [(hx - 10 + i * 3, hdy + 6 + mo), (hx - 7 + i * 3, hdy + 6 + mo), (hx - 8.5 + i * 3, hdy + 2 + mo)])], [WHITE, WHITE, WHITE, WHITE])
    f.flat([('ell', hx - 5, hdy - 1, 3, 2.5), ('ell', hx + 5, hdy - 1, 3, 2.5)], GOLD2 if not p.get('rage') else RED); f.px(hx - 5, hdy - 1, OUT); f.px(hx + 5, hdy - 1, OUT)
    f.flat([('ell', hx + 9, hdy - 2, 3, 3)], GOLD2); f.px(hx + 9, hdy - 2, '#d8f0ff')   # the monocle survived
    hd = front_arm(f, p, k, 14, 34, 4.5, C['front'])
    f.part([('cap', (hd[0], hd[1] + 14), (hd[0], hd[1] - 26), 1.4, 1.4)], [GOLD, GOLD, GOLD2, GOLD2])
    blade = [(hd[0], hd[1] - 26), (hd[0] - 18, hd[1] - 22), (hd[0] - 10, hd[1] - 30)] if not p['strike'] else [(hd[0], hd[1] - 26), (hd[0] + 18, hd[1] - 14), (hd[0] + 12, hd[1] - 28)]
    f.part([('poly', blade)], ['#8a8aa0', '#cfd6e6', '#ffffff', '#ffffff'])
    return f.finish(p['flash']), (W, H, G)

def sy(p):
    W, H, G = 64, 80, 76; f = Frame(W, H, OUT)
    C = dict(back=[OUT, G0, G1, G2], mid=[G0, G1, G2, G3], front=[G0, G1, G2, G3])
    k = rig(f, p, dict(back=[OUT, BLACK, '#2a2620', '#2a2620'], front=[OUT, BLACK, '#2a2620', '#3a3630'], mid=C['mid']), 30, G, 24, 22, 7, 24, 2.5, 2.5)
    sx, sy, hy = k['sx'], k['sy'], k['hy']; sway = math.sin(k['t']) * 1.5 + (2 if p['walk'] else 0)
    f.part([('poly', [(sx - 8, sy), (sx + 8, sy), (sx + 10, G - 6), (sx - 12 - sway, G - 5)])], C['mid'], band=0.6)   # long green coat
    for i in range(3): f.part([('rect', sx - 7 + i * 4, sy + 9, 3, 4)], [G0, POI, POI2, POI2]); f.px(sx - 6 + i * 4, sy + 8, BEAK)   # potion vials
    hx, hdy = sx + 1, sy - 7
    f.part([('ell', hx, hdy, 6, 6), ('poly', [(hx + 3, hdy - 1), (hx + 14, hdy + 4), (hx + 3, hdy + 4)])], [BEAK, BEAK, '#f0ead8', '#f0ead8'])   # beak mask
    f.flat([('ell', hx + 2, hdy - 1, 2, 2)], OUT); f.px(hx + 2, hdy - 1, POI if not p.get('rage') else '#ffb02a')
    f.part([('ell', hx, hdy - 7, 12, 2.5), ('rect', hx - 6, hdy - 13, 12, 7)], [OUT, BLACK, '#2a2620', '#3a3630']); f.flat([('rect', hx - 6, hdy - 8, 12, 1)], POI)   # wide-brim hat
    hd = front_arm(f, p, k, 7, 24, 2.5, C['front'], extra_a=10)
    f.part([('cap', (hd[0], hd[1] - 14), (hd[0], G - 3), 1, 1)], ['#3a2a1a', '#5a3a22', '#7a5a3a', '#7a5a3a'])
    lit = POI2 if p['cast'] > 0.5 else POI
    f.part([('ell', hd[0], hd[1] - 16, 3, 3)], [G0, POI, lit, POI2])
    if p['cast'] > 0.4:
        for i in range(6): f.fx.append((hd[0] + 4 + i * 3, hd[1] - 14 + math.sin(i + p['t'] * 8) * 3, POI if i % 2 else POI2))
    return f.finish(p['flash']), (W, H, G)

def sy_wyrm(p):
    W, H, G = 112, 96, 92; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
    C = [G0, G1, G2, G3]; rec = p['recoil']
    # a coiled body: rings on the ground, a neck rising in an S curve
    for i in range(10):
        a = i / 10 * 2 * math.pi + (t * 0.5 if p['walk'] else 0)
        x = 46 - 4 * rec + math.cos(a) * 22; y = G - 10 + math.sin(a) * 5
        f.part([('ell', x, y, 9, 7)], C if math.sin(a) > 0 else [G0, G0, G1, G2])
    neck = []
    for i in range(7):
        u = i / 6
        x = 54 - 4 * rec + math.sin(u * 3 + t * 0.6) * 8 + u * 10 + 14 * p['strike'] * u - 6 * p['raise_'] * u
        y = G - 18 - u * 52 + 10 * p['strike'] * u * u - 6 * p['raise_'] * u
        neck.append((x, y, 8 - u * 2))
    for x, y, r in neck: f.part([('ell', x, y, r, r)], C)
    for x, y, r in neck[1:]: f.px(x + 1, y + r - 2, '#c8e8a0')   # pale belly scales
    hx, hy = neck[-1][0] + 6, neck[-1][1] - 2
    jaw = 3 + round(5 * (p['cast'] + p['strike']))
    f.part([('poly', [(hx - 8, hy - 6), (hx + 12, hy - 2), (hx + 12, hy + 2), (hx - 8, hy + 4)])], C)
    f.part([('poly', [(hx - 6, hy + 4), (hx + 10, hy + 3 + jaw), (hx - 6, hy + 8)])], C)
    f.flat([('rect', hx - 4, hy + 2, 13, jaw)], '#3a0e10')
    for i in range(2): f.part([('poly', [(hx + 6 + i * 3, hy + 2), (hx + 7 + i * 3, hy + 6), (hx + 8 + i * 3, hy + 2)])], [BEAK, BEAK, '#ffffff', '#ffffff'])
    f.flat([('rect', hx + 1, hy - 4, 3, 2)], POI if not p.get('rage') else '#ffb02a'); f.px(hx + 2, hy - 4, OUT)
    f.part([('ell', hx - 2, hy - 8, 11, 2), ('rect', hx - 7, hy - 14, 10, 6)], [OUT, BLACK, '#2a2620', '#3a3630'])   # the hat stayed on
    for i in range(3): f.fx.append((hx + 8, hy + 8 + jaw + ((p['t'] * 20 + i * 4) % 10), POI))   # venom dripping
    for i, (x, y) in enumerate([(30, G - 18), (64, G - 8), (40, G - 4)]):   # broken vials stuck in the scales
        f.part([('rect', x, y, 3, 4)], [G0, POI, POI2, POI2])
    if p['cast'] > 0.5:
        for i in range(8): f.fx.append((hx + 14 + i * 3, hy + 4 + math.sin(i) * 2, POI if i % 2 else POI2))
    return f.finish(p['flash']), (W, H, G)

def make(name, fn, rage, note):
    img0, (W, H, G) = fn(dict(t=0, walk=False, raise_=0, strike=0, cast=0, recoil=0, flash=False))
    st = std_states(lambda p: fn(p)[0], rage, G, ember=GOLD2)
    st, cell, anc = fit_states(st, (W, H), (W // 2, img0.getbbox()[3] - 1))
    pal = [OUT, P0, P1, P2, P3, SKIN, SKIN2, WHITE, GOLD, GOLD2, RED, G0, G1, G2, G3, POI, POI2, BEAK, BLACK, '#14121f', '#2a2836', '#3a3846', '#2a2620', '#3a3630',
           '#3a2a1a', '#5a3a22', '#7a5a3a', '#d8f0ff', '#8a8aa0', '#cfd6e6', '#ffffff', '#3a0e10', '#c8e8a0', '#f0ead8'] + list(rage.values())
    build(name, st, cell, anc, pal, note)

if __name__ == '__main__':
    make('shorty', shorty, RAGE_SH, 'Mr Shorty Phong, the Tall-Hat Butler (gatekeeper, form 1).')
    make('shorty_fiend', shorty_fiend, RAGE_SH, 'Shorty Phong, the Tall-Hat Fiend (gatekeeper, form 2).')
    make('sy', sy, RAGE_SY, 'Doctor Sy, the Green-Coat Poisoner (gatekeeper, form 1).')
    make('sy_wyrm', sy_wyrm, RAGE_SY, 'Sy, the Venom Wyrm (gatekeeper, form 2).')
