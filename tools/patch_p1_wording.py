# P1 wording: lines no longer assume the hero is a boy called Ember.
# {hero} in any dialogue line becomes the name of the hero the player picked; narration says "the Lanternbearer".
import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def js(t): return t.replace('\\', '\\\\').replace("'", "\\'")
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:100]
    s = s.replace(a, b)
def edit(anchor, en, vi):
    """replace the en and vi texts of the dialogue object that contains anchor (keys and flags stay)"""
    global s
    assert s.count(anchor) == 1, 'ANCHOR %d: ' % s.count(anchor) + anchor[:100]
    i = s.index(anchor); a = s.rindex('{', 0, i)
    v = s.index("vi: '", i); j = v + 5
    while True:
        if s[j] == '\\': j += 2; continue
        if s[j] == "'": break
        j += 1
    e = s.index('}', j) + 1
    o = s[a:e]
    o = re.sub(r"en: '(?:[^'\\]|\\.)*'", lambda m: "en: '" + js(en) + "'", o, count=1)
    o = re.sub(r"vi: '(?:[^'\\]|\\.)*'", lambda m: "vi: '" + js(vi) + "'", o, count=1)
    s = s[:a] + o + s[e:]

# ---- the text readers fill in {hero} ----
rep("  const LN = o => o[save.lang];", "  const LN = o => o[save.lang];\n"
    "  const HN = () => LN((HERO[myHero()] || HERO.ember).name);   // the name of the hero the player picked\n"
    "  const TX = ln => ((ln && ln[save.lang]) || '').replace(/\\{hero\\}/g, HN());   // a story line in the current language, {hero} filled in")
rep("tk.lines[tk.i][save.lang]", "TX(tk.lines[tk.i])", 2)
rep("const line = ln0[save.lang] || ''", "const line = TX(ln0)")
rep("tx = ln[save.lang]", "tx = TX(ln)", 6)
rep("txtL = ln[save.lang]", "txtL = TX(ln)")
rep("textL = ln[save.lang]", "textL = TX(ln)")
rep("storyList[storyPage][save.lang]", "TX(storyList[storyPage])")
rep("storyList[Math.min(storyPage, storyList.length - 1)][save.lang]", "TX(storyList[Math.min(storyPage, storyList.length - 1)])")
rep("tk.lines[coop.tkI][save.lang]", "TX(tk.lines[coop.tkI])")
# the ride home names the player's hero too
rep("  function startRide() { ride = {", "  function startRide() { CS.ember.n = (HERO[myHero()] || HERO.ember).name; ride = {")

