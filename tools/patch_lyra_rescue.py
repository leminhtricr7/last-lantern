import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

def items(s):
    return s + """
// ---- Lyra's rescue gifts (story items, never sold): Leek Armor and the flying Leek mount ----
ARMOR_LOOK.leekarmor = { sw: { b: '#46b84e', A: '#2f8a3a', a: '#e8f5d0', r: '#ffd34e', q: '#14361c' }, cape: '#8af08a', halo: '#a4ffc0' };
addItem({ id: 'leekarmor', type: 'armor', tier: 12, gold: 0, gems: 0, story: true, name: T2("Lyra's Leek Armor", 'Áo Giáp Hành Lá của Lyra'), desc: T2('+5 hearts, 22% reduction. When you are hit, a green shockwave STUNS every enemy near you for 3s (bosses 1.2s), once every 6s.', '+5 tim, giảm 22% sát thương. Khi bị đánh, sóng xanh làm CHOÁNG mọi kẻ địch gần bạn 3 giây (boss 1,2 giây), 6 giây một lần.'), st: { hp: 5, red: 0.22, stunHit: 3 }, look: ARMOR_LOOK.leekarmor });
PET_PAINT.leekpet = P => {
  P.ell(9, 10, 8, 2, '#2f8a3a'); P.ell(10, 9, 7, 2, '#46b84e'); P.rect(4, 8, 11, 1, '#8af08a');
  P.ell(3, 9, 3, 3, '#f6f3e9'); P.rect(0, 11, 1, 3, '#d8c8a0'); P.rect(2, 12, 1, 2, '#d8c8a0');
  P.tri(13, 8, 15, 2, 17, 8, '#46b84e'); P.tri(14, 8, 18, 4, 18, 9, '#8af08a'); P.tri(12, 8, 9, 3, 14, 8, '#2f8a3a');
  P.px(15, 9, 'k'); P.px(16, 10, '#ff9ab8'); P.px(5, 7, '#ffd34e');
};
addItem({ id: 'leekpet', type: 'pet', tier: 12, gold: 0, gems: 0, story: true, name: T2('Flying Leek', 'Cây Hành Bay'), desc: T2('A leek you can RIDE: in the air you stand on it, hold Jump to glide, and riding slowly heals you (1 heart every 6s).', 'Cây hành bạn có thể CƯỠI: khi ở trên không bạn đứng trên nó, giữ Nhảy để lướt, và cưỡi sẽ từ từ hồi máu (1 tim mỗi 6 giây).'), st: { role: 'ride' } });
"""
edit('src/items.js', items)

def levels(s):
    a = s.index("  function pRescue() {"); b = s.index("  function pTrial()")
    new = """  function pRescue() { // Lyra hangs in a cage high above; Mr Shorty Phong's giant beetle guards the way up
    const n = 40, x0 = pzFlat(n), grp = L.id++, X;
    const lx = x0 + n - 26;
    for (let i = 1; i <= k; i++) { const w = i === k ? 6 : 4; for (let j = 0; j < w; j++) set(lx + (i - 1) * 5 + j, gy - 3 * i, '='); }
    spawn('cage', lx + (k - 1) * 5 + 3, gy - 3 * k, { grp });
    spawn('beetle', x0 + n - 12, gy, { grp, v: 'phong' });
    spawn('slime', x0 + 12, gy, { grp }); spawn('slime', x0 + 17, gy, { grp });
    spawn('heart', x0 + 6, gy - 2);
    coinsLine(x0 + 8, gy - 2, 4);
    for (let i = 0; i < k; i++) spawn('coin', lx + i * 5 + 1, gy - 3 * (i + 1) - 1);
  }
"""
    return s[:a] + new + s[b:]
edit('src/levels.js', levels)

