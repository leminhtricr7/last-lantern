import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

# ---------------------------------------------------------------- art.js
def art(s):
    # two more ground textures per land: embedded stones, roots, fossils, gems, ice, lava veins...
    s = rep(s, "  T.body = [body(0, G.body, G.dark, G.light), body(1, G.body, G.dark, G.light)];", """  T.body = [body(0, G.body, G.dark, G.light), body(1, G.body, G.dark, G.light)];
  { const EMB = { meadow: ['#a8a8b8', '#6a5a44', 'root'], forest: ['#8a8a9a', '#3a6a3a', 'root'], caves: ['#6ee7f2', '#c07bff', 'gem'], desert: ['#f6efe0', '#c8964a', 'bone'], frost: ['#ffffff', '#9fe0f0', 'gem'],
      volcano: ['#ff7a2a', '#ffd34e', 'vein'], citadel: ['#c9a0ff', '#6a3aa8', 'gem'], swamp: ['#a4ffc0', '#3a6a2a', 'root'], ocean: ['#ffd0e0', '#f6efe0', 'shell'], tunnels: ['#ffd34e', '#c8c0b0', 'gem'] }[B.id] || ['#aaa', '#777', 'root'];
    for (let v = 0; v < 2; v++) {
      const c = body(0, G.body, G.dark, G.light), x = c.getContext('2d');
      // a buried stone
      x.fillStyle = G.dark; x.fillRect(3 + v * 6, 9 - v * 4, 6, 4); x.fillStyle = '#9a9aa8'; x.fillRect(4 + v * 6, 9 - v * 4, 4, 3); x.fillStyle = '#c8c8d4'; x.fillRect(4 + v * 6, 9 - v * 4, 2, 1);
      if (EMB[2] === 'root') { x.fillStyle = EMB[1]; for (let i = 0; i < 9; i++) x.fillRect(10 - v * 7 + Math.round(Math.sin(i * 0.9) * 1.5), i + 1, 1, 1); }
      else if (EMB[2] === 'gem') { x.fillStyle = EMB[0]; x.fillRect(11 - v * 8, 3 + v * 7, 2, 3); x.fillStyle = EMB[1]; x.fillRect(12 - v * 8, 4 + v * 7, 2, 2); x.fillStyle = '#fff'; x.fillRect(11 - v * 8, 3 + v * 7, 1, 1); }
      else if (EMB[2] === 'bone') { x.fillStyle = EMB[0]; x.fillRect(9 - v * 6, 3 + v * 8, 5, 1); x.fillRect(9 - v * 6, 2 + v * 8, 1, 3); x.fillRect(13 - v * 6, 2 + v * 8, 1, 3); }
      else if (EMB[2] === 'vein') { x.fillStyle = EMB[0]; for (let i = 0; i < 10; i++) x.fillRect(2 + i, 6 + v * 5 + Math.round(Math.sin(i * 0.8) * 2), 1, 1); x.fillStyle = EMB[1]; x.fillRect(6, 6 + v * 5, 1, 1); }
      else if (EMB[2] === 'shell') { x.fillStyle = EMB[0]; x.fillRect(10 - v * 7, 4 + v * 6, 3, 2); x.fillRect(11 - v * 7, 3 + v * 6, 1, 1); }
      T.body.push(c);
    } }""")
    # platforms in the style of each land: planks with nails, stone slabs, metal grates or coral
    a = s.index("  // one-way platform\n  { const [c, x] = mkCanvas(16, 8);")
    b = s.index("    T.plat = c; }", a) + len("    T.plat = c; }")
    s = s[:a] + """  // one-way platform, styled for each land
  { const [c, x] = mkCanvas(16, 8), st = { caves: 'stone', frost: 'ice', citadel: 'stone', volcano: 'metal', ocean: 'coral', tunnels: 'wood' }[B.id] || 'wood';
    if (st === 'wood') {
      x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 5); x.fillStyle = B.plat[1]; x.fillRect(0, 5, 16, 2); x.fillRect(0, 0, 16, 1); x.fillRect(7, 0, 1, 5); x.fillRect(15, 0, 1, 5);
      x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(1, 1, 5, 1); x.fillRect(9, 1, 5, 1); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(2, 3, 3, 1); x.fillRect(10, 2, 4, 1);
      x.fillStyle = '#c8c8d4'; x.fillRect(1, 2, 1, 1); x.fillRect(5, 2, 1, 1); x.fillRect(9, 2, 1, 1); x.fillRect(13, 2, 1, 1);
    } else if (st === 'stone' || st === 'ice') {
      x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 6); x.fillStyle = B.plat[1]; x.fillRect(0, 6, 16, 2); x.fillRect(5, 0, 1, 6); x.fillRect(11, 2, 1, 4);
      x.fillStyle = st === 'ice' ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.22)'; x.fillRect(0, 0, 16, 1); x.fillRect(1, 1, 3, 1); x.fillRect(7, 1, 3, 1);
      if (st === 'ice') { x.fillStyle = '#e8fbff'; x.fillRect(3, 6, 1, 2); x.fillRect(12, 6, 1, 2); }
    } else if (st === 'metal') {
      x.fillStyle = '#3a3a44'; x.fillRect(0, 0, 16, 6); x.fillStyle = '#5a5a66'; x.fillRect(0, 0, 16, 1); x.fillStyle = '#1c1c22'; for (let i = 0; i < 4; i++) x.fillRect(1 + i * 4, 2, 2, 3); x.fillStyle = '#ff7a2a'; x.fillRect(2, 3, 1, 1); x.fillRect(10, 3, 1, 1); x.fillStyle = '#2a2a30'; x.fillRect(0, 6, 16, 2);
    } else {
      x.fillStyle = B.plat[0]; x.fillRect(0, 1, 16, 5); x.fillStyle = B.plat[1]; x.fillRect(0, 6, 16, 2); x.fillStyle = '#ffb0c8'; for (let i = 0; i < 6; i++) x.fillRect(1 + i * 3, i % 2, 2, 2); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(3, 2, 2, 1); x.fillRect(11, 3, 2, 1);
    }
    T.plat = c; }""" + s[b:]
    # a landmark layer between the far hills and the mid layer
    s = rep(s, "    bg.layers.push({ c, f: 0.12, y: 56, anchor: 'bottom' }); }", "    bg.layers.push({ c, f: 0.12, y: 56, anchor: 'bottom' }); }\n  { const [c, x] = mkCanvas(W, 170); if (typeof paintLandmark === 'function') paintLandmark(B, x, W); bg.layers.push({ c, f: 0.2, y: 46, anchor: 'bottom' }); }")
    return s
