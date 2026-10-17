import io
# ======================= audio =======================
p = 'src/audio.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:80]
    s = s.replace(old, new, cnt)


rep("    b7: { f: 48,", "    bdragon: { f: 52, s: 0.5, type: 'sawtooth', wob: 45, wobHz: 7, noise: 0.5, nHP: 90, dur: 1.6, vol: 0.34, lp: 460 },\n    b7: { f: 48,")
rep("const NV = { miku:" if "const NV = { miku:" in s else "const NV = { lyra:" if "const NV = { lyra:" in s else "const NV = { ", "const NV = { dragon: ['sawtooth', 58, 96, 0.1], ") if False else None
s = s.replace("const NV = { ", "const NV = { dragon: ['sawtooth', 58, 96, 0.1], ", 1)
rep("    flame() {", "    flap() { noise(0.22, 0.14, 180); tone(70, 0.22, 'sine', 0.12, -30); },\n    breath() { noise(1.5, 0.3, 250); tone(110, 1.4, 'sawtooth', 0.12, -40); noise(0.6, 0.2, 2500); },\n    flame() {")
io.open(p, 'w', encoding='utf-8').write(s)

# ======================= levels =======================
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()
a = s.index("const PUZZLES = {")
b = s.index("function genLevel(li) {")
s = s[:a] + u"""const PUZZLES = {
  0: ['dragon', 'lever', 'rescue', 'trial', 'bombwall'],
  1: ['key', 'lever', 'torches'],
  2: ['torches', 'trial', 'bombwall', 'multilever'],
  3: ['timed', 'key', 'bombwall'],
  4: ['seqtorch', 'multilever', 'timed'],
  5: ['dragon6', 'timed', 'bombwall', 'trial', 'seqtorch', 'key'],
  6: ['runes', 'seqtorch', 'trial', 'multilever', 'timed']
};
const TRIAL_WAVES = { 0: 2, 2: 3, 5: 4, 6: 5 };

""" + s[b:]
rep("gates: [], xwalls: [], trials: [], dark: [],", "gates: [], xwalls: [], trials: [], dragons: [], dark: [],")
a = s.index("  function pTrial() {")
b = s.index("  function runPuzzle(t) {")
s = s[:a] + u"""  function pTrial() { // Mr Shorty Phong's trial: sealed arena, waves of monsters AND a torch puzzle to open the exit
    const n = 46, x0 = pzFlat(n), cnt = li >= 5 ? 4 : 3, cs = perm(5).slice(0, cnt), seq = perm(cnt), rw = x0 + n - 5;
    const gid = gateAt(rw, 'seq', { count: cnt, seq, seqColors: seq.map(t => cs[t]) });
    L.trials.push({ id: L.id++, lw: x0 + 8, rw, trig: x0 + 10, gy, waves: TRIAL_WAVES[li] || 3, gate: gid });
    spawn('tablet', x0 + 12, gy, { gate: gid });
    for (let i = 0; i < cnt; i++) spawn('torch', x0 + 17 + i * 6, gy, { gate: gid, ci: cs[i], tid: i });
    spawn('spiketrap', x0 + 15, gy, { w: 2, off: rnd() * 3 });
    spawn('spiketrap', x0 + 30, gy, { w: 2, off: rnd() * 3 });
    if (li >= 5) spawn('saw', x0 + 20, gy, { len: 12 });
    for (let i = 0; i < 3; i++) { set(x0 + 14 + i, gy - 3, '='); set(x0 + 28 + i, gy - 3, '='); }
  }
  function pDragon(kind) {
    const n = 50, x0 = pzFlat(n);
    L.dragons.push({ id: L.id++, lw: x0 + 8, rw: x0 + n - 6, trig: x0 + 11, gy, kind });
    for (let i = 0; i < 4; i++) { set(x0 + 16 + i, gy - 4, '='); set(x0 + 30 + i, gy - 4, '='); }
    spawn('heart', x0 + 4, gy - 2);
  }
""" + s[b:]
rep("    if (t === 'trial') { pTrial(); return; }", "    if (t === 'trial') { pTrial(); return; }\n    if (t === 'dragon') { pDragon('young'); return; }\n    if (t === 'dragon6') { pDragon('map6'); return; }")
rep("const pzAt = pzList.map((_, i) => Math.floor(B.len * (0.14 + 0.7 * (i + 0.5) / pzList.length)));", "const pzAt = pzList.map((t, i) => (t === 'dragon' && li === 0) ? 26 : Math.floor(B.len * (0.14 + 0.7 * (i + 0.5) / pzList.length)));")
io.open(p, 'w', encoding='utf-8').write(s)

# ======================= game =======================
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()

