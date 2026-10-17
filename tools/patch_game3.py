import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


# ---------------- save / stats ----------------
rep("let save = { cleared: [], shards: {}, coins: 0, lang: 'vi', vol: 0.6 };",
    "let save = { cleared: [], shards: {}, coins: 0, lang: 'vi', vol: 0.6, relics: [0, 0, 0, 0, 0, 0, 0], ammo: { dagger: 0, bomb: 0, flask: 0 } };")
rep("const writeSave = () => { try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) { } };",
    u"""const writeSave = () => { try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) { } };
  if (!Array.isArray(save.relics) || save.relics.length < 7) save.relics = [0, 0, 0, 0, 0, 0, 0];
  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };""")
rep("  const maxHP = () => 3 + Math.floor(totalShards() / 3);\n  const swordDmg = () => 1 + Math.floor(totalShards() / 7);",
    "  const hasRelic = i => !!save.relics[i];\n  const maxHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0);\n  const swordDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0);")

# ---------------- strings ----------------
rep("    talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },", u"""    talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },
    use: { en: 'E: Use', vi: 'E: Dùng' }, light: { en: 'E: Light', vi: 'E: Thắp lửa' }, read: { en: 'E: Read', vi: 'E: Đọc' },
    dagger: { en: 'Dagger', vi: 'Dao găm' }, bomb: { en: 'Bomb', vi: 'Bom' }, flask: { en: 'Fire flask', vi: 'Bình lửa' },
    noammo: { en: 'No throwables left!', vi: 'Hết đồ để ném!' },
    gotkey: { en: 'Got a key!', vi: 'Nhặt được chìa khóa!' }, needkey: { en: 'This door needs a key.', vi: 'Cửa này cần chìa khóa.' },
    gateopen: { en: 'The way opens!', vi: 'Con đường đã mở!' }, wrong: { en: 'Wrong order! The flames die.', vi: 'Sai thứ tự! Ngọn lửa tắt hết.' },
    hurry: { en: 'Hurry! The gate will close!', vi: 'Nhanh lên! Cổng sắp đóng!' }, wallbroke: { en: 'The cracked wall crumbles!', vi: 'Bức tường nứt đã sập!' },
    tabletT: { en: 'ANCIENT TABLET', vi: 'BIA ĐÁ CỔ' }, tabletH: { en: 'Light / step on them in this order:', vi: 'Hãy thắp / giẫm lên theo thứ tự này:' },
    relicNew: { en: 'RELIC OBTAINED!', vi: 'NHẬN ĐƯỢC THÁNH VẬT!' }, relicHave: { en: 'Relic (already owned)', vi: 'Thánh vật (đã có)' },
    relics: { en: 'Relics', vi: 'Thánh vật' }, cleared: { en: 'Maps cleared', vi: 'Màn đã qua' }, difficulty: { en: 'Difficulty', vi: 'Độ khó' },
    puzzles: { en: 'Puzzles', vi: 'Câu đố' }, length: { en: 'Length', vi: 'Độ dài' }, min: { en: 'min', vi: 'phút' }, maps: { en: 'maps', vi: 'màn' },
    shopb: { en: 'Bombs x3 (14 coins)', vi: 'Bom x3 (14 xu)' }, shopd: { en: 'Daggers x8 (10 coins)', vi: 'Dao găm x8 (10 xu)' }, shopf: { en: 'Fire flasks x3 (14 coins)', vi: 'Bình lửa x3 (14 xu)' },""")
rep("ctl: { en: 'Move A/D  Jump Space  Attack J  Dash K  (↓+J in air = pogo)', vi: 'Di chuyển A/D  Nhảy Space  Đánh J  Lướt K  (↓+J trên không = nảy)' },",
    "ctl: { en: 'Move A/D  Jump Space  Attack J  Dash K  Throw L  Switch Q  Talk/Use E', vi: 'Di chuyển A/D  Nhảy Space  Đánh J  Lướt K  Ném L  Đổi đồ Q  Nói chuyện/Dùng E' },")

