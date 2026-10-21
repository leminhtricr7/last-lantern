# Quoc's eight forms (map 10 final fight) - a journey from a fallen man to the heart of the Eclipse.
# Every form shares Quoc's colours: black armour, a red-violet glow, and the old cracked lantern somewhere on him.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build, fit_states
from giants import rig, front_arm

OUT = '#08040c'
A0, A1, A2, A3 = '#140e1c', '#2a2036', '#463a56', '#6a5a7e'      # black armour
R0, R1, R2 = '#6a0e1a', '#c0202a', '#ff5a4a'                    # red glow
V0, V1, V2 = '#3a1a6a', '#7a3ad0', '#c08aff'                    # violet (eclipse)
BONE, LAMP, LAMP2 = '#d8d0c0', '#ffb04a', '#ffe8a0'
BASE = [OUT, A0, A1, A2, A3, R0, R1, R2, V0, V1, V2, BONE, LAMP, LAMP2]
RAGE = {R1: '#ff2a6a', R2: '#ffd0e0', V1: '#ff3aff'}
PAL = BASE + ['#ff2a6a', '#ffd0e0', '#ff3aff']
C = dict(back=[A0, A0, A1, A2], mid=[A0, A1, A2, A3], front=[A0, A1, A2, A3])

def lantern(f, x, y, lit=1.0):
    f.part([('rect', x - 2, y, 5, 6)], [A0, A1, A2, A2]); f.flat([('rect', x - 1, y + 1, 3, 4)], LAMP if lit > 0.5 else R0)
    f.px(x, y + 2, LAMP2 if lit > 0.5 else R1); f.line([(x - 1, y + 1), (x + 1, y + 4)], A0)   # the crack
    f.line([(x, y - 3), (x, y)], A2)

def eyes(f, x, y, p, gap=3, col=R2):
    c = '#ffd0e0' if p.get('rage') else col
    f.flat([('rect', x, y, 2, 1), ('rect', x + gap, y, 2, 1)], c)

# 1. the Fallen Lanternbearer: a man in spiked black armour, ragged cape, bone crown, cracked lantern
def fallen(p):
    W, H, G = 104, 104, 100; f = Frame(W, H, OUT)
    k = rig(f, p, C, 46, G, 34, 28, 9, 30, 3.5, 3.5); sx, sy, hy = k['sx'], k['sy'], k['hy']
    sway = math.sin(k['t']) * 2 + (4 if p['walk'] else 0)
    f.part([('poly', [(sx - 9, sy), (sx - 16 - sway, G - 6), (sx - 8 - sway, G - 10), (sx - 4 - sway, G - 4), (sx - 2, hy)])], [R0, R0, R1, R1])   # cape
    f.part([('poly', [(sx - 10, sy), (sx + 10, sy), (sx + 8, hy + 2), (sx - 8, hy + 2)])], C['mid'], band=0.6)
    for dx in (-10, 10): f.part([('poly', [(sx + dx - 3, sy + 1), (sx + dx + (4 if dx > 0 else -4), sy - 5), (sx + dx + 3, sy + 1)])], [A1, A2, A3, BONE])   # pauldron spikes
    f.line([(sx - 6, sy + 8), (sx + 6, sy + 8)], R0); f.px(sx, sy + 12, R1)
    lantern(f, sx - 9, hy - 6, 0.3)
    hx, hdy = sx + 1, sy - 7
    f.part([('rect', hx - 5, hdy - 5, 11, 10)], C['front'])
    for i, h in enumerate([5, 8, 6, 9, 5]): f.part([('poly', [(hx - 5 + i * 2.5, hdy - 5), (hx - 4 + i * 2.5, hdy - 5 - h), (hx - 3 + i * 2.5, hdy - 5)])], [BONE, BONE, BONE, '#ffffff' if False else BONE])
    eyes(f, hx + 1, hdy - 1, p)
    hd = front_arm(f, p, k, 9, 30, 3.5, C['front'], extra_a=10)
    f.part([('cap', (hd[0] - 2, hd[1] + 4), (hd[0] + 10, hd[1] - 16), 1.4, 1)], [A2, A3, BONE, BONE])   # a dark blade
    if p['cast'] > 0.4: f.flat([('ell', hd[0] + 6, hd[1] - 4, 3, 3)], R2)
    return f.finish(p['flash']), (W, H, G)

