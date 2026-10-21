# Phase 6 (step 3): the 45 fish and sea creatures of the Open Sea, made from a few templates (spine fish, eel, ray, jelly, squid/octopus,
# crab/lobster, turtle, seahorse, puffer, shrimp, starfish, conch, urchin, anemone, angler), each with its own palette and shape numbers.
# Every species has the same six states as the two approved samples (idle, swim, hooked, thrash, hurt, death), faces right, and is
# cropped to a cell whose centre is the anchor. Output: assets/sprites/fish/<id>/ (one strip per state + <id>.json), plus one packed
# atlas assets/sprites/fish/fish.png + fish.json for the game, and docs/sprites_6/fish_all.png (an overview).
import math, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageDraw
from pix import Frame, save_set, check, hexc
import fish as F1

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUTD = os.path.join(ROOT, 'assets', 'sprites', 'fish')
TAU = math.pi * 2

def mix(a, b, k):
    A, B = hexc(a), hexc(b); return '#%02x%02x%02x' % tuple(round(A[i] + (B[i] - A[i]) * k) for i in range(3))
def tones(b): return [mix(b, '#000000', 0.28), b, mix(b, '#ffffff', 0.24), mix(b, '#ffffff', 0.52)]
def cols(body, fin=None, belly=None, glow='#fff6c0', eye='#14101c', accent=None, accent2=None):
    fin = fin or mix(body, '#ffffff', 0.12)
    return dict(OUT=mix(body, '#000000', 0.82), B=tones(body), Fn=tones(fin), BELLY=belly or mix(body, '#ffffff', 0.7), GLOW=glow, EYE=eye, W='#ffffff', A=accent or mix(body, '#000000', 0.5), A2=accent2 or glow)

def S(id, tpl, L, c, **o): return dict(id=id, tpl=tpl, L=L, c=c, o=o)
caps = F1.caps; spine = F1.spine

