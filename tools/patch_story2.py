import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def need(s, a):
    assert a in s, a[:70]

# ---------------- art: small princess ----------------
def art(s):
    a = "function lyraPaint(P, leek) {"
    need(s, a)
    helper = '''// scale a painter down so a sprite drawn on a big grid comes out smaller (chibi princess)
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
'''
    s = s.replace(a, helper + a, 1)
    s = s.replace("npc_lyra: [32, 38, P => lyraPaint(P, false)],", "npc_lyra: [21, 25, P => lyraPaint(scaledP(P, 0.62), false)],")
    s = s.replace("npc_lyra_leek: [32, 38, P => lyraPaint(P, true)],", "npc_lyra_leek: [21, 25, P => lyraPaint(scaledP(P, 0.62), true)],")
    return s
edit('src/art.js', art)

# ---------------- game ----------------
def game(s):
    def rep(a, b):
        nonlocal s
        need(s, a); s = s.replace(a, b, 1)
    # dragon: lower hover, harmless touch (only dives hurt), a bit slower
    rep("const dHover = d => d.tr.gy * TS - 50 - d.h * 0.45,", "const dHover = d => d.tr.gy * TS - (d.def.kind === 'young' ? 30 : 50) - d.h * (d.def.kind === 'young' ? 0.28 : 0.45),")
    rep("if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 })) hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x);",
        "if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 }) && (d.def.kind !== 'young' || (d.st === 'act' && d.sk === 'dive'))) hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x);")
    # rescue dialogue
    a = s.index("  const RESCUE = ["); b = s.index("  const TRIAL = {")
    s = s[:a] + """  const RESCUE = [
    { en: 'You... you came for me? The cage is open! Oh, thank the light!', vi: 'Bạn... bạn đến cứu mình sao? Lồng mở rồi! Ôi, tạ ơn ánh sáng!' },
    { en: 'I am Lyra, Princess of the Singing Meadow. When the Sun shattered, Quoc\\'s minions locked me up to silence my song.', vi: 'Mình là Lyra, công chúa của Đồng Cỏ Hát Ca. Khi Mặt Trời vỡ, thuộc hạ của Quoc nhốt mình lại để dập tắt bài hát.' },
    { en: 'My song is the only thing that makes the leek-blade shine. It is a royal treasure, and it has waited for a Lanternbearer.', vi: 'Bài hát của mình là thứ duy nhất làm cây kiếm hành phát sáng. Nó là bảo vật hoàng gia, và đã chờ một Người Mang Đèn.' },
    { en: 'Please take it! Hold it high and it will sing with your flame. It is stronger than your rusty sword, and it will grow brighter with every fragment you find.', vi: 'Xin hãy nhận lấy! Giơ cao lên và nó sẽ hát cùng ngọn lửa của bạn. Nó mạnh hơn thanh kiếm gỉ, và sẽ sáng hơn sau mỗi mảnh vỡ bạn tìm được.' },
    { en: 'I will not forget this, Ember. Whenever you are tired, listen... I will sing for you. La la laaa~ ♪', vi: 'Mình sẽ không quên ơn này, Ember. Mỗi khi mệt mỏi, hãy lắng nghe... mình sẽ hát cho bạn. La la laaa~ ♪' }
  ];
""" + s[b:]
    # cage smaller
    rep("drawSpr(g, npcSpr('cage'), x, y + 1, false);\n        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 52, 3, 7); g.fillRect(x - 1, y - 43, 3, 3); }",
        "drawSpr(g, npcSpr('cage'), x, y + 1, false, false, 0.8, 0.8);\n        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 44, 3, 7); g.fillRect(x - 1, y - 35, 3, 3); }")
    rep("(pz.type === 'cage' ? T('free') : T('use'))), x, y - (pz.type === 'cage' ? 56 : 26)", "(pz.type === 'cage' ? T('free') : T('use'))), x, y - (pz.type === 'cage' ? 48 : 26)")
    # reward scene: show Lyra giving the leek
    rep("g.save(); g.translate(VW / 2, 96); g.rotate(-0.5 + Math.sin(Q.stateT * 2) * 0.1); g.scale(3, 3); g.drawImage(lk.c, -lk.w / 2, -lk.h / 2); g.restore(); g.globalAlpha = 1;",
        "g.save(); g.translate(VW / 2 + 36, 92); g.rotate(-0.5 + Math.sin(Q.stateT * 2) * 0.1); g.scale(3, 3); g.drawImage(lk.c, -lk.w / 2, -lk.h / 2); g.restore(); g.globalAlpha = 1;\n      drawSpr(g, npcSpr('npc_lyra'), VW / 2 - 62, 126 + Math.round(Math.sin(Q.stateT * 3)), false, false, 3, 3, a);")
    # opening: long map-1 intro right after the main story
    rep("if (storyList === STORY) { mapSel = 0; startLevelFade(0); }", "if (storyList === STORY) { mapSel = 0; save.seen = { 0: 1 }; writeSave(); storyLevel = 0; storyList = MAP_STORY[0]; storyPage = 0; storyT = 0; }")
    # long map 1 intro
    a = s.index("    0: [\n      { en: 'VERDANT MEADOW."); b = s.index("    1: [\n      { en: 'WHISPERING FOREST.")
    s = s[:a] + """    0: [
      { en: 'VERDANT MEADOW. Ember walks out of the village at dawn that is not a dawn. The sky is the colour of old ash.', vi: 'ĐỒNG CỎ XANH. Ember bước ra khỏi làng vào một buổi bình minh không còn là bình minh. Bầu trời mang màu tro cũ.' },
      { en: 'The meadow was once the happiest place in Aurelia. Children raced kites here. Now the grass lies flat and the kites hang torn in the branches.', vi: 'Đồng cỏ từng là nơi vui nhất Aurelia. Bọn trẻ thả diều ở đây. Giờ cỏ rạp xuống và những chiếc diều rách treo trên cành cây.' },
      { en: 'Ember grips the rusty sword Lila gave him. His lantern shakes in his other hand. He is afraid, and he walks on anyway.', vi: 'Ember siết thanh kiếm gỉ Lila trao. Chiếc đèn rung trong tay còn lại. Cậu sợ, nhưng vẫn bước tiếp.' },
      { en: 'Slimes ooze across the path. Bees buzz with a cold, angry hum. Quoc\\'s shadow has soured everything that once was sweet.', vi: 'Slime trườn qua lối đi. Ong vo ve bằng tiếng ù lạnh lẽo, giận dữ. Bóng của Quoc đã làm chua mọi thứ từng ngọt ngào.' },
      { en: 'Then, from far away, a voice. A girl, singing. Her song is thin and trembling, but it is the first warm sound Ember has heard in three nights.', vi: 'Rồi từ xa vọng lại một giọng hát. Một cô gái. Tiếng hát mỏng manh, run rẩy, nhưng là âm thanh ấm áp đầu tiên Ember nghe được sau ba đêm.' },
      { en: 'Lila\\'s words come back to him: \\"A small flame beats a big darkness, if it keeps burning.\\" He lifts the lantern higher.', vi: 'Lời Lila vang lại: \\"Ngọn lửa nhỏ thắng bóng tối lớn, nếu nó cứ cháy.\\" Cậu giơ chiếc đèn lên cao hơn.' },
      { en: 'Above the meadow, a shape with great ash-grey wings circles slowly. Ignarok the Ashwing is hunting for the last flame in Aurelia.', vi: 'Trên đồng cỏ, một bóng đen với đôi cánh xám tro khổng lồ lượn vòng chậm rãi. Ignarok Cánh Tro đang săn ngọn lửa cuối cùng của Aurelia.' },
      { en: 'Find the singer. Survive the Ashwing. Take the first fragment of the Sun. Your journey begins now, Ember.', vi: 'Hãy tìm người hát. Sống sót trước Cánh Tro. Lấy mảnh Mặt Trời đầu tiên. Hành trình của bạn bắt đầu từ bây giờ, Ember.' }
    ],
""" + s[b:]
    # long ending
    a = s.index("  const ENDING = ["); b = s.index("  const NPCS = {")
    s = s[:a] + """  const ENDING = [
    { en: 'The Shadow Citadel trembles. The seventh fragment burns in Ember\\'s hand, brighter than anything he has ever held.', vi: 'Thành Trì Bóng Đêm rung chuyển. Mảnh thứ bảy cháy trong tay Ember, sáng hơn bất cứ thứ gì cậu từng cầm.' },
    { en: 'The Eclipse screams. For a heartbeat it is no longer a hunger, only a shadow of something that was once lonely and afraid.', vi: 'Nhật Thực gào thét. Trong một nhịp tim, nó không còn là cơn đói, chỉ còn là cái bóng của thứ từng cô đơn và sợ hãi.' },
    { en: 'The Eclipse breaks. The darkness pours out of the sky like water out of a cracked bowl, and the stars come back behind it.', vi: 'Nhật Thực vỡ tan. Bóng tối đổ khỏi bầu trời như nước chảy khỏi chiếc bát nứt, và các vì sao hiện về phía sau nó.' },
    { en: 'Seven fragments rise out of the ruins. They find each other. They turn, slowly, around a place in the sky where the Sun used to be.', vi: 'Bảy mảnh vỡ bay lên từ đống đổ nát. Chúng tìm thấy nhau. Chúng xoay chậm quanh nơi Mặt Trời từng ngự trị.' },
    { en: 'They join with a sound like a thousand bells. The Sun is whole again, and it burns.', vi: 'Chúng hợp lại với âm thanh như ngàn chiếc chuông. Mặt Trời nguyên vẹn trở lại, và nó bừng cháy.' },
    { en: 'Dawn breaks over Aurelia. In the village, every lantern lights by itself, one after another, all the way to the sea.', vi: 'Bình minh ló rạng trên Aurelia. Trong làng, mọi chiếc đèn tự thắp sáng, cái này đến cái khác, cho tới tận biển.' },
    { en: 'Lila runs through the square laughing. Captain Bram takes off his helmet. Princess Lyra stands on the meadow and sings, and this time the whole world sings with her.', vi: 'Lila chạy qua quảng trường, cười vang. Đội trưởng Bram bỏ mũ giáp. Công chúa Lyra đứng trên đồng cỏ cất tiếng hát, và lần này cả thế giới hát cùng cô.' },
    { en: 'Even QuanSadBoy closes his thick book and smiles for the first time. Mr Shorty Phong, from the top of a tree, sulks that he did not win. Then, quietly, he waves.', vi: 'Ngay cả QuanSadBoy cũng gấp cuốn sách dày lại và mỉm cười lần đầu tiên. Mr Shorty Phong, từ trên ngọn cây, hờn dỗi vì không thắng. Rồi lặng lẽ vẫy tay.' },
    { en: 'And Ember? His little lantern flickers in the sunlight. It does not need to burn so hard anymore. It dims, softly, like a friend finally allowed to rest.', vi: 'Còn Ember? Chiếc đèn nhỏ chập chờn trong nắng. Nó không cần cháy gắt như trước nữa. Nó dịu đi, nhẹ nhàng, như một người bạn cuối cùng được nghỉ ngơi.' },
    { en: 'Ember sets it down on the windowsill of his grandmother\\'s house. The light of the Sun falls on it, and for a moment it seems to glow back.', vi: 'Ember đặt nó lên bệ cửa sổ nhà bà. Ánh sáng Mặt Trời rọi xuống, và trong khoảnh khắc nó dường như sáng đáp lại.' },
    { en: 'The last Lanternbearer has done what no one thought possible. A small flame, and a stubborn heart.', vi: 'Người Mang Đèn cuối cùng đã làm điều không ai tin nổi. Một ngọn lửa nhỏ, và một trái tim bướng bỉnh.' },
    { en: 'Thank you, Ember.', vi: 'Cảm ơn bạn, Ember.' }
  ];

""" + s[b:]
    return s
edit('src/game.js', game)
print('ok')
