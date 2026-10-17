'use strict';
// ============ SHOP CATALOG: 15 swords, 15 armors, 15 pets, 15 special weapons (+ starter items) ============
const RARITY_COL = ['#9aa4b8', '#6ee89a', '#6ec8ff', '#a98bff', '#ffb03a', '#ff5a5a'];
const RARITY_NAME = [{ en: 'Common', vi: 'Thường' }, { en: 'Uncommon', vi: 'Khá' }, { en: 'Rare', vi: 'Hiếm' }, { en: 'Epic', vi: 'Sử thi' }, { en: 'Legendary', vi: 'Huyền thoại' }, { en: 'Mythic', vi: 'Thần thoại' }];
const TIER_GOLD = [0, 60, 120, 220, 380, 600, 900, 1400, 2000, 2900, 4000, 5500, 7500, 10000, 13500, 18000];
const rarityOf = t => t <= 2 ? 0 : (t <= 5 ? 1 : (t <= 8 ? 2 : (t <= 11 ? 3 : (t <= 14 ? 4 : 5))));

const ITEMS = [];
const ITEM = {};
function addItem(o) {
  o.rar = rarityOf(o.tier || 0);
  o.gold = o.gold !== undefined ? o.gold : TIER_GOLD[o.tier];
  o.gems = o.gems !== undefined ? o.gems : Math.max(0, Math.round(o.gold / 50));
  ITEMS.push(o); ITEM[o.id] = o;
}
const T2 = (en, vi) => ({ en, vi });