# ---- lines that called the hero "Ember", "boy" or "he" ----
edit("en: 'Light does not need to be large to matter, Ember.", 'Light does not need to be large to matter, {hero}. Only unbroken.', 'Ánh sáng không cần lớn mới có ý nghĩa, {hero}. Chỉ cần không tắt.')
edit("en: 'Sing along with the light, Ember!", 'Sing along with the light, {hero}! I will keep you warm with my song.', 'Hát cùng ánh sáng nhé, {hero}! Tiếng hát của mình sẽ sưởi ấm bạn.')
edit("en: 'Even the volcano cannot drown out a good melody! Keep shining, Ember!", 'Even the volcano cannot drown out a good melody! Keep shining, {hero}! ♪', 'Ngay cả núi lửa cũng không át được một giai điệu hay! Cứ tỏa sáng nhé, {hero}! ♪')
edit("en: 'I read the last chapter early. I will not spoil it. But... bring snacks. Good luck, Ember.'", 'I read the last chapter early. I will not spoil it. But... bring snacks. Good luck, {hero}.', 'Mình đọc trước chương cuối rồi. Mình sẽ không tiết lộ. Nhưng... nhớ mang đồ ăn vặt. Chúc may mắn, {hero}.')
edit("en: 'Hmph. Short men make LONG grudges, lantern-boy!'", 'Hmph. Short men make LONG grudges, little lantern!', 'Hừm. Người thấp thì thù DAI, đèn nhỏ ạ!')
edit("en: 'Wait... you are the lantern kid?", 'Wait... you are the lantern kid? The one who beat the Spider Queen with a LEEK? QuanSadBoy wrote me about you!', 'Khoan... bạn là đứa nhóc cầm đèn? Người đã hạ Nữ Hoàng Nhện bằng một CÂY HÀNH? QuanSadBoy đã viết thư kể về bạn!')
edit("en: 'So... the little lantern-bearer crawls through my meadow.", 'So... the little lantern-bearer crawls through my meadow. I can smell the last flame of Aurelia on you!', 'Thì ra... kẻ cầm đèn bé nhỏ đang bò qua đồng cỏ của ta. Ta ngửi thấy ngọn lửa cuối cùng của Aurelia trên người ngươi!')
edit("en: 'Test subjects, boy.", 'Test subjects, little lantern. I wanted to see how bright your lantern really burns. Now I want to see how long it lasts against my venom.', 'Vật thí nghiệm thôi, nhóc. Ta muốn xem đèn của nhóc thực sự cháy sáng đến đâu. Giờ ta muốn xem nó chịu nổi bao lâu trước nọc độc của ta.')
edit("en: 'Your leek is amusing, boy.", 'Your leek is amusing, little lantern. But venom spoils every blade. Behold, the true Sy!', 'Cây hành của nhóc thật thú vị. Nhưng nọc độc làm hỏng mọi lưỡi kiếm. Chiêm ngưỡng Sy thực sự đi!')
edit("en: 'Impressive. The Golem lasted longer than I bet. Keep the shiny dust, boy.'", 'Impressive. The Golem lasted longer than I bet. Keep the shiny dust, little lantern.', 'Ấn tượng. Người Khổng Lồ trụ lâu hơn ta cược. Cứ giữ lấy bụi lấp lánh đi, nhóc.')
edit("en: 'Take my daggers, lad.", 'Take my daggers, matey. They fly straight even underwater. Mostly.', 'Cầm dao của ta đi nhóc. Chúng bay thẳng kể cả dưới nước. Phần lớn là vậy.')
edit("en: 'Arr, listen, lad.", 'Arr, listen, matey. Hammer the Jump button again and again to swim up, let yourself sink to go down. The deeper you go, the darker and the stronger the currents.', 'Arr, nghe này nhóc. Nhấn Nhảy liên tục để bơi lên, thả người ra để chìm xuống. Càng xuống sâu càng tối và dòng nước càng mạnh.')
edit("en: 'Swim fast, Ember.", 'Swim fast, {hero}. The sea is very deep... and the fish are hungry.', 'Bơi nhanh nhé, {hero}. Biển rất sâu... và lũ cá đang đói.')
edit("en: 'SUNKEN DEEP. The swamp drains into the sea, and the sea swallows the road. Ember takes a deep breath", 'SUNKEN DEEP. The swamp drains into the sea, and the sea swallows the road. The Lanternbearer takes a deep breath... and dives.', 'ĐẠI DƯƠNG SÂU THẲM. Đầm lầy đổ ra biển, và biển nuốt mất con đường. Người Giữ Đèn hít một hơi thật sâu... rồi lặn xuống.')
# the ride home after map 1
edit("en: 'Ember whistles. A brown mare trots out of the hills", 'The Lanternbearer whistles. A brown mare trots out of the hills, one of the few animals that never ran from the dark. Lyra is lifted onto the saddle, and the Lanternbearer climbs up in front of her.', 'Người Giữ Đèn huýt sáo. Một con ngựa nâu chạy ra từ đồi, một trong số ít con vật không bỏ chạy trước bóng tối. Lyra được đỡ lên yên, rồi Người Giữ Đèn leo lên phía trước.')
edit("en: 'You... you do not have to take me all the way, Ember.", 'You... you do not have to take me all the way, {hero}. I can walk. (She holds on to the cloak in front of her anyway.)', 'Bạn... bạn không cần đưa mình đi tận nơi đâu, {hero}. Mình tự đi được mà. (Nói vậy nhưng cô vẫn nắm chặt vạt áo choàng phía trước.)')
edit("en: 'Lyra rests her cheek against his back.", 'Lyra rests her cheek against the Lanternbearer\'s back. She has sung for kings and crowds, but she has never felt this: a heartbeat so loud it drowns out every song.', 'Lyra áp má vào lưng Người Giữ Đèn. Cô từng hát trước vua chúa và đám đông, nhưng chưa bao giờ cảm thấy điều này: một nhịp tim lớn đến mức át cả mọi bài ca.')
edit("en: '(whispering to herself) Please... do not let him hear mine...'", '(whispering to herself) Please... do not let my heartbeat be heard...', '(thì thầm với chính mình) Xin đừng... đừng để ai nghe thấy tim mình...')
edit("en: 'Ember, why did you walk all the way into that meadow for a stranger?'", '{hero}, why did you walk all the way into that meadow for a stranger?', '{hero}, tại sao bạn lại đi tận vào đồng cỏ đó vì một người xa lạ?')
edit("en: '(half smiling, not sure) The stars?", '(half smiling, not sure) The stars? ...Right. Yeah. Lovely. (She was about to say something else. Is it allowed to hope?)', '(nửa cười, nửa ngờ) Sao á? ...Ừ. Ừ, đẹp thật. (Cô ấy định nói điều khác. Liệu có được phép hy vọng không?)')
# cosmetics in the shop
rep("desc: { en: 'Ember shines with a golden aura (looks only).', vi: 'Ember tỏa hào quang vàng (trang trí).' }", "desc: { en: 'Your hero shines with a golden aura (looks only).', vi: 'Hero của bạn tỏa hào quang vàng (trang trí).' }")
rep("desc: { en: 'Ember grows a pair of dragon wings (looks only).', vi: 'Ember mọc đôi cánh rồng (trang trí).' }", "desc: { en: 'Your hero grows a pair of dragon wings (looks only).', vi: 'Hero của bạn mọc đôi cánh rồng (trang trí).' }")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
