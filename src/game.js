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
  const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  let rotated = false; // phone held upright: we rotate the whole game 90deg so it always plays landscape
  function resize() {
    const w = innerWidth, h = innerHeight;
    rotated = IS_TOUCH && h > w;
    if (rotated) {
      cv.width = h; cv.height = w;
      cv.style.cssText = 'position:fixed;left:0;top:0;transform-origin:0 0;transform:translateX(' + w + 'px) rotate(90deg);width:' + h + 'px;height:' + w + 'px;';
    } else { cv.width = w; cv.height = h; cv.style.cssText = ''; }
    scale = Math.min(cv.width / VW, cv.height / VH);
    if (scale >= 1) scale = Math.floor(scale);
    offX = Math.floor((cv.width - VW * scale) / 2); offY = Math.floor((cv.height - VH * scale) / 2);
  }
  addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 150)); resize();

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rr = (a, b) => a + Math.random() * (b - a);
  const ov = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const disc = (c, cx, cy, rad, col) => { c.fillStyle = col; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(rad * rad - j * j)); c.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };

  // ---------- save / i18n ----------
  const SAVEKEY = 'last_lantern_save_v1';
  let save = { cleared: [], shards: {}, coins: 0, lang: 'vi', vol: 0.6, relics: [0, 0, 0, 0, 0, 0, 0], ammo: { dagger: 0, bomb: 0, flask: 0 }, leek: false };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVEKEY) || '{}')); } catch (e) { }
  const writeSave = () => { try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) { } };
  if (!Array.isArray(save.relics) || save.relics.length < 7) save.relics = [0, 0, 0, 0, 0, 0, 0];
  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };
  save.leek = !!save.leek;
  const totalShards = () => Object.keys(save.shards).reduce((a, k) => a + save.shards[k].filter(Boolean).length, 0);
  const hasRelic = i => !!save.relics[i];
  const maxHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0);
  const swordDmg = () => 1 + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0) + (save.leek ? 1 : 0);
  const UNLOCK_ALL = true; // set to false for release: then each win unlocks the next map
  const maxPlayable = () => UNLOCK_ALL ? 6 : save.cleared.length ? Math.min(6, Math.max.apply(null, save.cleared) + 1) : 0;
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
    ctl: { en: 'Move A/D  Jump Space  Attack J / Click  Throw L / Right-click  Switch Q / Wheel  Dash K  Use E', vi: 'Di chuyển A/D  Nhảy Space  Đánh J / Nhấp chuột  Ném L / Chuột phải  Đổi đồ Q / Lăn chuột  Lướt K  Dùng E' },
    thanks: { en: 'Thank you for playing!', vi: 'Cảm ơn bạn đã chơi!' },
    talk: { en: 'E / Enter: Talk', vi: 'E / Enter: Nói chuyện' },
    free: { en: 'E: Free her', vi: 'E: Giải cứu' }, guards: { en: 'Defeat the guards first!', vi: 'Hạ hết lính canh trước đã!' },
    leekT: { en: 'LEEK BLADE OBTAINED!', vi: 'NHẬN ĐƯỢC KIẾM HÀNH LÁ!' }, leekD: { en: 'A glowing leek that sings with the light. +1 damage and longer reach.', vi: 'Cây hành phát sáng hát cùng ánh sáng. +1 sát thương và tầm đánh xa hơn.' },
    wave: { en: 'Wave', vi: 'Đợt' }, trialWin: { en: 'TRIAL SURVIVED!', vi: 'VƯỢT QUA THỬ THÁCH!' }, gift: { en: 'Quan hands you some supplies!', vi: 'Quan đưa bạn ít đồ tiếp tế!' },
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
    shopb: { en: 'Bombs x3 (14 coins)', vi: 'Bom x3 (14 xu)' }, shopd: { en: 'Daggers x8 (10 coins)', vi: 'Dao găm x8 (10 xu)' }, shopf: { en: 'Fire flasks x3 (14 coins)', vi: 'Bình lửa x3 (14 xu)' },
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

  Object.assign(NPCS, {
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
  const LYRA_NAME = { en: 'Lyra Blue', vi: 'Lyra Blue' }; // change here if you rename the character
  Object.assign(NPCS, {
    lyra: { spr: 'npc_lyra', name: LYRA_NAME },
    shorty: { spr: 'npc_shorty', name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' } },
    quan: { spr: 'npc_quan', name: { en: 'QuanSadBoy', vi: 'QuanSadBoy' }, gift: { dagger: 5, bomb: 2, flask: 2 } },
    quoc: { spr: 'npc_shorty', name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' } }
  });
  NPCS.lyra.generic = [{ en: 'Your leek is shining so prettily! La la laaa~ ♪', vi: 'Cây hành của bạn sáng đẹp quá! La la laaa~ ♪' }];
  NPCS.shorty.generic = [{ en: 'Hmph.', vi: 'Hừm.' }];
  NPCS.quan.generic = [{ en: 'Sigh... nobody reads anymore.', vi: 'Haizz... giờ chẳng ai đọc sách nữa.' }];
  const DLG3 = {
    1: { quan: [
      { en: 'Oh! Sorry, I was reading while walking. I am Quan... some call me QuanSadBoy. I am a wizard. Mostly I read.', vi: 'Ồ! Xin lỗi, mình vừa đi vừa đọc sách. Mình là Quan... người ta gọi mình là QuanSadBoy. Mình là phù thủy. Chủ yếu là đọc sách.' },
      { en: 'I found extra supplies between chapter three and four. Please take them - you look like you need them.', vi: 'Mình tìm thấy ít đồ dư giữa chương ba và chương bốn. Bạn cầm lấy đi - trông bạn cần đấy.' },
      { en: 'Forest puzzles? Torches first, then the door. It is all in chapter seven. Probably.', vi: 'Câu đố trong rừng à? Đuốc trước, rồi tới cửa. Tất cả nằm ở chương bảy. Chắc vậy.' }
    ] },
    2: { quan: [
      { en: 'You again! This cave is chapter twelve: "Things That Fall On You". Watch the red markers!', vi: 'Lại là bạn! Hang này là chương mười hai: "Những Thứ Rơi Trúng Đầu Bạn". Để ý dấu đỏ nhé!' },
      { en: 'I made notes on the crystal runes. The tablet shows the order. I think. I am sad, not wrong.', vi: 'Mình có ghi chú về ký hiệu pha lê. Bia đá cho biết thứ tự. Mình nghĩ vậy. Mình buồn chứ không sai.' },
      { en: 'More supplies. I over-packed. Sad people over-pack. It is a known fact.', vi: 'Thêm đồ tiếp tế nè. Mình mang dư. Người buồn hay mang dư. Ai cũng biết.' }
    ] },
    3: { lyra: [
      { en: 'Your leek is shining so beautifully out here! La la laaa~ ♪', vi: 'Cây hành của bạn sáng đẹp quá ở ngoài này! La la laaa~ ♪' },
      { en: 'Sing along with the light, Ember! I will keep you warm with my song.', vi: 'Hát cùng ánh sáng nhé, Ember! Tiếng hát của mình sẽ sưởi ấm bạn.' }
    ] },
    5: { lyra: [
      { en: 'Even the volcano cannot drown out a good melody! Keep shining, Ember! ♪', vi: 'Ngay cả núi lửa cũng không át được một giai điệu hay! Cứ tỏa sáng nhé, Ember! ♪' }
    ] },
    6: { quan: [
      { en: 'I read the last chapter early. I will not spoil it. But... bring snacks. Good luck, Ember.', vi: 'Mình đọc trước chương cuối rồi. Mình sẽ không tiết lộ. Nhưng... nhớ mang đồ ăn vặt. Chúc may mắn, Ember.' }
    ], lyra: [
      { en: 'I will sing for you the whole way! La la laaa~ Go light up the Sun! ♪', vi: 'Mình sẽ hát cho bạn suốt chặng đường! La la laaa~ Đi thắp lại Mặt Trời nào! ♪' }
    ] }
  };
  for (const k in DLG3) DLG[k] = Object.assign(DLG[k] || {}, DLG3[k]);
  const RESCUE = [
    { en: 'You... you came for me? Thank you! I was locked in that cage when the Sun shattered.', vi: 'Bạn... bạn đến cứu mình sao? Cảm ơn bạn! Mình bị nhốt trong chiếc lồng này từ lúc Mặt Trời vỡ.' },
    { en: 'Please take this - my leek! It sings when it shines. It will be your sword now.', vi: 'Bạn hãy nhận lấy - cây hành của mình! Nó hát mỗi khi phát sáng. Từ giờ nó là thanh kiếm của bạn.' },
    { en: 'Sing with the light, Ember! La la laaa~ ♪', vi: 'Hãy hát cùng ánh sáng nhé, Ember! La la laaa~ ♪' }
  ];
  const TRIAL = {
    0: { intro: [
      { en: 'Hehehe... so THIS is the famous lantern-boy? Mr Shorty Phong welcomes you!', vi: 'Hê hê hê... vậy ĐÂY là cậu bé cầm đèn nổi tiếng? Mr Shorty Phong chào đón cậu!' },
      { en: 'My master Quoc wants you stopped. So let us play with my little trial.', vi: 'Chủ nhân Quoc muốn cậu dừng lại. Vậy hãy chơi thử thách nhỏ của ta nào.' },
      { en: 'No exit until every monster is dead AND the torches burn in the right order. Tee-hee!', vi: 'Không có lối ra cho tới khi quái chết hết VÀ đuốc cháy đúng thứ tự. Hí hí!' }
    ], outro: [
      { en: 'WHAT?! You beat my pets?! Impossible!', vi: 'CÁI GÌ?! Cậu đánh bại thú cưng của ta sao?! Không thể nào!' },
      { en: 'Hmph. Short men make LONG grudges, lantern-boy!', vi: 'Hừm. Người thấp thì thù DAI, cậu bé cầm đèn!' }
    ] },
    2: { intro: [
      { en: 'Back for more? Down here in the dark... I do love the caves, little lantern!', vi: 'Quay lại chịu đòn à? Dưới bóng tối này... ta rất thích hang động, đèn con!' },
      { en: 'Three waves this time AND a puzzle. Light the torches in order, or rot in here!', vi: 'Lần này ba đợt VÀ một câu đố. Thắp đuốc đúng thứ tự, nếu không thì thối rữa ở đây!' }
    ], outro: [
      { en: 'HOW?! My calculations were PERFECT!', vi: 'SAO CÓ THỂ?! Tính toán của ta HOÀN HẢO mà!' }
    ] },
    5: { intro: [
      { en: 'This is the hot seat, kid. Even I sweat here.', vi: 'Đây là ghế nóng đó nhóc. Ngay cả ta cũng toát mồ hôi ở đây.' },
      { en: 'Three waves of my FINEST. Do try to enjoy them.', vi: 'Ba đợt tinh nhuệ nhất của ta. Cố mà thưởng thức nhé.' }
    ], outro: [
      { en: 'N-no... Master Quoc will have my hat for this!', vi: 'K-không... Chủ nhân Quoc sẽ lấy chiếc mũ của ta mất!' }
    ] },
    6: { intro: [
      { en: 'Welcome to the FINAL trial. The Eclipse awaits... but first, ME.', vi: 'Chào mừng tới thử thách CUỐI CÙNG. Nhật Thực đang chờ... nhưng trước tiên, là TA.' },
      { en: 'Four waves. FOUR. I stayed up all night designing them.', vi: 'Bốn đợt. BỐN. Ta thức trắng đêm để thiết kế chúng.' }
    ], outro: [
      { en: 'Fine. FINE! Go! Be eaten by the Eclipse!', vi: 'Được thôi. ĐƯỢC THÔI! Đi đi! Để Nhật Thực nuốt chửng cậu!' }
    ] }
  };
  const SPK = { quoc: { name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' }, col: '#ff5a4a' }, shorty: { name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, col: '#ffd34e' }, imp: { name: { en: 'Imp', vi: 'Tiểu quỷ' }, col: '#c07bff' } };
  const CUT = [
    [ // after Verdant Meadow
      { w: 'quoc', shout: 1, en: 'WHAT?! A WALKING CANDLE BEAT MY KING SLIME?!', vi: 'GÌ CƠ?! MỘT CÂY NẾN BIẾT ĐI ĐÁNH BẠI VUA SLIME CỦA TA SAO?!' },
      { w: 'shorty', en: 'M-my lord Quoc... it is only one tiny flame...', vi: 'T-thưa ngài Quoc... chỉ là một ngọn lửa nhỏ xíu thôi ạ...' },
      { w: 'quoc', shout: 1, en: 'TINY FLAMES START BIG FIRES, YOU FOOL! GO! PUT IT OUT!', vi: 'LỬA NHỎ CŨNG GÂY RA ĐÁM CHÁY LỚN, ĐỒ NGỐC! ĐI! DẬP NÓ ĐI!' }
    ],
    [ // after Whispering Forest
      { w: 'quoc', shout: 1, en: 'THE SPIDER QUEEN... DEAD?! I RAISED HER FOR A THOUSAND YEARS!', vi: 'NỮ HOÀNG NHỆN... CHẾT RỒI SAO?! TA NUÔI NÓ HÀNG NGÀN NĂM!' },
      { w: 'imp', en: 'Master... he fights with a glowing... LEEK.', vi: 'Thưa chủ nhân... hắn chiến đấu bằng một... CÂY HÀNH phát sáng.' },
      { w: 'quoc', shout: 1, en: 'A... A LEEK?! HE BEAT HER WITH A VEGETABLE?!', vi: 'MỘT... MỘT CÂY HÀNH?! HẮN ĐÁNH BẠI NÓ BẰNG RAU SAO?!' },
      { w: 'shorty', en: 'A very SHINY vegetable, my lord. Singing, even.', vi: 'Một cây rau rất SÁNG, thưa ngài. Còn biết hát nữa ạ.' },
      { w: 'quoc', shout: 1, en: 'SILENCE! I WILL NOT BE HUMILIATED BY SALAD!', vi: 'IM LẶNG! TA SẼ KHÔNG BỊ NHỤC NHÃ BỞI MỘT ĐĨA SALAD!' }
    ],
    [ // after Crystal Caverns
      { w: 'quoc', shout: 1, en: 'THE GOLEM SHATTERED LIKE CHEAP GLASS! WHO IS HELPING HIM?!', vi: 'NGƯỜI KHỔNG LỒ VỠ NHƯ THỦY TINH RẺ TIỀN! AI ĐANG GIÚP HẮN?!' },
      { w: 'shorty', en: 'A sad bookworm wizard, my lord. They call him QuanSadBoy.', vi: 'Một phù thủy mọt sách buồn bã, thưa ngài. Người ta gọi hắn là QuanSadBoy.' },
      { w: 'quoc', shout: 1, en: 'A BOOKWORM?! I AM BEING DEFEATED BY HOMEWORK?!', vi: 'MỘT CON MỌT SÁCH?! TA ĐANG BỊ ĐÁNH BẠI BỞI BÀI TẬP VỀ NHÀ SAO?!' },
      { w: 'imp', en: 'He... also gave the hero snacks.', vi: 'Hắn... còn đưa cho anh hùng đồ ăn vặt nữa.' },
      { w: 'quoc', shout: 1, en: 'SNACKS?! UNFORGIVABLE!!', vi: 'ĐỒ ĂN VẶT?! KHÔNG THỂ THA THỨ!!' }
    ],
    [ // after Sunscorch Desert
      { w: 'quoc', shout: 1, en: 'MY PHARAOH! MY SANDS! MY PYRAMID COLLECTION!', vi: 'PHARAOH CỦA TA! CÁT CỦA TA! BỘ SƯU TẬP KIM TỰ THÁP CỦA TA!' },
      { w: 'shorty', en: 'Master, I tried my little trial again. He... passed.', vi: 'Thưa chủ nhân, thần lại thử thách nhỏ của thần. Hắn... vượt qua rồi.' },
      { w: 'quoc', shout: 1, en: 'AGAIN?! YOU CANNOT EVEN BEAT A CHILD WITH A LANTERN?!', vi: 'LẠI NỮA SAO?! NGƯƠI KHÔNG THỂ THẮNG NỔI MỘT ĐỨA TRẺ CẦM ĐÈN?!' },
      { w: 'shorty', en: '...I am very short, my lord. It is hard to see him coming.', vi: '...Thần rất thấp, thưa ngài. Khó mà thấy hắn đang tới.' },
      { w: 'quoc', shout: 1, en: 'THEN STAND ON A BOX AND TRY HARDER!!', vi: 'THÌ ĐỨNG LÊN CÁI HỘP VÀ CỐ GẮNG HƠN!!' }
    ],
    [ // after Frostbite Peaks
      { w: 'quoc', shout: 1, en: 'THE FROST KING MELTED?! HE WAS FROZEN BY DEFINITION!', vi: 'VUA BĂNG TAN CHẢY SAO?! THEO ĐỊNH NGHĨA HẮN LÀ BĂNG CƠ MÀ!' },
      { w: 'imp', en: 'H-he used fire flasks, master...', vi: 'H-hắn dùng bình lửa, thưa chủ nhân...' },
      { w: 'quoc', shout: 1, en: 'THEN FREEZE THE FLASKS, YOU FOOL!!', vi: 'THÌ ĐÓNG BĂNG CÁI BÌNH ĐÓ ĐI, ĐỒ NGỐC!!' },
      { w: 'shorty', en: 'Only the volcano and the Citadel remain, my lord...', vi: 'Chỉ còn núi lửa và Thành Trì thôi, thưa ngài...' },
      { w: 'quoc', shout: 1, en: 'ENOUGH! WAKE THE TITAN! AND IF HE FAILS... WAKE THE ECLIPSE!', vi: 'ĐỦ RỒI! ĐÁNH THỨC TITAN! VÀ NẾU HẮN THẤT BẠI... ĐÁNH THỨC NHẬT THỰC!' }
    ],
    [ // after Ember Volcano
      { w: 'quoc', shout: 1, en: 'THE TITAN IS ASH!! ASH!!! HE WAS MY FAVORITE VOLCANO!', vi: 'TITAN THÀNH TRO RỒI!! TRO!!! HẮN LÀ NGỌN NÚI LỬA YÊU THÍCH CỦA TA!' },
      { w: 'shorty', en: 'Master... six fragments of the Sun burn together again.', vi: 'Thưa chủ nhân... sáu mảnh Mặt Trời lại cháy cùng nhau.' },
      { w: 'quoc', shout: 1, en: 'THEN THE ECLIPSE WILL END THIS! AWAKEN IT!!', vi: 'VẬY NHẬT THỰC SẼ KẾT THÚC TẤT CẢ! ĐÁNH THỨC NÓ!!' },
      { w: 'quoc', shout: 1, en: 'LET THE WORLD GO DARK FOREVER!!!', vi: 'ĐỂ THẾ GIỚI TỐI ĐEN MÃI MÃI!!!' }
    ]
  ];
  NPCS.dragon = { spr: 'dragon_head', name: { en: 'Ignarok the Ashwing', vi: 'Ignarok Cánh Tro' } };
  NPCS.dragon.generic = [{ en: 'ROAAAR!', vi: 'GÀOOO!' }];
  const DRG_DLG = {
    young_intro: [
      { en: 'So... the little lantern-bearer crawls through my meadow. I can smell the last flame of Aurelia on you!', vi: 'Thì ra... cậu bé cầm đèn bé nhỏ đang bò qua đồng cỏ của ta. Ta ngửi thấy ngọn lửa cuối cùng của Aurelia trên người ngươi!' },
      { en: 'I am Ignarok the Ashwing. Quoc promised me a throne of ash if I snuff you out, little spark.', vi: 'Ta là Ignarok Cánh Tro. Quoc hứa ban cho ta ngai vàng bằng tro tàn nếu ta dập tắt ngươi, tia lửa nhỏ.' },
      { en: 'Come, then! Burn bright... for as long as you can!', vi: 'Lại đây nào! Hãy cháy thật sáng... chừng nào ngươi còn cháy được!' }
    ],
    young_flee: [
      { en: 'ARGH! A spark... scorched MY scales?!', vi: 'ARGH! Một tia lửa... đã đốt cháy vảy của TA sao?!' },
      { en: 'This is not over, lantern-bearer! We will meet again - when you taste the volcano!', vi: 'Chưa xong đâu, kẻ cầm đèn! Chúng ta sẽ gặp lại - khi ngươi nếm mùi núi lửa!' }
    ],
    map6_intro: [
      { en: 'Did you miss me, little spark? The volcano is MY forge now.', vi: 'Nhớ ta không, tia lửa nhỏ? Núi lửa giờ là lò rèn của ta.' },
      { en: 'Quoc gave me his strongest fire. This time, I will not run.', vi: 'Quoc đã ban cho ta ngọn lửa mạnh nhất của hắn. Lần này ta sẽ không bỏ chạy.' }
    ],
    morph: [
      [{ en: 'You CUT me?! Then meet my brothers... we are THREE heads with ONE hunger!', vi: 'Ngươi dám CHÉM ta?! Vậy hãy gặp các anh em của ta... chúng ta có BA cái đầu và chung MỘT cơn đói!' }],
      [{ en: 'Fire dies... but shadow remains. Come into the dark with me, little light.', vi: 'Lửa sẽ tàn... nhưng bóng tối còn mãi. Hãy vào bóng tối cùng ta, ánh sáng nhỏ.' },
       { en: 'I am not Ignarok anymore. I am the night itself!', vi: 'Ta không còn là Ignarok nữa. Ta là chính màn đêm!' }]
    ],
    death: [{ en: 'The... dark... was never... enough... Quoc... forgive...', vi: 'Bóng tối... chưa bao giờ... đủ... Quoc... tha thứ cho...' }]
  };
  const DRG = {
    young: { stages: [{ form: 0, hp: 150, armor: 0, w: 58, h: 28, sp: 70, skills: ['fireballs', 'dive', 'breath', 'gust', 'perch'] }] },
    map6: { stages: [
      { form: 1, hp: 280, armor: 0.15, w: 76, h: 36, sp: 80, skills: ['fireballs', 'breath', 'dive', 'gust', 'perch', 'roar'] },
      { form: 2, hp: 340, armor: 0.25, w: 96, h: 44, sp: 90, skills: ['fireballs', 'tripleBreath', 'dive', 'gust', 'perch', 'tailsweep', 'summon'] },
      { form: 3, hp: 400, armor: 0.3, w: 84, h: 38, sp: 100, skills: ['shadowBreath', 'dive', 'vanish', 'darkness', 'tripleBreath', 'tailsweep', 'roar', 'summon'] }
    ] }
  };
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
    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');
    act.throwP = any(pressed, ['KeyL']) || gpP('y'); act.swapP = any(pressed, ['KeyQ']) || gpP('lb');
    act.dashP = any(pressed, ['KeyK', 'KeyC', 'ShiftLeft', 'ShiftRight']) || gpP('b') || gpP('rt');
    act.pauseP = pressed.Escape || pressed.KeyP || gpP('start');
    act.okP = any(pressed, ['Enter', 'Space', 'KeyZ', 'KeyJ']) || gpP('a');
    act.backP = pressed.Escape || gpP('b');
    act.leftP = any(pressed, ['ArrowLeft', 'KeyA']) || gpP('l'); act.rightP = any(pressed, ['ArrowRight', 'KeyD']) || gpP('r');
    act.upP = any(pressed, ['ArrowUp', 'KeyW']) || gpP('u'); act.downP = any(pressed, ['ArrowDown', 'KeyS']) || gpP('d');
    act.talkP = pressed.KeyE || pressed.Enter || gpP('rb');
    act.muteP = pressed.KeyM; act.fullP = pressed.KeyF || pressed.F11;
    gpPrev = gb;
  }
  function clearPressed() { for (const k in pressed) pressed[k] = false; act.jumpP = act.atkP = act.throwP = act.swapP = act.dashP = act.pauseP = act.talkP = act.okP = act.backP = act.leftP = act.rightP = act.upP = act.downP = false; }
  function toggleFull() {
    try { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else document.exitFullscreen(); } catch (e) { }
  }

  // ---------- touch controls (phones / tablets) ----------
  const touch = { on: IS_TOUCH, ptr: new Map(), down: {} };
  function touchButtons() {
    const w = cv.width, h = cv.height, s = Math.min(w, h) / 5.2, r = s * 0.5;
    const b = [
      { k: 'ArrowLeft', x: s * 0.8, y: h - s * 0.9, r, l: '◀' }, { k: 'ArrowRight', x: s * 2.0, y: h - s * 0.9, r, l: '▶' },
      { k: 'Space', x: w - s * 0.8, y: h - s * 0.9, r: r * 1.15, l: '▲' }, { k: 'KeyJ', x: w - s * 2.1, y: h - s * 0.75, r, l: 'X' },
      { k: 'KeyK', x: w - s * 1.5, y: h - s * 1.9, r: r * 0.85, l: '»' }, { k: 'Escape', x: w - s * 0.5, y: s * 0.5, r: r * 0.7, l: 'II' },
      { k: 'KeyL', x: w - s * 2.9, y: h - s * 1.5, r: r * 0.8, l: '●' }, { k: 'KeyQ', x: w - s * 3.3, y: h - s * 0.5, r: r * 0.6, l: '⇄' }
    ];
    if (scene === 'play' && Q && (Q.nearNpc || Q.nearPz) && Q.state === 'play') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '...' });
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
  function lockLandscape() {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (x) { }
  }
  function touchEvt(e) {
    e.preventDefault(); Snd.init();
    if (e.pointerType === 'mouse') { mouseEvt(e); return; }
    const rc = cv.getBoundingClientRect();
    if (e.type === 'pointerup' || e.type === 'pointercancel') touch.ptr.delete(e.pointerId);
    else if (rotated) touch.ptr.set(e.pointerId, { x: e.clientY, y: innerWidth - e.clientX });
    else touch.ptr.set(e.pointerId, { x: (e.clientX - rc.left) * cv.width / rc.width, y: (e.clientY - rc.top) * cv.height / rc.height });
    if (e.type === 'pointerdown' && touch.on && !document.fullscreenElement) { try { document.documentElement.requestFullscreen().then(lockLandscape).catch(() => { }); } catch (x) { } lockLandscape(); }
    touchUpdate();
  }

  // ---------- mouse (laptop): click menus, click to attack, right-click throw, wheel switch ----------
  const mouse = { gx: -99, gy: -99 };
  function gameXY(e) {
    const rc = cv.getBoundingClientRect();
    const sx = (e.clientX - rc.left) * cv.width / rc.width, sy = (e.clientY - rc.top) * cv.height / rc.height;
    return [(sx - offX) / scale, (sy - offY) / scale];
  }
  const near = (gx, gy, cx, cy, hw, hh) => Math.abs(gx - cx) <= hw && Math.abs(gy - cy) <= hh;
  function menuHit(gx, gy, n, cx, y0, dy, hw) { for (let i = 0; i < n; i++) if (near(gx, gy, cx, y0 + i * dy, hw, dy / 2)) return i; return -1; }
  function mouseEvt(e) {
    const xy = gameXY(e), gx = xy[0], gy = xy[1]; mouse.gx = gx; mouse.gy = gy;
    const inPlay = scene === 'play' && Q;
    if (e.type === 'pointermove') {
      if (scene === 'title') { const i = menuHit(gx, gy, titleItems().length, VW / 2 + 60, 92, 14, 85); if (i >= 0 && i !== titleSel) { titleSel = i; Snd.play('select'); } }
      else if (inPlay && Q.state === 'pause') { const i = menuHit(gx, gy, 4, VW / 2, 88, 18, 80); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }
      else if (inPlay && Q.state === 'shop') { const n = (SHOPS[Q.shopWho] || []).length + 1, i = menuHit(gx, gy, n, VW / 2, 96, 14, 110); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }
      return;
    }
    if (e.type !== 'pointerdown') return;
    if (e.button === 2) { // right click = throw
      if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyL = true; } else if (inPlay && (Q.state === 'talk' || Q.state === 'tablet')) pressed.Escape = true;
      return;
    }
    if (e.button !== 0) return;
    if (scene === 'title') { const i = menuHit(gx, gy, titleItems().length, VW / 2 + 60, 92, 14, 85); if (i >= 0) { titleSel = i; pressed.Enter = true; } }
    else if (scene === 'story' || scene === 'ending') pressed.Enter = true;
    else if (scene === 'map') {
      for (let i = 0; i < NODES.length; i++) if (near(gx, gy, NODES[i][0], NODES[i][1], 15, 15) && i <= maxPlayable()) { if (mapSel === i) pressed.Enter = true; else { mapSel = i; Snd.play('select'); } }
      if (near(gx, gy, VW / 2, 195, 150, 20)) pressed.Enter = true;
    } else if (inPlay) {
      const st = Q.state;
      if (st === 'pause') { const i = menuHit(gx, gy, 4, VW / 2, 88, 18, 80); if (i >= 0) { Q.menu = i; pressed.Enter = true; } else pressed.Escape = true; }
      else if (st === 'shop') { const n = (SHOPS[Q.shopWho] || []).length + 1, i = menuHit(gx, gy, n, VW / 2, 96, 14, 110); if (i >= 0) { Q.menu = i; pressed.Enter = true; } else pressed.Escape = true; }
      else if (st === 'play') {
        const wx = gx + Q.cam.x, wy = gy + Q.cam.y;
        const npc = Q.nearNpc && near(wx, wy, Q.nearNpc.x, Q.nearNpc.y - 14, 16, 20);
        const pz = Q.nearPz && near(wx, wy, Q.nearPz.x, Q.nearPz.y - 10, 16, 20);
        if (npc || pz) pressed.KeyE = true; else { faceMouse(gx); pressed.KeyJ = true; }
      } else pressed.Enter = true; // intro, talk, tablet, dead, complete
    }
  }
  function faceMouse(gx) { const P = Q && Q.P; if (P && P.dash <= 0) P.face = (gx + Q.cam.x) < P.x + 4 ? -1 : 1; }
  cv.addEventListener('contextmenu', e => e.preventDefault());
  let lastWheel = 0;
  cv.addEventListener('wheel', e => { e.preventDefault(); const n = performance.now(); if (n - lastWheel > 220 && scene === 'play' && Q && Q.state === 'play') { pressed.KeyQ = true; lastWheel = n; } }, { passive: false });
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
    shadowskel: { spr: 'skeleton', swap: { e: 'P', E: 'D', k: 'm' }, out: '#a15be0', w: 9, h: 15, hp: 4, sp: 30, ai: 'charge', block: true },
    scorpion: { spr: 'scorpion', w: 14, h: 7, hp: 2, sp: 38, ai: 'walk', burrow: true },
    snowman: { spr: 'snowman', w: 10, h: 12, hp: 3, sp: 0, ai: 'shoot' },
    fire: { spr: 'fire', w: 10, h: 10, hp: 2, sp: 40, ai: 'flyshoot' },
    ghost: { spr: 'ghost', swap: { w: 'c', k: 'B' }, out: '#6ee7f2', w: 10, h: 11, hp: 2, sp: 34, ai: 'ghost', blink: true },
    knight: { spr: 'knight', out: '#a15be0', w: 10, h: 15, hp: 5, sp: 34, ai: 'charge', block: true },
    beetle: { spr: 'beetle', w: 10, h: 6, hp: 1, sp: 34, ai: 'walk' },
    sandbeetle: { spr: 'beetle', swap: { n: 'Y', N: 'n', r: 'k' }, w: 10, h: 6, hp: 1, sp: 40, ai: 'walk', burrow: true },
    wisp: { spr: 'wisp', w: 8, h: 8, hp: 1, sp: 46, ai: 'ghost', blink: true },
    shadewisp: { spr: 'wisp', swap: { c: 'p', w: 'm' }, out: '#a15be0', w: 8, h: 8, hp: 1, sp: 50, ai: 'ghost', blink: true },
    imp: { spr: 'imp', w: 10, h: 11, hp: 2, sp: 56, ai: 'fly' },
    shadeimp: { spr: 'imp', swap: { r: 'P', R: 'D', e: 'h', w: 'm' }, out: '#a15be0', w: 10, h: 11, hp: 3, sp: 60, ai: 'fly' },
    shroom: { spr: 'shroom', w: 10, h: 10, hp: 2, sp: 0, ai: 'shoot', proj: '#a4e86b', spd: 55 },
    zombie: { spr: 'zombie', w: 9, h: 14, hp: 3, sp: 20, ai: 'walk' },
    eclipseclone: { spr: 'knight', out: '#d58bff', w: 12, h: 16, hp: 5, sp: 60, ai: 'charge' },
    lavablob: { spr: 'slime', swap: { g: 'o', t: 'y', G: 'r' }, w: 8, h: 8, hp: 1, sp: 0, ai: 'blob' }
  };
  const BOSS = [
    { name: { en: 'King Slime', vi: 'Vua Slime' }, w: 38, h: 26, hp: 150, armor: 0, smart: 0.35, sp: 20, minion: 'slime', skills: ['jump', 'bounce3', 'goo', 'splitslime', 'stomp', 'guard'], skills2: ['shoot', 'slam'] },
    { name: { en: 'Spider Queen', vi: 'Nữ Hoàng Nhện' }, w: 40, h: 26, hp: 230, armor: 0.1, smart: 0.5, sp: 26, minion: 'spider', skills: ['charge', 'web', 'spit', 'ambush', 'summon', 'cloak'], skills2: ['jump', 'roar'] },
    { name: { en: 'Crystal Golem', vi: 'Người Khổng Lồ Pha Lê' }, w: 34, h: 44, hp: 300, armor: 0.2, smart: 0.45, sp: 18, minion: 'wisp', skills: ['jump', 'erupt', 'shield', 'beam', 'rain', 'slam'], skills2: ['charge', 'roar'] },
    { name: { en: 'Sand Pharaoh', vi: 'Pharaoh Cát' }, w: 26, h: 52, hp: 380, armor: 0.25, smart: 0.6, sp: 28, minion: 'scorpion', skills: ['curse', 'tornado', 'summon', 'teleport', 'shoot', 'charge', 'cloak'], skills2: ['spin', 'roar'] },
    { name: { en: 'Frost King', vi: 'Vua Băng' }, w: 36, h: 48, hp: 450, armor: 0.3, smart: 0.55, sp: 18, minion: 'iceslime', skills: ['breath', 'wall', 'blizzard', 'rain', 'jump', 'spin', 'guard'], skills2: ['shield', 'summon', 'slam', 'roar'] },
    { name: { en: 'Magma Titan', vi: 'Titan Dung Nham' }, w: 40, h: 50, hp: 540, armor: 0.4, smart: 0.5, sp: 22, minion: 'imp', skills: ['lavaCols', 'meteor', 'sweep', 'charge', 'shield', 'jump', 'slam'], skills2: ['spin', 'summon', 'roar'] },
    { name: { en: 'THE ECLIPSE', vi: 'NHẬT THỰC' }, w: 30, h: 56, hp: 760, armor: 0.4, smart: 0.8, sp: 30, minion: 'ghost', eclipse: true, skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado', 'cloak'], skills2: ['dark', 'clone', 'summon', 'roar'], skills3: ['shield', 'meteor', 'guard', 'slam'] }
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
    if (c === '#' || c === 'I' || c === 'G' || c === 'X') return true;
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
    return { isPlayer: true, x: 0, y: 0, w: 8, h: 14, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumps: 0, atk: 0, atkCd: 0, atkHit: null, atkDown: false, dash: 0, dashCd: 0, inv: 0, hp: maxHP(), anim: 0, drop: 0, riding: null, safeT: 0, wasGround: false, lastVy: 0, ammo: save.ammo, sel: 0, keys: 0, throwCd: 0, shield: false };
  }
  function startLevel(li) {
    const L = genLevel(li);
    const P = newPlayer();
    P.x = L.start.x; P.y = L.start.y - P.h;
    Q = {
      li, L, P, B: L.B, bg: bgs(li), ts: tiles(li), crum: new Map(), taken: new Set(), cp: null, cpIdx: -1,
      ents: [], items: [], projs: [], traps: [], fps: [], fires: [], gates: [], pz: [], solved: new Set(), brokenX: new Set(), trials: [], trialsDone: new Set(), rings: [], ghosts: [], corpses: [], zones: [], tmpCells: [], dragon: null, dragons: [], dragonsDone: new Set(), tmpCells2: 0, windT: 0, windDir: 1, darkBoost: 0, darkBoostT: 0, nearPz: null, parts: [], boss: null, nearNpc: null, talk: null, state: 'intro', stateT: 0, t: 0, freeze: 0, shake: 0,
      cam: { x: 0, y: 0 }, coinsRun: 0, time: 0, safe: { x: P.x, y: P.y }, menu: 0,
      dj: li >= 1 || save.cleared.indexOf(0) >= 0, dashAb: li >= 3 || save.cleared.indexOf(2) >= 0,
      arenaSealed: false, bossDead: false, weather: [], banner: 0, msg: null, msgT: 0
    };
    if (!save.shards[li]) save.shards[li] = [0, 0, 0];
    initEntities();
    initWeather();
    initCreeps();
    snapCam();
    scene = 'play';
    Snd.music('lvl' + li, L.B.music);
    if (li === 1) Q.msg = T('ab1'); else if (li === 3) Q.msg = T('ab3'); else if (li === 0) Q.msg = T('ctl');
    Q.msgT = Q.msg ? 6 : 0;
  }
  function initEntities() {
    const L = Q.L;
    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;
    Q.rings = []; Q.ghosts = []; Q.corpses = []; Q.zones = []; cleanupCells(); Q.windT = 0; Q.darkBoost = 0; Q.darkBoostT = 0; Q.dragon = null;
    for (const t of L.dragons) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }
    Q.dragons = L.dragons.map(t => Object.assign({}, t, { state: Q.dragonsDone.has(t.id) ? 'done' : 'idle' }));
    for (const gd of L.gates) { const open = Q.solved.has(gd.id); for (let y = gd.y0; y <= gd.y1; y++) L.grid[y][gd.x] = open ? ' ' : 'G'; }
    for (const w of L.xwalls) for (const t of w.tiles) L.grid[t[1]][t[0]] = Q.brokenX.has(t[0] + ',' + t[1]) ? ' ' : 'X';
    Q.gates = L.gates.map(gd => Object.assign({}, gd, { open: Q.solved.has(gd.id), seqIdx: 0, timer: 0, levers: 0 }));
    for (const t of L.trials) for (let y = 0; y < t.gy; y++) L.grid[y][t.lw] = ' ';
    Q.trials = L.trials.map(t => Object.assign({}, t, { state: Q.trialsDone.has(t.id) ? 'done' : 'idle', wave: 0, cd: 0 }));
    for (const s of L.spawns) {
      if (Q.taken.has(s.id)) continue;
      if (s.type === 'coin') Q.items.push({ kind: 'coin', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'heart') Q.items.push({ kind: 'heart', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'shard') { if (!save.shards[Q.li][s.k]) Q.items.push({ kind: 'shard', x: s.x, y: s.y, id: s.id, k: s.k, ph: 0 }); }
      else if (s.type === 'boss') Q.boss = makeBoss(s);
      else if (s.type === 'cage') { if (save.leek) Q.items.push({ kind: 'npc', who: 'lyra', x: s.x, y: s.y, id: s.id, ph: 0 }); else Q.pz.push({ type: 'cage', x: s.x, y: s.y, grp: s.grp, open: false }); }
      else if (s.type === 'pk') Q.items.push({ kind: 'pk', what: s.what, amt: s.what === 'dagger' ? 5 : 2, keep: !!s.keep, x: s.x, y: s.y - 7, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'key') Q.items.push({ kind: 'key', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'lever') Q.pz.push({ type: 'lever', x: s.x, y: s.y, gate: s.gate, on: false });
      else if (s.type === 'torch') Q.pz.push({ type: 'torch', x: s.x, y: s.y, gate: s.gate, ci: s.ci, tid: s.tid, lit: false });
      else if (s.type === 'tablet') Q.pz.push({ type: 'tablet', x: s.x, y: s.y, gate: s.gate });
      else if (s.type === 'rune') Q.pz.push({ type: 'rune', x: s.x, y: s.y, gate: s.gate, ci: s.ci, tid: s.tid, lit: false, on: false });
      else if (s.type === 'npc') Q.items.push({ kind: 'npc', who: s.who, x: s.x, y: s.y, id: s.id, ph: Math.random() * 6 });
      else if (['turret', 'spiketrap', 'jets', 'saw', 'rockfall'].indexOf(s.type) >= 0) Q.traps.push({ type: s.type, x: s.x, y: s.y, t: 0, off: s.off || 0, w: s.w || 2, dir: s.dir || -1, len: s.len || 6, x0: s.x - 8, cd: rr(0.5, 2), st: 'idle', ph: 0, id: s.id });
      else Q.ents.push(makeEnemy(s.type, s.x, s.y, s));
    }
    for (const c of L.checkpoints) Q.items.push({ kind: 'cp', x: c.x, y: c.y, id: c.id, lit: Q.cp && Q.cp.id === c.id });
    for (const p of L.plats) { p.t = 0; p.ph = 0; p.dx = p.dy = 0; p.x = p.x0; p.y = p.vert ? p.y1 : p.y0; }
  }
  function makeEnemy(type, x, y, s) {
    const c = EN[type], li = Q.li, v = s && s.v;
    let sc = 1, hpv = 1, armor = 0, dmg = 1, spv = 1;
    if (v === 'small') { sc = 0.7; hpv = 0.6; spv = 1.25; }
    else if (v === 'big') { sc = 1.6; hpv = 3; spv = 0.8; dmg = li >= 2 ? 2 : 1; }
    else if (v === 'elite') { sc = 1.4; hpv = 4; spv = 0.95; dmg = 2; armor = Math.min(0.35, 0.08 + li * 0.05); }
    if (li >= 5 && v !== 'small') dmg += 1;
    const w = Math.max(5, Math.round(c.w * sc)), h = Math.max(5, Math.round(c.h * sc));
    const hp = Math.max(1, Math.round(c.hp * (1 + 0.22 * li) * hpv * (s && s.minion ? 0.6 : 1)));
    const e = { type, cfg: c, x: x - w / 2, y: y - h, w, h, vx: 0, vy: 0, hp, maxhp: hp, sc, v, armor, bcd: rr(1, 3), spawnT: (s && s.minion) ? 0.4 : 0, dmg: Math.min(3, dmg), sp: c.sp * (1 + 0.05 * li) * spv, dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 5, cd: rr(0.5, 1.5), flash: 0, st: 'patrol', stT: 0, hx: x, hy: y, onGround: false, minion: !!(s && s.minion), grp: s && s.grp, trial: s && s.trial };
    if (FLY.has(type) || c.ai === 'ghost' || c.ai === 'flyshoot') { e.y = y - h / 2; e.hy = e.y; e.fly = true; }
    if (c.ai === 'blob') { e.y = y + 10; e.hy = y; e.cd = rr(0.5, 2.5); e.st = 'wait'; }
    return e;
  }
  function makeBoss(s) {
    const c = BOSS[Q.li], hp = Math.round(c.hp * (1 + 0.02 * totalShards()));
    return { isBoss: true, cfg: c, spr: bossSprite(Q.li), x: s.x - c.w / 2, y: s.y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp, max: 0, dir: -1, st: 'sleep', timer: 0, flash: 0, t: 0, sk: null, atkSk: null, lastSk: null, onGround: false, noOneWay: true, n: 0, phase: 0, shield: 0, evCd: 1, invul: 0, hide: false, closeT: 0, fury: 1, armor: c.armor };
  }
  // ---------- creepy darkness: eyes, watchers, fog, whispers ----------
  const EYE_COL = { meadow: '#ffe066', forest: '#d8ff6a', caves: '#ff4a6a', desert: '#ff9a3a', frost: '#9fe8ff', volcano: '#ffd34e', citadel: '#d58bff' };
  function groundTop(tx) { for (let y = 3; y < Q.L.H - 2; y++) { const c = Q.L.grid[y][tx]; if (c === '#' || c === 'I') return y * TS; } return 10 * TS; }
  function initCreeps() {
    const L = Q.L; Q.eyes = []; Q.watchers = []; Q.fog = []; Q.darkCur = Q.B.dark; Q.whT = rr(4, 8);
    const zones = L.dark.slice();
    if (Q.B.dark >= 0.25) zones.push({ x0: 12, x1: L.arena.x0 - 6, a: Q.B.dark });
    for (const z of zones) {
      const n = Math.max(2, Math.round((z.x1 - z.x0) / 9));
      for (let i = 0; i < n; i++) {
        const tx = Math.floor(rr(z.x0, z.x1)), gt = groundTop(tx);
        Q.eyes.push({ x: tx * TS + rr(0, 14), y: gt - rr(14, 70), ph: rr(0, 6), open: rr(1.5, 4), gone: 0, sz: Math.random() < 0.2 ? 2 : 1 });
      }
      for (let i = 0; i < 2; i++) { const tx = Math.floor(rr(z.x0 + 4, z.x1 - 4)); Q.watchers.push({ x: tx * TS + 8, y: groundTop(tx), gone: 0, ph: rr(0, 6), z }); }
    }
    for (let i = 0; i < 16; i++) Q.fog.push({ x: Math.random() * VW, y: rr(90, 200), r: rr(40, 90), vx: rr(-6, 6), ph: rr(0, 6) });
  }
  function darkAt(wx) {
    let d = Q.B.dark;
    for (const z of Q.L.dark) { const tx = wx / TS, edge = Math.min(tx - z.x0, z.x1 - tx); if (edge > 0) d = Math.max(d, z.a * Math.min(1, edge / 6)); }
    return d + (Q.darkBoost || 0);
  }
  function updateCreeps(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.darkCur = lerp(Q.darkCur, Math.min(0.97, darkAt(P.x)), 1 - Math.exp(-2.5 * dt));
    if (Q.darkBoostT > 0) { Q.darkBoostT -= dt; if (Q.darkBoostT <= 0) Q.darkBoost = 0; }
    const inDark = Q.darkCur > 0.45;
    for (const e of Q.eyes) {
      e.ph += dt;
      if (e.gone > 0) { e.gone -= dt; continue; }
      if (inDark && Math.hypot(e.x - pc.x, e.y - pc.y) < 38) { e.gone = rr(5, 10); Snd.sting(); emit(e.x, e.y, 6, { col: '#14121f', sp0: 10, sp1: 40, grav: 0 }); }
    }
    for (const w of Q.watchers) {
      w.ph += dt;
      if (w.gone > 0) { w.gone -= dt; if (w.gone <= 0) { const z = w.z, tx = clamp(Math.floor(P.x / TS) + (Math.random() < 0.5 ? -1 : 1) * Math.floor(rr(12, 20)), Math.floor(z.x0), Math.floor(z.x1)); w.x = tx * TS + 8; w.y = groundTop(tx); } continue; }
      if (Math.abs(w.x - pc.x) < 52 && Math.abs(w.y - P.y) < 50) { w.gone = rr(6, 12); Snd.sting(); Snd.whisper(); emit(w.x, w.y - 16, 14, { col: ['#14121f', '#2a2540'], sp0: 10, sp1: 50, grav: -20 }); }
    }
    Q.whT -= dt;
    if (inDark && Q.whT <= 0) { Q.whT = rr(6, 12); Snd.whisper(); }
    for (const f of Q.fog) { f.ph += dt; f.x += f.vx * dt; if (f.x < -f.r) f.x = VW + f.r; if (f.x > VW + f.r) f.x = -f.r; }
  }
  function drawWatchers(camX, camY) {
    for (const w of Q.watchers) {
      if (w.gone > 0) continue;
      const x = Math.round(w.x - camX), y = Math.round(w.y - camY);
      if (x < -20 || x > VW + 20) continue;
      drawSpr(g, watcherSprite(), x, y, false, false, 1, 1);
    }
    for (const d of Q.L.creep) {
      if (d.x < camX - 20 || d.x > camX + VW + 20) continue;
      const sp = getSprite(['skull', 'grave', 'ribs', 'skull'][d.k]); g.drawImage(sp.c, Math.round(d.x - camX - sp.w / 2), Math.round(d.y - camY - sp.h + 1));
    }
  }
  function drawCreepEyes(camX, camY) {
    if (Q.darkCur < 0.3) return;
    const col = EYE_COL[Q.B.id] || '#ffe066', P = Q.P;
    for (const e of Q.eyes) {
      if (e.gone > 0) continue;
      const blink = (e.ph % (e.open + 0.18)) > e.open; if (blink) continue;
      const x = Math.round(e.x - camX), y = Math.round(e.y - camY + Math.sin(e.ph * 1.3) * 1.5);
      if (x < -10 || x > VW + 10) continue;
      const d = Math.hypot(e.x - (P.x + 4), e.y - (P.y + 7)), a = clamp((d - 30) / 45, 0, 1) * Math.min(1, Q.darkCur * 1.4);
      if (a <= 0.02) continue;
      g.globalAlpha = a; g.fillStyle = col; g.fillRect(x - 3, y, e.sz + 1, e.sz); g.fillRect(x + 3, y, e.sz + 1, e.sz);
      g.globalAlpha = a * 0.3; g.fillRect(x - 5, y - 2, 4 + e.sz, 4 + e.sz); g.fillRect(x + 1, y - 2, 4 + e.sz, 4 + e.sz); g.globalAlpha = 1;
    }
    for (const w of Q.watchers) {
      if (w.gone > 0) continue;
      const x = Math.round(w.x - camX), y = Math.round(w.y - camY - 28), d = Math.hypot(w.x - (P.x + 4), w.y - 14 - (P.y + 7)), a = clamp((d - 20) / 40, 0, 1) * Math.min(1, Q.darkCur * 1.5);
      if (a <= 0.02 || x < -10 || x > VW + 10 || Math.floor(w.ph * 2) % 9 === 0) continue;
      g.globalAlpha = a; g.fillStyle = '#ff2a3a'; g.fillRect(x - 2, y, 2, 2); g.fillRect(x + 1, y, 2, 2); g.globalAlpha = a * 0.35; g.fillRect(x - 4, y - 2, 6, 6); g.globalAlpha = 1;
    }
  }
  function drawFog() {
    if (Q.darkCur < 0.25) return;
    const tint = { caves: '90,70,160', forest: '60,120,90', citadel: '120,70,170', frost: '140,180,230', volcano: '140,50,30', desert: '180,120,70', meadow: '120,110,150' }[Q.B.id] || '100,100,140';
    for (const f of Q.fog) {
      const a = 0.07 * Math.min(1, Q.darkCur * 1.6) * (0.7 + 0.3 * Math.sin(f.ph));
      const gr = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, 'rgba(' + tint + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + tint + ',0)');
      g.fillStyle = gr; g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
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
    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);
    Q.shake = 0.6;
  }
  function unseal() { const L = Q.L, ar = L.arena; for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }

  // ============================== UPDATE ==============================
  function setEmo(type, dur) { const P = Q && Q.P; if (!P) return; P.emo = type; P.emoT = dur; }
  function drawEmoteFace(x, bot, flip, sc, emo, tt) {
    if (!emo) return;
    const spr = getSprite('hero_idle', {}, 0), W = spr.w, ox = Math.round(x - W * sc / 2), oy = Math.round(bot - spr.h * sc + sc);
    const px = (cx, cy, col, w, h) => { const ww = w || 1, xx = flip ? (W - 1 - cx - (ww - 1)) : cx; g.fillStyle = col; g.fillRect(ox + xx * sc, oy + cy * sc, ww * sc, (h || 1) * sc); };
    const V = '#434d6e';
    px(6, 8, V, 8, 2);
    if (emo === 'happy') { ['#ffe08a'].forEach(c => { px(7, 9, c); px(8, 8, c); px(9, 9, c); px(10, 9, c); px(11, 8, c); px(12, 9, c); }); }
    else if (emo === 'cry') {
      px(7, 9, '#6ee7f2'); px(8, 8, '#bff3ff'); px(8, 9, '#6ee7f2'); px(11, 8, '#bff3ff'); px(11, 9, '#6ee7f2'); px(12, 9, '#6ee7f2');
      for (let i = 0; i < 3; i++) { const yy = 10 + ((Math.floor(tt * 7) + i) % 4); px(7, yy, '#8ad8ff'); px(12, yy, '#8ad8ff'); }
    }
    else if (emo === 'angry') { px(8, 8, '#ff4a3a', 1, 2); px(11, 8, '#ff4a3a', 1, 2); px(6, 7, '#ff9a8a'); px(7, 7, '#ff9a8a'); px(9, 8, '#ff9a8a'); px(10, 8, '#ff9a8a'); px(12, 7, '#ff9a8a'); }
    else if (emo === 'scared') { px(7, 8, '#fff', 2, 2); px(10, 8, '#fff', 2, 2); px(8, 9, '#14121f'); px(11, 9, '#14121f'); }
    else if (emo === 'hurt') { px(7, 8, '#ff6a5a'); px(9, 8, '#ff6a5a'); px(8, 9, '#ff6a5a'); px(7, 9, '#ff6a5a'); px(9, 9, '#ff6a5a'); px(10, 8, '#ff6a5a'); px(12, 8, '#ff6a5a'); px(11, 9, '#ff6a5a'); px(10, 9, '#ff6a5a'); px(12, 9, '#ff6a5a'); }
  }
  function drawEmoBubble(x, top, emo) {
    if (emo !== 'happy' && emo !== 'angry' && emo !== 'cry') return;
    const bx = Math.round(x + 4), by = Math.round(top - 11);
    g.fillStyle = '#14121f'; g.fillRect(bx - 1, by - 1, 12, 10); g.fillStyle = '#fff'; g.fillRect(bx, by, 10, 8); g.fillStyle = '#14121f'; g.fillRect(bx + 1, by + 8, 2, 2);
    if (emo === 'happy') { g.fillStyle = '#ff5a8a'; g.fillRect(bx + 2, by + 1, 2, 2); g.fillRect(bx + 6, by + 1, 2, 2); g.fillRect(bx + 1, by + 2, 8, 2); g.fillRect(bx + 2, by + 4, 6, 1); g.fillRect(bx + 3, by + 5, 4, 1); g.fillRect(bx + 4, by + 6, 2, 1); }
    else if (emo === 'angry') { g.fillStyle = '#e0453a'; g.fillRect(bx + 2, by + 1, 1, 2); g.fillRect(bx + 1, by + 2, 3, 1); g.fillRect(bx + 6, by + 1, 1, 2); g.fillRect(bx + 5, by + 2, 3, 1); g.fillRect(bx + 2, by + 5, 6, 1); g.fillRect(bx + 3, by + 4, 4, 1); }
    else { g.fillStyle = '#4a8bf0'; g.fillRect(bx + 4, by + 1, 2, 1); g.fillRect(bx + 3, by + 2, 4, 3); g.fillRect(bx + 4, by + 5, 2, 1); g.fillStyle = '#bfeaff'; g.fillRect(bx + 4, by + 3, 1, 1); }
  }
  function hurtPlayer(n, fromX, noKnock) {
    const P = Q.P;
    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play' && Q.state !== 'bossplay') return false;
    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); return false; }
    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;
    Snd.play('hurt'); Snd.hero('hurt'); setEmo('hurt', 0.45);
    emit(P.x + P.w / 2, P.y + P.h / 2, 10, { col: ['#e0453a', '#f6f3e9'], sp0: 30, sp1: 90 });
    if (!noKnock) { P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 130; P.vy = -170; P.atk = 0; }
    if (P.hp <= 0) { P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); Snd.hero('die'); setEmo('cry', 99); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 }); }
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
    P.anim += dt; P.inv = Math.max(0, P.inv - dt);
    if (P.emoT > 0) { P.emoT -= dt; if (P.emoT <= 0) P.emo = null; }
    if (!P.emo && P.hp <= 1 && P.hp > 0) P.emo = 'cry';
    if (P.emo === 'cry' && Math.random() < 0.12) emit(P.x + 4 + (Math.random() < 0.5 ? -3 : 3) * P.face, P.y + 3, 1, { col: '#8ad8ff', sp0: 2, sp1: 8, vy: 20, grav: 160, l0: 0.4, l1: 0.7 }); P.atkCd -= dt; P.dashCd -= dt; P.drop -= dt;
    // timers
    if (act.jumpP) P.jumpBuf = 0.12; else P.jumpBuf -= dt;
    if (P.onGround) { P.coyote = 0.09; P.jumps = 0; } else P.coyote -= dt;
    const dir0 = (act.right ? 1 : 0) - (act.left ? 1 : 0), dir = P.rev > 0 ? -dir0 : dir0;
    if (P.slow > 0) P.slow -= dt; if (P.rev > 0) P.rev -= dt;
    if (Q.windT > 0) { Q.windT -= dt; moveX(P, Q.windDir * 46 * dt); if (Math.random() < 0.3) emit(P.x + rr(-30, 30), P.y + rr(-20, 14), 1, { col: '#fff', sp0: 5, sp1: 20, vx: Q.windDir * 90, grav: 0, l0: 0.2, l1: 0.4 }); }
    const ice = P.onGround && P.groundCh === 'I' && !hasRelic(4);
    // dash
    if (act.dashP && Q.dashAb && P.dashCd <= 0 && P.dash <= 0) {
      P.dash = 0.17; P.dashCd = hasRelic(4) ? 0.35 : 0.7; P.dashDir = dir || P.face; P.vy = 0; P.inv = Math.max(P.inv, 0.2);
      Snd.play('dash'); Snd.hero('dash'); emit(P.x + 4, P.y + 8, 8, { col: '#b8bfd0', sp0: 5, sp1: 30, vx: -P.dashDir * 50 });
    }
    if (P.dash > 0) {
      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;
      if (Math.random() < 0.8) emit(P.x + 4, P.y + 8, 1, { col: ['#6ee7f2', '#fff'], sp0: 0, sp1: 12, l0: 0.15, l1: 0.3, grav: 0 });
    } else {
      // horizontal
      const target = dir * RUN * (P.slow > 0 ? 0.5 : 1);
      const acc = ice ? 220 : (P.onGround ? 1100 : 750);
      if (dir !== 0 && P.atk <= 0.1) { P.face = dir; }
      if (dir !== 0 || !ice) {
        const a = (dir === 0 ? (ice ? 120 : 1300) : acc) * dt;
        if (P.vx < target) P.vx = Math.min(target, P.vx + a); else if (P.vx > target) P.vx = Math.max(target, P.vx - a);
      } else { P.vx *= (1 - 0.8 * dt); }
      // jump
      if (P.jumpBuf > 0) {
        if (act.down && P.onGround && ch(Math.floor((P.x + 4) / TS), Math.floor((P.y + P.h + 1) / TS)) === '=') { P.drop = 0.22; P.jumpBuf = 0; P.y += 2; }
        else if (P.coyote > 0) { P.vy = -JUMP; P.coyote = 0; P.jumpBuf = 0; P.jumps = 1; P.onGround = false; Snd.play('jump'); Snd.hero('jump'); emit(P.x + 4, P.y + P.h, 5, { col: '#cfd6e6', sp0: 10, sp1: 30, vy: -10, grav: 60 }); }
        else if (Q.dj && P.jumps < 2) { P.vy = -DJUMP; P.jumps = 2; P.jumpBuf = 0; Snd.play('djump'); Snd.hero('djump'); emit(P.x + 4, P.y + P.h, 10, { col: ['#6ee7f2', '#fff'], sp0: 20, sp1: 60, vy: 20 }); }
      }
      if (!act.jump && P.vy < -110) P.vy *= (1 - 9 * dt);
      const g2 = (act.jump && Math.abs(P.vy) < 50) ? GRAV * 0.62 : GRAV;
      P.vy = Math.min(380, P.vy + g2 * dt);
    }
    // attack
    if (act.atkP && P.atkCd <= 0 && P.dash <= 0) {
      P.atk = 0.2; P.atkCd = 0.27; P.atkHit = new Set(); P.atkDown = !P.onGround && act.down;
      Snd.play('slash'); if (Math.random() < 0.6) Snd.hero('attack');
      if (hasRelic(5) && !P.atkDown) { Snd.play('flame'); Q.fps.push({ t: 'wave', x: P.x + 4 + P.face * 10, y: P.y + 7, vx: P.face * 150, vy: 0, g: 0, life: 0.55, hit: new Set() }); }
    }
    P.throwCd -= dt;
    if (act.swapP) cycleWeapon();
    if (act.throwP && P.throwCd <= 0 && P.dash <= 0) throwItem();
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
    const rch = save.leek ? 31 : 24;
    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: rch, h: P.h + 5 } : { x: P.x - rch + 1, y: P.y - 3, w: rch, h: P.h + 5 };
  }
  function swordHit() {
    const P = Q.P, r = swordRect(), dmg = swordDmg();
    const list = Q.ents.slice().concat(bossTargets());
    for (const e of list) {
      if (e.dead || e.hid || P.atkHit.has(e)) continue;
      if (e.cfg && e.cfg.ai === 'blob' && e.st !== 'up') continue;
      if (ov(r, e)) {
        P.atkHit.add(e);
        if (e.isBoss) hurtBoss(e, dmg); else hurtEnemy(e, dmg);
        Q.freeze = 0.045; Snd.play('hit');
        if (P.atkDown) { P.vy = -250; P.jumps = 1; P.atk = 0; }
        else if (!P.onGround && false) { }
      }
    }
    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(r, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);
    // destroy projectiles
    for (const p of Q.projs) if (!p.boss && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
    for (const p of Q.projs) if (p.type !== 'wave' && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
  }
  function hurtEnemy(e, dmg, pierce) {
    let bl = 1; if (e.st === 'block' && !pierce) { bl = 0.2; Snd.play('clang'); emit(e.x + e.w / 2 + e.dir * e.w / 2, e.y + e.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 110 }); }
    const arm = e.armor || 0, eff = dmg * bl * (1 - arm * (pierce ? 0.4 : 1));
    e.hp -= eff; e.flash = 0.12; e.hitT = 0.18;
    if (arm > 0 && !pierce) emit(e.x + e.w / 2, e.y + e.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 90 });
    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt', false, 1, e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1));
    const P = Q.P;
    if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; }
    emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });
    if (e.hp <= 0) {
      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
      { const cc = e.cfg; Q.corpses.push({ spr: getSprite(cc.spr, cc.swap || {}, cc.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, cc.out), x: e.x + e.w / 2, bot: e.y + e.h, flip: e.dir < 0, sc: e.sc || 1, t: 0, vx: (e.x < Q.P.x ? -1 : 1) * 70, vy: -160, rot: 0, rv: (Math.random() < 0.5 ? -1 : 1) * 9 }); }
      if (!e.minion) {
        const n = Math.random() < 0.55 ? 1 : 0;
        for (let i = 0; i < n + (e.maxhp >= 6 ? 2 : 0) + (e.v === 'elite' ? 3 : 0); i++) Q.items.push({ kind: 'coin', x: e.x + e.w / 2 + rr(-5, 5), y: e.y, id: -1, vy: -rr(60, 120), vx: rr(-40, 40), ph: 0, drop: true });
        if (Math.random() < (e.v === 'elite' ? 0.3 : 0.05)) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });
        if (Math.random() < 0.1) { const w = ['dagger', 'dagger', 'bomb', 'flask'][(Math.random() * 4) | 0]; Q.items.push({ kind: 'pk', what: w, amt: w === 'dagger' ? 3 : 1, keep: false, x: e.x + e.w / 2, y: e.y, id: -1, vy: -90, vx: rr(-30, 30), ph: 0, drop: true }); }
      }
      Snd.play('boom');
    }
  }
  function hurtBoss(b, dmg, pierce) {
    if (b.isDragon) return hurtDragon(b, dmg, pierce);
    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.invul > 0 || b.dead) return;
    if (b.shield > 0) {
      if (!pierce) { Snd.play('hit'); b.flash = 0.04; emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#6ee7f2', '#fff'], sp0: 40, sp1: 110 }); return; }
      b.shield = 0; b.st = 'stun'; b.stunT = 2.2; b.sk = null; dmg *= 1.5; Q.msg = save.lang === 'vi' ? 'Khiên vỡ! Nó choáng!' : 'Shield broken! It is stunned!'; Q.msgT = 3; Snd.play('explode');
    }
    let gm = 1; if (b.guard > 0) { if (!pierce) { gm = 0.15; Snd.play('clang'); emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 120 }); } else gm = 0.6; }
    const arm = b.cfg.armor || 0, eff = dmg * gm * (1 - arm * (pierce ? 0.4 : 1)) * ((b.st === 'stun' || b.st === 'rec') ? 1.25 : 1);
    b.hp -= eff; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);
    Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);
    emit(b.x + b.w / 2, b.y + b.h / 2, 8, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 90 });
    if (arm > 0.15 && !pierce) emit(b.x + b.w / 2, b.y + b.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 100 });
    const pct = b.hp / b.max;
    if (!b.t1 && pct < 0.66) { b.t1 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (!b.t2 && pct < 0.33) { b.t2 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (b.hp <= 0) {
      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0; Q.bossBooms = 0; Q.freeze = 0.25; Q.shake = 1;
      Snd.play('boom'); Snd.stop(); Q.zones.length = 0; cleanupCells(); Q.windT = 0; Q.darkBoost = 0;
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
  function firePr(x, y, vx, vy, o) { Q.projs.push(Object.assign({ x, y, vx, vy, life: 4, grav: 0, col: Q.B.proj, type: 'ball', boss: false }, o || {})); if (!(o && o.silent)) Snd.play('shoot'); if (o && o.boss && Q.boss && !Q.boss.dead) Q.boss.kick = 0.16; }

  function burrowTick(e, dt, dx) {
    const c = e.cfg;
    if (e.st === 'dig') { e.stT -= dt; e.vx = 0; if (Math.random() < 0.5) emit(e.x + e.w / 2, e.y + e.h, 1, { col: '#c8964a', sp0: 10, sp1: 40, vy: -30, l0: 0.2, l1: 0.4 }); if (e.stT <= 0) { e.st = 'under'; e.stT = 0.95; e.hid = true; } return true; }
    if (e.st === 'under') {
      e.stT -= dt; const d = dx > 0 ? 1 : -1; e.dir = d; e.vy = 0; moveX(e, d * e.sp * 2.4 * dt);
      if (Math.random() < 0.6) emit(e.x + e.w / 2, e.y + e.h, 1, { col: '#c8964a', sp0: 10, sp1: 40, vy: -25, l0: 0.2, l1: 0.4 });
      if (e.stT <= 0 || Math.abs(dx) < 10) { e.st = 'pop'; e.hid = false; e.vy = -215; e.vx = d * e.sp * 0.6; e.stT = 0.6; e.onGround = false; emit(e.x + e.w / 2, e.y + e.h, 14, { col: ['#c8964a', '#fff'], sp0: 20, sp1: 90, vy: -30 }); Snd.creature(e.type, 'attack'); addRing(e.x + e.w / 2, e.y + e.h, '#c8964a', 24, 0.3); }
      return true;
    }
    if (e.st === 'pop') { e.stT -= dt; e.vy = Math.min(380, e.vy + GRAV * dt); moveX(e, e.vx * dt); moveY(e, e.vy * dt); if (e.onGround && e.stT < 0.45) { e.st = 'patrol'; e.bcd = rr(3, 5); e.vx = 0; } return true; }
    if (e.st === 'patrol' && e.onGround && e.bcd <= 0 && Math.abs(dx) < 120) { e.st = 'dig'; e.stT = 0.5; e.vx = 0; Snd.creature(e.type, 'idle', false, 0.8); return true; }
    return false;
  }
  function updateEnemies(dt) {
    const P = Q.P, cx = Q.cam.x + VW / 2;
    for (const e of Q.ents) {
      if (e.dead) continue;
      if (Math.abs(e.x - cx) > 260) continue;
      e.t += dt; if (e.flash > 0) e.flash -= dt;
      if (e.hitT > 0) e.hitT -= dt; if (e.kickT > 0) e.kickT -= dt; if (e.landT > 0) e.landT -= dt;
      if (e.spawnT > 0) { e.spawnT -= dt; continue; }
      const wasG = e.onGround, pvy0 = e.vy;
      const c = e.cfg, dx = (P.x + P.w / 2) - (e.x + e.w / 2), dy = (P.y + P.h / 2) - (e.y + e.h / 2);
      { const d2 = Math.abs(dx) + Math.abs(dy) * 0.5, vol = clamp(1 - d2 / 320, 0.2, 1), pit = e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1);
        if (!e.alerted && d2 < 150) { e.alerted = true; Snd.creature(e.type, 'alert', false, vol, pit); e.vt = rr(1.2, 2.6); }
        else if (d2 < 270) { e.vt = (e.vt === undefined ? rr(1, 3) : e.vt) - dt; if (e.vt <= 0) { e.vt = rr(1.8, 4); Snd.creature(e.type, 'idle', false, vol, pit); } }
        if (d2 > 310) e.alerted = false; }
      switch (c.ai) {
        case 'walk': case 'hop': case 'charge': {
          if (e.stun > 0) e.stun -= dt;
          if (c.burrow) { e.bcd -= dt; if (burrowTick(e, dt, dx)) break; }
          if (e.onGround) {
            e.cd -= dt;
            if (c.ai === 'charge' || c.ai === 'walk') {
              if (e.st === 'patrol') {
                e.vx = e.dir * e.sp;
                if (Math.abs(dx) < (c.ai === 'walk' ? 75 : 100) && Math.abs(dy) < 26 && (dx > 0) === (e.dir > 0)) { if (c.block && Math.random() < 0.65) { e.st = 'block'; e.stT = 0.9; e.vx = 0; Snd.play('clang'); } else { e.st = 'wind'; e.stT = 0.4; e.vx = 0; Snd.creature(e.type, 'attack'); } }
              } else if (e.st === 'block') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); } }
              else if (e.st === 'wind') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 'rush'; e.stT = 0.9; e.dir = dx > 0 ? 1 : -1; } }
              else if (e.st === 'rush') { e.vx = e.dir * e.sp * 2.8; e.stT -= dt; if (e.stT <= 0) { e.st = 'rest'; e.stT = 0.6; } }
              else if (e.st === 'rest') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) e.st = 'patrol'; }
            } else {
              e.vx = e.dir * e.sp;
              if (c.ai === 'hop' && e.cd <= 0 && Math.abs(dx) < 110 && Math.abs(dy) < 70) {
                e.vy = -c.jump; e.vx = (dx > 0 ? 1 : -1) * e.sp * 2.8; e.dir = dx > 0 ? 1 : -1; e.cd = rr(1, 1.8);
              } else if (c.ai === 'hop' && e.cd < -2) e.cd = rr(0.3, 1);
            }
            if (e.st !== 'wind' && e.st !== 'rest' && !groundAhead(e, e.dir) && e.st !== 'rush') { e.dir *= -1; e.vx = e.dir * e.sp; }
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
          e.cd -= dt;
          if (e.st === 'dive') { e.stT -= dt; e.x += e.dvx * dt; e.y += e.dvy * dt; if (e.stT <= 0) { e.st = 'patrol'; e.cd = rr(1.8, 3.2); } break; }
          if (near && e.cd <= 0 && dy > 6 && Math.abs(dx) < 95) { const dd = Math.hypot(dx, dy) || 1; e.dvx = dx / dd * e.sp * 3.2; e.dvy = dy / dd * e.sp * 3.2; e.st = 'dive'; e.stT = 0.45; Snd.creature(e.type, 'attack', false, 1, e.sc > 1.2 ? 0.7 : 1); break; }
          const tx = near ? P.x + P.w / 2 : e.hx + Math.sin(e.t * 0.7) * 45;
          const ty = near ? P.y - 6 + Math.sin(e.t * 3) * 10 : e.hy + Math.sin(e.t * 2) * 8;
          const mx = tx - (e.x + e.w / 2), my = ty - (e.y + e.h / 2), d = Math.hypot(mx, my) || 1;
          const sp = near ? e.sp : e.sp * 0.5;
          e.vx = lerp(e.vx, mx / d * sp, 0.05); e.vy = lerp(e.vy, my / d * sp, 0.05);
          if (Math.abs(e.vx) > 2) e.dir = e.vx > 0 ? 1 : -1;
          e.x += e.vx * dt; e.y += e.vy * dt; break;
        }
        case 'flyshoot': {
          e.x = e.hx - e.w / 2 + Math.sin(e.t * 0.9) * 30; e.y = e.hy + Math.sin(e.t * 2.2) * 8; e.dir = dx > 0 ? 1 : -1;
          e.cd -= dt;
          if (Math.abs(dx) < 170 && Math.abs(dy) < 110) {
            if (e.cd <= 0) { e.cd = 2.2; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }
          }
          if (e.st === 'wind') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; e.kickT = 0.15; const a = Math.atan2(dy, dx); firePr(e.x + e.w / 2, e.y + e.h / 2, Math.cos(a) * 85, Math.sin(a) * 85, { col: '#ff9a2a' }); } }
          break;
        }
        case 'shoot': {
          e.dir = dx > 0 ? 1 : -1; e.vy = Math.min(380, e.vy + GRAV * dt); moveY(e, e.vy * dt);
          e.cd -= dt;
          if (Math.abs(dx) < 160 && Math.abs(dy) < 70 && e.cd <= 0) { e.cd = 2.1; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }
          if (e.st === 'wind') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; e.kickT = 0.15; const a = Math.atan2(dy, dx); const sp = c.spd || 95; firePr(e.x + e.w / 2, e.y + 4, Math.cos(a) * sp, Math.sin(a) * sp, { col: c.proj || '#bfeaff' }); } }
          break;
        }
        case 'ghost': {
          const near = Math.abs(dx) < 150 && Math.abs(dy) < 110;
          e.blT = (e.blT === undefined ? rr(2, 4) : e.blT) - dt;
          if (e.st === 'fade') { e.stT -= dt; if (e.stT <= 0) { const sd = Math.random() < 0.5 ? -1 : 1; e.x = P.x + 4 + sd * 70 - e.w / 2; e.y = P.y - 12; e.st = 'appear'; e.stT = 0.3; emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: [Q.B.proj, '#fff'], sp0: 10, sp1: 50 }); Snd.play('poof'); } break; }
          if (e.st === 'appear') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; e.blT = rr(4, 6); } break; }
          if (c.blink && near && e.blT <= 0) { e.st = 'fade'; e.stT = 0.3; Snd.play('poof'); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: [Q.B.proj, '#fff'], sp0: 10, sp1: 40 }); break; }
          if (near) { const d = Math.hypot(dx, dy) || 1; e.vx = lerp(e.vx, dx / d * e.sp, 0.03); e.vy = lerp(e.vy, dy / d * e.sp, 0.03); }
          else { e.vx = lerp(e.vx, Math.sin(e.t) * 12, 0.05); e.vy = lerp(e.vy, Math.cos(e.t * 1.3) * 10, 0.05); }
          e.dir = e.vx > 0 ? 1 : -1; e.x += e.vx * dt; e.y += e.vy * dt; break;
        }
        case 'blob': {
          if (e.st === 'wait') { e.cd -= dt; e.y = e.hy + 12; if (e.cd <= 0) { e.st = 'up'; e.vy = -rr(210, 270); } }
          else { e.vy += 520 * dt; e.y += e.vy * dt; if (e.vy > 0 && e.y >= e.hy + 12) { e.st = 'wait'; e.cd = rr(1.2, 2.8); } if (Math.random() < 0.3) emit(e.x + 4, e.y + 6, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 14, grav: 40, l0: 0.2, l1: 0.4 }); }
          break;
        }
      }
      if (e.onGround && !wasG && pvy0 > 120 && !e.fly) { e.landT = 0.2; emit(e.x + e.w / 2, e.y + e.h, 4, { col: '#cfd6e6', sp0: 15, sp1: 45, vy: -10, grav: 40, l0: 0.15, l1: 0.3 }); }
      // contact
      if (!e.dead && !e.hid && (c.ai !== 'blob' || e.st === 'up') && ov(P, { x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 })) hurtPlayer(e.dmg || 1, e.x + e.w / 2);
    }
    Q.ents = Q.ents.filter(e => !e.dead);
  }

  // ===================== BOSS AI =====================
  const bc = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  function bossTargets() {
    const out = [], b = Q.boss, d = Q.dragon;
    if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro') out.push(b);
    if (d && !d.dead && !d.hide && d.st !== 'enter' && d.st !== 'talk') out.push(d);
    return out;
  }
  function cleanupCells() { if (Q.tmpCells) for (const c of Q.tmpCells) if (Q.L.grid[c[1]][c[0]] === 'I') Q.L.grid[c[1]][c[0]] = ' '; Q.tmpCells = []; }
  function addZone(o) { Q.zones.push(Object.assign({ t: 0, tel: 0.7, life: 0.6, dmg: 1, col: Q.B.proj, vx: 0 }, o)); }
  function shockwave(b, small) {
    const c = bc(b); Q.shake = small ? 0.25 : 0.5; Snd.play('boom'); addRing(c.x, b.y + b.h, Q.B.proj, small ? 55 : 90, 0.5); emit(c.x, b.y + b.h, 14, { col: '#cfd6e6', sp0: 20, sp1: 80, vy: -20 });
    const sp = (small ? 70 : 95) * b.fury;
    Q.projs.push({ x: c.x - 12, y: b.y + b.h - 6, vx: -sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
    Q.projs.push({ x: c.x + 12, y: b.y + b.h - 6, vx: sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
  }
  function bounceJump(b) { const P = Q.P; b.vy = -270; b.vx = clamp((P.x - b.x) * 1.5, -140, 140); b.onGround = false; b.jt = 0; }
  const wait = (b, dt) => { b.skT -= dt; return b.skT <= 0; };
  const arenaClamp = x => clamp(x, Q.L.arena.x0 * TS + 24, Q.L.arena.x1 * TS - 24);
  const BS = {
    jump: { tele: 0.55, start(b) { const P = Q.P; b.vy = -310; b.vx = clamp((P.x - b.x) * 1.4, -150, 150); b.onGround = false; b.jt = 0; }, upd(b, dt) { b.jt += dt; moveX(b, b.vx * dt); if (b.onGround && b.jt > 0.2) { shockwave(b); return true; } } },
    stomp: { tele: 0.45, start(b) { b.vy = -240; b.vx = 0; b.onGround = false; b.jt = 0; }, upd(b, dt) { b.jt += dt; if (b.onGround && b.jt > 0.2) { shockwave(b); return true; } } },
    bounce3: { tele: 0.5, start(b) { b.n = 3; bounceJump(b); }, upd(b, dt) { b.jt += dt; moveX(b, b.vx * dt); if (b.onGround && b.jt > 0.18) { shockwave(b, true); if (--b.n > 0) bounceJump(b); else return true; } } },
    charge: { tele: 0.6, start(b) { b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 1.3; b.recAfter = 1.1; }, upd(b, dt) { b.skT -= dt; if (moveX(b, b.dir * 155 * b.fury * dt)) { Q.shake = 0.4; Snd.play('boom'); return true; } if (Math.random() < 0.5) emit(b.x + b.w / 2 - b.dir * b.w / 2, b.y + b.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 20, vy: -10, grav: 20 }); return b.skT <= 0; } },
    shoot: { tele: 0.55, start(b) { b.n = 2 + (Q.li > 3 ? 1 : 0); b.skT = 0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x), k = Q.li > 4 ? 2 : 1; for (let i = -k; i <= k; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.28) * 105, Math.sin(a0 + i * 0.28) * 105, { boss: true }); if (--b.n <= 0) return true; b.skT = 0.55 / b.fury; } } },
    rain: { tele: 0.5, start(b) { b.skT = 2.4; b.drop = 0; }, upd(b, dt) { b.skT -= dt; b.drop -= dt; const ar = Q.L.arena; if (b.drop <= 0) { b.drop = 0.2 / b.fury; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: Q.B.proj, type: 'fall', boss: true }); } return b.skT <= 0; } },
    spin: { tele: 0.55, start(b) { b.n = 2 + (Q.li > 4 ? 1 : 0); b.skT = 0; b.rot = 0; b.recAfter = 1.0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b); b.rot += 0.26; for (let i = 0; i < 12; i++) { const a = b.rot + i / 12 * Math.PI * 2; firePr(c.x, c.y, Math.cos(a) * 80, Math.sin(a) * 80, { boss: true }); } if (--b.n <= 0) return true; b.skT = 0.8 / b.fury; } } },
    summon: { tele: 0.5, start(b) {
      let alive = Q.ents.filter(e => !e.dead).length;
      for (let i = 0; i < 3 && alive < 5; i++, alive++) { const m = makeEnemy(b.cfg.minion, b.x + b.w / 2 + (i - 1) * 34, b.y + b.h - 4, { minion: true }); if (!m.fly) m.vy = -150; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: Q.B.proj }); }
      Snd.creature(Q.li, 'alert', true); b.skT = 0.8; }, upd: wait },
    splitslime: { tele: 0.5, start(b) { for (let i = 0; i < 3; i++) { const m = makeEnemy('slime', b.x + b.w / 2 + (i - 1) * 30, b.y + b.h - 4, { minion: true, v: 'small' }); m.vy = -170; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 8, { col: '#a4e86b' }); } Snd.creature('slime', 'alert'); b.skT = 0.9; }, upd: wait },
    goo: { tele: 0.5, start(b) { const P = Q.P; for (let i = -1; i <= 1; i++) { const x = arenaClamp(P.x + 4 + i * 44 + rr(-8, 8)); addZone({ type: 'goo', x: x - 18, y: groundYAt(x) - 5, w: 36, h: 5, tel: 0.4, life: 6, col: '#7a4cff' }); } b.skT = 0.9; Snd.play('flame'); }, upd: wait },
    web: { tele: 0.55, start(b) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -1; i <= 1; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.25) * 95, Math.sin(a0 + i * 0.25) * 95, { boss: true, col: '#e8e8f8', big: true, status: { slow: 2.4 } }); b.skT = 0.6; }, upd: wait },
    spit: { tele: 0.6, start(b) { const c = bc(b), P = Q.P, t = 1.0; Q.projs.push({ x: c.x, y: c.y, vx: ((P.x + 4) - c.x) / t, vy: -150, grav: 300, life: 3, col: '#9be564', type: 'ball', boss: true, big: true, onLand: 'poison' }); Snd.play('shoot'); b.skT = 1.0; }, upd: wait },
    ambush: { tele: 0.7, start(b) { addGhost(b, 'out'); Snd.play('poof'); b.hide = true; b.ph = 0; b.skT = 0.5; emit(b.x + b.w / 2, b.y + b.h / 2, 16, { col: ['#5a2d8f', '#a15be0'], sp0: 20, sp1: 80 }); b.y = -300; Snd.creature(Q.li, 'attack', true); },
      upd(b, dt) {
        b.skT -= dt; const P = Q.P, ar = Q.L.arena;
        if (b.ph === 0) { if (b.skT <= 0) { b.ph = 1; b.skT = 1.0; b.mx = P.x + 4; } }
        else if (b.ph === 1) { b.mx = lerp(b.mx, P.x + 4, 0.07); if (b.skT <= 0) { b.ph = 2; b.skT = 0.4; b.lockx = clamp(b.mx, ar.x0 * TS + 30, ar.x1 * TS - 30); } }
        else if (b.ph === 2) { if (b.skT <= 0) { b.hide = false; b.x = b.lockx - b.w / 2; b.y = Q.cam.y - b.h - 8; b.vy = 380; b.ph = 3; b.jt = 0; Snd.creature(Q.li, 'alert', true); } }
        else if (b.ph === 3) { b.jt += dt; if (b.onGround && b.jt > 0.1) { shockwave(b); return true; } }
      } },
    erupt: { tele: 0.55, start(b) {
      const P = Q.P, d = P.x + 4 < b.x + b.w / 2 ? -1 : 1, c = b.x + b.w / 2;
      if (b.cfg.eclipse) { for (let i = -2; i <= 2; i++) { const x = arenaClamp(P.x + 4 + i * 26); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 34, w: 14, h: 34, tel: 0.7 + Math.abs(i) * 0.12, life: 0.5, col: '#a15be0' }); } }
      else for (let i = 1; i <= 7; i++) { const x = arenaClamp(c + d * i * 20); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 34, w: 14, h: 34, tel: 0.55 + i * 0.1, life: 0.5 }); }
      b.skT = 1.9; }, upd: wait },
    shield: { tele: 0.4, start(b) { b.shield = 3.4; b.skT = 3.4; Snd.play('gate'); }, upd(b, dt) { b.skT -= dt; return b.skT <= 0 || b.shield <= 0; } },
    beam: { tele: 0.9, start(b) {
      const ar = Q.L.arena, gt = ar.gy * TS, c = bc(b), low = Math.random() < 0.6, dx = Q.P.x + 4 < c.x ? -1 : 1;
      const x0 = dx < 0 ? ar.x0 * TS + 8 : c.x, x1 = dx < 0 ? c.x : ar.x1 * TS - 8;
      addZone({ type: 'beam', x: x0, y: low ? gt - 9 : gt - 38, w: x1 - x0, h: 10, tel: 0.9, life: 0.55 }); b.skT = 1.7; Snd.play('flame'); }, upd: wait },
    curse: { tele: 0.6, start(b) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -1; i <= 1; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.35) * 85, Math.sin(a0 + i * 0.35) * 85, { boss: true, col: '#c07bff', big: true, status: { rev: 3.5 } }); b.skT = 0.8; }, upd: wait },
    tornado: { tele: 0.6, start(b) { const c = bc(b); addZone({ type: 'pull', x: c.x - 110, y: Q.L.arena.gy * TS - 70, w: 220, h: 70, tel: 0.4, life: 3, col: b.cfg.eclipse ? '#a15be0' : '#e0c070' }); b.skT = 3.4; Snd.play('flame'); }, upd: wait },
    teleport: { tele: 0.3, start(b) { addGhost(b, 'out'); Snd.play('poof'); b.hide = true; b.ph = 0; b.skT = 0.55; emit(b.x + b.w / 2, b.y + b.h / 2, 20, { col: ['#5a2d8f', '#a15be0', '#fff'], sp0: 20, sp1: 90 }); Snd.sting(); b.y = -300; },
      upd(b, dt) {
        b.skT -= dt; const P = Q.P, ar = Q.L.arena;
        if (b.ph === 0 && b.skT <= 0) { let nx = P.x + 4 + (Math.random() < 0.5 ? -1 : 1) * 70; nx = arenaClamp(nx); b.x = nx - b.w / 2; b.y = ar.gy * TS - b.h; b.vy = 0; b.hide = false; b.ph = 1; b.skT = 0.45; addGhost(b, 'in'); addRing(nx, b.y + b.h, '#a15be0', 50, 0.4); Snd.play('poof'); emit(nx, b.y + b.h / 2, 20, { col: ['#5a2d8f', '#a15be0', '#fff'], sp0: 20, sp1: 90 }); Snd.creature(Q.li, 'alert', true); }
        else if (b.ph === 1 && b.skT <= 0) { shockwave(b, true); return true; }
      } },
    breath: { tele: 0.7, start(b) { b.n = 10; b.skT = 0; Snd.play('flame'); }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0 && b.n > 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x), a = a0 + (b.n - 5) * 0.07; firePr(c.x, c.y, Math.cos(a) * 115, Math.sin(a) * 115, { boss: true, col: '#bfeaff', status: { slow: 1.8 }, life: 1.1 }); b.n--; b.skT = 0.06; } return b.n <= 0; } },
    wall: { tele: 0.6, start(b) {
      const P = Q.P, ar = Q.L.arena, tx = Math.floor((P.x + 4) / TS); Q.tmpCells = Q.tmpCells || [];
      for (const o of [-3, 3]) for (let k = 1; k <= 4; k++) { const X = tx + o, Y = ar.gy - k; if (X > ar.x0 + 1 && X < ar.x1 - 1 && Q.L.grid[Y][X] === ' ') { Q.L.grid[Y][X] = 'I'; Q.tmpCells.push([X, Y]); emit(X * TS + 8, Y * TS + 8, 4, { col: ['#bfeaff', '#fff'], sp0: 20, sp1: 60 }); } }
      Snd.play('gate'); b.skT = 4.2; b.shotT = 0.8; },
      upd(b, dt) { b.skT -= dt; b.shotT -= dt; if (b.shotT <= 0) { b.shotT = 0.9; const c = bc(b), P = Q.P, a = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); firePr(c.x, c.y, Math.cos(a) * 100, Math.sin(a) * 100, { boss: true, col: '#bfeaff', status: { slow: 1.5 } }); } if (b.skT <= 0) { cleanupCells(); return true; } } },
    blizzard: { tele: 0.6, start(b) { Q.windDir = Math.random() < 0.5 ? -1 : 1; Q.windT = 4.5; b.skT = 4.5; b.drop = 0; Snd.play('flame'); }, upd(b, dt) { b.skT -= dt; b.drop -= dt; const ar = Q.L.arena; if (b.drop <= 0) { b.drop = 0.32; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: '#bfeaff', type: 'fall', boss: true }); } return b.skT <= 0; } },
    lavaCols: { tele: 0.6, start(b) {
      const P = Q.P, xs = [P.x + 4, P.x + 4 - 46 + rr(0, 10), P.x + 4 + 46 - rr(0, 10), P.x + 4 + (Math.random() < 0.5 ? -92 : 92)];
      xs.forEach((x, i) => { x = arenaClamp(x); addZone({ type: 'lava', x: x - 9, y: groundYAt(x) - 70, w: 18, h: 70, tel: 0.85 + i * 0.1, life: 0.7 }); }); b.skT = 2.2; }, upd: wait },
    meteor: { tele: 0.6, start(b) { const P = Q.P; for (let i = 0; i < 5; i++) { const x = arenaClamp(P.x + 4 + (i === 0 ? 0 : rr(-110, 110))); addZone({ type: 'meteor', x: x - 12, y: groundYAt(x) - 30, w: 24, h: 30, tel: 0.9 + i * 0.35, life: 0.3 }); } b.skT = 2.8; }, upd: wait },
    sweep: { tele: 0.7, start(b) { const ar = Q.L.arena, dir = Q.P.x < (ar.x0 + ar.x1) / 2 * TS ? 1 : -1, sx = dir > 0 ? ar.x0 * TS + 12 : ar.x1 * TS - 12; addZone({ type: 'sweep', x: sx - 8, y: ar.gy * TS - 64, w: 16, h: 64, tel: 0.9, life: 3.4, vx: dir * 95 }); b.skT = 4.0; Snd.play('flame'); }, upd: wait },
    dark: { tele: 0.6, start(b) { Q.darkBoost = 0.75; Q.darkBoostT = 7; const ar = Q.L.arena; for (let i = 0; i < 2; i++) { const m = makeEnemy('shadewisp', (ar.x0 + 6 + i * 18) * TS, (ar.gy - 4) * TS, { minion: true }); m.alerted = true; Q.ents.push(m); } Snd.whisper(); b.skT = 1.0; }, upd: wait },
    slam: { tele: 0.8, start(b) { b.vy = -250; b.vx = 0; b.onGround = false; b.jt = 0; b.ph = 0; },
      upd(b, dt) {
        b.jt += dt;
        if (b.ph === 0 && b.vy > 0) { b.ph = 1; b.vy = 540; Snd.play('whoosh'); }
        if (b.ph === 1 && b.onGround) { shockwave(b); const c = bc(b); for (let i = 1; i <= 4; i++) for (const sg of [-1, 1]) { const x = arenaClamp(c.x + sg * i * 24); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 30, w: 14, h: 30, tel: 0.15 + i * 0.08, life: 0.4 }); } return true; }
      } },
    roar: { tele: 0.6, start(b) { Q.shake = 0.9; Snd.creature(Q.li, 'alert', true); const c = bc(b); addRing(c.x, b.y + b.h, Q.B.proj, 95, 0.7); shockwave(b, true); b.kick = 0.16; b.skT = 1.0; b.rt = 0; }, upd(b, dt) { b.skT -= dt; b.rt -= dt; if (b.rt <= 0 && b.skT > 0.3) { b.rt = 0.28; addRing(b.x + b.w / 2, b.y + b.h, Q.B.proj, 70, 0.5); } return b.skT <= 0; } },
    guard: { tele: 0.4, start(b) { b.guard = 3; b.skT = 3; b.recAfter = 0.4; Snd.play('gate'); addRing(b.x + b.w / 2, b.y + b.h, '#6ee7f2', 50, 0.5); }, upd: wait },
    cloak: { tele: 0.5, start(b) { b.cloak = true; b.skT = 3.0; b.ph = 0; addGhost(b, 'out'); Snd.whisper(); Snd.play('poof'); },
      upd(b, dt) {
        const P = Q.P, c = bc(b), dx = (P.x + 4) - c.x;
        if (b.ph === 0) {
          b.skT -= dt; b.dir = dx < 0 ? -1 : 1; moveX(b, b.dir * b.cfg.sp * 1.7 * dt);
          if (Math.random() < 0.3) emit(c.x + rr(-b.w / 2, b.w / 2), b.y + b.h, 1, { col: ['#a15be0', '#fff'], sp0: 3, sp1: 14, grav: -10, l0: 0.3, l1: 0.6 });
          if (Math.abs(dx) < 48 || b.skT <= 0) { b.ph = 1; b.cloak = false; b.revT = 0.3; b.vy = -210; b.onGround = false; b.jt = 0; b.vx = 0; addGhost(b, 'in'); Snd.creature(Q.li, 'attack', true); Snd.play('poof'); }
        } else { b.jt += dt; if (b.onGround && b.jt > 0.15) { shockwave(b); return true; } }
      } },
    clone: { tele: 0.6, start(b) { const ar = Q.L.arena; for (let i = 0; i < 2; i++) { const m = makeEnemy('eclipseclone', (ar.x0 + 8 + i * 14) * TS, ar.gy * TS, { minion: true, v: 'big' }); m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 14, { col: ['#a15be0', '#fff'], sp0: 20, sp1: 80 }); } Snd.creature(Q.li, 'alert', true); b.skT = 0.9; }, upd: wait }
  };
  function groundYAt(x) { const tx = Math.floor(x / TS); for (let ty = 3; ty < Q.L.H; ty++) if (solid(tx, ty)) return ty * TS; return Q.L.arena.gy * TS; }
  const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush', 'slam', 'cloak'], RANGED = ['shoot', 'web', 'spit', 'curse', 'breath', 'rain', 'beam', 'meteor', 'lavaCols', 'sweep', 'spin'];
  function pickSkill(b) {
    const c = b.cfg, P = Q.P; let list = c.skills.slice();
    if (b.phase >= 1 && c.skills2) list = list.concat(c.skills2);
    if (b.phase >= 2 && c.skills3) list = list.concat(c.skills3);
    const dist = Math.abs(P.x + 4 - (b.x + b.w / 2));
    let tot = 0; const ws = list.map(k => {
      let w = 1; if (dist < 60 && MELEE.indexOf(k) >= 0) w *= 2.2; if (dist > 150 && RANGED.indexOf(k) >= 0) w *= 2; if (k === b.lastSk) w *= 0.12;
      if ((k === 'shield' || k === 'summon' || k === 'dark' || k === 'clone' || k === 'guard' || k === 'cloak') && Q.t - (b['u_' + k] || -99) < 12) w *= 0.08;
      tot += w; return w;
    });
    let r = Math.random() * tot; for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
    return list[0];
  }
  function endSkill(b) { b.st = 'rec'; b.timer = (b.recAfter || 0.8) / b.fury; b.recAfter = 0; b.lastSk = b.sk; b.sk = null; }
  function updateBoss(dt) {
    const b = Q.boss; if (!b || b.dead) return;
    const P = Q.P, c = b.cfg;
    b.t += dt; if (b.flash > 0) b.flash -= dt; if (b.shield > 0) b.shield -= dt; if (b.evCd > 0) b.evCd -= dt; if (b.invul > 0) b.invul -= dt;
    if (b.squashT > 0) b.squashT -= dt; if (b.kick > 0) b.kick -= dt; if (b.guard > 0) b.guard -= dt; if (b.revT > 0) b.revT -= dt; if (b.moveT > 0) b.moveT -= dt;
    b.fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7;
    if (b.st === 'sleep') return;
    if (b.st === 'intro') { b.timer += dt; if (b.timer > 2.2) { b.st = 'wait'; b.timer = 0.8; Q.state = 'play'; } return; }
    const pct = b.hp / b.max, ph = pct < 0.33 ? 2 : (pct < 0.66 ? 1 : 0);
    if (ph > b.phase) { b.phase = ph; b.invul = 1.0; Q.shake = 0.8; Snd.creature(Q.li, 'alert', true); emit(b.x + b.w / 2, b.y + b.h / 2, 30, { col: ['#fff', Q.B.proj], sp0: 40, sp1: 160 }); Q.msg = save.lang === 'vi' ? 'Boss nổi điên!' : 'The boss is enraged!'; Q.msgT = 3; }
    if (b.hide) { const sk = BS[b.sk]; if (sk && sk.upd(b, dt)) endSkill(b); return; }
    b.vy = Math.min(420, b.vy + GRAV * dt);
    const cxm = b.x + b.w / 2, cym = b.y + b.h / 2, dxp = (P.x + 4) - cxm;
    switch (b.st) {
      case 'wait': {
        b.dir = dxp < 0 ? -1 : 1;
        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * c.sp * b.fury * dt); b.moveT = 0.12; }
        // intelligence: dodge incoming attacks
        const threat = (P.atk > 0 && Math.abs(dxp) < b.w / 2 + 36) || Q.fps.some(p => p.t !== 'blast' && p.t !== 'wave' && Math.abs(p.x - cxm) < b.w / 2 + 46 && Math.abs(p.y - cym) < b.h / 2 + 18 && (p.vx > 0) === (cxm > p.x));
        if (threat && b.evCd <= 0 && Math.random() < c.smart * dt * 9) {
          b.st = 'evade'; b.skT = 0.34; b.evCd = 2.4 - c.smart; b.ed = dxp < 0 ? 1 : -1;
          const ar = Q.L.arena; if ((b.ed > 0 && cxm > ar.x1 * TS - 50) || (b.ed < 0 && cxm < ar.x0 * TS + 50)) { b.ed = -b.ed; b.vy = -280; b.onGround = false; }
          emit(cxm, b.y + b.h, 6, { col: '#cfd6e6', sp0: 20, sp1: 60, vy: -10 }); break;
        }
        b.closeT = Math.abs(dxp) < b.w / 2 + 22 ? b.closeT + dt : 0;
        b.timer -= dt;
        if (b.timer <= 0 || b.closeT > 1.5) {
          b.atkSk = b.closeT > 1.5 ? 'stomp' : pickSkill(b); b.closeT = 0; b['u_' + b.atkSk] = Q.t;
          b.st = 'tele'; b.timer = BS[b.atkSk].tele / b.fury; Snd.creature(Q.li, 'attack', true);
        }
        break;
      }
      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; } break;
      case 'act': { const sk = BS[b.sk]; if (sk.upd(b, dt)) endSkill(b); break; }
      case 'evade': {
        b.skT -= dt; moveX(b, b.ed * 215 * dt);
        if (Math.random() < 0.6) emit(cxm, b.y + b.h - 2, 1, { col: '#cfd6e6', sp0: 5, sp1: 25, vy: -8, grav: 20 });
        if (b.skT <= 0) { if (Math.random() < 0.3) { b.atkSk = 'stomp'; b.st = 'tele'; b.timer = 0.3; } else { b.st = 'rec'; b.timer = 0.25; } }
        break;
      }
      case 'stun': b.stunT -= dt; if (Math.random() < 0.3) emit(cxm + rr(-b.w / 3, b.w / 3), b.y, 1, { col: ['#ffd34e', '#fff'], sp0: 5, sp1: 30, grav: 60 }); if (b.stunT <= 0) { b.st = 'wait'; b.timer = 0.6; } break;
      case 'rec': b.timer -= dt; if (b.timer <= 0) { b.st = 'wait'; b.timer = 0.65 / b.fury; } break;
    }
    { const was = b.onGround, pvy = b.vy; moveY(b, b.vy * dt); if (b.onGround && !was && pvy > 140) { b.squashT = 0.22; addRing(cxm, b.y + b.h, '#cfd6e6', 34 + Math.min(40, pvy / 9), 0.4); emit(cxm, b.y + b.h, 8, { col: '#cfd6e6', sp0: 20, sp1: 70, vy: -15, grav: 40 }); } }
    if (!b.hide && ov(P, { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 })) hurtPlayer(Q.li >= 3 ? 2 : 1, cxm);
  }

  // ===================== ANIMATION / EFFECTS =====================
  function addRing(x, y, col, max, dur) { Q.rings.push({ x, y, col, max: max || 60, dur: dur || 0.45, t: 0 }); }
  function addGhost(b, type) { Q.ghosts.push({ spr: b.spr, x: b.x + b.w / 2, bot: b.y + b.h, flip: b.dir < 0, type, t: 0, dur: 0.32 }); }
  function drawSprT(gc, spr, x, bot, flip, flash, sx, sy, rot, alpha) {
    const img = flash ? (flip ? spr.fw : spr.cw) : (flip ? spr.f : spr.c);
    gc.save(); gc.translate(Math.round(x), Math.round(bot)); if (rot) gc.rotate(rot); if (alpha !== undefined && alpha < 1) gc.globalAlpha = Math.max(0, alpha);
    gc.drawImage(img, -spr.w * sx / 2, -spr.h * sy + sx, spr.w * sx, spr.h * sy); gc.restore();
  }
  function drawAura(x, y, r, col, a) {
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col + Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0')); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over';
  }
  function drawCircle(x, y, r, col, t) {
    g.fillStyle = col; g.globalAlpha = 0.75;
    for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.22), 2, 1); }
    for (let i = 0; i < 8; i++) { const a = t * 1.5 + i * Math.PI / 4; g.fillRect(Math.round(x + Math.cos(a) * (r - 6)), Math.round(y + Math.sin(a) * (r - 6) * 0.22) - 1, 2, 3); }
    g.globalAlpha = 1;
  }
  function updateFx(dt) {
    for (const r of Q.rings) r.t += dt; Q.rings = Q.rings.filter(r => r.t < r.dur);
    for (const o of Q.ghosts) o.t += dt; Q.ghosts = Q.ghosts.filter(o => o.t < o.dur);
    for (const c of Q.corpses) { c.t += dt; c.x += c.vx * dt; c.bot += c.vy * dt; c.vy += 520 * dt; c.rot += c.rv * dt; } Q.corpses = Q.corpses.filter(c => c.t < 0.6);
  }
  function drawFx(camX, camY) {
    for (const r of Q.rings) {
      const k = r.t / r.dur, rd = r.max * (1 - Math.pow(1 - k, 2)), n = Math.max(16, Math.round(rd * 1.2)), x = r.x - camX, y = r.y - camY;
      g.globalAlpha = 1 - k; g.fillStyle = r.col;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * rd), Math.round(y + Math.sin(a) * rd * 0.22), 2, 1); }
      g.globalAlpha = 1;
    }
    for (const o of Q.ghosts) {
      const k = o.t / o.dur, out = o.type === 'out', a = out ? 1 - k : k, sx = out ? 1 - 0.55 * k : 0.45 + 0.55 * k, sy = out ? 1 + 0.5 * k : 1.5 - 0.5 * k;
      drawSprT(g, o.spr, o.x - camX, o.bot - camY, o.flip, o.type === 'in' && k < 0.4, sx, sy, 0, a);
    }
    for (const c of Q.corpses) {
      const k = c.t / 0.6, sc = c.sc * (1 - 0.65 * k);
      drawSprT(g, c.spr, c.x - camX, c.bot - camY, c.flip, c.t < 0.09, sc, sc, c.rot, 1 - k);
    }
  }
  const SLAM_L = ['jump', 'stomp', 'bounce3', 'slam', 'ambush'], RANGE_L = ['shoot', 'web', 'spit', 'curse', 'breath', 'spin', 'rain', 'beam'], CAST_L = ['summon', 'splitslime', 'goo', 'erupt', 'tornado', 'dark', 'clone', 'meteor', 'lavaCols', 'sweep', 'roar', 'wall', 'blizzard'];
  function bossPose(b) {
    const t = b.t, dir = b.dir < 0 ? -1 : 1, sk = b.st === 'tele' ? b.atkSk : b.sk, br = Math.sin(t * 3);
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al = 1, aura = null, circle = false;
    if (b.st === 'wait') { if (b.moveT > 0) { sy = 1 + 0.035 * Math.sin(t * 11); rot = dir * 0.045 * Math.sin(t * 11); oy = -Math.abs(Math.sin(t * 11)) * 2.2; } else { sy = 1 + 0.025 * br; sx = 1 - 0.015 * br; } }
    else if (b.st === 'tele' && BS[b.atkSk]) {
      const k = clamp(1 - b.timer / (BS[b.atkSk].tele / b.fury), 0, 1), j = (Math.random() - 0.5) * 2 * k;
      if (SLAM_L.indexOf(sk) >= 0) { sy = 1 - 0.22 * k; sx = 1 + 0.14 * k; ox = j * 1.2; }
      else if (sk === 'charge') { rot = -dir * 0.16 * k; sx = 1 + 0.06 * k; ox = -dir * 3 * k + j; }
      else if (RANGE_L.indexOf(sk) >= 0) { sy = 1 + 0.08 * k; sx = 1 - 0.05 * k; oy = -2 * k; rot = -dir * 0.07 * k; aura = [Q.B.proj, 0.5 * k]; }
      else if (sk === 'guard' || sk === 'shield') { sy = 1 - 0.1 * k; sx = 1 + 0.1 * k; aura = ['#6ee7f2', 0.5 * k]; }
      else if (sk === 'cloak' || sk === 'teleport') { sx = 1 - 0.3 * k; sy = 1 + 0.1 * k; al = 1 - 0.55 * k; aura = ['#a15be0', 0.5 * k]; }
      else { oy = -5 * k; sy = 1 + 0.1 * k; rot = j * 0.05; aura = [Q.B.proj, 0.6 * k]; circle = true; }
    } else if (b.st === 'act') {
      if (SLAM_L.indexOf(b.sk) >= 0 && !b.onGround) { const st = clamp(Math.abs(b.vy) / 1400, 0, 0.2); sy = 1 + st; sx = 1 - st * 0.7; rot = dir * 0.05; }
      else if (b.sk === 'charge') { sx = 1.14; sy = 0.92; rot = dir * 0.2; }
      else if (b.sk === 'guard' || b.sk === 'shield') { sy = 0.92; sx = 1.08; }
      else if (CAST_L.indexOf(b.sk) >= 0) { oy = -4 + Math.sin(t * 6) * 1.2; sy = 1.05; circle = true; aura = [Q.B.proj, 0.35]; }
      else if (RANGE_L.indexOf(b.sk) >= 0) { sy = 1.03; aura = [Q.B.proj, 0.25]; }
    } else if (b.st === 'rec') { sy = 0.95 + 0.02 * Math.sin(t * 5); sx = 1.04; }
    else if (b.st === 'stun') { rot = Math.sin(t * 14) * 0.12; sy = 0.9; sx = 1.06; }
    else if (b.st === 'evade') { rot = (b.ed || 1) * -0.2; sx = 1.08; sy = 0.94; }
    else if (b.st === 'intro') { const k = Math.min(1, b.timer / 1.2); sy = 0.8 + 0.2 * k; sx = 1.1 - 0.1 * k; aura = [Q.B.proj, 0.4 * (1 - k)]; }
    if (b.squashT > 0) { const k = b.squashT / 0.22; sy *= 1 - 0.32 * k; sx *= 1 + 0.28 * k; }
    if (b.kick > 0) { const k = b.kick / 0.16; sx *= 1 + 0.12 * k; ox -= dir * 3 * k; }
    if (b.cloak) al = 0.1 + 0.07 * Math.sin(t * 9);
    if (b.guard > 0) { sx *= 1.05; sy *= 0.94; }
    return { sx, sy, rot, ox, oy, al, aura, circle };
  }

  // ===================== DRAGON =====================
  const dc = d => ({ x: d.x + d.w / 2, y: d.y + d.h / 2 });
  const dHover = d => d.tr.gy * TS - 50 - d.h * 0.45, dLow = d => d.tr.gy * TS - 24;
  function dMove(d, tx, ty, k, dt) { const f = Math.min(1, k * dt); d.x += (tx - d.w / 2 - d.x) * f; d.y += (ty - d.h / 2 - d.y) * f; }
  function dMouth(d) { return { x: d.x + d.w / 2 + d.dir * d.w * 0.46, y: d.y + d.h * 0.4 }; }
  function dFire(d, a, sp, o) { const m = dMouth(d); firePr(m.x, m.y, Math.cos(a) * sp, Math.sin(a) * sp, Object.assign({ boss: true, fl: true, silent: true, life: 0.85, col: '#ff9a2a' }, o || {})); }
  function dHold(d, dt, ty) { const P = Q.P; d.dir = (P.x + 4) < dc(d).x ? -1 : 1; dMove(d, clamp(P.x + 4 + Math.sin(d.t * 0.9) * 60, (d.tr.lw + 2) * TS, (d.tr.rw - 2) * TS), (ty || dHover(d)) + Math.sin(d.t * 2) * 5, 1.4, dt); }
  const DS = {
    fireballs: { tele: 0.7, start(d) { d.n = 3 + (d.stage >= 1 ? 1 : 0) + (d.def.kind === 'map6' ? 1 : 0); d.skT = 0; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; if (d.skT <= 0) { const m = dMouth(d), P = Q.P, a = Math.atan2(P.y + 7 - m.y, P.x + 4 - m.x); firePr(m.x, m.y, Math.cos(a) * 120, Math.sin(a) * 120, { boss: true, fl: true, col: '#ff9a2a', life: 3 }); Snd.play('flame'); d.n--; d.skT = 0.45; } return d.n <= 0; } },
    breath: { tele: 0.85, start(d) { d.skT = 1.4; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.4, a = d.sdir > 0 ? 0.3 + k * 0.95 : Math.PI - 0.3 - k * 0.95;
      if (d.fireT <= 0) { d.fireT = 0.035; dFire(d, a, 150); } return d.skT <= 0; } },
    tripleBreath: { tele: 0.9, start(d) { d.skT = 1.4; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.4, a = d.sdir > 0 ? 0.25 + k * 0.9 : Math.PI - 0.25 - k * 0.9;
      if (d.fireT <= 0) { d.fireT = 0.05; for (const o of [-0.45, 0, 0.45]) dFire(d, a + o * d.sdir, 150); } return d.skT <= 0; } },
    shadowBreath: { tele: 0.9, start(d) { d.skT = 1.5; d.sdir = (Q.P.x + 4) < dc(d).x ? -1 : 1; d.fireT = 0; Snd.play('breath'); Snd.whisper(); }, upd(d, dt) {
      dMove(d, dc(d).x, dHover(d), 2, dt); d.dir = d.sdir; d.skT -= dt; d.fireT -= dt; const k = 1 - d.skT / 1.5, a = d.sdir > 0 ? 0.25 + k * 0.9 : Math.PI - 0.25 - k * 0.9;
      if (d.fireT <= 0) { d.fireT = 0.05; for (const o of [-0.3, 0.3]) dFire(d, a + o * d.sdir, 140, { col: '#a15be0', onLand: 'poison', life: 1.2 }); } return d.skT <= 0; } },
    dive: { tele: 0.7, start(d) { const tr = d.tr, P = Q.P; d.ph = 0; d.skT = 0.7; d.side = (P.x + 4) < (tr.lw + tr.rw) / 2 * TS ? 1 : -1; d.sx = d.side > 0 ? (tr.lw + 4) * TS : (tr.rw - 4) * TS; d.ex = d.side > 0 ? (tr.rw - 3) * TS : (tr.lw + 3) * TS; d.dir = d.side; },
      upd(d, dt) {
        const c = dc(d);
        if (d.ph === 0) { dMove(d, d.sx, dHover(d) - 14, 5, dt); d.skT -= dt; if (d.skT <= 0) { d.ph = 1; d.skT = 0.42; d.px = c.x; d.py = c.y; Snd.creature('dragon', 'attack', true); } }
        else if (d.ph === 1) { d.skT -= dt; const k = 1 - Math.max(0, d.skT) / 0.42, tx = d.px + d.side * 90, ty = lerp(d.py, dLow(d), k * k); d.x = lerp(d.px, tx, k) - d.w / 2; d.y = ty - d.h / 2; if (d.skT <= 0) { d.ph = 2; Snd.play('flap'); } }
        else if (d.ph === 2) { d.x += d.side * 280 * dt; d.y += (dLow(d) - d.h / 2 - d.y) * Math.min(1, 8 * dt); if (Math.random() < 0.6) emit(c.x, c.y + 8, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 25, grav: 20 }); if ((d.side > 0 && c.x >= d.ex) || (d.side < 0 && c.x <= d.ex)) { d.ph = 3; d.skT = 0.6; } }
        else { d.skT -= dt; dMove(d, d.ex - d.side * 40, dHover(d), 4, dt); return d.skT <= 0; }
      } },
    perch: { tele: 0.6, start(d) { d.ph = 0; d.skT = 0.7; d.perchT = 3.0; d.fireT = 0.6; }, upd(d, dt) {
      const P = Q.P, c = dc(d);
      if (d.ph === 0) { d.dir = (P.x + 4) < c.x ? -1 : 1; dMove(d, clamp(P.x + 4 - d.dir * 70, (d.tr.lw + 3) * TS, (d.tr.rw - 3) * TS), d.tr.gy * TS - d.h / 2, 3, dt); d.skT -= dt; if (d.skT <= 0) { d.ph = 1; Q.shake = 0.5; Snd.play('boom'); } }
      else if (d.ph === 1) { d.perchT -= dt; d.fireT -= dt; d.dir = (P.x + 4) < c.x ? -1 : 1; if (d.fireT <= 0) { d.fireT = 0.55; for (const o of [-0.12, 0, 0.12]) dFire(d, (d.dir > 0 ? 0 : Math.PI) + o, 120, { life: 0.55 }); Snd.play('flame'); } if (d.perchT <= 0) { d.ph = 2; d.skT = 0.5; Q.windDir = d.dir; Q.windT = 1.2; Snd.play('flap'); } }
      else { d.skT -= dt; dMove(d, c.x, dHover(d), 5, dt); return d.skT <= 0; } } },
    gust: { tele: 0.6, start(d) { d.skT = 1.7; d.gT = 0.5; Q.windDir = (Q.P.x + 4) < dc(d).x ? -1 : 1; Q.windT = 2.6; Snd.play('flap'); }, upd(d, dt) { dHold(d, dt); d.skT -= dt; d.gT -= dt; if (d.gT <= 0) { d.gT = 0.7; const m = dMouth(d), P = Q.P, a = Math.atan2(P.y + 7 - m.y, P.x + 4 - m.x); firePr(m.x, m.y, Math.cos(a) * 115, Math.sin(a) * 115, { boss: true, fl: true, col: '#ff9a2a', life: 3 }); } if (Math.random() < 0.5) emit(Q.cam.x + rr(0, VW), Q.cam.y + rr(0, 60), 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 20, vx: -Q.windDir * 80, vy: 40, grav: 0 }); return d.skT <= 0; } },
    roar: { tele: 0.6, start(d) { d.skT = 1.1; d.rT = 0; Q.shake = 1; Snd.creature('dragon', 'alert', true); }, upd(d, dt) {
      dHold(d, dt); d.skT -= dt; d.rT -= dt;
      if (d.rT <= 0 && d.skT > 0.2) { d.rT = 0.5; const c = dc(d), gt = d.tr.gy * TS; for (const sgn of [-1, 1]) Q.projs.push({ x: c.x + sgn * 14, y: gt - 6, vx: sgn * 105, vy: 0, life: 2, grav: 0, col: '#ff9a2a', type: 'wave', boss: true }); Q.shake = 0.4; } return d.skT <= 0; } },
    tailsweep: { tele: 0.5, start(d) { const c = dc(d), gt = d.tr.gy * TS; addZone({ type: 'beam', x: c.x - 95, y: gt - 12, w: 190, h: 12, tel: 0.55, life: 0.4, col: '#ff6a3a' }); d.skT = 1.1; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } },
    summon: { tele: 0.6, start(d) { const c = dc(d); for (let i = 0; i < 3; i++) { const m = makeEnemy('imp', c.x + (i - 1) * 34, c.y, { minion: true }); m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: ['#ffd34e', '#f08a2b'] }); } Snd.creature('imp', 'alert'); d.skT = 0.9; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } },
    vanish: { tele: 0.4, start(d) { d.hide = true; d.ph = 0; d.skT = 0.7; emit(dc(d).x, dc(d).y, 24, { col: ['#a15be0', '#14121f', '#ff3aff'], sp0: 20, sp1: 100 }); Snd.sting(); Q.darkBoost = 0.55; Q.darkBoostT = 4; },
      upd(d, dt) { d.skT -= dt; if (d.ph === 0 && d.skT <= 0) { const tr = d.tr, nx = rr((tr.lw + 6) * TS, (tr.rw - 6) * TS); d.x = nx - d.w / 2; d.y = dHover(d) - d.h / 2; d.hide = false; d.ph = 1; d.skT = 0.5; emit(nx, dHover(d), 24, { col: ['#a15be0', '#fff', '#ff3aff'], sp0: 20, sp1: 100 }); Snd.creature('dragon', 'alert', true); } else if (d.ph === 1 && d.skT <= 0) return true; } },
    darkness: { tele: 0.7, start(d) { Q.darkBoost = 0.78; Q.darkBoostT = 7; const tr = d.tr; for (let i = 0; i < 2; i++) { const m = makeEnemy('shadewisp', (tr.lw + 8 + i * 16) * TS, (tr.gy - 4) * TS, { minion: true }); m.alerted = true; Q.ents.push(m); } Snd.whisper(); d.skT = 1.2; }, upd(d, dt) { dHold(d, dt); d.skT -= dt; return d.skT <= 0; } }
  };
  function makeDragon(def) {
    const cfg = DRG[def.kind], st = cfg.stages[0], cx = (def.lw + def.rw) / 2 * TS;
    return { isBoss: true, isDragon: true, def, tr: def, stage: 0, form: st.form, w: st.w, h: st.h, x: cx - st.w / 2, y: Q.cam.y - st.h - 80, vx: 0, vy: 0, hp: st.hp, max: st.hp, armor: st.armor, cfg: { name: NPCS.dragon.name, armor: st.armor }, skills: st.skills, sp: st.sp, dir: -1, st: 'enter', timer: 1.8, t: 0, flash: 0, invul: 0, wing: 0, flapT: 0, sk: null, lastSk: null, evCd: 1, fury: 1, hide: false };
  }
  function setStage(d, i) { const st = DRG[d.def.kind].stages[i], cx = dc(d).x, cy = dc(d).y; d.stage = i; d.form = st.form; d.w = st.w; d.h = st.h; d.hp = d.max = st.hp; d.armor = st.armor; d.cfg.armor = st.armor; d.skills = st.skills; d.sp = st.sp; d.x = cx - d.w / 2; d.y = cy - d.h / 2; }
  function hurtDragon(d, dmg, pierce) {
    if (d.invul > 0 || d.dead || d.hide || d.st === 'enter' || d.st === 'talk' || d.st === 'morph' || d.st === 'flee' || d.st === 'flee0') return;
    const arm = d.armor * ((d.st === 'act' && d.sk === 'perch' && d.ph === 1) || d.st === 'rec' ? 0.55 : 1), eff = dmg * (1 - arm * (pierce ? 0.4 : 1));
    d.hp -= eff; d.flash = 0.1; Q.shake = Math.max(Q.shake, 0.15);
    Snd.creature('dragon', d.hp <= 0 ? 'die' : 'hurt', true);
    emit(d.x + d.w / 2, d.y + d.h / 2, 8, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
    if (d.def.kind === 'young') { if (d.hp <= d.max * 0.25) startFlee(d); }
    else if (d.hp <= 0) { d.hp = 0; if (d.stage < 2) startMorph(d); else startDragonDeath(d); }
  }
  function startFlee(d) {
    d.st = 'flee0'; d.invul = 99; Q.projs.length = 0; Q.zones.length = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); setEmo('angry', 2);
    startScripted('dragon', DRG_DLG.young_flee, () => { d.st = 'flee'; d.timer = 2.0; d.dir = 1; Snd.creature('dragon', 'attack', true); });
  }
  function startMorph(d) {
    d.st = 'morph'; d.invul = 99; Q.projs.length = 0; Q.zones.length = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); Q.shake = 1; Snd.creature('dragon', 'alert', true);
    startScripted('dragon', DRG_DLG.morph[d.stage], () => { setStage(d, d.stage + 1); d.invul = 1.6; d.st = 'hover'; d.timer = 1.2; Q.shake = 1.2; Snd.creature('dragon', 'alert', true); if (d.form === 3) { Snd.whisper(); Q.darkBoost = 0.5; Q.darkBoostT = 3; } emit(dc(d).x, dc(d).y, 50, { col: d.form === 3 ? ['#a15be0', '#ff3aff', '#fff'] : ['#ffd34e', '#f08a2b', '#fff'], sp0: 40, sp1: 180 }); });
  }
  function startDragonDeath(d) { d.dead = true; d.deadT = 0; d.booms = 0; Q.projs.length = 0; Q.zones.length = 0; Q.windT = 0; Q.ents.forEach(e => { if (e.minion) e.dead = true; }); Snd.stop(); Snd.creature('dragon', 'die', true); }
  function finishDragon(d) {
    const tr = d.tr; Q.dragonsDone.add(tr.id); const dr = Q.dragons.find(o => o.id === tr.id); if (dr) dr.state = 'done';
    for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = ' '; Q.L.grid[y][tr.rw] = ' '; }
    Q.dragon = null; Q.projs.length = 0; Q.zones.length = 0; Q.darkBoost = 0; Q.windT = 0; Snd.music('lvl' + Q.li, Q.B.music); Snd.play('relic'); setEmo('happy', 3);
    const cx = (tr.lw + tr.rw) / 2 * TS;
    for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 14, y: tr.gy * TS - 40, id: -1, vy: -140, vx: i ? 30 : -30, ph: 0, drop: true });
    for (let i = 0; i < 14; i++) Q.items.push({ kind: 'coin', x: cx + rr(-30, 30), y: tr.gy * TS - 40, id: -1, vy: -rr(80, 180), vx: rr(-60, 60), ph: 0, drop: true });
    Q.items.push({ kind: 'pk', what: 'flask', amt: 2, keep: false, x: cx, y: tr.gy * TS - 40, id: -1, vy: -150, vx: 0, ph: 0, drop: true });
    Q.msg = save.lang === 'vi' ? 'Con rồng đã rời đi... đồ rơi vương vãi!' : 'The dragon is gone... loot everywhere!'; Q.msgT = 4;
  }
  function pickDS(d) {
    const P = Q.P, c = dc(d), dist = Math.abs(P.x + 4 - c.x); let tot = 0;
    const ws = d.skills.map(k => { let w = 1; if (k === d.lastSk) w *= 0.1; if (dist > 140 && (k.indexOf('reath') >= 0 || k === 'fireballs')) w *= 2; if (dist < 60 && (k === 'dive' || k === 'gust' || k === 'roar' || k === 'tailsweep')) w *= 2.2; if ((k === 'darkness' || k === 'summon' || k === 'perch') && Q.t - (d['u_' + k] || -99) < 14) w *= 0.1; tot += w; return w; });
    let r = Math.random() * tot; for (let i = 0; i < d.skills.length; i++) { r -= ws[i]; if (r <= 0) return d.skills[i]; } return d.skills[0];
  }
  function updateDragon(dt) {
    const d = Q.dragon; if (!d) return;
    const P = Q.P, tr = d.tr;
    d.t += dt; if (d.flash > 0) d.flash -= dt; if (d.invul > 0 && d.invul < 50) d.invul -= dt; if (d.evCd > 0) d.evCd -= dt;
    d.flapT -= dt; if (d.flapT <= 0 && !d.dead && !(d.st === 'act' && d.sk === 'perch' && d.ph === 1)) { d.flapT = 0.6; Snd.play('flap'); }
    d.wing = Math.floor(d.t * ((d.st === 'act' && d.sk === 'perch' && d.ph === 1) ? 3 : 6)) % 2;
    d.fury = 1 + (1 - d.hp / d.max) * 0.45;
    if (d.dead) {
      d.deadT += dt; d.y += 40 * dt; d.x += rr(-1, 1);
      if (d.booms < 8 && d.deadT > d.booms * 0.22) { d.booms++; Snd.play('boom'); emit(d.x + rr(0, d.w), d.y + rr(0, d.h), 24, { col: ['#fff', '#ffd34e', '#f08a2b', '#a15be0'], sp0: 30, sp1: 160 }); Q.shake = 0.6; }
      if (d.deadT > 2.3 && !d.dlg) { d.dlg = true; startScripted('dragon', DRG_DLG.death, () => finishDragon(d)); }
      return;
    }
    const c = dc(d);
    switch (d.st) {
      case 'enter': d.timer -= dt; dMove(d, (tr.lw + tr.rw) / 2 * TS, dHover(d), 2.2, dt); if (Math.random() < 0.3) emit(c.x + rr(-20, 20), c.y, 1, { col: ['#ffd34e', '#f08a2b'], sp0: 5, sp1: 30, grav: 30 });
        if (d.timer <= 0) { d.st = 'talk'; startScripted('dragon', d.def.kind === 'young' ? DRG_DLG.young_intro : DRG_DLG.map6_intro, () => { d.st = 'hover'; d.timer = 0.9; Snd.music('boss', BOSS_MUSIC); }); } break;
      case 'talk': break;
      case 'hover': case 'rec': {
        dHold(d, dt);
        const threat = (P.atk > 0 && Math.abs(P.x + 4 - c.x) < d.w / 2 + 40 && Math.abs(P.y + 7 - c.y) < 60) || Q.fps.some(p => p.t !== 'blast' && Math.abs(p.x - c.x) < d.w / 2 + 50 && Math.abs(p.y - c.y) < d.h / 2 + 24);
        if (threat && d.evCd <= 0 && Math.random() < 0.55 * dt * 9) { d.evCd = 1.6; d.dodgeT = 0.3; d.dvx = (c.x < P.x + 4 ? -1 : 1) * 240; d.dvy = -40; emit(c.x, c.y, 6, { col: '#fff', sp0: 20, sp1: 60 }); }
        if (d.dodgeT > 0) { d.dodgeT -= dt; d.x += d.dvx * dt; d.y += d.dvy * dt; }
        d.timer -= dt;
        if (d.timer <= 0) {
          if (d.st === 'rec') { d.st = 'hover'; d.timer = 0.5 / d.fury; }
          else { d.atkSk = pickDS(d); d['u_' + d.atkSk] = Q.t; d.st = 'tele'; d.timer = DS[d.atkSk].tele / d.fury; Snd.creature('dragon', 'attack', true); }
        }
        break;
      }
      case 'tele': {
        d.timer -= dt; dHold(d, dt, d.atkSk === 'perch' ? dHover(d) - 10 : undefined); d.x += rr(-0.6, 0.6);
        if (Math.random() < 0.4) { const m = dMouth(d); emit(m.x, m.y, 1, { col: ['#ffd34e', '#ff6a3a'], sp0: 5, sp1: 25, grav: -10, l0: 0.2, l1: 0.4 }); }
        if (d.timer <= 0) { d.sk = d.atkSk; DS[d.sk].start(d); d.st = 'act'; } break;
      }
      case 'act': if (DS[d.sk].upd(d, dt)) { d.st = 'rec'; d.timer = 0.7 / d.fury; d.lastSk = d.sk; d.sk = null; } break;
      case 'flee0': case 'morph': dMove(d, c.x, dHover(d) - 10, 2, dt); break;
      case 'flee': d.timer -= dt; d.x += 200 * dt; d.y -= 140 * dt; if (d.timer <= 0) { finishDragon(d); return; } break;
    }
    if (d.st !== 'flee' && d.st !== 'enter') { d.x = clamp(d.x, (tr.lw + 1) * TS, tr.rw * TS - d.w); d.y = clamp(d.y, Q.cam.y - 30, tr.gy * TS - d.h / 2 - 2); }
    if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && ov(P, { x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 })) hurtPlayer(2, c.x);
  }
  function drawDragon(camX, camY) {
    const d = Q.dragon; if (!d || d.hide) return;
    const spr = dragonSprite(d.form, d.wing), cx = Math.round(d.x + d.w / 2 - camX), cy = Math.round(d.y + d.h / 2 - camY);
    if (d.form === 3) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.18 + Math.sin(d.t * 3) * 0.06; disc(g, cx, cy + 6, 48, '#7a2aff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (d.invul > 0 && d.invul < 50 && Math.floor(Q.t * 20) % 2 === 0) g.globalAlpha = 0.5;
    const img = d.flash > 0 ? (d.dir < 0 ? spr.fw : spr.cw) : (d.dir < 0 ? spr.f : spr.c);
    { let rot = 0, sy = 1, sx = 1; if (d.st === 'act' && d.sk === 'dive') rot = d.ph === 1 ? d.side * 0.5 : (d.ph === 2 ? d.side * 0.12 : 0); if (d.st === 'tele') { sy = 0.95; sx = 1.04; } if (d.st === 'act' && d.sk === 'perch' && d.ph === 1) { sy = 0.96; }
      g.save(); g.translate(cx, cy + 8); if (rot) g.rotate(rot); g.drawImage(img, -spr.w * sx / 2, -spr.h * sy / 2, spr.w * sx, spr.h * sy); g.restore(); }
    g.globalAlpha = 1;
    if (d.st === 'tele' || (d.st === 'act' && /reath/.test(d.sk || ''))) { const m = dMouth(d), mx = Math.round(m.x - camX), my = Math.round(m.y - camY); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(mx, my, 0, mx, my, 16); gr.addColorStop(0, d.form === 3 ? 'rgba(200,100,255,.7)' : 'rgba(255,170,40,.75)'); gr.addColorStop(1, 'rgba(255,100,20,0)'); g.fillStyle = gr; g.fillRect(mx - 16, my - 16, 32, 32); g.globalCompositeOperation = 'source-over'; }
  }
  function updateDragonEnc() {
    const P = Q.P;
    for (const dr of Q.dragons) {
      if (dr.state !== 'idle') continue;
      if (P.x > dr.trig * TS && P.x < dr.rw * TS - 8 && P.onGround) {
        dr.state = 'active'; for (let y = 0; y < dr.gy; y++) { Q.L.grid[y][dr.lw] = 'G'; Q.L.grid[y][dr.rw] = 'G'; }
        Q.dragon = makeDragon(dr); Snd.creature('dragon', 'alert', true); Snd.play('gate'); Q.shake = 1.2; setEmo('scared', 2.5);
      }
    }
  }

  // ===================== zones + statuses =====================
  function updateZones(dt) {
    const P = Q.P;
    for (const z of Q.zones) {
      z.t += dt; z.x += (z.vx || 0) * dt;
      if (!z.fired && z.t >= z.tel) {
        z.fired = true;
        if (z.type === 'meteor') { Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.3); emit(z.x + z.w / 2, z.y + z.h, 22, { col: ['#fff6c0', '#ffd34e', '#f08a2b'], sp0: 30, sp1: 130 }); }
        else if (z.type === 'spike' || z.type === 'lava') { Snd.play('crumble'); Q.shake = Math.max(Q.shake, 0.12); }
        else if (z.type === 'beam') { Snd.play('flame'); Q.shake = Math.max(Q.shake, 0.2); }
      }
      if (!(z.t >= z.tel && z.t < z.tel + z.life)) continue;
      const box = { x: z.x, y: z.y, w: z.w, h: z.h };
      if (z.type === 'poison') { z.tick = (z.tick || 0) - dt; if (ov(P, box) && z.tick <= 0) { z.tick = 0.9; hurtPlayer(1, z.x + z.w / 2, true); } }
      else if (z.type === 'goo') { if (ov(P, box)) P.slow = Math.max(P.slow || 0, 0.5); }
      else if (z.type === 'pull') {
        const cx = z.x + z.w / 2, dx = cx - (P.x + 4);
        if (Math.abs(dx) < z.w / 2) moveX(P, clamp(dx, -1, 1) * 58 * dt);
        if (Math.random() < 0.5) emit(cx + rr(-z.w / 2, z.w / 2), z.y + rr(0, z.h), 1, { col: z.col, sp0: 10, sp1: 30, vx: (cx - 0) * 0, grav: -10, l0: 0.3, l1: 0.6 });
        if (Math.abs(dx) < 12 && Math.abs(P.y + 7 - (z.y + z.h / 2)) < 26) { z.tick = (z.tick || 0) - dt; if (z.tick <= 0) { z.tick = 0.5; hurtPlayer(1, cx); } }
      }
      else if (ov(P, box)) hurtPlayer(z.dmg, z.x + z.w / 2);
    }
    Q.zones = Q.zones.filter(z => z.t < z.tel + z.life);
  }
  function drawZones(camX, camY) {
    for (const z of Q.zones) {
      const x = Math.round(z.x - camX), y = Math.round(z.y - camY), w = z.w, h = z.h;
      if (x > VW + 120 || x + w < -120) continue;
      if (z.t < z.tel) {
        const k = z.t / z.tel, bl = Math.floor(z.t * 12) % 2;
        if (z.type === 'poison' || z.type === 'goo') continue;
        if (z.type === 'meteor') { const my = y + h - 130 * (1 - k); disc(g, x + (w >> 1), Math.round(my), 5, '#e0453a'); disc(g, x + (w >> 1), Math.round(my), 3, '#ffd34e'); g.fillStyle = 'rgba(255,150,40,.5)'; g.fillRect(x + (w >> 1) - 1, Math.round(my) - 14, 3, 12); }
        g.globalAlpha = 0.18 + 0.3 * k; g.fillStyle = bl ? '#ff3a2a' : '#ffb03a'; g.fillRect(x, y, w, h); g.globalAlpha = 1;
        g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(x, y + h - 2, w, 2);
        if (z.type !== 'beam') { g.fillRect(x + (w >> 1) - 1, y + h - 12, 2, 6); g.fillRect(x + (w >> 1) - 1, y + h - 4, 2, 2); }
        continue;
      }
      if (z.type === 'spike') { g.fillStyle = z.col; for (let i = 0; i < w; i += 7) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 3.5, y); g.lineTo(x + i + 7, y + h); g.fill(); } g.fillStyle = '#fff'; g.fillRect(x + 3, y + 4, 1, h - 6); }
      else if (z.type === 'lava') { for (let i = 0; i < h; i += 4) { g.fillStyle = i < 16 ? '#fff6c0' : (i < 40 ? '#ffd34e' : '#f06a20'); g.fillRect(x + (Math.random() < 0.4 ? 1 : 0), y + i, w - (Math.random() < 0.4 ? 2 : 0), 4); } }
      else if (z.type === 'beam') { g.fillStyle = z.col; g.globalAlpha = 0.45; g.fillRect(x, y - 2, w, h + 4); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x, y + 2, w, h - 4); }
      else if (z.type === 'poison') { g.fillStyle = z.col; g.globalAlpha = 0.7; g.fillRect(x, y, w, h); g.globalAlpha = 1; if (Math.random() < 0.3) { g.fillStyle = '#d8ff9a'; g.fillRect(x + ((Math.random() * w) | 0), y - 2, 2, 2); } }
      else if (z.type === 'goo') { g.fillStyle = z.col; g.globalAlpha = 0.75; g.fillRect(x, y, w, h); g.fillRect(x + 4, y - 2, w - 8, 2); g.globalAlpha = 1; }
      else if (z.type === 'pull') { const cx = x + (w >> 1); for (let i = 0; i < 14; i++) { const a = Q.t * 7 + i * 0.45, rd = 14 + i * 7; g.fillStyle = i % 2 ? z.col : '#fff'; g.fillRect(Math.round(cx + Math.cos(a) * rd), Math.round(y + (h >> 1) + Math.sin(a) * rd * 0.28), 2, 2); } g.globalAlpha = 0.3; disc(g, cx, y + (h >> 1), 10, '#14121f'); g.globalAlpha = 1; }
      else if (z.type === 'meteor') { g.globalAlpha = 1 - (z.t - z.tel) / z.life; disc(g, x + (w >> 1), y + h - 6, 22, '#fff6c0'); g.globalAlpha = 1; }
      else if (z.type === 'sweep') { for (let i = 0; i < h; i += 4) { g.fillStyle = i < 20 ? '#fff6c0' : (i < 44 ? '#ffd34e' : '#f06a20'); g.fillRect(x + (Math.random() < 0.4 ? 1 : 0), y + i, w - (Math.random() < 0.4 ? 3 : 0), 4); } }
    }
  }

  function updateProjs(dt) {
    const P = Q.P;
    for (const p of Q.projs) {
      if (p.dead) continue;
      p.life -= dt; p.vy += p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) { p.dead = true; continue; }
      const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
      if (p.type !== 'wave' && solid(tx, ty)) { p.dead = true; emit(p.x, p.y, 5, { col: p.col, sp0: 10, sp1: 40 }); if (p.onLand) { const gy2 = groundYAt(p.x); addZone({ type: p.onLand, x: p.x - 16, y: gy2 - 6, w: 32, h: 6, tel: 0, life: 5, col: p.col }); } continue; }
      if (p.type === 'wave') { if (solid(Math.floor((p.x + Math.sign(p.vx) * 5) / TS), Math.floor(p.y / TS))) { p.dead = true; continue; } if (Math.random() < 0.4) emit(p.x, p.y + 4, 1, { col: p.col, sp0: 5, sp1: 20, vy: -20 }); }
      const hb = p.type === 'wave' ? { x: p.x - 6, y: p.y - 6, w: 12, h: 12 } : (p.big ? { x: p.x - 4, y: p.y - 4, w: 8, h: 8 } : { x: p.x - 2, y: p.y - 2, w: 4, h: 4 });
      if (ov(P, hb)) { if (hurtPlayer(p.dmg || 1, p.x)) { p.dead = true; if (p.status) for (const k in p.status) P[k] = Math.max(P[k] || 0, p.status[k]); } }
      if (p.fl && Math.random() < 0.5) emit(p.x, p.y, 1, { col: ['#ffd34e', '#f08a2b', '#e0453a'], sp0: 3, sp1: 14, grav: -10, l0: 0.15, l1: 0.35 });
    }
    Q.projs = Q.projs.filter(p => !p.dead);
  }

  // ----- NPC dialogue & shop -----
  function startTalk(it) {
    const d = (DLG[Q.li] || {})[it.who] || NPCS[it.who].generic || [{ en: '...', vi: '...' }];
    Q.talk = { it, npc: NPCS[it.who], lines: d, i: 0, t: 0 }; Q.state = 'talk'; Snd.blip(it.who); Q.P.vx = 0;
  }
  function startScripted(who, lines, after) {
    Q.talk = { it: { who }, npc: NPCS[who], lines, i: 0, t: 0, after }; Q.state = 'talk'; Snd.blip(who); Q.P.vx = 0;
  }
  function giveGift(gf) {
    for (const k in gf) Q.P.ammo[k] += gf[k];
    Snd.play('pickup'); Q.msg = T('gift') + '  (+' + gf.dagger + ' ' + T('dagger') + ', +' + gf.bomb + ' ' + T('bomb') + ', +' + gf.flask + ' ' + T('flask') + ')'; Q.msgT = 5;
  }
  function endTalk() {
    const tk = Q.talk, n = tk.npc, it = tk.it; Q.talk = null;
    if (tk.after) { Q.state = 'play'; tk.after(); return; }
    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; Q.shopWho = it.who; return; }
    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
      if (n.gift) giveGift(n.gift);
    }
  }
  function updateTalk(dt) {
    const tk = Q.talk; tk.t += dt;
    const full = tk.lines[tk.i][save.lang].length;
    { const ln = tk.lines[tk.i][save.lang], n0 = Math.floor((tk.t - dt) * 45), n1 = Math.min(ln.length, Math.floor(tk.t * 45));
      for (let k = n0 + 1; k <= n1; k++) if (k % 2 === 0 && /\S/.test(ln[k - 1] || ' ')) Snd.blip(tk.it.who); }
    if (act.okP || act.talkP || act.atkP) {
      if (tk.t * 45 < full) tk.t = 999;
      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) endTalk(); }
    }
    if (Q.talk && (act.backP || act.pauseP)) endTalk();
  }
  function updateShop() {
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
        if (d < (hasRelic(3) ? 90 : 40) && !it.drop) { it.x += (pc.x - it.x) * 6 * dt; it.y += (pc.y - it.y) * 6 * dt; }
        if (d < 10) { it.dead = true; const cv2 = hasRelic(3) ? 2 : 1; Q.coinsRun += cv2; save.coins += cv2; Snd.play('coin'); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 4, { col: '#ffd34e', sp0: 10, sp1: 40 }); if (Q.coinsRun % 50 === 0 && Q.P.hp < maxHP()) { Q.P.hp++; Snd.play('heart'); } }
      } else if (it.kind === 'heart') {
        if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true; Snd.play('heart'); setEmo('happy', 1); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 10, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); } }
      } else if (it.kind === 'shard') {
        if (d < 13) { it.dead = true; save.shards[Q.li][it.k] = 1; writeSave(); Q.taken.add(it.id); Snd.play('shard'); setEmo('happy', 2.2); Q.shardFlash = 1.2; emit(it.x, it.y, 30, { col: ['#ffd34e', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); const ts = totalShards(); Q.msg = (save.lang === 'vi' ? 'Mảnh nắng ' : 'Sun Shard ') + ts + '/21' + (ts % 3 === 0 ? (save.lang === 'vi' ? '  — Tim tối đa tăng!' : '  — Max hearts up!') : '') + (ts % 7 === 0 ? (save.lang === 'vi' ? '  — Kiếm mạnh hơn!' : '  — Sword stronger!') : ''); Q.msgT = 4; if (P.hp < maxHP()) P.hp = maxHP(); }
      } else if (it.kind === 'pk') {
        if (d < 13) {
          it.dead = true; P.ammo[it.what] += it.amt; Snd.play('pickup'); if (it.id >= 0 && !it.keep) Q.taken.add(it.id);
          Q.msg = '+' + it.amt + ' ' + T(it.what) + '   (L / Q)'; Q.msgT = 3; emit(it.x, it.y, 8, { col: ['#fff', '#ffd34e'], sp0: 10, sp1: 50 });
          const names = ['dagger', 'bomb', 'flask']; if (P.ammo[names[P.sel]] <= 0) P.sel = names.indexOf(it.what);
        }
      } else if (it.kind === 'key') {
        if (d < 13) { it.dead = true; P.keys++; Snd.play('key'); Q.taken.add(it.id); Q.msg = T('gotkey'); Q.msgT = 3; emit(it.x, it.y, 14, { col: ['#ffd34e', '#fff'], sp0: 15, sp1: 60 }); }
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
    Q.state = 'complete'; Q.stateT = 0; Snd.stop();
    Q.relicNew = !save.relics[Q.li]; save.relics[Q.li] = 1;
    Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer'); setEmo('happy', 99);
    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);
    Q.firstClear = true;
    writeSave();
  }

  // ===================== throwables =====================
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
    if (w === 'dagger') Q.fps.push({ t: 'dagger', x, y: P.y + 6, vx: f * (act.up ? 170 : 240), vy: act.up ? -170 : (act.down ? 90 : 0), g: 0, life: 0.9, f });
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
    for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg, true);
    for (const b of bossTargets()) if (Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < r + b.w / 2) hurtBoss(b, dmg, true);
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
      for (const e of Q.ents) if (!e.dead && !e.hid && ov(box, e) && !(e.cfg && e.cfg.ai === 'blob' && e.st !== 'up')) { hit = e; break; }
      if (!hit) for (const b of bossTargets()) if (ov(box, b)) { hit = b; break; }
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
        for (const e of Q.ents) if (!e.dead && ov(box, e)) hurtEnemy(e, 1, true);
        for (const b of bossTargets()) if (ov(box, b)) hurtBoss(b, 1, true);
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
    else if (pz.type === 'cage') {
      if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { Q.msg = T('guards'); Q.msgT = 3; Snd.play('zap'); return; }
      startScripted('lyra', RESCUE, () => { pz.open = true; save.leek = true; writeSave(); Q.items.push({ kind: 'npc', who: 'lyra', x: pz.x, y: pz.y, id: -5, ph: 0 }); Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer'); setEmo('happy', 3); emit(pz.x, pz.y - 14, 40, { col: ['#a4ffc0', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); });
    }
  }
  // ===================== Mr Shorty's trials =====================
  function sealTrial(tr) { for (let y = 0; y < tr.gy; y++) Q.L.grid[y][tr.lw] = 'G'; Snd.play('gate'); Q.shake = 0.6; }
  function openTrial(tr) { for (let y = 0; y < tr.gy; y++) Q.L.grid[y][tr.lw] = ' '; Snd.play('gate'); }
  function spawnWave(tr, extra) {
    const B = Q.B, d = 0.15 + tr.wave * 0.22 + Q.li * 0.06, pool = B.enemies.filter(e => e.min <= d);
    const n = extra ? 2 : 2 + tr.wave + (Q.li > 3 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      let tot = 0; pool.forEach(e => tot += e.w); let r = Math.random() * tot, type = pool[0].t;
      for (const e of pool) { r -= e.w; if (r <= 0) { type = e.t; break; } }
      const fx = (tr.lw + 3 + Math.random() * (tr.rw - tr.lw - 6)) * TS;
      const e = makeEnemy(type, fx, FLY.has(type) ? (tr.gy - 4) * TS : tr.gy * TS, {}); e.trial = tr.id; e.alerted = true; e.minion = false;
      Q.ents.push(e); emit(fx, e.y + e.h / 2, 14, { col: ['#c07bff', '#fff', '#6a3aa8'], sp0: 20, sp1: 80 });
    }
    if (!extra) tr.wave++; Q.msg = extra ? (save.lang === 'vi' ? 'Quân tiếp viện! Giải câu đố mau!' : 'Reinforcements! Solve the puzzle!') : T('wave') + ' ' + tr.wave + ' / ' + tr.waves; Q.msgT = 3; Snd.play('zap');
  }
  function updateTrials(dt) {
    const P = Q.P;
    for (const tr of Q.trials) {
      if (tr.state === 'idle') {
        if (P.x > tr.trig * TS && P.x < tr.rw * TS - 8 && P.onGround) {
          tr.state = 'intro'; setEmo('angry', 3);
          startScripted('shorty', TRIAL[Q.li].intro, () => { sealTrial(tr); tr.state = 'active'; tr.cd = 0.8; });
        }
      } else if (tr.state === 'active') {
        const alive = Q.ents.filter(e => !e.dead && e.trial === tr.id).length, gd = gateOf(tr.gate);
        if (alive > 0) continue;
        tr.cd -= dt; if (tr.cd > 0) continue;
        if (tr.wave < tr.waves) { spawnWave(tr); tr.cd = 1.2; }
        else if (gd && !gd.open) {
          tr.rc = (tr.rc === undefined ? 4 : tr.rc) - dt;
          if (tr.rc <= 0) { tr.rc = 9; spawnWave(tr, true); }
        } else {
          tr.state = 'done'; Q.trialsDone.add(tr.id); openTrial(tr); Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic'); setEmo('happy', 2.5);
          const cx = (tr.lw + tr.rw) / 2 * TS;
          for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 12, y: tr.gy * TS - 30, id: -1, vy: -120, vx: i ? 25 : -25, ph: 0, drop: true });
          for (let i = 0; i < 12; i++) Q.items.push({ kind: 'coin', x: cx + rr(-20, 20), y: tr.gy * TS - 30, id: -1, vy: -rr(80, 160), vx: rr(-50, 50), ph: 0, drop: true });
          Q.items.push({ kind: 'pk', what: 'bomb', amt: 2, keep: false, x: cx, y: tr.gy * TS - 30, id: -1, vy: -140, vx: 0, ph: 0, drop: true });
          startScripted('shorty', TRIAL[Q.li].outro, null);
        }
      }
    }
  }
  function updatePuzzles(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.nearPz = null;
    updateTrials(dt); updateDragonEnc();
    for (const pz of Q.pz) {
      if (pz.type === 'rune') {
        const on = P.onGround && P.x + P.w > pz.x - 8 && P.x < pz.x + 8 && Math.abs(P.y + P.h - pz.y) < 4;
        if (on && !pz.on) { pz.on = true; runeStep(pz); } else if (!on) pz.on = false;
        continue;
      }
      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit) || (pz.type === 'cage' && pz.open)) continue;
      if (Math.abs(pz.x - pc.x) < (pz.type === 'cage' ? 22 : 16) && Math.abs(pz.y - pc.y) < 26) Q.nearPz = pz;
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
      if (pz.type === 'cage' && pz.open) continue;
      const x = Math.round(pz.x - camX), y = Math.round(pz.y - camY);
      if (x < -30 || x > VW + 30) continue;
      if (pz.type === 'lever') drawSpr(g, icon('lever', pz.on ? 1 : 0), x, y, false);
      else if (pz.type === 'torch') drawSpr(g, icon('torch', pz.ci, pz.lit ? 1 : 0), x, y, false);
      else if (pz.type === 'tablet') drawSpr(g, icon('tablet'), x, y, false);
      else if (pz.type === 'cage') {
        const sp = npcSpr('npc_lyra_leek'); drawSpr(g, sp, x, y - 1 + Math.round(Math.sin(Q.t * 2) * 0.6), false, false);
        drawSpr(g, npcSpr('cage'), x, y + 1, false);
        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 52, 3, 7); g.fillRect(x - 1, y - 43, 3, 3); }
      }
      else if (pz.type === 'rune') drawSpr(g, icon('rune', pz.ci, pz.lit ? 1 : 0), x, y + 1, false);
      if (Q.nearPz === pz && Q.state === 'play') txt(pz.type === 'torch' ? T('light') : (pz.type === 'tablet' ? T('read') : (pz.type === 'cage' ? T('free') : T('use'))), x, y - (pz.type === 'cage' ? 56 : 26), { al: 'center', size: 6, col: '#ffd34e' });
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
    if (Q.dragon && !Q.dragon.dead || (Q.dragon && Q.dragon.dead)) { minX = Math.max(minX, Q.dragon.tr.lw * TS); maxX = Math.min(maxX, Q.dragon.tr.rw * TS + TS - VW); }
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
    if (st === 'reward') { Q.stateT += 0; if (Q.stateT > 0.8 && (act.okP || act.talkP || act.atkP)) Q.state = 'play'; updateParticles(dt); return; }
    if (st === 'tablet') { if (act.okP || act.talkP || act.backP || act.pauseP || act.atkP) { Q.state = 'play'; } return; }
    if (st === 'dead') {
      updateParticles(dt);
      if (Q.stateT > 0.8 && act.okP) { Snd.play('ok'); respawn(); }
      else if (Q.stateT > 0.8 && act.backP) toScene('map');
      return;
    }
    if (st === 'complete') { updateParticles(dt); if (Q.stateT > 1 && act.okP) { Snd.play('ok'); if (Q.li >= 6) toScene('ending'); else { cutLevel = Q.li; mapSel = Math.min(6, Q.li + 1); toScene('cutscene'); } } return; }
    // play / bossintro
    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }
    if (st === 'play' && act.talkP) { if (Q.nearNpc) { startTalk(Q.nearNpc); return; } if (Q.nearPz) { usePz(Q.nearPz); return; } }
    if (Q.freeze > 0) { Q.freeze -= dt; updateParticles(dt); return; }
    Q.t += dt; Q.time += dt;
    if (Q.shake > 0) Q.shake -= dt;
    if (Q.msgT > 0) Q.msgT -= dt;
    updatePlats(dt); updateCrumble(dt);
    if (st === 'bossintro') { updateBoss(dt); updateCam(dt); updateParticles(dt); updateWeather(dt); Q.P.vx = 0; Q.P.vy = Math.min(380, Q.P.vy + GRAV * dt); moveY(Q.P, Q.P.vy * dt); return; }
    updatePlayer(dt);
    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }
    updateEnemies(dt); updateBoss(dt); updateDragon(dt); updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(dt); updateZones(dt); updateCreeps(dt); updateItems(dt); updateParticles(dt); updateCam(dt); updateWeather(dt);
  }
  function updateParticles(dt) {
    updateFx(dt);
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
      else if (c === 'G') g.drawImage(ts.gate, dx, dy);
      else if (c === 'X') g.drawImage(ts.cracked, dx, dy);
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
    drawWatchers(camX, camY);
    drawItems(camX, camY);
    drawTraps(camX, camY);
    drawZones(camX, camY);
    drawPuzzles(camX, camY);
    drawFps(camX, camY);
    for (const e of Q.ents) drawEnemy(e, camX, camY);
    if (Q.boss && Q.boss.st !== 'sleep' || (Q.boss && Q.li === 6)) drawBoss(camX, camY);
    drawDragon(camX, camY);
    drawFx(camX, camY);
    drawPlayer(camX, camY);
    // projectiles
    for (const p of Q.projs) {
      const px = Math.round(p.x - camX), py = Math.round(p.y - camY);
      if (p.type === 'wave') { g.fillStyle = p.col; g.fillRect(px - 6, py - 5, 12, 10); g.fillStyle = '#fff'; g.fillRect(px - 3, py - 3, 6, 6); }
      else if (p.fl) { disc(g, px, py, 4, '#e0453a'); disc(g, px, py, 3, '#f08a2b'); disc(g, px, py, 1, '#fff6c0'); }
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
      } else if (it.kind === 'pk') {
        const sp = icon(it.what); drawSpr(g, sp, x, y + 7 + Math.round(Math.sin(it.ph * 3) * 1.5), false);
        if (Math.random() < 0.05) emit(it.x + rr(-5, 5), it.y + rr(-6, 4), 1, { col: '#fff', sp0: 1, sp1: 6, grav: -8, l0: 0.3, l1: 0.6 });
      } else if (it.kind === 'key') {
        drawSpr(g, icon('key'), x, y + 5 + Math.round(Math.sin(it.ph * 3) * 1.5), false);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-5, 5), 1, { col: ['#fff', '#ffd34e'], sp0: 2, sp1: 8, grav: -10, l0: 0.3, l1: 0.7 });
      } else if (it.kind === 'npc') {
        const n = NPCS[it.who], sp = npcSpr(n.spr), bob = Math.round(Math.sin(it.ph * 2) * 0.5 + 0.5);
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
    if (x < -40 || x > VW + 40) return;
    if (c.ai === 'blob' && e.st === 'wait') return;
    if (e.hid) { g.fillStyle = '#a07030'; g.fillRect(Math.round(x - 4), Math.round(bot - 2), 8, 2); g.fillStyle = '#c8964a'; g.fillRect(Math.round(x - 2), Math.round(bot - 3), 4, 1); return; }
    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, spr = getSprite(c.spr, c.swap || {}, fr, c.out), t = e.t;
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al;
    const ground = e.onGround;
    if (c.ai === 'hop') {
      if (ground) { const ant = (e.cd > 0 && e.cd < 0.3) ? (1 - e.cd / 0.3) : 0; sy = 1 - 0.3 * ant + 0.04 * Math.sin(t * 5); sx = 1 + 0.25 * ant; }
      else { const st = clamp(Math.abs(e.vy) / 700, 0, 0.3); sy = 1 + st; sx = 1 - st * 0.6; }
    } else if (c.ai === 'walk' || c.ai === 'charge') {
      const mv = ground && Math.abs(e.vx) > 1;
      if (e.st === 'wind') { sy = 0.76; sx = 1.14; ox = (Math.random() - 0.5) * 2; }
      else if (e.st === 'rush') { sx = 1.22; sy = 0.88; rot = e.dir * 0.14; if (Math.random() < 0.4) emit(e.x + e.w / 2 - e.dir * 4, e.y + e.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 20, vy: -8, grav: 20, l0: 0.15, l1: 0.3 }); }
      else if (e.st === 'block') { sy = 0.92; sx = 1.08; rot = -e.dir * 0.05; }
      else if (e.st === 'dig') { const k = clamp(1 - e.stT / 0.5, 0, 1); sy = 1 - 0.7 * k; oy = 3 * k; }
      else if (e.st === 'pop') { sy = 1.2; sx = 0.88; rot = e.dir * 0.1; }
      else if (mv) { oy = -Math.abs(Math.sin(t * (7 + e.sp / 12))) * 1.6; rot = e.dir * 0.06 * Math.sin(t * 8); sy = 1 + 0.04 * Math.sin(t * 15); }
      else sy = 1 + 0.03 * Math.sin(t * 3);
    } else if (c.ai === 'fly') {
      rot = clamp(e.vx / 160, -0.3, 0.3);
      if (e.st === 'dive') { rot = Math.atan2(e.dvy || 0, Math.abs(e.dvx || 1)) * (e.dir < 0 ? -1 : 1) * 0.8; sx = 1.1; sy = 0.9; }
    } else if (c.ai === 'ghost') {
      sx = 1 + 0.07 * Math.sin(t * 4); sy = 1 - 0.05 * Math.sin(t * 4); al = 0.65 + Math.sin(t * 3) * 0.2; oy = Math.round(Math.sin(t * 3));
      if (e.st === 'fade') al = clamp(e.stT / 0.3, 0, 1) * 0.8; else if (e.st === 'appear') al = clamp(1 - e.stT / 0.3, 0, 1) * 0.8;
    } else if (c.ai === 'shoot' || c.ai === 'flyshoot') {
      if (e.st === 'wind') { sy = 1.08; sx = 0.94; rot = -e.dir * 0.08; ox = (Math.random() - 0.5) * 1.5; }
      sy += 0.02 * Math.sin(t * 3);
    }
    if (e.landT > 0) { const k = e.landT / 0.2; sy *= 1 - 0.3 * k; sx *= 1 + 0.25 * k; }
    if (e.kickT > 0) { const k = e.kickT / 0.15; sx *= 1 + 0.15 * k; ox -= e.dir * 2.5 * k; }
    if (e.hitT > 0) { const k = e.hitT / 0.18; sx *= 1 + 0.25 * k; sy *= 1 - 0.2 * k; ox += (Math.random() - 0.5) * 2 * k; }
    if (e.spawnT > 0) { const k = 1 - e.spawnT / 0.4, os = 1 + Math.sin(k * Math.PI) * 0.25; sx *= (0.2 + 0.8 * k) * os; sy *= (0.2 + 0.8 * k) * os; al = k; if (Math.random() < 0.5) emit(e.x + e.w / 2, e.y + e.h / 2, 1, { col: ['#fff', Q.B.proj], sp0: 10, sp1: 40, grav: 0, l0: 0.2, l1: 0.4 }); }
    const flash = e.flash > 0 || (e.st === 'wind' && Math.floor(t * 20) % 2 === 0);
    const k0 = e.sc || 1;
    if (e.v === 'elite') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 + Math.sin(t * 5) * 0.12; disc(g, Math.round(x), Math.round(bot - e.h / 2), Math.round(e.w * 0.8), '#c02030'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    drawSprT(g, spr, x + ox, bot + oy, e.dir < 0, flash, sx * k0, sy * k0, rot, al);
    if (e.st === 'block') { const fx = Math.round(x + e.dir * (e.w * 0.6)); g.fillStyle = '#14121f'; g.fillRect(fx - 2, Math.round(bot - e.h * 0.85), 5, Math.round(e.h * 0.8)); g.fillStyle = '#cfd6e6'; g.fillRect(fx - 1, Math.round(bot - e.h * 0.85) + 1, 3, Math.round(e.h * 0.8) - 2); g.fillStyle = '#fff'; g.fillRect(fx, Math.round(bot - e.h * 0.85) + 2, 1, 3); }
    if (e.maxhp >= 6 && e.hp < e.maxhp && e.hp > 0) {
      const bw = Math.max(12, Math.round(e.w * 0.9)), bx = Math.round(x - bw / 2), by = Math.round(bot - e.h - 6);
      g.fillStyle = '#14121f'; g.fillRect(bx - 1, by - 1, bw + 2, 4); g.fillStyle = '#5a1020'; g.fillRect(bx, by, bw, 2);
      g.fillStyle = e.armor > 0 ? '#cfd6e6' : '#e0453a'; g.fillRect(bx, by, Math.max(0, Math.round(bw * e.hp / e.maxhp)), 2);
    }
  }
  function drawBoss(camX, camY) {
    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;
    const c = b.cfg, x = Math.round(b.x + b.w / 2 - camX), bot = Math.round(b.y + b.h - camY), gyy = Math.round(Q.L.arena.gy * TS - camY);
    if (b.hide) {
      if (b.sk === 'ambush' && b.ph >= 1) {
        const mx = Math.round((b.ph === 1 ? b.mx : b.lockx) - camX), bl = Math.floor(Q.t * 14) % 2;
        g.globalAlpha = 0.5; g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(mx - 20, gyy - 2, 40, 2); g.fillRect(mx - 1, gyy - 16, 2, 8); g.fillRect(mx - 1, gyy - 6, 2, 2); g.globalAlpha = 1;
      }
      return;
    }
    const hgt = Math.max(0, gyy - bot), sw = Math.round(b.w * (0.95 - Math.min(0.5, hgt / 180)));
    g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(x - (sw >> 1), gyy - 1, sw, 3);
    if (c.eclipse) { g.globalAlpha = 0.25 + Math.sin(b.t * 3) * 0.1; disc(g, x, bot - 40, 40, '#7a4cff'); g.globalAlpha = 1; }
    const P = bossPose(b), tele = b.st === 'tele' && Math.floor(b.t * 18) % 2 === 0, bob = c.eclipse ? Math.round(Math.sin(b.t * 3) * 3) : 0;
    if (P.circle) drawCircle(x, gyy - 2, Math.round(b.w * 0.8) + 10, Q.B.proj, Q.t);
    if (P.aura && P.aura[1] > 0.02) drawAura(x, bot - (b.h >> 1), Math.round(b.h * 0.9), P.aura[0].length === 7 ? P.aura[0] : '#ff9a2a', P.aura[1]);
    if (b.st === 'evade') { g.globalAlpha = 0.35; drawSprT(g, b.spr, x - b.ed * 14, bot, b.dir < 0, false, 1, 1, 0, 0.35); g.globalAlpha = 1; }
    if (b.sk === 'charge' && b.st === 'act') { g.globalAlpha = 0.25; drawSprT(g, b.spr, x - b.dir * 12, bot, b.dir < 0, false, 1.1, 0.92, b.dir * 0.2, 0.25); drawSprT(g, b.spr, x - b.dir * 24, bot, b.dir < 0, false, 1.05, 0.95, b.dir * 0.2, 0.15); g.globalAlpha = 1; }
    let al = P.al; if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) al = Math.min(al, 0.45);
    drawSprT(g, b.spr, x + P.ox, bot + bob + P.oy, b.dir < 0, b.flash > 0 || tele || b.revT > 0, P.sx, P.sy, P.rot, al);
    if (b.cloak && Math.random() < 0.5) { g.fillStyle = Math.random() < 0.5 ? '#a15be0' : '#fff'; g.fillRect(x + Math.round(rr(-b.w / 2, b.w / 2)), bot - Math.round(rr(0, b.h)), 1, 2); }
    if (b.shield > 0) { g.globalAlpha = 0.35 + Math.sin(Q.t * 12) * 0.12; disc(g, x, bot - (b.h >> 1), Math.round(b.h * 0.62), '#6ee7f2'); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x - 1, bot - b.h - 8, 3, 3); }
    if (b.guard > 0) { g.globalAlpha = 0.5; g.strokeStyle = '#cfd6e6'; g.lineWidth = 2; g.strokeRect(x - (b.w >> 1) - 3, bot - b.h - 3, b.w + 6, b.h + 4); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { const a = Q.t * 5 + i * 2.1; g.fillStyle = '#fff'; g.fillRect(Math.round(x + Math.cos(a) * (b.w / 2 + 4)), Math.round(bot - (b.h >> 1) + Math.sin(a) * (b.h / 2)), 2, 2); } }
    if (b.st === 'stun') { for (let i = 0; i < 3; i++) { const a = Q.t * 6 + i * 2.1; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(a) * 12), Math.round(bot - b.h - 4 + Math.sin(a) * 3), 3, 3); } }
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
    drawEmoteFace(x, bot + bob, P.face < 0, 1, P.emo, P.anim); drawEmoBubble(x - 8, bot - 24, P.emo);
    // lantern
    const lx = x + P.face * 8, ly = bot - 9 +Math.round(Math.sin(P.anim * 7) * (Math.abs(P.vx) > 15 ? 1.5 : 0.6));
    g.fillStyle = '#1b1626'; g.fillRect(lx - 3, ly - 3, 6, 7); g.fillRect(lx - 1, ly - 5, 2, 2);
    g.fillStyle = '#ffd34e'; g.fillRect(lx - 2, ly - 2, 4, 5); g.fillStyle = '#fff6c0'; g.fillRect(lx - 1, ly - 1, 2, 2);
    // sword: Lyra's glowing leek once rescued, otherwise a white arc
    const f = P.face, hx = x + f * 3, hy = bot - 9;
    if (save.leek) {
      const lk = leekSprite(), pulse = 0.6 + Math.sin(Q.t * 6) * 0.25;
      let ang;
      if (P.atk > 0) { const t = 1 - P.atk / 0.2; ang = P.atkDown ? 1.5 : lerp(-1.5, 1.0, t); } else ang = -2.15;
      const tipx = hx + Math.cos(ang) * 18 * f, tipy = hy + Math.sin(ang) * 18;
      g.globalCompositeOperation = 'lighter';
      const grd = g.createRadialGradient(tipx, tipy, 0, tipx, tipy, 30);
      grd.addColorStop(0, 'rgba(130,255,170,' + (0.5 * pulse + (P.atk > 0 ? 0.25 : 0)) + ')'); grd.addColorStop(1, 'rgba(130,255,170,0)');
      g.fillStyle = grd; g.fillRect(tipx - 30, tipy - 30, 60, 60);
      g.globalCompositeOperation = 'source-over';
      if (P.atk > 0 && !P.atkDown) {
        for (let k = 1; k <= 7; k++) { const a2 = ang - k * 0.24, tx = hx + Math.cos(a2) * 24 * f, ty = hy + Math.sin(a2) * 24; g.globalAlpha = 0.65 - k * 0.08; g.fillStyle = k % 2 ? '#c8ffd8' : '#6ee7b0'; g.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 3, 3); }
        g.globalAlpha = 1;
      }
      g.save(); g.translate(hx, hy); g.scale(f, 1); g.rotate(ang); g.drawImage(lk.c, -1, -lk.h / 2); g.restore();
      if (Math.random() < 0.35) emit(P.x + 4 + Math.cos(ang) * 18 * f + rr(-6, 6), P.y + 5 + Math.sin(ang) * 18 + rr(-6, 6), 1, { col: ['#c8ffd8', '#6ee7b0', '#fff'], sp0: 2, sp1: 10, grav: -12, l0: 0.3, l1: 0.7 });
    } else if (P.atk > 0) {
      const t = 1 - P.atk / 0.2;
      g.fillStyle = '#fff';
      if (P.atkDown) { for (let i = 0; i < 8; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 7)) + t * 0.5; g.fillRect(Math.round(x + Math.cos(a) * 12 * f), Math.round(bot + Math.sin(a) * 12 - 2), 2, 2); } g.fillStyle = '#cfd6e6'; g.fillRect(Math.round(x - 1), Math.round(bot - 2), 3, 12); }
      else {
        for (let i = 0; i < 10; i++) { const a = (-1.2 + 2.4 * (i / 9)) * (t < 0.5 ? t * 2 : 1), px = x + f * (4 + Math.cos(a) * 17), py = bot - 7 + Math.sin(a) * 12; g.fillStyle = i > 6 ? '#fff' : '#cfeaff'; g.fillRect(Math.round(px), Math.round(py), 3, 3); }
      }
    }
  }
  function drawLighting() {
    const B = Q.B, P = Q.P, camX = Q.cam.x, camY = Q.cam.y;
    const dark = Q.darkCur !== undefined ? Q.darkCur : B.dark;
    const flick = Math.sin(Q.t * 9) * 2 + Math.sin(Q.t * 5.3) * 1.5;
    const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: ((dark > 0.6 ? 64 : (dark > 0.3 ? 78 : 90)) + flick + (Q.ents.some(e => !e.dead && Math.abs(e.x - P.x) < 80 && Math.abs(e.y - P.y) < 50) ? Math.sin(Q.t * 38) * 4 : 0)) * (hasRelic(2) ? 1.45 : 1), i: 1 }];
    const addL = (x, y, r, i) => { const sx = x - camX, sy = y - camY; if (sx > -r && sx < VW + r && sy > -r && sy < VH + r) lights.push({ x: sx, y: sy, r, i: i || 1 }); };
    for (const it of Q.items) { if (it.kind === 'cp' && it.lit) addL(it.x, it.y - 26, 50, 1); else if (it.kind === 'shard') addL(it.x, it.y, 34, 1); else if (it.kind === 'frag') addL(it.x, it.y, 80, 1); else if (it.kind === 'npc') addL(it.x, it.y - 10, 36, 0.8); else if (it.kind === 'coin' && B.dark > 0.5) addL(it.x, it.y, 10, 0.5); }
    for (const e of Q.ents) if (e.cfg.ai === 'flyshoot' || e.cfg.ai === 'blob' || e.type === 'ghost') addL(e.x + e.w / 2, e.y + e.h / 2, 34, 0.9);
    for (const p of Q.projs) addL(p.x, p.y, 24, 0.9);
    for (const pz of Q.pz) if ((pz.type === 'torch' && pz.lit) || (pz.type === 'rune' && pz.lit)) addL(pz.x, pz.y - 10, 38, 0.9);
    for (const f of Q.fires) addL(f.x, f.y - 8, 34, 0.9);
    for (const p of Q.fps) if (p.t !== 'dagger') addL(p.x, p.y, 20, 0.8);
    if (save.leek) addL(P.x + 4 + P.face * 10, P.y + 2, 38, 0.85);
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
    if (save.leek) {
      const lx = P.x + 4 + P.face * 10 - camX, ly = P.y + 2 - camY, gl = g.createRadialGradient(lx, ly, 0, lx, ly, 44);
      gl.addColorStop(0, 'rgba(120,255,170,0.20)'); gl.addColorStop(1, 'rgba(120,255,170,0)'); g.fillStyle = gl; g.fillRect(lx - 44, ly - 44, 88, 88);
    }
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
    { let sy = 14; const chip = (t, c) => { txt(t, VW - 8, sy, { al: 'right', size: 7, col: c }); sy += 10; };
      if (P.slow > 0) chip((save.lang === 'vi' ? 'CHẬM ' : 'SLOWED ') + P.slow.toFixed(1), '#8ad8ff');
      if (P.rev > 0) chip((save.lang === 'vi' ? 'NGƯỢC PHÍM ' : 'REVERSED ') + P.rev.toFixed(1), '#c07bff');
      if (Q.windT > 0) chip(save.lang === 'vi' ? 'GIÓ BÃO' : 'BLIZZARD', '#fff'); }
    // throwables
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
    const bb = (Q.boss && Q.arenaSealed && !Q.bossDead && Q.boss.max) ? Q.boss : ((Q.dragon && !Q.dragon.dead && Q.dragon.st !== 'enter' && Q.dragon.st !== 'talk') ? Q.dragon : null);
    if (bb) {
      const b = bb, w = 200, x = (VW - w) / 2, y = 14;
      g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 2, w + 4, 9);
      g.fillStyle = '#5a1020'; g.fillRect(x, y, w, 5);
      g.fillStyle = '#e0453a'; g.fillRect(x, y, Math.max(0, w * b.hp / b.max), 5);
      g.fillStyle = '#ff9a8a'; g.fillRect(x, y, Math.max(0, w * b.hp / b.max), 1);
      txt(LN(b.cfg.name) + (b.cfg.armor > 0 ? '   [' + Math.round(b.cfg.armor * 100) + '% ' + (save.lang === 'vi' ? 'giáp' : 'armor') + ']' : ''), VW / 2, y + 14, { al: 'center', size: 8 });
    }
    if (Q.msgT > 0 && Q.msg && Q.state === 'play') txt(Q.msg, VW / 2, VH - 14, { al: 'center', size: 7, alpha: Math.min(1, Q.msgT) });
  }

  function drawPlay() {
    const L = Q.L;
    g.save();
    const sh = Q.shake > 0 ? Q.shake * 8 : 0;
    if (sh > 0) g.translate(Math.round(rr(-sh, sh)), Math.round(rr(-sh, sh)));
    drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather();
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
      txt('M: ' + (Snd.muted ? 'Sound OFF' : 'Sound ON') + '    F11: ' + T('full'), VW / 2, 200, { al: 'center', size: 6, col: '#8892aa' });
      txt(save.lang === 'vi' ? 'Nhấp chuột: đánh / chọn menu   Chuột phải: ném   Lăn chuột: đổi đồ' : 'Click: attack / menus   Right-click: throw   Wheel: switch', VW / 2, 210, { al: 'center', size: 5, col: '#8892aa' });
      txt(T('relics'), VW / 2, 166, { al: 'center', size: 6, col: '#8892aa' });
      for (let i = 0; i < 7; i++) { const ic = icon('r' + i); g.globalAlpha = save.relics[i] ? 1 : 0.2; g.drawImage(ic.c, VW / 2 - 7 * 13 + i * 26 + 4, 172); }
      g.globalAlpha = 1;
    } else if (st === 'talk') {
      const tk = Q.talk, sp = npcSpr(tk.npc.spr);
      g.fillStyle = 'rgba(8,6,20,.93)'; g.fillRect(8, 148, VW - 16, 62);
      g.fillStyle = '#ffd34e'; g.fillRect(8, 148, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1); g.fillRect(8, 148, 1, 62); g.fillRect(VW - 9, 148, 1, 62);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(14, 154, 44, 50);
      drawSpr(g, sp, 36, 204, false, false, 2, 2);
      txt(LN(tk.npc.name), 66, 158, { size: 8, col: '#ffd34e', bold: true });
      const line = tk.lines[tk.i][save.lang], n = Math.floor(tk.t * 45);
      wrapText(line.substr(0, n), 62).forEach((l, i) => txt(l, 66, 173 + i * 11, { size: 7 }));
      if (n >= line.length) txt('>', VW - 18, 200, { size: 8, col: '#ffd34e', alpha: 0.5 + 0.5 * Math.sin(Q.stateT * 8 + Q.t * 8) });
    } else if (st === 'shop') {
      const list = SHOPS[Q.shopWho] || [], hh = 70 + (list.length + 1) * 14;
      g.fillStyle = 'rgba(8,6,20,.94)'; g.fillRect(40, 50, VW - 80, hh);
      g.fillStyle = '#ffd34e'; g.fillRect(40, 50, VW - 80, 1); g.fillRect(40, 49 + hh, VW - 80, 1); g.fillRect(40, 50, 1, hh); g.fillRect(VW - 41, 50, 1, hh);
      txt(LN(NPCS[Q.shopWho].name), VW / 2, 62, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      txt(T('wallet') + ': ' + save.coins, VW / 2, 76, { al: 'center', size: 7, col: '#cfd6e6' });
      list.map(o => o.k).concat(['shop3']).forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 96 + i * 14, { al: 'center', size: 7, col: Q.menu === i ? '#ffd34e' : '#e8eaf5' }));
      if (Q.shopMsg) txt(Q.shopMsg, VW / 2, 50 + hh - 8, { al: 'center', size: 6, col: '#a4e86b' });
      txt(T('dagger') + ' ' + Q.P.ammo.dagger + '  ' + T('bomb') + ' ' + Q.P.ammo.bomb + '  ' + T('flask') + ' ' + Q.P.ammo.flask + (Q.P.shield ? '  [Shield]' : ''), VW / 2, 50 + hh - 20, { al: 'center', size: 6, col: '#8892aa' });
    } else if (st === 'reward') {
      const a = Math.min(1, Q.stateT / 0.6), lk = leekSprite(), pulse = Math.sin(Q.stateT * 5);
      g.globalAlpha = 0.8 * a; g.fillStyle = '#04100a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter';
      for (let r = 70; r > 10; r -= 12) { g.globalAlpha = 0.05 * a; disc(g, VW / 2, 96, Math.round(r + pulse * 3), '#6effaa'); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
      g.save(); g.translate(VW / 2, 96); g.rotate(-0.5 + Math.sin(Q.stateT * 2) * 0.1); g.scale(3, 3); g.drawImage(lk.c, -lk.w / 2, -lk.h / 2); g.restore(); g.globalAlpha = 1;
      for (let i = 0; i < 10; i++) { const an = Q.stateT * 1.5 + i * 0.63, rd = 50 + Math.sin(Q.stateT * 3 + i) * 8; g.fillStyle = i % 2 ? '#c8ffd8' : '#6ee7b0'; g.fillRect(Math.round(VW / 2 + Math.cos(an) * rd), Math.round(96 + Math.sin(an) * rd * 0.6), 2, 2); }
      txt(T('leekT'), VW / 2, 38, { al: 'center', size: 13, bold: true, col: '#a4ffc0', alpha: a });
      txt(LN(LYRA_NAME) + ' - ' + (save.lang === 'vi' ? 'Kiếm Hành Lá' : 'Leek Blade'), VW / 2, 150, { al: 'center', size: 9, bold: true, alpha: a });
      wrapText(T('leekD'), 60).forEach((l, i) => txt(l, VW / 2, 166 + i * 10, { al: 'center', size: 7, col: '#a4e86b', alpha: a }));
      if (Q.stateT > 0.8) txt(T('cont2'), VW / 2, 200, { al: 'center', size: 7, alpha: 0.6 + 0.4 * Math.sin(Q.stateT * 5) });
    } else if (st === 'tablet' && Q.tablet) {
      const gd = Q.tablet, cs = gd.seqColors || [];
      g.fillStyle = 'rgba(8,6,20,.95)'; g.fillRect(70, 56, VW - 140, 100);
      g.fillStyle = '#6ee7f2'; g.fillRect(70, 56, VW - 140, 1); g.fillRect(70, 155, VW - 140, 1); g.fillRect(70, 56, 1, 100); g.fillRect(VW - 71, 56, 1, 100);
      txt(T('tabletT'), VW / 2, 68, { al: 'center', size: 8, col: '#6ee7f2', bold: true });
      txt(T('tabletH'), VW / 2, 84, { al: 'center', size: 6, col: '#cfd6e6' });
      cs.forEach((c, i) => { const bx = VW / 2 - cs.length * 20 / 2 + i * 20 + 2, by = 98; g.fillStyle = '#1b1626'; g.fillRect(bx - 2, by - 2, 18, 18); g.fillStyle = TORCH_COLORS[c]; g.fillRect(bx, by, 14, 14); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(bx, by, 14, 3); txt(String(i + 1), bx + 7, by + 28, { al: 'center', size: 6, col: '#8892aa' }); });
      txt('OK', VW / 2, 145, { al: 'center', size: 6, col: '#8892aa' });
    } else if (st === 'dead') {
      const a = Math.min(1, Q.stateT / 0.8);
      g.globalAlpha = 0.6 * a; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      drawSpr(g, getSprite('hero_idle', {}, 0), VW / 2, 80, false, false, 3, 3, a); drawEmoteFace(VW / 2, 80, false, 3, 'cry', Q.stateT);
      txt(T('died'), VW / 2, 100, { al: 'center', size: 14, bold: true, col: '#e0453a', alpha: a });
      if (Q.stateT > 0.8) txt(T('retry'), VW / 2, 130, { al: 'center', size: 8 });
    } else if (st === 'complete') {
      const a = Math.min(1, Q.stateT / 0.8);
      g.globalAlpha = 0.72 * a; g.fillStyle = '#05030f'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      txt(T('clear'), VW / 2, 40, { al: 'center', size: 13, bold: true, col: '#ffd34e', alpha: a });
      txt(LN(Q.B.name), VW / 2, 58, { al: 'center', size: 8, col: '#cfd6e6', alpha: a });
      const sh = save.shards[Q.li] || [0, 0, 0], got = sh.filter(Boolean).length;
      const mm = Math.floor(Q.time / 60), ss = Math.floor(Q.time % 60);
      txt(T('coins') + ':  ' + Q.coinsRun + '     ' + T('shards') + ':  ' + got + ' / 3', VW / 2, 78, { al: 'center', size: 8, alpha: a });
      txt(T('time') + ':  ' + mm + ':' + (ss < 10 ? '0' : '') + ss + '     ' + T('hearts') + ': ' + maxHP() + '   ' + T('dmg') + ': ' + swordDmg(), VW / 2, 92, { al: 'center', size: 7, col: '#a4e86b', alpha: a });
      { const R = RELICS[Q.li], ic = icon('r' + Q.li), pulse = Math.sin(Q.stateT * 4) * 2;
        g.globalAlpha = a; g.fillStyle = 'rgba(255,211,78,.14)'; g.fillRect(60, 104, VW - 120, 52); g.fillStyle = '#ffd34e'; g.fillRect(60, 104, VW - 120, 1); g.fillRect(60, 155, VW - 120, 1);
        disc(g, 94, 130, Math.round(18 + pulse), 'rgba(255,211,78,.25)'); drawSpr(g, ic, 94, 142, false, false, 2, 2); g.globalAlpha = 1;
        txt(Q.relicNew ? T('relicNew') : T('relicHave'), 122, 114, { size: 7, col: Q.relicNew ? '#ffd34e' : '#8892aa', alpha: a });
        txt(LN(R.name), 122, 128, { size: 9, bold: true, alpha: a });
        wrapText(LN(R.desc), 44).forEach((l, i) => txt(l, 122, 142 + i * 9, { size: 6.5, col: '#a4e86b', alpha: a })); }
      if (Q.stateT > 1) txt(T('cont2'), VW / 2, 182, { al: 'center', size: 8, alpha: 0.6 + 0.4 * Math.sin(Q.stateT * 5) });
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
    if (s === 'cutscene') startCut();
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
    if (save.cleared.length || UNLOCK_ALL) it.push({ k: 'cont', fn: () => { mapSel = UNLOCK_ALL ? 0 : maxPlayable(); toScene('map'); } });
    it.push({ k: 'newgame', fn: () => { save.cleared = []; save.shards = {}; save.coins = 0; save.leek = false; save.relics = [0, 0, 0, 0, 0, 0, 0]; save.ammo = { dagger: 0, bomb: 0, flask: 0 }; writeSave(); mapSel = 0; toScene('story'); } });
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
    txt(T('cleared') + ' ' + save.cleared.length + '/' + BIOMES.length + '    ' + T('relics') + ' ' + save.relics.filter(Boolean).length + '/7    (' + BIOMES.length + ' ' + T('maps') + ')', VW / 2, 42, { al: 'center', size: 6, col: '#cfd6e6' });
    { const stars = '★'.repeat(mapSel + 1) + '☆'.repeat(6 - mapSel), pz = (PUZZLES[mapSel] || []).length, mins = Math.round(B.len / 70);
      txt(T('difficulty') + ': ' + stars, VW - 8, 188, { al: 'right', size: 6, col: '#ffd34e' });
      txt(T('puzzles') + ': ' + pz + '   ' + T('length') + ': ~' + mins + ' ' + T('min'), VW - 8, 201, { al: 'right', size: 6, col: '#cfd6e6' });
      const ic = icon('r' + mapSel); g.globalAlpha = save.relics[mapSel] ? 1 : 0.35; g.drawImage(ic.c, 8, 184); g.globalAlpha = 1; }
    const ts = totalShards();
    txt(T('shards') + ' ' + ts + '/21   ' + T('hearts') + ' ' + maxHP() + '   ' + T('dmg') + ' ' + swordDmg(), 6, VH - 4, { size: 5, col: '#a4e86b' });
  }

  // ============================== DEVIL CUTSCENE ==============================
  let cutLevel = 0, cut = null;
  function startCut() { cut = { t: 0, phase: 'walk', i: 0, lt: 0, pt: 0, fl: 0, shake: 0, thun: false, lastBlip: 0 }; Q = null; Snd.music('devil', DEVIL_MUSIC); }
  function cutLineStart() {
    const ln = CUT[cutLevel][cut.i];
    if (ln.w === 'quoc') Snd.creature(7, 'attack', true); else if (ln.w === 'imp') Snd.creature('imp', 'alert'); else Snd.blip('shorty');
    if (ln.shout) { cut.shake = 0.55; cut.fl = 0.3; if (Math.random() < 0.5) Snd.play('thunder'); }
  }
  function updateCut(dt) {
    const c = cut; c.t += dt;
    if (c.phase === 'walk') {
      if (c.fl > 0) c.fl -= dt;
      if (!c.thun && c.t > 2.1) { c.thun = true; Snd.play('thunder'); c.fl = 0.5; }
      if (c.t > 3.5) { c.phase = 'devil'; c.pt = 0; c.i = 0; c.lt = 0; cutLineStart(); }
      if (act.okP || act.backP) c.t = Math.max(c.t, 3.5);
      return;
    }
    c.pt += dt; c.lt += dt; if (c.fl > 0) c.fl -= dt; if (c.shake > 0) c.shake -= dt;
    const lines = CUT[cutLevel], ln = lines[c.i], txtL = ln[save.lang], n0 = Math.floor((c.lt - dt) * 38), n1 = Math.min(txtL.length, Math.floor(c.lt * 38));
    for (let k = n0 + 1; k <= n1; k++) if (k % (ln.w === 'quoc' ? 3 : 2) === 0 && /\S/.test(txtL[k - 1] || ' ')) Snd.blip(ln.w === 'imp' ? 'fairy' : (ln.w === 'quoc' ? 'quoc' : 'shorty'));
    if (act.okP) {
      if (c.lt * 38 < txtL.length) c.lt = 999;
      else { c.i++; c.lt = 0; if (c.i >= lines.length) { toScene('map'); c.i = lines.length - 1; c.lt = 999; } else cutLineStart(); }
    }
    if (act.backP) toScene('map');
  }
  function drawCut() {
    const c = cut;
    if (c.phase === 'walk') {
      const gyy = drawBgOnly(cutLevel, c.t * 45, c.t);
      drawSpr(g, getSprite('hero_run', {}, Math.floor(c.t * 10) % 4), 70 + c.t * 28, gyy, false);
      const a = Math.min(0.97, Math.pow(c.t / 2.6, 1.3));
      g.fillStyle = 'rgba(8,0,6,' + a + ')'; g.fillRect(0, 0, VW, VH);
      if (c.t > 1.2) { const gl = g.createRadialGradient(VW / 2, VH, 0, VW / 2, VH, 220); gl.addColorStop(0, 'rgba(180,20,10,' + Math.min(0.5, (c.t - 1.2) * 0.25) + ')'); gl.addColorStop(1, 'rgba(180,20,10,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH); }
      if (c.fl > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(1, c.fl * 2) + ')'; g.fillRect(0, 0, VW, VH); }
      if (c.t > 0.3) txt(save.lang === 'vi' ? 'Bóng tối đang kéo đến...' : 'Darkness is closing in...', VW / 2, 190, { al: 'center', size: 8, col: '#a8505a', alpha: Math.min(1, c.t - 0.3) });
      return;
    }
    const lines = CUT[cutLevel], ln = lines[c.i], sp = SPK[ln.w], k = Math.min(1, c.pt / 1.1);
    g.fillStyle = '#050003'; g.fillRect(0, 0, VW, VH);
    const gl = g.createRadialGradient(VW / 2, 70, 0, VW / 2, 70, 190); gl.addColorStop(0, 'rgba(190,30,14,' + (0.45 + (ln.w === 'quoc' && ln.shout ? 0.2 : 0)) + ')'); gl.addColorStop(1, 'rgba(190,30,14,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 26; i++) { const ex = (i * 53 + Math.sin(c.pt + i) * 10) % VW, ey = VH - ((c.pt * (20 + (i % 5) * 9) + i * 41) % VH); g.fillStyle = i % 2 ? '#ff9a2a' : '#ffd34e'; g.fillRect(Math.round(ex), Math.round(ey), 1, 1); }
    const sh = c.shake > 0 ? c.shake * 7 : 0, dv = devilSprite(), rise = (1 - k) * 70, ox = sh ? rr(-sh, sh) : 0, oy = sh ? rr(-sh, sh) : 0;
    const speak = ln.w === 'quoc';
    g.globalAlpha = speak ? 1 : 0.7; g.drawImage(dv.c, Math.round(VW / 2 - dv.w / 2 + ox), Math.round(10 - dv.h / 2 + 62 + rise + oy + Math.sin(c.pt * 2) * 1.5)); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    if (speak) { const e1 = g.createRadialGradient(VW / 2 - 13 + ox, 76 + rise + oy, 0, VW / 2 - 13 + ox, 76 + rise + oy, 22); e1.addColorStop(0, 'rgba(255,200,60,.55)'); e1.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e1; g.fillRect(VW / 2 - 40, 50 + rise, 80, 50); const e2 = g.createRadialGradient(VW / 2 + 13 + ox, 76 + rise + oy, 0, VW / 2 + 13 + ox, 76 + rise + oy, 22); e2.addColorStop(0, 'rgba(255,200,60,.55)'); e2.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e2; g.fillRect(VW / 2 - 14, 50 + rise, 80, 50); }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = ln.w === 'shorty' ? 1 : 0.55; drawSpr(g, npcSpr('npc_shorty'), 62, 150 + Math.round(Math.sin(c.pt * 3)), false, false, 2, 2);
    g.globalAlpha = ln.w === 'imp' ? 1 : 0.55; drawSpr(g, getSprite('imp'), VW - 62, 150 + Math.round(Math.sin(c.pt * 4)), true, false, 3, 3); g.globalAlpha = 1;
    if (c.fl > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, c.fl * 2) + ')'; g.fillRect(0, 0, VW, VH); }
    g.fillStyle = 'rgba(0,0,0,.82)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
    txt(LN(sp.name), 18, 162, { size: 8, col: sp.col, bold: true });
    const textL = ln[save.lang], n = Math.floor(c.lt * 38);
    wrapText(textL.substr(0, n), 64).forEach((l, i) => txt(l, 18 + (ln.shout && Math.random() < 0.4 ? rr(-0.5, 0.5) : 0), 177 + i * 11, { size: ln.shout ? 8 : 7, bold: !!ln.shout, col: ln.shout ? '#ffb0a0' : '#fff' }));
    if (n >= textL.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(c.pt * 8) });
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
        else if (scene === 'cutscene') updateCut(sub);
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
    else if (scene === 'cutscene' && cut) drawCut();
    cv.style.cursor = (scene === 'play' && Q && Q.state === 'play') ? 'crosshair' : (scene === 'play' || scene === 'title' || scene === 'map' ? 'pointer' : 'default');
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
  if (location.search.indexOf('debug') >= 0) window.LL = { startLevel, get Q() { return Q; }, save, genLevel, BIOMES, setScene: s => { scene = s; }, startCut: li => { cutLevel = li; enterScene('cutscene'); }, cutAdv: sec => { for (let i = 0; i < sec * 100; i++) updateCut(0.01); return cut.phase + ' line ' + cut.i; }, cutNext: () => { act.okP = true; updateCut(0.01); act.okP = false; return cut.i; }, hurtBoss, completeLevel, updatePlay, act, clearPressed, solid, ch, maxHP, save, openGate, explode, solveAll() { for (const gd of Q.gates) { if (!gd.open) openGate(gd, true); if (gd.need === 'timed') gd.timer = 1e9; } for (const w of Q.L.xwalls) for (const t of w.tiles) { Q.L.grid[t[1]][t[0]] = ' '; Q.brokenX.add(t[0] + ',' + t[1]); } } };
})();
