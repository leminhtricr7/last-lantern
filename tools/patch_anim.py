import io
# ---------------- audio ----------------
p = 'src/audio.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


rep("    flap() {", "    poof() { noise(0.28, 0.2, 1800); tone(500, 0.25, 'sine', 0.1, 600); },\n    clang() { tone(1500, 0.08, 'square', 0.12, -400); tone(2200, 0.1, 'triangle', 0.08, -800); noise(0.05, 0.12, 4000); },\n    whoosh() { noise(0.3, 0.16, 600); tone(200, 0.3, 'triangle', 0.08, 300); },\n    flap() {")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------------- game ----------------
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()

# ---- enemy configs: new behaviours
rep("    ghost: { spr: 'ghost', swap: { w: 'c', k: 'B' }, out: '#6ee7f2', w: 10, h: 11, hp: 2, sp: 34, ai: 'ghost' },", "    ghost: { spr: 'ghost', swap: { w: 'c', k: 'B' }, out: '#6ee7f2', w: 10, h: 11, hp: 2, sp: 34, ai: 'ghost', blink: true },")
rep("    wisp: { spr: 'wisp', w: 8, h: 8, hp: 1, sp: 46, ai: 'fly' },", "    wisp: { spr: 'wisp', w: 8, h: 8, hp: 1, sp: 46, ai: 'ghost', blink: true },")
rep("    shadewisp: { spr: 'wisp', swap: { c: 'p', w: 'm' }, out: '#a15be0', w: 8, h: 8, hp: 1, sp: 50, ai: 'fly' },", "    shadewisp: { spr: 'wisp', swap: { c: 'p', w: 'm' }, out: '#a15be0', w: 8, h: 8, hp: 1, sp: 50, ai: 'ghost', blink: true },")
rep("    knight: { spr: 'knight', out: '#a15be0', w: 10, h: 15, hp: 5, sp: 34, ai: 'charge' },", "    knight: { spr: 'knight', out: '#a15be0', w: 10, h: 15, hp: 5, sp: 34, ai: 'charge', block: true },")
rep("hp: 4, sp: 30, ai: 'charge' },\n    scorpion:", "hp: 4, sp: 30, ai: 'charge', block: true },\n    scorpion:")
rep("    scorpion: { spr: 'scorpion', w: 14, h: 7, hp: 2, sp: 38, ai: 'walk' },", "    scorpion: { spr: 'scorpion', w: 14, h: 7, hp: 2, sp: 38, ai: 'walk', burrow: true },")
rep("    sandbeetle: { spr: 'beetle', swap: { n: 'Y', N: 'n', r: 'k' }, w: 10, h: 6, hp: 1, sp: 40, ai: 'walk' },", "    sandbeetle: { spr: 'beetle', swap: { n: 'Y', N: 'n', r: 'k' }, w: 10, h: 6, hp: 1, sp: 40, ai: 'walk', burrow: true },")
rep("hp, maxhp: hp, sc, v, armor,", "hp, maxhp: hp, sc, v, armor, bcd: rr(1, 3), spawnT: (s && s.minion) ? 0.4 : 0,")

