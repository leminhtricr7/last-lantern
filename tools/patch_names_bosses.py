# Phase 2B (bosses): the approved new names for the 10 main bosses, Quoc's 8 forms, Shorty and Sy, and the dragon,
# each with a title and a one-line intro shown on a "boss card" when a fight starts, when a boss changes form and when
# the dragon changes stage. Dialogue and films that named a boss now use the new name. HP, skills, form order and
# timings are unchanged.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:120]
    s = s.replace(a, b)
def N(en, vi): return "{ en: '%s', vi: '%s' }" % (en.replace("'", "\\'"), vi.replace("'", "\\'"))
def card(name, title, tag): return 'name: %s, title: %s, tag: %s' % (N(*name), N(*title), N(*tag))

# ---------- A. main bosses ----------
A = [
 ("name: { en: 'King Slime', vi: 'Vua Slime' }", ('Gulgor', 'Gulgor'), ('the Lantern Gulper', 'Bụng Nuốt Đèn'),
  ('A crowned ooze asleep on the First Tower, swallowing every spark of light that falls on the meadow.', 'Khối nhầy đội vương miện ngủ trên Tháp Đèn Thứ Nhất, nuốt mọi đốm sáng rơi xuống đồng cỏ.')),
 ("name: { en: 'Spider Queen', vi: 'Nữ Hoàng Nhện' }", ('Veylith', 'Veylith'), ('the Hush Spinner', 'Kẻ Dệt Lời Thì Thầm'),
  ("She spins her web from the forest's whispers; whoever follows the voices is lost for good.", 'Nhện chúa dệt tơ từ lời thì thầm của khu rừng; ai đi theo tiếng gọi ấy sẽ lạc mãi.')),
 ("name: { en: 'Crystal Golem', vi: 'Người Khổng Lồ Pha Lê' }", ('Prismor', 'Prismor'), ('the Silent Prism', 'Trái Tim Pha Lê Câm'),
  ("A stone giant that locks the cave's light inside its crystal heart and lets no ray escape.", 'Người khổng lồ đá nhốt ánh sáng của hang trong trái tim pha lê, không cho tia nào lọt ra ngoài.')),
 ("name: { en: 'Sand Pharaoh', vi: 'Pharaoh Cát' }", ('Khepsar', 'Khepsar'), ('the One Who Begged to Sleep', 'Kẻ Xin Được Ngủ'),
  ('A century ago he begged Quoc to let the Fourth Tower sleep; now he has traded his loyalty for a sleep that never ends.', 'Trăm năm trước hắn xin Quốc để Tháp Thứ Tư ngủ yên; nay hắn đổi lòng trung thành lấy giấc ngủ không bao giờ dứt.')),
 ("name: { en: 'Frost King', vi: 'Vua Băng' }", ('Rimvald', 'Rimvald'), ('the Self-Frozen Heart', 'Trái Tim Tự Đóng Băng'),
  ('A king who froze his own heart so it would not hurt when his tower went dark; now his ice covers the whole summit.', 'Vị vua tự đóng băng trái tim để khỏi đau khi tháp tắt; giờ băng của ông phủ kín đỉnh núi.')),
 ("name: { en: 'Magma Titan', vi: 'Titan Dung Nham' }", ('Kaldrok', 'Kaldrok'), ('the Walking Forge', 'Lò Rèn Biết Đi'),
  ("A lava giant who tends the Sixth Tower's furnace, and whose own weight is dragging the tower down into the fire.", 'Người khổng lồ dung nham canh lò lửa của Tháp Thứ Sáu, và chính sức nặng của hắn đang kéo ngọn tháp chìm xuống.')),
 ("name: { en: 'THE ECLIPSE', vi: 'NHẬT THỰC' }", ('Quoc, King of the Eclipse', 'Quốc, Vua Nhật Thực'), ('the Lanternbearer Who Went Dark', 'Người Giữ Đèn Đã Tắt'),
  ('A century ago he lit nine towers and fell before the tenth; now he wants the dark to stay forever.', 'Trăm năm trước anh thắp chín ngọn tháp rồi gục ngã trước ngọn thứ mười; giờ anh muốn bóng tối ở lại mãi.')),
 ("name: { en: 'Spore Queen', vi: 'Nữ Hoàng Bào Tử' }", ('Morvella', 'Morvella'), ("the Swamp's Lullaby", 'Lời Ru Của Đầm Lầy'),
  ('The mushroom mother once promised Quoc that sleep would be kinder; her spores lull the whole swamp to sleep.', 'Bà mẹ nấm từng hứa với Quốc rằng giấc ngủ sẽ dịu dàng hơn; bào tử của bà ru cả đầm lầy ngủ say.')),
 ("name: { en: 'Abyssal Kraken', vi: 'Thủy Quái Kraken' }", ('Oktavor', 'Oktavor'), ('Drowner of the Eighth Tower', 'Kẻ Nhấn Chìm Tháp Thứ Tám'),
  ('A giant octopus that dragged the Eighth Tower to the seabed, sealed its cave with the Tide Door and will not let go.', 'Bạch tuộc khổng lồ ôm Tháp Thứ Tám xuống đáy biển, khóa hang bằng Cánh Cửa Thủy Triều và không chịu buông.')),
 ("name: { en: 'Gravemaw the Great Worm', vi: 'Sâu Khổng Lồ Gravemaw' }", ('Vorgrub', 'Vorgrub'), ('the Ember Eater', 'Miệng Nuốt Tàn Lửa'),
  ("An ancient worm hollowing out the mountain to eat the Ninth Tower's embers; when the dust jumps, it is right beneath you.", 'Con sâu già đào rỗng lòng núi để nuốt tàn lửa của Tháp Thứ Chín; khi bụi nảy lên là nó đang ở ngay dưới chân.')),
]
for old, name, title, tag in A: rep(old, card(name, title, tag))

