# Bosses: the dragon's shadow form no longer freezes (a dive that could never reach its end point + a safety timer on
# every skill), nothing leaves the map or ends up inside a wall (moves are cut into short steps, embedded bodies are
# pushed out, bosses are kept inside the arena's real walls), Shorty no longer gets stuck on the left, bosses move
# with more sense (approach or keep their distance for the attack they are about to use, turn smoothly, hop out of a
# wall or corner, unstick themselves), and walking bosses swing their legs.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:110]
    s = s.replace(a, b)

# ---------- physics helpers: no tunnelling through walls, pushing embedded bodies back out ----------
rep("""  function moveX(e, dx) {
    e.x += dx;""", """  function moveX(e, dx) {
    if (dx > 8 || dx < -8) { const n = Math.ceil(Math.abs(dx) / 8), st = dx / n; for (let i = 0; i < n; i++) if (moveX(e, st)) return true; return false; }   // big moves in short steps: no tunnelling through walls
    e.x += dx;""")
rep("""  function crumbleStart(tx, ty) {""", """  // is any solid tile inside this body?
  function overlapsSolid(e) {
    const x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - 0.01) / TS), y0 = Math.floor(e.y / TS), y1 = Math.floor((e.y + e.h - 0.01) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solid(tx, ty)) return true;
    return false;
  }
  // a body stuck inside a wall is moved to the nearest free spot (preferring the given side, then the other side, then up)
  function unembed(e, prefDir) {
    if (!overlapsSolid(e)) return false;
    const ox = e.x, oy = e.y, d = prefDir < 0 ? -1 : 1;
    for (let k = 1; k <= 48; k++) for (const [dx, dy] of [[d * k, 0], [-d * k, 0], [0, -k]]) { e.x = ox + dx; e.y = oy + dy; if (!overlapsSolid(e)) return true; }
    e.x = ox; e.y = oy; return false;
  }
  function crumbleStart(tx, ty) {""")

# ---------- the arena's real inner walls (the seal wall, the duel walls) ----------
rep("  const arenaClamp = x => clamp(x, Q.L.arena.x0 * TS + 24, Q.L.arena.x1 * TS - 24);",
    """  // the free space inside the arena: from its middle, out to the first wall on each side
  function arenaInner() {
    const ar = Q.L.arena, row = Math.max(0, ar.gy - 2), mid = Math.floor((ar.x0 + ar.x1) / 2); let l = mid, r = mid;
    while (l > ar.x0 - 1 && !solid(l - 1, row)) l--; while (r < ar.x1 + 1 && !solid(r + 1, row)) r++;
    return [l * TS, (r + 1) * TS];
  }
  const arenaClamp = x => { const [a, b] = arenaInner(); return clamp(x, a + 24, b - 24); };
  const arenaClampB = (bs, x) => { const [a, b] = arenaInner(); return clamp(x, a + bs.w / 2 + 2, b - bs.w / 2 - 2); };   // a centre that keeps the whole body inside""")
rep("let nx = P.x + 4 + (Math.random() < 0.5 ? -1 : 1) * 70; nx = arenaClamp(nx); b.x = nx - b.w / 2;",
    "let nx = P.x + 4 + (Math.random() < 0.5 ? -1 : 1) * 70; nx = arenaClampB(b, nx); b.x = nx - b.w / 2;")
rep("b.lockx = clamp(b.mx, ar.x0 * TS + 30, ar.x1 * TS - 30); }", "b.lockx = arenaClampB(b, b.mx); }")

# ---------- 1) the dragon: the dive always reaches its end, and every skill has a safety timer ----------
rep("d.sx = d.side > 0 ? (tr.lw + 4) * TS : (tr.rw - 4) * TS; d.ex = d.side > 0 ? (tr.rw - 3) * TS : (tr.lw + 3) * TS; d.dir = d.side; },",
    "d.sx = d.side > 0 ? (tr.lw + 4) * TS : (tr.rw - 4) * TS; d.ex = d.side > 0 ? (tr.rw - 3) * TS : (tr.lw + 3) * TS; d.dir = d.side;\n"
    "        const lo = (tr.lw + 1) * TS + d.w / 2 + 2, hi = tr.rw * TS - d.w / 2 - 2; d.sx = clamp(d.sx, lo, hi); d.ex = clamp(d.ex, lo, hi); },   // a wide dragon (shadow form) could never reach the old end point and dived forever")