# ---- effects infra + poses (inserted before the dragon block)
rep("  // ===================== DRAGON =====================", u"""  // ===================== ANIMATION / EFFECTS =====================
  function addRing(x, y, col, max, dur) { Q.rings.push({ x, y, col, max: max || 60, dur: dur || 0.45, t: 0 }); }
  function addGhost(b, type) { Q.ghosts.push({ spr: b.spr, x: b.x + b.w / 2, bot: b.y + b.h, flip: b.dir < 0, type, t: 0, dur: 0.32 }); }
  function drawSprT(gc, spr, x, bot, flip, flash, sx, sy, rot, alpha) {
    const img = flash ? (flip ? spr.fw : spr.cw) : (flip ? spr.f : spr.c);
    gc.save(); gc.translate(Math.round(x), Math.round(bot)); if (rot) gc.rotate(rot); if (alpha !== undefined && alpha < 1) gc.globalAlpha = Math.max(0, alpha);
    gc.drawImage(img, -spr.w * sx / 2, -spr.h * sy + sx, spr.w * sx, spr.h * sy); gc.restore();
  }
  function drawAura(x, y, r, col, a) {
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col + Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0')); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over';
  }
  function drawCircle(x, y, r, col, t) {
    g.fillStyle = col; g.globalAlpha = 0.75;
    for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.22), 2, 1); }
    for (let i = 0; i < 8; i++) { const a = t * 1.5 + i * Math.PI / 4; g.fillRect(Math.round(x + Math.cos(a) * (r - 6)), Math.round(y + Math.sin(a) * (r - 6) * 0.22) - 1, 2, 3); }
    g.globalAlpha = 1;
  }
  function updateFx(dt) {
    for (const r of Q.rings) r.t += dt; Q.rings = Q.rings.filter(r => r.t < r.dur);
    for (const o of Q.ghosts) o.t += dt; Q.ghosts = Q.ghosts.filter(o => o.t < o.dur);
    for (const c of Q.corpses) { c.t += dt; c.x += c.vx * dt; c.bot += c.vy * dt; c.vy += 520 * dt; c.rot += c.rv * dt; } Q.corpses = Q.corpses.filter(c => c.t < 0.6);
  }
  function drawFx(camX, camY) {
    for (const r of Q.rings) {
      const k = r.t / r.dur, rd = r.max * (1 - Math.pow(1 - k, 2)), n = Math.max(16, Math.round(rd * 1.2)), x = r.x - camX, y = r.y - camY;
      g.globalAlpha = 1 - k; g.fillStyle = r.col;
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * rd), Math.round(y + Math.sin(a) * rd * 0.22), 2, 1); }
      g.globalAlpha = 1;
    }
    for (const o of Q.ghosts) {
      const k = o.t / o.dur, out = o.type === 'out', a = out ? 1 - k : k, sx = out ? 1 - 0.55 * k : 0.45 + 0.55 * k, sy = out ? 1 + 0.5 * k : 1.5 - 0.5 * k;
      drawSprT(g, o.spr, o.x - camX, o.bot - camY, o.flip, o.type === 'in' && k < 0.4, sx, sy, 0, a);
    }
    for (const c of Q.corpses) {
      const k = c.t / 0.6, sc = c.sc * (1 - 0.65 * k);
      drawSprT(g, c.spr, c.x - camX, c.bot - camY, c.flip, c.t < 0.09, sc, sc, c.rot, 1 - k);
    }
  }
  const SLAM_L = ['jump', 'stomp', 'bounce3', 'slam', 'ambush'], RANGE_L = ['shoot', 'web', 'spit', 'curse', 'breath', 'spin', 'rain', 'beam'], CAST_L = ['summon', 'splitslime', 'goo', 'erupt', 'tornado', 'dark', 'clone', 'meteor', 'lavaCols', 'sweep', 'roar', 'wall', 'blizzard'];
  function bossPose(b) {
    const t = b.t, dir = b.dir < 0 ? -1 : 1, sk = b.st === 'tele' ? b.atkSk : b.sk, br = Math.sin(t * 3);
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al = 1, aura = null, circle = false;
    if (b.st === 'wait') { if (b.moveT > 0) { sy = 1 + 0.035 * Math.sin(t * 11); rot = dir * 0.045 * Math.sin(t * 11); oy = -Math.abs(Math.sin(t * 11)) * 2.2; } else { sy = 1 + 0.025 * br; sx = 1 - 0.015 * br; } }
    else if (b.st === 'tele' && BS[b.atkSk]) {
      const k = clamp(1 - b.timer / (BS[b.atkSk].tele / b.fury), 0, 1), j = (Math.random() - 0.5) * 2 * k;
      if (SLAM_L.indexOf(sk) >= 0) { sy = 1 - 0.22 * k; sx = 1 + 0.14 * k; ox = j * 1.2; }
      else if (sk === 'charge') { rot = -dir * 0.16 * k; sx = 1 + 0.06 * k; ox = -dir * 3 * k + j; }
      else if (RANGE_L.indexOf(sk) >= 0) { sy = 1 + 0.08 * k; sx = 1 - 0.05 * k; oy = -2 * k; rot = -dir * 0.07 * k; aura = [Q.B.proj, 0.5 * k]; }
      else if (sk === 'guard' || sk === 'shield') { sy = 1 - 0.1 * k; sx = 1 + 0.1 * k; aura = ['#6ee7f2', 0.5 * k]; }
      else if (sk === 'cloak' || sk === 'teleport') { sx = 1 - 0.3 * k; sy = 1 + 0.1 * k; al = 1 - 0.55 * k; aura = ['#a15be0', 0.5 * k]; }
      else { oy = -5 * k; sy = 1 + 0.1 * k; rot = j * 0.05; aura = [Q.B.proj, 0.6 * k]; circle = true; }
    } else if (b.st === 'act') {
      if (SLAM_L.indexOf(b.sk) >= 0 && !b.onGround) { const st = clamp(Math.abs(b.vy) / 1400, 0, 0.2); sy = 1 + st; sx = 1 - st * 0.7; rot = dir * 0.05; }
      else if (b.sk === 'charge') { sx = 1.14; sy = 0.92; rot = dir * 0.2; }
      else if (b.sk === 'guard' || b.sk === 'shield') { sy = 0.92; sx = 1.08; }
      else if (CAST_L.indexOf(b.sk) >= 0) { oy = -4 + Math.sin(t * 6) * 1.2; sy = 1.05; circle = true; aura = [Q.B.proj, 0.35]; }
      else if (RANGE_L.indexOf(b.sk) >= 0) { sy = 1.03; aura = [Q.B.proj, 0.25]; }
    } else if (b.st === 'rec') { sy = 0.95 + 0.02 * Math.sin(t * 5); sx = 1.04; }
    else if (b.st === 'stun') { rot = Math.sin(t * 14) * 0.12; sy = 0.9; sx = 1.06; }
    else if (b.st === 'evade') { rot = (b.ed || 1) * -0.2; sx = 1.08; sy = 0.94; }
    else if (b.st === 'intro') { const k = Math.min(1, b.timer / 1.2); sy = 0.8 + 0.2 * k; sx = 1.1 - 0.1 * k; aura = [Q.B.proj, 0.4 * (1 - k)]; }
    if (b.squashT > 0) { const k = b.squashT / 0.22; sy *= 1 - 0.32 * k; sx *= 1 + 0.28 * k; }
    if (b.kick > 0) { const k = b.kick / 0.16; sx *= 1 + 0.12 * k; ox -= dir * 3 * k; }
    if (b.cloak) al = 0.1 + 0.07 * Math.sin(t * 9);
    if (b.guard > 0) { sx *= 1.05; sy *= 0.94; }
    return { sx, sy, rot, ox, oy, al, aura, circle };
  }

  // ===================== DRAGON =====================""")

