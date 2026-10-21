# Kaldrok, the Walking Forge (map 6 boss) - phase 3A sample.
# A hunched basalt giant with a furnace burning in its chest, lava running in the cracks of its plates, two
# anvil-like fists, curved horns and glowing eyes. Facing right, cell 96x96, feet on the anchor line (48, 93).
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, save_set, preview, check

OUT = '#140a0c'
B0, B1, B2, B3 = '#24161a', '#3a2628', '#56383a', '#7a5650'
L0, L1, L2, L3, L4 = '#8e2a12', '#e0521a', '#ff9a2a', '#ffd84a', '#fff4c8'
H0, H1 = '#8a7660', '#c8b498'
SMOKE, RED = '#4a3a46', '#ff3a2a'
PAL = [OUT, B0, B1, B2, B3, L0, L1, L2, L3, L4, H0, H1, SMOKE, RED]
W = H = 96; GROUND = 92; ANCHOR = (48, 93)

def pose(**k):
    p = dict(by=0, lean=0, crouch=0, bf=(-9, 0), ff=(9, 0), ba=(10, 25), fa=(-5, 20), head=0, mouth=0, core=0.6, crack=0.6, rage=False, broken=0, fists_up=0, seed=0)
    p.update(k); return p

def crack(f, pts, col, glow):
    f.line(pts, glow); f.line([(x, y - 1) for x, y in pts], col)   # a 2-pixel lava vein: bright core over a darker glow

def arm(f, sh, a1, a2, fist, tones, crack_col, crack_on, big):
    """shoulder -> elbow -> fist; degrees: 0 = hanging down, 90 = straight forward, 180 = straight up"""
    r1 = math.radians(a1); r2 = math.radians(a2); L = 13
    el = (sh[0] + math.sin(r1) * L, sh[1] + math.cos(r1) * L)
    fs = (el[0] + math.sin(r2) * L, el[1] + math.cos(r2) * L)
    f.part([('cap', sh, el, 7 if big else 6, 6 if big else 5), ('cap', el, fs, 6 if big else 5, 5.5 if big else 4.5)], tones)
    fw, fh = fist
    f.part([('rect', fs[0] - fw / 2, fs[1] - fh / 2, fw, fh), ('rect', fs[0] - fw / 2 - 2, fs[1] - fh / 2 + 3, fw + 4, fh - 6)], tones)   # the anvil fist
    f.line([(fs[0] - fw / 2 + 1, fs[1] - fh / 2 + 4), (fs[0] + fw / 2 - 2, fs[1] - fh / 2 + 4)], B0)                                   # knuckle seam
    if crack_on:
        crack(f, [(sh[0] + 1, sh[1] + 3), (el[0], el[1] + 1), (fs[0], fs[1] - fh / 2 + 1)], crack_col, L1)
        crack(f, [(fs[0] - fw / 2 + 2, fs[1] + fh / 2 - 3), (fs[0] + fw / 2 - 3, fs[1] + fh / 2 - 3)], crack_col, L1)
    return fs