# ---------- B. Quoc's eight forms: a journey ----------
B = [
 ("name: { en: 'Quoc, the Dark Lord', vi: 'Quốc - Quỷ Vương Hắc Ám' }", ('Quoc · the Fallen Lanternbearer', 'Quốc · Người Giữ Đèn Sa Ngã'), ('Step 1 · The Fall', 'Chặng 1 · Sa ngã'),
  ('Still the man, inside the black armour of a hundred lonely years.', 'Vẫn là anh, trong bộ giáp đen của trăm năm cô độc.')),
 ("name: { en: 'Quoc - Dark Imp', vi: 'Quốc - Tiểu Quỷ Bóng Tối' }", ('Quoc · the Lonely Shade', 'Quốc · Bóng Cô Đơn'), ('Step 2 · Loneliness', 'Chặng 2 · Cô đơn'),
  ('The smallest part of him: a child who only wished someone would walk with him.', 'Phần nhỏ bé nhất trong anh: đứa trẻ chỉ ước có ai đi cùng.')),
 ("name: { en: 'Quoc - Hellhound', vi: 'Quốc - Chó Địa Ngục' }", ('Quoc · the Masterless Hound', 'Quốc · Chó Săn Không Chủ'), ('Step 3 · Lost', 'Chặng 3 · Lạc lối'),
  ('Loyalty with no one left to follow, hunting the light.', 'Lòng trung thành không còn ai để theo, chỉ còn biết săn ánh sáng.')),
 ("name: { en: 'Quoc - Chained Demon', vi: 'Quốc - Quỷ Xích' }", ('Quoc · the Oath-Chained', 'Quốc · Kẻ Mang Xích Lời Thề'), ('Step 4 · Bound', 'Chặng 4 · Ràng buộc'),
  ('His vow to light all ten towers turned into chains that bind him.', 'Lời thề thắp đủ mười tháp hóa thành xích, trói chặt anh lại.')),
 ("name: { en: 'Quoc - Iron General', vi: 'Quốc - Đại Tướng Giáp Sắt' }", ('Quoc · the Warmthless Knight', 'Quốc · Hiệp Sĩ Hết Hơi Ấm'), ('Step 5 · Empty', 'Chặng 5 · Trống rỗng'),
  ('The farther he walked, the less warmth was left; now only cold wind lives in the armour.', 'Càng đi xa, hơi ấm càng vơi; giờ trong giáp chỉ còn gió lạnh.')),
 ("name: { en: 'Quoc - Winged Archdemon', vi: 'Quốc - Đại Quỷ Có Cánh' }", ('Quoc · Wings That Fell Short', 'Quốc · Đôi Cánh Lỡ Đỉnh'), ('Step 6 · Failure', 'Chặng 6 · Thất bại'),
  ('He grew wings to reach the top of the tenth tower, and never made it.', 'Anh mọc cánh để bay lên đỉnh tháp thứ mười, nhưng chưa bao giờ chạm tới.')),
 ("name: { en: 'Quoc - Ashen Titan', vi: 'Quốc - Titan Tro Tàn' }", ('Quoc · Ash of Nine Towers', 'Quốc · Tro Tàn Chín Ngọn Tháp'), ('Step 7 · Burned Out', 'Chặng 7 · Thiêu rụi'),
  ('The nine fires he once lit now burn him to ash.', 'Chín ngọn lửa anh từng thắp nay thiêu chính anh thành tro.')),
 ("name: { en: 'QUOC, THE ETERNAL ECLIPSE', vi: 'QUOC, NHẬT THỰC VĨNH CỬU' }", ('QUOC · HEART OF THE ECLIPSE', 'QUỐC · TRÁI TIM NHẬT THỰC'), ('Step 8 · Darkness', 'Chặng 8 · Bóng tối'),
  ('No light is left in him; he wants the whole world as dark as he is.', 'Không còn chút ánh sáng nào trong anh; anh muốn cả thế giới tối như mình.')),
]
for old, name, title, tag in B: rep(old, card(name, title, tag))