# ---- new boss skills
rep("    clone: { tele: 0.6,", u"""    slam: { tele: 0.8, start(b) { b.vy = -250; b.vx = 0; b.onGround = false; b.jt = 0; b.ph = 0; },
      upd(b, dt) {
        b.jt += dt;
        if (b.ph === 0 && b.vy > 0) { b.ph = 1; b.vy = 540; Snd.play('whoosh'); }
        if (b.ph === 1 && b.onGround) { shockwave(b); const c = bc(b); for (let i = 1; i <= 4; i++) for (const sg of [-1, 1]) { const x = arenaClamp(c.x + sg * i * 24); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 30, w: 14, h: 30, tel: 0.15 + i * 0.08, life: 0.4 }); } return true; }
      } },
    roar: { tele: 0.6, start(b) { Q.shake = 0.9; Snd.creature(Q.li, 'alert', true); const c = bc(b); addRing(c.x, b.y + b.h, Q.B.proj, 95, 0.7); shockwave(b, true); b.kick = 0.16; b.skT = 1.0; b.rt = 0; }, upd(b, dt) { b.skT -= dt; b.rt -= dt; if (b.rt <= 0 && b.skT > 0.3) { b.rt = 0.28; addRing(b.x + b.w / 2, b.y + b.h, Q.B.proj, 70, 0.5); } return b.skT <= 0; } },
    guard: { tele: 0.4, start(b) { b.guard = 3; b.skT = 3; b.recAfter = 0.4; Snd.play('gate'); addRing(b.x + b.w / 2, b.y + b.h, '#6ee7f2', 50, 0.5); }, upd: wait },
    cloak: { tele: 0.5, start(b) { b.cloak = true; b.skT = 3.0; b.ph = 0; addGhost(b, 'out'); Snd.whisper(); Snd.play('poof'); },
      upd(b, dt) {
        const P = Q.P, c = bc(b), dx = (P.x + 4) - c.x;
        if (b.ph === 0) {
          b.skT -= dt; b.dir = dx < 0 ? -1 : 1; moveX(b, b.dir * b.cfg.sp * 1.7 * dt);
          if (Math.random() < 0.3) emit(c.x + rr(-b.w / 2, b.w / 2), b.y + b.h, 1, { col: ['#a15be0', '#fff'], sp0: 3, sp1: 14, grav: -10, l0: 0.3, l1: 0.6 });
          if (Math.abs(dx) < 48 || b.skT <= 0) { b.ph = 1; b.cloak = false; b.revT = 0.3; b.vy = -210; b.onGround = false; b.jt = 0; b.vx = 0; addGhost(b, 'in'); Snd.creature(Q.li, 'attack', true); Snd.play('poof'); }
        } else { b.jt += dt; if (b.onGround && b.jt > 0.15) { shockwave(b); return true; } }
      } },
    clone: { tele: 0.6,""")
