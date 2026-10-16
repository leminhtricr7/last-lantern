'use strict';
// ============ PIXEL ART (all generated in code: sprites, tiles, backgrounds) ============
const VW = 384, VH = 216, TS = 16;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const PAL = {
  k: '#1b1626', w: '#f6f3e9', r: '#e0453a', R: '#8e2335', o: '#f08a2b', y: '#ffd34e', Y: '#c89a1c',
  g: '#5fcf5a', G: '#2b8a3e', t: '#a4e86b', b: '#4a8bf0', B: '#2a4a9c', c: '#6ee7f2', C: '#2c9ab8',
  p: '#a15be0', P: '#5a2d8f', n: '#9a6a3b', N: '#5a3a22', s: '#f2c394', S: '#d99a6a', l: '#b8bfd0',
  d: '#6a7090', D: '#2d3045', e: '#e8dfc0', E: '#b9a77a', m: '#ff7fb0', h: '#8e6bff'
};

// ---- sprite sources (fill only, outline is added automatically) ----
const heroBody = [
  '...BBBBBB...',
  '..BBBBBBBB..',
  '..BBssssBB..',
  '..BBsskskB..',
  '..BBssssBB..',
  '...rrrrrr...',
  '..bbbbbbbb..',
  '.bbbbbbbbbb.',
  '.bbbbbbbbbb.',
  '.bbbnnnnbbb.',
  '.bbbbbbbbbb.',
  '..bbbbbbbb..'
];
const heroLegs = {
  idle: ['..bbb..bbb..', '..nn....nn..', '..NN....NN..', '............'],
  run1: ['...bb..bbb..', '.nn......nn.', 'NN........NN', '............'],
  run2: ['...bbbbbb...', '...nn..nn...', '...NN..NN...', '............'],
  jump: ['..bbbbbbbb..', '..nnnnnnnn..', '............', '............']
};