# --- trial dialogue keys (maps 1,3,6,7 -> indices 0,2,5,6)
rep("    1: { intro: [\n      { en: 'Hehehe... so THIS is the famous lantern-boy?", "    0: { intro: [\n      { en: 'Hehehe... so THIS is the famous lantern-boy?")
rep("    3: { intro: [\n      { en: 'Back for more? The desert is MY garden, little lantern!', vi: 'Quay lại chịu đòn à? Sa mạc là vườn nhà ta, đèn con!' },\n      { en: 'Three waves this time. Survive... or become sand.', vi: 'Lần này ba đợt. Sống sót... hoặc hóa thành cát.' }",
    "    2: { intro: [\n      { en: 'Back for more? Down here in the dark... I do love the caves, little lantern!', vi: 'Quay lại chịu đòn à? Dưới bóng tối này... ta rất thích hang động, đèn con!' },\n      { en: 'Three waves this time AND a puzzle. Light the torches in order, or rot in here!', vi: 'Lần này ba đợt VÀ một câu đố. Thắp đuốc đúng thứ tự, nếu không thì thối rữa ở đây!' }")
rep("      { en: 'No exit until every monster is dead. Tee-hee!', vi: 'Không có lối ra cho tới khi quái vật chết hết. Hí hí!' }", "      { en: 'No exit until every monster is dead AND the torches burn in the right order. Tee-hee!', vi: 'Không có lối ra cho tới khi quái chết hết VÀ đuốc cháy đúng thứ tự. Hí hí!' }")

# --- trials: only left wall toggles, gate = right wall
rep("    for (const t of L.trials) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }", "    for (const t of L.trials) for (let y = 0; y < t.gy; y++) L.grid[y][t.lw] = ' ';")
rep("  function sealTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = 'G'; Q.L.grid[y][tr.rw] = 'G'; } Snd.play('gate'); Q.shake = 0.6; }\n  function openTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = ' '; Q.L.grid[y][tr.rw] = ' '; } Snd.play('gate'); }",
    "  function sealTrial(tr) { for (let y = 0; y < tr.gy; y++) Q.L.grid[y][tr.lw] = 'G'; Snd.play('gate'); Q.shake = 0.6; }\n  function openTrial(tr) { for (let y = 0; y < tr.gy; y++) Q.L.grid[y][tr.lw] = ' '; Snd.play('gate'); }")
a = s.index("      } else if (tr.state === 'active') {")
b = s.index("  function updatePuzzles(dt) {")
s = s[:a] + u"""      } else if (tr.state === 'active') {
        const alive = Q.ents.filter(e => !e.dead && e.trial === tr.id).length, gd = gateOf(tr.gate);
        if (alive > 0) continue;
        tr.cd -= dt; if (tr.cd > 0) continue;
        if (tr.wave < tr.waves) { spawnWave(tr); tr.cd = 1.2; }
        else if (gd && !gd.open) {
          tr.rc = (tr.rc === undefined ? 4 : tr.rc) - dt;
          if (tr.rc <= 0) { tr.rc = 9; spawnWave(tr, true); }
        } else {
          tr.state = 'done'; Q.trialsDone.add(tr.id); openTrial(tr); Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic'); setEmo('happy', 2.5);
          const cx = (tr.lw + tr.rw) / 2 * TS;
          for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 12, y: tr.gy * TS - 30, id: -1, vy: -120, vx: i ? 25 : -25, ph: 0, drop: true });
          for (let i = 0; i < 12; i++) Q.items.push({ kind: 'coin', x: cx + rr(-20, 20), y: tr.gy * TS - 30, id: -1, vy: -rr(80, 160), vx: rr(-50, 50), ph: 0, drop: true });
          Q.items.push({ kind: 'pk', what: 'bomb', amt: 2, keep: false, x: cx, y: tr.gy * TS - 30, id: -1, vy: -140, vx: 0, ph: 0, drop: true });
          startScripted('shorty', TRIAL[Q.li].outro, null);
        }
      }
    }
  }
""" + s[b:]
rep("  function spawnWave(tr) {", "  function spawnWave(tr, extra) {")
rep("    const n = 2 + tr.wave + (Q.li > 3 ? 1 : 0);\n    for (let i = 0; i < n; i++) {\n      let tot = 0;", "    const n = extra ? 2 : 2 + tr.wave + (Q.li > 3 ? 1 : 0);\n    for (let i = 0; i < n; i++) {\n      let tot = 0;")
rep("    tr.wave++; Q.msg = T('wave') + ' ' + tr.wave + ' / ' + tr.waves; Q.msgT = 3; Snd.play('zap');", "    if (!extra) tr.wave++; Q.msg = extra ? (save.lang === 'vi' ? 'Quân tiếp viện! Giải câu đố mau!' : 'Reinforcements! Solve the puzzle!') : T('wave') + ' ' + tr.wave + ' / ' + tr.waves; Q.msgT = 3; Snd.play('zap');")

