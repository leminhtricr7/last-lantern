# Fan heroes fight with their own moves: no sword, gun or armor (a pet is fine). Each basic attack has its own hit box and effect;
# hits charge the passive (Darkin bar, skills, pans...) and R stays the hero's own skill.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# gear is ignored for fan heroes (the pet stays)
rep("""  const eqIt = s => ITEM[save.inv.w[s]] || null;
  const armorIt = () => ITEM[save.inv.armor] || null;""", """  const isFan = P => !!(P && P.hero && typeof HERO !== 'undefined' && HERO[P.hero] && HERO[P.hero].custom === 'fan');
  const eqIt = s => (Q && isFan(Q.P)) ? null : (ITEM[save.inv.w[s]] || null);
  const armorIt = () => (Q && isFan(Q.P)) ? null : (ITEM[save.inv.armor] || null);""")
rep("""  function heldSword() {
    const P = Q && Q.P;""", """  function heldSword() {
    const P = Q && Q.P; if (isFan(P)) return null;""")
rep("""arV = armorVis(save.inv.armor);""", """arV = isFan(P) ? null : armorVis(save.inv.armor);""")
rep("""    if (hg) drawHeldGun(hg, ax, ab, P.face); else""", """    if (isFan(P)) { } else if (hg) drawHeldGun(hg, ax, ab, P.face); else""")
rep("""  function slotId(i) { const v = save.inv;""", """  function slotId(i) { const v = save.inv; if (i < 3 && Q && isFan(Q.P)) return null;""")
rep("""    if (!it) { if (isMe(P)) { Q.msg = sv('Nothing equipped in slot ' + (i + 1) + ' (' + SK_SLOT[i][0] + ')', 'Chưa trang bị gì ở ô ' + (i + 1) + ' (' + SK_SLOT[i][1] + ')');""", """    if (!it) { if (isMe(P)) { Q.msg = isFan(P) && i < 3 ? sv('This hero fights with their own moves: no weapon or armor (R is the special).', 'Nhân vật này đánh bằng chiêu riêng, không dùng vũ khí/giáp (R là skill riêng).') : sv('Nothing equipped in slot ' + (i + 1) + ' (' + SK_SLOT[i][0] + ')', 'Chưa trang bị gì ở ô ' + (i + 1) + ' (' + SK_SLOT[i][1] + ')');""")
# J and H both use the hero's own attack
rep("""    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(0); if (act.atk2P) useSlot(1); }""", """    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(0); if (act.atk2P && !(isFan(P) && heroAttack(P))) useSlot(1); }""")
# the basic attacks
rep("""  function heroAttack(P) {
    const mk = mechOf(P), it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;""", """  // each fan hero's basic attack: reach, height, speed, colour and the effect that is drawn
  const FAN_ATK = {
    kayn: { r: 34, h: 22, cd: 0.38, col: '#a15be0', fx: 'scythe', d: 1 }, rhaast: { r: 42, h: 28, cd: 0.42, col: '#ff3a3a', fx: 'scythe', d: 2 },
    tom: { r: 24, h: 16, cd: 0.32, col: '#ffcf8a', fx: 'claw', d: 0 }, jerry: { r: 18, h: 12, cd: 0.2, col: '#f0a050', fx: 'kick', d: -1 },
    sonic: { r: 30, h: 14, cd: 0.3, col: '#4a8bf0', fx: 'spin', d: 0, lunge: 22 }, jotaro: { r: 26, h: 16, cd: 0.3, col: '#8a7aff', fx: 'punch', d: 1 },
    dio: { r: 24, h: 16, cd: 0.3, col: '#ffd34e', fx: 'chop', d: 0 }
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
    else if (w.fx === 'punch') { const fx = x + f * (8 + 14 * Math.min(1, k * 2.5)); g.fillStyle = hexA(w.col, a); g.fillRect(Math.round(fx) - 3, cy - 3, 6, 6); g.fillStyle = hexA('#ffffff', a); g.fillRect(Math.round(fx + f * 4) - 4, cy, 9, 1); g.fillRect(Math.round(fx + f * 4), cy - 4, 1, 9); }
    else { g.strokeStyle = hexA(w.col, a); g.lineWidth = 2; g.beginPath(); g.moveTo(x + f * 6, cy - 10); g.lineTo(x + f * (6 + 18 * Math.min(1, k * 2)), cy + 6); g.stroke(); }
    g.restore(); g.lineWidth = 1;
  }
  function heroAttack(P) {
    const mk = mechOf(P), it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;
    if (isFan(P) && P.hero !== 'luffy' && P.hero !== 'kirby') {
      if (P.atkCd > 0) return true; const key = P.hero === 'kayn' && P.form === 'rhaast' ? 'rhaast' : P.hero, A = FAN_ATK[key] || FAN_ATK.tom; P.atkCd = A.cd;
      fanSwing(P, FAN_ATK[key] ? key : 'tom');
      if (mk === 'stand') { P.standT = 0.32; P.standHit = new Set(); P.standD = baseDmg(); }
      if (mk === 'world') shootG({ x: P.x + 4 + f * 6, y: P.y + 6, vx: f * 360, vy: 0, life: 0.7, dmg: baseDmg() + 1, shape: 'bolt', col: '#e8e8f0', trail: '#ffd34e', sz: 2, f });
      return true;
    }""")
# Kirby with nothing copied: a short puff of air
rep("""      const c = P.copy; if (!c) return false;""", """      const c = P.copy; if (!c) { if (!isFan(P)) return false; if (P.atkCd > 0) return true; P.atkCd = 0.3; shootG({ x, y, vx: f * 230, vy: 0, life: 0.28, dmg: d, shape: 'wind', col: '#ffd0e4', sz: 6, f, skill: false }); P.fsw = { t: 0.22, fx: 'spin', col: '#ff9fd0', r: 14, f }; Snd.play('whoosh'); return true; }""")
# timers and drawing
rep("""  function heroMech(P, dt, dir) {
    const id = P.hero, mk = mechOf(P); if (!id) return;""", """  function heroMech(P, dt, dir) {
    const id = P.hero, mk = mechOf(P); if (!id) return;
    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;""")
rep("""  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, mk = mechOf(P), cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);""", """  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, mk = mechOf(P), cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    drawFanSwing(P, x, bot);""")
rep("form: p.form, ess: p.ess, dk: p.dk,", "form: p.form, ess: p.ess, dk: p.dk, fsw: p.fsw && p.fsw.t > 0 ? p.fsw : null,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
