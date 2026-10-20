'use strict';
// ============ PIXEL ART (all generated in code: sprites, tiles, backgrounds) ============
const VW = 384, VH = 216, TS = 16;
const BASE_VW = VW, BASE_VH = VH;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const PAL = {
  k: '#1b1626', w: '#f6f3e9', r: '#e0453a', R: '#8e2335', o: '#f08a2b', y: '#ffd34e', Y: '#c89a1c',
  g: '#5fcf5a', G: '#2b8a3e', t: '#a4e86b', b: '#4a8bf0', B: '#2a4a9c', c: '#6ee7f2', C: '#2c9ab8',
  p: '#a15be0', P: '#5a2d8f', n: '#9a6a3b', N: '#5a3a22', s: '#f2c394', S: '#d99a6a', l: '#b8bfd0',
  d: '#6a7090', D: '#2d3045', e: '#e8dfc0', E: '#b9a77a', m: '#ff7fb0', h: '#8e6bff',
  a: '#d6deee', A: '#8d9bbd', q: '#434d6e', f: '#ff6a3a', i: '#7a1a2a', x: '#c8f0a0', z: '#3a1a40'
};

// ---- sprite sources (fill only, outline is added automatically) ----
// Ember: 16x21 chibi warrior — steel helm with flame plume, glowing eyes, red scarf, pauldrons
const heroPad = r => '..' + r + '..';
// Ember: a taller, cooler Lanternbearer - flame-plume helm, spiked pauldrons, ragged scarf, separate arms with gauntlets, long armoured legs and boots
const heroTop = [
  ['......ofo.......', '.....oyyyo......'],
  ['.....o.o.o......', '......oyyo......']
].map(a => a.map(heroPad));
const heroBody = [
  '.....rrrrrr.....',
  '....aaaaaaaa....',
  '...aAAAAAAAAa...',
  '...aAaaaaaaAa...',
  '..AAqqqqqqqqAA..',
  '...AqqqyqqyqA...',
  '...AqqqyqqyqA...',
  '...AAAAAAAAAA...'
].map(heroPad).concat([
  'rrraarrrrrrrrrraa...',
  'rraAAAbbbbbbbbAAAa..',
  '...AA.bbbyybbb.AA...',
  '...qA.bbnnnnbb.Aq...',
  '...qq.AbbyybbA.qq...'
]);
const heroLegs = {
  idle: ['......AAbbbbAA......', '......AAA..AAA......', '......AAA..AAA......', '......qAq..qAq......', '......qqq..qqq......', '.....qqqq..qqqq.....'],
  runA: ['......AAbbbbAA......', '.....AAA....AAA.....', '....AAA......AAA....', '...qAq........qAq...', '...qqq........qqq...', '..qqqq........qqqq..'],
  runB: ['......AAbbbbAA......', '.......AAAAAA.......', '.......AAAAAA.......', '.......qAAAAq.......', '.......qqqqqq.......', '......qqqqqqqq......'],
  jump: ['......AAbbbbAA......', '.....AAAA..AAAA.....', '.....qAAq..qAAq.....', '.....qqqq..qqqq.....', '....................', '....................'],
  fall: ['......AAbbbbAA......', '.....AAA....AAA.....', '....AAq......qAA....', '....qqq......qqq....', '....................', '....................']
};
const rev = rows => rows.map(r => r.split('').reverse().join(''));
const heroFrame = (top, legs) => top.concat(heroBody, legs);
// ---- the full animator set (idle 4, walk 6, run 6, push 6, jump 6, hurt 3), all 21 rows tall so the feet stay put ----
Object.assign(heroLegs, {
  idleS: ['......AAbbbbAA......', '......AAA..AAA......', '......qAq..qAq......', '......qqq..qqq......', '.....qqqq..qqqq.....'],
  walkA: ['......AAbbbbAA......', '......AAA...AAA.....', '.....AAA.....AAA....', '.....qAq.....qAq....', '.....qqq.....qqq....', '....qqqq.....qqqq...'],
  walkB: ['......AAbbbbAA......', '......AAA..AAA......', '......AAA...AAA.....', '......qAq...qAq.....', '......qqq...qqq.....', '.....qqqq...qqqq....'],
  runC: ['......AAbbbbAA......', '.....AAA...AAAA.....', '....AAA.......AAq...', '...qAq.........qqq..', '...qqq..............', '..qqqq..............'],
  pushA: ['......AAbbbbAA......', '.....AAA....AA......', '....AAA.....AAA.....', '...qAq.......qAq....', '..qqq........qqq....', '.qqqq........qqqq...'],
  pushB: ['......AAbbbbAA......', '......AAA..AA.......', '.....AAA...AAA......', '....qAq.....qAq.....', '...qqq......qqq.....', '..qqqq......qqqq....'],
  pushC: ['......AAbbbbAA......', '.......AAAAA........', '......AAA.AAA.......', '.....qAq...qAq......', '....qqq....qqq......', '...qqqq....qqqq.....'],
  crouch: ['......AAbbbbAA......', '.....AAAA..AAAA.....', '....qAAq....qAAq....', '...qqqqq...qqqqq....'],
  land: ['......AAbbbbAA......', '.....AAA....AAA.....', '.....qAq....qAq.....', '.....qqq....qqq.....', '....qqqq....qqqq....']
});
const shiftRow = (r, n) => n > 0 ? '.'.repeat(n) + r.slice(0, r.length - n) : (n < 0 ? r.slice(-n) + '.'.repeat(-n) : r);
// lean: the head moves n pixels (forward = right, the way the sprite faces), the chest half as much; short legs = the body sinks
const HERO_META = {};
function heroPose(top, legs, lean) {
  lean = lean || 0; const sink = 6 - legs.length, W = 20, half = Math.round(lean / 2);
  const rows = [];
  for (let i = 0; i < sink; i++) rows.push('.'.repeat(W));
  top.forEach(r => rows.push(shiftRow(r, lean)));
  heroBody.forEach((r, i) => rows.push(shiftRow(r, i < 8 ? lean : half)));
  return { rows: rows.concat(legs), meta: { bx: lean, by: sink } };
}
function heroSet(name, poses) { HERO_META[name] = poses.map(p => p.meta); return poses.map(p => p.rows); }

