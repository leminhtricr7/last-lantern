import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, a[:80]
    return s.replace(a, b, 1)

# ---------- art: a smaller, cuter Princess Lyra ----------
def art(s):
    a = s.index("NPC_PAINT = {") if False else None
    s = rep(s, "  npc_lyra: [21, 25, P => lyraPaint(scaledP(P, 0.62), false)],", "  npc_lyra: [18, 23, P => lyraMini(P, false)],")
    s = rep(s, "  npc_lyra_leek: [21, 25, P => lyraPaint(scaledP(P, 0.62), true)],", "  npc_lyra_leek: [18, 23, P => lyraMini(P, true)],")
    s = rep(s, "function lyraPaint(P, leek) {", '''// tiny chibi princess: big head, flowing aqua hair, tiara, ball gown
function lyraMini(P, leek) {
  const H = '#46c9d6', HD = '#2a9aae', HL = '#b5f5f2', SK = '#ffe4d6', G = '#ffd34e', DR = '#f4fbff', DB = '#5aa8e8', PK = '#ff9fb8';
  P.ell(9, 10, 7, 8, H); P.rect(2, 10, 3, 10, H); P.rect(13, 10, 3, 10, H); P.rect(3, 18, 3, 3, HD); P.rect(12, 18, 3, 3, HD); P.px(3, 12, HL); P.px(14, 12, HL);
  P.tri(9, 15, 3, 22, 15, 22, DR); P.rect(6, 15, 6, 4, DR); P.rect(6, 17, 6, 1, G); P.px(9, 17, PK); P.rect(3, 21, 12, 1, DB); P.px(5, 19, '#cfe8ff'); P.px(12, 19, '#cfe8ff');
  P.rect(4, 15, 2, 4, DR); P.rect(12, 15, 2, 4, DR); P.px(4, 19, SK); P.px(13, 19, SK);
  P.ell(9, 10, 5, 5, SK); P.ell(9, 6, 6, 3, H); P.tri(3, 7, 7, 6, 4, 12, H); P.tri(15, 7, 11, 6, 14, 12, H); P.px(8, 5, HL);
  P.rect(7, 10, 1, 2, '#2a6ac8'); P.rect(11, 10, 1, 2, '#2a6ac8'); P.px(7, 10, 'w'); P.px(11, 10, 'w'); P.px(6, 12, PK); P.px(12, 12, PK); P.px(9, 13, '#d0405a');
  P.rect(6, 3, 6, 1, G); P.px(6, 2, G); P.px(9, 1, G); P.px(11, 2, G); P.px(9, 2, '#ff7fb0');
  if (leek) { P.rect(15, 11, 1, 10, '#e8f5d0'); P.rect(14, 5, 3, 7, '#4fc84f'); P.rect(14, 5, 1, 7, '#8af08a'); P.px(15, 4, '#4fc84f'); }
}
function lyraPaint(P, leek) {''')
    return s
edit('src/art.js', art)

