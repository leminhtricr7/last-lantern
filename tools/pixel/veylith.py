# Veylith, the Hush Spinner (map 2 boss): a violet-black spider queen. A pale human-like face is patterned on her
# abdomen (the forest's whispers), six green eyes glow on her head, curved fangs, eight long bent legs.
# Cell 80x56, feet on (40, 53).
import math, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pix import Frame, std_states, build

OUT = '#0e0814'
V0, V1, V2, V3 = '#1e1430', '#3a2654', '#5a3e7a', '#8a6ab0'
F0, F1 = '#a898c0', '#e0d8ee'
E0, E1 = '#4ad08a', '#d8ffe0'
FANG, VEN = '#e8e0f0', '#9be564'; WEB = F1
RED, RED2 = '#ff3a5a', '#ffb0c0'
PAL = [OUT, V0, V1, V2, V3, F0, F1, E0, E1, FANG, VEN, RED, RED2, '#6a1430']
W, H, GROUND = 80, 56, 52

def leg(f, hip, knee, foot, tones):
    f.part([('cap', hip, knee, 1.5, 1.3), ('cap', knee, foot, 1.3, 0.7)], tones)

def draw(p):
    f = Frame(W, H, OUT)
    t = p['t'] * 2 * math.pi; rec = p['recoil']
    bob = math.sin(t) * 0.8 if not p['walk'] else abs(math.sin(t * 2)) * 1.2
    cx = 41 - 4 * rec; by = GROUND - 19 - bob + 2 * p['strike'] - 2 * p['raise_']
    back_t, front_t = [V0, V0, V1, V2], [V0, V1, V2, V3]
    # legs: 4 behind the body (darker), 4 in front. Walking: two alternating groups, each foot planted or lifted.
    hips = [(cx - 6, by + 1), (cx - 1, by + 2), (cx + 4, by + 2), (cx + 8, by + 1)]
    feet0 = [-31, -18, 13, 28]
    for side in (0, 1):
        for i, (hx, hy) in enumerate(hips):
            ph = t * 2 + (i + side) * math.pi   # alternating groups
            dx = feet0[i] + (side * 3 - 1.5)
            lift = 0
            if p['walk']: dx += math.sin(ph) * 3; lift = max(0, math.cos(ph)) * 3
            fx, fy = cx + dx, GROUND - 1 - lift
            kx, ky = hx + (fx - hx) * 0.42, by - 17 - (3 if i in (0, 3) else 0) - lift * 0.5
            if i == 3 and side == 1:   # the front leg: raised for the wind-up, stabbing down for the strike
                if p['raise_']: kx, ky, fx, fy = hx + 8, by - 18 - 6 * p['raise_'], hx + 18, by - 26 * p['raise_'] - 4
                elif p['strike']: kx, ky, fx, fy = hx + 10, by - 10, hx + 22, GROUND
            leg(f, (hx, hy), (kx, ky), (fx, fy), back_t if side == 0 else front_t)
            if side == 1 and i == 0: break_back = True
        if side == 0:
            # the abdomen with its pale face, then the head (between the two leg layers)
            ax, ay = cx - 13, by - 4
            f.part([('ell', ax, ay, 17, 12)], [V0, V1, V2, V3], band=0.7)
            f.flat([('ell', ax + 1, ay - 1, 9, 7)], F0); f.flat([('ell', ax + 1, ay - 2, 8, 5)], F1)   # the pale whisper face
            f.flat([('ell', ax - 2, ay - 2, 2.5, 2), ('ell', ax + 4, ay - 2, 2.5, 2)], F0)   # the whisper face: eye holes
            f.flat([('ell', ax - 2, ay - 2, 1.5, 1.4), ('ell', ax + 5, ay - 2, 1.5, 1.4)], V0)
            f.line([(ax - 3, ay + 3), (ax + 1, ay + 4), (ax + 5, ay + 3)], V1)                # a sad mouth
            f.line([(ax - 8, ay - 6), (ax - 12, ay + 2)], F0); f.line([(ax + 10, ay - 6), (ax + 13, ay + 1)], F0)
            f.part([('ell', cx + 7, by - 1, 9, 7)], front_t)                                  # cephalothorax
            hx2, hy2 = cx + 14, by - 4
            f.part([('ell', hx2, hy2, 5, 4.5)], front_t)                                      # head
            eye = RED if p.get('rage') else E0
            for (ex, ey) in [(hx2 + 1, hy2 - 3), (hx2 + 3, hy2 - 2), (hx2 + 4, hy2), (hx2 - 1, hy2 - 2), (hx2 + 2, hy2 + 1), (hx2 + 5, hy2 - 3)]:
                f.px(ex, ey, eye)
            f.px(hx2 + 3, hy2 - 2, E1 if not p.get('rage') else RED2)
            fo = 1 + round(2 * p['cast'])   # fangs open when spitting
            f.part([('poly', [(hx2 + 3, hy2 + 3), (hx2 + 7, hy2 + 4 + fo), (hx2 + 4, hy2 + 7 + fo)])], [V1, FANG, FANG, FANG])
            f.part([('poly', [(hx2, hy2 + 4), (hx2 + 3, hy2 + 6 + fo), (hx2 + 1, hy2 + 8 + fo)])], [V1, FANG, FANG, FANG])
    # spit (cast): a glob of venom and a thread of silk
    if p['cast'] > 0.5:
        sx = cx + 24 + 10 * (p['cast'] - 0.5); f.flat([('ell', min(W - 5, sx), by + 4, 2.5, 2)], VEN)
        for i in range(6): f.fx.append((cx - 26 - i * 1.5, by + 4 + i, WEB))
    return f.finish(p['flash'])

if __name__ == '__main__':
    st = std_states(draw, {V1: '#6a1430', V2: '#8a2a5a', V3: '#c05a8a', F1: RED2}, GROUND, ember=E0)
    build('veylith', st, (W, H), (40, 53), PAL + ['#8a2a5a', '#c05a8a'], 'Veylith, the Hush Spinner (map 2).', skip=('tele', 'slam'))
