import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- targeting: scan the map from the summon itself, boss first, then elites, then any monster ----------
rep("""  function sumTarget(s, r) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return b;
    const o = s.owner || Q.P; return nearestFoe(o.x + 4, o.y, r || 560);   // monsters around the hero, so summons stay in the fight with you
  }""", """  // seek & destroy: no link to the hero; the summon locks the boss, else the nearest elite, else the nearest monster on the map
  function sumTarget(s) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return (s.tg = b);
    const fs = foes(); if (s.tg && !s.tg.dead && !s.tg.hid && fs.includes(s.tg)) return s.tg;   // keep the lock until it dies
    let best = null, bd = 1400;
    for (const e of fs) { const d = Math.hypot(e.x + e.w / 2 - s.x, e.y + e.h / 2 - (s.y - 20)) * (isBig(e) ? 0.5 : 1); if (d < bd) { bd = d; best = e; } }
    return (s.tg = best);
  }""")
# only a sealed boss arena pulls a summon in (the boss is its target); otherwise it never warps back to the hero
rep("""    if (!out && Math.abs(s.x - o.x) < 760 && Math.abs(s.y - o.y) < 420) return;""", """    if (!out) return;""")
# walkers: slow, heavy march straight at the target; with no target they hold their ground
rep("""    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = w[0] * (s.stage === 2 ? 1.3 : 1); s.mv = 0;
    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(sp * (ad > 240 ? 1.6 : 1) * dt, ad - w[1]); s.mv = 1; } }
    else { const d = o.x + 4 + o.face * 70 - s.x, ad = Math.abs(d); if (ad > 12) { s.f = d < 0 ? -1 : 1; s.x += s.f * Math.min(sp * dt, ad - 10); s.mv = 1; } else s.f = o.face; }""",
"""    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = SUM_SPD(w[0]); s.mv = 0;
    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(sp * dt, ad - w[1]); s.mv = 1; } }""")
rep("""  const SUM_FLY = { phoenix: 1,""", """  const SUM_SPD = v => clamp(v * 0.6, 38, 70);   // slow and heavy on purpose
  // fly toward a point at a slow, steady speed
  function sumGlide(s, tx, ty, dt) { const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy), st = Math.min(d, 75 * dt); if (d > 0.5) { s.x += dx / d * st; s.y += dy / d * st; } s.mv = d > 6 ? 1 : 0; }
  const SUM_FLY = { phoenix: 1,""")
rep("""      if (s.kind === 'phoenix') { s.mv = 1; const pt = sumTarget(s); if (pt) { const tx = pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, ty = pt.y - 70 + Math.sin(s.t * 3) * 6, k = 1 - Math.exp(-2.5 * dt); s.f = tx > s.x ? 1 : -1; s.x += (tx - s.x) * k; s.y += (ty - s.y) * k; } else { s.x = Q.cam.x + VW / 2 + Math.sin(s.t * 0.9) * (VW * 0.42); s.y = Q.cam.y + 46 + Math.sin(s.t * 2) * 6; s.f = Math.cos(s.t * 0.9) > 0 ? 1 : -1; } }
      else if (fly) { const dr = sumTarget(s), sd0 = dr ? (dr.x + dr.w / 2 < s.x ? -1 : 1) : o.face, tx = dr ? dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130) : o.x + 4 + o.face * 80, ty = dr ? dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6 : o.y - 46 + Math.sin(s.t * 2) * 4, k = 1 - Math.exp(-3 * dt); s.mv = Math.abs(tx - s.x) > 6 ? 1 : 0; s.x += (tx - s.x) * k; s.y += (ty - s.y) * k; s.f = sd0; }""",
"""      if (s.kind === 'phoenix') { const pt = sumTarget(s); if (pt) { s.f = pt.x + pt.w / 2 > s.x ? 1 : -1; sumGlide(s, pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, pt.y - 70 + Math.sin(s.t * 3) * 6, dt); s.mv = 1; } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 6 * dt; } }
      else if (fly) { const dr = sumTarget(s); if (dr) { const sd0 = dr.x + dr.w / 2 < s.x ? -1 : 1; s.f = sd0; sumGlide(s, dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130), dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6, dt); } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 5 * dt; } }""")