rep("      case 'act': if (DS[d.sk].upd(d, dt)) { d.st = 'rec'; d.timer = 0.7 / d.fury; d.lastSk = d.sk; d.sk = null; } break;",
    "      case 'act': {\n"
    "        d.actT = (d.actT || 0) + dt;   // safety: no skill may run longer than its limit\n"
    "        if (DS[d.sk].upd(d, dt) || d.actT > (DS_MAX[d.sk] || 4)) { d.hide = false; d.ph = 0; d.st = 'rec'; d.timer = 0.7 / d.fury; d.lastSk = d.sk; d.sk = null; d.actT = 0; }\n"
    "        break;\n      }")
rep("        if (d.timer <= 0) { d.sk = d.atkSk; DS[d.sk].start(d); d.st = 'act'; } break;",
    "        if (d.timer <= 0) { d.sk = d.atkSk; d.actT = 0; DS[d.sk].start(d); d.st = 'act'; } break;")
rep("  function makeDragon(def) {", "  const DS_MAX = { dive: 3.5, perch: 5.5, breath: 2.6, tripleBreath: 2.6, shadowBreath: 2.8, fireballs: 4, gust: 3, roar: 2.5, tailsweep: 2.2, summon: 2, vanish: 2.5, darkness: 2.5 };\n  function makeDragon(def) {")

# ---------- every boss skill ends on time too ----------
rep("      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; bossSkillSnd(b.sk); } break;",
    "      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; b.actT = 0; BS[b.sk].start(b); b.st = 'act'; bossSkillSnd(b.sk); } break;")
rep("      case 'act': { const sk = BS[b.sk]; if (sk.upd(b, dt)) endSkill(b); break; }",
    "      case 'act': { const sk = BS[b.sk]; b.actT = (b.actT || 0) + dt; if (sk.upd(b, dt) || b.actT > 7) endSkill(b); break; }   // (safety timer)")
rep("    if (b.hide) { const sk = BS[b.sk]; if (sk && sk.upd(b, dt)) endSkill(b); return; }",
    "    if (b.hide) { const sk = BS[b.sk]; b.actT = (b.actT || 0) + dt; if (!sk || sk.upd(b, dt)) endSkill(b); else if (b.actT > 7) bossReturn(b); return; }")
rep("  function endSkill(b) {", """  // a boss that got lost (hidden too long, outside the arena, below the map): back to the middle of the arena, on the ground
  function bossReturn(b) {
    const [a, c] = arenaInner(), cx = (a + c) / 2; b.hide = false; b.sk = null; b.st = 'rec'; b.timer = 0.6; b.ph = 0; b.actT = 0;
    b.x = cx - b.w / 2; b.y = Q.L.arena.gy * TS - b.h - 2; b.vy = 0; unembed(b, 1); addGhost(b, 'in'); emit(cx, b.y + b.h / 2, 16, { col: ['#a15be0', '#fff'], sp0: 20, sp1: 80 });
  }
  function endSkill(b) {""")

# ---------- 4) smarter movement in 'wait': spacing for the next attack, smooth turns, getting out of walls and corners ----------
rep("""      case 'wait': {
        b.dir = dxp < 0 ? -1 : 1;""", """      case 'wait': {
        { const wd = dxp < 0 ? -1 : 1; if (wd !== b.dir && Math.abs(dxp) > 10) { b.turnT = (b.turnT || 0) + dt; if (b.turnT > 0.14) { b.dir = wd; b.turnT = 0; b.squashT = Math.max(b.squashT || 0, 0.08); } } else b.turnT = 0; }   // turn with a short delay, not every frame
        if (!b.nextSk) b.nextSk = pickSkill(b);   // the next attack is chosen early, so the boss can move into the right range for it""")
