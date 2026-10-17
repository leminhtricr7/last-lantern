import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


# ---------- leek sword rendering ----------
a = s.index("    // slash\n    if (P.atk > 0) {")
b = s.index("  function drawLighting() {")
s = s[:a] + u"""    // sword: Miku's glowing leek once rescued, otherwise a white arc
    const f = P.face, hx = x + f * 3, hy = bot - 9;
    if (save.leek) {
      const lk = leekSprite(), pulse = 0.6 + Math.sin(Q.t * 6) * 0.25;
      let ang;
      if (P.atk > 0) { const t = 1 - P.atk / 0.2; ang = P.atkDown ? 1.5 : lerp(-1.5, 1.0, t); } else ang = -2.15;
      const tipx = hx + Math.cos(ang) * 18 * f, tipy = hy + Math.sin(ang) * 18;
      g.globalCompositeOperation = 'lighter';
      const grd = g.createRadialGradient(tipx, tipy, 0, tipx, tipy, 30);
      grd.addColorStop(0, 'rgba(130,255,170,' + (0.5 * pulse + (P.atk > 0 ? 0.25 : 0)) + ')'); grd.addColorStop(1, 'rgba(130,255,170,0)');
      g.fillStyle = grd; g.fillRect(tipx - 30, tipy - 30, 60, 60);
      g.globalCompositeOperation = 'source-over';
      if (P.atk > 0 && !P.atkDown) {
        for (let k = 1; k <= 7; k++) { const a2 = ang - k * 0.24, tx = hx + Math.cos(a2) * 24 * f, ty = hy + Math.sin(a2) * 24; g.globalAlpha = 0.65 - k * 0.08; g.fillStyle = k % 2 ? '#c8ffd8' : '#6ee7b0'; g.fillRect(Math.round(tx) - 1, Math.round(ty) - 1, 3, 3); }
        g.globalAlpha = 1;
      }
      g.save(); g.translate(hx, hy); g.scale(f, 1); g.rotate(ang); g.drawImage(lk.c, -1, -lk.h / 2); g.restore();
      if (Math.random() < 0.35) emit(P.x + 4 + Math.cos(ang) * 18 * f + rr(-6, 6), P.y + 5 + Math.sin(ang) * 18 + rr(-6, 6), 1, { col: ['#c8ffd8', '#6ee7b0', '#fff'], sp0: 2, sp1: 10, grav: -12, l0: 0.3, l1: 0.7 });
    } else if (P.atk > 0) {
      const t = 1 - P.atk / 0.2;
      g.fillStyle = '#fff';
      if (P.atkDown) { for (let i = 0; i < 8; i++) { const a = Math.PI * (0.15 + 0.7 * (i / 7)) + t * 0.5; g.fillRect(Math.round(x + Math.cos(a) * 12 * f), Math.round(bot + Math.sin(a) * 12 - 2), 2, 2); } g.fillStyle = '#cfd6e6'; g.fillRect(Math.round(x - 1), Math.round(bot - 2), 3, 12); }
      else {
        for (let i = 0; i < 10; i++) { const a = (-1.2 + 2.4 * (i / 9)) * (t < 0.5 ? t * 2 : 1), px = x + f * (4 + Math.cos(a) * 17), py = bot - 7 + Math.sin(a) * 12; g.fillStyle = i > 6 ? '#fff' : '#cfeaff'; g.fillRect(Math.round(px), Math.round(py), 3, 3); }
      }
    }
  }
""" + s[b:]

# ---------- lighting ----------
rep("    g.globalCompositeOperation = 'source-over';\n  }\n  function drawWeather", u"""    if (save.leek) {
      const lx = P.x + 4 + P.face * 10 - camX, ly = P.y + 2 - camY, gl = g.createRadialGradient(lx, ly, 0, lx, ly, 44);
      gl.addColorStop(0, 'rgba(120,255,170,0.20)'); gl.addColorStop(1, 'rgba(120,255,170,0)'); g.fillStyle = gl; g.fillRect(lx - 44, ly - 44, 88, 88);
    }
    g.globalCompositeOperation = 'source-over';
  }
  function drawWeather""")
rep("    for (const p of Q.fps) if (p.t !== 'dagger') addL(p.x, p.y, 20, 0.8);", "    for (const p of Q.fps) if (p.t !== 'dagger') addL(p.x, p.y, 20, 0.8);\n    if (save.leek) addL(P.x + 4 + P.face * 10, P.y + 2, 38, 0.85);")