const ART = {
  hero_idle: [heroBody.concat(heroLegs.idle)],
  hero_run: [heroBody.concat(heroLegs.run1), heroBody.concat(heroLegs.run2)],
  hero_jump: [heroBody.concat(heroLegs.jump)],
  slime: [[
    '....tttttt....',
    '..ttgggggggg..',
    '.tggggggggggg.',
    'gggwkgggwkgggg',
    'gggggggggggggg',
    'gggGgggggggGgg',
    '.GGGGGGGGGGGG.'
  ]],
  bat: [[
    'p..............p',
    'pp....p..p....pp',
    'ppp..pppppp..ppp',
    'pPppppwppwpppPpp',
    '.pPppppppppppPp.',
    '..pp..pppp..pp..',
    '......p..p......'
  ], [
    '................',
    '......p..p......',
    '....pppppppp....',
    '..ppppwppwpppp..',
    '.pPpppppppppppp.',
    'pPp..pppppp..pPp',
    'pp....pppp....pp',
    'p..............p'
  ]],
  spider: [[
    'D.D........D.D',
    '.D..DDDDDD..D.',
    '..DDPPPPPPDD..',
    'D.DPrPPPPrPD.D',
    '.DDPPPPPPPPDD.',
    'D..DPPPPPPD..D',
    '...D.DDDD.D...'
  ]],
  skeleton: [[
    '....eeee....',
    '...eeeeee...',
    '..eekkeeke..',
    '..eeeeeeee..',
    '...eekkee...',
    '....eeee....',
    '...eeeeee...',
    '..eEeeeeEe..',
    '..eEeeeeEe..',
    '..eeeEEeee..',
    '...eeeeee...',
    '....eeee....',
    '...ee..ee...',
    '...ee..ee...',
    '..eee..eee..',
    '..eee..eee..'
  ]],
  scorpion: [[
    'oo..............',
    '.oo.........oo..',
    '..oo......oooooo',
    '..ooooooooooo.oo',
    '.ooRoooRooooowko',
    '..oooooooooooooo',
    '..o.o.o.o.o.o...',
    '.o..o.o.o.o..o..'
  ]],
  snowman: [[
    '...DDDDDD...',
    '....DDDD....',
    '...wwwwww...',
    '..wwkwwkww..',
    '..wwwwoowww.',
    '...wwwwww...',
    '..wwwwwwww..',
    '.wwwlwwwwww.',
    '.wwwwwwwlww.',
    '.wwwwwwwwww.',
    '..wwwwwwww..',
    '...wwwwww...'
  ]],
  fire: [[
    '.....r......',
    '....rro.....',
    '...rroor....',
    '..rrooyor...',
    '..rooyyoor..',
    '.rooyyyyoor.',
    '.rooywkywor.',
    '.rooyyyyoor.',
    '..rooyyoor..',
    '...rroorr...',
    '....rrrr....'
  ]],
  ghost: [[
    '...wwwwww...',
    '..wwwwwwww..',
    '.wwwwwwwwww.',
    '.wwkkwwkkww.',
    '.wwkkwwkkww.',
    '.wwwwwwwwww.',
    '.wwwwwoowww.',
    '.wwwwwwwwww.',
    '.wwwwwwwwww.',
    '.ww.www.www.',
    '.w...w...w..'
  ]],
  golem: [[
    '....c......c....',
    '...cc.dddd.cc...',
    '....dddddddd....',
    '...ddyyddyydd...',
    '...dddddddddd...',
    '..dd.dddddd.dd..',
    '.dddddddddddddd.',
    'dddd.dccccd.dddd',
    'dddd.dccccd.dddd',
    'dddd.dddddd.dddd',
    '.ddd..dddddd.ddd',
    '....dddddddd....',
    '....dddddddd....',
    '...ddd....ddd...',
    '..dddd....dddd..',
    '..dddd....dddd..'
  ]],
  knight: [[
    '...DDDDDD...',
    '..DDPPPPDD..',
    '..DPmPPmPD..',
    '..DDPPPPDD..',
    '...DDDDDD...',
    '..PPDDDDPP..',
    '.PPDDPPDDPP.',
    '.PDDDPPDDDP.',
    '.PDDDDDDDDP.',
    '..DDDDDDDD..',
    '...DDDDDD...',
    '...DD..DD...',
    '...DD..DD...',
    '..DDD..DDD..',
    '..DDD..DDD..'
  ]],
  shard: [[
    '..y..',
    '.yYy.',
    'yYwYy',
    'yYwYy',
    '.yYy.',
    '..y..'
  ]],
  heart: [[
    '.rr.rr.',
    'rrrrrrr',
    'rrrrrrr',
    '.rrrrr.',
    '..rrr..',
    '...r...'
  ]]
};

// decor (no outline)
const DECOR = {
  tuft: ['..t..t.', '.gg.gg.', 'gGggGgg'],
  flower: ['.m.', 'mym', '.m.', '.G.', '.G.'],
  bush: ['..GGG..', '.GgggG.', 'GggtggG', 'GGGGGGG'],
  rock: ['.dd.', 'dlddd', 'DDDDDD'],
  crystal: ['...c..', '..cc.c', '.ccCcC', 'ccCCcC', 'cCCCCC'],
  mushroom: ['..rrr..', '.rwrrr.', 'rrrwrrr', '...e...', '...e...'],
  cactus: ['..g..', 'g.g.g', 'g.ggg', 'ggg..', '..g..', '..g..'],
  bones: ['e..e.', 'eeEee'],
  snow: ['.wwww.', 'wlwwww', 'llllll'],
  torch: ['..c..', '.cwc.', '..n..', '..n..', '..n..', '..n..']
};

const _cache = {};
function getSprite(name, swap, frame, outlineColor) {
  swap = swap || {}; frame = frame || 0;
  const key = name + '|' + JSON.stringify(swap) + '|' + frame + '|' + (outlineColor || '');
  if (_cache[key]) return _cache[key];
  const frames = ART[name] || [DECOR[name]];
  const rows = frames[frame % frames.length];
  const s = makeSprite(rows, swap, outlineColor || (ART[name] ? PAL.k : null));
  _cache[key] = s;
  return s;
}

