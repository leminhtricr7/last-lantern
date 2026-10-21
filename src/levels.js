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
    id: 'caves', seed: 33, len: 500, hazard: 'spikes', dark: 0.7, sun: false, particles: 'drips',
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
    id: 'desert', seed: 44, len: 570, hazard: 'spikes', dark: 0, sun: true, particles: 'sand',
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
    id: 'frost', seed: 55, len: 640, hazard: 'spikes', dark: 0.1, sun: true, particles: 'snow',
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
    id: 'volcano', seed: 66, len: 710, hazard: 'lava', dark: 0.15, sun: false, particles: 'embers',
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
    id: 'citadel', seed: 77, len: 1000, hazard: 'spikes', dark: 0.5, sun: false, stars: true, particles: 'motes',
    name: { en: 'Shadow Citadel', vi: 'Thành Trì Bóng Tối' }, sub: { en: 'The Eclipse waits at the top', vi: 'Nhật Thực đang đợi trên đỉnh' },
    sky: ['#06040f', '#150a2a', '#2a1450', '#4a2a7a'], far: '#1a1030', mid: '#0e0820', style: 'citadel', tree: ['#000', '#000'],
    ground: { top: '#7a6aae', topDark: '#3a2f66', topLight: '#a89add', body: '#2a2248', dark: '#1a1430', light: '#463a78' },
    plat: ['#7a6aae', '#3a2f66'], spike: ['#c9a0ff', '#6a3aa8'],
    decor: [['torch'], ['bones', { e: 'l', E: 'd' }], ['crystal', { c: 'h', C: 'P' }], ['torch']],
    enemies: [{ t: 'knight', w: 4, min: 0 }, { t: 'ghost', w: 3, min: 0 }, { t: 'shadeslime', w: 3, min: 0 }, { t: 'shadowskel', w: 3, min: 0.2 }, { t: 'cavespider', w: 2, min: 0.3 }, { t: 'shadewisp', w: 3, min: 0.1 }, { t: 'shadeimp', w: 3, min: 0.3 }],
    music: { root: 50, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 120, wave: 'square', prog: [0, -2, -4, -5], seed: 41 },
    proj: '#d58bff', movers: true, traps: ['saw', 'turret', 'spiketrap'], trapStyle: 'dark'
  },
  { // 8 (play order 7)
    id: 'swamp', seed: 88, len: 640, hazard: 'spikes', dark: 0.35, sun: false, particles: 'spores',
    name: { en: 'Glowcap Swamp', vi: 'Đầm Lầy Nấm Phát Quang' }, sub: { en: 'Everything here glows, and everything here bites', vi: 'Mọi thứ ở đây đều phát sáng, và đều biết cắn' },
    sky: ['#06120e', '#0f2a20', '#1f4a34', '#3f6a3a'], far: '#14301f', mid: '#0b1f16', style: 'swamp', tree: ['#0c2018', '#1d4a35'],
    ground: { top: '#4a7a3a', topDark: '#2a4a22', topLight: '#7ab04a', body: '#3a2e22', dark: '#241c14', light: '#54442e' },
    plat: ['#6a5a3a', '#3a2e1e'], spike: ['#c8f0a0', '#5a8a3a'],
    decor: [['mushroom'], ['mushroom', { r: 'p', e: 'm' }], ['mushroom', { r: 'c', e: 'w' }], ['tuft', { g: 'G', t: 'g' }], ['rock', { d: 'G', l: 'g', D: 'k' }]],
    enemies: [{ t: 'bogslime', w: 4, min: 0 }, { t: 'shroom', w: 3, min: 0 }, { t: 'mosquito', w: 3, min: 0.05 }, { t: 'bogzombie', w: 3, min: 0.15 }, { t: 'toxbeetle', w: 2, min: 0.2 }],
    music: { root: 53, scale: [0, 2, 3, 7, 8], bpm: 104, wave: 'triangle', prog: [0, -4, -2, -5], seed: 51 },
    proj: '#c8f0a0', traps: ['turret', 'spiketrap'], trapStyle: 'wood'
  },
  { // 9 (play order 8)
    id: 'ocean', seed: 99, len: 560, zoom: 0.6, hazard: 'spikes', dark: 0.04, sun: false, water: true, particles: 'bubbles',
    name: { en: 'Sunken Deep', vi: 'Đại Dương Sâu Thẳm' }, sub: { en: 'Hold your breath - the sea is listening', vi: 'Nín thở nhé - biển cả đang lắng nghe' },
    sky: ['#02101e', '#06243e', '#0a4a6a', '#1a7a9a'], far: '#063050', mid: '#042238', style: 'ocean', tree: ['#0a5a4a', '#1a8a6a'],
    ground: { top: '#e8d8a0', topDark: '#b8a070', topLight: '#fff0c0', body: '#2a4a6a', dark: '#1a3048', light: '#3a6a8a' },
    plat: ['#c86a8a', '#7a3a5a'], spike: ['#3a2a5a', '#a07ae0'],
    decor: [['crystal', { c: 'm', C: 'r' }], ['tuft', { g: 'C', t: 'c', G: 'B' }], ['rock', { d: 'B', l: 'b', D: 'D' }], ['crystal', { c: 'c', C: 'C' }]],
    enemies: [{ t: 'crab', w: 4, min: 0 }, { t: 'jelly', w: 4, min: 0 }, { t: 'piranha', w: 3, min: 0.05 }, { t: 'seaslime', w: 3, min: 0 }, { t: 'eel', w: 2, min: 0.2 }],
    music: { root: 57, scale: [0, 2, 4, 7, 9, 11], bpm: 84, wave: 'triangle', prog: [0, 4, 5, 3], seed: 63, density: 0.5 },
    proj: '#6ee7f2', traps: ['rockfall', 'saw'], trapStyle: 'dark'
  },
  { // 10 (play order 9)
    id: 'tunnels', seed: 111, len: 800, deep: 34, arenaW: 72, lake: true, zoom: 0.55, hazard: 'spikes', dark: 0.62, sun: false, particles: 'drips',
    name: { en: 'Deepdig Tunnels', vi: 'Đường Hầm Sâu' }, sub: { en: 'The ground has teeth, and it is hungry', vi: 'Mặt đất có răng, và nó đang đói' },
    sky: ['#0a0806', '#1a140e', '#2a2016', '#3a2c1e'], far: '#1e1610', mid: '#140e0a', style: 'tunnel', tree: ['#000', '#000'],
    ground: { top: '#8a6a4a', topDark: '#5a4430', topLight: '#b08a60', body: '#3a2a1c', dark: '#241a10', light: '#52402c' },
    plat: ['#8a6a3a', '#4a3418'], spike: ['#c8c0b0', '#6a6050'],
    decor: [['rock', { d: 'n', l: 'S', D: 'N' }], ['crystal', { c: 'y', C: 'o' }], ['bones'], ['torch']],
    enemies: [{ t: 'mole', w: 4, min: 0 }, { t: 'rockslime', w: 3, min: 0 }, { t: 'bat', w: 3, min: 0 }, { t: 'cavespider', w: 3, min: 0.1 }, { t: 'minerskel', w: 3, min: 0.2 }],
    music: { root: 48, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 112, wave: 'square', prog: [0, 1, 0, -2], seed: 72, density: 0.55 },
    proj: '#ffd34e', movers: true, traps: ['rockfall', 'saw', 'spiketrap'], trapStyle: 'dark'
  }
];
// play order: the three new lands (7, 8, 9) come before the Shadow Citadel (6), which is the last map
const LORDER = [0, 1, 2, 3, 4, 5, 7, 8, 9, 6];
const LPOS = li => Math.max(0, LORDER.indexOf(li));
const LDIFF = li => [0, 1, 2, 3, 4, 5, 6, 5.25, 5.5, 5.75][li] || 0;   // how hard a map is (the Citadel stays the hardest)
const HARD = li => li >= 2;   // maps 3-10 are the long, hard ones (maps 1 and 2 stay gentle)
const HARDK = li => (li >= 2 ? Math.min(1, Math.max(0, (LPOS(li) - 1) / 8)) : 0);   // how far into the hard part: map 3 = 0.125 ... map 10 = 1

