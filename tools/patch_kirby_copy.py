# 1) fan heroes drawn sharp in the pickers (full picture through the hi-res queue, brighter cell)
# 2) Kirby's R is "Copy": inhale an enemy (a boss or a big one too) and become a fake copy of it for 5 s
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

rep("""    if (h.custom === 'fan') g.imageSmoothingEnabled = true;
    drawSpr(g, h.custom ? custSpr(h, 'idle', (fr || 0) & 1) : getSprite('hero_idle', h.sw, fr || 0), x, bot, f < 0);
    g.imageSmoothingEnabled = false;""", """    const fo = h.custom === 'fan' && FAN_IMG[h.fan];
    if (fo) {   // the team's drawing at full resolution (not the half-size copy), so the pickers are as sharp as the game
      const w = fo.spr.w, hh = fo.spr.h; g.save(); g.translate(x, bot); if (f < 0) g.scale(-1, 1);
      hiImg(fo.im, 0, 0, fo.im.width, fo.im.height, -w / 2, -hh, w, hh); g.restore();
    } else drawSpr(g, h.custom ? custSpr(h, 'idle', (fr || 0) & 1) : getSprite('hero_idle', h.sw, fr || 0), x, bot, f < 0);
    g.imageSmoothingEnabled = false;""")
rep("""g.fillStyle = on ? 'rgba(255,211,78,.18)' : 'rgba(255,255,255,.04)'; g.fillRect(cx + 1, cy, cw - 2, chh - 2);""",
    """g.fillStyle = on ? 'rgba(255,211,78,.18)' : (h.custom === 'fan' ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)'); g.fillRect(cx + 1, cy, cw - 2, chh - 2);""")

# ---------- Kirby: R = Copy ----------
rep("""        if (P.copy) { shootG({ x: cx + f * 8, y: cy, vx: f * 280, vy: 0, life: 0.9, dmg: d * 2 + 2, pierceN: 5, shape: 'orb', col: '#ffd34e', trail: '#ffffff', sz: 6, f, skill: true }); pop(cx, cy - 22, sv('Spit!', 'Nhả!'), '#ffd34e'); P.copy = null; Snd.play('relic'); }
        else { P.inhT = 0.9; P.inhGot = false; Snd.play('whoosh'); }""",
    """        P.inhT = 0.9; P.inhGot = false; P.scanT = 0; Snd.play('whoosh');   // Copy: breathe in; whatever you swallow (or scan, for a boss) becomes your shape for 5 s""")
rep("""        for (const e of foes()) {
          if (e.isBoss || isBig(e) || e.hid || e.dead) continue; const dx = e.x + e.w / 2 - mx, dy = e.y + e.h / 2 - my, dd = Math.hypot(dx, dy);
          if (dd > 72 || (Math.sign(dx) !== P.face && Math.abs(dx) > 4) || Math.abs(dy) > 10 + dd * 0.5) continue;
          e.x -= dx / (dd || 1) * 150 * dt; e.y -= dy / (dd || 1) * 150 * dt; e.vx = 0; e.stunT = Math.max(e.stunT || 0, 0.2);
          if (dd < 12) { e.dead = true; onKill(e); P.inhGot = true; P.copy = COPY[e.cfg && e.cfg.spr] || 'star'; P.inhT = 0; Snd.play('relic'); const ci = COPY_INFO[P.copy]; pop(P.x + 4, P.y - 20, sv('Copy: ', 'Sao chép: ') + LN(ci.n) + '!', ci.col); emit(mx, my, 16, { col: [ci.col, '#ffffff'], sp0: 20, sp1: 80 }); break; }
        }
        if (P.inhT <= 0 && !P.inhGot) {""", """        for (const e of foes()) {
          if (e.hid || e.dead) continue; const huge = !!(e.isBoss || isBig(e)), dx = e.x + e.w / 2 - mx, dy = e.y + e.h / 2 - my, dd = Math.hypot(dx, dy);
          if (huge) {   // too big to swallow: hold the breath at it for half a second to scan it
            const edge = Math.max(0, Math.abs(dx) - e.w / 2);
            if (edge > 64 || (Math.sign(dx) !== P.face && Math.abs(dx) > e.w / 2) || Math.abs(dy) > e.h / 2 + 24) continue;
            P.scanT = (P.scanT || 0) + dt; emit(e.x + e.w / 2 + rr(-e.w / 3, e.w / 3), e.y + e.h / 2 + rr(-e.h / 3, e.h / 3), 1, { col: ['#ff9fd0', '#ffffff'], sp0: 0, sp1: 4, vx: (mx - e.x - e.w / 2) * 1.6, vy: (my - e.y - e.h / 2) * 1.6, grav: 0, l0: 0.25, l1: 0.4 });
            if (P.scanT > 0.5) { dmgFoe(e, 3 + baseDmg(), true, true); kirbyCopy(P, e); break; }
            continue;
          }
          if (dd > 72 || (Math.sign(dx) !== P.face && Math.abs(dx) > 4) || Math.abs(dy) > 10 + dd * 0.5) continue;
          e.x -= dx / (dd || 1) * 150 * dt; e.y -= dy / (dd || 1) * 150 * dt; e.vx = 0; e.stunT = Math.max(e.stunT || 0, 0.2);
          if (dd < 12) { e.dead = true; onKill(e); kirbyCopy(P, e); break; }
        }
        if (P.inhT <= 0 && !P.inhGot) { P.skCd = 0.6;""")
