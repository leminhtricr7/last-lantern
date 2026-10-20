# P0 narrative: the whole game now tells one story (the ten Lantern Towers, Quoc the fallen Lanternbearer).
# Rewrites the old "seven fragments of the Sun" text in maps 4-10, the ending, Quoc's scenes after each map, the co-op
# story, the HUD label, a relic and the film captions; Quoc is cold and tragic now (his servants keep the jokes).
import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()

def js(t):
    return t.replace('\\', '\\\\').replace("'", "\\'")
def obj(en, vi, w=None, extra=''):
    return '{ ' + ("w: '%s', " % w if w else '') + extra + "en: '" + js(en) + "', vi: '" + js(vi) + "' }"
def L2(w, en, vi):
    return "L2('%s', '%s', '%s')" % (w, js(en), js(vi))

def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:100]
    s = s.replace(a, b)

def line_obj(anchor, new):
    """replace the dialogue object { ... en: ... vi: '...' } that contains anchor"""
    global s
    assert s.count(anchor) == 1, 'ANCHOR %d: ' % s.count(anchor) + anchor[:100]
    i = s.index(anchor)
    a = s.rindex('{', 0, i)
    v = s.index("vi: '", i)
    j = v + 5
    while True:
        if s[j] == '\\': j += 2; continue
        if s[j] == "'": break
        j += 1
    e = s.index('}', j) + 1
    s = s[:a] + new + s[e:]

def line_l2(anchor, new):
    global s
    assert s.count(anchor) == 1, 'L2 ANCHOR %d: ' % s.count(anchor) + anchor[:100]
    i = s.index(anchor); a = s.rindex('L2(', 0, i)
    # the call ends after its third quoted argument
    j = a; q = 0
    while q < 6:
        if s[j] == '\\': j += 2; continue
        if s[j] == "'": q += 1
        j += 1
    e = s.index(')', j) + 1
    s = s[:a] + new + s[e:]

def block(start, end_marker, new):
    """replace from start (inclusive) to the first end_marker after it (inclusive)"""
    global s
    assert s.count(start) == 1, 'BLOCK %d: ' % s.count(start) + start[:80]
    a = s.index(start); e = s.index(end_marker, a) + len(end_marker)
    s = s[:a] + new + s[e:]

# ---------------- MAP_STORY for maps 4-10 (desert, frost, volcano, citadel) ----------------
ms = lambda en, vi: '      ' + obj(en, vi)
block("    3: [\n      { en: 'SUNSCORCH DESERT.", "    ]\n  };\n  const ENDING", "\n".join([
    "    3: [",
    ms('SUNSCORCH DESERT. The sand burns like coal, though no sun has ever shone on it. Somewhere under a pyramid, the Fourth Tower lies buried.',
       'SA MẠC CHÁY NẮNG. Cát ở đây nóng như than, dù chưa từng có mặt trời nào chiếu xuống. Đâu đó dưới một kim tự tháp, Tháp Đèn Thứ Tư bị chôn vùi.') + ',',
    ms('The Sand Pharaoh swore loyalty to Quoc for a promise of endless sleep. Walk lightly, Lanternbearer.',
       'Pharaoh Cát đã thề trung thành với Quốc để đổi lấy lời hứa về một giấc ngủ vĩnh cửu. Bước nhẹ thôi, Người Giữ Đèn.'),
    "    ],", "    4: [",
    ms('FROSTBITE PEAKS. Snow falls upward here, as if the sky itself is trying to escape. Your lantern burns blue at the edges.',
       'ĐỈNH BĂNG GIÁ. Tuyết rơi ngược lên trời, như thể bầu trời đang cố trốn chạy. Ngọn đèn của bạn cháy xanh ở viền.') + ',',
    ms('The Frost King wanted only to be left alone, once. Quoc whispered that light was the thing that melted his crown. The Fifth Tower is frozen on the summit.',
       'Vua Băng từng chỉ muốn được yên thân. Quốc thì thầm rằng ánh sáng chính là thứ đã làm tan vương miện của ông. Tháp Đèn Thứ Năm bị đóng băng trên đỉnh núi.'),
    "    ],", "    5: [",
    ms('EMBER VOLCANO. The heat is almost kind after the cold. Ignarok swore he would return here, and the Sixth Tower is sinking in the lava.',
       'NÚI LỬA TRO TÀN. Hơi nóng gần như dễ chịu sau giá lạnh. Ignarok đã thề sẽ trở lại nơi này, và Tháp Đèn Thứ Sáu đang chìm dần trong dung nham.') + ',',
    ms('Every tower you light rings across the sky like a bell. Quoc hears every one of them.',
       'Mỗi ngọn tháp bạn thắp lại vang lên trên trời như một hồi chuông. Quốc nghe thấy từng hồi một.'),
    "    ],", "    6: [",
    ms('SHADOW CITADEL. The last door of Aurelia. At its top stands the Tenth Tower, the one Quoc never finished lighting a hundred years ago.',
       'THÀNH TRÌ BÓNG TỐI. Cánh cửa cuối cùng của Aurelia. Trên đỉnh thành là Tháp Đèn Thứ Mười, ngọn tháp mà Quốc đã bỏ dở trăm năm trước.') + ',',
    ms('Everyone you met believes in you: Lila, Lyra, Captain Bram, even sad old QuanSadBoy. Your lantern is small. It is also all of them.',
       'Tất cả những người bạn gặp đều tin vào bạn: Lila, Lyra, Đội trưởng Bram, cả QuanSadBoy buồn bã. Đèn của bạn nhỏ thôi. Nhưng nó cũng là tất cả họ.') + ',',
    ms('Step through, Lanternbearer. Light the last tower.', 'Bước vào đi, Người Giữ Đèn. Hãy thắp sáng ngọn tháp cuối cùng.'),
    "    ]", "  };", "  const ENDING"]))