const BOSS_MUSIC = { root: 48, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 150, wave: 'square', prog: [0, 1, 3, 1], seed: 77, density: 0.7 };
// a fight track for each boss, built from its map's music: same key, a minor scale, its own melody, faster later on
const BOSS_TRACK = (li, tag) => {
  const m = BIOMES[li].music, p = LPOS(li), minor = m.scale.indexOf(3) >= 0 || m.scale.indexOf(1) >= 0, k = tag === 'shorty' ? 1 : (tag === 'sy' ? 2 : 0);
  return { root: (m.root % 12) + 48 - (li === 6 && !k ? 2 : 0) + (k ? 3 * k : 0), scale: minor ? m.scale : [0, 2, 3, 5, 7, 8, 10], bpm: 100 + p * 2.4 + k * 3,
    wave: (li === 6 && !k) || m.wave === 'triangle' ? 'sawtooth' : 'square', prog: [[0, 1, 3, 1], [0, -2, -4, -5], [0, 3, 5, 3], [0, 1, 0, -2], [0, -4, -2, -5]][(p + k) % 5],
    seed: 700 + li * 13 + k * 101, density: 0.62 + p * 0.03 };
};
const DEVIL_MUSIC = { root: 38, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 68, wave: 'sawtooth', prog: [0, 1, 0, -2], seed: 66, density: 0.3 };
const TITLE_MUSIC = { root: 60, scale: [0, 2, 4, 7, 9], bpm: 78, wave: 'triangle', prog: [0, 5, 3, 7], seed: 2, density: 0.4, drums: true };

