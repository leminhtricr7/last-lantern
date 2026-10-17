import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert a in s, a[:60]
    s = s.replace(a, b, 1)

# ---- nerf the map-1 dragon ----
rep("young: { stages: [{ form: 0, hp: 150, armor: 0, w: 58, h: 28, sp: 70,", "young: { stages: [{ form: 0, hp: 45, armor: 0, w: 58, h: 28, sp: 52,")
rep("if (d.def.kind === 'young') { if (d.hp <= d.max * 0.25) startFlee(d); }", "if (d.def.kind === 'young') { if (d.hp <= d.max * 0.45) startFlee(d); }")
rep("ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 })) hurtPlayer(2, c.x);", "ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 })) hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x);")

# ---- opening story ----
a = s.index("  const STORY = [")
b = s.index("  const ENDING = [")
story = """  const STORY = [
    { en: 'Long ago, the Sun watched over the land of Aurelia. No night was ever truly dark, and every village kept a little lantern lit in its honour.', vi: 'Ngày xửa ngày xưa, Mặt Trời dõi theo vùng đất Aurelia. Không đêm nào thật sự tối, và mỗi ngôi làng đều thắp một chiếc đèn nhỏ để tạ ơn.' },
    { en: 'But beneath the world, in a throne of cinders, something ancient was starving. Quoc the Devil, lord of the Eclipse, hated the light.', vi: 'Nhưng dưới lòng đất, trên ngai vàng bằng tro nguội, có một thứ cổ xưa đang đói khát. Quoc Ác Quỷ, chúa tể Nhật Thực, căm ghét ánh sáng.' },
    { en: 'On the longest night he rose, and swallowed the Sun in one bite. It cracked like glass and fell as seven burning fragments.', vi: 'Vào đêm dài nhất, hắn trỗi dậy và nuốt chửng Mặt Trời. Nó vỡ như thủy tinh và rơi xuống thành bảy mảnh cháy rực.' },
    { en: 'The lanterns of Aurelia went out, one by one. Cold crept in. Monsters crawled from the dark, and Quoc\\'s minions took anyone who sang of the light.', vi: 'Những chiếc đèn của Aurelia tắt dần, từng chiếc một. Giá lạnh tràn vào. Quái vật bò ra từ bóng tối, và thuộc hạ của Quoc bắt đi bất cứ ai còn hát về ánh sáng.' },
    { en: 'In a quiet village, a boy named Ember kept his grandmother\\'s lantern. It flickered. It nearly died. But it never went out.', vi: 'Ở một ngôi làng yên ắng, cậu bé Ember giữ chiếc đèn của bà. Nó chập chờn. Nó suýt tắt. Nhưng nó chưa bao giờ tắt hẳn.' },
    { en: 'Lila, the village girl, pressed a rusty sword into his hands. \"It is not much,\" she said. \"But a small flame and a stubborn heart have beaten bigger darkness.\"', vi: 'Lila, cô gái trong làng, đặt một thanh kiếm gỉ vào tay cậu. \"Không nhiều đâu,\" cô nói. \"Nhưng một ngọn lửa nhỏ và một trái tim bướng bỉnh từng thắng bóng tối lớn hơn.\"' },
    { en: 'You are Ember, the last Lanternbearer. Cross meadow, forest, cavern, desert, peak and fire. Gather the seven fragments. Relight the Sun.', vi: 'Bạn là Ember, người mang đèn cuối cùng. Băng qua đồng cỏ, rừng sâu, hang động, sa mạc, đỉnh băng và núi lửa. Gom bảy mảnh vỡ. Thắp lại Mặt Trời.' }
  ];
  // short story beats shown once, the first time you enter each map
  let storyLevel = 0;
  const MAP_STORY = {
    0: [
      { en: 'VERDANT MEADOW. The grass is still green here, but it has stopped swaying. Even the bees fly low and afraid.', vi: 'ĐỒNG CỎ XANH. Cỏ vẫn xanh nhưng đã thôi lay động. Ngay cả đàn ong cũng bay thấp, run rẩy.' },
      { en: 'Somewhere ahead a girl is singing, soft and shaky, from inside a cage. Her song is the only warm thing left in the meadow.', vi: 'Đâu đó phía trước, một cô gái đang hát khe khẽ, run run, từ trong một chiếc lồng. Bài hát của cô là thứ ấm áp duy nhất còn sót lại trên đồng cỏ.' }
    ],
    1: [
      { en: 'WHISPERING FOREST. Here the trees listen. Old mechanisms of the Lanternbearers still sleep among the roots.', vi: 'RỪNG THÌ THẦM. Ở đây cây cối biết lắng nghe. Những cơ quan cổ của các Người Mang Đèn vẫn ngủ yên giữa rễ cây.' },
      { en: 'A small man in a tall hat is watching you from the branches, grinning. Mr Shorty Phong has been waiting.', vi: 'Một người đàn ông thấp bé đội mũ cao đang cười toe nhìn bạn từ trên cành cây. Mr Shorty Phong đã chờ sẵn.' }
    ],
    2: [
      { en: 'CRYSTAL CAVERNS. The crystals were once the Sun\\'s tears. Now they glow weakly, like a heartbeat fading.', vi: 'HANG PHA LÊ. Những viên pha lê từng là nước mắt của Mặt Trời. Giờ chúng chỉ sáng yếu ớt, như nhịp tim đang tàn.' },
      { en: 'It is dark enough that your lantern feels like the only star. Something in the dark is learning your name.', vi: 'Tối đến mức chiếc đèn của bạn như ngôi sao duy nhất. Có thứ gì đó trong bóng tối đang học thuộc tên bạn.' }
    ],
    3: [
      { en: 'SUNSCORCH DESERT. The sand remembers the Sun better than anyone. It still burns by day, and by night it burns with hate.', vi: 'SA MẠC CHÁY NẮNG. Cát nhớ Mặt Trời hơn bất kỳ ai. Ban ngày nó vẫn nóng, ban đêm nó cháy bằng hận thù.' },
      { en: 'Buried here sleeps the Sand Pharaoh, who swore loyalty to Quoc for a promise of eternal night. Walk lightly, Lanternbearer.', vi: 'Nơi đây chôn vùi Pharaoh Cát, kẻ đã thề trung thành với Quoc đổi lấy lời hứa về đêm vĩnh cửu. Bước nhẹ thôi, Người Mang Đèn.' }
    ],
    4: [
      { en: 'FROSTBITE PEAKS. Snow falls upward here, as if the sky itself is trying to escape. Your lantern burns blue at the edges.', vi: 'ĐỈNH BĂNG GIÁ. Tuyết rơi ngược lên trời, như thể bầu trời đang cố trốn chạy. Ngọn đèn của bạn cháy xanh ở viền.' },
      { en: 'The Frost King wanted only to be left alone, once. Quoc whispered that the Sun was the thing that melted his crown.', vi: 'Vua Băng Giá từng chỉ muốn được yên thân. Quoc thì thầm rằng Mặt Trời chính là thứ đã làm tan vương miện của ông.' }
    ],
    5: [
      { en: 'EMBER VOLCANO. The heat is almost kind after the cold. This is where Ignarok swore he would return, and where Quoc keeps his forge.', vi: 'NÚI LỬA THAN HỒNG. Hơi nóng gần như dễ chịu sau giá lạnh. Đây là nơi Ignarok thề sẽ trở lại, và là lò rèn của Quoc.' },
      { en: 'Your sword is no longer rusty. Every fragment you carry hums with the Sun\\'s old song. Quoc can hear it. He is afraid.', vi: 'Thanh kiếm của bạn không còn gỉ nữa. Mỗi mảnh vỡ bạn mang đều ngân lên bài ca cũ của Mặt Trời. Quoc nghe thấy. Hắn đang sợ.' }
    ],
    6: [
      { en: 'SHADOW CITADEL. The last door of Aurelia. Behind it, the Eclipse waits where the Sun was swallowed.', vi: 'THÀNH TRÌ BÓNG ĐÊM. Cánh cửa cuối cùng của Aurelia. Phía sau là Nhật Thực, nơi Mặt Trời bị nuốt chửng.' },
      { en: 'Everyone you met believes in you: Lila, Lyra, Captain Bram, even sad old QuanSadBoy. Your lantern is small. It is also all of them.', vi: 'Tất cả những người bạn gặp đều tin vào bạn: Lila, Lyra, Đội trưởng Bram, cả QuanSadBoy buồn bã. Đèn của bạn nhỏ thôi. Nhưng nó cũng là tất cả họ.' },
      { en: 'Step through, Ember. Relight the Sun.', vi: 'Bước vào đi, Ember. Hãy thắp lại Mặt Trời.' }
    ]
  };
"""
s = s[:a] + story + s[b:]