# ---------- C. the two gatekeepers ----------
C = [
 ("name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, spr: 'shorty_h'", ('Mr Shorty Phong', 'Ngài Shorty Phong'), ('the Tall-Hat Butler', 'Quản Gia Mũ Cao'),
  ('A loyal butler who only ever wanted his master to smile once.', 'Người quản gia trung thành chỉ mong chủ nhân mỉm cười một lần.'), ", spr: 'shorty_h'"),
 ("name: { en: 'SHORTY, THE HAT BEAST', vi: 'SHORTY, QUÁI VẬT MŨ CAO' }", ('Shorty Phong, the Tall-Hat Fiend', 'Shorty Phong, Quỷ Mũ Cao'), ('the Grin Turned Fang', 'Nụ Cười Hóa Nanh'),
  ('When the tall hat swallowed him, his smile turned into fangs.', 'Khi chiếc mũ cao nuốt lấy ông, nụ cười cũng hóa thành nanh.'), ''),
 ("name: { en: 'Mr Sy', vi: 'Mr Sy' }, spr: 'sy_h'", ('Doctor Sy', 'Thầy Sy'), ('the Green-Coat Poisoner', 'Nhà Pha Độc Áo Xanh'),
  ('An alchemist in green whose every potion is a sleep you never wake from.', 'Nhà giả kim áo xanh; mỗi lọ thuốc của ông là một giấc ngủ không bao giờ tỉnh.'), ", spr: 'sy_h'"),
 ("name: { en: 'SY, THE VENOM SERPENT', vi: 'SY, RẮN CHÚA ĐỘC' }", ('Sy, the Venom Wyrm', 'Sy, Mãng Xà Độc Dược'), ('the Final Dose', 'Liều Độc Cuối Cùng'),
  ('Drinking his own final dose, he became a serpent coiled around the citadel gate.', 'Uống chính liều độc cuối cùng của mình, ông hóa thành con mãng xà quấn quanh cổng thành.'), ''),
]
for old, name, title, tag, tail in C: rep(old, card(name, title, tag) + tail)
# their speaker names in dialogue
rep("shorty: { spr: 'npc_shorty', name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' } },", "shorty: { spr: 'npc_shorty', name: { en: 'Mr Shorty Phong', vi: 'Ngài Shorty Phong' } },")
rep("shorty: { name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, col: '#ffd34e' }", "shorty: { name: { en: 'Mr Shorty Phong', vi: 'Ngài Shorty Phong' }, col: '#ffd34e' }")
rep("sy: { name: { en: 'Mr Sy', vi: 'Mr Sy' }", "sy: { name: { en: 'Doctor Sy', vi: 'Thầy Sy' }")
rep("sy: { spr: 'npc_sy', name: { en: 'Mr Sy', vi: 'Mr Sy' } },", "sy: { spr: 'npc_sy', name: { en: 'Doctor Sy', vi: 'Thầy Sy' } },")
rep("MF_WHO.y = [['MR SY', 'MR SY'], '#7ed957', 'sy'];", "MF_WHO.y = [['DOCTOR SY', 'THẦY SY'], '#7ed957', 'sy'];")
rep("txt('Mr Shorty Phong', x, y - 18,", "txt(sv('Mr Shorty Phong', 'Ngài Shorty Phong'), x, y - 18,")
rep("Mr Shorty Phong, từ trên ngọn cây", "Ngài Shorty Phong, từ trên ngọn cây")
rep("Con bọ khổng lồ của Mr Shorty Phong", "Con bọ khổng lồ của Ngài Shorty Phong")
rep("Mr Shorty Phong chào đón nhóc!", "Ngài Shorty Phong chào đón nhóc!")
rep("vi: 'Mr Shorty... ông không cần làm vậy.", "vi: 'Ngài Shorty... ông không cần làm vậy.")

# ---------- D. the dragon: Ignar on the meadow, Ignarok in the volcano (three stages) ----------
rep("NPCS.dragon = { spr: 'dragon_head', name: { en: 'Ignarok the Ashwing', vi: 'Ignarok Cánh Tro' } };",
    "NPCS.dragon = { spr: 'dragon_head', name: { en: 'Ignarok', vi: 'Ignarok' } };\n  NPCS.dragon_young = { spr: 'dragon_head', name: { en: 'Ignar', vi: 'Ignar' } };   // the same dragon on the meadow, before it grew up")
rep("dragon: '#ff8a2a',", "dragon: '#ff8a2a', dragon_young: '#ffb04a',")
rep("young: { stages: [{ form: 0,", "young: { stages: [{ " + card(('Ignar', 'Ignar'), ('the Lost Hatchling', 'Rồng Con Lạc Đàn'),
    ('A proud hatchling circling the meadow: Quoc promised it a throne of ash if it snuffs out the last flame.', 'Rồng con kiêu ngạo lượn trên đồng cỏ: Quốc hứa ban cho nó ngai vàng bằng tro nếu nó dập tắt ngọn lửa cuối cùng.')) + ", form: 0,")
rep("      { form: 1, hp: 280,", "      { " + card(('Ignarok Ashscale', 'Ignarok Vảy Tro'), ('the Grown Flame', 'Ngọn Lửa Đã Lớn'),
    ('The hatchling has grown up; it still remembers the little flame from the meadow.', 'Chú rồng con năm nào đã lớn; nó vẫn nhớ ngọn lửa nhỏ ở đồng cỏ.')) + ", form: 1, hp: 280,")
