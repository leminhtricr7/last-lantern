import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:110]
    return s.replace(a, b, n)

def items(s):
    blk = io.open('tools/guns_items.txt', encoding='utf-8').read()
    s = s + blk + "ITEMS.forEach(it => { if (it.tier >= 16) it.rar = 6; });\n"
    s = rep(s, "    else sp = paint(20, 20, WPN_PAINT[id]);\n    const s = it.type === 'pet' ? 1.1 : 1;", "    else if (it.type === 'gun') sp = paint(32, 18, GUN_PAINT[id], '#14121f');\n    else sp = paint(20, 20, WPN_PAINT[id]);\n    const s = it.type === 'pet' ? 1.1 : (it.type === 'gun' ? 0.78 : 1);")
    return s
edit('src/items.js', items)

def audio(s):
    return rep(s, "    flame() {", """    gun() { noise(0.06, 0.28, 1800); tone(240, 0.07, 'square', 0.16, -170); },
    gunheavy() { noise(0.18, 0.4, 500); tone(120, 0.2, 'sawtooth', 0.28, -80); tone(60, 0.25, 'sine', 0.3, -30); },
    shotgun() { noise(0.3, 0.5, 350); tone(90, 0.24, 'sawtooth', 0.3, -60); tone(160, 0.1, 'square', 0.12, -90); },
    rail() { tone(1500, 0.35, 'sawtooth', 0.14, -1300); noise(0.22, 0.2, 2500); tone(90, 0.3, 'sine', 0.26, -40); },
    laser() { tone(1900, 0.13, 'square', 0.09, -1400); tone(950, 0.11, 'sine', 0.07, -600); },
    reload() { tone(600, 0.04, 'square', 0.1); tone(420, 0.05, 'square', 0.1, 0, ac.currentTime + 0.1); },
    click() { tone(1300, 0.03, 'square', 0.08); tone(800, 0.04, 'square', 0.07, 0, ac.currentTime + 0.05); },
    flame() {""")
edit('src/audio.js', audio)

