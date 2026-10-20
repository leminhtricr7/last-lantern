# Fan heroes get a moving arm / weapon: the arm (with the scythe, fist...) is cut out of the picture and swung around the shoulder:
# Kayn and Rhaast slash down then up with the scythe, Tom swipes, Dio chops, Miku raises her arm, Jotaro and Sonic punch,
# Luffy's arm stretches out, Sonic spins, Kirby puffs, Jerry kicks. Skills animate too (Rhaast's sweep is a full spin,
# Ora Ora and Gatling are rapid punches).
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# the arm of each picture: rect x0, y0, x1, y1 (native pixels), shoulder / hand pivot, and how it swings
rep("""  function fanParts(key, im) {""", """  const FAN_ARM = {
    kayn: { r: [27, 2, 38, 46], p: [28, 26], sw: 'slash' }, rhaast: { r: [0, 2, 8, 46], p: [7, 27], sw: 'slash' },
    tom: { r: [28, 24, 37, 38], p: [29, 26], sw: 'swipe' }, luffy: { r: [25, 19, 40, 29], p: [25, 24], sw: 'stretch' },
    sonic: { r: [30, 28, 39, 39], p: [31, 30], sw: 'jab' }, jotaro: { r: [26, 18, 39, 26], p: [27, 21], sw: 'punch' },
    dio: { r: [26, 3, 37, 22], p: [27, 20], sw: 'chop' }, miku: { r: [26, 22, 30, 34], p: [28, 23], sw: 'wave' }
  };
  function fanParts(key, im) {""")
rep("""    const body = document.createElement('canvas'); body.width = im.width; body.height = H; const bx = body.getContext('2d'); bx.drawImage(im, 0, 0); bx.clearRect(x0, hy, x1 - x0 + 1, H - hy);
    return { body, L: cut(x0, top, sp - x0 + 1, H - top), R: cut(sp + 1, top, x1 - sp, H - top), lx: x0, rx: sp + 1, top };""",
"""    const body = document.createElement('canvas'); body.width = im.width; body.height = H; const bx = body.getContext('2d'); bx.drawImage(im, 0, 0); bx.clearRect(x0, hy, x1 - x0 + 1, H - hy);
    const A = FAN_ARM[key]; let arm = null;
    if (A) { const [ax0, ay0, ax1, ay1] = A.r; arm = { c: cut(ax0, ay0, ax1 - ax0 + 1, ay1 - ay0 + 1), x: ax0, y: ay0, px: A.p[0], py: A.p[1], sw: A.sw, len: ax1 - ax0 + 1 }; bx.clearRect(ax0, ay0, ax1 - ax0 + 1, ay1 - ay0 + 1); }
    return { body, L: cut(x0, top, sp - x0 + 1, H - top), R: cut(sp + 1, top, x1 - sp, H - top), lx: x0, rx: sp + 1, top, arm };""")
# the swing: wind-up, strike, follow-through and back
rep("""  // the hero in play: the drawing at full screen resolution, animated like a puppet (body + left leg + right leg)""", """  const swingProf = (k, a0, a1) => k < 0.2 ? a0 * ez(k / 0.2) : (k < 0.55 ? a0 + (a1 - a0) * ez((k - 0.2) / 0.35) : a1 * (1 - ez((k - 0.55) / 0.45)));
  function armPose(P, arm, moving, run) {
    const o = { ang: 0, sx: 1, dx: 0 }, k = P.armT > 0 ? 1 - P.armT / (P.armDur || 0.32) : -1, d = P.armDir || 1;
    if (moving) o.ang = Math.sin(P.anim * (run ? 14 : 9)) * 0.14; else o.ang = Math.sin(P.anim * 2.6) * 0.04;   // the arm swings with the steps
    if (arm.sw === 'stretch' && (P.punch || P.gatT > 0)) { const ext = P.punch ? (P.punch.ext || 0) : 20 + Math.random() * 60; o.sx = 1 + ext * 2 / arm.len; o.ang = P.punch ? -(P.punch.dy || 0) / 90 : (Math.random() - 0.5) * 0.4; return o; }
    if (arm.sw === 'punch' && P.oraT > 0) { o.sx = 1 + Math.abs(Math.sin(P.anim * 40)) * 0.9; o.ang = (Math.random() - 0.5) * 0.4; return o; }
    if (k < 0) return o;
    if (P.armSpin) { o.ang = Math.PI * 2 * ez(k); return o; }
    if (arm.sw === 'slash') o.ang = d > 0 ? swingProf(k, -0.8, 1.7) : swingProf(k, 1.5, -1.0);   // scythe: down, then up on the next swing
    else if (arm.sw === 'swipe') o.ang = swingProf(k, -1.2, 1.1);
    else if (arm.sw === 'chop') o.ang = swingProf(k, -0.4, 1.9);
    else if (arm.sw === 'wave') o.ang = swingProf(k, 0.3, -2.3);
    else { const s1 = Math.sin(Math.min(1, k * 1.6) * Math.PI); o.sx = 1 + 0.75 * s1; o.ang = -0.08 * s1; }   // punch / jab: the arm shoots out from the shoulder
    return o;
  }
  // the hero in play: the drawing at full screen resolution, animated like a puppet (body + left leg + right leg)""")
