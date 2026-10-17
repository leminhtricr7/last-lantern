import io
BS = chr(92)
def blk(n):
    s = io.open('tools/' + n, encoding='utf-8').read()
    return s.replace(BS + BS + "'", BS + "'")
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, all_=False):
    assert a in s, 'MISSING: ' + a[:80]
    return s.replace(a, b) if all_ else s.replace(a, b, 1)

# ======================= levels.js =======================
def levels(s):
    s = rep(s, "id: 'citadel', seed: 77, len: 560,", "id: 'citadel', seed: 77, len: 720,")
    s = rep(s, "  2: { cps: ['quan', 'smith', 'wizard'] },\n  3: { start: ['bram'], cps: ['gob', 'lyra', 'smith'] },\n  4: { cps: ['angel', 'smith'] },",
              "  2: { cps: ['quan', 'hoang', 'smith', 'wizard'] },\n  3: { start: ['bram'], cps: ['gob', 'duong', 'lyra', 'smith'] },\n  4: { cps: ['angel', 'santree', 'smith'] },")
    s = rep(s, "  6: ['runes', 'seqtorch', 'trial', 'multilever', 'timed']", "  6: ['runes', 'fetch', 'seqtorch', 'trial', 'shorty', 'multilever', 'fetch', 'timed', 'trial', 'sy']")
    s = rep(s, "const L = { B, li, W, H, grid, spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], trials: [], dragons: [],", "const L = { B, li, W, H, grid, spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], trials: [], dragons: [], minis: [],")
    s = rep(s, "  function runPuzzle(t) {", """  function pMini(who) { // Mr Shorty / Mr Sy duel: sealed arena, resolved in game.js
    const n = 54, x0 = pzFlat(n);
    L.minis.push({ id: L.id++, who, lw: x0 + 8, rw: x0 + n - 6, trig: x0 + 11, gy });
    for (let i = 0; i < 4; i++) { set(x0 + 17 + i, gy - 4, '='); set(x0 + 33 + i, gy - 4, '='); }
    spawn('heart', x0 + 4, gy - 2);
  }
  function pFetch() { // back-and-forth: the gate needs TWO keys; one lies in this room, the other far behind you
    const n = 42, x0 = pzFlat(n);
    gateAt(x0 + n - 5, 'key', { keys: 2 });
    ledges(x0, [[8, 2, 3], [12, 4, 3]]); spawn('key', x0 + 13, gy - 4, {});
    pzGuards(x0, n, 3);
    if (B.traps) placeTrap(B.traps[R(0, B.traps.length - 1)], x0 + 14, 14);
    let kx = -1;
    for (let tx = x0 - 34; tx > x0 - 100 && kx < 0; tx--) {
      if (tx < 16) break;
      let top = -1; for (let yy = 5; yy < H - 2; yy++) if (grid[yy][tx] === '#') { top = yy; break; }
      if (top < 7) continue;
      let ok = true; for (let dx = -2; dx <= 2 && ok; dx++) { const c = grid[top][tx + dx], a1 = grid[top - 1][tx + dx], a2 = grid[top - 2][tx + dx]; if (c !== '#' || a1 !== ' ' || a2 !== ' ') ok = false; }
      if (ok) kx = tx;
    }
    if (kx >= 0) {
      let top = 0; for (let yy = 5; yy < H - 2; yy++) if (grid[yy][kx] === '#') { top = yy; break; }
      spawn('key', kx, top, {}); spawn('turret', kx + 6, top, { dir: -1 }); coinsLine(kx - 3, top - 2, 3);
      const t = pick(); if (!FLY.has(t)) { spawn(t, kx + 2, top, { v: 'elite' }); }
    }
  }
  function runPuzzle(t) {
    if (t === 'fetch') { pFetch(); return; }
    if (t === 'shorty' || t === 'sy') { pMini(t); return; }""")
    # harder final map: more monsters and traps
    s = rep(s, "      const cnt = rnd() < 0.78 + d * 0.2 ? 1 + (d > 0.45 && rnd() < 0.6 ? 1 : 0)", "      const cnt = rnd() < 0.78 + d * 0.2 ? (li === 6 ? 1 : 0) + 1 + (d > 0.45 && rnd() < 0.6 ? 1 : 0)")
    s = rep(s, "if (!o.safe && n >= 8 && B.traps && rnd() < 0.3 + d * 0.3) placeTrap(", "if (!o.safe && n >= 8 && B.traps && rnd() < 0.3 + d * 0.3 + (li === 6 ? 0.25 : 0)) placeTrap(")
    s = rep(s, "else if (r < 0.95) { if (li >= 1 && rnd() < 0.4) arena(); else trapRun(); }", "else if (r < 0.95) { if (li >= 1 && rnd() < (li === 6 ? 0.65 : 0.4)) arena(); else trapRun(); }")
    return s
