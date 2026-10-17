import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, 'MISSING: ' + old[:90]
    s = s.replace(old, new, cnt)


# ---------------- BOSS config ----------------
a = s.index("  const BOSS = [")
b = s.index("  // ---------- caches ----------")
s = s[:a] + u"""  const BOSS = [
    { name: { en: 'King Slime', vi: 'Vua Slime' }, w: 38, h: 26, hp: 120, armor: 0, smart: 0.35, sp: 20, minion: 'slime', skills: ['jump', 'bounce3', 'goo', 'splitslime', 'stomp'], skills2: ['shoot'] },
    { name: { en: 'Spider Queen', vi: 'Nữ Hoàng Nhện' }, w: 40, h: 26, hp: 190, armor: 0.1, smart: 0.5, sp: 26, minion: 'spider', skills: ['charge', 'web', 'spit', 'ambush', 'summon'], skills2: ['jump'] },
    { name: { en: 'Crystal Golem', vi: 'Người Khổng Lồ Pha Lê' }, w: 34, h: 44, hp: 250, armor: 0.2, smart: 0.45, sp: 18, minion: 'wisp', skills: ['jump', 'erupt', 'shield', 'beam', 'rain'], skills2: ['charge'] },
    { name: { en: 'Sand Pharaoh', vi: 'Pharaoh Cát' }, w: 26, h: 52, hp: 320, armor: 0.25, smart: 0.6, sp: 28, minion: 'scorpion', skills: ['curse', 'tornado', 'summon', 'teleport', 'shoot', 'charge'], skills2: ['spin'] },
    { name: { en: 'Frost King', vi: 'Vua Băng' }, w: 36, h: 48, hp: 380, armor: 0.3, smart: 0.55, sp: 18, minion: 'iceslime', skills: ['breath', 'wall', 'blizzard', 'rain', 'jump', 'spin'], skills2: ['shield', 'summon'] },
    { name: { en: 'Magma Titan', vi: 'Titan Dung Nham' }, w: 40, h: 50, hp: 440, armor: 0.4, smart: 0.5, sp: 22, minion: 'imp', skills: ['lavaCols', 'meteor', 'sweep', 'charge', 'shield', 'jump'], skills2: ['spin', 'summon'] },
    { name: { en: 'THE ECLIPSE', vi: 'NHẬT THỰC' }, w: 30, h: 56, hp: 620, armor: 0.4, smart: 0.8, sp: 30, minion: 'ghost', eclipse: true, skills: ['beam', 'teleport', 'spin', 'erupt', 'tornado'], skills2: ['dark', 'clone', 'summon'], skills3: ['shield', 'meteor'] }
  ];

""" + s[b:]

rep("    lavablob: {", "    eclipseclone: { spr: 'knight', out: '#d58bff', w: 12, h: 16, hp: 5, sp: 60, ai: 'charge' },\n    lavablob: {")

# ---------------- makeBoss ----------------
a = s.index("  function makeBoss(s) {")
b = s.index("  function initWeather() {") if False else s.index("  // ---------- creepy darkness")
s = s[:a] + u"""  function makeBoss(s) {
    const c = BOSS[Q.li], hp = Math.round(c.hp * (1 + 0.02 * totalShards()));
    return { isBoss: true, cfg: c, spr: bossSprite(Q.li), x: s.x - c.w / 2, y: s.y - c.h, w: c.w, h: c.h, vx: 0, vy: 0, hp, max: 0, dir: -1, st: 'sleep', timer: 0, flash: 0, t: 0, sk: null, atkSk: null, lastSk: null, onGround: false, noOneWay: true, n: 0, phase: 0, shield: 0, evCd: 1, invul: 0, hide: false, closeT: 0, fury: 1, armor: c.armor };
  }
""" + s[b:]

# ---------------- hurtBoss ----------------
a = s.index("  function hurtBoss(b, dmg) {")
b = s.index("  function updateBossDeath(dt) {")
s = s[:a] + u"""  function hurtBoss(b, dmg, pierce) {
    if (b.isDragon) return hurtDragon(b, dmg, pierce);
    if (b.hide || b.st === 'intro' || b.st === 'sleep' || b.invul > 0 || b.dead) return;
    if (b.shield > 0) {
      if (!pierce) { Snd.play('hit'); b.flash = 0.04; emit(b.x + b.w / 2, b.y + b.h / 2, 5, { col: ['#6ee7f2', '#fff'], sp0: 40, sp1: 110 }); return; }
      b.shield = 0; b.st = 'stun'; b.stunT = 2.2; b.sk = null; dmg *= 1.5; Q.msg = save.lang === 'vi' ? 'Khiên vỡ! Nó choáng!' : 'Shield broken! It is stunned!'; Q.msgT = 3; Snd.play('explode');
    }
    const arm = b.cfg.armor || 0, eff = dmg * (1 - arm * (pierce ? 0.4 : 1)) * ((b.st === 'stun' || b.st === 'rec') ? 1.25 : 1);
    b.hp -= eff; b.flash = 0.1; Q.shake = Math.max(Q.shake, 0.12);
    Snd.creature(Q.li, b.hp <= 0 ? 'die' : 'hurt', true);
    emit(b.x + b.w / 2, b.y + b.h / 2, 8, { col: ['#fff', '#ffd34e'], sp0: 20, sp1: 90 });
    if (arm > 0.15 && !pierce) emit(b.x + b.w / 2, b.y + b.h / 2, 4, { col: ['#cfd6e6', '#8d9bbd'], sp0: 30, sp1: 100 });
    const pct = b.hp / b.max;
    if (!b.t1 && pct < 0.66) { b.t1 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (!b.t2 && pct < 0.33) { b.t2 = 1; Q.items.push({ kind: 'heart', x: b.x + b.w / 2, y: b.y - 10, id: -1, vy: -150, vx: 0, ph: 0, drop: true }); }
    if (b.hp <= 0) {
      b.dead = true; Q.bossDead = true; Q.bossDeadT = 0; Q.bossBooms = 0; Q.freeze = 0.25; Q.shake = 1;
      Snd.play('boom'); Snd.stop(); Q.zones.length = 0; cleanupCells(); Q.windT = 0; Q.darkBoost = 0;
      Q.ents.forEach(e => { if (!e.dead) { e.dead = true; emit(e.x, e.y, 10, { col: '#fff' }); } });
      Q.projs.length = 0;
      const ar = Q.L.arena;
      Q.items.push({ kind: 'frag', x: clamp(b.x + b.w / 2, (ar.x0 + 5) * TS, (ar.x1 - 5) * TS), y: ar.gy * TS - 22, id: -1, ph: 0 });
    }
  }
""" + s[b:]
rep("for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg, true);\n    const b = Q.boss;\n    if (b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < r + b.w / 2) hurtBoss(b, dmg);",
    "for (const e of Q.ents) if (!e.dead && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < r + 6) hurtEnemy(e, dmg, true);\n    for (const b of bossTargets()) if (Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < r + b.w / 2) hurtBoss(b, dmg, true);")
