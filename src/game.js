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
    1: { intro: [
      { en: 'Hehehe... so THIS is the famous lantern-boy? Mr Shorty Phong welcomes you!', vi: 'Hê hê hê... vậy ĐÂY là cậu bé cầm đèn nổi tiếng? Mr Shorty Phong chào đón cậu!' },
      { en: 'My master Quoc wants you stopped. So let us play with my little trial.', vi: 'Chủ nhân Quoc muốn cậu dừng lại. Vậy hãy chơi thử thách nhỏ của ta nào.' },
      { en: 'No exit until every monster is dead. Tee-hee!', vi: 'Không có lối ra cho tới khi quái vật chết hết. Hí hí!' }
    ], outro: [
      { en: 'WHAT?! You beat my pets?! Impossible!', vi: 'CÁI GÌ?! Cậu đánh bại thú cưng của ta sao?! Không thể nào!' },
      { en: 'Hmph. Short men make LONG grudges, lantern-boy!', vi: 'Hừm. Người thấp thì thù DAI, cậu bé cầm đèn!' }
    ] },
    3: { intro: [
      { en: 'Back for more? The desert is MY garden, little lantern!', vi: 'Quay lại chịu đòn à? Sa mạc là vườn nhà ta, đèn con!' },
      { en: 'Three waves this time. Survive... or become sand.', vi: 'Lần này ba đợt. Sống sót... hoặc hóa thành cát.' }
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
      ents: [], items: [], projs: [], traps: [], fps: [], fires: [], gates: [], pz: [], solved: new Set(), brokenX: new Set(), trials: [], trialsDone: new Set(), nearPz: null, parts: [], boss: null, nearNpc: null, talk: null, state: 'intro', stateT: 0, t: 0, freeze: 0, shake: 0,
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
    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;
    for (const gd of L.gates) { const open = Q.solved.has(gd.id); for (let y = gd.y0; y <= gd.y1; y++) L.grid[y][gd.x] = open ? ' ' : 'G'; }
    for (const w of L.xwalls) for (const t of w.tiles) L.grid[t[1]][t[0]] = Q.brokenX.has(t[0] + ',' + t[1]) ? ' ' : 'X';
    Q.gates = L.gates.map(gd => Object.assign({}, gd, { open: Q.solved.has(gd.id), seqIdx: 0, timer: 0, levers: 0 }));
    for (const t of L.trials) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }
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
    const c = EN[type];
    const e = { type, cfg: c, x: x - c.w / 2, y: y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp: c.hp, dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 5, cd: rr(0.5, 1.5), flash: 0, st: 'patrol', stT: 0, hx: x, hy: y, onGround: false, minion: !!(s && s.minion), grp: s && s.grp, trial: s && s.trial };
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
    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC);
    Q.shake = 0.6;
  }
  function unseal() { const L = Q.L, ar = L.arena; for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }

  // ============================== UPDATE ==============================
  function hurtPlayer(n, fromX, noKnock) {
    const P = Q.P;
    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play' && Q.state !== 'bossplay') return false;
    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); return false; }
    P.hp -= n; P.inv = 1.2; Q.freeze = 0.07; Q.shake = 0.25;
    Snd.play('hurt'); Snd.hero('hurt');
    emit(P.x + P.w / 2, P.y + P.h / 2, 10, { col: ['#e0453a', '#f6f3e9'], sp0: 30, sp1: 90 });
    if (!noKnock) { P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 130; P.vy = -170; P.atk = 0; }
    if (P.hp <= 0) { P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); Snd.hero('die'); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 }); }
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
    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(r, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);
    // destroy projectiles
    for (const p of Q.projs) if (!p.boss && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
    for (const p of Q.projs) if (p.type !== 'wave' && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
  }
  function hurtEnemy(e, dmg) {
    e.hp -= dmg; e.flash = 0.12;
    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt');
    const P = Q.P;
    if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; }
    emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });
    if (e.hp <= 0) {
      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
      if (!e.minion) {
        const n = Math.random() < 0.55 ? 1 : 0;
        for (let i = 0; i < n + (e.cfg.hp >= 4 ? 2 : 0); i++) Q.items.push({ kind: 'coin', x: e.x + e.w / 2 + rr(-5, 5), y: e.y, id: -1, vy: -rr(60, 120), vx: rr(-40, 40), ph: 0, drop: true });
        if (Math.random() < 0.08) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });
        if (Math.random() < 0.1) { const w = ['dagger', 'dagger', 'bomb', 'flask'][(Math.random() * 4) | 0]; Q.items.push({ kind: 'pk', what: w, amt: w === 'dagger' ? 3 : 1, keep: false, x: e.x + e.w / 2, y: e.y, id: -1, vy: -90, vx: rr(-30, 30), ph: 0, drop: true }); }
      }
      Snd.play('boom');
    }
  }
  function hurtBoss(b, dmg) {
    b.hp -= dmg; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);
    Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);
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
      { const d2 = Math.abs(dx) + Math.abs(dy) * 0.5;
        if (!e.alerted && d2 < 110) { e.alerted = true; Snd.creature(e.type, 'alert'); e.vt = rr(2, 4); }
        else if (e.alerted && d2 < 170) { e.vt -= dt; if (e.vt <= 0) { e.vt = rr(3.5, 7); Snd.creature(e.type, 'idle'); } }
        else if (d2 > 230) e.alerted = false; }
      switch (c.ai) {
        case 'walk': case 'hop': case 'charge': {
          if (e.stun > 0) e.stun -= dt;
          if (e.onGround) {
            e.cd -= dt;
            if (c.ai === 'charge') {
              if (e.st === 'patrol') {
                e.vx = e.dir * c.sp;
                if (Math.abs(dx) < 100 && Math.abs(dy) < 26 && (dx > 0) === (e.dir > 0)) { e.st = 'wind'; e.stT = 0.4; e.vx = 0; Snd.creature(e.type, 'attack'); }
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
            if (e.cd <= 0) { e.cd = 2.2; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }
          }
          if (e.st === 'wind') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; const a = Math.atan2(dy, dx); firePr(e.x + e.w / 2, e.y + e.h / 2, Math.cos(a) * 85, Math.sin(a) * 85, { col: '#ff9a2a' }); } }
          break;
        }
        case 'shoot': {
          e.dir = dx > 0 ? 1 : -1; e.vy = Math.min(380, e.vy + GRAV * dt); moveY(e, e.vy * dt);
          e.cd -= dt;
          if (Math.abs(dx) < 160 && Math.abs(dy) < 70 && e.cd <= 0) { e.cd = 2.1; e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); }
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
        if (b.timer <= 0) { b.atk = c.pat[Math.floor(Math.random() * c.pat.length)]; if (b.atk === b.lastAtk && Math.random() < 0.7) b.atk = c.pat[(c.pat.indexOf(b.atk) + 1) % c.pat.length]; b.lastAtk = b.atk; b.st = 'tele'; b.timer = 0.6 / fury; Snd.creature(Q.li, 'attack', true); }
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
        if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true; Snd.play('heart'); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 10, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); } }
      } else if (it.kind === 'shard') {
        if (d < 13) { it.dead = true; save.shards[Q.li][it.k] = 1; writeSave(); Q.taken.add(it.id); Snd.play('shard'); Q.shardFlash = 1.2; emit(it.x, it.y, 30, { col: ['#ffd34e', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); const ts = totalShards(); Q.msg = (save.lang === 'vi' ? 'Mảnh nắng ' : 'Sun Shard ') + ts + '/21' + (ts % 3 === 0 ? (save.lang === 'vi' ? '  — Tim tối đa tăng!' : '  — Max hearts up!') : '') + (ts % 7 === 0 ? (save.lang === 'vi' ? '  — Kiếm mạnh hơn!' : '  — Sword stronger!') : ''); Q.msgT = 4; if (P.hp < maxHP()) P.hp = maxHP(); }
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
    Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer');
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
    else if (pz.type === 'cage') {
      if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { Q.msg = T('guards'); Q.msgT = 3; Snd.play('zap'); return; }
      startScripted('lyra', RESCUE, () => { pz.open = true; save.leek = true; writeSave(); Q.items.push({ kind: 'npc', who: 'lyra', x: pz.x, y: pz.y, id: -5, ph: 0 }); Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer'); emit(pz.x, pz.y - 14, 40, { col: ['#a4ffc0', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); });
    }
  }
  // ===================== Mr Shorty's trials =====================
  function sealTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = 'G'; Q.L.grid[y][tr.rw] = 'G'; } Snd.play('gate'); Q.shake = 0.6; }
  function openTrial(tr) { for (let y = 0; y < tr.gy; y++) { Q.L.grid[y][tr.lw] = ' '; Q.L.grid[y][tr.rw] = ' '; } Snd.play('gate'); }
  function spawnWave(tr) {
    const B = Q.B, d = 0.15 + tr.wave * 0.22 + Q.li * 0.06, pool = B.enemies.filter(e => e.min <= d);
    const n = 2 + tr.wave + (Q.li > 3 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      let tot = 0; pool.forEach(e => tot += e.w); let r = Math.random() * tot, type = pool[0].t;
      for (const e of pool) { r -= e.w; if (r <= 0) { type = e.t; break; } }
      const fx = (tr.lw + 3 + Math.random() * (tr.rw - tr.lw - 6)) * TS;
      const e = makeEnemy(type, fx, FLY.has(type) ? (tr.gy - 4) * TS : tr.gy * TS, {}); e.trial = tr.id; e.alerted = true; e.minion = false;
      Q.ents.push(e); emit(fx, e.y + e.h / 2, 14, { col: ['#c07bff', '#fff', '#6a3aa8'], sp0: 20, sp1: 80 });
    }
    tr.wave++; Q.msg = T('wave') + ' ' + tr.wave + ' / ' + tr.waves; Q.msgT = 3; Snd.play('zap');
  }
  function updateTrials(dt) {
    const P = Q.P;
    for (const tr of Q.trials) {
      if (tr.state === 'idle') {
        if (P.x > tr.trig * TS && P.x < tr.rw * TS - 8 && P.onGround) {
          tr.state = 'intro';
          startScripted('shorty', TRIAL[Q.li].intro, () => { sealTrial(tr); tr.state = 'active'; tr.cd = 0.8; });
        }
      } else if (tr.state === 'active') {
        if (Q.ents.some(e => !e.dead && e.trial === tr.id)) continue;
        tr.cd -= dt; if (tr.cd > 0) continue;
        if (tr.wave < tr.waves) { spawnWave(tr); tr.cd = 1.2; }
        else {
          tr.state = 'done'; Q.trialsDone.add(tr.id); openTrial(tr); Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic');
          const cx = (tr.lw + tr.rw) / 2 * TS;
          for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + i * 12, y: tr.gy * TS - 30, id: -1, vy: -120, vx: i ? 25 : -25, ph: 0, drop: true });
          for (let i = 0; i < 10; i++) Q.items.push({ kind: 'coin', x: cx + rr(-20, 20), y: tr.gy * TS - 30, id: -1, vy: -rr(80, 160), vx: rr(-50, 50), ph: 0, drop: true });
          Q.items.push({ kind: 'pk', what: 'bomb', amt: 2, keep: false, x: cx, y: tr.gy * TS - 30, id: -1, vy: -140, vx: 0, ph: 0, drop: true });
          startScripted('shorty', TRIAL[Q.li].outro, null);
        }
      }
    }
  }
  function updatePuzzles(dt) {
    const P = Q.P, pc = { x: P.x + 4, y: P.y + 7 };
    Q.nearPz = null;
    updateTrials(dt);
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
    updateEnemies(dt); updateBoss(dt); updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(dt); updateItems(dt); updateParticles(dt); updateCam(dt); updateWeather(dt);
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
    drawItems(camX, camY);
    drawTraps(camX, camY);
    drawPuzzles(camX, camY);
    drawFps(camX, camY);
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
    const dark = B.dark + (Q.arenaSealed && Q.li !== 2 ? 0.0 : 0);
    const flick = Math.sin(Q.t * 9) * 2 + Math.sin(Q.t * 5.3) * 1.5;
    const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: ((B.dark > 0.5 ? 70 : 90) + flick) * (hasRelic(2) ? 1.45 : 1), i: 1 }];
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
      txt(T('died'), VW / 2, 90, { al: 'center', size: 14, bold: true, col: '#e0453a', alpha: a });
      if (Q.stateT > 0.8) txt(T('retry'), VW / 2, 120, { al: 'center', size: 8 });
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
    if (save.cleared.length) it.push({ k: 'cont', fn: () => { mapSel = maxPlayable(); toScene('map'); } });
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
