'use strict';
// ============ NEW CHARACTERS: Mr Shorty (human + monster), Mr Sy (human + monster), Quoc's 7 forms, the four helpers ============
// All sprites face RIGHT. boss sprites: formSprite(id); small NPC portraits are registered in NPC_PAINT.
const FOE_PAINT = {};
const FOE_SIZE = {};
function formSprite(id) {
  const k = 'foe_' + id; if (_cache[k]) return _cache[k];
  const d = FOE_PAINT[id];
  return (_cache[k] = paint(d[0], d[1], d[2], d[3] || null));
}

// ---------------- Mr Shorty Phong ----------------
FOE_PAINT.shorty_h = [34, 48, P => {
  const HAT = '#1a1626', PUR = '#4a1a6a', PUL = '#7a3aa8';
  P.rect(11, 0, 13, 13, HAT); P.rect(11, 9, 13, 3, '#8a2aa8'); P.rect(13, 1, 2, 8, '#3a3050'); P.rect(7, 13, 21, 2, HAT);
  P.ell(17, 21, 7, 7, '#f2c394'); P.px(14, 20, 'k'); P.rect(19, 18, 4, 4, '#ffd34e'); P.rect(20, 19, 2, 2, '#e8f6ff'); P.px(21, 20, 'k'); P.line(23, 22, 27, 30, '#ffd34e', 1);
  P.rect(11, 25, 5, 1, 'k'); P.rect(18, 25, 5, 1, 'k'); P.px(10, 24, 'k'); P.px(24, 24, 'k'); P.rect(15, 27, 4, 1, '#a02a2a');
  P.tri(17, 29, 5, 47, 29, 47, PUR); P.rect(10, 29, 15, 16, PUR); P.rect(15, 29, 5, 14, '#f6f3e9'); P.rect(14, 29, 3, 2, '#e0453a'); P.rect(19, 29, 3, 2, '#e0453a'); P.rect(16, 33, 1, 1, '#ffd34e'); P.rect(16, 37, 1, 1, '#ffd34e');
  P.rect(6, 30, 4, 12, PUR); P.rect(24, 30, 4, 12, PUR); P.rect(6, 41, 4, 3, '#f6f3e9'); P.rect(24, 41, 4, 3, '#f6f3e9'); P.rect(10, 29, 1, 14, PUL);
  P.rect(29, 24, 2, 24, '#5a3a22'); P.ell(30, 23, 3, 3, '#ffd34e'); P.px(30, 23, '#e0453a');
  P.rect(11, 44, 5, 4, 'k'); P.rect(18, 44, 5, 4, 'k');
}, '#0a0612'];
FOE_PAINT.shorty_m = [60, 70, P => {
  const SK = '#7a5aa0', SD = '#4a3470', HAT = '#1a1626', TORN = '#4a1a6a';
  P.both(() => { P.line(16, 40, 4, 60, SK, 6); P.line(4, 60, 3, 66, SK, 4); P.tri(2, 64, 6, 64, 3, 70, '#e8e0f0'); P.tri(5, 66, 9, 65, 7, 70, '#e8e0f0'); P.ell(17, 38, 8, 6, TORN); });
  P.ell(30, 50, 17, 18, TORN); P.ell(30, 48, 14, 14, SD); P.ell(30, 54, 10, 8, 'k'); for (let i = 0; i < 6; i++) { P.tri(21 + i * 3, 50, 24 + i * 3, 50, 22 + i * 3, 55, '#fff'); P.tri(21 + i * 3, 61, 24 + i * 3, 61, 22 + i * 3, 56, '#fff'); } P.ell(30, 55, 3, 2, '#ff3a5a');
  P.both(() => { P.tri(20, 14, 26, 18, 8, 2, HAT); P.tri(10, 6, 16, 8, 2, 0, '#8a2aa8'); });
  P.rect(19, 0, 22, 17, HAT); P.rect(19, 12, 22, 3, '#c030e0'); P.rect(21, 1, 3, 10, '#3a3050'); P.tri(19, 0, 25, 0, 22, -2 + 2, HAT); P.rect(14, 17, 32, 3, HAT);
  P.ell(30, 29, 14, 12, SK); P.ell(34, 32, 9, 8, SD); P.both(() => { P.ell(23, 26, 4, 3, 'k'); P.ell(23, 26, 3, 2, '#ffe033'); P.px(23, 26, 'k'); P.line(18, 21, 27, 24, 'k', 2); });
  P.rect(40, 22, 7, 7, '#ffd34e'); P.rect(41, 23, 5, 5, '#d8f0ff'); P.px(43, 25, 'k'); P.line(46, 28, 50, 38, '#ffd34e', 1);
  P.rect(17, 33, 26, 8, 'k'); for (let i = 0; i < 8; i++) { P.tri(18 + i * 3, 33, 21 + i * 3, 33, 19 + i * 3, 38, '#fff'); P.tri(19 + i * 3, 41, 22 + i * 3, 41, 20 + i * 3, 37, '#e8e0f0'); }
  P.rect(54, 14, 3, 56, '#5a3a22'); P.tri(54, 14, 54, 2, 38, 8, '#cfd6e6'); P.tri(54, 12, 54, 6, 44, 9, '#fff');
  P.rect(18, 64, 8, 6, 'k'); P.rect(34, 64, 8, 6, 'k');
}, '#0a0612'];

