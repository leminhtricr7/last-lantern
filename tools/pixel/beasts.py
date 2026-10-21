# Beast summons and the five pets (phase 3B, last group): Azure Vixen (ninetail), Boltmane Qilin (thunderkirin),
# Lightwhale (skywhale), Elder Goldscale (dragonking), Coalheart Drake (dragonform), the Shadow Trio (clones),
# the Relit Phoenix's final form, the Cobble Colossus, and the small pets they grow from.
# Same rules and states as summons.py; flyers are anchored on the centre of the body.
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, build, hexc, shatter, fit_states, save_set, preview
import summons as SM
from PIL import Image

def at(o, a, L): r = math.radians(a); return (o[0] + math.sin(r) * L, o[1] + math.cos(r) * L)

# ---------------- four-legged beasts ----------------
def quad(Q, z=1.0, evo=False, cell=None):
    Hb = Q['H'] * z; U = lambda v: v * Hb
    W0, H0 = cell or (round(Hb * 3.2) + 30, round(Hb * 2.0) + 24); GR = H0 - 6; CX = W0 // 2
    F, BL, G, O = Q['F'], Q['BL'], Q['G'], Q['OUT']
    far = [F[0], F[0], F[1], F[1]]; bell = [BL[0], BL[0], BL[1], BL[1]]; gl = [G[0], G[0], G[1], G[1]]
    def draw(p):
        f = Frame(W0, H0, O)
        t = p['t'] * 2 * math.pi; walk = p['walk']; rz, st, rec = p['raise_'], p['strike'], p['recoil']
        lh = U(0.36); bob = abs(math.sin(t * 2)) * U(0.03) if walk else math.sin(t) * U(0.01)
        crouch = U(0.08) * rz if Q['kind'] == 'fox' else 0
        cx = CX + U(0.25) * st - U(0.1) * rec; cy = GR - lh - U(0.13) - bob + crouch
        rear = U(0.22) * rz if Q['kind'] == 'qilin' and not st else 0   # the qilin rears up before it stomps
        rx, ry = U(0.44), U(0.16)
        tilt = -rear / (rx * 2)
        bodyY = lambda x: cy + (x - cx) * tilt
        # tails behind everything
        n = Q['tails_evo'] if evo else Q['tails']
        base = (cx - rx * 0.9, bodyY(cx - rx) - ry * 0.4)
        for i in range(n):
            spread = (i - (n - 1) / 2) / max(1, (n - 1) / 2)
            ang = 205 + spread * (38 if n > 1 else 0) + math.sin(t + i) * 6 + (10 if walk else 0) - 15 * rz
            L = U(0.55 if Q['kind'] == 'fox' else 0.4) * (1.1 if evo else 1)
            pts = [base]
            for j in range(1, 5): pts.append(at(pts[-1], ang + j * (12 + spread * 4) + math.sin(t * 1.5 + i + j) * 5, L / 4))
            tw = U(0.06 if Q['kind'] == 'fox' else 0.03)
            tones = F if i % 2 == 0 else far
            f.part([('cap', pts[j], pts[j + 1], tw * (1.1 + 0.3 * math.sin(j * 1.2)), tw * (1.0 + 0.3 * math.sin(j + 1))) for j in range(4)], tones)
            tip = pts[-1]
            if Q['kind'] == 'fox':
                f.part([('cap', pts[-2], tip, tw * 0.9, tw * 0.5)], bell)
                fl = U(0.06) * (1.4 if evo else 1)
                f.flat([('poly', [(tip[0] - fl * 0.6, tip[1] + 1), (tip[0] + math.sin(t * 3 + i) * 2, tip[1] - fl * 2.2), (tip[0] + fl * 0.6, tip[1] + 1)])], G[0])
                f.flat([('ell', tip[0], tip[1] - 1, max(1, fl * 0.35), max(1, fl * 0.6))], G[1])
            else:   # tuft of lightning
                f.part([('ell', tip[0], tip[1], U(0.05), U(0.04))], [Q['M'][0], Q['M'][0], Q['M'][1], Q['M'][1]])
        # legs: far pair first
        legs = []
        for k, (hipx, front) in enumerate([(cx - rx * 0.6, False), (cx + rx * 0.55, True)]):
            for near in (False, True):
                ph = t * 2 + (0 if front == near else math.pi) + (0.6 if near else 0)
                sw = math.sin(ph) * U(0.13) if walk else (U(0.03) if near else -U(0.03))
                lift = max(0, math.cos(ph)) * U(0.07) if walk else 0
                hx = hipx + (U(0.04) if near else -U(0.02)); hy = bodyY(hipx) + ry * 0.3
                fy = GR - lift
                if front and rear: fy = hy + U(0.12); sw = U(0.12)   # front legs paw the air when rearing
                if front and st and Q['kind'] == 'fox': sw = U(0.16)
                ft = (hx + sw, fy); kn = ((hx + ft[0]) / 2 + (U(0.05) if front else -U(0.06)), (hy + fy) / 2)
                legs.append((near, hx, hy, kn, ft))
        lw = U(Q.get('legw', 0.045))
        for near, hx, hy, kn, ft in legs:
            if near: continue
            f.part([('cap', (hx, hy), kn, lw * 1.2, lw), ('cap', kn, ft, lw, lw * 0.8)], far)
            f.part([('rect', ft[0] - lw, ft[1] - lw * 1.4, lw * 2.4, lw * 1.4 + 1)], Q.get('hoof', far))
        # body
        f.part([('poly', [(cx - rx, bodyY(cx - rx) - ry * 0.6), (cx - rx * 0.3, bodyY(cx) - ry * 1.15), (cx + rx * 0.6, bodyY(cx + rx) - ry * 1.2), (cx + rx * 1.02, bodyY(cx + rx) - ry * 0.3),
                          (cx + rx * 0.8, bodyY(cx + rx) + ry * 0.9), (cx - rx * 0.2, bodyY(cx) + ry * 1.0), (cx - rx * 1.05, bodyY(cx - rx) + ry * 0.5)])], F, band=0.6)
        f.part([('ell', cx + rx * 0.2, bodyY(cx) + ry * 0.75, rx * 0.6, ry * 0.35)], bell, band=0.9)
        if Q['kind'] == 'qilin':   # scales
            for i in range(5):
                x = cx - rx * 0.7 + i * rx * 0.33
                for j in range(2): f.line([(x - 2, bodyY(x) - ry * 0.4 + j * ry * 0.5), (x, bodyY(x) - ry * 0.2 + j * ry * 0.5), (x + 2, bodyY(x) - ry * 0.4 + j * ry * 0.5)], F[0])
        for near, hx, hy, kn, ft in legs:
            if not near: continue
            f.part([('cap', (hx, hy), kn, lw * 1.25, lw), ('cap', kn, ft, lw, lw * 0.8)], F)
            f.part([('rect', ft[0] - lw, ft[1] - lw * 1.4, lw * 2.4, lw * 1.4 + 1)], Q.get('hoof', F))
        # neck and head
        nb = (cx + rx * 0.75, bodyY(cx + rx) - ry * 0.5)
        hd = (cx + rx * 1.25 + U(0.08) * st, bodyY(cx + rx) - U(0.3) - rear * 0.6 + U(0.06) * st + crouch * 0.6)
        f.part([('cap', nb, hd, U(0.1), U(0.07))], F)
        if Q['kind'] == 'qilin':   # a mane of lightning along the neck
            for i in range(5):
                q = i / 4; b = (nb[0] + (hd[0] - nb[0]) * q - U(0.04), nb[1] + (hd[1] - nb[1]) * q - U(0.04))
                e = (b[0] - U(0.12) - math.sin(t * 2 + i) * U(0.03), b[1] - U(0.06) + (i % 2) * U(0.04))
                f.part([('cap', b, e, U(0.035), 0.6)], [Q['M'][0], Q['M'][1], G[0], G[1]])
        hr = U(0.11)
        f.part([('ell', hd[0], hd[1], hr * 1.05, hr * 0.85)], F)
        mo = U(0.035) if (st or rz > 0.5) else 0
        f.part([('poly', [(hd[0] + hr * 0.4, hd[1] - hr * 0.5), (hd[0] + hr * 2.0, hd[1] + hr * 0.15), (hd[0] + hr * 1.9, hd[1] + hr * 0.45), (hd[0] + hr * 0.3, hd[1] + hr * 0.6)])], F)   # snout
        if mo: f.part([('poly', [(hd[0] + hr * 0.3, hd[1] + hr * 0.5), (hd[0] + hr * 1.6, hd[1] + hr * 0.5 + mo), (hd[0] + hr * 0.3, hd[1] + hr * 0.8)])], bell)
        f.px(hd[0] + hr * 2.0, hd[1] + hr * 0.2, O)
        if Q['kind'] == 'fox':
            for k2, tone in ((0, far), (1, F)):
                ex = hd[0] - hr * 0.5 + k2 * hr * 0.55; el = U(0.17) * (1.15 if evo else 1)
                f.part([('poly', [(ex - hr * 0.35, hd[1] - hr * 0.5), (ex - hr * 0.1, hd[1] - hr * 0.5 - el), (ex + hr * 0.4, hd[1] - hr * 0.5)])], tone)
                if k2: f.line([(ex - hr * 0.05, hd[1] - hr * 0.6), (ex - hr * 0.05, hd[1] - hr * 0.5 - el * 0.6)], BL[0])
            f.part([('poly', [(hd[0] - hr * 0.6, hd[1] + hr * 0.2), (hd[0] + hr * 0.6, hd[1] + hr * 0.6), (hd[0] - hr * 0.2, hd[1] + hr * 1.1)])], bell)   # cheek ruff
        else:
            hl = U(0.2) * (1.3 if evo else 1)
            f.part([('cap', (hd[0] - hr * 0.1, hd[1] - hr * 0.6), (hd[0] - hr * 0.6, hd[1] - hr * 0.6 - hl), U(0.03), 0.6)], [Q['M'][0], Q['M'][0], Q['M'][1], Q['M'][1]])   # horn
            f.part([('poly', [(hd[0] - hr * 0.8, hd[1] - hr * 0.3), (hd[0] - hr * 1.4, hd[1] - hr * 0.9), (hd[0] - hr * 0.5, hd[1] - hr * 0.7)])], F)   # ear
            f.line([(hd[0] + hr * 1.8, hd[1] + hr * 0.3), (hd[0] + hr * 1.2, hd[1] + hr * 1.4), (hd[0] + hr * 0.4, hd[1] + hr * 1.7)], G[0], only_on_body=False)   # whisker
        f.flat([('rect', hd[0] + hr * 0.3, hd[1] - hr * 0.3, max(2, hr * 0.4), max(1, hr * 0.25))], Q['EYE'])
        # attacks
        if Q['kind'] == 'fox':
            if rz:
                for i in range(3): a = t * 2 + i * 2.1; f.flat([('ell', hd[0] + math.cos(a) * U(0.2), hd[1] - U(0.15) + math.sin(a) * U(0.1), U(0.035), U(0.04))], G[0]); f.px(hd[0] + math.cos(a) * U(0.2), hd[1] - U(0.15) + math.sin(a) * U(0.1), G[1])
            if st > 0.6:
                for i in range(3): x = hd[0] + hr * 2.4 + i * U(0.14); f.flat([('ell', x, hd[1] + (i - 1) * U(0.05), U(0.05) - i * 0.5, U(0.04))], G[0]); f.flat([('ell', x, hd[1] + (i - 1) * U(0.05), U(0.025), U(0.02))], G[1])
        else:
            if st > 0.6:   # stomp: lightning bursts from the hooves
                for i in range(12): f.fx.append((cx + rx * 0.6 - U(0.3) + i * U(0.06), GR - 1 - (i % 3) * 2, G[1] if i % 2 else G[0]))
                x, y = hd[0] - hr * 0.6, hd[1] - hr * 0.6 - U(0.2)
                for i in range(6): x2, y2 = x + U(0.03) * (1 if i % 2 else -1), y - U(0.06); f.fx += [(x + (x2 - x) * j / 3, y + (y2 - y) * j / 3, G[1]) for j in range(3)]; x, y = x2, y2
            if rz: f.fx += [(hd[0] - hr * 0.6 + math.cos(i) * 3, hd[1] - hr * 0.6 - U(0.2) + math.sin(i) * 3, G[1]) for i in range(6)]
        if evo:
            for i in range(8): ph = (p['t'] + i / 8) % 1; f.fx.append((cx - rx + (i * 37 % 60) / 60 * rx * 2.4, GR - U(0.05) - ph * U(0.8), G[1] if i % 2 else G[0]))
        return f.finish(p['flash'])
    return draw, (CX, GR + 1), (W0, H0)

