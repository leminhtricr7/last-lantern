# The team's fan heroes (TEST BUILD ONLY, see heroes.js FAN_HEROES): their pictures from assets/fanheroes,
# drawn at full screen resolution, and their mechanics (Kayn's two forms, Tom, Jerry, Luffy, Sonic, Kirby, Jotaro, Dio).
# The original heroes' mechanics now go by mechanic type, so both share the same code.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- mechanics by type ----------
rep("(P.hero === 'teto' ? 0.75 + 1.25 * (P.mom || 0) : 1)", "(mechOf(P) === 'momentum' ? 0.75 + 1.25 * (P.mom || 0) : 1)")
rep("else if (P.hero === 'bong' && P.jumps < 7) {", "else if (mechOf(P) === 'inhale' && P.jumps < 7) {")
rep("P.vy = P.flutter && P.hero === 'bong' ?", "P.vy = P.flutter && mechOf(P) === 'inhale' ?")
rep("""    const id = P.hero, it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;
    if (id === 'caosu' && !gun) {""", """    const mk = mechOf(P), it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;
    if (mk === 'stand' && !gun) { P.standT = 0.32; P.standHit = new Set(); P.standD = baseDmg() + 2 + (P.hdmg || 0); return false; }   // Star Platinum punches along with the attack
    if (mk === 'world') { shootG({ x: P.x + 4 + f * 6, y: P.y + 6, vx: f * 360, vy: 0, life: 0.7, dmg: baseDmg() + 1, shape: 'bolt', col: '#e8e8f0', trail: '#ffd34e', sz: 2, f }); return false; }   // a knife with every attack
    if (mk === 'stretch' && !gun) {""")
rep("""    if (id === 'bong' && !gun) {
      const x = P.x + 4 + f * 6""", """    if (mk === 'inhale' && !gun) {
      const x = P.x + 4 + f * 6""")
rep("""  function heroMech(P, dt, dir) {
    const id = P.hero; if (!id) return;
    if (id === 'teto') {""", """  function mechOf(P) { const h = P && P.hero && HERO[P.hero]; return h ? h.mech || null : null; }
  // a sword hit landed: Kayn's Darkin bar, Rhaast's healing, Tom's frying pans
  function heroOnHit(P, e) {
    const mk = mechOf(P);
    if (mk === 'kayn') {
      if (P.form === 'rhaast') { P.rhN = (P.rhN || 0) + 1; if (P.rhN % 3 === 0) healP(P, 1); }
      else if ((P.dk || 0) < 100) { P.dk = Math.min(100, (P.dk || 0) + 12); if (P.dk >= 100 && isMe(P)) { pop(P.x + 4, P.y - 20, sv('DARKIN READY: press R!', 'DARKIN ĐẦY: bấm R!'), '#ff3a3a'); Snd.play('relic'); } }
    }
    if (P.hero === 'tom' && Math.random() < 0.2 && !e.dead) { shootG({ x: e.x + e.w / 2, y: Math.min(e.y - 40, Q.cam.y + 30), vx: 0, vy: 320, life: 0.9, dmg: baseDmg() + 2, stun: 1.6, shape: 'orb', col: '#3a3a46', trail: '#8a8a9a', sz: 5, f: 1, skill: true }); pop(e.x + e.w / 2, e.y - 30, sv('PAN!', 'CHẢO!'), '#cfd6e6'); }
  }
  function heroMech(P, dt, dir) {
    const id = P.hero, mk = mechOf(P); if (!id) return;
    if (mk === 'stand' && P.standT > 0) {   // Star Platinum's punch lands a moment after the hero's swing
      P.standT -= dt; const f = P.face, box = { x: f > 0 ? P.x + 8 : P.x - 44, y: P.y - 8, w: 44, h: P.h + 14 };
      if (P.standT < 0.2) for (const e of foes()) if (!P.standHit.has(e) && ov(box, e)) { P.standHit.add(e); dmgFoe(e, P.standD, false); chargeHit(); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: ['#8a7aff', '#fff'], sp0: 20, sp1: 90 }); Snd.play('hit'); }
    }
    if (mk === 'stand' && P.oraT > 0) {
      P.oraT -= dt; P.oraTick = (P.oraTick || 0) - dt;
      if (P.oraTick <= 0) { P.oraTick = 0.06; const f = P.face, box = { x: f > 0 ? P.x + 6 : P.x - 62, y: P.y - 10, w: 64, h: P.h + 18 }; let any = false; for (const e of foes()) if (ov(box, e)) { any = true; dmgFoe(e, Math.max(1, Math.round((2 + baseDmg()) * 0.55)), false, true); if (Math.random() < 0.4) emit(e.x + e.w / 2 + rr(-6, 6), e.y + e.h / 2 + rr(-6, 6), 3, { col: ['#fff', '#8a7aff'], sp0: 20, sp1: 70 }); } if (any) Snd.play('hit'); if (Math.random() < 0.18) pop(P.x + 4 + f * 20, P.y - 14 - rr(0, 10), 'ORA!', '#c8b8ff'); }
    }
    if (mk === 'jerry') {   // drops a snap trap behind himself every few seconds
      P.trapCd = (P.trapCd === undefined ? 3 : P.trapCd) - dt;
      if (P.trapCd <= 0 && P.onGround) { P.trapCd = 5; (Q.G.mtraps = Q.G.mtraps || []).push({ x: P.x + 4 - P.face * 10, y: P.y + P.h, t: 0 }); Snd.play('select'); }
    }
    if (mk === 'momentum') {""")