rep("      { form: 2, hp: 340,", "      { " + card(('Ignarok of Three Furies', 'Ignarok Ba Đầu Thịnh Nộ'), ('Rage Split Three Ways', 'Cơn Giận Chia Ba'),
    ('Its rage splits into three heads, each breathing its own fire.', 'Cơn giận tách làm ba cái đầu, mỗi đầu phun một luồng lửa.')) + ", form: 2, hp: 340,")
rep("      { form: 3, hp: 400,", "      { " + card(('Ignarok the Duskflame', 'Ignarok Cánh Đêm'), ('the Swallowed Flame', 'Ngọn Lửa Bị Nuốt'),
    ("The Eclipse's dark swallowed its fire; now it breathes violet flame.", 'Bóng tối Nhật Thực nuốt lấy ngọn lửa của nó; giờ nó phun ra hơi thở tím.')) + ", form: 3, hp: 400,")
# the boss bar shows each stage's own name; the young dragon speaks as Ignar
rep("cfg: { name: NPCS.dragon.name, armor: st.armor }", "cfg: { name: st.name || NPCS.dragon.name, armor: st.armor }")
rep("d.stage = i; d.form = st.form; d.w = st.w; d.h = st.h; d.hp = d.max = st.hp; d.armor = st.armor; d.cfg.armor = st.armor;",
    "d.stage = i; d.form = st.form; d.w = st.w; d.h = st.h; d.hp = d.max = st.hp; d.armor = st.armor; d.cfg.armor = st.armor; d.cfg.name = st.name || d.cfg.name; bossCard(st, sv('DRAGON', 'RỒNG'));")
rep("startScripted('dragon', DRG_DLG.young_flee,", "startScripted('dragon_young', DRG_DLG.young_flee,")
rep("startScripted('dragon', d.def.kind === 'young' ? DRG_DLG.young_intro : DRG_DLG.map6_intro, () => { d.st = 'hover'; d.timer = 0.9;",
    "startScripted(d.def.kind === 'young' ? 'dragon_young' : 'dragon', d.def.kind === 'young' ? DRG_DLG.young_intro : DRG_DLG.map6_intro, () => { d.st = 'hover'; d.timer = 0.9; bossCard(DRG[d.def.kind].stages[d.stage], sv('DRAGON', 'RỒNG'));")
rep("{ en: 'I am Ignarok the Ashwing. Quoc promised me", "{ en: 'I am Ignar. Quoc promised me")
rep("vi: 'Ta là Ignarok Cánh Tro. Quốc hứa ban", "vi: 'Ta là Ignar. Quốc hứa ban")
rep("{ en: 'Did you miss me, little spark? The volcano is MY forge now.', vi: 'Nhớ ta không, tia lửa nhỏ? Núi lửa giờ là lò rèn của ta.' },",
    "{ en: 'Did you miss me, little spark? I am not little Ignar anymore. I am IGNAROK, and the volcano is MY forge now.', vi: 'Nhớ ta không, tia lửa nhỏ? Ta không còn là Ignar bé nhỏ nữa. Ta là IGNAROK, và núi lửa giờ là lò rèn của ta.' },")
rep("{ en: 'Above the meadow, Ignarok the Ashwing circles.", "{ en: 'Above the meadow, the young dragon Ignar circles.")
rep("vi: 'Trên đồng cỏ, Ignarok Cánh Tro lượn vòng.", "vi: 'Trên đồng cỏ, rồng con Ignar lượn vòng.")
rep("Ignarok swore he would return here, and the Sixth Tower", "The young dragon Ignar swore he would return here, and the Sixth Tower")
rep("Ignarok đã thề sẽ trở lại nơi này, và Tháp Đèn Thứ Sáu", "Rồng con Ignar đã thề sẽ trở lại nơi này, và Tháp Đèn Thứ Sáu")
rep("'Above the smoke, huge wings beat. Ignarok has grown up, and he remembers the little flame from the meadow.', 'Phía trên làn khói, đôi cánh khổng lồ vỗ mạnh. Ignarok đã lớn, và nó vẫn nhớ ngọn lửa nhỏ ở đồng cỏ.'",
    "'Above the smoke, huge wings beat. Little Ignar has grown up: now he is Ignarok, and he remembers the little flame from the meadow.', 'Phía trên làn khói, đôi cánh khổng lồ vỗ mạnh. Rồng con Ignar đã lớn: giờ nó là Ignarok, và nó vẫn nhớ ngọn lửa nhỏ ở đồng cỏ.'")

# ---------- the boss card ----------
rep("  function seal() {", """  // the boss card: name, title and a one-line intro, shown when a fight starts, when a boss changes form and when the
  // dragon changes stage (it fades by itself and never pauses the fight)
  function bossCard(c, label) { if (c && c.name) Q.bcard = { n: c.name, ti: c.title, tg: c.tag, lb: label, t: 0 }; }
  function drawBossCard() {
    const b = Q.bcard; if (!b || b.t > 3.8 || (Q.state !== 'play' && Q.state !== 'bossintro')) return;
    const a = Math.max(0, Math.min(1, b.t / 0.35, (3.8 - b.t) / 0.6)), Y = 128;
    g.globalAlpha = 0.6 * a; g.fillStyle = '#000'; g.fillRect(0, Y, VW, 62); g.globalAlpha = 1;
    txt(b.lb || T('boss'), VW / 2, Y + 7, { al: 'center', size: 6.5, col: '#e0453a', alpha: a });
    txt(LN(b.n), VW / 2, Y + 20, { al: 'center', size: 13, bold: true, alpha: a });
    if (b.ti) txt(LN(b.ti), VW / 2, Y + 33, { al: 'center', size: 7.5, col: '#ffd34e', alpha: a });
    if (b.tg) wrapText(LN(b.tg), 84).slice(0, 2).forEach((l, i) => txt(l, VW / 2, Y + 44 + i * 8, { al: 'center', size: 6, col: '#cfd6e6', alpha: a }));
  }
  function seal() {""")
