# The approved key map: no duplicate keys, and no key doing two jobs.
# Keyboard: W / Up no longer jump (pressing up to climb a vine used to make you let go, and aiming up made you jump);
#   P (= Esc), I (= B), 0 (= first charged skill) and Enter as "talk" are gone. Two layouts remain:
#   WASD + Space / J / K / L (+ mouse, Shift dash), or arrows + Z / X / C; both share Q E R F T, 1-4, B, Esc, M, F11.
# Gamepad: Y talks (RB did both talk and the hero skill), RB is only the hero skill, LB guards (was L3, hard to press
#   while moving), RT throws (was a second dash button), L3 switches the throwing item (was LB).
# In water, Up still strokes upwards (it used to, because Up was a jump key).
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:110]
    s = s.replace(a, b)

rep("""    act.jump = any(keys, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gb.a;
    act.jumpP = any(pressed, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gpP('a');""",
    """    act.jump = any(keys, ['Space', 'KeyZ']) || gb.a;   // (Up / W are only "up": climb, aim, swim)
    act.jumpP = any(pressed, ['Space', 'KeyZ']) || gpP('a');""")
rep("""    act.throwP = any(pressed, ['KeyL']) || gpP('y'); act.swapP = any(pressed, ['KeyQ']) || gpP('lb');
    act.dashP = any(pressed, ['KeyK', 'KeyC', 'ShiftLeft', 'ShiftRight']) || gpP('b') || gpP('rt');
    act.pauseP = pressed.Escape || pressed.KeyP || gpP('start');""",
    """    act.throwP = any(pressed, ['KeyL']) || gpP('rt'); act.swapP = any(pressed, ['KeyQ']) || gpP('l3');
    act.dashP = any(pressed, ['KeyK', 'KeyC', 'ShiftLeft', 'ShiftRight']) || gpP('b');
    act.pauseP = pressed.Escape || gpP('start');""")
rep("""    act.talkP = pressed.KeyE || pressed.Enter || gpP('rb');
    act.skillP = any(pressed, ['KeyR']) || gpP('rb');
    act.shopP = any(pressed, ['KeyB', 'KeyI']) || gpP('back');
    act.sumP = any(pressed, ['Digit0']) || gpP('r3');   // touch star / gamepad R3: the first charged skill""",
    """    act.talkP = pressed.KeyE || gpP('y');
    act.skillP = any(pressed, ['KeyR']) || gpP('rb');
    act.shopP = any(pressed, ['KeyB']) || gpP('back');
    act.sumP = pressed.TouchSum || gpP('r3');   // touch star / gamepad R3: the first charged skill""")
rep("""    act.parryP = any(pressed, ['KeyF']) || gpP('l3');""", """    act.parryP = any(pressed, ['KeyF']) || gpP('lb');""")
# the touch star button gets a key of its own (0 is no longer a keyboard key)
rep("k: 'Digit0'", "k: 'TouchSum'")
# swimming: Up still strokes upwards
rep("if (wetP(P)) { if (act.jumpP && P.dash <= 0) {", "if (wetP(P)) { if ((act.jumpP || act.upP) && P.dash <= 0) {")
# the talk prompt above people
rep("talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },", "talk: { en: 'E: Talk', vi: 'E: Nói chuyện' },")

# ---------- the controls guide ----------
rep("""    ['Jump (press again in the air: double jump)', 'Nhảy (nhấn thêm trên không: nhảy đôi)', 'Space / W / ↑ / Z', 'A'],
    ['Dash (nothing can hit you mid-dash)', 'Lướt (không bị đánh trúng khi lướt)', 'K / Shift / C', 'B / RT'],""",
    """    ['Jump (press again in the air: double jump)', 'Nhảy (nhấn thêm trên không: nhảy đôi)', 'Space / Z', 'A'],
    ['Dash (nothing can hit you mid-dash)', 'Lướt (không bị đánh trúng khi lướt)', 'K / Shift / C', 'B'],""")
rep("""    ['Up / down: climb vines, aim, drop through thin floors', 'Lên / xuống: leo dây, ngắm, xuống ván mỏng', 'W S  /  ↑ ↓', ['Left stick', 'Cần trái']],""",
    """    ['Up / down: climb vines, aim, swim, drop through thin floors', 'Lên / xuống: leo dây, ngắm, bơi, xuống ván mỏng', 'W S  /  ↑ ↓', ['Left stick', 'Cần trái']],""")
