import io, re
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, cnt)


# longer levels
lens = [300, 340, 380, 420, 460, 500, 560]
parts = re.split(r"(len: )(\d+)", s)
res = parts[0]; k = 1; idx = 0
while k < len(parts):
    res += parts[k] + str(lens[idx]); idx += 1; res += parts[k + 2]; k += 3
s = res

# NPC plan + puzzle plan
a = s.index("const NPC_PLAN")
b = s.index("function genLevel(li) {")
s = s[:a] + u"""const NPC_PLAN = {
  0: { start: ['lila'], cps: ['fairy'] },
  1: { start: ['bram'], cps: ['gob', 'wizard'] },
  2: { cps: ['smith', 'wizard'] },
  3: { start: ['bram'], cps: ['gob', 'smith'] },
  4: { cps: ['angel', 'smith'] },
  5: { cps: ['gob', 'smith'] },
  6: { cps: ['wizard'], pre: ['lila', 'angel', 'bram', 'fairy'] }
};
// puzzles per map, easy -> hard
const PUZZLES = {
  0: ['lever', 'bombwall'],
  1: ['key', 'lever', 'torches'],
  2: ['torches', 'bombwall', 'multilever'],
  3: ['timed', 'key', 'bombwall'],
  4: ['seqtorch', 'multilever', 'timed'],
  5: ['timed', 'bombwall', 'seqtorch', 'key'],
  6: ['runes', 'seqtorch', 'multilever', 'timed']
};

""" + s[b:]

rep("const L = { B, li, W, H, grid, spawns: [], plats: [], decor: [], checkpoints: [], id: 0 };",
    "const L = { B, li, W, H, grid, spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], id: 0 };")

# pickups in flat
rep("    if (rnd() < 0.6 && n >= 5) coinsLine(x + R(1, n - 4), gy - 2, R(3, 4));\n    if (!o.safe && n >= 8 && B.traps",
    "    if (rnd() < 0.6 && n >= 5) coinsLine(x + R(1, n - 4), gy - 2, R(3, 4));\n    if (rnd() < 0.13 && n >= 5) spawn('pk', x + R(1, n - 2), gy, { what: pickWhat() });\n    if (!o.safe && n >= 8 && B.traps")

