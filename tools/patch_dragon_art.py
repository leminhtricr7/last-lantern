import io
p = 'src/art.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:80]
    s = s.replace(old, new, cnt)


rep("const BOSS_SIZES =", u"""// ---------- giant dragon (form 0 young, 1 red, 2 three-headed, 3 shadow) ----------
const DRAGON_SIZE = [[100, 68], [128, 88], [152, 112], [142, 98]];
function dragonHead(P, hx, hy, C, open) {
  P.tri(hx - 10, hy - 6, hx - 4, hy - 8, hx - 22, hy - 24, C.horn); P.tri(hx - 5, hy - 8, hx + 1, hy - 8, hx - 12, hy - 26, C.horn);
  P.ell(hx, hy, 13, 9, C.body); P.rect(hx + 6, hy - 4, 16, 8, C.body); P.rect(hx + 6, hy + (open ? 4 : 3), 15, open ? 6 : 3, C.dark);
  if (open) P.rect(hx + 8, hy + 3, 12, 4, '#ff8a2a');
  P.ell(hx - 2, hy - 2, 4, 3, C.dark); P.rect(hx - 4, hy - 5, 5, 3, C.eye); P.px(hx - 3, hy - 4, '#fff');
  P.px(hx + 20, hy - 2, C.dark); P.px(hx + 17, hy - 2, C.dark);
  for (let i = 0; i < 4; i++) { P.tri(hx + 8 + i * 4, hy + 3, hx + 11 + i * 4, hy + 3, hx + 9 + i * 4, hy + 8 + (open ? 3 : 0), 'w'); }
  P.line(hx - 9, hy - 6, hx + 2, hy - 3, C.dark, 2);
}
function dragonPaint(P, form, wing) {
  const sh = form === 3;
  const C = sh ? { body: '#2a1c4a', dark: '#120c24', belly: '#4a2a78', bellyD: '#331e58', wing: '#1a1238', wingL: '#3a2468', bone: '#8a7aa8', eye: '#ff3aff', horn: '#a898c8', spike: '#a15be0' }
    : (form === 0 ? { body: '#e8793a', dark: '#a8452a', belly: '#ffe08a', bellyD: '#e0b050', wing: '#b8452a', wingL: '#e0703a', bone: '#e8dfc0', eye: '#fff033', horn: '#e8dfc0', spike: '#ffd34e' }
      : { body: '#d03a30', dark: '#8e2335', belly: '#ffd34e', bellyD: '#d9a030', wing: '#8a1f33', wingL: '#c84050', bone: '#e8dfc0', eye: '#ffe033', horn: '#e8dfc0', spike: '#f08a2b' });
  // far wing
  const wingPts = wing === 0 ? [[64, 42], [44, 6], [12, 12], [76, 2], [104, 20]] : [[64, 46], [18, 70], [50, 80], [86, 78], [108, 60]];
  const far = (dx, dy) => wingPts.map(p => [p[0] + dx, p[1] + dy]);
  { const w = far(10, -6); P.tri(w[0][0], w[0][1], w[1][0], w[1][1], w[2][0], w[2][1], C.dark); P.tri(w[0][0], w[0][1], w[1][0], w[1][1], w[3][0], w[3][1], C.dark); P.tri(w[0][0], w[0][1], w[3][0], w[3][1], w[4][0], w[4][1], C.dark); }
  // tail
  P.ell(32, 58, 14, 10, C.body); P.ell(19, 63, 10, 7, C.body); P.ell(10, 67, 7, 5, C.body); P.ell(4, 70, 4, 3, C.body); P.ell(34, 62, 12, 5, C.dark);
  P.tri(0, 62, 10, 66, 0, 78, C.spike); P.tri(2, 66, 9, 68, 2, 76, C.dark);
  // body
  P.ell(60, 54, 32, 18, C.body); P.ell(60, 62, 28, 10, C.dark); P.ell(62, 62, 24, 9, C.belly);
  for (let i = 0; i < 5; i++) P.rect(48 + i * 6, 56 + (i % 2), 3, 12, C.bellyD);
  for (let i = 0; i < 8; i++) P.tri(30 + i * 8, 42, 37 + i * 8, 42, 33 + i * 8, 32 + (i % 2) * 2, C.spike);
  // legs
  P.rect(44, 68, 10, 13, C.body); P.rect(70, 68, 10, 13, C.body); P.rect(42, 79, 14, 3, C.bone); P.rect(68, 79, 14, 3, C.bone);
  for (let i = 0; i < 3; i++) { P.tri(43 + i * 4, 82, 46 + i * 4, 82, 44 + i * 4, 86, C.bone); P.tri(69 + i * 4, 82, 72 + i * 4, 82, 70 + i * 4, 86, C.bone); }
  // neck + head(s)
  const neck = (x0, y0, x1, y1) => { P.line(x0, y0, x1, y1, C.body, 9); P.ell(x1, y1, 6, 6, C.body); };
  if (form === 2) {
    neck(84, 46, 98, 62); dragonHead(P, 108, 64, C, false);
    neck(84, 44, 90, 14); dragonHead(P, 98, 10, C, wing === 1);
    neck(84, 46, 104, 34); dragonHead(P, 114, 32, C, true);
  } else { neck(84, 46, 98, 30); dragonHead(P, 110, 28, C, wing === 1); }
  // near wing
  { const w = wingPts, mem = C.wing;
    P.tri(w[0][0], w[0][1], w[1][0], w[1][1], w[2][0], w[2][1], mem); P.tri(w[0][0], w[0][1], w[1][0], w[1][1], w[3][0], w[3][1], C.wingL); P.tri(w[0][0], w[0][1], w[3][0], w[3][1], w[4][0], w[4][1], mem);
    for (let i = 1; i < 5; i++) P.line(w[0][0], w[0][1], w[i][0], w[i][1], C.bone, 2);
    P.px(w[1][0], w[1][1], '#fff'); }
  if (sh) { for (let i = 0; i < 9; i++) { const x = 20 + i * 11; P.line(x, 70, x - 4 + (i % 3) * 3, 92 - (i % 4) * 3, '#a15be0', 1); } P.px(72, 50, '#ff3aff'); P.px(64, 58, '#ff3aff'); }
}
const _drag = {};
function dragonSprite(form, wing) {
  const key = form + '_' + wing;
  if (!_drag[key]) { const d = DRAGON_SIZE[form]; const k = form === 0 ? 0.78 : 1; _drag[key] = paint(d[0], d[1], P => { if (k === 1) dragonPaint(P, form, wing); else {
    const r = Math.round, S = { px: (x, y, c) => P.px(r(x * k), r(y * k), c), rect: (x, y, w, h, c) => P.rect(r(x * k), r(y * k), Math.max(1, r(w * k)), Math.max(1, r(h * k)), c), ell: (x, y, rx, ry, c) => P.ell(r(x * k), r(y * k), Math.max(1, r(rx * k)), Math.max(1, r(ry * k)), c), tri: (a, b, c, d2, e, f, col) => P.tri(r(a * k), r(b * k), r(c * k), r(d2 * k), r(e * k), r(f * k), col), line: (a, b, c, d2, col, t) => P.line(r(a * k), r(b * k), r(c * k), r(d2 * k), col, Math.max(1, r((t || 1) * k))), both: f => P.both(f), poly: (pts, c, t) => P.poly(pts.map(p => [r(p[0] * k), r(p[1] * k)]), c, t) };
    dragonPaint(S, form, wing); } }, form === 3 ? '#a15be0' : null); }
  return _drag[key];
}

const BOSS_SIZES =""")
rep("  cage: [24, 34, P => {", u"""  dragon_head: [34, 34, P => { const C = { body: '#d03a30', dark: '#8e2335', eye: '#ffe033', horn: '#e8dfc0' }; dragonHead(P, 12, 18, C, true); }],
  cage: [24, 34, P => {""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
