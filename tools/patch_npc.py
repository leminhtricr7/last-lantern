import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, cnt)


# --- strings
rep("    hearts: { en: 'Max hearts', vi: 'Tim tối đa' },", u"""    talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },
    shop1: { en: 'Potion - restore all hearts (15 coins)', vi: 'Thuốc - hồi đầy tim (15 xu)' },
    shop2: { en: 'Charm - blocks the next hit (25 coins)', vi: 'Bùa - đỡ 1 đòn tiếp theo (25 xu)' },
    shop3: { en: 'Leave', vi: 'Tạm biệt' }, wallet: { en: 'Coins', vi: 'Xu' }, nomoney: { en: 'Not enough coins!', vi: 'Không đủ xu!' },
    healed: { en: 'You feel warm again. Hearts restored.', vi: 'Bạn thấy ấm lại. Tim đã hồi đầy.' }, bought: { en: 'Pleasure doing business!', vi: 'Giao dịch vui vẻ!' },
    hearts: { en: 'Max hearts', vi: 'Tim tối đa' },""")

# --- NPC data
rep("  // ---------- text queue (drawn at native resolution after blit) ----------", u"""  const NPCS = {
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

  // ---------- text queue (drawn at native resolution after blit) ----------""")

# --- input
rep("    act.muteP = pressed.KeyM;", "    act.talkP = pressed.KeyE || pressed.Enter || gpP('lb');\n    act.muteP = pressed.KeyM;")
rep("act.atkP = act.dashP = act.pauseP = act.okP", "act.atkP = act.dashP = act.pauseP = act.talkP = act.okP")

# --- touch talk button
rep("    if (scene !== 'play' || (Q && Q.state === 'pause')) {",
    "    if (scene === 'play' && Q && Q.nearNpc && Q.state === 'play') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '...' });\n    if (scene !== 'play' || (Q && (Q.state === 'pause' || Q.state === 'shop'))) {")

# --- shield
rep("    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;",
    "    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); return false; }\n    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;")

# --- Q init
rep("ents: [], items: [], projs: [], parts: [], boss: null,", "ents: [], items: [], projs: [], traps: [], parts: [], boss: null, nearNpc: null, talk: null,")
rep("    Q.ents = []; Q.items = []; Q.projs = []; Q.boss = null;", "    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.boss = null; Q.nearNpc = null;")
rep("      else if (s.type === 'boss') Q.boss = makeBoss(s);",
    "      else if (s.type === 'boss') Q.boss = makeBoss(s);\n"
    "      else if (s.type === 'npc') Q.items.push({ kind: 'npc', who: s.who, x: s.x, y: s.y, id: s.id, ph: Math.random() * 6 });\n"
    "      else if (['turret', 'spiketrap', 'jets', 'saw', 'rockfall'].indexOf(s.type) >= 0) Q.traps.push({ type: s.type, x: s.x, y: s.y, t: 0, off: s.off || 0, w: s.w || 2, dir: s.dir || -1, len: s.len || 6, x0: s.x - 8, cd: rr(0.5, 2), st: 'idle', ph: 0, id: s.id });")
io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