# ---------------- the ending ----------------
block("  const ENDING = [", "  ];", "\n".join(["  const ENDING = ["] + ['    ' + obj(en, vi) + ',' for en, vi in [
    ('The Shadow Citadel trembles. The old lantern burns brighter than it ever has.', 'Thành Trì Bóng Tối rung chuyển. Cây đèn cổ cháy sáng hơn bao giờ hết.'),
    ('The Eclipse screams. For a heartbeat it is no longer a hunger, only the shadow of a young man who was very tired and very alone.', 'Nhật Thực gào thét. Trong một nhịp tim, nó không còn là cơn đói, chỉ còn là cái bóng của một chàng trai từng rất mệt và rất cô đơn.'),
    ('Quoc falls to his knees. The lantern light touches his face, and for the first time in a hundred years he remembers how he used to laugh.', 'Quốc quỳ xuống. Ánh đèn chạm vào gương mặt anh, và lần đầu tiên sau trăm năm, anh nhớ ra mình từng cười như thế nào.'),
    ('"I lit nine towers on my own," he says. "At the tenth, there was no warmth left in me."', '"Ta đã thắp chín tháp một mình," anh nói. "Đến tháp thứ mười, trong ta chẳng còn chút hơi ấm nào."'),
    ('Lyra begins to sing. This time it is not one lantern: the whole team, the whole village, the whole kingdom sings with her.', 'Lyra cất tiếng hát. Lần này không chỉ có một ngọn đèn: cả đội, cả làng, cả vương quốc cùng hát theo cô.'),
    ('The Tenth Tower blazes. Ten threads of light join across the sky, and the black moon cracks open like an eggshell.', 'Tháp Đèn Thứ Mười bừng sáng. Mười sợi ánh sáng nối liền nhau trên bầu trời, và mặt trăng đen nứt ra như vỏ trứng.'),
    ('The light of ten towers pours over Aurelia. In the village, every lantern lights by itself, one after another, all the way to the sea.', 'Ánh sáng của mười ngọn tháp tràn khắp Aurelia. Trong làng, mọi chiếc đèn tự thắp sáng, cái này đến cái khác, cho tới tận biển.'),
    ('Lila runs through the square laughing. Captain Bram takes off his helmet. Princess Lyra stands on the meadow and sings, and the whole world sings with her.', 'Lila chạy qua quảng trường, cười vang. Đội trưởng Bram bỏ mũ giáp. Công chúa Lyra đứng trên đồng cỏ cất tiếng hát, và cả thế giới hát cùng cô.'),
    ('Even QuanSadBoy closes his thick book and smiles for the first time. Mr Shorty Phong, from the top of a tree, sulks that he did not win. Then, quietly, he waves.', 'Ngay cả QuanSadBoy cũng gấp cuốn sách dày lại và mỉm cười lần đầu tiên. Mr Shorty Phong, từ trên ngọn cây, hờn dỗi vì không thắng. Rồi lặng lẽ vẫy tay.'),
    ('And Quoc? He sits at the foot of the last tower, watching the light he once carried. This time, he does not have to carry it alone.', 'Còn Quốc? Anh ngồi dưới chân ngọn tháp cuối cùng, nhìn thứ ánh sáng mình từng mang. Lần này, anh không phải mang nó một mình.'),
    ('The old lantern dims softly, like a friend finally allowed to rest. In a hundred years it will choose someone again.', 'Cây đèn cổ dịu đi, nhẹ nhàng, như một người bạn cuối cùng được nghỉ ngơi. Trăm năm nữa, nó sẽ lại chọn một ai đó.'),
    ('The Lanternbearer did what no one thought possible: not only ten towers lit again, but a lost friend brought home.', 'Người Giữ Đèn đã làm điều không ai tin nổi: không chỉ thắp lại mười ngọn tháp, mà còn đưa một người lạc lối trở về nhà.')]]
    + ['    ' + obj('Thank you, Lanternbearer.', 'Cảm ơn bạn, Người Giữ Đèn.'), "  ];"]))

# ---------------- Quoc's scenes after each map: Quoc cold and sad, his servants keep the jokes ----------------
def cutblock(lines):
    out = []
    for i, (w, en, vi, sh) in enumerate(lines):
        o = obj(en, vi, w, 'shout: 1, ' if sh else '')
        out.append('      ' + o + (',' if i < len(lines) - 1 else ''))
    return out
