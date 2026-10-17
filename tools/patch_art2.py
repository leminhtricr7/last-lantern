import io
p = 'src/art.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, cnt)


# ---- new NPC sprites (added into ART via Object.assign block) ----
rep("// decor (no outline)", u"""const withHammer = rows => rows.map((r, i) => {
  if (i >= 5 && i <= 7) return r.substr(0, 12) + 'AAAA';
  if (i >= 8 && i <= 13) return r.substr(0, 14) + 'n' + r.substr(15);
  return r;
});
const withStaff = rows => rows.map((r, i) => {
  if (i >= 1 && i <= 3) return r.substr(0, 13) + 'ccc';
  if (i >= 4 && i <= 17) return r.substr(0, 15) + 'n';
  return r;
});
Object.assign(ART, {
  npc_smith: [withHammer([
    '..e..........e..',
    '..ee........ee..',
    '...aaaaaaaaaa...',
    '...aAAAAAAAAa...',
    '...ssssssssss...',
    '...ssksssskss...',
    '...ssssssssss...',
    '...ssooooooss...',
    '..oooooooooooo..',
    '..ooooooooooo...',
    '...oooooooooo...',
    '..nnnnnnnnnnnn..',
    '.snnnnnNNnnnnns.',
    '.snnnnnNNnnnnns.',
    '..nnnnnnnnnnnn..',
    '..NNNNNNNNNNNN..',
    '...qq......qq...',
    '..AAA......AAA..'
  ])],
  npc_wizard: [withStaff([
    '.......p........',
    '......ppp.......',
    '.....ppyppp.....',
    '....ppppppp.....',
    '...pppppppppp...',
    '..PPPPPPPPPPPP..',
    '....ssssssss....',
    '....sskssksS....',
    '...wwwwwwwwwww..',
    '...wwwwwwwwwww..',
    '..bbwwwwwwwwbb..',
    '..bbbwwwwwwbbb..',
    '.bbbbbwwwwbbbbb.',
    '.bbbbbbbbbbbbbb.',
    '.bbPbbbbbbbbPbb.',
    '.bbbbbbbbbbbbbb.',
    '.BBBBBBBBBBBBBB.',
    '..nn........nn..'
  ])],
  npc_fairy: [[
    '...cc....cc...',
    '..cwwc..cwwc..',
    '.cwwwcyycwwwc.',
    '.cwwcyyyycwwc.',
    '..ccyssssycc..',
    '....yskksy....',
    '....ssssss....',
    '.....mmmm.....',
    '....mmmmmm....',
    '.....mmmm.....',
    '.....s..s.....'
  ]]
});

// decor (no outline)""")

