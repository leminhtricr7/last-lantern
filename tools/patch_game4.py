import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


# ---------------- save / stats ----------------
rep("relics: [0, 0, 0, 0, 0, 0, 0], ammo: { dagger: 0, bomb: 0, flask: 0 } };", "relics: [0, 0, 0, 0, 0, 0, 0], ammo: { dagger: 0, bomb: 0, flask: 0 }, leek: false };")
rep("  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };", "  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };\n  save.leek = !!save.leek;")
rep("const swordDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0);", "const swordDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0) + (save.leek ? 1 : 0);")
rep("    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: 24, h: P.h + 5 } : { x: P.x - 23, y: P.y - 3, w: 24, h: P.h + 5 };",
    "    const rch = save.leek ? 31 : 24;\n    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: rch, h: P.h + 5 } : { x: P.x - rch + 1, y: P.y - 3, w: rch, h: P.h + 5 };")
rep("{ save.cleared = []; save.shards = {}; save.coins = 0; writeSave();", "{ save.cleared = []; save.shards = {}; save.coins = 0; save.leek = false; save.relics = [0, 0, 0, 0, 0, 0, 0]; save.ammo = { dagger: 0, bomb: 0, flask: 0 }; writeSave();")

# ---------------- strings ----------------
rep("    use: { en: 'E: Use', vi: 'E: Dùng' },", u"""    free: { en: 'E: Free her', vi: 'E: Giải cứu' }, guards: { en: 'Defeat the guards first!', vi: 'Hạ hết lính canh trước đã!' },
    leekT: { en: 'LEEK BLADE OBTAINED!', vi: 'NHẬN ĐƯỢC KIẾM HÀNH LÁ!' }, leekD: { en: 'A glowing leek that sings with the light. +1 damage and longer reach.', vi: 'Cây hành phát sáng hát cùng ánh sáng. +1 sát thương và tầm đánh xa hơn.' },
    wave: { en: 'Wave', vi: 'Đợt' }, trialWin: { en: 'TRIAL SURVIVED!', vi: 'VƯỢT QUA THỬ THÁCH!' }, gift: { en: 'Quan hands you some supplies!', vi: 'Quan đưa bạn ít đồ tiếp tế!' },
    use: { en: 'E: Use', vi: 'E: Dùng' },""")