rep("    Q.boss.st = 'intro'; Q.boss.max = Q.boss.hp;", "    Q.boss.st = 'intro'; Q.boss.max = Q.boss.hp;\n    bossCard(Q.li === 6 ? BOSS[6] : Q.boss.cfg, Q.li === 6 ? sv('FINAL BOSS', 'TRÙM CUỐI') : null);   // (map 10: the card of the whole fight; each form shows its own card later)")
rep("    b.st = 'intro'; b.timer = 0; Q.boss = b; Q.arenaSealed = true; Q.bossDead = false; if (coop) coopGather(false, m.lead);",
    "    b.st = 'intro'; b.timer = 0; Q.boss = b; Q.arenaSealed = true; Q.bossDead = false; if (coop) coopGather(false, m.lead);\n    bossCard(b.cfg, sv('GATEKEEPER', 'GÁC CỔNG'));")
rep("    Q.msg = LN(c.name); Q.msgT = 3;\n    if (b.id === 'quoc' && FORM_SCENES[idx]) {",
    "    bossCard(c, sv('FORM ', 'DẠNG ') + (idx + 1) + '/' + b.forms.length);\n    if (b.id === 'quoc' && FORM_SCENES[idx]) {")
# the old boss-intro band is replaced by the card
rep("""    } else if (st === 'bossintro') {
      const b = Q.boss, a = Math.min(1, Q.stateT / 0.4);
      g.globalAlpha = 0.55 * a; g.fillStyle = '#000'; g.fillRect(0, 150, VW, 40); g.globalAlpha = 1;
      txt(T('boss'), VW / 2, 160, { al: 'center', size: 7, col: '#e0453a', alpha: a });
      txt(LN(b.cfg.name), VW / 2, 176, { al: 'center', size: 14, bold: true, alpha: a });
    } else if (st === 'pause') {""", """    } else if (st === 'pause') {""")
rep("    if (Q.state !== 'talk') drawHUD();", "    if (Q.state !== 'talk') drawHUD();\n    drawBossCard();")
rep("    Q.stateT += dt;\n    const st = Q.state;", "    Q.stateT += dt;\n    const st = Q.state;\n    if (Q.bcard && (st === 'play' || st === 'bossintro')) Q.bcard.t += dt;")

# ---------- relics named after bosses ----------
rep("name: { en: 'Crown of the Slime King', vi: 'Vương miện Vua Slime' }", "name: { en: \"Gulgor's Crown\", vi: 'Vương Miện Của Gulgor' }")
rep("""name: { en: "Pharaoh's Scarab", vi: 'Bọ Hung Pharaoh' }""", """name: { en: "Khepsar's Scarab", vi: 'Bọ Hung Của Khepsar' }""")