const withSpear = rows => rows.map((r, i) => (i >= 3 ? r.substr(0, 14) + 'n' + r.substr(15) : (i >= 1 ? r.substr(0, 14) + 'a' + r.substr(15) : r)));
const ART = {
  npc_lila: [[
    '.....nnnnnn.....',
    '....nnnnnnnn....',
    '...nnNnnnnNnn...',
    '...nnssssssnn...',
    '...nsskssksnn...',
    '...nsmssssmsn...',
    '..nnnssssssnn...',
    '..n.nnssssnn....',
    '..n.gggggggg....',
    '..mggwwwwwwgg...',
    '...ggwwwwwwgg...',
    '..gggwwwwwwggg..',
    '..gggwwyywwggg..',
    '.gggggwwwwggggg.',
    '.gggggwwwwggggg.',
    '.GGGGGGGGGGGGGG.',
    '....ss....ss....',
    '....ss....ss....',
    '...nnn....nnn...'
  ]],
  npc_gob: [[
    '......NNNN......',
    '.....NnnnnN.....',
    '....NnnnnnnN....',
    '...NNNNNNNNNN...',
    'gg.gggggggggg.gg',
    '.gggggygggygggg.',
    '..gggggGGggggg..',
    '...gwgwgwgggg...',
    '....gggggggg....',
    '...nnnnnnnnnn...',
    '..nnnNnnnnNnnn..',
    '.gnnnNnnnnNnng..',
    '.gnnnnnnnnnnng..',
    '..nnnnnnnnnnnn..',
    '...NNNNNNNNNN...',
    '....gg....gg....',
    '...GGG....GGG...'
  ]],
  npc_angel: [[
    '......yyyyyy......',
    '.......yyyy.......',
    '.....yyyyyyyy.....',
    '....yyyyyyyyyy....',
    '....yyssssssyy....',
    '....yssksskssy....',
    '....yssssssssy....',
    '.....yysmmsyy.....',
    '......wwwwww......',
    '.lww.wwwwwwww.wwl.',
    'lwwwwwwwwwwwwwwwwl',
    'lwwwwwwyyywwwwwwwl',
    '.lwwwwwwyywwwwwwl.',
    '..lwwwwwwwwwwwwl..',
    '...lllwwwwwwlll...',
    '......wwwwww......',
    '......wwwwww......',
    '.....wwwwwwww.....',
    '....wwwwwwwwww....',
    '....wwwllllwww....'
  ]],
  npc_bram: [withSpear([
    '.......rr.......',
    '......rrrr......',
    '.....aaaaaa.....',
    '....aAAAAAAa....',
    '....AaaaaaaA....',
    '....AssksskA....',
    '....AssssssA....',
    '....ANNNNNNA....',
    '.....AssssA.....',
    '...aaAAAAAAaa...',
    '..aaArrrrrrAaa..',
    '..aAArrwwrrAAa..',
    '..AAArrrrrrAAA..',
    '..AAAAAAAAAAAA..',
    '...AAAAAAAAAA...',
    '....qq....qq....',
    '....AA....AA....',
    '...AAA....AAA...',
    '...qqq....qqq...'
  ])],
  hero_idle: [heroFrame(heroTop[0], heroLegs.idle), heroFrame(heroTop[1], heroLegs.idle)],
  hero_run: [heroFrame(heroTop[0], heroLegs.runA), heroFrame(heroTop[1], heroLegs.runB), heroFrame(heroTop[0], rev(heroLegs.runA)), heroFrame(heroTop[1], heroLegs.runB)],
  hero_jump: [heroFrame(heroTop[0], heroLegs.jump)],
  hero_fall: [heroFrame(heroTop[1], heroLegs.fall)],
  hero_idle4: heroSet('hero_idle4', [heroPose(heroTop[0], heroLegs.idle), heroPose(heroTop[1], heroLegs.idle), heroPose(heroTop[0], heroLegs.idleS), heroPose(heroTop[1], heroLegs.idleS)]),
  hero_walk: heroSet('hero_walk', [heroPose(heroTop[0], heroLegs.walkA), heroPose(heroTop[1], heroLegs.walkB), heroPose(heroTop[0], heroLegs.runB), heroPose(heroTop[1], rev(heroLegs.walkA)), heroPose(heroTop[0], rev(heroLegs.walkB)), heroPose(heroTop[1], heroLegs.runB)]),
  hero_run6: heroSet('hero_run6', [heroPose(heroTop[0], heroLegs.runA, 1), heroPose(heroTop[1], heroLegs.runC, 1), heroPose(heroTop[0], heroLegs.runB, 1), heroPose(heroTop[1], rev(heroLegs.runA), 1), heroPose(heroTop[0], rev(heroLegs.runC), 1), heroPose(heroTop[1], heroLegs.runB, 1)]),
  hero_push: heroSet('hero_push', [heroPose(heroTop[0], heroLegs.pushA, 2), heroPose(heroTop[1], heroLegs.pushB, 2), heroPose(heroTop[0], heroLegs.pushC, 2), heroPose(heroTop[1], heroLegs.pushA, 2), heroPose(heroTop[0], heroLegs.pushB, 2), heroPose(heroTop[1], heroLegs.pushC, 2)]),
  hero_jump6: heroSet('hero_jump6', [heroPose(heroTop[0], heroLegs.crouch), heroPose(heroTop[1], heroLegs.jump), heroPose(heroTop[0], heroLegs.jump), heroPose(heroTop[1], heroLegs.fall), heroPose(heroTop[0], heroLegs.fall), heroPose(heroTop[1], heroLegs.land)]),
  hero_hurt: heroSet('hero_hurt', [heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[0], heroLegs.idle, -1)]),
  slime: [[
    '....tttttt....',
    '..ttgggggggg..',
    '.tggggggggggg.',
    'gggwkgggwkgggg',
    'gggggggggggggg',
    'gggGgggggggGgg',
    '.GGGGGGGGGGGG.'
  ]],
  bat: [[
    'p..............p',
    'pp....p..p....pp',
    'ppp..pppppp..ppp',
    'pPppppwppwpppPpp',
    '.pPppppppppppPp.',
    '..pp..pppp..pp..',
    '......p..p......'
  ], [
    '................',
    '......p..p......',
    '....pppppppp....',
    '..ppppwppwpppp..',
    '.pPpppppppppppp.',
    'pPp..pppppp..pPp',
    'pp....pppp....pp',
    'p..............p'
  ]],
  spider: [[
    'D.D........D.D',
    '.D..DDDDDD..D.',
    '..DDPPPPPPDD..',
    'D.DPrPPPPrPD.D',
    '.DDPPPPPPPPDD.',
    'D..DPPPPPPD..D',
    '...D.DDDD.D...'
  ]],
  skeleton: [[
    '....eeee....',
    '...eeeeee...',
    '..eekkeeke..',
    '..eeeeeeee..',
    '...eekkee...',
    '....eeee....',
    '...eeeeee...',
    '..eEeeeeEe..',
    '..eEeeeeEe..',
    '..eeeEEeee..',
    '...eeeeee...',
    '....eeee....',
    '...ee..ee...',
    '...ee..ee...',
    '..eee..eee..',
    '..eee..eee..'
  ]],
  scorpion: [[
    'oo..............',
    '.oo.........oo..',
    '..oo......oooooo',
    '..ooooooooooo.oo',
    '.ooRoooRooooowko',
    '..oooooooooooooo',
    '..o.o.o.o.o.o...',
    '.o..o.o.o.o..o..'
  ]],
  snowman: [[
    '...DDDDDD...',
    '....DDDD....',
    '...wwwwww...',
    '..wwkwwkww..',
    '..wwwwoowww.',
    '...wwwwww...',
    '..wwwwwwww..',
    '.wwwlwwwwww.',
    '.wwwwwwwlww.',
    '.wwwwwwwwww.',
    '..wwwwwwww..',
    '...wwwwww...'
  ]],
  fire: [[
    '.....r......',
    '....rro.....',
    '...rroor....',
    '..rrooyor...',
    '..rooyyoor..',
    '.rooyyyyoor.',
    '.rooywkywor.',
    '.rooyyyyoor.',
    '..rooyyoor..',
    '...rroorr...',
    '....rrrr....'
  ]],
  ghost: [[
    '...wwwwww...',
    '..wwwwwwww..',
    '.wwwwwwwwww.',
    '.wwkkwwkkww.',
    '.wwkkwwkkww.',
    '.wwwwwwwwww.',
    '.wwwwwoowww.',
    '.wwwwwwwwww.',
    '.wwwwwwwwww.',
    '.ww.www.www.',
    '.w...w...w..'
  ]],
  golem: [[
    '....c......c....',
    '...cc.dddd.cc...',
    '....dddddddd....',
    '...ddyyddyydd...',
    '...dddddddddd...',
    '..dd.dddddd.dd..',
    '.dddddddddddddd.',
    'dddd.dccccd.dddd',
    'dddd.dccccd.dddd',
    'dddd.dddddd.dddd',
    '.ddd..dddddd.ddd',
    '....dddddddd....',
    '....dddddddd....',
    '...ddd....ddd...',
    '..dddd....dddd..',
    '..dddd....dddd..'
  ]],
  knight: [[
    '...DDDDDD...',
    '..DDPPPPDD..',
    '..DPmPPmPD..',
    '..DDPPPPDD..',
    '...DDDDDD...',
    '..PPDDDDPP..',
    '.PPDDPPDDPP.',
    '.PDDDPPDDDP.',
    '.PDDDDDDDDP.',
    '..DDDDDDDD..',
    '...DDDDDD...',
    '...DD..DD...',
    '...DD..DD...',
    '..DDD..DDD..',
    '..DDD..DDD..'
  ]],
  shard: [[
    '..y..',
    '.yYy.',
    'yYwYy',
    'yYwYy',
    '.yYy.',
    '..y..'
  ]],
  heart: [[
    '.rr.rr.',
    'rrrrrrr',
    'rrrrrrr',
    '.rrrrr.',
    '..rrr..',
    '...r...'
  ]]
};

// ---- horror redesign of monsters + new small monsters (override earlier entries) ----
Object.assign(ART, {
  slime: [[
    '.....tttttt.....',
    '...ttggggggtt...',
    '..tggggggggggt..',
    '.tggwwggggwwggt.',
    '.ggwwrwggwwrwggg',
    '.gggwwgggggwwggg',
    '.gggggggggggggg.',
    '.gkkkkkkkkkkkkg.',
    '.gkwkwkwkwkwkwg.',
    '..gkkkkkkkkkkg..',
    '..GGGGGGGGGGGG..',
    '...GGGGGGGGGG...'
  ]],
  bat: [[
    'pp............pp',
    'ppp....pp....ppp',
    'pPpp..pppp..pppP',
    'pPPppprpprppPPpp',
    '.pPppppwwppppPp.',
    '..pp..pwwp..pp..',
    '......p..p......'
  ], [
    '................',
    '......p..p......',
    '....pppppppp....',
    '..pppprpprpppp..',
    '.pPppppwwppppPp.',
    'pPp..ppwwpp..pPp',
    'pp....pppp....pp',
    'p..............p'
  ]],
  spider: [[
    'D..D........D..D',
    '.D..D.DDDD.D..D.',
    '..D.DDPPPPDD.D..',
    'D.DDPrrPPrrPDD.D',
    '.DDPPPrPPrPPPDD.',
    'D..DPPwPPwPPD..D',
    '...D.PPPPPP.D...',
    '......DDDD......'
  ]],
  skeleton: [[
    '....eeeeee....',
    '...eeeeeeee...',
    '..eekkeekkee..',
    '..ekrkeekrke..',
    '..eekkeekkee..',
    '...eeeeeeee...',
    '...ekekekee...',
    '....eeeeee....',
    '..eeeeeeeeeel.',
    '..eEeeeeeeEel.',
    '..eEeeeeeeEel.',
    '..eeeEEEEeeen.',
    '...eeeeeeee...',
    '....eeeeee....',
    '...ee....ee...',
    '...ee....ee...',
    '..eee....eee..',
    '..eee....eee..'
  ]],
  snowman: [[
    '...DDDDDD...',
    '....DDDD....',
    '...wwwwww...',
    '..wwrwwrww..',
    '..wwwwwwww..',
    '...wkwkwkw..',
    '..wwwwwwww..',
    '.wwwlwwwwww.',
    '.wwwwwwwlww.',
    '.wwwwwwwwww.',
    '..wwwwwwww..',
    '...wwwwww...'
  ]],
  fire: [[
    '.....r......',
    '....rro.....',
    '...rroor....',
    '..rrooyor...',
    '..rookkook..',
    '.rooykkykoor',
    '.rooywyywor.',
    '.rookkkkkor.',
    '..rookyyor..',
    '...rroorr...',
    '....rrrr....'
  ]],
  ghost: [[
    '...wwwwww...',
    '..wwwwwwww..',
    '.wwwwwwwwww.',
    '.wwkkwwkkww.',
    '.wwkkwwkkww.',
    '.wwwwwwwwww.',
    '.wwwwkkwwww.',
    '.wwwkkkkwww.',
    '.wwwwkkwwww.',
    '.wwwwwwwwww.',
    '.ww.www.www.',
    '.w...w...w..'
  ]],
  knight: [[
    '.e..........e.',
    '.ee........ee.',
    '..eDDDDDDDDe..',
    '...DPPPPPPD...',
    '...DPmPPmPD...',
    '...DDPPPPDD...',
    '....DDDDDD....',
    '..PPDDDDDDPP..',
    '.PPDDPPPPDDPP.',
    '.PDDDPPPPDDDP.',
    '.PDDDDDDDDDDP.',
    '..DDDDDDDDDD..',
    '...DDDDDDDD...',
    '...DD....DD...',
    '...DD....DD...',
    '..DDD....DDD..',
    '..DDD....DDD..'
  ]],
  beetle: [[
    '..N....N..',
    '...nnnn...',
    '.nnNnnNnnr',
    'nnnNnnNnnn',
    'nnnNnnNnnn',
    '.nnnnnnnn.',
    '.N.N..N.N.'
  ]],
  wisp: [[
    '...cc...',
    '..cccc..',
    '.cccccc.',
    '.cwkwkc.',
    '.cccccc.',
    '..cccc..',
    '.c.cc.c.',
    '...c.c..'
  ]],
  imp: [[
    '..e......e..',
    '..ee....ee..',
    '...rrrrrr...',
    '..rrrrrrrr..',
    '..rwkrrwkr..',
    '..rrrrrrrr..',
    '..rrwrwrwr..',
    'r.rrrrrrrr.r',
    '.rrrrrrrrrr.',
    '..rrrrrrrr..',
    '..rr....rr..',
    '..RR....RR..'
  ]],
  shroom: [[
    '..rrrrrr..',
    '.rrwrrrwr.',
    'rrrrrwrrrr',
    'rwrrrrrrwr',
    'rrrrrrrrrr',
    '..eeeeee..',
    '..ekeekee.',
    '..eeeeee..',
    '..eeeeee..',
    '...EEEE...'
  ]],
  zombie: [[
    '..GGGGGG..',
    '.GggggggG.',
    '.GgrggrgG.',
    '.GgggggggG',
    '..gkkkkg..',
    '...gggg...',
    '.nnnnnnnn.',
    'gnnNnnNnng',
    'g.nnnnnn.g',
    'g.nNnnNn.g',
    '..nnnnnn..',
    '..bb..bb..',
    '..bb..bb..',
    '..NN..NN..'
  ]]
});