# 2. the Lonely Shade: a small shadow child hugging its knees, long arms of shadow when it attacks
def shade(p):
    W, H, G = 64, 64, 60; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
    hop = abs(math.sin(t * 2)) * 6 if p['walk'] else 0
    cx = 30 - 4 * p['recoil']; by = G - 14 - hop - 3 * p['raise_'] + 2 * p['strike']
    f.part([('ell', cx, by, 11, 12), ('poly', [(cx - 11, by), (cx - 13, G - 2 - hop), (cx - 6, G - 6 - hop), (cx, G - 2 - hop), (cx + 6, G - 6 - hop), (cx + 11, by)])], [A0, A1, A2, A3], band=0.7)
    for s in (-1, 1): f.part([('poly', [(cx + s * 4, by - 10), (cx + s * 7, by - 17), (cx + s * 8, by - 9)])], [A0, A1, A2, A2])   # small horns
    f.flat([('ell', cx + 3, by - 3, 3, 3.5), ('ell', cx + 9, by - 3, 2.5, 3.5)], R0 if not p.get('rage') else '#ff2a6a')
    f.px(cx + 3, by - 4, R2); f.px(cx + 9, by - 4, R2)
    reach = 4 + 18 * (p['strike'] + p['cast'] * 0.8)
    f.part([('cap', (cx + 6, by + 4), (cx + 8 + reach, by + 4 - 6 * p['raise_']), 2.5, 1.5)], [A0, A1, A2, A3])
    for i in range(3): f.part([('cap', (cx + 8 + reach, by + 4 - 6 * p['raise_']), (cx + 12 + reach, by + 1 + i * 3 - 6 * p['raise_']), 1, 0.6)], [A0, A1, A2, A3])
    for i in range(4): f.fx.append((cx - 8 + i * 5, by - 14 - (p['t'] * 10 + i * 3) % 8, V1 if i % 2 else A3))
    return f.finish(p['flash']), (W, H, G)

# 3. the Masterless Hound: a gaunt black hound, broken chain at the neck, burning red mane
def hound(p):
    W, H, G = 96, 64, 60; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi; rec = p['recoil']
    gal = p['walk']; cx = 44 - 4 * rec; by = G - 22 - (abs(math.sin(t)) * 3 if gal else 0) + 3 * p['strike'] - 2 * p['raise_']
    for i, (dx, tone) in enumerate([(-16, C['back']), (14, C['back']), (-12, C['front']), (18, C['front'])]):
        ph = t + (i % 2) * math.pi + (0.5 if i > 1 else 0)
        fx = cx + dx + (math.sin(ph) * 8 if gal else 0); lift = max(0, math.cos(ph)) * 5 if gal else 0
        f.part([('cap', (cx + dx * 0.8, by + 4), (fx - 2, G - 10 - lift), 3, 2), ('cap', (fx - 2, G - 10 - lift), (fx, G - 3 - lift), 2, 1.6), ('rect', fx - 2, G - 4 - lift, 5, 2)], tone)
    f.part([('ell', cx, by, 22, 9), ('ell', cx - 14, by - 1, 10, 9)], C['mid'], band=0.65)   # body and haunch
    for i in range(6): f.line([(cx - 8 + i * 3, by - 3), (cx - 7 + i * 3, by + 5)], A0)   # ribs
    tail_a = math.sin(t * 2) * 0.4
    f.part([('cap', (cx - 22, by - 3), (cx - 34, by - 12 + tail_a * 8), 2.5, 1)], C['back'])
    hx, hy = cx + 22 + 4 * p['strike'], by - 8 - 4 * p['raise_']
    for i in range(6): f.part([('poly', [(cx + 8 + i * 3, by - 6), (cx + 6 + i * 3, by - 16 - (i % 2) * 4), (cx + 11 + i * 3, by - 7)])], [R0, R1, R2, LAMP2])   # burning mane
    f.part([('ell', hx, hy, 9, 7), ('poly', [(hx + 4, hy - 3), (hx + 16, hy + 1), (hx + 15, hy + 5 + 3 * p['cast']), (hx + 3, hy + 6)])], C['front'])
    f.part([('poly', [(hx - 4, hy - 5), (hx - 2, hy - 13), (hx + 2, hy - 6)])], C['front'])   # ear
    f.flat([('rect', hx + 4, hy + 3, 11, 1 + round(3 * p['cast']))], R0)
    for i in range(4): f.px(hx + 6 + i * 3, hy + 3, BONE)
    eyes(f, hx + 3, hy - 2, p, gap=0)
    for i in range(4): f.px(hx - 6 - i * 2, hy + 6 + (i % 2), A3)   # the broken chain
    return f.finish(p['flash']), (W, H, G)