# ---------- life cycle: evolve at 10 hits or 15 s, Ancient ultimate over the whole screen, then dissolve ----------
rep("""      if (s.dying > 0) { s.dying -= dt;""", """      if (s.dying > 0) { if (Math.random() < 0.8) emit(s.x + rr(-24, 24), s.y - rr(0, 70), 1, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#ffffff'], sp0: 6, sp1: 30, grav: -60, l0: 0.5, l1: 1 }); s.dying -= dt;""")
rep("""      if (s.life <= 0 && s.evo && s.stage === 1) evolveSummon(s);""", """      if (s.evo && s.stage === 1 && ((s.hits || 0) >= 10 || s.t >= 15)) evolveSummon(s);
      if (s.stage === 1 && !s.evo && s.life <= 0.9) { sumDissolve(s, 0.8); continue; }   // short summons (pet forms) also fade out with their death animation
      if (s.stage === 2) { sumUltTick(s, s.owner || P, dt); continue; }""")
rep("""  function evolveSummon(s) {
    s.stage = 2; s.life = 24; s.max = 24; s.hpMax = s.hp = sumHp(2); s.inv = 1; s.atkT = 0.5; s.cd = 0.3;""", """  function evolveSummon(s) {
    s.stage = 2; s.life = 30; s.max = 30; s.hpMax = s.hp = sumHp(2); s.inv = 99; s.atkT = 0.5; s.cd = 0.3; s.mv = 0; s.ultT = 1.1; s.ultN = 3;""")
rep("""    Q.msg = sv('Your summon evolves into its final form!', 'Triệu hồi của bạn đã tiến hóa lên cấp cuối!'); Q.msgT = 3.5;
  }""", """    Q.msg = sv('Your summon evolves into its final form!', 'Triệu hồi của bạn đã tiến hóa lên cấp cuối!'); Q.msgT = 3.5;
  }
  // the Ancient form's ultimate: three waves that hit every enemy on screen, themed per summon
  const SUM_ULT = { phoenix: 'fire', dragonking: 'fire', dragonform: 'fire', sunemperor: 'fire', ninetail: 'fire', frostgiant: 'ice', seagoddess: 'ice', skywhale: 'ice', stormgod: 'storm', thunderkirin: 'storm', valkyrie: 'storm' };
  const ULT_NAME = { fire: ['FIRESTORM!', 'BÃO LỬA!'], ice: ['BLIZZARD!', 'BÃO BĂNG!'], storm: ['THUNDERSTORM!', 'BÃO SẤM!'], star: ['METEOR STORM!', 'BÃO SAO BĂNG!'] };
  function sumDissolve(s, d) { s.dying = s.dieMax = d; s.life = Math.max(s.life, d + 0.2); s.mv = 0; s.inv = 99; Snd.play('poof'); emit(s.x, s.y - 30, 30, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 120, grav: -40 }); }
  function sumUltTick(s, o, dt) {
    s.mv = 0; s.ultT -= dt; const th = SUM_ULT[s.kind] || 'star';
    if (s.ultT > 0) { if (s.ultN === 3 && Math.random() < 0.7) emit(s.x + rr(-40, 40), s.y - rr(0, 90), 1, { col: ['#ffd34e', '#ffffff'], sp0: 10, sp1: 40, grav: -80, l0: 0.3, l1: 0.6 }); return; }
    if (s.ultN <= 0) { pop(s.x, s.y - 80, sv('Fades away...', 'Tan biến...'), '#cfe8ff'); sumDissolve(s, 1.3); return; }
    if (s.ultN === 3) { pop(s.x, s.y - 100, sv(ULT_NAME[th][0], ULT_NAME[th][1]), '#ffd34e'); Snd.play('relic'); }
    s.ultN--; s.ultT = s.ultN > 0 ? 0.6 : 0.9; s.atkT = 0.35;
    const cx = Q.cam.x, cy = Q.cam.y, dmg = Math.round((10 + baseDmg()) * 1.8), G = Q.G;
    Q.shake = Math.max(Q.shake, 0.7); G.flash = Math.max(G.flash || 0, 0.22); Snd.play(th === 'storm' ? 'thunder' : 'explode');
    addRing(s.x, s.y - 30, th === 'ice' ? '#bfefff' : th === 'storm' ? '#9fe8ff' : '#ffd34e', 260, 0.7);
    const col = { fire: ['#ff7a2a', '#ffd34e'], ice: ['#bfefff', '#ffffff'], storm: ['#9fe8ff', '#ffe44e'], star: ['#ffe08a', '#cfe8ff'] }[th];
    for (let i = 0; i < 12; i++) { const x = cx + (i + Math.random()) * VW / 12; shootG({ x, y: cy - 10, vx: th === 'ice' ? 0 : rr(-60, 60), vy: 520, life: 1.1, dmg: 1, expl: th === 'ice' ? 0 : 22, shape: th === 'fire' ? 'fire' : th === 'ice' ? 'ice' : 'meteor', sz: 5, col: col[0], trail: col[1], quiet: true }); }
    for (const e of foes()) {
      if (e.x + e.w < cx - 20 || e.x > cx + VW + 20 || e.y + e.h < cy - 40 || e.y > cy + VH + 40) continue;   // only what is on screen
      if (th === 'storm') zap(e.x + e.w / 2, cy - 6, e.x + e.w / 2, e.y + e.h / 2);
      dmgFoe(e, dmg, true, true); emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: [col[0], '#fff'], sp0: 30, sp1: 140 });
      if (th === 'ice') e.slowT = Math.max(e.slowT || 0, 3); if (th === 'fire') e.burnT = Math.max(e.burnT || 0, 3);
      if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 0.8);
    }
  }""")