rep("""    if (id === 'caosu') {   // the stretching arm""", """    if (mk === 'stretch') {   // the stretching arm""")
rep("""    if (id === 'bong') {   // inhale:""", """    if (mk === 'inhale') {   // inhale:""")
rep("""  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);""", """  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, mk = mechOf(P), cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    if (mk === 'kayn') { const w = 16; g.fillStyle = '#14121f'; g.fillRect(x - w / 2 - 1, bot - 30, w + 2, 3); g.fillStyle = P.form === 'rhaast' ? '#ff3a3a' : '#a15be0'; g.fillRect(x - w / 2, bot - 29, Math.round(w * (P.form === 'rhaast' ? 1 : (P.dk || 0) / 100)), 1); if (P.form === 'rhaast' || (P.dk || 0) >= 100) drawAura(x, bot - 10, 16, '#ff3a3a', 0.3 + Math.sin(Q.t * 6) * 0.1); }
    if (mk === 'stand' && (P.standT > 0 || P.oraT > 0)) {   // the Stand: a tall spirit that steps out in front of the hero
      const f = P.face, sx = x + f * 10, sb = bot - 2 + Math.sin(Q.t * 4), spr = getSprite('hero_idle4', STAND_SW, 0);
      g.save(); g.globalAlpha = 0.7; g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, sx, sb, f < 0, false, 1.5, 1.5); g.restore();
      const n = P.oraT > 0 ? 7 : 1; for (let i = 0; i < n; i++) { const fx = sx + f * (12 + (n > 1 ? Math.random() * 36 : (0.32 - P.standT) * 90)), fy = sb - 18 + (n > 1 ? rr(-8, 8) : 0); g.fillStyle = '#8a7aff'; g.fillRect(Math.round(fx) - 3, Math.round(fy) - 2, 6, 5); g.fillStyle = '#ffffff'; g.fillRect(Math.round(fx) - 1, Math.round(fy) - 1, 2, 2); }
    }
    if (mk === 'jerry' && Q.G.mtraps) for (const tr of Q.G.mtraps) { const tx = Math.round(tr.x - cx0), ty = Math.round(tr.y - cy0); g.fillStyle = '#8a5a34'; g.fillRect(tx - 5, ty - 2, 10, 2); g.fillStyle = '#cfd6e6'; g.fillRect(tx - 4, ty - 4, 8, 1); g.fillRect(tx - 4, ty - 4, 1, 2); g.fillRect(tx + 3, ty - 4, 1, 2); g.fillStyle = '#ffd34e'; g.fillRect(tx - 1, ty - 3, 2, 1); }""")
rep("""    if (id === 'caosu') {
      const sx0 = x + P.face * 3""", """    if (mk === 'stretch') {
      const sx0 = x + P.face * 3""")
rep("""    if (id === 'bong') {
      const top = bot - (P.flutter && !P.onGround ? 24 : 18)""", """    if (mk === 'inhale') {
      const top = bot - (P.flutter && !P.onGround ? 24 : 18)""")
rep("""    if (id === 'teto' && !P.ball && (P.mom || 0) > 0.6)""", """    if (mk === 'momentum' && !P.ball && (P.mom || 0) > 0.6)""")
rep("""        curHit = null; chargeHit();""", """        curHit = null; chargeHit(); heroOnHit(P, e);""")
# Jerry: small and hard to hit
rep("""      const dod = aSt('dodge');""", """      if (mechOf(P) === 'jerry' && Math.random() < 0.35) { P.inv = 0.5; Snd.play('whoosh'); pop(P.x + 4, P.y - 12, sv('Missed!', 'Hụt!'), '#f0a050'); return false; }
      const dod = aSt('dodge');""")

