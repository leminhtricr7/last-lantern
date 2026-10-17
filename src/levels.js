'use strict';
// ============ 7 BIOMES + PROCEDURAL LEVEL GENERATOR ============
const FLY = new Set(['bat', 'bee', 'vulture', 'icebat', 'fire', 'ghost', 'firebat', 'wisp', 'shadewisp', 'imp', 'shadeimp']);

const BIOMES = [
  { // 1
    id: 'meadow', seed: 11, len: 300, hazard: 'spikes', dark: 0, sun: true, particles: 'pollen',
    name: { en: 'Verdant Meadow', vi: 'Đồng Cỏ Xanh' }, sub: { en: 'Where the light first faded', vi: 'Nơi ánh sáng bắt đầu tắt' },
    sky: ['#2b3a67', '#5b6fa8', '#e08a6a', '#ffc98a'], far: '#6a7fae', mid: '#3f6f66', style: 'hills', tree: ['#2f6a4c', '#4a8a5a'],
    ground: { top: '#5fcf5a', topDark: '#2b8a3e', topLight: '#a4e86b', body: '#8a5a34', dark: '#5e3b22', light: '#a87442' },
    plat: ['#c28a4e', '#7a4e28'], spike: ['#e6ecf5', '#8892aa'],
    decor: [['tuft'], ['flower', { m: 'm' }], ['flower', { m: 'y' }], ['bush'], ['rock']],
    enemies: [{ t: 'slime', w: 5, min: 0 }, { t: 'beetle', w: 3, min: 0 }, { t: 'bee', w: 2, min: 0.18 }],
    music: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 112, wave: 'square', prog: [0, 5, 7, 5], seed: 3 },
    proj: '#a4e86b', traps: ['spiketrap']
  },
  { // 2
    id: 'forest', seed: 22, len: 340, hazard: 'spikes', dark: 0.28, sun: true, particles: 'fireflies',
    name: { en: 'Whispering Forest', vi: 'Rừng Thì Thầm' }, sub: { en: 'The trees remember the sun', vi: 'Cây cối vẫn nhớ mặt trời' },
    sky: ['#0f2a2a', '#1f4b3f', '#2f7a5a', '#6fb98a'], far: '#1c4a3c', mid: '#12332b', style: 'pines', tree: ['#0c2a22', '#1d5a45'],
    ground: { top: '#3fa05a', topDark: '#1f6a3a', topLight: '#7ad68a', body: '#4a3426', dark: '#2e2018', light: '#6a4a36' },
    plat: ['#8a6a44', '#4e3a24'], spike: ['#c8d8b8', '#6a7a5a'],
    decor: [['mushroom'], ['mushroom', { r: 'c', e: 'w' }], ['tuft', { g: 'G', t: 'g' }], ['rock'], ['bush', { g: 'G', t: 'g' }]],
    enemies: [{ t: 'spider', w: 4, min: 0 }, { t: 'zombie', w: 3, min: 0 }, { t: 'shroom', w: 3, min: 0.05 }, { t: 'bat', w: 3, min: 0.1 }, { t: 'beetle', w: 2, min: 0 }],
    music: { root: 57, scale: [0, 3, 5, 7, 10], bpm: 98, wave: 'square', prog: [0, 3, 5, 3], seed: 9 },
    proj: '#a4e86b', traps: ['turret', 'spiketrap'], trapStyle: 'wood'
  },
  { // 3
    id: 'caves', seed: 33, len: 380, hazard: 'spikes', dark: 0.7, sun: false, particles: 'drips',
    name: { en: 'Crystal Caverns', vi: 'Hang Pha Lê' }, sub: { en: 'Only your lantern shows the way', vi: 'Chỉ ngọn đèn của bạn soi đường' },
    sky: ['#0b0a1a', '#17143a', '#2a2260', '#3d3380'], far: '#1b1840', mid: '#241f52', style: 'cave', tree: ['#000', '#000'],
    ground: { top: '#6a68b0', topDark: '#3c3a7a', topLight: '#a0a0ee', body: '#2b2a4a', dark: '#1c1b33', light: '#3f3d6a' },
    plat: ['#6a68b0', '#34326a'], spike: ['#7eeaf5', '#2c9ab8'],
    decor: [['crystal'], ['crystal', { c: 'm', C: 'p' }], ['rock', { d: 'h', l: 'c', D: 'P' }], ['crystal', { c: 'w', C: 'l' }]],
    enemies: [{ t: 'bat', w: 4, min: 0 }, { t: 'cavespider', w: 4, min: 0 }, { t: 'iceslime', w: 3, min: 0 }, { t: 'wisp', w: 3, min: 0.1 }],
    music: { root: 55, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 86, wave: 'triangle', prog: [0, -2, -4, -5], seed: 14, density: 0.45 },
    proj: '#6ee7f2', traps: ['rockfall']
  },
  { // 4
    id: 'desert', seed: 44, len: 420, hazard: 'spikes', dark: 0, sun: true, particles: 'sand',
    name: { en: 'Sunscorch Desert', vi: 'Sa Mạc Cháy Nắng' }, sub: { en: 'Even a dead sun leaves its heat', vi: 'Mặt trời chết vẫn để lại hơi nóng' },
    sky: ['#3d1c4a', '#a8404a', '#f08a4a', '#ffd08a'], far: '#c86a4a', mid: '#a8503a', style: 'dunes', tree: ['#000', '#000'],
    ground: { top: '#f0c878', topDark: '#c8964a', topLight: '#ffe8a8', body: '#c8964a', dark: '#a07030', light: '#e0b060' },
    plat: ['#d8a860', '#8a5a28'], spike: ['#f6efe0', '#b9a77a'],
    decor: [['cactus'], ['bones'], ['rock', { d: 'n', l: 'S', D: 'N' }], ['cactus', { g: 'G' }]],
    enemies: [{ t: 'scorpion', w: 4, min: 0 }, { t: 'sandbeetle', w: 3, min: 0 }, { t: 'vulture', w: 3, min: 0.1 }, { t: 'mummy', w: 3, min: 0.3 }],
    music: { root: 62, scale: [0, 1, 4, 5, 7, 8, 11], bpm: 108, wave: 'square', prog: [0, 1, 0, -2], seed: 21 },
    proj: '#ffd34e', traps: ['turret', 'spiketrap'], trapStyle: 'sand'
  },
  { // 5
    id: 'frost', seed: 55, len: 460, hazard: 'spikes', dark: 0.1, sun: true, particles: 'snow',
    name: { en: 'Frostbite Peaks', vi: 'Đỉnh Băng Giá' }, sub: { en: 'Slippery ground, sharper teeth', vi: 'Nền trơn trượt, nanh vuốt sắc hơn' },
    sky: ['#1a2b5a', '#3a5a9a', '#7ab0e0', '#d8f0ff'], far: '#6a8ac0', mid: '#9ac0e8', style: 'ice', tree: ['#000', '#000'],
    ground: { top: '#ffffff', topDark: '#b8d8f0', topLight: '#ffffff', body: '#6a8ac0', dark: '#4a6aa0', light: '#9ac0e8' },
    plat: ['#b8d8f0', '#6a8ac0'], spike: ['#e8fbff', '#6ec8e8'],
    decor: [['snow'], ['crystal', { c: 'w', C: 'c' }], ['rock', { d: 'l', l: 'w', D: 'd' }], ['snow']],
    enemies: [{ t: 'iceslime', w: 4, min: 0 }, { t: 'snowman', w: 4, min: 0.1 }, { t: 'icebat', w: 3, min: 0.1 }, { t: 'zombie', w: 2, min: 0.2 }],
    music: { root: 64, scale: [0, 2, 4, 7, 9], bpm: 94, wave: 'triangle', prog: [0, 5, 3, 7], seed: 5 },
    proj: '#bfeaff', ice: true, traps: ['rockfall', 'spiketrap']
  },
  { // 6
    id: 'volcano', seed: 66, len: 500, hazard: 'lava', dark: 0.15, sun: false, particles: 'embers',
    name: { en: 'Ember Volcano', vi: 'Núi Lửa Tro Tàn' }, sub: { en: 'The ground itself wants you gone', vi: 'Chính mặt đất muốn tiễn bạn đi' },
    sky: ['#1a0808', '#4a1010', '#a02a10', '#f06a20'], far: '#4a1a14', mid: '#2e0f0c', style: 'volcano', tree: ['#000', '#000'],
    ground: { top: '#5a5a66', topDark: '#33333d', topLight: '#80808f', body: '#2e2a30', dark: '#1c181c', light: '#4a3f44' },
    plat: ['#5a5a66', '#2e2a30'], spike: ['#5a4a55', '#2a1f28'],
    decor: [['rock', { d: 'D', l: 'd', D: 'k' }], ['crystal', { c: 'y', C: 'o' }], ['bones'], ['rock', { d: 'R', l: 'r', D: 'k' }]],
    enemies: [{ t: 'lavaslime', w: 4, min: 0 }, { t: 'fire', w: 3, min: 0.1 }, { t: 'burnt', w: 3, min: 0.2 }, { t: 'firebat', w: 2, min: 0.3 }, { t: 'imp', w: 3, min: 0.2 }],
    music: { root: 52, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 128, wave: 'square', prog: [0, 1, 0, 3], seed: 30 },
    proj: '#ff9a2a', movers: true, traps: ['jets', 'rockfall', 'saw'], trapStyle: 'dark'
  },
  { // 7
    id: 'citadel', seed: 77, len: 720, hazard: 'spikes', dark: 0.5, sun: false, stars: true, particles: 'motes',
    name: { en: 'Shadow Citadel', vi: 'Thành Trì Bóng Tối' }, sub: { en: 'The Eclipse waits at the top', vi: 'Nhật Thực đang đợi trên đỉnh' },
    sky: ['#06040f', '#150a2a', '#2a1450', '#4a2a7a'], far: '#1a1030', mid: '#0e0820', style: 'citadel', tree: ['#000', '#000'],
    ground: { top: '#7a6aae', topDark: '#3a2f66', topLight: '#a89add', body: '#2a2248', dark: '#1a1430', light: '#463a78' },
    plat: ['#7a6aae', '#3a2f66'], spike: ['#c9a0ff', '#6a3aa8'],
    decor: [['torch'], ['bones', { e: 'l', E: 'd' }], ['crystal', { c: 'h', C: 'P' }], ['torch']],
    enemies: [{ t: 'knight', w: 4, min: 0 }, { t: 'ghost', w: 3, min: 0 }, { t: 'shadeslime', w: 3, min: 0 }, { t: 'shadowskel', w: 3, min: 0.2 }, { t: 'cavespider', w: 2, min: 0.3 }, { t: 'shadewisp', w: 3, min: 0.1 }, { t: 'shadeimp', w: 3, min: 0.3 }],
    music: { root: 50, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 120, wave: 'square', prog: [0, -2, -4, -5], seed: 41 },
    proj: '#d58bff', movers: true, traps: ['saw', 'turret', 'spiketrap'], trapStyle: 'dark'
  }
];

