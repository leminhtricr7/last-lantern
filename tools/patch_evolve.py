import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) >= 1, 'MISSING: ' + a[:100]
    s = s.replace(a, b, n)

# ---------- 0) enemies / bosses can hit summons (not traps) ----------
lines = s.split('\n')
enemy_line = [i for i, l in enumerate(lines) if "hitPl({ x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 }" in l]
assert len(enemy_line) == 1
lines[enemy_line[0]] = lines[enemy_line[0]].replace('hitPl(', 'hitPlE(', 1)
boss_keys = ["hitPl({ x: b.x + 6, y: b.y + 6, w: b.w - 12, h: b.h - 8 }", "hitPl({ x: b.x - 30, y: b.y + b.h - 16", "if (!b.hide) hitPl({ x: b.x + 3, y: b.y + 3", "hitPl({ x: d.x + 6, y: d.y + 4", "else hitPl(box, () => hurtPlayer(z.dmg", "if (!p.dead) hitPl(hb, q =>", "hitPl({ x: b.tx - b.w / 2 - 6"]
for k in boss_keys:
    idx = [i for i, l in enumerate(lines) if k in l]
    assert len(idx) >= 1, 'MISSING boss hit: ' + k
    for i in idx:
        lines[i] = lines[i].replace('hitPl(', 'hitPlB(', 1)
s = '\n'.join(lines)

rep("  function hitPl(box, fn) {", """  // enemies and bosses also hit the player's summons (traps and hazards do not)
  function hitSums(box, boss) {
    const G = Q.G; if (!G || !G.sums) return false; let any = false;
    for (const sm of G.sums) {
      if (sm.life <= 0 || sm.hp <= 0 || sm.inv > 0 || sm.t < 0.6 || sm.kind === 'clones') continue;
      const k = sm.stage === 2 ? 1.3 : 1, gi = GIANT[sm.kind], w = (gi ? (gi.small ? 20 : 34) : 44) * k, h = (gi ? (gi.small ? 52 : 96) : 26) * k;
      const sb = { x: sm.x - w / 2, y: gi ? sm.y - h : sm.y - h / 2, w, h };
      if (!ov(box, sb)) continue;
      sm.hp -= Math.round((boss ? 20 : 9) * (1 + 0.25 * LDIFF(Q.li))); sm.inv = 0.55; sm.hurtT = 0.2; any = true;
      emit(sm.x, sb.y + h / 2, 8, { col: [(gi || BEAST[sm.kind]).glow, '#fff'], sp0: 30, sp1: 110 }); Snd.play('hit');
    }
    return any;
  }
  function hitPlE(box, fn) { hitSums(box, false); return hitPl(box, fn); }
  function hitPlB(box, fn) { hitSums(box, true); return hitPl(box, fn); }
  function hitPl(box, fn) {""")

# ---------- 1) summons: 30s fight, then evolve into the final form ----------
rep("  function spawnSummon(kind, life, owner) {\n    const o = owner || Q.P, G = Q.G; if (!G.sums) G.sums = [];\n    G.sums.push({ kind, life: life || 7, max: life || 7, t: 0,",
    "  const sumHp = st => Math.round((st === 2 ? 240 : 80) * (1 + 0.15 * LDIFF(Q.li)));\n  function spawnSummon(kind, life, owner, evo) {\n    const o = owner || Q.P, G = Q.G; if (!G.sums) G.sums = [];\n    G.sums.push({ evo: !!evo, stage: 1, hp: sumHp(1), hpMax: sumHp(1), inv: 0, kind, life: life || 7, max: life || 7, t: 0,")
