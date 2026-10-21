'use strict';
// ============ SCENERY: props for every land, background landmarks, foreground plants, hidden easter eggs ============
// Props are small pixel sprites (painted once, outlined) placed along the ground of each level.
const PROP_PAINT = {
  // ---- meadow ----
  fence: [24, 12, P => { for (let i = 0; i < 3; i++) { P.rect(1 + i * 10, 1, 3, 11, 'n'); P.px(2 + i * 10, 0, 'n'); P.rect(1 + i * 10, 1, 1, 11, 'E'); } P.rect(0, 3, 24, 2, 'n'); P.rect(0, 8, 24, 2, 'n'); P.rect(0, 3, 24, 1, 'E'); }],
  signpost: [16, 18, P => { P.rect(7, 6, 2, 12, 'N'); P.rect(1, 2, 14, 6, 'n'); P.rect(1, 2, 14, 1, 'E'); P.rect(3, 4, 6, 1, 'N'); P.rect(3, 6, 8, 1, 'N'); P.tri(15, 2, 15, 8, 16, 5, 'n'); }],
  haystack: [20, 14, P => { P.ell(10, 9, 9, 5, 'Y'); P.ell(10, 7, 8, 5, 'y'); P.ell(10, 5, 6, 3, '#ffe9a0'); for (let i = 0; i < 6; i++) P.line(3 + i * 3, 9, 4 + i * 3, 13, 'Y'); }],
  lamp: [10, 26, P => { P.rect(4, 8, 2, 18, 'q'); P.rect(2, 24, 6, 2, 'q'); P.rect(2, 2, 6, 7, 'q'); P.rect(3, 3, 4, 5, 'y'); P.rect(4, 4, 2, 2, '#fff6c0'); P.tri(1, 2, 9, 2, 5, -1 + 1, 'q'); }],
  flowerbed: [22, 8, P => { P.ell(11, 6, 10, 2, 'G'); const C = ['m', 'y', 'w', 'r', 'p']; for (let i = 0; i < 9; i++) { P.rect(2 + i * 2, 3 + (i % 2), 1, 3, 'g'); P.px(2 + i * 2, 2 + (i % 2), C[i % 5]); } }],
  well: [22, 22, P => { P.rect(3, 12, 16, 10, 'l'); P.rect(3, 12, 16, 2, 'a'); for (let i = 0; i < 4; i++) P.rect(4 + i * 4, 15 + (i % 2) * 3, 3, 2, 'd'); P.rect(4, 2, 2, 10, 'n'); P.rect(16, 2, 2, 10, 'n'); P.tri(1, 3, 21, 3, 11, -1 + 0, 'R'); P.rect(10, 4, 2, 6, 'N'); P.rect(9, 8, 4, 3, 'n'); }],
  // ---- forest ----
  log: [26, 9, P => { P.rect(2, 2, 22, 7, 'n'); P.rect(2, 2, 22, 2, 'E'); P.ell(24, 5, 2, 3, 'S'); P.ell(24, 5, 1, 2, 'n'); P.rect(6, 1, 4, 1, 'g'); P.rect(15, 1, 5, 1, 'G'); P.px(9, 0, 'm'); }],
  stump: [14, 10, P => { P.rect(2, 3, 10, 7, 'n'); P.ell(7, 3, 5, 2, 'S'); P.ell(7, 3, 3, 1, 'n'); P.rect(0, 8, 3, 2, 'n'); P.rect(11, 8, 3, 2, 'n'); P.px(4, 6, 'N'); P.px(9, 5, 'N'); }],
  shrine: [16, 18, P => { P.rect(2, 6, 12, 12, 'd'); P.rect(2, 6, 12, 1, 'l'); P.tri(0, 7, 16, 7, 8, 0, 'R'); P.rect(5, 9, 6, 6, 'D'); P.ell(8, 12, 2, 2, 'y'); P.px(8, 11, '#fff6c0'); P.rect(1, 16, 14, 2, 'l'); }],
  fern: [18, 12, P => { P.both(() => { P.line(9, 12, 2, 4, 'G', 1); P.line(9, 12, 5, 1, 'g', 1); for (let i = 0; i < 4; i++) P.px(4 + i, 4 + i * 2, 't'); }); P.line(9, 12, 9, 0, 'g', 1); }],
  lanternpole: [10, 24, P => { P.rect(4, 4, 2, 20, 'N'); P.rect(1, 4, 8, 1, 'N'); P.rect(0, 5, 3, 5, 'R'); P.rect(1, 6, 1, 3, 'o'); P.rect(7, 5, 3, 5, 'R'); P.rect(8, 6, 1, 3, 'o'); }],
  bigshroom: [18, 20, P => { P.rect(7, 9, 4, 11, 'e'); P.ell(9, 7, 9, 5, 'r'); P.ell(9, 5, 7, 3, '#ff6a5a'); P.px(5, 5, 'w'); P.px(12, 4, 'w'); P.px(9, 7, 'w'); P.px(3, 7, 'w'); }],
  // ---- caves ----
  crystalbig: [20, 24, P => { P.tri(10, 0, 5, 24, 15, 24, 'c'); P.tri(10, 0, 10, 24, 15, 24, 'C'); P.tri(4, 8, 0, 24, 7, 24, 'h'); P.tri(16, 10, 13, 24, 20, 24, 'p'); P.line(9, 4, 8, 16, 'w'); }],
  glowshroom: [16, 12, P => { for (let i = 0; i < 3; i++) { const x = 3 + i * 5, h = 6 + (i % 2) * 3; P.rect(x, 12 - h, 1, h, 'l'); P.ell(x, 12 - h, 3, 2, i === 1 ? 'c' : 'h'); P.px(x - 1, 11 - h, 'w'); } }],
  stalagmite: [12, 20, P => { P.tri(6, 0, 1, 20, 11, 20, 'd'); P.tri(6, 0, 6, 20, 11, 20, 'D'); P.px(5, 6, 'l'); P.px(4, 12, 'l'); }],
  oldcart: [22, 14, P => { P.rect(2, 2, 18, 8, 'N'); P.rect(2, 2, 18, 1, 'E'); P.rect(4, 0, 4, 3, 'c'); P.rect(10, 0, 3, 3, 'h'); P.rect(14, 1, 4, 2, 'c'); P.ell(6, 11, 2, 2, 'D'); P.ell(16, 11, 2, 2, 'D'); P.rect(0, 13, 22, 1, 'l'); }],
  gemrock: [16, 10, P => { P.ell(8, 6, 7, 4, 'd'); P.ell(8, 5, 6, 3, 'l'); P.rect(4, 3, 2, 2, 'm'); P.rect(9, 2, 2, 3, 'c'); P.rect(11, 5, 2, 2, 'y'); }],
  // ---- desert ----
  pillar: [12, 26, P => { P.rect(2, 4, 8, 20, 'E'); P.rect(2, 4, 2, 20, 'e'); P.rect(0, 2, 12, 3, 'e'); P.rect(0, 23, 12, 3, 'E'); P.tri(8, 2, 12, 2, 12, 6, '#00000000'); P.rect(5, 8, 1, 14, 'S'); P.rect(9, 0, 3, 3, 'S'); }],
  urn: [10, 14, P => { P.ell(5, 9, 4, 5, 'o'); P.rect(3, 1, 4, 3, 'o'); P.rect(2, 0, 6, 1, 'N'); P.rect(1, 8, 8, 1, 'N'); P.px(3, 7, 'y'); }],
  skull: [10, 8, P => { P.ell(5, 3, 4, 3, 'e'); P.rect(3, 5, 4, 3, 'e'); P.px(3, 3, 'k'); P.px(6, 3, 'k'); P.px(4, 6, 'k'); P.px(6, 6, 'k'); }],
  statuehead: [22, 18, P => { P.ell(11, 10, 9, 8, 'E'); P.ell(11, 9, 8, 7, 'e'); P.rect(6, 7, 3, 2, 'S'); P.rect(13, 7, 3, 2, 'S'); P.rect(10, 9, 2, 4, 'S'); P.rect(8, 14, 6, 1, 'S'); P.rect(1, 1, 20, 4, 'y'); P.rect(1, 3, 20, 1, 'b'); P.rect(0, 16, 22, 2, 'S'); }],
  palm: [20, 26, P => { P.line(10, 26, 11, 8, 'n', 2); for (let i = 0; i < 5; i++) P.px(10, 12 + i * 3, 'N'); P.both(() => { P.line(11, 8, 2, 12, 'g', 1); P.line(11, 8, 4, 4, 'G', 1); P.line(11, 7, 9, 1, 'g', 1); }); P.ell(10, 9, 2, 2, 'N'); }],
  tent: [24, 16, P => { P.tri(12, 0, 0, 16, 24, 16, 'r'); P.tri(12, 0, 12, 16, 24, 16, 'R'); P.tri(12, 6, 9, 16, 15, 16, '#2a1a14'); P.rect(11, 0, 2, 2, 'n'); }],
  // ---- frost ----
  snowpine: [18, 26, P => { P.rect(8, 22, 2, 4, 'N'); for (let i = 0; i < 3; i++) { const y = 2 + i * 7, w = 4 + i * 3; P.tri(9, y, 9 - w, y + 9, 9 + w, y + 9, 'G'); P.rect(9 - w + 1, y + 7, w * 2 - 1, 2, 'w'); } P.tri(9, 0, 7, 4, 11, 4, 'w'); }],
  icecrystal: [14, 18, P => { P.tri(7, 0, 3, 18, 11, 18, '#bfeaff'); P.tri(7, 0, 7, 18, 11, 18, 'c'); P.tri(3, 7, 0, 18, 5, 18, 'w'); P.line(6, 4, 5, 14, 'w'); }],
  frozenlamp: [10, 24, P => { P.rect(4, 7, 2, 17, 'b'); P.rect(2, 1, 6, 7, 'b'); P.rect(3, 2, 4, 5, '#9fe8ff'); P.rect(1, 0, 8, 2, 'w'); P.px(2, 8, 'w'); P.px(7, 9, 'w'); }],
  icepillar: [12, 22, P => { P.rect(2, 2, 8, 20, 'c'); P.rect(2, 2, 3, 20, '#d8f8ff'); P.rect(1, 0, 10, 3, 'w'); P.line(7, 6, 6, 18, 'C'); }],
  snowrock: [16, 10, P => { P.ell(8, 6, 7, 4, 'd'); P.ell(8, 3, 6, 2, 'w'); P.px(5, 6, 'l'); }],
  flag: [14, 24, P => { P.rect(1, 0, 1, 24, 'l'); P.rect(2, 1, 10, 6, 'r'); P.rect(2, 1, 10, 1, '#ff7a6a'); P.px(6, 3, 'y'); P.rect(0, 22, 4, 2, 'w'); }],
  // ---- volcano ----
  obsidian: [14, 20, P => { P.tri(7, 0, 1, 20, 13, 20, 'D'); P.tri(7, 0, 7, 20, 13, 20, 'k'); P.line(6, 5, 4, 15, 'h'); P.px(8, 10, 'o'); }],
  vent: [18, 10, P => { P.ell(9, 7, 8, 3, 'D'); P.ell(9, 6, 5, 2, 'k'); P.ell(9, 6, 3, 1, 'o'); P.px(8, 6, 'y'); }],
  skullpile: [18, 10, P => { for (let i = 0; i < 3; i++) { const x = 3 + i * 6, y = i === 1 ? 2 : 5; P.ell(x, y + 2, 3, 2, 'e'); P.px(x - 1, y + 2, 'k'); P.px(x + 1, y + 2, 'k'); } }],
  chainpost: [12, 22, P => { P.rect(4, 4, 4, 18, 'D'); P.rect(3, 2, 6, 3, 'd'); for (let i = 0; i < 5; i++) P.rect(8 + (i % 2), 6 + i * 3, 2, 2, 'l'); }],
  magmarock: [18, 12, P => { P.ell(9, 7, 8, 5, 'D'); P.ell(9, 6, 7, 4, 'd'); P.line(4, 4, 8, 9, 'o'); P.line(8, 9, 14, 5, 'o'); P.px(8, 9, 'y'); }],
  // ---- citadel ----
  gpillar: [14, 28, P => { P.rect(3, 4, 8, 22, 'P'); P.rect(3, 4, 2, 22, 'h'); P.rect(1, 0, 12, 4, 'p'); P.tri(1, 0, 13, 0, 7, -1 + 1, 'p'); P.rect(1, 25, 12, 3, 'p'); P.rect(6, 8, 2, 4, 'm'); }],
  banner: [12, 24, P => { P.rect(0, 0, 12, 2, 'y'); P.rect(1, 2, 10, 18, 'P'); P.tri(1, 20, 11, 20, 6, 24, 'P'); P.ell(6, 9, 3, 3, 'p'); P.px(6, 9, 'y'); }],
  candelabra: [14, 18, P => { P.rect(6, 6, 2, 12, 'Y'); P.rect(2, 6, 10, 1, 'Y'); P.rect(1, 3, 2, 3, 'w'); P.rect(6, 2, 2, 4, 'w'); P.rect(11, 3, 2, 3, 'w'); P.px(1, 2, 'o'); P.px(6, 1, 'y'); P.px(11, 2, 'o'); P.rect(4, 17, 6, 1, 'Y'); }],
  gargoyle: [18, 18, P => { P.rect(3, 12, 12, 6, 'd'); P.ell(9, 8, 5, 5, 'D'); P.both(() => { P.tri(5, 5, 1, 0, 6, 3, 'D'); P.tri(4, 9, 0, 6, 4, 12, 'd'); P.px(7, 7, 'm'); }); P.rect(7, 11, 4, 1, 'k'); }],
  armor: [14, 22, P => { P.ell(7, 4, 4, 4, 'l'); P.rect(5, 3, 4, 2, 'k'); P.rect(3, 8, 8, 8, 'a'); P.rect(3, 8, 8, 1, 'w'); P.rect(1, 9, 2, 6, 'l'); P.rect(11, 9, 2, 6, 'l'); P.rect(4, 16, 2, 6, 'A'); P.rect(8, 16, 2, 6, 'A'); P.line(12, 2, 12, 22, 'd'); }],
  // ---- swamp ----
  cattail: [12, 20, P => { for (let i = 0; i < 3; i++) { const x = 2 + i * 4; P.line(x, 20, x + (i - 1), 4 + i, 'G'); P.rect(x + (i - 1) - 1, 3 + i, 2, 5, 'N'); } P.line(1, 20, 0, 12, 'g'); P.line(11, 20, 12, 13, 'g'); }],
  rottenlog: [26, 10, P => { P.rect(1, 3, 24, 7, 'N'); P.rect(1, 3, 24, 2, 'n'); P.ell(25, 6, 1, 3, 'S'); for (let i = 0; i < 4; i++) { P.rect(4 + i * 6, 1, 3, 2, 'G'); P.px(5 + i * 6, 0, 'x'); } P.ell(10, 2, 2, 1, 'h'); P.px(10, 2, 'w'); }],
  glowcluster: [18, 14, P => { const C = ['c', 'h', 'x']; for (let i = 0; i < 4; i++) { const x = 2 + i * 4, h = 5 + ((i * 7) % 5); P.rect(x, 14 - h, 1, h, 'e'); P.ell(x, 14 - h, 2 + (i % 2), 2, C[i % 3]); P.px(x, 13 - h, 'w'); } }],
  stiltlantern: [12, 26, P => { P.line(6, 26, 6, 6, 'N', 2); P.rect(2, 4, 8, 2, 'N'); P.rect(8, 6, 1, 4, 'n'); P.rect(6, 10, 5, 6, '#2a4a2a'); P.rect(7, 11, 3, 4, 'x'); P.px(8, 12, '#fff'); }],
  lilyrock: [20, 8, P => { P.ell(10, 5, 9, 3, 'D'); P.ell(10, 4, 8, 2, 'd'); P.ell(5, 3, 3, 1, 'g'); P.ell(14, 2, 3, 1, 'g'); P.px(14, 1, 'm'); }],
  // ---- the giant forest before Morvella ----
  hugeshroom: [56, 92, P => { P.rect(23, 38, 11, 54, 'e'); P.rect(23, 38, 3, 54, 'w'); P.rect(31, 38, 3, 54, 'E'); P.both(() => { P.tri(23, 80, 14, 92, 24, 92, 'E'); P.line(24, 60, 16, 70, 'E', 2); });
    P.ell(28, 28, 27, 20, 'P'); P.ell(28, 26, 26, 18, 'p'); P.ell(28, 22, 21, 12, 'h'); P.rect(2, 36, 52, 3, 'D'); for (let i = 0; i < 13; i++) P.rect(4 + i * 4, 38, 1, 4, 'P');
    for (const [x, y, r] of [[14, 20, 4], [30, 12, 3], [42, 24, 4], [22, 30, 2], [36, 32, 2]]) { P.ell(x, y, r, Math.max(1, r - 1), 'w'); P.px(x - 1, y - 1, '#ffffff'); } P.px(46, 14, 'm'); P.px(10, 30, 'm'); }],
  hugeshroomB: [56, 80, P => { P.rect(24, 34, 9, 46, 'e'); P.rect(24, 34, 2, 46, 'w'); P.both(() => { P.tri(24, 70, 16, 80, 25, 80, 'E'); });
    P.ell(28, 24, 26, 17, 'C'); P.ell(28, 22, 25, 15, 'c'); P.ell(28, 18, 19, 10, '#a4ffe8'); P.rect(3, 31, 50, 3, '#0a5a5a'); for (let i = 0; i < 12; i++) P.rect(5 + i * 4, 33, 1, 3, 'C');
    for (const [x, y, r] of [[16, 16, 3], [32, 9, 3], [42, 20, 3], [24, 24, 2]]) { P.ell(x, y, r, r - 1, '#e8fff8'); } P.px(20, 10, '#ffffff'); P.px(38, 14, '#ffffff'); }],
  hugetree: [64, 104, P => { P.rect(26, 40, 14, 64, 'N'); P.rect(26, 40, 4, 64, 'n'); P.both(() => { P.tri(26, 88, 8, 104, 28, 104, 'N'); P.tri(28, 70, 14, 80, 28, 84, 'N'); P.line(27, 50, 8, 34, 'N', 4); P.line(8, 34, 2, 22, 'N', 3); });
    P.line(38, 54, 58, 36, 'N', 4); P.line(58, 36, 62, 24, 'N', 3);
    P.ell(14, 20, 14, 10, '#12301f'); P.ell(34, 12, 18, 12, '#1a4a2c'); P.ell(52, 24, 13, 9, '#12301f'); P.ell(30, 24, 22, 8, '#0e2a1a');
    for (const [x, y] of [[10, 18], [22, 8], [38, 8], [46, 16], [54, 26], [30, 24], [16, 28]]) { P.px(x, y, '#c8f0a0'); P.px(x + 1, y, '#8ad060'); }
    for (const x of [8, 20, 30, 44, 54]) { P.line(x, 30, x + 1, 44 + (x % 3) * 6, '#2b8a3e', 1); P.px(x + 1, 44 + (x % 3) * 6, '#a4ffc0'); } }],
  // ---- ocean ----
  shell: [12, 8, P => { P.ell(6, 5, 5, 3, 'm'); for (let i = 0; i < 4; i++) P.line(6, 8, 2 + i * 3, 3, '#ffd0e0'); P.rect(4, 7, 4, 1, 'm'); }],
  starfish: [12, 8, P => { P.ell(6, 5, 2, 2, 'o'); P.line(6, 5, 6, 0, 'o', 2); P.line(6, 5, 1, 3, 'o', 2); P.line(6, 5, 11, 3, 'o', 2); P.line(6, 5, 2, 8, 'o', 2); P.line(6, 5, 10, 8, 'o', 2); P.px(6, 4, 'y'); }],
  coralfan: [18, 18, P => { P.rect(8, 12, 2, 6, 'R'); P.both(() => { P.line(9, 14, 2, 4, 'r', 2); P.line(9, 12, 5, 1, 'r', 2); P.line(6, 8, 1, 8, 'm'); }); P.line(9, 12, 9, 0, 'r', 2); P.px(3, 4, 'm'); P.px(15, 4, 'm'); }],
  anchor: [16, 20, P => { P.rect(7, 2, 2, 15, 'd'); P.ell(8, 2, 2, 2, 'd'); P.ell(8, 2, 1, 1, '#063050'); P.rect(4, 5, 8, 2, 'd'); P.line(1, 13, 7, 18, 'd', 2); P.line(15, 13, 9, 18, 'd', 2); P.px(1, 12, 'l'); P.px(14, 12, 'l'); }],
  chest: [16, 12, P => { P.rect(1, 4, 14, 8, 'n'); P.rect(1, 1, 14, 4, 'N'); P.rect(1, 4, 14, 1, 'Y'); P.rect(7, 4, 2, 3, 'y'); P.rect(1, 1, 1, 11, 'Y'); P.rect(14, 1, 1, 11, 'Y'); P.px(4, 0, 'y'); P.px(11, 0, 'y'); }],
  amphora: [10, 16, P => { P.ell(5, 10, 4, 5, 'o'); P.rect(3, 2, 4, 4, 'o'); P.rect(2, 1, 6, 1, 'N'); P.rect(0, 5, 2, 4, 'o'); P.rect(8, 5, 2, 4, 'o'); P.rect(2, 9, 6, 1, 'N'); P.px(7, 14, 'g'); P.px(2, 13, 'g'); }],
  // ---- tunnels ----
  minecart: [22, 16, P => { P.rect(2, 3, 18, 9, 'D'); P.rect(2, 3, 18, 2, 'l'); P.rect(4, 0, 5, 4, 'y'); P.rect(9, 1, 4, 3, 'Y'); P.rect(13, 0, 4, 4, 'y'); P.ell(6, 13, 2, 2, 'k'); P.ell(16, 13, 2, 2, 'k'); P.rect(0, 15, 22, 1, 'N'); }],
  crate: [14, 14, P => { P.rect(0, 0, 14, 14, 'n'); P.rect(0, 0, 14, 2, 'E'); P.rect(0, 12, 14, 2, 'N'); P.line(1, 2, 12, 12, 'N', 1); P.rect(0, 0, 2, 14, 'N'); P.rect(12, 0, 2, 14, 'N'); }],
  barrel: [12, 14, P => { P.ell(6, 7, 5, 7, 'n'); P.rect(1, 3, 10, 1, 'd'); P.rect(1, 10, 10, 1, 'd'); P.rect(3, 1, 1, 12, 'E'); }],
  pickrock: [16, 16, P => { P.ell(8, 11, 7, 5, 'd'); P.ell(8, 10, 6, 4, 'l'); P.line(9, 9, 12, 0, 'n', 2); P.line(7, 1, 16, 2, 'a', 2); P.px(5, 11, 'y'); P.px(11, 12, 'y'); }],
  minelamp: [8, 12, P => { P.rect(3, 0, 2, 3, 'D'); P.rect(1, 3, 6, 8, 'D'); P.rect(2, 4, 4, 6, 'y'); P.rect(3, 5, 2, 2, '#fff6c0'); }],
  rails: [32, 4, P => { P.rect(0, 0, 32, 1, 'l'); P.rect(0, 3, 32, 1, 'l'); for (let i = 0; i < 5; i++) P.rect(1 + i * 7, 0, 3, 4, 'N'); }]
};
const BIOME_PROPS = {
  meadow: ['fence', 'signpost', 'haystack', 'lamp', 'flowerbed', 'well', 'flowerbed', 'fence'],
  forest: ['log', 'stump', 'shrine', 'fern', 'lanternpole', 'bigshroom', 'fern'],
  caves: ['crystalbig', 'glowshroom', 'stalagmite', 'oldcart', 'gemrock', 'glowshroom'],
  desert: ['pillar', 'urn', 'skull', 'statuehead', 'palm', 'tent', 'urn'],
  frost: ['snowpine', 'icecrystal', 'frozenlamp', 'icepillar', 'snowrock', 'flag', 'snowpine'],
  volcano: ['obsidian', 'vent', 'skullpile', 'chainpost', 'magmarock', 'vent'],
  citadel: ['gpillar', 'banner', 'candelabra', 'gargoyle', 'armor', 'candelabra'],
  swamp: ['cattail', 'rottenlog', 'glowcluster', 'stiltlantern', 'lilyrock', 'glowcluster', 'cattail'],
  ocean: ['shell', 'starfish', 'coralfan', 'anchor', 'chest', 'amphora', 'coralfan', 'shell'],
  tunnels: ['minecart', 'crate', 'barrel', 'pickrock', 'minelamp', 'rails', 'crate']
};
// props that glow in the dark (light colour)
const PROP_GLOW = { lamp: '#ffd34e', lanternpole: '#ff9a2a', shrine: '#ffd34e', crystalbig: '#6ee7f2', glowshroom: '#6ee7f2', gemrock: '#c07bff', frozenlamp: '#9fe8ff', vent: '#ff7a2a', magmarock: '#ff7a2a', candelabra: '#ffb04a', glowcluster: '#a4ffc0', hugeshroom: '#c07bff', hugeshroomB: '#6ee7f2', hugetree: '#a4ffc0', stiltlantern: '#c8f0a0', minelamp: '#ffd34e', icecrystal: '#bfeaff' };
function propSprite(k) { const key = 'prop_' + k; if (!_cache[key]) { const d = PROP_PAINT[k]; _cache[key] = paint(d[0], d[1], d[2], '#14121f'); } return _cache[key]; }

