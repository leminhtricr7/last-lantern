import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, 'MISSING/DUP: ' + a[:90]
    s = s.replace(a, b)

a0 = s.index("  // optional artist sprites: assets/summons/<kind>_idle|walk|attack.png")
a1 = s.index("  function drawSummons(camX, camY) {")
s = s[:a0] + """  // ===== the artist's summon sprites (assets/summons, cut from art/summon_sheets by tools/extract_summons.py) =====
  let SUM_MAN = null; const SUM_IMG = {};
  fetch('assets/summons/manifest.json').then(r => r.ok ? r.json() : null).then(m => { SUM_MAN = m || {}; }).catch(() => { SUM_MAN = {}; });
  const SUM_ALIAS = { dragonform: ['dragonking', 'hue-rotate(-38deg) saturate(1.35) brightness(0.92)'] };
  const SUM_H = { titan: 120, stormgod: 120, seagoddess: 112, moongoddess: 112, frostgiant: 132, shogun: 104, treant: 132, aegis: 100, valkyrie: 100, angel: 104, golems: 66, phoenix: 78, dragonking: 96, dragonform: 96, ninetail: 66, clones: 36 };
  function sumArt(k) {
    if (SUM_IMG[k]) return SUM_IMG[k]; if (!SUM_MAN) return null;
    const al = SUM_ALIAS[k], src = al ? al[0] : k, m = SUM_MAN[src]; if (!m) return (SUM_IMG[k] = { none: true });
    const o = SUM_IMG[k] = { m };
    for (const n in m) {
      const im = new Image();
      im.onload = () => { let c = im; if (al) { const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const cx = cv.getContext('2d'); cx.filter = al[1]; cx.drawImage(im, 0, 0); c = cv; } o[n] = c; };
      im.src = 'assets/summons/' + src + '_' + n + '.png';
    }
    return o;
  }
  // animator: idle (breathing), walk cycle, attack, hurt and death strips; the final form is one big pose animated by code
  function drawSumArt(s, x, y, a) {
    const o = sumArt(s.kind); if (!o || o.none || !(o.idle || o.walk)) return 0;
    const H = (SUM_H[s.kind] || 100) * (s.stage === 2 ? 1.35 : 1), f = s.f < 0 ? -1 : 1;
    const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform';
    const by = y + (fly ? H / 2 : 0) + (fly ? Math.sin(s.t * 3) * 3 : 0);
    let im, meta, fi = 0, ox = 0, oy = 0, sx = 1, sy = 1, rot = 0;
    const atk = s.atkT > 0 ? clamp(s.atkT / 0.35, 0, 1) : 0, sw = Math.sin((1 - atk) * Math.PI);
    if (s.dying > 0 && o.death) { im = o.death; meta = o.m.death; fi = Math.min(meta.n - 1, Math.floor((1 - s.dying / 0.8) * meta.n)); }
    else if (s.stage === 2 && o.evo) {
      im = o.evo; meta = o.m.evo; const ph = s.t * (s.mv ? 9 : 2.4);
      oy = s.mv ? -Math.abs(Math.sin(ph)) * 3 : Math.sin(ph) * 1.2; rot = (s.mv ? Math.sin(ph) * 0.045 : 0) + (atk > 0 ? sw * 0.16 : 0);
      ox = atk > 0 ? sw * 12 : 0; sx = sy = 1 + (atk > 0 ? sw * 0.07 : 0); sy *= 1 + Math.sin(s.t * 2.4) * 0.014;
      if (s.hurtT > 0) ox -= 4;
    }
    else if (s.hurtT > 0 && o.hurt) { im = o.hurt; meta = o.m.hurt; fi = Math.min(meta.n - 1, Math.floor((1 - s.hurtT / 0.2) * (meta.n - 1))); }
    else if (atk > 0 && o.attack) { im = o.attack; meta = o.m.attack; fi = Math.min(meta.n - 1, Math.floor((1 - atk) * meta.n)); }
    else if (s.mv && o.walk) { im = o.walk; meta = o.m.walk; fi = Math.floor(s.t * 11) % meta.n; }
    else { im = o.idle || o.walk; meta = o.idle ? o.m.idle : o.m.walk; sy = 1 + Math.sin(s.t * 2.6) * 0.016; }
    const n = meta.n, fw = im.width / n, fh = im.height, sc = H / (meta.ch || fh);
    const copies = s.kind === 'golems' ? [-24, 24] : s.kind === 'clones' ? [-22, 0, 22] : [0];
    copies.forEach((d, i) => {
      g.save(); g.imageSmoothingEnabled = true; g.globalAlpha = a * (s.kind === 'clones' ? 0.82 : 1);
      g.translate(x + d + f * ox, by + oy); g.rotate(rot * f); g.scale(f * sx, sy);
      const fj = n > 1 && copies.length > 1 && fi === Math.floor(s.t * 11) % n ? (fi + i * 3) % n : fi;
      g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      g.restore();
    });
    return H;
  }
  function sumHud(s, x, top, a) {
    if (s.hpMax && !s.dying && (s.stage === 2 || s.hp < s.hpMax)) { const bw = s.stage === 2 ? 44 : 32, by = Math.round(top) - 8; g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = '#6a1a1a'; g.fillRect(x - bw / 2, by, bw, 3); g.fillStyle = s.stage === 2 ? '#ffd34e' : '#7ed957'; g.fillRect(x - bw / 2, by, Math.round(bw * clamp(s.hp / s.hpMax, 0, 1)), 3); }
    if (s.stage === 2 && !s.dying) { const R2 = 90 + Math.sin(s.t * 6) * 6, cy = (top + 50 + (top + 50)) / 2; g.globalCompositeOperation = 'lighter'; const g2 = g.createRadialGradient(x, cy + 30, 0, x, cy + 30, R2); g2.addColorStop(0, 'rgba(255,211,78,.2)'); g2.addColorStop(1, 'rgba(255,211,78,0)'); g.fillStyle = g2; g.fillRect(x - R2, cy + 30 - R2, R2 * 2, R2 * 2); g.globalCompositeOperation = 'source-over'; }
  }
""" + s[a1:]

