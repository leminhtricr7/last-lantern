import io,re
p='src/art.js'
s=io.open(p,encoding='utf-8').read()
a=s.index('function lyraPaint(P, leek) {')
b=s.index('const NPC_PAINT = {')
new='''function lyraPaint(P, leek) {
  // Princess Lyra: original design - long wavy aqua hair, golden tiara, flowing white-and-azure ball gown
  const H = '#46c9d6', HD = '#2a9aae', HL = '#b5f5f2', SK = '#ffe4d6', G = '#ffd34e', GD = '#c89a1c', DR = '#f4fbff', DB = '#5aa8e8', DD = '#3a78c8';
  // long hair behind the body
  P.ell(16, 24, 12, 13, H); P.rect(5, 18, 22, 16, H); P.ell(9, 35, 4, 3, HD); P.ell(23, 35, 4, 3, HD); P.ell(16, 36, 5, 2, HD);
  P.rect(7, 22, 1, 10, HL); P.rect(24, 24, 1, 8, HL);
  // gown: bodice, sash, wide layered skirt
  P.rect(11, 23, 10, 6, DR); P.rect(11, 23, 10, 1, 'w'); P.rect(11, 27, 10, 2, G); P.px(16, 27, '#ff7fb0'); P.px(16, 28, '#ff7fb0');
  P.tri(8, 37, 24, 37, 16, 28, DR); P.rect(8, 33, 16, 5, DR); P.rect(8, 36, 16, 2, DB); P.rect(8, 37, 16, 1, DD);
  for (let i = 0; i < 4; i++) P.rect(10 + i * 4, 31, 1, 6, '#cfe8ff');
  P.rect(11, 34, 10, 1, HL);
  // puff sleeves
  P.both(() => { P.ell(9, 25, 3, 3, DR); P.rect(7, 28, 3, 5, DR); P.rect(7, 31, 3, 2, DB); P.rect(7, 33, 3, 2, SK); });
  // head
  P.ell(16, 14, 9, 9, SK);
  // hair front: side-swept bangs + side locks
  P.ell(16, 9, 10, 6, H); P.rect(6, 9, 20, 4, H);
  P.tri(6, 9, 15, 9, 8, 21, H); P.tri(26, 9, 17, 9, 24, 21, H); P.tri(9, 13, 16, 7, 18, 14, HD);
  P.rect(8, 12, 1, 6, HL);
  // face
  P.both(() => { P.rect(11, 15, 3, 4, '#2a6ac8'); P.rect(11, 15, 3, 1, 'D'); P.px(11, 16, 'w'); P.px(12, 18, '#9ff0ff'); P.rect(9, 19, 3, 2, '#ffa0b4'); });
  P.px(16, 20, '#d0405a'); P.px(15, 20, '#ff9fb8');
  // tiara + gem + ribbon bow at the nape
  P.rect(10, 5, 12, 2, G); P.tri(10, 5, 12, 5, 11, 1, G); P.tri(15, 5, 17, 5, 16, 0, G); P.tri(20, 5, 22, 5, 21, 1, G);
  P.rect(10, 6, 12, 1, GD); P.px(16, 3, '#ff7fb0'); P.px(16, 2, 'w'); P.px(11, 2, 'w'); P.px(21, 2, 'w');
  P.both(() => { P.tri(5, 22, 2, 19, 3, 26, '#ff7fb0'); });
  // star sparkles
  P.px(3, 8, 'w'); P.px(29, 12, 'w'); P.px(28, 5, G);
  if (leek) {
    P.rect(27, 21, 2, 11, '#e8f5d0'); P.rect(27, 21, 1, 11, 'w'); P.rect(26, 12, 4, 9, '#4fc84f'); P.rect(26, 12, 1, 9, '#8af08a'); P.px(28, 11, '#4fc84f'); P.px(27, 31, SK); P.px(28, 31, SK);
  }
}
'''
s=s[:a]+new+s[b:]
s=s.replace("// Lyra Blue: chibi songstress, teal twin-tails + headset. npc_lyra = free, npc_lyra_leek = caged (holding her leek)","// Princess Lyra: original aqua-haired princess in a gown. npc_lyra = free, npc_lyra_leek = caged (holding her leek)")
io.open(p,'w',encoding='utf-8').write(s)
p='src/game.js'
s=io.open(p,encoding='utf-8').read()
s=s.replace("const LYRA_NAME = { en: 'Lyra Blue', vi: 'Lyra Blue' };","const LYRA_NAME = { en: 'Princess Lyra', vi: 'Công chúa Lyra' };")
io.open(p,'w',encoding='utf-8').write(s)
