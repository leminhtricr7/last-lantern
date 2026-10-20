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
  // 7. Glowcap Swamp: dark foggy sky, distant massive mushrooms, swamp waters, glowing mushrooms
  swamp: B => ({
    sky: bdSky(['#030a0a', '#08181a', '#10302c', '#1c4a40'], (x, r) => { for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(120,200,170,.06)'; x.fillRect(0, 60 + i * 26, VW, 10); } for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? '#a4ffc0' : '#4affe0'; x.fillRect((r() * VW) | 0, (40 + r() * 140) | 0, 1, 1); } }),
    layers: [
      bdLayer(190, 0.08, 30, (x, h) => {
        const r = mulberry32(61); for (let i = 0; i < 6; i++) { const cx = (i * 88 + r() * 30) | 0, hh = 90 + r() * 60, rad = 30 + r() * 26; bdWrap(o => { x.fillStyle = '#4a7a6a'; x.fillRect(cx + o - 6, h - hh, 12, hh); bdEll(x, cx + o, h - hh, rad, rad * 0.45, '#2a7a6a'); bdEll(x, cx + o, h - hh + rad * 0.2, rad * 0.9, rad * 0.15, '#1e5a4e'); for (let k = 0; k < 6; k++) { const sx = cx + o + (k - 2.5) * rad * 0.3, sy = h - hh - rad * 0.2 + Math.abs(k - 2.5) * 3; bdGlow(x, sx, sy, 7, '#a4ffc0', 0.6); bdDisc(x, sx, sy, 1, '#d8ffe8'); } }); }
        bdHaze(x, h, '#1c4a40', 0.45, 0.25);
      }),
      bdLayer(170, 0.22, -2, (x, h) => {
        const ys = bdRidge(901, 120, 8); bdFill(x, ys, h, '#0e2018'); const r = mulberry32(62);
        for (let i = 0; i < 10; i++) { const cx = (r() * BD_W) | 0, hh = 50 + r() * 50; bdWrap(o => { let px = cx + o; for (let k = 0; k < hh; k++) { px += Math.sin(k / 9 + i) * 0.6; x.fillStyle = '#10241a'; x.fillRect(Math.round(px) - 3, ys[cx] - k, 6, 1); } for (let b = 0; b < 3; b++) { const by = ys[cx] - hh * (0.5 + b * 0.18), len = 14 + b * 4, s = b % 2 ? -1 : 1; x.fillStyle = '#10241a'; x.fillRect(s > 0 ? Math.round(px) : Math.round(px) - len, by, len, 2); for (let v = 0; v < len; v += 3) { x.fillStyle = '#2a5a3a'; x.fillRect((s > 0 ? Math.round(px) : Math.round(px) - len) + v, by + 2, 1, 4 + ((v * 7) % 8)); } } for (let k = 0; k < 4; k++) { x.fillStyle = '#10241a'; x.fillRect(cx + o - 10 + k * 6, ys[cx] - 4, 2, 8); } }); }
        bdHaze(x, h, '#1c4a40', 0.25, 0.05);
      }),
      bdLayer(170, 0.4, 4, (x, h) => {
        const ys = bdRidge(902, 128, 3); bdFill(x, ys, h, '#0c2e2a'); const r = mulberry32(63);
        for (let k = 0; k < 40; k++) { const px = (r() * BD_W) | 0, py = ys[px] + 4 + ((r() * 30) | 0); x.fillStyle = r() < 0.5 ? 'rgba(74,184,160,.6)' : 'rgba(164,255,192,.35)'; x.fillRect(px, py, 6 + ((r() * 10) | 0), 1); }
        for (let i = 0; i < 10; i++) { const cx = (r() * BD_W) | 0; bdEll(x, cx, ys[cx] + 8, 5, 2, '#2a6a3a'); }
        for (let i = 0; i < 16; i++) { const cx = (r() * BD_W) | 0, hh = 6 + r() * 12, c = r() < 0.5 ? '#7aff9a' : '#4affe0'; bdWrap(o => { x.fillStyle = '#d8ccb0'; x.fillRect(cx + o - 1, ys[cx] - hh, 2, hh + 2); bdGlow(x, cx + o, ys[cx] - hh, 12, c, 0.5); bdEll(x, cx + o, ys[cx] - hh, 5, 3, c); x.fillStyle = '#ffffff'; x.fillRect(cx + o - 2, ys[cx] - hh - 1, 1, 1); }); }
      })
    ]
  }),
  // 8. Sunken Deep: deep blue water, distant whales, sunken temple ruins, kelp forests, coral
  ocean: B => ({
    sky: bdSky(['#2a7ab8', '#145a98', '#0a3a74', '#03183c'], (x, r) => { for (let i = 0; i < 7; i++) { const cx = 20 + i * 56; x.fillStyle = 'rgba(180,235,255,.07)'; for (let k = 0; k < VH; k++) x.fillRect(cx + k * 0.35, k, 18 - k * 0.06, 1); } for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,240,255,.5)'; x.fillRect((r() * VW) | 0, (r() * VH) | 0, 1, 1); } }),
    layers: [
      bdLayer(140, 0.03, 10, (x, h) => {
        const whale = (cx, cy, s, f) => { bdEll(x, cx, cy, 30 * s, 9 * s, '#0c2a58'); bdEll(x, cx + f * 12 * s, cy + 3 * s, 16 * s, 6 * s, '#103262'); x.fillStyle = '#0c2a58'; x.beginPath(); x.moveTo(cx - f * 28 * s, cy); x.lineTo(cx - f * 44 * s, cy - 10 * s); x.lineTo(cx - f * 40 * s, cy); x.lineTo(cx - f * 44 * s, cy + 9 * s); x.closePath(); x.fill(); x.fillRect(cx - 4 * s, cy + 6 * s, 10 * s, 6 * s); };
        bdWrap(o => { whale(120 + o, 50, 1, 1); whale(380 + o, 90, 0.6, -1); });
        const r = mulberry32(71); for (let i = 0; i < 5; i++) { const cx = r() * BD_W, cy = 30 + r() * 90; for (let k = 0; k < 9; k++) { x.fillStyle = '#2a6aa0'; x.fillRect(Math.round(cx + (k % 3) * 5), Math.round(cy + Math.floor(k / 3) * 3 + (k % 2)), 3, 1); } }
      }, 'top'),
      bdLayer(170, 0.12, -14, (x, h) => {
        const ys = bdRidge(1001, 140, 6); bdFill(x, ys, h, '#0a2a54'); bdWrap(o => {
          const cx = 260 + o; x.fillStyle = '#123a6a'; bdTri(x, cx, 70, 160, 26, '#123a6a'); x.fillRect(cx - 74, 70, 148, 8);
          for (let k = 0; k < 6; k++) { const px = cx - 66 + k * 26, broken = k === 2 || k === 5; x.fillStyle = '#123a6a'; x.fillRect(px, 78, 10, broken ? 30 : 64); x.fillStyle = '#1a4a80'; x.fillRect(px, 78, 2, broken ? 30 : 64); }
          x.fillStyle = '#0e3260'; x.fillRect(cx - 80, 142, 160, 6);
          for (let k = 0; k < 10; k++) { x.fillStyle = '#1a6a4a'; x.fillRect(cx - 70 + k * 15, 70 + (k % 3) * 6, 1, 18 + (k % 4) * 6); }
        }); bdHaze(x, h, '#03183c', 0.25, 0.15);
      }),
      bdLayer(190, 0.28, 30, (x, h) => {
        const r = mulberry32(72); for (let i = 0; i < 26; i++) { const cx = (r() * BD_W) | 0, hh = 70 + r() * 100, ph = r() * 6; bdWrap(o => { for (let k = 0; k < hh; k++) { const px = cx + o + Math.round(Math.sin(k / 12 + ph) * 4); x.fillStyle = k % 8 < 4 ? '#1a7a4a' : '#24955a'; x.fillRect(px, h - k, 2, 1); if (k % 14 === 7) { x.fillStyle = '#3ab06a'; x.fillRect(px + (k % 28 ? 2 : -4), h - k, 4, 2); } } }); }
        bdHaze(x, h, '#0a3a74', 0.2, 0.05);
      }),
      bdLayer(170, 0.44, -14, (x, h) => {
        const ys = bdRidge(1003, 146, 4); bdFill(x, ys, h, '#c8b088', '#e8d8b0'); const r = mulberry32(73);
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, col = ['#ff6a8a', '#ff9a4a', '#a06af0', '#ffd34e', '#4affe0'][i % 5]; bdWrap(o => { if (i % 3 === 0) { for (let b = -2; b <= 2; b++) { x.fillStyle = col; let px = cx + o, py = ys[cx]; for (let k = 0; k < 14; k++) { px += b * 0.4; py -= 1; x.fillRect(Math.round(px), py, 2, 1); } x.fillRect(Math.round(px) - 1, py - 1, 4, 2); } } else { bdDisc(x, cx + o, ys[cx] - 4, 6, col); bdDisc(x, cx + o - 5, ys[cx] - 8, 4, col); bdDisc(x, cx + o + 5, ys[cx] - 9, 3, col); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(cx + o - 2, ys[cx] - 8, 2, 1); } }); }
      })
    ]
  }),
  // 9. Deepdig Tunnels: dark rocky ceiling, distant mining equipment, support beams, wooden scaffolding
  tunnels: B => ({
    sky: bdSky(['#040201', '#100806', '#20120a', '#2e1c10'], (x, r) => { for (let i = 0; i < 10; i++) bdGlow(x, r() * VW, 60 + r() * 100, 14, '#ffa040', 0.08); }),
    layers: [
      bdLayer(90, 0.18, 0, (x, h) => {
        x.fillStyle = '#140c06'; x.fillRect(0, 0, BD_W, 14); const ys = bdRidge(1101, 16, 6); for (let px = 0; px < BD_W; px++) { x.fillStyle = '#140c06'; x.fillRect(px, 0, 1, ys[px]); x.fillStyle = '#3a2416'; x.fillRect(px, ys[px], 1, 1); }
        const r = mulberry32(81); for (let i = 0; i < 16; i++) { const cx = (r() * BD_W) | 0, hh = 8 + r() * 30; bdWrap(o => bdTriDown(x, cx + o, ys[cx], 6 + r() * 8, hh, '#140c06')); }
        for (let i = 0; i < 7; i++) { const cx = 30 + i * 72; bdWrap(o => { x.fillStyle = '#3a2a1a'; x.fillRect(cx + o, ys[cx], 1, 22); x.fillStyle = '#ffd34e'; x.fillRect(cx + o - 2, ys[cx] + 22, 5, 5); bdGlow(x, cx + o, ys[cx] + 24, 18, '#ffb040', 0.5); }); }
      }, 'top'),
      bdLayer(170, 0.1, -18, (x, h) => {
        const ys = bdRidge(1102, 150, 4); bdFill(x, ys, h, '#1c120a'); bdWrap(o => {
          const gear = (cx, cy, rad) => { bdDisc(x, cx, cy, rad, '#2e2014'); bdDisc(x, cx, cy, rad - 4, '#20160e'); bdDisc(x, cx, cy, 3, '#3a2a1a'); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; x.fillStyle = '#2e2014'; x.fillRect(Math.round(cx + Math.cos(a) * (rad + 1)) - 2, Math.round(cy + Math.sin(a) * (rad + 1)) - 2, 4, 4); } };
          gear(90 + o, 90, 24); gear(124 + o, 112, 14);
          x.fillStyle = '#2a1c10'; x.fillRect(300 + o, 30, 6, 120); x.fillRect(300 + o, 30, 70, 5); for (let k = 0; k < 120; k += 10) { x.fillRect(300 + o, 30 + k, 6, 2); x.beginPath(); } x.fillRect(366 + o, 35, 1, 40); x.fillRect(360 + o, 75, 13, 8);
          bdTri(x, 440 + o, 150, 26, 80, '#2a1c10'); x.fillStyle = '#3a2a1a'; for (let k = 0; k < 80; k += 8) x.fillRect(440 + o - 1, 70 + k, 3, 4); bdTriDown(x, 440 + o, 150, 10, 14, '#4a3a2a');
        }); bdHaze(x, h, '#2e1c10', 0.35, 0.2);
      }),
      bdLayer(170, 0.26, 10, (x, h) => {
        for (let i = 0; i < 7; i++) { const cx = 20 + i * 74; bdWrap(o => { x.fillStyle = '#4a3018'; x.fillRect(cx + o - 16, 20, 4, h); x.fillRect(cx + o + 12, 20, 4, h); x.fillStyle = '#6a4424'; x.fillRect(cx + o - 20, 16, 40, 6); x.fillStyle = '#3a2410'; x.fillRect(cx + o - 20, 21, 40, 1); for (let k = 0; k < 3; k++) { x.strokeStyle = '#3a2410'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx + o - 14, 30 + k * 44); x.lineTo(cx + o + 12, 70 + k * 44); x.stroke(); } x.fillStyle = '#5a3a1e'; x.fillRect(cx + o + 16, 60, 58, 3); if (i % 2) for (let k = 0; k < 9; k++) x.fillRect(cx + o + 24 + 0, 64 + k * 10, 8, 1); }); }
        for (let px = 0; px < BD_W; px += 6) { x.fillStyle = '#5a3a1e'; x.fillRect(px, 118, 4, 2); } x.fillStyle = '#8a8a96'; x.fillRect(0, 116, BD_W, 1); x.fillRect(0, 119, BD_W, 1);
        bdWrap(o => { x.fillStyle = '#5a5a66'; x.fillRect(200 + o, 104, 22, 11); x.fillStyle = '#7a7a86'; x.fillRect(200 + o, 104, 22, 2); x.fillStyle = '#2a2a30'; x.fillRect(203 + o, 114, 4, 4); x.fillRect(215 + o, 114, 4, 4); x.fillStyle = '#ffd34e'; x.fillRect(204 + o, 101, 3, 3); x.fillRect(210 + o, 100, 4, 4); });
        bdHaze(x, h, '#2e1c10', 0.2, 0.05);
      }),
      bdLayer(170, 0.44, -8, (x, h) => {
        const ys = bdRidge(1104, 140, 5); bdFill(x, ys, h, '#2a1a0e', '#4a3018'); const r = mulberry32(84);
        for (let i = 0; i < 9; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { x.fillStyle = '#8a5a2a'; x.fillRect(cx + o, ys[cx] - 12, 12, 12); x.fillStyle = '#5a3a1a'; x.fillRect(cx + o, ys[cx] - 12, 12, 1); x.fillRect(cx + o, ys[cx] - 6, 12, 1); x.fillRect(cx + o + 5, ys[cx] - 12, 1, 12); }); }
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
const BACKDROP_SKY = { meadow: ['#3a86dc', '#64aef0', '#a6daff', '#e6f7ff'], forest: ['#5a7c72', '#86a898', '#b8d0c0', '#dfeadc'], caves: ['#04030c', '#0c0822', '#180f3a', '#22164a'], desert: ['#3a86d4', '#6ab2ea', '#c4e2f0', '#ffe6b0'], frost: ['#040a22', '#0c1a46', '#203e78', '#4a78b6'], volcano: ['#080303', '#240806', '#521608', '#a83c14'], swamp: ['#030a0a', '#08181a', '#10302c', '#1c4a40'], ocean: ['#2a7ab8', '#145a98', '#0a3a74', '#03183c'], tunnels: ['#040201', '#100806', '#20120a', '#2e1c10'], citadel: ['#0c0206', '#360610', '#760c18', '#c42818'] };
if (typeof BIOMES !== 'undefined') BIOMES.forEach(B => { if (BACKDROP_SKY[B.id]) B.sky = BACKDROP_SKY[B.id]; });
