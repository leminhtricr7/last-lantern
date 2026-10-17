'use strict';
// ============================== LAST LANTERN ==============================
(function () {
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  const buf = document.createElement('canvas'); buf.width = VW; buf.height = VH;
  const g = buf.getContext('2d');
  const lightC = document.createElement('canvas'); lightC.width = VW; lightC.height = VH;
  const lg = lightC.getContext('2d');
  const FONT = "'LLPixel','VT323','Pixelify Sans','Consolas','Courier New',monospace";
  let scale = 3, offX = 0, offY = 0;
  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    scale = Math.min(cv.width / VW, cv.height / VH);
    if (scale >= 1) scale = Math.floor(scale);
    offX = Math.floor((cv.width - VW * scale) / 2); offY = Math.floor((cv.height - VH * scale) / 2);
  }
  addEventListener('resize', resize); resize();

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rr = (a, b) => a + Math.random() * (b - a);
  const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const disc = (c, cx, cy, rad, col) => { c.fillStyle = col; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(rad * rad - j * j)); c.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };

  // ---------- save / i18n ----------
  const SAVEKEY = 'last_lantern_save_v1';
  let save = { cleared: [], shards: {}, coins: 0, lang: 'vi', vol: 0.6 };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVEKEY) || '{}')); } catch (e) { }
  const writeSave = () => { try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) { } };
  const totalShards = () => Object.keys(save.shards).reduce((a, k) => a + save.shards[k].filter(Boolean).length, 0);
  const maxHP = () => 3 + Math.floor(totalShards() / 3);
  const swordDmg = () => 1 + Math.floor(totalShards() / 7);
  const maxPlayable = () => save.cleared.length ? Math.min(6, Math.max.apply(null, save.cleared) + 1) : 0;
  const sunPower = () => save.cleared.length / 7;
  Snd.setVol(save.vol);

  const STR = {
    newgame: { en: 'New Game', vi: 'Chơi mới' }, cont: { en: 'Continue', vi: 'Tiếp tục' },
    lang: { en: 'Language: English', vi: 'Ngôn ngữ: Tiếng Việt' },
    sound: { en: 'Sound', vi: 'Âm thanh' }, full: { en: 'Fullscreen', vi: 'Toàn màn hình' }, quit: { en: 'Quit', vi: 'Thoát' },
    press: { en: 'Press ENTER', vi: 'Nhấn ENTER' },
    resume: { en: 'Resume', vi: 'Tiếp tục' }, restart: { en: 'Restart level', vi: 'Chơi lại màn' }, tomap: { en: 'World map', vi: 'Bản đồ thế giới' }, totitle: { en: 'Title screen', vi: 'Màn hình chính' },
    paused: { en: 'PAUSED', vi: 'TẠM DỪNG' },
    died: { en: 'Your flame went out...', vi: 'Ngọn lửa của bạn đã tắt...' },
    retry: { en: 'ENTER: Retry from lantern   ESC: Map', vi: 'ENTER: Hồi sinh tại đèn   ESC: Bản đồ' },
    clear: { en: 'SUN FRAGMENT RECLAIMED!', vi: 'ĐÃ LẤY LẠI MẢNH MẶT TRỜI!' },
    coins: { en: 'Coins', vi: 'Xu' }, shards: { en: 'Sun Shards', vi: 'Mảnh nắng' }, time: { en: 'Time', vi: 'Thời gian' },
    cont2: { en: 'ENTER: Continue', vi: 'ENTER: Tiếp tục' },
    boss: { en: 'GUARDIAN', vi: 'THỦ HỘ' },
    mapt: { en: 'THE ROAD OF AURELIA', vi: 'CON ĐƯỜNG AURELIA' },
    maphelp: { en: '←/→ choose   ENTER play   ESC back', vi: '←/→ chọn   ENTER chơi   ESC quay lại' },
    locked: { en: 'LOCKED', vi: 'CHƯA MỞ' },
    ab1: { en: 'NEW: Double Jump — press jump in mid-air', vi: 'MỚI: Nhảy đôi — nhấn nhảy khi đang bay' },
    ab3: { en: 'NEW: Dash — press K / Shift (you are invincible while dashing)', vi: 'MỚI: Lướt — nhấn K / Shift (bất tử khi lướt)' },
    ctl: { en: 'Move A/D  Jump Space  Attack J  Dash K  (↓+J in air = pogo)', vi: 'Di chuyển A/D  Nhảy Space  Đánh J  Lướt K  (↓+J trên không = nảy)' },
    thanks: { en: 'Thank you for playing!', vi: 'Cảm ơn bạn đã chơi!' },
    talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },
    shop1: { en: 'Potion - restore all hearts (15 coins)', vi: 'Thuốc - hồi đầy tim (15 xu)' },
    shop2: { en: 'Charm - blocks the next hit (25 coins)', vi: 'Bùa - đỡ 1 đòn tiếp theo (25 xu)' },
    shop3: { en: 'Leave', vi: 'Tạm biệt' }, wallet: { en: 'Coins', vi: 'Xu' }, nomoney: { en: 'Not enough coins!', vi: 'Không đủ xu!' },
    healed: { en: 'You feel warm again. Hearts restored.', vi: 'Bạn thấy ấm lại. Tim đã hồi đầy.' }, bought: { en: 'Pleasure doing business!', vi: 'Giao dịch vui vẻ!' },
    hearts: { en: 'Max hearts', vi: 'Tim tối đa' }, dmg: { en: 'Sword power', vi: 'Sức mạnh kiếm' }
  };
  const T = k => (STR[k] && STR[k][save.lang]) || k;
  const LN = o => o[save.lang];

  const STORY = [
    { en: 'Long ago, the Sun watched over the world of Aurelia, and no night was ever truly dark.', vi: 'Ngày xửa ngày xưa, Mặt Trời dõi theo vùng đất Aurelia, và không đêm nào thật sự tối.' },
    { en: 'Then the Eclipse came — a hunger made of shadow. It struck the Sun, and the Sun shattered into seven fragments.', vi: 'Rồi Nhật Thực xuất hiện — một cơn đói làm từ bóng tối. Nó đánh vỡ Mặt Trời thành bảy mảnh.' },
    { en: 'The sky went cold. Monsters crept out of every corner of the land.', vi: 'Bầu trời trở nên lạnh giá. Quái vật bò ra từ mọi ngóc ngách của vùng đất.' },
    { en: 'You are Ember, the last Lanternbearer. Your small flame is all that is left of the light.', vi: 'Bạn là Ember, người mang đèn cuối cùng. Ngọn lửa nhỏ của bạn là tất cả ánh sáng còn lại.' },
    { en: 'Cross meadow, forest, cavern, desert, peak and fire. Reclaim the fragments. Relight the Sun.', vi: 'Băng qua đồng cỏ, rừng sâu, hang động, sa mạc, đỉnh băng và núi lửa. Lấy lại các mảnh. Thắp lại Mặt Trời.' }
  ];
  const ENDING = [
    { en: 'The seventh fragment trembles in your hands... and the Eclipse screams, and breaks.', vi: 'Mảnh thứ bảy rung lên trong tay bạn... Nhật Thực gào thét rồi vỡ tan.' },
    { en: 'Seven fragments rise into the sky. They find each other. They burn.', vi: 'Bảy mảnh bay lên trời. Chúng tìm thấy nhau. Chúng bừng cháy.' },
    { en: 'Dawn breaks over Aurelia. Your little lantern flickers, and goes quiet — its work is done.', vi: 'Bình minh ló rạng trên Aurelia. Ngọn đèn nhỏ của bạn chập chờn rồi lặng đi — nhiệm vụ đã xong.' },
    { en: 'Thank you, Ember.', vi: 'Cảm ơn bạn, Ember.' }
  ];

  const NPCS = {
    lila: { spr: 'npc_lila', name: { en: 'Lila', vi: 'Lila' } },
    bram: { spr: 'npc_bram', name: { en: 'Captain Bram', vi: 'Đội trưởng Bram' } },
    gob: { spr: 'npc_gob', name: { en: 'Gob the Swamp Goblin', vi: 'Gob Yêu Tinh Đầm Lầy' }, shop: true },
    angel: { spr: 'npc_angel', name: { en: 'Seraph', vi: 'Thiên thần Seraph' }, bless: true }
  };
  const DLG = {
    0: { lila: [
      { en: 'Ember! The Sun fell silent three nights ago. Every lantern in the village went out.', vi: 'Ember! Mặt Trời đã tắt lịm ba đêm trước. Mọi chiếc đèn trong làng đều vụt tắt.' },
      { en: 'Yours is the last flame in Aurelia. Follow the road east - the fragments fell that way.', vi: 'Đèn của bạn là ngọn lửa cuối cùng ở Aurelia. Hãy đi về phía đông - các mảnh mặt trời rơi hướng đó.' },
      { en: 'Slimes hate light... and they are hungry. Swing your sword - press J!', vi: 'Slime ghét ánh sáng... mà chúng lại đói. Vung kiếm đi - nhấn J!' }
    ] },
    1: { bram: [
      { en: 'Halt! Captain Bram of the Dawn Guard. This forest has been cursed since the Sun broke.', vi: 'Dừng lại! Đội trưởng Bram của Đội Vệ Binh Bình Minh. Khu rừng này bị nguyền rủa từ khi Mặt Trời vỡ.' },
      { en: 'Villagers who wandered in came out... wrong. Do not let them touch you.', vi: 'Dân làng lạc vào đây đi ra đã... biến dạng. Đừng để chúng chạm vào bạn.' },
      { en: 'The Spider Queen nests deep inside. When she charges, strike her as she recovers.', vi: 'Nữ Hoàng Nhện làm tổ sâu bên trong. Khi nó lao tới, hãy tấn công lúc nó đang hồi sức.' }
    ], gob: [
      { en: 'Psst! Gob has potions! Gob found them in the swamp. Gob did NOT steal them.', vi: 'Xì! Gob có thuốc đây! Gob nhặt ở đầm lầy. Gob KHÔNG ăn trộm đâu.' },
      { en: 'Coins for goodies, shiny one. Fair price. Mostly.', vi: 'Xu đổi hàng ngon, người sáng chói ạ. Giá công bằng. Phần lớn là vậy.' }
    ] },
    2: { gob: [
      { en: 'Heehee! Gob follows the glowing rocks. Crystals hum louder when something big is near.', vi: 'Hê hê! Gob đi theo đá phát sáng. Tinh thể kêu to hơn khi có thứ gì khổng lồ ở gần.' },
      { en: 'Falling rocks here! Watch the markers on the ground - they warn you.', vi: 'Ở đây có đá rơi! Nhìn dấu hiệu trên mặt đất - chúng báo trước cho bạn đó.' }
    ] },
    3: { bram: [
      { en: 'You again! I led my soldiers here after the Pharaoh woke. The sand swallowed them.', vi: 'Lại là bạn! Tôi dẫn lính tới đây khi Pharaoh thức giấc. Cát đã nuốt chửng họ.' },
      { en: 'Beware the statues that shoot, and spikes hiding in the sand. Time your jumps!', vi: 'Coi chừng tượng bắn tên, và gai ẩn dưới cát. Canh thời gian mà nhảy!' },
      { en: 'You learned to dash, did you? Use it - you cannot be hurt while dashing.', vi: 'Bạn đã học được lướt rồi à? Hãy dùng nó - lướt thì không bị thương.' }
    ] },
    4: { angel: [
      { en: 'I am Seraph. I fell with the Sun, and I have waited in the snow for someone with a light.', vi: 'Ta là Seraph. Ta rơi xuống cùng Mặt Trời, và đã chờ trong tuyết một người mang ánh sáng.' },
      { en: 'The Eclipse feeds on every missing fragment. Each one you return starves it.', vi: 'Nhật Thực ăn từng mảnh bị mất. Mỗi mảnh bạn mang về sẽ làm nó đói.' },
      { en: 'Take a little warmth, bearer. I can give no more.', vi: 'Nhận chút hơi ấm đi, người mang đèn. Ta chỉ có thể cho bấy nhiêu.' }
    ] },
    5: { gob: [
      { en: 'Hot hot hot! Gob hates this place. Fire vents breathe in a rhythm - count before you cross.', vi: 'Nóng nóng nóng! Gob ghét chỗ này. Vòi lửa phun theo nhịp - đếm rồi hãy băng qua.' },
      { en: 'Buy a charm, shiny one. You will want it before the Titan.', vi: 'Mua bùa đi, người sáng chói. Bạn sẽ cần nó trước khi gặp Titan.' }
    ] },
    6: { lila: [
      { en: 'I could not stay home. I followed your light the whole way. I brought bread!', vi: 'Em không thể ở nhà. Em đi theo ánh sáng của bạn suốt chặng đường. Em mang bánh mì nè!' },
      { en: 'Whatever happens up there... the village believes in you.', vi: 'Dù chuyện gì xảy ra trên đó... cả làng tin ở bạn.' }
    ], angel: [
      { en: 'Light does not need to be large to matter, Ember. Only unbroken.', vi: 'Ánh sáng không cần lớn mới có ý nghĩa, Ember. Chỉ cần không tắt.' }
    ], bram: [
      { en: 'Go. My Guard will hold the door behind you. For Aurelia!', vi: 'Đi đi. Vệ Binh của tôi sẽ giữ cửa sau lưng bạn. Vì Aurelia!' }
    ] }
  };

  // ---------- text queue (drawn at native resolution after blit) ----------
  let texts = [];
  function txt(s, x, y, o) { o = o || {}; texts.push({ s, x, y, size: o.size || 8, col: o.col || '#fff', al: o.al || 'left', sh: o.sh === undefined ? true : o.sh, alpha: o.alpha === undefined ? 1 : o.alpha, bold: o.bold }); }
  function flushTexts() {
    ctx.textBaseline = 'middle';
    for (const t of texts) {
      ctx.font = (t.bold ? 'bold ' : '') + Math.round(t.size * scale) + 'px ' + FONT;
      ctx.textAlign = t.al; ctx.globalAlpha = t.alpha;
      const px = offX + t.x * scale, py = offY + t.y * scale;
      if (t.sh) { ctx.fillStyle = '#0a0612'; ctx.fillText(t.s, px + scale, py + scale); }
      ctx.fillStyle = t.col; ctx.fillText(t.s, px, py);
    }
    ctx.globalAlpha = 1; texts = [];
  }
  function wrapText(s, maxChars) {
    const words = s.split(' '), lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
    if (cur.trim()) lines.push(cur.trim()); return lines;
  }

  // ---------- input ----------
  const keys = {}, pressed = {};
  addEventListener('keydown', e => {
    if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) >= 0) e.preventDefault();
    Snd.init();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('mousedown', () => Snd.init());
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  const any = (o, codes) => codes.some(c => o[c]);
  let gpPrev = {};
  const act = {};
  function readInput() {
    const gp = (navigator.getGamepads && navigator.getGamepads()[0]) || null;
    const gb = {}; let ax = 0, ay = 0;
    if (gp) {
      ax = gp.axes[0] || 0; ay = gp.axes[1] || 0;
      const b = i => gp.buttons[i] && gp.buttons[i].pressed;
      gb.a = b(0); gb.b = b(1); gb.x = b(2); gb.y = b(3); gb.start = b(9); gb.lb = b(4); gb.rb = b(5); gb.rt = b(7);
      gb.l = b(14) || ax < -0.5; gb.r = b(15) || ax > 0.5; gb.u = b(12) || ay < -0.5; gb.d = b(13) || ay > 0.5;
    }
    const gpP = n => gb[n] && !gpPrev[n];
    act.left = keys.ArrowLeft || keys.KeyA || gb.l; act.right = keys.ArrowRight || keys.KeyD || gb.r;
    act.up = keys.ArrowUp || keys.KeyW || gb.u; act.down = keys.ArrowDown || keys.KeyS || gb.d;
    act.jump = any(keys, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gb.a;
    act.jumpP = any(pressed, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gpP('a');
    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x') || gpP('rb');
    act.dashP = any(pressed, ['KeyK', 'KeyC', 'ShiftLeft', 'ShiftRight']) || gpP('b') || gpP('rt') || gpP('y');
    act.pauseP = pressed.Escape || pressed.KeyP || gpP('start');
    act.okP = any(pressed, ['Enter', 'Space', 'KeyZ', 'KeyJ']) || gpP('a');
    act.backP = pressed.Escape || gpP('b');
    act.leftP = any(pressed, ['ArrowLeft', 'KeyA']) || gpP('l'); act.rightP = any(pressed, ['ArrowRight', 'KeyD']) || gpP('r');
    act.upP = any(pressed, ['ArrowUp', 'KeyW']) || gpP('u'); act.downP = any(pressed, ['ArrowDown', 'KeyS']) || gpP('d');
    act.talkP = pressed.KeyE || pressed.Enter || gpP('lb');
    act.muteP = pressed.KeyM; act.fullP = pressed.KeyF || pressed.F11;
    gpPrev = gb;
  }
  function clearPressed() { for (const k in pressed) pressed[k] = false; act.jumpP = act.atkP = act.dashP = act.pauseP = act.talkP = act.okP = act.backP = act.leftP = act.rightP = act.upP = act.downP = false; }
  function toggleFull() {
    try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) { }
  }

  // ---------- touch controls (phones / tablets) ----------
  const touch = { on: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0), ptr: new Map(), down: {} };
  function touchButtons() {
    const w = cv.width, h = cv.height, s = Math.min(w, h) / 5.2, r = s * 0.5;
    const b = [
      { k: 'ArrowLeft', x: s * 0.8, y: h - s * 0.9, r, l: '◀' }, { k: 'ArrowRight', x: s * 2.0, y: h - s * 0.9, r, l: '▶' },
      { k: 'Space', x: w - s * 0.8, y: h - s * 0.9, r: r * 1.15, l: '▲' }, { k: 'KeyJ', x: w - s * 2.1, y: h - s * 0.75, r, l: 'X' },
      { k: 'KeyK', x: w - s * 1.5, y: h - s * 1.9, r: r * 0.85, l: '»' }, { k: 'Escape', x: w - s * 0.5, y: s * 0.5, r: r * 0.7, l: 'II' }
    ];
    if (scene === 'play' && Q && Q.nearNpc && Q.state === 'play') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '...' });
    if (scene !== 'play' || (Q && (Q.state === 'pause' || Q.state === 'shop'))) { b.push({ k: 'ArrowUp', x: s * 1.4, y: h - s * 2.0, r, l: '▲' }); b.push({ k: 'ArrowDown', x: s * 1.4, y: h - s * 0.2 - s * 0.0, r: 0.01, l: '' }); b[b.length - 1] = { k: 'ArrowDown', x: s * 2.7, y: h - s * 2.0, r, l: '▼' }; }
    return b;
  }
  function touchUpdate() {
    const btns = touchButtons(), now = {};
    for (const p of touch.ptr.values()) for (const b of btns) if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.35) now[b.k] = true;
    for (const b of btns) {
      if (now[b.k] && !touch.down[b.k]) { keys[b.k] = true; pressed[b.k] = true; }
      if (!now[b.k] && touch.down[b.k]) keys[b.k] = false;
    }
    for (const k in touch.down) if (!now[k] && !btns.some(b => b.k === k)) keys[k] = false;
    touch.down = now;
  }
  function touchEvt(e) {
    e.preventDefault(); Snd.init();
    const rc = cv.getBoundingClientRect();
    if (e.type === 'pointerup' || e.type === 'pointercancel') touch.ptr.delete(e.pointerId);
    else touch.ptr.set(e.pointerId, { x: (e.clientX - rc.left) * cv.width / rc.width, y: (e.clientY - rc.top) * cv.height / rc.height });
    if (e.type === 'pointerdown' && touch.on && !document.fullscreenElement) { try { document.documentElement.requestFullscreen(); } catch (x) { } }
    touchUpdate();
  }
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, touchEvt, { passive: false }));
  function drawTouch() {
    if (!touch.on) return;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const b of touchButtons()) {
      const on = touch.down[b.k];
      ctx.globalAlpha = on ? 0.55 : 0.3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.fillStyle = '#0a0612'; ctx.font = 'bold ' + Math.round(b.r * 0.8) + 'px ' + FONT; ctx.fillText(b.l, b.x, b.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- enemy / boss configs ----------
  const EN = {
    slime: { spr: 'slime', w: 12, h: 9, hp: 2, sp: 20, ai: 'hop', jump: 170 },
    iceslime: { spr: 'slime', swap: { g: 'c', t: 'w', G: 'C' }, w: 12, h: 9, hp: 2, sp: 22, ai: 'hop', jump: 180 },
    lavaslime: { spr: 'slime', swap: { g: 'o', t: 'y', G: 'r' }, w: 12, h: 9, hp: 3, sp: 24, ai: 'hop', jump: 190 },
    shadeslime: { spr: 'slime', swap: { g: 'p', t: 'h', G: 'P' }, out: '#a15be0', w: 12, h: 9, hp: 3, sp: 28, ai: 'hop', jump: 200 },
    bee: { spr: 'bat', swap: { p: 'y', P: 'N' }, w: 12, h: 7, hp: 1, sp: 44, ai: 'fly' },
    bat: { spr: 'bat', w: 12, h: 7, hp: 1, sp: 54, ai: 'fly' },
    icebat: { spr: 'bat', swap: { p: 'c', P: 'b' }, w: 12, h: 7, hp: 2, sp: 56, ai: 'fly' },
    firebat: { spr: 'bat', swap: { p: 'o', P: 'r' }, w: 12, h: 7, hp: 2, sp: 62, ai: 'fly' },
    vulture: { spr: 'bat', swap: { p: 'n', P: 'N' }, w: 12, h: 7, hp: 2, sp: 58, ai: 'fly' },
    spider: { spr: 'spider', w: 12, h: 7, hp: 2, sp: 30, ai: 'hop', jump: 210 },
    cavespider: { spr: 'spider', swap: { P: 'C', D: 'B', r: 'y' }, out: '#6ee7f2', w: 12, h: 7, hp: 3, sp: 38, ai: 'hop', jump: 230 },
    mummy: { spr: 'skeleton', swap: { e: 'w', E: 'l' }, w: 9, h: 15, hp: 3, sp: 26, ai: 'charge' },
    burnt: { spr: 'skeleton', swap: { e: 'D', E: 'd', k: 'o' }, out: '#ff9a2a', w: 9, h: 15, hp: 4, sp: 28, ai: 'charge' },
    shadowskel: { spr: 'skeleton', swap: { e: 'P', E: 'D', k: 'm' }, out: '#a15be0', w: 9, h: 15, hp: 4, sp: 30, ai: 'charge' },
    scorpion: { spr: 'scorpion', w: 14, h: 7, hp: 2, sp: 38, ai: 'walk' },
    snowman: { spr: 'snowman', w: 10, h: 12, hp: 3, sp: 0, ai: 'shoot' },
    fire: { spr: 'fire', w: 10, h: 10, hp: 2, sp: 40, ai: 'flyshoot' },
    ghost: { spr: 'ghost', swap: { w: 'c', k: 'B' }, out: '#6ee7f2', w: 10, h: 11, hp: 2, sp: 34, ai: 'ghost' },
    knight: { spr: 'knight', out: '#a15be0', w: 10, h: 15, hp: 5, sp: 34, ai: 'charge' },
    beetle: { spr: 'beetle', w: 10, h: 6, hp: 1, sp: 34, ai: 'walk' },
    sandbeetle: { spr: 'beetle', swap: { n: 'Y', N: 'n', r: 'k' }, w: 10, h: 6, hp: 1, sp: 40, ai: 'walk' },
    wisp: { spr: 'wisp', w: 8, h: 8, hp: 1, sp: 46, ai: 'fly' },
    shadewisp: { spr: 'wisp', swap: { c: 'p', w: 'm' }, out: '#a15be0', w: 8, h: 8, hp: 1, sp: 50, ai: 'fly' },
    imp: { spr: 'imp', w: 10, h: 11, hp: 2, sp: 56, ai: 'fly' },
    shadeimp: { spr: 'imp', swap: { r: 'P', R: 'D', e: 'h', w: 'm' }, out: '#a15be0', w: 10, h: 11, hp: 3, sp: 60, ai: 'fly' },
    shroom: { spr: 'shroom', w: 10, h: 10, hp: 2, sp: 0, ai: 'shoot', proj: '#a4e86b', spd: 55 },
    zombie: { spr: 'zombie', w: 9, h: 14, hp: 3, sp: 20, ai: 'walk' },
    lavablob: { spr: 'slime', swap: { g: 'o', t: 'y', G: 'r' }, w: 8, h: 8, hp: 1, sp: 0, ai: 'blob' }
  };
  const BOSS = [
    { name: { en: 'King Slime', vi: 'Vua Slime' }, w: 38, h: 26, hp: 8, pat: ['jump', 'jump', 'summon'], minion: 'slime', sp: 18 },
    { name: { en: 'Spider Queen', vi: 'Nữ Hoàng Nhện' }, w: 40, h: 26, hp: 12, pat: ['charge', 'shoot', 'summon', 'jump'], minion: 'spider', sp: 22 },
    { name: { en: 'Crystal Golem', vi: 'Người Khổng Lồ Pha Lê' }, w: 34, h: 44, hp: 16, pat: ['jump', 'rain', 'shoot', 'charge'], minion: 'wisp', sp: 16 },
    { name: { en: 'Sand Pharaoh', vi: 'Pharaoh Cát' }, w: 26, h: 52, hp: 20, pat: ['charge', 'rain', 'summon', 'spin'], minion: 'scorpion', sp: 24 },
    { name: { en: 'Frost King', vi: 'Vua Băng' }, w: 36, h: 48, hp: 24, pat: ['shoot', 'rain', 'jump', 'spin'], minion: 'iceslime', sp: 16 },
    { name: { en: 'Magma Titan', vi: 'Titan Dung Nham' }, w: 40, h: 50, hp: 28, pat: ['jump', 'spin', 'rain', 'charge', 'shoot'], minion: 'imp', sp: 20 },
    { name: { en: 'THE ECLIPSE', vi: 'NHẬT THỰC' }, w: 30, h: 56, hp: 36, pat: ['charge', 'shoot', 'rain', 'spin', 'jump', 'summon'], minion: 'ghost', sp: 26, eclipse: true }
  ];

  // ---------- caches ----------
  const tileCache = {}, bgCache = {};
  const tiles = li => tileCache[li] || (tileCache[li] = buildTileset(BIOMES[li]));
  const bgs = li => bgCache[li] || (bgCache[li] = buildBackground(BIOMES[li]));
  
  // ============================== GAMEPLAY STATE ==============================
  let Q = null; // current play context
  const GRAV = 820, JUMP = 292, DJUMP = 262, RUN = 112;

  function ch(tx, ty) {
    const L = Q.L;
    if (tx < 0 || tx >= L.W) return '#';
    if (ty < 0) return ' ';
    if (ty >= L.H) return ' ';
    return L.grid[ty][tx];
  }
  function solid(tx, ty) {
    const c = ch(tx, ty);
    if (c === '#' || c === 'I') return true;
    if (c === 'C') { const s = Q.crum.get(ty * Q.L.W + tx); return !(s && s.st === 2); }
    return false;
  }
  function moveX(e, dx) {
    e.x += dx;
    const y0 = Math.floor(e.y / TS), y1 = Math.floor((e.y + e.h - 0.01) / TS);
    const x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (solid(tx, ty)) {
        if (dx > 0) e.x = tx * TS - e.w; else if (dx < 0) e.x = (tx + 1) * TS;
        e.vx = e.isPlayer ? 0 : e.vx; return true;
      }
    }
    return false;
  }
  function moveY(e, dy) {
    const prevBottom = e.y + e.h;
    e.y += dy; e.onGround = false;
    const x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - 0.01) / TS);
    if (dy >= 0) {
      const by = Math.floor((e.y + e.h) / TS);
      for (let tx = x0; tx <= x1; tx++) {
        const c = ch(tx, by);
        if (solid(tx, by) || (c === '=' && !e.noOneWay && (e.drop || 0) <= 0 && prevBottom <= by * TS + 0.5)) {
          e.y = by * TS - e.h; e.vy = 0; e.onGround = true; e.groundCh = c; e.gtx = tx; e.gty = by;
          if (e.isPlayer && c === 'C') crumbleStart(tx, by);
          return true;
        }
      }
    } else {
      const ty = Math.floor(e.y / TS);
      for (let tx = x0; tx <= x1; tx++) if (solid(tx, ty)) { e.y = (ty + 1) * TS; e.vy = 0; return true; }
    }
    return false;
  }
  function crumbleStart(tx, ty) {
    const k = ty * Q.L.W + tx; if (!Q.crum.has(k)) Q.crum.set(k, { st: 0, t: 0, tx, ty });
    const s = Q.crum.get(k); if (s.st === 0) { s.st = 1; s.t = 0; }
  }
  function groundAhead(e, dir) {
    const fx = dir > 0 ? e.x + e.w + 2 : e.x - 2, fy = e.y + e.h + 3;
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    const c = ch(tx, ty);
    return solid(tx, ty) || c === '=';
  }

  // ---------- particles ----------
  function emit(x, y, n, o) {
    o = o || {};
    for (let i = 0; i < n; i++) {
      if (Q.parts.length > 500) Q.parts.shift();
      const a = rr(0, Math.PI * 2), sp = rr(o.sp0 || 10, o.sp1 || 60);
      Q.parts.push({ x, y, vx: Math.cos(a) * sp * (o.sx === undefined ? 1 : o.sx) + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0), life: rr(o.l0 || 0.3, o.l1 || 0.7), max: 1, col: Array.isArray(o.col) ? o.col[(Math.random() * o.col.length) | 0] : (o.col || '#ffd34e'), size: o.size || 1, grav: o.grav === undefined ? 120 : o.grav });
    }
  }

  // ---------- level start ----------
  function newPlayer() {
    return { isPlayer: true, x: 0, y: 0, w: 8, h: 14, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumps: 0, atk: 0, atkCd: 0, atkHit: null, atkDown: false, dash: 0, dashCd: 0, inv: 0, hp: maxHP(), anim: 0, drop: 0, riding: null, safeT: 0, wasGround: false, lastVy: 0 };
  }
  function startLevel(li) {
    const L = genLevel(li);
    const P = newPlayer();
    P.x = L.start.x; P.y = L.start.y - P.h;
    Q = {
      li, L, P, B: L.B, bg: bgs(li), ts: tiles(li), crum: new Map(), taken: new Set(), cp: null, cpIdx: -1,
      ents: [], items: [], projs: [], traps: [], parts: [], boss: null, nearNpc: null, talk: null, state: 'intro', stateT: 0, t: 0, freeze: 0, shake: 0,
      cam: { x: 0, y: 0 }, coinsRun: 0, time: 0, safe: { x: P.x, y: P.y }, menu: 0,
      dj: li >= 1 || save.cleared.indexOf(0) >= 0, dashAb: li >= 3 || save.cleared.indexOf(2) >= 0,
      arenaSealed: false, bossDead: false, weather: [], banner: 0, msg: null, msgT: 0
    };
    if (!save.shards[li]) save.shards[li] = [0, 0, 0];
    initEntities();
    initWeather();
    snapCam();
    scene = 'play';
    Snd.music('lvl' + li, L.B.music);
    if (li === 1) Q.msg = T('ab1'); else if (li === 3) Q.msg = T('ab3'); else if (li === 0) Q.msg = T('ctl');
    Q.msgT = Q.msg ? 6 : 0;
  }
  function initEntities() {
    const L = Q.L;
    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.boss = null; Q.nearNpc = null;
    for (const s of L.spawns) {
      if (Q.taken.has(s.id)) continue;
      if (s.type === 'coin') Q.items.push({ kind: 'coin', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'heart') Q.items.push({ kind: 'heart', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'shard') { if (!save.shards[Q.li][s.k]) Q.items.push({ kind: 'shard', x: s.x, y: s.y, id: s.id, k: s.k, ph: 0 }); }
      else if (s.type === 'boss') Q.boss = makeBoss(s);
      else if (s.type === 'npc') Q.items.push({ kind: 'npc', who: s.who, x: s.x, y: s.y, id: s.id, ph: Math.random() * 6 });
      else if (['turret', 'spiketrap', 'jets', 'saw', 'rockfall'].indexOf(s.type) >= 0) Q.traps.push({ type: s.type, x: s.x, y: s.y, t: 0, off: s.off || 0, w: s.w || 2, dir: s.dir || -1, len: s.len || 6, x0: s.x - 8, cd: rr(0.5, 2), st: 'idle', ph: 0, id: s.id });
      else Q.ents.push(makeEnemy(s.type, s.x, s.y, s));
    }
    for (const c of L.checkpoints) Q.items.push({ kind: 'cp', x: c.x, y: c.y, id: c.id, lit: Q.cp && Q.cp.id === c.id });
    for (const p of L.plats) { p.t = 0; p.ph = 0; p.dx = p.dy = 0; p.x = p.x0; p.y = p.vert ? p.y1 : p.y0; }
  }
  function makeEnemy(type, x, y, s) {
    const c = EN[type];
    const e = { type, cfg: c, x: x - c.w / 2, y: y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp: c.hp, dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 5, cd: rr(0.5, 1.5), flash: 0, st: 'patrol', stT: 0, hx: x, hy: y, onGround: false, minion: !!(s && s.minion) };
    if (FLY.has(type) || c.ai === 'ghost' || c.ai === 'flyshoot') { e.y = y - c.h / 2; e.hy = e.y; e.fly = true; }
    if (c.ai === 'blob') { e.y = y + 10; e.hy = y; e.cd = rr(0.5, 2.5); e.st = 'wait'; }
    return e;
  }
  function makeBoss(s) {
    const c = BOSS[Q.li];
    return { isBoss: true, cfg: c, spr: bossSprite(Q.li), x: s.x - c.w / 2, y: s.y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp: c.hp + Math.floor(totalShards() / 7) * Math.floor(c.hp * 0.25), max: 0, dir: -1, st: 'sleep', timer: 0, flash: 0, t: 0, atk: null, ai: 0, onGround: false, noOneWay: true, thr: 0, n: 0, drop: 0 };
  }
  function initWeather() {
    const p = Q.B.particles, n = 46; Q.weather = [];
    for (let i = 0; i < n; i++) Q.weather.push({ x: Math.random() * VW, y: Math.random() * VH, ph: Math.random() * 6.28, s: rr(0.5, 1.5) });
    Q.wtype = p;
  }
  function snapCam() {
    const P = Q.P; Q.cam.x = clamp(P.x - VW / 2, 0, Math.max(0, Q.L.endX - VW)); Q.cam.y = clamp(P.y - VH * 0.55, 0, Q.L.H * TS - VH);
  }
  function respawn() {
    const P = Q.P, L = Q.L;
    P.hp = maxHP(); P.vx = P.vy = 0; P.inv = 1.5; P.atk = 0; P.dash = 0;
    const sp = Q.cp ? { x: Q.cp.x - P.w / 2, y: Q.cp.y - P.h } : { x: L.start.x, y: L.start.y - P.h };
    P.x = sp.x; P.y = sp.y; Q.safe = { x: P.x, y: P.y };
    if (Q.arenaSealed) unseal();
    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;
    initEntities(); snapCam(); Q.state = 'play'; Q.freeze = 0;
    Snd.music('lvl' + Q.li, Q.B.music);
  }
  function seal() {
    const L = Q.L, ar = L.arena;
    for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = '#';
    Q.arenaSealed = true;
    Q.state = 'bossintro'; Q.stateT = 0;
    Q.boss.st = 'intro'; Q.boss.max = Q.boss.hp;
    Snd.play('bossroar'); Snd.music('boss', BOSS_MUSIC);
    Q.shake = 0.6;
  }
  function unseal() { const L = Q.L, ar = L.arena; for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }

  // ============================== UPDATE ==============================
  function hurtPlayer(n, fromX, noKnock) {
    const P = Q.P;
    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play' && Q.state !== 'bossplay') return false;
    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); return false; }
    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;
    Snd.play('hurt');
    emit(P.x + P.w / 2, P.y + P.h / 2, 10, { col: ['#e0453a', '#f6f3e9'], sp0: 30, sp1: 90 });
    if (!noKnock) { P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 130; P.vy = -170; P.atk = 0; }
    if (P.hp <= 0) { P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 }); }
    return true;
  }
  function pitRecover() {
    const P = Q.P;
    if (Q.state !== 'play') return;
    P.inv = 0; P.dash = 0;
    hurtPlayer(1, P.x, true);
    if (Q.state === 'dead') return;
    P.x = Q.safe.x; P.y = Q.safe.y; P.vx = P.vy = 0; P.inv = 1.5;
  }

  function updatePlayer(dt) {
    const P = Q.P, L = Q.L;
    P.anim += dt; P.inv = Math.max(0, P.inv - dt); P.atkCd -= dt; P.dashCd -= dt; P.drop -= dt;
    // timers
    if (act.jumpP) P.jumpBuf = 0.12; else P.jumpBuf -= dt;
    if (P.onGround) { P.coyote = 0.09; P.jumps = 0; } else P.coyote -= dt;
    const dir = (act.right ? 1 : 0) - (act.left ? 1 : 0);
    const ice = P.onGround && P.groundCh === 'I';
    // dash
    if (act.dashP && Q.dashAb && P.dashCd <= 0 && P.dash <= 0) {
      P.dash = 0.17; P.dashCd = 0.7; P.dashDir = dir || P.face; P.vy = 0; P.inv = Math.max(P.inv, 0.2);
      Snd.play('dash'); emit(P.x + 4, P.y + 8, 8, { col: '#b8bfd0', sp0: 5, sp1: 30, vx: -P.dashDir * 50 });
    }
    if (P.dash > 0) {
      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;
      if (Math.random() < 0.8) emit(P.x + 4, P.y + 8, 1, { col: ['#6ee7f2', '#fff'], sp0: 0, sp1: 12, l0: 0.15, l1: 0.3, grav: 0 });
    } else {
      // horizontal
      const target = dir * RUN;
      const acc = ice ? 220 : (P.onGround ? 1100 : 750);
      if (dir !== 0 && P.atk <= 0.1) { P.face = dir; }
      if (dir !== 0 || !ice) {
        const a = (dir === 0 ? (ice ? 120 : 1300) : acc) * dt;
        if (P.vx < target) P.vx = Math.min(target, P.vx + a); else if (P.vx > target) P.vx = Math.max(target, P.vx - a);
      } else { P.vx *= (1 - 0.8 * dt); }
      // jump
      if (P.jumpBuf > 0) {
        if (act.down && P.onGround && ch(Math.floor((P.x + 4) / TS), Math.floor((P.y + P.h + 1) / TS)) === '=') { P.drop = 0.22; P.jumpBuf = 0; P.y += 2; }
        else if (P.coyote > 0) { P.vy = -JUMP; P.coyote = 0; P.jumpBuf = 0; P.jumps = 1; P.onGround = false; Snd.play('jump'); emit(P.x + 4, P.y + P.h, 5, { col: '#cfd6e6', sp0: 10, sp1: 30, vy: -10, grav: 60 }); }
        else if (Q.dj && P.jumps < 2) { P.vy = -DJUMP; P.jumps = 2; P.jumpBuf = 0; Snd.play('djump'); emit(P.x + 4, P.y + P.h, 10, { col: ['#6ee7f2', '#fff'], sp0: 20, sp1: 60, vy: 20 }); }
      }
      if (!act.jump && P.vy < -110) P.vy *= (1 - 9 * dt);
      const g2 = (act.jump && Math.abs(P.vy) < 50) ? GRAV * 0.62 : GRAV;
      P.vy = Math.min(380, P.vy + g2 * dt);
    }
    // attack
    if (act.atkP && P.atkCd <= 0 && P.dash <= 0) {
      P.atk = 0.2; P.atkCd = 0.27; P.atkHit = new Set(); P.atkDown = !P.onGround && act.down;
      Snd.play('slash');
    }
    if (P.atk > 0) P.atk -= dt;
    // riding platforms
    if (P.riding) { P.x += P.riding.dx; P.y += P.riding.dy; }
    moveX(P, P.vx * dt);
    const wasAir = !P.onGround, impact = P.vy;
    P.riding = null;
    moveY(P, P.vy * dt);
    // moving platforms
    if (P.vy >= 0 && !P.onGround) {
      for (const p of L.plats) {
        const bottom = P.y + P.h, prevB = bottom - P.vy * dt - p.dy;
        if (P.x + P.w > p.x + 1 && P.x < p.x + p.w - 1 && bottom >= p.y && prevB <= p.y + 5 && P.drop <= 0) {
          P.y = p.y - P.h; P.vy = 0; P.onGround = true; P.groundCh = 'P'; P.riding = p; break;
        }
      }
    }
    if (wasAir && P.onGround && impact > 180) { Snd.play('land'); emit(P.x + 4, P.y + P.h, 6, { col: '#cfd6e6', sp0: 15, sp1: 40, vy: -5, grav: 50 }); }
    // safe pos tracking
    if (P.onGround && P.groundCh !== 'C' && P.groundCh !== 'P') {
      P.safeT += dt;
      if (P.safeT > 0.2) {
        const lx = Math.floor((P.x - 1) / TS), rx = Math.floor((P.x + P.w + 1) / TS), by = Math.floor((P.y + P.h + 1) / TS);
        if (solid(lx, by) && solid(rx, by) && ch(Math.floor(P.x / TS), by - 1) !== '^') Q.safe = { x: P.x, y: P.y };
      }
    } else P.safeT = 0;
    // run dust
    if (P.onGround && Math.abs(P.vx) > 60 && Math.random() < 0.15) emit(P.x + 4, P.y + P.h, 1, { col: '#cfd6e6', sp0: 3, sp1: 10, vy: -8, grav: 20, l0: 0.2, l1: 0.35 });
    // lantern sparks
    if (Math.random() < 0.25) emit(P.x + 4 + P.face * 7, P.y + 6, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 2, sp1: 8, vy: -14, grav: -10, l0: 0.3, l1: 0.6 });
    // hazards
    const x0 = Math.floor(P.x / TS), x1 = Math.floor((P.x + P.w - 0.01) / TS), y0 = Math.floor(P.y / TS), y1 = Math.floor((P.y + P.h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = ch(tx, ty);
      if (c === '~') { pitRecover(); return; }
      if (c === '^') {
        const sy = ty * TS + 7;
        if (P.y + P.h > sy && P.x + P.w > tx * TS + 1 && P.x < tx * TS + TS - 1) {
          if (ty >= L.H - 2) { pitRecover(); return; }
          if (P.atkDown && P.atk > 0) { P.vy = -250; P.jumps = 1; P.atk = 0; Snd.play('hit'); }
          else if (P.inv <= 0 && P.dash <= 0) { hurtPlayer(1, tx * TS + 8); P.vy = -210; }
        }
      }
    }
    if (P.y > L.H * TS + 10) pitRecover();
    // sword
    if (P.atk > 0) swordHit();
    // arena trigger
    if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS) seal();
  }
  function swordRect() {
    const P = Q.P;
    if (P.atkDown) return { x: P.x - 5, y: P.y + P.h - 3, w: P.w + 10, h: 15 };
    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: 24, h: P.h + 5 } : { x: P.x - 23, y: P.y - 3, w: 24, h: P.h + 5 };
  }
  function swordHit() {
    const P = Q.P, r = swordRect(), dmg = swordDmg();
    const list = Q.ents.slice(); if (Q.boss && Q.boss.st !== 'sleep' && Q.boss.st !== 'intro' && !Q.bossDead) list.push(Q.boss);
    for (const e of list) {
      if (e.dead || P.atkHit.has(e)) continue;
      if (e.cfg && e.cfg.ai === 'blob' && e.st !== 'up') continue;
      if (ov(r, e)) {
        P.atkHit.add(e);
        if (e.isBoss) hurtBoss(e, dmg); else hurtEnemy(e, dmg);
        Q.freeze = 0.045; Snd.play('hit');
        if (P.atkDown) { P.vy = -250; P.jumps = 1; P.atk = 0; }
        else if (!P.onGround && false) { }
      }
    }
    // destroy projectiles
    for (const p of Q.projs) if (!p.boss && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
    for (const p of Q.projs) if (p.type !== 'wave' && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
  }
  function hurtEnemy(e, dmg) {
    e.hp -= dmg; e.flash = 0.12;
    const P = Q.P;
    if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; }
    emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });
    if (e.hp <= 0) {
      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
      if (!e.minion) {
        const n = Math.random() < 0.55 ? 1 : 0;
        for (let i = 0; i < n + (e.cfg.hp >= 4 ? 2 : 0); i++) Q.items.push({ kind: 'coin', x: e.x + e.w / 2 + rr(-5, 5), y: e.y, id: -1, vy: -rr(60, 120), vx: rr(-40, 40), ph: 0, drop: true });
        if (Math.random() < 0.08) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });
      }
      Snd.play('boom');
    }
  }
  function hurtBoss(b, dmg) {
    b.hp -= dmg; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);
    emit(b.x + b.w / 2, b.y + b.h / 2, 8, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 90 });
    const pct = b.hp / b.max;
    if (!b.t1 && pct < 0.66) { b.t1 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (!b.t2 && pct < 0.33) { b.t2 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (b.hp <= 0) {
      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0; Q.bossBooms = 0; Q.freeze = 0.25; Q.shake = 1;
      Snd.play('boom'); Snd.stop();
      Q.ents.forEach(e => { if (!e.dead) { e.dead = true; emit(e.x, e.y, 10, { col: '#fff' }); } });
      Q.projs.length = 0;
      const ar = Q.L.arena;
      Q.items.push({ kind: 'frag', x: clamp(b.x + b.w / 2, (ar.x0 + 5) * TS, (ar.x1 - 5) * TS), y: ar.gy * TS - 22, id: -1, ph: 0 });
    }
  }
  function updateBossDeath(dt) {
    if (!Q.bossDead || Q.bossDeadDone) return;
    const b = Q.boss; Q.bossDeadT += dt;
    if (Q.bossBooms < 5 && Q.bossDeadT > Q.bossBooms * 0.15) { Q.bossBooms++; Snd.play('boom'); emit(b.x + rr(0, b.w), b.y + rr(0, b.h), 30, { col: ['#fff', '#ffd34e', '#f08a2b', '#e0453a'], sp0: 30, sp1: 160 }); }
    if (Q.bossDeadT > 1.4) { Q.bossDeadDone = true; unseal(); Q.arenaSealed = false; Snd.play('win'); Snd.music('lvl' + Q.li, Q.B.music); }
  }
  function firePr(x, y, vx, vy, o) { Q.projs.push(Object.assign({ x, y, vx, vy, life: 4, grav: 0, col: Q.B.proj, type: 'ball', boss: false }, o || {})); Snd.play('shoot'); }

  function updateEnemies(dt) {
    const P = Q.P, cx = Q.cam.x + VW / 2;
    for (const e of Q.ents) {
      if (e.dead) continue;
      if (Math.abs(e.x - cx) > 260) continue;
      e.t += dt; if (e.flash > 0) e.flash -= dt;
      const c = e.cfg, dx = (P.x + P.w / 2) - (e.x + e.w / 2), dy = (P.y + P.h / 2) - (e.y + e.h / 2);
      switch (c.ai) {
        case 'walk': case 'hop': case 'charge': {
          if (e.stun > 0) e.stun -= dt;
          if (e.onGround) {
            e.cd -= dt;
            if (c.ai === 'charge') {
              if (e.st === 'patrol') {
                e.vx = e.dir * c.sp;
                if (Math.abs(dx) < 100 && Math.abs(dy) < 26 && (dx > 0) === (e.dir > 0)) { e.st = 'wind'; e.stT = 0.4; e.vx = 0; }
              } else if (e.st === 'wind') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 'rush'; e.stT = 0.9; e.dir = dx > 0 ? 1 : -1; } }
              else if (e.st === 'rush') { e.vx = e.dir * c.sp * 2.8; e.stT -= dt; if (e.stT <= 0) { e.st = 'rest'; e.stT = 0.6; } }
              else if (e.st === 'rest') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) e.st = 'patrol'; }
            } else {
              e.vx = e.dir * c.sp;
              if (c.ai === 'hop' && e.cd <= 0 && Math.abs(dx) < 110 && Math.abs(dy) < 70) {
                e.vy = -c.jump; e.vx = (dx > 0 ? 1 : -1) * c.sp * 2.8; e.dir = dx > 0 ? 1 : -1; e.cd = rr(1, 1.8);
              } else if (c.ai === 'hop' && e.cd < -2) e.cd = rr(0.3, 1);
            }
            if (e.st !== 'wind' && e.st !== 'rest' && !groundAhead(e, e.dir) && e.st !== 'rush') { e.dir *= -1; e.vx = e.dir * c.sp; }
            if (e.st === 'rush' && !groundAhead(e, e.dir)) { e.st = 'rest'; e.stT = 0.6; }
          }
          e.vy = Math.min(380, e.vy + GRAV * dt);
          if (moveX(e, e.vx * dt)) { e.dir *= -1; if (e.st === 'rush') { e.st = 'rest'; e.stT = 0.7; } }
          moveY(e, e.vy * dt);
          if (e.y > Q.L.H * TS + 20) e.dead = true;
          break;
        }
        case 'fly': {
          const near = Math.abs(dx) < 130 && Math.abs(dy) < 100;
          const tx = near ? P.x + P.w / 2 : e.hx + Math.sin(e.t * 0.7) * 45;
          const ty = near ? P.y - 6 + Math.sin(e.t * 3) * 10 : e.hy + Math.sin(e.t * 2) * 8;
          const mx = tx - (e.x + e.w / 2), my = ty - (e.y + e.h / 2), d = Math.hypot(mx, my) || 1;
          const sp = near ? c.sp : c.sp * 0.5;
          e.vx = lerp(e.vx, mx / d * sp, 0.05); e.vy = lerp(e.vy, my / d * sp, 0.05);
          if (Math.abs(e.vx) > 2) e.dir = e.vx > 0 ? 1 : -1;
          e.x += e.vx * dt; e.y += e.vy * dt; break;
        }
        case 'flyshoot': {
          e.x = e.hx - e.w / 2 + Math.sin(e.t * 0.9) * 30; e.y = e.hy + Math.sin(e.t * 2.2) * 8; e.dir = dx > 0 ? 1 : -1;
          e.cd -= dt;
          if (Math.abs(dx) < 170 && Math.abs(dy) < 110) {
            if (e.cd <= 0) { e.cd = 2.2; e.st = 'wind'; e.stT = 0.35; }
          }
          if (e.st === 'wind') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; const a = Math.atan2(dy, dx); firePr(e.x + e.w / 2, e.y + e.h / 2, Math.cos(a) * 85, Math.sin(a) * 85, { col: '#ff9a2a' }); } }
          break;
        }
        case 'shoot': {
          e.dir = dx > 0 ? 1 : -1; e.vy = Math.min(380, e.vy + GRAV * dt); moveY(e, e.vy * dt);
          e.cd -= dt;
          if (Math.abs(dx) < 160 && Math.abs(dy) < 70 && e.cd <= 0) { e.cd = 2.1; e.st = 'wind'; e.stT = 0.35; }
          if (e.st === 'wind') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; const a = Math.atan2(dy, dx); const sp = c.spd || 95; firePr(e.x + e.w / 2, e.y + 4, Math.cos(a) * sp, Math.sin(a) * sp, { col: c.proj || '#bfeaff' }); } }
          break;
        }
        case 'ghost': {
          const near = Math.abs(dx) < 150 && Math.abs(dy) < 110;
          if (near) { const d = Math.hypot(dx, dy) || 1; e.vx = lerp(e.vx, dx / d * c.sp, 0.03); e.vy = lerp(e.vy, dy / d * c.sp, 0.03); }
          else { e.vx = lerp(e.vx, Math.sin(e.t) * 12, 0.05); e.vy = lerp(e.vy, Math.cos(e.t * 1.3) * 10, 0.05); }
          e.dir = e.vx > 0 ? 1 : -1; e.x += e.vx * dt; e.y += e.vy * dt; break;
        }
        case 'blob': {
          if (e.st === 'wait') { e.cd -= dt; e.y = e.hy + 12; if (e.cd <= 0) { e.st = 'up'; e.vy = -rr(210, 270); } }
          else { e.vy += 520 * dt; e.y += e.vy * dt; if (e.vy > 0 && e.y >= e.hy + 12) { e.st = 'wait'; e.cd = rr(1.2, 2.8); } if (Math.random() < 0.3) emit(e.x + 4, e.y + 6, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 14, grav: 40, l0: 0.2, l1: 0.4 }); }
          break;
        }
      }
      // contact
      if (!e.dead && (c.ai !== 'blob' || e.st === 'up') && ov(P, { x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 })) hurtPlayer(1, e.x + e.w / 2);
    }
    Q.ents = Q.ents.filter(e => !e.dead);
  }

  function bossStart(b) {
    const P = Q.P, c = b.cfg;
    switch (b.atk) {
      case 'jump': b.vy = -310; b.vx = clamp((P.x - b.x) * 1.4, -140, 140); b.st = 'air'; b.jt = 0; b.onGround = false; break;
      case 'charge': b.dir = P.x < b.x ? -1 : 1; b.st = 'charge'; b.timer = 1.3; break;
      case 'shoot': b.st = 'shoot'; b.n = 2 + (Q.li > 3 ? 1 : 0); b.timer = 0; break;
      case 'rain': b.st = 'rain'; b.timer = 2.4; b.drop = 0; break;
      case 'spin': b.st = 'spin'; b.n = 2 + (Q.li > 4 ? 1 : 0); b.timer = 0; b.rot = 0; break;
      case 'summon': {
        let alive = Q.ents.filter(e => !e.dead).length;
        for (let i = 0; i < 2 && alive < 4; i++, alive++) { const m = makeEnemy(c.minion, b.x + b.w / 2 + (i ? 30 : -30), b.y + b.h - 4, { minion: true }); m.fly || (m.vy = -150); Q.ents.push(m); emit(m.x, m.y, 10, { col: Q.B.proj }); }
        Snd.play('bossroar'); b.st = 'rec'; b.timer = 0.9; break;
      }
    }
  }
  function updateBoss(dt) {
    const b = Q.boss; if (!b || b.dead) return;
    const P = Q.P, ar = Q.L.arena, c = b.cfg;
    b.t += dt; if (b.flash > 0) b.flash -= dt;
    const fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7;
    if (b.st === 'sleep') return;
    if (b.st === 'intro') { b.timer += dt; if (b.timer > 2.2) { b.st = 'wait'; b.timer = 0.8; Q.state = 'play'; } return; }
    b.vy = Math.min(420, b.vy + GRAV * dt);
    const cxm = b.x + b.w / 2, cym = b.y + b.h / 2;
    switch (b.st) {
      case 'wait':
        b.dir = P.x + 4 < cxm ? -1 : 1;
        if (Math.abs(P.x - cxm) > 70) moveX(b, b.dir * c.sp * fury * dt);
        b.timer -= dt;
        if (b.timer <= 0) { b.atk = c.pat[Math.floor(Math.random() * c.pat.length)]; if (b.atk === b.lastAtk && Math.random() < 0.7) b.atk = c.pat[(c.pat.indexOf(b.atk) + 1) % c.pat.length]; b.lastAtk = b.atk; b.st = 'tele'; b.timer = 0.6 / fury; Snd.play('shoot'); }
        break;
      case 'tele': b.timer -= dt; b.dir = P.x + 4 < cxm ? -1 : 1; if (b.timer <= 0) bossStart(b); break;
      case 'air':
        b.jt += dt; moveX(b, b.vx * dt);
        if (b.onGround && b.jt > 0.2) {
          Q.shake = 0.5; Snd.play('boom'); emit(cxm, b.y + b.h, 14, { col: '#cfd6e6', sp0: 20, sp1: 80, vy: -20 });
          const sp = 90 * fury;
          Q.projs.push({ x: cxm - 12, y: b.y + b.h - 6, vx: -sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
          Q.projs.push({ x: cxm + 12, y: b.y + b.h - 6, vx: sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
          b.st = 'rec'; b.timer = 0.8 / fury;
        }
        break;
      case 'charge':
        b.timer -= dt;
        if (moveX(b, b.dir * 150 * fury * dt) || b.timer <= 0) { if (b.timer > 0) { Q.shake = 0.4; Snd.play('boom'); } b.st = 'rec'; b.timer = 1.0; }
        if (Math.random() < 0.5) emit(cxm - b.dir * b.w / 2, b.y + b.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 20, vy: -10, grav: 20 });
        break;
      case 'shoot':
        b.timer -= dt;
        if (b.timer <= 0 && b.n > 0) {
          const a0 = Math.atan2((P.y + 7) - cym, (P.x + 4) - cxm), k = Q.li > 4 ? 2 : 1;
          for (let i = -k; i <= k; i++) firePr(cxm, cym, Math.cos(a0 + i * 0.28) * 100, Math.sin(a0 + i * 0.28) * 100, { boss: true });
          b.n--; b.timer = 0.55 / fury; if (b.n === 0) { b.st = 'rec'; b.timer = 0.9; }
        }
        break;
      case 'rain':
        b.timer -= dt; b.drop -= dt;
        if (b.drop <= 0) { b.drop = 0.22 / fury; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: Q.B.proj, type: 'fall', boss: true }); }
        if (b.timer <= 0) { b.st = 'rec'; b.timer = 0.8; }
        break;
      case 'spin':
        b.timer -= dt;
        if (b.timer <= 0 && b.n > 0) {
          const N = 12; b.rot += 0.26;
          for (let i = 0; i < N; i++) { const a = b.rot + i / N * Math.PI * 2; firePr(cxm, cym, Math.cos(a) * 80, Math.sin(a) * 80, { boss: true }); }
          b.n--; b.timer = 0.8 / fury; if (b.n === 0) { b.st = 'rec'; b.timer = 1.0; }
        }
        break;
      case 'rec': b.timer -= dt; if (b.timer <= 0) { b.st = 'wait'; b.timer = 0.7 / fury; } break;
    }
    if (b.st !== 'air') moveY(b, b.vy * dt); else moveY(b, b.vy * dt);
    if (ov(P, { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 })) hurtPlayer(1, cxm);
  }

  function updateProjs(dt) {
    const P = Q.P;
    for (const p of Q.projs) {
      if (p.dead) continue;
      p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) { p.dead = true; continue; }
      const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
      if (p.type !== 'wave' && solid(tx, ty)) { p.dead = true; emit(p.x, p.y, 5, { col: p.col, sp0: 10, sp1: 40 }); continue; }
      if (p.type === 'wave') { if (solid(Math.floor((p.x + Math.sign(p.vx) * 5) / TS), Math.floor(p.y / TS))) { p.dead = true; continue; } if (Math.random() < 0.4) emit(p.x, p.y + 4, 1, { col: p.col, sp0: 5, sp1: 20, vy: -20 }); }
      const hb = p.type === 'wave' ? { x: p.x - 6, y: p.y - 6, w: 12, h: 12 } : (p.big ? { x: p.x - 4, y: p.y - 4, w: 8, h: 8 } : { x: p.x - 2, y: p.y - 2, w: 4, h: 4 });
      if (ov(P, hb)) { if (hurtPlayer(1, p.x)) { p.dead = true; } }
    }
    Q.projs = Q.projs.filter(p => !p.dead);
  }

  // ----- NPC dialogue & shop -----
  function startTalk(it) {
    const d = (DLG[Q.li] || {})[it.who] || [{ en: '...', vi: '...' }];
    Q.talk = { it, npc: NPCS[it.who], lines: d, i: 0, t: 0 }; Q.state = 'talk'; Snd.play('select'); Q.P.vx = 0;
  }
  function endTalk() {
    const n = Q.talk.npc, it = Q.talk.it; Q.talk = null;
    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; return; }
    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
    }
  }
  function updateTalk(dt) {
    const tk = Q.talk; tk.t += dt;
    const full = tk.lines[tk.i][save.lang].length;
    if (act.okP || act.talkP || act.atkP) {
      if (tk.t * 45 < full) tk.t = 999;
      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) endTalk(); }
    }
    if (Q.talk && (act.backP || act.pauseP)) endTalk();
  }
  function updateShop() {
    if (act.upP) { Q.menu = (Q.menu + 2) % 3; Snd.play('select'); }
    if (act.downP) { Q.menu = (Q.menu + 1) % 3; Snd.play('select'); }
    if (act.backP || act.pauseP) { Q.state = 'play'; return; }
    if (act.okP) {
      if (Q.menu === 2) { Q.state = 'play'; return; }
      const price = Q.menu === 0 ? 15 : 25;
      if (save.coins < price) { Q.shopMsg = T('nomoney'); Snd.play('hurt'); return; }
      save.coins -= price; writeSave(); Snd.play('coin'); Q.shopMsg = T('bought');
      if (Q.menu === 0) Q.P.hp = maxHP(); else Q.P.shield = true;
    }
  }

  // ----- traps -----
  function updateTraps(dt) {
    const P = Q.P, cx = Q.cam.x + VW / 2;
    for (const t of Q.traps) {
      if (Math.abs(t.x - cx) > 300) continue;
      t.t += dt;
      const dx = (P.x + 4) - t.x;
      switch (t.type) {
        case 'spiketrap': {
          const ph = (t.t + t.off) % 3.4; t.warn = ph >= 1.8 && ph < 2.3; t.up = ph >= 2.3 && ph < 3.3;
          if (t.up && ov(P, { x: t.x - t.w * 8 + 1, y: t.y - 9, w: t.w * 16 - 2, h: 9 })) hurtPlayer(1, t.x);
          break;
        }
        case 'jets': {
          const ph = (t.t + t.off) % 3.6; t.warn = ph >= 1.8 && ph < 2.4; t.up = ph >= 2.4 && ph < 3.3;
          if (t.up) { if (Math.random() < 0.6) emit(t.x + rr(-3, 3), t.y - rr(8, 40), 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 14, vy: -20, grav: -10, l0: 0.2, l1: 0.4 }); if (ov(P, { x: t.x - 5, y: t.y - 40, w: 10, h: 40 })) hurtPlayer(1, t.x); }
          break;
        }
        case 'saw': {
          t.ph += dt * (46 + Q.li * 3) / Math.max(16, t.len * 16) * Math.PI;
          t.sx = t.x0 + (t.len * 16 - 16) * (0.5 - 0.5 * Math.cos(t.ph));
          if (ov(P, { x: t.sx - 6, y: t.y - 15, w: 12, h: 13 })) hurtPlayer(1, t.sx);
          break;
        }
        case 'turret': {
          t.cd -= dt;
          t.warn = t.cd < 0.35 && t.cd > 0 && Math.abs(dx) < 220;
          if (t.cd <= 0) { t.cd = 2.4; if (Math.abs(dx) < 220 && (dx > 0) === (t.dir > 0)) firePr(t.x + t.dir * 6, t.y - 9, t.dir * 115, 0, { col: '#ffd34e' }); }
          break;
        }
        case 'rockfall': {
          if (t.st === 'idle') { if (Math.abs(dx) < 70) { t.st = 'warn'; t.cd = 0.8; } }
          else if (t.st === 'warn') { t.cd -= dt; if (t.cd <= 0) { t.st = 'cool'; t.cd = 3.2; Q.projs.push({ x: t.x, y: Q.cam.y - 12, vx: 0, vy: 50, life: 3, grav: 400, col: Q.B.id === 'volcano' ? '#ff9a2a' : (Q.B.id === 'frost' ? '#bfeaff' : '#b8bfd0'), type: 'fall', boss: false, big: true }); } }
          else { t.cd -= dt; if (t.cd <= 0) t.st = 'idle'; }
          break;
        }
      }
    }
  }
  function turretSpr(style) {
    const k = 'turret' + (style || 'wood');
    if (!_cache[k]) {
      const C = { wood: ['n', 'N', 'y'], sand: ['E', 'S', 'r'], dark: ['d', 'D', 'm'] }[style || 'wood'];
      _cache[k] = paint(14, 18, P => { P.rect(1, 2, 12, 16, C[0]); P.rect(0, 0, 14, 3, C[1]); P.rect(1, 16, 12, 2, C[1]); P.rect(3, 6, 3, 3, 'k'); P.rect(8, 6, 3, 3, 'k'); P.px(4, 7, C[2]); P.px(9, 7, C[2]); P.rect(4, 12, 6, 3, 'k'); P.px(5, 12, 'w'); P.px(8, 12, 'w'); });
    }
    return _cache[k];
  }
  function drawTraps(camX, camY) {
    const B = Q.B, ts = Q.ts;
    for (const t of Q.traps) {
      const x = Math.round(t.x - camX), y = Math.round(t.y - camY);
      if (x < -40 || x > VW + 40 + (t.type === 'saw' ? t.len * 16 : 0)) continue;
      switch (t.type) {
        case 'spiketrap': {
          const x0 = Math.round(t.x - t.w * 8 - camX);
          g.fillStyle = '#1b1626'; g.fillRect(x0, y - 2, t.w * 16, 2);
          g.fillStyle = B.plat[1]; g.fillRect(x0 + 1, y - 2, t.w * 16 - 2, 1);
          for (let i = 0; i < t.w; i++) {
            if (t.up) g.drawImage(ts.spike, x0 + i * 16, y - 16);
            else if (t.warn && Math.floor(t.t * 20) % 2 === 0) g.drawImage(ts.spike, 0, 13, 16, 3, x0 + i * 16, y - 3, 16, 3);
          }
          break;
        }
        case 'jets': {
          g.fillStyle = '#1b1626'; g.fillRect(x - 7, y - 3, 14, 3); g.fillStyle = t.up || t.warn ? '#f08a2b' : '#4a3f44'; g.fillRect(x - 5, y - 3, 10, 1);
          if (t.warn) { g.fillStyle = Math.floor(t.t * 16) % 2 ? '#ffd34e' : '#f08a2b'; g.fillRect(x - 2, y - 7, 4, 4); }
          if (t.up) { for (let i = 0; i < 10; i++) { const w = 10 - Math.floor(i / 2) * 2 + (Math.random() < 0.4 ? 2 : 0); g.fillStyle = i < 3 ? '#fff6c0' : (i < 6 ? '#ffd34e' : '#f08a2b'); g.fillRect(x - Math.floor(w / 2), y - 4 - i * 4, w, 4); } }
          break;
        }
        case 'saw': {
          const rx = Math.round(t.x0 - camX) + 8, ry = y - 8;
          g.fillStyle = '#434d6e'; g.fillRect(rx, ry, t.len * 16 - 16, 1); g.fillStyle = '#1b1626'; g.fillRect(rx - 1, ry - 2, 3, 5); g.fillRect(rx + t.len * 16 - 17, ry - 2, 3, 5);
          const sx = Math.round((t.sx === undefined ? t.x0 : t.sx) - camX) + 8;
          disc(g, sx, ry, 8, '#1b1626'); disc(g, sx, ry, 7, '#b8bfd0'); disc(g, sx, ry, 4, '#6a7090');
          for (let k = 0; k < 8; k++) { const a = t.ph * 10 + k * Math.PI / 4; g.fillStyle = k % 2 ? '#fff' : '#8d9bbd'; g.fillRect(Math.round(sx + Math.cos(a) * 7), Math.round(ry + Math.sin(a) * 7), 2, 2); }
          g.fillStyle = '#1b1626'; g.fillRect(sx - 1, ry - 1, 3, 3);
          break;
        }
        case 'turret': {
          const sp = turretSpr(B.trapStyle);
          drawSpr(g, sp, x, y, t.dir > 0, t.warn && Math.floor(t.t * 24) % 2 === 0);
          break;
        }
        case 'rockfall': {
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 3, y - 1, 6, 1);
          if (t.st === 'warn') { const bl = Math.floor(t.t * 14) % 2; g.fillStyle = bl ? '#e0453a' : '#ffd34e'; g.fillRect(x - 1, y - 12, 2, 6); g.fillRect(x - 1, y - 4, 2, 2); g.fillStyle = 'rgba(224,69,58,.5)'; g.fillRect(x - 6, y - 1, 12, 1); }
          break;
        }
      }
    }
  }

  function updateItems(dt) {
    const P = Q.P;
    Q.nearNpc = null;
    for (const it of Q.items) {
      if (it.dead) continue;
      it.ph += dt;
      if (it.drop) {
        it.vy += 500 * dt; it.x += (it.vx || 0) * dt; it.y += it.vy * dt;
        const tx = Math.floor(it.x / TS), ty = Math.floor((it.y + 4) / TS);
        if (solid(tx, ty) || ch(tx, ty) === '=') { it.y = ty * TS - 4; it.vy = 0; it.vx = 0; }
        if (it.y > Q.L.H * TS) it.dead = true;
      }
      const pc = { x: P.x + P.w / 2, y: P.y + P.h / 2 };
      const d = Math.hypot(it.x - pc.x, it.y - pc.y);
      if (it.kind === 'coin') {
        if (d < 40 && !it.drop) { it.x += (pc.x - it.x) * 6 * dt; it.y += (pc.y - it.y) * 6 * dt; }
        if (d < 10) { it.dead = true; Q.coinsRun++; save.coins++; Snd.play('coin'); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 4, { col: '#ffd34e', sp0: 10, sp1: 40 }); if (Q.coinsRun % 50 === 0 && Q.P.hp < maxHP()) { Q.P.hp++; Snd.play('heart'); } }
      } else if (it.kind === 'heart') {
        if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true; Snd.play('heart'); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 10, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); } }
      } else if (it.kind === 'shard') {
        if (d < 13) { it.dead = true; save.shards[Q.li][it.k] = 1; writeSave(); Q.taken.add(it.id); Snd.play('shard'); Q.shardFlash = 1.2; emit(it.x, it.y, 30, { col: ['#ffd34e', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); const ts = totalShards(); Q.msg = (save.lang === 'vi' ? 'Mảnh nắng ' : 'Sun Shard ') + ts + '/21' + (ts % 3 === 0 ? (save.lang === 'vi' ? '  — Tim tối đa tăng!' : '  — Max hearts up!') : '') + (ts % 7 === 0 ? (save.lang === 'vi' ? '  — Kiếm mạnh hơn!' : '  — Sword stronger!') : ''); Q.msgT = 4; if (P.hp < maxHP()) P.hp = maxHP(); }
      } else if (it.kind === 'npc') {
        if (Math.abs(it.x - pc.x) < 26 && Math.abs(it.y - pc.y) < 30) Q.nearNpc = it;
      } else if (it.kind === 'cp') {
        if (!it.lit && Math.abs(it.x - pc.x) < 14 && Math.abs(it.y - pc.y) < 30) {
          Q.items.forEach(o => { if (o.kind === 'cp') o.lit = false; }); it.lit = true; Q.cp = { x: it.x, y: it.y, id: it.id }; Snd.play('checkpoint'); emit(it.x, it.y - 12, 16, { col: ['#ffd34e', '#fff'], sp0: 15, sp1: 70 });
          if (P.hp < maxHP()) { P.hp = maxHP(); }
        }
      } else if (it.kind === 'frag') {
        if (d < 18 && Q.state === 'play') { it.dead = true; completeLevel(); }
      }
    }
    Q.items = Q.items.filter(i => !i.dead);
  }

  function completeLevel() {
    Q.state = 'complete'; Q.stateT = 0; Snd.play('win'); Snd.stop();
    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);
    Q.firstClear = true;
    writeSave();
  }

  function updatePlats(dt) {
    for (const p of Q.L.plats) {
      const ox = p.x, oy = p.y;
      const len = p.vert ? Math.abs(p.y1 - p.y0) : Math.abs(p.x1 - p.x0);
      p.ph += dt * p.sp / Math.max(10, len) * Math.PI;
      const u = 0.5 - 0.5 * Math.cos(p.ph);
      if (p.vert) p.y = lerp(p.y1, p.y0, u); else p.x = lerp(p.x0, p.x1, u);
      p.dx = p.x - ox; p.dy = p.y - oy;
    }
  }
  function updateCrumble(dt) {
    for (const [k, s] of Q.crum) {
      s.t += dt;
      if (s.st === 1 && s.t > 0.55) { s.st = 2; s.t = 0; Snd.play('crumble'); emit(s.tx * TS + 8, s.ty * TS + 8, 8, { col: '#8a6a44', sp0: 10, sp1: 40, vy: 20 }); }
      else if (s.st === 2 && s.t > 2.5) { if (!ov(Q.P, { x: s.tx * TS, y: s.ty * TS, w: TS, h: TS })) { s.st = 0; s.t = 0; } }
    }
  }
  function updateCam(dt) {
    const P = Q.P, L = Q.L, k = 1 - Math.exp(-6 * dt);
    let tx = P.x + P.w / 2 - VW / 2 + P.face * 22, ty = P.y - VH * 0.58;
    let minX = 0, maxX = Math.max(0, L.endX + 8 - VW);
    if (Q.arenaSealed) minX = (L.arena.x0 + 1) * TS;
    tx = clamp(tx, minX, maxX); ty = clamp(ty, 0, L.H * TS - VH);
    Q.cam.x = lerp(Q.cam.x, tx, k); Q.cam.y = lerp(Q.cam.y, ty, k * 0.9);
  }
  function updateWeather(dt) {
    for (const w of Q.weather) {
      w.ph += dt;
      switch (Q.wtype) {
        case 'pollen': w.x += Math.sin(w.ph) * 8 * dt + 10 * dt; w.y += Math.cos(w.ph * 0.7) * 6 * dt - 4 * dt; break;
        case 'fireflies': w.x += Math.sin(w.ph * 0.8) * 14 * dt; w.y += Math.cos(w.ph * 0.6) * 10 * dt; break;
        case 'drips': w.y += 90 * w.s * dt; break;
        case 'sand': w.x -= 150 * w.s * dt; w.y += 6 * dt; break;
        case 'snow': w.y += 26 * w.s * dt; w.x += Math.sin(w.ph) * 12 * dt - 6 * dt; break;
        case 'embers': w.y -= 26 * w.s * dt; w.x += Math.sin(w.ph * 2) * 10 * dt; break;
        case 'motes': w.y -= 8 * w.s * dt; w.x += Math.sin(w.ph) * 8 * dt; break;
      }
      if (w.x < -4) w.x += VW + 8; if (w.x > VW + 4) w.x -= VW + 8; if (w.y < -4) w.y += VH + 8; if (w.y > VH + 4) w.y -= VH + 8;
    }
  }

  function updatePlay(dt) {
    Q.stateT += dt;
    const st = Q.state;
    if (st === 'intro') { if (Q.stateT > 2.6 || act.okP) Q.state = 'play'; updateCam(dt); updateWeather(dt); return; }
    if (st === 'pause') {
      if (act.upP) { Q.menu = (Q.menu + 3) % 4; Snd.play('select'); } if (act.downP) { Q.menu = (Q.menu + 1) % 4; Snd.play('select'); }
      if (act.pauseP && !act.backP) { Q.state = 'play'; return; }
      if (act.pauseP) { Q.state = 'play'; return; }
      if (act.okP) {
        Snd.play('ok');
        if (Q.menu === 0) Q.state = 'play'; else if (Q.menu === 1) startLevel(Q.li); else if (Q.menu === 2) { toScene('map'); } else toScene('title');
      }
      return;
    }
    if (st === 'talk') { updateTalk(dt); updateParticles(dt); return; }
    if (st === 'shop') { updateShop(); return; }
    if (st === 'dead') {
      updateParticles(dt);
      if (Q.stateT > 0.8 && act.okP) { Snd.play('ok'); respawn(); }
      else if (Q.stateT > 0.8 && act.backP) toScene('map');
      return;
    }
    if (st === 'complete') { updateParticles(dt); if (Q.stateT > 1 && act.okP) { Snd.play('ok'); if (Q.li >= 6) toScene('ending'); else { mapSel = Math.min(6, Q.li + 1); toScene('map'); } } return; }
    // play / bossintro
    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }
    if (st === 'play' && Q.nearNpc && act.talkP) { startTalk(Q.nearNpc); return; }
    if (Q.freeze > 0) { Q.freeze -= dt; updateParticles(dt); return; }
    Q.t += dt; Q.time += dt;
    if (Q.shake > 0) Q.shake -= dt;
    if (Q.msgT > 0) Q.msgT -= dt;
    updatePlats(dt); updateCrumble(dt);
    if (st === 'bossintro') { updateBoss(dt); updateCam(dt); updateParticles(dt); updateWeather(dt); Q.P.vx = 0; Q.P.vy = Math.min(380, Q.P.vy + GRAV * dt); moveY(Q.P, Q.P.vy * dt); return; }
    updatePlayer(dt);
    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }
    updateEnemies(dt); updateBoss(dt); updateBossDeath(dt); updateTraps(dt); updateProjs(dt); updateItems(dt); updateParticles(dt); updateCam(dt); updateWeather(dt);
  }
  function updateParticles(dt) {
    for (const p of Q.parts) { p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.max = Math.max(p.max, p.life); }
    Q.parts = Q.parts.filter(p => p.life > 0);
  }

  // ============================== RENDER ==============================
  function drawSun() {
    const B = Q.B; if (!B.sun) return;
    const p = sunPower(), cx = 296 - Q.cam.x * 0.02, cy = 52;
    if (p > 0.05) { g.globalAlpha = 0.25 * p; disc(g, cx, cy, 30, '#ffd34e'); g.globalAlpha = 0.25 * p; disc(g, cx, cy, 24, '#ffe9a0'); g.globalAlpha = 1; }
    disc(g, cx, cy, 15, lerpColor('#241d36', '#ffe08a', Math.min(1, p * 1.2)));
    if (p < 1) { g.globalAlpha = 0.9 * (1 - p); disc(g, cx + 5, cy - 1, 13, lerpColor('#0a0612', '#1a1030', 0.5)); g.globalAlpha = 1; }
  }
  function drawWorld() {
    const L = Q.L, B = Q.B, cam = Q.cam, ts = Q.ts;
    const camX = Math.round(cam.x), camY = Math.round(cam.y);
    g.drawImage(Q.bg.sky, 0, 0);
    drawSun();
    for (const ly of Q.bg.layers) {
      let ox = -((cam.x * ly.f) % 512); if (ox > 0) ox -= 512;
      const y = Math.round(ly.anchor === 'top' ? ly.y - camY * 0.1 + 24 * 0.1 : ly.y + (24 - cam.y) * ly.f);
      g.drawImage(ly.c, Math.round(ox), y); g.drawImage(ly.c, Math.round(ox) + 512, y);
    }
    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + VW) / TS), ty0 = Math.floor(camY / TS), ty1 = Math.floor((camY + VH) / TS);
    const lf = Math.floor(Q.t * 6 + (Q.time || 0) * 0) % 4;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      if (tx < 0 || tx >= L.W || ty < 0 || ty >= L.H) continue;
      const c = L.grid[ty][tx]; if (c === ' ') continue;
      const dx = tx * TS - camX, dy = ty * TS - camY, v = (tx * 7 + ty * 13) & 1;
      const above = ty > 0 ? L.grid[ty - 1][tx] : ' ';
      if (c === '#') g.drawImage((above === '#' || above === 'I' || above === 'C') ? ts.body[v] : ts.top[v], dx, dy);
      else if (c === 'I') g.drawImage((above === '#' || above === 'I') ? ts.iceBody[v] : ts.iceTop[v], dx, dy);
      else if (c === '=') g.drawImage(ts.plat, dx, dy);
      else if (c === '^') g.drawImage(ts.spike, dx, dy);
      else if (c === '~') g.drawImage(ts.lava[above === '~' ? 1 : 0][lf], dx, dy);
      else if (c === 'C') {
        const s = Q.crum.get(ty * L.W + tx);
        if (s && s.st === 2) continue;
        const sh = s && s.st === 1 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        g.drawImage(ts.crumble, dx + sh, dy);
      }
    }
    // decor
    for (const d of L.decor) {
      if (d.x < camX - 20 || d.x > camX + VW + 20) continue;
      const sp = ts.decor[d.k]; g.drawImage(sp.c, Math.round(d.x - camX - sp.w / 2), Math.round(d.y - camY - sp.h + 1));
    }
    // moving platforms
    for (const p of L.plats) {
      for (let i = 0; i < p.w / TS; i++) g.drawImage(ts.plat, Math.round(p.x - camX + i * TS), Math.round(p.y - camY));
      g.fillStyle = B.plat[1]; g.fillRect(Math.round(p.x - camX + 2), Math.round(p.y - camY + 7), p.w - 4, 1);
    }
    drawItems(camX, camY);
    drawTraps(camX, camY);
    for (const e of Q.ents) drawEnemy(e, camX, camY);
    if (Q.boss && Q.boss.st !== 'sleep' || (Q.boss && Q.li === 6)) drawBoss(camX, camY);
    drawPlayer(camX, camY);
    // projectiles
    for (const p of Q.projs) {
      const px = Math.round(p.x - camX), py = Math.round(p.y - camY);
      if (p.type === 'wave') { g.fillStyle = p.col; g.fillRect(px - 6, py - 5, 12, 10); g.fillStyle = '#fff'; g.fillRect(px - 3, py - 3, 6, 6); }
      else if (p.big) { g.fillStyle = '#1b1626'; g.fillRect(px - 5, py - 5, 10, 10); g.fillStyle = p.col; g.fillRect(px - 4, py - 4, 8, 8); g.fillStyle = '#fff'; g.fillRect(px - 3, py - 3, 3, 2); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(px, py, 4, 4); }
      else { g.fillStyle = p.col; g.fillRect(px - 3, py - 2, 6, 4); g.fillRect(px - 2, py - 3, 4, 6); g.fillStyle = '#fff'; g.fillRect(px - 1, py - 1, 2, 2); }
    }
    for (const p of Q.parts) { g.globalAlpha = clamp(p.life / 0.4, 0, 1); g.fillStyle = p.col; g.fillRect(Math.round(p.x - camX), Math.round(p.y - camY), p.size, p.size); }
    g.globalAlpha = 1;
  }
  function drawItems(camX, camY) {
    for (const it of Q.items) {
      const x = Math.round(it.x - camX), y = Math.round(it.y - camY);
      if (x < -20 || x > VW + 20) continue;
      if (it.kind === 'coin') {
        const w = Math.max(1, Math.round(Math.abs(Math.cos(it.ph * 4)) * 6)), by = y + Math.round(Math.sin(it.ph * 3));
        g.fillStyle = '#1b1626'; g.fillRect(x - w / 2 - 1 | 0, by - 4, w + 2, 9); g.fillStyle = '#ffd34e'; g.fillRect(x - w / 2 | 0, by - 3, w, 7);
        if (w > 3) { g.fillStyle = '#fff6c0'; g.fillRect(x - w / 2 | 0, by - 3, 1, 3); g.fillStyle = '#c89a1c'; g.fillRect(x + w / 2 - 1 | 0, by + 1, 1, 3); }
      } else if (it.kind === 'heart') {
        const s = getSprite('heart'); drawSpr(g, s, x, y + 4 + Math.round(Math.sin(it.ph * 3) * 1.5), false);
      } else if (it.kind === 'shard') {
        const s = getSprite('shard'); const sc = 2; drawSpr(g, s, x, y + 10 + Math.round(Math.sin(it.ph * 2) * 2), false, false, sc, sc);
        if (Math.random() < 0.2) emit(it.x + rr(-6, 6), it.y + rr(-6, 6), 1, { col: ['#fff', '#ffd34e'], sp0: 2, sp1: 8, grav: -10, l0: 0.4, l1: 0.8 });
      } else if (it.kind === 'npc') {
        const n = NPCS[it.who], sp = getSprite(n.spr), bob = Math.round(Math.sin(it.ph * 2) * 0.5 + 0.5);
        drawSpr(g, sp, x, y - bob, Q.P.x + 4 < it.x);
        const by = y - sp.h - 4 - bob;
        if (Q.nearNpc === it && Q.state === 'play') { txt(T('talk'), x, by - 4, { al: 'center', size: 6, col: '#ffd34e' }); }
        else if (Q.nearNpc !== it) { g.fillStyle = '#1b1626'; g.fillRect(x - 4, by - 5, 9, 7); g.fillStyle = '#fff'; g.fillRect(x - 3, by - 4, 7, 5); g.fillStyle = '#1b1626'; g.fillRect(x - 2, by - 2, 1, 1); g.fillRect(x, by - 2, 1, 1); g.fillRect(x + 2, by - 2, 1, 1); }
      } else if (it.kind === 'cp') {
        g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 22, 4, 22); g.fillStyle = '#5a3a22'; g.fillRect(x - 1, y - 21, 2, 21);
        g.fillStyle = '#1b1626'; g.fillRect(x - 5, y - 30, 10, 10);
        g.fillStyle = it.lit ? '#ffd34e' : '#6a7090'; g.fillRect(x - 4, y - 29, 8, 8);
        if (it.lit) { g.fillStyle = '#fff6c0'; g.fillRect(x - 2, y - 27, 4, 4); if (Math.random() < 0.3) emit(it.x, it.y - 30, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 10, vy: -20, grav: -10, l0: 0.4, l1: 0.8 }); }
      } else if (it.kind === 'frag') {
        const r = 10 + Math.sin(it.ph * 3) * 2;
        g.globalAlpha = 0.35; disc(g, x, y, Math.round(r + 8), '#ffd34e'); g.globalAlpha = 1;
        disc(g, x, y, Math.round(r), '#ffe08a'); disc(g, x, y, Math.round(r - 4), '#ffffff');
        for (let i = 0; i < 8; i++) { const a = it.ph * 1.5 + i * Math.PI / 4; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(a) * (r + 6)), Math.round(y + Math.sin(a) * (r + 6)), 2, 2); }
      }
    }
  }
  function drawEnemy(e, camX, camY) {
    const c = e.cfg, x = e.x + e.w / 2 - camX, bot = e.y + e.h - camY;
    if (x < -30 || x > VW + 30) return;
    if (c.ai === 'blob' && e.st === 'wait') return;
    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0;
    const spr = getSprite(c.spr, c.swap || {}, fr, c.out);
    let sx = 1, sy = 1, oy = 0, al;
    if (c.ai === 'hop') { const s = e.onGround ? 1 + Math.sin(e.t * 6) * 0.06 : 0.9; sy = s; sx = 2 - s > 1.1 ? 1.1 : 2 - s; }
    if (c.ai === 'walk' || c.ai === 'charge') oy = e.onGround && Math.abs(e.vx) > 1 ? Math.round(Math.abs(Math.sin(e.t * 10))) * -1 : 0;
    if (c.ai === 'ghost') { al = 0.6 + Math.sin(e.t * 3) * 0.25; oy = Math.round(Math.sin(e.t * 3)); }
    if (e.st === 'wind') { oy += (Math.random() < 0.5 ? 1 : -1); }
    const flash = e.flash > 0 || (e.st === 'wind' && Math.floor(e.t * 20) % 2 === 0);
    drawSpr(g, spr, Math.round(x), Math.round(bot + oy), e.dir < 0, flash, sx, sy, al);
    if (c.ai === 'fly' && false) { }
  }
  function drawBoss(camX, camY) {
    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;
    const c = b.cfg, x = Math.round(b.x + b.w / 2 - camX), bot = Math.round(b.y + b.h - camY);
    if (c.eclipse) { g.globalAlpha = 0.25 + Math.sin(b.t * 3) * 0.1; disc(g, x, bot - 40, 40, '#7a4cff'); g.globalAlpha = 1; }
    const tele = b.st === 'tele' && Math.floor(b.t * 18) % 2 === 0;
    const bob = (b.st === 'wait' || c.eclipse) ? Math.round(Math.sin(b.t * 3) * (c.eclipse ? 3 : 1)) : 0;
    let sy = 1;
    if (b.st === 'tele' && b.atk === 'jump') sy = 0.88;
    drawSpr(g, b.spr, x, bot + bob, b.dir < 0, b.flash > 0 || tele, 1, sy);
  }
  function drawPlayer(camX, camY) {
    const P = Q.P;
    if (Q.state === 'dead') return;
    if (P.inv > 0 && P.dash <= 0 && Math.floor(P.inv * 20) % 2 === 0) return;
    const x = Math.round(P.x + P.w / 2 - camX), bot = Math.round(P.y + P.h - camY);
    let spr;
    if (!P.onGround) spr = getSprite(P.vy < 0 ? 'hero_jump' : 'hero_fall', {}, 0);
    else if (Math.abs(P.vx) > 15) spr = getSprite('hero_run', {}, Math.floor(P.anim * 12) % 4);
    else spr = getSprite('hero_idle', {}, Math.floor(P.anim * 3) % 2);
    const bob = (P.onGround && Math.abs(P.vx) <= 15) ? Math.round(Math.sin(P.anim * 3) * 0.5 + 0.5) * 0 : 0;
    if (P.dash > 0) g.globalAlpha = 0.75;
    drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;
    // lantern
    const lx = x + P.face * 8, ly = bot - 9 +Math.round(Math.sin(P.anim * 7) * (Math.abs(P.vx) > 15 ? 1.5 : 0.6));
    g.fillStyle = '#1b1626'; g.fillRect(lx - 3, ly - 3, 6, 7); g.fillRect(lx - 1, ly - 5, 2, 2);
    g.fillStyle = '#ffd34e'; g.fillRect(lx - 2, ly - 2, 4, 5); g.fillStyle = '#fff6c0'; g.fillRect(lx - 1, ly - 1, 2, 2);
    // slash
    if (P.atk > 0) {
      const t = 1 - P.atk / 0.2, r = swordRect();
      g.fillStyle = '#fff';
      if (P.atkDown) { for (let i = 0; i < 8; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 7)) + t * 0.5; g.fillRect(Math.round(x + Math.cos(a) * 12 * (P.face)) , Math.round(bot + Math.sin(a) * 12 - 2 - camY * 0), 2, 2); } g.fillStyle = '#cfd6e6'; g.fillRect(Math.round(x - 1), Math.round(bot - 2), 3, 12); }
      else {
        const f = P.face;
        for (let i = 0; i < 10; i++) { const a = (-1.2 + 2.4 * (i / 9)) * (t < 0.5 ? t * 2 : 1), px = x + f * (4 + Math.cos(a) * 17), py = bot - 7 + Math.sin(a) * 12; g.fillStyle = i > 6 ? '#fff' : '#cfeaff'; g.fillRect(Math.round(px), Math.round(py), 3, 3); }
      }
    }
  }
  function drawLighting() {
    const B = Q.B, P = Q.P, camX = Q.cam.x, camY = Q.cam.y;
    const dark = B.dark + (Q.arenaSealed && Q.li !== 2 ? 0.0 : 0);
    const flick = Math.sin(Q.t * 9) * 2 + Math.sin(Q.t * 5.3) * 1.5;
    const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: (B.dark > 0.5 ? 70 : 90) + flick, i: 1 }];
    const addL = (x, y, r, i) => { const sx = x - camX, sy = y - camY; if (sx > -r && sx < VW + r && sy > -r && sy < VH + r) lights.push({ x: sx, y: sy, r, i: i || 1 }); };
    for (const it of Q.items) { if (it.kind === 'cp' && it.lit) addL(it.x, it.y - 26, 50, 1); else if (it.kind === 'shard') addL(it.x, it.y, 34, 1); else if (it.kind === 'frag') addL(it.x, it.y, 80, 1); else if (it.kind === 'npc') addL(it.x, it.y - 10, 36, 0.8); else if (it.kind === 'coin' && B.dark > 0.5) addL(it.x, it.y, 10, 0.5); }
    for (const e of Q.ents) if (e.cfg.ai === 'flyshoot' || e.cfg.ai === 'blob' || e.type === 'ghost') addL(e.x + e.w / 2, e.y + e.h / 2, 34, 0.9);
    for (const p of Q.projs) addL(p.x, p.y, 24, 0.9);
    if (Q.boss && Q.boss.st !== 'sleep') addL(Q.boss.x + Q.boss.w / 2, Q.boss.y + Q.boss.h / 2, 60, 0.7);
    for (const d of Q.L.decor) { if (Q.B.decor[d.k][0] === 'torch' || (B.id === 'caves' && Q.B.decor[d.k][0] === 'crystal')) addL(d.x, d.y - 6, 36, 0.8); }
    if (B.hazard === 'lava') { const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + VW) / TS); for (let tx = tx0; tx <= tx1; tx += 2) { if (tx >= 0 && tx < Q.L.W && Q.L.grid[Q.L.H - 2][tx] === '~') addL(tx * TS + 8, (Q.L.H - 2) * TS, 40, 0.8); } }
    if (dark > 0) {
      lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, VW, VH);
      lg.fillStyle = B.id === 'volcano' ? 'rgba(40,5,0,' + dark + ')' : 'rgba(4,2,18,' + dark + ')'; lg.fillRect(0, 0, VW, VH);
      lg.globalCompositeOperation = 'destination-out';
      for (const l of lights) { const gr = lg.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r); gr.addColorStop(0, 'rgba(0,0,0,' + l.i + ')'); gr.addColorStop(0.55, 'rgba(0,0,0,' + 0.6 * l.i + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); lg.fillStyle = gr; lg.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); }
      g.drawImage(lightC, 0, 0);
    }
    // warm additive glow
    g.globalCompositeOperation = 'lighter';
    const pl = lights[0];
    const gr = g.createRadialGradient(pl.x, pl.y, 0, pl.x, pl.y, 60); gr.addColorStop(0, 'rgba(255,190,90,0.22)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(pl.x - 60, pl.y - 60, 120, 120);
    for (let i = 1; i < lights.length; i++) { const l = lights[i]; const g2 = g.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 0.8); g2.addColorStop(0, 'rgba(255,200,110,0.18)'); g2.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = g2; g.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2); }
    g.globalCompositeOperation = 'source-over';
  }
  function drawWeather() {
    const t = Q.wtype;
    for (const w of Q.weather) {
      const x = Math.round(w.x), y = Math.round(w.y);
      switch (t) {
        case 'pollen': g.fillStyle = 'rgba(255,246,192,.7)'; g.fillRect(x, y, 1, 1); break;
        case 'fireflies': { const a = 0.4 + 0.6 * Math.max(0, Math.sin(w.ph * 2.5)); g.globalAlpha = a; g.fillStyle = '#d8ff6a'; g.fillRect(x, y, 2, 2); g.globalAlpha = a * 0.3; g.fillRect(x - 1, y - 1, 4, 4); g.globalAlpha = 1; break; }
        case 'drips': g.fillStyle = 'rgba(138,216,255,.7)'; g.fillRect(x, y, 1, 3); break;
        case 'sand': g.fillStyle = 'rgba(255,224,160,.55)'; g.fillRect(x, y, 3, 1); break;
        case 'snow': g.fillStyle = '#fff'; g.fillRect(x, y, w.s > 1 ? 2 : 1, w.s > 1 ? 2 : 1); break;
        case 'embers': g.fillStyle = Math.sin(w.ph * 8) > 0 ? '#ffd34e' : '#f06a20'; g.fillRect(x, y, 1, 1); break;
        case 'motes': g.fillStyle = 'rgba(201,160,255,.7)'; g.fillRect(x, y, 1, 1); break;
      }
    }
  }
  function drawHUD() {
    const P = Q.P, B = Q.B, hs = getSprite('heart');
    const mh = maxHP();
    for (let i = 0; i < mh; i++) {
      const x = 12 + i * 10, y = 14;
      if (i < P.hp) drawSpr(g, hs, x, y, false); else { g.globalAlpha = 0.3; drawSpr(g, hs, x, y, false, true); g.globalAlpha = 1; }
    }
    g.fillStyle = '#ffd34e'; g.fillRect(8, 20, 5, 5); g.fillStyle = '#c89a1c'; g.fillRect(12, 21, 1, 3);
    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23, { size: 7 });
    if (P.shield) { g.fillStyle = '#6ee7f2'; g.fillRect(12 + 3 * 11 + 6, 38, 6, 7); g.fillStyle = '#fff'; g.fillRect(12 + 3 * 11 + 8, 40, 2, 3); }
    const sh = save.shards[Q.li] || [0, 0, 0], ss = getSprite('shard');
    for (let i = 0; i < 3; i++) { if (sh[i]) drawSpr(g, ss, 12 + i * 11, 42, false); else { g.globalAlpha = 0.35; drawSpr(g, ss, 12 + i * 11, 42, false, true); g.globalAlpha = 1; } }
    // boss bar
    if (Q.boss && Q.arenaSealed && !Q.bossDead && Q.boss.max) {
      const b = Q.boss, w = 200, x = (VW - w) / 2, y = 14;
      g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 2, w + 4, 9);
      g.fillStyle = '#5a1020'; g.fillRect(x, y, w, 5);
      g.fillStyle = '#e0453a'; g.fillRect(x, y, Math.max(0, w * b.hp / b.max), 5);
      g.fillStyle = '#ff9a8a'; g.fillRect(x, y, Math.max(0, w * b.hp / b.max), 1);
      txt(LN(b.cfg.name), VW / 2, y + 14, { al: 'center', size: 8 });
    }
    if (Q.msgT > 0 && Q.msg && Q.state === 'play') txt(Q.msg, VW / 2, VH - 14, { al: 'center', size: 7, alpha: Math.min(1, Q.msgT) });
  }

  function drawPlay() {
    const L = Q.L;
    g.save();
    const sh = Q.shake > 0 ? Q.shake * 8 : 0;
    if (sh > 0) g.translate(Math.round(rr(-sh, sh)), Math.round(rr(-sh, sh)));
    drawWorld(); drawLighting(); drawWeather();
    g.restore();
    drawHUD();
    const st = Q.state;
    if (st === 'intro') {
      const a = Q.stateT < 0.4 ? Q.stateT / 0.4 : (Q.stateT > 2.1 ? Math.max(0, (2.6 - Q.stateT) / 0.5) : 1);
      g.globalAlpha = 0.55 * a; g.fillStyle = '#000'; g.fillRect(0, 70, VW, 66); g.globalAlpha = 1;
      txt((save.lang === 'vi' ? 'MÀN ' : 'LEVEL ') + (Q.li + 1), VW / 2, 88, { al: 'center', size: 8, col: '#ffd34e', alpha: a });
      txt(LN(Q.B.name), VW / 2, 104, { al: 'center', size: 16, alpha: a, bold: true });
      txt(LN(Q.B.sub), VW / 2, 122, { al: 'center', size: 7, col: '#cfd6e6', alpha: a });
    } else if (st === 'bossintro') {
      const b = Q.boss, a = Math.min(1, Q.stateT / 0.4);
      g.globalAlpha = 0.55 * a; g.fillStyle = '#000'; g.fillRect(0, 150, VW, 40); g.globalAlpha = 1;
      txt(T('boss'), VW / 2, 160, { al: 'center', size: 7, col: '#e0453a', alpha: a });
      txt(LN(b.cfg.name), VW / 2, 176, { al: 'center', size: 14, bold: true, alpha: a });
    } else if (st === 'pause') {
      g.fillStyle = 'rgba(5,3,15,.7)'; g.fillRect(0, 0, VW, VH);
      txt(T('paused'), VW / 2, 52, { al: 'center', size: 16, bold: true });
      ['resume', 'restart', 'tomap', 'totitle'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 88 + i * 18, { al: 'center', size: 10, col: Q.menu === i ? '#ffd34e' : '#cfd6e6' }));
      txt('M: ' + (Snd.muted ? 'Sound OFF' : 'Sound ON') + '    F11: ' + T('full'), VW / 2, 190, { al: 'center', size: 6, col: '#8892aa' });
    } else if (st === 'talk') {
      const tk = Q.talk, sp = getSprite(tk.npc.spr);
      g.fillStyle = 'rgba(8,6,20,.93)'; g.fillRect(8, 148, VW - 16, 62);
      g.fillStyle = '#ffd34e'; g.fillRect(8, 148, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1); g.fillRect(8, 148, 1, 62); g.fillRect(VW - 9, 148, 1, 62);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(14, 154, 44, 50);
      drawSpr(g, sp, 36, 204, false, false, 2, 2);
      txt(LN(tk.npc.name), 66, 158, { size: 8, col: '#ffd34e', bold: true });
      const line = tk.lines[tk.i][save.lang], n = Math.floor(tk.t * 45);
      wrapText(line.substr(0, n), 62).forEach((l, i) => txt(l, 66, 173 + i * 11, { size: 7 }));
      if (n >= line.length) txt('>', VW - 18, 200, { size: 8, col: '#ffd34e', alpha: 0.5 + 0.5 * Math.sin(Q.stateT * 8 + Q.t * 8) });
    } else if (st === 'shop') {
      g.fillStyle = 'rgba(8,6,20,.94)'; g.fillRect(40, 60, VW - 80, 100);
      g.fillStyle = '#ffd34e'; g.fillRect(40, 60, VW - 80, 1); g.fillRect(40, 159, VW - 80, 1); g.fillRect(40, 60, 1, 100); g.fillRect(VW - 41, 60, 1, 100);
      txt(LN(NPCS.gob.name), VW / 2, 72, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      txt(T('wallet') + ': ' + save.coins, VW / 2, 86, { al: 'center', size: 7, col: '#cfd6e6' });
      ['shop1', 'shop2', 'shop3'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 106 + i * 14, { al: 'center', size: 7, col: Q.menu === i ? '#ffd34e' : '#e8eaf5' }));
      if (Q.shopMsg) txt(Q.shopMsg, VW / 2, 150, { al: 'center', size: 6, col: '#a4e86b' });
      if (Q.P.shield) txt('Shield ON', 50, 72, { size: 6, col: '#6ee7f2' });
    } else if (st === 'dead') {
      const a = Math.min(1, Q.stateT / 0.8);
      g.globalAlpha = 0.6 * a; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      txt(T('died'), VW / 2, 90, { al: 'center', size: 14, bold: true, col: '#e0453a', alpha: a });
      if (Q.stateT > 0.8) txt(T('retry'), VW / 2, 120, { al: 'center', size: 8 });
    } else if (st === 'complete') {
      const a = Math.min(1, Q.stateT / 0.8);
      g.globalAlpha = 0.72 * a; g.fillStyle = '#05030f'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      txt(T('clear'), VW / 2, 40, { al: 'center', size: 13, bold: true, col: '#ffd34e', alpha: a });
      txt(LN(Q.B.name), VW / 2, 58, { al: 'center', size: 8, col: '#cfd6e6', alpha: a });
      const sh = save.shards[Q.li] || [0, 0, 0], got = sh.filter(Boolean).length;
      const mm = Math.floor(Q.time / 60), ss = Math.floor(Q.time % 60);
      txt(T('coins') + ':  ' + Q.coinsRun, VW / 2, 90, { al: 'center', size: 9, alpha: a });
      txt(T('shards') + ':  ' + got + ' / 3', VW / 2, 106, { al: 'center', size: 9, alpha: a });
      txt(T('time') + ':  ' + mm + ':' + (ss < 10 ? '0' : '') + ss, VW / 2, 122, { al: 'center', size: 9, alpha: a });
      txt(T('hearts') + ': ' + maxHP() + '    ' + T('dmg') + ': ' + swordDmg(), VW / 2, 142, { al: 'center', size: 7, col: '#a4e86b', alpha: a });
      if (Q.stateT > 1) txt(T('cont2'), VW / 2, 176, { al: 'center', size: 8, alpha: 0.6 + 0.4 * Math.sin(Q.stateT * 5) });
    }
    if (Q.shake > 0 && false) { }
  }

  // ============================== MENUS / SCENES ==============================
  let scene = 'title', titleSel = 0, storyPage = 0, storyT = 0, storyList = STORY, mapSel = 0, sceneT = 0;
  let fade = 0, fadeTo = null;
  function toScene(s) { fadeTo = s; fade = 0; }
  function enterScene(s) {
    scene = s; sceneT = 0;
    if (s === 'title') { Snd.music('title', TITLE_MUSIC); Q = null; }
    if (s === 'story') { storyPage = 0; storyT = 0; storyList = STORY; Snd.music('title', TITLE_MUSIC); }
    if (s === 'ending') { storyPage = 0; storyT = 0; storyList = ENDING; Snd.music('title', TITLE_MUSIC); }
    if (s === 'map') { Snd.music('title', TITLE_MUSIC); Q = null; mapSel = Math.min(mapSel, maxPlayable()); }
  }

  // title bg state
  const title = { cam: 0 };
  function drawBgOnly(li, camx, t) {
    const bg = bgs(li), ts = tiles(li), B = BIOMES[li];
    g.drawImage(bg.sky, 0, 0);
    if (B.sun) { const p = sunPower(); const cx = 296, cy = 52; if (p > 0.05) { g.globalAlpha = 0.25 * p; disc(g, cx, cy, 30, '#ffd34e'); g.globalAlpha = 1; } disc(g, cx, cy, 15, lerpColor('#241d36', '#ffe08a', Math.min(1, p * 1.2))); if (p < 1) { g.globalAlpha = 0.9 * (1 - p); disc(g, cx + 5, cy - 1, 13, '#120c20'); g.globalAlpha = 1; } }
    for (const ly of bg.layers) { let ox = -((camx * ly.f) % 512); if (ox > 0) ox -= 512; const y = ly.anchor === 'top' ? ly.y : ly.y; g.drawImage(ly.c, Math.round(ox), y); g.drawImage(ly.c, Math.round(ox) + 512, y); }
    const gy = 148;
    for (let x = -((camx) % TS) - TS; x < VW + TS; x += TS) { g.drawImage(ts.top[0], Math.round(x), gy); for (let y = gy + TS; y < VH; y += TS) g.drawImage(ts.body[1], Math.round(x), y); }
    return gy;
  }
  function updateTitle(dt) {
    sceneT += dt; title.cam += dt * 22;
    const items = titleItems();
    if (act.upP) { titleSel = (titleSel + items.length - 1) % items.length; Snd.play('select'); }
    if (act.downP) { titleSel = (titleSel + 1) % items.length; Snd.play('select'); }
    if (act.okP) {
      Snd.play('ok'); items[titleSel].fn();
    }
  }
  function titleItems() {
    const it = [];
    if (save.cleared.length) it.push({ k: 'cont', fn: () => { mapSel = maxPlayable(); toScene('map'); } });
    it.push({ k: 'newgame', fn: () => { save.cleared = []; save.shards = {}; save.coins = 0; writeSave(); mapSel = 0; toScene('story'); } });
    it.push({ k: 'lang', fn: () => { save.lang = save.lang === 'vi' ? 'en' : 'vi'; writeSave(); } });
    it.push({ k: 'sound', fn: () => { Snd.toggleMute(); } });
    it.push({ k: 'full', fn: toggleFull });
    it.push({ k: 'quit', fn: () => { try { window.close(); } catch (e) { } } });
    return it;
  }
  function drawTitle() {
    const gy = drawBgOnly(0, title.cam, sceneT);
    // hero running
    const hs = getSprite('hero_run', {}, Math.floor(sceneT * 9) % 4);
    drawSpr(g, hs, 80, gy, false, false, 2, 2);
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(94, gy - 14, 0, 94, gy - 14, 50); gr.addColorStop(0, 'rgba(255,190,90,.35)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(40, gy - 70, 110, 110); g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(5,3,15,.35)'; g.fillRect(0, 0, VW, VH);
    txt('LAST LANTERN', VW / 2, 34, { al: 'center', size: 26, bold: true, col: '#ffd34e' });
    txt(save.lang === 'vi' ? 'Ngọn Đèn Cuối Cùng' : 'The Shattered Sun', VW / 2, 56, { al: 'center', size: 10, col: '#cfd6e6' });
    const items = titleItems();
    items.forEach((it, i) => {
      let s = T(it.k); if (it.k === 'sound') s += ': ' + (Snd.muted ? 'OFF' : 'ON');
      txt((titleSel === i ? '> ' : '  ') + s + (titleSel === i ? ' <' : ''), VW / 2 + 60, 92 + i * 14, { al: 'center', size: 9, col: titleSel === i ? '#ffd34e' : '#e8eaf5' });
    });
    txt('© Your Studio  •  v1.0', VW - 6, VH - 8, { al: 'right', size: 5, col: '#8892aa' });
  }
  function updateStory(dt) {
    storyT += dt;
    const full = storyList[storyPage][save.lang].length;
    if (act.okP) { if (storyT * 40 < full) storyT = 999; else { storyPage++; storyT = 0; if (storyPage >= storyList.length) { if (storyList === STORY) { mapSel = 0; startLevelFade(0); } else { toScene('title'); } } } }
    if (act.backP && storyList === STORY) { startLevelFade(0); }
  }
  function startLevelFade(li) { fadeTo = 'play:' + li; fade = 0; }
  function drawStory() {
    g.fillStyle = '#05030f'; g.fillRect(0, 0, VW, VH);
    const ending = storyList === ENDING;
    const p = ending ? Math.min(1, (storyPage + 1) / 3) : 0;
    // starfield / sun
    for (let i = 0; i < 60; i++) { g.fillStyle = (i % 5 === 0) ? '#fff' : '#6a5a9a'; g.fillRect((i * 97) % VW, (i * 53) % 120, 1, 1); }
    const cx = VW / 2, cy = 70;
    if (!ending) {
      disc(g, cx, cy, 22, '#2a2240'); disc(g, cx + 6, cy - 2, 19, '#0a0612');
      if (storyPage >= 1) { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + storyT * 0.2 * (storyPage >= 1 ? 1 : 0), d = 34 + Math.sin(sceneT + i) * 3; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d * 0.7), 3, 3); } }
    } else {
      const glow = storyPage >= 1 ? 1 : 0.2;
      g.globalAlpha = 0.3 * glow; disc(g, cx, cy, 44, '#ffd34e'); g.globalAlpha = 1;
      disc(g, cx, cy, 22, lerpColor('#2a2240', '#ffe08a', glow)); if (storyPage >= 1) disc(g, cx, cy, 14, '#fff');
    }
    const s = storyList[storyPage][save.lang], n = Math.min(s.length, Math.floor(storyT * 40));
    const lines = wrapText(s.substr(0, n), 46);
    lines.forEach((l, i) => txt(l, VW / 2, 138 + i * 12, { al: 'center', size: 8 }));
    txt(T('press'), VW / 2, VH - 12, { al: 'center', size: 6, col: '#8892aa', alpha: 0.5 + 0.5 * Math.sin(sceneT * 4) });
    if (ending && storyPage >= storyList.length - 1) txt(T('thanks') + '  ' + totalShards() + '/21', VW / 2, 120, { al: 'center', size: 8, col: '#ffd34e' });
  }
  const NODES = [[40, 150], [90, 105], [140, 148], [195, 100], [245, 145], [290, 95], [338, 48]];
  function updateMap(dt) {
    sceneT += dt;
    if (act.leftP) { mapSel = Math.max(0, mapSel - 1); Snd.play('select'); }
    if (act.rightP) { mapSel = Math.min(maxPlayable(), mapSel + 1); Snd.play('select'); }
    if (act.backP) toScene('title');
    if (act.okP) { Snd.play('ok'); startLevelFade(mapSel); }
  }
  function drawMap() {
    // world map backdrop
    g.fillStyle = '#10142e'; g.fillRect(0, 0, VW, VH);
    const r = mulberry32(7);
    for (let i = 0; i < 140; i++) { g.fillStyle = r() < 0.5 ? '#171c3e' : '#0d1128'; g.fillRect((r() * VW) | 0, (r() * VH) | 0, 8 + (r() * 24 | 0), 2 + (r() * 4 | 0)); }
    // path
    for (let i = 0; i < 6; i++) {
      const a = NODES[i], b = NODES[i + 1], steps = 14;
      for (let k = 0; k < steps; k++) { const t = k / steps; g.fillStyle = i < maxPlayable() ? '#ffd34e' : '#3a3f66'; g.fillRect(Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), 2, 2); }
    }
    BIOMES.forEach((B, i) => {
      const [x, y] = NODES[i], unlocked = i <= maxPlayable(), done = save.cleared.indexOf(i) >= 0;
      const col = unlocked ? B.sky[2] : '#2a2e50';
      disc(g, x, y, 11, '#05030f'); disc(g, x, y, 9, unlocked ? B.sky[1] : '#2a2e50'); disc(g, x, y, 6, col);
      if (unlocked) { const sh = (save.shards[i] || [0, 0, 0]); for (let k = 0; k < 3; k++) { g.fillStyle = sh[k] ? '#ffd34e' : '#3a3f66'; g.fillRect(x - 7 + k * 6, y + 14, 4, 4); } }
      if (done) { g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 3, 3); }
      txt(String(i + 1), x, y, { al: 'center', size: 7, col: unlocked ? '#fff' : '#555a80', sh: unlocked });
    });
    const [sx, sy] = NODES[mapSel];
    const hb = Math.round(Math.sin(sceneT * 6) * 2);
    g.strokeStyle = '#ffd34e'; g.lineWidth = 1; g.strokeRect(sx - 13.5, sy - 13.5, 27, 27);
    drawSpr(g, getSprite('hero_idle'), sx, sy - 14 + hb, false);
    const B = BIOMES[mapSel], unl = mapSel <= maxPlayable();
    txt(T('mapt'), VW / 2, 14, { al: 'center', size: 12, bold: true, col: '#ffd34e' });
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 178, VW, 38);
    txt((mapSel + 1) + '. ' + LN(B.name), VW / 2, 188, { al: 'center', size: 11, bold: true, col: unl ? '#fff' : '#777' });
    txt(unl ? LN(B.sub) : T('locked'), VW / 2, 202, { al: 'center', size: 7, col: '#cfd6e6' });
    txt(T('maphelp'), VW / 2, 30, { al: 'center', size: 6, col: '#8892aa' });
    const ts = totalShards();
    txt(T('shards') + ' ' + ts + '/21   ' + T('hearts') + ' ' + maxHP() + '   ' + T('dmg') + ' ' + swordDmg(), 6, VH - 4, { size: 5, col: '#a4e86b' });
  }

  // ============================== MAIN LOOP ==============================
  function frame(now) {
    requestAnimationFrame(frame);
    let dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    readInput();
    if (act.muteP) Snd.toggleMute();
    if (act.fullP) toggleFull();
    // fade transitions
    if (fadeTo) {
      fade += dt / 0.25;
      if (fade >= 1) {
        const f = fadeTo; fadeTo = null; fade = 1; fadeIn = 1;
        if (f.indexOf('play:') === 0) startLevel(parseInt(f.substr(5), 10)); else enterScene(f);
      }
      clearPressed();
    } else {
      const n = Math.max(1, Math.ceil(dt / (1 / 100))), sub = dt / n;
      for (let i = 0; i < n; i++) {
        if (scene === 'play') updatePlay(sub);
        else if (scene === 'title') updateTitle(sub);
        else if (scene === 'story' || scene === 'ending') updateStory(sub);
        else if (scene === 'map') updateMap(sub);
        if (i === 0) clearPressed();
        if (fadeTo) break;
      }
      if (fadeIn > 0) fadeIn = Math.max(0, fadeIn - dt / 0.25);
    }
    // render
    g.imageSmoothingEnabled = false;
    if (scene === 'play' && Q) drawPlay();
    else if (scene === 'title') drawTitle();
    else if (scene === 'story' || scene === 'ending') drawStory();
    else if (scene === 'map') drawMap();
    const f = fadeTo ? fade : fadeIn;
    if (f > 0) { g.globalAlpha = Math.min(1, f); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    flushTexts();
    drawTouch();
  }
  let fadeIn = 0;
  enterScene('title');
  requestAnimationFrame(frame);
  if (location.search.indexOf('debug') >= 0) window.LL = { startLevel, get Q() { return Q; }, save, genLevel, BIOMES, setScene: s => { scene = s; }, hurtBoss, completeLevel, updatePlay, act, clearPressed, solid, ch, maxHP };
})();
