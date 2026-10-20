# P1: the difficulty climbs step by step from map 3 to map 10 (it used to jump all at once between map 2 and map 3),
# map lengths grow evenly, and map 1's dragon comes after the first checkpoint instead of right at the start.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/levels.js', [
    ("id: 'caves', seed: 33, len: 580,", "id: 'caves', seed: 33, len: 500,"),
    ("id: 'desert', seed: 44, len: 640,", "id: 'desert', seed: 44, len: 570,"),
    ("id: 'frost', seed: 55, len: 700,", "id: 'frost', seed: 55, len: 640,"),
    ("id: 'volcano', seed: 66, len: 760,", "id: 'volcano', seed: 66, len: 710,"),
    ("id: 'swamp', seed: 88, len: 650,", "id: 'swamp', seed: 88, len: 640,"),
    ("id: 'tunnels', seed: 111, len: 820,", "id: 'tunnels', seed: 111, len: 800,"),
    ("const HARD = li => li >= 2;   // maps 3-10 are the long, hard ones (maps 1 and 2 stay gentle)",
     "const HARD = li => li >= 2;   // maps 3-10 are the long, hard ones (maps 1 and 2 stay gentle)\n"
     "const HARDK = li => (li >= 2 ? Math.min(1, Math.max(0, (LPOS(li) - 1) / 8)) : 0);   // how far into the hard part: map 3 = 0.125 ... map 10 = 1"),
    ("    if (li >= 3 && r < 0.05 + 0.025 * lv + (HARD(li) ? 0.025 : 0)) return 'elite';\n    if (li >= 1 && r < 0.12 + 0.03 * lv + (HARD(li) ? 0.06 : 0)) return 'big';",
     "    if (li >= 3 && r < 0.05 + 0.025 * lv + 0.035 * HARDK(li)) return 'elite';\n    if (li >= 1 && r < 0.12 + 0.03 * lv + 0.07 * HARDK(li)) return 'big';"),
    ("+ (li >= 2 && rnd() < 0.55 ? 1 : 0) + (li >= 4 && rnd() < 0.35 ? 1 : 0) : 0;",
     "+ (li >= 2 && rnd() < 0.3 + 0.35 * HARDK(li) ? 1 : 0) + (rnd() < 0.4 * HARDK(li) ? 1 : 0) : 0;"),
    ("|| (HARD(li) && n >= 12 && rnd() < 0.3 && placeTrap(", "|| (HARD(li) && n >= 12 && rnd() < 0.35 * HARDK(li) && placeTrap("),
    ("(t === 'dragon' && li === 0) ? 26 :", "(t === 'dragon' && li === 0) ? 70 :"),   # after the first checkpoint, once the player knows the keys
])
patch('src/game.js', [
    ("* (HARD(Q.li) ? 1.35 : 1)));   // maps 3-10: tougher monsters", "* (1 + 0.4 * HARDK(Q.li))));   // maps 3-10: monsters get tougher step by step (x1.05 ... x1.4)"),
    ("hp = Math.round(c.hp * (HARD(Q.li) ? 2.2 : 1.7) * (1 + 0.02 * totalShards()));", "hp = Math.round(c.hp * (1.7 + 0.55 * HARDK(Q.li)) * (1 + 0.02 * totalShards()));"),
    ("hp = Math.round(c.hp * (HARD(Q.li) ? 1.9 : 1.5) * (1 + 0.02 * totalShards()));", "hp = Math.round(c.hp * (1.5 + 0.4 * HARDK(Q.li)) * (1 + 0.02 * totalShards()));"),
    ("hp = Math.round(c.hp * (HARD(Q.li) ? 1.25 : 1) * (1 + 0.02 * totalShards()));", "hp = Math.round(c.hp * (1 + 0.25 * HARDK(Q.li)) * (1 + 0.02 * totalShards()));"),
])
# (also applied by hand: DENS in genLevel thins the monsters per map so the count climbs evenly)
print('ok')