CUT0 = [
    ('quoc', 'The First Tower burns again. ...So the lantern has chosen someone.', 'Tháp Thứ Nhất lại cháy rồi. ...Vậy là cây đèn đã chọn được người.', 0),
    ('shorty', 'M-my lord, it is only a child! A tiny one! Almost as small as me!', 'Th-thưa thầy, chỉ là một đứa nhóc thôi! Nhỏ xíu! Gần bằng con luôn!', 0),
    ('quoc', 'I was a child too, when it chose me. Go. Put out that flame before it learns what it costs.', 'Ta cũng chỉ là một đứa trẻ khi nó chọn ta. Đi đi. Dập ngọn lửa ấy trước khi nó biết cái giá phải trả.', 0)]
CUT1 = [
    ('imp', 'Master... the child fights with a glowing... LEEK.', 'Thưa chủ nhân... đứa nhóc đánh nhau bằng một cây... HÀNH phát sáng.', 0),
    ('shorty', 'And the princess sings for it! The Second Tower woke right up!', 'Còn công chúa thì hát cho nó! Tháp Thứ Hai tỉnh dậy luôn!', 0),
    ('quoc', 'A princess who sings to towers... I knew one like that, once. Keep her away from the tenth tower.', 'Một nàng công chúa hát cho tháp nghe... Ta từng quen một người như thế. Đừng để cô ấy tới được tháp thứ mười.', 0)]
CUT2 = [
    ('sy', 'The crystals showed the child your memory, my lord. I watched. I took notes.', 'Pha lê đã cho đứa nhóc xem ký ức của ngài, thưa chủ nhân. Thần đứng xem. Thần có ghi chép.', 0),
    ('quoc', 'Then it knows the price. Good. Let us see if it still wants to pay.', 'Vậy là nó biết cái giá rồi. Tốt. Để xem nó còn muốn trả nữa không.', 0),
    ('shorty', 'And a sad bookworm keeps giving it snacks, my lord!', 'Còn có một gã mọt sách buồn bã cứ cho nó đồ ăn vặt nữa, thưa thầy!', 0),
    ('quoc', '...Snacks. Nobody brought me snacks.', '...Đồ ăn vặt. Hồi đó chẳng ai mang đồ ăn vặt cho ta cả.', 0)]
CUT3 = [
    ('shorty', 'Master, I tried my little trial again. The child... passed.', 'Thưa thầy, con lại bày thử thách nhỏ của con. Đứa nhóc... lại qua được.', 0),
    ('quoc', 'Again.', 'Lại nữa.', 0),
    ('shorty', '...I am very short, my lord. It is hard to see it coming.', '...Con thấp lắm, thưa thầy. Khó mà thấy nó tới.', 0),
    ('sy', 'Allow me, my lord. I will meet the child in the Citadel with something... more dramatic.', 'Để thần, thưa chủ nhân. Thần sẽ đón đứa nhóc ở Thành Trì bằng một thứ... kịch tính hơn.', 0),
    ('quoc', 'Do what you must. Four towers burn now. I can feel each one, like a fever.', 'Cứ làm điều ngươi phải làm. Bốn tháp đã cháy. Ta cảm thấy từng ngọn, như một cơn sốt.', 0)]
CUT4 = [
    ('sy', 'The Frost King melted, my lord. He... smiled at the child, before he turned into rain.', 'Vua Băng tan chảy rồi, thưa chủ nhân. Ông ta... mỉm cười với đứa nhóc, trước khi hóa thành mưa.', 0),
    ('quoc', 'He smiled at me too, once. Then the cold came back.', 'Ông ấy cũng từng mỉm cười với ta. Rồi cái lạnh quay lại.', 0),
    ('shorty', 'Five towers, master... half the sky is glowing again...', 'Năm tháp rồi, thưa thầy... nửa bầu trời lại sáng rồi...', 0),
    ('quoc', 'Wake the Titan. Let the mountain show the child how heavy a flame can be.', 'Đánh thức Titan. Để ngọn núi cho đứa nhóc thấy một ngọn lửa có thể nặng đến thế nào.', 1)]
CUT5 = [   # becomes CUT[9]: after the tunnels, right before the Citadel
    ('quoc', 'Nine towers. Exactly as many as I lit.', 'Chín tháp. Đúng bằng số tháp ta từng thắp.', 0),
    ('shorty', 'Master... the child is coming to the Citadel. To the tenth tower.', 'Thưa thầy... đứa nhóc đang tới Thành Trì. Tới tháp thứ mười.', 0),
    ('quoc', 'Then it will learn what I learned there.', 'Vậy thì nó sẽ học được điều ta đã học ở đó.', 0),
    ('sy', 'My lord, Shorty and I will hold the gates. My serpent is hungry... and so is his hat.', 'Thưa chủ nhân, thần và Shorty sẽ giữ cổng. Con rắn của thần đang đói... và cái mũ của hắn cũng vậy.', 0),
    ('quoc', 'Go, both of you. And if the lantern still reaches me... I will show it every face this darkness gave me.', 'Đi đi, cả hai. Và nếu cây đèn vẫn tới được chỗ ta... ta sẽ cho nó xem mọi gương mặt mà bóng tối này đã cho ta.', 0),
    ('quoc', 'LET THE WORLD SLEEP!!!', 'HÃY ĐỂ THẾ GIỚI NGỦ YÊN!!!', 1)]
