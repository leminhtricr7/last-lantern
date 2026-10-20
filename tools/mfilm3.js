  // a cluster of crystal shards (glow 0 = asleep, 1 = lit by the lantern)
  function mfCrystal(x, by, h, c1, c2, glow, seed) {
    const r = mulberry32(seed || 1);
    for (let k = 0; k < 3; k++) {
      const hh = h * (k === 1 ? 1 : 0.55 + r() * 0.25), w = Math.max(3, Math.round(hh * 0.28)), ox = (k - 1) * (w + 1), lean = (k - 1) * hh * 0.25;
      g.fillStyle = lerpColor('#141a34', c1, 0.35 + 0.65 * glow); g.beginPath(); g.moveTo(x + ox - w / 2, by); g.lineTo(x + ox + lean, by - hh); g.lineTo(x + ox + w / 2, by); g.closePath(); g.fill();
      g.fillStyle = lerpColor('#2a3460', c2, 0.3 + 0.7 * glow); g.beginPath(); g.moveTo(x + ox - w / 2 + 1, by); g.lineTo(x + ox + lean, by - hh + 2); g.lineTo(x + ox, by); g.closePath(); g.fill();
    }
    if (glow > 0) mfGlow(x, by - h * 0.5, h * 1.1, 0.35 * glow, c1);
  }
  // ---------- map 3: the Crystal Caverns ----------
  MF_WHO.y = [['MR SY', 'MR SY'], '#7ed957', 'sy'];
  MFILM[2] = {
    len: 29, card: ['The Third Tower', 'Tháp Đèn Thứ Ba'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [13.2, 'relic'], [13.4, 'chime'], [18.6, 'crumble'], [22.6, 'music:devil'], [23.0, 'zap'], [27.4, 'poof'], [28.0, 'rumble']],
    caps: [
      [0.6, 6.0, 'n', 'The second thread of light dives into the mountain: the Third Tower lies buried deep in the Crystal Caverns.', 'Sợi ánh sáng thứ hai lao vào lòng núi: Tháp Đèn Thứ Ba bị chôn sâu trong Hang Pha Lê.'],
      [6.8, 9.8, 'k', 'Chapter six: the crystals here keep a memory of every light that touches them.', 'Chương sáu: pha lê ở đây giữ lại ký ức của mọi ánh sáng chạm vào nó.'],
      [10.0, 12.8, 'e', 'Then... they remember Quoc\'s lantern?', 'Vậy... chúng còn nhớ ánh đèn của Quốc?'],
      [13.6, 16.8, 'n', 'The great crystal blazes. Inside it, a young Lanternbearer lifts his lantern to a tower.', 'Viên pha lê lớn bừng sáng. Bên trong, một Người Giữ Đèn trẻ đang giơ đèn lên một ngọn tháp.'],
      [17.0, 20.2, 'k', 'Every tower he lit... the lantern took a little of his warmth. That is the price.', 'Mỗi tháp cậu ấy thắp... cây đèn lại lấy đi một chút hơi ấm của cậu ấy. Đó là cái giá.'],
      [20.4, 22.2, 'l', 'Is that... why he gave up?', 'Có phải... vì thế mà anh ấy bỏ cuộc?'],
      [23.4, 27.2, 'y', 'Master Quoc paid that price nine times, little lantern. Will you pay it ten?', 'Thầy Quốc đã trả cái giá ấy chín lần, đèn nhỏ ạ. Nhóc định trả mười lần à?']
    ],
    draw(t) {
      if (t < 6.4) {   // the thread of light dives from the Second Tower into the mountain
        const P2 = opPano(), O = openArt(), a = P2.T[1], b = P2.T[2], camX = clamp(a.x - VW * 0.3 + (b.x - a.x) * 0.6 * ez(seg(t, 0.4, 5.4)), 0, P2.PW - VW), p = ez(seg(t, 1.0, 5.0));
        opLand(t, camX, 0.85, i => i < 2 ? 1 : (i === 2 ? 0.12 * p : 0), O);
        const ax = a.x - camX, ay = a.by - a.h - 6, bx = b.x - camX, by = b.by - b.h - 6, mx = (ax + bx) / 2, my = Math.min(ay, by) - 40;
        g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(160,230,255,.75)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay);
        for (let s = 1; s <= 30; s++) { const u = s / 30 * p; g.lineTo((1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by); } g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over';
        const hx = (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * mx + p * p * bx, hy = (1 - p) * (1 - p) * ay + 2 * (1 - p) * p * my + p * p * by; if (p > 0 && p < 1) { mfGlow(hx, hy, 18, 0.8, '#bfefff'); g.fillStyle = '#fff'; g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3); }
        for (let i = 0; i < 6; i++) mfCrystal(b.x - camX - 40 + i * 16, b.by + 6 - (i % 2) * 3, 8 + (i * 5) % 9, '#6ee7f2', '#c8f4ff', 0.25 + 0.5 * p, 30 + i);   // crystals growing out of the mountain
        mfFade(t, 0, 0.8); mfFade(t, 5.8, 6.4, true);
      } else if (t < 22.6) {   // the caverns: crystals wake as the lantern passes; the great crystal shows the memory
        const walk = t < 13, camX = walk ? (t - 6.4) * 30 : 6.6 * 30, gy = drawBgOnly(2, camX, t);
        g.globalAlpha = 0.72; g.fillStyle = '#03040e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        const hx = 132, hb = gy + 2;
        for (let i = 0; i < 9; i++) { const cx = ((i * 57 + 30) - camX * 0.9) % (VW + 60), wx = cx < -30 ? cx + VW + 60 : cx, near = clamp(1 - Math.abs(wx - hx) / 90, 0, 1); mfCrystal(wx, gy + 2, 10 + (i * 7) % 14, i % 3 ? '#6ee7f2' : '#c070ff', i % 3 ? '#e8fbff' : '#f0c8ff', near * 0.9, 50 + i); }
        if (!walk) {   // the great crystal
          const k = ez(seg(t, 13.0, 14.2)), gx = 272;
          const pts = [[gx - 26, gy + 2], [gx - 32, gy - 48], [gx - 8, gy - 98], [gx + 14, gy - 88], [gx + 32, gy - 44], [gx + 24, gy + 2]];
          const path = () => { g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
          mfGlow(gx, gy - 48, 100, 0.12 + 0.3 * k, '#6ee7f2');
          g.save(); path(); g.fillStyle = '#0a1e38'; g.fill(); g.clip();
          if (k > 0) {   // the memory inside: young Quoc lighting a tower, his colour slowly fading to grey
            g.globalAlpha = k; opTower(gx + 12, gy - 6, 40, t > 15 ? Math.min(1, (t - 15) / 0.8) : 0, t, 3);
            const fade = ez(seg(t, 17.2, 20.6)), down = t > 18.6, fr = down ? 2 : 0, sp = down ? 'hero_hurt' : 'hero_idle';
            const GOLD = { a: '#ffe9b8', A: '#e0b060', q: '#8a6a30', b: '#fff6c0', r: '#ffd34e' }, GREY = { a: '#9a9aa8', A: '#6a6a78', q: '#3a3a46', b: '#b0b0bc', r: '#7a7a88' };
            g.globalAlpha = k * (1 - fade); drawSpr(g, getSprite(sp, GOLD, fr), gx - 8, gy - 4, false, false, 1.4, 1.4);
            g.globalAlpha = k * fade; drawSpr(g, getSprite(sp, GREY, fr), gx - 8, gy - 4, false, false, 1.4, 1.4); g.globalAlpha = 1;
            opLantern(gx + 2, gy - 26 + (down ? 9 : 0), 0.9, (1 - 0.8 * fade) * k, 0);
          }
          g.restore();
          g.globalCompositeOperation = 'lighter'; path(); g.fillStyle = hexA('#6ee7f2', 0.1 + 0.15 * k); g.fill();
          g.strokeStyle = hexA('#bfefff', 0.35 + 0.5 * k); g.lineWidth = 1; g.stroke();
          g.beginPath(); g.moveTo(gx - 8, gy - 98); g.lineTo(gx - 4, gy + 2); g.moveTo(gx - 32, gy - 48); g.lineTo(gx + 6, gy - 30); g.lineTo(gx + 32, gy - 44); g.moveTo(gx + 14, gy - 88); g.lineTo(gx + 6, gy - 30); g.strokeStyle = hexA('#e8fbff', 0.2 + 0.3 * k); g.stroke();
          g.fillStyle = hexA('#ffffff', 0.25 * k); g.fillRect(gx - 22, gy - 52, 2, 18); g.fillRect(gx - 18, gy - 64, 2, 8); g.globalCompositeOperation = 'source-over';
          if (t > 18.6) opBurst(gx, gy - 22, 18.6, t, 12, 4, 20, 1.4, ['#cfd6e6', '#8a8a9a'], -12);   // his warmth drifts away as grey sparks
        }
        drawSpr(g, npcSpr('npc_quan'), hx - 54, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6 + 1)) * 1.5 : 0)), false, false, 1.1, 1.1);
        drawSpr(g, npcSpr('npc_lyra'), hx - 26, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6)) * 1.5 : 0)), false, false, 1.3, 1.3);
        const lift = walk ? 0 : ez(seg(t, 12.6, 13.2)) * 8;
        opHero(hx, hb, 1.5, false, walk, t * (walk ? 0.55 : 1)); opLantern(hx + 10, hb - 16 - lift, 1, 1, Math.sin(t * 5) * 0.12); mfGlow(hx + 6, hb - 16 - lift, 64, 0.38);
        mfFade(t, 6.4, 7.2); mfFade(t, 22.0, 22.6, true);
      } else {   // a green glint in the dark: Mr Sy
        const gy = drawBgOnly(2, 300, t);
        g.globalAlpha = 0.86; g.fillStyle = '#020308'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        const hx = 120, hb = gy + 2, sx = 290, show = ez(seg(t, 22.9, 24.2)) * (t > 27.4 ? 0 : 1);
        drawSpr(g, npcSpr('npc_lyra'), hx - 26, hb, false, false, 1.3, 1.3); opHero(hx, hb, 1.5, false, false, t); opLantern(hx + 10, hb - 16, 1, 1, 0); mfGlow(hx + 6, hb - 16, 60, 0.35);
        if (show > 0) { g.globalAlpha = show * 0.85; drawSpr(g, npcSpr('npc_sy'), sx, Math.round(hb + Math.sin(t * 2) * 1.5), true, false, 1.3, 1.3); g.globalAlpha = 1; mfGlow(sx, hb - 30, 26, 0.35 * show, '#7ed957'); }
        if (t > 22.7 && t < 23.6) { g.fillStyle = '#7ed957'; g.fillRect(sx - 6, hb - 34, 3, 1); g.fillRect(sx + 3, hb - 34, 3, 1); }   // the glint before he steps out
        opBurst(sx, hb - 18, 27.4, t, 24, 6, 70, 0.8, ['#7ed957', '#2a3a1a', '#c8ff8a'], 0);
        if (t > 27.8) opBurst(VW / 2, gy - 60, 27.8, t, 16, 9, 20, 1.2, ['#3a3454', '#5a5478'], 160);   // dust falls as the Golem wakes
        mfFade(t, 22.6, 23.2); mfFade(t, 28.4, 29, true);
      }
    },
    open: [
      { w: 'narr', en: 'CRYSTAL CAVERNS. The crystals glow weakly, like a fading heartbeat. Somewhere under the mountain, the Third Tower lies buried.', vi: 'HANG PHA LÊ. Pha lê ở đây sáng yếu ớt như một nhịp tim đang tàn. Đâu đó dưới lòng núi, Tháp Đèn Thứ Ba bị chôn vùi.' },
      { w: 'ember', en: 'Every tower I light... it takes a little of my warmth too?', vi: 'Mỗi tháp mình thắp... nó cũng lấy đi một chút hơi ấm của mình sao?' },
      { w: 'lyra', en: 'Maybe. But this time you are not walking alone. Take some of my warmth whenever you need it.', vi: 'Có thể. Nhưng lần này bạn không đi một mình. Khi nào cần, cứ lấy hơi ấm của mình.' },
      { w: 'quan', en: 'And mine. I over-pack warmth too, like supplies. Find me in the caves, I have extra of both.', vi: 'Và của mình nữa. Mình mang dư hơi ấm, cũng như mang dư đồ tiếp tế. Tìm mình trong hang nhé, mình có dư cả hai.' },
      { w: 'narr', en: 'Deep in the caverns, stone grinds against stone. Something very big has just been woken up.', vi: 'Sâu trong hang, đá nghiến vào đá. Có thứ gì đó rất lớn vừa bị đánh thức.' }
    ]
  };
