import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

def levels(s):
    blk = io.open('tools/maps10_levels.txt', encoding='utf-8').read()
    s = rep(s, "    proj: '#d58bff', movers: true, traps: ['saw', 'turret', 'spiketrap'], trapStyle: 'dark'\n  }\n];",
               "    proj: '#d58bff', movers: true, traps: ['saw', 'turret', 'spiketrap'], trapStyle: 'dark'\n  },\n" + blk + "];\n"
               "// play order: the three new lands (7, 8, 9) come before the Shadow Citadel (6), which is the last map\n"
               "const LORDER = [0, 1, 2, 3, 4, 5, 7, 8, 9, 6];\n"
               "const LPOS = li => Math.max(0, LORDER.indexOf(li));\n"
               "const LDIFF = li => [0, 1, 2, 3, 4, 5, 6, 5.25, 5.5, 5.75][li] || 0;   // how hard a map is (the Citadel stays the hardest)")
    s = rep(s, "  6: { start: ['trader'], cps: ['wizard'], pre:", "  7: { start: ['trader', 'frog'], cps: ['witch', 'bard', 'gob'] },\n  8: { start: ['trader', 'pirate'], cps: ['mermaid', 'fisher', 'bard'] },\n  9: { start: ['trader', 'miner'], cps: ['mole', 'bard', 'smith'] },\n  6: { start: ['trader'], cps: ['wizard'], pre:")
    s = rep(s, "  6: ['runes', 'fetch',", "  7: ['torches', 'key', 'bombwall', 'multilever', 'timed'],\n  8: ['lever', 'seqtorch', 'key', 'timed'],\n  9: ['bombwall', 'multilever', 'key', 'bombwall', 'seqtorch'],\n  6: ['runes', 'fetch',")
    s = rep(s, "  const B = BIOMES[li], rnd = mulberry32(9001 + li * 7919);", "  const B = BIOMES[li], rnd = mulberry32(9001 + li * 7919), lv = LDIFF(li);")
    s = rep(s, "Math.min(1, 0.08 + li * 0.12 + (x / B.len) * 0.3)", "Math.min(1, 0.08 + lv * 0.12 + (x / B.len) * 0.3)")
    s = rep(s, "r < 0.05 + 0.025 * li)", "r < 0.05 + 0.025 * lv)")
    s = rep(s, "r < 0.12 + 0.03 * li)", "r < 0.12 + 0.03 * lv)")
    s = rep(s, "sp: 28 + li * 3,", "sp: 28 + lv * 3,")
    return s
edit('src/levels.js', levels)