# ---------- dialogue, story and films that named a boss ----------
T = [
 ("The Sand Pharaoh swore loyalty to Quoc", "Khepsar, the old pharaoh, swore loyalty to Quoc"),
 ("Pharaoh Cát đã thề trung thành với Quốc", "Pharaoh già Khepsar đã thề trung thành với Quốc"),
 ("'The Frost King wanted only to be left alone, once.", "'Rimvald, the frozen king, wanted only to be left alone, once."),
 ("'Vua Băng từng chỉ muốn được yên thân.", "'Rimvald, vị vua băng giá, từng chỉ muốn được yên thân."),
 ("'The Spider Queen nests deep inside.", "'Veylith the spider nests deep inside."),
 ("'Nữ Hoàng Nhện làm tổ sâu bên trong.", "'Nhện chúa Veylith làm tổ sâu bên trong."),
 ("I led my soldiers here after the Pharaoh woke.", "I led my soldiers here after Khepsar woke."),
 ("khi Pharaoh thức giấc.", "khi Khepsar thức giấc."),
 ("'The Frost King melted, my lord.", "'Rimvald melted, my lord."),
 ("'Vua Băng tan chảy rồi, thưa chủ nhân.", "'Rimvald tan chảy rồi, thưa chủ nhân."),
 ("and a very rude Golem chased me back out.", "and a very rude crystal giant called Prismor chased me back out."),
 ("và một Người Khổng Lồ rất thô lỗ đuổi tôi chạy ra.", "và một gã khổng lồ pha lê rất thô lỗ tên Prismor đuổi tôi chạy ra."),
 ("The one who beat the Spider Queen with a LEEK?", "The one who beat Veylith with a LEEK?"),
 ("Người đã hạ Nữ Hoàng Nhện bằng một CÂY HÀNH?", "Người đã hạ Veylith bằng một CÂY HÀNH?"),
 ("I was napping when the Pharaoh\\'s sand woke me.", "I was napping when Khepsar\\'s sand woke me."),
 ("thì cát của Pharaoh đánh thức ta.", "thì cát của Khepsar đánh thức ta."),
 ("The Frost King froze my forest", "Rimvald froze my forest"),
 ("Vua Băng đóng băng rừng của tôi", "Rimvald đóng băng rừng của tôi"),
 ("You woke the Golem and the Frost King for me.", "You woke Prismor and Rimvald for me."),
 ("Ông đã đánh thức Người Khổng Lồ và Vua Băng cho tôi.", "Ông đã đánh thức Prismor và Rimvald cho tôi."),
 ("You beat the Golem that chased me.", "You beat Prismor, the giant that chased me."),
 ("Cậu đã hạ Người Khổng Lồ từng đuổi tôi.", "Cậu đã hạ Prismor, gã khổng lồ từng đuổi tôi."),
 ("'Hm. The Golem is sleeping on the job.", "'Hm. Prismor is sleeping on the job."),
 ("'Hm. Người Khổng Lồ đang ngủ gật khi làm việc.", "'Hm. Prismor đang ngủ gật khi làm việc."),
 ("'Impressive. The Golem lasted longer than I bet.", "'Impressive. Prismor lasted longer than I bet."),
 ("'Ấn tượng. Người Khổng Lồ trụ lâu hơn ta cược.", "'Ấn tượng. Prismor trụ lâu hơn ta cược."),
 ("'The Frost King. A prince of ice.", "'Rimvald. A prince of ice."),
 ("'Vua Băng. Một hoàng tử của băng giá.", "'Rimvald. Một hoàng tử của băng giá."),
 ("the Frost King smiles. Then he melts", "Rimvald smiles. Then he melts"),
 ("Lần đầu tiên sau trăm năm, Vua Băng mỉm cười.", "Lần đầu tiên sau trăm năm, Rimvald mỉm cười."),
 ("Duong said the Pharaoh hates visitors.", "Duong said Khepsar hates visitors."),
 ("Duong nói Pharaoh ghét khách lạ lắm.", "Duong nói Khepsar ghét khách lạ lắm."),
 ("(save.lang === 'vi' ? 'Hạ Kraken!' : 'Defeat the Kraken!')", "(save.lang === 'vi' ? 'Hạ Oktavor!' : 'Defeat Oktavor!')"),
 ("'King Slime melts into the grass.", "'Gulgor melts into the grass."),
 ("'Vua Slime tan chảy vào bãi cỏ.", "'Gulgor tan chảy vào bãi cỏ."),
 ("It is the cold glow of the Spore Queen, who promised Quoc", "It is the cold glow of Morvella, who promised Quoc"),
 ("Đó là ánh lạnh của Nữ Hoàng Bào Tử, kẻ đã hứa với Quốc", "Đó là ánh lạnh của Morvella, kẻ đã hứa với Quốc"),
 ("'They ran because of Gravemaw, a worm so big", "'They ran because of Vorgrub, a worm so big"),
 ("'Họ bỏ chạy vì Gravemaw, một con sâu", "'Họ bỏ chạy vì Vorgrub, một con sâu"),
 ("'The Kraken lets go and sinks into the deep", "'Oktavor lets go and sinks into the deep"),
 ("'Kraken buông ra và chìm xuống đáy sâu", "'Oktavor buông ra và chìm xuống đáy sâu"),
 ("'Gravemaw burrows away for good.", "'Vorgrub burrows away for good."),
 ("'Gravemaw đào sâu xuống và không bao giờ quay lại.", "'Vorgrub đào sâu xuống và không bao giờ quay lại."),
 ("'Good. The Spore Queen will fill its little lungs with sleep.'", "'Good. Morvella will fill its little lungs with sleep.'"),
 ("'Tốt. Nữ Hoàng Bào Tử sẽ lấp đầy", "'Tốt. Morvella sẽ lấp đầy"),
 ("'The Spore Queen... is compost now, master.'", "'Morvella... is compost now, master.'"),
 ("'Nữ Hoàng Bào Tử... thành phân bón rồi, thưa thầy.'", "'Morvella... thành phân bón rồi, thưa thầy.'"),
 ("...Wake the Kraken.'", "...Wake Oktavor.'"),
 ("...Đánh thức Kraken.'", "...Đánh thức Oktavor.'"),
 ("And it tickled the Kraken. He looked happy.", "And it tickled Oktavor. He looked happy."),
 ("Còn cù lét con Kraken nữa.", "Còn cù lét Oktavor nữa."),
 ("Gravemaw... swallow the road.", "Vorgrub... swallow the road."),
 ("Gravemaw... nuốt chửng con đường đi.", "Vorgrub... nuốt chửng con đường đi."),
 ("and the Spore Queen rules them all.'", "and Morvella rules them all.'"),
 ("và Nữ Hoàng Bào Tử cai trị tất cả.'", "và Morvella cai trị tất cả.'"),
 ("'The Deepdig Tunnels. Gravemaw the Great Worm swims through rock like water.'", "'The Deepdig Tunnels. Vorgrub, the great worm, swims through rock like water.'"),
 ("'Đường Hầm Sâu. Sâu Khổng Lồ Gravemaw bơi trong đá như bơi trong nước.'", "'Đường Hầm Sâu. Vorgrub, con sâu khổng lồ, bơi trong đá như bơi trong nước.'"),
 ("'The Kraken is not evil, just lonely and greedy.", "'Oktavor is not evil, just lonely and greedy."),
 ("'Thủy Quái không ác đâu, chỉ cô đơn và tham lam thôi.", "'Oktavor không ác đâu, chỉ cô đơn và tham lam thôi."),
 ("My ship sank chasing that Kraken.", "My ship sank chasing Oktavor."),
 ("Tàu ta chìm vì đuổi theo con Thủy Quái.", "Tàu ta chìm vì đuổi theo Oktavor."),
 ("That is Gravemaw. He ate my cart.", "That is Vorgrub. He ate my cart."),
 ("Đó là Gravemaw. Nó ăn mất xe của tôi.", "Đó là Vorgrub. Nó ăn mất xe của tôi."),
 ("'The Kraken guards the drowned tower", "'Oktavor guards the drowned tower"),
 ("'Kraken canh giữ ngọn tháp chìm", "'Oktavor canh giữ ngọn tháp chìm"),
 ("open the Tide Door at the bottom, and face the Kraken.'", "open the Tide Door at the bottom, and face Oktavor.'"),
 ("mở Cánh Cửa Thủy Triều ở đáy và đối đầu Thủy Quái.'", "mở Cánh Cửa Thủy Triều ở đáy và đối đầu Oktavor.'"),
 ("Far below, the Kraken sleeps wrapped around the Eighth Tower.", "Far below, Oktavor sleeps wrapped around the Eighth Tower."),
 ("Rất sâu bên dưới, Kraken ngủ quấn quanh Tháp Đèn Thứ Tám.", "Rất sâu bên dưới, Oktavor ngủ quấn quanh Tháp Đèn Thứ Tám."),
 ("She needs help: the Kraken locked its cave", "She needs help: Oktavor locked its cave"),
 ("Cô cần giúp đỡ: Thủy Quái đã khóa hang", "Cô cần giúp đỡ: Oktavor đã khóa hang"),
 ("open the Tide Door above the Kraken.'", "open the Tide Door above Oktavor.'"),
 ("mở Cánh Cửa Thủy Triều trên đầu Thủy Quái.'", "mở Cánh Cửa Thủy Triều trên đầu Oktavor.'"),
 ("'Cánh Cửa Thủy Triều đã mở! Kraken đang đợi bên dưới...' : 'The Tide Door opens! The Kraken waits below...'", "'Cánh Cửa Thủy Triều đã mở! Oktavor đang đợi bên dưới...' : 'The Tide Door opens! Oktavor waits below...'"),
 ("MF_WHO.p = [['SAND PHARAOH', 'PHARAOH CÁT'], '#ffd34e', 'bram'];", "MF_WHO.p = [['KHEPSAR', 'KHEPSAR'], '#ffd34e', 'bram'];"),
 ("'This carving tells of Quoc here. The Pharaoh begged him to let the tower sleep... and he refused.', 'Bức khắc này kể về Quốc ở đây. Pharaoh đã xin anh để ngọn tháp ngủ yên... và anh từ chối.'",
  "'This carving tells of Quoc here. Khepsar, the pharaoh, begged him to let the tower sleep... and he refused.', 'Bức khắc này kể về Quốc ở đây. Pharaoh Khepsar đã xin anh để ngọn tháp ngủ yên... và anh từ chối.'"),
 ("'A hundred years later, the Pharaoh sold his loyalty for another promise: a sleep that never ends.', 'Trăm năm sau, Pharaoh đổi lòng trung thành lấy một lời hứa khác: giấc ngủ không bao giờ dứt.'",
  "'A hundred years later, Khepsar sold his loyalty for another promise: a sleep that never ends.', 'Trăm năm sau, Khepsar đổi lòng trung thành lấy một lời hứa khác: giấc ngủ không bao giờ dứt.'"),
 ("The Fourth Tower lies under the pyramid, where the Sand Pharaoh sleeps.", "The Fourth Tower lies under the pyramid, where the pharaoh Khepsar sleeps."),
 ("nơi Pharaoh Cát đang ngủ.", "nơi Pharaoh Khepsar đang ngủ."),
 ("'Chapter ten: the Frost King was Quoc\\'s friend.", "'Chapter ten: Rimvald was Quoc\\'s friend."),
 ("'Chương mười: Vua Băng từng là bạn của Quốc.", "'Chương mười: Rimvald từng là bạn của Quốc."),
 ("The Spore Queen promised him that sleep would be kinder.', 'Sâu trong đầm, một cây nấm khổng lồ mở mắt. Nữ Hoàng Bào Tử đã hứa",
  "Morvella promised him that sleep would be kinder.', 'Sâu trong đầm, một cây nấm khổng lồ mở mắt. Morvella đã hứa"),
 ("The Kraken does not want to let go.', 'Dưới đáy, tám cánh tay quấn quanh ngọn tháp chìm. Kraken không muốn buông ra.'",
  "Oktavor does not want to let go.', 'Dưới đáy, tám cánh tay quấn quanh ngọn tháp chìm. Oktavor không muốn buông ra.'"),
 ("The tunnel shakes: Gravemaw is coming up through the rock.', 'Shorty không kịp trả lời. Đường hầm rung chuyển: Gravemaw đang trồi lên",
  "The tunnel shakes: Vorgrub is coming up through the rock.', 'Shorty không kịp trả lời. Đường hầm rung chuyển: Vorgrub đang trồi lên"),
 ("The old miners ran from here, because of Gravemaw.', vi: 'ĐƯỜNG HẦM SÂU. Con đường cuối cùng tới Thành Trì đi dưới lòng đất. Thợ mỏ xưa bỏ chạy khỏi đây, vì Gravemaw.'",
  "The old miners ran from here, because of Vorgrub.', vi: 'ĐƯỜNG HẦM SÂU. Con đường cuối cùng tới Thành Trì đi dưới lòng đất. Thợ mỏ xưa bỏ chạy khỏi đây, vì Vorgrub.'"),
]
for a, b in T: rep(a, b)