rep("      if (drawSumSheet(s, x, y, 0.95 * a)) continue;\n", """      { const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform', hh = drawSumArt(s, x, y, a); if (hh) { if (Math.random() < (s.stage === 2 ? 0.7 : 0.3)) emit(s.x + rr(-20, 20), s.y - rr(0, hh * 0.8) + (fly ? hh / 2 : 0), 1, { col: [s.stage === 2 ? '#ffd34e' : info.glow, '#fff'], sp0: 3, sp1: 14, grav: -20, l0: 0.4, l1: 0.9 }); sumHud(s, x, y - hh + (fly ? hh / 2 : 0), a); continue; } }
""")
rep("""      if (s.hpMax && (s.stage === 2 || s.hp < s.hpMax)) { const bw = s.stage === 2 ? 44 : 32, by = y - Math.round((giant ? 58 : 36) * sc) - 8; g.fillStyle = '#14121f'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = '#6a1a1a'; g.fillRect(x - bw / 2, by, bw, 3); g.fillStyle = s.stage === 2 ? '#ffd34e' : '#7ed957'; g.fillRect(x - bw / 2, by, Math.round(bw * clamp(s.hp / s.hpMax, 0, 1)), 3); }
      if (s.stage === 2) { const R2 = 90 + Math.sin(s.t * 6) * 6; g.globalCompositeOperation = 'lighter'; const g2 = g.createRadialGradient(x, y - 50, 0, x, y - 50, R2); g2.addColorStop(0, 'rgba(255,211,78,.22)'); g2.addColorStop(1, 'rgba(255,211,78,0)'); g.fillStyle = g2; g.fillRect(x - R2, y - 50 - R2, R2 * 2, R2 * 2); g.globalCompositeOperation = 'source-over'; }
""", """      sumHud(s, x, y - Math.round((giant ? 58 : 36) * sc), a);
""")

# a summon that is beaten plays its death animation before it disappears
rep("      if (s.hp <= 0 && s.life > 0) { s.life = 0; emit(", "      if (s.dying > 0) { s.dying -= dt; if (s.dying <= 0) s.life = 0; else s.life = Math.max(s.life, 0.5); continue; }\n      if (s.hp <= 0 && s.life > 0) { s.dying = 0.8; s.life = Math.max(s.life, 0.9); emit(")
rep("    G.sums = G.sums.filter(s => s.life > 0 && s.hp > 0);", "    G.sums = G.sums.filter(s => s.life > 0 && (s.hp > 0 || s.dying > 0));")
rep("      if (sm.life <= 0 || sm.hp <= 0 || sm.inv > 0", "      if (sm.life <= 0 || sm.hp <= 0 || sm.dying > 0 || sm.inv > 0")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