# ---- item / puzzle icons ----
rep("const BOSS_SIZES =", u"""const TORCH_COLORS = ['#ffd34e', '#ff6a3a', '#6ee7f2', '#c07bff', '#a4e86b'];
const _ic = {};
function icon(name, a, b) {
  const key = name + '|' + a + '|' + b;
  if (_ic[key]) return _ic[key];
  const D = {
    dagger: [12, 12, P => { P.line(3, 9, 9, 3, 'a', 2); P.line(4, 9, 9, 4, 'A', 1); P.px(10, 2, 'w'); P.line(1, 11, 3, 9, 'n', 2); P.rect(2, 7, 4, 2, 'Y'); }],
    bomb: [12, 13, P => { P.ell(6, 8, 5, 5, 'D'); P.px(4, 6, 'd'); P.px(5, 5, 'w'); P.rect(5, 2, 3, 2, 'q'); P.line(7, 2, 9, 0, 'n', 1); P.px(10, 0, 'o'); P.px(10, 1, 'y'); }],
    flask: [10, 13, P => { P.rect(4, 0, 2, 3, 'l'); P.rect(3, 0, 4, 1, 'n'); P.ell(5, 8, 4, 4, 'r'); P.ell(5, 9, 3, 3, 'o'); P.px(3, 6, 'w'); P.px(4, 6, 'w'); }],
    key: [13, 8, P => { P.ell(3, 3, 3, 3, 'y'); P.ell(3, 3, 1, 1, 'k'); P.rect(6, 3, 7, 2, 'y'); P.rect(10, 5, 2, 2, 'y'); P.rect(8, 5, 1, 2, 'y'); P.px(2, 1, 'w'); }],
    lever: [14, 14, P => { P.rect(2, 10, 10, 3, 'd'); P.rect(2, 10, 10, 1, 'l'); P.ell(7, 10, 2, 2, 'D'); if (a) { P.line(7, 10, 11, 3, 'n', 2); P.ell(11, 3, 2, 2, 'g'); } else { P.line(7, 10, 3, 3, 'n', 2); P.ell(3, 3, 2, 2, 'r'); } }],
    torch: [12, 20, P => {
      const c = TORCH_COLORS[a % 5];
      P.rect(5, 9, 2, 10, 'N'); P.rect(3, 17, 6, 3, 'N'); P.rect(2, 7, 8, 3, 'n'); P.rect(2, 7, 8, 1, 'E');
      P.ell(6, 13, 2, 2, c); P.px(5, 12, 'w');
      if (b) { P.tri(2, 7, 10, 7, 6, -1 + 0, c); P.tri(3, 7, 9, 7, 6, 1, c); P.tri(4, 7, 8, 7, 6, 3, 'w'); }
      else P.rect(5, 5, 2, 2, 'D');
    }],
    tablet: [14, 18, P => { P.ell(7, 4, 6, 3, 'd'); P.rect(1, 4, 12, 14, 'd'); P.rect(1, 4, 2, 14, 'l'); P.rect(11, 4, 2, 14, 'D'); P.rect(4, 6, 6, 1, 'c'); P.rect(4, 9, 2, 2, 'c'); P.rect(8, 9, 2, 2, 'c'); P.rect(4, 13, 6, 1, 'c'); }],
    rune: [18, 6, P => { const c = TORCH_COLORS[a % 5]; P.rect(0, 1, 18, 5, 'd'); P.rect(0, 1, 18, 1, 'l'); P.rect(0, 5, 18, 1, 'D'); P.rect(6, 2, 6, 3, b ? c : 'D'); if (b) { P.px(5, 3, c); P.px(12, 3, c); } }],
    tbox: [10, 10, P => { P.rect(0, 0, 10, 10, TORCH_COLORS[a % 5]); }],
    r0: [16, 16, P => { P.ell(8, 11, 7, 4, 'G'); P.rect(2, 7, 12, 5, 'g'); P.tri(2, 7, 5, 7, 3, 2, 'y'); P.tri(6, 7, 10, 7, 8, 1, 'y'); P.tri(11, 7, 14, 7, 13, 2, 'y'); P.rect(2, 6, 12, 3, 'y'); P.px(8, 7, 'r'); P.ell(5, 13, 1, 2, 't'); P.ell(11, 14, 1, 2, 't'); }],
    r1: [16, 16, P => { P.tri(3, 2, 13, 2, 8, 15, 'w'); P.tri(5, 3, 11, 3, 8, 12, 'e'); P.rect(3, 1, 10, 2, 'D'); P.ell(8, 14, 1, 2, 'g'); P.px(7, 10, 'g'); P.px(8, 8, 'G'); }],
    r2: [16, 16, P => { P.rect(4, 3, 8, 11, 'A'); P.rect(5, 4, 6, 9, 'k'); P.ell(8, 8, 2, 4, 'c'); P.ell(8, 8, 1, 2, 'w'); P.rect(3, 1, 10, 2, 'Y'); P.rect(7, 0, 2, 1, 'Y'); P.rect(3, 14, 10, 2, 'Y'); }],
    r3: [16, 16, P => { P.ell(8, 9, 5, 6, 'y'); P.ell(8, 4, 3, 2, 'Y'); P.rect(7, 6, 2, 8, 'b'); P.line(3, 6, 1, 3, 'Y', 1); P.line(13, 6, 15, 3, 'Y', 1); P.px(6, 4, 'k'); P.px(10, 4, 'k'); P.ell(8, 9, 2, 3, 'b'); }],
    r4: [16, 16, P => { P.ell(5, 6, 3, 3, 'c'); P.ell(11, 6, 3, 3, 'c'); P.tri(2, 7, 14, 7, 8, 15, 'c'); P.px(4, 4, 'w'); P.px(5, 4, 'w'); P.tri(2, 3, 4, 1, 3, -1 + 1, 'w'); P.tri(12, 3, 14, 1, 13, 0, 'w'); P.line(8, 6, 8, 11, 'w', 1); }],
    r5: [16, 16, P => { P.ell(8, 8, 7, 7, 'D'); P.ell(8, 8, 5, 5, 'r'); P.ell(8, 8, 3, 3, 'o'); P.ell(8, 8, 1, 1, 'y'); P.line(3, 5, 6, 7, 'k', 1); P.line(12, 11, 10, 9, 'k', 1); }],
    r6: [16, 16, P => { P.ell(8, 8, 4, 4, 'y'); P.ell(8, 8, 2, 2, 'w'); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; P.line(Math.round(8 + Math.cos(an) * 5), Math.round(8 + Math.sin(an) * 5), Math.round(8 + Math.cos(an) * 7), Math.round(8 + Math.sin(an) * 7), 'y', 1); } }]
  }[name];
  _ic[key] = paint(D[0], D[1], D[2]);
  return _ic[key];
}

const BOSS_SIZES =""")

# ---- tileset: gate + cracked wall ----
rep("  // decor sprites\n  T.decor =", u"""  // puzzle gate (bars) + cracked wall
  { const [c, x] = mkCanvas(16, 16);
    x.fillStyle = '#2a2f4a'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#8d9bbd'; for (let i = 0; i < 4; i++) { x.fillRect(1 + i * 4, 0, 2, 16); }
    x.fillStyle = '#d6deee'; for (let i = 0; i < 4; i++) { x.fillRect(1 + i * 4, 0, 1, 16); }
    x.fillStyle = '#434d6e'; x.fillRect(0, 2, 16, 2); x.fillRect(0, 12, 16, 2);
    x.fillStyle = B.spike[0]; x.fillRect(7, 7, 2, 2);
    T.gate = c; }
  { const [c, x] = mkCanvas(16, 16);
    x.drawImage(T.body[1], 0, 0);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#14121f'; x.fillRect(7, 0, 1, 4); x.fillRect(6, 4, 1, 3); x.fillRect(8, 7, 1, 3); x.fillRect(7, 10, 1, 3); x.fillRect(6, 13, 1, 3); x.fillRect(3, 6, 3, 1); x.fillRect(10, 9, 3, 1); x.fillRect(11, 3, 1, 3);
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(8, 0, 1, 3); x.fillRect(9, 7, 1, 2);
    T.cracked = c; }
  // decor sprites
  T.decor =""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