# ---------- comments that named a boss ----------
for a, b in [
 ("// the Kraken sweeps its tentacles across the cavern", "// Oktavor sweeps its tentacles across the cavern"),
 ("// Ignarok's shadow over the lava", "// Ignarok's shadow over the lava (the grown-up Ignar)"),
 ("// the Spore Queen opens her eyes", "// Morvella opens her eyes"),
 ("// ?boss=7|8|9 jumps straight into the Spore Queen / Kraken / Gravemaw fight", "// ?boss=7|8|9 jumps straight into the Morvella / Oktavor / Vorgrub fight"),
 ("opBurst(VW / 2, gy - 60, 27.8, t, 16, 9, 20, 1.2, ['#3a3454', '#5a5478'], 160);   // dust falls as the Golem wakes", "opBurst(VW / 2, gy - 60, 27.8, t, 16, 9, 20, 1.2, ['#3a3454', '#5a5478'], 160);   // dust falls as Prismor wakes"),
 ("g.stroke();   // the Pharaoh, begging", "g.stroke();   // Khepsar, begging"),
 ("// Mr Sy watches from a ledge", "// Sy watches from a ledge"),
 ("// a green glint in the dark: Mr Sy", "// a green glint in the dark: Sy"),
]: rep(a, b)
io.open(p, 'w', encoding='utf-8').write(s)

