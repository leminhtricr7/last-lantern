# The new story (ten Lantern Towers, Quoc the fallen Lanternbearer): a new 60 s opening film that runs straight into a map-1
# dialogue, and the map-1 story (pages, mid beat, Lila, Pip, the Slime King, Shorty's trial, Lyra's rescue).
# Uses tools/opening_new.js (captions + timing) and tools/opening_draw.js (the picture).
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- splice the film ----------
head = io.open('tools/opening_new.js', encoding='utf-8').read()
draw = io.open('tools/opening_draw.js', encoding='utf-8').read()
a0 = s.index('  // ===================== OPENING CINEMATIC (about one minute)')
a1 = s.index('  function openArt() {')
b0 = s.index('  function drawOpening() {')
b1 = s.index('  // ===================== FILMS: the 60 s intro and the 60 s outro')
s = s[:a0] + head + s[a1:b0] + draw + s[b1:]

# ---------- the map-1 dialogue right after the film ----------
rep("""  function updatePlay(dt) {""", """  function updatePlay(dt) {
    if (opIntro && Q && Q.li === 0 && Q.state === 'play' && !coop) { opIntro = false; startScripted('narr', MAP1_OPEN, null); }""")
# solo: the hero's own lines are spoken by the hero the player picked
rep("""    if (coop && coop.role === 'host') { lines = teamLines(lines, who); if (who === 'ember' && lines[0]) who = lines[0].w; }""",
    """    if (coop && coop.role === 'host') { lines = teamLines(lines, who); if (who === 'ember' && lines[0]) who = lines[0].w; }
    else if (!coop && myHero() !== 'ember') { const me = 'h_' + myHero(); lines = lines.map(l => l.w === 'ember' ? Object.assign({}, l, { w: me }) : l); if (who === 'ember') who = me; }""")

# ---------- the prologue pages (Story from the title menu) ----------
a0 = s.index('  const STORY = [')
a1 = s.index('  ];', a0) + 4
s = s[:a0] + """  const STORY = [
    { en: 'Long ago, the world had no Sun. The light of Aurelia came from ten Lantern Towers, joined across the sky by a river of light.', vi: 'Ngày xưa, thế giới không có Mặt Trời. Ánh sáng của Aurelia đến từ mười Tháp Đèn, nối với nhau trên trời bằng một dòng sông ánh sáng.' },
    { en: 'Every hundred years the towers grow tired, and a Lanternbearer carries the Last Lantern from tower to tower to light them again.', vi: 'Cứ trăm năm, các tháp lại mỏi mệt, và một Người Giữ Đèn mang Đèn Cuối Cùng đi từ tháp này sang tháp khác để thắp chúng lại.' },
    { en: 'A hundred years ago, the Lanternbearer was a young man named Quoc. He lit nine towers. At the tenth, the dark swallowed him.', vi: 'Trăm năm trước, Người Giữ Đèn là một chàng trai tên Quốc. Anh thắp được chín tháp. Đến tháp thứ mười, bóng tối nuốt chửng anh.' },
    { en: 'He came back as the King of the Eclipse. On the night of the hundred-year festival he turned the moon black, and every tower went out.', vi: 'Anh trở lại thành Vua Nhật Thực. Vào đêm lễ hội trăm năm, anh biến mặt trăng thành màu đen, và mọi tháp đèn đều tắt.' },
    { en: 'His servant Shorty Phong carried off Princess Lyra, whose song is the only voice that can relight a tower.', vi: 'Tay sai của anh, Shorty Phong, bắt đi Công chúa Lyra, người có giọng hát duy nhất thắp lại được Tháp Đèn.' },
    { en: 'Then the old lantern fell from its stone, rolled through the dark square, and stopped at the feet of an ordinary child. And it lit itself.', vi: 'Rồi cây đèn cổ rơi khỏi bệ đá, lăn qua quảng trường tối om và dừng lại dưới chân một đứa trẻ bình thường. Và nó tự bừng sáng.' },
    { en: 'You are the new Lanternbearer. Free Lyra. Relight the ten towers. And find out what happened to the one who came before you.', vi: 'Bạn là Người Giữ Đèn mới. Hãy giải cứu Lyra. Thắp lại mười Tháp Đèn. Và tìm hiểu chuyện gì đã xảy ra với người đi trước bạn.' }
  ];
""" + s[a1:]