def game(s):
    # --- input: held attack buttons for auto-fire ---
    s = rep(s, "  addEventListener('mousedown', () => Snd.init());", "  let mouseHeld = false;\n  addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) mouseHeld = true; });\n  addEventListener('pointerup', () => { mouseHeld = false; });\n  addEventListener('mousedown', () => Snd.init());")
    s = rep(s, "    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');", "    act.atkH = !!(keys.KeyJ || keys.KeyX || gb.x || mouseHeld); act.atk2H = !!(keys.KeyH || keys.KeyU || gb.lt);\n    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');")
    s = rep(s, "act.skillP = act.shopP = act.sumP = false; }", "act.skillP = act.shopP = act.sumP = false; }")
    s = rep(s, "    if (P.dash <= 0) { if (act.atkP) useSlot(0); if (act.atk2P) useSlot(1); }", "    if (P.dash <= 0) { if (act.atkP) useSlot(0); if (act.atk2P) useSlot(1); }\n    if (P.dash <= 0) for (let sl = 0; sl < 2; sl++) { const gi = eqIt(sl); if (gi && gi.type === 'gun' && (sl ? act.atk2H : act.atkH) && !(sl ? act.atk2P : act.atkP)) useSlot(sl); }")
    s = rep(s, "    else if (it.type === 'wpn' && P.wcd[s] <= 0) fireWeapon(it, s);", "    else if (it.type === 'wpn' && P.wcd[s] <= 0) fireWeapon(it, s);\n    else if (it.type === 'gun' && P.wcd[s] <= 0) fireGun(it, s);")
    s = rep(s, "const LVL = ['left', 'right', 'up', 'down', 'jump'];", "const LVL = ['left', 'right', 'up', 'down', 'jump', 'atkH', 'atk2H'];")
    # --- projectiles ---
    s = rep(s, "      if (p.burn) e.burnT = Math.max(e.burnT || 0, p.burn);\n      if (p.slow)", "      if (p.burn) e.burnT = Math.max(e.burnT || 0, p.burn);\n      if (p.hole) Q.G.holes.push({ x: p.x, y: p.y, life: 1.8, r: 58, tick: 0.2 });\n      if (p.slow)")
    s = s.replace("explode(p.x, p.y, p.expl, p.dmg)", "explode(p.x, p.y, p.expl, p.dmg, p.soft)")
    s = rep(s, "  function explode(x, y, r, dmg) {", "  function explode(x, y, r, dmg, soft) {")
    s = rep(s, "    Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.45);", "    Snd.play('explode'); Q.shake = Math.max(Q.shake, soft ? 0.1 : 0.45);")
    s = rep(s, "    breakWalls(x, y, r);\n    const P = Q.P; if (Math.hypot(P.x + 4 - x", "    if (!soft) breakWalls(x, y, r);\n    const P = Q.P; if (!soft && Math.hypot(P.x + 4 - x")
    s = rep(s, "    else if (sh === 'scythe') {", """    else if (sh === 'bullet') { const a = Math.atan2(p.vy, p.vx); g.save(); g.translate(x, y); g.rotate(a); g.globalCompositeOperation = 'lighter'; g.fillStyle = hexA(p.col, 0.5); g.fillRect(-11, -2, 15, 4); g.globalCompositeOperation = 'source-over'; g.fillStyle = p.col; g.fillRect(-7, -1, 11, 2); g.fillStyle = '#fff'; g.fillRect(-1, -1, 5, 2); g.restore(); }
    else if (sh === 'skybeam') { g.globalCompositeOperation = 'lighter'; g.fillStyle = hexA(p.col, 0.4); g.fillRect(x - 5, y - 30, 10, 60); g.globalCompositeOperation = 'source-over'; g.fillStyle = p.col; g.fillRect(x - 2, y - 26, 4, 52); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 24, 2, 48); }
    else if (sh === 'grenade') { disc(g, x, y, 3, '#2b5a2e'); disc(g, x, y, 2, '#5fcf5a'); if (Math.floor(Q.t * 12) % 2) { g.fillStyle = '#ff3a2a'; g.fillRect(x, y - 3, 1, 1); } }
    else if (sh === 'scythe') {""")
    # --- reset, tick ---
    s = rep(s, "G.god = null; G.dr = null; G.slowT = 0;", "G.god = null; G.dr = null; G.gun = {}; G.slowT = 0;")
    s = rep(s, "    updateAllies(dt); updateBossDrops(dt); updateSummons(dt);", "    updateAllies(dt); updateBossDrops(dt); updateSummons(dt); updateGuns(dt);")
    # --- hand, HUD ---
    s = rep(s, "    const sw = heldSword();\n    if (sw) drawHeldSword(sw, x, bot);", "    const sw = heldSword();\n    if (P.gunT > 0 && P.gunId && GUN_PAINT[P.gunId]) drawHeldGun(P.gunId, x, bot, P.face); else if (sw) drawHeldSword(sw, x, bot);")
    s = rep(s, "        const cdn = it.type === 'wpn' ? P.wcd[s] / (P.wmax[s] || 1) : Math.max(0, P.atkCd) / (0.27 * (it.st.cd || 1));", "        const gsx = it.type === 'gun' ? gunState(it, P) : null;\n        const cdn = gsx ? (gsx.rel > 0 ? gsx.rel / it.st.reload : 0) : (it.type === 'wpn' ? P.wcd[s] / (P.wmax[s] || 1) : Math.max(0, P.atkCd) / (0.27 * (it.st.cd || 1)));\n        if (gsx) txt(String(gsx.rel > 0 ? sv('RELOAD', 'NẠP') : gsx.mag), bx + 24, by + 21, { al: 'right', size: gsx.rel > 0 ? 4.5 : 6, col: gsx.rel > 0 ? '#ff7a7a' : (gsx.mag <= 2 ? '#ffb03a' : '#fff') });")
    # --- shop ---
    s = rep(s, "['wpn', { en: 'Weapons', vi: 'Vũ khí' }],", "['wpn', { en: 'Weapons', vi: 'Vũ khí' }], ['gun', { en: 'Guns', vi: 'Súng' }],")
    s = rep(s, "wpn: { en: 'Special weapon', vi: 'Vũ khí đặc biệt' } };", "wpn: { en: 'Special weapon', vi: 'Vũ khí đặc biệt' }, gun: { en: 'Gun', vi: 'Súng' } };")
    s = rep(s, "    if (it.type === 'armor') return sv('Passive.", "    if (it.type === 'gun') return sv('Equip it in Slot 1 or Slot 2, then HOLD the attack key to keep firing. Hold Up or Down to aim. Magazine: ' + it.st.mag + ' rounds, reload ' + it.st.reload + 's.', 'Trang bị vào Ô 1 hoặc Ô 2, rồi GIỮ nút tấn công để bắn liên tục. Giữ Lên/Xuống để ngắm. Băng đạn ' + it.st.mag + ' viên, nạp lại ' + it.st.reload + ' giây.');\n    if (it.type === 'armor') return sv('Passive.")
    s = rep(s, "      const x = 6 + i * 62, on = i === shopTab;\n      g.fillStyle = on ? '#2a2548' : '#151230'; g.fillRect(x, 6, 60, 15); g.fillStyle = on ? '#ffd34e' : '#434d6e'; g.fillRect(x, 6, 60, 1); g.fillRect(x, 20, 60, 1);\n      txt(LN(t[1]), x + 30, 14,", "      const TW = Math.floor(372 / SH_TABS.length), x = 6 + i * TW, on = i === shopTab;\n      g.fillStyle = on ? '#2a2548' : '#151230'; g.fillRect(x, 6, TW - 2, 15); g.fillStyle = on ? '#ffd34e' : '#434d6e'; g.fillRect(x, 6, TW - 2, 1); g.fillRect(x, 20, TW - 2, 1);\n      txt(LN(t[1]), x + (TW - 2) / 2, 14,")
    s = rep(s, "near(gx, gy, 6 + i * 62 + 30, 13, 30, 8)", "near(gx, gy, 6 + i * Math.floor(372 / SH_TABS.length) + (Math.floor(372 / SH_TABS.length) - 2) / 2, 13, (Math.floor(372 / SH_TABS.length) - 2) / 2, 8)")
    blk = io.open('tools/guns_game.txt', encoding='utf-8').read().replace("-0.25 * (f > 0 ? 1 : -1) * 0 - 0.3", "-0.3 * f").replace("const q = Q.P; shot(", "shot(")
    s = rep(s, "  function frame(now) {", blk + "  function frame(now) {")
    return s
edit('src/game.js', game)
print('ok')