rep("""    ['Guard (block a hit)', 'Đỡ đòn', 'F', ['L3 (press left stick)', 'L3 (bấm cần trái)']],""", """    ['Guard (block a hit)', 'Đỡ đòn', 'F', 'LB'],""")
rep("""    ['Charged skills (slots 1-4)', 'Chiêu tích lũy (ô 1-4)', ['1 2 3 4   (0: first ready one)', '1 2 3 4   (0: chiêu sẵn đầu tiên)'], ['R3 (first ready one)', 'R3 (chiêu sẵn đầu)']],""",
    """    ['Charged skills (slots 1-4)', 'Chiêu tích lũy (ô 1-4)', '1 2 3 4', ['R3 (first ready one)', 'R3 (chiêu sẵn đầu)']],""")
rep("""    ['Throw an item', 'Ném đồ', ['L / right click', 'L / chuột phải'], 'Y'],
    ['Next throwing item', 'Đổi đồ ném', ['Q / mouse wheel', 'Q / lăn chuột'], 'LB'],""",
    """    ['Throw an item', 'Ném đồ', ['L / right click', 'L / chuột phải'], 'RT'],
    ['Next throwing item', 'Đổi đồ ném', ['Q / mouse wheel', 'Q / lăn chuột'], ['L3 (press left stick)', 'L3 (bấm cần trái)']],""")
rep("""    ['Talk / use (people, levers, signs)', 'Nói chuyện / dùng (người, cần gạt, bảng)', 'E / Enter', 'RB'],
    ['Shop & bag', 'Cửa hàng & túi đồ', 'B / I', 'Back'],
    ['Pause menu', 'Tạm dừng', 'Esc / P', 'Start'],""",
    """    ['Talk / use (people, levers, signs)', 'Nói chuyện / dùng (người, cần gạt, bảng)', 'E', 'Y'],
    ['Shop & bag', 'Cửa hàng & túi đồ', 'B', 'Back'],
    ['Pause menu', 'Tạm dừng', 'Esc', 'Start'],""")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------- README: the controls table ----------
p = 'README.md'
s = io.open(p, encoding='utf-8').read()
a0 = s.index('| Action | Keyboard | Gamepad |'); a1 = s.index('## Content')
s = s[:a0] + """Two keyboard layouts: **WASD + Space / J / K / L** (or the mouse), or **arrows + Z / X / C**. Both share Q E R F T, 1-4, B, Esc.
The in-game guide (title menu or pause menu > Controls) shows the same list.

| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A / D or ← / → | D-pad / left stick |
| Up / down (climb vines, aim, swim, drop through thin floors) | W / S or ↑ / ↓ | left stick |
| Jump (press again in the air: double jump) | Space / Z | A |
| Attack (↓ + attack in the air = pogo bounce) | J / X / left click | X |
| Dash | K / Shift / C | B |
| Guard | F | LB |
| Hero skill | R | RB |
| Charged skills (slots 1-4) | 1 / 2 / 3 / 4 | R3 (first ready one) |
| Throw item | L / right click | RT |
| Next throwing item | Q / mouse wheel | L3 |
| Swap weapon | T / middle click | LT |
| Talk / use lever, torch, tablet | E | Y |
| Shop & bag | B | Back |
| Pause | Esc | Start |
| Menus: choose / go back | Enter, Space, Z, J / Esc | A / B |
| Mute / Fullscreen | M / F11 | |

""" + s[a1:]
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')

# ---------- README: the other lines that name a changed key ----------
p = 'README.md'
s = io.open(p, encoding='utf-8').read()
for a, b in [
    ("- Press **B** (or I / gamepad Back) during a level", "- Press **B** (gamepad Back) during a level"),
    ("press **T** (gamepad right-stick click) to summon a giant for 7 seconds - ", "a charged skill: land 22 hits, then press the item's slot key (**1** or **2** for a weapon, **3** for the armor; gamepad R3) to summon a giant for up to 30 seconds - "),
    (" Each rests 60 s (shown top right).", ""),
    ("- Dash (K / C / Shift, gamepad B or RT, touch »)", "- Dash (K / C / Shift, gamepad B, touch »)"),
    ("- Parry (F, gamepad L3, touch ◆)", "- Parry (F, gamepad LB, touch ◆)"),
]:
    assert s.count(a) == 1, a
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('readme ok')
# (applied afterwards: the guide's "up / down" row was shortened, the English one ran into the keyboard column)