rep("const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush']", "const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush', 'slam', 'cloak']")
rep("if ((k === 'shield' || k === 'summon' || k === 'dark' || k === 'clone') && Q.t - (b['u_' + k] || -99) < 12) w *= 0.08;", "if ((k === 'shield' || k === 'summon' || k === 'dark' || k === 'clone' || k === 'guard' || k === 'cloak') && Q.t - (b['u_' + k] || -99) < 12) w *= 0.08;")
# skill lists
for old, new in [
    ("skills: ['jump', 'bounce3', 'goo', 'splitslime', 'stomp'], skills2: ['shoot'] }", "skills: ['jump', 'bounce3', 'goo', 'splitslime', 'stomp', 'guard'], skills2: ['shoot', 'slam'] }"),
    ("skills: ['charge', 'web', 'spit', 'ambush', 'summon'], skills2: ['jump'] }", "skills: ['charge', 'web', 'spit', 'ambush', 'summon', 'cloak'], skills2: ['jump', 'roar'] }"),
    ("skills: ['jump', 'erupt', 'shield', 'beam', 'rain'], skills2: ['charge'] }", "skills: ['jump', 'erupt', 'shield', 'beam', 'rain', 'slam'], skills2: ['charge', 'roar'] }"),
    ("skills: ['curse', 'tornado', 'summon', 'teleport', 'shoot', 'charge'], skills2: ['spin'] }", "skills: ['curse', 'tornado', 'summon', 'teleport', 'shoot', 'charge', 'cloak'], skills2: ['spin', 'roar'] }"),
    ("skills: ['breath', 'wall', 'blizzard', 'rain', 'jump', 'spin'], skills2: ['shield', 'summon'] }", "skills: ['breath', 'wall', 'blizzard', 'rain', 'jump', 'spin', 'guard'], skills2: ['shield', 'summon', 'slam', 'roar'] }"),
    ("skills: ['lavaCols', 'meteor', 'sweep', 'charge', 'shield', 'jump'], skills2: ['spin', 'summon'] }", "skills: ['lavaCols', 'meteor', 'sweep', 'charge', 'shield', 'jump', 'slam'], skills2: ['spin', 'summon', 'roar'] }"),
    ("skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado'], skills2: ['dark', 'clone', 'summon'], skills3: ['shield', 'meteor'] }", "skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado', 'cloak'], skills2: ['dark', 'clone', 'summon', 'roar'], skills3: ['shield', 'meteor', 'guard', 'slam'] }")]:
    rep(old, new)

# teleport / ambush / vanish ghost effects
rep("    teleport: { tele: 0.3, start(b) { b.hide = true;", "    teleport: { tele: 0.3, start(b) { addGhost(b, 'out'); Snd.play('poof'); b.hide = true;")
rep("b.hide = false; b.ph = 1; b.skT = 0.45; emit(nx, b.y + b.h / 2, 20,", "b.hide = false; b.ph = 1; b.skT = 0.45; addGhost(b, 'in'); addRing(nx, b.y + b.h, '#a15be0', 50, 0.4); Snd.play('poof'); emit(nx, b.y + b.h / 2, 20,")
rep("    ambush: { tele: 0.7, start(b) { b.hide = true;", "    ambush: { tele: 0.7, start(b) { addGhost(b, 'out'); Snd.play('poof'); b.hide = true;")

# shockwave ring
rep("    const c = bc(b); Q.shake = small ? 0.25 : 0.5; Snd.play('boom');", "    const c = bc(b); Q.shake = small ? 0.25 : 0.5; Snd.play('boom'); addRing(c.x, b.y + b.h, Q.B.proj, small ? 55 : 90, 0.5);")

# updateBoss: timers, moveT, landing squash
rep("if (b.evCd > 0) b.evCd -= dt; if (b.invul > 0) b.invul -= dt;\n    b.fury", "if (b.evCd > 0) b.evCd -= dt; if (b.invul > 0) b.invul -= dt;\n    if (b.squashT > 0) b.squashT -= dt; if (b.kick > 0) b.kick -= dt; if (b.guard > 0) b.guard -= dt; if (b.revT > 0) b.revT -= dt; if (b.moveT > 0) b.moveT -= dt;\n    b.fury")
rep("        if (Math.abs(dxp) > b.w / 2 + 36) moveX(b, b.dir * c.sp * b.fury * dt);", "        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * c.sp * b.fury * dt); b.moveT = 0.12; }")
rep("    moveY(b, b.vy * dt);\n    if (!b.hide && ov(P, { x: b.x + 3,", "    { const was = b.onGround, pvy = b.vy; moveY(b, b.vy * dt); if (b.onGround && !was && pvy > 140) { b.squashT = 0.22; addRing(cxm, b.y + b.h, '#cfd6e6', 34 + Math.min(40, pvy / 9), 0.4); emit(cxm, b.y + b.h, 8, { col: '#cfd6e6', sp0: 20, sp1: 70, vy: -15, grav: 40 }); } }\n    if (!b.hide && ov(P, { x: b.x + 3,")
# guard in hurtBoss
rep("    const arm = b.cfg.armor || 0, eff = dmg * (1 - arm * (pierce ? 0.4 : 1)) * ((b.st === 'stun' || b.st === 'rec') ? 1.25 : 1);",
    "    let gm = 1; if (b.guard > 0) { if (!pierce) { gm = 0.15; Snd.play('clang'); emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 120 }); } else gm = 0.6; }\n    const arm = b.cfg.armor || 0, eff = dmg * gm * (1 - arm * (pierce ? 0.4 : 1)) * ((b.st === 'stun' || b.st === 'rec') ? 1.25 : 1);")
# kick from firing
rep("if (!(o && o.silent)) Snd.play('shoot'); }", "if (!(o && o.silent)) Snd.play('shoot'); if (o && o.boss && Q.boss && !Q.boss.dead) Q.boss.kick = 0.16; }")

