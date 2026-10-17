import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

# ---------------------------------------------------------------- quocimg.js: the artist's boss pictures
def qimg(s):
    return s + """
// the Spore Queen, the Kraken and Gravemaw from the artist's sheet (cut by tools/cut_bosses.py), keyed by map index
const BOSS_IMG = {};
(function () {
  const L = { 7: 'sporequeen', 8: 'kraken', 9: 'gravemaw' };
  for (const k in L) { const img = new Image(); img.onload = () => { BOSS_IMG[k] = imgSprite(img, 0, 0, img.width, img.height); }; img.src = 'assets/bosses/' + L[k] + '.png'; }
})();
"""
edit('src/quocimg.js', qimg)

# ---------------------------------------------------------------- audio.js: horror voices
def audio(s):
    s = rep(s, "  function devilRoar(power) {", """  // horror voices for the deep bosses: 7 Spore Queen (wet hiss + gurgle), 8 Kraken (abyssal growl + bubbles), 9 Gravemaw (grinding rumble + screech)
  function monster(kind, evt, volf) {
    if (!ac) return; const t = ac.currentTime, v = volf === undefined ? 1 : volf, long = evt === 'alert' || evt === 'roar', ws = getDevilFx();
    const dur = long ? 1.6 : (evt === 'attack' ? 0.7 : (evt === 'hurt' ? 0.22 : 0.5));
    const osc = (type, f0, f1, vol, wob, wobHz, d, dest, delay) => { const st = t + (delay || 0), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, st); o.frequency.exponentialRampToValueAtTime(Math.max(18, f1), st + (d || dur));
      if (wob) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = wobHz; lg.gain.value = wob; l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + (d || dur) + 0.05); }
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(vol * v, st + Math.min(0.12, (d || dur) * 0.3)); g.gain.exponentialRampToValueAtTime(0.001, st + (d || dur));
      o.connect(g); g.connect(dest || ws); o.start(st); o.stop(st + (d || dur) + 0.05); };
    const bubbles = (n, f) => { for (let i = 0; i < n; i++) osc('sine', f * (0.8 + Math.random() * 0.8), f * 2.2, 0.05, 0, 0, 0.06, sfxG, i * (dur / n) + Math.random() * 0.05); };
    if (kind === 7) { noise(dur, 0.16 * v, 2500, t, sfxG); osc('sawtooth', 96, 60, 0.35, 9, 7); osc('triangle', 190, 140, 0.18, 30, 11); if (long || evt === 'attack') bubbles(long ? 14 : 6, 180); }
    else if (kind === 8) { osc('sawtooth', 44, 28, 0.55, 5, 4); osc('square', 88, 50, 0.3, 8, 6); osc('sine', 150, 70, 0.28, 0, 0, dur * 1.1, sfxG); noise(dur, 0.08 * v, 180, t, sfxG); bubbles(long ? 20 : 8, 120); }
    else { osc('sawtooth', 52, 34, 0.5, 22, 18); noise(dur, 0.2 * v, 90, t, sfxG); if (long || evt === 'attack') osc('sawtooth', 1100, 420, 0.12, 60, 23, dur * 0.7, ws, dur * 0.15); }
  }
  function devilRoar(power) {""")
    s = rep(s, "    const key = boss ? 'b' + kind : CMAP[kind];", "    if (boss && (kind === 7 || kind === 8 || kind === 9)) { monster(kind, evt, volf); return; }\n    const key = boss ? 'b' + kind : CMAP[kind];")
    s = rep(s, "  return { init, play, creature, devilRoar,", "  return { init, play, creature, monster, devilRoar,")
    return s
edit('src/audio.js', audio)