# 4. the Oath-Chained: a big demon wrapped in chains carved with glowing words, a chained weight in hand
def chained(p):
    W, H, G = 112, 96, 92; f = Frame(W, H, OUT)
    k = rig(f, p, C, 50, G, 28, 26, 14, 32, 5.5, 5.5); sx, sy, hy = k['sx'], k['sy'], k['hy']
    f.part([('poly', [(sx - 17, sy), (sx + 16, sy - 1), (sx + 12, hy + 2), (sx - 12, hy + 2)])], C['mid'], band=0.6)
    for y0 in (sy + 6, sy + 15):
        f.line([(sx - 16, y0 - 3), (sx + 14, y0 + 3)], A3)
        for i in range(6): f.px(sx - 14 + i * 5, y0 - 3 + i * 1.2, R2 if (i + int(p['t'] * 6)) % 3 == 0 else R1)   # the words of the oath
    hx, hdy = sx + 3, sy - 6
    f.part([('rect', hx - 6, hdy - 6, 13, 11)], C['front'])
    for s in (-1, 1): f.part([('poly', [(hx + s * 5, hdy - 5), (hx + s * 11, hdy - 13), (hx + s * 7, hdy - 4)])], [BONE, BONE, BONE, BONE])
    eyes(f, hx + 1, hdy - 2, p); f.flat([('rect', hx, hdy + 2, 6, 2)], R0)
    lantern(f, sx - 14, hy - 4, 0.2)
    hd = front_arm(f, p, k, 14, 32, 5.5, C['front'])
    for i in range(5): f.px(hd[0] + i * 2, hd[1] + 3 + i * 2, A3)
    bw = (hd[0] + 10, min(G - 10, hd[1] + 10)) if not p['strike'] else (hd[0] + 12, G - 7)
    f.part([('ell', bw[0], bw[1], 6, 6)], [A0, A1, A3, BONE])   # the oath weight
    for s in (-1, 1): f.part([('ell', sx + s * 15, sy + 1, 6, 5)], C['front'])
    if p['strike'] > 0.6:
        for i in range(8): f.fx.append((bw[0] - 10 + i * 3, G - 3 - (i % 3) * 2, R1 if i % 2 else A3))
    return f.finish(p['flash']), (W, H, G)

# 5. the Warmthless Knight: a tall empty armour with cold wind in its visor and a great sword
def knight(p):
    W, H, G = 112, 104, 100; f = Frame(W, H, OUT)
    k = rig(f, p, C, 48, G, 34, 28, 10, 32, 4.5, 4.5); sx, sy, hy = k['sx'], k['sy'], k['hy']
    sway = math.sin(k['t']) * 2
    f.part([('poly', [(sx - 10, sy), (sx - 15 - sway, G - 8), (sx - 2, hy)])], [A1, A2, A3, A3])   # faded cape
    f.part([('poly', [(sx - 11, sy), (sx + 11, sy), (sx + 9, hy + 2), (sx - 9, hy + 2)])], C['mid'], band=0.55)
    f.line([(sx - 7, sy + 6), (sx + 7, sy + 6)], A3); f.line([(sx, sy + 2), (sx, hy - 2)], A0)
    hx, hdy = sx + 1, sy - 8
    f.part([('rect', hx - 6, hdy - 7, 13, 12), ('poly', [(hx - 6, hdy - 7), (hx, hdy - 13), (hx + 7, hdy - 7)])], C['front'])
    f.flat([('rect', hx - 1, hdy - 3, 8, 2)], A0)
    c = '#ffd0e0' if p.get('rage') else '#bfefff'
    f.px(hx + 2, hdy - 3, c); f.px(hx + 5, hdy - 3, c)   # cold light in the empty visor
    for i in range(4): f.fx.append((hx + 2 + i * 3, hdy - 1 + (p['t'] * 12 + i * 2) % 10, '#bfefff' if i % 2 else A3))   # frost falling out
    lantern(f, sx - 10, hy - 5, 0.0)
    hd = front_arm(f, p, k, 10, 32, 4.5, C['front'], extra_a=5)
    tip = (hd[0] + 4 + 22 * math.cos(0.3), hd[1] - 30) if not p['strike'] else (hd[0] + 26, hd[1] + 10)
    f.part([('cap', (hd[0], hd[1] + 4), tip, 2.2, 1.2)], [A2, A3, BONE, '#ffffff' if False else BONE])
    f.part([('rect', hd[0] - 4, hd[1] - 1, 8, 2)], [A0, A1, A2, A2])
    return f.finish(p['flash']), (W, H, G)

