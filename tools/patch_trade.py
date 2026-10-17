import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

def levels(s):
    # 4 Star Gems per map, hidden on high platforms (or far along the ground)
    s = rep(s, "  return L;\n}", """  { const cand = [];
    for (let x = 12; x < (L.arena ? L.arena.x0 - 4 : W - 10); x++) for (let y = 2; y <= 7; y++) if (L.grid[y][x] === '=' && L.grid[y - 1][x] === ' ' && L.grid[y - 2] && L.grid[y - 2][x] === ' ') cand.push([x, y]);
    const rr2 = mulberry32(5150 + li * 97), picks = [];
    for (let k = 0; k < 4; k++) {
      const seg = (L.arena ? L.arena.x0 : W) / 4, inSeg = cand.filter(c => c[0] >= seg * k && c[0] < seg * (k + 1));
      const c = inSeg.length ? inSeg[Math.floor(rr2() * inSeg.length)] : [Math.floor(seg * k + seg * 0.6), 9];
      picks.push(c); L.spawns.push({ id: L.id++, type: 'rare', k, x: c[0] * TS + TS / 2, y: (c[1] - 1) * TS + 4 });
    } }
  return L;
}""")
    # the trader visits every map
    s = rep(s, "  0: { start: ['lila'], cps: ['fairy'] },", "  0: { start: ['lila', 'trader'], cps: ['fairy'] },")
    s = rep(s, "  1: { start: ['bram'], cps: ['gob', 'quan', 'wizard'] },", "  1: { start: ['bram', 'trader'], cps: ['gob', 'quan', 'wizard'] },")
    s = rep(s, "  2: { cps: ['quan', 'hoang', 'smith', 'wizard'] },", "  2: { start: ['trader'], cps: ['quan', 'hoang', 'smith', 'wizard'] },")
    s = rep(s, "  3: { start: ['bram'], cps: ['gob', 'duong', 'lyra', 'smith'] },", "  3: { start: ['bram', 'trader'], cps: ['gob', 'duong', 'lyra', 'smith'] },")
    s = rep(s, "  4: { cps: ['angel', 'santree', 'smith'] },", "  4: { start: ['trader'], cps: ['angel', 'santree', 'smith'] },")
    s = rep(s, "  5: { cps: ['gob', 'lyra', 'smith'] },", "  5: { start: ['trader'], cps: ['gob', 'lyra', 'smith'] },")
    s = rep(s, "  6: { cps: ['wizard'], pre:", "  6: { start: ['trader'], cps: ['wizard'], pre:")
    return s
edit('src/levels.js', levels)

