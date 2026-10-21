# Summons and pet great forms (phase 3B, last group). Side view facing right, 16-bit pixel art drawn at the game's
# own scale (1 sheet pixel = 1 game pixel). Every summon gets two sheets: <kind> (the summoned form) and <kind>_evo
# (the final form, about 1.35x bigger and more ornate). Walkers stand on the anchor; flyers are anchored on the body.
# States: idle 6, walk 8, tele 4 (wind-up), attack 6, hurt 3 (white flash), death 10 (dissolves into light),
# spawn 8 (builds up from the ground). The _evo sheet also has evolve 8 (the small form flickers into the big one).
import math, sys, os, random, json
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, build, hexc
from PIL import Image

# ---------------- shared states ----------------
def dissolve(img, k, glow, seed=3):
    """death of a summon: pixels go out from the top down and drift up as motes of light (k: 0..1)"""
    w, h = img.size; bb = img.getbbox(); out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if not bb: return out
    rnd = random.Random(seed); src = img.load(); o = out.load(); G = hexc(glow[0]); B = hexc(glow[1])
    top, bot = bb[1], bb[3]
    for y in range(top, bot):
        edge = top + (bot - top) * (k * 1.25 - 0.1)          # the line where the body has gone
        for x in range(bb[0], bb[2]):
            c = src[x, y]
            if not c[3]: continue
            d = y - edge + rnd.uniform(-3, 3)
            if d > 2: o[x, y] = c
            elif d > -1: o[x, y] = G if rnd.random() < 0.6 else B
    for i in range(int(26 * (1 - abs(k - 0.5)))):   # motes
        x = rnd.randint(bb[0], bb[2] - 1); y = round(top + (bot - top) * rnd.random() - k * 18 - rnd.random() * 8)
        if 1 <= x < w - 1 and 1 <= y < h - 1 and not o[x, y][3]: o[x, y] = G if i % 3 else B
    return out

def materialise(img, k, glow, seed=4):
    """spawn: the figure builds up from the ground, a bright seam at the growing edge (k: 0..1)"""
    w, h = img.size; bb = img.getbbox(); out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if not bb: return out
    rnd = random.Random(seed); src = img.load(); o = out.load(); G = hexc(glow[0]); B = hexc(glow[1])
    top, bot = bb[1], bb[3]; edge = bot - (bot - top + 4) * k
    for y in range(top, bot):
        for x in range(bb[0], bb[2]):
            c = src[x, y]
            if not c[3]: continue
            if y > edge + 2: o[x, y] = c
            elif y > edge - 1: o[x, y] = B if y > edge else G
    for i in range(14):   # sparks rising past the seam
        x = rnd.randint(bb[0], bb[2] - 1); y = round(edge - 2 - rnd.random() * 10)
        if 1 <= x < w - 1 and 1 <= y < h - 1 and not o[x, y][3]: o[x, y] = G if i % 2 else B
    return out

def white(img):
    out = img.copy(); p = out.load()
    for y in range(out.size[1]):
        for x in range(out.size[0]):
            if p[x, y][3]: p[x, y] = (255, 255, 255, 255)
    return out

def sum_states(draw, glow, flyer=False):
    D = lambda **k: draw(dict(dict(t=0, walk=False, raise_=0, strike=0, recoil=0, flash=False), **k))
    idle = [D(t=i / 6) for i in range(6)]
    walk = [D(t=i / 8, walk=True) for i in range(8)]
    tele = [D(t=i / 4, raise_=(i + 1) / 4) for i in range(4)]
    attack = [D(t=0.1, raise_=1), D(t=0.2, raise_=0.6), D(t=0.3, strike=1), D(t=0.4, strike=1), D(t=0.5, strike=0.6), D(t=0.6, strike=0.25)]
    hurt = [D(recoil=0.6), D(recoil=1, flash=True), D(recoil=0.4)]
    last = D(recoil=1, t=0.5)
    death = [D(recoil=0.7), D(recoil=1, flash=True), last] + [dissolve(last, (i + 1) / 7, glow, seed=i) for i in range(7)]
    base = D(t=0)
    spawn = [materialise(base, (i + 1) / 6, glow, seed=i) for i in range(6)] + [white(base), base]
    return {'idle': (idle, 8, True), 'walk': (walk, 10, True), 'tele': (tele, 8, False), 'attack': (attack, 12, False),
            'hurt': (hurt, 12, False), 'death': (death, 10, False), 'spawn': (spawn, 12, False)}

def evolve_frames(small, big):
    """the small form flickers white into the great form (both already drawn in the same cell)"""
    return [small, white(small), white(big), white(small), white(big), white(big), big, big]

def crop(states, anchor, margin=2):
    """crops every frame to the union of all frames (+margin); the anchor moves with it"""
    L = T = 10 ** 6; R = B = 0
    for frames, fps, loop in states.values():
        for f in frames:
            bb = f.getbbox()
            if bb: L, T, R, B = min(L, bb[0]), min(T, bb[1]), max(R, bb[2]), max(B, bb[3])
    L, T = L - margin, T - margin; R, B = R + margin, B + margin
    out = {st: ([f.crop((L, T, R, B)) for f in fr], fps, loop) for st, (fr, fps, loop) in states.items()}
    return out, (R - L, B - T), (anchor[0] - L, anchor[1] - T)

def body_box(frames, anchor):
    """width/height of the solid body over the idle loop (same rule as hitbox.py), for the game's HUD and hitbox"""
    w, h = frames[0].size; cnt = [[0] * w for _ in range(h)]
    for f in frames:
        p = f.load()
        for y in range(h):
            for x in range(w):
                if p[x, y][3]: cnt[y][x] += 1
    n = len(frames); on = lambda x, y: cnt[y][x] * 2 >= n
    cols = [x for x in range(w) if sum(on(x, y) for y in range(h)) >= h * 0.08]
    rows = [y for y in range(h) if sum(on(x, y) for x in range(w)) >= 3]
    if not cols or not rows: return [w, h]
    return [cols[-1] - cols[0] + 1, rows[-1] - rows[0] + 1]