// ---------------- Mr Sy ----------------
FOE_PAINT.sy_h = [34, 54, P => {
  const COAT = '#1c4a30', COL = '#2f7a4a', HAT = '#10100c';
  P.ell(17, 5, 15, 3, HAT); P.rect(10, 0, 14, 6, HAT); P.rect(10, 4, 14, 2, '#7ed957');
  P.ell(17, 15, 6, 7, '#d8d0b0'); P.tri(21, 13, 21, 21, 31, 20, '#d8d0b0'); P.tri(21, 14, 21, 18, 28, 19, '#b8b090'); P.px(16, 12, '#ff3aff'); P.px(17, 12, '#fff'); P.rect(13, 12, 8, 1, 'k');
  P.rect(8, 22, 18, 3, COL); P.tri(17, 24, 3, 53, 31, 53, COAT); P.rect(10, 24, 14, 22, COAT); P.rect(10, 24, 2, 22, COL);
  for (let i = 0; i < 4; i++) { P.rect(12 + i * 3, 30, 2, 5, '#7ed957'); P.rect(12 + i * 3, 29, 2, 1, '#e8e0c0'); }
  P.line(11, 28, 24, 40, '#5a3a22', 1);
  P.rect(6, 26, 4, 14, COAT); P.rect(24, 26, 4, 14, COAT); P.rect(5, 39, 5, 3, '#d8d0b0'); P.rect(24, 39, 5, 3, '#d8d0b0');
  P.rect(29, 14, 2, 38, '#5a3a22'); P.ell(30, 12, 4, 4, '#2a2a2a'); P.ell(30, 12, 3, 3, '#9fff5a'); P.px(30, 11, '#fff');
  P.rect(11, 49, 5, 5, HAT); P.rect(18, 49, 5, 5, HAT);
}, '#04100a'];
FOE_PAINT.sy_m = [72, 64, P => {
  const SC = '#2f9a50', SD = '#1c5a30', BE = '#e8e0c0';
  for (let i = 0; i < 4; i++) P.ell(34 + (i % 2 ? 6 : -6), 54 - i * 1, 24 - i * 3, 8 - i, i % 2 ? SD : SC);
  P.ell(36, 56, 30, 8, SC); P.ell(36, 58, 24, 5, SD); for (let i = 0; i < 12; i++) P.px(10 + i * 5, 54 + (i % 2) * 3, '#7ed957');
  P.rect(26, 28, 22, 26, SC); P.rect(26, 28, 3, 26, '#4fc86a'); P.rect(28, 36, 18, 3, SD); P.rect(28, 44, 18, 3, SD);
  P.both(() => { P.tri(18, 14, 2, 28, 22, 44, '#1c8a40'); P.tri(18, 16, 6, 28, 22, 40, '#7ed957'); P.ell(12, 28, 3, 4, '#ff3aff'); P.ell(12, 28, 1, 2, 'k'); });
  P.ell(37, 22, 10, 11, SC); P.rect(33, 16, 12, 3, SD); P.ell(33, 21, 3, 3, '#ffe033'); P.ell(41, 21, 3, 3, '#ffe033'); P.px(33, 21, 'k'); P.px(41, 21, 'k');
  P.rect(34, 27, 8, 5, 'k'); P.tri(34, 28, 36, 28, 35, 34, '#fff'); P.tri(40, 28, 42, 28, 41, 34, '#fff'); P.ell(37, 31, 2, 2, '#ff3a5a');
  P.tri(37, 6, 28, 18, 46, 18, '#10100c'); P.rect(26, 12, 22, 3, '#10100c'); P.rect(28, 5, 18, 8, '#10100c'); P.rect(28, 10, 18, 2, '#7ed957');
  P.both(() => { P.line(24, 34, 12, 44, SC, 5); P.ell(10, 46, 5, 5, '#2a2a2a'); P.ell(10, 46, 4, 4, '#9fff5a'); P.px(9, 45, '#fff'); P.line(24, 40, 14, 56, SC, 4); });
  P.rect(62, 18, 3, 40, '#5a3a22'); P.ell(63, 14, 6, 6, '#2a2a2a'); P.ell(63, 14, 5, 5, '#9fff5a'); P.px(62, 12, '#fff');
  P.tri(30, 58, 24, 62, 36, 62, 'k');
}, '#04100a'];