edit('src/art.js', art)

# ---------------------------------------------------------------- levels.js
def levels(s):
    s = rep(s, "    for (let i = 0; i < n; i++) if (rnd() < 0.2) L.decor.push(", "    for (let i = 0; i < n; i++) if (rnd() < 0.32) L.decor.push(")
    # hidden nooks: a patch of ground that is not really there, with a small treasure room under it
    s = rep(s, "  { const cand = [];\n    for (let x = 12;", """  { const rn = mulberry32(777 + li * 131), endX = (L.arena ? L.arena.x0 : W) - 8, nooks = [];
    const topOf = x => { for (let y = 3; y < H - 1; y++) if (L.grid[y][x] === '#') return L.grid[y - 1][x] === ' ' ? y : -1; return -1; };
    const busy = x => L.spawns.some(sp => Math.abs(sp.x / TS - x) < 4) || L.checkpoints.some(cp => Math.abs(cp.x / TS - x) < 5);
    for (let part = 0; part < 3; part++) {
      const a = Math.floor(20 + (endX - 20) * part / 3), b = Math.floor(20 + (endX - 20) * (part + 1) / 3);
      for (let tries = 0; tries < 40; tries++) {
        const x0 = a + Math.floor(rn() * Math.max(1, b - a - 6)), y = topOf(x0); if (y < 0 || y + 3 > H - 1) continue;
        let ok = true; for (let i = 0; i < 5 && ok; i++) { if (topOf(x0 + i) !== y) ok = false; for (let k = 0; k < 4 && ok; k++) if (L.grid[y + k][x0 + i] !== '#') ok = false; }
        if (!ok || busy(x0 + 2)) continue;
        for (let i = 1; i <= 3; i++) { L.grid[y][x0 + i] = 'F'; L.grid[y + 1][x0 + i] = ' '; L.grid[y + 2][x0 + i] = ' '; }
        nooks.push({ x: x0, y }); break;
      }
    }
    nooks.forEach((n, i) => {
      for (let k = 1; k <= 3; k++) L.spawns.push({ id: L.id++, type: 'coin', x: (n.x + k) * TS + TS / 2, y: (n.y + 2) * TS + 2 });
      const fx = (n.x + 2) * TS + TS / 2, fy = (n.y + 3) * TS;
      if (i === 0 && typeof EGGS !== 'undefined' && EGGS[B.id]) L.spawns.push({ id: L.id++, type: 'egg', k: B.id, x: fx, y: fy });
      else if (i === 1 && typeof ORB_MAPS !== 'undefined' && ORB_MAPS.indexOf(li) >= 0) L.spawns.push({ id: L.id++, type: 'orb', n: ORB_MAPS.indexOf(li) + 1, x: fx, y: fy - 6 });
      else L.spawns.push({ id: L.id++, type: 'heart', x: fx, y: fy });
    });
    L.nooks = nooks; }
  { const cand = [];
    for (let x = 12;""")
    return s
