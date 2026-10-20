# Fan heroes: a real movement animator (the picture is split into body and two legs: walking / running strides, body bob,
# forward lean, jump tuck, push lean, landing squash), movement effects (footstep dust, take-off and landing dust,
# speed trails, afterimages, each hero's signature particles), and Miku joins the team (sound-wave attack, notes, concert).
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

rep("['kayn', 'rhaast', 'tom', 'jerry', 'luffy', 'sonic', 'kirby', 'jotaro', 'dio'].forEach(k => {", "['kayn', 'rhaast', 'tom', 'jerry', 'luffy', 'sonic', 'kirby', 'jotaro', 'dio', 'miku'].forEach(k => {")

# ---------- the animator ----------
a0 = s.index("  function drawFanHero(P, h, x, bot) {")
a1 = s.index("    return true;\n  }", a0) + len("    return true;\n  }")
s = s[:a0] + """  // where the legs start in each picture (fraction of the height): the part below swings as two legs
  const FAN_RIG = { kayn: 0.74, rhaast: 0.76, tom: 0.84, jerry: 0.86, luffy: 0.8, sonic: 0.84, kirby: 0.8, jotaro: 0.8, dio: 0.8, miku: 0.8 };
  // the hero in play: the drawing at full screen resolution, animated like a puppet (body + left leg + right leg)
  function drawFanHero(P, h, x, bot) {
    const key = fanKey(h, P), o = FAN_IMG[key]; if (!o) return false; const im = o.im, W = im.width, H = im.height, hy = Math.round(H * (FAN_RIG[key] || 0.8)), half = Math.round(W / 2);
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
    const parts = () => {
      const back = moving && Math.sin(P.anim * (run ? 14 : 9)) > 0 ? 'R' : 'L';   // the leg in front is drawn last
      const leg = side => { const A = side === 'L' ? L : R, x0 = side === 'L' ? 0 : half, w = side === 'L' ? half : W - half; hiImg(im, x0, hy, w, H - hy, -W / 2 + x0 + A.x, -H + hy + A.y, w, H - hy); };
      leg(back); hiImg(im, 0, 0, W, hy + 2, -W / 2 + bodyX, -H + bodyY, W, hy + 2); leg(back === 'L' ? 'R' : 'L');
    };
    g.save(); g.translate(x, bot); g.rotate(lean * f); g.scale(f * FAN_SC * sx, FAN_SC * sy); g.imageSmoothingEnabled = true;
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
  }""" + s[a1:]

# effects run every frame for fan heroes
rep("""    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;""", """    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;
    { const hf = HERO[id]; if (hf && hf.custom === 'fan') fanMoveFx(P, hf); }
    if (mk === 'idol' && P.concT > 0) {   // the concert: 6 beats of sound around the singer
      P.concT -= dt; P.concTick = (P.concTick || 0) - dt;
      if (P.concTick <= 0) { P.concTick = 0.5; const cx = P.x + 4, cy = P.y + 7, d = Math.max(1, Math.round((3 + baseDmg()) * 0.8)); addRing(cx, cy, ['#39c5bb', '#ff8fbf', '#ffe08a'][Math.floor(P.concT * 2) % 3], 80, 0.4); Snd.play('chime'); Q.shake = Math.max(Q.shake, 0.15);
        for (const e of foes()) if (Math.hypot(e.x + e.w / 2 - cx, e.y + e.h / 2 - cy) < 80 + e.w / 2) { dmgFoe(e, d, true, true); chargeHit(); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#39c5bb', '#ffffff'], sp0: 20, sp1: 80 }); }
        for (let i = 0; i < 3; i++) pop(cx + rr(-30, 30), cy - rr(10, 30), Math.random() < 0.5 ? '♪' : '♫', ['#39c5bb', '#ff8fbf', '#ffe08a'][i]); }
      if (P.concT <= 0) for (const p of teamNear(P.x + 4, P.y + 7, 140)) healP(p, 1);
    }""")
# Miku's basic attack: a sound wave + a homing note
rep("""    dio: { r: 24, h: 16, cd: 0.3, col: '#ffd34e', fx: 'chop', d: 0 }
  };""", """    dio: { r: 24, h: 16, cd: 0.3, col: '#ffd34e', fx: 'chop', d: 0 }, miku: { r: 30, h: 18, cd: 0.3, col: '#39c5bb', fx: 'wave', d: 0 }
  };""")
rep("""      if (mk === 'world') shootG({""", """      if (mk === 'idol') shootG({ x: P.x + 4 + f * 6, y: P.y + 4, vx: f * 160, vy: -30, home: true, life: 1.3, dmg: Math.max(1, baseDmg()), shape: 'orb', col: Math.random() < 0.5 ? '#39c5bb' : '#ff8fbf', trail: '#ffffff', sz: 3, f });
      if (mk === 'world') shootG({""")
rep("""    else if (w.fx === 'punch') {""", """    else if (w.fx === 'wave') { for (let i = 0; i < 3; i++) { g.strokeStyle = hexA(i === 1 ? '#ff8fbf' : w.col, a * (1 - i * 0.25)); g.lineWidth = 1.5; g.beginPath(); g.arc(x + f * 4, cy, 6 + i * 6 + k * 10, f > 0 ? -0.8 : Math.PI - 0.8, f > 0 ? 0.8 : Math.PI + 0.8); g.stroke(); } }
    else if (w.fx === 'punch') {""")
# Miku's passive: every 4th hit heals the team
rep("""  function heroOnHit(P, e) {
    const mk = mechOf(P);""", """  function heroOnHit(P, e) {
    const mk = mechOf(P);
    if (mk === 'idol') { P.combo = (P.combo || 0) + 1; if (P.combo % 4 === 0) { for (const p of teamNear(P.x + 4, P.y + 7, 120)) healP(p, 1); pop(P.x + 4, P.y - 18, sv('♪ Encore! Healed', '♪ Encore! Hồi máu'), '#39c5bb'); } }""")
rep("""      case 'ora': P.oraT = 1.5;""", """      case 'concert': P.concT = 3; P.concTick = 0; Snd.play('relic'); pop(cx, cy - 26, sv('LIVE CONCERT!', 'BUỔI HÒA NHẠC!'), '#39c5bb'); break;
      case 'ora': P.oraT = 1.5;""")
# stage lights over Miku during the concert
rep("""    drawFanSwing(P, x, bot);""", """    drawFanSwing(P, x, bot);
    if (mk === 'idol' && P.concT > 0) { g.save(); g.globalCompositeOperation = 'lighter'; ['#39c5bb', '#ff8fbf', '#ffe08a'].forEach((c, i) => { const a = Math.sin(Q.t * 3 + i * 2) * 0.35, sx = x + (i - 1) * 40; const gr = g.createLinearGradient(sx, 0, x, bot); gr.addColorStop(0, hexA(c, 0.28)); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.beginPath(); g.moveTo(sx - 4, 0); g.lineTo(sx + 4, 0); g.lineTo(x + a * 30 + 14, bot); g.lineTo(x + a * 30 - 14, bot); g.fill(); }); g.restore(); }""")
rep("form: p.form, ess: p.ess, dk: p.dk,", "form: p.form, ess: p.ess, dk: p.dk, concT: p.concT,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