# ---------------- NPC data ----------------
rep("  const SHOPS = {", u"""  const MIKU_NAME = { en: 'Hatsune Miku', vi: 'Hatsune Miku' }; // change here if you rename the character
  Object.assign(NPCS, {
    miku: { spr: 'npc_miku', name: MIKU_NAME },
    shorty: { spr: 'npc_shorty', name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' } },
    quan: { spr: 'npc_quan', name: { en: 'QuanSadBoy', vi: 'QuanSadBoy' }, gift: { dagger: 5, bomb: 2, flask: 2 } },
    quoc: { spr: 'npc_shorty', name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' } }
  });
  NPCS.miku.generic = [{ en: 'Your leek is shining so prettily! La la laaa~ ♪', vi: 'Cây hành của bạn sáng đẹp quá! La la laaa~ ♪' }];
  NPCS.shorty.generic = [{ en: 'Hmph.', vi: 'Hừm.' }];
  NPCS.quan.generic = [{ en: 'Sigh... nobody reads anymore.', vi: 'Haizz... giờ chẳng ai đọc sách nữa.' }];
  const DLG3 = {
    1: { quan: [
      { en: 'Oh! Sorry, I was reading while walking. I am Quan... some call me QuanSadBoy. I am a wizard. Mostly I read.', vi: 'Ồ! Xin lỗi, mình vừa đi vừa đọc sách. Mình là Quan... người ta gọi mình là QuanSadBoy. Mình là phù thủy. Chủ yếu là đọc sách.' },
      { en: 'I found extra supplies between chapter three and four. Please take them - you look like you need them.', vi: 'Mình tìm thấy ít đồ dư giữa chương ba và chương bốn. Bạn cầm lấy đi - trông bạn cần đấy.' },
      { en: 'Forest puzzles? Torches first, then the door. It is all in chapter seven. Probably.', vi: 'Câu đố trong rừng à? Đuốc trước, rồi tới cửa. Tất cả nằm ở chương bảy. Chắc vậy.' }
    ] },
    2: { quan: [
      { en: 'You again! This cave is chapter twelve: "Things That Fall On You". Watch the red markers!', vi: 'Lại là bạn! Hang này là chương mười hai: "Những Thứ Rơi Trúng Đầu Bạn". Để ý dấu đỏ nhé!' },
      { en: 'I made notes on the crystal runes. The tablet shows the order. I think. I am sad, not wrong.', vi: 'Mình có ghi chú về ký hiệu pha lê. Bia đá cho biết thứ tự. Mình nghĩ vậy. Mình buồn chứ không sai.' },
      { en: 'More supplies. I over-packed. Sad people over-pack. It is a known fact.', vi: 'Thêm đồ tiếp tế nè. Mình mang dư. Người buồn hay mang dư. Ai cũng biết.' }
    ] },
    3: { miku: [
      { en: 'Your leek is shining so beautifully out here! La la laaa~ ♪', vi: 'Cây hành của bạn sáng đẹp quá ở ngoài này! La la laaa~ ♪' },
      { en: 'Sing along with the light, Ember! I will keep you warm with my song.', vi: 'Hát cùng ánh sáng nhé, Ember! Tiếng hát của mình sẽ sưởi ấm bạn.' }
    ] },
    5: { miku: [
      { en: 'Even the volcano cannot drown out a good melody! Keep shining, Ember! ♪', vi: 'Ngay cả núi lửa cũng không át được một giai điệu hay! Cứ tỏa sáng nhé, Ember! ♪' }
    ] },
    6: { quan: [
      { en: 'I read the last chapter early. I will not spoil it. But... bring snacks. Good luck, Ember.', vi: 'Mình đọc trước chương cuối rồi. Mình sẽ không tiết lộ. Nhưng... nhớ mang đồ ăn vặt. Chúc may mắn, Ember.' }
    ], miku: [
      { en: 'I will sing for you the whole way! La la laaa~ Go light up the Sun! ♪', vi: 'Mình sẽ hát cho bạn suốt chặng đường! La la laaa~ Đi thắp lại Mặt Trời nào! ♪' }
    ] }
  };
  for (const k in DLG3) DLG[k] = Object.assign(DLG[k] || {}, DLG3[k]);
  const RESCUE = [
    { en: 'You... you came for me? Thank you! I was locked in that cage when the Sun shattered.', vi: 'Bạn... bạn đến cứu mình sao? Cảm ơn bạn! Mình bị nhốt trong chiếc lồng này từ lúc Mặt Trời vỡ.' },
    { en: 'Please take this - my leek! It sings when it shines. It will be your sword now.', vi: 'Bạn hãy nhận lấy - cây hành của mình! Nó hát mỗi khi phát sáng. Từ giờ nó là thanh kiếm của bạn.' },
    { en: 'Sing with the light, Ember! La la laaa~ ♪', vi: 'Hãy hát cùng ánh sáng nhé, Ember! La la laaa~ ♪' }
  ];
  const TRIAL = {
    1: { intro: [
      { en: 'Hehehe... so THIS is the famous lantern-boy? Mr Shorty Phong welcomes you!', vi: 'Hê hê hê... vậy ĐÂY là cậu bé cầm đèn nổi tiếng? Mr Shorty Phong chào đón cậu!' },
      { en: 'My master Quoc wants you stopped. So let us play with my little trial.', vi: 'Chủ nhân Quoc muốn cậu dừng lại. Vậy hãy chơi thử thách nhỏ của ta nào.' },
      { en: 'No exit until every monster is dead. Tee-hee!', vi: 'Không có lối ra cho tới khi quái vật chết hết. Hí hí!' }
    ], outro: [
      { en: 'WHAT?! You beat my pets?! Impossible!', vi: 'CÁI GÌ?! Cậu đánh bại thú cưng của ta sao?! Không thể nào!' },
      { en: 'Hmph. Short men make LONG grudges, lantern-boy!', vi: 'Hừm. Người thấp thì thù DAI, cậu bé cầm đèn!' }
    ] },
    3: { intro: [
      { en: 'Back for more? The desert is MY garden, little lantern!', vi: 'Quay lại chịu đòn à? Sa mạc là vườn nhà ta, đèn con!' },
      { en: 'Three waves this time. Survive... or become sand.', vi: 'Lần này ba đợt. Sống sót... hoặc hóa thành cát.' }
    ], outro: [
      { en: 'HOW?! My calculations were PERFECT!', vi: 'SAO CÓ THỂ?! Tính toán của ta HOÀN HẢO mà!' }
    ] },
    5: { intro: [
      { en: 'This is the hot seat, kid. Even I sweat here.', vi: 'Đây là ghế nóng đó nhóc. Ngay cả ta cũng toát mồ hôi ở đây.' },
      { en: 'Three waves of my FINEST. Do try to enjoy them.', vi: 'Ba đợt tinh nhuệ nhất của ta. Cố mà thưởng thức nhé.' }
    ], outro: [
      { en: 'N-no... Master Quoc will have my hat for this!', vi: 'K-không... Chủ nhân Quoc sẽ lấy chiếc mũ của ta mất!' }
    ] },
    6: { intro: [
      { en: 'Welcome to the FINAL trial. The Eclipse awaits... but first, ME.', vi: 'Chào mừng tới thử thách CUỐI CÙNG. Nhật Thực đang chờ... nhưng trước tiên, là TA.' },
      { en: 'Four waves. FOUR. I stayed up all night designing them.', vi: 'Bốn đợt. BỐN. Ta thức trắng đêm để thiết kế chúng.' }
    ], outro: [
      { en: 'Fine. FINE! Go! Be eaten by the Eclipse!', vi: 'Được thôi. ĐƯỢC THÔI! Đi đi! Để Nhật Thực nuốt chửng cậu!' }
    ] }
  };
  const SPK = { quoc: { name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' }, col: '#ff5a4a' }, shorty: { name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, col: '#ffd34e' }, imp: { name: { en: 'Imp', vi: 'Tiểu quỷ' }, col: '#c07bff' } };
  const CUT = [
    [ // after Verdant Meadow
      { w: 'quoc', shout: 1, en: 'WHAT?! A WALKING CANDLE BEAT MY KING SLIME?!', vi: 'GÌ CƠ?! MỘT CÂY NẾN BIẾT ĐI ĐÁNH BẠI VUA SLIME CỦA TA SAO?!' },
      { w: 'shorty', en: 'M-my lord Quoc... it is only one tiny flame...', vi: 'T-thưa ngài Quoc... chỉ là một ngọn lửa nhỏ xíu thôi ạ...' },
      { w: 'quoc', shout: 1, en: 'TINY FLAMES START BIG FIRES, YOU FOOL! GO! PUT IT OUT!', vi: 'LỬA NHỎ CŨNG GÂY RA ĐÁM CHÁY LỚN, ĐỒ NGỐC! ĐI! DẬP NÓ ĐI!' }
    ],
    [ // after Whispering Forest
      { w: 'quoc', shout: 1, en: 'THE SPIDER QUEEN... DEAD?! I RAISED HER FOR A THOUSAND YEARS!', vi: 'NỮ HOÀNG NHỆN... CHẾT RỒI SAO?! TA NUÔI NÓ HÀNG NGÀN NĂM!' },
      { w: 'imp', en: 'Master... he fights with a glowing... LEEK.', vi: 'Thưa chủ nhân... hắn chiến đấu bằng một... CÂY HÀNH phát sáng.' },
      { w: 'quoc', shout: 1, en: 'A... A LEEK?! HE BEAT HER WITH A VEGETABLE?!', vi: 'MỘT... MỘT CÂY HÀNH?! HẮN ĐÁNH BẠI NÓ BẰNG RAU SAO?!' },
      { w: 'shorty', en: 'A very SHINY vegetable, my lord. Singing, even.', vi: 'Một cây rau rất SÁNG, thưa ngài. Còn biết hát nữa ạ.' },
      { w: 'quoc', shout: 1, en: 'SILENCE! I WILL NOT BE HUMILIATED BY SALAD!', vi: 'IM LẶNG! TA SẼ KHÔNG BỊ NHỤC NHÃ BỞI MỘT ĐĨA SALAD!' }
    ],
    [ // after Crystal Caverns
      { w: 'quoc', shout: 1, en: 'THE GOLEM SHATTERED LIKE CHEAP GLASS! WHO IS HELPING HIM?!', vi: 'NGƯỜI KHỔNG LỒ VỠ NHƯ THỦY TINH RẺ TIỀN! AI ĐANG GIÚP HẮN?!' },
      { w: 'shorty', en: 'A sad bookworm wizard, my lord. They call him QuanSadBoy.', vi: 'Một phù thủy mọt sách buồn bã, thưa ngài. Người ta gọi hắn là QuanSadBoy.' },
      { w: 'quoc', shout: 1, en: 'A BOOKWORM?! I AM BEING DEFEATED BY HOMEWORK?!', vi: 'MỘT CON MỌT SÁCH?! TA ĐANG BỊ ĐÁNH BẠI BỞI BÀI TẬP VỀ NHÀ SAO?!' },
      { w: 'imp', en: 'He... also gave the hero snacks.', vi: 'Hắn... còn đưa cho anh hùng đồ ăn vặt nữa.' },
      { w: 'quoc', shout: 1, en: 'SNACKS?! UNFORGIVABLE!!', vi: 'ĐỒ ĂN VẶT?! KHÔNG THỂ THA THỨ!!' }
    ],
    [ // after Sunscorch Desert
      { w: 'quoc', shout: 1, en: 'MY PHARAOH! MY SANDS! MY PYRAMID COLLECTION!', vi: 'PHARAOH CỦA TA! CÁT CỦA TA! BỘ SƯU TẬP KIM TỰ THÁP CỦA TA!' },
      { w: 'shorty', en: 'Master, I tried my little trial again. He... passed.', vi: 'Thưa chủ nhân, thần lại thử thách nhỏ của thần. Hắn... vượt qua rồi.' },
      { w: 'quoc', shout: 1, en: 'AGAIN?! YOU CANNOT EVEN BEAT A CHILD WITH A LANTERN?!', vi: 'LẠI NỮA SAO?! NGƯƠI KHÔNG THỂ THẮNG NỔI MỘT ĐỨA TRẺ CẦM ĐÈN?!' },
      { w: 'shorty', en: '...I am very short, my lord. It is hard to see him coming.', vi: '...Thần rất thấp, thưa ngài. Khó mà thấy hắn đang tới.' },
      { w: 'quoc', shout: 1, en: 'THEN STAND ON A BOX AND TRY HARDER!!', vi: 'THÌ ĐỨNG LÊN CÁI HỘP VÀ CỐ GẮNG HƠN!!' }
    ],
    [ // after Frostbite Peaks
      { w: 'quoc', shout: 1, en: 'THE FROST KING MELTED?! HE WAS FROZEN BY DEFINITION!', vi: 'VUA BĂNG TAN CHẢY SAO?! THEO ĐỊNH NGHĨA HẮN LÀ BĂNG CƠ MÀ!' },
      { w: 'imp', en: 'H-he used fire flasks, master...', vi: 'H-hắn dùng bình lửa, thưa chủ nhân...' },
      { w: 'quoc', shout: 1, en: 'THEN FREEZE THE FLASKS, YOU FOOL!!', vi: 'THÌ ĐÓNG BĂNG CÁI BÌNH ĐÓ ĐI, ĐỒ NGỐC!!' },
      { w: 'shorty', en: 'Only the volcano and the Citadel remain, my lord...', vi: 'Chỉ còn núi lửa và Thành Trì thôi, thưa ngài...' },
      { w: 'quoc', shout: 1, en: 'ENOUGH! WAKE THE TITAN! AND IF HE FAILS... WAKE THE ECLIPSE!', vi: 'ĐỦ RỒI! ĐÁNH THỨC TITAN! VÀ NẾU HẮN THẤT BẠI... ĐÁNH THỨC NHẬT THỰC!' }
    ],
    [ // after Ember Volcano
      { w: 'quoc', shout: 1, en: 'THE TITAN IS ASH!! ASH!!! HE WAS MY FAVORITE VOLCANO!', vi: 'TITAN THÀNH TRO RỒI!! TRO!!! HẮN LÀ NGỌN NÚI LỬA YÊU THÍCH CỦA TA!' },
      { w: 'shorty', en: 'Master... six fragments of the Sun burn together again.', vi: 'Thưa chủ nhân... sáu mảnh Mặt Trời lại cháy cùng nhau.' },
      { w: 'quoc', shout: 1, en: 'THEN THE ECLIPSE WILL END THIS! AWAKEN IT!!', vi: 'VẬY NHẬT THỰC SẼ KẾT THÚC TẤT CẢ! ĐÁNH THỨC NÓ!!' },
      { w: 'quoc', shout: 1, en: 'LET THE WORLD GO DARK FOREVER!!!', vi: 'ĐỂ THẾ GIỚI TỐI ĐEN MÃI MÃI!!!' }
    ]
  ];
  const SHOPS = {""")

