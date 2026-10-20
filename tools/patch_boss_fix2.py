import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:110]
    s = s.replace(a, b)
rep("""          const [ia, ib] = arenaInner(); if (mv < 0 && ((mv > 0 ? b.x + b.w > ib - 20 : b.x < ia + 20) || (sd < 0 ? b.x + b.w > ib - 20 : false))) mv = 0;   // no backing into a wall
          if (mv < 0 && ((sd > 0 && b.x < ia + 24) || (sd < 0 && b.x + b.w > ib - 24))) mv = 0;""",
"""          const [ia, ib] = arenaInner(); if (mv < 0 && ((sd > 0 && b.x < ia + 24) || (sd < 0 && b.x + b.w > ib - 24))) mv = 0;   // no backing into a wall""")
rep("""  const MELEE_L = ['stomp', 'slam', 'jump', 'bounce3', 'charge', 'rush', 'sweep', 'spin', 'tentacles', 'roar', 'guard'];
  const bossRange = sk => (!sk ? [10, 70] : MELEE_L.indexOf(sk) >= 0 ? [-999, 26] : (RANGE_L.indexOf(sk) >= 0 || CAST_L.indexOf(sk) >= 0) ? [90, 170] : [10, 80]);""",
"""  const CLOSE_L = ['stomp', 'slam', 'tentacles', 'guard', 'roar'], LEAP_L = ['jump', 'bounce3', 'charge', 'rush'];
  function bossRange(sk) {
    if (CLOSE_L.indexOf(sk) >= 0) return [-999, 24];   // hits up close: walk right up to the hero
    if (LEAP_L.indexOf(sk) >= 0) return [30, 120];     // leaps and charges need a run-up
    if (RANGED.indexOf(sk) >= 0 || RANGE_L.indexOf(sk) >= 0 || CAST_L.indexOf(sk) >= 0) return [80, 170];   // shots and spells: keep away
    return [10, 80];
  }""")
rep("if (!sk || sk.upd(b, dt)) endSkill(b); else if (b.actT > 7) bossReturn(b); return; }",
    "if (!sk || sk.upd(b, dt)) endSkill(b); else if (b.actT > 7) { endSkill(b); bossReturn(b); } return; }")
rep("""    const ar = Q.L.arena, row = Math.max(0, ar.gy - 2), mid = Math.floor((ar.x0 + ar.x1) / 2); let l = mid, r = mid;
    while (l > ar.x0 - 1 && !solid(l - 1, row)) l--; while (r < ar.x1 + 1 && !solid(r + 1, row)) r++;
    return [l * TS, (r + 1) * TS];""",
"""    const ar = Q.L.arena, wall = tx => solid(tx, ar.gy - 1) && solid(tx, ar.gy - 2) && solid(tx, ar.gy - 3);   // a wall = 3+ tiles high (low steps do not count)
    let mid = Math.floor((ar.x0 + ar.x1) / 2); for (let k = 0; k < 12 && wall(mid); k++) mid += k % 2 ? k : -k;
    let l = mid, r = mid; while (l > ar.x0 - 1 && !wall(l - 1)) l--; while (r < ar.x1 + 1 && !wall(r + 1)) r++;
    return [l * TS, (r + 1) * TS];""")
rep("""    const [a, c] = arenaInner(), cx = (a + c) / 2; b.hide = false;""",
    """    const [a, c] = arenaInner(), px = Q.P.x + 4; let cx = (a + c) / 2; if (Math.abs(cx - px) < b.w / 2 + 40) cx = clamp(px + (px < cx ? 1 : -1) * (b.w / 2 + 60), a + b.w / 2 + 2, c - b.w / 2 - 2);   // not on top of the hero
    b.hide = false;""")
rep("const t = Q.P; b.tx = arenaClamp(t.x + 4); b.ph = 1;", "const t = Q.P; b.tx = arenaClampB(b, t.x + 4); b.ph = 1;")
# unembed: a falling body is pushed down before up (dropping in from above)
rep("for (const [dx, dy] of [[d * k, 0], [-d * k, 0], [0, -k]])", "for (const [dx, dy] of (e.vy > 0 ? [[d * k, 0], [-d * k, 0], [0, k], [0, -k]] : [[d * k, 0], [-d * k, 0], [0, -k]]))")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
