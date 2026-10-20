  // a stepped pyramid (the Fourth Tower sleeps inside); door = how open its dark entrance glows
  function mfPyramid(x, by, w, h, door, t) {
    x = Math.round(x); by = Math.round(by);
    for (let k = 0; k < 8; k++) { const y0 = by - Math.round(h * (k + 1) / 8), ww = Math.round(w * (1 - k / 8) / 2); g.fillStyle = k % 2 ? '#3a2a1c' : '#4a3626'; g.fillRect(x - ww, y0, ww * 2, Math.ceil(h / 8)); g.fillStyle = '#5e4630'; g.fillRect(x - ww, y0, ww * 2, 1); }
    g.fillStyle = '#0a0604'; g.fillRect(x - 7, by - 18, 14, 18); g.fillRect(x - 5, by - 21, 10, 3);
    if (door > 0) { const bl = Math.sin(t * 1.4) > 0.96 ? 0.2 : 1; g.fillStyle = '#ffd34e'; g.fillRect(x - 4, by - 13, 2, Math.max(1, Math.round(2 * door * bl))); g.fillRect(x + 2, by - 13, 2, Math.max(1, Math.round(2 * door * bl))); mfGlow(x, by - 12, 18, 0.35 * door, '#ffb04a'); }
  }
  // ---------- map 4: the Sunscorch Desert ----------
  MF_WHO.p = [['SAND PHARAOH', 'PHARAOH CÁT'], '#ffd34e', 'bram'];
  MFILM[3] = {
    len: 28, card: ['The Fourth Tower', 'Tháp Đèn Thứ Tư'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [14.4, 'rune'], [15.2, 'relic'], [21.8, 'music:devil'], [22.4, 'rumble'], [24.0, 'crumble']],
    caps: [
      [0.6, 6.0, 'n', 'The third thread of light runs across the desert and dives into the sand: the Fourth Tower sleeps under a pyramid.', 'Sợi ánh sáng thứ ba chạy ngang sa mạc rồi lao xuống cát: Tháp Đèn Thứ Tư đang ngủ dưới một kim tự tháp.'],
      [7.0, 10.2, 'l', 'It is so hot... and yet I feel cold. Strange.', 'Nóng quá... vậy mà mình lại thấy lạnh. Lạ thật.'],
      [10.4, 13.8, 'e', 'Me too. The more towers we light... the colder it gets.', 'Mình cũng vậy. Càng thắp nhiều tháp... càng lạnh hơn.'],
      [15.0, 18.4, 'k', 'This carving tells of Quoc here. The Pharaoh begged him to let the tower sleep... and he refused.', 'Bức khắc này kể về Quốc ở đây. Pharaoh đã xin anh để ngọn tháp ngủ yên... và anh từ chối.'],
      [18.6, 21.8, 'n', 'A hundred years later, the Pharaoh sold his loyalty for another promise: a sleep that never ends.', 'Trăm năm sau, Pharaoh đổi lòng trung thành lấy một lời hứa khác: giấc ngủ không bao giờ dứt.'],
      [23.6, 27.2, 'p', 'Another lantern... come to break my sleep. You will lie in the sand with the others.', 'Lại một ngọn đèn... đến phá giấc ngủ của ta. Ngươi sẽ nằm lại trong cát như những kẻ khác.']
    ],
    draw(t) {
      if (t < 6.4) {   // the thread dives into the sand by a pyramid
        const P2 = opPano(), O = openArt(), a = P2.T[2], b = P2.T[3], camX = clamp(a.x - VW * 0.3 + (b.x - a.x) * 0.6 * ez(seg(t, 0.4, 5.4)), 0, P2.PW - VW), p = ez(seg(t, 1.0, 5.0));
        opLand(t, camX, 0.85, i => i < 3 ? 1 : (i === 3 ? 0.1 * p : 0), O);
        mfPyramid(b.x - camX, b.by + 4, 70, 40, 0, t);
        const ax = a.x - camX, ay = a.by - a.h - 6, bx = b.x - camX, by = b.by - 10, mx = (ax + bx) / 2, my = Math.min(ay, by) - 40;
        g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,210,130,.75)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay);
        for (let s2 = 1; s2 <= 30; s2++) { const u = s2 / 30 * p; g.lineTo((1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by); } g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over';
        if (p > 0.97) opBurst(bx, by, 5.0, t, 18, 3, 40, 1.0, ['#e8c890', '#c8a070', '#ffe08a'], 60);   // sand sprays where the light goes in
        mfFade(t, 0, 0.8); mfFade(t, 5.8, 6.4, true);
      } else if (t < 22.2) {   // the dunes, then the carving on the ruined wall
        const walk = t < 14.2, camX = walk ? (t - 6.4) * 32 : 8 * 32, gy = drawBgOnly(3, camX, t);
        g.globalAlpha = 0.5; g.fillStyle = '#140818'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        g.strokeStyle = 'rgba(255,220,170,.10)'; for (let i = 0; i < 6; i++) { const yy = gy - 10 - i * 7; g.beginPath(); for (let xx = 0; xx <= VW; xx += 6) { const w = Math.sin(xx * 0.05 + t * 3 + i) * 1.2; xx ? g.lineTo(xx, yy + w) : g.moveTo(xx, yy + w); } g.stroke(); }   // heat shimmer
        for (let i = 0; i < 3; i++) { const bx2 = ((t * 30 + i * 140) % (VW + 60)) - 30, by2 = 30 + i * 12 + Math.sin(t * 6 + i) * 3; g.fillStyle = '#14101e'; g.fillRect(Math.round(bx2) - 3, Math.round(by2), 7, 1); g.fillRect(Math.round(bx2) - 1, Math.round(by2) - 1, 3, 2); }   // bats far above
        const hx = 132, hb = gy + 2;
        if (!walk) {   // the ruined wall and its carving
          const wx = 230, wy = gy - 70, k = ez(seg(t, 14.4, 15.4));
          g.fillStyle = '#4a3a2a'; g.fillRect(wx, wy, 120, 72); g.fillStyle = '#5e4a36'; g.fillRect(wx, wy, 120, 2); g.fillStyle = '#3a2c1e'; for (let i = 0; i < 6; i++) g.fillRect(wx + i * 20, wy, 1, 72);
          g.globalAlpha = 0.35 + 0.65 * k; g.strokeStyle = k > 0.3 ? '#ffd890' : '#2a2016'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(wx + 20, wy + 62); g.lineTo(wx + 20, wy + 40); g.moveTo(wx + 16, wy + 48); g.lineTo(wx + 26, wy + 46); g.stroke();   // the Lanternbearer (a stick figure carved in stone)
          g.beginPath(); g.arc(wx + 20, wy + 36, 3, 0, 7); g.stroke(); g.strokeRect(wx + 26, wy + 42, 4, 5);   // head and lantern
          g.beginPath(); g.moveTo(wx + 52, wy + 64); g.lineTo(wx + 74, wy + 30); g.lineTo(wx + 96, wy + 64); g.closePath(); g.stroke();   // the pyramid
          g.beginPath(); g.moveTo(wx + 74, wy + 30); g.lineTo(wx + 74, wy + 14); g.stroke(); g.strokeRect(wx + 71, wy + 9, 6, 5);   // its tower
          g.beginPath(); g.arc(wx + 100, wy + 42, 4, 0, 7); g.moveTo(wx + 100, wy + 46); g.lineTo(wx + 100, wy + 62); g.moveTo(wx + 94, wy + 50); g.lineTo(wx + 106, wy + 50); g.stroke();   // the Pharaoh, begging
          g.globalAlpha = 1; if (k > 0) { mfGlow(wx + 60, wy + 40, 70, 0.25 * k, '#ffd890'); if (t > 18.6) mfGlow(wx + 74, wy + 11, 14, 0.5 * Math.min(1, (t - 18.6) / 0.6), '#ffd34e'); }
        }
        drawSpr(g, npcSpr('npc_quan'), hx - 54, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6 + 1)) * 1.5 : 0)), false, false, 1.1, 1.1);
        drawSpr(g, npcSpr('npc_lyra'), hx - 26, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6)) * 1.5 : 0)), false, false, 1.3, 1.3);
        const lift = walk ? 0 : ez(seg(t, 14.0, 14.6)) * 8;
        opHero(hx, hb, 1.5, false, walk, t * (walk ? 0.55 : 1)); opLantern(hx + 10, hb - 16 - lift, 1, 1, Math.sin(t * 5) * 0.12); mfGlow(hx + 6, hb - 16 - lift, 60, 0.32);
        mfFade(t, 6.4, 7.2); mfFade(t, 21.6, 22.2, true);
      } else {   // night at the pyramid: two eyes open in the doorway
        const gy = drawBgOnly(3, 420, t);
        g.globalAlpha = 0.8; g.fillStyle = '#05030c'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
        const px = 250, open = ez(seg(t, 22.6, 23.6)), sh = t > 22.4 && t < 25 ? Math.round(Math.sin(t * 50) * 1) : 0;
        mfPyramid(px + sh, gy + 2, 200, 110, open, t);
        opBurst(px, gy - 40, 24.0, t, 20, 7, 30, 1.6, ['#c8a070', '#8a6a44'], 90);   // sand pours off the steps
        const hx = 110, hb = gy + 2;
        drawSpr(g, npcSpr('npc_lyra'), hx - 26, hb, false, false, 1.3, 1.3); opHero(hx, hb, 1.5, false, false, t); opLantern(hx + 10, hb - 16, 1, 1, 0); mfGlow(hx + 6, hb - 16, 56, 0.35);
        mfFade(t, 22.2, 22.8); mfFade(t, 27.4, 28, true);
      }
    },
    open: [
      { w: 'narr', en: 'SUNSCORCH DESERT. The sand burns like coal, though no sun has ever shone on it. The Fourth Tower lies under the pyramid, where the Sand Pharaoh sleeps.', vi: 'SA MẠC CHÁY NẮNG. Cát nóng như than dù chưa từng có mặt trời nào chiếu xuống. Tháp Đèn Thứ Tư nằm dưới kim tự tháp, nơi Pharaoh Cát đang ngủ.' },
      { w: 'lyra', en: 'He begged Quoc to let the tower sleep. Maybe he was just tired, like everyone here.', vi: 'Ông ấy đã xin Quốc để ngọn tháp ngủ yên. Có lẽ ông ấy chỉ mệt mỏi, như mọi người ở đây.' },
      { w: 'ember', en: 'Then we will wake it gently. But we will wake it.', vi: 'Vậy mình sẽ đánh thức nó thật nhẹ nhàng. Nhưng vẫn phải đánh thức.' },
      { w: 'quan', en: 'Chapter nine: "The farther a Lanternbearer walks, the less warmth is left." I hate this chapter.', vi: 'Chương chín: "Người Giữ Đèn càng đi xa, hơi ấm càng vơi." Mình ghét chương này.' },
      { w: 'narr', en: 'Follow the old stone pillars. Someone is waiting in the shade of the ruins, and he does not like sunlight.', vi: 'Hãy đi theo những cột đá cổ. Có ai đó đang đợi trong bóng râm của tàn tích, và kẻ đó không ưa ánh nắng.' }
    ]
  };