# use paint-based npc sprites
rep("const n = NPCS[it.who], sp = getSprite(n.spr), bob =", "const n = NPCS[it.who], sp = npcSpr(n.spr), bob =")
rep("const tk = Q.talk, sp = getSprite(tk.npc.spr);", "const tk = Q.talk, sp = npcSpr(tk.npc.spr);")

# ---------------- talk: scripted + gifts ----------------
a = s.index("  function endTalk() {")
b = s.index("  function updateTalk(dt) {")
s = s[:a] + u"""  function startScripted(who, lines, after) {
    Q.talk = { it: { who }, npc: NPCS[who], lines, i: 0, t: 0, after }; Q.state = 'talk'; Snd.blip(who); Q.P.vx = 0;
  }
  function giveGift(gf) {
    for (const k in gf) Q.P.ammo[k] += gf[k];
    Snd.play('pickup'); Q.msg = T('gift') + '  (+' + gf.dagger + ' ' + T('dagger') + ', +' + gf.bomb + ' ' + T('bomb') + ', +' + gf.flask + ' ' + T('flask') + ')'; Q.msgT = 5;
  }
  function endTalk() {
    const tk = Q.talk, n = tk.npc, it = tk.it; Q.talk = null;
    if (tk.after) { Q.state = 'play'; tk.after(); return; }
    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; Q.shopWho = it.who; return; }
    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
      if (n.gift) giveGift(n.gift);
    }
  }
""" + s[b:]