# ---------- map 1: the pages (when the film is skipped), the opening dialogue and the mid beat ----------
a0 = s.index('    0: [\n      { en: \'VERDANT MEADOW.')
a1 = s.index('    ],\n    1: [', a0) + 7
s = s[:a0] + """    0: [
      { en: 'VERDANT MEADOW. Morning should have come by now. It does not. The sky stays black, and the First Tower stands cold at the far end of the meadow.', vi: 'ĐỒNG CỎ XANH. Lẽ ra trời đã sáng. Nhưng không. Bầu trời vẫn đen kịt, và Tháp Đèn Thứ Nhất đứng lạnh tanh ở cuối đồng cỏ.' },
      { en: 'The village hides behind closed doors. Only the child with the old lantern walks out into the dark grass.', vi: 'Cả làng trốn sau những cánh cửa đóng chặt. Chỉ có đứa trẻ cầm cây đèn cổ bước ra bãi cỏ tối.' },
      { en: 'Somewhere ahead, Shorty Phong carried Princess Lyra away in an iron cage. Her song still drifts over the hills.', vi: 'Đâu đó phía trước, Shorty Phong đã chở Công chúa Lyra đi trong một chiếc lồng sắt. Tiếng hát của cô vẫn vọng qua những ngọn đồi.' },
      { en: 'Above the meadow, Ignarok the Ashwing circles. Quoc has promised him a throne of ash for the last flame in Aurelia.', vi: 'Trên đồng cỏ, Ignarok Cánh Tro lượn vòng. Quốc đã hứa ban cho nó một ngai vàng bằng tro nếu nó dập được ngọn lửa cuối cùng của Aurelia.' },
      { en: 'Free Lyra. Relight the First Tower. Your journey as the Lanternbearer begins now.', vi: 'Hãy giải cứu Lyra. Thắp lại Tháp Đèn Thứ Nhất. Hành trình Người Giữ Đèn của bạn bắt đầu từ đây.' }
    ],
""" + s[a1:]
rep("""  const MID_STORY = {
    0: [{ w: 'ember', en: 'These slimes are acting strange... like something is pulling their strings.', vi: 'Lũ slime này lạ quá... như có ai đó đang giật dây chúng.' },
        { w: 'narr', en: 'Far away, a girl\\'s song drifts over the hills. Ember walks a little faster.', vi: 'Ở nơi xa, tiếng hát của một cô gái vọng qua những ngọn đồi. Ember bước nhanh hơn một chút.' }],""",
    """  const MAP1_OPEN = [   // plays as map 1 begins, right after the opening film
    { w: 'narr', en: 'VERDANT MEADOW. Morning should have come by now. It does not. The sky stays black, and the First Tower stands cold at the far end of the meadow.', vi: 'ĐỒNG CỎ XANH. Lẽ ra trời đã sáng. Nhưng không. Bầu trời vẫn đen kịt, và Tháp Đèn Thứ Nhất đứng lạnh tanh ở cuối đồng cỏ.' },
    { w: 'ember', en: 'The lantern is warm... like it is breathing.', vi: 'Cây đèn ấm quá... như nó đang thở vậy.' },
    { w: 'lila', en: 'Wait! You are really going alone? Everyone in the village is hiding behind their doors.', vi: 'Đợi đã! Bạn đi một mình thật à? Cả làng đang trốn sau cửa hết rồi.' },
    { w: 'lila', en: 'I saw it: Shorty Phong, the little man in the tall hat, carried Lyra across the meadow in an iron cage.', vi: 'Mình thấy tận mắt: Shorty Phong, gã thấp bé đội mũ cao, chở Lyra qua đồng cỏ trong một chiếc lồng sắt.' },
    { w: 'ember', en: 'Then I will bring her back. And light the tower too.', vi: 'Vậy mình sẽ đưa cô ấy về. Và thắp lại ngọn tháp nữa.' },
    { w: 'lila', en: 'Take my grandpa\\'s old sword. A lantern alone cannot fight slimes. Press J to swing!', vi: 'Cầm thanh kiếm cũ của ông mình đi. Chỉ có cây đèn thì không đánh nổi slime đâu. Nhấn J để chém!' },
    { w: 'narr', en: 'Far away, a thin song drifts over the hills. Lyra is still singing. The Lanternbearer\\'s journey begins.', vi: 'Từ xa, một tiếng hát mỏng manh vọng qua những ngọn đồi. Lyra vẫn đang hát. Hành trình của Người Giữ Đèn bắt đầu.' }
  ];
  const MID_STORY = {
    0: [{ w: 'ember', en: 'The slimes keep backing away from the lantern... they are afraid of it.', vi: 'Lũ slime cứ lùi lại khi thấy cây đèn... chúng sợ nó.' },
        { w: 'narr', en: 'Lyra\\'s song grows clearer. On the hill ahead, the cold shape of the First Tower grows taller with every step.', vi: 'Tiếng hát của Lyra rõ dần. Trên ngọn đồi phía trước, bóng lạnh lẽo của Tháp Đèn Thứ Nhất cao dần theo từng bước chân.' }],""")

