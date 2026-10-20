# Summons that walk stay on the ground (the same rules as a Unity Rigidbody2D summon, written for this engine):
# 1) spawn on a ground point found by a downward probe ("raycast") from the hero, never in the air or inside a wall
# 2) Y only changes through gravity (fall) or a small step up; nothing sets Y to fly them up
# 3) walls stop them on X instead of lifting them on top; pits and drops deeper than 3 tiles stop them at the edge
# 4) while not grounded they neither walk forward nor attack: gravity pulls them down first
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

rep("""  // the floor under a walking summon (searches from its feet, so it never walks on a cave ceiling or a hill far above)
  function sumGround(x, yRef) {""", """  // ---- ground physics for walking summons ----
  // groundBelow: a downward probe ("raycast") from just above the feet; returns the y of the first floor top, or null over a pit
  function sumProbe(x, yRef, maxTiles) {
    const tx = Math.floor(x / TS), H = Q.L.H, st = clamp(Math.floor((yRef - 6) / TS), 0, H - 1), end = Math.min(H, st + (maxTiles || 40));
    if (solid(tx, st) && solid(tx, st - 1)) return null;   // the probe starts inside a wall
    for (let ty = Math.max(1, st); ty < end; ty++) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    return null;
  }
  // one step on X: allowed onto flat ground, a 1-tile step up or a drop of up to 3 tiles; a wall or a pit stops the summon
  function sumStepX(s, dx) {
    if (!dx) return true; const nx = s.x + dx, probe = sumProbe(nx + Math.sign(dx) * 6, s.y - 18, 5);
    if (probe === null || probe < s.y - 18 || probe > s.y + 3 * TS) return false;
    s.x = nx; return true;
  }
  // gravity: Y only ever changes by falling (with acceleration) or by climbing a small step; returns true when standing on the ground
  function sumPhys(s, dt) {
    const gy = sumProbe(s.x, s.y - 18);
    if (gy === null) { s.vy = Math.min(600, (s.vy || 0) + 1100 * dt); s.y += s.vy * dt; s.grounded = false; if (s.y > (Q.L.H + 2) * TS) sumRejoin(s, s.owner || Q.P, true); return false; }
    if (s.y < gy - 0.5) { s.vy = Math.min(600, (s.vy || 0) + 1100 * dt); s.y = Math.min(gy, s.y + s.vy * dt); }
    if (s.y >= gy - 0.5) { s.y = gy; s.vy = 0; s.grounded = true; } else s.grounded = false;
    return s.grounded;
  }
  // a safe ground point next to the hero: try the spot in front, else the hero's own spot
  function sumSpawnPoint(o, wantX) {
    const feet = o.y + o.h, own = sumProbe(o.x + 4, feet - 2) ?? feet;
    for (const x of [wantX, (wantX + o.x + 4) / 2, o.x + 4]) { const gy = sumProbe(x, own - 18, 6); if (gy !== null && Math.abs(gy - own) <= 18) return { x, y: gy }; }
    return { x: o.x + 4, y: own };
  }
  // the floor under a walking summon (searches from its feet, so it never walks on a cave ceiling or a hill far above)
  function sumGround(x, yRef) {""")
# rejoin: put walkers on a real ground point
rep("""  function sumRejoin(s, o) {
    const ar = Q.L.arena, out = Q.arenaSealed && ar && (s.x < (ar.x0 + 2) * TS || s.x > ar.x1 * TS);
    if (!out) return;
    emit(s.x, s.y - 20, 18, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 90 });
    s.x = o.x + 4 - o.face * 26; s.y = SUM_FLY[s.kind] ? o.y - 46 : sumGround(s.x, o.y + o.h);""", """  function sumRejoin(s, o, force) {
    const ar = Q.L.arena, out = force || (Q.arenaSealed && ar && (s.x < (ar.x0 + 2) * TS || s.x > ar.x1 * TS));
    if (!out) return;
    emit(s.x, s.y - 20, 18, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 90 });
    if (SUM_FLY[s.kind]) { s.x = o.x + 4 - o.face * 26; s.y = o.y - 46; } else { const sp = sumSpawnPoint(o, o.x + 4 - o.face * 26); s.x = sp.x; s.y = sp.y; s.vy = 0; }""")
# fight: walk on X only, gravity on Y, no walking while falling
rep("""    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = SUM_SPD(w[0]); s.mv = 0;
    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(sp * dt, ad - w[1]); s.mv = 1; } }
    if (Q.arenaSealed) s.x = arenaClamp(s.x);
    const gy = sumGround(s.x, s.y); s.y = gy < s.y ? gy : Math.min(gy, s.y + 420 * dt);   // steps up at once, falls down smoothly""", """    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = SUM_SPD(w[0]); s.mv = 0;
    if (sumPhys(s, dt) && t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1] && sumStepX(s, s.f * Math.min(sp * dt, ad - w[1]))) s.mv = 1; }
    if (Q.arenaSealed) s.x = arenaClamp(s.x);""")
