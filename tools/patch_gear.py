import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) >= 1, 'missing: ' + a[:70]
    s = s.replace(a, b, cnt)
def between(start, end, new):
    global s
    a = s.index(start); b = s.index(end, a)
    s = s[:a] + new + s[b:]
def blk(name):
    return io.open('tools/' + name, encoding='utf-8').read()

# ---- save normalisation, stats ----
rep("  save.leek = !!save.leek;\n", """  save.leek = !!save.leek;
  if (!save.inv || typeof save.inv !== 'object') save.inv = {};
  save.inv.own = Array.isArray(save.inv.own) ? save.inv.own.filter(id => ITEM[id]) : [];
  if (save.inv.own.indexOf('iron') < 0) save.inv.own.unshift('iron');
  if (!Array.isArray(save.inv.w) || save.inv.w.length < 2) save.inv.w = ['iron', null];
  save.inv.w = save.inv.w.slice(0, 2).map(id => (ITEM[id] && save.inv.own.indexOf(id) >= 0) ? id : null);
  if (!ITEM[save.inv.armor] || save.inv.own.indexOf(save.inv.armor) < 0) save.inv.armor = null;
  if (!ITEM[save.inv.pet] || save.inv.own.indexOf(save.inv.pet) < 0) save.inv.pet = null;
  save.inv.gems = save.inv.gems | 0;
  if (save.leek && save.inv.own.indexOf('leek') < 0) { save.inv.own.push('leek'); save.inv.w[0] = 'leek'; }
  if (!save.inv.w.some(id => id && ITEM[id].type === 'sword')) save.inv.w[0] = 'iron';
""")
rep("  const maxHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0);\n  const swordDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0) + (save.leek ? 1 : 0);",
"""  const armHP = () => { const a = ITEM[save.inv.armor]; return a ? (a.st.hp || 0) : 0; };
  const maxHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP();
  const baseDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0) + ((ITEM[save.inv.pet] || { st: {} }).st.role === 'rainbow' ? 1 : 0);
  const swordDmg = () => baseDmg() + save.inv.w.reduce((m, id) => (ITEM[id] && ITEM[id].type === 'sword' ? Math.max(m, ITEM[id].st.dmg || 0) : m), 0);""")
rep("    newgame: { en: 'New Game', vi: 'Chơi mới' },", "    newgame: { en: 'New Game', vi: 'Chơi mới' }, shopT: { en: 'Shop & Inventory', vi: 'Cửa hàng & Kho đồ' },")

# ---- input ----
rep("gb.a = b(0); gb.b = b(1); gb.x = b(2); gb.y = b(3); gb.start = b(9); gb.lb = b(4); gb.rb = b(5); gb.rt = b(7);", "gb.a = b(0); gb.b = b(1); gb.x = b(2); gb.y = b(3); gb.start = b(9); gb.lb = b(4); gb.rb = b(5); gb.rt = b(7); gb.lt = b(6);")
rep("    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');\n", "    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');\n    act.atk2P = any(pressed, ['KeyH', 'KeyU']) || gpP('lt');\n")
rep("act.jumpP = act.atkP = act.throwP", "act.jumpP = act.atkP = act.atk2P = act.throwP")
rep("['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code)", "['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code)")
rep("{ k: 'KeyL', x: w - s * 2.9, y: h - s * 1.5, r: r * 0.8, l: '●' },", "{ k: 'KeyL', x: w - s * 2.9, y: h - s * 1.5, r: r * 0.8, l: '●' }, { k: 'KeyH', x: w - s * 2.3, y: h - s * 2.7, r: r * 0.85, l: 'H' },")
rep("    if (scene !== 'play' || (Q && (Q.state === 'pause'", "    if (scene === 'shop') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '→' });\n    if (scene !== 'play' || (Q && (Q.state === 'pause'")
# mouse
rep("      else if (inPlay && Q.state === 'shop') { const n = (SHOPS[Q.shopWho] || []).length + 1, i = menuHit(gx, gy, n, VW / 2, 96, 14, 110); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }\n      return;",
"      else if (inPlay && Q.state === 'shop') { const n = (SHOPS[Q.shopWho] || []).length + 1, i = menuHit(gx, gy, n, VW / 2, 96, 14, 110); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }\n      else if (scene === 'shop') shopMouse(gx, gy, false);\n      return;")
rep("      if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyL = true; } else if (inPlay && (Q.state === 'talk' || Q.state === 'tablet')) pressed.Escape = true;\n      return;\n    }",
"      if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyL = true; } else if (inPlay && (Q.state === 'talk' || Q.state === 'tablet')) pressed.Escape = true; else if (scene === 'shop') pressed.Escape = true;\n      return;\n    }\n    if (e.button === 1) { if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyH = true; } return; }")
rep("    else if (scene === 'story' || scene === 'ending') pressed.Enter = true;\n    else if (scene === 'map') {", "    else if (scene === 'story' || scene === 'ending') pressed.Enter = true;\n    else if (scene === 'shop') shopMouse(gx, gy, true);\n    else if (scene === 'map') {\n      if (near(gx, gy, VW - 36, 14, 34, 8)) { pressed.KeyB = true; return; }")

