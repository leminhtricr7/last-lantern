# Dragons (Ignar on map 1, Ignarok's three forms on map 6) draw from their pixel-art sheets: hover, fly, wind-up,
# breath, dive (the body still tilts), perch, hurt, death, and the stage change. The old drawing stays as a fallback.
import io
p = 'src/game.js'; s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:90]; s = s.replace(a, b)
rep("""  function drawDragon(camX, camY) {
    const d = Q.dragon; if (!d || d.hide) return;
    const spr = dragonSprite(d.form, d.wing), cx = Math.round(d.x + d.w / 2 - camX), cy = Math.round(d.y + d.h / 2 - camY);""",
"""  const DRAGON_SHEET = ['ignar', 'ignarok1', 'ignarok2', 'ignarok3'];
  function dragonFrame(d) {
    if (typeof loadSheet === 'undefined') return null;
    const S = loadSheet(DRAGON_SHEET[d.form] || 'ignar'); if (!S.ready) return null;
    let st = 'idle';
    if (d.dead) st = 'death';
    else if (d.flash > 0) st = 'hurt';
    else if (d.st === 'morph') st = 'evo';
    else if (d.st === 'flee' || d.st === 'flee0' || d.st === 'enter') st = 'walk';
    else if (d.st === 'tele') st = 'tele';
    else if (d.st === 'act') st = d.sk === 'dive' ? 'dive' : (d.sk === 'perch' && d.ph === 1) ? 'perch' : (/reath|fireballs|gust|roar/.test(d.sk || '') ? 'cast' : 'walk');
    else if (d.dodgeT > 0) st = 'walk';
    if (!S.st[st]) st = 'idle';
    if (d.anSt !== st) { d.anSt = st; d.anT0 = Q.t; }
    const A = S.st[st], n = A.fr.length, el = Q.t - d.anT0;
    let i = A.loop ? Math.floor(el * A.fps) % n : Math.floor(el * A.fps);
    if (st === 'death') i = Math.floor((d.deadT || 0) / 2.3 * n);
    if (!A.loop && i >= n) i = st === 'cast' || st === 'evo' ? n - 3 + ((i - n) % 3) : n - 1;
    return A.fr[Math.max(0, Math.min(n - 1, i))];
  }
  function drawDragon(camX, camY) {
    const d = Q.dragon; if (!d || d.hide) return;
    const spr = dragonSprite(d.form, d.wing), cx = Math.round(d.x + d.w / 2 - camX), cy = Math.round(d.y + d.h / 2 - camY), DF = dragonFrame(d);""")
rep("""      g.save(); g.translate(cx, cy + 8); if (rot) g.rotate(rot); g.drawImage(img, -spr.w * sx / 2, -spr.h * sy / 2, spr.w * sx, spr.h * sy); g.restore(); }""",
"""      g.save(); g.translate(cx, cy + 8); if (rot) g.rotate(rot);
      if (DF) { const fl = d.dir < 0, im = (d.invul > 0 && d.invul < 50 && d.flash > 0) ? (fl ? DF.fw : DF.cw) : (fl ? DF.f : DF.c); g.drawImage(im, -(fl ? DF.w - 1 - DF.ax : DF.ax), -DF.ay); }
      else g.drawImage(img, -spr.w * sx / 2, -spr.h * sy / 2, spr.w * sx, spr.h * sy);
      g.restore(); }""")
rep("  function makeDragon(def) {\n", "  function makeDragon(def) {\n    if (typeof loadSheet !== 'undefined') (def.kind === 'young' ? ['ignar'] : ['ignarok1', 'ignarok2', 'ignarok3']).forEach(n => loadSheet(n));\n")
io.open(p, 'w', encoding='utf-8').write(s); print('ok')
# (applied afterwards: the sheet frame is drawn as is; its hurt frames carry the white flash)