const withHammer = rows => rows.map((r, i) => {
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

// decor (no outline)
const DECOR = {
  tuft: ['..t..t.', '.gg.gg.', 'gGggGgg'],
  flower: ['.m.', 'mym', '.m.', '.G.', '.G.'],
  bush: ['..GGG..', '.GgggG.', 'GggtggG', 'GGGGGGG'],
  rock: ['.dd.', 'dlddd', 'DDDDDD'],
  crystal: ['...c..', '..cc.c', '.ccCcC', 'ccCCcC', 'cCCCCC'],
  mushroom: ['..rrr..', '.rwrrr.', 'rrrwrrr', '...e...', '...e...'],
  cactus: ['..g..', 'g.g.g', 'g.ggg', 'ggg..', '..g..', '..g..'],
  bones: ['e..e.', 'eeEee'],
  snow: ['.wwww.', 'wlwwww', 'llllll'],
  torch: ['..c..', '.cwc.', '..n..', '..n..', '..n..', '..n..'],
  skull: ['.eee.', 'ekeke', 'eeeee', '.eke.', 'eeeeeee'],
  grave: ['.ddd.', 'dldld', 'ddddd', 'dldDd', 'ddddd', 'DDDDD'],
  ribs: ['e.e.e', 'eeeee', 'e.e.e', 'e.e.e', '.eEe.'],
  webc: ['wwwww', 'w.w..', 'ww.w.', 'w..w.', 'w...w']
};

const _cache = {};
function getSprite(name, swap, frame, outlineColor) {
  swap = swap || {}; frame = frame || 0;
  const key = name + '|' + JSON.stringify(swap) + '|' + frame + '|' + (outlineColor || '');
  if (_cache[key]) return _cache[key];
  const frames = ART[name] || [DECOR[name]];
  const rows = frames[frame % frames.length];
  const s = makeSprite(rows, swap, outlineColor || (ART[name] ? PAL.k : null));
  _cache[key] = s;
  return s;
}

function makeSprite(rows, swap, outline) {
  const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
  const W = w + 2, H = h + 2;
  const cells = [];
  for (let y = 0; y < H; y++) { cells.push(new Array(W).fill(null)); }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch && ch !== '.' && ch !== ' ') { const kk = swap[ch] || ch; cells[y + 1][x + 1] = kk[0] === '#' ? kk : (PAL[kk] || '#f0f'); }
  }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const c = mk(), x = c.getContext('2d');
  if (outline) {
    x.fillStyle = outline;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      if (cells[j][i]) continue;
      let near = false;
      for (let dj = -1; dj <= 1 && !near; dj++) for (let di = -1; di <= 1; di++) {
        const jj = j + dj, ii = i + di;
        if (jj >= 0 && jj < H && ii >= 0 && ii < W && cells[jj][ii]) { near = true; break; }
      }
      if (near) x.fillRect(i, j, 1, 1);
    }
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (cells[j][i]) { x.fillStyle = cells[j][i]; x.fillRect(i, j, 1, 1); }
  const f = mk(), fx = f.getContext('2d'); fx.translate(W, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
  const mkWhite = src => { const q = mk(), qx = q.getContext('2d'); qx.drawImage(src, 0, 0); qx.globalCompositeOperation = 'source-atop'; qx.fillStyle = '#fff'; qx.fillRect(0, 0, W, H); return q; };
  return { c, f, cw: mkWhite(c), fw: mkWhite(f), w: W, h: H };
}

// ---------- painter: draw big sprites with primitives, then auto-outline ----------
function spriteFromCanvas(src, outline) {
  const w = src.width, h = src.height, W = w + 2, H = h + 2;
  const d = src.getContext('2d').getImageData(0, 0, w, h).data;
  const cells = [];
  for (let y = 0; y < H; y++) cells.push(new Array(W).fill(null));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] > 128) cells[y + 1][x + 1] = 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')';
  }
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const c = mk(), x = c.getContext('2d');
  x.fillStyle = outline || PAL.k;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (cells[j][i]) continue;
    let near = false;
    for (let dj = -1; dj <= 1 && !near; dj++) for (let di = -1; di <= 1; di++) {
      const jj = j + dj, ii = i + di;
      if (jj >= 0 && jj < H && ii >= 0 && ii < W && cells[jj][ii]) { near = true; break; }
    }
    if (near) x.fillRect(i, j, 1, 1);
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (cells[j][i]) { x.fillStyle = cells[j][i]; x.fillRect(i, j, 1, 1); }
  const f = mk(), fx = f.getContext('2d'); fx.translate(W, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
  const mkWhite = s => { const q = mk(), qx = q.getContext('2d'); qx.drawImage(s, 0, 0); qx.globalCompositeOperation = 'source-atop'; qx.fillStyle = '#fff'; qx.fillRect(0, 0, W, H); return q; };
  return { c, f, cw: mkWhite(c), fw: mkWhite(f), w: W, h: H };
}
function paint(w, h, fn, outline) {
  const [c, x] = mkCanvas(w, h); let flip = false;
  const X = a => flip ? w - 1 - a : a;
  const col = cl => { x.fillStyle = PAL[cl] || cl; };
  const P = {
    px(a, b, cl) { col(cl); x.fillRect(X(a), b, 1, 1); },
    rect(a, b, ww, hh, cl) { col(cl); x.fillRect(flip ? w - a - ww : a, b, ww, hh); },
    ell(cx, cy, rx, ry, cl) { col(cl); for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / ((ry + 0.5) * (ry + 0.5))))); x.fillRect(X(cx) - hw, cy + j, hw * 2 + 1, 1); } },
    line(x0, y0, x1, y1, cl, t) {
      t = t || 1; col(cl); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= n; i++) x.fillRect(X(Math.round(x0 + (x1 - x0) * i / n)) - (flip ? t - 1 : 0), Math.round(y0 + (y1 - y0) * i / n), t, t);
    },
    tri(x0, y0, x1, y1, x2, y2, cl) {
      col(cl); x0 = X(x0); x1 = X(x1); x2 = X(x2);
      const minx = Math.min(x0, x1, x2), maxx = Math.max(x0, x1, x2), miny = Math.min(y0, y1, y2), maxy = Math.max(y0, y1, y2);
      const sg = (ax, ay, bx, by, cx, cy) => (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
      for (let j = miny; j <= maxy; j++) for (let i = minx; i <= maxx; i++) {
        const px = i + 0.5, py = j + 0.5, d1 = sg(px, py, x0, y0, x1, y1), d2 = sg(px, py, x1, y1, x2, y2), d3 = sg(px, py, x2, y2, x0, y0);
        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) x.fillRect(i, j, 1, 1);
      }
    },
    both(f) { flip = false; f(); flip = true; f(); flip = false; },
    poly(pts, cl, t) { for (let i = 0; i < pts.length - 1; i++) P.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], cl, t || 1); }
  };
  fn(P);
  return spriteFromCanvas(c, outline);
}

