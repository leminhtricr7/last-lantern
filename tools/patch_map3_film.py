# map 3 (Crystal Caverns): the film (tools/mfilm3.js) and the story text
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

film = io.open('tools/mfilm3.js', encoding='utf-8').read()
i = s.index('  // ===================== FILMS: the 60 s intro and the 60 s outro')
s = s[:i] + film + s[i:]
a0 = s.index("      { en: 'CRYSTAL CAVERNS. The crystals were once")
a1 = s.index("\n", a0)
s = s[:a0] + "      { en: 'CRYSTAL CAVERNS. The crystals keep a memory of every light that touches them. Now they glow weakly, like a heartbeat fading.', vi: 'HANG PHA LÊ. Pha lê giữ lại ký ức của mọi ánh sáng chạm vào nó. Giờ chúng chỉ sáng yếu ớt, như nhịp tim đang tàn.' }," + s[a1:]
rep("""        { en: 'Light... remembers... me...', vi: 'Ánh sáng... còn nhớ... ta...' },
        { w: 'narr', en: 'One by one, the crystals of the caverns flicker back to life.', vi: 'Từng viên một, pha lê trong hang động le lói sáng trở lại.' }""",
    """        { en: 'Light... remembers... me...', vi: 'Ánh sáng... còn nhớ... ta...' },
        { w: 'lyra', en: 'It was only guarding the tower. Let us wake it gently. Lift the lantern!', vi: 'Nó chỉ canh giữ ngọn tháp thôi. Hãy đánh thức tháp thật nhẹ nhàng. Giơ đèn lên nào!' },
        { w: 'narr', en: 'Lyra sings. Deep under the mountain the Third Tower blazes, its light pours up through every crystal into the sky, and a new thread runs towards the desert.', vi: 'Lyra cất tiếng hát. Sâu dưới lòng núi, Tháp Đèn Thứ Ba bừng sáng, ánh sáng tràn qua từng viên pha lê lên tận bầu trời, và một sợi sáng mới chạy về phía sa mạc.' }""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
