# Summons follow a little behind their owner when no enemy is around, and rush into the boss arena the moment the boss
# fight starts (whatever they were doing). Co-op: when one player starts the boss fight, the rest of the team is pulled in.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- following ----------
rep("""  const SUM_SPD = v => clamp(v * 0.6, 38, 70);   // slow and heavy on purpose""", """  const SUM_SPD = v => clamp(v * 0.6, 38, 70);   // slow and heavy on purpose
  // with no enemy around a summon walks (or flies) a little behind its owner; too far away and it catches up
  function sumFollow(s, o, dt, fly) {
    const tx = o.x + 4 - o.face * (34 + (s.slotOff || 0)), d = tx - s.x, ad = Math.abs(d);
    if (Math.abs(o.x - s.x) > 420 || Math.abs(o.y - s.y) > 260) { sumRejoin(s, o, true); return; }
    s.mv = 0; if (ad < 10) { s.f = o.face; return; }
    s.f = d < 0 ? -1 : 1; const sp = (ad > 120 ? 2.2 : 1) * 60;
    if (fly) { sumGlide(s, tx, o.y - 42 + Math.sin(s.t * 2) * 4, dt * (ad > 120 ? 2 : 1)); s.f = d < 0 ? -1 : 1; return; }
    if (sumStepX(s, s.f * Math.min(sp * dt, ad - 8))) s.mv = 1;
  }""")
rep("""    if (sumPhys(s, dt) && t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1] && sumStepX(s, s.f * Math.min(sp * dt, ad - w[1]))) s.mv = 1; }""",
    """    const onG = sumPhys(s, dt);
    if (onG && t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1] && sumStepX(s, s.f * Math.min(sp * dt, ad - w[1]))) s.mv = 1; }
    else if (onG) sumFollow(s, o, dt, false);""")
rep("""      if (s.kind === 'phoenix') { const pt = sumTarget(s); if (pt) { s.f = pt.x + pt.w / 2 > s.x ? 1 : -1; sumGlide(s, pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, pt.y - 70 + Math.sin(s.t * 3) * 6, dt); s.mv = 1; } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 6 * dt; } }
      else if (fly) { const dr = sumTarget(s); if (dr) { const sd0 = dr.x + dr.w / 2 < s.x ? -1 : 1; s.f = sd0; sumGlide(s, dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130), dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6, dt); } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 5 * dt; } }""",
    """      if (s.kind === 'phoenix') { const pt = sumTarget(s); if (pt) { s.f = pt.x + pt.w / 2 > s.x ? 1 : -1; sumGlide(s, pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, pt.y - 70 + Math.sin(s.t * 3) * 6, dt); s.mv = 1; } else sumFollow(s, o, dt, true); }
      else if (fly) { const dr = sumTarget(s); if (dr) { const sd0 = dr.x + dr.w / 2 < s.x ? -1 : 1; s.f = sd0; sumGlide(s, dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130), dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6, dt); } else sumFollow(s, o, dt, true); }""")
# walking in (intro) with nothing to fight: also follow instead of wandering off
rep("""      else if (!tg) { if (k < 5 && go(s.f * sp * 0.5 * dt)) s.mv = 1; }""", """      else if (!tg) sumFollow(s, o, dt, fly);""")
# several summons line up behind the owner instead of standing on one spot
rep("""    const sm = { evo: !!evo, stage: 1,""", """    const sm = { slotOff: (G.sums.filter(q => q.owner === o).length % 4) * 18, evo: !!evo, stage: 1,""")

# ---------- the boss fight starts: every summon joins it ----------
rep("""      if (s.ph && s.ph !== 'fight') { sumIntro(s, s.owner || P, dt);""", """      if (Q.arenaSealed && Q.boss && !Q.boss.dead && !s.dying && s.stage === 1) {   // the boss fight has begun: whatever it was doing, it comes to fight the boss
        const ar = Q.L.arena; if (ar && (s.x < (ar.x0 + 2) * TS || s.x > ar.x1 * TS)) { sumRejoin(s, s.owner || P, true); pop(s.x, s.y - 40, sv('To the boss!', 'Vào đánh boss!'), (GIANT[s.kind] || BEAST[s.kind]).glow); }
        if (s.ph && s.ph !== 'fight') { s.ph = 'fight'; s.ax = s.ay = s.arot = s.sink = 0; s.asx = s.asy = s.aal = 1; s.look = 0; s.inv = 0.4; }
        s.tg = Q.boss;
      }
      if (s.ph && s.ph !== 'fight') { sumIntro(s, s.owner || P, dt);""")
# a summon pulled into the arena appears next to its owner inside it
rep("""    if (SUM_FLY[s.kind]) { s.x = o.x + 4 - o.face * 26; s.y = o.y - 46; } else { const sp = sumSpawnPoint(o, o.x + 4 - o.face * 26); s.x = sp.x; s.y = sp.y; s.vy = 0; }""",
    """    if (SUM_FLY[s.kind]) { s.x = o.x + 4 - o.face * 26; s.y = o.y - 46; } else { const sp = sumSpawnPoint(o, o.x + 4 - o.face * 26); s.x = sp.x; s.y = sp.y; s.vy = 0; }
    if (Q.arenaSealed && Q.L.arena) s.x = arenaClamp(s.x);""")

# ---------- co-op: one player starts the boss fight, the team is pulled in ----------
rep("""    if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS && (L.arena.y0 === undefined || P.y > L.arena.y0 * TS) && coopAllIn(L.arena.x0, L.arena.x1, 'boss')) seal();""",
    """    if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS && (L.arena.y0 === undefined || P.y > L.arena.y0 * TS)) { seal(); if (coop && (Q.players || []).length > 1) { Q.msg = cvs('Boss fight! Your teammates are pulled in to fight together!', 'Đánh boss! Đồng đội được kéo vào đánh cùng!'); Q.msgT = 3.5; } }""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
