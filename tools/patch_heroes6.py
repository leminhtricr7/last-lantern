# Six heroes with their own mechanics: Shade Reaper (dash-through + two forms), Tabby & Squeak (cartoon squash/stretch,
# gags, mouse traps), Rubber Rin (stretch punches), Roll (momentum + spin ball), Puff (inhale, copy, float), Chrono (time stop + guardian)
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- custom sprites (Miku, Puff) ----------
rep("""    if (hh && hh.custom) { const fa = Math.floor(P.anim * 12) % 4; spr = swim || (Math.abs(P.vx) > 15 && P.onGround) ? mikuSprite('run', fa) : (!P.onGround ? mikuSprite('air', 0) : mikuSprite('idle', Math.floor(P.anim * 3) % 2)); if (an.red) spr = redOf(spr); }""",
    """    if (hh && hh.custom) { const fa = Math.floor(P.anim * 12) % 4, ck = P.inhT > 0 ? 'inhale' : (P.flutter && !P.onGround ? 'big' : (swim || (Math.abs(P.vx) > 15 && P.onGround) ? 'run' : (!P.onGround ? 'air' : 'idle'))); spr = custSpr(hh, ck, ck === 'run' ? fa : ck === 'idle' ? Math.floor(P.anim * 3) % 2 : 0); if (an.red) spr = redOf(spr); }""")
rep("""    drawSpr(g, h.custom ? mikuSprite('idle', (fr || 0) & 1) : getSprite('hero_idle', h.sw, fr || 0), x, bot, f < 0);""",
    """    drawSpr(g, h.custom ? custSpr(h, 'idle', (fr || 0) & 1) : getSprite('hero_idle', h.sw, fr || 0), x, bot, f < 0);""")
rep("""if (h.custom) return mikuSprite(pose === 'jump' ? 'air' : 'idle', fr & 1);""", """if (h.custom) return custSpr(h, pose === 'jump' ? 'air' : pose === 'run' ? 'run' : 'idle', pose === 'run' ? fr % 4 : fr & 1);""")

# ---------- player: body drawing, overlays ----------
rep("""    drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;""", """    if (!heroMechBody(P, spr, x, bot + bob, hh)) drawSpr(g, spr, x, bot + bob, P.face < 0);
    g.globalAlpha = 1;
    if (P.ball) { heroMechOver(P, x, bot, hh); if (swim) g.restore(); if (coop) drawCoopTag(P, x, bot); return; }""")
rep("""if (wit) rarFx(wit.rar, ax + P.face * 9, ab - 13, 6); if (ait) rarAura(ait.rar, ax, ab); }""", """if (wit) rarFx(wit.rar, ax + P.face * 9, ab - 13, 6); if (ait) rarAura(ait.rar, ax, ab); }
    if (hh && hh.mech) heroMechOver(P, ax, ab, hh);""")

# ---------- player: movement hooks ----------
rep("""(1 + aSt('speed') + pSt('speed') + (P.hspd || 0));""", """(1 + aSt('speed') + pSt('speed') + (P.hspd || 0)) * (P.hero === 'teto' ? 0.75 + 1.25 * (P.mom || 0) : 1);""")
rep("""        else if (Q.dj && P.jumps < 2) {""", """        else if (P.hero === 'bong' && P.jumps < 7) { P.vy = -150; P.jumps++; P.jumpBuf = 0; P.flutter = true; Snd.play('djump'); emit(P.x + 4, P.y + P.h, 6, { col: ['#e4fff4', '#7ee8c0'], sp0: 10, sp1: 40, vy: 30 }); }
        else if (Q.dj && P.jumps < 2) {""")
rep("""      else P.vy = Math.min(380, P.vy + g2 * dt);""", """      else P.vy = P.flutter && P.hero === 'bong' ? Math.min(42, P.vy + g2 * 0.32 * dt) : (P.stoneT > 0 ? 380 : Math.min(380, P.vy + g2 * dt));""")
rep("""    if (P.dash <= 0) { if (act.atkP) useSlot(0); if (act.atk2P) useSlot(1); }""", """    if (P.dash <= 0) { if (act.atkP && !heroAttack(P)) useSlot(0); if (act.atk2P) useSlot(1); }""")
rep("""    if (P.hurtA > 0) P.hurtA -= dt; if (P.landA > 0) P.landA -= dt;""", """    heroMech(P, dt, dir);
    if (P.hurtA > 0) P.hurtA -= dt; if (P.landA > 0) P.landA -= dt;""")
rep("""    p.mhp = Math.max(2, base + h.hp); p.hp = p.mhp; p.hspd = h.spd; p.hdmg = h.dmg; p.skCd = 2;""", """    p.mhp = Math.max(2, base + h.hp); p.hp = p.mhp; p.hspd = h.spd; p.hdmg = h.dmg; p.skCd = 2;
    if (p.ball) { p.ball = false; p.y -= 6; p.h = 14; } p.form = null; p.ess = 0; p.copy = null; p.flutter = false; p.mom = 0; p.mouse = null; p.punch = null;""")