# drawBoss rewrite
a = s.index("  function drawBoss(camX, camY) {")
b = s.index("  function drawPlayer(camX, camY) {")
s = s[:a] + u"""  function drawBoss(camX, camY) {
    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;
    const c = b.cfg, x = Math.round(b.x + b.w / 2 - camX), bot = Math.round(b.y + b.h - camY), gyy = Math.round(Q.L.arena.gy * TS - camY);
    if (b.hide) {
      if (b.sk === 'ambush' && b.ph >= 1) {
        const mx = Math.round((b.ph === 1 ? b.mx : b.lockx) - camX), bl = Math.floor(Q.t * 14) % 2;
        g.globalAlpha = 0.5; g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(mx - 20, gyy - 2, 40, 2); g.fillRect(mx - 1, gyy - 16, 2, 8); g.fillRect(mx - 1, gyy - 6, 2, 2); g.globalAlpha = 1;
      }
      return;
    }
    const hgt = Math.max(0, gyy - bot), sw = Math.round(b.w * (0.95 - Math.min(0.5, hgt / 180)));
    g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(x - (sw >> 1), gyy - 1, sw, 3);
    if (c.eclipse) { g.globalAlpha = 0.25 + Math.sin(b.t * 3) * 0.1; disc(g, x, bot - 40, 40, '#7a4cff'); g.globalAlpha = 1; }
    const P = bossPose(b), tele = b.st === 'tele' && Math.floor(b.t * 18) % 2 === 0, bob = c.eclipse ? Math.round(Math.sin(b.t * 3) * 3) : 0;
    if (P.circle) drawCircle(x, gyy - 2, Math.round(b.w * 0.8) + 10, Q.B.proj, Q.t);
    if (P.aura && P.aura[1] > 0.02) drawAura(x, bot - (b.h >> 1), Math.round(b.h * 0.9), P.aura[0].length === 7 ? P.aura[0] : '#ff9a2a', P.aura[1]);
    if (b.st === 'evade') { g.globalAlpha = 0.35; drawSprT(g, b.spr, x - b.ed * 14, bot, b.dir < 0, false, 1, 1, 0, 0.35); g.globalAlpha = 1; }
    if (b.sk === 'charge' && b.st === 'act') { g.globalAlpha = 0.25; drawSprT(g, b.spr, x - b.dir * 12, bot, b.dir < 0, false, 1.1, 0.92, b.dir * 0.2, 0.25); drawSprT(g, b.spr, x - b.dir * 24, bot, b.dir < 0, false, 1.05, 0.95, b.dir * 0.2, 0.15); g.globalAlpha = 1; }
    let al = P.al; if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) al = Math.min(al, 0.45);
    drawSprT(g, b.spr, x + P.ox, bot + bob + P.oy, b.dir < 0, b.flash > 0 || tele || b.revT > 0, P.sx, P.sy, P.rot, al);
    if (b.cloak && Math.random() < 0.5) { g.fillStyle = Math.random() < 0.5 ? '#a15be0' : '#fff'; g.fillRect(x + Math.round(rr(-b.w / 2, b.w / 2)), bot - Math.round(rr(0, b.h)), 1, 2); }
    if (b.shield > 0) { g.globalAlpha = 0.35 + Math.sin(Q.t * 12) * 0.12; disc(g, x, bot - (b.h >> 1), Math.round(b.h * 0.62), '#6ee7f2'); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x - 1, bot - b.h - 8, 3, 3); }
    if (b.guard > 0) { g.globalAlpha = 0.5; g.strokeStyle = '#cfd6e6'; g.lineWidth = 2; g.strokeRect(x - (b.w >> 1) - 3, bot - b.h - 3, b.w + 6, b.h + 4); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { const a = Q.t * 5 + i * 2.1; g.fillStyle = '#fff'; g.fillRect(Math.round(x + Math.cos(a) * (b.w / 2 + 4)), Math.round(bot - (b.h >> 1) + Math.sin(a) * (b.h / 2)), 2, 2); } }
    if (b.st === 'stun') { for (let i = 0; i < 3; i++) { const a = Q.t * 6 + i * 2.1; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(a) * 12), Math.round(bot - b.h - 4 + Math.sin(a) * 3), 3, 3); } }
  }
""" + s[b:]