const NPC_PLAN = {
  0: { start: ['lila', 'trader'], cps: ['fairy'] },
  1: { start: ['bram', 'trader'], cps: ['gob', 'quan', 'wizard'] },
  2: { start: ['trader'], cps: ['quan', 'hoang', 'smith', 'wizard'] },
  3: { start: ['bram', 'trader'], cps: ['gob', 'duong', 'lyra', 'smith'] },
  4: { start: ['trader'], cps: ['angel', 'santree', 'smith'] },
  5: { start: ['trader'], cps: ['gob', 'lyra', 'smith'] },
  7: { start: ['trader', 'frog'], cps: ['witch', 'bard', 'gob'] },
  8: { start: ['trader', 'pirate'], cps: ['mermaid', 'fisher', 'bard'] },
  9: { start: ['trader', 'miner'], cps: ['mole', 'bard', 'smith'] },
  6: { start: ['trader'], cps: ['wizard'], pre: ['lila', 'angel', 'bram', 'quan', 'lyra', 'fairy'] }
};
// puzzles per map, easy -> hard
const PUZZLES = {
  0: ['dragon', 'lever', 'rescue', 'trial', 'bombwall'],
  1: ['key', 'lever', 'torches'],
  2: ['torches', 'trial', 'bombwall', 'multilever'],
  3: ['timed', 'key', 'bombwall'],
  4: ['seqtorch', 'multilever', 'timed'],
  5: ['dragon6', 'timed', 'bombwall', 'trial', 'seqtorch', 'key'],
  7: ['torches', 'key', 'bombwall', 'multilever', 'timed'],
  8: ['lever', 'seqtorch', 'key', 'timed'],
  9: ['bombwall', 'multilever', 'key', 'bombwall', 'seqtorch'],
  6: ['runes', 'fetch', 'seqtorch', 'trial', 'shorty', 'multilever', 'fetch', 'timed', 'trial', 'sy']
};
const TRIAL_WAVES = { 0: 2, 2: 3, 5: 4, 6: 5 };


