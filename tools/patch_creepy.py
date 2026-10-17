import io
# ---------------- art: creepy decor + watcher silhouette ----------------
p = 'src/art.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:80]
    s = s.replace(old, new, cnt)


rep("  torch: ['..c..', '.cwc.', '..n..', '..n..', '..n..', '..n..']\n};", u"""  torch: ['..c..', '.cwc.', '..n..', '..n..', '..n..', '..n..'],
  skull: ['.eee.', 'ekeke', 'eeeee', '.eke.', 'eeeeeee'],
  grave: ['.ddd.', 'dldld', 'ddddd', 'dldDd', 'ddddd', 'DDDDD'],
  ribs: ['e.e.e', 'eeeee', 'e.e.e', 'e.e.e', '.eEe.'],
  webc: ['wwwww', 'w.w..', 'ww.w.', 'w..w.', 'w...w']
};""")
rep("// leek sword (Lyra's gift)", u"""// tall black figure that watches from the dark (drawn before the darkness overlay so the lantern reveals it)
function watcherSprite() {
  if (_cache.watcher) return _cache.watcher;
  _cache.watcher = paint(14, 34, P => {
    P.ell(7, 4, 3, 4, 'k'); P.tri(7, 8, 1, 33, 13, 33, 'k'); P.rect(5, 8, 4, 12, 'k'); P.tri(3, 12, 0, 26, 5, 20, 'k'); P.tri(11, 12, 14, 26, 9, 20, 'k');
    for (let i = 0; i < 4; i++) P.tri(1 + i * 3, 31, 4 + i * 3, 31, 2 + i * 3, 34, 'k');
    P.px(6, 4, '#14121f'); P.px(8, 4, '#14121f');
  }, '#2a2540');
  return _cache.watcher;
}

// leek sword (Lyra's gift)""")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- audio: whisper + sting ----------------
p = 'src/audio.js'
s = io.open(p, encoding='utf-8').read()
rep("  function hero(evt) {", u"""  function whisper() {
    if (!ac) return;
    const t = ac.currentTime, src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 9;
    bp.frequency.setValueAtTime(500 + Math.random() * 500, t); bp.frequency.linearRampToValueAtTime(900 + Math.random() * 1100, t + 1.5);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.55); g.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
    src.connect(bp); bp.connect(g); g.connect(sfxG); src.start(t, Math.random() * 0.5); src.stop(t + 1.8);
    voice({ f0: 105, f1: 66, type: 'sawtooth', dur: 1.6, vol: 0.05, wob: 18, wobHz: 5, lp: 380 });
  }
  function sting() { voice({ f0: 1900, f1: 520, type: 'square', dur: 0.28, vol: 0.05, wob: 160, wobHz: 38 }); voice({ f0: 300, f1: 120, type: 'sawtooth', dur: 0.4, vol: 0.08, lp: 600 }); }
  function hero(evt) {""")
rep("return { init, play, creature, hero, blip, music,", "return { init, play, creature, hero, blip, whisper, sting, music,")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- levels: dark zones + creepy decor ----------------
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()
rep("gates: [], xwalls: [], trials: [], id: 0 };", "gates: [], xwalls: [], trials: [], dark: [], creep: [], id: 0 };")
rep("  const ax0 = x;\n  L.arena = { x0: ax0, x1: ax0 + 30, gy: 10 };", u"""  // ---- dark zones: every map has pitch-black stretches full of creepy things ----
  { const zn = li >= 2 ? 3 : 2, groundRow = tx => { for (let y = 3; y < H - 2; y++) if (grid[y][tx] === '#' || grid[y][tx] === 'I') return y; return 10; };
    for (let i = 0; i < zn; i++) {
      const cx = Math.floor(B.len * (0.2 + 0.58 * (i + 0.5) / zn)), z = { x0: cx - 20, x1: cx + 20, a: Math.max(0.82, B.dark + 0.2) };
      L.dark.push(z);
      for (let tx = z.x0; tx < z.x1; tx += R(3, 6)) { const gr = groundRow(tx); if (grid[gr - 1][tx] === ' ') L.creep.push({ x: tx * TS + R(2, 12), y: gr * TS, k: R(0, 3) }); }
    } }
  const ax0 = x;
  L.arena = { x0: ax0, x1: ax0 + 30, gy: 10 };""")