# ---- player basics ----
rep("ammo: save.ammo, sel: 0, keys: 0, throwCd: 0, shield: false };", "ammo: save.ammo, sel: 0, keys: 0, throwCd: 0, shield: false, sw: null, wcd: [0, 0], wmax: [1, 1] };")
rep("    if (!save.shards[li]) save.shards[li] = [0, 0, 0];\n    initEntities();", "    if (!save.shards[li]) save.shards[li] = [0, 0, 0];\n    initGear();\n    initEntities();")
rep("    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;\n    initEntities(); snapCam();", "    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;\n    resetGearFx();\n    initEntities(); snapCam();")

# ---- hurtPlayer ----
between("  function hurtPlayer(n, fromX, noKnock) {", "  function pitRecover() {", """  function hurtPlayer(n, fromX, noKnock, src) {
    const P = Q.P;
    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play' && Q.state !== 'bossplay') return false;
    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); thornsAndFx(); return false; }
    if (src !== 'pit') {
      if (src === 'fire' && aSt('fireImm')) { P.inv = 0.4; emit(P.x + 4, P.y + 7, 6, { col: ['#ff7a2a', '#ffd34e'], sp0: 10, sp1: 40 }); return false; }
      const dod = aSt('dodge');
      if (dod && Math.random() < dod) { P.inv = 0.6; Snd.play('whoosh'); emit(P.x + 4, P.y + 7, 8, { col: ['#fff', '#bfeaff'], sp0: 20, sp1: 70 }); return false; }
      const red = Math.min(0.6, aSt('red') + (petRole() === 'tank' ? 0.15 : 0)), eff = n * (1 - red);
      let take = Math.floor(eff); if (Math.random() < eff - take) take++;
      if (take <= 0) { P.inv = 0.8; Snd.play('clang'); emit(P.x + 4, P.y + 7, 8, { col: ['#cfd6e6', '#fff'], sp0: 20, sp1: 70 }); thornsAndFx(); return false; }
      n = take;
    }
    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;
    Snd.play('hurt'); Snd.hero('hurt'); setEmo('hurt', 0.45);
    emit(P.x + P.w / 2, P.y + P.h / 2, 10, { col: ['#e0453a', '#f6f3e9'], sp0: 30, sp1: 90 });
    if (!noKnock) { P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 130; P.vy = -170; P.atk = 0; }
    if (P.hp <= 0) {
      if (tryRevive()) return true;
      P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); Snd.hero('die'); setEmo('cry', 99); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 });
    } else if (src !== 'pit') thornsAndFx();
    return true;
  }
""")
rep("    hurtPlayer(1, P.x, true);\n    if (Q.state === 'dead') return;", "    hurtPlayer(1, P.x, true, 'pit');\n    if (Q.state === 'dead') return;")