rep("spawnSummon(ITEM[id].st.summon, 7, Q.P); any = true; }", "spawnSummon(ITEM[id].st.summon, 30, Q.P, true); any = true; }")
rep("      s.t += dt; s.life -= dt; s.cd -= dt; if (s.atkT > 0) s.atkT -= dt;\n",
    """      s.t += dt; s.life -= dt; s.cd -= dt; if (s.atkT > 0) s.atkT -= dt; if (s.inv > 0) s.inv -= dt; if (s.hurtT > 0) s.hurtT -= dt;
      if (s.hp <= 0 && s.life > 0) { s.life = 0; emit(s.x, s.y - 30, 24, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 30, sp1: 140 }); Snd.play('poof'); pop(s.x, s.y - 60, sv('Defeated', 'Bị hạ gục'), '#ff7a7a'); continue; }
      if (s.life <= 0 && s.evo && s.stage === 1) evolveSummon(s);
      const sdm = s.stage === 2 ? 1.8 : 1;
""")
rep("    const sd = n => n + baseDmg();\n    for (const s of G.sums) {", "    let sdm = 1; const sd = n => Math.round((n + baseDmg()) * sdm);\n    for (const s of G.sums) {")
rep("      const sdm = s.stage === 2 ? 1.8 : 1;\n", "      sdm = s.stage === 2 ? 1.8 : 1;\n")
rep("      if (s.cd > cd0 + 0.001) s.atkT = 0.35;", "      if (s.cd > cd0 + 0.001) { s.atkT = 0.35; if (s.stage === 2) s.cd = cd0 + (s.cd - cd0) * 0.72; }")
rep("    G.sums = G.sums.filter(s => s.life > 0);", "    G.sums = G.sums.filter(s => s.life > 0 && s.hp > 0);")
rep("  function summonItems() {", """  function evolveSummon(s) {
    s.stage = 2; s.life = 24; s.max = 24; s.hpMax = s.hp = sumHp(2); s.inv = 1; s.atkT = 0.5; s.cd = 0.3;
    const info = GIANT[s.kind] || BEAST[s.kind], x = s.x, y = s.y;
    Snd.play('relic'); Snd.play('boom'); Q.shake = Math.max(Q.shake, 0.6); Q.G.flash = Math.max(Q.G.flash || 0, 0.3);
    addRing(x, y - 30, info.glow, 150, 0.8); addRing(x, y - 30, '#fff', 90, 0.5); emit(x, y - 30, 60, { col: [info.glow, '#fff', '#ffd34e'], sp0: 40, sp1: 200 });
    pop(x, y - 90, sv('FINAL FORM: ' + LN(info.name) + ' (Ancient)!', 'TIẾN HÓA: ' + LN(info.name) + ' Cổ Đại!'), '#ffd34e');
    Q.msg = sv('Your summon evolves into its final form!', 'Triệu hồi của bạn đã tiến hóa lên cấp cuối!'); Q.msgT = 3.5;
  }
  function summonItems() {""")
# stage 2 summons rush the boss and move faster
rep("    const t = nearestFoe(s.x, s.y - 30, 640);\n    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(w[0] * dt, ad - w[1]); s.mv = 1; } }",
    "    const bt = s.stage === 2 && Q.boss && !Q.boss.dead && Q.arenaSealed && Q.boss.st !== 'intro' && !Q.boss.hide ? Q.boss : null, t = bt || nearestFoe(s.x, s.y - 30, 640), sp = w[0] * (s.stage === 2 ? 1.3 : 1);\n    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(sp * dt, ad - w[1]); s.mv = 1; } }")
# drawing: bigger final form, HP bar
rep("      const giant = !!GIANT[s.kind], sc = giant ? (GIANT[s.kind].small ? 1.1 : 2) : 1.5, rise =", "      const giant = !!GIANT[s.kind], sc = (giant ? (GIANT[s.kind].small ? 1.1 : 2) : 1.5) * (s.stage === 2 ? 1.3 : 1), rise =")
rep("      if (Math.random() < 0.4) emit(s.x + rr(-20, 20), s.y - rr(0, 80), 1, { col: [info.glow, '#fff'], sp0: 3, sp1: 14, grav: -20, l0: 0.4, l1: 0.9 });\n    }",
    """      if (Math.random() < (s.stage === 2 ? 0.8 : 0.4)) emit(s.x + rr(-20, 20), s.y - rr(0, 80), 1, { col: [s.stage === 2 ? '#ffd34e' : info.glow, '#fff'], sp0: 3, sp1: 14, grav: -20, l0: 0.4, l1: 0.9 });
      if (s.hurtT > 0) { g.globalAlpha = 0.4; g.fillStyle = '#ff3a3a'; g.fillRect(x - 14, y - 70, 28, 70); g.globalAlpha = 1; }
      if (s.hpMax && (s.stage === 2 || s.hp < s.hpMax)) { const bw = s.stage === 2 ? 44 : 32, by = y - Math.round((giant ? 58 : 36) * sc) - 8; g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = '#6a1a1a'; g.fillRect(x - bw / 2, by, bw, 3); g.fillStyle = s.stage === 2 ? '#ffd34e' : '#7ed957'; g.fillRect(x - bw / 2, by, Math.round(bw * clamp(s.hp / s.hpMax, 0, 1)), 3); }
      if (s.stage === 2) { const R2 = 90 + Math.sin(s.t * 6) * 6; g.globalCompositeOperation = 'lighter'; const g2 = g.createRadialGradient(x, y - 50, 0, x, y - 50, R2); g2.addColorStop(0, 'rgba(255,211,78,.22)'); g2.addColorStop(1, 'rgba(255,211,78,0)'); g.fillStyle = g2; g.fillRect(x - R2, y - 50 - R2, R2 * 2, R2 * 2); g.globalCompositeOperation = 'source-over'; }
    }""")