# ---------- reward overlay ----------
rep("    } else if (st === 'tablet' && Q.tablet) {", u"""    } else if (st === 'reward') {
      const a = Math.min(1, Q.stateT / 0.6), lk = leekSprite(), pulse = Math.sin(Q.stateT * 5);
      g.globalAlpha = 0.8 * a; g.fillStyle = '#04100a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter';
      for (let r = 70; r > 10; r -= 12) { g.globalAlpha = 0.05 * a; disc(g, VW / 2, 96, Math.round(r + pulse * 3), '#6effaa'); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
      g.save(); g.translate(VW / 2, 96); g.rotate(-0.5 + Math.sin(Q.stateT * 2) * 0.1); g.scale(3, 3); g.drawImage(lk.c, -lk.w / 2, -lk.h / 2); g.restore(); g.globalAlpha = 1;
      for (let i = 0; i < 10; i++) { const an = Q.stateT * 1.5 + i * 0.63, rd = 50 + Math.sin(Q.stateT * 3 + i) * 8; g.fillStyle = i % 2 ? '#c8ffd8' : '#6ee7b0'; g.fillRect(Math.round(VW / 2 + Math.cos(an) * rd), Math.round(96 + Math.sin(an) * rd * 0.6), 2, 2); }
      txt(T('leekT'), VW / 2, 38, { al: 'center', size: 13, bold: true, col: '#a4ffc0', alpha: a });
      txt(LN(MIKU_NAME) + ' - ' + (save.lang === 'vi' ? 'Kiếm Hành Lá' : 'Leek Blade'), VW / 2, 150, { al: 'center', size: 9, bold: true, alpha: a });
      wrapText(T('leekD'), 60).forEach((l, i) => txt(l, VW / 2, 166 + i * 10, { al: 'center', size: 7, col: '#a4e86b', alpha: a }));
      if (Q.stateT > 0.8) txt(T('cont2'), VW / 2, 200, { al: 'center', size: 7, alpha: 0.6 + 0.4 * Math.sin(Q.stateT * 5) });
    } else if (st === 'tablet' && Q.tablet) {""")

# ---------- flow: cutscene after each cleared map ----------
rep("if (Q.li >= 6) toScene('ending'); else { mapSel = Math.min(6, Q.li + 1); toScene('map'); }", "if (Q.li >= 6) toScene('ending'); else { cutLevel = Q.li; mapSel = Math.min(6, Q.li + 1); toScene('cutscene'); }")
rep("    if (s === 'map') { Snd.music('title', TITLE_MUSIC); Q = null; mapSel = Math.min(mapSel, maxPlayable()); }",
    "    if (s === 'map') { Snd.music('title', TITLE_MUSIC); Q = null; mapSel = Math.min(mapSel, maxPlayable()); }\n    if (s === 'cutscene') startCut();")

