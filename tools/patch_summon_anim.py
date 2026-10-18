import io
def rep(s, a, b, n=1):
    assert s.count(a) >= 1, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)
p='src/game.js'; s=io.open(p,encoding='utf-8').read()

# ---- giantPaint split into parts: legL, legR, body, weapon
s = rep(s, "  function giantPaint(P, o) {\n    if (o.wings) P.both(", "  function giantPaint(P, o, part) {\n    const all = !part, body = all || part === 'body';\n    if (part === 'legL') { P.rect(13, 42, 6, 13, o.robe); P.rect(12, 52, 8, 4, o.trim); return; }\n    if (part === 'legR') { P.rect(22, 42, 6, 13, o.robe); P.rect(21, 52, 8, 4, o.trim); return; }\n    if (body && o.wings) P.both(")
s = rep(s, "    P.rect(13, 42, 6, 13, o.robe); P.rect(22, 42, 6, 13, o.robe); P.rect(12, 52, 8, 4, o.trim); P.rect(21, 52, 8, 4, o.trim);\n    P.rect(10, 22, 21, 22, o.robe);", "    if (all) { P.rect(13, 42, 6, 13, o.robe); P.rect(22, 42, 6, 13, o.robe); P.rect(12, 52, 8, 4, o.trim); P.rect(21, 52, 8, 4, o.trim); }\n    if (body) {\n    P.rect(10, 22, 21, 22, o.robe);")
s = rep(s, "      case 'none': break;\n    }\n    const W = o.wcol;\n    switch (o.weapon) {", "      case 'none': break;\n    }\n    }\n    if (!all && part !== 'weapon') return;\n    const W = o.wcol;\n    switch (o.weapon) {")

# ---- parts cache + animated drawing
s = rep(s, "  const SUM_SPR = {};", """  const SUM_SPR = {}, SUM_PARTS = {};
  function summonParts(k) {
    if (SUM_PARTS[k]) return SUM_PARTS[k]; const o = GIANT[k]; if (!o) return null;
    const mk = part => paint(44, 58, P => giantPaint(P, o, part), '#14121f');
    return (SUM_PARTS[k] = { legL: mk('legL'), legR: mk('legR'), body: mk('body'), weapon: mk('weapon'), w: 44, h: 58 });
  }
  // animated giant: legs stride, body bobs and leans, the weapon swings when it attacks
  function drawGiantAnim(s, x, y, sc, a, dx) {
    const pt = summonParts(s.kind); if (!pt) return false;
    const f = s.f < 0 ? -1 : 1, mv = s.mv ? 1 : 0, ph = s.t * (mv ? 10 : 2.2), atk = s.atkT > 0 ? s.atkT / 0.35 : 0;
    const ox = -pt.w * sc / 2, oy = -pt.h * sc + sc, bob = mv ? -Math.abs(Math.sin(ph)) * 2.2 : Math.sin(ph) * -0.9, lean = (mv ? Math.sin(ph) * 0.03 : 0) + atk * 0.16;
    const lift = (side) => mv ? -Math.max(0, Math.sin(ph + side * Math.PI)) * 3.5 : 0;
    g.save(); g.globalAlpha = a; g.translate(x + (dx || 0), y); g.scale(f, 1);
    g.drawImage(pt.legL.c, ox, oy + lift(0)); g.drawImage(pt.legR.c, ox, oy + lift(1));
    g.save(); g.translate(0, bob); g.rotate(lean);
    g.drawImage(pt.body.c, ox, oy);
    const px = ox + 36 * sc, py = oy + 28 * sc, ang = Math.sin(ph * 0.7) * 0.06 + (atk > 0 ? -1.15 + (1 - atk) * 2.5 : (mv ? Math.sin(ph) * 0.12 : 0));
    g.translate(px, py); g.rotate(ang); g.drawImage(pt.weapon.c, -36 * sc + ox - ox, -28 * sc + oy - oy + 0); g.restore();
    g.restore();
    return true;
  }""")
