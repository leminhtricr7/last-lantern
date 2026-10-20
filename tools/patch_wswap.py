# One attack button on the weapon in hand; T switches between weapon 1 and weapon 2. The J / H boxes in the corner are gone:
# skill badges 1 and 2 show which weapon is in hand, its gun ammo / reload and its cooldown.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# input: H no longer attacks; T (touch: the H button, mouse: middle click, gamepad: LT) switches weapons
rep("""    act.atkH = !!(keys.KeyJ || keys.KeyX || gb.x || mouseHeld); act.atk2H = !!(keys.KeyH || keys.KeyU || gb.lt);
    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');
    act.atk2P = any(pressed, ['KeyH', 'KeyU']) || gpP('lt');""", """    act.atkH = !!(keys.KeyJ || keys.KeyX || gb.x || mouseHeld); act.atk2H = false;
    act.atkP = any(pressed, ['KeyJ', 'KeyX']) || gpP('x');
    act.atk2P = false; act.wswapP = any(pressed, ['KeyT']) || gpP('lt');""")
rep("act.skillP = act.shopP = act.sumP = act.parryP = act.sk1P", "act.skillP = act.shopP = act.sumP = act.parryP = act.wswapP = act.sk1P")
rep("'sumP', 'parryP', 'sk1P'", "'sumP', 'parryP', 'wswapP', 'sk1P'")
rep("{ k: 'KeyH', x: w - s * 2.3, y: h - s * 2.7, r: r * 0.85, l: 'H' }", "{ k: 'KeyT', x: w - s * 2.3, y: h - s * 2.7, r: r * 0.85, l: '⇆' }")
rep("if (e.button === 1) { if (inPlay && Q.state === 'play') { faceMouse(gx); pressed.KeyH = true; } return; }", "if (e.button === 1) { if (inPlay && Q.state === 'play') pressed.KeyT = true; return; }")
rep("Attack J / Click  Throw L / Right-click  Switch Q / Wheel", "Attack J / Click  Weapon T  Throw L / Right-click  Item Q / Wheel")
rep("Đánh J / Nhấp chuột  Ném L / Chuột phải  Đổi đồ Q / Lăn chuột", "Đánh J / Nhấp chuột  Đổi vũ khí T  Ném L / Chuột phải  Đổi đồ Q / Lăn chuột")

# attacking uses the weapon in hand (P.ws); guns keep firing while J is held
rep("""    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(0); if (act.atk2P && !(isFan(P) && heroAttack(P))) useSlot(1); }
    if (P.dash <= 0) for (let sl = 0; sl < 2; sl++) { const gi = eqIt(sl); if (gi && gi.type === 'gun' && (sl ? act.atk2H : act.atkH) && !(sl ? act.atk2P : act.atkP)) useSlot(sl); }""",
"""    if (act.wswapP) swapWeapon(P);
    if (!eqIt(P.ws | 0) && eqIt(P.ws ? 0 : 1)) P.ws = P.ws ? 0 : 1;   // the hand is empty: take the other weapon
    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(P.ws | 0); }
    if (P.dash <= 0) { const sl = P.ws | 0, gi = eqIt(sl); if (gi && gi.type === 'gun' && act.atkH && !act.atkP) useSlot(sl); }""")
rep("""  function useSlot(s) {""", """  // T: weapon 1 <-> weapon 2
  function swapWeapon(P) {
    if (isFan(P)) { if (isMe(P)) { Q.msg = sv('This hero fights with their own moves.', 'Nhân vật này đánh bằng chiêu riêng.'); Q.msgT = 1.5; } return; }
    const n = P.ws ? 0 : 1, it = eqIt(n);
    if (!it) { if (isMe(P)) { Q.msg = sv('Nothing in weapon slot ' + (n + 1) + ' (equip one with B).', 'Ô vũ khí ' + (n + 1) + ' đang trống (bấm B để trang bị).'); Q.msgT = 2; Snd.play('select'); } return; }
    P.ws = n; P.hold = it.type === 'sword' ? null : it.id; if (it.type === 'sword') P.sw = it; P.atk = 0;
    Snd.play('select'); Snd.play('clang'); emit(P.x + 4 + P.face * 6, P.y + 6, 8, { col: [RARITY_COL[it.rar] || '#fff', '#ffffff'], sp0: 10, sp1: 50 });
    if (isMe(P)) pop(P.x + 4, P.y - 18, '[' + (n + 1) + '] ' + LN(it.name), RARITY_COL[it.rar] || '#ffd34e');
  }
  function useSlot(s) {""")
# the corner boxes are gone
rep("""    for (let s = 0; s < 2; s++) {
      const it = eqIt(s), bx = VW - 62 + s * 30, by = VH - 32;""", """    for (let s = 0; s < 0; s++) {   // (the old J / H boxes; weapons now live on skill badges 1 and 2)
      const it = eqIt(s), bx = VW - 62 + s * 30, by = VH - 32;""")
# badges 1 and 2: the weapon in hand is framed in gold with a small arrow; gun ammo / reload and weapon cooldown are shown on it
rep("""      g.fillStyle = col; g.fillRect(bx + 1, by + 21, Math.round(22 * k), 2);
      txt(String(i + 1), bx + 4, by + 5, { size: 6.5, bold: true, col: ready ? '#ffffff' : '#cfd6e6', ol: '#14121f' });""", """      g.fillStyle = col; g.fillRect(bx + 1, by + 21, Math.round(22 * k), 2);
      txt(String(i + 1), bx + 4, by + 5, { size: 6.5, bold: true, col: ready ? '#ffffff' : '#cfd6e6', ol: '#14121f' });
      if (i < 2) {
        const gsx = it.type === 'gun' ? gunState(it, P) : null, cdn = gsx ? (gsx.rel > 0 ? gsx.rel / it.st.reload : 0) : (it.type === 'wpn' ? P.wcd[i] / (P.wmax[i] || 1) : 0);
        if (cdn > 0) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(bx + 1, by + 1 + Math.round(22 * (1 - Math.min(1, cdn))), 22, Math.round(22 * Math.min(1, cdn))); }
        if (gsx) txt(String(gsx.rel > 0 ? sv('RLD', 'NẠP') : gsx.mag), bx + 22, by + 17, { al: 'right', size: gsx.rel > 0 ? 4.5 : 6, col: gsx.rel > 0 ? '#ff7a7a' : (gsx.mag <= 2 ? '#ffb03a' : '#ffffff'), ol: '#14121f' });
        if ((P.ws | 0) === i) { g.fillStyle = '#ffd34e'; g.fillRect(bx - 1, by - 1, 26, 1); g.fillRect(bx - 1, by + 24, 26, 1); g.fillRect(bx - 1, by - 1, 1, 26); g.fillRect(bx + 24, by - 1, 1, 26); g.fillRect(bx + 10, by - 4, 4, 1); g.fillRect(bx + 11, by - 3, 2, 1); }
      }""")
rep("""    drawRBadge(P, x0 + 4 * 26 + 6, y0 - 2);""", """    drawRBadge(P, x0 + 4 * 26 + 6, y0 - 2);
    if (!isFan(P) && eqIt(0) && eqIt(1)) txt(sv('T: swap', 'T: đổi'), x0 + 26, y0 - 6, { al: 'center', size: 5, col: '#ffd34e', ol: '#14121f' });""")
rep("sel: p.sel, chg:", "sel: p.sel, ws: p.ws, chg:")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