# ---------- cutscene scene ----------
rep("  // ============================== MAIN LOOP ==============================", u"""  // ============================== DEVIL CUTSCENE ==============================
  let cutLevel = 0, cut = null;
  function startCut() { cut = { t: 0, phase: 'walk', i: 0, lt: 0, pt: 0, fl: 0, shake: 0, thun: false, lastBlip: 0 }; Q = null; Snd.music('devil', DEVIL_MUSIC); }
  function cutLineStart() {
    const ln = CUT[cutLevel][cut.i];
    if (ln.w === 'quoc') Snd.creature(7, 'attack', true); else if (ln.w === 'imp') Snd.creature('imp', 'alert'); else Snd.blip('shorty');
    if (ln.shout) { cut.shake = 0.55; cut.fl = 0.3; if (Math.random() < 0.5) Snd.play('thunder'); }
  }
  function updateCut(dt) {
    const c = cut; c.t += dt;
    if (c.phase === 'walk') {
      if (!c.thun && c.t > 2.1) { c.thun = true; Snd.play('thunder'); c.fl = 0.5; }
      if (c.t > 3.5) { c.phase = 'devil'; c.pt = 0; c.i = 0; c.lt = 0; cutLineStart(); }
      if (act.okP || act.backP) c.t = Math.max(c.t, 3.5);
      return;
    }
    c.pt += dt; c.lt += dt; if (c.fl > 0) c.fl -= dt; if (c.shake > 0) c.shake -= dt;
    const lines = CUT[cutLevel], ln = lines[c.i], txtL = ln[save.lang], n0 = Math.floor((c.lt - dt) * 38), n1 = Math.min(txtL.length, Math.floor(c.lt * 38));
    for (let k = n0 + 1; k <= n1; k++) if (k % (ln.w === 'quoc' ? 3 : 2) === 0 && /\\S/.test(txtL[k - 1] || ' ')) Snd.blip(ln.w === 'imp' ? 'fairy' : (ln.w === 'quoc' ? 'quoc' : 'shorty'));
    if (act.okP) {
      if (c.lt * 38 < txtL.length) c.lt = 999;
      else { c.i++; c.lt = 0; if (c.i >= lines.length) { toScene('map'); c.i = lines.length - 1; c.lt = 999; } else cutLineStart(); }
    }
    if (act.backP) toScene('map');
  }
  function drawCut() {
    const c = cut;
    if (c.phase === 'walk') {
      const gyy = drawBgOnly(cutLevel, c.t * 45, c.t);
      drawSpr(g, getSprite('hero_run', {}, Math.floor(c.t * 10) % 4), 70 + c.t * 28, gyy, false);
      const a = Math.min(0.97, Math.pow(c.t / 2.6, 1.3));
      g.fillStyle = 'rgba(8,0,6,' + a + ')'; g.fillRect(0, 0, VW, VH);
      if (c.t > 1.2) { const gl = g.createRadialGradient(VW / 2, VH, 0, VW / 2, VH, 220); gl.addColorStop(0, 'rgba(180,20,10,' + Math.min(0.5, (c.t - 1.2) * 0.25) + ')'); gl.addColorStop(1, 'rgba(180,20,10,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH); }
      if (c.fl > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(1, c.fl * 2) + ')'; g.fillRect(0, 0, VW, VH); }
      if (c.t > 0.3) txt(save.lang === 'vi' ? 'Bóng tối đang kéo đến...' : 'Darkness is closing in...', VW / 2, 190, { al: 'center', size: 8, col: '#a8505a', alpha: Math.min(1, c.t - 0.3) });
      return;
    }
    const lines = CUT[cutLevel], ln = lines[c.i], sp = SPK[ln.w], k = Math.min(1, c.pt / 1.1);
    g.fillStyle = '#050003'; g.fillRect(0, 0, VW, VH);
    const gl = g.createRadialGradient(VW / 2, 70, 0, VW / 2, 70, 190); gl.addColorStop(0, 'rgba(190,30,14,' + (0.45 + (ln.w === 'quoc' && ln.shout ? 0.2 : 0)) + ')'); gl.addColorStop(1, 'rgba(190,30,14,0)'); g.fillStyle = gl; g.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 26; i++) { const ex = (i * 53 + Math.sin(c.pt + i) * 10) % VW, ey = VH - ((c.pt * (20 + (i % 5) * 9) + i * 41) % VH); g.fillStyle = i % 2 ? '#ff9a2a' : '#ffd34e'; g.fillRect(Math.round(ex), Math.round(ey), 1, 1); }
    const sh = c.shake > 0 ? c.shake * 7 : 0, dv = devilSprite(), rise = (1 - k) * 70, ox = sh ? rr(-sh, sh) : 0, oy = sh ? rr(-sh, sh) : 0;
    const speak = ln.w === 'quoc';
    g.globalAlpha = speak ? 1 : 0.7; g.drawImage(dv.c, Math.round(VW / 2 - dv.w / 2 + ox), Math.round(10 - dv.h / 2 + 62 + rise + oy + Math.sin(c.pt * 2) * 1.5)); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    if (speak) { const e1 = g.createRadialGradient(VW / 2 - 13 + ox, 76 + rise + oy, 0, VW / 2 - 13 + ox, 76 + rise + oy, 22); e1.addColorStop(0, 'rgba(255,200,60,.55)'); e1.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e1; g.fillRect(VW / 2 - 40, 50 + rise, 80, 50); const e2 = g.createRadialGradient(VW / 2 + 13 + ox, 76 + rise + oy, 0, VW / 2 + 13 + ox, 76 + rise + oy, 22); e2.addColorStop(0, 'rgba(255,200,60,.55)'); e2.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = e2; g.fillRect(VW / 2 - 14, 50 + rise, 80, 50); }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = ln.w === 'shorty' ? 1 : 0.55; drawSpr(g, npcSpr('npc_shorty'), 62, 150 + Math.round(Math.sin(c.pt * 3)), false, false, 2, 2);
    g.globalAlpha = ln.w === 'imp' ? 1 : 0.55; drawSpr(g, getSprite('imp'), VW - 62, 150 + Math.round(Math.sin(c.pt * 4)), true, false, 3, 3); g.globalAlpha = 1;
    if (c.fl > 0) { g.fillStyle = 'rgba(255,255,255,' + Math.min(0.8, c.fl * 2) + ')'; g.fillRect(0, 0, VW, VH); }
    g.fillStyle = 'rgba(0,0,0,.82)'; g.fillRect(8, 152, VW - 16, 58); g.fillStyle = sp.col; g.fillRect(8, 152, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1);
    txt(LN(sp.name), 18, 162, { size: 8, col: sp.col, bold: true });
    const textL = ln[save.lang], n = Math.floor(c.lt * 38);
    wrapText(textL.substr(0, n), 64).forEach((l, i) => txt(l, 18 + (ln.shout && Math.random() < 0.4 ? rr(-0.5, 0.5) : 0), 177 + i * 11, { size: ln.shout ? 8 : 7, bold: !!ln.shout, col: ln.shout ? '#ffb0a0' : '#fff' }));
    if (n >= textL.length) txt('>', VW - 20, 200, { size: 8, col: sp.col, alpha: 0.5 + 0.5 * Math.sin(c.pt * 8) });
  }

  // ============================== MAIN LOOP ==============================""")
rep("        else if (scene === 'map') updateMap(sub);", "        else if (scene === 'map') updateMap(sub);\n        else if (scene === 'cutscene') updateCut(sub);")
rep("    else if (scene === 'map') drawMap();", "    else if (scene === 'map') drawMap();\n    else if (scene === 'cutscene' && cut) drawCut();")

# ---------- debug hooks ----------
rep("hurtBoss, completeLevel, updatePlay,", "startCut: li => { cutLevel = li; enterScene('cutscene'); }, hurtBoss, completeLevel, updatePlay,")
io.open(p, 'w', encoding='utf-8').write(s)
print('part2 ok')