# drawEnemy rewrite
a = s.index("  function drawEnemy(e, camX, camY) {")
b = s.index("  function drawBoss(camX, camY) {")
s = s[:a] + u"""  function drawEnemy(e, camX, camY) {
    const c = e.cfg, x = e.x + e.w / 2 - camX, bot = e.y + e.h - camY;
    if (x < -40 || x > VW + 40) return;
    if (c.ai === 'blob' && e.st === 'wait') return;
    if (e.hid) { g.fillStyle = '#a07030'; g.fillRect(Math.round(x - 4), Math.round(bot - 2), 8, 2); g.fillStyle = '#c8964a'; g.fillRect(Math.round(x - 2), Math.round(bot - 3), 4, 1); return; }
    const fr = c.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, spr = getSprite(c.spr, c.swap || {}, fr, c.out), t = e.t;
    let sx = 1, sy = 1, rot = 0, ox = 0, oy = 0, al;
    const ground = e.onGround;
    if (c.ai === 'hop') {
      if (ground) { const ant = (e.cd > 0 && e.cd < 0.3) ? (1 - e.cd / 0.3) : 0; sy = 1 - 0.3 * ant + 0.04 * Math.sin(t * 5); sx = 1 + 0.25 * ant; }
      else { const st = clamp(Math.abs(e.vy) / 700, 0, 0.3); sy = 1 + st; sx = 1 - st * 0.6; }
    } else if (c.ai === 'walk' || c.ai === 'charge') {
      const mv = ground && Math.abs(e.vx) > 1;
      if (e.st === 'wind') { sy = 0.76; sx = 1.14; ox = (Math.random() - 0.5) * 2; }
      else if (e.st === 'rush') { sx = 1.22; sy = 0.88; rot = e.dir * 0.14; if (Math.random() < 0.4) emit(e.x + e.w / 2 - e.dir * 4, e.y + e.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 20, vy: -8, grav: 20, l0: 0.15, l1: 0.3 }); }
      else if (e.st === 'block') { sy = 0.92; sx = 1.08; rot = -e.dir * 0.05; }
      else if (e.st === 'dig') { const k = clamp(1 - e.stT / 0.5, 0, 1); sy = 1 - 0.7 * k; oy = 3 * k; }
      else if (e.st === 'pop') { sy = 1.2; sx = 0.88; rot = e.dir * 0.1; }
      else if (mv) { oy = -Math.abs(Math.sin(t * (7 + e.sp / 12))) * 1.6; rot = e.dir * 0.06 * Math.sin(t * 8); sy = 1 + 0.04 * Math.sin(t * 15); }
      else sy = 1 + 0.03 * Math.sin(t * 3);
    } else if (c.ai === 'fly') {
      rot = clamp(e.vx / 160, -0.3, 0.3);
      if (e.st === 'dive') { rot = Math.atan2(e.dvy || 0, Math.abs(e.dvx || 1)) * (e.dir < 0 ? -1 : 1) * 0.8; sx = 1.1; sy = 0.9; }
    } else if (c.ai === 'ghost') {
      sx = 1 + 0.07 * Math.sin(t * 4); sy = 1 - 0.05 * Math.sin(t * 4); al = 0.65 + Math.sin(t * 3) * 0.2; oy = Math.round(Math.sin(t * 3));
      if (e.st === 'fade') al = clamp(e.stT / 0.3, 0, 1) * 0.8; else if (e.st === 'appear') al = clamp(1 - e.stT / 0.3, 0, 1) * 0.8;
    } else if (c.ai === 'shoot' || c.ai === 'flyshoot') {
      if (e.st === 'wind') { sy = 1.08; sx = 0.94; rot = -e.dir * 0.08; ox = (Math.random() - 0.5) * 1.5; }
      sy += 0.02 * Math.sin(t * 3);
    }
    if (e.landT > 0) { const k = e.landT / 0.2; sy *= 1 - 0.3 * k; sx *= 1 + 0.25 * k; }
    if (e.kickT > 0) { const k = e.kickT / 0.15; sx *= 1 + 0.15 * k; ox -= e.dir * 2.5 * k; }
    if (e.hitT > 0) { const k = e.hitT / 0.18; sx *= 1 + 0.25 * k; sy *= 1 - 0.2 * k; ox += (Math.random() - 0.5) * 2 * k; }
    if (e.spawnT > 0) { const k = 1 - e.spawnT / 0.4, os = 1 + Math.sin(k * Math.PI) * 0.25; sx *= (0.2 + 0.8 * k) * os; sy *= (0.2 + 0.8 * k) * os; al = k; if (Math.random() < 0.5) emit(e.x + e.w / 2, e.y + e.h / 2, 1, { col: ['#fff', Q.B.proj], sp0: 10, sp1: 40, grav: 0, l0: 0.2, l1: 0.4 }); }
    const flash = e.flash > 0 || (e.st === 'wind' && Math.floor(t * 20) % 2 === 0);
    const k0 = e.sc || 1;
    if (e.v === 'elite') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 + Math.sin(t * 5) * 0.12; disc(g, Math.round(x), Math.round(bot - e.h / 2), Math.round(e.w * 0.8), '#c02030'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    drawSprT(g, spr, x + ox, bot + oy, e.dir < 0, flash, sx * k0, sy * k0, rot, al);
    if (e.st === 'block') { const fx = Math.round(x + e.dir * (e.w * 0.6)); g.fillStyle = '#14121f'; g.fillRect(fx - 2, Math.round(bot - e.h * 0.85), 5, Math.round(e.h * 0.8)); g.fillStyle = '#cfd6e6'; g.fillRect(fx - 1, Math.round(bot - e.h * 0.85) + 1, 3, Math.round(e.h * 0.8) - 2); g.fillStyle = '#fff'; g.fillRect(fx, Math.round(bot - e.h * 0.85) + 2, 1, 3); }
    if (e.maxhp >= 6 && e.hp < e.maxhp && e.hp > 0) {
      const bw = Math.max(12, Math.round(e.w * 0.9)), bx = Math.round(x - bw / 2), by = Math.round(bot - e.h - 6);
      g.fillStyle = '#14121f'; g.fillRect(bx - 1, by - 1, bw + 2, 4); g.fillStyle = '#5a1020'; g.fillRect(bx, by, bw, 2);
      g.fillStyle = e.armor > 0 ? '#cfd6e6' : '#e0453a'; g.fillRect(bx, by, Math.max(0, Math.round(bw * e.hp / e.maxhp)), 2);
    }
  }
""" + s[b:]

