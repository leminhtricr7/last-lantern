import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) >= 1, 'MISSING: ' + a[:100]
    s = s.replace(a, b, cnt)

# --- globals: co-op flags, per-player max hp / damage ---
rep("  const writeSave = () => { if (DEMO) return;", "  let coop = null, inSwap = 0;   // online co-op session (see ONLINE CO-OP below); inSwap > 0 while a guest's hero is being simulated\n  const writeSave = () => { if (DEMO || inSwap) return;")
rep("  const maxHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP();",
    "  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP();\n  const maxHP = () => (coop && Q && Q.P && Q.P.mhp) || baseHP();")
rep("  const baseDmg = () => (Q && Q.G && Q.G.powerT > 0 ? 2 : 0) + 1 +", "  const baseDmg = () => Math.max(1, (Q && Q.P && Q.P.hdmg || 0) + (Q && Q.G && Q.G.powerT > 0 ? 2 : 0) + 1 +")
rep("((ITEM[save.inv.pet] || { st: {} }).st.role === 'rainbow' ? 1 : 0);\n  const swordDmg", "((ITEM[save.inv.pet] || { st: {} }).st.role === 'rainbow' ? 1 : 0));\n  const swordDmg")
rep("cont: { en: 'Continue', vi: 'Tiếp tục' },", "cont: { en: 'Continue', vi: 'Tiếp tục' }, coopT: { en: 'Online Co-op (5 players)', vi: 'Co-op online (5 người)' },")

# --- input: hero skill on R / RB ---
rep("    act.muteP = pressed.KeyM;", "    act.skillP = any(pressed, ['KeyR']) || gpP('rb');\n    act.muteP = pressed.KeyM;")
rep("act.upP = act.downP = false; }", "act.upP = act.downP = act.skillP = false; }")

# --- particles made on the host are replayed on guests ---
rep("  function emit(x, y, n, o) {\n", "  function emit(x, y, n, o) {\n    if (coop && coop.role === 'host' && scene === 'play' && coop.ev.length < 400 && (n >= 2 || Math.random() < 0.25)) coop.ev.push(['e', Math.round(x), Math.round(y), n, o]);\n")

# --- hurting: downed heroes, no screen freeze for other players' hits ---
rep("    const P = Q.P;\n    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play'", "    const P = Q.P;\n    if (P.down) return false;\n    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play'")
rep("    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;", "    P.hp -= n; P.inv = 1.2; if (!coop || P === Q.me) { Q.freeze = 0.07; Q.shake = 0.25; }")
rep("      if (tryRevive()) return true;\n", "      if (tryRevive()) return true;\n      if (coop) { coopDown(P); return true; }\n")

# --- player: hero speed + skill ---
rep("(1 + aSt('speed') + pSt('speed'));", "(1 + aSt('speed') + pSt('speed') + (P.hspd || 0));")
rep("    P.throwCd -= dt;\n", "    P.throwCd -= dt;\n    if (P.hero) { P.skCd = (P.skCd || 0) - dt; if (act.skillP && P.skCd <= 0 && P.dash <= 0) heroSkill(P); }\n")

# --- enemies chase the nearest hero and only sleep when nobody is near ---
rep("  function updateEnemies(dtG) {\n    const P = Q.P, cx = Q.cam.x + VW / 2;", "  function updateEnemies(dtG) {\n    const P0 = Q.P, cx = Q.cam.x + VW / 2;")
rep("      if (Math.abs(e.x - cx) > 260) continue;", "      if (coop ? !Q.players.some(p => Math.abs(e.x - p.x) < 260) : Math.abs(e.x - cx) > 260) continue;\n      const P = coop ? nearPl(e) : P0;")
rep("ov(P, { x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 })) hurtPlayer(e.dmg || 1, e.x + e.w / 2);", "true) hitPl({ x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 }, () => hurtPlayer(e.dmg || 1, e.x + e.w / 2));")

# --- every other way of getting hurt checks all heroes ---
rep("if (Math.hypot(P.x + 4 - c.x, P.y + 7 - c.y) < b.w / 2 + 64) { hurtPlayer(1, c.x); P.vx = (P.x + 4 < c.x ? -1 : 1) * 190; P.vy = -150; }",
    "for (const q of allPl()) if (Math.hypot(q.x + 4 - c.x, q.y + 7 - c.y) < b.w / 2 + 64) asP(q, () => { hurtPlayer(1, c.x); q.vx = (q.x + 4 < c.x ? -1 : 1) * 190; q.vy = -150; });")
