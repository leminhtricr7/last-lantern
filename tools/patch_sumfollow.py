import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)
rep("""  function sumTarget(s, r) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return b;
    return nearestFoe(s.x, s.y - 30, r || 1100);
  }""", """  function sumTarget(s, r) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return b;
    const o = s.owner || Q.P; return nearestFoe(o.x + 4, o.y, r || 560);   // monsters around the hero, so summons stay in the fight with you
  }
  // the floor under a walking summon (searches from its feet, so it never walks on a cave ceiling or a hill far above)
  function sumGround(x, yRef) {
    const tx = Math.floor(x / TS), H = Q.L.H, st = clamp(Math.floor((yRef - 24) / TS), 1, H - 1);
    for (let ty = st; ty < H; ty++) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    for (let ty = st - 1; ty > 0; ty--) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    return yRef;
  }
  // a summon left far behind (the hero was pulled into a boss arena, took a portal, respawned...) appears next to the hero again
  function sumRejoin(s, o) {
    const ar = Q.L.arena, out = Q.arenaSealed && ar && (s.x < (ar.x0 + 2) * TS || s.x > ar.x1 * TS);
    if (!out && Math.abs(s.x - o.x) < 760 && Math.abs(s.y - o.y) < 420) return;
    emit(s.x, s.y - 20, 18, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 90 });
    s.x = o.x + 4 - o.face * 26; s.y = SUM_FLY[s.kind] ? o.y - 46 : sumGround(s.x, o.y + o.h);
    emit(s.x, s.y - 20, 24, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 110 }); Snd.play('poof');
  }
  const SUM_FLY = { phoenix: 1, dragonking: 1, dragonform: 1, skywhale: 1 };   // these fly, every other summon walks on the ground""")
rep("""    if (Q.arenaSealed) s.x = arenaClamp(s.x);
    s.y = groundYAt(s.x);
  }""", """    if (Q.arenaSealed) s.x = arenaClamp(s.x);
    const gy = sumGround(s.x, s.y); s.y = gy < s.y ? gy : Math.min(gy, s.y + 420 * dt);   // steps up at once, falls down smoothly
  }""")
rep("      const o = s.owner || P, fly = !!BEAST[s.kind] && s.kind !== 'thunderkirin' && s.kind !== 'ninetail' && s.kind !== 'clones';",
    "      const o = s.owner || P, fly = !!SUM_FLY[s.kind];\n      if (s.kind !== 'phoenix') sumRejoin(s, o);")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
