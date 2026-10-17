import io, re
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


# ---------- unlock all maps (for the maker to review) ----------
rep("  const maxPlayable = () => save.cleared.length ?", "  const UNLOCK_ALL = true; // set to false for release: then each win unlocks the next map\n  const maxPlayable = () => UNLOCK_ALL ? 6 : save.cleared.length ?")
rep("    if (save.cleared.length) it.push({ k: 'cont', fn: () => { mapSel = maxPlayable(); toScene('map'); } });", "    if (save.cleared.length || UNLOCK_ALL) it.push({ k: 'cont', fn: () => { mapSel = UNLOCK_ALL ? 0 : maxPlayable(); toScene('map'); } });")

# ---------- enemy variants / stats ----------
a = s.index("  function makeEnemy(type, x, y, s) {")
b = s.index("  function makeBoss(s) {")
s = s[:a] + u"""  function makeEnemy(type, x, y, s) {
    const c = EN[type], li = Q.li, v = s && s.v;
    let sc = 1, hpv = 1, armor = 0, dmg = 1, spv = 1;
    if (v === 'small') { sc = 0.7; hpv = 0.6; spv = 1.25; }
    else if (v === 'big') { sc = 1.6; hpv = 3; spv = 0.8; dmg = li >= 2 ? 2 : 1; }
    else if (v === 'elite') { sc = 1.4; hpv = 4; spv = 0.95; dmg = 2; armor = Math.min(0.35, 0.08 + li * 0.05); }
    if (li >= 5 && v !== 'small') dmg += 1;
    const w = Math.max(5, Math.round(c.w * sc)), h = Math.max(5, Math.round(c.h * sc));
    const hp = Math.max(1, Math.round(c.hp * (1 + 0.22 * li) * hpv * (s && s.minion ? 0.6 : 1)));
    const e = { type, cfg: c, x: x - w / 2, y: y - h, w, h, vx: 0, vy: 0, hp, maxhp: hp, sc, v, armor, dmg: Math.min(3, dmg), sp: c.sp * (1 + 0.05 * li) * spv, dir: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 5, cd: rr(0.5, 1.5), flash: 0, st: 'patrol', stT: 0, hx: x, hy: y, onGround: false, minion: !!(s && s.minion), grp: s && s.grp, trial: s && s.trial };
    if (FLY.has(type) || c.ai === 'ghost' || c.ai === 'flyshoot') { e.y = y - h / 2; e.hy = e.y; e.fly = true; }
    if (c.ai === 'blob') { e.y = y + 10; e.hy = y; e.cd = rr(0.5, 2.5); e.st = 'wait'; }
    return e;
  }
""" + s[b:]

# ---------- updateEnemies: speeds, lunge, dive, voices, damage ----------
a = s.index("  function updateEnemies(dt) {")
b = s.index("  function bossStart(b) {")
blk = s[a:b]
blk = re.sub(r"\bc\.sp\b", "e.sp", blk)
blk = blk.replace(u"""      { const d2 = Math.abs(dx) + Math.abs(dy) * 0.5;
        if (!e.alerted && d2 < 110) { e.alerted = true; Snd.creature(e.type, 'alert'); e.vt = rr(2, 4); }
        else if (e.alerted && d2 < 170) { e.vt -= dt; if (e.vt <= 0) { e.vt = rr(3.5, 7); Snd.creature(e.type, 'idle'); } }
        else if (d2 > 230) e.alerted = false; }""", u"""      { const d2 = Math.abs(dx) + Math.abs(dy) * 0.5, vol = clamp(1 - d2 / 320, 0.2, 1), pit = e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1);
        if (!e.alerted && d2 < 150) { e.alerted = true; Snd.creature(e.type, 'alert', false, vol, pit); e.vt = rr(1.2, 2.6); }
        else if (d2 < 270) { e.vt = (e.vt === undefined ? rr(1, 3) : e.vt) - dt; if (e.vt <= 0) { e.vt = rr(1.8, 4); Snd.creature(e.type, 'idle', false, vol, pit); } }
        if (d2 > 310) e.alerted = false; }""")
blk = blk.replace("            if (c.ai === 'charge') {\n              if (e.st === 'patrol') {\n                e.vx = e.dir * e.sp;\n                if (Math.abs(dx) < 100",
                  "            if (c.ai === 'charge' || c.ai === 'walk') {\n              if (e.st === 'patrol') {\n                e.vx = e.dir * e.sp;\n                if (Math.abs(dx) < (c.ai === 'walk' ? 75 : 100)")