# ---------------- NPC data ----------------
rep("  // ---------- text queue (drawn at native resolution after blit) ----------", u"""  Object.assign(NPCS, {
    smith: { spr: 'npc_smith', name: { en: 'Durin the Smith', vi: 'Thợ rèn Durin' }, shop: true },
    wizard: { spr: 'npc_wizard', name: { en: 'Old Merl', vi: 'Pháp sư Merl' } },
    fairy: { spr: 'npc_fairy', name: { en: 'Pip the Fairy', vi: 'Tiên Pip' } }
  });
  NPCS.lila.generic = [{ en: 'Be safe, Ember.', vi: 'Giữ gìn nhé, Ember.' }];
  NPCS.bram.generic = [{ en: 'Stay sharp out there.', vi: 'Luôn cảnh giác nhé.' }];
  NPCS.gob.generic = [{ en: 'Gob has goods! Buy, buy!', vi: 'Gob có hàng ngon! Mua đi mua đi!' }];
  NPCS.angel.generic = [{ en: 'The light is with you.', vi: 'Ánh sáng ở bên bạn.' }];
  NPCS.smith.generic = [{ en: 'Durin never sleeps. Need something that goes boom?', vi: 'Durin không bao giờ ngủ. Cần thứ gì nổ bùm không?' }];
  NPCS.wizard.generic = [{ en: 'The old mechanisms still work, if you know how to wake them.', vi: 'Cơ quan cổ vẫn còn dùng được, nếu bạn biết cách đánh thức chúng.' }];
  NPCS.fairy.generic = [{ en: 'Pip is right behind you! ...kind of.', vi: 'Pip ở ngay sau bạn nè! ...cũng gần như vậy.' }];
  const DLG2 = {
    0: { fairy: [
      { en: 'Hi hi! I am Pip! Pick up daggers, bombs and fire flasks on your way - press L to throw, Q to switch.', vi: 'Hi hi! Tớ là Pip! Nhặt dao găm, bom và bình lửa trên đường đi - nhấn L để ném, Q để đổi loại.' },
      { en: 'See a lever? Hit it with your sword and the iron gate opens. Cracked walls crumble to bombs!', vi: 'Thấy cần gạt không? Chém vào nó là cổng sắt mở. Tường nứt thì dùng bom phá nhé!' },
      { en: 'Keys, torches, rune plates... I will help where I can. Good luck, Ember!', vi: 'Chìa khóa, đuốc, bàn đá ký hiệu... tớ sẽ giúp khi có thể. Chúc may mắn, Ember!' }
    ] },
    1: { wizard: [
      { en: 'Ah, a lantern-bearer. The old mechanisms of this forest still work, if one knows how to wake them.', vi: 'À, người mang đèn. Cơ quan cổ trong khu rừng này vẫn hoạt động, nếu biết cách đánh thức chúng.' },
      { en: 'An iron door wants a key. Torches want a flame - stand close and press E, your lantern will do.', vi: 'Cửa sắt cần chìa khóa. Đuốc cần ngọn lửa - đứng gần và nhấn E, đèn của bạn đủ để thắp.' },
      { en: 'Remember: patience opens more doors than swords.', vi: 'Nhớ nhé: kiên nhẫn mở được nhiều cửa hơn thanh kiếm.' }
    ] },
    2: { smith: [
      { en: 'Durin forge! Best bombs in Aurelia. A cracked wall crumbles to a good explosion - BOOM!', vi: 'Lò rèn Durin! Bom tốt nhất Aurelia. Tường nứt sẽ sập vì một vụ nổ ra trò - BÙM!' },
      { en: 'Daggers for things that fly. Fire flasks light torches and burn what stands in them.', vi: 'Dao găm cho thứ biết bay. Bình lửa thắp được đuốc và thiêu cháy thứ đứng trong đó.' }
    ], wizard: [
      { en: 'Torches in order? Read the stone tablet first - press E next to it. The colors show the order.', vi: 'Đuốc phải theo thứ tự ư? Đọc bia đá trước - nhấn E bên cạnh nó. Màu sắc cho biết thứ tự.' },
      { en: 'Light the wrong one and every flame dies. Take your time.', vi: 'Thắp sai một cái là mọi ngọn lửa tắt. Cứ từ từ.' }
    ] },
    3: { gob: [
      { en: 'Heehee, sand sand sand! Gob found a charm inside a mummy. Gob kept the mummy socks.', vi: 'Hê hê, cát cát cát! Gob tìm được bùa trong xác ướp. Gob giữ luôn tất của xác ướp.' }
    ], smith: [
      { en: 'Hot sand, hot steel. A timed lever? Run like a rabbit - or dash straight through.', vi: 'Cát nóng, thép nóng. Cần gạt tính giờ ư? Chạy như thỏ - hoặc lướt xuyên qua luôn.' }
    ] },
    4: { smith: [
      { en: 'My hammer freezes to my hand up here! Bombs, daggers, flasks - the flasks are warm.', vi: 'Búa của tôi đóng băng vào tay rồi! Bom, dao găm, bình lửa - bình lửa thì ấm đó.' }
    ] },
    5: { smith: [
      { en: 'Forged in lava, quenched in tears. Take what you need before the Titan.', vi: 'Rèn trong dung nham, tôi trong nước mắt. Lấy thứ bạn cần trước khi gặp Titan.' }
    ] },
    6: { wizard: [
      { en: 'The final seal: rune plates that remember the dawn. Step on each plate in the order the tablet shows. Only walking counts - jumping over is safe.', vi: 'Phong ấn cuối: các bàn đá ký hiệu nhớ bình minh. Hãy giẫm từng bàn theo thứ tự trên bia. Chỉ bước đi mới tính - nhảy qua thì an toàn.' }
    ], fairy: [
      { en: 'Pip believes in you! Bring back the Sun!', vi: 'Pip tin ở bạn! Mang Mặt Trời trở lại nhé!' }
    ] }
  };
  for (const k in DLG2) DLG[k] = Object.assign(DLG[k] || {}, DLG2[k]);
  const SHOPS = {
    gob: [{ k: 'shop1', price: 15, fx: () => { Q.P.hp = maxHP(); } }, { k: 'shop2', price: 25, fx: () => { Q.P.shield = true; } }],
    smith: [{ k: 'shopb', price: 14, fx: () => { Q.P.ammo.bomb += 3; } }, { k: 'shopd', price: 10, fx: () => { Q.P.ammo.dagger += 8; } }, { k: 'shopf', price: 14, fx: () => { Q.P.ammo.flask += 3; } }]
  };
  const RELICS = [
    { name: { en: 'Crown of the Slime King', vi: 'Vương miện Vua Slime' }, desc: { en: '+2 maximum hearts', vi: '+2 tim tối đa' } },
    { name: { en: 'Venom Fang', vi: 'Nanh Độc' }, desc: { en: 'Sword and daggers hit harder (+1)', vi: 'Kiếm và dao găm mạnh hơn (+1)' } },
    { name: { en: 'Crystal Lantern', vi: 'Đèn Pha Lê' }, desc: { en: 'Your lantern shines much brighter', vi: 'Đèn của bạn sáng hơn nhiều' } },
    { name: { en: "Pharaoh's Scarab", vi: 'Bọ Hung Pharaoh' }, desc: { en: 'Coins are worth double and fly to you', vi: 'Xu giá trị gấp đôi và bay về phía bạn' } },
    { name: { en: 'Frost Heart', vi: 'Trái Tim Băng' }, desc: { en: 'Never slip on ice; dash recharges faster', vi: 'Không trượt trên băng; lướt hồi nhanh hơn' } },
    { name: { en: 'Magma Core', vi: 'Lõi Dung Nham' }, desc: { en: 'Your sword throws a wave of flame', vi: 'Kiếm bắn ra sóng lửa' } },
    { name: { en: 'Heart of the Sun', vi: 'Trái Tim Mặt Trời' }, desc: { en: 'The Sun burns again', vi: 'Mặt Trời cháy sáng trở lại' } }
  ];

  // ---------- text queue (drawn at native resolution after blit) ----------""")

# ---------------- input ----------------
rep("act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x') || gpP('rb');", "act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');\n    act.throwP = any(pressed, ['KeyL']) || gpP('y'); act.swapP = any(pressed, ['KeyQ']) || gpP('lb');")
rep("gpP('b') || gpP('rt') || gpP('y');", "gpP('b') || gpP('rt');")
rep("act.talkP = pressed.KeyE || pressed.Enter || gpP('lb');", "act.talkP = pressed.KeyE || pressed.Enter || gpP('rb');")
rep("act.atkP = act.dashP = act.pauseP = act.talkP = act.okP", "act.atkP = act.throwP = act.swapP = act.dashP = act.pauseP = act.talkP = act.okP")
rep("      { k: 'KeyK', x: w - s * 1.5, y: h - s * 1.9, r: r * 0.85, l: '»' }, { k: 'Escape', x: w - s * 0.5, y: s * 0.5, r: r * 0.7, l: 'II' }",
    "      { k: 'KeyK', x: w - s * 1.5, y: h - s * 1.9, r: r * 0.85, l: '»' }, { k: 'Escape', x: w - s * 0.5, y: s * 0.5, r: r * 0.7, l: 'II' },\n      { k: 'KeyL', x: w - s * 2.9, y: h - s * 1.5, r: r * 0.8, l: '●' }, { k: 'KeyQ', x: w - s * 3.3, y: h - s * 0.5, r: r * 0.6, l: '⇄' }")
rep("if (scene === 'play' && Q && Q.nearNpc && Q.state === 'play')", "if (scene === 'play' && Q && (Q.nearNpc || Q.nearPz) && Q.state === 'play')")

# ---------------- solid ----------------
rep("    if (c === '#' || c === 'I') return true;", "    if (c === '#' || c === 'I' || c === 'G' || c === 'X') return true;")