FOX = dict(kind='fox', H=42, tails=3, tails_evo=9, OUT='#08101e', F=['#3a5a9a', '#6a90d0', '#a8c8f0', '#e8f4ff'], BL=['#c8d8f0', '#ffffff'],
           G=['#3ab0ff', '#bff0ff'], EYE='#ffd34e', M=['#1a5ad8', '#3ab0ff'], legw=0.04,
           note='Azure Vixen: a pale-blue fox with three tails (nine in its final form) that burn with blue foxfire.')
QILIN = dict(kind='qilin', H=50, tails=1, tails_evo=1, OUT='#0a0e1a', F=['#1a4a8a', '#2a7ac8', '#4ac0f0', '#9fe8ff'], BL=['#c8a030', '#ffe08a'],
             G=['#9fe8ff', '#ffffff'], EYE='#ffffff', M=['#8a6a14', '#ffd34e'], hoof=['#2a2a3a', '#2a2a3a', '#5a5a6a', '#5a5a6a'], legw=0.04,
             note='Boltmane Qilin: a scaled blue qilin with a golden horn and a mane of lightning; rears up and stomps out bolts.')

# ---------------- the Lightwhale (a flyer) ----------------
WHALE = dict(H=34, OUT='#060a1e', B=['#141e5a', '#24349a', '#3a50c8', '#6a84e8'], BL=['#a8c0f0', '#e8f4ff'], S=['#ffe08a', '#ffffff'], G=['#cfe8ff', '#ffffff'],
             note='Lightwhale: a deep-blue whale swimming through the air, belly pale, constellations glowing on its back.')