rep("        const b = Q.boss; if (b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && ov(box, b)) hurtBoss(b, 1);\n", "        for (const b of bossTargets()) if (ov(box, b)) hurtBoss(b, 1, true);\n")

# ---------------- hit lists use bossTargets ----------------
rep("    const list = Q.ents.slice(); if (Q.boss && Q.boss.st !== 'sleep' && Q.boss.st !== 'intro' && !Q.bossDead) list.push(Q.boss);", "    const list = Q.ents.slice().concat(bossTargets());")
rep("      const b = Q.boss; if (!hit && b && !b.dead && b.st !== 'sleep' && b.st !== 'intro' && ov(box, b)) hit = b;", "      if (!hit) for (const b of bossTargets()) if (ov(box, b)) { hit = b; break; }")

# ---------------- BOSS AI ----------------
a = s.index("  function bossStart(b) {")
b = s.index("  function updateProjs(dt) {")
s = s[:a] + u"""  // ===================== BOSS AI =====================
  const bc = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  function bossTargets() {
    const out = [], b = Q.boss, d = Q.dragon;
    if (b && !b.dead && !b.hide && b.st !== 'sleep' && b.st !== 'intro') out.push(b);
    if (d && !d.dead && d.st !== 'sleep' && d.st !== 'enter' && d.st !== 'gone') out.push(d);
    return out;
  }
  function cleanupCells() { if (Q.tmpCells) for (const c of Q.tmpCells) if (Q.L.grid[c[1]][c[0]] === 'I') Q.L.grid[c[1]][c[0]] = ' '; Q.tmpCells = []; }
  function addZone(o) { Q.zones.push(Object.assign({ t: 0, tel: 0.7, life: 0.6, dmg: 1, col: Q.B.proj, vx: 0 }, o)); }
  function shockwave(b, small) {
    const c = bc(b); Q.shake = small ? 0.25 : 0.5; Snd.play('boom'); emit(c.x, b.y + b.h, 14, { col: '#cfd6e6', sp0: 20, sp1: 80, vy: -20 });
    const sp = (small ? 70 : 95) * b.fury;
    Q.projs.push({ x: c.x - 12, y: b.y + b.h - 6, vx: -sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
    Q.projs.push({ x: c.x + 12, y: b.y + b.h - 6, vx: sp, vy: 0, life: 1.8, grav: 0, col: Q.B.proj, type: 'wave', boss: true });
  }
  function bounceJump(b) { const P = Q.P; b.vy = -270; b.vx = clamp((P.x - b.x) * 1.5, -140, 140); b.onGround = false; b.jt = 0; }
  const wait = (b, dt) => { b.skT -= dt; return b.skT <= 0; };
  const arenaClamp = x => clamp(x, Q.L.arena.x0 * TS + 24, Q.L.arena.x1 * TS - 24);
  const BS = {
    jump: { tele: 0.55, start(b) { const P = Q.P; b.vy = -310; b.vx = clamp((P.x - b.x) * 1.4, -150, 150); b.onGround = false; b.jt = 0; }, upd(b, dt) { b.jt += dt; moveX(b, b.vx * dt); if (b.onGround && b.jt > 0.2) { shockwave(b); return true; } } },
    stomp: { tele: 0.45, start(b) { b.vy = -240; b.vx = 0; b.onGround = false; b.jt = 0; }, upd(b, dt) { b.jt += dt; if (b.onGround && b.jt > 0.2) { shockwave(b); return true; } } },
    bounce3: { tele: 0.5, start(b) { b.n = 3; bounceJump(b); }, upd(b, dt) { b.jt += dt; moveX(b, b.vx * dt); if (b.onGround && b.jt > 0.18) { shockwave(b, true); if (--b.n > 0) bounceJump(b); else return true; } } },
    charge: { tele: 0.6, start(b) { b.dir = Q.P.x < b.x ? -1 : 1; b.skT = 1.3; b.recAfter = 1.1; }, upd(b, dt) { b.skT -= dt; if (moveX(b, b.dir * 155 * b.fury * dt)) { Q.shake = 0.4; Snd.play('boom'); return true; } if (Math.random() < 0.5) emit(b.x + b.w / 2 - b.dir * b.w / 2, b.y + b.h, 1, { col: '#cfd6e6', sp0: 5, sp1: 20, vy: -10, grav: 20 }); return b.skT <= 0; } },
    shoot: { tele: 0.55, start(b) { b.n = 2 + (Q.li > 3 ? 1 : 0); b.skT = 0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x), k = Q.li > 4 ? 2 : 1; for (let i = -k; i <= k; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.28) * 105, Math.sin(a0 + i * 0.28) * 105, { boss: true }); if (--b.n <= 0) return true; b.skT = 0.55 / b.fury; } } },
    rain: { tele: 0.5, start(b) { b.skT = 2.4; b.drop = 0; }, upd(b, dt) { b.skT -= dt; b.drop -= dt; const ar = Q.L.arena; if (b.drop <= 0) { b.drop = 0.2 / b.fury; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: Q.B.proj, type: 'fall', boss: true }); } return b.skT <= 0; } },
    spin: { tele: 0.55, start(b) { b.n = 2 + (Q.li > 4 ? 1 : 0); b.skT = 0; b.rot = 0; b.recAfter = 1.0; }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0) { const c = bc(b); b.rot += 0.26; for (let i = 0; i < 12; i++) { const a = b.rot + i / 12 * Math.PI * 2; firePr(c.x, c.y, Math.cos(a) * 80, Math.sin(a) * 80, { boss: true }); } if (--b.n <= 0) return true; b.skT = 0.8 / b.fury; } } },
    summon: { tele: 0.5, start(b) {
      let alive = Q.ents.filter(e => !e.dead).length;
      for (let i = 0; i < 3 && alive < 5; i++, alive++) { const m = makeEnemy(b.cfg.minion, b.x + b.w / 2 + (i - 1) * 34, b.y + b.h - 4, { minion: true }); if (!m.fly) m.vy = -150; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 10, { col: Q.B.proj }); }
      Snd.creature(Q.li, 'alert', true); b.skT = 0.8; }, upd: wait },
    splitslime: { tele: 0.5, start(b) { for (let i = 0; i < 3; i++) { const m = makeEnemy('slime', b.x + b.w / 2 + (i - 1) * 30, b.y + b.h - 4, { minion: true, v: 'small' }); m.vy = -170; m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 8, { col: '#a4e86b' }); } Snd.creature('slime', 'alert'); b.skT = 0.9; }, upd: wait },
    goo: { tele: 0.5, start(b) { const P = Q.P; for (let i = -1; i <= 1; i++) { const x = arenaClamp(P.x + 4 + i * 44 + rr(-8, 8)); addZone({ type: 'goo', x: x - 18, y: groundYAt(x) - 5, w: 36, h: 5, tel: 0.4, life: 6, col: '#7a4cff' }); } b.skT = 0.9; Snd.play('flame'); }, upd: wait },
    web: { tele: 0.55, start(b) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -1; i <= 1; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.25) * 95, Math.sin(a0 + i * 0.25) * 95, { boss: true, col: '#e8e8f8', big: true, status: { slow: 2.4 } }); b.skT = 0.6; }, upd: wait },
    spit: { tele: 0.6, start(b) { const c = bc(b), P = Q.P, t = 1.0; Q.projs.push({ x: c.x, y: c.y, vx: ((P.x + 4) - c.x) / t, vy: -150, grav: 300, life: 3, col: '#9be564', type: 'ball', boss: true, big: true, onLand: 'poison' }); Snd.play('shoot'); b.skT = 1.0; }, upd: wait },
    ambush: { tele: 0.7, start(b) { b.hide = true; b.ph = 0; b.skT = 0.5; emit(b.x + b.w / 2, b.y + b.h / 2, 16, { col: ['#5a2d8f', '#a15be0'], sp0: 20, sp1: 80 }); b.y = -300; Snd.creature(Q.li, 'attack', true); },
      upd(b, dt) {
        b.skT -= dt; const P = Q.P, ar = Q.L.arena;
        if (b.ph === 0) { if (b.skT <= 0) { b.ph = 1; b.skT = 1.0; b.mx = P.x + 4; } }
        else if (b.ph === 1) { b.mx = lerp(b.mx, P.x + 4, 0.07); if (b.skT <= 0) { b.ph = 2; b.skT = 0.4; b.lockx = clamp(b.mx, ar.x0 * TS + 30, ar.x1 * TS - 30); } }
        else if (b.ph === 2) { if (b.skT <= 0) { b.hide = false; b.x = b.lockx - b.w / 2; b.y = Q.cam.y - b.h - 8; b.vy = 380; b.ph = 3; b.jt = 0; Snd.creature(Q.li, 'alert', true); } }
        else if (b.ph === 3) { b.jt += dt; if (b.onGround && b.jt > 0.1) { shockwave(b); return true; } }
      } },
    erupt: { tele: 0.55, start(b) {
      const P = Q.P, d = P.x + 4 < b.x + b.w / 2 ? -1 : 1, c = b.x + b.w / 2;
      if (b.cfg.eclipse) { for (let i = -2; i <= 2; i++) { const x = arenaClamp(P.x + 4 + i * 26); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 34, w: 14, h: 34, tel: 0.7 + Math.abs(i) * 0.12, life: 0.5, col: '#a15be0' }); } }
      else for (let i = 1; i <= 7; i++) { const x = arenaClamp(c + d * i * 20); addZone({ type: 'spike', x: x - 7, y: groundYAt(x) - 34, w: 14, h: 34, tel: 0.55 + i * 0.1, life: 0.5 }); }
      b.skT = 1.9; }, upd: wait },
    shield: { tele: 0.4, start(b) { b.shield = 3.4; b.skT = 3.4; Snd.play('gate'); }, upd(b, dt) { b.skT -= dt; return b.skT <= 0 || b.shield <= 0; } },
    beam: { tele: 0.9, start(b) {
      const ar = Q.L.arena, gt = ar.gy * TS, c = bc(b), low = Math.random() < 0.6, dx = Q.P.x + 4 < c.x ? -1 : 1;
      const x0 = dx < 0 ? ar.x0 * TS + 8 : c.x, x1 = dx < 0 ? c.x : ar.x1 * TS - 8;
      addZone({ type: 'beam', x: x0, y: low ? gt - 9 : gt - 38, w: x1 - x0, h: 10, tel: 0.9, life: 0.55 }); b.skT = 1.7; Snd.play('flame'); }, upd: wait },
    curse: { tele: 0.6, start(b) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); for (let i = -1; i <= 1; i++) firePr(c.x, c.y, Math.cos(a0 + i * 0.35) * 85, Math.sin(a0 + i * 0.35) * 85, { boss: true, col: '#c07bff', big: true, status: { rev: 3.5 } }); b.skT = 0.8; }, upd: wait },
    tornado: { tele: 0.6, start(b) { const c = bc(b); addZone({ type: 'pull', x: c.x - 110, y: Q.L.arena.gy * TS - 70, w: 220, h: 70, tel: 0.4, life: 3, col: b.cfg.eclipse ? '#a15be0' : '#e0c070' }); b.skT = 3.4; Snd.play('flame'); }, upd: wait },
    teleport: { tele: 0.3, start(b) { b.hide = true; b.ph = 0; b.skT = 0.55; emit(b.x + b.w / 2, b.y + b.h / 2, 20, { col: ['#5a2d8f', '#a15be0', '#fff'], sp0: 20, sp1: 90 }); Snd.sting(); b.y = -300; },
      upd(b, dt) {
        b.skT -= dt; const P = Q.P, ar = Q.L.arena;
        if (b.ph === 0 && b.skT <= 0) { let nx = P.x + 4 + (Math.random() < 0.5 ? -1 : 1) * 70; nx = arenaClamp(nx); b.x = nx - b.w / 2; b.y = ar.gy * TS - b.h; b.vy = 0; b.hide = false; b.ph = 1; b.skT = 0.45; emit(nx, b.y + b.h / 2, 20, { col: ['#5a2d8f', '#a15be0', '#fff'], sp0: 20, sp1: 90 }); Snd.creature(Q.li, 'alert', true); }
        else if (b.ph === 1 && b.skT <= 0) { shockwave(b, true); return true; }
      } },
    breath: { tele: 0.7, start(b) { b.n = 10; b.skT = 0; Snd.play('flame'); }, upd(b, dt) { b.skT -= dt; if (b.skT <= 0 && b.n > 0) { const c = bc(b), P = Q.P, a0 = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x), a = a0 + (b.n - 5) * 0.07; firePr(c.x, c.y, Math.cos(a) * 115, Math.sin(a) * 115, { boss: true, col: '#bfeaff', status: { slow: 1.8 }, life: 1.1 }); b.n--; b.skT = 0.06; } return b.n <= 0; } },
    wall: { tele: 0.6, start(b) {
      const P = Q.P, ar = Q.L.arena, tx = Math.floor((P.x + 4) / TS); Q.tmpCells = Q.tmpCells || [];
      for (const o of [-3, 3]) for (let k = 1; k <= 4; k++) { const X = tx + o, Y = ar.gy - k; if (X > ar.x0 + 1 && X < ar.x1 - 1 && Q.L.grid[Y][X] === ' ') { Q.L.grid[Y][X] = 'I'; Q.tmpCells.push([X, Y]); emit(X * TS + 8, Y * TS + 8, 4, { col: ['#bfeaff', '#fff'], sp0: 20, sp1: 60 }); } }
      Snd.play('gate'); b.skT = 4.2; b.shotT = 0.8; },
      upd(b, dt) { b.skT -= dt; b.shotT -= dt; if (b.shotT <= 0) { b.shotT = 0.9; const c = bc(b), P = Q.P, a = Math.atan2(P.y + 7 - c.y, P.x + 4 - c.x); firePr(c.x, c.y, Math.cos(a) * 100, Math.sin(a) * 100, { boss: true, col: '#bfeaff', status: { slow: 1.5 } }); } if (b.skT <= 0) { cleanupCells(); return true; } } },
    blizzard: { tele: 0.6, start(b) { Q.windDir = Math.random() < 0.5 ? -1 : 1; Q.windT = 4.5; b.skT = 4.5; b.drop = 0; Snd.play('flame'); }, upd(b, dt) { b.skT -= dt; b.drop -= dt; const ar = Q.L.arena; if (b.drop <= 0) { b.drop = 0.32; Q.projs.push({ x: rr((ar.x0 + 3) * TS, (ar.x1 - 2) * TS), y: (ar.gy - 12) * TS, vx: 0, vy: 30, life: 3, grav: 260, col: '#bfeaff', type: 'fall', boss: true }); } return b.skT <= 0; } },
    lavaCols: { tele: 0.6, start(b) {
      const P = Q.P, xs = [P.x + 4, P.x + 4 - 46 + rr(0, 10), P.x + 4 + 46 - rr(0, 10), P.x + 4 + (Math.random() < 0.5 ? -92 : 92)];
      xs.forEach((x, i) => { x = arenaClamp(x); addZone({ type: 'lava', x: x - 9, y: groundYAt(x) - 70, w: 18, h: 70, tel: 0.85 + i * 0.1, life: 0.7 }); }); b.skT = 2.2; }, upd: wait },
    meteor: { tele: 0.6, start(b) { const P = Q.P; for (let i = 0; i < 5; i++) { const x = arenaClamp(P.x + 4 + (i === 0 ? 0 : rr(-110, 110))); addZone({ type: 'meteor', x: x - 12, y: groundYAt(x) - 30, w: 24, h: 30, tel: 0.9 + i * 0.35, life: 0.3 }); } b.skT = 2.8; }, upd: wait },
    sweep: { tele: 0.7, start(b) { const ar = Q.L.arena, dir = Q.P.x < (ar.x0 + ar.x1) / 2 * TS ? 1 : -1, sx = dir > 0 ? ar.x0 * TS + 12 : ar.x1 * TS - 12; addZone({ type: 'sweep', x: sx - 8, y: ar.gy * TS - 64, w: 16, h: 64, tel: 0.9, life: 3.4, vx: dir * 95 }); b.skT = 4.0; Snd.play('flame'); }, upd: wait },
    dark: { tele: 0.6, start(b) { Q.darkBoost = 0.75; Q.darkBoostT = 7; const ar = Q.L.arena; for (let i = 0; i < 2; i++) { const m = makeEnemy('shadewisp', (ar.x0 + 6 + i * 18) * TS, (ar.gy - 4) * TS, { minion: true }); m.alerted = true; Q.ents.push(m); } Snd.whisper(); b.skT = 1.0; }, upd: wait },
    clone: { tele: 0.6, start(b) { const ar = Q.L.arena; for (let i = 0; i < 2; i++) { const m = makeEnemy('eclipseclone', (ar.x0 + 8 + i * 14) * TS, ar.gy * TS, { minion: true, v: 'big' }); m.alerted = true; Q.ents.push(m); emit(m.x, m.y, 14, { col: ['#a15be0', '#fff'], sp0: 20, sp1: 80 }); } Snd.creature(Q.li, 'alert', true); b.skT = 0.9; }, upd: wait }
  };
  function groundYAt(x) { const tx = Math.floor(x / TS); for (let ty = 3; ty < Q.L.H; ty++) if (solid(tx, ty)) return ty * TS; return Q.L.arena.gy * TS; }
  const MELEE = ['jump', 'stomp', 'charge', 'erupt', 'teleport', 'bounce3', 'ambush'], RANGED = ['shoot', 'web', 'spit', 'curse', 'breath', 'rain', 'beam', 'meteor', 'lavaCols', 'sweep', 'spin'];
  function pickSkill(b) {
    const c = b.cfg, P = Q.P; let list = c.skills.slice();
    if (b.phase >= 1 && c.skills2) list = list.concat(c.skills2);
    if (b.phase >= 2 && c.skills3) list = list.concat(c.skills3);
    const dist = Math.abs(P.x + 4 - (b.x + b.w / 2));
    let tot = 0; const ws = list.map(k => {
      let w = 1; if (dist < 60 && MELEE.indexOf(k) >= 0) w *= 2.2; if (dist > 150 && RANGED.indexOf(k) >= 0) w *= 2; if (k === b.lastSk) w *= 0.12;
      if ((k === 'shield' || k === 'summon' || k === 'dark' || k === 'clone') && Q.t - (b['u_' + k] || -99) < 12) w *= 0.08;
      tot += w; return w;
    });
    let r = Math.random() * tot; for (let i = 0; i < list.length; i++) { r -= ws[i]; if (r <= 0) return list[i]; }
    return list[0];
  }
  function endSkill(b) { b.st = 'rec'; b.timer = (b.recAfter || 0.8) / b.fury; b.recAfter = 0; b.lastSk = b.sk; b.sk = null; }
  function updateBoss(dt) {
    const b = Q.boss; if (!b || b.dead) return;
    const P = Q.P, c = b.cfg;
    b.t += dt; if (b.flash > 0) b.flash -= dt; if (b.shield > 0) b.shield -= dt; if (b.evCd > 0) b.evCd -= dt; if (b.invul > 0) b.invul -= dt;
    b.fury = 1 + (1 - b.hp / (b.max || b.hp)) * 0.7;
    if (b.st === 'sleep') return;
    if (b.st === 'intro') { b.timer += dt; if (b.timer > 2.2) { b.st = 'wait'; b.timer = 0.8; Q.state = 'play'; } return; }
    const pct = b.hp / b.max, ph = pct < 0.33 ? 2 : (pct < 0.66 ? 1 : 0);
    if (ph > b.phase) { b.phase = ph; b.invul = 1.0; Q.shake = 0.8; Snd.creature(Q.li, 'alert', true); emit(b.x + b.w / 2, b.y + b.h / 2, 30, { col: ['#fff', Q.B.proj], sp0: 40, sp1: 160 }); Q.msg = save.lang === 'vi' ? 'Boss nổi điên!' : 'The boss is enraged!'; Q.msgT = 3; }
    if (b.hide) { const sk = BS[b.sk]; if (sk && sk.upd(b, dt)) endSkill(b); return; }
    b.vy = Math.min(420, b.vy + GRAV * dt);
    const cxm = b.x + b.w / 2, cym = b.y + b.h / 2, dxp = (P.x + 4) - cxm;
    switch (b.st) {
      case 'wait': {
        b.dir = dxp < 0 ? -1 : 1;
        if (Math.abs(dxp) > b.w / 2 + 36) moveX(b, b.dir * c.sp * b.fury * dt);
        // intelligence: dodge incoming attacks
        const threat = (P.atk > 0 && Math.abs(dxp) < b.w / 2 + 36) || Q.fps.some(p => p.t !== 'blast' && p.t !== 'wave' && Math.abs(p.x - cxm) < b.w / 2 + 46 && Math.abs(p.y - cym) < b.h / 2 + 18 && (p.vx > 0) === (cxm > p.x));
        if (threat && b.evCd <= 0 && Math.random() < c.smart * dt * 9) {
          b.st = 'evade'; b.skT = 0.34; b.evCd = 2.4 - c.smart; b.ed = dxp < 0 ? 1 : -1;
          const ar = Q.L.arena; if ((b.ed > 0 && cxm > ar.x1 * TS - 50) || (b.ed < 0 && cxm < ar.x0 * TS + 50)) { b.ed = -b.ed; b.vy = -280; b.onGround = false; }
          emit(cxm, b.y + b.h, 6, { col: '#cfd6e6', sp0: 20, sp1: 60, vy: -10 }); break;
        }
        b.closeT = Math.abs(dxp) < b.w / 2 + 22 ? b.closeT + dt : 0;
        b.timer -= dt;
        if (b.timer <= 0 || b.closeT > 1.5) {
          b.atkSk = b.closeT > 1.5 ? 'stomp' : pickSkill(b); b.closeT = 0; b['u_' + b.atkSk] = Q.t;
          b.st = 'tele'; b.timer = BS[b.atkSk].tele / b.fury; Snd.creature(Q.li, 'attack', true);
        }
        break;
      }
      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; } break;
      case 'act': { const sk = BS[b.sk]; if (sk.upd(b, dt)) endSkill(b); break; }
      case 'evade': {
        b.skT -= dt; moveX(b, b.ed * 215 * dt);
        if (Math.random() < 0.6) emit(cxm, b.y + b.h - 2, 1, { col: '#cfd6e6', sp0: 5, sp1: 25, vy: -8, grav: 20 });
        if (b.skT <= 0) { if (Math.random() < 0.3) { b.atkSk = 'stomp'; b.st = 'tele'; b.timer = 0.3; } else { b.st = 'rec'; b.timer = 0.25; } }
        break;
      }
      case 'stun': b.stunT -= dt; if (Math.random() < 0.3) emit(cxm + rr(-b.w / 3, b.w / 3), b.y, 1, { col: ['#ffd34e', '#fff'], sp0: 5, sp1: 30, grav: 60 }); if (b.stunT <= 0) { b.st = 'wait'; b.timer = 0.6; } break;
      case 'rec': b.timer -= dt; if (b.timer <= 0) { b.st = 'wait'; b.timer = 0.65 / b.fury; } break;
    }
    moveY(b, b.vy * dt);
    if (!b.hide && ov(P, { x: b.x + 3, y: b.y + 3, w: b.w - 6, h: b.h - 4 })) hurtPlayer(Q.li >= 3 ? 2 : 1, cxm);
  }

  // ===================== zones + statuses =====================
  function updateZones(dt) {
    const P = Q.P;
    for (const z of Q.zones) {
      z.t += dt; z.x += (z.vx || 0) * dt;
      if (!z.fired && z.t >= z.tel) {
        z.fired = true;
        if (z.type === 'meteor') { Snd.play('explode'); Q.shake = Math.max(Q.shake, 0.3); emit(z.x + z.w / 2, z.y + z.h, 22, { col: ['#fff6c0', '#ffd34e', '#f08a2b'], sp0: 30, sp1: 130 }); }
        else if (z.type === 'spike' || z.type === 'lava') { Snd.play('crumble'); Q.shake = Math.max(Q.shake, 0.12); }
        else if (z.type === 'beam') { Snd.play('flame'); Q.shake = Math.max(Q.shake, 0.2); }
      }
      if (!(z.t >= z.tel && z.t < z.tel + z.life)) continue;
      const box = { x: z.x, y: z.y, w: z.w, h: z.h };
      if (z.type === 'poison') { z.tick = (z.tick || 0) - dt; if (ov(P, box) && z.tick <= 0) { z.tick = 0.9; hurtPlayer(1, z.x + z.w / 2, true); } }
      else if (z.type === 'goo') { if (ov(P, box)) P.slow = Math.max(P.slow || 0, 0.5); }
      else if (z.type === 'pull') {
        const cx = z.x + z.w / 2, dx = cx - (P.x + 4);
        if (Math.abs(dx) < z.w / 2) moveX(P, clamp(dx, -1, 1) * 58 * dt);
        if (Math.random() < 0.5) emit(cx + rr(-z.w / 2, z.w / 2), z.y + rr(0, z.h), 1, { col: z.col, sp0: 10, sp1: 30, vx: (cx - 0) * 0, grav: -10, l0: 0.3, l1: 0.6 });
        if (Math.abs(dx) < 12 && Math.abs(P.y + 7 - (z.y + z.h / 2)) < 26) { z.tick = (z.tick || 0) - dt; if (z.tick <= 0) { z.tick = 0.5; hurtPlayer(1, cx); } }
      }
      else if (ov(P, box)) hurtPlayer(z.dmg, z.x + z.w / 2);
    }
    Q.zones = Q.zones.filter(z => z.t < z.tel + z.life);
  }
  function drawZones(camX, camY) {
    for (const z of Q.zones) {
      const x = Math.round(z.x - camX), y = Math.round(z.y - camY), w = z.w, h = z.h;
      if (x > VW + 120 || x + w < -120) continue;
      if (z.t < z.tel) {
        const k = z.t / z.tel, bl = Math.floor(z.t * 12) % 2;
        if (z.type === 'poison' || z.type === 'goo') continue;
        if (z.type === 'meteor') { const my = y + h - 130 * (1 - k); disc(g, x + (w >> 1), Math.round(my), 5, '#e0453a'); disc(g, x + (w >> 1), Math.round(my), 3, '#ffd34e'); g.fillStyle = 'rgba(255,150,40,.5)'; g.fillRect(x + (w >> 1) - 1, Math.round(my) - 14, 3, 12); }
        g.globalAlpha = 0.18 + 0.3 * k; g.fillStyle = bl ? '#ff3a2a' : '#ffb03a'; g.fillRect(x, y, w, h); g.globalAlpha = 1;
        g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(x, y + h - 2, w, 2);
        if (z.type !== 'beam') { g.fillRect(x + (w >> 1) - 1, y + h - 12, 2, 6); g.fillRect(x + (w >> 1) - 1, y + h - 4, 2, 2); }
        continue;
      }
      if (z.type === 'spike') { g.fillStyle = z.col; for (let i = 0; i < w; i += 7) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 3.5, y); g.lineTo(x + i + 7, y + h); g.fill(); } g.fillStyle = '#fff'; g.fillRect(x + 3, y + 4, 1, h - 6); }
      else if (z.type === 'lava') { for (let i = 0; i < h; i += 4) { g.fillStyle = i < 16 ? '#fff6c0' : (i < 40 ? '#ffd34e' : '#f06a20'); g.fillRect(x + (Math.random() < 0.4 ? 1 : 0), y + i, w - (Math.random() < 0.4 ? 2 : 0), 4); } }
      else if (z.type === 'beam') { g.fillStyle = z.col; g.globalAlpha = 0.45; g.fillRect(x, y - 2, w, h + 4); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x, y + 2, w, h - 4); }
      else if (z.type === 'poison') { g.fillStyle = z.col; g.globalAlpha = 0.7; g.fillRect(x, y, w, h); g.globalAlpha = 1; if (Math.random() < 0.3) { g.fillStyle = '#d8ff9a'; g.fillRect(x + ((Math.random() * w) | 0), y - 2, 2, 2); } }
      else if (z.type === 'goo') { g.fillStyle = z.col; g.globalAlpha = 0.75; g.fillRect(x, y, w, h); g.fillRect(x + 4, y - 2, w - 8, 2); g.globalAlpha = 1; }
      else if (z.type === 'pull') { const cx = x + (w >> 1); for (let i = 0; i < 14; i++) { const a = Q.t * 7 + i * 0.45, rd = 14 + i * 7; g.fillStyle = i % 2 ? z.col : '#fff'; g.fillRect(Math.round(cx + Math.cos(a) * rd), Math.round(y + (h >> 1) + Math.sin(a) * rd * 0.28), 2, 2); } g.globalAlpha = 0.3; disc(g, cx, y + (h >> 1), 10, '#14121f'); g.globalAlpha = 1; }
      else if (z.type === 'meteor') { g.globalAlpha = 1 - (z.t - z.tel) / z.life; disc(g, x + (w >> 1), y + h - 6, 22, '#fff6c0'); g.globalAlpha = 1; }
      else if (z.type === 'sweep') { for (let i = 0; i < h; i += 4) { g.fillStyle = i < 20 ? '#fff6c0' : (i < 44 ? '#ffd34e' : '#f06a20'); g.fillRect(x + (Math.random() < 0.4 ? 1 : 0), y + i, w - (Math.random() < 0.4 ? 3 : 0), 4); } }
    }
  }

""" + s[b:]