edit('src/levels.js', levels)

# ---------------------------------------------------------------- game.js
def game(s):
    # the fake ground of a hidden nook is drawn like ground but you fall through it
    s = rep(s, "      if (c === '#') g.drawImage((above === '#' || above === 'I' || above === 'C') ? ts.body[v] : ts.top[v], dx, dy);",
               """      if (c === '#' || c === 'F') {
        const isTop = !(above === '#' || above === 'I' || above === 'C'), h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
        if (c === 'F') { const near = Math.abs(Q.P.x - tx * TS) < 40 && Math.abs(Q.P.y - ty * TS) < 40; g.globalAlpha = near ? 0.35 : 1; }
        g.drawImage(isTop ? ts.top[v] : ts.body[h % ts.body.length], dx, dy);
        if (c === 'F') { g.globalAlpha = 1; if (Math.sin(Q.t * 2 + tx) > 0.97) { g.fillStyle = '#fff'; g.fillRect(dx + (h % 12) + 2, dy + 1, 1, 1); } }
        else decoTile(tx, ty, dx, dy, isTop, h);
      }""")
    s = rep(s, "      else if (c === '=') g.drawImage(ts.plat, dx, dy);", "      else if (c === '=') { g.drawImage(ts.plat, dx, dy); platEnds(tx, ty, dx, dy); }")
    # sky life + haze behind the level, props, foreground
    s = rep(s, "    g.drawImage(Q.bg.sky, 0, 0);\n    drawSun();\n", "    g.drawImage(Q.bg.sky, 0, 0);\n    drawSun();\n    drawSkyLife(camX, camY);\n")
    s = rep(s, "    if (Q.li === 6 && Q.boss && Q.boss.id === 'quoc' && Q.arenaSealed && Q.boss.fi > 0) drawFormScene(Q.boss.fi);",
               "    { const hz = g.createLinearGradient(0, VH * 0.42, 0, VH); hz.addColorStop(0, hexA(B.sky[2], 0)); hz.addColorStop(1, hexA(B.sky[2], B.dark > 0.5 ? 0.1 : 0.22)); g.fillStyle = hz; g.fillRect(0, VH * 0.42, VW, VH * 0.58); }\n    if (Q.li === 6 && Q.boss && Q.boss.id === 'quoc' && Q.arenaSealed && Q.boss.fi > 0) drawFormScene(Q.boss.fi);")
    s = rep(s, "    // moving platforms\n    for (const p of L.plats) {", "    drawProps(camX, camY);\n    // moving platforms\n    for (const p of L.plats) {")
    s = rep(s, "    for (const p of Q.parts) { g.globalAlpha = clamp(p.life / 0.4, 0, 1); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); }\n    g.globalAlpha = 1;\n  }",
               "    for (const p of Q.parts) { g.globalAlpha = clamp(p.life / 0.4, 0, 1); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); }\n    g.globalAlpha = 1;\n    drawForeground(camX, camY);\n  }")
    s = rep(s, "    drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y));",
               "    drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGrade(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y));")
    s = rep(s, "    for (const d of Q.L.decor) { if (Q.B.decor[d.k][0] === 'torch'", "    if (Q.scn) for (const p of Q.scn.props) if (PROP_GLOW[p.k]) addL(p.x, p.y - 10, 40, 0.8);\n    for (const d of Q.L.decor) { if (Q.B.decor[d.k][0] === 'torch'")
    s = rep(s, "    initCreeps();\n    snapCam();\n    scene = 'play';", "    initCreeps();\n    Q.scn = buildScene();\n    snapCam();\n    scene = 'play';")
    s = rep(s, "txt((save.lang === 'vi' ? 'MÀN ' : 'LEVEL ') + (Q.li + 1),", "txt((save.lang === 'vi' ? 'MÀN ' : 'LEVEL ') + (LPOS(Q.li) + 1),")
    # easter eggs and wish orbs
    s = rep(s, "      else if (s.type === 'rare') {", """      else if (s.type === 'egg') Q.items.push({ kind: 'egg', k: s.k, x: s.x, y: s.y, id: s.id, ph: 0 });
      else if (s.type === 'orb') { if (save.orbs.indexOf(Q.li) < 0) Q.items.push({ kind: 'orb', n: s.n, x: s.x, y: s.y, id: s.id, ph: Math.random() * 6 }); }
      else if (s.type === 'rare') {""")
    s = rep(s, "      } else if (it.kind === 'rare') {\n        if (d < 13) {", """      } else if (it.kind === 'egg') {
        if (d < 26 && !it.seen && Q.state === 'play') { it.seen = true; const E = EGGS[it.k]; const first = !save.eggs[it.k]; save.eggs[it.k] = 1; writeSave(); Snd.play('relic'); emit(it.x, it.y - 10, 20, { col: ['#ffd34e', '#fff', '#ff7fb0'], sp0: 20, sp1: 70 });
          startScripted('narr', [{ en: E.en, vi: E.vi }, { en: 'Secret found! (' + Object.keys(save.eggs).length + ' / ' + Object.keys(EGGS).length + ')' + (first ? ' +1 Star Gem' : ''), vi: 'Tìm thấy bí mật! (' + Object.keys(save.eggs).length + ' / ' + Object.keys(EGGS).length + ')' + (first ? ' +1 Ngọc Sao' : '') }], null); if (first) save.rare++; }
      } else if (it.kind === 'orb') {
        if (d < 13) {
          it.dead = true; if (save.orbs.indexOf(Q.li) < 0) save.orbs.push(Q.li); writeSave(); Snd.play('shard'); emit(it.x, it.y, 30, { col: ['#ffb04a', '#ffd34e', '#fff'], sp0: 20, sp1: 120 }); addRing(it.x, it.y, '#ffb04a', 40, 0.5);
          if (save.orbs.length >= 7 && !save.wish) { save.wish = 1; writeSave(); Q.wishT = 9; Snd.devilRoar && Snd.play('boom');
            startScripted('narr', [{ en: 'The seven Wish Orbs shine together... the sky turns dark... and a great green dragon rises from the light!', vi: 'Bảy viên Ngọc Ước cùng phát sáng... bầu trời tối sầm... và một con rồng xanh khổng lồ bay lên từ ánh sáng!' },
              { en: '"SPEAK YOUR WISH, LITTLE FLAME. I SHALL GRANT ONE."', vi: '"HÃY NÓI ĐIỀU ƯỚC CỦA NGƯƠI, NGỌN LỬA NHỎ. TA SẼ BAN MỘT ĐIỀU."' },
              { en: 'You wish for the strength to protect everyone. (+1 max heart, +1 damage, +10 Star Gems!)', vi: 'Bạn ước có sức mạnh để bảo vệ mọi người. (+1 tim tối đa, +1 sát thương, +10 Ngọc Sao!)' }],
              () => { save.bonusHP = Math.min(6, save.bonusHP + 1); save.bonusDmg = Math.min(4, save.bonusDmg + 1); save.rare += 10; writeSave(); Q.P.hp = maxHP(); });
          } else { Q.msg = sv('Wish Orb with ', 'Ngọc Ước ') + it.n + sv(' stars! (', ' sao! (') + save.orbs.length + '/7)' + sv(' Gather all seven...', ' Hãy gom đủ bảy viên...'); Q.msgT = 4; }
        }
      } else if (it.kind === 'rare') {
        if (d < 13) {""")
    s = rep(s, "      } else if (it.kind === 'rare') {\n        const by = y + Math.round(Math.sin(it.ph * 3) * 2);", """      } else if (it.kind === 'egg') {
        drawSpr(g, eggSprite(EGGS[it.k].k), x, y, false);
        if (!it.seen && Math.sin(Q.t * 3 + it.x) > 0.6) { g.fillStyle = '#fff'; g.fillRect(x + 6, y - 20, 1, 3); g.fillRect(x + 5, y - 19, 3, 1); }
      } else if (it.kind === 'orb') {
        const by = y + Math.round(Math.sin(it.ph * 2) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 11, '#ffb04a'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawSpr(g, eggSprite('wishorb'), x, by + 7, false);
        g.fillStyle = '#e0453a'; for (let k = 0; k < it.n; k++) { const a = k / Math.max(1, it.n) * 6.283; g.fillRect(Math.round(x + (it.n > 1 ? Math.cos(a) * 2.5 : 0)) - 1, Math.round(by + 1 + (it.n > 1 ? Math.sin(a) * 2.5 : 0)) - 1, 2, 2); }
      } else if (it.kind === 'rare') {
        const by = y + Math.round(Math.sin(it.ph * 3) * 2);""")
    s = rep(s, "  save.rare = save.rare | 0;", "  if (!Array.isArray(save.orbs)) save.orbs = []; if (!save.eggs || typeof save.eggs !== 'object') save.eggs = {};\n  save.rare = save.rare | 0;")
    # checkpoint autosave on this device + resume from the title screen
    s = rep(s, "Q.cp = { x: it.x, y: it.y, id: it.id }; Snd.play('checkpoint');", "Q.cp = { x: it.x, y: it.y, id: it.id }; Snd.play('checkpoint'); saveResume(); pop(it.x, it.y - 34, sv('Progress saved', 'Đã lưu tiến trình'), '#a4ffc0');")
    s = rep(s, "    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);", "    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);\n    if (save.resume && save.resume.li === Q.li) delete save.resume;")
    s = rep(s, "    const it = [];\n    if (save.cleared.length || UNLOCK_ALL)", "    const it = [];\n    if (save.resume && BIOMES[save.resume.li]) it.push({ k: 'resume', fn: resumeLevel });\n    if (save.cleared.length || UNLOCK_ALL)")
    s = rep(s, "      let s = T(it.k); if (it.k === 'sound')", "      let s = it.k === 'resume' ? sv('Resume: map ', 'Chơi tiếp: map ') + (LPOS(save.resume.li) + 1) + ' ' + LN(BIOMES[save.resume.li].name) : T(it.k); if (it.k === 'sound')")
    s = rep(s, "  function completeLevel() {", """  function saveResume() {
    if (coop || DEMO) return;
    save.resume = { li: Q.li, cp: Q.cp, taken: [...Q.taken], solved: [...Q.solved], brokenX: [...Q.brokenX], trialsDone: [...Q.trialsDone], dragonsDone: [...Q.dragonsDone], minisDone: [...Q.minisDone], coinsRun: Q.coinsRun, time: Q.time, cpCount: Q.cpCount || 0, midDone: !!Q.midDone, ammo: save.ammo };
    writeSave();
  }
  function resumeLevel() {
    const r = save.resume; if (!r || !BIOMES[r.li]) return;
    startLevel(r.li);
    Q.taken = new Set(r.taken || []); Q.solved = new Set(r.solved || []); Q.brokenX = new Set(r.brokenX || []); Q.trialsDone = new Set(r.trialsDone || []); Q.dragonsDone = new Set(r.dragonsDone || []); Q.minisDone = new Set(r.minisDone || []);
    Q.cp = r.cp; Q.cpCount = r.cpCount; Q.midDone = r.midDone; Q.coinsRun = r.coinsRun || 0; Q.time = r.time || 0;
    initEntities(); Q.scn = buildScene();
    if (Q.cp) { Q.P.x = Q.cp.x - Q.P.w / 2; Q.P.y = Q.cp.y - Q.P.h; Q.safe = { x: Q.P.x, y: Q.P.y }; }
    snapCam(); Q.state = 'intro'; Q.stateT = 0; Q.msg = sv('Welcome back! Continuing from your last checkpoint.', 'Chào mừng trở lại! Chơi tiếp từ checkpoint cuối.'); Q.msgT = 4;
  }
  function completeLevel() {""")
    s = rep(s, "cont: { en: 'Continue', vi: 'Tiếp tục' },", "cont: { en: 'Continue', vi: 'Tiếp tục' }, resume: { en: 'Resume', vi: 'Chơi tiếp' },")
    # wish dragon flying across the sky
    s = rep(s, "    drawSkyLife(camX, camY);\n", "    drawSkyLife(camX, camY);\n    if (Q.wishT > 0) drawWishDragon();\n")
    s = rep(s, "    if (Q.msgT > 0) Q.msgT -= dt;\n    updatePlats(dt);", "    if (Q.msgT > 0) Q.msgT -= dt;\n    if (Q.wishT > 0) Q.wishT -= dt;\n    updatePlats(dt);")
    blk = io.open('tools/scenery_game.txt', encoding='utf-8').read()
    s = rep(s, "  function frame(now) {", blk + "  function frame(now) {")
    return s
edit('src/game.js', game)

h = io.open('index.html', encoding='utf-8').read()
if 'scenery.js' not in h:
    h = h.replace('<script src="src/levels.js"></script>', '<script src="src/scenery.js"></script>\n<script src="src/levels.js"></script>')
    io.open('index.html', 'w', encoding='utf-8').write(h)
print('ok')
