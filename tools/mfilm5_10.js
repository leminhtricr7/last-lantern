  // the thread of light flies from tower ia to tower ib across the land (shared by the map films); returns where it lands
  function mfThread(t, ia, ib, col, glow, opts) {
    const P2 = opPano(), O = openArt(), a = P2.T[ia], b = P2.T[ib], camX = clamp(a.x - VW * 0.3 + (b.x - a.x) * 0.6 * ez(seg(t, 0.4, 5.4)), 0, P2.PW - VW), p = ez(seg(t, 1.0, 5.0));
    opLand(t, camX, 0.85, i => i < ib ? 1 : (i === ib ? (opts && opts.hide ? 0 : 0.12 * p) : 0), O);
    if (opts && opts.under) opts.under(b.x - camX, b.by, p);
    const ax = a.x - camX, ay = a.by - a.h - 6, bx = b.x - camX, by = opts && opts.dive ? b.by - 6 : b.by - b.h - 6, mx = (ax + bx) / 2, my = Math.min(ay, by) - 40;
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = hexA(col, 0.75); g.lineWidth = 1.5; g.beginPath(); g.moveTo(ax, ay);
    for (let s2 = 1; s2 <= 30; s2++) { const u = s2 / 30 * p; g.lineTo((1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by); } g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over';
    const hx = (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * mx + p * p * bx, hy = (1 - p) * (1 - p) * ay + 2 * (1 - p) * p * my + p * p * by;
    if (p > 0 && p < 1) { mfGlow(hx, hy, 18, 0.8, glow || '#fff0b0'); g.fillStyle = '#fff'; g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3); }
    if (opts && opts.over) opts.over(bx, b.by, p);
    mfFade(t, 0, 0.8); mfFade(t, 5.8, 6.4, true);
    return { bx, by: b.by, p };
  }
  // the hero walking with the lantern, Lyra behind (and Quan if q)
  function mfTeam(hx, hb, t, walk, q, lift) {
    if (q) drawSpr(g, npcSpr('npc_quan'), hx - 54, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6 + 1)) * 1.5 : 0)), false, false, 1.1, 1.1);
    drawSpr(g, npcSpr('npc_lyra'), hx - 26, Math.round(hb - (walk ? Math.abs(Math.sin(t * 6)) * 1.5 : 0)), false, false, 1.3, 1.3);
    opHero(hx, hb, 1.5, false, walk, t * (walk ? 0.55 : 1)); opLantern(hx + 10, hb - 16 - (lift || 0), 1, 1, Math.sin(t * 5) * 0.12); mfGlow(hx + 6, hb - 16 - (lift || 0), 60, 0.32);
  }
  const mfNight = a => { g.globalAlpha = a; g.fillStyle = '#05040f'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; };
  MF_WHO.s = ['SHORTY PHONG', '#ffd34e', 'shorty'];
  MF_WHO.a = ['SERAPH', '#fff6c0', 'angel'];
  MF_WHO.m = [['NAMI', 'NAMI'], '#6ee7f2', 'lyra'];

  // ---------- map 5: Frostbite Peaks ----------
  MFILM[4] = {
    len: 26, card: ['The Fifth Tower', 'Tháp Đèn Thứ Năm'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [13.0, 'zap'], [15.2, 'chime'], [17.6, 'crumble'], [20.6, 'music:devil'], [21.0, 'clang']],
    caps: [
      [0.6, 6.0, 'n', 'The fourth thread climbs the frozen peaks. On the summit, the Fifth Tower is locked inside a block of ice.', 'Sợi sáng thứ tư leo lên những đỉnh núi băng. Trên đỉnh, Tháp Đèn Thứ Năm bị nhốt trong một khối băng.'],
      [7.0, 10.0, 'k', 'Chapter ten: the Frost King was Quoc\'s friend. He gave him a warm cloak, once.', 'Chương mười: Vua Băng từng là bạn của Quốc. Có lần ông ấy tặng anh một tấm áo choàng ấm.'],
      [10.2, 12.8, 'e', 'Then why is everything frozen now?', 'Vậy sao giờ mọi thứ lại đóng băng hết?'],
      [13.4, 16.8, 'l', 'Let me sing to it... the tower is shivering. Can you hear it?', 'Để mình hát cho nó nghe... ngọn tháp đang run. Bạn có nghe thấy không?'],
      [17.0, 20.2, 'a', 'I fell from the sky when this tower went out. The king froze his own heart that night.', 'Ta rơi khỏi bầu trời khi ngọn tháp này tắt. Đêm đó, nhà vua đã tự đóng băng trái tim mình.'],
      [21.2, 25.0, 'y', 'Tsk. A song will not melt him, little lantern. I woke him up angry. I like him better angry.', 'Chậc. Một bài hát không làm ông ta tan được đâu, đèn nhỏ. Ta đánh thức ông ta trong cơn giận. Ta thích ông ta khi giận hơn.']
    ],
    draw(t) {
      if (t < 6.4) {
        mfThread(t, 3, 4, '#bfefff', '#e8fbff', { over: (bx, by, p) => { g.globalAlpha = 0.55; g.fillStyle = '#9fe8ff'; g.beginPath(); g.moveTo(bx - 10, by + 2); g.lineTo(bx - 12, by - 40); g.lineTo(bx - 2, by - 62); g.lineTo(bx + 10, by - 50); g.lineTo(bx + 12, by + 2); g.closePath(); g.fill(); g.globalAlpha = 1; g.strokeStyle = 'rgba(232,251,255,.8)'; g.stroke(); } });
        for (let i = 0; i < 40; i++) { const sx = (i * 37 + t * 60) % VW, sy = (i * 53 + t * 40) % VH; g.fillStyle = '#e8f4ff'; g.fillRect(Math.round(sx), Math.round(sy), 1, 1); }
      } else if (t < 20.6) {
        const walk = t < 13.2, camX = walk ? (t - 6.4) * 26 : 7 * 26, gy = drawBgOnly(4, camX, t);
        mfNight(0.45);
        g.strokeStyle = 'rgba(230,245,255,.5)'; for (let i = 0; i < 50; i++) { const sx = VW - ((i * 47 + t * 220) % (VW + 40)), sy = (i * 31 + t * 70) % VH; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 6, sy + 2); g.stroke(); }   // the blizzard
        const hx = 132, hb = gy + 2;
        if (!walk) {   // the frozen tower in its ice
          const tx = 280, k = ez(seg(t, 13.4, 16.8));
          opTower(tx, gy + 2, 70, 0.15 + 0.25 * k, t, 4);
          g.globalAlpha = 0.5; g.fillStyle = '#9fe8ff'; g.beginPath(); g.moveTo(tx - 18, gy + 2); g.lineTo(tx - 22, gy - 60); g.lineTo(tx - 4, gy - 96); g.lineTo(tx + 18, gy - 80); g.lineTo(tx + 22, gy + 2); g.closePath(); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#e8fbff'; g.stroke();
          for (let c = 0; c < Math.floor(k * 6); c++) { g.strokeStyle = '#ffffff'; g.beginPath(); g.moveTo(tx - 8 + c * 3, gy - 20 - c * 9); g.lineTo(tx + 2 + c * 2, gy - 30 - c * 9); g.stroke(); }   // cracks as Lyra sings
          if (t > 13.4) for (let i = 0; i < 6; i++) { const u = ((t * 0.6 + i / 6) % 1); g.globalAlpha = 1 - u; g.fillStyle = i % 2 ? '#ff9fd0' : '#6ee7f2'; g.fillRect(Math.round(hx - 26 + u * (tx - hx)), Math.round(hb - 30 - Math.sin(u * 3.14) * 20), 2, 3); } g.globalAlpha = 1;   // her song flies to the tower
          if (t > 17) { const ak = ez(seg(t, 17, 17.8)); g.globalAlpha = ak; drawSpr(g, npcSpr('npc_angel'), 200, Math.round(hb - 26 + Math.sin(t * 2) * 2), true, false, 1.2, 1.2); g.globalAlpha = 1; mfGlow(200, hb - 40, 30, 0.4 * ak, '#fff6c0'); }
        }
        mfTeam(hx, hb, t, walk, true);
        mfFade(t, 6.4, 7.2); mfFade(t, 20.0, 20.6, true);
      } else {   // Sy on the summit
        const gy = drawBgOnly(4, 300, t); mfNight(0.75);
        const sx = 270, hb = gy + 2, k = ez(seg(t, 20.8, 21.8));
        g.globalAlpha = k; drawSpr(g, npcSpr('npc_sy'), sx, Math.round(hb + Math.sin(t * 2)), true, false, 1.3, 1.3); g.globalAlpha = 1; mfGlow(sx, hb - 30, 28, 0.35 * k, '#7ed957');
        opBurst(sx + 20, hb - 30, 21.0, t, 26, 8, 60, 1.0, ['#e8fbff', '#9fe8ff', '#ffffff'], 120);   // he shatters the ice cage
        mfTeam(110, hb, t, false, false);
        mfFade(t, 20.6, 21.2); mfFade(t, 25.4, 26, true);
      }
    },
    open: [
      { w: 'narr', en: 'FROSTBITE PEAKS. Snow falls upward here, as if the sky itself is trying to escape. The Fifth Tower is frozen on the summit.', vi: 'ĐỈNH BĂNG GIÁ. Tuyết rơi ngược lên trời, như thể bầu trời đang cố trốn chạy. Tháp Đèn Thứ Năm bị đóng băng trên đỉnh núi.' },
      { w: 'lyra', en: 'My song cracked the ice a little. We need more warmth than one voice.', vi: 'Tiếng hát của mình làm băng nứt một chút. Mình cần nhiều hơi ấm hơn một giọng hát.' },
      { w: 'ember', en: 'Then we bring the fire flasks too. And we keep each other warm.', vi: 'Vậy mình mang theo cả bình lửa. Và giữ ấm cho nhau.' },
      { w: 'narr', en: 'Somewhere ahead, Seraph waits in the snow. And on the summit, a king who froze his own heart.', vi: 'Đâu đó phía trước, Seraph đang đợi trong tuyết. Và trên đỉnh núi là một vị vua đã tự đóng băng trái tim mình.' }
    ]
  };

  // ---------- map 6: Ember Volcano ----------
  MFILM[5] = {
    len: 26, card: ['The Sixth Tower', 'Tháp Đèn Thứ Sáu'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [7.0, 'rumble'], [13.4, 'clang'], [14.0, 'relic'], [20.4, 'music:devil'], [20.8, 'bossroar'], [22.0, 'flame']],
    caps: [
      [0.6, 6.0, 'n', 'The fifth thread runs into smoke. In the volcano, the Sixth Tower is slowly sinking into the lava.', 'Sợi sáng thứ năm chạy vào khói. Trong lòng núi lửa, Tháp Đèn Thứ Sáu đang chìm dần vào dung nham.'],
      [7.2, 10.6, 'l', 'The ground is breathing... like the mountain is alive.', 'Mặt đất đang thở... như thể ngọn núi còn sống vậy.'],
      [13.8, 17.2, 'k', 'Glass from an old lantern. Chapter eleven: here, Quoc\'s lantern cracked for the first time.', 'Mảnh kính của một cây đèn cũ. Chương mười một: ở đây, đèn của Quốc nứt lần đầu tiên.'],
      [17.4, 20.2, 'e', 'And he kept walking with a cracked lantern. All the way to the tenth tower.', 'Và anh ấy vẫn đi tiếp với cây đèn nứt. Đi mãi tới tháp thứ mười.'],
      [21.0, 25.0, 'n', 'Above the smoke, huge wings beat. Ignarok has grown up, and he remembers the little flame from the meadow.', 'Phía trên làn khói, đôi cánh khổng lồ vỗ mạnh. Ignarok đã lớn, và nó vẫn nhớ ngọn lửa nhỏ ở đồng cỏ.']
    ],
    draw(t) {
      if (t < 6.4) {
        mfThread(t, 4, 5, '#ffb07a', '#ffd34e', { under: (bx, by) => { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(bx, by, 0, bx, by, 60); gr.addColorStop(0, 'rgba(255,100,30,.55)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(bx - 60, by - 60, 120, 120); g.globalCompositeOperation = 'source-over'; } });
      } else if (t < 20.4) {
        const walk = t < 13.2, camX = walk ? (t - 6.4) * 26 : 7 * 26, gy = drawBgOnly(5, camX, t), sh = t > 7 && t < 8.2 ? Math.round(Math.sin(t * 60)) : 0;
        mfNight(0.5); g.globalCompositeOperation = 'lighter'; const lg = g.createLinearGradient(0, VH, 0, VH - 90); lg.addColorStop(0, 'rgba(255,90,20,.45)'); lg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = lg; g.fillRect(0, VH - 90, VW, 90); g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 14; i++) { const u = (t * 0.3 + i / 14) % 1; g.globalAlpha = 1 - u; g.fillStyle = i % 2 ? '#ff7a2a' : '#ffd34e'; g.fillRect(Math.round((i * 53) % VW + Math.sin(u * 6 + i) * 6), Math.round(VH - u * 120), 2, 2); } g.globalAlpha = 1;   // embers rising
        const hx = 132 + sh, hb = gy + 2;
        if (!walk) {   // a shard of old lantern glass, half melted into the rock
          const gx = 200, k = ez(seg(t, 13.4, 14.4));
          g.fillStyle = '#3a2a22'; g.fillRect(gx - 8, hb - 3, 16, 3); g.fillStyle = lerpColor('#8a6a44', '#ffe9a8', k); g.beginPath(); g.moveTo(gx - 4, hb - 3); g.lineTo(gx, hb - 12); g.lineTo(gx + 5, hb - 3); g.closePath(); g.fill();
          g.strokeStyle = '#ffffff'; g.globalAlpha = k; g.beginPath(); g.moveTo(gx - 1, hb - 9); g.lineTo(gx + 1, hb - 5); g.stroke(); g.globalAlpha = 1; mfGlow(gx, hb - 7, 24, 0.5 * k, '#ffd34e');
          opTower(320, hb + 30 - 10 * Math.sin(t * 0.5), 60, 0.1, t, 5);   // the Sixth Tower, sinking
        }
        mfTeam(hx, hb, t, walk, true);
        mfFade(t, 6.4, 7.2); mfFade(t, 19.8, 20.4, true);
      } else {   // Ignarok's shadow over the lava
        const gy = drawBgOnly(5, 360, t); mfNight(0.65);
        const ds = dragonSprite(1, Math.floor(t * 6) % 2), dx = VW + 60 - (t - 20.4) * 100, dy = 18 + Math.sin(t * 2) * 5, k = 0.9;
        g.globalAlpha = 0.85; drawSpr(g, ds, Math.round(dx), Math.round(dy + ds.h * k), true, false, k, k); g.globalAlpha = 1;   // high above the smoke
        if (t > 22) for (let i = 0; i < 10; i++) { const u = (t - 22) * 2 - i * 0.08; if (u < 0 || u > 1) continue; disc(g, Math.round(dx - 20 - u * 80), Math.round(dy + 30 + u * 40), 4, i % 2 ? '#ff7a2a' : '#ffd34e'); }   // a breath of fire
        mfTeam(110, gy + 2, t, false, false);
        mfFade(t, 20.4, 21.0); mfFade(t, 25.4, 26, true);
      }
    },
    open: [
      { w: 'narr', en: 'EMBER VOLCANO. The heat is almost kind after the cold. The Sixth Tower is sinking in the lava, and Ignarok circles above it.', vi: 'NÚI LỬA TRO TÀN. Hơi nóng gần như dễ chịu sau giá lạnh. Tháp Đèn Thứ Sáu đang chìm trong dung nham, và Ignarok lượn vòng phía trên.' },
      { w: 'ember', en: 'A cracked lantern... and he still went on. How tired was he?', vi: 'Một cây đèn nứt... vậy mà anh ấy vẫn đi tiếp. Anh ấy đã mệt đến mức nào?' },
      { w: 'lyra', en: 'Tired enough to stop believing anyone would come with him.', vi: 'Mệt đến mức không còn tin sẽ có ai đi cùng mình.' },
      { w: 'quan', en: 'Watch the fire vents: they breathe in a rhythm. Count before you cross. That is in every chapter.', vi: 'Coi chừng các vòi lửa: chúng phun theo nhịp. Đếm rồi hãy băng qua. Chương nào cũng ghi vậy.' }
    ]
  };

  // ---------- map 7: Glowcap Swamp ----------
  function mfShroom(x, by, h, col, glow, t, i) {
    x = Math.round(x); by = Math.round(by);
    g.fillStyle = '#d8e8d0'; g.fillRect(x - 2, by - h, 4, h); g.fillStyle = '#a8b8a0'; g.fillRect(x + 1, by - h, 1, h);
    const w = Math.round(h * 0.55); g.fillStyle = col; g.beginPath(); g.ellipse(x, by - h, w, w * 0.45, 0, Math.PI, 0); g.fill();
    for (let k = 0; k < 4; k++) { g.fillStyle = '#ffffff'; g.globalAlpha = 0.6; g.fillRect(x - w + 4 + k * Math.round(w / 2), by - h - 3 - (k % 2), 2, 2); g.globalAlpha = 1; }
    mfGlow(x, by - h, w * 1.8, glow * (0.7 + 0.3 * Math.sin(t * 2 + i)), col);
  }
  MFILM[7] = {
    len: 26, card: ['The Seventh Tower', 'Tháp Đèn Thứ Bảy'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [13.6, 'bubbles'], [14.0, 'chime'], [20.4, 'music:devil'], [21.0, 'splash']],
    caps: [
      [0.6, 6.0, 'n', 'The sixth thread sinks into the swamp. Its mushrooms glow, but their light is cold.', 'Sợi sáng thứ sáu chìm vào đầm lầy. Nấm ở đây phát sáng, nhưng thứ ánh sáng ấy lạnh lẽo.'],
      [7.0, 10.4, 'k', 'Mushrooms remember dreams. Quoc slept here once, on his way to the tenth tower.', 'Nấm nhớ được những giấc mơ. Quốc từng ngủ ở đây một lần, trên đường tới tháp thứ mười.'],
      [14.0, 17.6, 'n', 'The mushrooms whisper the last thing he said in his sleep:', 'Những cây nấm thì thầm điều cuối cùng anh nói trong giấc ngủ:'],
      [17.8, 20.2, 'q', '"I am so tired... I wish someone would walk with me."', '"Mình mệt quá... Giá mà có ai đi cùng mình."'],
      [21.0, 25.0, 'n', 'Deep in the swamp, a great mushroom opens her eyes. The Spore Queen promised him that sleep would be kinder.', 'Sâu trong đầm, một cây nấm khổng lồ mở mắt. Nữ Hoàng Bào Tử đã hứa với anh rằng giấc ngủ sẽ dịu dàng hơn.']
    ],
    draw(t) {
      if (t < 6.4) {
        mfThread(t, 5, 6, '#a4ffc0', '#c8f0a0', { under: (bx, by) => { for (let i = 0; i < 5; i++) mfShroom(bx - 50 + i * 24, by + 6, 8 + (i * 5) % 9, i % 2 ? '#7ee8c0' : '#c070ff', 0.35, t, i); } });
      } else if (t < 20.4) {
        const walk = t < 13.4, camX = walk ? (t - 6.4) * 26 : 7 * 26, gy = drawBgOnly(7, camX, t);
        mfNight(0.55);
        for (let i = 0; i < 7; i++) { const sx = ((i * 71 + 40) - camX * 0.9) % (VW + 80); mfShroom(sx < -40 ? sx + VW + 80 : sx, gy + 2, 18 + (i * 11) % 22, i % 3 ? '#7ee8c0' : '#c070ff', 0.3, t, i); }
        const hx = 132, hb = gy + 2;
        if (!walk) {   // the whisper: the words drift up from the caps as pale motes
          const k = ez(seg(t, 13.6, 14.6));
          for (let i = 0; i < 16; i++) { const u = ((t * 0.25 + i / 16) % 1); g.globalAlpha = (1 - u) * k * 0.8; g.fillStyle = '#e8fff0'; g.fillRect(Math.round(180 + Math.sin(i * 2.3 + t) * 80), Math.round(gy - 20 - u * 100), 1, 2); } g.globalAlpha = 1;
          if (t > 17.6) { const qk = ez(seg(t, 17.6, 18.6)) * (1 - ez(seg(t, 19.8, 20.4))); g.globalAlpha = 0.55 * qk; drawSpr(g, getSprite('hero_idle', { a: '#cfd6e6', A: '#8a90a8', q: '#4a4a5a', b: '#b0b0bc', r: '#9a9aa8' }, 0), 250, Math.round(hb), true, false, 1.4, 1.4); g.globalAlpha = 1; }   // a pale memory of young Quoc, asleep on his feet
        }
        mfTeam(hx, hb, t, walk, true);
        mfFade(t, 6.4, 7.2); mfFade(t, 19.8, 20.4, true);
      } else {   // the Spore Queen opens her eyes
        const gy = drawBgOnly(7, 360, t); mfNight(0.7);
        mfShroom(280, gy + 2, 90, '#c070ff', 0.45, t, 0);
        const ok = ez(seg(t, 21.2, 22.2)); for (const ex of [266, 294]) { g.fillStyle = '#14101e'; g.fillRect(ex - 4, gy - 98, 8, 5); if (ok > 0) { g.fillStyle = '#c8ff8a'; g.fillRect(ex - 3, gy - 97, 6, Math.max(1, Math.round(3 * ok))); mfGlow(ex, gy - 96, 14, 0.4 * ok, '#c8ff8a'); } }
        mfTeam(110, gy + 2, t, false, false);
        mfFade(t, 20.4, 21.0); mfFade(t, 25.4, 26, true);
      }
    },
    open: [
      { w: 'narr', en: 'GLOWCAP SWAMP. The mushrooms are taller than houses and glow like lanterns, but their light is cold. The Seventh Tower is choked in the roots.', vi: 'ĐẦM LẦY NẤM PHÁT QUANG. Nấm cao hơn nhà và sáng như đèn lồng, nhưng thứ ánh sáng ấy lạnh lẽo. Tháp Đèn Thứ Bảy bị rễ cây bóp nghẹt.' },
      { w: 'lyra', en: '"I wish someone would walk with me." ...He was so alone.', vi: '"Giá mà có ai đi cùng mình." ...Anh ấy đã cô đơn đến thế.' },
      { w: 'ember', en: 'Then this time someone will. All the way to the tenth tower.', vi: 'Vậy lần này sẽ có người đi cùng. Tới tận tháp thứ mười.' },
      { w: 'quan', en: 'Breathe through your scarf, and never trust a mushroom that smiles. Chapter twelve was very clear about that.', vi: 'Thở qua khăn quàng, và đừng bao giờ tin một cây nấm biết cười. Chương mười hai nói rất rõ điều đó.' }
    ]
  };

  // ---------- map 8: the Sunken Deep (the shore quest with Nami plays when the map begins) ----------
  MFILM[8] = {
    len: 24, card: ['The Eighth Tower', 'Tháp Đèn Thứ Tám'],
    snd: [[0.6, 'chime'], [6.4, 'splash'], [6.6, 'music:title'], [9.0, 'bubbles'], [12.0, 'chime'], [18.6, 'music:devil'], [19.0, 'rumble']],
    caps: [
      [0.6, 6.0, 'n', 'The seventh thread dives off a cliff into the sea. Far below, the Eighth Tower lies drowned.', 'Sợi sáng thứ bảy lao từ vách đá xuống biển. Rất sâu bên dưới, Tháp Đèn Thứ Tám đang chìm.'],
      [7.0, 10.4, 'e', 'The lantern still burns underwater... and something huge is swimming towards it.', 'Đèn vẫn cháy dưới nước... và có thứ gì đó rất lớn đang bơi về phía nó.'],
      [11.6, 15.2, 'l', 'A whale of light! It is showing us the way down.', 'Một con cá voi ánh sáng! Nó đang chỉ đường xuống cho mình.'],
      [19.0, 23.0, 'n', 'At the bottom, eight arms are wrapped around the drowned tower. The Kraken does not want to let go.', 'Dưới đáy, tám cánh tay quấn quanh ngọn tháp chìm. Kraken không muốn buông ra.']
    ],
    draw(t) {
      if (t < 6.4) {
        mfThread(t, 6, 7, '#9fe8ff', '#e8fbff', { dive: true, under: (bx, by) => { g.fillStyle = 'rgba(30,80,140,.55)'; g.fillRect(bx - 80, by - 4, 160, 40); } });
      } else {
        // under the sea: depth gradient, light rays, bubbles, the light whale, the drowned tower
        const d = clamp((t - 6.4) / 17, 0, 1), gr = g.createLinearGradient(0, 0, 0, VH);
        gr.addColorStop(0, lerpColor('#1a5a8a', '#06142a', d)); gr.addColorStop(1, lerpColor('#0a2a4a', '#020610', d)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
        g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { g.globalAlpha = 0.06 * (1 - d); g.fillStyle = '#bfefff'; g.beginPath(); const x0 = 40 + i * 80 + Math.sin(t * 0.5 + i) * 10; g.moveTo(x0, 0); g.lineTo(x0 + 18, 0); g.lineTo(x0 + 60, VH); g.lineTo(x0 + 30, VH); g.fill(); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        for (let i = 0; i < 18; i++) { const u = ((t * 0.3 + i / 18) % 1); g.globalAlpha = 0.6 * (1 - u); g.strokeStyle = '#bfefff'; g.beginPath(); g.arc(Math.round((i * 61) % VW + Math.sin(u * 8 + i) * 4), Math.round(VH - u * VH), 1 + (i % 3), 0, 7); g.stroke(); } g.globalAlpha = 1;
        const hx = 150 + Math.sin(t * 1.3) * 6, hy = 110 + Math.sin(t * 2) * 4;
        if (t > 9) {   // the light whale glides past and turns down
          const wk = ez(seg(t, 9, 10.5)), wx = VW + 80 - (t - 9) * 32, wy = 60 + (t - 9) * 4;
          g.globalAlpha = 0.85 * wk; g.fillStyle = '#2a6aa0'; g.beginPath(); g.ellipse(wx, wy, 70, 20, 0.05, 0, 7); g.fill(); g.beginPath(); g.moveTo(wx + 64, wy); g.lineTo(wx + 96, wy - 16); g.lineTo(wx + 92, wy + 14); g.closePath(); g.fill();
          g.fillStyle = '#e8fbff'; for (let i = 0; i < 12; i++) g.fillRect(Math.round(wx - 50 + i * 9), Math.round(wy - 6 + Math.sin(i) * 4), 2, 2); g.globalAlpha = 1; mfGlow(wx, wy, 90, 0.3 * wk, '#9fe8ff');
        }
        if (t > 15) { const k = ez(seg(t, 15, 18)); opTower(VW / 2 + 60, VH + 40 - 60 * k, 70, 0.08, t, 7); for (let a = 0; a < 6; a++) { g.strokeStyle = '#4a1a3a'; g.lineWidth = 4; g.beginPath(); const bx = VW / 2 + 60 + (a - 2.5) * 16, by = VH + 10 - 40 * k; g.moveTo(bx, VH); g.quadraticCurveTo(bx + Math.sin(t * 2 + a) * 20, by - 30, VW / 2 + 60 + Math.sin(t + a) * 6, by - 50 + a * 4); g.stroke(); } g.lineWidth = 1; }   // the Kraken's arms round the tower
        drawSpr(g, npcSpr('npc_lyra'), Math.round(hx - 24), Math.round(hy + 6), false, false, 1.2, 1.2); opHero(hx, hy, 1.4, false, false, t); opLantern(hx + 10, hy - 15, 1, 1, Math.sin(t * 3) * 0.2); mfGlow(hx + 6, hy - 15, 50, 0.4);
        mfFade(t, 6.4, 7.0); mfFade(t, 23.4, 24, true);
      }
    }
  };

  // ---------- map 9: Deepdig Tunnels ----------
  MFILM[9] = {
    len: 26, card: ['The Ninth Tower', 'Tháp Đèn Thứ Chín'],
    snd: [[0.6, 'chime'], [6.4, 'music:title'], [7.0, 'rumble'], [13.0, 'click'], [20.6, 'music:devil'], [21.0, 'rumble'], [22.0, 'crumble']],
    caps: [
      [0.6, 6.0, 'n', 'The eighth thread digs into the earth. The road to the Citadel goes under the ground, past the Ninth Tower.', 'Sợi sáng thứ tám đào xuống lòng đất. Con đường tới Thành Trì đi dưới mặt đất, qua Tháp Đèn Thứ Chín.'],
      [13.4, 16.6, 's', 'Do not shout. I am not here to fight. ...Master has not smiled since the tenth tower.', 'Đừng la. Ta không tới để đánh nhau. ...Từ tháp thứ mười, thầy chưa cười lần nào.'],
      [16.8, 19.8, 's', 'I only wanted him to be happy. Tall hats, trials, all of it. Was I wrong, little lantern?', 'Ta chỉ muốn thầy vui. Mũ cao, thử thách, tất cả. Ta sai sao, đèn nhỏ?'],
      [20.0, 22.0, 'e', 'Then help us bring him home.', 'Vậy giúp tụi mình đưa anh ấy về nhà.'],
      [22.4, 25.4, 'n', 'Shorty has no time to answer. The tunnel shakes: Gravemaw is coming up through the rock.', 'Shorty không kịp trả lời. Đường hầm rung chuyển: Gravemaw đang trồi lên xuyên qua đá.']
    ],
    draw(t) {
      if (t < 6.4) {
        mfThread(t, 7, 8, '#ffb04a', '#ffd34e', { dive: true, under: (bx, by) => { g.fillStyle = '#05040a'; g.beginPath(); g.ellipse(bx, by + 4, 30, 8, 0, 0, 7); g.fill(); } });
      } else {
        const camX = t < 13 ? (t - 6.4) * 24 : 6.6 * 24, gy = drawBgOnly(9, camX, t), sh = t > 22 ? Math.round(Math.sin(t * 50) * 2) : 0;
        mfNight(0.6);
        g.strokeStyle = 'rgba(255,176,74,.5)'; for (let i = 0; i < 5; i++) { const y0 = 30 + i * 22; g.beginPath(); g.moveTo(0, y0 + Math.sin(t + i) * 2); for (let xx = 0; xx <= VW; xx += 24) g.lineTo(xx, y0 + Math.sin(xx * 0.03 + i) * 6); g.stroke(); }   // glowing ore veins in the rock
        const hx = 120 + sh, hb = gy + 2;
        if (t > 13) { const sk = ez(seg(t, 13, 13.8)); g.globalAlpha = sk; drawSpr(g, npcSpr('npc_shorty'), 250 + sh, hb, true, false, 1.3, 1.3); g.globalAlpha = 1; }   // Shorty, alone, hat in his hands
        if (t > 22) opBurst(VW / 2, 20, 22.0, t, 24, 5, 30, 1.6, ['#8a7a5a', '#5a4a34'], 160);   // the ceiling crumbles
        mfTeam(hx, hb, t, t < 13, true);
        mfFade(t, 6.4, 7.2); mfFade(t, 25.4, 26, true);
      }
    },
    open: [
      { w: 'narr', en: 'DEEPDIG TUNNELS. The last road to the Citadel goes under the earth. The old miners ran from here, because of Gravemaw.', vi: 'ĐƯỜNG HẦM SÂU. Con đường cuối cùng tới Thành Trì đi dưới lòng đất. Thợ mỏ xưa bỏ chạy khỏi đây, vì Gravemaw.' },
      { w: 'lyra', en: 'Shorty only wanted his master to smile. Maybe nobody here is truly bad.', vi: 'Shorty chỉ muốn thầy mình cười. Có lẽ ở đây chẳng ai thật sự xấu cả.' },
      { w: 'ember', en: 'Just tired, and alone. One more tower, then the last one.', vi: 'Chỉ là mệt mỏi, và cô đơn. Thêm một tháp nữa, rồi tới tháp cuối.' },
      { w: 'narr', en: 'When the ground shakes under your feet, jump away. The worm swims through rock like water.', vi: 'Khi mặt đất rung dưới chân, hãy nhảy tránh. Con sâu bơi trong đá như bơi trong nước.' }
    ]
  };

  // ---------- map 10: the Shadow Citadel ----------
  MFILM[6] = {
    len: 28, card: ['The Tenth Tower', 'Tháp Đèn Thứ Mười'],
    snd: [[0.6, 'chime'], [3.0, 'relic'], [6.6, 'music:devil'], [7.0, 'thunder'], [14.0, 'rumble'], [20.4, 'chime'], [24.0, 'bossroar']],
    caps: [
      [0.6, 6.2, 'n', 'Nine towers burn. Nine threads of light cross the sky and meet over one place: the Shadow Citadel.', 'Chín tháp đã cháy. Chín sợi sáng băng qua bầu trời và gặp nhau ở một nơi: Thành Trì Bóng Tối.'],
      [7.0, 10.6, 'n', 'On its top stands the Tenth Tower, dark for a hundred years. Under it, someone is waiting.', 'Trên đỉnh thành là Tháp Đèn Thứ Mười, tối om suốt trăm năm. Bên dưới nó, có người đang chờ.'],
      [11.0, 14.0, 'l', 'This is it. One tower left. I will sing louder than I ever have.', 'Đến rồi. Chỉ còn một tháp. Mình sẽ hát to hơn bao giờ hết.'],
      [14.4, 17.6, 'k', 'The last chapter of my book is empty. For once, that does not make me sad. We will write it ourselves.', 'Chương cuối trong sách của mình còn trống. Lần này, điều đó không làm mình buồn. Tụi mình sẽ tự viết nó.'],
      [18.4, 22.4, 'q', 'Come in, Lanternbearer. I will show you what the tenth tower took from me.', 'Vào đi, Người Giữ Đèn. Ta sẽ cho ngươi thấy tháp thứ mười đã lấy đi những gì của ta.'],
      [22.8, 27.0, 'e', 'We are coming, Quoc. All of us.', 'Tụi mình tới đây, Quốc. Tất cả cùng tới.']
    ],
    draw(t) {
      if (t < 6.6) {   // nine threads meet over the citadel
        const P2 = opPano(), O = openArt(), camX = P2.PW - VW, p = ez(seg(t, 1.0, 5.4));
        opLand(t, camX, 0.9, i => i < 9 ? 1 : 0.05, O);
        const tx = P2.T[9].x - camX, ty = P2.T[9].by - P2.T[9].h - 6;
        g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { const sx = -40 + i * 30, sy = 20 + (i % 3) * 18; g.strokeStyle = 'rgba(255,220,140,' + 0.5 * p + ')'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + tx) / 2, Math.min(sy, ty) - 30, sx + (tx - sx) * p, sy + (ty - sy) * p); g.stroke(); } g.globalCompositeOperation = 'source-over';
        mfGlow(tx, ty, 40, 0.4 * p, '#ffe9a8');
        mfFade(t, 0, 0.8); mfFade(t, 6.0, 6.6, true);
      } else {
        const gy = drawBgOnly(6, t < 18 ? (t - 6.6) * 14 : 160, t); mfNight(0.55);
        opMoon(VW * 0.78, 30, 1, t);
        // the citadel's black towers and the dark Tenth Tower on top
        for (let i = 0; i < 5; i++) { const x0 = 200 + i * 34, h = 60 + (i % 2) * 30; g.fillStyle = '#06040c'; g.fillRect(x0, gy - h, 22, h); for (let k = 0; k < 3; k++) g.fillRect(x0 + k * 8, gy - h - 4, 5, 4); g.fillStyle = '#ff3a5a'; g.fillRect(x0 + 9, gy - h + 14, 3, 4); }
        opTower(268, gy - 92, 50, t > 20.4 ? 0.12 + 0.08 * Math.sin(t * 4) : 0, t, 9);
        if (t > 18.2) { const qk = ez(seg(t, 18.2, 19.2)), qi = typeof QUOC_IMG !== 'undefined' && QUOC_IMG.portrait_smirk; g.globalAlpha = 0.75 * qk; if (qi) { const sc = 58 / qi.h; g.drawImage(qi.c, Math.round(268 - qi.w * sc / 2), Math.round(gy - 150), Math.round(qi.w * sc), Math.round(qi.h * sc)); } g.globalAlpha = 1; mfGlow(268, gy - 120, 50, 0.3 * qk, '#ff3a5a'); }
        const hx = 110, hb = gy + 2; mfTeam(hx, hb, t, t > 22.8 && t < 26, true);
        if (t > 22.8) { const hk = ez(seg(t, 22.8, 24)); for (const [n, ox] of [['npc_hoang', -80], ['npc_duong', -100], ['npc_santree', -122]]) { g.globalAlpha = hk; drawSpr(g, npcSpr(n), hx + ox, hb, false, false, 1.1, 1.1); } g.globalAlpha = 1; }   // the friends from the road walk up behind
        mfFade(t, 6.6, 7.4); mfFade(t, 27.4, 28, true);
      }
    },
    open: [
      { w: 'narr', en: 'SHADOW CITADEL. Nine towers burn behind you. The Tenth stands dark at the top, the one Quoc never finished lighting.', vi: 'THÀNH TRÌ BÓNG TỐI. Chín tháp cháy sáng sau lưng bạn. Tháp thứ Mười đứng tối om trên đỉnh, ngọn tháp mà Quốc chưa bao giờ thắp xong.' },
      { w: 'lyra', en: 'Whatever happens up there... I am right behind you.', vi: 'Dù chuyện gì xảy ra trên đó... mình luôn ở ngay sau bạn.' },
      { w: 'ember', en: 'Shorty and Sy hold the gates. Then Quoc. Then the last tower.', vi: 'Shorty và Sy giữ cổng. Rồi tới Quốc. Rồi ngọn tháp cuối cùng.' },
      { w: 'narr', en: 'Step through, Lanternbearer.', vi: 'Bước vào đi, Người Giữ Đèn.' }
    ]
  };