# ---------- time stop: enemies, bosses and their shots freeze ----------
rep("""    const edt = dt * (Q.G.slowT > 0 ? 0.4 : 1),""", """    updateTimeStop(dt);
    const edt = Q.G.tsT > 0 ? 0 : dt * (Q.G.slowT > 0 ? 0.4 : 1),""")
rep("""drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y)); }""", """drawGearTop(Math.round(Q.cam.x), Math.round(Q.cam.y)); if (Q.G.tsT > 0) drawTimeStop(); }""")
rep("""const GVALS = ['slowT', 'powerT', 'flash'];""", """const GVALS = ['slowT', 'powerT', 'flash', 'tsT'];""")
rep("""const GLISTS = ['allies', 'pops', 'bolts', 'holes', 'torn', 'sums', 'slashes'];""", """const GLISTS = ['allies', 'pops', 'bolts', 'holes', 'torn', 'sums', 'slashes', 'mtraps'];""")
rep("sel: p.sel, chg: p.chg || null,", "sel: p.sel, chg: p.chg || null, h: p.h, mom: p.mom, ball: p.ball, spin: p.spin, form: p.form, ess: p.ess, copy: p.copy, inhT: p.inhT, flutter: p.flutter, gatT: p.gatT, hurtA: p.hurtA, landA: p.landA, punch: p.punch ? { ext: p.punch.ext || 0, dir: p.punch.dir, dy: p.punch.dy, reach: p.punch.reach } : null, mouse: p.mouse ? { x: Math.round(p.mouse.x), y: Math.round(p.mouse.y), f: p.mouse.f } : null,")

# ---------- shots: stun, flatten, slow ----------
rep("""dmgFoe(e, p.dmg, !!p.pierce, !!p.quiet); sumCtx = sc0;""", """dmgFoe(e, p.dmg, !!p.pierce, !!p.quiet); sumCtx = sc0; if (!e.isBoss) { if (p.stun) e.stunT = Math.max(e.stunT || 0, p.stun); if (p.flat) { e.flatT = 1.6; e.stunT = Math.max(e.stunT || 0, 1.6); } } if (p.slowE) e.slowT = Math.max(e.slowT || 0, p.slowE);""")
rep("""    if (e.hitT > 0) { const k = e.hitT / 0.18; sx *= 1 + 0.25 * k; sy *= 1 - 0.2 * k; ox += (Math.random() - 0.5) * 2 * k; }""", """    if (e.hitT > 0) { const k = e.hitT / 0.18; sx *= 1 + 0.25 * k; sy *= 1 - 0.2 * k; ox += (Math.random() - 0.5) * 2 * k; }
    if (e.flatT > 0) { e.flatT -= 1 / 60; sy *= 0.3; sx *= 1.6; if (Math.random() < 0.2) emit(e.x + e.w / 2 + rr(-6, 6), e.y + e.h - 4, 1, { col: '#ffd34e', sp0: 3, sp1: 10, l0: 0.3, l1: 0.5 }); }""")