function makeSprite(rows, swap, outline) {
  const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
  const W = w + 2, H = h + 2;
  const cells = [];
  for (let y = 0; y < H; y++) { cells.push(new Array(W).fill(null)); }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch && ch !== '.' && ch !== ' ') cells[y + 1][x + 1] = PAL[swap[ch] || ch] || '#f0f';
  }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const c = mk(), x = c.getContext('2d');
  if (outline) {
    x.fillStyle = outline;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (cells[j][i]) continue;
      let near = false;
      for (let dj = -1; dj <= 1 && !near; dj++) for (let di = -1; di <= 1; di++) {
        const jj = j + dj, ii = i + di;
        if (jj >= 0 && jj < H && ii >= 0 && ii < W && cells[jj][ii]) { near = true; break; }
      }
      if (near) x.fillRect(i, j, 1, 1);
    }
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (cells[j][i]) { x.fillStyle = cells[j][i]; x.fillRect(i, j, 1, 1); }
  const f = mk(), fx = f.getContext('2d'); fx.translate(W, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
  const mkWhite = src => { const q = mk(), qx = q.getContext('2d'); qx.drawImage(src, 0, 0); qx.globalCompositeOperation = 'source-atop'; qx.fillStyle = '#fff'; qx.fillRect(0, 0, W, H); return q; };
  return { c, f, cw: mkWhite(c), fw: mkWhite(f), w: W, h: H };
}

// draw sprite: x = centre, y = bottom (feet)
function drawSpr(g, spr, x, y, flip, flash, sx, sy, alpha) {
  sx = sx || 1; sy = sy || sx;
  const img = flash ? (flip ? spr.fw : spr.cw) : (flip ? spr.f : spr.c);
  if (alpha !== undefined && alpha < 1) g.globalAlpha = alpha;
  g.drawImage(img, Math.round(x - spr.w * sx / 2), Math.round(y - spr.h * sy + sx), Math.round(spr.w * sx), Math.round(spr.h * sy));
  if (alpha !== undefined && alpha < 1) g.globalAlpha = 1;
}

// ---------------- colour helpers ----------------
function hex2rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function lerpColor(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')';
}

// ---------------- tileset per biome ----------------
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