# ---------- skills ----------
rep("""      case 'gatling': P.gatT = 1.2;""", """      case 'kaynR': {
        if (P.form === 'rhaast') {   // a wide scythe sweep, then back to Shadow
          const r = 74; addRing(cx, cy, '#ff3a3a', r, 0.4); Q.shake = Math.max(Q.shake, 0.5); Snd.play('slash'); Snd.play('boom');
          for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i / 17) * Math.PI, xx = cx + f * Math.cos(a) * r * 0.9, yy = cy + Math.sin(a) * r * 0.6; emit(xx, yy, 2, { col: ['#ff3a3a', '#14121f', '#fff'], sp0: 10, sp1: 50 }); }
          for (const e of foes()) { const dx = e.x + e.w / 2 - cx; if (Math.sign(dx) !== f && Math.abs(dx) > 8) continue; if (Math.hypot(dx, e.y + e.h / 2 - cy) < r + e.w / 2) { dmgFoe(e, d * 3, true); healP(P, 1); } }
          P.form = null; P.hdmg = HERO.kayn.dmg; Q.msg = sv('Back to Shadow form.', 'Quay lại dạng Shadow.'); Q.msgT = 2;
        } else if ((P.dk || 0) >= 100) {   // full Darkin bar: become Rhaast
          P.form = 'rhaast'; P.dk = 0; P.rhN = 0; P.hdmg = HERO.kayn.dmg + 2; addRing(cx, cy, '#ff3a3a', 110, 0.7); emit(cx, cy, 50, { col: ['#ff3a3a', '#14121f', '#fff'], sp0: 30, sp1: 180 }); Q.shake = Math.max(Q.shake, 0.7); Snd.play('relic'); Snd.play('explode');
          Q.msg = sv('RHAAST! Harder hits that heal you.', 'RHAAST! Đánh mạnh hơn và hồi máu khi đánh.'); Q.msgT = 3; P.skCd = 1;
        } else {   // dash through enemies
          const x0 = P.x, hit = new Set(); P.inv = Math.max(P.inv, 0.45);
          for (let k = 0; k < 11; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); emit(P.x + 4, P.y + 7, 2, { col: ['#a15be0', '#14121f'], sp0: 5, sp1: 30, l0: 0.2, l1: 0.4 }); }
          const box = { x: Math.min(x0, P.x) - 4, y: P.y - 6, w: Math.abs(P.x - x0) + 16, h: P.h + 12 };
          for (const e of foes()) if (!hit.has(e) && ov(box, e)) { hit.add(e); dmgFoe(e, d, true); chargeHit(); P.dk = Math.min(100, (P.dk || 0) + 15); emit(e.x + e.w / 2, e.y + e.h / 2, 10, { col: ['#a15be0', '#fff'], sp0: 30, sp1: 110 }); }
          Snd.play('slash');
        }
        break;
      }
      case 'jerrydash': {   // a quick slip; enemies next to him get dragged along and knocked out
        const x0 = P.x, grab = foes().filter(e => !e.isBoss && Math.abs(e.x + e.w / 2 - (P.x + 4)) < 44 && Math.abs(e.y + e.h / 2 - (P.y + 7)) < 30); P.inv = Math.max(P.inv, 0.5);
        for (let k = 0; k < 15; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); }
        for (const e of grab) { e.x = P.x + 4 - f * (14 + Math.random() * 10) - e.w / 2; e.stunT = Math.max(e.stunT || 0, 1.4); dmgFoe(e, d, true); emit(e.x + e.w / 2, e.y + e.h / 2, 8, { col: ['#f0a050', '#fff'], sp0: 20, sp1: 70 }); }
        Snd.play('dash'); if (grab.length) pop(cx, cy - 26, sv('Got you!', 'Kéo theo!'), '#f0a050'); break;
      }
      case 'ora': P.oraT = 1.5; P.oraTick = 0; Snd.play('whoosh'); pop(cx, cy - 26, 'ORA ORA ORA!', '#8a7aff'); break;
      case 'theworld': {
        const G = Q.G; G.tsT = 3.5; G.tsOwner = P; G.tsTick = 0; G.tsKn = []; Q.shake = Math.max(Q.shake, 0.4); Snd.play('chime'); if (Snd.cineHit) Snd.cineHit('drop');
        Q.msg = sv('THE WORLD! Time has stopped.', 'THE WORLD! Thời gian đã ngừng lại.'); Q.msgT = 2.5; break;
      }
      case 'gatling': P.gatT = 1.2;""")