def kaldrok(p, flash=False):
    f = Frame(W, H, OUT)
    lava = L4 if p['rage'] else L3
    crackc = L4 if p['rage'] else (L3 if p['crack'] > 0.75 else L2)
    by, cr, ln, br = p['by'], p['crouch'], p['lean'], p['broken']
    hx, hy = 48 + ln * 0.3, 64 + by + cr          # hips
    sx, sy = 46 + ln, 41 + by + cr * 0.7           # middle of the shoulders
    back_t, mid_t, front_t = [B0, B0, B1, B2], [B1, B2, B3, B3], [B1, B2, B3, H1]
    on = p['crack'] > 0.2
    # smoke and embers from the two back vents (particles: no outline)
    for i in range(6):
        t = (p['seed'] + i * 0.29) % 1.0   # seed = phase of the loop (0..1), so loops close cleanly
        f.fx.append((sx - 15 + math.sin(t * 6 + i) * 2 - t * 5, max(2, sy - 14 - t * 10), SMOKE if i % 3 else (L2 if p['core'] > 0.5 else L1)))
    bfx, bfl = p['bf']; ffx, ffl = p['ff']
    # ---- back leg, back arm
    if br < 0.85:
        kb = (hx - 12 + bfx * 0.5, hy + 13 - bfl * 0.5); ab = (hx - 12 + bfx, GROUND - 5 - bfl)
        f.part([('cap', (hx - 7, hy), kb, 7, 6), ('cap', kb, ab, 6, 5), ('rect', ab[0] - 7, GROUND - 5 - bfl, 14, 6)], back_t)
        arm(f, (sx - 21, sy + 3), p['ba'][0], p['ba'][1], (13, 12), back_t, L1, on, False)
    # ---- torso: broad hunched shoulders, narrow waist
    torso = [(sx - 25, sy + 3), (sx - 18, sy - 6), (sx - 4, sy - 10), (sx + 12, sy - 9), (sx + 24, sy - 2), (sx + 20, sy + 12), (hx + 10, hy + 2), (hx - 10, hy + 2), (sx - 21, sy + 13)]
    if br < 0.6:
        f.part([('rect', sx - 17, sy - 14, 5, 8), ('rect', sx - 10, sy - 16, 5, 9)], back_t)   # back vents
        f.part([('poly', torso)], mid_t, band=0.6)
        f.flat([('rect', sx - 16, sy - 14, 3, 1), ('rect', sx - 9, sy - 16, 3, 1)], L2 if p['core'] > 0.5 else L1)
        # plate seams
        f.line([(sx - 20, sy + 4), (sx - 8, sy + 2), (sx - 4, sy + 4)], B0); f.line([(sx + 14, sy + 4), (sx + 19, sy + 6)], B0)
        f.line([(hx - 9, hy - 6), (hx + 9, hy - 6)], B0); f.line([(sx - 3, sy - 9), (sx - 2, sy - 3)], B0)
    # ---- front leg
    if br < 0.85:
        kf = (hx + 12 + ffx * 0.5, hy + 13 - ffl * 0.5); af = (hx + 12 + ffx, GROUND - 5 - ffl)
        f.part([('cap', (hx + 7, hy), kf, 7, 6), ('cap', kf, af, 6, 5), ('rect', af[0] - 6, GROUND - 5 - ffl, 15, 6)], front_t)
        if on: crack(f, [(hx + 6, hy + 3), (kf[0] - 1, kf[1]), (af[0], af[1] - 2)], crackc, L1)
        f.line([(af[0] - 5, GROUND - 2 - ffl), (af[0] + 7, GROUND - 2 - ffl)], B1)
    # ---- chest furnace
    if br < 0.6:
        gx, gy = sx - 3, sy + 2; g = p['core']
        f.part([('rect', gx, gy, 15, 13)], [B0, B0, B1, B1])
        fire = L4 if g > 0.85 or p['rage'] else (L3 if g > 0.6 else (L2 if g > 0.35 else L1))
        f.flat([('rect', gx + 1, gy + 1, 13, 11)], L1 if g > 0.2 else L0)
        f.flat([('rect', gx + 2, gy + 3, 11, 8)], L2 if g > 0.3 else L1)
        f.flat([('rect', gx + 4, gy + 5, 7, 5)], fire)
        for i in range(4): f.flat([('rect', gx + 1 + i * 4, gy, 1, 13)], B2)
        if on:
            crack(f, [(sx - 22, sy + 6), (sx - 15, sy + 8), (sx - 12, sy + 14), (hx - 6, hy - 2)], crackc, L1)
            crack(f, [(sx + 6, sy - 7), (sx + 11, sy - 3), (sx + 18, sy - 2)], crackc, L1)
    # ---- head: low and jutting, a heavy underbite with fangs, horns sweeping back
    if br < 0.45:
        hdx, hdy = sx + 8, sy - 5 + p['head']
        f.part([('poly', [(hdx - 7, hdy - 6), (hdx - 9, hdy - 12), (hdx - 17, hdy - 18), (hdx - 11, hdy - 8)])], [H0, H0, H1, H1])                 # back horn
        mo = round(p['mouth'] * 4)
        f.part([('poly', [(hdx - 3, hdy + 1), (hdx + 11, hdy - 1 + mo), (hdx + 12, hdy + 5 + mo), (hdx - 3, hdy + 6)])], front_t)                   # jaw
        f.part([('rect', hdx - 8, hdy - 9, 17, 11), ('rect', hdx + 6, hdy - 7, 5, 7)], front_t)                                                       # skull
        f.part([('poly', [(hdx - 1, hdy - 8), (hdx - 2, hdy - 15), (hdx - 8, hdy - 22), (hdx + 3, hdy - 16), (hdx + 5, hdy - 8)])], [H0, H0, H1, H1])  # front horn
        f.flat([('rect', hdx - 4, hdy - 5, 13, 2)], B0)                                                                                             # heavy brow
        eye = RED if p['rage'] else L3
        f.flat([('rect', hdx + 1, hdy - 3, 7, 2)], eye); f.flat([('rect', hdx + 4, hdy - 3, 2, 1)], L4); f.px(hdx + 8, hdy - 4, eye)
        if mo > 0:
            f.flat([('rect', hdx + 1, hdy + 1, 9, mo + 1)], L1); f.flat([('rect', hdx + 2, hdy + 1, 7, mo)], lava)
        else: f.line([(hdx, hdy + 2), (hdx + 10, hdy + 1)], B0, False)
        for i in range(3): f.px(hdx + 2 + i * 3, hdy + 1 + mo, H1); f.px(hdx + 2 + i * 3, hdy + mo, H1)   # fangs of the lower jaw
    # ---- front arm and the two shoulder plates
    if br < 0.85:
        arm(f, (sx + 21, sy + 1), p['fa'][0], p['fa'][1], (16, 13), front_t, crackc, on, True)
        f.part([('ell', sx + 20, sy - 1, 9, 6)], front_t)
        if br < 0.6: f.part([('ell', sx - 20, sy + 1, 8, 6)], mid_t)
    # ---- death: the body breaks into glowing rocks and a pool of cooling lava
    if br > 0:
        for i in range(8):
            ang = i * 0.85; d = br * (8 + i * 2)
            x = 48 + math.cos(ang) * d * 1.3; y = min(GROUND - 3, 50 + math.sin(ang) * 6 + br * br * 40 + i)
            s = 5 + (i % 3) * 2
            f.part([('rect', x - s / 2, y - s / 2, s, s)], mid_t if i % 2 else front_t)
            if br < 0.9: f.px(x, y, L2 if br < 0.6 else L0)
        f.flat([('rect', 28, GROUND - 1, 40, 2)], L1 if br < 0.8 else L0)
    return f.finish(flash)