rep("""        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * Math.max(c.sp, 45) * (far ? 1.7 : 1.15) * b.fury * dt); b.moveT = 0.12; }""",
    """        { const rg = bossRange(b.nextSk), gap = Math.abs(dxp) - b.w / 2, sd = Math.sign(dxp) || 1;
          let mv = gap > rg[1] ? sd : (gap < rg[0] ? -sd : 0);   // approach for close attacks, keep away for ranged ones
          const [ia, ib] = arenaInner(); if (mv < 0 && ((mv > 0 ? b.x + b.w > ib - 20 : b.x < ia + 20) || (sd < 0 ? b.x + b.w > ib - 20 : false))) mv = 0;   // no backing into a wall
          if (mv < 0 && ((sd > 0 && b.x < ia + 24) || (sd < 0 && b.x + b.w > ib - 24))) mv = 0;
          const tv = mv * Math.max(c.sp, 45) * (far ? 1.7 : (mv < 0 ? 0.85 : 1.15)) * b.fury; b.mvV = lerp(b.mvV || 0, tv, Math.min(1, 7 * dt));   // speeds up and slows down smoothly
          if (Math.abs(b.mvV) > 4) {
            const x0 = b.x, blocked = moveX(b, b.mvV * dt); b.moveT = 0.12; b.mvSpd = Math.abs(b.mvV);
            if (blocked && b.onGround && mv > 0 && Math.random() < dt * 4) { b.vy = -340; b.onGround = false; }   // hop over a step or out of a corner
            b.stillT = Math.abs(b.x - x0) < 0.2 ? (b.stillT || 0) + dt : 0;
          } else { b.stillT = 0; b.mvSpd = 0; }
          if (b.stillT > 1.2 && b.onGround) { b.vy = -380; b.onGround = false; b.mvV = -b.mvV * 0.5; b.stillT += 0.01; }   // stuck: jump out
          if (b.stillT > 2.6) { b.stillT = 0; bossReturn(b); }   // still stuck: reappear in the middle of the arena
        }""")
rep("""          b.atkSk = b.closeT > 1.5 ? 'stomp' : pickSkill(b); b.closeT = 0; b['u_' + b.atkSk] = Q.t;""",
    """          b.atkSk = b.closeT > 1.5 ? 'stomp' : (b.nextSk || pickSkill(b)); b.nextSk = null; b.closeT = 0; b['u_' + b.atkSk] = Q.t;""")
rep("  function pickSkill(b) {", """  // how far a boss wants to stand from the hero before an attack: [nearest, farthest] gap in pixels
  const MELEE_L = ['stomp', 'slam', 'jump', 'bounce3', 'charge', 'rush', 'sweep', 'spin', 'tentacles', 'roar', 'guard'];
  const bossRange = sk => (!sk ? [10, 70] : MELEE_L.indexOf(sk) >= 0 ? [-999, 26] : (RANGE_L.indexOf(sk) >= 0 || CAST_L.indexOf(sk) >= 0) ? [90, 170] : [10, 80]);
  function pickSkill(b) {""")

# ---------- 2/3) every frame: a boss stays inside the arena's real walls and is pushed out of any wall ----------
rep("""    if (!b.hide) hitPlB({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer((Q.li >= 3 ? 2 : 1) + ((b.pp || 0) >= 2 ? 1 : 0), cxm));
  }""", """    if (!b.hide && Q.arenaSealed) {   // keep the boss inside: real walls, map bottom, no body inside a wall
      const [ia, ib] = arenaInner(); if (b.x < ia) b.x = ia; if (b.x + b.w > ib) b.x = ib - b.w;
      if (b.y > Q.L.H * TS) bossReturn(b); else unembed(b, (b.x + b.w / 2) < (ia + ib) / 2 ? 1 : -1);
    }
    if (!b.hide) hitPlB({ x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 }, () => hurtPlayer((Q.li >= 3 ? 2 : 1) + ((b.pp || 0) >= 2 ? 1 : 0), cxm));
  }""")

# ---------- 2) the hero: never inside a wall, never outside the map sideways ----------
rep("""    if (P.vineCd > 0) P.vineCd -= dt;""", """    if (!P.vine) { unembed(P, P.face || 1); P.x = clamp(P.x, 0, Q.L.W * TS - P.w); }   // never inside a wall, never past the map's sides
    if (P.vineCd > 0) P.vineCd -= dt;""")
