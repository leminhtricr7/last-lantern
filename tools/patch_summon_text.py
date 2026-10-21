# Summon item texts: they still said "Press T" (T now swaps weapons) and promised "7 s" summons that "rest 60 s".
# In the game a summon is a charged skill: land 22 hits, then press the item's slot key (1 or 2 for a weapon, 3 for
# the armor, 4 for the pet; R3 on a gamepad uses the first ready one). The texts now say that.
import io, re
p = 'src/items.js'
s = io.open(p, encoding='utf-8').read()
lines = s.split('\n')
SW = ['gaiablade', 'skytyrant', 'tidecaller', 'phoenixlord', 'lunarblade', 'dragonemperor', 'jotunn', 'solaris', 'oblivion', 'yggdrasil']
AR = ['aegisarmor', 'valkyrie', 'shadowveil', 'seraphim', 'titanplate']
PET = ['wyrmling', 'kirin', 'pebblegolem', 'starwhale', 'kitsune']
done = set()
for i, ln in enumerate(lines):
    m = re.match(r"\s*\['([a-z]+)',", ln)
    if not m: continue
    k = m.group(1)
    if k in SW or k in AR:
        key_en, key_vi = ('1 or 2', '1 hoặc 2') if k in SW else ('3', '3')
        ln = ln.replace('Press T: ', 'Charged skill (land 22 hits, then press %s / R3): ' % key_en)
        ln = ln.replace('Nhấn T: ', 'Chiêu tích lũy (đánh trúng 22 lần, rồi bấm %s / R3): ' % key_vi)
        ln = ln.replace(' rises for 7s and ', ' rises and ').replace(' trồi lên 7 giây,', ' trồi lên,')
        ln = ln.replace(' Rests 60s.', '').replace(' Hồi 60 giây.', '').replace(' for 7s.', '.').replace(' trong 7 giây.', '.')
        done.add(k)
    elif k in PET:
        ln = re.sub(r"Every 60s it (grows into|becomes) (.*?) for 7s", r"Charged skill (land 22 hits, then press 4 / R3): it \1 \2", ln)
        ln = re.sub(r"Cứ 60 giây (nó )?hóa thành (.*?) trong 7 giây", r"Chiêu tích lũy (đánh trúng 22 lần, rồi bấm 4 / R3): hóa thành \2", ln)
        done.add(k)
    lines[i] = ln
assert done == set(SW + AR + PET), sorted(set(SW + AR + PET) - done)
s = '\n'.join(lines)
for bad in ['Press T', 'Nhấn T', '7s', '7 giây', '60s', '60 giây']:
    for k in SW + AR + PET:
        row = [l for l in s.split('\n') if l.strip().startswith("['" + k + "',")][0]
        assert bad not in row, (k, bad)
io.open(p, 'w', encoding='utf-8').write(s)

# the old "summon with T" message (castSummons is no longer called by any key, but keep its text right)
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
a = "sv('Equip a Divine sword or armor to summon (T).', 'Trang bị kiếm hoặc giáp Thần cấp để triệu hồi (T).')"
assert s.count(a) == 1
s = s.replace(a, "sv('Equip a Divine sword or armor to summon (keys 1-3).', 'Trang bị kiếm hoặc giáp Thần cấp để triệu hồi (phím 1-3).')")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
