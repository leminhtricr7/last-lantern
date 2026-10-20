# second half of the map-1 story: the Slime King's last line, Shorty Phong's trial, Lyra's rescue
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

rep("""{ w: 'narr', en: 'The first fragment glows in Ember\\'s hands. Far away, in a castle of ash, a dark laugh suddenly stops.', vi: 'Mảnh vỡ đầu tiên rực sáng trong tay Ember. Ở nơi xa, trong tòa lâu đài tro tàn, một tràng cười đen tối bỗng im bặt.' }""",
    """{ w: 'narr', en: 'The lantern flares, and its flame leaps up into the First Tower. The tower blazes, and a thread of light runs across the sky towards the forest. Inside the black moon, a dark laugh stops.', vi: 'Cây đèn bừng lên, ngọn lửa của nó vọt lên Tháp Đèn Thứ Nhất. Ngọn tháp rực cháy, và một sợi ánh sáng chạy ngang bầu trời về phía khu rừng. Bên trong mặt trăng đen, một tràng cười bỗng im bặt.' }""")
rep("""      { en: 'Hehehe... so THIS is the famous lantern-boy? Mr Shorty Phong welcomes you!', vi: 'Hê hê hê... vậy ĐÂY là cậu bé cầm đèn nổi tiếng? Mr Shorty Phong chào đón cậu!' },
      { en: 'My master Quoc wants you stopped. So let us play with my little trial.', vi: 'Chủ nhân Quoc muốn cậu dừng lại. Vậy hãy chơi thử thách nhỏ của ta nào.' },""",
    """      { en: 'Hehehe... so THIS is the nobody the old lantern picked? Mr Shorty Phong welcomes you!', vi: 'Hê hê hê... vậy ĐÂY là đứa vô danh mà cây đèn cổ chọn à? Mr Shorty Phong chào đón nhóc!' },
      { en: 'My master Quoc wants every light asleep, yours too. So let us play my little trial.', vi: 'Thầy Quốc của ta muốn mọi ánh sáng ngủ yên, kể cả của nhóc. Vậy chơi thử thách nhỏ của ta nào.' },""")
a0 = s.index('  const RESCUE = [')
a1 = s.index('  ];', a0) + 4
s = s[:a0] + """  const RESCUE = [
    { en: 'Mr Shorty Phong\\'s great beetle is finished, and you climbed all the way up here! You are very brave.', vi: 'Con bọ khổng lồ của Mr Shorty Phong đã gục, và bạn còn leo tận lên đây! Bạn dũng cảm quá.' },
    { en: 'You... you came for me? The cage is open! Oh, thank the light!', vi: 'Bạn... bạn đến cứu mình sao? Lồng mở rồi! Ôi, tạ ơn ánh sáng!' },
    { en: 'I am Lyra. My song is the one voice that can wake a tower... that is why Quoc had me locked away.', vi: 'Mình là Lyra. Tiếng hát của mình là giọng duy nhất đánh thức được Tháp Đèn... vì thế Quốc mới nhốt mình lại.' },
    { en: 'And that lantern... it chose you? Then you are the new Lanternbearer!', vi: 'Còn cây đèn kia... nó chọn bạn sao? Vậy bạn chính là Người Giữ Đèn mới!' },
    { en: 'Please take my Leek Blade. It is a royal treasure, and it sings with the lantern\\'s flame. It is stronger than an old sword.', vi: 'Xin hãy nhận Kiếm Hành Lá của mình. Nó là bảo vật hoàng gia và hát cùng ngọn lửa của cây đèn. Nó mạnh hơn thanh kiếm cũ nhiều.' },
    { en: 'Take my Leek Armor too, it stuns anyone who dares to hit you. And my Flying Leek will carry you through the sky and heal you a little. Ride it!', vi: 'Nhận luôn Giáp Hành Lá của mình nữa, nó làm choáng kẻ nào dám đánh bạn. Và Cây Hành Bay sẽ chở bạn bay trên trời, còn hồi máu cho bạn chút ít. Cưỡi nó nhé!' },
    { en: 'I am coming with you. At every tower I will sing, and you will light it. La la laaa~ ♪', vi: 'Mình sẽ đi cùng bạn. Đến mỗi tháp, mình sẽ hát, còn bạn sẽ thắp sáng nó. La la laaa~ ♪' }
  ];
""" + s[a1:]
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