const BOSS_MUSIC = { root: 48, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 150, wave: 'square', prog: [0, 1, 3, 1], seed: 77, density: 0.7 };
const DEVIL_MUSIC = { root: 38, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 68, wave: 'sawtooth', prog: [0, 1, 0, -2], seed: 66, density: 0.3 };
const TITLE_MUSIC = { root: 60, scale: [0, 2, 4, 7, 9], bpm: 78, wave: 'triangle', prog: [0, 5, 3, 7], seed: 2, density: 0.4, drums: true };

const NPC_PLAN = {
  0: { start: ['lila'], cps: ['fairy'] },
  1: { start: ['bram'], cps: ['gob', 'quan', 'wizard'] },
  2: { cps: ['quan', 'hoang', 'smith', 'wizard'] },
  3: { start: ['bram'], cps: ['gob', 'duong', 'lyra', 'smith'] },
  4: { cps: ['angel', 'santree', 'smith'] },
  5: { cps: ['gob', 'lyra', 'smith'] },
  6: { cps: ['wizard'], pre: ['lila', 'angel', 'bram', 'quan', 'lyra', 'fairy'] }
};
// puzzles per map, easy -> hard
const PUZZLES = {
  0: ['dragon', 'lever', 'rescue', 'trial', 'bombwall'],
  1: ['key', 'lever', 'torches'],
  2: ['torches', 'trial', 'bombwall', 'multilever'],
  3: ['timed', 'key', 'bombwall'],
  4: ['seqtorch', 'multilever', 'timed'],
  5: ['dragon6', 'timed', 'bombwall', 'trial', 'seqtorch', 'key'],
  6: ['runes', 'fetch', 'seqtorch', 'trial', 'shorty', 'multilever', 'fetch', 'timed', 'trial', 'sy']
};
const TRIAL_WAVES = { 0: 2, 2: 3, 5: 4, 6: 5 };