# 6. Wings That Fell Short: a winged demon, wings torn at the tips, flying low as if exhausted
def wings(p):
    W, H, G = 112, 96, 92; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
    flap = math.sin(t * (2 if p['walk'] else 1)) * 18 + 30 * p['raise_'] - 30 * p['strike']
    cx = 54 - 4 * p['recoil']; by = G - 34 + math.sin(t) * 2 + 6 * p['strike']
    for s, tones in ((-1, [A0, A0, A1, A2]), (1, [A0, A1, A2, A3])):
        a = math.radians(35 + flap) ; sh = (cx - 4 + s * 2, by - 14)
        tip = (sh[0] - math.cos(a) * 40 * (0.8 if s < 0 else 1), sh[1] - math.sin(a) * 34)
        mid = (sh[0] - 22, sh[1] + 8)
        f.part([('poly', [sh, tip, (tip[0] + 4, tip[1] + 10), (mid[0] - 4, mid[1] + 6), (mid[0] + 6, mid[1] + 12), (sh[0] + 2, sh[1] + 14)])], tones, band=0.8)
        f.line([sh, tip], A3 if s > 0 else A1)
        for i in range(3): f.px(tip[0] + 2 + i * 2, tip[1] + 6 + i * 3, OUT)   # torn holes
    f.part([('ell', cx, by, 9, 14)], C['mid'])
    for s in (-1, 1): f.part([('cap', (cx + s * 3, by + 12), (cx + s * 5 + 2, G - 4 - 6 * (1 - p['strike'])), 2.5, 1.5)], C['front'])   # dangling legs
    hx, hdy = cx + 3, by - 18
    f.part([('rect', hx - 5, hdy - 5, 11, 10)], C['front'])
    for s in (-1, 1): f.part([('poly', [(hx + s * 4, hdy - 4), (hx + s * 9 + 2, hdy - 14), (hx + s * 6, hdy - 3)])], [BONE, BONE, BONE, BONE])
    eyes(f, hx + 1, hdy - 1, p)
    lantern(f, cx - 6, by + 6, 0.1)
    if p['cast'] > 0.4:
        for i in range(8): a2 = i * 0.8; f.fx.append((hx + 14 + math.cos(a2) * 5, hdy + 4 + math.sin(a2) * 5, R2 if i % 2 else LAMP))
    for i in range(4): f.fx.append((cx - 30 + i * 18, by + 18 + (p['t'] * 20 + i * 5) % 20, A2))   # falling feathers
    return f.finish(p['flash']), (W, H, G)

# 7. Ash of Nine Towers: an ash colossus, nine small fires burning on its shoulders and back
def ash(p):
    W, H, G = 128, 120, 116; f = Frame(W, H, OUT)
    AC = dict(back=['#1a1414', '#1a1414', '#2e2626', '#463c3a'], mid=['#2e2626', '#463c3a', '#6a5e5a', '#8a7e78'], front=['#2e2626', '#463c3a', '#6a5e5a', '#8a7e78'])
    k = rig(f, p, AC, 58, G, 40, 34, 18, 40, 7, 7); sx, sy, hy = k['sx'], k['sy'], k['hy']
    f.part([('poly', [(sx - 22, sy), (sx + 20, sy - 2), (sx + 16, hy + 2), (sx - 16, hy + 2)])], AC['mid'], band=0.6)
    for i in range(5): f.line([(sx - 18 + i * 8, sy + 4 + (i % 2) * 6), (sx - 14 + i * 8, sy + 14 + (i % 2) * 4)], R1)
    hx, hdy = sx + 4, sy - 8
    f.part([('rect', hx - 7, hdy - 7, 15, 13)], AC['front']); eyes(f, hx + 1, hdy - 2, p, gap=4)
    f.flat([('rect', hx - 1, hdy + 3, 8, 2)], R0)
    for i in range(9):   # the nine fires
        x = sx - 20 + i * 5 + (i % 2) * 2; y = sy - 3 - (4 if i in (3, 4, 5) else 0) + (i % 3)
        h = 4 + (i + int(p['t'] * 8)) % 3
        f.flat([('poly', [(x - 2, y), (x, y - h), (x + 2, y)])], LAMP if i % 2 else R2); f.px(x, y - 1, LAMP2)
    hd = front_arm(f, p, k, 18, 40, 7, AC['front'])
    f.part([('ell', hd[0], hd[1], 8, 7)], AC['front'])
    lantern(f, sx - 18, hy - 6, 0.0)
    for i in range(5): f.fx.append((sx - 20 + i * 10, sy - 20 - (p['t'] * 14 + i * 4) % 14, '#8a7e78' if i % 2 else R1))   # ash rising
    return f.finish(p['flash']), (W, H, G)

