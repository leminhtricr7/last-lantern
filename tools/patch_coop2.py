import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:90]
    return s.replace(a, b, n)

def levels(s):
    a = s.index("  const ax0 = x, AW = li === 6 ? 48 : 30;")
    b = s.index("  } else for (let i = 0; i < 4; i++) { set(ax0 + 7 + i, 7, '='); set(ax0 + 19 + i, 7, '='); }") + len("  } else for (let i = 0; i < 4; i++) { set(ax0 + 7 + i, 7, '='); set(ax0 + 19 + i, 7, '='); }")
    return s[:a] + """  const ax0 = x, AW = li === 6 ? 48 : 44;   // every boss arena is wide, with platforms on three floors to jump up and dodge
  L.arena = { x0: ax0, x1: ax0 + AW, gy: 10 };
  for (let i = 0; i < AW; i++) col(ax0 + i, 10);
  for (let i = 0; i < AW; i++) solidCol(ax0 + i, 10);
  for (let y = 0; y < H; y++) { set(ax0 + AW, y, '#'); set(ax0 + AW + 1, y, '#'); }
  const PLATS = li === 6 ? [[7, 5, 9], [7, 17, 21], [7, 29, 33], [7, 40, 44], [5, 11, 15], [5, 23, 27], [5, 34, 38], [3, 19, 23], [3, 30, 33]]
    : li % 2 ? [[7, 5, 9], [7, 16, 20], [7, 27, 31], [7, 37, 40], [5, 10, 14], [5, 21, 25], [5, 32, 35], [3, 15, 18], [3, 26, 29]]
    : [[7, 6, 10], [7, 18, 22], [7, 30, 34], [5, 12, 16], [5, 24, 28], [5, 36, 39], [3, 8, 11], [3, 19, 23], [3, 31, 34]];
  PLATS.forEach(p => { for (let xx = p[1]; xx <= p[2]; xx++) set(ax0 + xx, p[0], '='); });""" + s[b:]
edit('src/levels.js', levels)

