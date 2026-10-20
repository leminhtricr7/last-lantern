# The animator set (idle 4, walk 6, run 6, push 6, jump 6, hurt 3 with a red frame) for the player,
# and the same six states (stepped at ~10 fps, red hurt frame) for monsters, bosses, pets, summons and NPCs.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- player state: pushing a wall, landing, getting hurt ----------
rep("""    moveX(P, P.vx * dt);
    const wasAir = !P.onGround, impact = P.vy;""", """    { const blk = moveX(P, P.vx * dt); P.push = blk && dir !== 0 && P.onGround ? 0.14 : Math.max(0, (P.push || 0) - dt); }
    if (P.hurtA > 0) P.hurtA -= dt; if (P.landA > 0) P.landA -= dt; P.airT = P.onGround ? 0 : (P.airT || 0) + dt;
    const wasAir = !P.onGround, impact = P.vy;""")
rep("""    if (wasAir && P.onGround && impact > 180) { Snd.play('land');""", """    if (wasAir && P.onGround && impact > 60) P.landA = 0.12;
    if (wasAir && P.onGround && impact > 180) { Snd.play('land');""")
rep("    P.hp -= n; P.inv = 1.2;", "    P.hp -= n; P.inv = 1.2; P.hurtA = 0.36;")

# ---------- player: choose the animation ----------
rep("""    let spr;
    if (swim) spr = getSprite('hero_run', swp, Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 4);
    else if (!P.onGround) spr = getSprite(P.vy < 0 ? 'hero_jump' : 'hero_fall', swp, 0);
    else if (Math.abs(P.vx) > 15) spr = getSprite('hero_run', swp, Math.floor(P.anim * 12) % 4);
    else spr = getSprite('hero_idle', swp, Math.floor(P.anim * 3) % 2);""", """    let spr; const an = heroAnim(P, swim), am = (HERO_META[an.n] || [])[an.f] || { bx: 0, by: 0 };
    spr = getSprite(an.n, swp, an.f); if (an.red) spr = redOf(spr);
    const ax = x + am.bx * P.face, ab = bot + am.by;   // where the head and hands are in this frame (hats, weapons, lantern follow)""")
rep("""    if (hh && hh.custom) { const fa = Math.floor(P.anim * 12) % 4; spr = swim || (Math.abs(P.vx) > 15 && P.onGround) ? mikuSprite('run', fa) : (!P.onGround ? mikuSprite('air', 0) : mikuSprite('idle', Math.floor(P.anim * 3) % 2)); }""",
    """    if (hh && hh.custom) { const fa = Math.floor(P.anim * 12) % 4; spr = swim || (Math.abs(P.vx) > 15 && P.onGround) ? mikuSprite('run', fa) : (!P.onGround ? mikuSprite('air', 0) : mikuSprite('idle', Math.floor(P.anim * 3) % 2)); if (an.red) spr = redOf(spr); }""")
rep("""    drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;
    if (!(hh && hh.custom)) drawEmoteFace(x, bot + bob, P.face < 0, 1, P.emo, P.anim); drawEmoBubble(x - 8, bot - 24, P.emo);
    // lantern
    const lx = x + P.face * 8, ly = bot - 9""", """    drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;
    if (!(hh && hh.custom)) drawEmoteFace(ax, ab + bob, P.face < 0, 1, P.emo, P.anim); drawEmoBubble(ax - 8, ab - 24, P.emo);
    // lantern
    const lx = ax + P.face * 8, ly = ab - 9""")
rep("""    if (hg) drawHeldGun(hg, x, bot, P.face); else if (hk && WPN_PAINT[hk]) drawHeldWpn(hk, x, bot, P.face); else if (sw) drawHeldSword(sw, x, bot);
    if (av) drawArmorFront(av, x, bot);
    if (hh && hh.hat) drawHat(hh, x, bot, P.face);""", """    if (hg) drawHeldGun(hg, ax, ab, P.face); else if (hk && WPN_PAINT[hk]) drawHeldWpn(hk, ax, ab, P.face); else if (sw) drawHeldSword(sw, ax, ab);
    if (av) drawArmorFront(av, ax, ab);
    if (hh && hh.hat) drawHat(hh, ax, ab, P.face);""")
