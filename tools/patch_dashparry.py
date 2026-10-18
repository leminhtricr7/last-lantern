import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- input ----------
rep("gb.rt = b(7); gb.lt = b(6);", "gb.rt = b(7); gb.lt = b(6); gb.l3 = b(10);")
rep("    act.sumP = any(pressed, ['KeyT']) || gpP('r3');", "    act.sumP = any(pressed, ['KeyT']) || gpP('r3');\n    act.parryP = any(pressed, ['KeyF']) || gpP('l3');")
rep("act.skillP = act.shopP = act.sumP = false; }", "act.skillP = act.shopP = act.sumP = act.parryP = false; }")
rep("const EDGE = ['jumpP', 'atkP', 'atk2P', 'dashP', 'throwP', 'swapP', 'skillP', 'talkP', 'sumP'];", "const EDGE = ['jumpP', 'atkP', 'atk2P', 'dashP', 'throwP', 'swapP', 'skillP', 'talkP', 'sumP', 'parryP'];")
rep("{ k: 'KeyQ', x: w - s * 3.3, y: h - s * 0.5, r: r * 0.6, l: '⇄' }", "{ k: 'KeyQ', x: w - s * 3.3, y: h - s * 0.5, r: r * 0.6, l: '⇄' }, { k: 'KeyF', x: w - s * 3.5, y: h - s * 2.4, r: r * 0.8, l: '◆' }")
rep("Dash K  Use E', vi:", "Dash K  Parry F  Use E', vi:")
rep("Lướt K  Dùng E' },", "Lướt K  Đỡ đòn F  Dùng E' },")

# ---------- dash: from the first map, one air dash per jump, afterimages ----------
rep("""    if (act.dashP && Q.dashAb && P.dashCd <= 0 && P.dash <= 0) {
      P.dash = 0.17;""", """    if (P.onGround || wetP(P)) P.airDashed = false;
    if (P.trail && P.trail.length) P.trail = P.trail.filter(tr => (tr.t -= dt) > 0);
    if (act.dashP && P.dashCd <= 0 && P.dash <= 0 && !(P.airDashed && !P.onGround)) {
      if (!P.onGround) P.airDashed = true;
      P.dash = 0.17;""")
rep("""      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;""", """      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;
      (P.trail = P.trail || []).push({ x: P.x, y: P.y, f: P.face, t: 0.22 }); if (P.trail.length > 9) P.trail.shift();""")

# ---------- parry: a short guard; an attack inside it is turned back ----------
rep("""    if (P.onGround || wetP(P)) P.airDashed = false;""", """    if (P.onGround || wetP(P)) P.airDashed = false;
    P.parryCd = (P.parryCd || 0) - dt; if (P.parryT > 0) P.parryT -= dt; if (P.counterT > 0) P.counterT -= dt;
    if (act.parryP && P.parryCd <= 0 && P.dash <= 0) { P.parryT = 0.24; P.parryCd = 0.7; Snd.play('whoosh'); emit(P.x + 4 + P.face * 7, P.y + 7, 5, { col: ['#9fe8ff', '#fff'], sp0: 10, sp1: 40 }); }""")
rep("""  function hurtPlayer(n, fromX, noKnock, src) {
    const P = Q.P;
    if (P.down) return false;""", """  // a successful parry: no damage, a hit-stop, the attacker is stunned and the next strike is a double-damage counter
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
    if (P.parryT > 0 && src !== 'pit' && Q.state === 'play') { parrySuccess(fromX); return false; }""")
rep("if (!p.dead) hitPlB(hb, q => { if (!p.dead && hurtPlayer(", "if (!p.dead) hitPlB(hb, q => { if (!p.dead && q.parryT > 0 && Q.state === 'play') { reflectShot(p, q); return; } if (!p.dead && hurtPlayer(")
# counter: the strike after a parry hits twice as hard
rep("""        let d = base;
        if (st.boss && isBig(e)) d *= st.boss;""", """        let d = base;
        if (P.counterT > 0) { d *= 2; P.counterHit = true; emit(e.x + e.w / 2, e.y + e.h / 2, 14, { col: ['#ffd34e', '#fff', '#9fe8ff'], sp0: 40, sp1: 140 }); }
        if (st.boss && isBig(e)) d *= st.boss;""")
rep("  function swordHit() {\n    const P = Q.P,", "  function swordHit() {\n    if (Q.P.counterHit) { Q.P.counterHit = false; Q.P.counterT = 0; pop(Q.P.x + 4, Q.P.y - 14, sv('COUNTER x2', 'PHẢN ĐÒN x2'), '#ffd34e'); Snd.play('explode'); }\n    const P = Q.P,")

# ---------- drawing: dash afterimages, parry guard, counter glow ----------
rep("""    const bob = 0;
    if (P.dash > 0) g.globalAlpha = 0.75;""", """    const bob = 0;
    if (P.trail) for (const tr of P.trail) { g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, Math.round(tr.x + P.w / 2 - camX), Math.round(tr.y + P.h - camY), tr.f < 0, true, 1, 1, tr.t / 0.22 * 0.45); g.globalCompositeOperation = 'source-over'; }
    if (P.dash > 0) g.globalAlpha = 0.75;""")
rep("""    if (hh && hh.hat) drawHat(hh, x, bot, P.face);
    if (swim) g.restore();""", """    if (hh && hh.hat) drawHat(hh, x, bot, P.face);
    if (P.parryT > 0) { const k = P.parryT / 0.24, cx = x + P.face * 6, cy = bot - 8; g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(159,232,255,' + (0.5 + k * 0.5) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 9 + (1 - k) * 3, P.face > 0 ? -1.1 : Math.PI - 1.1, P.face > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); g.fillStyle = 'rgba(255,255,255,' + k * 0.5 + ')'; g.fillRect(cx + P.face * 9 - 1, cy - 6, 2, 12); g.globalCompositeOperation = 'source-over'; g.lineWidth = 1; }
    if (P.counterT > 0 && Math.random() < 0.6) emit(P.x + 4 + rr(-6, 6), P.y + rr(0, 14), 1, { col: ['#ffd34e', '#fff'], sp0: 4, sp1: 16, grav: -30, l0: 0.2, l1: 0.4 });
    if (swim) g.restore();""")
# co-op: others see your guard
rep("sel: p.sel, hold: p.hold || null,", "sel: p.sel, parryT: Math.round((p.parryT || 0) * 100) / 100, hold: p.hold || null,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