# ---------------------------------------------------------------- levels.js: a huge sea cave and a deep pit for the last two lands
def levels(s):
    s = rep(s, "  const H = 15, W = B.len + 100;", "  let H = 15; const W = B.len + 100;")
    a = s.index("  const ax0 = x, AW = li === 6 ? 48 : 44;")
    b = s.index("  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 7) * TS, y: 10 * TS });") + len("  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 7) * TS, y: 10 * TS });")
    s = s[:a] + """  // the Sunken Deep and the Deepdig Tunnels end in a huge cavern far below: the world gets deeper and you drop into it
  if (B.deep) { for (let k = 0; k < B.deep; k++) grid.push(grid[H - 1].map(c => (c === ' ' ? ' ' : '#'))); H += B.deep; L.H = H; }
  const ax0 = x, AW = B.arenaW || (li === 6 ? 48 : 44), AG = B.deep ? H - 3 : 10;   // every boss arena is wide, with platforms on several floors
  L.arena = { x0: ax0, x1: ax0 + AW, gy: AG };
  for (let i = 0; i < AW; i++) col(ax0 + i, AG);
  for (let i = 0; i < AW; i++) solidCol(ax0 + i, AG);
  for (let y = 0; y < H; y++) { set(ax0 + AW, y, '#'); set(ax0 + AW + 1, y, '#'); }
  if (B.deep) {   // the hole: the ground just before the arena opens into a long drop
    for (let i = 1; i <= 6; i++) { for (let y = 0; y < AG; y++) set(ax0 - i, y, ' '); solidCol(ax0 - i, AG); }
    for (let i = 7; i <= 8; i++) for (let y = 11; y < AG; y++) set(ax0 - i, y, '#');
    const rows = AG - 10;
    for (let k = 0; k < 6; k++) { const r = 10 + Math.round(rows * (k + 1) / 7), x0 = 3 + ((k * 13) % (AW - 12)); for (let xx = x0; xx < x0 + 6; xx++) set(ax0 + xx, r, '='); }
    for (let k = 0; k < 5; k++) { const r = AG - 3 - (k % 2) * 3, x0 = 6 + k * Math.floor((AW - 12) / 5); for (let xx = x0; xx < x0 + 5; xx++) set(ax0 + xx, r, '='); }
    L.checkpoints.push({ x: (ax0 - 10) * TS, y: 10 * TS, id: L.id++ });
  } else {
    const PLATS = li === 6 ? [[7, 5, 9], [7, 17, 21], [7, 29, 33], [7, 40, 44], [5, 11, 15], [5, 23, 27], [5, 34, 38], [3, 19, 23], [3, 30, 33]]
      : li % 2 ? [[7, 5, 9], [7, 16, 20], [7, 27, 31], [7, 37, 40], [5, 10, 14], [5, 21, 25], [5, 32, 35], [3, 15, 18], [3, 26, 29]]
      : [[7, 6, 10], [7, 18, 22], [7, 30, 34], [5, 12, 16], [5, 24, 28], [5, 36, 39], [3, 8, 11], [3, 19, 23], [3, 31, 34]];
    PLATS.forEach(p => { for (let xx = p[1]; xx <= p[2]; xx++) set(ax0 + xx, p[0], '='); });
    L.checkpoints.push({ x: (ax0 - 4) * TS, y: 10 * TS, id: L.id++ });
  }
  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 10) * TS, y: AG * TS });""" + s[b:]
    s = rep(s, "  L.endX = (ax0 + AW) * TS;", "  L.endX = (ax0 + AW) * TS;")
    s = rep(s, "    id: 'ocean', seed: 99, len: 560,", "    id: 'ocean', seed: 99, len: 560, deep: 10, arenaW: 66, zoom: 0.6,")
    s = rep(s, "    id: 'tunnels', seed: 111, len: 580,", "    id: 'tunnels', seed: 111, len: 580, deep: 14, arenaW: 52, zoom: 0.72,")
    return s
edit('src/levels.js', levels)