new_cut = ["  const CUT = ["]
for k, (name, lines) in enumerate([('after Verdant Meadow', CUT0), ('after Whispering Forest', CUT1), ('after Crystal Caverns', CUT2), ('after Sunscorch Desert', CUT3), ('after Frostbite Peaks', CUT4), ('before the Citadel (shown after the tunnels)', CUT5)]):
    new_cut.append('    [ // ' + name)
    new_cut += cutblock(lines)
    new_cut.append('    ]' + (',' if k < 5 else ''))
new_cut.append('  ];')
block("  const CUT = [", "\n  ];", "\n".join(new_cut))
for idx, lines in [(5, [('quoc', 'The Titan is ash. Six towers.', 'Titan thành tro rồi. Sáu tháp.', 0),
                        ('shorty', 'Master, the lantern now walks toward the Glowcap Swamp...', 'Thưa thầy, cây đèn đang đi về phía Đầm Lầy Nấm...', 0),
                        ('quoc', 'Good. The Spore Queen will fill its little lungs with sleep.', 'Tốt. Nữ Hoàng Bào Tử sẽ lấp đầy hai lá phổi nhỏ của nó bằng giấc ngủ.', 0)]),
                   (7, [('shorty', 'The Spore Queen... is compost now, master.', 'Nữ Hoàng Bào Tử... thành phân bón rồi, thưa thầy.', 0),
                        ('sy', 'My lord, the road goes under the sea now. No flame survives the deep.', 'Thưa chủ nhân, con đường giờ đi xuống dưới biển. Không ngọn lửa nào sống sót dưới đáy sâu.', 0),
                        ('quoc', 'Mine did. That was the worst part. ...Wake the Kraken.', 'Ngọn lửa của ta đã sống sót. Đó mới là phần tệ nhất. ...Đánh thức Kraken.', 0)]),
                   (8, [('shorty', 'It swims, master! And it tickled the Kraken. He looked happy.', 'Nó biết bơi, thưa thầy! Còn cù lét con Kraken nữa. Trông nó vui lắm.', 0),
                        ('quoc', 'Happy. Nobody is supposed to be happy down there. Gravemaw... swallow the road.', 'Vui. Dưới đó lẽ ra không ai được vui cả. Gravemaw... nuốt chửng con đường đi.', 1)])]:
    block("  CUT[%d] = [" % idx, "\n  ];", "\n".join(["  CUT[%d] = [" % idx] + ['  ' + l for l in cutblock(lines)] + ["  ];"]))

# ---------------- before and after the last fight ----------------
block("  const QUOC_PRE = [", "  ];", "\n".join(["  const QUOC_PRE = [",
    '    ' + obj('So... the little flame has walked into my house. Nine towers. You lit every one I ever lit.', 'Vậy là... ngọn lửa nhỏ đã vào tới nhà ta. Chín tháp. Ngươi đã thắp lại từng ngọn tháp ta từng thắp.') + ',',
    '    ' + obj('And the tenth one. The one you left dark, Quoc.', 'Còn tháp thứ mười. Ngọn tháp anh đã bỏ dở, Quốc.', 'ember') + ',',
    '    ' + obj('LEFT DARK?! I GAVE IT ALL THE WARMTH I HAD! COME, LANTERNBEARER... SEE WHAT IT MADE OF ME!', 'BỎ DỞ?! TA ĐÃ CHO NÓ TẤT CẢ HƠI ẤM CỦA TA! LẠI ĐÂY, NGƯỜI GIỮ ĐÈN... XEM NÓ ĐÃ BIẾN TA THÀNH GÌ!'),
    "  ];"]))