def whale(Wq, z=1.0, evo=False, cell=None):
    Hb = Wq['H'] * z; U = lambda v: v * Hb
    W0, H0 = cell or (round(Hb * 3.6) + 30, round(Hb * 2.2) + 30); CX, CY = W0 // 2, H0 // 2
    B, BL, S, G = Wq['B'], Wq['BL'], Wq['S'], Wq['G']
    def draw(p):
        f = Frame(W0, H0, Wq['OUT'])
        t = p['t'] * 2 * math.pi; rz, st, rec = p['raise_'], p['strike'], p['recoil']
        cx = CX + U(0.2) * st - U(0.2) * rec; cy = CY + math.sin(t) * U(0.05) - U(0.1) * rz
        L = U(1.35)
        # tail: a curve to the flukes
        tw = math.sin(t + 1) * U(0.12) + (math.sin(t * 2) * U(0.08) if p['walk'] else 0)
        pts = [(cx - L * 0.35 - i * L * 0.12, cy - U(0.02) + tw * (i / 5) ** 1.5) for i in range(6)]
        f.part([('cap', pts[i], pts[i + 1], U(0.28) * (1 - i * 0.16), U(0.28) * (1 - (i + 1) * 0.16)) for i in range(5)], B)
        e = pts[-1]
        f.part([('poly', [e, (e[0] - U(0.32), e[1] - U(0.3) + tw * 0.3), (e[0] - U(0.18), e[1]), (e[0] - U(0.32), e[1] + U(0.28) + tw * 0.3)])], B)
        # body: blunt head on the right
        f.part([('poly', [(cx - L * 0.4, cy - U(0.3)), (cx + L * 0.1, cy - U(0.5)), (cx + L * 0.45, cy - U(0.38)), (cx + L * 0.58, cy - U(0.05)), (cx + L * 0.52, cy + U(0.3)),
                          (cx + L * 0.2, cy + U(0.48)), (cx - L * 0.3, cy + U(0.32))])], B, band=0.55)
        # pale ridged belly and the mouth line
        mo = U(0.12) * st + U(0.04) * rz
        f.part([('poly', [(cx + L * 0.55, cy + U(0.12)), (cx + L * 0.2, cy + U(0.48)), (cx - L * 0.3, cy + U(0.32)), (cx - L * 0.1, cy + U(0.18)), (cx + L * 0.3, cy + U(0.12))])], [BL[0], BL[0], BL[1], BL[1]])
        for i in range(5): x = cx + L * (0.42 - i * 0.14); f.line([(x, cy + U(0.17)), (x - U(0.06), cy + U(0.4) - i * U(0.02))], BL[0] if i % 2 else B[2])
        f.line([(cx + L * 0.57, cy + U(0.08)), (cx + L * 0.25, cy + U(0.1) + mo)], Wq['OUT'])
        if mo > 1: f.flat([('poly', [(cx + L * 0.57, cy + U(0.09)), (cx + L * 0.27, cy + U(0.11)), (cx + L * 0.27, cy + U(0.1) + mo)])], B[0])
        f.flat([('rect', cx + L * 0.36, cy - U(0.08), max(2, U(0.07)), max(2, U(0.07)))], G[1]); f.px(cx + L * 0.36 + 1, cy - U(0.08) + 1, Wq['OUT'])
        # constellations on the back
        stars = [(-0.25, -0.22), (-0.1, -0.33), (0.05, -0.25), (0.18, -0.36), (0.3, -0.24)] + ([(-0.35, -0.12), (0.0, -0.12), (0.12, -0.14)] if evo else [])
        prev = None
        for i, (sx, sy) in enumerate(stars):
            q = (cx + L * sx, cy + U(sy) * 1.6)
            if prev and i < 5: f.line([prev, q], B[3])
            prev = q
        for i, (sx, sy) in enumerate(stars):
            q = (cx + L * sx, cy + U(sy) * 1.6); tw2 = (i + int(p['t'] * 6)) % 3 == 0
            f.px(q[0], q[1], S[1] if tw2 else S[0])
            if tw2 or evo: f.px(q[0] + 1, q[1], S[0]); f.px(q[0] - 1, q[1], S[0]); f.px(q[0], q[1] - 1, S[0]); f.px(q[0], q[1] + 1, S[0])
        # pectoral fin
        fa = 20 + math.sin(t * (2 if p['walk'] else 1)) * 25 - 30 * rz
        fb = (cx + L * 0.15, cy + U(0.25)); ft = at(fb, 180 + 90 + fa, U(0.45) * (1.2 if evo else 1))
        f.part([('poly', [fb, (ft[0] - U(0.1), ft[1] + U(0.12)), ft, (fb[0] + U(0.12), fb[1] + U(0.05))])], [B[1], B[2], B[3], B[3]])
        if evo:   # a crown of light along the head and trails from the fins
            for i in range(4): f.part([('poly', [(cx + L * (0.1 + i * 0.09), cy - U(0.46) + i * U(0.03)), (cx + L * (0.13 + i * 0.09), cy - U(0.7) + i * U(0.05)), (cx + L * (0.16 + i * 0.09), cy - U(0.44) + i * U(0.03))])], [S[0], S[0], S[1], S[1]])
            for i in range(6): f.fx.append((ft[0] - i * 3, ft[1] + (i % 2), G[0] if i % 2 else S[0]))
        # attacks: gathers starlight, then sprays a fan of stars forward
        if rz:
            for i in range(8): a = i * 0.8 + t; r = U(0.25) * (1.2 - rz * 0.6); f.fx.append((cx + L * 0.65 + math.cos(a) * r, cy + math.sin(a) * r, S[1] if i % 2 else G[0]))
        if st > 0.6:
            for i in range(5):
                q = (cx + L * 0.65 + i * U(0.2), cy - U(0.1) + (i - 2) * U(0.12))
                f.flat([('poly', [(q[0] - 2, q[1]), (q[0], q[1] - 2), (q[0] + 2, q[1]), (q[0], q[1] + 2)])], S[0]); f.px(q[0], q[1], S[1])
        return f.finish(p['flash'])
    return draw, (CX, CY), (W0, H0)