# ---------- time stop: Dio throws knives that hang in the air, then fly when time flows ----------
rep("""    if (G.tsTick <= 0) { G.tsTick = 0.07; const t = nearestFoe(""", """    if (mechOf(P) === 'world') {
      if (G.tsTick <= 0) { G.tsTick = 0.05; const list = foes().filter(e => Math.abs(e.x - P.x) < VW * 0.6 && Math.abs(e.y - P.y) < VH * 0.6); const t = list[Math.floor(Math.random() * list.length)];
        if (t) { const a = Math.random() * 6.283, r = 30 + Math.random() * 40, kx = t.x + t.w / 2 + Math.cos(a) * r, ky = t.y + t.h / 2 + Math.sin(a) * r * 0.7; (G.tsKn = G.tsKn || []).push({ x: kx, y: ky, t }); t.tsD = (t.tsD || 0) + Math.max(1, Math.round((2 + baseDmg()) * 0.5)); if (G.tsKn.length % 6 === 0) Snd.play('select'); } }
    } else if (G.tsTick <= 0) { G.tsTick = 0.07; const t = nearestFoe(""")
rep("""      G.tsT = 0; G.tsHit = null; Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.6);""", """      G.tsT = 0; G.tsHit = null; Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.6);
      for (const k of G.tsKn || []) { const tx = k.t.x + k.t.w / 2, ty = k.t.y + k.t.h / 2, d = Math.hypot(tx - k.x, ty - k.y) || 1; shootG({ x: k.x, y: k.y, vx: (tx - k.x) / d * 420, vy: (ty - k.y) / d * 420, life: 0.4, dmg: 1, quiet: true, shape: 'bolt', col: '#e8e8f0', sz: 2, f: tx > k.x ? 1 : -1, skill: true }); }
      G.tsKn = [];""")
rep("""    const x = Math.round(P.x + 4 - cx0 - P.face * 8), bot = Math.round(P.y + P.h - cy0 - 4 + Math.sin(Q.t * 3) * 2), spr = getSprite('hero_idle4', GUARD_SW, 0);""", """    for (const k of G.tsKn || []) { const kx = k.x - cx0, ky = k.y - cy0, a = Math.atan2(k.t.y + k.t.h / 2 - k.y, k.t.x + k.t.w / 2 - k.x); g.save(); g.translate(Math.round(kx), Math.round(ky)); g.rotate(a); g.fillStyle = '#e8e8f0'; g.fillRect(-4, -1, 7, 2); g.fillStyle = '#ffd34e'; g.fillRect(-6, -1, 2, 2); g.restore(); }
    const world = mechOf(P) === 'world', x = Math.round(P.x + 4 - cx0 - P.face * 8), bot = Math.round(P.y + P.h - cy0 - 4 + Math.sin(Q.t * 3) * 2), spr = getSprite('hero_idle4', world ? WORLD_SW : GUARD_SW, 0);""")
rep("""  const GUARD_SW = {""", """  const STAND_SW = { a: '#d8d0ff', A: '#6a5ae0', q: '#1a1a5a', b: '#3a3aa0', r: '#ffd34e', f: '#2a2a6a', o: '#8a7aff' }, WORLD_SW = { a: '#fff6c0', A: '#e0c040', q: '#5a4a10', b: '#a08020', r: '#3a9a5a', f: '#ffe08a', o: '#ffd34e' };
  const GUARD_SW = {""")
rep("""    txt(Math.max(0, G.tsT).toFixed(1) + 's', VW / 2, 34,""", """    if (world) txt('THE WORLD', VW / 2, 46, { al: 'center', size: 7, bold: true, col: '#ffd34e', ol: '#14121f' });
    txt(Math.max(0, G.tsT).toFixed(1) + 's', VW / 2, 34,""")