# puzzle generators
rep("  function placeTrap(t, x0, n) {", u"""  function pickWhat() { const r = rnd(); return r < 0.45 ? 'dagger' : (r < 0.75 ? 'bomb' : 'flask'); }
  function perm(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gateAt(gx, need, ex) {
    const id = L.id++;
    for (let y = 0; y <= gy - 1; y++) set(gx, y, 'G');
    L.gates.push(Object.assign({ id, x: gx, y0: 0, y1: gy - 1, need }, ex || {}));
    return id;
  }
  function pzFlat(n) { const x0 = x; flat(n, { safe: true, cp: true }); return x0; }
  function pzGuards(x0, n, k) { for (let c = 0; c < k; c++) addEnemy(x0 + R(9, n - 9), gy); }
  function ledges(x0, list) { list.forEach(l => { for (let i = 0; i < l[2]; i++) set(x0 + l[0] + i, gy - l[1], '='); }); }
  function pLever() {
    const n = 30, x0 = pzFlat(n), gid = gateAt(x0 + n - 6, 'lever', { count: 1 });
    if (li >= 2) { ledges(x0, [[6, 2, 3], [10, 4, 3]]); spawn('lever', x0 + 11, gy - 4, { gate: gid }); }
    else spawn('lever', x0 + 8, gy, { gate: gid });
    pzGuards(x0, n, 1 + (li > 1 ? 1 : 0));
    coinsLine(x0 + 14, gy - 2, 4);
  }
  function pKey() {
    const n = 34, x0 = pzFlat(n);
    if (li >= 3) { ledges(x0, [[5, 2, 3], [9, 4, 3], [5, 6, 3]]); spawn('key', x0 + 6, gy - 6, {}); }
    else { ledges(x0, [[6, 2, 3], [10, 4, 3]]); spawn('key', x0 + 11, gy - 4, {}); }
    const f = B.enemies.find(e => FLY.has(e.t));
    if (f) spawn(f.t, x0 + 9, gy - 7);
    gateAt(x0 + n - 6, 'key', {});
    pzGuards(x0, n, 2);
  }
  function pTorches(count, ordered) {
    const n = 22 + count * 5, x0 = pzFlat(n), cs = perm(5).slice(0, count);
    const seq = ordered ? perm(count) : null;
    const gid = gateAt(x0 + n - 5, ordered ? 'seq' : 'torches', { count, seq: seq, seqColors: seq ? seq.map(t => cs[t]) : null });
    for (let i = 0; i < count; i++) spawn('torch', x0 + 7 + i * 5, gy, { gate: gid, ci: cs[i], tid: i });
    if (ordered) spawn('tablet', x0 + 3, gy, { gate: gid });
    pzGuards(x0, n, 1 + (li > 3 ? 1 : 0));
  }
  function pBombWall() {
    const n = 28, x0 = pzFlat(n), wx = x0 + n - 8, tl = [];
    for (let xx = wx; xx < wx + 2; xx++) for (let yy = gy - 7; yy <= gy - 1; yy++) { set(xx, yy, 'X'); tl.push([xx, yy]); }
    L.xwalls.push({ tiles: tl });
    for (let i = 0; i < 3; i++) spawn('pk', x0 + 5 + i * 2, gy, { what: 'bomb', keep: true });
    coinsLine(x0 + 12, gy - 2, 4);
    pzGuards(x0, n, 1 + (li > 2 ? 1 : 0));
  }
  function pTimed() {
    const n = 38, x0 = pzFlat(n), T = li >= 5 ? 8 : 9;
    const gid = gateAt(x0 + n - 5, 'timed', { T });
    spawn('lever', x0 + 4, gy, { gate: gid, timed: T });
    const tr = B.traps ? B.traps[R(0, B.traps.length - 1)] : 'spiketrap';
    placeTrap(tr === 'turret' ? 'spiketrap' : tr, x0 + 9, n - 16);
    spawn('spiketrap', x0 + n - 10, gy, { w: 2, off: rnd() * 3 });
    coinsLine(x0 + 14, gy - 3, 3);
  }
  function pMulti(k) {
    const n = 18 + k * 11, x0 = pzFlat(n), gid = gateAt(x0 + n - 5, 'lever', { count: k });
    for (let i = 0; i < k; i++) {
      const lx = x0 + 6 + i * 10;
      if (li >= 4 && i % 2 === 1) { ledges(x0, [[lx - x0 - 1, 2, 3], [lx - x0 + 2, 4, 3]]); spawn('lever', lx + 3, gy - 4, { gate: gid }); }
      else spawn('lever', lx, gy, { gate: gid });
    }
    pzGuards(x0, n, k);
  }
  function pRunes() {
    const cnt = 4, n = 40, x0 = pzFlat(n), cs = perm(5).slice(0, cnt), seq = perm(cnt);
    const gid = gateAt(x0 + n - 5, 'runes', { count: cnt, seq, seqColors: seq.map(t => cs[t]) });
    for (let i = 0; i < cnt; i++) spawn('rune', x0 + 9 + i * 6, gy, { gate: gid, ci: cs[i], tid: i });
    spawn('tablet', x0 + 3, gy, { gate: gid });
    pzGuards(x0, n, 3);
  }
  function runPuzzle(t) {
    if (t === 'lever') pLever(); else if (t === 'key') pKey();
    else if (t === 'torches') pTorches(li < 3 ? 2 : 3, false); else if (t === 'seqtorch') pTorches(li < 6 ? 3 : 4, true);
    else if (t === 'bombwall') pBombWall(); else if (t === 'timed') pTimed();
    else if (t === 'multilever') pMulti(li < 5 ? 2 : 3); else if (t === 'runes') pRunes();
  }
  function placeTrap(t, x0, n) {""")

# assemble: npc starts, puzzles, cps queue
rep("  const plan = NPC_PLAN[li] || {};\n  if (plan.start) spawn('npc', 7, gy, { who: plan.start });\n  let cpNpcDone = false;",
    "  const plan = NPC_PLAN[li] || {};\n  (plan.start || []).forEach((w, i) => spawn('npc', 7 + i * 2, gy, { who: w }));\n  if (li === 0) spawn('pk', 14, gy, { what: 'dagger' });\n  let cpNpcIdx = 0;\n  const pzList = PUZZLES[li] || []; let pzIdx = 0;\n  const pzAt = pzList.map((_, i) => Math.floor(B.len * (0.14 + 0.7 * (i + 0.5) / pzList.length)));")
rep("if (plan.cp && !cpNpcDone) { spawn('npc', ax + 4, gy, { who: plan.cp }); cpNpcDone = true; }",
    "if (plan.cps && cpNpcIdx < plan.cps.length) { spawn('npc', ax + 4, gy, { who: plan.cps[cpNpcIdx++] }); }")
rep("    if (placed < 3 && x > shardAt[placed]) { secret(placed); placed++; continue; }",
    "    if (placed < 3 && x > shardAt[placed]) { secret(placed); placed++; continue; }\n    if (pzIdx < pzList.length && x > pzAt[pzIdx]) { runPuzzle(pzList[pzIdx++]); continue; }")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