// ---------------- Quoc, seven forms (weak -> strong) ----------------
FOE_PAINT.quoc1 = [26, 34, P => { // shadow imp
  const R = '#d03a30', RD = '#8e2335';
  P.line(6, 28, 1, 24, RD, 2); P.tri(0, 22, 4, 24, 0, 18, R);
  P.ell(13, 24, 7, 7, R); P.ell(13, 25, 4, 4, '#ffb090'); P.rect(8, 29, 3, 4, RD); P.rect(15, 29, 3, 4, RD);
  P.ell(13, 11, 8, 8, R); P.both(() => { P.tri(7, 6, 10, 4, 4, -1 + 1, '#e8e0c0'); P.tri(6, 14, 4, 12, 0, 16, R); P.ell(9, 11, 2, 2, '#ffe033'); P.px(9, 11, 'k'); });
  P.rect(8, 16, 10, 3, 'k'); for (let i = 0; i < 4; i++) P.tri(9 + i * 2, 16, 11 + i * 2, 16, 10 + i * 2, 19, '#fff'); P.tri(10, 1, 13, 5, 16, 1, '#ff9a2a');
}, '#1a0406'];
FOE_PAINT.quoc2 = [52, 34, P => { // hellhound
  const R = '#7a1a2a', RL = '#c03a30';
  P.line(8, 12, 1, 4, '#ff6a3a', 3); P.line(8, 14, 2, 10, '#ffd34e', 2); P.tri(1, 2, 5, 4, 0, -2 + 2, '#ffd34e');
  P.ell(24, 18, 17, 9, R); P.ell(24, 21, 12, 5, RL);
  P.rect(11, 22, 4, 11, R); P.rect(17, 24, 4, 9, R); P.rect(31, 24, 4, 9, R); P.rect(37, 22, 4, 11, R); P.rect(10, 31, 6, 3, 'k'); P.rect(16, 31, 6, 3, 'k'); P.rect(30, 31, 6, 3, 'k'); P.rect(36, 31, 6, 3, 'k');
  P.ell(40, 12, 8, 7, R); P.rect(44, 12, 7, 6, R); P.rect(44, 15, 7, 3, 'k'); for (let i = 0; i < 3; i++) P.tri(45 + i * 2, 15, 47 + i * 2, 15, 46 + i * 2, 19, '#fff');
  P.tri(37, 6, 41, 6, 38, -1 + 1, '#e8e0c0'); P.tri(42, 6, 46, 6, 45, 0, '#e8e0c0'); P.ell(42, 10, 2, 2, '#ffe033'); P.px(42, 10, 'k');
  for (let i = 0; i < 5; i++) P.tri(14 + i * 5, 10, 19 + i * 5, 10, 16 + i * 5, 3 - (i % 2) * 2, i % 2 ? '#ffd34e' : '#ff6a3a');
}, '#1a0406'];
FOE_PAINT.quoc3 = [40, 58, P => { // chain demon
  const R = '#c03a30', RD = '#7a1a2a';
  P.ell(20, 32, 11, 14, R); P.ell(20, 35, 7, 8, '#ff9a7a'); P.rect(11, 22, 18, 3, RD);
  P.both(() => { P.line(11, 24, 3, 38, R, 5); P.tri(1, 40, 6, 38, 2, 46, '#e8e0c0'); P.tri(5, 41, 9, 38, 7, 46, '#e8e0c0'); P.line(10, 28, 2, 18, '#8d9bbd', 2); for (let i = 0; i < 4; i++) P.ell(3 + i, 22 - i * 2, 1, 1, '#cfd6e6'); });
  P.rect(12, 42, 6, 14, RD); P.rect(22, 42, 6, 14, RD); P.rect(11, 54, 8, 4, 'k'); P.rect(21, 54, 8, 4, 'k');
  P.ell(20, 15, 9, 9, R); P.both(() => { P.line(13, 9, 5, 2, 'k', 4); P.line(5, 2, 2, -1 + 1, '#ffd34e', 2); P.ell(16, 14, 3, 2, 'k'); P.ell(16, 14, 2, 1, '#ffe033'); });
  P.rect(14, 19, 12, 4, 'k'); for (let i = 0; i < 5; i++) P.tri(15 + i * 2, 19, 17 + i * 2, 19, 16 + i * 2, 23, '#fff');
  P.line(10, 30, 30, 36, '#8d9bbd', 2); P.line(30, 30, 10, 36, '#8d9bbd', 2); P.ell(20, 33, 3, 3, '#ffd34e');
}, '#1a0406'];
FOE_PAINT.quoc4 = [52, 68, P => { // armoured warlord
  const AR = '#434d6e', AL = '#8d9bbd', R = '#c03a30';
  P.both(() => { P.ell(11, 30, 10, 9, AR); P.ell(11, 28, 8, 6, AL); P.tri(4, 24, 10, 20, 2, 6, '#cfd6e6'); P.tri(12, 22, 16, 22, 14, 10, '#cfd6e6'); P.rect(2, 34, 7, 14, AR); P.rect(1, 46, 9, 6, '#14121f'); });
  P.rect(14, 26, 24, 22, AR); P.rect(16, 28, 20, 18, AL); P.rect(24, 30, 4, 12, '#ff6a3a'); P.rect(25, 32, 2, 8, '#ffd34e'); P.rect(14, 46, 24, 4, '#ffd34e');
  P.rect(16, 50, 8, 15, AR); P.rect(28, 50, 8, 15, AR); P.rect(15, 63, 10, 5, '#14121f'); P.rect(27, 63, 10, 5, '#14121f');
  P.ell(26, 16, 11, 11, AR); P.rect(18, 12, 16, 8, '#14121f'); P.rect(20, 14, 5, 3, '#ffe033'); P.rect(27, 14, 5, 3, '#ffe033'); P.rect(21, 19, 10, 5, '#14121f'); for (let i = 0; i < 4; i++) P.rect(21 + i * 3, 19, 1, 3, '#fff');
  P.both(() => { P.line(18, 8, 8, -1 + 2, '#14121f', 5); P.line(8, 2, 4, 8, '#14121f', 3); P.line(18, 8, 9, 1, '#ffd34e', 1); });
  P.rect(45, 20, 4, 40, '#5a3a22'); P.tri(43, 20, 51, 20, 47, 0, '#cfd6e6'); P.tri(45, 20, 49, 20, 47, 5, '#fff'); P.rect(42, 26, 10, 3, '#ffd34e');
}, '#1a0406'];
FOE_PAINT.quoc5 = [70, 66, P => { // winged archdemon
  const R = '#a02030', RD = '#5a1020';
  P.both(() => { P.tri(30, 30, 2, 8, 6, 52, '#2a1230'); P.tri(30, 32, 12, 18, 18, 58, '#5a1a4a'); P.tri(28, 36, 6, 44, 16, 64, '#2a1230'); P.line(30, 30, 2, 8, 'k', 3); P.line(30, 34, 8, 46, 'k', 2); P.line(2, 8, 6, 52, '#ff6a3a', 1); });
  P.ell(35, 42, 13, 18, R); P.ell(35, 46, 8, 11, '#ff9a7a'); P.rect(32, 36, 6, 14, '#ff6a3a'); P.rect(34, 38, 2, 10, '#ffd34e');
  P.rect(28, 58, 5, 8, RD); P.rect(37, 58, 5, 8, RD); P.rect(27, 64, 7, 2, 'k'); P.rect(36, 64, 7, 2, 'k');
  P.both(() => { P.line(25, 34, 14, 48, R, 6); P.tri(10, 50, 16, 48, 11, 58, '#e8e0c0'); P.tri(15, 52, 20, 49, 17, 58, '#e8e0c0'); });
  P.ell(35, 24, 10, 10, R); P.both(() => { P.line(28, 17, 18, 6, '#e8e0c0', 4); P.line(18, 6, 15, 0, '#ffd34e', 2); P.line(30, 19, 23, 12, '#e8e0c0', 3); P.ell(31, 22, 3, 2, 'k'); P.ell(31, 22, 2, 1, '#ffe033'); });
  P.rect(30, 28, 10, 4, 'k'); for (let i = 0; i < 5; i++) P.tri(31 + i * 2, 28, 33 + i * 2, 28, 32 + i * 2, 32, '#fff');
  P.ell(35, 10, 14, 4, 'rgba(255,210,70,.0)'); P.rect(22, 8, 26, 2, '#ffd34e'); P.rect(24, 6, 22, 2, '#ff6a3a'); for (let i = 0; i < 5; i++) P.tri(24 + i * 5, 6, 28 + i * 5, 6, 26 + i * 5, 0, '#ffd34e');
}, '#1a0406'];
FOE_PAINT.quoc6 = [78, 90, P => { // titan of ash
  const RK = '#3a2a30', RL = '#5a4048', LV = '#ff6a3a', LY = '#ffd34e';
  P.both(() => { P.ell(14, 40, 14, 12, RK); P.ell(14, 36, 11, 8, RL); P.tri(6, 30, 12, 26, 4, 4, '#ff6a3a'); P.tri(14, 28, 18, 28, 16, 12, '#ffd34e'); P.rect(2, 46, 10, 26, RK); P.rect(0, 70, 14, 12, '#2a1a20'); P.line(8, 50, 6, 70, LV, 1); });
  P.rect(18, 36, 42, 38, RK); P.rect(20, 38, 38, 34, RL); P.line(26, 40, 34, 60, LV, 2); P.line(48, 40, 44, 66, LV, 2); P.line(30, 66, 50, 62, LY, 1); P.rect(34, 48, 10, 8, LV); P.rect(36, 50, 6, 4, LY);
  P.rect(22, 72, 14, 14, RK); P.rect(42, 72, 14, 14, RK); P.rect(20, 84, 18, 6, '#2a1a20'); P.rect(40, 84, 18, 6, '#2a1a20'); P.line(28, 74, 28, 86, LV, 1); P.line(48, 74, 50, 86, LV, 1);
  P.ell(39, 26, 15, 14, RK); P.ell(39, 24, 12, 10, RL); P.both(() => { P.ell(32, 22, 4, 3, 'k'); P.ell(32, 22, 3, 2, LY); P.px(32, 22, 'w'); P.tri(28, 12, 34, 14, 20, -1 + 1, '#2a1a20'); P.tri(22, 6, 28, 8, 14, 0, LV); });
  P.rect(30, 30, 18, 6, 'k'); for (let i = 0; i < 6; i++) P.tri(31 + i * 3, 30, 34 + i * 3, 30, 32 + i * 3, 35, LY); P.rect(32, 33, 14, 2, LV);
  P.tri(30, 10, 36, 10, 33, -2 + 2, LV); P.tri(37, 10, 43, 10, 40, -2 + 2, LY); P.tri(44, 10, 49, 10, 46, 2, LV);
  P.line(0, 76, 9, 70, LV, 1);
}, '#14080a'];
FOE_PAINT.quoc7 = [64, 100, P => { // the eternal eclipse
  P.ell(32, 26, 28, 28, '#1a0f2e'); P.ell(32, 26, 22, 22, '#7a4cff'); P.ell(32, 26, 18, 18, '#0a0612');
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; P.line(32 + Math.cos(a) * 20, 26 + Math.sin(a) * 20, 32 + Math.cos(a) * 30, 26 + Math.sin(a) * 30, i % 2 ? '#d58bff' : '#ffffff', 1); }
  P.both(() => { P.tri(20, 44, 2, 98, 18, 98, '#14101e'); P.tri(22, 44, 10, 98, 24, 98, '#2a1a40'); for (let i = 0; i < 6; i++) P.px(8 + i * 3, 56 + i * 7, '#fff'); });
  P.tri(32, 40, 14, 98, 50, 98, '#0a0612'); P.rect(22, 40, 20, 40, '#0a0612'); P.rect(26, 44, 12, 22, '#2a1a40'); P.ell(32, 54, 4, 4, '#d58bff'); P.ell(32, 54, 2, 2, '#fff');
  P.both(() => { P.line(22, 44, 8, 70, '#14101e', 6); P.tri(4, 70, 10, 70, 6, 82, '#d58bff'); P.tri(9, 70, 14, 70, 12, 80, '#d58bff'); });
  P.ell(32, 26, 11, 12, '#14101e'); P.both(() => { P.ell(27, 24, 3, 2, '#d58bff'); P.ell(27, 24, 1, 1, '#fff'); P.ell(27, 31, 2, 1, '#d58bff'); });
  P.ell(32, 17, 3, 2, '#ff3aff'); P.rect(27, 32, 10, 2, '#d58bff');
  for (let i = 0; i < 5; i++) P.tri(22 + i * 5, 14, 26 + i * 5, 14, 24 + i * 5, 4 - (i % 2) * 3, i % 2 ? '#fff' : '#d58bff');
}, '#d58bff'];