# ---------------- animations ----------------
def idle(rage=False):
    fr = []
    for i in range(6):
        a = i / 6 * 2 * math.pi
        fr.append(kaldrok(pose(by=round(math.sin(a) * 1), core=0.55 + 0.25 * math.sin(a), crack=0.6 + 0.3 * math.sin(a + 1), ba=(8 + 2 * math.sin(a), 22), fa=(-4 + 2 * math.sin(a), 18), seed=i / 6, rage=rage,
                               head=round(math.sin(a)))))
    return fr
def walk():
    fr = []
    for i in range(8):
        a = i / 8 * 2 * math.pi; s = math.sin(a)
        # feet: one planted and pushed back while the other lifts and swings forward (no sliding)
        bf = (-10 * s, max(0, 4 * math.cos(a))); ff = (10 * s, max(0, -4 * math.cos(a)))
        fr.append(kaldrok(pose(by=round(abs(math.cos(a)) * 2) - 1, bf=bf, ff=ff, ba=(14 * s + 8, 24 + 10 * s), fa=(-14 * s - 4, 16 - 10 * s), core=0.6, crack=0.65, seed=i / 8, lean=1)))
    return fr
def raise_(k):   # the elbow bends first, so the fists rise close to the body instead of swinging out
    return (10 + 160 * k, 20 + 160 * min(1, 2.5 * k)), (-5 + 172 * k, 10 + 170 * min(1, 2.5 * k))