const BOSS_PAINT = [
  // 0 King Slime
  P => {
    P.ell(23, 25, 21, 11, 'G'); P.ell(23, 23, 20, 10, 'g'); P.ell(23, 19, 17, 7, 'g');
    P.ell(13, 14, 6, 3, 't'); P.ell(12, 14, 3, 1, 'w');
    P.both(() => { P.ell(13, 21, 4, 5, 'w'); P.ell(14, 22, 2, 3, 'r'); P.px(14, 21, 'k'); P.line(7, 14, 16, 18, 'G', 2); });
    P.rect(9, 27, 28, 6, 'k');
    for (let i = 0; i < 7; i++) { P.tri(10 + i * 4, 27, 14 + i * 4, 27, 12 + i * 4, 31, 'w'); P.tri(12 + i * 4, 33, 16 + i * 4, 33, 14 + i * 4, 29, 'w'); }
    P.ell(36, 32, 1, 3, 't');
    P.rect(11, 6, 24, 4, 'y'); P.rect(11, 9, 24, 1, 'Y');
    P.tri(11, 6, 17, 6, 13, 1, 'y'); P.tri(18, 6, 28, 6, 23, 0, 'y'); P.tri(29, 6, 35, 6, 33, 1, 'y');
    P.px(23, 8, 'r'); P.px(15, 8, 'c'); P.px(31, 8, 'c');
  },
  // 1 Spider Queen
  P => {
    P.both(() => {
      P.poly([[19, 16], [10, 4], [4, 10], [3, 22]], 'D', 2); P.poly([[17, 20], [6, 12], [1, 18], [1, 30]], 'D', 2);
      P.poly([[17, 24], [5, 26], [1, 32], [2, 36]], 'D', 2); P.poly([[19, 27], [11, 31], [8, 35], [8, 37]], 'D', 2);
      P.px(10, 4, 'p'); P.px(6, 12, 'p'); P.px(5, 26, 'p'); P.px(11, 31, 'p');
    });
    P.ell(25, 27, 11, 10, 'P'); P.ell(25, 26, 9, 8, 'P'); P.ell(21, 22, 4, 3, 'p');
    P.tri(22, 22, 28, 22, 25, 27, 'r'); P.tri(22, 33, 28, 33, 25, 28, 'r');
    P.ell(25, 14, 8, 7, 'D'); P.ell(25, 13, 7, 6, 'P'); P.ell(24, 11, 3, 2, 'p');
    P.both(() => { P.ell(21, 12, 2, 2, 'r'); P.px(21, 12, 'w'); P.ell(18, 14, 1, 1, 'r'); P.px(22, 9, 'r'); P.px(19, 11, 'r'); P.tri(22, 18, 24, 18, 23, 24, 'w'); P.line(20, 19, 18, 22, 'D', 1); });
    P.tri(19, 8, 22, 8, 20, 2, 'y'); P.tri(22, 8, 28, 8, 25, 0, 'y'); P.tri(28, 8, 31, 8, 30, 2, 'y'); P.px(25, 6, 'r');
  },
  // 2 Crystal Golem
  P => {
    P.both(() => { P.rect(14, 38, 9, 11, 'd'); P.rect(13, 48, 10, 4, 'D'); P.rect(14, 38, 3, 11, 'l'); });
    P.ell(24, 27, 16, 14, 'd'); P.ell(19, 21, 9, 6, 'l'); P.ell(24, 33, 13, 6, 'D');
    P.both(() => { P.ell(7, 27, 6, 9, 'd'); P.ell(5, 24, 3, 4, 'l'); P.ell(6, 40, 5, 5, 'd'); P.ell(6, 43, 4, 2, 'D'); P.tri(3, 38, 6, 38, 4, 33, 'c'); P.tri(7, 38, 10, 38, 9, 34, 'C'); });
    P.ell(24, 10, 9, 8, 'd'); P.ell(21, 7, 5, 3, 'l');
    P.both(() => { P.rect(19, 8, 4, 3, 'k'); P.rect(20, 9, 2, 1, 'c'); P.tri(11, 18, 17, 18, 13, 6, 'c'); P.tri(15, 18, 20, 18, 19, 9, 'C'); P.line(15, 24, 18, 31, 'D', 1); });
    P.tri(21, 3, 27, 3, 24, 0, 'c'); P.rect(21, 14, 6, 2, 'D');
    P.ell(24, 29, 5, 6, 'c'); P.ell(24, 29, 3, 4, 'w'); P.line(24, 35, 24, 39, 'D', 1);
  },
  // 3 Sand Pharaoh
  P => {
    P.rect(12, 28, 20, 20, 'e'); for (let y = 30; y < 48; y += 3) P.rect(12, y, 20, 1, 'E');
    P.rect(13, 46, 8, 6, 'E'); P.rect(23, 46, 8, 6, 'E'); P.rect(12, 51, 10, 2, 'N'); P.rect(22, 51, 10, 2, 'N');
    P.ell(22, 28, 13, 4, 'y'); P.ell(22, 28, 11, 3, 'b'); for (let i = 0; i < 6; i++) P.rect(13 + i * 3, 26, 1, 5, 'y');
    P.both(() => { P.rect(8, 28, 4, 14, 'e'); P.rect(8, 40, 4, 3, 'E'); P.rect(9, 30, 12, 4, 'y'); });
    P.ell(22, 14, 11, 11, 'y'); for (let y = 6; y < 24; y += 3) P.rect(11, y, 22, 1, 'b');
    P.both(() => { P.rect(9, 12, 5, 20, 'y'); for (let y = 14; y < 32; y += 3) P.rect(9, y, 5, 1, 'b'); });
    P.rect(16, 11, 12, 15, 'N'); P.rect(16, 11, 12, 2, 'Y');
    P.both(() => { P.rect(18, 16, 4, 2, 'c'); P.px(20, 16, 'w'); });
    P.rect(20, 21, 4, 2, 'S'); P.rect(21, 26, 2, 7, 'b');
    P.rect(20, 2, 4, 6, 'g'); P.px(21, 3, 'k'); P.px(22, 2, 'y');
    P.line(38, 14, 38, 50, 'Y', 2); P.poly([[38, 14], [41, 10], [36, 8], [35, 12]], 'Y', 2);
  },
  // 4 Frost King
  P => {
    P.rect(6, 26, 36, 26, 'B'); P.tri(6, 26, 2, 52, 14, 52, 'B'); P.tri(42, 26, 46, 52, 34, 52, 'B');
    P.ell(24, 40, 17, 13, 'w'); P.ell(30, 44, 12, 8, 'l'); P.ell(24, 21, 12, 11, 'w'); P.ell(29, 25, 7, 6, 'l'); P.ell(20, 16, 6, 3, 'w');
    P.both(() => { P.tri(13, 12, 18, 12, 14, 3, 'c'); P.tri(18, 12, 22, 12, 20, 0, 'C'); P.line(10, 32, 1, 24, 'n', 2); P.line(4, 26, 3, 20, 'n', 1); P.line(4, 26, 0, 27, 'n', 1); });
    P.tri(21, 12, 27, 12, 24, 0, 'c'); P.rect(13, 11, 22, 3, 'C'); P.px(24, 12, 'r');
    P.both(() => { P.ell(19, 20, 3, 3, 'k'); P.px(19, 20, 'c'); P.px(18, 19, 'w'); P.line(15, 15, 22, 18, 'k', 2); });
    P.rect(22, 23, 5, 2, 'o'); P.px(27, 24, 'o');
    P.rect(16, 28, 16, 5, 'k'); for (let i = 0; i < 4; i++) { P.tri(16 + i * 4, 28, 20 + i * 4, 28, 18 + i * 4, 32, 'w'); }
    P.ell(24, 38, 2, 2, 'k'); P.ell(24, 45, 2, 2, 'k');
    P.both(() => { P.tri(8, 52, 12, 52, 10, 47, 'c'); P.tri(15, 52, 19, 52, 17, 46, 'C'); });
  },
  // 5 Magma Titan
  P => {
    P.both(() => { P.rect(18, 47, 10, 9, 'D'); P.rect(18, 47, 3, 9, 'd'); P.rect(20, 52, 3, 1, 'o'); });
    P.ell(28, 32, 18, 16, 'D'); P.ell(22, 24, 9, 7, 'd'); P.ell(28, 38, 14, 7, 'k');
    P.both(() => { P.ell(8, 30, 7, 12, 'D'); P.ell(6, 26, 3, 5, 'd'); P.ell(7, 46, 7, 7, 'D'); P.ell(5, 44, 3, 3, 'd'); P.line(5, 42, 9, 50, 'o', 1); P.line(8, 22, 10, 36, 'o', 1); });
    P.ell(28, 12, 10, 9, 'D'); P.ell(24, 9, 5, 3, 'd');
    P.both(() => { P.tri(19, 10, 22, 14, 11, 1, 'R'); P.tri(15, 4, 18, 5, 12, 1, 'o'); P.rect(22, 9, 4, 3, 'y'); P.px(23, 10, 'w'); P.line(20, 7, 26, 9, 'k', 2); });
    P.rect(23, 17, 10, 3, 'o'); for (let i = 0; i < 4; i++) P.tri(23 + i * 3, 17, 26 + i * 3, 17, 24 + i * 3, 20, 'k');
    P.ell(28, 32, 6, 7, 'o'); P.ell(28, 32, 4, 5, 'y'); P.ell(28, 32, 2, 2, 'w');
    P.line(20, 28, 14, 36, 'o', 1); P.line(36, 26, 42, 34, 'o', 1); P.px(14, 38, 'o'); P.px(30, 48, 'o');
  },
  // 6 The Eclipse
  P => {
    P.ell(30, 21, 22, 22, 'h'); P.ell(30, 21, 20, 20, 'p'); P.ell(30, 21, 18, 18, 'z');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r0 = 22, r1 = i % 2 ? 26 : 29; P.line(Math.round(30 + Math.cos(a) * r0), Math.round(21 + Math.sin(a) * r0), Math.round(30 + Math.cos(a) * r1), Math.round(21 + Math.sin(a) * r1), 'h', 1); }
    P.tri(30, 26, 6, 62, 54, 62, 'z'); P.tri(30, 28, 14, 62, 46, 62, 'P');
    for (let i = 0; i < 10; i++) P.tri(6 + i * 5, 58, 11 + i * 5, 58, 8 + i * 5, 64, 'z');
    P.ell(30, 24, 11, 12, 'k'); P.ell(30, 24, 8, 9, 'z');
    P.both(() => { P.rect(24, 22, 4, 2, 'w'); P.px(25, 22, 'm'); P.line(22, 19, 28, 22, 'k', 1); P.tri(13, 14, 16, 12, 9, 2, 'h'); P.tri(8, 22, 11, 20, 3, 14, 'h'); P.line(14, 40, 4, 54, 'P', 2); P.ell(14, 46, 3, 3, 'w'); });
    P.ell(30, 49, 6, 6, 'p'); P.ell(30, 49, 4, 4, 'h'); P.ell(30, 49, 2, 2, 'w');
  },
  // 7 Spore Queen: a towering glowcap with a crown of smaller mushrooms, glowing eyes in the gills and root arms
  P => {
    P.both(() => { P.line(14, 30, 4, 40, '#5a3a22', 3); P.line(4, 40, 2, 47, '#5a3a22', 2); P.ell(3, 47, 2, 1, '#3a2a14'); P.ell(8, 26, 4, 3, '#c070ff'); P.px(7, 25, '#fff'); });
    P.rect(17, 24, 14, 22, '#e8dcc0'); P.rect(17, 24, 3, 22, '#fff6e0'); P.rect(28, 24, 3, 22, '#c8b898');
    P.rect(19, 44, 10, 3, '#8a6a44'); P.both(() => { P.ell(19, 47, 3, 1, '#5a3a22'); });
    P.ell(24, 16, 22, 11, '#5a1a6a'); P.ell(24, 14, 21, 10, '#8e2ab0'); P.ell(24, 12, 18, 8, '#c050d0');
    P.both(() => { P.ell(12, 11, 3, 2, '#ffd0f0'); P.ell(18, 7, 2, 2, '#ffd0f0'); P.px(6, 15, '#ffd0f0'); });
    P.ell(24, 22, 18, 3, '#3a1040'); for (let i = 0; i < 9; i++) P.rect(9 + i * 4, 21, 1, 4, '#6a2a70');
    P.both(() => { P.ell(19, 30, 3, 2, 'k'); P.ell(19, 30, 2, 1, '#c8f0a0'); P.px(19, 30, '#fff'); });
    P.rect(21, 35, 6, 2, '#3a1040'); P.px(22, 36, '#c8f0a0'); P.px(25, 36, '#c8f0a0');
    P.ell(14, 2, 4, 3, '#ff9fd0'); P.rect(13, 4, 2, 3, '#e8dcc0'); P.ell(24, 0 + 1, 5, 3, '#c8f0a0'); P.rect(23, 3, 2, 3, '#e8dcc0'); P.ell(34, 2, 4, 3, '#6ee7f2'); P.rect(33, 4, 2, 3, '#e8dcc0');
  },
  // 8 Abyssal Kraken: a huge octopus head with a beak, glowing eyes, and eight curling tentacles
  P => {
    P.both(() => {
      P.line(20, 34, 6, 40, '#7a2a5a', 4); P.line(6, 40, 2, 34, '#7a2a5a', 3); P.ell(2, 32, 2, 2, '#7a2a5a');
      P.line(22, 38, 12, 47, '#7a2a5a', 4); P.line(12, 47, 4, 46, '#7a2a5a', 3);
      P.line(25, 39, 22, 48, '#8a3a6a', 4); P.line(27, 39, 28, 49, '#8a3a6a', 3);
      for (let i = 0; i < 4; i++) { P.px(8 + i * 4, 41 + (i % 2), '#ffb0d0'); }
      P.ell(19, 22, 5, 5, '#ffd34e'); P.ell(19, 22, 4, 4, '#fff6c0'); P.rect(18, 19, 2, 7, 'k');
    });
    P.ell(30, 18, 19, 18, '#5a1a4a'); P.ell(30, 17, 18, 17, '#9a3a7a'); P.ell(30, 12, 14, 10, '#b84a8a');
    P.both(() => { P.ell(22, 8, 3, 2, '#e07ab0'); P.ell(17, 14, 2, 2, '#e07ab0'); });
    P.ell(30, 6, 6, 3, '#d070a8');
    P.both(() => { P.ell(23, 22, 5, 5, '#ffd34e'); P.ell(23, 22, 4, 4, '#fff6c0'); P.rect(22, 19, 2, 7, 'k'); });
    P.tri(26, 30, 34, 30, 30, 37, '#3a1a2a'); P.tri(27, 30, 33, 30, 30, 34, '#e8dcc0');
  },
  // 9 Gravemaw the Great Worm: a segmented worm bursting from the ground, ringed mouth full of teeth
  P => {
    P.ell(25, 46, 24, 4, '#3a2a1c'); P.both(() => { P.ell(4, 44, 4, 3, '#5a4430'); P.ell(10, 46, 3, 2, '#8a6a4a'); });
    for (let i = 0; i < 5; i++) { const y = 42 - i * 7, r = 12 - i; P.ell(25, y, r + 2, 5, '#7a4a3a'); P.ell(25, y - 1, r + 1, 4, '#c87a6a'); P.rect(25 - r, y - 1, r * 2, 1, '#e8a090'); }
    P.ell(25, 8, 16, 10, '#7a4a3a'); P.ell(25, 8, 13, 8, '#3a0a10'); P.ell(25, 9, 9, 5, '#14040a');
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, x = 25 + Math.round(Math.cos(a) * 11), y = 8 + Math.round(Math.sin(a) * 6.5); P.rect(x, y, 2, 2, '#fff6e0'); }
    P.both(() => { P.ell(12, 16, 2, 2, '#ffd34e'); P.px(12, 16, '#e0453a'); P.ell(10, 22, 1, 1, '#ffd34e'); });
  }

];
const TORCH_COLORS = ['#ffd34e', '#ff6a3a', '#6ee7f2', '#c07bff', '#a4e86b'];
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
    r7: [16, 16, P => { P.rect(7, 8, 2, 7, 'e'); P.ell(8, 7, 7, 4, 'p'); P.ell(8, 6, 6, 3, 'h'); P.px(5, 5, 'w'); P.px(10, 4, 'w'); P.px(8, 7, 'x'); }],
    r8: [16, 16, P => { P.ell(8, 9, 6, 5, 'C'); P.ell(8, 10, 5, 3, 'b'); P.ell(8, 8, 3, 3, 'w'); P.px(7, 7, 'c'); P.rect(2, 13, 12, 1, 'c'); }],
    r9: [16, 16, P => { P.ell(6, 9, 4, 5, 'N'); P.ell(6, 9, 3, 4, 'n'); for (let i = 0; i < 3; i++) P.line(9, 6 + i * 3, 14, 4 + i * 4, 'l', 1); P.px(14, 4, 'w'); P.px(14, 8, 'w'); P.px(14, 12, 'w'); }],
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

