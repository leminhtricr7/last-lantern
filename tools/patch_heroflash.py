# F guard with a clear shield pose, a Flash (dash) perk + colour for every hero, and an R effect + colour for every hero.
# Data lives in src/heroes.js (HERO_FX, DASH_PERK); this patches src/game.js.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ---------- parry success in the hero's colours ----------
rep("""    Q.freeze = Math.max(Q.freeze || 0, 0.12); Q.shake = Math.max(Q.shake, 0.35); Snd.play('clang'); Snd.play('chime');
    addRing(P.x + 4, P.y + 7, '#ffffff', 50, 0.3); addRing(P.x + 4, P.y + 7, '#9fe8ff', 80, 0.45);
    emit(P.x + 4 + P.face * 7, P.y + 7, 22, { col: ['#ffffff', '#9fe8ff', '#ffd34e'], sp0: 40, sp1: 160 });
    pop(P.x + 4, P.y - 14, sv('PARRY!', 'ĐỠ ĐÒN!'), '#9fe8ff');""", """    Q.freeze = Math.max(Q.freeze || 0, 0.12); Q.shake = Math.max(Q.shake, 0.35); Snd.play('clang'); Snd.play('chime');
    const fx = heroFx(P), c1 = fx.d[0], c2 = fx.d[1]; P.guardHit = 0.3; P.guardT = Math.max(P.guardT || 0, 0.32);   // the shield flashes white
    addRing(P.x + 4, P.y + 7, '#ffffff', 50, 0.3); addRing(P.x + 4, P.y + 7, c1, 80, 0.45);
    emit(P.x + 4 + P.face * 9, P.y + 7, 26, { col: ['#ffffff', c1, c2], sp0: 40, sp1: 170 });
    pop(P.x + 4, P.y - 14, sv('PARRY!', 'ĐỠ ĐÒN!'), c1);""")

# ---------- guard + dash in updatePlayer ----------
rep("""    if (P.onGround || wetP(P)) P.airDashed = false;
    P.parryCd = (P.parryCd || 0) - dt; if (P.parryT > 0) P.parryT -= dt; if (P.counterT > 0) P.counterT -= dt;
    if (act.parryP && P.parryCd <= 0 && P.dash <= 0) { P.parryT = 0.24; P.parryCd = 0.7; Snd.play('whoosh'); emit(P.x + 4 + P.face * 7, P.y + 7, 5, { col: ['#9fe8ff', '#fff'], sp0: 10, sp1: 40 }); }""", """    if (P.onGround || wetP(P)) { P.airDashed = false; P.airDashN = 0; }
    P.parryCd = (P.parryCd || 0) - dt; if (P.parryT > 0) P.parryT -= dt; if (P.counterT > 0) P.counterT -= dt;
    if (P.guardT > 0) P.guardT -= dt; if (P.guardHit > 0) P.guardHit -= dt; if (P.castT > 0) P.castT -= dt; if (P.dsCd > 0) P.dsCd -= dt;
    if (act.parryP && P.parryCd <= 0 && P.dash <= 0) {   // F: brace and raise the shield (the catch window is the first 0.24 s, the pose lasts 0.5 s)
      const gc = heroFx(P).d; P.parryT = 0.24; P.parryCd = 0.7; P.guardT = 0.5; P.guardHit = 0; Snd.play('whoosh');
      emit(P.x + 4 + P.face * 8, P.y + 7, 8, { col: [gc[0], gc[1], '#fff'], sp0: 10, sp1: 50 }); addRing(P.x + 4 + P.face * 8, P.y + 7, gc[0], 18, 0.2);
    }""")