# ---- updatePlayer tweaks ----
rep("const target = dir * RUN * (P.slow > 0 ? 0.5 : 1);", "const target = dir * RUN * (P.slow > 0 ? 0.5 : 1) * (1 + aSt('speed') + pSt('speed'));")
rep("P.dashCd = hasRelic(4) ? 0.35 : 0.7;", "P.dashCd = (hasRelic(4) ? 0.35 : 0.7) * (pSt('dash') || 1);")
rep("else if (P.coyote > 0) { P.vy = -JUMP;", "else if (P.coyote > 0) { P.vy = -JUMP * (pSt('jump') || 1);")
between("    // attack\n    if (act.atkP && P.atkCd <= 0 && P.dash <= 0) {", "    P.throwCd -= dt;", """    // attack: slot 1 (J / click) and slot 2 (H / middle-click / LT) - swords swing, special weapons fire
    if (P.dash <= 0) { if (act.atkP) useSlot(0); if (act.atk2P) useSlot(1); }
""")
between("  function swordRect() {", "  function hurtEnemy(e, dmg, pierce) {", """  function swordRect() {
    const P = Q.P;
    if (P.atkDown) return { x: P.x - 5, y: P.y + P.h - 3, w: P.w + 10, h: 15 };
    const rch = Math.round(24 * ((P.sw && P.sw.st.reach) || 1));
    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: rch, h: P.h + 5 } : { x: P.x - rch + 1, y: P.y - 3, w: rch, h: P.h + 5 };
  }
  function swordHit() {
    const P = Q.P, r = swordRect(), sw = P.sw || ITEM.iron, st = sw.st, base = baseDmg() + (st.dmg || 0);
    const list = Q.ents.slice().concat(bossTargets());
    for (const e of list) {
      if (e.dead || e.hid || P.atkHit.has(e)) continue;
      if (e.cfg && e.cfg.ai === 'blob' && e.st !== 'up') continue;
      if (ov(r, e)) {
        P.atkHit.add(e);
        let d = base;
        if (st.boss && isBig(e)) d *= st.boss;
        if (st.crit && Math.random() < st.crit) { d *= 3; emit(e.x + e.w / 2, e.y, 8, { col: ['#fff', '#ffd34e', '#e0453a'], sp0: 30, sp1: 100 }); Snd.play('clang'); }
        if (st.exec && !e.isBoss && e.maxhp && e.hp > 0 && e.hp / e.maxhp <= st.exec) { d = e.hp + 99; emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: ['#a15be0', '#14121f', '#fff'], sp0: 30, sp1: 110 }); }
        curHit = st;
        if (e.isBoss) hurtBoss(e, d, !!st.pierce); else hurtEnemy(e, d, !!st.pierce);
        curHit = null;
        swordHitFx(e, st, sw.id, d);
        Q.freeze = 0.045; Snd.play('hit');
        if (P.atkDown) { P.vy = -250; P.jumps = 1; P.atk = 0; }
      }
    }
    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(r, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);
    // destroy projectiles
    for (const p of Q.projs) if (!p.boss && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
    for (const p of Q.projs) if (p.type !== 'wave' && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
  }
""")

# ---- hurtEnemy / hurtBoss / hurtDragon quiet + kill hook ----
rep("  function hurtEnemy(e, dmg, pierce) {", "  function hurtEnemy(e, dmg, pierce, quiet) {")
rep("    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt', false, 1, e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1));\n    const P = Q.P;\n    if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; }\n    emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });",
"    if (!quiet || e.hp <= 0) Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt', false, 1, e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1));\n    const P = Q.P;\n    if (!quiet) { if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; } }\n    if (!quiet) emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });")
rep("      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18,", "      e.dead = true; onKill(e); emit(e.x + e.w / 2, e.y + e.h / 2, 18,")
rep("  function hurtBoss(b, dmg, pierce) {\n    if (b.isDragon) return hurtDragon(b, dmg, pierce);", "  function hurtBoss(b, dmg, pierce, quiet) {\n    if (b.isDragon) return hurtDragon(b, dmg, pierce, quiet);")
rep("    Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);\n    emit(b.x + b.w / 2, b.y + b.h / 2, 8,", "    if (!quiet || b.hp <= 0) Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);\n    emit(b.x + b.w / 2, b.y + b.h / 2, 8,")
rep("  function hurtDragon(d, dmg, pierce) {", "  function hurtDragon(d, dmg, pierce, quiet) {")
rep("    Snd.creature('dragon', d.hp <= 0 ? 'die' : 'hurt', true);\n    emit(d.x + d.w / 2, d.y + d.h / 2, 8,", "    if (!quiet || d.hp <= 0) Snd.creature('dragon', d.hp <= 0 ? 'die' : 'hurt', true);\n    emit(d.x + d.w / 2, d.y + d.h / 2, 8,")