rep("const k = (li > 0 ? 2 : 1) + (rnd() < 0.45 ? 1 : 0) + (li >= 2 ? 1 : 0);", "const k = 2 + (rnd() < 0.45 ? 1 : 0) + (li >= 2 ? 1 : 0);")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- game: creeps ----------------
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
rep("  function initWeather() {", u"""  // ---------- creepy darkness: eyes, watchers, fog, whispers ----------
  const EYE_COL = { meadow: '#ffe066', forest: '#d8ff6a', caves: '#ff4a6a', desert: '#ff9a3a', frost: '#9fe8ff', volcano: '#ffd34e', citadel: '#d58bff' };
  function groundTop(tx) { for (let y = 3; y < Q.L.H - 2; y++) { const c = Q.L.grid[y][tx]; if (c === '#' || c === 'I') return y * TS; } return 10 * TS; }
  function initCreeps() {
    const L = Q.L; Q.eyes = []; Q.watchers = []; Q.fog = []; Q.darkCur = Q.B.dark; Q.whT = rr(4, 8);
    const zones = L.dark.slice();
    if (Q.B.dark >= 0.25) zones.push({ x0: 12, x1: L.arena.x0 - 6, a: Q.B.dark });
    for (const z of zones) {
      const n = Math.max(2, Math.round((z.x1 - z.x0) / 9));
      for (let i = 0; i < n; i++) {
        const tx = Math.floor(rr(z.x0, z.x1)), gt = groundTop(tx);
        Q.eyes.push({ x: tx * TS + rr(0, 14), y: gt - rr(14, 70), ph: rr(0, 6), open: rr(1.5, 4), gone: 0, sz: Math.random() < 0.2 ? 2 : 1 });
      }
      for (let i = 0; i < 2; i++) { const tx = Math.floor(rr(z.x0 + 4, z.x1 - 4)); Q.watchers.push({ x: tx * TS + 8, y: groundTop(tx), gone: 0, ph: rr(0, 6), z }); }
    }
    for (let i = 0; i < 16; i++) Q.fog.push({ x: Math.random() * VW, y: rr(90, 200), r: rr(40, 90), vx: rr(-6, 6), ph: rr(0, 6) });
  }
  function darkAt(wx) {
    let d = Q.B.dark;
    for (const z of Q.L.dark) { const tx = wx / TS, edge = Math.min(tx - z.x0, z.x1 - tx); if (edge > 0) d = Math.max(d, z.a * Math.min(1, edge / 6)); }
    return d + (Q.darkBoost || 0);
  }
  function updateCreeps(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.darkCur = lerp(Q.darkCur, Math.min(0.97, darkAt(P.x)), 1 - Math.exp(-2.5 * dt));
    if (Q.darkBoost > 0) Q.darkBoost -= dt * 0;
    const inDark = Q.darkCur > 0.45;
    for (const e of Q.eyes) {
      e.ph += dt;
      if (e.gone > 0) { e.gone -= dt; continue; }
      if (inDark && Math.hypot(e.x - pc.x, e.y - pc.y) < 38) { e.gone = rr(5, 10); Snd.sting(); emit(e.x, e.y, 6, { col: '#14121f', sp0: 10, sp1: 40, grav: 0 }); }
    }
    for (const w of Q.watchers) {
      w.ph += dt;
      if (w.gone > 0) { w.gone -= dt; if (w.gone <= 0) { const z = w.z, tx = clamp(Math.floor(P.x / TS) + (Math.random() < 0.5 ? -1 : 1) * Math.floor(rr(12, 20)), Math.floor(z.x0), Math.floor(z.x1)); w.x = tx * TS + 8; w.y = groundTop(tx); } continue; }
      if (Math.abs(w.x - pc.x) < 52 && Math.abs(w.y - P.y) < 50) { w.gone = rr(6, 12); Snd.sting(); Snd.whisper(); emit(w.x, w.y - 16, 14, { col: ['#14121f', '#2a2540'], sp0: 10, sp1: 50, grav: -20 }); }
    }
    Q.whT -= dt;
    if (inDark && Q.whT <= 0) { Q.whT = rr(6, 12); Snd.whisper(); }
    for (const f of Q.fog) { f.ph += dt; f.x += f.vx * dt; if (f.x < -f.r) f.x = VW + f.r; if (f.x > VW + f.r) f.x = -f.r; }
  }
  function drawWatchers(camX, camY) {
    for (const w of Q.watchers) {
      if (w.gone > 0) continue;
      const x = Math.round(w.x - camX), y = Math.round(w.y - camY);
      if (x < -20 || x > VW + 20) continue;
      drawSpr(g, watcherSprite(), x, y, false, false, 1, 1);
    }
    for (const d of Q.L.creep) {
      if (d.x < camX - 20 || d.x > camX + VW + 20) continue;
      const sp = getSprite(['skull', 'grave', 'ribs', 'skull'][d.k]); g.drawImage(sp.c, Math.round(d.x - camX - sp.w / 2), Math.round(d.y - camY - sp.h + 1));
    }
  }
  function drawCreepEyes(camX, camY) {
    if (Q.darkCur < 0.3) return;
    const col = EYE_COL[Q.B.id] || '#ffe066', P = Q.P;
    for (const e of Q.eyes) {
      if (e.gone > 0) continue;
      const blink = (e.ph % (e.open + 0.18)) > e.open; if (blink) continue;
      const x = Math.round(e.x - camX), y = Math.round(e.y - camY + Math.sin(e.ph * 1.3) * 1.5);
      if (x < -10 || x > VW + 10) continue;
      const d = Math.hypot(e.x - (P.x + 4), e.y - (P.y + 7)), a = clamp((d - 30) / 45, 0, 1) * Math.min(1, Q.darkCur * 1.4);
      if (a <= 0.02) continue;
      g.globalAlpha = a; g.fillStyle = col; g.fillRect(x - 3, y, e.sz + 1, e.sz); g.fillRect(x + 3, y, e.sz + 1, e.sz);
      g.globalAlpha = a * 0.3; g.fillRect(x - 5, y - 2, 4 + e.sz, 4 + e.sz); g.fillRect(x + 1, y - 2, 4 + e.sz, 4 + e.sz); g.globalAlpha = 1;
    }
    for (const w of Q.watchers) {
      if (w.gone > 0) continue;
      const x = Math.round(w.x - camX), y = Math.round(w.y - camY - 28), d = Math.hypot(w.x - (P.x + 4), w.y - 14 - (P.y + 7)), a = clamp((d - 20) / 40, 0, 1) * Math.min(1, Q.darkCur * 1.5);
      if (a <= 0.02 || x < -10 || x > VW + 10 || Math.floor(w.ph * 2) % 9 === 0) continue;
      g.globalAlpha = a; g.fillStyle = '#ff2a3a'; g.fillRect(x - 2, y, 2, 2); g.fillRect(x + 1, y, 2, 2); g.globalAlpha = a * 0.35; g.fillRect(x - 4, y - 2, 6, 6); g.globalAlpha = 1;
    }
  }
  function drawFog() {
    if (Q.darkCur < 0.25) return;
    const tint = { caves: '90,70,160', forest: '60,120,90', citadel: '120,70,170', frost: '140,180,230', volcano: '140,50,30', desert: '180,120,70', meadow: '120,110,150' }[Q.B.id] || '100,100,140';
    for (const f of Q.fog) {
      const a = 0.07 * Math.min(1, Q.darkCur * 1.6) * (0.7 + 0.3 * Math.sin(f.ph));
      const gr = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, 'rgba(' + tint + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + tint + ',0)');
      g.fillStyle = gr; g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
  }
  function initWeather() {""")
