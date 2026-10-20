# Maps 3-10 are longer (about +50%) and harder; maps 1 and 2 stay as they are.
import io, re
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/levels.js', [
    ("id: 'caves', seed: 33, len: 380,", "id: 'caves', seed: 33, len: 580,"),
    ("id: 'desert', seed: 44, len: 420,", "id: 'desert', seed: 44, len: 640,"),
    ("id: 'frost', seed: 55, len: 460,", "id: 'frost', seed: 55, len: 700,"),
    ("id: 'volcano', seed: 66, len: 500,", "id: 'volcano', seed: 66, len: 760,"),
    ("id: 'citadel', seed: 77, len: 720,", "id: 'citadel', seed: 77, len: 1000,"),
    ("id: 'swamp', seed: 88, len: 430,", "id: 'swamp', seed: 88, len: 650,"),
    ("id: 'tunnels', seed: 111, len: 580,", "id: 'tunnels', seed: 111, len: 820,"),
    ("const LDIFF = li => [0, 1, 2, 3, 4, 5, 6, 5.25, 5.5, 5.75][li] || 0;   // how hard a map is (the Citadel stays the hardest)",
     "const LDIFF = li => [0, 1, 2, 3, 4, 5, 6, 5.25, 5.5, 5.75][li] || 0;   // how hard a map is (the Citadel stays the hardest)\nconst HARD = li => li >= 2;   // maps 3-10 are the long, hard ones (maps 1 and 2 stay gentle)"),
    # more elites and big ones
    ("    if (li >= 3 && r < 0.05 + 0.025 * lv) return 'elite';\n    if (li >= 1 && r < 0.12 + 0.03 * lv) return 'big';",
     "    if (li >= 3 && r < 0.05 + 0.025 * lv + (HARD(li) ? 0.025 : 0)) return 'elite';\n    if (li >= 1 && r < 0.12 + 0.03 * lv + (HARD(li) ? 0.06 : 0)) return 'big';"),
    # more monsters on each stretch of ground, more traps
    ("+ (li >= 2 && rnd() < 0.35 ? 1 : 0) : 0;", "+ (li >= 2 && rnd() < 0.55 ? 1 : 0) + (li >= 4 && rnd() < 0.35 ? 1 : 0) : 0;"),
    ("placeTrap(B.traps[R(0, B.traps.length - 1)], x, n);", "placeTrap(B.traps[R(0, B.traps.length - 1)], x, n) || (HARD(li) && n >= 12 && rnd() < 0.3 && placeTrap(B.traps[R(0, B.traps.length - 1)], x + 6, n - 6));"),
    # more dark stretches on the long maps
    ("  { const zn = li >= 2 ? 3 : 2,", "  { const zn = li >= 2 ? Math.max(3, Math.round(B.len / 180)) : 2,"),
])
patch('src/game.js', [
    ("    const hp = Math.max(1, Math.round(c.hp * (1 + 0.22 * li) * hpv * (s && s.minion ? 0.6 : 1)));",
     "    const hp = Math.max(1, Math.round(c.hp * (1 + 0.22 * li) * hpv * (s && s.minion ? 0.6 : 1) * (HARD(Q.li) ? 1.35 : 1)));   // maps 3-10: tougher monsters"),
    ("    const c = BOSS[Q.li], hp = Math.round(c.hp * 1.7 * (1 + 0.02 * totalShards()));",
     "    const c = BOSS[Q.li], hp = Math.round(c.hp * (HARD(Q.li) ? 2.2 : 1.7) * (1 + 0.02 * totalShards()));"),
    ("    const c = forms[0], hp = Math.round(c.hp * 1.5 * (1 + 0.02 * totalShards()));",
     "    const c = forms[0], hp = Math.round(c.hp * (HARD(Q.li) ? 1.9 : 1.5) * (1 + 0.02 * totalShards()));"),
])
# (also applied by hand: the Citadel's later forms get x1.25 hp)
print('ok')