rep("""    if (act.dashP && P.dashCd <= 0 && P.dash <= 0 && !(P.airDashed && !P.onGround)) {
      if (!P.onGround) P.airDashed = true;
      P.dash = 0.17; P.dashCd = (hasRelic(4) ? 0.35 : 0.7) * (pSt('dash') || 1); P.dashDir = dir || P.face; P.vy = 0; P.inv = Math.max(P.inv, 0.2);
      Snd.play('dash'); Snd.hero('dash'); emit(P.x + 4, P.y + 8, 8, { col: '#b8bfd0', sp0: 5, sp1: 30, vx: -P.dashDir * 50 });
    }
    if (P.dash > 0) {
      P.dash -= dt; P.vx = P.dashDir * 255; P.vy = 0; P.face = P.dashDir;
      (P.trail = P.trail || []).push({ x: P.x, y: P.y, f: P.face, t: 0.22 }); if (P.trail.length > 9) P.trail.shift();
      if (Math.random() < 0.8) emit(P.x + 4, P.y + 8, 1, { col: ['#6ee7f2', '#fff'], sp0: 0, sp1: 12, l0: 0.15, l1: 0.3, grav: 0 });
    } else {""", """    if (act.dashP && P.dashCd <= 0 && P.dash <= 0 && !(P.airDashed && !P.onGround)) {
      const fx = heroFx(P), pk = fx.p;
      if (!P.onGround) { P.airDashN = (P.airDashN || 0) + 1; P.airDashed = pk === 'double' ? P.airDashN >= 2 : true; }
      P.dash = 0.17; P.dashCd = (hasRelic(4) ? 0.35 : 0.7) * (pSt('dash') || 1) * (pk === 'blink' ? 0.7 : 1); P.dashDir = dir || P.face; P.vy = 0; P.inv = Math.max(P.inv, 0.2);
      P.dpk = pk; P.dc = fx.d; P.dhit = new Set(); P.dsp = pk === 'wind' ? 345 : 255;
      Snd.play('dash'); Snd.hero('dash'); emit(P.x + 4, P.y + 8, 8, { col: [fx.d[0], fx.d[1], '#b8bfd0'], sp0: 5, sp1: 30, vx: -P.dashDir * 50 });
      dashStartFx(P, fx);
    }
    if (P.dash > 0) {
      P.dash -= dt; P.vx = P.dashDir * (P.dsp || 255); P.vy = 0; P.face = P.dashDir;
      (P.trail = P.trail || []).push({ x: P.x, y: P.y, f: P.face, t: 0.22 }); if (P.trail.length > 9) P.trail.shift();
      dashTick(P, dt);
      if (P.dash <= 0) dashEnd(P);
    } else {""")