def tele():   # wind-up for the slam: both fists rise over the head, the furnace flares
    return [kaldrok(pose(lean=-5 - i, crouch=-i, ba=raise_(k)[0], fa=raise_(k)[1], core=0.6 + 0.4 * k, crack=0.6 + 0.4 * k, head=-i, seed=i))
            for i, k in enumerate([0.25, 0.5, 0.75, 1.0])]
def slam():   # anticipation -> hit -> recovery
    K = [(1.0, 0, 0), (0.55, 2, 0), (0.0, 7, 1), (0.0, 8, 1), (0.15, 5, 0), (0.35, 2, 0)]
    out = []
    for i, (k, cr, hit) in enumerate(K):
        down = k == 0
        f = kaldrok(pose(lean=3 if down else -5, crouch=cr, ba=(28, 8) if down else raise_(k)[0], fa=(38, 12) if down else raise_(k)[1],
                         core=1.0 if hit else 0.8, crack=1.0, head=cr // 2, mouth=0.6 if hit else 0, seed=i))
        if hit:   # sparks and dust where the fists land (inside the cell, as part of the frame)
            from PIL import ImageDraw
            px = f.load()
            for j in range(10):
                x = 68 + (j * 7) % 18; y = 86 - (j * 5) % 12
                if px[x, y][3] == 0: px[x, y] = (255, 216, 74, 255) if j % 2 else (224, 82, 26, 255)
        out.append(f)
    return out
def cast():   # the furnace roar: head up, chest blazing, a breath of sparks
    K = [0.2, 0.5, 0.9, 1.0, 1.0, 0.5]
    return [kaldrok(pose(head=-2 if k > 0.5 else 0, mouth=k, core=0.6 + 0.4 * k, crack=0.6 + 0.4 * k, lean=-2 * k, ba=(20 * k + 8, 40 * k + 20), fa=(-30 * k - 5, -10 * k + 18), seed=i)) for i, k in enumerate(K)]
def hurt():
    return [kaldrok(pose(lean=-4, head=1, mouth=0.3, core=0.8, seed=0)), kaldrok(pose(lean=-5, head=1, mouth=0.4, core=0.8, seed=1), flash=True), kaldrok(pose(lean=-2, head=0, core=0.7, seed=2))]
def death():
    out = []
    for i in range(10):
        k = i / 9
        if i < 4: out.append(kaldrok(pose(lean=-3 - i, crouch=i * 2, head=i, mouth=0.8, core=1.0, crack=1.0, rage=(i % 2 == 1), ba=(30, 50), fa=(30 - i * 10, 40), seed=i)))
        else: out.append(kaldrok(pose(broken=(i - 3) / 6, crack=1.0, core=1.0 - k, seed=i)))
    return out
def rage(): return idle(rage=True)

STATES = {'idle': (idle(), 8, True), 'walk': (walk(), 10, True), 'tele': (tele(), 8, False), 'slam': (slam(), 12, False), 'cast': (cast(), 10, False),
          'hurt': (hurt(), 12, False), 'death': (death(), 10, False), 'rage': (rage(), 10, True)}

if __name__ == '__main__':
    root = os.path.join(os.path.dirname(__file__), '..', '..')
    folder = os.path.join(root, 'assets', 'sprites', 'kaldrok')
    save_set('kaldrok', folder, (W, H), ANCHOR, STATES, PAL, 'Kaldrok, the Walking Forge (map 6). Rage = the same idle with white-hot lava and red eyes.')
    preview('kaldrok', folder, STATES, (W, H), 3, os.path.join(root, 'docs', 'sprites_3A'))
    for i in check('kaldrok', STATES, (W, H), ANCHOR, PAL): print('CHECK', i)
    print('ok')
