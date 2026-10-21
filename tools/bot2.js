// Assisted autoplayer: like bot.js, but when it makes no progress for 25 s it teleports 10 tiles ahead and logs an "assist", and it tags
// assists that happen inside the phase 5 side rooms (vault, stair, pond, secret room, skill room), so a room that blocks the path shows up.
// Load the game with ?debug, eval this file in the console, then run runBot2(levelIndex, seconds).
window.runBot2 = function (li, maxSec) {
  LL.save.cleared = [0, 1, 2, 3, 4, 5]; LL.startLevel(li); const dt = 0.01, TS = 16; let lastX = -1, stuck = 0, bestX = 0, t = 0, noProg = 0, atkT = 0; const assists = [];
  const L = LL.Q.L;
  const foot = [].concat((L.crateRooms || []).map(r => ['vault', r.x0 - 1, r.x0 + 17]), (L.stairs || []).map(r => ['stair', r.x0, r.x0 + 18]), (L.ponds || []).map(r => ['pond', r.x0 - 4, r.x1 + 3]),
    (L.secretRooms || []).map(r => ['secret', r.x - 1, r.x + 8]), (L.skill || []).map(r => ['skill-' + r.k, r.x0 - 1, r.x1 + 1]));
  const inFoot = tx => { const f = foot.find(f => tx >= f[1] && tx <= f[2]); return f ? f[0] : ''; };
  for (let i = 0; i < maxSec / dt; i++) {
    const Q = LL.Q, P = Q.P, a = LL.act; t += dt; P.keys = 0; P.hp = 9999; P.inv = Math.max(P.inv, 0.3);
    if (Q.gates && Q.gates.some(gd => !gd.open && gd.need !== 'plate' && !gd.bridge) && Q.state === 'play') LL.solveAll();
    a.left = false; a.right = true; a.jump = false; a.jumpP = false; a.atkP = false; a.dashP = false; a.down = false; a.okP = false; a.pauseP = false; a.up = false;
    if (Q.state === 'talk' || Q.state === 'reward' || Q.state === 'tablet' || Q.state === 'shop' || Q.state === 'intro') { a.okP = true; a.right = false; if (Q.talk) Q.talk.t = 999; LL.updatePlay(dt); LL.clearPressed(); continue; }
    if (Q.state === 'dead') { a.okP = true; for (let k = 0; k < 100; k++) LL.updatePlay(dt); LL.updatePlay(dt); LL.clearPressed(); continue; }
    if (Q.state === 'complete') return { li, done: true, t: Math.round(t), assists };
    if (Q.arenaSealed) return { li, done: 'arena', t: Math.round(t), assists };
    const fy = Math.floor((P.y + P.h) / TS), solidAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); return LL.solid(tx, ty) || LL.ch(tx, ty) === '='; };
    const gap = !solidAt(P.x + P.w + 8, P.y + P.h + 3), wall = LL.solid(Math.floor((P.x + P.w + 5) / TS), fy - 1) || LL.solid(Math.floor((P.x + P.w + 5) / TS), fy - 2);
    let spike = false; for (let d = 0; d < 4; d++) if (LL.ch(Math.floor((P.x + P.w + d * 8) / TS), fy - 1) === '^') spike = true;
    let enemy = null; for (const e of Q.ents) if (!e.dead && Math.abs(e.y - P.y) < 30 && e.x > P.x - 6 && e.x < P.x + 40) enemy = e; atkT -= dt; if (enemy && atkT <= 0) { a.atkP = true; atkT = 0.28; }
    if (P.onGround && (gap || wall || spike)) { a.jumpP = true; a.jump = true; }
    if (!P.onGround) { a.jump = P.vy < 0; if (P.vy > 30 && P.jumps < 2 && !solidAt(P.x + 4, P.y + P.h + 30) && !solidAt(P.x + P.w + 12, P.y + P.h + 20)) a.jumpP = true; }
    if (Math.abs(P.x - lastX) < 0.3) stuck += dt; else { stuck = 0; lastX = P.x; } if (stuck > 2.5) { stuck = 0; P.x += 24; P.y -= 20; }
    if (P.x > bestX + 8) { bestX = P.x; noProg = 0; } else noProg += dt;
    if (noProg > 25) { const tx = Math.round(P.x / TS); assists.push(tx + (inFoot(tx) ? ' IN ' + inFoot(tx) : '')); noProg = 0; let nx = tx + 10; for (let k = 0; k < 20; k++) { for (let y = 3; y < L.H - 1; y++) if (LL.solid(nx, y) && !LL.solid(nx, y - 1) && LL.ch(nx, y - 1) !== '^') { P.x = nx * TS; P.y = (y - 1) * TS - P.h; P.vy = 0; break; } if (P.y < (L.H - 3) * TS) break; nx++; } bestX = P.x; }
    LL.updatePlay(dt); LL.clearPressed();
  }
  return { li, done: false, bestTile: Math.round(bestX / TS), assists };
};
