# P2 performance: the lighting pass only looks at things near the camera, and the particle list drops its oldest
# particles in one go instead of shifting the whole array for every new particle.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)
rep("    for (const it of Q.items) { if (it.kind === 'cp' && it.lit) addL(",
    "    const nearCam = x => x > camX - 120 && x < camX + VW + 120;\n    for (const it of Q.items) { if (!nearCam(it.x)) continue; if (it.kind === 'cp' && it.lit) addL(")
rep("    for (const d of Q.L.decor) { if (Q.B.decor[d.k][0]", "    for (const d of Q.L.decor) { if (!nearCam(d.x)) continue; if (Q.B.decor[d.k][0]")
rep("    for (let i = 0; i < n; i++) {\n      if (Q.parts.length > 500) Q.parts.shift();",
    "    if (Q.parts.length + n > 520) Q.parts.splice(0, Q.parts.length + n - 480);   // drop the oldest in one go\n    for (let i = 0; i < n; i++) {")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