# ---------- Lila and Pip on map 1 ----------
rep("""      { en: 'Ember! The Sun fell silent three nights ago. Every lantern in the village went out.', vi: 'Ember! Mặt Trời đã tắt lịm ba đêm trước. Mọi chiếc đèn trong làng đều vụt tắt.' },
      { en: 'Yours is the last flame in Aurelia. Follow the road east - the fragments fell that way.', vi: 'Đèn của bạn là ngọn lửa cuối cùng ở Aurelia. Hãy đi về phía đông - các mảnh mặt trời rơi hướng đó.' },""",
    """      { en: 'Every tower went out at once last night. Yours is the only flame left in Aurelia.', vi: 'Đêm qua mọi Tháp Đèn tắt cùng một lúc. Đèn của bạn là ngọn lửa duy nhất còn lại ở Aurelia.' },
      { en: 'The First Tower is at the far end of the meadow. Follow the road east - Lyra went that way too.', vi: 'Tháp Đèn Thứ Nhất ở cuối đồng cỏ. Cứ đi về phía đông - Lyra cũng bị đưa đi hướng đó.' },""")
rep("""      { en: 'Keys, torches, rune plates... I will help where I can. Good luck, Ember!', vi: 'Chìa khóa, đuốc, bàn đá ký hiệu... tớ sẽ giúp khi có thể. Chúc may mắn, Ember!' }""",
    """      { en: 'Keys, torches, rune plates... I will help where I can. Good luck, Lanternbearer!', vi: 'Chìa khóa, đuốc, bàn đá ký hiệu... tớ sẽ giúp khi có thể. Chúc may mắn, Người Giữ Đèn!' }""")
rep("""  NPCS.lila.generic = [{ en: 'Be safe, Ember.', vi: 'Giữ gìn nhé, Ember.' }];""", """  NPCS.lila.generic = [{ en: 'Be safe out there. Bring Lyra home.', vi: 'Giữ gìn nhé. Đưa Lyra về nhà nha.' }];""")

# ---------- the Slime King guards the First Tower ----------
rep("""        { en: 'BLORP! You squashed my children! I am the KING of this meadow!', vi: 'BLORP! Ngươi dám đè bẹp con của ta! Ta là VUA của đồng cỏ này!' },
        { w: 'ember', en: 'Give back the fragment of the Sun. It does not belong to you.', vi: 'Trả mảnh Mặt Trời lại đây. Nó không thuộc về ngươi.' },
        { en: 'This shiny thing? It tastes like sunshine. MINE! BLOOORP!', vi: 'Cái thứ lấp lánh này à? Nó có vị như nắng. CỦA TA! BLOOORP!' }""",
    """        { en: 'BLORP! You squashed my children! I am the KING of this meadow, and this TOWER is my bed!', vi: 'BLORP! Ngươi dám đè bẹp con của ta! Ta là VUA của đồng cỏ này, và cái THÁP này là giường của ta!' },
        { w: 'ember', en: 'Get off the tower. Its flame belongs to everyone.', vi: 'Tránh khỏi ngọn tháp. Ngọn lửa của nó là của mọi người.' },
        { en: 'The dark is so cozy! Quoc said I can sleep on the cold flame forever. BLOOORP!', vi: 'Bóng tối êm ái lắm! Quốc nói ta được ngủ trên ngọn lửa lạnh mãi mãi. BLOOORP!' }""")
rep("""        { en: 'Blorp... so... warm...', vi: 'Blorp... ấm... quá...' },
        { w: 'narr', en: 'The first fragment glows in Ember\\'s hands.""", """        { en: 'Blorp... the light... so... warm...', vi: 'Blorp... ánh sáng... ấm... quá...' },
        { w: 'narr', en: 'The first fragment glows in Ember\\'s hands.""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