# ---------------- player ----------------
rep("hp: maxHP(), anim: 0, drop: 0, riding: null, safeT: 0, wasGround: false, lastVy: 0 };",
    "hp: maxHP(), anim: 0, drop: 0, riding: null, safeT: 0, wasGround: false, lastVy: 0, ammo: save.ammo, sel: 0, keys: 0, throwCd: 0, shield: false };")
rep("ents: [], items: [], projs: [], traps: [], parts: [], boss: null, nearNpc: null, talk: null,",
    "ents: [], items: [], projs: [], traps: [], fps: [], fires: [], gates: [], pz: [], solved: new Set(), brokenX: new Set(), nearPz: null, parts: [], boss: null, nearNpc: null, talk: null,")

# ---------------- entities ----------------
rep("    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.boss = null; Q.nearNpc = null;", u"""    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;
    for (const gd of L.gates) { const open = Q.solved.has(gd.id); for (let y = gd.y0; y <= gd.y1; y++) L.grid[y][gd.x] = open ? ' ' : 'G'; }
    for (const w of L.xwalls) for (const t of w.tiles) L.grid[t[1]][t[0]] = Q.brokenX.has(t[0] + ',' + t[1]) ? ' ' : 'X';
    Q.gates = L.gates.map(gd => Object.assign({}, gd, { open: Q.solved.has(gd.id), seqIdx: 0, timer: 0, levers: 0 }));""")
rep("      else if (s.type === 'boss') Q.boss = makeBoss(s);",
    u"""      else if (s.type === 'boss') Q.boss = makeBoss(s);
      else if (s.type === 'pk') Q.items.push({ kind: 'pk', what: s.what, amt: s.what === 'dagger' ? 5 : 2, keep: !!s.keep, x: s.x, y: s.y - 7, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'key') Q.items.push({ kind: 'key', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'lever') Q.pz.push({ type: 'lever', x: s.x, y: s.y, gate: s.gate, on: false });
      else if (s.type === 'torch') Q.pz.push({ type: 'torch', x: s.x, y: s.y, gate: s.gate, ci: s.ci, tid: s.tid, lit: false });
      else if (s.type === 'tablet') Q.pz.push({ type: 'tablet', x: s.x, y: s.y, gate: s.gate });
      else if (s.type === 'rune') Q.pz.push({ type: 'rune', x: s.x, y: s.y, gate: s.gate, ci: s.ci, tid: s.tid, lit: false, on: false });""")

# ---------------- hero voices ----------------
rep("    Snd.play('hurt');\n    emit(P.x + P.w / 2, P.y + P.h / 2, 10,", "    Snd.play('hurt'); Snd.hero('hurt');\n    emit(P.x + P.w / 2, P.y + P.h / 2, 10,")
rep("P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die');", "P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); Snd.hero('die');")
rep("    const ice = P.onGround && P.groundCh === 'I';", "    const ice = P.onGround && P.groundCh === 'I' && !hasRelic(4);")
rep("P.dash = 0.17; P.dashCd = 0.7;", "P.dash = 0.17; P.dashCd = hasRelic(4) ? 0.35 : 0.7;")
rep("      Snd.play('dash'); emit(P.x + 4, P.y + 8, 8,", "      Snd.play('dash'); Snd.hero('dash'); emit(P.x + 4, P.y + 8, 8,")
rep("P.jumps = 1; P.onGround = false; Snd.play('jump');", "P.jumps = 1; P.onGround = false; Snd.play('jump'); Snd.hero('jump');")
rep("P.jumps = 2; P.jumpBuf = 0; Snd.play('djump');", "P.jumps = 2; P.jumpBuf = 0; Snd.play('djump'); Snd.hero('djump');")
rep("      P.atk = 0.2; P.atkCd = 0.27; P.atkHit = new Set(); P.atkDown = !P.onGround && act.down;\n      Snd.play('slash');\n    }",
    u"""      P.atk = 0.2; P.atkCd = 0.27; P.atkHit = new Set(); P.atkDown = !P.onGround && act.down;
      Snd.play('slash'); if (Math.random() < 0.6) Snd.hero('attack');
      if (hasRelic(5) && !P.atkDown) { Snd.play('flame'); Q.fps.push({ t: 'wave', x: P.x + 4 + P.face * 10, y: P.y + 7, vx: P.face * 150, vy: 0, g: 0, life: 0.55, hit: new Set() }); }
    }
    P.throwCd -= dt;
    if (act.swapP) cycleWeapon();
    if (act.throwP && P.throwCd <= 0 && P.dash <= 0) throwItem();""")

# ---------------- sword hits levers ----------------
rep("    // destroy projectiles\n    for (const p of Q.projs) if (!p.boss",
    "    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(r, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);\n    // destroy projectiles\n    for (const p of Q.projs) if (!p.boss")

# ---------------- enemy hurt + drops + voices ----------------
rep("    e.hp -= dmg; e.flash = 0.12;\n    const P = Q.P;", "    e.hp -= dmg; e.flash = 0.12;\n    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt');\n    const P = Q.P;")
rep("        if (Math.random() < 0.08) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });",
    "        if (Math.random() < 0.08) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });\n        if (Math.random() < 0.1) { const w = ['dagger', 'dagger', 'bomb', 'flask'][(Math.random() * 4) | 0]; Q.items.push({ kind: 'pk', what: w, amt: w === 'dagger' ? 3 : 1, keep: false, x: e.x + e.w / 2, y: e.y, id: -1, vy: -90, vx: rr(-30, 30), ph: 0, drop: true }); }")
rep("    b.hp -= dmg; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);", "    b.hp -= dmg; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);\n    Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);")
rep("    Snd.play('bossroar'); Snd.music('boss', BOSS_MUSIC);", "    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC);")
rep("b.st = 'tele'; b.timer = 0.6 / fury; Snd.play('shoot'); }", "b.st = 'tele'; b.timer = 0.6 / fury; Snd.creature(Q.li, 'attack', true); }")
rep("      const c = e.cfg, dx = (P.x + P.w / 2) - (e.x + e.w / 2), dy = (P.y + P.h / 2) - (e.y + e.h / 2);",
    u"""      const c = e.cfg, dx = (P.x + P.w / 2) - (e.x + e.w / 2), dy = (P.y + P.h / 2) - (e.y + e.h / 2);
      { const d2 = Math.abs(dx) + Math.abs(dy) * 0.5;
        if (!e.alerted && d2 < 110) { e.alerted = true; Snd.creature(e.type, 'alert'); e.vt = rr(2, 4); }
        else if (e.alerted && d2 < 170) { e.vt -= dt; if (e.vt <= 0) { e.vt = rr(3.5, 7); Snd.creature(e.type, 'idle'); } }
        else if (d2 > 230) e.alerted = false; }""")
rep("if (e.cd <= 0) { e.cd = 2.2; e.st = 'wind'; e.stT = 0.35; }", "if (e.cd <= 0) { e.cd = 2.2; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }")
rep("e.cd <= 0) { e.cd = 2.1; e.st = 'wind'; e.stT = 0.35; }", "e.cd <= 0) { e.cd = 2.1; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }")
rep("{ e.st = 'wind'; e.stT = 0.4; e.vx = 0; }", "{ e.st = 'wind'; e.stT = 0.4; e.vx = 0; Snd.creature(e.type, 'attack'); }")

