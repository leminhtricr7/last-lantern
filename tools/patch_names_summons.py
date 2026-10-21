# Phase 2B (summons): new names for the 10 Divine swords, 5 Divine armours and 5 pets, and for the beings they call.
# Each item and its being share a word (Earthvein Greatsword -> Earthvein Colossus). The pebble pet now has a big form
# with its own name (it still borrows the colossus art until phase 3). Stats and skills are unchanged.
import io
def edit(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, s.count(a), a[:110])
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)
def N(en, vi): return "name: { en: '%s', vi: '%s' }" % (en.replace("'", "\\'"), vi.replace("'", "\\'"))

# ---------- the beings ----------
edit('src/game.js', [
 ("name: { en: 'Stone Titan', vi: 'Titan Đá' }", N('Earthvein Colossus', 'Khổng Lồ Mạch Đất')),
 ("name: { en: 'Storm God', vi: 'Thần Bão' }", N('Thunderpeal Lord', 'Chúa Sấm Rền')),
 ("name: { en: 'Sea Goddess', vi: 'Nữ Thần Biển' }", N('Tidecrest Maiden', 'Nàng Triều Dâng')),
 ("name: { en: 'Moon Goddess', vi: 'Nữ Thần Mặt Trăng' }", N('Paleglow Lady', 'Nàng Trăng Bạc')),
 ("name: { en: 'Frost Giant', vi: 'Người Khổng Lồ Băng' }", N('Glacierfang Giant', 'Khổng Lồ Băng Hà')),
 ("name: { en: 'Sun Emperor', vi: 'Hoàng Đế Mặt Trời' }", N('Emperor of the Old Sun', 'Hoàng Đế Mặt Trời Xưa')),
 ("name: { en: 'Shadow Shogun', vi: 'Tướng Quân Bóng Tối' }", N('Unshadowed General', 'Tướng Quân Vô Ảnh')),
 ("name: { en: 'Ancient Treant', vi: 'Cây Cổ Thụ' }", N('Old Rootheart', 'Ông Cây Rễ Cổ')),
 ("name: { en: 'Golden Guardian', vi: 'Thần Hộ Vệ Vàng' }", N('Dawnward Warden', 'Hộ Vệ Rạng Đông')),
 ("name: { en: 'Valkyrie', vi: 'Valkyrie' }", N('Starspear Maiden', 'Chiến Nữ Giáo Sao')),
 ("name: { en: 'Archangel', vi: 'Tổng Lãnh Thiên Thần' }", N('Aureole Herald', 'Sứ Giả Hào Quang')),
 ("name: { en: 'Stone Golems', vi: 'Người Đá' }", N('Gateguard Twins', 'Cặp Đá Canh Cổng')),
 ("name: { en: 'Great Phoenix', vi: 'Phượng Hoàng' }", N('Relit Phoenix', 'Phượng Hoàng Hồi Sinh')),
 ("name: { en: 'Golden Dragon Emperor', vi: 'Hoàng Đế Rồng Vàng' }", N('Elder Goldscale', 'Rồng Vàng Cổ Đại')),
 ("name: { en: 'Great Dragon', vi: 'Rồng Lớn' }", N('Coalheart Drake', 'Rồng Lửa Than Hồng')),
 ("name: { en: 'Thunder Kirin', vi: 'Kỳ Lân Sấm' }", N('Boltmane Qilin', 'Kỳ Lân Tia Chớp')),
 ("name: { en: 'Sky Whale', vi: 'Cá Voi Trời' }", N('Lightwhale', 'Cá Voi Ánh Sáng')),
 ("name: { en: 'Nine-Tailed Fox', vi: 'Cửu Vĩ Hồ' }", N('Azure Vixen', 'Hồ Ly Lửa Xanh')),
 ("name: { en: 'Shadow Copies', vi: 'Bản Sao Bóng Tối' }", N('Shadow Trio', 'Ba Bóng Vọng')),
 # gun skills that call beings say their names
 ("pops(sv('GREAT DRAGON', 'RỒNG LỚN'), '#ff7a2a');", "pops(sumName('dragonform').toUpperCase(), '#ff7a2a');"),
 ("pops(sv('DRAGON EMPEROR', 'HOÀNG ĐẾ RỒNG'), '#ffd34e');", "pops(sumName('dragonking').toUpperCase(), '#ffd34e');"),
 ("pops(sv('ARCHANGEL', 'THIÊN THẦN'), '#fff6c0');", "pops(sumName('angel').toUpperCase(), '#fff6c0');"),
 ("pops(sv('SUN EMPEROR', 'HOÀNG ĐẾ MẶT TRỜI'), '#ffe08a');", "pops(sumName('sunemperor').toUpperCase(), '#ffe08a');"),
 # a pet's big form can carry its own name (the pebble pet borrows the colossus art)
 ("    if (it.st.form) return sv('Transform: ', 'Biến hình: ') + sumName(it.st.form);", "    if (it.st.form) return sv('Transform: ', 'Biến hình: ') + (it.st.formName ? LN(it.st.formName) : sumName(it.st.form));"),
 ("    if (st.form) { petMorph(P, st.form); return; }", "    if (st.form) { petMorph(P, st.form, st.formName); return; }"),
 ("  function petMorph(P, kind) {\n    const G = Q.G; G.morph = { t: 0, dur: 3, kind, owner: P };", "  function petMorph(P, kind, label) {\n    const G = Q.G; G.morph = { t: 0, dur: 3, kind, owner: P, label };"),
 ("  function spawnSummon(kind, life, owner, evo, from) {", "  function spawnSummon(kind, life, owner, evo, from, label) {"),
 ("    pop(o.x + 4, o.y - 26, sumName(kind) + '!', glow);", "    pop(o.x + 4, o.y - 26, (label ? LN(label) : sumName(kind)) + '!', glow);"),
 ("  // ===================== DIVINE SUMMONS (swords, armors, pet forms): giants and beasts that fight for 7 seconds =====================",
  "  // ===================== DIVINE SUMMONS (swords, armors, pet forms): giants and beasts that fight beside you =====================")])