blk = blk.replace("        case 'fly': {\n          const near = Math.abs(dx) < 130 && Math.abs(dy) < 100;",
                  u"""        case 'fly': {
          const near = Math.abs(dx) < 130 && Math.abs(dy) < 100;
          e.cd -= dt;
          if (e.st === 'dive') { e.stT -= dt; e.x += e.dvx * dt; e.y += e.dvy * dt; if (e.stT <= 0) { e.st = 'patrol'; e.cd = rr(1.8, 3.2); } break; }
          if (near && e.cd <= 0 && dy > 6 && Math.abs(dx) < 95) { const dd = Math.hypot(dx, dy) || 1; e.dvx = dx / dd * e.sp * 3.2; e.dvy = dy / dd * e.sp * 3.2; e.st = 'dive'; e.stT = 0.45; Snd.creature(e.type, 'attack', false, 1, e.sc > 1.2 ? 0.7 : 1); break; }""")
blk = blk.replace("hurtPlayer(1, e.x + e.w / 2);", "hurtPlayer(e.dmg || 1, e.x + e.w / 2);")
s = s[:a] + blk + s[b:]

# ---------- hurtEnemy: armor / pierce ----------
rep("  function hurtEnemy(e, dmg) {\n    e.hp -= dmg; e.flash = 0.12;\n    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt');",
    u"""  function hurtEnemy(e, dmg, pierce) {
    const arm = e.armor || 0, eff = dmg * (1 - arm * (pierce ? 0.4 : 1));
    e.hp -= eff; e.flash = 0.12;
    if (arm > 0 && !pierce) emit(e.x + e.w / 2, e.y + e.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 90 });
    Snd.creature(e.type, e.hp <= 0 ? 'die' : 'hurt', false, 1, e.sc > 1.2 ? 0.7 : (e.sc < 0.9 ? 1.3 : 1));""")
rep("        const n = Math.random() < 0.55 ? 1 : 0;\n        for (let i = 0; i < n + (e.cfg.hp >= 4 ? 2 : 0); i++)", "        const n = Math.random() < 0.55 ? 1 : 0;\n        for (let i = 0; i < n + (e.maxhp >= 6 ? 2 : 0) + (e.v === 'elite' ? 3 : 0); i++)")
rep("        if (Math.random() < 0.08) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });",
    "        if (Math.random() < (e.v === 'elite' ? 0.3 : 0.05)) Q.items.push({ kind: 'heart', x: e.x + e.w / 2, y: e.y, id: -1, vy: -80, vx: 0, ph: 0, drop: true });")
# explosions & flames pierce armor
rep("for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg);", "for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg, true);")
rep("for (const e of Q.ents) if (!e.dead && ov(box, e)) hurtEnemy(e, 1);", "for (const e of Q.ents) if (!e.dead && ov(box, e)) hurtEnemy(e, 1, true);")

# ---------- drawEnemy: scale, hp bar, elite aura ----------
rep("    drawSpr(g, spr, Math.round(x), Math.round(bot + oy), e.dir < 0, flash, sx, sy, al);\n    if (c.ai === 'fly' && false) { }",
    u"""    const k = e.sc || 1;
    if (e.v === 'elite') { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 + Math.sin(e.t * 5) * 0.12; disc(g, Math.round(x), Math.round(bot - e.h / 2), Math.round(e.w * 0.8), '#c02030'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    drawSpr(g, spr, Math.round(x), Math.round(bot + oy), e.dir < 0, flash, sx * k, sy * k, al);
    if (e.maxhp >= 6 && e.hp < e.maxhp && e.hp > 0) {
      const bw = Math.max(12, Math.round(e.w * 0.9)), bx = Math.round(x - bw / 2), by = Math.round(bot - e.h - 6);
      g.fillStyle = '#14121f'; g.fillRect(bx - 1, by - 1, bw + 2, 4); g.fillStyle = '#5a1020'; g.fillRect(bx, by, bw, 2);
      g.fillStyle = e.armor > 0 ? '#cfd6e6' : '#e0453a'; g.fillRect(bx, by, Math.max(0, Math.round(bw * e.hp / e.maxhp)), 2);
    }""")