# ---------------- talk / shop ----------------
rep("    const d = (DLG[Q.li] || {})[it.who] || [{ en: '...', vi: '...' }];", "    const d = (DLG[Q.li] || {})[it.who] || NPCS[it.who].generic || [{ en: '...', vi: '...' }];")
rep("Q.state = 'talk'; Snd.play('select'); Q.P.vx = 0;", "Q.state = 'talk'; Snd.blip(it.who); Q.P.vx = 0;")
rep("    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; return; }", "    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; Q.shopWho = it.who; return; }")
rep("    const tk = Q.talk; tk.t += dt;\n    const full = tk.lines[tk.i][save.lang].length;",
    u"""    const tk = Q.talk; tk.t += dt;
    const full = tk.lines[tk.i][save.lang].length;
    { const ln = tk.lines[tk.i][save.lang], n0 = Math.floor((tk.t - dt) * 45), n1 = Math.min(ln.length, Math.floor(tk.t * 45));
      for (let k = n0 + 1; k <= n1; k++) if (k % 2 === 0 && /\\S/.test(ln[k - 1] || ' ')) Snd.blip(tk.it.who); }""")
a = s.index("  function updateShop() {")
b = s.index("  // ----- traps -----")
s = s[:a] + u"""  function updateShop() {
    const list = SHOPS[Q.shopWho] || [], n = list.length + 1;
    if (act.upP) { Q.menu = (Q.menu + n - 1) % n; Snd.play('select'); }
    if (act.downP) { Q.menu = (Q.menu + 1) % n; Snd.play('select'); }
    if (act.backP || act.pauseP) { Q.state = 'play'; return; }
    if (act.okP) {
      if (Q.menu === list.length) { Q.state = 'play'; return; }
      const it = list[Q.menu];
      if (save.coins < it.price) { Q.shopMsg = T('nomoney'); Snd.play('hurt'); return; }
      save.coins -= it.price; it.fx(); writeSave(); Snd.play('buy'); Q.shopMsg = T('bought');
    }
  }

""" + s[b:]
rep("""      g.fillStyle = 'rgba(8,6,20,.94)'; g.fillRect(40, 60, VW - 80, 100);
      g.fillStyle = '#ffd34e'; g.fillRect(40, 60, VW - 80, 1); g.fillRect(40, 159, VW - 80, 1); g.fillRect(40, 60, 1, 100); g.fillRect(VW - 41, 60, 1, 100);
      txt(LN(NPCS.gob.name), VW / 2, 72, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      txt(T('wallet') + ': ' + save.coins, VW / 2, 86, { al: 'center', size: 7, col: '#cfd6e6' });
      ['shop1', 'shop2', 'shop3'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 106 + i * 14, { al: 'center', size: 7, col: Q.menu === i ? '#ffd34e' : '#e8eaf5' }));
      if (Q.shopMsg) txt(Q.shopMsg, VW / 2, 150, { al: 'center', size: 6, col: '#a4e86b' });
      if (Q.P.shield) txt('Shield ON', 50, 72, { size: 6, col: '#6ee7f2' });""",
    u"""      const list = SHOPS[Q.shopWho] || [], hh = 70 + (list.length + 1) * 14;
      g.fillStyle = 'rgba(8,6,20,.94)'; g.fillRect(40, 50, VW - 80, hh);
      g.fillStyle = '#ffd34e'; g.fillRect(40, 50, VW - 80, 1); g.fillRect(40, 49 + hh, VW - 80, 1); g.fillRect(40, 50, 1, hh); g.fillRect(VW - 41, 50, 1, hh);
      txt(LN(NPCS[Q.shopWho].name), VW / 2, 62, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      txt(T('wallet') + ': ' + save.coins, VW / 2, 76, { al: 'center', size: 7, col: '#cfd6e6' });
      list.map(o => o.k).concat(['shop3']).forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 96 + i * 14, { al: 'center', size: 7, col: Q.menu === i ? '#ffd34e' : '#e8eaf5' }));
      if (Q.shopMsg) txt(Q.shopMsg, VW / 2, 50 + hh - 8, { al: 'center', size: 6, col: '#a4e86b' });
      txt(T('dagger') + ' ' + Q.P.ammo.dagger + '  ' + T('bomb') + ' ' + Q.P.ammo.bomb + '  ' + T('flask') + ' ' + Q.P.ammo.flask + (Q.P.shield ? '  [Shield]' : ''), VW / 2, 50 + hh - 20, { al: 'center', size: 6, col: '#8892aa' });""")

# ---------------- items: pk/key + magnet relic ----------------
rep("      if (it.kind === 'coin') {\n        if (d < 40 && !it.drop) { it.x += (pc.x - it.x) * 6 * dt; it.y += (pc.y - it.y) * 6 * dt; }\n        if (d < 10) { it.dead = true; Q.coinsRun++; save.coins++;",
    "      if (it.kind === 'coin') {\n        if (d < (hasRelic(3) ? 90 : 40) && !it.drop) { it.x += (pc.x - it.x) * 6 * dt; it.y += (pc.y - it.y) * 6 * dt; }\n        if (d < 10) { it.dead = true; const cv2 = hasRelic(3) ? 2 : 1; Q.coinsRun += cv2; save.coins += cv2;")
rep("      } else if (it.kind === 'npc') {\n        if (Math.abs(it.x - pc.x) < 26",
    u"""      } else if (it.kind === 'pk') {
        if (d < 13) {
          it.dead = true; P.ammo[it.what] += it.amt; Snd.play('pickup'); if (it.id >= 0 && !it.keep) Q.taken.add(it.id);
          Q.msg = '+' + it.amt + ' ' + T(it.what) + '   (L / Q)'; Q.msgT = 3; emit(it.x, it.y, 8, { col: ['#fff', '#ffd34e'], sp0: 10, sp1: 50 });
          const names = ['dagger', 'bomb', 'flask']; if (P.ammo[names[P.sel]] <= 0) P.sel = names.indexOf(it.what);
        }
      } else if (it.kind === 'key') {
        if (d < 13) { it.dead = true; P.keys++; Snd.play('key'); Q.taken.add(it.id); Q.msg = T('gotkey'); Q.msgT = 3; emit(it.x, it.y, 14, { col: ['#ffd34e', '#fff'], sp0: 15, sp1: 60 }); }
      } else if (it.kind === 'npc') {
        if (Math.abs(it.x - pc.x) < 26""")

# ---------------- complete level w/ relic ----------------
rep("    Q.state = 'complete'; Q.stateT = 0; Snd.play('win'); Snd.stop();\n    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);",
    "    Q.state = 'complete'; Q.stateT = 0; Snd.stop();\n    Q.relicNew = !save.relics[Q.li]; save.relics[Q.li] = 1;\n    Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer');\n    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);")

