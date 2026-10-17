import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, a[:70]
    return s.replace(a, b, 1)

def art(s):
    a = s.index("function leekSprite() {"); b = s.index("  return _cache.leek;\n}", a) + len("  return _cache.leek;\n}")
    new = '''function leekSprite() {
  if (_cache.leek) return _cache.leek;
  // Princess Lyra's leek blade: white-bulb grip with roots, golden leaf guard, long jade blade, leafy tip
  _cache.leek = paint(38, 15, P => {
    P.px(0, 6, 'e'); P.px(0, 8, 'e'); P.px(1, 7, 'E'); P.px(0, 7, 'w');
    P.rect(2, 5, 9, 5, 'w'); P.rect(2, 5, 9, 1, 'x'); P.rect(2, 9, 9, 1, 'e'); P.rect(5, 5, 1, 5, 'e'); P.rect(8, 5, 1, 5, 'e'); P.px(3, 6, 'w');
    P.rect(11, 2, 3, 11, 'y'); P.rect(11, 2, 1, 11, '#fff2a0'); P.rect(13, 3, 1, 9, 'Y'); P.tri(11, 2, 14, 2, 12, -1 + 1, 'y'); P.tri(11, 12, 14, 12, 12, 14, 'y'); P.px(12, 7, 'r');
    P.rect(14, 5, 17, 5, 't'); P.rect(14, 5, 17, 1, 'x'); P.rect(14, 7, 17, 1, 'w'); P.rect(14, 9, 17, 1, 'g'); P.rect(14, 10, 17, 0, 'G');
    P.tri(30, 4, 30, 11, 37, 7, 'g'); P.tri(30, 5, 30, 7, 36, 7, 't');
    P.tri(26, 4, 22, 0, 31, 3, 't'); P.tri(26, 11, 22, 14, 31, 11, 't'); P.tri(27, 4, 25, 1, 29, 3, 'x'); P.tri(27, 11, 25, 13, 29, 11, 'x');
    P.px(18, 7, 'w'); P.px(24, 6, 'w'); P.px(21, 8, 'x');
  });
  return _cache.leek;
}
// small flying leek used inside the leek tornado
function leekMini() {
  if (_cache.leekmini) return _cache.leekmini;
  _cache.leekmini = paint(14, 5, P => { P.rect(0, 1, 4, 3, 'w'); P.px(0, 2, 'e'); P.rect(4, 1, 7, 3, 'g'); P.rect(4, 1, 7, 1, 't'); P.tri(10, 0, 10, 4, 13, 2, 'g'); P.px(7, 2, 'x'); });
  return _cache.leekmini;
}'''
    s = s[:a] + new + s[b:]
    return s
edit('src/art.js', art)

def items(s):
    return rep(s, "function swordSprite(id) {\n  const k = 'sw_' + id;", "function swordSprite(id) {\n  if (id === 'leek') return leekSprite();\n  const k = 'sw_' + id;")
edit('src/items.js', items)