def save(name, states, anchor, palette, notes, flyer=False):
    states, cell, anchor = crop(states, anchor)
    build(name, states, cell, anchor, palette, notes, ground_check=not flyer, skip=('tele', 'attack', 'hurt', 'death', 'spawn', 'evolve'))
    root = os.path.join(os.path.dirname(__file__), '..', '..'); fn = os.path.join(root, 'assets', 'sprites', name, name + '.json')
    meta = json.load(open(fn, encoding='utf-8')); meta['body'] = body_box(states['idle'][0], anchor); meta['flyer'] = flyer
    json.dump(meta, open(fn, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

# ---------------- the humanoid ----------------
# angles: 0 = hanging straight down, 90 = pointing forward, 180 = straight up (sin -> x forward, cos -> y down)
def at(o, a, L): r = math.radians(a); return (o[0] + math.sin(r) * L, o[1] + math.cos(r) * L)

BUILD = {   # hip height, torso, head radius, shoulder half-width, arm length, leg width, arm width (fractions of height)
 'giant':  dict(hip=0.36, torso=0.34, head=0.085, shw=0.17, arm=0.50, leg=0.075, armw=0.07, waist=0.13),
 'knight': dict(hip=0.43, torso=0.29, head=0.085, shw=0.13, arm=0.42, leg=0.055, armw=0.05, waist=0.09),
 'robe':   dict(hip=0.43, torso=0.29, head=0.085, shw=0.10, arm=0.41, leg=0.045, armw=0.038, waist=0.07),
 'lady':   dict(hip=0.45, torso=0.27, head=0.085, shw=0.085, arm=0.40, leg=0.04, armw=0.034, waist=0.06),
 'tree':   dict(hip=0.34, torso=0.36, head=0.11, shw=0.15, arm=0.52, leg=0.08, armw=0.06, waist=0.12),
 'rock':   dict(hip=0.30, torso=0.40, head=0.10, shw=0.20, arm=0.50, leg=0.09, armw=0.085, waist=0.16),
}

def human(S, z=1.0, evo=False, cell=None):
    Hb = S['H'] * z; B = BUILD[S['build']]; M, C, K, T, G = S['M'], S['C'], S['K'], S['T'], S['G']
    W0, H0 = cell or (round(Hb * 2.4) + 40, round(Hb * 1.7) + 30); GR = H0 - 6; CX = W0 // 2 - round(Hb * 0.1)
    U = lambda v: v * Hb   # a fraction of the body height in pixels
    skin = [K[0], K[0], K[1], K[1]]; trim = [T[0], T[0], T[1], T[1]]; glowt = [G[0], G[0], G[1], G[1]]
    back = [M[0], M[0], M[1], M[2]]; cloth = C; cback = [C[0], C[0], C[1], C[1]]
    weapon = S.get('weapon', 'none'); head = S.get('head', 'none')

    def draw(p):
        f = Frame(W0, H0, S['OUT'])
        t = p['t'] * 2 * math.pi; walk = p['walk']; rec = p['recoil']; rz, st = p['raise_'], p['strike']
        bob = abs(math.sin(t)) * U(0.02) if walk else math.sin(t) * U(0.008)
        cx = CX - U(0.06) * rec + U(0.05) * st
        hip = (cx, GR - U(B['hip']) + U(0.02) * st - bob)
        lean = U(0.05) * st - U(0.03) * rz - U(0.05) * rec
        sh = (cx + lean, hip[1] - U(B['torso']))
        hw = U(B['waist']) * 0.5
        # wings (behind everything)
        if S.get('wings'):
            flap = math.sin(t) * 8 + (25 if rz else 0) - (15 if st else 0) + (-10 if rec else 0)
            for far in (True, False):
                wing(f, (sh[0] - U(0.04) + (U(0.03) if far else 0), sh[1] + U(0.04)), 60 + flap + (12 if far else 0), U(0.62 if evo else 0.5),
                     S['wings'] if not far else [S['wings'][0]] * 2 + S['wings'][1:3], glow=G if evo else None)
        # cape / long hair behind
        sway = math.sin(t) * U(0.02) + (U(0.05) if walk else 0) + U(0.06) * rec
        if S.get('cape'):
            f.part([('poly', [(sh[0] - U(0.06), sh[1]), (sh[0] + U(0.02), sh[1]), (hip[0] - U(0.02), GR - U(0.06)), (hip[0] - U(0.2) - sway, GR - U(0.04)), (hip[0] - U(0.24) - sway, GR - U(0.12))])],
                   [S['cape'][0], S['cape'][0], S['cape'][1], S['cape'][2]], band=0.55)
        # back arm
        ab = -8 - (math.sin(t) * 22 if walk else 0) + 40 * rz - 20 * st - 30 * rec
        if weapon == 'bow': ab = 85
        if weapon in ('none',) and (rz or st): ab = 160 * rz + 70 * st
        bsh = (sh[0] - U(B['shw']) * 0.55, sh[1] + U(0.03)); bel = at(bsh, ab, U(B['arm']) * 0.5); bhd = at(bel, ab + 15, U(B['arm']) * 0.5)
        f.part([('cap', bsh, bel, U(B['armw']), U(B['armw']) * 0.9), ('cap', bel, bhd, U(B['armw']) * 0.9, U(B['armw']) * 0.8)], back)
        f.part([('ell', bhd[0], bhd[1], U(B['armw']) * 1.05, U(B['armw']) * 1.05)], skin if S.get('bare') else back)
        # legs
        feet = []
        for side, tones in ((-1, back), (1, M)):
            ph = t + (0 if side < 0 else math.pi)
            sw = math.sin(ph) * U(0.12) if walk else side * U(0.05) + U(0.04) * st * side
            lift = max(0, math.cos(ph)) * U(0.05) if walk else 0
            hp = (hip[0] + side * hw * 0.6, hip[1]); ft = (hip[0] + side * hw * 0.5 + sw, GR - lift)
            kn = ((hp[0] + ft[0]) / 2 + U(0.03), (hp[1] + ft[1]) / 2 - lift * 0.5)
            lw = U(B['leg'])
            f.part([('cap', hp, kn, lw, lw * 0.9), ('cap', kn, (ft[0], ft[1] - lw * 0.8), lw * 0.9, lw * 0.8)], tones)
            f.part([('rect', ft[0] - lw, ft[1] - lw * 1.1, lw * 2.6, lw * 1.1 + 1)], tones)   # boot / foot
            feet.append(ft)
        # robe / skirt over the legs
        if S['build'] in ('robe', 'lady') or S.get('skirt'):
            hem = GR - (U(0.03) if S['build'] in ('robe', 'lady') else U(0.2)); fl = U(0.17 if S['build'] == 'robe' else 0.13) + (U(0.03) if walk else 0)
            pts = [(sh[0] - hw * 1.2, hip[1] - U(0.06)), (sh[0] + hw * 1.2, hip[1] - U(0.06)), (hip[0] + fl, hem), (hip[0] + fl * 0.3, hem - U(0.015)), (hip[0] - fl * 0.4, hem), (hip[0] - fl - sway, hem - U(0.01))]
            f.part([('poly', pts)], cloth, band=0.6)
            f.line([(hip[0] - fl * 0.9 - sway, hem - 1), (hip[0] + fl, hem - 1)], T[1])
        # torso
        if S['build'] == 'tree':
            f.part([('poly', [(sh[0] - U(0.13), sh[1] - U(0.02)), (sh[0] + U(0.12), sh[1]), (hip[0] + hw * 1.3, hip[1] + U(0.02)), (hip[0] - hw * 1.4, hip[1] + U(0.03))])], M, band=0.6)
        else:
            f.part([('poly', [(sh[0] - U(B['shw']) * 0.95, sh[1]), (sh[0] + U(B['shw']) * 0.9, sh[1] - U(0.01)), (hip[0] + hw * 1.15, hip[1] + U(0.01)), (hip[0] - hw * 1.2, hip[1] + U(0.02))])], M if S.get('armoured', True) else cloth, band=0.62)
        if S.get('belt', True) and S['build'] not in ('tree', 'rock'):
            f.part([('rect', hip[0] - hw * 1.25, hip[1] - U(0.035), hw * 2.5, max(2, U(0.03)))], trim)
        deco_torso(f, S, sh, hip, U, t, evo, p)
        # head
        hr = U(B['head']); hc = (sh[0] + U(0.03), sh[1] - hr * 0.95 - U(0.015))
        if S['build'] in ('rock', 'giant'): hc = (sh[0] + U(0.1), sh[1] - hr * 0.55)   # hunched: the head sits low and forward
        if S['build'] == 'rock':
            for i in range(4): f.line([(sh[0] - U(0.12) + i * U(0.07), sh[1] + U(0.03) + (i % 2) * U(0.05)), (sh[0] - U(0.09) + i * U(0.07), sh[1] + U(0.1) + (i % 2) * U(0.05))], M[0])
        # shoulder plate
        if S.get('pauldron', True):
            pr = U(B['armw']) * (2.0 if S['build'] in ('rock', 'giant') else 1.6)
            f.part([('ell', sh[0] + U(B['shw']) * 0.55, sh[1] + U(0.02), pr, pr * 0.8)], M if S['build'] != 'tree' else M)
            if evo:
                for i in range(3): f.part([('poly', [(sh[0] + U(B['shw']) * 0.55 - pr + i * pr * 0.8, sh[1] - pr * 0.4), (sh[0] + U(B['shw']) * 0.55 - pr * 0.8 + i * pr * 0.8, sh[1] - pr * 1.6 + (i % 2) * pr * 0.4), (sh[0] + U(B['shw']) * 0.55 - pr * 0.4 + i * pr * 0.8, sh[1] - pr * 0.4)])], trim)
        def draw_head():
            deco_head_back(f, S, hc, hr, U, t, evo, p)
            if S['build'] in ('tree', 'rock'): f.part([('ell', hc[0], hc[1], hr * 1.1, hr)], M)
            else: f.part([('ell', hc[0], hc[1], hr * 0.95, hr)], skin)
            deco_head(f, S, hc, hr, U, t, evo, p)
        if not (S['build'] in ('rock', 'giant')): draw_head()
        # front arm and weapon
        fsh = (sh[0] + U(B['shw']) * 0.55, sh[1] + U(0.03))
        a, wa = arm_pose(weapon, t, walk, rz, st, rec)
        fel = at(fsh, a, U(B['arm']) * 0.5); fhd = at(fel, a + (25 if weapon in ('spear', 'trident', 'bow', 'shield') else 10), U(B['arm']) * 0.5)
        if weapon != 'shield': draw_weapon(f, S, weapon, fhd, wa, U, evo, p, behind=True)
        f.part([('cap', fsh, fel, U(B['armw']), U(B['armw']) * 0.9), ('cap', fel, fhd, U(B['armw']) * 0.9, U(B['armw']) * 0.8)], M if S.get('armoured', True) or S['build'] in ('tree', 'rock') else cloth)
        fk = 1.3 if S['build'] in ('rock', 'giant', 'tree') else 1.1
        f.part([('ell', fhd[0], fhd[1], U(B['armw']) * fk, U(B['armw']) * fk)], skin if S.get('bare') else (M if S['build'] in ('tree', 'rock') else trim))
        draw_weapon(f, S, weapon, fhd, wa, U, evo, p, behind=False)
        if S['build'] in ('rock', 'giant'): draw_head()   # hunched giants: the head sits in front of the shoulder
        # aura motes on the final form
        if evo:
            for i in range(8):
                ph = (p['t'] + i / 8) % 1
                f.fx.append((cx - U(0.3) + (i * 37 % 60) / 60 * U(0.6), GR - U(0.1) - ph * U(0.9), G[1] if i % 2 else G[0]))
        return f.finish(p['flash'])
    return draw, (CX, GR + 1), (W0, H0)

def arm_pose(weapon, t, walk, rz, st, rec):
    """front arm angle and weapon angle for each weapon kind"""
    sw = (math.sin(t) * 20 if walk else math.sin(t) * 3)
    if weapon in ('hammer', 'sword', 'katana', 'none', 'axe'):
        a = 25 + sw + 150 * rz; wa = (70 if weapon == 'katana' else 172) * (1 - rz) + 200 * rz
        if st: a = 75 + 15 * (1 - st); wa = 100 + 20 * (1 - st)
        if weapon == 'none': wa = a
    elif weapon in ('spear', 'trident'):
        a = 30 + sw * 0.5 + 10 * rz; wa = 175 - 50 * rz
        if st: a = 85; wa = 92
    elif weapon == 'staff':
        a = 35 + sw * 0.5 + 100 * rz; wa = 180
        if st: a = 95; wa = 120
    elif weapon == 'bow':
        a = 88; wa = 180
    elif weapon == 'shield':
        a = 45 + sw * 0.4 + 30 * rz; wa = 0
        if st: a = 95; wa = 0
    else: a, wa = 30 + sw, 180
    return a - 25 * rec, wa - 20 * rec

def draw_weapon(f, S, kind, hd, wa, U, evo, p, behind):
    M, T, G, Wp = S['M'], S['T'], S['G'], S.get('WP', S['M'])
    met = [Wp[0], Wp[1], Wp[2], Wp[3]]; trim = [T[0], T[0], T[1], T[1]]; gl = [G[0], G[0], G[1], G[1]]
    k = 1.15 if evo else 1.0
    if kind == 'hammer' and behind:
        tip = at(hd, wa, U(0.52) * k); f.part([('cap', at(hd, wa + 180, U(0.08)), tip, max(1, U(0.016)), max(1, U(0.016)))], trim)
        hx, hy = at(hd, wa, U(0.50) * k); r = U(0.08) * k
        n = (math.cos(math.radians(wa)), -math.sin(math.radians(wa)))
        f.part([('cap', (hx - n[0] * r * 1.2, hy - n[1] * r * 1.2), (hx + n[0] * r * 1.2, hy + n[1] * r * 1.2), r * 0.85, r * 0.85)], met)
        if evo or p['strike']: f.line([(hx - n[0] * r * 0.9, hy - n[1] * r * 0.9), (hx + n[0] * r * 0.9, hy + n[1] * r * 0.9)], G[1])
        if p['strike'] > 0.6:
            for i in range(10): f.fx.append((hx - U(0.15) + i * U(0.03), hy + r + 2 - (i % 3) * 2, G[0] if i % 2 else G[1]))
    elif kind in ('sword', 'katana') and behind:
        L = U(0.42 if kind == 'sword' else 0.46) * k; tip = at(hd, wa, L); base = at(hd, wa, U(0.05))
        f.part([('cap', at(hd, wa + 180, U(0.05)), base, max(1, U(0.014)), max(1, U(0.014)))], trim)
        n = (math.cos(math.radians(wa)), -math.sin(math.radians(wa))); gw = U(0.05)
        f.part([('cap', (base[0] - n[0] * gw, base[1] - n[1] * gw), (base[0] + n[0] * gw, base[1] + n[1] * gw), 1, 1)], trim)
        bw = max(1.2, U(0.022 if kind == 'sword' else 0.016))
        f.part([('poly', [(base[0] - n[0] * bw, base[1] - n[1] * bw), (base[0] + n[0] * bw, base[1] + n[1] * bw), (tip[0] + n[0] * 0.5, tip[1] + n[1] * 0.5)])], met)
        f.line([base, tip], G[1] if (evo or p['strike']) else Wp[3])
        if p['strike'] > 0.6:   # swing arc
            for i in range(9): aa = wa + 60 - i * 15; q = at(hd, aa, L * 0.95); f.fx.append((q[0], q[1], G[1] if i % 2 else G[0]))
    elif kind in ('spear', 'trident', 'staff') and behind:
        L = U(0.75) * k; back = at(hd, wa + 180, U(0.3)); tip = at(hd, wa, L - U(0.3))
        f.part([('cap', back, tip, max(1, U(0.013)), max(1, U(0.013)))], trim if kind != 'staff' else met)
        n = (math.cos(math.radians(wa)), -math.sin(math.radians(wa))); d = (math.sin(math.radians(wa)), math.cos(math.radians(wa)))
        if kind == 'spear':
            hl = U(0.1) * k; hw = U(0.03)
            f.part([('poly', [(tip[0] - n[0] * hw, tip[1] - n[1] * hw), (tip[0] + d[0] * hl, tip[1] + d[1] * hl), (tip[0] + n[0] * hw, tip[1] + n[1] * hw), (tip[0] - d[0] * 2, tip[1] - d[1] * 2)])], met)
            f.line([tip, (tip[0] + d[0] * hl * 0.8, tip[1] + d[1] * hl * 0.8)], G[1])
        elif kind == 'trident':
            hl = U(0.09) * k; hw = U(0.045)
            f.part([('cap', (tip[0] - n[0] * hw, tip[1] - n[1] * hw), (tip[0] + n[0] * hw, tip[1] + n[1] * hw), 1, 1)], met)
            for j in (-1, 0, 1):
                b0 = (tip[0] + n[0] * hw * j, tip[1] + n[1] * hw * j); e = (b0[0] + d[0] * hl * (1.2 if j == 0 else 0.9), b0[1] + d[1] * hl * (1.2 if j == 0 else 0.9))
                f.part([('cap', b0, e, 1, 0.6)], met)
        else:   # staff: an orb held in a claw of metal
            r = U(0.05) * k; o = (tip[0] + d[0] * r, tip[1] + d[1] * r)
            f.part([('ell', o[0], o[1], r * 1.25, r * 1.25)], trim)
            f.flat([('ell', o[0], o[1], r * 0.8, r * 0.8)], G[0]); f.flat([('ell', o[0] - r * 0.25, o[1] - r * 0.25, r * 0.35, r * 0.35)], G[1])
            if p['raise_'] or p['strike'] or evo:
                for i in range(8): aa = i * 0.8 + p['t'] * 6; f.fx.append((o[0] + math.cos(aa) * r * 2.4, o[1] + math.sin(aa) * r * 2.4, G[1] if i % 2 else G[0]))
            if S.get('bolt') and p['strike'] > 0.6:
                x, y = o
                for i in range(7): x2, y2 = x + U(0.07), y + (U(0.04) if i % 2 else -U(0.04)); f.fx += [(x + (x2 - x) * j / 4, y + (y2 - y) * j / 4, G[1]) for j in range(4)]; x, y = x2, y2
        if p['strike'] > 0.6 and kind != 'staff':
            for i in range(6): f.fx.append((tip[0] + d[0] * (U(0.12) + i * 2), tip[1] + d[1] * (U(0.12) + i * 2) + (i % 2), G[1] if i % 2 else G[0]))
    elif kind == 'bow' and not behind:
        r = U(0.22) * k; cx, cy = hd
        pts = [(cx + math.cos(math.radians(a)) * r * 0.35, cy + math.sin(math.radians(a)) * r) for a in range(-90, 91, 30)]
        f.part([('cap', pts[i], pts[i + 1], 1.2, 1.2) for i in range(len(pts) - 1)], trim)
        draw = U(0.12) * p['raise_'] if not p['strike'] else 0
        top, bot = pts[0], pts[-1]; nock = (cx - draw - 1, cy)
        f.line([top, nock, bot], G[1], only_on_body=False)
        if p['raise_'] and not p['strike']:
            f.line([nock, (cx + U(0.1), cy)], T[1], only_on_body=False); f.px(cx + U(0.1) + 1, cy, G[1])
        if p['strike'] > 0.6:
            for i in range(12): f.fx.append((cx + U(0.1) + i * 3, cy + (i % 2) * 0.5, G[1] if i % 3 else G[0]))
    elif kind == 'shield' and not behind:
        k2 = 1.1 if evo else 1.0; w, h = U(0.19) * k2, U(0.32) * k2; cx, cy = hd[0] + U(0.03), hd[1] - U(0.02)
        f.part([('poly', [(cx - w * 0.5, cy - h * 0.5), (cx + w * 0.5, cy - h * 0.55), (cx + w * 0.55, cy + h * 0.15), (cx, cy + h * 0.6), (cx - w * 0.5, cy + h * 0.2)])], trim)
        f.part([('poly', [(cx - w * 0.3, cy - h * 0.35), (cx + w * 0.32, cy - h * 0.38), (cx + w * 0.35, cy + h * 0.1), (cx, cy + h * 0.4), (cx - w * 0.3, cy + h * 0.12)])], [S['M'][1], S['M'][2], S['M'][3], S['M'][3]])
        f.flat([('ell', cx + 0.5, cy - h * 0.03, max(1.5, w * 0.16), max(1.5, w * 0.16))], G[0]); f.px(cx, cy - h * 0.06, G[1])
        if p['strike'] > 0.6 or evo:
            for i in range(8): aa = -1.2 + i * 0.34; f.fx.append((cx + math.cos(aa) * w * 1.1, cy + math.sin(aa) * h * 0.75, G[1] if i % 2 else G[0]))

def wing(f, S, a, span, tones, glow=None):
    """a feathered wing from a fixed template: leading edge shoulder -> elbow -> wrist -> tip, long primaries
    hanging from the trailing edge in scallops. a = 60 is the rest pose; more raises it, less lowers it."""
    th = math.radians(a - 60); c, s_ = math.cos(th), math.sin(th)
    P = lambda x, y: (S[0] + (x * c - y * s_) * span, S[1] + (x * s_ + y * c) * span)
    lead = [(0, 0), (-0.30, -0.42), (-0.62, -0.52), (-1.0, -0.18)]
    trail = [(-0.97, 0.04), (-0.86, -0.04), (-0.82, 0.2), (-0.70, 0.08), (-0.64, 0.32), (-0.52, 0.16), (-0.44, 0.34), (-0.32, 0.14), (-0.2, 0.24), (-0.04, 0.12)]
    f.part([('poly', [P(*q) for q in lead + trail])], tones, band=0.7)
    f.part([('poly', [P(*q) for q in [(0, 0), (-0.30, -0.42), (-0.62, -0.52), (-0.70, -0.30), (-0.4, -0.12), (-0.1, 0.06)]])], [tones[1], tones[2], tones[3], tones[3]])   # covert feathers
    for q0, q1 in [((-0.66, -0.3), (-0.84, 0.12)), ((-0.52, -0.2), (-0.62, 0.24)), ((-0.36, -0.12), (-0.42, 0.26))]: f.line([P(*q0), P(*q1)], tones[0])
    if glow: f.line([P(*q) for q in lead], glow[1])

def deco_torso(f, S, sh, hip, U, t, evo, p):
    M, T, G = S['M'], S['T'], S['G']
    kind = S.get('chest', 'plate')
    if kind == 'plate':
        f.line([(sh[0] - U(0.04), sh[1] + U(0.05)), (sh[0] + U(0.02), sh[1] + U(0.12)), (sh[0] + U(0.07), sh[1] + U(0.04))], M[0])
    elif kind == 'veins':   # glowing cracks in rock or bark
        for i in range(3): f.line([(sh[0] - U(0.06) + i * U(0.05), sh[1] + U(0.04)), (sh[0] - U(0.04) + i * U(0.05), sh[1] + U(0.12)), (sh[0] - U(0.07) + i * U(0.06), hip[1] - U(0.03))], G[0])
    elif kind == 'gem':
        f.flat([('ell', sh[0] + U(0.02), sh[1] + U(0.08), U(0.025), U(0.03))], G[0]); f.px(sh[0] + U(0.015), sh[1] + U(0.07), G[1])
    elif kind == 'robe':
        f.line([(sh[0] + U(0.04), sh[1]), (hip[0] + U(0.02), hip[1])], T[1])
    if S.get('mantle'):   # a shaggy fur mantle across the shoulders
        tr = [T[0], T[0], T[1], T[1]]; y0 = sh[1] + U(0.02)
        pts = [(sh[0] - U(0.2), y0 - U(0.03)), (sh[0] + U(0.12), y0 - U(0.05)), (sh[0] + U(0.16), y0 + U(0.05))]
        for i in range(7): pts.append((sh[0] + U(0.13) - i * U(0.055), y0 + U(0.07 if i % 2 else 0.11)))
        f.part([('poly', pts)], tr, band=0.8)
    if evo:   # runes of light on the final form
        f.line([(sh[0] - U(0.05), sh[1] + U(0.15)), (sh[0] - U(0.02), sh[1] + U(0.09)), (sh[0] + U(0.03), sh[1] + U(0.15)), (sh[0] + U(0.06), sh[1] + U(0.09))], G[1])

def deco_head_back(f, S, hc, hr, U, t, evo, p):
    T, G = S['T'], S['G']; head = S.get('head')
    if S.get('hair'):   # long flowing hair behind the head
        Hc = S['hair']; sway = math.sin(t) * hr * 0.25 + (hr * 0.3 if p['walk'] else 0)
        f.part([('poly', [(hc[0] - hr * 0.2, hc[1] - hr), (hc[0] - hr * 1.1, hc[1] - hr * 0.3), (hc[0] - hr * 1.6 - sway, hc[1] + hr * 2.6), (hc[0] - hr * 0.8 - sway * 0.5, hc[1] + hr * 2.1), (hc[0] - hr * 0.2, hc[1] + hr * 0.5)])], [Hc[0], Hc[0], Hc[1], Hc[1]], band=0.6)
    if head == 'halo':
        r = hr * (1.5 if evo else 1.25); y = hc[1] - hr * 1.7
        f.flat([('ell', hc[0] - hr * 0.2, y, r, r * 0.35)], G[1]); f.flat([('ell', hc[0] - hr * 0.2, y, r - 1.5, max(0.5, r * 0.35 - 1.5))], (0, 0, 0, 0) if False else G[0])
        f.flat([('ell', hc[0] - hr * 0.2, y, max(1, r - 3), max(0.5, r * 0.35 - 2.5))], S['OUT'])
    if head == 'sun':
        n = 9 if evo else 7
        for i in range(n):
            a = math.radians(-20 - i * (220 / (n - 1))); L = hr * (2.2 if i % 2 == 0 else 1.6) * (1.2 if evo else 1)
            b = (hc[0] + math.cos(a) * hr * 0.9, hc[1] + math.sin(a) * hr * 0.9); e = (hc[0] + math.cos(a) * L, hc[1] + math.sin(a) * L)
            f.part([('cap', b, e, max(1, hr * 0.25), 0.6)], [T[0], T[1], G[0], G[1]])
    if head == 'leaves':
        r = hr * (2.2 if evo else 1.9)
        for i, (dx, dy, rr) in enumerate([(-0.9, -0.6, 0.75), (0.2, -1.1, 0.85), (0.9, -0.4, 0.6), (-0.2, -0.3, 0.7), (-1.3, 0.1, 0.5)]):
            f.part([('ell', hc[0] + dx * r * 0.7, hc[1] + dy * r * 0.7 - hr * 0.4, r * rr * 0.6, r * rr * 0.5)], S['C'], band=0.6)

def deco_head(f, S, hc, hr, U, t, evo, p):
    M, T, G, K = S['M'], S['T'], S['G'], S['K']; head = S.get('head'); trim = [T[0], T[0], T[1], T[1]]
    x, y = hc; eye = G[1]
    if S['build'] == 'tree':
        f.line([(x - hr * 0.6, y + hr * 0.2), (x + hr * 0.7, y + hr * 0.4)], M[0])
        f.flat([('rect', x + hr * 0.15, y - hr * 0.2, max(1, hr * 0.35), max(1, hr * 0.25))], G[0]); f.px(x + hr * 0.25, y - hr * 0.15, G[1])
        f.part([('poly', [(x - hr * 0.2, y + hr * 0.5), (x + hr * 0.8, y + hr * 0.6), (x + hr * 0.2, y + hr * 1.8)])], [M[0], M[1], M[2], M[2]])   # mossy beard
        return
    if S['build'] == 'rock':
        f.flat([('rect', x + hr * 0.1, y - hr * 0.15, max(2, hr * 0.5), max(1, hr * 0.28))], G[0]); f.px(x + hr * 0.3, y - hr * 0.1, G[1])
        if head == 'crown':
            for i in range(5 if evo else 3):
                bx = x - hr * 0.8 + i * hr * (1.6 / (4 if evo else 2)); f.part([('poly', [(bx - hr * 0.25, y - hr * 0.7), (bx, y - hr * (1.6 if i % 2 == 0 else 1.25)), (bx + hr * 0.25, y - hr * 0.7)])], trim)
            f.part([('rect', x - hr * 0.95, y - hr * 0.85, hr * 1.9, max(2, hr * 0.3))], trim)
        return
    if head == 'hood':   # a pointed hood, the face lost in shadow, two eyes of light
        f.part([('poly', [(x - hr * 1.1, y + hr * 0.9), (x - hr * 1.0, y - hr * 0.6), (x - hr * 0.6, y - hr * 1.5), (x + hr * 0.6, y - hr * 1.0), (x + hr * 1.05, y + hr * 0.2), (x + hr * 0.6, y + hr * 1.0)])], S['C'], band=0.7)
        f.flat([('ell', x + hr * 0.35, y + hr * 0.05, hr * 0.55, hr * 0.6)], S['OUT'])
        f.px(x + hr * 0.25, y - hr * 0.05, G[1]); f.px(x + hr * 0.7, y - hr * 0.05, G[0])
        return
    # face: eye, brow; most heads wear something
    if head in ('helm', 'kabuto'):
        f.part([('poly', [(x - hr * 1.05, y + hr * 0.2), (x - hr * 0.9, y - hr * 0.9), (x + hr * 0.1, y - hr * 1.15), (x + hr * 1.0, y - hr * 0.5), (x + hr * 1.05, y + hr * 0.5), (x + hr * 0.3, y + hr * 0.45), (x - hr * 0.2, y + hr * 1.0), (x - hr * 0.8, y + hr * 0.9)])], M, band=0.7)
        f.flat([('rect', x + hr * 0.15, y - hr * 0.15, hr * 0.85, max(1, hr * 0.2))], S['OUT']); f.px(x + hr * 0.6, y - hr * 0.1, G[1]); f.px(x + hr * 0.75, y - hr * 0.1, G[1])
        if head == 'helm':
            if S.get('helmwings'):
                for s2 in (0, 1):
                    f.part([('poly', [(x - hr * 0.5 - s2 * hr * 0.3, y - hr * 0.6), (x - hr * (2.0 if evo else 1.7) - s2 * hr * 0.3, y - hr * (2.1 if evo else 1.8)), (x - hr * 1.2, y - hr * 0.9), (x - hr * 1.6, y - hr * 0.6)])], trim if s2 else [T[0], T[0], T[0], T[1]])
            else:
                f.part([('cap', (x - hr * 0.2, y - hr * 1.1), (x - hr * 1.6, y - hr * (1.9 if evo else 1.6)), max(1, hr * 0.3), max(1, hr * 0.15))], [S['C'][0], S['C'][1], S['C'][2], S['C'][3]])   # plume
        else:   # kabuto: wide neck guard and a crescent crest
            f.part([('poly', [(x - hr * 1.2, y - hr * 0.3), (x - hr * 1.7, y + hr * 0.6), (x - hr * 0.3, y + hr * 0.3)])], M)
            c = 1.25 if evo else 1.0
            f.part([('poly', [(x - hr * 0.1, y - hr * 1.0), (x - hr * 0.9 * c, y - hr * 2.2 * c), (x - hr * 0.5, y - hr * 1.15), (x + hr * 0.5, y - hr * 1.15), (x + hr * 1.3 * c, y - hr * 2.2 * c), (x + hr * 0.3, y - hr * 1.0)])], trim)
            f.flat([('rect', x + hr * 0.35, y + hr * 0.35, hr * 0.7, max(1, hr * 0.18))], G[0])   # glowing mask mouth
        return
    f.flat([('rect', x + hr * 0.35, y - hr * 0.2, max(1, hr * 0.28), max(1, hr * 0.28))], eye)
    f.line([(x + hr * 0.15, y - hr * 0.45), (x + hr * 0.8, y - hr * 0.35)], K[0])
    if S.get('beard'):
        Bd = S['beard']; L = hr * (2.3 if evo else 1.9)
        f.part([('poly', [(x - hr * 0.5, y + hr * 0.1), (x + hr * 0.95, y + hr * 0.15), (x + hr * 0.4, y + L), (x - hr * 0.1, y + L * 0.8)])], [Bd[0], Bd[0], Bd[1], Bd[1]])
    if S.get('hair'):
        Hc = S['hair']; f.part([('poly', [(x - hr * 1.0, y + hr * 0.2), (x - hr * 0.8, y - hr * 0.8), (x + hr * 0.3, y - hr * 1.1), (x + hr * 0.9, y - hr * 0.6), (x - hr * 0.1, y - hr * 0.5), (x - hr * 0.4, y + hr * 0.5)])], [Hc[0], Hc[0], Hc[1], Hc[1]])
    if head == 'crown':
        n = 5 if evo else 3; h0 = y - hr * 0.75
        f.part([('rect', x - hr * 0.9, h0 - hr * 0.25, hr * 1.8, max(2, hr * 0.32))], trim)
        for i in range(n):
            bx = x - hr * 0.8 + i * hr * 1.6 / (n - 1); hh = hr * (0.9 if i % 2 == 0 else 0.6) * (1.3 if evo else 1)
            f.part([('poly', [(bx - hr * 0.22, h0 - hr * 0.2), (bx, h0 - hr * 0.2 - hh), (bx + hr * 0.22, h0 - hr * 0.2)])], trim)
        f.px(x, h0 - hr * 0.1, G[0])
    if head == 'horns':
        for s2, tone in ((-1, [T[0], T[0], T[0], T[1]]), (1, trim)):
            b = (x - hr * 0.3 + s2 * hr * 0.35, y - hr * 0.7); L = hr * (1.9 if evo else 1.5)
            m = (b[0] - hr * 0.5, b[1] - L * 0.6); e = (b[0] + hr * 0.3 * s2, b[1] - L)
            f.part([('cap', b, m, hr * 0.32, hr * 0.24), ('cap', m, e, hr * 0.24, 0.6)], tone)

def _num(c): return c

# ---------------- the cast ----------------
SPEC = {
 'titan': dict(H=74, build='rock', OUT='#140e08', M=['#4a3a2a', '#7a6248', '#a88a64', '#d0b488'], C=['#2e5a1e', '#4a8a2a', '#7ed957', '#bff08a'],
               K=['#4a3a2a', '#7a6248'], T=['#8a6a1a', '#e0b040'], G=['#7ed957', '#e0ffb0'], WP=['#3e3e4a', '#6a6a7a', '#9a9aaa', '#d0d0dc'],
               weapon='hammer', head='crown', chest='veins', belt=False, bare=False,
               note='Earthvein Colossus: a giant of brown rock with glowing green veins, a gold crown and a stone maul.'),
 'stormgod': dict(H=74, build='robe', OUT='#0a0c1e', M=['#2a2a6a', '#3a4a9a', '#5a70c8', '#8aa8ee'], C=['#2a2a6a', '#3a4a9a', '#5a70c8', '#8aa8ee'],
               K=['#8aa0c8', '#cfe8ff'], T=['#a87a14', '#ffd34e'], G=['#9fe8ff', '#ffffff'], WP=['#8a6a14', '#c8a030', '#ffd34e', '#fff0a0'], hair=['#a8b8d8', '#f0f6ff'],
               weapon='staff', bolt=True, head='horns', beard=['#a8b8d8', '#f0f6ff'], cape=['#1a1e4a', '#2a3a7a', '#4a5aa8'], chest='robe',
               note='Thunderpeal Lord: storm robes, white hair and beard, golden horns, a staff that throws lightning.'),
 'seagoddess': dict(H=68, build='lady', OUT='#061418', M=['#0e4a5a', '#1a6a8a', '#2aa0b8', '#6ad8e8'], C=['#0e4a5a', '#1a6a8a', '#2aa0b8', '#6ad8e8'],
               K=['#5ab8c8', '#a4e8f0'], T=['#b07a10', '#ffd34e'], G=['#6ee7f2', '#ffffff'], WP=['#8a6a14', '#c8a030', '#ffd34e', '#fff0a0'], hair=['#1a7a8a', '#4ac8d8'],
               weapon='trident', head='crown', chest='gem', armoured=False,
               note='Tidecrest Maiden: sea-green skin, a gown of waves, coral crown, a golden trident.'),
 'moongoddess': dict(H=68, build='lady', OUT='#0c0a1e', M=['#2a2458', '#4a3a8a', '#7a6ac0', '#b0a4e8'], C=['#2a2458', '#4a3a8a', '#7a6ac0', '#b0a4e8'],
               K=['#b8b0d8', '#f0e8ff'], T=['#8a84b0', '#e8e0ff'], G=['#a98bff', '#ffffff'], WP=['#6a6490', '#a8a0c8', '#e8e0ff', '#ffffff'], hair=['#b8b0e0', '#f4f0ff'],
               wings=['#6a6290', '#a8a0d0', '#d8d0f8', '#ffffff'], weapon='bow', head='halo', chest='gem', armoured=False,
               note='Paleglow Lady: silver hair, violet gown, moth-pale wings, a halo and a bow of moonlight.'),
 'frostgiant': dict(H=80, build='giant', OUT='#060c1a', M=['#2a4a7a', '#3a6aa8', '#6a9ad8', '#a8d0f8'], C=['#1a2a5a', '#2a3a7a', '#3a5aa0', '#5a7ac0'],
               K=['#5aa0c8', '#9fe0f8'], T=['#a8c8e0', '#ffffff'], G=['#9fe8ff', '#ffffff'], WP=['#5a8ab0', '#8ac0e0', '#bfefff', '#ffffff'],
               weapon='hammer', head='horns', beard=['#a8c8e0', '#ffffff'], bare=True, skirt=True, chest='plate', mantle=True,
               note='Glacierfang Giant: ice-blue skin, a white beard, a fur kilt, horns and a hammer of ice.'),
 'sunemperor': dict(H=70, build='robe', OUT='#1e0a04', M=['#6a1a14', '#a02a20', '#d04a2a', '#f08a4a'], C=['#6a1a14', '#a02a20', '#d04a2a', '#f08a4a'],
               K=['#c88a5a', '#ffd8a0'], T=['#b07a10', '#ffd34e'], G=['#ffe08a', '#ffffff'], WP=['#8a6a14', '#c8a030', '#ffd34e', '#fff0a0'],
               weapon='staff', head='sun', beard=['#b07a10', '#ffd34e'], cape=['#4a0e0a', '#8a2018', '#c0302a'], chest='robe',
               note='Emperor of the Old Sun: crimson robes, a crown of sun rays, a sceptre holding a little sun.'),
 'shogun': dict(H=60, build='knight', OUT='#06040a', M=['#14121f', '#2a2638', '#4a4460', '#7a7490'], C=['#3a0a10', '#6a1420', '#a02030', '#d04050'],
               K=['#2a2638', '#4a4460'], T=['#8a1420', '#e03a4a'], G=['#ff3a5a', '#ffd0d8'], WP=['#5a5a6a', '#a8a8b8', '#e8e8f0', '#ffffff'],
               weapon='katana', head='kabuto', skirt=True, chest='plate',
               note='Unshadowed General: lacquered black armour with red cords, a crescent-crested helmet, a mask that glows, a long blade.'),
 'treant': dict(H=80, build='tree', OUT='#0e0a04', M=['#3a2814', '#5a3e20', '#7e5a30', '#a88050'], C=['#1e4a1a', '#2e6a24', '#4e9a34', '#8ad84e'],
               K=['#3a2814', '#5a3e20'], T=['#3a2814', '#7e5a30'], G=['#d8ff6a', '#ffffff'], weapon='none', head='leaves', chest='veins', belt=False, pauldron=False,
               note='Old Rootheart: a walking oak with a leaf crown, a mossy beard and sap that glows; slams with both branch arms.'),
 'aegis': dict(H=58, build='knight', OUT='#140c02', M=['#7a5a10', '#b88a1c', '#e0b840', '#fff0a0'], C=['#1a3a8a', '#2a5ac8', '#4a8bf0', '#9ac0ff'],
               K=['#c8a070', '#ffe8b0'], T=['#a8a8b8', '#ffffff'], G=['#ffe08a', '#ffffff'], weapon='shield', head='helm', cape=['#1a3a8a', '#2a5ac8', '#4a8bf0'],
               note='Dawnward Warden: gold plate, a blue cape and plume, a tall shield with a sun boss.'),
 'valkyrie': dict(H=58, build='lady', OUT='#0a0c18', M=['#5a6280', '#8a92b0', '#b8c0d8', '#eef2ff'], C=['#3a4a7a', '#5a6aa0', '#8a9ac8', '#c0ccec'],
               K=['#c8a088', '#ffe0c8'], T=['#a87a14', '#ffd34e'], G=['#6ec8ff', '#ffffff'], WP=['#6a7ab0', '#a8c0e0', '#cfe8ff', '#ffffff'], hair=['#c89a3a', '#ffd88a'],
               wings=['#8a92b0', '#c8d0e8', '#f0f4ff', '#ffffff'], weapon='spear', head='helm', helmwings=True, chest='plate',
               note='Starspear Maiden: silver mail, a winged helm, golden braids, white wings and a starlit spear.'),
 'angel': dict(H=62, build='robe', OUT='#1a140a', M=['#c8b890', '#e8dcc0', '#fff6e0', '#ffffff'], C=['#c8b890', '#e8dcc0', '#fff6e0', '#ffffff'],
               K=['#d8b898', '#fff0e0'], T=['#b07a10', '#ffd34e'], G=['#fff6c0', '#ffffff'], WP=['#c8a030', '#ffd34e', '#fff6c0', '#ffffff'], hair=['#c8a050', '#ffe8a0'],
               wings=['#b8b0a0', '#e8e4d8', '#ffffff', '#ffffff'], weapon='sword', head='halo', chest='robe', armoured=False,
               note='Aureole Herald: white robes with gold trim, a halo, great white wings and a sword of light.'),
 'golems': dict(H=46, build='rock', OUT='#0a0a10', M=['#3a3a4a', '#5a5a6a', '#8a8a9a', '#b8b8c8'], C=['#2a4a1e', '#3a6a2a', '#7ed957', '#bff08a'],
               K=['#3a3a4a', '#5a5a6a'], T=['#5a5a6a', '#8a8a9a'], G=['#7ed957', '#e0ffb0'], weapon='none', head='none', chest='veins', belt=False,
               note='Gateguard Twins: two squat guardians of grey stone with green rune-light; they punch and slam.'),
}

PAL_OF = lambda S: [S['OUT']] + S['M'] + S['C'] + S['K'] + S['T'] + S['G'] + S.get('WP', []) + S.get('hair', []) + S.get('beard', []) + S.get('wings', []) + S.get('cape', [])

def fit_palette(S, core_keys=('M', 'C', 'K', 'T', 'G'), extra_keys=('WP', 'hair', 'beard', 'wings', 'cape'), limit=16):
    """keeps a sheet at <= 16 colours: extra ramps (weapon, hair, wings...) take new colours while there is room,
    after that each extra colour is replaced by the nearest colour already in the palette"""
    S = dict(S); pal = list(dict.fromkeys([S['OUT']] + sum((S[k] for k in core_keys), [])))
    rgb = lambda c: hexc(c)[:3]
    def near(c): return min(pal, key=lambda q: sum((a - b) ** 2 for a, b in zip(rgb(c), rgb(q))))
    for k in extra_keys:
        if k not in S: continue
        out = []
        for c in S[k]:
            if c not in pal and len(pal) < limit: pal.append(c)
            out.append(c if c in pal else near(c))
        S[k] = out
    return S, pal

def make_human(kind):
    S, pal = fit_palette(SPEC[kind])
    big = human(S, 1.35, True); draw, anchor, cell = big
    small_in_big, _, _ = human(S, 1.0, False, cell=cell)
    small, a1, c1 = human(S, 1.0, False)
    st = sum_states(small, S['G']); save(kind, st, a1, pal, S['note'])
    stx = sum_states(draw, S['G'])
    base = lambda d: d(dict(t=0, walk=False, raise_=0, strike=0, recoil=0, flash=False))
    stx['evolve'] = (evolve_frames(base(small_in_big), base(draw)), 12, False)
    save(kind + '_evo', stx, anchor, pal, S['note'] + ' Final form.')

if __name__ == '__main__':
    for k in sys.argv[1:] or list(SPEC): make_human(k)