# --- firePr silent
rep("  function firePr(x, y, vx, vy, o) { Q.projs.push(Object.assign({ x, y, vx, vy, life: 4, grav: 0, col: Q.B.proj, type: 'ball', boss: false }, o || {})); Snd.play('shoot'); }",
    "  function firePr(x, y, vx, vy, o) { Q.projs.push(Object.assign({ x, y, vx, vy, life: 4, grav: 0, col: Q.B.proj, type: 'ball', boss: false }, o || {})); if (!(o && o.silent)) Snd.play('shoot'); }")
rep("    if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro') out.push(b);\n    if (d && !d.dead && d.st !== 'sleep' && d.st !== 'enter' && d.st !== 'gone') out.push(d);",
    "    if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro') out.push(b);\n    if (d && !d.dead && !d.hide && d.st !== 'enter' && d.st !== 'talk') out.push(d);")

# --- NPCs / dialogue for dragon
rep("  const SHOPS = {", u"""  NPCS.dragon = { spr: 'dragon_head', name: { en: 'Ignarok the Ashwing', vi: 'Ignarok Cánh Tro' } };
  NPCS.dragon.generic = [{ en: 'ROAAAR!', vi: 'GÀOOO!' }];
  const DRG_DLG = {
    young_intro: [
      { en: 'So... the little lantern-bearer crawls through my meadow. I can smell the last flame of Aurelia on you!', vi: 'Thì ra... cậu bé cầm đèn bé nhỏ đang bò qua đồng cỏ của ta. Ta ngửi thấy ngọn lửa cuối cùng của Aurelia trên người ngươi!' },
      { en: 'I am Ignarok the Ashwing. Quoc promised me a throne of ash if I snuff you out, little spark.', vi: 'Ta là Ignarok Cánh Tro. Quoc hứa ban cho ta ngai vàng bằng tro tàn nếu ta dập tắt ngươi, tia lửa nhỏ.' },
      { en: 'Come, then! Burn bright... for as long as you can!', vi: 'Lại đây nào! Hãy cháy thật sáng... chừng nào ngươi còn cháy được!' }
    ],
    young_flee: [
      { en: 'ARGH! A spark... scorched MY scales?!', vi: 'ARGH! Một tia lửa... đã đốt cháy vảy của TA sao?!' },
      { en: 'This is not over, lantern-bearer! We will meet again - when you taste the volcano!', vi: 'Chưa xong đâu, kẻ cầm đèn! Chúng ta sẽ gặp lại - khi ngươi nếm mùi núi lửa!' }
    ],
    map6_intro: [
      { en: 'Did you miss me, little spark? The volcano is MY forge now.', vi: 'Nhớ ta không, tia lửa nhỏ? Núi lửa giờ là lò rèn của ta.' },
      { en: 'Quoc gave me his strongest fire. This time, I will not run.', vi: 'Quoc đã ban cho ta ngọn lửa mạnh nhất của hắn. Lần này ta sẽ không bỏ chạy.' }
    ],
    morph: [
      [{ en: 'You CUT me?! Then meet my brothers... we are THREE heads with ONE hunger!', vi: 'Ngươi dám CHÉM ta?! Vậy hãy gặp các anh em của ta... chúng ta có BA cái đầu và chung MỘT cơn đói!' }],
      [{ en: 'Fire dies... but shadow remains. Come into the dark with me, little light.', vi: 'Lửa sẽ tàn... nhưng bóng tối còn mãi. Hãy vào bóng tối cùng ta, ánh sáng nhỏ.' },
       { en: 'I am not Ignarok anymore. I am the night itself!', vi: 'Ta không còn là Ignarok nữa. Ta là chính màn đêm!' }]
    ],
    death: [{ en: 'The... dark... was never... enough... Quoc... forgive...', vi: 'Bóng tối... chưa bao giờ... đủ... Quoc... tha thứ cho...' }]
  };
  const DRG = {
    young: { stages: [{ form: 0, hp: 110, armor: 0, w: 58, h: 28, sp: 70, skills: ['fireballs', 'dive', 'breath', 'gust'] }] },
    map6: { stages: [
      { form: 1, hp: 280, armor: 0.15, w: 76, h: 36, sp: 80, skills: ['fireballs', 'breath', 'dive', 'gust', 'perch', 'roar'] },
      { form: 2, hp: 340, armor: 0.25, w: 96, h: 44, sp: 90, skills: ['fireballs', 'tripleBreath', 'dive', 'gust', 'perch', 'tailsweep', 'summon'] },
      { form: 3, hp: 400, armor: 0.3, w: 84, h: 38, sp: 100, skills: ['shadowBreath', 'dive', 'vanish', 'darkness', 'tripleBreath', 'tailsweep', 'roar', 'summon'] }
    ] }
  };
  const SHOPS = {""")

# --- state + init
rep("zones: [], tmpCells: [],", "zones: [], tmpCells: [], dragon: null, dragons: [], dragonsDone: new Set(), tmpCells2: 0,")
rep("    Q.zones = []; cleanupCells(); Q.windT = 0; Q.darkBoost = 0; Q.darkBoostT = 0;", u"""    Q.zones = []; cleanupCells(); Q.windT = 0; Q.darkBoost = 0; Q.darkBoostT = 0; Q.dragon = null;
    for (const t of L.dragons) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }
    Q.dragons = L.dragons.map(t => Object.assign({}, t, { state: Q.dragonsDone.has(t.id) ? 'done' : 'idle' }));""")

