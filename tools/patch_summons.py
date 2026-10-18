import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert a in s, 'MISSING: ' + a[:100]
    s = s.replace(a, b, n)

# key T (gamepad right stick click) summons
rep("    act.shopP = any(pressed, ['KeyB', 'KeyI']) || gpP('back');", "    act.shopP = any(pressed, ['KeyB', 'KeyI']) || gpP('back');\n    act.sumP = any(pressed, ['KeyT']) || gpP('r3');")
rep("gb.start = b(9); gb.back = b(8);", "gb.start = b(9); gb.back = b(8); gb.r3 = b(11);")
rep("act.skillP = act.shopP = false; }", "act.skillP = act.shopP = act.sumP = false; }")
rep("    if (P.hero) { P.skCd = (P.skCd || 0) - dt; if (act.skillP && P.skCd <= 0 && P.dash <= 0) heroSkill(P); }\n",
    "    if (P.hero) { P.skCd = (P.skCd || 0) - dt; if (act.skillP && P.skCd <= 0 && P.dash <= 0) heroSkill(P); }\n    if (act.sumP) castSummons();\n")
# summons tick + draw
rep("    updateAllies(dt); updateBossDrops(dt);", "    updateAllies(dt); updateBossDrops(dt); updateSummons(dt);")
rep("    drawGearFx(camX, camY);\n", "    drawGearFx(camX, camY);\n    drawSummons(camX, camY);\n")
# divine special weapons
rep("    if (id === 'bow') { Snd.play('throw');", "    if (fireDivine(id, f, x, y)) { }\n    else if (id === 'bow') { Snd.play('throw');")
# stun and bouncing projectiles
rep("      if (p.poison) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }\n      if (!p.quiet) Snd.play('hit');",
    "      if (p.poison) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }\n      if (p.stun) { e.stunT = Math.max(e.stunT || 0, e.isBoss ? p.stun * 0.35 : p.stun); emit(e.x + e.w / 2, e.y - 2, 6, { col: ['#ffd34e', '#fff'], sp0: 10, sp1: 40 }); }\n      if (!p.quiet) Snd.play('hit');\n      if (p.bounces > 0) { p.bounces--; const nx = nearestFoe(p.x, p.y, 220, p.hit); if (nx) { const dx = nx.x + nx.w / 2 - p.x, dy = nx.y + nx.h / 2 - p.y, d = Math.hypot(dx, dy) || 1; p.vx = dx / d * 320; p.vy = dy / d * 320; p.life = Math.max(p.life, 1); p.boom = 0; addRing(p.x, p.y, '#ffd34e', 20, 0.25); continue; } }")
# projectile looks: scythe, chakram, giant meteor
rep("    else if (sh === 'spark') {", """    else if (sh === 'scythe') { g.save(); g.translate(x, y); g.rotate(p.rot || 0); g.strokeStyle = '#a15be0'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 7, 0.2, 2.6); g.stroke(); g.strokeStyle = '#e8d8ff'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 8, 0.3, 2.4); g.stroke(); g.fillStyle = '#5a3a5a'; g.fillRect(-1, -6, 2, 12); g.restore(); if (Math.random() < 0.5) emit(p.x, p.y, 1, { col: ['#7ed957', '#a15be0'], sp0: 3, sp1: 12, l0: 0.2, l1: 0.4 }); }
    else if (sh === 'chakram') { g.save(); g.translate(x, y); g.rotate(p.rot || 0); disc(g, 0, 0, 6, '#ffd34e'); disc(g, 0, 0, 3, '#14121f'); g.fillStyle = '#fff6c0'; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.fillRect(Math.round(Math.cos(a) * 7) - 1, Math.round(Math.sin(a) * 7) - 1, 2, 2); } g.restore(); }
    else if (sh === 'bigmeteor') { g.globalCompositeOperation = 'lighter'; disc(g, x, y, 16, 'rgba(255,120,40,.35)'); g.globalCompositeOperation = 'source-over'; disc(g, x, y, 11, '#5a2a1a'); disc(g, x, y, 9, '#ff7a2a'); disc(g, x - 2, y - 2, 5, '#ffd34e'); disc(g, x - 3, y - 3, 2, '#fff6c0'); }
    else if (sh === 'spark') {""")
# pet coin magnet for new pets, flying new pets
rep("(petRole() === 'coin' ? 2.2 :", "(petRole() === 'coin' || pSt('coin') ? 2.2 :")
rep("  const FLY_PET = { birdie: 1,", "  const FLY_PET = { wyrmling: 1, starwhale: 1, kitsune: 0, birdie: 1,")
# hide the pet while it is transformed
rep("    const pt = G.pet;\n    if (pt) {", "    const pt = G.pet;\n    if (pt && !(G.petForm > 0)) {")
# HUD: summon readiness
rep("      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a'); }",
    "      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a');\n      for (const id of summonItems()) { const cd = (G.sumCd && G.sumCd[id]) || 0, k = ITEM[id].st.summon; chip('T ' + sumName(k) + (cd > 0 ? ' ' + Math.ceil(cd) + 's' : sv(' READY', ' SẴN SÀNG')), cd > 0 ? '#8892aa' : '#ff4af0'); }\n      { const pe = petIt(); if (pe && pe.st.form) { const k = pe.st.form; chip(sumName(k) + ' ' + (G.petForm > 0 ? G.petForm.toFixed(1) : Math.max(0, Math.ceil(G.formCd === undefined ? 25 : G.formCd)) + 's'), G.petForm > 0 ? '#ff9a2a' : '#8892aa'); } } }")
# co-op: guests see the summons too
rep("  const SKIP = { atkHit: 1, hit: 1, later: 1, L: 1, inp: 1, edge: 1, safe: 1, fn: 1, bag: 1 };", "  const SKIP = { atkHit: 1, hit: 1, later: 1, L: 1, inp: 1, edge: 1, safe: 1, fn: 1, bag: 1, owner: 1 };")
rep("  const GLISTS = ['allies', 'pops', 'bolts', 'holes', 'torn'];", "  const GLISTS = ['allies', 'pops', 'bolts', 'holes', 'torn', 'sums', 'slashes'];")
blk = io.open('tools/summons_game.txt', encoding='utf-8').read()
rep("  function frame(now) {", blk + "  function frame(now) {")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
