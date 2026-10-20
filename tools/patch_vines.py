# Tarzan vines in the Glowcap Swamp: long hanging vines over wide pits. Touch one in the air to grab it, swing with left / right,
# climb with up / down, jump to let go and fly. Works for every player in co-op (each has its own grip).
import io
# ---------------- level generator ----------------
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)
rep("const L = { B, li, W, H, grid, spawns: [], plats: [],", "const L = { B, li, W, H, grid, vines: [], spawns: [], plats: [],", 2)
rep("""  function gap(n) {
    const ny = Math.max(8, Math.min(11, gy + R(-1, 1)));
    let nn = Math.min(n, maxGap + (ny > gy ? 1 : 0) - (ny < gy ? 1 : 0)); if (nn < 2) nn = 2;""", """  function gap(n) {
    const vine = li === 7 && x > 30 && gy >= 9 && rnd() < 0.42;   // the swamp: a wide pit crossed on a hanging vine
    const ny = vine ? gy : Math.max(8, Math.min(11, gy + R(-1, 1)));
    let nn = Math.min(n, maxGap + (ny > gy ? 1 : 0) - (ny < gy ? 1 : 0)); if (nn < 2) nn = 2;
    if (vine) {
      nn = R(7, 9); const mid = x + nn / 2, top = Math.max(1, gy - 9);
      L.vines.push({ x: mid * TS, y: (top + 1) * TS, len: (gy - top - 2.5) * TS, i: L.vines.length });
      for (let i = 0; i < nn; i++) set(x + i, H - 1, '^');
      for (let i = 1; i < nn - 1; i++) if (i % 2 === 0) spawn('coin', x + i, gy - 3 - Math.round(Math.sin(i / (nn - 1) * Math.PI) * 2));
      if (rnd() < 0.5) set(x - 1 + 0, gy - 5, '=');   // a small perch beside the take-off ledge
      x += nn; gy = ny; flat(R(4, 6), { safe: true }); return;
    }""")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- game ----------------
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
rep("""    // timers
    if (act.jumpP) P.jumpBuf = 0.12; else P.jumpBuf -= dt;""", """    if (P.vineCd > 0) P.vineCd -= dt;
    if (vineStep(P, dt)) return;   // hanging on a vine: the vine drives the body
    // timers
    if (act.jumpP) P.jumpBuf = 0.12; else P.jumpBuf -= dt;""")
rep("""    if (P.parryT > 0 && src !== 'pit' && Q.state === 'play') { parrySuccess(fromX); return false; }""", """    if (P.parryT > 0 && src !== 'pit' && Q.state === 'play') { parrySuccess(fromX); return false; }
    if (P.vine && src !== 'pit') { P.vine = null; P.vineCd = 0.5; }   // a hit knocks you off the vine""")