# ---------------- puzzle / throw systems ----------------
rep("  function updatePlats(dt) {", u"""  // ===================== throwables =====================
  const WEAPONS = ['dagger', 'bomb', 'flask'];
  function cycleWeapon() { const P = Q.P; P.sel = (P.sel + 1) % 3; Snd.play('select'); }
  function throwItem() {
    const P = Q.P;
    if (P.ammo[WEAPONS[P.sel]] <= 0) {
      const alt = WEAPONS.findIndex(w => P.ammo[w] > 0);
      if (alt < 0) { Q.msg = T('noammo'); Q.msgT = 2; P.throwCd = 0.4; return; }
      P.sel = alt;
    }
    const w = WEAPONS[P.sel], f = P.face; P.ammo[w]--; P.throwCd = 0.32; Snd.play('throw'); Snd.hero('attack');
    const x = P.x + 4 + f * 6;
    if (w === 'dagger') Q.fps.push({ t: 'dagger', x, y: P.y + 6, vx: f * 240, vy: 0, g: 0, life: 0.9, f });
    else if (w === 'bomb') Q.fps.push({ t: 'bomb', x, y: P.y + 3, vx: f * 105 + P.vx * 0.3, vy: -125, g: 520, life: 1.3, f });
    else Q.fps.push({ t: 'flask', x, y: P.y + 3, vx: f * 115 + P.vx * 0.3, vy: -110, g: 520, life: 2, f });
  }
  function groundBelow(x, y) { const tx = Math.floor(x / TS); for (let ty = Math.floor(y / TS); ty < Q.L.H; ty++) if (solid(tx, ty) || ch(tx, ty) === '=') return ty * TS; return y; }
  function shatter(p) {
    Snd.play('flame'); const gy2 = groundBelow(p.x, p.y);
    Q.fires.push({ x: p.x, y: gy2, life: 3.2, t: 0, tick: 0 }); emit(p.x, p.y, 14, { col: ['#ffd34e', '#f08a2b', '#e0453a'], sp0: 20, sp1: 90 });
  }
  function breakWalls(cx, cy, r) {
    const L = Q.L; let broke = false;
    const x0 = Math.floor((cx - r) / TS), x1 = Math.floor((cx + r) / TS), y0 = Math.floor((cy - r) / TS), y1 = Math.floor((cy + r) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (ch(tx, ty) !== 'X') continue;
      const st = [[tx, ty]];
      while (st.length) {
        const c = st.pop(), a = c[0], b = c[1];
        if (ch(a, b) !== 'X') continue;
        L.grid[b][a] = ' '; Q.brokenX.add(a + ',' + b);
        emit(a * TS + 8, b * TS + 8, 3, { col: ['#8a6a44', '#cfd6e6', '#5e3b22'], sp0: 20, sp1: 90, vy: -20 });
        st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
      }
      broke = true;
    }
    if (broke) { Snd.play('gate'); Q.msg = T('wallbroke'); Q.msgT = 3; Q.shake = 0.7; }
  }
  function explode(x, y, r, dmg) {
    Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.45);
    emit(x, y, 40, { col: ['#fff6c0', '#ffd34e', '#f08a2b', '#e0453a'], sp0: 40, sp1: 170, l0: 0.2, l1: 0.6 });
    for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg);
    const b = Q.boss;
    if (b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < r + b.w / 2) hurtBoss(b, dmg);
    breakWalls(x, y, r);
    const P = Q.P; if (Math.hypot(P.x + 4 - x, P.y + 7 - y) < r * 0.8) { P.vx += (P.x + 4 < x ? -1 : 1) * 140; P.vy = -150; }
    Q.fps.push({ t: 'blast', x, y, life: 0.25, r });
  }
  function updateFps(dt) {
    for (const p of Q.fps) {
      p.life -= dt;
      if (p.t === 'blast') { if (p.life <= 0) p.dead = true; continue; }
      if (p.life <= 0) { if (p.t === 'bomb') explode(p.x, p.y, 34, 4); else if (p.t === 'flask') shatter(p); p.dead = true; continue; }
      p.vy += (p.g || 0) * dt;
      let hitTile = false;
      p.x += p.vx * dt; if (solid(Math.floor(p.x / TS), Math.floor(p.y / TS))) { p.x -= p.vx * dt; p.vx = p.t === 'bomb' ? -p.vx * 0.3 : 0; hitTile = true; }
      p.y += p.vy * dt; if (solid(Math.floor(p.x / TS), Math.floor(p.y / TS))) { p.y -= p.vy * dt; if (p.t === 'bomb') { if (p.vy > 0) { p.vx *= 0.6; } p.vy = 0; } else hitTile = true; }
      const box = { x: p.x - 3, y: p.y - 3, w: 6, h: 6 };
      if (p.t === 'wave') { if (hitTile) { p.dead = true; continue; } if (Math.random() < 0.7) emit(p.x, p.y + rr(-3, 3), 1, { col: ['#ffd34e', '#f08a2b', '#e0453a'], sp0: 3, sp1: 14, grav: -10, l0: 0.15, l1: 0.3 }); }
      if (p.t === 'dagger') for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(box, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) { leverPull(pz); p.dead = true; }
      if (p.dead) continue;
      let hit = null;
      for (const e of Q.ents) if (!e.dead && ov(box, e) && !(e.cfg && e.cfg.ai === 'blob' && e.st !== 'up')) { hit = e; break; }
      const b = Q.boss; if (!hit && b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && ov(box, b)) hit = b;
      if (hit) {
        if (p.t === 'dagger') { (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 2 + (hasRelic(1) ? 1 : 0)); Snd.play('hit'); p.dead = true; }
        else if (p.t === 'wave') { if (!p.hit.has(hit)) { p.hit.add(hit); (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 1); } }
        else if (p.t === 'bomb') { explode(p.x, p.y, 34, 4); p.dead = true; }
        else if (p.t === 'flask') { (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 1); shatter(p); p.dead = true; }
        continue;
      }
      if (hitTile) {
        if (p.t === 'dagger') { emit(p.x, p.y, 4, { col: '#cfd6e6', sp0: 10, sp1: 40 }); p.dead = true; }
        else if (p.t === 'flask') { shatter(p); p.dead = true; }
      }
    }
    Q.fps = Q.fps.filter(p => !p.dead);
  }
  function updateFires(dt) {
    for (const f of Q.fires) {
      f.life -= dt; f.t += dt; f.tick -= dt;
      if (Math.random() < 0.7) emit(f.x + rr(-9, 9), f.y - rr(0, 6), 1, { col: ['#ffd34e', '#f08a2b', '#e0453a'], sp0: 3, sp1: 14, vy: -22, grav: -20, l0: 0.25, l1: 0.5 });
      if (f.tick <= 0) {
        f.tick = 0.4; const box = { x: f.x - 13, y: f.y - 20, w: 26, h: 20 };
        for (const e of Q.ents) if (!e.dead && ov(box, e)) hurtEnemy(e, 1);
        const b = Q.boss; if (b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && ov(box, b)) hurtBoss(b, 1);
      }
      for (const pz of Q.pz) if (pz.type === 'torch' && !pz.lit && Math.abs(pz.x - f.x) < 20 && Math.abs(pz.y - f.y) < 24) lightTorch(pz);
    }
    Q.fires = Q.fires.filter(f => f.life > 0);
  }

  // ===================== puzzles =====================
  const gateOf = id => Q.gates.find(gd => gd.id === id);
  function setGateTiles(gd, c) { for (let y = gd.y0; y <= gd.y1; y++) Q.L.grid[y][gd.x] = c; }
  function openGate(gd, silent) {
    if (gd.open) return;
    gd.open = true; setGateTiles(gd, ' ');
    if (gd.need === 'timed') gd.timer = gd.T; else Q.solved.add(gd.id);
    if (!silent) { Snd.play('gate'); Q.shake = 0.5; Q.msg = T('gateopen'); Q.msgT = 3; for (let y = 2; y < gd.y1; y += 2) emit(gd.x * TS + 8, y * TS, 3, { col: ['#cfd6e6', '#8d9bbd'], sp0: 10, sp1: 40 }); }
  }
  function closeGate(gd) {
    gd.open = false; gd.timer = 0; gd.levers = 0; setGateTiles(gd, 'G'); Snd.play('gate');
    for (const pz of Q.pz) if (pz.gate === gd.id && pz.type === 'lever') pz.on = false;
  }
  function leverPull(pz) {
    if (pz.on) return;
    const gd = gateOf(pz.gate); if (!gd || gd.open) return;
    pz.on = true; Snd.play('lever'); emit(pz.x, pz.y - 8, 6, { col: '#ffd34e', sp0: 10, sp1: 40 });
    gd.levers++;
    if (gd.need === 'timed') { openGate(gd); Q.msg = T('hurry'); Q.msgT = 3; }
    else if (gd.levers >= gd.count) openGate(gd);
    else { Q.msg = gd.levers + ' / ' + gd.count; Q.msgT = 2; }
  }
  function wrongOrder(gd) {
    gd.seqIdx = 0; for (const o of Q.pz) if (o.gate === gd.id) { o.lit = false; }
    Snd.play('zap'); Q.msg = T('wrong'); Q.msgT = 3; Q.shake = 0.3;
  }
  function lightTorch(pz) {
    if (pz.lit) return;
    const gd = gateOf(pz.gate); if (!gd || gd.open) return;
    if (gd.need === 'seq') {
      if (gd.seq[gd.seqIdx] === pz.tid) { pz.lit = true; gd.seqIdx++; Snd.play('torch'); if (gd.seqIdx >= gd.seq.length) openGate(gd); }
      else wrongOrder(gd);
    } else {
      pz.lit = true; Snd.play('torch');
      if (Q.pz.filter(o => o.gate === gd.id && o.type === 'torch' && o.lit).length >= gd.count) openGate(gd);
    }
    emit(pz.x, pz.y - 14, 8, { col: [TORCH_COLORS[pz.ci], '#fff'], sp0: 10, sp1: 50 });
  }
  function runeStep(pz) {
    const gd = gateOf(pz.gate); if (!gd || gd.open || pz.lit) return;
    if (gd.seq[gd.seqIdx] === pz.tid) { pz.lit = true; gd.seqIdx++; Snd.play('rune'); emit(pz.x, pz.y - 4, 10, { col: [TORCH_COLORS[pz.ci], '#fff'], sp0: 10, sp1: 50 }); if (gd.seqIdx >= gd.seq.length) openGate(gd); }
    else wrongOrder(gd);
  }
  function usePz(pz) {
    if (pz.type === 'lever') leverPull(pz);
    else if (pz.type === 'torch') lightTorch(pz);
    else if (pz.type === 'tablet') { Q.tablet = gateOf(pz.gate); Q.state = 'tablet'; Snd.play('select'); }
  }
  function updatePuzzles(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.nearPz = null;
    for (const pz of Q.pz) {
      if (pz.type === 'rune') {
        const on = P.onGround && P.x + P.w > pz.x - 8 && P.x < pz.x + 8 && Math.abs(P.y + P.h - pz.y) < 4;
        if (on && !pz.on) { pz.on = true; runeStep(pz); } else if (!on) pz.on = false;
        continue;
      }
      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit)) continue;
      if (Math.abs(pz.x - pc.x) < 16 && Math.abs(pz.y - pc.y) < 26) Q.nearPz = pz;
    }
    for (const gd of Q.gates) {
      if (!gd.open && gd.need === 'key') {
        if (Math.abs(pc.x - (gd.x * TS + 8)) < 16) {
          if (P.keys > 0) { P.keys--; openGate(gd); Snd.play('key'); }
          else if (!Q.keyMsgT || Q.t - Q.keyMsgT > 3) { Q.keyMsgT = Q.t; Q.msg = T('needkey'); Q.msgT = 2.5; }
        }
      } else if (gd.open && gd.need === 'timed') {
        gd.timer -= dt;
        if (gd.timer <= 0) {
          if (ov(P, { x: gd.x * TS - 2, y: 0, w: TS + 4, h: gd.y1 * TS + TS })) gd.timer = 0.25; else closeGate(gd);
        }
      }
    }
  }
  function drawPuzzles(camX, camY) {
    for (const pz of Q.pz) {
      const x = Math.round(pz.x - camX), y = Math.round(pz.y - camY);
      if (x < -30 || x > VW + 30) continue;
      if (pz.type === 'lever') drawSpr(g, icon('lever', pz.on ? 1 : 0), x, y, false);
      else if (pz.type === 'torch') drawSpr(g, icon('torch', pz.ci, pz.lit ? 1 : 0), x, y, false);
      else if (pz.type === 'tablet') drawSpr(g, icon('tablet'), x, y, false);
      else if (pz.type === 'rune') drawSpr(g, icon('rune', pz.ci, pz.lit ? 1 : 0), x, y + 1, false);
      if (Q.nearPz === pz && Q.state === 'play') txt(pz.type === 'torch' ? T('light') : (pz.type === 'tablet' ? T('read') : T('use')), x, y - 26, { al: 'center', size: 6, col: '#ffd34e' });
    }
    for (const gd of Q.gates) {
      if (gd.open && gd.need !== 'timed') continue;
      const gx = Math.round(gd.x * TS - camX + 8), gy2 = Math.round((gd.y1 - 3) * TS - camY);
      if (gx < -20 || gx > VW + 20) continue;
      if (gd.need === 'key') drawSpr(g, icon('key'), gx, gy2, false);
      else if (gd.need === 'lever' || gd.need === 'timed') {
        drawSpr(g, icon('lever', gd.open ? 1 : 0), gx, gy2, false);
        if (gd.need === 'lever' && gd.count > 1) txt(gd.levers + '/' + gd.count, gx, gy2 + 6, { al: 'center', size: 6 });
        if (gd.need === 'timed' && gd.open) { g.fillStyle = '#1b1626'; g.fillRect(gx - 11, gy2 + 4, 22, 4); g.fillStyle = gd.timer < 3 ? '#e0453a' : '#ffd34e'; g.fillRect(gx - 10, gy2 + 5, Math.max(0, 20 * gd.timer / gd.T), 2); }
      } else {
        const cols = gd.need === 'torches' ? Q.pz.filter(o => o.gate === gd.id && o.type === 'torch').map(o => ({ c: o.ci, on: o.lit })) : gd.seqColors.map((c, i) => ({ c, on: i < gd.seqIdx }));
        cols.forEach((o, i) => { const ox = gx - (cols.length * 7) / 2 + i * 7 + 3; g.fillStyle = '#1b1626'; g.fillRect(ox - 3, gy2 - 5, 7, 7); g.fillStyle = o.on ? TORCH_COLORS[o.c] : 'rgba(140,150,180,.45)'; g.fillRect(ox - 2, gy2 - 4, 5, 5); });
      }
    }
  }
  function drawFps(camX, camY) {
    for (const f of Q.fires) {
      const x = Math.round(f.x - camX), y = Math.round(f.y - camY), a = Math.min(1, f.life);
      g.globalAlpha = a;
      for (let i = 0; i < 5; i++) { const h = 6 + ((Math.sin(f.t * 12 + i * 2) + 1) * 4 | 0); g.fillStyle = '#e0453a'; g.fillRect(x - 10 + i * 4, y - h, 4, h); g.fillStyle = '#f08a2b'; g.fillRect(x - 9 + i * 4, y - h + 2, 2, h - 2); g.fillStyle = '#ffd34e'; g.fillRect(x - 9 + i * 4, y - 3, 2, 3); }
      g.globalAlpha = 1;
    }
    for (const p of Q.fps) {
      const x = Math.round(p.x - camX), y = Math.round(p.y - camY);
      if (p.t === 'dagger') drawSpr(g, icon('dagger'), x, y + 6, p.f < 0);
      else if (p.t === 'bomb') { const sp = icon('bomb'); drawSpr(g, sp, x, y + 7, false, p.life < 0.5 && Math.floor(p.life * 16) % 2 === 0); }
      else if (p.t === 'flask') drawSpr(g, icon('flask'), x, y + 7, false);
      else if (p.t === 'wave') { for (let i = 0; i < 3; i++) { g.fillStyle = ['#ffd34e', '#f08a2b', '#e0453a'][i]; g.fillRect(x - 3 * p.f - i * 2 * p.f - 1, y - 5 + i, 3, 10 - i * 2); } }
      else if (p.t === 'blast') { const k = 1 - p.life / 0.25; g.globalAlpha = 1 - k; disc(g, x, y, Math.round(p.r * (0.4 + k * 0.7)), '#fff6c0'); g.globalAlpha = 1; }
    }
  }

  function updatePlats(dt) {""")