rep("""  function drawPlayer1(camX, camY) {""", """  // the player's animator: Idle (4 frames), Walk (6), Run (6), Push (6, against a wall), Jump (6: crouch, take-off, rise, top, fall, land), Hurt (3, the middle one red)
  function heroAnim(P, swim) {
    const RUNV = RUN * 0.72, sp = Math.abs(P.vx);
    if (P.hurtA > 0) { const f = Math.min(2, Math.floor((1 - P.hurtA / 0.36) * 3)); return { n: 'hero_hurt', f, red: f === 1 }; }
    if (swim) return { n: 'hero_run6', f: Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 6 };
    if (!P.onGround) { const vy = P.vy, f = P.airT < 0.06 && vy < 0 ? 0 : vy < -140 ? 1 : vy < -40 ? 2 : vy < 80 ? 3 : 4; return { n: 'hero_jump6', f }; }
    if (P.landA > 0) return { n: 'hero_jump6', f: 5 };
    if (P.push > 0) return { n: 'hero_push', f: Math.floor(P.anim * 7) % 6 };
    if (sp > 15) return sp < RUNV || P.slow > 0 ? { n: 'hero_walk', f: Math.floor(P.anim * 9) % 6 } : { n: 'hero_run6', f: Math.floor(P.anim * 12) % 6 };
    return { n: 'hero_idle4', f: Math.floor(P.anim * 4) % 4 };
  }
  function drawPlayer1(camX, camY) {""")

# ---------- everyone else: one stepped animator for monsters, bosses, pets, summons ----------
rep("""  function drawSprT(gc, spr, x, bot, flip, flash, sx, sy, rot, alpha) {""", """  // the shared animator for code-drawn characters: the same six states as the hero, stepped at ~10 fps like pixel art
  // st: 'idle' | 'walk' | 'run' | 'push' | 'jump' | 'hurt'; k: progress for jump (vy) or hurt (0..1). Returns {sx, sy, ox, oy, rot, red}
  function animPose(st, t, dir, k) {
    const F = (fps, n) => Math.floor(t * fps) % n, o = { sx: 1, sy: 1, ox: 0, oy: 0, rot: 0, red: false };
    if (st === 'hurt') { const f = Math.min(2, Math.floor(k * 3)); o.red = f === 1; o.ox = -dir * (f === 2 ? 1 : 2); o.rot = -dir * 0.08; o.sx = 1.06; o.sy = 0.94; return o; }
    if (st === 'jump') { const vy = k || 0; if (vy < -120) { o.sy = 1.12; o.sx = 0.9; } else if (vy < 60) { o.sy = 1.02; o.sx = 0.98; o.rot = dir * 0.04; } else { o.sy = 1.08; o.sx = 0.94; o.rot = -dir * 0.04; } return o; }
    if (st === 'push') { const f = F(7, 6); o.rot = dir * 0.14; o.ox = dir * 1; o.oy = f % 3 === 1 ? -1 : 0; o.sx = 1.04; return o; }
    if (st === 'run') { const f = F(12, 6); o.oy = [0, -2, -1, 0, -2, -1][f]; o.rot = dir * 0.1; o.sy = [0.94, 1.06, 1, 0.94, 1.06, 1][f]; o.sx = 2 - o.sy; return o; }
    if (st === 'walk') { const f = F(9, 6); o.oy = [0, -1, -1, 0, -1, -1][f]; o.rot = dir * [0.03, 0.05, 0.02, 0.03, 0.05, 0.02][f]; o.sy = [0.97, 1.02, 1, 0.97, 1.02, 1][f]; o.sx = 2 - o.sy; return o; }
    const f = F(4, 4); o.sy = [1, 1.025, 1.04, 1.025][f]; o.sx = 2 - o.sy; return o;   // idle: breathing in 4 steps
  }
  function drawSprT(gc, spr, x, bot, flip, flash, sx, sy, rot, alpha) {""")

# monsters: pick the state, then layer the existing behaviour poses on top
rep("""    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, spr = getSprite(c.spr, c.swap || {}, fr, c.out), t = e.t;
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al;
    const ground = e.onGround;""", """    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, t = e.t;
    let spr = getSprite(c.spr, c.swap || {}, fr, c.out);
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al;
    const ground = e.onGround;
    { const sp = Math.abs(e.vx || 0), hurt = e.hitT > 0 || e.flash > 0, flyer = c.ai === 'fly' || c.ai === 'ghost' || c.ai === 'flyshoot' || e.fly;
      const st = hurt ? 'hurt' : (!ground && !flyer ? 'jump' : (e.st === 'block' ? 'push' : (sp > 60 || e.st === 'rush' ? 'run' : (sp > 2 ? 'walk' : 'idle'))));
      const A = animPose(flyer && st !== 'hurt' ? 'idle' : st, t, e.dir || 1, st === 'hurt' ? 1 - clamp(Math.max(e.hitT || 0, e.flash || 0) / 0.18, 0, 1) : e.vy);
      sx = A.sx; sy = A.sy; ox = A.ox; oy = A.oy; rot = A.rot; if (A.red) spr = redOf(spr); }""")