# the finished morph passes the label on to the summon
s = io.open('src/game.js', encoding='utf-8').read()
i = s.index('    if (m.t >= m.dur) { G.morph = null;'); j = s.index('\n', i); line = s[i:j]
k = line.index('spawnSummon(m.kind, 30, m.owner, true, '); depth = 0; e = k + len('spawnSummon(')
while True:   # find the call's closing parenthesis
    ch = line[e]
    if ch in '({[': depth += 1
    elif ch in ')}]':
        if depth == 0: break
        depth -= 1
    e += 1
line2 = line[:e] + ', m.label' + line[e:]
assert line2.count('m.label') == 1
s = s[:i] + line2 + s[j:]
io.open('src/game.js', 'w', encoding='utf-8').write(s)

# ---------- the items ----------
P = []
def item(row_start, old_names, new_names, descs):
    P.append((row_start + old_names, row_start + new_names))
    for a, b in descs: P.append((a, b))
item("['gaiablade', 16, ", "\"Gaia's Greatsword\", 'Đại Kiếm Gaia'", "'Earthvein Greatsword', 'Đại Kiếm Mạch Đất'",
     [("a Stone Titan rises and shakes the earth", "the Earthvein Colossus rises and shakes the earth"), ("Titan Đá trồi lên, dậm rung đất", "Khổng Lồ Mạch Đất trồi lên, dậm rung đất")])
item("['skytyrant', 16, ", "'Sky Tyrant', 'Bạo Chúa Bầu Trời'", "'Thunderpeal', 'Kiếm Sấm Rền'",
     [("the Storm God calls lightning down", "the Thunderpeal Lord calls lightning down"), ("Thần Bão gọi sét đánh xuống", "Chúa Sấm Rền gọi sét đánh xuống")])
item("['tidecaller', 17, ", "'Tidecaller', 'Kiếm Gọi Thủy Triều'", "'Tidecrest Blade', 'Kiếm Triều Dâng'",
     [("the Sea Goddess sends huge waves", "the Tidecrest Maiden sends huge waves"), ("Nữ Thần Biển đưa những con sóng", "Nàng Triều Dâng đưa những con sóng")])
item("['phoenixlord', 17, ", "'Phoenix Lord', 'Chúa Tể Phượng Hoàng'", "'Pyreplume', 'Kiếm Lông Lửa'",
     [("a giant Phoenix sweeps the sky raining fire", "the Relit Phoenix sweeps the sky raining fire"), ("Phượng Hoàng khổng lồ lượn trên trời", "Phượng Hoàng Hồi Sinh lượn trên trời")])