# ---------------- projectiles: statuses, onLand, flame look ----------------
rep("      if (p.type !== 'wave' && solid(tx, ty)) { p.dead = true; emit(p.x, p.y, 5, { col: p.col, sp0: 10, sp1: 40 }); continue; }",
    "      if (p.type !== 'wave' && solid(tx, ty)) { p.dead = true; emit(p.x, p.y, 5, { col: p.col, sp0: 10, sp1: 40 }); if (p.onLand) { const gy2 = groundYAt(p.x); addZone({ type: p.onLand, x: p.x - 16, y: gy2 - 6, w: 32, h: 6, tel: 0, life: 5, col: p.col }); } continue; }")
rep("      if (ov(P, hb)) { if (hurtPlayer(1, p.x)) { p.dead = true; } }",
    "      if (ov(P, hb)) { if (hurtPlayer(p.dmg || 1, p.x)) { p.dead = true; if (p.status) for (const k in p.status) P[k] = Math.max(P[k] || 0, p.status[k]); } }\n      if (p.fl && Math.random() < 0.5) emit(p.x, p.y, 1, { col: ['#ffd34e', '#f08a2b', '#e0453a'], sp0: 3, sp1: 14, grav: -10, l0: 0.15, l1: 0.35 });")
rep("      else if (p.big) { g.fillStyle = '#1b1626'; g.fillRect(px - 5, py - 5, 10, 10);", "      else if (p.fl) { disc(g, px, py, 4, '#e0453a'); disc(g, px, py, 3, '#f08a2b'); disc(g, px, py, 1, '#fff6c0'); }\n      else if (p.big) { g.fillStyle = '#1b1626'; g.fillRect(px - 5, py - 5, 10, 10);")