# ---------------------------------------------------------------- game.js
def game(s):
    # a zoomable view: VW/VH are shadowed so the world can be drawn wider while the HUD stays the same
    s = rep(s, "(function () {\n  const cv = document.getElementById('game'), ctx = cv.getContext('2d');", "(function () {\n  const BVW = VW, BVH = VH;\n  let VW = BVW, VH = BVH;   // the world view; widened while the camera zooms out (huge sea cave, deep pit)\n  const cv = document.getElementById('game'), ctx = cv.getContext('2d');")
    s = rep(s, "  const lightC = document.createElement('canvas'); lightC.width = VW; lightC.height = VH;", "  const lightC = document.createElement('canvas'); lightC.width = Math.ceil(VW / 0.55); lightC.height = Math.ceil(VH / 0.55);")
    s = rep(s, "  function updateCam(dt) {\n", """  function updateCam(dt) {
    { const L = Q.L, B = Q.B, tz = B.zoom && !Q.bossDead && L.arena && Q.P.x > (L.arena.x0 - 9) * TS ? B.zoom : 1; Q.zoom = (Q.zoom || 1) + (tz - (Q.zoom || 1)) * Math.min(1, dt * 2.2); if (Math.abs(Q.zoom - tz) < 0.002) Q.zoom = tz; }
    VW = BVW / (Q.zoom || 1); VH = BVH / (Q.zoom || 1);
    try { updateCam0(dt); } finally { VW = BVW; VH = BVH; }
  }
  function updateCam0(dt) {
""")
    s = rep(s, "    drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGrade(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y));",
               "    { const z = Q.zoom || 1; if (z !== 1) { VW = BVW / z; VH = BVH / z; g.save(); g.scale(z, z); }\n      try { drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGrade(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y)); }\n      finally { if (z !== 1) { g.restore(); VW = BVW; VH = BVH; } } }")
    s = rep(s, "    g.drawImage(Q.bg.sky, 0, 0);\n", "    g.drawImage(Q.bg.sky, 0, 0, VW, VH);\n")
    s = rep(s, "      const y = Math.round(ly.anchor === 'top' ? ly.y - camY * 0.1 + 24 * 0.1 : ly.y + (24 - cam.y) * ly.f);", "      const y = Math.round(ly.anchor === 'top' ? ly.y - camY * 0.1 + 24 * 0.1 : ly.y + (24 - cam.y) * ly.f + (VH - BVH) + Math.max(0, cam.y - (Q.L.H - 15) * TS) * 0);")
    s = rep(s, "    if (!vignette) {", "    if (!vignette || vignette.width !== Math.ceil(VW)) {")
    s = rep(s, "const [c, x] = mkCanvas(VW, VH), v = x.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62);", "const [c, x] = mkCanvas(Math.ceil(VW), Math.ceil(VH)), v = x.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62);")
    # the artist's boss pictures + creature motion
    s = rep(s, "    { const fr = bossFrame(b); if (fr) b.spr = fr; }\n    const c = b.cfg,", "    { const fr = bossFrame(b); if (fr) b.spr = fr; }\n    if (typeof BOSS_IMG !== 'undefined' && BOSS_IMG[Q.li] && b.cfg === BOSS[Q.li]) b.spr = BOSS_IMG[Q.li];\n    const c = b.cfg,")
    s = rep(s, "    drawSprT(g, b.spr, x + P.ox, bot + bob + P.oy, b.dir < 0, b.flash > 0 || tele || b.revT > 0, P.sx, P.sy, P.rot, al);", "    drawSprT(g, b.spr, x + P.ox, bot + bob + P.oy, b.dir < 0, b.flash > 0 || tele || b.revT > 0, P.sx * (c.artScale || 1), P.sy * (c.artScale || 1), P.rot, al);")
    s = rep(s, "    if (b.guard > 0) { sx *= 1.05; sy *= 0.94; }\n    return { sx, sy, rot, ox, oy, al, aura, circle };", """    if (b.guard > 0) { sx *= 1.05; sy *= 0.94; }
    // living creatures: the mushroom sways and breathes, the kraken floats and pulses, the worm writhes
    const art = b.cfg.art, mv = b.moveT > 0 || b.st === 'evade';
    if (art === 'shroom') { rot += Math.sin(t * (mv ? 8 : 1.6)) * (mv ? 0.08 : 0.045); sy *= 1 + 0.04 * Math.sin(t * 2.1); sx *= 1 - 0.03 * Math.sin(t * 2.1); if (mv) oy -= Math.abs(Math.sin(t * 8)) * 2.5; }
    else if (art === 'kraken') { oy += Math.sin(t * 1.8) * 5 - 3; rot += Math.sin(t * 1.2) * 0.04; sx *= 1 + 0.05 * Math.sin(t * (mv ? 6 : 2.4)); sy *= 1 - 0.035 * Math.sin(t * (mv ? 6 : 2.4)); }
    else if (art === 'worm') { rot += Math.sin(t * (mv ? 7 : 3)) * 0.09; sx *= 1 + 0.06 * Math.sin(t * (mv ? 12 : 6)); sy *= 1 - 0.05 * Math.sin(t * (mv ? 12 : 6) + 1); }
    return { sx, sy, rot, ox, oy, al, aura, circle };""")
    s = rep(s, "{ name: { en: 'Spore Queen', vi: 'Nữ Hoàng Bào Tử' }, w: 40, h: 46,", "{ name: { en: 'Spore Queen', vi: 'Nữ Hoàng Bào Tử' }, art: 'shroom', w: 64, h: 88,")
    s = rep(s, "{ name: { en: 'Abyssal Kraken', vi: 'Thủy Quái Kraken' }, w: 52, h: 44,", "{ name: { en: 'Abyssal Kraken', vi: 'Thủy Quái Kraken' }, art: 'kraken', artScale: 1.35, w: 170, h: 150,")
    s = rep(s, "{ name: { en: 'Gravemaw the Great Worm', vi: 'Sâu Khổng Lồ Gravemaw' }, w: 44, h: 44,", "{ name: { en: 'Gravemaw the Great Worm', vi: 'Sâu Khổng Lồ Gravemaw' }, art: 'worm', artScale: 1.15, w: 84, h: 108,")
    # regeneration: a boss left alone for 30s slowly heals; living effects + growls
    s = rep(s, "    if (b.st === 'intro') { b.timer += dt;", """    if (b.st !== 'intro' && !b.morph) {
      if (b.lastHit === undefined) b.lastHit = Q.t;
      if (Q.t - b.lastHit > 30 && b.max && b.hp < b.max) {
        b.hp = Math.min(b.max, b.hp + b.max * 0.015 * dt); b.regT = (b.regT || 0) - dt;
        if (Math.random() < 0.3) emit(b.x + rr(0, b.w), b.y + rr(0, b.h), 1, { col: ['#7ed957', '#d8ff9a', '#fff'], sp0: 5, sp1: 20, grav: -40, l0: 0.4, l1: 0.8 });
        if (b.regT <= 0) { b.regT = 2; pop(b.x + b.w / 2, b.y - 8, save.lang === 'vi' ? 'BOSS ĐANG HỒI MÁU!' : 'THE BOSS IS HEALING!', '#7ed957'); }
      }
      if (b.cfg.art) {
        b.growlT = (b.growlT === undefined ? 3 : b.growlT) - dt; if (b.growlT <= 0) { b.growlT = rr(4, 7); Snd.creature(Q.li, 'idle', true, 0.8); }
        const cxm2 = b.x + b.w / 2;
        if (b.cfg.art === 'shroom' && Math.random() < 0.25) emit(cxm2 + rr(-b.w / 2, b.w / 2), b.y + rr(0, b.h * 0.3), 1, { col: ['#c8f0a0', '#c07bff', '#a4ffc0'], sp0: 3, sp1: 14, grav: -18, l0: 0.8, l1: 1.6 });
        else if (b.cfg.art === 'kraken' && Math.random() < 0.3) emit(cxm2 + rr(-b.w / 3, b.w / 3), b.y + rr(b.h * 0.2, b.h * 0.6), 1, { col: ['#bfeaff', '#fff'], sp0: 3, sp1: 10, grav: -60, l0: 0.8, l1: 1.6 });
        else if (b.cfg.art === 'worm' && Math.random() < 0.2) emit(cxm2 + rr(-b.w / 2, b.w / 2), b.y + b.h - 4, 1, { col: ['#8a6a4a', '#5a4430'], sp0: 10, sp1: 40, vy: -40, grav: 300, l0: 0.4, l1: 0.8 });
      }
    }
    if (b.st === 'intro') { b.timer += dt;""")
    s = rep(s, "    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.invul > 0 || b.dead) return;", "    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.invul > 0 || b.dead) return;\n    b.lastHit = Q.t;")
    # swimming: the hero tilts and kicks while swimming, and can swing in any direction underwater
    s = rep(s, "    const x = Math.round(P.x + P.w / 2 - camX), bot = Math.round(P.y + P.h - camY);\n    const hh = P.hero", """    const x = Math.round(P.x + P.w / 2 - camX), bot = Math.round(P.y + P.h - camY);
    const swim = Q.B.water && !P.onGround;
    if (swim) { const rot = clamp(-P.vy / 320, -0.45, 0.45) * P.face + (P.atk > 0 ? P.face * 0.15 : 0); g.save(); g.translate(x, bot - 10); g.rotate(rot); g.translate(-x, -(bot - 10)); }
    const hh = P.hero""")
    s = rep(s, "    if (!P.onGround) spr = getSprite(P.vy < 0 ? 'hero_jump' : 'hero_fall', swp, 0);", "    if (swim) spr = getSprite('hero_run', swp, Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 4);\n    else if (!P.onGround) spr = getSprite(P.vy < 0 ? 'hero_jump' : 'hero_fall', swp, 0);")
    s = rep(s, "    if (hh && hh.hat) drawHat(hh, x, bot, P.face);\n    if (coop) drawCoopTag(P, x, bot);\n  }", "    if (hh && hh.hat) drawHat(hh, x, bot, P.face);\n    if (swim) g.restore();\n    if (coop) drawCoopTag(P, x, bot);\n  }")
    s = rep(s, "  function doSwing(it) {\n    const P = Q.P, st = it.st, f = P.face;", "  function doSwing(it) {\n    const P = Q.P, st = it.st, f = P.face;\n    if (Q.B.water && !P.onGround) { P.vx += f * 70; if (act.up) P.vy = Math.min(P.vy, -90); emit(P.x + 4, P.y + 7, 6, { col: ['#bfeaff', '#fff'], sp0: 10, sp1: 40, vx: -f * 40, grav: -40 }); }")
    return s
edit('src/game.js', game)
print('ok')