function genLevel(li) {
  const B = BIOMES[li], rnd = mulberry32(9001 + li * 7919);
  const R = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const H = 15, W = B.len + 100;
  const grid = []; for (let y = 0; y < H; y++) grid.push(new Array(W).fill(' '));
  const L = { B, li, W, H, grid, spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], trials: [], dragons: [], minis: [], dark: [], creep: [], id: 0 };
  const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = c; };
  const col = (x, top) => { for (let y = top; y < H; y++) grid[y][x] = (B.ice && rnd() < 0.55) ? 'I' : '#'; };
  const solidCol = (x, top) => { for (let y = top; y < H; y++) grid[y][x] = '#'; };
  const maxGap = li === 0 ? 3 : 5;
  const hz = B.hazard === 'lava' ? '~' : '^';
  let x = 0, gy = 10;
  const diff = () => Math.min(1, 0.08 + li * 0.12 + (x / B.len) * 0.3);
  const spawn = (type, tx, ty, ex) => { L.spawns.push(Object.assign({ id: L.id++, type, x: tx * TS + TS / 2, y: ty * TS }, ex)); };

  function pick() {
    const d = diff(), c = B.enemies.filter(e => e.min <= d);
    let tot = 0; c.forEach(e => tot += e.w);
    let r = rnd() * tot;
    for (const e of c) { r -= e.w; if (r <= 0) return e.t; }
    return c[0].t;
  }
  function variant() {
    const r = rnd();
    if (li >= 3 && r < 0.05 + 0.025 * li) return 'elite';
    if (li >= 1 && r < 0.12 + 0.03 * li) return 'big';
    if (r > 0.84) return 'small';
    return null;
  }
  function addEnemy(tx, ground) {
    const t = pick(), v = variant();
    if (FLY.has(t)) spawn(t, tx, ground - R(3, 5), { v }); else spawn(t, tx, ground, { v });
  }
  function coinsLine(tx, ty, n) { for (let i = 0; i < n; i++) spawn('coin', tx + i, ty); }

  function flat(n, o) {
    o = o || {};
    const d = diff();
    for (let i = 0; i < n; i++) col(x + i, gy);
    for (let i = 0; i < n; i++) if (rnd() < 0.2) L.decor.push({ x: (x + i) * TS + R(0, 8), y: gy * TS, k: R(0, B.decor.length - 1) });
    if (!o.safe && n >= 5) {
      const cnt = rnd() < 0.78 + d * 0.2 ? (li === 6 ? 1 : 0) + 1 + (d > 0.45 && rnd() < 0.6 ? 1 : 0) + (d > 0.8 && rnd() < 0.5 ? 1 : 0) + (n >= 9 && rnd() < 0.7 ? 1 : 0) + (li >= 2 && rnd() < 0.35 ? 1 : 0) : 0;
      for (let c = 0; c < cnt; c++) addEnemy(x + R(2, n - 2), gy);
    }
    if (o.cp) { L.checkpoints.push({ x: (x + 2) * TS + 8, y: gy * TS, id: L.id++ }); }
    if (o.heart) spawn('heart', x + (n >> 1), gy - 2);
    if (rnd() < 0.6 && n >= 5) coinsLine(x + R(1, n - 4), gy - 2, R(3, 4));
    if (rnd() < 0.13 && n >= 5) spawn('pk', x + R(1, n - 2), gy, { what: pickWhat() });
    if (!o.safe && n >= 8 && B.traps && rnd() < 0.3 + d * 0.3 + (li === 6 ? 0.25 : 0)) placeTrap(B.traps[R(0, B.traps.length - 1)], x, n);
    x += n;
  }
  function pickWhat() { const r = rnd(); return r < 0.45 ? 'dagger' : (r < 0.75 ? 'bomb' : 'flask'); }
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
  function pRescue() { // Lyra's cage, guarded
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
  function pTrial() { // Mr Shorty Phong's trial: sealed arena, waves of monsters AND a torch puzzle to open the exit
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
  function pMini(who) { // Mr Shorty / Mr Sy duel: sealed arena, resolved in game.js
    const n = 54, x0 = pzFlat(n);
    L.minis.push({ id: L.id++, who, lw: x0 + 8, rw: x0 + n - 6, trig: x0 + 11, gy });
    for (let i = 0; i < 4; i++) { set(x0 + 17 + i, gy - 4, '='); set(x0 + 33 + i, gy - 4, '='); }
    spawn('heart', x0 + 4, gy - 2);
  }
  function pFetch() { // back-and-forth: the gate needs TWO keys; one lies in this room, the other far behind you
    const n = 42, x0 = pzFlat(n);
    gateAt(x0 + n - 5, 'key', { keys: 2 });
    ledges(x0, [[8, 2, 3], [12, 4, 3]]); spawn('key', x0 + 13, gy - 4, {});
    pzGuards(x0, n, 3);
    if (B.traps) placeTrap(B.traps[R(0, B.traps.length - 1)], x0 + 14, 14);
    let kx = -1;
    for (let tx = x0 - 34; tx > x0 - 100 && kx < 0; tx--) {
      if (tx < 16) break;
      let top = -1; for (let yy = 5; yy < H - 2; yy++) if (grid[yy][tx] === '#') { top = yy; break; }
      if (top < 7) continue;
      let ok = true; for (let dx = -2; dx <= 2 && ok; dx++) { const c = grid[top][tx + dx], a1 = grid[top - 1][tx + dx], a2 = grid[top - 2][tx + dx]; if (c !== '#' || a1 !== ' ' || a2 !== ' ') ok = false; }
      if (ok) kx = tx;
    }
    if (kx >= 0) {
      let top = 0; for (let yy = 5; yy < H - 2; yy++) if (grid[yy][kx] === '#') { top = yy; break; }
      spawn('key', kx, top, {}); spawn('turret', kx + 6, top, { dir: -1 }); coinsLine(kx - 3, top - 2, 3);
      const t = pick(); if (!FLY.has(t)) { spawn(t, kx + 2, top, { v: 'elite' }); }
    }
  }
  function runPuzzle(t) {
    if (t === 'fetch') { pFetch(); return; }
    if (t === 'shorty' || t === 'sy') { pMini(t); return; }
    if (t === 'rescue') { pRescue(); return; }
    if (t === 'trial') { pTrial(); return; }
    if (t === 'dragon') { pDragon('young'); return; }
    if (t === 'dragon6') { pDragon('map6'); return; }
    if (t === 'lever') pLever(); else if (t === 'key') pKey();
    else if (t === 'torches') pTorches(li < 3 ? 2 : 3, false); else if (t === 'seqtorch') pTorches(li < 6 ? 3 : 4, true);
    else if (t === 'bombwall') pBombWall(); else if (t === 'timed') pTimed();
    else if (t === 'multilever') pMulti(li < 5 ? 2 : 3); else if (t === 'runes') pRunes();
  }
  function placeTrap(t, x0, n) {
    if (t === 'turret') { spawn('turret', x0 + n - 2, gy, { dir: -1 }); if (li >= 3 && n >= 12) spawn('turret', x0 + 1, gy, { dir: 1 }); }
    else if (t === 'spiketrap') { spawn('spiketrap', x0 + 3, gy, { w: 2, off: rnd() * 3 }); if (n >= 11) spawn('spiketrap', x0 + n - 6, gy, { w: 3, off: rnd() * 3 }); }
    else if (t === 'jets') { spawn('jets', x0 + 3, gy, { off: rnd() * 3 }); if (n >= 10) spawn('jets', x0 + n - 4, gy, { off: rnd() * 3 }); }
    else if (t === 'saw') { if (n >= 10) spawn('saw', x0 + 1, gy, { len: n - 2 }); else spawn('spiketrap', x0 + 3, gy, { w: 2, off: rnd() * 3 }); }
    else if (t === 'rockfall') { spawn('rockfall', x0 + 3, gy, { off: rnd() * 2 }); if (n >= 10) spawn('rockfall', x0 + n - 4, gy, { off: rnd() * 2 }); }
  }
  function patrol() {
    const n = R(8, 12), x0 = x;
    flat(n, { safe: true });
    const k = 2 + (rnd() < 0.45 ? 1 : 0) + (li >= 2 ? 1 : 0);
    for (let c = 0; c < k; c++) addEnemy(x0 + 2 + c * 3 + R(0, 1), gy);
  }
  function trapRun() {
    if (!B.traps) { flat(R(6, 10)); return; }
    const n = R(12, 16), x0 = x;
    flat(n, { safe: true });
    placeTrap(B.traps[R(0, B.traps.length - 1)], x0, n);
    coinsLine(x0 + 3, gy - 4, 3);
  }
  function gap(n) {
    const ny = Math.max(8, Math.min(11, gy + R(-1, 1)));
    let nn = Math.min(n, maxGap + (ny > gy ? 1 : 0) - (ny < gy ? 1 : 0)); if (nn < 2) nn = 2;
    for (let i = 0; i < nn; i++) { if (hz === '~') { set(x + i, H - 2, '~'); set(x + i, H - 1, '~'); } else set(x + i, H - 1, '^'); }
    if (nn >= 4 || (nn >= 3 && rnd() < 0.4)) {
      const ch = (li >= 1 && rnd() < 0.3) ? 'C' : '=';
      const mid = x + (nn >> 1) - 1;
      for (let i = 0; i < 3; i++) set(mid + i, gy - 1, ch);
    }
    if (B.hazard === 'lava' && rnd() < 0.55) spawn('lavablob', x + nn / 2, H - 1);
    for (let i = 0; i < nn; i++) if (i > 0 && i < nn - 1) { const arc = Math.round(Math.sin((i / (nn - 1)) * Math.PI) * 2.5); if (rnd() < 0.5) spawn('coin', x + i, gy - 2 - arc); }
    x += nn; gy = ny;
    flat(R(4, 6), { safe: rnd() < 0.4 });
  }
  function stairs(dir) {
    const steps = R(2, 4);
    for (let s = 0; s < steps; s++) {
      const ng = gy + dir * R(1, 2);
      if (ng >= 8 && ng <= 11) gy = ng;
      flat(R(2, 4), { safe: true });
    }
    flat(4);
  }
  function spikes() {
    const len = R(2, li === 0 ? 3 : 4);
    flat(4, { safe: true });
    for (let i = 0; i < len; i++) { col(x + i, gy); set(x + i, gy - 1, '^'); }
    if (rnd() < 0.7) coinsLine(x, gy - 4, len);
    x += len;
    flat(R(3, 5));
  }
  function chain() {
    const n = R(8, 12);
    const jump = li < 1 ? 2 : 3;
    for (let i = 0; i < n; i++) { if (hz === '~') { set(x + i, H - 2, '~'); set(x + i, H - 1, '~'); } else set(x + i, H - 1, '^'); }
    let px = x + 1, row = gy - 1, crumbles = 0;
    while (px < x + n - 2) {
      const w = R(2, 3);
      const nr = Math.max(gy - 3, Math.min(gy, row + R(-2, 1)));
      const rise = row - nr;
      const gapx = Math.min(R(1, jump), rise >= 2 ? 2 : jump);
      const ch = (li >= 2 && crumbles < 1 && rnd() < 0.3) ? 'C' : '=';
      if (ch === 'C') crumbles++; else crumbles = 0;
      for (let i = 0; i < w; i++) set(px + i, nr, ch);
      if (rnd() < 0.7) spawn('coin', px + 1, nr - 2);
      if (FLY.has(B.enemies[0].t) === false && rnd() < 0.12 + diff() * 0.2) { const f = B.enemies.find(e => FLY.has(e.t) && e.min <= diff()); if (f) spawn(f.t, px + 1, nr - 4); }
      row = nr; px += w + gapx;
    }
    x += n;
    flat(R(3, 5), { safe: true });
  }
  function mover() {
    const n = R(6, 8);
    for (let i = 0; i < n; i++) { if (hz === '~') { set(x + i, H - 2, '~'); set(x + i, H - 1, '~'); } else set(x + i, H - 1, '^'); }
    L.plats.push({ x: (x - 1) * TS, y: gy * TS, w: 48, h: 8, x0: (x - 1) * TS, x1: (x + n - 2) * TS, y0: gy * TS, y1: gy * TS, sp: 28 + li * 3, t: 0, dx: 0, dy: 0 });
    if (hz === '~' && rnd() < 0.7) spawn('lavablob', x + n / 2, H - 1);
    coinsLine(x + 2, gy - 3, 3);
    x += n;
    flat(R(4, 6), { safe: true });
  }
  function mover2() { // vertical elevator going up to higher ledge
    flat(3, { safe: true });
    const up = 4;
    L.plats.push({ x: x * TS, y: gy * TS, w: 32, h: 8, x0: x * TS, x1: x * TS, y0: (gy - up) * TS, y1: gy * TS, sp: 22, t: 0, dx: 0, dy: 0, vert: true });
    // pit under elevator & a high ledge to the right
    for (let i = 0; i < 4; i++) { set(x + i, H - 1, hz); if (hz === '~') set(x + i, H - 2, '~'); }
    const ng = gy - up; // ledge row
    x += 4;
    const keep = gy; gy = Math.max(6, ng);
    flat(4, { safe: true });
    // go back to normal height by stairs down
    gy = Math.min(11, gy + 2); flat(3, { safe: true });
    gy = Math.min(11, gy + 2); flat(3, { safe: true });
    if (gy < keep) { gy = keep; flat(3, { safe: true }); }
  }
  function tower() {
    const h = li === 0 ? 2 : R(2, 3);
    const ng = gy - h;
    if (ng >= 6) { gy = ng; }
    flat(R(4, 6));
  }
  function drop() { gy = Math.min(11, gy + R(1, 3)); flat(R(4, 6)); }
  function arena() { // enemy gauntlet
    const n = 14;
    for (let i = 0; i < n; i++) col(x + i, gy);
    const k = 2 + (li > 3 ? 1 : 0) + (li > 5 ? 1 : 0);
    for (let c = 0; c < k; c++) addEnemy(x + 3 + c * 3, gy);
    if (rnd() < 0.5) { for (let i = 0; i < 3; i++) set(x + 5 + i, gy - 3, '='); coinsLine(x + 5, gy - 5, 3); }
    x += n; flat(3, { safe: true });
  }
  function secret(k) {
    const shape = k % 3;
    let shapes;
    if (shape === 0) shapes = [[3, 2, 2], [0, 2, 4], [3, 2, 6]];
    else if (shape === 1) shapes = [[0, 2, 2], [3, 2, 4], [0, 2, 6]];
    else shapes = [[3, 2, 2], [7, 2, 3], [11, 2, 4], [15, 2, 5]];
    const flatLen = shape === 2 ? 22 : 10;
    if (gy < 8) gy = 8;
    const x0 = x + 2;
    flat(flatLen, { safe: true, cp: false });
    shapes.forEach((s, i) => { for (let j = 0; j < s[1]; j++) set(x0 + s[0] + j, gy - s[2], '='); if (i < shapes.length - 1) spawn('coin', x0 + s[0], gy - s[2] - 2); });
    const top = shapes[shapes.length - 1];
    spawn('shard', x0 + top[0] + 1, gy - top[2] - 1.5, { k });
    if (li >= 2) { const f = B.enemies.find(e => FLY.has(e.t)); if (f) spawn(f.t, x0 + top[0] - 1, Math.max(3, gy - top[2] - 3)); }
  }

  // ---- assemble ----
  flat(10, { safe: true });
  L.start = { x: 3 * TS, y: gy * TS };
  const plan = NPC_PLAN[li] || {};
  (plan.start || []).forEach((w, i) => spawn('npc', 7 + i * 2, gy, { who: w }));
  if (li === 0) spawn('pk', 14, gy, { what: 'dagger' });
  let cpNpcIdx = 0;
  const pzList = PUZZLES[li] || []; let pzIdx = 0;
  const pzAt = pzList.map((t, i) => (t === 'dragon' && li === 0) ? 26 : Math.floor(B.len * (0.14 + 0.7 * (i + 0.5) / pzList.length)));
  let nextCp = 42, placed = 0;
  const shardAt = [0.2, 0.5, 0.76].map(f => Math.floor(B.len * f));
  while (x < B.len - 16) {
    if (x > nextCp) { const ax = x; flat(6, { safe: true, cp: true, heart: rnd() < 0.5 }); if (plan.cps && cpNpcIdx < plan.cps.length) { spawn('npc', ax + 4, gy, { who: plan.cps[cpNpcIdx++] }); } nextCp = x + R(38, 52); continue; }
    if (placed < 3 && x > shardAt[placed]) { secret(placed); placed++; continue; }
    if (pzIdx < pzList.length && x > pzAt[pzIdx]) { runPuzzle(pzList[pzIdx++]); continue; }
    const r = rnd(), d = diff();
    if (r < 0.18) flat(R(6, 12));
    else if (r < 0.34) gap(R(2, maxGap));
    else if (r < 0.40) stairs(rnd() < 0.5 ? -1 : 1);
    else if (r < 0.47) spikes();
    else if (r < 0.54) chain();
    else if (r < 0.57) tower();
    else if (r < 0.60) drop();
    else if (r < 0.78) patrol();
    else if (r < 0.81 && li >= 2) { if (rnd() < 0.5 || !B.movers) mover(); else mover2(); }
    else if (r < 0.95) { if (li >= 1 && rnd() < (li === 6 ? 0.65 : 0.4)) arena(); else trapRun(); }
    else flat(R(6, 10));
  }
  { const ax = x; flat(plan.pre ? 16 : 8, { safe: true, cp: true, heart: true }); (plan.pre || []).forEach((w, i) => spawn('npc', ax + 3 + i * 2, gy, { who: w })); }
  gy = 10; flat(4, { safe: true }); // return to arena height (visual step handled by stairs guard)
  // make sure arena ground is continuous: previous ground may differ -> already flat() uses gy.
  // ---- dark zones: every map has pitch-black stretches full of creepy things ----
  { const zn = li >= 2 ? 3 : 2, groundRow = tx => { for (let y = 3; y < H - 2; y++) if (grid[y][tx] === '#' || grid[y][tx] === 'I') return y; return 10; };
    for (let i = 0; i < zn; i++) {
      const cx = Math.floor(B.len * (0.2 + 0.58 * (i + 0.5) / zn)), z = { x0: cx - 20, x1: cx + 20, a: Math.max(0.82, B.dark + 0.2) };
      L.dark.push(z);
      for (let tx = z.x0; tx < z.x1; tx += R(3, 6)) { const gr = groundRow(tx); if (grid[gr - 1][tx] === ' ') L.creep.push({ x: tx * TS + R(2, 12), y: gr * TS, k: R(0, 3) }); }
    } }
  const ax0 = x, AW = li === 6 ? 48 : 44;   // every boss arena is wide, with platforms on three floors to jump up and dodge
  L.arena = { x0: ax0, x1: ax0 + AW, gy: 10 };
  for (let i = 0; i < AW; i++) col(ax0 + i, 10);
  for (let i = 0; i < AW; i++) solidCol(ax0 + i, 10);
  for (let y = 0; y < H; y++) { set(ax0 + AW, y, '#'); set(ax0 + AW + 1, y, '#'); }
  const PLATS = li === 6 ? [[7, 5, 9], [7, 17, 21], [7, 29, 33], [7, 40, 44], [5, 11, 15], [5, 23, 27], [5, 34, 38], [3, 19, 23], [3, 30, 33]]
    : li % 2 ? [[7, 5, 9], [7, 16, 20], [7, 27, 31], [7, 37, 40], [5, 10, 14], [5, 21, 25], [5, 32, 35], [3, 15, 18], [3, 26, 29]]
    : [[7, 6, 10], [7, 18, 22], [7, 30, 34], [5, 12, 16], [5, 24, 28], [5, 36, 39], [3, 8, 11], [3, 19, 23], [3, 31, 34]];
  PLATS.forEach(p => { for (let xx = p[1]; xx <= p[2]; xx++) set(ax0 + xx, p[0], '='); });
  L.checkpoints.push({ x: (ax0 - 4) * TS, y: 10 * TS, id: L.id++ });
  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 7) * TS, y: 10 * TS });
  L.endX = (ax0 + AW) * TS;
  // ground step safety: if the pre-arena ground is not at row 10 build ramp
  return L;
}
