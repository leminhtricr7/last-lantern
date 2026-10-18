import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- input: a card + 2-column grid, moved with all four arrows ----------
rep("""    const items = titleItems();
    if (act.upP) { titleSel = (titleSel + items.length - 1) % items.length; Snd.play('select'); }
    if (act.downP) { titleSel = (titleSel + 1) % items.length; Snd.play('select'); }
    if (act.okP) {
      Snd.play('ok'); items[titleSel].fn();
    }""", """    const items = titleItems(), L = titleLayout(items); titleSel = clamp(titleSel, 0, items.length - 1);
    if (title.confirmT > 0) title.confirmT -= dt;
    const go = (dx, dy) => {   // nearest button in that direction
      const c = L[titleSel]; let best = -1, bd = 1e9;
      L.forEach((r, i) => { if (i === titleSel) return; const ex = (r.x + r.w / 2) - (c.x + c.w / 2), ey = (r.y + r.h / 2) - (c.y + c.h / 2);
        if (dx && Math.sign(ex) !== dx || dy && Math.sign(ey) !== dy || (dx && Math.abs(ex) < 4) || (dy && Math.abs(ey) < 4)) return;
        const d = dx ? Math.abs(ex) + Math.abs(ey) * 3 : Math.abs(ey) + Math.abs(ex) * 0.6; if (d < bd) { bd = d; best = i; } });
      if (best < 0 && dy) best = dy > 0 ? 0 : L.length - 1;   // wrap top/bottom
      if (best >= 0 && best !== titleSel) { titleSel = best; Snd.play('select'); }
    };
    if (act.upP) go(0, -1); if (act.downP) go(0, 1); if (act.leftP) go(-1, 0); if (act.rightP) go(1, 0);
    if (act.okP) {
      const it = items[titleSel];
      if (it.k === 'newgame' && (save.cleared.length || save.resume) && !(title.confirmT > 0)) { title.confirmT = 3; Snd.play('zap'); return; }
      title.confirmT = 0; Snd.play('ok'); it.fn();
    }""")

# ---------- layout + drawing ----------
rep("""  function titleItems() {""", """  // title menu layout: the main action as a big card, the rest as a tidy 2-column grid
  const TM = { x: 214, y: 80, w: 164 };
  function titleLayout(items) {
    const L = [], x0 = TM.x + 6, cw = (TM.w - 12 - 4) / 2; let y = TM.y + 6;
    items.forEach((it, i) => {
      if (i === 0) { L.push({ x: x0, y, w: TM.w - 12, h: 24, primary: true }); y += 29; return; }
      const k = i - 1, rest = items.length - 1, col = k % 2, row = Math.floor(k / 2), lastOdd = rest % 2 === 1 && k === rest - 1;
      L.push({ x: lastOdd ? x0 : x0 + col * (cw + 4), y: y + row * 15, w: lastOdd ? TM.w - 12 : cw, h: 12 });
    });
    return L;
  }
  const TITLE_LBL = { cont: ['World map', 'Bản đồ thế giới'], shopT: ['Shop & bag', 'Cửa hàng'], coopT: ['Online co-op', 'Co-op online'], newgame: ['New game', 'Chơi mới'], full: ['Fullscreen', 'Toàn màn hình'], credits: ['Credits', 'Thực hiện bởi'], quit: ['Quit', 'Thoát'] };
  function titleLabel(it) {
    if (it.k === 'lang') return save.lang === 'vi' ? 'Tiếng Việt' : 'English';
    if (it.k === 'sound') return sv('Sound: ', 'Âm thanh: ') + (Snd.muted ? sv('Off', 'Tắt') : sv('On', 'Bật'));
    if (it.k === 'newgame' && title.confirmT > 0) return sv('Press again: erase!', 'Nhấn lần nữa: xóa!');
    const l = TITLE_LBL[it.k]; return l ? sv(l[0], l[1]) : T(it.k);
  }
  function titleItems() {""")
rep("""    if (save.resume && BIOMES[save.resume.li]) it.push({ k: 'resume', fn: resumeLevel });
    if (save.cleared.length || UNLOCK_ALL)""", """    if (save.resume && BIOMES[save.resume.li]) it.push({ k: 'resume', fn: resumeLevel });
    else if (!save.cleared.length && !UNLOCK_ALL) it.push({ k: 'start', fn: () => it2.find(o => o.k === 'newgame').fn() });
    const it2 = it;
    if (save.cleared.length || UNLOCK_ALL)""")
