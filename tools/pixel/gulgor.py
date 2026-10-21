# Gulgor, the Lantern Gulper (map 1 boss): a crowned moss-green ooze with the sparks of light it swallowed glowing
# inside its belly, a wide toothy mouth and small red eyes. It hops instead of walking. Cell 64x56, feet (32, 53).
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build

OUT = '#0e1a10'
S0, S1, S2, S3 = '#1e5a2a', '#2e8a3a', '#56c04a', '#a4e86b'
G1, G2 = '#fff6a0', '#ffd34e'
C0, C1, C2 = '#6a4a14', '#c89a1c', '#ffe08a'
EYE, TOOTH, MOUTH = '#ff3a2a', '#e8f0d0', '#3a0e10'
RAGE_S, RAGE_L = '#8a2a1a', '#ff6a3a'
PAL = [OUT, S0, S1, S2, S3, G1, G2, C0, C1, C2, EYE, TOOTH, MOUTH, RAGE_S, RAGE_L, '#b8402a']
W, H, GROUND = 64, 56, 52

def draw(p):
    f = Frame(W, H, OUT)
    t = p['t'] * 2 * math.pi; sq = 0.06 * math.sin(t); lift = 0
    if p['walk']:   # a hop: squash, stretch up into the air, land
        ph = p['t']; sq = [0.22, 0.05, -0.18, -0.2, -0.08, 0.05, 0.18, 0.25][int(ph * 8) % 8]; lift = [0, 2, 7, 10, 8, 4, 0, 0][int(ph * 8) % 8]
    if p['raise_']: sq = -0.3 * p['raise_']; lift = 3 * p['raise_']
    if p['strike']: sq = 0.45 * p['strike']; lift = 0
    if p['cast']: sq = -0.08 * p['cast']
    cx = 31 - 4 * p['recoil']
    rx, ry = 21 * (1 + sq), 15 * (1 - sq * 0.9)
    by = GROUND - lift - ry   # centre of the body
    body = [('ell', cx, by, rx, ry), ('rect', cx - rx + 2, by, rx * 2 - 4, ry)]   # a dome with a flat base
    for i, dx in enumerate([-rx + 4, -rx * 0.3, rx * 0.5]):   # drips at the base
        body.append(('ell', cx + dx, GROUND - lift - 2, 2.5, 2))
    f.part(body, [S0, S1, S2, S3], band=0.68)
    # swallowed sparks glowing inside
    for i in range(4):
        a = t + i * 1.7; x = cx - 6 + i * 4 + math.sin(a) * 2; y = by + 2 + math.cos(a * 0.8 + i) * 3
        f.flat([('ell', x, y, 1.6, 1.6)], G2); f.px(x, y, G1)
    # face: two small red eyes and a wide mouth on the front (right) side
    ex, ey = cx + rx * 0.35, by - ry * 0.35
    for dx in (0, 7): f.flat([('ell', ex + dx, ey, 2.2, 2.6)], OUT); f.px(ex + dx, ey, EYE); f.px(ex + dx + 0.5, ey - 1, '#ff9a8a' if False else EYE)
    mo = 2 + round(6 * p['cast']) + round(2 * p['strike'])
    mx0, mx1, my = cx + rx * 0.05, cx + rx * 0.92, by + ry * 0.15
    f.flat([('poly', [(mx0, my), (mx1, my - 2), (mx1 - 1, my + mo), (mx0 + 2, my + mo - 1)])], MOUTH)
    for i in range(5): f.px(mx0 + 2 + i * 3, my, TOOTH); f.px(mx0 + 3 + i * 3, my + mo - 1, TOOTH)
    if p['cast'] > 0.5:   # spitting a glob of goo
        gx = min(W - 6, mx1 + 4 + 8 * (p['cast'] - 0.5)); f.flat([('ell', gx, my + mo / 2, 3, 2.5)], S2); f.px(gx - 1, my + mo / 2 - 1, S3)
    # chipped stone crown, tilted
    kx, ky = cx - 2, by - ry + 2
    f.part([('poly', [(kx - 9, ky), (kx - 8, ky - 7), (kx - 5, ky - 3), (kx - 1, ky - 9), (kx + 3, ky - 3), (kx + 7, ky - 8), (kx + 9, ky + 1)])], [C0, C1, C2, C2])
    f.px(kx - 1, ky - 4, EYE); f.px(kx + 6, ky - 5, G1)
    # goo splashes when it lands on the ground
    if p['strike'] > 0.6:
        for i in range(8): f.fx.append((cx + (i - 3.5) * 7, GROUND - 2 - (i % 3) * 3, S3 if i % 2 else S2))
    return f.finish(p['flash'])

if __name__ == '__main__':
    st = std_states(draw, {S0: RAGE_S, S1: '#b8402a', S2: RAGE_L, S3: G1, G2: '#ff3a2a'}, GROUND, ember=G2)
    build('gulgor', st, (W, H), (32, 53), PAL, 'Gulgor, the Lantern Gulper (map 1). Hops instead of walking (walk frames leave the ground).', skip=('walk', 'slam', 'tele'))