# --- dragon runtime
rep("  // ===================== zones + statuses =====================", u"""  // ===================== DRAGON =====================
  const dc = d => ({ x: d.x + d.w / 2, y: d.y + d.h / 2 });
  const dHover = d => d.tr.gy * TS - 82, dLow = d => d.tr.gy * TS - 24;
  function dMove(d, tx, ty, k, dt) { const f = Math.min(1, k * dt); d.x += (tx - d.w / 2 - d.x) * f; d.y += (ty - d.h / 2 - d.y) * f; }
  function dMouth(d) { return { x: d.x + d.w / 2 + d.dir * d.w * 0.46, y: d.y + d.h * 0.4 }; }
  function dFire(d, a, sp, o) { const m = dMouth(d); firePr(m.x, m.y, Math.cos(a) * sp, Math.sin(a) * sp, Object.assign({ boss: true, fl: true, silent: true, life: 0.85, col: '#ff9a2a' }, o || {})); }
  function dHold(d, dt, ty) { const P = Q.P; d.dir = (P.x + 4) < dc(d).x ? -1 : 1; dMove(d, clamp(P.x + 4 + Math.sin(d.t * 0.9) * 60, (d.tr.lw + 2) * TS, (d.tr.rw - 2) * TS), (ty || dHover(d)) + Math.sin(d.t * 2) * 5, 1.4, dt); }
  const DS = {
    fireballs: { tele: 0.7, start(d) { d.n = 3 + (d.stage >= 1 ? 1 : 0) + (d.def.kind === 'map6' ? 1 : 0); d.skT = 0; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; if (d.skT <= 0) { const m = dMouth(d), P = Q.P, a = Math.atan2(P.y + 7 - m.y, P.x + 4 - m.x); firePr(m.x, m.y, Math.cos(a) * 120, Math.sin(a) * 120, { boss: true, fl: true, col: '#ff9a2a', life: 3 }); Snd.play('flame'); d.n--; d.skT = 0.45; } return d.n <= 0; } },
    breath: { tele: 0.85, start(d) { d.skT = 1.4; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.4, a = d.sdir > 0 ? 0.3 + k * 0.95 : Math.PI - 0.3 - k * 0.95;
      if (d.fireT <= 0) { d.fireT = 0.035; dFire(d, a, 150); } return d.skT <= 0; } },
    tripleBreath: { tele: 0.9, start(d) { d.skT = 1.4; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.4, a = d.sdir > 0 ? 0.25 + k * 0.9 : Math.PI - 0.25 - k * 0.9;
      if (d.fireT <= 0) { d.fireT = 0.05; for (const o of [-0.45, 0, 0.45]) dFire(d, a + o * d.sdir, 150); } return d.skT <= 0; } },
    shadowBreath: { tele: 0.9, start(d) { d.skT = 1.5; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); Snd.whisper(); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.5, a = d.sdir > 0 ? 0.25 + k * 0.9 : Math.PI - 0.25 - k * 0.9;
      if (d.fireT <= 0) { d.fireT = 0.05; for (const o of [-0.3, 0.3]) dFire(d, a + o * d.sdir, 140, { col: '#a15be0', onLand: 'poison', life: 1.2 }); } return d.skT <= 0; } },
    dive: { tele: 0.7, start(d) { const tr = d.tr, P = Q.P; d.ph = 0; d.skT = 0.7; d.side = (P.x + 4) < (tr.lw + tr.rw) / 2 * TS ? 1 : -1; d.sx = d.side > 0 ? (tr.lw + 4) * TS : (tr.rw - 4) * TS; d.ex = d.side > 0 ? (tr.rw - 3) * TS : (tr.lw + 3) * TS; d.dir = d.side; },
      upd(d, dt) {
        const c = dc(d);
        if (d.ph === 0) { dMove(d, d.sx, dHover(d) - 14, 5, dt); d.skT -= dt; if (d.skT <= 0) { d.ph = 1; d.skT = 0.42; d.px = c.x; d.py = c.y; Snd.creature('dragon', 'attack', true); } }
        else if (d.ph === 1) { d.skT -= dt; const k = 1 - Math.max(0, d.skT) / 0.42, tx = d.px + d.side * 90, ty = lerp(d.py, dLow(d), k * k); d.x = lerp(d.px, tx, k) - d.w / 2; d.y = ty - d.h / 2; if (d.skT <= 0) { d.ph = 2; Snd.play('flap'); } }
        else if (d.ph === 2) { d.x += d.side * 280 * dt; d.y += (dLow(d) - d.h / 2 - d.y) * Math.min(1, 8 * dt); if (Math.random() < 0.6) emit(c.x, c.y + 8, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 25, grav: 20 }); if ((d.side > 0 && c.x >= d.ex) || (d.side < 0 && c.x <= d.ex)) { d.ph = 3; d.skT = 0.6; } }
        else { d.skT -= dt; dMove(d, d.ex - d.side * 40, dHover(d), 4, dt); return d.skT <= 0; }
      } },
    perch: { tele: 0.6, start(d) { d.ph = 0; d.skT = 0.7; d.perchT = 3.0; d.fireT = 0.6; }, upd(d, dt) {
      const P = Q.P, c = dc(d);
      if (d.ph === 0) { d.dir = (P.x + 4) < c.x ? -1 : 1; dMove(d, clamp(P.x + 4 - d.dir * 70, (d.tr.lw + 3) * TS, (d.tr.rw - 3) * TS), d.tr.gy * TS - d.h / 2, 3, dt); d.skT -= dt; if (d.skT <= 0) { d.ph = 1; Q.shake = 0.5; Snd.play('boom'); } }
      else if (d.ph === 1) { d.perchT -= dt; d.fireT -= dt; d.dir = (P.x + 4) < c.x ? -1 : 1; if (d.fireT <= 0) { d.fireT = 0.55; for (const o of [-0.12, 0, 0.12]) dFire(d, (d.dir > 0 ? 0 : Math.PI) + o, 120, { life: 0.55 }); Snd.play('flame'); } if (d.perchT <= 0) { d.ph = 2; d.skT = 0.5; Q.windDir = d.dir; Q.windT = 1.2; Snd.play('flap'); } }
      else { d.skT -= dt; dMove(d, c.x, dHover(d), 5, dt); return d.skT <= 0; } } },
    gust: { tele: 0.6, start(d) { d.skT = 1.7; d.gT = 0.5; Q.windDir = (Q.P.x + 4) < dc(d).x ? -1 : 1; Q.windT = 2.6; Snd.play('flap'); }, upd(d, dt) { dHold(d, dt); d.skT -= dt; d.gT -= dt; if (d.gT <= 0) { d.gT = 0.7; const m = dMouth(d), P = Q.P, a = Math.atan2(P.y + 7 - m.y, P.x + 4 - m.x); firePr(m.x, m.y, Math.cos(a) * 115, Math.sin(a) * 115, { boss: true, fl: true, col: '#ff9a2a', life: 3 }); } if (Math.random() < 0.5) emit(Q.cam.x + rr(0, VW), Q.cam.y + rr(0, 60), 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 20, vx: -Q.windDir * 80, vy: 40, grav: 0 }); return d.skT <= 0; } },
    roar: { tele: 0.6, start(d) { d.skT = 1.1; d.rT = 0; Q.shake = 1; Snd.creature('dragon', 'alert', true); }, upd(d, dt) {
      dHold(d, dt); d.skT -= dt; d.rT -= dt;
      if (d.rT <= 0 && d.skT > 0.2) { d.rT = 0.5; const c = dc(d), gt = d.tr.gy * TS; for (const sgn of [-1, 1]) Q.projs.push({ x: c.x + sgn * 14, y: gt - 6, vx: sgn * 105, vy: 0, life: 2, grav: 0, col: '#ff9a2a', type: 'wave', boss: true }); Q.shake = 0.4; } return d.skT <= 0; } },
    tailsweep: { tele: 0.5, start(d) { const c = dc(d), gt = d.tr.gy * TS; addZone({ type: 'beam', x: c.x - 95, y: gt - 12, w: 190, h: 12, tel: 0.55, life: 0.4, col: '#ff6a3a' }); d.skT = 1.1; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } },
    summon: { tele: 0.6, start(d) { const c = dc(d); for (let i = 0; i < 3; i++) { const m = makeEnemy('imp', c.x + (i - 1) * 34, c.y, { minion: true }); m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: ['#ffd34e', '#f08a2b'] }); } Snd.creature('imp', 'alert'); d.skT = 0.9; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } },
    vanish: { tele: 0.4, start(d) { d.hide = true; d.ph = 0; d.skT = 0.7; emit(dc(d).x, dc(d).y, 24, { col: ['#a15be0', '#14121f', '#ff3aff'], sp0: 20, sp1: 100 }); Snd.sting(); Q.darkBoost = 0.55; Q.darkBoostT = 4; },
      upd(d, dt) { d.skT -= dt; if (d.ph === 0 && d.skT <= 0) { const tr = d.tr, nx = rr((tr.lw + 6) * TS, (tr.rw - 6) * TS); d.x = nx - d.w / 2; d.y = dHover(d) - d.h / 2; d.hide = false; d.ph = 1; d.skT = 0.5; emit(nx, dHover(d), 24, { col: ['#a15be0', '#fff', '#ff3aff'], sp0: 20, sp1: 100 }); Snd.creature('dragon', 'alert', true); } else if (d.ph === 1 && d.skT <= 0) return true; } },
    darkness: { tele: 0.7, start(d) { Q.darkBoost = 0.78; Q.darkBoostT = 7; const tr = d.tr; for (let i = 0; i < 2; i++) { const m = makeEnemy('shadewisp', (tr.lw + 8 + i * 16) * TS, (tr.gy - 4) * TS, { minion: true }); m.alerted = true; Q.ents.push(m); } Snd.whisper(); d.skT = 1.2; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } }
  };
  function makeDragon(def) {
    const cfg = DRG[def.kind], st = cfg.stages[0], cx = (def.lw + def.rw) / 2 * TS;
    return { isBoss: true, isDragon: true, def, tr: def, stage: 0, form: st.form, w: st.w, h: st.h, x: cx - st.w / 2, y: Q.cam.y - st.h - 80, vx: 0, vy: 0, hp: st.hp, max: st.hp, armor: st.armor, cfg: { name: NPCS.dragon.name, armor: st.armor }, skills: st.skills, sp: st.sp, dir: -1, st: 'enter', timer: 1.8, t: 0, flash: 0, invul: 0, wing: 0, flapT: 0, sk: null, lastSk: null, evCd: 1, fury: 1, hide: false };
  }
  function setStage(d, i) { const st = DRG[d.def.kind].stages[i], cx = dc(d).x, cy = dc(d).y; d.stage = i; d.form = st.form; d.w = st.w; d.h = st.h; d.hp = d.max = st.hp; d.armor = st.armor; d.cfg.armor = st.armor; d.skills = st.skills; d.sp = st.sp; d.x = cx - d.w / 2; d.y = cy - d.h / 2; }
  function hurtDragon(d, dmg, pierce) {
    if (d.invul > 0 || d.dead || d.hide || d.st === 'enter' || d.st === 'talk' || d.st === 'morph' || d.st === 'flee' || d.st === 'flee0') return;
    const arm = d.armor * ((d.st === 'act' && d.sk === 'perch' && d.ph === 1) || d.st === 'rec' ? 0.55 : 1), eff = dmg * (1 - arm * (pierce ? 0.4 : 1));
    d.hp -= eff; d.flash = 0.1; Q.shake = Math.max(Q.shake, 0.15);
    Snd.creature('dragon', d.hp <= 0 ? 'die' : 'hurt', true);
    emit(d.x + d.w / 2, d.y + d.h / 2, 8, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
    if (d.def.kind === 'young') { if (d.hp <= d.max * 0.25) startFlee(d); }
    else if (d.hp <= 0) { d.hp = 0; if (d.stage < 2) startMorph(d); else startDragonDeath(d); }
  }
  function startFlee(d) {
    d.st = 'flee0'; d.invul = 99; Q.projs.length = 0; Q.zones.length = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); setEmo('angry', 2);
    startScripted('dragon', DRG_DLG.young_flee, () => { d.st = 'flee'; d.timer = 2.0; d.dir = 1; Snd.creature('dragon', 'attack', true); });
  }
  function startMorph(d) {
    d.st = 'morph'; d.invul = 99; Q.projs.length = 0; Q.zones.length = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); Q.shake = 1; Snd.creature('dragon', 'alert', true);
    startScripted('dragon', DRG_DLG.morph[d.stage], () => { setStage(d, d.stage + 1); d.invul = 1.6; d.st = 'hover'; d.timer = 1.2; Q.shake = 1.2; Snd.creature('dragon', 'alert', true); if (d.form === 3) { Snd.whisper(); Q.darkBoost = 0.5; Q.darkBoostT = 3; } emit(dc(d).x, dc(d).y, 50, { col: d.form === 3 ? ['#a15be0', '#ff3aff', '#fff'] : ['#ffd34e', '#f08a2b', '#fff'], sp0: 40, sp1: 180 }); });
  }
  function startDragonDeath(d) { d.dead = true; d.deadT = 0; d.booms = 0; Q.projs.length = 0; Q.zones.length = 0; Q.windT = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); Snd.stop(); Snd.creature('dragon', 'die', true); }
  function finishDragon(d) {
    const tr = d.tr; Q.dragonsDone.add(tr.id); const dr = Q.dragons.find(o => o.id === tr.id); if (dr) dr.state = 'done';
    for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = ' '; Q.L.grid[y][tr.rw] = ' '; }
    Q.dragon = null; Q.projs.length = 0; Q.zones.length = 0; Q.darkBoost = 0; Q.windT = 0; Snd.music('lvl' + Q.li, Q.B.music); Snd.play('relic'); setEmo('happy', 3);
    const cx = (tr.lw + tr.rw) / 2 * TS;
    for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 14, y: tr.gy * TS - 40, id: -1, vy: -140, vx: i ? 30 : -30, ph: 0, drop: true });
    for (let i = 0; i < 14; i++) Q.items.push({ kind: 'coin', x: cx + rr(-30, 30), y: tr.gy * TS - 40, id: -1, vy: -rr(80, 180), vx: rr(-60, 60), ph: 0, drop: true });
    Q.items.push({ kind: 'pk', what: 'flask', amt: 2, keep: false, x: cx, y: tr.gy * TS - 40, id: -1, vy: -150, vx: 0, ph: 0, drop: true });
    Q.msg = save.lang === 'vi' ? 'Con rồng đã rời đi... đồ rơi vương vãi!' : 'The dragon is gone... loot everywhere!'; Q.msgT = 4;
  }
  function pickDS(d) {
    const P = Q.P, c = dc(d), dist = Math.abs(P.x + 4 - c.x); let tot = 0;
    const ws = d.skills.map(k => { let w = 1; if (k === d.lastSk) w *= 0.1; if (dist > 140 && (k.indexOf('reath') >= 0 || k === 'fireballs')) w *= 2; if (dist < 60 && (k === 'dive' || k === 'gust' || k === 'roar' || k === 'tailsweep')) w *= 2.2; if ((k === 'darkness' || k === 'summon' || k === 'perch') && Q.t - (d['u_' + k] || -99) < 14) w *= 0.1; tot += w; return w; });
    let r = Math.random() * tot; for (let i = 0; i < d.skills.length; i++) { r -= ws[i]; if (r <= 0) return d.skills[i]; } return d.skills[0];
  }
  function updateDragon(dt) {
    const d = Q.dragon; if (!d) return;
    const P = Q.P, tr = d.tr;
    d.t += dt; if (d.flash > 0) d.flash -= dt; if (d.invul > 0 && d.invul < 50) d.invul -= dt; if (d.evCd > 0) d.evCd -= dt;
    d.flapT -= dt; if (d.flapT <= 0 && !d.dead && !(d.st === 'act' && d.sk === 'perch' && d.ph === 1)) { d.flapT = 0.6; Snd.play('flap'); }
    d.wing = Math.floor(d.t * ((d.st === 'act' && d.sk === 'perch' && d.ph === 1) ? 3 : 6)) % 2;
    d.fury = 1 + (1 - d.hp / d.max) * 0.45;
    if (d.dead) {
      d.deadT += dt; d.y += 40 * dt; d.x += rr(-1, 1);
      if (d.booms < 8 && d.deadT > d.booms * 0.22) { d.booms++; Snd.play('boom'); emit(d.x + rr(0, d.w), d.y + rr(0, d.h), 24, { col: ['#fff', '#ffd34e', '#f08a2b', '#a15be0'], sp0: 30, sp1: 160 }); Q.shake = 0.6; }
      if (d.deadT > 2.3 && !d.dlg) { d.dlg = true; startScripted('dragon', DRG_DLG.death, () => finishDragon(d)); }
      return;
    }
    const c = dc(d);
    switch (d.st) {
      case 'enter': d.timer -= dt; dMove(d, (tr.lw + tr.rw) / 2 * TS, dHover(d), 2.2, dt); if (Math.random() < 0.3) emit(c.x + rr(-20, 20), c.y, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 30, grav: 30 });
        if (d.timer <= 0) { d.st = 'talk'; startScripted('dragon', d.def.kind === 'young' ? DRG_DLG.young_intro : DRG_DLG.map6_intro, () => { d.st = 'hover'; d.timer = 0.9; Snd.music('boss', BOSS_MUSIC); }); } break;
      case 'talk': break;
      case 'hover': case 'rec': {
        dHold(d, dt);
        const threat = (P.atk > 0 && Math.abs(P.x + 4 - c.x) < d.w / 2 + 40 && Math.abs(P.y + 7 - c.y) < 60) || Q.fps.some(p => p.t !== 'blast' && Math.abs(p.x - c.x) < d.w / 2 + 50 && Math.abs(p.y - c.y) < d.h / 2 + 24);
        if (threat && d.evCd <= 0 && Math.random() < 0.55 * dt * 9) { d.evCd = 1.6; d.dodgeT = 0.3; d.dvx = (c.x < P.x + 4 ? -1 : 1) * 240; d.dvy = -40; emit(c.x, c.y, 6, { col: '#fff', sp0: 20, sp1: 60 }); }
        if (d.dodgeT > 0) { d.dodgeT -= dt; d.x += d.dvx * dt; d.y += d.dvy * dt; }
        d.timer -= dt;
        if (d.timer <= 0) {
          if (d.st === 'rec') { d.st = 'hover'; d.timer = 0.5 / d.fury; }
          else { d.atkSk = pickDS(d); d['u_' + d.atkSk] = Q.t; d.st = 'tele'; d.timer = DS[d.atkSk].tele / d.fury; Snd.creature('dragon', 'attack', true); }
        }
        break;
      }
      case 'tele': {
        d.timer -= dt; dHold(d, dt, d.atkSk === 'perch' ? dHover(d) - 10 : undefined); d.x += rr(-0.6, 0.6);
        if (Math.random() < 0.4) { const m = dMouth(d); emit(m.x, m.y, 1, { col: ['#ffd34e', '#ff6a3a'], sp0: 5, sp1: 25, grav: -10, l0: 0.2, l1: 0.4 }); }
        if (d.timer <= 0) { d.sk = d.atkSk; DS[d.sk].start(d); d.st = 'act'; } break;
      }
      case 'act': if (DS[d.sk].upd(d, dt)) { d.st = 'rec'; d.timer = 0.7 / d.fury; d.lastSk = d.sk; d.sk = null; } break;
      case 'flee0': case 'morph': dMove(d, c.x, dHover(d) - 10, 2, dt); break;
      case 'flee': d.timer -= dt; d.x += 200 * dt; d.y -= 140 * dt; if (d.timer <= 0) { finishDragon(d); return; } break;
    }
    if (d.st !== 'flee' && d.st !== 'enter') { d.x = clamp(d.x, (tr.lw + 1) * TS, tr.rw * TS - d.w); d.y = clamp(d.y, Q.cam.y - 30, tr.gy * TS - d.h / 2 - 2); }
    if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 })) hurtPlayer(2, c.x);
  }
  function drawDragon(camX, camY) {
    const d = Q.dragon; if (!d || d.hide) return;
    const spr = dragonSprite(d.form, d.wing), cx = Math.round(d.x + d.w / 2 - camX), cy = Math.round(d.y + d.h / 2 - camY);
    if (d.form === 3) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + Math.sin(d.t * 3) * 0.06; disc(g, cx, cy + 6, 48, '#7a2aff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (d.invul > 0 && d.invul < 50 && Math.floor(Q.t * 20) % 2 === 0) g.globalAlpha = 0.5;
    const img = d.flash > 0 ? (d.dir < 0 ? spr.fw : spr.cw) : (d.dir < 0 ? spr.f : spr.c);
    g.drawImage(img, Math.round(cx - spr.w / 2), Math.round(cy - spr.h / 2 + 8));
    g.globalAlpha = 1;
    if (d.st === 'tele' || (d.st === 'act' && /reath/.test(d.sk || ''))) { const m = dMouth(d), mx = Math.round(m.x - camX), my = Math.round(m.y - camY); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(mx, my, 0, mx, my, 16); gr.addColorStop(0, d.form === 3 ? 'rgba(200,100,255,.7)' : 'rgba(255,170,40,.75)'); gr.addColorStop(1, 'rgba(255,100,20,0)'); g.fillStyle = gr; g.fillRect(mx - 16, my - 16, 32, 32); g.globalCompositeOperation = 'source-over'; }
  }
  function updateDragonEnc() {
    const P = Q.P;
    for (const dr of Q.dragons) {
      if (dr.state !== 'idle') continue;
      if (P.x > dr.trig * TS && P.x < dr.rw * TS - 8 && P.onGround) {
        dr.state = 'active'; for (let y = 0; y < dr.gy; y++) { Q.L.grid[y][dr.lw] = 'G'; Q.L.grid[y][dr.rw] = 'G'; }
        Q.dragon = makeDragon(dr); Snd.creature('dragon', 'alert', true); Snd.play('gate'); Q.shake = 1.2; setEmo('scared', 2.5);
      }
    }
  }

  // ===================== zones + statuses =====================""")