rep("    if (!b.hide && ov(P, { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 })) hurtPlayer(Q.li >= 3 ? 2 : 1, cxm);",
    "    if (!b.hide) hitPl({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer(Q.li >= 3 ? 2 : 1, cxm));")
rep("    if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 }) && (d.def.kind !== 'young' || (d.st === 'act' && d.sk === 'dive'))) hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x);",
    "    if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && (d.def.kind !== 'young' || (d.st === 'act' && d.sk === 'dive'))) hitPl({ x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 }, () => hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x));")
rep("if (ov(P, box) && z.tick <= 0) { z.tick = 0.9; hurtPlayer(1, z.x + z.w / 2, true); }", "if (z.tick <= 0 && allPl().some(q => ov(q, box))) { z.tick = 0.9; hitPl(box, () => hurtPlayer(1, z.x + z.w / 2, true)); }")
rep("else if (z.type === 'goo') { if (ov(P, box)) P.slow = Math.max(P.slow || 0, 0.5); }", "else if (z.type === 'goo') hitPl(box, q => { q.slow = Math.max(q.slow || 0, 0.5); });")
rep("      else if (ov(P, box)) hurtPlayer(z.dmg, z.x + z.w / 2, false, (z.type === 'lava' || z.type === 'meteor' || z.type === 'sweep' || z.type === 'beam') ? 'fire' : '');",
    "      else hitPl(box, () => hurtPlayer(z.dmg, z.x + z.w / 2, false, (z.type === 'lava' || z.type === 'meteor' || z.type === 'sweep' || z.type === 'beam') ? 'fire' : ''));")
rep("      if (ov(P, hb)) { if (hurtPlayer(p.dmg || 1, p.x, false, p.fl ? 'fire' : '')) { p.dead = true; if (p.status) for (const k in p.status) P[k] = Math.max(P[k] || 0, p.status[k]); } }",
    "      if (!p.dead) hitPl(hb, q => { if (!p.dead && hurtPlayer(p.dmg || 1, p.x, false, p.fl ? 'fire' : '')) { p.dead = true; if (p.status) for (const k in p.status) q[k] = Math.max(q[k] || 0, p.status[k]); } });")
rep("if (t.up && ov(P, { x: t.x - t.w * 8 + 1, y: t.y - 9, w: t.w * 16 - 2, h: 9 })) hurtPlayer(1, t.x);", "if (t.up) hitPl({ x: t.x - t.w * 8 + 1, y: t.y - 9, w: t.w * 16 - 2, h: 9 }, () => hurtPlayer(1, t.x));")
rep("if (ov(P, { x: t.x - 5, y: t.y - 40, w: 10, h: 40 })) hurtPlayer(1, t.x);", "hitPl({ x: t.x - 5, y: t.y - 40, w: 10, h: 40 }, () => hurtPlayer(1, t.x));")
rep("if (ov(P, { x: t.sx - 6, y: t.y - 15, w: 12, h: 13 })) hurtPlayer(1, t.sx);", "hitPl({ x: t.sx - 6, y: t.y - 15, w: 12, h: 13 }, () => hurtPlayer(1, t.sx));")

# --- main update: guests' heroes, boss picks a target, lobby instead of story scenes ---
rep("    if (st === 'bossintro') { updateBoss(dt);", "    if (st === 'bossintro') { asP(coop ? bossTgt() : Q.P, () => updateBoss(dt));")
rep("    updatePlayer(dt);\n    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }",
    "    if (!Q.P.down) updatePlayer(dt);\n    if (coop) coopHostPlayers(dt);\n    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }")
rep("updateEnemies(edt); updateBoss(bdt); updateDragon(ddt);", "updateEnemies(edt); { const tg = coop ? bossTgt() : Q.P; asP(tg, () => { updateBoss(bdt); updateDragon(ddt); }); }")
rep("      if (Q.stateT > 0.8 && act.okP) { Snd.play('ok'); respawn(); }\n      else if (Q.stateT > 0.8 && act.backP) toScene('map');",
    "      if (Q.stateT > 0.8 && act.okP) { Snd.play('ok'); if (coop) Q.P = Q.me; respawn(); if (coop) coopRespawn(); }\n      else if (Q.stateT > 0.8 && act.backP) { if (coop) coopBackToLobby(); else toScene('map'); }")