rep("""    if (mk === 'inhale') {   // inhale: pull small enemies into the mouth and copy them; only air = puff up and float
      if (P.onGround) P.flutter = false;""", """    if (mk === 'inhale') {   // inhale: pull small enemies into the mouth and copy them; only air = puff up and float
      if (P.onGround) P.flutter = false;
      if (P.copyT > 0) {   // the copy lasts 5 s; in a copied body anything you touch is hurt
        P.copyT -= dt; const cm = P.cpy;
        if (cm) { cm.tk = (cm.tk || 0) - dt; if (cm.tk <= 0) { cm.tk = 0.35; const box = { x: P.x - 8, y: P.y - 6, w: P.w + 16, h: P.h + 8 }; for (const e of foes()) if (ov(box, e)) { dmgFoe(e, 2 + baseDmg(), true); emit(e.x + e.w / 2, e.y + e.h / 2, 6, { col: ['#ff9fd0', '#fff'], sp0: 30, sp1: 90 }); } } }
        if (P.copyT <= 0) { P.copy = null; P.cpy = null; P.copyT = 0; emit(P.x + 4, P.y + 6, 24, { col: ['#ff9fd0', '#ffffff', '#ffd34e'], sp0: 30, sp1: 120 }); addRing(P.x + 4, P.y + 7, '#ff9fd0', 44, 0.4); Snd.play('chime'); pop(P.x + 4, P.y - 18, sv('Back to normal', 'Trở lại bình thường'), '#ff9fd0'); }
      }""")
rep("""  const COPY = {""", """  // Kirby's Copy: take the shape of what was inhaled for 5 s (a boss or a big foe is scanned; the boss only loses a little)
  function kirbyCopy(P, e) {
    const huge = !!(e.isBoss || isBig(e)), key = e.cfg && e.cfg.spr, ab = huge ? 'boss' : (COPY[key] || 'star'), ci = COPY_INFO[ab];
    P.inhGot = true; P.inhT = 0; P.scanT = 0; P.copy = ab; P.copyT = 5; P.skCd = 7;
    const bspr = e.isBoss ? (e.spr && e.spr.c ? e.spr : null) : null;
    P.cpy = (bspr || key) ? { key, swap: e.cfg && e.cfg.swap, out: e.cfg && e.cfg.out, bspr, w: e.w, h: e.h, tk: 0 } : null;
    const nm = e.cfg && e.cfg.name, label = nm && typeof nm === 'object' ? LN(nm) : (typeof nm === 'string' ? nm : '');
    Snd.play('relic'); pop(P.x + 4, P.y - 22, sv('Copy: ', 'Sao chép: ') + (label || LN(ci.n)) + '!', ci.col); addRing(P.x + 4, P.y + 7, '#ff9fd0', 50, 0.45);
    emit(P.x + 4, P.y + 6, 26, { col: [ci.col, '#ff9fd0', '#ffffff'], sp0: 20, sp1: 100 }); Q.G.tint = { c: '#ff9fd0', t: 0.3 };
  }
  const COPY = {""")
