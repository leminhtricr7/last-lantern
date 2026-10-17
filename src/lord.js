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
const LORD_CFG = { 0: { k: 1, pad: 8, o: { aura: true } } };
for (const id in LORD_CFG) {
  const c = LORD_CFG[id], W = Math.round((48 + 2 * c.pad) * c.k), H = Math.round((63 + 14) * c.k);
  FOE_PAINT['quoc' + id] = [W, H, P => lordPaint(sP(P, c.k, c.pad * c.k, 14 * c.k), c.o), '#0a0408'];
}
// ---- the seven monster forms of Quoc (reference sheet): imp, hellhound, chained demon, iron general, winged archdemon, ashen titan, eternal eclipse ----
FOE_PAINT.quoc1 = [36, 46, P => { // dark imp
  const D = '#2a2a3a', DL = '#4a4a5e', EY = '#ffb02a', CL = '#c07bff';
  P.line(8, 38, 2, 32, D, 3); P.tri(0, 30, 6, 31, 2, 24, '#7a4a9a');
  P.ell(18, 31, 7, 8, D); P.ell(18, 33, 4, 5, DL); P.rect(12, 37, 4, 7, D); P.rect(21, 37, 4, 7, D); P.rect(11, 43, 6, 2, '#14141c'); P.rect(20, 43, 6, 2, '#14141c');
  P.line(23, 27, 31, 25, D, 3); P.tri(30, 22, 35, 25, 30, 29, CL); P.tri(31, 28, 35, 30, 30, 31, CL); P.line(13, 28, 8, 34, D, 3);
  P.ell(18, 16, 9, 9, D); P.ell(18, 18, 6, 5, DL);
  P.tri(10, 13, 4, 6, 12, 9, D); P.tri(26, 13, 32, 6, 24, 9, D);
  for (let i = 0; i < 5; i++) P.tri(10 + i * 3, 9, 14 + i * 3, 9, 12 + i * 3, 1 + (i % 2) * 3, i % 2 ? '#14141c' : D);
  P.ell(14, 16, 2, 2, EY); P.ell(22, 16, 2, 2, EY); P.px(14, 15, '#fff'); P.px(22, 15, '#fff'); P.line(11, 12, 16, 14, 'k', 1); P.line(25, 12, 20, 14, 'k', 1);
  P.rect(14, 21, 9, 2, '#0a0a10'); for (let i = 0; i < 4; i++) P.px(15 + i * 2, 21, '#fff');
}, '#07070c'];
FOE_PAINT.quoc2 = [66, 42, P => { // hellhound
  const B = '#b8481a', BL = '#e07a30', FL = '#ff7a2a', FY = '#ffd34e';
  P.line(12, 22, 3, 11, FL, 4); P.tri(0, 9, 6, 12, 1, 2, FY); P.line(11, 22, 4, 14, FY, 2);
  P.ell(31, 25, 20, 9, B); P.ell(31, 29, 14, 4, BL);
  P.line(47, 29, 56, 38, B, 5); P.line(41, 30, 46, 39, B, 5); P.line(19, 29, 10, 38, B, 5); P.line(25, 30, 26, 40, B, 5);
  for (const [x, y] of [[55, 38], [45, 39], [9, 38], [25, 40]]) P.rect(x - 2, y, 6, 3, '#3a1408');
  P.ell(53, 17, 9, 7, B); P.rect(58, 17, 8, 6, B); P.rect(58, 20, 8, 3, '#2a0a0a'); for (let i = 0; i < 4; i++) P.tri(59 + i * 2, 20, 61 + i * 2, 20, 60 + i * 2, 24, '#fff');
  P.tri(48, 11, 51, 11, 49, 3, B); P.tri(54, 11, 57, 11, 56, 4, B); P.px(55, 15, FY); P.px(56, 15, 'k');
  for (let i = 0; i < 8; i++) P.tri(22 + i * 4, 18, 27 + i * 4, 18, 24 + i * 4, 5 - (i % 3) * 2, i % 2 ? FY : FL);
}, '#1a0a04'];
FOE_PAINT.quoc3 = [54, 70, P => { // chained demon
  const SK = '#4a4458', SL = '#6a6478', CH = '#a8b2c8', HN = '#e8e0c0';
  P.rect(16, 50, 10, 16, SK); P.rect(30, 50, 10, 16, SK); P.rect(13, 64, 14, 5, '#2a2430'); P.rect(29, 64, 14, 5, '#2a2430'); P.tri(28, 46, 17, 60, 39, 60, '#6a4a2a');
  P.ell(28, 36, 17, 15, SK); P.ell(28, 40, 11, 8, SL);
  P.both(() => { P.ell(9, 36, 7, 11, SK); P.ell(7, 51, 7, 7, SL); P.rect(1, 44, 9, 3, CH); P.line(3, 47, 0, 66, CH, 1); });
  P.line(14, 28, 40, 46, CH, 2); P.line(42, 28, 16, 46, CH, 2); for (let i = 0; i < 6; i++) P.px(16 + i * 4, 31 + i * 3, '#fff'); P.rect(26, 36, 4, 4, '#ffd34e');
  P.ell(28, 18, 10, 9, SK); P.ell(28, 20, 7, 6, SL);
  P.both(() => { P.tri(20, 12, 24, 10, 8, 0, HN); P.tri(14, 5, 18, 6, 6, -1 + 1, '#b0a888'); P.ell(23, 17, 2, 2, '#ffb02a'); P.px(23, 17, 'k'); P.line(19, 14, 25, 16, 'k', 1); });
  P.rect(22, 22, 12, 4, 'k'); P.tri(23, 22, 25, 22, 24, 26, '#fff'); P.tri(31, 22, 33, 22, 32, 26, '#fff');
}, '#0e0a14'];
FOE_PAINT.quoc4 = [60, 74, P => { // iron general
  const AR = '#2c303c', AL = '#5a6272', AD = '#14161e', OR = '#ff8a2a';
  P.rect(20, 50, 9, 20, AR); P.rect(32, 50, 9, 20, AR); P.rect(19, 68, 11, 6, AD); P.rect(31, 68, 11, 6, AD); P.rect(19, 56, 11, 3, AL); P.rect(31, 56, 11, 3, AL); P.tri(19, 56, 22, 56, 17, 52, AL);
  P.rect(16, 26, 30, 25, AR); P.rect(18, 28, 26, 20, AL); P.rect(18, 28, 26, 1, '#8a92a8'); P.rect(29, 34, 4, 10, OR); P.rect(16, 48, 30, 4, AD); P.rect(29, 48, 4, 4, '#ffd34e');
  P.both(() => { P.ell(14, 28, 9, 7, AR); P.ell(14, 26, 7, 4, AL); P.tri(8, 24, 13, 21, 5, 11, '#aab4c8'); P.tri(16, 22, 20, 22, 18, 13, '#8a92a8'); });
  P.ell(31, 17, 9, 9, AR); P.rect(24, 14, 14, 5, AD); P.rect(25, 15, 12, 2, OR); P.rect(26, 21, 10, 5, AD); P.both(() => { P.tri(23, 10, 26, 9, 17, -1 + 1, AL); });
  P.tri(2, 30, 17, 30, 10, 64, AL); P.tri(4, 32, 15, 32, 10, 58, AR); P.rect(9, 36, 2, 16, OR);
  P.line(47, 34, 56, 66, '#aab4c8', 5); P.line(47, 34, 56, 66, '#e8eef8', 2); P.rect(42, 32, 12, 3, AL); P.rect(46, 30, 4, 7, '#5a3a22');
}, '#07080c'];
FOE_PAINT.quoc5 = [80, 68, P => { // winged archdemon
  const B = '#5a3a48', BL = '#7a5468', WG = '#6a4458', WD = '#3a2230', EY = '#ffb02a';
  P.both(() => { P.tri(38, 34, 2, 6, 8, 50, WG); P.tri(38, 38, 16, 18, 22, 60, BL); P.tri(34, 42, 6, 40, 14, 64, WG); P.line(38, 34, 2, 6, WD, 3); P.line(36, 38, 8, 50, WD, 2); P.line(36, 42, 14, 64, WD, 2); P.px(14, 30, '#14080e'); P.px(22, 44, '#14080e'); P.px(10, 46, '#14080e'); });
  P.line(34, 58, 14, 62, B, 3); P.tri(10, 58, 17, 60, 12, 66, '#ff6a3a');
  P.ell(41, 46, 11, 13, B); P.ell(43, 48, 6, 8, BL); P.rect(34, 56, 6, 9, B); P.rect(43, 56, 6, 9, B); P.rect(32, 63, 9, 3, '#2a1620'); P.rect(42, 63, 9, 3, '#2a1620');
  P.line(50, 42, 62, 50, B, 4); P.tri(60, 47, 68, 51, 61, 56, '#ff9a2a'); P.tri(64, 50, 70, 54, 62, 57, '#ff6a3a'); P.line(33, 44, 26, 52, B, 4);
  P.ell(42, 30, 8, 8, B); P.tri(38, 24, 36, 18, 41, 22, '#2a1620'); P.tri(46, 24, 48, 18, 44, 22, '#2a1620'); P.ell(45, 29, 2, 2, EY); P.ell(39, 29, 2, 2, EY); P.px(45, 29, 'k'); P.rect(40, 34, 6, 2, 'k'); P.px(41, 34, '#fff'); P.px(44, 34, '#fff');
}, '#0c0610'];
FOE_PAINT.quoc6 = [82, 94, P => { // ashen titan
  const RK = '#6a6a74', RL = '#8a8a96', RD = '#3a3a44', LV = '#ff6a3a', LY = '#ffd34e';
  P.rect(24, 70, 15, 18, RK); P.rect(44, 70, 15, 18, RK); P.rect(22, 86, 19, 7, RD); P.rect(42, 86, 19, 7, RD); P.line(30, 72, 32, 86, LV, 1); P.line(52, 72, 50, 86, LV, 1);
  P.ell(41, 50, 24, 24, RK); P.ell(41, 46, 19, 16, RL); P.line(30, 36, 38, 60, LV, 2); P.line(54, 36, 48, 64, LV, 2); P.line(32, 64, 54, 58, LY, 1); P.rect(37, 46, 10, 8, LV); P.rect(39, 48, 6, 4, LY);
  P.both(() => { P.ell(14, 44, 13, 12, RK); P.ell(14, 40, 10, 7, RL); P.tri(7, 34, 12, 30, 5, 20, RD); P.rect(2, 52, 14, 24, RK); P.ell(8, 78, 10, 8, RL); P.line(7, 54, 6, 74, LV, 1); P.line(4, 78, 12, 76, LV, 1); });
  P.ell(41, 25, 12, 11, RK); P.ell(41, 23, 9, 7, RL); P.both(() => { P.ell(36, 22, 3, 2, 'k'); P.ell(36, 22, 2, 1, LY); }); P.rect(35, 30, 12, 3, 'k'); for (let i = 0; i < 4; i++) P.px(36 + i * 3, 30, LY); P.line(41, 14, 41, 20, LV, 1); P.tri(32, 17, 36, 17, 31, 9, RD); P.tri(46, 17, 50, 17, 51, 9, RD);
}, '#14080a'];
FOE_PAINT.quoc7 = [66, 108, P => { // eternal eclipse
  const NV = '#0e1230', NL = '#2a3a8a', BL = '#6a9aff', GL = '#cfe8ff';
  P.ell(33, 22, 22, 22, '#2a0f5a'); P.ell(33, 22, 20, 20, '#b88aff'); P.ell(33, 22, 17, 17, '#050309');
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; P.line(33 + Math.cos(a) * 22, 22 + Math.sin(a) * 22, 33 + Math.cos(a) * 31, 22 + Math.sin(a) * 31, i % 2 ? '#d58bff' : '#ffffff', 1); }
  P.ell(33, 50, 7, 8, NV); P.ell(33, 50, 5, 6, NL); P.px(31, 49, GL); P.px(35, 49, GL);
  P.ell(33, 70, 10, 15, NV); P.ell(33, 70, 8, 13, NL); P.ell(33, 67, 4, 4, GL); P.ell(33, 67, 2, 2, '#fff');
  P.line(24, 60, 8, 74, NV, 6); P.line(42, 60, 58, 70, NV, 6); P.line(24, 60, 8, 74, BL, 2); P.line(42, 60, 58, 70, BL, 2); P.ell(8, 76, 4, 4, GL); P.ell(59, 71, 4, 4, '#d58bff');
  P.line(29, 84, 24, 104, NV, 6); P.line(37, 84, 42, 104, NV, 6); P.line(29, 84, 24, 104, BL, 2); P.line(37, 84, 42, 104, BL, 2);
  P.poly([[33, 56], [28, 64], [36, 68], [30, 78]], GL, 1); P.px(14, 66, GL); P.px(52, 64, GL); P.px(20, 90, BL); P.px(46, 92, BL);
}, '#6a4aff'];
// cutscene portrait: the lord's bust, bigger than the screen (cropped at the waist)
function devilSprite(roar) {
  const key = roar ? 'devil_roar' : 'devil_lord';
  if (_cache[key]) return _cache[key];
  return (_cache[key] = paint(150, 128, P => lordPaint(sP(P, 2.7, 10, 30), roar ? { aura: true, flames: true, roar: true } : { aura: true }), '#0a0408'));
}
// small dialogue portrait (head and crown)
NPC_PAINT.npc_quoc = [24, 26, P => lordPaint(sP(P, 0.8, -7, 9), { roar: false })];
