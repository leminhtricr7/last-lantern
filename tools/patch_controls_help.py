# The controls guide: a panel that lists every button and what it does (keyboard / mouse and gamepad), opened from
# the title menu ("Controls") and the pause menu, and shown once by itself the first time you get to control a hero.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:110]
    s = s.replace(a, b)

# ---------- the panel itself ----------
rep("""  function titleItems() {""", """  // ---------- the controls guide: what every button does (title menu, pause menu, and once on the first play) ----------
  // rows: a group title ['g', en, vi, colour] or [action en, action vi, keyboard / mouse, gamepad] (a key text can be [en, vi])
  const CTRL = [
    ['g', 'MOVE', 'DI CHUYỂN', '#8ad8ff'],
    ['Walk left / right', 'Đi trái / phải', 'A D  /  ← →', ['Left stick / D-pad', 'Cần trái / D-pad']],
    ['Jump', 'Nhảy', 'Space / W / ↑ / Z', 'A'],
    ['Dash (nothing can hit you mid-dash)', 'Lướt (không bị đánh trúng khi lướt)', 'K / Shift / C', 'B / RT'],
    ['Up / down: climb vines, aim, drop through thin floors', 'Lên / xuống: leo dây, ngắm, xuống ván mỏng', 'W S  /  ↑ ↓', ['Left stick', 'Cần trái']],
    ['g', 'FIGHT', 'CHIẾN ĐẤU', '#ff9a7a'],
    ['Attack (hold to keep firing a gun)', 'Đánh (giữ để bắn súng liên tục)', ['J / X / left click', 'J / X / chuột trái'], 'X'],
    ['Guard (block a hit)', 'Đỡ đòn', 'F', ['L3 (press left stick)', 'L3 (bấm cần trái)']],
    ['Hero skill', 'Chiêu anh hùng', 'R', 'RB'],
    ['Charged skills (slots 1-4)', 'Chiêu tích lũy (ô 1-4)', ['1 2 3 4   (0: first ready one)', '1 2 3 4   (0: chiêu sẵn đầu tiên)'], ['R3 (first ready one)', 'R3 (chiêu sẵn đầu)']],
    ['Throw an item', 'Ném đồ', ['L / right click', 'L / chuột phải'], 'Y'],
    ['Next throwing item', 'Đổi đồ ném', ['Q / mouse wheel', 'Q / lăn chuột'], 'LB'],
    ['Swap weapon', 'Đổi vũ khí', ['T / middle click', 'T / chuột giữa'], 'LT'],
    ['g', 'OTHER', 'KHÁC', '#c8a0ff'],
    ['Talk / use (people, levers, signs)', 'Nói chuyện / dùng (người, cần gạt, bảng)', 'E / Enter', 'RB'],
    ['Shop & bag', 'Cửa hàng & túi đồ', 'B / I', 'Back'],
    ['Pause menu', 'Tạm dừng', 'Esc / P', 'Start'],
    ['Sound on / off  ·  fullscreen', 'Tắt / bật tiếng  ·  toàn màn hình', 'M  ·  F11', '-'],
    ['Menus: choose / go back', 'Menu: chọn / quay lại', 'Enter Space Z J  /  Esc', 'A / B']
  ];
  function openHelp(first) { ctrlHelp = { first: !!first, t: 0 }; Snd.play('select'); }
  function updateHelp(dt) {
    ctrlHelp.t += dt;
    if (ctrlHelp.t > 0.4 && (act.okP || act.backP || act.pauseP || act.talkP)) { if (ctrlHelp.first) { save.ctrlSeen = true; writeSave(); } ctrlHelp = null; Snd.play('ok'); }
  }
  function drawHelp() {
    texts.length = 0; uiCov = [];   // the panel covers the whole screen: nothing from behind shows through
    g.fillStyle = 'rgba(4,3,12,.94)'; g.fillRect(0, 0, VW, VH);
    const X = 6, Y = 4, W = VW - 12, H = VH - 8, kv = v => Array.isArray(v) ? sv(v[0], v[1]) : v;
    { const gr = g.createLinearGradient(0, Y, 0, Y + H); gr.addColorStop(0, 'rgba(30,24,54,.98)'); gr.addColorStop(1, 'rgba(10,8,22,.98)'); g.fillStyle = gr; g.fillRect(X, Y, W, H); }
    g.fillStyle = '#c89a1c'; g.fillRect(X, Y, W, 1); g.fillRect(X, Y + H - 1, W, 1); g.fillRect(X, Y, 1, H); g.fillRect(X + W - 1, Y, 1, H);
    txt(sv('CONTROLS', 'HƯỚNG DẪN NÚT'), VW / 2, Y + 9, { al: 'center', size: 10, bold: true, col: '#ffd34e' });
    const c1 = X + 10, c2 = X + 170, c3 = X + 294; let y = Y + 22;
    txt(sv('What it does', 'Làm gì'), c1, y, { size: 5.5, col: '#8892aa' }); txt(sv('Keyboard / mouse', 'Bàn phím / chuột'), c2, y, { size: 5.5, col: '#8892aa' }); txt(sv('Gamepad', 'Tay cầm'), c3, y, { size: 5.5, col: '#8892aa' });
    y += 8;
    for (const r of CTRL) {
      if (r[0] === 'g') { y += 2; txt(sv(r[1], r[2]), c1 - 3, y, { size: 6, bold: true, col: r[3] }); g.fillStyle = hexA(r[3], 0.3); g.fillRect(c1 + 46, Math.round(y), W - 66, 1); y += 8; continue; }
      txt(sv(r[0], r[1]), c1, y, { size: 6, col: '#e8ecf6' }); txt(kv(r[2]), c2, y, { size: 6, col: '#ffe9b8' }); txt(kv(r[3]), c3, y, { size: 6, col: '#9fe8ff' });
      y += 8;
    }
    const bl = Math.floor(ctrlHelp.t * 2) % 2 === 0;
    txt(ctrlHelp.first ? sv('You can open this again any time: Pause (Esc) > Controls.   Press Enter to play!', 'Mở lại lúc nào cũng được: Tạm dừng (Esc) > Hướng dẫn nút.   Nhấn Enter để chơi!')
      : sv('Enter / Esc / click: close', 'Enter / Esc / nhấp chuột: đóng'), VW / 2, Y + H - 7, { al: 'center', size: 5.5, col: bl || !ctrlHelp.first ? '#ffd34e' : '#c89a1c' });
  }
  function titleItems() {""")