rep("if (st === 'complete') { updateParticles(dt); if (Q.stateT > 1 && act.okP) { Snd.play('ok'); if (Q.li >= 6)", "if (st === 'complete') { updateParticles(dt); if (Q.stateT > 1 && act.okP) { Snd.play('ok'); if (coop) { coopBackToLobby(); return; } if (Q.li >= 6)")
rep("else if (Q.menu === 2) { toScene('map'); } else toScene('title');", "else if (coop) coopBackToLobby(); else if (Q.menu === 2) { toScene('map'); } else toScene('title');")

# --- camera follows a living friend while you are down ---
rep("  function updateCam(dt) {\n    const P = Q.P,", "  function updateCam(dt) {\n    const P = (coop && Q.P.down && Q.players && Q.players.find(p => !p.down)) || Q.P,")

# --- drawing every hero ---
rep("  function drawPlayer(camX, camY) {\n    const P = Q.P;", "  function drawPlayer(camX, camY) {\n    if (coop && Q.players && Q.players.length) { for (const p of Q.players) { if (p.down) drawDown(p, camX, camY); else asP(p, () => drawPlayer1(camX, camY)); } return; }\n    drawPlayer1(camX, camY);\n  }\n  function drawPlayer1(camX, camY) {\n    const P = Q.P;")
rep("    const av = armorVis(save.inv.armor), swp = av ? av.sw : {};", "    const hh = P.hero && HERO[P.hero], av = hh || armorVis(save.inv.armor), swp = av ? av.sw : {};")
rep("    if (av) drawArmorFront(av, x, bot);\n  }", "    if (av) drawArmorFront(av, x, bot);\n    if (hh && hh.hat) drawHat(hh, x, bot, P.face);\n    if (coop) drawCoopTag(P, x, bot);\n  }")
rep("    if (Q.state !== 'talk') drawHUD();\n", "    if (Q.state !== 'talk') drawHUD();\n    if (coop && Q.state !== 'talk') drawCoopHUD();\n")

# --- scenes: title entry, lobby scene, network each frame ---
rep("    it.push({ k: 'shopT', fn: () => { shopFrom = 'title'; toScene('shop'); } });", "    it.push({ k: 'shopT', fn: () => { shopFrom = 'title'; toScene('shop'); } });\n    it.push({ k: 'coopT', fn: () => { coopUI.ph = 'menu'; coopUI.sel = 0; coopUI.msg = ''; toScene('coop'); } });")
rep("    if (s === 'cutscene') startCut();", "    if (s === 'cutscene') startCut();\n    if (s === 'coop') { Q = null; Snd.music('title', TITLE_MUSIC); }")
rep("    readInput();\n", "    readInput();\n    coopClientInput();\n")
rep("        if (scene === 'play') updatePlay(sub);", "        if (scene === 'play') { if (coop && coop.role === 'client') coopClientTick(sub); else updatePlay(sub); }\n        else if (scene === 'coop') updateCoop(sub);")
rep("      if (fadeIn > 0) fadeIn = Math.max(0, fadeIn - dt / 0.25);\n", "      if (fadeIn > 0) fadeIn = Math.max(0, fadeIn - dt / 0.25);\n      if (coop && coop.role === 'host' && scene === 'play') coopHostNet(dt);\n")
rep("    else if (scene === 'cutscene' && cut) drawCut();", "    else if (scene === 'cutscene' && cut) drawCut();\n    else if (scene === 'coop') drawCoop();")

# --- the co-op module itself ---
blk = io.open('tools/coop_block.txt', encoding='utf-8').read()
blk = blk.replace("  const SKIP = { cfg: 0, atkHit: 1, hit: 1, later: 1, L: 1, tr: 1, inp: 1, edge: 1, safe: 1, fn: 1, it: 0 };\n  delete SKIP.cfg; delete SKIP.it;\n", "  const SKIP = { atkHit: 1, hit: 1, later: 1, L: 1, inp: 1, edge: 1, safe: 1, fn: 1, _seen: 1 };\n")
rep("  function frame(now) {", blk + "  function frame(now) {")
rep("get scene() { return scene; },", "get scene() { return scene; }, get coop() { return coop; }, NET, coopUI, HEROES, setHero, heroSkill,")
io.open(p, 'w', encoding='utf-8').write(s)

h = io.open('index.html', encoding='utf-8').read()
if 'heroes.js' not in h:
    h = h.replace('<script src="src/levels.js"></script>', '<script src="src/levels.js"></script>\n<script src="src/heroes.js"></script>\n<script src="src/vendor/peerjs.min.js"></script>\n<script src="src/net.js"></script>')
    io.open('index.html', 'w', encoding='utf-8').write(h)
print('ok')