line_obj("en: 'Impossible... a little flame... and a handful of... friends...'", obj('Impossible... a little flame... and a handful of... friends...', 'Không thể nào... một ngọn lửa nhỏ... và một nhóm... bạn bè...', 'quoc'))
line_obj("en: 'The Sun... it burns... so bright...'", obj('The light... it is warm... I forgot how warm it was...', 'Ánh sáng... ấm quá... ta đã quên mất nó ấm đến thế nào...', 'quoc'))
line_obj("en: 'It always did, Quoc. You were just standing in front of it.'", obj('You do not have to carry it alone any more, Quoc.', 'Anh không phải mang nó một mình nữa, Quốc.', 'ember'))
line_obj("en: 'The Eclipse cracks like old glass. The seventh fragment falls", obj('The Eclipse cracks like old glass. Inside there is only a tired young man, and his old lantern, still flickering.', 'Nhật Thực nứt vỡ như tấm kính cũ. Bên trong chỉ còn một chàng trai mệt mỏi, và cây đèn cũ của anh vẫn còn le lói.', 'narr'))
# Quoc's battle cries
for k, en, vi in [(1, 'YOU CUT MY HUMAN FACE?! THEN MEET WHAT THE TENTH TOWER MADE OF ME... THE DARK IMP!', 'NGƯƠI CHÉM ĐƯỢC GƯƠNG MẶT NGƯỜI CỦA TA?! VẬY HÃY GẶP THỨ MÀ THÁP THỨ MƯỜI ĐÃ BIẾN TA THÀNH... TIỂU QUỶ BÓNG TỐI!'),
                  (2, 'TOO SLOW! THE DARK HUNTED ME LIKE A HOUND... NOW I AM THE HOUND!', 'CHẬM QUÁ! BÓNG TỐI TỪNG SĂN TA NHƯ SĂN THÚ... GIỜ TA LÀ CON CHÓ SĂN!'),
                  (4, 'ENOUGH!! I STOOD GUARD OVER THE DARK FOR A HUNDRED YEARS... IRON GENERAL!', 'ĐỦ RỒI!! TA ĐÃ CANH GIỮ BÓNG TỐI SUỐT TRĂM NĂM... ĐẠI TƯỚNG GIÁP SẮT!'),
                  (5, 'I FLEW TO EVERY TOWER ON MY OWN... ON WINGS LIKE THESE!', 'TA ĐÃ TỰ MÌNH BAY TỚI TỪNG NGỌN THÁP... BẰNG ĐÔI CÁNH NHƯ THẾ NÀY!'),
                  (6, 'I AM THE ASH OF EVERY FLAME I GAVE AWAY! KNEEL!', 'TA LÀ TRO TÀN CỦA MỌI NGỌN LỬA TA ĐÃ CHO ĐI! QUỲ XUỐNG!'),
                  (7, 'I AM THE ECLIPSE! LET THE WORLD SLEEP... FOREVER!!!', 'TA LÀ NHẬT THỰC! HÃY ĐỂ THẾ GIỚI NGỦ YÊN... MÃI MÃI!!!')]:
    a = s.index('      %d: [{ en: ' % k, s.index('  const FORM_LINES = {'))
    e = s.index('}]', a) + 2   # the last form has no comma after it
    s = s[:a] + '      %d: [' % k + obj(en, vi) + ']' + s[e:]
# Shorty and Sy in the Citadel
line_obj("en: 'Well, well. You made it all the way to the Citadel, little lantern-boy.", obj('Well, well. You made it all the way to the Citadel, little lantern. I am done playing with trials.', 'Chà chà. Nhóc đến được tận Thành Trì rồi đấy, đèn nhỏ. Ta chán mấy trò thử thách rồi.'))
line_obj("en: '...Go on, lantern-boy. Sy waits ahead.", obj('...Go on, little lantern. Sy waits ahead. He is not as kind as I was. Tee-hee... hee...', '...Đi đi, đèn nhỏ. Sy đang đợi phía trước. Hắn không tử tế như ta đâu. Hí hí... hí...'))
line_obj("en: '(Shorty dissolves into a shower of top hats.", obj('(Shorty dissolves into a shower of top hats. For a moment the Lanternbearer almost feels sorry for him.)', '(Shorty tan thành một cơn mưa mũ chóp cao. Trong một thoáng, Người Giữ Đèn gần như thấy tội cho hắn.)', 'ember'))
line_obj("en: 'Listen, boy. Quoc is not one monster. He is seven.", obj('Listen, little lantern. Quoc is not one monster any more. The dark gave him many faces. Do not let your light flicker.', 'Nghe này, đèn nhỏ. Quốc không còn là một con quái nữa. Bóng tối đã cho hắn rất nhiều gương mặt. Đừng để ánh sáng của nhóc chao đảo.'))
line_obj("en: '(Sy fades into green mist.", obj('(Sy fades into green mist. The Citadel gate groans open. Only Quoc remains, and the Tenth Tower above him.)', '(Sy tan vào màn sương xanh. Cổng Thành Trì rên rỉ mở ra. Chỉ còn Quốc, và Tháp Đèn Thứ Mười phía trên hắn.)', 'ember'))
# the allies arrive
line_obj("en: 'THREE FACES, AND YOU STILL STAND?!", obj('THREE FACES, AND YOU STILL STAND?! THEN I WILL DROWN YOU IN SHADOW, LANTERNBEARER!', 'BA KHUÔN MẶT MÀ NGƯƠI VẪN ĐỨNG ĐƯỢC SAO?! VẬY TA SẼ NHẤN CHÌM NGƯƠI TRONG BÓNG TỐI, NGƯỜI GIỮ ĐÈN!', 'quoc'))
line_obj("en: 'EMBER!! Hold on! I read it in the Great Book of Embers", obj('HOLD ON!! I read it in the Great Book of Lanterns: a Lanternbearer never fights alone!', 'CỐ LÊN!! Mình đã đọc trong Đại Thư Đèn Lồng: Người Giữ Đèn không bao giờ chiến đấu một mình!', 'quan'))
line_obj("en: 'And Duong Dracular could not miss such a splendid night.", obj('And Duong Dracular could not miss such a splendid night. The towers burn again, and a vampire can finally see the stars. I owe you my evenings.', 'Và Duong Dracular sao có thể bỏ lỡ một đêm tuyệt vời thế này. Các tháp đã cháy lại, và một ma cà rồng cuối cùng cũng được ngắm sao. Ta nợ bạn những buổi tối.', 'duong'))
line_obj("en: 'Because we each heard the same news: a boy with a lantern", obj('Because we each heard the same news: a child with a lantern is going to light the tenth tower. And we each decided, on our own, that you are not doing it alone.', 'Vì ai trong chúng mình cũng nghe cùng một tin: có một đứa trẻ cầm đèn sắp thắp ngọn tháp thứ mười. Và mỗi người đều tự quyết định rằng bạn sẽ không làm điều đó một mình.', 'quan'))