// ---------------- hidden easter eggs (homages only: no names, no logos) ----------------
const EGG_PAINT = {
  strawhat: [26, 18, P => { P.rect(3, 6, 2, 12, 'N'); P.rect(0, 2, 10, 5, 'n'); P.ell(17, 13, 9, 3, '#e8c870'); P.ell(17, 10, 5, 4, '#f0d888'); P.rect(12, 11, 10, 2, 'r'); P.ell(17, 13, 8, 1, '#c8a050'); }],
  forestspirit: [30, 30, P => { P.line(25, 2, 25, 30, 'N', 1); P.ell(25, 3, 6, 3, 'g'); P.ell(13, 19, 11, 11, 'd'); P.ell(13, 22, 7, 7, '#e8e0d0'); P.both(() => { P.ell(9, 13, 2, 2, 'w'); P.px(9, 13, 'k'); P.tri(7, 3, 9, 9, 4, 8, 'd'); }); P.rect(10, 17, 6, 1, 'k'); for (let i = 0; i < 3; i++) P.tri(10 + i * 3, 21, 12 + i * 3, 21, 11 + i * 3, 23, 'd'); P.px(13, 15, 'k'); P.ell(13, 3, 2, 1, 'g'); }],
  sootsprites: [26, 10, P => { for (let i = 0; i < 4; i++) { const x = 3 + i * 6, y = 5 + (i % 2); P.ell(x, y, 3, 3, 'k'); P.px(x - 1, y - 1, 'w'); P.px(x + 1, y - 1, 'w'); P.px(x, 0 + (i % 2), ['m', 'y', 'c', 'g'][i]); P.px(x + 1, 1 + (i % 2), ['m', 'y', 'c', 'g'][i]); } }],
  spacepod: [26, 18, P => { P.ell(13, 15, 13, 3, 'N'); P.ell(13, 10, 9, 8, 'l'); P.ell(13, 9, 8, 7, 'a'); P.ell(14, 8, 4, 3, '#9fe8ff'); P.px(12, 6, 'w'); P.rect(4, 12, 18, 1, 'A'); P.line(20, 16, 25, 13, 'n', 1); P.ell(25, 12, 1, 1, 'n'); }],
  leafband: [22, 24, P => { P.rect(4, 8, 2, 16, 'N'); P.rect(0, 4, 10, 4, 'B'); P.rect(2, 4, 6, 4, 'l'); P.ell(5, 6, 2, 1, 'd'); P.rect(9, 5, 3, 1, 'B'); P.rect(11, 6, 2, 3, 'B'); P.ell(17, 20, 5, 3, 'w'); P.ell(17, 19, 4, 2, 'y'); P.rect(14, 18, 6, 1, 'o'); P.line(15, 15, 20, 19, 'n'); P.line(16, 15, 21, 19, 'n'); }],
  bigsword: [18, 34, P => { P.rect(5, 0, 8, 26, 'D'); P.rect(5, 0, 2, 26, 'd'); P.rect(11, 0, 2, 26, 'k'); P.rect(2, 26, 14, 2, 'd'); P.rect(7, 28, 4, 6, 'N'); P.px(8, 30, 'n'); P.ell(9, 33, 8, 2, 'D'); }],
  blacknote: [20, 16, P => { P.rect(2, 9, 16, 7, 'l'); P.rect(2, 9, 16, 1, 'a'); P.rect(4, 3, 9, 7, 'k'); P.rect(5, 4, 7, 1, 'D'); P.rect(5, 6, 5, 1, 'D'); P.rect(4, 3, 1, 7, 'd'); P.ell(16, 6, 2, 2, 'r'); P.px(16, 3, 'G'); P.px(15, 5, '#ff8a7a'); }],
  woodbox: [22, 22, P => { P.rect(2, 4, 12, 18, 'n'); P.rect(2, 4, 12, 2, 'E'); P.rect(2, 10, 12, 1, 'N'); P.rect(2, 16, 12, 1, 'N'); P.line(2, 4, 13, 21, 'R', 1); P.rect(12, 14, 10, 8, 'G'); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) P.rect(12 + i * 2 + (i >> 1), 14 + j * 3, 2, 2, 'k'); P.px(5, 7, 'm'); }],
  mechahead: [30, 26, P => { P.ell(15, 17, 12, 9, '#5a3a8a'); P.ell(15, 15, 11, 8, '#7a4ab0'); P.tri(15, 0, 12, 10, 18, 10, '#7a4ab0'); P.both(() => { P.rect(7, 13, 5, 3, '#9be564'); P.px(8, 14, 'w'); }); P.rect(10, 20, 10, 2, '#9be564'); P.rect(8, 24, 14, 2, 'D'); P.rect(0, 24, 30, 2, 'B'); }],
  drill: [30, 20, P => { for (let i = 0; i < 6; i++) { const x = 4 + i * 4, h = 9 - i * 1.4; P.rect(x, 10 - h, 4, h * 2, i % 2 ? 'Y' : 'y'); } P.tri(28, 10, 26, 7, 26, 13, 'y'); P.rect(0, 6, 5, 8, 'R'); P.line(1, 18, 9, 18, 'r', 1); P.tri(1, 16, 5, 16, 3, 19, 'k'); P.tri(6, 16, 10, 16, 8, 19, 'k'); P.rect(5, 16, 1, 1, 'k'); }],
};
const EGGS = {
  meadow: { k: 'strawhat', en: 'An old straw hat rests on a sign by the shore. Its owner must be sailing after the greatest treasure in the world.', vi: 'Một chiếc mũ rơm cũ để trên tấm biển ven bờ. Chủ của nó chắc đang ra khơi tìm kho báu lớn nhất thế giới.' },
  forest: { k: 'forestspirit', en: 'A huge, round forest spirit is napping under a leaf umbrella. Better not wake it... unless you have a bus to catch.', vi: 'Một linh hồn rừng to tròn đang ngủ trưa dưới chiếc ô bằng lá. Đừng đánh thức nó... trừ khi bạn đang đợi xe buýt.' },
  caves: { k: 'sootsprites', en: 'Tiny soot sprites are carrying star-shaped candies. They squeak and hide when you get close.', vi: 'Những cục bồ hóng bé xíu đang khiêng kẹo hình ngôi sao. Chúng kêu chíp chíp rồi trốn khi bạn lại gần.' },
  desert: { k: 'spacepod', en: 'A round space pod crashed in the sand. Inside: a tiny furry tail and a note saying "back after training".', vi: 'Một khoang tàu tròn rơi xuống cát. Bên trong có một cái đuôi lông xù bé xíu và tờ giấy ghi "đi tập luyện, sẽ quay lại".' },
  frost: { k: 'leafband', en: 'A headband with a leaf mark, tied to a post next to a steaming bowl of noodles. Someone never gives up, believe it!', vi: 'Một cái băng trán khắc hình chiếc lá buộc trên cột, cạnh tô mì còn bốc khói. Có người không bao giờ bỏ cuộc, tin đi!' },
  volcano: { k: 'bigsword', en: 'A sword as big as a door, stuck in the rock. Whoever swung this must have fought their whole life.', vi: 'Một thanh kiếm to bằng cả cánh cửa cắm trong đá. Ai vung nổi thứ này chắc đã chiến đấu cả đời.' },
  citadel: { k: 'blacknote', en: 'A black notebook lies beside a red apple. Better not write anyone\'s name in it.', vi: 'Một cuốn sổ đen nằm cạnh quả táo đỏ. Tốt nhất đừng viết tên ai vào đó.' },
  swamp: { k: 'woodbox', en: 'A wooden box tied with rope, next to a green-and-black checkered coat. Something inside is sleeping peacefully.', vi: 'Một chiếc hộp gỗ cột dây cạnh tấm áo kẻ ca-rô xanh đen. Có gì đó bên trong đang ngủ rất ngon.' },
  ocean: { k: 'mechahead', en: 'A giant purple robot head sleeps on the seabed. It really, really does not want anyone to get in.', vi: 'Một cái đầu robot tím khổng lồ ngủ dưới đáy biển. Hình như nó rất, rất không muốn ai trèo vào lái.' },
  tunnels: { k: 'drill', en: 'A huge spiral drill and a pair of pointy sunglasses. This drill looks like it could pierce the sky.', vi: 'Một mũi khoan xoắn khổng lồ và cặp kính râm nhọn hoắt. Mũi khoan này trông như khoan thủng được cả bầu trời.' }
};
// Lyra's seven notes, one hidden in each of seven lands (the n-th note in the n-th land); a crystal music note in its own colour
const ORB_MAPS = [0, 1, 2, 3, 4, 5, 9];
const NOTE_COL = [['#ff5a5a', '#ffc8c8'], ['#ff9a3a', '#ffdcb0'], ['#ffd34e', '#fff3b8'], ['#7ed957', '#d8ffc8'], ['#6ee7f2', '#dcfcff'], ['#5a8bff', '#cddcff'], ['#c07bff', '#eedcff']];
function noteSprite(n) {
  const key = 'note_' + n;
  if (!_cache[key]) { const c = NOTE_COL[(n - 1) % 7]; _cache[key] = paint(12, 16, P => { P.ell(4, 12, 3, 2, c[0]); P.rect(6, 2, 2, 11, c[0]); P.tri(8, 2, 8, 7, 11, 6, c[0]); P.px(3, 11, c[1]); P.px(4, 11, c[1]); P.rect(6, 3, 1, 7, c[1]); P.px(9, 4, c[1]); }, '#14121f'); }
  return _cache[key];
}
function eggSprite(k) { const key = 'egg_' + k; if (!_cache[key]) { const d = EGG_PAINT[k]; _cache[key] = paint(d[0], d[1], d[2], '#14121f'); } return _cache[key]; }