# ---------------- updatePlay hooks ----------------
rep("    if (st === 'shop') { updateShop(); return; }", "    if (st === 'shop') { updateShop(); return; }\n    if (st === 'tablet') { if (act.okP || act.talkP || act.backP || act.pauseP || act.atkP) { Q.state = 'play'; } return; }")
rep("    if (st === 'play' && Q.nearNpc && act.talkP) { startTalk(Q.nearNpc); return; }",
    "    if (st === 'play' && act.talkP) { if (Q.nearNpc) { startTalk(Q.nearNpc); return; } if (Q.nearPz) { usePz(Q.nearPz); return; } }")
rep("updateBossDeath(dt); updateTraps(dt); updateProjs(dt);", "updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(dt);")

# ---------------- draw hooks ----------------
rep("      else if (c === '^') g.drawImage(ts.spike, dx, dy);", "      else if (c === '^') g.drawImage(ts.spike, dx, dy);\n      else if (c === 'G') g.drawImage(ts.gate, dx, dy);\n      else if (c === 'X') g.drawImage(ts.cracked, dx, dy);")
rep("    drawTraps(camX, camY);\n", "    drawTraps(camX, camY);\n    drawPuzzles(camX, camY);\n    drawFps(camX, camY);\n")
# item drawing: pk + key
rep("      } else if (it.kind === 'npc') {\n        const n = NPCS[it.who]",
    u"""      } else if (it.kind === 'pk') {
        const sp = icon(it.what); drawSpr(g, sp, x, y + 7 + Math.round(Math.sin(it.ph * 3) * 1.5), false);
        if (Math.random() < 0.05) emit(it.x + rr(-5, 5), it.y + rr(-6, 4), 1, { col: '#fff', sp0: 1, sp1: 6, grav: -8, l0: 0.3, l1: 0.6 });
      } else if (it.kind === 'key') {
        drawSpr(g, icon('key'), x, y + 5 + Math.round(Math.sin(it.ph * 3) * 1.5), false);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-5, 5), 1, { col: ['#fff', '#ffd34e'], sp0: 2, sp1: 8, grav: -10, l0: 0.3, l1: 0.7 });
      } else if (it.kind === 'npc') {
        const n = NPCS[it.who]""")