# ---------------- bosses of maps 4-10 ----------------
line_obj("en: 'KNEEL, child of the Sun!", obj('KNEEL, little lamplighter! In my desert, even light lies down to sleep!', 'QUỲ XUỐNG, kẻ thắp đèn bé nhỏ! Trên sa mạc của ta, ngay cả ánh sáng cũng phải nằm xuống ngủ!'))
line_obj("en: 'The Sun does not bow. It rises.'", obj('Light does not sleep. It waits.', 'Ánh sáng không ngủ. Nó chờ.', 'ember'))
line_obj("en: 'The sandstorm dies. Under the stars, the dunes look almost peaceful.'", obj('The sandstorm dies. Lyra sings, and the Fourth Tower rises out of the sand, burning.', 'Cơn bão cát lặng đi. Lyra cất tiếng hát, và Tháp Đèn Thứ Tư trồi lên khỏi cát, rực cháy.', 'narr'))
line_obj("en: 'For the first time in a hundred years, the Frost King smiles.", obj('For the first time in a hundred years, the Frost King smiles. Then he melts into a quiet spring rain, and the Fifth Tower shines through the ice.', 'Lần đầu tiên sau trăm năm, Vua Băng mỉm cười. Rồi ông tan thành một cơn mưa xuân lặng lẽ, và Tháp Đèn Thứ Năm tỏa sáng xuyên qua lớp băng.', 'narr'))
line_obj("en: 'Six fragments now. They hum together like a choir.", obj('The Sixth Tower erupts with light instead of lava. Six threads now hum across the sky like a choir.', 'Tháp Đèn Thứ Sáu phun trào ánh sáng thay cho dung nham. Sáu sợi sáng giờ ngân lên trên bầu trời như một dàn đồng ca.', 'narr'))
line_obj("en: 'The cold glow fades. For the first time in years, real fireflies return to the swamp.'", obj('The cold glow fades. Lyra sings, the Seventh Tower lights up, and real fireflies return to the swamp.', 'Ánh sáng lạnh lẽo tắt dần. Lyra cất tiếng hát, Tháp Đèn Thứ Bảy bừng sáng, và đom đóm thật quay về đầm lầy.', 'narr'))
line_obj("en: 'The Kraken lets go and sinks into the deep, almost smiling. Sunlight reaches the seabed again.'", obj('The Kraken lets go and sinks into the deep, almost smiling. Lyra sings, and the Eighth Tower shines up through the water.', 'Kraken buông ra và chìm xuống đáy sâu, gần như mỉm cười. Lyra cất tiếng hát, và Tháp Đèn Thứ Tám chiếu sáng xuyên qua làn nước.', 'narr'))
line_obj("en: 'Gravemaw burrows away for good. Above the tunnels,", obj('Gravemaw burrows away for good. The Ninth Tower blazes in the dark, and above the tunnels the black towers of the Shadow Citadel are waiting.', 'Gravemaw đào sâu xuống và không bao giờ quay lại. Tháp Đèn Thứ Chín bừng cháy trong bóng tối, và phía trên những đường hầm, các tòa tháp đen của Thành Trì Bóng Tối đang chờ.', 'narr'))
line_obj("en: 'Their light is not warm. It is the cold glow of the Spore Queen,", obj('Their light is not warm. It is the cold glow of the Spore Queen, who promised Quoc to smother the Seventh Tower in her roots.', 'Thứ ánh sáng ấy không ấm. Đó là ánh lạnh của Nữ Hoàng Bào Tử, kẻ đã hứa với Quốc sẽ bóp nghẹt Tháp Đèn Thứ Bảy trong rễ của mình.'))
line_obj("en: 'Somewhere in the dark below, something with eight arms is holding a piece of the Sun like a toy.'", obj('Somewhere in the dark below, something with eight arms is hugging the drowned Eighth Tower like a toy.', 'Đâu đó trong bóng tối bên dưới, một thứ có tám cánh tay đang ôm Tháp Đèn Thứ Tám bị nhấn chìm như ôm một món đồ chơi.'))
line_obj("en: 'The lantern still burns underwater. The Sun really does not give up.'", obj('The lantern still burns underwater. It really does not give up.', 'Đèn vẫn cháy dưới nước. Nó đúng là không chịu bỏ cuộc.', 'ember'))
line_obj("en: 'The end of the land. Beyond the cliff the sea falls away into darkness,", obj('The end of the land. Beyond the cliff the sea falls away into darkness, and somewhere far below, the Eighth Tower lies drowned.', 'Tận cùng của đất liền. Sau vách đá, biển khơi đổ xuống bóng tối, và đâu đó rất sâu bên dưới, Tháp Đèn Thứ Tám đang chìm.', 'narr'))
line_obj("en: 'The Kraken keeps the Sun fragment in the deepest cavern", obj('The Kraken guards the drowned tower in the deepest cavern and locks it with the Tide Door. The door opens only for three Sea Pearls.', 'Kraken canh giữ ngọn tháp chìm trong hang sâu nhất và khóa nó bằng Cửa Thủy Triều. Cửa chỉ mở khi có đủ ba Ngọc Trai Biển.', 'mermaid'))
line_obj("en: 'SUNKEN DEEP. The road ends at a cliff above the sea.", obj('SUNKEN DEEP. The road ends at a cliff above the sea. Far below, the Kraken sleeps wrapped around the Eighth Tower.', 'ĐẠI DƯƠNG SÂU THẲM. Con đường dừng lại ở vách đá phía trên biển. Rất sâu bên dưới, Kraken ngủ quấn quanh Tháp Đèn Thứ Tám.'))