# ---------- game: kiss scene + stormy Quoc scene ----------
def game(s):
    # the farewell lines
    s = rep(s, "  let castle = null;", """  const KISS = [
    { w: 'ember', en: 'Well... I should get going. The next fragment will not find itself.', vi: 'Thôi... mình nên đi đây. Mảnh vỡ tiếp theo sẽ không tự tìm đến đâu.' },
    { w: 'lyra', en: 'W-wait, brave knight! I... I have a gift for you too!', vi: 'Đ-đợi đã, hiệp sĩ dũng cảm! Mình... mình cũng có một món quà cho bạn!' },
    { w: 'narr', en: '(Lyra stands on tiptoe, and quickly kisses Ember on the cheek.)', vi: '(Lyra kiễng chân lên, và nhanh chóng hôn lên má Ember.)' },
    { w: 'lyra', en: 'T-thank you, for everything! Please... please come back safe!!', vi: 'C-cảm ơn bạn vì tất cả! Xin bạn... xin bạn hãy trở về an toàn!!' },
    { w: 'narr', en: '(Her face turns as red as a tomato. She covers it with both hands, and runs back into the castle.)', vi: '(Mặt cô đỏ như quả cà chua. Cô lấy hai tay che mặt và chạy thẳng vào lâu đài.)' },
    { w: 'ember', en: '...Huh? She... just... what... what was THAT?', vi: '...Hả? Cô ấy... vừa... gì... gì vậy trời?' },
    { w: 'ember', en: '...No. No time. Fragments to find. (He rubs his cheek, and tries very hard not to smile.)', vi: '...Không. Không có thời gian. Còn mảnh vỡ phải tìm. (Cậu xoa má, và cố hết sức để không mỉm cười.)' }
  ];
  let castle = null;""")
    s = rep(s, "if (c.gt > 6 && act.okP) { cutLevel = 1; mapSel = 2; toScene('cutscene'); }", "if (c.gt > 6 && act.okP) { c.phase = 'kiss'; c.i = 0; c.lt = 0; Snd.play('select'); }")
    s = rep(s, "    } else {\n      c.gt += dt;\n      if (c.gt > 1.5 && c.gt < 1.6 && !c.s1)", """    } else if (c.phase === 'kiss') {
      c.lt += dt; const ln = KISS[c.i], tx = ln[save.lang], v = CS[ln.w] ? CS[ln.w].v : null, n0 = Math.floor((c.lt - dt) * 40), n1 = Math.min(tx.length, Math.floor(c.lt * 40));
      if (v) for (let k = n0 + 1; k <= n1; k++) if (k % 3 === 0 && /\\S/.test(tx[k - 1] || ' ')) Snd.blip(v);
      if (c.i === 2 && c.lt > 0.7 && !c.kissed) { c.kissed = true; Snd.play('heart'); Snd.hero('cheer'); }
      if (act.okP) { if (c.lt * 40 < tx.length) c.lt = 999; else { c.i++; c.lt = 0; if (c.i >= KISS.length) { c.phase = 'leave'; c.gt = 0; } } }
      if (act.backP) { c.phase = 'leave'; c.gt = 0; }
    } else if (c.phase === 'leave') {
      c.gt += dt; if (c.gt > 1.6) { cutLevel = 1; mapSel = 2; cutSkip = true; cutAlt = true; toScene('cutscene'); c.gt = -99; }
    } else {
      c.gt += dt;
      if (c.gt > 1.5 && c.gt < 1.6 && !c.s1)""")
    # drawing: positions
    s = rep(s, "    drawSpr(g, getSprite('hero_idle', {}, Math.floor(t * 3) % 2), 150, 148, false);\n    drawSpr(g, npcSpr('npc_lyra_leek'), 178, 148 + Math.round(Math.sin(t * 3)), false);",
            """    { let hx = 150, lx = 178, ly = 148 + Math.round(Math.sin(t * 3)), hxo = 0, show = true, hflip = false;
      if (c.phase === 'kiss' || c.phase === 'leave') {
        const i = c.phase === 'leave' ? 99 : c.i, k = Math.min(1, c.lt / 0.7);
        if (i === 2) lx = 178 - 20 * k; else if (i === 3) lx = 158; else if (i >= 4) { const run = i === 4 ? c.lt : 99; lx = 158 - run * 110; if (lx < 20) show = false; }
        if (i === 2 || i === 3) ly = 148 - (i === 2 ? Math.round(Math.sin(k * 3.14) * 4) : 0);
        if (i === 5 || i === 6) hxo = Math.round(Math.sin(t * 30) * 1);
        if (c.phase === 'leave') { hx = 150 + c.gt * 90; hflip = false; }
      }
      drawSpr(g, getSprite('hero_idle', {}, Math.floor(t * 3) % 2), hx + hxo, 148, hflip);
      if (show) drawSpr(g, npcSpr('npc_lyra_leek'), Math.round(lx), ly, (c.phase === 'kiss' && c.i >= 4) ? true : false);
      if (c.phase === 'kiss' && (c.i === 3 || (c.i === 2 && c.lt > 0.7))) for (let n = 0; n < 5; n++) { const u = ((c.lt * 0.8) + n / 5) % 1, hx2 = 156 + Math.sin(u * 6 + n) * 8, hy2 = 126 - u * 30; g.globalAlpha = 1 - u; g.fillStyle = '#ff5a8a'; g.fillRect(Math.round(hx2), Math.round(hy2), 2, 2); g.fillRect(Math.round(hx2) + 3, Math.round(hy2), 2, 2); g.fillRect(Math.round(hx2) - 1, Math.round(hy2) + 1, 7, 2); g.fillRect(Math.round(hx2), Math.round(hy2) + 3, 5, 1); g.fillRect(Math.round(hx2) + 1, Math.round(hy2) + 4, 3, 1); } g.globalAlpha = 1;
      if (c.phase === 'kiss' && (c.i === 5 || c.i === 6)) txt('?!', hx + 6, 118 + Math.round(Math.sin(t * 8)), { size: 9, bold: true, col: '#ffd34e' });
    }""")
    s = rep(s, "    // ---- gift sequence ----", """    if (c.phase === 'kiss') {
      const ln = KISS[c.i], sp = CS[ln.w], tx = ln[save.lang], n = Math.floor(c.lt * 40);
      g.fillStyle = 'rgba(0,0,0,.84)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
      txt(LN(sp.n), 18, 162, { size: 8, col: sp.col, bold: true });
      wrapText(tx.substr(0, n), 66).forEach((l, i) => txt(l, 18, 175 + i * 10, { size: 7 }));
      if (n >= tx.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(t * 8) });
      return;
    }
    if (c.phase === 'leave') { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, c.gt / 1.4) + ')'; g.fillRect(0, 0, VW, VH); return; }
    // ---- gift sequence ----""")
    # stormy variant of the devil scene
    s = rep(s, "  let cutSkip = false;\n  function startCut() { cut = { t: 0, phase: 'walk',", "  let cutSkip = false, cutAlt = false;\n  function startCut() { cut = { alt: cutAlt, t: 0, phase: 'walk',")
    s = rep(s, "Snd.music('devil', DEVIL_MUSIC); if (cutSkip) {", "Snd.music('devil', DEVIL_MUSIC); cutAlt = false; if (cutSkip) {")
    s = rep(s, "    g.fillStyle = '#050003'; g.fillRect(0, 0, VW, VH);\n    const gl = g.createRadialGradient(VW / 2, 70, 0, VW / 2, 70, 190); gl.addColorStop(0, 'rgba(190,30,14,' + (0.45 + (ln.w === 'quoc' && ln.shout ? 0.2 : 0)) + ')'); gl.addColorStop(1, 'rgba(190,30,14,0)');",
            "    g.fillStyle = c.alt ? '#070818' : '#050003'; g.fillRect(0, 0, VW, VH);\n    const gc = c.alt ? '110,80,230' : '190,30,14', gl = g.createRadialGradient(VW / 2, 70, 0, VW / 2, 70, 190); gl.addColorStop(0, 'rgba(' + gc + ',' + (0.45 + (ln.w === 'quoc' && ln.shout ? 0.2 : 0)) + ')'); gl.addColorStop(1, 'rgba(' + gc + ',0)');")
    s = rep(s, "    for (let i = 0; i < 26; i++) { const ex = (i * 53", "    for (let i = 0; i < (c.alt ? 0 : 26); i++) { const ex = (i * 53")
    s = rep(s, "    const sh = c.shake > 0 ? c.shake * 7 : 0, dv = devilSprite()", """    if (c.alt) { // storm over a ruined spire: clouds, rain, lightning and floating rocks
      for (let i = 0; i < 7; i++) { const cx2 = (i * 71 + c.pt * 6) % (VW + 80) - 40, cy2 = 14 + (i % 3) * 14; g.globalAlpha = 0.5; disc(g, Math.round(cx2), cy2, 22 + (i % 2) * 8, '#1c1a3a'); disc(g, Math.round(cx2) + 18, cy2 + 4, 16, '#241f48'); } g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const rx = (i * 67 + 20) % VW, ry = 118 + ((i * 29) % 30) + Math.round(Math.sin(c.pt * 1.5 + i) * 3); g.fillStyle = '#1b1830'; g.fillRect(rx, ry, 22, 7); g.fillRect(rx + 4, ry + 7, 14, 5); g.fillRect(rx + 8, ry + 12, 6, 4); g.fillStyle = '#3a3560'; g.fillRect(rx, ry, 22, 1); }
      g.fillStyle = 'rgba(170,190,255,.55)'; for (let i = 0; i < 80; i++) { const rx = (i * 47 + c.pt * 50) % VW, ry = (i * 31 + c.pt * 280) % VH; g.fillRect(Math.round(rx), Math.round(ry), 1, 5); }
      if (Math.sin(c.pt * 2.3) > 0.94 || c.fl > 0.2) { const bx = 40 + (Math.floor(c.pt * 2.3) * 97) % 300; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, 0); for (let k = 1; k < 8; k++) g.lineTo(bx + ((k * 37 + Math.floor(c.pt * 9) * 13) % 24) - 12, k * 20); g.stroke(); }
    }
    const sh = c.shake > 0 ? c.shake * 7 : 0, dv = devilSprite()""")
    return s
edit('src/game.js', game)
print('ok')
