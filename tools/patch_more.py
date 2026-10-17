import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, 'MISSING: ' + a[:80]
    return s.replace(a, b, 1)

def items(s):
    s = rep(s, "const shopList = type => ITEMS.filter(i => i.type === type && !i.starter && !i.story);", "const shopList = type => ITEMS.filter(i => i.type === type && !i.starter && !i.story).sort((a, b) => a.tier - b.tier);")
    s += io.open('tools/items_more.txt', encoding='utf-8').read()
    return s
edit('src/items.js', items)

def game(s):
    # poison support for generic projectiles
    s = rep(s, "      if (p.slow) e.slowT = Math.max(e.slowT || 0, p.slow);\n      if (!p.quiet) Snd.play('hit');", "      if (p.slow) e.slowT = Math.max(e.slowT || 0, p.slow);\n      if (p.poison) { e.poisonT = 4; e.poisonN = Math.min(4, (e.poisonN || 0) + 1); }\n      if (!p.quiet) Snd.play('hit');")
    # new special weapons
    s = rep(s, "    else if (id === 'dragonhorn') {", """    else if (id === 'slingshot') { Snd.play('throw'); const a = v(290); mk({ vx: a[0], vy: a[1], life: 0.9, dmg: wd(1) + 1, shape: 'bolt', col: '#cfd6e6', sz: 2 }); }
    else if (id === 'knives') { Snd.play('whoosh'); for (const an of [-0.18, 0, 0.18]) mk({ vx: f * Math.cos(an) * 300, vy: Math.sin(an) * 300, life: 0.8, dmg: wd(2), shape: 'arrow', col: '#e8e8f0', sz: 2 }); }
    else if (id === 'dart') { Snd.play('throw'); const a = v(320); mk({ vx: a[0], vy: a[1], life: 1, dmg: wd(2), poison: 1, shape: 'arrow', col: '#7ed957', sz: 2 }); }
    else if (id === 'cannon') { Snd.play('explode'); mk({ vx: f * 210, vy: -90, g: 300, life: 1.6, dmg: wd(6), expl: 40, shape: 'meteor', col: '#8d9bbd', sz: 4, trail: '#cfd6e6' }); P.vx -= f * 40; Q.shake = Math.max(Q.shake, 0.3); }
    else if (id === 'chainlight') { const t = nearestFoe(P.x + 4, P.y + 6, 230); Snd.play('thunder'); G.flash = 0.12; if (t) { zap(P.x + 4, P.y + 4, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, wd(5), true); chainZap(t, wd(4), 4, 90); } else { P.wcd[s] = 0.8; zap(P.x + 4, P.y + 4, P.x + 4 + f * 80, P.y + 4); } }
    else if (id === 'laser') { Snd.play('flame'); for (let k = 0; k < 9; k++) later(k * 0.09, () => shootG({ x: Q.P.x + 4 + f * 8, y: Q.P.y + 6, f, vx: f * 420, vy: 0, life: 0.55, dmg: wd(3), thru: true, pierceN: 99, shape: 'beam', col: '#ff3a5a', sz: 3, quiet: true })); }
    else if (id === 'windstaff') { Snd.play('whoosh'); G.holes.push({ x: P.x + 4 + f * 70, y: P.y + 4, life: 3.5, r: 80, tick: 0.2, wind: true }); }
    else if (id === 'iceage') { Snd.play('zap'); G.flash = 0.2; addRing(P.x + 4, P.y + 7, '#bff3ff', 200, 0.8); for (const e of foes()) { e.slowT = Math.max(e.slowT || 0, 5); dmgFoe(e, wd(3), true, true); emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#fff', '#8fe0f8'], sp0: 20, sp1: 80 }); } }
    else if (id === 'solarflare') { Snd.play('explode'); G.flash = 0.4; nova(P.x + 4, P.y + 7, 120, wd(8)); for (const e of foes()) if (Math.hypot(e.x - P.x, e.y - P.y) < 130) e.burnT = Math.max(e.burnT || 0, 4); }
    else if (id === 'starfall') { Snd.play('thunder'); G.flash = 0.2; for (let i = 0; i < 14; i++) later(i * 0.12, () => { const mx = Q.cam.x + rr(20, VW - 20); shootG({ x: mx - 20, y: Math.max(8, Q.cam.y - 6), f, vx: 30, vy: 260, life: 2.4, dmg: wd(4), expl: 28, burn: 2, shape: 'meteor', trail: '#ffe44e', sz: 4, col: '#ffe44e', arm: 0.3 }); }); }
    else if (id === 'dragonhorn') {""")
    # holes: wind colours
    s = rep(s, "      g.globalAlpha = 0.4 * a; disc(g, x, y, Math.round(h.r * 0.35), '#2a1a4a'); g.globalAlpha = 0.85 * a; disc(g, x, y, Math.round(h.r * 0.18), '#14101e'); disc(g, x, y, 3, '#000'); g.globalAlpha = 1;\n      for (let i = 0; i < 14; i++) { const an = Q.t * 6 + i * 0.45, rd = 8 + i * (h.r / 18); g.fillStyle = i % 2 ? '#a15be0' : '#d58bff';",
            "      g.globalAlpha = 0.4 * a; disc(g, x, y, Math.round(h.r * 0.35), h.wind ? '#1a5a5a' : '#2a1a4a'); g.globalAlpha = 0.85 * a; disc(g, x, y, Math.round(h.r * 0.18), h.wind ? '#0e3a3a' : '#14101e'); disc(g, x, y, 3, h.wind ? '#052a2a' : '#000'); g.globalAlpha = 1;\n      for (let i = 0; i < 14; i++) { const an = Q.t * 6 + i * 0.45, rd = 8 + i * (h.r / 18); g.fillStyle = h.wind ? (i % 2 ? '#6ee7b0' : '#e8fff4') : (i % 2 ? '#a15be0' : '#d58bff');")
    # pet roles
    s = rep(s, "    else if (role === 'block') {", """    else if (role === 'ice') { const t = nearestFoe(px, py, 170); if (t) { pt.cd = 2.2; Snd.play('zap'); shootG({ x: px, y: py - 4, vx: (t.x + t.w / 2 < px ? -1 : 1) * 130, vy: -10, home: true, life: 1.6, dmg: 1 + Math.floor(baseDmg() / 4), slow: 3, shape: 'ice', col: '#8fe0f8', trail: '#bff3ff', sz: 3, quiet: true }); } else pt.cd = 0.3; }
    else if (role === 'thunder') { const t = nearestFoe(px, py, 210); if (t) { pt.cd = 5; Snd.play('thunder'); zap(px, py - 6, t.x + t.w / 2, t.y + t.h / 2); dmgFoe(t, 4 + Math.floor(baseDmg() / 2), true); chainZap(t, 3, 2, 60); } else pt.cd = 0.4; }
    else if (role === 'block') {""")
    s = rep(s, "const red = Math.min(0.6, aSt('red') + (petRole() === 'tank' ? 0.15 : 0)), eff = n * (1 - red);", "const red = Math.min(0.6, aSt('red') + (petRole() === 'tank' ? (pSt('red') || 0.15) : 0)), eff = n * (1 - red);")
    s = rep(s, "if (!G.rvSw && eqHas('revive')) {", "if (!G.rvSw && (eqHas('revive') || aSt('revive'))) {")
    # shop is FREE while the game is being tested
    s = rep(s, "  const TOPUP_TEST = true;", "  const TOPUP_TEST = true;\n  const SHOP_FREE = true; // TEST BUILD: everything in the shop is free. Set to false before selling the game.")
    s = rep(s, "if (!owned(it.id)) { o.push({ k: 'gold' }); o.push({ k: 'gems' }); }", "if (!owned(it.id)) { o.push({ k: 'gold' }); if (!SHOP_FREE) o.push({ k: 'gems' }); }")
    s = rep(s, "      case 'gold': return sv('Buy ' + it.gold + ' gold', 'Mua ' + it.gold + ' vàng');", "      case 'gold': return SHOP_FREE ? sv('Get it FREE!', 'Lấy MIỄN PHÍ!') : sv('Buy ' + it.gold + ' gold', 'Mua ' + it.gold + ' vàng');")
    s = rep(s, "      if (o.k === 'gold') { if (save.coins < it.gold) {", "      if (o.k === 'gold') { if (!SHOP_FREE && save.coins < it.gold) {")
    s = rep(s, "Không đủ vàng! Hãy nhặt thêm xu trong màn chơi.'), true); return; } save.coins -= it.gold; }", "Không đủ vàng! Hãy nhặt thêm xu trong màn chơi.'), true); return; } if (!SHOP_FREE) save.coins -= it.gold; }")
    s = rep(s, "        else { drawCoinIc(253, 65); txt(String(it.gold), 259, 65, { size: 7, col: '#ffd34e' }); drawGemIc(300, 65); txt(String(it.gems), 306, 65, { size: 7, col: '#9ff0ff' }); }",
            "        else if (SHOP_FREE) txt(sv('FREE (test build)', 'MIỄN PHÍ (bản test)'), 250, 65, { size: 7, col: '#a4e86b', bold: true });\n        else { drawCoinIc(253, 65); txt(String(it.gold), 259, 65, { size: 7, col: '#ffd34e' }); drawGemIc(300, 65); txt(String(it.gems), 306, 65, { size: 7, col: '#9ff0ff' }); }")
    s = rep(s, "    else { drawCoinIc(99, 55); txt(it.gold + sv(' gold', ' vàng'), 106, 55,", "    else if (SHOP_FREE) txt(sv('FREE (test build)', 'MIỄN PHÍ (bản test)'), 96, 55, { size: 7, col: '#a4e86b', bold: true });\n    else { drawCoinIc(99, 55); txt(it.gold + sv(' gold', ' vàng'), 106, 55,")
    s = rep(s, "      const cx = VW / 2 + (i - (o.length - 1) / 2) * 84, on = i === shopCard.opt, bad = (op.k === 'gold' && save.coins < it.gold) || (op.k === 'gems' && save.inv.gems < it.gems);", "      const cx = VW / 2 + (i - (o.length - 1) / 2) * 84, on = i === shopCard.opt, bad = !SHOP_FREE && ((op.k === 'gold' && save.coins < it.gold) || (op.k === 'gems' && save.inv.gems < it.gems));")
    return s
edit('src/game.js', game)
print('ok')