# ---------------- people met on the way ----------------
line_obj("en: 'Halt! Captain Bram of the Dawn Guard. This forest has been cursed since the Sun broke.'", obj('Halt! Captain Bram of the Dawn Guard. This forest has been cursed since the towers went dark.', 'Dừng lại! Đội trưởng Bram của Đội Vệ Binh Bình Minh. Khu rừng này bị nguyền rủa từ khi các tháp đèn tắt.'))
line_obj("en: 'I am Seraph. I fell with the Sun,", obj('I am Seraph. I fell when the Fifth Tower went out, and I have waited in the snow for someone with a light.', 'Ta là Seraph. Ta rơi xuống khi Tháp Đèn Thứ Năm tắt, và đã chờ trong tuyết một người mang ánh sáng.'))
line_obj("en: 'The Eclipse feeds on every missing fragment.", obj('The Eclipse feeds on every dark tower. Each one you light starves it.', 'Nhật Thực ăn từng ngọn tháp tối. Mỗi tháp bạn thắp lại sẽ làm nó đói.'))
line_obj("en: 'Pip believes in you! Bring back the Sun!'", obj('Pip believes in you! Light the last tower!', 'Pip tin ở bạn! Thắp sáng ngọn tháp cuối cùng nhé!'))
line_obj("en: 'I will sing for you the whole way! La la laaa~ Go light up the Sun!", obj('I will sing for you the whole way! La la laaa~ Let us light the last tower! ♪', 'Mình sẽ hát cho bạn suốt chặng đường! La la laaa~ Đi thắp ngọn tháp cuối cùng nào! ♪'))
line_obj("en: 'Ah... the Sun has fallen, so a vampire may walk the desert at noon.", obj('Ah... the towers are dark, so a vampire may walk the desert at noon. Irony is delicious.', 'À... các tháp đèn đã tắt, nên một ma cà rồng có thể đi trên sa mạc giữa trưa. Sự trớ trêu thật ngon.'))
line_obj("en: 'You carry the Sun\\'s flame? ...I know you.", obj('You carry the Last Lantern? ...I know you. QuanSadBoy\'s letter said: "a child with a lantern; protect them." Fascinating.', 'Bạn mang Đèn Cuối Cùng sao? ...Ta biết bạn. Thư của QuanSadBoy viết: "một đứa trẻ cầm đèn; hãy bảo vệ nó." Thú vị.'))
line_obj("en: 'Silly like a song. I will sing it for you when the Sun is back.", obj('Silly like a song. I will sing it for you when all ten towers are burning. Then you can decide whether to believe it.', 'Ngốc như một bài hát. Mình sẽ hát cho bạn nghe khi cả mười tháp cùng cháy sáng. Lúc đó bạn tự quyết có tin hay không.', 'lyra', 'heart: 1, '))
line_obj("en: 'The hoofbeats fade into the dusk. Ember does not answer.", obj('The hoofbeats fade into the dusk. No answer comes. But for the first time since the moon turned black, the lantern burns a little warmer.', 'Tiếng vó ngựa xa dần trong hoàng hôn. Không ai đáp lại. Nhưng lần đầu tiên kể từ khi mặt trăng hóa đen, cây đèn cháy ấm hơn một chút.', 'narr'))