def game(s):
    # --- save fields ---
    s = rep(s, "  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };\n", """  if (!save.ammo) save.ammo = { dagger: 0, bomb: 0, flask: 0 };
  save.rare = save.rare | 0; if (!save.rareGot || typeof save.rareGot !== 'object') save.rareGot = {};
  save.bonusHP = save.bonusHP | 0; save.bonusDmg = save.bonusDmg | 0; if (!save.cos || typeof save.cos !== 'object') save.cos = {};
  if (!Array.isArray(save.heroUnlock)) save.heroUnlock = [];
""")
    s = rep(s, "  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP();", "  const baseHP = () => 3 + Math.floor(totalShards() / 3) + (hasRelic(0) ? 2 : 0) + armHP() + (save.bonusHP | 0);")
    s = rep(s, "+ 1 + Math.floor(totalShards() / 7) +", "+ 1 + (save.bonusDmg | 0) + Math.floor(totalShards() / 7) +")
    # --- input: B / I / gamepad Back opens the bag and shop ---
    s = rep(s, "    act.skillP = any(pressed, ['KeyR']) || gpP('rb');", "    act.skillP = any(pressed, ['KeyR']) || gpP('rb');\n    act.shopP = any(pressed, ['KeyB', 'KeyI']) || gpP('back');")
    s = rep(s, "gb.start = b(9);", "gb.start = b(9); gb.back = b(8);")
    s = rep(s, "act.upP = act.downP = act.skillP = false; }", "act.upP = act.downP = act.skillP = act.shopP = false; }")
    s = rep(s, "    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }", "    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }\n    if (act.shopP && st === 'play') { openShopInGame(); return; }")
    # --- the Star Gem pickups ---
    s = rep(s, "      else if (s.type === 'boss') Q.boss = makeBoss(s);", "      else if (s.type === 'boss') Q.boss = makeBoss(s);\n      else if (s.type === 'rare') { if ((save.rareGot[Q.li] || []).indexOf(s.k) < 0) Q.items.push({ kind: 'rare', x: s.x, y: s.y, id: s.id, k: s.k, ph: Math.random() * 6 }); }")
    s = rep(s, "      } else if (it.kind === 'key') {\n        if (d < 13)", """      } else if (it.kind === 'rare') {
        if (d < 13) {
          it.dead = true; Snd.play('shard'); emit(it.x, it.y, 26, { col: ['#c07bff', '#6ee7f2', '#fff'], sp0: 20, sp1: 110 }); addRing(it.x, it.y, '#c07bff', 30, 0.4);
          if (!coop || P === Q.me) { save.rare++; const g2 = save.rareGot[Q.li] || (save.rareGot[Q.li] = []); if (g2.indexOf(it.k) < 0) g2.push(it.k); writeSave(); Q.msg = sv('Star Gem! You have ', 'Ngọc Sao! Bạn có ') + save.rare + sv(' - trade them with the travelling merchant (B).', ' viên - đổi quà ở thương nhân (B).'); Q.msgT = 4; }
          else { coopGive(P, { t: 'rare' }); Q.msg = 'P' + (P.slot + 1) + sv(' found a Star Gem!', ' nhặt được Ngọc Sao!'); Q.msgT = 3; }
        }
      } else if (it.kind === 'key') {
        if (d < 13)""")
    # shared hearts and gold in co-op
    s = rep(s, "        if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true;", "        if (d < 11 && coop && Q.players) { const need = Q.players.filter(p => !p.down && p.hp < (p.mhp || maxHP())); if (need.length) { for (const p of need) { p.hp++; emit(p.x + 4, p.y + 2, 8, { col: ['#e0453a', '#ff7fb0'], sp0: 10, sp1: 40 }); } it.dead = true; Snd.play('heart'); if (it.id >= 0) Q.taken.add(it.id); pop(it.x, it.y - 10, sv('+1 HP for the team', '+1 máu cả đội'), '#ff7fb0'); } }\n        else if (d < 11) { if (P.hp < maxHP()) { P.hp++; it.dead = true;")
    s = rep(s, "Q.coinsRun += cv2; save.coins += cv2;", "Q.coinsRun += cv2; save.coins += cv2; if (coop) coop.gold = (coop.gold || 0) + cv2;")
    s = rep(s, "      } else if (it.kind === 'shard') {\n        const s = getSprite('shard');", """      } else if (it.kind === 'rare') {
        const by = y + Math.round(Math.sin(it.ph * 3) * 2);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3 + Math.sin(it.ph * 5) * 0.1; disc(g, x, by, 10, '#c07bff'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        drawRareIc(x, by, 1.4);
        if (Math.random() < 0.15) emit(it.x + rr(-6, 6), it.y + rr(-6, 6), 1, { col: ['#fff', '#c07bff', '#6ee7f2'], sp0: 2, sp1: 8, grav: -10, l0: 0.4, l1: 0.8 });
      } else if (it.kind === 'shard') {
        const s = getSprite('shard');""")
    # --- HUD: Star Gems and a hint for the bag ---
    s = rep(s, "    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23 + hdy, { size: 7 });", "    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23 + hdy, { size: 7 });\n    drawRareIc(78, 22 + hdy, 0.8); txt('x' + save.rare, 84, 23 + hdy, { size: 7, col: '#d8b8ff' }); txt(sv('B: bag/shop', 'B: túi đồ/shop'), 104, 23 + hdy, { size: 5, col: '#8892aa' });")
    # --- in-game shop ---
    s = rep(s, "    if (act.backP || act.pauseP) { Snd.play('select'); toScene(shopFrom); }\n  }", "    if (act.backP || act.pauseP) { Snd.play('select'); if (shopFrom === 'play') shopBack(); else toScene(shopFrom); }\n  }")
    s = rep(s, "  function shopSay(s, bad) {", """  // the bag and shop can be opened in the middle of a level (B / I); the level waits (in co-op the world keeps going)
  let shopHeldQ = null;
  function openShopInGame(tab) {
    shopFrom = 'play'; shopHeldQ = Q; shopCard = null; shopIdx = 0; scene = 'shop'; sceneT = 0; clearPressed();
    if (tab) { const i = SH_TABS.findIndex(t => t[0] === tab); if (i >= 0) shopTab = i; }
    if (coop && coop.role === 'client') NET.send({ t: 'i' });
  }
  function shopBack() {
    Q = shopHeldQ || Q; shopHeldQ = null; scene = 'play'; clearPressed();
    if (Q && Q.P) { Q.P.sw = null; if (coop && Q.P.hero) { Q.P.mhp = Math.max(2, baseHP() + HERO[Q.P.hero].hp); Q.P.hp = Math.min(Q.P.hp, Q.P.mhp); } }
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
  function shopSay(s, bad) {""")
    s = rep(s, "['bag', { en: 'Inventory', vi: 'Kho đồ' }]", "['trade', { en: 'Star Gems', vi: 'Đổi Ngọc' }], ['bag', { en: 'Inventory', vi: 'Kho đồ' }]")
    s = rep(s, "    if (t === 'topup') return TOPUP_PACKS;", "    if (t === 'topup') return TOPUP_PACKS;\n    if (t === 'trade') return TRADES;")
    s = rep(s, "    if (t === 'topup') { if (act.upP) mv(-1); if (act.downP) mv(1); }", "    if (t === 'topup' || t === 'trade') { if (act.upP) mv(-1); if (act.downP) mv(1); }")
    s = rep(s, "      if (t === 'topup') topUp(list[shopIdx]);", "      if (t === 'topup') topUp(list[shopIdx]);\n      else if (t === 'trade') { if (list[shopIdx]) doTrade(list[shopIdx]); }")
    s = rep(s, "    const t = SH_TABS[shopTab][0], list = shopItems();\n    if (t === 'topup') {", """    const t = SH_TABS[shopTab][0], list = shopItems();
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
    } else if (t === 'topup') {""")
    # --- cosmetics on Ember ---
    s = rep(s, "    const hh = P.hero && HERO[P.hero], av = hh || armorVis(save.inv.armor), swp = av ? av.sw : {};",
               "    const hh = P.hero && HERO[P.hero]; let av = hh || armorVis(save.inv.armor);\n    if (!hh && !coop && (save.cos.aura || save.cos.wings)) av = Object.assign({ sw: {} }, av || {}, save.cos.aura ? { aura: '#ffd34e' } : {}, save.cos.wings && !(av && av.wings) ? { wings: 'dragon' } : {});\n    const swp = av ? av.sw : {};")
    # --- trader NPC ---
    s = rep(s, "    angel: { spr: 'npc_angel', name: { en: 'Seraph', vi: 'Thiên thần Seraph' }, bless: true }\n  };",
               "    angel: { spr: 'npc_angel', name: { en: 'Seraph', vi: 'Thiên thần Seraph' }, bless: true },\n    trader: { spr: 'npc_trader', name: { en: 'Mira the Gem Trader', vi: 'Mira - Thương Nhân Ngọc' }, trade: true, generic: [{ en: 'Oh! A lantern-bearer! I trade in Star Gems - four of them hide in every land, usually somewhere high.', vi: 'Ô! Người mang đèn đây rồi! Tôi buôn Ngọc Sao - mỗi vùng đất giấu bốn viên, thường ở chỗ cao.' }, { en: 'Bring me gems and I will give you treasures you cannot buy anywhere else. Even secret heroes!', vi: 'Mang ngọc tới đây, tôi sẽ đổi cho bạn những báu vật không đâu bán. Cả hero bí mật nữa!' }] }\n  };")
    s = rep(s, "    if (n.shop) { Q.state = 'shop';", "    if (n.trade) { Q.state = 'play'; openShopInGame('trade'); return; }\n    if (n.shop) { Q.state = 'shop';")
    # --- secret heroes are locked until traded for ---
    s = rep(s, "      if (pressed.Enter || pressed.KeyJ || pressed.Space) {\n        save.hero = HEROES[coopUI.hs].id;",
               "      if ((pressed.Enter || pressed.KeyJ || pressed.Space) && heroLocked(HEROES[coopUI.hs])) { coopUI.msg = cvs('Locked: trade 10 Star Gems with Mira the trader.', 'Đang khóa: đổi 10 Ngọc Sao ở thương nhân Mira.'); coopUI.msgBad = true; Snd.play('hurt'); }\n      else if (pressed.Enter || pressed.KeyJ || pressed.Space) {\n        save.hero = HEROES[coopUI.hs].id;")
    s = rep(s, "  const myHero = () => (HERO[save.hero] ? save.hero : 'ember');", "  const heroLocked = h => h && h.secret && save.heroUnlock.indexOf(h.id) < 0;\n  const myHero = () => (HERO[save.hero] && !heroLocked(HERO[save.hero]) ? save.hero : 'ember');")
    s = rep(s, "    const C = 10, cw = 36, chh = 34, x0 = (VW - C * cw) / 2, y0 = 44;", "    const C = 10, cw = 36, chh = 28, x0 = (VW - C * cw) / 2, y0 = 40;")
    s = rep(s, "      drawHeroAt(h.id, cx + cw / 2, cy + chh - 5, 1, on ? Math.floor(sceneT * 4) % 2 : 0, 1);", "      if (heroLocked(h)) g.globalAlpha = 0.35;\n      drawHeroAt(h.id, cx + cw / 2, cy + chh - 4, 1, on ? Math.floor(sceneT * 4) % 2 : 0, 1); g.globalAlpha = 1;\n      if (heroLocked(h)) { g.fillStyle = '#c07bff'; g.fillRect(cx + cw - 9, cy + 3, 6, 5); g.fillStyle = '#14121f'; g.fillRect(cx + cw - 7, cy + 5, 2, 2); g.strokeStyle = '#c07bff'; g.lineWidth = 1; g.strokeRect(cx + cw - 8.5, cy + 0.5, 5, 4); }")
    s = rep(s, "    const h = HEROES[coopUI.hs], cl = HERO_CLS[h.cls], y = y0 + 3 * chh + 4;", "    const h = HEROES[coopUI.hs], cl = HERO_CLS[h.cls], y = y0 + Math.ceil(HEROES.length / C) * chh + 2;")
    s = rep(s, "    drawHeroAt(h.id, 40, y + 52, 1, Math.floor(sceneT * 3) % 2, 2);", "    drawHeroAt(h.id, 40, y + 46, 1, Math.floor(sceneT * 3) % 2, 1.8);\n    if (heroLocked(h)) txt(cvs('SECRET - trade 10 Star Gems', 'BÍ MẬT - đổi 10 Ngọc Sao'), VW - 18, y + 12, { al: 'right', size: 6, col: '#c07bff', bold: true });")
    # crown hat
    s = rep(s, "      case 'fox':", "      case 'crown': R(-5, 0, 10, 2); R(-5, -3, 2, 3); R(-1, -4, 2, 4); R(3, -3, 2, 3); R(-1, -1, 2, 1, '#e0453a'); break;\n      case 'fox':")
    # --- co-op: share gold, give rare finds to the guest who picked them, guests' inventories ---
    s = rep(s, "    coop.ev.length = 0;\n    return s;", "    coop.ev.length = 0;\n    if (coop.gold) { s.gold = coop.gold; coop.gold = 0; }\n    return s;")
    s = rep(s, "    coop.since = 0;\n  }", "    if (s.gold) { save.coins += s.gold; writeSave(); }\n    coop.since = 0;\n  }")
    s = rep(s, "  function coopRespawn() {", """  function coopGive(p, msg) { for (const [id, pr] of coop.peers) if (pr.pl === p) NET.send(msg, id); }
  function coopRespawn() {""")
    s = rep(s, "      else if (d.t === 'hero' && p) {", """      else if (d.t === 'inv' && p && p.pl && d.inv) {
        const w = (Array.isArray(d.inv.w) ? d.inv.w : []).slice(0, 2).map(i => (i && ITEM[i]) ? i : null); if (!w.some(Boolean)) w[0] = 'iron';
        p.pl.bag = { w, armor: ITEM[d.inv.armor] ? d.inv.armor : null, pet: null, own: w.filter(Boolean) }; p.pl.sw = null;
      }
      else if (d.t === 'hero' && p) {""")
    s = rep(s, "      else if (d.t === 's') { if (scene === 'play' && Q) coopApply(d); }", "      else if (d.t === 's') { if ((scene === 'play' || scene === 'shop') && Q) coopApply(d); }\n      else if (d.t === 'rare') { save.rare++; writeSave(); if (Q) { Q.msg = cvs('Star Gem! You have ', 'Ngọc Sao! Bạn có ') + save.rare + cvs('.', ' viên.'); Q.msgT = 3; } }")
    # host keeps the world running while it shops in co-op; guests keep receiving it
    s = rep(s, "        else if (scene === 'coop') updateCoop(sub);", """        else if (scene === 'coop') updateCoop(sub);
        if (scene === 'shop' && coop && coop.role === 'host' && Q) { const keep = Object.assign({}, act); for (const k in act) act[k] = false; try { updatePlay(sub); } finally { Object.assign(act, keep); } }""")
    s = rep(s, "      if (coop && coop.role === 'host' && scene === 'play') coopHostNet(dt);", "      if (coop && coop.role === 'host' && (scene === 'play' || scene === 'shop') && Q) coopHostNet(dt);")
    return s
edit('src/game.js', game)
print('ok')