item("['lunarblade', 18, ", "'Lunar Edge', 'Kiếm Nguyệt Thần'", "'Paleglow Edge', 'Kiếm Trăng Bạc'",
     [("the Moon Goddess pierces enemies", "the Paleglow Lady pierces enemies"), ("Nữ Thần Mặt Trăng xuyên thủng", "Nàng Trăng Bạc xuyên thủng")])
item("['dragonemperor', 18, ", "'Dragon Emperor', 'Hoàng Đế Rồng'", "'Goldscale Blade', 'Kiếm Vảy Vàng'",
     [("the Golden Dragon Emperor breathes fire on the boss", "the Elder Goldscale breathes fire on the boss"), ("Hoàng Đế Rồng Vàng phun lửa vào boss", "Rồng Vàng Cổ Đại phun lửa vào boss")])
item("['jotunn', 19, ", "\"Jotunn's Fang\", 'Nanh Người Khổng Lồ Băng'", "'Glacierfang', 'Nanh Băng Hà'",
     [("a Frost Giant freezes every enemy", "the Glacierfang Giant freezes every enemy"), ("Người Khổng Lồ Băng đóng băng mọi kẻ địch", "Khổng Lồ Băng Hà đóng băng mọi kẻ địch")])
item("['solaris', 19, ", "'Solaris', 'Kiếm Thái Dương'", "'Lost Sun Blade', 'Kiếm Mặt Trời Đã Mất'",
     [("the Sun Emperor fires a colossal solar beam", "the Emperor of the Old Sun fires a colossal sunbeam"), ("Hoàng Đế Mặt Trời bắn một tia nắng khổng lồ", "Hoàng Đế Mặt Trời Xưa bắn một tia nắng khổng lồ")])
item("['oblivion', 20, ", "'Oblivion Katana', 'Katana Hư Vô'", "'Unshadowed Katana', 'Katana Vô Ảnh'",
     [("a giant Shadow Shogun slashes across the whole screen", "the giant Unshadowed General slashes across the whole screen"), ("Tướng Quân Bóng Tối khổng lồ chém ngang", "Tướng Quân Vô Ảnh khổng lồ chém ngang")])
item("['yggdrasil', 20, ", "'World Tree Blade', 'Kiếm Cây Thế Giới'", "'Rootheart Blade', 'Kiếm Rễ Cổ'",
     [("the Ancient Treant traps enemies in roots", "Old Rootheart traps enemies in roots"), ("Cây Cổ Thụ trói kẻ địch bằng rễ", "Ông Cây Rễ Cổ trói kẻ địch bằng rễ")])
item("['aegisarmor', 16, ", "'Aegis of Dawn', 'Khiên Giáp Bình Minh'", "'Dawnward Plate', 'Giáp Rạng Đông'",
     [("a golden guardian shields you", "the Dawnward Warden shields you"), ("thần hộ vệ vàng che chắn", "Hộ Vệ Rạng Đông che chắn")])
item("['valkyrie', 17, ", "'Valkyrie Plate', 'Giáp Valkyrie'", "'Starspear Plate', 'Giáp Giáo Sao'",
     [("a Valkyrie hurls spears of light", "the Starspear Maiden hurls spears of light"), ("Valkyrie ném giáo ánh sáng", "Chiến Nữ Giáo Sao ném giáo ánh sáng")])
item("['shadowveil', 18, ", "'Shadow Veil', 'Áo Choàng Bóng Đêm'", "'Cloak of Three Shadows', 'Áo Choàng Ba Bóng'",
     [("three shadow copies of you attack", "the Shadow Trio, three shadows shaped like you, attack"), ("ba bản sao bóng tối của bạn tấn công", "Ba Bóng Vọng, ba cái bóng mang hình dạng của bạn, tấn công")])
item("['seraphim', 19, ", "'Seraphim Robe', 'Áo Thiên Thần Tối Cao'", "'Aureole Robe', 'Áo Hào Quang'",
     [("an archangel heals you and smites enemies", "the Aureole Herald heals you and smites enemies"), ("tổng lãnh thiên thần hồi máu và trừng phạt", "Sứ Giả Hào Quang hồi máu và trừng phạt")])