// ============ THE SUNKEN DEEP: a vertical level. You start on the shore, dive, and swim down through six zones to Oktavor ============
function genOcean(B, li) {
  const rnd = mulberry32(9001 + li * 7919), R = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const W = 84, H = 132, WY = 10, SH = [26, 40, 54, 68, 82, 96], ARY0 = 99, GY = H - 4;
  const grid = []; for (let y = 0; y < H; y++) grid.push(new Array(W).fill(' '));
  const L = { B, li, W, H, grid, vines: [], spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], trials: [], dragons: [], minis: [], dark: [], creep: [], id: 0, waterY: WY, currents: [], nooks: [] };
  const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = c; };
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
  const spawn = (type, tx, ty, ex) => { L.spawns.push(Object.assign({ id: L.id++, type, x: tx * TS + TS / 2, y: ty * TS }, ex)); };
  const cp = (tx, ty) => L.checkpoints.push({ x: tx * TS + TS / 2, y: ty * TS, id: L.id++ });
  const gapOf = k => (k % 2 === 0 ? [52, 71] : [12, 31]);          // even shelves open on the right, odd ones on the left
  const spanOf = k => (k % 2 === 0 ? [10, 51] : [32, 73]);        // the part of the shelf you can stand on
  // the shore, the walls, the shelves
  rect(0, WY, 21, 24, '#'); rect(0, WY, 9, H - 1, '#'); rect(W - 10, 8, W - 1, H - 1, '#');
  SH.forEach((s, k) => { rect(10, s, W - 11, s + 2, '#'); const g = gapOf(k); rect(g[0], s, g[1], s + 2, ' '); });
  // side pockets hidden in the thick walls: three hold Sea Pearls, the others Star Gems and a secret
  const AL = [{ s: 1, r: 30, it: 'rare', k: 0 }, { s: -1, r: 46, it: 'pearl' }, { s: -1, r: 60, it: 'egg', k: 1 }, { s: 1, r: 64, it: 'rare', k: 3 }, { s: 1, r: 74, it: 'pearl' }, { s: -1, r: 88, it: 'pearl', k: 2 }];
  for (const a of AL) {
    if (a.s < 0) rect(3, a.r, 9, a.r + 3, ' '); else rect(74, a.r, 80, a.r + 3, ' ');
    const tx = a.s < 0 ? 5 : 78, ty = a.r + 4;
    if (a.it === 'pearl') spawn('pearl', tx, ty);
    if (a.it === 'egg') { spawn('egg', tx, ty, { k: 'ocean' }); spawn('rare', tx + 1, ty, { k: a.k, y: ty * TS - 6 }); }
    else if (a.it === 'rare' || a.k !== undefined) spawn('rare', tx + (a.it === 'pearl' ? 2 : 0), ty, { k: a.k, y: ty * TS - 6 });
    for (let i = 0; i < 4; i++) spawn('coin', (a.s < 0 ? 4 : 75) + i * 1.5, a.r + 2);
    spawn('piranha', a.s < 0 ? 13 : 70, a.r + 1); if (a.it === 'pearl') spawn('piranha', a.s < 0 ? 15 : 68, a.r + 2);
  }
  const alcoveNear = (side, y) => AL.some(a => a.s === side && y >= a.r - 4 && y <= a.r + 6);
  // zones between the shelves
  for (let k = 0; k < 6; k++) {
    const s = SH[k], top = s + 3, bot = (k < 5 ? SH[k + 1] : ARY0) - 1, sideA = k % 2 === 0 ? 1 : -1, sp = spanOf(k);
    for (let i = 0; i < 3; i++) {   // floating ledges to rest on
      const w = R(4, 6), x0 = R(14, 64), y = top + 3 + R(0, Math.max(1, bot - top - 6));
      for (let xx = x0; xx < x0 + w; xx++) if (grid[y][xx] === ' ') set(xx, y, '=');
      for (let c = 0; c < 3; c++) spawn('coin', x0 + 1 + c, y - 2);
      if (k >= 1 && rnd() < 0.55) spawn('crab', x0 + (w >> 1), y);
    }
    { const y = top + R(3, 7), side = sideA; if (!alcoveNear(side, y)) { if (side > 0) rect(70, y, 73, y + 1, '#'); else rect(10, y, 13, y + 1, '#'); if (k >= 2) spawn('crab', side > 0 ? 71 : 11, y); } }
    // the shelf top: spikes, crabs, plants
    for (let x = sp[0]; x <= sp[1]; x++) if (rnd() < 0.3) L.decor.push({ x: x * TS + R(0, 8), y: s * TS, k: R(0, B.decor.length - 1) });
    if (k >= 1) { const x0 = sp[0] + R(10, sp[1] - sp[0] - 14); rect(x0, s - 1, x0 + 2, s - 1, '^'); }
    for (let c = 0; c < Math.min(3, 1 + (k >> 1)); c++) spawn(k >= 3 && c === 1 ? 'seaslime' : 'crab', sp[0] + R(6, sp[1] - sp[0] - 6), s);
    for (let c = 0; c < 4; c++) spawn('coin', sp[0] + 8 + c * 2, s - 1);
    if (k % 2 === 1) spawn('pk', sp[0] + R(8, 24), s, { what: rnd() < 0.5 ? 'bomb' : 'dagger' });
    // free swimmers, more of them the deeper you go
    const put = (type, n) => { for (let c = 0; c < n; c++) for (let t = 0; t < 12; t++) { const x = R(14, 68), y = R(top + 2, bot - 2); if (grid[y][x] === ' ') { spawn(type, x, y); break; } } };
    put('jelly', 2 + k); if (k >= 1) put('piranha', 1 + k); if (k >= 3) put('eel', k - 1);
    // currents that push you away from the way down, stronger every zone
    if (k >= 2) L.currents.push({ x0: 12, y0: top + 2, x1: 72, y1: bot - 1, vx: -sideA * (24 + k * 8), vy: 0 });
    if (k === 1) L.currents.push({ x0: 36, y0: top + 1, x1: 56, y1: bot - 1, vx: 0, vy: 34 });   // a gentle downdraft to learn swimming
    // checkpoint and friends on the safe side of every shelf
    cp(sideA > 0 ? 16 : 66, s);
    spawn('heart', sideA > 0 ? 18 : 64, s - 1);
  }
  spawn('npc', 24, SH[1], { who: 'fisher' }); spawn('npc', 58, SH[3], { who: 'bard' }); spawn('npc', 20, SH[4], { who: 'mole' });
  // the shore: three friends and a checkpoint
  cp(14, WY); spawn('npc', 8, WY, { who: 'trader' }); spawn('npc', 11, WY, { who: 'pirate' }); spawn('npc', 19, WY, { who: 'mermaid' });
  for (let i = 0; i < 4; i++) spawn('coin', 4 + i * 2, WY - 2);
  L.start = { x: 5 * TS, y: WY * TS };
  // the Tide Door: three Sea Pearls open it
  rect(12, 96, 31, 97, 'G'); L.pearlGate = { x0: 12, x1: 31, y0: 96, y1: 97, open: false };
  // Oktavor's cavern
  rect(4, ARY0, W - 5, GY - 1, ' '); rect(0, GY, W - 1, H - 1, '#');
  [[GY - 6, 14, 20], [GY - 6, 40, 46], [GY - 6, 64, 70], [GY - 12, 26, 32], [GY - 12, 54, 60], [GY - 18, 12, 18], [GY - 18, 40, 46], [GY - 18, 66, 72]].forEach(p => { for (let x = p[1]; x <= p[2]; x++) set(x, p[0], '='); });
  for (let i = 0; i < 8; i++) L.decor.push({ x: (10 + i * 9) * TS, y: GY * TS, k: R(0, B.decor.length - 1) });
  L.arena = { x0: 3, x1: W - 3, gy: GY, y0: ARY0, rects: [[12, 96, 31, 98]] };
  L.spawns.push({ id: L.id++, type: 'boss', x: (W - 24) * TS, y: GY * TS });
  L.endX = W * TS;
  return L;
}