# ---------- the Flash perks, the R effects and the guard picture ----------
rep("""  // ---------- vines ----------""", """  // ---------- every hero's Flash (dash): own colours and own perk (data in HERO_FX) ----------
  const heroFx = P => HERO_FX[(P && P.hero) || 'ember'] || HERO_FX.ember;
  function dashStartFx(P, fx) {
    const c1 = fx.d[0], c2 = fx.d[1], dir = P.dashDir; addRing(P.x + 4, P.y + 7, c1, 24, 0.25);
    if (fx.p === 'blink') {   // Blink: jump ahead at once, then only a short invulnerable flicker
      emit(P.x + 4, P.y + 7, 14, { col: [c1, c2, '#fff'], sp0: 20, sp1: 90 });
      for (let k = 0; k < 7; k++) { moveX(P, dir * 9); (P.trail = P.trail || []).push({ x: P.x, y: P.y, f: dir, t: 0.22 }); if (P.trail.length > 9) P.trail.shift(); }
      P.dash = 0.07; P.dsp = 30; addRing(P.x + 4, P.y + 7, c2, 30, 0.3); emit(P.x + 4, P.y + 7, 14, { col: [c1, c2, '#fff'], sp0: 20, sp1: 90 }); Snd.play('chime');
    }
  }
  function dashTick(P, dt) {
    const pk = P.dpk, c = P.dc || ['#6ee7f2', '#ffffff'], c1 = c[0], c2 = c[1], cx = P.x + 4, cy = P.y + 7, dir = P.dashDir;
    if (Math.random() < 0.85) emit(cx, P.y + 8, 1, { col: [c1, c2], sp0: 0, sp1: 14, l0: 0.18, l1: 0.38, grav: 0, size: 2 });
    if (pk === 'fire') emit(cx - dir * 4, P.y + 10, 1, { col: [c1, c2, '#ffd34e'], sp0: 2, sp1: 16, vy: -40, grav: -60, l0: 0.3, l1: 0.6, size: 2 });
    else if (pk === 'frost') emit(cx - dir * 3, cy + rr(-5, 5), 1, { col: ['#ffffff', c1], sp0: 4, sp1: 20, grav: 20, l0: 0.3, l1: 0.6, size: 2 });
    else if (pk === 'wind') emit(cx - dir * 6, cy + rr(-6, 6), 1, { col: ['#ffffff', c1], sp0: 0, sp1: 6, vx: -dir * 90, grav: 0, l0: 0.12, l1: 0.25 });
    else if (pk === 'holy' || pk === 'slow' || pk === 'magnet') emit(cx + rr(-4, 4), cy + rr(-6, 6), 1, { col: [c1, c2, '#fff'], sp0: 3, sp1: 14, grav: -30, l0: 0.3, l1: 0.6, size: 2 });
    else if (pk === 'shadow') emit(cx - dir * 4, cy + rr(-6, 6), 1, { col: [c1, c2], sp0: 2, sp1: 12, grav: -10, l0: 0.3, l1: 0.55, size: 2 });
    if (pk === 'magnet') for (const it of Q.items) if (it.kind === 'coin' && Math.hypot(it.x - cx, it.y - cy) < 120) { it.x += (cx - it.x) * 0.3; it.y += (cy - it.y) * 0.3; }
    if (pk === 'reflect') for (const q of Q.projs) if (!q.dead && Math.hypot(q.x - cx, q.y - cy) < 28) { q.dead = true; emit(q.x, q.y, 8, { col: [c1, c2, '#fff'], sp0: 20, sp1: 90 }); Snd.play('clang'); }
    const dm = { fire: 2, frost: 1, volt: 2, slash: 3, wind: 1, slow: 0, shadow: 1 };
    if (dm[pk] !== undefined) {
      const box = { x: P.x - 4, y: P.y - 4, w: P.w + 8, h: P.h + 8 };
      for (const e of foes()) if (!P.dhit.has(e) && ov(box, e)) {
        P.dhit.add(e); const ex = e.x + e.w / 2, ey = e.y + e.h / 2, boss = !!e.isBoss;
        if (dm[pk] > 0) dmgFoe(e, dm[pk] + Math.floor(baseDmg() / 2), true, true);
        if (pk === 'fire') e.burnT = Math.max(e.burnT || 0, 3);
        else if (pk === 'frost') { e.slowT = Math.max(e.slowT || 0, 3); if (!boss) e.stunT = Math.max(e.stunT || 0, 0.6); }
        else if (pk === 'volt') { zap(cx, cy, ex, ey); if (!boss) e.stunT = Math.max(e.stunT || 0, 0.9); }
        else if (pk === 'wind' && !boss) e.vx = dir * 220;
        else if (pk === 'slow') e.slowT = Math.max(e.slowT || 0, 4);
        emit(ex, ey, 10, { col: [c1, c2, '#fff'], sp0: 30, sp1: 110 });
        if (pk === 'slash') addRing(ex, ey, c1, 22, 0.2);
      }
    }
  }
  function dashEnd(P) {
    const pk = P.dpk, c = P.dc || ['#6ee7f2', '#ffffff'], c1 = c[0], c2 = c[1], cx = P.x + 4, cy = P.y + 7, gy = P.y + P.h;
    if (pk === 'shadow') { P.inv = Math.max(P.inv, 0.4); emit(cx, cy, 10, { col: [c1, c2], sp0: 10, sp1: 50, grav: -20 }); }
    else if (pk === 'holy' && !(P.dsCd > 0) && !P.shield) { P.shield = true; P.dsCd = 9; addRing(cx, cy, c1, 34, 0.5); emit(cx, cy, 16, { col: [c1, c2, '#fff'], sp0: 10, sp1: 50, grav: -30 }); pop(cx, cy - 16, sv('SHIELD!', 'KHIÊN!'), c1); }
    else if (pk === 'quake') {
      Q.shake = Math.max(Q.shake, 0.3); addRing(cx, gy, c1, 46, 0.4); Snd.play('boom');
      for (let i = -4; i <= 4; i++) emit(cx + i * 8, gy, 2, { col: [c1, c2], sp0: 5, sp1: 30, vy: -70, grav: 200, size: 2 });
      for (const e of foes()) if (Math.abs(e.x + e.w / 2 - cx) < 44 + e.w / 2 && Math.abs(e.y + e.h - gy) < 40) { dmgFoe(e, 2 + Math.floor(baseDmg() / 2), true, true); if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 0.9); }
    }
  }
  // the R skill: every hero has a look of their own (style + two colours), plus a tinted screen flash and a glow round the caster
  function rFx(P, h) {
    const fx = HERO_FX[h.id]; if (!fx) return; const [st, c1, c2] = fx.r, big = h.sk.cd >= 4, G = Q.G;
    const cx = P.x + 4, cy = P.y + 6, gy = P.y + P.h, f = P.face, cl = [c1, c2, '#ffffff'], N = n => big ? n : Math.max(1, Math.ceil(n / 3)), at = (t, fn) => later(t, fn);
    P.castT = big ? 0.6 : 0.25; P.castC = c1; if (big) { G.tint = { c: c1, t: 0.4 }; Q.shake = Math.max(Q.shake, 0.15); }
    const E = (x, y, n, o) => emit(x, y, n, Object.assign({ col: cl, size: 2 }, o));
    switch (st) {
      case 'pillar': for (let i = 0; i < N(14); i++) at(i * 0.04, () => E(cx + rr(-3, 3), gy, 3, { sp0: 0, sp1: 10, vy: -170, grav: -60, l0: 0.4, l1: 0.8 })); addRing(cx, gy, c1, 30, 0.5); break;
      case 'notes': for (let i = 0; i < N(14); i++) at(i * 0.06, () => E(cx + rr(-34, 34), cy + rr(-4, 10), 2, { sp0: 5, sp1: 20, vy: -50, grav: -30, l0: 0.6, l1: 1.1 })); break;
      case 'runes': for (let k = 0; k < 3; k++) at(k * 0.12, () => { const r = 14 + k * 16; addRing(cx, gy - 2, k % 2 ? c2 : c1, r + 6, 0.5); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; E(cx + Math.cos(a) * r, gy - 3 + Math.sin(a) * r * 0.3, 1, { sp0: 0, sp1: 6, vy: -30, grav: -30, l0: 0.5, l1: 0.9 }); } }); break;
      case 'xslash': for (let s = -1; s <= 1; s += 2) for (let k = 0; k < N(14); k++) at(k * 0.015 + (s > 0 ? 0.12 : 0), () => E(cx - s * 30 + s * k * 4.3, cy - 24 + k * 3.4, 2, { sp0: 0, sp1: 12, grav: 0, l0: 0.2, l1: 0.45 })); break;
      case 'bats': for (let i = 0; i < N(14); i++) at(i * 0.04, () => E(cx, cy, 2, { col: [c1, c2], sp0: 60, sp1: 140, vy: -40, grav: 0, l0: 0.4, l1: 0.7 })); break;
      case 'leaves': E(cx, cy, N(30), { sp0: 30, sp1: 90, vy: -40, grav: 40, l0: 0.8, l1: 1.4 }); break;
      case 'frost': addRing(cx, cy, c1, 60, 0.5); at(0.15, () => addRing(cx, cy, c2, 90, 0.5)); E(cx, cy, N(36), { sp0: 40, sp1: 130, grav: 10, l0: 0.5, l1: 1 }); break;
      case 'flames': for (let i = -5; i <= 5; i++) at(Math.abs(i) * 0.05, () => E(cx + i * 10, gy, N(5), { col: [c1, c2, '#fff'], sp0: 5, sp1: 20, vy: -120, grav: -80, l0: 0.3, l1: 0.6 })); break;
      case 'bolts': for (let i = 0; i < N(4); i++) at(i * 0.08, () => { const x = cx + rr(-70, 70); zap(x, Q.cam.y - 6, x, gy - 4); E(x, gy - 2, 8, { sp0: 20, sp1: 80, grav: 100 }); }); break;
      case 'spiral': for (let k = 0; k < N(24); k++) at(k * 0.02, () => { const a = k * 0.7, r = 4 + k * 1.8; E(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6 - k * 0.8, 2, { sp0: 0, sp1: 6, grav: -20, l0: 0.4, l1: 0.8 }); }); break;
      case 'spikes': for (let i = 1; i <= 8; i++) for (let sd = -1; sd <= 1; sd += 2) at(i * 0.04, () => E(cx + sd * i * 9, gy, 4, { sp0: 0, sp1: 8, vy: -110, sx: 0.1, grav: 200, l0: 0.3, l1: 0.6 })); break;
      case 'quakering': addRing(cx, gy, c1, 70, 0.5); at(0.12, () => addRing(cx, gy, c2, 100, 0.5)); for (let i = -8; i <= 8; i++) E(cx + i * 8, gy, N(3), { col: [c1, c2], sp0: 5, sp1: 30, vy: -90, grav: 200, l0: 0.3, l1: 0.7 }); break;
      case 'stars': addRing(cx, cy, c1, 50, 0.45); E(cx, cy, N(34), { sp0: 30, sp1: 120, grav: -10, l0: 0.5, l1: 1 }); for (let i = 0; i < N(10); i++) at(0.2 + i * 0.05, () => E(cx + rr(-40, 40), cy + rr(-30, 20), 2, { sp0: 0, sp1: 6, grav: 0, l0: 0.2, l1: 0.4 })); break;
      case 'petals': for (let i = 0; i < N(22); i++) at(i * 0.05, () => E(cx + rr(-40, 40), cy - 30 + rr(0, 20), 2, { sp0: 5, sp1: 20, vx: f * 30, vy: 20, grav: 10, l0: 0.8, l1: 1.4 })); break;
      case 'hearts': for (let i = 0; i < N(14); i++) at(i * 0.06, () => E(cx + rr(-30, 30), cy + rr(-4, 10), 2, { sp0: 3, sp1: 14, vy: -45, grav: -30, l0: 0.7, l1: 1.2 })); addRing(cx, cy, c1, 40, 0.5); break;
      case 'beamh': for (let k = 0; k < N(26); k++) at(k * 0.01, () => E(cx + f * (8 + k * 6), cy, 2, { sp0: 0, sp1: 10, vx: f * 30, grav: 0, l0: 0.2, l1: 0.4 })); break;
      case 'souls': for (let i = 0; i < N(10); i++) at(i * 0.07, () => E(cx + rr(-26, 26), gy, 2, { sp0: 3, sp1: 12, vy: -70, grav: -50, l0: 0.9, l1: 1.5 })); addRing(cx, gy, c1, 50, 0.6); break;
      case 'sunburst': for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; for (let j = 1; j <= N(5); j++) E(cx + Math.cos(a) * j * 10, cy + Math.sin(a) * j * 10, 1, { sp0: 0, sp1: 5, grav: 0, l0: 0.3, l1: 0.5 }); } addRing(cx, cy, c1, 70, 0.45); break;
      case 'sparks': E(cx + f * 10, cy, N(34), { col: [c1, c2, '#fff'], sp0: 60, sp1: 200, vx: f * 40, grav: 200, l0: 0.3, l1: 0.7 }); break;
      case 'bubbles': for (let i = 0; i < N(18); i++) at(i * 0.05, () => E(cx + rr(-30, 30), gy - rr(0, 8), 1, { sp0: 2, sp1: 10, vy: -50, grav: -35, l0: 0.8, l1: 1.4 })); break;
      case 'waves': for (let sd = -1; sd <= 1; sd += 2) for (let k = 0; k < N(10); k++) at(k * 0.03, () => E(cx + sd * k * 8, gy - 4 - Math.abs(Math.sin(k * 0.8)) * 6, 2, { sp0: 2, sp1: 10, vx: sd * 40, grav: 0, l0: 0.3, l1: 0.6 })); addRing(cx, gy, c1, 60, 0.5); break;
      case 'cross': for (let j = -6; j <= 6; j++) { E(cx + j * 7, cy, 1, { sp0: 0, sp1: 4, grav: 0, l0: 0.3, l1: 0.6 }); E(cx, cy + j * 7, 1, { sp0: 0, sp1: 4, grav: 0, l0: 0.3, l1: 0.6 }); } addRing(cx, cy, c1, 56, 0.5); break;
      case 'burst': addRing(cx, cy, c1, 60, 0.4); at(0.1, () => addRing(cx, cy, c2, 90, 0.4)); E(cx, cy, N(60), { col: [c1, c2, '#fff'], sp0: 40, sp1: 180, grav: 0, l0: 0.3, l1: 0.6 }); break;
      case 'clock': addRing(cx, cy, c1, 40, 0.7); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 - 1.57; E(cx + Math.cos(a) * 36, cy + Math.sin(a) * 36, 1, { col: [c1], sp0: 0, sp1: 2, grav: 0, l0: 0.5, l1: 0.9 }); } for (let k = 0; k < N(14); k++) at(k * 0.04, () => { const a = k * 0.45 - 1.57; for (let j = 1; j <= 6; j++) E(cx + Math.cos(a) * j * 5.5, cy + Math.sin(a) * j * 5.5, 1, { col: [c2], sp0: 0, sp1: 2, grav: 0, l0: 0.15, l1: 0.3 }); }); break;
    }
  }
  // F: the hero braces and raises a shield in their own colours; it flashes white when it catches a blow
  function drawGuard(P, x, bot) {
    const c = heroFx(P).d, c1 = c[0], c2 = c[1], t = P.guardT, k = clamp(1 - t / 0.5, 0, 1), up = Math.min(1, k * 7), fade = Math.min(1, t / 0.12), F = P.face;
    const w = Math.round(5 + 6 * up), h = Math.round(8 + 9 * up), sx = x + F * (7 + Math.round(up * 2)), sy = bot - 8 - Math.round(up), x0 = sx - (w >> 1), y0 = sy - (h >> 1), hh = h - 3;
    g.save(); g.globalAlpha = fade;
    g.fillStyle = '#f2c9a0'; g.fillRect(F > 0 ? x + 2 : x - 6, bot - 9, 4, 2);   // the bracing arm
    g.fillStyle = '#14121f'; g.fillRect(x0 - 1, y0 - 1, w + 2, hh + 2); g.fillRect(x0 + 1, y0 + hh + 1, w - 2, 2); g.fillRect(x0 + 2, y0 + hh + 3, w - 4, 1);
    g.fillStyle = c1; g.fillRect(x0, y0, w, hh); g.fillRect(x0 + 1, y0 + hh, w - 2, 2); g.fillRect(x0 + 2, y0 + hh + 2, w - 4, 1);
    g.fillStyle = c2; g.fillRect(x0 + (w >> 1), y0 + 1, 1, hh + 1); g.fillRect(x0 + 1, y0 + (hh >> 1), w - 2, 1);   // a cross on the shield
    g.fillStyle = '#ffffff'; g.fillRect(x0, y0, w, 1); g.fillRect(x0, y0, 1, hh);
    if (P.guardHit > 0) { g.globalAlpha = Math.min(1, P.guardHit / 0.3); g.fillStyle = '#fff'; g.fillRect(x0 - 1, y0 - 1, w + 2, hh + 5); g.globalAlpha = fade; }
    g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 16); gr.addColorStop(0, hexA(c1, 0.35)); gr.addColorStop(1, hexA(c1, 0)); g.fillStyle = gr; g.fillRect(sx - 16, sy - 16, 32, 32);
    g.strokeStyle = hexA(c2, 0.8); g.lineWidth = 1; g.beginPath(); g.arc(x, bot - 8, 13 + (1 - fade) * 2, F > 0 ? -1 : Math.PI - 1, F > 0 ? 1 : Math.PI + 1); g.stroke();
    g.restore();
  }
  // ---------- vines ----------""")