# march: same rules
rep("""      if (!tg) { if (k < 5) { s.x += s.f * sp * 0.5 * dt; s.mv = 1; } }
      else if (ad > ENR) { s.x += s.f * Math.min(sp * dt, ad - ENR); s.mv = 1; if (fly) s.y += clamp(tg.y - 60 - s.y, -40 * dt, 40 * dt); }
      else { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; }
      if (Q.arenaSealed) s.x = arenaClamp(s.x);
      if (!fly) { const gy = sumGround(s.x, s.y); s.y = gy < s.y ? gy : Math.min(gy, s.y + 420 * dt); }""", """      const onG = fly || sumPhys(s, dt);   // a walker in the air does nothing until it lands
      const go = d2 => { if (fly) { s.x += d2; return true; } return sumStepX(s, d2); };
      if (!onG) { s.ax = s.ay = 0; }
      else if (!tg) { if (k < 5 && go(s.f * sp * 0.5 * dt)) s.mv = 1; }
      else if (ad > ENR) { if (go(s.f * Math.min(sp * dt, ad - ENR))) s.mv = 1; else if (!fly && ad < ENR * 2.2) { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; } if (fly) s.y += clamp(tg.y - 60 - s.y, -40 * dt, 40 * dt); }
      else { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; }
      if (Q.arenaSealed) s.x = arenaClamp(s.x);""")
rep("""      else if (gait === 'glide') { s.ay = -8 + Math.sin(k * 2.5) * 3; s.arot = s.f * 0.06; }""", """      else if (gait === 'glide') { s.arot = s.f * 0.06; }   // smooth, but the feet stay on the ground""")
# leap: land on the real ground at the landing spot
rep("""        if (u >= 1) { once('slam', () => { Q.shake""", """        if (u >= 1) { once('land', () => { const gy = sumProbe(s.x, Math.min(s.y, t2.y + t2.h) - 30); if (gy !== null) s.y = gy; s.vy = 0; }); once('slam', () => { Q.shake""")
# teleport casters reappear on the ground beside the target (no more hovering in the sky)
rep("""        else { once('p', () => { s.x = tx - s.f * 40; s.air = true; s.y = t2.y - 50; emit(""", """        else { once('p', () => { const sp = sumSpawnPoint({ x: tx - 4, y: t2.y + t2.h - 14, h: 14, face: s.f }, tx - s.f * 40); s.x = sp.x; s.y = sp.y; s.vy = 0; emit(""")
rep("""        else if (k < 0.6) { s.sink = H; s.x = s.ex0 + (tx + s.f * 26 - s.ex0) * ez((k - 0.3) / 0.3); s.y = sumGround(s.x, t2.y + t2.h);""", """        else if (k < 0.6) { s.sink = H; const nx = s.ex0 + (tx + s.f * 26 - s.ex0) * ez((k - 0.3) / 0.3), gy = sumProbe(nx, t2.y + t2.h - 18, 4); if (gy !== null) { s.x = nx; s.y = gy; }""")
rep("""        const u = clamp(k / 0.35, 0, 1); s.x = s.ex0 + (tx - s.f * 22 - s.ex0) * ez(u); s.mv = 1; s.arot = s.f * 0.15;""", """        const u = clamp(k / 0.35, 0, 1), nx = s.ex0 + (tx - s.f * 22 - s.ex0) * ez(u); sumStepX(s, nx - s.x); s.mv = 1; s.arot = s.f * 0.15;""")
rep("""      if (Q.arenaSealed && !s.air) s.x = arenaClamp(s.x);
    }""", """      if (Q.arenaSealed && !SUM_FLY[s.kind]) s.x = arenaClamp(s.x);
    }""")
rep("""      const o = s.owner || P, fly = !!SUM_FLY[s.kind] || !!s.air;""", """      const o = s.owner || P, fly = !!SUM_FLY[s.kind];""")
# spawn: on a probed ground point
rep("""    let x = from ? from.x : (ent === 'shadow' ? o.x + 4 : o.x + 4 + dir * (ent === 'meteor' ? 74 : 56)); if (Q.arenaSealed) x = arenaClamp(x);
    const gy = sumGround(x, from ? from.y : o.y + o.h), y = fly ? gy - 60 : gy, L = (life || 7) + (ENT_T[ent] || 1) + 1.6;""", """    let x = from ? from.x : (ent === 'shadow' ? o.x + 4 : o.x + 4 + dir * (ent === 'meteor' ? 74 : 56)); if (Q.arenaSealed) x = arenaClamp(x);
    const sp0 = from ? { x, y: sumProbe(x, from.y - 18, 8) ?? sumSpawnPoint(o, x).y } : sumSpawnPoint(o, x); x = sp0.x;
    const gy = sp0.y, y = fly ? gy - 60 : gy, L = (life || 7) + (ENT_T[ent] || 1) + 1.6;""")
# no attacks while falling
rep("""      if (s.cd > 0 || s.t < 0.5 || s.life < 0.3) continue;""", """      if (s.cd > 0 || s.t < 0.5 || s.life < 0.3 || (!fly && s.grounded === false)) continue;""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