// ---------------- the four helpers + NPC portraits (registered in NPC_PAINT) ----------------
NPC_PAINT.npc_sy = [20, 28, P => {
  P.ell(10, 3, 9, 2, '#10100c'); P.rect(5, 0, 10, 4, '#10100c'); P.rect(5, 2, 10, 1, '#7ed957');
  P.ell(10, 9, 4, 5, '#d8d0b0'); P.tri(13, 8, 13, 13, 19, 12, '#d8d0b0'); P.px(9, 8, '#ff3aff'); P.rect(7, 8, 5, 1, 'k');
  P.tri(10, 14, 1, 27, 19, 27, '#1c4a30'); P.rect(5, 14, 10, 10, '#1c4a30'); P.rect(5, 14, 2, 10, '#2f7a4a'); for (let i = 0; i < 3; i++) P.rect(7 + i * 3, 17, 2, 3, '#7ed957');
  P.rect(3, 16, 3, 8, '#1c4a30'); P.rect(14, 16, 3, 8, '#1c4a30'); P.rect(17, 12, 1, 15, '#5a3a22'); P.ell(17, 11, 2, 2, '#9fff5a');
}];
NPC_PAINT.npc_quoc = [24, 26, P => {
  P.ell(12, 14, 9, 9, '#d03a30'); P.ell(15, 17, 5, 6, '#8e2335');
  P.both(() => { P.line(6, 8, 1, 1, '#14121f', 3); P.line(1, 2, 0, 0, '#ffd34e', 1); P.line(5, 12, 2, 12, '#d03a30', 2); P.ell(8, 12, 2, 1, '#ffe033'); P.px(8, 12, 'k'); P.line(5, 9, 10, 11, 'k', 1); });
  P.rect(6, 17, 12, 4, 'k'); for (let i = 0; i < 5; i++) P.tri(7 + i * 2, 17, 9 + i * 2, 17, 8 + i * 2, 20, '#fff');
  for (let i = 0; i < 4; i++) P.tri(7 + i * 4, 6, 10 + i * 4, 6, 8 + i * 4, 0, i % 2 ? '#ffd34e' : '#ff6a3a');
}];
NPC_PAINT.npc_hoang = [20, 28, P => { // HoangKiller: hooded assassin
  const D = '#1f1f2e', RED = '#e0453a';
  P.ell(10, 9, 7, 8, D); P.rect(5, 8, 10, 7, '#2a2a3e'); P.rect(6, 10, 3, 2, RED); P.rect(11, 10, 3, 2, RED); P.px(7, 10, '#fff'); P.px(12, 10, '#fff'); P.rect(6, 13, 8, 2, '#8e2335');
  P.rect(4, 15, 12, 11, D); P.rect(4, 17, 12, 2, RED); P.rect(8, 15, 2, 10, '#3a3a52'); P.rect(2, 16, 3, 9, D); P.rect(15, 16, 3, 9, D);
  P.tri(1, 18, 4, 18, 0, 6, '#cfd6e6'); P.tri(15, 18, 18, 18, 19, 6, '#cfd6e6'); P.rect(0, 18, 2, 2, '#5a3a22'); P.rect(18, 18, 2, 2, '#5a3a22');
  P.rect(5, 26, 4, 2, 'k'); P.rect(11, 26, 4, 2, 'k'); P.line(14, 14, 18, 20, RED, 1);
}];
NPC_PAINT.npc_duong = [22, 30, P => { // DuongDracular: vampire count
  P.tri(11, 12, 0, 29, 22, 29, '#3a0a1a'); P.tri(11, 14, 3, 29, 19, 29, '#8e2335'); P.rect(4, 12, 14, 3, '#3a0a1a');
  P.ell(11, 8, 5, 6, '#f2e8e0'); P.rect(5, 2, 12, 4, '#10100c'); P.tri(5, 3, 8, 6, 5, 8, '#10100c'); P.tri(17, 3, 14, 6, 17, 8, '#10100c'); P.rect(9, 7, 1, 1, '#e0453a'); P.rect(12, 7, 1, 1, '#e0453a');
  P.rect(10, 11, 2, 1, 'k'); P.px(10, 12, '#fff'); P.px(12, 12, '#fff');
  P.rect(6, 15, 10, 11, '#10100c'); P.rect(9, 15, 4, 8, '#f6f3e9'); P.rect(10, 17, 2, 2, '#e0453a'); P.rect(3, 16, 3, 9, '#3a0a1a'); P.rect(16, 16, 3, 9, '#3a0a1a'); P.rect(2, 24, 3, 3, '#f2e8e0'); P.rect(17, 24, 3, 3, '#f2e8e0');
  P.rect(7, 26, 3, 4, 'k'); P.rect(12, 26, 3, 4, 'k');
}];
NPC_PAINT.npc_santree = [22, 32, P => { // Santree: a walking pine with a Santa hat, ornaments and a red scarf
  P.rect(9, 24, 5, 8, '#5a3a22'); P.rect(8, 30, 7, 2, '#3a2412');
  P.tri(11, 6, 1, 16, 21, 16, '#2b8a3e'); P.tri(11, 11, 0, 23, 22, 23, '#3aa04e'); P.tri(11, 17, -1 + 1, 28, 22, 28, '#2b8a3e'); P.tri(11, 8, 4, 15, 18, 15, '#5fcf5a');
  P.tri(11, -1 + 1, 4, 9, 18, 9, '#e0453a'); P.rect(4, 8, 14, 2, '#f6f3e9'); P.ell(11, 1, 2, 2, '#f6f3e9');
  P.px(8, 13, '#fff'); P.px(14, 13, '#fff'); P.px(8, 13, 'k'); P.px(14, 13, 'k'); P.rect(10, 16, 3, 1, '#a02a2a'); P.rect(6, 19, 11, 2, '#e0453a');
  P.px(5, 22, '#ffd34e'); P.px(16, 21, '#6ee7f2'); P.px(11, 25, '#ff7fb0'); P.px(7, 26, '#ffd34e');
  P.both(() => { P.line(3, 17, -1 + 1, 24, '#5a3a22', 2); });
}];

