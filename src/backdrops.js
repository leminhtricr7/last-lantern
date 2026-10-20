'use strict';
// ============ MAP BACKDROPS ============
// Every map has its own painted sky plus parallax layers (distant, mid, near), drawn in a 16-bit pixel style with atmospheric
// perspective (far things fade into the sky colour). Every layer is 512 px wide and loops seamlessly.
const BD_W = 512;
const bdWrap = fn => { for (const o of [-BD_W, 0, BD_W]) fn(o); };
function bdBands(x, w, h, stops, y0) {   // a vertical gradient in hard 16-bit bands
  const bands = Math.max(8, Math.round(h / 6));
  for (let i = 0; i < bands; i++) { const t = i / (bands - 1) * (stops.length - 1), a = Math.min(stops.length - 2, Math.floor(t)); x.fillStyle = lerpColor(stops[a], stops[a + 1], t - a); x.fillRect(0, (y0 || 0) + Math.floor(i * h / bands), w, Math.ceil(h / bands) + 1); }
}
function bdRidge(seed, base, amp, ks) {   // a looping ridge line made of whole sine periods
  const r = mulberry32(seed), K = ks || [1, 2, 3, 5, 8], ph = K.map(() => r() * 6.283), ys = [];
  for (let px = 0; px < BD_W; px++) { let y = base; K.forEach((k, i) => { y += Math.sin(2 * Math.PI * k * px / BD_W + ph[i]) * amp / (1 + i * 0.9); }); ys.push(Math.round(y)); }
  return ys;
}
function bdFill(x, ys, h, col, rim, shade) {
  for (let px = 0; px < BD_W; px++) {
    x.fillStyle = shade && ys[(px + 1) % BD_W] > ys[px] ? shade : col; x.fillRect(px, ys[px], 1, h - ys[px]);
    if (rim) { x.fillStyle = rim; x.fillRect(px, ys[px], 1, 1); }
  }
}
function bdDisc(x, cx, cy, rad, col) { x.fillStyle = col; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(Math.max(0, rad * rad - j * j))); x.fillRect(Math.round(cx - hw), Math.round(cy + j), hw * 2 + 1, 1); } }
function bdEll(x, cx, cy, rx, ry, col) { x.fillStyle = col; for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry)))); x.fillRect(Math.round(cx - hw), Math.round(cy + j), hw * 2 + 1, 1); } }
function bdTri(x, cx, by, w, h, col) { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round(i / h * w / 2); x.fillRect(Math.round(cx - half), Math.round(by - h + i), half * 2 + 1, 1); } }
function bdTriDown(x, cx, ty, w, h, col) { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round((1 - i / h) * w / 2); x.fillRect(Math.round(cx - half), Math.round(ty + i), half * 2 + 1, 1); } }
function bdHaze(x, h, col, a0, a1) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, hexToRgba(col, a0)); g.addColorStop(1, hexToRgba(col, a1)); x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, BD_W, h); x.restore(); }
function hexToRgba(h, a) { const n = parseInt(h.substr(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
function bdGlow(x, cx, cy, r, col, a) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, hexToRgba(col, a)); g.addColorStop(1, hexToRgba(col, 0)); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
function bdCloud(x, cx, cy, s, col, shade) { for (const [dx, dy, rr] of [[0, 0, 8], [9, -3, 7], [-9, 1, 6], [17, 2, 5], [-16, 3, 4]]) bdDisc(x, cx + dx * s, cy + dy * s, Math.round(rr * s), col); x.fillStyle = shade; x.fillRect(Math.round(cx - 18 * s), Math.round(cy + 5 * s), Math.round(38 * s), Math.max(1, Math.round(2 * s))); }
function bdSky(stops, fn) { const [c, x] = mkCanvas(VW, VH); bdBands(x, VW, VH, stops); if (fn) fn(x, mulberry32(7)); return c; }
function bdLayer(h, f, y, fn, anchor) { const [c, x] = mkCanvas(BD_W, h); fn(x, h); return { c, f, y, anchor: anchor || 'bottom' }; }
function bdTree(x, cx, by, s, cols) {   // a round pixel tree: trunk, canopy, highlight
  x.fillStyle = cols[3] || '#5a3a20'; x.fillRect(Math.round(cx - s * 0.6), Math.round(by - s * 2.2), Math.max(2, Math.round(s * 1.2)), Math.round(s * 2.2));
  bdDisc(x, cx, by - s * 3, Math.round(s * 2.2), cols[0]); bdDisc(x, cx - s * 1.4, by - s * 2.4, Math.round(s * 1.5), cols[0]); bdDisc(x, cx + s * 1.5, by - s * 2.5, Math.round(s * 1.6), cols[0]);
  bdDisc(x, cx - s * 0.5, by - s * 3.6, Math.round(s * 1.2), cols[1]); bdDisc(x, cx - s * 0.9, by - s * 4, Math.round(s * 0.5), cols[2]);
}
function bdPine(x, cx, by, h, col, snow) { for (let k = 0; k < 3; k++) { bdTri(x, cx, by - k * h * 0.28, h * (0.7 - k * 0.15), h * 0.5, col); if (snow) bdTri(x, cx, by - k * h * 0.28 - h * 0.32, h * (0.32 - k * 0.07), h * 0.18, snow); } x.fillStyle = '#2a1a10'; x.fillRect(cx - 1, by, 2, 3); }

const BACKDROP = {
  // 1. Verdant Meadow: clear blue sky, distant rolling green hills, midground trees
  meadow: B => ({
    sky: bdSky(['#3a86dc', '#64aef0', '#a6daff', '#e6f7ff'], (x, r) => {
      bdGlow(x, 296, 52, 60, '#fff6c0', 0.35);   // the game draws the story's sun here (it brightens as you collect its shards)
      for (let i = 0; i < 7; i++) bdCloud(x, 20 + i * 56 + r() * 20, 22 + r() * 46, 0.8 + r() * 0.6, '#ffffff', '#cfe4f6');
    }),
    layers: [
      bdLayer(170, 0.06, 54, (x, h) => { const ys = bdRidge(101, 58, 12); bdFill(x, ys, h, '#9fd0c8', '#c8eae2'); const r = mulberry32(3); for (let i = 0; i < 40; i++) { const cx = (r() * BD_W) | 0; bdDisc(x, cx, ys[cx] - 2, 2, '#86bfb4'); } bdHaze(x, h, '#e6f7ff', 0.35, 0.05); }),
      bdLayer(170, 0.16, 36, (x, h) => {
        const ys = bdRidge(202, 80, 18); bdFill(x, ys, h, '#5fb562', '#94dc7a', '#53a457');
        for (let px = 0; px < BD_W; px += 2) for (let k = 1; k < 6; k++) { x.fillStyle = k % 2 ? '#56a858' : '#68c066'; x.fillRect(px, ys[px] + k * 9, 2, 2); }
        const r = mulberry32(5); for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => bdTree(x, cx + o, ys[cx] + 2, 2, ['#3a8a48', '#5aaa58', '#8ad870'])); }
        for (let px = 40; px < 200; px += 8) { x.fillStyle = '#8a6a44'; x.fillRect(px, ys[px] - 5, 1, 6); x.fillRect(px, ys[px] - 3, 8, 1); }
        bdHaze(x, h, '#e6f7ff', 0.18, 0);
      }),
      bdLayer(170, 0.36, -4, (x, h) => {
        const ys = bdRidge(303, 132, 6); bdFill(x, ys, h, '#3f8f45', '#7ccf62');
        const r = mulberry32(7); for (let i = 0; i < 9; i++) { const cx = 20 + i * 57 + ((r() * 20) | 0), s = 3 + r() * 2; bdWrap(o => bdTree(x, cx + o, ys[cx] + 3, s, ['#2c7a3a', '#47a04a', '#86d46a', '#5a3a20'])); }
        for (let i = 0; i < 26; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { bdDisc(x, cx + o, ys[cx] - 2, 4, '#2f8a3e'); bdDisc(x, cx + o - 2, ys[cx] - 4, 2, '#5ab45a'); }); }
        for (let i = 0; i < 60; i++) { const cx = (r() * BD_W) | 0; x.fillStyle = ['#ffffff', '#ffd34e', '#ff8fbf'][i % 3]; x.fillRect(cx, ys[cx] + 2 + ((r() * 8) | 0), 1, 1); }
      })
    ]
  }),
  // 2. Whispering Forest: misty sky, distant giant tree trunks, dense foliage, hanging vines
  forest: B => ({
    sky: bdSky(['#5a7c72', '#86a898', '#b8d0c0', '#dfeadc'], (x, r) => { for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, 70 + i * 22, VW, 6); } }),
    layers: [
      bdLayer(200, 0.08, 20, (x, h) => {
        const r = mulberry32(11); for (let i = 0; i < 9; i++) { const cx = (i * 57 + r() * 30) | 0, w = 18 + r() * 16; bdWrap(o => { x.fillStyle = '#86a696'; x.fillRect(cx + o - w / 2, 0, w, h); x.fillStyle = '#9ab8a8'; x.fillRect(cx + o - w / 2, 0, 3, h); for (let k = 0; k < 3; k++) { x.fillStyle = '#86a696'; x.fillRect(cx + o + w / 2, 40 + k * 40 + r() * 10, 20 + r() * 14, 4); } bdTri(x, cx + o, h, w * 2, 26, '#86a696'); }); }
        bdHaze(x, h, '#dfeadc', 0.45, 0.25);
      }),
      bdLayer(200, 0.2, 18, (x, h) => {
        const r = mulberry32(12); for (let i = 0; i < 7; i++) { const cx = (i * 73 + r() * 30) | 0, w = 22 + r() * 14; bdWrap(o => { x.fillStyle = '#3e5e4c'; x.fillRect(cx + o - w / 2, 0, w, h); x.fillStyle = '#2e4a3c'; for (let k = 0; k < h; k += 7) x.fillRect(cx + o - w / 2 + 3 + ((k * 7) % (w - 6)), k, 2, 5); x.fillStyle = '#56806a'; x.fillRect(cx + o - w / 2, 0, 2, h);
          for (let k = 0; k < 2; k++) { const by = 50 + k * 56 + r() * 12, side = k % 2 ? -1 : 1, len = 30 + r() * 20; x.fillStyle = '#3e5e4c'; x.fillRect(side > 0 ? cx + o + w / 2 : cx + o - w / 2 - len, by, len, 6); x.fillStyle = '#5aa06a'; x.fillRect(side > 0 ? cx + o + w / 2 : cx + o - w / 2 - len, by - 1, len, 2); for (let v = 0; v < len; v += 6) { const vl = 8 + ((v * 13) % 22); x.fillStyle = '#3a7a4a'; x.fillRect((side > 0 ? cx + o + w / 2 : cx + o - w / 2 - len) + v, by + 6, 1, vl); x.fillStyle = '#6ac87a'; x.fillRect((side > 0 ? cx + o + w / 2 : cx + o - w / 2 - len) + v, by + 6 + vl, 1, 1); } }
          bdTri(x, cx + o, h, w * 2.2, 22, '#3e5e4c'); }); }
        bdHaze(x, h, '#b8d0c0', 0.22, 0.1);
      }),
      bdLayer(150, 0.34, 0, (x, h) => {   // the canopy hanging from the top, with light shafts
        const r = mulberry32(13); for (let i = 0; i < 26; i++) { const cx = (r() * BD_W) | 0, cy = 4 + r() * 30, rad = 10 + ((r() * 14) | 0); bdWrap(o => { bdDisc(x, cx + o, cy, rad, '#1e5a36'); bdDisc(x, cx + o - 3, cy - 3, (rad * 0.6) | 0, '#2f7a46'); bdDisc(x, cx + o - 5, cy - 5, (rad * 0.25) | 0, '#5ab06a'); }); }
        for (let i = 0; i < 40; i++) { const cx = (r() * BD_W) | 0, len = 20 + ((r() * 60) | 0); x.fillStyle = '#2a6a3a'; x.fillRect(cx, 20, 1, len); x.fillStyle = '#5ab06a'; if (i % 3 === 0) x.fillRect(cx - 1, 20 + len, 3, 2); }
        for (let i = 0; i < 5; i++) { const cx = 40 + i * 100; x.fillStyle = 'rgba(255,250,200,.08)'; for (let k = 0; k < h; k++) x.fillRect(cx + k * 0.4, k, 16, 1); }
      }, 'top'),
      bdLayer(170, 0.44, -6, (x, h) => {
        const ys = bdRidge(404, 138, 5); bdFill(x, ys, h, '#163e28');
        const r = mulberry32(14); for (let i = 0; i < 30; i++) { const cx = (r() * BD_W) | 0, rad = 6 + ((r() * 9) | 0); bdWrap(o => { bdDisc(x, cx + o, ys[cx] - rad * 0.5, rad, '#1d4f32'); bdDisc(x, cx + o - 2, ys[cx] - rad * 0.8, (rad * 0.55) | 0, '#2c6e44'); }); }
        for (let i = 0; i < 24; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { for (let k = 0; k < 5; k++) { x.fillStyle = '#3e8a52'; x.fillRect(cx + o + (k - 2) * 2, ys[cx] - 6 - Math.abs(k - 2) * -1 - 4, 1, 6); } }); }
      })
    ]
  }),
  // 3. Crystal Caverns: dark cavern roof, distant glowing stalagmites, crystal formations, rocky ledges
  caves: B => ({
    sky: bdSky(['#04030c', '#0c0822', '#180f3a', '#22164a'], (x, r) => { for (let i = 0; i < 30; i++) { const cx = r() * VW, cy = 40 + r() * 120; bdGlow(x, cx, cy, 10, r() < 0.5 ? '#4ad8f0' : '#a06af0', 0.12); } }),
    layers: [
      bdLayer(100, 0.18, 0, (x, h) => {   // the roof
        x.fillStyle = '#0a0818'; x.fillRect(0, 0, BD_W, 12); const r = mulberry32(21);
        for (let i = 0; i < 26; i++) { const cx = (r() * BD_W) | 0, w = 8 + r() * 18, hh = 14 + r() * 60; bdWrap(o => { bdTriDown(x, cx + o, 8, w, hh, '#0a0818'); bdTriDown(x, cx + o - 1, 8, w * 0.3, hh * 0.8, '#1a1438'); x.fillStyle = r() < 0.5 ? '#6ee7f2' : '#c07bff'; x.fillRect(cx + o, 8 + hh - 3, 1, 2); }); }
      }, 'top'),
      bdLayer(170, 0.1, -10, (x, h) => {
        const ys = bdRidge(501, 120, 10); bdFill(x, ys, h, '#161236'); const r = mulberry32(22);
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, w = 10 + r() * 14, hh = 30 + r() * 70, c = r() < 0.5 ? '#4ad8f0' : '#a06af0'; bdWrap(o => { bdTri(x, cx + o, ys[cx] + 4, w, hh, '#1c1744'); bdGlow(x, cx + o, ys[cx] - hh + 6, 14, c, 0.5); x.fillStyle = c; x.fillRect(cx + o - 1, ys[cx] - hh + 2, 2, 6); }); }
        bdHaze(x, h, '#22164a', 0.3, 0.1);
      }),
      bdLayer(170, 0.26, -8, (x, h) => {
        const ys = bdRidge(502, 136, 8); bdFill(x, ys, h, '#1e1840', '#3a3070'); const r = mulberry32(23);
        const prism = (cx, by, w, hh, lean, C) => { x.save(); x.translate(cx, by); x.rotate(lean); x.fillStyle = C[2]; x.fillRect(-w / 2, -hh, w, hh); x.fillStyle = C[0]; x.fillRect(-w / 2, -hh, w / 2, hh); x.fillStyle = C[1]; x.fillRect(-w / 2 + 1, -hh + 2, 1, hh - 4); x.beginPath(); x.moveTo(-w / 2, -hh); x.lineTo(0, -hh - w * 0.8); x.lineTo(w / 2, -hh); x.closePath(); x.fillStyle = C[1]; x.fill(); x.restore(); };
        for (let i = 0; i < 14; i++) { const cx = (r() * BD_W) | 0, C = r() < 0.5 ? ['#4ad8f0', '#c8f8ff', '#1a7aa0'] : ['#a06af0', '#e6d0ff', '#5a2a9a']; bdWrap(o => { bdGlow(x, cx + o, ys[cx] - 20, 30, C[0], 0.28); for (let k = -2; k <= 2; k++) prism(cx + o + k * 6, ys[cx] + 3, 6 + (2 - Math.abs(k)) * 2, 14 + (2 - Math.abs(k)) * 12 + r() * 8, k * 0.18, C); }); }
      }),
      bdLayer(170, 0.42, -14, (x, h) => {
        const ys = bdRidge(503, 146, 4); bdFill(x, ys, h, '#2a2450', '#4a4080'); const r = mulberry32(24);
        for (let i = 0; i < 14; i++) { const cx = (r() * BD_W) | 0, w = 18 + r() * 20; bdWrap(o => { x.fillStyle = '#2e2858'; x.fillRect(cx + o, ys[cx] - 8, w, 10); x.fillStyle = '#4a4080'; x.fillRect(cx + o, ys[cx] - 8, w, 1); x.fillStyle = '#6ee7f2'; if (r() < 0.6) x.fillRect(cx + o + 3, ys[cx] - 11, 2, 3); }); }
      })
    ]
  }),
  // 4. Sunscorch Desert: bright sun sky, distant dunes, rock formations, crumbling ruins
  desert: B => ({
    sky: bdSky(['#3a86d4', '#6ab2ea', '#c4e2f0', '#ffe6b0'], (x, r) => {
      bdGlow(x, 296, 52, 90, '#fff2b0', 0.55); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.strokeStyle = 'rgba(255,250,210,.3)'; x.lineWidth = 2; x.beginPath(); x.moveTo(296 + Math.cos(a) * 26, 52 + Math.sin(a) * 26); x.lineTo(296 + Math.cos(a) * 44, 52 + Math.sin(a) * 44); x.stroke(); }   // heat rays around the story's sun
    }),
    layers: [
      bdLayer(170, 0.06, 40, (x, h) => { const ys = bdRidge(601, 74, 16, [1, 2, 3, 4]); bdFill(x, ys, h, '#f0c890', '#ffe4b0', '#d8a868'); bdHaze(x, h, '#ffe6b0', 0.4, 0.1); }),
      bdLayer(170, 0.18, 8, (x, h) => {
        const ys = bdRidge(602, 112, 10); bdFill(x, ys, h, '#e8b47a', '#ffd8a0', '#c8905a'); const r = mulberry32(31);
        for (let i = 0; i < 5; i++) { const cx = 40 + i * 104 + ((r() * 20) | 0), w = 24 + r() * 20, hh = 30 + r() * 28; bdWrap(o => {   // mesas: flat top, steep banded cliffs, a wide talus at the foot
          for (let k = 0; k < hh; k++) { const t = k / hh, ww = w * (1 + t * 0.15 + (t > 0.72 ? (t - 0.72) * 3.2 : 0)), y = ys[cx] - hh + k, band = Math.floor(k / 5) % 3;
            x.fillStyle = ['#cf7c4c', '#dd9060', '#bd6a40'][band]; x.fillRect(Math.round(cx + o - ww / 2), y, Math.round(ww), 1);
            x.fillStyle = '#9a4c2c'; x.fillRect(Math.round(cx + o + ww / 2 - ww * 0.22), y, Math.round(ww * 0.22), 1);
            if (t > 0.1 && t < 0.7 && (k * 7 + i) % 11 === 0) { x.fillStyle = '#8a3e24'; x.fillRect(Math.round(cx + o - ww * 0.2), y, 1, 4); } }
          x.fillStyle = '#f2b282'; x.fillRect(Math.round(cx + o - w / 2), ys[cx] - hh, Math.round(w * 0.78), 2);
        }); }
        bdHaze(x, h, '#ffe6b0', 0.2, 0);
      }),
      bdLayer(170, 0.34, -6, (x, h) => {
        const ys = bdRidge(603, 136, 6); bdFill(x, ys, h, '#e0b070', '#fff0c0', '#c89858'); const r = mulberry32(32);
        bdWrap(o => { bdTri(x, 300 + o, ys[300] + 2, 110, 60, '#d8a868'); for (let k = 0; k < 60; k += 6) { x.fillStyle = '#c08a50'; x.fillRect(300 + o - k * 0.92, ys[300] + 2 - 60 + k, k * 1.84, 1); } x.fillStyle = '#b07a44'; for (let k = 0; k < 60; k++) x.fillRect(300 + o, ys[300] - 58 + k, Math.round(k * 0.92), 1); });
        for (let i = 0; i < 8; i++) { const cx = (r() * BD_W) | 0, hh = 16 + r() * 34, broken = r() < 0.6; bdWrap(o => { x.fillStyle = '#ecc890'; x.fillRect(cx + o - 4, ys[cx] - hh, 8, hh + 2); x.fillStyle = '#c89a60'; x.fillRect(cx + o + 2, ys[cx] - hh, 2, hh + 2); for (let k = 4; k < hh; k += 5) { x.fillStyle = '#d8b07a'; x.fillRect(cx + o - 4, ys[cx] - hh + k, 8, 1); } x.fillStyle = '#ecc890'; if (!broken) x.fillRect(cx + o - 6, ys[cx] - hh - 3, 12, 3); else { x.fillRect(cx + o - 4, ys[cx] - hh - 2, 4, 2); x.fillRect(cx + o + 6, ys[cx] - 3, 6, 4); } }); }
        for (let i = 0; i < 4; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { x.fillStyle = '#7a5030'; for (let k = 0; k < 22; k++) x.fillRect(cx + o + Math.round(Math.sin(k / 8) * 3), ys[cx] - k, 2, 1); for (const a of [-1, -0.4, 0.4, 1]) for (let k = 0; k < 10; k++) { x.fillStyle = k < 7 ? '#2d8a3a' : '#5ab04a'; x.fillRect(cx + o + Math.round(Math.sin(22 / 8) * 3) + Math.round(a * k), ys[cx] - 22 + Math.round(Math.abs(a) * k * 0.5), 2, 1); } }); }
      })
    ]
  }),
  // 5. Frostbite Peaks: cold starry sky with aurora, towering snowy mountains, frozen waterfalls
  frost: B => ({
    sky: bdSky(['#040a22', '#0c1a46', '#203e78', '#4a78b6'], (x, r) => {
      for (let i = 0; i < 90; i++) { x.fillStyle = r() < 0.2 ? '#ffffff' : '#9ab8f0'; x.fillRect((r() * VW) | 0, (r() * VH * 0.6) | 0, 1, 1); }
      for (let k = 0; k < 3; k++) for (let px = 0; px < VW; px++) { const y = 30 + k * 10 + Math.sin(px * 0.02 + k) * 12 + Math.sin(px * 0.05) * 5; x.fillStyle = k === 1 ? 'rgba(110,231,242,.16)' : 'rgba(58,255,176,.16)'; x.fillRect(px, y, 1, 14 - k * 3); }
    }),
    layers: [
      bdLayer(190, 0.05, 0, (x, h) => {
        const r = mulberry32(41); for (let i = 0; i < 7; i++) { const cx = (i * 76 + r() * 30) | 0, w = 120 + r() * 60, hh = 110 + r() * 50; bdWrap(o => { bdTri(x, cx + o, h, w, hh, '#3a5a92'); for (let k = 0; k < hh; k++) { const half = Math.round(k / hh * w / 2); x.fillStyle = '#2c4a80'; x.fillRect(cx + o, h - hh + k, half, 1); } bdTri(x, cx + o, h - hh * 0.62, w * 0.38, hh * 0.38, '#e8f4ff'); for (let k = 0; k < hh * 0.38; k++) { x.fillStyle = '#b8d0ec'; x.fillRect(cx + o, h - hh + k, Math.round(k / (hh * 0.38) * w * 0.19), 1); } }); }
        bdHaze(x, h, '#4a78b6', 0.35, 0.15);
      }),
      bdLayer(170, 0.16, 10, (x, h) => {
        const r = mulberry32(42); for (let i = 0; i < 9; i++) { const cx = (i * 58 + r() * 30) | 0, w = 70 + r() * 40, hh = 70 + r() * 40; bdWrap(o => { bdTri(x, cx + o, h, w, hh, '#5272aa'); for (let k = 0; k < hh; k++) { x.fillStyle = '#3e5c94'; x.fillRect(cx + o, h - hh + k, Math.round(k / hh * w / 2), 1); } bdTri(x, cx + o, h - hh * 0.55, w * 0.45, hh * 0.45, '#f4faff'); }); }
        bdHaze(x, h, '#4a78b6', 0.18, 0.05);
      }),
      bdLayer(170, 0.32, 46, (x, h) => {
        const ys = bdRidge(703, 70, 14); bdFill(x, ys, h, '#2a4a7a', '#e8f4ff'); const r = mulberry32(43);
        for (let i = 0; i < 5; i++) { const cx = 40 + i * 104 + ((r() * 20) | 0), w = 14 + r() * 10; bdWrap(o => { for (let k = 0; k < h - ys[cx]; k++) { const t = (k + i * 7) % 9; x.fillStyle = t < 3 ? '#d8f8ff' : t < 6 ? '#9fe8ff' : '#6ec8f0'; x.fillRect(cx + o - w / 2 + (k % 3), ys[cx] + k, w, 1); } x.fillStyle = '#ffffff'; x.fillRect(cx + o - w / 2, ys[cx], w, 2); bdEll(x, cx + o, h - 6, w, 4, '#c8f0ff'); for (let k = 0; k < 4; k++) bdTriDown(x, cx + o - w / 2 - 6 - k * 5, ys[cx] + 1, 3, 6 + k * 2, '#bfeaff'); }); }
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => bdPine(x, cx + o, Math.min(h - 4, ys[cx] + 40 + r() * 30), 22 + r() * 12, '#183454', '#f4faff')); }
      })
    ]
  }),
  // 6. Ember Volcano: dark smoky sky, a distant erupting volcano, lava falls, glowing obsidian
  volcano: B => ({
    sky: bdSky(['#080303', '#240806', '#521608', '#a83c14'], (x, r) => {
      for (let i = 0; i < 14; i++) { const cx = r() * VW, cy = 20 + r() * 80, s = 1 + r(); for (let k = 0; k < 5; k++) bdDisc(x, cx + k * 8 * s, cy + Math.sin(k) * 4, Math.round((6 + r() * 4) * s), 'rgba(40,20,18,.55)'); }
      for (let i = 0; i < 60; i++) { x.fillStyle = r() < 0.5 ? '#6a5a58' : '#ff7a2a'; x.fillRect((r() * VW) | 0, (r() * VH) | 0, 1, 1); }
    }),
    layers: [
      bdLayer(190, 0.04, 30, (x, h) => {
        bdWrap(o => {
          const cx = 256 + o; bdTri(x, cx, h, 300, 130, '#1e0c0a'); for (let k = 0; k < 130; k++) { x.fillStyle = '#160806'; x.fillRect(cx, h - 130 + k, Math.round(k / 130 * 150), 1); }
          x.fillStyle = '#1e0c0a'; x.fillRect(cx - 22, h - 132, 44, 8); bdGlow(x, cx, h - 134, 50, '#ff6a20', 0.7);
          for (let k = 0; k < 64; k++) { const w = 8 + k * 0.9, t = k / 64; x.fillStyle = t < 0.35 ? '#ffe680' : t < 0.7 ? '#ff9a2a' : 'rgba(200,60,20,' + (1 - t) * 1.6 + ')'; x.fillRect(Math.round(cx - w / 2 + Math.sin(k / 7) * 2), h - 134 - k, Math.round(w), 1); }   // the eruption fans out
          for (let k = 0; k < 30; k++) { const a = -Math.PI / 2 + (k % 2 ? 1 : -1) * (0.3 + (k * 0.37) % 0.9), d = 30 + (k * 23) % 60; bdDisc(x, cx + Math.cos(a) * d * 0.9, h - 150 + Math.sin(a) * d + d * d * 0.008, 2 + (k % 2), k % 3 ? '#ff7a2a' : '#ffd34e'); }   // lava bombs
          for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 90; k++) { x.fillStyle = k % 8 < 4 ? '#ff5a1a' : '#ffa030'; x.fillRect(cx + s * (10 + k * 0.9) + Math.sin(k / 6) * 2, h - 128 + k, 2, 1); }
          for (let i = 0; i < 16; i++) bdDisc(x, cx + Math.sin(i * 1.7) * 30, h - 200 - i * 3, 4 + (i % 3), 'rgba(60,30,26,.8)');
        });
      }),
      bdLayer(170, 0.2, 50, (x, h) => {
        const ys = bdRidge(801, 60, 18); bdFill(x, ys, h, '#2a100c', '#5a2014'); const r = mulberry32(51);
        for (let i = 0; i < 6; i++) { const cx = 30 + i * 84 + ((r() * 20) | 0), w = 6 + r() * 6; bdWrap(o => { bdGlow(x, cx + o, h - 10, 40, '#ff6a20', 0.45); for (let k = 0; k < h - ys[cx]; k++) { const t = (k + i * 5) % 10; x.fillStyle = t < 4 ? '#ffd34e' : t < 7 ? '#ff9a2a' : '#ff5a1a'; x.fillRect(cx + o - w / 2 + Math.round(Math.sin(k / 9) * 1.5), ys[cx] + k, w, 1); } }); }
      }),
      bdLayer(170, 0.38, -2, (x, h) => {
        const ys = bdRidge(802, 130, 8); bdFill(x, ys, h, '#140a0e', '#3a1a1a'); const r = mulberry32(52);
        for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0, w = 12 + r() * 14, hh = 26 + r() * 50; bdWrap(o => { bdTri(x, cx + o, ys[cx] + 4, w, hh, '#120810'); x.fillStyle = '#2a1418'; for (let k = 0; k < hh; k++) x.fillRect(cx + o - Math.round(k / hh * w / 2), ys[cx] + 4 - hh + k, 1, 1); let px = cx + o, py = ys[cx] - hh * 0.8; x.fillStyle = '#ff5a1a'; for (let k = 0; k < 10; k++) { px += (r() - 0.5) * 3; py += 3; x.fillRect(Math.round(px), Math.round(py), 1, 2); } }); }
        for (let i = 0; i < 30; i++) { const cx = (r() * BD_W) | 0; x.fillStyle = '#ff7a2a'; x.fillRect(cx, ys[cx] + 2 + ((r() * 20) | 0), 2, 1); }
      })
    ]
  }),
  // 7. Glowcap Swamp, turning into a dense jungle: a dark foggy canopy, distant ancient trees, tangled vines over glowing water, mossy ledges
  swamp: B => ({
    sky: bdSky(['#02080a', '#06161a', '#0e2e2a', '#1a4a40'], (x, r) => { for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(120,200,170,.06)'; x.fillRect(0, 70 + i * 24, VW, 9); } for (let i = 0; i < 50; i++) { x.fillStyle = r() < 0.5 ? '#a4ffc0' : '#4affe0'; x.fillRect((r() * VW) | 0, (40 + r() * 140) | 0, 1, 1); } }),
    layers: [
      bdLayer(150, 0.07, 0, (x, h) => {   // the jungle canopy: dark leaf masses and hanging lianas along the top
        const r = mulberry32(61); x.fillStyle = '#04120e'; x.fillRect(0, 0, BD_W, 14);
        for (let i = 0; i < 34; i++) { const cx = (r() * BD_W) | 0, cy = 4 + r() * 26, rad = 12 + ((r() * 18) | 0); bdWrap(o => { bdDisc(x, cx + o, cy, rad, '#06201a'); bdDisc(x, cx + o - 4, cy - 4, (rad * 0.6) | 0, '#0c3a2a'); bdDisc(x, cx + o - 6, cy - 6, (rad * 0.25) | 0, '#1a6a44'); }); }
        for (let i = 0; i < 46; i++) { const cx = (r() * BD_W) | 0, len = 18 + ((r() * 70) | 0); x.fillStyle = '#0a2e1e'; x.fillRect(cx, 22, 1, len); if (i % 3 === 0) { x.fillStyle = '#2a8a4a'; x.fillRect(cx - 1, 22 + len, 3, 2); } }
      }, 'top'),
      bdLayer(200, 0.1, 10, (x, h) => {   // distant massive ancient trees with buttress roots
        const r = mulberry32(62); for (let i = 0; i < 6; i++) { const cx = (i * 92 + r() * 30) | 0, w = 26 + r() * 14; bdWrap(o => { x.fillStyle = '#123a30'; x.fillRect(cx + o - w / 2, 0, w, h); x.fillStyle = '#1a5444'; x.fillRect(cx + o - w / 2, 0, 3, h); x.fillStyle = '#0a241e'; for (let k = 0; k < h; k += 9) x.fillRect(cx + o - w / 2 + 4 + ((k * 5) % (w - 8)), k, 2, 6);
          for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 26; k++) { x.fillStyle = '#123a30'; x.fillRect(cx + o + s * (w / 2 + k * 0.7) - (s < 0 ? 2 : 0), h - 26 + k, 3 + k * 0.05, 1); }
          for (let b = 0; b < 3; b++) { const by = 36 + b * 46, s = b % 2 ? -1 : 1, len = 24 + b * 8; x.fillStyle = '#123a30'; x.fillRect(s > 0 ? cx + o + w / 2 : cx + o - w / 2 - len, by, len, 7); } }); }
        bdHaze(x, h, '#1a4a40', 0.5, 0.25);
      }),
      bdLayer(170, 0.24, 50, (x, h) => {   // mid: thick tangled vines, giant glowing mushrooms, swamp water
        const ys = bdRidge(901, 124, 5); bdFill(x, ys, h, '#08241c'); const r = mulberry32(63);
        for (let i = 0; i < 5; i++) { const cx = (i * 108 + r() * 40) | 0, hh = 40 + r() * 36, rad = 22 + r() * 14, c = i % 2 ? '#2ab08a' : '#8e5ad0'; bdWrap(o => { x.fillStyle = '#bcb090'; x.fillRect(cx + o - 4, ys[cx] - hh, 8, hh + 2); bdGlow(x, cx + o, ys[cx] - hh, rad * 1.6, c, 0.35); bdEll(x, cx + o, ys[cx] - hh, rad, rad * 0.5, c); bdEll(x, cx + o - 3, ys[cx] - hh - 2, rad * 0.6, rad * 0.25, '#ffffff22'); for (let k = 0; k < 6; k++) { const sx = cx + o + (k - 2.5) * rad * 0.35; bdDisc(x, sx, ys[cx] - hh + 2, 1, '#e8ffe8'); } }); }
        for (let i = 0; i < 16; i++) { const cx = (r() * BD_W) | 0, top = 6 + r() * 20, len = 50 + r() * 60, ph = r() * 6; bdWrap(o => { for (let k = 0; k < len; k++) { const px = cx + o + Math.round(Math.sin(k / 10 + ph) * 3); x.fillStyle = k % 6 < 3 ? '#1a6a3a' : '#2a8a4a'; x.fillRect(px, top + k, 2, 1); if (k % 14 === 5) { x.fillStyle = '#4ac86a'; x.fillRect(px + 2, top + k, 4, 2); x.fillRect(px - 4, top + k + 4, 4, 2); } } }); }   // tangled hanging vines
        for (let k = 0; k < 40; k++) { const px = (r() * BD_W) | 0, py = ys[px] + 4 + ((r() * 36) | 0); x.fillStyle = r() < 0.5 ? 'rgba(74,184,160,.55)' : 'rgba(164,255,192,.3)'; x.fillRect(px, py, 6 + ((r() * 12) | 0), 1); }
        bdHaze(x, h, '#1a4a40', 0.2, 0.05);
      }),
      bdLayer(170, 0.42, 56, (x, h) => {   // near: mossy ledges, ferns and glowing mushrooms, a few swaying vines
        const ys = bdRidge(902, 130, 3); bdFill(x, ys, h, '#0c2e26', '#2a6a4a'); const r = mulberry32(64);
        for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0, len = 30 + r() * 40; bdWrap(o => { for (let k = 0; k < len; k++) { x.fillStyle = k % 5 < 3 ? '#14502e' : '#1e6a3a'; x.fillRect(cx + o + Math.round(Math.sin(k / 8 + i) * 2), 0 + k, 2, 1); } x.fillStyle = '#6aff8a'; x.fillRect(cx + o - 1, len, 3, 2); }); }
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, hh = 6 + r() * 12, c = r() < 0.5 ? '#7aff9a' : '#4affe0'; bdWrap(o => { x.fillStyle = '#d8ccb0'; x.fillRect(cx + o - 1, ys[cx] - hh, 2, hh + 2); bdGlow(x, cx + o, ys[cx] - hh, 12, c, 0.5); bdEll(x, cx + o, ys[cx] - hh, 5, 3, c); x.fillStyle = '#ffffff'; x.fillRect(cx + o - 2, ys[cx] - hh - 1, 1, 1); }); }
        for (let i = 0; i < 24; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { for (let k = -2; k <= 2; k++) { x.fillStyle = '#1e7a3e'; x.fillRect(cx + o + k * 2, ys[cx] - 6 + Math.abs(k), 1, 6 - Math.abs(k)); } }); }
      })
    ]
  }),
  // 8. Sunken Deep, a vertical descent: fading deep-blue water, giant sea creatures far away, steep underwater cliffs, coral ledges stepping down
  ocean: B => ({
    sky: bdSky(['#2a82c0', '#145e9c', '#0a3a74', '#02102c'], (x, r) => { for (let i = 0; i < 7; i++) { const cx = 20 + i * 56; x.fillStyle = 'rgba(180,235,255,.07)'; for (let k = 0; k < VH; k++) x.fillRect(cx + k * 0.35, k, 18 - k * 0.06, 1); } for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,240,255,.5)'; x.fillRect((r() * VW) | 0, (r() * VH) | 0, 1, 1); } }),
    layers: [
      bdLayer(160, 0.03, 4, (x, h) => {   // giant sea creatures, only silhouettes in the deep blue
        const r = mulberry32(71);
        const leviathan = (cx, cy, s, f) => { x.fillStyle = '#082450'; for (let k = 0; k < 10; k++) { const px = cx - f * k * 11 * s, py = cy + Math.sin(k * 0.7) * 6 * s, rad = (15 - k * 1.1) * s; if (rad > 1) bdEll(x, px, py, rad * 1.3, rad * 0.8, '#082450'); } bdEll(x, cx + f * 6 * s, cy, 20 * s, 9 * s, '#0a2c5a'); x.fillStyle = '#082450'; x.beginPath(); x.moveTo(cx - f * 110 * s, cy); x.lineTo(cx - f * 140 * s, cy - 16 * s); x.lineTo(cx - f * 132 * s, cy); x.lineTo(cx - f * 140 * s, cy + 14 * s); x.closePath(); x.fill(); for (let k = 0; k < 7; k++) bdDisc(x, cx - f * (10 + k * 13) * s, cy + 7 * s, 1, '#5ab0f0'); bdDisc(x, cx + f * 22 * s, cy - 3 * s, 1, '#ffd34e'); };
        bdWrap(o => { leviathan(110 + o, 60, 1.2, 1); leviathan(400 + o, 120, 0.7, -1); });
        for (let i = 0; i < 4; i++) { const cx = r() * BD_W, cy = 20 + r() * 110; bdWrap(o => { x.fillStyle = '#0a2c5a'; x.beginPath(); x.moveTo(cx + o - 14, cy); x.quadraticCurveTo(cx + o, cy - 10, cx + o + 14, cy); x.quadraticCurveTo(cx + o, cy + 4, cx + o - 14, cy); x.fill(); x.fillRect(cx + o, cy + 3, 1, 14); }); }   // manta rays
      }, 'top'),
      bdLayer(170, 0.12, 44, (x, h) => {   // steep underwater cliffs
        const ys = bdRidge(1001, 100, 18, [1, 2, 4]); bdFill(x, ys, h, '#0a2a54'); const r = mulberry32(72);
        for (let i = 0; i < 6; i++) { const cx = (i * 90 + r() * 30) | 0, w = 24 + r() * 20, hh = 40 + r() * 50; bdWrap(o => { for (let k = 0; k < hh; k++) { x.fillStyle = k % 8 < 4 ? '#0e3468' : '#0c2e5c'; x.fillRect(cx + o - w / 2 - (k < 6 ? 0 : 1), ys[cx] - hh + k, w + 2, 1); } x.fillStyle = '#1a4a84'; x.fillRect(cx + o - w / 2, ys[cx] - hh, w, 2); }); }
        bdHaze(x, h, '#02102c', 0.4, 0.2);
      }),
      bdLayer(190, 0.26, 28, (x, h) => {   // kelp forest and drifting glowing jellyfish
        const r = mulberry32(73); for (let i = 0; i < 24; i++) { const cx = (r() * BD_W) | 0, hh = 70 + r() * 100, ph = r() * 6; bdWrap(o => { for (let k = 0; k < hh; k++) { const px = cx + o + Math.round(Math.sin(k / 12 + ph) * 4); x.fillStyle = k % 8 < 4 ? '#14683e' : '#1d8450'; x.fillRect(px, h - k, 2, 1); if (k % 14 === 7) { x.fillStyle = '#34a864'; x.fillRect(px + (k % 28 ? 2 : -4), h - k, 4, 2); } } }); }
        for (let i = 0; i < 9; i++) { const cx = (r() * BD_W) | 0, cy = 20 + r() * 120, c = ['#ff8ae8', '#8affff', '#a08aff'][i % 3]; bdWrap(o => { bdGlow(x, cx + o, cy, 18, c, 0.4); bdEll(x, cx + o, cy, 6, 4, c); for (let k = -2; k <= 2; k++) { x.fillStyle = c; x.fillRect(cx + o + k * 2, cy + 3, 1, 6 + (k & 1) * 3); } }); }
        bdHaze(x, h, '#0a3a74', 0.2, 0.05);
      }),
      bdLayer(170, 0.44, 54, (x, h) => {   // near: coral ledges stepping down toward the abyss
        const ys = bdRidge(1003, 146, 4); bdFill(x, ys, h, '#b8a078', '#e0c898'); const r = mulberry32(74);
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, col = ['#ff6a8a', '#ff9a4a', '#a06af0', '#ffd34e', '#4affe0'][i % 5]; bdWrap(o => { if (i % 3 === 0) { for (let b = -2; b <= 2; b++) { x.fillStyle = col; let px = cx + o, py = ys[cx]; for (let k = 0; k < 14; k++) { px += b * 0.4; py -= 1; x.fillRect(Math.round(px), py, 2, 1); } x.fillRect(Math.round(px) - 1, py - 1, 4, 2); } } else { bdDisc(x, cx + o, ys[cx] - 4, 6, col); bdDisc(x, cx + o - 5, ys[cx] - 8, 4, col); bdDisc(x, cx + o + 5, ys[cx] - 9, 3, col); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(cx + o - 2, ys[cx] - 8, 2, 1); } }); }
      })
    ]
  }),
  // 9. Deepdig Tunnels: an epic sinkhole. Dark rocky ceiling, distant glowing mining tunnels, giant cavern walls, ledges over a glowing pit
  tunnels: B => ({
    sky: bdSky(['#030201', '#0e0604', '#24100a', '#4a1e0e'], (x, r) => { bdGlow(x, 192, 220, 200, '#ff5a1a', 0.35); for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? '#ff9a2a' : '#6a3a28'; x.fillRect((r() * VW) | 0, (100 + r() * 116) | 0, 1, 1); } }),
    layers: [
      bdLayer(110, 0.16, 0, (x, h) => {   // the rocky ceiling with stalactites and hanging lamps
        x.fillStyle = '#100804'; x.fillRect(0, 0, BD_W, 16); const ys = bdRidge(1101, 20, 8); for (let px = 0; px < BD_W; px++) { x.fillStyle = '#100804'; x.fillRect(px, 0, 1, ys[px]); x.fillStyle = '#3a2416'; x.fillRect(px, ys[px], 1, 1); }
        const r = mulberry32(81); for (let i = 0; i < 20; i++) { const cx = (r() * BD_W) | 0, hh = 10 + r() * 40; bdWrap(o => { bdTriDown(x, cx + o, ys[cx], 6 + r() * 10, hh, '#100804'); bdTriDown(x, cx + o - 1, ys[cx], 2, hh * 0.7, '#2a1a10'); }); }
        for (let i = 0; i < 7; i++) { const cx = 30 + i * 72; bdWrap(o => { x.fillStyle = '#3a2a1a'; x.fillRect(cx + o, ys[cx], 1, 26); x.fillStyle = '#ffd34e'; x.fillRect(cx + o - 2, ys[cx] + 26, 5, 5); bdGlow(x, cx + o, ys[cx] + 28, 20, '#ffb040', 0.5); }); }
      }, 'top'),
      bdLayer(190, 0.08, 20, (x, h) => {   // distant glowing mining tunnels cut into the far wall of the pit
        x.fillStyle = '#1a0c08'; x.fillRect(0, 0, BD_W, h); const r = mulberry32(82);
        for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const cx = ((i * 86 + row * 31 + r() * 24) % BD_W) | 0, cy = 40 + row * 54; bdWrap(o => { bdGlow(x, cx + o, cy, 26, '#ff9a2a', 0.4); x.fillStyle = '#2a140c'; x.fillRect(cx + o - 11, cy - 12, 22, 24); x.fillStyle = '#080402'; bdEll(x, cx + o, cy - 6, 8, 8, '#080402'); x.fillRect(cx + o - 8, cy - 6, 16, 18); x.fillStyle = '#ff9a2a'; x.fillRect(cx + o - 1, cy + 2, 2, 3); x.fillStyle = '#5a3a28'; x.fillRect(cx + o - 12, cy + 12, 24, 2); }); }
        for (let i = 0; i < 4; i++) { const cx = 20 + i * 130; bdWrap(o => { x.fillStyle = '#4a2c18'; for (let k = 0; k < 150; k += 10) { x.fillRect(cx + o + (k % 20 ? 14 : 0), k, 3, 8); } x.fillRect(cx + o, 0, 2, 190); x.fillRect(cx + o + 14, 0, 2, 190); }); }   // ladders and rails climbing the wall
        bdHaze(x, h, '#4a1e0e', 0.3, 0.1);
      }),
      bdLayer(170, 0.24, 40, (x, h) => {   // giant cavern walls curving around the pit: strata, scaffolding spiralling down
        const r = mulberry32(83); const ys = bdRidge(1102, 70, 22, [1, 2, 3]); bdFill(x, ys, h, '#2a1408', '#5a2e18'); for (let k = 0; k < 14; k++) { const py = 30 + k * 11; for (let px = 0; px < BD_W; px += 2) if (ys[px] < py) { x.fillStyle = k % 2 ? '#3a1c0e' : '#2e160a'; x.fillRect(px, py, 2, 4); } }
        for (let i = 0; i < 6; i++) { const cx = (i * 86 + r() * 30) | 0; bdWrap(o => { const hh = 80 + r() * 60; x.fillStyle = '#4a2c18'; x.fillRect(cx + o, ys[cx], 4, hh); x.fillRect(cx + o + 22, ys[cx] + 14, 4, hh - 14); x.fillStyle = '#6a4424'; for (let k = 0; k < 4; k++) { x.fillRect(cx + o - 4, ys[cx] + 12 + k * 30, 34, 3); x.strokeStyle = '#3a2410'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx + o, ys[cx] + 12 + k * 30); x.lineTo(cx + o + 26, ys[cx] + 42 + k * 30); x.stroke(); } }); }
        for (let i = 0; i < 4; i++) { const cx = (r() * BD_W) | 0, cy = 90 + r() * 60; bdWrap(o => { bdGlow(x, cx + o, cy, 24, '#ff5a1a', 0.45); for (let k = 0; k < 24; k++) { x.fillStyle = k % 6 < 3 ? '#ffb040' : '#ff5a1a'; x.fillRect(cx + o - 2 + Math.round(Math.sin(k / 5) * 2), cy + k, 3, 1); } }); }   // lava seeping out of the wall
      }),
      bdLayer(170, 0.42, 56, (x, h) => {   // near: rocky ledges overlooking the glowing pit, minecart rails, crates
        const ys = bdRidge(1104, 140, 4); bdFill(x, ys, h, '#2a180c', '#5a3820'); const r = mulberry32(84);
        for (let px = 0; px < BD_W; px += 6) { x.fillStyle = '#5a3a1e'; x.fillRect(px, ys[px] - 3, 4, 2); } x.fillStyle = '#8a8a96'; for (let px = 0; px < BD_W; px++) { x.fillRect(px, ys[px] - 5, 1, 1); }
        for (let i = 0; i < 9; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { x.fillStyle = '#8a5a2a'; x.fillRect(cx + o, ys[cx] - 13, 12, 12); x.fillStyle = '#5a3a1a'; x.fillRect(cx + o, ys[cx] - 13, 12, 1); x.fillRect(cx + o, ys[cx] - 7, 12, 1); x.fillRect(cx + o + 5, ys[cx] - 13, 1, 12); }); }
        for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { bdGlow(x, cx + o, ys[cx] + 8, 14, '#ff7a1a', 0.35); }); }   // the heat of the pit below
      })
    ]
  }),
  // 10. Shadow Citadel: blood red sky, distant ominous towers, gothic arches, gargoyle ledges
  citadel: B => ({
    sky: bdSky(['#0c0206', '#360610', '#760c18', '#c42818'], (x, r) => {
      bdGlow(x, 280, 54, 60, '#ff3a2a', 0.45); bdDisc(x, 280, 54, 22, '#ff5a3a'); bdDisc(x, 284, 52, 20, '#14040a');
      for (let i = 0; i < 9; i++) { const cx = r() * VW, cy = 20 + r() * 70; x.fillStyle = '#14040a'; x.fillRect(cx - 3, cy, 3, 1); x.fillRect(cx, cy - 1, 1, 2); x.fillRect(cx + 1, cy, 3, 1); }
      for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(20,4,10,.35)'; x.fillRect(0, 100 + i * 16, VW, 4); }
    }),
    layers: [
      bdLayer(190, 0.06, 30, (x, h) => {
        const r = mulberry32(91); for (let i = 0; i < 12; i++) { const cx = (i * 44 + r() * 20) | 0, w = 12 + r() * 14, hh = 70 + r() * 90; bdWrap(o => { x.fillStyle = '#16040a'; x.fillRect(cx + o - w / 2, h - hh, w, hh); bdTri(x, cx + o, h - hh, w + 6, 26 + r() * 20, '#16040a'); for (let k = 0; k < w; k += 5) x.fillRect(cx + o - w / 2 + k, h - hh - 3, 3, 3); for (let k = 0; k < 4; k++) if (r() < 0.6) { x.fillStyle = '#ff3a3a'; x.fillRect(cx + o - 1 + ((r() * 6) | 0) - 3, h - hh + 10 + k * 14, 2, 4); } if (r() < 0.4) { x.fillStyle = '#16040a'; x.fillRect(cx + o, h - hh - 46, 1, 14); x.fillStyle = '#a01020'; x.fillRect(cx + o + 1, h - hh - 46, 7, 4); } }); }
        bdHaze(x, h, '#c42818', 0.3, 0.1);
      }),
      bdLayer(170, 0.2, 40, (x, h) => {
        x.fillStyle = '#2a1418'; x.fillRect(0, 30, BD_W, 10); x.fillStyle = '#4a2a30'; x.fillRect(0, 30, BD_W, 1);
        for (let i = 0; i < 8; i++) { const cx = i * 64; bdWrap(o => { x.fillStyle = '#2a1418'; x.fillRect(cx + o - 6, 30, 12, h); x.fillStyle = '#4a2a30'; x.fillRect(cx + o - 6, 30, 2, h); x.fillStyle = '#2a1418'; for (let k = 0; k < 26; k++) { const half = Math.round(Math.sqrt(Math.max(0, 1 - Math.pow(1 - k / 26, 2))) * 26); x.fillRect(cx + o + 6, 40 + k * 0 + (26 - k), 26 - half, 1); x.fillRect(cx + o + 32 + half, 40 + (26 - k), 26 - half, 1); } }); }
        bdWrap(o => { bdDisc(x, 192 + o, 70, 12, '#2a1418'); bdDisc(x, 192 + o, 70, 9, '#a01020'); x.fillStyle = '#2a1418'; x.fillRect(191 + o, 61, 2, 18); x.fillRect(183 + o, 69, 18, 2); });
        x.fillStyle = '#1e0e12'; x.fillRect(0, 150, BD_W, h - 150); bdHaze(x, h, '#760c18', 0.2, 0.05);
      }),
      bdLayer(170, 0.38, -6, (x, h) => {
        const ys = bdRidge(1203, 138, 4); bdFill(x, ys, h, '#140a0e', '#3a1e24'); const r = mulberry32(93);
        const gargoyle = (cx, by) => { x.fillStyle = '#100608'; x.fillRect(cx - 5, by - 8, 10, 8); bdDisc(x, cx + 3, by - 11, 3, '#100608'); bdTri(x, cx - 8, by - 4, 10, 10, '#100608'); bdTri(x, cx + 9, by - 4, 10, 10, '#100608'); x.fillStyle = '#ff3a3a'; x.fillRect(cx + 4, by - 12, 1, 1); };
        for (let i = 0; i < 6; i++) { const cx = 30 + i * 86 + ((r() * 20) | 0), hh = 40 + r() * 30; bdWrap(o => { x.fillStyle = '#1e1014'; x.fillRect(cx + o - 6, ys[cx] - hh, 12, hh + 2); x.fillStyle = '#3a1e24'; x.fillRect(cx + o - 8, ys[cx] - hh, 16, 3); gargoyle(cx + o, ys[cx] - hh); if (i % 2) { bdGlow(x, cx + o + 30, ys[cx] - 20, 14, '#ff7a2a', 0.6); x.fillStyle = '#ffb040'; x.fillRect(cx + o + 28, ys[cx] - 24, 4, 4); x.fillStyle = '#3a1e24'; x.fillRect(cx + o + 29, ys[cx] - 20, 2, 20); } }); }
        for (let i = 0; i < 6; i++) { const cx = (r() * BD_W) | 0; x.fillStyle = '#2a1418'; for (let k = 0; k < 30; k += 3) x.fillRect(cx + Math.round(Math.sin(k / 10) * 2), k, 2, 2); }
      })
    ]
  })
};
// the sky gradients the rest of the game uses (horizon fog, grading) follow the new paintings
const BACKDROP_SKY = { meadow: ['#3a86dc', '#64aef0', '#a6daff', '#e6f7ff'], forest: ['#5a7c72', '#86a898', '#b8d0c0', '#dfeadc'], caves: ['#04030c', '#0c0822', '#180f3a', '#22164a'], desert: ['#3a86d4', '#6ab2ea', '#c4e2f0', '#ffe6b0'], frost: ['#040a22', '#0c1a46', '#203e78', '#4a78b6'], volcano: ['#080303', '#240806', '#521608', '#a83c14'], swamp: ['#02080a', '#06161a', '#0e2e2a', '#1a4a40'], ocean: ['#2a82c0', '#145e9c', '#0a3a74', '#02102c'], tunnels: ['#030201', '#0e0604', '#24100a', '#4a1e0e'], citadel: ['#0c0206', '#360610', '#760c18', '#c42818'] };
if (typeof BIOMES !== 'undefined') BIOMES.forEach(B => { if (BACKDROP_SKY[B.id]) B.sky = BACKDROP_SKY[B.id]; });
