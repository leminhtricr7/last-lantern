import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:110]
    return s.replace(a, b, n)

# ================================================================ items.js: ranks
def items(s):
    return s + """
// ================= RANKS: every item gets a grade from F up to SSS so the shop reads at a glance =================
const RANKS = ['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
const RANK_COL = { SSS: '#ff4af0', SS: '#ff5a5a', S: '#ffb03a', A: '#a98bff', B: '#6ec8ff', C: '#6ee89a', D: '#9aa4b8', E: '#7a8294', F: '#5a6272' };
function rankOf(it) { const t = it.tier | 0; return t >= 19 ? 'SSS' : t >= 17 ? 'SS' : t >= 15 ? 'S' : t >= 12 ? 'A' : t >= 9 ? 'B' : t >= 6 ? 'C' : t >= 3 ? 'D' : t >= 1 ? 'E' : 'F'; }
"""
edit('src/items.js', items)

# ================================================================ levels.js
def levels(s):
    s = rep(s, "id: 'swamp', seed: 88, len: 540,", "id: 'swamp', seed: 88, len: 430,")
    s = rep(s, "id: 'tunnels', seed: 111, len: 580, deep: 14, arenaW: 52, zoom: 0.72,", "id: 'tunnels', seed: 111, len: 580, deep: 34, arenaW: 72, lake: true, zoom: 0.55,")
    s = rep(s, "  let H = 15; const W = B.len + 100;", "  let H = 15; const W = B.len + (li === 7 ? 190 : 100);")
    # the giant forest in front of the Spore Queen
    s = rep(s, "  gy = 10; flat(4, { safe: true }); // return to arena height", """  if (li === 7) {   // THE GIANT FOREST: a long dark stretch of huge glowing mushrooms and trees, full of monsters, ending at the Spore Queen's glade
    gy = 10; flat(6, { safe: true, cp: true, heart: true }); const f0 = x;
    for (let i = 0; i < 7; i++) {
      const n = R(13, 17), x0 = x;
      flat(n, { heart: i % 3 === 2, cp: i === 3 });
      for (let c = 0; c < 2 + (i >> 1); c++) addEnemy(x0 + R(2, n - 2), gy);
      ledges(x0, i % 2 ? [[2, 3, 4], [8, 5, 4], [12, 3, 3]] : [[4, 3, 4], [9, 6, 4]]);
      coinsLine(x0 + 4, gy - 5, 4);
      if (i % 2 === 1) spawn('pk', x0 + R(3, n - 3), gy, { what: pickWhat() });
      if (i === 5) { L.checkpoints.push({ x: (x0 + 6) * TS, y: gy * TS, id: L.id++ }); }
    }
    L.forest = { x0: f0, x1: x }; L.dark.push({ x0: f0, x1: x, a: 0.6 });
    for (let tx = f0; tx < x; tx += R(3, 5)) { let gr = 10; for (let y = 3; y < H - 2; y++) if (grid[y][tx] === '#') { gr = y; break; } if (grid[gr - 1][tx] === ' ') L.creep.push({ x: tx * TS + R(2, 12), y: gr * TS, k: R(0, 3) }); }
    flat(8, { safe: true, cp: true, heart: true });
  }
  gy = 10; flat(4, { safe: true }); // return to arena height""")
    # the lake
    s = rep(s, "    L.checkpoints.push({ x: (ax0 - 10) * TS, y: 10 * TS, id: L.id++ });\n  } else {", """    L.checkpoints.push({ x: (ax0 - 10) * TS, y: 10 * TS, id: L.id++ });
    if (B.lake) {   // the cavern is a huge flooded lake: you fall in and have to swim and fight
      L.waterY = 14; L.wet = true;
      [[6, 14], [28, 12], [50, 14]].forEach(p => { for (let xx = p[0]; xx < p[0] + p[1]; xx++) set(ax0 + xx, 15, '='); });
      for (let k = 0; k < 4; k++) { const x0 = 8 + k * 16; for (let xx = x0; xx < x0 + 5; xx++) set(ax0 + xx, GY0(AG, 8 + k * 2), '='); }
    }
  } else {""")
    s = rep(s, "  const ax0 = x, AW = B.arenaW", "  const GY0 = (ag, up) => ag - up;\n  const ax0 = x, AW = B.arenaW")
    return s