def art(s):
    blk = io.open('tools/maps10_bosspaint.txt', encoding='utf-8').read()
    a = s.index("const BOSS_PAINT = [")
    b = s.index("\n];", a)
    s = s[:b] + ",\n" + blk + s[b:]
    s = rep(s, "const BOSS_SIZES = [[46, 36], [50, 38], [48, 52], [44, 54], [48, 54], [56, 56], [60, 66]];", "const BOSS_SIZES = [[46, 36], [50, 38], [48, 52], [44, 54], [48, 54], [56, 56], [60, 66], [48, 50], [60, 50], [50, 50]];")
    # new relic icons
    s = rep(s, "    r0: [16, 16,", """    r7: [16, 16, P => { P.rect(7, 8, 2, 7, 'e'); P.ell(8, 7, 7, 4, 'p'); P.ell(8, 6, 6, 3, 'h'); P.px(5, 5, 'w'); P.px(10, 4, 'w'); P.px(8, 7, 'x'); }],
    r8: [16, 16, P => { P.ell(8, 9, 6, 5, 'C'); P.ell(8, 10, 5, 3, 'b'); P.ell(8, 8, 3, 3, 'w'); P.px(7, 7, 'c'); P.rect(2, 13, 12, 1, 'c'); }],
    r9: [16, 16, P => { P.ell(6, 9, 4, 5, 'N'); P.ell(6, 9, 3, 4, 'n'); for (let i = 0; i < 3; i++) P.line(9, 6 + i * 3, 14, 4 + i * 4, 'l', 1); P.px(14, 4, 'w'); P.px(14, 8, 'w'); P.px(14, 12, 'w'); }],
    r0: [16, 16,""")
    # backgrounds for the new lands
    s = rep(s, "    if (B.style === 'cave') {", "    if (B.style === 'cave' || B.style === 'tunnel') {")
    s = rep(s, "      bg.layers.push({ c: c2, f: 0.45, y: 0, anchor: 'top' });\n    } else {", """      bg.layers.push({ c: c2, f: 0.45, y: 0, anchor: 'top' });
      if (B.style === 'tunnel') {   // wooden mine supports and hanging lamps
        const [c3, x3] = mkCanvas(W, 170);
        for (let i = 0; i < 9; i++) { const cx = 20 + i * 58; wrap(o => { x3.fillStyle = '#3a2a18'; x3.fillRect(cx + o - 18, 40, 4, 130); x3.fillRect(cx + o + 14, 40, 4, 130); x3.fillRect(cx + o - 20, 36, 40, 6); x3.fillStyle = '#5a4428'; x3.fillRect(cx + o - 20, 36, 40, 2); x3.fillStyle = '#ffd34e'; x3.fillRect(cx + o - 1, 44, 3, 4); x3.fillStyle = 'rgba(255,211,78,.18)'; x3.fillRect(cx + o - 6, 40, 13, 14); }); }
        bg.layers.push({ c: c3, f: 0.55, y: 40, anchor: 'bottom' });
      }
    } else if (B.style === 'ocean') {
      const ys = ridge(x, 110, 14, B.mid, (B.seed || 5) * 5, 170);
      for (let i = 0; i < 30; i++) { const cx = (r() * W) | 0, h = 26 + ((r() * 50) | 0), ph = r() * 6; wrap(o => { for (let k = 0; k < h; k++) { x.fillStyle = k % 6 < 3 ? '#0f6a4a' : '#16805a'; x.fillRect(cx + o + Math.round(Math.sin(k / 6 + ph) * 2), ys[cx] - k, 2, 1); } }); }
      for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, col = ['#c86a8a', '#e0905a', '#9a5ac8'][i % 3]; wrap(o => { disc(x, cx + o, ys[cx] - 4, 6, col); disc(x, cx + o - 5, ys[cx] - 8, 4, col); disc(x, cx + o + 5, ys[cx] - 9, 3, col); }); }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
      const [c2, x2] = mkCanvas(W, 140);   // light rays from the surface
      for (let i = 0; i < 7; i++) { const cx = 30 + i * 74; x2.fillStyle = 'rgba(160,230,255,0.06)'; for (let k = 0; k < 140; k++) x2.fillRect(cx + k * 0.45, k, 22 - k * 0.08, 1); }
      bg.layers.push({ c: c2, f: 0.15, y: 0, anchor: 'top' });
    } else if (B.style === 'swamp') {
      const ys = ridge(x, 96, 10, B.mid, (B.seed || 5) * 5, 170);
      for (let i = 0; i < 8; i++) { const cx = (r() * W) | 0, h = 30 + ((r() * 26) | 0); wrap(o => { x.fillStyle = '#1a1410'; x.fillRect(cx + o, ys[cx] - h, 3, h + 4); x.fillRect(cx + o - 8, ys[cx] - h + 6, 10, 2); x.fillRect(cx + o + 2, ys[cx] - h + 12, 9, 2); }); }
      for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, h = 18 + ((r() * 40) | 0), rad = 8 + ((r() * 10) | 0), col = ['#8e2ab0', '#2ab08a', '#c0a020'][i % 3]; wrap(o => { x.fillStyle = '#d8ccb0'; x.fillRect(cx + o - 2, ys[cx] - h, 4, h + 4); disc(x, cx + o, ys[cx] - h, rad, col); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(cx + o - rad + 3, ys[cx] - h - 2, 3, 2); x.fillRect(cx + o + 2, ys[cx] - h - 4, 2, 2); }); }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
    } else {""")
    return s