rep("""    if (h.mech === 'toon') { if (P.landA > 0) { sx *= 1.2; sy *= 0.8; } else if (!onG) { sy *= P.vy < 0 ? 1.15 : 1.05; sx *= 2 - sy; } }
    const parts = () => {""", """    if (h.mech === 'toon') { if (P.landA > 0) { sx *= 1.2; sy *= 0.8; } else if (!onG) { sy *= P.vy < 0 ? 1.15 : 1.05; sx *= 2 - sy; } }
    let spin = 0; const ak = P.armT > 0 ? 1 - P.armT / (P.armDur || 0.32) : -1;
    if (key === 'sonic' && ak >= 0) spin = Math.PI * 2 * ez(ak) * f;   // Sonic's attack is a spin
    if (key === 'kirby' && ak >= 0) { const q = Math.sin(ak * Math.PI); sx *= 1 + 0.25 * q; sy *= 1 - 0.15 * q; }   // Kirby puffs
    if (key === 'jerry' && ak >= 0) { const q = Math.sin(Math.min(1, ak * 1.5) * Math.PI); R.x += 6 * q; R.y -= 4 * q; lean -= 0.1 * q; }   // Jerry kicks
    const ap = pp.arm ? armPose(P, pp.arm, moving, run) : null;
    const drawArm = () => { if (!ap) return; const a = pp.arm; g.save(); g.translate(-W / 2 + a.px + bodyX, -H + a.py + bodyY); g.rotate(ap.ang); g.translate(ap.dx, 0); g.scale(ap.sx, 1); hiImg(a.c, 0, 0, a.c.width, a.c.height, a.x - a.px, a.y - a.py, a.c.width, a.c.height); g.restore(); };
    const parts = () => {""")
rep("""      leg(back); hiImg(pp.body, 0, 0, W, H, -W / 2 + bodyX, -H + bodyY, W, H); leg(back === 'L' ? 'R' : 'L');""",
    """      leg(back); hiImg(pp.body, 0, 0, W, H, -W / 2 + bodyX, -H + bodyY, W, H); leg(back === 'L' ? 'R' : 'L'); drawArm();""")
rep("""    g.save(); g.translate(x, bot); g.rotate(lean * f); g.scale(f * FAN_SC * sx, FAN_SC * sy); g.imageSmoothingEnabled = true;
    if (P.dash > 0) g.globalAlpha = 0.75;
    parts();""", """    g.save(); g.translate(x, bot); if (spin) { g.translate(0, -H * FAN_SC / 2); g.rotate(spin); g.translate(0, H * FAN_SC / 2); } g.rotate(lean * f); g.scale(f * FAN_SC * sx, FAN_SC * sy); g.imageSmoothingEnabled = true;
    if (P.dash > 0) g.globalAlpha = 0.75;
    parts();""")
# start a swing on every basic attack (alternating down / up) and on the skills
rep("""      if (P.atkCd > 0) return true; const key = P.hero === 'kayn'""", """      if (P.atkCd > 0) return true; P.armT = P.armDur = 0.32; P.armDir = -(P.armDir || -1); P.armSpin = false; const key = P.hero === 'kayn'""")
rep("""      const c = P.copy; if (!c) { if (!isFan(P)) return false; if (P.atkCd > 0) return true; P.atkCd = 0.3;""", """      const c = P.copy; if (!c) { if (!isFan(P)) return false; if (P.atkCd > 0) return true; P.atkCd = 0.3; P.armT = P.armDur = 0.3;""")
rep("""        if (P.form === 'rhaast') {   // a wide scythe sweep, then back to Shadow""", """        if (P.form === 'rhaast') {   // a wide scythe sweep, then back to Shadow
          P.armT = P.armDur = 0.5; P.armSpin = true;""")
rep("""        } else {   // dash through enemies
          const x0 = P.x, hit = new Set(); P.inv = Math.max(P.inv, 0.45);""", """        } else {   // dash through enemies
          P.armT = P.armDur = 0.35; P.armDir = 1; P.armSpin = false;
          const x0 = P.x, hit = new Set(); P.inv = Math.max(P.inv, 0.45);""")
rep("""      case 'concert': P.concT = 3;""", """      case 'concert': P.armT = P.armDur = 0.6; P.armSpin = false; P.concT = 3;""")
rep("""      case 'gag': {""", """      case 'gag': { P.armT = P.armDur = 0.4; P.armSpin = false;""")
rep("""      case 'jerrydash': {""", """      case 'jerrydash': { P.armT = P.armDur = 0.3;""")
rep("""      case 'spindash': P.mom = 1;""", """      case 'spindash': P.armT = P.armDur = 0.4; P.mom = 1;""")
rep("""      case 'theworld': {""", """      case 'theworld': { P.armT = P.armDur = 0.6; P.armDir = 1; P.armSpin = false;""")
# timer, network
rep("""    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;""", """    if (P.fsw && P.fsw.t > 0) P.fsw.t -= dt;
    if (P.armT > 0) P.armT -= dt;""")
rep("form: p.form, ess: p.ess, dk: p.dk,", "form: p.form, ess: p.ess, dk: p.dk, armT: p.armT, armDur: p.armDur, armDir: p.armDir, armSpin: p.armSpin,")
# Luffy's own picture arm stretches now: no extra line arm for him
rep("""    if (mk === 'stretch') {
      const sx0 = x + P.face * 3""", """    if (mk === 'stretch' && !isFan(P)) {
      const sx0 = x + P.face * 3""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
