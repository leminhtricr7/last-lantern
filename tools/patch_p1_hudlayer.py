# P1: the HUD and the play overlays are drawn above the full-resolution sprites (heroes, summons) instead of under them.
# drawPlay is split into the world and the overlay; while hi-res sprites are on, the overlay goes into a second pass
# on a cleared buffer that is composited after the hi-res sprites.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:100]
    s = s.replace(a, b)

rep("""      finally { if (z !== 1) { g.restore(); VW = BVW; VH = BVH; } } }
    g.restore();
    if (Q.state !== 'talk') drawHUD();""", """      finally { if (z !== 1) { g.restore(); VW = BVW; VH = BVH; } } }
    g.restore();
    if (!hiOn) drawPlayOver();   // with hi-res sprites on screen the HUD comes later, in its own pass above them
  }
  function drawPlayOver() {
    if (Q.state !== 'talk') drawHUD();""")
rep("""    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    if (HIQ.length) drawHiQ();""", """    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    if (HIQ.length) drawHiQ();
    if (hiOn && scene === 'play' && Q) {   // second pass: HUD and overlays above the hi-res sprites
      g.clearRect(0, 0, VW, VH); drawPlayOver();
      if (fadeIn > 0) { g.globalAlpha = Math.min(1, fadeIn); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    }""")
io.open(p, 'w', encoding='utf-8').write(s)
# (also applied: the first-pass fade is skipped while the HUD pass draws it)
print('ok')
