import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- the Heroes tab ----------
rep("const SH_TABS = [['sword', { en: 'Swords', vi: 'Kiếm' }],", "const SH_TABS = [['hero', { en: 'Heroes', vi: 'Nhân vật' }], ['sword', { en: 'Swords', vi: 'Kiếm' }],")
rep("return shopRank > 0 && t0 !== 'topup' && t0 !== 'trade' ? l0", "return shopRank > 0 && t0 !== 'topup' && t0 !== 'trade' && t0 !== 'hero' ? l0")
rep("    if (t === 'topup') return TOPUP_PACKS;\n    if (t === 'trade') return TRADES;", "    if (t === 'topup') return TOPUP_PACKS;\n    if (t === 'trade') return TRADES;\n    if (t === 'hero') return HEROES;")
rep("""      else if (t === 'trade') { if (list[shopIdx]) doTrade(list[shopIdx]); }
      else if (list[shopIdx]) { shopCard""", """      else if (t === 'trade') { if (list[shopIdx]) doTrade(list[shopIdx]); }
      else if (t === 'hero') { if (list[shopIdx]) pickHero(list[shopIdx]); }
      else if (list[shopIdx]) { shopCard""")
rep("    for (let i = 0; i <= RANKS.length; i++) if (near(gx, gy, 12 + i * 31 + 14, 25, 15, 4))", "    if (t !== 'hero') for (let i = 0; i <= RANKS.length; i++) if (near(gx, gy, 12 + i * 31 + 14, 25, 15, 4))")
rep("  function drawShop() {", """  // pick the hero you play as (single player and co-op); secret heroes are unlocked with Star Gems
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
  function drawShop() {""")
rep("""    } else if (t === 'topup') {
      txt(sv('Top-up gems', 'Nạp gem')""", """    } else if (t === 'hero') {
      drawHeroTab(list);
    } else if (t === 'topup') {
      txt(sv('Top-up gems', 'Nạp gem')""")

# ---------- play as the chosen hero in single player too ----------
rep("""    initGear();
    initEntities();""", """    initGear();
    if (!coop && myHero() !== 'ember') setHero(P, myHero());
    initEntities();""")
rep("  const maxHP = () => (coop && Q && Q.P && Q.P.mhp) || baseHP();", "  const maxHP = () => (Q && Q.P && Q.P.hero && Q.P.mhp) || baseHP();")
rep("if (Q && Q.P) { Q.P.sw = null; if (coop && Q.P.hero) {", "if (Q && Q.P) { Q.P.sw = null; if (Q.P.hero) {")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