item("['titanplate', 20, ", "'Titan Plate', 'Giáp Titan'", "'Twinmount Plate', 'Giáp Núi Đôi'",
     [("two stone golems pound your enemies", "the Gateguard Twins pound your enemies"), ("hai người đá đấm nát kẻ địch", "Cặp Đá Canh Cổng đấm nát kẻ địch")])
item("['wyrmling', 16, ", "'Little Wyrmling', 'Rồng Con'", "'Coalpup', 'Rồng Than Hồng'",
     [("it grows into a great dragon and fights with you!", "it grows into the Coalheart Drake and fights with you!"), ("hóa thành rồng lớn và chiến đấu cùng bạn!", "hóa thành Rồng Lửa Than Hồng và chiến đấu cùng bạn!")])
item("['kirin', 17, ", "'Baby Kirin', 'Kỳ Lân Con'", "'Qilin Foal', 'Kỳ Lân Con'",
     [("it becomes a Thunder Kirin.", "it becomes the Boltmane Qilin."), ("hóa thành Kỳ Lân Sấm.", "hóa thành Kỳ Lân Tia Chớp.")])
item("['pebblegolem', 18, ", "'Pebble Golem', 'Người Đá Tí Hon'", "'Cobblekin', 'Đá Cuội Tí Hon'",
     [("it grows into a Stone Titan.', ", "it grows into the Cobble Colossus.', "), ("hóa thành Titan Đá.', { role: 'tank', red: 0.25, form: 'titan' }", "hóa thành Khổng Lồ Đá Cuội.', { role: 'tank', red: 0.25, form: 'titan', formName: { en: 'Cobble Colossus', vi: 'Khổng Lồ Đá Cuội' } }")])
item("['starwhale', 19, ", "'Star Whale', 'Cá Voi Sao'", "'Starfin Calf', 'Cá Voi Sao'",
     [("it becomes a Sky Whale raining comets.", "it becomes the Lightwhale raining comets."), ("hóa thành Cá Voi Trời trút mưa sao chổi.", "hóa thành Cá Voi Ánh Sáng trút mưa sao chổi.")])
item("['kitsune', 20, ", "'Kitsune Kit', 'Hồ Ly Chín Đuôi Con'", "'Azure Kit', 'Cáo Lửa Xanh Con'",
     [("it becomes the Nine-Tailed Fox.", "it becomes the Azure Vixen."), ("hóa thành Cửu Vĩ Hồ.", "hóa thành Hồ Ly Lửa Xanh.")])
# guns that call beings
P.append(("SKILL: every 5th shot calls a Great Dragon for 5s; every 14th calls the Golden Dragon Emperor.", "SKILL: every 5th shot calls the Coalheart Drake for 5s; every 14th calls the Elder Goldscale."))
P.append(("cứ 5 phát gọi Rồng Lớn 5 giây; cứ 14 phát gọi Hoàng Đế Rồng Vàng.", "cứ 5 phát gọi Rồng Lửa Than Hồng 5 giây; cứ 14 phát gọi Rồng Vàng Cổ Đại."))
P.append(("every 6th shot summons an Archangel; every 15th the Sun Emperor;", "every 6th shot summons the Aureole Herald; every 15th the Emperor of the Old Sun;"))
edit('src/items.js', P)
# the last gun text: its Vietnamese half
s = io.open('src/items.js', encoding='utf-8').read()
a = "cứ 6 phát triệu hồi Tổng Lãnh Thiên Thần"; assert s.count(a) == 1, a
s = s.replace(a, "cứ 6 phát triệu hồi Sứ Giả Hào Quang")
i = s.index("cứ 6 phát triệu hồi Sứ Giả Hào Quang"); j = s.index("\n", i); seg = s[i:j]
assert seg.count('Hoàng Đế Mặt Trời') == 1, seg[:200]
s = s[:i] + seg.replace('Hoàng Đế Mặt Trời', 'Hoàng Đế Mặt Trời Xưa') + s[j:]
io.open('src/items.js', 'w', encoding='utf-8').write(s)

# the summon art folder's notes
edit('assets/summons/README.md', [("Kinds: titan, stormgod,", "Kinds (internal keys; the names shown in the game are in src/game.js GIANT / BEAST): titan, stormgod,")])
print('ok')