# the guard picture, the cast glow and the coloured dash trail
rep("""    if (P.parryT > 0) { const k = P.parryT / 0.24, cx = x + P.face * 6, cy = bot - 8; g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(159,232,255,' + (0.5 + k * 0.5) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 9 + (1 - k) * 3, P.face > 0 ? -1.1 : Math.PI - 1.1, P.face > 0 ? 1.1 : Math.PI + 1.1); g.stroke(); g.fillStyle = 'rgba(255,255,255,' + k * 0.5 + ')'; g.fillRect(cx + P.face * 9 - 1, cy - 6, 2, 12); g.globalCompositeOperation = 'source-over'; g.lineWidth = 1; }""",
    """    if (P.castT > 0 && P.castC) { const a = Math.min(1, P.castT * 2.5); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, bot - 8, 0, x, bot - 8, 26); gr.addColorStop(0, hexA(P.castC, 0.55 * a)); gr.addColorStop(1, hexA(P.castC, 0)); g.fillStyle = gr; g.fillRect(x - 26, bot - 34, 52, 52); g.restore(); }
    if (P.guardT > 0) drawGuard(P, x, bot);""")
rep("""    if (P.trail) for (const tr of P.trail) { g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, Math.round(tr.x + P.w / 2 - camX), Math.round(tr.y + P.h - camY), tr.f < 0, true, 1, 1, tr.t / 0.22 * 0.45); g.globalCompositeOperation = 'source-over'; }""",
    """    if (P.trail) for (const tr of P.trail) {
      g.globalCompositeOperation = 'lighter'; const tx = Math.round(tr.x + P.w / 2 - camX), ty = Math.round(tr.y + P.h - camY), ta = tr.t / 0.22;
      if (P.dc) { const gr = g.createRadialGradient(tx, ty - 7, 0, tx, ty - 7, 11); gr.addColorStop(0, hexA(P.dc[0], 0.5 * ta)); gr.addColorStop(1, hexA(P.dc[0], 0)); g.fillStyle = gr; g.fillRect(tx - 11, ty - 18, 22, 22); }
      drawSpr(g, spr, tx, ty, tr.f < 0, true, 1, 1, ta * 0.45); g.globalCompositeOperation = 'source-over';
    }""")

