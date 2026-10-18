import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:110]
    return s.replace(a, b, n)

# ------------------------------------------------------------------ levels.js
def levels(s):
    s = rep(s, "\nfunction genLevel(li) {\n  const B = BIOMES[li],", "\n" + io.open('tools/ocean_gen.txt', encoding='utf-8').read() + "\nfunction genLevel(li) {\n  if (li === 8) return genOcean(BIOMES[li], li);\n  const B = BIOMES[li],")
    s = rep(s, "id: 'ocean', seed: 99, len: 560, deep: 10, arenaW: 66, zoom: 0.6,", "id: 'ocean', seed: 99, len: 560, zoom: 0.6,")
    s = rep(s, "hazard: 'spikes', dark: 0.3, sun: false, water: true, particles: 'bubbles',", "hazard: 'spikes', dark: 0.04, sun: false, water: true, particles: 'bubbles',")
    return s
edit('src/levels.js', levels)

# ------------------------------------------------------------------ game.js
def game(s):
    # --- water only below the sea surface ---
    s = rep(s, "  const GRAV = 820, JUMP = 292, DJUMP = 262, RUN = 112;", "  const GRAV = 820, JUMP = 292, DJUMP = 262, RUN = 112;\n  const wetP = e => !!Q.B.water && (Q.L.waterY === undefined || e.y + e.h / 2 >= Q.L.waterY * TS);   // swimming physics only below the surface")
    s = rep(s, "const target = dir * RUN * (Q.B.water ? (hasRelic(8)", "const target = dir * RUN * (wetP(P) ? (hasRelic(8)")
    s = rep(s, "      if (Q.B.water) { if (act.jumpP && P.dash <= 0) {", "      if (wetP(P)) { if (act.jumpP && P.dash <= 0) {")
    s = rep(s, "      if (Q.B.water) { P.vy = Math.min(85,", "      if (wetP(P)) { P.vy = Math.min(85,")
    s = rep(s, "    if (Q.B.water && !P.onGround) { P.vx += f * 70;", "    if (wetP(P) && !P.onGround) { P.vx += f * 70;")
    s = rep(s, "    const swim = Q.B.water && !P.onGround;", "    const swim = wetP(P) && !P.onGround;")
    i = s.index("    if (Q.B.water) { g.fillStyle = 'rgba(20,90,140,.16)'"); j = s.index("\n", i)
    s = s[:i] + """    if (Q.B.water) {
      const sy = Q.L.waterY !== undefined ? Math.max(0, Math.round(Q.L.waterY * TS - Q.cam.y)) : 0, dp = Q.L.waterY !== undefined ? clamp((Q.cam.y + VH / 2) / TS / Q.L.H, 0, 1) : 0;
      if (sy < VH) { g.fillStyle = 'rgba(' + Math.round(20 - dp * 14) + ',' + Math.round(90 - dp * 60) + ',' + Math.round(140 - dp * 60) + ',' + (0.14 + dp * 0.3).toFixed(2) + ')'; g.fillRect(0, sy, VW, VH - sy);
        g.globalAlpha = Math.max(0, 0.05 + Math.sin(Q.t * 0.7) * 0.02 - dp * 0.06); g.fillStyle = '#bfeaff'; for (let i = 0; i < 6; i++) g.fillRect(((i * 73 + Q.t * 9) % (VW + 40)) - 20, sy, 10, VH - sy); g.globalAlpha = 1; }
    }""" + s[j:]
    # --- depth darkness ---
    s = rep(s, "Q.darkCur = lerp(Q.darkCur, Math.min(0.97, darkAt(P.x)), 1 - Math.exp(-2.5 * dt));", "Q.darkCur = lerp(Q.darkCur, Math.min(0.97, Math.max(darkAt(P.x), Q.L.waterY !== undefined && P.y > Q.L.waterY * TS ? 0.1 + 0.72 * depthDark(P.y) : 0)), 1 - Math.exp(-2.5 * dt));")
    # --- arena in a vertical level ---
    s = rep(s, "if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS) seal();", "if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS && (L.arena.y0 === undefined || P.y > L.arena.y0 * TS)) seal();")
    s = rep(s, "    for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = '#';\n    Q.arenaSealed = true;", "    if (ar.rects) for (const r of ar.rects) for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) L.grid[y][x] = '#'; else for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = '#';\n    Q.arenaSealed = true;")
    s = rep(s, "  function unseal() { const L = Q.L, ar = L.arena; for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }", "  function unseal() { const L = Q.L, ar = L.arena; if (ar.rects) { for (const r of ar.rects) for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) L.grid[y][x] = ' '; } else for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }")
    s = rep(s, "  function groundYAt(x) { const tx = Math.floor(x / TS); for (let ty = 3; ty < Q.L.H; ty++)", "  function groundYAt(x) { const tx = Math.floor(x / TS); for (let ty = (Q.L.arena && Q.L.arena.y0) || 3; ty < Q.L.H; ty++)")
    s = rep(s, "y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260,", "y: (ar.y0 !== undefined ? ar.y0 + 2 : ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260,")
    s = rep(s, "tz = B.zoom && !Q.bossDead && L.arena && Q.P.x > (L.arena.x0 - 9) * TS ? B.zoom : 1;", "tz = B.zoom && !Q.bossDead && L.arena && (L.arena.y0 !== undefined ? Q.P.y > (L.arena.y0 - 7) * TS : Q.P.x > (L.arena.x0 - 9) * TS) ? B.zoom : 1;")
    # --- the Kraken swims (it follows your height) ---
    s = rep(s, "    b.vy = Math.min(420, b.vy + GRAV * dt);", "    b.vy = Math.min(420, b.vy + GRAV * dt);\n    if (c.swim && !b.hide && Q.L.arena.y0 !== undefined) { const ar = Q.L.arena, ty = clamp(P.y + 7 - b.h * 0.5, ar.y0 * TS + 14, ar.gy * TS - b.h); b.vy = clamp((ty - b.y) * 1.4, -62, 62); }")
    s = rep(s, "art: 'kraken', artScale: 1.35, w: 170, h: 150, hp: 660, armor: 0.3, smart: 0.6, sp: 22, minion: 'piranha', proj: '#6ee7f2', skills: ['erupt', 'shoot', 'rain', 'charge', 'summon', 'fan'], skills2: ['spin', 'roar', 'slam'] },",
               "art: 'kraken', swim: true, artScale: 1.35, w: 170, h: 150, hp: 660, armor: 0.3, smart: 0.6, sp: 26, minion: 'piranha', proj: '#6ee7f2', skills: ['erupt', 'shoot', 'rain', 'charge', 'summon', 'fan', 'tentacles'], skills2: ['spin', 'roar', 'tentacles', 'tentacles'] },")
    s = rep(s, "  RELICS.push(", """  // the Kraken sweeps its tentacles across the cavern in bands: only one band is safe - swim there!
  BS.tentacles = {
    tele: 0.5,
    start(b) {
      const ar = Q.L.arena, n = 5, safe = Math.floor(Math.random() * n), base = ar.gy * TS - 14;
      for (let k = 0; k < n; k++) if (k !== safe) { const y = base - k * 58 - 6, dir = Math.random() < 0.5 ? 1 : -1; addZone({ type: 'beam', x: ar.x0 * TS + 12, y, w: (ar.x1 - ar.x0) * TS - 24, h: 24, tel: 1.5, life: 0.55, col: '#a02a6a', dmg: 1 }); }
      Snd.monster(8, 'attack', 1); b.skT = 2.6; Q.msg = save.lang === 'vi' ? 'Xúc tu quét ngang! Bơi vào khoảng trống!' : 'Tentacle sweep! Swim into the gap!'; Q.msgT = 2.5;
    },
    upd: wait
  };
  RELICS.push(""")
    # --- items: pearls ---
    s = rep(s, "      else if (s.type === 'rare') {", "      else if (s.type === 'pearl') Q.items.push({ kind: 'pearl', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });\n      else if (s.type === 'rare') {")
    s = rep(s, "      } else if (it.kind === 'egg') {\n        if (d < 26", """      } else if (it.kind === 'pearl') {
        if (d < 13) { it.dead = true; Q.taken.add(it.id); Q.pearls = (Q.pearls || 0) + 1; Snd.play('shard'); emit(it.x, it.y, 28, { col: ['#ffffff', '#bfeaff', '#ffd0f0'], sp0: 20, sp1: 110 }); addRing(it.x, it.y, '#bfeaff', 40, 0.5);
          Q.msg = Q.pearls >= 3 ? (save.lang === 'vi' ? 'Đủ 3 Ngọc Trai! Mang xuống Cánh Cửa Thủy Triều ở đáy biển.' : 'All 3 Sea Pearls! Take them to the Tide Door at the bottom.') : (save.lang === 'vi' ? 'Ngọc Trai Biển ' : 'Sea Pearl ') + Q.pearls + '/3'; Q.msgT = 4; }
      } else if (it.kind === 'egg') {
        if (d < 26""")
    s = rep(s, "      } else if (it.kind === 'egg') {\n        drawSpr(g, eggSprite(EGGS[it.k].k), x, y, false);", """      } else if (it.kind === 'pearl') {
        const by = y + Math.round(Math.sin(it.ph * 2.4) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.4 + Math.sin(it.ph * 4) * 0.12; disc(g, x, by, 11, '#bfeaff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        disc(g, x, by, 5, '#3a4a7a'); disc(g, x, by, 4, '#f0f6ff'); disc(g, x - 1, by - 1, 2, '#ffffff'); g.fillStyle = '#ffd0f0'; g.fillRect(x + 1, by + 1, 2, 2);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-8, 4), 1, { col: ['#ffffff', '#bfeaff'], sp0: 2, sp1: 8, grav: -14, l0: 0.5, l1: 1 });
      } else if (it.kind === 'egg') {
        drawSpr(g, eggSprite(EGGS[it.k].k), x, y, false);""")
    # --- start-of-level state ---
    s = rep(s, "    if (!save.shards[li]) save.shards[li] = [0, 0, 0];\n    initGear();", "    if (!save.shards[li]) save.shards[li] = [0, 0, 0];\n    Q.pearls = 0; Q.questShown = false; Q.qT = 0;\n    initGear();")
    s = rep(s, "updateCreeps(dt); updateItems(dt);", "updateCreeps(dt); updateItems(dt); updateOcean(dt);")
    s = rep(s, "'shardFlash', 'coinsRun',", "'shardFlash', 'coinsRun', 'pearls',")
    # --- surface sky + HUD ---
    s = rep(s, "    { const hz = g.createLinearGradient(0, VH * 0.42, 0, VH);", "    drawSurface(camX, camY);\n    { const hz = g.createLinearGradient(0, VH * 0.42, 0, VH);")
    s = rep(s, "      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a');",
               "      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a');\n      if (Q.L.pearlGate && !Q.bossDead) chip(Q.L.pearlGate.open ? (save.lang === 'vi' ? 'Hạ Kraken!' : 'Defeat the Kraken!') : (save.lang === 'vi' ? 'Ngọc trai ' : 'Sea Pearls ') + (Q.pearls || 0) + '/3', Q.L.pearlGate.open ? '#ff7a8a' : '#bfeaff');")
    s = rep(s, "    drawRareIc(78, 22 + hdy, 0.8);", "    if (Q.L.waterY !== undefined && P.y > Q.L.waterY * TS) txt(sv('Depth ', 'Độ sâu ') + depthM(P.y) + ' m', VW / 2, 8, { al: 'center', size: 6, col: '#bfeaff' });\n    drawRareIc(78, 22 + hdy, 0.8);")
    # --- resume ---
    s = rep(s, "save.resume = { li: Q.li, cp: Q.cp,", "save.resume = { li: Q.li, pearls: Q.pearls || 0, cp: Q.cp,")
    s = rep(s, "    initEntities(); Q.scn = buildScene();", "    Q.pearls = r.pearls || 0; Q.questShown = true; if (Q.L.pearlGate && Q.pearls >= 3) { const pg = Q.L.pearlGate; pg.open = true; for (let y = pg.y0; y <= pg.y1; y++) for (let x = pg.x0; x <= pg.x1; x++) Q.L.grid[y][x] = ' '; }\n    initEntities(); Q.scn = buildScene();")
    # --- props all the way down ---
    s = rep(s, "    const fg = []; for (let x = 120;", """    if (L.waterY !== undefined) for (let y = 11; y < L.H - 3; y++) for (let x = 4; x < L.W - 4; x++) { if (L.grid[y][x] === '#' && L.grid[y - 1][x] === ' ' && L.grid[y][x + 1] === '#' && L.grid[y - 1][x + 1] === ' ' && rn() < 0.07 && !busy(x)) props.push({ k: kinds[Math.floor(rn() * kinds.length)], x: x * TS + 8, y: y * TS, f: rn() < 0.5 }); }
    const fg = []; for (let x = 120;""")
    blk = io.open('tools/ocean_game.txt', encoding='utf-8').read()
    s = rep(s, "  function frame(now) {", blk + "  function frame(now) {")
    return s
edit('src/game.js', game)
print('ok')