def game(s):
    s = rep(s, "    else if (v === 'elite') { sc = 1.4;", "    else if (v === 'phong') { sc = 2.4; hpv = 14; spv = 0.7; dmg = 2; }\n    else if (v === 'elite') { sc = 1.4;")
    s = rep(s, "  if (save.leek && save.inv.own.indexOf('leek') < 0) { save.inv.own.push('leek'); save.inv.w[0] = 'leek'; }",
      "  if (save.leek && save.inv.own.indexOf('leek') < 0) { save.inv.own.push('leek'); save.inv.w[0] = 'leek'; }\n  if (save.leek) for (const id of ['leekarmor', 'leekpet']) if (save.inv.own.indexOf(id) < 0) save.inv.own.push(id);")
    s = rep(s, "save.leek = true; grantLeek(); writeSave();", "save.leek = true; grantLeek(); grantLyraGifts(); writeSave();")
    s = rep(s, "  function grantLeek() {", """  function grantLyraGifts() {
    const iv = save.inv; for (const id of ['leekarmor', 'leekpet']) if (iv.own.indexOf(id) < 0) iv.own.push(id);
    if (!iv.armor) iv.armor = 'leekarmor'; if (!iv.pet) iv.pet = 'leekpet';
  }
  function grantLeek() {""")
    s = rep(s, "  const RESCUE = [\n", "  const RESCUE = [\n    { en: 'Mr Shorty Phong\\'s great beetle is finished, and you climbed all the way up here! You are very brave.', vi: 'Con bọ khổng lồ của Mr Shorty Phong đã gục, và bạn còn leo tận lên đây! Bạn dũng cảm quá.' },\n")
    s = rep(s, "    { en: 'I will not forget this, Ember.", "    { en: 'Take my Leek Armor too, it will stun anyone who dares to hit you. And my Flying Leek will carry you through the sky and heal you a little. Ride it!', vi: 'Nhận luôn Giáp Hành Lá của mình nữa, nó làm choáng kẻ nào dám đánh bạn. Và Cây Hành Bay sẽ chở bạn bay trên trời, còn hồi máu cho bạn chút ít. Cưỡi nó nhé!' },\n    { en: 'I will not forget this, Ember.")
    s = rep(s, "      if (Q.stateT > 0.8) txt(T('cont2'), VW / 2, 200,", """      { const ps = petSprite('leekpet'); drawSpr(g, ps, VW / 2 + 70, 196, false, false, 2, 2, a);
        txt(sv('+ Leek Armor (stun 3s)  + Flying Leek (ride & heal)', '+ Giáp Hành Lá (choáng 3s)  + Cây Hành Bay (cưỡi, hồi máu)'), VW / 2 - 20, 193, { al: 'center', size: 6, col: '#ffd34e', alpha: a }); }
      if (Q.stateT > 0.8) txt(T('cont2'), VW / 2, 212,""")
    s = rep(s, "    if (aSt('nova')) nova(P.x + 4, P.y + 7, 50, 3);", """    if (aSt('stunHit') && !(Q.G.stunArm > 0)) {
      Q.G.stunArm = 6; Snd.play('zap'); addRing(P.x + 4, P.y + 7, '#8af08a', 60, 0.5);
      for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - (P.x + 4), e.y + e.h / 2 - (P.y + 7)) < 64) { e.stunT = Math.max(e.stunT || 0, e.isBoss ? aSt('stunHit') * 0.4 : aSt('stunHit')); emit(e.x + e.w / 2, e.y, 8, { col: ['#a4ffc0', '#ffd34e', '#fff'], sp0: 20, sp1: 60 }); }
    }
    if (aSt('nova')) nova(P.x + 4, P.y + 7, 50, 3);""")
    s = rep(s, "    // regeneration (armor / fairy / unicorn)", "    if (G.stunArm > 0) G.stunArm -= dt;\n    // regeneration (armor / fairy / unicorn)")
    s = rep(s, "    const fly = FLY_PET[it.id], tx = P.x + 4 - P.face * 15, ty = fly ? P.y - 2 + Math.sin(pt.t * 4) * 3 : P.y + P.h, k = 1 - Math.exp(-7 * dt);",
      "    const rideOn = it.st.role === 'ride' && !P.onGround && !wetP(P) && P.hp > 0, fly = FLY_PET[it.id], tx = rideOn ? P.x + 4 : P.x + 4 - P.face * 15, ty = rideOn ? P.y + P.h + 4 : (fly ? P.y - 2 + Math.sin(pt.t * 4) * 3 : P.y + P.h), k = 1 - Math.exp(-(rideOn ? 24 : 7) * dt);\n    if (rideOn) {\n      if (act.jump && P.vy > 35) P.vy = 35;\n      G.rideT = (G.rideT || 0) + dt; if (G.rideT >= 6 && P.hp < maxHP()) { G.rideT = 0; P.hp++; Snd.play('heart'); emit(P.x + 4, P.y + 4, 10, { col: ['#a4ffc0', '#fff', '#ff7fb0'], sp0: 10, sp1: 50 }); }\n      if (Math.random() < 0.4) emit(pt.x - pt.f * 6, pt.y, 1, { col: ['#a4ffc0', '#fff'], sp0: 4, sp1: 14, grav: 20, l0: 0.3, l1: 0.6 });\n    }")
    s = rep(s, "const FLY_PET = { wyrmling: 1,", "const FLY_PET = { leekpet: 1, wyrmling: 1,")
    s = rep(s, "    for (const e of Q.ents) drawEnemy(e, camX, camY);", "    for (const e of Q.ents) { drawEnemy(e, camX, camY); if (e.v === 'phong' && !e.dead) drawPhongHat(e, camX, camY); }")
    s = rep(s, "  function drawEnemy(e, camX, camY) {", """  function drawPhongHat(e, camX, camY) {
    const x = Math.round(e.x + e.w / 2 - camX), y = Math.round(e.y - camY) + 2;
    g.fillStyle = '#14121f'; g.fillRect(x - 6, y - 12, 12, 11); g.fillRect(x - 10, y - 2, 20, 3);
    g.fillStyle = '#e0453a'; g.fillRect(x - 6, y - 5, 12, 2); g.fillStyle = '#4a4a62'; g.fillRect(x - 5, y - 11, 2, 7);
    txt('Mr Shorty Phong', x, y - 18, { al: 'center', size: 5, col: '#ffd34e', ol: '#14121f' });
  }
  function drawEnemy(e, camX, camY) {""")
    s = rep(s, "        g.globalAlpha = 0.5; drawSpr(g, npcSpr('cage'), x, y + 1, false); g.globalAlpha = 1;", "        g.globalAlpha = 0.5; drawSpr(g, npcSpr('cage'), x, y + 1, false); g.globalAlpha = 1;\n        g.fillStyle = '#8892aa'; for (let cy = y - 54; cy > y - 130; cy -= 4) g.fillRect(x - 1 + ((cy >> 2) & 1), cy, 2, 3);")
    return s
edit('src/game.js', game)
print('ok')