# ---------------- dragons (re-using the boss drawer) ----------------
import dragon as DR
DR.COL['gold'] = dict(out='#1e1404', body=['#8a6a14', '#c8a030', '#ffd34e', '#fff0a0'], belly=['#c8b890', '#e8dcc0', '#fff6e0', '#ffffff'],
                      wing=['#0e4a5a', '#1a7a8a', '#2aa0b8', '#6ad8e8'], horn=['#a89878', '#fff6e0'], eye='#ff3a2a', fire=['#ffd34e', '#fff6c0', '#ffffff'], whisk='#fff6e0')
DR.COL['coal'] = dict(out='#0a0604', body=['#1a1412', '#2e2622', '#4a3e38', '#6a5a50'], belly=['#8a2a0a', '#c84a12', '#ff7a2a', '#ffc070'],
                      wing=['#140e0c', '#2a1e1a', '#4a3028', '#7a4a30'], horn=['#4a3e38', '#c8b8a8'], eye='#ffd34e', fire=['#ff4a0a', '#ff9a2a', '#ffe08a'], cracks='#ff7a2a')

def dragon_set(form, s):
    DR.SIZE[form] = s
    st = DR.states(form)
    return {'idle': st['idle'], 'walk': st['walk'], 'tele': st['tele'], 'attack': st['cast'], 'hurt': st['hurt'], 'death': st['death']}

