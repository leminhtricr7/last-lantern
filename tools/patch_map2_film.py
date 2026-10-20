# Map films (first visit to a map plays a short film, then a dialogue as the map begins) and map 2's film + story.
# Film code: tools/mfilm.js
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

film = io.open('tools/mfilm.js', encoding='utf-8').read()
i = s.index('  // ===================== FILMS: the 60 s intro and the 60 s outro')
s = s[:i] + film + s[i:]

# entering a map from the world map: its film comes first (once)
rep("""      const li = LORDER[mapSel];
      if (MAP_STORY[li] && !save.seen[li]) { save.seen[li] = 1; writeSave(); storyLevel = li; toScene('mstory'); }""",
    """      const li = LORDER[mapSel];
      if (MFILM[li] && !(save.films && save.films[li])) { save.films = save.films || {}; save.films[li] = 1; save.seen[li] = 1; writeSave(); startMapFilm(li); }
      else if (MAP_STORY[li] && !save.seen[li]) { save.seen[li] = 1; writeSave(); storyLevel = li; toScene('mstory'); }""")
# the loop, the skip button and clicks
rep("""        else if (scene === 'opening') updateOpening(sub);""", """        else if (scene === 'opening') updateOpening(sub);
        else if (scene === 'mfilm') updateMapFilm(sub);""")
rep("""    else if (scene === 'opening') drawOpening();""", """    else if (scene === 'opening') drawOpening();
    else if (scene === 'mfilm') drawMapFilm();""")
rep("""scene === 'ride' || scene === 'opening' ||""", """scene === 'ride' || scene === 'opening' || scene === 'mfilm' ||""")
rep("""    else if (scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'credits') pressed.Enter = true;""",
    """    else if (scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'mfilm' || scene === 'credits') pressed.Enter = true;""")
# the dialogue as the map begins
rep("""    if (opIntro && Q && Q.li === 0 && Q.state === 'play' && !coop) { opIntro = false; startScripted('narr', MAP1_OPEN, null); }""",
    """    if (opIntro && Q && Q.li === 0 && Q.state === 'play' && !coop) { opIntro = false; startScripted('narr', MAP1_OPEN, null); }
    if (mfIntro >= 0 && Q && Q.li === mfIntro && Q.state === 'play' && !coop) { const L = MFILM[mfIntro] && MFILM[mfIntro].open; mfIntro = -1; if (L) startScripted('narr', L, null); }""")

# ---------- map 2 story ----------
rep("""      { en: 'WHISPERING FOREST. Here the trees listen. Old mechanisms of the Lanternbearers still sleep among the roots.', vi: 'RỪNG THÌ THẦM. Ở đây cây cối biết lắng nghe. Những cơ quan cổ của các Người Mang Đèn vẫn ngủ yên giữa rễ cây.' },
      { en: 'A small man in a tall hat is watching you from the branches, grinning. Mr Shorty Phong has been waiting.', vi: 'Một người đàn ông thấp bé đội mũ cao đang cười toe nhìn bạn từ trên cành cây. Mr Shorty Phong đã chờ sẵn.' }""",
    """      { en: 'WHISPERING FOREST. Here the trees listen, and they remember. Somewhere among the roots, the Second Tower is sleeping.', vi: 'RỪNG THÌ THẦM. Ở đây cây cối biết lắng nghe, và chúng nhớ. Đâu đó giữa những rễ cây, Tháp Đèn Thứ Hai đang ngủ.' },
      { en: 'The Ancient Tree says a boy with a lantern passed here a hundred years ago, laughing. His name was Quoc.', vi: 'Cây Cổ Thụ kể rằng trăm năm trước, một cậu bé cầm đèn đã đi qua đây, cười vang. Tên cậu là Quốc.' }""")
rep("""      { en: 'Oh! Sorry, I was reading while walking. I am Quan... some call me QuanSadBoy. I am a wizard. Mostly I read.', vi: 'Ồ! Xin lỗi, mình vừa đi vừa đọc sách. Mình là Quan... người ta gọi mình là QuanSadBoy. Mình là phù thủy. Chủ yếu là đọc sách.' },""",
    """      { en: 'There you are! Chapter four: "The Lanternbearer Who Laughed". He really did laugh a lot, back then. Sigh.', vi: 'Bạn đây rồi! Chương bốn: "Người Giữ Đèn Hay Cười". Hồi đó anh ấy cười nhiều thật. Haizz.' },""")
rep("""        { en: 'My children... will spin... in the dark... forever...', vi: 'Các con ta... sẽ giăng tơ... trong bóng tối... mãi mãi...' },
        { w: 'narr', en: 'The webs fall like dead leaves. For the first time in days, moonlight reaches the forest floor.', vi: 'Những tấm tơ rơi xuống như lá úa. Lần đầu tiên sau nhiều ngày, ánh trăng chạm tới mặt đất của khu rừng.' }""",
    """        { en: 'My children... will spin... in the dark... forever...', vi: 'Các con ta... sẽ giăng tơ... trong bóng tối... mãi mãi...' },
        { w: 'lyra', en: 'Now! Lift the lantern, and I will sing!', vi: 'Ngay bây giờ! Bạn giơ đèn lên, mình sẽ hát!' },
        { w: 'narr', en: 'The webs fall like dead leaves. Lyra sings, the Second Tower blazes above the trees, and a new thread of light runs towards the crystal mountains.', vi: 'Những tấm tơ rơi xuống như lá úa. Lyra cất tiếng hát, Tháp Đèn Thứ Hai bừng sáng trên ngọn cây, và một sợi ánh sáng mới chạy về phía những ngọn núi pha lê.' }""")