# ---------- emotes ----------
rep("  function hurtPlayer(n, fromX, noKnock) {", u"""  function setEmo(type, dur) { const P = Q && Q.P; if (!P) return; P.emo = type; P.emoT = dur; }
  function drawEmoteFace(x, bot, flip, sc, emo, tt) {
    if (!emo) return;
    const spr = getSprite('hero_idle', {}, 0), W = spr.w, ox = Math.round(x - W * sc / 2), oy = Math.round(bot - spr.h * sc + sc);
    const px = (cx, cy, col, w, h) => { const ww = w || 1, xx = flip ? (W - 1 - cx - (ww - 1)) : cx; g.fillStyle = col; g.fillRect(ox + xx * sc, oy + cy * sc, ww * sc, (h || 1) * sc); };
    const V = '#434d6e';
    px(6, 8, V, 8, 2);
    if (emo === 'happy') { ['#ffe08a'].forEach(c => { px(7, 9, c); px(8, 8, c); px(9, 9, c); px(10, 9, c); px(11, 8, c); px(12, 9, c); }); }
    else if (emo === 'cry') {
      px(7, 9, '#6ee7f2'); px(8, 8, '#bff3ff'); px(8, 9, '#6ee7f2'); px(11, 8, '#bff3ff'); px(11, 9, '#6ee7f2'); px(12, 9, '#6ee7f2');
      for (let i = 0; i < 3; i++) { const yy = 10 + ((Math.floor(tt * 7) + i) % 4); px(7, yy, '#8ad8ff'); px(12, yy, '#8ad8ff'); }
    }
    else if (emo === 'angry') { px(8, 8, '#ff4a3a', 1, 2); px(11, 8, '#ff4a3a', 1, 2); px(6, 7, '#ff9a8a'); px(7, 7, '#ff9a8a'); px(9, 8, '#ff9a8a'); px(10, 8, '#ff9a8a'); px(12, 7, '#ff9a8a'); }
    else if (emo === 'scared') { px(7, 8, '#fff', 2, 2); px(10, 8, '#fff', 2, 2); px(8, 9, '#14121f'); px(11, 9, '#14121f'); }
    else if (emo === 'hurt') { px(7, 8, '#ff6a5a'); px(9, 8, '#ff6a5a'); px(8, 9, '#ff6a5a'); px(7, 9, '#ff6a5a'); px(9, 9, '#ff6a5a'); px(10, 8, '#ff6a5a'); px(12, 8, '#ff6a5a'); px(11, 9, '#ff6a5a'); px(10, 9, '#ff6a5a'); px(12, 9, '#ff6a5a'); }
  }
  function drawEmoBubble(x, top, emo) {
    if (emo !== 'happy' && emo !== 'angry' && emo !== 'cry') return;
    const bx = Math.round(x + 4), by = Math.round(top - 11);
    g.fillStyle = '#14121f'; g.fillRect(bx - 1, by - 1, 12, 10); g.fillStyle = '#fff'; g.fillRect(bx, by, 10, 8); g.fillStyle = '#14121f'; g.fillRect(bx + 1, by + 8, 2, 2);
    if (emo === 'happy') { g.fillStyle = '#ff5a8a'; g.fillRect(bx + 2, by + 1, 2, 2); g.fillRect(bx + 6, by + 1, 2, 2); g.fillRect(bx + 1, by + 2, 8, 2); g.fillRect(bx + 2, by + 4, 6, 1); g.fillRect(bx + 3, by + 5, 4, 1); g.fillRect(bx + 4, by + 6, 2, 1); }
    else if (emo === 'angry') { g.fillStyle = '#e0453a'; g.fillRect(bx + 2, by + 1, 1, 2); g.fillRect(bx + 1, by + 2, 3, 1); g.fillRect(bx + 6, by + 1, 1, 2); g.fillRect(bx + 5, by + 2, 3, 1); g.fillRect(bx + 2, by + 5, 6, 1); g.fillRect(bx + 3, by + 4, 4, 1); }
    else { g.fillStyle = '#4a8bf0'; g.fillRect(bx + 4, by + 1, 2, 1); g.fillRect(bx + 3, by + 2, 4, 3); g.fillRect(bx + 4, by + 5, 2, 1); g.fillStyle = '#bfeaff'; g.fillRect(bx + 4, by + 3, 1, 1); }
  }
  function hurtPlayer(n, fromX, noKnock) {""")
