import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, 'MISSING: ' + a[:80]
    return s.replace(a, b, 1)

NEW_HERO = """const heroPad = r => '..' + r + '..';
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
const heroFrame = (top, legs) => top.concat(heroBody, legs);"""

def art(s):
    a = s.index("const heroTop = ["); b = s.index("const heroFrame = (top, legs) => top.concat(heroBody, legs);") + len("const heroFrame = (top, legs) => top.concat(heroBody, legs);")
    return s[:a] + NEW_HERO + s[b:]
edit('src/art.js', art)

def game(s):
    # emote face overlay follows the wider hero sprite
    s = rep(s, "const px = (cx, cy, col, w, h) => { const ww = w || 1, xx = flip ? (W - 1 - cx - (ww - 1)) : cx;", "const EX = (W - 18) >> 1, px = (cx0, cy, col, w, h) => { const ww = w || 1, cx = cx0 + EX, xx = flip ? (W - 1 - cx - (ww - 1)) : cx;")
    # Quoc forms: the Dark Lord
    a = s.index("    quoc: [\n      { name: { en: 'Quoc - Shadow Imp'"); b = s.index("    ]\n  };\n  const MINI")
    s = s[:a] + """    quoc: [
      { name: { en: 'Quoc - Dark Prince', vi: 'Quoc - Hoàng Tử Bóng Tối' }, spr: 'quoc1', w: 30, h: 60, hp: 200, armor: 0.1, smart: 0.9, sp: 44, minion: 'imp', proj: '#ff6a3a', skills: ['jump', 'charge', 'shoot', 'rush', 'fan'], skills2: ['teleport', 'guard'] },
      { name: { en: 'Quoc - Crimson Aura', vi: 'Quoc - Hào Quang Đỏ Thẫm' }, spr: 'quoc2', w: 30, h: 60, hp: 260, armor: 0.15, smart: 0.8, sp: 48, minion: 'imp', proj: '#ff3a2a', skills: ['rush', 'charge', 'jump', 'breath', 'summon'], skills2: ['fan', 'erupt'] },
      { name: { en: 'Quoc - Blade of Ruin', vi: 'Quoc - Lưỡi Kiếm Hủy Diệt' }, spr: 'quoc3', w: 32, h: 60, hp: 340, armor: 0.25, smart: 0.75, sp: 32, minion: 'imp', proj: '#ff3a5a', skills: ['slam', 'charge', 'rush', 'erupt', 'crossBeam', 'teleport'], skills2: ['spin', 'summon', 'sweep'] },
      { name: { en: 'Quoc - Dark Sorcerer', vi: 'Quoc - Pháp Sư Hắc Ám' }, spr: 'quoc4', w: 32, h: 60, hp: 420, armor: 0.3, smart: 0.8, sp: 26, minion: 'eclipseclone', proj: '#ff3a2a', skills: ['lobs', 'crossBeam', 'meteor', 'teleport', 'shield', 'fan', 'tornado'], skills2: ['dark', 'guard', 'clone'] },
      { name: { en: 'Quoc - Burning Wrath', vi: 'Quoc - Cơn Thịnh Nộ Rực Cháy' }, spr: 'quoc5', w: 34, h: 60, hp: 500, armor: 0.35, smart: 0.8, sp: 30, minion: 'ghost', proj: '#ffd34e', skills: ['beam', 'meteor', 'rain', 'tornado', 'teleport', 'fan', 'clone'], skills2: ['lobs', 'spin', 'dark', 'crossBeam'] },
      { name: { en: 'Quoc - Titan Lord', vi: 'Quoc - Chúa Tể Khổng Lồ' }, spr: 'quoc6', w: 46, h: 82, hp: 620, armor: 0.45, smart: 0.5, sp: 22, minion: 'imp', proj: '#ff6a3a', skills: ['lavaCols', 'meteor', 'sweep', 'roar', 'slam', 'erupt', 'spin', 'summon', 'crossBeam'], skills2: ['shield', 'rush', 'rain'] },
      { name: { en: 'QUOC, THE ETERNAL ECLIPSE', vi: 'QUOC, NHẬT THỰC VĨNH CỬU' }, spr: 'quoc7', w: 54, h: 97, hp: 780, armor: 0.45, smart: 0.9, sp: 30, minion: 'ghost', eclipse: true, proj: '#d58bff', skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado', 'cloak', 'crossBeam', 'rush'], skills2: ['dark', 'clone', 'summon', 'roar', 'fan', 'lobs'], skills3: ['shield', 'meteor', 'guard', 'slam'] }
""" + s[b:]
    s = rep(s, "      1: [{ en: 'A SPARK THAT BITES? HOW CUTE. LET LOOSE... MY HOUND!', vi: 'MỘT TIA LỬA BIẾT CẮN? DỄ THƯƠNG ĐẤY. THẢ RA... CON CHÓ CỦA TA!' }],", "      1: [{ en: 'A SPARK THAT BITES? HOW CUTE. FEEL THE CRIMSON FLAME!', vi: 'MỘT TIA LỬA BIẾT CẮN? DỄ THƯƠNG ĐẤY. HÃY NẾM NGỌN LỬA ĐỎ THẪM!' }],")
    s = rep(s, "      3: [{ en: 'ENOUGH!! I WILL NOT BE SHAMED IN MY OWN HOUSE! BEHOLD THE WARLORD!', vi: 'ĐỦ RỒI!! TA SẼ KHÔNG BỊ NHỤC NHÃ TRONG NHÀ CỦA CHÍNH MÌNH! CHIÊM NGƯỠNG ĐẠI TƯỚNG!' }],", "      3: [{ en: 'ENOUGH!! I WILL NOT BE SHAMED IN MY OWN HOUSE! TASTE DARK MAGIC!', vi: 'ĐỦ RỒI!! TA SẼ KHÔNG BỊ NHỤC NHÃ TRONG NHÀ CỦA CHÍNH MÌNH! NẾM THỬ HẮC PHÁP!' }],")
    s = rep(s, "      4: [{ en: 'WINGS OF THE ARCHDEMON! THE SKY ITSELF WILL BURN!', vi: 'ĐÔI CÁNH CỦA ĐẠI QUỶ! CẢ BẦU TRỜI SẼ CHÁY!' }],", "      4: [{ en: 'YOU MADE ME ANGRY! THE WHOLE WORLD WILL BURN WITH ME!', vi: 'NGƯƠI ĐÃ LÀM TA GIẬN! CẢ THẾ GIỚI SẼ CHÁY CÙNG TA!' }],")
    s = rep(s, "      5: [{ en: 'I AM THE ASH OF EVERY VOLCANO! KNEEL!', vi: 'TA LÀ TRO TÀN CỦA MỌI NGỌN NÚI LỬA! QUỲ XUỐNG!' }],", "      5: [{ en: 'I AM THE KING OF EVERY NIGHTMARE! LOOK UP AND TREMBLE!', vi: 'TA LÀ VUA CỦA MỌI CƠN ÁC MỘNG! NGẨNG LÊN VÀ RUN RẨY ĐI!' }],")
    # shout -> roaring portrait in the cutscene
    s = rep(s, "dv = devilSprite(), rise =", "dv = devilSprite(!!ln.shout), rise =")
    return s
edit('src/game.js', game)

def idx(s):
    return rep(s, '<script src="src/foes.js"></script>', '<script src="src/foes.js"></script>\n<script src="src/lord.js"></script>')
edit('index.html', idx)
print('ok')
