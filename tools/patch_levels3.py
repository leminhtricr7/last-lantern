import io
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:80]
    s = s.replace(old, new, cnt)


rep("const TITLE_MUSIC =", "const DEVIL_MUSIC = { root: 38, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 68, wave: 'sawtooth', prog: [0, 1, 0, -2], seed: 66, density: 0.3 };\nconst TITLE_MUSIC =")

a = s.index("const NPC_PLAN = {")
b = s.index("// puzzles per map, easy -> hard")
s = s[:a] + u"""const NPC_PLAN = {
  0: { start: ['lila'], cps: ['fairy'] },
  1: { start: ['bram'], cps: ['gob', 'quan', 'wizard'] },
  2: { cps: ['quan', 'smith', 'wizard'] },
  3: { start: ['bram'], cps: ['gob', 'miku', 'smith'] },
  4: { cps: ['angel', 'smith'] },
  5: { cps: ['gob', 'miku', 'smith'] },
  6: { cps: ['wizard'], pre: ['lila', 'angel', 'bram', 'quan', 'miku', 'fairy'] }
};
""" + s[b:]

a = s.index("const PUZZLES = {")
b = s.index("function genLevel(li) {")
s = s[:a] + u"""const PUZZLES = {
  0: ['lever', 'rescue', 'bombwall'],
  1: ['key', 'trial', 'lever', 'torches'],
  2: ['torches', 'bombwall', 'multilever'],
  3: ['timed', 'trial', 'key', 'bombwall'],
  4: ['seqtorch', 'multilever', 'timed'],
  5: ['timed', 'bombwall', 'trial', 'seqtorch', 'key'],
  6: ['runes', 'seqtorch', 'trial', 'multilever', 'timed']
};
const TRIAL_WAVES = { 1: 2, 3: 3, 5: 3, 6: 4 };

""" + s[b:]

rep("gates: [], xwalls: [], id: 0 };", "gates: [], xwalls: [], trials: [], id: 0 };")

rep("  function runPuzzle(t) {", u"""  function pRescue() { // Miku's cage, guarded
    const n = 38, x0 = pzFlat(n), grp = L.id++;
    spawn('cage', x0 + n - 8, gy, { grp });
    let placed = 0, tries = 0;
    while (placed < 4 && tries++ < 30) {
      const t = pick(); if (FLY.has(t)) continue;
      spawn(t, x0 + n - 20 + placed * 3, gy, { grp }); placed++;
    }
    spawn('heart', x0 + 10, gy - 2);
    coinsLine(x0 + 14, gy - 2, 4);
  }
  function pTrial() { // Mr Shorty Phong's trial: sealed arena, waves of monsters
    const n = 42, x0 = pzFlat(n);
    L.trials.push({ id: L.id++, lw: x0 + 8, rw: x0 + n - 6, trig: x0 + 10, gy, waves: TRIAL_WAVES[li] || 3 });
    spawn('spiketrap', x0 + 17, gy, { w: 2, off: rnd() * 3 });
    spawn('spiketrap', x0 + 26, gy, { w: 2, off: rnd() * 3 });
    for (let i = 0; i < 3; i++) set(x0 + 20 + i, gy - 3, '=');
  }
  function runPuzzle(t) {
    if (t === 'rescue') { pRescue(); return; }
    if (t === 'trial') { pTrial(); return; }""")

rep("  { const ax = x; flat(8, { safe: true, cp: true, heart: true });", "  { const ax = x; flat(plan.pre ? 16 : 8, { safe: true, cp: true, heart: true });")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