rep("""spark: { n: { en: 'Spark', vi: 'Điện' }, col: '#ffe44e' },""", """boss: { n: { en: 'Boss', vi: 'Trùm' }, col: '#ff9fd0' }, spark: { n: { en: 'Spark', vi: 'Điện' }, col: '#ffe44e' },""")
# the attack in the copied body is stronger, and a boss copy gets its own blast
rep("""      const x = P.x + 4 + f * 6, y = P.y + 6, d = 2 + baseDmg() + (P.hdmg || 0);
      if (P.flutter && !P.onGround)""", """      const x = P.x + 4 + f * 6, y = P.y + 6, d = Math.round((2 + baseDmg() + (P.hdmg || 0)) * (P.cpy ? 1.7 : 1));
      if (P.flutter && !P.onGround)""")
rep("""      else { shootG({ x, y, vx: f * 260, vy: 0, life: 0.8, dmg: d + 2, pierceN: 3, shape: 'orb', col: '#ffd34e', trail: '#fff', sz: 4, f }); Snd.play('relic'); }
      return true;""", """      else if (c === 'boss') { nova(P.x + 4, P.y + 7, 56, d + 3); for (let k = -1; k <= 1; k++) shootG({ x, y, vx: f * 250, vy: k * 40, life: 0.9, dmg: d + 1, pierceN: 3, shape: 'orb', col: '#ff9fd0', trail: '#ffffff', sz: 5, f }); Q.shake = Math.max(Q.shake, 0.3); Snd.play('boom'); }
      else { shootG({ x, y, vx: f * 260, vy: 0, life: 0.8, dmg: d + 2, pierceN: 3, shape: 'orb', col: '#ffd34e', trail: '#fff', sz: 4, f }); Snd.play('relic'); }
      return true;""")
# draw the copied body instead of Kirby
rep("""    const bob = 0;
    if (P.trail) for""", """    const bob = 0;
    if (P.cpy) {   // Kirby in the shape of what he swallowed (a flickering pink outline marks it as a copy)
      const m = P.cpy; let ms = m.bspr || getSprite(m.key, m.swap || {}, m.key === 'bat' ? Math.floor(P.anim * 8) % 2 : 0, m.out);
      const hgt = ms.h || m.h || 14, k = m.bspr ? clamp(34 / hgt, 0.25, 1) : 1.1, bobY = Math.round(Math.sin(P.anim * 9) * (Math.abs(P.vx) > 15 ? 1 : 0.4));
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 + 0.1 * Math.sin(Q.t * 12); disc(g, x, Math.round(bot - hgt * k / 2), Math.round(hgt * k * 0.7), '#ff9fd0'); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      drawSprT(g, ms, x, bot + bobY, P.face < 0, P.copyT < 1 && Math.floor(Q.t * 12) % 2 === 0, k, k, 0, 1);
      g.fillStyle = '#14121f'; g.fillRect(x - 9, bot - Math.round(hgt * k) - 7, 18, 3); g.fillStyle = '#ff9fd0'; g.fillRect(x - 8, bot - Math.round(hgt * k) - 6, Math.round(16 * Math.max(0, P.copyT) / 5), 1);
      if (swim) g.restore(); if (coop) drawCoopTag(P, x, bot); return;
    }
    if (P.trail) for""")
io.open(p, 'w', encoding='utf-8').write(s)

p = 'src/heroes.js'
s = io.open(p, encoding='utf-8').read()
rep("n: H2('Inhale', 'Hút & Sao Chép')", "n: H2('Copy', 'Sao Chép')")
rep("sk: { k: 'inhale', cd: 1.2, col: '#ff9fd0'", "sk: { k: 'inhale', cd: 7, col: '#ff9fd0'")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