rep("""  function updatePlayer(dt) {""", """  // ---------- vines ----------
  const vineTip = (v, a) => ({ x: v.x + Math.sin(a) * v.len, y: v.y + Math.cos(a) * v.len });
  const vineIdle = v => Math.sin(Q.t * 0.8 + v.i * 1.7) * 0.06;
  // returns true while the player hangs on a vine (the normal movement is skipped)
  function vineStep(P, dt) {
    const vs = Q.L.vines; if (!vs || !vs.length) return false;
    if (!P.vine) {
      if (P.onGround || P.vineCd > 0 || P.down || Q.state !== 'play') return false;
      const hx = P.x + 4, hy = P.y + 4;
      for (const v of vs) {
        const a = vineIdle(v), dx = Math.sin(a), dy = Math.cos(a), px = hx - v.x, py = hy - v.y, t = px * dx + py * dy, d = Math.abs(px * dy - py * dx);
        if (t < 8 || t > v.len || d > 7) continue;
        const D = Math.hypot(px, py), ang = Math.atan2(px, py), vt = P.vx * Math.cos(ang) - P.vy * Math.sin(ang);
        P.vine = { v, D: clamp(D, 22, v.len), ang, angv: clamp(vt / Math.max(D, 24), -5, 5) }; P.dash = 0;
        Snd.play('djump'); emit(hx, hy, 6, { col: ['#6ac87a', '#c8ffa0'], sp0: 10, sp1: 40 }); return true;
      }
      return false;
    }
    const V = P.vine, v = V.v, dirIn = (act.right ? 1 : 0) - (act.left ? 1 : 0);
    if (act.up) V.D = Math.max(22, V.D - 48 * dt); if (act.down) V.D = Math.min(v.len, V.D + 48 * dt);   // climb up and down the rope
    V.angv += (-(GRAV * 0.9) / V.D * Math.sin(V.ang) + dirIn * 5.5) * dt;   // the pendulum plus the pumping with left / right
    V.angv *= 1 - 0.18 * dt; V.ang += V.angv * dt;
    if (Math.abs(V.ang) > 1.3) { V.ang = Math.sign(V.ang) * 1.3; V.angv *= -0.4; }
    const hx = v.x + Math.sin(V.ang) * V.D, hy = v.y + Math.cos(V.ang) * V.D;
    P.x = hx - 4; P.y = hy - 3; P.vx = V.angv * V.D * Math.cos(V.ang); P.vy = -V.angv * V.D * Math.sin(V.ang); P.onGround = false; P.vineCd = 0;
    if (Math.abs(V.angv) > 0.25) P.face = V.angv > 0 ? 1 : -1; else if (dirIn) P.face = dirIn;
    if (Math.random() < 0.15) emit(hx, hy - 2, 1, { col: ['#6ac87a', '#c8ffa0'], sp0: 3, sp1: 14, grav: 40, l0: 0.3, l1: 0.6 });
    const hit = (tx, ty) => solid(Math.floor(tx / TS), Math.floor(ty / TS));
    const free = !hit(P.x + 1, P.y + 1) && !hit(P.x + 7, P.y + 1) && !hit(P.x + 1, P.y + 12) && !hit(P.x + 7, P.y + 12);
    const feet = hit(P.x + 4, P.y + P.h + 1);
    if (act.jumpP || !free || (feet && Math.abs(V.angv) < 1.2)) {   // let go: fly along the swing, with a little jump
      P.vine = null; P.vineCd = 0.35; P.vx *= 1.05; P.vy = (act.jumpP ? P.vy - 150 : P.vy); P.jumps = 1; if (!free) { P.x -= Math.sign(P.vx) * 3; P.vx *= -0.3; }
      if (act.jumpP) { Snd.play('jump'); emit(P.x + 4, P.y + 6, 8, { col: ['#6ac87a', '#fff'], sp0: 15, sp1: 50 }); }
      return false;
    }
    P.inv = Math.max(P.inv - 0, P.inv); return true;
  }
  function drawVines(camX, camY) {
    const vs = Q.L.vines; if (!vs || !vs.length) return;
    const held = new Map(); for (const p of (coop && Q.players ? Q.players : [Q.P])) { const idx = p.vine ? p.vine.v.i : (p.vn >= 0 ? p.vn : -1); if (idx >= 0) held.set(idx, p); }
    for (const v of vs) {
      const sx = Math.round(v.x - camX); if (sx < -60 || sx > VW + 60) continue;
      const hp = held.get(v.i), a = hp ? Math.atan2((hp.x + 4) - v.x, (hp.y + 4) - v.y) : vineIdle(v), len = hp ? Math.hypot((hp.x + 4) - v.x, (hp.y + 4) - v.y) : v.len;
      const ay = Math.round(v.y - camY);
      g.fillStyle = '#4a3220'; g.fillRect(sx - 9, ay - 4, 18, 4); g.fillStyle = '#6a4a30'; g.fillRect(sx - 9, ay - 4, 18, 1); g.fillStyle = '#2e8a3e'; for (let k = 0; k < 4; k++) g.fillRect(sx - 8 + k * 5, ay - 1, 3, 4 + (k % 2) * 2);   // the branch it hangs from
      const N = Math.max(6, Math.round(len / 5)), pts = [];
      for (let k = 0; k <= N; k++) { const s2 = k / N, bend = Math.sin(s2 * Math.PI) * (hp ? 0 : 1.2) + (hp ? Math.sin(Q.t * 6 + k) * 0.2 * Math.abs(Math.sin(a)) : 0); pts.push([sx + Math.sin(a) * len * s2 + Math.cos(a) * bend, ay + Math.cos(a) * len * s2]); }
      g.lineCap = 'round'; g.strokeStyle = '#14301c'; g.lineWidth = 3.2; g.beginPath(); pts.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      g.strokeStyle = hp ? '#8aff9a' : '#3aa04a'; g.lineWidth = 1.8; g.beginPath(); pts.forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      g.strokeStyle = '#a8ffb8'; g.lineWidth = 0.6; g.beginPath(); pts.forEach((q, k) => k ? g.lineTo(q[0] - 0.6, q[1]) : g.moveTo(q[0] - 0.6, q[1])); g.stroke(); g.lineWidth = 1;
      pts.forEach((q, k) => { if (k % 3 === 1) { g.fillStyle = k % 2 ? '#2e8a3e' : '#5ac86a'; g.fillRect(Math.round(q[0] + (k % 2 ? 1 : -3)), Math.round(q[1]), 3, 2); } });   // leaves
      const e = pts[pts.length - 1]; g.fillStyle = '#c8a060'; g.fillRect(Math.round(e[0]) - 2, Math.round(e[1]) - 1, 4, 4); g.fillStyle = '#6a4a30'; g.fillRect(Math.round(e[0]) - 2, Math.round(e[1]) + 2, 4, 1);   // the knot at the bottom
      if (!hp && Q.P && Math.abs(Q.P.x - v.x) < 90 && !Q.P.onGround) { g.globalAlpha = 0.5 + 0.3 * Math.sin(Q.t * 6); g.fillStyle = '#ffffff'; g.fillRect(Math.round(e[0]) - 1, Math.round(e[1]) - 6, 2, 2); g.globalAlpha = 1; }
    }
  }
  function updatePlayer(dt) {""")
rep("""    drawPlayer(camX, camY);""", """    drawVines(camX, camY);
    drawPlayer(camX, camY);""")
rep("sel: p.sel, ws: p.ws,", "sel: p.sel, vn: p.vine ? p.vine.v.i : -1, ws: p.ws,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