# ---------- skills ----------
rep("""      case 'wave': shootG({""", """      case 'reapdash': {
        const form = P.form, mult = form === 'sin' ? 2 : 1, x0 = P.x, hit = new Set(), L = form === 'sin' ? 14 : 11; P.inv = Math.max(P.inv, 0.45);
        for (let k = 0; k < L; k++) { moveX(P, f * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); emit(P.x + 4, P.y + 7, 2, { col: [form === 'bru' ? '#ff4a3a' : '#3ad6ff', '#14121f'], sp0: 5, sp1: 30, l0: 0.2, l1: 0.4 }); }
        const box = { x: Math.min(x0, P.x) - 4, y: P.y - 6, w: Math.abs(P.x - x0) + 16, h: P.h + 12 };
        for (const e of foes()) if (!hit.has(e) && ov(box, e)) { hit.add(e); dmgFoe(e, d * mult, true); chargeHit(); P.ess = Math.min(6, (P.ess || 0) + 1); emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: [form === 'bru' ? '#ff4a3a' : '#3ad6ff', '#fff'], sp0: 30, sp1: 120 }); }
        if (form === 'bru' && hit.size) healP(P, 1);
        if (form === 'sin') P.skCd = 2.5;
        if ((P.ess || 0) >= 6) {
          P.ess = 0; P.form = P.form === 'sin' ? 'bru' : 'sin'; const hb = HERO.liem; P.hspd = hb.spd + (P.form === 'sin' ? 0.25 : 0); P.hdmg = hb.dmg + (P.form === 'bru' ? 1 : 0);
          const fc = P.form === 'sin' ? '#3ad6ff' : '#ff4a3a'; addRing(cx, cy, fc, 90, 0.6); emit(cx, cy, 40, { col: [fc, '#fff', '#14121f'], sp0: 30, sp1: 160 }); Q.shake = Math.max(Q.shake, 0.5); Snd.play('relic'); Snd.play('boom');
          Q.msg = P.form === 'sin' ? sv('SHADOW ASSASSIN: faster, dashes hit twice as hard!', 'SÁT THỦ BÓNG ĐÊM: nhanh hơn, lướt gây x2 sát thương!') : sv('CRIMSON BRAWLER: dashes heal you, hits are stronger!', 'ĐẤU SĨ HUYẾT LIÊM: lướt trúng hồi máu, đánh mạnh hơn!'); Q.msgT = 3;
        }
        Snd.play('slash'); break;
      }
      case 'gag': {
        const r = Math.floor(Math.random() * 3), t = nearestFoe(cx, cy, 220);
        if (r === 0) { shootG({ x: cx + f * 6, y: cy - 4, vx: f * 130, vy: -170, g: 420, life: 1.1, dmg: d + 2, expl: 34, shape: 'orb', col: '#14121f', trail: '#ffd34e', sz: 4, f, skill: true }); pop(cx, cy - 26, sv('BOMB!', 'BOM!'), '#ff7a2a'); Snd.play('whoosh'); }
        else if (r === 1) { shootG({ x: cx + f * 6, y: cy, vx: f * 230, vy: -40, g: 120, life: 0.9, dmg: d, stun: 2, pierceN: 3, shape: 'orb', col: '#3a3a46', trail: '#8a8a9a', sz: 5, f, skill: true }); pop(cx, cy - 26, sv('FRYING PAN!', 'CHẢO!'), '#cfd6e6'); Snd.play('clang'); }
        else { const tx = t ? t.x + t.w / 2 : cx + f * 80; shootG({ x: tx, y: Q.cam.y - 10, vx: 0, vy: 520, life: 1.4, dmg: d * 3, flat: true, pierceN: 99, thru: true, shape: 'meteor', col: '#5a5a6a', trail: '#2a2a3a', sz: 7, f, skill: true }); pop(tx, Q.cam.y + 34, sv('ANVIL!', 'ĐE SẮT!'), '#cfd6e6'); Snd.play('whoosh'); }
        break;
      }
      case 'gatling': P.gatT = 1.2; P.gatTick = 0; Snd.play('whoosh'); pop(cx, cy - 26, sv('PUNCH PUNCH PUNCH!', 'ĐẤM ĐẤM ĐẤM!'), '#ff7a5a'); break;
      case 'spindash': P.mom = 1; P.spinT = 0.7; P.vx = f * RUN * 2; Snd.play('dash'); for (let i = 0; i < 12; i++) emit(cx - f * 6, P.y + P.h, 1, { col: ['#ffffff', '#d0a070'], sp0: 10, sp1: 50, vx: -f * 80, vy: -20 }); break;
      case 'inhale':
        if (P.copy) { shootG({ x: cx + f * 8, y: cy, vx: f * 280, vy: 0, life: 0.9, dmg: d * 2 + 2, pierceN: 5, shape: 'orb', col: '#ffd34e', trail: '#ffffff', sz: 6, f, skill: true }); pop(cx, cy - 22, sv('Spit!', 'Nhả!'), '#ffd34e'); P.copy = null; Snd.play('relic'); }
        else { P.inhT = 0.9; P.inhGot = false; Snd.play('whoosh'); }
        break;
      case 'timestop': {
        const G = Q.G; G.tsT = 4; G.tsOwner = P; G.tsTick = 0; Q.shake = Math.max(Q.shake, 0.4); Snd.play('chime'); if (Snd.cineHit) Snd.cineHit('drop');
        Q.msg = sv('TIME STOP! Only you can move...', 'NGƯNG ĐỌNG THỜI GIAN! Chỉ mình bạn chuyển động...'); Q.msgT = 2.5; break;
      }
      case 'wave': shootG({""")