rep("  let fadeIn = 0;\n  enterScene(", "  let fadeIn = 0, ctrlHelp = null;   // ctrlHelp: the controls guide, when it is open\n  enterScene(")

# ---------- step: the game waits behind the open guide, and the guide is drawn on top of everything ----------
rep("""      const n = Math.max(1, Math.ceil(dt / (1 / 100))), sub = dt / n;
      for (let i = 0; i < n; i++) {""", """      if (ctrlHelp) { updateHelp(dt); clearPressed(); }   // the controls guide is open: everything waits behind it
      else for (let i = 0, n = Math.max(1, Math.ceil(dt / (1 / 100))), sub = dt / n; i < n; i++) {""")
rep("""    hiOn = scene === 'play' && !!Q && Q.state === 'play' && !fadeTo && scale >= 2; HIQ.length = 0;""",
    """    hiOn = scene === 'play' && !!Q && Q.state === 'play' && !fadeTo && scale >= 2 && !ctrlHelp; HIQ.length = 0;""")
rep("""    if (f > 0 && !(hiOn && scene === 'play' && Q)) { g.globalAlpha = Math.min(1, f); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }""",
    """    if (f > 0 && !(hiOn && scene === 'play' && Q)) { g.globalAlpha = Math.min(1, f); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    if (ctrlHelp) drawHelp();""")
# a click anywhere closes the guide (and does nothing else)
rep("""    const inPlay = scene === 'play' && Q;
    if (e.type === 'pointermove') {""", """    const inPlay = scene === 'play' && Q;
    if (ctrlHelp) { if (e.type === 'pointerdown') pressed.Enter = true; return; }
    if (e.type === 'pointermove') {""")

