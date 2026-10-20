# P2 animation: the pixel heroes get their own poses for the sword swing (wind-up, strike, follow-through), the dash,
# the F guard and dying (they used to vanish the moment they fell); custom heroes sink and fade when they fall.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/art.js', [
    ("  hero_hurt: heroSet('hero_hurt', [heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[0], heroLegs.idle, -1)]),",
     "  hero_hurt: heroSet('hero_hurt', [heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[0], heroLegs.idle, -1)]),\n"
     "  // sword swing: wind-up (leaning back, knees bent), strike (lunging forward), follow-through\n"
     "  hero_atk: heroSet('hero_atk', [heroPose(heroTop[0], heroLegs.crouch, -1), heroPose(heroTop[1], heroLegs.runA, 2), heroPose(heroTop[0], heroLegs.land, 1)]),\n"
     "  hero_dash: heroSet('hero_dash', [heroPose(heroTop[1], heroLegs.runB, 3), heroPose(heroTop[0], heroLegs.jump, 2)]),\n"
     "  hero_guard: heroSet('hero_guard', [heroPose(heroTop[0], heroLegs.pushA, -1)]),\n"
     "  hero_die: heroSet('hero_die', [heroPose(heroTop[1], heroLegs.idleS, -1), heroPose(heroTop[1], heroLegs.crouch, 1), heroPose(heroTop[1], heroLegs.land.slice(2), 2)]),"),
])
patch('src/game.js', [
    ("    if (swim) return { n: 'hero_run6', f: Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 6 };",
     "    if (swim) return { n: 'hero_run6', f: Math.floor(P.anim * (P.vy < -20 ? 14 : 7)) % 6 };\n"
     "    if (P.dash > 0) return { n: 'hero_dash', f: P.dash > 0.09 ? 0 : 1 };\n"
     "    if (P.guardT > 0 && P.onGround) return { n: 'hero_guard', f: 0 };\n"
     "    if (P.atk > 0 && P.onGround) { const u = 1 - P.atk / 0.2; return { n: 'hero_atk', f: u < 0.25 ? 0 : (u < 0.6 ? 1 : 2) }; }"),
    ("  function drawPlayer1(camX, camY) {\n    const P = Q.P;\n    if (Q.state === 'dead') return;",
     """  function drawPlayer1(camX, camY) {
    const P = Q.P;
    if (Q.state === 'dead') {   // falling: kneel, go down, fade (custom heroes sink and fade)
      const k = Q.stateT || 0, h0 = P.hero && HERO[P.hero]; if (k > 1.2) return;
      const x = Math.round(P.x + P.w / 2 - camX), bot = Math.round(P.y + P.h - camY);
      g.globalAlpha = k > 0.7 ? Math.max(0, 1 - (k - 0.7) / 0.5) : 1;
      if (h0 && h0.custom) { const sp = custSpr(h0, 'idle', 0, P), kk = h0.custom === 'fan' ? 16 / (sp.h || 16) : 1, sq = 1 - 0.45 * Math.min(1, k / 0.5); g.imageSmoothingEnabled = h0.custom === 'fan'; drawSpr(g, sp, x, bot, P.face < 0, false, kk, kk * sq); g.imageSmoothingEnabled = false; }
      else drawSpr(g, getSprite('hero_die', h0 ? h0.sw : {}, k < 0.2 ? 0 : (k < 0.45 ? 1 : 2)), x, bot, P.face < 0);
      g.globalAlpha = 1; return;
    }"""),
])
print('ok')