# ---- enemies slow ----
rep("  function updateEnemies(dt) {\n    const P = Q.P, cx = Q.cam.x + VW / 2;\n    for (const e of Q.ents) {\n      if (e.dead) continue;", "  function updateEnemies(dtG) {\n    const P = Q.P, cx = Q.cam.x + VW / 2;\n    for (const e of Q.ents) {\n      if (e.dead) continue;\n      const dt = dtG * (e.slowT > 0 ? 0.5 : 1);")

# ---- projectiles fire source ----
rep("if (hurtPlayer(p.dmg || 1, p.x)) {", "if (hurtPlayer(p.dmg || 1, p.x, false, p.fl ? 'fire' : '')) {")
rep("      else if (ov(P, box)) hurtPlayer(z.dmg, z.x + z.w / 2);", "      else if (ov(P, box)) hurtPlayer(z.dmg, z.x + z.w / 2, false, (z.type === 'lava' || z.type === 'meteor' || z.type === 'sweep' || z.type === 'beam') ? 'fire' : '');")

# ---- insert gear block before throwables ----
rep("  // ===================== throwables =====================", blk('gear_block.txt') + "\n  // ===================== throwables =====================")
rep("      p.life -= dt;\n      if (p.t === 'blast')", "      p.life -= dt;\n      if (p.t === 'g') { gStep(p, dt); continue; }\n      if (p.t === 'blast')")
rep("      else if (p.t === 'blast') { const k = 1 - p.life / 0.25;", "      else if (p.t === 'g') drawGHot(p, x, y);\n      else if (p.t === 'blast') { const k = 1 - p.life / 0.25;")

# ---- updatePlay ----
rep("    updatePlayer(dt);\n    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }\n    updateEnemies(dt); updateBoss(dt); updateDragon(dt); updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(dt);",
"    updatePlayer(dt);\n    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }\n    updateGear(dt); updateStatus(dt);\n    const edt = dt * (Q.G.slowT > 0 ? 0.4 : 1);\n    updateEnemies(edt); updateBoss(edt); updateDragon(edt); updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(edt);")

# ---- items: magnet, level bonus, leek ----
rep("if (d < (hasRelic(3) ? 90 : 40) && !it.drop)", "if (d < (hasRelic(3) ? 90 : 40) * (petRole() === 'coin' ? 2.2 : (petRole() === 'rainbow' ? 1.8 : 1)) && !it.drop)")
rep("    Q.firstClear = true;\n    writeSave();", "    Q.firstClear = true; Q.bonusGold = 40 + 25 * Q.li; save.coins += Q.bonusGold;\n    writeSave();")
rep("pz.open = true; save.leek = true; writeSave();", "pz.open = true; save.leek = true; grantLeek(); writeSave();")
rep("      txt(T('time') + ':  ' + mm + ':'", "      if (Q.bonusGold) txt('+' + Q.bonusGold + ' ' + sv('gold for clearing the level!', 'vàng thưởng qua màn!'), VW / 2, 99, { al: 'center', size: 6, col: '#ffd34e', alpha: a });\n      txt(T('time') + ':  ' + mm + ':'")