// ---------- story characters (painted) ----------
// scale a painter down so a sprite drawn on a big grid comes out smaller (chibi princess)
function scaledP(P, k) {
  const r = v => Math.round(v * k), m = v => Math.max(1, Math.round(v * k));
  return {
    px: (a, b, c) => P.px(r(a), r(b), c), rect: (a, b, w, h, c) => P.rect(r(a), r(b), m(w), m(h), c),
    ell: (cx, cy, rx, ry, c) => P.ell(r(cx), r(cy), m(rx), m(ry), c),
    tri: (a, b, c, d, e, f, col) => P.tri(r(a), r(b), r(c), r(d), r(e), r(f), col),
    line: (a, b, c, d, col, t) => P.line(r(a), r(b), r(c), r(d), col, t ? m(t) : 1),
    poly: (pts, col, t) => P.poly(pts.map(p => [r(p[0]), r(p[1])]), col, t),
    both: f => P.both(f)
  };
}
// tiny chibi princess: big head, flowing aqua hair, tiara, ball gown
function lyraMini(P, leek) {
  const H = '#46c9d6', HD = '#2a9aae', HL = '#b5f5f2', SK = '#ffe4d6', G = '#ffd34e', DR = '#f4fbff', DB = '#5aa8e8', PK = '#ff9fb8';
  P.ell(9, 10, 7, 8, H); P.rect(2, 10, 3, 10, H); P.rect(13, 10, 3, 10, H); P.rect(3, 18, 3, 3, HD); P.rect(12, 18, 3, 3, HD); P.px(3, 12, HL); P.px(14, 12, HL);
  P.tri(9, 15, 3, 22, 15, 22, DR); P.rect(6, 15, 6, 4, DR); P.rect(6, 17, 6, 1, G); P.px(9, 17, PK); P.rect(3, 21, 12, 1, DB); P.px(5, 19, '#cfe8ff'); P.px(12, 19, '#cfe8ff');
  P.rect(4, 15, 2, 4, DR); P.rect(12, 15, 2, 4, DR); P.px(4, 19, SK); P.px(13, 19, SK);
  P.ell(9, 10, 5, 5, SK); P.ell(9, 6, 6, 3, H); P.tri(3, 7, 7, 6, 4, 12, H); P.tri(15, 7, 11, 6, 14, 12, H); P.px(8, 5, HL);
  P.rect(7, 10, 1, 2, '#2a6ac8'); P.rect(11, 10, 1, 2, '#2a6ac8'); P.px(7, 10, 'w'); P.px(11, 10, 'w'); P.px(6, 12, PK); P.px(12, 12, PK); P.px(9, 13, '#d0405a');
  P.rect(6, 3, 6, 1, G); P.px(6, 2, G); P.px(9, 1, G); P.px(11, 2, G); P.px(9, 2, '#ff7fb0');
  if (leek) { P.rect(15, 11, 1, 10, '#e8f5d0'); P.rect(14, 5, 3, 7, '#4fc84f'); P.rect(14, 5, 1, 7, '#8af08a'); P.px(15, 4, '#4fc84f'); }
}
function lyraPaint(P, leek) {
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
const NPC_PAINT = {
  // Princess Lyra: original aqua-haired princess in a gown. npc_lyra = free, npc_lyra_leek = caged (holding her leek)
  npc_lyra: [14, 17, P => lyraMini(scaledP(P, 0.74), false)],
  npc_lyra_leek: [14, 17, P => lyraMini(scaledP(P, 0.74), true)],
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
  dragon_head: [34, 34, P => { const C = { body: '#d03a30', dark: '#8e2335', eye: '#ffe033', horn: '#e8dfc0' }; dragonHead(P, 12, 18, C, true); }],
  cage: [24, 34, P => {
    P.rect(1, 0, 22, 3, 'q'); P.rect(1, 31, 22, 3, 'q'); P.rect(1, 0, 22, 1, 'A');
    for (let i = 0; i < 6; i++) { P.rect(2 + i * 4, 3, 2, 28, 'A'); P.rect(2 + i * 4, 3, 1, 28, 'a'); }
    P.rect(1, 14, 22, 2, 'q'); P.rect(10, 12, 4, 6, 'Y'); P.px(11, 14, 'k'); P.px(11, 15, 'k');
  }]
};
function npcSpr(name) {
  if (name && name.indexOf('boss:') === 0) return bossSprite(+name.slice(5));
  if (!NPC_PAINT[name]) return getSprite(name);
  const key = 'np_' + name;
  if (!_cache[key]) { const d = NPC_PAINT[name]; _cache[key] = paint(d[0], d[1], d[2]); }
  return _cache[key];
}

// ---------- giant devil (Quoc) for the cutscenes ----------
function devilSprite() {
  if (_cache.devil) return _cache.devil;
  _cache.devil = paint(150, 128, P => {
    // hellfire halo behind everything
    for (let i = 0; i < 9; i++) { const x0 = 18 + i * 14; P.tri(x0, 74, x0 + 14, 74, x0 + 7, 10 + (i % 3) * 10 - Math.abs(4 - i) * 2, i % 2 ? 'o' : 'r'); P.tri(x0 + 3, 74, x0 + 11, 74, x0 + 7, 34 + (i % 3) * 8, 'y'); }
    // great bat wings
    P.both(() => {
      P.tri(48, 86, 2, 30, 8, 104, 'z'); P.tri(48, 86, 14, 50, 26, 112, 'i'); P.tri(44, 90, 4, 74, 18, 118, 'z');
      P.line(48, 86, 2, 30, 'k', 3); P.line(46, 88, 5, 72, 'k', 2); P.line(46, 90, 16, 112, 'k', 2); P.line(2, 30, 8, 104, 'R', 1);
    });
    // torso and spiked armour
    P.ell(75, 120, 54, 24, 'D'); P.ell(75, 116, 48, 18, 'q'); P.rect(50, 100, 50, 28, 'D'); P.rect(52, 102, 46, 24, 'q'); P.rect(52, 102, 46, 3, 'A');
    P.rect(69, 106, 12, 20, 'k'); P.rect(71, 108, 8, 16, 'f'); P.rect(73, 110, 4, 12, 'y'); P.px(75, 116, 'w');
    for (let i = 0; i < 4; i++) { P.rect(56 + i * 10, 104 + (i % 2) * 8, 3, 3, 'A'); P.rect(88 - i * 2, 114, 0, 0, 'A'); }
    P.both(() => {
      P.ell(26, 104, 18, 14, 'D'); P.ell(26, 101, 15, 10, 'q'); P.ell(24, 98, 8, 4, 'A');
      P.tri(14, 96, 24, 92, 8, 70, 'A'); P.tri(26, 92, 34, 90, 26, 66, 'a'); P.tri(34, 92, 40, 92, 40, 74, 'A');
      P.line(46, 112, 60, 126, 'D', 3); P.ell(12, 118, 6, 5, 'R'); P.tri(6, 120, 10, 114, 2, 108, 'e');
    });
    P.rect(60, 90, 30, 14, 'R'); P.ell(75, 96, 22, 10, 'R'); P.ell(75, 92, 16, 6, 'r');
    // curled ram horns
    P.both(() => {
      P.line(50, 46, 34, 30, 'k', 8); P.line(34, 30, 20, 30, 'k', 7); P.line(20, 30, 10, 40, 'k', 6); P.line(10, 40, 10, 54, 'k', 4);
      P.line(50, 44, 35, 29, 'D', 4); P.line(35, 28, 22, 28, 'D', 3); P.line(21, 29, 12, 38, 'q', 2); P.line(10, 46, 10, 56, 'y', 2); P.px(10, 58, 'w');
      P.tri(46, 56, 28, 54, 44, 72, 'r'); P.tri(44, 58, 32, 58, 44, 68, 'R'); P.px(30, 55, 'y'); P.px(33, 56, 'y');
    });
    // head: sharp jaw, scarred
    P.ell(75, 62, 32, 34, 'r'); P.ell(92, 66, 19, 28, 'R'); P.ell(75, 76, 27, 20, 'r'); P.rect(60, 82, 30, 14, 'R'); P.tri(62, 94, 88, 94, 75, 112, 'R'); P.tri(66, 94, 84, 94, 75, 106, 'k');
    P.both(() => { P.line(44, 40, 72, 53, 'k', 7); P.line(46, 38, 72, 50, 'R', 2); });
    P.both(() => { P.ell(60, 58, 10, 4, 'k'); P.ell(60, 58, 8, 3, 'y'); P.ell(60, 58, 5, 2, 'w'); P.rect(60, 55, 2, 7, 'k'); P.px(57, 58, 'f'); P.px(63, 58, 'f'); P.tri(48, 62, 52, 62, 50, 74, 'R'); P.line(46, 66, 54, 80, 'k', 1); });
    P.px(71, 70, 'k'); P.px(79, 70, 'k'); P.rect(72, 62, 3, 8, 'R');
    // snarling mouth full of fangs, ember glow inside
    P.rect(50, 80, 50, 15, 'k'); P.rect(53, 84, 44, 8, 'o'); P.rect(56, 86, 38, 4, 'y');
    for (let i = 0; i < 9; i++) { P.tri(52 + i * 5, 80, 57 + i * 5, 80, 55 + i * 5, 86 + (i % 3) * 2, 'w'); P.tri(53 + i * 5, 95, 58 + i * 5, 95, 56 + i * 5, 89 - (i % 3), 'e'); }
    P.both(() => { P.tri(50, 79, 60, 79, 54, 100, 'w'); P.tri(51, 81, 57, 81, 54, 94, 'a'); });
    // crown of flames between the horns
    for (let i = 0; i < 7; i++) P.tri(52 + i * 8, 30, 58 + i * 8, 30, 55 + i * 8, 10 - (i % 2) * 6 - (i === 3 ? 8 : 0), i % 2 ? 'y' : 'f');
    P.rect(50, 28, 52, 4, 'Y'); P.px(75, 29, 'r');
    // embers
    for (let i = 0; i < 18; i++) P.px((i * 37 + 9) % 140 + 4, (i * 23 + 5) % 100 + 6, i % 2 ? 'y' : 'o');
  }, '#1a0406');
  return _cache.devil;
}

// tall black figure that watches from the dark (drawn before the darkness overlay so the lantern reveals it)
function watcherSprite() {
  if (_cache.watcher) return _cache.watcher;
  _cache.watcher = paint(14, 34, P => {
    P.ell(7, 4, 3, 4, 'k'); P.tri(7, 8, 1, 33, 13, 33, 'k'); P.rect(5, 8, 4, 12, 'k'); P.tri(3, 12, 0, 26, 5, 20, 'k'); P.tri(11, 12, 14, 26, 9, 20, 'k');
    for (let i = 0; i < 4; i++) P.tri(1 + i * 3, 31, 4 + i * 3, 31, 2 + i * 3, 34, 'k');
    P.px(6, 4, '#14121f'); P.px(8, 4, '#14121f');
  }, '#2a2540');
  return _cache.watcher;
}

// leek sword (Lyra's gift): long glowing negi, handle on the left
function leekSprite() {
  if (_cache.leek) return _cache.leek;
  // Princess Lyra's leek blade: white-bulb grip with roots, golden leaf guard, long jade blade, leafy tip
  _cache.leek = paint(38, 15, P => {
    P.px(0, 6, 'e'); P.px(0, 8, 'e'); P.px(1, 7, 'E'); P.px(0, 7, 'w');
    P.rect(2, 5, 9, 5, 'w'); P.rect(2, 5, 9, 1, 'x'); P.rect(2, 9, 9, 1, 'e'); P.rect(5, 5, 1, 5, 'e'); P.rect(8, 5, 1, 5, 'e'); P.px(3, 6, 'w');
    P.rect(11, 2, 3, 11, 'y'); P.rect(11, 2, 1, 11, '#fff2a0'); P.rect(13, 3, 1, 9, 'Y'); P.tri(11, 2, 14, 2, 12, -1 + 1, 'y'); P.tri(11, 12, 14, 12, 12, 14, 'y'); P.px(12, 7, 'r');
    P.rect(14, 5, 17, 5, 't'); P.rect(14, 5, 17, 1, 'x'); P.rect(14, 7, 17, 1, 'w'); P.rect(14, 9, 17, 1, 'g'); P.rect(14, 10, 17, 0, 'G');
    P.tri(30, 4, 30, 11, 37, 7, 'g'); P.tri(30, 5, 30, 7, 36, 7, 't');
    P.tri(26, 4, 22, 0, 31, 3, 't'); P.tri(26, 11, 22, 14, 31, 11, 't'); P.tri(27, 4, 25, 1, 29, 3, 'x'); P.tri(27, 11, 25, 13, 29, 11, 'x');
    P.px(18, 7, 'w'); P.px(24, 6, 'w'); P.px(21, 8, 'x');
  });
  return _cache.leek;
}
// small flying leek used inside the leek tornado
function leekMini() {
  if (_cache.leekmini) return _cache.leekmini;
  _cache.leekmini = paint(14, 5, P => { P.rect(0, 1, 4, 3, 'w'); P.px(0, 2, 'e'); P.rect(4, 1, 7, 3, 'g'); P.rect(4, 1, 7, 1, 't'); P.tri(10, 0, 10, 4, 13, 2, 'g'); P.px(7, 2, 'x'); });
  return _cache.leekmini;
}

// ---------- giant dragon (form 0 young, 1 red, 2 three-headed, 3 shadow) ----------
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

const BOSS_SIZES = [[46, 36], [50, 38], [48, 52], [44, 54], [48, 54], [56, 56], [60, 66], [48, 50], [60, 50], [50, 50]];
function bossSprite(i) {
  if (typeof BOSS_IMG !== 'undefined' && BOSS_IMG[i]) return BOSS_IMG[i];   // the artist's pictures of the Spore Queen, Kraken and Gravemaw
  const key = 'boss' + i;
  if (!_cache[key]) _cache[key] = paint(BOSS_SIZES[i][0], BOSS_SIZES[i][1], BOSS_PAINT[i], i === 6 ? '#d58bff' : (i === 5 ? '#ff9a2a' : null));
  return _cache[key];
}

// the red "hurt" silhouette of any sprite (the middle frame of every Hurt animation)
function redOf(spr) {
  if (!spr || !spr.c) return spr; if (spr._red) return spr._red;
  const tint = src => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const x = c.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(232,40,52,.82)'; x.fillRect(0, 0, c.width, c.height); return c; };
  const c = tint(spr.c), f = spr.f ? tint(spr.f) : c;
  return (spr._red = Object.assign({}, spr, { c, f, cw: c, fw: f }));
}
// draw sprite: x = centre, y = bottom (feet)
function drawSpr(g, spr, x, y, flip, flash, sx, sy, alpha) {
  sx = sx || 1; sy = sy || sx;
  const img = flash ? (flip ? spr.fw : spr.cw) : (flip ? spr.f : spr.c);
  if (alpha !== undefined && alpha < 1) g.globalAlpha = alpha;
  g.drawImage(img, Math.round(x - spr.w * sx / 2), Math.round(y - spr.h * sy + sx), Math.round(spr.w * sx), Math.round(spr.h * sy));
  if (alpha !== undefined && alpha < 1) g.globalAlpha = 1;
}

// ---------------- colour helpers ----------------
function hex2rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
function lerpColor(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')';
}

// ---------------- tileset per biome ----------------
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

function buildTileset(B) {
  const r = mulberry32((B.seed || 5) * 13);
  const G = B.ground;
  const T = {};
  function body(variant, base, dark, light) {
    const [c, x] = mkCanvas(16, 16);
    x.fillStyle = base; x.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 16; i++) { x.fillStyle = r() < 0.6 ? dark : light; x.fillRect((r() * 15) | 0, (r() * 15) | 0, r() < 0.3 ? 2 : 1, 1); }
    if (variant) {
      x.fillStyle = dark; x.fillRect(2, 3, 5, 3); x.fillRect(9, 9, 5, 4);
      x.fillStyle = light; x.fillRect(2, 3, 5, 1); x.fillRect(9, 9, 5, 1);
    }
    return c;
  }
  function top(variant, base, dark, light, topC, topD, topL) {
    const c = body(variant, base, dark, light), x = c.getContext('2d');
    for (let i = 0; i < 16; i++) {
      const d = 3 + (r() < 0.35 ? 1 : 0) + (r() < 0.15 ? 1 : 0);
      x.fillStyle = topC; x.fillRect(i, 0, 1, d);
      x.fillStyle = topD; x.fillRect(i, d - 1, 1, 1);
      if (r() < 0.6) { x.fillStyle = topL; x.fillRect(i, 0, 1, 1); }
    }
    return c;
  }
  T.body = [body(0, G.body, G.dark, G.light), body(1, G.body, G.dark, G.light)];
  { const EMB = { meadow: ['#a8a8b8', '#6a5a44', 'root'], forest: ['#8a8a9a', '#3a6a3a', 'root'], caves: ['#6ee7f2', '#c07bff', 'gem'], desert: ['#f6efe0', '#c8964a', 'bone'], frost: ['#ffffff', '#9fe0f0', 'gem'],
      volcano: ['#ff7a2a', '#ffd34e', 'vein'], citadel: ['#c9a0ff', '#6a3aa8', 'gem'], swamp: ['#a4ffc0', '#3a6a2a', 'root'], ocean: ['#ffd0e0', '#f6efe0', 'shell'], tunnels: ['#ffd34e', '#c8c0b0', 'gem'] }[B.id] || ['#aaa', '#777', 'root'];
    for (let v = 0; v < 2; v++) {
      const c = body(0, G.body, G.dark, G.light), x = c.getContext('2d');
      // a buried stone
      x.fillStyle = G.dark; x.fillRect(3 + v * 6, 9 - v * 4, 6, 4); x.fillStyle = '#9a9aa8'; x.fillRect(4 + v * 6, 9 - v * 4, 4, 3); x.fillStyle = '#c8c8d4'; x.fillRect(4 + v * 6, 9 - v * 4, 2, 1);
      if (EMB[2] === 'root') { x.fillStyle = EMB[1]; for (let i = 0; i < 9; i++) x.fillRect(10 - v * 7 + Math.round(Math.sin(i * 0.9) * 1.5), i + 1, 1, 1); }
      else if (EMB[2] === 'gem') { x.fillStyle = EMB[0]; x.fillRect(11 - v * 8, 3 + v * 7, 2, 3); x.fillStyle = EMB[1]; x.fillRect(12 - v * 8, 4 + v * 7, 2, 2); x.fillStyle = '#fff'; x.fillRect(11 - v * 8, 3 + v * 7, 1, 1); }
      else if (EMB[2] === 'bone') { x.fillStyle = EMB[0]; x.fillRect(9 - v * 6, 3 + v * 8, 5, 1); x.fillRect(9 - v * 6, 2 + v * 8, 1, 3); x.fillRect(13 - v * 6, 2 + v * 8, 1, 3); }
      else if (EMB[2] === 'vein') { x.fillStyle = EMB[0]; for (let i = 0; i < 10; i++) x.fillRect(2 + i, 6 + v * 5 + Math.round(Math.sin(i * 0.8) * 2), 1, 1); x.fillStyle = EMB[1]; x.fillRect(6, 6 + v * 5, 1, 1); }
      else if (EMB[2] === 'shell') { x.fillStyle = EMB[0]; x.fillRect(10 - v * 7, 4 + v * 6, 3, 2); x.fillRect(11 - v * 7, 3 + v * 6, 1, 1); }
      T.body.push(c);
    } }
  T.top = [top(0, G.body, G.dark, G.light, G.top, G.topDark, G.topLight), top(1, G.body, G.dark, G.light, G.top, G.topDark, G.topLight)];
  // ice
  T.iceBody = [body(0, '#8fd8ee', '#4fb0d0', '#d8f8ff'), body(1, '#8fd8ee', '#4fb0d0', '#d8f8ff')];
  T.iceTop = [top(0, '#8fd8ee', '#4fb0d0', '#d8f8ff', '#e8fbff', '#9fe0f0', '#ffffff'), top(1, '#8fd8ee', '#4fb0d0', '#d8f8ff', '#e8fbff', '#9fe0f0', '#ffffff')];
  // one-way platform, styled for each land
  { const [c, x] = mkCanvas(16, 8), st = { caves: 'stone', frost: 'ice', citadel: 'stone', volcano: 'metal', ocean: 'coral', tunnels: 'wood' }[B.id] || 'wood';
    if (st === 'wood') {
      x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 5); x.fillStyle = B.plat[1]; x.fillRect(0, 5, 16, 2); x.fillRect(0, 0, 16, 1); x.fillRect(7, 0, 1, 5); x.fillRect(15, 0, 1, 5);
      x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(1, 1, 5, 1); x.fillRect(9, 1, 5, 1); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(2, 3, 3, 1); x.fillRect(10, 2, 4, 1);
      x.fillStyle = '#c8c8d4'; x.fillRect(1, 2, 1, 1); x.fillRect(5, 2, 1, 1); x.fillRect(9, 2, 1, 1); x.fillRect(13, 2, 1, 1);
    } else if (st === 'stone' || st === 'ice') {
      x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 6); x.fillStyle = B.plat[1]; x.fillRect(0, 6, 16, 2); x.fillRect(5, 0, 1, 6); x.fillRect(11, 2, 1, 4);
      x.fillStyle = st === 'ice' ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.22)'; x.fillRect(0, 0, 16, 1); x.fillRect(1, 1, 3, 1); x.fillRect(7, 1, 3, 1);
      if (st === 'ice') { x.fillStyle = '#e8fbff'; x.fillRect(3, 6, 1, 2); x.fillRect(12, 6, 1, 2); }
    } else if (st === 'metal') {
      x.fillStyle = '#3a3a44'; x.fillRect(0, 0, 16, 6); x.fillStyle = '#5a5a66'; x.fillRect(0, 0, 16, 1); x.fillStyle = '#1c1c22'; for (let i = 0; i < 4; i++) x.fillRect(1 + i * 4, 2, 2, 3); x.fillStyle = '#ff7a2a'; x.fillRect(2, 3, 1, 1); x.fillRect(10, 3, 1, 1); x.fillStyle = '#2a2a30'; x.fillRect(0, 6, 16, 2);
    } else {
      x.fillStyle = B.plat[0]; x.fillRect(0, 1, 16, 5); x.fillStyle = B.plat[1]; x.fillRect(0, 6, 16, 2); x.fillStyle = '#ffb0c8'; for (let i = 0; i < 6; i++) x.fillRect(1 + i * 3, i % 2, 2, 2); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(3, 2, 2, 1); x.fillRect(11, 3, 2, 1);
    }
    T.plat = c; }
  // spikes
  { const [c, x] = mkCanvas(16, 16);
    for (let k = 0; k < 3; k++) for (let y = 0; y < 9; y++) {
      const half = Math.max(0.5, y / 9 * 2.6), cx = k * 5.3 + 2.8;
      x.fillStyle = B.spike[0]; x.fillRect(Math.round(cx - half), 7 + y, Math.round(half * 2), 1);
      x.fillStyle = B.spike[1]; x.fillRect(Math.round(cx + half) - 1, 7 + y, 1, 1);
    }
    T.spike = c; }
  // crumble block
  { const [c, x] = mkCanvas(16, 16);
    x.fillStyle = B.plat[0]; x.fillRect(0, 0, 16, 16);
    x.fillStyle = B.plat[1]; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
    x.fillRect(4, 3, 1, 4); x.fillRect(5, 6, 2, 1); x.fillRect(9, 8, 1, 5); x.fillRect(10, 10, 2, 1); x.fillRect(12, 3, 1, 3);
    T.crumble = c; }
  // lava frames
  T.lava = [[], []];
  for (let f = 0; f < 4; f++) for (let kind = 0; kind < 2; kind++) {
    const [c, x] = mkCanvas(16, 16);
    x.fillStyle = '#e8501a'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c23a14';
    for (let i = 0; i < 6; i++) x.fillRect(((i * 7 + f * 3) % 15), (i * 5 + 3) % 15, 3, 1);
    x.fillStyle = '#ff9a2a';
    for (let i = 0; i < 5; i++) x.fillRect(((i * 5 + f * 4) % 14), (i * 7 + 5) % 15, 2, 1);
    if (kind === 0) {
      for (let i = 0; i < 16; i++) {
        const h = 3 + Math.round(Math.sin((i + f * 4) / 16 * Math.PI * 2) * 1.3);
        x.fillStyle = '#ffd34e'; x.fillRect(i, 0, 1, h);
        x.fillStyle = '#ff9a2a'; x.fillRect(i, h, 1, 1);
      }
    }
    T.lava[kind].push(c);
  }
  // puzzle gate (bars) + cracked wall
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
  T.decor = B.decor.map(d => getSprite(d[0], d[1] || {}, 0, null));
  return T;
}