edit('src/levels.js', levels)

# ======================= audio.js =======================
def audio(s):
    return rep(s, "const NV = { dragon:", "const NV = { ember: ['triangle', 420, 540, 0.05], sy: ['sawtooth', 150, 230, 0.06], hoang: ['square', 200, 290, 0.05], duong: ['triangle', 130, 190, 0.07], santree: ['sine', 300, 430, 0.07], dragon:")
edit('src/audio.js', audio)

# ======================= game.js =======================
def game(s):
    # speakers + cutscene cast
    s = rep(s, "imp: { name: { en: 'Imp', vi: 'Tiểu quỷ' }, col: '#c07bff' } };", "imp: { name: { en: 'Imp', vi: 'Tiểu quỷ' }, col: '#c07bff' }, sy: { name: { en: 'Mr Sy', vi: 'Mr Sy' }, col: '#7ed957' } };")
    s = rep(s, "{ w: 'imp', en: 'He... also gave the hero snacks.', vi: 'Hắn... còn đưa cho anh hùng đồ ăn vặt nữa.' },", "{ w: 'sy', en: 'He also gave the hero snacks, my lord. I watched. I took notes.', vi: 'Hắn còn đưa đồ ăn vặt cho anh hùng nữa, thưa chủ nhân. Thần đã quan sát. Thần đã ghi chép.' },")
    s = rep(s, "{ w: 'imp', en: 'H-he used fire flasks, master...', vi: 'H-hắn dùng bình lửa, thưa chủ nhân...' },", "{ w: 'sy', en: 'He used fire flasks, my lord. I... may have underestimated the Frost King\\'s melting point.', vi: 'Hắn dùng bình lửa, thưa chủ nhân. Thần... có lẽ đã đánh giá thấp điểm nóng chảy của Vua Băng.' },".replace("\\'", BS + "'"))
    s = rep(s, "{ w: 'quoc', shout: 1, en: 'THEN STAND ON A BOX AND TRY HARDER!!', vi: 'THÌ ĐỨNG LÊN CÁI HỘP VÀ CỐ GẮNG HƠN!!' }",
            "{ w: 'quoc', shout: 1, en: 'THEN STAND ON A BOX AND TRY HARDER!!', vi: 'THÌ ĐỨNG LÊN CÁI HỘP VÀ CỐ GẮNG HƠN!!' },\n      { w: 'sy', en: 'Allow me, my lord. The boy keeps eating my little experiments. I will meet him in the Citadel with something... more dramatic.', vi: 'Xin để thần, thưa chủ nhân. Thằng nhóc cứ ăn hết mấy thí nghiệm nhỏ của thần. Thần sẽ gặp hắn ở Thành Trì với thứ gì đó... kịch tính hơn.' },\n      { w: 'quoc', shout: 1, en: 'FINALLY! SOMEONE WITH A PLAN!!', vi: 'CUỐI CÙNG! CÓ KẺ CÓ KẾ HOẠCH RỒI!!' }")
    s = rep(s, "      { w: 'quoc', shout: 1, en: 'LET THE WORLD GO DARK FOREVER!!!'", "      { w: 'sy', en: 'My lord, Shorty and I will hold the Citadel. My serpent is hungry... and so is his hat.', vi: 'Thưa chủ nhân, thần và Shorty sẽ giữ Thành Trì. Con rắn của thần đang đói... và cái mũ của hắn cũng vậy.' },\n      { w: 'quoc', shout: 1, en: 'GO, BOTH OF YOU! AND IF THE LANTERN REACHES ME... I WILL BECOME SEVEN!', vi: 'ĐI ĐI, CẢ HAI NGƯƠI! VÀ NẾU CHIẾC ĐÈN ĐẾN ĐƯỢC CHỖ TA... TA SẼ HÓA THÀNH BẢY!' },\n      { w: 'quoc', shout: 1, en: 'LET THE WORLD GO DARK FOREVER!!!'")
    s = rep(s, "if (ln.w === 'quoc') Snd.devilRoar(ln.shout ? 1 : 0.55); else if (ln.w === 'imp') Snd.creature('imp', 'alert'); else Snd.blip('shorty');", "if (ln.w === 'quoc') Snd.devilRoar(ln.shout ? 1 : 0.55); else if (ln.w === 'imp') Snd.creature('imp', 'alert'); else if (ln.w === 'sy') { Snd.blip('sy'); Snd.whisper(); } else Snd.blip('shorty');")
    s = rep(s, "Snd.blip(ln.w === 'imp' ? 'fairy' : (ln.w === 'quoc' ? 'quoc' : 'shorty'))", "Snd.blip(ln.w === 'imp' ? 'fairy' : (ln.w === 'quoc' ? 'quoc' : (ln.w === 'sy' ? 'sy' : 'shorty')))")
    s = rep(s, "g.globalAlpha = ln.w === 'imp' ? 1 : 0.55; drawSpr(g, getSprite('imp'), VW - 62, 150 + Math.round(Math.sin(c.pt * 4)), true, false, 3, 3); g.globalAlpha = 1;",
            "if (cutLevel >= 2) { g.globalAlpha = ln.w === 'sy' ? 1 : 0.55; drawSpr(g, npcSpr('npc_sy'), VW - 62, 152 + Math.round(Math.sin(c.pt * 3)), true, false, 2, 2); g.globalAlpha = 1; } else { g.globalAlpha = ln.w === 'imp' ? 1 : 0.55; drawSpr(g, getSprite('imp'), VW - 62, 150 + Math.round(Math.sin(c.pt * 4)), true, false, 3, 3); g.globalAlpha = 1; }")
    # data blocks
    s = rep(s, "  // ---------- caches ----------", blk('story6_block.txt') + "\n  // ---------- caches ----------")
    s = rep(s, "  const DRG_DLG = {", blk('npc_block.txt') + "\n  const DRG_DLG = {")
    # projectile colour per boss form
    s = s.replace("Q.B.proj", "bpc()")
    s = s.replace("const bpc = () => (Q && Q.boss && Q.boss.cfg && Q.boss.cfg.proj) || bpc();", "const bpc = () => (Q && Q.boss && Q.boss.cfg && Q.boss.cfg.proj) || Q.B.proj;")
    # Q state
    s = rep(s, "arenaSealed: false, bossDead: false, weather: [], banner: 0, msg: null, msgT: 0", "arenaSealed: false, bossDead: false, weather: [], banner: 0, msg: null, msgT: 0, minisDone: new Set(), mainBoss: null, mainArena: null, syFig: null")
    s = rep(s, "    Q.dragons = L.dragons.map(t => Object.assign({}, t, { state: Q.dragonsDone.has(t.id) ? 'done' : 'idle' }));",
            "    Q.dragons = L.dragons.map(t => Object.assign({}, t, { state: Q.dragonsDone.has(t.id) ? 'done' : 'idle' }));\n    for (const m of (L.minis || [])) for (let y = 0; y < m.gy; y++) { L.grid[y][m.lw] = ' '; L.grid[y][m.rw] = ' '; }\n    Q.minis = (L.minis || []).map(m => Object.assign({}, m, { state: Q.minisDone.has(m.id) ? 'done' : 'idle' })); Q.syFig = null;")
    s = rep(s, "  function makeBoss(s) {\n    const c = BOSS[Q.li]", "  function makeBoss(s) {\n    if (Q.li === 6) return makeFormBoss(FORMS.quoc, s.x, s.y, { id: 'quoc', who: 'quoc' });\n    const c = BOSS[Q.li]")
    s = rep(s, "    if (Q.arenaSealed) unseal();\n    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;", "    if (Q.mainArena) { Q.L.arena = Q.mainArena; Q.mainArena = null; Q.mainBoss = null; }\n    if (Q.arenaSealed) unseal();\n    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;")
    # seal: cameo / Quoc intro
    s = rep(s, "    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);\n    Q.shake = 0.6;\n  }", "    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);\n    Q.shake = 0.6;\n    if (Q.li === 6) startScripted('quoc', QUOC_PRE, () => { Q.state = 'bossintro'; Q.stateT = 0; });\n    else syCameoPre();\n  }")
    # hurtBoss: forms, minis, cameo
    s = rep(s, "    if (b.hp <= 0) {\n      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0;", "    if (b.hp <= 0) {\n      if (nextForm(b)) return;\n      if (b.mini) { miniDeath(b); return; }\n      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0;")
    s = rep(s, "      Q.items.push({ kind: 'frag', x: clamp(b.x + b.w / 2, (ar.x0 + 5) * TS, (ar.x1 - 5) * TS), y: ar.gy * TS - 22, id: -1, ph: 0 });\n    }\n  }", "      Q.items.push({ kind: 'frag', x: clamp(b.x + b.w / 2, (ar.x0 + 5) * TS, (ar.x1 - 5) * TS), y: ar.gy * TS - 22, id: -1, ph: 0 });\n      syCameoPost();\n    }\n  }")
    # engine block
    s = rep(s, "  // ===================== BOSS AI =====================", blk('engine_block.txt') + "\n  // ===================== BOSS AI =====================")
    # new skills
    s = rep(s, "upd: wait }\n  };\n  function groundYAt(x)", """upd: wait },
    fan: { tele: 0.55, start(b) { b.n = 2; b.skT = 0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -4; i <= 4; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.2) * 95, Math.sin(a0 + i * 0.2) * 95, { boss: true }); if (--b.n <= 0) return true; b.skT = 0.75 / b.fury; } } },
    lobs: { tele: 0.6, start(b) { const c = bc(b), P = Q.P; for (let i = 0; i < 3; i++) { const tx = arenaClamp(P.x + 4 + (i - 1) * 54 + rr(-12, 12)), t = 0.95 + i * 0.22; Q.projs.push({ x: c.x, y: c.y, vx: (tx - c.x) / t, vy: -160, grav: 320, life: 3, col: bpc(), type: 'ball', boss: true, big: true, onLand: 'poison' }); } Snd.play('shoot'); b.skT = 1.4; }, upd: wait },
    crossBeam: { tele: 0.9, start(b) { const ar = Q.L.arena, gt = ar.gy * TS; addZone({ type: 'beam', x: ar.x0 * TS + 8, y: gt - 9, w: (ar.x1 - ar.x0) * TS - 16, h: 10, tel: 0.9, life: 0.5 }); addZone({ type: 'beam', x: ar.x0 * TS + 8, y: gt - 27, w: (ar.x1 - ar.x0) * TS - 16, h: 10, tel: 1.8, life: 0.5 }); b.skT = 2.8; Snd.play('flame'); }, upd: wait },
    rush: { tele: 0.55, start(b) { b.n = 3; b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 0.8; b.recAfter = 1.0; }, upd(b, dt) { b.skT -= dt; const hit = moveX(b, b.dir * 190 * b.fury * dt); if (Math.random() < 0.6) emit(b.x + b.w / 2 - b.dir * b.w / 2, b.y + b.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 25, vy: -10, grav: 20 }); if (hit || b.skT <= 0) { Q.shake = 0.3; Snd.play('boom'); if (--b.n <= 0) return true; b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 0.8; } } }
  };
  function groundYAt(x)""")
    s = rep(s, "const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush', 'slam', 'cloak'], RANGED = ['shoot', 'web', 'spit', 'curse', 'breath', 'rain', 'beam', 'meteor', 'lavaCols', 'sweep', 'spin'];",
            "const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush', 'slam', 'cloak', 'rush'], RANGED = ['shoot', 'web', 'spit', 'curse', 'breath', 'rain', 'beam', 'meteor', 'lavaCols', 'sweep', 'spin', 'fan', 'lobs', 'crossBeam'];")
    s = rep(s, "RANGE_L = ['shoot', 'web', 'spit', 'curse', 'breath', 'spin', 'rain', 'beam']", "RANGE_L = ['shoot', 'web', 'spit', 'curse', 'breath', 'spin', 'rain', 'beam', 'fan', 'lobs', 'crossBeam']")
    s = rep(s, "      else if (sk === 'charge') { rot = -dir * 0.16 * k;", "      else if (sk === 'charge' || sk === 'rush') { rot = -dir * 0.16 * k;")
    s = rep(s, "      else if (b.sk === 'charge') { sx = 1.14;", "      else if (b.sk === 'charge' || b.sk === 'rush') { sx = 1.14;")
    s = rep(s, "if (b.sk === 'charge' && b.st === 'act') {", "if ((b.sk === 'charge' || b.sk === 'rush') && b.st === 'act') {")
    # talk: per-line speaker
    s = rep(s, "for (let k = n0 + 1; k <= n1; k++) if (k % 2 === 0 && /\\S/.test(ln[k - 1] || ' ')) Snd.blip(tk.it.who); }", "for (let k = n0 + 1; k <= n1; k++) if (k % 2 === 0 && /\\S/.test(ln[k - 1] || ' ')) Snd.blip(tk.lines[tk.i].w || tk.it.who); }")
    s = rep(s, "      const tk = Q.talk, sp = npcSpr(tk.npc.spr);", "      const tk = Q.talk, cur = (tk.lines[tk.i] && tk.lines[tk.i].w && NPCS[tk.lines[tk.i].w]) || tk.npc, sp = npcSpr(cur.spr);")
    s = rep(s, "      txt(LN(tk.npc.name), 66, 158, { size: 8, col: '#ffd34e', bold: true });", "      txt(LN(cur.name), 66, 158, { size: 8, col: '#ffd34e', bold: true });")
    # two-key gates
    s = rep(s, "          if (P.keys > 0) { P.keys--; openGate(gd); Snd.play('key'); }\n          else if (!Q.keyMsgT || Q.t - Q.keyMsgT > 3) { Q.keyMsgT = Q.t; Q.msg = T('needkey'); Q.msgT = 2.5; }",
            "          const need = gd.keys || 1;\n          if (P.keys >= need) { P.keys -= need; openGate(gd); Snd.play('key'); }\n          else if (!Q.keyMsgT || Q.t - Q.keyMsgT > 3) { Q.keyMsgT = Q.t; Q.msg = need > 1 ? (save.lang === 'vi' ? 'Cần 2 chìa khóa! Chìa còn lại nằm rất xa phía sau bạn...' : 'Two keys needed! The other one lies far behind you...') : T('needkey'); Q.msgT = 3.5; }")
    s = rep(s, "    updateTrials(dt); updateDragonEnc();", "    updateTrials(dt); updateDragonEnc(); updateMiniEnc();")
    s = rep(s, "      if (gd.need === 'key') drawSpr(g, icon('key'), gx, gy2, false);", "      if (gd.need === 'key') { drawSpr(g, icon('key'), gx, gy2, false); if (gd.keys > 1) { drawSpr(g, icon('key'), gx, gy2 - 12, false); txt('x' + gd.keys, gx + 10, gy2 - 6, { size: 6, col: '#ffd34e' }); } }")
    # allies
    s = rep(s, "  // ===================== throwables =====================", blk('ally_block.txt') + "\n  // ===================== throwables =====================")
    s = rep(s, "leekHeal: 0, torn: [], lyra:", "leekHeal: 0, torn: [], allies: [], pops: [], lyra:")
    s = rep(s, "function resetGearFx() { const G = Q.G; G.later = [];", "function resetGearFx() { const G = Q.G; G.allies = []; G.pops = []; G.later = [];")
    s = rep(s, "    updatePet(dt);\n  }", "    updateAllies(dt);\n    for (const p of G.pops) p.t -= dt; G.pops = G.pops.filter(p => p.t > 0);\n    updatePet(dt);\n  }")
    s = rep(s, "    const pt = G.pet;\n    if (pt) {", "    drawAllies(camX, camY);\n    const pt = G.pet;\n    if (pt) {")
    s = rep(s, "    if (G.flash > 0) { g.globalAlpha = Math.min(0.55, G.flash * 1.6);", "    for (const p of G.pops) txt(p.s, Math.round(p.x - camX), Math.round(p.y - camY - (1.3 - p.t) * 10), { al: 'center', size: 7, col: p.col, bold: true, alpha: Math.min(1, p.t * 2) });\n    if (G.flash > 0) { g.globalAlpha = Math.min(0.55, G.flash * 1.6);")
    # bullet shapes for allies
    s = rep(s, "    else if (sh === 'spark') {", "    else if (sh === 'orb') { disc(g, x, y, 4, hexA(p.col, 0.5)); disc(g, x, y, 3, p.col); disc(g, x, y, 1, '#fff'); }\n    else if (sh === 'bat') { g.fillStyle = p.col; g.fillRect(x - 1, y - 1, 3, 3); const fl = Math.floor(Q.t * 18) % 2; g.fillRect(x - 4, y - 2 + fl * 2, 3, 1); g.fillRect(x + 2, y - 2 + fl * 2, 3, 1); g.fillStyle = '#e0453a'; g.fillRect(x, y, 1, 1); }\n    else if (sh === 'spark') {")
    # Sy ledge figure + boss bar form counter
    s = rep(s, "    for (const e of Q.ents) drawEnemy(e, camX, camY);\n", "    for (const e of Q.ents) drawEnemy(e, camX, camY);\n    if (Q.syFig) { const f = Q.syFig; drawSpr(g, npcSpr('npc_sy'), Math.round(f.x - camX), Math.round(f.y - camY + Math.sin(Q.t * 2) * 1.5), false, false, 1.3, 1.3); }\n")
    s = rep(s, "txt(LN(b.cfg.name) + (b.cfg.armor > 0 ?", "txt(LN(b.cfg.name) + (b.forms ? '  [' + (b.fi + 1) + '/' + b.forms.length + ']' : '') + (b.cfg.armor > 0 ?")
    # debug hooks
    s = rep(s, "hurtBoss, completeLevel, updatePlay,", "hurtBoss, nextForm, spawnAllies, beginMini, makeFormBoss, FORMS, MINI, completeLevel, updatePlay,")
    return s
edit('src/game.js', game)
print('ok')