# ---------- mechanics ----------
rep("""  // ---------- hats and accessories (drawn on top of the recoloured hero) ----------""", """  // ===================== heroes with their own mechanics =====================
  function custSpr(h, k, f) { if (h.custom === 'puff') return puffSprite(k, f, h.sw); return mikuSprite(k === 'big' || k === 'inhale' ? 'idle' : k, f); }
  // Puff copies what it swallows
  const COPY = { imp: 'fire', wisp: 'spark', ghost: 'spark', shroom: 'spark', spider: 'web', scorpion: 'web', bat: 'wing', beetle: 'stone', knight: 'stone', snowman: 'stone', zombie: 'stone' };
  const COPY_INFO = { fire: { n: { en: 'Fire', vi: 'Lửa' }, col: '#ff7a2a' }, spark: { n: { en: 'Spark', vi: 'Điện' }, col: '#ffe44e' }, web: { n: { en: 'Web', vi: 'Tơ Nhện' }, col: '#e8e8f0' }, wing: { n: { en: 'Wing', vi: 'Cánh' }, col: '#9fe8ff' }, stone: { n: { en: 'Stone', vi: 'Đá' }, col: '#a8a8b8' }, star: { n: { en: 'Star', vi: 'Sao' }, col: '#ffd34e' } };
  function heroAttack(P) {
    const id = P.hero, it0 = eqIt(0), gun = it0 && it0.type === 'gun', f = P.face;
    if (id === 'caosu' && !gun) { if (P.punch) return true; const d = baseDmg() + ((it0 && it0.st && it0.st.dmg) || 0) + 1 + (P.hdmg || 0); P.punch = { t: 0, dur: 0.26, dir: f, reach: 92, dy: act.up ? -40 : (act.down && !P.onGround ? 40 : 0), d, hit: new Set() }; Snd.play('whoosh'); return true; }
    if (id === 'bong' && !gun) {
      const x = P.x + 4 + f * 6, y = P.y + 6, d = 2 + baseDmg() + (P.hdmg || 0);
      if (P.flutter && !P.onGround) { P.flutter = false; shootG({ x, y, vx: f * 220, vy: 0, life: 0.35, dmg: d, shape: 'wind', col: '#e4fff4', sz: 6, f, skill: true }); Snd.play('whoosh'); return true; }
      const c = P.copy; if (!c) return false;
      if (c === 'fire') { for (let k = -2; k <= 2; k++) shootG({ x, y, vx: f * 170 + rr(-20, 20), vy: k * 22, life: 0.35, dmg: d, burn: 2, shape: 'fire', col: '#ff7a2a', trail: '#ffd34e', sz: 3, f }); Snd.play('flame'); }
      else if (c === 'spark') { nova(P.x + 4, P.y + 7, 38, d + 1); Snd.play('zap'); emit(P.x + 4, P.y + 7, 16, { col: ['#ffe44e', '#ffffff'], sp0: 30, sp1: 120 }); }
      else if (c === 'web') { shootG({ x, y, vx: f * 240, vy: 0, life: 0.9, dmg: d, slowE: 4, shape: 'orb', col: '#e8e8f0', sz: 4, f }); Snd.play('whoosh'); }
      else if (c === 'wing') { for (let k = -1; k <= 1; k++) shootG({ x, y: y + k * 4, vx: f * 300, vy: k * 30, life: 0.7, dmg: d, shape: 'arrow', col: '#9fe8ff', sz: 2, f }); Snd.play('whoosh'); }
      else if (c === 'stone') { if (!P.onGround) { P.stoneT = 1.2; P.stoneLand = false; P.vy = 380; Snd.play('boom'); } else { nova(P.x + 4, P.y + 10, 44, d + 2); Q.shake = Math.max(Q.shake, 0.3); Snd.play('boom'); } }
      else { shootG({ x, y, vx: f * 260, vy: 0, life: 0.8, dmg: d + 2, pierceN: 3, shape: 'orb', col: '#ffd34e', trail: '#fff', sz: 4, f }); Snd.play('relic'); }
      return true;
    }
    return false;
  }
  function heroMech(P, dt, dir) {
    const id = P.hero; if (!id) return;
    if (id === 'teto') {   // momentum + spin ball
      const same = dir !== 0 && Math.sign(P.vx) === dir;
      if (P.onGround) P.mom = same ? Math.min(1, (P.mom || 0) + dt / 2.2) : (dir === 0 ? Math.max(0, (P.mom || 0) - dt * 1.6) : (P.mom || 0) * 0.3);
      if (P.spinT > 0) P.spinT -= dt;
      const want = (!P.onGround && P.jumps > 0) || (act.down && P.onGround && Math.abs(P.vx) > 50) || P.spinT > 0;
      if (want && !P.ball) { P.ball = true; P.y += 6; P.h = 8; Snd.play('whoosh'); }
      else if (!want && P.ball && P.onGround) { const tx0 = Math.floor(P.x / TS), tx1 = Math.floor((P.x + P.w - 0.01) / TS), ty = Math.floor((P.y - 6) / TS); if (!solid(tx0, ty) && !solid(tx1, ty)) { P.ball = false; P.y -= 6; P.h = 14; } }
      if (P.ball) {
        P.spin = (P.spin || 0) + dt * (6 + Math.abs(P.vx) / 12) * P.face;
        for (const e of foes()) {
          if (e.ballT && Q.t - e.ballT < 0.35) continue; if (!ov({ x: P.x - 2, y: P.y - 2, w: P.w + 4, h: P.h + 4 }, e)) continue;
          e.ballT = Q.t; dmgFoe(e, Math.round((2 + baseDmg() + (P.hdmg || 0)) * (1 + (P.mom || 0))), true); chargeHit(); P.inv = Math.max(P.inv, 0.3);
          if (!P.onGround) P.vy = -230; else if (!e.isBoss) { e.vx = P.face * 160; e.vy = -120; }
          emit(e.x + e.w / 2, e.y + e.h / 2, 12, { col: ['#ffb04a', '#fff', '#ff4a3a'], sp0: 30, sp1: 120 }); Snd.play('hit');
        }
      }
      if ((P.mom || 0) > 0.7 && P.onGround && Math.random() < 0.6) emit(P.x + 4 - P.face * 6, P.y + P.h - 2, 1, { col: ['#ffffff', '#ffd0a0'], sp0: 0, sp1: 10, vx: -P.face * 60, grav: 0, l0: 0.15, l1: 0.3 });
    }
    if (id === 'meo') {   // Squeak the mouse runs along and sets traps
      const m = P.mouse || (P.mouse = { x: P.x - 14, y: P.y + P.h, f: 1, cd: 4 });
      const tx = P.x + 4 - P.face * 16; m.x += clamp(tx - m.x, -170 * dt, 170 * dt); if (Math.abs(tx - m.x) > 1) m.f = tx > m.x ? 1 : -1; m.y = sumGround(m.x, P.y + P.h); if (Math.abs(m.x - P.x) > 200) m.x = P.x;
      m.cd -= dt;
      if (m.cd <= 0) { const t = nearestFoe(m.x, m.y - 6, 140); if (t && !t.isBoss) { m.cd = 6; (Q.G.mtraps = Q.G.mtraps || []).push({ x: m.x, y: m.y, t: 0 }); Snd.play('select'); pop(m.x, m.y - 12, sv('Trap set!', 'Đặt bẫy!'), '#ffd34e'); } else m.cd = 1; }
    }
    if (id === 'caosu') {   // the stretching arm
      const pu = P.punch;
      if (pu) {
        pu.t += dt; const k = pu.t / pu.dur, ext = Math.sin(Math.min(1, k) * Math.PI) * pu.reach; pu.ext = ext;
        const fx = P.x + 4 + pu.dir * ext, fy = P.y + 5 + (pu.dy || 0) * ext / pu.reach;
        for (const e of foes()) if (!pu.hit.has(e) && ov({ x: fx - 5, y: fy - 5, w: 10, h: 10 }, e)) { pu.hit.add(e); dmgFoe(e, pu.d, false); chargeHit(); Snd.play('hit'); Q.freeze = 0.04; emit(fx, fy, 10, { col: ['#fff', '#ffd34e', '#ff7a5a'], sp0: 20, sp1: 90 }); if (!e.isBoss) { e.vx = pu.dir * 180; e.vy = -110; } }
        if (k >= 1) P.punch = null;
      }
      if (P.gatT > 0) {
        P.gatT -= dt; P.gatTick = (P.gatTick || 0) - dt;
        if (P.gatTick <= 0) { P.gatTick = 0.07; const box = { x: P.face > 0 ? P.x + 6 : P.x - 70, y: P.y - 6, w: 72, h: P.h + 12 }; let any = false; for (const e of foes()) if (ov(box, e)) { any = true; dmgFoe(e, Math.max(1, Math.round((2 + baseDmg()) * 0.5)), false, true); if (Math.random() < 0.4) emit(e.x + e.w / 2 + rr(-5, 5), e.y + e.h / 2 + rr(-5, 5), 3, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 60 }); } if (any) Snd.play('hit'); }
      }
    }
    if (id === 'bong') {   // inhale: pull small enemies into the mouth and copy them; only air = puff up and float
      if (P.onGround) P.flutter = false;
      if (P.inhT > 0) {
        P.inhT -= dt; const mx = P.x + 4 + P.face * 8, my = P.y + 6;
        if (Math.random() < 0.9) { const a = (Math.random() - 0.5) * 0.9, r = 50 + Math.random() * 20; emit(mx + P.face * Math.cos(a) * r, my + Math.sin(a) * r, 1, { col: ['#ffffff', '#cfeee4'], sp0: 0, sp1: 4, vx: -P.face * 140 * Math.cos(a), vy: -Math.sin(a) * 140, grav: 0, l0: 0.25, l1: 0.35 }); }
        for (const e of foes()) {
          if (e.isBoss || isBig(e) || e.hid || e.dead) continue; const dx = e.x + e.w / 2 - mx, dy = e.y + e.h / 2 - my, dd = Math.hypot(dx, dy);
          if (dd > 72 || (Math.sign(dx) !== P.face && Math.abs(dx) > 4) || Math.abs(dy) > 10 + dd * 0.5) continue;
          e.x -= dx / (dd || 1) * 150 * dt; e.y -= dy / (dd || 1) * 150 * dt; e.vx = 0; e.stunT = Math.max(e.stunT || 0, 0.2);
          if (dd < 12) { e.dead = true; onKill(e); P.inhGot = true; P.copy = COPY[e.cfg && e.cfg.spr] || 'star'; P.inhT = 0; Snd.play('relic'); const ci = COPY_INFO[P.copy]; pop(P.x + 4, P.y - 20, sv('Copy: ', 'Sao chép: ') + LN(ci.n) + '!', ci.col); emit(mx, my, 16, { col: [ci.col, '#ffffff'], sp0: 20, sp1: 80 }); break; }
        }
        if (P.inhT <= 0 && !P.inhGot) { P.flutter = true; if (P.onGround) { P.vy = -120; P.onGround = false; } P.jumps = Math.max(P.jumps, 1); Snd.play('djump'); pop(P.x + 4, P.y - 18, sv('Puffed up!', 'Phồng bay!'), '#7ee8c0'); }
      }
      if (P.stoneT > 0) { P.stoneT -= dt; if (P.onGround && !P.stoneLand) { P.stoneLand = true; P.stoneT = 0; Q.shake = Math.max(Q.shake, 0.5); Snd.play('boom'); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - P.x - 4) < 50 && Math.abs(e.y + e.h - P.y - P.h) < 30) dmgFoe(e, 4 + baseDmg(), true); for (let i = -4; i <= 4; i++) emit(P.x + 4 + i * 8, P.y + P.h, 2, { col: ['#a8a8b8', '#fff'], sp0: 15, sp1: 60, vy: -60 }); } }
    }
  }
  // world parts of the mechanics: mouse traps and the time stop
  function updateTimeStop(dt) {
    const G = Q.G;
    if (G.mtraps && G.mtraps.length) {
      for (const tr of G.mtraps) { tr.t += dt; for (const e of foes()) if (!e.isBoss && !tr.dead && ov({ x: tr.x - 5, y: tr.y - 4, w: 10, h: 4 }, e)) { tr.dead = true; dmgFoe(e, 4 + baseDmg(), true); e.stunT = Math.max(e.stunT || 0, 2); e.flatT = 0.6; Snd.play('clang'); pop(tr.x, tr.y - 14, sv('SNAP!', 'TÁCH!'), '#ffd34e'); emit(tr.x, tr.y - 3, 8, { col: ['#cfd6e6', '#ffd34e'], sp0: 20, sp1: 70 }); } }
      G.mtraps = G.mtraps.filter(tr => !tr.dead && tr.t < 20);
    }
    if (!(G.tsT > 0)) return;
    G.tsT -= dt; const P = G.tsOwner || Q.P;
    G.tsTick = (G.tsTick || 0) - dt; if (G.tsTxtT > 0) G.tsTxtT -= dt;
    if (G.tsTick <= 0) { G.tsTick = 0.07; const t = nearestFoe(P.x + 4 + P.face * 20, P.y + 6, 90); if (t) { t.tsD = (t.tsD || 0) + Math.max(1, Math.round((2 + baseDmg()) * 0.6)); G.tsHit = { x: t.x + t.w / 2 + rr(-6, 6), y: t.y + t.h / 2 + rr(-6, 6) }; if (!(G.tsTxtT > 0)) { pop(P.x + 4 + P.face * 14, P.y - 16, 'TA-TA-TA!', '#a98bff'); G.tsTxtT = 0.5; } Snd.play('hit'); } else G.tsHit = null; }
    if (G.tsT <= 0) {
      G.tsT = 0; G.tsHit = null; Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.6);
      for (const e of foes()) if (e.tsD) { const d = e.tsD; e.tsD = 0; dmgFoe(e, d, true); emit(e.x + e.w / 2, e.y + e.h / 2, 24, { col: ['#a98bff', '#fff', '#ffd34e'], sp0: 40, sp1: 160 }); pop(e.x + e.w / 2, e.y - 8, '-' + d, '#ffd34e'); }
      Q.msg = sv('Time flows again.', 'Thời gian chạy lại.'); Q.msgT = 1.5;
    }
  }
  const GUARD_SW = { a: '#e8d8ff', A: '#7a5ad0', q: '#2a1a5a', b: '#4a2a8a', r: '#ffd34e', f: '#ffd34e', o: '#a98bff' };
  let tsCv = null;
  function drawTimeStop() {
    const G = Q.G, el = 4 - G.tsT, P = G.tsOwner || Q.P, cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    if (!tsCv) tsCv = mkCanvas(VW, VH); const [fc, fx] = tsCv; fx.globalCompositeOperation = 'copy'; fx.drawImage(g.canvas, 0, 0);
    g.save(); g.filter = 'grayscale(1) contrast(1.15) brightness(0.92)'; g.drawImage(fc, 0, 0); g.restore();
    if (el < 0.7) { const cx = P.x + 4 - cx0, cy = P.y + 7 - cy0, r = Math.sin(el / 0.7 * Math.PI) * 420; g.save(); g.globalCompositeOperation = 'difference'; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.restore(); }
    drawPlayer(cx0, cy0);   // only the heroes keep their colours
    const x = Math.round(P.x + 4 - cx0 - P.face * 8), bot = Math.round(P.y + P.h - cy0 - 4 + Math.sin(Q.t * 3) * 2), spr = getSprite('hero_idle4', GUARD_SW, 0);
    g.save(); g.globalAlpha = 0.7; g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, x, bot, P.face < 0, false, 1.6, 1.6); g.restore();
    if (G.tsHit) { for (let i = 0; i < 7; i++) { const fx2 = x + P.face * (16 + Math.random() * 24), fy = bot - 22 + rr(-8, 8); g.fillStyle = '#c8b8ff'; g.fillRect(Math.round(fx2) - 3, Math.round(fy) - 2, 6, 5); g.fillStyle = '#ffffff'; g.fillRect(Math.round(fx2) - 1, Math.round(fy) - 1, 2, 2); } const hx = G.tsHit.x - cx0, hy = G.tsHit.y - cy0; g.fillStyle = '#ffffff'; g.fillRect(hx - 5, hy, 11, 1); g.fillRect(hx, hy - 5, 1, 11); }
    txt(Math.max(0, G.tsT).toFixed(1) + 's', VW / 2, 34, { al: 'center', size: 9, bold: true, col: '#c8b8ff', ol: '#14121f' });
  }
  // drawing: the spin ball and the cartoon squash & stretch replace the normal body
  function heroMechBody(P, spr, x, bot, hh) {
    if (P.ball && hh) {
      const r = 6, cy = bot - r, c = hh.sw;
      if ((P.mom || 0) > 0.5) { for (let i = 1; i <= 3; i++) { g.globalAlpha = 0.28 - i * 0.07; disc(g, Math.round(x - P.face * i * 6), cy, r, c.A); } g.globalAlpha = 1; }
      disc(g, x, cy, r + 1, '#14121f'); disc(g, x, cy, r, c.A);
      g.save(); g.translate(x, cy); g.rotate(P.spin || 0); g.fillStyle = c.q; for (let k = 0; k < 4; k++) { g.rotate(Math.PI / 2); g.fillRect(-1, -r, 2, r); } g.fillStyle = c.a; g.fillRect(-3, -3, 2, 2); g.restore();
      return true;
    }
    if (hh && hh.mech === 'toon') {
      let sx = 1, sy = 1, rot = 0;
      if (P.hurtA > 0) { sx = 1.3; sy = 1.25; } else if (P.landA > 0) { sx = 1.45; sy = 0.6; } else if (!P.onGround) { sy = P.vy < 0 ? 1.28 : 1.1; sx = 2 - sy; } else if (Math.abs(P.vx) > 15) { const k = Math.sin(P.anim * 18); sx = 1 + 0.14 * k; sy = 1 - 0.12 * k; rot = P.face * 0.12; }
      drawSprT(g, spr, x, bot, P.face < 0, false, sx, sy, rot);
      if (P.hurtA > 0) { const ey = bot - 18, ex = x + P.face * 2; for (const o of [-3, 2]) { disc(g, ex + o, ey, 3, '#14121f'); disc(g, ex + o, ey, 2, '#ffffff'); g.fillStyle = '#14121f'; g.fillRect(ex + o, ey, 1, 1); } }
      return true;
    }
    return false;
  }
  function heroMechOver(P, x, bot, hh) {
    const id = P.hero, cx0 = Math.round(Q.cam.x), cy0 = Math.round(Q.cam.y);
    if (id === 'liem') { for (let i = 0; i < 6; i++) { g.fillStyle = i < (P.ess || 0) ? (P.form === 'bru' ? '#ff4a3a' : '#3ad6ff') : 'rgba(255,255,255,.2)'; g.fillRect(x - 9 + i * 3, bot - 28, 2, 2); } if (P.form) drawAura(x, bot - 8, 16, P.form === 'bru' ? '#ff4a3a' : '#3ad6ff', 0.35); }
    if (id === 'caosu') {
      const sx0 = x + P.face * 3, sy0 = bot - 9, arm = (ex, ey, w) => { g.strokeStyle = '#14121f'; g.lineWidth = w + 2; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#ffd8b0'; g.lineWidth = w; g.beginPath(); g.moveTo(sx0, sy0); g.lineTo(ex, ey); g.stroke(); g.lineWidth = 1; disc(g, Math.round(ex), Math.round(ey), 3, '#14121f'); disc(g, Math.round(ex), Math.round(ey), 2, '#ffd8b0'); };
      const pu = P.punch; if (pu && pu.ext > 2) arm(x + pu.dir * (3 + pu.ext), sy0 + (pu.dy || 0) * pu.ext / pu.reach, pu.ext > 50 ? 1.5 : 2.5);
      if (P.gatT > 0) for (let i = 0; i < 6; i++) arm(x + P.face * (10 + Math.random() * 58), bot - 14 + rr(-7, 7), 1.5);
    }
    if (id === 'meo' && P.mouse) {
      const m = P.mouse, mx = Math.round(m.x - cx0), my = Math.round(m.y - cy0), hop = Math.abs(Math.sin(Q.t * 16)) > 0.5 ? -1 : 0;
      g.fillStyle = '#14121f'; g.fillRect(mx - 4, my - 5 + hop, 9, 5); g.fillStyle = '#9a9aaa'; g.fillRect(mx - 3, my - 4 + hop, 7, 3); g.fillRect(mx + m.f * 3 - 1, my - 7 + hop, 3, 3); g.fillStyle = '#ff9fd0'; g.fillRect(mx + m.f * 3, my - 6 + hop, 1, 1); g.fillStyle = '#14121f'; g.fillRect(mx + m.f * 4, my - 4 + hop, 1, 1);
      g.strokeStyle = '#ff9fd0'; g.beginPath(); g.moveTo(mx - m.f * 4, my - 2 + hop); g.quadraticCurveTo(mx - m.f * 8, my - 6, mx - m.f * 10, my - 3); g.stroke();
    }
    if (id === 'meo' && Q.G.mtraps) for (const tr of Q.G.mtraps) { const tx = Math.round(tr.x - cx0), ty = Math.round(tr.y - cy0); g.fillStyle = '#8a5a34'; g.fillRect(tx - 5, ty - 2, 10, 2); g.fillStyle = '#cfd6e6'; g.fillRect(tx - 4, ty - 4, 8, 1); g.fillRect(tx - 4, ty - 4, 1, 2); g.fillRect(tx + 3, ty - 4, 1, 2); g.fillStyle = '#ffd34e'; g.fillRect(tx - 1, ty - 3, 2, 1); }
    if (id === 'bong') {
      const top = bot - (P.flutter && !P.onGround ? 24 : 18), hx = x;
      if (P.copy === 'fire') { g.fillStyle = '#ff7a2a'; g.fillRect(hx - 3, top - 2, 6, 2); g.fillStyle = '#ffd34e'; for (let i = -2; i <= 2; i += 2) g.fillRect(hx + i, top - 4 - Math.round(Math.abs(Math.sin(Q.t * 9 + i)) * 2), 1, 2); }
      else if (P.copy === 'spark') { g.fillStyle = '#14121f'; g.fillRect(hx, top - 5, 1, 5); disc(g, hx, top - 6, 2, '#ffe44e'); if (Math.random() < 0.3) emit(P.x + 4, P.y - 10, 1, { col: '#ffe44e', sp0: 5, sp1: 20, l0: 0.1, l1: 0.2 }); }
      else if (P.copy === 'web') { g.fillStyle = '#e8e8f0'; g.fillRect(hx - 5, top - 2, 10, 3); g.fillStyle = '#8a8a9a'; g.fillRect(hx - 3, top - 1, 1, 1); g.fillRect(hx + 2, top - 1, 1, 1); }
      else if (P.copy === 'wing') { g.fillStyle = '#9fe8ff'; g.fillRect(hx - 7, top + 2, 3, 2); g.fillRect(hx - 9, top, 2, 2); g.fillRect(hx + 4, top + 2, 3, 2); g.fillRect(hx + 7, top, 2, 2); }
      else if (P.copy === 'stone') { g.fillStyle = '#6a6a7a'; g.fillRect(hx - 5, top - 1, 10, 3); g.fillStyle = '#a8a8b8'; g.fillRect(hx - 4, top - 1, 8, 1); }
      else if (P.copy === 'star') { g.fillStyle = '#ffd34e'; g.fillRect(hx - 1, top - 4, 3, 3); g.fillRect(hx - 2, top - 3, 5, 1); }
      if (P.inhT > 0) { g.strokeStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 4; i++) { const a = (i - 1.5) * 0.25, r1 = 14 + ((Q.t * 160 + i * 17) % 50); g.beginPath(); g.moveTo(x + P.face * (8 + r1) * Math.cos(a), bot - 9 + r1 * Math.sin(a)); g.lineTo(x + P.face * (14 + r1) * Math.cos(a), bot - 9 + (r1 + 6) * Math.sin(a)); g.stroke(); } }
    }
    if (id === 'teto' && !P.ball && (P.mom || 0) > 0.6) { g.strokeStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 3; i++) { const y = bot - 4 - i * 5; g.beginPath(); g.moveTo(x - P.face * 8, y); g.lineTo(x - P.face * (16 + Math.random() * 10), y); g.stroke(); } }
  }
  // ---------- hats and accessories (drawn on top of the recoloured hero) ----------""")