# ---- enemies: loop timers, burrow, blink, block, landing
rep("      e.t += dt; if (e.flash > 0) e.flash -= dt;\n      const c = e.cfg,", "      e.t += dt; if (e.flash > 0) e.flash -= dt;\n      if (e.hitT > 0) e.hitT -= dt; if (e.kickT > 0) e.kickT -= dt; if (e.landT > 0) e.landT -= dt;\n      if (e.spawnT > 0) { e.spawnT -= dt; continue; }\n      const wasG = e.onGround, pvy0 = e.vy;\n      const c = e.cfg,")
rep("          if (e.stun > 0) e.stun -= dt;\n          if (e.onGround) {", "          if (e.stun > 0) e.stun -= dt;\n          if (c.burrow) { e.bcd -= dt; if (burrowTick(e, dt, dx)) break; }\n          if (e.onGround) {")
rep("{ e.st = 'wind'; e.stT = 0.4; e.vx = 0; Snd.creature(e.type, 'attack'); }\n              } else if (e.st === 'wind') {", "{ if (c.block && Math.random() < 0.65) { e.st = 'block'; e.stT = 0.9; e.vx = 0; Snd.play('clang'); } else { e.st = 'wind'; e.stT = 0.4; e.vx = 0; Snd.creature(e.type, 'attack'); } }\n              } else if (e.st === 'block') { e.vx = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 'wind'; e.stT = 0.35; Snd.creature(e.type, 'attack'); } }\n              else if (e.st === 'wind') {")
rep("        case 'ghost': {\n          const near = Math.abs(dx) < 150 && Math.abs(dy) < 110;", u"""        case 'ghost': {
          const near = Math.abs(dx) < 150 && Math.abs(dy) < 110;
          e.blT = (e.blT === undefined ? rr(2, 4) : e.blT) - dt;
          if (e.st === 'fade') { e.stT -= dt; if (e.stT <= 0) { const sd = Math.random() < 0.5 ? -1 : 1; e.x = P.x + 4 + sd * 70 - e.w / 2; e.y = P.y - 12; e.st = 'appear'; e.stT = 0.3; emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: [Q.B.proj, '#fff'], sp0: 10, sp1: 50 }); Snd.play('poof'); } break; }
          if (e.st === 'appear') { e.stT -= dt; if (e.stT <= 0) { e.st = 'patrol'; e.blT = rr(4, 6); } break; }
          if (c.blink && near && e.blT <= 0) { e.st = 'fade'; e.stT = 0.3; Snd.play('poof'); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: [Q.B.proj, '#fff'], sp0: 10, sp1: 40 }); break; }""")
rep("e.st = 'patrol'; const a = Math.atan2(dy, dx); firePr(e.x + e.w / 2, e.y + e.h / 2,", "e.st = 'patrol'; e.kickT = 0.15; const a = Math.atan2(dy, dx); firePr(e.x + e.w / 2, e.y + e.h / 2,")
rep("e.st = 'patrol'; const a = Math.atan2(dy, dx); const sp = c.spd || 95;", "e.st = 'patrol'; e.kickT = 0.15; const a = Math.atan2(dy, dx); const sp = c.spd || 95;")
rep("      // contact\n      if (!e.dead && (c.ai !== 'blob' || e.st === 'up') &&", "      if (e.onGround && !wasG && pvy0 > 120 && !e.fly) { e.landT = 0.2; emit(e.x + e.w / 2, e.y + e.h, 4, { col: '#cfd6e6', sp0: 15, sp1: 45, vy: -10, grav: 40, l0: 0.15, l1: 0.3 }); }\n      // contact\n      if (!e.dead && !e.hid && (c.ai !== 'blob' || e.st === 'up') &&")
rep("  function updateEnemies(dt) {", u"""  function burrowTick(e, dt, dx) {
    const c = e.cfg;
    if (e.st === 'dig') { e.stT -= dt; e.vx = 0; if (Math.random() < 0.5) emit(e.x + e.w / 2, e.y + e.h, 1, { col: '#c8964a', sp0: 10, sp1: 40, vy: -30, l0: 0.2, l1: 0.4 }); if (e.stT <= 0) { e.st = 'under'; e.stT = 0.95; e.hid = true; } return true; }
    if (e.st === 'under') {
      e.stT -= dt; const d = dx > 0 ? 1 : -1; e.dir = d; e.vy = 0; moveX(e, d * e.sp * 2.4 * dt);
      if (Math.random() < 0.6) emit(e.x + e.w / 2, e.y + e.h, 1, { col: '#c8964a', sp0: 10, sp1: 40, vy: -25, l0: 0.2, l1: 0.4 });
      if (e.stT <= 0 || Math.abs(dx) < 10) { e.st = 'pop'; e.hid = false; e.vy = -215; e.vx = d * e.sp * 0.6; e.stT = 0.6; e.onGround = false; emit(e.x + e.w / 2, e.y + e.h, 14, { col: ['#c8964a', '#fff'], sp0: 20, sp1: 90, vy: -30 }); Snd.creature(e.type, 'attack'); addRing(e.x + e.w / 2, e.y + e.h, '#c8964a', 24, 0.3); }
      return true;
    }
    if (e.st === 'pop') { e.stT -= dt; e.vy = Math.min(380, e.vy + GRAV * dt); moveX(e, e.vx * dt); moveY(e, e.vy * dt); if (e.onGround && e.stT < 0.45) { e.st = 'patrol'; e.bcd = rr(3, 5); e.vx = 0; } return true; }
    if (e.st === 'patrol' && e.onGround && e.bcd <= 0 && Math.abs(dx) < 120) { e.st = 'dig'; e.stT = 0.5; e.vx = 0; Snd.creature(e.type, 'idle', false, 0.8); return true; }
    return false;
  }
  function updateEnemies(dt) {""")
