import io
p = 'src/art.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:80]
    s = s.replace(old, new, cnt)


rep("const BOSS_SIZES =", u"""// ---------- story characters (painted) ----------
const NPC_PAINT = {
  // Hatsune Miku-style singer: teal twin-tails, headset  (rename in game.js: MIKU_NAME)
  npc_miku: [28, 38, P => {
    P.both(() => { P.ell(4, 22, 3, 15, 'c'); P.ell(3, 26, 1, 9, 'C'); P.ell(4, 36, 2, 1, 'C'); P.rect(1, 6, 6, 2, 'D'); P.px(3, 6, 'r'); });
    P.ell(14, 12, 10, 9, 'c'); P.rect(5, 9, 18, 4, 'c'); P.ell(14, 14, 7, 7, 's');
    P.both(() => { P.rect(10, 13, 2, 3, 'C'); P.px(10, 13, 'w'); P.px(10, 17, 'm'); P.px(11, 17, 'm'); P.rect(5, 11, 3, 5, 'D'); P.px(6, 12, 'c'); });
    P.rect(13, 18, 2, 1, 'm'); P.rect(12, 19, 4, 2, 's');
    P.poly([[6, 11], [8, 4], [14, 2], [20, 4], [22, 11]], 'D', 1);
    P.line(8, 17, 11, 19, 'D', 1);
    P.rect(8, 21, 12, 9, 'D'); P.rect(8, 21, 12, 1, 'l');
    P.both(() => { P.rect(5, 22, 3, 8, 'l'); P.rect(5, 22, 3, 1, 'w'); P.rect(5, 29, 3, 1, 'c'); });
    P.tri(13, 22, 15, 22, 14, 29, 'c'); P.rect(8, 22, 1, 7, 'c'); P.rect(19, 22, 1, 7, 'c');
    P.rect(7, 30, 14, 4, 'D'); P.rect(7, 31, 14, 1, 'c'); P.rect(7, 33, 14, 1, 'C');
    P.both(() => { P.rect(9, 34, 3, 4, 'k'); P.rect(9, 36, 3, 1, 'c'); });
  }],
  // Mr Shorty Phong: short, dapper villain with top hat, monocle, curled moustache, cane
  npc_shorty: [18, 20, P => {
    P.rect(5, 0, 8, 6, 'k'); P.rect(5, 4, 8, 1, 'r'); P.rect(3, 6, 12, 2, 'k'); P.rect(6, 1, 1, 3, 'D');
    P.ell(9, 11, 5, 4, 's'); P.px(7, 10, 'k'); P.px(11, 10, 'k'); P.rect(10, 9, 3, 1, 'y'); P.rect(12, 9, 1, 3, 'y'); P.px(11, 10, 'w');
    P.rect(6, 13, 6, 1, 'k'); P.px(5, 12, 'k'); P.px(12, 12, 'k'); P.px(4, 12, 'k'); P.px(13, 12, 'k'); P.rect(8, 15, 2, 1, 'R');
    P.tri(9, 15, 1, 19, 17, 19, 'D'); P.tri(9, 16, 5, 19, 13, 19, 'R'); P.rect(6, 15, 6, 4, 'D'); P.rect(8, 16, 2, 3, 'w'); P.px(9, 17, 'r');
    P.px(3, 16, 'w'); P.px(14, 16, 'w'); P.line(15, 14, 15, 19, 'n', 1); P.px(15, 13, 'y');
    P.rect(6, 19, 2, 1, 'k'); P.rect(10, 19, 2, 1, 'k');
  }],
  // QuanSadBoy: bookworm wizard, glasses, drooping hat, big red book
  npc_quan: [20, 26, P => {
    P.tri(5, 9, 15, 9, 11, 0, 'B'); P.tri(9, 3, 15, 9, 17, 6, 'B'); P.rect(3, 9, 14, 2, 'b'); P.px(8, 5, 'y'); P.px(11, 7, 'y'); P.px(6, 8, 'y');
    P.rect(5, 11, 10, 3, 'N'); P.px(4, 13, 'N'); P.px(15, 13, 'N');
    P.ell(10, 15, 5, 4, 's');
    P.rect(5, 13, 4, 3, 'w'); P.rect(11, 13, 4, 3, 'w'); P.rect(6, 14, 2, 1, 'S'); P.rect(12, 14, 2, 1, 'S'); P.px(7, 14, 'k'); P.px(13, 14, 'k'); P.px(9, 14, 'w'); P.px(10, 14, 'w');
    P.px(8, 18, 'k'); P.px(9, 17, 'k'); P.px(10, 17, 'k'); P.px(11, 18, 'k'); P.px(6, 17, 'c'); P.px(6, 18, 'c');
    P.rect(4, 19, 12, 7, 'b'); P.rect(4, 19, 12, 1, 'B'); P.rect(2, 20, 3, 5, 'b');
    P.rect(5, 20, 10, 5, 'r'); P.rect(5, 20, 10, 1, 'R'); P.rect(6, 22, 8, 1, 'y'); P.rect(14, 21, 1, 3, 'w'); P.rect(15, 20, 3, 5, 's');
    P.rect(5, 25, 4, 1, 'k'); P.rect(11, 25, 4, 1, 'k');
  }],
  // Cage that holds the singer
  cage: [24, 34, P => {
    P.rect(1, 0, 22, 3, 'q'); P.rect(1, 31, 22, 3, 'q'); P.rect(1, 0, 22, 1, 'A');
    for (let i = 0; i < 6; i++) { P.rect(2 + i * 4, 3, 2, 28, 'A'); P.rect(2 + i * 4, 3, 1, 28, 'a'); }
    P.rect(1, 14, 22, 2, 'q'); P.rect(10, 12, 4, 6, 'Y'); P.px(11, 14, 'k'); P.px(11, 15, 'k');
  }]
};
function npcSpr(name) {
  if (!NPC_PAINT[name]) return getSprite(name);
  const key = 'np_' + name;
  if (!_cache[key]) { const d = NPC_PAINT[name]; _cache[key] = paint(d[0], d[1], d[2]); }
  return _cache[key];
}

// ---------- giant devil (Quoc) for the cutscenes ----------
function devilSprite() {
  if (_cache.devil) return _cache.devil;
  _cache.devil = paint(150, 128, P => {
    // flames behind
    P.both(() => { for (let i = 0; i < 6; i++) { P.tri(8 + i * 11, 70, 20 + i * 11, 70, 12 + i * 11, 26 + (i % 2) * 12 - i * 3, i % 2 ? 'o' : 'r'); P.tri(12 + i * 11, 70, 18 + i * 11, 70, 14 + i * 11, 44 + (i % 2) * 8, 'y'); } });
    // shoulders / torso
    P.ell(75, 118, 56, 22, 'R'); P.ell(75, 114, 52, 18, 'r'); P.ell(75, 120, 40, 12, 'R');
    P.both(() => { P.ell(26, 108, 14, 10, 'R'); P.tri(16, 100, 24, 98, 14, 86, 'e'); P.tri(28, 99, 34, 98, 32, 84, 'E'); P.line(48, 112, 62, 124, 'R', 2); });
    P.ell(75, 94, 20, 14, 'R');
    // ears, horns
    P.both(() => {
      P.tri(46, 52, 32, 46, 46, 70, 'r'); P.tri(44, 54, 36, 50, 44, 64, 'R');
      P.tri(48, 36, 62, 30, 22, 4, 'e'); P.tri(40, 22, 50, 28, 14, 0, 'E'); P.tri(24, 6, 30, 10, 12, 8, 'e');
      P.tri(18, 14, 24, 12, 6, 2, 'E');
    });
    // head
    P.ell(75, 60, 34, 36, 'r'); P.ell(91, 66, 20, 28, 'R'); P.ell(75, 74, 30, 22, 'r'); P.ell(88, 78, 18, 14, 'R');
    P.both(() => { P.line(46, 38, 72, 50, 'k', 5); P.ell(62, 54, 8, 4, 'k'); P.ell(62, 54, 6, 3, 'y'); P.ell(62, 54, 3, 2, 'o'); P.px(63, 54, 'k'); P.px(61, 53, 'w'); });
    P.rect(72, 60, 3, 8, 'R'); P.px(70, 70, 'k'); P.px(79, 70, 'k');
    // mouth with fangs
    P.rect(52, 78, 46, 18, 'k'); P.rect(56, 90, 38, 5, 'm'); P.ell(75, 92, 14, 3, 'R');
    for (let i = 0; i < 8; i++) { P.tri(54 + i * 5, 78, 59 + i * 5, 78, 57 + i * 5, 84 + (i % 2) * 2, 'w'); P.tri(55 + i * 5, 96, 60 + i * 5, 96, 58 + i * 5, 90 - (i % 2) * 2, 'w'); }
    P.both(() => { P.tri(54, 78, 62, 78, 58, 96, 'w'); P.tri(55, 80, 59, 80, 57, 90, 'a'); });
    // crown of embers
    for (let i = 0; i < 5; i++) P.tri(56 + i * 9, 30, 62 + i * 9, 30, 59 + i * 9, 18 - (i % 2) * 6, i % 2 ? 'y' : 'o');
  }, '#2a0608');
  return _cache.devil;
}

// leek sword (Miku's gift): long glowing negi, handle on the left
function leekSprite() {
  if (_cache.leek) return _cache.leek;
  _cache.leek = paint(30, 9, P => {
    P.rect(1, 3, 8, 4, 'w'); P.rect(1, 3, 8, 1, 'e'); P.rect(1, 6, 8, 1, 'E'); P.px(0, 4, 'e'); P.px(0, 5, 'E'); P.rect(2, 2, 1, 1, 'e'); P.rect(4, 7, 1, 1, 'E');
    P.rect(9, 2, 2, 5, 'x'); P.rect(9, 2, 2, 1, 't');
    P.rect(11, 3, 12, 3, 'g'); P.rect(11, 3, 12, 1, 't'); P.rect(11, 5, 12, 1, 'G');
    P.tri(22, 2, 22, 7, 29, 4, 'g'); P.tri(22, 3, 22, 4, 28, 4, 't');
    P.px(14, 4, 'w'); P.px(19, 4, 'w');
  });
  return _cache.leek;
}

const BOSS_SIZES =""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