function buildTileset(B) {
  const r = mulberry32((B.seed || 5) * 13);
  const G = B.ground;
  const T = {};
  function body(variant, base, dark, light) {
    const [c, x] = mkCanvas(16, 16);
    x.fillStyle = base; x.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 16; i++) { x.fillStyle = r() < 0.6 ? dark : light; x.fillRect((r() * 15) | 0, (r() * 15) | 0, r() < 0.3 ? 2 : 1, 1); }
    if (variant) {
      x.fillStyle = dark; x.fillRect(2, 3, 5, 3); x.fillRect(9, 9, 5, 4);
      x.fillStyle = light; x.fillRect(2, 3, 5, 1); x.fillRect(9, 9, 5, 1);
    }
    return c;
  }
  function top(variant, base, dark, light, topC, topD, topL) {
    const c = body(variant, base, dark, light), x = c.getContext('2d');
    for (let i = 0; i < 16; i++) {
      const d = 3 + (r() < 0.35 ? 1 : 0) + (r() < 0.15 ? 1 : 0);
      x.fillStyle = topC; x.fillRect(i, 0, 1, d);
      x.fillStyle = topD; x.fillRect(i, d - 1, 1, 1);
      if (r() < 0.6) { x.fillStyle = topL; x.fillRect(i, 0, 1, 1); }
    }
    return c;
  }
  T.body = [body(0, G.body, G.dark, G.light), body(1, G.body, G.dark, G.light)];
  T.top = [top(0, G.body, G.dark, G.light, G.top, G.topDark, G.topLight), top(1, G.body, G.dark, G.light, G.top, G.topDark, G.topLight)];
  // ice
  T.iceBody = [body(0, '#8fd8ee', '#4fb0d0', '#d8f8ff'), body(1, '#8fd8ee', '#4fb0d0', '#d8f8ff')];
  T.iceTop = [top(0, '#8fd8ee', '#4fb0d0', '#d8f8ff', '#e8fbff', '#9fe0f0', '#ffffff'), top(1, '#8fd8ee', '#4fb0d0', '#d8f8ff', '#e8fbff', '#9fe0f0', '#ffffff')];
  // one-way platform
  { const [c, x] = mkCanvas(16, 8);
    x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 4);
    x.fillStyle = B.plat[1]; x.fillRect(0, 4, 16, 3); x.fillRect(0, 0, 16, 1); x.fillRect(7, 0, 1, 4); x.fillRect(15, 0, 1, 4);
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(1, 1, 5, 1); x.fillRect(9, 1, 5, 1);
    T.plat = c; }
  // spikes
  { const [c, x] = mkCanvas(16, 16);
    for (let k = 0; k < 3; k++) for (let y = 0; y < 9; y++) {
      const half = Math.max(0.5, y / 9 * 2.6), cx = k * 5.3 + 2.8;
      x.fillStyle = B.spike[0]; x.fillRect(Math.round(cx - half), 7 + y, Math.round(half * 2), 1);
      x.fillStyle = B.spike[1]; x.fillRect(Math.round(cx + half) - 1, 7 + y, 1, 1);
    }
    T.spike = c; }
  // crumble block
  { const [c, x] = mkCanvas(16, 16);
    x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 16);
    x.fillStyle = B.plat[1]; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    x.fillRect(4, 3, 1, 4); x.fillRect(5, 6, 2, 1); x.fillRect(9, 8, 1, 5); x.fillRect(10, 10, 2, 1); x.fillRect(12, 3, 1, 3);
    T.crumble = c; }
  // lava frames
  T.lava = [[], []];
  for (let f = 0; f < 4; f++) for (let kind = 0; kind < 2; kind++) {
    const [c, x] = mkCanvas(16, 16);
    x.fillStyle = '#e8501a'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c23a14';
    for (let i = 0; i < 6; i++) x.fillRect(((i * 7 + f * 3) % 15), (i * 5 + 3) % 15, 3, 1);
    x.fillStyle = '#ff9a2a';
    for (let i = 0; i < 5; i++) x.fillRect(((i * 5 + f * 4) % 14), (i * 7 + 5) % 15, 2, 1);
    if (kind === 0) {
      for (let i = 0; i < 16; i++) {
        const h = 3 + Math.round(Math.sin((i + f * 4) / 16 * Math.PI * 2) * 1.3);
        x.fillStyle = '#ffd34e'; x.fillRect(i, 0, 1, h);
        x.fillStyle = '#ff9a2a'; x.fillRect(i, h, 1, 1);
      }
    }
    T.lava[kind].push(c);
  }
  // decor sprites
  T.decor = B.decor.map(d => getSprite(d[0], d[1] || {}, 0, null));
  return T;
}