rep("""      else if (mv) { oy = -Math.abs(Math.sin(t * (7 + e.sp / 12))) * 1.6; rot = e.dir * 0.06 * Math.sin(t * 8); sy = 1 + 0.04 * Math.sin(t * 15); }
      else sy = 1 + 0.03 * Math.sin(t * 3);""", """      else if (mv) { }   // walk / run come from animPose
      else { }""")
# bosses: idle breathing, walk steps and a red hurt frame
rep("""    let al = P.al; if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) al = Math.min(al, 0.45);
    drawSprT(g, b.spr, x + P.ox, bot + bob + P.oy, b.dir < 0, b.flash > 0 || tele || b.revT > 0, P.sx * (c.artScale || 1), P.sy * (c.artScale || 1), P.rot, al);""",
    """    let al = P.al; if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) al = Math.min(al, 0.45);
    const bst = b.flash > 0 ? 'hurt' : (!b.onGround && !c.fly && !c.eclipse ? 'jump' : (b.moveT > 0 || b.st === 'evade' ? (Math.abs(b.vx || 0) > 140 ? 'run' : 'walk') : 'idle'));
    const BA = animPose(bst, b.t, b.dir || 1, bst === 'hurt' ? 1 - clamp(b.flash / 0.15, 0, 1) : b.vy), bsx = bst === 'hurt' ? 1 : BA.sx, bsy = bst === 'hurt' ? 1 : BA.sy;
    drawSprT(g, BA.red ? redOf(b.spr) : b.spr, x + P.ox + (bst === 'hurt' ? BA.ox : 0), bot + bob + P.oy + BA.oy, b.dir < 0, (b.flash > 0 && !BA.red) || tele || b.revT > 0, P.sx * bsx * (c.artScale || 1), P.sy * bsy * (c.artScale || 1), P.rot + BA.rot * 0.5, al);""")
# summons (the artist's strips): a red middle frame when hit
rep("""    const n = meta.n, fw = im.width / n, fh = im.height, sc = H / (meta.ch || fh);""", """    const n = meta.n, fw = im.width / n, fh = im.height, sc = H / (meta.ch || fh), red = s.hurtT > 0 && s.hurtT < 0.14 && s.hurtT > 0.06;""")
rep("""      g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      g.restore();""", """      g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      if (red) { g.globalAlpha = 0.75 * a; g.filter = 'brightness(0.75) sepia(1) saturate(9) hue-rotate(-45deg)'; g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc); g.filter = 'none'; }
      g.restore();""")

# pets: idle / walk / run steps
rep("""g.globalAlpha = pt.id === 'ghostie' ? 0.75 : 1; drawSpr(g, sp, Math.round(pt.x - camX + off), Math.round(pt.y - camY + hop), pt.f < 0); g.globalAlpha = 1; }""",
    """const pvx = (pt.x - (pt.lx === undefined ? pt.x : pt.lx)) * 60; pt.lx = pt.x; const PA = animPose(fly ? 'idle' : (Math.abs(pvx) > 90 ? 'run' : Math.abs(pvx) > 8 ? 'walk' : 'idle'), pt.t, pt.f < 0 ? -1 : 1, 0);
      drawSprT(g, sp, Math.round(pt.x - camX + off + PA.ox), Math.round(pt.y - camY + (fly ? hop : 0) + PA.oy), pt.f < 0, false, PA.sx, PA.sy, PA.rot, pt.id === 'ghostie' ? 0.75 : 1); }""")
# NPCs: breathing idle
rep("""        const n = NPCS[it.who], sp = npcSpr(n.spr), bob = Math.round(Math.sin(it.ph * 2) * 0.5 + 0.5);
        drawSpr(g, sp, x, y - bob, Q.P.x + 4 < it.x);""", """        const n = NPCS[it.who], sp = npcSpr(n.spr), bob = 0, NA = animPose('idle', it.ph, 1, 0);
        drawSprT(g, sp, x, y, Q.P.x + 4 < it.x, false, NA.sx, NA.sy, 0);""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