# ---- play map story once on first entry ----
rep("    if (act.okP) { Snd.play('ok'); startLevelFade(mapSel); }", "    if (act.okP) {\n      Snd.play('ok');\n      if (!save.seen) save.seen = {};\n      if (MAP_STORY[mapSel] && !save.seen[mapSel]) { save.seen[mapSel] = 1; writeSave(); storyLevel = mapSel; toScene('mstory'); }\n      else startLevelFade(mapSel);\n    }")
rep("    if (s === 'story') { storyPage = 0;", "    if (s === 'mstory') { scene = 'story'; storyPage = 0; storyT = 0; storyList = MAP_STORY[storyLevel]; Snd.music('title', TITLE_MUSIC); }\n    if (s === 'story') { storyPage = 0;")
rep("storyPage++; storyT = 0; if (storyPage >= storyList.length) { if (storyList === STORY) { mapSel = 0; startLevelFade(0); } else { toScene('title'); } }", "storyPage++; storyT = 0; if (storyPage >= storyList.length) { if (storyList === STORY) { mapSel = 0; startLevelFade(0); } else if (storyList === ENDING) { toScene('title'); } else startLevelFade(storyLevel); }")
rep("if (act.backP && storyList === STORY) { startLevelFade(0); }", "if (act.backP && storyList === STORY) { startLevelFade(0); } else if (act.backP && storyList !== ENDING) startLevelFade(storyLevel);")
rep("it.push({ k: 'newgame', fn: () => { save.inv =", "it.push({ k: 'newgame', fn: () => { save.seen = {}; save.inv =")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