edit('src/art.js', art)

def game(s):
    # --- 10 maps in play order ---
    s = rep(s, "relics: [0, 0, 0, 0, 0, 0, 0],", "relics: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],")
    s = rep(s, "  if (!Array.isArray(save.relics) || save.relics.length < 7) save.relics = [0, 0, 0, 0, 0, 0, 0];", "  if (!Array.isArray(save.relics)) save.relics = [];\n  while (save.relics.length < 10) save.relics.push(0);")
    s = rep(s, "  const maxPlayable = () => UNLOCK_ALL ? 6 : save.cleared.length ? Math.min(6, Math.max.apply(null, save.cleared) + 1) : 0;",
               "  const maxPlayable = () => UNLOCK_ALL ? 9 : save.cleared.length ? Math.min(9, Math.max.apply(null, save.cleared.map(LPOS)) + 1) : 0;   // a position in LORDER")
    s = rep(s, "  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP()", "  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + (hasRelic(8) ? 1 : 0) + armHP()")
    s = rep(s, "    const c = EN[type], li = Q.li, v = s && s.v;", "    const c = EN[type], li = LDIFF(Q.li), v = s && s.v;")
    # finishing a level: the citadel (6) is the end; the next map follows the play order
    s = rep(s, "if (Q.li >= 6) toScene('ending');", "if (Q.li === 6) toScene('ending');")
    s = rep(s, "if (coop) { if (Q.li >= 6 && !Q.endShown)", "if (coop) { if (Q.li === 6 && !Q.endShown)")
    s = rep(s, "else { cutLevel = Q.li; mapSel = Math.min(6, Q.li + 1); toScene('cutscene'); }", "else { cutLevel = Q.li; mapSel = Math.min(9, LPOS(Q.li) + 1); toScene(CUT[Q.li] ? 'cutscene' : 'map'); }")
    # world map: 10 stops in play order
    s = rep(s, "  const NODES = [[40, 150], [90, 105], [140, 148], [195, 100], [245, 145], [290, 95], [338, 48]];",
               "  const NODES = [[24, 152], [58, 112], [92, 150], [128, 108], [162, 148], [198, 104], [232, 146], [268, 102], [304, 144], [350, 56]];")
    s = rep(s, "      if (MAP_STORY[mapSel] && !save.seen[mapSel]) { save.seen[mapSel] = 1; writeSave(); storyLevel = mapSel; toScene('mstory'); }\n      else startLevelFade(mapSel);",
               "      const li = LORDER[mapSel];\n      if (MAP_STORY[li] && !save.seen[li]) { save.seen[li] = 1; writeSave(); storyLevel = li; toScene('mstory'); }\n      else startLevelFade(li);")
    s = rep(s, "    for (let i = 0; i < 6; i++) {\n      const a = NODES[i], b = NODES[i + 1], steps = 14;", "    for (let i = 0; i < NODES.length - 1; i++) {\n      const a = NODES[i], b = NODES[i + 1], steps = 14;")
    s = rep(s, "    BIOMES.forEach((B, i) => {\n      const [x, y] = NODES[i], unlocked = i <= maxPlayable(), done = save.cleared.indexOf(i) >= 0;",
               "    LORDER.forEach((li, i) => {\n      const B = BIOMES[li], [x, y] = NODES[i], unlocked = i <= maxPlayable(), done = save.cleared.indexOf(li) >= 0;")
    s = rep(s, "      if (unlocked) { const sh = (save.shards[i] || [0, 0, 0]);", "      if (unlocked) { const sh = (save.shards[li] || [0, 0, 0]);")
    s = rep(s, "    const B = BIOMES[mapSel], unl = mapSel <= maxPlayable();", "    const mli = LORDER[mapSel], B = BIOMES[mli], unl = mapSel <= maxPlayable();")
    s = rep(s, "{ const stars = '★'.repeat(mapSel + 1) + '☆'.repeat(6 - mapSel), pz = (PUZZLES[mapSel] || []).length,", "{ const stars = '★'.repeat(Math.ceil((LDIFF(mli) + 1) / 1.4)) + '☆'.repeat(Math.max(0, 5 - Math.ceil((LDIFF(mli) + 1) / 1.4))), pz = (PUZZLES[mli] || []).length,")
    s = rep(s, "      const ic = icon('r' + mapSel); g.globalAlpha = save.relics[mapSel] ? 1 : 0.35;", "      const ic = icon('r' + mli); g.globalAlpha = save.relics[mli] ? 1 : 0.35;")
    s = rep(s, "save.relics.filter(Boolean).length + '/7    ('", "save.relics.filter(Boolean).length + '/10    ('")
    s = rep(s, "txt(T('shards') + ' ' + ts + '/21   '", "txt(T('shards') + ' ' + ts + '/30   '")
    s = rep(s, "totalShards() + '/21'", "totalShards() + '/30'")
    s = rep(s, "      for (let i = 0; i < 7; i++) { const ic = icon('r' + i); g.globalAlpha = save.relics[i] ? 1 : 0.2; g.drawImage(ic.c, VW / 2 - 7 * 13 + i * 26 + 4, 172); }",
               "      for (let i = 0; i < 10; i++) { const ic = icon('r' + LORDER[i]); g.globalAlpha = save.relics[LORDER[i]] ? 1 : 0.2; g.drawImage(ic.c, VW / 2 - 10 * 10 + i * 20 + 2, 172); }")
    # co-op lobby picks a position in the play order
    s = rep(s, "    const li = coopUI.li; startLevel(li); Q.state = 'intro';", "    const li = LORDER[coopUI.li] === undefined ? 0 : LORDER[coopUI.li]; startLevel(li); Q.state = 'intro';")
    s = rep(s, "LN(BIOMES[coopUI.li].name || { en: '', vi: '' })", "LN(BIOMES[LORDER[coopUI.li] === undefined ? 0 : LORDER[coopUI.li]].name)")
    s = rep(s, "      else if (d.t === 'start') { coopUI.li = d.li;", "      else if (d.t === 'start') { coopUI.li = LPOS(d.li);")
    # relic effects for the new lands
    s = rep(s, "        if (e.isBoss) hurtBoss(e, d, !!st.pierce); else hurtEnemy(e, d, !!st.pierce);", "        if (e.isBoss) hurtBoss(e, d, !!st.pierce); else hurtEnemy(e, d, !!st.pierce);\n        if (hasRelic(7)) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }")
    s = rep(s, "  function explode(x, y, r, dmg) {\n", "  function explode(x, y, r, dmg) {\n    if (hasRelic(9)) dmg *= 2;\n")
    # --- swimming in the Sunken Deep ---
    s = rep(s, "      // jump\n      if (P.jumpBuf > 0) {", """      // swimming: every jump press is a stroke upwards, the water slows the fall
      if (Q.B.water) { if (act.jumpP && P.dash <= 0) { P.vy = Math.min(P.vy, -150 - (hasRelic(8) ? 30 : 0)); P.jumps = 1; P.jumpBuf = 0; Snd.play('jump'); emit(P.x + 4, P.y + 2, 4, { col: ['#bfeaff', '#fff'], sp0: 5, sp1: 25, vy: -30, grav: -40, l0: 0.4, l1: 0.8 }); } else P.jumpBuf = 0; }
      // jump
      if (P.jumpBuf > 0) {""")
    s = rep(s, "      P.vy = Math.min(380, P.vy + g2 * dt);\n    }", "      if (Q.B.water) { P.vy = Math.min(85, P.vy + g2 * 0.3 * dt); P.vx *= 1 - 1.2 * dt; if (Math.random() < 0.03) emit(P.x + 4 + P.face * 3, P.y + 3, 1, { col: '#bfeaff', sp0: 2, sp1: 6, vy: -20, grav: -30, l0: 0.6, l1: 1.2 }); }\n      else P.vy = Math.min(380, P.vy + g2 * dt);\n    }")
    s = rep(s, "      const target = dir * RUN * (P.slow > 0 ? 0.5 : 1)", "      const target = dir * RUN * (Q.B.water ? (hasRelic(8) ? 0.95 : 0.8) : 1) * (P.slow > 0 ? 0.5 : 1)")
    # bubbles and spores in the air
    s = rep(s, "        case 'pollen': w.x += Math.sin(w.ph) * 8 * dt + 10 * dt;", "        case 'bubbles': w.y -= 22 * w.s * dt; w.x += Math.sin(w.ph * 2) * 8 * dt; break;\n        case 'spores': w.y -= 6 * w.s * dt; w.x += Math.sin(w.ph * 0.7) * 10 * dt; break;\n        case 'pollen': w.x += Math.sin(w.ph) * 8 * dt + 10 * dt;")
    s = rep(s, "        case 'pollen': g.fillStyle = 'rgba(255,246,192,.7)'; g.fillRect(x, y, 1, 1); break;", "        case 'bubbles': g.strokeStyle = 'rgba(200,240,255,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, w.s > 1 ? 2 : 1, 0, 7); g.stroke(); break;\n        case 'spores': { const a = 0.4 + 0.5 * Math.max(0, Math.sin(w.ph * 2)); g.globalAlpha = a; g.fillStyle = Math.floor(w.ph) % 2 ? '#c8f0a0' : '#c07bff'; g.fillRect(x, y, 2, 2); g.globalAlpha = 1; break; }\n        case 'pollen': g.fillStyle = 'rgba(255,246,192,.7)'; g.fillRect(x, y, 1, 1); break;")
    # the worm's rumble marker while it is underground
    s = rep(s, "      if (b.sk === 'ambush' && b.ph >= 1) {", """      if (b.sk === 'burrow' && b.ph === 1) {
        const mx = Math.round(b.tx - camX), gy2 = Math.round(groundYAt(b.tx) - camY), j = Math.round(Math.sin(Q.t * 40) * 2), bl = Math.floor(Q.t * 12) % 2;
        g.fillStyle = '#5a4430'; g.fillRect(mx - 18 + j, gy2 - 3, 36, 3); g.fillStyle = '#8a6a4a'; g.fillRect(mx - 12 - j, gy2 - 5, 24, 2);
        g.globalAlpha = 0.6; g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(mx - 22, gy2 - 1, 44, 2); g.fillRect(mx - 1, gy2 - 22, 3, 9); g.fillRect(mx - 1, gy2 - 11, 3, 3); g.globalAlpha = 1;
      }
      if (b.sk === 'ambush' && b.ph >= 1) {""")
    # under the sea: blue water tint and moving light
    s = rep(s, "  function drawWeather() {\n    const t = Q.wtype;", "  function drawWeather() {\n    const t = Q.wtype;\n    if (Q.B.water) { g.fillStyle = 'rgba(20,90,140,.16)'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 0.05 + Math.sin(Q.t * 0.7) * 0.02; g.fillStyle = '#bfeaff'; for (let i = 0; i < 6; i++) g.fillRect(((i * 73 + Q.t * 9) % (VW + 40)) - 20, 0, 10, VH); g.globalAlpha = 1; }")
    # data for the new lands
    blk = io.open('tools/maps10_game.txt', encoding='utf-8').read()
    s = rep(s, "  function frame(now) {", blk + "  function frame(now) {")
    s = rep(s, "  const EYE_COL = { meadow: '#ffe066',", "  const EYE_COL = { swamp: '#c8f0a0', ocean: '#6ee7f2', tunnels: '#ffb04a', meadow: '#ffe066',")
    return s
edit('src/game.js', game)
print('ok')