# R: call the effect, tint overlay
rep("""    P.skCd = s.cd; Snd.play('relic'); pop(cx, cy - 18, LN(s.n), s.col); addRing(cx, cy, s.col, 34, 0.35); emit(cx, cy, 14, { col: [s.col, '#fff'], sp0: 20, sp1: 80 });""",
    """    P.skCd = s.cd; Snd.play('relic'); pop(cx, cy - 18, LN(s.n), s.col); addRing(cx, cy, s.col, 34, 0.35); emit(cx, cy, 14, { col: [s.col, '#fff'], sp0: 20, sp1: 80 }); rFx(P, h);""")
rep("""    if (G.flash > 0) G.flash -= dt;
    if (G.slowT > 0) G.slowT -= dt;""", """    if (G.flash > 0) G.flash -= dt;
    if (G.tint && G.tint.t > 0) G.tint.t -= dt;
    if (G.slowT > 0) G.slowT -= dt;""")
rep("""    if (G.slowT > 0) { g.globalAlpha = 0.1 + 0.05 * Math.sin(Q.t * 6); g.fillStyle = '#ffd34e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
  }""", """    if (G.tint && G.tint.t > 0) { g.globalAlpha = Math.min(0.28, G.tint.t * 0.7); g.fillStyle = G.tint.c; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    if (G.slowT > 0) { g.globalAlpha = 0.1 + 0.05 * Math.sin(Q.t * 6); g.fillStyle = '#ffd34e'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
  }""")

# hero select: show the flash perk
rep("""    txt(sv('Your hero is used in every map and in online co-op.', 'Nhân vật được dùng ở mọi map và cả co-op online.'), 192, 170, { size: 5.5, col: '#8892aa' });""",
    """    { const fx = HERO_FX[h.id]; if (fx) wrapText(sv('Flash: ', 'Flash: ') + LN(DASH_PERK[fx.p]), 46).slice(0, 2).forEach((l, i) => txt(l, 192, 152 + i * 8, { size: 5.8, col: fx.d[0] })); }
    txt(sv('Your hero is used in every map and in online co-op.', 'Nhân vật được dùng ở mọi map và cả co-op online.'), 192, 172, { size: 5.5, col: '#8892aa' });""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