# ---- drawing ----
between("  function drawPlayer(camX, camY) {", "  function drawLighting() {", blk('draw_block.txt'))
rep("    for (const e of Q.ents) drawEnemy(e, camX, camY);\n", "    for (const e of Q.ents) drawEnemy(e, camX, camY);\n")
rep("    drawFx(camX, camY);\n    drawPlayer(camX, camY);", "    drawFx(camX, camY);\n    drawGearFx(camX, camY);\n    drawPlayer(camX, camY);")
rep("drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather();\n    g.restore();", "drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y));\n    g.restore();")
rep("* (hasRelic(2) ? 1.45 : 1), i: 1 }];", "* (hasRelic(2) ? 1.45 : 1) * (petRole() === 'owl' ? 1.3 : 1), i: 1 }];")
rep("    if (save.leek) addL(P.x + 4 + P.face * 10, P.y + 2, 38, 0.85);", "    { const hs = heldSword(); if (hs && swordGlow(hs.id)) addL(P.x + 4 + P.face * 10, P.y + 2, 38, 0.85); }")
between("    if (save.leek) {\n      const lx = P.x + 4 + P.face * 10 - camX", "    g.globalCompositeOperation = 'source-over';\n  }\n  function drawWeather()", """    { const hs = heldSword(), gc = hs && swordGlow(hs.id);
      if (gc) { const lx = P.x + 4 + P.face * 10 - camX, ly = P.y + 2 - camY, gl = g.createRadialGradient(lx, ly, 0, lx, ly, 44); gl.addColorStop(0, hexA(gc, 0.2)); gl.addColorStop(1, hexA(gc, 0)); g.fillStyle = gl; g.fillRect(lx - 44, ly - 44, 88, 88); } }
""")
# hearts rows + HUD
rep("      const x = 12 + i * 10, y = 14;", "      const x = 12 + (i % 8) * 10, y = 14 + Math.floor(i / 8) * 10;")
rep("    g.fillStyle = '#ffd34e'; g.fillRect(8, 20, 5, 5); g.fillStyle = '#c89a1c'; g.fillRect(12, 21, 1, 3);\n    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23, { size: 7 });\n    if (P.shield) { g.fillStyle = '#6ee7f2'; g.fillRect(12 + 3 * 11 + 6, 38, 6, 7); g.fillStyle = '#fff'; g.fillRect(12 + 3 * 11 + 8, 40, 2, 3); }",
"    const hdy = (Math.ceil(mh / 8) - 1) * 10;\n    g.fillStyle = '#ffd34e'; g.fillRect(8, 20 + hdy, 5, 5); g.fillStyle = '#c89a1c'; g.fillRect(12, 21 + hdy, 1, 3);\n    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23 + hdy, { size: 7 });\n    if (P.shield) { g.fillStyle = '#6ee7f2'; g.fillRect(12 + 3 * 11 + 6, 38 + hdy, 6, 7); g.fillStyle = '#fff'; g.fillRect(12 + 3 * 11 + 8, 40 + hdy, 2, 3); }")
rep("if (sh[i]) drawSpr(g, ss, 12 + i * 11, 42, false); else { g.globalAlpha = 0.35; drawSpr(g, ss, 12 + i * 11, 42, false, true); g.globalAlpha = 1; }", "if (sh[i]) drawSpr(g, ss, 12 + i * 11, 42 + hdy, false); else { g.globalAlpha = 0.35; drawSpr(g, ss, 12 + i * 11, 42 + hdy, false, true); g.globalAlpha = 1; }")
rep("    if (Q.msgT > 0 && Q.msg && Q.state === 'play') txt(Q.msg, VW / 2, VH - 14,", "    drawGearHUD();\n    if (Q.msgT > 0 && Q.msg && Q.state === 'play') txt(Q.msg, VW / 2, VH - 14,")

# ---- scenes ----
rep("    if (s === 'cutscene') startCut();\n  }", "    if (s === 'cutscene') startCut();\n    if (s === 'shop') { Snd.music('title', TITLE_MUSIC); Q = null; shopCard = null; shopIdx = 0; }\n  }")
rep("    it.push({ k: 'newgame', fn: () => { save.cleared = []; save.shards = {}; save.coins = 0; save.leek = false;", "    it.push({ k: 'shopT', fn: () => { shopFrom = 'title'; toScene('shop'); } });\n    it.push({ k: 'newgame', fn: () => { save.inv = { own: ['iron'], w: ['iron', null], armor: null, pet: null, gems: save.inv.gems | 0 }; save.cleared = []; save.shards = {}; save.coins = 0; save.leek = false;")
rep("        else if (scene === 'map') updateMap(sub);", "        else if (scene === 'map') updateMap(sub);\n        else if (scene === 'shop') updateShopScene(sub);")
rep("    else if (scene === 'map') drawMap();", "    else if (scene === 'map') drawMap();\n    else if (scene === 'shop') drawShop();")
rep("    if (act.backP) toScene('title');\n    if (act.okP) { Snd.play('ok'); startLevelFade(mapSel); }", "    if (act.backP) toScene('title');\n    if (pressed.KeyB) { shopFrom = 'map'; Snd.play('ok'); toScene('shop'); return; }\n    if (act.okP) { Snd.play('ok'); startLevelFade(mapSel); }")
rep("    txt(T('maphelp'), VW / 2, 30,", "    txt(sv('[B] Shop & Inventory', '[B] Cửa hàng & Kho đồ'), VW - 8, 14, { al: 'right', size: 6, col: '#ffd34e' });\n    txt(T('maphelp'), VW / 2, 30,")
rep("  // ============================== MENUS / SCENES ==============================", blk('shop_block.txt') + "\n  // ============================== MENUS / SCENES ==============================")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