# ---------------- the co-op story ----------------
line_l2("'Long ago, the Sun hung whole above the kingdom of Lumen", L2('narr', 'Long ago, the world had no Sun. The kingdom of Aurelia lived on the light of ten Lantern Towers.', 'Ngày xưa, thế giới không có Mặt Trời. Vương quốc Aurelia sống nhờ ánh sáng của mười Tháp Đèn.'))
line_l2("'Then Quoc the Devil reached into the sky", L2('narr', 'Then Quoc, King of the Eclipse, turned the moon black, and every tower went out in a single night.', 'Rồi Quốc, Vua Nhật Thực, biến mặt trăng thành màu đen, và mọi tháp đèn tắt trong một đêm.'))
line_l2("'The lantern settled among them, warm as a heartbeat, and showed them seven roads", L2('narr', 'The lantern settled among them, warm as a heartbeat, and showed them ten roads, ten towers, and the monsters sleeping on them.', 'Chiếc đèn lồng đáp xuống giữa họ, ấm như một nhịp tim, và chỉ cho họ mười con đường, mười ngọn tháp, cùng những con quái đang ngủ trên đó.'))
line_l2("'Then let us go and take our Sun back. Together!'", L2('{plast}', 'Then let us light them again. All ten. Together!', 'Vậy thì đi thắp lại chúng thôi. Cả mười tháp. Cùng nhau!'))
line_l2("'The Verdant Meadow. The first fragment fell here", L2('narr', 'The Verdant Meadow. The First Tower stands dark here, and the slimes have been acting strange ever since.', 'Đồng Cỏ Xanh. Tháp Đèn Thứ Nhất đứng tối om ở đây, và lũ slime cứ hành động kỳ lạ từ đó.'))
line_l2("'The Endless Desert. Under the sand, an old Pharaoh guards a fragment", L2('narr', 'The Endless Desert. Under the sand, an old Pharaoh sleeps on the Fourth Tower like his last treasure.', 'Sa Mạc Bất Tận. Dưới lớp cát, một Pharaoh già ngủ trên Tháp Đèn Thứ Tư như ôm báu vật cuối cùng.'))
line_l2("'The Volcano. Ignarok the fire dragon sleeps on the sixth fragment", L2('narr', 'The Volcano. Ignarok the fire dragon sleeps beside the Sixth Tower, and the mountain breathes with him.', 'Núi Lửa. Rồng lửa Ignarok ngủ cạnh Tháp Đèn Thứ Sáu, và cả ngọn núi thở theo nó.'))
line_l2("'Six fragments. Only one left after this. Nobody stops now!'", L2('{p0}', 'Six towers. Four more after this. Nobody stops now!', 'Sáu tháp rồi. Xong chỗ này còn bốn tháp nữa. Không ai được dừng lại!'))
line_l2("'For the Sun!'", L2('{plast}', 'For the ten towers!', 'Vì mười ngọn tháp!'))
line_l2("'The seventh fragment fell into many hands at once", L2('narr', 'The Tenth Tower blazed under many hands at once, and the whole sky remembered how to shine.', 'Tháp Đèn Thứ Mười bừng sáng dưới nhiều bàn tay cùng một lúc, và cả bầu trời nhớ lại cách tỏa sáng.'))

# ---------------- names, HUD, relic, film captions ----------------
rep("quoc: { spr: 'npc_shorty', name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' } }", "quoc: { spr: 'npc_shorty', name: { en: 'Quoc, King of the Eclipse', vi: 'Quốc, Vua Nhật Thực' } }")
rep("quoc: { spr: 'npc_quoc', name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' } },", "quoc: { spr: 'npc_quoc', name: { en: 'Quoc, King of the Eclipse', vi: 'Quốc, Vua Nhật Thực' } },")
rep("const SPK = { quoc: { name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' }", "const SPK = { quoc: { name: { en: 'Quoc, King of the Eclipse', vi: 'Quốc, Vua Nhật Thực' }")
rep("shards: { en: 'Sun Shards', vi: 'Mảnh nắng' }", "shards: { en: 'Tower Embers', vi: 'Tàn Lửa Tháp' }")
rep("{ name: { en: 'Heart of the Sun', vi: 'Trái Tim Mặt Trời' }, desc: { en: 'The Sun burns again', vi: 'Mặt Trời cháy sáng trở lại' } }",
    "{ name: { en: 'Heart of the Towers', vi: 'Trái Tim Tháp Đèn' }, desc: { en: 'The towers burn again', vi: 'Các tháp đèn lại cháy sáng' } }")
rep("cnSub(sv('The Sun is shattered. Darkness swallows everything.', 'Mặt Trời vỡ tan. Bóng tối nuốt chửng mọi thứ.')", "cnSub(sv('The towers have gone dark. Darkness swallows everything.', 'Các tháp đèn đã tắt. Bóng tối nuốt chửng mọi thứ.')")
rep("cnSub(sv('The darkness breaks. The Sun returns.', 'Bóng tối tan đi. Mặt Trời đã trở lại.')", "cnSub(sv('The darkness breaks. The ten towers burn again.', 'Bóng tối tan đi. Mười ngọn tháp lại cháy sáng.')")

# ---------------- Vietnamese spelling: Quốc with its accent, one name for the hero's title ----------------
def fix_vi(m):
    t = m.group(0)
    return t.replace('Quoc', 'Quốc').replace('Người Mang Đèn', 'Người Giữ Đèn').replace('người mang đèn', 'người giữ đèn').replace('Quỷ Vương Quốc', 'Quốc')
s = re.sub(r"vi: '(?:[^'\\]|\\.)*'", fix_vi, s)
s = re.sub(r"L2\('[^']*', '(?:[^'\\]|\\.)*', '(?:[^'\\]|\\.)*'\)", lambda m: m.group(0)[:m.group(0).rindex(", '")] + fix_vi(re.match(r'.*', m.group(0)[m.group(0).rindex(", '"):])), s)
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
# (also applied: the ember pick-up message counts BIOMES.length * 3 instead of 21, and the Birdie pet's text in src/items.js)