# ---------- the first time you control a hero, the guide opens by itself ----------
rep("""    // play / bossintro
    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }""",
    """    // play / bossintro
    if (st === 'play' && !save.ctrlSeen && !coop) { openHelp(true); return; }   // first play: show the controls once
    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }""")

# ---------- title menu: "Controls" ----------
rep("""    it.push({ k: 'lang', fn: () => { save.lang = save.lang === 'vi' ? 'en' : 'vi'; writeSave(); } });""",
    """    it.push({ k: 'help', fn: () => openHelp(false) });
    it.push({ k: 'lang', fn: () => { save.lang = save.lang === 'vi' ? 'en' : 'vi'; writeSave(); } });""")
rep("movie: ['Intro film', 'Phim mở đầu'], quit: ['Quit', 'Thoát'] };", "movie: ['Intro film', 'Phim mở đầu'], help: ['Controls', 'Hướng dẫn nút'], quit: ['Quit', 'Thoát'] };")

# ---------- pause menu: a "Controls" row (the two volume rows move down one) ----------
rep("""      if (act.upP) { Q.menu = (Q.menu + 5) % 6; Snd.play('select'); } if (act.downP) { Q.menu = (Q.menu + 1) % 6; Snd.play('select'); }
      if (Q.menu >= 4 && (act.leftP || act.rightP || act.okP)) {   // volume rows: 0 % ... 100 % in steps of 10
        const key = Q.menu === 4 ? 'mvol' : 'svol',""", """      if (act.upP) { Q.menu = (Q.menu + 6) % 7; Snd.play('select'); } if (act.downP) { Q.menu = (Q.menu + 1) % 7; Snd.play('select'); }
      if (Q.menu >= 5 && (act.leftP || act.rightP || act.okP)) {   // volume rows: 0 % ... 100 % in steps of 10
        const key = Q.menu === 5 ? 'mvol' : 'svol',""")
rep("""        if (Q.menu === 0) Q.state = 'play'; else if (Q.menu === 1) startLevel(Q.li); else if (coop) coopBackToLobby();""",
    """        if (Q.menu === 0) Q.state = 'play'; else if (Q.menu === 1) startLevel(Q.li); else if (Q.menu === 4) openHelp(false); else if (coop) coopBackToLobby();""")
rep("""      ['resume', 'restart', 'tomap', 'totitle'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 76 + i * 14, { al: 'center', size: 9, col: Q.menu === i ? '#ffd34e' : '#cfd6e6' }));""",
    """      ['resume', 'restart', 'tomap', 'totitle'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 76 + i * 13, { al: 'center', size: 9, col: Q.menu === i ? '#ffd34e' : '#cfd6e6' }));
      txt((Q.menu === 4 ? '> ' : '  ') + sv('Controls', 'Hướng dẫn nút'), VW / 2, 76 + 4 * 13, { al: 'center', size: 8.5, col: Q.menu === 4 ? '#ffd34e' : '#9fe8ff' });""")
rep("""const i = 4 + j, on = Q.menu === i; txt((on ? '< ' : '  ') + n + ': ' + Math.round((v === undefined ? 1 : v) * 100) + '%' + (on ? ' >' : '  '), VW / 2, 76 + i * 14,""",
    """const i = 5 + j, on = Q.menu === i; txt((on ? '< ' : '  ') + n + ': ' + Math.round((v === undefined ? 1 : v) * 100) + '%' + (on ? ' >' : '  '), VW / 2, 76 + i * 13,""")
rep("if (st === 'pause') { const i = menuHit(gx, gy, 6, VW / 2, 76, 14, 80);", "if (st === 'pause') { const i = menuHit(gx, gy, 7, VW / 2, 76, 13, 80);")
rep("else if (inPlay && Q.state === 'pause') { const i = menuHit(gx, gy, 4, VW / 2, 88, 18, 80);", "else if (inPlay && Q.state === 'pause') { const i = menuHit(gx, gy, 7, VW / 2, 76, 13, 80);")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
# (applied afterwards: with 12 title buttons the rows sit 13 px apart instead of 15, so the box stays above the footer)