# ---------- Castle Aurelia after map 2 ----------
a0 = s.index('  const CASTLE = [')
a1 = s.index('  ];', a0) + 4
s = s[:a0] + """  const CASTLE = [
    { w: 'narr', en: 'Two towers burn again. The thread of light between them shows the way home, and the white towers of Castle Aurelia rise above the trees.', vi: 'Hai tháp đã cháy sáng trở lại. Sợi ánh sáng nối chúng soi đường về nhà, và những tòa tháp trắng của Lâu đài Aurelia hiện lên trên ngọn cây.' },
    { w: 'narr', en: 'The gates fly open. The bells ring for the first time since the night the moon turned black. The whole kingdom pours into the courtyard.', vi: 'Cổng thành bật mở. Chuông ngân lên lần đầu tiên kể từ đêm mặt trăng hóa đen. Cả vương quốc đổ ra sân lâu đài.' },
    { w: 'crowd', cheer: 1, en: 'The princess is alive! LONG LIVE LYRA! LONG LIVE THE LANTERNBEARER!', vi: 'Công chúa còn sống! CÔNG CHÚA LYRA MUÔN NĂM! NGƯỜI GIỮ ĐÈN MUÔN NĂM!' },
    { w: 'king', en: 'Lyra! My little songbird! ...I thought the shadow had taken you from me forever.', vi: 'Lyra! Chim non bé bỏng của cha! ...Cha tưởng bóng tối đã cướp con khỏi cha mãi mãi.' },
    { w: 'lyra', en: 'Father, the new Lanternbearer saved me. We have already lit two towers together!', vi: 'Cha ơi, Người Giữ Đèn mới đã cứu con. Chúng con đã cùng nhau thắp lại hai tháp rồi!' },
    { w: 'king', en: 'A hundred years ago I said goodbye to a Lanternbearer in this very courtyard. His name was Quoc... and he never came back.', vi: 'Trăm năm trước, ta đã tiễn một Người Giữ Đèn ngay trên sân này. Cậu ấy tên Quốc... và cậu ấy không bao giờ trở về.' },
    { w: 'king', en: 'Eight towers are still dark: in the crystal caverns, the desert, the frozen peaks, the volcano, the swamp, the deep sea, the tunnels and the Shadow Citadel. Will you go on?', vi: 'Còn tám tháp vẫn tối: trong hang pha lê, sa mạc, đỉnh băng, núi lửa, đầm lầy, biển sâu, đường hầm và Thành Trì Bóng Tối. Cháu có chịu đi tiếp không?' },
    { w: 'ember', en: '...I will. And I will find out what happened to him.', vi: '...Cháu sẽ đi. Và cháu sẽ tìm hiểu chuyện gì đã xảy ra với anh ấy.' },
    { w: 'crowd', cheer: 1, en: 'LANTERNBEARER! LANTERNBEARER! LANTERNBEARER!', vi: 'NGƯỜI GIỮ ĐÈN! NGƯỜI GIỮ ĐÈN! NGƯỜI GIỮ ĐÈN!' },
    { w: 'king', en: 'Then take this. My family has guarded it for a thousand years, waiting for a hero brave enough to ask for nothing in return.', vi: 'Vậy hãy nhận lấy. Gia tộc ta đã canh giữ nó suốt một ngàn năm, chờ một người anh hùng đủ dũng cảm để không đòi hỏi gì.' }
  ];
""" + s[a1:]
rep("""    { w: 'ember', en: 'Well... I should get going. The next fragment will not find itself.', vi: 'Thôi... mình nên đi đây. Mảnh vỡ tiếp theo sẽ không tự tìm đến đâu.' },""",
    """    { w: 'ember', en: 'Well... I should get going. The next tower will not light itself.', vi: 'Thôi... mình nên đi đây. Tháp tiếp theo sẽ không tự sáng đâu.' },""")
rep("""    { w: 'ember', en: '...No. No time. Fragments to find. (He rubs his cheek, and tries very hard not to smile.)', vi: '...Không. Không có thời gian. Còn mảnh vỡ phải tìm. (Cậu xoa má, và cố hết sức để không mỉm cười.)' }""",
    """    { w: 'ember', en: '...No. No time. Towers to light. (Rubbing a cheek, and trying very hard not to smile.)', vi: '...Không. Không có thời gian. Còn tháp phải thắp. (Xoa má, và cố hết sức để không mỉm cười.)' }""")
rep("""    { w: 'narr', en: '(Lyra stands on tiptoe, and quickly kisses Ember on the cheek.)', vi: '(Lyra kiễng chân lên, và nhanh chóng hôn lên má Ember.)' },""",
    """    { w: 'narr', en: '(Lyra stands on tiptoe, and quickly kisses the Lanternbearer on the cheek.)', vi: '(Lyra kiễng chân lên, và nhanh chóng hôn lên má Người Giữ Đèn.)' },""")
# the castle scene names the player's hero
rep("""  function startCastle() { castle = {""", """  function startCastle() { CS.ember.n = (HERO[myHero()] || HERO.ember).name; castle = {""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
