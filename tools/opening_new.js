  // ===================== OPENING FILM (60 s): the ten Lantern Towers, the festival, the Eclipse, Lyra taken, the lantern chooses the child, the road =====================
  const OP_END = 60;   // seconds until the "press Enter" card
  let op = null, opIntro = false;   // opIntro: the map-1 dialogue plays right after the film
  const ez = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  // captions: [from, to, speaker (n = narrator, q = Quoc, l = Lyra, e = the player's hero), english, vietnamese]
  const OPC = [
    [1.0, 4.8, 'n', 'Long ago, the world had no Sun. The light of Aurelia came from ten Lantern Towers.', 'Ngày xưa, thế giới không có Mặt Trời. Ánh sáng của Aurelia đến từ mười Tháp Đèn.'],
    [5.2, 9.6, 'n', 'Every hundred years, a Lanternbearer carries the Last Lantern and lights all ten again.', 'Cứ trăm năm, một Người Giữ Đèn mang Đèn Cuối Cùng đi thắp lại cả mười tháp.'],
    [10.8, 14.8, 'n', 'Tonight is the hundred-year Lantern Festival. The whole meadow village waits for the new Lanternbearer...', 'Đêm nay là Lễ Thắp Đèn trăm năm. Cả làng Đồng Cỏ chờ Người Giữ Đèn mới xuất hiện...'],
    [15.2, 19.8, 'n', '...and one ordinary child simply stares up at the old lantern on its stone.', '...còn một đứa trẻ bình thường chỉ lặng lẽ ngước nhìn cây đèn cổ trên bệ đá.'],
    [20.8, 24.6, 'n', 'But that night the moon turned black. One by one the towers went out, from the farthest to the nearest...', 'Nhưng đêm ấy, mặt trăng hóa đen. Từng Tháp Đèn tắt lịm, từ xa đến gần...'],
    [25.0, 28.4, 'q', 'I am QUOC, King of the Eclipse. I was a Lanternbearer once... the one you all waited for.', 'Ta là QUỐC, Vua Nhật Thực. Ta từng là Người Giữ Đèn... người các ngươi chờ đợi.'],
    [28.6, 31.8, 'q', 'Light is only a burden. Let the world SLEEP.', 'Ánh sáng chỉ là gánh nặng. Hãy để thế giới NGỦ YÊN.'],
    [32.6, 36.0, 'n', 'Princess Lyra, the only voice that can relight a tower, is dragged away by chains of shadow.', 'Công chúa Lyra, giọng hát duy nhất thắp lại được Tháp Đèn, bị xiềng bóng tối kéo đi.'],
    [36.3, 39.2, 'q', 'No one sings anymore. Sleep, Aurelia...', 'Không ai được hát nữa. Ngủ đi, Aurelia...'],
    [39.4, 41.8, 'l', 'Do not let the light go out...!', 'Đừng để ánh sáng tắt...!'],
    [42.8, 46.4, 'n', 'In the dark, the old lantern trembles... falls from its stone and rolls to the child\'s feet.', 'Trong bóng tối, cây đèn cổ rung lên... rơi khỏi bệ đá và lăn đến chân đứa trẻ.'],
    [47.6, 51.4, 'n', 'It lights itself. The lantern has chosen: the only one who is not afraid of the dark.', 'Nó tự bừng sáng. Đèn đã chọn: người duy nhất không sợ bóng tối.'],
    [52.2, 55.4, 'e', 'Then I will light them again. All ten.', 'Vậy mình sẽ thắp lại. Cả mười tháp.'],
    [55.8, 59.0, 'e', 'The first tower is at the end of the meadow. Hold on, Lyra!', 'Tháp đầu tiên ở cuối Đồng Cỏ. Chờ mình nhé, Lyra!']
  ];
  const opOutT = i => 22 + (9 - i) * 0.72;   // when tower i goes out (the far right one first)
  function startOpening() { op = { t: 0, fired: {}, typed: {} }; Snd.music('title', TITLE_MUSIC); }
  function updateOpening(dt) {
    if (!op) startOpening(); if (op.hold) return; op.t += dt; const t = op.t;
    const fire = (k, at, fn) => { if (t >= at && !op.fired[k]) { op.fired[k] = 1; if (!op.skipped || k === 'end') fn(); } };
    fire('c1', 1.0, () => Snd.play('chime')); fire('c2', 12.0, () => Snd.play('chime'));
    fire('th1', 20.6, () => Snd.play('thunder')); fire('m2', 21.4, () => Snd.music('devil', DEVIL_MUSIC));
    for (let i = 0; i < 10; i++) fire('out' + i, opOutT(i), () => Snd.play('whoosh'));
    fire('r1', 25.0, () => Snd.devilRoar(0.8)); fire('th2', 26.0, () => Snd.play('thunder')); fire('r2', 28.6, () => Snd.devilRoar(1.2)); fire('th3', 29.2, () => Snd.play('thunder'));
    fire('ch1', 33.2, () => Snd.play('clang')); fire('ch2', 35.0, () => Snd.play('clang')); fire('ch3', 37.4, () => Snd.play('clang'));
    fire('shk', 42.2, () => Snd.play('rumble')); fire('fall', 43.9, () => Snd.play('clang')); fire('roll', 44.4, () => Snd.play('hit'));
    fire('m3', 46.6, () => Snd.music('title', TITLE_MUSIC)); fire('lit', 47.4, () => { Snd.play('relic'); Snd.play('explode'); }); fire('take', 49.4, () => Snd.play('chime'));
    fire('run', 52.4, () => Snd.play('dash'));
    fire('end', OP_END, () => Snd.music('title', TITLE_MUSIC));
    // typewriter voices for Quoc, Lyra and the hero
    for (let i = 0; i < OPC.length && !op.skipped; i++) { const c = OPC[i]; if (t >= c[0] && t < c[1] && c[2] !== 'n') { const n = Math.floor((t - c[0]) * 32), last = op.typed[i] || 0; if (n > last && n % 2 === 0) Snd.blip(c[2] === 'q' ? 'quoc' : (c[2] === 'l' ? 'lyra' : 'ember')); op.typed[i] = n; } }
    if (act.okP || act.atkP || act.backP) {
      if (t < 1.2 && !act.backP) return;
      if (t < OP_END) { op.t = OP_END; op.skipped = true; Snd.play('select'); }
      else if (t > OP_END + 0.6) { Snd.play('ok'); save.seen = { 0: 1 }; writeSave(); opIntro = true; startLevelFade(0); }
    }
    if (act.backP && t < OP_END) { op.t = OP_END; op.skipped = true; }
  }