// ---------------- parallax backgrounds ----------------
function buildBackground(B) {
  const r = mulberry32((B.seed || 5) * 31);
  const bg = { layers: [] };
  // sky
  { const [c, x] = mkCanvas(VW, VH);
    const bands = 18, stops = B.sky;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1) * (stops.length - 1), a = Math.min(stops.length - 2, Math.floor(t));
      x.fillStyle = lerpColor(stops[a], stops[a + 1], t - a);
      x.fillRect(0, Math.floor(i * VH / bands), VW, Math.ceil(VH / bands) + 1);
    }
    if (B.stars) for (let i = 0; i < 70; i++) { x.fillStyle = r() < 0.2 ? '#fff' : '#9a8ad0'; x.fillRect((r() * VW) | 0, (r() * VH * 0.6) | 0, 1, 1); }
    bg.sky = c; }

  const W = 512;
  function ridge(x, base, amp, color, seed, hh) {
    const rr = mulberry32(seed), ks = [1, 2, 3, 5, 8], ph = ks.map(() => rr() * 6.283), ys = [];
    for (let px = 0; px < W; px++) {
      let y = base;
      for (let i = 0; i < ks.length; i++) y += Math.sin(2 * Math.PI * ks[i] * px / W + ph[i]) * amp / (1 + i * 0.9);
      y = Math.round(y); ys.push(y);
      x.fillStyle = color; x.fillRect(px, y, 1, hh - y);
    }
    return ys;
  }
  const wrap = fn => { for (const o of [-W, 0, W]) fn(o); };
  const disc = (x, cx, cy, rad, col) => { x.fillStyle = col; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(rad * rad - j * j)); x.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };
  const tri = (x, cx, by, w, h, col) => { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round(i / h * w / 2); x.fillRect(cx - half, by - h + i, half * 2 + 1, 1); } };
  const triDown = (x, cx, ty, w, h, col) => { x.fillStyle = col; for (let i = 0; i < h; i++) { const half = Math.round((1 - i / h) * w / 2); x.fillRect(cx - half, ty + i, half * 2 + 1, 1); } };

  // far layer
  { const [c, x] = mkCanvas(W, 170);
    const ys = ridge(x, 62, 26, B.far, (B.seed || 5) * 3, 170);
    if (B.style === 'ice') { for (let i = 0; i < 9; i++) { const cx = (r() * W) | 0; wrap(o => { tri(x, cx + o, ys[cx] + 20, 46, 70, B.far); tri(x, cx + o, ys[cx] - 30, 18, 24, '#e8f4ff'); }); } }
    if (B.style === 'volcano') { const cx = 150; wrap(o => { tri(x, cx + o, 110, 150, 90, B.far); disc(x, cx + o, 22, 0, B.far); x.fillStyle = '#f06a20'; x.fillRect(cx + o - 8, 22, 17, 3); }); }
    bg.layers.push({ c, f: 0.12, y: 56, anchor: 'bottom' }); }
  { const [c, x] = mkCanvas(W, 170); if (typeof paintLandmark === 'function') paintLandmark(B, x, W); bg.layers.push({ c, f: 0.2, y: 46, anchor: 'bottom' }); }
  // mid layer
  { const [c, x] = mkCanvas(W, 170);
    if (B.style === 'cave' || B.style === 'tunnel') {
      const ys = ridge(x, 128, 12, B.mid, 77, 170);
      for (let i = 0; i < 16; i++) { const cx = (r() * W) | 0, w = 10 + r() * 16, h = 14 + r() * 40; wrap(o => tri(x, cx + o, ys[cx] + 2, w, h * 0.7, B.mid)); }
      bg.layers.push({ c, f: 0.3, y: 50, anchor: 'bottom' });
      // hanging stalactites (top anchored)
      const [c2, x2] = mkCanvas(W, 90);
      for (let i = 0; i < 20; i++) { const cx = (r() * W) | 0, w = 8 + r() * 16, h = 18 + r() * 52; wrap(o => { triDown(x2, cx + o, 0, w, h, '#0c0a1e'); }); }
      x2.fillStyle = '#0c0a1e'; x2.fillRect(0, 0, W, 8);
      for (let i = 0; i < 14; i++) { const cx = (r() * W) | 0, cy = 20 + (r() * 60) | 0; x2.fillStyle = r() < 0.5 ? '#6ee7f2' : '#d58bff'; x2.fillRect(cx, cy, 1, 2); x2.fillStyle = 'rgba(110,231,242,.25)'; x2.fillRect(cx - 1, cy - 1, 3, 4); }
      bg.layers.push({ c: c2, f: 0.45, y: 0, anchor: 'top' });
      if (B.style === 'tunnel') {   // wooden mine supports and hanging lamps
        const [c3, x3] = mkCanvas(W, 170);
        for (let i = 0; i < 9; i++) { const cx = 20 + i * 58; wrap(o => { x3.fillStyle = '#3a2a18'; x3.fillRect(cx + o - 18, 40, 4, 130); x3.fillRect(cx + o + 14, 40, 4, 130); x3.fillRect(cx + o - 20, 36, 40, 6); x3.fillStyle = '#5a4428'; x3.fillRect(cx + o - 20, 36, 40, 2); x3.fillStyle = '#ffd34e'; x3.fillRect(cx + o - 1, 44, 3, 4); x3.fillStyle = 'rgba(255,211,78,.18)'; x3.fillRect(cx + o - 6, 40, 13, 14); }); }
        bg.layers.push({ c: c3, f: 0.55, y: 40, anchor: 'bottom' });
      }
    } else if (B.style === 'ocean') {
      const ys = ridge(x, 110, 14, B.mid, (B.seed || 5) * 5, 170);
      for (let i = 0; i < 30; i++) { const cx = (r() * W) | 0, h = 26 + ((r() * 50) | 0), ph = r() * 6; wrap(o => { for (let k = 0; k < h; k++) { x.fillStyle = k % 6 < 3 ? '#0f6a4a' : '#16805a'; x.fillRect(cx + o + Math.round(Math.sin(k / 6 + ph) * 2), ys[cx] - k, 2, 1); } }); }
      for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, col = ['#c86a8a', '#e0905a', '#9a5ac8'][i % 3]; wrap(o => { disc(x, cx + o, ys[cx] - 4, 6, col); disc(x, cx + o - 5, ys[cx] - 8, 4, col); disc(x, cx + o + 5, ys[cx] - 9, 3, col); }); }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
      const [c2, x2] = mkCanvas(W, 140);   // light rays from the surface
      for (let i = 0; i < 7; i++) { const cx = 30 + i * 74; x2.fillStyle = 'rgba(160,230,255,0.06)'; for (let k = 0; k < 140; k++) x2.fillRect(cx + k * 0.45, k, 22 - k * 0.08, 1); }
      bg.layers.push({ c: c2, f: 0.15, y: 0, anchor: 'top' });
    } else if (B.style === 'swamp') {
      const ys = ridge(x, 96, 10, B.mid, (B.seed || 5) * 5, 170);
      for (let i = 0; i < 8; i++) { const cx = (r() * W) | 0, h = 30 + ((r() * 26) | 0); wrap(o => { x.fillStyle = '#1a1410'; x.fillRect(cx + o, ys[cx] - h, 3, h + 4); x.fillRect(cx + o - 8, ys[cx] - h + 6, 10, 2); x.fillRect(cx + o + 2, ys[cx] - h + 12, 9, 2); }); }
      for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, h = 18 + ((r() * 40) | 0), rad = 8 + ((r() * 10) | 0), col = ['#8e2ab0', '#2ab08a', '#c0a020'][i % 3]; wrap(o => { x.fillStyle = '#d8ccb0'; x.fillRect(cx + o - 2, ys[cx] - h, 4, h + 4); disc(x, cx + o, ys[cx] - h, rad, col); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(cx + o - rad + 3, ys[cx] - h - 2, 3, 2); x.fillRect(cx + o + 2, ys[cx] - h - 4, 2, 2); }); }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
    } else {
      const ys = ridge(x, 88, 16, B.mid, (B.seed || 5) * 5, 170);
      if (B.style === 'hills') {
        for (let i = 0; i < 16; i++) { const cx = (r() * W) | 0, rad = 5 + ((r() * 5) | 0); wrap(o => { x.fillStyle = '#4a3020'; x.fillRect(cx + o - 1, ys[cx] - 6, 2, 8); disc(x, cx + o, ys[cx] - 8, rad, B.tree[r() < 0.5 ? 0 : 1]); }); }
        // windmill
        const mx = 320; wrap(o => { x.fillStyle = '#3a2a44'; x.fillRect(mx + o - 4, ys[mx] - 28, 8, 30); tri(x, mx + o, ys[mx] - 26, 12, 8, '#2a1f35'); x.fillStyle = '#cdbfa0'; x.fillRect(mx + o - 12, ys[mx] - 20, 24, 2); x.fillRect(mx + o - 1, ys[mx] - 32, 2, 24); });
      } else if (B.style === 'pines') {
        for (let i = 0; i < 26; i++) { const cx = (r() * W) | 0, h = 22 + ((r() * 16) | 0); wrap(o => { tri(x, cx + o, ys[cx] + 2, 16, h, B.tree[0]); tri(x, cx + o, ys[cx] - h * 0.35, 12, h * 0.6, B.tree[1]); }); }
      } else if (B.style === 'dunes') {
        for (let i = 0; i < 3; i++) { const cx = 60 + i * 170, h = 40 + i * 10; wrap(o => { tri(x, cx + o, ys[cx] + 4, h * 1.7, h, '#d98a56'); x.fillStyle = '#b86a44'; for (let j = 0; j < h; j++) { const half = Math.round(j / h * h * 0.85); x.fillRect(cx + o, ys[cx] + 4 - h + j, half + 1, 1); } }); }
        for (let i = 0; i < 5; i++) { const cx = (r() * W) | 0; wrap(o => { x.fillStyle = '#5a3a28'; x.fillRect(cx + o, ys[cx] - 16, 2, 18); disc(x, cx + o + 1, ys[cx] - 17, 4, '#2d7a3a'); }); }
      } else if (B.style === 'ice') {
        for (let i = 0; i < 12; i++) { const cx = (r() * W) | 0, h = 26 + ((r() * 30) | 0); wrap(o => { tri(x, cx + o, ys[cx] + 4, 30, h, B.mid); tri(x, cx + o, ys[cx] + 4 - h * 0.55, 14, h * 0.45, '#f4fbff'); }); }
      } else if (B.style === 'volcano') {
        for (let i = 0; i < 4; i++) { const cx = 40 + i * 130, h = 54 + (i % 2) * 20; wrap(o => { tri(x, cx + o, ys[cx] + 6, h * 1.6, h, '#2a0d0a'); x.fillStyle = '#ff6a20'; x.fillRect(cx + o - 5, ys[cx] + 6 - h, 11, 2); x.fillStyle = '#ffd34e'; x.fillRect(cx + o - 2, ys[cx] + 6 - h, 5, 1); x.fillStyle = 'rgba(80,60,60,.6)'; disc(x, cx + o + 3, ys[cx] - h - 6, 5, 'rgba(70,50,50,.7)'); disc(x, cx + o + 8, ys[cx] - h - 14, 7, 'rgba(60,45,45,.5)'); }); }
      } else if (B.style === 'citadel') {
        for (let i = 0; i < 11; i++) { const cx = 10 + i * 46 + ((r() * 16) | 0), w = 18 + ((r() * 14) | 0), h = 40 + ((r() * 50) | 0); wrap(o => {
          x.fillStyle = '#0a0618'; x.fillRect(cx + o - w / 2, ys[cx] - h, w, h + 8);
          for (let k = 0; k < w; k += 6) x.fillRect(cx + o - w / 2 + k, ys[cx] - h - 4, 4, 4);
          if (r() < 0.6) tri(x, cx + o, ys[cx] - h - 4, w - 4, 20, '#0a0618');
          x.fillStyle = r() < 0.5 ? '#c9a0ff' : '#7a4cff';
          for (let k = 0; k < 4; k++) if (r() < 0.6) x.fillRect(cx + o - 2 + ((r() * 6) | 0) - 3, ys[cx] - h + 6 + k * 9, 2, 3);
        }); }
      }
      bg.layers.push({ c, f: 0.3, y: 52, anchor: 'bottom' });
    }
  }
  return bg;
}