# ---------- 2) tougher bosses: more health, and each blood phase (75/50/25%) makes the boss angrier ----------
rep("    const c = BOSS[Q.li], hp = Math.round(c.hp * (1 + 0.02 * totalShards()));", "    const c = BOSS[Q.li], hp = Math.round(c.hp * 1.7 * (1 + 0.02 * totalShards()));")
rep("    const c = forms[0], hp = Math.round(c.hp * (1 + 0.02 * totalShards()));", "    const c = forms[0], hp = Math.round(c.hp * 1.5 * (1 + 0.02 * totalShards()));")
rep("    const pct = b.hp / b.max;\n    if (!b.t1 && pct < 0.66)", """    const pct = b.hp / b.max;
    if (b.hp > 0) for (const [k, th] of [['p1', 0.75], ['p2', 0.5], ['p3', 0.25]]) if (!b[k] && pct < th) { b[k] = 1; bossPhase(b, ++b.pp || (b.pp = 1)); break; }
    if (!b.t1 && pct < 0.66)""")
rep("  function hurtBoss(b, dmg, pierce, quiet) {", """  // every blood phase: a roar, its own minions, a short shield, and a harder-hitting boss
  function bossPhase(b, n) {
    b.pp = n; b.invul = Math.max(b.invul, 1.1); b.st = 'rec'; b.timer = 1.1; b.sk = null;
    if (n >= 2) b.shield = Math.max(b.shield || 0, 2.2);
    Q.shake = 1; Q.freeze = 0.12; Snd.creature(Q.li, 'alert', true); Snd.play('boom'); addRing(b.x + b.w / 2, b.y + b.h / 2, bpc(), 130, 0.7);
    emit(b.x + b.w / 2, b.y + b.h / 2, 40, { col: [bpc(), '#fff', '#ff3a3a'], sp0: 40, sp1: 180 });
    Q.msg = sv('The boss is enraged! Phase ' + (n + 1) + '/4', 'Boss nổi giận! Giai đoạn ' + (n + 1) + '/4'); Q.msgT = 3;
    if (b.cfg && b.cfg.minion) { let alive = Q.ents.filter(e => !e.dead).length; for (let i = 0; i < 2 + n && alive < 7; i++, alive++) { const m = makeEnemy(b.cfg.minion, b.x + b.w / 2 + (i - 1) * 34, b.y + b.h - 4, { minion: true }); if (!m.fly) m.vy = -150; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: bpc() }); } }
  }
  function hurtBoss(b, dmg, pierce, quiet) {""")
rep("    b.fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7;", "    b.fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7 + 0.1 * (b.pp || 0);")
rep("b.phase = 0; b.t1 = b.t2 = 0;", "b.phase = 0; b.t1 = b.t2 = 0; b.p1 = b.p2 = b.p3 = 0; b.pp = 0;")
rep("if (!b.hide) hitPlB({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer(Q.li >= 3 ? 2 : 1, cxm));", "if (!b.hide) hitPlB({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer((Q.li >= 3 ? 2 : 1) + ((b.pp || 0) >= 2 ? 1 : 0), cxm));")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