// ---------------- SWORDS (melee) ----------------
// st: dmg bonus, reach (x), cd (attack delay x), effects
const SWORD_LOOK = {
  iron: { shape: 'straight', len: 20, bl: '#cfd6e6', ed: '#ffffff', gd: '#8d9bbd', gr: '#5a3a22', gl: null },
  leek: { shape: 'leek', len: 22, bl: '#4fc84f', ed: '#a4ffc0', gd: '#e8f5d0', gr: '#e8f5d0', gl: '#7effaa' },
  bronze: { shape: 'straight', len: 18, bl: '#c8844a', ed: '#ffd0a0', gd: '#8a5a28', gr: '#5a3a22', gl: null },
  saber: { shape: 'curved', len: 21, bl: '#aab4c8', ed: '#ffffff', gd: '#c89a1c', gr: '#5a3a22', gl: null },
  frost: { shape: 'straight', len: 23, bl: '#8fe0f8', ed: '#ffffff', gd: '#4a8bf0', gr: '#2a4a9c', gl: '#7fe0ff' },
  ember: { shape: 'flame', len: 22, bl: '#ff7a2a', ed: '#ffd34e', gd: '#8e2335', gr: '#3a1a1a', gl: '#ff8a3a' },
  venom: { shape: 'serrated', len: 22, bl: '#7ed957', ed: '#d8ff9a', gd: '#2b8a3e', gr: '#1a3a1a', gl: '#9be564' },
  gale: { shape: 'thin', len: 27, bl: '#dfe8f5', ed: '#ffffff', gd: '#6ee7f2', gr: '#2a3a5a', gl: '#bfe8ff' },
  vamp: { shape: 'thin', len: 28, bl: '#c0304a', ed: '#ff8a9a', gd: '#2a1020', gr: '#3a1020', gl: '#ff3a5a' },
  thunder: { shape: 'zig', len: 24, bl: '#ffe44e', ed: '#ffffff', gd: '#4a4a8a', gr: '#2a2a4a', gl: '#ffe44e' },
  crystal: { shape: 'wide', len: 28, bl: '#7ee8ff', ed: '#ffffff', gd: '#c8e8ff', gr: '#4a6a8a', gl: '#6ee7f2' },
  reaper: { shape: 'scythe', len: 26, bl: '#3a2a5a', ed: '#a15be0', gd: '#14121f', gr: '#2a1a3a', gl: '#a15be0' },
  holy: { shape: 'holy', len: 26, bl: '#fff6c0', ed: '#ffffff', gd: '#ffd34e', gr: '#c89a1c', gl: '#fff2a0' },
  slayer: { shape: 'wide', len: 30, bl: '#8a8fa8', ed: '#e0e4f0', gd: '#8e2335', gr: '#3a1a1a', gl: '#ff5a3a' },
  phoenix: { shape: 'flame', len: 28, bl: '#ff5a2a', ed: '#ffd34e', gd: '#ffb02a', gr: '#7a2a10', gl: '#ff9a2a' },
  void: { shape: 'scythe', len: 28, bl: '#1a0f2e', ed: '#d58bff', gd: '#6a3aa8', gr: '#14121f', gl: '#7a4cff' },
  sun: { shape: 'sun', len: 32, bl: '#ffe08a', ed: '#ffffff', gd: '#14121f', gr: '#ffd34e', gl: '#ffe08a' }
};
addItem({ id: 'iron', type: 'sword', tier: 0, gold: 0, gems: 0, name: T2('Iron Sword', 'Kiếm Sắt'), desc: T2('A plain iron sword. Light and reliable.', 'Thanh kiếm sắt đơn giản. Nhẹ và đáng tin cậy.'), st: { dmg: 0 }, starter: true });
addItem({ id: 'leek', type: 'sword', tier: 6, gold: 0, gems: 0, name: T2("Princess Lyra's Leek Blade", 'Kiếm Hành Lá của Công chúa Lyra'), desc: T2('Special blade. Each swing shoots 3 weak beams of light (lights up dark maps, hits far away). A hit heals 1 heart (once per 9s) and stuns the target for 2.5s (1.5s for bosses, rarely). Monsters below 15% health (bosses below 8%) are finished off by a leek tornado.', 'Kiếm đặc biệt. Mỗi nhát chém bắn 3 tia sáng yếu (soi đường map tối, đánh xa). Trúng đòn hồi 1 tim (9 giây một lần) và làm đối thủ choáng 2,5 giây (boss 1,5 giây, hiếm khi). Quái dưới 15% máu (boss dưới 8%) bị lốc xoáy hành lá kết liễu.'), st: { dmg: 1, reach: 1.3, leek: 1, beam3: 1 }, story: true });
[
  ['bronze', 1, 'Bronze Blade', 'Kiếm Đồng', '+1 damage. Cheap but dependable.', '+1 sát thương. Rẻ nhưng đáng tin.', { dmg: 1 }],
  ['saber', 2, "Hunter's Saber", 'Thái Đao Thợ Săn', '+1 damage and swings 15% faster.', '+1 sát thương và vung nhanh hơn 15%.', { dmg: 1, cd: 0.85 }],
  ['frost', 3, 'Frost Brand', 'Kiếm Băng Giá', '+1 damage. Hits freeze monsters: they move at half speed for 2.5s.', '+1 sát thương. Đòn đánh làm quái đóng băng: chậm một nửa trong 2.5 giây.', { dmg: 1, slow: 2.5 }],
  ['ember', 4, 'Ember Edge', 'Kiếm Lửa Than', '+2 damage. Sets monsters ablaze: 1 fire damage per second for 3s (ignores armor).', '+2 sát thương. Đốt cháy quái: 1 sát thương lửa mỗi giây trong 3 giây (xuyên giáp).', { dmg: 2, burn: 3 }],
  ['venom', 5, 'Venom Fang', 'Nanh Độc Dược', '+2 damage. Poison stacks over time and halves the armor of poisoned foes.', '+2 sát thương. Độc cộng dồn theo thời gian và giảm một nửa giáp của quái trúng độc.', { dmg: 2, poison: 4 }],
  ['gale', 6, 'Gale Katana', 'Katana Cuồng Phong', '+2 damage and very fast swings. Every 4th hit launches a wind slash.', '+2 sát thương, vung rất nhanh. Cứ 4 đòn trúng lại bắn ra một luồng gió chém.', { dmg: 2, cd: 0.6, reach: 1.1, wind: 4 }],
  ['vamp', 7, 'Vampire Rapier', 'Kiếm Ma Cà Rồng', '+3 damage. Drains life: heal 1 heart every 6 hits.', '+3 sát thương. Hút máu: hồi 1 tim sau mỗi 6 đòn trúng.', { dmg: 3, ls: 6 }],
  ['thunder', 8, 'Thunder Saber', 'Kiếm Lôi Điện', '+3 damage. Lightning arcs from the target to 2 nearby enemies for 60% damage.', '+3 sát thương. Tia sét nhảy từ mục tiêu sang 2 kẻ địch gần đó với 60% sát thương.', { dmg: 3, chain: 2 }],
  ['crystal', 9, 'Crystal Claymore', 'Đại Kiếm Pha Lê', '+4 damage, huge reach, a bit slower. Ignores half of enemy armor and shatters projectiles.', '+4 sát thương, tầm đánh rất xa, hơi chậm. Bỏ qua một nửa giáp và phá đạn của kẻ địch.', { dmg: 4, reach: 1.5, cd: 1.25, pierce: 0.5 }],
  ['reaper', 10, 'Shadow Reaper', 'Lưỡi Hái Bóng Tối', '+4 damage. 20% critical hits (x3). Executes non-boss monsters below 20% health.', '+4 sát thương. 20% đòn chí mạng (x3). Hạ gục ngay quái thường dưới 20% máu.', { dmg: 4, crit: 0.2, exec: 0.2 }],
  ['holy', 11, 'Holy Radiance', 'Thánh Kiếm Ánh Sáng', '+5 damage. Every swing fires a piercing beam of light. Heals 1 heart every 25 hits.', '+5 sát thương. Mỗi nhát chém bắn ra một tia sáng xuyên thấu. Hồi 1 tim sau mỗi 25 đòn.', { dmg: 5, beam: 3, ls: 25 }],
  ['slayer', 12, 'Dragonslayer', 'Kiếm Diệt Rồng', '+5 damage; DOUBLE damage against bosses, dragons, big and elite monsters. Burns.', '+5 sát thương; GẤP ĐÔI sát thương lên boss, rồng, quái to và tinh anh. Có đốt cháy.', { dmg: 5, boss: 2, burn: 3, reach: 1.15 }],
  ['phoenix', 13, 'Phoenix Edge', 'Kiếm Phượng Hoàng', '+6 damage, burning blade. Once per level you rise from the ashes with half health.', '+6 sát thương, lưỡi kiếm bốc lửa. Mỗi màn một lần bạn hồi sinh từ tro tàn với nửa máu.', { dmg: 6, burn: 4, revive: 1 }],
  ['void', 14, 'Void Reaper', 'Lưỡi Hái Hư Vô', '+7 damage. Each kill opens a small black hole that pulls in and damages nearby enemies.', '+7 sát thương. Mỗi lần hạ gục mở ra một hố đen nhỏ hút và gây sát thương kẻ địch xung quanh.', { dmg: 7, voidk: 1, reach: 1.2 }],
  ['sun', 15, 'Eclipse Sunblade', 'Kiếm Nhật Quang', '+9 damage. Beams every swing, a shockwave every 5th hit, burns nearby enemies and drains life. The ultimate blade.', '+9 sát thương. Tia sáng mỗi nhát chém, sóng xung kích mỗi 5 đòn, đốt kẻ địch xung quanh và hút máu. Thanh kiếm tối thượng.', { dmg: 9, beam: 4, nova: 5, aura: 1, ls: 10, reach: 1.3 }]
].forEach(a => addItem({ id: a[0], type: 'sword', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));

// ---------------- ARMORS ----------------
const ARMOR_LOOK = {
  cloth: { sw: { b: '#7a6a50', r: '#b0804a' } },
  leather: { sw: { b: '#8a5a34', A: '#a07040', a: '#d0a070', r: '#c85a3a' } },
  chain: { sw: { b: '#9aa6b8', A: '#c0cadc', a: '#f0f4ff' } },
  ironp: { sw: { b: '#6a7388', A: '#8a94aa', q: '#2a2e40', a: '#c0c8dc' } },
  cloak: { sw: { b: '#2f7a4a', A: '#3a6a40', r: '#8ad060', a: '#8ad060' }, cape: '#2f7a4a' },
  frostm: { sw: { b: '#6ec8f0', A: '#bff3ff', a: '#ffffff', r: '#ffffff' }, aura: '#bfeaff' },
  thorn: { sw: { b: '#3a6a2a', A: '#5a9a3a', a: '#9ae070', r: '#a02a2a' }, spikes: '#cfd6e6' },
  flamep: { sw: { b: '#b02a1a', A: '#ff7a2a', a: '#ffd34e', r: '#ffd34e' }, aura: '#ff8a3a', flame: true },
  vamprobe: { sw: { b: '#6a1a3a', A: '#a02a5a', a: '#e05a8a', r: '#14121f' }, cape: '#6a1a3a' },
  crystalp: { sw: { b: '#5a9ae8', A: '#9fe8ff', a: '#ffffff', r: '#6ee7f2' }, aura: '#9fe8ff' },
  paladin: { sw: { b: '#e8e8f4', A: '#ffd34e', a: '#ffffff', r: '#4a8bf0' }, cape: '#4a8bf0', halo: '#ffe08a' },
  dscale: { sw: { b: '#2a8a4a', A: '#d03a30', a: '#ffd34e', r: '#d03a30' }, wings: 'dragon', aura: '#ff6a3a' },
  shroud: { sw: { b: '#2a1a40', A: '#4a2a70', a: '#a15be0', r: '#a15be0' }, cape: '#14101e', aura: '#a15be0' },
  aegis: { sw: { b: '#fff6c0', A: '#ffd34e', a: '#ffffff', r: '#6ee7f2' }, wings: 'angel', halo: '#fff2a0', aura: '#ffe08a' },
  regalia: { sw: { b: '#14101e', A: '#d58bff', a: '#ffe08a', r: '#ffd34e' }, wings: 'dark', halo: '#d58bff', aura: '#a15be0' }
};
[
  ['cloth', 1, 'Cloth Tunic', 'Áo Vải', '+1 heart. Better than nothing!', '+1 tim. Có còn hơn không!', { hp: 1 }],
  ['leather', 2, 'Leather Vest', 'Giáp Da', '+1 heart and 5% damage reduction.', '+1 tim và giảm 5% sát thương.', { hp: 1, red: 0.05 }],
  ['chain', 3, 'Chainmail', 'Giáp Xích', '+2 hearts and 8% damage reduction.', '+2 tim và giảm 8% sát thương.', { hp: 2, red: 0.08 }],
  ['ironp', 4, 'Iron Plate', 'Giáp Sắt', '+2 hearts, 12% reduction. Reflects 1 damage to attackers.', '+2 tim, giảm 12% sát thương. Phản 1 sát thương lên kẻ tấn công.', { hp: 2, red: 0.12, thorns: 1 }],
  ['cloak', 5, "Hunter's Cloak", 'Áo Choàng Thợ Săn', '+2 hearts, 12% chance to dodge a hit, run 5% faster.', '+2 tim, 12% né đòn, chạy nhanh hơn 5%.', { hp: 2, dodge: 0.12, speed: 0.05 }],
  ['frostm', 6, 'Frost Mail', 'Giáp Băng', '+3 hearts, 15% reduction. Attackers get frozen.', '+3 tim, giảm 15% sát thương. Kẻ tấn công bị đóng băng.', { hp: 3, red: 0.15, thornFx: 'slow' }],
  ['thorn', 7, 'Thornguard', 'Giáp Gai', '+3 hearts, 15% reduction. Reflects 2 damage.', '+3 tim, giảm 15% sát thương. Phản 2 sát thương.', { hp: 3, red: 0.15, thorns: 2 }],
  ['flamep', 8, 'Flame Plate', 'Giáp Lửa', '+3 hearts, 18% reduction. Burns attackers; you are immune to fire.', '+3 tim, giảm 18% sát thương. Đốt kẻ tấn công; bạn miễn nhiễm lửa.', { hp: 3, red: 0.18, thornFx: 'burn', fireImm: 1 }],
  ['vamprobe', 9, 'Vampiric Robe', 'Áo Choàng Hút Máu', '+3 hearts. Heal 1 heart every 4 kills.', '+3 tim. Hồi 1 tim sau mỗi 4 lần hạ gục.', { hp: 3, red: 0.1, killHeal: 4 }],
  ['crystalp', 10, 'Crystal Plate', 'Giáp Pha Lê', '+4 hearts, 22% reduction. A crystal shield blocks one hit every 15s.', '+4 tim, giảm 22% sát thương. Khiên pha lê chặn 1 đòn mỗi 15 giây.', { hp: 4, red: 0.22, shieldT: 15 }],
  ['paladin', 11, 'Paladin Armor', 'Giáp Thánh Kỵ Sĩ', '+5 hearts, 25% reduction. Regenerates 1 heart every 20s.', '+5 tim, giảm 25% sát thương. Hồi 1 tim mỗi 20 giây.', { hp: 5, red: 0.25, regen: 20 }],
  ['dscale', 12, 'Dragon Scale', 'Giáp Vảy Rồng', '+5 hearts, 28% reduction. Reflects 3 fire damage; immune to fire.', '+5 tim, giảm 28% sát thương. Phản 3 sát thương lửa; miễn nhiễm lửa.', { hp: 5, red: 0.28, thorns: 3, thornFx: 'burn', fireImm: 1 }],
  ['shroud', 13, 'Shadow Shroud', 'Áo Bóng Đêm', '+4 hearts, 25% dodge. After a hit you melt into shadow (1s invulnerable).', '+4 tim, 25% né đòn. Sau khi bị đánh bạn hóa bóng (bất tử 1 giây).', { hp: 4, dodge: 0.25, shadow: 1 }],
  ['aegis', 14, 'Celestial Aegis', 'Thiên Giáp', '+6 hearts, 32% reduction, reflects 3. Shield every 10s, regen 1 heart / 25s.', '+6 tim, giảm 32% sát thương, phản 3. Khiên mỗi 10 giây, hồi 1 tim mỗi 25 giây.', { hp: 6, red: 0.32, thorns: 3, shieldT: 10, regen: 25 }],
  ['regalia', 15, 'Eclipse Regalia', 'Giáp Nhật Thực', '+8 hearts, 38% reduction, reflects 4. Nova on hit, shield every 8s, regen, immune to slow.', '+8 tim, giảm 38% sát thương, phản 4. Nổ sóng khi bị đánh, khiên mỗi 8 giây, tự hồi máu, miễn nhiễm làm chậm.', { hp: 8, red: 0.38, thorns: 4, nova: 1, shieldT: 8, regen: 30, slowImm: 1 }]
].forEach(a => addItem({ id: a[0], type: 'armor', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6], look: ARMOR_LOOK[a[0]] }));

