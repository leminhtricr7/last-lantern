// Debug autoplayer. Load the game with ?debug, then eval this file in the console and call runBot(levelIndex, seconds).
window.runBot = function (li, maxSec) {
  LL.save.cleared = [0, 1, 2, 3, 4, 5]; LL.startLevel(li);
  const dt = 0.01, TS = 16; let lastX = -1, stuck = 0, deaths = 0, stucks = [], atkT = 0, bestX = 0, t = 0;
  const deathAt = [];
  for (let i = 0; i < maxSec / dt; i++) {
    const Q = LL.Q, P = Q.P, a = LL.act; t += dt;
    a.left = false; a.right = true; a.jump = false; a.jumpP = false; a.atkP = false; a.dashP = false; a.down = false; a.okP = false; a.pauseP = false; a.up = false; a.backP = false;
    if (Q.state === 'intro') { a.okP = true; LL.updatePlay(dt); LL.clearPressed(); continue; }
    if (Q.state === 'dead') { deaths++; deathAt.push(Math.round(P.x / TS)); a.okP = true; for (let k = 0; k < 100; k++) LL.updatePlay(dt); LL.updatePlay(dt); LL.clearPressed(); continue; }
    if (Q.state === 'complete') return { li, done: true, t: Math.round(t), deaths, deathAt, stucks };
    if (Q.boss && Q.arenaSealed && !Q.bossDead) {
      a.right = false; const b = Q.boss;
      if (Math.abs(b.x - P.x) > 30) { a.right = b.x > P.x; a.left = b.x < P.x; }
      atkT -= dt; if (atkT <= 0) { a.atkP = true; atkT = 0.3; }
      if (b.st !== 'intro' && b.st !== 'sleep' && t % 2 < dt) LL.hurtBoss(b, 3);
      LL.updatePlay(dt); LL.clearPressed(); continue;
    }
    const fy = Math.floor((P.y + P.h) / TS);
    const solidAt = (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); const c = LL.ch(tx, ty); return LL.solid(tx, ty) || c === '='; };
    const ax = P.x + P.w + 8;
    const gap = !solidAt(ax, P.y + P.h + 3);
    const wall = LL.solid(Math.floor((P.x + P.w + 5) / TS), fy - 1) || LL.solid(Math.floor((P.x + P.w + 5) / TS), fy - 2);
    let spike = false; for (let d = 0; d < 4; d++) { if (LL.ch(Math.floor((P.x + P.w + d * 8) / TS), fy - 1) === '^') spike = true; }
    let enemy = null; for (const e of Q.ents) { if (!e.dead && Math.abs(e.y - P.y) < 30 && e.x > P.x - 6 && e.x < P.x + 40) enemy = e; }
    atkT -= dt; if (enemy && atkT <= 0) { a.atkP = true; atkT = 0.28; }
    if (P.onGround && (gap || wall || spike)) { a.jumpP = true; a.jump = true; }
    if (!P.onGround) {
      a.jump = P.vy < 0;
      if (P.vy > 30 && P.jumps < 2 && !solidAt(P.x + 4, P.y + P.h + 30) && !solidAt(P.x + P.w + 12, P.y + P.h + 20)) a.jumpP = true;
    }
    if (Math.abs(P.x - lastX) < 0.3) stuck += dt; else { stuck = 0; lastX = P.x; }
    if (stuck > 2.5) { stucks.push(Math.round(P.x / TS) + ',' + Math.round(P.y / TS)); stuck = 0; P.x += 24; P.y -= 20; }
    bestX = Math.max(bestX, P.x);
    LL.updatePlay(dt); LL.clearPressed();
  }
  return { li, done: false, bestTile: Math.round(bestX / TS), arena: LL.Q.L.arena.x0, deaths, deathAt, stucks };
};