# ------------------------------------------------------------------ spine fish (carp, minnow, shark, swordfish, whale ...) ------------------------------------------------------------------
def t_fish(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2, Hd / 2
    th = o.get('th', 1.0); n = 7
    pts = spine(n, cx + L / 2 - 2 * rec, cx - L / 2 - 2 * rec, cy + rec, p['amp'] * o.get('wave', 1), t, 2.4, p['curl'], p['arch'], p['head'])
    prof = o.get('prof', [.145, .23, .255, .225, .165, .1, .055]); rad = [max(0.8, r * L * th) for r in prof]
    xb, yb = pts[-1]; wag = math.sin(t * 2 - 2.4) * L * 0.11 * (0.5 + p['amp'])
    ts = o.get('tail', 'fork'); tl = o.get('tl', 0.30) * L
    if ts == 'fork': f.part([('poly', [(xb + 1, yb), (xb - tl, yb - tl * .85 + wag * .4), (xb - tl * .65, yb), (xb - tl, yb + tl * .85 + wag * .4)])], c['Fn'], band=0.8)
    elif ts == 'lunate': f.part([('poly', [(xb + 1, yb), (xb - tl * .5, yb - tl * 1.1 + wag * .4), (xb - tl * .2, yb), (xb - tl * .5, yb + tl * 1.1 + wag * .4)])], c['Fn'], band=0.8)
    elif ts == 'round': f.part([('ell', xb - tl * .5, yb + wag * .2, tl * .6, tl * .75)], c['Fn'], band=0.8)
    elif ts == 'shark': f.part([('poly', [(xb + 1, yb), (xb - tl * .9, yb - tl * 1.2 + wag * .3), (xb - tl * .5, yb + 1), (xb - tl * .7, yb + tl * .55 + wag * .3)])], c['Fn'], band=0.8)
    d = o.get('dorsal', 'fin'); a, b2, c2 = pts[1], pts[3], pts[4]; fl = math.sin(t * 2) * 1.2; r1 = rad[1]
    if d == 'fin': f.part([('poly', [(pts[2][0] + 1, pts[2][1] - rad[2] * .9), (pts[3][0] + 1 + fl, pts[3][1] - rad[3] - L * .18), (c2[0] - 1, c2[1] - rad[4] * .8), (b2[0], b2[1] - rad[3] * .6)])], c['Fn'], band=0.8)
    elif d == 'tall': f.part([('poly', [(pts[2][0] + 2, pts[2][1] - rad[2] * .8), (pts[3][0] - 1 + fl, pts[3][1] - rad[3] - L * .34), (pts[4][0] - 2, pts[4][1] - rad[4] * .8)])], c['Fn'], band=0.8)
    elif d == 'sail': f.part([('poly', [(pts[1][0], pts[1][1] - rad[1] * .9), (pts[2][0] + fl, pts[2][1] - rad[2] - L * .3), (pts[4][0] + fl, pts[4][1] - rad[4] - L * .22), (pts[5][0], pts[5][1] - rad[5] * .8), (pts[3][0], pts[3][1] - rad[3] * .6)])], c['Fn'], band=0.8)
    elif d == 'spiny':
        for i in range(2, 6): f.part([('poly', [(pts[i][0] + 1.5, pts[i][1] - rad[i] * .8), (pts[i][0] + fl * .5, pts[i][1] - rad[i] - L * .12 - (i % 2)), (pts[i][0] - 1.5, pts[i][1] - rad[i] * .8)])], c['Fn'], band=0.8)
    if o.get('belly_fin', True):
        p1 = pts[2]; f.part([('poly', [(p1[0] + 1, p1[1] + rad[2] * .6), (p1[0] - L * .2 - fl * .5, p1[1] + rad[2] + L * .16), (p1[0] - 1, p1[1] + rad[2] * .7)])], c['Fn'], band=0.8)
    # body (a hammer or a long sword first, so the body covers the join)
    hd = o.get('head')
    if hd == 'sword': f.part([('poly', [(pts[0][0] - 1, pts[0][1] - 1.2), (pts[0][0] + L * .38, pts[0][1] - .5), (pts[0][0] - 1, pts[0][1] + 1.2)])], c['B'], band=0.8)
    if hd == 'hammer': hx, hy = pts[0]; f.part([('rect', hx - L * .06, hy - L * .2, L * .1, L * .4)], c['B'], band=0.62)
    body_caps = caps(pts, rad); f.part(body_caps, c['B'], band=o.get('band', 0.62))
    pat = o.get('pat')
    if pat == 'belly' or o.get('belly', True):
        f.line([(pts[1][0] - 1, pts[1][1] + rad[1] * .62), (pts[3][0], pts[3][1] + rad[3] * .62), (pts[4][0], pts[4][1] + rad[4] * .6)], c['BELLY'])
        if o.get('belly2'): f.line([(pts[1][0] - 1, pts[1][1] + rad[1] * .8), (pts[3][0], pts[3][1] + rad[3] * .8), (pts[4][0], pts[4][1] + rad[4] * .75)], c['BELLY'])
    if pat == 'spots':
        for i, (k, b) in enumerate([(1, -.62), (2, -.7), (3, -.58), (4, -.5)]):
            x, y = pts[k]; f.px(x - 1, y + rad[k] * b, c['GLOW'] if math.sin(t * 2 + i * 2) > -0.3 else c['B'][3])
    if pat == 'stripes':
        for k in (2, 3, 4): x, y = pts[k]; f.line([(x, y - rad[k] * .8), (x - .5, y + rad[k] * .8)], c['A'])
    if pat == 'ribs':
        for k in (1, 2, 3, 4): x, y = pts[k]; f.line([(x + 1, y - rad[k] * .7), (x - 1, y), (x + 1, y + rad[k] * .7)], c['A2'])
    if pat == 'scales':
        for k in (1, 2, 3, 4): x, y = pts[k]; f.px(x, y - rad[k] * .3, c['B'][3]); f.px(x - 1, y + rad[k] * .2, c['B'][3]); f.px(x + 1, y + rad[k] * .2, c['B'][0])
    if pat == 'facets':
        for k in (1, 2, 3): x, y = pts[k]; f.line([(x - 2, y - rad[k] * .7), (x + 1, y + rad[k] * .2), (x - 1, y + rad[k] * .8)], c['A2'])
    if pat == 'eyes':   # a thousand eyes: many tiny pupils
        for i, (k, b) in enumerate([(1, -.5), (2, -.55), (3, -.3), (2, .1), (3, .45), (4, -.1), (1, .3), (4, .4)]):
            x, y = pts[k]; f.px(x, y + rad[k] * b, c['EYE']); f.px(x - 1, y + rad[k] * b, c['W'])
    # head: eye, mouth, gills, whiskers
    hx, hy = pts[0]; er = o.get('eye', 1)
    ex, ey = hx - L * .14 - er * .3, hy - rad[0] * .45 - 0.6
    if er >= 1.6: f.flat([('ell', ex + 1, ey + 1, er, er)], c['W']); f.flat([('ell', ex + 1.4, ey + 1, er * .55, er * .7)], c['EYE'])
    else: f.flat([('rect', round(ex), round(ey), 2, 2)], c['W']); f.px(ex + 1, ey + 1, c['EYE'])
    if o.get('eyes_top'): f.flat([('ell', ex + 2, ey - 1.5, 1.6, 1.6)], c['B'][2]); f.px(ex + 2, ey - 1.5, c['EYE'])
    if hd == 'hammer': f.px(hx - L * .05, hy - L * .17, c['EYE']); f.px(hx - L * .05, hy + L * .17, c['EYE'])
    mx, my = hx + rad[0] * .35, hy + rad[0] * .6
    if o.get('teeth'):
        for i in range(3): f.px(mx - 1 - i * 1.6, my + 0.5 + p['jaw'] * .6, c['W'])
    else: f.px(mx, my + p['jaw'] * .5, c['EYE'] if p['jaw'] else c['B'][0])
    if o.get('gills'):
        for i in range(3): f.line([(hx - L * .2 - i * 1.2, hy - rad[1] * .3), (hx - L * .2 - i * 1.2 + .5, hy + rad[1] * .4)], c['B'][0])
    if o.get('barbel'): f.line([(hx + 1, hy + 2), (hx + 3, hy + 3.5)], c['B'][2], False); f.line([(hx, hy + 2.5), (hx + 1.5, hy + 4.5)], c['B'][2], False)
    if o.get('legs'):   # mud skipper: stout front fins used like arms
        f.part([('cap', (pts[1][0] - 1, pts[1][1] + rad[1] * .5), (pts[1][0] + 2, pts[1][1] + rad[1] + 3), 1.4, 1)], c['B'], band=0.8)
    if o.get('crown'):
        x, y = pts[1][0], pts[1][1] - rad[1] - 1
        for i, dx in enumerate([-3, 0, 3]): f.flat([('poly', [(x + dx - 1.2, y + 1), (x + dx, y - 2 - (i == 1)), (x + dx + 1.2, y + 1)])], c['A2'])
    if o.get('sparkle'):
        for i in range(5): a = t + i * 1.3; f.fx.append((cx + math.cos(a) * L * .5, cy + math.sin(a) * L * .3, c['W'] if i % 2 else c['A2']))
    if o.get('breath') and (p['t'] % TAU) < 3.2: f.fx.append((hx + 4 + (p['t'] % TAU), hy - 3 - (p['t'] % TAU) * .5, c['W']))
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ eel / sea wyrm ------------------------------------------------------------------
def t_eel(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2, Hd / 2; n = 14
    pts = spine(n, cx + L / 2 - 2 * rec, cx - L / 2, cy + rec, p['amp'] * 1.6, t, 5.0, p['curl'] * 1.2, p['arch'] * .6, p['head'])
    th = o.get('th', 1.0); rad = [(0.9 + 3.2 * math.sin(min(1, (i + .6) / 4) * 1.55) * (1 - (i / (n - 1)) ** 1.5) + .6) * th for i in range(n)]
    f.part(caps(pts, rad), c['B'], band=0.66)
    fl = o.get('fin', True)
    if fl:
        for i in range(2, n - 1, 1): f.part([('poly', [(pts[i][0] + 1.2, pts[i][1] - rad[i] + .5), (pts[i][0] - .2, pts[i][1] - rad[i] - 1.6 - (i % 2) * .6), (pts[i][0] - 1.4, pts[i][1] - rad[i] + .5)])], c['Fn'], band=0.8)
    xb, yb = pts[-1]; wag = math.sin(t * 2 - 5) * 2; f.part([('poly', [(xb + 1, yb), (xb - 5, yb - 2.4 + wag * .3), (xb - 7, yb + wag * .2), (xb - 5, yb + 2.4 + wag * .3)])], c['Fn'], band=0.8)
    pat = o.get('pat')
    if pat == 'bolt':
        for i in range(2, n - 2, 2): f.px(pts[i][0], pts[i][1] - rad[i] * .5, c['A2']); f.px(pts[i][0] - 1, pts[i][1] - rad[i] * .5 + 1, c['A2'])
    if pat == 'scales':
        for i in range(2, n - 2): f.px(pts[i][0], pts[i][1] + (i % 2) * 1.2 - .8, c['B'][3]); f.px(pts[i][0] - 1, pts[i][1] + 1.2 - (i % 2), c['B'][0])
    if pat == 'bands':
        for i in range(2, n - 2, 2): f.line([(pts[i][0], pts[i][1] - rad[i] + .5), (pts[i][0] - .3, pts[i][1] + rad[i] - .5)], c['A'])
    f.line([(pts[1][0], pts[1][1] + rad[1] * .6), (pts[n - 4][0], pts[n - 4][1] + rad[n - 4] * .6)], c['BELLY'])
    hx, hy = pts[0]
    if o.get('horns'):
        f.part([('poly', [(hx - 4, hy - 3), (hx - 8, hy - 8), (hx - 2, hy - 4)]), ('poly', [(hx - 1, hy - 3), (hx - 3, hy - 9), (hx + 1, hy - 4)])], c['A'] and [c['A'], c['A'], c['B'][2], c['B'][3]], band=0.8)
        f.line([(hx + 2, hy + 3), (hx + 7, hy + 6 + math.sin(t) * 1.5), (hx + 11, hy + 5 + math.sin(t + 1))], c['A2'], False); f.line([(hx + 1, hy + 2), (hx + 6, hy + 8 + math.sin(t + 2))], c['A2'], False)
        f.flat([('ell', hx + 5, hy - 5, 2, 2)], c['A2'])
    f.flat([('ell', hx - 2.6, hy - 1.4, 1.6, 1.6)], c['W']); f.px(hx - 2, hy - 1.4, c['EYE'])
    for i in range(2 + o.get('teeth', 0)): f.px(hx + 2 + (i % 2) * -1, hy + 1.8 + p['jaw'] * .6, c['W'] if o.get('teeth') else c['B'][0])
    if pat == 'bolt' and (p['t'] * 3) % 2 < 1: f.fx.append((hx + 3, hy - 4, c['A2'])); f.fx.append((pts[3][0] - 3, pts[3][1] - 5, c['A2'])); f.fx.append((pts[6][0], pts[6][1] + 5, c['A2']))
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ ray ------------------------------------------------------------------
def t_ray(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2 - 2 * rec, Hd / 2 + rec
    amp = (0.5 + p['amp'] * 1.4) * L * .12; k = p['curl']
    top = []; bot = []
    for i in range(9):
        u = i / 8; x = cx + L / 2 - L * u; env = math.sin(math.pi * min(1, u * 0.92 + .04)) ** 0.8; w = math.sin(t - u * 2.6) * amp * u
        top.append((x, cy - env * L * .27 + w + k * u * 4)); bot.append((x, cy + env * L * .2 + w + k * u * 4))
    tail = [(cx - L / 2 + 2, cy + 1), (cx - L / 2 - L * .35, cy + 3 + math.sin(t * 2) * 3)]
    f.part([('cap', tail[0], tail[1], 1.4, .6)], c['Fn'], band=0.8)
    f.part([('poly', top + bot[::-1])], c['B'], band=0.58)
    f.part([('ell', cx + L * .1, cy - L * .04, L * .22, L * .15)], [c['B'][1], c['B'][2], c['B'][3], c['B'][3]], band=0.8)
    f.line([(cx + L * .3, cy + L * .09), (cx - L * .2, cy + L * .09)], c['BELLY'])
    if o.get('horns'): f.part([('poly', [(cx + L / 2 - 4, cy - 2), (cx + L / 2 + 3, cy - 6), (cx + L / 2 - 2, cy)]), ('poly', [(cx + L / 2 - 4, cy + 2), (cx + L / 2 + 3, cy + 6), (cx + L / 2 - 2, cy)])], c['B'], band=0.8)
    f.flat([('rect', round(cx + L * .3), round(cy - L * .08), 2, 2)], c['W']); f.px(cx + L * .3 + 1, cy - L * .08 + 1, c['EYE'])
    if o.get('spots'):
        for i in range(5): f.px(cx - L * .25 + i * L * .12, cy - 1 + (i % 2) * 2, c['A2'])
    f.px(cx + L / 2 - 2, cy + 2 + p['jaw'] * .5, c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ jelly ------------------------------------------------------------------
def t_jelly(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2 - 1.5 * rec, Hd / 2 - L * .18
    pul = math.sin(t + (0 if p['amp'] < 1 else 1)) * (0.07 + .08 * p['amp']); rx = L * .5 * (1 - pul * .6); ry = L * .4 * (1 + pul); k = p['curl'] * 3
    box = o.get('box')
    for i in range(o.get('n', 6)):   # tentacles first, behind the bell
        u = (i + .5) / o.get('n', 6); x0 = cx - rx * .85 + rx * 1.7 * u; seg = []
        for j in range(5): yy = cy + ry * .2 + j * L * o.get('tl', .22); seg.append((x0 + math.sin(t * 1.2 - j * .9 + i) * (1 + j * .5) + k * j * .4, yy))
        f.part([('cap', seg[j], seg[j + 1], max(.5, 1.2 - j * .2), max(.5, 1.1 - j * .2)) for j in range(4)], c['Fn'], band=0.9)
    for i in range(o.get('arms', 2)):   # oral arms
        x0 = cx - rx * .25 + i * rx * .5; seg = [(x0 + math.sin(t - j * .8 + i) * (1 + j * .5), cy + ry * .3 + j * L * .2) for j in range(4)]
        f.part([('cap', seg[j], seg[j + 1], 1.9 - j * .4, 1.5 - j * .4) for j in range(3)], c['B'], band=0.8)
    if box: f.part([('rect', cx - rx * .8, cy - ry * .9, rx * 1.6, ry * 1.6), ('ell', cx, cy - ry * .9, rx * .8, ry * .3)], c['B'], band=0.62)
    else: f.part([('ell', cx, cy, rx, ry)], c['B'], band=0.66, cut=[('rect', cx - rx - 2, cy + ry * .55, rx * 2 + 4, ry)])
    f.flat([('ell', cx, cy - ry * .15, rx * .55, ry * .45)], c['GLOW'] if o.get('inner', True) else c['B'][2])
    if box:
        for i in range(4): f.px(cx - rx * .6 + i * rx * .4, cy - ry * .5 + (math.sin(t * 3 + i) > .2) * 2, c['A2'])
    for i in range(7): f.px(cx - rx + 1 + i * (rx * 2 - 2) / 6, cy + ry * .5 + (i % 2) * 1, c['B'][3])
    if o.get('eyes'): f.px(cx - 3, cy + 1, c['EYE']); f.px(cx + 3, cy + 1, c['EYE'])
    if o.get('glowfx') and (math.sin(t * 2) > 0): f.fx.append((cx + rx + 3, cy - ry, c['GLOW'])); f.fx.append((cx - rx - 3, cy - ry * .4, c['A2']))
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ squid / octopus ------------------------------------------------------------------
def t_squid(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2, Hd / 2 + rec
    oct_ = o.get('octopus')
    if oct_:
        mx, my = cx, cy - L * .22 + math.sin(t) * .8; r = L * .3
        for i in range(8):
            u = i / 7; x0 = cx - L * .3 + L * .6 * u; seg = [(x0 + math.sin(t * 1.3 - j * 1 + i) * (1 + j * .6) * (1 + p['curl'] * .4), my + L * .15 + j * L * .1) for j in range(5)]
            seg = [(sx + (sx - cx) * j * .18, sy) for j, (sx, sy) in enumerate(seg)]
            f.part([('cap', seg[j], seg[j + 1], max(.7, 2.2 - j * .4), max(.6, 1.9 - j * .4)) for j in range(4)], c['B'], band=0.9)
        f.part([('ell', mx, my, r, r * 1.05), ('ell', mx - r * .3, my - r * .6, r * .7, r * .7)], c['B'], band=0.62)
        for i, (dx, dy) in enumerate([(-6, -4), (2, -8), (6, 1), (-2, 4), (-9, 3)]): f.px(mx + dx * L / 60, my + dy * L / 60, c['A2'] if math.sin(t * 2 + i) > -.3 else c['B'][3])
        ex = mx + r * .3; f.flat([('ell', ex - 3, my + 2, 2.2, 2.2), ('ell', ex + 3, my + 2, 2.2, 2.2)], c['W']); f.flat([('rect', round(ex - 3), round(my + 1.5), 2, 2), ('rect', round(ex + 3), round(my + 1.5), 2, 2)], c['EYE'])
        return F1.finish_frame(f, p, (Wd, Hd))
    # squid: a long mantle on the left, the head and arms on the right
    pul = math.sin(t) * (0.5 + p['amp']) * .8; hx, hy = cx + L * .05 - 2 * rec, cy
    f.part([('poly', [(cx - L * .55 - pul, cy - 1), (cx - L * .3, cy - L * .24), (cx + L * .08, cy - L * .2), (cx + L * .08, cy + L * .2), (cx - L * .3, cy + L * .24)])], c['B'], band=0.62)
    f.part([('poly', [(cx - L * .55 - pul, cy - 1), (cx - L * .38, cy - L * .34), (cx - L * .3, cy - L * .1)]), ('poly', [(cx - L * .55 - pul, cy + 1), (cx - L * .38, cy + L * .34), (cx - L * .3, cy + L * .1)])], c['Fn'], band=0.8)
    f.part([('ell', hx + L * .06, hy, L * .16, L * .2)], c['B'], band=0.62)
    for i in range(8):
        u = i / 7 - .5; seg = [(hx + L * .16 + j * L * .1, hy + u * L * .3 + math.sin(t * 1.4 - j * .9 + i) * (1 + j * .4) * (1 + p['curl'] * .4)) for j in range(4)]
        f.part([('cap', seg[j], seg[j + 1], max(.6, 1.7 - j * .35), max(.5, 1.4 - j * .35)) for j in range(3)], c['Fn'] if i % 2 else c['B'], band=0.9)
    for i in range(2): f.part([('cap', (hx + L * .2, hy - 2 + i * 4), (hx + L * .55, hy - 3 + i * 6 + math.sin(t + i) * 2), 1.1, .9)], c['B'], band=0.9)
    f.flat([('ell', hx + L * .05, hy - L * .05, L * .08 + 1, L * .08 + 1)], c['W']); f.flat([('ell', hx + L * .07, hy - L * .05, L * .045 + .5, L * .06 + .5)], c['EYE'])
    for i in range(5): f.px(cx - L * .4 + i * L * .12, cy - L * .1 + (i % 2) * L * .1, c['A2'] if math.sin(t * 2 + i) > -.2 else c['B'][3])
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ crab / lobster ------------------------------------------------------------------
def t_crab(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2 - rec, Hd / 2
    lob = o.get('lobster'); sc = math.sin(t * (1 + p['amp'] * 2))
    if lob:
        pts = spine(6, cx + L * .2, cx - L * .42, cy, p['amp'] * .8, t, 2.0, p['curl'], p['arch'], p['head'])
        for i in range(1, 5): f.part([('cap', (pts[i][0], pts[i][1] + L * .09), (pts[i][0] - 2 + math.sin(t * 2 + i) * 1.5, pts[i][1] + L * .22), .8, .6)], c['Fn'], band=0.9)   # legs
        xb, yb = pts[-1]; f.part([('poly', [(xb + 1, yb - 2), (xb - L * .15, yb - L * .15), (xb - L * .2, yb), (xb - L * .15, yb + L * .15), (xb + 1, yb + 2)])], c['Fn'], band=0.8)
        f.part(caps(pts, [L * .11, L * .15, L * .14, L * .12, L * .09, L * .06]), c['B'], band=0.62)
        for i in range(1, 5): f.line([(pts[i][0] - 1, pts[i][1] - L * .12), (pts[i][0] - 1.5, pts[i][1] + L * .1)], c['A'])
        hx, hy = pts[0]
        for s_ in (-1, 1):
            e = (hx + L * .2, hy + s_ * L * .12 - L * .05 - p['curl']); f.part([('cap', (hx + L * .05, hy + s_ * L * .08), e, L * .06, L * .08), ('ell', e[0] + L * .1, e[1], L * .13, L * .08 + abs(sc) * 1.2)], c['B'], band=0.62)
        f.line([(hx + 2, hy - 2), (hx + L * .35, hy - L * .2 + math.sin(t) * 2)], c['B'][2], False); f.line([(hx + 2, hy - 1), (hx + L * .33, hy - L * .08 + math.sin(t + 1) * 2)], c['B'][2], False)
        f.flat([('rect', round(hx - 1), round(hy - L * .1), 2, 2)], c['W']); f.px(hx, hy - L * .1 + 1, c['EYE'])
        return F1.finish_frame(f, p, (Wd, Hd))
    by = cy + L * .05
    for i in range(4):   # legs
        for s_ in (-1, 1):
            x0 = cx + s_ * L * .22 * (.4 + i * .22) - s_ * 0; k = math.sin(t * 2 + i + (0 if s_ > 0 else 1.5)) * 1.6 * (0.3 + p['amp'])
            f.part([('cap', (x0, by + L * .12), (x0 + s_ * L * .2, by + L * .24 + k), .9, .6), ('cap', (x0 + s_ * L * .2, by + L * .24 + k), (x0 + s_ * L * .26, by + L * .42), .6, .5)], c['Fn'], band=0.9)
    f.part([('ell', cx, by, L * .42, L * .26)], c['B'], band=0.6)
    if o.get('plates'):
        for i in range(-2, 3): f.line([(cx + i * L * .12, by - L * .22), (cx + i * L * .12 - .5, by + L * .1)], c['A'])
    for s_ in (-1, 1):
        sh = (cx + s_ * L * .38, by - L * .02); el = (cx + s_ * L * .55, by - L * .2 - abs(p['curl']) * 2 - (1 + sc) * 1.5); hd = (el[0] + s_ * L * .08, el[1] - L * .14)
        f.part([('cap', sh, el, 1.6, 1.4), ('cap', el, hd, 1.4, 1.2), ('ell', hd[0], hd[1] - 1, L * .12, L * .1)], c['B'], band=0.62)
        f.px(hd[0] + s_ * 1, hd[1] - 1, c['A'])
        f.line([(cx + s_ * 3, by - L * .24), (cx + s_ * 3, by - L * .36)], c['B'][2], False); f.flat([('rect', round(cx + s_ * 3 - 1), round(by - L * .4), 2, 2)], c['W']); f.px(cx + s_ * 3, by - L * .4 + 1, c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ turtle ------------------------------------------------------------------
def t_turtle(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2 - rec, Hd / 2 + L * .05
    sw = math.sin(t) * (1 + p['amp'] * 1.4) * L * .06 + p['curl'] * 3
    f.part([('poly', [(cx - L * .45, cy + 1), (cx - L * .62, cy + 3 + math.sin(t) * 1)])], c['Fn'], band=0.9)
    f.part([('cap', (cx + L * .26, cy + L * .08), (cx + L * .26 - L * .18, cy + L * .26 + sw * .6), L * .07, L * .09)], c['Fn'], band=0.9)   # back flippers
    f.part([('cap', (cx - L * .22, cy + L * .1), (cx - L * .36, cy + L * .22 - sw * .5), L * .06, L * .08)], c['Fn'], band=0.9)
    hx, hy = cx + L * .5, cy - L * .04 + (-p['head'] * 2)
    f.part([('cap', (cx + L * .3, cy), (hx, hy), L * .09, L * .08), ('ell', hx + L * .03, hy, L * .1, L * .09)], c['Fn'], band=0.62)
    f.part([('ell', cx, cy - L * .04, L * .42, L * .3)], c['B'], band=0.6, cut=[('rect', cx - L * .5, cy + L * .16, L, L * .3)])
    f.part([('rect', cx - L * .42, cy + L * .08, L * .84, L * .1)], c['Fn'], band=0.9)
    for i in range(-2, 3): f.line([(cx + i * L * .16, cy - L * .3 + abs(i) * 2), (cx + i * L * .16 + (1 if i < 0 else -1) * L * .05, cy + L * .08)], c['A'])
    f.line([(cx - L * .35, cy - L * .1), (cx + L * .35, cy - L * .1)], c['A'])
    if o.get('moss'):
        for i in range(7): f.px(cx - L * .3 + i * L * .1, cy - L * .31 + abs(3 - i) * 1.4, c['A2'])
        f.part([('poly', [(cx - 2, cy - L * .3), (cx, cy - L * .3 - 8), (cx + 2, cy - L * .3)]), ('ell', cx, cy - L * .3 - 9, 4, 3)], [c['A'], c['A2'], c['A2'], c['A2']], band=0.8)
    if o.get('island'):
        f.part([('ell', cx - L * .02, cy - L * .32, L * .26, L * .07)], ['#b0a070', '#d8c890', '#d8c890', '#f0e0a8'], band=0.8)
        for dx, h in ((-8, 11), (0, 15), (8, 10)): f.part([('cap', (cx + dx, cy - L * .3), (cx + dx + 1, cy - L * .3 - h), 1, .8)], [c['A'], c['A'], c['A2'], c['A2']], band=0.9); f.flat([('ell', cx + dx + 1, cy - L * .3 - h, 4, 2)], c['A2'])
        f.flat([('rect', round(cx + 12), round(cy - L * .3 - 4), 5, 4)], '#b0a070'); f.px(cx + 14, cy - L * .3 - 3, '#f0e0a8')
    f.flat([('rect', round(hx + 1), round(hy - 2), 2, 2)], c['W']); f.px(hx + 2, hy - 1, c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ seahorse / puffer / shrimp / star / conch / urchin / anemone ------------------------------------------------------------------
def t_seahorse(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2; sw = math.sin(t) * (.8 + p['amp'] * 1.2) + p['curl'] * 2
    pts = []
    for i in range(9):
        u = i / 8; a = u * 3.2 + .3
        pts.append((cx - L * .08 * math.sin(a * 1.2) + sw * u * .6, cy - L * .5 + u * L * .78 - (L * .07) * math.sin(a * 2) * 0 + (L * .11) * math.sin(u * 5.5) * u))
    pts = [(x, y) for x, y in pts]; rad = [L * r for r in [.12, .15, .15, .14, .12, .09, .07, .05, .03]]
    f.part([('poly', [(pts[2][0] - 2, pts[2][1]), (pts[3][0] - 6 - math.sin(t * 3), pts[3][1] + 2), (pts[4][0] - 1, pts[4][1] + 1)])], c['Fn'], band=0.9)
    f.part(caps(pts, rad), c['B'], band=0.62)
    hx, hy = pts[0]; f.part([('cap', (hx + 1, hy), (hx + L * .26, hy + 2), L * .06, L * .045)], c['B'], band=0.8)
    for i in range(1, 6): f.line([(pts[i][0] - rad[i], pts[i][1]), (pts[i][0] + rad[i] * .6, pts[i][1])], c['A'])
    f.flat([('rect', round(hx - 1), round(hy - 2), 2, 2)], c['W']); f.px(hx, hy - 1, c['EYE'])
    f.part([('poly', [(hx - 2, hy - L * .12), (hx - 4, hy - L * .2), (hx + 1, hy - L * .13)])], c['Fn'], band=0.9)
    return F1.finish_frame(f, p, (Wd, Hd))

def t_puffer(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2; inf = 1 if (p['curl'] or p['arch']) else 0
    r = L * (.34 + .1 * inf) + math.sin(t) * .5; sp_n = 14
    f.part([('poly', [(cx - r, cy), (cx - r - L * .2, cy - L * .16 + math.sin(t * 2) * 2), (cx - r - L * .15, cy + L * .16 + math.sin(t * 2) * 2)])], c['Fn'], band=0.8)
    f.part([('ell', cx, cy, r, r * .92)], c['B'], band=0.6)
    f.part([('ell', cx + r * .15, cy + r * .5, r * .6, r * .3)], [c['BELLY'], c['BELLY'], c['BELLY'], c['BELLY']], band=0.9)
    for i in range(sp_n):
        a = i / sp_n * TAU; ln = L * (.1 + .1 * inf); x1 = cx + math.cos(a) * r * .95; y1 = cy + math.sin(a) * r * .88; f.fx.append((x1 + math.cos(a) * ln * .5, y1 + math.sin(a) * ln * .5, c['A2'])); f.fx.append((x1 + math.cos(a) * ln, y1 + math.sin(a) * ln, c['A2']))
    f.part([('poly', [(cx, cy + 1), (cx - 5, cy + 4 + math.sin(t * 3) * 2), (cx - 1, cy + 5)])], c['Fn'], band=0.9)
    f.flat([('ell', cx + r * .45, cy - r * .2, 3, 3)], c['W']); f.flat([('ell', cx + r * .5, cy - r * .2, 1.6, 1.8)], c['EYE'])
    f.px(cx + r * .9, cy + r * .2, c['EYE']); f.px(cx + r * .9, cy + r * .2 + 1, c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

def t_shrimp(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2; k = math.sin(t * (1 + p['amp'] * 2)) * (.6 + p['amp'])
    pts = []
    for i in range(8): u = i / 7; a = (1 - u) * 2.2 - .6; pts.append((cx + L * .28 * math.cos(a + 2.4) * 1.2 - L * .1 + u * -L * .1 + k * u, cy - L * .1 + L * .3 * math.sin(a + 2.4) * -.8 + u * L * .1))
    pts = [(cx + L * .3 - i * L * .1 + math.sin(i * .5) * 0, cy - L * .15 * math.sin(i / 7 * 3) * 1.4 + (i * L * .02) + k * (i / 7)) for i in range(8)]
    rad = [L * r for r in [.1, .13, .13, .12, .1, .08, .06, .04]]
    xb, yb = pts[-1]; f.part([('poly', [(xb + 1, yb), (xb - 4, yb - 4 + k), (xb - 5, yb + k), (xb - 4, yb + 4 + k)])], c['Fn'], band=0.8)
    f.part(caps(pts, rad), c['B'], band=0.62)
    for i in range(1, 6): f.line([(pts[i][0], pts[i][1] - rad[i] + .5), (pts[i][0] - .4, pts[i][1] + rad[i] - .5)], c['A'])
    for i in range(1, 5): f.part([('cap', (pts[i][0], pts[i][1] + rad[i] * .8), (pts[i][0] - 2 + math.sin(t * 3 + i), pts[i][1] + rad[i] + 3), .6, .5)], c['Fn'], band=0.9)
    hx, hy = pts[0]; cl = (hx + L * .22, hy + 2 - abs(p['curl']) * 3 - (1 + math.sin(t * 2)) * 2)   # the big knocking claw
    f.part([('cap', (hx + 2, hy + 3), cl, 1.6, 2.4), ('ell', cl[0] + L * .08, cl[1] - 1, L * .1, L * .08)], c['B'], band=0.62)
    f.line([(hx + 2, hy - 3), (hx + L * .4, hy - L * .3 + math.sin(t) * 2)], c['B'][2], False); f.line([(hx + 1, hy - 2), (hx + L * .36, hy - L * .18 + math.sin(t + 1) * 2)], c['B'][2], False)
    f.flat([('rect', round(hx - 1), round(hy - 3), 2, 2)], c['W']); f.px(hx, hy - 2, c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

def t_star(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2; rot = math.sin(t) * .12 + p['curl'] * .4; pul = 1 + math.sin(t) * .05 + p['arch'] * .1
    pts = []
    for i in range(10): a = rot + i / 10 * TAU - math.pi / 2; r = L * .5 * pul if i % 2 == 0 else L * .2; pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r * .8))
    f.part([('poly', pts)], c['B'], band=0.6)
    for i in range(5):
        a = rot + i / 5 * TAU - math.pi / 2; f.line([(cx, cy), (cx + math.cos(a) * L * .4 * pul, cy + math.sin(a) * L * .32 * pul)], c['A'])
        for j in (.45, .72): f.px(cx + math.cos(a) * L * .5 * j * pul, cy + math.sin(a) * L * .4 * j * pul, c['A2'] if math.sin(t * 2 + i + j * 5) > -.1 else c['B'][3])
    f.flat([('ell', cx, cy, 2.2, 2)], c['B'][3])
    return F1.finish_frame(f, p, (Wd, Hd))

def t_conch(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2 + L * .1; sw = math.sin(t) * (.5 + p['amp']) + p['curl'] * 2
    f.part([('ell', cx + L * .28, cy + L * .22, L * .3, L * .1)], c['Fn'], band=0.9)
    for s_ in (0, 1): e = (cx + L * (.4 + s_ * .08), cy + L * .1); f.line([(cx + L * (.36 + s_ * .08), cy + L * .16), (e[0] + sw * .3, e[1] - L * .14)], c['Fn'][2], False); f.px(e[0] + sw * .3, e[1] - L * .15, c['EYE'])
    pts = [(cx - L * .3, cy + L * .05), (cx - L * .08, cy - L * .05), (cx + L * .12, cy - L * .1), (cx + L * .3, cy - L * .02)]; rad = [L * .1, L * .2, L * .27, L * .2]
    f.part([('poly', [(cx - L * .5, cy + L * .1), (cx - L * .3, cy - L * .1), (cx - L * .3, cy + L * .15)])], c['B'], band=0.8)
    f.part(caps(pts, rad), c['B'], band=0.58)
    for i in range(4): a = .6 + i * .55; f.line([(cx - L * .1 + math.cos(a) * L * .08, cy - L * .05 + math.sin(a) * L * .05), (cx + L * .12 + math.cos(a) * L * .2, cy - L * .1 + math.sin(a) * L * .16)], c['A'])
    f.line([(cx + L * .15, cy + L * .14), (cx + L * .32, cy + L * .04)], c['A2'])
    return F1.finish_frame(f, p, (Wd, Hd))

def t_urchin(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2; r = L * .26
    n = 18
    for i in range(n):
        a = i / n * TAU + math.sin(t + i) * .04 + p['curl'] * .1; ln = L * (.28 + .06 * (i % 2)) * (1 + .12 * p['arch']); f.part([('cap', (cx + math.cos(a) * r * .8, cy + math.sin(a) * r * .8), (cx + math.cos(a) * ln, cy + math.sin(a) * ln), 1.1, .5)], c['Fn'], band=0.9)
    f.part([('ell', cx, cy, r, r)], c['B'], band=0.6)
    for i in range(4): a = i * 1.6 + 1; f.px(cx + math.cos(a) * r * .5, cy + math.sin(a) * r * .5, c['A2'] if math.sin(t * 2 + i) > -.2 else c['B'][3])
    f.flat([('ell', cx, cy + r * .45, 1.6, 1.2)], c['EYE'])
    return F1.finish_frame(f, p, (Wd, Hd))

def t_anemone(sp, p, Wd, Hd):
    c, L, o = sp['c'], sp['L'], sp['o']; f = Frame(Wd, Hd, c['OUT']); t = p['t']; cx, cy = Wd / 2 - p['rec'], Hd / 2 + L * .3; clo = .5 if p['jaw'] else 0
    for i in range(11):
        u = i / 10 - .5; seg = [(cx + u * L * .6 * (1 - clo * .6) + math.sin(t * 1.5 - j * .8 + i * .7) * (1 + j * .5) + p['curl'] * j, cy - L * .08 - j * L * (.16 - clo * .05)) for j in range(5)]
        f.part([('cap', seg[j], seg[j + 1], max(.7, 1.7 - j * .3), max(.5, 1.5 - j * .3)) for j in range(4)], c['Fn'] if i % 2 else c['B'], band=0.9)
        f.px(seg[4][0], seg[4][1], c['A2'] if math.sin(t * 2 + i) > -.2 else c['B'][3])
    f.part([('rect', cx - L * .24, cy - L * .1, L * .48, L * .22), ('ell', cx, cy - L * .1, L * .24, L * .08)], c['B'], band=0.6)
    f.line([(cx - L * .15, cy), (cx + L * .15, cy)], c['A'])
    return F1.finish_frame(f, p, (Wd, Hd))

# ------------------------------------------------------------------ angler (small and the approved big one) ------------------------------------------------------------------
def t_angler(sp, p, Wd, Hd):
    return None   # drawn with the approved sample code (see main)

TPL = dict(fish=t_fish, eel=t_eel, ray=t_ray, jelly=t_jelly, squid=t_squid, crab=t_crab, turtle=t_turtle, seahorse=t_seahorse, puffer=t_puffer, shrimp=t_shrimp, star=t_star, conch=t_conch, urchin=t_urchin, anemone=t_anemone)

# ------------------------------------------------------------------ the 45 species ------------------------------------------------------------------
SPECIES = [
    # ---- B ----
    S('minnow', 'fish', 14, cols('#aab4cc', '#8a96b4', glow='#ffffff'), th=.8, tail='fork', dorsal='fin', pat='belly', belly2=True, eye=1),
    S('carp', 'sample', 20, None),
    S('pebblecrab', 'crab', 20, cols('#8a8a96', '#6a6a78', accent='#4a4a58', glow='#d8d8e8'), plates=True),
    S('knockshrimp', 'shrimp', 18, cols('#e0746a', '#c8584e', glow='#ffd0c0', accent='#8a3028')),
    S('emberstar', 'star', 20, cols('#e8602a', '#c8481e', glow='#ffd34e', accent='#8a2810', accent2='#ffd34e')),
    S('conch', 'conch', 18, cols('#e8c8a0', '#c8a078', glow='#fff0d8', accent='#a8784a', accent2='#f0a0a0')),
    S('bubblejelly', 'jelly', 20, cols('#a8e0f0', '#80c0d8', glow='#e8fcff', accent='#5090b0'), n=5, arms=1, glowfx=True),
    S('seahorse', 'seahorse', 22, cols('#e8c040', '#c89a28', glow='#fff6c0', accent='#8a6a10')),
    S('urchin', 'urchin', 20, cols('#8a50c0', '#6a38a0', glow='#e0c0ff', accent='#c898f0')),
    S('sardine', 'fish', 16, cols('#b8c8e0', '#6f8ab0', glow='#ffffff'), th=.7, tail='lunate', dorsal='fin', pat='scales', belly2=True),
    S('anemone', 'anemone', 20, cols('#58c878', '#3ea05c', glow='#d8ffe0', accent='#2a7a40', accent2='#e8ffd0')),
    S('mudskipper', 'fish', 18, cols('#8a8a58', '#6a6a40', glow='#d8e890', accent='#4a4a28'), th=.85, tail='round', tl=.25, dorsal='fin', pat='spots', eyes_top=True, legs=True, belly=False),
    # ---- A ----
    S('perch', 'fish', 26, cols('#58b868', '#3a8a50', glow='#e0ffd0', accent='#285a34'), th=.95, tail='fork', dorsal='spiny', pat='stripes', gills=True, eye=1.6),
    S('glowfin', 'fish', 26, cols('#40b8d8', '#2a90b8', glow='#bff8ff', accent='#1a6080'), th=.85, tail='fork', dorsal='fin', pat='spots', eye=1.6),
    S('puffer', 'puffer', 26, cols('#e8c85a', '#c8a040', glow='#fff0b0', accent='#8a6a20', accent2='#ffe8a0')),
    S('rosesquid', 'squid', 30, cols('#f08aa8', '#d86a90', glow='#ffd0e0', accent='#a04068', accent2='#ffd0e0')),
    S('sandray', 'ray', 36, cols('#d8c08a', '#b89a64', glow='#f8e8b8', accent='#8a7040'), spots=True),
    S('youngsword', 'fish', 36, cols('#5a80c8', '#3a5aa0', glow='#c8e0ff', accent='#243c70'), th=.62, tail='lunate', dorsal='tall', head='sword', pat='belly', belly2=True, eye=1.2),
    S('seaturtle', 'turtle', 34, cols('#58a060', '#3a7a48', glow='#d8f0c8', accent='#285a34', accent2='#9ad070'), moss=False),
    S('armorlobster', 'crab', 32, cols('#4a8a9a', '#2e6a7c', accent='#1e4858', glow='#a8e0f0'), lobster=True),
    S('jadeknife', 'fish', 38, cols('#48c8a0', '#2ea080', glow='#d0fff0', accent='#1c6a54'), th=.45, tail='lunate', tl=.22, dorsal='fin', pat='belly', eye=1.2),
    S('flowerocto', 'squid', 32, cols('#d070c0', '#b050a0', glow='#ffd0f0', accent='#703068', accent2='#ffd8f0'), octopus=True),
    S('lilangler', 'angler_s', 28, None),
    S('sparkjelly', 'jelly', 24, cols('#b8a8f0', '#9080d8', glow='#fff6a0', accent='#ffe44e'), n=6, arms=2, box=True, glowfx=True),
    # ---- S ----
    S('mooneel', 'eel', 46, cols('#b8b0e0', '#7a6ab8', glow='#efe8ff', accent='#4a3a88', accent2='#fff6c0'), pat='bands', th=1.0),
    S('stripeshark', 'fish', 52, cols('#7a8a9a', '#586878', glow='#ffffff', accent='#1a2430'), th=.8, tail='shark', tl=.32, dorsal='tall', pat='stripes', teeth=True, gills=True, eye=1.2, belly2=True),
    S('devilray', 'ray', 50, cols('#8a6a9a', '#6a4a7a', glow='#ffd0d0', accent='#ff6a5a'), horns=True),
    S('stormeel', 'eel', 52, cols('#3a4a6a', '#2a3550', glow='#ffffff', accent='#1a2038', accent2='#ffe44e'), pat='bolt', th=1.1, teeth=1),
    S('ghostsquid', 'squid', 44, cols('#d0e8f0', '#a8c8d8', glow='#ffffff', accent='#7aa0b8', accent2='#bff8ff')),
    S('sailfish', 'fish', 52, cols('#d8483a', '#a82e24', glow='#ffd0c0', accent='#701810'), th=.58, tail='lunate', dorsal='sail', head='sword', pat='belly', belly2=True, eye=1.4),
    S('emperorcrab', 'crab', 46, cols('#c8603a', '#a04624', glow='#ffd0a0', accent='#6a2a14'), plates=True),
    S('stoneturtle', 'turtle', 52, cols('#8a8a78', '#686858', glow='#d8e0b0', accent='#4a6a38', accent2='#70a050'), moss=True),
    S('hammerhead', 'fish', 52, cols('#c8a838', '#9a7e24', glow='#fff0a0', accent='#5a4610'), th=.78, tail='shark', tl=.3, dorsal='tall', head='hammer', pat='belly', gills=True, eye=.6),
    S('parasoljelly', 'jelly', 44, cols('#f0a0d0', '#d880b0', glow='#fff0c0', accent='#a04880', accent2='#ffe8a0'), n=9, arms=3, tl=.28, glowfx=True),
    # ---- SS ----
    S('moonfish', 'fish', 52, cols('#c8d8e8', '#8aa0b8', glow='#ffffff', accent='#506880'), th=2.1, tail='round', tl=.14, dorsal='fin', pat='scales', prof=[.1, .17, .2, .19, .14, .08, .05], eye=1.8, belly=False),
    S('ironshark', 'fish', 62, cols('#6a7078', '#464c54', glow='#d0a070', accent='#2a2e34', accent2='#b87a3a'), th=.8, tail='shark', tl=.3, dorsal='tall', teeth=True, gills=True, pat='scales', eye=1.2),
    S('elderocto', 'squid', 52, cols('#a85040', '#7e3a30', glow='#ffd0a0', accent='#501e1a', accent2='#70d0a0'), octopus=True),
    S('abysslantern', 'sample2', 60, None),
    S('bonewhale', 'fish', 74, cols('#d8d0c0', '#a8a090', glow='#bff8ff', accent='#6a6458', accent2='#bff8ff'), th=.82, tail='lunate', tl=.2, dorsal='none', pat='ribs', eye=1.4, breath=True, belly=False, prof=[.12, .2, .24, .22, .17, .1, .05]),
    S('dragonmoray', 'eel', 58, cols('#8a2a4a', '#601c36', glow='#ffd0a0', accent='#38101e', accent2='#ffb04a'), pat='scales', th=1.2, teeth=2),
    # ---- SSS ----
    S('golden', 'fish', 30, cols('#ffd34e', '#d8a024', glow='#fff6c0', accent='#8a5a10', accent2='#ffffff'), th=1.0, tail='fork', dorsal='fin', pat='scales', barbel=True, crown=True, sparkle=True, eye=1.4),
    S('wyrm', 'eel', 84, cols('#2a8ab8', '#1c6a90', glow='#e0f8ff', accent='#0e3c58', accent2='#ffd34e'), pat='scales', th=1.5, horns=True, teeth=2),
    S('colossquid', 'squid', 72, cols('#2a3a8a', '#1c2866', glow='#bff8ff', accent='#101a44', accent2='#9fe8ff')),
    S('crystalfish', 'fish', 44, cols('#bff8ff', '#7ed0e8', glow='#ffffff', accent='#3a90b0', accent2='#ffffff'), th=1.0, tail='fork', dorsal='fin', pat='eyes', eye=1.2),
    S('islandturtle', 'turtle', 84, cols('#6a8a58', '#4a6a40', glow='#e0f0c0', accent='#2e5a2e', accent2='#60b050'), island=True),
]

def render_species(sp, big=None):
    """draw all six states on a big canvas, then crop to the tightest cell centred on the body (anchor = cell centre)"""
    if sp['tpl'] == 'sample':
        fn = lambda p: F1.carp_draw(p); Wd, Hd = 48, 32
    elif sp['tpl'] == 'sample2':
        fn = lambda p: F1.ang_draw(p); Wd, Hd = 96, 72
    elif sp['tpl'] == 'angler_s':
        fn = lambda p: small_angler(sp, p); Wd, Hd = 80, 64
    else:
        L = sp['L']; Wd = int(L * 2.6 + 24); Hd = int(L * 1.9 + 24); Wd += Wd % 2; Hd += Hd % 2
        T = TPL[sp['tpl']]; fn = lambda p: T(sp, p, Wd, Hd)
    st = F1.states_for(fn, (Wd, Hd))
    # crop to the union box, symmetric about the centre
    ext = [0, 0, 0, 0]; cx, cy = Wd // 2, Hd // 2
    for frames, fps, loop in st.values():
        for im in frames:
            bb = im.getbbox()
            if bb: ext = [max(ext[0], cx - bb[0]), max(ext[1], cy - bb[1]), max(ext[2], bb[2] - cx), max(ext[3], bb[3] - cy)]
    hw = max(ext[0], ext[2]) + 3; hh = max(ext[1], ext[3]) + 3; hw += hw % 2; hh += hh % 2
    cell = (hw * 2, hh * 2); out = {}
    for k, (frames, fps, loop) in st.items():
        out[k] = ([im.crop((cx - hw, cy - hh, cx + hw, cy + hh)) for im in frames], fps, loop)
    return out, cell

def small_angler(sp, p):
    c = cols('#3a5a8a', '#2a4070', glow='#7ef0ff', accent='#2a2050', accent2='#ffe88a')
    Wd, Hd = 80, 64; f = Frame(Wd, Hd, c['OUT']); t = p['t']; rec = p['rec']; cx, cy = Wd / 2 - 2 * rec, Hd / 2 + math.sin(t * 2) * .8
    tp = spine(5, cx - 6, cx - 16, cy + 1, p['amp'] * 1.0, t, 2.6, p['curl'], p['arch'], 0); xb, yb = tp[-1]
    f.part(caps(tp, [5, 4, 3.2, 2.4, 1.6]), c['B'], band=0.66)
    f.part([('poly', [(xb + 1, yb), (xb - 5, yb - 6), (xb - 3, yb), (xb - 5, yb + 6)])], c['Fn'], band=0.8)
    jaw = p['jaw'] * 3
    f.part([('poly', [(cx, cy + 3), (cx + 12, cy + 1 + jaw), (cx + 11, cy + 5 + jaw), (cx - 1, cy + 8)])], c['B'], band=0.7)
    f.part([('ell', cx, cy, 10, 8), ('ell', cx + 5, cy - 2, 7, 6)], c['B'], band=0.64)
    for i in range(5): x = cx + 4 + i * 1.8; f.flat([('poly', [(x, cy + 1), (x + .9, cy + 3), (x + 1.8, cy + 1)])], '#ffffff')
    f.flat([('ell', cx + 5, cy - 3, 2, 2)], '#ffd34e'); f.px(cx + 5.5, cy - 3, c['EYE'])
    s0 = (cx + 3, cy - 7); s1 = (cx + 7, cy - 13 + math.sin(t) * 1.5); s2 = (cx + 14 + math.sin(t + 1) * 1.5, cy - 11)
    f.line([s0, s1, s2], c['A'], False); f.flat([('ell', s2[0], s2[1] + 1, 2.6, 2.6)], c['A2'])
    for k in range(6): a = k / 6 * TAU + t * .3; f.fx.append((s2[0] + math.cos(a) * 5, s2[1] + 1 + math.sin(a) * 5, c['GLOW']))
    for i, (dx, dy) in enumerate([(-6, 1), (-2, 3), (-9, -2)]): f.px(cx + dx, cy + dy, c['GLOW'])
    return F1.finish_frame(f, p, (Wd, Hd))

def build_all(only=None):
    os.makedirs(OUTD, exist_ok=True); atlas_items = []; sheets = {}
    for sp in SPECIES:
        if only and sp['id'] not in only: continue
        st, cell = render_species(sp)
        folder = os.path.join(OUTD, sp['id'])
        cols_used = set()
        for frames, _, _ in st.values():
            for im in frames:
                px = im.load()
                for y in range(im.size[1]):
                    for x in range(im.size[0]):
                        if px[x, y][3]: cols_used.add(px[x, y][:3])
        cols_used.discard((255, 255, 255))
        pal = ['#%02x%02x%02x' % c3 for c3 in sorted(cols_used)]
        save_set(sp['id'], folder, cell, (cell[0] // 2, cell[1] // 2), st, pal[:16] if len(pal) <= 16 else pal, 'faces right; anchor = body centre (cell centre); flip around the anchor; fish rank sample set')
        iss = check(sp['id'], st, cell, (cell[0] // 2, cell[1] // 2), pal, ground=False)
        flag = '' if len(pal) <= 16 else '  PALETTE %d' % len(pal)
        for i in iss[:2]: flag += '  ' + i
        print('%-14s cell %3dx%-3d colours %2d%s' % (sp['id'], cell[0], cell[1], len(pal), flag))
        sheets[sp['id']] = (st, cell)
    return sheets

def pack_atlas():
    """one PNG + one JSON with every species' states, so the game loads a single image"""
    ids = [s['id'] for s in SPECIES]; items = []
    for i in ids:
        folder = os.path.join(OUTD, i); m = json.load(open(os.path.join(folder, i + '.json'), encoding='utf-8')); cw, ch = m['cell']
        for st, info in m['states'].items(): items.append((i, st, info, cw, ch, Image.open(os.path.join(folder, info['file'])).convert('RGBA')))
    AW = 1024; x = y = rowh = 0; place = []
    for i, st, info, cw, ch, im in items:
        w = im.size[0]
        if x + w > AW: x = 0; y += rowh; rowh = 0
        place.append((i, st, info, cw, ch, im, x, y)); x += w; rowh = max(rowh, ch)
    AH = y + rowh; atlas = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); idx = {}
    for i, st, info, cw, ch, im, px_, py_ in place:
        atlas.paste(im, (px_, py_)); e = idx.setdefault(i, {'cell': [cw, ch], 'states': {}}); e['states'][st] = {'x': px_, 'y': py_, 'n': info['frames'], 'fps': info['fps'], 'loop': info['loop']}
    atlas.save(os.path.join(OUTD, 'fish.png'), optimize=True)
    json.dump({'file': 'fish.png', 'size': [AW, AH], 'fish': idx}, open(os.path.join(OUTD, 'fish.json'), 'w', encoding='utf-8'), separators=(',', ':'))
    print('atlas', AW, AH, os.path.getsize(os.path.join(OUTD, 'fish.png')) // 1024, 'KB')

def overview():
    ids = [s['id'] for s in SPECIES]; cells = []
    for i in ids:
        m = json.load(open(os.path.join(OUTD, i, i + '.json'), encoding='utf-8')); cw, ch = m['cell']
        im = Image.open(os.path.join(OUTD, i, m['states']['idle']['file'])).convert('RGBA').crop((0, 0, cw, ch)); cells.append((i, im))
    sc = 2; cols_ = 5; cwmax = max(im.size[0] for _, im in cells) * sc; chmax = max(im.size[1] for _, im in cells) * sc
    rows = (len(cells) + cols_ - 1) // cols_; sheet = Image.new('RGBA', (cols_ * (cwmax + 8) + 8, rows * (chmax + 22) + 8), (34, 30, 52, 255)); d = ImageDraw.Draw(sheet)
    for k, (i, im) in enumerate(cells):
        x = 8 + (k % cols_) * (cwmax + 8); y = 8 + (k // cols_) * (chmax + 22); big = im.resize((im.size[0] * sc, im.size[1] * sc), Image.NEAREST)
        sheet.alpha_composite(big, (x + (cwmax - big.size[0]) // 2, y + (chmax - big.size[1]) // 2)); d.text((x + 2, y + chmax + 6), '%d %s' % (k + 1, i), fill=(230, 230, 240, 255))
    os.makedirs(os.path.join(ROOT, 'docs', 'sprites_6'), exist_ok=True); sheet.save(os.path.join(ROOT, 'docs', 'sprites_6', 'fish_all.png'))

if __name__ == '__main__':
    only = set(sys.argv[1:]) or None
    build_all(only); pack_atlas(); overview()