// ---------------- PETS ----------------
[
  ['kitty', 1, 'Kitty', 'Mèo Con', 'Collects coins around you (double coin magnet range).', 'Nhặt xu quanh bạn (tầm hút xu gấp đôi).', { role: 'coin' }],
  ['puppy', 2, 'Puppy', 'Cún Con', 'Bites nearby monsters: 1 damage every 1.2s.', 'Cắn quái ở gần: 1 sát thương mỗi 1.2 giây.', { role: 'bite' }],
  ['birdie', 3, 'Birdie', 'Chim Nhỏ', 'Scout: an arrow points to the nearest uncollected Sun Shard.', 'Trinh sát: mũi tên chỉ hướng Mảnh Nắng gần nhất chưa nhặt.', { role: 'scout' }],
  ['bunny', 4, 'Bunny', 'Thỏ Con', '+10% run speed and a higher jump.', '+10% tốc độ chạy và nhảy cao hơn.', { role: 'speed', speed: 0.1, jump: 1.08 }],
  ['fairy', 5, 'Fairy', 'Tiên Nhỏ', 'Heals 1 heart every 35 seconds.', 'Hồi 1 tim mỗi 35 giây.', { role: 'heal', t: 35 }],
  ['slimey', 6, 'Slimey', 'Slime Bạn Thân', 'Absorbs a hit for you every 25 seconds.', 'Đỡ một đòn cho bạn mỗi 25 giây.', { role: 'shield', t: 25 }],
  ['owl', 7, 'Wise Owl', 'Cú Mèo', 'Brighter lantern light (+30%): see much further in the dark.', 'Ánh sáng đèn rộng hơn (+30%): nhìn xa hơn nhiều trong bóng tối.', { role: 'light' }],
  ['fox', 8, 'Swift Fox', 'Cáo Nhanh', '+12% run speed and your dash recharges 30% faster.', '+12% tốc độ chạy và lướt hồi nhanh hơn 30%.', { role: 'speed', speed: 0.12, dash: 0.7 }],
  ['turtle', 9, 'Shell Turtle', 'Rùa Giáp', 'Takes the heat: -15% damage taken.', 'Chịu đòn thay: giảm 15% sát thương nhận vào.', { role: 'tank', red: 0.15 }],
  ['bat', 10, 'Bitey Bat', 'Dơi Con', 'Bites enemies (2 damage every 8s); every 2 bites heal you 1 heart.', 'Cắn kẻ địch (2 sát thương mỗi 8 giây); cứ 2 lần cắn hồi cho bạn 1 tim.', { role: 'drain' }],
  ['wisp', 11, 'Spark Wisp', 'Hồn Lửa Bạn', 'Fires homing sparks at monsters: 1 damage every 0.9s.', 'Bắn tia lửa tự dẫn vào quái: 1 sát thương mỗi 0.9 giây.', { role: 'spark' }],
  ['bdragon', 12, 'Baby Dragon', 'Rồng Con', 'Spits fireballs at monsters: 3 damage every 1.8s.', 'Phun cầu lửa vào quái: 3 sát thương mỗi 1.8 giây.', { role: 'fire' }],
  ['ghostie', 13, 'Ghostie', 'Ma Nhỏ', 'Intercepts one enemy projectile every 4 seconds.', 'Chặn một viên đạn của kẻ địch mỗi 4 giây.', { role: 'block' }],
  ['pchick', 14, 'Phoenix Chick', 'Phượng Hoàng Con', 'Once per level, revives you with full health in a burst of fire.', 'Mỗi màn một lần, hồi sinh bạn với đầy máu trong vụ nổ lửa.', { role: 'revive' }],
  ['unicorn', 15, 'Rainbow Unicorn', 'Kỳ Lân Cầu Vồng', 'Rainbow aura: +1 sword damage, heals 1 heart / 25s, strong coin magnet.', 'Hào quang cầu vồng: +1 sát thương kiếm, hồi 1 tim mỗi 25 giây, hút xu mạnh.', { role: 'rainbow' }]
].forEach(a => addItem({ id: a[0], type: 'pet', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));

// ---------------- SPECIAL WEAPONS ----------------
[
  ['bow', 1, "Hunter's Bow", 'Cung Thợ Săn', 'Fires an arrow in a straight line. 2 damage, quick reload.', 'Bắn một mũi tên thẳng. 2 sát thương, nạp đạn nhanh.', { cd: 0.6 }],
  ['boomerang', 2, 'Boomerang', 'Boomerang', 'Flies out and comes back, hitting enemies twice.', 'Bay ra rồi quay lại, trúng kẻ địch hai lần.', { cd: 1.2 }],
  ['firewand', 3, 'Fire Wand', 'Gậy Lửa', 'Shoots a fireball: 3 damage and sets enemies on fire.', 'Bắn cầu lửa: 3 sát thương và đốt cháy kẻ địch.', { cd: 0.9 }],
  ['icewand', 4, 'Frost Wand', 'Gậy Băng', 'Ice shard that freezes (slows) enemies for 3 seconds.', 'Mảnh băng làm kẻ địch đóng băng (chậm) trong 3 giây.', { cd: 1.1 }],
  ['crossbow', 5, 'Repeater Crossbow', 'Nỏ Liên Thanh', 'Fires a burst of 3 bolts, 3 damage each.', 'Bắn loạt 3 mũi nỏ, mỗi mũi 3 sát thương.', { cd: 1.4 }],
  ['shuriken', 6, 'Shuriken Fan', 'Phi Tiêu Quạt', 'Throws 5 shurikens in a fan, each can hit twice.', 'Ném 5 phi tiêu thành hình quạt, mỗi cái có thể trúng hai lần.', { cd: 1.5 }],
  ['rod', 7, 'Lightning Rod', 'Cột Thu Lôi', 'Calls lightning on the nearest enemy, chaining to 3 foes (6 damage).', 'Gọi sét đánh kẻ địch gần nhất, lan sang 3 kẻ khác (6 sát thương).', { cd: 2.5 }],
  ['launcher', 8, 'Bomb Launcher', 'Súng Bắn Bom', 'Lobs 2 bombs in an arc that explode on impact.', 'Bắn 2 quả bom theo đường cong, nổ khi chạm.', { cd: 2 }],
  ['meteor', 9, 'Meteor Staff', 'Trượng Thiên Thạch', 'Calls 6 meteors down on the area ahead of you.', 'Gọi 6 thiên thạch rơi xuống khu vực phía trước bạn.', { cd: 12 }],
  ['cross', 10, 'Holy Cross', 'Thánh Giá', 'Holy nova: heals 2 hearts and blasts nearby enemies away.', 'Vụ nổ thánh: hồi 2 tim và hất văng kẻ địch xung quanh.', { cd: 14 }],
  ['orb', 11, 'Gravity Orb', 'Quả Cầu Trọng Lực', 'Creates a black hole for 4s that pulls in and damages enemies.', 'Tạo một hố đen trong 4 giây hút và gây sát thương kẻ địch.', { cd: 10 }],
  ['stormbow', 12, 'Storm Bow', 'Cung Bão Táp', 'Releases a storm of 36 arrows in a wide fan!', 'Phóng một cơn bão 36 mũi tên theo hình quạt rộng!', { cd: 8 }],
  ['hourglass', 13, 'Time Hourglass', 'Đồng Hồ Thời Gian', 'Slows time: enemies and bosses move at 40% speed for 6 seconds.', 'Làm chậm thời gian: kẻ địch và boss chỉ còn 40% tốc độ trong 6 giây.', { cd: 22 }],
  ['thundergod', 14, 'Staff of the Thunder God', 'Trượng Thần Sấm', 'Point to the sky: lightning crashes down and the Thunder God appears, smiting enemies for 12 seconds.', 'Chỉ lên trời: sấm chớp giáng xuống và Thần Sấm hiện ra, đánh quái trong 12 giây.', { cd: 20 }],
  ['dragonhorn', 15, 'Dragon Horn', 'Tù Và Gọi Rồng', 'Summons a spectral dragon that breathes fire across the screen for 5 seconds.', 'Triệu hồi một con rồng ma phun lửa khắp màn hình trong 5 giây.', { cd: 30 }]
].forEach(a => addItem({ id: a[0], type: 'wpn', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));

const ITEM_TABS = ['sword', 'armor', 'pet', 'wpn'];
const shopList = type => ITEMS.filter(i => i.type === type && !i.starter && !i.story).sort((a, b) => a.tier - b.tier);

// ---------------- painters ----------------
function swordPaint(P, o) {
  const L = o.len, cy = 7, x0 = 10;
  if (o.shape === 'leek') {
    P.rect(1, 3, 8, 4, 'w'); P.rect(1, 3, 8, 1, 'e'); P.rect(1, 6, 8, 1, 'E'); P.px(0, 4, 'e'); P.px(0, 5, 'E');
    P.rect(9, 2, 2, 5, 'x'); P.rect(9, 2, 2, 1, 't'); P.rect(11, 3, L - 8, 3, 'g'); P.rect(11, 3, L - 8, 1, 't'); P.rect(11, 5, L - 8, 1, 'G');
    P.tri(L + 3, 2, L + 3, 7, L + 10, 4, 'g'); P.tri(L + 3, 3, L + 3, 4, L + 9, 4, 't'); P.px(14, 4, 'w'); P.px(19, 4, 'w'); return;
  }
  P.rect(1, cy - 1, 7, 3, o.gr); P.rect(2, cy - 1, 1, 3, 'rgba(0,0,0,.3)'); P.rect(5, cy - 1, 1, 3, 'rgba(0,0,0,.3)'); P.ell(1, cy, 2, 2, o.gd);
  P.rect(8, cy - 4, 2, 9, o.gd); P.rect(8, cy - 4, 2, 1, o.ed);
  if (o.shape === 'holy' || o.shape === 'sun') { P.tri(8, cy - 4, 10, cy - 4, 5, cy - 9, o.gd); P.tri(8, cy + 4, 10, cy + 4, 5, cy + 9, o.gd); }
  switch (o.shape) {
    case 'straight': case 'holy': P.rect(x0, cy - 1, L, 3, o.bl); P.rect(x0, cy - 1, L, 1, o.ed); P.tri(x0 + L, cy - 1, x0 + L, cy + 2, x0 + L + 5, cy, o.bl); break;
    case 'wide': P.rect(x0, cy - 2, L, 5, o.bl); P.rect(x0, cy - 2, L, 1, o.ed); P.rect(x0 + 2, cy, L - 4, 1, o.ed); P.tri(x0 + L, cy - 2, x0 + L, cy + 3, x0 + L + 6, cy, o.bl); break;
    case 'curved': for (let i = 0; i < L; i++) { const yy = cy - 1 - Math.floor(i * i / (L * L) * 3); P.rect(x0 + i, yy, 1, 3, o.bl); P.px(x0 + i, yy, o.ed); } P.tri(x0 + L, cy - 4, x0 + L, cy - 1, x0 + L + 4, cy - 4, o.bl); break;
    case 'thin': P.rect(x0, cy, L, 2, o.bl); P.rect(x0, cy, L, 1, o.ed); P.tri(x0 + L, cy, x0 + L, cy + 2, x0 + L + 4, cy + 1, o.bl); break;
    case 'serrated': P.rect(x0, cy - 1, L, 3, o.bl); P.rect(x0, cy - 1, L, 1, o.ed); for (let i = 1; i < L - 2; i += 3) P.tri(x0 + i, cy + 2, x0 + i + 3, cy + 2, x0 + i + 1, cy + 5, o.bl); P.tri(x0 + L, cy - 1, x0 + L, cy + 2, x0 + L + 5, cy, o.bl); break;
    case 'flame': for (let i = 0; i < L; i++) { const w = 2 + Math.round(Math.sin(i * 0.8) * 1.2); P.rect(x0 + i, cy - w, 1, w * 2 + 1, i % 3 ? o.bl : o.ed); } P.tri(x0 + L, cy - 2, x0 + L, cy + 3, x0 + L + 6, cy, o.ed); break;
    case 'zig': P.poly([[x0, cy], [x0 + L * 0.3, cy - 3], [x0 + L * 0.5, cy + 3], [x0 + L * 0.72, cy - 3], [x0 + L, cy]], o.bl, 3); P.poly([[x0, cy], [x0 + L * 0.3, cy - 3], [x0 + L * 0.5, cy + 3], [x0 + L * 0.72, cy - 3], [x0 + L, cy]], o.ed, 1); break;
    case 'scythe': P.rect(x0, cy, L - 6, 2, o.gr); P.rect(x0, cy, L - 6, 1, o.ed); P.tri(x0 + L - 14, cy - 9, x0 + L - 4, cy - 1, x0 + L - 14, cy + 1, o.bl); P.tri(x0 + L - 14, cy - 9, x0 + L + 1, cy - 2, x0 + L - 4, cy - 1, o.bl); P.line(x0 + L - 14, cy - 9, x0 + L + 1, cy - 2, o.ed, 1); break;
    case 'sun': P.rect(x0, cy - 2, L - 6, 5, o.bl); P.rect(x0, cy - 2, L - 6, 1, o.ed); P.tri(x0 + L - 6, cy - 2, x0 + L - 6, cy + 3, x0 + L, cy, o.bl); P.ell(x0 + L - 4, cy, 3, 3, o.ed); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.line(Math.round(x0 + L - 4 + Math.cos(a) * 4), Math.round(cy + Math.sin(a) * 4), Math.round(x0 + L - 4 + Math.cos(a) * 7), Math.round(cy + Math.sin(a) * 7), o.ed, 1); } break;
  }
  if (o.shape === 'crystal' || o.id === 'crystal') for (let i = 3; i < L - 3; i += 6) P.px(x0 + i, cy - 1, '#fff');
}
function swordSprite(id) {
  if (id === 'leek') return leekSprite();
  const k = 'sw_' + id; if (_cache[k]) return _cache[k];
  const o = SWORD_LOOK[id] || SWORD_LOOK.iron;
  return (_cache[k] = paint(o.len + 20, 19, P => swordPaint(P, o)));
}
function swordGlow(id) { return (SWORD_LOOK[id] || {}).gl || null; }

// armor icon: chestplate
function armorPaint(P, id) {
  const L = ARMOR_LOOK[id], c = L.sw, b = c.b || '#9aa6b8', A = c.A || '#8d9bbd', a = c.a || '#fff';
  P.both(() => { P.ell(4, 6, 4, 3, A); P.rect(2, 7, 4, 4, A); if (L.spikes) { P.tri(1, 4, 5, 4, 2, -1 + 1, L.spikes); } });
  P.rect(5, 4, 14, 14, b); P.rect(5, 4, 14, 2, a); P.rect(11, 4, 2, 14, A); P.ell(12, 5, 3, 2, 'k');
  P.rect(6, 15, 12, 3, A); P.rect(9, 16, 6, 2, c.r || A);
  P.px(8, 8, a); P.px(9, 8, a); P.px(15, 8, a);
  if (L.wings === 'angel') { P.both(() => { P.tri(3, 8, 0, 2, 1, 14, '#fff'); }); }
  if (L.halo) P.rect(8, 0, 8, 1, L.halo);
  if (L.flame) { P.tri(10, 2, 14, 2, 12, -1 + 1, '#ffd34e'); }
  if (L.cape) { P.both(() => { P.rect(4, 12, 2, 7, L.cape); }); }
}
const ARMOR_BASE = { b: 'b', A: 'A', a: 'a', q: 'q', r: 'r', n: 'n' };
function armorSwap(id) { return id && ARMOR_LOOK[id] ? ARMOR_LOOK[id].sw : {}; }

// pets (facing right, 16x14)
const PET_PAINT = {
  kitty: P => { const c = '#e8a050', d = '#b87030'; P.tri(3, 8, 0, 2, 5, 8, d); P.line(2, 9, 0, 4, c, 2); P.ell(7, 9, 5, 3, c); P.ell(12, 6, 3, 3, c); P.tri(10, 4, 11, 0, 13, 4, c); P.tri(13, 4, 14, 0, 15, 4, c); P.rect(5, 11, 2, 2, c); P.rect(10, 11, 2, 2, c); P.px(13, 6, 'k'); P.px(15, 7, 'm'); P.rect(6, 8, 1, 3, d); P.rect(8, 8, 1, 3, d); },
  puppy: P => { const c = '#c88a50', d = '#8a5a30', w = '#f6f3e9'; P.rect(1, 6, 3, 2, d); P.ell(7, 9, 5, 3, c); P.ell(7, 10, 3, 2, w); P.ell(12, 6, 3, 3, c); P.rect(14, 6, 3, 3, c); P.ell(10, 5, 2, 3, d); P.rect(5, 11, 2, 2, c); P.rect(10, 11, 2, 2, c); P.px(13, 5, 'k'); P.px(16, 7, 'k'); P.rect(13, 9, 2, 1, 'r'); },
  birdie: P => { const c = '#4a8bf0', w = '#bfe8ff'; P.ell(7, 8, 5, 4, c); P.ell(8, 10, 3, 2, w); P.ell(12, 5, 3, 3, c); P.tri(14, 5, 14, 7, 17, 6, '#ffd34e'); P.tri(2, 7, 0, 4, 4, 8, '#2a4a9c'); P.tri(5, 6, 7, 1, 10, 6, '#2a4a9c'); P.px(12, 4, 'k'); P.rect(6, 12, 1, 2, '#ffd34e'); P.rect(9, 12, 1, 2, '#ffd34e'); },
  bunny: P => { const c = '#f6f3e9', d = '#ffb0c0'; P.ell(7, 10, 4, 3, c); P.ell(11, 7, 3, 3, c); P.rect(10, 0, 2, 6, c); P.rect(13, 0, 2, 6, c); P.rect(10, 1, 1, 4, d); P.rect(13, 1, 1, 4, d); P.ell(3, 10, 2, 2, c); P.px(12, 6, 'k'); P.px(14, 8, 'm'); P.rect(5, 12, 2, 2, c); P.rect(10, 12, 2, 2, c); },
  fairy: P => { P.tri(5, 7, 0, 1, 4, 11, 'rgba(160,240,255,.85)'); P.tri(9, 7, 14, 1, 10, 11, 'rgba(160,240,255,.85)'); P.ell(7, 4, 2, 2, '#ffe0c8'); P.ell(7, 3, 3, 2, '#ffd34e'); P.rect(6, 6, 3, 4, '#ff9fd0'); P.rect(6, 10, 1, 3, '#ffe0c8'); P.rect(8, 10, 1, 3, '#ffe0c8'); P.px(7, 4, 'k'); P.px(2, 2, '#fff'); P.px(12, 3, '#fff'); },
  slimey: P => { P.ell(8, 9, 7, 4, '#7ed957'); P.ell(8, 7, 5, 3, '#a4e86b'); P.px(6, 8, 'k'); P.px(10, 8, 'k'); P.px(7, 7, 'w'); P.px(11, 7, 'w'); P.rect(7, 10, 3, 1, '#2b8a3e'); P.ell(5, 6, 1, 1, '#fff'); },
  owl: P => { const c = '#9a6a3b', w = '#e8dfc0'; P.ell(8, 8, 5, 5, c); P.ell(8, 10, 3, 3, w); P.tri(4, 4, 5, 0, 7, 4, c); P.tri(9, 4, 11, 0, 12, 4, c); P.ell(6, 6, 2, 2, w); P.ell(10, 6, 2, 2, w); P.px(6, 6, 'k'); P.px(10, 6, 'k'); P.tri(7, 7, 9, 7, 8, 9, '#ffd34e'); P.both(() => { P.tri(2, 7, 1, 11, 4, 11, '#6a4a2b'); }); },
  fox: P => { const c = '#f08a3a', w = '#f6f3e9'; P.tri(3, 9, 0, 3, 6, 8, c); P.line(2, 9, 0, 5, c, 3); P.tri(1, 5, 0, 3, 3, 5, w); P.ell(7, 9, 5, 3, c); P.ell(7, 10, 3, 2, w); P.ell(12, 6, 3, 3, c); P.tri(10, 4, 11, 0, 13, 4, c); P.tri(13, 4, 14, 0, 15, 4, c); P.tri(13, 7, 17, 8, 13, 9, w); P.px(13, 6, 'k'); P.px(16, 8, 'k'); P.rect(5, 11, 2, 2, '#3a2a1a'); P.rect(10, 11, 2, 2, '#3a2a1a'); },
  turtle: P => { P.ell(7, 8, 6, 4, '#2b8a3e'); P.ell(7, 7, 5, 3, '#5fcf5a'); P.rect(4, 6, 1, 3, '#2b8a3e'); P.rect(7, 5, 1, 4, '#2b8a3e'); P.rect(10, 6, 1, 3, '#2b8a3e'); P.ell(13, 8, 2, 2, '#9be564'); P.px(14, 7, 'k'); P.rect(4, 11, 2, 2, '#9be564'); P.rect(9, 11, 2, 2, '#9be564'); P.tri(0, 10, 2, 8, 2, 11, '#9be564'); },
  bat: P => { const c = '#6a3a9a', d = '#3a1a5a'; P.ell(8, 7, 3, 3, c); P.tri(5, 7, 0, 2, 2, 10, d); P.tri(5, 7, 0, 10, 3, 11, d); P.tri(11, 7, 16, 2, 14, 10, d); P.tri(11, 7, 16, 10, 13, 11, d); P.tri(6, 5, 6, 1, 8, 5, c); P.tri(9, 5, 10, 1, 11, 5, c); P.px(7, 6, '#ff3a3a'); P.px(9, 6, '#ff3a3a'); P.px(8, 8, 'w'); },
  wisp: P => { P.ell(8, 8, 4, 4, '#ffd34e'); P.ell(8, 8, 2, 2, '#fff'); P.tri(6, 5, 8, 0, 10, 5, '#ff9a2a'); P.tri(4, 8, 0, 6, 4, 10, '#ff9a2a'); P.px(7, 8, 'k'); P.px(9, 8, 'k'); P.px(3, 3, '#ffd34e'); P.px(13, 11, '#ffd34e'); },
  bdragon: P => { const c = '#d03a30', d = '#8e2335', y = '#ffd34e'; P.tri(3, 9, 0, 6, 5, 8, c); P.ell(8, 9, 5, 3, c); P.ell(8, 10, 3, 2, y); P.ell(12, 6, 3, 3, c); P.rect(14, 6, 3, 2, c); P.tri(11, 4, 12, 1, 13, 4, '#e8dfc0'); P.tri(6, 7, 2, 1, 9, 5, d); P.px(13, 5, '#ffe033'); P.px(16, 7, 'k'); P.rect(5, 11, 2, 2, c); P.rect(10, 11, 2, 2, c); P.tri(16, 8, 18, 8, 17, 10, '#ff8a2a'); },
  ghostie: P => { P.ell(8, 6, 5, 5, 'rgba(240,240,255,.92)'); P.rect(3, 6, 10, 6, 'rgba(240,240,255,.92)'); for (let i = 0; i < 3; i++) P.tri(3 + i * 4, 12, 7 + i * 4, 12, 5 + i * 4, 14, 'rgba(240,240,255,.92)'); P.px(6, 6, 'k'); P.px(10, 6, 'k'); P.rect(7, 9, 2, 1, 'k'); P.px(4, 8, '#ffb0d0'); P.px(12, 8, '#ffb0d0'); },
  pchick: P => { P.tri(5, 9, 0, 5, 3, 11, '#ff5a2a'); P.tri(4, 8, 0, 9, 3, 12, '#ffd34e'); P.ell(8, 8, 4, 4, '#ff7a2a'); P.ell(8, 10, 3, 2, '#ffd34e'); P.ell(11, 5, 3, 3, '#ff7a2a'); P.tri(13, 5, 13, 7, 16, 6, '#ffd34e'); P.tri(10, 3, 11, -1 + 1, 12, 3, '#ffd34e'); P.px(11, 4, 'k'); P.tri(6, 7, 3, 1, 9, 5, '#ff5a2a'); P.px(2, 2, '#ffd34e'); },
  unicorn: P => { const c = '#f6f3e9'; P.line(3, 9, 0, 11, '#ff7fb0', 2); P.line(3, 10, 1, 13, '#6ee7f2', 1); P.ell(7, 9, 5, 3, c); P.ell(12, 6, 3, 3, c); P.rect(14, 6, 3, 3, c); P.tri(12, 3, 13, -1 + 1, 14, 3, '#ffd34e'); P.rect(9, 3, 2, 5, '#ff7fb0'); P.rect(8, 4, 2, 4, '#a98bff'); P.rect(7, 5, 2, 3, '#6ee7f2'); P.px(13, 6, 'k'); P.px(16, 8, 'm'); P.rect(5, 11, 2, 3, c); P.rect(10, 11, 2, 3, c); }
};
function petSprite(id) {
  const k = 'pet_' + id; if (_cache[k]) return _cache[k];
  return (_cache[k] = paint(19, 15, PET_PAINT[id] || PET_PAINT.kitty));
}

// special weapon icons (18x18)
const WPN_PAINT = {
  bow: P => { P.poly([[4, 1], [10, 5], [10, 12], [4, 16]], '#8a5a30', 2); P.line(4, 1, 4, 16, '#e8dfc0', 1); P.line(5, 8, 15, 8, '#cfd6e6', 1); P.tri(15, 6, 15, 10, 18, 8, '#cfd6e6'); },
  boomerang: P => { P.poly([[2, 14], [6, 6], [14, 3], [16, 5], [8, 8], [5, 15]], '#c8844a', 3); P.px(14, 4, '#ffd0a0'); },
  firewand: P => { P.line(3, 15, 11, 7, '#5a3a22', 2); P.ell(13, 5, 3, 3, '#ff7a2a'); P.ell(13, 5, 2, 2, '#ffd34e'); P.tri(11, 3, 13, -1 + 1, 15, 3, '#ff5a2a'); },
  icewand: P => { P.line(3, 15, 11, 7, '#5a3a22', 2); P.tri(11, 8, 15, 8, 13, 0, '#8fe0f8'); P.tri(10, 6, 16, 6, 13, 12, '#bff3ff'); P.px(13, 5, '#fff'); },
  crossbow: P => { P.rect(2, 8, 13, 2, '#8a5a30'); P.poly([[4, 2], [2, 9], [4, 16]], '#5a3a22', 2); P.line(4, 2, 4, 16, '#e8dfc0', 1); P.tri(14, 7, 14, 11, 18, 9, '#cfd6e6'); P.rect(6, 6, 6, 1, '#cfd6e6'); P.rect(6, 12, 6, 1, '#cfd6e6'); },
  shuriken: P => { const c = '#cfd6e6'; for (const [x, y] of [[5, 6], [12, 6], [8, 11]]) { P.tri(x, y - 4, x + 2, y, x - 2, y, c); P.tri(x, y + 4, x + 2, y, x - 2, y, c); P.tri(x - 4, y, x, y + 2, x, y - 2, c); P.tri(x + 4, y, x, y + 2, x, y - 2, c); P.px(x, y, '#14121f'); } },
  rod: P => { P.rect(8, 3, 2, 14, '#8d9bbd'); P.poly([[9, 1], [6, 6], [11, 8], [8, 12]], '#ffe44e', 2); P.px(9, 2, '#fff'); P.rect(6, 15, 6, 2, '#434d6e'); },
  launcher: P => { P.rect(2, 6, 12, 6, '#6a7090'); P.rect(2, 6, 12, 1, '#b8bfd0'); P.rect(12, 5, 5, 8, '#434d6e'); P.rect(4, 12, 3, 5, '#5a3a22'); P.ell(15, 4, 2, 2, '#14121f'); P.px(16, 2, '#ffd34e'); },
  meteor: P => { P.line(3, 16, 9, 4, '#5a3a22', 2); P.ell(11, 5, 4, 4, '#6a4a3a'); P.ell(11, 5, 3, 3, '#ff7a2a'); P.ell(11, 5, 1, 1, '#ffd34e'); P.tri(14, 8, 17, 14, 9, 12, '#ff5a2a'); },
  cross: P => { P.rect(7, 1, 4, 16, '#ffd34e'); P.rect(2, 5, 14, 4, '#ffd34e'); P.rect(8, 2, 2, 14, '#fff6c0'); P.rect(3, 6, 12, 2, '#fff6c0'); P.px(9, 3, '#fff'); },
  orb: P => { P.ell(9, 9, 7, 7, '#2a1a4a'); P.ell(9, 9, 5, 5, '#14101e'); P.ell(9, 9, 2, 2, '#000'); for (let i = 0; i < 6; i++) { const a = i * 1.05; P.px(Math.round(9 + Math.cos(a) * 6), Math.round(9 + Math.sin(a) * 6), '#a15be0'); } P.px(6, 5, '#d58bff'); },
  stormbow: P => { P.poly([[3, 0], [10, 5], [10, 13], [3, 17]], '#6ee7f2', 2); P.line(3, 0, 3, 17, '#fff', 1); for (const y of [4, 8, 12]) P.line(5, y + 1, 16, y + 1, '#ffe44e', 1); P.tri(15, 7, 15, 11, 18, 9, '#ffe44e'); },
  hourglass: P => { P.rect(3, 1, 12, 2, '#c89a1c'); P.rect(3, 15, 12, 2, '#c89a1c'); P.tri(4, 3, 14, 3, 9, 9, '#bff3ff'); P.tri(4, 15, 14, 15, 9, 9, '#bff3ff'); P.tri(6, 14, 12, 14, 9, 11, '#ffd34e'); P.px(9, 6, '#ffd34e'); },
  thundergod: P => { P.line(4, 17, 12, 3, '#c89a1c', 2); P.poly([[13, 0], [9, 6], [14, 7], [10, 13]], '#ffe44e', 2); P.ell(13, 3, 3, 3, '#6ee7f2'); P.px(13, 2, '#fff'); },
  dragonhorn: P => { P.poly([[2, 14], [6, 8], [11, 5], [16, 3]], '#e8dfc0', 4); P.poly([[2, 14], [6, 8], [11, 5], [16, 3]], '#c8b890', 2); P.rect(1, 12, 4, 4, '#c89a1c'); P.tri(14, 1, 17, 4, 12, 4, '#ff7a2a'); P.px(16, 2, '#ffd34e'); }
};
function itemIcon(id) {
  const k = 'ic_' + id; if (_cache[k]) return _cache[k];
  const it = ITEM[id], col = RARITY_COL[it.rar], [c, x] = mkCanvas(26, 26); x.imageSmoothingEnabled = false;
  x.fillStyle = '#14121f'; x.fillRect(0, 0, 26, 26); x.fillStyle = col; x.globalAlpha = 0.22; x.fillRect(1, 1, 24, 24); x.globalAlpha = 1;
  x.fillStyle = col; x.fillRect(0, 0, 26, 1); x.fillRect(0, 25, 26, 1); x.fillRect(0, 0, 1, 26); x.fillRect(25, 0, 1, 26);
  let sp;
  if (it.type === 'sword') {
    sp = swordSprite(id); x.save(); x.translate(13, 13); x.rotate(-Math.PI / 4); const s = Math.min(1, 25 / (sp.w * 0.72)); x.scale(s, s); x.drawImage(sp.c, -sp.w / 2, -sp.h / 2); x.restore();
  } else {
    if (it.type === 'armor') sp = paint(22, 22, P => armorPaint(P, id));
    else if (it.type === 'pet') sp = petSprite(id);
    else sp = paint(20, 20, WPN_PAINT[id]);
    const s = it.type === 'pet' ? 1.1 : 1; x.drawImage(sp.c, Math.round(13 - sp.w * s / 2), Math.round(13 - sp.h * s / 2), Math.round(sp.w * s), Math.round(sp.h * s));
  }
  return (_cache[k] = { c, w: 26, h: 26 });
}

// summoned Thunder God (ally)
function godSprite() {
  if (_cache.god) return _cache.god;
  return (_cache.god = paint(40, 54, P => {
    P.ell(20, 44, 12, 9, '#e8e0ff'); P.tri(8, 54, 32, 54, 20, 28, '#cfc8f0');
    P.rect(11, 22, 18, 20, '#d8d0f4'); P.rect(11, 22, 18, 2, '#fff'); P.rect(12, 33, 16, 3, '#ffd34e');
    P.both(() => { P.rect(6, 24, 5, 16, '#e8c8a0'); P.rect(4, 36, 7, 5, '#e8c8a0'); });
    P.ell(20, 14, 8, 9, '#f0d0a8'); P.ell(20, 9, 9, 6, '#fff6c0'); P.rect(11, 12, 18, 4, '#fff6c0'); P.ell(20, 22, 7, 6, '#fff');
    P.both(() => { P.rect(14, 13, 4, 2, '#6ee7f2'); P.px(15, 13, '#fff'); });
    P.rect(18, 17, 4, 1, '#c89a1c'); P.poly([[34, 6], [30, 18], [36, 20], [32, 36]], '#ffe44e', 3);
    P.ell(34, 6, 3, 3, '#fff'); P.line(8, 2, 14, 8, '#ffd34e', 2); P.line(32, 2, 26, 8, '#ffd34e', 2);
  }, '#ffd34e'));
}

// armor helper used when rendering the player
function armorVis(id) { return id && ARMOR_LOOK[id] ? ARMOR_LOOK[id] : null; }

// ============ MORE ITEMS (+10 swords, +10 armors, +10 pets, +10 special weapons) ============
Object.assign(SWORD_LOOK, {
  cutlass: { shape: 'curved', len: 20, bl: '#cfd6e6', ed: '#ffffff', gd: '#c89a1c', gr: '#7a2a10', gl: null },
  mace: { shape: 'wide', len: 16, bl: '#8a6a44', ed: '#c8a070', gd: '#5a3a22', gr: '#3a2412', gl: null },
  glacier: { shape: 'straight', len: 30, bl: '#bfefff', ed: '#ffffff', gd: '#6ec8ff', gr: '#2a4a8a', gl: '#9fe8ff' },
  magma: { shape: 'wide', len: 24, bl: '#d03a30', ed: '#ff9a2a', gd: '#2a1a1a', gr: '#3a1a10', gl: '#ff6a2a' },
  plague: { shape: 'serrated', len: 26, bl: '#5a8a3a', ed: '#c8f07a', gd: '#2b4a2a', gr: '#1a2a1a', gl: '#9be564' },
  storm: { shape: 'zig', len: 26, bl: '#9fe8ff', ed: '#ffffff', gd: '#6a6aff', gr: '#2a2a5a', gl: '#9fe8ff' },
  bloodmoon: { shape: 'curved', len: 26, bl: '#a01830', ed: '#ff7a8a', gd: '#2a0a14', gr: '#2a0a14', gl: '#ff3a5a' },
  archangel: { shape: 'holy', len: 30, bl: '#ffffff', ed: '#fff6c0', gd: '#ffd34e', gr: '#c89a1c', gl: '#fff6c0' },
  dragonfang: { shape: 'flame', len: 30, bl: '#b02a2a', ed: '#ffd34e', gd: '#c89a1c', gr: '#3a1a10', gl: '#ff8a3a' },
  cosmic: { shape: 'wide', len: 34, bl: '#5a3aa8', ed: '#e8d8ff', gd: '#ffd34e', gr: '#1a0f2e', gl: '#b88aff' }
});
[
  ['cutlass', 2, 'Pirate Cutlass', 'Đoản Đao Hải Tặc', '+1 damage and 12% critical hits (x3).', '+1 sát thương và 12% đòn chí mạng (x3).', { dmg: 1, crit: 0.12 }],
  ['mace', 3, 'Spiked Mace', 'Chùy Gai', '+2 damage, heavy and slow, but hits slow monsters down.', '+2 sát thương, nặng và chậm, nhưng làm quái bị chậm lại.', { dmg: 2, cd: 1.25, reach: 0.9, slow: 1.5 }],
  ['glacier', 5, 'Glacier Lance', 'Thương Băng Sông', '+2 damage, very long reach. Hits freeze monsters for 3s.', '+2 sát thương, tầm đánh rất xa. Đòn đánh đóng băng quái 3 giây.', { dmg: 2, reach: 1.5, slow: 3 }],
  ['magma', 6, 'Magma Cleaver', 'Rìu Dung Nham', '+3 damage, slow. Burns monsters; every 6th hit erupts in a shockwave.', '+3 sát thương, chậm. Đốt quái; cứ 6 đòn lại nổ sóng xung kích.', { dmg: 3, cd: 1.2, burn: 3, nova: 6 }],
  ['plague', 7, 'Plague Scythe', 'Lưỡi Hái Dịch Bệnh', '+3 damage, long reach. Poison stacks up to 4 times and keeps ticking.', '+3 sát thương, tầm xa. Độc cộng dồn tới 4 lần và liên tục gây sát thương.', { dmg: 3, poison: 5, reach: 1.15 }],
  ['storm', 9, 'Storm Cutter', 'Kiếm Bão Tố', '+3 damage, fast. Lightning chains to 3 enemies and every 5th hit sends a wind slash.', '+3 sát thương, nhanh. Sét lan sang 3 kẻ địch và cứ 5 đòn lại bắn luồng gió chém.', { dmg: 3, cd: 0.8, chain: 3, wind: 5 }],
  ['bloodmoon', 10, 'Bloodmoon Blade', 'Kiếm Trăng Máu', '+4 damage, 15% crits, heals 1 heart every 4 hits.', '+4 sát thương, 15% chí mạng, hồi 1 tim sau mỗi 4 đòn trúng.', { dmg: 4, ls: 4, crit: 0.15 }],
  ['archangel', 12, 'Archangel Sword', 'Kiếm Tổng Lãnh Thiên Thần', '+5 damage. Shoots 2 light beams per swing, heals, and revives you once per level.', '+5 sát thương. Mỗi nhát bắn 2 tia sáng, hồi máu và hồi sinh bạn 1 lần mỗi màn.', { dmg: 5, beam: 2, ls: 12, revive: 1 }],
  ['dragonfang', 13, 'Dragon Fang', 'Nanh Rồng', '+6 damage, x1.6 vs bosses and big monsters. Burns and sends shockwaves.', '+6 sát thương, x1,6 với boss và quái to. Có đốt cháy và sóng xung kích.', { dmg: 6, burn: 4, boss: 1.6, nova: 6, reach: 1.2 }],
  ['cosmic', 14, 'Cosmic Edge', 'Lưỡi Kiếm Vũ Trụ', '+8 damage. Chain lightning, 3 light beams per swing and a burning star aura.', '+8 sát thương. Sét lan, 3 tia sáng mỗi nhát và hào quang sao đốt cháy.', { dmg: 8, chain: 3, beam: 3, aura: 1, reach: 1.3 }]
].forEach(a => addItem({ id: a[0], type: 'sword', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));

Object.assign(ARMOR_LOOK, {
  scalem: { sw: { b: '#2b8a6e', A: '#5fcfa0', a: '#bfffe0' } },
  ranger: { sw: { b: '#3a6a2a', A: '#6a4a2a', a: '#9ae070', r: '#a02a2a' }, cape: '#3a6a2a' },
  mageb: { sw: { b: '#4a3aa8', A: '#7a6ae8', a: '#cfc4ff', r: '#ffd34e' }, aura: '#a98bff' },
  bone: { sw: { b: '#c8c0a8', A: '#e8dfc0', a: '#ffffff', r: '#8e2335' }, spikes: '#ffffff' },
  tidal: { sw: { b: '#2a8ac8', A: '#6ee7f2', a: '#ffffff', r: '#6ee7f2' }, aura: '#6ee7f2' },
  stormp: { sw: { b: '#4a5a8a', A: '#9fe8ff', a: '#ffffff', r: '#ffe44e' }, aura: '#9fe8ff' },
  samurai: { sw: { b: '#a02a2a', A: '#2a2a3a', a: '#ffd34e', r: '#ffd34e' }, spikes: '#ffd34e' },
  lunar: { sw: { b: '#2a2a5a', A: '#c8d0ff', a: '#ffffff', r: '#c8d0ff' }, halo: '#e8e8ff', aura: '#c8d0ff' },
  phoenixm: { sw: { b: '#d03a30', A: '#ff9a2a', a: '#ffd34e', r: '#ffd34e' }, wings: 'dragon', aura: '#ff8a3a', flame: true },
  godplate: { sw: { b: '#ffd34e', A: '#fff6c0', a: '#ffffff', r: '#6ee7f2' }, wings: 'angel', halo: '#fff2a0', aura: '#ffe08a' }
});
[
  ['scalem', 3, 'Scale Mail', 'Giáp Vảy', '+2 hearts and 10% damage reduction.', '+2 tim và giảm 10% sát thương.', { hp: 2, red: 0.1 }],
  ['ranger', 4, 'Ranger Garb', 'Giáp Thợ Săn Rừng', '+2 hearts, 15% dodge, run 8% faster.', '+2 tim, 15% né đòn, chạy nhanh hơn 8%.', { hp: 2, dodge: 0.15, speed: 0.08 }],
  ['mageb', 5, 'Mage Robe', 'Áo Pháp Sư', '+2 hearts, 8% reduction. A magic shield blocks one hit every 18s.', '+2 tim, giảm 8% sát thương. Khiên phép chặn 1 đòn mỗi 18 giây.', { hp: 2, red: 0.08, shieldT: 18 }],
  ['bone', 6, 'Bone Armor', 'Giáp Xương', '+3 hearts, 12% reduction. Reflects 2 damage to attackers.', '+3 tim, giảm 12% sát thương. Phản 2 sát thương lên kẻ tấn công.', { hp: 3, red: 0.12, thorns: 2 }],
  ['tidal', 8, 'Tidal Mail', 'Giáp Thủy Triều', '+4 hearts, 15% reduction, regen 1 heart / 24s, immune to slow.', '+4 tim, giảm 15% sát thương, hồi 1 tim / 24 giây, miễn nhiễm làm chậm.', { hp: 4, red: 0.15, regen: 24, slowImm: 1 }],
  ['stormp', 9, 'Storm Plate', 'Giáp Bão Tố', '+4 hearts, 20% reduction. Reflects 2 and unleashes a shockwave when hit.', '+4 tim, giảm 20% sát thương. Phản 2 và nổ sóng xung kích khi bị đánh.', { hp: 4, red: 0.2, thorns: 2, nova: 1 }],
  ['samurai', 10, 'Samurai Armor', 'Giáp Samurai', '+4 hearts, 20% dodge and 20% reduction.', '+4 tim, 20% né đòn và giảm 20% sát thương.', { hp: 4, dodge: 0.2, red: 0.2 }],
  ['lunar', 11, 'Lunar Garb', 'Y Phục Nguyệt Quang', '+5 hearts, 20% dodge, melt into moonlight after a hit, regen 1 heart / 30s.', '+5 tim, 20% né đòn, hóa ánh trăng sau khi bị đánh, hồi 1 tim / 30 giây.', { hp: 5, dodge: 0.2, shadow: 1, regen: 30 }],
  ['phoenixm', 13, 'Phoenix Mail', 'Giáp Phượng Hoàng', '+6 hearts, 30% reduction, burning thorns (3), immune to fire. Revives you once per level.', '+6 tim, giảm 30% sát thương, gai lửa (3), miễn nhiễm lửa. Hồi sinh bạn 1 lần mỗi màn.', { hp: 6, red: 0.3, thorns: 3, thornFx: 'burn', fireImm: 1, revive: 1 }],
  ['godplate', 15, 'Titan Godplate', 'Giáp Thần Titan', '+9 hearts, 40% reduction, reflects 5, shield every 7s, regen, shockwaves; immune to fire and slow. The ultimate armor.', '+9 tim, giảm 40% sát thương, phản 5, khiên mỗi 7 giây, tự hồi máu, sóng xung kích; miễn nhiễm lửa và làm chậm. Bộ giáp tối thượng.', { hp: 9, red: 0.4, thorns: 5, shieldT: 7, regen: 25, nova: 1, slowImm: 1, fireImm: 1 }]
].forEach(a => addItem({ id: a[0], type: 'armor', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6], look: ARMOR_LOOK[a[0]] }));

Object.assign(PET_PAINT, {
  hamster: P => { const c = '#e8c080'; P.ell(9, 9, 6, 5, c); P.ell(10, 11, 4, 3, '#fff0d0'); P.ell(5, 4, 2, 2, c); P.ell(13, 4, 2, 2, c); P.px(5, 4, '#ffb0c0'); P.px(13, 4, '#ffb0c0'); P.px(7, 8, 'k'); P.px(12, 8, 'k'); P.px(10, 10, '#ffb0c0'); P.px(5, 10, '#ffb0c0'); P.px(14, 10, '#ffb0c0'); P.rect(5, 13, 3, 1, '#c89a50'); P.rect(12, 13, 3, 1, '#c89a50'); },
  panda: P => { P.ell(8, 9, 6, 5, '#f6f3e9'); P.rect(6, 8, 6, 3, '#2a2e40'); P.ell(12, 5, 4, 4, '#f6f3e9'); P.ell(9, 2, 2, 2, 'k'); P.ell(15, 2, 2, 2, 'k'); P.ell(11, 5, 1, 2, 'k'); P.ell(14, 5, 1, 2, 'k'); P.px(11, 5, 'w'); P.px(14, 5, 'w'); P.px(13, 7, 'k'); P.rect(4, 11, 3, 3, 'k'); P.rect(11, 11, 3, 3, 'k'); },
  frog: P => { P.ell(9, 10, 6, 4, '#5fcf5a'); P.ell(10, 12, 4, 2, '#c8f0a0'); P.ell(12, 7, 4, 3, '#5fcf5a'); P.ell(10, 4, 2, 2, '#5fcf5a'); P.ell(14, 4, 2, 2, '#5fcf5a'); P.px(10, 4, 'w'); P.px(14, 4, 'w'); P.px(11, 4, 'k'); P.px(15, 4, 'k'); P.rect(11, 8, 5, 1, '#2b8a3e'); P.rect(3, 12, 5, 2, '#2b8a3e'); P.rect(12, 12, 4, 2, '#2b8a3e'); },
  penguin: P => { P.ell(8, 8, 5, 6, '#2a2e40'); P.ell(9, 9, 3, 4, '#f6f3e9'); P.ell(11, 4, 3, 3, '#2a2e40'); P.tri(13, 4, 13, 6, 17, 5, '#ff9a2a'); P.px(12, 3, 'w'); P.px(12, 3, 'k'); P.tri(4, 6, 1, 10, 5, 11, '#2a2e40'); P.rect(6, 13, 3, 1, '#ff9a2a'); P.rect(10, 13, 3, 1, '#ff9a2a'); P.px(5, 2, '#6ee7f2'); },
  tigercub: P => { const c = '#f08a2b'; P.line(3, 9, 0, 4, c, 2); P.ell(8, 9, 6, 4, c); P.ell(9, 11, 3, 2, '#fff0d0'); P.ell(13, 6, 3, 3, c); P.tri(11, 4, 12, 0, 13, 4, c); P.tri(14, 4, 15, 0, 16, 4, c); P.px(14, 6, 'k'); P.px(16, 7, 'k'); for (const x of [5, 8, 11]) P.rect(x, 6, 1, 3, 'k'); P.rect(5, 12, 2, 2, '#c8601a'); P.rect(11, 12, 2, 2, '#c8601a'); },
  thunderbird: P => { P.ell(8, 8, 5, 4, '#ffe44e'); P.ell(12, 5, 3, 3, '#ffe44e'); P.tri(14, 5, 14, 7, 18, 6, '#ff9a2a'); P.px(13, 4, 'k'); P.tri(3, 7, 0, 1, 7, 6, '#fff8a0'); P.tri(6, 6, 9, 0, 11, 6, '#fff8a0'); P.px(1, 2, '#fff'); P.poly([[11, 0], [9, 2], [12, 3], [10, 5]], '#fff', 1); P.rect(6, 12, 1, 2, '#ff9a2a'); P.rect(9, 12, 1, 2, '#ff9a2a'); },
  cerberus: P => { const c = '#7a1a2a'; P.line(3, 8, 0, 3, '#ff6a3a', 3); P.ell(8, 10, 6, 4, c); for (const [x, y] of [[10, 4], [13, 6], [14, 3]]) { P.ell(x, y, 2, 2, c); P.px(x + 1, y, '#ffe033'); } P.tri(9, 2, 10, 0, 11, 3, c); P.tri(12, 1, 13, -1 + 1, 14, 3, c); P.rect(5, 12, 2, 2, c); P.rect(10, 12, 2, 2, c); P.rect(14, 5, 3, 2, 'k'); },
  seraphcat: P => { P.tri(6, 7, 1, 1, 3, 10, 'rgba(255,255,255,.9)'); P.tri(8, 6, 4, 0, 6, 8, 'rgba(230,240,255,.9)'); P.ell(8, 10, 5, 4, '#fff'); P.ell(12, 6, 3, 3, '#fff'); P.tri(10, 4, 11, 0, 13, 4, '#fff'); P.tri(13, 4, 14, 0, 15, 4, '#fff'); P.rect(10, 1, 5, 1, '#ffd34e'); P.px(12, 6, 'k'); P.px(14, 7, '#ffb0c0'); P.line(3, 11, 0, 8, '#fff', 2); P.rect(5, 13, 2, 1, '#e8e8f4'); P.rect(10, 13, 2, 1, '#e8e8f4'); },
  griffin: P => { P.tri(5, 8, 0, 2, 9, 6, '#8a5a30'); P.tri(7, 7, 3, 1, 11, 6, '#a06a3a'); P.ell(8, 10, 6, 4, '#c89a50'); P.ell(13, 5, 3, 3, '#f6f3e9'); P.tri(15, 5, 15, 8, 18, 7, '#ffd34e'); P.px(14, 4, 'k'); P.line(3, 11, 0, 13, '#a06a3a', 2); P.rect(5, 13, 2, 1, '#8a5a30'); P.rect(10, 13, 2, 1, '#8a5a30'); },
  starfox: P => { const c = '#6a3aa8'; P.line(3, 9, 0, 4, '#6ee7f2', 3); P.ell(8, 9, 5, 4, c); P.ell(9, 10, 3, 2, '#c8b0ff'); P.ell(12, 6, 3, 3, c); P.tri(10, 4, 11, 0, 13, 4, c); P.tri(13, 4, 14, 0, 15, 4, c); P.tri(14, 7, 17, 8, 14, 9, '#fff'); P.px(13, 6, '#ffe44e'); P.px(11, 5, '#ffe44e'); P.px(2, 2, '#fff'); P.px(16, 11, '#fff'); P.px(1, 7, '#ffe44e'); P.rect(5, 12, 2, 2, '#3a1a6a'); P.rect(10, 12, 2, 2, '#3a1a6a'); }
});
[
  ['hamster', 2, 'Hamster', 'Chuột Hamster', 'Stuffs its cheeks with coins: strong coin magnet.', 'Nhét đầy má bằng xu: hút xu rất mạnh.', { role: 'coin' }],
  ['panda', 4, 'Chubby Panda', 'Gấu Trúc Mũm Mĩm', 'A comfy tank: -20% damage taken.', 'Chịu đòn êm ái: giảm 20% sát thương nhận vào.', { role: 'tank', red: 0.2 }],
  ['frog', 5, 'Hoppy Frog', 'Ếch Nhảy', 'Snaps at nearby monsters: 1 damage every 1.2s.', 'Ngoạm quái ở gần: 1 sát thương mỗi 1,2 giây.', { role: 'bite' }],
  ['penguin', 7, 'Frost Penguin', 'Chim Cánh Cụt Băng', 'Spits ice shards that slow monsters for 3s every 2.2s.', 'Phun mảnh băng làm quái chậm 3 giây, mỗi 2,2 giây.', { role: 'ice' }],
  ['tigercub', 8, 'Tiger Cub', 'Hổ Con', '+12% run speed and a higher jump.', '+12% tốc độ chạy và nhảy cao hơn.', { role: 'speed', speed: 0.12, jump: 1.1 }],
  ['thunderbird', 10, 'Thunderbird', 'Chim Sấm', 'Calls lightning on the nearest monster every 5s, chaining to 2 more.', 'Gọi sét đánh quái gần nhất mỗi 5 giây, lan thêm 2 con nữa.', { role: 'thunder' }],
  ['cerberus', 12, 'Cerberus Pup', 'Cún Ba Đầu', 'Spits fireballs at monsters: 3 damage every 1.8s.', 'Phun cầu lửa vào quái: 3 sát thương mỗi 1,8 giây.', { role: 'fire' }],
  ['seraphcat', 13, 'Seraph Cat', 'Mèo Thiên Thần', 'Heals 1 heart every 20 seconds.', 'Hồi 1 tim mỗi 20 giây.', { role: 'heal', t: 20 }],
  ['griffin', 14, 'Baby Griffin', 'Sư Thứu Con', 'Intercepts one enemy projectile every 4 seconds.', 'Chặn một viên đạn của kẻ địch mỗi 4 giây.', { role: 'block' }],
  ['starfox', 15, 'Star Fox', 'Cáo Tinh Tú', 'Cosmic aura: +1 sword damage, heals 1 heart / 25s, strong coin magnet.', 'Hào quang vũ trụ: +1 sát thương kiếm, hồi 1 tim / 25 giây, hút xu mạnh.', { role: 'rainbow' }]
].forEach(a => addItem({ id: a[0], type: 'pet', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));

Object.assign(WPN_PAINT, {
  slingshot: P => { P.line(9, 17, 9, 10, '#8a5a30', 2); P.line(9, 10, 4, 3, '#8a5a30', 2); P.line(9, 10, 14, 3, '#8a5a30', 2); P.line(4, 3, 14, 3, '#cfd6e6', 1); P.ell(9, 3, 1, 1, '#8d9bbd'); },
  knives: P => { for (const [x0, x1] of [[4, 2], [9, 9], [14, 16]]) { P.line(x0, 16, x1, 6, '#5a3a22', 2); P.tri(x1 - 1, 7, x1 + 2, 7, x1 + (x1 > x0 ? 1 : (x1 < x0 ? -1 : 0)), 0, '#cfd6e6'); } },
  dart: P => { P.line(2, 16, 14, 4, '#5a3a22', 2); P.tri(14, 2, 17, 5, 13, 6, '#7ed957'); P.tri(2, 16, 0, 13, 4, 14, '#e0453a'); P.px(16, 3, '#d8ff9a'); },
  cannon: P => { P.rect(2, 8, 12, 6, '#434d6e'); P.rect(2, 8, 12, 1, '#8d9bbd'); P.rect(12, 7, 5, 8, '#2a2e40'); P.ell(6, 15, 3, 3, '#5a3a22'); P.ell(6, 15, 1, 1, '#c8964a'); P.px(3, 6, '#ffd34e'); P.px(3, 5, '#ff7a2a'); },
  chainlight: P => { P.rect(7, 10, 4, 7, '#8d9bbd'); P.rect(5, 16, 8, 2, '#434d6e'); P.ell(9, 7, 4, 4, '#6a6aff'); P.ell(9, 7, 2, 2, '#fff'); P.poly([[9, 0], [6, 3], [10, 4], [7, 7]], '#ffe44e', 2); },
  laser: P => { P.rect(3, 6, 12, 6, '#434d6e'); P.rect(4, 7, 8, 1, '#8d9bbd'); P.rect(13, 8, 5, 2, '#ff3a5a'); P.ell(15, 9, 1, 1, '#fff'); P.rect(4, 12, 3, 5, '#2a2e40'); P.px(8, 9, '#ff3a5a'); P.px(10, 9, '#ff3a5a'); },
  windstaff: P => { P.line(4, 17, 10, 5, '#8a5a30', 2); P.ell(11, 5, 4, 4, '#6ee7b0'); P.ell(11, 5, 2, 2, '#e8fff4'); P.px(8, 2, '#fff'); P.px(15, 8, '#fff'); P.px(14, 1, '#bff3ff'); },
  iceage: P => { P.rect(8, 1, 2, 16, '#bff3ff'); P.rect(1, 8, 16, 2, '#bff3ff'); P.line(3, 3, 15, 15, '#8fe0f8', 1); P.line(15, 3, 3, 15, '#8fe0f8', 1); P.ell(9, 9, 2, 2, '#fff'); },
  solarflare: P => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P.line(Math.round(9 + Math.cos(a) * 5), Math.round(9 + Math.sin(a) * 5), Math.round(9 + Math.cos(a) * 8), Math.round(9 + Math.sin(a) * 8), '#ff9a2a', 1); } P.ell(9, 9, 5, 5, '#ffd34e'); P.ell(9, 9, 3, 3, '#fff6c0'); },
  starfall: P => { const c = '#ffe44e'; P.tri(9, 1, 5, 8, 13, 8, c); P.tri(9, 16, 5, 9, 13, 9, c); P.tri(1, 7, 8, 5, 8, 11, c); P.tri(17, 7, 10, 5, 10, 11, c); P.ell(9, 8, 2, 2, '#fff'); }
});
[
  ['slingshot', 1, 'Slingshot', 'Súng Cao Su', 'Flings a stone in a line. Quick reload.', 'Bắn một viên đá thẳng. Nạp đạn nhanh.', { cd: 0.45 }],
  ['knives', 3, 'Throwing Knives', 'Dao Phi Tiêu Ba', 'Throws 3 knives in a narrow fan.', 'Ném 3 con dao thành hình quạt hẹp.', { cd: 1.0 }],
  ['dart', 4, 'Poison Dart', 'Phi Tiêu Độc', 'A dart that poisons the target (stacking damage over time).', 'Phi tiêu làm mục tiêu trúng độc (sát thương cộng dồn theo thời gian).', { cd: 0.8 }],
  ['cannon', 6, 'Hand Cannon', 'Pháo Cầm Tay', 'Fires a heavy cannonball that explodes on impact (6 damage, big blast).', 'Bắn đạn pháo nặng nổ khi chạm (6 sát thương, nổ lớn).', { cd: 2.4 }],
  ['chainlight', 8, 'Tesla Coil', 'Cuộn Tesla', 'Zaps the nearest enemy and arcs through up to 4 more.', 'Giật kẻ địch gần nhất và lan qua tối đa 4 kẻ nữa.', { cd: 3 }],
  ['laser', 9, 'Ruby Laser', 'Súng Laser Hồng Ngọc', 'Fires a piercing laser beam for a second.', 'Bắn tia laser xuyên thấu trong một giây.', { cd: 7 }],
  ['windstaff', 10, 'Tempest Staff', 'Trượng Cuồng Phong', 'Summons a cyclone for 3.5s that drags enemies in and shreds them.', 'Triệu hồi cơn lốc 3,5 giây hút kẻ địch vào và xé nát chúng.', { cd: 12 }],
  ['iceage', 12, 'Ice Age Scroll', 'Cuộn Giấy Kỷ Băng Hà', 'A blizzard hits every monster on screen: damage and a 5s freeze.', 'Bão tuyết đánh mọi quái trên màn hình: gây sát thương và đóng băng 5 giây.', { cd: 16 }],
  ['solarflare', 13, 'Solar Flare Orb', 'Quả Cầu Mặt Trời', 'A huge solar explosion around you: heavy damage and burning.', 'Một vụ nổ mặt trời khổng lồ quanh bạn: sát thương lớn và thiêu đốt.', { cd: 18 }],
  ['starfall', 15, 'Starfall Wand', 'Đũa Sao Rơi', 'Calls 14 shooting stars down across the whole screen!', 'Gọi 14 ngôi sao băng rơi khắp màn hình!', { cd: 26 }]
].forEach(a => addItem({ id: a[0], type: 'wpn', tier: a[1], name: T2(a[2], a[3]), desc: T2(a[4], a[5]), st: a[6] }));
