'use strict';
// ============ QUOC, THE DARK LORD: spiked bone crown, black spiked armour, ragged cape, glowing red eyes ============
// Reference: five poses (standing / smirking in red aura / greatsword / dark orb / roaring in flames).
// One painter, many options -> the 7 boss forms, the cutscene portrait and the small dialogue portrait.
function sP(P, k, ox, oy) {
  const rx = v => Math.round(v * k + ox), ry = v => Math.round(v * k + oy), m = v => Math.max(1, Math.round(v * k));
  return {
    px: (a, b, c) => P.rect(rx(a), ry(b), m(1), m(1), c), rect: (a, b, w, h, c) => P.rect(rx(a), ry(b), m(w), m(h), c),
    ell: (cx, cy, rx2, ry2, c) => P.ell(rx(cx), ry(cy), m(rx2), m(ry2), c),
    tri: (a, b, c, d, e, f, col) => P.tri(rx(a), ry(b), rx(c), ry(d), rx(e), ry(f), col),
    line: (a, b, c, d, col, t) => P.line(rx(a), ry(b), rx(c), ry(d), col, t ? m(t) : 1),
    poly: (pts, col, t) => P.poly(pts.map(p => [rx(p[0]), ry(p[1])]), col, t ? m(t) : 1),
    both: f => P.both(f)
  };
}
function lordPaint(P, o) {
  o = o || {};
  const AR = o.ar || '#2a2a34', AL = o.al || '#454556', AD = '#17171f', BN = o.bone || '#cfc4b0', BN2 = o.bone2 || '#8a8070';
  const RED = o.eye || '#ff3a2a', SK = o.skin || '#e8c8b8', SK2 = o.skin2 || '#c0988a', HR = o.hair || '#1c1820', CP = o.cape || '#2a1820', CP2 = o.cape2 || '#5a2a2a', LT = '#4a3a32';
  // eclipse halo (final form)
  if (o.halo) { P.ell(24, 12, 17, 17, '#0a0612'); P.ell(24, 12, 14, 14, o.halo); P.ell(24, 12, 12, 12, '#0a0612'); for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; P.line(24 + Math.cos(a) * 15, 12 + Math.sin(a) * 15, 24 + Math.cos(a) * 22, 12 + Math.sin(a) * 22, i % 2 ? o.halo : '#ffffff', 1); } }
  // flames / aura behind the body
  if (o.aura) for (let i = 0; i < 11; i++) { const x0 = 4 + i * 4; P.tri(x0, 56, x0 + 5, 56, x0 + 2, 22 + (i % 4) * 7 - Math.abs(5 - i) * 2, i % 2 ? 'rgba(200,24,24,.75)' : 'rgba(255,70,40,.7)'); }
  // ragged cape
  P.tri(24, 22, 0, 60, 20, 60, CP); P.tri(24, 22, 48, 60, 28, 60, CP); P.tri(24, 26, 6, 58, 20, 58, CP2); P.tri(24, 26, 42, 58, 28, 58, CP2);
  for (let i = 0; i < 4; i++) { P.tri(2 + i * 4, 56, 6 + i * 4, 56, 4 + i * 4, 61, CP); P.tri(34 + i * 4, 56, 38 + i * 4, 56, 36 + i * 4, 61, CP); }
  // legs and boots
  P.rect(15, 40, 7, 17, AR); P.rect(26, 40, 7, 17, AR); P.rect(14, 46, 9, 4, AL); P.rect(25, 46, 9, 4, AL); P.rect(13, 56, 10, 5, AD); P.rect(25, 56, 10, 5, AD); P.rect(12, 59, 4, 2, AD); P.rect(32, 59, 4, 2, AD);
  P.rect(15, 40, 1, 14, AL); P.rect(26, 40, 1, 14, AL);
  // tasset + belt with a skull buckle
  P.tri(24, 37, 11, 52, 37, 52, '#5a2a2a'); P.tri(24, 39, 16, 51, 32, 51, '#3a1a1a'); P.rect(14, 35, 20, 3, LT); P.rect(22, 34, 4, 5, BN); P.px(23, 36, AD); P.px(25, 36, AD);
  // torso plate
  P.rect(14, 22, 20, 14, AR); P.rect(16, 23, 16, 11, AL); P.rect(16, 23, 16, 1, '#6a6a80'); P.rect(23, 23, 2, 12, BN); P.tri(24, 24, 20, 30, 28, 30, BN); P.px(24, 28, RED); P.rect(17, 31, 5, 1, AD); P.rect(26, 31, 5, 1, AD); P.line(16, 26, 21, 26, AD, 1); P.line(27, 26, 32, 26, AD, 1);
  // arms, gauntlets, fists
  P.both(() => { P.rect(5, 26, 6, 12, AR); P.rect(5, 26, 1, 12, AL); P.rect(4, 36, 8, 5, AD); P.rect(4, 36, 8, 1, AL); P.rect(4, 41, 8, 5, AD); P.px(5, 44, '#6a6a80'); });
  // spiked pauldrons
  P.both(() => { P.ell(10, 24, 8, 6, AR); P.ell(10, 22, 6, 3, AL); P.tri(5, 22, 10, 19, 3, 9, BN); P.tri(11, 19, 16, 20, 13, 10, BN2); P.tri(6, 28, 3, 26, 1, 31, BN2); });
  // neck + collar spikes
  P.rect(20, 18, 8, 5, AD); P.tri(18, 22, 22, 22, 17, 15, AR); P.tri(30, 22, 26, 22, 31, 15, AR);
  // head
  P.ell(24, 12, 7, 8, SK); P.ell(24, 16, 5, 4, SK2); P.rect(17, 12, 1, 4, SK2); P.rect(31, 12, 1, 4, SK2);
  P.ell(24, 5, 8, 4, HR); P.rect(15, 6, 3, 9, HR); P.rect(31, 6, 3, 9, HR); P.tri(17, 7, 24, 5, 22, 11, HR); P.tri(31, 7, 24, 5, 26, 11, HR); P.px(22, 4, AL);
  // glowing eyes + scowl
  P.rect(19, 11, 4, 2, RED); P.rect(26, 11, 4, 2, RED); P.px(20, 11, '#ffc0b0'); P.px(27, 11, '#ffc0b0'); P.line(18, 9, 23, 11, '#0a0a10', 1); P.line(31, 9, 26, 11, '#0a0a10', 1);
  if (o.roar) { P.rect(20, 15, 9, 5, '#2a0808'); for (let i = 0; i < 4; i++) { P.px(21 + i * 2, 15, '#fff'); P.px(21 + i * 2, 19, '#fff'); } P.rect(22, 17, 5, 2, '#a01818'); }
  else { P.rect(21, 17, 7, 1, '#8a2a2a'); P.px(28, 16, '#8a2a2a'); P.px(22, 18, '#fff'); P.px(26, 18, '#fff'); }
  // spiked bone crown
  P.rect(16, 3, 17, 3, BN); P.rect(16, 5, 17, 1, BN2); [[16, 7], [19.5, 10], [23, 14], [26.5, 10], [30, 7]].forEach(c => P.tri(c[0], 3, c[0] + 3, 3, c[0] + 1.5, 3 - c[1], BN)); P.px(24, 4, RED);
  if (o.horns) P.both(() => { P.tri(15, 3, 18, 3, 8, -8, BN); P.tri(12, -4, 15, -3, 6, -12, BN2); });
  // greatsword in the right hand
  if (o.sword) { P.rect(40, 36, 5, 9, LT); P.rect(37, 34, 11, 3, BN); P.px(42, 35, RED); P.line(42, 34, 63, 6, '#8d9bbd', 5); P.line(42, 34, 63, 6, '#e8eef8', 2); P.line(44, 31, 66, 3, '#5a5a70', 1); P.tri(63, 6, 66, 3, 67, 0, '#fff'); for (let i = 0; i < 6; i++) P.px(46 + i * 3, 29 - i * 4, '#ff6a3a'); }
  // dark orb with lightning in the raised left hand
  if (o.orb) { P.ell(4, 28, 6, 6, '#8a1018'); P.ell(4, 28, 4, 4, '#ff3a2a'); P.ell(4, 28, 2, 2, '#1a0408'); P.px(2, 26, '#ffc0b0'); P.poly([[-2, 18], [3, 22], [0, 24], [5, 30]], '#ffe0c0', 1); P.poly([[10, 20], [6, 25], [9, 26]], '#ffe0c0', 1); }
  // wisps of fire around the fists
  if (o.flames) { P.both(() => { for (let i = 0; i < 5; i++) P.tri(2 + i * 2, 46, 5 + i * 2, 46, 3 + i * 2, 36 - (i % 2) * 6, i % 2 ? '#ff9a2a' : '#ff3a2a'); }); }
}
const LORD_CFG = {
  1: { k: 1, pad: 4, o: {} },
  2: { k: 1, pad: 6, o: { aura: true } },
  3: { k: 1, pad: 14, o: { sword: true } },
  4: { k: 1, pad: 10, o: { orb: true } },
  5: { k: 1, pad: 8, o: { aura: true, flames: true, roar: true } },
  6: { k: 1.35, pad: 6, o: { aura: true, horns: true, flames: true, ar: '#3a2a2a', al: '#6a4a40', eye: '#ffd34e', cape: '#3a1810', cape2: '#7a3a20' } },
  7: { k: 1.6, pad: 6, o: { halo: '#b88aff', ar: '#14101e', al: '#2f2748', bone: '#d58bff', bone2: '#8a5ad0', eye: '#e8d0ff', skin: '#8a7ea8', skin2: '#5a4e78', hair: '#f0e8ff', cape: '#0a0612', cape2: '#2a1a40', horns: true, aura: true } }
};
for (const id in LORD_CFG) {
  const c = LORD_CFG[id], W = Math.round((48 + 2 * c.pad) * c.k), H = Math.round((63 + 14) * c.k);
  FOE_PAINT['quoc' + id] = [W, H, P => lordPaint(sP(P, c.k, c.pad * c.k, 14 * c.k), c.o), '#0a0408'];
}
// cutscene portrait: the lord's bust, bigger than the screen (cropped at the waist)
function devilSprite(roar) {
  const key = roar ? 'devil_roar' : 'devil_lord';
  if (_cache[key]) return _cache[key];
  return (_cache[key] = paint(150, 128, P => lordPaint(sP(P, 2.7, 10, 30), roar ? { aura: true, flames: true, roar: true } : { aura: true }), '#0a0408'));
}
// small dialogue portrait (head and crown)
NPC_PAINT.npc_quoc = [24, 26, P => lordPaint(sP(P, 1, -12, 13), { roar: false })];