# ---------------- state: trials / cage ----------------
rep("solved: new Set(), brokenX: new Set(), nearPz: null,", "solved: new Set(), brokenX: new Set(), trials: [], trialsDone: new Set(), nearPz: null,")
rep("    Q.gates = L.gates.map(gd => Object.assign({}, gd, { open: Q.solved.has(gd.id), seqIdx: 0, timer: 0, levers: 0 }));",
    u"""    Q.gates = L.gates.map(gd => Object.assign({}, gd, { open: Q.solved.has(gd.id), seqIdx: 0, timer: 0, levers: 0 }));
    for (const t of L.trials) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }
    Q.trials = L.trials.map(t => Object.assign({}, t, { state: Q.trialsDone.has(t.id) ? 'done' : 'idle', wave: 0, cd: 0 }));""")
rep("      else if (s.type === 'pk') Q.items.push(",
    u"""      else if (s.type === 'cage') { if (save.leek) Q.items.push({ kind: 'npc', who: 'miku', x: s.x, y: s.y, id: s.id, ph: 0 }); else Q.pz.push({ type: 'cage', x: s.x, y: s.y, grp: s.grp, open: false }); }
      else if (s.type === 'pk') Q.items.push(""")
rep("minion: !!(s && s.minion) };", "minion: !!(s && s.minion), grp: s && s.grp, trial: s && s.trial };")