# count attacks that land on the locked target (fast attackers count as part of a hit)
rep("""      const cd0 = s.cd;""", """      const cd0 = s.cd, tg0 = sumTarget(s);""")
rep("""      if (s.cd > cd0 + 0.001 && s.kind !== 'aegis') { s.atkT = 0.35;""", """      if (s.cd > cd0 + 0.001 && tg0 && Math.abs(tg0.x + tg0.w / 2 - s.x) < 460) s.hits = (s.hits || 0) + Math.min(1, s.cd / 0.8) * (tg0.isBoss ? 1 : 0.6);
      if (s.cd > cd0 + 0.001 && s.kind !== 'aegis') { s.atkT = 0.35;""")
rep("""s.dying = 0.8; s.life = Math.max(s.life, 0.9); emit(""", """s.dying = s.dieMax = 0.8; s.life = Math.max(s.life, 0.9); emit(""")

# ---------- animator: 10 fps strips, death / dissolve plays once, then fades ----------
rep("fi = Math.min(meta.n - 1, Math.floor((1 - s.dying / 0.8) * meta.n)); }", "fi = Math.min(meta.n - 1, Math.floor((1 - s.dying / (s.dieMax || 0.8)) * meta.n)); }")
rep("fi = Math.floor(s.t * 11) % meta.n; }", "fi = Math.floor(s.t * SUM_FPS) % meta.n; }")
rep("fi === Math.floor(s.t * 11) % n ?", "fi === Math.floor(s.t * SUM_FPS) % n ?")
rep("  function drawSumArt(s, x, y, a) {", "  const SUM_FPS = 10;   // pixel-art strips play at a fixed 10 fps (never at the 60 fps game rate)\n  function drawSumArt(s, x, y, a) {")
rep("const a = Math.min(1, s.t / 0.45, s.life / 0.6), sp = summonSprite(s.kind)", "const a = Math.min(1, s.t / 0.45, s.life / 0.6, s.dying > 0 ? clamp(s.dying / (s.dieMax || 0.8) * 1.6, 0, 1) : 1), sp = summonSprite(s.kind)")
# the HUD shows how close the summon is to its Ancient form
rep("""    if (s.hpMax && !s.dying) { const bw = s.stage === 2 ? 44 : 32, by = Math.round(top) - 8;""", """    if (s.evo && s.stage === 1 && !s.dying) { const bw = 32, by = Math.round(top) - 12, k = clamp(Math.max((s.hits || 0) / 10, s.t / 15), 0, 1); g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 3); g.fillStyle = '#ffd34e'; g.fillRect(x - bw / 2, by, Math.round(bw * k), 1); }
    if (s.hpMax && !s.dying) { const bw = s.stage === 2 ? 44 : 32, by = Math.round(top) - 8;""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