s = rep(s, "      if (s.kind === 'golems') { for (const dx of [-26, 26]) drawSpr(g, sp, x + dx + (s.hitT > 0 ? 3 : 0), y + rise, dx < 0 ? false : true, false, sc, sc); }\n      else drawSpr(g, sp, x, y + rise + (giant ? 0 : Math.round(sp.h * sc / 2)), s.f < 0, false, sc, sc);",
    "      if (s.kind === 'golems') { for (const dx of [-26, 26]) { if (!drawGiantAnim(s, x, y + rise, sc, 0.8 * a, dx + (s.hitT > 0 ? 3 : 0))) drawSpr(g, sp, x + dx, y + rise, dx > 0, false, sc, sc); } }\n      else if (giant && drawGiantAnim(s, x, y + rise, sc, 0.8 * a)) { }\n      else drawSpr(g, sp, x, y + rise + (giant ? 0 : Math.round(sp.h * sc / 2)), s.f < 0, false, sc, sc);")

# ---- autonomous behaviour: walk to enemies and fight
s = rep(s, "  function summonItems() {", """  // summons fight on their own: they walk (or fly) to the nearest enemy and attack it; with no enemy they idle near their owner
  const SUM_WALK = { titan: [55, 70], frostgiant: [60, 90], shogun: [110, 60], treant: [45, 70], golems: [75, 30], thunderkirin: [130, 80], clones: [140, 40], stormgod: [60, 200], seagoddess: [70, 170], moongoddess: [60, 220], valkyrie: [100, 180], sunemperor: [50, 200], angel: [70, 180], ninetail: [80, 200] };
  function sumWalk(s, o, dt) {
    const w = SUM_WALK[s.kind]; s.mv = 0;
    if (!w) { const tx = o.x + 4 - o.face * 30, k = 1 - Math.exp(-4 * dt); s.x += (tx - s.x) * k; s.y = groundYAt(s.x); s.f = o.face; return; }
    const t = nearestFoe(s.x, s.y - 30, 640);
    if (t) { const d = t.x + t.w / 2 - s.x, ad = Math.abs(d); s.f = d < 0 ? -1 : 1; if (ad > w[1]) { s.x += s.f * Math.min(w[0] * dt, ad - w[1]); s.mv = 1; } }
    else { const d = o.x + 4 - s.x, ad = Math.abs(d); if (ad > 70) { s.f = d < 0 ? -1 : 1; s.x += s.f * Math.min(w[0] * 0.9 * dt, ad - 60); s.mv = 1; } else s.f = o.face; }
    if (Q.arenaSealed) s.x = arenaClamp(s.x);
    s.y = groundYAt(s.x);
  }
  function summonItems() {""")
s = rep(s, "      else if (fly) { const tx = o.x + 4 + o.face * 20, ty = o.y - 46 + Math.sin(s.t * 2) * 4, k = 1 - Math.exp(-3 * dt); s.x += (tx - s.x) * k; s.y += (ty - s.y) * k; s.f = o.face; }\n      else { const tx = o.x + 4 - o.face * (GIANT[s.kind] && GIANT[s.kind].small ? 0 : 30), k = 1 - Math.exp(-4 * dt); s.x += (tx - s.x) * k; s.y = groundYAt(s.x); s.f = o.face; }",
    "      else if (fly) { const dr = (s.kind === 'dragonking' || s.kind === 'dragonform') ? nearestFoe(s.x, s.y, 700) : null, sd0 = dr ? (dr.x + dr.w / 2 < s.x ? -1 : 1) : o.face, tx = dr ? dr.x + dr.w / 2 - sd0 * 150 : o.x + 4 + o.face * 20, ty = dr ? dr.y - 50 + Math.sin(s.t * 2) * 6 : o.y - 46 + Math.sin(s.t * 2) * 4, k = 1 - Math.exp(-3 * dt); s.mv = Math.abs(tx - s.x) > 6 ? 1 : 0; s.x += (tx - s.x) * k; s.y += (ty - s.y) * k; s.f = sd0; }\n      else sumWalk(s, o, dt);")
# attack pulse for the animation: whenever a summon re-arms its attack timer
s = rep(s, "      const near = r => nearestFoe(s.x, s.y - 30, r), all = r => foes().filter(e => Math.abs(e.x + e.w / 2 - s.x) < r);\n      switch (s.kind) {",
    "      const near = r => nearestFoe(s.x, s.y - 30, r), all = r => foes().filter(e => Math.abs(e.x + e.w / 2 - s.x) < r);\n      const cd0 = s.cd;\n      switch (s.kind) {")
s = rep(s, "    G.sums = G.sums.filter(s => s.life > 0);\n    if (G.slashes)", "    G.sums = G.sums.filter(s => s.life > 0);\n    if (G.slashes)")
io.open(p,'w',encoding='utf-8').write(s)
print('ok')