# ---------------- player statuses ----------------
rep("    const dir = (act.right ? 1 : 0) - (act.left ? 1 : 0);\n    const ice", "    const dir0 = (act.right ? 1 : 0) - (act.left ? 1 : 0), dir = P.rev > 0 ? -dir0 : dir0;\n    if (P.slow > 0) P.slow -= dt; if (P.rev > 0) P.rev -= dt;\n    if (Q.windT > 0) { Q.windT -= dt; moveX(P, Q.windDir * 46 * dt); if (Math.random() < 0.3) emit(P.x + rr(-30, 30), P.y + rr(-20, 14), 1, { col: '#fff', sp0: 5, sp1: 20, vx: Q.windDir * 90, grav: 0, l0: 0.2, l1: 0.4 }); }\n    const ice")
rep("      const target = dir * RUN;", "      const target = dir * RUN * (P.slow > 0 ? 0.5 : 1);")
# ---------------- state init/hooks ----------------
rep("trials: [], trialsDone: new Set(), nearPz: null,", "trials: [], trialsDone: new Set(), zones: [], tmpCells: [], windT: 0, windDir: 1, darkBoost: 0, darkBoostT: 0, nearPz: null,")
rep("    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;", "    Q.ents = []; Q.items = []; Q.projs = []; Q.traps = []; Q.fps = []; Q.fires = []; Q.pz = []; Q.boss = null; Q.nearNpc = null; Q.nearPz = null;\n    Q.zones = []; cleanupCells(); Q.windT = 0; Q.darkBoost = 0; Q.darkBoostT = 0;")
rep("updateFps(dt); updateFires(dt); updateProjs(dt); updateCreeps(dt);", "updateFps(dt); updateFires(dt); updateProjs(dt); updateZones(dt); updateCreeps(dt);")
rep("    if (Q.darkBoost > 0) Q.darkBoost -= dt * 0;", "    if (Q.darkBoostT > 0) { Q.darkBoostT -= dt; if (Q.darkBoostT <= 0) Q.darkBoost = 0; }")
rep("    drawTraps(camX, camY);\n    drawPuzzles(camX, camY);", "    drawTraps(camX, camY);\n    drawZones(camX, camY);\n    drawPuzzles(camX, camY);")

