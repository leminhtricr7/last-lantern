# Phase 2B (secret): the "7 Wish Orbs + green wish dragon" secret looked too much like Dragon Ball. It is now
# Lyra's Seven Notes: a crystal music note hidden in each of seven lands (one colour each, red to violet). With all
# seven, Lyra sings her whole song and the Lightcrane, a crane made of light, glides across the sky and grants one
# wish. Same places, same reward (+1 max heart, +1 damage, +10 Star Gems). The save keys (save.orbs, save.wish) stay.
import io
def edit(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, s.count(a), a[:110])
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

edit('src/scenery.js', [
 ("  wishorb: [12, 12, P => { P.ell(6, 6, 5, 5, 'o'); P.ell(6, 5, 4, 4, '#ffb04a'); P.ell(4, 3, 1, 1, '#fff6c0'); }]\n};", "};"),
 ("// seven Wish Orbs (one star more on each) hidden in seven lands\nconst ORB_MAPS = [0, 1, 2, 3, 4, 5, 9];",
  """// Lyra's seven notes, one hidden in each of seven lands (the n-th note in the n-th land); a crystal music note in its own colour
const ORB_MAPS = [0, 1, 2, 3, 4, 5, 9];
const NOTE_COL = [['#ff5a5a', '#ffc8c8'], ['#ff9a3a', '#ffdcb0'], ['#ffd34e', '#fff3b8'], ['#7ed957', '#d8ffc8'], ['#6ee7f2', '#dcfcff'], ['#5a8bff', '#cddcff'], ['#c07bff', '#eedcff']];
function noteSprite(n) {
  const key = 'note_' + n;
  if (!_cache[key]) { const c = NOTE_COL[(n - 1) % 7]; _cache[key] = paint(12, 16, P => { P.ell(4, 12, 3, 2, c[0]); P.rect(6, 2, 2, 11, c[0]); P.tri(8, 2, 8, 7, 11, 6, c[0]); P.px(3, 11, c[1]); P.px(4, 11, c[1]); P.rect(6, 3, 1, 7, c[1]); P.px(9, 4, c[1]); }, '#14121f'); }
  return _cache[key];
}"""),
])

edit('src/game.js', [
 # the note in the world
 ("""      } else if (it.kind === 'orb') {
        const by = y + Math.round(Math.sin(it.ph * 2) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 11, '#ffb04a'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawSpr(g, eggSprite('wishorb'), x, by + 7, false);
        g.fillStyle = '#e0453a'; for (let k = 0; k < it.n; k++) { const a = k / Math.max(1, it.n) * 6.283; g.fillRect(Math.round(x + (it.n > 1 ? Math.cos(a) * 2.5 : 0)) - 1, Math.round(by + 1 + (it.n > 1 ? Math.sin(a) * 2.5 : 0)) - 1, 2, 2); }""",
  """      } else if (it.kind === 'orb') {   // one of Lyra's seven notes
        const by = y + Math.round(Math.sin(it.ph * 2) * 2), col = NOTE_COL[(it.n - 1) % 7][0];
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 11, col); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawSpr(g, noteSprite(it.n), x, by + 8, false);"""),
 # picking one up
 ("it.dead = true; if (save.orbs.indexOf(Q.li) < 0) save.orbs.push(Q.li); writeSave(); Snd.play('shard'); emit(it.x, it.y, 30, { col: ['#ffb04a', '#ffd34e', '#fff'], sp0: 20, sp1: 120 }); addRing(it.x, it.y, '#ffb04a', 40, 0.5);",
  "it.dead = true; if (save.orbs.indexOf(Q.li) < 0) save.orbs.push(Q.li); writeSave(); Snd.play('chime'); const nc = NOTE_COL[(it.n - 1) % 7][0]; emit(it.x, it.y, 30, { col: [nc, '#ffd34e', '#fff'], sp0: 20, sp1: 120 }); addRing(it.x, it.y, nc, 40, 0.5);"),
 ("{ en: 'The seven Wish Orbs shine together... the sky turns dark... and a great green dragon rises from the light!', vi: 'Bảy viên Ngọc Ước cùng phát sáng... bầu trời tối sầm... và một con rồng xanh khổng lồ bay lên từ ánh sáng!' },",
  "{ en: 'The seven notes ring out together. Lyra sings her whole song for the first time... and a crane made of light glides across the sunless sky!', vi: 'Bảy nốt nhạc cùng vang lên. Lyra hát trọn bài ca lần đầu tiên... và một con hạc bằng ánh sáng lướt ngang bầu trời không mặt trời!' },"),
 ("} else { Q.msg = sv('Wish Orb with ', 'Ngọc Ước ') + it.n + sv(' stars! (', ' sao! (') + save.orbs.length + '/7)' + sv(' Gather all seven...', ' Hãy gom đủ bảy viên...'); Q.msgT = 4; }",
  "} else { Q.msg = sv(\"Lyra's note \", 'Nốt nhạc thứ ') + it.n + sv('! (', ' của Lyra! (') + save.orbs.length + '/7)' + sv(' Find all seven...', ' Hãy tìm đủ bảy nốt...'); Q.msgT = 4; }"),
 # the Lightcrane instead of the green dragon
 ("    if (Q.wishT > 0) drawWishDragon();", "    if (Q.wishT > 0) drawLightCrane();"),
])