def game(s):
    # direct cut to the angry devil after the ride
    s = rep(s, "  function startCut() { cut = { t: 0, phase: 'walk', i: 0, lt: 0, pt: 0, fl: 0, shake: 0, thun: false, lastBlip: 0 }; Q = null; Snd.music('devil', DEVIL_MUSIC); }",
            "  let cutSkip = false;\n  function startCut() { cut = { t: 0, phase: 'walk', i: 0, lt: 0, pt: 0, fl: 0, shake: 0, thun: false, lastBlip: 0 }; Q = null; Snd.music('devil', DEVIL_MUSIC); if (cutSkip) { cutSkip = false; cut.phase = 'devil'; cut.t = 4; cut.fl = 0.5; cut.shake = 0.5; Snd.play('thunder'); cutLineStart(); } }")
    s = rep(s, "save.ride = 1; writeSave(); cutLevel = 0; mapSel = 1; toScene('cutscene');", "save.ride = 1; writeSave(); cutLevel = 0; mapSel = 1; cutSkip = true; toScene('cutscene');")
    # tornado: lifts the target, executes after a moment
    s = rep(s, "      G.torn.push({ x: e.x + e.w / 2, y: e.y + e.h, h: Math.max(40, e.h + 20), life: 1.1, t: 0 }); Snd.play('whoosh'); Snd.play('thunder'); Q.shake = Math.max(Q.shake, 0.35);\n      emit(e.x + e.w / 2, e.y + e.h / 2, 24, { col: ['#a4ffc0', '#4fc84f', '#fff'], sp0: 40, sp1: 140 });\n      if (e.isBoss) hurtBoss(e, (e.hp + 1) * 12, true, true); else hurtEnemy(e, e.hp + 99, true);",
            "      e.stunT = Math.max(e.stunT || 0, 2); e.stunCd = 30;\n      G.torn.push({ x: e.x + e.w / 2, y: e.y + e.h, h: Math.max(64, e.h + 44), life: 1.7, t: 0, e, exec: 0.7 }); Snd.play('whoosh'); Snd.play('whoosh'); Q.shake = Math.max(Q.shake, 0.3);")
    s = rep(s, "    for (const t of G.torn) { t.life -= dt; t.t += dt; }",
            """    for (const t of G.torn) {
      t.life -= dt; t.t += dt;
      if (t.e) {
        const e = t.e;
        if (e.dead) t.e = null;
        else {
          e.stunT = Math.max(e.stunT || 0, 0.3);
          if (!e.isBoss) { e.x += (t.x - e.w / 2 - e.x) * Math.min(1, 8 * dt); e.y -= 46 * dt; e.vy = 0; e.vx = 0; }
          t.exec -= dt;
          if (Math.random() < 0.5) emit(t.x + rr(-14, 14), t.y - rr(0, t.h), 1, { col: ['#a4ffc0', '#4fc84f', '#fff'], sp0: 10, sp1: 40, grav: -20, l0: 0.2, l1: 0.5 });
          if (t.exec <= 0) {
            Snd.play('thunder'); Q.shake = Math.max(Q.shake, 0.35); emit(e.x + e.w / 2, e.y + e.h / 2, 28, { col: ['#a4ffc0', '#4fc84f', '#fff', '#e8f5d0'], sp0: 40, sp1: 150 });
            if (e.isBoss) hurtBoss(e, (e.hp + 1) * 12, true, true); else hurtEnemy(e, e.hp + 99, true);
            t.e = null;
          }
        }
      }
    }""")
    # tornado drawing
    a = s.index("    for (const t of G.torn) {\n      const x = Math.round(t.x - camX)"); b = s.index("    for (const e of Q.ents) if (!e.dead && !e.hid && e.stunT > 0)", a)
    s = s[:a] + """    for (const t of G.torn) {
      const x = Math.round(t.x - camX), y = Math.round(t.y - camY), k = Math.min(1, t.life / 0.4, t.t / 0.25), lm = leekMini();
      g.globalAlpha = 0.22 * k; g.fillStyle = '#a4ffc0'; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x + 24, y - t.h); g.lineTo(x - 24, y - t.h); g.fill();
      g.globalAlpha = 0.5 * k; g.strokeStyle = '#e8f5d0'; g.lineWidth = 1;
      for (let r = 0; r < 5; r++) { const u = r / 5, yy = y - u * t.h - 4, rd = 6 + u * 20; g.beginPath(); g.ellipse(x, yy, rd, rd * 0.3, 0, 0, 7); g.stroke(); }
      g.globalAlpha = 1;
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 22; i++) {
        const u = i / 22, an = t.t * 11 + i * 0.95, depth = Math.sin(an);
        if ((pass === 0) !== (depth < 0)) continue;
        const rad = 5 + u * 21, px = x + Math.cos(an) * rad, py = y - u * t.h + depth * rad * 0.3, sc = 0.85 + u * 0.55 + (pass ? 0.2 : 0);
        g.save(); g.globalAlpha = k * (pass ? 1 : 0.55); g.translate(Math.round(px), Math.round(py)); g.rotate(an + Math.PI / 2 + (Math.cos(an) > 0 ? 0 : Math.PI)); g.scale(sc, sc); g.drawImage(lm.c, -lm.w / 2, -lm.h / 2); g.restore();
      }
      g.globalAlpha = 0.45 * k; g.fillStyle = '#d9c9a0'; for (let i = 0; i < 8; i++) { const an = t.t * 6 + i * 0.8; g.fillRect(Math.round(x + Math.cos(an) * (14 + (i % 3) * 4)), y - 1 - (i % 2), 3, 2); }
      g.globalAlpha = 1;
    }
""" + s[b:]
    return s
edit('src/game.js', game)
print('ok')