# ---------- the pictures ----------
rep("""  function custSpr(h, k, f) { if (h.custom === 'puff') return puffSprite(k, f, h.sw); return mikuSprite(k === 'big' || k === 'inhale' ? 'idle' : k, f); }""",
    """  // the team's drawings (assets/fanheroes): a half-size sprite for menus and films, the full picture for the hero in play
  const FAN_IMG = {}, FAN_SC = 0.5;
  ['kayn', 'rhaast', 'tom', 'jerry', 'luffy', 'sonic', 'kirby', 'jotaro', 'dio'].forEach(k => {
    const im = new Image(); im.onload = () => {
      const w = Math.round(im.width * FAN_SC), h = Math.round(im.height * FAN_SC), mk = flip => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; if (flip) { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(im, 0, 0, w, h); return c; };
      const c = mk(false), f = mk(true); FAN_IMG[k] = { im, spr: { c, f, cw: c, fw: f, w, h } };
    }; im.src = 'assets/fanheroes/' + k + '.png';
  });
  const fanKey = (h, P) => (P && P.form === 'rhaast' && h.fan === 'kayn') ? 'rhaast' : h.fan;
  function custSpr(h, k, f, P) {
    if (h.custom === 'fan') { const o = FAN_IMG[fanKey(h, P)]; return o ? o.spr : getSprite('hero_idle', {}, 0); }
    if (h.custom === 'puff') return puffSprite(k, f, h.sw); return mikuSprite(k === 'big' || k === 'inhale' ? 'idle' : k, f);
  }
  // the hero in play: the drawing at full screen resolution, moved by the shared animator (idle breath, walk, run, jump, hurt red)
  function drawFanHero(P, h, x, bot) {
    const o = FAN_IMG[fanKey(h, P)]; if (!o) return false; const im = o.im;
    const sp = Math.abs(P.vx), st = P.hurtA > 0 ? 'hurt' : (!P.onGround ? 'jump' : (P.push > 0 ? 'push' : (sp > 15 ? (sp > RUN * 0.72 ? 'run' : 'walk') : 'idle')));
    const A = animPose(st, P.anim, P.face, st === 'hurt' ? 1 - P.hurtA / 0.36 : P.vy);
    let sx = A.sx, sy = A.sy; if (P.landA > 0) { sx *= 1.15; sy *= 0.85; }
    if (h.mech === 'inhale') { if (P.flutter && !P.onGround) { sx *= 1.25; sy *= 1.2; } if (P.inhT > 0) sx *= 1.12; }
    if (h.mech === 'toon') { if (P.landA > 0) { sx *= 1.3; sy *= 0.7; } else if (!P.onGround) { sy *= P.vy < 0 ? 1.18 : 1.06; sx *= 2 - sy; } }
    g.save(); g.translate(x + A.ox, bot + A.oy); g.rotate(A.rot); g.scale((P.face < 0 ? -1 : 1) * FAN_SC * sx, FAN_SC * sy); g.imageSmoothingEnabled = true;
    if (P.dash > 0) g.globalAlpha = 0.75;
    hiImg(im, 0, 0, im.width, im.height, -im.width / 2, -im.height, im.width, im.height);
    if (A.red) { g.globalAlpha = 0.8; g.filter = 'brightness(0.7) sepia(1) saturate(9) hue-rotate(-45deg)'; hiImg(im, 0, 0, im.width, im.height, -im.width / 2, -im.height, im.width, im.height); g.filter = 'none'; }
    g.restore(); g.globalAlpha = 1;
    return true;
  }""")
rep("""spr = custSpr(hh, ck, ck === 'run' ? fa : ck === 'idle' ? Math.floor(P.anim * 3) % 2 : 0); if (an.red) spr = redOf(spr); }""", """spr = custSpr(hh, ck, ck === 'run' ? fa : ck === 'idle' ? Math.floor(P.anim * 3) % 2 : 0, P); if (an.red) spr = redOf(spr); }""")
rep("""      return true;
    }
    if (hh && hh.mech === 'toon') {""", """      return true;
    }
    if (hh && hh.custom === 'fan' && drawFanHero(P, hh, x, bot)) return true;
    if (hh && hh.mech === 'toon') {""")
# the hero picker and the films use the half-size picture
rep("""    if (sc !== 1) { g.save(); g.translate(x, bot); g.scale(sc, sc); x = 0; bot = 0; }
    drawSpr(g, h.custom ?""", """    if (sc !== 1) { g.save(); g.translate(x, bot); g.scale(sc, sc); x = 0; bot = 0; }
    if (h.custom === 'fan') g.imageSmoothingEnabled = true;
    drawSpr(g, h.custom ?""")
rep("p.form = null; p.ess = 0; p.copy = null;", "p.form = null; p.ess = 0; p.dk = 0; p.oraT = 0; p.standT = 0; p.copy = null;")
rep("form: p.form, ess: p.ess,", "form: p.form, ess: p.ess, dk: p.dk, oraT: p.oraT, standT: p.standT,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