# the Lightcrane replaces the whole green-dragon drawing
p = 'src/game.js'; t = io.open(p, encoding='utf-8').read()
i = t.index("  // the green wish dragon winding across the sky\n  function drawWishDragon() {")
j = t.index("\n  }\n", i) + len("\n  }\n")
t = t[:i] + """  // the Lightcrane: a crane made of light that glides across the sunless sky when Lyra sings all seven notes
  function craneSprite(up) {
    const key = 'crane' + up;
    if (!_cache[key]) _cache[key] = paint(40, 30, P => {   // faces right; wings up (1) or down (0)
      const W = '#fff6dc', D = '#e8dcc0', K = '#3a3a5a', S = '#ffd34e';
      if (up) { P.tri(14, 14, 24, 13, 12, 0, D); P.tri(12, 14, 22, 14, 6, 1, W); P.tri(6, 1, 10, 2, 4, 5, K); }
      else { P.tri(14, 17, 24, 17, 14, 28, D); P.tri(12, 17, 22, 17, 8, 29, W); P.tri(8, 29, 12, 27, 6, 26, K); }
      P.line(10, 18, 1, 22, S, 1); P.line(11, 19, 2, 24, S, 1);   // legs trailing behind
      P.tri(8, 14, 8, 18, 3, 17, K);   // tail
      P.ell(16, 16, 8, 4, W); P.ell(16, 18, 6, 2, D);   // body
      P.line(22, 14, 31, 11, W, 2); P.rect(31, 9, 4, 3, W); P.px(32, 9, '#ff5a4a'); P.px(33, 10, '#14121f'); P.line(35, 10, 39, 11, S, 1);   // neck, head, beak
    }, null);
    return _cache[key];
  }
  function drawLightCrane() {
    const k = Q.wishT, a = Math.min(1, k / 1.5, (9 - k) / 1.5);
    g.globalAlpha = 0.35 * a; g.fillStyle = '#060a1e'; g.fillRect(0, 0, VW, VH);
    const cx = VW + 50 - (9 - k) * 64, cy = 64 + Math.sin(Q.t * 1.3) * 8;
    g.globalCompositeOperation = 'lighter';
    for (let i = 1; i < 26; i++) { g.globalAlpha = a * (1 - i / 26) * 0.7; g.fillStyle = i % 3 ? '#ffe08a' : '#ffffff'; g.fillRect(Math.round(cx + 14 + i * 6), Math.round(cy + 4 + Math.sin(Q.t * 1.3 - i * 0.2) * 3 + Math.sin(i * 1.7 + Q.t * 5) * 2), 2, 2); }   // a trail of light
    g.globalAlpha = a * 0.4; disc(g, Math.round(cx), Math.round(cy), 26, '#ffe08a');
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
    drawSpr(g, craneSprite(Math.floor(Q.t * 3) % 2), Math.round(cx), Math.round(cy + 24), true, false, 1.6, 1.6);
    g.globalAlpha = 1;
  }
""" + t[j:]
assert 'drawWishDragon' not in t
io.open(p, 'w', encoding='utf-8').write(t)
print('ok')