// ---------------- parallax backgrounds ----------------
function buildBackground(B) {
  const r = mulberry32((B.seed || 5) * 31);
  const bg = { layers: [] };
  // sky
  { const [c, x] = mkCanvas(VW, VH);
    const bands = 18, stops = B.sky;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1) * (stops.length - 1), a = Math.min(stops.length - 2, Math.floor(t));
      x.fillStyle = lerpColor(stops[a], stops[a + 1], t - a);
      x.fillRect(0, Math.floor(i * VH / bands), VW, Math.ceil(VH / bands) + 1);
    }
    if (B.stars) for (let i = 0; i < 70; i++) { x.fillStyle = r() < 0.2 ? '#fff' : '#9a8ad0'; x.fillRect((r() * VW) | 0, (r() * VH * 0.6) | 0, 1, 1); }
    bg.sky = c; }

  const W = 512;
  function ridge(x, base, amp, color, seed, hh) {
    const rr = mulberry32(seed), ks = [1, 2, 3, 5, 8], ph = ks.map(() => rr() * 6.283), ys = [];
    for (let px = 0; px < W; px++) {
      let y = base;
      for (let i = 0; i < ks.length; i++) y += Math.sin(2 * Math.PI * ks[i] * px / W + ph[i]) * amp / (1 + i * 0.9);
      y = Math.round(y); ys.push(y);
      x.fillStyle = color; x.fillRect(px, y, 1, hh - y);
    }
    return ys;
  }
  const wrap = fn => { for (const o of [-W, 0, W]) fn(o); };
  const disc = (x, cx, cy, rad, col) => { x.fillStyle = col; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(rad * rad - j * j)); x.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };
  const tri = (x, cx, by, w, h, col) => { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round(i / h * w / 2); x.fillRect(cx - half, by - h + i, half * 2 + 1, 1); } };
  const triDown = (x, cx, ty, w, h, col) => { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round((1 - i / h) * w / 2); x.fillRect(cx - half, ty + i, half * 2 + 1, 1); } };

  // far layer
  { const [c, x] = mkCanvas(W, 170);
    const ys = ridge(x, 62, 26, B.far, (B.seed || 5) * 3, 170);
    if (B.style === 'ice') { for (let i = 0; i < 9; i++) { const cx = (r() * W) | 0; wrap(o => { tri(x, cx + o, ys[cx] + 20, 46, 70, B.far); tri(x, cx + o, ys[cx] - 30, 18, 24, '#e8f4ff'); }); } }
    if (B.style === 'volcano') { const cx = 150; wrap(o => { tri(x, cx + o, 110, 150, 90, B.far); disc(x, cx + o, 22, 0, B.far); x.fillStyle = '#f06a20'; x.fillRect(cx + o - 8, 22, 17, 3); }); }
    bg.layers.push({ c, f: 0.12, y: 56, anchor: 'bottom' }); }
  // mid layer
  { const [c, x] = mkCanvas(W, 170);
    if (B.style === 'cave') {
      const ys = ridge(x, 128, 12, B.mid, 77, 170);
      for (let i = 0; i < 16; i++) { const cx = (r() * W) | 0, w = 10 + r() * 16, h = 14 + r() * 40; wrap(o => tri(x, cx + o, ys[cx] + 2, w, h * 0.7, B.mid)); }
      bg.layers.push({ c, f: 0.3, y: 50, anchor: 'bottom' });
      // hanging stalactites (top anchored)
      const [c2, x2] = mkCanvas(W, 90);
      for (let i = 0; i < 20; i++) { const cx = (r() * W) | 0, w = 8 + r() * 16, h = 18 + r() * 52; wrap(o => { triDown(x2, cx + o, 0, w, h, '#0c0a1e'); }); }
      x2.fillStyle = '#0c0a1e'; x2.fillRect(0, 0, W, 8);
      for (let i = 0; i < 14; i++) { const cx = (r() * W) | 0, cy = 20 + (r() * 60) | 0; x2.fillStyle = r() < 0.5 ? '#6ee7f2' : '#d58bff'; x2.fillRect(cx, cy, 1, 2); x2.fillStyle = 'rgba(110,231,242,.25)'; x2.fillRect(cx - 1, cy - 1, 3, 4); }
      bg.layers.push({ c: c2, f: 0.45, y: 0, anchor: 'top' });
    } else {
      const ys = ridge(x, 88, 16, B.mid, (B.seed || 5) * 5, 170);
      if (B.style === 'hills') {
        for (let i = 0; i < 16; i++) { const cx = (r() * W) | 0, rad = 5 + ((r() * 5) | 0); wrap(o => { x.fillStyle = '#4a3020'; x.fillRect(cx + o - 1, ys[cx] - 6, 2, 8); disc(x, cx + o, ys[cx] - 8, rad, B.tree[r() < 0.5 ? 0 : 1]); }); }
        // windmill
        const mx = 320; wrap(o => { x.fillStyle = '#3a2a44'; x.fillRect(mx + o - 4, ys[mx] - 28, 8, 30); tri(x, mx + o, ys[mx] - 26, 12, 8, '#2a1f35'); x.fillStyle = '#cdbfa0'; x.fillRect(mx + o - 12, ys[mx] - 20, 24, 2); x.fillRect(mx + o - 1, ys[mx] - 32, 2, 24); });
      } else if (B.style === 'pines') {
        for (let i = 0; i < 26; i++) { const cx = (r() * W) | 0, h = 22 + ((r() * 16) | 0); wrap(o => { tri(x, cx + o, ys[cx] + 2, 16, h, B.tree[0]); tri(x, cx + o, ys[cx] - h * 0.35, 12, h * 0.6, B.tree[1]); }); }
      } else if (B.style === 'dunes') {
        for (let i = 0; i < 3; i++) { const cx = 60 + i * 170, h = 40 + i * 10; wrap(o => { tri(x, cx + o, ys[cx] + 4, h * 1.7, h, '#d98a56'); x.fillStyle = '#b86a44'; for (let j = 0; j < h; j++) { const half = Math.round(j / h * h * 0.85); x.fillRect(cx + o, ys[cx] + 4 - h + j, half + 1, 1); } }); }
        for (let i = 0; i < 5; i++) { const cx = (r() * W) | 0; wrap(o => { x.fillStyle = '#5a3a28'; x.fillRect(cx + o, ys[cx] - 16, 2, 18); disc(x, cx + o + 1, ys[cx] - 17, 4, '#2d7a3a'); }); }
      } else if (B.style === 'ice') {
        for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, h = 26 + ((r() * 30) | 0); wrap(o => { tri(x, cx + o, ys[cx] + 4, 30, h, B.mid); tri(x, cx + o, ys[cx] + 4 - h * 0.55, 14, h * 0.45, '#f4fbff'); }); }
      } else if (B.style === 'volcano') {
        for (let i = 0; i < 4; i++) { const cx = 40 + i * 130, h = 54 + (i % 2) * 20; wrap(o => { tri(x, cx + o, ys[cx] + 6, h * 1.6, h, '#2a0d0a'); x.fillStyle = '#ff6a20'; x.fillRect(cx + o - 5, ys[cx] + 6 - h, 11, 2); x.fillStyle = '#ffd34e'; x.fillRect(cx + o - 2, ys[cx] + 6 - h, 5, 1); x.fillStyle = 'rgba(80,60,60,.6)'; disc(x, cx + o + 3, ys[cx] - h - 6, 5, 'rgba(70,50,50,.7)'); disc(x, cx + o + 8, ys[cx] - h - 14, 7, 'rgba(60,45,45,.5)'); }); }
      } else if (B.style === 'citadel') {
        for (let i = 0; i < 11; i++) { const cx = 10 + i * 46 + ((r() * 16) | 0), w = 18 + ((r() * 14) | 0), h = 40 + ((r() * 50) | 0); wrap(o => {
          x.fillStyle = '#0a0618'; x.fillRect(cx + o - w / 2, ys[cx] - h, w, h + 8);
          for (let k = 0; k < w; k += 6) x.fillRect(cx + o - w / 2 + k, ys[cx] - h - 4, 4, 4);
          if (r() < 0.6) tri(x, cx + o, ys[cx] - h - 4, w - 4, 20, '#0a0618');
          x.fillStyle = r() < 0.5 ? '#c9a0ff' : '#7a4cff';
          for (let k = 0; k < 4; k++) if (r() < 0.6) x.fillRect(cx + o - 2 + ((r() * 6) | 0) - 3, ys[cx] - h + 6 + k * 9, 2, 3);
        }); }
      }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
    }
  }
  return bg;
}
