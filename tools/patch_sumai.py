import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, 'MISSING/DUP: ' + a[:90]
    s = s.replace(a, b)
a0 = s.index("  function sumWalk(s, o, dt) {"); a1 = s.index("  function evolveSummon(s) {")
s = s[:a0] + """  // what a summon fights: the boss while its fight is on, otherwise the nearest monster in this part of the map
  function sumTarget(s, r) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return b;
    return nearestFoe(s.x, s.y - 30, r || 1100);
  }
  // summons never trail behind the hero: they march on the target, or scout ahead of the hero when no monster is around
  function sumWalk(s, o, dt) {
    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = w[0] * (s.stage === 2 ? 1.3 : 1); s.mv = 0;
    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(sp * (ad > 240 ? 1.6 : 1) * dt, ad - w[1]); s.mv = 1; } }
    else { const d = o.x + 4 + o.face * 70 - s.x, ad = Math.abs(d); if (ad > 12) { s.f = d < 0 ? -1 : 1; s.x += s.f * Math.min(sp * dt, ad - 10); s.mv = 1; } else s.f = o.face; }
    if (Q.arenaSealed) s.x = arenaClamp(s.x);
    s.y = groundYAt(s.x);
  }
""" + s[a1:]
rep("const SUM_WALK = { titan: [55, 70],", "const SUM_WALK = { aegis: [95, 45], titan: [55, 70],")
rep("      if (s.kind === 'phoenix') { s.mv = 1; s.x = Q.cam.x + VW / 2 + Math.sin(s.t * 0.9) * (VW * 0.42); s.y = Q.cam.y + 46 + Math.sin(s.t * 2) * 6; s.f = Math.cos(s.t * 0.9) > 0 ? 1 : -1; }\n      else if (fly) { const dr = (s.kind === 'dragonking' || s.kind === 'dragonform') ? nearestFoe(s.x, s.y, 700) : null,",
    "      if (s.kind === 'phoenix') { s.mv = 1; const pt = sumTarget(s); if (pt) { const tx = pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, ty = pt.y - 70 + Math.sin(s.t * 3) * 6, k = 1 - Math.exp(-2.5 * dt); s.f = tx > s.x ? 1 : -1; s.x += (tx - s.x) * k; s.y += (ty - s.y) * k; } else { s.x = Q.cam.x + VW / 2 + Math.sin(s.t * 0.9) * (VW * 0.42); s.y = Q.cam.y + 46 + Math.sin(s.t * 2) * 6; s.f = Math.cos(s.t * 0.9) > 0 ? 1 : -1; } }\n      else if (fly) { const dr = sumTarget(s),")
rep("tx = dr ? dr.x + dr.w / 2 - sd0 * 150 : o.x + 4 + o.face * 20, ty = dr ? dr.y - 50 + Math.sin(s.t * 2) * 6 : o.y - 46 + Math.sin(s.t * 2) * 4,",
    "tx = dr ? dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130) : o.x + 4 + o.face * 80, ty = dr ? dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6 : o.y - 46 + Math.sin(s.t * 2) * 4,")
# the golden guardian guards wherever it fights, and strikes too
rep("        case 'aegis': s.cd = 0.1; for (const p of Q.projs) if (!p.dead && Math.hypot(p.x - (o.x + 4), p.y - (o.y + 7)) < 140) {",
    "        case 'aegis': s.cd = 0.1; for (const p of Q.projs) if (!p.dead && (Math.hypot(p.x - (o.x + 4), p.y - (o.y + 7)) < 140 || Math.hypot(p.x - s.x, p.y - (s.y - 30)) < 140)) {")
rep("if ((s.n = (s.n || 0) + 1) % 15 === 0) nova(o.x + 4, o.y + 7, 70, sd(4)); break;",
    "if ((s.n = (s.n || 0) + 1) % 15 === 0) nova(s.x, s.y - 20, 70, sd(4)); if (s.n % 8 === 0) { const t = near(80); if (t) { dmgFoe(t, sd(4), true, true); s.atkT = 0.35; Snd.play('clang'); } } break;")
# health bar on every summon, all the time
rep("    if (s.hpMax && !s.dying && (s.stage === 2 || s.hp < s.hpMax)) {", "    if (s.hpMax && !s.dying) {")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