def game(s):
    # --- everybody enters the boss fight together ---
    s = rep(s, "    Q.arenaSealed = true;\n    Q.state = 'bossintro'; Q.stateT = 0;\n", "    Q.arenaSealed = true;\n    if (coop) coopGather();\n    Q.state = 'bossintro'; Q.stateT = 0;\n")
    s = rep(s, "    b.st = 'intro'; b.timer = 0; Q.boss = b; Q.arenaSealed = true; Q.bossDead = false;\n", "    b.st = 'intro'; b.timer = 0; Q.boss = b; Q.arenaSealed = true; Q.bossDead = false; if (coop) coopGather();\n")
    s = rep(s, "P.x = (ar.x0 + 4) * TS; P.y = (ar.gy - 1) * TS - P.h; P.vx = P.vy = 0; P.inv = Math.max(P.inv, 1.5);", "P.x = (ar.x0 + 4) * TS; P.y = (ar.gy - 1) * TS - P.h; P.vx = P.vy = 0; P.inv = Math.max(P.inv, 1.5); if (coop) coopGather(true);")
    s = rep(s, "  function coopRespawn() {", """  function coopGather(all) {
    const ar = Q.L.arena, L0 = Q.P; let k = 0;
    for (const p of Q.players || []) {
      if (p === L0) continue; k++;
      if (!all && p.x >= (ar.x0 + 2) * TS && p.x <= ar.x1 * TS) continue;
      emit(p.x + 4, p.y + 7, 12, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 70 });
      p.x = Math.max((ar.x0 + 2) * TS, L0.x - 12 * k); p.y = L0.y; p.vx = p.vy = 0; p.inv = Math.max(p.inv || 0, 1); p.safe = { x: p.x, y: p.y }; if (p.down) { p.down = false; p.hp = Math.max(1, Math.ceil(p.mhp / 2)); }
      emit(p.x + 4, p.y + 7, 12, { col: [PCOL[p.slot], '#fff'], sp0: 20, sp1: 70 });
    }
  }
  function coopRespawn() {""")
    # --- boss target: chase the weakest hero for a while, then switch to someone else ---
    a = s.index("  function bossTgt() {"); b = s.index("  function setHero(p, id) {")
    s = s[:a] + """  function bossTgt(dt) {
    const al = allPl(); if (al.length <= 1) { Q.bt = al[0] || Q.P; Q.btSlot = Q.bt.slot || 0; return Q.bt; }
    Q.btT = (Q.btT || 0) - (dt || 0.01);
    if (Q.btT <= 0 || al.indexOf(Q.bt) < 0) {
      const byHp = al.slice().sort((x, y) => x.hp / (x.mhp || 1) - y.hp / (y.mhp || 1)), prev = Q.bt;
      Q.btWeak = !Q.btWeak;
      if (Q.btWeak) { Q.bt = byHp[0] === prev && byHp.length > 1 && Math.random() < 0.5 ? byHp[1] : byHp[0]; Q.btT = rr(4, 5.5); }   // hunt the weakest...
      else { const rest = byHp.filter(p => p !== prev); Q.bt = rest[Math.floor(Math.random() * rest.length)] || byHp[0]; Q.btT = rr(5, 7); }   // ...then give them a break
      if (Q.bt !== prev && Q.boss && Q.arenaSealed) pop(Q.bt.x + 4, Q.bt.y - 18, save.lang === 'vi' ? 'BOSS ĐANG DÍ P' + (Q.bt.slot + 1) + '!' : 'BOSS HUNTS P' + (Q.bt.slot + 1) + '!', '#ff5a4a');
    }
    Q.btSlot = Q.bt.slot;
    return Q.bt;
  }
""" + s[b:]
    s = rep(s, "asP(coop ? bossTgt() : Q.P, () => updateBoss(dt));", "asP(coop ? bossTgt(dt) : Q.P, () => updateBoss(dt));")
    s = rep(s, "const tg = coop ? bossTgt() : Q.P;", "const tg = coop ? bossTgt(dt) : Q.P;")
    s = rep(s, "'shardFlash', 'coinsRun', 'dj', 'dashAb'];", "'shardFlash', 'coinsRun', 'dj', 'dashAb', 'btSlot'];")
    s = rep(s, "  function drawCoopTag(p, x, bot) {\n    if (!coop) return;\n", "  function drawCoopTag(p, x, bot) {\n    if (!coop) return;\n    if (Q.boss && Q.arenaSealed && !Q.bossDead && Q.btSlot === p.slot && (Q.players || []).length > 1) { const k = Math.round(Math.sin(Q.t * 8) * 1.5); g.fillStyle = '#ff3a3a'; g.fillRect(x - 1, bot - 40 + k, 3, 6); g.fillRect(x - 1, bot - 32 + k, 3, 2); }\n")
    # --- boss leaps toward heroes standing on platforms ---
    s = rep(s, "        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * c.sp * b.fury * dt); b.moveT = 0.12; }",
               "        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * c.sp * 1.15 * b.fury * dt); b.moveT = 0.12; }\n        if (b.onGround && P.y + P.h < b.y + b.h - 30 && Math.abs(dxp) < b.w / 2 + 70 && Math.random() < dt * 1.2) { b.vy = -380; b.onGround = false; Snd.play('whoosh'); emit(cxm, b.y + b.h, 8, { col: '#cfd6e6', sp0: 20, sp1: 60 }); }")
    # --- dialogue: each player reads at their own pace, the game waits for everyone ---
    s = rep(s, "  function updateTalk(dt) {\n    const tk = Q.talk; tk.t += dt;", "  function updateTalk(dt) {\n    const tk = Q.talk;\n    if (coop && tk.hostDone) { if (coopTalkDone()) endTalk(); return; }\n    tk.t += dt;")
    s = rep(s, "      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) endTalk(); }\n    }\n    if (Q.talk && (act.backP || act.pauseP)) endTalk();",
               "      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) coopTalkEnd(tk); }\n    }\n    if (Q.talk && (act.backP || act.pauseP)) coopTalkEnd(tk);")
    s = rep(s, "  function coopRespawn() {", """  function coopTalkDone() { const tk = Q.talk; if (!tk) return true; const done = tk.doneList || []; return (Q.players || []).every(p => p === Q.me || done.indexOf(p.slot) >= 0); }
  function coopTalkEnd(tk) {
    if (!coop) { endTalk(); return; }
    tk.i = tk.lines.length - 1; tk.t = 999; tk.hostDone = true; tk.doneList = tk.doneList || []; if (tk.doneList.indexOf(0) < 0) tk.doneList.push(0);
    if (coopTalkDone()) endTalk();
  }
  function drawTalkWait() {
    const tk = Q.talk; if (!tk) return;
    const me = coop.me, done = tk.doneList || [], iDone = coop.role === 'host' ? tk.hostDone : coop.tkDone;
    const wait = (Q.players || []).filter(p => p.slot !== me && done.indexOf(p.slot) < 0).map(p => 'P' + (p.slot + 1));
    const ready = (Q.players || []).filter(p => done.indexOf(p.slot) >= 0).map(p => 'P' + (p.slot + 1));
    if (iDone && wait.length) { g.fillStyle = 'rgba(8,6,20,.85)'; g.fillRect(VW / 2 - 110, 124, 220, 14); txt(cvs('Waiting for ', 'Đang chờ ') + wait.join(', ') + cvs(' to finish reading...', ' đọc xong...'), VW / 2, 134, { al: 'center', size: 7, col: '#ffd34e' }); }
    else if (ready.length) txt(cvs('Ready: ', 'Đã xong: ') + ready.join(', '), VW - 10, 140, { al: 'right', size: 5, col: '#a4ffc0' });
  }
  function coopRespawn() {""")
    s = rep(s, "      if (tk.lines.length > 1) txt((tk.i + 1) + '/' + tk.lines.length, X + W - 22, Y + 6, { size: 5, col: '#8892aa', al: 'right' });\n",
               "      if (tk.lines.length > 1) txt((tk.i + 1) + '/' + tk.lines.length, X + W - 22, Y + 6, { size: 5, col: '#8892aa', al: 'right' });\n      if (coop) drawTalkWait();\n")
    # host: give each talk an id; guests report when they finished it
    s = rep(s, "    const G = Q.G, s = { t: 's', q: packVals(Q, QVALS, 'q'),", "    if (Q.talk && !Q.talk.id) { Q.talk.id = ++coop.tkN; Q.talk.doneList = Q.talk.doneList || []; }\n    const G = Q.G, s = { t: 's', q: packVals(Q, QVALS, 'q'),")
    s = rep(s, "nid: 0, ev: [], grid: [],", "nid: 0, tkN: 0, tkId: null, tkI: 0, tkT: 0, tkDone: false, ev: [], grid: [],")
    s = rep(s, "      } else if (d.t === 'hero' && p) {", "      } else if (d.t === 'tkdone' && p && Q && Q.talk && Q.talk.id === d.id) { const dl = Q.talk.doneList || (Q.talk.doneList = []); if (dl.indexOf(p.slot) < 0) dl.push(p.slot); }\n      else if (d.t === 'hero' && p) {")
    # guest: own line index and typing, applied over the host's
    s = rep(s, "    for (const k in s.q) { const v = des(s.q[k]); if (v !== undefined) Q[k] = v; }\n",
               "    for (const k in s.q) { const v = des(s.q[k]); if (v !== undefined) Q[k] = v; }\n    if (Q.talk && Q.state === 'talk') { if (Q.talk.id !== coop.tkId) { coop.tkId = Q.talk.id; coop.tkI = 0; coop.tkT = 0; coop.tkDone = false; } Q.talk.i = Math.min(coop.tkI, Q.talk.lines.length - 1); Q.talk.t = coop.tkT; } else coop.tkId = null;\n")
    s = rep(s, "    if (Q.msgT > 0) Q.msgT -= dt;\n    if (Q.shake > 0) Q.shake -= dt;\n    if (Q.P && Q.P.emoT > 0) Q.P.emoT -= dt;",
               """    if (Q.msgT > 0) Q.msgT -= dt;
    if (Q.shake > 0) Q.shake -= dt;
    if (Q.P && Q.P.emoT > 0) Q.P.emoT -= dt;
    if (Q.state === 'talk' && Q.talk && Q.talk.lines && coop.tkId === Q.talk.id && Q.talk.id) {
      const tk = Q.talk; coop.tkT += dt;
      if ((act.okP || act.talkP || act.atkP) && !coop.tkDone) {
        const full = (tk.lines[coop.tkI][save.lang] || '').length;
        if (coop.tkT * 45 < full) coop.tkT = 999;
        else if (coop.tkI < tk.lines.length - 1) { coop.tkI++; coop.tkT = 0; coop.play0 && coop.play0('select'); }
        else { coop.tkDone = true; coop.tkT = 999; NET.send({ t: 'tkdone', id: tk.id }); coop.play0 && coop.play0('ok'); }
      }
      if ((act.backP) && !coop.tkDone) { coop.tkDone = true; coop.tkI = tk.lines.length - 1; coop.tkT = 999; NET.send({ t: 'tkdone', id: tk.id }); }
      tk.i = coop.tkI; tk.t = coop.tkT;
    }""")
    s = rep(s, "    if (act.pauseP) coopLeave(cvs('You left the room.', 'Bạn đã rời phòng.'));", "    if (act.pauseP && Q.state !== 'talk') coopLeave(cvs('You left the room.', 'Bạn đã rời phòng.'));")
    return s
edit('src/game.js', game)
print('ok')