function genLevel(li) {
  if (li === 8) return genOcean(BIOMES[li], li);
  const B = BIOMES[li], rnd = mulberry32(9001 + li * 7919), lv = LDIFF(li);
  const R = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  let H = 15; const W = B.len + (li === 7 ? 190 : 100);
  const grid = []; for (let y = 0; y < H; y++) grid.push(new Array(W).fill(' '));
  const L = { B, li, W, H, grid, vines: [], spawns: [], plats: [], decor: [], checkpoints: [], gates: [], xwalls: [], trials: [], dragons: [], minis: [], dark: [], creep: [], id: 0 };
  const set = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = c; };
  const col = (x, top) => { for (let y = top; y < H; y++) grid[y][x] = (B.ice && rnd() < 0.55) ? 'I' : '#'; };
  const solidCol = (x, top) => { for (let y = top; y < H; y++) grid[y][x] = '#'; };
  const maxGap = li === 0 ? 3 : 5;
  const hz = B.hazard === 'lava' ? '~' : '^';
  let x = 0, gy = 10;
  const diff = () => Math.min(1, 0.08 + lv * 0.12 + (x / B.len) * 0.3);
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
    if (li >= 3 && r < 0.05 + 0.025 * lv + 0.035 * HARDK(li)) return 'elite';
    if (li >= 1 && r < 0.12 + 0.03 * lv + 0.07 * HARDK(li)) return 'big';
    if (r > 0.84) return 'small';
    return null;
  }
  const DENS = { 2: 0.7, 3: 1, 4: 0.64, 5: 0.9, 7: 0.86, 9: 0.96 }[li] || 1;   // evens out the monster count from map to map
  function addEnemy(tx, ground) {
    if (DENS < 1 && rnd() > DENS) return;
    const t = pick(), v = variant();
    if (FLY.has(t)) spawn(t, tx, ground - R(3, 5), { v }); else spawn(t, tx, ground, { v });
  }
  function coinsLine(tx, ty, n) { for (let i = 0; i < n; i++) spawn('coin', tx + i, ty); }

  function flat(n, o) {
    o = o || {};
    const d = diff();
    for (let i = 0; i < n; i++) col(x + i, gy);
    for (let i = 0; i < n; i++) if (rnd() < 0.32) L.decor.push({ x: (x + i) * TS + R(0, 8), y: gy * TS, k: R(0, B.decor.length - 1) });
    if (!o.safe && n >= 5) {
      const cnt = rnd() < 0.78 + d * 0.2 ? (li === 6 ? 1 : 0) + 1 + (d > 0.45 && rnd() < 0.6 ? 1 : 0) + (d > 0.8 && rnd() < 0.5 ? 1 : 0) + (n >= 9 && rnd() < 0.7 ? 1 : 0) + (li >= 2 && rnd() < 0.3 + 0.35 * HARDK(li) ? 1 : 0) + (rnd() < 0.4 * HARDK(li) ? 1 : 0) : 0;
      for (let c = 0; c < cnt; c++) addEnemy(x + R(2, n - 2), gy);
    }
    if (o.cp) { L.checkpoints.push({ x: (x + 2) * TS + 8, y: gy * TS, id: L.id++ }); }
    if (o.heart) spawn('heart', x + (n >> 1), gy - 2);
    if (rnd() < 0.6 && n >= 5) coinsLine(x + R(1, n - 4), gy - 2, R(3, 4));
    if (rnd() < 0.13 && n >= 5) spawn('pk', x + R(1, n - 2), gy, { what: pickWhat() });
    if (!o.safe && n >= 8 && B.traps && rnd() < 0.3 + d * 0.3 + (li === 6 ? 0.25 : 0)) placeTrap(B.traps[R(0, B.traps.length - 1)], x, n) || (HARD(li) && n >= 12 && rnd() < 0.35 * HARDK(li) && placeTrap(B.traps[R(0, B.traps.length - 1)], x + 6, n - 6));
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
  function pRescue() { // Lyra hangs in a cage high above; Mr Shorty Phong's giant beetle guards the way up
    const n = 40, x0 = pzFlat(n), grp = L.id++, k = Math.max(2, Math.min(4, Math.floor((gy - 2) / 2)));
    const lx = x0 + n - 28;
    for (let i = 1; i <= k; i++) { const w = i === k ? 6 : 4; for (let j = 0; j < w; j++) set(lx + (i - 1) * 4 + j, gy - 2 * i, '='); }
    spawn('cage', lx + (k - 1) * 4 + 3, gy - 2 * k, { grp });
    spawn('beetle', x0 + n - 12, gy, { grp, v: 'phong' });
    spawn('slime', x0 + 12, gy, { grp }); spawn('slime', x0 + 17, gy, { grp });
    spawn('heart', x0 + 6, gy - 2);
    coinsLine(x0 + 8, gy - 2, 4);
    for (let i = 0; i < k; i++) spawn('coin', lx + i * 4 + 1, gy - 2 * (i + 1) - 1);
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
  function pMini(who) { // Shorty / Sy duel: sealed arena, resolved in game.js
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
  // the swamp's Tarzan crossing: a wide pit with a long vine hanging over its middle, a perch beside the take-off ledge
  function vineGap() {
    gy = Math.max(gy, 9); flat(4, { safe: true });
    const nn = R(6, 8), mid = x + nn / 2, top = Math.max(1, gy - 9);
    L.vines.push({ x: mid * TS, y: (top + 1) * TS, len: (gy - top - 1.6) * TS, i: L.vines.length });   // the tip hangs just above the ground line so a jump from the ledge reaches it
    for (let i = 0; i < nn; i++) set(x + i, H - 1, '^');
    for (let i = 1; i < nn - 1; i++) if (i % 2 === 0) spawn('coin', x + i, gy - 3 - Math.round(Math.sin(i / (nn - 1) * Math.PI) * 2));
    x += nn; flat(R(5, 7), { safe: true });
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
    L.plats.push({ x: (x - 1) * TS, y: gy * TS, w: 48, h: 8, x0: (x - 1) * TS, x1: (x + n - 2) * TS, y0: gy * TS, y1: gy * TS, sp: 28 + lv * 3, t: 0, dx: 0, dy: 0 });
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
  // multi-level section: a stair ramp climbs onto a long deck, higher decks above it hold rewards, a ramp leads back down.
  // The ground under the deck stays open (drop through the deck with Down), so the way forward never closes.
  function tiers() {
    if (gy < 8) gy = 8;
    const n = R(18, 24), x0 = x, g0 = gy, y1 = g0 - 3, y2 = g0 - 5, y3 = Math.max(2, g0 - 7), s0 = L.spawns.length;
    flat(n, {});
    for (let k = 1; k <= 3; k++) for (let y = g0 - k; y < g0; y++) { set(x0 + k, y, '#'); set(x0 + n - 1 - k, y, '#'); }   // the ramps up and down
    for (let i = s0; i < L.spawns.length; i++) {   // anything placed where a ramp step now stands goes on top of the step
      const sp = L.spawns[i], tx = Math.floor(sp.x / TS), k = tx - x0 >= 1 && tx - x0 <= 3 ? tx - x0 : (x0 + n - 1 - tx >= 1 && x0 + n - 1 - tx <= 3 ? x0 + n - 1 - tx : 0);
      if (k && sp.y >= (g0 - k) * TS) sp.y -= k * TS;
    }
    for (let i = x0 + 4; i <= x0 + n - 5; i++) set(i, y1, '=');                                                      // deck 1
    const a = x0 + 6, b = x0 + n - 10; for (let i = 0; i < 4; i++) { set(a + i, y2, '='); set(b + i, y2, '='); }   // deck 2, left and right
    const m = x0 + (n >> 1) - 1; for (let i = 0; i < 3; i++) set(m + i, y3, '=');                                    // the top deck
    coinsLine(x0 + 5, y1 - 2, 4); coinsLine(a, y2 - 2, 3); coinsLine(m, y3 - 2, 3);
    if (rnd() < 0.35) spawn('pk', m + 1, y3, { what: pickWhat() }); else if (rnd() < 0.3) spawn('heart', m + 1, y3 - 1);
    if (rnd() < 0.6) addEnemy(x0 + R(6, n - 7), y1);
  }
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
  const pzAt = pzList.map((t, i) => (t === 'dragon' && li === 0) ? 70 : Math.floor(B.len * (0.14 + 0.7 * (i + 0.5) / pzList.length)));
  let nextCp = 42, placed = 0, tierN = 0, vineN = 0;
  const shardAt = [0.2, 0.5, 0.76].map(f => Math.floor(B.len * f));
  while (x < B.len - 16) {
    if (x > nextCp) { const ax = x; flat(6, { safe: true, cp: true, heart: rnd() < 0.5 }); if (plan.cps && cpNpcIdx < plan.cps.length) { spawn('npc', ax + 4, gy, { who: plan.cps[cpNpcIdx++] }); } nextCp = x + R(38, 52); continue; }
    if (li === 7 && vineN < 5 && x > B.len * (0.08 + 0.15 * vineN)) { vineGap(); vineN++; continue; }   // at least five vine crossings in the swamp
    if (placed < 3 && x > shardAt[placed]) { secret(placed); placed++; continue; }
    if (pzIdx < pzList.length && x > pzAt[pzIdx]) { runPuzzle(pzList[pzIdx++]); continue; }
    if (tierN < 3 && x > B.len * (0.18 + 0.24 * tierN)) { tiers(); tierN++; continue; }   // at least three multi-level sections per map
    const r = rnd(), d = diff();
    if (r < 0.07) flat(R(6, 12));
    else if (r < 0.18) { tiers(); tierN++; }
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
  while (tierN < 3 && x < B.len) { tiers(); tierN++; }   // a map crowded with puzzles still gets its multi-level sections
  { const ax = x; flat(plan.pre ? 16 : 8, { safe: true, cp: true, heart: true }); (plan.pre || []).forEach((w, i) => spawn('npc', ax + 3 + i * 2, gy, { who: w })); }
  if (li === 7) {   // THE GIANT FOREST: a long dark stretch of huge glowing mushrooms and trees, full of monsters, ending at Morvella's glade
    gy = 10; flat(6, { safe: true, cp: true, heart: true }); const f0 = x;
    for (let i = 0; i < 7; i++) {
      const n = R(13, 17), x0 = x;
      flat(n, { heart: i % 3 === 2, cp: i === 3 });
      for (let c = 0; c < 2 + (i >> 1); c++) addEnemy(x0 + R(2, n - 2), gy);
      ledges(x0, i % 2 ? [[2, 3, 4], [8, 5, 4], [12, 3, 3]] : [[4, 3, 4], [9, 6, 4]]);
      coinsLine(x0 + 4, gy - 5, 4);
      if (i % 2 === 1) spawn('pk', x0 + R(3, n - 3), gy, { what: pickWhat() });
      if (i === 5) { L.checkpoints.push({ x: (x0 + 6) * TS, y: gy * TS, id: L.id++ }); }
    }
    L.forest = { x0: f0, x1: x }; L.dark.push({ x0: f0, x1: x, a: 0.6 });
    for (let tx = f0; tx < x; tx += R(3, 5)) { let gr = 10; for (let y = 3; y < H - 2; y++) if (grid[y][tx] === '#') { gr = y; break; } if (grid[gr - 1][tx] === ' ') L.creep.push({ x: tx * TS + R(2, 12), y: gr * TS, k: R(0, 3) }); }
    flat(8, { safe: true, cp: true, heart: true });
  }
  gy = 10; flat(4, { safe: true }); // return to arena height (visual step handled by stairs guard)
  // make sure arena ground is continuous: previous ground may differ -> already flat() uses gy.
  // ---- dark zones: every map has pitch-black stretches full of creepy things ----
  { const zn = li >= 2 ? Math.max(3, Math.round(B.len / 180)) : 2, groundRow = tx => { for (let y = 3; y < H - 2; y++) if (grid[y][tx] === '#' || grid[y][tx] === 'I') return y; return 10; };
    for (let i = 0; i < zn; i++) {
      const cx = Math.floor(B.len * (0.2 + 0.58 * (i + 0.5) / zn)), z = { x0: cx - 20, x1: cx + 20, a: Math.max(0.82, B.dark + 0.2) };
      L.dark.push(z);
      for (let tx = z.x0; tx < z.x1; tx += R(3, 6)) { const gr = groundRow(tx); if (grid[gr - 1][tx] === ' ') L.creep.push({ x: tx * TS + R(2, 12), y: gr * TS, k: R(0, 3) }); }
    } }
  // the Sunken Deep and the Deepdig Tunnels end in a huge cavern far below: the world gets deeper and you drop into it
  if (B.deep) { for (let k = 0; k < B.deep; k++) grid.push(grid[H - 1].map(c => (c === ' ' ? ' ' : '#'))); H += B.deep; L.H = H; }
  const GY0 = (ag, up) => ag - up;
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
    if (B.lake) {   // the cavern is a huge flooded lake: you fall in and have to swim and fight
      L.waterY = 14; L.wet = true;
      [[6, 14], [28, 12], [50, 14]].forEach(p => { for (let xx = p[0]; xx < p[0] + p[1]; xx++) set(ax0 + xx, 15, '='); });
      for (let k = 0; k < 4; k++) { const x0 = 8 + k * 16; for (let xx = x0; xx < x0 + 5; xx++) set(ax0 + xx, GY0(AG, 8 + k * 2), '='); }
    }
  } else {
    const PLATS = li === 6 ? [[7, 5, 9], [7, 17, 21], [7, 29, 33], [7, 40, 44], [5, 11, 15], [5, 23, 27], [5, 34, 38], [3, 19, 23], [3, 30, 33]]
      : li % 2 ? [[7, 5, 9], [7, 16, 20], [7, 27, 31], [7, 37, 40], [5, 10, 14], [5, 21, 25], [5, 32, 35], [3, 15, 18], [3, 26, 29]]
      : [[7, 6, 10], [7, 18, 22], [7, 30, 34], [5, 12, 16], [5, 24, 28], [5, 36, 39], [3, 8, 11], [3, 19, 23], [3, 31, 34]];
    PLATS.forEach(p => { for (let xx = p[1]; xx <= p[2]; xx++) set(ax0 + xx, p[0], '='); });
    L.checkpoints.push({ x: (ax0 - 4) * TS, y: 10 * TS, id: L.id++ });
  }
  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 10) * TS, y: AG * TS });
  L.endX = (ax0 + AW) * TS;
  // ground step safety: if the pre-arena ground is not at row 10 build ramp
  { const rn = mulberry32(777 + li * 131), endX = (L.arena ? L.arena.x0 : W) - 8, nooks = [];
    const SOL = c => c === '#' || c === 'I', topOf = x => { for (let y = 3; y < H - 1; y++) if (SOL(L.grid[y][x])) return L.grid[y - 1][x] === ' ' ? y : -1; return -1; };
    const busy = x => L.spawns.some(sp => Math.abs(sp.x / TS - x) < 4) || L.checkpoints.some(cp => Math.abs(cp.x / TS - x) < 5);
    for (let part = 0; part < 3; part++) {
      const a = Math.floor(20 + (endX - 20) * part / 3), b = Math.floor(20 + (endX - 20) * (part + 1) / 3);
      for (let tries = 0; tries < 40; tries++) {
        const x0 = a + Math.floor(rn() * Math.max(1, b - a - 6)), y = topOf(x0); if (y < 0 || y + 3 > H - 1) continue;
        let ok = true; for (let i = 0; i < 5 && ok; i++) { if (topOf(x0 + i) !== y) ok = false; for (let k = 0; k < 4 && ok; k++) if (!SOL(L.grid[y + k][x0 + i])) ok = false; }
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
    for (let x = 12; x < (L.arena ? L.arena.x0 - 4 : W - 10); x++) for (let y = 2; y <= 7; y++) if (L.grid[y][x] === '=' && L.grid[y - 1][x] === ' ' && L.grid[y - 2] && L.grid[y - 2][x] === ' ') cand.push([x, y]);
    const rr2 = mulberry32(5150 + li * 97), picks = [];
    for (let k = 0; k < 4; k++) {
      const seg = (L.arena ? L.arena.x0 : W) / 4, inSeg = cand.filter(c => c[0] >= seg * k && c[0] < seg * (k + 1));
      const c = inSeg.length ? inSeg[Math.floor(rr2() * inSeg.length)] : [Math.floor(seg * k + seg * 0.6), 9];
      picks.push(c); L.spawns.push({ id: L.id++, type: 'rare', k, x: c[0] * TS + TS / 2, y: (c[1] - 1) * TS + 4 });
    } }
  // nothing that walks or is picked up may start inside a solid tile: lift it onto the first free tile above
  { const lift = new Set(['coin', 'pk', 'heart'].concat(B.enemies.map(e => e.t).filter(t => !FLY.has(t) && t !== 'cavespider')));
    for (const sp of L.spawns) {
      if (!lift.has(sp.type)) continue; const tx = Math.floor(sp.x / TS); let ty = Math.floor((sp.y - 1) / TS), n = 0;
      while (ty > 1 && n < 5 && (grid[ty][tx] === '#' || grid[ty][tx] === 'I')) { ty--; n++; }
      if (n) sp.y = (ty + 1) * TS;
    } }
  return L;
}