// ---------------- the Star Gem trader: a hooded traveller with a huge backpack and a gem lantern ----------------
NPC_PAINT.npc_trader = [22, 28, P => {
  P.rect(1, 6, 9, 16, '#8a5a34'); P.rect(2, 7, 7, 14, '#a87442'); P.rect(1, 11, 9, 2, '#5e3b22'); P.rect(3, 3, 5, 4, '#6a4a2a'); P.rect(4, 2, 3, 2, '#c8964a');
  P.ell(14, 7, 6, 6, '#3a2a5a'); P.ell(14, 8, 4, 4, '#f2c394'); P.px(13, 8, 'k'); P.px(16, 8, 'k'); P.rect(12, 11, 5, 1, '#d8d0c0'); P.rect(11, 12, 7, 2, '#d8d0c0');
  P.tri(14, 0, 8, 7, 20, 7, '#4a3a7a'); P.px(14, 1, '#ffd34e');
  P.rect(9, 13, 11, 10, '#4a3a7a'); P.rect(10, 13, 9, 2, '#6a5aa0'); P.rect(9, 17, 11, 1, '#ffd34e');
  P.rect(19, 14, 2, 6, '#4a3a7a'); P.rect(20, 18, 1, 4, '#5a3a22'); P.rect(18, 21, 4, 4, '#2a2040'); P.rect(19, 22, 2, 2, '#c07bff'); P.px(19, 22, '#fff');
  P.rect(10, 23, 3, 5, '#2a2040'); P.rect(16, 23, 3, 5, '#2a2040');
}];