# ---------------- puzzle hooks: cage + trials ----------------
rep("      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit)) continue;", "      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit) || (pz.type === 'cage' && pz.open)) continue;")
rep("    else if (pz.type === 'tablet') { Q.tablet = gateOf(pz.gate); Q.state = 'tablet'; Snd.play('select'); }",
    u"""    else if (pz.type === 'tablet') { Q.tablet = gateOf(pz.gate); Q.state = 'tablet'; Snd.play('select'); }
    else if (pz.type === 'cage') {
      if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { Q.msg = T('guards'); Q.msgT = 3; Snd.play('zap'); return; }
      startScripted('miku', RESCUE, () => { pz.open = true; save.leek = true; writeSave(); Q.items.push({ kind: 'npc', who: 'miku', x: pz.x, y: pz.y, id: -5, ph: 0 }); Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer'); emit(pz.x, pz.y - 14, 40, { col: ['#a4ffc0', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); });
    }""")
rep("  function updatePuzzles(dt) {\n    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };\n    Q.nearPz = null;",
    u"""  // ===================== Mr Shorty's trials =====================
  function sealTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = 'G'; Q.L.grid[y][tr.rw] = 'G'; } Snd.play('gate'); Q.shake = 0.6; }
  function openTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = ' '; Q.L.grid[y][tr.rw] = ' '; } Snd.play('gate'); }
  function spawnWave(tr) {
    const B = Q.B, d = 0.15 + tr.wave * 0.22 + Q.li * 0.06, pool = B.enemies.filter(e => e.min <= d);
    const n = 2 + tr.wave + (Q.li > 3 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      let tot = 0; pool.forEach(e => tot += e.w); let r = Math.random() * tot, type = pool[0].t;
      for (const e of pool) { r -= e.w; if (r <= 0) { type = e.t; break; } }
      const fx = (tr.lw + 3 + Math.random() * (tr.rw - tr.lw - 6)) * TS;
      const e = makeEnemy(type, fx, FLY.has(type) ? (tr.gy - 4) * TS : tr.gy * TS, {}); e.trial = tr.id; e.alerted = true; e.minion = false;
      Q.ents.push(e); emit(fx, e.y + e.h / 2, 14, { col: ['#c07bff', '#fff', '#6a3aa8'], sp0: 20, sp1: 80 });
    }
    tr.wave++; Q.msg = T('wave') + ' ' + tr.wave + ' / ' + tr.waves; Q.msgT = 3; Snd.play('zap');
  }
  function updateTrials(dt) {
    const P = Q.P;
    for (const tr of Q.trials) {
      if (tr.state === 'idle') {
        if (P.x > tr.trig * TS && P.x < tr.rw * TS - 8 && P.onGround) {
          tr.state = 'intro';
          startScripted('shorty', TRIAL[Q.li].intro, () => { sealTrial(tr); tr.state = 'active'; tr.cd = 0.8; });
        }
      } else if (tr.state === 'active') {
        if (Q.ents.some(e => !e.dead && e.trial === tr.id)) continue;
        tr.cd -= dt; if (tr.cd > 0) continue;
        if (tr.wave < tr.waves) { spawnWave(tr); tr.cd = 1.2; }
        else {
          tr.state = 'done'; Q.trialsDone.add(tr.id); openTrial(tr); Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic');
          const cx = (tr.lw + tr.rw) / 2 * TS;
          for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 12, y: tr.gy * TS - 30, id: -1, vy: -120, vx: i ? 25 : -25, ph: 0, drop: true });
          for (let i = 0; i < 10; i++) Q.items.push({ kind: 'coin', x: cx + rr(-20, 20), y: tr.gy * TS - 30, id: -1, vy: -rr(80, 160), vx: rr(-50, 50), ph: 0, drop: true });
          Q.items.push({ kind: 'pk', what: 'bomb', amt: 2, keep: false, x: cx, y: tr.gy * TS - 30, id: -1, vy: -140, vx: 0, ph: 0, drop: true });
          startScripted('shorty', TRIAL[Q.li].outro, null);
        }
      }
    }
  }
  function updatePuzzles(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.nearPz = null;
    updateTrials(dt);""")