a0 = s.index("    // ---- menu ----\n    const items = titleItems(), n = items.length, MX0 = 214")
a1 = s.index("    txt(sv('Up/Down: choose    Enter: confirm'")
s = s[:a0] + """    // ---- menu: a glass panel, the main action on a big card, everything else in a neat grid ----
    { const items = titleItems(), L = titleLayout(items), last = L[L.length - 1], ph = last.y + last.h + 6 - TM.y;
      g.fillStyle = 'rgba(10,5,22,.72)'; g.fillRect(TM.x, TM.y, TM.w, ph);
      g.fillStyle = 'rgba(255,200,110,.5)'; g.fillRect(TM.x, TM.y, TM.w, 1); g.fillRect(TM.x, TM.y + ph - 1, TM.w, 1);
      g.fillStyle = 'rgba(255,200,110,.18)'; g.fillRect(TM.x, TM.y, 1, ph); g.fillRect(TM.x + TM.w - 1, TM.y, 1, ph);
      g.fillStyle = '#ffd34e'; for (const [cx, cy] of [[TM.x, TM.y], [TM.x + TM.w - 4, TM.y], [TM.x, TM.y + ph - 1], [TM.x + TM.w - 4, TM.y + ph - 1]]) g.fillRect(cx, cy, 4, 1);
      items.forEach((it, i) => {
        const r = L[i], sel = titleSel === i, cx = r.x + r.w / 2;
        if (r.primary) {
          const gr = g.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
          gr.addColorStop(0, sel ? 'rgba(255,190,90,.95)' : 'rgba(120,60,40,.75)'); gr.addColorStop(1, sel ? 'rgba(210,100,40,.95)' : 'rgba(60,24,30,.8)');
          g.fillStyle = gr; g.fillRect(r.x, r.y, r.w, r.h);
          g.fillStyle = sel ? '#fff4d0' : '#c89a5a'; g.fillRect(r.x, r.y, r.w, 1); g.fillStyle = sel ? '#7a2a10' : '#3a1418'; g.fillRect(r.x, r.y + r.h - 1, r.w, 1);
          if (sel) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,150,' + (0.12 + Math.sin(t * 4) * 0.06) + ')'; g.fillRect(r.x, r.y, r.w, r.h); g.globalCompositeOperation = 'source-over'; }
          lanternIc(r.x + 12, r.y + r.h / 2 + Math.round(Math.sin(t * 3) * 1), 1);
          const head = it.k === 'resume' ? sv('CONTINUE', 'CHƠI TIẾP') : sv('START ADVENTURE', 'BẮT ĐẦU PHIÊU LƯU');
          const sub = it.k === 'resume' ? sv('Map ', 'Map ') + (LPOS(save.resume.li) + 1) + ' · ' + LN(BIOMES[save.resume.li].name) : sv('A new journey begins', 'Hành trình mới bắt đầu');
          txt(head, cx + 6, r.y + 8, { al: 'center', size: 8.5, bold: true, col: '#ffffff', ol: sel ? '#5a1a08' : '#1a0814', glow: sel ? 'rgba(255,200,120,.8)' : null, ls: 1, sh: false });
          txt(fitTxt(sub, 30), cx + 6, r.y + 17, { al: 'center', size: 6, col: sel ? '#3a1408' : '#ffd890', bold: sel });
          if (sel) { g.fillStyle = '#fff4d0'; g.fillRect(r.x + r.w - 10 + Math.round(Math.sin(t * 6)), r.y + r.h / 2 - 2, 2, 5); g.fillRect(r.x + r.w - 8 + Math.round(Math.sin(t * 6)), r.y + r.h / 2 - 1, 2, 3); }
          return;
        }
        const warn = it.k === 'newgame' && title.confirmT > 0;
        g.fillStyle = sel ? (warn ? 'rgba(200,50,50,.9)' : 'rgba(255,170,70,.88)') : 'rgba(34,22,58,.85)'; g.fillRect(r.x, r.y, r.w, r.h);
        g.fillStyle = sel ? '#fff0c8' : 'rgba(150,120,200,.45)'; g.fillRect(r.x, r.y, r.w, 1); g.fillStyle = sel ? '#8a3a10' : 'rgba(0,0,0,.4)'; g.fillRect(r.x, r.y + r.h - 1, r.w, 1);
        g.fillStyle = sel ? '#fff0c8' : 'rgba(150,120,200,.3)'; g.fillRect(r.x, r.y, 1, r.h); g.fillRect(r.x + r.w - 1, r.y, 1, r.h);
        txt(fitTxt(titleLabel(it), Math.floor(r.w / 4.2)), cx, r.y + r.h / 2 + 0.5, { al: 'center', size: 6.5, bold: sel, col: sel ? '#ffffff' : '#d8d2ec', ol: sel ? '#4a1808' : null, sh: !sel });
      });
    }
""" + s[a1:]
rep("txt(sv('Up/Down: choose    Enter: confirm', 'Lên/Xuống: chọn    Enter: xác nhận'), 8, VH - 8, { size: 5.5, col: '#8a7fa8' });",
    "txt(sv('Arrows: choose    Enter: confirm', 'Phím mũi tên: chọn    Enter: xác nhận'), 8, VH - 8, { size: 5.5, col: '#8a7fa8' });")
# mouse: hover and click on the card / grid buttons
rep("      if (scene === 'title') { const i = menuHit(gx, gy, titleItems().length, 293, 90, 11, 79); if (i >= 0 && i !== titleSel) { titleSel = i; Snd.play('select'); } }",
    "      if (scene === 'title') { const L = titleLayout(titleItems()), i = L.findIndex(r => gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h); if (i >= 0 && i !== titleSel) { titleSel = i; Snd.play('select'); } }")
rep("    if (scene === 'title') { const i = menuHit(gx, gy, titleItems().length, 293, 90, 11, 79); if (i >= 0) { titleSel = i; pressed.Enter = true; } }",
    "    if (scene === 'title') { const L = titleLayout(titleItems()), i = L.findIndex(r => gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h); if (i >= 0) { titleSel = i; pressed.Enter = true; } }")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
