// 30 co-op heroes: a palette for Ember's body, a hat or accessory, small stat changes and one special skill (R / gamepad RB)
// sw keys repaint the hero sprite: f/o = plume, r = scarf + helm band, a/A = light/mid armour, q = dark armour, b = tunic, n = belt
const HERO_CLS = {
  war: { en: 'Warrior', vi: 'Kiếm sĩ', col: '#ffb04a' }, mage: { en: 'Mage', vi: 'Pháp sư', col: '#a98bff' }, rng: { en: 'Ranger', vi: 'Cung thủ', col: '#7ed957' },
  tank: { en: 'Guardian', vi: 'Hộ vệ', col: '#8fb4ff' }, sin: { en: 'Assassin', vi: 'Sát thủ', col: '#ff5a6a' }, sup: { en: 'Support', vi: 'Hỗ trợ', col: '#ff9fd0' }
};
const H2 = (en, vi) => ({ en, vi });
const HEROES = [
  { id: 'ember', name: H2('Ember', 'Ember'), cls: 'war', sw: {}, hat: null, hp: 0, spd: 0, dmg: 0, sk: { k: 'nova', cd: 9, col: '#ffd34e', r: 70, d: 6, n: H2('Lantern Burst', 'Bùng Nổ Đèn Lồng') } },
  { id: 'lyra', name: H2('Lyra', 'Lyra'), cls: 'sup', sw: { a: '#d8fbf6', A: '#6ee7f2', q: '#2c9ab8', b: '#ff7fb0', r: '#6ee7f2', f: '#a4ffc0', o: '#6ee7f2', y: '#ffffff' }, hat: 'twin', hatCol: '#3ad6c8', hp: 0, spd: 0.05, dmg: -1, sk: { k: 'heal', cd: 12, col: '#a4ffc0', r: 110, d: 2, n: H2('Leek Song', 'Khúc Hát Hành Lá') } },
  { id: 'quan', name: H2('QuanSadBoy', 'QuanSadBoy'), cls: 'mage', sw: { a: '#cdb8ff', A: '#8e6bff', q: '#3a2a70', b: '#5a2d8f', r: '#a98bff', f: '#cdb8ff', o: '#8e6bff' }, hat: 'hood', hatCol: '#4a3590', hp: 0, spd: 0, dmg: 0, sk: { k: 'volley', cd: 8, col: '#a98bff', n8: 6, d: 4, home: true, shape: 'orb', n: H2('Book Storm', 'Bão Sách') } },
  { id: 'hoang', name: H2('HoangKiller', 'HoangKiller'), cls: 'sin', sw: { a: '#5a5a6a', A: '#2d2d3a', q: '#16161e', b: '#2d2d3a', r: '#e0453a', f: '#e0453a', o: '#8e2335' }, hat: 'mask', hatCol: '#e0453a', hp: -1, spd: 0.15, dmg: 1, sk: { k: 'dash', cd: 7, col: '#e0453a', d: 9, n: H2('Shadow Flurry', 'Chém Bóng') } },
  { id: 'duong', name: H2('DuongDracular', 'DuongDracular'), cls: 'mage', sw: { a: '#c0304a', A: '#7a1a2a', q: '#2a0e18', b: '#14121f', r: '#c0304a', f: '#c07bff', o: '#7a1a2a', y: '#ff3a3a' }, hat: 'collar', hatCol: '#7a1a2a', cape: '#2a0e18', hp: 0, spd: 0, dmg: 0, sk: { k: 'drain', cd: 10, col: '#c0304a', d: 6, n: H2('Blood Drain', 'Hút Máu') } },
  { id: 'santree', name: H2('Santree', 'Santree'), cls: 'tank', sw: { a: '#8ad060', A: '#5fcf5a', q: '#2b5a2e', b: '#8a6a44', r: '#5fcf5a', f: '#a4e86b', o: '#2b8a3e' }, hat: 'leaf', hatCol: '#5fcf5a', hp: 2, spd: -0.1, dmg: 0, sk: { k: 'shield', cd: 14, col: '#5fcf5a', r: 140, n: H2('Evergreen Guard', 'Lá Chắn Xanh') } },
  { id: 'frost', name: H2('Frostbyte', 'Băng Tâm'), cls: 'mage', sw: { a: '#e8fbff', A: '#9fe8ff', q: '#2c6a9c', b: '#bfeaff', r: '#6ec8f0', f: '#ffffff', o: '#9fe8ff' }, hat: 'crystal', hatCol: '#bfeaff', aura: '#bfeaff', hp: 0, spd: 0, dmg: 0, sk: { k: 'freeze', cd: 13, col: '#9fe8ff', d: 3, n: H2('Deep Freeze', 'Đóng Băng') } },
  { id: 'blaze', name: H2('Blaze', 'Hỏa Long'), cls: 'war', sw: { a: '#ffb04a', A: '#e0453a', q: '#6a1a12', b: '#f08a2b', r: '#ffd34e', f: '#ffd34e', o: '#ff6a3a' }, hat: 'horns', hatCol: '#ffd34e', flame: true, hp: 0, spd: 0, dmg: 1, sk: { k: 'meteor', cd: 10, col: '#ff7a2a', r: 46, d: 10, n: H2('Meteor', 'Thiên Thạch') } },
  { id: 'volt', name: H2('Volt', 'Lôi Vũ'), cls: 'mage', sw: { a: '#fff6a0', A: '#ffd34e', q: '#3a3a6a', b: '#4a8bf0', r: '#ffe44e', f: '#9fe8ff', o: '#ffe44e' }, hat: 'spiky', hatCol: '#ffe44e', hp: 0, spd: 0.05, dmg: 0, sk: { k: 'chain', cd: 8, col: '#ffe44e', d: 6, n8: 6, n: H2('Chain Lightning', 'Sét Dây Chuyền') } },
  { id: 'aria', name: H2('Aria', 'Phong Ca'), cls: 'rng', sw: { a: '#dff6ff', A: '#7ec8a8', q: '#2a5a4a', b: '#a4e8c8', r: '#ffffff', f: '#dff6ff', o: '#7ec8a8' }, hat: 'feather', hatCol: '#7ec8a8', hp: 0, spd: 0.1, dmg: 0, sk: { k: 'rain', cd: 9, col: '#dff6ff', d: 3, n8: 14, n: H2('Arrow Rain', 'Mưa Tên') } },
  { id: 'thorn', name: H2('Thorn', 'Gai Rừng'), cls: 'rng', sw: { a: '#a4e86b', A: '#5a8a3a', q: '#2a3a1a', b: '#6a4a2a', r: '#9be564', f: '#c070ff', o: '#5a8a3a' }, hat: 'hoodg', hatCol: '#3a5a2a', hp: 0, spd: 0.05, dmg: 0, sk: { k: 'volley', cd: 7, col: '#9be564', n8: 5, d: 3, poison: true, shape: 'arrow', n: H2('Venom Volley', 'Loạt Tên Độc') } },
  { id: 'titan', name: H2('Titan', 'Thạch Thần'), cls: 'tank', sw: { a: '#c8b89a', A: '#8a7a5a', q: '#3a3226', b: '#6a5a44', r: '#c89a1c', f: '#c8b89a', o: '#8a7a5a' }, hat: 'helm', hatCol: '#8a7a5a', hp: 3, spd: -0.15, dmg: 0, sk: { k: 'quake', cd: 10, col: '#c8a070', r: 130, d: 7, n: H2('Earthquake', 'Động Đất') } },
  { id: 'nova', name: H2('Nova', 'Tinh Tú'), cls: 'mage', sw: { a: '#e0d0ff', A: '#5a4ad0', q: '#1a1640', b: '#2a2a6a', r: '#ffe08a', f: '#ffffff', o: '#ffe08a' }, hat: 'star', hatCol: '#ffe08a', aura: '#8e6bff', hp: 0, spd: 0, dmg: 0, sk: { k: 'hole', cd: 14, col: '#8e6bff', r: 84, n: H2('Black Hole', 'Hố Đen') } },
  { id: 'kuro', name: H2('Kuro', 'Hắc Miêu'), cls: 'sin', sw: { a: '#4a4a5a', A: '#24242e', q: '#101016', b: '#3a3a4a', r: '#ffd34e', f: '#24242e', o: '#4a4a5a', y: '#ffe44e' }, hat: 'cat', hatCol: '#24242e', hp: -1, spd: 0.2, dmg: 1, sk: { k: 'dash', cd: 6, col: '#ffe44e', d: 8, n: H2('Nine Lives Strike', 'Cú Vồ Chín Mạng') } },
  { id: 'sakura', name: H2('Sakura', 'Anh Đào'), cls: 'war', sw: { a: '#ffe0ec', A: '#ff9fc0', q: '#8a3a5a', b: '#ffffff', r: '#ff7fb0', f: '#ffd0e4', o: '#ff7fb0' }, hat: 'flower', hatCol: '#ff7fb0', hp: 0, spd: 0.05, dmg: 0, sk: { k: 'blades', cd: 9, col: '#ff9fc0', d: 4, n8: 8, n: H2('Petal Blades', 'Cánh Hoa Kiếm') } },
  { id: 'rex', name: H2('Rex', 'Khủng Long Con'), cls: 'tank', sw: { a: '#9be564', A: '#4aa04a', q: '#1e4a26', b: '#f2e0a0', r: '#ff9a4a', f: '#9be564', o: '#4aa04a' }, hat: 'dino', hatCol: '#4aa04a', hp: 2, spd: 0, dmg: 0, sk: { k: 'quake', cd: 9, col: '#9be564', r: 110, d: 6, n: H2('Dino Stomp', 'Dậm Chân Khủng Long') } },
  { id: 'pip', name: H2('Pip', 'Thỏ Ngọc'), cls: 'sup', sw: { a: '#ffffff', A: '#e8e0f0', q: '#8a80a0', b: '#ff9fd0', r: '#ff7fb0', f: '#ffffff', o: '#ffd0e4' }, hat: 'bunny', hatCol: '#ffffff', hp: 0, spd: 0.15, dmg: -1, sk: { k: 'heal', cd: 11, col: '#ff9fd0', r: 120, d: 2, n: H2('Carrot Picnic', 'Tiệc Cà Rốt') } },
  { id: 'zephyr', name: H2('Zephyr', 'Gió Tây'), cls: 'rng', sw: { a: '#f0f4ff', A: '#8ab0d8', q: '#2a3a5a', b: '#4a6a9c', r: '#bfeaff', f: '#ffffff', o: '#8ab0d8' }, hat: 'cap', hatCol: '#4a6a9c', cape: '#8ab0d8', hp: 0, spd: 0.2, dmg: 0, sk: { k: 'snipe', cd: 7, col: '#bfeaff', d: 12, n: H2('Piercing Gale', 'Mũi Tên Gió Xuyên') } },
  { id: 'grim', name: H2('Grim', 'Tử Thần'), cls: 'sin', sw: { a: '#cfd6e6', A: '#3a3a4a', q: '#14121f', b: '#24202e', r: '#7a5ad0', f: '#3a3a4a', o: '#14121f', y: '#a98bff' }, hat: 'skull', hatCol: '#e8dfc0', cape: '#14121f', hp: 0, spd: 0.05, dmg: 1, sk: { k: 'reap', cd: 11, col: '#a15be0', r: 56, d: 12, n: H2('Soul Reap', 'Gặt Linh Hồn') } },
  { id: 'sol', name: H2('Sol', 'Thái Dương'), cls: 'tank', sw: { a: '#fff6c0', A: '#ffd34e', q: '#8a6a1a', b: '#ffffff', r: '#ffd34e', f: '#ffffff', o: '#ffd34e' }, hat: 'halo', hatCol: '#ffe08a', aura: '#ffe08a', hp: 2, spd: -0.05, dmg: 0, sk: { k: 'bless', cd: 15, col: '#ffe08a', r: 140, d: 1, n: H2('Sun Blessing', 'Phước Lành Mặt Trời') } },
  { id: 'luna', name: H2('Luna', 'Nguyệt Nữ'), cls: 'mage', sw: { a: '#e0e8ff', A: '#8a9ad8', q: '#2a2a5a', b: '#c0c8f0', r: '#cdb8ff', f: '#ffffff', o: '#cdb8ff' }, hat: 'tiara', hatCol: '#cfe8ff', hp: 0, spd: 0, dmg: 0, sk: { k: 'volley', cd: 8, col: '#cfe8ff', n8: 5, d: 5, home: true, shape: 'orb', n: H2('Moon Shards', 'Mảnh Trăng') } },
  { id: 'brick', name: H2('Brick', 'Thợ Rèn'), cls: 'tank', sw: { a: '#c0c8dc', A: '#6a7388', q: '#2a2e40', b: '#8a5a34', r: '#ff9a4a', f: '#ff9a4a', o: '#c85a3a' }, hat: 'goggles', hatCol: '#8a5a34', hp: 2, spd: -0.05, dmg: 0, sk: { k: 'rage', cd: 16, col: '#ff9a4a', n: H2('War Cry', 'Tiếng Hô Xung Trận') } },
  { id: 'jinx', name: H2('Jinx', 'Phù Thủy Nhí'), cls: 'mage', sw: { a: '#c070ff', A: '#5a2d8f', q: '#2a1440', b: '#2a1440', r: '#9be564', f: '#9be564', o: '#5a2d8f' }, hat: 'witch', hatCol: '#2a1440', hp: 0, spd: 0, dmg: 0, sk: { k: 'hole', cd: 13, col: '#9be564', r: 70, n: H2('Cauldron Vortex', 'Xoáy Vạc Thuốc') } },
  { id: 'kai', name: H2('Kai', 'Lướt Sóng'), cls: 'war', sw: { a: '#bfeaff', A: '#2c9ab8', q: '#1a3a5a', b: '#ffd34e', r: '#4a8bf0', f: '#6ee7f2', o: '#2c9ab8' }, hat: 'bandana', hatCol: '#4a8bf0', hp: 1, spd: 0.05, dmg: 0, sk: { k: 'wave', cd: 8, col: '#6ee7f2', d: 6, n: H2('Tidal Wave', 'Sóng Thần') } },
  { id: 'oni', name: H2('Oni', 'Quỷ Đỏ'), cls: 'war', sw: { a: '#ff8a7a', A: '#c0302a', q: '#4a1010', b: '#2a2a3a', r: '#ffd34e', f: '#ffd34e', o: '#c0302a' }, hat: 'onihorn', hatCol: '#ffd34e', hp: 1, spd: 0, dmg: 1, sk: { k: 'rage', cd: 14, col: '#e0453a', n: H2('Demon Fury', 'Cuồng Nộ Quỷ') } },
  { id: 'mochi', name: H2('Mochi', 'Bánh Dẻo'), cls: 'sup', sw: { a: '#fff6f0', A: '#ffd0b0', q: '#a07060', b: '#a4e86b', r: '#ff9fd0', f: '#fff6f0', o: '#ffd0b0' }, hat: 'bun', hatCol: '#5a3a22', hp: 1, spd: 0, dmg: -1, sk: { k: 'bless', cd: 13, col: '#ffd0e4', r: 120, d: 1, n: H2('Sweet Hug', 'Cái Ôm Ngọt Ngào') } },
  { id: 'ace', name: H2('Ace', 'Xạ Thủ'), cls: 'rng', sw: { a: '#e8dfc0', A: '#8a6a44', q: '#3a2a1a', b: '#5a3a22', r: '#e0453a', f: '#e8dfc0', o: '#8a6a44' }, hat: 'cowboy', hatCol: '#8a6a44', hp: 0, spd: 0.05, dmg: 1, sk: { k: 'snipe', cd: 6, col: '#ffd34e', d: 14, n: H2('Dead-Eye Shot', 'Phát Bắn Tử Thần') } },
  { id: 'yuki', name: H2('Yuki', 'Tuyết Hồ'), cls: 'mage', sw: { a: '#ffffff', A: '#cfe8ff', q: '#6a8ab0', b: '#9fe8ff', r: '#ff9a4a', f: '#ffffff', o: '#cfe8ff' }, hat: 'fox', hatCol: '#ffffff', hp: 0, spd: 0.1, dmg: 0, sk: { k: 'freeze', cd: 12, col: '#cfe8ff', d: 4, n: H2('Snow Fox Blizzard', 'Bão Tuyết Hồ Ly') } },
  { id: 'drake', name: H2('Drake', 'Kỵ Sĩ Rồng'), cls: 'war', sw: { a: '#ff9a6a', A: '#a02a2a', q: '#3a0e0e', b: '#14121f', r: '#ffd34e', f: '#ff6a3a', o: '#a02a2a' }, hat: 'helm', hatCol: '#a02a2a', wings: 'dragon', hp: 1, spd: 0, dmg: 1, sk: { k: 'meteor', cd: 11, col: '#ff4a2a', r: 56, d: 12, n: H2('Dragon Dive', 'Rồng Bổ Nhào') } },
  { id: 'seraph', name: H2('Seraph', 'Thiên Sứ'), cls: 'sup', sw: { a: '#ffffff', A: '#e8e0c0', q: '#a09060', b: '#ffffff', r: '#ffe08a', f: '#ffffff', o: '#ffe08a' }, hat: 'halo', hatCol: '#fff6c0', wings: 'angel', hp: 1, spd: 0, dmg: -1, sk: { k: 'bless', cd: 14, col: '#fff6c0', r: 160, d: 2, n: H2('Holy Light', 'Ánh Sáng Thánh') } }
];
const HERO = {}; HEROES.forEach(h => { HERO[h.id] = h; });
const SKILL_DESC = {
  nova: H2('Blast everything around you.', 'Nổ tung mọi thứ xung quanh.'),
  heal: H2('Heal yourself and nearby friends.', 'Hồi máu cho bạn và đồng đội gần.'),
  volley: H2('Fire a fan of magic shots.', 'Bắn một loạt đạn phép.'),
  dash: H2('Dash through enemies, slicing them.', 'Lướt xuyên qua kẻ địch và chém.'),
  drain: H2('Steal life from the nearest enemy.', 'Hút máu kẻ địch gần nhất.'),
  shield: H2('Shield every friend nearby.', 'Tạo khiên cho đồng đội gần.'),
  freeze: H2('Slow every enemy and chill them.', 'Làm chậm và đóng băng mọi kẻ địch.'),
  meteor: H2('Drop a meteor on the nearest enemy.', 'Gọi thiên thạch rơi vào kẻ địch.'),
  chain: H2('Lightning jumps between enemies.', 'Sét nhảy qua nhiều kẻ địch.'),
  rain: H2('Arrows rain down ahead of you.', 'Mưa tên trút xuống phía trước.'),
  quake: H2('Shake the ground and hit enemies on it.', 'Rung đất, đánh kẻ địch trên mặt đất.'),
  hole: H2('A vortex pulls and hurts enemies.', 'Xoáy hút và gây sát thương.'),
  blades: H2('Spinning blades orbit and fly out.', 'Lưỡi kiếm xoay quanh rồi bay ra.'),
  rage: H2('The whole team hits harder for 8s.', 'Cả đội đánh mạnh hơn trong 8 giây.'),
  bless: H2('Heal and shield the whole team.', 'Hồi máu và tạo khiên cho cả đội.'),
  reap: H2('A deadly scythe sweep around you.', 'Lưỡi hái quét quanh người.'),
  snipe: H2('One huge shot that pierces everything.', 'Một phát bắn cực mạnh xuyên mọi thứ.'),
  wave: H2('A big wave rolls forward.', 'Một con sóng lớn cuộn về phía trước.')
};