# ---------------- draw boss ----------------
a = s.index("  function drawBoss(camX, camY) {")
b = s.index("  function drawPlayer(camX, camY) {")
s = s[:a] + u"""  function drawBoss(camX, camY) {
    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;
    const c = b.cfg, x = Math.round(b.x + b.w / 2 - camX), bot = Math.round(b.y + b.h - camY);
    if (b.hide) {
      if (b.sk === 'ambush' && b.ph >= 1) {
        const mx = Math.round((b.ph === 1 ? b.mx : b.lockx) - camX), gy2 = Q.L.arena.gy * TS - camY, bl = Math.floor(Q.t * 14) % 2;
        g.globalAlpha = 0.5; g.fillStyle = bl ? '#ff3a2a' : '#ffd34e'; g.fillRect(mx - 20, gy2 - 2, 40, 2); g.fillRect(mx - 1, gy2 - 16, 2, 8); g.fillRect(mx - 1, gy2 - 6, 2, 2); g.globalAlpha = 1;
      }
      return;
    }
    if (c.eclipse) { g.globalAlpha = 0.25 + Math.sin(b.t * 3) * 0.1; disc(g, x, bot - 40, 40, '#7a4cff'); g.globalAlpha = 1; }
    const tele = b.st === 'tele' && Math.floor(b.t * 18) % 2 === 0;
    const bob = (b.st === 'wait' || c.eclipse) ? Math.round(Math.sin(b.t * 3) * (c.eclipse ? 3 : 1)) : 0;
    let sy = 1;
    if (b.st === 'tele' && (b.atkSk === 'jump' || b.atkSk === 'stomp' || b.atkSk === 'bounce3')) sy = 0.88;
    if (b.st === 'evade') { g.globalAlpha = 0.35; drawSpr(g, b.spr, x - b.ed * 14, bot, b.dir < 0, false, 1, 1); g.globalAlpha = 1; }
    if (b.invul > 0 && Math.floor(Q.t * 20) % 2 === 0) g.globalAlpha = 0.45;
    drawSpr(g, b.spr, x, bot + bob, b.dir < 0, b.flash > 0 || tele, 1, sy);
    g.globalAlpha = 1;
    if (b.shield > 0) { g.globalAlpha = 0.35 + Math.sin(Q.t * 12) * 0.12; disc(g, x, bot - (b.h >> 1), Math.round(b.h * 0.62), '#6ee7f2'); g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(x - 1, bot - b.h - 8, 3, 3); }
    if (b.st === 'stun') { for (let i = 0; i < 3; i++) { const a = Q.t * 6 + i * 2.1; g.fillStyle = '#ffd34e'; g.fillRect(Math.round(x + Math.cos(a) * 12), Math.round(bot - b.h - 4 + Math.sin(a) * 3), 3, 3); } }
  }
""" + s[b:]

# ---------------- HUD: statuses + armor icon on boss bar ----------------
rep("      txt(LN(b.cfg.name), VW / 2, y + 14, { al: 'center', size: 8 });", "      txt(LN(b.cfg.name) + (b.cfg.armor > 0 ? '   [' + Math.round(b.cfg.armor * 100) + '% ' + (save.lang === 'vi' ? 'giáp' : 'armor') + ']' : ''), VW / 2, y + 14, { al: 'center', size: 8 });")
rep("    // throwables\n", u"""    { let sy = 14; const chip = (t, c) => { txt(t, VW - 8, sy, { al: 'right', size: 7, col: c }); sy += 10; };
      if (P.slow > 0) chip((save.lang === 'vi' ? 'CHẬM ' : 'SLOWED ') + P.slow.toFixed(1), '#8ad8ff');
      if (P.rev > 0) chip((save.lang === 'vi' ? 'NGƯỢC PHÍM ' : 'REVERSED ') + P.rev.toFixed(1), '#c07bff');
      if (Q.windT > 0) chip(save.lang === 'vi' ? 'GIÓ BÃO' : 'BLIZZARD', '#fff'); }
    // throwables
""")
io.open(p, 'w', encoding='utf-8').write(s)
print('boss patch ok')