# 8. HEART OF THE ECLIPSE: a giant floating shadow, a black sun ringed with violet fire in its chest, a corona of hair
def eclipse(p):
    W, H, G = 144, 136, 132; f = Frame(W, H, OUT); t = p['t'] * 2 * math.pi
    cx = 72 - 4 * p['recoil']; by = G - 66 + math.sin(t) * 3 - 6 * p['raise_'] + 4 * p['strike']
    SH = [OUT, A0, A1, A2]
    f.part([('poly', [(cx - 18, by - 22), (cx + 18, by - 22), (cx + 24, by + 30), (cx + 10, by + 60), (cx, by + 50), (cx - 10, by + 62), (cx - 26, by + 30)])], SH, band=0.6)   # a body fading into smoke
    for i in range(6): f.fx.append((cx - 20 + i * 8, by + 56 + (p['t'] * 10 + i * 4) % 10, A2 if i % 2 else V0))
    # arms of shadow
    for s in (-1, 1):
        a = math.radians(30 + 60 * p['cast'] + 90 * p['raise_'] - 40 * p['strike'])
        sh = (cx + s * 18, by - 18); hd = (sh[0] + s * math.sin(a) * 30, sh[1] + math.cos(a) * 26)
        f.part([('cap', sh, hd, 5, 3)], SH)
        for i in range(3): f.part([('cap', hd, (hd[0] + s * (4 + i * 2), hd[1] + (i - 1) * 5), 1.4, 0.6)], SH)
        if s < 0: lantern(f, hd[0], hd[1] + 2, 0.6)
    # the black sun in the chest
    rc = 13 + 2 * p['cast']
    f.flat([('ell', cx, by, rc + 3, rc + 3)], V1 if not p.get('rage') else '#ff3aff'); f.flat([('ell', cx, by, rc + 1, rc + 1)], V2)
    f.flat([('ell', cx, by, rc - 1, rc - 1)], OUT)
    for i in range(12): a = i / 12 * 2 * math.pi + t * 0.5; f.fx.append((cx + math.cos(a) * (rc + 5), by + math.sin(a) * (rc + 5), V2 if i % 2 else V1))
    # head and corona
    hx, hdy = cx + 2, by - 32
    for i in range(9): a = math.radians(-150 + i * 15); f.flat([('poly', [(hx + math.cos(a) * 6, hdy + math.sin(a) * 6), (hx + math.cos(a) * (16 + (i % 2) * 6), hdy + math.sin(a) * (16 + (i % 2) * 6)), (hx + math.cos(a + 0.15) * 6, hdy + math.sin(a + 0.15) * 6)])], V1 if i % 2 else V0)
    f.part([('ell', hx, hdy, 8, 9)], SH)
    c = '#ffd0e0' if p.get('rage') else '#ffffff'
    f.flat([('rect', hx, hdy - 1, 3, 2), ('rect', hx + 5, hdy - 1, 2, 2)], c)
    return f.finish(p['flash']), (W, H, G)

FORMS = [('quoc_fallen', fallen, 'Quoc · the Fallen Lanternbearer (form 1)'), ('quoc_shade', shade, 'Quoc · the Lonely Shade (form 2)'), ('quoc_hound', hound, 'Quoc · the Masterless Hound (form 3)'),
         ('quoc_chained', chained, 'Quoc · the Oath-Chained (form 4)'), ('quoc_knight', knight, 'Quoc · the Warmthless Knight (form 5)'), ('quoc_wings', wings, 'Quoc · Wings That Fell Short (form 6)'),
         ('quoc_ash', ash, 'Quoc · Ash of Nine Towers (form 7)'), ('quoc_eclipse', eclipse, 'QUOC · HEART OF THE ECLIPSE (form 8)')]

EXTRA = ['#bfefff', '#1a1414', '#2e2626', '#463c3a', '#6a5e5a', '#8a7e78']
def make(name, fn, note, pal=PAL + EXTRA, rage=RAGE, flyer=False):
    img0, (W, H, G) = fn(dict(t=0, walk=False, raise_=0, strike=0, cast=0, recoil=0, flash=False))
    st = std_states(lambda p: fn(p)[0], rage, G, ember=R2)
    ay = img0.getbbox()[3] - 1   # the anchor sits on the lowest row of the standing pose (feet with their outline)
    st, cell, anc = fit_states(st, (W, H), (W // 2, ay))
    build(name, st, cell, anc, pal, note, ground_check=not flyer)

if __name__ == '__main__':
    want = sys.argv[1:]
    for name, fn, note in FORMS:
        if not want or name in want: make(name, fn, note, flyer=name in ('quoc_wings', 'quoc_eclipse'))