# lighting: relic lantern + puzzle lights
rep("const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: (B.dark > 0.5 ? 70 : 90) + flick, i: 1 }];",
    "const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: ((B.dark > 0.5 ? 70 : 90) + flick) * (hasRelic(2) ? 1.45 : 1), i: 1 }];")
rep("    for (const p of Q.projs) addL(p.x, p.y, 24, 0.9);",
    "    for (const p of Q.projs) addL(p.x, p.y, 24, 0.9);\n    for (const pz of Q.pz) if ((pz.type === 'torch' && pz.lit) || (pz.type === 'rune' && pz.lit)) addL(pz.x, pz.y - 10, 38, 0.9);\n    for (const f of Q.fires) addL(f.x, f.y - 8, 34, 0.9);\n    for (const p of Q.fps) if (p.t !== 'dagger') addL(p.x, p.y, 20, 0.8);")

# HUD weapons
rep("    // boss bar\n    if (Q.boss && Q.arenaSealed", u"""    // throwables
    { const names = ['dagger', 'bomb', 'flask'];
      names.forEach((w, i) => {
        const bx = 8 + i * 27, by = VH - 25, sel = P.sel === i, n = P.ammo[w];
        g.fillStyle = sel ? 'rgba(255,211,78,.28)' : 'rgba(10,6,22,.55)'; g.fillRect(bx, by, 25, 20);
        g.fillStyle = sel ? '#ffd34e' : '#434d6e'; g.fillRect(bx, by, 25, 1); g.fillRect(bx, by + 19, 25, 1); g.fillRect(bx, by, 1, 20); g.fillRect(bx + 24, by, 1, 20);
        const ic = icon(w); g.globalAlpha = n > 0 ? 1 : 0.3; g.drawImage(ic.c, bx + 4, by + 3 + (14 - ic.h) / 2 | 0); g.globalAlpha = 1;
        txt('x' + n, bx + 24, by + 16, { al: 'right', size: 6, col: n > 0 ? '#fff' : '#777' });
      });
      if (P.keys > 0) { const kc = icon('key'); g.drawImage(kc.c, 94, VH - 21); txt('x' + P.keys, 114, VH - 14, { size: 6 }); }
    }
    // boss bar
    if (Q.boss && Q.arenaSealed""")

