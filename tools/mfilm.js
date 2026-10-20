  // ===================== MAP FILMS: a short film the first time you enter a map, then a dialogue as the map begins =====================
  // MFILM[li] = { len, card: [en, vi] (the map's subtitle on the end card), caps: [[from, to, who, en, vi]], snd: [[at, sound]], draw(t), open: [dialogue] }
  // who: n narrator, e the player's hero, l Lyra, k QuanSadBoy, t the Ancient Tree, q Quoc
  let mf = null, mfIntro = -1;
  const MF_WHO = { e: [null, '#ffd34e', 'ember'], l: ['LYRA', '#6ee7f2', 'lyra'], k: ['QUANSADBOY', '#a98bff', 'quan'], t: [['ANCIENT TREE', 'CÂY CỔ THỤ'], '#a4e86b', 'santree'], q: [['QUOC', 'QUỐC'], '#ff7a7a', 'quoc'] };
  const MFILM = {};
  function startMapFilm(li) { mf = { li, t: 0, fired: {}, typed: {} }; Snd.music('title', TITLE_MUSIC); toScene('mfilm'); }
  function mfDone() { if (!mf || mf.done) return; mf.done = true; mfIntro = mf.li; startLevelFade(mf.li); }
  function updateMapFilm(dt) {
    if (!mf) return; const F = MFILM[mf.li]; mf.t += dt; const t = mf.t;
    if (!mf.skipped) for (const [at, n] of F.snd) { const k = 's' + at; if (t >= at && !mf.fired[k]) { mf.fired[k] = 1; if (n.indexOf('music:') === 0) { const m = n.slice(6); Snd.music(m, m === 'devil' ? DEVIL_MUSIC : (m === 'boss' ? BOSS_MUSIC : TITLE_MUSIC)); } else Snd.play(n); } }
    for (let i = 0; i < F.caps.length && !mf.skipped; i++) { const c = F.caps[i], w = MF_WHO[c[2]]; if (w && t >= c[0] && t < c[1]) { const n = Math.floor((t - c[0]) * 32); if (n > (mf.typed[i] || 0) && n % 2 === 0) Snd.blip(w[2]); mf.typed[i] = n; } }
    if (act.okP || act.atkP || act.backP) { if (t < 0.8 && !act.backP) return; if (t < F.len) { mf.t = F.len; mf.skipped = true; Snd.play('select'); } else if (t > F.len + 0.5) { Snd.play('ok'); mfDone(); } }
    if (t > F.len + 4) mfDone();
  }
  function drawMapFilm() {
    if (!mf) return; const F = MFILM[mf.li], t = mf.t;
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    if (t < F.len) { F.draw(t); opBars(); g.drawImage(titleArt().vig, 0, 0); }
    else {   // the end card: the map's name and what waits there
      const et = t - F.len, k = ez(et / 0.8), B = BIOMES[mf.li];
      g.fillStyle = '#05030f'; g.fillRect(0, 0, VW, VH);
      g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(VW / 2, VH / 2, 0, VW / 2, VH / 2, 160); cg.addColorStop(0, 'rgba(255,190,90,' + 0.18 * k + ')'); cg.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = cg; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
      txt(sv('MAP ', 'MAP ') + (LPOS(mf.li) + 1), VW / 2, VH / 2 - 30, { al: 'center', size: 7, bold: true, col: '#c89a1c', ls: 3, alpha: k });
      txt(LN(B.name).toUpperCase(), VW / 2, VH / 2 - 10, { al: 'center', size: 16, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.8)', ls: 2, sh: false, alpha: k });
      txt(sv(F.card[0], F.card[1]), VW / 2, VH / 2 + 10, { al: 'center', size: 7, bold: true, col: '#ffe9b8', ls: 2, alpha: k });
      if (et > 0.8) txt(sv('ENTER: play', 'ENTER: vào chơi'), VW / 2, VH / 2 + 40, { al: 'center', size: 6.5, bold: true, col: '#ffffff', alpha: 0.5 + 0.5 * Math.abs(Math.sin(t * 3)) });
      if (et < 0.5) { g.globalAlpha = 1 - et / 0.5; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      return;
    }
    const hn = LN((HERO[myHero()] || HERO.ember).name).toUpperCase();
    for (let i = 0; i < F.caps.length; i++) {
      const c = F.caps[i]; if (t < c[0] || t > c[1] + 0.5) continue;
      const w = MF_WHO[c[2]], who = c[2] === 'e' ? hn : (w ? (Array.isArray(w[0]) ? sv(w[0][0], w[0][1]) : w[0]) : null), col = w ? w[1] : '#e8eaf5';
      const line = sv(c[3], c[4]), n = Math.floor((t - c[0]) * (c[2] === 'n' ? 26 : 32)), a = Math.min(1, (c[1] + 0.5 - t) / 0.5), wl = wrapText(line.slice(0, n), 78);
      wl.forEach((l, j) => txt((j === 0 && who ? who + ': ' : '') + l, VW / 2, VH - 17 + j * 8 - (wl.length - 1) * 4, { al: 'center', size: 7, bold: c[2] !== 'n', col, alpha: a }));
    }
    if (t < F.len - 1) txt(sv('ENTER: skip', 'ENTER: bỏ qua'), VW - 6, VH - 6, { al: 'right', size: 5, col: '#6a6a8a' });
  }
  const mfFade = (t, a, b, out) => { if (t < a || t > b) return; const k = out ? ez(seg(t, a, b)) : 1 - ez(seg(t, a, b)); if (k > 0) { g.globalAlpha = k; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; } };
  // a lantern glow round a point (the hero's light in a dark scene)
  function mfGlow(x, y, r, a, col) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, hexA(col || '#ffbe5a', a)); gr.addColorStop(1, hexA(col || '#ffbe5a', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; }
  // the Ancient Tree of the Whispering Forest: a huge trunk with a face that opens its eyes and talks
  function mfTree(x, gy, t, eyes, talk) {
    x = Math.round(x);
    g.fillStyle = '#0e1a10'; g.beginPath(); g.ellipse(x, gy - 112, 92, 52, 0, 0, 7); g.fill(); g.fillStyle = '#14261a'; g.beginPath(); g.ellipse(x - 30, gy - 124, 56, 34, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 40, gy - 118, 50, 30, 0, 0, 7); g.fill();
    g.fillStyle = '#1e3424'; for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 30 + (i * 13) % 50; g.fillRect(Math.round(x + Math.cos(a) * r * 1.4), Math.round(gy - 118 + Math.sin(a) * r * 0.6), 6, 3); }
    g.fillStyle = '#2a1e14'; for (let y = gy - 96; y < gy; y++) { const u = (y - (gy - 96)) / 96, w = Math.round(22 + u * u * 26); g.fillRect(x - w, y, w * 2, 1); }
    g.fillStyle = '#3a2a1c'; for (let k = 0; k < 7; k++) g.fillRect(x - 18 + k * 6, gy - 90 + (k % 3) * 9, 1, 60 + (k % 2) * 20);
    g.fillStyle = '#2a1e14'; for (let k = -1; k <= 1; k += 2) for (let i = 0; i < 30; i++) g.fillRect(x + k * (40 + i * 1.6), gy - 6 + Math.round(Math.sin(i * 0.3) * 2) + Math.round(i * 0.2), 4, 3);
    // the face
    const ey = gy - 62, open = clamp(eyes, 0, 1), blink = Math.sin(t * 1.3) > 0.97 ? 0.2 : 1;
    for (const ex of [x - 10, x + 10]) { g.fillStyle = '#120c08'; g.fillRect(ex - 5, ey - 3, 10, 6); if (open > 0) { const h = Math.max(1, Math.round(4 * open * blink)); g.fillStyle = '#c8ff8a'; g.fillRect(ex - 3, ey - Math.floor(h / 2), 6, h); g.fillStyle = '#ffffff'; g.fillRect(ex - 1, ey - Math.floor(h / 2), 2, Math.min(2, h)); mfGlow(ex, ey, 14, 0.35 * open, '#a4ff8a'); } }
    const mh = talk ? 2 + Math.round(Math.abs(Math.sin(t * 9)) * 5) : 1; g.fillStyle = '#0a0604'; g.fillRect(x - 8, gy - 44, 16, mh); g.fillStyle = '#3a2a1c'; g.fillRect(x - 10, gy - 46, 20, 1);
  }
  // ---------- map 2: the Whispering Forest ----------
  MFILM[1] = {
    len: 29, card: ['The Second Tower', 'Tháp Đèn Thứ Hai'],
    snd: [[0.6, 'chime'], [6.6, 'music:title'], [14.6, 'rumble'], [15.0, 'relic'], [18.4, 'chime'], [24.9, 'hit'], [25.0, 'whoosh']],
    caps: [
      [0.6, 6.0, 'n', 'A thread of light runs across the sky from the First Tower, towards the Whispering Forest, where the Second Tower sleeps.', 'Sợi ánh sáng từ Tháp Thứ Nhất chạy ngang bầu trời, về phía Rừng Thì Thầm, nơi Tháp Đèn Thứ Hai đang ngủ.'],
      [7.0, 10.2, 'l', 'Listen... the trees are whispering.', 'Nghe kìa... cây cối đang thì thầm.'],
      [10.6, 14.0, 'e', 'They are talking about... another Lanternbearer?', 'Chúng đang nói về... một Người Giữ Đèn khác?'],
      [15.0, 18.4, 't', 'Another lantern... A hundred years ago, a boy with a lantern walked past me too.', 'Lại một ngọn đèn... Trăm năm trước, cũng có một cậu bé cầm đèn đi ngang qua ta.'],
      [18.6, 22.2, 't', 'He laughed a lot, and he sang with the birds. His name was... Quoc.', 'Cậu ấy cười rất nhiều, và hát cùng lũ chim. Tên cậu ấy là... Quốc.'],
      [25.3, 28.8, 'k', 'Oh! Sorry, I was reading. You are the new Lanternbearer? I have read about the old one...', 'Ồ! Xin lỗi, mình mải đọc. Bạn là Người Giữ Đèn mới à? Mình có đọc về người cũ đấy...']
    ],
    draw(t) {
      if (t < 6.5) {   // the thread of light flies from the First Tower to the sleeping Second Tower
        const P2 = opPano(), O = openArt(), a = P2.T[0], b = P2.T[1], camX = clamp(a.x - VW * 0.25 + (b.x - a.x) * 0.55 * ez(seg(t, 0.5, 5.5)), 0, P2.PW - VW), p = ez(seg(t, 1.0, 5.2));
        opLand(t, camX, 0.85, i => i === 0 ? 1 : (i === 1 ? 0.15 * p : 0), O);
        const ax = a.x - camX, ay = a.by - a.h - 6, bx = b.x - camX, by = b.by - b.h - 6, mx = (ax + bx) / 2, my = Math.min(ay, by) - 40;
        g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,220,140,.75)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay);
        for (let s = 1; s <= 30; s++) { const u = s / 30 * p; g.lineTo((1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by); } g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over';
        const hx = (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * mx + p * p * bx, hy = (1 - p) * (1 - p) * ay + 2 * (1 - p) * p * my + p * p * by; if (p > 0 && p < 1) { mfGlow(hx, hy, 18, 0.8, '#fff0b0'); g.fillStyle = '#fff'; g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3); }
        mfFade(t, 0, 0.8); mfFade(t, 5.9, 6.5, true);
      } else if (t < 22.5) {   // into the forest; the Ancient Tree wakes up and remembers
        const walk = t < 14.5, camX = walk ? (t - 6.5) * 34 : 8 * 34, gy = drawBgOnly(1, camX, t);
        g.globalAlpha = 0.6; g.fillStyle = '#04081a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        for (let i = 0; i < 9; i++) { const ex = (i * 47 + 20 - camX * 0.6) % (VW + 40), ey = 40 + (i * 29) % 70, on = Math.sin(t * 1.7 + i * 2.1) > 0.4; if (on) { g.fillStyle = '#c8ff8a'; g.fillRect(Math.round(ex), ey, 2, 1); g.fillRect(Math.round(ex) + 5, ey, 2, 1); } }   // eyes among the leaves
        for (let i = 0; i < 12; i++) { const u = (t * 0.12 + i / 12) % 1; g.globalAlpha = Math.sin(u * Math.PI) * 0.6; g.fillStyle = i % 2 ? '#a4e86b' : '#e8ffd0'; g.fillRect(Math.round((i * 61 + t * 14) % VW), Math.round(20 + u * (gy - 30)), 2, 1); } g.globalAlpha = 1;
        if (!walk) mfTree(262, gy + 2, t, ez(seg(t, 14.6, 15.6)), (t > 15 && t < 18.4) || (t > 18.6 && t < 22.2));
        const hx = 150, hb = gy + 2, mk = t > 18.5 ? ez(seg(t, 18.5, 19.3)) * (1 - ez(seg(t, 21.8, 22.4))) : 0;
        if (mk > 0) {   // the tree's memory: a smiling boy with a lantern a hundred years ago, in faded gold, on the path behind
          g.globalAlpha = 0.45 * mk; g.fillStyle = '#6a4a1a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
          const gx = -8 + (t - 18.5) * 26, gb = hb - 10; g.globalAlpha = 0.75 * mk; drawSpr(g, getSprite('hero_run', { a: '#ffe9b8', A: '#e0b060', q: '#8a6a30', b: '#fff6c0', r: '#ffd34e' }, Math.floor(t * 9) % 4), Math.round(gx), gb, false, false, 1.2, 1.2); g.globalAlpha = 1;
          opLantern(gx + 8, gb - 13, 0.8, mk, 0); mfGlow(gx + 5, gb - 13, 40, 0.4 * mk, '#ffe08a');
        }
        drawSpr(g, npcSpr('npc_lyra'), Math.round(hx - 26), Math.round(hb - (walk ? Math.abs(Math.sin(t * 6)) * 1.5 : 0)), false, false, 1.3, 1.3);
        opHero(hx, hb, 1.5, false, walk, t * (walk ? 0.55 : 1)); opLantern(hx + 10, hb - 16, 1, 1, Math.sin(t * 5) * 0.15); mfGlow(hx + 6, hb - 16, 60, 0.35);
        mfFade(t, 6.5, 7.3); mfFade(t, 14.2, 14.5, true); mfFade(t, 14.5, 15.0); mfFade(t, 22.0, 22.5, true);
      } else {   // QuanSadBoy walks in reading and bumps into the hero
        const camX = 300, gy = drawBgOnly(1, camX, t);
        g.globalAlpha = 0.5; g.fillStyle = '#04081a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        const hx = 150, hb = gy + 2, bump = t > 24.9, qx = bump ? 186 + Math.min(6, (t - 24.9) * 30) : 330 - (t - 22.5) * 60.5;
        drawSpr(g, npcSpr('npc_lyra'), hx - 26, hb, false, false, 1.3, 1.3);
        opHero(hx, hb, 1.5, false, false, t); opLantern(hx + 10, hb - 16, 1, 1, 0); mfGlow(hx + 6, hb - 16, 60, 0.35);
        drawSpr(g, npcSpr('npc_quan'), Math.round(qx), Math.round(hb - (bump ? 0 : Math.abs(Math.sin(t * 6)) * 1.5)), true, false, 1.2, 1.2);
        if (!bump) { g.fillStyle = '#8a5a34'; g.fillRect(Math.round(qx) - 9, Math.round(hb - 20), 6, 5); g.fillStyle = '#f2e0c0'; g.fillRect(Math.round(qx) - 8, Math.round(hb - 19), 4, 3); }   // his open book
        else { const u = Math.min(1, (t - 24.9) / 0.6); g.save(); g.translate(Math.round(qx - 18 + u * -6), Math.round(hb - 22 + u * u * 20)); g.rotate(u * 3); g.fillStyle = '#8a5a34'; g.fillRect(-3, -2, 6, 5); g.restore(); opBurst(170, hb - 26, 24.9, t, 8, 2, 30, 0.8, ['#ffd34e', '#ffffff'], -10); }   // the book flies, little stars
        mfFade(t, 22.5, 23.1); mfFade(t, 28.4, 29, true);
      }
    },
    open: [
      { w: 'narr', en: 'WHISPERING FOREST. Roots lie across the path like old hands. Somewhere in here, the Second Tower is sleeping.', vi: 'RỪNG THÌ THẦM. Rễ cây vắt ngang lối đi như những bàn tay già. Đâu đó trong rừng, Tháp Đèn Thứ Hai đang ngủ.' },
      { w: 'quan', en: 'I am Quan. People call me QuanSadBoy... I read sad books. This one is about the Lanternbearer of a hundred years ago.', vi: 'Mình là Quan. Người ta gọi mình là QuanSadBoy... vì mình hay đọc sách buồn. Cuốn này kể về Người Giữ Đèn trăm năm trước.' },
      { w: 'quan', en: 'It says he lit nine towers, then vanished at the tenth. Nobody knows why.', vi: 'Sách nói cậu ấy thắp được chín tháp, rồi biến mất ở tháp thứ mười. Không ai biết vì sao.' },
      { w: 'ember', en: 'Quoc... was that Lanternbearer?', vi: 'Quốc... chính là Người Giữ Đèn đó sao?' },
      { w: 'lyra', en: 'Then why does he want to put out every light now...?', vi: 'Vậy sao giờ anh ta lại muốn tắt hết ánh sáng...?' },
      { w: 'quan', en: 'The answer is in the later chapters. I will follow you and keep reading. Find me in the forest, I packed extra supplies.', vi: 'Câu trả lời nằm ở các chương sau. Mình sẽ đi theo bạn và đọc tiếp. Tìm mình trong rừng nhé, mình mang dư đồ tiếp tế.' },
      { w: 'narr', en: 'Ahead, the treetops are wrapped in webs. Something big is waiting around the Second Tower.', vi: 'Phía trước, ngọn cây phủ kín tơ nhện. Có thứ gì đó to lớn đang nằm chờ quanh Tháp Thứ Hai.' }
    ]
  };
