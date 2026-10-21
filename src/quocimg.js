'use strict';
// ============ QUOC'S FORMS FROM THE ARTIST'S REFERENCE SHEETS ============
// Frames cut by tools/cut_quoc.py from assets/ref/*.webp into assets/quoc/formN.png (cells side by side, feet on the bottom).
// Until an image has loaded, the game falls back to the code-painted sprites in lord.js.
const QUOC_SHEETS = { form0: { cw: 84, ch: 80, n: 5 }, form1: { cw: 50, ch: 49, n: 6 }, form2: { cw: 104, ch: 50, n: 5 }, form3: { cw: 107, ch: 74, n: 5 }, form4: { cw: 78, ch: 78, n: 5 }, form5: { cw: 118, ch: 73, n: 5 }, form6: { cw: 115, ch: 103, n: 5 }, form7: { cw: 160, ch: 110, n: 5 } };
const QUOC_IMG = {};
function imgSprite(img, sx, sy, w, h) {
  const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const c = mk(); c.getContext('2d').drawImage(img, sx, sy, w, h, 0, 0, w, h);
  const f = mk(), fx = f.getContext('2d'); fx.translate(w, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
  const white = s => { const q = mk(), qx = q.getContext('2d'); qx.drawImage(s, 0, 0); qx.globalCompositeOperation = 'source-atop'; qx.fillStyle = '#fff'; qx.fillRect(0, 0, w, h); return q; };
  return { c, f, cw: white(c), fw: white(f), w, h };
}
function loadQuocArt() {
  for (const k in QUOC_SHEETS) {
    const m = QUOC_SHEETS[k], img = new Image();
    QUOC_IMG[k] = { ready: false, frames: [] };
    img.onload = () => { for (let i = 0; i < m.n; i++) QUOC_IMG[k].frames.push(imgSprite(img, i * m.cw, 0, m.cw, m.ch)); QUOC_IMG[k].ready = true; };
    img.src = 'assets/quoc/' + k + '.png';
  }
  for (const k of ['portrait_smirk', 'portrait_roar', 'face']) {
    const img = new Image();
    img.onload = () => {
      const s = imgSprite(img, 0, 0, img.width, img.height);
      QUOC_IMG[k] = s;
      if (k === 'face') _cache.np_npc_quoc = s;   // dialogue portrait
    };
    img.src = 'assets/quoc/' + k + '.png';
  }
}
loadQuocArt();
// cutscene bust: the artist's Quoc (smirking, or roaring when he shouts)
{
  const painted = devilSprite;
  devilSprite = function (roar) { const s = QUOC_IMG[roar ? 'portrait_roar' : 'portrait_smirk']; return s || painted(roar); };
}

// Morvella, Oktavor and Vorgrub from the artist's sheet (cut by tools/cut_bosses.py), keyed by map index
const BOSS_IMG = {};
(function () {
  const L = { 7: 'sporequeen', 8: 'kraken', 9: 'gravemaw' };
  for (const k in L) { const img = new Image(); img.onload = () => { BOSS_IMG[k] = imgSprite(img, 0, 0, img.width, img.height); }; img.src = 'assets/bosses/' + L[k] + '.png'; }
})();