rep("    Snd.play('hurt'); Snd.hero('hurt');\n    emit(P.x + P.w / 2, P.y + P.h / 2, 10,", "    Snd.play('hurt'); Snd.hero('hurt'); setEmo('hurt', 0.45);\n    emit(P.x + P.w / 2, P.y + P.h / 2, 10,")
rep("Snd.play('die'); Snd.hero('die'); emit(P.x + 4, P.y + 7, 30,", "Snd.play('die'); Snd.hero('die'); setEmo('cry', 99); emit(P.x + 4, P.y + 7, 30,")
rep("Snd.play('shard'); Q.shardFlash = 1.2;", "Snd.play('shard'); setEmo('happy', 2.2); Q.shardFlash = 1.2;")
rep("Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer');", "Snd.play(Q.relicNew ? 'relic' : 'win'); Snd.hero('cheer'); setEmo('happy', 99);")
rep("    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC);", "    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);")
rep("          tr.state = 'intro';\n          startScripted('shorty'", "          tr.state = 'intro'; setEmo('angry', 3);\n          startScripted('shorty'")
rep("Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic');", "Q.msg = T('trialWin'); Q.msgT = 4; Snd.play('relic'); setEmo('happy', 2.5);")
rep("P.hp++; it.dead = true; Snd.play('heart');", "P.hp++; it.dead = true; Snd.play('heart'); setEmo('happy', 1);")
rep("Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer');", "Q.state = 'reward'; Q.stateT = 0; Snd.play('relic'); Snd.hero('cheer'); setEmo('happy', 3);")
# update emo timer + tears
rep("    P.anim += dt; P.inv = Math.max(0, P.inv - dt);", "    P.anim += dt; P.inv = Math.max(0, P.inv - dt);\n    if (P.emoT > 0) { P.emoT -= dt; if (P.emoT <= 0) P.emo = null; }\n    if (!P.emo && P.hp <= 1 && P.hp > 0) P.emo = 'cry';\n    if (P.emo === 'cry' && Math.random() < 0.12) emit(P.x + 4 + (Math.random() < 0.5 ? -3 : 3) * P.face, P.y + 3, 1, { col: '#8ad8ff', sp0: 2, sp1: 8, vy: 20, grav: 160, l0: 0.4, l1: 0.7 });")
rep("    drawSpr(g, spr, x, bot + bob, P.face < 0);\n    g.globalAlpha = 1;", "    drawSpr(g, spr, x, bot + bob, P.face < 0);\n    g.globalAlpha = 1;\n    drawEmoteFace(x, bot + bob, P.face < 0, 1, P.emo, P.anim); drawEmoBubble(x - 8, bot - 24, P.emo);")
# dead + complete overlays show Ember's face
rep("      txt(T('died'), VW / 2, 90, { al: 'center', size: 14, bold: true, col: '#e0453a', alpha: a });", "      drawSpr(g, getSprite('hero_idle', {}, 0), VW / 2, 80, false, false, 3, 3, a); drawEmoteFace(VW / 2, 80, false, 3, 'cry', Q.stateT);\n      txt(T('died'), VW / 2, 100, { al: 'center', size: 14, bold: true, col: '#e0453a', alpha: a });")
rep("      if (Q.stateT > 0.8) txt(T('retry'), VW / 2, 120, { al: 'center', size: 8 });", "      if (Q.stateT > 0.8) txt(T('retry'), VW / 2, 130, { al: 'center', size: 8 });")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------- audio: creature volume / pitch ----------
p = 'src/audio.js'
s = io.open(p, encoding='utf-8').read()
rep("  function creature(kind, evt, boss) {", "  function creature(kind, evt, boss, volf, pit) {")
rep("    let f0 = b.f * (0.93 + Math.random() * 0.14), f1 = f0 * b.s, dur = b.dur, vol = b.vol;", "    let f0 = b.f * (0.93 + Math.random() * 0.14) * (pit || 1), f1 = f0 * b.s, dur = b.dur, vol = b.vol * (volf === undefined ? 1 : volf) * 1.25;")
rep("    else if (evt === 'idle') { vol *= 0.6; dur *= 0.9; }", "    else if (evt === 'idle') { vol *= 0.9; dur *= 0.9; }")
io.open(p, 'w', encoding='utf-8').write(s)

# ---------- levels: variants + density ----------
p = 'src/levels.js'
s = io.open(p, encoding='utf-8').read()
rep("""  function addEnemy(tx, ground) {
    const t = pick();
    if (FLY.has(t)) spawn(t, tx, ground - R(3, 5)); else spawn(t, tx, ground);
  }""", u"""  function variant() {
    const r = rnd();
    if (li >= 3 && r < 0.05 + 0.025 * li) return 'elite';
    if (li >= 1 && r < 0.12 + 0.03 * li) return 'big';
    if (r > 0.84) return 'small';
    return null;
  }
  function addEnemy(tx, ground) {
    const t = pick(), v = variant();
    if (FLY.has(t)) spawn(t, tx, ground - R(3, 5), { v }); else spawn(t, tx, ground, { v });
  }""")
rep("+ (n >= 9 && rnd() < 0.7 ? 1 : 0) : 0;", "+ (n >= 9 && rnd() < 0.7 ? 1 : 0) + (li >= 2 && rnd() < 0.35 ? 1 : 0) : 0;")
rep("const k = (li > 0 ? 2 : 1) + (rnd() < 0.45 ? 1 : 0);", "const k = (li > 0 ? 2 : 1) + (rnd() < 0.45 ? 1 : 0) + (li >= 2 ? 1 : 0);")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