# hidden enemies can't be hit by sword/daggers
rep("      if (e.dead || P.atkHit.has(e)) continue;", "      if (e.dead || e.hid || P.atkHit.has(e)) continue;")
rep("for (const e of Q.ents) if (!e.dead && ov(box, e) && !(e.cfg && e.cfg.ai === 'blob' && e.st !== 'up')) { hit = e; break; }", "for (const e of Q.ents) if (!e.dead && !e.hid && ov(box, e) && !(e.cfg && e.cfg.ai === 'blob' && e.st !== 'up')) { hit = e; break; }")
# hurtEnemy: block + hit jiggle + death anim
rep("    const arm = e.armor || 0, eff = dmg * (1 - arm * (pierce ? 0.4 : 1));\n    e.hp -= eff; e.flash = 0.12;", "    let bl = 1; if (e.st === 'block' && !pierce) { bl = 0.2; Snd.play('clang'); emit(e.x + e.w / 2 + e.dir * e.w / 2, e.y + e.h / 2, 5, { col: ['#fff', '#cfd6e6'], sp0: 40, sp1: 110 }); }\n    const arm = e.armor || 0, eff = dmg * bl * (1 - arm * (pierce ? 0.4 : 1));\n    e.hp -= eff; e.flash = 0.12; e.hitT = 0.18;")
rep("      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });", "      e.dead = true; emit(e.x + e.w / 2, e.y + e.h / 2, 18, { col: ['#fff', '#ffd34e', '#f08a2b'], sp0: 20, sp1: 100 });\n      { const cc = e.cfg; Q.corpses.push({ spr: getSprite(cc.spr, cc.swap || {}, cc.spr === 'bat' ? (Math.floor(e.t * 8) % 2) : 0, cc.out), x: e.x + e.w / 2, bot: e.y + e.h, flip: e.dir < 0, sc: e.sc || 1, t: 0, vx: (e.x < Q.P.x ? -1 : 1) * 70, vy: -160, rot: 0, rv: (Math.random() < 0.5 ? -1 : 1) * 9 }); }")

# state + hooks
rep("zones: [], tmpCells: [],", "rings: [], ghosts: [], corpses: [], zones: [], tmpCells: [],")
rep("    Q.zones = []; cleanupCells(); Q.windT = 0;", "    Q.rings = []; Q.ghosts = []; Q.corpses = []; Q.zones = []; cleanupCells(); Q.windT = 0;")
rep("  function updateParticles(dt) {", "  function updateParticles(dt) {\n    updateFx(dt);")
rep("    drawDragon(camX, camY);", "    drawDragon(camX, camY);\n    drawFx(camX, camY);")

# dragon: tilt on dive / crouch on tele
rep("    g.drawImage(img, Math.round(cx - spr.w / 2), Math.round(cy - spr.h / 2 + 8));\n    g.globalAlpha = 1;",
    "    { let rot = 0, sy = 1, sx = 1; if (d.st === 'act' && d.sk === 'dive') rot = d.ph === 1 ? d.side * 0.5 : (d.ph === 2 ? d.side * 0.12 : 0); if (d.st === 'tele') { sy = 0.95; sx = 1.04; } if (d.st === 'act' && d.sk === 'perch' && d.ph === 1) { sy = 0.96; }\n      g.save(); g.translate(cx, cy + 8); if (rot) g.rotate(rot); g.drawImage(img, -spr.w * sx / 2, -spr.h * sy / 2, spr.w * sx, spr.h * sy); g.restore(); }\n    g.globalAlpha = 1;")
io.open(p, 'w', encoding='utf-8').write(s)
print('anim patch ok')