rep("    updateTrials(dt);", "    updateTrials(dt); updateDragonEnc();")
rep("updateEnemies(dt); updateBoss(dt); updateBossDeath(dt);", "updateEnemies(dt); updateBoss(dt); updateDragon(dt); updateBossDeath(dt);")
rep("    if (Q.boss && Q.boss.st !== 'sleep' || (Q.boss && Q.li === 6)) drawBoss(camX, camY);", "    if (Q.boss && Q.boss.st !== 'sleep' || (Q.boss && Q.li === 6)) drawBoss(camX, camY);\n    drawDragon(camX, camY);")
# camera lock while dragon fight
rep("    if (Q.arenaSealed) minX = (L.arena.x0 + 1) * TS;", "    if (Q.arenaSealed) minX = (L.arena.x0 + 1) * TS;\n    if (Q.dragon && !Q.dragon.dead || (Q.dragon && Q.dragon.dead)) { minX = Math.max(minX, Q.dragon.tr.lw * TS); maxX = Math.min(maxX, Q.dragon.tr.rw * TS + TS - VW); }")
# HUD boss bar for dragon
rep("    if (Q.boss && Q.arenaSealed && !Q.bossDead && Q.boss.max) {\n      const b = Q.boss, w = 200,", "    const bb = (Q.boss && Q.arenaSealed && !Q.bossDead && Q.boss.max) ? Q.boss : ((Q.dragon && !Q.dragon.dead && Q.dragon.st !== 'enter' && Q.dragon.st !== 'talk') ? Q.dragon : null);\n    if (bb) {\n      const b = bb, w = 200,")
io.open(p, 'w', encoding='utf-8').write(s)
print('dragon patch ok')