// ---------------- distant landmarks painted into the background (one per land) ----------------
function paintLandmark(B, x, W) {
  const R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  const disc = (cx, cy, r, c) => { x.fillStyle = c; for (let j = -r; j <= r; j++) { const hw = Math.round(Math.sqrt(r * r - j * j)); x.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };
  const tri = (cx, by, w, h, c) => { x.fillStyle = c; for (let i = 0; i < h; i++) { const half = Math.round(i / h * w / 2); x.fillRect(cx - half, by - h + i, half * 2 + 1, 1); } };
  const sil = B.far, lit = B.sky[3];
  const wrap = fn => { for (const o of [-W, 0, W]) fn(o); };
  switch (B.id) {
    case 'meadow': wrap(o => { const cx = 420 + o; R(cx - 30, 120, 60, 50, sil); for (let i = 0; i < 6; i++) R(cx - 30 + i * 11, 114, 6, 6, sil); R(cx - 40, 96, 14, 74, sil); R(cx + 26, 100, 14, 70, sil); tri(cx - 33, 96, 18, 16, sil); tri(cx + 33, 100, 18, 14, sil); R(cx - 6, 104, 12, 66, sil); tri(cx, 104, 16, 22, sil); R(cx - 1, 76, 1, 8, sil); R(cx, 76, 6, 3, '#e0453a'); for (const [a, b] of [[-34, 110], [30, 112], [-2, 118]]) R(cx + a, b, 2, 3, '#ffd34e'); }); break;
    case 'forest': wrap(o => { const cx = 140 + o; R(cx - 12, 60, 24, 110, sil); for (let i = 0; i < 9; i++) disc(cx - 40 + i * 10, 52 + (i % 3) * 8, 22, sil); R(cx - 30, 150, 8, 20, sil); R(cx + 22, 146, 8, 24, sil); for (let i = 0; i < 6; i++) R(cx - 30 + i * 12, 70 + (i % 2) * 18, 2, 2, '#d8ff6a'); }); break;
    case 'caves': wrap(o => { for (let i = 0; i < 5; i++) { const cx = 60 + i * 100 + o, h = 50 + (i % 3) * 25; tri(cx, 170, 26, h, '#2a2a6a'); tri(cx, 170, 12, h - 10, '#3a3a90'); R(cx - 1, 170 - h + 6, 2, h - 20, 'rgba(110,231,242,.35)'); } }); break;
    case 'desert': wrap(o => { tri(120 + o, 150, 130, 70, sil); tri(120 + o, 150, 66, 70, lit === '#ffd08a' ? '#c86a4a' : sil); tri(250 + o, 150, 80, 44, sil); tri(380 + o, 150, 100, 56, sil); R(118 + o, 82, 4, 4, '#ffd34e'); }); break;
    case 'frost': { // aurora in the sky band
      for (let i = 0; i < W; i += 2) { const y = 20 + Math.sin(i / 40) * 10 + Math.sin(i / 17) * 4; x.fillStyle = 'rgba(120,255,200,.10)'; x.fillRect(i, y, 2, 30); x.fillStyle = 'rgba(160,120,255,.08)'; x.fillRect(i, y + 24, 2, 18); }
      wrap(o => { const cx = 300 + o; R(cx - 20, 110, 40, 60, '#cfe8ff'); tri(cx, 110, 24, 30, '#e8f8ff'); R(cx - 34, 120, 12, 50, '#bfd8f0'); tri(cx - 28, 120, 14, 22, '#e8f8ff'); R(cx + 22, 118, 12, 52, '#bfd8f0'); tri(cx + 28, 118, 14, 24, '#e8f8ff'); R(cx - 3, 140, 6, 30, '#6a8ac0'); }); break; }
    case 'volcano': wrap(o => { const cx = 360 + o; for (let i = 0; i < 40; i++) R(cx - 3 + Math.round(Math.sin(i / 3) * 2), 54 + i * 2, 4 + (i % 3), 2, i % 4 ? '#ff6a20' : '#ffd34e'); }); break;
    case 'citadel': { disc(400, 40, 26, '#e8dcff'); disc(392, 36, 24, '#cfc0f0'); disc(410, 46, 4, '#b8a8e0'); disc(386, 30, 3, '#b8a8e0');
      wrap(o => { const cx = 380 + o; R(cx - 10, 60, 20, 110, '#0a0618'); tri(cx, 60, 26, 36, '#0a0618'); R(cx - 30, 90, 12, 80, '#0a0618'); tri(cx - 24, 90, 16, 24, '#0a0618'); R(cx + 18, 84, 12, 86, '#0a0618'); tri(cx + 24, 84, 16, 26, '#0a0618'); R(cx - 2, 80, 4, 6, '#d58bff'); }); break; }
    case 'swamp': wrap(o => { const cx = 260 + o; R(cx - 6, 70, 12, 100, '#1a2a1a'); disc(cx, 66, 40, '#3a1a4a'); disc(cx, 60, 34, '#5a2a6a'); for (let i = 0; i < 8; i++) disc(cx - 28 + i * 8, 54 + (i % 2) * 8, 2, '#ffd0f0'); R(cx - 40, 96, 80, 3, 'rgba(200,240,160,.25)'); }); break;
    case 'ocean': wrap(o => { const cx = 330 + o; x.fillStyle = '#062a40'; for (let i = 0; i < 30; i++) x.fillRect(cx - 60 + i * 4 - Math.round(i / 3), 140 - Math.round(Math.sin(i / 9) * 10), 6, 30); R(cx - 4, 70, 4, 72, '#062a40'); R(cx - 24, 86, 44, 3, '#062a40'); R(cx - 3, 72, 22, 14, 'rgba(10,50,70,.9)'); R(cx + 12, 118, 4, 4, '#ffd34e'); }); break;
    case 'tunnels': wrap(o => { for (let i = 0; i < 3; i++) { const cx = 90 + i * 160 + o; disc(cx, 130, 30, '#0a0604'); R(cx - 30, 130, 60, 40, '#0a0604'); R(cx - 32, 98, 64, 6, '#3a2a18'); R(cx - 32, 98, 6, 72, '#3a2a18'); R(cx + 26, 98, 6, 72, '#3a2a18'); R(cx - 2, 108, 4, 5, '#ffd34e'); } }); break;
  }
}
// sky life: clouds and flocks drawn live (so they drift)
const SKY_STYLE = {
  meadow: { cloud: 'rgba(255,240,230,.55)', birds: '#2b3a67' }, forest: { cloud: null, birds: '#0c2a22' }, desert: { cloud: 'rgba(255,220,180,.35)', birds: '#3d1c4a' },
  frost: { cloud: 'rgba(240,250,255,.5)', birds: '#3a5a9a' }, volcano: { cloud: 'rgba(60,20,20,.55)', birds: null }, citadel: { cloud: 'rgba(60,30,100,.4)', birds: '#06040f', bats: true },
  swamp: { cloud: null, birds: null, bats: true }, ocean: { cloud: null, fish: true }, caves: { cloud: null }, tunnels: { cloud: null }
};
// foreground plants (big, dark, in front of everything)
const FG_KIND = { meadow: 'grass', forest: 'fern', caves: 'rock', desert: 'dune', frost: 'snow', volcano: 'rock', citadel: 'rock', swamp: 'reed', ocean: 'kelp', tunnels: 'rock' };
// colour mood laid over each land
const GRADE = { meadow: ['#ffb070', 0.07], forest: ['#40c080', 0.08], caves: ['#4060ff', 0.1], desert: ['#ff8a40', 0.08], frost: ['#80d0ff', 0.08], volcano: ['#ff4020', 0.1], citadel: ['#a040ff', 0.1], swamp: ['#80ff60', 0.08], ocean: ['#2090ff', 0.06], tunnels: ['#ffa040', 0.08] };