// ---------------- side characters for the new lands (and a wandering bard) ----------------
NPC_PAINT.npc_frog = [20, 22, P => { // Old Croak, the frog sage of the swamp
  P.ell(10, 15, 8, 6, '#4a8a3a'); P.ell(10, 16, 6, 4, '#8ad060'); P.both(() => { P.ell(5, 8, 3, 3, '#4a8a3a'); P.ell(5, 8, 2, 2, '#fff'); P.px(5, 8, 'k'); });
  P.rect(5, 12, 10, 1, '#2a4a1a'); P.rect(2, 3, 16, 2, '#7a5aa0'); P.rect(6, 0, 8, 4, '#7a5aa0'); P.px(10, 1, '#ffd34e');
  P.rect(16, 6, 1, 16, '#8a6a44'); P.ell(16, 5, 2, 2, '#c8f0a0'); P.both(() => { P.ell(4, 21, 3, 1, '#4a8a3a'); });
}];
NPC_PAINT.npc_witch = [20, 30, P => { // Granny Moss, the swamp witch
  P.tri(10, 0, 3, 10, 17, 10, '#2a1440'); P.rect(1, 10, 18, 2, '#2a1440'); P.rect(4, 8, 12, 1, '#9be564'); P.px(12, 3, '#ffd34e');
  P.ell(10, 15, 5, 4, '#a8c890'); P.px(8, 14, 'k'); P.px(12, 14, 'k'); P.px(10, 17, '#5a7a4a'); P.rect(4, 12, 2, 8, '#c8c8c8'); P.rect(14, 12, 2, 8, '#c8c8c8');
  P.tri(10, 18, 2, 29, 18, 29, '#3a2a5a'); P.rect(8, 19, 4, 10, '#4a3a6a'); P.rect(15, 20, 4, 4, '#6a4a2a'); P.ell(17, 19, 2, 1, '#9be564');
}];
NPC_PAINT.npc_mermaid = [20, 28, P => { // Nami the mermaid
  P.ell(10, 7, 6, 6, '#ff7a5a'); P.ell(10, 8, 4, 4, '#f2c394'); P.px(8, 8, '#2c6ab8'); P.px(12, 8, '#2c6ab8'); P.px(10, 10, '#e07a7a');
  P.rect(3, 6, 2, 12, '#ff7a5a'); P.rect(15, 6, 2, 12, '#ff7a5a'); P.ell(10, 15, 4, 3, '#f2c394'); P.both(() => P.ell(8, 15, 2, 1, '#c86ad0'));
  P.ell(10, 21, 4, 4, '#2ab0a0'); P.ell(11, 24, 3, 2, '#2ab0a0'); P.tri(12, 25, 18, 22, 18, 28, '#6ee7f2'); P.px(9, 20, '#a4fff0'); P.px(11, 22, '#a4fff0');
}];
NPC_PAINT.npc_pirate = [22, 30, P => { // Captain Redbeard
  P.rect(3, 2, 16, 3, '#14121f'); P.tri(11, 0, 3, 5, 19, 5, '#14121f'); P.px(11, 2, '#fff'); P.rect(3, 5, 16, 1, '#ffd34e');
  P.ell(11, 10, 5, 4, '#f2c394'); P.rect(12, 8, 4, 2, 'k'); P.px(8, 9, 'k'); P.ell(11, 14, 6, 4, '#c0302a'); P.ell(11, 15, 4, 3, '#e04a3a');
  P.rect(5, 17, 12, 9, '#2a3a8a'); P.rect(10, 17, 2, 9, '#ffd34e'); P.rect(17, 18, 3, 1, '#c8c8d8'); P.rect(19, 16, 1, 6, '#c8c8d8');
  P.rect(6, 26, 4, 4, '#3a2a1a'); P.rect(13, 26, 2, 4, '#8a6a44');
}];
NPC_PAINT.npc_fisher = [20, 28, P => { // Old Tu the fisherman
  P.ell(9, 4, 8, 2, '#d8b860'); P.tri(9, 0, 4, 4, 14, 4, '#e8c870'); P.ell(9, 8, 4, 4, '#e8b088'); P.px(7, 8, 'k'); P.px(11, 8, 'k'); P.rect(6, 11, 7, 2, '#e8e8e8');
  P.rect(4, 13, 11, 10, '#4a6a8a'); P.rect(4, 13, 11, 2, '#6a8aaa'); P.rect(5, 23, 3, 5, '#5a4430'); P.rect(11, 23, 3, 5, '#5a4430');
  P.line(16, 2, 17, 26, '#8a6a44', 1); P.line(17, 2, 19, 14, '#cfd6e6', 1); P.ell(19, 15, 1, 1, '#e0453a');
}];
NPC_PAINT.npc_miner = [20, 28, P => { // Bay the miner
  P.ell(10, 5, 7, 4, '#ffd34e'); P.rect(3, 6, 14, 2, '#c89a1c'); P.rect(9, 2, 3, 3, '#fff6c0');
  P.ell(10, 11, 5, 4, '#e0a878'); P.px(8, 10, 'k'); P.px(12, 10, 'k'); P.rect(6, 13, 9, 3, '#5a3a22');
  P.rect(4, 16, 12, 8, '#3a5a8a'); P.rect(6, 16, 2, 8, '#c8964a'); P.rect(12, 16, 2, 8, '#c8964a'); P.rect(5, 24, 4, 4, '#3a2a1a'); P.rect(11, 24, 4, 4, '#3a2a1a');
  P.line(16, 14, 19, 26, '#8a6a44', 1); P.tri(14, 13, 20, 13, 17, 16, '#a0a8b8');
}];
NPC_PAINT.npc_mole = [20, 22, P => { // Grandpa Mole
  P.ell(10, 13, 8, 8, '#5a4a3a'); P.ell(10, 15, 5, 5, '#8a7a6a'); P.ell(10, 9, 3, 2, '#ff9fd0'); P.both(() => { P.ell(6, 7, 2, 1, 'k'); P.ell(6, 7, 3, 2, '#c8c8c8'); });
  P.rect(4, 6, 12, 1, '#c8c8c8'); P.both(() => { P.rect(1, 18, 5, 3, '#ff9fd0'); P.px(1, 21, '#fff'); P.px(3, 21, '#fff'); }); P.rect(15, 4, 1, 18, '#8a6a44');
}];
NPC_PAINT.npc_bard = [20, 28, P => { // Lirio the wandering bard
  P.rect(4, 2, 12, 3, '#3a8a5a'); P.tri(14, 2, 19, 0, 16, 4, '#e0453a'); P.ell(10, 8, 4, 4, '#f2c394'); P.px(8, 8, 'k'); P.px(12, 8, 'k'); P.rect(9, 10, 3, 1, '#c86a6a');
  P.rect(5, 12, 10, 10, '#3a8a5a'); P.rect(5, 12, 10, 2, '#ffd34e'); P.ell(15, 17, 4, 3, '#c8844a'); P.ell(15, 17, 2, 1, '#5a3a22'); P.line(15, 15, 19, 10, '#8a6a44', 1);
  P.rect(6, 22, 3, 6, '#5a3a22'); P.rect(11, 22, 3, 6, '#5a3a22');
}];