def make_dragon(kind, form, s, note):
    C = DR.COL[form]; pal = list(dict.fromkeys([C['out']] + C['body'] + C['belly'] + C['wing'] + C['horn'] + [C['eye'], '#ffffff'] + C['fire'] + ([C['whisk']] if C.get('whisk') else []) + ([C['cracks']] if C.get('cracks') else [])))
    G = [C['fire'][1], C['fire'][2]]
    for name, sz, evo in ((kind, s, False), (kind + '_evo', s * 1.35, True)):
        st = dragon_set(form, sz); W, H = st['idle'][0][0].size
        base = st['idle'][0][0]
        st['spawn'] = ([SM.materialise(base, (i + 1) / 6, G, seed=i) for i in range(6)] + [SM.white(base), base], 12, False)
        if evo:   # the small dragon, centred in the big cell, flickers into the big one
            small = dragon_set(form, s)['idle'][0][0]; sm = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sm.paste(small, ((W - small.size[0]) // 2, (H - small.size[1]) // 2))
            st['evolve'] = (SM.evolve_frames(sm, base), 12, False)
        st = {k: (v[0], v[1], v[2]) for k, v in st.items()}
        SM.save(name, st, (W // 2, H // 2), pal, note + (' Final form.' if evo else ''), flyer=True)

# ---------------- the phoenix's final form ----------------
import phoenix as PH
def make_phoenix_evo():
    PH.W = PH.H = 112; orig = PH.phoenix
    def big(p, flash=False):
        q = dict(p); q['dx'] = q.get('dx', 0) + 14; q['dy'] = q.get('dy', 0) + 16; q['scale'] = q.get('scale', 1.0) * 1.3
        q['embers'] = q.get('embers', 6) + 6; q['glow'] = max(q.get('glow', 0.5), 0.9)
        return orig(q, flash)
    def small(p, flash=False):
        q = dict(p); q['dx'] = q.get('dx', 0) + 14; q['dy'] = q.get('dy', 0) + 16; return orig(q, flash)
    PH.phoenix = big
    st = {'idle': (PH.hover(), 10, True), 'walk': (PH.move(), 12, True), 'tele': (PH.tele(), 8, False), 'attack': (PH.attack(), 12, False),
          'hurt': (PH.hurt(), 12, False), 'death': (PH.death(), 10, False), 'spawn': (PH.spawn(), 12, False)}
    bigb = big(dict(wing=60, glow=1.0)); smb = small(dict(wing=60))
    st['evolve'] = (SM.evolve_frames(smb, bigb), 12, False)
    PH.phoenix = orig; PH.W = PH.H = 80
    SM.save('phoenix_evo', st, (56, 62), PH.PAL, 'Relit Phoenix, final form: bigger wings, a hotter crest, more embers.', flyer=True)

# ---------------- the Shadow Trio and the Cobble Colossus (humanoid rig) ----------------
SM.SPEC['clones'] = dict(H=28, build='knight', OUT='#06020c', M=['#140a24', '#2a1640', '#46286a', '#6a4a98'], C=['#2a0a3a', '#4a1a6a', '#7a3ab0', '#a86ae0'],
                         K=['#140a24', '#2a1640'], T=['#46286a', '#a86ae0'], G=['#c07bff', '#ffffff'], WP=['#2a1640', '#6a4a98', '#a86ae0', '#e8d8ff'],
                         weapon='sword', head='hood', cape=['#2a0a3a', '#4a1a6a', '#7a3ab0'], pauldron=False,
                         note='Shadow Trio: three hooded swordsmen made of violet shadow, eyes like coals of light (the game draws three copies).')
SM.SPEC['cobble'] = dict(H=74, build='rock', OUT='#0a0c10', M=['#3a4048', '#5e6670', '#8a929c', '#bcc4cc'], C=['#2a4a5a', '#3a6a7a', '#6ec8d8', '#c0f0f8'],
                         K=['#3a4048', '#5e6670'], T=['#5e6670', '#8a929c'], G=['#6ec8d8', '#e0fcff'], weapon='none', head='none', chest='veins', belt=False,
                         note='Cobble Colossus: the Cobblekin pet grown huge, a heap of round grey river stones with cyan light between them; it punches.')

# ---------------- the five small pets (idle 4, walk 6) ----------------
def pet_sheet(name, draw, anchor, pal, note, flyer=False):
    D = lambda **k: draw(dict(dict(t=0, walk=False, raise_=0, strike=0, recoil=0, flash=False), **k))
    st = {'idle': ([D(t=i / 4) for i in range(4)], 6, True), 'walk': ([D(t=i / 6, walk=True) for i in range(6)], 10, True)}
    SM.save(name, st, anchor, pal, note, flyer=flyer)

def make_pets():
    q = dict(FOX, H=12, tails=1, legw=0.06); d, a, c = quad(q); pet_sheet('pet_kitsune', d, a, pal_q(FOX), 'Azure Kit (pet).')
    q = dict(QILIN, H=13, legw=0.06); d, a, c = quad(q); pet_sheet('pet_kirin', d, a, pal_q(QILIN), 'Qilin Foal (pet).')
    w = dict(WHALE, H=8); d, a, c = whale(w); pet_sheet('pet_starwhale', d, a, pal_w(WHALE), 'Starfin Calf (pet). Flyer.', flyer=True)
    S, pal = SM.fit_palette(dict(SM.SPEC['cobble'], H=15)); d, a, c = SM.human(S, 1.0, False); pet_sheet('pet_pebblegolem', d, a, pal, 'Cobblekin (pet).')
    # Coalpup: the Coalheart Drake as a hatchling
    C = DR.COL['coal']; DR.SIZE['coalpup'] = 0.24; DR.COL['coalpup'] = dict(C, cracks=None)
    flaps = [70, 30, -20, 30]
    D = lambda p: DR.dragon('coalpup', dict(wing=flaps[int(p['t'] * 4) % 4] if not p['walk'] else [80, 40, -10, -30, 10, 50][int(p['t'] * 6) % 6], tail=p['t'] * 6.28))
    pal = list(dict.fromkeys([C['out']] + C['body'] + C['belly'] + C['wing'] + C['horn'] + [C['eye'], '#ffffff'] + C['fire']))
    im = D(dict(t=0, walk=False)); pet_sheet('pet_wyrmling', D, (im.size[0] // 2, im.size[1] // 2), pal, 'Coalpup (pet). Flyer.', flyer=True)

def pal_q(Q): return list(dict.fromkeys([Q['OUT']] + Q['F'] + Q['BL'] + Q['G'] + [Q['EYE']] + Q['M'] + Q.get('hoof', [])))
def pal_w(Wq): return list(dict.fromkeys([Wq['OUT']] + Wq['B'] + Wq['BL'] + Wq['S'] + Wq['G']))

def make_quad(kind, Q):
    big, anchor, cell = quad(Q, 1.35, True); sib, _, _ = quad(Q, 1.0, False, cell=cell); small, a1, _ = quad(Q, 1.0, False)
    pal = pal_q(Q); G = Q['G']
    SM.save(kind, SM.sum_states(small, G), a1, pal, Q['note'])
    st = SM.sum_states(big, G); base = lambda d: d(dict(t=0, walk=False, raise_=0, strike=0, recoil=0, flash=False))
    st['evolve'] = (SM.evolve_frames(base(sib), base(big)), 12, False); SM.save(kind + '_evo', st, anchor, pal, Q['note'] + ' Final form.')

def make_whale():
    big, anchor, cell = whale(WHALE, 1.35, True); sib, _, _ = whale(WHALE, 1.0, False, cell=cell); small, a1, _ = whale(WHALE, 1.0, False)
    pal = pal_w(WHALE); G = WHALE['G']
    SM.save('skywhale', SM.sum_states(small, G, True), a1, pal, WHALE['note'] + ' Flyer.', flyer=True)
    st = SM.sum_states(big, G, True); base = lambda d: d(dict(t=0, walk=False, raise_=0, strike=0, recoil=0, flash=False))
    st['evolve'] = (SM.evolve_frames(base(sib), base(big)), 12, False); SM.save('skywhale_evo', st, anchor, pal, WHALE['note'] + ' Final form. Flyer.', flyer=True)

JOBS = {
 'ninetail': lambda: make_quad('ninetail', FOX), 'thunderkirin': lambda: make_quad('thunderkirin', QILIN), 'skywhale': make_whale,
 'dragonking': lambda: make_dragon('dragonking', 'gold', 0.62, 'Elder Goldscale: a golden dragon with teal wings and long pale whiskers.'),
 'dragonform': lambda: make_dragon('dragonform', 'coal', 0.6, 'Coalheart Drake: a charcoal dragon with lava glowing through cracks in its hide.'),
 'phoenix': make_phoenix_evo, 'clones': lambda: SM.make_human('clones'), 'cobble': lambda: SM.make_human('cobble'), 'pets': make_pets,
}
if __name__ == '__main__':
    for k in sys.argv[1:] or list(JOBS): JOBS[k]()
