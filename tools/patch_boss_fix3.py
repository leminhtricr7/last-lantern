import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
a = s.index("  // a walking stride for one-picture bosses")
b = s.index("  function drawBoss(camX, camY) {")
new = """  // a walking stride for one-picture bosses: the body bobs and leans into the walk, the two halves of the legs take
  // turns stepping (one lifts and moves forward while the other stays planted), and dust puffs at each footfall
  function drawBossStride(spr, x, bot, flip, flash, sx, sy, rot, al, ph, amp, b) {
    const W = spr.w * sx, H = spr.h * sy, legH = Math.round(H * 0.3), cut = bot - legH, sw = Math.sin(ph), fw = flip ? -1 : 1, bob = -Math.abs(sw) * (1 + amp * 3);
    g.save(); g.beginPath(); g.rect(x - W, bot - H - 8, W * 2, H - legH + 8); g.clip(); drawSprT(g, spr, x, bot + bob, flip, flash, sx, sy, rot + fw * amp * 0.12, al); g.restore();
    for (const side of [-1, 1]) {
      const st = side * sw, lift = Math.max(0, st) * (1 + amp * 6), fx = st * (1 + amp * 5) * fw;
      g.save(); g.beginPath(); g.rect(side < 0 ? x - W : x, cut, W, legH + 2); g.clip(); drawSprT(g, spr, x + fx, bot - lift, flip, flash, sx, sy, rot, al); g.restore();
    }
    if (Math.abs(sw) > 0.97 && (b.stepFx || 0) < Q.t) { b.stepFx = Q.t + 0.12; emit(b.x + b.w / 2 - Math.sign(sw) * b.w * 0.22, b.y + b.h, 3, { col: ['#cfd6e6', '#8a8aa0'], sp0: 5, sp1: 25, vy: -12, grav: 40, l0: 0.2, l1: 0.4 }); }
  }
"""
s = s[:a] + new + s[b:]
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