# ---------- comments in the other source files ----------
for f, pairs in {
 'src/art.js': [("// 0 King Slime", "// 0 Gulgor"), ("// 1 Spider Queen", "// 1 Veylith"), ("// 2 Crystal Golem", "// 2 Prismor"), ("// 3 Sand Pharaoh", "// 3 Khepsar"),
                ("// 4 Frost King", "// 4 Rimvald"), ("// 5 Magma Titan", "// 5 Kaldrok"), ("// 6 The Eclipse", "// 6 Quoc, King of the Eclipse (not used in the fight: map 10 uses Quoc's 8 forms)"),
                ("// 7 Spore Queen:", "// 7 Morvella:"), ("// 8 Abyssal Kraken:", "// 8 Oktavor:"), ("// 9 Gravemaw the Great Worm:", "// 9 Vorgrub:"),
                ("// the artist's pictures of the Spore Queen, Kraken and Gravemaw", "// the artist's pictures of Morvella, Oktavor and Vorgrub")],
 'src/audio.js': [("7 Spore Queen (wet hiss + gurgle), 8 Kraken (abyssal growl + bubbles), 9 Gravemaw (grinding rumble + screech)", "7 Morvella (wet hiss + gurgle), 8 Oktavor (abyssal growl + bubbles), 9 Vorgrub (grinding rumble + screech)")],
 'src/quocimg.js': [("// the Spore Queen, the Kraken and Gravemaw from the artist's sheet", "// Morvella, Oktavor and Vorgrub from the artist's sheet")],
 'src/scenery.js': [("// ---- the giant forest before the Spore Queen ----", "// ---- the giant forest before Morvella ----")],
 'src/levels.js': [("swim down through six zones to the Kraken ============", "swim down through six zones to Oktavor ============"), ("// the Kraken's cavern", "// Oktavor's cavern"),
                   ("ending at the Spore Queen's glade", "ending at Morvella's glade")],
}.items():
    t = io.open(f, encoding='utf-8').read()
    for a, b in pairs:
        assert t.count(a) == 1, (f, a)
        t = t.replace(a, b)
    io.open(f, 'w', encoding='utf-8').write(t)
print('ok')
# (applied afterwards: the card sits at y 110 so its second line stays above the item bar; the young dragon speaks
# with the dragon's voice: audio.js blip maps 'dragon_young' to 'dragon')
# (and: the Vietnamese 'Quoc drags you into...' message now spells Quốc)
# (applied afterwards, by hand: the co-op desert line names Khepsar; comments say Sy / Oktavor instead of Mr Sy / the
# Kraken; README gets the new names and a "Names (phase 2B)" table)