edit('src/levels.js', levels)

# ================================================================ game.js
def game(s):
    # --- lake water for any level that sets L.wet ---
    s = rep(s, "  const wetP = e => !!Q.B.water && (Q.L.waterY === undefined || e.y + e.h / 2 >= Q.L.waterY * TS);", "  const wetP = e => (!!Q.B.water || !!Q.L.wet) && (Q.L.waterY === undefined || e.y + e.h / 2 >= Q.L.waterY * TS);")
    s = rep(s, "    if (Q.B.water) {\n      const sy = Q.L.waterY !== undefined", "    if (Q.B.water || Q.L.wet) {\n      const sy = Q.L.waterY !== undefined")
    s = rep(s, "    const L = Q.L; if (L.waterY === undefined) return;\n    const sy = Math.round(L.waterY * TS - camY);", "    const L = Q.L; if (L.waterY === undefined || !Q.B.water) return;\n    const sy = Math.round(L.waterY * TS - camY);")
    s = rep(s, "    const L = Q.L; if (L.waterY === undefined || Q.state !== 'play') return;", """    const L = Q.L;
    if (L.forest && !Q.forestShown && Q.state === 'play' && Q.P.x > L.forest.x0 * TS) { Q.forestShown = true; Q.msg = save.lang === 'vi' ? 'RỪNG NẤM KHỔNG LỒ... có thứ gì đó khổng lồ đang theo dõi bạn từ trên cao.' : 'THE GIANT FOREST... something huge is watching you from above.'; Q.msgT = 5; Snd.monster(7, 'alert', 0.7); }
    if (L.waterY === undefined || !Q.B.water || Q.state !== 'play') return;""")
    s = rep(s, "Q.L.waterY !== undefined && P.y > Q.L.waterY * TS ? Math.min(Q.arenaSealed", "Q.B.water && Q.L.waterY !== undefined && P.y > Q.L.waterY * TS ? Math.min(Q.arenaSealed")
    s = rep(s, "    if (Q.L.waterY !== undefined && P.y > Q.L.waterY * TS) txt(sv('Depth '", "    if (Q.B.water && Q.L.waterY !== undefined && P.y > Q.L.waterY * TS) txt(sv('Depth '")
    s = rep(s, "    if (L.waterY !== undefined) for (let y = 11; y < L.H - 3; y++)", "    if (L.waterY !== undefined && Q.B.water) for (let y = 11; y < L.H - 3; y++)")
    # forest: giant props along the whole forest
    s = rep(s, "    const fg = []; for (let x = 120;", "    if (L.forest) for (let x = L.forest.x0 + 1; x < L.forest.x1; x += 4 + Math.floor(rn() * 4)) { const y = topOf(x); if (y > 0) props.push({ k: ['hugeshroom', 'hugetree', 'hugeshroomB', 'hugetree'][Math.floor(rn() * 4)], x: x * TS + 8, y: y * TS, f: rn() < 0.5 }); }\n    const fg = []; for (let x = 120;")
    # --- the Spore Queen drops from the sky ---
    s = rep(s, "    if (b.st === 'intro') { b.timer += dt;", """    if (c.drop && (b.st === 'intro' || b.st === 'dropwait' || b.st === 'dropfall')) {
      if (b.st === 'intro') { b.st = 'dropwait'; b.timer = 3.4; b.hide = true; b.lockx = null; b.tx = P.x + 4; Q.state = 'play'; Q.msg = save.lang === 'vi' ? 'Có thứ gì đó đang rơi xuống! Hãy chạy khỏi cái bóng!' : 'Something is falling! Run from the shadow!'; Q.msgT = 3; Snd.monster(7, 'alert', 1); return; }
      if (b.st === 'dropwait') {
        b.timer -= dt; if (b.timer > 1.1) b.tx = P.x + 4; else if (b.lockx === null) { b.lockx = b.tx; Snd.play('whoosh'); }
        if (Math.random() < 0.5) emit((b.lockx === null ? b.tx : b.lockx) + rr(-30, 30), Q.cam.y + rr(0, 60), 1, { col: ['#c8f0a0', '#c07bff'], sp0: 10, sp1: 40, vy: 140, grav: 200, l0: 0.3, l1: 0.6 });
        if (b.timer <= 0) { b.st = 'dropfall'; b.hide = false; b.x = (b.lockx === null ? b.tx : b.lockx) - b.w / 2; b.y = Q.cam.y - b.h - 40; b.vy = 200; Snd.monster(7, 'attack', 1); }
        return;
      }
      b.vy = Math.min(950, b.vy + 1700 * dt); moveY(b, b.vy * dt);
      hitPl({ x: b.x + 6, y: b.y + 6, w: b.w - 12, h: b.h - 8 }, () => hurtPlayer(2, b.x + b.w / 2));
      if (b.onGround) { b.st = 'rec'; b.timer = 1.3; b.squashT = 0.3; Q.shake = 1; Snd.play('boom'); Snd.monster(7, 'alert', 1); shockwave(b); hitPl({ x: b.x - 30, y: b.y + b.h - 16, w: b.w + 60, h: 20 }, () => hurtPlayer(1, b.x + b.w / 2)); }
      return;
    }
    if (b.st === 'intro') { b.timer += dt;""")
    s = rep(s, "    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.invul > 0 || b.dead) return;", "    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.st === 'dropwait' || b.st === 'dropfall' || b.invul > 0 || b.dead) return;")
    s = rep(s, "if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro') out.push(b);", "if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro' && b.st !== 'dropwait' && b.st !== 'dropfall') out.push(b);")
    s = rep(s, "    if (b.hide) {\n      if (b.sk === 'burrow' && b.ph === 1) {", """    if (b.hide) {
      if (b.st === 'dropwait') {
        const lx = b.lockx === null ? b.tx : b.lockx, mx = Math.round(lx - camX), gy2 = Math.round(groundYAt(lx) - camY), k = clamp(1 - b.timer / 3.4, 0, 1), locked = b.lockx !== null, bl = Math.floor(Q.t * 14) % 2;
        g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = locked ? (bl ? '#ff3a2a' : '#ffd34e') : '#000'; for (let j = -4; j <= 4; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - (j / 4.5) ** 2)) * (30 + 34 * k)); g.fillRect(mx - hw, gy2 - 1 + j, hw * 2, 1); } g.globalAlpha = 1;
        if (locked) { g.fillStyle = '#ff3a2a'; g.fillRect(mx - 1, gy2 - 40, 3, 22); g.fillRect(mx - 1, gy2 - 14, 3, 4); }
        return;
      }
      if (b.sk === 'burrow' && b.ph === 1) {""")
    s = rep(s, "art: 'shroom', w: 64, h: 88,", "art: 'shroom', drop: true, w: 64, h: 88,")
    # --- ranks in the shop ---
    s = rep(s, "  let shopTab = 0, shopIdx = 0,", "  let shopRank = 0;   // 0 = every rank, 1..9 = SSS..F\n  let shopTab = 0, shopIdx = 0,")
    s = rep(s, "  function shopItems() {\n", """  function shopItems() { const l0 = shopItems0(), t0 = SH_TABS[shopTab][0]; return shopRank > 0 && t0 !== 'topup' && t0 !== 'trade' ? l0.filter(it => rankOf(it) === RANKS[shopRank - 1]) : l0; }
  function setRank(r) { shopRank = (r + RANKS.length + 1) % (RANKS.length + 1); shopIdx = 0; Snd.play('select'); }
  function shopItems0() {
""")
    s = rep(s, "    const list = shopItems(), n = list.length, t = SH_TABS[shopTab][0];\n    if (act.swapP) setTab(shopTab - 1);", "    if (pressed.BracketLeft || pressed.Comma) setRank(shopRank - 1); if (pressed.BracketRight || pressed.Period) setRank(shopRank + 1);\n    const list = shopItems(), n = list.length, t = SH_TABS[shopTab][0];\n    if (act.swapP) setTab(shopTab - 1);")
    s = rep(s, "  const SH_GX = 12, SH_GY = 30, SH_STEP = 34;", "  const SH_GX = 12, SH_GY = 33, SH_STEP = 34;")
    s = rep(s, "    const page = Math.floor(shopIdx / 15);\n    for (let k = 0; k < 15; k++) {\n      const idx = page * 15 + k; if (idx >= list.length) break;\n      if (near(", "    for (let i = 0; i <= RANKS.length; i++) if (near(gx, gy, 12 + i * 31 + 14, 25, 15, 4)) { if (click && i !== shopRank) setRank(i); return; }\n    const page = Math.floor(shopIdx / 15);\n    for (let k = 0; k < 15; k++) {\n      const idx = page * 15 + k; if (idx >= list.length) break;\n      if (near(")
    s = rep(s, "    } else {\n      const page = Math.floor(shopIdx / 15), pages = Math.max(1, Math.ceil(list.length / 15));", """    } else {
      for (let i = 0; i <= RANKS.length; i++) {   // the rank row: ALL, SSS, SS, S, A, B, C, D, E, F
        const rk = i ? RANKS[i - 1] : null, cx = 12 + i * 31, on = i === shopRank, col = rk ? RANK_COL[rk] : '#cfd6e6';
        g.fillStyle = on ? hexA(col, 0.35) : 'rgba(255,255,255,.05)'; g.fillRect(cx, 22, 29, 7); g.fillStyle = on ? col : '#2a2548'; g.fillRect(cx, 22, 29, 1); g.fillRect(cx, 28, 29, 1);
        txt(rk || sv('ALL', 'TẤT CẢ'), cx + 14.5, 25.5, { al: 'center', size: 5, bold: on, col: on ? '#fff' : (rk ? col : '#8892aa') });
      }
      const page = Math.floor(shopIdx / 15), pages = Math.max(1, Math.ceil(list.length / 15));""")
    s = rep(s, "        g.drawImage(itemIcon(it.id).c, x + 2, y + 2);\n        if (owned(it.id)) {", "        g.drawImage(itemIcon(it.id).c, x + 2, y + 2);\n        { const rk = rankOf(it); g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x + 2, y + 2, rk.length * 4 + 3, 8); txt(rk, x + 3.5, y + 6.2, { size: 5.5, bold: true, col: RANK_COL[rk] }); }\n        if (owned(it.id)) {")
    s = rep(s, "        txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 250, 52, { size: 5.5, col });", "        txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 250, 52, { size: 5.5, col });\n        { const rk = rankOf(it); txt(sv('RANK', 'HẠNG'), 366, 38, { al: 'right', size: 5, col: '#8892aa' }); txt(rk, 366, 51, { al: 'right', size: 13, bold: true, col: RANK_COL[rk] }); }")
    s = rep(s, "    txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 96, 40, { size: 6, col });", "    txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 96, 40, { size: 6, col });\n    { const rk = rankOf(it); g.fillStyle = hexA(RANK_COL[rk], 0.2); g.fillRect(300, 16, 52, 34); g.fillStyle = RANK_COL[rk]; g.fillRect(300, 16, 52, 1); g.fillRect(300, 49, 52, 1); txt(sv('RANK', 'HẠNG'), 326, 24, { al: 'center', size: 5, col: '#cfd6e6' }); txt(rk, 326, 41, { al: 'center', size: 15, bold: true, col: RANK_COL[rk] }); }")
    s = rep(s, "sv('Arrows: move   Enter: select   Q/E: tabs   Esc: back', 'Mũi tên: chọn   Enter: chọn mua   Q/E: đổi mục   Esc: thoát')", "sv('Arrows: move   Enter: select   Q/E: tabs   [ ]: rank   Esc: back', 'Mũi tên: chọn   Enter: chọn mua   Q/E: đổi mục   [ ]: hạng   Esc: thoát')")
    return s
edit('src/game.js', game)
print('ok')