rep("      else if (pz.type === 'tablet') drawSpr(g, icon('tablet'), x, y, false);\n      else if (pz.type === 'rune')",
    u"""      else if (pz.type === 'tablet') drawSpr(g, icon('tablet'), x, y, false);
      else if (pz.type === 'cage') {
        const sp = npcSpr('npc_miku'); drawSpr(g, sp, x, y - 1 + Math.round(Math.sin(Q.t * 2) * 0.6), false, false);
        drawSpr(g, npcSpr('cage'), x, y + 1, false);
        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 52, 3, 7); g.fillRect(x - 1, y - 43, 3, 3); }
      }
      else if (pz.type === 'rune')""")
rep("txt(pz.type === 'torch' ? T('light') : (pz.type === 'tablet' ? T('read') : T('use')), x, y - 26,", "txt(pz.type === 'torch' ? T('light') : (pz.type === 'tablet' ? T('read') : (pz.type === 'cage' ? T('free') : T('use'))), x, y - (pz.type === 'cage' ? 56 : 26),")

# nearPz y tolerance for tall cage
rep("      if (Math.abs(pz.x - pc.x) < 16 && Math.abs(pz.y - pc.y) < 26) Q.nearPz = pz;", "      if (Math.abs(pz.x - pc.x) < (pz.type === 'cage' ? 22 : 16) && Math.abs(pz.y - pc.y) < 26) Q.nearPz = pz;")

# ---------------- reward state ----------------
rep("    if (st === 'tablet') {", "    if (st === 'reward') { Q.stateT += 0; if (Q.stateT > 0.8 && (act.okP || act.talkP || act.atkP)) Q.state = 'play'; updateParticles(dt); return; }\n    if (st === 'tablet') {") if "    if (st === 'tablet') {" in s else None
io.open(p, 'w', encoding='utf-8').write(s)
print('part1 ok')