# call init
rep("    initEntities();\n    initWeather();\n    snapCam();", "    initEntities();\n    initWeather();\n    initCreeps();\n    snapCam();")
# update
rep("updateFps(dt); updateFires(dt); updateProjs(dt);", "updateFps(dt); updateFires(dt); updateProjs(dt); updateCreeps(dt);")
# draw hooks
rep("    drawItems(camX, camY);\n    drawTraps(camX, camY);", "    drawWatchers(camX, camY);\n    drawItems(camX, camY);\n    drawTraps(camX, camY);")
rep("    drawWorld(); drawLighting(); drawWeather();", "    drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather();")
# lighting uses current dark
rep("    const dark = B.dark + (Q.arenaSealed && Q.li !== 2 ? 0.0 : 0);", "    const dark = Q.darkCur !== undefined ? Q.darkCur : B.dark;")
rep("r: ((B.dark > 0.5 ? 70 : 90) + flick) * (hasRelic(2) ? 1.45 : 1), i: 1 }];",
    "r: ((dark > 0.6 ? 64 : (dark > 0.3 ? 78 : 90)) + flick + (Q.ents.some(e => !e.dead && Math.abs(e.x - P.x) < 80 && Math.abs(e.y - P.y) < 50) ? Math.sin(Q.t * 38) * 4 : 0)) * (hasRelic(2) ? 1.45 : 1), i: 1 }];")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