# overlays: tablet + complete relic
rep("    } else if (st === 'dead') {\n      const a = Math.min(1, Q.stateT / 0.8);\n      g.globalAlpha = 0.6 * a;",
    u"""    } else if (st === 'tablet' && Q.tablet) {
      const gd = Q.tablet, cs = gd.seqColors || [];
      g.fillStyle = 'rgba(8,6,20,.95)'; g.fillRect(70, 56, VW - 140, 100);
      g.fillStyle = '#6ee7f2'; g.fillRect(70, 56, VW - 140, 1); g.fillRect(70, 155, VW - 140, 1); g.fillRect(70, 56, 1, 100); g.fillRect(VW - 71, 56, 1, 100);
      txt(T('tabletT'), VW / 2, 68, { al: 'center', size: 8, col: '#6ee7f2', bold: true });
      txt(T('tabletH'), VW / 2, 84, { al: 'center', size: 6, col: '#cfd6e6' });
      cs.forEach((c, i) => { const bx = VW / 2 - cs.length * 20 / 2 + i * 20 + 2, by = 98; g.fillStyle = '#1b1626'; g.fillRect(bx - 2, by - 2, 18, 18); g.fillStyle = TORCH_COLORS[c]; g.fillRect(bx, by, 14, 14); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(bx, by, 14, 3); txt(String(i + 1), bx + 7, by + 28, { al: 'center', size: 6, col: '#8892aa' }); });
      txt('OK', VW / 2, 145, { al: 'center', size: 6, col: '#8892aa' });
    } else if (st === 'dead') {
      const a = Math.min(1, Q.stateT / 0.8);
      g.globalAlpha = 0.6 * a;""")
rep("      txt(T('coins') + ':  ' + Q.coinsRun, VW / 2, 90, { al: 'center', size: 9, alpha: a });\n      txt(T('shards') + ':  ' + got + ' / 3', VW / 2, 106, { al: 'center', size: 9, alpha: a });\n      txt(T('time') + ':  ' + mm + ':' + (ss < 10 ? '0' : '') + ss, VW / 2, 122, { al: 'center', size: 9, alpha: a });\n      txt(T('hearts') + ': ' + maxHP() + '    ' + T('dmg') + ': ' + swordDmg(), VW / 2, 142, { al: 'center', size: 7, col: '#a4e86b', alpha: a });",
    u"""      txt(T('coins') + ':  ' + Q.coinsRun + '     ' + T('shards') + ':  ' + got + ' / 3', VW / 2, 78, { al: 'center', size: 8, alpha: a });
      txt(T('time') + ':  ' + mm + ':' + (ss < 10 ? '0' : '') + ss + '     ' + T('hearts') + ': ' + maxHP() + '   ' + T('dmg') + ': ' + swordDmg(), VW / 2, 92, { al: 'center', size: 7, col: '#a4e86b', alpha: a });
      { const R = RELICS[Q.li], ic = icon('r' + Q.li), pulse = Math.sin(Q.stateT * 4) * 2;
        g.globalAlpha = a; g.fillStyle = 'rgba(255,211,78,.14)'; g.fillRect(60, 104, VW - 120, 52); g.fillStyle = '#ffd34e'; g.fillRect(60, 104, VW - 120, 1); g.fillRect(60, 155, VW - 120, 1);
        disc(g, 94, 130, Math.round(18 + pulse), 'rgba(255,211,78,.25)'); drawSpr(g, ic, 94, 142, false, false, 2, 2); g.globalAlpha = 1;
        txt(Q.relicNew ? T('relicNew') : T('relicHave'), 122, 114, { size: 7, col: Q.relicNew ? '#ffd34e' : '#8892aa', alpha: a });
        txt(LN(R.name), 122, 128, { size: 9, bold: true, alpha: a });
        wrapText(LN(R.desc), 44).forEach((l, i) => txt(l, 122, 142 + i * 9, { size: 6.5, col: '#a4e86b', alpha: a })); }""")
rep("      if (Q.stateT > 1) txt(T('cont2'), VW / 2, 176,", "      if (Q.stateT > 1) txt(T('cont2'), VW / 2, 182,")

# pause screen: relics
rep("      txt('M: ' + (Snd.muted ? 'Sound OFF' : 'Sound ON') + '    F11: ' + T('full'), VW / 2, 190, { al: 'center', size: 6, col: '#8892aa' });",
    "      txt('M: ' + (Snd.muted ? 'Sound OFF' : 'Sound ON') + '    F11: ' + T('full'), VW / 2, 200, { al: 'center', size: 6, col: '#8892aa' });\n      txt(T('relics'), VW / 2, 166, { al: 'center', size: 6, col: '#8892aa' });\n      for (let i = 0; i < 7; i++) { const ic = icon('r' + i); g.globalAlpha = save.relics[i] ? 1 : 0.2; g.drawImage(ic.c, VW / 2 - 7 * 13 + i * 26 + 4, 172); }\n      g.globalAlpha = 1;")

# map screen
rep("    txt(T('maphelp'), VW / 2, 30, { al: 'center', size: 6, col: '#8892aa' });",
    u"""    txt(T('maphelp'), VW / 2, 30, { al: 'center', size: 6, col: '#8892aa' });
    txt(T('cleared') + ' ' + save.cleared.length + '/' + BIOMES.length + '    ' + T('relics') + ' ' + save.relics.filter(Boolean).length + '/7    (' + BIOMES.length + ' ' + T('maps') + ')', VW / 2, 42, { al: 'center', size: 6, col: '#cfd6e6' });
    { const stars = '★'.repeat(mapSel + 1) + '☆'.repeat(6 - mapSel), pz = (PUZZLES[mapSel] || []).length, mins = Math.round(B.len / 70);
      txt(T('difficulty') + ': ' + stars, VW - 8, 188, { al: 'right', size: 6, col: '#ffd34e' });
      txt(T('puzzles') + ': ' + pz + '   ' + T('length') + ': ~' + mins + ' ' + T('min'), VW - 8, 201, { al: 'right', size: 6, col: '#cfd6e6' });
      const ic = icon('r' + mapSel); g.globalAlpha = save.relics[mapSel] ? 1 : 0.35; g.drawImage(ic.c, 8, 184); g.globalAlpha = 1; }""")

# debug hook
rep("hurtBoss, completeLevel, updatePlay, act, clearPressed, solid, ch, maxHP };",
    "hurtBoss, completeLevel, updatePlay, act, clearPressed, solid, ch, maxHP, save, openGate, explode, solveAll() { for (const gd of Q.gates) { if (!gd.open) openGate(gd, true); if (gd.need === 'timed') gd.timer = 1e9; } for (const w of Q.L.xwalls) for (const t of w.tiles) { Q.L.grid[t[1]][t[0]] = ' '; Q.brokenX.add(t[0] + ',' + t[1]); } } };")

io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