// ---- Singer hero (TEST BUILD, fan tribute): a small chibi twin-tail girl that replaces Ember's body ----
function mikuSprite(kind, f) {
  const k = 'miku_' + kind + '_' + f; if (_cache[k]) return _cache[k];
  const T = '#39c5bb', TD = '#1f8f93', TL = '#8ff5ea', SK = '#ffe6d8', DK = '#2a2e40', BL = '#14202a', PK = '#ff8fbf';
  const sway = (f & 1), lift = kind === 'air' ? 1 : 0;
  _cache[k] = paint(20, 22, P => {
    // long twin tails (behind everything), swaying a little
    P.both(() => { P.rect(0, 5 + sway, 4, 11, T); P.rect(0 + sway, 15, 4, 4, T); P.rect(1 + sway, 19 - lift, 3, 3, TL); P.rect(0, 7, 1, 8, TD); P.rect(3, 6, 1, 6, TL); P.rect(1, 3, 3, 3, T); });
    // body: grey top, teal tie, black sleeves and pleated skirt
    P.rect(6, 14, 8, 3, '#a8aebc'); P.rect(10, 14, 1, 4, T); P.rect(5, 14, 1, 3, DK); P.rect(14, 14, 1, 3, DK); P.rect(6, 14, 8, 1, '#fff');
    P.rect(5, 17, 10, 2, DK); P.px(7, 18, '#4a4e66'); P.px(10, 18, '#4a4e66'); P.px(13, 18, '#4a4e66');
    // legs and boots (alternate when running)
    if (kind === 'run') { const a = f % 2 ? 1 : 0; P.rect(6 + a, 19, 3, 3, DK); P.rect(11 - a, 19, 3, 3, DK); P.rect(6 + a, 19, 3, 1, SK); P.rect(11 - a, 19, 3, 1, SK); }
    else { P.rect(6, 19, 3, 3 - lift, DK); P.rect(11, 19, 3, 3 - lift, DK); P.rect(6, 19, 3, 1, SK); P.rect(11, 19, 3, 1, SK); }
    // head
    P.ell(10, 8, 7, 6, SK); P.rect(5, 12, 10, 1, '#f0c9b4');
    // hair: cap, fringe, side locks
    P.ell(10, 4, 8, 4, T); P.rect(3, 4, 14, 3, T); P.rect(3, 4, 2, 9, T); P.rect(15, 4, 2, 9, T);
    P.px(6, 7, T); P.px(8, 7, T); P.px(9, 7, TD); P.px(11, 7, T); P.px(13, 7, T); P.rect(4, 2, 12, 1, TD); P.rect(6, 1, 1, 1, TL); P.rect(9, 1, 1, 1, TL); P.rect(12, 1, 1, 1, TL);
    // headset earpieces
    P.rect(2, 7, 2, 5, DK); P.rect(16, 7, 2, 5, DK); P.px(3, 8, '#7ef0e6'); P.px(3, 9, '#7ef0e6'); P.px(16, 8, '#7ef0e6'); P.px(16, 9, '#7ef0e6');
    // big eyes with highlights
    P.rect(6, 8, 3, 1, BL); P.rect(11, 8, 3, 1, BL); P.rect(6, 9, 3, 3, '#1d8ea0'); P.rect(11, 9, 3, 3, '#1d8ea0'); P.px(6, 9, '#fff'); P.px(11, 9, '#fff'); P.rect(6, 11, 3, 1, '#7ef0e6'); P.rect(11, 11, 3, 1, '#7ef0e6');
    // blush + mouth + hair clip
    P.px(5, 11, '#ffa0b4'); P.px(14, 11, '#ffa0b4'); P.px(9, 12, '#d0405a'); P.px(10, 12, '#ff8fa8'); P.px(15, 2, PK); P.px(16, 2, PK); P.px(15, 3, '#fff');
  }, BL);
  return _cache[k];
}
