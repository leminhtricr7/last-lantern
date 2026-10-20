'use strict';
// ============================== LAST LANTERN ==============================
(function () {
  const BVW = BASE_VW, BVH = BASE_VH;
  let VW = BVW, VH = BVH;   // the world view; widened while the camera zooms out (huge sea cave, deep pit)
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  const buf = document.createElement('canvas'); buf.width = VW; buf.height = VH;
  const g = buf.getContext('2d');
  const lightC = document.createElement('canvas'); lightC.width = Math.ceil(VW / 0.55); lightC.height = Math.ceil(VH / 0.55);
  const lg = lightC.getContext('2d');
  const FONT = "'LLPixel','VT323','Pixelify Sans','Consolas','Courier New',monospace";
  let scale = 3, offX = 0, offY = 0, DPR = 1;
  const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  let rotated = false; // phone held upright: we rotate the whole game 90deg so it always plays landscape
  function resize() {
    const w = innerWidth, h = innerHeight;
    DPR = Math.min(3, window.devicePixelRatio || 1);   // a canvas as sharp as the screen (4K / retina): every game pixel is an exact block of screen pixels
    rotated = IS_TOUCH && h > w;
    if (rotated) {
      cv.width = Math.round(h * DPR); cv.height = Math.round(w * DPR);
      cv.style.cssText = 'position:fixed;left:0;top:0;transform-origin:0 0;transform:translateX(' + w + 'px) rotate(90deg);width:' + h + 'px;height:' + w + 'px;';
    } else { cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); cv.style.cssText = ''; }
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
  let save = { cleared: [], shards: {}, coins: 0, lang: 'vi', vol: 0.6, relics: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ammo: { dagger: 0, bomb: 0, flask: 0 }, leek: false };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVEKEY) || '{}')); } catch (e) { }
  const DEMO = location.search.indexOf('leekdemo') >= 0; // ?leekdemo: try the leek blade without touching your save
  let coop = null, inSwap = 0;   // online co-op session (see ONLINE CO-OP below); inSwap > 0 while a guest's hero is being simulated
  const writeSave = () => { if (DEMO || inSwap) return; try { localStorage.setItem(SAVEKEY, JSON.stringify(save)); } catch (e) { } };
  if (!Array.isArray(save.relics)) save.relics = [];
  while (save.relics.length < 10) save.relics.push(0);
  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };
  if (!Array.isArray(save.orbs)) save.orbs = []; if (!save.eggs || typeof save.eggs !== 'object') save.eggs = {};
  save.rare = save.rare | 0; if (!save.rareGot || typeof save.rareGot !== 'object') save.rareGot = {};
  save.bonusHP = save.bonusHP | 0; save.bonusDmg = save.bonusDmg | 0; if (!save.cos || typeof save.cos !== 'object') save.cos = {};
  if (!Array.isArray(save.heroUnlock)) save.heroUnlock = [];
  save.leek = !!save.leek;
  if (!save.inv || typeof save.inv !== 'object') save.inv = {};
  save.inv.own = Array.isArray(save.inv.own) ? save.inv.own.filter(id => ITEM[id]) : [];
  save.inv.own = save.inv.own.filter((id, i, arr) => arr.indexOf(id) === i);
  if (save.inv.own.indexOf('iron') < 0) save.inv.own.unshift('iron');
  if (!Array.isArray(save.inv.w) || save.inv.w.length < 2) save.inv.w = ['iron', null];
  save.inv.w = save.inv.w.slice(0, 2).map(id => (ITEM[id] && save.inv.own.indexOf(id) >= 0) ? id : null);
  if (!ITEM[save.inv.armor] || save.inv.own.indexOf(save.inv.armor) < 0) save.inv.armor = null;
  if (!ITEM[save.inv.pet] || save.inv.own.indexOf(save.inv.pet) < 0) save.inv.pet = null;
  save.inv.gems = save.inv.gems | 0;
  if (save.leek && save.inv.own.indexOf('leek') < 0) { save.inv.own.push('leek'); save.inv.w[0] = 'leek'; }
  if (save.leek) for (const id of ['leekarmor', 'leekpet']) if (save.inv.own.indexOf(id) < 0) save.inv.own.push(id);
  if (!save.inv.w.some(id => id && ITEM[id].type === 'sword')) save.inv.w[0] = 'iron';
  const totalShards = () => Object.keys(save.shards).reduce((a, k) => a + save.shards[k].filter(Boolean).length, 0);
  const hasRelic = i => !!save.relics[i];
  const armHP = () => { const a = ITEM[save.inv.armor]; return a ? (a.st.hp || 0) : 0; };
  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + (hasRelic(8) ? 1 : 0) + armHP() + (save.bonusHP | 0);
  const maxHP = () => (Q && Q.P && Q.P.hero && Q.P.mhp) || baseHP();
  const baseDmg = () => Math.max(1, (Q && Q.P && Q.P.hdmg || 0) + (Q && Q.G && Q.G.powerT > 0 ? 2 : 0) + 1 + (save.bonusDmg | 0) + Math.floor(totalShards() / 7) + (hasRelic(1) ? 1 : 0) + ((ITEM[save.inv.pet] || { st: {} }).st.role === 'rainbow' ? 1 : 0));
  const swordDmg = () => baseDmg() + save.inv.w.reduce((m, id) => (ITEM[id] && ITEM[id].type === 'sword' ? Math.max(m, ITEM[id].st.dmg || 0) : m), 0);
  const UNLOCK_ALL = false; // set to false for release: then each win unlocks the next map
  const maxPlayable = () => UNLOCK_ALL ? 9 : save.cleared.length ? Math.min(9, Math.max.apply(null, save.cleared.map(LPOS)) + 1) : 0;   // a position in LORDER
  const sunPower = () => save.cleared.length / 7;
  Snd.setVol(save.vol);

  const STR = {
    newgame: { en: 'New Game', vi: 'Chơi mới' }, shopT: { en: 'Shop & Inventory', vi: 'Cửa hàng & Kho đồ' }, cont: { en: 'Continue', vi: 'Tiếp tục' }, coopT: { en: 'Online Co-op (5 players)', vi: 'Co-op online (5 người)' }, credits: { en: 'Credits', vi: 'Thực hiện bởi' },
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
    ctl: { en: 'Move A/D  Jump Space  Attack J / Click  Weapon T  Throw L / Right-click  Item Q / Wheel  Dash K  Parry F  Skills 1-4  Use E', vi: 'Di chuyển A/D  Nhảy Space  Đánh J / Nhấp chuột  Đổi vũ khí T  Ném L / Chuột phải  Đổi đồ Q / Lăn chuột  Lướt K  Đỡ đòn F  Kỹ năng 1-4  Dùng E' },
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
    { en: 'Long ago, the Sun watched over the land of Aurelia. No night was ever truly dark, and every village kept a little lantern lit in its honour.', vi: 'Ngày xửa ngày xưa, Mặt Trời dõi theo vùng đất Aurelia. Không đêm nào thật sự tối, và mỗi ngôi làng đều thắp một chiếc đèn nhỏ để tạ ơn.' },
    { en: 'But beneath the world, in a throne of cinders, something ancient was starving. Quoc the Devil, lord of the Eclipse, hated the light.', vi: 'Nhưng dưới lòng đất, trên ngai vàng bằng tro nguội, có một thứ cổ xưa đang đói khát. Quoc Ác Quỷ, chúa tể Nhật Thực, căm ghét ánh sáng.' },
    { en: 'On the longest night he rose, and swallowed the Sun in one bite. It cracked like glass and fell as seven burning fragments.', vi: 'Vào đêm dài nhất, hắn trỗi dậy và nuốt chửng Mặt Trời. Nó vỡ như thủy tinh và rơi xuống thành bảy mảnh cháy rực.' },
    { en: 'The lanterns of Aurelia went out, one by one. Cold crept in. Monsters crawled from the dark, and Quoc\'s minions took anyone who sang of the light.', vi: 'Những chiếc đèn của Aurelia tắt dần, từng chiếc một. Giá lạnh tràn vào. Quái vật bò ra từ bóng tối, và thuộc hạ của Quoc bắt đi bất cứ ai còn hát về ánh sáng.' },
    { en: 'In a quiet village, a boy named Ember kept his grandmother\'s lantern. It flickered. It nearly died. But it never went out.', vi: 'Ở một ngôi làng yên ắng, cậu bé Ember giữ chiếc đèn của bà. Nó chập chờn. Nó suýt tắt. Nhưng nó chưa bao giờ tắt hẳn.' },
    { en: 'Lila, the village girl, pressed a rusty sword into his hands. "It is not much," she said. "But a small flame and a stubborn heart have beaten bigger darkness."', vi: 'Lila, cô gái trong làng, đặt một thanh kiếm gỉ vào tay cậu. "Không nhiều đâu," cô nói. "Nhưng một ngọn lửa nhỏ và một trái tim bướng bỉnh từng thắng bóng tối lớn hơn."' },
    { en: 'You are Ember, the last Lanternbearer. Cross meadow, forest, cavern, desert, peak and fire. Gather the seven fragments. Relight the Sun.', vi: 'Bạn là Ember, người mang đèn cuối cùng. Băng qua đồng cỏ, rừng sâu, hang động, sa mạc, đỉnh băng và núi lửa. Gom bảy mảnh vỡ. Thắp lại Mặt Trời.' }
  ];
  // short story beats shown once, the first time you enter each map
  let storyLevel = 0;
  const MAP_STORY = {
    0: [
      { en: 'VERDANT MEADOW. Ember walks out of the village at dawn that is not a dawn. The sky is the colour of old ash.', vi: 'ĐỒNG CỎ XANH. Ember bước ra khỏi làng vào một buổi bình minh không còn là bình minh. Bầu trời mang màu tro cũ.' },
      { en: 'The meadow was once the happiest place in Aurelia. Children raced kites here. Now the grass lies flat and the kites hang torn in the branches.', vi: 'Đồng cỏ từng là nơi vui nhất Aurelia. Bọn trẻ thả diều ở đây. Giờ cỏ rạp xuống và những chiếc diều rách treo trên cành cây.' },
      { en: 'Ember grips the rusty sword Lila gave him. His lantern shakes in his other hand. He is afraid, and he walks on anyway.', vi: 'Ember siết thanh kiếm gỉ Lila trao. Chiếc đèn rung trong tay còn lại. Cậu sợ, nhưng vẫn bước tiếp.' },
      { en: 'Slimes ooze across the path. Bees buzz with a cold, angry hum. Quoc\'s shadow has soured everything that once was sweet.', vi: 'Slime trườn qua lối đi. Ong vo ve bằng tiếng ù lạnh lẽo, giận dữ. Bóng của Quoc đã làm chua mọi thứ từng ngọt ngào.' },
      { en: 'Then, from far away, a voice. A girl, singing. Her song is thin and trembling, but it is the first warm sound Ember has heard in three nights.', vi: 'Rồi từ xa vọng lại một giọng hát. Một cô gái. Tiếng hát mỏng manh, run rẩy, nhưng là âm thanh ấm áp đầu tiên Ember nghe được sau ba đêm.' },
      { en: 'Lila\'s words come back to him: \"A small flame beats a big darkness, if it keeps burning.\" He lifts the lantern higher.', vi: 'Lời Lila vang lại: \"Ngọn lửa nhỏ thắng bóng tối lớn, nếu nó cứ cháy.\" Cậu giơ chiếc đèn lên cao hơn.' },
      { en: 'Above the meadow, a shape with great ash-grey wings circles slowly. Ignarok the Ashwing is hunting for the last flame in Aurelia.', vi: 'Trên đồng cỏ, một bóng đen với đôi cánh xám tro khổng lồ lượn vòng chậm rãi. Ignarok Cánh Tro đang săn ngọn lửa cuối cùng của Aurelia.' },
      { en: 'Find the singer. Survive the Ashwing. Take the first fragment of the Sun. Your journey begins now, Ember.', vi: 'Hãy tìm người hát. Sống sót trước Cánh Tro. Lấy mảnh Mặt Trời đầu tiên. Hành trình của bạn bắt đầu từ bây giờ, Ember.' }
    ],
    1: [
      { en: 'WHISPERING FOREST. Here the trees listen. Old mechanisms of the Lanternbearers still sleep among the roots.', vi: 'RỪNG THÌ THẦM. Ở đây cây cối biết lắng nghe. Những cơ quan cổ của các Người Mang Đèn vẫn ngủ yên giữa rễ cây.' },
      { en: 'A small man in a tall hat is watching you from the branches, grinning. Mr Shorty Phong has been waiting.', vi: 'Một người đàn ông thấp bé đội mũ cao đang cười toe nhìn bạn từ trên cành cây. Mr Shorty Phong đã chờ sẵn.' }
    ],
    2: [
      { en: 'CRYSTAL CAVERNS. The crystals were once the Sun\'s tears. Now they glow weakly, like a heartbeat fading.', vi: 'HANG PHA LÊ. Những viên pha lê từng là nước mắt của Mặt Trời. Giờ chúng chỉ sáng yếu ớt, như nhịp tim đang tàn.' },
      { en: 'It is dark enough that your lantern feels like the only star. Something in the dark is learning your name.', vi: 'Tối đến mức chiếc đèn của bạn như ngôi sao duy nhất. Có thứ gì đó trong bóng tối đang học thuộc tên bạn.' }
    ],
    3: [
      { en: 'SUNSCORCH DESERT. The sand remembers the Sun better than anyone. It still burns by day, and by night it burns with hate.', vi: 'SA MẠC CHÁY NẮNG. Cát nhớ Mặt Trời hơn bất kỳ ai. Ban ngày nó vẫn nóng, ban đêm nó cháy bằng hận thù.' },
      { en: 'Buried here sleeps the Sand Pharaoh, who swore loyalty to Quoc for a promise of eternal night. Walk lightly, Lanternbearer.', vi: 'Nơi đây chôn vùi Pharaoh Cát, kẻ đã thề trung thành với Quoc đổi lấy lời hứa về đêm vĩnh cửu. Bước nhẹ thôi, Người Mang Đèn.' }
    ],
    4: [
      { en: 'FROSTBITE PEAKS. Snow falls upward here, as if the sky itself is trying to escape. Your lantern burns blue at the edges.', vi: 'ĐỈNH BĂNG GIÁ. Tuyết rơi ngược lên trời, như thể bầu trời đang cố trốn chạy. Ngọn đèn của bạn cháy xanh ở viền.' },
      { en: 'The Frost King wanted only to be left alone, once. Quoc whispered that the Sun was the thing that melted his crown.', vi: 'Vua Băng Giá từng chỉ muốn được yên thân. Quoc thì thầm rằng Mặt Trời chính là thứ đã làm tan vương miện của ông.' }
    ],
    5: [
      { en: 'EMBER VOLCANO. The heat is almost kind after the cold. This is where Ignarok swore he would return, and where Quoc keeps his forge.', vi: 'NÚI LỬA THAN HỒNG. Hơi nóng gần như dễ chịu sau giá lạnh. Đây là nơi Ignarok thề sẽ trở lại, và là lò rèn của Quoc.' },
      { en: 'Your sword is no longer rusty. Every fragment you carry hums with the Sun\'s old song. Quoc can hear it. He is afraid.', vi: 'Thanh kiếm của bạn không còn gỉ nữa. Mỗi mảnh vỡ bạn mang đều ngân lên bài ca cũ của Mặt Trời. Quoc nghe thấy. Hắn đang sợ.' }
    ],
    6: [
      { en: 'SHADOW CITADEL. The last door of Aurelia. Behind it, the Eclipse waits where the Sun was swallowed.', vi: 'THÀNH TRÌ BÓNG ĐÊM. Cánh cửa cuối cùng của Aurelia. Phía sau là Nhật Thực, nơi Mặt Trời bị nuốt chửng.' },
      { en: 'Everyone you met believes in you: Lila, Lyra, Captain Bram, even sad old QuanSadBoy. Your lantern is small. It is also all of them.', vi: 'Tất cả những người bạn gặp đều tin vào bạn: Lila, Lyra, Đội trưởng Bram, cả QuanSadBoy buồn bã. Đèn của bạn nhỏ thôi. Nhưng nó cũng là tất cả họ.' },
      { en: 'Step through, Ember. Relight the Sun.', vi: 'Bước vào đi, Ember. Hãy thắp lại Mặt Trời.' }
    ]
  };
  const ENDING = [
    { en: 'The Shadow Citadel trembles. The seventh fragment burns in Ember\'s hand, brighter than anything he has ever held.', vi: 'Thành Trì Bóng Đêm rung chuyển. Mảnh thứ bảy cháy trong tay Ember, sáng hơn bất cứ thứ gì cậu từng cầm.' },
    { en: 'The Eclipse screams. For a heartbeat it is no longer a hunger, only a shadow of something that was once lonely and afraid.', vi: 'Nhật Thực gào thét. Trong một nhịp tim, nó không còn là cơn đói, chỉ còn là cái bóng của thứ từng cô đơn và sợ hãi.' },
    { en: 'The Eclipse breaks. The darkness pours out of the sky like water out of a cracked bowl, and the stars come back behind it.', vi: 'Nhật Thực vỡ tan. Bóng tối đổ khỏi bầu trời như nước chảy khỏi chiếc bát nứt, và các vì sao hiện về phía sau nó.' },
    { en: 'Seven fragments rise out of the ruins. They find each other. They turn, slowly, around a place in the sky where the Sun used to be.', vi: 'Bảy mảnh vỡ bay lên từ đống đổ nát. Chúng tìm thấy nhau. Chúng xoay chậm quanh nơi Mặt Trời từng ngự trị.' },
    { en: 'They join with a sound like a thousand bells. The Sun is whole again, and it burns.', vi: 'Chúng hợp lại với âm thanh như ngàn chiếc chuông. Mặt Trời nguyên vẹn trở lại, và nó bừng cháy.' },
    { en: 'Dawn breaks over Aurelia. In the village, every lantern lights by itself, one after another, all the way to the sea.', vi: 'Bình minh ló rạng trên Aurelia. Trong làng, mọi chiếc đèn tự thắp sáng, cái này đến cái khác, cho tới tận biển.' },
    { en: 'Lila runs through the square laughing. Captain Bram takes off his helmet. Princess Lyra stands on the meadow and sings, and this time the whole world sings with her.', vi: 'Lila chạy qua quảng trường, cười vang. Đội trưởng Bram bỏ mũ giáp. Công chúa Lyra đứng trên đồng cỏ cất tiếng hát, và lần này cả thế giới hát cùng cô.' },
    { en: 'Even QuanSadBoy closes his thick book and smiles for the first time. Mr Shorty Phong, from the top of a tree, sulks that he did not win. Then, quietly, he waves.', vi: 'Ngay cả QuanSadBoy cũng gấp cuốn sách dày lại và mỉm cười lần đầu tiên. Mr Shorty Phong, từ trên ngọn cây, hờn dỗi vì không thắng. Rồi lặng lẽ vẫy tay.' },
    { en: 'And Ember? His little lantern flickers in the sunlight. It does not need to burn so hard anymore. It dims, softly, like a friend finally allowed to rest.', vi: 'Còn Ember? Chiếc đèn nhỏ chập chờn trong nắng. Nó không cần cháy gắt như trước nữa. Nó dịu đi, nhẹ nhàng, như một người bạn cuối cùng được nghỉ ngơi.' },
    { en: 'Ember sets it down on the windowsill of his grandmother\'s house. The light of the Sun falls on it, and for a moment it seems to glow back.', vi: 'Ember đặt nó lên bệ cửa sổ nhà bà. Ánh sáng Mặt Trời rọi xuống, và trong khoảnh khắc nó dường như sáng đáp lại.' },
    { en: 'The last Lanternbearer has done what no one thought possible. A small flame, and a stubborn heart.', vi: 'Người Mang Đèn cuối cùng đã làm điều không ai tin nổi. Một ngọn lửa nhỏ, và một trái tim bướng bỉnh.' },
    { en: 'Thank you, Ember.', vi: 'Cảm ơn bạn, Ember.' }
  ];

  const NPCS = {
    lila: { spr: 'npc_lila', name: { en: 'Lila', vi: 'Lila' } },
    bram: { spr: 'npc_bram', name: { en: 'Captain Bram', vi: 'Đội trưởng Bram' } },
    gob: { spr: 'npc_gob', name: { en: 'Gob the Swamp Goblin', vi: 'Gob Yêu Tinh Đầm Lầy' }, shop: true },
    angel: { spr: 'npc_angel', name: { en: 'Seraph', vi: 'Thiên thần Seraph' }, bless: true },
    trader: { spr: 'npc_trader', name: { en: 'Mira the Gem Trader', vi: 'Mira - Thương Nhân Ngọc' }, trade: true, generic: [{ en: 'Oh! A lantern-bearer! I trade in Star Gems - four of them hide in every land, usually somewhere high.', vi: 'Ô! Người mang đèn đây rồi! Tôi buôn Ngọc Sao - mỗi vùng đất giấu bốn viên, thường ở chỗ cao.' }, { en: 'Bring me gems and I will give you treasures you cannot buy anywhere else. Even secret heroes!', vi: 'Mang ngọc tới đây, tôi sẽ đổi cho bạn những báu vật không đâu bán. Cả hero bí mật nữa!' }] }
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
  const LYRA_NAME = { en: 'Princess Lyra', vi: 'Công chúa Lyra' }; // change here if you rename the character
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
    { en: 'Mr Shorty Phong\'s great beetle is finished, and you climbed all the way up here! You are very brave.', vi: 'Con bọ khổng lồ của Mr Shorty Phong đã gục, và bạn còn leo tận lên đây! Bạn dũng cảm quá.' },
    { en: 'You... you came for me? The cage is open! Oh, thank the light!', vi: 'Bạn... bạn đến cứu mình sao? Lồng mở rồi! Ôi, tạ ơn ánh sáng!' },
    { en: 'I am Lyra, Princess of the Singing Meadow. When the Sun shattered, Quoc\'s minions locked me up to silence my song.', vi: 'Mình là Lyra, công chúa của Đồng Cỏ Hát Ca. Khi Mặt Trời vỡ, thuộc hạ của Quoc nhốt mình lại để dập tắt bài hát.' },
    { en: 'My song is the only thing that makes the leek-blade shine. It is a royal treasure, and it has waited for a Lanternbearer.', vi: 'Bài hát của mình là thứ duy nhất làm cây kiếm hành phát sáng. Nó là bảo vật hoàng gia, và đã chờ một Người Mang Đèn.' },
    { en: 'Please take it! Hold it high and it will sing with your flame. It is stronger than your rusty sword, and it will grow brighter with every fragment you find.', vi: 'Xin hãy nhận lấy! Giơ cao lên và nó sẽ hát cùng ngọn lửa của bạn. Nó mạnh hơn thanh kiếm gỉ, và sẽ sáng hơn sau mỗi mảnh vỡ bạn tìm được.' },
    { en: 'Take my Leek Armor too, it will stun anyone who dares to hit you. And my Flying Leek will carry you through the sky and heal you a little. Ride it!', vi: 'Nhận luôn Giáp Hành Lá của mình nữa, nó làm choáng kẻ nào dám đánh bạn. Và Cây Hành Bay sẽ chở bạn bay trên trời, còn hồi máu cho bạn chút ít. Cưỡi nó nhé!' },
    { en: 'I will not forget this, Ember. Whenever you are tired, listen... I will sing for you. La la laaa~ ♪', vi: 'Mình sẽ không quên ơn này, Ember. Mỗi khi mệt mỏi, hãy lắng nghe... mình sẽ hát cho bạn. La la laaa~ ♪' }
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
  const SPK = { quoc: { name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' }, col: '#ff5a4a' }, shorty: { name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, col: '#ffd34e' }, imp: { name: { en: 'Imp', vi: 'Tiểu quỷ' }, col: '#c07bff' }, sy: { name: { en: 'Mr Sy', vi: 'Mr Sy' }, col: '#7ed957' } };
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
      { w: 'sy', en: 'He also gave the hero snacks, my lord. I watched. I took notes.', vi: 'Hắn còn đưa đồ ăn vặt cho anh hùng nữa, thưa chủ nhân. Thần đã quan sát. Thần đã ghi chép.' },
      { w: 'quoc', shout: 1, en: 'SNACKS?! UNFORGIVABLE!!', vi: 'ĐỒ ĂN VẶT?! KHÔNG THỂ THA THỨ!!' }
    ],
    [ // after Sunscorch Desert
      { w: 'quoc', shout: 1, en: 'MY PHARAOH! MY SANDS! MY PYRAMID COLLECTION!', vi: 'PHARAOH CỦA TA! CÁT CỦA TA! BỘ SƯU TẬP KIM TỰ THÁP CỦA TA!' },
      { w: 'shorty', en: 'Master, I tried my little trial again. He... passed.', vi: 'Thưa chủ nhân, thần lại thử thách nhỏ của thần. Hắn... vượt qua rồi.' },
      { w: 'quoc', shout: 1, en: 'AGAIN?! YOU CANNOT EVEN BEAT A CHILD WITH A LANTERN?!', vi: 'LẠI NỮA SAO?! NGƯƠI KHÔNG THỂ THẮNG NỔI MỘT ĐỨA TRẺ CẦM ĐÈN?!' },
      { w: 'shorty', en: '...I am very short, my lord. It is hard to see him coming.', vi: '...Thần rất thấp, thưa ngài. Khó mà thấy hắn đang tới.' },
      { w: 'quoc', shout: 1, en: 'THEN STAND ON A BOX AND TRY HARDER!!', vi: 'THÌ ĐỨNG LÊN CÁI HỘP VÀ CỐ GẮNG HƠN!!' },
      { w: 'sy', en: 'Allow me, my lord. The boy keeps eating my little experiments. I will meet him in the Citadel with something... more dramatic.', vi: 'Xin để thần, thưa chủ nhân. Thằng nhóc cứ ăn hết mấy thí nghiệm nhỏ của thần. Thần sẽ gặp hắn ở Thành Trì với thứ gì đó... kịch tính hơn.' },
      { w: 'quoc', shout: 1, en: 'FINALLY! SOMEONE WITH A PLAN!!', vi: 'CUỐI CÙNG! CÓ KẺ CÓ KẾ HOẠCH RỒI!!' }
    ],
    [ // after Frostbite Peaks
      { w: 'quoc', shout: 1, en: 'THE FROST KING MELTED?! HE WAS FROZEN BY DEFINITION!', vi: 'VUA BĂNG TAN CHẢY SAO?! THEO ĐỊNH NGHĨA HẮN LÀ BĂNG CƠ MÀ!' },
      { w: 'sy', en: 'He used fire flasks, my lord. I... may have underestimated the Frost King\'s melting point.', vi: 'Hắn dùng bình lửa, thưa chủ nhân. Thần... có lẽ đã đánh giá thấp điểm nóng chảy của Vua Băng.' },
      { w: 'quoc', shout: 1, en: 'THEN FREEZE THE FLASKS, YOU FOOL!!', vi: 'THÌ ĐÓNG BĂNG CÁI BÌNH ĐÓ ĐI, ĐỒ NGỐC!!' },
      { w: 'shorty', en: 'Only the volcano and the Citadel remain, my lord...', vi: 'Chỉ còn núi lửa và Thành Trì thôi, thưa ngài...' },
      { w: 'quoc', shout: 1, en: 'ENOUGH! WAKE THE TITAN! AND IF HE FAILS... WAKE THE ECLIPSE!', vi: 'ĐỦ RỒI! ĐÁNH THỨC TITAN! VÀ NẾU HẮN THẤT BẠI... ĐÁNH THỨC NHẬT THỰC!' }
    ],
    [ // after Ember Volcano
      { w: 'quoc', shout: 1, en: 'THE TITAN IS ASH!! ASH!!! HE WAS MY FAVORITE VOLCANO!', vi: 'TITAN THÀNH TRO RỒI!! TRO!!! HẮN LÀ NGỌN NÚI LỬA YÊU THÍCH CỦA TA!' },
      { w: 'shorty', en: 'Master... six fragments of the Sun burn together again.', vi: 'Thưa chủ nhân... sáu mảnh Mặt Trời lại cháy cùng nhau.' },
      { w: 'quoc', shout: 1, en: 'THEN THE ECLIPSE WILL END THIS! AWAKEN IT!!', vi: 'VẬY NHẬT THỰC SẼ KẾT THÚC TẤT CẢ! ĐÁNH THỨC NÓ!!' },
      { w: 'sy', en: 'My lord, Shorty and I will hold the Citadel. My serpent is hungry... and so is his hat.', vi: 'Thưa chủ nhân, thần và Shorty sẽ giữ Thành Trì. Con rắn của thần đang đói... và cái mũ của hắn cũng vậy.' },
      { w: 'quoc', shout: 1, en: 'GO, BOTH OF YOU! AND IF THE LANTERN REACHES ME... I WILL BECOME SEVEN!', vi: 'ĐI ĐI, CẢ HAI NGƯƠI! VÀ NẾU CHIẾC ĐÈN ĐẾN ĐƯỢC CHỖ TA... TA SẼ HÓA THÀNH BẢY!' },
      { w: 'quoc', shout: 1, en: 'LET THE WORLD GO DARK FOREVER!!!', vi: 'ĐỂ THẾ GIỚI TỐI ĐEN MÃI MÃI!!!' }
    ]
  ];
  NPCS.dragon = { spr: 'dragon_head', name: { en: 'Ignarok the Ashwing', vi: 'Ignarok Cánh Tro' } };
  NPCS.dragon.generic = [{ en: 'ROAAAR!', vi: 'GÀOOO!' }];
  // ---------- the new cast: Mr Sy, Quoc, and the four helpers who appear on maps 2-5 ----------
  Object.assign(NPCS, {
    sy: { spr: 'npc_sy', name: { en: 'Mr Sy', vi: 'Mr Sy' } },
    quoc: { spr: 'npc_quoc', name: { en: 'Quoc the Devil', vi: 'Quỷ Vương Quoc' } },
    ember: { spr: 'hero_idle', name: { en: 'Ember', vi: 'Ember' } },
    narr: { spr: null, name: { en: 'Story', vi: 'Kể chuyện' } },
    hoang: { spr: 'npc_hoang', name: { en: 'HoangKiller', vi: 'HoangKiller' } },
    duong: { spr: 'npc_duong', name: { en: 'DuongDracular', vi: 'DuongDracular' } },
    santree: { spr: 'npc_santree', name: { en: 'Santree', vi: 'Santree' } }
  });
  NPCS.sy.generic = [{ en: 'Hm.', vi: 'Hm.' }];
  NPCS.quoc.generic = [{ en: 'GRRR!', vi: 'GRRR!' }];
  NPCS.hoang.generic = [{ en: 'Whistle when you need me.', vi: 'Huýt sáo khi cần tôi nhé.' }];
  NPCS.duong.generic = [{ en: 'Call, and the bats will answer.', vi: 'Hãy gọi, và lũ dơi sẽ đáp lời.' }];
  NPCS.santree.generic = [{ en: 'Ho ho ho! Hope grows here.', vi: 'Ho ho ho! Hy vọng mọc ở đây.' }];
  DLG[2] = Object.assign(DLG[2] || {}, { hoang: [
    { en: 'Psst. Do not scream. I am HoangKiller. Yes, killer. Of boredom, mostly.', vi: 'Suỵt. Đừng la. Tôi là HoangKiller. Ừ, sát thủ. Chủ yếu là giết thời gian chán.' },
    { en: 'I came into these caves for a rare crystal, and a very rude Golem chased me back out. We have history.', vi: 'Tôi vào hang này tìm một viên pha lê hiếm, và một Người Khổng Lồ rất thô lỗ đuổi tôi chạy ra. Tụi tôi có thù cũ.' },
    { en: 'Wait... you are the lantern kid? The one who beat the Spider Queen with a LEEK? QuanSadBoy wrote me about you!', vi: 'Khoan... cậu là cậu bé cầm đèn? Người đã hạ Nữ Hoàng Nhện bằng một CÂY HÀNH? QuanSadBoy đã viết thư kể về cậu!' },
    { en: 'Listen. When you face Quoc himself, I will find you. HoangKiller never misses a fight that matters.', vi: 'Nghe này. Khi cậu đối đầu với chính Quoc, tôi sẽ tìm cậu. HoangKiller không bao giờ bỏ lỡ một trận chiến quan trọng.' }
  ] });
  DLG[3] = Object.assign(DLG[3] || {}, { duong: [
    { en: 'Ah... the Sun has fallen, so a vampire may walk the desert at noon. Irony is delicious.', vi: 'À... Mặt Trời đã rơi, nên một ma cà rồng có thể đi trên sa mạc giữa trưa. Sự trớ trêu thật ngon.' },
    { en: 'I am Duong Dracular, count of nothing and keeper of a very large tomb. I was napping when the Pharaoh\'s sand woke me.', vi: 'Ta là Duong Dracular, bá tước của hư vô và người giữ một ngôi mộ rất lớn. Ta đang ngủ trưa thì cát của Pharaoh đánh thức ta.' },
    { en: 'You carry the Sun\'s flame? ...I know you. QuanSadBoy\'s letter said: "a boy with a lantern; protect him." Fascinating.', vi: 'Cậu mang ngọn lửa của Mặt Trời sao? ...Ta biết cậu. Thư của QuanSadBoy viết: "một cậu bé cầm đèn; hãy bảo vệ cậu ấy." Thú vị.' },
    { en: 'I do not fight in daylight, usually. For you I will make an exception. Call, and my bats will answer.', vi: 'Thường thì ta không chiến đấu dưới ánh sáng. Vì cậu ta sẽ ngoại lệ. Hãy gọi, và lũ dơi của ta sẽ đáp lời.' }
  ] });
  DLG[4] = Object.assign(DLG[4] || {}, { santree: [
    { en: 'HO HO HO! Do not mind me, I am a tree. A walking one. A... SANTREE! Hee!', vi: 'HO HO HO! Đừng bận tâm tôi, tôi là một cái cây. Một cây biết đi. Một... SANTREE! Hí!' },
    { en: 'I was a seed in the north before Quoc\'s winter. The Frost King froze my forest and I had to walk away. Walking is hard with roots.', vi: 'Tôi từng là một hạt giống ở phương bắc trước mùa đông của Quoc. Vua Băng đóng băng rừng của tôi và tôi phải bỏ đi. Đi bộ khó lắm khi có rễ.' },
    { en: 'You are the one who melted the king? Duong\'s bats told me! We trees talk. Mostly about you.', vi: 'Cậu là người đã làm tan chảy vị vua đó? Lũ dơi của Duong kể tôi nghe! Cây cối tụi tôi hay nói chuyện. Chủ yếu là về cậu.' },
    { en: 'When the final night comes, Santree will plant itself right next to you. Presents optional. Hee hee!', vi: 'Khi đêm cuối cùng đến, Santree sẽ cắm rễ ngay cạnh cậu. Quà tặng không bắt buộc. Hí hí!' }
  ] });

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
    young: { stages: [{ form: 0, hp: 45, armor: 0, w: 58, h: 28, sp: 52, skills: ['fireballs', 'dive', 'breath', 'gust', 'perch'] }] },
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
  function txt(s, x, y, o) { o = o || {}; texts.push({ grad: o.grad, ol: o.ol, glow: o.glow, ls: o.ls, s, x, y, size: o.size || 8, col: o.col || '#fff', al: o.al || 'left', sh: o.sh === undefined ? true : o.sh, alpha: o.alpha === undefined ? 1 : o.alpha, bold: o.bold }); }
  function flushTexts() {
    ctx.textBaseline = 'middle';
    for (const t of texts) {
      ctx.font = (t.bold ? 'bold ' : '') + Math.round(t.size * scale) + 'px ' + FONT;
      ctx.textAlign = t.al; ctx.globalAlpha = t.alpha;
      const px = offX + t.x * scale, py = offY + t.y * scale;
      ctx.letterSpacing = t.ls ? Math.round(t.ls * scale) + 'px' : '0px';
      if (t.sh && !t.ol) { ctx.fillStyle = '#0a0612'; ctx.fillText(t.s, px + scale, py + scale); }
      if (t.ol) { ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, Math.round(scale * 1.7)); ctx.strokeStyle = t.ol; ctx.strokeText(t.s, px, py); }
      if (t.glow) { ctx.shadowColor = t.glow; ctx.shadowBlur = Math.round(scale * 4); }
      if (t.grad) { const hh = t.size * scale / 2, gr = ctx.createLinearGradient(0, py - hh, 0, py + hh); t.grad.forEach((c, i) => gr.addColorStop(i / (t.grad.length - 1), c)); ctx.fillStyle = gr; } else ctx.fillStyle = t.col;
      ctx.fillText(t.s, px, py); ctx.shadowBlur = 0; ctx.letterSpacing = '0px';
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
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].indexOf(e.code) >= 0) e.preventDefault();
    Snd.init();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  let mouseHeld = false;
  addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) mouseHeld = true; });
  addEventListener('pointerup', () => { mouseHeld = false; });
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
      gb.a = b(0); gb.b = b(1); gb.x = b(2); gb.y = b(3); gb.start = b(9); gb.back = b(8); gb.r3 = b(11); gb.lb = b(4); gb.rb = b(5); gb.rt = b(7); gb.lt = b(6); gb.l3 = b(10);
      gb.l = b(14) || ax < -0.5; gb.r = b(15) || ax > 0.5; gb.u = b(12) || ay < -0.5; gb.d = b(13) || ay > 0.5;
    }
    const gpP = n => gb[n] && !gpPrev[n];
    act.left = keys.ArrowLeft || keys.KeyA || gb.l; act.right = keys.ArrowRight || keys.KeyD || gb.r;
    act.up = keys.ArrowUp || keys.KeyW || gb.u; act.down = keys.ArrowDown || keys.KeyS || gb.d;
    act.jump = any(keys, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gb.a;
    act.jumpP = any(pressed, ['Space', 'ArrowUp', 'KeyW', 'KeyZ']) || gpP('a');
    act.atkH = !!(keys.KeyJ || keys.KeyX || gb.x || mouseHeld); act.atk2H = false;
    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');
    act.atk2P = false; act.wswapP = any(pressed, ['KeyT']) || gpP('lt');
    act.throwP = any(pressed, ['KeyL']) || gpP('y'); act.swapP = any(pressed, ['KeyQ']) || gpP('lb');
    act.dashP = any(pressed, ['KeyK', 'KeyC', 'ShiftLeft', 'ShiftRight']) || gpP('b') || gpP('rt');
    act.pauseP = pressed.Escape || pressed.KeyP || gpP('start');
    act.okP = any(pressed, ['Enter', 'Space', 'KeyZ', 'KeyJ']) || gpP('a');
    act.backP = pressed.Escape || gpP('b');
    act.leftP = any(pressed, ['ArrowLeft', 'KeyA']) || gpP('l'); act.rightP = any(pressed, ['ArrowRight', 'KeyD']) || gpP('r');
    act.upP = any(pressed, ['ArrowUp', 'KeyW']) || gpP('u'); act.downP = any(pressed, ['ArrowDown', 'KeyS']) || gpP('d');
    act.talkP = pressed.KeyE || pressed.Enter || gpP('rb');
    act.skillP = any(pressed, ['KeyR']) || gpP('rb');
    act.shopP = any(pressed, ['KeyB', 'KeyI']) || gpP('back');
    act.sumP = any(pressed, ['Digit0']) || gpP('r3');   // touch star / gamepad R3: the first charged skill
    act.sk1P = any(pressed, ['Digit1', 'Numpad1']); act.sk2P = any(pressed, ['Digit2', 'Numpad2']); act.sk3P = any(pressed, ['Digit3', 'Numpad3']); act.sk4P = any(pressed, ['Digit4', 'Numpad4']);
    act.parryP = any(pressed, ['KeyF']) || gpP('l3');
    act.muteP = pressed.KeyM; act.fullP = pressed.KeyF || pressed.F11;
    gpPrev = gb;
  }
  function clearPressed() { for (const k in pressed) pressed[k] = false; act.jumpP = act.atkP = act.atk2P = act.throwP = act.swapP = act.dashP = act.pauseP = act.talkP = act.okP = act.backP = act.leftP = act.rightP = act.upP = act.downP = act.skillP = act.shopP = act.sumP = act.parryP = act.wswapP = act.sk1P = act.sk2P = act.sk3P = act.sk4P = false; }
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
      { k: 'KeyL', x: w - s * 2.9, y: h - s * 1.5, r: r * 0.8, l: '●' }, { k: 'KeyT', x: w - s * 2.3, y: h - s * 2.7, r: r * 0.85, l: '⇆' }, { k: 'KeyQ', x: w - s * 3.3, y: h - s * 0.5, r: r * 0.6, l: '⇄' }, { k: 'KeyF', x: w - s * 3.5, y: h - s * 2.4, r: r * 0.8, l: '◆' }, { k: 'Digit0', x: w - s * 2.3, y: h - s * 2.9, r: r * 0.75, l: '★' }
    ];
    if (scene === 'play' && Q && (Q.nearNpc || Q.nearPz) && Q.state === 'play') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '...' });
    if (scene === 'shop') b.push({ k: 'KeyE', x: w - s * 0.8, y: h - s * 2.3, r: r * 0.9, l: '→' });
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
    else if (rotated) touch.ptr.set(e.pointerId, { x: e.clientY * DPR, y: (innerWidth - e.clientX) * DPR });
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
  // a visible SKIP button (top-right) for every dialogue and cinematic; the same as pressing Esc
  const skipShown = () => (scene === 'play' && Q && Q.state === 'talk' && Q.talk) || (scene === 'story' && storyList !== ENDING) || scene === 'cutscene' || scene === 'castle' || scene === 'ride' || scene === 'opening' || ((scene === 'intro' || scene === 'outro') && cn && !cn.gate);
  const SKIP_BOX = [VW - 62, 3, 58, 12];
  function mouseEvt(e) {
    const xy = gameXY(e), gx = xy[0], gy = xy[1]; mouse.gx = gx; mouse.gy = gy;
    const inPlay = scene === 'play' && Q;
    if (e.type === 'pointermove') {
      if (scene === 'title') { const L = titleLayout(titleItems()), i = L.findIndex(r => gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h); if (i >= 0 && i !== titleSel) { titleSel = i; Snd.play('select'); } }
      else if (inPlay && Q.state === 'pause') { const i = menuHit(gx, gy, 4, VW / 2, 88, 18, 80); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }
      else if (inPlay && Q.state === 'shop') { const n = (SHOPS[Q.shopWho] || []).length + 1, i = menuHit(gx, gy, n, VW / 2, 96, 14, 110); if (i >= 0 && i !== Q.menu) { Q.menu = i; Snd.play('select'); } }
      else if (scene === 'shop') shopMouse(gx, gy, false);
      return;
    }
    if (e.type !== 'pointerdown') return;
    if (e.button === 2) { // right click = throw
      if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyL = true; } else if (inPlay && (Q.state === 'talk' || Q.state === 'tablet')) pressed.Escape = true; else if (scene === 'shop') pressed.Escape = true;
      return;
    }
    if (e.button === 1) { if (inPlay && Q.state === 'play') pressed.KeyT = true; return; }
    if (e.button !== 0) return;
    if (skipShown() && near(gx, gy, VW - 33, 9, 29, 6)) { pressed.Escape = true; Snd.play('select'); return; }
    if (scene === 'title') { const L = titleLayout(titleItems()), i = L.findIndex(r => gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h); if (i >= 0) { titleSel = i; pressed.Enter = true; } }
    else if (scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'credits') pressed.Enter = true;
    else if ((scene === 'intro' || scene === 'outro') && cn && cn.gate) pressed.Enter = true;
    else if (scene === 'shop') shopMouse(gx, gy, true);
    else if (scene === 'map') {
      if (near(gx, gy, VW - 36, 14, 34, 8)) { pressed.KeyB = true; return; }
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

  // ---------- final map: Shorty, Sy and Quoc (multi-form bosses) ----------
  const FORMS = {
    shorty: [
      { name: { en: 'Mr Shorty Phong', vi: 'Mr Shorty Phong' }, spr: 'shorty_h', w: 32, h: 46, hp: 380, armor: 0.15, smart: 0.75, sp: 34, minion: 'imp', proj: '#d58bff', skills: ['shoot', 'fan', 'teleport', 'jump', 'charge', 'guard'], skills2: ['clone', 'crossBeam', 'rush'] },
      { name: { en: 'SHORTY, THE HAT BEAST', vi: 'SHORTY, QUÁI VẬT MŨ CAO' }, spr: 'shorty_m', w: 58, h: 68, hp: 620, armor: 0.3, smart: 0.55, sp: 26, minion: 'imp', proj: '#ff6a3a', skills: ['slam', 'sweep', 'lobs', 'summon', 'rain', 'erupt', 'rush'], skills2: ['roar', 'spin', 'crossBeam'], skills3: ['meteor', 'guard', 'shield'] }
    ],
    sy: [
      { name: { en: 'Mr Sy', vi: 'Mr Sy' }, spr: 'sy_h', w: 32, h: 52, hp: 420, armor: 0.2, smart: 0.8, sp: 32, minion: 'shadewisp', proj: '#7ed957', skills: ['spit', 'lobs', 'curse', 'web', 'cloak', 'teleport'], skills2: ['dark', 'tornado', 'crossBeam'] },
      { name: { en: 'SY, THE VENOM SERPENT', vi: 'SY, RẮN CHÚA ĐỘC' }, spr: 'sy_m', w: 70, h: 62, hp: 680, armor: 0.3, smart: 0.5, sp: 22, minion: 'spider', proj: '#7ed957', skills: ['breath', 'spit', 'lobs', 'wall', 'rain', 'charge', 'slam'], skills2: ['summon', 'curse', 'spin', 'tornado'], skills3: ['blizzard', 'shield', 'roar'] }
    ],
    quoc: [
      { name: { en: 'Quoc, the Dark Lord', vi: 'Quoc - Quỷ Vương Hắc Ám' }, spr: 'quoc0', img: 'form0', anim: { idle: [0, 1], move: [0, 1], melee: [2], cast: [3], special: [4] }, w: 34, h: 78, hp: 220, armor: 0.1, smart: 0.9, sp: 40, minion: 'imp', proj: '#ff3a2a', skills: ['shoot', 'fan', 'teleport', 'rush', 'jump', 'crossBeam'], skills2: ['lobs', 'guard', 'summon'] },
      { name: { en: 'Quoc - Dark Imp', vi: 'Quoc - Tiểu Quỷ Bóng Tối' }, spr: 'quoc1', img: 'form1', anim: { idle: [0, 1], move: [0, 1], air: [2, 3], melee: [4, 5], cast: [4, 5] }, w: 26, h: 46, hp: 200, armor: 0.1, smart: 0.9, sp: 52, minion: 'imp', proj: '#c07bff', skills: ['jump', 'bounce3', 'charge', 'rush', 'shoot'], skills2: ['teleport', 'fan'] },
      { name: { en: 'Quoc - Hellhound', vi: 'Quoc - Chó Địa Ngục' }, spr: 'quoc2', img: 'form2', anim: { idle: [0, 1], move: [0, 1, 2, 3], air: [3], melee: [2, 3], cast: [4] }, w: 60, h: 46, hp: 260, armor: 0.15, smart: 0.7, sp: 54, minion: 'imp', proj: '#ff7a2a', skills: ['rush', 'charge', 'jump', 'breath', 'summon'], skills2: ['fan', 'erupt'] },
      { name: { en: 'Quoc - Chained Demon', vi: 'Quoc - Quỷ Xích' }, spr: 'quoc3', img: 'form3', anim: { idle: [0, 1], move: [0, 1], melee: [2, 3], cast: [2, 3], slam: [4] }, w: 50, h: 70, hp: 340, armor: 0.25, smart: 0.6, sp: 28, minion: 'imp', proj: '#a8b2c8', skills: ['slam', 'stomp', 'charge', 'erupt', 'sweep', 'crossBeam'], skills2: ['spin', 'summon'] },
      { name: { en: 'Quoc - Iron General', vi: 'Quoc - Đại Tướng Giáp Sắt' }, spr: 'quoc4', img: 'form4', anim: { idle: [0, 1], move: [0, 1, 2, 3], melee: [4], cast: [4] }, w: 40, h: 74, hp: 420, armor: 0.4, smart: 0.6, sp: 26, minion: 'eclipseclone', proj: '#ff8a2a', skills: ['shield', 'guard', 'sweep', 'charge', 'slam', 'lobs', 'crossBeam'], skills2: ['roar', 'erupt', 'meteor'] },
      { name: { en: 'Quoc - Winged Archdemon', vi: 'Quoc - Đại Quỷ Có Cánh' }, spr: 'quoc5', img: 'form5', anim: { idle: [0, 1], move: [0, 1], melee: [2], cast: [3, 4] }, w: 50, h: 68, hp: 500, armor: 0.35, smart: 0.8, sp: 30, minion: 'ghost', proj: '#ffb02a', skills: ['beam', 'meteor', 'rain', 'tornado', 'teleport', 'fan', 'clone'], skills2: ['lobs', 'spin', 'dark', 'crossBeam'] },
      { name: { en: 'Quoc - Ashen Titan', vi: 'Quoc - Titan Tro Tàn' }, spr: 'quoc6', img: 'form6', anim: { idle: [0, 1], move: [0, 1], melee: [4], cast: [2, 3], slam: [2, 3] }, w: 60, h: 98, hp: 620, armor: 0.45, smart: 0.5, sp: 22, minion: 'imp', proj: '#ff6a3a', skills: ['lavaCols', 'meteor', 'sweep', 'roar', 'slam', 'erupt', 'spin', 'summon', 'crossBeam'], skills2: ['shield', 'rush', 'rain'] },
      { name: { en: 'QUOC, THE ETERNAL ECLIPSE', vi: 'QUOC, NHẬT THỰC VĨNH CỬU' }, spr: 'quoc7', img: 'form7', anim: { idle: [0], move: [0], melee: [3], cast: [1, 2, 3], special: [4] }, w: 44, h: 106, hp: 780, armor: 0.45, smart: 0.9, sp: 30, minion: 'ghost', eclipse: true, proj: '#d58bff', skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado', 'cloak', 'crossBeam', 'rush'], skills2: ['dark', 'clone', 'summon', 'roar', 'fan', 'lobs'], skills3: ['shield', 'meteor', 'guard', 'slam'] }
    ]
  };
  const MINI = {
    shorty: { forms: FORMS.shorty,
      intro: [
        { en: 'Well, well. You made it all the way to the Citadel, little lantern-boy. I am done playing with trials.', vi: 'Chà chà. Cậu đã đến được tận Thành Trì, cậu bé cầm đèn. Ta chán trò thử thách rồi.' },
        { w: 'ember', en: 'Mr Shorty... you do not have to do this. Quoc is only using you.', vi: 'Mr Shorty... ông không cần làm vậy. Quoc chỉ đang lợi dụng ông thôi.' },
        { en: 'Using me?! He promised me a taller throne and a TALLER HAT! ...And I am short, not small. Come on!', vi: 'Lợi dụng ta?! Ngài hứa cho ta ngai vàng cao hơn và một chiếc MŨ CAO HƠN! ...Ta thấp chứ không nhỏ. Lại đây!' }
      ],
      outro: [
        { en: 'My lord... Quoc... I only wanted to be... tall...', vi: 'Chủ nhân... Quoc... ta chỉ muốn được... cao thôi...' },
        { en: '...Go on, lantern-boy. Sy waits ahead. He is not as kind as I was. Tee-hee... hee...', vi: '...Đi đi, cậu bé cầm đèn. Sy đang đợi phía trước. Hắn không tử tế như ta đâu. Hí hí... hí...' },
        { w: 'ember', en: '(Shorty dissolves into a shower of top hats. For a moment Ember almost feels sorry for him.)', vi: '(Shorty tan thành một cơn mưa mũ cao. Trong thoáng chốc Ember suýt thấy thương hại hắn.)' }
      ] },
    sy: { forms: FORMS.sy,
      intro: [
        { en: 'Shorty fell? A pity. He was loud, but cheap. I am Sy. Quoc\'s second hand, and the quieter one.', vi: 'Shorty gục rồi à? Tiếc thật. Hắn ồn ào nhưng rẻ tiền. Ta là Sy. Cánh tay thứ hai của Quoc, và là người kín tiếng hơn.' },
        { w: 'ember', en: 'You were in the caves, and in the snow. You woke the Golem and the Frost King for me.', vi: 'Ông đã ở trong hang động, và cả trên tuyết. Ông đã đánh thức Người Khổng Lồ và Vua Băng cho tôi.' },
        { en: 'Test subjects, boy. I wanted to see how bright your lantern really burns. Now I want to see how long it lasts against my venom.', vi: 'Vật thí nghiệm thôi, nhóc. Ta muốn xem đèn của nhóc thực sự cháy sáng đến đâu. Giờ ta muốn xem nó chịu nổi bao lâu trước nọc độc của ta.' }
      ],
      outro: [
        { en: 'Ha... ha... even my venom... could not put you out.', vi: 'Ha... ha... ngay cả nọc độc của ta... cũng không dập được ngươi.' },
        { en: 'Listen, boy. Quoc is not one monster. He is seven. Each one angrier than the last. Do not let your light flicker.', vi: 'Nghe này, nhóc. Quoc không phải một con quái vật. Hắn có bảy dạng. Dạng sau giận dữ hơn dạng trước. Đừng để ánh sáng của nhóc chập chờn.' },
        { w: 'ember', en: '(Sy fades into green mist. The Citadel gate groans open. Only Quoc remains.)', vi: '(Sy tan vào làn sương xanh. Cổng Thành Trì rền rĩ mở ra. Chỉ còn lại Quoc.)' }
      ] }
  };
  const FORM_LINES = {
    shorty: { 1: [
      { en: 'IMPOSSIBLE?! Then... Quoc\'s gift... AWAKEN! I WILL BE TALL!! GRAAAH!!', vi: 'KHÔNG THỂ NÀO?! Vậy thì... món quà của Quoc... THỨC TỈNH! TA SẼ CAO LỚN!! GRAAAH!!' }
    ] },
    sy: { 1: [
      { en: 'Your leek is amusing, boy. But venom spoils every blade. Behold, the true Sy!', vi: 'Cây hành của nhóc thật thú vị. Nhưng nọc độc làm hỏng mọi lưỡi kiếm. Chiêm ngưỡng Sy thực sự đi!' }
    ] },
    quoc: {
      1: [{ en: 'YOU CUT MY HUMAN FACE?! THEN MEET MY SHADOW... THE DARK IMP!', vi: 'NGƯƠI DÁM CHÉM KHUÔN MẶT NGƯỜI CỦA TA?! VẬY HÃY GẶP BÓNG TỐI CỦA TA... TIỂU QUỶ!' }],
      2: [{ en: 'TOO SLOW! SMELL THE HELLFIRE... HELLHOUND!', vi: 'QUÁ CHẬM! HÃY NGỬI MÙI LỬA ĐỊA NGỤC... CHÓ ĐỊA NGỤC!' }],
      4: [{ en: 'ENOUGH!! IRON GENERAL, CRUSH THEM ALL!', vi: 'ĐỦ RỒI!! ĐẠI TƯỚNG GIÁP SẮT, NGHIỀN NÁT TẤT CẢ!' }],
      5: [{ en: 'WINGS OF THE ARCHDEMON! THE SKY ITSELF WILL BURN!', vi: 'ĐÔI CÁNH CỦA ĐẠI QUỶ! CẢ BẦU TRỜI SẼ CHÁY!' }],
      6: [{ en: 'I AM THE ASH OF EVERY VOLCANO! KNEEL!', vi: 'TA LÀ TRO TÀN CỦA MỌI NGỌN NÚI LỬA! QUỲ XUỐNG!' }],
      7: [{ en: 'I AM THE ECLIPSE! THE END OF ALL LIGHT! GO DARK... FOREVER!!!', vi: 'TA LÀ NHẬT THỰC! SỰ KẾT THÚC CỦA MỌI ÁNH SÁNG! HÃY TỐI ĐEN... MÃI MÃI!!!' }]
    }
  };
  const QUOC_PRE = [
    { en: 'So... the little flame crawls into my house. You have burned my slimes, my kings, my titans...', vi: 'Thì ra... ngọn lửa nhỏ bò vào nhà ta. Ngươi đã thiêu slime của ta, vua của ta, titan của ta...' },
    { w: 'ember', en: 'And I will burn the Eclipse too. Give back the Sun, Quoc!', vi: 'Và cháu sẽ thiêu cả Nhật Thực. Trả Mặt Trời lại đây, Quoc!' },
    { en: 'GIVE IT BACK?! I SWALLOWED IT!! IT IS PART OF ME NOW! COME, LANTERNBEARER... TASTE MY SEVEN FACES!', vi: 'TRẢ LẠI SAO?! TA ĐÃ NUỐT NÓ!! NÓ LÀ MỘT PHẦN CỦA TA RỒI! LẠI ĐÂY, NGƯỜI MANG ĐÈN... NẾM THỬ BẢY KHUÔN MẶT CỦA TA!' }
  ];
  const ALLY_STORY = [
    { w: 'quoc', en: 'THREE FACES, AND YOU STILL STAND?! THEN I WILL DROWN YOU IN SHADOW, LANTERN-BOY!', vi: 'BA KHUÔN MẶT MÀ NGƯƠI VẪN ĐỨNG ĐƯỢC SAO?! VẬY TA SẼ NHẤN CHÌM NGƯƠI TRONG BÓNG TỐI, CẬU BÉ CẦM ĐÈN!' },
    { w: 'ember', en: '(coughing) ...I cannot keep this up. His power is too much...', vi: '(ho) ...Mình không trụ nổi nữa. Sức mạnh của hắn quá lớn...' },
    { w: 'quan', en: 'EMBER!! Hold on! I read it in the Great Book of Embers: a Lanternbearer never fights alone!', vi: 'EMBER!! Cố lên! Mình đã đọc trong Đại Thư Tro Tàn: Người Mang Đèn không bao giờ chiến đấu một mình!' },
    { w: 'ember', en: 'QuanSadBoy?! How did you get into the Citadel?!', vi: 'QuanSadBoy?! Làm sao cậu vào được Thành Trì?!' },
    { w: 'hoang', en: 'Through the back door. HoangKiller is very good at back doors.', vi: 'Qua cửa sau. HoangKiller rất giỏi các cánh cửa sau.' },
    { w: 'ember', en: 'HoangKiller! The one from the Crystal Caverns?', vi: 'HoangKiller! Người ở Hang Pha Lê đó sao?' },
    { w: 'hoang', en: 'You beat the Golem that chased me. I never forget a debt... or a friend.', vi: 'Cậu đã hạ Người Khổng Lồ từng đuổi tôi. Tôi không bao giờ quên ơn... hay một người bạn.' },
    { w: 'duong', en: 'And Duong Dracular could not miss such a splendid night. The Sun is whole, and a vampire may stand in daylight thanks to you, Ember. I owe you my afternoons.', vi: 'Và Duong Dracular sao có thể bỏ lỡ một đêm tuyệt vời thế này. Mặt Trời trọn vẹn, và một ma cà rồng được đứng dưới nắng là nhờ cậu, Ember. Ta nợ cậu những buổi chiều.' },
    { w: 'santree', en: 'SANTREE IS HERE TOO! HO HO HO! Santree grows wherever there is hope! And there is a LOT of hope in this room!', vi: 'SANTREE CŨNG ĐÂY! HO HO HO! Santree mọc ở nơi nào có hy vọng! Và trong căn phòng này có RẤT NHIỀU hy vọng!' },
    { w: 'ember', en: 'Everyone... why did you all come?', vi: 'Mọi người... sao tất cả lại đến đây?' },
    { w: 'quan', en: 'Because we each heard the same news: a boy with a lantern is going to defeat the Eclipse. And we each decided, on our own, that you are not doing it alone.', vi: 'Vì ai trong chúng mình cũng nghe cùng một tin: có một cậu bé cầm đèn sẽ đánh bại Nhật Thực. Và mỗi người đều tự quyết định rằng cậu sẽ không làm điều đó một mình.' },
    { w: 'quoc', en: 'A BOOKWORM, A KNIFE, A BAT AND A... CHRISTMAS TREE?! HAHAHA! I AM QUOC! LORD OF THE ECLIPSE!', vi: 'MỘT CON MỌT SÁCH, MỘT CON DAO, MỘT CON DƠI VÀ MỘT... CÂY THÔNG NOEL?! HAHAHA! TA LÀ QUOC! CHÚA TỂ NHẬT THỰC!' },
    { w: 'ember', en: 'Then watch us, Quoc. TOGETHER!', vi: 'Vậy hãy xem chúng tôi, Quoc. CÙNG NHAU!' }
  ];
  const SY_CAMEO = {
    2: {
      pre: [
        { en: 'Hm. The Golem is sleeping on the job. Allow me. *snaps fingers* ARISE, my little experiment!', vi: 'Hm. Người Khổng Lồ đang ngủ gật khi làm việc. Để ta. *búng tay* TRỖI DẬY, thí nghiệm bé nhỏ của ta!' },
        { en: 'I am Sy, one of Quoc\'s two hands. Do not worry, boy. I will not fight you today. Today... I only watch.', vi: 'Ta là Sy, một trong hai cánh tay của Quoc. Đừng lo, nhóc. Hôm nay ta sẽ không đánh nhau với nhóc. Hôm nay... ta chỉ xem.' }
      ],
      post: [
        { en: 'Impressive. The Golem lasted longer than I bet. Keep the shiny dust, boy.', vi: 'Ấn tượng. Người Khổng Lồ trụ lâu hơn ta cược. Cứ giữ lấy bụi lấp lánh đi, nhóc.' },
        { en: 'We will meet again at the Citadel. Bring your little leek.', vi: 'Chúng ta sẽ gặp lại ở Thành Trì. Nhớ mang theo cây hành bé nhỏ của nhóc.' }
      ] },
    4: {
      pre: [
        { en: 'The Frost King. A prince of ice. Quoc told me to wake him, but I like him better angry.', vi: 'Vua Băng. Một hoàng tử của băng giá. Quoc bảo ta đánh thức ông ta, nhưng ta thích ông ta khi nổi giận hơn.' },
        { en: '*shatters the ice cage* WAKE UP, Majesty! A lantern has come to melt you!', vi: '*đập vỡ lồng băng* DẬY ĐI, Bệ hạ! Có một chiếc đèn đến để làm tan chảy ngài!' }
      ],
      post: [
        { en: 'Tsk. He melted faster than my notes predicted. Quoc is very, very angry now.', vi: 'Chậc. Ông ta tan nhanh hơn ghi chép của ta dự đoán. Quoc đang rất, rất giận.' },
        { en: 'Run along, little flame. I will tell him you said hello.', vi: 'Đi đi, ngọn lửa nhỏ. Ta sẽ nói với hắn là nhóc gửi lời chào.' }
      ] }
  };
  // every boss can roar
  [].concat(BOSS, FORMS.shorty, FORMS.sy, FORMS.quoc).forEach(c => { if (c.skills.indexOf('roar') < 0) c.skills.push('roar'); });
  const SPEAKER_COL = { quoc: '#ff5a4a', sy: '#7ed957', ember: '#ff9a4a', lyra: '#6ee7f2', shorty: '#ffd34e', quan: '#a98bff', hoang: '#e0453a', duong: '#c0304a', santree: '#5fcf5a', narr: '#a8b0d0', dragon: '#ff8a2a', lila: '#a4e86b', bram: '#cfd6e6', angel: '#fff6c0', wizard: '#a98bff', fairy: '#ff9fd0', gob: '#9be564', smith: '#ff9a4a' };
  const bpc = () => (Q && Q.boss && Q.boss.cfg && Q.boss.cfg.proj) || Q.B.proj;

  // ---------- the movie: every boss speaks before and after its fight, and every map has a mid-way story beat ----------
  BOSS.forEach((c, i) => { NPCS['boss' + i] = { spr: 'boss:' + i, name: c.name }; });
  const BOSS_LINES = {
    0: { pre: [
        { en: 'BLORP! You squashed my children! I am the KING of this meadow!', vi: 'BLORP! Ngươi dám đè bẹp con của ta! Ta là VUA của đồng cỏ này!' },
        { w: 'ember', en: 'Give back the fragment of the Sun. It does not belong to you.', vi: 'Trả mảnh Mặt Trời lại đây. Nó không thuộc về ngươi.' },
        { en: 'This shiny thing? It tastes like sunshine. MINE! BLOOORP!', vi: 'Cái thứ lấp lánh này à? Nó có vị như nắng. CỦA TA! BLOOORP!' }
      ], post: [
        { en: 'Blorp... so... warm...', vi: 'Blorp... ấm... quá...' },
        { w: 'narr', en: 'The first fragment glows in Ember\'s hands. Far away, in a castle of ash, a dark laugh suddenly stops.', vi: 'Mảnh vỡ đầu tiên rực sáng trong tay Ember. Ở nơi xa, trong tòa lâu đài tro tàn, một tràng cười đen tối bỗng im bặt.' }
      ] },
    1: { pre: [
        { en: 'Little moth... drawn to its own light. My webs have waited for you.', vi: 'Con thiêu thân bé nhỏ... bị chính ánh sáng của mình dẫn lối. Tơ của ta đã chờ ngươi từ lâu.' },
        { w: 'ember', en: 'Your webs are full of stolen light. I am taking it back.', vi: 'Tơ của ngươi đầy ánh sáng bị đánh cắp. Ta sẽ lấy lại nó.' }
      ], post: [
        { en: 'My children... will spin... in the dark... forever...', vi: 'Các con ta... sẽ giăng tơ... trong bóng tối... mãi mãi...' },
        { w: 'narr', en: 'The webs fall like dead leaves. For the first time in days, moonlight reaches the forest floor.', vi: 'Những tấm tơ rơi xuống như lá úa. Lần đầu tiên sau nhiều ngày, ánh trăng chạm tới mặt đất của khu rừng.' }
      ] },
    2: { pre: [
        { en: 'INTRUDER. CRYSTAL. PROTECT. CRUSH.', vi: 'KẺ XÂM NHẬP. PHA LÊ. BẢO VỆ. NGHIỀN NÁT.' },
        { w: 'ember', en: 'It is only following orders... I am sorry, big guy.', vi: 'Nó chỉ làm theo lệnh thôi... Xin lỗi nhé, anh bạn to xác.' }
      ], post: [
        { en: 'Light... remembers... me...', vi: 'Ánh sáng... còn nhớ... ta...' },
        { w: 'narr', en: 'One by one, the crystals of the caverns flicker back to life.', vi: 'Từng viên một, pha lê trong hang động le lói sáng trở lại.' }
      ] },
    3: { pre: [
        { en: 'KNEEL, child of the Sun! In my desert, even the Sun bows to ME!', vi: 'QUỲ XUỐNG, đứa con của Mặt Trời! Trên sa mạc của ta, ngay cả Mặt Trời cũng phải cúi đầu trước TA!' },
        { w: 'ember', en: 'The Sun does not bow. It rises.', vi: 'Mặt Trời không cúi đầu. Nó mọc lên.' }
      ], post: [
        { en: 'My tomb... was so... quiet...', vi: 'Lăng mộ của ta... từng thật... yên tĩnh...' },
        { w: 'narr', en: 'The sandstorm dies. Under the stars, the dunes look almost peaceful.', vi: 'Bão cát lặng đi. Dưới bầu trời sao, những đụn cát trông gần như bình yên.' }
      ] },
    4: { pre: [
        { en: 'Who dares bring FIRE into my halls? ...I have been cold so long that I forgot what warmth feels like.', vi: 'Kẻ nào dám mang LỬA vào cung điện của ta? ...Ta đã lạnh quá lâu, đến mức quên mất hơi ấm là gì.' },
        { w: 'ember', en: 'Then let me remind you.', vi: 'Vậy để ta nhắc lại cho ngươi.' }
      ], post: [
        { en: 'Warm... it is... warm... thank you... little flame...', vi: 'Ấm... thật... ấm... cảm ơn... ngọn lửa nhỏ...' },
        { w: 'narr', en: 'For the first time in a hundred years, the Frost King smiles. Then he melts into a quiet spring rain.', vi: 'Lần đầu tiên sau trăm năm, Vua Băng mỉm cười. Rồi ông tan thành một cơn mưa xuân lặng lẽ.' }
      ] },
    5: { pre: [
        { en: 'I AM THE MOUNTAIN\'S HEART! YOUR LITTLE LANTERN IS A SPARK IN MY FURNACE!', vi: 'TA LÀ TRÁI TIM CỦA NGỌN NÚI! CHIẾC ĐÈN BÉ NHỎ CỦA NGƯƠI CHỈ LÀ MỘT TIA LỬA TRONG LÒ RÈN CỦA TA!' },
        { w: 'ember', en: 'Sparks are how every fire begins.', vi: 'Mọi ngọn lửa đều bắt đầu từ một tia lửa.' }
      ], post: [
        { en: 'The mountain... grows... quiet...', vi: 'Ngọn núi... đang... lặng đi...' },
        { w: 'narr', en: 'Six fragments now. They hum together like a choir. Only one remains, in the Shadow Citadel.', vi: 'Giờ đã có sáu mảnh. Chúng ngân lên cùng nhau như một dàn đồng ca. Chỉ còn một mảnh, trong Thành Trì Bóng Đêm.' }
      ] },
    6: { post: [
        { w: 'quoc', en: 'Impossible... a little flame... and a handful of... friends...', vi: 'Không thể nào... một ngọn lửa nhỏ... và một nhúm... bạn bè...' },
        { w: 'quoc', en: 'The Sun... it burns... so bright...', vi: 'Mặt Trời... nó cháy... sáng quá...' },
        { w: 'ember', en: 'It always did, Quoc. You were just standing in front of it.', vi: 'Nó vẫn luôn sáng như vậy, Quoc. Chỉ là ngươi đứng chắn trước nó thôi.' },
        { w: 'narr', en: 'The Eclipse cracks like old glass. The seventh fragment falls, warm and bright, into Ember\'s hands.', vi: 'Nhật Thực nứt vỡ như tấm kính cũ. Mảnh thứ bảy rơi xuống, ấm áp và rực sáng, vào tay Ember.' }
      ] }
  };
  const MID_STORY = {
    0: [{ w: 'ember', en: 'These slimes are acting strange... like something is pulling their strings.', vi: 'Lũ slime này lạ quá... như có ai đó đang giật dây chúng.' },
        { w: 'narr', en: 'Far away, a girl\'s song drifts over the hills. Ember walks a little faster.', vi: 'Ở nơi xa, tiếng hát của một cô gái vọng qua những ngọn đồi. Ember bước nhanh hơn một chút.' }],
    1: [{ w: 'ember', en: 'The forest is too quiet. Even the owls have stopped hooting.', vi: 'Khu rừng yên ắng quá. Đến cả lũ cú cũng thôi kêu.' },
        { w: 'lyra', en: '(Lyra squeezes his hand) It is all right. I am here. Sing with me if you are scared.', vi: '(Lyra nắm chặt tay cậu) Không sao đâu. Có mình ở đây. Nếu sợ thì hát cùng mình nhé.' }],
    2: [{ w: 'ember', en: 'So dark... my lantern feels heavier down here.', vi: 'Tối quá... chiếc đèn như nặng hơn khi xuống tới đây.' },
        { w: 'narr', en: 'Deep inside the crystals, something watches him pass. A green glint. A thin smile.', vi: 'Sâu bên trong những viên pha lê, có thứ gì đó dõi theo cậu. Một tia sáng xanh. Một nụ cười mỏng.' }],
    3: [{ w: 'ember', en: 'Sand everywhere... and that heat. Duong said the Pharaoh hates visitors.', vi: 'Cát ở khắp nơi... và cái nóng này. Duong nói Pharaoh ghét khách lạ lắm.' },
        { w: 'narr', en: 'Under the dunes, old bones shift in their sleep.', vi: 'Dưới những đụn cát, những bộ xương cổ trở mình trong giấc ngủ.' }],
    4: [{ w: 'ember', en: 'So cold my fingers hurt. Santree walked all the way from here?', vi: 'Lạnh đến buốt cả ngón tay. Santree đã đi bộ từ tận đây sao?' },
        { w: 'narr', en: 'The wind carries a sad, frozen song from the castle on the peak.', vi: 'Cơn gió mang theo một khúc ca buồn, đóng băng, từ tòa lâu đài trên đỉnh núi.' }],
    5: [{ w: 'narr', en: 'The air burns. The ground shakes. Somewhere above the smoke, huge wings beat.', vi: 'Không khí bỏng rát. Mặt đất rung chuyển. Đâu đó trên làn khói, những đôi cánh khổng lồ vỗ mạnh.' },
        { w: 'ember', en: 'Ignarok... I know you are here.', vi: 'Ignarok... ta biết ngươi đang ở đây.' }],
    6: [{ w: 'narr', en: 'The Shadow Citadel. Every stone whispers one name: Quoc.', vi: 'Thành Trì Bóng Đêm. Từng phiến đá đều thì thầm một cái tên: Quoc.' },
        { w: 'ember', en: 'Lyra, Lila, the King... everyone. This is for you.', vi: 'Lyra, Lila, nhà vua... tất cả mọi người. Lần này là vì các bạn.' }]
  };
  // the worlds Quoc drags you into, one for each of his forms
  const FORM_SCENES = [null,
    { en: 'the Shadow Void', vi: 'Hư Không Bóng Tối' }, { en: 'the Hellfire Plains', vi: 'Đồng Bằng Lửa Ngục' }, { en: 'the Chain Dungeon', vi: 'Ngục Tối Xiềng Xích' },
    { en: 'the Iron Fortress', vi: 'Pháo Đài Sắt' }, { en: 'the Storm Above the Clouds', vi: 'Bão Tố Trên Mây' }, { en: 'the Ashen Wasteland', vi: 'Hoang Mạc Tro Tàn' }, { en: 'the Eclipse Void', vi: 'Hư Không Nhật Thực' }];

  // ---------- caches ----------
  const tileCache = {}, bgCache = {};
  const tiles = li => tileCache[li] || (tileCache[li] = buildTileset(BIOMES[li]));
  const bgs = li => bgCache[li] || (bgCache[li] = buildBackground(BIOMES[li]));
  
  // ============================== GAMEPLAY STATE ==============================
  let Q = null; // current play context
  const GRAV = 820, JUMP = 292, DJUMP = 262, RUN = 112;
  const wetP = e => (!!Q.B.water || !!Q.L.wet) && (Q.L.waterY === undefined || e.y + e.h / 2 >= Q.L.waterY * TS);   // swimming physics only below the surface

  function ch(tx, ty) {
    const L = Q.L;
    if (tx < 0 || tx >= L.W) return '#';
    if (!(ty >= 0) || ty >= L.H) return ' ';   // also guards NaN
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
    if (coop && coop.role === 'host' && scene === 'play' && coop.ev.length < 400 && (n >= 2 || Math.random() < 0.25)) coop.ev.push(['e', Math.round(x), Math.round(y), n, o]);
    o = o || {};
    for (let i = 0; i < n; i++) {
      if (Q.parts.length > 500) Q.parts.shift();
      const a = rr(0, Math.PI * 2), sp = rr(o.sp0 || 10, o.sp1 || 60);
      Q.parts.push({ x, y, vx: Math.cos(a) * sp * (o.sx === undefined ? 1 : o.sx) + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0), life: rr(o.l0 || 0.3, o.l1 || 0.7), max: 1, col: Array.isArray(o.col) ? o.col[(Math.random() * o.col.length) | 0] : (o.col || '#ffd34e'), size: o.size || 1, grav: o.grav === undefined ? 120 : o.grav });
    }
  }

  // ---------- level start ----------
  function newPlayer() {
    return { isPlayer: true, x: 0, y: 0, w: 8, h: 14, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumps: 0, atk: 0, atkCd: 0, atkHit: null, atkDown: false, dash: 0, dashCd: 0, inv: 0, hp: maxHP(), anim: 0, drop: 0, riding: null, safeT: 0, wasGround: false, lastVy: 0, ammo: save.ammo, sel: 0, keys: 0, throwCd: 0, shield: false, sw: null, wcd: [0, 0], wmax: [1, 1] };
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
      arenaSealed: false, bossDead: false, weather: [], banner: 0, msg: null, msgT: 0, minisDone: new Set(), mainBoss: null, mainArena: null, syFig: null
    };
    if (!save.shards[li]) save.shards[li] = [0, 0, 0];
    Q.pearls = 0; Q.questShown = false; Q.qT = 0;
    initGear();
    if (!coop && myHero() !== 'ember') setHero(P, myHero());
    initEntities();
    initWeather();
    initCreeps();
    Q.scn = buildScene();
    snapCam();
    scene = 'play';
    Snd.music('lvl' + li, L.B.music); Snd.ambience(L.B.id); Snd.ambVol(0.9);
    if (li === 1) Q.msg = T('ab1'); else if (li === 3) Q.msg = T('ab3'); else if (li === 0) Q.msg = T('ctl');
    Q.msgT = Q.msg ? 6 : 0;
  }
  function initEntities() {
    const L = Q.L;
    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;
    Q.rings = []; Q.ghosts = []; Q.corpses = []; Q.zones = []; cleanupCells(); Q.windT = 0; Q.darkBoost = 0; Q.darkBoostT = 0; Q.dragon = null;
    for (const t of L.dragons) for (let y = 0; y < t.gy; y++) { L.grid[y][t.lw] = ' '; L.grid[y][t.rw] = ' '; }
    Q.dragons = L.dragons.map(t => Object.assign({}, t, { state: Q.dragonsDone.has(t.id) ? 'done' : 'idle' }));
    for (const m of (L.minis || [])) for (let y = 0; y < m.gy; y++) { L.grid[y][m.lw] = ' '; L.grid[y][m.rw] = ' '; }
    Q.minis = (L.minis || []).map(m => Object.assign({}, m, { state: Q.minisDone.has(m.id) ? 'done' : 'idle' })); Q.syFig = null;
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
      else if (s.type === 'egg') Q.items.push({ kind: 'egg', k: s.k, x: s.x, y: s.y, id: s.id, ph: 0 });
      else if (s.type === 'orb') { if (save.orbs.indexOf(Q.li) < 0) Q.items.push({ kind: 'orb', n: s.n, x: s.x, y: s.y, id: s.id, ph: Math.random() * 6 }); }
      else if (s.type === 'pearl') Q.items.push({ kind: 'pearl', x: s.x, y: s.y - 4, id: s.id, ph: Math.random() * 6 });
      else if (s.type === 'rare') { if ((save.rareGot[Q.li] || []).indexOf(s.k) < 0) Q.items.push({ kind: 'rare', x: s.x, y: s.y, id: s.id, k: s.k, ph: Math.random() * 6 }); }
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
    const c = EN[type], li = LDIFF(Q.li), v = s && s.v;
    let sc = 1, hpv = 1, armor = 0, dmg = 1, spv = 1;
    if (v === 'small') { sc = 0.7; hpv = 0.6; spv = 1.25; }
    else if (v === 'big') { sc = 1.6; hpv = 3; spv = 0.8; dmg = li >= 2 ? 2 : 1; }
    else if (v === 'phong') { sc = 2.4; hpv = 14; spv = 0.7; dmg = 2; }
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
    if (Q.li === 6) return makeFormBoss(FORMS.quoc, s.x, s.y, { id: 'quoc', who: 'quoc' });
    const c = BOSS[Q.li], hp = Math.round(c.hp * 1.7 * (1 + 0.02 * totalShards()));
    return { isBoss: true, cfg: c, spr: bossSprite(Q.li), x: s.x - c.w / 2, y: s.y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp, max: 0, dir: -1, st: 'sleep', timer: 0, flash: 0, t: 0, sk: null, atkSk: null, lastSk: null, onGround: false, noOneWay: true, n: 0, phase: 0, shield: 0, evCd: 1, invul: 0, hide: false, closeT: 0, fury: 1, armor: c.armor };
  }
  // ---------- creepy darkness: eyes, watchers, fog, whispers ----------
  const EYE_COL = { swamp: '#c8f0a0', ocean: '#6ee7f2', tunnels: '#ffb04a', meadow: '#ffe066', forest: '#d8ff6a', caves: '#ff4a6a', desert: '#ff9a3a', frost: '#9fe8ff', volcano: '#ffd34e', citadel: '#d58bff' };
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
    Q.darkCur = lerp(Q.darkCur, Math.min(0.97, Math.max(Q.L.wet && !Q.B.water && P.x > (Q.L.arena.x0 - 8) * TS ? Math.min(darkAt(P.x), 0.4) : darkAt(P.x), Q.B.water && Q.L.waterY !== undefined && P.y > Q.L.waterY * TS ? Math.min(Q.arenaSealed ? 0.42 : 1, 0.1 + 0.72 * depthDark(P.y)) : 0)), 1 - Math.exp(-2.5 * dt));
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
    if (Q.mainArena) { Q.L.arena = Q.mainArena; Q.mainArena = null; Q.mainBoss = null; }
    if (Q.arenaSealed) unseal();
    Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;
    resetGearFx();
    initEntities(); snapCam(); Q.state = 'play'; Q.freeze = 0;
    Snd.music('lvl' + Q.li, Q.B.music); Snd.ambVol(0.9);
  }
  // co-op: the boss fight starts when the whole team has walked into the arena (or after 25s); nobody is dragged along
  function coopAllIn(x0, x1, key) {
    if (!coop) return true;
    const al = (Q.players || []).filter(p => !p.down); if (al.length <= 1) return true;
    if (!Q.wait || Q.wait.key !== key) Q.wait = { key, t: 0, msgT: 0 };
    if (al.every(p => p.x > (x0 + 2) * TS && p.x < x1 * TS) || Q.wait.t > 25) { Q.wait = null; return true; }
    if (Q.wait.msgT <= 0) { Q.wait.msgT = 4; Q.msg = cvs('Boss ahead! Waiting for your teammates to walk in...', 'Phía trước có boss! Đợi đồng đội cùng bước vào...'); Q.msgT = 3.5; }
    return false;
  }
  function seal() {
    const L = Q.L, ar = L.arena;
    if (ar.rects) for (const r of ar.rects) for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) L.grid[y][x] = '#'; else for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = '#';
    Q.arenaSealed = true; Snd.ambVol(0.35);
    if (coop) coopGather();
    Q.state = 'bossintro'; Q.stateT = 0;
    Q.boss.st = 'intro'; Q.boss.max = Q.boss.hp;
    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);
    Q.shake = 0.6;
    if (Q.li === 6) startScripted('quoc', QUOC_PRE, () => { Q.state = 'bossintro'; Q.stateT = 0; });
    else bossPre();
  }
  function unseal() { const L = Q.L, ar = L.arena; if (ar.rects) { for (const r of ar.rects) for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) L.grid[y][x] = ' '; } else for (let y = 0; y < ar.gy; y++) L.grid[y][ar.x0 + 1] = ' '; }

  // ============================== UPDATE ==============================
  function setEmo(type, dur) { const P = Q && Q.P; if (!P) return; P.emo = type; P.emoT = dur; }
  function drawEmoteFace(x, bot, flip, sc, emo, tt) {
    if (!emo) return;
    const spr = getSprite('hero_idle', {}, 0), W = spr.w, ox = Math.round(x - W * sc / 2), oy = Math.round(bot - spr.h * sc + sc);
    const EX = (W - 18) >> 1, px = (cx0, cy, col, w, h) => { const ww = w || 1, cx = cx0 + EX, xx = flip ? (W - 1 - cx - (ww - 1)) : cx; g.fillStyle = col; g.fillRect(ox + xx * sc, oy + cy * sc, ww * sc, (h || 1) * sc); };
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
  // a successful parry: no damage, a hit-stop, the attacker is stunned and the next strike is a double-damage counter
  function parrySuccess(fromX) {
    const P = Q.P; P.parryT = 0; P.parryCd = 0.15; P.counterT = 1.3; P.inv = Math.max(P.inv, 0.35);
    Q.freeze = Math.max(Q.freeze || 0, 0.12); Q.shake = Math.max(Q.shake, 0.35); Snd.play('clang'); Snd.play('chime');
    addRing(P.x + 4, P.y + 7, '#ffffff', 50, 0.3); addRing(P.x + 4, P.y + 7, '#9fe8ff', 80, 0.45);
    emit(P.x + 4 + P.face * 7, P.y + 7, 22, { col: ['#ffffff', '#9fe8ff', '#ffd34e'], sp0: 40, sp1: 160 });
    pop(P.x + 4, P.y - 14, sv('PARRY!', 'ĐỠ ĐÒN!'), '#9fe8ff');
    const t = nearestFoe(fromX !== undefined ? fromX : P.x + 4, P.y + 7, 80);
    if (t) {
      if (t.isBoss) { if (!t.isDragon && !t.hide && t.st !== 'intro' && t.st !== 'sleep' && t.st !== 'stun') { t.st = 'stun'; t.stunT = 0.8; t.sk = null; } }
      else { t.stunT = Math.max(t.stunT || 0, 1.5); t.vx = (t.x + t.w / 2 < P.x + 4 ? -1 : 1) * 140; }
    }
  }
  function reflectShot(p, q) {
    p.dead = true; const sp = Math.max(200, Math.hypot(p.vx || 0, p.vy || 0) * 1.4), a = Math.atan2(-(p.vy || 0) * 0.4, -(p.vx || 0) || q.face);
    shootG({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.4, dmg: wd(3), home: true, shape: 'orb', col: '#9fe8ff', trail: '#ffffff', sz: 3 });
    parrySuccess(p.x);
  }
  function hurtPlayer(n, fromX, noKnock, src) {
    const P = Q.P;
    if (P.down) return false;
    if (P.parryT > 0 && src !== 'pit' && Q.state === 'play') { parrySuccess(fromX); return false; }
    if (P.inv > 0 || P.dash > 0 || Q.state !== 'play' && Q.state !== 'bossplay') return false;
    if (P.shield) { P.shield = false; P.inv = 1.0; Snd.play('hit'); emit(P.x + 4, P.y + 7, 14, { col: ['#ffd34e', '#fff'], sp0: 30, sp1: 90 }); thornsAndFx(); return false; }
    if (src !== 'pit') {
      if (src === 'fire' && aSt('fireImm')) { P.inv = 0.4; emit(P.x + 4, P.y + 7, 6, { col: ['#ff7a2a', '#ffd34e'], sp0: 10, sp1: 40 }); return false; }
      if (mechOf(P) === 'jerry' && Math.random() < 0.35) { P.inv = 0.5; Snd.play('whoosh'); pop(P.x + 4, P.y - 12, sv('Missed!', 'Hụt!'), '#f0a050'); return false; }
      const dod = aSt('dodge');
      if (dod && Math.random() < dod) { P.inv = 0.6; Snd.play('whoosh'); emit(P.x + 4, P.y + 7, 8, { col: ['#fff', '#bfeaff'], sp0: 20, sp1: 70 }); return false; }
      const red = Math.min(0.6, aSt('red') + (petRole() === 'tank' ? (pSt('red') || 0.15) : 0)), eff = n * (1 - red);
      let take = Math.floor(eff); if (Math.random() < eff - take) take++;
      if (take <= 0) { P.inv = 0.8; Snd.play('clang'); emit(P.x + 4, P.y + 7, 8, { col: ['#cfd6e6', '#fff'], sp0: 20, sp1: 70 }); thornsAndFx(); return false; }
      n = take;
    }
    P.hp -= n; P.inv = 1.2; P.hurtA = 0.36; if (!coop || P === Q.me) { Q.freeze = 0.07; Q.shake = 0.25; }
    Snd.play('hurt'); Snd.hero('hurt'); setEmo('hurt', 0.45);
    emit(P.x + P.w / 2, P.y + P.h / 2, 10, { col: ['#e0453a', '#f6f3e9'], sp0: 30, sp1: 90 });
    if (!noKnock) { P.vx = (P.x + P.w / 2 < fromX ? -1 : 1) * 130; P.vy = -170; P.atk = 0; }
    if (P.hp <= 0) {
      if (tryRevive()) return true;
      if (coop) { coopDown(P); return true; }
      P.hp = 0; Q.state = 'dead'; Q.stateT = 0; Snd.play('die'); Snd.hero('die'); setEmo('cry', 99); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 });
    } else if (src !== 'pit') thornsAndFx();
    return true;
  }
  function pitRecover() {
    const P = Q.P;
    if (Q.state !== 'play') return;
    P.inv = 0; P.dash = 0;
    hurtPlayer(1, P.x, true, 'pit');
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
    if (P.onGround || wetP(P)) P.airDashed = false;
    P.parryCd = (P.parryCd || 0) - dt; if (P.parryT > 0) P.parryT -= dt; if (P.counterT > 0) P.counterT -= dt;
    if (act.parryP && P.parryCd <= 0 && P.dash <= 0) { P.parryT = 0.24; P.parryCd = 0.7; Snd.play('whoosh'); emit(P.x + 4 + P.face * 7, P.y + 7, 5, { col: ['#9fe8ff', '#fff'], sp0: 10, sp1: 40 }); }
    if (P.trail && P.trail.length) P.trail = P.trail.filter(tr => (tr.t -= dt) > 0);
    if (act.dashP && P.dashCd <= 0 && P.dash <= 0 && !(P.airDashed && !P.onGround)) {
      if (!P.onGround) P.airDashed = true;
      P.dash = 0.17; P.dashCd = (hasRelic(4) ? 0.35 : 0.7) * (pSt('dash') || 1); P.dashDir = dir || P.face; P.vy = 0; P.inv = Math.max(P.inv, 0.2);
      Snd.play('dash'); Snd.hero('dash'); emit(P.x + 4, P.y + 8, 8, { col: '#b8bfd0', sp0: 5, sp1: 30, vx: -P.dashDir * 50 });
    }
    if (P.dash > 0) {
      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;
      (P.trail = P.trail || []).push({ x: P.x, y: P.y, f: P.face, t: 0.22 }); if (P.trail.length > 9) P.trail.shift();
      if (Math.random() < 0.8) emit(P.x + 4, P.y + 8, 1, { col: ['#6ee7f2', '#fff'], sp0: 0, sp1: 12, l0: 0.15, l1: 0.3, grav: 0 });
    } else {
      // horizontal
      const target = dir * RUN * (wetP(P) ? (hasRelic(8) ? 0.95 : 0.8) : 1) * (P.slow > 0 ? 0.5 : 1) * (1 + aSt('speed') + pSt('speed') + (P.hspd || 0)) * (mechOf(P) === 'momentum' ? 0.75 + 1.25 * (P.mom || 0) : 1);
      const acc = ice ? 220 : (P.onGround ? 1100 : 750);
      if (dir !== 0 && P.atk <= 0.1) { P.face = dir; }
      if (dir !== 0 || !ice) {
        const a = (dir === 0 ? (ice ? 120 : 1300) : acc) * dt;
        if (P.vx < target) P.vx = Math.min(target, P.vx + a); else if (P.vx > target) P.vx = Math.max(target, P.vx - a);
      } else { P.vx *= (1 - 0.8 * dt); }
      // swimming: every jump press is a stroke upwards, the water slows the fall
      if (wetP(P)) { if (act.jumpP && P.dash <= 0) { P.vy = Math.min(P.vy, -150 - (hasRelic(8) ? 30 : 0)); P.jumps = 1; P.jumpBuf = 0; Snd.play('jump'); emit(P.x + 4, P.y + 2, 4, { col: ['#bfeaff', '#fff'], sp0: 5, sp1: 25, vy: -30, grav: -40, l0: 0.4, l1: 0.8 }); } else P.jumpBuf = 0; }
      // jump
      if (P.jumpBuf > 0) {
        if (act.down && P.onGround && ch(Math.floor((P.x + 4) / TS), Math.floor((P.y + P.h + 1) / TS)) === '=') { P.drop = 0.22; P.jumpBuf = 0; P.y += 2; }
        else if (P.coyote > 0) { P.vy = -JUMP * (pSt('jump') || 1); P.coyote = 0; P.jumpBuf = 0; P.jumps = 1; P.onGround = false; Snd.play('jump'); Snd.hero('jump'); emit(P.x + 4, P.y + P.h, 5, { col: '#cfd6e6', sp0: 10, sp1: 30, vy: -10, grav: 60 }); }
        else if (mechOf(P) === 'inhale' && P.jumps < 7) { P.vy = -150; P.jumps++; P.jumpBuf = 0; P.flutter = true; Snd.play('djump'); emit(P.x + 4, P.y + P.h, 6, { col: ['#e4fff4', '#7ee8c0'], sp0: 10, sp1: 40, vy: 30 }); }
        else if (Q.dj && P.jumps < 2) { P.vy = -DJUMP; P.jumps = 2; P.jumpBuf = 0; Snd.play('djump'); Snd.hero('djump'); emit(P.x + 4, P.y + P.h, 10, { col: ['#6ee7f2', '#fff'], sp0: 20, sp1: 60, vy: 20 }); }
      }
      if (!act.jump && P.vy < -110) P.vy *= (1 - 9 * dt);
      const g2 = (act.jump && Math.abs(P.vy) < 50) ? GRAV * 0.62 : GRAV;
      if (wetP(P)) { P.vy = Math.min(85, P.vy + g2 * 0.3 * dt); P.vx *= 1 - 1.2 * dt; if (Math.random() < 0.03) emit(P.x + 4 + P.face * 3, P.y + 3, 1, { col: '#bfeaff', sp0: 2, sp1: 6, vy: -20, grav: -30, l0: 0.6, l1: 1.2 }); }
      else P.vy = P.flutter && mechOf(P) === 'inhale' ? Math.min(42, P.vy + g2 * 0.32 * dt) : (P.stoneT > 0 ? 380 : Math.min(380, P.vy + g2 * dt));
    }
    // attack: slot 1 (J / click) and slot 2 (H / middle-click / LT) - swords swing, special weapons fire
    if (act.wswapP) swapWeapon(P);
    if (!eqIt(P.ws | 0) && eqIt(P.ws ? 0 : 1)) P.ws = P.ws ? 0 : 1;   // the hand is empty: take the other weapon
    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(P.ws | 0); }
    if (P.dash <= 0) { const sl = P.ws | 0, gi = eqIt(sl); if (gi && gi.type === 'gun' && act.atkH && !act.atkP) useSlot(sl); }
    P.throwCd -= dt;
    if (P.hero) { const was = P.skCd > 0; P.skCd = (P.skCd || 0) - dt; if (was && P.skCd <= 0 && isMe(P)) { pop(P.x + 4, P.y - 22, sv('R READY!', 'R SẴN SÀNG!'), (HERO[P.hero] && HERO[P.hero].sk.col) || '#ffd34e'); Snd.play('select'); }
      if (act.skillP && P.skCd > 0 && isMe(P)) { Q.msg = sv('R recharging: ', 'R đang hồi: ') + Math.ceil(P.skCd) + 's'; Q.msgT = 1; }
      if (act.skillP && P.skCd <= 0 && P.dash <= 0) heroSkill(P); }
    if (act.sk1P) useSk(0); if (act.sk2P) useSk(1); if (act.sk3P) useSk(2); if (act.sk4P) useSk(3);
    if (act.sumP) { const i = [0, 1, 2, 3].find(k => skIsReady(k)); useSk(i === undefined ? 0 : i); }
    if (act.swapP) cycleWeapon();
    if (act.throwP && P.throwCd <= 0 && P.dash <= 0) throwItem();
    if (P.atk > 0) P.atk -= dt;
    // riding platforms
    if (P.riding) { P.x += P.riding.dx; P.y += P.riding.dy; }
    { const blk = moveX(P, P.vx * dt); P.push = blk && dir !== 0 && P.onGround ? 0.14 : Math.max(0, (P.push || 0) - dt); }
    heroMech(P, dt, dir);
    if (P.hurtA > 0) P.hurtA -= dt; if (P.landA > 0) P.landA -= dt; P.airT = P.onGround ? 0 : (P.airT || 0) + dt;
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
    if (wasAir && P.onGround && impact > 60) P.landA = 0.12;
    if (wasAir && P.onGround && impact > 180) { Snd.play('land'); emit(P.x + 4, P.y + P.h, 6, { col: '#cfd6e6', sp0: 15, sp1: 40, vy: -5, grav: 50 }); }
    // safe pos tracking
    if (P.onGround && P.groundCh !== 'C' && P.groundCh !== 'P') {
      P.safeT += dt;
      if (P.safeT > 0.2) {
        const lx = Math.floor((P.x - 1) / TS), rx = Math.floor((P.x + P.w + 1) / TS), by = Math.floor((P.y + P.h + 1) / TS);
        if (solid(lx, by) && solid(rx, by) && ch(Math.floor(P.x / TS), by - 1) !== '^') Q.safe = { x: P.x, y: P.y };
      }
    } else P.safeT = 0;
    // footsteps that sound like the ground, and a splash when you dive in
    P.stepT = (P.stepT || 0) - dt;
    if (P.onGround && Math.abs(P.vx) > 45 && P.stepT <= 0 && !P.isGhostP) { P.stepT = 0.27; if (!wetP(P)) Snd.step(Q.B.id); }
    { const w = wetP(P); if (P.wasWet === false && w) { Snd.play('splash'); emit(P.x + 4, P.y + 6, 14, { col: ['#bfeaff', '#fff'], sp0: 30, sp1: 110, vy: -60 }); } P.wasWet = w; }
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
    if (!Q.arenaSealed && !Q.bossDead && Q.boss && P.x > (L.arena.x0 + 4) * TS && (L.arena.y0 === undefined || P.y > L.arena.y0 * TS) && coopAllIn(L.arena.x0, L.arena.x1, 'boss')) seal();
  }
  function swordRect() {
    const P = Q.P;
    if (P.atkDown) return { x: P.x - 5, y: P.y + P.h - 3, w: P.w + 10, h: 15 };
    const rch = Math.round(24 * ((P.sw && P.sw.st.reach) || 1));
    return P.face > 0 ? { x: P.x + P.w - 1, y: P.y - 3, w: rch, h: P.h + 5 } : { x: P.x - rch + 1, y: P.y - 3, w: rch, h: P.h + 5 };
  }
  function swordHit() {
    if (Q.P.counterHit) { Q.P.counterHit = false; Q.P.counterT = 0; pop(Q.P.x + 4, Q.P.y - 14, sv('COUNTER x2', 'PHẢN ĐÒN x2'), '#ffd34e'); Snd.play('explode'); }
    const P = Q.P, r = swordRect(), sw = P.sw || ITEM.iron, st = sw.st, base = baseDmg() + (st.dmg || 0);
    const list = Q.ents.slice().concat(bossTargets());
    for (const e of list) {
      if (e.dead || e.hid || P.atkHit.has(e)) continue;
      if (e.cfg && e.cfg.ai === 'blob' && e.st !== 'up') continue;
      if (ov(r, e)) {
        P.atkHit.add(e);
        let d = base;
        if (P.counterT > 0) { d *= 2; P.counterHit = true; emit(e.x + e.w / 2, e.y + e.h / 2, 14, { col: ['#ffd34e', '#fff', '#9fe8ff'], sp0: 40, sp1: 140 }); }
        if (st.boss && isBig(e)) d *= st.boss;
        if (st.crit && Math.random() < st.crit) { d *= 3; emit(e.x + e.w / 2, e.y, 8, { col: ['#fff', '#ffd34e', '#e0453a'], sp0: 30, sp1: 100 }); Snd.play('clang'); }
        if (st.exec && !e.isBoss && e.maxhp && e.hp > 0 && e.hp / e.maxhp <= st.exec) { d = e.hp + 99; emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: ['#a15be0', '#14121f', '#fff'], sp0: 30, sp1: 110 }); }
        curHit = st;
        if (e.isBoss) hurtBoss(e, d, !!st.pierce); else hurtEnemy(e, d, !!st.pierce);
        if (hasRelic(7)) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }
        curHit = null; chargeHit(); heroOnHit(P, e);
        swordHitFx(e, st, sw.id, d);
        Q.freeze = 0.045; Snd.play('hit');
        if (P.atkDown) { P.vy = -250; P.jumps = 1; P.atk = 0; }
      }
    }
    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(r, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);
    // destroy projectiles
    for (const p of Q.projs) if (!p.boss && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
    for (const p of Q.projs) if (p.type !== 'wave' && !p.dead && ov(r, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })) { p.dead = true; emit(p.x, p.y, 6, { col: p.col, sp0: 20, sp1: 60 }); }
  }
  function hurtEnemy(e, dmg, pierce, quiet) {
    let bl = 1; if (e.st === 'block' && !pierce) { bl = 0.2; Snd.play('clang'); emit(e.x + e.w / 2 + e.dir * e.w / 2, e.y + e.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 110 }); }
    const arm = e.armor || 0, eff = dmg * bl * (1 - arm * (pierce ? 0.4 : 1));
    e.hp -= eff; e.flash = 0.12; e.hitT = 0.18;
    if (arm > 0 && !pierce) emit(e.x + e.w / 2, e.y + e.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 90 });
    if (!quiet || e.hp <= 0) Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt', false, 1, e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1));
    const P = Q.P;
    if (!quiet) { if (!e.fly) { e.vx = (e.x < P.x ? -1 : 1) * 70; e.vy = -90; } else { e.vx = (e.x < P.x ? -1 : 1) * 90; } }
    if (!quiet) emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 70 });
    if (e.hp <= 0) {
      e.dead = true; onKill(e); emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
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
  // every blood phase: a roar, its own minions, a short shield, and a harder-hitting boss
  function bossPhase(b, n) {
    b.pp = n; b.invul = Math.max(b.invul, 1.1); b.st = 'rec'; b.timer = 1.1; b.sk = null;
    if (n >= 2) b.shield = Math.max(b.shield || 0, 2.2);
    Q.shake = 1; Q.freeze = 0.12; Snd.creature(Q.li, 'alert', true); Snd.play('boom'); addRing(b.x + b.w / 2, b.y + b.h / 2, bpc(), 130, 0.7);
    emit(b.x + b.w / 2, b.y + b.h / 2, 40, { col: [bpc(), '#fff', '#ff3a3a'], sp0: 40, sp1: 180 });
    Q.msg = sv('The boss is enraged! Phase ' + (n + 1) + '/4', 'Boss nổi giận! Giai đoạn ' + (n + 1) + '/4'); Q.msgT = 3;
    if (b.cfg && b.cfg.minion) { let alive = Q.ents.filter(e => !e.dead).length; for (let i = 0; i < 2 + n && alive < 7; i++, alive++) { const m = makeEnemy(b.cfg.minion, b.x + b.w / 2 + (i - 1) * 34, b.y + b.h - 4, { minion: true }); if (!m.fly) m.vy = -150; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: bpc() }); } }
  }
  function hurtBoss(b, dmg, pierce, quiet) {
    if (b.isDragon) return hurtDragon(b, dmg, pierce, quiet);
    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.st === 'dropwait' || b.st === 'dropfall' || b.invul > 0 || b.dead) return;
    b.lastHit = Q.t;
    if (sumCtx) dmg *= 0.6;   // the boss is tough against summons: the hero has to fight too
    if (b.shield > 0) {
      if (!pierce) { Snd.play('hit'); b.flash = 0.04; emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#6ee7f2', '#fff'], sp0: 40, sp1: 110 }); return; }
      b.shield = 0; b.st = 'stun'; b.stunT = 2.2; b.sk = null; dmg *= 1.5; Q.msg = save.lang === 'vi' ? 'Khiên vỡ! Nó choáng!' : 'Shield broken! It is stunned!'; Q.msgT = 3; Snd.play('explode');
    }
    let gm = 1; if (b.guard > 0) { if (!pierce) { gm = 0.15; Snd.play('clang'); emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 120 }); } else gm = 0.6; }
    const arm = b.cfg.armor || 0, eff = dmg * gm * (1 - arm * (pierce ? 0.4 : 1)) * ((b.st === 'stun' || b.st === 'rec') ? 1.25 : 1);
    b.hp -= eff; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);
    if (!quiet || b.hp <= 0) Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);
    emit(b.x + b.w / 2, b.y + b.h / 2, 8, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 90 });
    if (arm > 0.15 && !pierce) emit(b.x + b.w / 2, b.y + b.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 100 });
    const pct = b.hp / b.max;
    if (b.hp > 0) for (const [k, th] of [['p1', 0.75], ['p2', 0.5], ['p3', 0.25]]) if (!b[k] && pct < th) { b[k] = 1; bossPhase(b, ++b.pp || (b.pp = 1)); break; }
    if (!b.t1 && pct < 0.66) { b.t1 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (!b.t2 && pct < 0.33) { b.t2 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (b.hp <= 0) {
      if (nextForm(b)) return;
      if (b.mini) { miniDeath(b); return; }
      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0; Q.bossBooms = 0; Q.freeze = 0.25; Q.shake = 1;
      Snd.play('boom'); Snd.stop(); Q.zones.length = 0; cleanupCells(); Q.windT = 0; Q.darkBoost = 0;
      Q.ents.forEach(e => { if (!e.dead) { e.dead = true; emit(e.x, e.y, 10, { col: '#fff' }); } });
      Q.projs.length = 0;
      const ar = Q.L.arena;
      Q.items.push({ kind: 'frag', x: clamp(b.x + b.w / 2, (ar.x0 + 5) * TS, (ar.x1 - 5) * TS), y: ar.gy * TS - 22, id: -1, ph: 0 });
      bossPost();
    }
  }
  function updateBossDeath(dt) {
    if (!Q.bossDead || Q.bossDeadDone) return;
    const b = Q.boss; Q.bossDeadT += dt;
    if (Q.bossBooms < 5 && Q.bossDeadT > Q.bossBooms * 0.15) { Q.bossBooms++; Snd.play('boom'); emit(b.x + rr(0, b.w), b.y + rr(0, b.h), 30, { col: ['#fff', '#ffd34e', '#f08a2b', '#e0453a'], sp0: 30, sp1: 160 }); }
    if (Q.bossDeadT > 1.4) { Q.bossDeadDone = true; unseal(); Q.arenaSealed = false; Snd.play('win'); Snd.music('lvl' + Q.li, Q.B.music); Snd.ambVol(0.9); }
  }
  function firePr(x, y, vx, vy, o) { Q.projs.push(Object.assign({ x, y, vx, vy, life: 4, grav: 0, col: bpc(), type: 'ball', boss: false }, o || {})); if (!(o && o.silent)) Snd.play('shoot'); if (o && o.boss && Q.boss && !Q.boss.dead) Q.boss.kick = 0.16; }

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
  function updateEnemies(dtG) {
    const P0 = Q.P, cx = Q.cam.x + VW / 2;
    for (const e of Q.ents) {
      if (e.dead) continue;
      const dt = e.stunT > 0 ? 0 : dtG * (e.slowT > 0 ? 0.5 : 1);
      if (coop ? !Q.players.some(p => Math.abs(e.x - p.x) < 260) : Math.abs(e.x - cx) > 260) continue;
      const P = coop ? nearPl(e) : P0;
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
          if (e.st === 'fade') { e.stT -= dt; if (e.stT <= 0) { const sd = Math.random() < 0.5 ? -1 : 1; e.x = P.x + 4 + sd * 70 - e.w / 2; e.y = P.y - 12; e.st = 'appear'; e.stT = 0.3; emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: [bpc(), '#fff'], sp0: 10, sp1: 50 }); Snd.play('poof'); } break; }
          if (e.st === 'appear') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; e.blT = rr(4, 6); } break; }
          if (c.blink && near && e.blT <= 0) { e.st = 'fade'; e.stT = 0.3; Snd.play('poof'); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: [bpc(), '#fff'], sp0: 10, sp1: 40 }); break; }
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
      if (!e.dead && !e.hid && !(e.stunT > 0) && (c.ai !== 'blob' || e.st === 'up') && true) hitPlE({ x: e.x + 1, y: e.y + 1, w: e.w - 2, h: e.h - 2 }, () => hurtPlayer(e.dmg || 1, e.x + e.w / 2));
    }
    Q.ents = Q.ents.filter(e => !e.dead);
  }

  // ===================== MULTI-FORM BOSSES, MINI-BOSS ARENAS, CAMEOS =====================
  function makeFormBoss(forms, cx, gyPx, extra) {
    const c = forms[0], hp = Math.round(c.hp * 1.5 * (1 + 0.02 * totalShards()));
    return Object.assign({ isBoss: true, forms, fi: 0, cfg: c, spr: formSprite(c.spr), x: cx - c.w / 2, y: gyPx - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp, max: hp, dir: -1, st: 'sleep', timer: 0, flash: 0, t: 0, sk: null, atkSk: null, lastSk: null, onGround: false, noOneWay: true, n: 0, phase: 0, shield: 0, evCd: 1, invul: 0, hide: false, closeT: 0, fury: 1, armor: c.armor }, extra || {});
  }
  function applyForm(b, idx) {
    const c = b.forms[idx], cx = b.x + b.w / 2, bot = b.y + b.h, hp = Math.round(c.hp * (1 + 0.02 * totalShards()));
    b.fi = idx; b.cfg = c; b.spr = formSprite(c.spr); b.w = c.w; b.h = c.h; b.x = cx - b.w / 2; b.y = bot - b.h - 2;
    b.hp = b.max = hp; b.armor = c.armor; b.phase = 0; b.t1 = b.t2 = 0; b.p1 = b.p2 = b.p3 = 0; b.pp = 0; b.st = 'rec'; b.timer = 1.1; b.invul = 1.8; b.sk = null; b.atkSk = null; b.shield = 0; b.guard = 0; b.cloak = false; b.hide = false; b.vx = 0; b.vy = 0;
    Q.shake = 1; Q.freeze = 0.1; Snd.creature(Q.li, 'alert', true); Snd.play('boom');
    emit(b.x + b.w / 2, b.y + b.h / 2, 50, { col: [bpc(), '#fff', '#ffd34e'], sp0: 40, sp1: 180 }); addRing(b.x + b.w / 2, b.y + b.h, bpc(), 110, 0.7);
    Q.msg = LN(c.name); Q.msgT = 3;
    if (b.id === 'quoc' && FORM_SCENES[idx]) {
      const P = Q.P, ar = Q.L.arena; P.x = (ar.x0 + 4) * TS; P.y = (ar.gy - 1) * TS - P.h; P.vx = P.vy = 0; P.inv = Math.max(P.inv, 1.5); if (coop) coopGather(true);
      Q.G.flash = 0.6; Snd.play('thunder'); Snd.whisper();
      for (const a of Q.G.allies || []) { a.x = P.x - 12 - a.i * 6; a.y = P.y; a.vx = a.vy = 0; }
      Q.msg = (save.lang === 'vi' ? 'Quoc kéo bạn vào ' : 'Quoc drags you into ') + LN(FORM_SCENES[idx]) + '!'; Q.msgT = 4;
    }
  }
  function nextForm(b) {
    if (!b.forms || b.fi >= b.forms.length - 1) return false;
    const idx = b.fi + 1;
    b.hp = 1; b.invul = 99; Q.projs.length = 0; Q.zones.length = 0; cleanupCells(); Q.windT = 0; Q.darkBoost = 0;
    Q.ents.forEach(e => { if (!e.dead) { e.dead = true; emit(e.x, e.y, 8, { col: '#fff' }); } });
    Snd.play('boom'); Q.shake = 1;
    emit(b.x + b.w / 2, b.y + b.h / 2, 40, { col: ['#fff', '#ffd34e', bpc()], sp0: 30, sp1: 160 });
    const who = b.who || 'quoc', lines = (FORM_LINES[b.id] || {})[idx];
    b.flash = 0; b.st = 'rec'; b.sk = null;
    if (b.id === 'quoc' && idx === 3) startScripted('quoc', ALLY_STORY, () => formMorph(b, idx, true));
    else if (lines) startScripted(who, lines, () => formMorph(b, idx));
    else formMorph(b, idx);
    return true;
  }
  // transformation: the old body shakes, shrinks into swirling shadow, and the new form grows out of it
  function formMorph(b, idx, allies) { b.morph = { t: 0, idx, allies, swapped: false }; b.invul = 99; b.st = 'rec'; b.flash = 0; if (b.id === 'quoc') Snd.devilRoar(0.8); else Snd.creature(Q.li, 'alert', true); }
  function morphTick(b, dt) {
    const m = b.morph; m.t += dt; Q.shake = Math.max(Q.shake, m.t < 1.1 ? 0.45 : 0.25);
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    for (let i = 0; i < 3; i++) { const a = Math.random() * 6.283, r = 30 + Math.random() * 40; emit(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 1, { col: ['#a15be0', '#14101e', bpc(), '#ff3a2a'], sp0: 0, sp1: 4, vx: -Math.cos(a) * r * 2.2, vy: -Math.sin(a) * r * 1.8, grav: 0, l0: 0.3, l1: 0.5 }); }
    if (!m.swapped && m.t >= 1.1) { m.swapped = true; applyForm(b, m.idx); b.invul = 99; if (m.allies) spawnAllies(); emit(b.x + b.w / 2, b.y + b.h / 2, 40, { col: ['#14101e', '#a15be0', '#fff'], sp0: 40, sp1: 160 }); }
    if (m.t >= 1.9) { b.morph = null; b.invul = 0.6; b.st = 'rec'; b.timer = 0.6; }
  }
  function miniDeath(b) {
    const m = b.mini; b.dead = true; b.hp = 0; Q.freeze = 0.2; Q.shake = 1; Snd.play('boom'); Snd.stop();
    Q.projs.length = 0; Q.zones.length = 0; cleanupCells(); Q.windT = 0; Q.darkBoost = 0;
    Q.ents.forEach(e => { if (!e.dead) { e.dead = true; emit(e.x, e.y, 10, { col: '#fff' }); } });
    for (let i = 0; i < 5; i++) later(i * 0.18, () => { Snd.play('boom'); emit(b.x + rr(0, b.w), b.y + rr(0, b.h), 26, { col: ['#fff', '#ffd34e', bpc()], sp0: 30, sp1: 150 }); });
    later(1.3, () => startScripted(m.who, MINI[m.who].outro, () => finishMini(b)));
  }
  function finishMini(b) {
    const m = b.mini, L = Q.L;
    for (let y = 0; y < m.gy; y++) { L.grid[y][m.lw] = ' '; L.grid[y][m.rw] = ' '; }
    Q.minisDone.add(m.id); const mm = Q.minis.find(o => o.id === m.id); if (mm) mm.state = 'done';
    addGhost(b, 'out'); addRing(b.x + b.w / 2, b.y + b.h, bpc(), 90, 0.6);
    Q.boss = Q.mainBoss; Q.mainBoss = null; L.arena = Q.mainArena; Q.mainArena = null; Q.arenaSealed = false; Q.bossDead = false; Q.bossDeadDone = false;
    const cx = b.x + b.w / 2;
    for (let i = 0; i < 2; i++) Q.items.push({ kind: 'heart', x: cx + (i - 0.5) * 16, y: b.y, id: -1, vy: -150, vx: (i - 0.5) * 40, ph: 0, drop: true });
    for (let i = 0; i < 12; i++) Q.items.push({ kind: 'coin', x: cx + rr(-14, 14), y: b.y, id: -1, vy: -rr(100, 200), vx: rr(-60, 60), ph: 0, drop: true });
    Snd.play('win'); Snd.music('lvl' + Q.li, Q.B.music); setEmo('happy', 2);
  }
  function beginMini(m) {
    const L = Q.L, def = MINI[m.who];
    Q.mainBoss = Q.boss; Q.mainArena = L.arena; L.arena = { x0: m.lw, x1: m.rw, gy: m.gy };
    const b = makeFormBoss(def.forms, (m.lw + m.rw) / 2 * TS + 48, m.gy * TS, { id: m.who, who: m.who, mini: m });
    b.st = 'intro'; b.timer = 0; Q.boss = b; Q.arenaSealed = true; Q.bossDead = false; if (coop) coopGather();
    Q.state = 'bossintro'; Q.stateT = 0; Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6); Snd.creature(Q.li, 'alert', true); Q.shake = 0.6;
  }
  function updateMiniEnc() {
    const P = Q.P;
    if (!Q.minis) return;
    for (const m of Q.minis) {
      if (m.state !== 'idle') continue;
      if (P.x > m.trig * TS && P.x < m.rw * TS - 8 && P.onGround && Q.state === 'play' && !Q.arenaSealed && coopAllIn(m.lw, m.rw, 'mini' + m.id)) {
        m.state = 'active';
        for (let y = 0; y < m.gy; y++) { Q.L.grid[y][m.lw] = 'G'; Q.L.grid[y][m.rw] = 'G'; }
        Snd.play('gate'); Q.shake = 0.8; setEmo('scared', 2);
        startScripted(m.who, MINI[m.who].intro, () => beginMini(m));
      }
    }
  }
  // Mr Sy watches from a ledge on maps 3 and 5: he wakes the boss before the fight and speaks when it falls
  function syPoof() { const f = Q.syFig; if (!f) return; emit(f.x, f.y - 12, 30, { col: ['#7ed957', '#2f7a4a', '#fff'], sp0: 20, sp1: 100 }); addRing(f.x, f.y, '#7ed957', 50, 0.5); Snd.play('poof'); Q.syFig = null; }
  function syCameoPre() {
    const cam = SY_CAMEO[Q.li], ar = Q.L.arena; if (!cam) return false;
    Q.syFig = { x: (ar.x0 + 9) * TS, y: (ar.gy - 3) * TS }; emit(Q.syFig.x, Q.syFig.y - 12, 24, { col: ['#7ed957', '#fff'], sp0: 20, sp1: 90 }); Snd.play('poof');
    startScripted('sy', cam.pre, () => { Q.state = 'bossintro'; Q.stateT = 0; });
    return true;
  }
  function syCameoPost() {
    const cam = SY_CAMEO[Q.li]; if (!cam || !Q.syFig) return;
    later(1.6, () => { if (Q.state === 'play' && Q.syFig) startScripted('sy', cam.post, () => syPoof()); else syPoof(); });
  }

  // the worlds Quoc drags you into (one per form)
  function drawFormScene(fi) {
    const t = Q.t, grad = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); };
    if (fi === 1) { // shadow void: drifting smoke and blinking eyes
      grad('#05040a', '#1a0f2e');
      for (let i = 0; i < 14; i++) { const x = (i * 61 + t * (6 + i % 4)) % (VW + 60) - 30, y = 30 + (i * 37) % 140; g.globalAlpha = 0.14; disc(g, Math.round(x), y, 18 + (i % 3) * 8, '#5a2d8f'); }
      g.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { if (Math.sin(t * 0.7 + i * 2.1) < -0.6) continue; const x = (i * 97) % VW, y = 24 + (i * 53) % 110; g.fillStyle = '#ff3a5a'; g.fillRect(x, y, 2, 1); g.fillRect(x + 5, y, 2, 1); }
    } else if (fi === 2) { // hellfire plains
      grad('#2a0500', '#a02a0a');
      for (let i = 0; i < 26; i++) { const x = i * 16 - 8, h = 22 + Math.sin(t * 6 + i * 1.7) * 6 + (i % 3) * 8; g.fillStyle = i % 2 ? '#ff6a1a' : '#ffb02a'; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 8, 150 - h); g.lineTo(x + 16, 150); g.fill(); }
      g.fillStyle = '#2a0802'; g.fillRect(0, 148, VW, VH);
      for (let i = 0; i < 30; i++) { const x = (i * 47) % VW, y = VH - ((t * (20 + i % 7 * 6) + i * 31) % VH); g.fillStyle = i % 2 ? '#ffd34e' : '#ff7a2a'; g.fillRect(x, Math.round(y), 1, 2); }
    } else if (fi === 3) { // chain dungeon
      grad('#0e0c14', '#24202e');
      g.fillStyle = '#1a1722'; for (let y = 0; y < 150; y += 10) for (let x = ((y / 10) % 2) * 12; x < VW; x += 24) g.fillRect(x, y, 22, 8);
      g.fillStyle = '#5a5a6a'; for (let i = 0; i < 8; i++) { const cx = 20 + i * 50, sw = Math.sin(t * 1.5 + i) * 6; for (let k = 0; k < 14; k++) g.fillRect(Math.round(cx + sw * k / 14), k * 7, 3, 5); }
      for (const x of [60, 200, 330]) { g.globalAlpha = 0.25 + Math.sin(t * 9 + x) * 0.08; disc(g, x, 60, 18, '#ff7a2a'); g.globalAlpha = 1; g.fillStyle = '#ffd34e'; g.fillRect(x - 1, 56, 3, 6); }
    } else if (fi === 4) { // iron fortress
      grad('#3a3f50', '#1a1c26');
      g.fillStyle = '#14161e'; g.fillRect(0, 96, VW, 60); for (let x = 0; x < VW; x += 20) g.fillRect(x, 88, 12, 8);
      for (const x of [40, 180, 320]) { g.fillRect(x, 50, 34, 60); for (let k = 0; k < 4; k++) g.fillRect(x + k * 10, 42, 6, 8); g.fillStyle = '#a02a2a'; g.fillRect(x + 16, 20 + Math.sin(t * 3 + x) * 1, 1, 30); g.beginPath(); g.moveTo(x + 17, 20); g.lineTo(x + 30 + Math.sin(t * 4 + x) * 3, 26); g.lineTo(x + 17, 32); g.fill(); g.fillStyle = '#14161e'; }
      g.fillStyle = '#ffb02a'; for (let i = 0; i < 10; i++) g.fillRect(50 + i * 33, 110, 2, 3);
    } else if (fi === 5) { // storm above the clouds
      grad('#0a0e24', '#2a2e52');
      for (let i = 0; i < 12; i++) { const x = (i * 71 - t * 14) % (VW + 80); g.globalAlpha = 0.5; disc(g, Math.round(x < -40 ? x + VW + 80 : x), 40 + (i % 4) * 22, 26, '#1a1c3a'); } g.globalAlpha = 1;
      g.fillStyle = '#6a6e9a'; for (let i = 0; i < 18; i++) disc(g, i * 24, 150 + (i % 2) * 4, 14, '#3a3e66');
      if (Math.sin(t * 1.9) > 0.93) { g.globalAlpha = 0.35; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); const bx = 60 + (Math.floor(t) * 113) % 260; g.moveTo(bx, 0); for (let k = 1; k < 7; k++) g.lineTo(bx + ((k * 29) % 22) - 11, k * 22); g.stroke(); }
      g.fillStyle = 'rgba(170,190,255,.45)'; for (let i = 0; i < 50; i++) g.fillRect((i * 43 + t * 40) % VW, (i * 31 + t * 260) % VH, 1, 5);
    } else if (fi === 6) { // ashen wasteland
      grad('#1a0606', '#5a1a0a');
      for (const [x, h] of [[30, 70], [150, 100], [290, 80], [380, 60]]) { g.fillStyle = '#1a0a08'; g.beginPath(); g.moveTo(x - h, 150); g.lineTo(x, 150 - h); g.lineTo(x + h, 150); g.fill(); g.globalAlpha = 0.5 + Math.sin(t * 4 + x) * 0.2; disc(g, x, 150 - h, 6, '#ff6a1a'); g.globalAlpha = 1; }
      g.fillStyle = 'rgba(200,190,190,.55)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37 + Math.sin(t + i) * 8) % VW, (i * 23 + t * 18) % VH, 1, 1);
    } else if (fi === 7) { // eclipse void
      grad('#020108', '#0e0620');
      for (let i = 0; i < 70; i++) { g.fillStyle = i % 5 ? '#6a5a9a' : '#fff'; g.fillRect((i * 97) % VW, (i * 53) % 150, 1, 1); }
      const cx = VW * 0.68, cy = 62;
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + t * 0.3; g.strokeStyle = i % 2 ? '#d58bff' : '#ffffff'; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); g.lineTo(cx + Math.cos(a) * (60 + (i % 3) * 8), cy + Math.sin(a) * (60 + (i % 3) * 8)); g.stroke(); }
      g.globalAlpha = 1; disc(g, cx, cy, 44, '#b88aff'); disc(g, cx, cy, 40, '#050309');
    }
  }
  function bossPre() {
    const cam = SY_CAMEO[Q.li], ar = Q.L.arena, bl = BOSS_LINES[Q.li]; let lines = [];
    if (cam) { Q.syFig = { x: (ar.x0 + 9) * TS, y: (ar.gy - 3) * TS }; emit(Q.syFig.x, Q.syFig.y - 12, 24, { col: ['#7ed957', '#fff'], sp0: 20, sp1: 90 }); Snd.play('poof'); lines = cam.pre.map(l => Object.assign({ w: 'sy' }, l)); }
    if (bl && bl.pre) lines = lines.concat(bl.pre.map(l => Object.assign({ w: 'boss' + Q.li }, l)));
    if (lines.length) startScripted('boss' + Q.li, lines, () => { Q.state = 'bossintro'; Q.stateT = 0; });
  }
  function bossPost() {
    const cam = SY_CAMEO[Q.li], bl = BOSS_LINES[Q.li];
    let lines = bl && bl.post ? bl.post.map(l => Object.assign({ w: 'boss' + Q.li }, l)) : [];
    if (cam && Q.syFig) lines = lines.concat(cam.post.map(l => Object.assign({ w: 'sy' }, l)));
    if (!lines.length) return;
    later(1.6, () => { if (Q.state === 'play') startScripted(lines[0].w, lines, () => syPoof()); else syPoof(); });
  }

  // ===================== BOSS AI =====================
  const bc = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  function bossTargets() {
    const out = [], b = Q.boss, d = Q.dragon;
    if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro' && b.st !== 'dropwait' && b.st !== 'dropfall') out.push(b);
    if (d && !d.dead && !d.hide && d.st !== 'enter' && d.st !== 'talk') out.push(d);
    return out;
  }
  function cleanupCells() { if (Q.tmpCells) for (const c of Q.tmpCells) if (Q.L.grid[c[1]][c[0]] === 'I') Q.L.grid[c[1]][c[0]] = ' '; Q.tmpCells = []; }
  function addZone(o) { Q.zones.push(Object.assign({ t: 0, tel: 0.7, life: 0.6, dmg: 1, col: bpc(), vx: 0 }, o)); }
  function shockwave(b, small) {
    const c = bc(b); Q.shake = small ? 0.25 : 0.5; Snd.play('boom'); addRing(c.x, b.y + b.h, bpc(), small ? 55 : 90, 0.5); emit(c.x, b.y + b.h, 14, { col: '#cfd6e6', sp0: 20, sp1: 80, vy: -20 });
    const sp = (small ? 70 : 95) * b.fury;
    Q.projs.push({ x: c.x - 12, y: b.y + b.h - 6, vx: -sp, vy: 0, life: 1.8, grav: 0, col: bpc(), type: 'wave', boss: true });
    Q.projs.push({ x: c.x + 12, y: b.y + b.h - 6, vx: sp, vy: 0, life: 1.8, grav: 0, col: bpc(), type: 'wave', boss: true });
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
    rain: { tele: 0.5, start(b) { b.skT = 2.4; b.drop = 0; }, upd(b, dt) { b.skT -= dt; b.drop -= dt; const ar = Q.L.arena; if (b.drop <= 0) { b.drop = 0.2 / b.fury; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.y0 !== undefined ? ar.y0 + 2 : ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: bpc(), type: 'fall', boss: true }); } return b.skT <= 0; } },
    spin: { tele: 0.55, start(b) { b.n = 2 + (Q.li > 4 ? 1 : 0); b.skT = 0; b.rot = 0; b.recAfter = 1.0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b); b.rot += 0.26; for (let i = 0; i < 12; i++) { const a = b.rot + i / 12 * Math.PI * 2; firePr(c.x, c.y, Math.cos(a) * 80, Math.sin(a) * 80, { boss: true }); } if (--b.n <= 0) return true; b.skT = 0.8 / b.fury; } } },
    summon: { tele: 0.5, start(b) {
      let alive = Q.ents.filter(e => !e.dead).length;
      for (let i = 0; i < 3 && alive < 5; i++, alive++) { const m = makeEnemy(b.cfg.minion, b.x + b.w / 2 + (i - 1) * 34, b.y + b.h - 4, { minion: true }); if (!m.fly) m.vy = -150; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: bpc() }); }
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
    roar: { tele: 0.7, start(b) { b.skT = 1.5; b.rt = 0; b.hitDone = false; b.vx = 0; const c = bc(b); addRing(c.x, b.y + b.h, bpc(), 110, 0.8); if (b.id === 'quoc') Snd.devilRoar(1); else Snd.creature(Q.li, 'alert', true); Snd.play('boom'); }, upd(b, dt) { b.skT -= dt; b.rt -= dt; Q.shake = Math.max(Q.shake, 0.55); const c = bc(b), P = Q.P; if (b.rt <= 0 && b.skT > 0.2) { b.rt = 0.22; addRing(c.x, b.y + b.h * 0.5, bpc(), 60 + Math.random() * 40, 0.45); emit(c.x + rr(-b.w / 2, b.w / 2), b.y + rr(0, b.h * 0.5), 6, { col: ['#fff', bpc()], sp0: 30, sp1: 110 }); } if (!b.hitDone && b.skT < 1.2) { b.hitDone = true; for (const q of allPl()) if (Math.hypot(q.x + 4 - c.x, q.y + 7 - c.y) < b.w / 2 + 64) asP(q, () => { hurtPlayer(1, c.x); q.vx = (q.x + 4 < c.x ? -1 : 1) * 190; q.vy = -150; }); } return b.skT <= 0; } },
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
    clone: { tele: 0.6, start(b) { const ar = Q.L.arena; for (let i = 0; i < 2; i++) { const m = makeEnemy('eclipseclone', (ar.x0 + 8 + i * 14) * TS, ar.gy * TS, { minion: true, v: 'big' }); m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 14, { col: ['#a15be0', '#fff'], sp0: 20, sp1: 80 }); } Snd.creature(Q.li, 'alert', true); b.skT = 0.9; }, upd: wait },
    fan: { tele: 0.55, start(b) { b.n = 2; b.skT = 0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -4; i <= 4; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.2) * 95, Math.sin(a0 + i * 0.2) * 95, { boss: true }); if (--b.n <= 0) return true; b.skT = 0.75 / b.fury; } } },
    lobs: { tele: 0.6, start(b) { const c = bc(b), P = Q.P; for (let i = 0; i < 3; i++) { const tx = arenaClamp(P.x + 4 + (i - 1) * 54 + rr(-12, 12)), t = 0.95 + i * 0.22; Q.projs.push({ x: c.x, y: c.y, vx: (tx - c.x) / t, vy: -160, grav: 320, life: 3, col: bpc(), type: 'ball', boss: true, big: true, onLand: 'poison' }); } Snd.play('shoot'); b.skT = 1.4; }, upd: wait },
    crossBeam: { tele: 0.9, start(b) { const ar = Q.L.arena, gt = ar.gy * TS; addZone({ type: 'beam', x: ar.x0 * TS + 8, y: gt - 9, w: (ar.x1 - ar.x0) * TS - 16, h: 10, tel: 0.9, life: 0.5 }); addZone({ type: 'beam', x: ar.x0 * TS + 8, y: gt - 27, w: (ar.x1 - ar.x0) * TS - 16, h: 10, tel: 1.8, life: 0.5 }); b.skT = 2.8; Snd.play('flame'); }, upd: wait },
    rush: { tele: 0.55, start(b) { b.n = 3; b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 0.8; b.recAfter = 1.0; }, upd(b, dt) { b.skT -= dt; const hit = moveX(b, b.dir * 190 * b.fury * dt); if (Math.random() < 0.6) emit(b.x + b.w / 2 - b.dir * b.w / 2, b.y + b.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 25, vy: -10, grav: 20 }); if (hit || b.skT <= 0) { Q.shake = 0.3; Snd.play('boom'); if (--b.n <= 0) return true; b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 0.8; } } }
  };
  function groundYAt(x) { const tx = Math.floor(x / TS); for (let ty = (Q.L.arena && Q.L.arena.y0) || 3; ty < Q.L.H; ty++) if (solid(tx, ty)) return ty * TS; return Q.L.arena.gy * TS; }
  const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush', 'slam', 'cloak', 'rush'], RANGED = ['shoot', 'web', 'spit', 'curse', 'breath', 'rain', 'beam', 'meteor', 'lavaCols', 'sweep', 'spin', 'fan', 'lobs', 'crossBeam'];
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
  // every boss skill has a sound of its own (on top of the creature's voice)
  function bossSkillSnd(sk) {
    const G = { jump: 'whoosh', stomp: 'bstep', slam: 'boom', bounce3: 'whoosh', charge: 'rumble', rush: 'rumble', shoot: 'shoot', fan: 'shoot', spit: 'shoot', lobs: 'throw', rain: 'rumble', erupt: 'crumble', meteor: 'explode', lavaCols: 'flame', sweep: 'flame', beam: 'flame', crossBeam: 'flame', breath: 'flame', summon: 'poof', clone: 'poof', dark: 'poof', cloak: 'poof', teleport: 'poof', ambush: 'poof', shield: 'chime', guard: 'chime', tornado: 'windy', blizzard: 'windy', wall: 'crumble', curse: 'zap', web: 'throw', goo: 'splash', splitslime: 'splash', spin: 'whoosh', tentacles: 'rumble', burrow: 'crumble' };
    const n = G[sk]; if (n) Snd.play(n); if (sk === 'spin' || sk === 'bounce3') setTimeout(() => Snd.play('whoosh'), 250);
  }
  function endSkill(b) { b.st = 'rec'; b.timer = (b.recAfter || 0.8) / b.fury; b.recAfter = 0; b.lastSk = b.sk; b.sk = null; }
  function updateBoss(dt) {
    const b = Q.boss; if (!b || b.dead) return;
    const P = Q.P, c = b.cfg;
    b.t += dt; if (b.flash > 0) b.flash -= dt; if (b.shield > 0) b.shield -= dt; if (b.evCd > 0) b.evCd -= dt; if (b.invul > 0) b.invul -= dt;
    if (b.squashT > 0) b.squashT -= dt; if (b.kick > 0) b.kick -= dt; if (b.guard > 0) b.guard -= dt; if (b.revT > 0) b.revT -= dt; if (b.moveT > 0) b.moveT -= dt;
    b.fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7 + 0.1 * (b.pp || 0);
    if (b.morph) { morphTick(b, dt); return; }
    if (b.st === 'sleep') return;
    if (b.st !== 'intro' && !b.morph) {
      if (b.lastHit === undefined) b.lastHit = Q.t;
      if (Q.t - b.lastHit > 30 && b.max && b.hp < b.max) {
        b.hp = Math.min(b.max, b.hp + b.max * 0.015 * dt); b.regT = (b.regT || 0) - dt;
        if (Math.random() < 0.3) emit(b.x + rr(0, b.w), b.y + rr(0, b.h), 1, { col: ['#7ed957', '#d8ff9a', '#fff'], sp0: 5, sp1: 20, grav: -40, l0: 0.4, l1: 0.8 });
        if (b.regT <= 0) { b.regT = 2; pop(b.x + b.w / 2, b.y - 8, save.lang === 'vi' ? 'BOSS ĐANG HỒI MÁU!' : 'THE BOSS IS HEALING!', '#7ed957'); }
      }
      if (b.cfg.art) {
        b.growlT = (b.growlT === undefined ? 3 : b.growlT) - dt; if (b.growlT <= 0) { b.growlT = rr(4, 7); Snd.creature(Q.li, 'idle', true, 0.8); }
        const cxm2 = b.x + b.w / 2;
        if (b.cfg.art === 'shroom' && Math.random() < 0.25) emit(cxm2 + rr(-b.w / 2, b.w / 2), b.y + rr(0, b.h * 0.3), 1, { col: ['#c8f0a0', '#c07bff', '#a4ffc0'], sp0: 3, sp1: 14, grav: -18, l0: 0.8, l1: 1.6 });
        else if (b.cfg.art === 'kraken' && Math.random() < 0.3) emit(cxm2 + rr(-b.w / 3, b.w / 3), b.y + rr(b.h * 0.2, b.h * 0.6), 1, { col: ['#bfeaff', '#fff'], sp0: 3, sp1: 10, grav: -60, l0: 0.8, l1: 1.6 });
        else if (b.cfg.art === 'worm' && Math.random() < 0.2) emit(cxm2 + rr(-b.w / 2, b.w / 2), b.y + b.h - 4, 1, { col: ['#8a6a4a', '#5a4430'], sp0: 10, sp1: 40, vy: -40, grav: 300, l0: 0.4, l1: 0.8 });
      }
    }
    if (c.drop && (b.st === 'intro' || b.st === 'dropwait' || b.st === 'dropfall')) {
      if (b.st === 'intro') { b.st = 'dropwait'; b.timer = 3.4; b.hide = true; b.lockx = null; b.tx = P.x + 4; Q.state = 'play'; Q.msg = save.lang === 'vi' ? 'Có thứ gì đó đang rơi xuống! Hãy chạy khỏi cái bóng!' : 'Something is falling! Run from the shadow!'; Q.msgT = 3; Snd.monster(7, 'alert', 1); return; }
      if (b.st === 'dropwait') {
        b.timer -= dt; if (b.timer > 1.1) b.tx = P.x + 4; else if (b.lockx === null) { b.lockx = b.tx; Snd.play('whoosh'); }
        if (Math.random() < 0.5) emit((b.lockx === null ? b.tx : b.lockx) + rr(-30, 30), Q.cam.y + rr(0, 60), 1, { col: ['#c8f0a0', '#c07bff'], sp0: 10, sp1: 40, vy: 140, grav: 200, l0: 0.3, l1: 0.6 });
        if (b.timer <= 0) { b.st = 'dropfall'; b.hide = false; b.x = (b.lockx === null ? b.tx : b.lockx) - b.w / 2; b.y = Q.cam.y - b.h - 40; b.vy = 200; Snd.monster(7, 'attack', 1); }
        return;
      }
      b.vy = Math.min(950, b.vy + 1700 * dt); moveY(b, b.vy * dt);
      hitPlB({ x: b.x + 6, y: b.y + 6, w: b.w - 12, h: b.h - 8 }, () => hurtPlayer(2, b.x + b.w / 2));
      if (b.onGround) { b.st = 'rec'; b.timer = 1.3; b.squashT = 0.3; Q.shake = 1; Snd.play('boom'); Snd.monster(7, 'alert', 1); shockwave(b); hitPlB({ x: b.x - 30, y: b.y + b.h - 16, w: b.w + 60, h: 20 }, () => hurtPlayer(1, b.x + b.w / 2)); }
      return;
    }
    if (b.st === 'intro') { b.timer += dt; if (b.timer > 2.2) { b.st = 'wait'; b.timer = 0.8; Q.state = 'play'; } return; }
    const pct = b.hp / b.max, ph = pct < 0.33 ? 2 : (pct < 0.66 ? 1 : 0);
    if (ph > b.phase) { b.phase = ph; b.invul = 1.0; Q.shake = 0.8; Snd.creature(Q.li, 'alert', true); emit(b.x + b.w / 2, b.y + b.h / 2, 30, { col: ['#fff', bpc()], sp0: 40, sp1: 160 }); Q.msg = save.lang === 'vi' ? 'Boss nổi điên!' : 'The boss is enraged!'; Q.msgT = 3; }
    if (b.hide) { const sk = BS[b.sk]; if (sk && sk.upd(b, dt)) endSkill(b); return; }
    b.vy = Math.min(420, b.vy + GRAV * dt);
    if (c.swim && !b.hide && Q.L.arena.y0 !== undefined) { const ar = Q.L.arena, ty = clamp(P.y + 7 - b.h * 0.5, ar.y0 * TS + 14, ar.gy * TS - b.h); b.vy = clamp((ty - b.y) * 1.4, -62, 62); }
    const cxm = b.x + b.w / 2, cym = b.y + b.h / 2, dxp = (P.x + 4) - cxm;
    switch (b.st) {
      case 'wait': {
        b.dir = dxp < 0 ? -1 : 1;
        // chase: when the hero is far away the boss runs after them first and attacks once it is close (or after ~3s)
        const far = Math.abs(dxp) > b.w / 2 + 110;
        b.chaseT = far ? (b.chaseT || 0) + dt : 0;
        if (b.onGround && b.moveT > 0) { b.stepT = (b.stepT || 0) - dt; if (b.stepT <= 0) { b.stepT = clamp(0.62 - b.w / 400, 0.3, 0.6); if (b.w >= 30) { Snd.play('bstep'); Q.shake = Math.max(Q.shake, b.w >= 60 ? 0.12 : 0.05); } } }
        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * Math.max(c.sp, 45) * (far ? 1.7 : 1.15) * b.fury * dt); b.moveT = 0.12; }
        if (far && b.chaseT < 3 && b.timer < 0.1) b.timer = 0.1;
        if (b.onGround && P.y + P.h < b.y + b.h - 30 && Math.abs(dxp) < b.w / 2 + 70 && Math.random() < dt * 1.2) { b.vy = -380; b.onGround = false; Snd.play('whoosh'); emit(cxm, b.y + b.h, 8, { col: '#cfd6e6', sp0: 20, sp1: 60 }); }
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
      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; bossSkillSnd(b.sk); } break;
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
    if (!b.hide) hitPlB({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer((Q.li >= 3 ? 2 : 1) + ((b.pp || 0) >= 2 ? 1 : 0), cxm));
  }

  // ===================== ANIMATION / EFFECTS =====================
  function addRing(x, y, col, max, dur) { Q.rings.push({ x, y, col, max: max || 60, dur: dur || 0.45, t: 0 }); }
  function addGhost(b, type) { Q.ghosts.push({ spr: b.spr, x: b.x + b.w / 2, bot: b.y + b.h, flip: b.dir < 0, type, t: 0, dur: 0.32 }); }
  // the shared animator for code-drawn characters: the same six states as the hero, stepped at ~10 fps like pixel art
  // st: 'idle' | 'walk' | 'run' | 'push' | 'jump' | 'hurt'; k: progress for jump (vy) or hurt (0..1). Returns {sx, sy, ox, oy, rot, red}
  function animPose(st, t, dir, k) {
    const F = (fps, n) => Math.floor(t * fps) % n, o = { sx: 1, sy: 1, ox: 0, oy: 0, rot: 0, red: false };
    if (st === 'hurt') { const f = Math.min(2, Math.floor(k * 3)); o.red = f === 1; o.ox = -dir * (f === 2 ? 1 : 2); o.rot = -dir * 0.08; o.sx = 1.06; o.sy = 0.94; return o; }
    if (st === 'jump') { const vy = k || 0; if (vy < -120) { o.sy = 1.12; o.sx = 0.9; } else if (vy < 60) { o.sy = 1.02; o.sx = 0.98; o.rot = dir * 0.04; } else { o.sy = 1.08; o.sx = 0.94; o.rot = -dir * 0.04; } return o; }
    if (st === 'push') { const f = F(7, 6); o.rot = dir * 0.14; o.ox = dir * 1; o.oy = f % 3 === 1 ? -1 : 0; o.sx = 1.04; return o; }
    if (st === 'run') { const f = F(12, 6); o.oy = [0, -2, -1, 0, -2, -1][f]; o.rot = dir * 0.1; o.sy = [0.94, 1.06, 1, 0.94, 1.06, 1][f]; o.sx = 2 - o.sy; return o; }
    if (st === 'walk') { const f = F(9, 6); o.oy = [0, -1, -1, 0, -1, -1][f]; o.rot = dir * [0.03, 0.05, 0.02, 0.03, 0.05, 0.02][f]; o.sy = [0.97, 1.02, 1, 0.97, 1.02, 1][f]; o.sx = 2 - o.sy; return o; }
    const f = F(4, 4); o.sy = [1, 1.025, 1.04, 1.025][f]; o.sx = 2 - o.sy; return o;   // idle: breathing in 4 steps
  }
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
  const SLAM_L = ['jump', 'stomp', 'bounce3', 'slam', 'ambush'], RANGE_L = ['shoot', 'web', 'spit', 'curse', 'breath', 'spin', 'rain', 'beam', 'fan', 'lobs', 'crossBeam'], CAST_L = ['summon', 'splitslime', 'goo', 'erupt', 'tornado', 'dark', 'clone', 'meteor', 'lavaCols', 'sweep', 'roar', 'wall', 'blizzard'];
  function bossPose(b) {
    const t = b.t, dir = b.dir < 0 ? -1 : 1, sk = b.st === 'tele' ? b.atkSk : b.sk, br = Math.sin(t * 3);
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al = 1, aura = null, circle = false;
    if (b.st === 'wait') { if (b.moveT > 0) { sy = 1 + 0.035 * Math.sin(t * 11); rot = dir * 0.045 * Math.sin(t * 11); oy = -Math.abs(Math.sin(t * 11)) * 2.2; } else { sy = 1 + 0.025 * br; sx = 1 - 0.015 * br; } }
    else if (b.st === 'tele' && BS[b.atkSk]) {
      const k = clamp(1 - b.timer / (BS[b.atkSk].tele / b.fury), 0, 1), j = (Math.random() - 0.5) * 2 * k;
      if (SLAM_L.indexOf(sk) >= 0) { sy = 1 - 0.22 * k; sx = 1 + 0.14 * k; ox = j * 1.2; }
      else if (sk === 'charge' || sk === 'rush') { rot = -dir * 0.16 * k; sx = 1 + 0.06 * k; ox = -dir * 3 * k + j; }
      else if (RANGE_L.indexOf(sk) >= 0) { sy = 1 + 0.08 * k; sx = 1 - 0.05 * k; oy = -2 * k; rot = -dir * 0.07 * k; aura = [bpc(), 0.5 * k]; }
      else if (sk === 'guard' || sk === 'shield') { sy = 1 - 0.1 * k; sx = 1 + 0.1 * k; aura = ['#6ee7f2', 0.5 * k]; }
      else if (sk === 'cloak' || sk === 'teleport') { sx = 1 - 0.3 * k; sy = 1 + 0.1 * k; al = 1 - 0.55 * k; aura = ['#a15be0', 0.5 * k]; }
      else { oy = -5 * k; sy = 1 + 0.1 * k; rot = j * 0.05; aura = [bpc(), 0.6 * k]; circle = true; }
    } else if (b.st === 'act') {
      if (SLAM_L.indexOf(b.sk) >= 0 && !b.onGround) { const st = clamp(Math.abs(b.vy) / 1400, 0, 0.2); sy = 1 + st; sx = 1 - st * 0.7; rot = dir * 0.05; }
      else if (b.sk === 'charge' || b.sk === 'rush') { sx = 1.14; sy = 0.92; rot = dir * 0.2; }
      else if (b.sk === 'guard' || b.sk === 'shield') { sy = 0.92; sx = 1.08; }
      else if (CAST_L.indexOf(b.sk) >= 0) { oy = -4 + Math.sin(t * 6) * 1.2; sy = 1.05; circle = true; aura = [bpc(), 0.35]; }
      else if (RANGE_L.indexOf(b.sk) >= 0) { sy = 1.03; aura = [bpc(), 0.25]; }
    } else if (b.st === 'rec') { sy = 0.95 + 0.02 * Math.sin(t * 5); sx = 1.04; }
    else if (b.st === 'stun') { rot = Math.sin(t * 14) * 0.12; sy = 0.9; sx = 1.06; }
    else if (b.st === 'evade') { rot = (b.ed || 1) * -0.2; sx = 1.08; sy = 0.94; }
    else if (b.st === 'intro') { const k = Math.min(1, b.timer / 1.2); sy = 0.8 + 0.2 * k; sx = 1.1 - 0.1 * k; aura = [bpc(), 0.4 * (1 - k)]; }
    if (b.squashT > 0) { const k = b.squashT / 0.22; sy *= 1 - 0.32 * k; sx *= 1 + 0.28 * k; }
    if (b.kick > 0) { const k = b.kick / 0.16; sx *= 1 + 0.12 * k; ox -= dir * 3 * k; }
    if (b.cloak) al = 0.1 + 0.07 * Math.sin(t * 9);
    if (b.morph) { const mt = b.morph.t, k = mt < 1.1 ? 1 - 0.8 * (mt / 1.1) : 0.2 + 0.8 * Math.min(1, (mt - 1.1) / 0.8); sx *= k; sy *= k; if (mt < 1.1) { rot += Math.sin(mt * 40) * 0.1; ox += (Math.random() - 0.5) * 4; } aura = ['#a15be0', 0.9]; circle = true; }
    if (b.st === 'act' && b.sk === 'roar') { sy *= 1.08; sx *= 1.06; ox += (Math.random() - 0.5) * 3; aura = [bpc(), 0.6]; }
    if (b.guard > 0) { sx *= 1.05; sy *= 0.94; }
    // living creatures: the mushroom sways and breathes, the kraken floats and pulses, the worm writhes
    const art = b.cfg.art, mv = b.moveT > 0 || b.st === 'evade';
    if (art === 'shroom') { rot += Math.sin(t * (mv ? 8 : 1.6)) * (mv ? 0.08 : 0.045); sy *= 1 + 0.04 * Math.sin(t * 2.1); sx *= 1 - 0.03 * Math.sin(t * 2.1); if (mv) oy -= Math.abs(Math.sin(t * 8)) * 2.5; }
    else if (art === 'kraken') { oy += Math.sin(t * 1.8) * 5 - 3; rot += Math.sin(t * 1.2) * 0.04; sx *= 1 + 0.05 * Math.sin(t * (mv ? 6 : 2.4)); sy *= 1 - 0.035 * Math.sin(t * (mv ? 6 : 2.4)); }
    else if (art === 'worm') { rot += Math.sin(t * (mv ? 7 : 3)) * 0.09; sx *= 1 + 0.06 * Math.sin(t * (mv ? 12 : 6)); sy *= 1 - 0.05 * Math.sin(t * (mv ? 12 : 6) + 1); }
    return { sx, sy, rot, ox, oy, al, aura, circle };
  }

  // ===================== DRAGON =====================
  const dc = d => ({ x: d.x + d.w / 2, y: d.y + d.h / 2 });
  const dHover = d => d.tr.gy * TS - (d.def.kind === 'young' ? 30 : 50) - d.h * (d.def.kind === 'young' ? 0.28 : 0.45), dLow = d => d.tr.gy * TS - 24;
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
  function hurtDragon(d, dmg, pierce, quiet) {
    if (d.invul > 0 || d.dead || d.hide || d.st === 'enter' || d.st === 'talk' || d.st === 'morph' || d.st === 'flee' || d.st === 'flee0') return;
    const arm = d.armor * ((d.st === 'act' && d.sk === 'perch' && d.ph === 1) || d.st === 'rec' ? 0.55 : 1), eff = dmg * (1 - arm * (pierce ? 0.4 : 1));
    d.hp -= eff; d.flash = 0.1; Q.shake = Math.max(Q.shake, 0.15);
    if (!quiet || d.hp <= 0) Snd.creature('dragon', d.hp <= 0 ? 'die' : 'hurt', true);
    emit(d.x + d.w / 2, d.y + d.h / 2, 8, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });
    if (d.def.kind === 'young') { if (d.hp <= d.max * 0.45) startFlee(d); }
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
    if (!d.hide && d.st !== 'enter' && d.st !== 'talk' && (d.def.kind !== 'young' || (d.st === 'act' && d.sk === 'dive'))) hitPlB({ x: d.x + 6, y: d.y + 4, w: d.w - 12, h: d.h - 8 }, () => hurtPlayer(d.def.kind === 'young' ? 1 : 2, c.x));
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
      if (z.type === 'poison') { z.tick = (z.tick || 0) - dt; if (z.tick <= 0 && allPl().some(q => ov(q, box))) { z.tick = 0.9; hitPl(box, () => hurtPlayer(1, z.x + z.w / 2, true)); } }
      else if (z.type === 'goo') hitPl(box, q => { q.slow = Math.max(q.slow || 0, 0.5); });
      else if (z.type === 'pull') {
        const cx = z.x + z.w / 2, dx = cx - (P.x + 4);
        if (Math.abs(dx) < z.w / 2) moveX(P, clamp(dx, -1, 1) * 58 * dt);
        if (Math.random() < 0.5) emit(cx + rr(-z.w / 2, z.w / 2), z.y + rr(0, z.h), 1, { col: z.col, sp0: 10, sp1: 30, vx: (cx - 0) * 0, grav: -10, l0: 0.3, l1: 0.6 });
        if (Math.abs(dx) < 12 && Math.abs(P.y + 7 - (z.y + z.h / 2)) < 26) { z.tick = (z.tick || 0) - dt; if (z.tick <= 0) { z.tick = 0.5; hurtPlayer(1, cx); } }
      }
      else hitPlB(box, () => hurtPlayer(z.dmg, z.x + z.w / 2, false, (z.type === 'lava' || z.type === 'meteor' || z.type === 'sweep' || z.type === 'beam') ? 'fire' : ''));
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
      if (!p.dead) hitPlB(hb, q => { if (!p.dead && q.parryT > 0 && Q.state === 'play') { reflectShot(p, q); return; } if (!p.dead && hurtPlayer(p.dmg || 1, p.x, false, p.fl ? 'fire' : '')) { p.dead = true; if (p.status) for (const k in p.status) q[k] = Math.max(q[k] || 0, p.status[k]); } });
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
    if (coop && coop.role === 'host') { lines = teamLines(lines, who); if (who === 'ember' && lines[0]) who = lines[0].w; }
    Q.talk = { it: { who }, npc: NPCS[who], lines, i: 0, t: 0, after, cine: true }; Q.state = 'talk'; Snd.blip(who); Q.P.vx = 0;
  }
  function giveGift(gf) {
    for (const k in gf) Q.P.ammo[k] += gf[k];
    Snd.play('pickup'); Q.msg = T('gift') + '  (+' + gf.dagger + ' ' + T('dagger') + ', +' + gf.bomb + ' ' + T('bomb') + ', +' + gf.flask + ' ' + T('flask') + ')'; Q.msgT = 5;
  }
  function endTalk() {
    const tk = Q.talk, n = tk.npc, it = tk.it; Q.talk = null;
    if (tk.after) { Q.state = 'play'; tk.after(); return; }
    if (n.trade) { Q.state = 'play'; openShopInGame('trade'); return; }
    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; Q.shopWho = it.who; return; }
    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
      if (n.gift) giveGift(n.gift);
    }
  }
  function updateTalk(dt) {
    const tk = Q.talk;
    if (coop && tk.hostDone) { if (coopTalkDone()) endTalk(); return; }
    tk.t += dt;
    const full = tk.lines[tk.i][save.lang].length;
    { const ln = tk.lines[tk.i][save.lang], n0 = Math.floor((tk.t - dt) * 45), n1 = Math.min(ln.length, Math.floor(tk.t * 45));
      for (let k = n0 + 1; k <= n1; k++) if (k % 2 === 0 && /\S/.test(ln[k - 1] || ' ')) { const sw = tk.lines[tk.i].w || tk.it.who; if (sw.indexOf('boss') === 0) Snd.creature(Q.li, 'idle', true, 0.7); else if (sw !== 'narr') Snd.blip(sw); } }
    if (act.okP || act.talkP || act.atkP) {
      if (tk.t * 45 < full) tk.t = 999;
      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) coopTalkEnd(tk); }
    }
    if (Q.talk && (act.backP || act.pauseP)) coopTalkEnd(tk);
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
          if (t.up) hitPl({ x: t.x - t.w * 8 + 1, y: t.y - 9, w: t.w * 16 - 2, h: 9 }, () => hurtPlayer(1, t.x));
          break;
        }
        case 'jets': {
          const ph = (t.t + t.off) % 3.6; t.warn = ph >= 1.8 && ph < 2.4; t.up = ph >= 2.4 && ph < 3.3;
          if (t.up) { if (Math.random() < 0.6) emit(t.x + rr(-3, 3), t.y - rr(8, 40), 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 14, vy: -20, grav: -10, l0: 0.2, l1: 0.4 }); hitPl({ x: t.x - 5, y: t.y - 40, w: 10, h: 40 }, () => hurtPlayer(1, t.x)); }
          break;
        }
        case 'saw': {
          t.ph += dt * (46 + Q.li * 3) / Math.max(16, t.len * 16) * Math.PI;
          t.sx = t.x0 + (t.len * 16 - 16) * (0.5 - 0.5 * Math.cos(t.ph));
          hitPl({ x: t.sx - 6, y: t.y - 15, w: 12, h: 13 }, () => hurtPlayer(1, t.sx));
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
        if (d < (hasRelic(3) ? 90 : 40) * (petRole() === 'coin' || pSt('coin') ? 2.2 : (petRole() === 'rainbow' ? 1.8 : 1)) && !it.drop) { it.x += (pc.x - it.x) * 6 * dt; it.y += (pc.y - it.y) * 6 * dt; }
        if (d < 10) { it.dead = true; const cv2 = hasRelic(3) ? 2 : 1; Q.coinsRun += cv2; save.coins += cv2; if (coop) coop.gold = (coop.gold || 0) + cv2; Snd.play('coin'); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 4, { col: '#ffd34e', sp0: 10, sp1: 40 }); if (Q.coinsRun % 50 === 0 && Q.P.hp < maxHP()) { Q.P.hp++; Snd.play('heart'); } }
      } else if (it.kind === 'heart') {
        if (d < 11 && coop && Q.players) { const need = Q.players.filter(p => !p.down && p.hp < (p.mhp || maxHP())); if (need.length) { for (const p of need) { p.hp++; emit(p.x + 4, p.y + 2, 8, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 40 }); } it.dead = true; Snd.play('heart'); if (it.id >= 0) Q.taken.add(it.id); pop(it.x, it.y - 10, sv('+1 HP for the team', '+1 máu cả đội'), '#ff7fb0'); } }
        else if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true; Snd.play('heart'); setEmo('happy', 1); if (it.id >= 0) Q.taken.add(it.id); emit(it.x, it.y, 10, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); } }
      } else if (it.kind === 'shard') {
        if (d < 13) { it.dead = true; save.shards[Q.li][it.k] = 1; writeSave(); Q.taken.add(it.id); Snd.play('shard'); setEmo('happy', 2.2); Q.shardFlash = 1.2; emit(it.x, it.y, 30, { col: ['#ffd34e', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); const ts = totalShards(); Q.msg = (save.lang === 'vi' ? 'Mảnh nắng ' : 'Sun Shard ') + ts + '/21' + (ts % 3 === 0 ? (save.lang === 'vi' ? '  — Tim tối đa tăng!' : '  — Max hearts up!') : '') + (ts % 7 === 0 ? (save.lang === 'vi' ? '  — Kiếm mạnh hơn!' : '  — Sword stronger!') : ''); Q.msgT = 4; if (P.hp < maxHP()) P.hp = maxHP(); }
      } else if (it.kind === 'pk') {
        if (d < 13) {
          it.dead = true; P.ammo[it.what] += it.amt; Snd.play('pickup'); if (it.id >= 0 && !it.keep) Q.taken.add(it.id);
          Q.msg = '+' + it.amt + ' ' + T(it.what) + '   (L / Q)'; Q.msgT = 3; emit(it.x, it.y, 8, { col: ['#fff', '#ffd34e'], sp0: 10, sp1: 50 });
          const names = ['dagger', 'bomb', 'flask']; if (P.ammo[names[P.sel]] <= 0) P.sel = names.indexOf(it.what);
        }
      } else if (it.kind === 'buff') {
        if (d < 12) { it.dead = true; Snd.play('relic'); emit(it.x, it.y, 16, { col: it.what === 'shield' ? ['#6ee7f2', '#fff'] : ['#ff5a3a', '#ffd34e'], sp0: 20, sp1: 80 });
          if (it.what === 'shield') { P.shield = true; Q.msg = save.lang === 'vi' ? 'Nhận khiên bảo vệ!' : 'Shield!'; } else { Q.G.powerT = 10; Q.msg = save.lang === 'vi' ? 'Sức mạnh x2 trong 10 giây!' : 'Power up for 10 seconds!'; } Q.msgT = 2.5; }
      } else if (it.kind === 'pearl') {
        if (d < 13) { it.dead = true; Q.taken.add(it.id); Q.pearls = (Q.pearls || 0) + 1; Snd.play('shard'); emit(it.x, it.y, 28, { col: ['#ffffff', '#bfeaff', '#ffd0f0'], sp0: 20, sp1: 110 }); addRing(it.x, it.y, '#bfeaff', 40, 0.5);
          Q.msg = Q.pearls >= 3 ? (save.lang === 'vi' ? 'Đủ 3 Ngọc Trai! Mang xuống Cánh Cửa Thủy Triều ở đáy biển.' : 'All 3 Sea Pearls! Take them to the Tide Door at the bottom.') : (save.lang === 'vi' ? 'Ngọc Trai Biển ' : 'Sea Pearl ') + Q.pearls + '/3'; Q.msgT = 4; }
      } else if (it.kind === 'egg') {
        if (d < 26 && !it.seen && Q.state === 'play') { it.seen = true; const E = EGGS[it.k]; const first = !save.eggs[it.k]; save.eggs[it.k] = 1; writeSave(); Snd.play('relic'); emit(it.x, it.y - 10, 20, { col: ['#ffd34e', '#fff', '#ff7fb0'], sp0: 20, sp1: 70 });
          startScripted('narr', [{ en: E.en, vi: E.vi }, { en: 'Secret found! (' + Object.keys(save.eggs).length + ' / ' + Object.keys(EGGS).length + ')' + (first ? ' +1 Star Gem' : ''), vi: 'Tìm thấy bí mật! (' + Object.keys(save.eggs).length + ' / ' + Object.keys(EGGS).length + ')' + (first ? ' +1 Ngọc Sao' : '') }], null); if (first) save.rare++; }
      } else if (it.kind === 'orb') {
        if (d < 13) {
          it.dead = true; if (save.orbs.indexOf(Q.li) < 0) save.orbs.push(Q.li); writeSave(); Snd.play('shard'); emit(it.x, it.y, 30, { col: ['#ffb04a', '#ffd34e', '#fff'], sp0: 20, sp1: 120 }); addRing(it.x, it.y, '#ffb04a', 40, 0.5);
          if (save.orbs.length >= 7 && !save.wish) { save.wish = 1; writeSave(); Q.wishT = 9; Snd.devilRoar && Snd.play('boom');
            startScripted('narr', [{ en: 'The seven Wish Orbs shine together... the sky turns dark... and a great green dragon rises from the light!', vi: 'Bảy viên Ngọc Ước cùng phát sáng... bầu trời tối sầm... và một con rồng xanh khổng lồ bay lên từ ánh sáng!' },
              { en: '"SPEAK YOUR WISH, LITTLE FLAME. I SHALL GRANT ONE."', vi: '"HÃY NÓI ĐIỀU ƯỚC CỦA NGƯƠI, NGỌN LỬA NHỎ. TA SẼ BAN MỘT ĐIỀU."' },
              { en: 'You wish for the strength to protect everyone. (+1 max heart, +1 damage, +10 Star Gems!)', vi: 'Bạn ước có sức mạnh để bảo vệ mọi người. (+1 tim tối đa, +1 sát thương, +10 Ngọc Sao!)' }],
              () => { save.bonusHP = Math.min(6, save.bonusHP + 1); save.bonusDmg = Math.min(4, save.bonusDmg + 1); save.rare += 10; writeSave(); Q.P.hp = maxHP(); });
          } else { Q.msg = sv('Wish Orb with ', 'Ngọc Ước ') + it.n + sv(' stars! (', ' sao! (') + save.orbs.length + '/7)' + sv(' Gather all seven...', ' Hãy gom đủ bảy viên...'); Q.msgT = 4; }
        }
      } else if (it.kind === 'rare') {
        if (d < 13) {
          it.dead = true; Snd.play('shard'); emit(it.x, it.y, 26, { col: ['#c07bff', '#6ee7f2', '#fff'], sp0: 20, sp1: 110 }); addRing(it.x, it.y, '#c07bff', 30, 0.4);
          if (!coop || P === Q.me) { save.rare++; const g2 = save.rareGot[Q.li] || (save.rareGot[Q.li] = []); if (g2.indexOf(it.k) < 0) g2.push(it.k); writeSave(); Q.msg = sv('Star Gem! You have ', 'Ngọc Sao! Bạn có ') + save.rare + sv(' - trade them with the travelling merchant (B).', ' viên - đổi quà ở thương nhân (B).'); Q.msgT = 4; }
          else { coopGive(P, { t: 'rare' }); Q.msg = 'P' + (P.slot + 1) + sv(' found a Star Gem!', ' nhặt được Ngọc Sao!'); Q.msgT = 3; }
        }
      } else if (it.kind === 'key') {
        if (d < 13) { it.dead = true; P.keys++; Snd.play('key'); Q.taken.add(it.id); Q.msg = T('gotkey'); Q.msgT = 3; emit(it.x, it.y, 14, { col: ['#ffd34e', '#fff'], sp0: 15, sp1: 60 }); }
      } else if (it.kind === 'npc') {
        if (Math.abs(it.x - pc.x) < 26 && Math.abs(it.y - pc.y) < 30) Q.nearNpc = it;
      } else if (it.kind === 'cp') {
        if (!it.lit && Math.abs(it.x - pc.x) < 14 && Math.abs(it.y - pc.y) < 30) {
          Q.items.forEach(o => { if (o.kind === 'cp') o.lit = false; }); it.lit = true; Q.cpCount = (Q.cpCount || 0) + 1; if (Q.cpCount === 2 && MID_STORY[Q.li] && !Q.midDone) { Q.midDone = true; later(0.6, () => { if (Q.state === 'play') startScripted('ember', MID_STORY[Q.li], null); }); } Q.cp = { x: it.x, y: it.y, id: it.id }; Snd.play('checkpoint'); saveResume(); pop(it.x, it.y - 34, sv('Progress saved', 'Đã lưu tiến trình'), '#a4ffc0'); emit(it.x, it.y - 12, 16, { col: ['#ffd34e', '#fff'], sp0: 15, sp1: 70 });
          if (P.hp < maxHP()) { P.hp = maxHP(); }
        }
      } else if (it.kind === 'frag') {
        if (d < 18 && Q.state === 'play') { it.dead = true; completeLevel(); }
      }
    }
    Q.items = Q.items.filter(i => !i.dead);
  }

  function saveResume() {
    if (coop || DEMO) return;
    save.resume = { li: Q.li, pearls: Q.pearls || 0, cp: Q.cp, taken: [...Q.taken], solved: [...Q.solved], brokenX: [...Q.brokenX], trialsDone: [...Q.trialsDone], dragonsDone: [...Q.dragonsDone], minisDone: [...Q.minisDone], coinsRun: Q.coinsRun, time: Q.time, cpCount: Q.cpCount || 0, midDone: !!Q.midDone, ammo: save.ammo };
    writeSave();
  }
  function resumeLevel() {
    const r = save.resume; if (!r || !BIOMES[r.li]) return;
    startLevel(r.li);
    Q.taken = new Set(r.taken || []); Q.solved = new Set(r.solved || []); Q.brokenX = new Set(r.brokenX || []); Q.trialsDone = new Set(r.trialsDone || []); Q.dragonsDone = new Set(r.dragonsDone || []); Q.minisDone = new Set(r.minisDone || []);
    Q.cp = r.cp; Q.cpCount = r.cpCount; Q.midDone = r.midDone; Q.coinsRun = r.coinsRun || 0; Q.time = r.time || 0;
    Q.pearls = r.pearls || 0; Q.questShown = true; if (Q.L.pearlGate && Q.pearls >= 3) { const pg = Q.L.pearlGate; pg.open = true; for (let y = pg.y0; y <= pg.y1; y++) for (let x = pg.x0; x <= pg.x1; x++) Q.L.grid[y][x] = ' '; }
    initEntities(); Q.scn = buildScene();
    if (Q.cp) { Q.P.x = Q.cp.x - Q.P.w / 2; Q.P.y = Q.cp.y - Q.P.h; Q.safe = { x: Q.P.x, y: Q.P.y }; }
    snapCam(); Q.state = 'intro'; Q.stateT = 0; Q.msg = sv('Welcome back! Continuing from your last checkpoint.', 'Chào mừng trở lại! Chơi tiếp từ checkpoint cuối.'); Q.msgT = 4;
  }
  function completeLevel() {
    Q.state = 'complete'; Q.stateT = 0; Snd.stop();
    Q.relicNew = !save.relics[Q.li]; save.relics[Q.li] = 1;
    Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer'); setEmo('happy', 99);
    if (save.cleared.indexOf(Q.li) < 0) save.cleared.push(Q.li);
    if (save.resume && save.resume.li === Q.li) delete save.resume;
    Q.firstClear = true; Q.bonusGold = 40 + 25 * Q.li; save.coins += Q.bonusGold;
    writeSave();
  }

  // ===================== GEAR: equipment, special weapons, armor, pets =====================
  const isFan = P => !!(P && P.hero && typeof HERO !== 'undefined' && HERO[P.hero] && HERO[P.hero].custom === 'fan');
  const eqIt = s => (Q && isFan(Q.P)) ? null : (ITEM[save.inv.w[s]] || null);
  const armorIt = () => (Q && isFan(Q.P)) ? null : (ITEM[save.inv.armor] || null);
  const petIt = () => ITEM[save.inv.pet] || null;
  const aSt = k => { const a = armorIt(); return (a && a.st[k]) || 0; };
  const petRole = () => { const p = petIt(); return p ? p.st.role : ''; };
  const pSt = k => { const p = petIt(); return (p && p.st[k]) || 0; };
  const eqHas = k => save.inv.w.some(id => ITEM[id] && ITEM[id].st[k]);
  const wd = d => d + Math.floor((baseDmg() - 1) / 2);
  const isBig = e => !!(e.isBoss || e.v === 'elite' || (e.sc || 1) > 1.2 || (e.maxhp || 0) >= 6);
  const FLY_PET = { leekpet: 1, wyrmling: 1, starwhale: 1, kitsune: 0, birdie: 1, fairy: 1, owl: 1, bat: 1, wisp: 1, bdragon: 1, ghostie: 1, pchick: 1 };
  const hexA = (h, a) => { const n = parseInt(h.substr(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  function heldSword() {
    const P = Q && Q.P; if (isFan(P)) return null;
    if (P && P.sw && save.inv.w.indexOf(P.sw.id) >= 0) return P.sw;
    for (const id of save.inv.w) if (ITEM[id] && ITEM[id].type === 'sword') return ITEM[id];
    return null;
  }
  function initGear() {
    Q.G = { shT: 0, regT: 0, petT: 0, flash: 0, slowT: 0, later: [], bolts: [], holes: [], god: null, dr: null, pet: null, hc: {}, kills: 0, half: 0, auraT: 0, rvSw: false, rvPet: false, rings: [], leekHeal: 0, torn: [], allies: [], pops: [], lyra: (Q.li === 1 && save.leek) ? { x: Q.P.x - 20, y: Q.P.y + Q.P.h, t: 0 } : null };
    if (Q.G.lyra) Q.G.later.push({ t: 8, fn: () => { Q.msg = save.lang === 'vi' ? 'Công chúa Lyra đi cùng bạn! Hãy đưa cô về lâu đài.' : 'Princess Lyra follows you! Bring her safely to the castle.'; Q.msgT = 5; } });
    Q.P.wcd = [0, 0]; Q.P.wmax = [1, 1]; Q.P.sw = null;
    if (aSt('shieldT') || petRole() === 'shield') Q.P.shield = false;
  }
  function resetGearFx() { const G = Q.G; G.allies = []; G.pops = []; G.later = []; G.bolts = []; G.holes = []; G.god = null; G.dr = null; G.gun = {}; G.slowT = 0; G.rvSw = false; G.rvPet = false; Q.P.wcd = [0, 0]; }
  function foes() { return Q.ents.filter(e => !e.dead && !e.hid && !(e.cfg && e.cfg.ai === 'blob' && e.st !== 'up')).concat(bossTargets()); }
  function nearestFoe(x, y, r, not) {
    let b = null, bd = r;
    for (const e of foes()) { if (not && not.has(e)) continue; const d = Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y); if (d < bd) { bd = d; b = e; } }
    return b;
  }
  const dmgFoe = (e, d, pierce, quiet) => (e.isBoss ? hurtBoss : hurtEnemy)(e, d, pierce, quiet);
  function later(t, fn) { Q.G.later.push({ t, fn }); }
  function zap(x1, y1, x2, y2) {
    const pts = [[x1, y1]], n = Math.max(3, Math.round(Math.hypot(x2 - x1, y2 - y1) / 10));
    for (let i = 1; i < n; i++) pts.push([lerp(x1, x2, i / n) + rr(-5, 5), lerp(y1, y2, i / n) + rr(-3, 3)]);
    pts.push([x2, y2]); Q.G.bolts.push({ pts, life: 0.22 });
    emit(x2, y2, 6, { col: ['#fff', '#ffe44e', '#9fe8ff'], sp0: 20, sp1: 80 });
  }
  function chainZap(from, d, n, range) {
    const done = new Set([from]); let cur = from;
    for (let i = 0; i < n; i++) {
      const nx = nearestFoe(cur.x + cur.w / 2, cur.y + cur.h / 2, range, done); if (!nx) break;
      done.add(nx); zap(cur.x + cur.w / 2, cur.y + cur.h / 2, nx.x + nx.w / 2, nx.y + nx.h / 2); dmgFoe(nx, d, true, true); cur = nx;
    }
  }
  function nova(x, y, r, d, heal) {
    addRing(x, y, '#ffe08a', r, 0.45); Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.25);
    emit(x, y, 24, { col: ['#fff', '#ffe08a', '#6ee7f2'], sp0: 40, sp1: 130 });
    for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + e.w / 2) { dmgFoe(e, d, true, true); if (!e.isBoss) { e.vx = (e.x + e.w / 2 < x ? -1 : 1) * 150; if (!e.fly) e.vy = -110; } }
  }
  const aimVec = sp => { const f = Q.P.face, dy = act.up ? -0.55 : (act.down ? 0.4 : 0), m = Math.hypot(1, dy); return [f * sp / m, dy * sp / m]; };
  let sumCtx = false;   // true while summons deal damage (bosses take less from them)
  function shootG(o) { Q.fps.push(Object.assign({ t: 'g', vx: 0, vy: 0, g: 0, life: 1.2, dmg: 1, hit: new Set(), shape: 'bolt', col: '#fff', sz: 2, f: 1, age: 0, arm: 0, sum: sumCtx, own: Q.P }, o)); }
  function gStep(p, dt) {
    p.age += dt;
    if (p.life <= 0) { if (p.expl) explode(p.x, p.y, p.expl, p.dmg, p.soft); p.dead = true; return; }
    if (p.boom && !p.back && p.life < p.boom) { p.back = true; p.hit.clear(); }
    if (p.back) { const P = Q.P, dx = P.x + 4 - p.x, dy = P.y + 6 - p.y, d = Math.hypot(dx, dy) || 1; p.vx += dx / d * 900 * dt; p.vy += dy / d * 900 * dt; const s = Math.hypot(p.vx, p.vy); if (s > 230) { p.vx *= 230 / s; p.vy *= 230 / s; } if (d < 9) { p.dead = true; return; } }
    if (p.home) { const t = nearestFoe(p.x, p.y, 130); if (t) { const dx = t.x + t.w / 2 - p.x, dy = t.y + t.h / 2 - p.y, d = Math.hypot(dx, dy) || 1, sp = Math.max(110, Math.hypot(p.vx, p.vy)), k = Math.min(1, 7 * dt); p.vx += (dx / d * sp - p.vx) * k; p.vy += (dy / d * sp - p.vy) * k; } }
    p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot = (p.rot || 0) + dt * (p.spin || 0);
    if (p.trail && Math.random() < 0.7) emit(p.x, p.y, 1, { col: p.trail, sp0: 3, sp1: 14, grav: -8, l0: 0.15, l1: 0.35 });
    if (!p.boom && !p.thru && p.age > p.arm && solid(Math.floor(p.x / TS), Math.floor(p.y / TS))) { if (p.expl) explode(p.x, p.y, p.expl, p.dmg, p.soft); else emit(p.x, p.y, 4, { col: p.col, sp0: 10, sp1: 40 }); p.dead = true; return; }
    const box = { x: p.x - p.sz - 1, y: p.y - p.sz - 1, w: p.sz * 2 + 2, h: p.sz * 2 + 2 };
    for (const e of foes()) {
      if (p.hit.has(e) || !ov(box, e)) continue;
      p.hit.add(e);
      if (!p.expl) { const sc0 = sumCtx; sumCtx = !!p.sum; dmgFoe(e, p.dmg, !!p.pierce, !!p.quiet); sumCtx = sc0; if (!e.isBoss) { if (p.stun) e.stunT = Math.max(e.stunT || 0, p.stun); if (p.flat) { e.flatT = 1.6; e.stunT = Math.max(e.stunT || 0, 1.6); } } if (p.slowE) e.slowT = Math.max(e.slowT || 0, p.slowE); if (!p.sum && !p.skill) chargeHit(p.own); }
      if (p.burn) e.burnT = Math.max(e.burnT || 0, p.burn);
      if (p.hole) Q.G.holes.push({ x: p.x, y: p.y, life: 1.8, r: 58, tick: 0.2 });
      if (p.slow) e.slowT = Math.max(e.slowT || 0, p.slow);
      if (p.poison) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }
      if (p.stun) { e.stunT = Math.max(e.stunT || 0, e.isBoss ? p.stun * 0.35 : p.stun); emit(e.x + e.w / 2, e.y - 2, 6, { col: ['#ffd34e', '#fff'], sp0: 10, sp1: 40 }); }
      if (!p.quiet) Snd.play('hit');
      if (p.bounces > 0) { p.bounces--; const nx = nearestFoe(p.x, p.y, 220, p.hit); if (nx) { const dx = nx.x + nx.w / 2 - p.x, dy = nx.y + nx.h / 2 - p.y, d = Math.hypot(dx, dy) || 1; p.vx = dx / d * 320; p.vy = dy / d * 320; p.life = Math.max(p.life, 1); p.boom = 0; addRing(p.x, p.y, '#ffd34e', 20, 0.25); continue; } }
      if (p.expl) { explode(p.x, p.y, p.expl, p.dmg, p.soft); p.dead = true; return; }
      if (p.pierceN !== undefined) { p.pierceN--; if (p.pierceN < 0) { p.dead = true; return; } } else if (!p.thru && !p.boom) { p.dead = true; return; }
    }
  }
  // ---- melee ----
  function doSwing(it) {
    const P = Q.P, st = it.st, f = P.face;
    if (wetP(P) && !P.onGround) { P.vx += f * 70; if (act.up) P.vy = Math.min(P.vy, -90); emit(P.x + 4, P.y + 7, 6, { col: ['#bfeaff', '#fff'], sp0: 10, sp1: 40, vx: -f * 40, grav: -40 }); }
    P.sw = it; P.atk = 0.2; P.atkCd = 0.27 * (st.cd || 1); P.atkHit = new Set(); P.atkDown = !P.onGround && act.down;
    Snd.play('slash'); if (Math.random() < 0.6) Snd.hero('attack');
    if (hasRelic(5) && !P.atkDown) { Snd.play('flame'); Q.fps.push({ t: 'wave', x: P.x + 4 + f * 10, y: P.y + 7, vx: f * 150, vy: 0, g: 0, life: 0.55, hit: new Set() }); }
    if (st.beam3 && !P.atkDown) { Snd.play('whoosh'); for (const an of [-0.16, 0, 0.16]) shootG({ x: P.x + 4 + f * 10, y: P.y + 6, vx: f * Math.cos(an) * 250, vy: Math.sin(an) * 250, life: 0.85, dmg: Math.max(1, Math.round((baseDmg() + st.dmg) * 0.3)), thru: true, pierceN: 1, shape: 'beam', col: '#a4ffc0', sz: 3, f, quiet: true }); }
    if (st.beam && !P.atkDown) { Snd.play('whoosh'); shootG({ x: P.x + 4 + f * 10, y: P.y + 6, vx: f * 270, vy: 0, life: 0.55, dmg: Math.max(2, Math.round((baseDmg() + st.dmg) * 0.6)), thru: true, pierceN: st.beam, shape: 'beam', col: it.id === 'sun' ? '#ffe08a' : '#fff6c0', sz: 3, f, quiet: true }); }
  }
  function swordHitFx(e, st, id, dealt) {
    const P = Q.P, G = Q.G, f = P.face, n = G.hc[id] = (G.hc[id] || 0) + 1;
    if (st.leek) leekPower(e);
    if (st.slow) e.slowT = Math.max(e.slowT || 0, st.slow);
    if (st.burn) e.burnT = Math.max(e.burnT || 0, st.burn);
    if (st.poison) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }
    if (st.chain) chainZap(e, Math.max(1, Math.round(dealt * 0.6)), st.chain, 72);
    if (st.wind && n % st.wind === 0) { Snd.play('whoosh'); shootG({ x: P.x + 4 + f * 8, y: P.y + 6, vx: f * 240, vy: 0, life: 0.7, dmg: Math.max(2, Math.round(dealt)), thru: true, pierceN: 3, shape: 'wind', col: '#dff6ff', sz: 5, f, quiet: true }); }
    if (st.ls && n % st.ls === 0 && P.hp < maxHP()) { P.hp++; Snd.play('heart'); emit(P.x + 4, P.y + 4, 8, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); }
    if (st.nova && n % st.nova === 0) nova(P.x + 4 + f * 14, P.y + 7, 52, Math.max(2, Math.round(dealt * 0.8)));
  }
  // Princess Lyra's leek blade: heal (5s), stun (3s) and a tornado that finishes anything under 20% health
  function leekPower(e) {
    const G = Q.G, P = Q.P, mx = e.isBoss ? e.max : e.maxhp;
    if (G.leekHeal <= 0 && P.hp < maxHP()) { P.hp++; G.leekHeal = 9; Snd.play('heart'); emit(P.x + 4, P.y + 4, 10, { col: ['#a4ffc0', '#e0453a', '#fff'], sp0: 10, sp1: 55 }); }
    if (e.dead) return;
    if (mx && e.hp > 0 && e.hp / mx <= (e.isBoss ? 0.08 : 0.15)) {
      e.stunT = Math.max(e.stunT || 0, 2); e.stunCd = 30;
      G.torn.push({ x: e.x + e.w / 2, y: e.y + e.h, h: Math.max(64, e.h + 44), life: 1.7, t: 0, e, exec: 0.7 }); Snd.play('whoosh'); Snd.play('whoosh'); Q.shake = Math.max(Q.shake, 0.3);
    } else if ((e.stunCd || 0) <= 0) {
      e.stunT = e.isBoss ? 1.5 : 2.5; e.stunCd = e.isBoss ? 20 : 9; Snd.play('zap'); emit(e.x + e.w / 2, e.y, 8, { col: ['#ffd34e', '#fff'], sp0: 20, sp1: 60 });
    }
  }
  function onKill(e) {
    const G = Q.G, N = aSt('killHeal');
    if (N) { G.kills++; if (G.kills % N === 0 && Q.P.hp < maxHP()) { Q.P.hp++; Snd.play('heart'); emit(Q.P.x + 4, Q.P.y + 4, 8, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 50 }); } }
    if (curHit && curHit.voidk) G.holes.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, life: 1.6, r: 56, tick: 0.2 });
  }
  let curHit = null;
  // ---- special weapons ----
  // T: weapon 1 <-> weapon 2
  function swapWeapon(P) {
    if (isFan(P)) { if (isMe(P)) { Q.msg = sv('This hero fights with their own moves.', 'Nhân vật này đánh bằng chiêu riêng.'); Q.msgT = 1.5; } return; }
    const n = P.ws ? 0 : 1, it = eqIt(n);
    if (!it) { if (isMe(P)) { Q.msg = sv('Nothing in weapon slot ' + (n + 1) + ' (equip one with B).', 'Ô vũ khí ' + (n + 1) + ' đang trống (bấm B để trang bị).'); Q.msgT = 2; Snd.play('select'); } return; }
    P.ws = n; P.hold = it.type === 'sword' ? null : it.id; if (it.type === 'sword') P.sw = it; P.atk = 0;
    Snd.play('select'); Snd.play('clang'); emit(P.x + 4 + P.face * 6, P.y + 6, 8, { col: [RARITY_COL[it.rar] || '#fff', '#ffffff'], sp0: 10, sp1: 50 });
    if (isMe(P)) pop(P.x + 4, P.y - 18, '[' + (n + 1) + '] ' + LN(it.name), RARITY_COL[it.rar] || '#ffd34e');
  }
  function useSlot(s) {
    const P = Q.P, it = eqIt(s); if (!it) return;
    if (it.type === 'sword') P.hold = null; else if (it.type === 'gun' || it.type === 'wpn') P.hold = it.id;
    if (it.type === 'sword') { if (P.atkCd <= 0) doSwing(it); }
    else if (it.type === 'wpn' && P.wcd[s] <= 0) fireWeapon(it, s);
    else if (it.type === 'gun' && P.wcd[s] <= 0) fireGun(it, s);
  }
  function fireWeapon(it, s) {
    const P = Q.P, G = Q.G, f = P.face, x = P.x + 4 + f * 6, y = P.y + 6, id = it.id, v = aimVec;
    P.wcd[s] = P.wmax[s] = it.st.cd; Snd.hero('attack'); P.atkCd = Math.max(P.atkCd, 0.12);
    emit(x + f * 4, y, 6, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 60 });
    const mk = (o, k) => shootG(Object.assign({ x, y, f }, o));
    if (fireDivine(id, f, x, y)) { }
    else if (id === 'bow') { Snd.play('throw'); const a = v(300); mk({ vx: a[0], vy: a[1], life: 1.1, dmg: wd(2), shape: 'arrow', col: '#e8dfc0', sz: 2 }); }
    else if (id === 'boomerang') { Snd.play('whoosh'); mk({ vx: f * 190, vy: 0, life: 2.2, boom: 1.1, dmg: wd(2), shape: 'boom', spin: 14, sz: 4, thru: true, col: '#c8844a' }); }
    else if (id === 'firewand') { Snd.play('flame'); const a = v(175); mk({ vx: a[0], vy: a[1], life: 1.4, dmg: wd(3), burn: 3, shape: 'fire', trail: '#ffd34e', sz: 3, col: '#ff7a2a' }); }
    else if (id === 'icewand') { Snd.play('zap'); const a = v(190); mk({ vx: a[0], vy: a[1], life: 1.4, dmg: wd(2), slow: 3, shape: 'ice', trail: '#bff3ff', sz: 3, col: '#8fe0f8' }); }
    else if (id === 'crossbow') { for (let i = 0; i < 3; i++) later(i * 0.11, () => { Snd.play('throw'); const a = v(330); shootG({ x: Q.P.x + 4 + f * 6, y: Q.P.y + 6, f, vx: a[0], vy: a[1], life: 1, dmg: wd(3), shape: 'arrow', col: '#cfd6e6', sz: 2 }); }); }
    else if (id === 'shuriken') { Snd.play('whoosh'); for (let i = 0; i < 5; i++) { const an = -0.5 + i * 0.25; mk({ vx: f * Math.cos(an) * 215, vy: Math.sin(an) * 215, life: 0.9, dmg: wd(2), shape: 'star', spin: 20, pierceN: 1, sz: 3, col: '#cfd6e6' }); } }
    else if (id === 'rod') {
      const t = nearestFoe(P.x + 4, P.y + 6, 180); Snd.play('thunder'); G.flash = 0.18;
      if (t) { const cx = t.x + t.w / 2; zap(cx, Q.cam.y - 6, cx, t.y + t.h / 2); dmgFoe(t, wd(6), true); chainZap(t, wd(5), 3, 80); }
      else { const cx = P.x + 4 + f * 56; zap(cx, Q.cam.y - 6, cx, P.y + 12); P.wcd[s] = 0.8; }
    }
    else if (id === 'launcher') { Snd.play('throw'); for (let i = 0; i < 2; i++) Q.fps.push({ t: 'bomb', x, y: P.y + 3, vx: f * (95 + i * 50) + P.vx * 0.3, vy: -130 + i * 12, g: 520, life: 1.3, f }); }
    else if (id === 'meteor') {
      Snd.play('thunder'); G.flash = 0.12;
      for (let i = 0; i < 6; i++) later(i * 0.22, () => { const mx = Q.P.x + f * (34 + i * 26) + rr(-8, 8); shootG({ x: mx - f * 34, y: Math.max(12, Q.P.y - 110), f, vx: f * 34, vy: 250, life: 2.4, dmg: wd(5), expl: 30, burn: 3, shape: 'meteor', trail: '#ffd34e', sz: 4, col: '#ff7a2a', arm: 0.35 }); });
    }
    else if (id === 'cross') {
      Snd.play('relic'); P.hp = Math.min(maxHP(), P.hp + 2); emit(P.x + 4, P.y + 4, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 });
      nova(P.x + 4, P.y + 7, 74, wd(4)); G.flash = 0.12;
    }
    else if (id === 'orb') { Snd.play('zap'); G.holes.push({ x: P.x + 4 + f * 62, y: P.y + 4, life: 4, r: 84, tick: 0.2 }); }
    else if (id === 'stormbow') {
      for (let k = 0; k < 3; k++) later(k * 0.16, () => {
        Snd.play('throw');
        for (let i = 0; i < 12; i++) { const an = -0.75 + 1.5 * i / 11 + rr(-0.04, 0.04), sp = 300 + rr(-30, 40); shootG({ x: Q.P.x + 4 + f * 6, y: Q.P.y + 5, f, vx: f * Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 0.95, dmg: wd(2), shape: 'arrow', col: '#6ee7f2', pierceN: 1, sz: 2, quiet: true, trail: k === 0 && i % 3 === 0 ? '#bff3ff' : null }); }
      });
    }
    else if (id === 'hourglass') { Snd.play('whoosh'); G.slowT = 6; addRing(P.x + 4, P.y + 7, '#ffd34e', 140, 0.8); G.flash = 0.1; }
    else if (id === 'thundergod') { Snd.play('thunder'); G.flash = 0.35; G.god = { x: P.x + 4 + f * 34, y: P.y - 34, f, life: 12, t: 0, strike: 0.5 }; zap(P.x + 4, Q.cam.y - 6, P.x + 4 + f * 30, P.y - 22); Q.shake = Math.max(Q.shake, 0.4); Q.msg = save.lang === 'vi' ? 'THẦN SẤM GIÁNG THẾ!' : 'THE THUNDER GOD DESCENDS!'; Q.msgT = 3; }
    else if (id === 'slingshot') { Snd.play('throw'); const a = v(290); mk({ vx: a[0], vy: a[1], life: 0.9, dmg: wd(1) + 1, shape: 'bolt', col: '#cfd6e6', sz: 2 }); }
    else if (id === 'knives') { Snd.play('whoosh'); for (const an of [-0.18, 0, 0.18]) mk({ vx: f * Math.cos(an) * 300, vy: Math.sin(an) * 300, life: 0.8, dmg: wd(2), shape: 'arrow', col: '#e8e8f0', sz: 2 }); }
    else if (id === 'dart') { Snd.play('throw'); const a = v(320); mk({ vx: a[0], vy: a[1], life: 1, dmg: wd(2), poison: 1, shape: 'arrow', col: '#7ed957', sz: 2 }); }
    else if (id === 'cannon') { Snd.play('explode'); mk({ vx: f * 210, vy: -90, g: 300, life: 1.6, dmg: wd(6), expl: 40, shape: 'meteor', col: '#8d9bbd', sz: 4, trail: '#cfd6e6' }); P.vx -= f * 40; Q.shake = Math.max(Q.shake, 0.3); }
    else if (id === 'chainlight') { const t = nearestFoe(P.x + 4, P.y + 6, 230); Snd.play('thunder'); G.flash = 0.12; if (t) { zap(P.x + 4, P.y + 4, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, wd(5), true); chainZap(t, wd(4), 4, 90); } else { P.wcd[s] = 0.8; zap(P.x + 4, P.y + 4, P.x + 4 + f * 80, P.y + 4); } }
    else if (id === 'laser') { Snd.play('flame'); for (let k = 0; k < 9; k++) later(k * 0.09, () => shootG({ x: Q.P.x + 4 + f * 8, y: Q.P.y + 6, f, vx: f * 420, vy: 0, life: 0.55, dmg: wd(3), thru: true, pierceN: 99, shape: 'beam', col: '#ff3a5a', sz: 3, quiet: true })); }
    else if (id === 'windstaff') { Snd.play('whoosh'); G.holes.push({ x: P.x + 4 + f * 70, y: P.y + 4, life: 3.5, r: 80, tick: 0.2, wind: true }); }
    else if (id === 'iceage') { Snd.play('zap'); G.flash = 0.2; addRing(P.x + 4, P.y + 7, '#bff3ff', 200, 0.8); for (const e of foes()) { e.slowT = Math.max(e.slowT || 0, 5); dmgFoe(e, wd(3), true, true); emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#8fe0f8'], sp0: 20, sp1: 80 }); } }
    else if (id === 'solarflare') { Snd.play('explode'); G.flash = 0.4; nova(P.x + 4, P.y + 7, 120, wd(8)); for (const e of foes()) if (Math.hypot(e.x - P.x, e.y - P.y) < 130) e.burnT = Math.max(e.burnT || 0, 4); }
    else if (id === 'starfall') { Snd.play('thunder'); G.flash = 0.2; for (let i = 0; i < 14; i++) later(i * 0.12, () => { const mx = Q.cam.x + rr(20, VW - 20); shootG({ x: mx - 20, y: Math.max(8, Q.cam.y - 6), f, vx: 30, vy: 260, life: 2.4, dmg: wd(4), expl: 28, burn: 2, shape: 'meteor', trail: '#ffe44e', sz: 4, col: '#ffe44e', arm: 0.3 }); }); }
    else if (id === 'dragonhorn') { Snd.creature('dragon', 'alert', true); G.dr = { f, life: 5, t: 0, fire: 0, x: 0, y: 0 }; Q.shake = Math.max(Q.shake, 0.4); Q.msg = save.lang === 'vi' ? 'RỒNG LỬA ĐƯỢC TRIỆU HỒI!' : 'THE DRAGON ANSWERS THE HORN!'; Q.msgT = 3; }
  }
  // ---- per-frame gear update ----
  function updateGear(dt) {
    const P = Q.P, G = Q.G;
    for (let i = 0; i < 2; i++) if (P.wcd[i] > 0) P.wcd[i] -= dt;
    if (G.flash > 0) G.flash -= dt;
    if (G.slowT > 0) G.slowT -= dt;
    if (G.leekHeal > 0) G.leekHeal -= dt;
    for (const t of G.torn) {
      t.life -= dt; t.t += dt;
      if (t.e) {
        const e = t.e;
        if (e.dead) t.e = null;
        else {
          e.stunT = Math.max(e.stunT || 0, 0.3);
          if (!e.isBoss) { e.x += (t.x - e.w / 2 - e.x) * Math.min(1, 8 * dt); e.y -= 46 * dt; e.vy = 0; e.vx = 0; }
          t.exec -= dt;
          if (Math.random() < 0.5) emit(t.x + rr(-14, 14), t.y - rr(0, t.h), 1, { col: ['#a4ffc0', '#4fc84f', '#fff'], sp0: 10, sp1: 40, grav: -20, l0: 0.2, l1: 0.5 });
          if (t.exec <= 0) {
            Snd.play('thunder'); Q.shake = Math.max(Q.shake, 0.35); emit(e.x + e.w / 2, e.y + e.h / 2, 28, { col: ['#a4ffc0', '#4fc84f', '#fff', '#e8f5d0'], sp0: 40, sp1: 150 });
            if (e.isBoss) hurtBoss(e, (e.hp + 1) * 12, true, true); else hurtEnemy(e, e.hp + 99, true);
            t.e = null;
          }
        }
      }
    }
    G.torn = G.torn.filter(t => t.life > 0);
    for (const l of G.later) { l.t -= dt; if (l.t <= 0) { l.dead = true; l.fn(); } }
    G.later = G.later.filter(l => !l.dead);
    for (const b of G.bolts) b.life -= dt;
    G.bolts = G.bolts.filter(b => b.life > 0);
    // auto shield (armor / slime pet)
    const sT = aSt('shieldT') || (petRole() === 'shield' ? petIt().st.t : 0);
    if (sT && !P.shield) { G.shT += dt; if (G.shT >= sT) { G.shT = 0; P.shield = true; Snd.play('select'); emit(P.x + 4, P.y + 7, 10, { col: ['#6ee7f2', '#fff'], sp0: 20, sp1: 60 }); } } else if (!sT || P.shield) G.shT = 0;
    if (G.stunArm > 0) G.stunArm -= dt;
    // regeneration (armor / fairy / unicorn)
    const rT = aSt('regen') || (petRole() === 'heal' ? petIt().st.t : 0) || (petRole() === 'rainbow' ? 25 : 0);
    if (rT && P.hp < maxHP() && P.hp > 0) { G.regT += dt; if (G.regT >= rT) { G.regT = 0; P.hp++; Snd.play('heart'); emit(P.x + 4, P.y + 4, 10, { col: ['#a4e86b', '#fff', '#ff7fb0'], sp0: 10, sp1: 50 }); } } else G.regT = 0;
    if (aSt('slowImm')) P.slow = 0;
    // sun aura
    if (eqHas('aura')) { G.auraT += dt; if (G.auraT >= 0.5) { G.auraT = 0; for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - (P.x + 4), e.y + e.h / 2 - (P.y + 7)) < 36) { dmgFoe(e, 1, true, true); e.burnT = Math.max(e.burnT || 0, 1.5); } } if (Math.random() < 0.3) emit(P.x + 4 + rr(-16, 16), P.y + 7 + rr(-12, 12), 1, { col: ['#ffe08a', '#fff'], sp0: 2, sp1: 10, grav: -10, l0: 0.3, l1: 0.6 }); }
    // black holes
    for (const h of G.holes) {
      h.life -= dt; h.tick -= dt;
      for (const e of foes()) {
        const dx = h.x - (e.x + e.w / 2), dy = h.y - (e.y + e.h / 2), d = Math.hypot(dx, dy);
        if (d < h.r && d > 3 && !e.isBoss) { const k = 75 * dt / d; e.x += dx * k; if (e.fly) e.y += dy * k; }
      }
      if (h.tick <= 0) { h.tick = 0.4; for (const e of foes()) if (Math.hypot(h.x - (e.x + e.w / 2), h.y - (e.y + e.h / 2)) < h.r * 0.65) dmgFoe(e, 1 + Math.floor(baseDmg() / 3), true, true); }
      if (Math.random() < 0.8) { const a = Math.random() * 6.28, rd = h.r * rr(0.5, 1); emit(h.x + Math.cos(a) * rd, h.y + Math.sin(a) * rd * 0.6, 1, { col: ['#a15be0', '#d58bff', '#fff'], sp0: 0, sp1: 4, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 40, grav: 0, l0: 0.2, l1: 0.35 }); }
    }
    G.holes = G.holes.filter(h => h.life > 0);
    // Thunder God ally
    if (G.god) {
      const gd = G.god; gd.life -= dt; gd.t += dt;
      const tx = P.x + 4 + P.face * 34, ty = P.y - 34 + Math.sin(gd.t * 2.5) * 3, k = 1 - Math.exp(-4 * dt);
      gd.x += (tx - gd.x) * k; gd.y += (ty - gd.y) * k; gd.f = P.face;
      gd.strike -= dt;
      if (gd.strike <= 0) {
        gd.strike = 0.7; const t = nearestFoe(gd.x, gd.y, 230);
        if (t) { const cx = t.x + t.w / 2; Snd.play('thunder'); G.flash = Math.max(G.flash, 0.1); zap(gd.x + gd.f * 8, gd.y, cx, t.y + t.h / 2); zap(cx, Q.cam.y - 6, cx, t.y + t.h / 2); dmgFoe(t, wd(5), true); chainZap(t, wd(3), 2, 70); Q.shake = Math.max(Q.shake, 0.15); }
      }
      if (gd.life <= 0) { emit(gd.x, gd.y, 24, { col: ['#fff', '#ffe44e', '#9fe8ff'], sp0: 30, sp1: 120 }); G.god = null; }
    }
    // spectral dragon ally
    if (G.dr) {
      const d = G.dr; d.life -= dt; d.t += dt;
      const k = d.t / 5; d.x = Q.cam.x + (d.f > 0 ? -70 + k * (VW + 140) : VW + 70 - k * (VW + 140)); d.y = Q.cam.y + 62 + Math.sin(d.t * 3) * 6;
      d.fire -= dt;
      if (d.fire <= 0) { d.fire = 0.085; shootG({ x: d.x + d.f * 30, y: d.y + 12, f: d.f, vx: d.f * (110 + rr(0, 50)), vy: 70 + rr(-20, 45), g: 220, life: 1.6, dmg: wd(3), burn: 3, shape: 'fire', trail: '#ffd34e', sz: 3, col: '#ff7a2a', pierceN: 2, quiet: true }); }
      if (Math.random() < 0.15) Snd.play('breath');
      if (d.life <= 0) G.dr = null;
    }
    if (G.lyra) { const ly = G.lyra, tx = P.x + 4 - P.face * 26, k = 1 - Math.exp(-5 * dt); ly.t += dt; ly.x += (tx - ly.x) * k; ly.y += (P.y + P.h - ly.y) * (1 - Math.exp(-12 * dt)); if (Math.hypot(tx - ly.x, P.y - ly.y) > 190) { ly.x = tx; ly.y = P.y + P.h; } if (Math.random() < 0.03) emit(ly.x + rr(-6, 6), ly.y - 22, 1, { col: ['#a4ffc0', '#6ee7f2', '#fff'], sp0: 3, sp1: 10, grav: -14, l0: 0.5, l1: 0.9 }); }
    updateAllies(dt); updateBossDrops(dt); updateSummons(dt); updateGuns(dt);
    if (G.powerT > 0) G.powerT -= dt;
    for (const p of G.pops) p.t -= dt; G.pops = G.pops.filter(p => p.t > 0);
    updatePet(dt);
  }
  function updatePet(dt) {
    const it = petIt(), G = Q.G, P = Q.P;
    if (!it) { G.pet = null; return; }
    let pt = G.pet;
    if (!pt || pt.id !== it.id) pt = G.pet = { id: it.id, x: P.x - 10, y: P.y + P.h, f: 1, cd: 1, t: 0, lunge: 0, tdir: 0 };
    pt.t += dt; if (pt.lunge > 0) pt.lunge -= dt;
    const rideOn = it.st.role === 'ride' && !P.onGround && !wetP(P) && P.hp > 0, fly = FLY_PET[it.id], tx = rideOn ? P.x + 4 : P.x + 4 - P.face * 15, ty = rideOn ? P.y + P.h + 4 : (fly ? P.y - 2 + Math.sin(pt.t * 4) * 3 : P.y + P.h), k = 1 - Math.exp(-(rideOn ? 24 : 7) * dt);
    if (rideOn) {
      if (act.jump && P.vy > 35) P.vy = 35;
      G.rideT = (G.rideT || 0) + dt; if (G.rideT >= 6 && P.hp < maxHP()) { G.rideT = 0; P.hp++; Snd.play('heart'); emit(P.x + 4, P.y + 4, 10, { col: ['#a4ffc0', '#fff', '#ff7fb0'], sp0: 10, sp1: 50 }); }
      if (Math.random() < 0.4) emit(pt.x - pt.f * 6, pt.y, 1, { col: ['#a4ffc0', '#fff'], sp0: 4, sp1: 14, grav: 20, l0: 0.3, l1: 0.6 });
    }
    if (Math.hypot(tx - pt.x, ty - pt.y) > 170) { pt.x = tx; pt.y = ty; }
    pt.x += (tx - pt.x) * k; pt.y += (ty - pt.y) * (fly ? k : 1 - Math.exp(-14 * dt)); pt.f = pt.tdir || P.face;
    pt.tdir = pt.lunge > 0 ? pt.tdir : 0;
    const role = it.st.role; pt.cd -= dt;
    if (pt.cd > 0) return;
    const px = pt.x, py = pt.y - 7;
    if (role === 'bite') { const t = nearestFoe(px, py, 38); if (t) { dmgFoe(t, 1 + Math.floor(baseDmg() / 4), false, true); pt.cd = 1.2; pt.lunge = 0.18; pt.tdir = t.x + t.w / 2 < px ? -1 : 1; emit(t.x + t.w / 2, t.y + t.h / 2, 5, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 60 }); Snd.play('hit'); } else pt.cd = 0.25; }
    else if (role === 'drain') { const t = nearestFoe(px, py, 110); if (t) { dmgFoe(t, 2, true, true); pt.cd = 8; pt.lunge = 0.3; pt.tdir = t.x + t.w / 2 < px ? -1 : 1; G.half += 0.5; emit(t.x + t.w / 2, t.y + t.h / 2, 8, { col: ['#a15be0', '#e0453a'], sp0: 20, sp1: 70 }); if (G.half >= 1 && P.hp < maxHP()) { G.half = 0; P.hp++; Snd.play('heart'); } } else pt.cd = 0.4; }
    else if (role === 'spark') { const t = nearestFoe(px, py, 160); if (t) { pt.cd = 0.9; shootG({ x: px, y: py - 4, vx: (t.x + t.w / 2 < px ? -1 : 1) * 120, vy: -30, home: true, life: 1.4, dmg: 1 + Math.floor(baseDmg() / 4), sz: 2, col: '#ffd34e', shape: 'spark', quiet: true, trail: '#ffd34e', thru: false }); } else pt.cd = 0.3; }
    else if (role === 'fire') { const t = nearestFoe(px, py, 170); if (t) { pt.cd = 1.8; Snd.play('flame'); const dx = t.x + t.w / 2 - px, dy = t.y + t.h / 2 - py, d = Math.hypot(dx, dy) || 1; pt.tdir = dx < 0 ? -1 : 1; pt.lunge = 0.25; shootG({ x: px + pt.tdir * 8, y: py, vx: dx / d * 160, vy: dy / d * 160, life: 1.3, dmg: 3 + Math.floor(baseDmg() / 3), burn: 2, sz: 3, col: '#ff7a2a', shape: 'fire', trail: '#ffd34e' }); } else pt.cd = 0.3; }
    else if (role === 'ice') { const t = nearestFoe(px, py, 170); if (t) { pt.cd = 2.2; Snd.play('zap'); shootG({ x: px, y: py - 4, vx: (t.x + t.w / 2 < px ? -1 : 1) * 130, vy: -10, home: true, life: 1.6, dmg: 1 + Math.floor(baseDmg() / 4), slow: 3, shape: 'ice', col: '#8fe0f8', trail: '#bff3ff', sz: 3, quiet: true }); } else pt.cd = 0.3; }
    else if (role === 'thunder') { const t = nearestFoe(px, py, 210); if (t) { pt.cd = 5; Snd.play('thunder'); zap(px, py - 6, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, 4 + Math.floor(baseDmg() / 2), true); chainZap(t, 3, 2, 60); } else pt.cd = 0.4; }
    else if (role === 'block') { let hit = null; for (const p of Q.projs) if (!p.dead && Math.hypot(p.x - (P.x + 4), p.y - (P.y + 7)) < 95) { hit = p; break; } if (hit) { hit.dead = true; pt.cd = 4; Snd.play('clang'); emit(hit.x, hit.y, 10, { col: ['#fff', '#cfd6e6'], sp0: 20, sp1: 80 }); addRing(hit.x, hit.y, '#fff', 20, 0.3); } else pt.cd = 0.1; }
    else pt.cd = 1;
  }
  // ---- player damage with armor ----
  function thornsAndFx() {
    const P = Q.P, th = aSt('thorns'), fx = armorIt() && armorIt().st.thornFx;
    if (th || fx) { const t = nearestFoe(P.x + 4, P.y + 7, 46); if (t) { if (th) dmgFoe(t, th, true, true); if (fx === 'slow') t.slowT = Math.max(t.slowT || 0, 3); if (fx === 'burn') t.burnT = Math.max(t.burnT || 0, 3); emit(t.x + t.w / 2, t.y + t.h / 2, 6, { col: fx === 'burn' ? ['#ff7a2a', '#ffd34e'] : ['#fff', '#cfd6e6'], sp0: 20, sp1: 80 }); } }
    if (aSt('stunHit') && !(Q.G.stunArm > 0)) {
      Q.G.stunArm = 6; Snd.play('zap'); addRing(P.x + 4, P.y + 7, '#8af08a', 60, 0.5);
      for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - (P.x + 4), e.y + e.h / 2 - (P.y + 7)) < 64) { e.stunT = Math.max(e.stunT || 0, e.isBoss ? aSt('stunHit') * 0.4 : aSt('stunHit')); emit(e.x + e.w / 2, e.y, 8, { col: ['#a4ffc0', '#ffd34e', '#fff'], sp0: 20, sp1: 60 }); }
    }
    if (aSt('nova')) nova(P.x + 4, P.y + 7, 50, 3);
    if (aSt('shadow')) { P.inv = Math.max(P.inv, 1.2 + aSt('shadow')); emit(P.x + 4, P.y + 7, 12, { col: ['#a15be0', '#14121f'], sp0: 20, sp1: 70 }); }
  }
  function tryRevive() {
    const P = Q.P, G = Q.G;
    if (!G.rvSw && (eqHas('revive') || aSt('revive'))) { G.rvSw = true; P.hp = Math.ceil(maxHP() / 2); }
    else if (!G.rvPet && petRole() === 'revive') { G.rvPet = true; P.hp = maxHP(); }
    else return false;
    P.inv = 2.5; Snd.play('relic'); Snd.hero('cheer'); Q.shake = 0.6; G.flash = 0.3;
    emit(P.x + 4, P.y + 7, 40, { col: ['#ffd34e', '#ff7a2a', '#fff'], sp0: 40, sp1: 160 }); addRing(P.x + 4, P.y + 7, '#ff9a2a', 90, 0.6);
    nova(P.x + 4, P.y + 7, 64, 6); Q.msg = save.lang === 'vi' ? 'HỒI SINH TỪ TRO TÀN!' : 'RISEN FROM THE ASHES!'; Q.msgT = 3;
    return true;
  }
  function updateStatus(dt) {
    for (const e of Q.ents.concat(bossTargets())) {
      if (e.dead) continue;
      if (e.slowT > 0) e.slowT -= dt;
      if (e.stunT > 0) { e.stunT -= dt; if (Math.random() < 0.3) emit(e.x + e.w / 2 + rr(-6, 6), e.y - 2, 1, { col: '#ffd34e', sp0: 3, sp1: 10, grav: -5, l0: 0.3, l1: 0.5 }); }
      if (e.stunCd > 0) e.stunCd -= dt;
      if (e.burnT > 0) { e.burnT -= dt; e.burnAcc = (e.burnAcc || 0) + dt; if (Math.random() < 0.4) emit(e.x + rr(0, e.w), e.y + rr(0, e.h), 1, { col: ['#ff7a2a', '#ffd34e'], sp0: 3, sp1: 14, grav: -30, l0: 0.2, l1: 0.4 }); if (e.burnAcc >= 1) { e.burnAcc = 0; dmgFoe(e, 1, true, true); } }
      if (e.poisonT > 0) { e.poisonT -= dt; e.poisonAcc = (e.poisonAcc || 0) + dt; if (Math.random() < 0.3) emit(e.x + rr(0, e.w), e.y + rr(0, e.h), 1, { col: ['#7ed957', '#d8ff9a'], sp0: 3, sp1: 12, grav: -10, l0: 0.2, l1: 0.4 }); if (e.poisonAcc >= 1) { e.poisonAcc = 0; dmgFoe(e, 0.6 * (e.poisonN || 1), true, true); } if (e.poisonT <= 0) e.poisonN = 0; }
    }
  }
  // ---- rendering ----
  function drawGearFx(camX, camY) {
    const G = Q.G, P = Q.P;
    for (const h of G.holes) {
      const x = Math.round(h.x - camX), y = Math.round(h.y - camY), a = Math.min(1, h.life);
      g.globalAlpha = 0.4 * a; disc(g, x, y, Math.round(h.r * 0.35), h.wind ? '#1a5a5a' : '#2a1a4a'); g.globalAlpha = 0.85 * a; disc(g, x, y, Math.round(h.r * 0.18), h.wind ? '#0e3a3a' : '#14101e'); disc(g, x, y, 3, h.wind ? '#052a2a' : '#000'); g.globalAlpha = 1;
      for (let i = 0; i < 14; i++) { const an = Q.t * 6 + i * 0.45, rd = 8 + i * (h.r / 18); g.fillStyle = h.wind ? (i % 2 ? '#6ee7b0' : '#e8fff4') : (i % 2 ? '#a15be0' : '#d58bff'); g.fillRect(Math.round(x + Math.cos(an) * rd), Math.round(y + Math.sin(an) * rd * 0.5), 2, 2); }
    }
    if (G.lyra) { const ly = G.lyra, hop = Math.abs(P.vx) > 20 ? -Math.abs(Math.sin(ly.t * 12)) * 2 : Math.sin(ly.t * 3) * 0.6; drawSpr(g, npcSpr('npc_lyra_leek'), Math.round(ly.x - camX), Math.round(ly.y - camY + hop), ly.x > P.x + 4); }
    drawAllies(camX, camY);
    const pt = G.pet;
    if (pt && !(G.petForm > 0)) { const sp = petSprite(pt.id), fly = FLY_PET[pt.id], hop = fly ? 0 : (Math.abs(P.vx) > 20 ? -Math.abs(Math.sin(pt.t * 14)) * 2 : 0), off = pt.lunge > 0 ? pt.tdir * 5 : 0; const pvx = (pt.x - (pt.lx === undefined ? pt.x : pt.lx)) * 60; pt.lx = pt.x; const mo = G.morph, PA = animPose(fly ? 'idle' : (Math.abs(pvx) > 90 ? 'run' : Math.abs(pvx) > 8 ? 'walk' : 'idle'), pt.t, pt.f < 0 ? -1 : 1, 0);
      if (mo) { const k = mo.t / mo.dur, gw = 1 + k * 0.9 + Math.sin(mo.t * 30) * 0.08 * k; PA.sx *= gw; PA.sy *= gw; PA.rot += Math.sin(mo.t * 12) * 0.2 * k; drawAura(Math.round(pt.x - camX), Math.round(pt.y - camY - 8), 18 + k * 30, (GIANT[mo.kind] || BEAST[mo.kind]).glow, 0.4 + k * 0.4); }
      { const pit = ITEM[pt.id]; if (pit && pit.rar >= 3 && !mo) rarFx(pit.rar, pt.x - camX, pt.y - camY - 6, 5); }
      drawSprT(g, sp, Math.round(pt.x - camX + off + PA.ox), Math.round(pt.y - camY + (fly ? hop : 0) + PA.oy), pt.f < 0, !!mo && Math.floor(mo.t * (6 + mo.t * 6)) % 2 === 0, PA.sx, PA.sy, PA.rot, pt.id === 'ghostie' ? 0.75 : 1); }
    if (G.god) {
      const gd = G.god, gs = godSprite(), x = Math.round(gd.x - camX), y = Math.round(gd.y - camY), a = Math.min(1, gd.life / 0.8, gd.t / 0.4);
      g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y + 10, 0, x, y + 10, 46); gr.addColorStop(0, 'rgba(255,230,90,' + 0.4 * a + ')'); gr.addColorStop(1, 'rgba(255,230,90,0)'); g.fillStyle = gr; g.fillRect(x - 46, y - 40, 92, 100); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.92 * a; drawSpr(g, gs, x, y + 30, gd.f < 0); g.globalAlpha = 1;
    }
    if (G.dr) {
      const d = G.dr, ds = dragonSprite(1, Math.floor(Q.t * 5) % 2), x = Math.round(d.x - camX), y = Math.round(d.y - camY);
      g.globalAlpha = 0.72; g.globalCompositeOperation = 'lighter'; g.drawImage(d.f < 0 ? ds.f : ds.c, Math.round(x - ds.w / 2), Math.round(y - ds.h / 2 + 8)); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
    for (const t of G.torn) {
      const x = Math.round(t.x - camX), y = Math.round(t.y - camY), k = Math.min(1, t.life / 0.4, t.t / 0.25), lm = leekMini();
      g.globalAlpha = 0.22 * k; g.fillStyle = '#a4ffc0'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x + 24, y - t.h); g.lineTo(x - 24, y - t.h); g.fill();
      g.globalAlpha = 0.5 * k; g.strokeStyle = '#e8f5d0'; g.lineWidth = 1;
      for (let r = 0; r < 5; r++) { const u = r / 5, yy = y - u * t.h - 4, rd = 6 + u * 20; g.beginPath(); g.ellipse(x, yy, rd, rd * 0.3, 0, 0, 7); g.stroke(); }
      g.globalAlpha = 1;
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 22; i++) {
        const u = i / 22, an = t.t * 11 + i * 0.95, depth = Math.sin(an);
        if ((pass === 0) !== (depth < 0)) continue;
        const rad = 5 + u * 21, px = x + Math.cos(an) * rad, py = y - u * t.h + depth * rad * 0.3, sc = 0.85 + u * 0.55 + (pass ? 0.2 : 0);
        g.save(); g.globalAlpha = k * (pass ? 1 : 0.55); g.translate(Math.round(px), Math.round(py)); g.rotate(an + Math.PI / 2 + (Math.cos(an) > 0 ? 0 : Math.PI)); g.scale(sc, sc); g.drawImage(lm.c, -lm.w / 2, -lm.h / 2); g.restore();
      }
      g.globalAlpha = 0.45 * k; g.fillStyle = '#d9c9a0'; for (let i = 0; i < 8; i++) { const an = t.t * 6 + i * 0.8; g.fillRect(Math.round(x + Math.cos(an) * (14 + (i % 3) * 4)), y - 1 - (i % 2), 3, 2); }
      g.globalAlpha = 1;
    }
    for (const e of Q.ents) if (!e.dead && !e.hid && e.stunT > 0) { const x = Math.round(e.x + e.w / 2 - camX), y = Math.round(e.y - camY) - 5; for (let i = 0; i < 3; i++) { const an = Q.t * 6 + i * 2.1; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(an) * 6), Math.round(y + Math.sin(an) * 2), 2, 2); } }
    for (const e of Q.ents) if (!e.dead && !e.hid && (e.slowT > 0 || e.burnT > 0 || e.poisonT > 0)) {
      const x = Math.round(e.x - camX), y = Math.round(e.y - camY);
      g.globalAlpha = 0.28; g.fillStyle = e.burnT > 0 ? '#ff7a2a' : (e.poisonT > 0 ? '#7ed957' : '#8fe0f8'); g.fillRect(x, y, e.w, e.h); g.globalAlpha = 1;
      if (e.slowT > 0 && !(e.burnT > 0)) { g.fillStyle = '#fff'; g.fillRect(x + 1, y + 1, 2, 1); g.fillRect(x + e.w - 3, y + e.h - 2, 2, 1); }
    }
  }
  function drawGearTop(camX, camY) {
    const G = Q.G;
    for (const b of G.bolts) {
      const a = Math.min(1, b.life * 6);
      g.globalAlpha = a; g.strokeStyle = '#9fe8ff'; g.lineWidth = 3; g.beginPath(); b.pts.forEach((p, i) => i ? g.lineTo(p[0] - camX, p[1] - camY) : g.moveTo(p[0] - camX, p[1] - camY)); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); g.globalAlpha = 1;
    }
    for (const p of G.pops) txt(p.s, Math.round(p.x - camX), Math.round(p.y - camY - (1.3 - p.t) * 10), { al: 'center', size: 7, col: p.col, bold: true, alpha: Math.min(1, p.t * 2) });
    if (G.flash > 0 && Q.state !== 'play') G.flash -= 0.02; // keep fading during dialogue / boss intro
    if (G.flash > 0) { g.globalAlpha = Math.min(0.55, G.flash * 1.6); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    if (G.slowT > 0) { g.globalAlpha = 0.1 + 0.05 * Math.sin(Q.t * 6); g.fillStyle = '#ffd34e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
  }
  function drawGHot(p, x, y) {
    const sh = p.shape;
    if (sh === 'arrow') { const a = Math.atan2(p.vy, p.vx); g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#5a3a22'; g.fillRect(-6, -1, 8, 1); g.fillStyle = p.col; g.fillRect(2, -1, 3, 1); g.fillRect(4, -2, 2, 3); g.fillStyle = '#fff'; g.fillRect(-7, -2, 2, 1); g.fillRect(-7, 1, 2, 1); g.restore(); }
    else if (sh === 'fire') { disc(g, x, y, 4, '#e0453a'); disc(g, x, y, 3, '#ff7a2a'); disc(g, x, y, 1, '#fff6c0'); }
    else if (sh === 'ice') { g.fillStyle = '#8fe0f8'; g.fillRect(x - 4, y - 1, 8, 3); g.fillRect(x - 2, y - 3, 4, 7); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 3, 1); }
    else if (sh === 'star') { g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = '#cfd6e6'; g.fillRect(-4, -1, 8, 2); g.fillRect(-1, -4, 2, 8); g.fillStyle = '#14121f'; g.fillRect(-1, -1, 2, 2); g.restore(); }
    else if (sh === 'boom') { g.save(); g.translate(x, y); g.rotate(p.rot); g.fillStyle = '#c8844a'; g.fillRect(-5, -1, 10, 2); g.fillRect(-1, -5, 2, 6); g.fillStyle = '#ffd0a0'; g.fillRect(-5, -1, 10, 1); g.restore(); }
    else if (sh === 'beam') { const f = p.f; g.globalCompositeOperation = 'lighter'; g.fillStyle = hexA(p.col, 0.4); g.fillRect(x - 12, y - 5, 24, 10); g.globalCompositeOperation = 'source-over'; g.fillStyle = p.col; g.fillRect(x - 11 + (f > 0 ? 0 : 2), y - 2, 20, 4); g.fillStyle = '#fff'; g.fillRect(x - 10 + (f > 0 ? 2 : 0), y - 1, 16, 1); }
    else if (sh === 'wind') { g.fillStyle = 'rgba(223,246,255,.75)'; const f = p.f; for (let i = 0; i < 5; i++) g.fillRect(x - f * i * 2 - 2, y - 6 + i * 3 - (i > 2 ? 3 : 0), 5 - (i % 2), 1 + (i === 2 ? 1 : 0)); }
    else if (sh === 'meteor') { disc(g, x, y, 5, '#6a3a2a'); disc(g, x, y, 4, '#ff7a2a'); disc(g, x, y, 2, '#ffd34e'); }
    else if (sh === 'orb') { disc(g, x, y, 4, hexA(p.col, 0.5)); disc(g, x, y, 3, p.col); disc(g, x, y, 1, '#fff'); }
    else if (sh === 'bat') { g.fillStyle = p.col; g.fillRect(x - 1, y - 1, 3, 3); const fl = Math.floor(Q.t * 18) % 2; g.fillRect(x - 4, y - 2 + fl * 2, 3, 1); g.fillRect(x + 2, y - 2 + fl * 2, 3, 1); g.fillStyle = '#e0453a'; g.fillRect(x, y, 1, 1); }
    else if (sh === 'bullet') { const a = Math.atan2(p.vy, p.vx); g.save(); g.translate(x, y); g.rotate(a); g.globalCompositeOperation = 'lighter'; g.fillStyle = hexA(p.col, 0.5); g.fillRect(-11, -2, 15, 4); g.globalCompositeOperation = 'source-over'; g.fillStyle = p.col; g.fillRect(-7, -1, 11, 2); g.fillStyle = '#fff'; g.fillRect(-1, -1, 5, 2); g.restore(); }
    else if (sh === 'skybeam') { g.globalCompositeOperation = 'lighter'; g.fillStyle = hexA(p.col, 0.4); g.fillRect(x - 5, y - 30, 10, 60); g.globalCompositeOperation = 'source-over'; g.fillStyle = p.col; g.fillRect(x - 2, y - 26, 4, 52); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 24, 2, 48); }
    else if (sh === 'grenade') { disc(g, x, y, 3, '#2b5a2e'); disc(g, x, y, 2, '#5fcf5a'); if (Math.floor(Q.t * 12) % 2) { g.fillStyle = '#ff3a2a'; g.fillRect(x, y - 3, 1, 1); } }
    else if (sh === 'scythe') { g.save(); g.translate(x, y); g.rotate(p.rot || 0); g.strokeStyle = '#a15be0'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 7, 0.2, 2.6); g.stroke(); g.strokeStyle = '#e8d8ff'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 8, 0.3, 2.4); g.stroke(); g.fillStyle = '#5a3a5a'; g.fillRect(-1, -6, 2, 12); g.restore(); if (Math.random() < 0.5) emit(p.x, p.y, 1, { col: ['#7ed957', '#a15be0'], sp0: 3, sp1: 12, l0: 0.2, l1: 0.4 }); }
    else if (sh === 'chakram') { g.save(); g.translate(x, y); g.rotate(p.rot || 0); disc(g, 0, 0, 6, '#ffd34e'); disc(g, 0, 0, 3, '#14121f'); g.fillStyle = '#fff6c0'; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.fillRect(Math.round(Math.cos(a) * 7) - 1, Math.round(Math.sin(a) * 7) - 1, 2, 2); } g.restore(); }
    else if (sh === 'bigmeteor') { g.globalCompositeOperation = 'lighter'; disc(g, x, y, 16, 'rgba(255,120,40,.35)'); g.globalCompositeOperation = 'source-over'; disc(g, x, y, 11, '#5a2a1a'); disc(g, x, y, 9, '#ff7a2a'); disc(g, x - 2, y - 2, 5, '#ffd34e'); disc(g, x - 3, y - 3, 2, '#fff6c0'); }
    else if (sh === 'spark') { g.fillStyle = '#ffd34e'; g.fillRect(x - 1, y - 2, 3, 5); g.fillRect(x - 2, y - 1, 5, 3); g.fillStyle = '#fff'; g.fillRect(x, y, 1, 1); }
    else { g.fillStyle = p.col; g.fillRect(x - 2, y - 1, 4, 3); }
  }
  function drawGearHUD() {
    const P = Q.P, G = Q.G;
    for (let s = 0; s < 0; s++) {   // (the old J / H boxes; weapons now live on skill badges 1 and 2)
      const it = eqIt(s), bx = VW - 62 + s * 30, by = VH - 32;
      g.fillStyle = 'rgba(10,6,22,.6)'; g.fillRect(bx, by, 26, 26);
      if (it) {
        const ic = itemIcon(it.id); g.drawImage(ic.c, bx, by); iconFx(bx, by, 26, 26, it.rar);
        const gsx = it.type === 'gun' ? gunState(it, P) : null;
        const cdn = gsx ? (gsx.rel > 0 ? gsx.rel / it.st.reload : 0) : (it.type === 'wpn' ? P.wcd[s] / (P.wmax[s] || 1) : Math.max(0, P.atkCd) / (0.27 * (it.st.cd || 1)));
        if (gsx) txt(String(gsx.rel > 0 ? sv('RELOAD', 'NẠP') : gsx.mag), bx + 24, by + 21, { al: 'right', size: gsx.rel > 0 ? 4.5 : 6, col: gsx.rel > 0 ? '#ff7a7a' : (gsx.mag <= 2 ? '#ffb03a' : '#fff') });
        if (cdn > 0) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(bx + 1, by + 1, 24, Math.round(24 * Math.min(1, cdn))); }
        else if (it.type === 'wpn') { g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(bx + 1, by + 1, 24, 24); }
      } else { g.fillStyle = '#434d6e'; g.fillRect(bx, by, 26, 1); g.fillRect(bx, by + 25, 26, 1); g.fillRect(bx, by, 1, 26); g.fillRect(bx + 25, by, 1, 26); }
      txt(s ? 'H' : 'J', bx + 3, by + 21, { size: 6, col: '#ffd34e' });
    }
    { let sy = 48 + (Math.ceil(maxHP() / 8) - 1) * 10; const chip = (t, c) => { txt(t, VW - 8, sy, { al: 'right', size: 6, col: c }); sy += 9; };
      sy = 14 + (P.slow > 0 ? 10 : 0) + (P.rev > 0 ? 10 : 0) + (Q.windT > 0 ? 10 : 0);
      if (G.slowT > 0) chip((save.lang === 'vi' ? 'THỜI GIAN CHẬM ' : 'TIME SLOW ') + G.slowT.toFixed(1), '#ffd34e');
      if (G.god) chip((save.lang === 'vi' ? 'THẦN SẤM ' : 'THUNDER GOD ') + G.god.life.toFixed(1), '#ffe44e');
      if (G.dr) chip((save.lang === 'vi' ? 'RỒNG ' : 'DRAGON ') + G.dr.life.toFixed(1), '#ff9a2a');
      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a');
      if (Q.L.pearlGate && !Q.bossDead) chip(Q.L.pearlGate.open ? (save.lang === 'vi' ? 'Hạ Kraken!' : 'Defeat the Kraken!') : (save.lang === 'vi' ? 'Ngọc trai ' : 'Sea Pearls ') + (Q.pearls || 0) + '/3', Q.L.pearlGate.open ? '#ff7a8a' : '#bfeaff');
    }
    drawSkBadges();
    if (petRole() === 'scout') {
      let best = null, bd = 1e9; for (const it of Q.items) if (it.kind === 'shard' && !it.dead) { const d = Math.hypot(it.x - P.x, it.y - P.y); if (d < bd) { bd = d; best = it; } }
      if (best && bd > 40) { const an = Math.atan2(best.y - P.y, best.x - P.x), cx = P.x + 4 - Q.cam.x + Math.cos(an) * 26, cy = P.y + 4 - Q.cam.y + Math.sin(an) * 26; g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(an); g.fillStyle = '#6ee7f2'; g.beginPath(); g.moveTo(5, 0); g.lineTo(-3, -4); g.lineTo(-3, 4); g.fill(); g.restore(); txt(Math.round(bd / 16) + 'm', cx, cy - 8, { al: 'center', size: 5, col: '#6ee7f2' }); }
    }
  }

  // ===================== ALLIES: QuanSadBoy, HoangKiller, DuongDracular, Santree =====================
  const ALLY = { quan: { spr: 'npc_quan', col: '#a98bff' }, hoang: { spr: 'npc_hoang', col: '#e0453a' }, duong: { spr: 'npc_duong', col: '#c0304a' }, santree: { spr: 'npc_santree', col: '#5fcf5a' } };
  function pop(x, y, s, col) { Q.G.pops.push({ x, y, s, col: col || '#fff', t: 1.3 }); }
  // allies fight on their own: each one picks a side of the enemy, runs, jumps between platforms and uses its skills
  const ALLY_ROLE = { quan: { side: -1, dist: 78 }, hoang: { side: 1, dist: 16 }, duong: { side: 1, dist: 64 }, santree: { side: -1, dist: 30 } };
  function spawnAllies() {
    const P = Q.P, G = Q.G;
    G.allies = ['quan', 'hoang', 'duong', 'santree'].map((id, i) => ({ id, x: P.x + (i % 2 ? 20 : -20) - i * 6, y: P.y - 24, w: 8, h: 14, vx: 0, vy: 0, onGround: false, i, cd: 1 + i * 0.7, cd2: 5 + i * 3, t: 0, f: 1, dashT: 0, side: ALLY_ROLE[id].side, swapT: rr(6, 10), hopT: rr(1, 3) }));
    for (const a of G.allies) { emit(a.x + 4, a.y + 7, 20, { col: [ALLY[a.id].col, '#fff'], sp0: 30, sp1: 110 }); addRing(a.x + 4, a.y + 14, ALLY[a.id].col, 44, 0.5); }
    Snd.play('relic'); Q.msg = save.lang === 'vi' ? 'Bốn người bạn gia nhập trận chiến!' : 'Four friends join the fight!'; Q.msgT = 4;
  }
  function updateAllies(dt) {
    const G = Q.G, P = Q.P; if (!G.allies || !G.allies.length) return;
    const base = baseDmg();
    for (const a of G.allies) {
      a.t += dt; a.cd -= dt; a.cd2 -= dt; a.swapT -= dt; a.hopT -= dt; if (a.dashT > 0) a.dashT -= dt;
      const ax = a.x + 4, ay = a.y + 7;
      const bt = Q.arenaSealed ? bossTargets() : [], foe = nearestFoe(ax, ay, 150) || bt[0] || nearestFoe(ax, ay, 360);   // in the arena: always go for the boss
      if (a.swapT <= 0) { a.swapT = rr(6, 11); a.side = -a.side; }                     // switch flank now and then
      // where to stand: on its own side of the target (not behind the hero)
      let tx;
      if (foe) { const fc = foe.x + foe.w / 2; tx = fc + a.side * (foe.w / 2 + ALLY_ROLE[a.id].dist); if (Q.arenaSealed) tx = clamp(tx, (Q.L.arena.x0 + 2) * TS, (Q.L.arena.x1 - 2) * TS); a.f = fc < ax ? -1 : 1; }
      else { tx = P.x + 4 + (a.i % 2 ? 1 : -1) * (24 + a.i * 12); a.f = P.face; }
      if (a.dashT <= 0) {
        const dx = tx - ax, sp = a.id === 'hoang' ? 120 : 92;
        a.vx = Math.abs(dx) > 6 ? Math.sign(dx) * sp : a.vx * 0.7;
        const wall = moveX(a, a.vx * dt);
        const wantUp = foe && foe.y + foe.h < a.y - 6;                                  // target stands higher: climb
        if (a.onGround && (wall || wantUp && Math.random() < 0.06 || a.hopT <= 0)) { a.vy = -(wantUp ? 300 : 240); a.onGround = false; a.hopT = rr(1.5, 3.5); }
        if (a.drop > 0) a.drop -= dt;
        if (a.onGround && a.groundCh === '=' && foe && foe.y + foe.h > a.y + a.h + 10) a.drop = 0.25;   // target below: drop through the platform
        a.vy = Math.min(380, a.vy + GRAV * dt); moveY(a, a.vy * dt);
      }
      if ((!Q.arenaSealed && Math.hypot(P.x - a.x, P.y - a.y) > 320) || a.y > Q.L.H * TS) { a.x = P.x - 12; a.y = P.y - 10; a.vx = a.vy = 0; emit(a.x + 4, a.y + 7, 10, { col: [ALLY[a.id].col, '#fff'], sp0: 20, sp1: 70 }); }
      const fx = foe ? foe.x + foe.w / 2 : 0, fy = foe ? foe.y + foe.h / 2 : 0, cx = a.x + 4, cy = a.y + 2;
      if (a.id === 'quan') {
        if (foe && a.cd <= 0) { a.cd = 2.2; Snd.play('zap'); shootG({ x: cx, y: cy, vx: a.f * 130, vy: -50, home: true, life: 2.4, dmg: 3 + Math.floor(base / 2), sz: 3, col: '#a98bff', shape: 'orb', quiet: true, trail: '#a98bff' }); }
        if (foe && a.cd2 <= 0) { a.cd2 = 15; pop(cx, cy - 14, save.lang === 'vi' ? 'BÃO SÁCH!' : 'BOOK STORM!', '#a98bff'); for (let n = 0; n < 6; n++) later(n * 0.12, () => shootG({ x: a.x + 4, y: a.y, vx: (n % 2 ? 1 : -1) * rr(60, 140), vy: -rr(60, 140), home: true, life: 2.4, dmg: 3 + Math.floor(base / 2), sz: 3, col: '#cdb8ff', shape: 'orb', quiet: true, trail: '#a98bff' })); }
      } else if (a.id === 'hoang') {
        if (foe && a.cd <= 0 && Math.abs(fx - cx) < 160) { a.cd = 3.4; a.dashT = 0.3; a.x = fx + a.side * (foe.w / 2 + 6) - 4; a.y = foe.y + foe.h - a.h; Snd.play('clang'); dmgFoe(foe, 6 + base, true); for (let n = 0; n < 8; n++) emit(fx + rr(-10, 10), fy + rr(-10, 10), 1, { col: ['#e0453a', '#fff'], sp0: 30, sp1: 110 }); addRing(fx, fy, '#e0453a', 36, 0.3); }
        if (foe && a.cd2 <= 0) { a.cd2 = 14; pop(cx, cy - 14, save.lang === 'vi' ? 'CHÉM BÓNG!' : 'SHADOW FLURRY!', '#e0453a'); for (let n = 0; n < 5; n++) later(n * 0.14, () => { const t2 = nearestFoe(a.x + 4, a.y + 7, 320); if (!t2) return; a.dashT = 0.2; a.x = t2.x + t2.w / 2 + (n % 2 ? 1 : -1) * (t2.w / 2 + 6) - 4; a.y = t2.y + t2.h - a.h; Snd.play('clang'); dmgFoe(t2, 4 + Math.floor(base / 2), true, true); emit(t2.x + t2.w / 2, t2.y + t2.h / 2, 8, { col: ['#e0453a', '#fff'], sp0: 30, sp1: 110 }); }); }
      } else if (a.id === 'duong') {
        if (foe && a.cd <= 0) { a.cd = 4; Snd.play('flap'); for (let n = 0; n < 4; n++) shootG({ x: cx, y: cy, vx: (n % 2 ? 1 : -1) * rr(40, 110), vy: -rr(60, 130), home: true, life: 2.2, dmg: 2 + Math.floor(base / 3), sz: 2, col: '#c07bff', shape: 'bat', quiet: true }); }
        if (foe && a.cd2 <= 0) { a.cd2 = 14; pop(cx, cy - 14, save.lang === 'vi' ? 'HÚT MÁU!' : 'BLOOD DRAIN!', '#e0453a'); dmgFoe(foe, 5 + Math.floor(base / 2), true); if (P.hp < maxHP()) { P.hp++; Snd.play('heart'); } for (let n = 0; n < 10; n++) emit(fx + rr(-8, 8), fy + rr(-8, 8), 1, { col: ['#e0453a', '#c0304a'], sp0: 30, sp1: 90, vy: -30 }); }
      } else if (a.id === 'santree') {
        if (foe && a.cd <= 0) { a.cd = 5.5; Snd.play('crumble'); dmgFoe(foe, 4 + Math.floor(base / 2), true); foe.slowT = Math.max(foe.slowT || 0, 3); for (let n = 0; n < 12; n++) emit(fx + rr(-14, 14), foe.y + foe.h, 1, { col: ['#5fcf5a', '#2b8a3e', '#8a6a44'], sp0: 20, sp1: 80, vy: -rr(30, 90) }); }
        if (a.cd2 <= 0) { a.cd2 = 17; pop(cx, cy - 14, save.lang === 'vi' ? 'LÁ CHẮN XANH!' : 'EVERGREEN!', '#5fcf5a'); P.shield = true; if (P.hp < maxHP()) { P.hp++; Snd.play('heart'); } emit(P.x + 4, P.y + 7, 16, { col: ['#5fcf5a', '#fff', '#ffd34e'], sp0: 20, sp1: 80 }); }
      }
    }
  }
  function drawAllies(camX, camY) {
    const G = Q.G; if (!G.allies) return;
    for (const a of G.allies) {
      const x = Math.round(a.x + 4 - camX), y = Math.round(a.y + a.h - camY), run = a.onGround && Math.abs(a.vx) > 20, hop = run ? -Math.abs(Math.sin(a.t * 12 + a.i)) * 1.5 : 0;
      if (a.onGround) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - 6, y - 1, 12, 2); }
      drawSpr(g, npcSpr(ALLY[a.id].spr), x, Math.round(y + hop), a.f < 0);
      g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 10, 0, x, y - 10, 22); gr.addColorStop(0, hexA(ALLY[a.id].col, 0.18)); gr.addColorStop(1, hexA(ALLY[a.id].col, 0)); g.fillStyle = gr; g.fillRect(x - 22, y - 32, 44, 44); g.globalCompositeOperation = 'source-over';
    }
  }
  // helpers rain down during long boss fights: hearts, shields, power runes and ammo
  function updateBossDrops(dt) {
    const G = Q.G; if (!Q.arenaSealed || !Q.boss || Q.bossDead || Q.boss.dead || Q.state !== 'play') return;
    G.dropT = (G.dropT === undefined ? 8 : G.dropT) - dt;
    if (G.dropT > 0) return;
    G.dropT = rr(9, 14);
    const ar = Q.L.arena, x = rr((ar.x0 + 3) * TS, (ar.x1 - 3) * TS), r = Math.random();
    const it = { x, y: Q.cam.y - 6, id: -1, vy: 0, vx: 0, ph: 0, drop: true };
    if (r < 0.4) Q.items.push(Object.assign(it, { kind: 'heart' }));
    else if (r < 0.6) Q.items.push(Object.assign(it, { kind: 'buff', what: 'shield' }));
    else if (r < 0.8) Q.items.push(Object.assign(it, { kind: 'buff', what: 'power' }));
    else Q.items.push(Object.assign(it, { kind: 'pk', what: Math.random() < 0.5 ? 'bomb' : 'dagger', amt: 3, keep: false }));
    emit(x, Q.cam.y + 4, 10, { col: ['#fff', '#ffd34e'], sp0: 10, sp1: 50 }); Snd.play('select');
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
  function explode(x, y, r, dmg, soft) {
    if (hasRelic(9)) dmg *= 2;
    Snd.play('explode'); Q.shake = Math.max(Q.shake, soft ? 0.1 : 0.45);
    emit(x, y, 40, { col: ['#fff6c0', '#ffd34e', '#f08a2b', '#e0453a'], sp0: 40, sp1: 170, l0: 0.2, l1: 0.6 });
    for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg, true);
    for (const b of bossTargets()) if (Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < r + b.w / 2) hurtBoss(b, dmg, true);
    if (!soft) breakWalls(x, y, r);
    const P = Q.P; if (!soft && Math.hypot(P.x + 4 - x, P.y + 7 - y) < r * 0.8) { P.vx += (P.x + 4 < x ? -1 : 1) * 140; P.vy = -150; }
    Q.fps.push({ t: 'blast', x, y, life: 0.25, r });
  }
  function updateFps(dt) {
    for (const p of Q.fps) {
      p.life -= dt;
      if (p.t === 'g') { gStep(p, dt); continue; }
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
        if (p.t === 'dagger') { (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 2 + (hasRelic(1) ? 1 : 0)); Snd.play('hit'); p.dead = true; chargeHit(); }
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
      startScripted('lyra', RESCUE, () => { pz.open = true; save.leek = true; grantLeek(); grantLyraGifts(); writeSave(); if (coop && coop.role === 'host') NET.send({ t: 'gift' }); Q.items.push({ kind: 'npc', who: 'lyra', x: pz.x, y: pz.y, id: -5, ph: 0 }); Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer'); setEmo('happy', 3); emit(pz.x, pz.y - 14, 40, { col: ['#a4ffc0', '#fff', '#6ee7f2'], sp0: 20, sp1: 120 }); });
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
    updateTrials(dt); updateDragonEnc(); updateMiniEnc();
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
          const need = gd.keys || 1;
          if (P.keys >= need) { P.keys -= need; openGate(gd); Snd.play('key'); }
          else if (!Q.keyMsgT || Q.t - Q.keyMsgT > 3) { Q.keyMsgT = Q.t; Q.msg = need > 1 ? (save.lang === 'vi' ? 'Cần 2 chìa khóa! Chìa còn lại nằm rất xa phía sau bạn...' : 'Two keys needed! The other one lies far behind you...') : T('needkey'); Q.msgT = 3.5; }
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
        g.globalAlpha = 0.5; drawSpr(g, npcSpr('cage'), x, y + 1, false); g.globalAlpha = 1;
        g.fillStyle = '#8892aa'; for (let cy = y - 54; cy > y - 130; cy -= 4) g.fillRect(x - 1 + ((cy >> 2) & 1), cy, 2, 3);
        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 48, 3, 7); g.fillRect(x - 1, y - 39, 3, 3); }
      }
      else if (pz.type === 'rune') drawSpr(g, icon('rune', pz.ci, pz.lit ? 1 : 0), x, y + 1, false);
      if (Q.nearPz === pz && Q.state === 'play') txt(pz.type === 'torch' ? T('light') : (pz.type === 'tablet' ? T('read') : (pz.type === 'cage' ? T('free') : T('use'))), x, y - (pz.type === 'cage' ? 52 : 26), { al: 'center', size: 6, col: '#ffd34e' });
    }
    for (const gd of Q.gates) {
      if (gd.open && gd.need !== 'timed') continue;
      const gx = Math.round(gd.x * TS - camX + 8), gy2 = Math.round((gd.y1 - 3) * TS - camY);
      if (gx < -20 || gx > VW + 20) continue;
      if (gd.need === 'key') { drawSpr(g, icon('key'), gx, gy2, false); if (gd.keys > 1) { drawSpr(g, icon('key'), gx, gy2 - 12, false); txt('x' + gd.keys, gx + 10, gy2 - 6, { size: 6, col: '#ffd34e' }); } }
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
      else if (p.t === 'g') drawGHot(p, x, y);
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
    { const L = Q.L, B = Q.B, tz = B.zoom && !Q.bossDead && L.arena && (L.arena.y0 !== undefined ? Q.P.y > (L.arena.y0 - 7) * TS : Q.P.x > (L.arena.x0 - 9) * TS) ? B.zoom : 1; Q.zoom = (Q.zoom || 1) + (tz - (Q.zoom || 1)) * Math.min(1, dt * 2.2); if (Math.abs(Q.zoom - tz) < 0.002) Q.zoom = tz; }
    VW = BVW / (Q.zoom || 1); VH = BVH / (Q.zoom || 1);
    try { updateCam0(dt); } finally { VW = BVW; VH = BVH; }
  }
  function updateCam0(dt) {
    const P = (coop && Q.P.down && Q.players && Q.players.find(p => !p.down)) || Q.P, L = Q.L, k = 1 - Math.exp(-6 * dt);
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
        case 'bubbles': w.y -= 22 * w.s * dt; w.x += Math.sin(w.ph * 2) * 8 * dt; break;
        case 'spores': w.y -= 6 * w.s * dt; w.x += Math.sin(w.ph * 0.7) * 10 * dt; break;
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
        if (Q.menu === 0) Q.state = 'play'; else if (Q.menu === 1) startLevel(Q.li); else if (coop) coopBackToLobby(); else if (Q.menu === 2) { toScene('map'); } else toScene('title');
      }
      return;
    }
    if (st === 'talk') { updateTalk(dt); updateParticles(dt); return; }
    if (st === 'shop') { updateShop(); return; }
    if (st === 'reward') { Q.stateT += 0; if (Q.stateT > 0.8 && (act.okP || act.talkP || act.atkP)) Q.state = 'play'; updateParticles(dt); return; }
    if (st === 'tablet') { if (act.okP || act.talkP || act.backP || act.pauseP || act.atkP) { Q.state = 'play'; } return; }
    if (st === 'dead') {
      updateParticles(dt);
      if (Q.stateT > 0.8 && act.okP) { Snd.play('ok'); if (coop) Q.P = Q.me; respawn(); if (coop) coopRespawn(); }
      else if (Q.stateT > 0.8 && act.backP) { if (coop) coopBackToLobby(); else toScene('map'); }
      return;
    }
    if (st === 'complete') { updateParticles(dt); if (Q.stateT > 1 && act.okP) { Snd.play('ok'); if (coop) { if (Q.li === 6 && !Q.endShown) { Q.endShown = true; startScripted('narr', COOP_END, () => coopBackToLobby()); return; } coopBackToLobby(); return; } if (Q.li === 6) toScene('ending'); else if (Q.li === 0 && !save.ride) toScene('ride'); else if (Q.li === 1 && !save.castle) toScene('castle'); else { cutLevel = Q.li; mapSel = Math.min(9, LPOS(Q.li) + 1); toScene(CUT[Q.li] ? 'cutscene' : 'map'); } } return; }
    // play / bossintro
    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }
    if (act.shopP && st === 'play') { openShopInGame(); return; }
    if (st === 'play' && act.talkP) { if (Q.nearNpc) { startTalk(Q.nearNpc); return; } if (Q.nearPz) { usePz(Q.nearPz); return; } }
    if (Q.freeze > 0) { Q.freeze -= dt; updateParticles(dt); return; }
    Q.t += dt; Q.time += dt;
    if (Q.shake > 0) Q.shake -= dt;
    if (Q.msgT > 0) Q.msgT -= dt;
    if (Q.wishT > 0) Q.wishT -= dt;
    updatePlats(dt); updateCrumble(dt);
    if (st === 'bossintro' && !(Q.boss && Q.boss.st === 'intro')) Q.state = 'play'; // never get stuck in the intro
    if (st === 'bossintro') { asP(coop ? bossTgt(dt) : Q.P, () => updateBoss(dt)); updateCam(dt); updateParticles(dt); updateWeather(dt); Q.P.vx = 0; Q.P.vy = Math.min(380, Q.P.vy + GRAV * dt); moveY(Q.P, Q.P.vy * dt); return; }
    if (!Q.P.down) updatePlayer(dt);
    if (coop) coopHostPlayers(dt);
    if (Q.state !== 'play' && Q.state !== 'bossintro') { updateParticles(dt); return; }
    updateGear(dt); updateStatus(dt);
    updateTimeStop(dt);
    const edt = Q.G.tsT > 0 ? 0 : dt * (Q.G.slowT > 0 ? 0.4 : 1), bdt = (Q.boss && Q.boss.stunT > 0) ? 0 : edt, ddt = (Q.dragon && Q.dragon.stunT > 0) ? 0 : edt;
    updateEnemies(edt); { const tg = coop ? bossTgt(dt) : Q.P; asP(tg, () => { updateBoss(bdt); updateDragon(ddt); }); } updateBossDeath(dt); updateTraps(dt); updatePuzzles(dt); updateFps(dt); updateFires(dt); updateProjs(edt); updateZones(dt); updateCreeps(dt); updateItems(dt); updateOcean(dt); updateParticles(dt); updateCam(dt); updateWeather(dt);
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
    g.drawImage(Q.bg.sky, 0, 0, VW, VH);
    drawSun();
    drawSkyLife(camX, camY);
    if (Q.wishT > 0) drawWishDragon();
    for (const ly of Q.bg.layers) {
      let ox = -((cam.x * ly.f) % 512); if (ox > 0) ox -= 512;
      const y = Math.round(ly.anchor === 'top' ? ly.y - camY * 0.1 + 24 * 0.1 : ly.y + (24 - cam.y) * ly.f + (VH - BVH) + Math.max(0, cam.y - (Q.L.H - 15) * TS) * 0);
      g.drawImage(ly.c, Math.round(ox), y); g.drawImage(ly.c, Math.round(ox) + 512, y);
    }
    drawSurface(camX, camY);
    { const hz = g.createLinearGradient(0, VH * 0.42, 0, VH); hz.addColorStop(0, hexA(B.sky[2], 0)); hz.addColorStop(1, hexA(B.sky[2], B.dark > 0.5 ? 0.1 : 0.22)); g.fillStyle = hz; g.fillRect(0, VH * 0.42, VW, VH * 0.58); }
    if (Q.li === 6 && Q.boss && Q.boss.id === 'quoc' && Q.arenaSealed && Q.boss.fi > 0) drawFormScene(Q.boss.fi);
    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + VW) / TS), ty0 = Math.floor(camY / TS), ty1 = Math.floor((camY + VH) / TS);
    const lf = Math.floor(Q.t * 6 + (Q.time || 0) * 0) % 4;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      if (tx < 0 || tx >= L.W || ty < 0 || ty >= L.H) continue;
      const c = L.grid[ty][tx]; if (c === ' ') continue;
      const dx = tx * TS - camX, dy = ty * TS - camY, v = (tx * 7 + ty * 13) & 1;
      const above = ty > 0 ? L.grid[ty - 1][tx] : ' ';
      if (c === '#' || c === 'F') {
        const isTop = !(above === '#' || above === 'I' || above === 'C'), h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
        if (c === 'F') { const near = Math.abs(Q.P.x - tx * TS) < 40 && Math.abs(Q.P.y - ty * TS) < 40; g.globalAlpha = near ? 0.35 : 1; }
        g.drawImage(isTop ? (L.grid[ty][tx - 1] === 'I' && c === 'F' ? ts.iceTop[v] : ts.top[v]) : ts.body[h % 9 === 0 ? 2 + ((h >> 4) & 1) : v], dx, dy);
        if (c === 'F') { g.globalAlpha = 1; if (Math.sin(Q.t * 2 + tx) > 0.97) { g.fillStyle = '#fff'; g.fillRect(dx + (h % 12) + 2, dy + 1, 1, 1); } }
        else decoTile(tx, ty, dx, dy, isTop, h);
      }
      else if (c === 'I') g.drawImage((above === '#' || above === 'I') ? ts.iceBody[v] : ts.iceTop[v], dx, dy);
      else if (c === '=') { g.drawImage(ts.plat, dx, dy); platEnds(tx, ty, dx, dy); }
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
    drawProps(camX, camY);
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
    for (const e of Q.ents) { drawEnemy(e, camX, camY); if (e.v === 'phong' && !e.dead) drawPhongHat(e, camX, camY); }
    if (Q.syFig) { const f = Q.syFig; drawSpr(g, npcSpr('npc_sy'), Math.round(f.x - camX), Math.round(f.y - camY + Math.sin(Q.t * 2) * 1.5), false, false, 1.3, 1.3); }
    if (Q.boss && Q.boss.st !== 'sleep' || (Q.boss && Q.li === 6)) drawBoss(camX, camY);
    drawDragon(camX, camY);
    drawFx(camX, camY);
    drawGearFx(camX, camY);
    drawSummons(camX, camY);
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
    drawForeground(camX, camY);
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
      } else if (it.kind === 'buff') {
        const c = it.what === 'shield' ? '#6ee7f2' : '#ff5a3a', by = y + Math.round(Math.sin(it.ph * 3) * 1.5);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 9, c); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        disc(g, x, by, 5, '#14121f'); disc(g, x, by, 4, c);
        g.fillStyle = '#fff'; if (it.what === 'shield') { g.fillRect(x - 2, by - 2, 5, 3); g.fillRect(x - 1, by + 1, 3, 1); g.fillRect(x, by + 2, 1, 1); } else { g.fillRect(x, by - 3, 1, 6); g.fillRect(x - 2, by + 1, 5, 1); }
      } else if (it.kind === 'pearl') {
        const by = y + Math.round(Math.sin(it.ph * 2.4) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.4 + Math.sin(it.ph * 4) * 0.12; disc(g, x, by, 11, '#bfeaff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        disc(g, x, by, 5, '#3a4a7a'); disc(g, x, by, 4, '#f0f6ff'); disc(g, x - 1, by - 1, 2, '#ffffff'); g.fillStyle = '#ffd0f0'; g.fillRect(x + 1, by + 1, 2, 2);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-8, 4), 1, { col: ['#ffffff', '#bfeaff'], sp0: 2, sp1: 8, grav: -14, l0: 0.5, l1: 1 });
      } else if (it.kind === 'egg') {
        drawSpr(g, eggSprite(EGGS[it.k].k), x, y, false);
        if (!it.seen && Math.sin(Q.t * 3 + it.x) > 0.6) { g.fillStyle = '#fff'; g.fillRect(x + 6, y - 20, 1, 3); g.fillRect(x + 5, y - 19, 3, 1); }
      } else if (it.kind === 'orb') {
        const by = y + Math.round(Math.sin(it.ph * 2) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 11, '#ffb04a'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawSpr(g, eggSprite('wishorb'), x, by + 7, false);
        g.fillStyle = '#e0453a'; for (let k = 0; k < it.n; k++) { const a = k / Math.max(1, it.n) * 6.283; g.fillRect(Math.round(x + (it.n > 1 ? Math.cos(a) * 2.5 : 0)) - 1, Math.round(by + 1 + (it.n > 1 ? Math.sin(a) * 2.5 : 0)) - 1, 2, 2); }
      } else if (it.kind === 'rare') {
        const by = y + Math.round(Math.sin(it.ph * 3) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3 + Math.sin(it.ph * 5) * 0.1; disc(g, x, by, 10, '#c07bff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawRareIc(x, by, 1.4);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-6, 6), 1, { col: ['#fff', '#c07bff', '#6ee7f2'], sp0: 2, sp1: 8, grav: -10, l0: 0.4, l1: 0.8 });
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
        const n = NPCS[it.who], sp = npcSpr(n.spr), bob = 0, NA = animPose('idle', it.ph, 1, 0);
        drawSprT(g, sp, x, y, Q.P.x + 4 < it.x, false, NA.sx, NA.sy, 0);
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
  function drawPhongHat(e, camX, camY) {
    const x = Math.round(e.x + e.w / 2 - camX), y = Math.round(e.y - camY) + 2;
    g.fillStyle = '#14121f'; g.fillRect(x - 6, y - 12, 12, 11); g.fillRect(x - 10, y - 2, 20, 3);
    g.fillStyle = '#e0453a'; g.fillRect(x - 6, y - 5, 12, 2); g.fillStyle = '#4a4a62'; g.fillRect(x - 5, y - 11, 2, 7);
    txt('Mr Shorty Phong', x, y - 18, { al: 'center', size: 5, col: '#ffd34e', ol: '#14121f' });
  }
  function drawEnemy(e, camX, camY) {
    const c = e.cfg, x = e.x + e.w / 2 - camX, bot = e.y + e.h - camY;
    if (x < -40 || x > VW + 40) return;
    if (c.ai === 'blob' && e.st === 'wait') return;
    if (e.hid) { g.fillStyle = '#a07030'; g.fillRect(Math.round(x - 4), Math.round(bot - 2), 8, 2); g.fillStyle = '#c8964a'; g.fillRect(Math.round(x - 2), Math.round(bot - 3), 4, 1); return; }
    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, t = e.t;
    let spr = getSprite(c.spr, c.swap || {}, fr, c.out);
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al;
    const ground = e.onGround;
    { const sp = Math.abs(e.vx || 0), hurt = e.hitT > 0 || e.flash > 0, flyer = c.ai === 'fly' || c.ai === 'ghost' || c.ai === 'flyshoot' || e.fly;
      const st = hurt ? 'hurt' : (!ground && !flyer ? 'jump' : (e.st === 'block' ? 'push' : (sp > 60 || e.st === 'rush' ? 'run' : (sp > 2 ? 'walk' : 'idle'))));
      const A = animPose(flyer && st !== 'hurt' ? 'idle' : st, t, e.dir || 1, st === 'hurt' ? 1 - clamp(Math.max(e.hitT || 0, e.flash || 0) / 0.18, 0, 1) : e.vy);
      sx = A.sx; sy = A.sy; ox = A.ox; oy = A.oy; rot = A.rot; if (A.red) spr = redOf(spr); }
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
      else if (mv) { }   // walk / run come from animPose
      else { }
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
    if (e.flatT > 0) { e.flatT -= 1 / 60; sy *= 0.3; sx *= 1.6; if (Math.random() < 0.2) emit(e.x + e.w / 2 + rr(-6, 6), e.y + e.h - 4, 1, { col: '#ffd34e', sp0: 3, sp1: 10, l0: 0.3, l1: 0.5 }); }
    if (e.spawnT > 0) { const k = 1 - e.spawnT / 0.4, os = 1 + Math.sin(k * Math.PI) * 0.25; sx *= (0.2 + 0.8 * k) * os; sy *= (0.2 + 0.8 * k) * os; al = k; if (Math.random() < 0.5) emit(e.x + e.w / 2, e.y + e.h / 2, 1, { col: ['#fff', bpc()], sp0: 10, sp1: 40, grav: 0, l0: 0.2, l1: 0.4 }); }
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
  // Quoc's forms: pick the artist's animation frame that matches what the boss is doing
  function bossFrame(b) {
    const c = b.cfg, set = c.img && typeof QUOC_IMG !== 'undefined' && QUOC_IMG[c.img];
    if (!set || !set.ready) return null;
    const A = c.anim, sk = b.st === 'tele' ? b.atkSk : b.sk;
    let list = A.idle, fps = 3;
    if ((b.st === 'tele' || b.st === 'act') && sk) {
      if (A.special && ['tornado', 'dark', 'cloak', 'clone', 'summon', 'roar', 'shield', 'teleport'].indexOf(sk) >= 0) list = A.special;
      else if (A.slam && SLAM_L.indexOf(sk) >= 0) list = A.slam;
      else if (RANGE_L.indexOf(sk) >= 0 || CAST_L.indexOf(sk) >= 0) list = A.cast;
      else list = A.melee;
      if (b.st === 'tele') return set.frames[list[0]];
      fps = 7;
    } else if (!b.onGround && A.air) { list = A.air; fps = 6; }
    else if (b.moveT > 0 || b.st === 'evade') { list = A.move; fps = 8; }
    return set.frames[list[Math.floor(b.t * fps) % list.length]];
  }
  function drawBoss(camX, camY) {
    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;
    { const fr = bossFrame(b); if (fr) b.spr = fr; }
    if (typeof BOSS_IMG !== 'undefined' && BOSS_IMG[Q.li] && b.cfg === BOSS[Q.li]) b.spr = BOSS_IMG[Q.li];
    const c = b.cfg, x = Math.round(b.x + b.w / 2 - camX), bot = Math.round(b.y + b.h - camY), gyy = Math.round(Q.L.arena.gy * TS - camY);
    if (b.hide) {
      if (b.st === 'dropwait') {
        const lx = b.lockx === null ? b.tx : b.lockx, mx = Math.round(lx - camX), gy2 = Math.round(groundYAt(lx) - camY), k = clamp(1 - b.timer / 3.4, 0, 1), locked = b.lockx !== null, bl = Math.floor(Q.t * 14) % 2;
        g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = locked ? (bl ? '#ff3a2a' : '#ffd34e') : '#000'; for (let j = -4; j <= 4; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - (j / 4.5) ** 2)) * (30 + 34 * k)); g.fillRect(mx - hw, gy2 - 1 + j, hw * 2, 1); } g.globalAlpha = 1;
        if (locked) { g.fillStyle = '#ff3a2a'; g.fillRect(mx - 1, gy2 - 40, 3, 22); g.fillRect(mx - 1, gy2 - 14, 3, 4); }
        return;
      }
      if (b.sk === 'burrow' && b.ph === 1) {
        const mx = Math.round(b.tx - camX), gy2 = Math.round(groundYAt(b.tx) - camY), j = Math.round(Math.sin(Q.t * 40) * 2), bl = Math.floor(Q.t * 12) % 2;
        g.fillStyle = '#5a4430'; g.fillRect(mx - 18 + j, gy2 - 3, 36, 3); g.fillStyle = '#8a6a4a'; g.fillRect(mx - 12 - j, gy2 - 5, 24, 2);
        g.globalAlpha = 0.6; g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(mx - 22, gy2 - 1, 44, 2); g.fillRect(mx - 1, gy2 - 22, 3, 9); g.fillRect(mx - 1, gy2 - 11, 3, 3); g.globalAlpha = 1;
      }
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
    if (P.circle) drawCircle(x, gyy - 2, Math.round(b.w * 0.8) + 10, bpc(), Q.t);
    if (P.aura && P.aura[1] > 0.02) drawAura(x, bot - (b.h >> 1), Math.round(b.h * 0.9), P.aura[0].length === 7 ? P.aura[0] : '#ff9a2a', P.aura[1]);
    if (b.st === 'evade') { g.globalAlpha = 0.35; drawSprT(g, b.spr, x - b.ed * 14, bot, b.dir < 0, false, 1, 1, 0, 0.35); g.globalAlpha = 1; }
    if ((b.sk === 'charge' || b.sk === 'rush') && b.st === 'act') { g.globalAlpha = 0.25; drawSprT(g, b.spr, x - b.dir * 12, bot, b.dir < 0, false, 1.1, 0.92, b.dir * 0.2, 0.25); drawSprT(g, b.spr, x - b.dir * 24, bot, b.dir < 0, false, 1.05, 0.95, b.dir * 0.2, 0.15); g.globalAlpha = 1; }
    let al = P.al; if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) al = Math.min(al, 0.45);
    const bst = b.flash > 0 ? 'hurt' : (!b.onGround && !c.fly && !c.eclipse ? 'jump' : (b.moveT > 0 || b.st === 'evade' ? (Math.abs(b.vx || 0) > 140 ? 'run' : 'walk') : 'idle'));
    const BA = animPose(bst, b.t, b.dir || 1, bst === 'hurt' ? 1 - clamp(b.flash / 0.15, 0, 1) : b.vy), bsx = bst === 'hurt' ? 1 : BA.sx, bsy = bst === 'hurt' ? 1 : BA.sy;
    drawSprT(g, BA.red ? redOf(b.spr) : b.spr, x + P.ox + (bst === 'hurt' ? BA.ox : 0), bot + bob + P.oy + BA.oy, b.dir < 0, (b.flash > 0 && !BA.red) || tele || b.revT > 0, P.sx * bsx * (c.artScale || 1), P.sy * bsy * (c.artScale || 1), P.rot + BA.rot * 0.5, al);
    if (b.cloak && Math.random() < 0.5) { g.fillStyle = Math.random() < 0.5 ? '#a15be0' : '#fff'; g.fillRect(x + Math.round(rr(-b.w / 2, b.w / 2)), bot - Math.round(rr(0, b.h)), 1, 2); }
    if (b.shield > 0) { g.globalAlpha = 0.35 + Math.sin(Q.t * 12) * 0.12; disc(g, x, bot - (b.h >> 1), Math.round(b.h * 0.62), '#6ee7f2'); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x - 1, bot - b.h - 8, 3, 3); }
    if (b.guard > 0) { g.globalAlpha = 0.5; g.strokeStyle = '#cfd6e6'; g.lineWidth = 2; g.strokeRect(x - (b.w >> 1) - 3, bot - b.h - 3, b.w + 6, b.h + 4); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { const a = Q.t * 5 + i * 2.1; g.fillStyle = '#fff'; g.fillRect(Math.round(x + Math.cos(a) * (b.w / 2 + 4)), Math.round(bot - (b.h >> 1) + Math.sin(a) * (b.h / 2)), 2, 2); } }
    if (b.st === 'stun') { for (let i = 0; i < 3; i++) { const a = Q.t * 6 + i * 2.1; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(a) * 12), Math.round(bot - b.h - 4 + Math.sin(a) * 3), 3, 3); } }
  }
  function drawArmorBack(av, x, bot) {
    const P = Q.P, f = P.face, t = Q.t;
    if (av.aura) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, bot - 8, 0, x, bot - 8, 24); gr.addColorStop(0, hexA(av.aura, 0.24 + Math.sin(t * 4) * 0.05)); gr.addColorStop(1, hexA(av.aura, 0)); g.fillStyle = gr; g.fillRect(x - 24, bot - 32, 48, 48); g.globalCompositeOperation = 'source-over'; }
    if (av.wings) {
      const flap = Math.sin(t * (P.onGround ? 4 : 11)) * 3, col = av.wings === 'angel' ? '#ffffff' : (av.wings === 'dragon' ? '#a02a2a' : '#4a2a70'), ed = av.wings === 'angel' ? '#cfe8ff' : (av.wings === 'dragon' ? '#ff6a3a' : '#c07bff');
      for (const s of [-1, 1]) {
        const bx = x + s * 3, by = bot - 13;
        g.fillStyle = col; g.beginPath(); g.moveTo(bx, by); g.lineTo(x + s * 15, by - 9 + flap); g.lineTo(x + s * 12, by - 2 + flap * 0.5); g.lineTo(x + s * 14, by + 4); g.lineTo(x + s * 8, by + 3); g.lineTo(bx, by + 4); g.fill();
        g.strokeStyle = ed; g.lineWidth = 1; g.beginPath(); g.moveTo(bx, by); g.lineTo(x + s * 15, by - 9 + flap); g.stroke();
      }
    }
    if (av.cape) {
      const sway = Math.sin(t * 6) * 1.5 + (Math.abs(P.vx) > 15 ? 2.5 : 0) + (P.onGround ? 0 : 2);
      g.fillStyle = av.cape; g.beginPath(); g.moveTo(x - f * 3, bot - 14); g.lineTo(x - f * (6 + sway), bot - 1); g.lineTo(x - f * (1 + sway * 0.5), bot + 1); g.lineTo(x + f * 1, bot - 13); g.fill();
      g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x - f * 4 - (f > 0 ? 0 : 0), bot - 13, 1, 6);
    }
  }
  function drawArmorFront(av, x, bot) {
    const t = Q.t;
    if (av.halo) { g.strokeStyle = av.halo; g.lineWidth = 1; g.beginPath(); g.ellipse(x, bot - 27 + Math.round(Math.sin(t * 3)), 5, 1.6, 0, 0, 7); g.stroke(); g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.beginPath(); g.ellipse(x, bot - 27 + Math.round(Math.sin(t * 3)), 6, 2.2, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    if (av.spikes) { g.fillStyle = av.spikes; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 5, bot - 13); g.lineTo(x + s * 8, bot - 18); g.lineTo(x + s * 7, bot - 12); g.fill(); } }
    if (av.flame && Math.random() < 0.4) emit(x + rr(-5, 5), bot - 18, 1, { col: ['#ffd34e', '#ff7a2a'], sp0: 3, sp1: 12, grav: -40, l0: 0.25, l1: 0.5 });
    if (av.aura && Math.random() < 0.1) emit(x + rr(-6, 6), bot - rr(2, 20), 1, { col: [av.aura, '#fff'], sp0: 2, sp1: 10, grav: -12, l0: 0.3, l1: 0.6 });
  }
  function drawHeldSword(sw, x, bot) {
    const P = Q.P, f = P.face, hx = x + f * 3, hy = bot - 9, glow = swordGlow(sw.id), L = SWORD_LOOK[sw.id] || SWORD_LOOK.iron, pulse = 0.6 + Math.sin(Q.t * 6) * 0.25;
    const SC = sw.id === 'leek' ? 1 : 0.7, swinging = P.atk > 0 && P.sw === sw, rad = Math.round((L.len * 0.8 + 6) * SC);
    let ang;
    if (swinging) { const t = 1 - P.atk / 0.2; ang = P.atkDown ? 1.5 : lerp(-1.5, 1.0, t); } else ang = -2.15;
    const tipx = hx + Math.cos(ang) * rad * 0.8 * f, tipy = hy + Math.sin(ang) * rad * 0.8;
    if (glow) {
      g.globalCompositeOperation = 'lighter';
      const grd = g.createRadialGradient(tipx, tipy, 0, tipx, tipy, 30);
      grd.addColorStop(0, hexA(glow, 0.5 * pulse + (swinging ? 0.25 : 0))); grd.addColorStop(1, hexA(glow, 0));
      g.fillStyle = grd; g.fillRect(tipx - 30, tipy - 30, 60, 60);
      g.globalCompositeOperation = 'source-over';
    }
    if (swinging && !P.atkDown) {
      for (let k = 1; k <= 7; k++) { const a2 = ang - k * 0.24, tx = hx + Math.cos(a2) * rad * f, ty = hy + Math.sin(a2) * rad; g.globalAlpha = 0.65 - k * 0.08; g.fillStyle = k % 2 ? L.ed : L.bl; g.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 3, 3); }
      g.globalAlpha = 1;
    } else if (swinging && P.atkDown) {
      g.fillStyle = L.ed; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 5)); g.fillRect(Math.round(x + Math.cos(a) * 12 * f), Math.round(bot + Math.sin(a) * 12 - 2), 2, 2); }
    }
    g.save(); g.translate(hx, hy); g.scale(f, 1); g.rotate(ang); g.scale(SC, SC);
    if (sw.id === 'leek') { const lk = leekSprite(); g.drawImage(lk.c, -1, -lk.h / 2); } else { const sp = swordSprite(sw.id); g.drawImage(sp.c, -1, -8); }
    g.restore();
    if (glow && Math.random() < 0.35) emit(P.x + 4 + Math.cos(ang) * rad * 0.8 * f + rr(-6, 6), P.y + 5 + Math.sin(ang) * rad * 0.8 + rr(-6, 6), 1, { col: [L.ed, glow, '#fff'], sp0: 2, sp1: 10, grav: -12, l0: 0.3, l1: 0.7 });
  }
  function drawPlayer(camX, camY) {
    if (coop && Q.players && Q.players.length) { for (const p of Q.players) { if (p.down) drawDown(p, camX, camY); else asP(p, () => drawPlayer1(camX, camY)); } return; }
    drawPlayer1(camX, camY);
  }
  // ----- rarity effects: Rare+ sparkles, Epic+ glow, Legendary+ halo, Divine shifts through every colour -----
  const rarCol = (r, t) => r >= 6 ? 'hsl(' + (((t || Q.t) * 140) % 360 | 0) + ',100%,72%)' : (RARITY_COL[r] || '#ffffff');
  function rarFx(r, x, y, rad) {
    if (!(r >= 2)) return; const t = Q.t;
    if (Math.random() < 0.06 * r) emit(x + rr(-rad, rad), y + rr(-rad, rad), 1, { col: [rarCol(r, t + Math.random()), '#ffffff'], sp0: 2, sp1: 12, grav: -25, l0: 0.25, l1: 0.55 });
    if (r >= 4) { g.globalCompositeOperation = 'lighter'; const c = r >= 6 ? '#ff4af0' : RARITY_COL[r], gr = g.createRadialGradient(x, y, 0, x, y, rad * 2.2); gr.addColorStop(0, hexA(c, 0.22 + Math.sin(t * 5) * 0.06)); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.fillRect(x - rad * 2.2, y - rad * 2.2, rad * 4.4, rad * 4.4); g.globalCompositeOperation = 'source-over'; }
  }
  function rarAura(r, x, bot) {
    if (!(r >= 3)) return; const t = Q.t;
    if (Math.random() < 0.05 * r) emit(x + rr(-7, 7), bot - rr(0, 4), 1, { col: [rarCol(r, t + Math.random()), '#ffffff'], sp0: 2, sp1: 8, grav: -40, l0: 0.4, l1: 0.8 });
    if (r >= 5) { g.globalAlpha = 0.35 + Math.sin(t * 4) * 0.12; g.strokeStyle = r >= 6 ? rarCol(r, t) : RARITY_COL[r]; g.lineWidth = 1; g.beginPath(); g.ellipse(x, bot, 9, 2.2, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
  function iconFx(x, y, w, h, r) {
    if (!(r >= 3)) return; const t = Q ? Q.t : sceneT, c = r >= 6 ? rarCol(r, t) : RARITY_COL[r];
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const sx = x - w + ((t * 40) % (w * 3));
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(sx, y + h); g.lineTo(sx + 4, y + h); g.lineTo(sx + 4 + h * 0.6, y); g.lineTo(sx + h * 0.6, y); g.fill(); g.restore();
    if (r >= 5) { g.globalAlpha = 0.5 + Math.sin(t * 5) * 0.3; g.fillStyle = c; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); g.globalAlpha = 1; }
    const k = Math.floor(t * 3 + x) % 4, px = k < 2 ? x + 2 : x + w - 3, py = k % 2 ? y + 2 : y + h - 3; g.fillStyle = c; g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 9); g.fillRect(px - 1, py, 3, 1); g.fillRect(px, py - 1, 1, 3); g.globalAlpha = 1;
  }
  // the player's animator: Idle (4 frames), Walk (6), Run (6), Push (6, against a wall), Jump (6: crouch, take-off, rise, top, fall, land), Hurt (3, the middle one red)
  function heroAnim(P, swim) {
    const RUNV = RUN * 0.72, sp = Math.abs(P.vx);
    if (P.hurtA > 0) { const f = Math.min(2, Math.floor((1 - P.hurtA / 0.36) * 3)); return { n: 'hero_hurt', f, red: f === 1 }; }
    if (swim) return { n: 'hero_run6', f: Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 6 };
    if (!P.onGround) { const vy = P.vy, f = P.airT < 0.06 && vy < 0 ? 0 : vy < -140 ? 1 : vy < -40 ? 2 : vy < 80 ? 3 : 4; return { n: 'hero_jump6', f }; }
    if (P.landA > 0) return { n: 'hero_jump6', f: 5 };
    if (P.push > 0) return { n: 'hero_push', f: Math.floor(P.anim * 7) % 6 };
    if (sp > 15) return sp < RUNV || P.slow > 0 ? { n: 'hero_walk', f: Math.floor(P.anim * 9) % 6 } : { n: 'hero_run6', f: Math.floor(P.anim * 12) % 6 };
    return { n: 'hero_idle4', f: Math.floor(P.anim * 4) % 4 };
  }
  function drawPlayer1(camX, camY) {
    const P = Q.P;
    if (Q.state === 'dead') return;
    if (P.inv > 0 && P.dash <= 0 && Math.floor(P.inv * 20) % 2 === 0) return;
    const x = Math.round(P.x + P.w / 2 - camX), bot = Math.round(P.y + P.h - camY);
    const swim = wetP(P) && !P.onGround;
    if (swim) { const rot = clamp(-P.vy / 320, -0.45, 0.45) * P.face + (P.atk > 0 ? P.face * 0.15 : 0); g.save(); g.translate(x, bot - 10); g.rotate(rot); g.translate(-x, -(bot - 10)); }
    const hh = P.hero && HERO[P.hero], arV = isFan(P) ? null : armorVis(save.inv.armor); let av = hh ? (arV ? Object.assign({}, hh, arV, { sw: Object.assign({}, hh.sw, arV.sw) }) : hh) : arV; // a hero wears the armor he has equipped
    if (!hh && !coop && (save.cos.aura || save.cos.wings)) av = Object.assign({ sw: {} }, av || {}, save.cos.aura ? { aura: '#ffd34e' } : {}, save.cos.wings && !(av && av.wings) ? { wings: 'dragon' } : {});
    const swp = av ? av.sw : {};
    if (av) drawArmorBack(av, x, bot);
    let spr; const an = heroAnim(P, swim), am = (HERO_META[an.n] || [])[an.f] || { bx: 0, by: 0 };
    spr = getSprite(an.n, swp, an.f); if (an.red) spr = redOf(spr);
    const ax = x + am.bx * P.face, ab = bot + am.by;   // where the head and hands are in this frame (hats, weapons, lantern follow)
    if (hh && hh.custom) { const fa = Math.floor(P.anim * 12) % 4, ck = P.inhT > 0 ? 'inhale' : (P.flutter && !P.onGround ? 'big' : (swim || (Math.abs(P.vx) > 15 && P.onGround) ? 'run' : (!P.onGround ? 'air' : 'idle'))); spr = custSpr(hh, ck, ck === 'run' ? fa : ck === 'idle' ? Math.floor(P.anim * 3) % 2 : 0, P); if (an.red) spr = redOf(spr); }
    const bob = 0;
    if (P.trail) for (const tr of P.trail) { g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, Math.round(tr.x + P.w / 2 - camX), Math.round(tr.y + P.h - camY), tr.f < 0, true, 1, 1, tr.t / 0.22 * 0.45); g.globalCompositeOperation = 'source-over'; }
    if (P.dash > 0) g.globalAlpha = 0.75;
    if (!heroMechBody(P, spr, x, bot + bob, hh)) drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;
    if (P.ball) { heroMechOver(P, x, bot, hh); if (swim) g.restore(); if (coop) drawCoopTag(P, x, bot); return; }
    if (!(hh && hh.custom)) drawEmoteFace(ax, ab + bob, P.face < 0, 1, P.emo, P.anim); drawEmoBubble(ax - 8, ab - 24, P.emo);
    // lantern
    const lx = ax + P.face * 8, ly = ab - 9 + Math.round(Math.sin(P.anim * 7) * (Math.abs(P.vx) > 15 ? 1.5 : 0.6));
    g.fillStyle = '#1b1626'; g.fillRect(lx - 3, ly - 3, 6, 7); g.fillRect(lx - 1, ly - 5, 2, 2);
    g.fillStyle = '#ffd34e'; g.fillRect(lx - 2, ly - 2, 4, 5); g.fillStyle = '#fff6c0'; g.fillRect(lx - 1, ly - 1, 2, 2);
    const sw = heldSword();
    const hk = P.hold && save.inv.w.indexOf(P.hold) >= 0 ? P.hold : null, hg = hk && GUN_PAINT[hk] ? hk : ((P.gunT > 0 && P.gunId && GUN_PAINT[P.gunId]) ? P.gunId : null);
    if (isFan(P)) { } else if (hg) drawHeldGun(hg, ax, ab, P.face); else if (hk && WPN_PAINT[hk]) drawHeldWpn(hk, ax, ab, P.face); else if (sw) drawHeldSword(sw, ax, ab);
    if (av) drawArmorFront(av, ax, ab);
    if (hh && hh.hat) drawHat(hh, ax, ab, P.face);
    { const wid = hk || (sw && sw.id), wit = wid && ITEM[wid], ait = save.inv.armor && ITEM[save.inv.armor]; if (wit) rarFx(wit.rar, ax + P.face * 9, ab - 13, 6); if (ait) rarAura(ait.rar, ax, ab); }
    if (hh && hh.mech) heroMechOver(P, ax, ab, hh);
    if (P.parryT > 0) { const k = P.parryT / 0.24, cx = x + P.face * 6, cy = bot - 8; g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(159,232,255,' + (0.5 + k * 0.5) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 9 + (1 - k) * 3, P.face > 0 ? -1.1 : Math.PI - 1.1, P.face > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); g.fillStyle = 'rgba(255,255,255,' + k * 0.5 + ')'; g.fillRect(cx + P.face * 9 - 1, cy - 6, 2, 12); g.globalCompositeOperation = 'source-over'; g.lineWidth = 1; }
    if (P.counterT > 0 && Math.random() < 0.6) emit(P.x + 4 + rr(-6, 6), P.y + rr(0, 14), 1, { col: ['#ffd34e', '#fff'], sp0: 4, sp1: 16, grav: -30, l0: 0.2, l1: 0.4 });
    if (swim) g.restore();
    if (coop) drawCoopTag(P, x, bot);
  }
  function drawLighting() {
    const B = Q.B, P = Q.P, camX = Q.cam.x, camY = Q.cam.y;
    const dark = Q.darkCur !== undefined ? Q.darkCur : B.dark;
    const flick = Math.sin(Q.t * 9) * 2 + Math.sin(Q.t * 5.3) * 1.5;
    const lights = [{ x: P.x + 4 - camX, y: P.y + 6 - camY, r: ((dark > 0.6 ? 64 : (dark > 0.3 ? 78 : 90)) + flick + (Q.ents.some(e => !e.dead && Math.abs(e.x - P.x) < 80 && Math.abs(e.y - P.y) < 50) ? Math.sin(Q.t * 38) * 4 : 0)) * (hasRelic(2) ? 1.45 : 1) * (petRole() === 'owl' ? 1.3 : 1), i: 1 }];
    const addL = (x, y, r, i) => { const sx = x - camX, sy = y - camY; if (sx > -r && sx < VW + r && sy > -r && sy < VH + r) lights.push({ x: sx, y: sy, r, i: i || 1 }); };
    for (const it of Q.items) { if (it.kind === 'cp' && it.lit) addL(it.x, it.y - 26, 50, 1); else if (it.kind === 'shard') addL(it.x, it.y, 34, 1); else if (it.kind === 'frag') addL(it.x, it.y, 80, 1); else if (it.kind === 'npc') addL(it.x, it.y - 10, 36, 0.8); else if (it.kind === 'coin' && B.dark > 0.5) addL(it.x, it.y, 10, 0.5); }
    for (const e of Q.ents) if (e.cfg.ai === 'flyshoot' || e.cfg.ai === 'blob' || e.type === 'ghost') addL(e.x + e.w / 2, e.y + e.h / 2, 34, 0.9);
    for (const p of Q.projs) addL(p.x, p.y, 24, 0.9);
    for (const pz of Q.pz) if ((pz.type === 'torch' && pz.lit) || (pz.type === 'rune' && pz.lit)) addL(pz.x, pz.y - 10, 38, 0.9);
    for (const f of Q.fires) addL(f.x, f.y - 8, 34, 0.9);
    for (const p of Q.fps) if (p.t !== 'dagger') addL(p.x, p.y, p.shape === 'beam' ? 46 : 20, 0.8);
    if (Q.G.lyra) addL(Q.G.lyra.x, Q.G.lyra.y - 12, 44, 0.9);
    { const hs = heldSword(); if (hs && swordGlow(hs.id)) addL(P.x + 4 + P.face * 10, P.y + 2, 38, 0.85); }
    if (Q.boss && Q.boss.st !== 'sleep') addL(Q.boss.x + Q.boss.w / 2, Q.boss.y + Q.boss.h / 2, Math.max(60, Q.boss.w * 0.6), 0.8);
    if (Q.scn) for (const p of Q.scn.props) if (PROP_GLOW[p.k]) addL(p.x, p.y - 10, 40, 0.8);
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
    { const hs = heldSword(), gc = hs && swordGlow(hs.id);
      if (gc) { const lx = P.x + 4 + P.face * 10 - camX, ly = P.y + 2 - camY, gl = g.createRadialGradient(lx, ly, 0, lx, ly, 44); gl.addColorStop(0, hexA(gc, 0.2)); gl.addColorStop(1, hexA(gc, 0)); g.fillStyle = gl; g.fillRect(lx - 44, ly - 44, 88, 88); } }
    g.globalCompositeOperation = 'source-over';
  }
  function drawWeather() {
    const t = Q.wtype;
    if (Q.L.wet && !Q.B.water) {   // the underground lake: a blue body of water with a waving surface, only inside the cavern
      const ar = Q.L.arena, lx0 = Math.round((ar.x0 - 7) * TS - Q.cam.x), lx1 = Math.round(ar.x1 * TS - Q.cam.x), sy = Math.round(Q.L.waterY * TS - Q.cam.y), fy = Math.round(ar.gy * TS - Q.cam.y);
      const x0 = Math.max(0, lx0), x1 = Math.min(VW, lx1), y0 = Math.max(0, sy), y1 = Math.min(VH, fy);
      if (x1 > x0 && y1 > y0) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(60,170,220,.30)'); gr.addColorStop(1, 'rgba(10,50,110,.55)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
        g.globalAlpha = 0.05 + Math.sin(Q.t * 0.8) * 0.02; g.fillStyle = '#bfeaff'; for (let i = 0; i < 6; i++) g.fillRect(x0 + ((i * 97 + Q.t * 8) % Math.max(10, x1 - x0)), y0, 12, y1 - y0); g.globalAlpha = 1; }
      if (sy > -4 && sy < VH) for (let x = x0; x < x1; x += 2) { const wy = sy + Math.round(Math.sin((x + Q.cam.x) * 0.1 + Q.t * 2.4) * 1.4); g.fillStyle = '#d8f4ff'; g.fillRect(x, wy - 1, 2, 2); g.fillStyle = 'rgba(160,220,255,.5)'; g.fillRect(x, wy + 1, 2, 3); }
    } else if (Q.B.water || Q.L.wet) {
      const sy = Q.L.waterY !== undefined ? Math.max(0, Math.round(Q.L.waterY * TS - Q.cam.y)) : 0, dp = Q.L.waterY !== undefined ? clamp((Q.cam.y + VH / 2) / TS / Q.L.H, 0, 1) : 0;
      if (sy < VH) { g.fillStyle = 'rgba(' + Math.round(20 - dp * 14) + ',' + Math.round(90 - dp * 60) + ',' + Math.round(140 - dp * 60) + ',' + (0.14 + dp * 0.3).toFixed(2) + ')'; g.fillRect(0, sy, VW, VH - sy);
        g.globalAlpha = Math.max(0, 0.05 + Math.sin(Q.t * 0.7) * 0.02 - dp * 0.06); g.fillStyle = '#bfeaff'; for (let i = 0; i < 6; i++) g.fillRect(((i * 73 + Q.t * 9) % (VW + 40)) - 20, sy, 10, VH - sy); g.globalAlpha = 1; }
    }
    for (const w of Q.weather) {
      const x = Math.round(w.x), y = Math.round(w.y);
      switch (t) {
        case 'bubbles': g.strokeStyle = 'rgba(200,240,255,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, w.s > 1 ? 2 : 1, 0, 7); g.stroke(); break;
        case 'spores': { const a = 0.4 + 0.5 * Math.max(0, Math.sin(w.ph * 2)); g.globalAlpha = a; g.fillStyle = Math.floor(w.ph) % 2 ? '#c8f0a0' : '#c07bff'; g.fillRect(x, y, 2, 2); g.globalAlpha = 1; break; }
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
      const x = 12 + (i % 8) * 10, y = 14 + Math.floor(i / 8) * 10;
      if (i < P.hp) drawSpr(g, hs, x, y, false); else { g.globalAlpha = 0.3; drawSpr(g, hs, x, y, false, true); g.globalAlpha = 1; }
    }
    const hdy = (Math.ceil(mh / 8) - 1) * 10;
    g.fillStyle = '#ffd34e'; g.fillRect(8, 20 + hdy, 5, 5); g.fillStyle = '#c89a1c'; g.fillRect(12, 21 + hdy, 1, 3);
    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23 + hdy, { size: 7 });
    if (Q.B.water && Q.L.waterY !== undefined && P.y > Q.L.waterY * TS) txt(sv('Depth ', 'Độ sâu ') + depthM(P.y) + ' m', VW / 2, 8, { al: 'center', size: 6, col: '#bfeaff' });
    drawRareIc(78, 22 + hdy, 0.8); txt('x' + save.rare, 84, 23 + hdy, { size: 7, col: '#d8b8ff' }); txt(sv('B: bag/shop', 'B: túi đồ/shop'), 104, 23 + hdy, { size: 5, col: '#8892aa' });
    if (P.shield) { g.fillStyle = '#6ee7f2'; g.fillRect(12 + 3 * 11 + 6, 38 + hdy, 6, 7); g.fillStyle = '#fff'; g.fillRect(12 + 3 * 11 + 8, 40 + hdy, 2, 3); }
    const sh = save.shards[Q.li] || [0, 0, 0], ss = getSprite('shard');
    for (let i = 0; i < 3; i++) { if (sh[i]) drawSpr(g, ss, 12 + i * 11, 42 + hdy, false); else { g.globalAlpha = 0.35; drawSpr(g, ss, 12 + i * 11, 42 + hdy, false, true); g.globalAlpha = 1; } }
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
      txt(LN(b.cfg.name) + (b.forms ? '  [' + (b.fi + 1) + '/' + b.forms.length + ']' : '') + (b.cfg.armor > 0 ? '   [' + Math.round(b.cfg.armor * 100) + '% ' + (save.lang === 'vi' ? 'giáp' : 'armor') + ']' : ''), VW / 2, y + 14, { al: 'center', size: 8 });
    }
    drawGearHUD();
    if (Q.msgT > 0 && Q.msg && Q.state === 'play') txt(Q.msg, VW / 2, VH - 14, { al: 'center', size: 7, alpha: Math.min(1, Q.msgT) });
  }

  function drawPlay() {
    const L = Q.L;
    g.save();
    const sh = Q.shake > 0 ? Q.shake * 8 : 0;
    if (sh > 0) g.translate(Math.round(rr(-sh, sh)), Math.round(rr(-sh, sh)));
    { const z = Q.zoom || 1; if (z !== 1) { VW = BVW / z; VH = BVH / z; g.save(); g.scale(z, z); }
      try { drawWorld(); drawFog(); drawLighting(); drawCreepEyes(Math.round(Q.cam.x), Math.round(Q.cam.y)); drawWeather(); drawGrade(); drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y)); if (Q.G.tsT > 0) drawTimeStop(); }
      finally { if (z !== 1) { g.restore(); VW = BVW; VH = BVH; } } }
    g.restore();
    if (Q.state !== 'talk') drawHUD();
    if (coop && Q.state !== 'talk') drawCoopHUD();
    const st = Q.state;
    if (st === 'intro') {
      const a = Q.stateT < 0.4 ? Q.stateT / 0.4 : (Q.stateT > 2.1 ? Math.max(0, (2.6 - Q.stateT) / 0.5) : 1);
      g.globalAlpha = 0.55 * a; g.fillStyle = '#000'; g.fillRect(0, 70, VW, 66); g.globalAlpha = 1;
      txt((save.lang === 'vi' ? 'MÀN ' : 'LEVEL ') + (LPOS(Q.li) + 1), VW / 2, 88, { al: 'center', size: 8, col: '#ffd34e', alpha: a });
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
      for (let i = 0; i < 10; i++) { const ic = icon('r' + LORDER[i]); g.globalAlpha = save.relics[LORDER[i]] ? 1 : 0.2; g.drawImage(ic.c, VW / 2 - 10 * 10 + i * 20 + 2, 172); }
      g.globalAlpha = 1;
    } else if (st === 'talk') {
      const tk = Q.talk, ln0 = tk.lines[tk.i] || {}, who = ln0.w || tk.it.who, cur = (ln0.w && NPCS[ln0.w]) || tk.npc, sp = cur.hero ? getSprite('hero_idle', HERO[cur.hero].sw, 0) : (cur.spr ? npcSpr(cur.spr) : null);
      const col = who.indexOf('h_') === 0 && HERO[who.slice(2)] ? HERO_CLS[HERO[who.slice(2)].cls].col : who.indexOf('boss') === 0 ? '#ff7a7a' : (SPEAKER_COL[who] || '#ffd34e');
      if (tk.cine) { const k = Math.min(1, Q.stateT * 3); g.fillStyle = '#000'; g.fillRect(0, 0, VW, Math.round(20 * k)); g.fillRect(0, VH - Math.round(5 * k), VW, 5); }
      const X = 6, Y = 145, W = VW - 12, H = 64, box = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); };
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(X + 3, Y + 3, W, H);
      { const gr = g.createLinearGradient(0, Y, 0, Y + H); gr.addColorStop(0, 'rgba(30,24,54,.97)'); gr.addColorStop(1, 'rgba(10,8,22,.97)'); g.fillStyle = gr; g.fillRect(X, Y, W, H); }
      g.fillStyle = hexA(col, 0.08); g.fillRect(X + 2, Y + 2, W - 4, 10);
      box(X, Y, W, H, '#c89a1c'); box(X + 2, Y + 2, W - 4, H - 4, hexA(col, 0.55));
      for (const [cx, cy] of [[X, Y], [X + W - 1, Y], [X, Y + H - 1], [X + W - 1, Y + H - 1]]) { g.fillStyle = '#ffd34e'; g.fillRect(cx - 1, cy, 3, 1); g.fillRect(cx, cy - 1, 1, 3); }
      let tx = X + 12;
      if (sp) {
        const PX = X + 6, PY = Y + 6, PW = 48, PH = H - 12;
        g.fillStyle = '#120e22'; g.fillRect(PX, PY, PW, PH);
        { const gr = g.createRadialGradient(PX + PW / 2, PY + PH * 0.6, 2, PX + PW / 2, PY + PH * 0.6, 34); gr.addColorStop(0, hexA(col, 0.35)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(PX, PY, PW, PH); }
        g.save(); g.beginPath(); g.rect(PX, PY, PW, PH); g.clip();
        const sc = Math.min(2.5, (PH - 4) / sp.h, (PW - 4) / sp.w); if (cur.hero) drawHeroAt(cur.hero, PX + PW / 2, PY + PH + 6, 1, Math.floor(Q.t * 3) % 2, 2.4); else drawSpr(g, sp, PX + PW / 2, PY + PH - 1, false, false, sc, sc);
        g.restore();
        box(PX - 1, PY - 1, PW + 2, PH + 2, col); box(PX - 2, PY - 2, PW + 4, PH + 4, '#5a4210');
        tx = PX + PW + 10;
      }
      { const name = LN(cur.name), nw = Math.round(name.length * 4.4) + 14; g.fillStyle = '#120e22'; g.fillRect(tx - 6, Y - 7, nw, 12); box(tx - 6, Y - 7, nw, 12, col); txt(name, tx, Y - 1, { size: 7, col, bold: true }); }
      const line = ln0[save.lang] || '', n = Math.floor(tk.t * 45);
      wrapText(line.substr(0, n), sp ? 56 : 70).forEach((l, i) => txt(l, tx, Y + 15 + i * 11, { size: 7, col: who === 'narr' ? '#d8dcf0' : '#fff' }));
      if (n >= line.length) { const bob = Math.round(Math.sin(Q.stateT * 8 + Q.t * 8) * 1.5); g.fillStyle = col; g.beginPath(); g.moveTo(X + W - 16, Y + H - 12 + bob); g.lineTo(X + W - 8, Y + H - 12 + bob); g.lineTo(X + W - 12, Y + H - 7 + bob); g.fill(); }
      if (tk.lines.length > 1) txt((tk.i + 1) + '/' + tk.lines.length, X + W - 22, Y + 6, { size: 5, col: '#8892aa', al: 'right' });
      if (coop) drawTalkWait();
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
      g.save(); g.translate(VW / 2 + 36, 92); g.rotate(-0.5 + Math.sin(Q.stateT * 2) * 0.1); g.scale(3, 3); g.drawImage(lk.c, -lk.w / 2, -lk.h / 2); g.restore(); g.globalAlpha = 1;
      drawSpr(g, npcSpr('npc_lyra'), VW / 2 - 62, 126 + Math.round(Math.sin(Q.stateT * 3)), false, false, 3, 3, a);
      for (let i = 0; i < 10; i++) { const an = Q.stateT * 1.5 + i * 0.63, rd = 50 + Math.sin(Q.stateT * 3 + i) * 8; g.fillStyle = i % 2 ? '#c8ffd8' : '#6ee7b0'; g.fillRect(Math.round(VW / 2 + Math.cos(an) * rd), Math.round(96 + Math.sin(an) * rd * 0.6), 2, 2); }
      txt(T('leekT'), VW / 2, 38, { al: 'center', size: 13, bold: true, col: '#a4ffc0', alpha: a });
      txt(LN(LYRA_NAME) + ' - ' + (save.lang === 'vi' ? 'Kiếm Hành Lá' : 'Leek Blade'), VW / 2, 150, { al: 'center', size: 9, bold: true, alpha: a });
      wrapText(T('leekD'), 60).forEach((l, i) => txt(l, VW / 2, 166 + i * 10, { al: 'center', size: 7, col: '#a4e86b', alpha: a }));
      { const ps = petSprite('leekpet'); drawSpr(g, ps, VW / 2 + 70, 196, false, false, 2, 2, a);
        txt(sv('+ Leek Armor (stun 3s)  + Flying Leek (ride & heal)', '+ Giáp Hành Lá (choáng 3s)  + Cây Hành Bay (cưỡi, hồi máu)'), VW / 2 - 20, 193, { al: 'center', size: 6, col: '#ffd34e', alpha: a }); }
      if (Q.stateT > 0.8) txt(T('cont2'), VW / 2, 212, { al: 'center', size: 7, alpha: 0.6 + 0.4 * Math.sin(Q.stateT * 5) });
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
      if (Q.bonusGold) txt('+' + Q.bonusGold + ' ' + sv('gold for clearing the level!', 'vàng thưởng qua màn!'), VW / 2, 99, { al: 'center', size: 6, col: '#ffd34e', alpha: a });
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

  // ============================== SHOP / INVENTORY SCENE ==============================
  // TEST MODE: top-up gives free gems so you can try the economy. For release, replace topUp() with a real
  // payment (Steam microtransactions via your server) and set TOPUP_TEST = false.
  const TOPUP_TEST = true;
  SHOP_SHOW_STORY = false; // the Leek Blade is Lyra's gift: rescue her on map 1 (set true to list it in the shop)
  const SHOP_FREE = true; // the weapon shop is FREE for everyone (set false to charge gold/gems)
  const TOPUP_PACKS = [{ gems: 60, vnd: '20.000đ', usd: '$0.99' }, { gems: 330, vnd: '99.000đ', usd: '$4.99' }, { gems: 700, vnd: '199.000đ', usd: '$9.99' }, { gems: 1500, vnd: '399.000đ', usd: '$19.99' }, { gems: 4000, vnd: '999.000đ', usd: '$49.99' }];
  const TOPUP_ENABLED = false; // no real-money payments are connected, so the Top-up tab is hidden
  const SH_TABS = [['hero', { en: 'Heroes', vi: 'Nhân vật' }], ['sword', { en: 'Swords', vi: 'Kiếm' }], ['armor', { en: 'Armor', vi: 'Giáp' }], ['pet', { en: 'Pets', vi: 'Thú cưng' }], ['wpn', { en: 'Weapons', vi: 'Vũ khí' }], ['gun', { en: 'Guns', vi: 'Súng' }], ['trade', { en: 'Star Gems', vi: 'Đổi Ngọc' }], ['bag', { en: 'Inventory', vi: 'Kho đồ' }], ['topup', { en: 'Top-up', vi: 'Nạp' }]].filter(t => t[0] !== 'topup' || TOPUP_ENABLED);
  const TYPE_NAME = { sword: { en: 'Sword', vi: 'Kiếm' }, armor: { en: 'Armor', vi: 'Giáp' }, pet: { en: 'Pet', vi: 'Thú cưng' }, wpn: { en: 'Special weapon', vi: 'Vũ khí đặc biệt' }, gun: { en: 'Gun', vi: 'Súng' } };
  const sv = (en, vi) => save.lang === 'vi' ? vi : en;
  let shopRank = 0;   // 0 = every rank, 1..9 = SSS..F
  let shopTab = 0, shopIdx = 0, shopFrom = 'title', shopCard = null, shopMsg = '', shopMsgT = 0, shopBad = false;
  const owned = id => save.inv.own.indexOf(id) >= 0;
  const isEq = it => it.type === 'armor' ? save.inv.armor === it.id : (it.type === 'pet' ? save.inv.pet === it.id : save.inv.w.indexOf(it.id) >= 0);
  function shopItems() { const l0 = shopItems0(), t0 = SH_TABS[shopTab][0]; return shopRank > 0 && t0 !== 'topup' && t0 !== 'trade' && t0 !== 'hero' ? l0.filter(it => rankOf(it) === RANKS[shopRank - 1]) : l0; }
  function setRank(r) { shopRank = (r + RANKS.length + 1) % (RANKS.length + 1); shopIdx = 0; Snd.play('select'); }
  function shopItems0() {
    const t = SH_TABS[shopTab][0];
    if (t === 'bag') { const ord = { sword: 0, wpn: 1, armor: 2, pet: 3 }; return save.inv.own.map(id => ITEM[id]).filter(Boolean).sort((a, b) => ord[a.type] - ord[b.type] || a.tier - b.tier); }
    if (t === 'topup') return TOPUP_PACKS;
    if (t === 'trade') return TRADES;
    if (t === 'hero') return HEROES;
    return shopList(t);
  }
  // the bag and shop can be opened in the middle of a level (B / I); the level waits (in co-op the world keeps going)
  let shopHeldQ = null;
  function openShopInGame(tab) {
    shopFrom = 'play'; shopHeldQ = Q; shopCard = null; shopIdx = 0; scene = 'shop'; sceneT = 0; clearPressed();
    if (tab) { const i = SH_TABS.findIndex(t => t[0] === tab); if (i >= 0) shopTab = i; }
    if (coop && coop.role === 'client') NET.send({ t: 'i' });
  }
  function shopBack() {
    Q = shopHeldQ || Q; shopHeldQ = null; scene = 'play'; clearPressed();
    if (Q && Q.P) { Q.P.sw = null; if (Q.P.hero) { Q.P.mhp = Math.max(2, baseHP() + HERO[Q.P.hero].hp); Q.P.hp = Math.min(Q.P.hp, Q.P.mhp); } }
    if (coop && coop.role === 'client') NET.send({ t: 'inv', inv: { w: save.inv.w.slice(), armor: save.inv.armor } });
  }
  // ---- Star Gem trades ----
  const TRADES = [
    { id: 'ammo', cost: 2, name: { en: 'Supply crate', vi: 'Thùng tiếp tế' }, desc: { en: '+10 daggers, +5 bombs, +5 flasks.', vi: '+10 dao, +5 bom, +5 bình lửa.' }, give() { save.ammo.dagger += 10; save.ammo.bomb += 5; save.ammo.flask += 5; } },
    { id: 'gold', cost: 2, name: { en: 'Pouch of gold', vi: 'Túi vàng' }, desc: { en: '+500 gold.', vi: '+500 vàng.' }, give() { save.coins += 500; } },
    { id: 'heart', cost: 5, max: 5, have: () => save.bonusHP, name: { en: 'Heart crystal', vi: 'Pha lê trái tim' }, desc: { en: '+1 max heart forever (up to 5).', vi: '+1 tim tối đa vĩnh viễn (tối đa 5).' }, give() { save.bonusHP++; if (Q && Q.P) Q.P.hp++; } },
    { id: 'dmg', cost: 8, max: 3, have: () => save.bonusDmg, name: { en: 'Whetstone of dawn', vi: 'Đá mài bình minh' }, desc: { en: '+1 damage on every attack forever (up to 3).', vi: '+1 sát thương mọi đòn đánh vĩnh viễn (tối đa 3).' }, give() { save.bonusDmg++; } },
    { id: 'aura', cost: 6, max: 1, have: () => save.cos.aura ? 1 : 0, name: { en: 'Golden glow', vi: 'Hào quang vàng' }, desc: { en: 'Ember shines with a golden aura (looks only).', vi: 'Ember tỏa hào quang vàng (trang trí).' }, give() { save.cos.aura = 1; } },
    { id: 'wings', cost: 9, max: 1, have: () => save.cos.wings ? 1 : 0, name: { en: 'Dragon wings', vi: 'Cánh rồng' }, desc: { en: 'Ember grows a pair of dragon wings (looks only).', vi: 'Ember mọc đôi cánh rồng (trang trí).' }, give() { save.cos.wings = 1; } }
  ];
  HEROES.filter(h => h.secret).forEach(h => TRADES.push({ id: 'hero_' + h.id, cost: 10, max: 1, hero: h.id, have: () => save.heroUnlock.indexOf(h.id) >= 0 ? 1 : 0, name: { en: 'Secret hero: ' + h.name.en, vi: 'Hero bí mật: ' + h.name.vi }, desc: { en: 'Unlock ' + h.name.en + ' for online co-op.', vi: 'Mở khóa ' + h.name.vi + ' để chơi co-op online.' }, give() { save.heroUnlock.push(h.id); } }));
  function doTrade(o) {
    if (o.max && o.have() >= o.max) { shopSay(sv('You already have this.', 'Bạn đã có món này rồi.'), true); return; }
    if (save.rare < o.cost) { shopSay(sv('Not enough Star Gems (', 'Chưa đủ Ngọc Sao (') + save.rare + '/' + o.cost + ')', true); return; }
    save.rare -= o.cost; o.give(); writeSave(); Snd.play('relic'); shopSay(sv('Traded: ', 'Đã đổi: ') + LN(o.name));
  }
  function drawRareIc(x, y, sc) {
    sc = sc || 1; g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(sc, sc);
    g.fillStyle = '#14121f'; g.fillRect(-4, -1, 9, 3); g.fillRect(-3, -3, 7, 7); g.fillRect(-1, -5, 3, 11);
    g.fillStyle = '#8e4be0'; g.fillRect(-3, -1, 7, 3); g.fillRect(-2, -3, 5, 7); g.fillRect(0, -4, 1, 9);
    g.fillStyle = '#c07bff'; g.fillRect(-2, -2, 3, 3); g.fillStyle = '#6ee7f2'; g.fillRect(1, 1, 2, 2); g.fillStyle = '#fff'; g.fillRect(-1, -2, 1, 1);
    g.restore();
  }
  function shopSay(s, bad) { shopMsg = s; shopMsgT = 2.6; shopBad = !!bad; Snd.play(bad ? 'hurt' : 'ok'); }
  function setTab(i) { shopTab = (i + SH_TABS.length) % SH_TABS.length; shopIdx = 0; shopCard = null; Snd.play('select'); }
  function grantLyraGifts() {
    const iv = save.inv; for (const id of ['leekarmor', 'leekpet']) if (iv.own.indexOf(id) < 0) iv.own.push(id);
    if (!iv.armor) iv.armor = 'leekarmor'; if (!iv.pet) iv.pet = 'leekpet';
  }
  function grantLeek() {
    const iv = save.inv; if (iv.own.indexOf('leek') < 0) iv.own.push('leek');
    if (iv.w.indexOf('leek') < 0) { if (iv.w[0] && ITEM[iv.w[0]].type === 'sword') iv.w[0] = 'leek'; else iv.w[1] = 'leek'; }
  }
  function equipItem(it, slot) {
    const iv = save.inv;
    if (it.type === 'armor') iv.armor = it.id;
    else if (it.type === 'pet') iv.pet = it.id;
    else {
      const w = iv.w.slice(), other = 1 - slot; if (w[other] === it.id) w[other] = null; w[slot] = it.id;
      if (!w.some(id => id && ITEM[id].type === 'sword')) { shopSay(sv('You must keep at least one sword equipped.', 'Phải giữ ít nhất một thanh kiếm.'), true); return false; }
      iv.w = w;
    }
    writeSave(); return true;
  }
  function unequipItem(it) {
    const iv = save.inv;
    if (it.type === 'armor') iv.armor = null; else if (it.type === 'pet') iv.pet = null;
    else { const w = iv.w.slice(), i = w.indexOf(it.id); if (i >= 0) w[i] = null; if (!w.some(id => id && ITEM[id].type === 'sword')) { shopSay(sv('You must keep at least one sword equipped.', 'Phải giữ ít nhất một thanh kiếm.'), true); return false; } iv.w = w; }
    writeSave(); return true;
  }
  function howTo(it) {
    const cd = it.st.cd ? it.st.cd + 's' : '';
    if (it.type === 'sword') return sv('Equip it in weapon slot 1 or 2. J / left-click swings the weapon in hand; T switches between weapon 1 and 2. Hold Down in mid-air to bounce off enemies.', 'Trang bị vào ô vũ khí 1 hoặc 2. J / chuột trái đánh bằng vũ khí đang cầm; T đổi qua lại vũ khí 1 và 2. Giữ Xuống khi đang nhảy để nảy lên đầu quái.');
    if (it.type === 'wpn') return sv('Equip it in weapon slot 1 or 2, hold it with T, then press J / left-click to use it. Hold Up or Down to aim. Cooldown: ' + cd + '.', 'Trang bị vào ô vũ khí 1 hoặc 2, bấm T để cầm, rồi bấm J / chuột trái để dùng. Giữ Lên hoặc Xuống để ngắm. Hồi chiêu: ' + cd + '.');
    if (it.type === 'gun') return sv('Equip it in weapon slot 1 or 2, hold it with T, then HOLD J to keep firing. Hold Up or Down to aim. Magazine: ' + it.st.mag + ' rounds, reload ' + it.st.reload + 's.', 'Trang bị vào ô vũ khí 1 hoặc 2, bấm T để cầm, rồi GIỮ J để bắn liên tục. Giữ Lên/Xuống để ngắm. Băng đạn ' + it.st.mag + ' viên, nạp lại ' + it.st.reload + ' giây.');
    if (it.type === 'armor') return sv('Passive. Just equip it - the armor protects you automatically in every level.', 'Bị động. Chỉ cần trang bị - giáp tự bảo vệ bạn ở mọi màn chơi.');
    return sv('Passive. Equip it and your pet follows you and helps all by itself.', 'Bị động. Trang bị xong, thú cưng tự đi theo và giúp bạn chiến đấu.');
  }
  function cardOpts() {
    const it = shopCard.it, o = [];
    if (!owned(it.id)) { o.push({ k: 'gold' }); if (!SHOP_FREE) o.push({ k: 'gems' }); }
    else if (it.type === 'armor' || it.type === 'pet') o.push({ k: isEq(it) ? 'uneq' : 'eq' });
    else { o.push({ k: 'slot0' }); o.push({ k: 'slot1' }); if (isEq(it)) o.push({ k: 'uneq' }); }
    o.push({ k: 'close' }); return o;
  }
  function optLabel(o, it) {
    switch (o.k) {
      case 'gold': return SHOP_FREE ? sv('Get it FREE!', 'Lấy MIỄN PHÍ!') : sv('Buy ' + it.gold + ' gold', 'Mua ' + it.gold + ' vàng');
      case 'gems': return sv('Buy ' + it.gems + ' gems', 'Mua ' + it.gems + ' gem');
      case 'eq': return sv('Equip', 'Trang bị');
      case 'slot0': return sv('Weapon 1', 'Vũ khí 1') + (save.inv.w[0] === it.id ? ' *' : '');
      case 'slot1': return sv('Weapon 2', 'Vũ khí 2') + (save.inv.w[1] === it.id ? ' *' : '');
      case 'uneq': return sv('Unequip', 'Tháo ra');
      default: return sv('Close', 'Đóng');
    }
  }
  function cardAct(o) {
    const it = shopCard.it, iv = save.inv;
    if (o.k === 'close') { shopCard = null; Snd.play('select'); return; }
    if (o.k === 'gold' || o.k === 'gems') {
      if (owned(it.id)) return;
      if (o.k === 'gold') { if (!SHOP_FREE && save.coins < it.gold) { shopSay(sv('Not enough gold! Collect more coins in the levels.', 'Không đủ vàng! Hãy nhặt thêm xu trong màn chơi.'), true); return; } if (!SHOP_FREE) save.coins -= it.gold; }
      else { if (iv.gems < it.gems) { shopSay(sv('Not enough gems! Open the Top-up tab.', 'Không đủ gem! Vào mục Nạp.'), true); return; } iv.gems -= it.gems; }
      iv.own.push(it.id); writeSave(); Snd.play('relic'); shopSay(sv('Purchased! Now equip it.', 'Đã mua! Hãy trang bị nó.')); shopCard.opt = 0; return;
    }
    if (o.k === 'uneq') { if (unequipItem(it)) { Snd.play('select'); shopCard.opt = 0; } return; }
    const slot = o.k === 'slot1' ? 1 : 0;
    if (equipItem(it, slot)) { shopSay(sv('Equipped!', 'Đã trang bị!')); Snd.play('ok'); shopCard = null; }
  }
  function topUp(p) {
    if (TOPUP_TEST) { save.inv.gems += p.gems; writeSave(); Snd.play('relic'); shopSay(sv('TEST MODE: +' + p.gems + ' gems (free - no real money charged)', 'CHẾ ĐỘ TEST: +' + p.gems + ' gem (miễn phí - không trừ tiền thật)')); return; }
    shopSay(sv('Payments are not connected yet.', 'Chưa kết nối thanh toán.'), true);
  }
  function updateShopScene(dt) {
    sceneT += dt; if (shopMsgT > 0) shopMsgT -= dt;
    if (shopCard) {
      const o = cardOpts(), n = o.length;
      if (shopCard.opt >= n) shopCard.opt = 0;
      if (act.leftP) { shopCard.opt = (shopCard.opt + n - 1) % n; Snd.play('select'); }
      if (act.rightP) { shopCard.opt = (shopCard.opt + 1) % n; Snd.play('select'); }
      if (act.backP || act.pauseP) { shopCard = null; Snd.play('select'); return; }
      if (act.okP) cardAct(o[shopCard.opt]);
      return;
    }
    if (pressed.BracketLeft || pressed.Comma) setRank(shopRank - 1); if (pressed.BracketRight || pressed.Period) setRank(shopRank + 1);
    const list = shopItems(), n = list.length, t = SH_TABS[shopTab][0];
    if (act.swapP) setTab(shopTab - 1);
    if (pressed.KeyE || pressed.Tab) setTab(shopTab + 1);
    const mv = d => { const ni = clamp(shopIdx + d, 0, n - 1); if (ni !== shopIdx) { shopIdx = ni; Snd.play('select'); } };
    if (t === 'topup' || t === 'trade') { if (act.upP) mv(-1); if (act.downP) mv(1); }
    else { if (act.leftP) mv(-1); if (act.rightP) mv(1); if (act.upP) mv(-5); if (act.downP) mv(5); }
    shopIdx = clamp(shopIdx, 0, Math.max(0, n - 1));
    if (act.okP) {
      if (t === 'topup') topUp(list[shopIdx]);
      else if (t === 'trade') { if (list[shopIdx]) doTrade(list[shopIdx]); }
      else if (t === 'hero') { if (list[shopIdx]) pickHero(list[shopIdx]); }
      else if (list[shopIdx]) { shopCard = { it: list[shopIdx], opt: 0 }; Snd.play('ok'); }
    }
    if (act.backP || act.pauseP) { Snd.play('select'); if (shopFrom === 'play') shopBack(); else toScene(shopFrom); }
  }
  const SH_GX = 12, SH_GY = 33, SH_STEP = 34;
  function shopMouse(gx, gy, click) {
    if (shopCard) {
      const o = cardOpts(), n = o.length;
      for (let i = 0; i < n; i++) if (near(gx, gy, VW / 2 + (i - (n - 1) / 2) * 84, 192, 39, 8)) { if (shopCard.opt !== i) { shopCard.opt = i; Snd.play('select'); } if (click) pressed.Enter = true; return; }
      if (click && !near(gx, gy, VW / 2, 106, 168, 100)) pressed.Escape = true;
      return;
    }
    for (let i = 0; i < SH_TABS.length; i++) if (near(gx, gy, 6 + i * Math.floor(372 / SH_TABS.length) + (Math.floor(372 / SH_TABS.length) - 2) / 2, 13, (Math.floor(372 / SH_TABS.length) - 2) / 2, 8)) { if (click && i !== shopTab) setTab(i); return; }
    if (click && near(gx, gy, VW - 20, VH - 7, 20, 6)) { pressed.Escape = true; return; }
    const t = SH_TABS[shopTab][0], list = shopItems();
    if (t === 'trade') {
      for (let i = 0; i < list.length; i++) if (near(gx, gy, VW / 2, 60 + i * 13, VW / 2 - 8, 6)) { if (shopIdx !== i) { shopIdx = i; Snd.play('select'); } if (click) doTrade(list[i]); return; }
      return;
    } else if (t === 'topup') {
      for (let i = 0; i < list.length; i++) if (near(gx, gy, VW / 2, 42 + i * 24, 170, 11)) { if (shopIdx !== i) { shopIdx = i; Snd.play('select'); } if (click) pressed.Enter = true; return; }
      return;
    }
    if (t !== 'hero') for (let i = 0; i <= RANKS.length; i++) if (near(gx, gy, 12 + i * 31 + 14, 25, 15, 4)) { if (click && i !== shopRank) setRank(i); return; }
    const page = Math.floor(shopIdx / 15);
    for (let k = 0; k < 15; k++) {
      const idx = page * 15 + k; if (idx >= list.length) break;
      if (near(gx, gy, SH_GX + (k % 5) * SH_STEP + 15, SH_GY + Math.floor(k / 5) * SH_STEP + 15, 16, 16)) { if (shopIdx !== idx) { shopIdx = idx; Snd.play('select'); } if (click) pressed.Enter = true; return; }
    }
  }
  function drawCoinIc(x, y) { disc(g, x, y, 3, '#c89a1c'); disc(g, x, y, 2, '#ffd34e'); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, y - 1, 1, 1); }
  function drawGemIc(x, y) { g.fillStyle = '#2c9ab8'; g.fillRect(x - 1, y - 3, 3, 1); g.fillRect(x - 3, y - 2, 7, 2); g.fillRect(x - 2, y, 5, 1); g.fillRect(x - 1, y + 1, 3, 1); g.fillRect(x, y + 2, 1, 1); g.fillStyle = '#9ff0ff'; g.fillRect(x - 2, y - 2, 2, 1); g.fillRect(x - 1, y - 3, 1, 1); }
  function drawEqBox(it, x, y, label) {
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, 26, 26);
    if (it) { g.drawImage(itemIcon(it.id).c, x, y); iconFx(x, y, 26, 26, it.rar); } else { g.fillStyle = '#434d6e'; g.fillRect(x, y, 26, 1); g.fillRect(x, y + 25, 26, 1); g.fillRect(x, y, 1, 26); g.fillRect(x + 25, y, 1, 26); }
    txt(label, x + 13, y - 5, { al: 'center', size: 5, col: '#8892aa' });
  }
  // pick the hero you play as (single player and co-op); secret heroes are unlocked with Star Gems
  function pickHero(h) {
    if (heroLocked(h)) { shopSay(sv('Locked: trade 10 Star Gems in the Star Gems tab.', 'Đang khóa: đổi 10 Ngọc Sao ở mục Đổi Ngọc.'), true); return; }
    save.hero = h.id; writeSave(); Snd.play('relic');
    const P = (shopHeldQ || Q) && (shopHeldQ || Q).P; if (P && !coop) { const keepQ = Q; Q = shopHeldQ || Q; setHero(P, h.id); P.hp = Math.min(P.hp, maxHP()); Q = keepQ; }
    if (coop && coop.role === 'client') NET.send({ t: 'hero', id: h.id });
    shopSay(sv('You now play as ', 'Bạn đang chơi bằng ') + LN(h.name) + '!');
  }
  function drawHeroTab(list) {
    const page = Math.floor(shopIdx / 15), pages = Math.max(1, Math.ceil(list.length / 15)), cur = myHero();
    txt(sv('Choose your hero', 'Chọn nhân vật'), 12, 27, { size: 6.5, bold: true, col: '#ffd34e' });
    for (let k = 0; k < 15; k++) {
      const idx = page * 15 + k; if (idx >= list.length) break;
      const h = list[idx], x = SH_GX + (k % 5) * SH_STEP, y = SH_GY + Math.floor(k / 5) * SH_STEP, on = idx === shopIdx, lock = heroLocked(h), cls = HERO_CLS[h.cls];
      g.fillStyle = on ? 'rgba(255,211,78,.16)' : 'rgba(255,255,255,.05)'; g.fillRect(x + 1, y + 1, 28, 28);
      g.fillStyle = cls.col; g.fillRect(x + 1, y + 28, 28, 1);
      g.globalAlpha = lock ? 0.35 : 1; drawHeroAt(h.id, x + 15, y + 27, 1, on ? Math.floor(sceneT * 3) % 2 : 0, 1); g.globalAlpha = 1;
      if (lock) { g.fillStyle = '#14121f'; g.fillRect(x + 11, y + 12, 9, 7); g.fillStyle = '#c07bff'; g.fillRect(x + 12, y + 13, 7, 5); g.fillRect(x + 13, y + 9, 1, 4); g.fillRect(x + 17, y + 9, 1, 4); g.fillRect(x + 13, y + 9, 5, 1); }
      if (h.id === cur) { g.fillStyle = '#5fcf5a'; g.fillRect(x + 21, y + 3, 6, 6); g.fillStyle = '#14121f'; g.fillRect(x + 22, y + 6, 1, 1); g.fillRect(x + 23, y + 7, 1, 1); g.fillRect(x + 24, y + 4, 1, 3); }
      if (on) { g.fillStyle = '#ffd34e'; g.fillRect(x, y, 30, 1); g.fillRect(x, y + 29, 30, 1); g.fillRect(x, y, 1, 30); g.fillRect(x + 29, y, 1, 30); }
    }
    if (pages > 1) txt(sv('Page ', 'Trang ') + (page + 1) + '/' + pages, SH_GX + 80, SH_GY + 3 * SH_STEP + 4, { al: 'center', size: 5.5, col: '#8892aa' });
    const h = list[shopIdx]; if (!h) return;
    const cls = HERO_CLS[h.cls], lock = heroLocked(h);
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(186, 31, 188, 150); g.fillStyle = cls.col; g.fillRect(186, 28, 188, 1);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(192, 36, 56, 64);
    g.globalAlpha = lock ? 0.4 : 1; drawHeroAt(h.id, 220, 96, 1, Math.floor(sceneT * 3) % 2, 2.6); g.globalAlpha = 1;
    txt(LN(h.name), 254, 42, { size: 9, bold: true, col: '#ffffff' });
    txt(LN(cls), 254, 54, { size: 6.5, bold: true, col: cls.col });
    const st = (v, pct) => (v > 0 ? '+' : '') + (pct ? Math.round(v * 100) + '%' : v);
    txt(sv('Hearts ', 'Máu ') + st(h.hp || 0) + '   ' + sv('Speed ', 'Tốc độ ') + st(h.spd || 0, 1) + '   ' + sv('Damage ', 'Sát thương ') + st(h.dmg || 0), 254, 66, { size: 5.8, col: '#a4e86b' });
    txt(lock ? sv('Locked - 10 Star Gems', 'Đang khóa - 10 Ngọc Sao') : (h.id === cur ? sv('Playing now', 'Đang dùng') : sv('Enter: play as this hero', 'Enter: chọn nhân vật này')), 254, 80, { size: 6.5, bold: true, col: lock ? '#c07bff' : (h.id === cur ? '#5fcf5a' : '#ffd34e') });
    txt(sv('Skill (R): ', 'Kỹ năng (R): ') + LN(h.sk.n), 192, 112, { size: 6.5, bold: true, col: h.sk.col || '#ffd34e' });
    wrapText(LN(SKILL_DESC[h.sk.k] || { en: '', vi: '' }) + sv('  Cooldown ', '  Hồi chiêu ') + h.sk.cd + 's.', 46).slice(0, 4).forEach((l, i) => txt(l, 192, 124 + i * 8, { size: 5.8, col: '#e8eaf5' }));
    txt(sv('Your hero is used in every map and in online co-op.', 'Nhân vật được dùng ở mọi map và cả co-op online.'), 192, 170, { size: 5.5, col: '#8892aa' });
  }
  function drawShop() {
    const nTx = texts.length;
    g.fillStyle = '#0c0a1c'; g.fillRect(0, 0, VW, VH);
    { const r = mulberry32(5); for (let i = 0; i < 46; i++) { g.fillStyle = r() < 0.2 ? '#6a5a9a' : '#241d44'; g.fillRect((r() * VW) | 0, (r() * VH) | 0, 1 + (r() * 2 | 0), 1); } }
    SH_TABS.forEach((t, i) => {
      const TW = Math.floor(372 / SH_TABS.length), x = 6 + i * TW, on = i === shopTab;
      g.fillStyle = on ? '#2a2548' : '#151230'; g.fillRect(x, 6, TW - 2, 15); g.fillStyle = on ? '#ffd34e' : '#434d6e'; g.fillRect(x, 6, TW - 2, 1); g.fillRect(x, 20, TW - 2, 1);
      txt(LN(t[1]), x + (TW - 2) / 2, 14, { al: 'center', size: 6.5, col: on ? '#ffd34e' : '#8892aa', bold: on });
    });
    const t = SH_TABS[shopTab][0], list = shopItems();
    if (t === 'trade') {
      g.drawImage(npcSpr('npc_trader').c, 8, 26); drawRareIc(40, 34, 1.3);
      txt(sv('Star Gems: ', 'Ngọc Sao: ') + save.rare, 48, 35, { size: 8, bold: true, col: '#d8b8ff' });
      txt(sv('"Shiny gems for shiny rewards, friend. 4 hide in every land - look up high!"', '"Ngọc sáng đổi quà xịn nhé bạn. Mỗi vùng giấu 4 viên - nhìn lên chỗ cao!"'), 48, 45, { size: 5.5, col: '#cfd6e6' });
      list.forEach((o, i) => {
        const y = 60 + i * 13, on = i === shopIdx, full = o.max && o.have() >= o.max;
        g.fillStyle = on ? 'rgba(192,123,255,.2)' : 'rgba(255,255,255,.04)'; g.fillRect(8, y - 6, VW - 16, 12);
        if (on) { g.fillStyle = '#c07bff'; g.fillRect(8, y - 6, VW - 16, 1); g.fillRect(8, y + 5, VW - 16, 1); }
        if (o.hero) drawHeroAt(o.hero, 18, y + 6, 1, 0, 0.5);
        txt(LN(o.name), 28, y + 2, { size: 6.5, bold: on, col: full ? '#5fcf5a' : '#fff' });
        txt(full ? sv('owned', 'đã có') : (o.max > 1 ? o.have() + '/' + o.max : ''), 250, y + 2, { size: 6, col: full ? '#5fcf5a' : '#8892aa' });
        drawRareIc(VW - 40, y, 0.8); txt(String(o.cost), VW - 34, y + 2, { size: 6.5, col: save.rare >= o.cost ? '#d8b8ff' : '#ff7a7a' });
      });
      const o = list[shopIdx]; if (o) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 186, VW, 12); txt(LN(o.desc) + sv('   Enter: trade', '   Enter: đổi'), VW / 2, 193, { al: 'center', size: 6, col: '#e8eaf5' }); }
    } else if (t === 'hero') {
      drawHeroTab(list);
    } else if (t === 'topup') {
      txt(sv('Top-up gems', 'Nạp gem'), VW / 2, 31, { al: 'center', size: 7, col: '#cfd6e6' });
      list.forEach((p, i) => {
        const y = 42 + i * 24, on = i === shopIdx;
        g.fillStyle = on ? 'rgba(255,211,78,.16)' : 'rgba(255,255,255,.05)'; g.fillRect(VW / 2 - 170, y - 10, 340, 21);
        if (on) { g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 170, y - 10, 340, 1); g.fillRect(VW / 2 - 170, y + 10, 340, 1); }
        drawGemIc(VW / 2 - 150, y); txt('+' + p.gems + ' gem', VW / 2 - 138, y, { size: 8, bold: true, col: '#9ff0ff' });
        txt(save.lang === 'vi' ? p.vnd + '  (' + p.usd + ')' : p.usd + '  (' + p.vnd + ')', VW / 2 + 160, y, { al: 'right', size: 7, col: '#cfd6e6' });
      });
      txt(TOPUP_TEST ? sv('TEST MODE: top-up is free and charges no real money. Connect a real payment before release.', 'CHẾ ĐỘ TEST: nạp miễn phí, không trừ tiền thật. Cần nối cổng thanh toán thật trước khi phát hành.') : '', VW / 2, 170, { al: 'center', size: 5.5, col: '#ff9a8a' });
      drawGemIc(VW / 2 - 52, 186); txt(sv('Gems: ', 'Gem: ') + save.inv.gems, VW / 2 - 44, 186, { size: 8, col: '#9ff0ff' });
      drawCoinIc(VW / 2 + 28, 186); txt(String(save.coins), VW / 2 + 36, 186, { size: 8, col: '#ffd34e' });
    } else {
      for (let i = 0; i <= RANKS.length; i++) {   // the rank row: ALL, SSS, SS, S, A, B, C, D, E, F
        const rk = i ? RANKS[i - 1] : null, cx = 12 + i * 31, on = i === shopRank, col = rk ? RANK_COL[rk] : '#cfd6e6';
        g.fillStyle = on ? hexA(col, 0.35) : 'rgba(255,255,255,.05)'; g.fillRect(cx, 22, 29, 8); g.fillStyle = on ? col : '#2a2548'; g.fillRect(cx, 22, 29, 1); g.fillRect(cx, 29, 29, 1);
        txt(rk || sv('ALL', 'TẤT CẢ'), cx + 14.5, 26, { al: 'center', size: 6, bold: true, col: on ? '#fff' : (rk ? col : '#8892aa') });
      }
      const page = Math.floor(shopIdx / 15), pages = Math.max(1, Math.ceil(list.length / 15));
      for (let k = 0; k < 15; k++) {
        const idx = page * 15 + k; if (idx >= list.length) break;
        const it = list[idx], x = SH_GX + (k % 5) * SH_STEP, y = SH_GY + Math.floor(k / 5) * SH_STEP, on = idx === shopIdx;
        g.drawImage(itemIcon(it.id).c, x + 2, y + 2); iconFx(x + 2, y + 2, 26, 26, it.rar);
        { const rk = rankOf(it); g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x + 2, y + 2, rk.length * 4 + 3, 8); txt(rk, x + 3.5, y + 6.2, { size: 5.5, bold: true, col: RANK_COL[rk] }); }
        if (owned(it.id)) { g.fillStyle = '#5fcf5a'; g.fillRect(x + 21, y + 3, 5, 5); g.fillStyle = '#14121f'; g.fillRect(x + 22, y + 5, 1, 2); g.fillRect(x + 23, y + 6, 1, 1); g.fillRect(x + 24, y + 4, 1, 2); }
        if (isEq(it)) txt('E', x + 25, y + 26, { al: 'right', size: 6, col: '#ffd34e', bold: true });
        if (on) { g.fillStyle = '#ffd34e'; g.fillRect(x, y, 30, 1); g.fillRect(x, y + 29, 30, 1); g.fillRect(x, y, 1, 30); g.fillRect(x + 29, y, 1, 30); }
      }
      if (pages > 1) txt(sv('Page ', 'Trang ') + (page + 1) + '/' + pages, SH_GX + 80, SH_GY + 3 * SH_STEP + 4, { al: 'center', size: 5.5, col: '#8892aa' });
      const it = list[shopIdx];
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(186, 31, 188, 105);
      if (it) {
        const col = RARITY_COL[it.rar];
        g.fillStyle = col; g.fillRect(186, 28, 188, 1);
        g.drawImage(itemIcon(it.id).c, 192, 34, 52, 52); iconFx(192, 34, 52, 52, it.rar);
        txt(LN(it.name), 250, 40, { size: 8, bold: true, col });
        txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 250, 52, { size: 5.5, col });
        { const rk = rankOf(it); txt(sv('RANK', 'HẠNG'), 366, 38, { al: 'right', size: 5, col: '#8892aa' }); txt(rk, 366, 51, { al: 'right', size: 13, bold: true, col: RANK_COL[rk] }); }
        if (owned(it.id)) txt(isEq(it) ? sv('Equipped', 'Đang trang bị') : sv('Owned', 'Đã sở hữu'), 250, 64, { size: 6.5, col: '#a4e86b' });
        else if (SHOP_FREE) txt(sv('FREE (test build)', 'MIỄN PHÍ (bản test)'), 250, 65, { size: 7, col: '#a4e86b', bold: true });
        else { drawCoinIc(253, 65); txt(String(it.gold), 259, 65, { size: 7, col: '#ffd34e' }); drawGemIc(300, 65); txt(String(it.gems), 306, 65, { size: 7, col: '#9ff0ff' }); }
        wrapText(LN(it.desc), 46).slice(0, 7).forEach((l, i) => txt(l, 192, 96 + i * 8, { size: 5.8, col: '#e8eaf5' }));
        txt(sv('Enter: details / buy', 'Enter: xem chi tiết / mua'), 280, 130, { al: 'center', size: 5, col: '#8892aa' });
      }
      // equipment strip
      const ex = 12, ey = 156;
      drawEqBox(eqIt(0), ex, ey, sv('Slot 1', 'Ô 1')); drawEqBox(eqIt(1), ex + 34, ey, sv('Slot 2', 'Ô 2')); drawEqBox(armorIt(), ex + 76, ey, sv('Armor', 'Giáp')); drawEqBox(petIt(), ex + 110, ey, sv('Pet', 'Thú cưng'));
      drawCoinIc(186, 164); txt(sv('Gold: ', 'Vàng: ') + save.coins, 193, 164, { size: 7, col: '#ffd34e' });
      drawGemIc(186, 178); txt(sv('Gems: ', 'Gem: ') + save.inv.gems, 193, 178, { size: 7, col: '#9ff0ff' });
      txt(sv('HP ', 'Máu ') + maxHP() + '   ' + sv('DMG ', 'Sát thương ') + swordDmg(), 270, 164, { size: 6, col: '#a4e86b' });
    }
    txt(sv('Arrows: move   Enter: select   Q/E: tabs   [ ]: rank   Esc: back', 'Mũi tên: chọn   Enter: chọn mua   Q/E: đổi mục   [ ]: hạng   Esc: thoát'), 8, VH - 7, { size: 5.5, col: '#8892aa' });
    txt(sv('[ BACK ]', '[ THOÁT ]'), VW - 8, VH - 7, { al: 'right', size: 6, col: '#cfd6e6' });
    if (shopCard) { texts.length = nTx; drawShopCard(); }
    if (shopMsgT > 0) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, 198, VW, 11); txt(shopMsg, VW / 2, 203.5, { al: 'center', size: 6.5, col: shopBad ? '#ff9a8a' : '#a4e86b', alpha: Math.min(1, shopMsgT * 2) }); }
  }
  function drawShopCard() {
    const it = shopCard.it, col = RARITY_COL[it.rar], has = owned(it.id), o = cardOpts();
    g.fillStyle = 'rgba(3,2,10,.85)'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#12102a'; g.fillRect(24, 8, 336, 200); g.fillStyle = col; g.fillRect(24, 8, 336, 1); g.fillRect(24, 207, 336, 1); g.fillRect(24, 8, 1, 200); g.fillRect(359, 8, 1, 200);
    g.drawImage(itemIcon(it.id).c, 34, 18, 52, 52); iconFx(34, 18, 52, 52, it.rar);
    txt(LN(it.name), 96, 26, { size: 10, bold: true, col });
    txt(LN(RARITY_NAME[it.rar]) + ' · ' + LN(TYPE_NAME[it.type]), 96, 40, { size: 6, col });
    { const rk = rankOf(it); g.fillStyle = hexA(RANK_COL[rk], 0.2); g.fillRect(300, 16, 52, 34); g.fillStyle = RANK_COL[rk]; g.fillRect(300, 16, 52, 1); g.fillRect(300, 49, 52, 1); txt(sv('RANK', 'HẠNG'), 326, 24, { al: 'center', size: 5, col: '#cfd6e6' }); txt(rk, 326, 41, { al: 'center', size: 15, bold: true, col: RANK_COL[rk] }); }
    if (has) txt(isEq(it) ? sv('Equipped', 'Đang trang bị') : sv('Owned', 'Đã sở hữu'), 96, 54, { size: 7, col: '#a4e86b' });
    else if (SHOP_FREE) txt(sv('FREE (test build)', 'MIỄN PHÍ (bản test)'), 96, 55, { size: 7, col: '#a4e86b', bold: true });
    else { drawCoinIc(99, 55); txt(it.gold + sv(' gold', ' vàng'), 106, 55, { size: 7, col: save.coins >= it.gold ? '#ffd34e' : '#ff9a8a' }); drawGemIc(172, 55); txt(it.gems + ' gem', 179, 55, { size: 7, col: save.inv.gems >= it.gems ? '#9ff0ff' : '#ff9a8a' }); }
    txt(sv('What it does', 'Công dụng'), 34, 80, { size: 6.5, col: '#ffd34e', bold: true });
    wrapText(LN(it.desc), 76).slice(0, 4).forEach((l, i) => txt(l, 34, 91 + i * 9, { size: 6.2 }));
    txt(sv('How to use', 'Cách dùng'), 34, 131, { size: 6.5, col: '#6ee7f2', bold: true });
    wrapText(howTo(it), 76).slice(0, 4).forEach((l, i) => txt(l, 34, 142 + i * 9, { size: 6.2, col: '#cfd6e6' }));
    txt(sv('Gold: ', 'Vàng: ') + save.coins + '    ' + sv('Gems: ', 'Gem: ') + save.inv.gems, VW / 2, 178, { al: 'center', size: 6, col: '#8892aa' });
    o.forEach((op, i) => {
      const cx = VW / 2 + (i - (o.length - 1) / 2) * 84, on = i === shopCard.opt, bad = !SHOP_FREE && ((op.k === 'gold' && save.coins < it.gold) || (op.k === 'gems' && save.inv.gems < it.gems));
      g.fillStyle = on ? 'rgba(255,211,78,.22)' : 'rgba(255,255,255,.06)'; g.fillRect(cx - 38, 184, 76, 16);
      g.fillStyle = on ? '#ffd34e' : '#434d6e'; g.fillRect(cx - 38, 184, 76, 1); g.fillRect(cx - 38, 199, 76, 1);
      txt(optLabel(op, it), cx, 192, { al: 'center', size: 6.2, col: bad ? '#ff9a8a' : (on ? '#ffd34e' : '#e8eaf5'), bold: on });
    });
  }

  // ============================== RIDE HOME (after map 1): Ember carries Lyra on a horse ==============================
  const RIDE = [
    { w: 'narr', en: 'King Slime melts into the grass. The cage is empty at last, and the meadow is silent in a way that is almost peaceful.', vi: 'Vua Slime tan chảy vào bãi cỏ. Chiếc lồng cuối cùng cũng trống, và đồng cỏ yên lặng đến mức gần như bình yên.' },
    { w: 'narr', en: 'Ember whistles. A brown mare trots out of the hills, one of the few animals that never ran from the dark. He lifts Lyra onto the saddle and climbs up in front of her.', vi: 'Ember huýt sáo. Một con ngựa nâu chạy ra từ đồi, một trong số ít con vật không bỏ chạy trước bóng tối. Cậu đỡ Lyra lên yên rồi leo lên phía trước.' },
    { w: 'lyra', heart: 1, en: 'You... you do not have to take me all the way, Ember. I can walk. (She holds on to his cloak anyway.)', vi: 'Bạn... bạn không cần đưa mình đi tận nơi đâu, Ember. Mình tự đi được mà. (Nói vậy nhưng cô vẫn nắm chặt áo choàng của cậu.)' },
    { w: 'ember', en: 'You are shaking, Princess. The road is full of shadows. Hold on tight.', vi: 'Công chúa đang run kìa. Đường này đầy bóng tối. Cứ nắm chặt vào nhé.' },
    { w: 'narr', en: 'Lyra rests her cheek against his back. She has sung for kings and crowds, but she has never felt this: a heartbeat so loud it drowns out every song.', vi: 'Lyra áp má vào lưng cậu. Cô từng hát trước vua chúa và đám đông, nhưng chưa bao giờ cảm thấy điều này: một nhịp tim lớn đến mức át cả mọi bài ca.' },
    { w: 'lyra', heart: 1, en: '(whispering to herself) Please... do not let him hear mine...', vi: '(thì thầm với chính mình) Xin đừng... để cậu ấy nghe thấy tim mình...' },
    { w: 'lyra', en: 'Ember, why did you walk all the way into that meadow for a stranger?', vi: 'Ember, tại sao bạn lại đi tận vào đồng cỏ đó vì một người xa lạ?' },
    { w: 'ember', en: 'Because someone was singing in the dark. Somebody had to answer.', vi: 'Vì có người đang hát trong bóng tối. Phải có ai đó đáp lại chứ.' },
    { w: 'lyra', heart: 1, en: 'That is... the kindest thing anyone has ever said to me. I... I think I... (She stops.) ...I think the stars are lovely tonight.', vi: 'Đó là... lời tử tế nhất mà ai đó từng nói với mình. Mình... mình nghĩ là mình... (Cô khựng lại.) ...Mình nghĩ đêm nay sao đẹp quá.' },
    { w: 'ember', en: '(half smiling, not sure) The stars? ...Right. Yeah. Lovely. (He knows she was about to say something else. He is not sure he is allowed to hope.)', vi: '(nửa cười, nửa ngờ) Sao á? ...Ừ. Ừ, đẹp thật. (Cậu biết cô định nói điều khác. Cậu không chắc mình có được phép hy vọng hay không.)' },
    { w: 'lyra', heart: 1, en: 'If I told you something silly, would you believe me?', vi: 'Nếu mình nói một điều ngốc nghếch, bạn có tin không?' },
    { w: 'ember', en: 'Depends. Silly like "slimes can learn to dance"? Or silly like "something I should be careful with"?', vi: 'Còn tùy. Ngốc kiểu "slime biết nhảy múa"? Hay ngốc kiểu "thứ mà mình nên cẩn thận"?' },
    { w: 'lyra', heart: 1, en: 'Silly like a song. I will sing it for you when the Sun is back. Then you can decide whether to believe it.', vi: 'Ngốc như một bài hát. Mình sẽ hát cho bạn nghe khi Mặt Trời trở lại. Lúc đó bạn hãy quyết định có tin hay không.' },
    { w: 'narr', en: 'The hoofbeats fade into the dusk. Ember does not answer. But for the first time since the Sun fell, his lantern burns a little warmer.', vi: 'Tiếng vó ngựa tan vào hoàng hôn. Ember không đáp. Nhưng lần đầu tiên kể từ khi Mặt Trời rơi, chiếc đèn của cậu cháy ấm hơn một chút.' }
  ];
  let ride = null;
  function horseSprite(fr) {
    const k = 'horse' + fr; if (_cache[k]) return _cache[k];
    const B = '#9a6a3b', D = '#5a3a22', L = '#c8964a';
    return (_cache[k] = paint(48, 36, P => {
      P.ell(22, 17, 16, 8, B); P.ell(22, 21, 12, 3, L); P.ell(22, 14, 14, 3, '#b07a44');
      P.tri(32, 12, 41, 1, 40, 19, B); P.ell(42, 6, 5, 4, B); P.rect(44, 6, 5, 4, L); P.px(47, 7, D); P.px(41, 4, 'k'); P.tri(38, 3, 40, -1 + 1, 42, 3, D);
      P.line(36, 5, 30, 14, D, 3); P.line(35, 3, 29, 9, D, 2);
      P.line(7, 13, 1, 22, D, 3); P.line(8, 14, 3, 25, D, 2);
      if (fr === 0) { P.line(30, 22, 38, 30, B, 3); P.line(27, 22, 24, 32, B, 3); P.line(12, 22, 5, 30, B, 3); P.line(16, 22, 21, 32, B, 3); P.rect(37, 30, 3, 2, D); P.rect(23, 32, 3, 2, D); P.rect(3, 30, 3, 2, D); P.rect(20, 32, 3, 2, D); }
      else { P.line(30, 22, 33, 30, B, 3); P.line(27, 22, 35, 28, B, 3); P.line(12, 22, 16, 31, B, 3); P.line(16, 22, 11, 29, B, 3); P.rect(32, 30, 3, 2, D); P.rect(34, 28, 3, 2, D); P.rect(15, 31, 3, 2, D); P.rect(10, 29, 3, 2, D); }
      P.rect(16, 9, 12, 4, 'r'); P.rect(16, 13, 12, 2, 'y'); P.rect(17, 15, 2, 5, D);
    }));
  }
  function startRide() { ride = { i: 0, lt: 0, t: 0 }; Q = null; Snd.music('title', TITLE_MUSIC); }
  function endRide() { save.ride = 1; writeSave(); cutLevel = 0; mapSel = 1; cutSkip = true; toScene('cutscene'); }
  function updateRide(dt) {
    const c = ride; c.t += dt; c.lt += dt;
    const ln = RIDE[c.i], tx = ln[save.lang], n0 = Math.floor((c.lt - dt) * 40), n1 = Math.min(tx.length, Math.floor(c.lt * 40)), v = ln.w === 'lyra' ? 'lyra' : null;
    if (v) for (let k = n0 + 1; k <= n1; k++) if (k % 3 === 0 && /\S/.test(tx[k - 1] || ' ')) Snd.blip(v);
    if (act.okP) { if (c.lt * 40 < tx.length) c.lt = 999; else { c.i++; c.lt = 0; if (c.i >= RIDE.length) { endRide(); c.i = RIDE.length - 1; c.lt = 999; } } }
    if (act.backP) endRide();
  }
  function drawRide() {
    const c = ride, t = c.t, k = Math.min(1, c.i / (RIDE.length - 1));
    const gy = drawBgOnly(0, t * 70, t);
    // sunset wash that deepens as the ride goes on
    g.fillStyle = 'rgba(255,120,40,' + (0.18 + 0.2 * k) + ')'; g.fillRect(0, 0, VW, VH); g.fillStyle = 'rgba(40,10,60,' + (0.1 + 0.4 * k) + ')'; g.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 30; i++) { const sx = (i * 61 + 13) % VW, sy = (i * 29) % 70; g.globalAlpha = k * 0.9; g.fillStyle = '#fff'; g.fillRect(sx, sy, 1, 1); } g.globalAlpha = 1;
    const fr = Math.floor(t * 9) % 2, bob = Math.round(Math.abs(Math.sin(t * 9)) * 2), hx = 150;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(hx - 22, gy - 1, 50, 2);
    drawSpr(g, horseSprite(fr), hx, gy - bob, false);
    drawSpr(g, npcSpr('npc_lyra'), hx - 8, gy - 17 - bob + Math.round(Math.sin(t * 9 + 1)), false);
    drawSpr(g, getSprite('hero_idle', {}, 0), hx + 2, gy - 15 - bob, false);
    // dust
    for (let i = 0; i < 6; i++) { const u = (t * 2 + i / 6) % 1; g.globalAlpha = (1 - u) * 0.5; g.fillStyle = '#d9c9a0'; g.fillRect(Math.round(hx - 24 - u * 34), Math.round(gy - 2 - u * 6), 3 - Math.round(u * 2), 3 - Math.round(u * 2)); } g.globalAlpha = 1;
    const ln = RIDE[c.i], sp = CS[ln.w], tx = ln[save.lang], n = Math.floor(c.lt * 40);
    if (ln.heart) for (let i = 0; i < 4; i++) { const u = (c.lt * 0.6 + i / 4) % 1, hxp = hx - 8 + Math.sin(u * 6 + i) * 10, hyp = gy - 44 - u * 34; g.globalAlpha = 1 - u; g.fillStyle = '#ff5a8a'; g.fillRect(Math.round(hxp), Math.round(hyp), 2, 2); g.fillRect(Math.round(hxp) + 3, Math.round(hyp), 2, 2); g.fillRect(Math.round(hxp) - 1, Math.round(hyp) + 1, 7, 2); g.fillRect(Math.round(hxp), Math.round(hyp) + 3, 5, 1); g.fillRect(Math.round(hxp) + 1, Math.round(hyp) + 4, 3, 1); } g.globalAlpha = 1;
    g.fillStyle = 'rgba(0,0,0,.84)'; g.fillRect(8, 156, VW - 16, 54); g.fillStyle = sp.col; g.fillRect(8, 156, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
    txt(LN(sp.n), 18, 165, { size: 8, col: sp.col, bold: true });
    wrapText(tx.substr(0, n), 66).forEach((l, i) => txt(l, 18, 177 + i * 10, { size: 7 }));
    if (n >= tx.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(t * 8) });
  }

  // ============================== CASTLE CUTSCENE (after map 2): the king, the crowd and a surprise gift ==============================
  const CS = { narr: { n: { en: 'Story', vi: 'Kể chuyện' }, col: '#cfd6e6', v: null }, king: { n: { en: 'King Aurelius', vi: 'Vua Aurelius' }, col: '#ffd34e', v: 'bram' }, lyra: { n: { en: 'Princess Lyra', vi: 'Công chúa Lyra' }, col: '#6ee7f2', v: 'lyra' }, ember: { n: { en: 'Ember', vi: 'Ember' }, col: '#ff9a4a', v: null }, crowd: { n: { en: 'The crowd', vi: 'Đám đông' }, col: '#ffffff', v: 'lila' } };
  const CASTLE = [
    { w: 'narr', en: 'Through the forest and out of the dark, Ember leads Princess Lyra home. At last the white towers of Castle Aurelia rise above the trees.', vi: 'Xuyên qua khu rừng và bóng tối, Ember đưa công chúa Lyra trở về. Cuối cùng, những tòa tháp trắng của Lâu đài Aurelia hiện lên trên ngọn cây.' },
    { w: 'narr', en: 'The gates fly open. The bells ring for the first time since the Sun fell. The whole kingdom pours into the courtyard.', vi: 'Cổng thành bật mở. Chuông ngân lên lần đầu tiên kể từ khi Mặt Trời rơi. Cả vương quốc đổ ra sân lâu đài.' },
    { w: 'crowd', cheer: 1, en: 'The princess is alive! LONG LIVE LYRA! LONG LIVE THE LANTERNBEARER!', vi: 'Công chúa còn sống! CÔNG CHÚA LYRA MUÔN NĂM! NGƯỜI MANG ĐÈN MUÔN NĂM!' },
    { w: 'king', en: 'Lyra! My little songbird! ...I thought the shadow had taken you from me forever.', vi: 'Lyra! Chim non bé bỏng của cha! ...Cha tưởng bóng tối đã cướp con khỏi cha mãi mãi.' },
    { w: 'lyra', en: 'Father, it was Ember. He fought through the meadow and the forest with only a lantern and a rusty sword. He never once turned back.', vi: 'Cha ơi, là Ember. Cậu ấy đã chiến đấu xuyên đồng cỏ và khu rừng chỉ với một chiếc đèn và thanh kiếm gỉ. Cậu ấy không một lần quay lại.' },
    { w: 'king', en: 'Young Ember... the whole kingdom owes you its tears and its laughter. And yet I must ask a heavier thing of you.', vi: 'Chàng trai Ember... cả vương quốc nợ cậu nước mắt và tiếng cười. Vậy mà ta vẫn phải nhờ cậu một việc nặng nề hơn.' },
    { w: 'king', en: 'Quoc\'s guardians sit upon the fragments of the Sun: in caverns, deserts, frozen peaks, fire and shadow. You alone carry a light they fear. Will you defeat them, and let the world be at peace?', vi: 'Thuộc hạ của Quoc trấn giữ các mảnh Mặt Trời: trong hang động, sa mạc, đỉnh băng, lửa và bóng tối. Chỉ mình cậu mang ánh sáng mà chúng sợ. Cậu có chịu đánh bại chúng, để thế giới được bình yên?' },
    { w: 'ember', en: '...I will. For Lila, for Lyra, and for everyone who still keeps a lantern lit.', vi: '...Cháu đồng ý. Vì Lila, vì Lyra, và vì tất cả những ai vẫn còn giữ một chiếc đèn sáng.' },
    { w: 'crowd', cheer: 1, en: 'EM-BER! EM-BER! EM-BER!', vi: 'EM-BER! EM-BER! EM-BER!' },
    { w: 'king', en: 'Then take this. My family has guarded it for a thousand years, waiting for a hero brave enough to ask for nothing in return.', vi: 'Vậy hãy nhận lấy. Gia tộc ta đã canh giữ nó suốt một ngàn năm, chờ một người anh hùng đủ dũng cảm để không đòi hỏi gì.' }
  ];
  const KISS = [
    { w: 'ember', en: 'Well... I should get going. The next fragment will not find itself.', vi: 'Thôi... mình nên đi đây. Mảnh vỡ tiếp theo sẽ không tự tìm đến đâu.' },
    { w: 'lyra', en: 'W-wait, brave knight! I... I have a gift for you too!', vi: 'Đ-đợi đã, hiệp sĩ dũng cảm! Mình... mình cũng có một món quà cho bạn!' },
    { w: 'narr', en: '(Lyra stands on tiptoe, and quickly kisses Ember on the cheek.)', vi: '(Lyra kiễng chân lên, và nhanh chóng hôn lên má Ember.)' },
    { w: 'lyra', en: 'T-thank you, for everything! Please... please come back safe!!', vi: 'C-cảm ơn bạn vì tất cả! Xin bạn... xin bạn hãy trở về an toàn!!' },
    { w: 'narr', en: '(Her face turns as red as a tomato. She covers it with both hands, and runs back into the castle.)', vi: '(Mặt cô đỏ như quả cà chua. Cô lấy hai tay che mặt và chạy thẳng vào lâu đài.)' },
    { w: 'ember', en: '...Huh? She... just... what... what was THAT?', vi: '...Hả? Cô ấy... vừa... gì... gì vậy trời?' },
    { w: 'ember', en: '...No. No time. Fragments to find. (He rubs his cheek, and tries very hard not to smile.)', vi: '...Không. Không có thời gian. Còn mảnh vỡ phải tìm. (Cậu xoa má, và cố hết sức để không mỉm cười.)' }
  ];
  let castle = null;
  function kingSprite() {
    if (_cache.king) return _cache.king;
    return (_cache.king = paint(24, 32, P => {
      P.rect(7, 2, 10, 4, 'y'); P.px(7, 1, 'y'); P.px(11, 0, 'y'); P.px(12, 0, 'y'); P.px(16, 1, 'y'); P.px(12, 3, 'r'); P.px(9, 3, 'c'); P.px(15, 3, 'c');
      P.rect(6, 6, 2, 7, 'w'); P.rect(16, 6, 2, 7, 'w'); P.ell(12, 9, 5, 4, 's'); P.px(10, 8, 'k'); P.px(14, 8, 'k'); P.rect(9, 11, 6, 1, 'w'); P.tri(8, 12, 16, 12, 12, 21, 'w');
      P.rect(5, 15, 14, 13, 'r'); P.rect(5, 15, 14, 2, 'w'); P.rect(11, 17, 2, 10, 'y'); P.rect(2, 16, 4, 9, 'r'); P.rect(18, 16, 4, 9, 'r'); P.rect(2, 25, 4, 2, 's'); P.rect(18, 25, 4, 2, 's');
      P.rect(5, 26, 14, 2, 'y'); P.rect(7, 28, 4, 3, 'N'); P.rect(13, 28, 4, 3, 'N');
    }));
  }
  function startCastle() { castle = { i: 0, lt: 0, t: 0, phase: 'talk', gt: 0, gave: false, lastBlip: 0 }; Q = null; Snd.music('title', TITLE_MUSIC); }
  function castleGift() {
    const iv = save.inv; castle.gave = true; save.castle = 1;
    if (iv.own.indexOf('bdragon') < 0) iv.own.push('bdragon');
    if (!iv.pet) iv.pet = 'bdragon';
    save.coins += 500; iv.gems += 20; writeSave(); Snd.play('relic'); Snd.hero('cheer');
  }
  function updateCastle(dt) {
    const c = castle; c.t += dt;
    if (c.phase === 'talk') {
      c.lt += dt; const ln = CASTLE[c.i], tx = ln[save.lang], n0 = Math.floor((c.lt - dt) * 40), n1 = Math.min(tx.length, Math.floor(c.lt * 40)), v = CS[ln.w].v;
      if (v) for (let k = n0 + 1; k <= n1; k++) if (k % 3 === 0 && /\S/.test(tx[k - 1] || ' ')) Snd.blip(v);
      if (act.okP) { if (c.lt * 40 < tx.length) c.lt = 999; else { c.i++; c.lt = 0; if (c.i >= CASTLE.length) { c.phase = 'gift'; c.gt = 0; Snd.play('gate'); } } }
      if (act.backP) { c.phase = 'gift'; c.gt = 0; }
    } else if (c.phase === 'kiss') {
      c.lt += dt; const ln = KISS[c.i], tx = ln[save.lang], v = CS[ln.w] ? CS[ln.w].v : null, n0 = Math.floor((c.lt - dt) * 40), n1 = Math.min(tx.length, Math.floor(c.lt * 40));
      if (v) for (let k = n0 + 1; k <= n1; k++) if (k % 3 === 0 && /\S/.test(tx[k - 1] || ' ')) Snd.blip(v);
      if (c.i === 2 && c.lt > 0.7 && !c.kissed) { c.kissed = true; Snd.play('heart'); Snd.hero('cheer'); }
      if (act.okP) { if (c.lt * 40 < tx.length) c.lt = 999; else { c.i++; c.lt = 0; if (c.i >= KISS.length) { c.phase = 'leave'; c.gt = 0; } } }
      if (act.backP) { c.phase = 'leave'; c.gt = 0; }
    } else if (c.phase === 'leave') {
      c.gt += dt; if (c.gt > 1.6) { cutLevel = 1; mapSel = 2; cutSkip = true; cutAlt = true; toScene('cutscene'); c.gt = -99; }
    } else {
      c.gt += dt;
      if (c.gt > 1.5 && c.gt < 1.6 && !c.s1) { c.s1 = 1; Snd.play('relic'); }
      if (c.gt > 4.4 && !c.gave) castleGift();
      if (act.backP) c.gt = Math.max(c.gt, 5.2);
      if (c.gt > 6 && act.okP) { c.phase = 'kiss'; c.i = 0; c.lt = 0; Snd.play('select'); }
    }
  }
  function drawCastle() {
    const c = castle, t = c.t;
    g.fillStyle = '#2a1f3d'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = '#3d2c55'; g.fillRect(0, 0, VW, 100);
    for (const wx of [70, 160, 224, 314]) { g.fillStyle = '#14101f'; g.fillRect(wx - 9, 22, 18, 52); g.fillStyle = '#ffd98a'; g.fillRect(wx - 7, 24, 14, 48); g.fillStyle = 'rgba(255,220,140,.12)'; g.beginPath(); g.moveTo(wx - 7, 72); g.lineTo(wx + 7, 72); g.lineTo(wx + 34, 122); g.lineTo(wx - 20, 122); g.fill(); g.fillStyle = '#14101f'; g.fillRect(wx - 1, 24, 2, 48); }
    for (const px of [24, 118, 266, 360]) { g.fillStyle = '#5a4a72'; g.fillRect(px - 7, 0, 14, 122); g.fillStyle = '#6e5e88'; g.fillRect(px - 7, 0, 3, 122); g.fillStyle = '#463a5c'; g.fillRect(px - 9, 114, 18, 8); }
    g.fillStyle = '#4a3a5e'; g.fillRect(0, 122, VW, 94); g.fillStyle = '#3a2d4c'; for (let x = 0; x < VW; x += 24) g.fillRect(x, 122, 1, 94);
    g.fillStyle = '#9a1c2c'; g.fillRect(VW / 2 - 28, 122, 56, 94); g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 28, 122, 2, 94); g.fillRect(VW / 2 + 26, 122, 2, 94);
    g.fillStyle = '#c89a1c'; g.fillRect(VW / 2 - 14, 66, 28, 56); g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 12, 68, 24, 52); g.fillStyle = '#9a1c2c'; g.fillRect(VW / 2 - 8, 88, 16, 32);
    const cheer = CASTLE[Math.min(c.i, CASTLE.length - 1)].cheer && c.phase === 'talk';
    const crowd = ['npc_lila', 'npc_bram', 'npc_angel', 'npc_lila', 'npc_bram', 'npc_angel'], xs = [34, 62, 92, 292, 322, 352];
    crowd.forEach((nm, i) => { const hop = cheer || c.phase === 'gift' ? Math.abs(Math.sin(t * 8 + i)) * 7 : Math.abs(Math.sin(t * 2 + i)) * 1; drawSpr(g, npcSpr(nm), xs[i], 144 - Math.round(hop) - (i % 2) * 5, i > 2); });
    drawSpr(g, kingSprite(), VW / 2, 124 + Math.round(Math.sin(t * 2) * 0.5), false, false, 1.3, 1.3);
    { let hx = 150, lx = 178, ly = 148 + Math.round(Math.sin(t * 3)), hxo = 0, show = true, hflip = false;
      if (c.phase === 'kiss' || c.phase === 'leave') {
        const i = c.phase === 'leave' ? 99 : c.i, k = Math.min(1, c.lt / 0.7);
        if (i === 2) lx = 178 - 20 * k; else if (i === 3) lx = 158; else if (i >= 4) { const run = i === 4 ? c.lt : 99; lx = 158 - run * 110; if (lx < 20) show = false; }
        if (i === 2 || i === 3) ly = 148 - (i === 2 ? Math.round(Math.sin(k * 3.14) * 4) : 0);
        if (i === 5 || i === 6) hxo = Math.round(Math.sin(t * 30) * 1);
        if (c.phase === 'leave') { hx = 150 + c.gt * 90; hflip = false; }
      }
      drawSpr(g, getSprite('hero_idle', {}, Math.floor(t * 3) % 2), hx + hxo, 148, hflip);
      if (show) drawSpr(g, npcSpr('npc_lyra_leek'), Math.round(lx), ly, (c.phase === 'kiss' && c.i >= 4) ? true : false);
      if (c.phase === 'kiss' && (c.i === 3 || (c.i === 2 && c.lt > 0.7))) for (let n = 0; n < 5; n++) { const u = ((c.lt * 0.8) + n / 5) % 1, hx2 = 156 + Math.sin(u * 6 + n) * 8, hy2 = 126 - u * 30; g.globalAlpha = 1 - u; g.fillStyle = '#ff5a8a'; g.fillRect(Math.round(hx2), Math.round(hy2), 2, 2); g.fillRect(Math.round(hx2) + 3, Math.round(hy2), 2, 2); g.fillRect(Math.round(hx2) - 1, Math.round(hy2) + 1, 7, 2); g.fillRect(Math.round(hx2), Math.round(hy2) + 3, 5, 1); g.fillRect(Math.round(hx2) + 1, Math.round(hy2) + 4, 3, 1); } g.globalAlpha = 1;
      if (c.phase === 'kiss' && (c.i === 5 || c.i === 6)) txt('?!', hx + 6, 118 + Math.round(Math.sin(t * 8)), { size: 9, bold: true, col: '#ffd34e' });
    }
    if (c.phase === 'talk') {
      const ln = CASTLE[c.i], sp = CS[ln.w], tx = ln[save.lang], n = Math.floor(c.lt * 40);
      g.fillStyle = 'rgba(0,0,0,.84)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
      txt(LN(sp.n), 18, 162, { size: 8, col: sp.col, bold: true });
      wrapText(tx.substr(0, n), 66).forEach((l, i) => txt(l, 18, 175 + i * 10, { size: 7, col: ln.cheer ? '#ffe9a0' : '#fff' }));
      if (n >= tx.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(t * 8) });
      return;
    }
    if (c.phase === 'kiss') {
      const ln = KISS[c.i], sp = CS[ln.w], tx = ln[save.lang], n = Math.floor(c.lt * 40);
      g.fillStyle = 'rgba(0,0,0,.84)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
      txt(LN(sp.n), 18, 162, { size: 8, col: sp.col, bold: true });
      wrapText(tx.substr(0, n), 66).forEach((l, i) => txt(l, 18, 175 + i * 10, { size: 7 }));
      if (n >= tx.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(t * 8) });
      return;
    }
    if (c.phase === 'leave') { g.fillStyle = 'rgba(0,0,0,' + Math.min(1, c.gt / 1.4) + ')'; g.fillRect(0, 0, VW, VH); return; }
    // ---- gift sequence ----
    const gt = c.gt;
    g.fillStyle = 'rgba(5,3,15,' + Math.min(0.7, gt * 0.6) + ')'; g.fillRect(0, 0, VW, VH);
    const cx = VW / 2, cy = 120;
    if (gt < 4.4) {
      const open = Math.min(1, Math.max(0, (gt - 0.6) / 0.9));
      g.fillStyle = '#7a4a22'; g.fillRect(cx - 18, cy + 4, 36, 18); g.fillStyle = '#ffd34e'; g.fillRect(cx - 18, cy + 4, 36, 3); g.fillRect(cx - 2, cy + 8, 4, 6);
      g.fillStyle = '#9a5a2a'; g.fillRect(cx - 18, cy - 10 - open * 8, 36, 14); g.fillStyle = '#ffd34e'; g.fillRect(cx - 18, cy - 10 - open * 8, 36, 2);
      if (open > 0) { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,230,140,' + 0.18 * open + ')'; const a = -1.57 + (i - 4) * 0.22; g.beginPath(); g.moveTo(cx, cy - 4); g.lineTo(cx + Math.cos(a - 0.08) * 150, cy - 4 + Math.sin(a - 0.08) * 150); g.lineTo(cx + Math.cos(a + 0.08) * 150, cy - 4 + Math.sin(a + 0.08) * 150); g.fill(); } g.globalCompositeOperation = 'source-over'; }
      const rise = Math.min(1, Math.max(0, (gt - 1.5) / 1.0)), ey = cy - 6 - rise * 28 + Math.sin(gt * 3) * 1.5, wob = gt > 2.5 ? Math.sin(gt * 22) * (gt - 2.5) * 1.4 : 0;
      if (gt > 1.5) {
        g.save(); g.translate(cx + wob, ey); g.rotate(wob * 0.03);
        g.fillStyle = '#14121f'; disc(g, 0, 0, 13, '#14121f'); disc(g, 0, 0, 12, '#ffd34e'); disc(g, -3, -3, 6, '#fff2b0');
        g.fillStyle = '#e0453a'; for (const [dx, dy] of [[-5, 4], [4, 2], [0, -7], [6, -3], [-7, -2]]) g.fillRect(dx, dy, 3, 2);
        if (gt > 3.4) { g.fillStyle = '#14121f'; g.fillRect(-6, -2, 5, 1); g.fillRect(-1, -1, 3, 1); g.fillRect(2, 0, 5, 1); g.fillRect(-2, 1, 1, 4); g.fillRect(-1, 5, 3, 1); }
        g.restore();
      }
      if (gt > 3.4) { g.globalAlpha = Math.min(0.7, (gt - 3.4) * 0.7); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      txt(sv('A mysterious golden egg...', 'Một quả trứng vàng bí ẩn...'), cx, 40, { al: 'center', size: 9, col: '#ffe9a0', alpha: Math.min(1, gt) });
    } else {
      const k = Math.min(1, (gt - 4.4) / 0.8), bob = Math.sin(gt * 6) * 3, sp = petSprite('bdragon');
      g.globalCompositeOperation = 'lighter'; for (let r = 60; r > 10; r -= 12) { g.globalAlpha = 0.05 * k; disc(g, cx, cy, r, '#ffd34e'); } g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      drawSpr(g, sp, cx, cy + 20 + Math.round(bob), false, false, 4, 4, k);
      for (let i = 0; i < 46; i++) { const px = (i * 53 + Math.sin(gt + i) * 12) % VW, py = ((gt - 4.4) * (40 + (i % 5) * 14) + i * 29) % VH; g.fillStyle = ['#ffd34e', '#ff7fb0', '#6ee7f2', '#a4e86b', '#fff'][i % 5]; g.fillRect(Math.round(px), Math.round(py), 2, 3); }
      txt(sv('SURPRISE! THE EGG HATCHES!', 'BẤT NGỜ! QUẢ TRỨNG NỞ RA!'), cx, 30, { al: 'center', size: 12, bold: true, col: '#ffd34e', alpha: k });
      txt(sv('Baby Dragon joins you as your pet!', 'Bé Rồng Lửa trở thành thú cưng của bạn!'), cx, 52, { al: 'center', size: 8, col: '#ff9a4a', alpha: k });
      txt(sv('Spits fireballs at monsters. Check it in the Shop > Inventory.', 'Phun cầu lửa vào quái. Xem trong Cửa hàng > Kho đồ.'), cx, 64, { al: 'center', size: 6, col: '#cfd6e6', alpha: k });
      txt('+500 ' + sv('gold', 'vàng') + '    +20 gem', cx, 168, { al: 'center', size: 9, bold: true, col: '#9ff0ff', alpha: k });
      txt(sv('"Go, Lanternbearer. The world is waiting." - King Aurelius', '"Đi đi, Người Mang Đèn. Thế giới đang chờ." - Vua Aurelius'), cx, 186, { al: 'center', size: 6.5, col: '#ffe9a0', alpha: k });
      if (gt > 6) txt(T('press'), cx, 204, { al: 'center', size: 6, col: '#8892aa', alpha: 0.5 + 0.5 * Math.sin(gt * 5) });
    }
  }

  // ============================== MENUS / SCENES ==============================
  let scene = 'title', titleSel = 0, storyPage = 0, storyT = 0, storyList = STORY, mapSel = 0, sceneT = 0;
  let fade = 0, fadeTo = null;
  function toScene(s) { fadeTo = s; fade = 0; }
  function enterScene(s) {
    scene = s; sceneT = 0;
    if (s === 'title') { Snd.music('title', TITLE_MUSIC); Q = null; titleSel = 0; title.confirmT = 0; }
    if (s === 'mstory') { scene = 'story'; storyPage = 0; storyT = 0; storyList = MAP_STORY[storyLevel]; Snd.music('title', TITLE_MUSIC); }
    if (s === 'story') { storyPage = 0; storyT = 0; storyList = STORY; Snd.music('title', TITLE_MUSIC); }
    if (s === 'ending') { storyPage = 0; storyT = 0; storyList = ENDING; Snd.music('title', TITLE_MUSIC); }
    if (s === 'map') { MAPHERO.x = -1; Snd.music('title', TITLE_MUSIC); Q = null; mapSel = Math.min(mapSel, maxPlayable()); }
    if (s === 'cutscene') startCut();
    if (s === 'opening') startOpening();
    if (s === 'intro' || s === 'outro') { startCine(s, s === 'intro' ? 'title' : 'credits', s === 'intro' && cnBoot); cnBoot = false; }
    if (s === 'credits') { cred = { t: 0 }; Snd.music('title', TITLE_MUSIC); }
    if (s !== 'play') Snd.ambience(null);
    if (s === 'coop') { Q = null; Snd.music('title', TITLE_MUSIC); }
    if (s === 'castle') startCastle();
    if (s === 'ride') startRide();
    if (s === 'shop') { Snd.music('title', TITLE_MUSIC); Q = null; shopCard = null; shopIdx = 0; }
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
    sceneT += dt; title.cam += dt * 70;
    const items = titleItems(), L = titleLayout(items); titleSel = clamp(titleSel, 0, items.length - 1);
    if (title.confirmT > 0) title.confirmT -= dt;
    const go = (dx, dy) => {   // nearest button in that direction
      const c = L[titleSel]; let best = -1, bd = 1e9;
      L.forEach((r, i) => { if (i === titleSel) return; const ex = (r.x + r.w / 2) - (c.x + c.w / 2), ey = (r.y + r.h / 2) - (c.y + c.h / 2);
        if (dx && Math.sign(ex) !== dx || dy && Math.sign(ey) !== dy || (dx && Math.abs(ex) < 4) || (dy && Math.abs(ey) < 4)) return;
        const d = dx ? Math.abs(ex) + Math.abs(ey) * 3 : Math.abs(ey) + Math.abs(ex) * 0.6; if (d < bd) { bd = d; best = i; } });
      if (best < 0 && dy) best = dy > 0 ? 0 : L.length - 1;   // wrap top/bottom
      if (best >= 0 && best !== titleSel) { titleSel = best; Snd.play('select'); }
    };
    if (act.upP) go(0, -1); if (act.downP) go(0, 1); if (act.leftP) go(-1, 0); if (act.rightP) go(1, 0);
    if (act.okP) {
      const it = items[titleSel];
      if (it.k === 'newgame' && (save.cleared.length || save.resume) && !(title.confirmT > 0)) { title.confirmT = 3; Snd.play('zap'); return; }
      title.confirmT = 0; Snd.play('ok'); it.fn();
    }
  }
  // title menu layout: the main action as a big card, the rest as a tidy 2-column grid
  const TM = { x: 214, y: 80, w: 164 };
  function titleLayout(items) {
    const L = [], x0 = TM.x + 6, cw = (TM.w - 12 - 4) / 2; let y = TM.y + 6;
    items.forEach((it, i) => {
      if (i === 0) { L.push({ x: x0, y, w: TM.w - 12, h: 24, primary: true }); y += 29; return; }
      const k = i - 1, rest = items.length - 1, col = k % 2, row = Math.floor(k / 2), lastOdd = rest % 2 === 1 && k === rest - 1;
      L.push({ x: lastOdd ? x0 : x0 + col * (cw + 4), y: y + row * 15, w: lastOdd ? TM.w - 12 : cw, h: 12 });
    });
    return L;
  }
  const TITLE_LBL = { cont: ['World map', 'Bản đồ thế giới'], shopT: ['Shop & bag', 'Cửa hàng'], coopT: ['Online co-op', 'Co-op online'], newgame: ['New game', 'Chơi mới'], full: ['Fullscreen', 'Toàn màn hình'], credits: ['Credits', 'Thực hiện bởi'], movie: ['Intro film', 'Phim mở đầu'], quit: ['Quit', 'Thoát'] };
  function titleLabel(it) {
    if (it.k === 'lang') return save.lang === 'vi' ? 'Tiếng Việt' : 'English';
    if (it.k === 'sound') return sv('Sound: ', 'Âm thanh: ') + (Snd.muted ? sv('Off', 'Tắt') : sv('On', 'Bật'));
    if (it.k === 'newgame' && title.confirmT > 0) return sv('Press again: erase!', 'Nhấn lần nữa: xóa!');
    const l = TITLE_LBL[it.k]; return l ? sv(l[0], l[1]) : T(it.k);
  }
  function titleItems() {
    const it = [];
    if (save.resume && BIOMES[save.resume.li]) it.push({ k: 'resume', fn: resumeLevel });
    else if (!save.cleared.length && !UNLOCK_ALL) it.push({ k: 'start', fn: () => it2.find(o => o.k === 'newgame').fn() });
    const it2 = it;
    if (save.cleared.length || UNLOCK_ALL) it.push({ k: 'cont', fn: () => { mapSel = UNLOCK_ALL ? 0 : maxPlayable(); toScene('map'); } });
    it.push({ k: 'shopT', fn: () => { shopFrom = 'title'; toScene('shop'); } });
    it.push({ k: 'coopT', fn: () => { coopUI.ph = 'menu'; coopUI.sel = 0; coopUI.msg = ''; toScene('coop'); } });
    it.push({ k: 'newgame', fn: () => { save.castle = 0; save.ride = 0; save.seen = {}; save.inv = { own: ['iron'], w: ['iron', null], armor: null, pet: null, gems: save.inv.gems | 0 }; save.cleared = []; save.shards = {}; save.coins = 0; save.leek = false; save.relics = [0, 0, 0, 0, 0, 0, 0]; save.ammo = { dagger: 0, bomb: 0, flask: 0 }; writeSave(); mapSel = 0; toScene('opening'); } });
    it.push({ k: 'lang', fn: () => { save.lang = save.lang === 'vi' ? 'en' : 'vi'; writeSave(); } });
    it.push({ k: 'sound', fn: () => { Snd.toggleMute(); } });
    it.push({ k: 'full', fn: toggleFull });
    it.push({ k: 'movie', fn: () => toScene('intro') });
    it.push({ k: 'credits', fn: () => toScene('credits') });
    it.push({ k: 'quit', fn: () => { try { window.close(); } catch (e) { } } });
    return it;
  }
  // ===================== NEW TITLE SCREEN AND WORLD MAP =====================
  const UIC = {};
  const fitTxt = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  function lanternIc(x, y, a) {
    a = a === undefined ? 1 : a; g.globalAlpha = a;
    g.fillStyle = '#2a1a10'; g.fillRect(x - 1, y - 7, 3, 1); g.fillRect(x - 3, y - 6, 7, 2);
    g.fillStyle = '#c89a1c'; g.fillRect(x - 3, y - 5, 7, 1);
    g.fillStyle = '#2a1a10'; g.fillRect(x - 3, y - 4, 1, 7); g.fillRect(x + 3, y - 4, 1, 7);
    g.fillStyle = '#ffd34e'; g.fillRect(x - 2, y - 4, 5, 7); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, y - 3, 3, 4); g.fillStyle = '#ffffff'; g.fillRect(x, y - 2, 1, 2);
    g.fillStyle = '#c89a1c'; g.fillRect(x - 3, y + 3, 7, 1); g.fillStyle = '#2a1a10'; g.fillRect(x - 2, y + 4, 5, 1);
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y - 1, 0, x, y - 1, 12); gr.addColorStop(0, 'rgba(255,190,80,.5)'); gr.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = gr; g.fillRect(x - 12, y - 13, 24, 24); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
  function titleArt() {
    if (UIC.t) return UIC.t;
    const T = {}, W = 768, GY = 170;
    { const [c, x] = mkCanvas(VW, VH), st = [[0, '#07041a'], [0.3, '#170a38'], [0.58, '#44165a'], [0.78, '#b83e5a'], [0.9, '#ff8a4a'], [1, '#ffcf80']];
      for (let y = 0; y <= GY; y++) { const t = y / GY; let i = 0; while (i < st.length - 2 && t > st[i + 1][0]) i++; const a = st[i], b = st[i + 1]; x.fillStyle = lerpColor(a[1], b[1], clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); x.fillRect(0, y, VW, 1); }
      x.fillStyle = '#0a0414'; x.fillRect(0, GY, VW, VH - GY); T.sky = c; }
    const ridge = (base, amp, col, rim, seed, extra) => {
      const [c, x] = mkCanvas(W, 130), q = mulberry32(seed), ph = [q() * 6, q() * 6, q() * 6, q() * 6];
      for (let px = 0; px < W; px++) { const y = Math.round(base + Math.sin(px / W * 6.2832 * 2 + ph[0]) * amp + Math.sin(px / W * 6.2832 * 5 + ph[1]) * amp * 0.5 + Math.sin(px / W * 6.2832 * 11 + ph[2]) * amp * 0.25); x.fillStyle = col; x.fillRect(px, y, 1, 130 - y); x.fillStyle = rim; x.fillRect(px, y, 1, 1); }
      if (extra) extra(x); return c;
    };
    T.m1 = ridge(34, 18, '#3a1a52', '#8a3a72', 11);
    T.m2 = ridge(40, 14, '#26103e', '#5a2a62', 22, x => {   // a ruined castle on the far ridge
      const q = mulberry32(5); x.fillStyle = '#1a0a2e';
      for (const [dx, w, h] of [[0, 16, 38], [20, 11, 26], [-18, 11, 30], [34, 9, 20], [-30, 8, 16]]) { x.fillRect(540 + dx, 44 - h, w, h + 10); for (let k = 0; k < w; k += 4) x.fillRect(540 + dx + k, 44 - h - 3, 2, 3); }
      x.fillStyle = '#1a0a2e'; for (const [dx, w] of [[0, 16], [-18, 11]]) for (let i = 0; i < 12; i++) { const hw = Math.round((1 - i / 12) * w / 2); x.fillRect(540 + dx + w / 2 - hw, 44 - 38 - 3 - i, hw * 2, 1); }
      x.fillStyle = '#ffb04a'; for (const [dx, y] of [[6, 18], [7, 28], [-14, 24], [23, 30], [36, 34]]) x.fillRect(540 + dx, y, 1, 2);
    });
    T.m3 = ridge(46, 10, '#150a24', '#3a1a48', 33);
    { const [c, x] = mkCanvas(W, 70), q2 = mulberry32(61); x.fillStyle = '#07030d';
      for (let i = 0; i < 26; i++) { const px = i * 30 + ((q2() * 14) | 0), h = 22 + ((q2() * 34) | 0), w = 10 + ((q2() * 8) | 0); x.fillRect(px - 1, 70 - 6, 3, 6); for (let k = 0; k < h; k++) { const hw = Math.round(k / h * w / 2); x.fillRect(px - hw, 70 - 6 - h + k, hw * 2 + 1, 1); } }
      T.trees = c; }
    // foreground pines on both sides
    { const [c, x] = mkCanvas(130, 120); const q = mulberry32(99); x.fillStyle = '#05020a';
      for (let i = 0; i < 9; i++) { const px = 6 + i * 13 + ((q() * 6) | 0), h = 40 + ((q() * 60) | 0), w = 12 + ((q() * 10) | 0); x.fillRect(px - 1, 120 - 14, 3, 14); for (let k = 0; k < h; k++) { const hw = Math.round(k / h * w / 2); x.fillRect(px - hw, 120 - 14 - h + k, hw * 2 + 1, 1); } }
      T.pines = c; }
    { const [c, x] = mkCanvas(VW, VH), v = x.createRadialGradient(VW / 2, VH * 0.5, VH * 0.3, VW / 2, VH * 0.5, VW * 0.65); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,0,8,.65)'); x.fillStyle = v; x.fillRect(0, 0, VW, VH); T.vig = c; }
    const q = mulberry32(2024); T.stars = []; for (let i = 0; i < 70; i++) T.stars.push({ x: (q() * VW) | 0, y: (q() * 110) | 0, s: q() < 0.15 ? 2 : 1, v: 1 + q() * 3, p: q() * 6, c: q() < 0.25 ? '#ffd8a0' : '#cfd6ff' });
    T.flies = []; for (let i = 0; i < 26; i++) T.flies.push({ x: q() * VW, y: GY - 8 - q() * 70, ph: q() * 6, sp: 0.3 + q() * 0.7, r: 6 + q() * 20 });
    T.embers = []; for (let i = 0; i < 24; i++) T.embers.push({ x: q() * VW, o: q() * 100, v: 8 + q() * 16, ph: q() * 6 });
    T.tufts = []; for (let x = 0; x < VW; x += 3) T.tufts.push({ x, h: 2 + ((q() * 5) | 0), p: q() * 6 });
    return (UIC.t = T);
  }
  function drawTitle() {
    const t = sceneT, A = titleArt(), GY = 170, cam = title.cam;
    g.drawImage(A.sky, 0, 0);
    for (const s of A.stars) { g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.v + s.p)); g.fillStyle = s.c; g.fillRect(s.x, s.y, s.s, s.s); } g.globalAlpha = 1;
    // the Eclipse: a black sun with a burning crescent and a slowly turning corona
    { const ex = 112, ey = 108;
      g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(ex, ey, 10, ex, ey, 86 + Math.sin(t * 1.3) * 4); cg.addColorStop(0, 'rgba(255,170,70,.55)'); cg.addColorStop(0.35, 'rgba(200,70,110,.22)'); cg.addColorStop(1, 'rgba(120,40,160,0)'); g.fillStyle = cg; g.fillRect(ex - 90, ey - 90, 180, 180);
      for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832 + t * 0.05, l = 30 + (i % 3) * 12 + Math.sin(t * 2 + i) * 4; g.strokeStyle = 'rgba(255,190,90,' + (0.1 + (i % 2) * 0.08) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + Math.cos(a) * 24, ey + Math.sin(a) * 24); g.lineTo(ex + Math.cos(a) * (24 + l), ey + Math.sin(a) * (24 + l)); g.stroke(); }
      g.globalCompositeOperation = 'source-over'; disc(g, ex, ey, 26, '#ffd890'); disc(g, ex, ey, 25, '#ff9a4a'); disc(g, ex + 3, ey + 2, 25, '#05020c'); }
    for (const [im, f, y] of [[A.m1, 0.02, 84], [A.m2, 0.05, 106], [A.m3, 0.1, 128]]) { const ox = -((cam * f) % 768); g.drawImage(im, Math.round(ox), y); g.drawImage(im, Math.round(ox) + 768, y); }
    { const ox = -((cam * 0.55) % 768); g.drawImage(A.trees, Math.round(ox), GY - 64); g.drawImage(A.trees, Math.round(ox) + 768, GY - 64); }
    // ground, lit from the horizon, with swaying grass
    { const gg = g.createLinearGradient(0, GY, 0, VH); gg.addColorStop(0, '#2a1426'); gg.addColorStop(0.15, '#120816'); gg.addColorStop(1, '#05020a'); g.fillStyle = gg; g.fillRect(0, GY, VW, VH - GY); g.fillStyle = 'rgba(255,150,70,.6)'; g.fillRect(0, GY, VW, 1); g.fillStyle = '#0a0412'; for (const f of A.tufts) { const fx = (((f.x - cam) % VW) + VW) % VW; g.fillRect(Math.round(fx), GY - f.h + Math.round(Math.sin(t * 2 + f.p) * 0.6), 1, f.h); } g.fillStyle = 'rgba(255,170,90,.25)'; for (let i = 0; i < 14; i++) { const fx = (((i * 61 - cam * 1.4) % VW) + VW) % VW; g.fillRect(Math.round(fx), GY + 4 + (i % 4) * 5, 6 + (i % 3) * 4, 1); } }
    g.drawImage(A.pines, -22, VH - 120); g.save(); g.translate(VW + 22, 0); g.scale(-1, 1); g.drawImage(A.pines, 0, VH - 120); g.restore();
    // mist
    for (let i = 0; i < 3; i++) for (let k = 0; k < 6; k++) { g.globalAlpha = 0.05; g.fillStyle = '#ffb4a0'; g.fillRect(((k * 90 + t * (6 + i * 4) + i * 40) % (VW + 120)) - 60, GY - 16 + i * 6, 100, 6); } g.globalAlpha = 1;
    // fireflies and embers
    for (const f of A.flies) { const x = f.x + Math.sin(t * f.sp + f.ph) * f.r, y = f.y + Math.cos(t * f.sp * 1.3 + f.ph) * 6, a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + f.ph)); g.globalAlpha = a; g.fillStyle = '#ffe066'; g.fillRect(Math.round(x), Math.round(y), 2, 2); g.globalAlpha = a * 0.3; g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 4, 4); } g.globalAlpha = 1;
    for (const e of A.embers) { const y = GY - ((e.o + t * e.v) % 130), x = e.x + Math.sin(t + e.ph) * 6; g.globalAlpha = clamp((GY - y) / 40, 0, 1) * clamp(y / 60, 0, 1) * 0.8; g.fillStyle = Math.sin(t * 8 + e.ph) > 0 ? '#ffd34e' : '#ff7a2a'; g.fillRect(Math.round(x), Math.round(y), 1, 1); } g.globalAlpha = 1;
    // the hero beside his lantern: a big warm light pool
    { const hx = 150, fl = 1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 5.3) * 0.03;
      g.globalCompositeOperation = 'lighter'; const lg2 = g.createRadialGradient(hx + 12, GY - 20, 0, hx + 12, GY - 20, 78 * fl); lg2.addColorStop(0, 'rgba(255,190,90,.5)'); lg2.addColorStop(0.5, 'rgba(255,140,60,.18)'); lg2.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lg2; g.fillRect(hx - 70, GY - 100, 160, 130);
      g.fillStyle = 'rgba(255,170,70,.18)'; for (let i = 0; i < 28; i++) g.fillRect(hx - 40 + i * 3 + Math.round(Math.sin(i + t) * 1), GY, 3, 1);
      g.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 7; i++) { const u = ((t * 5 + i / 7) % 1), dx = hx - 12 - u * 34, dy = GY - 1 - u * 6 - (i % 2) * 2; g.globalAlpha = (1 - u) * 0.6; g.fillStyle = i % 2 ? '#9a7a8a' : '#6a4a5a'; g.fillRect(Math.round(dx), Math.round(dy), 2 + (i % 2), 2); } g.globalAlpha = 1;
      g.fillStyle = 'rgba(255,230,190,.35)'; for (let i = 0; i < 4; i++) g.fillRect(hx - 40 - i * 14 - Math.round((t * 90) % 14), GY - 18 - i * 6, 14 + i * 3, 1);
      drawSpr(g, getSprite('hero_run', {}, Math.floor(t * 11) % 4), hx, GY + 3, false, false, 2, 2); }
    g.drawImage(A.vig, 0, 0);
    // ---- logo ----
    { const pulse = 0.6 + Math.sin(t * 1.6) * 0.4;
      g.globalCompositeOperation = 'lighter'; const lgl = g.createRadialGradient(VW / 2, 36, 0, VW / 2, 36, 140); lgl.addColorStop(0, 'rgba(255,170,60,' + (0.16 + pulse * 0.08) + ')'); lgl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lgl; g.fillRect(0, 0, VW, 100); g.globalCompositeOperation = 'source-over';
      lanternIc(VW / 2 - 124, 36 + Math.round(Math.sin(t * 2) * 1.5)); lanternIc(VW / 2 + 124, 36 + Math.round(Math.sin(t * 2 + 1.5) * 1.5));
      txt('LAST LANTERN', VW / 2, 36, { al: 'center', size: 30, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.85)', ls: 2, sh: false });
      g.fillStyle = 'rgba(255,211,78,.7)'; g.fillRect(VW / 2 - 110, 56, 70, 1); g.fillRect(VW / 2 + 40, 56, 70, 1); g.fillRect(VW / 2 - 3, 54, 7, 5); g.fillStyle = '#ffffff'; g.fillRect(VW / 2 - 1, 55, 3, 3); g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 130, 56, 18, 1); g.fillRect(VW / 2 + 112, 56, 18, 1);
      txt(save.lang === 'vi' ? 'NGỌN ĐÈN CUỐI CÙNG' : 'THE SHATTERED SUN', VW / 2, 67, { al: 'center', size: 8.5, bold: true, col: '#ffe9b8', ls: 3, ol: '#1a0814', glow: 'rgba(255,120,60,.6)', sh: false }); }
    // ---- menu: a glass panel, the main action on a big card, everything else in a neat grid ----
    { const items = titleItems(), L = titleLayout(items), last = L[L.length - 1], ph = last.y + last.h + 6 - TM.y;
      g.fillStyle = 'rgba(10,5,22,.72)'; g.fillRect(TM.x, TM.y, TM.w, ph);
      g.fillStyle = 'rgba(255,200,110,.5)'; g.fillRect(TM.x, TM.y, TM.w, 1); g.fillRect(TM.x, TM.y + ph - 1, TM.w, 1);
      g.fillStyle = 'rgba(255,200,110,.18)'; g.fillRect(TM.x, TM.y, 1, ph); g.fillRect(TM.x + TM.w - 1, TM.y, 1, ph);
      g.fillStyle = '#ffd34e'; for (const [cx, cy] of [[TM.x, TM.y], [TM.x + TM.w - 4, TM.y], [TM.x, TM.y + ph - 1], [TM.x + TM.w - 4, TM.y + ph - 1]]) g.fillRect(cx, cy, 4, 1);
      items.forEach((it, i) => {
        const r = L[i], sel = titleSel === i, cx = r.x + r.w / 2;
        if (r.primary) {
          const gr = g.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
          gr.addColorStop(0, sel ? 'rgba(255,190,90,.95)' : 'rgba(120,60,40,.75)'); gr.addColorStop(1, sel ? 'rgba(210,100,40,.95)' : 'rgba(60,24,30,.8)');
          g.fillStyle = gr; g.fillRect(r.x, r.y, r.w, r.h);
          g.fillStyle = sel ? '#fff4d0' : '#c89a5a'; g.fillRect(r.x, r.y, r.w, 1); g.fillStyle = sel ? '#7a2a10' : '#3a1418'; g.fillRect(r.x, r.y + r.h - 1, r.w, 1);
          if (sel) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,150,' + (0.12 + Math.sin(t * 4) * 0.06) + ')'; g.fillRect(r.x, r.y, r.w, r.h); g.globalCompositeOperation = 'source-over'; }
          lanternIc(r.x + 12, r.y + r.h / 2 + Math.round(Math.sin(t * 3) * 1), 1);
          const head = it.k === 'resume' ? sv('CONTINUE', 'CHƠI TIẾP') : sv('START ADVENTURE', 'BẮT ĐẦU PHIÊU LƯU');
          const sub = it.k === 'resume' ? sv('Map ', 'Map ') + (LPOS(save.resume.li) + 1) + ' · ' + LN(BIOMES[save.resume.li].name) : sv('A new journey begins', 'Hành trình mới bắt đầu');
          txt(head, cx + 6, r.y + 8, { al: 'center', size: 8.5, bold: true, col: '#ffffff', ol: sel ? '#5a1a08' : '#1a0814', glow: sel ? 'rgba(255,200,120,.8)' : null, ls: 1, sh: false });
          txt(fitTxt(sub, 30), cx + 6, r.y + 17, { al: 'center', size: 6, col: sel ? '#3a1408' : '#ffd890', bold: sel });
          if (sel) { g.fillStyle = '#fff4d0'; g.fillRect(r.x + r.w - 10 + Math.round(Math.sin(t * 6)), r.y + r.h / 2 - 2, 2, 5); g.fillRect(r.x + r.w - 8 + Math.round(Math.sin(t * 6)), r.y + r.h / 2 - 1, 2, 3); }
          return;
        }
        const warn = it.k === 'newgame' && title.confirmT > 0;
        g.fillStyle = sel ? (warn ? 'rgba(200,50,50,.9)' : 'rgba(255,170,70,.88)') : 'rgba(34,22,58,.85)'; g.fillRect(r.x, r.y, r.w, r.h);
        g.fillStyle = sel ? '#fff0c8' : 'rgba(150,120,200,.45)'; g.fillRect(r.x, r.y, r.w, 1); g.fillStyle = sel ? '#8a3a10' : 'rgba(0,0,0,.4)'; g.fillRect(r.x, r.y + r.h - 1, r.w, 1);
        g.fillStyle = sel ? '#fff0c8' : 'rgba(150,120,200,.3)'; g.fillRect(r.x, r.y, 1, r.h); g.fillRect(r.x + r.w - 1, r.y, 1, r.h);
        txt(fitTxt(titleLabel(it), Math.floor(r.w / 4.2)), cx, r.y + r.h / 2 + 0.5, { al: 'center', size: 6.5, bold: sel, col: sel ? '#ffffff' : '#d8d2ec', ol: sel ? '#4a1808' : null, sh: !sel });
      });
    }
    txt(sv('Arrows: choose    Enter: confirm', 'Phím mũi tên: chọn    Enter: xác nhận'), 8, VH - 8, { size: 5.5, col: '#8a7fa8' });
    txt('© 2026  Lee Santree and David Quan', VW - 6, VH - 8, { al: 'right', size: 5.5, col: '#b8a8d8' });
  }

  const MAPHERO = { x: -1, y: -1 };
  function mapArt() {
    if (UIC.m) return UIC.m;
    const M = {}, q = mulberry32(777);
    { const [c, x] = mkCanvas(VW, VH), st = [[0, '#04061a'], [0.45, '#10184a'], [0.75, '#2a2a6a'], [1, '#5a3a7a']];
      for (let y = 0; y < VH; y++) { const t = y / VH; let i = 0; while (i < st.length - 2 && t > st[i + 1][0]) i++; const a = st[i], b = st[i + 1]; x.fillStyle = lerpColor(a[1], b[1], clamp((t - a[0]) / (b[0] - a[0]), 0, 1)); x.fillRect(0, y, VW, 1); }
      for (let i = 0; i < 90; i++) { x.fillStyle = q() < 0.2 ? '#ffffff' : '#8a8ad0'; x.globalAlpha = 0.4 + q() * 0.6; x.fillRect((q() * VW) | 0, (q() * 80) | 0, 1, 1); } x.globalAlpha = 1;
      // faraway mountain range
      for (let px = 0; px < VW; px++) { const y = Math.round(78 + Math.sin(px * 0.021) * 9 + Math.sin(px * 0.06 + 2) * 5 + Math.sin(px * 0.13) * 2); x.fillStyle = '#1a2058'; x.fillRect(px, y, 1, 110); x.fillStyle = '#3a4a98'; x.fillRect(px, y, 1, 1); }
      // the land the road crosses
      for (let px = 0; px < VW; px++) { const y = Math.round(96 + Math.sin(px * 0.034 + 1) * 8 + Math.sin(px * 0.011) * 10 + Math.sin(px * 0.09) * 2); const gg = x.createLinearGradient(0, y, 0, 172); gg.addColorStop(0, '#2c4a52'); gg.addColorStop(0.3, '#1c3040'); gg.addColorStop(1, '#0c1226'); x.fillStyle = gg; x.fillRect(px, y, 1, 172 - y); x.fillStyle = '#6ac8a0'; x.globalAlpha = 0.55; x.fillRect(px, y, 1, 1); x.globalAlpha = 1; }
      // trees and rocks on the land
      for (let i = 0; i < 70; i++) { const px = (q() * VW) | 0, py = 108 + ((q() * 54) | 0), s = 2 + ((q() * 3) | 0); x.fillStyle = '#0f2a30'; if (q() < 0.6) { for (let k = 0; k < s * 2; k++) { const hw = Math.round(k / (s * 2) * s); x.fillRect(px - hw, py - s * 2 + k, hw * 2 + 1, 1); } } else { x.fillStyle = '#1a2a3a'; x.fillRect(px - 2, py - 1, 5, 2); } }
      M.bg = c; }
    { const [c, x] = mkCanvas(VW, VH), v = x.createRadialGradient(VW / 2, VH * 0.48, VH * 0.35, VW / 2, VH * 0.48, VW * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,2,12,.6)'); x.fillStyle = v; x.fillRect(0, 0, VW, VH); M.vig = c; }
    M.clouds = []; for (let i = 0; i < 6; i++) M.clouds.push({ x: q() * VW, y: 24 + q() * 40, w: 26 + q() * 30, v: 1.5 + q() * 3 });
    return (UIC.m = M);
  }
  // little emblems for each land
  function nodeIcon(id, x, y, lock) {
    const C = lock ? { a: '#4a4f78', b: '#363a5c', c: '#5a5f88' } : null, R = (a, b, w, h, col) => { g.fillStyle = C ? C.a : col; g.fillRect(x + a, y + b, w, h); };
    switch (id) {
      case 'meadow': R(-5, 1, 10, 3, '#5fcf5a'); R(-3, -1, 6, 2, '#5fcf5a'); R(-1, -2, 2, 1, '#a4e86b'); R(3, -5, 3, 3, '#ffd34e'); break;
      case 'forest': for (const dx of [-3, 3]) { R(dx - 1, 3, 2, 2, '#5a3a22'); R(dx - 3, 1, 6, 1, '#2f7a4a'); R(dx - 2, -1, 4, 2, '#2f7a4a'); R(dx - 1, -3, 2, 2, '#4aa05a'); } break;
      case 'caves': R(-1, -5, 2, 2, '#bff3ff'); R(-2, -3, 4, 3, '#6ee7f2'); R(-3, 0, 6, 3, '#2c9ab8'); R(-1, -4, 1, 6, '#ffffff'); break;
      case 'desert': for (let i = 0; i < 6; i++) R(-i, -4 + i, i * 2 + 1, 1, i < 3 ? '#ffe8a8' : '#e0b060'); R(-5, 2, 11, 2, '#c8964a'); break;
      case 'frost': R(-1, -5, 2, 10, '#e8fbff'); R(-5, -1, 10, 2, '#e8fbff'); R(-4, -4, 2, 2, '#9fe0f0'); R(2, -4, 2, 2, '#9fe0f0'); R(-4, 2, 2, 2, '#9fe0f0'); R(2, 2, 2, 2, '#9fe0f0'); break;
      case 'volcano': for (let i = 0; i < 6; i++) R(-i - 1, -2 + i, i * 2 + 3, 1, '#5a4a55'); R(-2, -4, 5, 2, '#ff7a2a'); R(0, -5, 1, 1, '#ffd34e'); R(-1, -6, 1, 1, '#ff9a4a'); break;
      case 'swamp': R(-1, 0, 2, 5, '#e8dcc0'); R(-5, -4, 10, 4, '#a15be0'); R(-3, -5, 6, 1, '#c07bff'); R(-3, -3, 1, 1, '#fff'); R(1, -2, 1, 1, '#fff'); break;
      case 'ocean': for (let k = 0; k < 3; k++) { R(-5, -3 + k * 3, 3, 1, '#6ee7f2'); R(-2, -4 + k * 3, 3, 1, '#9fe8ff'); R(1, -3 + k * 3, 3, 1, '#6ee7f2'); } break;
      case 'tunnels': R(-5, -3, 10, 8, '#8a6a3a'); R(-3, -1, 6, 6, '#14080a'); R(-1, 1, 2, 2, '#ffd34e'); R(-5, -4, 10, 1, '#c8964a'); break;
      default: R(-1, -6, 2, 3, '#d58bff'); R(-2, -4, 4, 2, '#7a4cff'); R(-3, -2, 6, 7, '#4a2a7a'); R(-1, 0, 2, 3, '#ffd34e'); R(-4, -2, 1, 7, '#3a1a6a'); R(3, -2, 1, 7, '#3a1a6a');
    }
  }
  function drawMap() {
    const t = sceneT, M = mapArt(), mp = maxPlayable(), nowLi = LORDER[mapSel], B = BIOMES[nowLi], unl = mapSel <= mp;
    g.drawImage(M.bg, 0, 0);
    // drifting clouds and a pale moon
    disc(g, 340, 30, 9, '#e8ecff'); disc(g, 344, 28, 8, '#10184a'); g.globalAlpha = 0.5; disc(g, 340, 30, 12, 'rgba(180,200,255,.25)'); g.globalAlpha = 1;
    for (const c of M.clouds) { const x = ((c.x + t * c.v) % (VW + 100)) - 50; g.globalAlpha = 0.18; g.fillStyle = '#b8c4ff'; g.fillRect(Math.round(x), Math.round(c.y), Math.round(c.w), 3); g.fillRect(Math.round(x + c.w * 0.2), Math.round(c.y - 2), Math.round(c.w * 0.5), 3); } g.globalAlpha = 1;
    // coloured glows of every land
    g.globalCompositeOperation = 'lighter';
    LORDER.forEach((li, i) => { const [x, y] = NODES[i], un = i <= mp; const cg = g.createRadialGradient(x, y, 0, x, y, 30); cg.addColorStop(0, hexA(BIOMES[li].sky[2], un ? 0.5 : 0.12)); cg.addColorStop(1, hexA(BIOMES[li].sky[2], 0)); g.fillStyle = cg; g.fillRect(x - 30, y - 30, 60, 60); });
    g.globalCompositeOperation = 'source-over';
    // the road
    for (let i = 0; i < NODES.length - 1; i++) {
      const a = NODES[i], b = NODES[i + 1], open = i < mp, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + (i % 2 ? 9 : -9);
      for (let j = 0; j <= 36; j++) { const u = j / 36, px = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], py = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1];
        if (open) { const w = (j + Math.floor(t * 14)) % 6 === 0; g.fillStyle = w ? '#fff6c0' : '#ffd34e'; g.globalAlpha = w ? 1 : 0.8; g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 2, 2); g.globalAlpha = 0.2; g.fillRect(Math.round(px) - 2, Math.round(py) - 2, 4, 4); g.globalAlpha = 1; }
        else if (j % 2 === 0) { g.fillStyle = '#3a4070'; g.fillRect(Math.round(px), Math.round(py), 2, 2); } }
    }
    // the lands
    LORDER.forEach((li, i) => {
      const Bi = BIOMES[li], [x, y] = NODES[i], un = i <= mp, done = save.cleared.indexOf(li) >= 0, sel = i === mapSel, last = i === NODES.length - 1, r = last ? 13 : 10, pulse = Math.sin(t * 4) * 0.5 + 0.5;
      disc(g, x, y, r + 2, '#05030f'); disc(g, x, y, r + 1, done ? '#c89a1c' : (un ? '#7a6aa8' : '#2a2e50')); disc(g, x, y, r - 1, '#0a0618');
      const gr = g.createLinearGradient(0, y - r, 0, y + r); gr.addColorStop(0, un ? Bi.sky[3] : '#3a3f68'); gr.addColorStop(1, un ? Bi.sky[1] : '#1a1e3a'); g.fillStyle = gr; for (let j = -(r - 2); j <= r - 2; j++) { const hw = Math.round(Math.sqrt((r - 2) * (r - 2) - j * j)); g.fillRect(x - hw, y + j, hw * 2 + 1, 1); }
      nodeIcon(Bi.id, x, y + 1, !un);
      g.fillStyle = '#05030f'; g.fillRect(x - r - 2, y - r - 4, 8, 8); g.fillStyle = un ? '#ffd34e' : '#4a4f78'; g.fillRect(x - r - 1, y - r - 3, 6, 6); txt(String(i + 1), x - r + 2, y - r, { al: 'center', size: 5.5, bold: true, col: un ? '#2a1408' : '#1a1e3a', sh: false });
      if (done) { g.fillStyle = '#fff6c0'; g.fillRect(x + r - 3, y - r - 2, 5, 5); g.fillStyle = '#ffd34e'; g.fillRect(x + r - 2, y - r - 1, 3, 3); g.fillStyle = '#fff'; g.fillRect(x + r - 1, y - r, 1, 1); }
      if (!un) { g.fillStyle = 'rgba(10,12,34,.45)'; g.fillRect(x - 4, y + r - 5, 9, 8); g.fillStyle = '#8a90c0'; g.fillRect(x - 3, y + r - 3, 7, 5); g.fillStyle = '#14162e'; g.fillRect(x, y + r - 2, 1, 2); g.fillStyle = '#8a90c0'; g.fillRect(x - 2, y + r - 6, 1, 3); g.fillRect(x + 2, y + r - 6, 1, 3); g.fillRect(x - 2, y + r - 7, 5, 1); }
      else { const sh = save.shards[li] || [0, 0, 0]; for (let k = 0; k < 3; k++) { g.fillStyle = sh[k] ? '#ffd34e' : '#2a2f55'; g.fillRect(x - 6 + k * 5, y + r + 3, 4, 4); if (sh[k]) { g.fillStyle = '#fff'; g.fillRect(x - 6 + k * 5, y + r + 3, 1, 1); } } }
      if (sel) { const R2 = r + 5 + Math.round(pulse * 2); g.strokeStyle = '#ffd34e'; g.lineWidth = 1; g.globalAlpha = 0.5 + pulse * 0.5; g.beginPath(); g.arc(x, y, R2, 0, 6.2832); g.stroke(); g.globalAlpha = 1; g.fillStyle = '#fff6c0'; for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.fillRect(x + dx * (R2 + 2) - 1, y + dy * (R2 + 2) - 1, 2, 2); }
    });
    // the hero with his lantern walks to the chosen land
    { const [tx, ty] = NODES[mapSel]; if (MAPHERO.x < 0) { MAPHERO.x = tx; MAPHERO.y = ty; } const hx = Math.round(MAPHERO.x), hy = Math.round(MAPHERO.y) - 22 + Math.round(Math.sin(t * 6) * 1.5), mv = Math.hypot(tx - MAPHERO.x, ty - MAPHERO.y) > 2;
      g.globalCompositeOperation = 'lighter'; const hg = g.createRadialGradient(hx + 4, hy + 8, 0, hx + 4, hy + 8, 22); hg.addColorStop(0, 'rgba(255,200,100,.45)'); hg.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = hg; g.fillRect(hx - 18, hy - 14, 44, 44); g.globalCompositeOperation = 'source-over';
      drawSpr(g, mv ? getSprite('hero_run', {}, Math.floor(t * 12) % 4) : getSprite('hero_idle', {}, Math.floor(t * 2.5) % 2), hx, hy + 12, tx < MAPHERO.x - 1); }
    g.drawImage(M.vig, 0, 0);
    // ---- top: ribbon, progress, wallet ----
    g.fillStyle = 'rgba(6,4,20,.8)'; g.fillRect(VW / 2 - 96, 3, 192, 15); g.fillStyle = '#c89a1c'; g.fillRect(VW / 2 - 96, 3, 192, 1); g.fillRect(VW / 2 - 96, 17, 192, 1); g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 100, 8, 5, 5); g.fillRect(VW / 2 + 95, 8, 5, 5); g.fillStyle = '#05030f'; g.fillRect(VW / 2 - 99, 9, 3, 3); g.fillRect(VW / 2 + 96, 9, 3, 3);
    lanternIc(VW / 2 - 84, 11); lanternIc(VW / 2 + 84, 11);
    txt(T('mapt'), VW / 2, 11, { al: 'center', size: 10, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#1a0a08', glow: 'rgba(255,170,60,.7)', ls: 1, sh: false });
    txt(T('cleared') + ' ' + save.cleared.length + '/' + BIOMES.length + '   ' + T('relics') + ' ' + save.relics.filter(Boolean).length + '/10   ' + T('shards') + ' ' + totalShards() + '/30', VW / 2, 24, { al: 'center', size: 5.5, col: '#b8c4f0' });
    g.fillStyle = 'rgba(6,4,20,.72)'; g.fillRect(4, 3, 84, 14); g.fillStyle = '#434d8a'; g.fillRect(4, 3, 84, 1); g.fillRect(4, 16, 84, 1);
    drawCoinIc(11, 10); txt(String(save.coins), 16, 10, { size: 6, col: '#ffd34e' }); drawGemIc(40, 10); txt(String(save.inv.gems), 45, 10, { size: 6, col: '#9ff0ff' }); drawRareIc(64, 10, 0.8); txt(String(save.rare), 70, 10, { size: 6, col: '#d8b8ff' });
    g.fillStyle = 'rgba(6,4,20,.72)'; g.fillRect(VW - 76, 3, 72, 14); g.fillStyle = '#c89a1c'; g.fillRect(VW - 76, 3, 72, 1); g.fillRect(VW - 76, 16, 72, 1); txt('[B] ' + sv('Shop & Bag', 'Cửa hàng'), VW - 40, 10, { al: 'center', size: 6, bold: true, col: '#ffd34e' });
    // ---- bottom: info panel for the chosen land ----
    const PY = 172, PH = 40;
    g.fillStyle = 'rgba(6,4,20,.9)'; g.fillRect(8, PY, VW - 16, PH); g.fillStyle = unl ? '#c89a1c' : '#434d8a'; g.fillRect(8, PY, VW - 16, 1); g.fillRect(8, PY + PH - 1, VW - 16, 1); g.fillRect(8, PY, 1, PH); g.fillRect(VW - 9, PY, 1, PH);
    g.fillStyle = unl ? '#ffd34e' : '#5a5f98'; for (const [cx, cy] of [[8, PY], [VW - 12, PY], [8, PY + PH - 3], [VW - 12, PY + PH - 3]]) g.fillRect(cx, cy, 4, 3);
    { const grd = g.createLinearGradient(8, 0, 120, 0); grd.addColorStop(0, hexA(B.sky[2], unl ? 0.35 : 0.08)); grd.addColorStop(1, hexA(B.sky[2], 0)); g.fillStyle = grd; g.fillRect(9, PY + 1, 120, PH - 2); }
    g.fillStyle = '#0a0618'; g.fillRect(14, PY + 6, 28, 28); g.fillStyle = unl ? '#7a6aa8' : '#2a2e50'; g.fillRect(14, PY + 6, 28, 1); g.fillRect(14, PY + 33, 28, 1); g.fillRect(14, PY + 6, 1, 28); g.fillRect(41, PY + 6, 1, 28);
    { const ic = icon('r' + nowLi); g.globalAlpha = save.relics[nowLi] ? 1 : 0.28; g.drawImage(ic.c, 22, PY + 14); g.globalAlpha = 1; if (save.relics[nowLi]) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,211,78,.18)'; g.fillRect(15, PY + 7, 26, 26); g.globalCompositeOperation = 'source-over'; } }
    txt((mapSel + 1) + '.', 50, PY + 11, { size: 11, bold: true, col: unl ? '#ffd34e' : '#6a70a8' });
    txt(unl ? LN(B.name) : '???', 66, PY + 11, { size: 11, bold: true, col: unl ? '#ffffff' : '#7a80b0', ol: '#05030f', sh: false });
    txt(unl ? LN(B.sub) : T('locked'), 50, PY + 23, { size: 6.5, col: '#b8c4f0' });
    { const dif = Math.ceil((LDIFF(nowLi) + 1) / 1.4), pz = (PUZZLES[nowLi] || []).length, mins = Math.round((nowLi === 8 ? 600 : B.len) / 70);
      txt(T('difficulty'), 232, PY + 11, { size: 5.5, col: '#8a90c0' }); for (let k = 0; k < 5; k++) { g.fillStyle = k < dif ? '#ffd34e' : '#2a2f55'; g.fillRect(262 + k * 9, PY + 8, 7, 7); if (k < dif) { g.fillStyle = '#fff6c0'; g.fillRect(263 + k * 9, PY + 9, 2, 2); } }
      txt(T('puzzles') + ': ' + pz, 232, PY + 23, { size: 5.5, col: '#b8c4f0' }); txt(T('length') + ': ~' + mins + ' ' + T('min'), 292, PY + 23, { size: 5.5, col: '#b8c4f0' });
      const sh = save.shards[nowLi] || [0, 0, 0]; txt(T('shards'), 232, PY + 33, { size: 5.5, col: '#8a90c0' }); for (let k = 0; k < 3; k++) { g.fillStyle = sh[k] ? '#ffd34e' : '#2a2f55'; g.fillRect(262 + k * 9, PY + 30, 6, 6); } }
    txt(unl ? sv('ENTER: play', 'ENTER: chơi') : sv('Clear the previous land first', 'Hãy vượt vùng trước đó'), VW - 14, PY + 33, { al: 'right', size: 6, bold: true, col: unl ? '#ffd34e' : '#8a90c0' });
    txt('← → ' + sv('choose', 'chọn') + '   ESC ' + sv('back', 'quay lại'), 6, 24, { size: 5, col: '#8a90c0' });
  }
  function updateStory(dt) {
    storyT += dt;
    if (storyPage >= storyList.length) return;
    const full = storyList[storyPage][save.lang].length;
    if (act.okP) { if (storyT * 40 < full) storyT = 999; else { storyPage++; storyT = 0; if (storyPage >= storyList.length) { if (storyList === STORY) { mapSel = 0; save.seen = { 0: 1 }; writeSave(); storyLevel = 0; storyList = MAP_STORY[0]; storyPage = 0; storyT = 0; } else if (storyList === ENDING) { toScene('outro'); } else startLevelFade(storyLevel); } } }
    if (act.backP && storyList === STORY) { startLevelFade(0); } else if (act.backP && storyList !== ENDING) startLevelFade(storyLevel);
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
    const s = storyList[Math.min(storyPage, storyList.length - 1)][save.lang], n = Math.min(s.length, Math.floor(storyT * 40));
    const lines = wrapText(s.substr(0, n), 46);
    lines.forEach((l, i) => txt(l, VW / 2, 138 + i * 12, { al: 'center', size: 8 }));
    txt(T('press'), VW / 2, VH - 12, { al: 'center', size: 6, col: '#8892aa', alpha: 0.5 + 0.5 * Math.sin(sceneT * 4) });
    if (ending && storyPage >= storyList.length - 1) txt(T('thanks') + '  ' + totalShards() + '/30', VW / 2, 120, { al: 'center', size: 8, col: '#ffd34e' });
  }
  const NODES = [[28, 142], [64, 110], [100, 144], [138, 108], [176, 144], [214, 108], [252, 144], [290, 110], [326, 144], [354, 92]];
  function updateMap(dt) {
    sceneT += dt; { const nd = NODES[mapSel]; if (MAPHERO.x < 0) { MAPHERO.x = nd[0]; MAPHERO.y = nd[1]; } MAPHERO.x += (nd[0] - MAPHERO.x) * Math.min(1, dt * 4); MAPHERO.y += (nd[1] - MAPHERO.y) * Math.min(1, dt * 4); }
    if (act.leftP) { mapSel = Math.max(0, mapSel - 1); Snd.play('select'); }
    if (act.rightP) { mapSel = Math.min(maxPlayable(), mapSel + 1); Snd.play('select'); }
    if (act.backP) toScene('title');
    if (pressed.KeyB) { shopFrom = 'map'; Snd.play('ok'); toScene('shop'); return; }
    if (act.okP) {
      Snd.play('ok');
      if (!save.seen) save.seen = {};
      const li = LORDER[mapSel];
      if (MAP_STORY[li] && !save.seen[li]) { save.seen[li] = 1; writeSave(); storyLevel = li; toScene('mstory'); }
      else startLevelFade(li);
    }
  }
  // ============================== DEVIL CUTSCENE ==============================
  let cutLevel = 0, cut = null;
  let cutSkip = false, cutAlt = false;
  function startCut() { cut = { alt: cutAlt, t: 0, phase: 'walk', i: 0, lt: 0, pt: 0, fl: 0, shake: 0, thun: false, lastBlip: 0 }; Q = null; Snd.music('devil', DEVIL_MUSIC); cutAlt = false; if (cutSkip) { cutSkip = false; cut.phase = 'devil'; cut.t = 4; cut.fl = 0.5; cut.shake = 0.5; Snd.play('thunder'); cutLineStart(); } }
  function cutLineStart() {
    const ln = CUT[cutLevel][cut.i];
    if (ln.w === 'quoc') Snd.devilRoar(ln.shout ? 1 : 0.55); else if (ln.w === 'imp') Snd.creature('imp', 'alert'); else if (ln.w === 'sy') { Snd.blip('sy'); Snd.whisper(); } else Snd.blip('shorty');
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
    for (let k = n0 + 1; k <= n1; k++) if (k % (ln.w === 'quoc' ? 3 : 2) === 0 && /\S/.test(txtL[k - 1] || ' ')) Snd.blip(ln.w === 'imp' ? 'fairy' : (ln.w === 'quoc' ? 'quoc' : (ln.w === 'sy' ? 'sy' : 'shorty')));
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
    g.fillStyle = c.alt ? '#070818' : '#050003'; g.fillRect(0, 0, VW, VH);
    const gc = c.alt ? '110,80,230' : '190,30,14', gl = g.createRadialGradient(VW / 2, 70, 0, VW / 2, 70, 190); gl.addColorStop(0, 'rgba(' + gc + ',' + (0.45 + (ln.w === 'quoc' && ln.shout ? 0.2 : 0)) + ')'); gl.addColorStop(1, 'rgba(' + gc + ',0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH);
    for (let i = 0; i < (c.alt ? 0 : 26); i++) { const ex = (i * 53 + Math.sin(c.pt + i) * 10) % VW, ey = VH - ((c.pt * (20 + (i % 5) * 9) + i * 41) % VH); g.fillStyle = i % 2 ? '#ff9a2a' : '#ffd34e'; g.fillRect(Math.round(ex), Math.round(ey), 1, 1); }
    if (c.alt) { // storm over a ruined spire: clouds, rain, lightning and floating rocks
      for (let i = 0; i < 7; i++) { const cx2 = (i * 71 + c.pt * 6) % (VW + 80) - 40, cy2 = 14 + (i % 3) * 14; g.globalAlpha = 0.5; disc(g, Math.round(cx2), cy2, 22 + (i % 2) * 8, '#1c1a3a'); disc(g, Math.round(cx2) + 18, cy2 + 4, 16, '#241f48'); } g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const rx = (i * 67 + 20) % VW, ry = 118 + ((i * 29) % 30) + Math.round(Math.sin(c.pt * 1.5 + i) * 3); g.fillStyle = '#1b1830'; g.fillRect(rx, ry, 22, 7); g.fillRect(rx + 4, ry + 7, 14, 5); g.fillRect(rx + 8, ry + 12, 6, 4); g.fillStyle = '#3a3560'; g.fillRect(rx, ry, 22, 1); }
      g.fillStyle = 'rgba(170,190,255,.55)'; for (let i = 0; i < 80; i++) { const rx = (i * 47 + c.pt * 50) % VW, ry = (i * 31 + c.pt * 280) % VH; g.fillRect(Math.round(rx), Math.round(ry), 1, 5); }
      if (Math.sin(c.pt * 2.3) > 0.94 || c.fl > 0.2) { const bx = 40 + (Math.floor(c.pt * 2.3) * 97) % 300; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, 0); for (let k = 1; k < 8; k++) g.lineTo(bx + ((k * 37 + Math.floor(c.pt * 9) * 13) % 24) - 12, k * 20); g.stroke(); }
    }
    const sh = c.shake > 0 ? c.shake * 7 : 0, dv = devilSprite(!!ln.shout), rise = (1 - k) * 70, ox = sh ? rr(-sh, sh) : 0, oy = sh ? rr(-sh, sh) : 0;
    const speak = ln.w === 'quoc';
    g.globalAlpha = speak ? 1 : 0.7; g.drawImage(dv.c, Math.round(VW / 2 - dv.w / 2 + ox), Math.round(10 - dv.h / 2 + 62 + rise + oy + Math.sin(c.pt * 2) * 1.5)); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    if (speak && !(typeof QUOC_IMG !== 'undefined' && QUOC_IMG.portrait_smirk)) { const e1 = g.createRadialGradient(VW / 2 - 13 + ox, 76 + rise + oy, 0, VW / 2 - 13 + ox, 76 + rise + oy, 22); e1.addColorStop(0, 'rgba(255,200,60,.55)'); e1.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e1; g.fillRect(VW / 2 - 40, 50 + rise, 80, 50); const e2 = g.createRadialGradient(VW / 2 + 13 + ox, 76 + rise + oy, 0, VW / 2 + 13 + ox, 76 + rise + oy, 22); e2.addColorStop(0, 'rgba(255,200,60,.55)'); e2.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e2; g.fillRect(VW / 2 - 14, 50 + rise, 80, 50); }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = ln.w === 'shorty' ? 1 : 0.55; drawSpr(g, npcSpr('npc_shorty'), 62, 150 + Math.round(Math.sin(c.pt * 3)), false, false, 2, 2);
    if (cutLevel >= 2) { g.globalAlpha = ln.w === 'sy' ? 1 : 0.55; drawSpr(g, npcSpr('npc_sy'), VW - 62, 152 + Math.round(Math.sin(c.pt * 3)), true, false, 2, 2); g.globalAlpha = 1; } else { g.globalAlpha = ln.w === 'imp' ? 1 : 0.55; drawSpr(g, getSprite('imp'), VW - 62, 150 + Math.round(Math.sin(c.pt * 4)), true, false, 3, 3); g.globalAlpha = 1; }
    if (c.fl > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, c.fl * 2) + ')'; g.fillRect(0, 0, VW, VH); }
    g.fillStyle = 'rgba(0,0,0,.82)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
    txt(LN(sp.name), 18, 162, { size: 8, col: sp.col, bold: true });
    const textL = ln[save.lang], n = Math.floor(c.lt * 38);
    wrapText(textL.substr(0, n), 64).forEach((l, i) => txt(l, 18 + (ln.shout && Math.random() < 0.4 ? rr(-0.5, 0.5) : 0), 177 + i * 11, { size: ln.shout ? 8 : 7, bold: !!ln.shout, col: ln.shout ? '#ffb0a0' : '#fff' }));
    if (n >= textL.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(c.pt * 8) });
  }

  // ============================== MAIN LOOP ==============================
  // ============================== ONLINE CO-OP (up to 5 players) ==============================
  // The host runs the whole game. Guests send their buttons; the host moves their heroes with the same player code
  // (by swapping Q.P), and sends the world back ~20 times a second. Guests only draw what they receive.
  const cvs = (en, vi) => save.lang === 'vi' ? vi : en;
  const PCOL = ['#ffd34e', '#6ee7f2', '#ff7fb0', '#7ed957', '#c07bff'];
  const coopUI = { ph: 'menu', sel: 0, code: '', msg: '', msgBad: false, hs: 0, li: 0, slots: [], from: 'lobby' };
  const heroLocked = h => h && h.secret && save.heroUnlock.indexOf(h.id) < 0;
  const myHero = () => (HERO[save.hero] && !heroLocked(HERO[save.hero]) ? save.hero : 'ember');
  function allPl() { return coop && Q.players ? Q.players.filter(p => !p.down) : [Q.P]; }
  function asP(p, fn) {
    if (!p || p === Q.P) return fn();
    const o = Q.P, os = Q.safe, oi = save.inv; Q.P = p; Q.safe = p.safe || os; if (p.bag) save.inv = p.bag; inSwap++;
    try { return fn(); } finally { inSwap--; p.safe = Q.safe; Q.P = o; Q.safe = os; save.inv = oi; }
  }
  // enemies and bosses also hit the player's summons (traps and hazards do not)
  function hitSums(box, boss) {
    const G = Q.G; if (!G || !G.sums) return false; let any = false;
    for (const sm of G.sums) {
      if (sm.life <= 0 || sm.hp <= 0 || sm.dying > 0 || sm.inv > 0 || sm.t < 0.6 || sm.kind === 'clones' || sm.ph === 'enter') continue;
      const k = sm.stage === 2 ? 1.3 : 1, gi = GIANT[sm.kind], w = (gi ? (gi.small ? 20 : 34) : 44) * k, h = (gi ? (gi.small ? 52 : 96) : 26) * k;
      const sb = { x: sm.x - w / 2, y: gi ? sm.y - h : sm.y - h / 2, w, h };
      if (!ov(box, sb)) continue;
      sm.hp -= Math.round((boss ? 20 : 9) * (1 + 0.25 * LDIFF(Q.li))); sm.inv = 0.55; sm.hurtT = 0.2; any = true;
      emit(sm.x, sb.y + h / 2, 8, { col: [(gi || BEAST[sm.kind]).glow, '#fff'], sp0: 30, sp1: 110 }); Snd.play('hit');
    }
    return any;
  }
  function hitPlE(box, fn) { hitSums(box, false); return hitPl(box, fn); }
  function hitPlB(box, fn) { hitSums(box, true); return hitPl(box, fn); }
  function hitPl(box, fn) { let r = false; for (const p of allPl()) if (ov(p, box)) r = asP(p, () => fn(p)) || r; return r; }
  function nearPl(e) { let b = Q.P, bd = 1e9; for (const p of allPl()) { const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 0.6; if (d < bd) { bd = d; b = p; } } return b; }
  function bossTgt(dt) {
    const al = allPl(); if (al.length <= 1) { Q.bt = al[0] || Q.P; Q.btSlot = Q.bt.slot || 0; return Q.bt; }
    Q.btT = (Q.btT || 0) - (dt || 0.01);
    if (Q.btT <= 0 || al.indexOf(Q.bt) < 0) {
      const byHp = al.slice().sort((x, y) => x.hp / (x.mhp || 1) - y.hp / (y.mhp || 1)), prev = Q.bt;
      Q.btWeak = !Q.btWeak;
      if (Q.btWeak) { Q.bt = byHp[0] === prev && byHp.length > 1 && Math.random() < 0.5 ? byHp[1] : byHp[0]; Q.btT = rr(4, 5.5); }   // hunt the weakest...
      else { const rest = byHp.filter(p => p !== prev); Q.bt = rest[Math.floor(Math.random() * rest.length)] || byHp[0]; Q.btT = rr(5, 7); }   // ...then give them a break
      if (Q.bt !== prev && Q.boss && Q.arenaSealed) pop(Q.bt.x + 4, Q.bt.y - 18, save.lang === 'vi' ? 'BOSS ĐANG DÍ P' + (Q.bt.slot + 1) + '!' : 'BOSS HUNTS P' + (Q.bt.slot + 1) + '!', '#ff5a4a');
    }
    Q.btSlot = Q.bt.slot;
    return Q.bt;
  }
  function setHero(p, id) {
    const h = HERO[id] || HERO.ember; p.hero = h.id; p.mhp = undefined;
    const base = asP(p, () => baseHP());
    p.mhp = Math.max(2, base + h.hp); p.hp = p.mhp; p.hspd = h.spd; p.hdmg = h.dmg; p.skCd = 2;
    if (p.ball) { p.ball = false; p.y -= 6; p.h = 14; } p.form = null; p.ess = 0; p.dk = 0; p.oraT = 0; p.standT = 0; p.copy = null; p.flutter = false; p.mom = 0; p.mouse = null; p.punch = null;
  }
  // ---------- hero skills ----------
  function teamNear(x, y, r) { return (coop ? Q.players.filter(p => !p.down) : [Q.P]).filter(p => Math.hypot(p.x + 4 - x, p.y + 7 - y) < r); }
  function healP(p, n) { const m = p.mhp || maxHP(); if (p.hp < m) { p.hp = Math.min(m, p.hp + n); Snd.play('heart'); } emit(p.x + 4, p.y + 4, 10, { col: ['#ff7fb0', '#fff', '#a4ffc0'], sp0: 10, sp1: 50, grav: -30 }); }
  function heroSkill(P) {
    const h = HERO[P.hero]; if (!h) return; const s = h.sk, f = P.face, cx = P.x + 4, cy = P.y + 6, d = s.d + Math.floor(baseDmg() / 2);
    P.skCd = s.cd; Snd.play('relic'); pop(cx, cy - 18, LN(s.n), s.col); addRing(cx, cy, s.col, 34, 0.35); emit(cx, cy, 14, { col: [s.col, '#fff'], sp0: 20, sp1: 80 });
    switch (s.k) {
      case 'nova': case 'reap': {
        addRing(cx, cy, s.col, s.r, 0.45); Q.shake = Math.max(Q.shake, 0.25);
        if (s.k === 'reap') for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; emit(cx + Math.cos(a) * s.r * 0.8, cy + Math.sin(a) * s.r * 0.5, 2, { col: [s.col, '#14121f'], sp0: 10, sp1: 40 }); }
        for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < s.r + e.w / 2) { dmgFoe(e, d, true, true); if (!e.isBoss) { e.vx = (e.x + e.w / 2 < cx ? -1 : 1) * 150; if (!e.fly) e.vy = -120; } }
        break;
      }
      case 'heal': for (const p of teamNear(cx, cy, s.r)) healP(p, s.d); addRing(cx, cy, s.col, s.r, 0.6); break;
      case 'bless': for (const p of teamNear(cx, cy, s.r)) { healP(p, s.d); p.shield = true; } addRing(cx, cy, s.col, s.r, 0.6); break;
      case 'shield': for (const p of teamNear(cx, cy, s.r)) { p.shield = true; emit(p.x + 4, p.y + 7, 12, { col: [s.col, '#fff'], sp0: 10, sp1: 50 }); } addRing(cx, cy, s.col, s.r, 0.6); break;
      case 'volley': for (let i = 0; i < s.n8; i++) { const a = (i - (s.n8 - 1) / 2) * 0.2; later(i * 0.05, () => shootG({ x: P.x + 4 + f * 6, y: P.y + 6, vx: f * Math.cos(a) * 210, vy: Math.sin(a) * 210 - (s.home ? 40 : 0), home: !!s.home, life: 1.7, dmg: d, sz: 3, col: s.col, shape: s.shape || 'orb', f, poison: !!s.poison, trail: s.col, quiet: true })); } break;
      case 'dash': {
        P.inv = Math.max(P.inv, 0.5); const x0 = P.x, hit = new Set();
        for (let k = 0; k < 10; k++) { moveX(P, f * 9); emit(P.x + 4, P.y + 7, 2, { col: [s.col, '#fff', '#14121f'], sp0: 5, sp1: 30, l0: 0.2, l1: 0.4 }); }
        const box = { x: Math.min(x0, P.x) - 4, y: P.y - 6, w: Math.abs(P.x - x0) + 16, h: P.h + 12 };
        for (const e of foes()) if (!hit.has(e) && ov(box, e)) { hit.add(e); dmgFoe(e, d, true); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: [s.col, '#fff'], sp0: 30, sp1: 110 }); }
        Snd.play('slash'); Snd.play('clang'); break;
      }
      case 'drain': { const t = nearestFoe(cx, cy, 170); if (t) { const tx = t.x + t.w / 2, ty = t.y + t.h / 2; dmgFoe(t, d, true); for (let i = 0; i < 10; i++) emit(lerp(tx, cx, i / 10), lerp(ty, cy, i / 10), 1, { col: [s.col, '#ff3a3a'], sp0: 5, sp1: 20 }); healP(P, 2); } break; }
      case 'freeze': Q.G.slowT = Math.max(Q.G.slowT, 4); for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 220) { dmgFoe(e, d, true, true); e.slowT = Math.max(e.slowT || 0, 5); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#fff', s.col], sp0: 10, sp1: 50 }); } addRing(cx, cy, s.col, 200, 0.7); break;
      case 'meteor': { const t = nearestFoe(cx, cy, 230), tx = t ? t.x + t.w / 2 : cx + f * 90; for (let i = 0; i < 2; i++) later(i * 0.25, () => shootG({ x: tx - f * 40 + i * 14, y: Q.cam.y - 10, vx: f * 50, vy: 280, life: 2, dmg: d, expl: s.r, shape: 'meteor', col: s.col, trail: '#ff7a2a', thru: false })); break; }
      case 'chain': { const t = nearestFoe(cx, cy, 190); if (t) { zap(cx, cy, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, d, true, true); chainZap(t, d, s.n8, 120); Snd.play('zap'); } break; }
      case 'rain': for (let i = 0; i < s.n8; i++) later(i * 0.06, () => shootG({ x: P.x + 4 + f * (24 + Math.random() * 120), y: Q.cam.y - 6, vx: f * 20, vy: 300, life: 1.4, dmg: d, shape: 'arrow', col: s.col, sz: 3, quiet: true })); break;
      case 'quake': {
        Q.shake = Math.max(Q.shake, 0.5); Snd.play('boom'); const gy = P.y + P.h;
        for (let i = -6; i <= 6; i++) emit(cx + i * s.r / 6, gy, 3, { col: [s.col, '#8a6a44'], sp0: 20, sp1: 70, vy: -60 });
        for (const e of foes()) if (Math.abs(e.x + e.w / 2 - cx) < s.r && Math.abs(e.y + e.h - gy) < 48) { dmgFoe(e, d, true, true); if (!e.isBoss && !e.fly) e.vy = -180; e.stunT = Math.max(e.stunT || 0, e.isBoss ? 0.4 : 1.2); }
        break;
      }
      case 'hole': Q.G.holes.push({ x: cx + f * 64, y: cy, life: 4, r: s.r, tick: 0.2 }); Snd.play('zap'); break;
      case 'blades': for (let i = 0; i < s.n8; i++) { const a = i / s.n8 * 6.283; shootG({ x: cx + Math.cos(a) * 10, y: cy + Math.sin(a) * 10, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: 0.9, dmg: d, thru: true, pierceN: 2, shape: 'star', spin: 16, col: s.col, sz: 3, quiet: true }); } Snd.play('whoosh'); break;
      case 'rage': Q.G.powerT = Math.max(Q.G.powerT || 0, 8); Q.msg = cvs('WAR CRY! The team hits harder!', 'XUNG TRẬN! Cả đội đánh mạnh hơn!'); Q.msgT = 2.5; addRing(cx, cy, s.col, 160, 0.6); break;
      case 'snipe': shootG({ x: cx + f * 8, y: cy, vx: f * 540, vy: 0, life: 0.9, dmg: d, thru: true, pierceN: 99, shape: 'beam', col: s.col, sz: 4, f }); Snd.play('whoosh'); break;
      case 'reapdash': {
        const form = P.form, mult = form === 'sin' ? 2 : 1, x0 = P.x, hit = new Set(), L = form === 'sin' ? 14 : 11; P.inv = Math.max(P.inv, 0.45);
        for (let k = 0; k < L; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); emit(P.x + 4, P.y + 7, 2, { col: [form === 'bru' ? '#ff4a3a' : '#3ad6ff', '#14121f'], sp0: 5, sp1: 30, l0: 0.2, l1: 0.4 }); }
        const box = { x: Math.min(x0, P.x) - 4, y: P.y - 6, w: Math.abs(P.x - x0) + 16, h: P.h + 12 };
        for (const e of foes()) if (!hit.has(e) && ov(box, e)) { hit.add(e); dmgFoe(e, d * mult, true); chargeHit(); P.ess = Math.min(6, (P.ess || 0) + 1); emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: [form === 'bru' ? '#ff4a3a' : '#3ad6ff', '#fff'], sp0: 30, sp1: 120 }); }
        if (form === 'bru' && hit.size) healP(P, 1);
        if (form === 'sin') P.skCd = 2.5;
        if ((P.ess || 0) >= 6) {
          P.ess = 0; P.form = P.form === 'sin' ? 'bru' : 'sin'; const hb = HERO.liem; P.hspd = hb.spd + (P.form === 'sin' ? 0.25 : 0); P.hdmg = hb.dmg + (P.form === 'bru' ? 1 : 0);
          const fc = P.form === 'sin' ? '#3ad6ff' : '#ff4a3a'; addRing(cx, cy, fc, 90, 0.6); emit(cx, cy, 40, { col: [fc, '#fff', '#14121f'], sp0: 30, sp1: 160 }); Q.shake = Math.max(Q.shake, 0.5); Snd.play('relic'); Snd.play('boom');
          Q.msg = P.form === 'sin' ? sv('SHADOW ASSASSIN: faster, dashes hit twice as hard!', 'SÁT THỦ BÓNG ĐÊM: nhanh hơn, lướt gây x2 sát thương!') : sv('CRIMSON BRAWLER: dashes heal you, hits are stronger!', 'ĐẤU SĨ HUYẾT LIÊM: lướt trúng hồi máu, đánh mạnh hơn!'); Q.msgT = 3;
        }
        Snd.play('slash'); break;
      }
      case 'gag': { P.armT = P.armDur = 0.4; P.armSpin = false;
        const r = Math.floor(Math.random() * 3), t = nearestFoe(cx, cy, 220);
        if (r === 0) { shootG({ x: cx + f * 6, y: cy - 4, vx: f * 130, vy: -170, g: 420, life: 1.1, dmg: d + 2, expl: 34, shape: 'orb', col: '#14121f', trail: '#ffd34e', sz: 4, f, skill: true }); pop(cx, cy - 26, sv('BOMB!', 'BOM!'), '#ff7a2a'); Snd.play('whoosh'); }
        else if (r === 1) { shootG({ x: cx + f * 6, y: cy, vx: f * 230, vy: -40, g: 120, life: 0.9, dmg: d, stun: 2, pierceN: 3, shape: 'orb', col: '#3a3a46', trail: '#8a8a9a', sz: 5, f, skill: true }); pop(cx, cy - 26, sv('FRYING PAN!', 'CHẢO!'), '#cfd6e6'); Snd.play('clang'); }
        else { const tx = t ? t.x + t.w / 2 : cx + f * 80; shootG({ x: tx, y: Q.cam.y - 10, vx: 0, vy: 520, life: 1.4, dmg: d * 3, flat: true, pierceN: 99, thru: true, shape: 'meteor', col: '#5a5a6a', trail: '#2a2a3a', sz: 7, f, skill: true }); pop(tx, Q.cam.y + 34, sv('ANVIL!', 'ĐE SẮT!'), '#cfd6e6'); Snd.play('whoosh'); }
        break;
      }
      case 'kaynR': {
        if (P.form === 'rhaast') {   // a wide scythe sweep, then back to Shadow
          P.armT = P.armDur = 0.5; P.armSpin = true;
          const r = 74; addRing(cx, cy, '#ff3a3a', r, 0.4); Q.shake = Math.max(Q.shake, 0.5); Snd.play('slash'); Snd.play('boom');
          for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i / 17) * Math.PI, xx = cx + f * Math.cos(a) * r * 0.9, yy = cy + Math.sin(a) * r * 0.6; emit(xx, yy, 2, { col: ['#ff3a3a', '#14121f', '#fff'], sp0: 10, sp1: 50 }); }
          for (const e of foes()) { const dx = e.x + e.w / 2 - cx; if (Math.sign(dx) !== f && Math.abs(dx) > 8) continue; if (Math.hypot(dx, e.y + e.h / 2 - cy) < r + e.w / 2) { dmgFoe(e, d * 3, true); healP(P, 1); } }
          P.form = null; P.hdmg = HERO.kayn.dmg; Q.msg = sv('Back to Shadow form.', 'Quay lại dạng Shadow.'); Q.msgT = 2;
        } else if ((P.dk || 0) >= 100) {   // full Darkin bar: become Rhaast
          P.form = 'rhaast'; P.dk = 0; P.rhN = 0; P.hdmg = HERO.kayn.dmg + 2; addRing(cx, cy, '#ff3a3a', 110, 0.7); emit(cx, cy, 50, { col: ['#ff3a3a', '#14121f', '#fff'], sp0: 30, sp1: 180 }); Q.shake = Math.max(Q.shake, 0.7); Snd.play('relic'); Snd.play('explode');
          Q.msg = sv('RHAAST! Harder hits that heal you.', 'RHAAST! Đánh mạnh hơn và hồi máu khi đánh.'); Q.msgT = 3; P.skCd = 1;
        } else {   // dash through enemies
          P.armT = P.armDur = 0.35; P.armDir = 1; P.armSpin = false;
          const x0 = P.x, hit = new Set(); P.inv = Math.max(P.inv, 0.45);
          for (let k = 0; k < 11; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); emit(P.x + 4, P.y + 7, 2, { col: ['#a15be0', '#14121f'], sp0: 5, sp1: 30, l0: 0.2, l1: 0.4 }); }
          const box = { x: Math.min(x0, P.x) - 4, y: P.y - 6, w: Math.abs(P.x - x0) + 16, h: P.h + 12 };
          for (const e of foes()) if (!hit.has(e) && ov(box, e)) { hit.add(e); dmgFoe(e, d, true); chargeHit(); P.dk = Math.min(100, (P.dk || 0) + 15); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: ['#a15be0', '#fff'], sp0: 30, sp1: 110 }); }
          Snd.play('slash');
        }
        break;
      }
      case 'jerrydash': { P.armT = P.armDur = 0.3;   // a quick slip; enemies next to him get dragged along and knocked out
        const x0 = P.x, grab = foes().filter(e => !e.isBoss && Math.abs(e.x + e.w / 2 - (P.x + 4)) < 44 && Math.abs(e.y + e.h / 2 - (P.y + 7)) < 30); P.inv = Math.max(P.inv, 0.5);
        for (let k = 0; k < 15; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); }
        for (const e of grab) { e.x = P.x + 4 - f * (14 + Math.random() * 10) - e.w / 2; e.stunT = Math.max(e.stunT || 0, 1.4); dmgFoe(e, d, true); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#f0a050', '#fff'], sp0: 20, sp1: 70 }); }
        Snd.play('dash'); if (grab.length) pop(cx, cy - 26, sv('Got you!', 'Kéo theo!'), '#f0a050'); break;
      }
      case 'concert': P.armT = P.armDur = 0.6; P.armSpin = false; P.concT = 3; P.concTick = 0; Snd.play('relic'); pop(cx, cy - 26, sv('LIVE CONCERT!', 'BUỔI HÒA NHẠC!'), '#39c5bb'); break;
      case 'ora': P.oraT = 1.5; P.oraTick = 0; Snd.play('whoosh'); pop(cx, cy - 26, 'ORA ORA ORA!', '#8a7aff'); break;
      case 'theworld': { P.armT = P.armDur = 0.6; P.armDir = 1; P.armSpin = false;
        const G = Q.G; G.tsT = 3.5; G.tsOwner = P; G.tsTick = 0; G.tsKn = []; Q.shake = Math.max(Q.shake, 0.4); Snd.play('chime'); if (Snd.cineHit) Snd.cineHit('drop');
        Q.msg = sv('THE WORLD! Time has stopped.', 'THE WORLD! Thời gian đã ngừng lại.'); Q.msgT = 2.5; break;
      }
      case 'gatling': P.gatT = 1.2; P.gatTick = 0; Snd.play('whoosh'); pop(cx, cy - 26, sv('PUNCH PUNCH PUNCH!', 'ĐẤM ĐẤM ĐẤM!'), '#ff7a5a'); break;
      case 'spindash': P.armT = P.armDur = 0.4; P.mom = 1; P.spinT = 0.7; P.vx = f * RUN * 2; Snd.play('dash'); for (let i = 0; i < 12; i++) emit(cx - f * 6, P.y + P.h, 1, { col: ['#ffffff', '#d0a070'], sp0: 10, sp1: 50, vx: -f * 80, vy: -20 }); break;
      case 'inhale':
        if (P.copy) { shootG({ x: cx + f * 8, y: cy, vx: f * 280, vy: 0, life: 0.9, dmg: d * 2 + 2, pierceN: 5, shape: 'orb', col: '#ffd34e', trail: '#ffffff', sz: 6, f, skill: true }); pop(cx, cy - 22, sv('Spit!', 'Nhả!'), '#ffd34e'); P.copy = null; Snd.play('relic'); }
        else { P.inhT = 0.9; P.inhGot = false; Snd.play('whoosh'); }
        break;
      case 'timestop': {
        const G = Q.G; G.tsT = 4; G.tsOwner = P; G.tsTick = 0; Q.shake = Math.max(Q.shake, 0.4); Snd.play('chime'); if (Snd.cineHit) Snd.cineHit('drop');
        Q.msg = sv('TIME STOP! Only you can move...', 'NGƯNG ĐỌNG THỜI GIAN! Chỉ mình bạn chuyển động...'); Q.msgT = 2.5; break;
      }
      case 'wave': shootG({ x: cx + f * 10, y: cy - 2, vx: f * 190, vy: 0, life: 1, dmg: d, thru: true, pierceN: 99, shape: 'wind', col: s.col, sz: 9, f }); for (let i = 0; i < 12; i++) emit(cx + f * i * 6, cy + 4, 2, { col: [s.col, '#fff'], sp0: 10, sp1: 40, vx: f * 90 }); Snd.play('whoosh'); break;
    }
  }
  // ===================== heroes with their own mechanics =====================
  // the team's drawings (assets/fanheroes): a half-size sprite for menus and films, the full picture for the hero in play
  const FAN_IMG = {}, FAN_SC = 0.5;
  ['kayn', 'rhaast', 'tom', 'jerry', 'luffy', 'sonic', 'kirby', 'jotaro', 'dio', 'miku'].forEach(k => {
    const im = new Image(); im.onload = () => {
      const w = Math.round(im.width * FAN_SC), h = Math.round(im.height * FAN_SC), mk = flip => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; if (flip) { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(im, 0, 0, w, h); return c; };
      const c = mk(false), f = mk(true); FAN_IMG[k] = { im, spr: { c, f, cw: c, fw: f, w, h }, parts: fanParts(k, im) };
    }; im.src = 'assets/fanheroes/' + k + '.png';
  });
  const fanKey = (h, P) => (P && P.form === 'rhaast' && h.fan === 'kayn') ? 'rhaast' : h.fan;
  function custSpr(h, k, f, P) {
    if (h.custom === 'fan') { const o = FAN_IMG[fanKey(h, P)]; return o ? o.spr : getSprite('hero_idle', {}, 0); }
    if (h.custom === 'puff') return puffSprite(k, f, h.sw); return mikuSprite(k === 'big' || k === 'inhale' ? 'idle' : k, f);
  }
  // the hero in play: the drawing at full screen resolution, moved by the shared animator (idle breath, walk, run, jump, hurt red)
  // where the legs start in each picture (fraction of the height): the part below swings as two legs
  // legs of each picture in native pixels: hip row, the leg columns x0..x1 and where the left leg ends (sp); everything else
  // (Kayn's scythe, Rhaast's pole, Miku's twin tails, Jerry's tail...) stays fixed to the body
  const FAN_RIG = { kayn: [36, 3, 26, 14], rhaast: [36, 11, 36, 23], tom: [39, 7, 29, 18], jerry: [38, 12, 37, 24], luffy: [37, 7, 25, 16], sonic: [40, 11, 36, 23], kirby: [33, 3, 41, 22], jotaro: [38, 0, 31, 15], dio: [38, 6, 26, 16], miku: [38, 10, 25, 17] };
  const FAN_ARM = {
    kayn: { r: [27, 2, 38, 46], p: [28, 26], sw: 'slash' }, rhaast: { r: [0, 2, 8, 46], p: [7, 27], sw: 'slash' },
    tom: { r: [28, 24, 37, 38], p: [29, 26], sw: 'swipe' }, luffy: { r: [25, 19, 40, 29], p: [25, 24], sw: 'stretch' },
    sonic: { r: [30, 28, 39, 39], p: [31, 30], sw: 'jab' }, jotaro: { r: [26, 18, 39, 26], p: [27, 21], sw: 'punch' },
    dio: { r: [26, 3, 37, 22], p: [27, 20], sw: 'chop' }, miku: { r: [26, 22, 30, 34], p: [28, 23], sw: 'wave' }
  };
  function fanParts(key, im) {
    const r = FAN_RIG[key] || [Math.round(im.height * 0.8), 0, im.width - 1, Math.round(im.width / 2)], [hy, x0, x1, sp] = r, H = im.height, top = hy - 2;
    const cut = (sx, sy, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, sx, sy, w, h, 0, 0, w, h); return c; };
    const body = document.createElement('canvas'); body.width = im.width; body.height = H; const bx = body.getContext('2d'); bx.drawImage(im, 0, 0); bx.clearRect(x0, hy, x1 - x0 + 1, H - hy);
    const A = FAN_ARM[key]; let arm = null;
    if (A) { const [ax0, ay0, ax1, ay1] = A.r; arm = { c: cut(ax0, ay0, ax1 - ax0 + 1, ay1 - ay0 + 1), x: ax0, y: ay0, px: A.p[0], py: A.p[1], sw: A.sw, len: ax1 - ax0 + 1 }; bx.clearRect(ax0, ay0, ax1 - ax0 + 1, ay1 - ay0 + 1); }
    return { body, L: cut(x0, top, sp - x0 + 1, H - top), R: cut(sp + 1, top, x1 - sp, H - top), lx: x0, rx: sp + 1, top, arm };
  }
  const swingProf = (k, a0, a1) => k < 0.2 ? a0 * ez(k / 0.2) : (k < 0.55 ? a0 + (a1 - a0) * ez((k - 0.2) / 0.35) : a1 * (1 - ez((k - 0.55) / 0.45)));
  function armPose(P, arm, moving, run) {
    const o = { ang: 0, sx: 1, dx: 0 }, k = P.armT > 0 ? 1 - P.armT / (P.armDur || 0.32) : -1, d = P.armDir || 1;
    if (moving) o.ang = Math.sin(P.anim * (run ? 14 : 9)) * 0.14; else o.ang = Math.sin(P.anim * 2.6) * 0.04;   // the arm swings with the steps
    if (arm.sw === 'stretch' && (P.punch || P.gatT > 0)) { const ext = P.punch ? (P.punch.ext || 0) : 20 + Math.random() * 60; o.sx = 1 + ext * 2 / arm.len; o.ang = P.punch ? -(P.punch.dy || 0) / 90 : (Math.random() - 0.5) * 0.4; return o; }
    if (arm.sw === 'punch' && P.oraT > 0) { o.sx = 1 + Math.abs(Math.sin(P.anim * 40)) * 0.9; o.ang = (Math.random() - 0.5) * 0.4; return o; }
    if (k < 0) return o;
    if (P.armSpin) { o.ang = Math.PI * 2 * ez(k); return o; }
    if (arm.sw === 'slash') o.ang = d > 0 ? swingProf(k, -0.8, 1.7) : swingProf(k, 1.5, -1.0);   // scythe: down, then up on the next swing
    else if (arm.sw === 'swipe') o.ang = swingProf(k, -1.2, 1.1);
    else if (arm.sw === 'chop') o.ang = swingProf(k, -0.4, 1.9);
    else if (arm.sw === 'wave') o.ang = swingProf(k, 0.3, -2.3);
    else { const s1 = Math.sin(Math.min(1, k * 1.6) * Math.PI); o.sx = 1 + 0.75 * s1; o.ang = -0.08 * s1; }   // punch / jab: the arm shoots out from the shoulder
    return o;
  }
  // the hero in play: the drawing at full screen resolution, animated like a puppet (body + left leg + right leg)
  function drawFanHero(P, h, x, bot) {
    const key = fanKey(h, P), o = FAN_IMG[key]; if (!o) return false; const im = o.im, W = im.width, H = im.height, pp = o.parts;
    const sp = Math.abs(P.vx), onG = P.onGround, moving = onG && sp > 15, run = sp > RUN * 0.72, f = P.face < 0 ? -1 : 1;
    let bodyY = 0, bodyX = 0, lean = 0, sx = 1, sy = 1; const L = { x: 0, y: 0 }, R = { x: 0, y: 0 };
    if (P.hurtA > 0) { const k = 1 - P.hurtA / 0.36; lean = -0.18 * Math.sin(k * Math.PI); bodyX = -2 * Math.sin(k * Math.PI); }
    else if (!onG) {   // in the air: legs tucked on the way up, dangling on the way down
      const up = P.vy < 0; L.x = 2; L.y = up ? -4 : -1; R.x = -1; R.y = up ? -3 : 0; lean = up ? -0.06 : 0.06; sy = up ? 1.06 : 1; sx = 2 - sy;
      if (h.mech === 'inhale' && P.flutter) { sx = 1.22; sy = 1.18; }
    } else if (P.push > 0) {   // pushing a wall: leaning in, short steps
      const ph = P.anim * 7; L.x = Math.sin(ph) * 2 - 2; L.y = -Math.max(0, Math.sin(ph)) * 2; R.x = -Math.sin(ph) * 2 - 3; R.y = -Math.max(0, -Math.sin(ph)) * 2; lean = 0.24; bodyX = 2;
    } else if (moving) {   // walking / running strides: legs swing and lift, the body bobs twice per cycle and leans forward
      const ph = P.anim * (run ? 14 : 9), amp = run ? 3.6 : 2.3;
      L.x = Math.sin(ph) * amp; L.y = -Math.max(0, Math.sin(ph)) * amp; R.x = -Math.sin(ph) * amp; R.y = -Math.max(0, -Math.sin(ph)) * amp;
      bodyY = -Math.abs(Math.cos(ph)) * (run ? 2 : 1.2); lean = run ? 0.13 : 0.05; if (run) { sx = 1.03; sy = 0.98; }
    } else { bodyY = -Math.max(0, Math.sin(P.anim * 2.6)) * 0.8; sy = 1 + Math.sin(P.anim * 2.6) * 0.012; }   // idle: breathing
    if (P.landA > 0) { const k = P.landA / 0.12; sy *= 1 - 0.14 * k; sx *= 1 + 0.12 * k; bodyY += 1.5 * k; }
    if (h.mech === 'inhale' && P.inhT > 0) sx *= 1.12;
    if (h.mech === 'toon') { if (P.landA > 0) { sx *= 1.2; sy *= 0.8; } else if (!onG) { sy *= P.vy < 0 ? 1.15 : 1.05; sx *= 2 - sy; } }
    let spin = 0; const ak = P.armT > 0 ? 1 - P.armT / (P.armDur || 0.32) : -1;
    if (key === 'sonic' && ak >= 0) spin = Math.PI * 2 * ez(ak) * f;   // Sonic's attack is a spin
    if (key === 'kirby' && ak >= 0) { const q = Math.sin(ak * Math.PI); sx *= 1 + 0.25 * q; sy *= 1 - 0.15 * q; }   // Kirby puffs
    if (key === 'jerry' && ak >= 0) { const q = Math.sin(Math.min(1, ak * 1.5) * Math.PI); R.x += 6 * q; R.y -= 4 * q; lean -= 0.1 * q; }   // Jerry kicks
    const ap = pp.arm ? armPose(P, pp.arm, moving, run) : null;
    const drawArm = () => { if (!ap) return; const a = pp.arm; g.save(); g.translate(-W / 2 + a.px + bodyX, -H + a.py + bodyY); g.rotate(ap.ang); g.translate(ap.dx, 0); g.scale(ap.sx, 1); hiImg(a.c, 0, 0, a.c.width, a.c.height, a.x - a.px, a.y - a.py, a.c.width, a.c.height); g.restore(); };
    const parts = () => {
      const back = moving && Math.sin(P.anim * (run ? 14 : 9)) > 0 ? 'R' : 'L';   // the leg in front is drawn last
      const leg = side => { const A = side === 'L' ? L : R, c = side === 'L' ? pp.L : pp.R, lx = side === 'L' ? pp.lx : pp.rx; hiImg(c, 0, 0, c.width, c.height, -W / 2 + lx + A.x, -H + pp.top + A.y, c.width, c.height); };
      leg(back); hiImg(pp.body, 0, 0, W, H, -W / 2 + bodyX, -H + bodyY, W, H); leg(back === 'L' ? 'R' : 'L'); drawArm();
    };
    g.save(); g.translate(x, bot); if (spin) { g.translate(0, -H * FAN_SC / 2); g.rotate(spin); g.translate(0, H * FAN_SC / 2); } g.rotate(lean * f); g.scale(f * FAN_SC * sx, FAN_SC * sy); g.imageSmoothingEnabled = true;
    if (P.dash > 0) g.globalAlpha = 0.75;
    parts();
    if (P.hurtA > 0 && Math.floor((1 - P.hurtA / 0.36) * 3) === 1) { g.globalAlpha = 0.8; g.filter = 'brightness(0.7) sepia(1) saturate(9) hue-rotate(-45deg)'; parts(); g.filter = 'none'; }
    g.restore(); g.globalAlpha = 1;
    return true;
  }
  // movement effects: footstep dust, take-off and landing dust, speed trails and afterimages, each hero's own particles
  const FAN_TRAIL = { kayn: ['#5a2a8a', '#a15be0'], rhaast: ['#ff3a3a', '#5a0a10'], sonic: ['#4a8bf0', '#ffffff'], dio: ['#ffd34e', '#fff6c0'], jotaro: ['#8a7aff', '#c8b8ff'], miku: ['#39c5bb', '#8ff5ea'], kirby: ['#ff9fd0', '#ffffff'], tom: ['#cfd6e6', '#ffffff'], jerry: ['#f0a050', '#ffffff'], luffy: ['#ffd34e', '#e0453a'] };
  function fanMoveFx(P, h) {
    const key = fanKey(h, P), sp = Math.abs(P.vx), run = sp > RUN * 0.72, col = FAN_TRAIL[key] || ['#ffffff', '#cfd6e6'], fx = P.x + 4, fy = P.y + P.h, f = P.face;
    if (P.onGround && sp > 15) {
      const n = Math.floor(P.anim * (run ? 14 : 9) / Math.PI);
      if (n !== P._stepN) { P._stepN = n; emit(fx - f * 3, fy, run ? 4 : 2, { col: ['#cfd6e6', '#a89880'], sp0: 6, sp1: 24, vy: -18, vx: -f * 20, grav: 60, l0: 0.2, l1: 0.4 }); }
      if (run && Math.random() < 0.5) emit(fx - f * 6, P.y + rr(2, P.h - 2), 1, { col, sp0: 0, sp1: 6, vx: -f * 70, grav: 0, l0: 0.15, l1: 0.3 });
      if (run && (key === 'sonic' || key === 'kayn' || key === 'rhaast' || key === 'jerry')) { (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.16 }); if (P.trail.length > 5) P.trail.shift(); }
    }
    if (P._wasG && !P.onGround && P.vy < -100) emit(fx, fy, 8, { col: ['#cfd6e6', col[0]], sp0: 15, sp1: 50, vy: 10, grav: 40, l0: 0.2, l1: 0.4 });
    if (P._wasG === false && P.onGround) for (let i = -3; i <= 3; i++) emit(fx + i * 3, fy, 1, { col: ['#cfd6e6', '#a89880'], sp0: 10, sp1: 30, vx: i * 18, vy: -20, grav: 80, l0: 0.2, l1: 0.4 });
    P._wasG = P.onGround;
    const R = Math.random();
    if ((key === 'kayn' || key === 'rhaast') && R < 0.18) emit(fx + rr(-6, 6), P.y + rr(0, P.h), 1, { col, sp0: 2, sp1: 8, grav: -40, l0: 0.4, l1: 0.8 });
    if (key === 'dio' && R < 0.1) emit(fx + rr(-8, 8), P.y + rr(-4, P.h), 1, { col: ['#ffd34e', '#ffffff'], sp0: 1, sp1: 6, grav: -10, l0: 0.3, l1: 0.6 });
    if (key === 'jotaro' && R < 0.06) emit(fx + rr(-6, 6), P.y + rr(0, P.h), 1, { col: ['#8a7aff', '#c8b8ff'], sp0: 2, sp1: 8, grav: -30, l0: 0.3, l1: 0.6 });
    if (key === 'kirby' && P.flutter && !P.onGround && R < 0.3) emit(fx + rr(-6, 6), fy, 1, { col: ['#ffe08a', '#ffffff', '#ff9fd0'], sp0: 5, sp1: 20, vy: 20, l0: 0.3, l1: 0.6 });
    if (key === 'miku' && R < (sp > 15 ? 0.05 : 0.015)) pop(fx + rr(-8, 8), P.y - 6, R < 0.01 ? '♫' : '♪', R < 0.008 ? '#ff8fbf' : '#39c5bb');
    if (key === 'sonic' && run && R < 0.25) emit(fx - f * 4, fy - 1, 1, { col: ['#ffe44e', '#ffffff'], sp0: 4, sp1: 20, vx: -f * 40, vy: -20, grav: 120, l0: 0.15, l1: 0.3 });
  }
  // Puff copies what it swallows
  const COPY = { imp: 'fire', wisp: 'spark', ghost: 'spark', shroom: 'spark', spider: 'web', scorpion: 'web', bat: 'wing', beetle: 'stone', knight: 'stone', snowman: 'stone', zombie: 'stone' };
  const COPY_INFO = { fire: { n: { en: 'Fire', vi: 'Lửa' }, col: '#ff7a2a' }, spark: { n: { en: 'Spark', vi: 'Điện' }, col: '#ffe44e' }, web: { n: { en: 'Web', vi: 'Tơ Nhện' }, col: '#e8e8f0' }, wing: { n: { en: 'Wing', vi: 'Cánh' }, col: '#9fe8ff' }, stone: { n: { en: 'Stone', vi: 'Đá' }, col: '#a8a8b8' }, star: { n: { en: 'Star', vi: 'Sao' }, col: '#ffd34e' } };
  // each fan hero's basic attack: reach, height, speed, colour and the effect that is drawn
  const FAN_ATK = {
    kayn: { r: 34, h: 22, cd: 0.38, col: '#a15be0', fx: 'scythe', d: 1 }, rhaast: { r: 42, h: 28, cd: 0.42, col: '#ff3a3a', fx: 'scythe', d: 2 },
    tom: { r: 24, h: 16, cd: 0.32, col: '#ffcf8a', fx: 'claw', d: 0 }, jerry: { r: 18, h: 12, cd: 0.2, col: '#f0a050', fx: 'kick', d: -1 },
    sonic: { r: 30, h: 14, cd: 0.3, col: '#4a8bf0', fx: 'spin', d: 0, lunge: 22 }, jotaro: { r: 26, h: 16, cd: 0.3, col: '#8a7aff', fx: 'punch', d: 1 },
    dio: { r: 24, h: 16, cd: 0.3, col: '#ffd34e', fx: 'chop', d: 0 }, miku: { r: 30, h: 18, cd: 0.3, col: '#39c5bb', fx: 'wave', d: 0 }
  };
  function fanSwing(P, key) {
    const A = FAN_ATK[key], f = P.face, cx = P.x + 4, cy = P.y + 7, down = !P.onGround && act.down;
    if (A.lunge && !down) { moveX(P, f * A.lunge * 0.5); P.vx = f * 200; }
    const box = down ? { x: cx - 10, y: P.y + P.h - 2, w: 20, h: 20 } : { x: f > 0 ? cx : cx - A.r, y: cy - A.h / 2 - 2, w: A.r, h: A.h + 4 };
    const d = Math.max(1, baseDmg() + 2 + A.d + Math.floor(((save.cleared && save.cleared.length) || 0) / 2));
    let any = false;
    for (const e of foes()) {
      if (e.dead || e.hid || (e.cfg && e.cfg.ai === 'blob' && e.st !== 'up') || !ov(box, e)) continue;
      any = true; dmgFoe(e, d, false); chargeHit(); heroOnHit(P, e);
      emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: [A.col, '#ffffff'], sp0: 25, sp1: 110 });
    }
    for (const pz of Q.pz) if (pz.type === 'lever' && !pz.on && ov(box, { x: pz.x - 9, y: pz.y - 15, w: 18, h: 15 })) leverPull(pz);
    for (const pr of Q.projs) if (!pr.dead && !pr.boss && ov(box, { x: pr.x - 3, y: pr.y - 3, w: 6, h: 6 })) { pr.dead = true; emit(pr.x, pr.y, 6, { col: pr.col, sp0: 20, sp1: 60 }); }
    if (any) { Q.freeze = 0.04; Snd.play('hit'); if (down) { P.vy = -250; P.jumps = 1; } } else Snd.play(A.fx === 'kick' || A.fx === 'punch' ? 'whoosh' : 'slash');
    P.fsw = { t: 0.22, fx: A.fx, col: A.col, r: A.r, f, down };
  }
  // the effect of the basic attack, drawn over the hero
  function drawFanSwing(P, x, bot) {
    const w = P.fsw; if (!w || w.t <= 0) return; const k = 1 - w.t / 0.22, a = 1 - k, f = w.f, cy = bot - 8;
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    if (w.down) { g.strokeStyle = hexA(w.col, a); g.lineWidth = 2; g.beginPath(); g.arc(x, bot + 4, 10 + k * 6, 0.2, Math.PI - 0.2); g.stroke(); }
    else if (w.fx === 'scythe') { for (let i = 0; i < 3; i++) { g.strokeStyle = i ? hexA(w.col, a * 0.5) : hexA('#ffffff', a); g.lineWidth = i ? 4 - i : 1.5; g.beginPath(); const r = w.r * 0.8 + i * 2; g.arc(x, cy, r, f > 0 ? -1.4 : Math.PI + 1.4, f > 0 ? -1.4 + 2.6 * Math.min(1, k * 1.6) : Math.PI + 1.4 - 2.6 * Math.min(1, k * 1.6), f < 0); g.stroke(); } }
    else if (w.fx === 'claw') { g.strokeStyle = hexA(w.col, a); g.lineWidth = 1.5; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + f * 8, cy - 8 + i * 4); g.lineTo(x + f * (8 + 14 * Math.min(1, k * 2)), cy + 4 + i * 4); g.stroke(); } }
    else if (w.fx === 'kick') { g.strokeStyle = hexA(w.col, a); g.lineWidth = 2; g.beginPath(); g.arc(x + f * 6, bot - 4, 8, f > 0 ? -0.6 : Math.PI - 0.6, f > 0 ? 0.9 : Math.PI + 0.9, f < 0); g.stroke(); }
    else if (w.fx === 'spin') { g.strokeStyle = hexA(w.col, a); g.lineWidth = 2; g.beginPath(); g.arc(x, cy, 9 + k * 4, 0, Math.PI * 2); g.stroke(); g.strokeStyle = hexA('#ffffff', a * 0.6); g.beginPath(); g.moveTo(x - f * 4, cy); g.lineTo(x - f * 24, cy); g.stroke(); }
    else if (w.fx === 'wave') { for (let i = 0; i < 3; i++) { g.strokeStyle = hexA(i === 1 ? '#ff8fbf' : w.col, a * (1 - i * 0.25)); g.lineWidth = 1.5; g.beginPath(); g.arc(x + f * 4, cy, 6 + i * 6 + k * 10, f > 0 ? -0.8 : Math.PI - 0.8, f > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); } }
    else if (w.fx === 'punch') { const fx = x + f * (8 + 14 * Math.min(1, k * 2.5)); g.fillStyle = hexA(w.col, a); g.fillRect(Math.round(fx) - 3, cy - 3, 6, 6); g.fillStyle = hexA('#ffffff', a); g.fillRect(Math.round(fx + f * 4) - 4, cy, 9, 1); g.fillRect(Math.round(fx + f * 4), cy - 4, 1, 9); }
    else { g.strokeStyle = hexA(w.col, a); g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 6, cy - 10); g.lineTo(x + f * (6 + 18 * Math.min(1, k * 2)), cy + 6); g.stroke(); }
    g.restore(); g.lineWidth = 1;
  }
  function heroAttack(P) {
    const mk = mechOf(P), it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;
    if (isFan(P) && P.hero !== 'luffy' && P.hero !== 'kirby') {
      if (P.atkCd > 0) return true; P.armT = P.armDur = 0.32; P.armDir = -(P.armDir || -1); P.armSpin = false; const key = P.hero === 'kayn' && P.form === 'rhaast' ? 'rhaast' : P.hero, A = FAN_ATK[key] || FAN_ATK.tom; P.atkCd = A.cd;
      fanSwing(P, FAN_ATK[key] ? key : 'tom');
      if (mk === 'stand') { P.standT = 0.32; P.standHit = new Set(); P.standD = baseDmg(); }
      if (mk === 'idol') shootG({ x: P.x + 4 + f * 6, y: P.y + 4, vx: f * 160, vy: -30, home: true, life: 1.3, dmg: Math.max(1, baseDmg()), shape: 'orb', col: Math.random() < 0.5 ? '#39c5bb' : '#ff8fbf', trail: '#ffffff', sz: 3, f });
      if (mk === 'world') shootG({ x: P.x + 4 + f * 6, y: P.y + 6, vx: f * 360, vy: 0, life: 0.7, dmg: baseDmg() + 1, shape: 'bolt', col: '#e8e8f0', trail: '#ffd34e', sz: 2, f });
      return true;
    }
    if (mk === 'stand' && !gun) { P.standT = 0.32; P.standHit = new Set(); P.standD = baseDmg() + 2 + (P.hdmg || 0); return false; }   // Star Platinum punches along with the attack
    if (mk === 'world') { shootG({ x: P.x + 4 + f * 6, y: P.y + 6, vx: f * 360, vy: 0, life: 0.7, dmg: baseDmg() + 1, shape: 'bolt', col: '#e8e8f0', trail: '#ffd34e', sz: 2, f }); return false; }   // a knife with every attack
    if (mk === 'stretch' && !gun) { if (P.punch) return true; const d = baseDmg() + ((it0 && it0.st && it0.st.dmg) || 0) + 1 + (P.hdmg || 0); P.punch = { t: 0, dur: 0.26, dir: f, reach: 92, dy: act.up ? -40 : (act.down && !P.onGround ? 40 : 0), d, hit: new Set() }; Snd.play('whoosh'); return true; }
    if (mk === 'inhale' && !gun) {
      const x = P.x + 4 + f * 6, y = P.y + 6, d = 2 + baseDmg() + (P.hdmg || 0);
      if (P.flutter && !P.onGround) { P.flutter = false; shootG({ x, y, vx: f * 220, vy: 0, life: 0.35, dmg: d, shape: 'wind', col: '#e4fff4', sz: 6, f, skill: true }); Snd.play('whoosh'); return true; }
      const c = P.copy; if (!c) { if (!isFan(P)) return false; if (P.atkCd > 0) return true; P.atkCd = 0.3; P.armT = P.armDur = 0.3; shootG({ x, y, vx: f * 230, vy: 0, life: 0.28, dmg: d, shape: 'wind', col: '#ffd0e4', sz: 6, f, skill: false }); P.fsw = { t: 0.22, fx: 'spin', col: '#ff9fd0', r: 14, f }; Snd.play('whoosh'); return true; }
      if (c === 'fire') { for (let k = -2; k <= 2; k++) shootG({ x, y, vx: f * 170 + rr(-20, 20), vy: k * 22, life: 0.35, dmg: d, burn: 2, shape: 'fire', col: '#ff7a2a', trail: '#ffd34e', sz: 3, f }); Snd.play('flame'); }
      else if (c === 'spark') { nova(P.x + 4, P.y + 7, 38, d + 1); Snd.play('zap'); emit(P.x + 4, P.y + 7, 16, { col: ['#ffe44e', '#ffffff'], sp0: 30, sp1: 120 }); }
      else if (c === 'web') { shootG({ x, y, vx: f * 240, vy: 0, life: 0.9, dmg: d, slowE: 4, shape: 'orb', col: '#e8e8f0', sz: 4, f }); Snd.play('whoosh'); }
      else if (c === 'wing') { for (let k = -1; k <= 1; k++) shootG({ x, y: y + k * 4, vx: f * 300, vy: k * 30, life: 0.7, dmg: d, shape: 'arrow', col: '#9fe8ff', sz: 2, f }); Snd.play('whoosh'); }
      else if (c === 'stone') { if (!P.onGround) { P.stoneT = 1.2; P.stoneLand = false; P.vy = 380; Snd.play('boom'); } else { nova(P.x + 4, P.y + 10, 44, d + 2); Q.shake = Math.max(Q.shake, 0.3); Snd.play('boom'); } }
      else { shootG({ x, y, vx: f * 260, vy: 0, life: 0.8, dmg: d + 2, pierceN: 3, shape: 'orb', col: '#ffd34e', trail: '#fff', sz: 4, f }); Snd.play('relic'); }
      return true;
    }
    return false;
  }
  function mechOf(P) { const h = P && P.hero && HERO[P.hero]; return h ? h.mech || null : null; }
  // a sword hit landed: Kayn's Darkin bar, Rhaast's healing, Tom's frying pans
  function heroOnHit(P, e) {
    const mk = mechOf(P);
    if (mk === 'idol') { P.combo = (P.combo || 0) + 1; if (P.combo % 4 === 0) { for (const p of teamNear(P.x + 4, P.y + 7, 120)) healP(p, 1); pop(P.x + 4, P.y - 18, sv('♪ Encore! Healed', '♪ Encore! Hồi máu'), '#39c5bb'); } }
    if (mk === 'kayn') {
      if (P.form === 'rhaast') { P.rhN = (P.rhN || 0) + 1; if (P.rhN % 3 === 0) healP(P, 1); }
      else if ((P.dk || 0) < 100) { P.dk = Math.min(100, (P.dk || 0) + 12); if (P.dk >= 100 && isMe(P)) { pop(P.x + 4, P.y - 20, sv('DARKIN READY: press R!', 'DARKIN ĐẦY: bấm R!'), '#ff3a3a'); Snd.play('relic'); } }
    }
    if (P.hero === 'tom' && Math.random() < 0.2 && !e.dead) { shootG({ x: e.x + e.w / 2, y: Math.min(e.y - 40, Q.cam.y + 30), vx: 0, vy: 320, life: 0.9, dmg: baseDmg() + 2, stun: 1.6, shape: 'orb', col: '#3a3a46', trail: '#8a8a9a', sz: 5, f: 1, skill: true }); pop(e.x + e.w / 2, e.y - 30, sv('PAN!', 'CHẢO!'), '#cfd6e6'); }
  }
  function heroMech(P, dt, dir) {
    const id = P.hero, mk = mechOf(P); if (!id) return;
    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;
    if (P.armT > 0) P.armT -= dt;
    { const hf = HERO[id]; if (hf && hf.custom === 'fan') fanMoveFx(P, hf); }
    if (mk === 'idol' && P.concT > 0) {   // the concert: 6 beats of sound around the singer
      P.concT -= dt; P.concTick = (P.concTick || 0) - dt;
      if (P.concTick <= 0) { P.concTick = 0.5; const cx = P.x + 4, cy = P.y + 7, d = Math.max(1, Math.round((3 + baseDmg()) * 0.8)); addRing(cx, cy, ['#39c5bb', '#ff8fbf', '#ffe08a'][Math.floor(P.concT * 2) % 3], 80, 0.4); Snd.play('chime'); Q.shake = Math.max(Q.shake, 0.15);
        for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 80 + e.w / 2) { dmgFoe(e, d, true, true); chargeHit(); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#39c5bb', '#ffffff'], sp0: 20, sp1: 80 }); }
        for (let i = 0; i < 3; i++) pop(cx + rr(-30, 30), cy - rr(10, 30), Math.random() < 0.5 ? '♪' : '♫', ['#39c5bb', '#ff8fbf', '#ffe08a'][i]); }
      if (P.concT <= 0) for (const p of teamNear(P.x + 4, P.y + 7, 140)) healP(p, 1);
    }
    if (mk === 'stand' && P.standT > 0) {   // Star Platinum's punch lands a moment after the hero's swing
      P.standT -= dt; const f = P.face, box = { x: f > 0 ? P.x + 8 : P.x - 44, y: P.y - 8, w: 44, h: P.h + 14 };
      if (P.standT < 0.2) for (const e of foes()) if (!P.standHit.has(e) && ov(box, e)) { P.standHit.add(e); dmgFoe(e, P.standD, false); chargeHit(); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: ['#8a7aff', '#fff'], sp0: 20, sp1: 90 }); Snd.play('hit'); }
    }
    if (mk === 'stand' && P.oraT > 0) {
      P.oraT -= dt; P.oraTick = (P.oraTick || 0) - dt;
      if (P.oraTick <= 0) { P.oraTick = 0.06; const f = P.face, box = { x: f > 0 ? P.x + 6 : P.x - 62, y: P.y - 10, w: 64, h: P.h + 18 }; let any = false; for (const e of foes()) if (ov(box, e)) { any = true; dmgFoe(e, Math.max(1, Math.round((2 + baseDmg()) * 0.55)), false, true); if (Math.random() < 0.4) emit(e.x + e.w / 2 + rr(-6, 6), e.y + e.h / 2 + rr(-6, 6), 3, { col: ['#fff', '#8a7aff'], sp0: 20, sp1: 70 }); } if (any) Snd.play('hit'); if (Math.random() < 0.18) pop(P.x + 4 + f * 20, P.y - 14 - rr(0, 10), 'ORA!', '#c8b8ff'); }
    }
    if (mk === 'jerry') {   // drops a snap trap behind himself every few seconds
      P.trapCd = (P.trapCd === undefined ? 3 : P.trapCd) - dt;
      if (P.trapCd <= 0 && P.onGround) { P.trapCd = 5; (Q.G.mtraps = Q.G.mtraps || []).push({ x: P.x + 4 - P.face * 10, y: P.y + P.h, t: 0 }); Snd.play('select'); }
    }
    if (mk === 'momentum') {   // momentum + spin ball
      const same = dir !== 0 && Math.sign(P.vx) === dir;
      if (P.onGround) P.mom = same ? Math.min(1, (P.mom || 0) + dt / 2.2) : (dir === 0 ? Math.max(0, (P.mom || 0) - dt * 1.6) : (P.mom || 0) * 0.3);
      if (P.spinT > 0) P.spinT -= dt;
      const want = (!P.onGround && P.jumps > 0) || (act.down && P.onGround && Math.abs(P.vx) > 50) || P.spinT > 0;
      if (want && !P.ball) { P.ball = true; P.y += 6; P.h = 8; Snd.play('whoosh'); }
      else if (!want && P.ball && P.onGround) { const tx0 = Math.floor(P.x / TS), tx1 = Math.floor((P.x + P.w - 0.01) / TS), ty = Math.floor((P.y - 6) / TS); if (!solid(tx0, ty) && !solid(tx1, ty)) { P.ball = false; P.y -= 6; P.h = 14; } }
      if (P.ball) {
        P.spin = (P.spin || 0) + dt * (6 + Math.abs(P.vx) / 12) * P.face;
        for (const e of foes()) {
          if (e.ballT && Q.t - e.ballT < 0.35) continue; if (!ov({ x: P.x - 2, y: P.y - 2, w: P.w + 4, h: P.h + 4 }, e)) continue;
          e.ballT = Q.t; dmgFoe(e, Math.round((2 + baseDmg() + (P.hdmg || 0)) * (1 + (P.mom || 0))), true); chargeHit(); P.inv = Math.max(P.inv, 0.3);
          if (!P.onGround) P.vy = -230; else if (!e.isBoss) { e.vx = P.face * 160; e.vy = -120; }
          emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: ['#ffb04a', '#fff', '#ff4a3a'], sp0: 30, sp1: 120 }); Snd.play('hit');
        }
      }
      if ((P.mom || 0) > 0.7 && P.onGround && Math.random() < 0.6) emit(P.x + 4 - P.face * 6, P.y + P.h - 2, 1, { col: ['#ffffff', '#ffd0a0'], sp0: 0, sp1: 10, vx: -P.face * 60, grav: 0, l0: 0.15, l1: 0.3 });
    }
    if (id === 'meo') {   // Squeak the mouse runs along and sets traps
      const m = P.mouse || (P.mouse = { x: P.x - 14, y: P.y + P.h, f: 1, cd: 4 });
      const tx = P.x + 4 - P.face * 16; m.x += clamp(tx - m.x, -170 * dt, 170 * dt); if (Math.abs(tx - m.x) > 1) m.f = tx > m.x ? 1 : -1; m.y = sumGround(m.x, P.y + P.h); if (Math.abs(m.x - P.x) > 200) m.x = P.x;
      m.cd -= dt;
      if (m.cd <= 0) { const t = nearestFoe(m.x, m.y - 6, 140); if (t && !t.isBoss) { m.cd = 6; (Q.G.mtraps = Q.G.mtraps || []).push({ x: m.x, y: m.y, t: 0 }); Snd.play('select'); pop(m.x, m.y - 12, sv('Trap set!', 'Đặt bẫy!'), '#ffd34e'); } else m.cd = 1; }
    }
    if (mk === 'stretch') {   // the stretching arm
      const pu = P.punch;
      if (pu) {
        pu.t += dt; const k = pu.t / pu.dur, ext = Math.sin(Math.min(1, k) * Math.PI) * pu.reach; pu.ext = ext;
        const fx = P.x + 4 + pu.dir * ext, fy = P.y + 5 + (pu.dy || 0) * ext / pu.reach;
        for (const e of foes()) if (!pu.hit.has(e) && ov({ x: fx - 5, y: fy - 5, w: 10, h: 10 }, e)) { pu.hit.add(e); dmgFoe(e, pu.d, false); chargeHit(); Snd.play('hit'); Q.freeze = 0.04; emit(fx, fy, 10, { col: ['#fff', '#ffd34e', '#ff7a5a'], sp0: 20, sp1: 90 }); if (!e.isBoss) { e.vx = pu.dir * 180; e.vy = -110; } }
        if (k >= 1) P.punch = null;
      }
      if (P.gatT > 0) {
        P.gatT -= dt; P.gatTick = (P.gatTick || 0) - dt;
        if (P.gatTick <= 0) { P.gatTick = 0.07; const box = { x: P.face > 0 ? P.x + 6 : P.x - 70, y: P.y - 6, w: 72, h: P.h + 12 }; let any = false; for (const e of foes()) if (ov(box, e)) { any = true; dmgFoe(e, Math.max(1, Math.round((2 + baseDmg()) * 0.5)), false, true); if (Math.random() < 0.4) emit(e.x + e.w / 2 + rr(-5, 5), e.y + e.h / 2 + rr(-5, 5), 3, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 60 }); } if (any) Snd.play('hit'); }
      }
    }
    if (mk === 'inhale') {   // inhale: pull small enemies into the mouth and copy them; only air = puff up and float
      if (P.onGround) P.flutter = false;
      if (P.inhT > 0) {
        P.inhT -= dt; const mx = P.x + 4 + P.face * 8, my = P.y + 6;
        if (Math.random() < 0.9) { const a = (Math.random() - 0.5) * 0.9, r = 50 + Math.random() * 20; emit(mx + P.face * Math.cos(a) * r, my + Math.sin(a) * r, 1, { col: ['#ffffff', '#cfeee4'], sp0: 0, sp1: 4, vx: -P.face * 140 * Math.cos(a), vy: -Math.sin(a) * 140, grav: 0, l0: 0.25, l1: 0.35 }); }
        for (const e of foes()) {
          if (e.isBoss || isBig(e) || e.hid || e.dead) continue; const dx = e.x + e.w / 2 - mx, dy = e.y + e.h / 2 - my, dd = Math.hypot(dx, dy);
          if (dd > 72 || (Math.sign(dx) !== P.face && Math.abs(dx) > 4) || Math.abs(dy) > 10 + dd * 0.5) continue;
          e.x -= dx / (dd || 1) * 150 * dt; e.y -= dy / (dd || 1) * 150 * dt; e.vx = 0; e.stunT = Math.max(e.stunT || 0, 0.2);
          if (dd < 12) { e.dead = true; onKill(e); P.inhGot = true; P.copy = COPY[e.cfg && e.cfg.spr] || 'star'; P.inhT = 0; Snd.play('relic'); const ci = COPY_INFO[P.copy]; pop(P.x + 4, P.y - 20, sv('Copy: ', 'Sao chép: ') + LN(ci.n) + '!', ci.col); emit(mx, my, 16, { col: [ci.col, '#ffffff'], sp0: 20, sp1: 80 }); break; }
        }
        if (P.inhT <= 0 && !P.inhGot) { P.flutter = true; if (P.onGround) { P.vy = -120; P.onGround = false; } P.jumps = Math.max(P.jumps, 1); Snd.play('djump'); pop(P.x + 4, P.y - 18, sv('Puffed up!', 'Phồng bay!'), '#7ee8c0'); }
      }
      if (P.stoneT > 0) { P.stoneT -= dt; if (P.onGround && !P.stoneLand) { P.stoneLand = true; P.stoneT = 0; Q.shake = Math.max(Q.shake, 0.5); Snd.play('boom'); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - P.x - 4) < 50 && Math.abs(e.y + e.h - P.y - P.h) < 30) dmgFoe(e, 4 + baseDmg(), true); for (let i = -4; i <= 4; i++) emit(P.x + 4 + i * 8, P.y + P.h, 2, { col: ['#a8a8b8', '#fff'], sp0: 15, sp1: 60, vy: -60 }); } }
    }
  }
  // world parts of the mechanics: mouse traps and the time stop
  function updateTimeStop(dt) {
    const G = Q.G;
    if (G.mtraps && G.mtraps.length) {
      for (const tr of G.mtraps) { tr.t += dt; for (const e of foes()) if (!e.isBoss && !tr.dead && ov({ x: tr.x - 5, y: tr.y - 4, w: 10, h: 4 }, e)) { tr.dead = true; dmgFoe(e, 4 + baseDmg(), true); e.stunT = Math.max(e.stunT || 0, 2); e.flatT = 0.6; Snd.play('clang'); pop(tr.x, tr.y - 14, sv('SNAP!', 'TÁCH!'), '#ffd34e'); emit(tr.x, tr.y - 3, 8, { col: ['#cfd6e6', '#ffd34e'], sp0: 20, sp1: 70 }); } }
      G.mtraps = G.mtraps.filter(tr => !tr.dead && tr.t < 20);
    }
    if (!(G.tsT > 0)) return;
    G.tsT -= dt; const P = G.tsOwner || Q.P;
    G.tsTick = (G.tsTick || 0) - dt; if (G.tsTxtT > 0) G.tsTxtT -= dt;
    if (mechOf(P) === 'world') {
      if (G.tsTick <= 0) { G.tsTick = 0.05; const list = foes().filter(e => Math.abs(e.x - P.x) < VW * 0.6 && Math.abs(e.y - P.y) < VH * 0.6); const t = list[Math.floor(Math.random() * list.length)];
        if (t) { const a = Math.random() * 6.283, r = 30 + Math.random() * 40, kx = t.x + t.w / 2 + Math.cos(a) * r, ky = t.y + t.h / 2 + Math.sin(a) * r * 0.7; (G.tsKn = G.tsKn || []).push({ x: kx, y: ky, t }); t.tsD = (t.tsD || 0) + Math.max(1, Math.round((2 + baseDmg()) * 0.5)); if (G.tsKn.length % 6 === 0) Snd.play('select'); } }
    } else if (G.tsTick <= 0) { G.tsTick = 0.07; const t = nearestFoe(P.x + 4 + P.face * 20, P.y + 6, 90); if (t) { t.tsD = (t.tsD || 0) + Math.max(1, Math.round((2 + baseDmg()) * 0.6)); G.tsHit = { x: t.x + t.w / 2 + rr(-6, 6), y: t.y + t.h / 2 + rr(-6, 6) }; if (!(G.tsTxtT > 0)) { pop(P.x + 4 + P.face * 14, P.y - 16, 'TA-TA-TA!', '#a98bff'); G.tsTxtT = 0.5; } Snd.play('hit'); } else G.tsHit = null; }
    if (G.tsT <= 0) {
      G.tsT = 0; G.tsHit = null; Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.6);
      for (const k of G.tsKn || []) { const tx = k.t.x + k.t.w / 2, ty = k.t.y + k.t.h / 2, d = Math.hypot(tx - k.x, ty - k.y) || 1; shootG({ x: k.x, y: k.y, vx: (tx - k.x) / d * 420, vy: (ty - k.y) / d * 420, life: 0.4, dmg: 1, quiet: true, shape: 'bolt', col: '#e8e8f0', sz: 2, f: tx > k.x ? 1 : -1, skill: true }); }
      G.tsKn = [];
      for (const e of foes()) if (e.tsD) { const d = e.tsD; e.tsD = 0; dmgFoe(e, d, true); emit(e.x + e.w / 2, e.y + e.h / 2, 24, { col: ['#a98bff', '#fff', '#ffd34e'], sp0: 40, sp1: 160 }); pop(e.x + e.w / 2, e.y - 8, '-' + d, '#ffd34e'); }
      Q.msg = sv('Time flows again.', 'Thời gian chạy lại.'); Q.msgT = 1.5;
    }
  }
  const STAND_SW = { a: '#d8d0ff', A: '#6a5ae0', q: '#1a1a5a', b: '#3a3aa0', r: '#ffd34e', f: '#2a2a6a', o: '#8a7aff' }, WORLD_SW = { a: '#fff6c0', A: '#e0c040', q: '#5a4a10', b: '#a08020', r: '#3a9a5a', f: '#ffe08a', o: '#ffd34e' };
  const GUARD_SW = { a: '#e8d8ff', A: '#7a5ad0', q: '#2a1a5a', b: '#4a2a8a', r: '#ffd34e', f: '#ffd34e', o: '#a98bff' };
  let tsCv = null;
  function drawTimeStop() {
    const G = Q.G, el = 4 - G.tsT, P = G.tsOwner || Q.P, cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    if (!tsCv) tsCv = mkCanvas(VW, VH); const [fc, fx] = tsCv; fx.globalCompositeOperation = 'copy'; fx.drawImage(g.canvas, 0, 0);
    g.save(); g.filter = 'grayscale(1) contrast(1.15) brightness(0.92)'; g.drawImage(fc, 0, 0); g.restore();
    if (el < 0.7) { const cx = P.x + 4 - cx0, cy = P.y + 7 - cy0, r = Math.sin(el / 0.7 * Math.PI) * 420; g.save(); g.globalCompositeOperation = 'difference'; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.restore(); }
    drawPlayer(cx0, cy0);   // only the heroes keep their colours
    for (const k of G.tsKn || []) { const kx = k.x - cx0, ky = k.y - cy0, a = Math.atan2(k.t.y + k.t.h / 2 - k.y, k.t.x + k.t.w / 2 - k.x); g.save(); g.translate(Math.round(kx), Math.round(ky)); g.rotate(a); g.fillStyle = '#e8e8f0'; g.fillRect(-4, -1, 7, 2); g.fillStyle = '#ffd34e'; g.fillRect(-6, -1, 2, 2); g.restore(); }
    const world = mechOf(P) === 'world', x = Math.round(P.x + 4 - cx0 - P.face * 8), bot = Math.round(P.y + P.h - cy0 - 4 + Math.sin(Q.t * 3) * 2), spr = getSprite('hero_idle4', world ? WORLD_SW : GUARD_SW, 0);
    g.save(); g.globalAlpha = 0.7; g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, x, bot, P.face < 0, false, 1.6, 1.6); g.restore();
    if (G.tsHit) { for (let i = 0; i < 7; i++) { const fx2 = x + P.face * (16 + Math.random() * 24), fy = bot - 22 + rr(-8, 8); g.fillStyle = '#c8b8ff'; g.fillRect(Math.round(fx2) - 3, Math.round(fy) - 2, 6, 5); g.fillStyle = '#ffffff'; g.fillRect(Math.round(fx2) - 1, Math.round(fy) - 1, 2, 2); } const hx = G.tsHit.x - cx0, hy = G.tsHit.y - cy0; g.fillStyle = '#ffffff'; g.fillRect(hx - 5, hy, 11, 1); g.fillRect(hx, hy - 5, 1, 11); }
    if (world) txt('THE WORLD', VW / 2, 46, { al: 'center', size: 7, bold: true, col: '#ffd34e', ol: '#14121f' });
    txt(Math.max(0, G.tsT).toFixed(1) + 's', VW / 2, 34, { al: 'center', size: 9, bold: true, col: '#c8b8ff', ol: '#14121f' });
  }
  // drawing: the spin ball and the cartoon squash & stretch replace the normal body
  function heroMechBody(P, spr, x, bot, hh) {
    if (P.ball && hh) {
      const r = 6, cy = bot - r, c = hh.sw;
      if ((P.mom || 0) > 0.5) { for (let i = 1; i <= 3; i++) { g.globalAlpha = 0.28 - i * 0.07; disc(g, Math.round(x - P.face * i * 6), cy, r, c.A); } g.globalAlpha = 1; }
      disc(g, x, cy, r + 1, '#14121f'); disc(g, x, cy, r, c.A);
      g.save(); g.translate(x, cy); g.rotate(P.spin || 0); g.fillStyle = c.q; for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.fillRect(-1, -r, 2, r); } g.fillStyle = c.a; g.fillRect(-3, -3, 2, 2); g.restore();
      return true;
    }
    if (hh && hh.custom === 'fan' && drawFanHero(P, hh, x, bot)) return true;
    if (hh && hh.mech === 'toon') {
      let sx = 1, sy = 1, rot = 0;
      if (P.hurtA > 0) { sx = 1.3; sy = 1.25; } else if (P.landA > 0) { sx = 1.45; sy = 0.6; } else if (!P.onGround) { sy = P.vy < 0 ? 1.28 : 1.1; sx = 2 - sy; } else if (Math.abs(P.vx) > 15) { const k = Math.sin(P.anim * 18); sx = 1 + 0.14 * k; sy = 1 - 0.12 * k; rot = P.face * 0.12; }
      drawSprT(g, spr, x, bot, P.face < 0, false, sx, sy, rot);
      if (P.hurtA > 0) { const ey = bot - 18, ex = x + P.face * 2; for (const o of [-3, 2]) { disc(g, ex + o, ey, 3, '#14121f'); disc(g, ex + o, ey, 2, '#ffffff'); g.fillStyle = '#14121f'; g.fillRect(ex + o, ey, 1, 1); } }
      return true;
    }
    return false;
  }
  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, mk = mechOf(P), cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    drawFanSwing(P, x, bot);
    if (mk === 'idol' && P.concT > 0) { g.save(); g.globalCompositeOperation = 'lighter'; ['#39c5bb', '#ff8fbf', '#ffe08a'].forEach((c, i) => { const a = Math.sin(Q.t * 3 + i * 2) * 0.35, sx = x + (i - 1) * 40; const gr = g.createLinearGradient(sx, 0, x, bot); gr.addColorStop(0, hexA(c, 0.28)); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 4, 0); g.lineTo(sx + 4, 0); g.lineTo(x + a * 30 + 14, bot); g.lineTo(x + a * 30 - 14, bot); g.fill(); }); g.restore(); }
    if (mk === 'kayn') { const w = 16; g.fillStyle = '#14121f'; g.fillRect(x - w / 2 - 1, bot - 30, w + 2, 3); g.fillStyle = P.form === 'rhaast' ? '#ff3a3a' : '#a15be0'; g.fillRect(x - w / 2, bot - 29, Math.round(w * (P.form === 'rhaast' ? 1 : (P.dk || 0) / 100)), 1); if (P.form === 'rhaast' || (P.dk || 0) >= 100) drawAura(x, bot - 10, 16, '#ff3a3a', 0.3 + Math.sin(Q.t * 6) * 0.1); }
    if (mk === 'stand' && (P.standT > 0 || P.oraT > 0)) {   // the Stand: a tall spirit that steps out in front of the hero
      const f = P.face, sx = x + f * 10, sb = bot - 2 + Math.sin(Q.t * 4), spr = getSprite('hero_idle4', STAND_SW, 0);
      g.save(); g.globalAlpha = 0.7; g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, sx, sb, f < 0, false, 1.5, 1.5); g.restore();
      const n = P.oraT > 0 ? 7 : 1; for (let i = 0; i < n; i++) { const fx = sx + f * (12 + (n > 1 ? Math.random() * 36 : (0.32 - P.standT) * 90)), fy = sb - 18 + (n > 1 ? rr(-8, 8) : 0); g.fillStyle = '#8a7aff'; g.fillRect(Math.round(fx) - 3, Math.round(fy) - 2, 6, 5); g.fillStyle = '#ffffff'; g.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 2, 2); }
    }
    if (mk === 'jerry' && Q.G.mtraps) for (const tr of Q.G.mtraps) { const tx = Math.round(tr.x - cx0), ty = Math.round(tr.y - cy0); g.fillStyle = '#8a5a34'; g.fillRect(tx - 5, ty - 2, 10, 2); g.fillStyle = '#cfd6e6'; g.fillRect(tx - 4, ty - 4, 8, 1); g.fillRect(tx - 4, ty - 4, 1, 2); g.fillRect(tx + 3, ty - 4, 1, 2); g.fillStyle = '#ffd34e'; g.fillRect(tx - 1, ty - 3, 2, 1); }
    if (id === 'liem') { for (let i = 0; i < 6; i++) { g.fillStyle = i < (P.ess || 0) ? (P.form === 'bru' ? '#ff4a3a' : '#3ad6ff') : 'rgba(255,255,255,.2)'; g.fillRect(x - 9 + i * 3, bot - 28, 2, 2); } if (P.form) drawAura(x, bot - 8, 16, P.form === 'bru' ? '#ff4a3a' : '#3ad6ff', 0.35); }
    if (mk === 'stretch' && !isFan(P)) {
      const sx0 = x + P.face * 3, sy0 = bot - 9, arm = (ex, ey, w) => { g.strokeStyle = '#14121f'; g.lineWidth = w + 2; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#ffd8b0'; g.lineWidth = w; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(ex, ey); g.stroke(); g.lineWidth = 1; disc(g, Math.round(ex), Math.round(ey), 3, '#14121f'); disc(g, Math.round(ex), Math.round(ey), 2, '#ffd8b0'); };
      const pu = P.punch; if (pu && pu.ext > 2) arm(x + pu.dir * (3 + pu.ext), sy0 + (pu.dy || 0) * pu.ext / pu.reach, pu.ext > 50 ? 1.5 : 2.5);
      if (P.gatT > 0) for (let i = 0; i < 6; i++) arm(x + P.face * (10 + Math.random() * 58), bot - 14 + rr(-7, 7), 1.5);
    }
    if (id === 'meo' && P.mouse) {
      const m = P.mouse, mx = Math.round(m.x - cx0), my = Math.round(m.y - cy0), hop = Math.abs(Math.sin(Q.t * 16)) > 0.5 ? -1 : 0;
      g.fillStyle = '#14121f'; g.fillRect(mx - 4, my - 5 + hop, 9, 5); g.fillStyle = '#9a9aaa'; g.fillRect(mx - 3, my - 4 + hop, 7, 3); g.fillRect(mx + m.f * 3 - 1, my - 7 + hop, 3, 3); g.fillStyle = '#ff9fd0'; g.fillRect(mx + m.f * 3, my - 6 + hop, 1, 1); g.fillStyle = '#14121f'; g.fillRect(mx + m.f * 4, my - 4 + hop, 1, 1);
      g.strokeStyle = '#ff9fd0'; g.beginPath(); g.moveTo(mx - m.f * 4, my - 2 + hop); g.quadraticCurveTo(mx - m.f * 8, my - 6, mx - m.f * 10, my - 3); g.stroke();
    }
    if (id === 'meo' && Q.G.mtraps) for (const tr of Q.G.mtraps) { const tx = Math.round(tr.x - cx0), ty = Math.round(tr.y - cy0); g.fillStyle = '#8a5a34'; g.fillRect(tx - 5, ty - 2, 10, 2); g.fillStyle = '#cfd6e6'; g.fillRect(tx - 4, ty - 4, 8, 1); g.fillRect(tx - 4, ty - 4, 1, 2); g.fillRect(tx + 3, ty - 4, 1, 2); g.fillStyle = '#ffd34e'; g.fillRect(tx - 1, ty - 3, 2, 1); }
    if (mk === 'inhale') {
      const top = bot - (P.flutter && !P.onGround ? 24 : 18), hx = x;
      if (P.copy === 'fire') { g.fillStyle = '#ff7a2a'; g.fillRect(hx - 3, top - 2, 6, 2); g.fillStyle = '#ffd34e'; for (let i = -2; i <= 2; i += 2) g.fillRect(hx + i, top - 4 - Math.round(Math.abs(Math.sin(Q.t * 9 + i)) * 2), 1, 2); }
      else if (P.copy === 'spark') { g.fillStyle = '#14121f'; g.fillRect(hx, top - 5, 1, 5); disc(g, hx, top - 6, 2, '#ffe44e'); if (Math.random() < 0.3) emit(P.x + 4, P.y - 10, 1, { col: '#ffe44e', sp0: 5, sp1: 20, l0: 0.1, l1: 0.2 }); }
      else if (P.copy === 'web') { g.fillStyle = '#e8e8f0'; g.fillRect(hx - 5, top - 2, 10, 3); g.fillStyle = '#8a8a9a'; g.fillRect(hx - 3, top - 1, 1, 1); g.fillRect(hx + 2, top - 1, 1, 1); }
      else if (P.copy === 'wing') { g.fillStyle = '#9fe8ff'; g.fillRect(hx - 7, top + 2, 3, 2); g.fillRect(hx - 9, top, 2, 2); g.fillRect(hx + 4, top + 2, 3, 2); g.fillRect(hx + 7, top, 2, 2); }
      else if (P.copy === 'stone') { g.fillStyle = '#6a6a7a'; g.fillRect(hx - 5, top - 1, 10, 3); g.fillStyle = '#a8a8b8'; g.fillRect(hx - 4, top - 1, 8, 1); }
      else if (P.copy === 'star') { g.fillStyle = '#ffd34e'; g.fillRect(hx - 1, top - 4, 3, 3); g.fillRect(hx - 2, top - 3, 5, 1); }
      if (P.inhT > 0) { g.strokeStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.25, r1 = 14 + ((Q.t * 160 + i * 17) % 50); g.beginPath(); g.moveTo(x + P.face * (8 + r1) * Math.cos(a), bot - 9 + r1 * Math.sin(a)); g.lineTo(x + P.face * (14 + r1) * Math.cos(a), bot - 9 + (r1 + 6) * Math.sin(a)); g.stroke(); } }
    }
    if (mk === 'momentum' && !P.ball && (P.mom || 0) > 0.6) { g.strokeStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 3; i++) { const y = bot - 4 - i * 5; g.beginPath(); g.moveTo(x - P.face * 8, y); g.lineTo(x - P.face * (16 + Math.random() * 10), y); g.stroke(); } }
  }
  // ---------- hats and accessories (drawn on top of the recoloured hero) ----------
  function drawHat(h, x, bot, f) {
    const c = h.hatCol || '#fff', t = Q ? Q.t : sceneT, top = bot - 21, R = (a, b, w, hh, col) => { g.fillStyle = col || c; g.fillRect(Math.round(x + (f > 0 ? a : -a - w)), Math.round(top + b), w, hh); }, K = '#1b1626';
    switch (h.hat) {
      case 'longtwin': { const sw = Math.round(Math.sin(t * 5) * 1.5); R(-6, 0, 12, 4); R(-5, 3, 10, 2); R(-9, 3, 3, 14); R(6, 3, 3, 14); R(-9 + sw, 16, 3, 6); R(6 - sw, 16, 3, 6); R(-9 + sw, 21, 3, 2, '#7ef0e6'); R(6 - sw, 21, 3, 2, '#7ef0e6'); R(-9, 2, 3, 2, '#2a2e40'); R(6, 2, 3, 2, '#2a2e40'); R(-7, 1, 2, 2, '#7ef0e6'); break; }
      case 'twin': R(-8, 3, 3, 9); R(5, 3, 3, 9); R(-9, 10, 3, 4); R(6, 10, 3, 4); R(-7, 2, 2, 2, '#ff7fb0'); R(5, 2, 2, 2, '#ff7fb0'); break;
      case 'hood': case 'hoodg': R(-6, 0, 12, 4, K); R(-5, 1, 10, 3); R(-7, 3, 2, 8); R(5, 3, 2, 8); R(-6, 0, 3, 2); break;
      case 'mask': R(-5, 7, 10, 2); R(-7, 7, 2, 1); R(-10, 8, 4, 1); R(-12, 9, 3, 1); break;
      case 'collar': R(-7, 8, 3, 5); R(4, 8, 3, 5); R(-7, 7, 1, 2, '#c0304a'); R(6, 7, 1, 2, '#c0304a'); break;
      case 'leaf': R(-1, -3, 2, 4, '#2b8a3e'); R(-4, -5, 4, 2); R(1, -6, 4, 2); R(-5, -4, 1, 1); R(4, -5, 1, 1); break;
      case 'crystal': R(-4, -3, 2, 4); R(-1, -6, 2, 7); R(2, -3, 2, 4); R(-1, -5, 1, 2, '#fff'); break;
      case 'horns': R(-6, -1, 2, 3); R(-7, -3, 2, 2); R(4, -1, 2, 3); R(5, -3, 2, 2); break;
      case 'spiky': R(-5, -2, 2, 3); R(-2, -4, 2, 5); R(1, -3, 2, 4); R(4, -2, 2, 3); break;
      case 'feather': R(3, -6, 2, 7); R(4, -8, 2, 3, '#fff'); R(2, -4, 1, 2); break;
      case 'helm': R(-6, 0, 12, 4); R(-6, 4, 2, 4); R(4, 4, 2, 4); R(-1, -4, 2, 4, '#e0453a'); R(-3, -3, 2, 2, '#e0453a'); R(-5, 2, 10, 1, '#ffffff'); break;
      case 'star': { const yy = -7 + Math.round(Math.sin(t * 3)); R(-1, yy - 2, 2, 6); R(-3, yy, 6, 2); R(0, yy, 1, 1, '#fff'); break; }
      case 'cat': R(-6, -3, 3, 4); R(3, -3, 3, 4); R(-5, -2, 1, 2, '#ff7fb0'); R(4, -2, 1, 2, '#ff7fb0'); break;
      case 'flower': R(3, 0, 4, 4); R(4, 1, 2, 2, '#ffd34e'); R(2, 1, 1, 2); R(7, 1, 1, 2); break;
      case 'dino': R(-6, 0, 12, 4); R(-8, 2, 2, 2); R(-8, 5, 2, 2); R(-7, 8, 2, 2); R(-4, -2, 2, 2, '#ff9a4a'); R(0, -3, 2, 3, '#ff9a4a'); R(-5, 4, 1, 1, '#fff'); break;
      case 'bunny': { const wob = Math.round(Math.sin(t * 5)); R(-4, -9 + wob, 3, 10); R(1, -10, 3, 11); R(-3, -8 + wob, 1, 7, '#ff9fd0'); R(2, -9, 1, 8, '#ff9fd0'); break; }
      case 'cap': R(-5, 0, 10, 3); R(3, 2, 6, 1); R(-4, 0, 3, 1, '#fff'); break;
      case 'skull': R(-5, 1, 10, 7); R(-3, 4, 2, 2, K); R(1, 4, 2, 2, K); R(-2, 7, 4, 1, K); R(-6, 0, 12, 1, '#3a3a4a'); break;
      case 'halo': { const yy = top - 3 + Math.round(Math.sin(t * 3)); g.strokeStyle = c; g.lineWidth = 1; g.beginPath(); g.ellipse(x, yy, 5, 1.6, 0, 0, 7); g.stroke(); g.globalAlpha = 0.35; g.strokeStyle = '#fff'; g.beginPath(); g.ellipse(x, yy, 6, 2.2, 0, 0, 7); g.stroke(); g.globalAlpha = 1; break; }
      case 'tiara': R(-4, 0, 8, 1); R(-4, -2, 1, 2); R(-1, -3, 2, 3); R(3, -2, 1, 2); R(-1, -2, 2, 1, '#a98bff'); break;
      case 'goggles': R(-6, 2, 12, 1, '#5a3a22'); R(-4, 1, 3, 3); R(1, 1, 3, 3); R(-3, 2, 1, 1, '#9fe8ff'); R(2, 2, 1, 1, '#9fe8ff'); break;
      case 'witch': R(-8, 1, 16, 2); R(-5, -2, 10, 3); R(-3, -6, 7, 4); R(0, -10, 4, 4); R(3, -11, 3, 2); R(-5, 0, 10, 1, '#9be564'); break;
      case 'bandana': R(-6, 1, 12, 3); R(-9, 2, 3, 2); R(-11, 3, 2, 2); R(-4, 2, 2, 1, '#fff'); break;
      case 'reaper': R(-10, -7, 1, 24, '#5a4a3a'); R(-17, -8, 8, 2, '#cfe8ff'); R(-18, -6, 3, 2, '#cfe8ff'); R(-19, -4, 2, 2, '#9fe8ff'); R(-7, -1, 14, 5); R(-6, 4, 12, 2); R(-7, 3, 2, 9); R(5, 3, 2, 9); R(-1, 5, 2, 1, '#3ad6ff'); R(2, 5, 2, 1, '#3ad6ff'); break;
      case 'tabby': { const sw2 = Math.round(Math.sin(t * 6) * 1.5); R(-6, -3, 3, 4); R(3, -3, 3, 4); R(-5, -2, 1, 2, '#ff9fd0'); R(4, -2, 1, 2, '#ff9fd0'); R(-2, 0, 1, 2, '#8a4a1a'); R(1, 0, 1, 2, '#8a4a1a'); R(6, 7, 3, 1, '#ffffff'); R(6, 9, 3, 1, '#ffffff'); R(-9, 13, 2, 3); R(-11 + sw2, 10, 2, 4); R(-12 + sw2, 7, 2, 3, '#8a4a1a'); break; }
      case 'rubber': R(-6, -1, 12, 3); R(-5, -3, 2, 2); R(-1, -4, 2, 3); R(3, -3, 2, 2); R(-6, 2, 12, 1, '#e0453a'); R(-9, 2, 3, 1, '#e0453a'); R(-10, 3, 2, 1, '#e0453a'); break;
      case 'shell': R(-6, -1, 12, 4); R(-6, 1, 12, 1, '#6a3418'); R(-7, -3, 2, 2, '#ffd0a0'); R(5, -3, 2, 2, '#ffd0a0'); R(-9, 9, 4, 9); R(-9, 11, 4, 1, '#6a3418'); R(-9, 14, 4, 1, '#6a3418'); break;
      case 'chrono': { R(-6, 1, 12, 2); R(-1, -1, 3, 3, '#fff6c0'); R(0, 0, 1, 1, '#3a2a10'); for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.09; g.fillStyle = i ? '#ffd34e' : '#a98bff'; g.fillRect(Math.round(x + Math.cos(a) * 11) - 1, Math.round(top + 6 + Math.sin(a) * 4) - 1, 3, 3); } break; }
      case 'onihorn': R(-1, -5, 3, 6); R(0, -7, 2, 2); R(-5, 0, 2, 2); R(4, 0, 2, 2); break;
      case 'bun': R(-3, -4, 6, 5); R(-2, -5, 4, 1); R(-1, -3, 2, 1, '#ff9fd0'); break;
      case 'cowboy': R(-9, 2, 18, 2); R(-5, -2, 10, 4); R(-5, 1, 10, 1, '#e0453a'); break;
      case 'crown': R(-5, 0, 10, 2); R(-5, -3, 2, 3); R(-1, -4, 2, 4); R(3, -3, 2, 3); R(-1, -1, 2, 1, '#e0453a'); break;
      case 'fox': R(-6, -4, 3, 5); R(3, -4, 3, 5); R(-6, -4, 3, 1, '#ff9a4a'); R(3, -4, 3, 1, '#ff9a4a'); R(-5, -2, 1, 2, '#ff9fd0'); R(4, -2, 1, 2, '#ff9fd0'); break;
    }
  }
  function drawHeroAt(id, x, bot, f, fr, sc) {
    const h = HERO[id] || HERO.ember; sc = sc || 1;
    if (sc !== 1) { g.save(); g.translate(x, bot); g.scale(sc, sc); x = 0; bot = 0; }
    if (h.custom === 'fan') g.imageSmoothingEnabled = true;
    drawSpr(g, h.custom ? custSpr(h, 'idle', (fr || 0) & 1) : getSprite('hero_idle', h.sw, fr || 0), x, bot, f < 0);
    g.imageSmoothingEnabled = false;
    if (h.hat) drawHat(h, x, bot, f);
    if (sc !== 1) g.restore();
  }
  // ---------- host: guests' heroes ----------
  const EDGE = ['jumpP', 'atkP', 'atk2P', 'dashP', 'throwP', 'swapP', 'skillP', 'talkP', 'sumP', 'parryP', 'wswapP', 'sk1P', 'sk2P', 'sk3P', 'sk4P'];
  const LVL = ['left', 'right', 'up', 'down', 'jump', 'atkH', 'atk2H'];
  function withAct(p, fn) {
    const keep = {}; for (const k of LVL.concat(EDGE)) { keep[k] = act[k]; act[k] = false; }
    const inp = p.inp || {}; for (const k of LVL) act[k] = !!inp[k]; for (const k of EDGE) act[k] = !!(p.edge && p.edge[k]);
    const sh = Snd.hero; Snd.hero = () => {};
    try { fn(); } finally { Snd.hero = sh; p.edge = {}; for (const k in keep) act[k] = keep[k]; }
  }
  function coopDown(P) {
    P.hp = 0; P.down = true; P.downT = 9; P.vx = P.vy = 0; P.atk = 0; P.shield = false;
    Snd.play('die'); emit(P.x + 4, P.y + 7, 30, { col: ['#ffd34e', '#e0453a', '#f6f3e9'], sp0: 20, sp1: 120 });
    Q.msg = cvs('P' + (P.slot + 1) + ' is down! Stand next to them to revive faster.', 'P' + (P.slot + 1) + ' đã gục! Đứng cạnh để hồi sinh nhanh hơn.'); Q.msgT = 3;
  }
  function coopHostPlayers(dt) {
    const me = Q.me, ar = Q.L.arena;
    if (Q.wait) { Q.wait.t += dt; Q.wait.msgT -= dt; }
    for (const p of Q.players) {
      if (p === me) continue;
      for (let i = 0; i < 2; i++) if (p.wcd && p.wcd[i] > 0) p.wcd[i] -= dt;
      if (!p.down) asP(p, () => withAct(p, () => updatePlayer(dt)));
    }
    if (Q.state !== 'play' && Q.state !== 'bossintro') return;
    for (const p of Q.players) if (p !== me && !p.down) asP(p, () => updateItems(0));
    // downed heroes come back after a while (faster when a friend stands next to them)
    const alive = Q.players.filter(p => !p.down);
    for (const p of Q.players) {
      if (!p.down) continue;
      const help = alive.find(o => Math.hypot(o.x - p.x, o.y - p.y) < 26);
      p.downT -= dt * (help ? 4 : 1);
      if (p.downT <= 0 && alive.length) { const l = help || alive[0]; p.down = false; p.hp = Math.max(2, Math.ceil(p.mhp / 2)); p.x = l.x; p.y = l.y; p.vx = p.vy = 0; p.inv = 2; Snd.play('relic'); emit(p.x + 4, p.y + 7, 24, { col: ['#fff', '#ffd34e', '#a4ffc0'], sp0: 20, sp1: 90 }); addRing(p.x + 4, p.y + 7, '#ffd34e', 40, 0.5); }
    }
    if (!alive.length) { Q.state = 'dead'; Q.stateT = 0; Snd.hero('die'); return; }
    // keep the team together: nobody is left behind a boss wall or far off-screen
    const lead = me.down ? alive[0] : me;
    for (const p of alive) {
      if (p === lead) continue;
      const far = false; // nobody is dragged along any more: teammates walk to the boss themselves
      const out = Q.arenaSealed && (p.x < (ar.x0 + 2) * TS || p.x > ar.x1 * TS);
      if (far || out) { emit(p.x + 4, p.y + 7, 10, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 60 }); p.x = out ? (ar.x0 + 4) * TS : lead.x - 10; p.y = out ? (ar.gy - 2) * TS : lead.y - 8; p.vx = p.vy = 0; p.safe = { x: p.x, y: p.y }; emit(p.x + 4, p.y + 7, 10, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 60 }); }
    }
  }
  function coopGather(all) {
    const ar = Q.L.arena, L0 = Q.P; let k = 0;
    for (const p of Q.players || []) {
      if (p === L0) continue; k++;
      if (!all && p.x >= (ar.x0 + 2) * TS && p.x <= ar.x1 * TS) continue;
      emit(p.x + 4, p.y + 7, 12, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 70 });
      p.x = Math.max((ar.x0 + 2) * TS, L0.x - 12 * k); p.y = L0.y; p.vx = p.vy = 0; p.inv = Math.max(p.inv || 0, 1); p.safe = { x: p.x, y: p.y }; if (p.down) { p.down = false; p.hp = Math.max(1, Math.ceil(p.mhp / 2)); }
      emit(p.x + 4, p.y + 7, 12, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 70 });
    }
  }
  function coopTalkDone() { const tk = Q.talk; if (!tk) return true; const done = tk.doneList || []; return (Q.players || []).every(p => p === Q.me || done.indexOf(p.slot) >= 0); }
  function coopTalkEnd(tk) {
    if (!coop) { endTalk(); return; }
    tk.i = tk.lines.length - 1; tk.t = 999; tk.hostDone = true; tk.doneList = tk.doneList || []; if (tk.doneList.indexOf(0) < 0) tk.doneList.push(0);
    if (coopTalkDone()) endTalk();
  }
  function drawTalkWait() {
    const tk = Q.talk; if (!tk) return;
    const me = coop.me, done = tk.doneList || [], iDone = coop.role === 'host' ? tk.hostDone : coop.tkDone;
    const wait = (Q.players || []).filter(p => p.slot !== me && done.indexOf(p.slot) < 0).map(p => 'P' + (p.slot + 1));
    const ready = (Q.players || []).filter(p => done.indexOf(p.slot) >= 0).map(p => 'P' + (p.slot + 1));
    if (iDone && wait.length) { g.fillStyle = 'rgba(8,6,20,.85)'; g.fillRect(VW / 2 - 110, 124, 220, 14); txt(cvs('Waiting for ', 'Đang chờ ') + wait.join(', ') + cvs(' to finish reading...', ' đọc xong...'), VW / 2, 134, { al: 'center', size: 7, col: '#ffd34e' }); }
    else if (ready.length) txt(cvs('Ready: ', 'Đã xong: ') + ready.join(', '), VW - 10, 140, { al: 'right', size: 5, col: '#a4ffc0' });
  }
  function coopGive(p, msg) { for (const [id, pr] of coop.peers) if (pr.pl === p) NET.send(msg, id); }
  function coopRespawn() {
    for (const p of Q.players) { p.down = false; p.hp = p.mhp; p.inv = 1.5; p.vx = p.vy = 0; p.x = Q.P.x - p.slot * 6; p.y = Q.P.y; p.safe = { x: p.x, y: p.y }; }
  }
  // ---------- serialising the world ----------
  const SKIP = { atkHit: 1, hit: 1, later: 1, L: 1, inp: 1, edge: 1, safe: 1, fn: 1, bag: 1, owner: 1 };
  let REG = null, REV = null, SPRK = new Map();
  function buildReg() {
    REG = new Map(); REV = {};
    const add = (o, p) => { if (o && typeof o === 'object' && !REG.has(o)) { REG.set(o, p); REV[p] = o; } };
    for (const k in EN) add(EN[k], 'EN.' + k);
    BOSS.forEach((b, i) => add(b, 'BOSS.' + i));
    for (const k in FORMS) FORMS[k].forEach((f, i) => add(f, 'FORMS.' + k + '.' + i));
    if (typeof MINI !== 'undefined') for (const k in MINI) add(MINI[k], 'MINI.' + k);
    for (const k in ITEM) add(ITEM[k], 'ITEM.' + k);
    for (const k in NPCS) add(NPCS[k], 'NPCS.' + k);
    for (const k in HERO) add(HERO[k], 'HERO.' + k);
    BIOMES.forEach((b, i) => add(b, 'BIOMES.' + i));
    if (typeof DRG !== 'undefined') for (const k in DRG) add(DRG[k], 'DRG.' + k);
  }
  function sprKey(v) {
    if (!SPRK.has(v)) { for (const k in _cache) SPRK.set(_cache[k], k); }
    return SPRK.get(v);
  }
  function sprFromKey(k) {
    if (_cache[k]) return _cache[k];
    try {
      if (k.indexOf('|') > 0) { const a = k.split('|'); return getSprite(a[0], JSON.parse(a[1]), +a[2], a[3] || undefined); }
      if (k.indexOf('np_') === 0) return npcSpr(k.slice(3));
      if (/^boss\d$/.test(k)) return bossSprite(+k.slice(4));
    } catch (e) {}
    return undefined;
  }
  function ser(v, d) {
    if (v === null || v === undefined) return v === null ? null : undefined;
    const t = typeof v;
    if (t === 'number') return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
    if (t === 'string' || t === 'boolean') return v;
    if (t !== 'object') return undefined;
    const r = REG.get(v); if (r !== undefined) return { $r: r };
    if (d > 0 && v._n !== undefined) return { $n: v._n };
    if (v instanceof Set || v instanceof Map || (typeof HTMLCanvasElement !== 'undefined' && v instanceof HTMLCanvasElement) || (typeof Image !== 'undefined' && v instanceof Image) || typeof v.getContext === 'function') return undefined;
    if (v.c && typeof v.c.getContext === 'function') { const k = sprKey(v); return k ? { $s: k } : undefined; }
    if (d > 5) return undefined;
    if (Array.isArray(v)) return v.map(x => { const y = ser(x, d + 1); return y === undefined ? null : y; });
    const o = {}; for (const k in v) { if (SKIP[k]) continue; const y = ser(v[k], d + 1); if (y !== undefined) o[k] = y; }
    return o;
  }
  function des(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(des);
    if (v.$r !== undefined) return REV[v.$r];
    if (v.$s !== undefined) return sprFromKey(v.$s);
    if (v.$n !== undefined) return coop.objs.get(v.$n) || null;
    const o = {}; for (const k in v) o[k] = des(v[k]);
    return o;
  }
  // lists of world objects sent with ids; only the fields that changed are sent again
  const QLISTS = ['ents', 'projs', 'fps', 'fires', 'zones', 'rings', 'ghosts', 'corpses', 'items', 'traps', 'pz', 'gates', 'trials', 'minis', 'dragons'];
  const QONE = ['boss', 'dragon', 'syFig', 'mainBoss'];
  const GLISTS = ['allies', 'pops', 'bolts', 'holes', 'torn', 'sums', 'slashes', 'mtraps'];
  const GONE = ['god', 'dr', 'lyra'];
  const QVALS = ['state', 'stateT', 'time', 'shake', 'arenaSealed', 'bossDead', 'msg', 'msgT', 'banner', 'cp', 'talk', 'darkBoost', 'darkBoostT', 'windT', 'windDir', 'shardFlash', 'coinsRun', 'pearls', 'dj', 'dashAb', 'btSlot'];
  const GVALS = ['slowT', 'powerT', 'flash', 'tsT'];
  function inRange(o) { if (typeof o.x !== 'number') return true; for (const p of Q.players) if (Math.abs(o.x - p.x) < 340 && Math.abs((o.y || 0) - p.y) < 300) return true; return false; }
  function packList(arr, tag) {
    const ids = [], ch = {}, seen = coop.seen[tag] || (coop.seen[tag] = new Set()), now = new Set();
    for (const o of arr) {
      if (!o || (tag !== 'boss' && !inRange(o))) continue;
      if (o._n === undefined) o._n = ++coop.nid;
      ids.push(o._n); now.add(o._n);
      const last = coop.last.get(o._n) || {}, out = {}; let any = false;
      for (const k in o) {
        if (SKIP[k]) continue;
        const v = ser(o[k], 1), s = (v !== null && typeof v === 'object') ? JSON.stringify(v) : v;
        if (last[k] !== s) { last[k] = s; out[k] = v === undefined ? null : v; any = true; }
      }
      coop.last.set(o._n, last); if (any) ch[o._n] = out;
    }
    for (const n of seen) if (!now.has(n)) coop.last.delete(n);
    coop.seen[tag] = now;
    return { ids, ch };
  }
  function packVals(src, keys, tag) {
    const out = {}, last = coop.vlast[tag] || (coop.vlast[tag] = {});
    for (const k of keys) { const v = ser(src[k], 1), s = (v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v); if (last[k] !== s) { last[k] = s; out[k] = v === undefined ? null : v; } }
    return out;
  }
  function packPlayer(p) {
    return { s: p.slot, hero: p.hero, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, vx: Math.round(p.vx), vy: Math.round(p.vy), face: p.face, onGround: p.onGround, anim: Math.round(p.anim * 100) / 100, atk: p.atk, atkDown: p.atkDown, dash: p.dash, inv: Math.round(p.inv * 100) / 100, hp: p.hp, mhp: p.mhp, emo: p.emo, emoT: p.emoT, down: !!p.down, downT: p.downT, shield: p.shield, skCd: Math.round((p.skCd || 0) * 10) / 10, wcd: p.wcd, wmax: p.wmax, ammo: p.ammo, sel: p.sel, ws: p.ws, chg: p.chg || null, h: p.h, mom: p.mom, ball: p.ball, spin: p.spin, form: p.form, ess: p.ess, dk: p.dk, armT: p.armT, armDur: p.armDur, armDir: p.armDir, armSpin: p.armSpin, concT: p.concT, fsw: p.fsw && p.fsw.t > 0 ? p.fsw : null, oraT: p.oraT, standT: p.standT, copy: p.copy, inhT: p.inhT, flutter: p.flutter, gatT: p.gatT, hurtA: p.hurtA, landA: p.landA, punch: p.punch ? { ext: p.punch.ext || 0, dir: p.punch.dir, dy: p.punch.dy, reach: p.punch.reach } : null, mouse: p.mouse ? { x: Math.round(p.mouse.x), y: Math.round(p.mouse.y), f: p.mouse.f } : null, parryT: Math.round((p.parryT || 0) * 100) / 100, hold: p.hold || null, gunT: p.gunT || 0, gunId: p.gunId || null, keys: p.keys, sw: p.sw ? { $r: 'ITEM.' + p.sw.id } : null, pinv: { w: (p.bag || save.inv).w, armor: (p.bag || save.inv).armor } };
  }
  function coopSnapshot() {
    if (Q.talk && !Q.talk.id) { Q.talk.id = ++coop.tkN; Q.talk.doneList = Q.talk.doneList || []; }
    const G = Q.G, s = { t: 's', q: packVals(Q, QVALS, 'q'), gv: packVals(G, GVALS, 'g'), l: {}, o: {}, gl: {}, go: {}, pl: Q.players.map(packPlayer), ev: coop.ev.splice(0, 160) };
    for (const k of QLISTS) s.l[k] = packList(Q[k] || [], k);
    for (const k of QONE) s.o[k] = packList(Q[k] ? [Q[k]] : [], k);
    for (const k of GLISTS) s.gl[k] = packList(G[k] || [], 'G' + k);
    for (const k of GONE) s.go[k] = packList(G[k] ? [G[k]] : [], 'G' + k);
    s.pf = Q.L.plats.map(p => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10, p.dx, p.dy]);
    const rows = Q.L.grid.map(r => r.join ? r.join('') : r), gd = {};
    rows.forEach((r, i) => { if (coop.grid[i] !== r) { coop.grid[i] = r; gd[i] = r; } });
    s.gd = gd;
    if (Q.L.arena) s.ar = [Q.L.arena.x0, Q.L.arena.x1, Q.L.arena.gy];
    coop.ev.length = 0;
    if (coop.gold) { s.gold = coop.gold; coop.gold = 0; }
    return s;
  }
  function applyList(pk, cur) {
    const out = [];
    const keepNew = cur && cur.filter(o => o && o._n === undefined);
    for (const n of pk.ids) {
      let o = coop.objs.get(n);
      if (!o) { o = (keepNew && keepNew.length && pk.ids.length === 1) ? keepNew.shift() : {}; o._n = n; coop.objs.set(n, o); }
      out.push(o);
    }
    for (const n in pk.ch) { const o = coop.objs.get(+n); if (!o) continue; const c = pk.ch[n]; for (const k in c) { const v = des(c[k]); if (v === undefined) continue; o[k] = v; } }
    return out;
  }
  function coopApply(s) {
    if (!Q) return;
    const G = Q.G;
    for (const k in s.q) { const v = des(s.q[k]); if (v !== undefined) Q[k] = v; }
    if (Q.talk && Q.state === 'talk') { if (Q.talk.id !== coop.tkId) { coop.tkId = Q.talk.id; coop.tkI = 0; coop.tkT = 0; coop.tkDone = false; } Q.talk.i = Math.min(coop.tkI, Q.talk.lines.length - 1); Q.talk.t = coop.tkT; } else coop.tkId = null;
    for (const k in s.gv) { const v = des(s.gv[k]); if (v !== undefined) G[k] = v; }
    const live = new Set();
    for (const k in s.l) { Q[k] = applyList(s.l[k], Q[k]); for (const n of s.l[k].ids) live.add(n); }
    for (const k in s.o) { const a = applyList(s.o[k], Q[k] ? [Q[k]] : null); Q[k] = a[0] || null; for (const n of s.o[k].ids) live.add(n); }
    for (const k in s.gl) { G[k] = applyList(s.gl[k], G[k]); for (const n of s.gl[k].ids) live.add(n); }
    for (const k in s.go) { const a = applyList(s.go[k], G[k] ? [G[k]] : null); G[k] = a[0] || null; for (const n of s.go[k].ids) live.add(n); }
    for (const n of coop.objs.keys()) if (!live.has(n)) coop.objs.delete(n);
    // re-link second pass so {$n} references made before their target existed resolve
    if (s.pf) s.pf.forEach((a, i) => { const p = Q.L.plats[i]; if (p) { p.x = a[0]; p.y = a[1]; p.dx = a[2]; p.dy = a[3]; } });
    for (const i in s.gd) { const row = Q.L.grid[i]; if (Array.isArray(row)) { const r = s.gd[i]; for (let x = 0; x < r.length; x++) row[x] = r[x]; } }
    if (s.ar && Q.L.arena) { Q.L.arena.x0 = s.ar[0]; Q.L.arena.x1 = s.ar[1]; Q.L.arena.gy = s.ar[2]; }
    // players
    const old = Q.players || [];
    Q.players = s.pl.map(d => {
      let p = old.find(o => o.slot === d.s); if (!p) { p = newPlayer(); p.slot = d.s; }
      for (const k in d) { if (k === 's') continue; if (k === 'pinv') { p.bag = { w: d.pinv.w, armor: d.pinv.armor, pet: null, own: [] }; continue; } const v = des(d[k]); if (v !== undefined) p[k] = v; }
      return p;
    });
    const me = Q.players.find(p => p.slot === coop.me); if (me) { Q.P = me; Q.me = me; }
    for (const e of s.ev || []) {
      if (e[0] === 'e') emit(e[1], e[2], e[3], e[4]);
      else if (e[0] === 's' && coop.play0) coop.play0(e[1]);
    }
    if (s.gold) { save.coins += s.gold; writeSave(); }
    coop.since = 0;
  }
  // ---------- per-frame network work ----------
  function coopHostNet(dt) {
    coop.sendT -= dt;
    if (coop.sendT > 0 || !Q || !Q.players) return;
    coop.sendT = 1 / 20;
    const snap = coopSnapshot(); NET.send(snap);
    if (location.search.indexOf('netstat') >= 0) { coop.nsN = (coop.nsN || 0) + 1; coop.nsB = (coop.nsB || 0) + JSON.stringify(snap).length; coop.nsT = (coop.nsT || 0) + 1 / 20; if (coop.nsT >= 2) { coop.kbps = Math.round(coop.nsB / coop.nsT / 1024 * 10) / 10; coop.mbh = Math.round(coop.kbps * 3.6 / 1.024) / 1; coop.nsB = coop.nsT = 0; } }
  }
  function coopClientInput() {
    if (!coop || coop.role !== 'client' || scene !== 'play') return;
    const m = { t: 'i' }; let edge = false;
    for (const k of LVL) m[k] = act[k] ? 1 : 0;
    for (const k of EDGE) if (act[k]) { m[k] = 1; edge = true; }
    if (act.okP) { m.okP = 1; edge = true; }
    const key = LVL.map(k => m[k]).join('');
    if (edge || key !== coop.lastIn || (coop.inT -= 1 / 60) <= 0) { coop.lastIn = key; coop.inT = 0.25; NET.send(m); }
  }
  function coopClientTick(dt) {
    if (!Q) return;
    coop.since += dt; Q.t += dt; sceneT += dt;
    if (coop.since < 0.15) {
      const mv = o => { if (o && typeof o.vx === 'number' && typeof o.x === 'number' && !o.dead) { o.x += o.vx * dt; if (typeof o.vy === 'number' && !o.onGround) o.y += o.vy * dt; } };
      for (const p of Q.players || []) if (!p.down) mv(p);
      for (const e of Q.ents || []) mv(e);
      for (const p of Q.projs || []) mv(p);
      for (const p of Q.fps || []) mv(p);
      if (Q.boss) mv(Q.boss);
    }
    if (Q.msgT > 0) Q.msgT -= dt;
    if (Q.shake > 0) Q.shake -= dt;
    if (Q.P && Q.P.emoT > 0) Q.P.emoT -= dt;
    if (act.shopP && Q.state === 'play' && Q.P && !Q.P.down) { openShopInGame(); return; }
    if (Q.state === 'talk' && Q.talk && Q.talk.lines && coop.tkId === Q.talk.id && Q.talk.id) {
      const tk = Q.talk; coop.tkT += dt;
      if ((act.okP || act.talkP || act.atkP) && !coop.tkDone) {
        const full = (tk.lines[coop.tkI][save.lang] || '').length;
        if (coop.tkT * 45 < full) coop.tkT = 999;
        else if (coop.tkI < tk.lines.length - 1) { coop.tkI++; coop.tkT = 0; coop.play0 && coop.play0('select'); }
        else { coop.tkDone = true; coop.tkT = 999; NET.send({ t: 'tkdone', id: tk.id }); coop.play0 && coop.play0('ok'); }
      }
      if ((act.backP) && !coop.tkDone) { coop.tkDone = true; coop.tkI = tk.lines.length - 1; coop.tkT = 999; NET.send({ t: 'tkdone', id: tk.id }); }
      tk.i = coop.tkI; tk.t = coop.tkT;
    }
    for (const p of Q.players || []) p.anim = (p.anim || 0) + dt;
    updateParticles(dt); updateWeather(dt); updateCam(dt);
    if (act.pauseP && Q.state !== 'talk') coopLeave(cvs('You left the room.', 'Bạn đã rời phòng.'));
  }
  // ---------- lobby, joining and starting ----------
  function coopInit(role) {
    if (!REG) buildReg();
    coop = { role, me: role === 'host' ? 0 : -1, peers: new Map(), seen: {}, last: new Map(), vlast: {}, objs: new Map(), nid: 0, tkN: 0, tkId: null, tkI: 0, tkT: 0, tkDone: false, ev: [], grid: [], sendT: 0, since: 0, inT: 0, lastIn: '', play0: null };
    if (!coop.play0) { const p0 = Snd.play; coop.play0 = p0; Snd.play = function (n) { if (coop && coop.role === 'host' && scene === 'play' && coop.ev.length < 400) coop.ev.push(['s', n]); return p0.apply(Snd, arguments); }; }
  }
  function coopLeave(msg) {
    if (coop && coop.play0) Snd.play = coop.play0;
    NET.close(); coop = null;
    coopUI.ph = 'menu'; coopUI.msg = msg || ''; coopUI.msgBad = !!msg; coopUI.slots = [];
    if (scene !== 'coop') toScene('coop');
  }
  function lobbySlots() {
    const sl = [{ slot: 0, hero: myHero(), name: 'P1' }];
    for (const [id, p] of coop.peers) sl.push({ slot: p.slot, hero: p.hero, name: 'P' + (p.slot + 1), id });
    return sl.sort((a, b) => a.slot - b.slot);
  }
  function sendLobby() { coopUI.slots = lobbySlots(); NET.send({ t: 'lobby', slots: coopUI.slots.map(s => ({ slot: s.slot, hero: s.hero, name: s.name })), li: coopUI.li, code: NET.code }); }
  function freeSlot() { for (let i = 1; i < 5; i++) { let used = false; for (const p of coop.peers.values()) if (p.slot === i) used = true; if (!used) return i; } return -1; }
  NET.on('ready', code => { coopUI.ph = 'lobby'; coopUI.msg = ''; coopUI.code = code; sendLobby(); Snd.play('ok'); });
  NET.on('connected', () => { coopUI.msg = cvs('Connected! Waiting for the host...', 'Đã kết nối! Đang chờ chủ phòng...'); coopUI.msgBad = false; NET.send({ t: 'hello', hero: myHero(), inv: { w: save.inv.w.slice(), armor: save.inv.armor } }); });
  NET.on('status', (st, who) => {
    if (!coop) return;
    if (coop.role === 'host') { if (st === 'guest-connecting') { coopUI.msg = cvs('A player is connecting...', 'Có người đang kết nối...'); coopUI.msgBad = false; } else if (st === 'ice-failed') { coopUI.msg = cvs('A player could not connect (network blocked).', 'Một người không kết nối được (mạng bị chặn).'); coopUI.msgBad = true; } return; }
    const M = { server: ['Contacting the game server...', 'Đang liên hệ máy chủ...'], calling: ['Calling the host...', 'Đang gọi tới chủ phòng...'], retry: ['Still trying, please wait...', 'Vẫn đang thử, chờ chút...'],
      'ice-checking': ['Finding a route to the host...', 'Đang tìm đường tới chủ phòng...'], 'ice-connected': ['Connected!', 'Đã kết nối!'], 'ice-failed': ['Direct route blocked, trying a relay...', 'Đường trực tiếp bị chặn, đang thử đường khác...'] };
    if (M[st] && coopUI.ph === 'code') { coopUI.msg = cvs(M[st][0], M[st][1]); coopUI.msgBad = st === 'ice-failed'; }
  });
  NET.on('error', e => { const m = e === 'timeout' ? cvs('Could not reach the host. Turn off VPN / "block WebRTC" in the browser, try Chrome or Edge, or another network.', 'Không nối được tới chủ phòng. Tắt VPN / chặn WebRTC của trình duyệt, thử Chrome/Edge hoặc mạng khác.') : e === 'peer-unavailable' ? cvs('Room not found. Check the code.', 'Không tìm thấy phòng. Kiểm tra lại mã.') : e === 'nolib' ? cvs('Network library missing.', 'Thiếu thư viện mạng.') : cvs('Network error: ', 'Lỗi mạng: ') + e; coopLeave(m); });
  NET.on('lost', () => coopLeave(cvs('Lost connection to the host.', 'Mất kết nối với chủ phòng.')));
  NET.on('join', id => { if (!coop) return; Snd.play('relic'); });
  NET.on('leave', id => {
    if (!coop) return; const p = coop.peers.get(id); coop.peers.delete(id);
    if (p && Q && Q.players) { Q.players = Q.players.filter(o => o !== p.pl); Q.msg = cvs('P' + (p.slot + 1) + ' left the game.', 'P' + (p.slot + 1) + ' đã rời trận.'); Q.msgT = 3; }
    sendLobby();
  });
  NET.on('msg', (d, from) => {
    if (!coop || !d) return;
    if (coop.role === 'host') {
      const p = coop.peers.get(from);
      if (d.t === 'hello') {
        if (scene === 'play') { NET.send({ t: 'busy' }, from); return; }
        const slot = freeSlot(); if (slot < 0) { NET.send({ t: 'full' }, from); return; }
        coop.peers.set(from, { slot, hero: HERO[d.hero] ? d.hero : 'ember', inv: d.inv, pl: null });
        NET.send({ t: 'welcome', slot }, from); sendLobby();
      } else if (d.t === 'tkdone' && p && Q && Q.talk && Q.talk.id === d.id) { const dl = Q.talk.doneList || (Q.talk.doneList = []); if (dl.indexOf(p.slot) < 0) dl.push(p.slot); }
      else if (d.t === 'inv' && p && p.pl && d.inv) {
        const w = (Array.isArray(d.inv.w) ? d.inv.w : []).slice(0, 2).map(i => (i && ITEM[i]) ? i : null); if (!w.some(Boolean)) w[0] = 'iron';
        p.pl.bag = { w, armor: ITEM[d.inv.armor] ? d.inv.armor : null, pet: null, own: w.filter(Boolean) }; p.pl.sw = null;
      }
      else if (d.t === 'hero' && p) { p.hero = HERO[d.id] ? d.id : p.hero; sendLobby(); }
      else if (d.t === 'i' && p && p.pl) {
        const pl = p.pl; pl.inp = d; pl.edge = pl.edge || {};
        for (const k of EDGE) if (d[k]) pl.edge[k] = true;
      }
    } else {
      if (d.t === 'gift') { save.leek = true; grantLeek(); grantLyraGifts(); writeSave(); NET.send({ t: 'inv', inv: { w: save.inv.w.slice(), armor: save.inv.armor } }); if (Q) { Q.msg = save.lang === 'vi' ? 'Lyra tặng bạn Kiếm Hành, Giáp Hành và Cây Hành Bay! Mở túi (B) để trang bị.' : 'Lyra gave you the Leek Blade, Leek Armor and Flying Leek! Open your bag (B) to equip.'; Q.msgT = 6; } Snd.play('relic'); }
      else if (d.t === 'welcome') { coop.me = d.slot; coopUI.ph = 'lobby'; coopUI.msg = ''; }
      else if (d.t === 'lobby') { coopUI.slots = d.slots; coopUI.li = d.li; coopUI.code = d.code; if (scene === 'play') { coopUI.ph = 'lobby'; toScene('coop'); } }
      else if (d.t === 'start') { coopUI.li = LPOS(d.li); coop.objs.clear(); startLevel(d.li); Q.client = true; Q.players = []; Q.state = 'intro'; scene = 'play'; }
      else if (d.t === 's') { if ((scene === 'play' || scene === 'shop') && Q) coopApply(d); }
      else if (d.t === 'rare') { save.rare++; writeSave(); if (Q) { Q.msg = cvs('Star Gem! You have ', 'Ngọc Sao! Bạn có ') + save.rare + cvs('.', ' viên.'); Q.msgT = 3; } }
      else if (d.t === 'full') coopLeave(cvs('The room is full (5 players).', 'Phòng đã đủ 5 người.'));
      else if (d.t === 'busy') coopLeave(cvs('That room is already playing. Try again later.', 'Phòng đang chơi. Hãy thử lại sau.'));
    }
  });
  // ---------- the co-op story: a one-minute opening, a team beat on every map, Ember's lines shared by the team, an ending ----------
  for (const h of HEROES) NPCS['h_' + h.id] = { hero: h.id, name: h.name };
  const L2 = (w, en, vi) => ({ w, en, vi });
  const HERO_HELLO = {
    war: ['I am {n}. My sword has waited a long time for a fight worth having.', 'Ta là {n}. Thanh kiếm này đã chờ rất lâu cho một trận đánh xứng đáng.'],
    mage: ['{n}, at your service. The stars whispered your names to me last night.', '{n} xin có mặt. Đêm qua các vì sao đã thì thầm tên các bạn cho ta nghe.'],
    rng: ['{n} here. I can hit a firefly at a hundred paces. Just point me at the monsters.', '{n} đây. Một trăm bước vẫn bắn trúng đom đóm. Cứ chỉ quái vật cho tôi.'],
    tank: ['I am {n}. Stand behind me, and nothing will ever reach you.', 'Ta là {n}. Cứ đứng sau lưng ta, không gì chạm được tới các bạn.'],
    sin: ['...{n}. I work best in the shadows. Lucky for us, there are plenty of them.', '...{n}. Ta làm việc tốt nhất trong bóng tối. May cho chúng ta, bóng tối thì đầy.'],
    sup: ['Hi, I am {n}! If anyone gets hurt, come straight to me, okay?', 'Chào mọi người, mình là {n}! Ai bị thương thì chạy lại chỗ mình nhé!']
  };
  // {p0} {p1}... = the heroes of player 1, 2... (wrapping around when the team is smaller)
  const COOP_INTRO = [
    L2('narr', 'Long ago, the Sun hung whole above the kingdom of Lumen, and no night lasted longer than a lullaby.', 'Ngày xưa, Mặt Trời còn nguyên vẹn trên vương quốc Lumen, và chẳng đêm nào dài hơn một bài hát ru.'),
    L2('narr', 'Then Quoc the Devil reached into the sky and tore the Sun into seven burning fragments.', 'Rồi Quỷ Vương Quoc vươn tay lên trời, xé Mặt Trời thành bảy mảnh rực cháy.'),
    L2('narr', 'Darkness poured over the land. Fields froze, rivers fell silent, and monsters crawled out of every shadow.', 'Bóng tối tràn khắp nơi. Đồng ruộng đóng băng, sông ngòi im bặt, quái vật bò ra từ mọi góc tối.'),
    L2('narr', 'In the last lit village, an old lantern began to glow on its own... and its light flew out in every direction.', 'Ở ngôi làng cuối cùng còn ánh sáng, một chiếc đèn lồng cũ bỗng tự phát sáng... và ánh sáng của nó bay đi muôn hướng.'),
    L2('narr', 'It searched the whole kingdom for hearts brave enough to answer. Tonight, it found {N} of them.', 'Nó lục tìm khắp vương quốc những trái tim đủ dũng cảm để đáp lời. Đêm nay, nó tìm thấy {N} người.'),
    '{hello}',
    L2('narr', 'The lantern settled among them, warm as a heartbeat, and showed them seven roads, seven monsters, seven pieces of the Sun.', 'Chiếc đèn lồng đáp xuống giữa họ, ấm như một nhịp tim, và chỉ cho họ bảy con đường, bảy con quái vật, bảy mảnh Mặt Trời.'),
    L2('quoc', 'More of them? Fine. Come, little candles. My darkness has room for all of you.', 'Thêm mấy đứa nữa à? Được thôi. Lại đây, những ngọn nến bé nhỏ. Bóng tối của ta đủ chỗ cho tất cả các ngươi.'),
    L2('{p0}', 'Did everyone hear that? Good. Now he knows we are coming.', 'Mọi người nghe thấy chứ? Tốt. Giờ hắn biết tụi mình đang tới rồi đó.'),
    L2('{p1}', 'Stay close. If one of us falls, the others pick them back up.', 'Đi sát nhau nhé. Ai ngã xuống thì những người còn lại kéo người đó dậy.'),
    L2('narr', '(Stand next to a fallen friend to bring them back faster. In this story, no one is left in the dark.)', '(Đứng cạnh đồng đội bị gục để hồi sinh họ nhanh hơn. Trong câu chuyện này, không ai bị bỏ lại trong bóng tối.)'),
    L2('{plast}', 'Then let us go and take our Sun back. Together!', 'Vậy thì đi lấy lại Mặt Trời của chúng ta thôi. Cùng nhau!'),
    L2('narr', 'And so the journey began...', 'Và thế là cuộc hành trình bắt đầu...')
  ];
  const COOP_MAP = {
    0: [L2('narr', 'The Verdant Meadow. The first fragment fell here, and the slimes have been acting strange ever since.', 'Đồng Cỏ Xanh. Mảnh đầu tiên rơi xuống đây, và lũ slime cứ hành xử kỳ lạ từ hôm đó.'),
        L2('{p0}', 'Slimes? That is our first monster? I was hoping for something scarier.', 'Slime á? Quái đầu tiên là slime hả? Tưởng phải đáng sợ hơn chứ.'),
        L2('{p1}', 'Please do not jinx it.', 'Làm ơn đừng nói gở.')],
    1: [L2('narr', 'The Whispering Forest. High in the webs above, eight red eyes are watching the team.', 'Rừng Thì Thầm. Trên những tấm tơ cao kia, tám con mắt đỏ đang dõi theo cả nhóm.'),
        L2('{p1}', 'Everyone hates spiders, right? ...Right?', 'Ai cũng ghét nhện mà, đúng không? ...Đúng không?'),
        L2('{p0}', 'Burn the webs, free the light, find the princess. Let us move.', 'Đốt tơ, giải phóng ánh sáng, tìm công chúa. Đi thôi.')],
    2: [L2('narr', 'The Crystal Caverns. Down here, the only light is the light you carry with you.', 'Hang Pha Lê. Dưới này, ánh sáng duy nhất là thứ các bạn tự mang theo.'),
        L2('{p0}', 'Stay near the lanterns. If you get lost, shout my name.', 'Đi gần đèn nhé. Ai lạc thì hét tên tôi.'),
        L2('{p1}', 'If I get lost, I am blaming the bats.', 'Nếu tôi lạc thì là tại lũ dơi.')],
    3: [L2('narr', 'The Endless Desert. Under the sand, an old Pharaoh guards a fragment like his last treasure.', 'Sa Mạc Bất Tận. Dưới lớp cát, một Pharaoh già canh giữ mảnh Mặt Trời như báu vật cuối cùng.'),
        L2('{p1}', 'So hot... whose idea was it to wear armour in a desert?', 'Nóng quá... ai bày ra vụ mặc giáp đi sa mạc vậy?'),
        L2('{p0}', 'Drink water, dodge the mummies, win. Simple plan.', 'Uống nước, né xác ướp, thắng. Kế hoạch đơn giản.')],
    4: [L2('narr', 'The Frozen Peaks. A king made of ice has forgotten what warmth feels like.', 'Đỉnh Núi Băng Giá. Một vị vua bằng băng đã quên mất hơi ấm là gì.'),
        L2('{p0}', 'Then we will remind him. All of us, at the same time.', 'Vậy tụi mình nhắc lại cho ông ta. Tất cả cùng một lúc.')],
    5: [L2('narr', 'The Volcano. Ignarok the fire dragon sleeps on the sixth fragment, and the mountain breathes with him.', 'Núi Lửa. Rồng lửa Ignarok ngủ trên mảnh thứ sáu, và cả ngọn núi thở theo nó.'),
        L2('{p1}', 'Good news: it is warm. Bad news: everything else.', 'Tin vui: ở đây ấm. Tin buồn: mọi thứ còn lại.'),
        L2('{p0}', 'Six fragments. Only one left after this. Nobody stops now!', 'Sáu mảnh rồi. Xong chỗ này chỉ còn một. Không ai được dừng lại!')],
    6: [L2('narr', 'The Shadow Citadel. Every stone whispers one name: Quoc.', 'Thành Trì Bóng Đêm. Từng phiến đá đều thì thầm một cái tên: Quoc.'),
        L2('quoc', 'So the candles came together. How touching. I will snuff you out one by one.', 'Vậy là lũ nến kéo nhau tới đủ cả. Cảm động thật. Ta sẽ thổi tắt từng đứa một.'),
        L2('{p0}', 'Not one by one. All of us. At once.', 'Không phải từng người. Tất cả. Cùng một lúc.'),
        L2('{plast}', 'For the Sun!', 'Vì Mặt Trời!')]
  };
  const COOP_END = [
    L2('narr', 'The seventh fragment fell into many hands at once, and the Sun remembered how to shine.', 'Mảnh thứ bảy rơi vào nhiều bàn tay cùng một lúc, và Mặt Trời nhớ lại cách tỏa sáng.'),
    L2('narr', 'Across the kingdom, the long night ended. People stepped out of their homes and looked up, laughing and crying at the same time.', 'Khắp vương quốc, đêm dài đã kết thúc. Mọi người bước ra khỏi nhà, ngước lên trời, vừa cười vừa khóc.'),
    L2('{p0}', 'We... actually did it.', 'Tụi mình... làm được thật rồi.'),
    L2('{p1}', 'Of course we did. Nobody fights alone on this team.', 'Đương nhiên rồi. Trong đội này không ai phải chiến đấu một mình.'),
    L2('narr', 'The old lantern dimmed, its work done. But if the dark ever creeps back, it knows exactly who to call.', 'Chiếc đèn lồng cũ dịu lại, nhiệm vụ đã xong. Nhưng nếu bóng tối có quay lại, nó biết chính xác phải gọi ai.'),
    L2('narr', 'THE END. Thank you for playing together!', 'HẾT. Cảm ơn các bạn đã chơi cùng nhau!')
  ];
  // turn a script into the team's version: {pN} becomes a player's hero, Ember's lines go round the team, narration says "the heroes"
  function teamLines(lines, who) {
    const pl = (Q && Q.players && Q.players.length) ? Q.players : [Q.P]; let k = 0;
    const hid = i => 'h_' + (pl[((i % pl.length) + pl.length) % pl.length].hero || 'ember');
    const fixT = (t, vi) => vi ? t.replace(/Ember/g, 'nhóm anh hùng').replace(/(cậu|anh) (?=bước|đi)/g, 'họ ') : t.replace(/Ember's/g, "the heroes'").replace(/\bEmber\b/g, 'the heroes').replace(/\b(He|he) (walks|smiles|looks)/g, (m, a, v) => (a === 'He' ? 'They ' : 'they ') + v.replace(/s$/, ''));
    const out = [];
    for (const l of lines) {
      if (l === '{hello}') { pl.forEach((p, i) => { const h = HERO[p.hero] || HERO.ember, t = HERO_HELLO[h.cls]; out.push({ w: 'h_' + h.id, en: t[0].replace('{n}', h.name.en), vi: t[1].replace('{n}', h.name.vi) }); }); continue; }
      const o = Object.assign({}, l); let w = o.w || who;
      if (w === '{plast}') w = hid(pl.length - 1); else if (/^\{p\d\}$/.test(w)) w = hid(+w[2]);
      else if (w === 'ember') w = hid(k++);
      if (w === 'narr') { o.en = fixT(o.en, false); o.vi = fixT(o.vi, true); }
      o.en = o.en.replace('{N}', pl.length); o.vi = o.vi.replace('{N}', pl.length);
      o.w = w; out.push(o);
    }
    return out;
  }
  function coopStart() {
    const li = LORDER[coopUI.li] === undefined ? 0 : LORDER[coopUI.li]; startLevel(li); Q.state = 'intro';
    coop.seen = {}; coop.last = new Map(); coop.vlast = {}; coop.grid = []; coop.nid = 0;
    const P = Q.P; P.slot = 0; setHero(P, myHero()); Q.me = P; Q.players = [P];
    for (const [id, pr] of coop.peers) {
      const p = newPlayer(); p.slot = pr.slot; p.x = P.x - 10 * pr.slot; p.y = P.y; p.safe = { x: p.x, y: p.y };
      const w = (pr.inv && Array.isArray(pr.inv.w) ? pr.inv.w : ['iron', null]).map(id2 => (id2 && ITEM[id2]) ? id2 : null); if (!w.some(Boolean)) w[0] = 'iron';
      p.bag = { w, armor: pr.inv && ITEM[pr.inv.armor] ? pr.inv.armor : null, pet: null, own: w.filter(Boolean) };
      p.ammo = { dagger: 5, bomb: 2, flask: 2 }; p.wcd = [0, 0]; p.wmax = [1, 1];
      setHero(p, pr.hero); pr.pl = p; Q.players.push(p);
    }
    Q.players.sort((a, b) => a.slot - b.slot);
    NET.send({ t: 'start', li });
    const intro = !coop.introDone; coop.introDone = true;
    startScripted('narr', (intro ? COOP_INTRO : []).concat(COOP_MAP[li] || []), null);
  }
  function coopJoin(code) { coopUI.ph = 'code'; coopUI.code = code.toUpperCase(); coopInit('client'); coopUI.msg = cvs('Connecting...', 'Đang kết nối...'); coopUI.msgBad = false; NET.join(coopUI.code); Snd.play('ok'); }
  const roomLink = () => location.origin + location.pathname + '?room=' + (coopUI.code || '');
  function copyLink() {
    const l = roomLink(), ok = () => { coopUI.msg = cvs('Link copied! Open it in another tab or send it to friends.', 'Đã copy link! Mở ở tab khác hoặc gửi cho bạn bè.'); coopUI.msgBad = false; Snd.play('ok'); };
    try { navigator.clipboard.writeText(l).then(ok, () => { coopUI.msg = l; }); } catch (e) { coopUI.msg = l; }
  }
  function coopBackToLobby() { coopUI.ph = 'lobby'; toScene('coop'); setTimeout(() => { if (coop) sendLobby(); }, 50); }
  addEventListener('keydown', e => {
    if (scene !== 'coop' || coopUI.ph !== 'code') return;
    if (e.key === 'Backspace') { coopUI.code = coopUI.code.slice(0, -1); e.preventDefault(); return; }
    if (/^[a-zA-Z0-9]$/.test(e.key) && coopUI.code.length < 5) { coopUI.code += e.key.toUpperCase(); Snd.play('select'); }
  });
  function coopMenuItems() {
    return [
      { s: cvs('Create room (host)', 'Tạo phòng (chủ phòng)'), fn: () => { coopInit('host'); coopUI.msg = cvs('Creating room...', 'Đang tạo phòng...'); coopUI.msgBad = false; NET.host(); } },
      { s: cvs('Join room (code)', 'Vào phòng (nhập mã)'), fn: () => { coopUI.ph = 'code'; coopUI.code = ''; coopUI.msg = ''; } },
      { s: cvs('Choose hero', 'Chọn hero'), fn: () => { coopUI.ph = 'heroes'; coopUI.from = 'menu'; coopUI.hs = Math.max(0, HEROES.findIndex(h => h.id === myHero())); } },
      { s: cvs('Back', 'Quay lại'), fn: () => { coopLeave(); toScene('title'); } }
    ];
  }
  function updateCoop(dt) {
    sceneT += dt;
    const ph = coopUI.ph;
    if (ph === 'menu') {
      const it = coopMenuItems();
      if (act.upP) { coopUI.sel = (coopUI.sel + it.length - 1) % it.length; Snd.play('select'); }
      if (act.downP) { coopUI.sel = (coopUI.sel + 1) % it.length; Snd.play('select'); }
      if (act.okP) { Snd.play('ok'); it[coopUI.sel].fn(); }
      if (act.backP) { coopLeave(); toScene('title'); }
    } else if (ph === 'code') {
      if (pressed.Enter && coopUI.code.length === 5) coopJoin(coopUI.code);
      if (pressed.Escape) { coopUI.ph = 'menu'; }
    } else if (ph === 'heroes') {
      const n = HEROES.length, C = 10;
      if (act.leftP) { coopUI.hs = (coopUI.hs + n - 1) % n; Snd.play('select'); }
      if (act.rightP) { coopUI.hs = (coopUI.hs + 1) % n; Snd.play('select'); }
      if (act.upP) { coopUI.hs = (coopUI.hs + n - C) % n; Snd.play('select'); }
      if (act.downP) { coopUI.hs = (coopUI.hs + C) % n; Snd.play('select'); }
      if ((pressed.Enter || pressed.KeyJ || pressed.Space) && heroLocked(HEROES[coopUI.hs])) { coopUI.msg = cvs('Locked: trade 10 Star Gems with Mira the trader.', 'Đang khóa: đổi 10 Ngọc Sao ở thương nhân Mira.'); coopUI.msgBad = true; Snd.play('hurt'); }
      else if (pressed.Enter || pressed.KeyJ || pressed.Space) {
        save.hero = HEROES[coopUI.hs].id; writeSave(); Snd.play('relic');
        if (coop && coop.role === 'client') NET.send({ t: 'hero', id: save.hero });
        if (coop && coop.role === 'host') sendLobby();
        coopUI.ph = coopUI.from;
      }
      if (act.backP) coopUI.ph = coopUI.from;
    } else if (ph === 'lobby') {
      if (pressed.KeyL) copyLink();
      if (pressed.KeyC || pressed.KeyH) { coopUI.ph = 'heroes'; coopUI.from = 'lobby'; coopUI.hs = Math.max(0, HEROES.findIndex(h => h.id === myHero())); return; }
      if (coop && coop.role === 'host') {
        const mx = maxPlayable();
        if (act.leftP) { coopUI.li = Math.max(0, coopUI.li - 1); sendLobby(); Snd.play('select'); }
        if (act.rightP) { coopUI.li = Math.min(mx, coopUI.li + 1); sendLobby(); Snd.play('select'); }
        if (pressed.Enter) { Snd.play('ok'); coopStart(); }
      }
      if (pressed.Escape) { coopLeave(); }
    }
  }
  function drawPanel(x, y, w, h, col) {
    g.fillStyle = 'rgba(12,10,28,.92)'; g.fillRect(x, y, w, h);
    g.fillStyle = col || '#c89a1c'; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h);
  }
  function drawCoop() {
    drawBgOnly(Math.floor(sceneT / 6) % 7, sceneT * 20, sceneT);
    g.fillStyle = 'rgba(5,3,15,.55)'; g.fillRect(0, 0, VW, VH);
    txt(cvs('ONLINE CO-OP', 'CO-OP ONLINE'), VW / 2, 20, { al: 'center', size: 16, bold: true, col: '#ffd34e' });
    txt(cvs('up to 5 players  •  30 heroes', 'tối đa 5 người  •  30 hero'), VW / 2, 34, { al: 'center', size: 7, col: '#cfd6e6' });
    const ph = coopUI.ph;
    if (ph === 'menu') {
      const it = coopMenuItems();
      drawHeroAt(myHero(), 80, 150, 1, Math.floor(sceneT * 3) % 2, 3);
      txt(LN(HERO[myHero()].name), 80, 162, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      it.forEach((o, i) => txt((coopUI.sel === i ? '> ' : '  ') + o.s + (coopUI.sel === i ? ' <' : ''), VW / 2 + 50, 74 + i * 18, { al: 'center', size: 9, col: coopUI.sel === i ? '#ffd34e' : '#e8eaf5' }));
      txt(cvs('Each player plays on their own computer and joins with the room code.', 'Mỗi người chơi trên máy riêng, vào phòng bằng mã phòng.'), VW / 2, VH - 26, { al: 'center', size: 6, col: '#8892aa' });
    } else if (ph === 'code') {
      txt(cvs('Type the 5-letter room code', 'Nhập mã phòng 5 ký tự'), VW / 2, 70, { al: 'center', size: 9 });
      for (let i = 0; i < 5; i++) { const x = VW / 2 - 70 + i * 28; drawPanel(x, 84, 24, 30, i === coopUI.code.length ? '#ffd34e' : '#5a4a8a'); txt(coopUI.code[i] || '', x + 12, 104, { al: 'center', size: 14, bold: true, col: '#fff' }); }
      txt(cvs('Enter = join   •   Esc = back', 'Enter = vào phòng   •   Esc = quay lại'), VW / 2, 134, { al: 'center', size: 7, col: '#8892aa' });
    } else if (ph === 'heroes') drawHeroPick();
    else if (ph === 'lobby') {
      const host = coop && coop.role === 'host';
      drawPanel(VW / 2 - 70, 42, 140, 22, '#ffd34e');
      txt(cvs('ROOM CODE: ', 'MÃ PHÒNG: ') + (coopUI.code || '-----'), VW / 2, 57, { al: 'center', size: 9, bold: true, col: '#ffd34e' });
      const sl = coopUI.slots || [];
      for (let i = 0; i < 5; i++) {
        const x = 26 + i * 68, s = sl.find(o => o.slot === i);
        drawPanel(x, 70, 60, 74, s ? PCOL[i] : '#3a3450');
        txt('P' + (i + 1), x + 4, 79, { size: 6, col: PCOL[i], bold: true });
        if (s) {
          drawHeroAt(s.hero, x + 30, 128, 1, Math.floor(sceneT * 3 + i) % 2, 2);
          txt(LN(HERO[s.hero].name), x + 30, 138, { al: 'center', size: 5, col: '#fff' });
          if (s.slot === (coop ? coop.me : 0)) txt(cvs('you', 'bạn'), x + 56, 79, { al: 'right', size: 5, col: '#a4ffc0' });
        } else txt(cvs('empty', 'trống'), x + 30, 110, { al: 'center', size: 6, col: '#5a5470' });
      }
      txt(cvs('Map: ', 'Bản đồ: ') + (coopUI.li + 1) + ' - ' + LN(BIOMES[LORDER[coopUI.li] === undefined ? 0 : LORDER[coopUI.li]].name), VW / 2, 158, { al: 'center', size: 8, col: '#cfd6e6' });
      txt(host ? cvs('←/→ map   •   C = change hero   •   Enter = START   •   Esc = close room', '←/→ chọn map   •   C = đổi hero   •   Enter = BẮT ĐẦU   •   Esc = đóng phòng') : cvs('C = change hero   •   Waiting for the host to start...   •   Esc = leave', 'C = đổi hero   •   Đang chờ chủ phòng bắt đầu...   •   Esc = rời phòng'), VW / 2, 174, { al: 'center', size: 6, col: '#ffd34e' });
      txt(cvs('Join link (L = copy): ', 'Link vào phòng (L = copy): ') + roomLink(), VW / 2, 186, { al: 'center', size: 5, col: '#8892aa' });
    }
    if (coopUI.msg) { const ls = wrapText(coopUI.msg, 72); ls.forEach((l, i) => txt(l, VW / 2, VH - 12 - (ls.length - 1 - i) * 9, { al: 'center', size: 7, col: coopUI.msgBad ? '#ff7a7a' : '#a4ffc0' })); }
  }
  function drawHeroPick() {
    const C = 10, cw = 36, chh = 28, x0 = (VW - C * cw) / 2, y0 = 40;
    HEROES.forEach((h, i) => {
      const cx = x0 + (i % C) * cw, cy = y0 + Math.floor(i / C) * chh, on = i === coopUI.hs;
      g.fillStyle = on ? 'rgba(255,211,78,.18)' : 'rgba(255,255,255,.04)'; g.fillRect(cx + 1, cy, cw - 2, chh - 2);
      g.fillStyle = HERO_CLS[h.cls].col; g.fillRect(cx + 1, cy + chh - 3, cw - 2, 1);
      if (heroLocked(h)) g.globalAlpha = 0.35;
      drawHeroAt(h.id, cx + cw / 2, cy + chh - 4, 1, on ? Math.floor(sceneT * 4) % 2 : 0, 1); g.globalAlpha = 1;
      if (heroLocked(h)) { g.fillStyle = '#c07bff'; g.fillRect(cx + cw - 9, cy + 3, 6, 5); g.fillStyle = '#14121f'; g.fillRect(cx + cw - 7, cy + 5, 2, 2); g.strokeStyle = '#c07bff'; g.lineWidth = 1; g.strokeRect(cx + cw - 8.5, cy + 0.5, 5, 4); }
      if (h.id === myHero()) txt('✓', cx + cw - 5, cy + 7, { size: 6, col: '#a4ffc0', al: 'right' });
      if (on) { g.fillStyle = '#ffd34e'; g.fillRect(cx, cy - 1, cw, 1); g.fillRect(cx, cy + chh - 2, cw, 1); g.fillRect(cx, cy - 1, 1, chh - 1); g.fillRect(cx + cw - 1, cy - 1, 1, chh - 1); }
    });
    const h = HEROES[coopUI.hs], cl = HERO_CLS[h.cls], y = y0 + Math.ceil(HEROES.length / C) * chh + 2;
    drawPanel(12, y, VW - 24, VH - y - 6, cl.col);
    drawHeroAt(h.id, 40, y + 46, 1, Math.floor(sceneT * 3) % 2, 1.8);
    if (heroLocked(h)) txt(cvs('SECRET - trade 10 Star Gems', 'BÍ MẬT - đổi 10 Ngọc Sao'), VW - 18, y + 12, { al: 'right', size: 6, col: '#c07bff', bold: true });
    txt(LN(h.name), 68, y + 12, { size: 10, bold: true, col: '#ffd34e' });
    txt(LN(cl), 68 + Math.round(LN(h.name).length * 6.2) + 8, y + 12, { size: 7, col: cl.col });
    const st = (n, v) => (v > 0 ? '+' : '') + v;
    txt(cvs('HP ', 'Máu ') + st(0, h.hp) + '   ' + cvs('Speed ', 'Tốc độ ') + st(0, Math.round(h.spd * 100)) + '%   ' + cvs('Damage ', 'Sát thương ') + st(0, h.dmg), 68, y + 25, { size: 7, col: '#cfd6e6' });
    txt('R / RB: ' + LN(h.sk.n) + '  (' + h.sk.cd + 's)', 68, y + 38, { size: 7, col: h.sk.col, bold: true });
    txt(LN(SKILL_DESC[h.sk.k]), 68, y + 49, { size: 6, col: '#e8eaf5' });
    txt(cvs('Arrows = choose   •   Enter = pick   •   Esc = back', 'Mũi tên = chọn   •   Enter = lấy hero   •   Esc = quay lại'), VW / 2, VH - 1, { al: 'center', size: 5, col: '#8892aa' });
  }
  function drawCoopHUD() {
    const P = Q.P, me = coop.me;
    // team list
    let y = 52;
    for (const p of Q.players || []) {
      if (p === P) continue;
      const h = HERO[p.hero] || HERO.ember;
      g.fillStyle = 'rgba(8,6,20,.6)'; g.fillRect(6, y - 7, 74, 10);
      g.fillStyle = PCOL[p.slot]; g.fillRect(6, y - 7, 2, 10);
      txt('P' + (p.slot + 1) + ' ' + LN(h.name).slice(0, 9), 11, y, { size: 5, col: p.down ? '#ff7a7a' : '#fff' });
      const w = 22, f = p.down ? 0 : Math.max(0, p.hp / (p.mhp || 1));
      g.fillStyle = '#3a1a20'; g.fillRect(55, y - 4, w, 4); g.fillStyle = p.down ? '#5a5470' : '#e0453a'; g.fillRect(55, y - 4, Math.round(w * f), 4);
      y += 11;
    }

    if (Q.state === 'dead') { if (coop.role === 'client') txt(cvs('Waiting for the host to restart the team...', 'Chờ chủ phòng cho cả đội chơi lại...'), VW / 2, 150, { al: 'center', size: 7, col: '#ffd34e' }); }
    else if (P && P.down) { txt(cvs('You are down... a friend can revive you faster', 'Bạn đã gục... đồng đội đứng cạnh để hồi sinh nhanh'), VW / 2, 70, { al: 'center', size: 8, col: '#ff7a7a', bold: true }); txt(Math.max(0, P.downT || 0).toFixed(1) + 's', VW / 2, 84, { al: 'center', size: 10, col: '#fff' }); }
    txt(cvs('Room ', 'Phòng ') + (NET.code || '') + (coop.role === 'host' ? cvs(' (host)', ' (chủ)') : ''), VW - 6, VH - 4, { al: 'right', size: 5, col: '#8892aa' });
  }
  function drawCoopTag(p, x, bot) {
    if (!coop) return;
    if (Q.boss && Q.arenaSealed && !Q.bossDead && Q.btSlot === p.slot && (Q.players || []).length > 1) { const k = Math.round(Math.sin(Q.t * 8) * 1.5); g.fillStyle = '#ff3a3a'; g.fillRect(x - 1, bot - 40 + k, 3, 6); g.fillRect(x - 1, bot - 32 + k, 3, 2); }
    txt('P' + (p.slot + 1), x, bot - 26, { al: 'center', size: 5, col: PCOL[p.slot] || '#fff', bold: true });
  }
  function drawDown(p, camX, camY) {
    const x = Math.round(p.x + 4 - camX), bot = Math.round(p.y + p.h - camY);
    g.fillStyle = '#5a5470'; g.fillRect(x - 4, bot - 10, 8, 10); g.fillRect(x - 6, bot - 7, 12, 3); g.fillStyle = '#8a84a0'; g.fillRect(x - 3, bot - 9, 2, 8);
    g.strokeStyle = PCOL[p.slot]; g.lineWidth = 2; g.beginPath(); g.arc(x, bot - 18, 5, -Math.PI / 2, -Math.PI / 2 + 6.283 * (1 - Math.max(0, p.downT || 0) / 9)); g.stroke();
    drawCoopTag(p, x, bot - 6);
  }
  // ===================== THREE NEW LANDS (played as maps 7-9, before the Shadow Citadel which is now map 10) =====================
  Object.assign(EN, {
    bogslime: { spr: 'slime', swap: { g: 'G', t: 'x', G: 'N' }, out: '#7ed957', w: 12, h: 9, hp: 3, sp: 24, ai: 'hop', jump: 190 },
    mosquito: { spr: 'bat', swap: { p: 'x', P: 'G' }, w: 12, h: 7, hp: 2, sp: 62, ai: 'fly' },
    bogzombie: { spr: 'zombie', swap: { g: 'x', G: 'G' }, out: '#7ed957', w: 9, h: 14, hp: 5, sp: 24, ai: 'walk' },
    toxbeetle: { spr: 'beetle', swap: { n: 'g', N: 'G', r: 'p' }, w: 10, h: 6, hp: 3, sp: 40, ai: 'walk' },
    crab: { spr: 'beetle', swap: { n: 'r', N: 'R', r: 'y' }, out: '#ff9a8a', w: 11, h: 6, hp: 3, sp: 40, ai: 'walk' },
    jelly: { spr: 'ghost', swap: { w: 'm', k: 'p' }, out: '#ff9fd0', w: 10, h: 11, hp: 3, sp: 26, ai: 'ghost' },
    piranha: { spr: 'bat', swap: { p: 'b', P: 'B', w: 'r' }, w: 12, h: 7, hp: 2, sp: 66, ai: 'fly' },
    seaslime: { spr: 'slime', swap: { g: 'c', t: 'w', G: 'B' }, out: '#6ee7f2', w: 12, h: 9, hp: 3, sp: 22, ai: 'hop', jump: 150 },
    eel: { spr: 'wisp', swap: { c: 'y', w: 'w' }, out: '#ffe44e', w: 8, h: 8, hp: 2, sp: 58, ai: 'ghost', blink: true },
    mole: { spr: 'beetle', swap: { n: 'N', N: 'k', r: 'm' }, w: 12, h: 7, hp: 4, sp: 36, ai: 'walk', burrow: true },
    rockslime: { spr: 'slime', swap: { g: 'd', t: 'l', G: 'D' }, out: '#c8c0b0', w: 12, h: 9, hp: 5, sp: 18, ai: 'hop', jump: 170 },
    minerskel: { spr: 'skeleton', swap: { e: 'y', E: 'Y' }, out: '#ffd34e', w: 9, h: 15, hp: 5, sp: 30, ai: 'charge' }
  });
  ['mosquito', 'piranha'].forEach(t => FLY.add(t));
  BOSS.push(
    { name: { en: 'Spore Queen', vi: 'Nữ Hoàng Bào Tử' }, art: 'shroom', drop: true, w: 64, h: 88, hp: 600, armor: 0.3, smart: 0.55, sp: 24, minion: 'bogslime', proj: '#c8f0a0', skills: ['goo', 'shoot', 'summon', 'rain', 'jump', 'spin'], skills2: ['slam', 'roar', 'erupt'] },
    { name: { en: 'Abyssal Kraken', vi: 'Thủy Quái Kraken' }, art: 'kraken', swim: true, artScale: 1.35, w: 170, h: 150, hp: 660, armor: 0.3, smart: 0.6, sp: 26, minion: 'piranha', proj: '#6ee7f2', skills: ['erupt', 'shoot', 'rain', 'charge', 'summon', 'fan', 'tentacles'], skills2: ['spin', 'roar', 'tentacles', 'tentacles'] },
    { name: { en: 'Gravemaw the Great Worm', vi: 'Sâu Khổng Lồ Gravemaw' }, art: 'worm', artScale: 1.15, w: 84, h: 108, hp: 720, armor: 0.35, smart: 0.6, sp: 28, minion: 'mole', proj: '#c8a070', skills: ['burrow', 'burrow', 'charge', 'rain', 'summon'], skills2: ['burrow', 'slam', 'roar'] }
  );
  [7, 8, 9].forEach(i => { NPCS['boss' + i] = { spr: 'boss:' + i, name: BOSS[i].name }; });   // so their pre/post-fight dialogue has a speaker
  // the worm hides under the ground, rumbles under a hero for a moment, then bursts out - move away in time!
  BS.burrow = {
    tele: 0.4,
    start(b) { b.n = 2 + (b.phase >= 1 ? 1 : 0); b.ph = 0; b.skT = 0.45; b.hide = true; b.vx = 0; const c = bc(b); Snd.play('crumble'); Q.shake = Math.max(Q.shake, 0.4); emit(c.x, b.y + b.h, 26, { col: ['#8a6a4a', '#5a4430', '#c8a070'], sp0: 30, sp1: 120, vy: -60 }); addRing(c.x, b.y + b.h, '#8a6a4a', 50, 0.5); },
    upd(b, dt) {
      b.skT -= dt;
      if (b.ph === 0) { if (b.skT <= 0) { const t = Q.P; b.tx = arenaClamp(t.x + 4); b.ph = 1; b.skT = 1.0 - Math.min(0.3, b.phase * 0.12); } }
      else if (b.ph === 1) {
        const gy = groundYAt(b.tx); Q.shake = Math.max(Q.shake, 0.12);
        if (Math.random() < 0.7) emit(b.tx + rr(-14, 14), gy, 1, { col: ['#8a6a4a', '#c8a070'], sp0: 10, sp1: 50, vy: -50 });
        if (b.skT <= 0) {
          b.x = b.tx - b.w / 2; b.y = gy - b.h; b.hide = false; b.vy = -330; b.onGround = false; b.ph = 2; b.skT = 0.75;
          Snd.play('boom'); Snd.creature(Q.li, 'attack', true); Q.shake = 0.7; emit(b.tx, gy, 40, { col: ['#8a6a4a', '#5a4430', '#fff6e0'], sp0: 40, sp1: 170, vy: -90 }); addRing(b.tx, gy, '#c8a070', 70, 0.5);
          hitPlB({ x: b.tx - b.w / 2 - 6, y: gy - b.h - 20, w: b.w + 12, h: b.h + 20 }, () => hurtPlayer(2, b.tx));
          for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; firePr(b.tx, gy - 10, Math.cos(a) * 130, Math.sin(a) * 160, { col: '#8a6a4a' }); }
        }
      } else if (b.ph === 2 && b.skT <= 0) {
        if (--b.n > 0) { b.hide = true; b.ph = 0; b.skT = 0.35; Snd.play('crumble'); emit(b.x + b.w / 2, b.y + b.h, 20, { col: ['#8a6a4a', '#5a4430'], sp0: 20, sp1: 90, vy: -40 }); }
        else return true;
      }
    }
  };
  // the Kraken sweeps its tentacles across the cavern in bands: only one band is safe - swim there!
  BS.tentacles = {
    tele: 0.5,
    start(b) {
      const ar = Q.L.arena, n = 5, safe = Math.floor(Math.random() * n), base = ar.gy * TS - 14;
      for (let k = 0; k < n; k++) if (k !== safe) { const y = base - k * 58 - 6, dir = Math.random() < 0.5 ? 1 : -1; addZone({ type: 'beam', x: ar.x0 * TS + 12, y, w: (ar.x1 - ar.x0) * TS - 24, h: 24, tel: 1.5, life: 0.55, col: '#a02a6a', dmg: 1 }); }
      Snd.monster(8, 'attack', 1); b.skT = 2.6; Q.msg = save.lang === 'vi' ? 'Xúc tu quét ngang! Bơi vào khoảng trống!' : 'Tentacle sweep! Swim into the gap!'; Q.msgT = 2.5;
    },
    upd: wait
  };
  RELICS.push(
    { name: { en: 'Spore Charm', vi: 'Bùa Bào Tử' }, desc: { en: 'Your sword poisons what it hits', vi: 'Kiếm của bạn làm trúng độc kẻ địch' } },
    { name: { en: 'Pearl of Tides', vi: 'Ngọc Trai Thủy Triều' }, desc: { en: '+1 max heart, swim faster', vi: '+1 tim tối đa, bơi nhanh hơn' } },
    { name: { en: 'Mole Claw', vi: 'Móng Chuột Chũi' }, desc: { en: 'Bombs deal double damage', vi: 'Bom gây sát thương gấp đôi' } }
  );
  Object.assign(MAP_STORY, {
    7: [{ en: 'GLOWCAP SWAMP. After the volcano, the road sinks into a swamp where the mushrooms are taller than houses and glow like lanterns.', vi: 'ĐẦM LẦY NẤM PHÁT QUANG. Sau núi lửa, con đường chìm vào một đầm lầy nơi nấm cao hơn nhà và phát sáng như đèn lồng.' },
        { en: 'Their light is not warm. It is the cold glow of the Spore Queen, who promised Quoc to choke the last fragment in her roots.', vi: 'Thứ ánh sáng ấy không ấm. Đó là ánh lạnh của Nữ Hoàng Bào Tử, kẻ đã hứa với Quoc sẽ siết chặt mảnh cuối trong rễ của mình.' },
        { en: 'Watch your step. Breathe through your scarf. And never trust a mushroom that smiles.', vi: 'Nhìn kỹ đường đi. Thở qua khăn quàng. Và đừng bao giờ tin một cây nấm biết cười.' }],
    8: [{ en: 'SUNKEN DEEP. The swamp drains into the sea, and the sea swallows the road. Ember takes a deep breath... and dives.', vi: 'ĐẠI DƯƠNG SÂU THẲM. Đầm lầy đổ ra biển, và biển nuốt mất con đường. Ember hít một hơi thật sâu... rồi lặn xuống.' },
        { en: 'Down here you swim: press jump again and again to rise, and let the water carry you down gently.', vi: 'Dưới này bạn phải bơi: nhấn nhảy liên tục để ngoi lên, và để nước nhẹ nhàng đưa bạn xuống.' },
        { en: 'Somewhere in the dark below, something with eight arms is holding a piece of the Sun like a toy.', vi: 'Đâu đó trong bóng tối bên dưới, một thứ có tám cánh tay đang cầm một mảnh Mặt Trời như món đồ chơi.' }],
    9: [{ en: 'DEEPDIG TUNNELS. The last road to the Citadel goes under the earth, through tunnels the old miners dug and then ran away from.', vi: 'ĐƯỜNG HẦM SÂU. Con đường cuối cùng tới Thành Trì đi xuyên lòng đất, qua những đường hầm thợ mỏ xưa đã đào rồi bỏ chạy.' },
        { en: 'They ran because of Gravemaw, a worm so big it swims through rock like water. When the ground shakes under your feet - jump away!', vi: 'Họ bỏ chạy vì Gravemaw, một con sâu to đến mức bơi trong đá như bơi trong nước. Khi mặt đất rung dưới chân - hãy nhảy tránh!' }]
  });
  Object.assign(MID_STORY, {
    7: [{ w: 'ember', en: 'Everything glows here... and everything is watching me.', vi: 'Mọi thứ ở đây đều phát sáng... và đều đang nhìn mình.' },
        { w: 'narr', en: 'A choir of tiny mushrooms turns their caps to follow the lantern. Somewhere ahead, a great one laughs.', vi: 'Một dàn đồng ca nấm nhỏ xoay mũ theo chiếc đèn. Ở phía trước, một cây nấm khổng lồ cất tiếng cười.' }],
    8: [{ w: 'ember', en: 'The lantern still burns underwater. The Sun really does not give up.', vi: 'Đèn vẫn cháy dưới nước. Mặt Trời đúng là không chịu bỏ cuộc.' },
        { w: 'narr', en: 'A shadow passes overhead, longer than a ship. The whole sea goes quiet.', vi: 'Một cái bóng lướt qua trên đầu, dài hơn cả con tàu. Cả biển lặng ngắt.' }],
    9: [{ w: 'ember', en: 'Did the floor just... breathe?', vi: 'Mặt đất vừa... thở à?' },
        { w: 'narr', en: 'Far below, something enormous turns over in its sleep. The tunnels groan like an old ship.', vi: 'Sâu bên dưới, một thứ khổng lồ trở mình trong giấc ngủ. Các đường hầm rên lên như một con tàu cũ.' }]
  });
  Object.assign(BOSS_LINES, {
    7: { pre: [{ en: 'Shhh, little flame. Breathe in. Every breath of my swamp makes you mine.', vi: 'Suỵt, ngọn lửa nhỏ. Hít vào đi. Mỗi hơi thở trong đầm lầy này đều biến ngươi thành của ta.' },
        { w: 'ember', en: 'Then I will hold my breath and swing fast.', vi: 'Vậy ta sẽ nín thở và chém thật nhanh.' }],
      post: [{ en: 'My garden... will grow again... in the dark...', vi: 'Khu vườn của ta... sẽ mọc lại... trong bóng tối...' },
        { w: 'narr', en: 'The cold glow fades. For the first time in years, real fireflies return to the swamp.', vi: 'Ánh sáng lạnh tắt dần. Lần đầu tiên sau nhiều năm, đom đóm thật quay về đầm lầy.' }] },
    8: { pre: [{ en: 'GLUB... SHINY... MINE... ALL EIGHT ARMS SAY MINE!', vi: 'ỌC... LẤP LÁNH... CỦA TA... CẢ TÁM CÁNH TAY ĐỀU NÓI CỦA TA!' },
        { w: 'ember', en: 'You have eight arms and you still cannot share?', vi: 'Có tám cánh tay mà vẫn không biết chia sẻ à?' }],
      post: [{ en: 'Glub... the light... tickles...', vi: 'Ọc... ánh sáng... nhột quá...' },
        { w: 'narr', en: 'The Kraken lets go and sinks into the deep, almost smiling. Sunlight reaches the seabed again.', vi: 'Thủy Quái buông tay, chìm vào đáy sâu, gần như mỉm cười. Ánh nắng lại chạm tới đáy biển.' }] },
    9: { pre: [{ en: 'RRRRUMBLE... I TASTE LIGHT ABOVE ME. I WILL SWALLOW IT WHOLE.', vi: 'GRỪỪỪ... TA NẾM THẤY ÁNH SÁNG Ở TRÊN. TA SẼ NUỐT CHỬNG NÓ.' },
        { w: 'ember', en: 'Everyone said this would be the easy part. Everyone lied.', vi: 'Ai cũng bảo đoạn này dễ. Ai cũng nói dối.' }],
      post: [{ en: 'Too... bright... back to... the deep...', vi: 'Sáng... quá... trở về... lòng đất...' },
        { w: 'narr', en: 'Gravemaw burrows away for good. Above the tunnels, the black towers of the Shadow Citadel are waiting.', vi: 'Gravemaw đào đi mãi mãi. Phía trên đường hầm, những ngọn tháp đen của Thành Trì Bóng Đêm đang chờ đợi.' }] }
  });
  // devil cutscenes: the old "after the volcano" scene now plays after the tunnels, right before the Citadel
  CUT[9] = CUT[5];
  CUT[5] = [
    { w: 'quoc', shout: 1, en: 'THE TITAN IS ASH!! ASH!!! HE WAS MY FAVORITE VOLCANO!', vi: 'TITAN THÀNH TRO RỒI!! TRO!!! HẮN LÀ NGỌN NÚI LỬA YÊU THÍCH CỦA TA!' },
    { w: 'shorty', en: 'Master, the lantern now walks toward the Glowcap Swamp...', vi: 'Thưa chủ nhân, chiếc đèn giờ đang đi về phía Đầm Lầy Nấm...' },
    { w: 'quoc', en: 'Good. The Spore Queen will fill its little lungs with my darkness.', vi: 'Tốt. Nữ Hoàng Bào Tử sẽ lấp đầy hai lá phổi bé nhỏ của nó bằng bóng tối của ta.' }
  ];
  CUT[7] = [
    { w: 'quoc', shout: 1, en: 'MY QUEEN... COMPOST?! WHO LETS A CANDLE WALK THROUGH A SWAMP?!', vi: 'NỮ HOÀNG CỦA TA... THÀNH PHÂN BÓN?! AI CHO CÂY NẾN ĐI QUA ĐẦM LẦY VẬY?!' },
    { w: 'sy', en: 'My lord, the road goes under the sea now. No flame survives the deep.', vi: 'Thưa chủ nhân, con đường giờ đi xuống đáy biển. Không ngọn lửa nào sống nổi dưới đó.' },
    { w: 'quoc', en: 'Then wake the Kraken. Let it squeeze that light until it pops.', vi: 'Vậy đánh thức Thủy Quái đi. Để nó siết ánh sáng đó tới khi vỡ tan.' }
  ];
  CUT[8] = [
    { w: 'quoc', shout: 1, en: 'IT SWIMS?! THE CANDLE SWIMS?!', vi: 'NÓ BIẾT BƠI?! CÂY NẾN BIẾT BƠI?!' },
    { w: 'shorty', en: 'It... also tickled the Kraken, master. He looked happy.', vi: 'Nó... còn cù lét Thủy Quái nữa, thưa chủ nhân. Trông hắn vui lắm.' },
    { w: 'quoc', shout: 1, en: 'NOBODY IS HAPPY IN MY KINGDOM! GRAVEMAW! SWALLOW THE ROAD! SWALLOW EVERYTHING!', vi: 'KHÔNG AI ĐƯỢC VUI TRONG VƯƠNG QUỐC CỦA TA! GRAVEMAW! NUỐT CON ĐƯỜNG! NUỐT HẾT MỌI THỨ!' }
  ];
  Object.assign(COOP_MAP, {
    7: [L2('narr', 'Glowcap Swamp. The mushrooms here are taller than houses, and the Spore Queen rules them all.', 'Đầm Lầy Nấm Phát Quang. Nấm ở đây cao hơn nhà, và Nữ Hoàng Bào Tử cai trị tất cả.'),
        L2('{p1}', 'Nobody eat anything here. I mean it.', 'Không ai được ăn gì ở đây nhé. Nói thật đó.'),
        L2('{p0}', 'Not even the glowing one? It looks delicious.', 'Kể cả cây phát sáng kia à? Nhìn ngon mà.')],
    8: [L2('narr', 'The Sunken Deep. The road dives under the sea. Press jump again and again to swim up.', 'Đại Dương Sâu Thẳm. Con đường lặn xuống biển. Nhấn nhảy liên tục để bơi lên.'),
        L2('{p0}', 'Can everyone swim? ...Can everyone swim WITH armour?', 'Mọi người biết bơi chứ? ...Biết bơi khi đang mặc giáp chứ?'),
        L2('{p1}', 'Guess we are about to find out!', 'Chắc sắp biết ngay thôi!')],
    9: [L2('narr', 'The Deepdig Tunnels. Gravemaw the Great Worm swims through rock like water.', 'Đường Hầm Sâu. Sâu Khổng Lồ Gravemaw bơi trong đá như bơi trong nước.'),
        L2('{p1}', 'If the ground shakes under you, jump. Do not ask questions, just jump.', 'Đất rung dưới chân thì nhảy. Đừng hỏi, cứ nhảy.'),
        L2('{p0}', 'Last land before the Citadel. Let us finish this together.', 'Vùng đất cuối trước Thành Trì. Cùng nhau kết thúc nào.')]
  });
  // side characters
  Object.assign(NPCS, {
    frog: { spr: 'npc_frog', name: { en: 'Old Croak the Frog Sage', vi: 'Ếch Hiền Già Ộp' }, generic: [
      { en: 'Croak... a lantern in my swamp. I have waited one hundred rainy seasons for you.', vi: 'Ộp... một chiếc đèn trong đầm lầy của ta. Ta đã đợi ngươi một trăm mùa mưa.' },
      { en: 'The Queen\'s spores make you slow. Keep moving, keep swinging, and never stand in the green clouds.', vi: 'Bào tử của Nữ Hoàng làm ngươi chậm lại. Cứ di chuyển, cứ chém, và đừng bao giờ đứng trong đám mây xanh.' }] },
    witch: { spr: 'npc_witch', name: { en: 'Granny Moss', vi: 'Bà Rêu' }, gift: { dagger: 3, bomb: 2, flask: 2 }, generic: [
      { en: 'Heh heh. Not every witch works for Quoc, dearie. Some of us just like soup.', vi: 'Hê hê. Không phải phù thủy nào cũng làm cho Quoc đâu cưng. Có người chỉ thích nấu súp thôi.' },
      { en: 'Take these. Bombs for mushrooms, flasks for anything that bites. Now shoo!', vi: 'Cầm lấy. Bom cho lũ nấm, bình lửa cho bất cứ thứ gì biết cắn. Giờ thì đi đi!' }] },
    mermaid: { spr: 'npc_mermaid', name: { en: 'Nami the Mermaid', vi: 'Nàng Tiên Cá Nami' }, generic: [
      { en: 'A land-walker with a little sun! The fish told me you were coming.', vi: 'Một người trên cạn mang theo mặt trời nhỏ! Lũ cá đã kể với tôi bạn sắp tới.' },
      { en: 'The Kraken is not evil, just lonely and greedy. Hit it when it opens its arms wide!', vi: 'Thủy Quái không ác đâu, chỉ cô đơn và tham lam thôi. Đánh nó khi nó dang rộng tay nhé!' }] },
    pirate: { spr: 'npc_pirate', name: { en: 'Captain Redbeard', vi: 'Thuyền Trưởng Râu Đỏ' }, gift: { dagger: 6, bomb: 1, flask: 1 }, generic: [
      { en: 'Arr! My ship sank chasing that Kraken. Now I live here. The rent is cheap.', vi: 'Arr! Tàu ta chìm vì đuổi theo con Thủy Quái. Giờ ta sống ở đây. Tiền thuê rẻ lắm.' },
      { en: 'Take my daggers, lad. They fly straight even underwater. Mostly.', vi: 'Cầm dao của ta đi nhóc. Chúng bay thẳng kể cả dưới nước. Phần lớn là vậy.' }] },
    fisher: { spr: 'npc_fisher', name: { en: 'Old Tu the Fisherman', vi: 'Ông Tư Đánh Cá' }, generic: [
      { en: 'Forty years I fished these waters and never caught anything like you.', vi: 'Bốn mươi năm ông câu ở vùng nước này, chưa bao giờ câu được thứ gì như cháu.' },
      { en: 'Star Gems glitter on the coral, high up. Swim up and look around, child.', vi: 'Ngọc Sao lấp lánh trên rạn san hô, ở chỗ cao. Bơi lên mà nhìn quanh nhé cháu.' }] },
    miner: { spr: 'npc_miner', name: { en: 'Bay the Miner', vi: 'Thợ Mỏ Bảy Búa' }, gift: { dagger: 0, bomb: 4, flask: 0 }, generic: [
      { en: 'You hear that rumble? That is Gravemaw. He ate my cart. And my lunch. And my other cart.', vi: 'Nghe tiếng ầm ầm không? Đó là Gravemaw. Nó ăn mất xe của tôi. Cả bữa trưa. Cả cái xe kia nữa.' },
      { en: 'Here, take some bombs. Cracked walls hide shortcuts down here.', vi: 'Đây, cầm ít bom. Dưới này tường nứt hay giấu lối tắt lắm.' }] },
    mole: { spr: 'npc_mole', name: { en: 'Grandpa Mole', vi: 'Ông Chuột Chũi' }, generic: [
      { en: 'Eh? Speak up, I cannot see you. I cannot see anyone. I am a mole.', vi: 'Hả? Nói to lên, ông không thấy cháu. Ông chẳng thấy ai cả. Ông là chuột chũi mà.' },
      { en: 'But I can FEEL the worm. When the dust jumps, he is right below. Run!', vi: 'Nhưng ông CẢM được con sâu. Khi bụi nảy lên là nó ở ngay bên dưới. Chạy!' }] },
    bard: { spr: 'npc_bard', name: { en: 'Lirio the Bard', vi: 'Lirio Người Hát Rong' }, generic: [
      { en: 'Ah, the Lanternbearer! I am writing a song about you. So far it has three verses and one rhyme.', vi: 'A, Người Mang Đèn! Tôi đang viết một bài hát về bạn. Hiện có ba đoạn và đúng một vần.' },
      { en: '"Oh little flame, so brave and bright, you hit the slimes with all your might..." Too much?', vi: '"Ơi ngọn lửa nhỏ dũng cảm sáng ngời, chém lũ slime chẳng nghỉ ngơi..." Hơi lố hả?' }] }
  });
  // ===================== SCENERY: tile details, props, living sky, foreground, colour mood =====================
  const SOLC = c => c === '#' || c === 'I' || c === 'C' || c === 'X' || c === 'G';
  function buildScene() {
    const L = Q.L, B = Q.B, rn = mulberry32(4242 + Q.li * 59), props = [], kinds = BIOME_PROPS[B.id] || [];
    const endX = (L.arena ? L.arena.x0 : L.W) - 2, topOf = x => { for (let y = 2; y < L.H - 1; y++) { const c = L.grid[y][x]; if (c === '#' || c === 'I') return L.grid[y - 1][x] === ' ' ? y : -1; if (c !== ' ') return -1; } return -1; };
    const busy = x => L.spawns.some(sp => Math.abs(sp.x / TS - x) < 2.2) || L.checkpoints.some(cp => Math.abs(cp.x / TS - x) < 3) || (L.nooks || []).some(n => x >= n.x - 1 && x <= n.x + 5);
    for (let x = 4; x < endX && kinds.length;) {
      const y = topOf(x);
      if (y > 0 && topOf(x + 1) === y && topOf(x - 1) === y && !busy(x) && rn() < 0.55) { const k = kinds[Math.floor(rn() * kinds.length)]; props.push({ k, x: x * TS + 8 + Math.round((rn() - 0.5) * 6), y: y * TS, f: rn() < 0.5 }); x += 5 + Math.floor(rn() * 7); }
      else x += 2;
    }
    // props on high ledges too
    for (let x = 4; x < endX && kinds.length; x++) for (let y = 2; y < 8; y++) if (L.grid[y][x] === '=' && L.grid[y][x + 1] === '=' && L.grid[y - 1][x] === ' ' && rn() < 0.05) props.push({ k: kinds[Math.floor(rn() * kinds.length)], x: x * TS + 12, y: y * TS, f: rn() < 0.5, small: true });
    if (L.waterY !== undefined && Q.B.water) for (let y = 11; y < L.H - 3; y++) for (let x = 4; x < L.W - 4; x++) { if (L.grid[y][x] === '#' && L.grid[y - 1][x] === ' ' && L.grid[y][x + 1] === '#' && L.grid[y - 1][x + 1] === ' ' && rn() < 0.07 && !busy(x)) props.push({ k: kinds[Math.floor(rn() * kinds.length)], x: x * TS + 8, y: y * TS, f: rn() < 0.5 }); }
    if (L.forest) for (let x = L.forest.x0 + 1; x < L.forest.x1; x += 4 + Math.floor(rn() * 4)) { let y = -1; for (let yy = 4; yy < L.H - 1; yy++) { const c = L.grid[yy][x]; if (c === '#' || c === 'I') { y = yy; break; } } if (y > 0 && L.grid[y - 1][x] !== '#') props.push({ k: ['hugeshroom', 'hugetree', 'hugeshroomB', 'hugetree'][Math.floor(rn() * 4)], x: x * TS + 8, y: y * TS, f: rn() < 0.5 }); }
    const fg = []; for (let x = 120; x < L.W * TS * 1.3; x += 180 + Math.floor(rn() * 260)) fg.push({ x, h: 26 + Math.floor(rn() * 30), s: rn() });
    const clouds = []; for (let i = 0; i < 9; i++) clouds.push({ x: rn() * (VW + 200), y: 14 + rn() * 60, w: 22 + rn() * 40, v: 2 + rn() * 5 });
    const flocks = []; for (let i = 0; i < 3; i++) flocks.push({ x: rn() * 600, y: 26 + rn() * 50, v: 12 + rn() * 10, n: 3 + Math.floor(rn() * 4), ph: rn() * 6 });
    return { props: props.filter(p => !p.small || PROP_PAINT[p.k][1] <= 20), fg, clouds, flocks };
  }
  // details on one ground tile: grass, snow, moss, edge shadows and things hanging under ledges
  function decoTile(tx, ty, dx, dy, isTop, h) {
    const L = Q.L, B = Q.B, G = B.ground, id = B.id;
    const lc = tx > 0 ? L.grid[ty][tx - 1] : '#', rc = tx < L.W - 1 ? L.grid[ty][tx + 1] : '#', bc = ty < L.H - 1 ? L.grid[ty + 1][tx] : '#';
    if (!isTop) { let d = 0; for (let k = 1; k <= 4 && ty - k >= 0 && SOLC(L.grid[ty - k][tx]); k++) d++; if (d > 1) { g.fillStyle = 'rgba(0,0,0,' + ((d - 1) * 0.07).toFixed(2) + ')'; g.fillRect(dx, dy, 16, 16); } }
    if (!SOLC(lc)) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(dx, dy + (isTop ? 3 : 0), 2, isTop ? 13 : 16); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(dx + 2, dy + (isTop ? 4 : 0), 1, isTop ? 12 : 16); }
    if (!SOLC(rc)) { g.fillStyle = 'rgba(0,0,0,.38)'; g.fillRect(dx + 14, dy + (isTop ? 3 : 0), 2, isTop ? 13 : 16); }
    if (!SOLC(bc) && bc !== '~') {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(dx, dy + 14, 16, 2);
      const sw = Math.round(Math.sin(Q.t * 1.6 + tx) * 0.8), n = 1 + (h % 3);
      for (let k = 0; k < n; k++) {
        const x = dx + 2 + ((h >> (k * 5)) % 12), len = 3 + ((h >> (k * 3)) % 6);
        if (id === 'frost') { g.fillStyle = '#e8fbff'; for (let i = 0; i < len; i++) g.fillRect(x + (i > len - 3 ? 0 : 0), dy + 16 + i, Math.max(1, 2 - (i >> 2)), 1); g.fillStyle = '#9fe0f0'; g.fillRect(x, dy + 16, 1, len - 1); }
        else if (id === 'caves' || id === 'tunnels') { g.fillStyle = G.dark; for (let i = 0; i < len; i++) g.fillRect(x - (i < 2 ? 1 : 0), dy + 16 + i, i < 2 ? 3 : (i < len - 1 ? 2 : 1), 1); if (id === 'caves' && k === 0 && Math.sin(Q.t * 3 + tx) > 0.7) { g.fillStyle = '#8ad8ff'; g.fillRect(x, dy + 16 + len + ((Q.t * 30 + tx * 7) % 20), 1, 2); } }
        else if (id === 'volcano') { g.fillStyle = '#2a1f28'; g.fillRect(x, dy + 16, 2, Math.min(3, len)); if (k === 0 && Math.sin(Q.t * 2 + tx * 3) > 0.6) { g.fillStyle = '#ff7a2a'; g.fillRect(x, dy + 19 + ((Q.t * 20 + tx) % 12), 1, 2); } }
        else if (id === 'citadel') { g.fillStyle = '#6a3aa8'; g.fillRect(x, dy + 16, 1, len); g.fillStyle = '#c9a0ff'; g.fillRect(x, dy + 16 + len, 1, 1); }
        else if (id === 'ocean') { g.fillStyle = '#16805a'; for (let i = 0; i < len + 3; i++) g.fillRect(x + Math.round(Math.sin(Q.t * 2 + i * 0.6 + tx) * 1.2), dy + 16 + i, 1, 1); }
        else if (id === 'desert') { if (k === 0 && Math.sin(Q.t * 1.5 + tx * 2) > 0.8) { g.fillStyle = 'rgba(240,200,120,.7)'; g.fillRect(x, dy + 16 + ((Q.t * 25 + tx) % 14), 1, 1); } }
        else { g.fillStyle = id === 'swamp' ? '#3a6a2a' : (k ? '#5e3b22' : G.topDark); for (let i = 0; i < len; i++) g.fillRect(x + (i > 2 ? sw : 0), dy + 16 + i, 1, 1); if (id === 'swamp' && k === 0) { g.fillStyle = '#a4ffc0'; g.fillRect(x + sw, dy + 16 + len, 1, 1); } }
      }
    }
    if (!isTop) return;
    const t = Q.t, sway = k => Math.round(Math.sin(t * 2.2 + tx * 0.9 + k * 1.7) * (id === 'ocean' ? 1.5 : 0.8));
    if (id === 'meadow' || id === 'forest' || id === 'swamp') {
      for (let k = 0; k < 4; k++) { const x = dx + ((h >> (k * 4)) & 15), ht = 2 + ((h >> (k * 2 + 1)) % 3); g.fillStyle = k % 2 ? G.topLight : G.top; g.fillRect(x, dy - ht + 1, 1, ht); g.fillRect(x + sway(k), dy - ht, 1, 1); }
      if (id === 'meadow' && h % 5 === 0) { const x = dx + 4 + (h % 8); g.fillStyle = G.topDark; g.fillRect(x, dy - 4, 1, 4); g.fillStyle = ['#ff7fb0', '#ffd34e', '#fff', '#a98bff'][h % 4]; g.fillRect(x - 1 + sway(5), dy - 6, 3, 2); g.fillStyle = '#ffd34e'; g.fillRect(x + sway(5), dy - 6, 1, 1); }
      if (id === 'forest' && h % 9 === 0) { const x = dx + 6; g.fillStyle = '#e8dcc0'; g.fillRect(x, dy - 3, 1, 3); g.fillStyle = '#e0453a'; g.fillRect(x - 1, dy - 5, 3, 2); g.fillStyle = '#fff'; g.fillRect(x, dy - 5, 1, 1); }
      if (id === 'swamp' && h % 6 === 0) { const x = dx + 3 + (h % 9); g.fillStyle = '#e8dcc0'; g.fillRect(x, dy - 3, 1, 3); g.fillStyle = Math.sin(t * 3 + tx) > 0 ? '#a4ffc0' : '#6ee7f2'; g.fillRect(x - 1, dy - 5, 3, 2); }
      if (!SOLC(L.grid[ty][tx - 1] || '#')) { g.fillStyle = G.top; g.fillRect(dx - 1, dy + 1, 1, 3); g.fillStyle = G.topDark; g.fillRect(dx - 1, dy + 4, 1, 1); }
      if (!SOLC(L.grid[ty][tx + 1] || '#')) { g.fillStyle = G.top; g.fillRect(dx + 16, dy + 1, 1, 3); }
    } else if (id === 'frost') {
      g.fillStyle = '#ffffff'; g.fillRect(dx, dy - 1, 16, 1); g.fillRect(dx + (h % 10), dy - 2, 4, 1); if (h % 3 === 0) g.fillRect(dx + 3 + (h % 7), dy - 3, 2, 1);
      if (h % 7 === 0 && Math.sin(t * 4 + tx) > 0.8) { g.fillStyle = '#fff'; g.fillRect(dx + (h % 14), dy - 2, 1, 1); }
    } else if (id === 'desert') {
      g.fillStyle = G.topLight; g.fillRect(dx + (h % 6), dy + 2, 6, 1); if (h % 6 === 0) { g.fillStyle = '#8a6a44'; g.fillRect(dx + 8, dy - 3, 1, 3); g.fillRect(dx + 7, dy - 2, 1, 1); g.fillRect(dx + 9, dy - 3, 1, 1); }
      if (h % 11 === 0) { g.fillStyle = '#c8b898'; g.fillRect(dx + 3, dy - 1, 2, 1); }
    } else if (id === 'caves' || id === 'citadel') {
      if (h % 4 === 0) { const x = dx + 2 + (h % 11), c2 = id === 'caves' ? ['#6ee7f2', '#c07bff', '#ff7fb0'][h % 3] : '#c9a0ff'; g.fillStyle = c2; g.fillRect(x, dy - 3, 2, 3); g.fillRect(x + 2, dy - 2, 1, 2); g.fillStyle = '#fff'; g.fillRect(x, dy - 3, 1, 1); }
      if (id === 'citadel' && h % 5 === 1) { g.fillStyle = '#4a2a7a'; g.fillRect(dx + (h % 13), dy - 1, 3, 1); }
    } else if (id === 'volcano') {
      if (h % 3 === 0) { const a = 0.5 + 0.5 * Math.sin(t * 3 + tx * 1.7); g.fillStyle = 'rgba(255,122,42,' + a.toFixed(2) + ')'; g.fillRect(dx + (h % 12) + 1, dy + 1, 3, 1); g.fillRect(dx + (h % 12) + 3, dy + 2, 1, 1); }
    } else if (id === 'ocean') {
      for (let k = 0; k < 3; k++) { const x = dx + ((h >> (k * 4)) & 15), ht = 3 + ((h >> (k * 3)) % 4); g.fillStyle = k % 2 ? '#2ab08a' : '#16805a'; for (let i = 0; i < ht; i++) g.fillRect(x + Math.round(Math.sin(t * 2 + i * 0.7 + tx + k) * 1.2 * (i / ht)), dy - i, 1, 1); }
      if (h % 8 === 0) { g.fillStyle = '#ffd0e0'; g.fillRect(dx + 5, dy - 1, 3, 1); g.fillRect(dx + 6, dy - 2, 1, 1); }
    } else if (id === 'tunnels') {
      if (h % 3 === 0) { g.fillStyle = '#5a4430'; g.fillRect(dx + (h % 12), dy - 1, 2, 1); g.fillStyle = '#8a7a6a'; g.fillRect(dx + (h % 9) + 4, dy - 1, 1, 1); }
      if (h % 13 === 0) { g.fillStyle = '#ffd34e'; g.fillRect(dx + 7, dy + 3, 1, 1); }
    }
  }
  // ropes, chains or seaweed hanging from the ends of floating platforms
  function platEnds(tx, ty, dx, dy) {
    const L = Q.L, id = Q.B.id, below = ty < L.H - 1 ? L.grid[ty + 1][tx] : '#';
    if (SOLC(below)) return;
    const lEnd = L.grid[ty][tx - 1] !== '=', rEnd = L.grid[ty][tx + 1] !== '=';
    if (!lEnd && !rEnd) { if (((tx * 31) % 5) === 0 && (id === 'meadow' || id === 'forest' || id === 'swamp')) { g.fillStyle = id === 'swamp' ? '#3a6a2a' : '#2f7a4a'; const n = 4 + (tx % 5); for (let i = 0; i < n; i++) g.fillRect(dx + 8 + Math.round(Math.sin(Q.t * 1.5 + i * 0.5 + tx) * (i / n) * 1.5), dy + 8 + i, 1, 1); g.fillStyle = '#5fcf5a'; g.fillRect(dx + 7, dy + 10, 2, 1); } return; }
    const x = dx + (lEnd ? 2 : 13), metal = id === 'caves' || id === 'citadel' || id === 'volcano' || id === 'frost';
    if (id === 'ocean') { g.fillStyle = '#16805a'; for (let i = 0; i < 9; i++) g.fillRect(x + Math.round(Math.sin(Q.t * 2 + i * 0.6 + tx) * 1.3), dy + 8 + i, 1, 1); return; }
    if (metal) { g.fillStyle = id === 'frost' ? '#9fe0f0' : '#5a5a66'; for (let i = 0; i < 4; i++) { g.fillRect(x, dy + 8 + i * 3, 1, 2); g.fillRect(x - 1, dy + 9 + i * 3, 3, 1); } }
    else { g.fillStyle = '#8a6a44'; g.fillRect(x, dy + 8, 1, 7); g.fillStyle = '#c8a070'; g.fillRect(x - 1, dy + 15, 3, 2); }
  }
  // clouds, birds, bats and fish swimming across the sky
  function drawSkyLife(camX, camY) {
    const S = SKY_STYLE[Q.B.id] || {}, sc = Q.scn; if (!sc) return;
    if (S.cloud) for (const c of sc.clouds) {
      const x = ((c.x - camX * 0.04 + Q.t * c.v) % (VW + 200) + VW + 200) % (VW + 200) - 100, y = Math.round(c.y - camY * 0.03);
      { const cs = cloudSprite(S.cloud, Math.round(c.w)); g.globalAlpha = cs.alpha; g.drawImage(cs, Math.round(x), y - 12); g.globalAlpha = 1; }
    }
    if (S.birds || S.bats) for (const f of sc.flocks) for (let i = 0; i < f.n; i++) {
      const x = Math.round(((f.x + Q.t * f.v - camX * 0.08 + i * 9) % (VW + 300) + VW + 300) % (VW + 300) - 150), y = Math.round(f.y + Math.abs(i - f.n / 2) * 4 + Math.sin(Q.t * 1.3 + f.ph) * 5 - camY * 0.05), up = Math.floor(Q.t * 8 + i) % 2;
      g.fillStyle = S.bats ? '#06040f' : S.birds; g.fillRect(x, y, 1, 1); g.fillRect(x - 2, y - (up ? 1 : -1), 2, 1); g.fillRect(x + 1, y - (up ? 1 : -1), 2, 1);
    }
    if (S.fish) for (const f of sc.flocks) for (let i = 0; i < f.n + 3; i++) {
      const x = Math.round(((f.x + Q.t * f.v * 1.3 - camX * 0.15 + i * 7) % (VW + 300) + VW + 300) % (VW + 300) - 150), y = Math.round(f.y + 20 + Math.sin(i * 1.7 + Q.t * 2 + f.ph) * 6 - camY * 0.05);
      g.fillStyle = 'rgba(160,220,255,.45)'; g.fillRect(x, y, 3, 1); g.fillRect(x - 1, y - (Math.floor(Q.t * 6 + i) % 2), 1, 1);
    }
  }
  const cloudCache = {};
  function cloudSprite(col, w) {
    w = Math.max(20, Math.round(w / 6) * 6); const key = col + w; if (cloudCache[key]) return cloudCache[key];
    const [c, x] = mkCanvas(w + 8, 22), r = mulberry32(w * 7), m = col.match(/[\d.]+/g), base = 'rgba(' + m[0] + ',' + m[1] + ',' + m[2] + ',', a = +m[3];
    const blob = (cx, cy, rad, st) => { x.fillStyle = st; for (let j = -rad; j <= rad; j++) { const hw = Math.round(Math.sqrt(rad * rad - j * j)); x.fillRect(cx - hw, cy + j, hw * 2 + 1, 1); } };
    const puffs = []; for (let i = 0; i < 3 + w / 18; i++) puffs.push([6 + r() * (w - 8), 12 + r() * 3 - (i % 2) * 3, 4 + r() * 5]);
    const sh = 'rgb(' + Math.round(m[0] * 0.78) + ',' + Math.round(m[1] * 0.78) + ',' + Math.round(m[2] * 0.85) + ')', mid = 'rgb(' + m[0] + ',' + m[1] + ',' + m[2] + ')', hi = 'rgb(' + Math.min(255, +m[0] + 30) + ',' + Math.min(255, +m[1] + 30) + ',' + Math.min(255, +m[2] + 30) + ')';
    for (const p of puffs) blob(Math.round(p[0]), Math.round(p[1]) + 2, Math.round(p[2]), sh);
    for (const p of puffs) blob(Math.round(p[0]), Math.round(p[1]), Math.round(p[2]), mid);
    for (const p of puffs) blob(Math.round(p[0] - 1), Math.round(p[1] - p[2] * 0.45), Math.max(1, Math.round(p[2] * 0.45)), hi);
    c.alpha = a; return (cloudCache[key] = c);
  }
  function drawProps(camX, camY) {
    if (!Q.scn) return;
    for (const p of Q.scn.props) {
      if (p.x < camX - 40 || p.x > camX + VW + 40) continue;
      const sp = propSprite(p.k), x = Math.round(p.x - camX), y = Math.round(p.y - camY);
      if (PROP_GLOW[p.k]) { const gl = g.createRadialGradient(x, y - sp.h * 0.6, 0, x, y - sp.h * 0.6, 22); gl.addColorStop(0, hexA(PROP_GLOW[p.k], 0.25 + Math.sin(Q.t * 3 + p.x) * 0.05)); gl.addColorStop(1, hexA(PROP_GLOW[p.k], 0)); g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(x - 22, y - sp.h * 0.6 - 22, 44, 44); g.globalCompositeOperation = 'source-over'; }
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x - (sp.w >> 2), y - 1, sp.w >> 1, 2);
      drawSpr(g, sp, x, y + 1, p.f);
    }
  }
  // big dark plants drifting past in front of the camera
  function drawForeground(camX, camY) {
    if (!Q.scn || Q.state === 'talk') return;
    const kind = FG_KIND[Q.B.id] || 'grass', col = Q.B.ground.dark;
    g.fillStyle = col; g.globalAlpha = 0.88;
    for (const f of Q.scn.fg) {
      const x = Math.round(f.x - camX * 1.3), base = VH + 4 - Math.max(0, (camY - 0) * 0.2); if (x < -60 || x > VW + 60) continue;
      const h = f.h, t = Q.t;
      if (kind === 'grass' || kind === 'reed' || kind === 'kelp' || kind === 'fern') {
        const n = kind === 'fern' ? 7 : 9;
        for (let i = 0; i < n; i++) { const bx = x + (i - n / 2) * 4, bh = h * (0.5 + ((i * 37 + Math.round(f.s * 10)) % 5) / 8), sw = Math.sin(t * (kind === 'kelp' ? 1.4 : 2) + i + f.s * 6) * (kind === 'kelp' ? 5 : 2.5);
          for (let k = 0; k < bh; k += 2) g.fillRect(Math.round(bx + sw * (k / bh) * (k / bh)), base - k, kind === 'kelp' ? 3 : 2, 2);
          if (kind === 'reed' && i % 3 === 0) g.fillRect(Math.round(bx + sw) - 1, base - bh - 5, 4, 7); }
      } else if (kind === 'rock' || kind === 'dune' || kind === 'snow') {
        for (let j = 0; j < h * 0.6; j++) { const hw = Math.round(Math.sqrt(Math.max(0, 1 - (j / (h * 0.6)) ** 2)) * h * 0.9); g.fillRect(x - hw, base - j, hw * 2, 1); }
        if (kind === 'snow') { g.globalAlpha = 0.55; g.fillStyle = '#e8f4ff'; g.fillRect(x - h * 0.6, base - h * 0.6 + 2, h * 1.2, 2); g.fillStyle = col; g.globalAlpha = 0.88; }
      }
    }
    g.globalAlpha = 1;
  }
  // colour mood + soft vignette
  let vignette = null;
  function drawGrade() {
    const gr = GRADE[Q.B.id];
    if (gr) { g.globalCompositeOperation = 'soft-light'; g.globalAlpha = gr[1] * 3; g.fillStyle = gr[0]; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (!vignette || vignette.width !== Math.ceil(VW)) { const [c, x] = mkCanvas(Math.ceil(VW), Math.ceil(VH)), v = x.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)'); x.fillStyle = v; x.fillRect(0, 0, VW, VH); vignette = c; }
    g.drawImage(vignette, 0, 0);
  }
  // the green wish dragon winding across the sky
  function drawWishDragon() {
    const k = Q.wishT, a = Math.min(1, k / 1.5, (9 - k) / 1.5);
    g.globalAlpha = 0.35 * a; g.fillStyle = '#05140a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = a;
    const hx = VW + 60 - (9 - k) * 70;
    for (let i = 40; i >= 0; i--) { const x = hx + i * 9, y = 70 + Math.sin(i * 0.35 + Q.t * 2) * 26, r = i === 0 ? 9 : Math.max(3, 7 - i * 0.1); disc(g, Math.round(x), Math.round(y), Math.round(r), i % 2 ? '#2a8a3a' : '#3ab04a'); if (i % 4 === 0) { g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x) - 1, Math.round(y - r), 2, 2); } }
    g.fillStyle = '#ff3a2a'; g.fillRect(Math.round(hx) - 4, 66 + Math.round(Math.sin(Q.t * 2) * 26), 2, 2); g.fillStyle = '#ffd34e'; g.fillRect(Math.round(hx) - 2, 58 + Math.round(Math.sin(Q.t * 2) * 26), 6, 2);
    g.globalAlpha = 1;
  }
  // ===================== DIVINE SUMMONS (swords, armors, pet forms): giants and beasts that fight for 7 seconds =====================
  const GIANT = {
    titan: { skin: '#8a7a5a', robe: '#5a4a34', trim: '#7ed957', eye: '#a4ffc0', head: 'crown', weapon: 'hammer', wcol: '#a8a8b8', beard: '#6a5a44', name: { en: 'Stone Titan', vi: 'Titan Đá' }, glow: '#c8a070' },
    stormgod: { skin: '#cfe8ff', robe: '#3a4a9a', trim: '#ffd34e', eye: '#ffffff', head: 'horns', weapon: 'staff', wcol: '#ffe44e', beard: '#ffffff', name: { en: 'Storm God', vi: 'Thần Bão' }, glow: '#9fe8ff' },
    seagoddess: { skin: '#a4e8f0', robe: '#1a6a8a', trim: '#ff9fd0', eye: '#ffffff', head: 'crown', weapon: 'trident', wcol: '#ffd34e', name: { en: 'Sea Goddess', vi: 'Nữ Thần Biển' }, glow: '#6ee7f2' },
    moongoddess: { skin: '#f0e8ff', robe: '#4a3a8a', trim: '#cfc0ff', eye: '#a98bff', head: 'halo', weapon: 'bow', wcol: '#e8e0ff', wings: '#cfc0ff', name: { en: 'Moon Goddess', vi: 'Nữ Thần Mặt Trăng' }, glow: '#cfc0ff' },
    frostgiant: { skin: '#9fe0f8', robe: '#2a5a9a', trim: '#ffffff', eye: '#ffffff', head: 'horns', weapon: 'hammer', wcol: '#bfefff', beard: '#ffffff', name: { en: 'Frost Giant', vi: 'Người Khổng Lồ Băng' }, glow: '#9fe8ff' },
    sunemperor: { skin: '#ffd8a0', robe: '#c0302a', trim: '#ffd34e', eye: '#ffffff', head: 'sun', weapon: 'staff', wcol: '#ffe08a', name: { en: 'Sun Emperor', vi: 'Hoàng Đế Mặt Trời' }, glow: '#ffe08a' },
    shogun: { skin: '#3a3a4a', robe: '#14121f', trim: '#c0302a', eye: '#ff3a5a', head: 'kabuto', weapon: 'katana', wcol: '#e8e8f0', name: { en: 'Shadow Shogun', vi: 'Tướng Quân Bóng Tối' }, glow: '#ff3a5a' },
    treant: { skin: '#6a4a2a', robe: '#4a3420', trim: '#7ed957', eye: '#d8ff6a', head: 'leaves', weapon: 'none', name: { en: 'Ancient Treant', vi: 'Cây Cổ Thụ' }, glow: '#a4ffc0' },
    aegis: { skin: '#ffe8b0', robe: '#c89a1c', trim: '#ffffff', eye: '#4a8bf0', head: 'helm', weapon: 'shield', wcol: '#ffd34e', name: { en: 'Golden Guardian', vi: 'Thần Hộ Vệ Vàng' }, glow: '#ffe08a' },
    valkyrie: { skin: '#ffe0c8', robe: '#a0a8c8', trim: '#ffd34e', eye: '#6ec8ff', head: 'helm', weapon: 'spear', wcol: '#cfe8ff', wings: '#ffffff', name: { en: 'Valkyrie', vi: 'Valkyrie' }, glow: '#cfe8ff' },
    angel: { skin: '#fff0e0', robe: '#ffffff', trim: '#ffd34e', eye: '#ffd34e', head: 'halo', weapon: 'sword', wcol: '#fff6c0', wings: '#ffffff', name: { en: 'Archangel', vi: 'Tổng Lãnh Thiên Thần' }, glow: '#fff6c0' },
    golems: { skin: '#8a8a9a', robe: '#5a5a6a', trim: '#7ed957', eye: '#a4ffc0', head: 'none', weapon: 'none', name: { en: 'Stone Golems', vi: 'Người Đá' }, glow: '#a8a8b8', small: true }
  };
  const BEAST = {
    phoenix: { name: { en: 'Great Phoenix', vi: 'Phượng Hoàng' }, glow: '#ff9a2a' }, dragonking: { name: { en: 'Golden Dragon Emperor', vi: 'Hoàng Đế Rồng Vàng' }, glow: '#ffd34e' },
    dragonform: { name: { en: 'Great Dragon', vi: 'Rồng Lớn' }, glow: '#ff7a2a' }, thunderkirin: { name: { en: 'Thunder Kirin', vi: 'Kỳ Lân Sấm' }, glow: '#9fe8ff' },
    skywhale: { name: { en: 'Sky Whale', vi: 'Cá Voi Trời' }, glow: '#cfe8ff' }, ninetail: { name: { en: 'Nine-Tailed Fox', vi: 'Cửu Vĩ Hồ' }, glow: '#ff9a4a' },
    clones: { name: { en: 'Shadow Copies', vi: 'Bản Sao Bóng Tối' }, glow: '#a15be0' }
  };
  const sumName = k => LN((GIANT[k] || BEAST[k]).name);
  function giantPaint(P, o, part) {
    const all = !part, body = all || part === 'body';
    if (part === 'legL') { P.rect(13, 42, 6, 13, o.robe); P.rect(12, 52, 8, 4, o.trim); return; }
    if (part === 'legR') { P.rect(22, 42, 6, 13, o.robe); P.rect(21, 52, 8, 4, o.trim); return; }
    if (body && o.wings) P.both(() => { P.tri(14, 24, 0, 6, 4, 34, o.wings); P.tri(14, 28, 2, 20, 8, 40, o.wings); });
    if (all) { P.rect(13, 42, 6, 13, o.robe); P.rect(22, 42, 6, 13, o.robe); P.rect(12, 52, 8, 4, o.trim); P.rect(21, 52, 8, 4, o.trim); }
    if (body) {
    P.rect(10, 22, 21, 22, o.robe); P.rect(10, 22, 21, 3, o.trim); P.rect(19, 25, 3, 19, o.trim); P.rect(10, 40, 21, 2, o.trim);
    P.rect(5, 23, 6, 15, o.skin); P.rect(30, 23, 6, 15, o.skin); P.rect(4, 22, 8, 4, o.trim); P.rect(29, 22, 8, 4, o.trim);
    P.ell(20, 14, 7, 8, o.skin); P.rect(15, 12, 4, 2, o.eye); P.rect(22, 12, 4, 2, o.eye);
    if (o.beard) P.tri(13, 17, 27, 17, 20, 29, o.beard); else P.rect(18, 18, 5, 1, '#14121f');
    switch (o.head) {
      case 'crown': P.rect(13, 4, 14, 3, '#ffd34e'); P.tri(13, 4, 16, 4, 14, 0, '#ffd34e'); P.tri(18, 4, 22, 4, 20, -1 + 0, '#ffd34e'); P.tri(24, 4, 27, 4, 26, 0, '#ffd34e'); P.px(20, 5, '#e0453a'); break;
      case 'horns': P.both(() => { P.tri(13, 8, 15, 6, 6, 0, '#e8e0c0'); }); break;
      case 'halo': P.ell(20, 3, 8, 2, o.trim); P.ell(20, 3, 6, 1, '#00000000'); break;
      case 'sun': for (let i = 0; i < 9; i++) { const a = Math.PI + i * Math.PI / 8; P.line(20, 12, Math.round(20 + Math.cos(a) * 13), Math.round(12 + Math.sin(a) * 13), '#ffd34e', 1); } P.ell(20, 14, 7, 8, o.skin); P.rect(15, 12, 4, 2, o.eye); P.rect(22, 12, 4, 2, o.eye); P.rect(18, 18, 5, 1, '#14121f'); break;
      case 'kabuto': P.ell(20, 9, 9, 5, '#14121f'); P.tri(12, 6, 20, 6, 10, 0, '#ffd34e'); P.tri(20, 6, 28, 6, 30, 0, '#ffd34e'); P.rect(12, 16, 16, 4, '#2a2a3a'); break;
      case 'helm': P.ell(20, 9, 8, 6, o.trim); P.rect(13, 9, 14, 3, o.trim); P.rect(19, 1, 2, 6, '#e0453a'); break;
      case 'leaves': for (let i = 0; i < 7; i++) P.ell(10 + i * 3.4 | 0, 5 + (i % 2) * 3, 4, 3, i % 2 ? '#5fcf5a' : '#2b8a3e'); break;
      case 'none': break;
    }
    }
    if (!all && part !== 'weapon') return;
    const W = o.wcol;
    switch (o.weapon) {
      case 'hammer': P.rect(36, 10, 2, 34, '#5a3a22'); P.rect(31, 4, 12, 9, W); P.rect(31, 4, 12, 2, '#ffffff'); break;
      case 'staff': P.rect(37, 6, 2, 46, '#5a3a22'); P.ell(38, 5, 4, 4, W); P.px(37, 4, '#fff'); break;
      case 'trident': P.rect(37, 8, 2, 44, W); P.rect(33, 6, 10, 2, W); P.tri(33, 6, 35, 6, 34, 0, W); P.tri(37, 6, 39, 6, 38, -1 + 0, W); P.tri(41, 6, 43, 6, 42, 0, W); break;
      case 'bow': P.poly([[37, 6], [40, 16], [40, 32], [37, 42]], W, 2); P.line(37, 6, 37, 42, '#ffffff', 1); break;
      case 'spear': P.rect(37, 2, 2, 50, '#c8c8d4'); P.tri(35, 4, 41, 4, 38, -1 + 0, W); P.tri(35, 4, 41, 4, 38, 10, W); break;
      case 'sword': P.rect(37, 4, 3, 30, W); P.rect(34, 33, 9, 2, '#ffd34e'); P.rect(37, 35, 3, 6, '#8a6a44'); break;
      case 'katana': P.line(36, 40, 43, 2, W, 2); P.rect(33, 38, 6, 2, '#c0302a'); break;
      case 'shield': P.ell(6, 30, 7, 9, W); P.ell(6, 30, 5, 7, '#ffffff'); P.ell(6, 30, 2, 3, '#4a8bf0'); break;
    }
  }
  const SUM_SPR = {}, SUM_PARTS = {};
  function summonParts(k) {
    if (SUM_PARTS[k]) return SUM_PARTS[k]; const o = GIANT[k]; if (!o) return null;
    const mk = part => paint(44, 58, P => giantPaint(P, o, part), '#14121f');
    return (SUM_PARTS[k] = { legL: mk('legL'), legR: mk('legR'), body: mk('body'), weapon: mk('weapon'), w: 44, h: 58 });
  }
  // animated giant: legs stride, body bobs and leans, the weapon swings when it attacks
  function drawGiantAnim(s, x, y, sc, a, dx) {
    const pt = summonParts(s.kind); if (!pt) return false;
    const f = s.f < 0 ? -1 : 1, mv = s.mv ? 1 : 0, ph = s.t * (mv ? 10 : 2.2), atk = s.atkT > 0 ? s.atkT / 0.35 : 0;
    const ox = -pt.w * sc / 2, oy = -pt.h * sc + sc, bob = mv ? -Math.abs(Math.sin(ph)) * 2.2 : Math.sin(ph) * -0.9, lean = (mv ? Math.sin(ph) * 0.03 : 0) + atk * 0.16;
    const lift = (side) => mv ? -Math.max(0, Math.sin(ph + side * Math.PI)) * 3.5 : 0;
    g.save(); g.globalAlpha = a; g.translate(x + (dx || 0), y); g.scale(f, 1);
    g.drawImage(pt.legL.c, ox, oy + lift(0)); g.drawImage(pt.legR.c, ox, oy + lift(1));
    g.save(); g.translate(0, bob); g.rotate(lean);
    g.drawImage(pt.body.c, ox, oy);
    const px = ox + 36 * sc, py = oy + 28 * sc, ang = Math.sin(ph * 0.7) * 0.06 + (atk > 0 ? -1.15 + (1 - atk) * 2.5 : (mv ? Math.sin(ph) * 0.12 : 0));
    g.translate(px, py); g.rotate(ang); g.drawImage(pt.weapon.c, ox - px, oy - py); g.restore();
    g.restore();
    return true;
  }
  function summonSprite(k) {
    if (SUM_SPR[k]) return SUM_SPR[k];
    const o = GIANT[k];
    if (o) return (SUM_SPR[k] = paint(44, 58, P => giantPaint(P, o), '#14121f'));
    const B = {
      phoenix: [64, 40, P => { P.both(() => { P.tri(30, 18, 0, 4, 14, 26, '#ff4a1a'); P.tri(30, 20, 4, 14, 18, 30, '#ff9a2a'); P.tri(30, 22, 10, 22, 22, 32, '#ffd34e'); }); P.ell(32, 20, 7, 6, '#ff7a2a'); P.ell(40, 14, 4, 4, '#ffb04a'); P.tri(43, 14, 43, 16, 48, 15, '#ffd34e'); P.px(41, 13, '#fff'); P.tri(26, 24, 20, 40, 32, 26, '#ff4a1a'); P.tri(32, 26, 34, 40, 38, 26, '#ffd34e'); P.tri(39, 10, 38, 4, 42, 10, '#ffd34e'); }],
      thunderkirin: [46, 34, P => { P.ell(22, 18, 13, 7, '#4ac0f0'); P.ell(22, 17, 12, 5, '#9fe8ff'); P.ell(36, 10, 6, 5, '#4ac0f0'); P.tri(37, 5, 39, -1 + 0, 40, 6, '#ffe44e'); P.px(38, 9, '#ffffff'); for (const x of [12, 18, 26, 32]) P.rect(x, 22, 3, 11, '#2a6aa0'); P.poly([[9, 15], [4, 10], [6, 6], [1, 2]], '#ffe44e', 2); P.poly([[22, 11], [20, 6], [24, 4]], '#ffe44e', 1); }],
      skywhale: [70, 34, P => { P.ell(36, 17, 26, 12, '#2a3a9a'); P.ell(36, 22, 22, 6, '#cfe8ff'); P.tri(8, 16, 0, 4, 12, 14, '#2a3a9a'); P.tri(8, 18, 0, 30, 12, 20, '#2a3a9a'); P.ell(52, 14, 2, 2, '#ffffff'); P.px(53, 14, '#14121f'); for (let i = 0; i < 9; i++) P.px(18 + i * 4, 8 + (i % 3) * 3, '#ffe08a'); P.tri(30, 26, 26, 34, 38, 27, '#2a3a9a'); }],
      ninetail: [52, 36, P => { for (let i = 0; i < 9; i++) { const a = Math.PI * (0.55 + i * 0.1); P.line(16, 20, Math.round(16 + Math.cos(a) * 16), Math.round(20 - Math.sin(a) * 18), i % 3 === 1 ? '#ffffff' : '#ff9a4a', 3); } P.ell(26, 22, 10, 7, '#ff9a4a'); P.ell(27, 25, 6, 3, '#fff0d0'); P.ell(37, 14, 6, 5, '#ff9a4a'); P.tri(33, 10, 35, 2, 37, 10, '#ff9a4a'); P.tri(38, 10, 40, 2, 42, 10, '#ff9a4a'); P.px(39, 13, '#14121f'); for (const x of [20, 26, 32]) P.rect(x, 28, 3, 7, '#d0703a'); }]
    }[k];
    if (B) return (SUM_SPR[k] = paint(B[0], B[1], B[2], '#14121f'));
    return null;
  }
  const sumHp = st => Math.round((st === 2 ? 240 : 80) * (1 + 0.15 * LDIFF(Q.li)));
  // how each summon arrives, then moves: entrance -> 1) 0.5 s freeze and head turn to lock the target -> 2) wind-up -> 3) its own gait
  // (no attacks while it walks in) -> an engage move when the target is close -> the fight
  const SUM_ENT = { clones: 'shadow', ninetail: 'shadow', shogun: 'smoke', titan: 'meteor', golems: 'meteor', frostgiant: 'meteor', stormgod: 'bolt', thunderkirin: 'bolt', valkyrie: 'bolt', moongoddess: 'beam', angel: 'beam', sunemperor: 'beam', aegis: 'beam', seagoddess: 'geyser', treant: 'roots', phoenix: 'swoop', dragonking: 'swoop', dragonform: 'swoop', skywhale: 'swoop' };
  const ENT_T = { shadow: 1.9, smoke: 1.1, meteor: 1.0, bolt: 0.9, beam: 1.5, geyser: 1.3, roots: 1.7, swoop: 1.3 };
  const SUM_GAIT = { titan: 'heavy', golems: 'heavy', frostgiant: 'heavy', treant: 'heavy', clones: 'stalk', ninetail: 'stalk', shogun: 'stalk', seagoddess: 'glide', moongoddess: 'glide', angel: 'glide', valkyrie: 'glide', stormgod: 'glide', sunemperor: 'swagger', aegis: 'swagger', thunderkirin: 'gallop' };
  const GAIT_SP = { heavy: 26, stalk: 30, glide: 38, swagger: 30, gallop: 64, soar: 52 };
  const SUM_ENG = { titan: 'leap', golems: 'leap', frostgiant: 'leap', treant: 'leap', valkyrie: 'leap', stormgod: 'tele', moongoddess: 'tele', angel: 'tele', sunemperor: 'tele', seagoddess: 'tele', clones: 'shadow', ninetail: 'shadow', shogun: 'shadow', thunderkirin: 'dash', aegis: 'dash', phoenix: 'dive', dragonking: 'dive', dragonform: 'dive', skywhale: 'dive' };
  const SUM_EVO = { clones: 14, ninetail: 14, shogun: 15, titan: 18, golems: 16, frostgiant: 18, treant: 18, stormgod: 15, thunderkirin: 14, valkyrie: 15, moongoddess: 16, angel: 16, sunemperor: 18, aegis: 16, seagoddess: 16, phoenix: 15, dragonking: 17, dragonform: 15, skywhale: 16 };
  function spawnSummon(kind, life, owner, evo, from) {
    const o = owner || Q.P, G = Q.G; if (!G.sums) G.sums = [];
    const B = Q.boss, tg = B && Q.arenaSealed && !B.dead && !B.hide ? B : nearestFoe(o.x + 4, o.y, 600), dir = tg ? (tg.x + tg.w / 2 < o.x + 4 ? -1 : 1) : o.face;
    const ent = SUM_ENT[kind] || 'beam', fly = !!SUM_FLY[kind], glow = (GIANT[kind] || BEAST[kind]).glow;
    let x = from ? from.x : (ent === 'shadow' ? o.x + 4 : o.x + 4 + dir * (ent === 'meteor' ? 74 : 56));
    { const n = G.sums.filter(q => q.life > 0 && !q.dying).length; if (n && !from) x += (n % 2 ? -1 : 1) * 40 * Math.ceil(n / 2); }   // several summons do not stand on top of each other
    if (Q.arenaSealed) x = arenaClamp(x);
    const sp0 = from ? { x, y: sumProbe(x, from.y - 18, 8) ?? sumSpawnPoint(o, x).y } : sumSpawnPoint(o, x); x = sp0.x;
    const gy = sp0.y, y = fly ? gy - 60 : gy, L = (life || 7) + (ENT_T[ent] || 1) + 1.6;
    const sm = { evo: !!evo, stage: 1, hp: sumHp(1), hpMax: sumHp(1), inv: 9, kind, life: L, max: L, t: 0, x, y, f: dir, cd: 0.6, n: 0, owner: o, ph: 'enter', pt: 0, ent, ex: x, ey: y, fromPet: !!from };
    if (ent === 'swoop') { sm.x = sm.sx0 = x - dir * 220; sm.y = sm.sy0 = y - 120; }
    G.sums.push(sm);
    Snd.play('relic'); if (ent === 'shadow') { addRing(o.x + 4, o.y + o.h, '#5a2a8a', 40, 0.6); } else { G.flash = Math.max(G.flash || 0, 0.12); }
    pop(o.x + 4, o.y - 26, sumName(kind) + '!', glow);
  }
  function sumIntro(s, o, dt) {
    s.pt += dt; const k = s.pt, H = SUM_H[s.kind] || 50, glow = (GIANT[s.kind] || BEAST[s.kind]).glow, tg = sumTarget(s), fly = !!SUM_FLY[s.kind];
    s.ax = s.ay = s.arot = s.sink = 0; s.asx = s.asy = s.aal = 1; s.mv = 0; s.atkT = 0; s.look = 0;
    const once = (key, fn) => { if (!s['_' + key]) { s['_' + key] = 1; fn(); } };
    const dmg = n => Math.round((n + baseDmg()) * 1.5);
    if (s.ph === 'enter') {
      const T = ENT_T[s.ent] || 1, u = clamp(k / T, 0, 1);
      switch (s.ent) {
        case 'shadow':   // rises out of the hero's shadow: crouched, one hand on the ground, then the head comes up and it stands
          s.sink = (1 - ez(seg(u, 0.12, 0.62))) * H; s.asy = u < 0.72 ? 0.66 : 0.66 + 0.34 * ez(seg(u, 0.72, 1)); s.arot = s.f * 0.35 * (1 - ez(seg(u, 0.5, 1))); s.look = u > 0.5 ? 1 : 0;
          once('a', () => Snd.play('poof')); if (Math.random() < 0.6) emit(s.x + rr(-16, 16), s.y, 1, { col: ['#5a2a8a', '#14121f', '#a15be0'], sp0: 4, sp1: 20, grav: -40, l0: 0.4, l1: 0.8 }); break;
        case 'smoke':
          once('a', () => { Snd.play('poof'); emit(s.x, s.y - 20, 40, { col: ['#3a3a4a', '#6a6a7a', '#14121f'], sp0: 20, sp1: 90, grav: -20, l0: 0.5, l1: 1 }); });
          s.asy = u < 0.6 ? 0.7 : 0.7 + 0.3 * ez(seg(u, 0.6, 1)); s.aal = ez(seg(u, 0, 0.35)); break;
        case 'meteor': {   // crashes down from the sky
          const f = clamp(k / 0.75, 0, 1);
          if (f < 1) { s.ay = -(1 - f * f) * 260; s.arot = (1 - f) * 0.4 * s.f; emit(s.x + rr(-8, 8), s.y + s.ay - H * 0.5, 2, { col: ['#ff7a2a', '#ffd34e', '#8a6a44'], sp0: 10, sp1: 40, grav: -30, l0: 0.2, l1: 0.5 }); }
          else {
            once('land', () => { Q.shake = Math.max(Q.shake, 0.9); Snd.play('boom'); Snd.play('explode'); addRing(s.x, s.y, glow, 140, 0.6); for (let i = -6; i <= 6; i++) emit(s.x + i * 12, s.y, 3, { col: ['#8a6a44', '#c8a070', '#fff'], sp0: 20, sp1: 90, vy: -90 }); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - s.x) < 70 && Math.abs(e.y + e.h - s.y) < 40) dmgFoe(e, dmg(6), true, true); });
            const l = seg(k, 0.75, 1); s.asy = 1 - 0.3 * Math.sin(l * Math.PI); s.asx = 1 + 0.2 * Math.sin(l * Math.PI);
          }
          break; }
        case 'bolt':
          once('a', () => { Snd.play('thunder'); Q.G.flash = Math.max(Q.G.flash || 0, 0.25); zap(s.x, Q.cam.y - 6, s.x, s.y); Q.shake = Math.max(Q.shake, 0.4); });
          s.aal = ez(seg(u, 0.3, 0.55)); if (k > 0.3 && Math.random() < 0.6) emit(s.x + rr(-16, 16), s.y - rr(0, H), 1, { col: ['#ffe44e', '#9fe8ff', '#fff'], sp0: 10, sp1: 50, l0: 0.15, l1: 0.3 }); break;
        case 'beam': s.ay = -(1 - ez(u)) * 140; s.aal = ez(seg(u, 0, 0.4)); once('a', () => Snd.play('chime')); break;
        case 'geyser':
          s.ay = -Math.sin(u * Math.PI) * 30; s.sink = (1 - ez(seg(u, 0, 0.45))) * H; once('a', () => Snd.play('splash'));
          emit(s.x + rr(-10, 10), s.y, 2, { col: ['#6ee7f2', '#bfeaff', '#fff'], sp0: 20, sp1: 80, vy: -160, grav: 300, l0: 0.4, l1: 0.8 }); break;
        case 'roots':
          s.sink = (1 - ez(seg(u, 0.1, 0.9))) * H; once('a', () => Snd.play('rumble')); Q.shake = Math.max(Q.shake, 0.08);
          if (Math.random() < 0.6) emit(s.x + rr(-20, 20), s.y, 1, { col: ['#5fcf5a', '#8a6a44', '#2b8a3e'], sp0: 10, sp1: 40, vy: -40, l0: 0.4, l1: 0.8 }); break;
        case 'swoop': { const e2 = ez(u); s.x = s.sx0 + (s.ex - s.sx0) * e2; s.y = s.sy0 + (s.ey - s.sy0) * e2 - Math.sin(u * Math.PI) * 30; s.mv = 1; s.arot = (1 - u) * 0.25 * s.f; once('a', () => Snd.play('whoosh')); break; }
      }
      if (k >= T) { s.ph = 'aware'; s.pt = 0; s.inv = 0.4; }
      return;
    }
    if (s.ph === 'aware') {   // 1) stand still, then turn the head and lock the target
      if (k > 0.25 && tg) s.f = tg.x + tg.w / 2 < s.x ? -1 : 1;
      s.look = k > 0.25 ? 1 : 0; if (fly) s.ay = Math.sin(s.t * 2) * 3;
      if (k >= 0.5) { s.ph = 'ready'; s.pt = 0; }
      return;
    }
    if (s.ph === 'ready') {   // 2) gather strength: dip, rise, roll the shoulders
      const u = k / 0.6; s.asy = 1 - 0.1 * Math.sin(Math.min(1, u / 0.5) * Math.PI) + 0.06 * Math.sin(seg(u, 0.5, 1) * Math.PI); s.asx = 2 - s.asy; s.look = 1;
      if (fly) s.ay = -6 * Math.sin(u * Math.PI);
      once('r', () => { if (SUM_GAIT[s.kind] === 'heavy') Snd.play('rumble'); });
      if (k >= 0.6) { s.ph = 'march'; s.pt = 0; }
      return;
    }
    if (s.ph === 'march') {   // 3) walk in like a person would, each in its own way; no attacks yet
      const gait = fly ? 'soar' : (SUM_GAIT[s.kind] || 'heavy'), eg = SUM_ENG[s.kind] || 'dash', ENR = eg === 'tele' ? 220 : eg === 'dive' ? 200 : eg === 'leap' ? 170 : 140;
      let sp = GAIT_SP[gait]; const dx = tg ? tg.x + tg.w / 2 - s.x : 0, ad = Math.abs(dx); if (tg) s.f = dx < 0 ? -1 : 1;
      if (gait === 'heavy') { const n = Math.floor(k * 2.2); if (n !== s.stepN) { s.stepN = n; Q.shake = Math.max(Q.shake, 0.22); Snd.play('bstep'); emit(s.x, s.y, 6, { col: ['#8a7a6a', '#cfd6e6'], sp0: 10, sp1: 40, vy: -20, l0: 0.2, l1: 0.4 }); } const ph = Math.abs(Math.sin(k * 2.2 * Math.PI)); sp *= 0.5 + 0.5 * ph; s.ay = -ph * 1.5; s.asy = 1 - 0.03 * ph; }
      else if (gait === 'stalk') { s.arot = s.f * 0.16; sp *= 0.3 + 0.7 * Math.abs(Math.sin(k * 2.4)); s.ax = Math.sin(k * 1.7) * 6; s.ay = -Math.abs(Math.sin(k * 4.8)) * 1.2; if (Math.random() < 0.5) emit(s.x - s.f * 12, s.y - 1, 1, { col: ['#a15be0', '#ffd34e', '#5a2a8a'], sp0: 5, sp1: 30, vy: -10, grav: 60, l0: 0.2, l1: 0.5 }); }
      else if (gait === 'glide') { s.arot = s.f * 0.06; }   // smooth, but the feet stay on the ground
      else if (gait === 'swagger') { s.arot = Math.sin(k * 4) * 0.09; s.ay = -Math.abs(Math.sin(k * 4)) * 1.5; }
      else if (gait === 'soar') { s.ay = Math.sin(k * 2) * 4; }
      const onG = fly || sumPhys(s, dt);   // a walker in the air does nothing until it lands
      const go = d2 => { if (fly) { s.x += d2; return true; } return sumStepX(s, d2); };
      if (!onG) { s.ax = s.ay = 0; }
      else if (!tg) { if (k < 5 && go(s.f * sp * 0.5 * dt)) s.mv = 1; }
      else if (ad > ENR) { if (go(s.f * Math.min(sp * dt, ad - ENR))) s.mv = 1; else if (!fly && ad < ENR * 2.2) { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; } if (fly) s.y += clamp(tg.y - 60 - s.y, -40 * dt, 40 * dt); }
      else { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; }
      if (Q.arenaSealed) s.x = arenaClamp(s.x);
      return;
    }
    if (s.ph === 'engage') {   // the opening strike
      const t2 = s.tg && !s.tg.dead ? s.tg : tg; if (!t2) { s.ph = 'fight'; return; }
      const tx = t2.x + t2.w / 2;
      if (s.eg === 'leap') {   // jumps high and slams down
        const u = clamp(k / 0.9, 0, 1); s.x = s.ex0 + (tx - s.f * 18 - s.ex0) * ez(u); s.ay = -Math.sin(u * Math.PI) * 110; s.asy = u < 0.15 ? 0.85 : 1.08; s.asx = 2 - s.asy; s.arot = s.f * (u - 0.5) * 0.5;
        once('j', () => Snd.play('jump'));
        if (u >= 1) { once('land', () => { const gy = sumProbe(s.x, Math.min(s.y, t2.y + t2.h) - 30); if (gy !== null) s.y = gy; s.vy = 0; }); once('slam', () => { Q.shake = Math.max(Q.shake, 0.8); Snd.play('boom'); addRing(s.x, s.y, glow, 120, 0.5); for (let i = -5; i <= 5; i++) emit(s.x + i * 12, s.y, 3, { col: ['#8a6a44', '#c8a070', '#fff'], sp0: 20, sp1: 80, vy: -80 }); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - s.x) < 80 && Math.abs(e.y + e.h - s.y) < 70) { dmgFoe(e, dmg(8), true, true); if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 1); } }); s.ph = 'fight'; }
      } else if (s.eg === 'tele') {   // vanishes, reappears in the sky above the target and casts from there
        if (k < 0.3) { s.aal = 1 - k / 0.3; once('v', () => { Snd.play('zap'); emit(s.x, s.y - H / 2, 20, { col: [glow, '#fff'], sp0: 20, sp1: 90 }); }); }
        else { once('p', () => { const sp = sumSpawnPoint({ x: tx - 4, y: t2.y + t2.h - 14, h: 14, face: s.f }, tx - s.f * 40); s.x = sp.x; s.y = sp.y; s.vy = 0; emit(s.x, s.y - H / 2, 26, { col: [glow, '#fff'], sp0: 20, sp1: 120 }); addRing(s.x, s.y - H / 2, glow, 90, 0.4); Snd.play('chime'); }); s.aal = ez(seg(k, 0.3, 0.6)); }
        if (k >= 0.8) { s.ph = 'fight'; s.cd = 0; }
      } else if (s.eg === 'shadow') {   // sinks into its shadow, slides under the target and bursts out behind it
        if (k < 0.3) s.sink = ez(k / 0.3) * H;
        else if (k < 0.6) { s.sink = H; const nx = s.ex0 + (tx + s.f * 26 - s.ex0) * ez((k - 0.3) / 0.3), gy = sumProbe(nx, t2.y + t2.h - 18, 4); if (gy !== null) { s.x = nx; s.y = gy; } if (Math.random() < 0.7) emit(s.x + rr(-10, 10), s.y, 1, { col: ['#5a2a8a', '#14121f'], sp0: 4, sp1: 16, grav: -30, l0: 0.3, l1: 0.6 }); }
        else { once('b', () => { s.f = tx < s.x ? -1 : 1; Snd.play('slash'); dmgFoe(t2, dmg(12), true, true); emit(tx, t2.y + t2.h / 2, 18, { col: ['#a15be0', '#fff', '#14121f'], sp0: 30, sp1: 140 }); Q.shake = Math.max(Q.shake, 0.4); }); s.sink = (1 - ez(seg(k, 0.6, 0.8))) * H; s.atkT = 0.35; }
        if (k >= 1) s.ph = 'fight';
      } else if (s.eg === 'dash') {   // a sudden, very fast dash
        const u = clamp(k / 0.35, 0, 1), nx = s.ex0 + (tx - s.f * 22 - s.ex0) * ez(u); sumStepX(s, nx - s.x); s.mv = 1; s.arot = s.f * 0.15;
        emit(s.x - s.f * 10, s.y - H / 2, 2, { col: [glow, '#fff'], sp0: 5, sp1: 20, l0: 0.15, l1: 0.3 });
        if (u >= 1) { once('h', () => { dmgFoe(t2, dmg(8), true, true); Snd.play('slash'); Q.shake = Math.max(Q.shake, 0.3); }); s.ph = 'fight'; }
      } else {   // flyers: climb, then dive
        const u = clamp(k / 0.9, 0, 1); s.mv = 1;
        if (u < 0.4) s.y = s.ey0 - ez(u / 0.4) * 50; else { const v = (u - 0.4) / 0.6; s.x = s.ex0 + (tx - s.ex0) * ez(v); s.y = (s.ey0 - 50) + (t2.y - (s.ey0 - 50)) * v * v; s.arot = s.f * 0.5; }
        if (u >= 1) { once('h', () => { dmgFoe(t2, dmg(8), true, true); Snd.play('explode'); addRing(tx, t2.y, glow, 90, 0.4); }); s.ph = 'fight'; s.y = t2.y - 60; }
      }
      if (Q.arenaSealed && !SUM_FLY[s.kind]) s.x = arenaClamp(s.x);
    }
  }
  // summons fight on their own: they walk (or fly) to the nearest enemy and attack it; with no enemy they idle near their owner
  const SUM_WALK = { aegis: [95, 45], titan: [55, 70], frostgiant: [60, 90], shogun: [110, 60], treant: [45, 70], golems: [75, 30], thunderkirin: [130, 80], clones: [140, 40], stormgod: [60, 200], seagoddess: [70, 170], moongoddess: [60, 220], valkyrie: [100, 180], sunemperor: [50, 200], angel: [70, 180], ninetail: [95, 110] };
  // what a summon fights: the boss while its fight is on, otherwise the nearest monster in this part of the map
  // seek & destroy: no link to the hero; the summon locks the boss, else the nearest elite, else the nearest monster on the map
  function sumTarget(s) {
    const b = Q.boss; if (b && !b.dead && Q.arenaSealed && b.st !== 'intro' && b.st !== 'sleep' && !b.hide) return (s.tg = b);
    const fs = foes(); if (s.tg && !s.tg.dead && !s.tg.hid && fs.includes(s.tg)) return s.tg;   // keep the lock until it dies
    let best = null, bd = 900;   // about two screens around the summon
    for (const e of fs) { const d = Math.hypot(e.x + e.w / 2 - s.x, e.y + e.h / 2 - (s.y - 20)) * (isBig(e) ? 0.5 : 1); if (d < bd) { bd = d; best = e; } }
    return (s.tg = best);
  }
  // ---- ground physics for walking summons ----
  // groundBelow: a downward probe ("raycast") from just above the feet; returns the y of the first floor top, or null over a pit
  function sumProbe(x, yRef, maxTiles) {
    const tx = Math.floor(x / TS), H = Q.L.H, st = clamp(Math.floor((yRef - 6) / TS), 0, H - 1), end = Math.min(H, st + (maxTiles || 40));
    if (solid(tx, st) && solid(tx, st - 1)) return null;   // the probe starts inside a wall
    for (let ty = Math.max(1, st); ty < end; ty++) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    return null;
  }
  // one step on X: allowed onto flat ground, a 1-tile step up or a drop of up to 3 tiles; a wall or a pit stops the summon
  function sumStepX(s, dx) {
    if (!dx) return true; const nx = s.x + dx, probe = sumProbe(nx + Math.sign(dx) * 6, s.y - 18, 5);
    if (probe === null || probe < s.y - 18 || probe > s.y + 3 * TS) return false;
    s.x = nx; return true;
  }
  // gravity: Y only ever changes by falling (with acceleration) or by climbing a small step; returns true when standing on the ground
  function sumPhys(s, dt) {
    const gy = sumProbe(s.x, s.y - 18);
    if (gy === null) { s.vy = Math.min(600, (s.vy || 0) + 1100 * dt); s.y += s.vy * dt; s.grounded = false; if (s.y > (Q.L.H + 2) * TS) sumRejoin(s, s.owner || Q.P, true); return false; }
    if (s.y < gy - 0.5) { s.vy = Math.min(600, (s.vy || 0) + 1100 * dt); s.y = Math.min(gy, s.y + s.vy * dt); }
    if (s.y >= gy - 0.5) { s.y = gy; s.vy = 0; s.grounded = true; } else s.grounded = false;
    return s.grounded;
  }
  // a safe ground point next to the hero: try the spot in front, else the hero's own spot
  function sumSpawnPoint(o, wantX) {
    const feet = o.y + o.h, own = sumProbe(o.x + 4, feet - 2) ?? feet;
    for (const x of [wantX, (wantX + o.x + 4) / 2, o.x + 4]) { const gy = sumProbe(x, own - 18, 6); if (gy !== null && Math.abs(gy - own) <= 18) return { x, y: gy }; }
    return { x: o.x + 4, y: own };
  }
  // the floor under a walking summon (searches from its feet, so it never walks on a cave ceiling or a hill far above)
  function sumGround(x, yRef) {
    const tx = Math.floor(x / TS), H = Q.L.H, st = clamp(Math.floor((yRef - 24) / TS), 1, H - 1);
    for (let ty = st; ty < H; ty++) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    for (let ty = st - 1; ty > 0; ty--) if (solid(tx, ty) && !solid(tx, ty - 1)) return ty * TS;
    return yRef;
  }
  // a summon left far behind (the hero was pulled into a boss arena, took a portal, respawned...) appears next to the hero again
  function sumRejoin(s, o, force) {
    const ar = Q.L.arena, out = force || (Q.arenaSealed && ar && (s.x < (ar.x0 + 2) * TS || s.x > ar.x1 * TS));
    if (!out) return;
    emit(s.x, s.y - 20, 18, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 90 });
    if (SUM_FLY[s.kind]) { s.x = o.x + 4 - o.face * 26; s.y = o.y - 46; } else { const sp = sumSpawnPoint(o, o.x + 4 - o.face * 26); s.x = sp.x; s.y = sp.y; s.vy = 0; }
    emit(s.x, s.y - 20, 24, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 110 }); Snd.play('poof');
  }
  const SUM_SPD = v => clamp(v * 0.6, 38, 70);   // slow and heavy on purpose
  // fly toward a point at a slow, steady speed
  function sumGlide(s, tx, ty, dt) { const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy), st = Math.min(d, 75 * dt); if (d > 0.5) { s.x += dx / d * st; s.y += dy / d * st; } s.mv = d > 6 ? 1 : 0; }
  const SUM_FLY = { phoenix: 1, dragonking: 1, dragonform: 1, skywhale: 1 };   // these fly, every other summon walks on the ground
  // summons never trail behind the hero: they march on the target, or scout ahead of the hero when no monster is around
  function sumWalk(s, o, dt) {
    const w = SUM_WALK[s.kind] || [90, 50], t = sumTarget(s), sp = SUM_SPD(w[0]); s.mv = 0;
    if (sumPhys(s, dt) && t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1] && sumStepX(s, s.f * Math.min(sp * dt, ad - w[1]))) s.mv = 1; }
    if (Q.arenaSealed) s.x = arenaClamp(s.x);
  }
  function evolveSummon(s) {
    s.stage = 2; s.life = 30; s.max = 30; s.hpMax = s.hp = sumHp(2); s.inv = 99; s.atkT = 0.5; s.cd = 0.3; s.mv = 0; s.ultT = 1.1; s.ultN = 3;
    const info = GIANT[s.kind] || BEAST[s.kind], x = s.x, y = s.y;
    Snd.play('relic'); Snd.play('boom'); Q.shake = Math.max(Q.shake, 0.6); Q.G.flash = Math.max(Q.G.flash || 0, 0.3);
    addRing(x, y - 30, info.glow, 150, 0.8); addRing(x, y - 30, '#fff', 90, 0.5); emit(x, y - 30, 60, { col: [info.glow, '#fff', '#ffd34e'], sp0: 40, sp1: 200 });
    pop(x, y - 90, sv('FINAL FORM: ' + LN(info.name) + ' (Ancient)!', 'TIẾN HÓA: ' + LN(info.name) + ' Cổ Đại!'), '#ffd34e');
    Q.msg = sv('Your summon evolves into its final form!', 'Triệu hồi của bạn đã tiến hóa lên cấp cuối!'); Q.msgT = 3.5;
  }
  // the Ancient form's ultimate: three waves that hit every enemy on screen, themed per summon
  const SUM_ULT = { phoenix: 'fire', dragonking: 'fire', dragonform: 'fire', sunemperor: 'fire', ninetail: 'fire', frostgiant: 'ice', seagoddess: 'ice', skywhale: 'ice', stormgod: 'storm', thunderkirin: 'storm', valkyrie: 'storm' };
  const ULT_NAME = { fire: ['FIRESTORM!', 'BÃO LỬA!'], ice: ['BLIZZARD!', 'BÃO BĂNG!'], storm: ['THUNDERSTORM!', 'BÃO SẤM!'], star: ['METEOR STORM!', 'BÃO SAO BĂNG!'] };
  function sumDissolve(s, d) { s.dying = s.dieMax = d; s.life = Math.max(s.life, d + 0.2); s.mv = 0; s.inv = 99; Snd.play('poof'); emit(s.x, s.y - 30, 30, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 20, sp1: 120, grav: -40 }); }
  function sumUltTick(s, o, dt) {
    s.mv = 0; s.ultT -= dt; const th = SUM_ULT[s.kind] || 'star';
    if (s.ultT > 0) { if (s.ultN === 3 && Math.random() < 0.7) emit(s.x + rr(-40, 40), s.y - rr(0, 90), 1, { col: ['#ffd34e', '#ffffff'], sp0: 10, sp1: 40, grav: -80, l0: 0.3, l1: 0.6 }); return; }
    if (s.ultN <= 0) { pop(s.x, s.y - 80, sv('Fades away...', 'Tan biến...'), '#cfe8ff'); sumDissolve(s, 1.3); return; }
    if (s.ultN === 3) { pop(s.x, s.y - 100, sv(ULT_NAME[th][0], ULT_NAME[th][1]), '#ffd34e'); Snd.play('relic'); }
    s.ultN--; s.ultT = s.ultN > 0 ? 0.6 : 0.9; s.atkT = 0.35;
    const cx = Q.cam.x, cy = Q.cam.y, dmg = Math.round((10 + baseDmg()) * 1.8), G = Q.G;
    Q.shake = Math.max(Q.shake, 0.7); G.flash = Math.max(G.flash || 0, 0.22); Snd.play(th === 'storm' ? 'thunder' : 'explode');
    addRing(s.x, s.y - 30, th === 'ice' ? '#bfefff' : th === 'storm' ? '#9fe8ff' : '#ffd34e', 260, 0.7);
    const col = { fire: ['#ff7a2a', '#ffd34e'], ice: ['#bfefff', '#ffffff'], storm: ['#9fe8ff', '#ffe44e'], star: ['#ffe08a', '#cfe8ff'] }[th];
    for (let i = 0; i < 12; i++) { const x = cx + (i + Math.random()) * VW / 12; shootG({ x, y: cy - 10, vx: th === 'ice' ? 0 : rr(-60, 60), vy: 520, life: 1.1, dmg: 1, expl: th === 'ice' ? 0 : 22, shape: th === 'fire' ? 'fire' : th === 'ice' ? 'ice' : 'meteor', sz: 5, col: col[0], trail: col[1], quiet: true }); }
    for (const e of foes()) {
      if (e.x + e.w < cx - 20 || e.x > cx + VW + 20 || e.y + e.h < cy - 40 || e.y > cy + VH + 40) continue;   // only what is on screen
      if (th === 'storm') zap(e.x + e.w / 2, cy - 6, e.x + e.w / 2, e.y + e.h / 2);
      dmgFoe(e, dmg, true, true); emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: [col[0], '#fff'], sp0: 30, sp1: 140 });
      if (th === 'ice') e.slowT = Math.max(e.slowT || 0, 3); if (th === 'fire') e.burnT = Math.max(e.burnT || 0, 3);
      if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 0.8);
    }
  }
  // ===== skills 1-4: landing hits charges what you wear; a full slot unleashes its power =====
  // 1 = weapon slot 1, 2 = weapon slot 2 (sword, gun or other weapon), 3 = armor, 4 = pet
  function slotId(i) { const v = save.inv; if (i < 3 && Q && isFan(Q.P)) return null; return i === 0 ? v.w[0] : i === 1 ? v.w[1] : i === 2 ? v.armor : v.pet; }
  const SK_SLOT = [['weapon 1', 'vũ khí 1'], ['weapon 2', 'vũ khí 2'], ['armor', 'giáp'], ['pet', 'pet']];
  function skNeed(it) { return it.st.summon || it.st.form ? 22 : it.type === 'armor' ? 16 : it.type === 'pet' ? 14 : 12; }
  function skName(it) {
    if (it.st.summon) return sv('Summon ', 'Triệu hồi ') + sumName(it.st.summon);
    if (it.st.form) return sv('Transform: ', 'Biến hình: ') + sumName(it.st.form);
    return LN({ sword: { en: 'Blade Wave', vi: 'Kiếm Khí' }, gun: { en: 'Bullet Storm', vi: 'Bão Đạn' }, armor: { en: 'Divine Shield', vi: 'Khiên Thần' }, pet: { en: 'Healing Bond', vi: 'Hồi Máu Đồng Hành' } }[it.type] || { en: 'Shockwave', vi: 'Sóng Chấn' });
  }
  const isMe = P => !coop || P === Q.me;
  function skIsReady(i) { const id = slotId(i), it = id && ITEM[id]; return !!it && ((Q.P.chg || [])[i] || 0) >= skNeed(it); }
  function chargeHit(p) {
    if (p && p !== Q.P && p.isPlayer) return asP(p, () => chargeHit());
    const P = Q.P; if (!P || !P.isPlayer) return; P.chg = P.chg || [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const id = slotId(i), it = id && ITEM[id]; if (!it) continue; const nd = skNeed(it); if (P.chg[i] >= nd) continue;
      P.chg[i] = Math.min(nd, P.chg[i] + 1);
      if (P.chg[i] >= nd && isMe(P)) { Q.msg = '[' + (i + 1) + '] ' + LN(it.name) + sv(' is charged! Press ' + (i + 1) + ': ', ' đã tích đầy! Nhấn ' + (i + 1) + ' để dùng: ') + skName(it); Q.msgT = 3.4; Snd.play('relic'); pop(P.x + 4, P.y - 18, '[' + (i + 1) + '] ' + sv('READY!', 'SẴN SÀNG!'), RARITY_COL[it.rar] || '#ffd34e'); }
    }
  }
  function useSk(i) {
    const P = Q.P, id = slotId(i), it = id && ITEM[id]; P.chg = P.chg || [0, 0, 0, 0];
    if (!it) { if (isMe(P)) { Q.msg = isFan(P) && i < 3 ? sv('This hero fights with their own moves: no weapon or armor (R is the special).', 'Nhân vật này đánh bằng chiêu riêng, không dùng vũ khí/giáp (R là skill riêng).') : sv('Nothing equipped in slot ' + (i + 1) + ' (' + SK_SLOT[i][0] + ')', 'Chưa trang bị gì ở ô ' + (i + 1) + ' (' + SK_SLOT[i][1] + ')'); Q.msgT = 2; Snd.play('select'); } return; }
    const nd = skNeed(it);
    if (P.chg[i] < nd) { if (isMe(P)) { Q.msg = '[' + (i + 1) + '] ' + LN(it.name) + ': ' + P.chg[i] + '/' + nd + sv(' - land hits to charge it', ' - đánh trúng quái để tích nội tại'); Q.msgT = 2; Snd.play('select'); } return; }
    if (it.st.form && Q.G.morph) return;
    P.chg[i] = 0; const x = P.x + 4, y = P.y + 7, f = P.face, col = RARITY_COL[it.rar] || '#ffd34e', st = it.st;
    pop(x, P.y - 22, skName(it) + '!', col); addRing(x, y, col, 70, 0.5); Q.shake = Math.max(Q.shake, 0.3);
    if (st.summon) { spawnSummon(st.summon, 30, P, true); return; }
    if (st.form) { petMorph(P, st.form); return; }
    const d = baseDmg() + (st.dmg || 0) + 2;
    if (it.type === 'sword') { Snd.play('slash'); for (let k = -1; k <= 1; k++) shootG({ x: x + f * 8, y: y + k * 7, vx: f * 300, vy: k * 18, life: 0.9, dmg: d * 2, thru: true, pierceN: 99, shape: 'wind', col, sz: 10, f, skill: true }); }
    else if (it.type === 'gun') { Snd.play('explode'); for (let k = 0; k < 11; k++) { const a = (k - 5) * 0.07; shootG({ x: x + f * 8, y, vx: Math.cos(a) * f * 380, vy: Math.sin(a) * 380, life: 0.8, dmg: d, pierceN: 2, shape: 'bolt', col, sz: 3, f, skill: true }); } }
    else if (it.type === 'armor') { P.shield = true; P.inv = Math.max(P.inv, 1); nova(x, y, 80, d * 2); Snd.play('relic'); emit(x, y, 30, { col: [col, '#fff'], sp0: 30, sp1: 140 }); }
    else if (it.type === 'pet') { P.hp = Math.min(maxHP(), P.hp + 2); Snd.play('heart'); emit(x, y, 24, { col: ['#ff7fb0', '#fff', col], sp0: 20, sp1: 90 }); }
    else { nova(x, y, 90, d * 2); Snd.play('boom'); }
  }
  // the four skill slots, bottom centre: icon, charge filling up, a glowing frame when ready
  function drawRBadge(P, bx, by) {
    const h = P.hero && HERO[P.hero]; if (!h) return;
    const cd = Math.max(0, P.skCd || 0), full = (P.form === 'sin' && h.sk.k === 'reapdash') ? 2.5 : h.sk.cd, k = 1 - Math.min(1, cd / full), ready = cd <= 0, col = h.sk.col || '#ffd34e', S = 26, cx = bx + S / 2, cy = by + S / 2;
    g.fillStyle = 'rgba(20,18,31,.9)'; g.fillRect(bx, by, S, S);
    g.fillStyle = hexA(col, ready ? 0.55 : 0.3); g.fillRect(bx + 1, by + 1, S - 2, S - 2);
    if (!ready) {   // the part still recharging is dark, swept away clockwise like a clock
      g.save(); g.beginPath(); g.rect(bx + 1, by + 1, S - 2, S - 2); g.clip();
      g.fillStyle = 'rgba(8,6,18,.78)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, S, -Math.PI / 2 + k * Math.PI * 2, Math.PI * 1.5); g.closePath(); g.fill(); g.restore();
      txt(cd < 1 ? cd.toFixed(1) : String(Math.ceil(cd)), cx, cy + 1, { al: 'center', size: 10, bold: true, col: '#ffffff', ol: '#14121f' });
    } else {
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 + 0.2 * Math.sin(Q.t * 7); g.fillStyle = col; g.fillRect(bx - 3, by - 3, S + 6, S + 6); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      txt('R', cx, cy + 1, { al: 'center', size: 12, bold: true, col: '#ffffff', ol: '#14121f', glow: hexA(col, 0.9) });
    }
    g.globalAlpha = ready ? 0.7 + 0.3 * Math.sin(Q.t * 7) : 0.7; g.fillStyle = ready ? col : '#6a6f8a'; g.fillRect(bx, by, S, 1); g.fillRect(bx, by + S - 1, S, 1); g.fillRect(bx, by, 1, S); g.fillRect(bx + S - 1, by, 1, S); g.globalAlpha = 1;
    if (!ready) txt('R', bx + 4, by + 5, { size: 6, bold: true, col: '#cfd6e6', ol: '#14121f' });
    txt(fitTxt(LN(h.sk.n), 16), cx, by - 5, { al: 'center', size: 5, col: ready ? col : '#9a9ab0', ol: '#14121f' });
  }
  function drawSkBadges() {
    const P = Q.P, ch = P.chg || [0, 0, 0, 0], x0 = Math.round(VW / 2 - 51), y0 = VH - 31;
    drawRBadge(P, x0 + 4 * 26 + 6, y0 - 2);
    if (!isFan(P) && eqIt(0) && eqIt(1)) txt(sv('T: swap', 'T: đổi'), x0 + 26, y0 - 6, { al: 'center', size: 5, col: '#ffd34e', ol: '#14121f' });
    for (let i = 0; i < 4; i++) {
      const id = slotId(i), it = id && ITEM[id], bx = x0 + i * 26, by = y0;
      g.fillStyle = 'rgba(20,18,31,.85)'; g.fillRect(bx, by, 24, 24);
      if (!it) { g.fillStyle = '#434d6e'; g.fillRect(bx, by, 24, 1); g.fillRect(bx, by + 23, 24, 1); g.fillRect(bx, by, 1, 24); g.fillRect(bx + 23, by, 1, 24); txt(String(i + 1), bx + 12, by + 12, { al: 'center', size: 7, col: '#434d6e' }); continue; }
      const nd = skNeed(it), k = clamp((ch[i] || 0) / nd, 0, 1), col = RARITY_COL[it.rar] || '#ffd34e', ready = k >= 1;
      g.drawImage(itemIcon(id).c, bx + 1, by + 1, 22, 22);
      g.fillStyle = 'rgba(10,8,20,.66)'; g.fillRect(bx + 1, by + 1, 22, Math.round(22 * (1 - k)));
      if (ready) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.22 + 0.14 * Math.sin(Q.t * 8); g.fillStyle = col; g.fillRect(bx - 2, by - 2, 28, 28); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      g.globalAlpha = ready ? 0.65 + 0.35 * Math.sin(Q.t * 8) : 0.6; g.fillStyle = ready ? col : '#6a6f8a'; g.fillRect(bx, by, 24, 1); g.fillRect(bx, by + 23, 24, 1); g.fillRect(bx, by, 1, 24); g.fillRect(bx + 23, by, 1, 24); g.globalAlpha = 1;
      g.fillStyle = col; g.fillRect(bx + 1, by + 21, Math.round(22 * k), 2);
      txt(String(i + 1), bx + 4, by + 5, { size: 6.5, bold: true, col: ready ? '#ffffff' : '#cfd6e6', ol: '#14121f' });
      if (i < 2) {
        const gsx = it.type === 'gun' ? gunState(it, P) : null, cdn = gsx ? (gsx.rel > 0 ? gsx.rel / it.st.reload : 0) : (it.type === 'wpn' ? P.wcd[i] / (P.wmax[i] || 1) : 0);
        if (cdn > 0) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(bx + 1, by + 1 + Math.round(22 * (1 - Math.min(1, cdn))), 22, Math.round(22 * Math.min(1, cdn))); }
        if (gsx) txt(String(gsx.rel > 0 ? sv('RLD', 'NẠP') : gsx.mag), bx + 22, by + 17, { al: 'right', size: gsx.rel > 0 ? 4.5 : 6, col: gsx.rel > 0 ? '#ff7a7a' : (gsx.mag <= 2 ? '#ffb03a' : '#ffffff'), ol: '#14121f' });
        if ((P.ws | 0) === i) { g.fillStyle = '#ffd34e'; g.fillRect(bx - 1, by - 1, 26, 1); g.fillRect(bx - 1, by + 24, 26, 1); g.fillRect(bx - 1, by - 1, 1, 26); g.fillRect(bx + 24, by - 1, 1, 26); g.fillRect(bx + 10, by - 4, 4, 1); g.fillRect(bx + 11, by - 3, 2, 1); }
      }
    }
  }
  // ===== the pet's transformation: 3 seconds of light, then its Ancient form steps out =====
  function petMorph(P, kind) {
    const G = Q.G; G.morph = { t: 0, dur: 3, kind, owner: P }; Snd.play('relic'); Snd.cineHit && Snd.cineHit('rise');
    Q.msg = sv('Your pet is transforming...', 'Pet của bạn đang biến hình...'); Q.msgT = 3;
  }
  function updateMorph(dt) {
    const G = Q.G, m = G.morph; if (!m) return; m.t += dt; const pt = G.pet, x = pt ? pt.x : m.owner.x, y = pt ? pt.y - 8 : m.owner.y, k = m.t / m.dur;
    if (Math.random() < 0.9) { const a = m.t * 9 + Math.random() * 6, r = 26 * (1 - k) + 6; emit(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, 1, { col: [(GIANT[m.kind] || BEAST[m.kind]).glow, '#ffffff', '#ffd34e'], sp0: 4, sp1: 18, grav: -30, l0: 0.3, l1: 0.6 }); }
    if (Math.floor(m.t * 2) !== Math.floor((m.t - dt) * 2)) { addRing(x, y, (GIANT[m.kind] || BEAST[m.kind]).glow, 30 + k * 50, 0.4); Snd.play('chime'); }
    Q.shake = Math.max(Q.shake, 0.05 + k * 0.2);
    if (m.t >= m.dur) { G.morph = null; G.flash = Math.max(G.flash || 0, 0.35); Snd.play('explode'); addRing(x, y, '#ffffff', 120, 0.5); emit(x, y, 50, { col: [(GIANT[m.kind] || BEAST[m.kind]).glow, '#fff', '#ffd34e'], sp0: 40, sp1: 200 }); spawnSummon(m.kind, 30, m.owner, true, { x, y: pt ? pt.y : m.owner.y + m.owner.h }); }
  }
  function summonItems() { return [save.inv.w[0], save.inv.w[1], save.inv.armor].filter(id => id && ITEM[id] && ITEM[id].st.summon); }
  function castSummons() {
    const G = Q.G; G.sumCd = G.sumCd || {}; const ids = summonItems(); let any = false;
    const sl = Q.P.slot || 0, ck = id => id + ':' + sl;
    for (const id of ids) { if ((G.sumCd[ck(id)] || 0) > 0) continue; G.sumCd[ck(id)] = 60; spawnSummon(ITEM[id].st.summon, 30, Q.P, true); any = true; }
    if (!any) { Q.msg = ids.length ? sv('Summon resting: ', 'Triệu hồi đang hồi: ') + Math.ceil(Math.min.apply(null, ids.map(id => G.sumCd[id + ':' + sl] || 0))) + 's' : sv('Equip a Divine sword or armor to summon (T).', 'Trang bị kiếm hoặc giáp Thần cấp để triệu hồi (T).'); Q.msgT = 2; Snd.play('select'); }
  }
  function updateSummons(dt) {
    const G = Q.G, P = Q.P; if (!G.sums) G.sums = []; G.sumCd = G.sumCd || {};
    for (const k in G.sumCd) if (G.sumCd[k] > 0) G.sumCd[k] -= dt;
    const pet = petIt();
    updateMorph(dt); G.petForm = G.sums.some(s => s.fromPet && s.life > 0) ? 1 : 0;
    sumCtx = true;
    if (pet && pet.st.heal) { G.petHealT = (G.petHealT === undefined ? pet.st.heal : G.petHealT) - dt; if (G.petHealT <= 0) { G.petHealT = pet.st.heal; if (P.hp < maxHP()) { P.hp++; Snd.play('heart'); emit(P.x + 4, P.y + 4, 8, { col: ['#ff7fb0', '#fff'], sp0: 10, sp1: 40 }); } } }
    let sdm = 1; const sd = n => Math.round((n + baseDmg()) * sdm);
    for (const s of G.sums) {
      s.t += dt; s.life -= dt; s.cd -= dt; if (s.atkT > 0) s.atkT -= dt; if (s.inv > 0) s.inv -= dt; if (s.hurtT > 0) s.hurtT -= dt;
      if (s.dying > 0) { if (Math.random() < 0.8) emit(s.x + rr(-24, 24), s.y - rr(0, 70), 1, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#ffffff'], sp0: 6, sp1: 30, grav: -60, l0: 0.5, l1: 1 }); s.dying -= dt; if (s.dying <= 0) s.life = 0; else s.life = Math.max(s.life, 0.5); continue; }
      if (s.hp <= 0 && s.life > 0) { s.dying = s.dieMax = 0.8; s.life = Math.max(s.life, 0.9); emit(s.x, s.y - 30, 24, { col: [(GIANT[s.kind] || BEAST[s.kind]).glow, '#fff'], sp0: 30, sp1: 140 }); Snd.play('poof'); pop(s.x, s.y - 60, sv('Defeated', 'Bị hạ gục'), '#ff7a7a'); continue; }
      if (s.ph && s.ph !== 'fight') { sumIntro(s, s.owner || P, dt); if (s.ph !== 'fight') continue; s.ax = s.ay = s.arot = s.sink = 0; s.asx = s.asy = s.aal = 1; s.look = 0; }
      s.ft = (s.ft || 0) + dt;
      if (s.evo && s.stage === 1 && ((s.hits || 0) >= 10 || s.ft >= (SUM_EVO[s.kind] || 15))) evolveSummon(s);
      if (s.stage === 1 && !s.evo && s.life <= 0.9) { sumDissolve(s, 0.8); continue; }   // short summons (pet forms) also fade out with their death animation
      if (s.stage === 2) { sumUltTick(s, s.owner || P, dt); continue; }
      sdm = s.stage === 2 ? 1.8 : 1;
      const o = s.owner || P, fly = !!SUM_FLY[s.kind];
      if (s.kind !== 'phoenix') sumRejoin(s, o);
      if (s.kind === 'phoenix') { const pt = sumTarget(s); if (pt) { s.f = pt.x + pt.w / 2 > s.x ? 1 : -1; sumGlide(s, pt.x + pt.w / 2 + Math.sin(s.t * 1.6) * 70, pt.y - 70 + Math.sin(s.t * 3) * 6, dt); s.mv = 1; } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 6 * dt; } }
      else if (fly) { const dr = sumTarget(s); if (dr) { const sd0 = dr.x + dr.w / 2 < s.x ? -1 : 1; s.f = sd0; sumGlide(s, dr.x + dr.w / 2 - sd0 * (s.kind === 'skywhale' ? 0 : 130), dr.y - (s.kind === 'skywhale' ? 90 : 50) + Math.sin(s.t * 2) * 6, dt); } else { s.mv = 0; s.y += Math.sin(s.t * 2) * 5 * dt; } }
      else sumWalk(s, o, dt);
      if (s.cd > 0 || s.t < 0.5 || s.life < 0.3 || (!fly && s.grounded === false)) continue;
      const near = r => nearestFoe(s.x, s.y - 30, r), all = r => foes().filter(e => Math.abs(e.x + e.w / 2 - s.x) < r);
      const cd0 = s.cd, tg0 = sumTarget(s);
      switch (s.kind) {
        case 'titan': s.cd = 1.3; Q.shake = Math.max(Q.shake, 0.5); Snd.play('boom'); addRing(s.x, s.y, '#c8a070', 120, 0.5); for (let i = -8; i <= 8; i++) emit(s.x + i * 22, groundYAt(s.x + i * 22), 2, { col: ['#8a6a44', '#c8a070'], sp0: 20, sp1: 70, vy: -60 }); for (const e of all(240)) { dmgFoe(e, sd(7), true, true); e.stunT = Math.max(e.stunT || 0, e.isBoss ? 0.3 : 0.9); if (!e.isBoss && !e.fly) e.vy = -170; } break;
        case 'stormgod': { s.cd = 0.45; const t = near(320); if (t) { const cx = t.x + t.w / 2; Snd.play('thunder'); zap(cx, Q.cam.y - 6, cx, t.y + t.h / 2); dmgFoe(t, sd(5), true, true); chainZap(t, sd(2), 2, 80); G.flash = Math.max(G.flash || 0, 0.06); } break; }
        case 'seagoddess': s.cd = 1.6; Snd.play('whoosh'); for (const d of [-1, 1]) shootG({ x: s.x, y: s.y - 14, vx: d * 210, vy: 0, life: 1.5, dmg: sd(6), slow: 2, thru: true, pierceN: 99, shape: 'wind', col: '#6ee7f2', sz: 14, f: d }); break;
        case 'phoenix': s.cd = 0.12; shootG({ x: s.x, y: s.y + 10, vx: s.f * 40 + rr(-20, 20), vy: 120, g: 220, life: 1.8, dmg: sd(2), burn: 3, shape: 'fire', trail: '#ffd34e', sz: 3, col: '#ff7a2a', quiet: true }); if (Math.random() < 0.2) Snd.play('flame'); break;
        case 'moongoddess': { s.cd = 0.35; const t = near(320); if (t) shootG({ x: t.x + t.w / 2, y: Q.cam.y - 8, vx: 0, vy: 560, life: 1, dmg: sd(4), thru: true, pierceN: 3, shape: 'orb', col: '#e8e0ff', trail: '#cfc0ff', sz: 4, quiet: true }); break; }
        case 'dragonking': case 'dragonform': { s.cd = 0.08; const t = (Q.boss && bossTargets()[0]) || near(260); if (t) { const dx = t.x + t.w / 2 - s.x, dy = t.y + t.h / 2 - s.y, d = Math.hypot(dx, dy) || 1; shootG({ x: s.x + s.f * 16, y: s.y + 6, vx: dx / d * 230 + rr(-20, 20), vy: dy / d * 230 + rr(-20, 20), life: 0.9, dmg: sd(s.kind === 'dragonking' ? 2 : 1), burn: 3, shape: 'fire', sz: 3, col: s.kind === 'dragonking' ? '#ffd34e' : '#ff7a2a', pierceN: 2, quiet: true }); if (Math.random() < 0.12) Snd.play('breath'); } break; }
        case 'frostgiant': s.cd = 1; if (!s.n) { for (const e of foes()) { e.slowT = Math.max(e.slowT || 0, 6); if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 1.5); } G.slowT = Math.max(G.slowT, 3); addRing(s.x, s.y - 20, '#bfefff', 220, 0.8); Snd.play('zap'); } for (const e of all(300).slice(0, 4)) shootG({ x: e.x + e.w / 2, y: Q.cam.y - 6, vx: 0, vy: 420, life: 1.2, dmg: sd(6), slow: 3, shape: 'ice', sz: 4, col: '#bfefff', quiet: true }); s.n++; break;
        case 'sunemperor': { const t = near(420); if (t) s.f = t.x + t.w / 2 < s.x ? -1 : 1; const by = t ? t.y + t.h / 2 : s.y - 34; s.cd = 2.2; Snd.play('explode'); G.flash = Math.max(G.flash || 0, 0.2); for (let k = -1; k <= 1; k++) shootG({ x: s.x + s.f * 20, y: by + k * 6, vx: s.f * 600, vy: 0, life: 0.9, dmg: sd(10), burn: 3, thru: true, pierceN: 99, shape: 'beam', col: '#ffe08a', sz: 6, f: s.f }); break; }
        case 'shogun': s.cd = 1; Snd.play('slash'); for (const e of all(320)) { dmgFoe(e, sd(8), true, true); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: ['#ff3a5a', '#fff'], sp0: 40, sp1: 150 }); } (G.slashes = G.slashes || []).push({ y: s.y - 30 - rr(0, 30), life: 0.25, x: s.x }); Q.shake = Math.max(Q.shake, 0.3); break;
        case 'treant': s.cd = 1; for (const e of all(260)) { dmgFoe(e, sd(5), true, true); e.slowT = Math.max(e.slowT || 0, 3); emit(e.x + e.w / 2, e.y + e.h, 8, { col: ['#5fcf5a', '#8a6a44'], sp0: 20, sp1: 70, vy: -70 }); } if ((s.n = (s.n || 0) + 1) % 2 === 0 && o.hp < (o.mhp || maxHP())) { o.hp++; Snd.play('heart'); } break;
        case 'aegis': s.cd = 0.1; for (const p of Q.projs) if (!p.dead && (Math.hypot(p.x - (o.x + 4), p.y - (o.y + 7)) < 140 || Math.hypot(p.x - s.x, p.y - (s.y - 30)) < 140)) { p.dead = true; emit(p.x, p.y, 6, { col: ['#ffe08a', '#fff'], sp0: 10, sp1: 50 }); } if ((s.n = (s.n || 0) + 1) % 15 === 0) nova(s.x, s.y - 20, 70, sd(4)); if (s.n % 8 === 0) { const t = near(80); if (t) { dmgFoe(t, sd(4), true, true); s.atkT = 0.35; Snd.play('clang'); } } break;
        case 'valkyrie': { s.cd = 0.55; const t = near(300); if (t) shootG({ x: s.x, y: s.y - 44, vx: (t.x > s.x ? 1 : -1) * 260, vy: -20, home: true, life: 1.6, dmg: sd(5), thru: true, pierceN: 1, shape: 'beam', col: '#cfe8ff', sz: 3, f: t.x > s.x ? 1 : -1, quiet: true }); break; }
        case 'angel': { s.cd = 1; const t = near(300); if (t) { zap(s.x, s.y - 40, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, sd(5), true, true); } if ((s.n = (s.n || 0) + 1) % 2 === 0 && o.hp < (o.mhp || maxHP())) { o.hp++; Snd.play('heart'); emit(o.x + 4, o.y + 4, 10, { col: ['#fff6c0', '#fff'], sp0: 10, sp1: 50 }); } break; }
        case 'golems': case 'clones': { s.cd = s.kind === 'clones' ? 0.7 : 0.9; const t = near(140); if (t) { dmgFoe(t, sd(s.kind === 'clones' ? 4 : 6), true, true); emit(t.x + t.w / 2, t.y + t.h / 2, 10, { col: s.kind === 'clones' ? ['#a15be0', '#14121f'] : ['#a8a8b8', '#fff'], sp0: 30, sp1: 110 }); Snd.play(s.kind === 'clones' ? 'slash' : 'clang'); s.hitX = t.x + t.w / 2; s.hitT = 0.25; if (!t.isBoss) t.vx = (t.x > s.x ? 1 : -1) * 160; } break; }
        case 'thunderkirin': { s.cd = 0.8; const t = near(260); if (t) { Snd.play('zap'); zap(s.x, s.y - 14, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, sd(4), true, true); chainZap(t, sd(2), 3, 90); s.x += (t.x - s.x) * 0.5; } break; }
        case 'skywhale': s.cd = 0.3; shootG({ x: s.x + rr(-30, 30), y: s.y + 10, vx: rr(-30, 30), vy: 200, life: 1.6, dmg: sd(4), expl: 26, shape: 'meteor', sz: 4, col: '#cfe8ff', trail: '#ffe08a', quiet: true }); break;
        case 'ninetail': s.cd = 0.6; for (let i = 0; i < 3; i++) shootG({ x: s.x, y: s.y - 16, vx: rr(-120, 120), vy: -rr(60, 140), home: true, life: 2, dmg: sd(3), burn: 2, shape: 'orb', col: '#6ee7f2', trail: '#ff9a4a', sz: 3, quiet: true }); break;
      }
      if (s.cd > cd0 + 0.001 && tg0 && Math.abs(tg0.x + tg0.w / 2 - s.x) < 460) s.hits = (s.hits || 0) + Math.min(1, s.cd / 0.8) * (tg0.isBoss ? 1 : 0.6);
      if (s.cd > cd0 + 0.001 && s.kind !== 'aegis') { s.atkT = 0.35; if (s.stage === 2) s.cd = cd0 + (s.cd - cd0) * 0.72; }
    }
    G.sums = G.sums.filter(s => s.life > 0 && (s.hp > 0 || s.dying > 0));
    sumCtx = false;
    // the boss is no pushover: when summons crowd it, it sweeps them away
    const B = Q.boss; if (B && !B.dead && !B.hide && Q.arenaSealed && G.sums.length) {
      G.bSweep = (G.bSweep === undefined ? 4 : G.bSweep) - dt;
      const near = G.sums.filter(s => s.ph === 'fight' && Math.abs(s.x - (B.x + B.w / 2)) < B.w / 2 + 90);
      if (G.bSweep <= 0 && near.length) { G.bSweep = 3.6; const bx = B.x + B.w / 2, by = B.y + B.h / 2; addRing(bx, by, bpc(), B.w / 2 + 90, 0.5); Snd.play('boom'); Q.shake = Math.max(Q.shake, 0.4); hitSums({ x: B.x - 90, y: B.y - 30, w: B.w + 180, h: B.h + 40 }, true); hitSums({ x: B.x - 90, y: B.y - 30, w: B.w + 180, h: B.h + 40 }, true); pop(bx, B.y - 16, sv('SWEEP!', 'QUÉT!'), '#ff7a7a'); }
    }
    if (G.slashes) { for (const sl of G.slashes) sl.life -= dt; G.slashes = G.slashes.filter(sl => sl.life > 0); }
  }
  // ===== the artist's summon sprites (assets/summons, cut from art/summon_sheets by tools/extract_summons.py) =====
  let SUM_MAN = null; const SUM_IMG = {};
  fetch('assets/summons/manifest.json').then(r => r.ok ? r.json() : null).then(m => { SUM_MAN = m || {}; }).catch(() => { SUM_MAN = {}; });
  const SUM_ALIAS = { dragonform: ['dragonking', 'hue-rotate(-42deg) saturate(1.7) brightness(1.08) contrast(1.05)'] };
  const SUM_H = { titan: 74, stormgod: 74, seagoddess: 68, moongoddess: 68, frostgiant: 80, shogun: 58, treant: 80, aegis: 56, valkyrie: 56, angel: 60, golems: 46, phoenix: 50, dragonking: 66, dragonform: 66, ninetail: 42, clones: 28 };   // body height in world pixels (the hero is ~20)
  function sumArt(k) {
    if (SUM_IMG[k]) return SUM_IMG[k]; if (!SUM_MAN) return null;
    const al = SUM_ALIAS[k], src = al ? al[0] : k, m = SUM_MAN[src]; if (!m) return (SUM_IMG[k] = { none: true });
    const o = SUM_IMG[k] = { m };
    for (const n in m) {
      const im = new Image();
      im.onload = () => { let c = im; if (al) { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const cx = cv.getContext('2d'); cx.filter = al[1]; cx.drawImage(im, 0, 0); c = cv; } o[n] = c; };
      im.src = 'assets/summons/' + src + '_' + n + '.png';
    }
    return o;
  }
  // animator: idle (breathing), walk cycle, attack, hurt and death strips; the final form is one big pose animated by code
  const SUM_FPS = 10;   // pixel-art strips play at a fixed 10 fps (never at the 60 fps game rate)
  const HIQ = []; let hiOn = false, hiClip = null;
  function hiImg(im, a0, a1, a2, a3, a4, a5, a6, a7) {
    if (!hiOn) { g.drawImage(im, a0, a1, a2, a3, a4, a5, a6, a7); return; }
    HIQ.push({ im, a: [a0, a1, a2, a3, a4, a5, a6, a7], m: g.getTransform(), al: g.globalAlpha, f: g.filter, clip: hiClip });
  }
  function drawHiQ() {
    for (const r of HIQ) {
      ctx.save();
      if (r.clip) { ctx.setTransform(scale, 0, 0, scale, offX, offY); const c = r.clip.m; ctx.transform(c.a, c.b, c.c, c.d, c.e, c.f); ctx.beginPath(); ctx.rect(r.clip.r[0], r.clip.r[1], r.clip.r[2], r.clip.r[3]); ctx.clip(); }
      ctx.setTransform(scale, 0, 0, scale, offX, offY); const m = r.m; ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      ctx.globalAlpha = r.al; ctx.filter = r.f || 'none'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(r.im, r.a[0], r.a[1], r.a[2], r.a[3], r.a[4], r.a[5], r.a[6], r.a[7]); ctx.restore();
    }
    HIQ.length = 0;
  }
  function drawSumArt(s, x, y, a) {
    const o = sumArt(s.kind); if (!o || o.none || !(o.idle || o.walk)) return 0;
    const H = (SUM_H[s.kind] || 100) * (s.stage === 2 ? 1.35 : 1), f = s.f < 0 ? -1 : 1;
    const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform';
    const by = y + (fly ? H / 2 : 0) + (fly ? Math.sin(s.t * 3) * 3 : 0);
    let im, meta, fi = 0, ox = 0, oy = 0, sx = 1, sy = 1, rot = 0;
    const atk = s.atkT > 0 ? clamp(s.atkT / 0.35, 0, 1) : 0, sw = Math.sin((1 - atk) * Math.PI);
    if (s.dying > 0 && o.death) { im = o.death; meta = o.m.death; fi = Math.min(meta.n - 1, Math.floor((1 - s.dying / (s.dieMax || 0.8)) * meta.n)); }
    else if (s.stage === 2 && o.evo) {
      im = o.evo; meta = o.m.evo; const ph = s.t * (s.mv ? 9 : 2.4);
      oy = s.mv ? -Math.abs(Math.sin(ph)) * 3 : Math.sin(ph) * 1.2; rot = (s.mv ? Math.sin(ph) * 0.045 : 0) + (atk > 0 ? sw * 0.16 : 0);
      ox = atk > 0 ? sw * 12 : 0; sx = sy = 1 + (atk > 0 ? sw * 0.07 : 0); sy *= 1 + Math.sin(s.t * 2.4) * 0.014;
      if (s.hurtT > 0) ox -= 4;
    }
    else if (s.hurtT > 0 && o.hurt) { im = o.hurt; meta = o.m.hurt; fi = Math.min(meta.n - 1, Math.floor((1 - s.hurtT / 0.2) * (meta.n - 1))); }
    else if (atk > 0 && o.attack) { im = o.attack; meta = o.m.attack; fi = Math.min(meta.n - 1, Math.floor((1 - atk) * meta.n)); }
    else if (s.mv && o.walk) { im = o.walk; meta = o.m.walk; fi = Math.floor(s.t * SUM_FPS) % meta.n; }
    else { im = o.idle || o.walk; meta = o.idle ? o.m.idle : o.m.walk; sy = 1 + Math.sin(s.t * 2.6) * 0.016; }
    const n = meta.n, fw = im.width / n, fh = im.height, sc = H / (meta.ch || fh), red = s.hurtT > 0 && s.hurtT < 0.14 && s.hurtT > 0.06;
    const copies = s.kind === 'golems' ? [-24, 24] : s.kind === 'clones' ? [-22, 0, 22] : [0];
    const AX = s.ax || 0, AY = s.ay || 0, ASX = s.asx || 1, ASY = s.asy || 1, AR = s.arot || 0, AA = s.aal === undefined ? 1 : s.aal, SK = s.sink || 0;
    if (SK > 0) { g.save(); g.beginPath(); g.rect(x - 400, y - 800, 800, 800); g.clip(); hiClip = { m: g.getTransform(), r: [x - 400, y - 800, 800, 800] }; }
    copies.forEach((d, i) => {
      g.save(); g.imageSmoothingEnabled = true; g.globalAlpha = a * AA * (s.kind === 'clones' ? 0.82 : 1);
      g.translate(x + d + f * ox + AX, by + oy + AY + SK); g.rotate(rot * f + AR); g.scale(f * sx * ASX, sy * ASY);
      const fj = n > 1 && copies.length > 1 && fi === Math.floor(s.t * SUM_FPS) % n ? (fi + i * 3) % n : fi;
      hiImg(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      if (red) { g.globalAlpha = 0.75 * a; g.filter = 'brightness(0.75) sepia(1) saturate(9) hue-rotate(-45deg)'; hiImg(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc); g.filter = 'none'; }
      g.restore();
    });
    if (SK > 0) { g.restore(); hiClip = null; }
    return H;
  }
  function sumHud(s, x, top, a) {
    if (s.evo && s.stage === 1 && !s.dying) { const bw = 32, by = Math.round(top) - 12, k = clamp(Math.max((s.hits || 0) / 10, s.t / 15), 0, 1); g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 3); g.fillStyle = '#ffd34e'; g.fillRect(x - bw / 2, by, Math.round(bw * k), 1); }
    if (s.hpMax && !s.dying) { const bw = s.stage === 2 ? 44 : 32, by = Math.round(top) - 8; g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = '#6a1a1a'; g.fillRect(x - bw / 2, by, bw, 3); g.fillStyle = s.stage === 2 ? '#ffd34e' : '#7ed957'; g.fillRect(x - bw / 2, by, Math.round(bw * clamp(s.hp / s.hpMax, 0, 1)), 3); }
    if (s.stage === 2 && !s.dying) { const R2 = 90 + Math.sin(s.t * 6) * 6, cy = (top + 50 + (top + 50)) / 2; g.globalCompositeOperation = 'lighter'; const g2 = g.createRadialGradient(x, cy + 30, 0, x, cy + 30, R2); g2.addColorStop(0, 'rgba(255,211,78,.2)'); g2.addColorStop(1, 'rgba(255,211,78,0)'); g.fillStyle = g2; g.fillRect(x - R2, cy + 30 - R2, R2 * 2, R2 * 2); g.globalCompositeOperation = 'source-over'; }
  }
  function drawSumFx(s, x, y) {
    const H = SUM_H[s.kind] || 50, glow = (GIANT[s.kind] || BEAST[s.kind]).glow, k = s.pt, T = ENT_T[s.ent] || 1;
    if ((s.ph === 'enter' && (s.ent === 'shadow' || s.ent === 'roots')) || (s.ph === 'engage' && s.eg === 'shadow')) { g.globalAlpha = 0.75; g.fillStyle = s.ent === 'roots' && s.ph === 'enter' ? '#1e3a1e' : '#1a0a2a'; g.beginPath(); g.ellipse(x, y, 22, 4, 0, 0, 7); g.fill(); g.globalAlpha = 0.5; g.fillStyle = s.ent === 'roots' && s.ph === 'enter' ? '#5fcf5a' : '#a15be0'; g.beginPath(); g.ellipse(x, y, 16 + Math.sin(Q.t * 8) * 2, 2.5, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (s.ph === 'enter' && s.ent === 'beam') { const a = 1 - seg(k, T * 0.8, T); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x - 14, 0, x + 14, 0); gr.addColorStop(0, hexA(glow, 0)); gr.addColorStop(0.5, hexA('#fff6c0', 0.55 * a)); gr.addColorStop(1, hexA(glow, 0)); g.fillStyle = gr; g.fillRect(x - 14, 0, 28, y); g.globalCompositeOperation = 'source-over'; }
    if (s.ph === 'enter' && s.ent === 'geyser') { const a = 1 - seg(k, T * 0.7, T); g.globalAlpha = 0.55 * a; g.fillStyle = '#6ee7f2'; g.fillRect(x - 8, y - H - 30, 16, H + 30); g.fillStyle = '#ffffff'; g.fillRect(x - 3, y - H - 30, 6, H + 30); g.globalAlpha = 1; }
    if (s.ph === 'enter' && s.ent === 'meteor' && k < 0.75) { g.globalCompositeOperation = 'lighter'; const yy = y + (s.ay || 0) - H / 2; const gr = g.createLinearGradient(x, yy - 70, x, yy); gr.addColorStop(0, 'rgba(255,120,40,0)'); gr.addColorStop(1, 'rgba(255,200,90,.6)'); g.fillStyle = gr; g.fillRect(x - 10, yy - 70, 20, 70); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.3; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x, y, 10 + k * 20, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (s.look) { const hx = x + s.f * H * 0.12 + (s.ax || 0), hy = y + (s.ay || 0) + (s.sink || 0) - H * 0.86 * (s.asy || 1), c = s.kind === 'clones' || s.kind === 'shogun' ? '#c07bff' : glow; g.globalCompositeOperation = 'lighter'; g.fillStyle = c; g.globalAlpha = 0.6 + 0.4 * Math.sin(Q.t * 10); g.fillRect(Math.round(hx - 2), Math.round(hy), 2, 1); g.fillRect(Math.round(hx + 1), Math.round(hy), 2, 1); g.globalAlpha = 0.3; g.fillRect(Math.round(hx - 4), Math.round(hy), 9, 1); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }
  function drawSummons(camX, camY) {
    const G = Q.G; if (!G.sums) return;
    for (const s of G.sums) {
      const a = Math.min(1, s.t / 0.45, s.life / 0.6, s.dying > 0 ? clamp(s.dying / (s.dieMax || 0.8) * 1.6, 0, 1) : 1), sp = summonSprite(s.kind), x = Math.round(s.x - camX), y = Math.round(s.y - camY), info = GIANT[s.kind] || BEAST[s.kind];
      g.globalCompositeOperation = 'lighter'; const R = 60, gr = g.createRadialGradient(x, y - 40, 0, x, y - 40, R); gr.addColorStop(0, hexA(info.glow, 0.32 * a)); gr.addColorStop(1, hexA(info.glow, 0)); g.fillStyle = gr; g.fillRect(x - R, y - 40 - R, R * 2, R * 2); g.globalCompositeOperation = 'source-over';
      if (s.ph && s.ph !== 'fight') drawSumFx(s, x, y);
      { const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform', hh = drawSumArt(s, x, y, a); if (hh) { if (Math.random() < (s.stage === 2 ? 0.7 : 0.3)) emit(s.x + rr(-20, 20), s.y - rr(0, hh * 0.8) + (fly ? hh / 2 : 0), 1, { col: [s.stage === 2 ? '#ffd34e' : info.glow, '#fff'], sp0: 3, sp1: 14, grav: -20, l0: 0.4, l1: 0.9 }); sumHud(s, x, y - hh + (fly ? hh / 2 : 0), a); continue; } }
      if (s.kind === 'clones') { for (let i = 0; i < 3; i++) { const cx = x + (i - 1) * 22 + Math.round(Math.sin(s.t * 6 + i) * 3); g.globalAlpha = 0.6 * a; drawSpr(g, getSprite('hero_run', { a: '#5a5a6a', A: '#2a2a3a', q: '#14121f', b: '#3a2a5a', r: '#a15be0', f: '#a15be0', o: '#14121f' }, Math.floor(s.t * 10 + i) % 4), cx, y, s.f < 0); } g.globalAlpha = 1; continue; }
      if (s.kind === 'dragonking' || s.kind === 'dragonform') { const ds = dragonSprite(s.kind === 'dragonking' ? 2 : 1, Math.floor(Q.t * 6) % 2); g.globalAlpha = 0.95 * a; g.drawImage(s.f < 0 ? ds.f : ds.c, Math.round(x - ds.w / 2), Math.round(y - ds.h / 2)); if (s.kind === 'dragonking') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * a; g.drawImage(s.f < 0 ? ds.f : ds.c, Math.round(x - ds.w / 2), Math.round(y - ds.h / 2)); g.globalCompositeOperation = 'source-over'; } g.globalAlpha = 1; continue; }
      if (!sp) continue;
      const giant = !!GIANT[s.kind], sc = (giant ? (GIANT[s.kind].small ? 1.1 : 2) : 1.5) * (s.stage === 2 ? 1.3 : 1), rise = giant ? Math.round((1 - Math.min(1, s.t / 0.5)) * 30) : 0;
      g.globalAlpha = 0.8 * a;
      if (s.kind === 'golems') { for (const dx of [-26, 26]) { if (!drawGiantAnim(s, x, y + rise, sc, 0.8 * a, dx + (s.hitT > 0 ? 3 : 0))) drawSpr(g, sp, x + dx, y + rise, dx > 0, false, sc, sc); } }
      else if (giant && drawGiantAnim(s, x, y + rise, sc, 0.8 * a)) { }
      else drawSpr(g, sp, x, y + rise + (giant ? 0 : Math.round(sp.h * sc / 2)), s.f < 0, false, sc, sc);
      g.globalAlpha = 1;
      if (Math.random() < (s.stage === 2 ? 0.8 : 0.4)) emit(s.x + rr(-20, 20), s.y - rr(0, 80), 1, { col: [s.stage === 2 ? '#ffd34e' : info.glow, '#fff'], sp0: 3, sp1: 14, grav: -20, l0: 0.4, l1: 0.9 });
      if (s.hurtT > 0) { g.globalAlpha = 0.4; g.fillStyle = '#ff3a3a'; g.fillRect(x - 14, y - 70, 28, 70); g.globalAlpha = 1; }
      sumHud(s, x, y - Math.round((giant ? 58 : 36) * sc), a);
    }
    if (G.slashes) for (const sl of G.slashes) { g.globalAlpha = sl.life / 0.25; g.fillStyle = '#ff3a5a'; g.fillRect(0, Math.round(sl.y - camY) - 1, VW, 3); g.fillStyle = '#fff'; g.fillRect(0, Math.round(sl.y - camY), VW, 1); g.globalAlpha = 1; }
  }
  // the five Divine special weapons
  function fireDivine(id, f, x, y) {
    const P = Q.P, G = Q.G, wdd = n => wd(n);
    if (id === 'frostbow') { Snd.play('whoosh'); shootG({ x, y, vx: f * 40, vy: -420, life: 0.5, dmg: wdd(3), shape: 'ice', sz: 3, col: '#bfefff', quiet: true }); for (let i = 0; i < 90; i++) later(0.4 + i * 0.026, () => shootG({ x: Q.cam.x + rr(10, VW - 10), y: Q.cam.y - 8, vx: rr(-25, 25), vy: rr(340, 420), life: 1.4, dmg: wdd(3), slow: 3, shape: 'arrow', col: '#bfefff', sz: 2, quiet: true })); Q.msg = save.lang === 'vi' ? 'MƯA TÊN BĂNG!' : 'ICE ARROW STORM!'; Q.msgT = 1.6; return true; }
    if (id === 'reaperscythe') { Snd.play('whoosh'); shootG({ x, y, f, vx: f * 240, vy: 0, life: 2.2, boom: 1.0, dmg: wdd(6), stun: 2, poison: true, thru: true, shape: 'scythe', spin: 16, sz: 7, col: '#a15be0' }); return true; }
    if (id === 'meteorstaff') { let t = Q.boss && bossTargets()[0]; if (!t) { let best = null; for (const e of foes()) if (Math.abs(e.x - P.x) < 300 && (!best || e.hp > best.hp)) best = e; t = best; } const tx = t ? t.x + t.w / 2 : P.x + f * 100; Snd.play('boom'); Q.msg = save.lang === 'vi' ? 'THIÊN THẠCH!' : 'METEOR!'; Q.msgT = 1.4; later(0.7, () => shootG({ x: tx - f * 80, y: Q.cam.y - 30, vx: f * 110, vy: 340, life: 2.5, dmg: wdd(20), expl: 80, shape: 'bigmeteor', sz: 9, col: '#ff7a2a', trail: '#ffd34e' })); return true; }
    if (id === 'chakram') { Snd.play('whoosh'); shootG({ x, y, f, vx: f * 280, vy: 0, life: 2.5, dmg: wdd(6), burn: 3, bounces: 8, thru: true, shape: 'chakram', spin: 20, sz: 5, col: '#ffd34e', trail: '#ff9a2a' }); return true; }
    if (id === 'singularity') { const hx = P.x + 4 + f * 100, hy = P.y; Snd.play('zap'); G.holes.push({ x: hx, y: hy, life: 5, r: 150, tick: 0.12 }); later(5, () => { explode(hx, hy, 110, wdd(16)); addRing(hx, hy, '#7a4cff', 140, 0.6); }); Q.msg = save.lang === 'vi' ? 'ĐIỂM KỲ DỊ!' : 'SINGULARITY!'; Q.msgT = 1.4; return true; }
    return false;
  }
  // ===================== THE SUNKEN DEEP: quest, pearls, currents, depth =====================
  const QUEST8 = [
    { w: 'narr', en: 'The end of the land. Beyond the cliff the sea falls away into darkness, and somewhere far below, a piece of the Sun is trapped.', vi: 'Tận cùng của đất liền. Sau vách đá, biển khơi đổ xuống bóng tối, và đâu đó rất sâu bên dưới, một mảnh Mặt Trời đang bị giam giữ.' },
    { w: 'mermaid', en: 'Lanternbearer! You came! My village at the bottom of the sea has been dark for three months.', vi: 'Người Mang Đèn! Bạn đã tới! Làng của tôi dưới đáy biển đã tối suốt ba tháng.' },
    { w: 'mermaid', en: 'The Kraken keeps the Sun fragment in the deepest cavern and locks it with the Tide Door. The door opens only for three Sea Pearls.', vi: 'Thủy Quái Kraken giữ mảnh Mặt Trời trong hang sâu nhất và khóa bằng Cánh Cửa Thủy Triều. Cửa chỉ mở cho ba Ngọc Trai Biển.' },
    { w: 'ember', en: 'And where are the pearls?', vi: 'Vậy ngọc trai ở đâu?' },
    { w: 'mermaid', en: 'Its fish hid them in three rock pockets carved into the walls, on the way down. Swim into the side caves and search!', vi: 'Lũ cá của nó giấu chúng trong ba hốc đá khoét vào vách, trên đường đi xuống. Hãy bơi vào các hang bên và tìm!' },
    { w: 'pirate', en: 'Arr, listen, lad. Hammer the Jump button again and again to swim up, let yourself sink to go down. The deeper you go, the darker and the stronger the currents.', vi: 'Arr, nghe này nhóc. Nhấn Nhảy liên tục để bơi lên, buông ra để chìm xuống. Càng sâu càng tối và dòng nước càng mạnh.' },
    { w: 'pirate', en: 'Every stone shelf has a lamp post: that is a safe spot to rest. And swing your sword while you swim, the fish will not wait for you!', vi: 'Mỗi bệ đá đều có cột đèn: đó là chỗ nghỉ an toàn. Và cứ vung kiếm khi đang bơi, bọn cá không chờ bạn đâu!' },
    { w: 'ember', en: 'Three pearls, one door and one giant octopus. A normal day, then.', vi: 'Ba viên ngọc, một cánh cửa và một con bạch tuộc khổng lồ. Một ngày bình thường thôi mà.' },
    { w: 'mermaid', en: 'Swim fast, Ember. The sea is very deep... and the fish are hungry.', vi: 'Bơi nhanh nhé, Ember. Biển rất sâu... và lũ cá đang đói.' },
    { w: 'narr', en: 'QUEST: find the 3 Sea Pearls in the side caves, open the Tide Door at the bottom, and face the Kraken.', vi: 'NHIỆM VỤ: tìm 3 Ngọc Trai Biển trong các hang bên, mở Cánh Cửa Thủy Triều ở đáy và đối đầu Thủy Quái.' }
  ];
  DLG[8] = {
    mermaid: [
      { en: 'Three Sea Pearls, hidden in the side caves of the walls. Look for the dark openings on the left and right as you dive.', vi: 'Ba Ngọc Trai Biển, giấu trong các hang bên của vách đá. Hãy tìm các cửa hang tối ở trái và phải khi lặn.' },
      { en: 'Bring all three to the Tide Door at the very bottom. It will open by itself.', vi: 'Mang cả ba tới Cánh Cửa Thủy Triều ở tận đáy. Nó sẽ tự mở.' }],
    pirate: [
      { en: 'Hit Jump again and again to swim up. And keep swinging while you swim: the fish bite harder than they look.', vi: 'Nhấn Nhảy liên tục để bơi lên. Và cứ vung kiếm khi đang bơi: lũ cá cắn đau hơn vẻ ngoài của chúng.' }],
    fisher: [
      { en: 'The currents get stronger below here. They push you away from the hole in each shelf. Swim hard, or ride them and loop back!', vi: 'Dưới đây dòng nước mạnh hơn. Chúng đẩy bạn ra xa cái lỗ ở mỗi bệ đá. Bơi thật mạnh, hoặc cứ để trôi rồi vòng lại!' },
      { en: 'I saw a pearl glowing in a cave on the left, three shelves down.', vi: 'Ông thấy một viên ngọc trai phát sáng trong hang bên trái, ba bệ đá bên dưới.' }],
    bard: [
      { en: '"Down, down, down the lantern goes, where the quiet kraken dozes..." I can never find a rhyme for dozes.', vi: '"Xuống, xuống, xuống đèn đi mãi, nơi quái vật ngủ yên..." Tôi chẳng bao giờ tìm được vần cho chữ "yên".' }],
    mole: [
      { en: 'Hm? A mole in the sea? Do not ask. I followed a worm and got a bit lost.', vi: 'Hử? Chuột chũi ở biển ư? Đừng hỏi. Ông theo một con sâu rồi hơi bị lạc.' }]
  };
  MAP_STORY[8] = [
    { en: 'SUNKEN DEEP. The road ends at a cliff above the sea. Far below, the Kraken sleeps on the Sun\'s sixth shard.', vi: 'ĐẠI DƯƠNG SÂU THẲM. Con đường dừng lại ở vách đá phía trên biển. Rất sâu bên dưới, Thủy Quái đang ngủ trên mảnh Mặt Trời thứ sáu.' },
    { en: 'A mermaid waits on the shore. She needs help: the Kraken locked its cave with a Tide Door that opens only for three Sea Pearls.', vi: 'Một nàng tiên cá đang đợi trên bờ. Cô cần giúp đỡ: Thủy Quái đã khóa hang bằng Cánh Cửa Thủy Triều chỉ mở cho ba Ngọc Trai Biển.' },
    { en: 'You will dive from the surface into the deep: swim down through six dark zones, fight what lives there and search the side caves. The deeper you go, the stronger the currents.', vi: 'Bạn sẽ lặn từ mặt biển xuống vực sâu: bơi qua sáu tầng tối, chiến đấu với những gì sống ở đó và tìm trong các hang bên. Càng sâu, dòng nước càng mạnh.' }
  ];
  COOP_MAP[8] = [L2('narr', 'The Sunken Deep. A mermaid begs for help: three Sea Pearls open the Tide Door above the Kraken.', 'Đại Dương Sâu Thẳm. Một nàng tiên cá cầu xin giúp đỡ: ba Ngọc Trai Biển mở Cánh Cửa Thủy Triều trên đầu Thủy Quái.'),
    L2('{p0}', 'Swim into the side caves and look for the pearls. Stay close and shout if you get swept away.', 'Bơi vào các hang bên và tìm ngọc trai. Đi sát nhau và hét lên nếu bị cuốn đi.'),
    L2('{p1}', 'I will take the left caves. Whoever finds a pearl, yell!', 'Mình lo mấy hang bên trái. Ai thấy ngọc trai thì hét lên nhé!')];
  const depthM = y => Math.max(0, Math.round((y / TS - Q.L.waterY) * 2));
  const depthDark = y => clamp(((y / TS) - 12) / (Q.L.H - 28), 0, 1);
  function openTideDoor(pg) {
    pg.open = true; for (let y = pg.y0; y <= pg.y1; y++) for (let x = pg.x0; x <= pg.x1; x++) Q.L.grid[y][x] = ' ';
    Snd.play('gate'); Snd.play('boom'); Q.shake = 0.6; const cx = (pg.x0 + pg.x1) / 2 * TS, cy = pg.y0 * TS;
    for (let i = 0; i < 40; i++) emit(cx + rr(-150, 150), cy + rr(0, 30), 1, { col: ['#bfeaff', '#fff', '#6ee7f2'], sp0: 20, sp1: 120, vy: 60 });
    addRing(cx, cy, '#6ee7f2', 120, 0.8); Q.msg = save.lang === 'vi' ? 'Cánh Cửa Thủy Triều đã mở! Kraken đang đợi bên dưới...' : 'The Tide Door opens! The Kraken waits below...'; Q.msgT = 5;
  }
  function updateOcean(dt) {
    const L = Q.L;
    if (L.forest && !Q.forestShown && Q.state === 'play' && Q.P.x > L.forest.x0 * TS) { Q.forestShown = true; Q.msg = save.lang === 'vi' ? 'RỪNG NẤM KHỔNG LỒ... có thứ gì đó khổng lồ đang theo dõi bạn từ trên cao.' : 'THE GIANT FOREST... something huge is watching you from above.'; Q.msgT = 5; Snd.monster(7, 'alert', 0.7); }
    if (L.waterY === undefined || !Q.B.water || Q.state !== 'play') return;
    const P = Q.P;
    if (!Q.questShown) { Q.qT = (Q.qT || 0) + dt; if (Q.qT > 1.2 && P.onGround) { Q.questShown = true; startScripted('mermaid', QUEST8, null); return; } }
    // currents
    for (const c of L.currents) {
      const x0 = c.x0 * TS, x1 = c.x1 * TS, y0 = c.y0 * TS, y1 = c.y1 * TS;
      for (const p of allPl()) if (p.x > x0 && p.x < x1 && p.y > y0 && p.y < y1) { if (c.vx) moveX(p, c.vx * dt); if (c.vy) { p.y += c.vy * dt; } }
      if (Math.abs((x0 + x1) / 2 - Q.cam.x - VW / 2) < VW / 2 + (x1 - x0) / 2 && Math.random() < 0.5) { const sx = rr(Math.max(x0, Q.cam.x), Math.min(x1, Q.cam.x + VW)), sy = rr(Math.max(y0, Q.cam.y), Math.min(y1, Q.cam.y + VH)); emit(sx, sy, 1, { col: ['#bfeaff', '#ffffff'], sp0: 0, sp1: 4, vx: c.vx * 1.6, vy: c.vy * 1.6, grav: 0, l0: 0.5, l1: 1.0 }); }
    }
    // the Tide Door
    const pg = L.pearlGate;
    if (pg && !pg.open) {
      const cx = (pg.x0 + pg.x1) / 2 * TS, cy = (pg.y0 + 1) * TS, d = Math.hypot(P.x - cx, P.y - cy);
      if (Q.pearls >= 3 && d < 160) openTideDoor(pg);
      else if (d < 110 && Q.t - (Q.doorMsgT || -99) > 6) { Q.doorMsgT = Q.t; Q.msg = (save.lang === 'vi' ? 'Cánh Cửa Thủy Triều cần 3 Ngọc Trai Biển (' : 'The Tide Door needs 3 Sea Pearls (') + (Q.pearls || 0) + '/3)'; Q.msgT = 4; }
    }
  }
  // paints the sky and the sea surface when the camera can see above the water
  function drawSurface(camX, camY) {
    const L = Q.L; if (L.waterY === undefined || !Q.B.water) return;
    const sy = Math.round(L.waterY * TS - camY); if (sy <= 0) return;
    const h = Math.min(sy, VH), gr = g.createLinearGradient(0, 0, 0, sy); gr.addColorStop(0, '#4a90d8'); gr.addColorStop(0.55, '#a8d0f0'); gr.addColorStop(1, '#ffe0b0');
    g.fillStyle = gr; g.fillRect(0, 0, VW, h);
    if (Q.scn) for (const c of Q.scn.clouds.slice(0, 5)) { const x = ((c.x - camX * 0.06 + Q.t * c.v * 0.6) % (VW + 200) + VW + 200) % (VW + 200) - 100, cs = cloudSprite('rgba(255,255,255,.8)', Math.round(c.w)); g.globalAlpha = cs.alpha; g.drawImage(cs, Math.round(x), Math.round(10 + c.y * 0.9 - camY * 0.04)); g.globalAlpha = 1; }
    if (sy < VH + 4) { for (let x = 0; x < VW; x += 2) { const wy = sy + Math.round(Math.sin((x + camX) * 0.09 + Q.t * 2.2) * 1.4); g.fillStyle = '#d8f4ff'; g.fillRect(x, wy - 1, 2, 2); g.fillStyle = 'rgba(160,220,255,.5)'; g.fillRect(x, wy + 1, 2, 3); } }
  }
  // ===================== GUNS: auto-fire while held, magazines, reloads, recoil and the skills of the top guns =====================
  function updateGuns(dt) {
    const G = Q.G; if (!G.gun) return;
    for (const k in G.gun) { const gs = G.gun[k]; if (gs.rel > 0) { gs.rel -= dt; if (gs.rel <= 0) { gs.mag = gs.max; Snd.play('click'); } } if (gs.heat > 0 && Q.t - (gs.lastShot || 0) > 0.4) gs.heat = Math.max(0, gs.heat - dt * 0.9); }
    for (const p of allPl()) { if (p.gunT > 0) p.gunT -= dt; if (p.recoil > 0) p.recoil -= dt; }
  }
  function gunState(it, P) { const G = Q.G; G.gun = G.gun || {}; const k = it.id + ':' + (P.slot || 0); return G.gun[k] || (G.gun[k] = { mag: it.st.mag, max: it.st.mag, rel: 0, n: 0, heat: 0 }); }
  function freezeBlast(x, y, r, d, t) { addRing(x, y, '#bfefff', r, 0.5); Snd.play('zap'); for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + e.w / 2) { dmgFoe(e, d, true, true); e.slowT = Math.max(e.slowT || 0, t); if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 1); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#fff', '#9fe8ff'], sp0: 10, sp1: 60 }); } }
  function fireGun(it, s) {
    const P = Q.P, G = Q.G, f = P.face, st = it.st, id = it.id, gs = gunState(it, P);
    if (gs.rel > 0) return;
    if (gs.mag <= 0) { gs.rel = st.reload; return; }
    const dir = aimVec(1), base = Math.atan2(dir[1], dir[0]), mx = P.x + 4 + Math.cos(base) * 15, my = P.y + 6 + Math.sin(base) * 15;
    let cd = st.cd; gs.lastShot = Q.t; if (id === 'minigun') { gs.heat = Math.min(1, gs.heat + 0.09); cd = lerp(0.2, 0.07, gs.heat); }
    P.wcd[s] = P.wmax[s] = cd; gs.n++; gs.mag--; P.gunT = 1.0; P.gunId = id; P.recoil = 0.1; P.atkCd = Math.max(P.atkCd, 0.05);
    if (gs.mag <= 0) { gs.rel = st.reload; Snd.play('reload'); }
    const shot = (o, da, sp) => { const an = base + (da || 0); shootG(Object.assign({ x: mx, y: my, f, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 0.9, dmg: wd(2), shape: 'bullet', col: '#ffe08a', sz: 2, quiet: true }, o)); };
    const pops = (txtv, col) => pop(P.x + 4, P.y - 20, txtv, col);
    const nth = n => gs.n % n === 0;
    const glow = GUN_GLOW[id] || '#ffe08a';
    // muzzle flash, shell casing, kick
    emit(mx, my, 5, { col: ['#fff', glow, '#ffd34e'], sp0: 20, sp1: 90, l0: 0.06, l1: 0.16, grav: 0 });
    if (st.kick > 30) { Q.shake = Math.max(Q.shake, Math.min(0.35, st.kick / 260)); }
    if (st.kick) { P.vx -= f * st.kick * 0.5; }
    if (['flintlock', 'revolver', 'rifle', 'smg', 'burstrifle', 'minigun', 'shotgun'].indexOf(id) >= 0) emit(P.x + 4, P.y + 4, 1, { col: '#ffd34e', sp0: 15, sp1: 40, vx: -f * 30, vy: -70, grav: 420, l0: 0.5, l1: 0.8 });
    switch (id) {
      case 'flintlock': Snd.play('gun'); shot({ dmg: wd(3) }, rr(-0.03, 0.03), 330); emit(mx, my, 4, { col: '#cfd6e6', sp0: 5, sp1: 20, grav: -20, l0: 0.4, l1: 0.8 }); break;
      case 'revolver': { Snd.play('gun'); const gold = gs.mag === 0; shot({ dmg: wd(4) * (gold ? 2 : 1), col: gold ? '#ffd34e' : '#ffe08a', sz: gold ? 3 : 2 }, rr(-0.02, 0.02), 380); if (gold) pops(sv('GOLDEN BULLET', 'ĐẠN VÀNG'), '#ffd34e'); break; }
      case 'rifle': Snd.play('gunheavy'); shot({ dmg: wd(7), pierceN: 1, life: 1.3, col: '#fff6c0' }, 0, 520); break;
      case 'shotgun': Snd.play('shotgun'); for (let i = 0; i < 7; i++) shot({ dmg: wd(2), life: 0.32, col: '#ffd34e' }, rr(-0.24, 0.24), rr(260, 360)); break;
      case 'smg': Snd.play('gun'); shot({ dmg: wd(2), col: '#ffe08a' }, rr(-0.07, 0.07), 350); break;
      case 'burstrifle': for (let i = 0; i < 3; i++) later(i * 0.06, () => { Snd.play('gun'); shot({ dmg: wd(3) }, rr(-0.015, 0.015), 420); }); break;
      case 'flamegun': Snd.play('flame'); shot({ dmg: wd(3), shape: 'fire', burn: 3, life: 0.5, sz: 3, col: '#ff7a2a', trail: '#ffd34e', pierceN: 1 }, rr(-0.1, 0.1), 240); break;
      case 'frostgun': Snd.play('zap'); shot({ dmg: wd(4), shape: 'ice', slow: 3, sz: 3, col: '#8fe0f8', trail: '#bff3ff' }, 0, 310); if (nth(5)) { pops(sv('FREEZE!', 'ĐÓNG BĂNG!'), '#bfefff'); const t = nearestFoe(mx, my, 260); freezeBlast(t ? t.x + t.w / 2 : mx + f * 80, t ? t.y + t.h / 2 : my, 80, wd(5), 4); } break;
      case 'plasma': Snd.play('laser'); shot({ dmg: wd(7), shape: 'orb', col: '#6ee7f2', trail: '#6ee7f2', sz: 3, expl: 30, soft: true }, 0, 280); break;
      case 'teslarifle': { Snd.play('zap'); const t = nearestFoe(P.x + 4, P.y + 6, 300); if (t) { zap(mx, my, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, wd(7), true, true); chainZap(t, wd(4), 3, 100); } else { zap(mx, my, mx + f * 70, my + rr(-14, 14)); } break; }
      case 'grenadel': Snd.play('gunheavy'); shot({ dmg: wd(22), shape: 'grenade', g: 430, life: 1.7, expl: 46, sz: 3, col: '#5fcf5a', trail: '#c8f0a0' }, -0.3 * f, 230); break;
      case 'railgun': Snd.play('rail'); Q.shake = Math.max(Q.shake, 0.3); shot({ dmg: wd(40), shape: 'beam', col: '#9fe8ff', sz: 4, life: 0.5, thru: true, pierceN: 99 }, 0, 1000); emit(mx, my, 14, { col: ['#6ee7f2', '#fff'], sp0: 40, sp1: 160 }); break;
      case 'minigun': Snd.play('gun'); shot({ dmg: wd(2), pierceN: 0, col: '#ffe08a' }, rr(-0.06, 0.06), 430); break;
      case 'voidpistol': Snd.play('zap'); shot({ dmg: wd(10), shape: 'orb', col: '#a15be0', trail: '#7a4cff', sz: 3, hole: true }, 0, 300); break;
      case 'solarcannon': {
        Snd.play('boom'); shot({ dmg: wd(22), shape: 'fire', col: '#ff9a2a', trail: '#ffe08a', sz: 5, expl: 52, burn: 4 }, 0, 230);
        if (nth(5)) { pops(sv('SUN BOLTS', 'TIA NẮNG'), '#ffe08a'); G.flash = Math.max(G.flash || 0, 0.15); for (let i = 0; i < 3; i++) later(i * 0.08, () => shootG({ x: mx, y: my - 6, f, vx: f * 140, vy: -90 + i * 90, home: true, life: 2, dmg: wd(7), shape: 'orb', col: '#ffe08a', trail: '#ff9a2a', sz: 3, burn: 3, quiet: true })); }
        break; }
      case 'judge': {
        Snd.play('thunder'); const t = nearestFoe(P.x + 4, P.y + 6, 320);
        if (t) { const cx = t.x + t.w / 2; zap(cx, Q.cam.y - 6, cx, t.y + t.h / 2); dmgFoe(t, wd(13), true, true); chainZap(t, wd(8), 4, 110); G.flash = Math.max(G.flash || 0, 0.06); } else shot({ dmg: wd(6), shape: 'spark', col: '#ffe44e', sz: 3 }, 0, 380);
        if (nth(6)) { pops(sv('THUNDER NOVA', 'NỔ SẤM'), '#ffe44e'); Snd.play('boom'); nova(P.x + 4, P.y + 7, 140, wd(11)); }
        break; }
      case 'novarifle': {
        Snd.play('laser'); for (const da of [-0.07, 0.07]) shot({ dmg: wd(6), shape: 'star', spin: 14, home: true, col: '#ffe08a', trail: '#8a8aff', sz: 3, life: 1.6 }, da, 240);
        if (nth(3)) { pops(sv('STAR RING', 'VÒNG SAO'), '#ffe08a'); for (let i = 0; i < 8; i++) { const an = i / 8 * 6.283; shootG({ x: P.x + 4, y: P.y + 6, f, vx: Math.cos(an) * 200, vy: Math.sin(an) * 200, life: 0.8, dmg: wd(4), shape: 'star', spin: 12, col: '#ffe08a', thru: true, pierceN: 2, sz: 3, quiet: true }); } }
        if (nth(8)) { pops(sv('SUPERNOVA!', 'SIÊU TÂN TINH!'), '#fff'); Snd.play('explode'); G.flash = Math.max(G.flash || 0, 0.25); addRing(P.x + 4, P.y + 7, '#ffe08a', 150, 0.6); nova(P.x + 4, P.y + 7, 150, wd(20)); }
        break; }
      case 'dragonbreath': {
        Snd.play('flame'); for (let i = 0; i < 6; i++) shot({ dmg: wd(4), shape: 'fire', burn: 4, life: 0.6, sz: 4, col: i % 2 ? '#ff7a2a' : '#ffb02a', trail: '#ffd34e', thru: true, pierceN: 3 }, rr(-0.28, 0.28), rr(200, 290));
        if (nth(5)) { pops(sv('GREAT DRAGON', 'RỒNG LỚN'), '#ff7a2a'); spawnSummon('dragonform', 5, P); }
        if (nth(14)) { pops(sv('DRAGON EMPEROR', 'HOÀNG ĐẾ RỒNG'), '#ffd34e'); spawnSummon('dragonking', 6, P); }
        break; }
      case 'omega': {
        Snd.play('laser'); shot({ dmg: wd(10), shape: 'beam', col: '#d58bff', trail: '#ff4af0', sz: 5, life: 0.55, thru: true, pierceN: 99 }, rr(-0.012, 0.012), 820);
        if (nth(4)) { pops(sv('VOID LIGHTNING', 'SÉT HƯ KHÔNG'), '#d58bff'); const t = nearestFoe(P.x + 4, P.y + 6, 340); if (t) { zap(mx, my, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, wd(9), true, true); chainZap(t, wd(8), 6, 130); } }
        if (nth(10)) { pops(sv('ORBITAL BARRAGE!', 'MƯA TIA QUỸ ĐẠO!'), '#ff4af0'); Snd.play('rail'); for (let i = 0; i < 14; i++) later(0.1 + i * 0.05, () => shootG({ x: Q.cam.x + rr(8, VW - 8), y: Q.cam.y - 8, vx: 0, vy: 640, life: 0.75, dmg: wd(13), shape: 'skybeam', col: '#ff4af0', thru: true, pierceN: 99, sz: 4, quiet: true })); }
        if (nth(25)) { pops(sv('SINGULARITY', 'ĐIỂM KỲ DỊ'), '#7a4cff'); const t = nearestFoe(P.x + 4, P.y + 6, 360), hx = t ? t.x + t.w / 2 : P.x + f * 110, hy = t ? t.y + t.h / 2 : P.y; G.holes.push({ x: hx, y: hy, life: 4, r: 130, tick: 0.12 }); later(4, () => { explode(hx, hy, 100, wd(18)); addRing(hx, hy, '#7a4cff', 130, 0.6); }); }
        break; }
      case 'celestial': {
        Snd.play('laser'); for (const da of [-0.12, 0, 0.12]) shot({ dmg: wd(6), shape: 'orb', home: true, col: '#fff6c0', trail: '#ffd34e', sz: 3, life: 1.6 }, da, 260);
        if (nth(6)) { pops(sv('ARCHANGEL', 'THIÊN THẦN'), '#fff6c0'); spawnSummon('angel', 5, P); }
        if (nth(15)) { pops(sv('SUN EMPEROR', 'HOÀNG ĐẾ MẶT TRỜI'), '#ffe08a'); spawnSummon('sunemperor', 4, P); }
        if (nth(20)) { pops(sv('DIVINE JUDGMENT!', 'PHÁN XÉT THIÊN THẦN!'), '#ffffff'); Snd.play('thunder'); G.flash = Math.max(G.flash || 0, 0.35); Q.shake = Math.max(Q.shake, 0.6); for (const e of foes()) if (e.x > Q.cam.x - 20 && e.x < Q.cam.x + VW + 20 && e.y > Q.cam.y - 20 && e.y < Q.cam.y + VH + 20) { const cx = e.x + e.w / 2; zap(cx, Q.cam.y - 6, cx, e.y + e.h / 2); dmgFoe(e, wd(16), true, true); } healAll(2); }
        break; }
    }
  }
  const healAll = n => { for (const p of allPl()) { const m = p.mhp || maxHP(); if (p.hp < m) p.hp = Math.min(m, p.hp + n); emit(p.x + 4, p.y + 4, 10, { col: ['#fff6c0', '#fff'], sp0: 10, sp1: 50, grav: -30 }); } Snd.play('heart'); };
  // the gun in the hero's hands (shown for a moment after every shot), aimed up or down with the arrow keys
  // a special weapon (bow, staff, ...) the player switched to is shown in the hand like the sword is
  function drawHeldWpn(id, x, bot, f) {
    const k = 'hw_' + id; const sp = _cache[k] || (_cache[k] = paint(20, 20, WPN_PAINT[id], '#14121f'));
    g.save(); g.translate(x + f * 5, bot - 10 + Math.round(Math.sin(Q.t * 5) * 0.6)); g.scale(f, 1); g.drawImage(sp.c, -sp.w / 2, -sp.h / 2); g.restore();
  }
  function drawHeldGun(id, x, bot, f) {
    const P = Q.P, sp = gunSprite(id), dy = act.up ? -0.55 : (act.down ? 0.4 : 0), ang = Math.atan2(dy, 1), rec = Math.max(0, P.recoil || 0) * 36, gl = GUN_GLOW[id];
    if (gl) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x + f * 14, bot - 9, 0, x + f * 14, bot - 9, 22); gr.addColorStop(0, hexA(gl, 0.28)); gr.addColorStop(1, hexA(gl, 0)); g.fillStyle = gr; g.fillRect(x + f * 14 - 22, bot - 31, 44, 44); g.globalCompositeOperation = 'source-over'; }
    g.save(); g.translate(x + f * 3, bot - 9); g.scale(f, 1); g.rotate(ang); g.drawImage(sp.c, -6 - rec, -Math.round(sp.h * 0.55)); g.restore();
  }
  // ===================== OPENING CINEMATIC (about one minute): a peaceful night, the storm, Quoc, the shattered Sun, the chosen hero, the run and the first boss =====================
  const OP_END = 62;   // seconds until the "tap to play" card
  let op = null;
  const ez = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  // captions: [from, to, speaker (n = narrator, q = Quoc, e = Ember), english, vietnamese]
  const OPC = [
    [2.0, 6.6, 'n', 'Aurelia, a kingdom where the light never went out. Tonight, like every night, is calm and peaceful...', 'Aurelia, vương quốc nơi ánh sáng chưa từng tắt. Đêm nay, như mọi đêm, thật yên bình...'],
    [7.0, 12.4, 'n', 'Children laugh in the streets, lanterns glow in every window, and everyone is sure that tomorrow the Sun will rise again.', 'Trẻ con cười đùa khắp phố, đèn lồng sáng trên mọi cửa sổ, và ai cũng tin ngày mai Mặt Trời sẽ lại mọc.'],
    [14.6, 17.2, 'n', 'But then... the sky went dark.', 'Nhưng rồi... bầu trời bỗng tối sầm.'],
    [18.0, 22.6, 'q', 'Little humans... I am QUOC, the Demon King of Shadows!', 'Hỡi loài người bé nhỏ... Ta là QUOC, Quỷ Vương của Bóng Tối!'],
    [23.0, 26.6, 'q', 'Your precious Sun... I will CRUSH it in my hand!', 'Mặt Trời quý giá của các ngươi... ta sẽ BÓP NÁT nó trong tay!'],
    [28.3, 32.0, 'q', 'FROM TONIGHT, THIS WORLD BELONGS TO THE DARK!!!', 'TỪ ĐÊM NAY, THẾ GIỚI NÀY THUỘC VỀ BÓNG TỐI!!!'],
    [33.8, 38.0, 'n', 'In the darkness, one last lantern lit itself... and it chose a boy named Ember.', 'Trong bóng tối, chỉ còn một ngọn đèn cuối cùng tự thắp sáng... và nó chọn một cậu bé tên Ember.'],
    [38.4, 42.0, 'n', 'Ember takes the old sword. His mission: find the seven pieces of the Sun and defeat the Demon King.', 'Ember nhận lấy thanh kiếm cũ. Sứ mệnh của cậu: tìm bảy mảnh Mặt Trời và đánh bại Quỷ Vương.'],
    [43.0, 47.6, 'n', 'Through meadows, forests, deserts and ice, he runs, leaps and fights on...', 'Qua đồng cỏ, rừng sâu, sa mạc và băng giá, cậu chạy, nhảy và chiến đấu không ngừng...'],
    [52.6, 57.5, 'n', 'Each piece of the Sun is guarded by a monster. The first is the Magma Titan!', 'Mỗi mảnh Mặt Trời đều có một quái vật canh giữ. Kẻ đầu tiên: Titan Dung Nham!'],
    [63.0, 67.0, 'q', 'A tiny lantern... dares to challenge ME?', 'Một ngọn đèn bé nhỏ... mà dám thách thức TA sao?'],
    [67.4, 72.0, 'e', 'I will light the Sun again. Even if I am the last flame.', 'Tôi sẽ thắp sáng lại Mặt Trời. Dù tôi là ngọn lửa cuối cùng.']
  ];
  function startOpening() { op = { t: 0, fired: {}, typed: {}, mx: 0 }; Snd.music('title', TITLE_MUSIC); }
  function updateOpening(dt) {
    if (!op) startOpening(); if (op.hold) return; op.t += dt; const t = op.t;
    const fire = (k, at, fn) => { if (t >= at && !op.fired[k]) { op.fired[k] = 1; if (!op.skipped || k === 'm5') fn(); } };
    fire('th1', 14.2, () => Snd.play('thunder')); fire('th2', 15.2, () => Snd.play('thunder')); fire('th3', 16.3, () => Snd.play('thunder')); fire('m2', 17.0, () => Snd.music('devil', DEVIL_MUSIC));
    fire('r1', 18.0, () => Snd.devilRoar(0.8)); fire('crush', 27.0, () => { Snd.play('explode'); Snd.play('thunder'); }); fire('r2', 28.4, () => Snd.devilRoar(1.2));
    fire('m3', 33.4, () => Snd.music('title', TITLE_MUSIC)); fire('lit', 34.6, () => Snd.play('relic')); fire('take', 38.0, () => Snd.play('relic'));
    fire('m4', 42.0, () => Snd.music('boss', BOSS_MUSIC));
    for (const [k, at, s] of [['a1', 43.1, 'slash'], ['a2', 45.5, 'jump'], ['a3', 47.4, 'djump'], ['a4', 49.7, 'dash'], ['a5', 51.6, 'whoosh'], ['b1', 53.3, 'boom'], ['b2', 55.3, 'boom'], ['b3', 56.1, 'dash'], ['b4', 57.0, 'slash'], ['b5', 57.4, 'slash'], ['b6', 57.8, 'slash'], ['b7', 59.2, 'relic'], ['b8', 60.0, 'explode']]) fire(k, at, () => Snd.play(s));
    fire('m5', 62.0, () => Snd.music('title', TITLE_MUSIC));
    // typewriter voice for Quoc / Ember lines
    for (let i = 0; i < OPC.length && !op.skipped; i++) { const c = OPC[i]; if (t >= c[0] && t < c[1] && (c[2] === 'q' || c[2] === 'e')) { const n = Math.floor((t - c[0]) * 32), last = op.typed[i] || 0; if (n > last && n % 2 === 0) Snd.blip(c[2] === 'q' ? 'quoc' : 'ember'); op.typed[i] = n; } }
    if (act.okP || act.atkP || act.backP) {
      if (t < 1.2 && !act.backP) return;
      if (t < OP_END) { op.t = OP_END; op.skipped = true; Snd.play('select'); }
      else if (t > OP_END + 0.6) { Snd.play('ok'); save.seen = { 0: 1 }; writeSave(); startLevelFade(0); }
    }
    if (act.backP && t < OP_END) { op.t = OP_END; op.skipped = true; }
  }
  function openArt() {
    if (UIC.o) return UIC.o;
    const O = { bulbs: [], glows: [] }, W = VW, H = 520, q = mulberry32(8080), [c, x] = mkCanvas(W, H);
    const st = [[0, '#040820'], [0.22, '#0a1648'], [0.42, '#1c2a6a'], [0.58, '#40367a'], [0.64, '#7a4a78']];
    for (let y = 0; y < 340; y++) { const u = y / 340; let i = 0; while (i < st.length - 2 && u > st[i + 1][0]) i++; const a = st[i], b = st[i + 1]; x.fillStyle = lerpColor(a[1], b[1], clamp((u - a[0]) / (b[0] - a[0]), 0, 1)); x.fillRect(0, y, W, 1); }
    for (let i = 0; i < 160; i++) { x.fillStyle = q() < 0.2 ? '#fff' : '#9aa6e8'; x.globalAlpha = 0.3 + q() * 0.7; x.fillRect((q() * W) | 0, (q() * 230) | 0, 1, 1); } x.globalAlpha = 1;
    // the moon
    disc(x, 262, 86, 26, '#e8e4c8'); disc(x, 262, 86, 24, '#f4f0d8'); for (const [dx, dy, r] of [[-8, -6, 5], [7, 5, 6], [-3, 10, 3], [10, -10, 3]]) disc(x, 262 + dx, 86 + dy, r, '#d8d4b4');
    for (const [base, amp, col, rim, sd] of [[272, 18, '#1a2458', '#4a5aa0', 1], [292, 14, '#121a44', '#3a4888', 2], [316, 10, '#0c1234', '#2a3470', 3]]) { const r2 = mulberry32(sd * 71), ph = [r2() * 6, r2() * 6, r2() * 6]; for (let px = 0; px < W; px++) { const y = Math.round(base + Math.sin(px * 0.016 + ph[0]) * amp + Math.sin(px * 0.05 + ph[1]) * amp * 0.45 + Math.sin(px * 0.12 + ph[2]) * 2); x.fillStyle = col; x.fillRect(px, y, 1, 400 - y); x.fillStyle = rim; x.fillRect(px, y, 1, 1); } }
    // the castle on the hill
    x.fillStyle = '#0a1030'; x.fillRect(30, 262, 30, 40); x.fillRect(24, 250, 9, 52); x.fillRect(56, 254, 9, 48); for (let k = 0; k < 4; k++) { x.fillRect(24 + k * 3, 247, 2, 3); x.fillRect(56 + k * 3, 251, 2, 3); }
    x.fillStyle = '#ffd070'; for (const [wx, wy] of [[40, 270], [48, 276], [28, 258], [60, 262], [44, 286]]) x.fillRect(wx, wy, 2, 3);
    x.fillStyle = '#0a1030'; for (let i = 0; i < 14; i++) { const hw = Math.round((1 - i / 14) * 5); x.fillRect(28 + 4 - hw + 0, 247 - i, hw * 2, 1); }
    // the town
    x.fillStyle = '#0a1026'; x.fillRect(0, 392, W, H - 392);
    const hs = []; let hx = -8;
    while (hx < W) { const w = 30 + ((q() * 14) | 0), h = 40 + ((q() * 32) | 0); hs.push({ x: hx, w, h, top: 480 - h, col: ['#3a2a4a', '#2e2a54', '#4a2e44', '#2a3a58'][(q() * 4) | 0], roof: ['#6a2a3a', '#2a4a6a', '#5a3a6a', '#7a4a2a'][(q() * 4) | 0] }); hx += w + 3 + ((q() * 5) | 0); }
    for (const h of hs) {
      x.fillStyle = h.col; x.fillRect(h.x, h.top, h.w, h.h); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(h.x, h.top, 2, h.h); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(h.x + h.w - 2, h.top, 2, h.h);
      const ph = 12 + ((q() * 8) | 0); x.fillStyle = h.roof; for (let i = 0; i < ph; i++) { const hw = Math.round((1 - i / ph) * (h.w / 2 + 4)); x.fillRect(h.x + h.w / 2 - hw, h.top - i, hw * 2, 1); } x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < ph; i++) { const hw = Math.round((1 - i / ph) * (h.w / 2 + 4)); x.fillRect(h.x + h.w / 2 - hw, h.top - i, 1, 1); }
      if (q() < 0.6) { x.fillStyle = '#241830'; x.fillRect(h.x + h.w - 9, h.top - ph + 2, 5, 12); }
      const cols = Math.max(1, Math.floor(h.w / 12)), rows = Math.max(1, Math.floor((h.h - 14) / 18));
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const wx = h.x + 4 + k * 12, wy = h.top + 6 + r * 18, lit = q() < 0.85; x.fillStyle = '#14101e'; x.fillRect(wx - 1, wy - 1, 8, 11); x.fillStyle = lit ? '#ffd070' : '#2a2438'; x.fillRect(wx, wy, 6, 9); if (lit) { x.fillStyle = '#ffe9a8'; x.fillRect(wx, wy, 6, 3); x.fillStyle = '#7a4a1a'; x.fillRect(wx + 3, wy, 1, 9); x.fillRect(wx, wy + 4, 6, 1); O.glows.push({ x: wx + 3, y: wy + 4 }); } }
      x.fillStyle = '#1a1020'; x.fillRect(h.x + h.w / 2 - 3, 468, 7, 12); x.fillStyle = '#ffd070'; x.fillRect(h.x + h.w / 2 + 2, 473, 1, 1);
    }
    for (let i = 0; i < hs.length - 1; i++) { const a = hs[i], b = hs[i + 1], ax = a.x + a.w / 2, bx = b.x + b.w / 2, ay = a.top - 4, by = b.top - 4;
      for (let k = 0; k <= 9; k++) { const u = k / 9, px = ax + (bx - ax) * u, py = ay + (by - ay) * u + Math.sin(u * Math.PI) * 9; x.fillStyle = '#1a1020'; x.fillRect(Math.round(px), Math.round(py), 1, 1); if (k % 2) { const col = ['#ff6a4a', '#ffd34e', '#6ee7f2', '#ff7fb0', '#a4e86b'][(i + k) % 5]; x.fillStyle = col; x.fillRect(Math.round(px) - 1, Math.round(py) + 1, 3, 3); O.bulbs.push({ x: px, y: py + 2, col }); } } }
    // street, lamp posts and the festival lantern pole
    x.fillStyle = '#1e1a2e'; x.fillRect(0, 480, W, 40); x.fillStyle = '#3a3454'; x.fillRect(0, 480, W, 2); x.fillStyle = '#16121f'; for (let i = 0; i < 90; i++) x.fillRect((q() * W) | 0, 486 + ((q() * 30) | 0), 4 + ((q() * 6) | 0), 1);
    for (const lx of [50, 130, 262, 350]) { x.fillStyle = '#1a1424'; x.fillRect(lx, 440, 2, 40); x.fillRect(lx - 2, 438, 6, 3); x.fillStyle = '#ffd070'; x.fillRect(lx - 1, 432, 4, 6); x.fillStyle = '#fff6c0'; x.fillRect(lx, 433, 2, 2); O.glows.push({ x: lx + 1, y: 435, big: 1 }); }
    x.fillStyle = '#3a2418'; x.fillRect(190, 410, 3, 70); x.fillRect(174, 410, 36, 2); for (let i = 0; i < 6; i++) { const lx = 176 + i * 6, col = ['#e0453a', '#ff9a2a', '#ffd34e', '#e0453a', '#ff9a2a', '#ffd34e'][i]; x.fillStyle = '#3a2418'; x.fillRect(lx, 412, 1, 4 + (i % 2) * 3); disc(x, lx, 421 + (i % 2) * 3, 3, col); O.glows.push({ x: lx, y: 421 + (i % 2) * 3, big: 1 }); }
    O.stars = []; for (let i = 0; i < 40; i++) O.stars.push({ x: (q() * W) | 0, y: (q() * 220) | 0, v: 1 + q() * 3, p: q() * 6 });
    O.flies = []; for (let i = 0; i < 18; i++) O.flies.push({ x: q() * W, y: 400 + q() * 70, p: q() * 6, r: 8 + q() * 16 });
    O.kids = [{ x: 60, r: 70, v: 1.6, p: 0, sw: { a: '#ffd0a0', A: '#e0905a', q: '#8a5a30', b: '#ff7fb0', r: '#ff7fb0' } }, { x: 100, r: 60, v: 1.9, p: 1.2, sw: { a: '#a4e86b', A: '#5fcf5a', q: '#2b8a3e', b: '#ffd34e', r: '#6ee7f2' } }, { x: 270, r: 80, v: 1.4, p: 2.1, sw: { a: '#ffe0a0', A: '#e0a040', q: '#8a5a30', b: '#6ee7f2', r: '#e0453a' } }, { x: 310, r: 50, v: 2.1, p: 3.3, sw: { a: '#d8b8ff', A: '#a15be0', q: '#5a2d8f', b: '#ffd34e', r: '#ffd34e' } }];
    O.world = c; return (UIC.o = O);
  }
  const OPW = { camY: 0 };
  // stateless helpers: a spark burst that depends only on time
  function opBurst(x, y, t0, t, n, seed, speed, life, cols, gr) { const age = t - t0; if (age < 0 || age > life) return; for (let i = 0; i < n; i++) { const a = i * 2.399 + seed, sp = speed * (0.35 + ((i * 37 + seed * 13) % 10) / 10 * 0.85); g.globalAlpha = 1 - age / life; g.fillStyle = cols[i % cols.length]; g.fillRect(Math.round(x + Math.cos(a) * sp * age), Math.round(y + Math.sin(a) * sp * age + (gr === undefined ? 90 : gr) * age * age), 2, 2); } g.globalAlpha = 1; }
  function opSlash(x, y, dir, k, big) { if (k <= 0 || k >= 1) return; const R = (big ? 38 : 22), a0 = -1.6 * dir, sweep = 3.1 * ez(Math.min(1, k * 1.6)); g.save(); g.translate(x, y); g.scale(dir, 1); g.globalCompositeOperation = 'lighter'; for (let w = 0; w < 3; w++) { g.strokeStyle = w === 0 ? 'rgba(255,230,160,' + (0.9 * (1 - k)) + ')' : 'rgba(255,170,60,' + (0.4 * (1 - k)) + ')'; g.lineWidth = w === 0 ? 2 : 5 - w; g.beginPath(); g.arc(0, 0, R + w * 2, -1.6, -1.6 + sweep); g.stroke(); } g.restore(); g.globalCompositeOperation = 'source-over'; }
  function opBars() { g.fillStyle = '#000'; g.fillRect(0, 0, VW, 16); g.fillRect(0, VH - 22, VW, 22); }
  function opLightning(t, t0, seed) { const age = t - t0; if (age < 0 || age > 0.5) return; const r = mulberry32(seed), bx = 60 + r() * 260; g.globalAlpha = 1 - age * 2; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); let px = bx, py = -10; g.moveTo(px, py); for (let i = 0; i < 9; i++) { px += (r() - 0.5) * 36; py += 26; g.lineTo(px, py); } g.stroke(); g.strokeStyle = 'rgba(160,200,255,.6)'; g.lineWidth = 6; g.stroke(); g.globalAlpha = 0.5 * (1 - age * 2); g.fillStyle = '#dfe8ff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
  function drawOpening() {
    if (!op) startOpening(); const t = op.t, O = openArt(); let shake = 0;
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    const person = (spr, x, y, flip, sc) => drawSpr(g, spr, Math.round(x), Math.round(y), flip, false, sc || 1, sc || 1);
    if (t < 33) {
      // ---------- the town, the storm and the Demon King ----------
      const camY = t < 3 ? 0 : (t < 12 ? 304 * ez((t - 3) / 9) : (t < 15 ? 304 : 304 - 264 * ez((t - 15) / 2.2)));
      const storm = ez(seg(t, 13.6, 16.5)), black = ez(seg(t, 30.4, 32.6));
      if (t < 18.6) {
        g.drawImage(O.world, 0, -Math.round(camY));
        for (const s of O.stars) { g.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * s.v + s.p))) * (1 - storm); g.fillStyle = '#fff'; g.fillRect(s.x, s.y - Math.round(camY), 1, 1); } g.globalAlpha = 1;
        { const my = 86 - camY; g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(262, my, 10, 262, my, 110); mg.addColorStop(0, 'rgba(220,230,255,' + 0.38 * (1 - storm) + ')'); mg.addColorStop(1, 'rgba(120,140,255,0)'); g.fillStyle = mg; g.fillRect(150, my - 110, 220, 220); g.globalCompositeOperation = 'source-over'; }
        // warm glows of windows, lanterns and festival bulbs (they gutter out when the storm arrives)
        g.globalCompositeOperation = 'lighter'; const lit = 1 - ez(seg(t, 14.0, 16.6));
        for (const w of O.glows) { const wy = w.y - camY; if (wy < -20 || wy > VH + 20) continue; const r = w.big ? 22 : 9, fl = 0.85 + Math.sin(t * 7 + w.x) * 0.15; const gr = g.createRadialGradient(w.x, wy, 0, w.x, wy, r); gr.addColorStop(0, 'rgba(255,200,100,' + 0.4 * lit * fl + ')'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(w.x - r, wy - r, r * 2, r * 2); }
        for (const b of O.bulbs) { const wy = b.y - camY; if (wy < -4 || wy > VH + 4) continue; g.globalAlpha = (0.5 + 0.5 * Math.sin(t * 4 + b.x)) * lit; g.fillStyle = b.col; g.fillRect(Math.round(b.x) - 2, Math.round(wy) - 2, 5, 5); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        // chimney smoke and fireflies
        for (let i = 0; i < 7; i++) { const u = ((t * 0.25 + i / 7) % 1); g.globalAlpha = (1 - u) * 0.18; g.fillStyle = '#9aa0c8'; const sx = 40 + i * 52, sy = 380 - camY - u * 40; g.fillRect(Math.round(sx + Math.sin(u * 6 + i) * 4), Math.round(sy), 4, 3); } g.globalAlpha = 1;
        for (const f of O.flies) { const fx = f.x + Math.sin(t * 0.8 + f.p) * f.r, fy = f.y - camY + Math.cos(t * 1.1 + f.p) * 5; if (fy < 0 || fy > VH) continue; g.globalAlpha = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + f.p)); g.fillStyle = '#ffe066'; g.fillRect(Math.round(fx), Math.round(fy), 2, 2); } g.globalAlpha = 1;
        // the people: kids chase each other, neighbours chat, until the sky goes dark
        const frozen = t >= 14.2, by = 480 - camY;
        if (by < VH + 30) {
          O.kids.forEach((k, i) => { const px = k.x + Math.sin(t * k.v + k.p) * k.r, vx = Math.cos(t * k.v + k.p), fr = frozen ? 0 : Math.floor(t * 11 + i) % 4; person(frozen ? getSprite('hero_idle', k.sw, 0) : getSprite('hero_run', k.sw, fr), px, by + 1, frozen ? false : vx < 0, 0.78); if (frozen) { g.fillStyle = '#fff'; g.fillRect(Math.round(px) - 1, Math.round(by - 24), 2, 2); } else if (Math.sin(t * 3 + i) > 0.92) { g.fillStyle = '#ffe9a8'; g.fillRect(Math.round(px) + 4, Math.round(by - 20), 3, 3); } });
          person(npcSpr('npc_lila'), 112, by + 1, false); person(npcSpr('npc_bram'), 130, by + 1, true); person(npcSpr('npc_gob'), 232, by + 1, true);
          if (!frozen) { if (Math.sin(t * 5) > 0) { g.fillStyle = '#fff'; g.fillRect(118, Math.round(by - 24), 8, 5); g.fillStyle = '#14121f'; g.fillRect(120, Math.round(by - 22), 1, 1); g.fillRect(122, Math.round(by - 22), 1, 1); g.fillRect(124, Math.round(by - 22), 1, 1); } }
          else { for (const x of [112, 130, 232]) { g.fillStyle = '#fff'; g.fillRect(x - 1, Math.round(by - 28), 2, 3); g.fillRect(x - 1, Math.round(by - 24), 2, 1); } }
        }
        // the storm rolls in
        if (storm > 0) { g.globalAlpha = 0.82 * storm; g.fillStyle = '#10062a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
        if (t > 14.0) { g.strokeStyle = 'rgba(180,200,255,.5)'; g.lineWidth = 1; const n = Math.round(60 * storm); for (let i = 0; i < n; i++) { const rx = (i * 53 + t * 260) % (VW + 40) - 20, ry = (i * 97 + t * 400) % (VH + 20) - 10; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 4, ry + 9); g.stroke(); } }
        // dark red storm clouds drift over everything
        if (storm > 0) for (let i = 0; i < 12; i++) { const cx = ((i * 71 + t * (6 + i)) % (VW + 160)) - 80, cy = 14 + (i % 4) * 16 - Math.max(0, camY - 40) * 0.2; g.globalAlpha = 0.5 * storm; g.fillStyle = i % 2 ? '#2a0a3a' : '#3a0a22'; g.fillRect(Math.round(cx), Math.round(cy), 90, 12); g.fillRect(Math.round(cx + 14), Math.round(cy - 8), 60, 10); } g.globalAlpha = 1;
      }
      if (t >= 14) { opLightning(t, 14.2, 3); opLightning(t, 15.2, 11); opLightning(t, 16.3, 29); }
      if (t >= 16.6) {
        // Quoc's face fills the storm
        const k = ez(seg(t, 16.8, 19.4)), roar = t > 28.2, zoom = 1.15 + 0.2 * seg(t, 17, 32) + (roar ? 0.12 : 0), qi = typeof QUOC_IMG !== 'undefined' && (roar ? QUOC_IMG.portrait_roar : QUOC_IMG.portrait_smirk);
        g.globalAlpha = clamp((t - 16.6) / 1.6, 0, 1); g.fillStyle = '#12041c'; g.fillRect(0, 0, VW, VH);
        for (let i = 0; i < 14; i++) { const cx = ((i * 83 + t * (10 + i * 2)) % (VW + 200)) - 100, cy = 20 + (i % 5) * 38; g.globalAlpha = 0.35 * clamp((t - 16.6) / 1.6, 0, 1); g.fillStyle = i % 3 ? '#3a0a30' : '#220a40'; g.fillRect(Math.round(cx), Math.round(cy), 130, 20); g.fillRect(Math.round(cx + 20), Math.round(cy - 10), 80, 14); } g.globalAlpha = 1;
        { const sx = roar ? Math.round(Math.sin(t * 60) * 2) : 0, sy = roar ? Math.round(Math.cos(t * 55) * 2) : 0; shake = roar ? 1 : 0;
          g.globalAlpha = k; if (qi) { const w = qi.w * zoom * 1.25, h = qi.h * zoom * 1.25; g.drawImage(qi.c, Math.round(VW / 2 - w / 2) + sx, Math.round(VH / 2 - h / 2 + 8) + sy, Math.round(w), Math.round(h)); } else { const sp = npcSpr('npc_quoc'); g.drawImage(sp.c, Math.round(VW / 2 - sp.w * 4) + sx, Math.round(VH / 2 - sp.h * 4) + sy, sp.w * 8, sp.h * 8); }
          g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; const eg = g.createRadialGradient(VW / 2, VH / 2 - 10, 0, VW / 2, VH / 2 - 10, 150); eg.addColorStop(0, 'rgba(255,40,60,' + 0.28 * k * (0.7 + Math.sin(t * 5) * 0.3) + ')'); eg.addColorStop(1, 'rgba(255,40,60,0)'); g.fillStyle = eg; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; }
        // the Sun, crushed in his fist
        if (t > 23.2 && t < 31) { const gt = t - 23.2, r = 4 + 16 * ez(seg(t, 23.4, 26.9)) + Math.sin(t * 14) * 1.2, cx = VW / 2 + 58, cy = 150;
          if (t < 27) { g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2); sg.addColorStop(0, 'rgba(255,230,140,.95)'); sg.addColorStop(0.4, 'rgba(255,170,60,.45)'); sg.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = sg; g.fillRect(cx - r * 3.2, cy - r * 3.2, r * 6.4, r * 6.4); g.globalCompositeOperation = 'source-over'; disc(g, Math.round(cx), Math.round(cy), Math.round(r), '#ffe9a8'); disc(g, Math.round(cx), Math.round(cy), Math.round(r * 0.7), '#fff6d0'); }
          else { const sa = t - 27; g.globalAlpha = Math.max(0, 0.9 - sa * 2.4); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.2832 + 0.4, d = 160 * ez(Math.min(1, sa / 2.2)), px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * 0.7; g.globalAlpha = clamp(1 - (sa - 1.6) / 1.6, 0, 1); g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(px, py, 0, px, py, 22); sg.addColorStop(0, 'rgba(255,220,120,.9)'); sg.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = sg; g.fillRect(px - 22, py - 22, 44, 44); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffe9a8'; g.fillRect(Math.round(px) - 3, Math.round(py) - 5, 6, 10); g.fillRect(Math.round(px) - 5, Math.round(py) - 3, 10, 6); g.fillStyle = '#fff'; g.fillRect(Math.round(px) - 1, Math.round(py) - 2, 3, 4); } g.globalAlpha = 1; } }
        opLightning(t, 20.6, 41); opLightning(t, 24.4, 53); opLightning(t, 28.2, 67); opLightning(t, 29.6, 71);
      }
      if (black > 0) { g.globalAlpha = black; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t < 3) { g.globalAlpha = 1 - ez(t / 2.4); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 42.2) {
      // ---------- the last lantern chooses Ember ----------
      const lt = t - 33.4, camY = 304, zoom = 1 + 0.18 * ez(lt / 8);
      g.save(); g.translate(VW / 2, VH / 2); g.scale(zoom, zoom); g.translate(-VW / 2 - 24 * ez(lt / 8), -VH / 2); g.drawImage(O.world, 0, -camY); g.restore();
      g.fillStyle = 'rgba(2,3,10,.93)'; g.fillRect(0, 0, VW, VH);
      const lantY = 70 + (t > 34.6 ? 0 : 0), arrive = ez(seg(t, 35.0, 37.0)), lx = VW / 2 + 10, hx = 230, hy = 178, glowK = ez(seg(t, 34.0, 35.2)), fx = lx + (hx + 8 - lx) * arrive, fy = lantY + (hy - 36 - lantY) * arrive + Math.sin(t * 3) * 3 * (1 - arrive);
      g.globalCompositeOperation = 'lighter'; const lg3 = g.createRadialGradient(fx, fy, 0, fx, fy, 60 + 90 * arrive); lg3.addColorStop(0, 'rgba(255,200,110,' + 0.8 * glowK + ')'); lg3.addColorStop(0.5, 'rgba(255,150,60,' + 0.3 * glowK + ')'); lg3.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lg3; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
      person(npcSpr('npc_lila'), 156, 180, false, 1.5); person(getSprite('hero_idle', {}, Math.floor(t * 2.5) % 2), hx, hy + 2, true, 2);
      if (glowK > 0) { g.save(); g.translate(Math.round(fx), Math.round(fy)); g.scale(3 - arrive * 0.8, 3 - arrive * 0.8); g.translate(-Math.round(fx), -Math.round(fy)); lanternIc(Math.round(fx), Math.round(fy), glowK); g.restore(); }
      // Lila hands over the old sword
      { const sw = swordSprite('iron'), u = ez(seg(t, 38.0, 39.6)), sx = 172 + (hx - 20 - 172) * u, sy = 160 - 6 * Math.sin(u * 3.14); if (t > 37.2 && t < 42.2) { g.save(); g.translate(sx, sy); g.rotate(-0.8 + u * 0.5); g.drawImage(sw.c, -2, -sw.h / 2); g.restore(); } }
      opBurst(fx, fy, 35.0, t, 14, 3, 40, 1.2, ['#ffe9a8', '#ffd34e'], -20); opBurst(hx, hy - 20, 37.0, t, 22, 5, 70, 1.4, ['#fff6c0', '#ffd34e', '#ff9a2a'], -10);
      if (t < 34.2) { g.globalAlpha = 1 - ez((t - 33.4) / 0.8); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 62) {
      const rt = t - 42.2;
      if (rt < 10.0) {
        // ---------- the run: five quick cuts across the lands ----------
        const CUT = [[0, 0, 2.0], [1, 2.0, 4.2], [3, 4.2, 6.4], [4, 6.4, 8.4], [5, 8.4, 10.0]];
        const cu = CUT.find(c => rt >= c[1] && rt < c[2]) || CUT[4], lt = rt - cu[1], dur = cu[2] - cu[1], speed = 150, camX = lt * speed + cu[0] * 400;
        const gy = drawBgOnly(cu[0], camX, t), ts = tiles(cu[0]), sx0 = 96, ox = at => sx0 + (at - lt) * speed;
        let hyj = 0, pose = 'run', sc = 1.9, dashT = -1;
        const arc = (a, b, h) => (lt > a && lt < b) ? Math.sin((lt - a) / (b - a) * Math.PI) * h : 0;
        if (cu[0] === 0) { if (lt > 1.15 && lt < 1.55) pose = 'slash'; if (lt < 1.2) { const x = ox(1.2); drawSpr(g, getSprite('slime', {}, Math.floor(lt * 5) % 2), Math.round(x), gy + 2, true, false, 1.7, 1.7); } else { opBurst(sx0 + 22, gy - 12, 1.2, lt, 18, 2, 60, 0.7, ['#a4e86b', '#5fcf5a', '#fff']); } opSlash(sx0 + 12, gy - 16, 1, (lt - 1.15) / 0.35, false); }
        else if (cu[0] === 1) { hyj = arc(0.8, 1.55, 36); if (hyj > 0) pose = 'jump'; const sp = Math.min(1, lt / 1.0), x = ox(1.2); g.strokeStyle = 'rgba(220,230,220,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(x), 0); g.lineTo(Math.round(x), Math.round(gy - 60 + 62 * sp)); g.stroke(); drawSpr(g, getSprite('spider', {}, Math.floor(lt * 6) % 2), Math.round(x), Math.round(gy - 58 + 60 * sp), false, false, 1.7, 1.7); if (lt > 1.6) opBurst(sx0 - 20, gy - 4, 1.6, lt, 8, 7, 40, 0.5, ['#cfd6e6', '#8a8aa0']); }
        else if (cu[0] === 3) { hyj = arc(0.9, 1.9, 40); if (hyj > 0) pose = 'jump'; const x = ox(1.3); for (let i = 0; i < 5; i++) g.drawImage(ts.spike, Math.round(x - 40 + i * 16), gy - 14); if (lt > 1.35 && lt < 1.65) { g.strokeStyle = 'rgba(160,240,255,' + (1 - (lt - 1.35) / 0.3) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(sx0, gy - 40, 6 + (lt - 1.35) * 60, 0, 6.28); g.stroke(); } }
        else if (cu[0] === 4) { dashT = lt > 1.0 && lt < 1.7 ? (lt - 1.0) / 0.7 : -1; for (let i = 0; i < 4; i++) { const x = VW + 30 - (lt - 0.1 * i) * 330 + i * 70; if (lt > 0.1 * i && Math.abs(x - sx0) > 4 || lt < 1.0) { g.fillStyle = '#bfefff'; g.fillRect(Math.round(x), Math.round(gy - 22 - (i % 2) * 14), 14, 3); g.fillStyle = '#fff'; g.fillRect(Math.round(x), Math.round(gy - 21 - (i % 2) * 14), 6, 1); } } }
        else { hyj = arc(1.0, 1.9, 34); if (hyj > 0) pose = 'jump'; const gx = ox(1.45); g.fillStyle = '#ff5a1a'; g.fillRect(Math.round(gx - 34), gy, 68, VH - gy); g.fillStyle = '#ffd34e'; g.fillRect(Math.round(gx - 34), gy, 68, 2); for (let i = 0; i < 4; i++) { const fx = VW - ((lt * 0.8 + i * 0.35) % 1.4) * 280, fy = 30 + i * 18 + Math.sin(lt * 6 + i) * 6; disc(g, Math.round(fx), Math.round(fy), 4, '#ff7a2a'); disc(g, Math.round(fx), Math.round(fy), 2, '#ffe9a8'); } }
        const hy = gy + 2 - Math.round(hyj), flip = false;
        if (dashT >= 0) for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.18 * (5 - i); drawSpr(g, getSprite('hero_run', {}, Math.floor((lt + i * 0.03) * 12) % 4), sx0 - i * 14, hy, flip, false, sc, sc); } g.globalAlpha = 1;
        drawSpr(g, pose === 'jump' ? getSprite('hero_jump', {}, 0) : getSprite('hero_run', {}, Math.floor(lt * 14) % 4), sx0, hy, flip, false, sc, sc);
        { g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(sx0 + 16, hy - 20, 0, sx0 + 16, hy - 20, 40); gl.addColorStop(0, 'rgba(255,190,90,.35)'); gl.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gl; g.fillRect(sx0 - 24, hy - 60, 80, 80); g.globalCompositeOperation = 'source-over'; }
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 9; i++) { const yy = 24 + i * 15 + (lt * 90 + i * 17) % 11, xx = (VW - ((lt * 520 + i * 91) % (VW + 60))); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 26, yy); g.stroke(); }
        if (lt < 0.1) { g.globalAlpha = 0.9 * (1 - lt / 0.1); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
        if (rt < 0.7) { g.globalAlpha = 1 - rt / 0.7; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      } else {
        // ---------- the first boss: the Magma Titan ----------
        const bt = rt - 10.0, gy = drawBgOnly(5, 40 + bt * 5, t), bs = bossSprite(5), rise = ez(bt / 1.1), bsc = 2.7, bx = 300, hx0 = 96;
        let hhx = hx0, hyj = 0, pose = 'idle', bflash = 0, hit = 0;
        const arc = (a, b, h) => (bt > a && bt < b) ? Math.sin((bt - a) / (b - a) * Math.PI) * h : 0;
        if (bt < 1.0) shake = 1.5 * (1 - bt);
        const bossY = gy + 8 + (1 - rise) * 120;
        // the molten arena
        g.fillStyle = 'rgba(255,90,20,.12)'; g.fillRect(0, gy - 30, VW, 40);
        // titan's attacks: ground slam, then a flame breath
        const wave = bt > 1.7 && bt < 2.9 ? (bt - 1.7) / 1.2 : -1, breathT = bt > 3.1 && bt < 4.0 ? (bt - 3.1) / 0.9 : -1;
        if (wave >= 0) { const wx = bx - 40 - wave * 240; g.fillStyle = '#ff7a2a'; g.fillRect(Math.round(wx), gy - 14, 12, 14); g.fillStyle = '#ffe9a8'; g.fillRect(Math.round(wx) + 3, gy - 10, 6, 10); if (wave < 0.1) shake = 2; }
        if (breathT >= 0) { for (let i = 0; i < 14; i++) { const u = (breathT * 1.4 + i / 14) % 1, fx = bx - 50 - u * 190, fy = gy - 34 + Math.sin(i * 2 + bt * 14) * 6 + u * 20; g.globalAlpha = 1 - u * 0.7; disc(g, Math.round(fx), Math.round(fy), 5 - Math.round(u * 3), i % 2 ? '#ff7a2a' : '#ffd34e'); } g.globalAlpha = 1; }
        // the hero: jumps the wave, dashes under the flames, then charges and fights
        hyj = arc(1.9, 2.8, 30); if (hyj > 0) pose = 'jump';
        const dash = bt > 3.2 && bt < 3.9; if (bt > 4.0 && bt < 5.9) hhx = hx0 + 140 * ez((bt - 4.0) / 0.5) ; if (bt >= 5.9) hhx = hx0 + 140;
        const combo = bt > 4.6 && bt < 6.2 ? Math.floor((bt - 4.6) / 0.27) : -1; if (combo >= 0) { pose = 'slash'; hit = ((bt - 4.6) % 0.27) / 0.27; bflash = hit < 0.3 ? 1 : 0; }
        const charge = ez(seg(bt, 6.2, 7.6)), megaT = bt - 7.6;
        // the boss drawn (shake when hit, redden when enraged, split on the final cut)
        const bshake = (bflash ? Math.round(Math.sin(bt * 90) * 2) : 0);
        const dead = bt > 8.4;
        if (!dead) { g.save(); if (bt > 6.0) { g.globalAlpha = 1; } drawSpr(g, bs, Math.round(bx + bshake), Math.round(bossY), true, bflash > 0, bsc, bsc); g.restore(); if (bt > 6.0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,60,20,.25)'; g.fillRect(bx - 80, gy - 150, 160, 160); g.globalCompositeOperation = 'source-over'; } }
        else { const sp = (bt - 8.4); const half = (dir) => { g.save(); g.beginPath(); g.moveTo(bx - 90, gy - 150); g.lineTo(bx + 90, gy - 150); g.lineTo(bx + 90, gy + 20); g.lineTo(bx - 90, gy + 20); g.clip(); g.restore(); };
          g.globalAlpha = clamp(1 - sp / 0.45, 0, 1); drawSpr(g, bs, Math.round(bx + sp * 24), Math.round(bossY - sp * 10), true, true, bsc, bsc); g.globalAlpha = 1; opBurst(bx, gy - 60, 8.4, bt, 60, 9, 150, 1.4, ['#ff7a2a', '#ffd34e', '#fff', '#ff3a1a'], 140); if (sp < 0.5) { g.globalCompositeOperation = 'lighter'; const eg = g.createRadialGradient(bx, gy - 60, 0, bx, gy - 60, 40 + sp * 300); eg.addColorStop(0, 'rgba(255,230,160,' + (0.9 - sp) + ')'); eg.addColorStop(1, 'rgba(255,100,30,0)'); g.fillStyle = eg; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; shake = 2; } }
        // health bar
        const hp = bt < 4.6 ? 1 : (bt < 6.2 ? 1 - 0.6 * (bt - 4.6) / 1.6 : (bt < 8.4 ? 0.4 : 0)); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(70, 22, 244, 8); g.fillStyle = '#3a0a0a'; g.fillRect(72, 24, 240, 4); g.fillStyle = '#e0453a'; g.fillRect(72, 24, Math.round(240 * hp), 4); txt(sv('MAGMA TITAN', 'TITAN DUNG NHAM'), VW / 2, 20, { al: 'center', size: 6, bold: true, col: '#ffd0a0' });
        // the hero
        const hyy = gy + 2 - Math.round(hyj), run = bt > 4.0 && bt < 4.5;
        if (dash) for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.17 * (5 - i); drawSpr(g, getSprite('hero_run', {}, 0), hhx - i * 16, hyy, false, false, 1.9, 1.9); } g.globalAlpha = 1;
        if (megaT > 0 && megaT < 0.8) { const u = ez(megaT / 0.5), mx = hhx + (bx - 60 - hhx) * u, my = gy - 8 - Math.sin(u * 3.14) * 60; for (let i = 4; i >= 1; i--) { g.globalAlpha = 0.16 * (5 - i); drawSpr(g, getSprite('hero_jump', {}, 0), mx - i * 12, my + 2, false, false, 1.9, 1.9); } g.globalAlpha = 1; drawSpr(g, getSprite('hero_jump', {}, 0), mx, my + 2, false, false, 1.9, 1.9);
          if (megaT > 0.45) { g.fillStyle = '#fff'; g.save(); g.translate(bx, gy - 70); g.rotate(-0.7); g.fillRect(-120, -1, 240, 3); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,140,.6)'; g.fillRect(-120, -4, 240, 9); g.restore(); g.globalCompositeOperation = 'source-over'; } }
        else if (!dead || megaT > 0.8) drawSpr(g, pose === 'jump' ? getSprite('hero_jump', {}, 0) : (pose === 'slash' || dash || run ? getSprite('hero_run', {}, Math.floor(bt * 14) % 4) : getSprite('hero_idle', {}, Math.floor(t * 2.5) % 2)), hhx + (dead ? 70 : 0), hyy, false, false, 1.9, 1.9);
        if (combo >= 0) { opSlash(hhx + 14, gy - 18, 1, hit, false); if (hit < 0.35) opBurst(bx - 70, gy - 30 - (combo % 3) * 10, bt - hit * 0.27, bt, 12, combo, 80, 0.4, ['#fff', '#ffd34e', '#ff7a2a']); }
        // charging the final blow: the lantern flares and the world holds its breath
        if (bt > 6.2 && bt < 7.8) { g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(hhx + 12, gy - 24, 0, hhx + 12, gy - 24, 20 + charge * 90); cg.addColorStop(0, 'rgba(255,240,180,' + 0.75 * charge + ')'); cg.addColorStop(1, 'rgba(255,180,60,0)'); g.fillStyle = cg; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(0,0,0,' + 0.35 * charge + ')'; g.fillRect(0, 0, VW, 36); g.fillRect(0, VH - 60, VW, 60); }
        if (megaT > 0.35 && megaT < 0.6) { g.globalAlpha = 0.95; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
        // the golden shard flies to the hero, and the light returns
        if (bt > 8.9) { const u = ez(seg(bt, 8.9, 9.7)), sx = bx + (hhx + 80 - bx) * u, sy = gy - 90 + (gy - 40 - (gy - 90)) * u - Math.sin(u * 3.14) * 40; g.globalCompositeOperation = 'lighter'; const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 22); sg.addColorStop(0, 'rgba(255,230,140,.95)'); sg.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = sg; g.fillRect(sx - 22, sy - 22, 44, 44); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffe9a8'; g.fillRect(Math.round(sx) - 2, Math.round(sy) - 4, 5, 8); g.fillStyle = '#fff'; g.fillRect(Math.round(sx), Math.round(sy) - 2, 1, 4); }
        if (bt > 9.6) { g.globalAlpha = ez(seg(bt, 9.6, 10.0)); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      }
    }
    if (t >= 62) {
      // ---------- the end card ----------
      const et = t - 62, k = ez(et / 1.2);
      const sg = g.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, '#0a0418'); sg.addColorStop(0.55, '#3a1050'); sg.addColorStop(0.85, '#a03a50'); sg.addColorStop(1, '#ff9a4a'); g.fillStyle = sg; g.fillRect(0, 0, VW, VH);
      g.globalCompositeOperation = 'lighter'; const cg = g.createRadialGradient(VW / 2, 56, 8, VW / 2, 56, 130); cg.addColorStop(0, 'rgba(255,170,70,.5)'); cg.addColorStop(1, 'rgba(255,100,40,0)'); g.fillStyle = cg; g.fillRect(0, 0, VW, 150); g.globalCompositeOperation = 'source-over';
      disc(g, VW / 2, 56, 26, '#ffcf80'); disc(g, VW / 2 + 3, 58, 25, '#0a0414');
      for (let px = 0; px < VW; px++) { const y = Math.round(150 + Math.sin(px * 0.02) * 10 + Math.sin(px * 0.06) * 4); g.fillStyle = '#12081e'; g.fillRect(px, y, 1, VH - y); }
      g.fillStyle = '#0a0414'; g.fillRect(262, 108, 30, 50); g.fillRect(256, 98, 10, 60); g.fillRect(288, 102, 10, 56); for (let i = 0; i < 12; i++) { const hw = Math.round((1 - i / 12) * 5); g.fillRect(261 - hw, 98 - i, hw * 2, 1); }
      g.fillStyle = '#ff3a3a'; for (const [dx, dy] of [[270, 118], [276, 126]]) g.fillRect(dx, dy, 2, 3);
      const flick = 0.7 + Math.sin(t * 9) * 0.1; g.fillStyle = '#05020c'; g.fillRect(0, 168, VW, VH - 168);
      g.globalCompositeOperation = 'lighter'; const hg = g.createRadialGradient(110, 168, 0, 110, 168, 70); hg.addColorStop(0, 'rgba(255,190,90,' + 0.5 * flick + ')'); hg.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = hg; g.fillRect(30, 100, 160, 100); g.globalCompositeOperation = 'source-over';
      person(getSprite('hero_idle', {}, Math.floor(t * 2.5) % 2), 110, 172, false, 2);
      g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 2)); g.fillStyle = '#ff2a3a'; g.fillRect(200, 36, 12, 3); g.fillRect(236, 36, 12, 3); g.globalAlpha = 1;
      txt('LAST LANTERN', VW / 2, 30 + (1 - k) * -8, { al: 'center', size: 24, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.9)', ls: 2, sh: false, alpha: k });
      txt(sv('THE LIGHT IS NOT YET GONE', 'ÁNH SÁNG VẪN CHƯA TẮT'), VW / 2, 50, { al: 'center', size: 7, bold: true, col: '#ffe9b8', ls: 2, ol: '#1a0814', sh: false, alpha: k });
      if (et > 1.0) { g.fillStyle = 'rgba(8,3,18,.7)'; g.fillRect(VW / 2 - 130, 186, 260, 22); g.fillStyle = 'rgba(255,200,100,.5)'; g.fillRect(VW / 2 - 130, 186, 260, 1); g.fillRect(VW / 2 - 130, 207, 260, 1);
        txt(sv('TAP THE SCREEN OR PRESS ENTER TO PLAY', 'CHẠM VÀO MÀN HÌNH HOẶC NHẤN ENTER ĐỂ CHƠI'), VW / 2, 197, { al: 'center', size: 7.5, bold: true, col: '#ffffff', glow: 'rgba(255,170,70,' + (0.4 + 0.5 * Math.abs(Math.sin(t * 3))) + ')', alpha: 0.55 + 0.45 * Math.abs(Math.sin(t * 3)) }); }
      if (et < 0.8) { g.globalAlpha = 1 - et / 0.8; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    }
    if (shake) { /* the picture shakes by redrawing: cheap trick on the whole buffer */ const sx = Math.round((Math.random() - 0.5) * 4 * shake), sy = Math.round((Math.random() - 0.5) * 4 * shake); g.drawImage(buf, sx, sy); }
    if (t < 62) opBars();
    // vignette
    if (t < 62) { g.drawImage(titleArt().vig, 0, 0); }
    // captions
    if (t < OP_END + 12) for (let i = 0; i < OPC.length; i++) {
      const c = OPC[i]; if (t < c[0] || t > c[1] + 0.5) continue; if (t >= 62 && c[0] < 62) continue;
      const line = sv(c[3], c[4]), n = Math.floor((t - c[0]) * (c[2] === 'n' ? 26 : 32)), a = Math.min(1, (c[1] + 0.5 - t) / 0.5), who = c[2] === 'q' ? 'QUOC' : (c[2] === 'e' ? 'EMBER' : null), col = c[2] === 'q' ? '#ff7a7a' : (c[2] === 'e' ? '#ffd34e' : '#e8eaf5');
      const wl = wrapText(line.slice(0, n), 78), yb = t >= 62 ? 150 : VH - 17;
      if (t >= 62) { g.fillStyle = 'rgba(8,3,18,.6)'; g.fillRect(VW / 2 - 140, 134, 280, 30); }
      (t >= 62 ? [wl.slice(0, 2)] : [wl]).forEach(ls => ls.forEach((l, j) => txt((j === 0 && who ? who + ': ' : '') + l, VW / 2, yb + j * 8 - (ls.length - 1) * 4, { al: 'center', size: c[2] === 'q' ? 7.5 : 7, bold: c[2] !== 'n', col, alpha: a })));
    }
    if (t < OP_END - 1) txt(sv('ENTER: skip', 'ENTER: bỏ qua'), VW - 6, VH - 6, { al: 'right', size: 5, col: '#6a6a8a' });
  }
  // ===================== FILMS: the 60 s intro and the 60 s outro =====================
  // Cinematic pixel art: parallax scrolling (layers that move at different speeds), depth of field (far and near layers
  // pre-blurred), volumetric god rays, dynamic shadows, glow, particles. Every frame then goes through a post-processing
  // pass: bloom, colour grade, vignette, film grain, letterbox bars.
  let cn = null, cnBoot = true; const CNA = {};
  const CN_LEN = { intro: 60, outro: 60 }, CN_GY = 176, CN_BAR = 18;
  const CN_SUMS = ['dragonking', 'ninetail', 'titan', 'phoenix'];
  function startCine(kind, next, gate) { cn = { kind, t: 0, fired: {}, next: next || 'title', gate: !!gate }; CN_SUMS.forEach(k => sumArt(k)); Snd.ambience(null); if (!gate) cnBegin(); }
  function cnBegin() { cn.gate = false; Snd.init(); Snd.cine('sad', 2.5); }
  function cnEnd() { if (!cn || cn.done) return; cn.done = true; Snd.cine(null, 1); if (cn.kind === 'outro') { save.outroSeen = 1; writeSave(); } toScene(cn.next); }
  function updateCine(dt) {
    if (!cn) startCine('intro');
    if (cn.gate) { if (act.okP || act.atkP || act.backP || act.jumpP || Object.keys(pressed).length) cnBegin(); return; }
    if (cn.done) return;
    cn.t += dt; sceneT += dt; const t = cn.t;
    const at = (k, s, fn) => { if (t >= s && !cn.fired[k]) { cn.fired[k] = 1; fn(); } };
    if (cn.kind === 'intro') cnIntroCues(at); else cnOutroCues(at);
    if (t > 1 && (act.okP || act.backP || act.atkP)) { Snd.play('select'); cnEnd(); return; }
    if (t >= CN_LEN[cn.kind]) cnEnd();
  }
  function cnIntroCues(at) {
    for (let i = 0; i < 6; i++) at('w' + i, 0.3 + i * 2.5, () => Snd.play('windy'));
    at('th1', 5.6, () => Snd.play('thunder')); at('rb', 8, () => Snd.play('rumble')); at('th2', 11.2, () => Snd.play('thunder'));
    at('cut2', 15, () => { Snd.cine('build', 0.3); Snd.play('windy'); });
    [15.4, 15.95, 16.5, 17.05].forEach((s, i) => at('st' + i, s, () => Snd.play('bstep')));
    at('land', 17.6, () => Snd.cineHit('taiko')); at('w7', 19.5, () => Snd.play('windy')); at('w8', 23, () => Snd.play('windy'));
    at('eye', 26.4, () => Snd.cineHit('shimmer'));
    at('roar1', 30.2, () => { Snd.cineHit('roar'); Snd.play('rumble'); });
    at('dash', 31.6, () => Snd.play('dash')); at('swing', 33.6, () => Snd.play('whoosh'));
    at('parry', 34.0, () => { Snd.cineHit('parry'); Snd.play('clang'); });
    at('rise', 35.6, () => Snd.cineHit('rise'));
    at('boom', 37.2, () => { Snd.play('explode'); Snd.play('boom'); Snd.cine('epic', 0.1); });
    at('roar2', 39.2, () => { Snd.cineHit('roar'); Snd.cineHit('taiko'); });
    at('go', 45.2, () => Snd.play('dash')); at('go2', 46.6, () => Snd.play('whoosh'));
    at('frz', 48.5, () => { Snd.play('slash'); Snd.cineHit('taiko'); });
    at('sil', 49.9, () => Snd.cine(null, 0.12));
    at('drop', 50.8, () => Snd.cineHit('drop'));
    at('logo', 52.2, () => Snd.cineHit('shimmer')); at('logo2', 55.4, () => Snd.play('chime'));
  }
  function cnOutroCues(at) {
    at('roar', 1.2, () => Snd.cineHit('roar')); at('crk', 3.6, () => Snd.play('rumble'));
    at('dis', 5.5, () => { Snd.play('explode'); Snd.cineHit('rise'); });
    at('calm', 9.5, () => Snd.cine('calm', 3)); at('sun', 12.5, () => Snd.play('chime'));
    at('nod', 27.6, () => Snd.play('chime'));
    [30, 31.4, 32.8, 34.2].forEach((s, i) => at('up' + i, s, () => Snd.cineHit('shimmer')));
    at('sheath', 41.2, () => Snd.play('clang'));
    at('fade', 54, () => Snd.cine(null, 5));
  }

  // ---------- building blocks ----------
  function cnLayer(key, w, h, fn, blur) {   // a pre-rendered layer; blur > 0 = out of focus (depth of field)
    if (CNA[key]) return CNA[key];
    const [c, x] = mkCanvas(w, h); fn(x, w, h, mulberry32(key.length * 977 + w + h));
    if (!blur) return (CNA[key] = c);
    const [c2, x2] = mkCanvas(w, h); x2.filter = 'blur(' + blur + 'px)'; x2.drawImage(c, 0, 0); return (CNA[key] = c2);
  }
  // parallax: a wide layer that repeats sideways
  function cnWrap(img, off, y, a) { const w = img.width, ox = -(((off % w) + w) % w); if (a !== undefined) g.globalAlpha = a; g.drawImage(img, Math.round(ox), Math.round(y)); if (ox + w < VW) g.drawImage(img, Math.round(ox + w), Math.round(y)); g.globalAlpha = 1; }
  function cnSky(key, stops) { return cnLayer(key, 4, VH, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); stops.forEach(s => gr.addColorStop(s[0], s[1])); x.fillStyle = gr; x.fillRect(0, 0, w, h); }); }
  function cnGlow(x, y, r, rgb, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgb + a + ')'); gr.addColorStop(1, rgb + '0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  // volumetric light: soft beams fanning out from a point
  function cnRays(sx, sy, ang, n, rgb, a, t, len, spread) {
    if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const an = ang + (i - (n - 1) / 2) * (spread || 0.12) + Math.sin(t * 0.4 + i * 1.7) * 0.02, w = 0.025 + (i % 3) * 0.014, L = len || 320, al = a * (0.55 + 0.45 * Math.sin(t * 0.7 + i * 2.3));
      const gr = g.createLinearGradient(sx, sy, sx + Math.cos(an) * L, sy + Math.sin(an) * L); gr.addColorStop(0, rgb + al + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(an - w) * L, sy + Math.sin(an - w) * L); g.lineTo(sx + Math.cos(an + w) * L, sy + Math.sin(an + w) * L); g.closePath(); g.fill();
    }
    g.restore();
  }
  // floating particles (ash, embers, star dust) that only depend on time
  function cnMotes(t, n, seed, cols, x0, y0, w, h, vx, vy, sz, a) {
    const q = mulberry32(seed);
    for (let i = 0; i < n; i++) {
      const r1 = q(), r2 = q(), r3 = q(), r4 = q(), r5 = q(), px = x0 + (((r1 * w + t * vx * (0.5 + r3)) % w) + w) % w, py = y0 + (((r2 * h - t * vy * (0.5 + r4)) % h) + h) % h;
      g.globalAlpha = a * (0.45 + 0.55 * Math.sin(t * (2 + r5 * 4) + i)); g.fillStyle = cols[i % cols.length]; const s = r5 < 0.25 ? sz * 2 : sz; g.fillRect(Math.round(px), Math.round(py), s, s);
    }
    g.globalAlpha = 1;
  }
  // dynamic shadow: stretched away from the light
  function cnShadow(x, y, w, a, skew) { g.save(); g.globalAlpha = a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x + (skew || 0) / 2, y, w / 2 + Math.abs(skew || 0) / 2, Math.max(1.5, w / 7), 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  function cnHeroSpr(pose, fr) { const h = HERO[myHero()] || HERO.ember; if (h.custom) return custSpr(h, pose === 'jump' ? 'air' : pose === 'run' ? 'run' : 'idle', pose === 'run' ? fr % 4 : fr & 1); return getSprite('hero_' + pose, h.sw, pose === 'run' ? fr % 4 : pose === 'idle' ? fr % 2 : 0); }
  function cnSword() { return swordSprite((save.inv && save.inv.w && save.inv.w[0]) || 'iron'); }
  // a summon in its Ancient form (bottom-centre pivot), with an optional glow aura
  function cnSum(kind, x, bot, h, flip, a, o) {
    const art = sumArt(kind); if (!art || !art.evo) return null; const im = art.evo, sc = h / im.height, w = im.width * sc; o = o || {};
    g.save(); g.translate(x, bot); if (o.rot) g.rotate(o.rot); g.scale(flip ? -1 : 1, o.sy || 1); g.imageSmoothingEnabled = true;
    if (o.glow > 0) { g.globalCompositeOperation = 'lighter'; g.filter = 'blur(6px) brightness(1.7)'; g.globalAlpha = a * o.glow; g.drawImage(im, -w / 2 - 6, -h - 6, w + 12, h + 12); g.filter = 'none'; g.globalCompositeOperation = 'source-over'; }
    g.globalAlpha = a; if (o.dark) g.filter = 'brightness(' + (1 - o.dark) + ')'; g.drawImage(im, -w / 2, -h, w, h); g.filter = 'none'; g.restore(); g.globalAlpha = 1;
    return { im, w, h };
  }
  // pixel dissolve: the picture breaks into small squares that drift up and fade (top first)
  function cnDissolve(im, x, bot, w, h, k, seed, tint) {
    if (k <= 0 || k >= 1.6) return; const cols = Math.max(4, Math.round(w / 3)), rows = Math.max(4, Math.round(h / 3)), cw = im.width / cols, ch = im.height / rows;
    g.save(); g.imageSmoothingEnabled = true;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const r = (((i * 73856093) ^ (j * 19349663) ^ seed) >>> 0) % 1000 / 1000, d = (j / rows) * 0.55 + r * 0.45, p = clamp((k * 1.5 - d) / 0.5, 0, 1);
      if (p >= 1) continue;
      const dx = x - w / 2 + i * w / cols + Math.sin(r * 20 + p * 6) * p * 16, dy = bot - h + j * h / rows - p * p * 160 - p * 18;
      g.globalAlpha = 1 - p; g.drawImage(im, i * cw, j * ch, cw, ch, dx, dy, w / cols + 0.6, h / rows + 0.6);
      if (p > 0 && r < 0.12) { g.globalCompositeOperation = 'lighter'; g.fillStyle = tint || '#ffe9a8'; g.fillRect(Math.round(dx), Math.round(dy), 2, 2); g.globalCompositeOperation = 'source-over'; }
    }
    g.restore(); g.globalAlpha = 1;
  }
  function cnSolid(im, x, bot, w, h, a) { g.save(); g.globalAlpha = a === undefined ? 1 : a; g.imageSmoothingEnabled = true; g.drawImage(im, x - w / 2, bot - h, w, h); g.restore(); }
  // a cloak blowing in the wind, hung from the hero's shoulders
  function cnCape(x, bot, S, f, t, sprH) {
    const sx = x - f * 1 * S, sy = bot - (sprH - 8) * S, L = 12 * S, N = 12, top = [], btm = [];
    for (let i = 0; i <= N; i++) { const p = i / N, wv = Math.sin(t * 8 - p * 5) * S * 1.4 * p + Math.sin(t * 13 - p * 9) * S * 0.5 * p, bx = sx - f * p * L, by = sy + p * L * 0.32 + wv; top.push([bx, by - S * 1.2 * (1 - p * 0.4)]); btm.push([bx + f * p * S * 1.5, by + S * (2 + 5 * p)]); }
    g.fillStyle = '#8a1e30'; g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = N; i >= 0; i--) g.lineTo(btm[i][0], btm[i][1]); g.closePath(); g.fill();
    g.fillStyle = '#c0304a'; g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = N; i >= 0; i--) g.lineTo((top[i][0] + btm[i][0]) / 2, (top[i][1] + btm[i][1]) / 2 - S * 0.4); g.closePath(); g.fill();
  }
  function cnSub(s, t, a, b) { const k = Math.min(seg(t, a, a + 0.7), 1 - seg(t, b - 0.7, b)); if (k > 0) txt(s, VW / 2, VH - CN_BAR / 2, { al: 'center', size: 6.5, col: '#ece6f6', alpha: k, sh: false }); }

  // ---------- layers ----------
  const cnClouds = (key, c1, c2) => cnLayer(key, 768, 120, (x, w, h, q) => { for (let i = 0; i < 46; i++) { const cx = q() * w, cy = 20 + q() * 70, r = 14 + q() * 30; x.fillStyle = c1; x.beginPath(); x.ellipse(cx, cy, r * 1.8, r * 0.7, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = c2; x.beginPath(); x.ellipse(cx, cy - r * 0.25, r * 1.3, r * 0.35, 0, 0, Math.PI * 2); x.fill(); } }, 2.5);
  const cnFar = () => cnLayer('rfar', 768, 120, (x, w, h, q) => {
    x.fillStyle = '#2a1e2e'; for (let px = 0; px < w; px += 2) { const y = 96 + Math.sin(px * 0.011) * 7 + Math.sin(px * 0.037) * 3; x.fillRect(px, y, 2, h - y); }
    for (let i = 0; i < 9; i++) {
      const bx = i * 85 + q() * 30, tw = 10 + q() * 14, th = 34 + q() * 46, br = q();
      x.fillStyle = '#2a1e2e'; for (let k = 0; k < tw; k += 2) { const hh = th - (q() < 0.6 ? q() * 12 : 0) - (k > tw * 0.5 ? br * 16 : 0); x.fillRect(bx + k, 102 - hh, 2, hh); }
      const ww = 30 + q() * 30, wh = 12 + q() * 10; for (let k = 0; k < ww; k += 3) x.fillRect(bx + tw + k, 102 - wh - (k % 6 ? 0 : 3) - (q() < 0.2 ? -6 : 0), 3, wh + 3);
      for (let k = 0; k < 3; k++) { const lit = q() < 0.55; x.fillStyle = lit ? '#ff8a3a' : '#160f1a'; x.fillRect(bx + 3 + q() * (tw - 6), 102 - th + 8 + k * 9, 2, 3); }
    }
  }, 1.2);
  const cnMid = () => cnLayer('rmid', 1024, 150, (x, w, h, q) => {
    x.fillStyle = '#150f1b'; x.fillRect(0, 128, w, 22);
    for (let i = 0; i < 12; i++) {
      const bx = i * 86 + q() * 20, kind = q();
      if (kind < 0.45) { const cw = 10 + q() * 6, chh = 40 + q() * 70; x.fillStyle = '#150f1b'; x.fillRect(bx, 130 - chh, cw, chh); x.fillRect(bx - 3, 130 - chh, cw + 6, 5); x.fillStyle = '#3a2a3e'; x.fillRect(bx, 130 - chh, 1, chh); x.fillRect(bx - 3, 130 - chh, cw + 6, 1); for (let k = 0; k < cw; k += 2) { x.fillStyle = '#150f1b'; x.fillRect(bx + k, 130 - chh - 2 - q() * 6, 2, 8); } }
      else if (kind < 0.7) { x.strokeStyle = '#150f1b'; x.lineWidth = 7; x.beginPath(); x.arc(bx + 26, 96, 24, Math.PI, Math.PI * (1.55 + q() * 0.4)); x.stroke(); x.fillStyle = '#150f1b'; x.fillRect(bx, 96, 7, 34); x.fillRect(bx + 45, 96 + q() * 10, 7, 34); x.strokeStyle = '#3a2a3e'; x.lineWidth = 1; x.beginPath(); x.arc(bx + 26, 96, 27.5, Math.PI, Math.PI * 1.5); x.stroke(); }
      else { x.fillStyle = '#2a1a1e'; x.fillRect(bx + 10, 40, 2, 90); x.fillStyle = '#5a1820'; x.beginPath(); x.moveTo(bx + 12, 44); x.lineTo(bx + 30, 46); for (let k = 0; k <= 6; k++) x.lineTo(bx + 30 - k * 3, 90 + (k % 2 ? 8 : 0) + q() * 6); x.lineTo(bx + 12, 84); x.closePath(); x.fill(); x.fillStyle = '#c89a3a'; x.fillRect(bx + 18, 58, 5, 5); }
      x.fillStyle = '#150f1b'; x.fillRect(bx + 40, 122 - q() * 4, 20 + q() * 18, 10);
    }
  });
  const cnGround = () => cnLayer('rgnd', 1400, 50, (x, w, h, q) => {
    x.fillStyle = '#1c1318'; x.fillRect(0, 6, w, h); x.fillStyle = '#4a3238'; x.fillRect(0, 6, w, 1); x.fillStyle = '#2e1f26'; x.fillRect(0, 7, w, 2);
    x.fillStyle = '#0c080c'; for (let i = 0; i < 70; i++) { let cx = q() * w, cy = 10 + q() * 30; for (let k = 0; k < 6; k++) { x.fillRect(Math.round(cx), Math.round(cy), 2, 1); cx += 2 + q() * 3; cy += q() * 2 - 1; } }
    for (let i = 0; i < 26; i++) { const sx = q() * w, ang = (q() - 0.5) * 0.6, L = 12 + q() * 8; x.save(); x.translate(sx, 8); x.rotate(ang); x.fillStyle = '#8a8a98'; x.fillRect(-1, -L, 2, L); x.fillStyle = '#5a4030'; x.fillRect(-4, -L - 1, 8, 2); x.fillRect(-1, -L - 5, 2, 4); x.restore(); }
    for (let i = 0; i < 14; i++) { const sx = q() * w; x.fillStyle = '#3a3646'; x.beginPath(); x.ellipse(sx, 9, 6, 4, 0, Math.PI, 0); x.fill(); x.fillStyle = '#6a3a2a'; x.fillRect(sx - 1, 6, 2, 2); }
  });
  const cnFore = () => cnLayer('rfg', 1400, 80, (x, w, h, q) => { x.fillStyle = '#050307'; for (let i = 0; i < 16; i++) { const cx = q() * w, r = 18 + q() * 26; x.beginPath(); x.ellipse(cx, h, r * 1.4, r, 0, Math.PI, 0); x.fill(); } for (let i = 0; i < 90; i++) { const cx = q() * w, L = 10 + q() * 22; x.fillRect(cx, h - L, 2, L); } }, 2.5);
  const cnMtn = () => cnLayer('mtn2', 768, 150, (x, w, h, q) => { for (const [b, a, c] of [[60, 34, '#2a2440'], [90, 24, '#1c1830']]) { x.fillStyle = c; for (let px = 0; px < w; px++) { const y = b + Math.sin(px * 0.013 + a) * a * 0.6 + Math.abs(Math.sin(px * 0.041 + a)) * -a * 0.5; x.fillRect(px, y, 1, h - y); } } }, 3);
  const cnHills = (key, stops) => cnLayer(key, 768, 120, (x, w, h, q) => stops.forEach(([b, a, c], k) => { x.fillStyle = c; for (let px = 0; px < w; px++) { const y = b + Math.sin(px * (0.008 + k * 0.004) + k * 2) * a + Math.sin(px * 0.03 + k) * a * 0.3; x.fillRect(px, y, 1, h - y); } }), 0);
  const cnGrass = () => cnLayer('ograss', 1400, 50, (x, w, h, q) => { x.fillStyle = '#2e4a2a'; x.fillRect(0, 6, w, h); x.fillStyle = '#6aa04a'; x.fillRect(0, 6, w, 1); for (let i = 0; i < 400; i++) { const sx = q() * w, L = 2 + q() * 5; x.fillStyle = q() < 0.5 ? '#4a7a3a' : '#7ab85a'; x.fillRect(sx, 7 - L, 1, L); } for (let i = 0; i < 60; i++) { x.fillStyle = ['#ffd34e', '#ff8fbf', '#ffffff', '#9fe8ff'][i % 4]; x.fillRect(q() * w, 4 + q() * 3, 2, 2); } x.fillStyle = '#3a2a24'; for (let i = 0; i < 12; i++) { const sx = q() * w; x.fillRect(sx, 9, 3, 30); } });
  function cnLogo() {
    if (CNA.logo) return CNA.logo; const W = 320, H = 64, [c, x] = mkCanvas(W, H);
    x.font = 'bold 36px ' + FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '3px';
    x.lineWidth = 5; x.strokeStyle = '#2a0a10'; x.lineJoin = 'round'; x.strokeText('LAST LANTERN', W / 2, H / 2 + 1);
    const gr = x.createLinearGradient(0, 14, 0, 50); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.5, '#ffd34e'); gr.addColorStop(1, '#e07a1a'); x.fillStyle = gr; x.fillText('LAST LANTERN', W / 2, H / 2);
    const d = x.getImageData(0, 0, W, H).data, blocks = [], q = mulberry32(4242);
    for (let by = 0; by < H; by += 3) for (let bx = 0; bx < W; bx += 3) { let on = false; for (let yy = 0; yy < 3 && !on; yy++) for (let xx = 0; xx < 3; xx++) if (d[((by + yy) * W + bx + xx) * 4 + 3] > 40) { on = true; break; } if (on) blocks.push({ x: bx, y: by, r: q() * 0.85 + (Math.abs(bx - W / 2) / W) * 0.15 }); }
    return (CNA.logo = { c, W, H, blocks });
  }

  // ---------- post-processing: bloom, colour grade, vignette, grain, letterbox ----------
  function cnPost(o) {
    const bw = VW >> 1, bh = VH >> 1;
    if (!CNA.bA) { CNA.bA = mkCanvas(bw, bh); CNA.bB = mkCanvas(bw, bh); CNA.full = mkCanvas(VW, VH); }
    if (o.desat) { const [fc, fx] = CNA.full; fx.clearRect(0, 0, VW, VH); fx.drawImage(g.canvas, 0, 0); g.save(); g.filter = 'grayscale(' + o.desat + ') contrast(1.5) brightness(1.08)'; g.drawImage(fc, 0, 0); g.restore(); }
    if (o.bloom > 0) {
      const [ac, ax] = CNA.bA, [bc, bx] = CNA.bB;
      ax.globalCompositeOperation = 'copy'; ax.imageSmoothingEnabled = true; ax.filter = 'brightness(' + (o.thr || 0.85) + ') contrast(2.6) saturate(1.3)'; ax.drawImage(g.canvas, 0, 0, bw, bh); ax.filter = 'none';
      bx.globalCompositeOperation = 'copy'; bx.filter = 'blur(4px)'; bx.drawImage(ac, 0, 0); bx.filter = 'none';
      g.save(); g.imageSmoothingEnabled = true; g.globalCompositeOperation = 'lighter'; g.globalAlpha = o.bloom; g.drawImage(bc, 0, 0, VW, VH); g.globalAlpha = o.bloom * 0.5; g.filter = 'blur(6px)'; g.drawImage(bc, 0, 0, VW, VH); g.restore();
    }
    if (o.grade) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = o.grade; g.fillRect(0, 0, VW, VH); g.restore(); }
    if (!CNA.vig) { const [vc, vx] = mkCanvas(VW, VH), gr = vx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); vx.fillStyle = gr; vx.fillRect(0, 0, VW, VH); CNA.vig = vc; }
    g.globalAlpha = o.vig === undefined ? 0.6 : o.vig; g.drawImage(CNA.vig, 0, 0); g.globalAlpha = 1;
    if (o.grain !== 0) { g.fillStyle = '#ffffff'; for (let i = 0; i < 160; i++) { g.globalAlpha = Math.random() * 0.06; g.fillRect((Math.random() * VW) | 0, (Math.random() * VH) | 0, 1, 1); } g.globalAlpha = 1; }
    if (o.black > 0) { g.globalAlpha = Math.min(1, o.black); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    if (o.white > 0) { g.globalAlpha = Math.min(1, o.white); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, CN_BAR); g.fillRect(0, VH - CN_BAR, VW, CN_BAR);
  }

  // ---------- INTRO ----------
  function cnIntro1(t) {   // 0-15 s  despair: a wide, slow pan over the fallen kingdom
    const cam = ez(seg(t, 0, 15)) * 560 + t * 4;
    g.drawImage(cnSky('sky1', [[0, '#07060e'], [0.45, '#1c1424'], [0.75, '#3a1e22'], [1, '#5a2a1e']]), 0, 0, VW, VH);
    cnGlow(VW * 0.75 - cam * 0.05, 120, 170, 'rgba(255,90,40,', 0.22);
    for (const [s0, sd] of [[5.6, 3], [11.2, 9]]) { const age = t - s0; if (age > 0 && age < 0.5) { const r = mulberry32(sd); let px = 80 + r() * 220, py = 0; g.globalAlpha = 1 - age * 2; g.strokeStyle = '#e8e0ff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py); for (let i = 0; i < 6; i++) { px += (r() - 0.5) * 26; py += 14; g.lineTo(px, py); } g.stroke(); g.globalAlpha = 0.25 * (1 - age * 2); g.fillStyle = '#c8c0ff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; } }
    cnWrap(cnClouds('cl1', '#241c30', '#3a2e48'), cam * 0.08 + t * 7, 0, 0.9);
    cnWrap(cnFar(), cam * 0.18, 66);
    for (let i = 0; i < 5; i++) { const sx = ((i * 157 - cam * 0.18) % 768 + 768) % 768 - 40; for (let k = 0; k < 8; k++) { const p = ((t * 0.12 + k / 8 + i * 0.13) % 1); g.globalAlpha = 0.18 * (1 - p); g.fillStyle = '#2e2632'; const r = 6 + p * 22; g.beginPath(); g.arc(sx + Math.sin(p * 4 + i) * 8 + p * 30, 150 - p * 120, r, 0, Math.PI * 2); g.fill(); } } g.globalAlpha = 1;
    cnRays(40, -30, 1.15, 5, 'rgba(170,160,220,', 0.06, t, 300, 0.14);
    cnWrap(cnMid(), cam * 0.45, CN_GY - 128);
    cnWrap(cnGround(), cam, CN_GY - 6);
    cnMotes(t, 70, 11, ['#ff8a3a', '#ffd34e', '#ffb070'], 0, 20, VW, VH - 20, 6, 14, 1, 0.8);
    cnMotes(t, 60, 12, ['#7a7088', '#9a90a8'], 0, 0, VW, VH, 18, -8, 1, 0.5);
    cnWrap(cnFore(), cam * 1.6, VH - 80);
    cnSub(sv('The kingdom of Aurelia has fallen...', 'Vương quốc Aurelia đã sụp đổ...'), t, 2.5, 7.5);
    cnSub(sv('The Sun is shattered. Darkness swallows everything.', 'Mặt Trời vỡ tan. Bóng tối nuốt chửng mọi thứ.'), t, 8.3, 13.8);
    return { bloom: 0.45, grade: 'rgba(70,60,140,.35)', vig: 0.7, black: 1 - seg(t, 0, 2.5) + seg(t, 14.6, 15) };
  }
  function cnIntro2(t) {   // 15-30 s  a glimmer of light: extreme close-up, the camera climbs from the boots to the eyes
    const u = t - 15, S = 16, walk = u < 2.4, spr = cnHeroSpr(walk ? 'run' : 'idle', walk ? Math.floor(u * 7) : Math.floor(u * 2.2)), sh = spr.h;
    const eyeOff = (sh - 7) * S, tiltMax = Math.max(0, eyeOff + 82 - (VH - 34)), tilt = ez(seg(u, 3.4, 10.5)) * tiltMax, bot = VH - 34 + tilt;
    g.drawImage(cnSky('sky2', [[0, '#0b0a18'], [0.55, '#2a2040'], [1, '#6a3446']]), 0, 0, VW, VH);
    cnRays(VW * 0.85, -20, 2.05, 5, 'rgba(210,200,255,', 0.08 + seg(u, 8, 12) * 0.08, t, 320, 0.13);
    cnWrap(cnMtn(), u * 5, 60 + tilt * 0.22);
    cnWrap(cnClouds('cl2', '#2c2440', '#463a5c'), u * 46, -10 + tilt * 0.12, 0.75);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const y = ((i * 37) % 180) + 20, x = ((u * 520 + i * 97) % (VW + 120)) - 60; g.beginPath(); g.moveTo(VW - x, y); g.lineTo(VW - x + 30 + (i % 3) * 10, y + 2); g.stroke(); }
    // the rock he climbs on
    g.fillStyle = '#231e2c'; g.beginPath(); g.moveTo(-10, VH + 40); g.lineTo(-10, bot + 26); g.lineTo(60, bot + 4); g.lineTo(110, bot); g.lineTo(300, bot); g.lineTo(340, bot + 12); g.lineTo(VW + 10, bot + 40); g.lineTo(VW + 10, VH + 300); g.closePath(); g.fill();
    g.fillStyle = '#6a5a7e'; g.fillRect(110, Math.round(bot), 190, 2); g.fillStyle = '#3a3048'; g.fillRect(110, Math.round(bot) + 2, 190, 3);
    g.fillStyle = '#14101a'; for (let i = 0; i < 8; i++) g.fillRect(120 + i * 23, Math.round(bot) + 8 + (i % 3) * 7, 14, 2);
    const hx = walk ? -60 + 230 * ez(u / 2.4) : 170;
    cnShadow(hx + 10, bot + 1, 7 * S, 0.45, 40);
    cnCape(hx, bot, S, 1, t, sh);
    drawSpr(g, spr, Math.round(hx), Math.round(bot), false, false, S, S);
    if (walk && Math.floor(u * 7) % 2 === 0) cnMotes(t, 10, 7, ['#8a7a9a'], hx - 40, bot - 12, 80, 10, 0, 20, 2, 0.5);
    // the hand closes on the sword; light runs along the blade
    if (u > 9.5) { const sw = cnSword(), k = ez(seg(u, 9.5, 10.6)), hxH = hx + 5 * S, hyH = bot - 8 * S; g.save(); g.translate(hxH, hyH + (1 - k) * 60); g.rotate(-Math.PI / 2 + 0.18); drawSpr(g, sw, sw.w * S * 0.45 / 2, sw.h * S * 0.45 / 2, false, false, S * 0.45, S * 0.45); g.restore(); const gp = seg(u, 12.2, 13.4); if (gp > 0 && gp < 1) cnGlow(hxH + 4, hyH - gp * sw.w * S * 0.45, 26, 'rgba(255,255,230,', 0.9); }
    const ep = seg(u, 11.2, 12.4); if (ep > 0 && ep < 1) { const ex = hx + 3 * S, ey = bot - eyeOff, a = Math.sin(ep * Math.PI); cnGlow(ex, ey, 40, 'rgba(255,230,160,', a); g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(ex - 30 * a, ey, 60 * a, 1); g.fillRect(ex, ey - 10 * a, 1, 20 * a); }
    cnMotes(t, 40, 21, ['#ffe9a8', '#ffffff'], 0, 0, VW, VH, -60, 4, 1, 0.35 + seg(u, 8, 14) * 0.4);
    cnSub(sv('But one last lantern still burns...', 'Nhưng vẫn còn một ngọn đèn cuối cùng đang cháy...'), t, 26.2, 29.8);
    return { bloom: 0.28 + seg(u, 8, 14) * 0.14, thr: 0.75, grade: 'rgba(120,90,160,.3)', vig: 0.65 };
  }
  function cnIntro3(t, four) {   // 30-45 s  the summoning; four = the final charge (45-50 s) reuses this stage
    const u = four ? 15 : t - 30, v = four ? Math.min(t - 45, 3.5) : 0, low = ez(seg(u, 7.0, 8.2)), blaze = seg(u, 5.6, 7.2) * (1 - seg(u, 7.2, 9));
    g.drawImage(cnSky('sky3', [[0, '#120814'], [0.5, '#3a1424'], [0.8, '#8a3a24'], [1, '#c86a2a']]), 0, 0, VW, VH);
    if (blaze > 0 || u >= 7.2) { g.globalAlpha = Math.min(1, blaze * 0.8 + (u >= 7.2 ? 0.45 : 0)); g.drawImage(cnSky('sky3g', [[0, '#3a2a10'], [0.6, '#c88a2a'], [1, '#ffe08a']]), 0, 0, VW, VH); g.globalAlpha = 1; }
    let shx = 0, shy = 0; const shk = (u > 0.4 && u < 2.4 ? 2 : 0) + (u > 4 && u < 4.5 ? 4 : 0) + (u > 7.2 && u < 8 ? 5 : 0) + (u > 9.2 && u < 10.4 ? 3 : 0) + (four && v > 3.3 ? 0 : 0);
    if (shk) { shx = (Math.random() - 0.5) * shk * 2; shy = (Math.random() - 0.5) * shk * 2; }
    const pan = four ? ez(seg(v, 0, 3.5)) * -70 : 0, z = 1 + low * 0.16 + (four ? ez(seg(v, 0, 3.5)) * 0.12 : 0);
    g.save(); g.translate(VW / 2 + shx, VH - 24 + shy); g.scale(z, z * (1 + low * 0.07)); g.translate(-VW / 2 - pan, -(VH - 24) + low * 10);
    cnWrap(cnClouds('cl3', '#3a1a2a', '#6a2a2a'), t * 9, -6, 0.85);
    cnWrap(cnFar(), 300 + t * 2, 66); cnWrap(cnMid(), 520 + t * 5, CN_GY - 128); cnWrap(cnGround(), 900, CN_GY - 6);
    // the boss
    const B = bossSprite(5), bs = 3.1;
    let bx = u < 2.4 ? 470 - 320 * Math.pow(seg(u, 0, 2.4), 2) : 150, bflip = u >= 2.9;
    if (u >= 3.0 && u < 4.0) bx = 150 + 80 * ez(seg(u, 3.0, 3.6)); if (u >= 4.0) bx = 230 - 110 * ez(seg(u, 4.35, 5.3));
    if (four) bx = 120 - ez(seg(v, 2.6, 3.5)) * 8;
    const cower = u > 9.2 ? 0.08 : 0, bdark = u > 7.2 ? 0.45 : 0;
    cnShadow(bx, CN_GY + 1, B.w * bs * 0.8, 0.5, 30);
    g.save(); g.translate(bx, CN_GY); g.scale(1, 1 - cower); if (bdark) g.filter = 'brightness(' + (1 - bdark) + ')'; drawSpr(g, B, 0, 0, bflip, u > 4 && u < 4.2, bs, bs); g.filter = 'none'; g.restore();
    if (u < 2.4 && u > 0.3) cnMotes(t, 26, 31, ['#6a5040', '#8a7060'], bx, CN_GY - 26, 120, 26, -90, 30, 2, 0.8);
    // its great axe: raised, swung, then knocked away by the parry
    const axe = (x, y, a, s) => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = '#4a3020'; g.fillRect(-2, -40, 4, 52); g.fillStyle = '#9aa0b0'; g.beginPath(); g.moveTo(2, -40); g.quadraticCurveTo(26, -30, 18, -12); g.lineTo(2, -18); g.closePath(); g.fill(); g.fillStyle = '#e0e6f0'; g.fillRect(16, -30, 2, 14); g.restore(); };
    const hand = [bx + (bflip ? 34 : -34), CN_GY - 92];
    if (u < 4.0 && !four) axe(hand[0], hand[1], u < 3.6 ? (bflip ? -0.6 : 0.6) : (bflip ? -0.6 + 1.9 * seg(u, 3.6, 4.0) : 0.6), 1.6);
    else if (!four && u < 7) { const k = seg(u, 4.35, 6.2); axe(hand[0] - k * 200, hand[1] - Math.sin(k * Math.PI) * 120 + k * 40, (bflip ? 1.3 : 0) + k * 14, 1.6); }
    // the summon: the Golden Dragon comes down from a blazing sky
    const dragonOn = u >= 7.2, dk = ez(seg(u, 7.2, 9.0));
    if (dragonOn) {
      const dx = four ? 230 - ez(seg(v, 0.4, 3.3)) * 70 : 232, dbot = (four ? CN_GY - 4 - ez(seg(v, 0.4, 3.3)) * 24 : CN_GY + 8) - (1 - dk) * 300, dh = 176 * (four ? 1 + ez(seg(v, 0, 3.5)) * 0.1 : 1), pulse = 0.5 + 0.2 * Math.sin(t * 4);
      cnRays(dx, dbot - dh * 0.55, -Math.PI / 2, 14, 'rgba(255,220,120,', 0.16 * dk, t, 300, 0.42);
      cnGlow(dx, dbot - dh * 0.5, 170, 'rgba(255,200,90,', 0.45 * dk);
      cnSum('dragonking', dx, dbot, dh, true, 1, { glow: pulse * dk, sy: u > 9.2 && u < 10 ? 1.03 : 1 });
      if (u > 9.2 && u < 11) { const rk = seg(u, 9.2, 11); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,230,150,' + (1 - rk) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(dx - 60, dbot - dh * 0.75, rk * 260, 0, Math.PI * 2); g.stroke(); g.restore(); }
      cnMotes(t, 60, 41, ['#ffe08a', '#ffffff', '#ffb040'], dx - 160, dbot - dh, 320, dh, 8, 26, 1, 0.9 * dk);
    }
    // the hero
    let hx = 170, hf = 1, pose = 'idle', hy = 0;
    if (u >= 1.6 && u < 2.1) { hx = 170 + 160 * ez(seg(u, 1.6, 2.1)); pose = 'run'; } else if (u >= 2.1) { hx = 330; hf = -1; }
    if (u >= 5.6 && !four) { pose = 'jump'; hy = -4 * ez(seg(u, 5.6, 6)); hf = -1; }
    if (four) { hx = 330 - 190 * ez(seg(v, 0.2, 3.2)); pose = v < 3.3 ? 'run' : 'jump'; hf = -1; }
    const HS = 2.4, spr = cnHeroSpr(pose, Math.floor(t * 12));
    if (u >= 1.6 && u < 2.3 && !four) for (let i = 1; i <= 5; i++) { const ghost = 170 + 160 * ez(seg(u - i * 0.04, 1.6, 2.1)); g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, ghost, CN_GY, false, true, HS, HS, 0.4 - i * 0.06); g.globalCompositeOperation = 'source-over'; }
    if (four) for (let i = 1; i <= 4; i++) { g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, hx + i * 9, CN_GY, true, true, HS, HS, 0.3 - i * 0.06); g.globalCompositeOperation = 'source-over'; }
    cnShadow(hx, CN_GY + 1, 18, 0.5, dragonOn ? -16 : 10);
    if (pose === 'jump' && !four) { const sw = cnSword(); g.save(); g.translate(hx + 2, CN_GY - spr.h * HS + 2 + hy); g.rotate(-Math.PI / 2); drawSpr(g, sw, sw.w * 0.8, sw.h * 0.6, false, false, 1.6, 1.6); g.restore(); }
    drawSpr(g, spr, Math.round(hx), Math.round(CN_GY + hy), hf < 0, false, HS, HS);
    // parry: a ring of white light where the axe hits the guard
    if (!four && u > 3.85 && u < 4.6) { const k = seg(u, 3.85, 4.6), px = hx - 12, py = CN_GY - 26; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(159,232,255,' + (1 - k) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 10 + k * 70, 0, Math.PI * 2); g.stroke(); g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(px + 6, py, 14, Math.PI - 1.1, Math.PI + 1.1); g.stroke(); g.restore(); cnGlow(px, py, 60, 'rgba(200,240,255,', 1 - k); for (let i = 0; i < 16; i++) { const a = i * 0.39, r = 8 + k * 90; g.fillStyle = i % 2 ? '#ffffff' : '#ffd34e'; g.fillRect(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.7, 2, 2); } }
    // a pillar of light and the cracking ground as the summon is called
    if (!four && u > 5.8 && u < 8.4) { const k = seg(u, 5.8, 7.2), f = 1 - seg(u, 7.6, 8.4); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(hx - 16, 0, hx + 16, 0); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(0.5, 'rgba(255,240,190,' + (0.8 * k * f) + ')'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.fillRect(hx - 16 - k * 10, -40, 32 + k * 20, CN_GY + 40); g.restore();
      g.strokeStyle = 'rgba(255,200,90,' + (0.9 * f) + ')'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { const d = i % 2 ? 1 : -1, L = k * (40 + i * 18); let px = hx, py = CN_GY + 2; g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 5; s++) { px += d * L / 5; py += ((i * 7 + s * 3) % 5 - 2) * 0.8 + 0.4; g.lineTo(px, py); } g.stroke(); } }
    // the charge: speed lines
    if (four && v < 3.5) { g.strokeStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 22; i++) { const y = 20 + (i * 47) % 170, x = ((t * 900 + i * 131) % (VW + 200)) - 100 + pan; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + (i % 4) * 14, y); g.stroke(); } }
    cnMotes(t, 50, 51, ['#ff8a3a', '#ffd34e'], pan, 20, VW, VH - 20, 10, 30, 1, 0.7);
    g.restore();
    const flash = (u > 4 && u < 4.25 ? 0.85 * (1 - seg(u, 4, 4.25)) : 0) + (u > 7.2 && u < 7.8 ? 1 - seg(u, 7.2, 7.8) : 0);
    return { bloom: 0.6 + blaze * 0.4 + (u >= 7.2 ? 0.25 : 0), thr: 0.9, grade: u >= 7.2 ? 'rgba(255,170,60,.3)' : 'rgba(255,90,60,.25)', vig: 0.6, white: flash };
  }
  function cnIntro4(t) {   // 45-60 s  the charge, freeze frame, black, the logo
    if (t < 50.8) {
      const v = t - 45, o = cnIntro3(t, true);
      if (v >= 3.5) { o.desat = 0.85; o.white = Math.max(o.white || 0, v < 3.7 ? 0.9 * (1 - seg(v, 3.5, 3.7)) : 0); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 2; for (let i = 0; i < 28; i++) { const a = i * 0.224, r0 = 70 + (i % 3) * 12; g.beginPath(); g.moveTo(VW / 2 + Math.cos(a) * r0, VH / 2 + Math.sin(a) * r0 * 0.6); g.lineTo(VW / 2 + Math.cos(a) * 320, VH / 2 + Math.sin(a) * 200); g.stroke(); } }
      o.black = seg(v, 4.9, 5.7);
      return o;
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    const L = cnLogo(), k = seg(t, 52.2, 55.6), ox = Math.round(VW / 2 - L.W / 2), oy = 64;
    for (const b of L.blocks) { if (b.r > k) continue; const fresh = k - b.r < 0.05; g.drawImage(L.c, b.x, b.y, 3, 3, ox + b.x, oy + b.y, 3, 3); if (fresh) { g.fillStyle = '#ffffff'; g.fillRect(ox + b.x, oy + b.y, 3, 3); } }
    const q = mulberry32(77); for (let i = 0; i < 26; i++) { const b = L.blocks[Math.floor(q() * L.blocks.length)], ph = q() * 6, s = Math.max(0, Math.sin(t * 3 + ph)); if (!b || b.r > k || s < 0.6) { q(); continue; } const sx = ox + b.x + 1, sy = oy + b.y + 1, r = 2 + q() * 3 * s; g.fillStyle = '#fffbe0'; g.fillRect(sx - r, sy, r * 2 + 1, 1); g.fillRect(sx, sy - r, 1, r * 2 + 1); }
    cnMotes(t, 50, 61, ['#ffd34e', '#ffe9a8'], 40, 50, VW - 80, 110, 0, 10, 1, 0.4 * k);
    const sk = seg(t, 55.4, 56.6); if (sk > 0) txt(sv('THE SHATTERED SUN', 'NGỌN ĐÈN CUỐI CÙNG'), VW / 2, oy + L.H + 8, { al: 'center', size: 8, bold: true, col: '#ffe9b8', ls: 3, alpha: sk, sh: false });
    if (t > 57.2) txt(sv('Press any key', 'Nhấn phím bất kỳ'), VW / 2, VH - CN_BAR - 10, { al: 'center', size: 6, col: '#8a7fa8', alpha: 0.5 + 0.5 * Math.sin(t * 4) });
    return { bloom: 0.9, thr: 0.95, vig: 0.4 };
  }

  // ---------- OUTRO ----------
  const cnQuoc = () => (typeof QUOC_IMG !== 'undefined' && QUOC_IMG.form7 && QUOC_IMG.form7.ready && QUOC_IMG.form7.frames[0]) || bossSprite(6);
  function cnOutro1(t) {   // 0-20 s  the last boss falls and turns to light; the clouds open
    const a = ez(seg(t, 8.5, 18)), sunY = 150 - 46 * a;
    g.drawImage(cnSky('osky1', [[0, '#0a0814'], [0.6, '#22182e'], [1, '#3a2030']]), 0, 0, VW, VH);
    if (a > 0) { g.globalAlpha = a; g.drawImage(cnSky('osky2', [[0, '#3a5a9a'], [0.55, '#e8a070'], [1, '#ffe0a0']]), 0, 0, VW, VH); g.globalAlpha = 1; }
    cnGlow(VW / 2, sunY, 120, 'rgba(255,220,140,', 0.75 * a); if (a > 0) { g.fillStyle = 'rgba(255,248,220,' + a + ')'; g.beginPath(); g.arc(VW / 2, sunY, 16, 0, Math.PI * 2); g.fill(); }
    const cl = cnClouds('ocl', '#1e1828', '#30283e');
    for (const side of [-1, 1]) { g.save(); g.beginPath(); g.rect(side < 0 ? 0 : VW / 2, 0, VW / 2, VH); g.clip(); g.translate(side * a * 250, 0); cnWrap(cl, t * 4, -4, 1 - a * 0.5); cnWrap(cl, t * 7 + 300, 30, 1 - a * 0.6); g.restore(); }
    cnRays(VW / 2, -30, Math.PI / 2, 11, 'rgba(255,225,160,', 0.2 * a, t, 330, 0.17);
    cnWrap(cnFar(), 200, 66, 1); g.globalAlpha = a * 0.5; g.fillStyle = '#ffb070'; g.globalCompositeOperation = 'soft-light'; g.fillRect(0, 60, VW, 120); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    cnWrap(cnMid(), 400, CN_GY - 128); cnWrap(cnGround(), 700, CN_GY - 6);
    // Quoc staggers, cracks fill with light, then he breaks into rising pixels
    const Qs = cnQuoc(), qh = 150, qw = Qs.w * qh / Qs.h, qx = 250 + Math.sin(t * 7) * (t < 5.5 ? 1.5 : 0), dk = seg(t, 5.5, 12.5);
    cnShadow(qx, CN_GY + 1, qw * 0.7 * (1 - dk), 0.5, -20);
    if (dk <= 0) { cnSolid(Qs.c, qx, CN_GY, qw, qh); const ck = seg(t, 2, 5.5); if (ck > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,240,200,' + ck + ')'; g.lineWidth = 1; for (let i = 0; i < 8; i++) { let px = qx - qw * 0.25 + i * qw * 0.06, py = CN_GY - qh * (0.2 + (i % 4) * 0.17); g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 4; s++) { px += ((i * 5 + s * 3) % 7 - 3) * 2.5 * ck; py -= 6 * ck; g.lineTo(px, py); } g.stroke(); } g.restore(); cnGlow(qx, CN_GY - qh * 0.5, 90, 'rgba(255,230,180,', ck * 0.4); } }
    else cnDissolve(Qs.c, qx, CN_GY, qw, qh, dk, 99, '#ffe9a8');
    if (dk > 0) cnMotes(t, 80, 71, ['#ffe9a8', '#ffffff', '#d58bff'], qx - 120, 0, 240, CN_GY, 6, 40, 1, 0.9 * (1 - seg(t, 13, 19)));
    const spr = cnHeroSpr('idle', Math.floor(t * 2.2)); cnShadow(104, CN_GY + 1, 18, 0.5, a > 0 ? -24 * a : 10); drawSpr(g, spr, 104, CN_GY, false, false, 2.4, 2.4);
    cnMotes(t, 40, 72, ['#ffe9a8'], 0, 30, VW, 150, 4, 8, 1, 0.5 * a);
    cnSub(sv('The darkness breaks. The Sun returns.', 'Bóng tối tan đi. Mặt Trời đã trở lại.'), t, 13, 19);
    return { bloom: 0.5 + a * 0.35, grade: a > 0.3 ? 'rgba(255,170,90,.3)' : 'rgba(90,70,150,.3)', vig: 0.65 - a * 0.2, black: 1 - seg(t, 0, 1.5) + seg(t, 19.6, 20) };
  }
  function cnOutro2(t) {   // 20-40 s  farewell: the Ancient summons bow and fly back to the sky as light
    const u = t - 20, z = 1 + u * 0.005;
    g.drawImage(cnSky('osky2', [[0, '#3a5a9a'], [0.55, '#e8a070'], [1, '#ffe0a0']]), 0, 0, VW, VH);
    cnGlow(VW * 0.7, 40, 140, 'rgba(255,230,160,', 0.6); cnRays(VW * 0.7, -20, Math.PI * 0.62, 9, 'rgba(255,230,170,', 0.16, t, 330, 0.16);
    g.save(); g.translate(VW / 2, CN_GY); g.scale(z, z); g.translate(-VW / 2, -CN_GY);
    cnWrap(cnHills('oh1', [[60, 10, '#7a7aa8'], [78, 8, '#6a6a90']]), u * 2, 40, 1);
    cnWrap(cnLayer('oh1b', 768, 120, (x, w, h) => x.drawImage(cnHills('oh1x', [[70, 9, '#5a7a6a'], [84, 7, '#4a6a5a']]), 0, 0), 2), u * 5, 54, 1);
    cnWrap(cnGrass(), 300 + u * 8, CN_GY - 6);
    const S = [['dragonking', 92, CN_GY + 4, 132, false], ['titan', 300, CN_GY + 4, 120, true], ['ninetail', 252, CN_GY + 6, 70, true], ['phoenix', 150, CN_GY - 70, 78, false]];
    const auraK = 1 - ez(seg(u, 6, 10)) * 0.8;
    S.forEach(([k, x, bot, h, flip], i) => {
      const nod = seg(u, 7.4 + i * 0.3, 8.4 + i * 0.3), dip = Math.sin(nod * Math.PI) * 5, rot = Math.sin(nod * Math.PI) * 0.06 * (flip ? -1 : 1), dk = seg(u, 10 + i * 1.4, 12.4 + i * 1.4), fly = k === 'phoenix' ? Math.sin(t * 2) * 3 : 0;
      const art = sumArt(k); if (!art || !art.evo) return; const w = art.evo.width * h / art.evo.height;
      if (dk <= 0) { cnShadow(x, CN_GY + 2, w * 0.5, k === 'phoenix' ? 0.15 : 0.35, -18); cnSum(k, x, bot + dip + fly, h * (1 + Math.sin(t * 2 + i) * 0.006), flip, 1, { glow: 0.55 * auraK, rot }); }
      else { cnDissolve(art.evo, x, bot + fly, w, h, dk, 17 + i * 31, '#fff6c0'); if (dk > 0.5) { const sk = seg(dk, 0.5, 1.6), sy = bot - h * 0.6 - sk * 260; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x, sy, x, sy + 70); gr.addColorStop(0, 'rgba(255,250,220,' + (1 - sk * 0.6) + ')'); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(x - 1.5, sy, 3, 70); g.restore(); cnGlow(x, sy, 18, 'rgba(255,255,230,', 1 - sk * 0.5); } }
    });
    const look = u > 11, spr = cnHeroSpr(look ? 'jump' : 'idle', Math.floor(t * 2.2)); cnShadow(196, CN_GY + 1, 18, 0.45, -22); drawSpr(g, spr, 196, CN_GY, u > 6 && u < 11 ? true : false, false, 2.6, 2.6);
    cnMotes(t, 60, 81, ['#fff6c0', '#ffd34e', '#ffffff'], 0, 20, VW, VH - 40, 4, 16, 1, 0.6);
    g.restore();
    const fg = cnLayer('ofg', 1400, 60, (x, w, h, q) => { for (let i = 0; i < 70; i++) { const sx = q() * w, L = 14 + q() * 30; x.fillStyle = '#1e3a1e'; x.fillRect(sx, h - L, 3, L); x.fillStyle = ['#ff8fbf', '#ffd34e', '#ffffff'][i % 3]; x.fillRect(sx - 2, h - L - 3, 6, 5); } }, 2.5);
    cnWrap(fg, 100 + u * 14, VH - 60);
    cnSub(sv('The friends who fought beside you...', 'Những người bạn đã cùng bạn chiến đấu...'), t, 21, 27);
    cnSub(sv('return to the sky. But their light stays.', 'trở về với bầu trời. Nhưng ánh sáng của họ vẫn ở lại.'), t, 31, 38);
    return { bloom: 0.65, thr: 0.8, grade: 'rgba(255,190,120,.3)', vig: 0.5, black: 1 - seg(t, 20, 20.8) + seg(t, 39.4, 40) };
  }
  function cnOutro3(t) {   // 40-60 s  a new journey: he walks into the sunset, then the screen goes dark and the credits roll
    const u = t - 40;
    g.drawImage(cnSky('osky3', [[0, '#2a1a4a'], [0.4, '#8a3a6a'], [0.7, '#ff7a4a'], [1, '#ffd08a']]), 0, 0, VW, VH);
    const sx = VW / 2, sy = 124; cnGlow(sx, sy, 180, 'rgba(255,170,90,', 0.7); cnGlow(sx, sy, 60, 'rgba(255,240,200,', 0.55);
    g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(sx, sy, 26, Math.PI, 0); g.fill();
    cnRays(sx, sy, -Math.PI / 2, 15, 'rgba(255,210,150,', 0.13, t, 260, 0.2);
    cnWrap(cnHills('os1', [[110, 6, '#6a3a6a']]), u * 1.5, 18, 1); cnWrap(cnHills('os2', [[118, 9, '#4a2448']]), u * 3, 22, 1); cnWrap(cnHills('os3', [[124, 6, '#2a1430']]), u * 5, 28, 1);
    // the road to the horizon
    g.fillStyle = '#1a0e1e'; g.fillRect(0, 150, VW, VH - 150); g.fillStyle = '#3a1e30'; g.beginPath(); g.moveTo(sx - 4, 150); g.lineTo(sx + 4, 150); g.lineTo(sx + 160, VH); g.lineTo(sx - 160, VH); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,190,120,.35)'; g.beginPath(); g.moveTo(sx - 1, 150); g.lineTo(sx + 1, 150); g.lineTo(sx + 30, VH); g.lineTo(sx - 30, VH); g.closePath(); g.fill();
    // he puts the sword away, turns and walks into the distance
    const p = ez(seg(u, 3, 15.5)), hy = VH - CN_BAR - 4 + (150 - (VH - CN_BAR - 4)) * p, hs = 4.2 - 3.5 * Math.pow(p, 0.7), walking = u > 3 && u < 15.5;
    const spr = cnHeroSpr(walking ? 'run' : 'idle', walking ? Math.floor(u * 6) : Math.floor(u * 2.2));
    g.save(); g.globalAlpha = 0.5; g.fillStyle = '#000'; g.beginPath(); g.moveTo(sx - 4 * hs, hy); g.lineTo(sx + 4 * hs, hy); g.lineTo(sx + 9 * hs, hy + 30 * hs); g.lineTo(sx - 9 * hs, hy + 30 * hs); g.closePath(); g.fill(); g.restore();
    if (u < 2.2) { const sw = cnSword(), k = ez(seg(u, 0.8, 2)); g.save(); g.globalAlpha = 1 - k; g.translate(sx + 5 * hs, hy - 9 * hs - k * 4 * hs); g.rotate(-0.4 - k * 2.4); drawSpr(g, sw, 0, 0, false, false, hs * 0.5, hs * 0.5); g.restore(); }
    g.save(); g.filter = 'brightness(0.05)'; drawSpr(g, spr, Math.round(sx + Math.sin(u * 3) * (walking ? 0.5 : 0)), Math.round(hy), u < 1.5, false, hs, hs); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.1; g.filter = 'blur(3px) brightness(1.6) sepia(1)'; drawSpr(g, spr, Math.round(sx), Math.round(hy - 1), u < 1.5, false, hs, hs); g.restore();
    for (let i = 0; i < 4; i++) { const bx = ((u * 22 + i * 60) % (VW + 80)) - 40, by = 50 + i * 9 + Math.sin(u + i) * 4, wv = Math.sin(t * 8 + i) * 2; g.fillStyle = '#2a1430'; g.fillRect(bx - 3, by + wv, 3, 1); g.fillRect(bx, by, 1, 1); g.fillRect(bx + 1, by + wv, 3, 1); }
    cnMotes(t, 50, 91, ['#ffd08a', '#ffffff'], 0, 40, VW, 140, 3, 6, 1, 0.45);
    cnSub(sv('One journey ends... and a new one begins.', 'Một hành trình kết thúc... và một hành trình mới bắt đầu.'), t, 44, 50.5);
    const dark = seg(u, 13, 16.5);
    if (u > 16.6) { const k = seg(u, 16.6, 17.6) * (1 - seg(u, 19.2, 20)); txt(sv('Thank you for playing', 'Cảm ơn bạn đã chơi'), VW / 2, VH / 2 - 8, { al: 'center', size: 10, bold: true, col: '#ffe9b8', glow: 'rgba(255,190,90,.7)', alpha: k, sh: false }); txt('Lê Minh Trí  &  Đặng Anh Quân', VW / 2, VH / 2 + 8, { al: 'center', size: 6.5, col: '#c8b8e8', alpha: k, sh: false }); }
    return { bloom: 0.5, thr: 0.75, grade: 'rgba(255,140,90,.3)', vig: 0.55 + dark * 0.4, black: 1 - seg(t, 40, 40.8) + dark };
  }
  function drawCine() {
    if (!cn) startCine('intro');
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    if (cn.gate) {
      const q = mulberry32(3); for (let i = 0; i < 60; i++) { g.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(sceneT * (1 + q() * 2) + i)); g.fillStyle = '#9a90c8'; g.fillRect((q() * VW) | 0, (q() * VH) | 0, 1, 1); } g.globalAlpha = 1; sceneT += 1 / 60;
      txt(sv('Press any key to begin', 'Nhấn phím bất kỳ để bắt đầu'), VW / 2, VH / 2, { al: 'center', size: 8, col: '#ffe9b8', alpha: 0.55 + 0.45 * Math.sin(sceneT * 3), sh: false });
      txt(sv('(headphones recommended)', '(nên đeo tai nghe)'), VW / 2, VH / 2 + 14, { al: 'center', size: 5.5, col: '#8a7fa8', sh: false });
      return;
    }
    const t = cn.t; let o;
    if (cn.kind === 'intro') o = t < 15 ? cnIntro1(t) : t < 30 ? cnIntro2(t) : t < 45 ? cnIntro3(t) : cnIntro4(t);
    else o = t < 20 ? cnOutro1(t) : t < 40 ? cnOutro2(t) : cnOutro3(t);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    cnPost(o);
  }
  // ===================== CREDITS =====================
  let cred = null;
  const CREDITS_LINES = () => [
    ['logo', 'LAST LANTERN'], ['sub', sv('THE SHATTERED SUN', 'NGỌN ĐÈN CUỐI CÙNG')], ['gap'],
    ['h', sv('MADE BY', 'ĐƯỢC THỰC HIỆN BỞI')], ['p', sv('A team of 2', 'Đội ngũ gồm 2 thành viên')], ['gap'],
    ['name', 'Lê Minh Trí', '(Lee San Tree)'], ['name', 'Đặng Anh Quân', '(David Quan)'], ['gap'],
    ['h', sv('IMPORTANT', 'ĐIỀU QUAN TRỌNG')],
    ['p', sv('Your progress is saved automatically at every checkpoint, on this device only.', 'Tiến trình được tự động lưu ở mỗi checkpoint, chỉ trên thiết bị này.')],
    ['p', sv('Co-op supports up to 5 players: share the room code with your friends.', 'Chơi co-op tối đa 5 người: hãy gửi mã phòng cho bạn bè.')],
    ['p', sv('The secret references hidden in the game are tributes only: no original names, logos or pictures are used.', 'Các chi tiết bí mật ẩn trong game chỉ là lời tri ân, không dùng tên, logo hay hình ảnh gốc của bất kỳ tác phẩm nào.')], ['gap'],
    ['h', sv('THANK YOU', 'CẢM ƠN')], ['p', sv('To everyone who tested, shared and played the game.', 'Gửi tới tất cả những ai đã chơi thử, chia sẻ và ủng hộ game.')],
    ['p', sv('Keep your lantern burning.', 'Hãy giữ ngọn đèn của bạn luôn cháy sáng.')], ['gap'],
    ['p', sv('Test build: the singer hero is a fan tribute to Hatsune Miku (c) Crypton Future Media, used under the Piapro license for non-commercial use.', 'Bản thử nghiệm: hero ca sĩ là fan tribute Hatsune Miku (c) Crypton Future Media, dùng theo giấy phép Piapro, chỉ phi thương mại.')],
    ['p', '© 2026 Lê Minh Trí & Đặng Anh Quân'], ['p', sv('All rights reserved.  Version 1.0', 'Bảo lưu mọi quyền.  Phiên bản 1.0')], ['gap'], ['gap'], ['end', sv('Press ENTER or click to go back', 'Nhấn ENTER hoặc bấm chuột để quay lại')]
  ];
  function updateCredits(dt) { if (!cred) cred = { t: 0 }; cred.t += dt; sceneT += dt; if ((act.okP || act.backP || act.atkP) && cred.t > 0.3) { Snd.play('select'); toScene('title'); } }
  function drawCredits() {
    if (!cred) cred = { t: 0 }; const t = cred.t, A = titleArt();
    g.drawImage(A.sky, 0, 0);
    for (const s of A.stars) { g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(sceneT * s.v + s.p)); g.fillStyle = s.c; g.fillRect(s.x, s.y, s.s, s.s); } g.globalAlpha = 1;
    for (const [im, f, y] of [[A.m1, 0.02, 84], [A.m2, 0.05, 106], [A.m3, 0.1, 128]]) { const ox = -((sceneT * 6 * f * 10) % 768); g.drawImage(im, Math.round(ox), y); g.drawImage(im, Math.round(ox) + 768, y); }
    g.fillStyle = 'rgba(4,2,12,.72)'; g.fillRect(0, 0, VW, VH);
    for (const f of A.flies) { const x = f.x + Math.sin(sceneT * f.sp + f.ph) * f.r, y = f.y - 60 + Math.cos(sceneT * f.sp * 1.3 + f.ph) * 6; g.globalAlpha = 0.3 + 0.5 * Math.max(0, Math.sin(sceneT * 2 + f.ph)); g.fillStyle = '#ffe066'; g.fillRect(Math.round(x), Math.round(y), 2, 2); } g.globalAlpha = 1;
    const L = CREDITS_LINES(), LH = { logo: 40, sub: 16, gap: 14, h: 18, p: 12, name: 30, end: 20 };
    let total = 0; for (const l of L) total += l[0] === 'p' ? wrapText(l[1], 62).length * 9 + 4 : LH[l[0]]; const scroll = Math.min(t * 15, total - 160);
    let y = VH - 10 - scroll;
    for (const l of L) {
      const type = l[0], h = type === 'p' ? wrapText(l[1], 62).length * 9 + 4 : LH[type], cy = y + h / 2;
      if (cy > -10 && cy < VH + 10) {
        const fade = clamp(Math.min(cy / 28, (VH - cy) / 28), 0, 1);
        if (type === 'logo') txt(l[1], VW / 2, cy, { al: 'center', size: 22, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.8)', ls: 2, sh: false, alpha: fade });
        else if (type === 'sub') txt(l[1], VW / 2, cy, { al: 'center', size: 8, bold: true, col: '#ffe9b8', ls: 3, ol: '#1a0814', sh: false, alpha: fade });
        else if (type === 'h') { txt(l[1], VW / 2, cy, { al: 'center', size: 9, bold: true, col: '#ffd34e', ls: 3, ol: '#1a0814', glow: 'rgba(255,170,60,.6)', sh: false, alpha: fade }); g.globalAlpha = fade * 0.6; g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 60, Math.round(cy + 8), 120, 1); g.globalAlpha = 1; }
        else if (type === 'p') wrapText(l[1], 62).forEach((ln, j) => txt(ln, VW / 2, cy + j * 9, { al: 'center', size: 7, col: '#e8eaf5', alpha: fade }));
        else if (type === 'name') { lanternIc(VW / 2 - 98, Math.round(cy), fade); lanternIc(VW / 2 + 98, Math.round(cy), fade); txt(l[1], VW / 2, cy - 4, { al: 'center', size: 12, bold: true, col: '#ffffff', ol: '#2a0a10', glow: 'rgba(255,200,100,.8)', sh: false, alpha: fade }); txt(l[2], VW / 2, cy + 8, { al: 'center', size: 7, col: '#ffd34e', alpha: fade }); }
        else if (type === 'end') txt(l[1], VW / 2, cy, { al: 'center', size: 6.5, col: '#b8a8d8', alpha: fade * (0.5 + 0.5 * Math.abs(Math.sin(sceneT * 3))) });
      }
      y += h;
    }
    g.drawImage(A.vig, 0, 0);
    txt(sv('ENTER / click: back', 'ENTER / bấm chuột: quay lại'), VW - 6, VH - 6, { al: 'right', size: 5, col: '#6a6a8a' });
  }
  function frame(now) {
    requestAnimationFrame(frame);
    step(now);
  }
  // browsers stop requestAnimationFrame in hidden tabs; during co-op a worker keeps the game ticking so a host
  // (or guest) in a background tab keeps playing - handy when testing with two tabs on one computer
  try {
    const wk = new Worker(URL.createObjectURL(new Blob(['setInterval(() => postMessage(0), 16)'], { type: 'text/javascript' })));
    wk.onmessage = () => { if (document.hidden && coop) step(performance.now()); };
  } catch (e) {}
  function step(now) {
    let dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    readInput();
    coopClientInput();
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
        if (scene === 'play') { if (coop && coop.role === 'client') coopClientTick(sub); else updatePlay(sub); }
        else if (scene === 'coop') updateCoop(sub);
        if (scene === 'shop' && coop && coop.role === 'host' && Q) { const keep = Object.assign({}, act); for (const k in act) act[k] = false; try { updatePlay(sub); } finally { Object.assign(act, keep); } updateShopScene(sub); }
        else if (scene === 'title') updateTitle(sub);
        else if (scene === 'story' || scene === 'ending') updateStory(sub);
        else if (scene === 'opening') updateOpening(sub);
        else if (scene === 'intro' || scene === 'outro') updateCine(sub);
        else if (scene === 'credits') updateCredits(sub);
        else if (scene === 'map') updateMap(sub);
        else if (scene === 'shop') updateShopScene(sub);
        else if (scene === 'castle') updateCastle(sub);
        else if (scene === 'ride') updateRide(sub);
        else if (scene === 'cutscene') updateCut(sub);
        if (i === 0) clearPressed();
        if (fadeTo) break;
      }
      if (fadeIn > 0) fadeIn = Math.max(0, fadeIn - dt / 0.25);
      if (coop && coop.role === 'host' && (scene === 'play' || scene === 'shop') && Q) coopHostNet(dt);
    }
    // render
    g.imageSmoothingEnabled = false;
    hiOn = scene === 'play' && !!Q && Q.state === 'play' && !fadeTo && scale >= 2; HIQ.length = 0;
    if (scene === 'play' && Q) drawPlay();
    else if (scene === 'title') drawTitle();
    else if (scene === 'story' || scene === 'ending') drawStory();
    else if (scene === 'opening') drawOpening();
    else if (scene === 'intro' || scene === 'outro') drawCine();
    else if (scene === 'credits') drawCredits();
    else if (scene === 'map') drawMap();
    else if (scene === 'shop') drawShop();
    else if (scene === 'castle' && castle) drawCastle();
    else if (scene === 'ride' && ride) drawRide();
    else if (scene === 'cutscene' && cut) drawCut();
    else if (scene === 'coop') drawCoop();
    cv.style.cursor = (scene === 'play' && Q && Q.state === 'play') ? 'crosshair' : (scene === 'play' || scene === 'title' || scene === 'map' ? 'pointer' : 'default');
    const f = fadeTo ? fade : fadeIn;
    if (f > 0) { g.globalAlpha = Math.min(1, f); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    if (HIQ.length) drawHiQ();
    if (coop && coop.kbps && location.search.indexOf('netstat') >= 0) txt('NET: ' + coop.kbps + ' KB/s per guest  (~' + Math.round(coop.kbps * 3.6) + ' MB per hour)', 4, VH - 6, { size: 5, col: '#9fe8ff' });
    if (skipShown()) {
      const [bx, by, bw, bh] = [VW - 62, 3, 58, 12], hot = mouse.gx >= bx && mouse.gx <= bx + bw && mouse.gy >= by && mouse.gy <= by + bh;
      g.fillStyle = hot ? '#5a4210' : '#1b1430'; g.fillRect(bx, by, bw, bh);
      g.fillStyle = hot ? '#ffd34e' : '#c89a1c'; g.fillRect(bx, by, bw, 1); g.fillRect(bx, by + bh - 1, bw, 1); g.fillRect(bx, by, 1, bh); g.fillRect(bx + bw - 1, by, 1, bh);
      txt(sv('SKIP  (Esc)', 'BỎ QUA  (Esc)'), bx + bw / 2, by + 6, { al: 'center', size: 6.5, col: hot ? '#fff' : '#ffe9b8', bold: true });
    }
    flushTexts();
    drawTouch();
  }
  let fadeIn = 0;
  enterScene(location.search.length > 1 ? 'title' : 'intro');
  requestAnimationFrame(frame);
  if (DEMO) { save.leek = true; save.cleared = [0]; save.inv.own = ['iron', 'leek']; save.inv.w = ['leek', null]; save.inv.armor = null; save.inv.pet = null; save.ammo = { dagger: 9, bomb: 3, flask: 3 }; startLevel(0); Q.state = 'play'; Q.msg = 'LEEK DEMO: J / click = swing (3 light beams). Hit = heal + stun. Under 15% HP = leek tornado.'; Q.msgT = 12; }
  // ?quoc=N jumps straight into the final fight at Quoc's form N (0-7) - handy for checking the boss
  // ?level=N (0-9) starts that map from its beginning, handy for testing a map without unlocking it
  { const m = location.search.match(/[?&]level=(\d)/); if (m) setTimeout(() => { startLevel(+m[1]); }, 400); }
  // ?boss=7|8|9 jumps straight into the Spore Queen / Kraken / Gravemaw fight (click or press a key once so the browser allows sound)
  { const m = location.search.match(/[?&]boss=(\d)/);
    if (m && [7, 8, 9].indexOf(+m[1]) >= 0) setTimeout(() => {
      startLevel(+m[1]); Q.state = 'play'; const ar = Q.L.arena; Q.P.x = (ar.x0 + 8) * TS; Q.P.y = (ar.gy - 2) * TS; Q.P.inv = 3; Q.zoom = Q.B.zoom || 1; snapCam(); Q.msg = 'Click once to turn the sound on'; Q.msgT = 5;
    }, 400); }
  { const m = location.search.match(/quoc=(\d)/);
    if (m) setTimeout(() => {
      const n = Math.min(7, +m[1]); startLevel(6); Q.state = 'play';
      const ar = Q.L.arena; Q.P.x = (ar.x0 + 6) * TS; Q.P.y = (ar.gy - 1) * TS - Q.P.h; snapCam();
      seal(); if (n > 0) { applyForm(Q.boss, n); Q.boss.st = 'intro'; Q.boss.timer = 0; Q.boss.invul = 0; } if (n >= 3) spawnAllies();
    }, 400); }
  { const m = location.search.match(/room=([A-Za-z0-9]{5})/); if (m) setTimeout(() => { enterScene('coop'); coopJoin(m[1]); }, 300); }
  if (location.search.indexOf('debug') >= 0) window.LL = { getCtx: () => g, get titleSel() { return titleSel; }, setTitleSel: v => { titleSel = v; }, updateTitle, titleLayout, titleItems, titleState: () => title, sumArt, drawSumArt, SUM_H, summonItems, castSummons, get FAN_IMG() { return FAN_IMG; }, FAN_RIG, useSk, chargeHit, slotId, skNeed, petMorph, startCine, get cn() { return cn; }, drawCine, spawnSummon, updateSummons, sumTarget, summonSprite, summonParts, GIANT, BEAST, dragonSprite, startLevel, coopJoin, coopStart, coopHostNet, coopClientInput, coopClientTick, coopInit, newPlayer, asP, coopHostPlayers, mkCoopTest() { coopInit('host'); coop.me = 0; Q.me = Q.P; Q.P.slot = 0; setHero(Q.P, 'ember'); const p = newPlayer(); p.slot = 1; p.x = Q.P.x - 10; p.y = Q.P.y; p.safe = { x: p.x, y: p.y }; p.bag = { w: ['iron', null], armor: null, pet: null, own: ['iron'] }; p.ammo = { dagger: 5, bomb: 2, flask: 2 }; p.wcd = [0, 0]; p.wmax = [1, 1]; setHero(p, 'ember'); Q.players = [Q.P, p]; return p; }, get Q() { return Q; }, save, genLevel, BIOMES, setScene: s => { scene = s; }, startCut: li => { cutLevel = li; enterScene('cutscene'); }, cutAdv: sec => { for (let i = 0; i < sec * 100; i++) updateCut(0.01); return cut.phase + ' line ' + cut.i; }, cutNext: () => { act.okP = true; updateCut(0.01); act.okP = false; return cut.i; }, EN, BOSS, NPCS, kingSprite, horseSprite, hurtBoss, nextForm, spawnAllies, beginMini, makeFormBoss, FORMS, MINI, completeLevel, updatePlay, act, enterScene, equipItem, fireWeapon, useSlot, updateShopScene, drawShop, pressed, owned, cardAct, setTab, foes, hurtPlayer, grantLeek, openCard: id => { shopCard = { it: ITEM[id], opt: 0 }; }, shopSel: i => { shopIdx = i; }, get scene() { return scene; }, get op() { return op; }, startOpening, get coop() { return coop; }, resumeLevel, NET, coopUI, HEROES, setHero, heroSkill, clearPressed, solid, ch, maxHP, openGate, explode, solveAll() { for (const gd of Q.gates) { if (!gd.open) openGate(gd, true); if (gd.need === 'timed') gd.timer = 1e9; } for (const w of Q.L.xwalls) for (const t of w.tiles) { Q.L.grid[t[1]][t[0]] = ' '; Q.brokenX.add(t[0] + ',' + t[1]); } } };
})();