# monsters too: never past the map's sides
rep("          if (e.y > Q.L.H * TS + 20) e.dead = true;", "          if (e.y > Q.L.H * TS + 20) e.dead = true; if (e.x < 0) e.x = 0; else if (e.x + e.w > Q.L.W * TS) e.x = Q.L.W * TS - e.w;")

# ---------- 5) walking bosses swing their legs (the lower part of the picture sways like a stride) ----------
rep("""    const bst = b.flash > 0 ? 'hurt' : (!b.onGround && !c.fly && !c.eclipse ? 'jump' : (b.moveT > 0 || b.st === 'evade' ? (Math.abs(b.vx || 0) > 140 ? 'run' : 'walk') : 'idle'));""",
    """    const bst = b.flash > 0 ? 'hurt' : (!b.onGround && !c.fly && !c.eclipse ? 'jump' : (b.moveT > 0 || b.st === 'evade' ? ((b.mvSpd || 0) > 75 || b.st === 'evade' || Math.abs(b.vx || 0) > 140 ? 'run' : 'walk') : 'idle'));""")
rep("""    drawSprT(g, BA.red ? redOf(b.spr) : b.spr, x + P.ox + (bst === 'hurt' ? BA.ox : 0), bot + bob + P.oy + BA.oy, b.dir < 0, (b.flash > 0 && !BA.red) || tele || b.revT > 0, P.sx * bsx * (c.artScale || 1), P.sy * bsy * (c.artScale || 1), P.rot + BA.rot * 0.5, al);""",
    """    { const walker = (bst === 'walk' || bst === 'run') && b.onGround && !c.fly && !c.eclipse && !c.swim && !c.art, img = BA.red ? redOf(b.spr) : b.spr, fl = (b.flash > 0 && !BA.red) || tele || b.revT > 0;
      const dx = x + P.ox + (bst === 'hurt' ? BA.ox : 0), dy = bot + bob + P.oy + BA.oy, ksx = P.sx * bsx * (c.artScale || 1), ksy = P.sy * bsy * (c.artScale || 1), rt = P.rot + BA.rot * 0.5;
      if (walker) drawBossStride(img, dx, dy, b.dir < 0, fl, ksx, ksy, rt, al, b.t * (bst === 'run' ? 13 : 8), bst === 'run' ? 0.28 : 0.18, b);
      else drawSprT(g, img, dx, dy, b.dir < 0, fl, ksx, ksy, rt, al); }""")
rep("  function drawBoss(camX, camY) {", """  // a walking stride for one-picture bosses: the top sways a little, the bottom third swings like legs, dust at each step
  function drawBossStride(spr, x, bot, flip, flash, sx, sy, rot, al, ph, amp, b) {
    const H = spr.h * sy, cut = bot - H * 0.34, sw = Math.sin(ph), bob = -Math.abs(Math.sin(ph)) * 1.5;
    g.save(); g.beginPath(); g.rect(x - spr.w * sx, bot - H - 4, spr.w * sx * 2, H * 0.66 + 4); g.clip(); drawSprT(g, spr, x, bot + bob, flip, flash, sx, sy, rot + sw * 0.03, al); g.restore();
    g.save(); g.beginPath(); g.rect(x - spr.w * sx, cut, spr.w * sx * 2, H * 0.34 + 2); g.clip(); g.translate(x, bot); g.transform(1, 0, sw * amp, 1, 0, 0); g.translate(-x, -bot); drawSprT(g, spr, x, bot, flip, flash, sx, sy, rot, al); g.restore();
    if (Math.abs(sw) > 0.97 && (b.stepFx || 0) < Q.t) { b.stepFx = Q.t + 0.12; emit(b.x + b.w / 2 + Math.sign(sw) * b.w * 0.25, b.y + b.h, 3, { col: ['#cfd6e6', '#8a8aa0'], sp0: 5, sp1: 25, vy: -12, grav: 40, l0: 0.2, l1: 0.4 }); }
  }
  function drawBoss(camX, camY) {""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