# hats
rep("""      case 'bandana': R(-6, 1, 12, 3); R(-9, 2, 3, 2); R(-11, 3, 2, 2); R(-4, 2, 2, 1, '#fff'); break;""", """      case 'bandana': R(-6, 1, 12, 3); R(-9, 2, 3, 2); R(-11, 3, 2, 2); R(-4, 2, 2, 1, '#fff'); break;
      case 'reaper': R(-10, -7, 1, 24, '#5a4a3a'); R(-17, -8, 8, 2, '#cfe8ff'); R(-18, -6, 3, 2, '#cfe8ff'); R(-19, -4, 2, 2, '#9fe8ff'); R(-7, -1, 14, 5); R(-6, 4, 12, 2); R(-7, 3, 2, 9); R(5, 3, 2, 9); R(-1, 5, 2, 1, '#3ad6ff'); R(2, 5, 2, 1, '#3ad6ff'); break;
      case 'tabby': { const sw2 = Math.round(Math.sin(t * 6) * 1.5); R(-6, -3, 3, 4); R(3, -3, 3, 4); R(-5, -2, 1, 2, '#ff9fd0'); R(4, -2, 1, 2, '#ff9fd0'); R(-2, 0, 1, 2, '#8a4a1a'); R(1, 0, 1, 2, '#8a4a1a'); R(6, 7, 3, 1, '#ffffff'); R(6, 9, 3, 1, '#ffffff'); R(-9, 13, 2, 3); R(-11 + sw2, 10, 2, 4); R(-12 + sw2, 7, 2, 3, '#8a4a1a'); break; }
      case 'rubber': R(-6, -1, 12, 3); R(-5, -3, 2, 2); R(-1, -4, 2, 3); R(3, -3, 2, 2); R(-6, 2, 12, 1, '#e0453a'); R(-9, 2, 3, 1, '#e0453a'); R(-10, 3, 2, 1, '#e0453a'); break;
      case 'shell': R(-6, -1, 12, 4); R(-6, 1, 12, 1, '#6a3418'); R(-7, -3, 2, 2, '#ffd0a0'); R(5, -3, 2, 2, '#ffd0a0'); R(-9, 9, 4, 9); R(-9, 11, 4, 1, '#6a3418'); R(-9, 14, 4, 1, '#6a3418'); break;
      case 'chrono': { R(-6, 1, 12, 2); R(-1, -1, 3, 3, '#fff6c0'); R(0, 0, 1, 1, '#3a2a10'); for (let i = 0; i < 3; i++) { const a = t * 2 + i * 2.09; g.fillStyle = i ? '#ffd34e' : '#a98bff'; g.fillRect(Math.round(x + Math.cos(a) * 11) - 1, Math.round(top + 6 + Math.sin(a) * 4) - 1, 3, 3); } break; }""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
