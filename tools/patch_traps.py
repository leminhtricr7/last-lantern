import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()


def rep(old, new, cnt=1):
    global s
    assert old in s, old[:70]
    s = s.replace(old, new, cnt)


# ---------- logic: talk / shop / traps ----------
rep("  function updateItems(dt) {\n    const P = Q.P;\n", u"""  // ----- NPC dialogue & shop -----
  function startTalk(it) {
    const d = (DLG[Q.li] || {})[it.who] || [{ en: '...', vi: '...' }];
    Q.talk = { it, npc: NPCS[it.who], lines: d, i: 0, t: 0 }; Q.state = 'talk'; Snd.play('select'); Q.P.vx = 0;
  }
  function endTalk() {
    const n = Q.talk.npc, it = Q.talk.it; Q.talk = null;
    if (n.shop) { Q.state = 'shop'; Q.menu = 0; Q.shopMsg = ''; return; }
    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
    }
  }
  function updateTalk(dt) {
    const tk = Q.talk; tk.t += dt;
    const full = tk.lines[tk.i][save.lang].length;
    if (act.okP || act.talkP || act.atkP) {
      if (tk.t * 45 < full) tk.t = 999;
      else { tk.i++; tk.t = 0; Snd.play('select'); if (tk.i >= tk.lines.length) endTalk(); }
    }
    if (Q.talk && (act.backP || act.pauseP)) endTalk();
  }
  function updateShop() {
    if (act.upP) { Q.menu = (Q.menu + 2) % 3; Snd.play('select'); }
    if (act.downP) { Q.menu = (Q.menu + 1) % 3; Snd.play('select'); }
    if (act.backP || act.pauseP) { Q.state = 'play'; return; }
    if (act.okP) {
      if (Q.menu === 2) { Q.state = 'play'; return; }
      const price = Q.menu === 0 ? 15 : 25;
      if (save.coins < price) { Q.shopMsg = T('nomoney'); Snd.play('hurt'); return; }
      save.coins -= price; writeSave(); Snd.play('coin'); Q.shopMsg = T('bought');
      if (Q.menu === 0) Q.P.hp = maxHP(); else Q.P.shield = true;
    }
  }

  // ----- traps -----
  function updateTraps(dt) {
    const P = Q.P, cx = Q.cam.x + VW / 2;
    for (const t of Q.traps) {
      if (Math.abs(t.x - cx) > 300) continue;
      t.t += dt;
      const dx = (P.x + 4) - t.x;
      switch (t.type) {
        case 'spiketrap': {
          const ph = (t.t + t.off) % 3.4; t.warn = ph >= 1.8 && ph < 2.3; t.up = ph >= 2.3 && ph < 3.3;
          if (t.up && ov(P, { x: t.x - t.w * 8 + 1, y: t.y - 9, w: t.w * 16 - 2, h: 9 })) hurtPlayer(1, t.x);
          break;
        }
        case 'jets': {
          const ph = (t.t + t.off) % 3.6; t.warn = ph >= 1.8 && ph < 2.4; t.up = ph >= 2.4 && ph < 3.3;
          if (t.up) { if (Math.random() < 0.6) emit(t.x + rr(-3, 3), t.y - rr(8, 40), 1, { col: ['#ffd34e', '#f08a2b'], sp0: 3, sp1: 14, vy: -20, grav: -10, l0: 0.2, l1: 0.4 }); if (ov(P, { x: t.x - 5, y: t.y - 40, w: 10, h: 40 })) hurtPlayer(1, t.x); }
          break;
        }
        case 'saw': {
          t.ph += dt * (46 + Q.li * 3) / Math.max(16, t.len * 16) * Math.PI;
          t.sx = t.x0 + (t.len * 16 - 16) * (0.5 - 0.5 * Math.cos(t.ph));
          if (ov(P, { x: t.sx - 6, y: t.y - 15, w: 12, h: 13 })) hurtPlayer(1, t.sx);
          break;
        }
        case 'turret': {
          t.cd -= dt;
          t.warn = t.cd < 0.35 && t.cd > 0 && Math.abs(dx) < 220;
          if (t.cd <= 0) { t.cd = 2.4; if (Math.abs(dx) < 220 && (dx > 0) === (t.dir > 0)) firePr(t.x + t.dir * 6, t.y - 9, t.dir * 115, 0, { col: '#ffd34e' }); }
          break;
        }
        case 'rockfall': {
          if (t.st === 'idle') { if (Math.abs(dx) < 70) { t.st = 'warn'; t.cd = 0.8; } }
          else if (t.st === 'warn') { t.cd -= dt; if (t.cd <= 0) { t.st = 'cool'; t.cd = 3.2; Q.projs.push({ x: t.x, y: Q.cam.y - 12, vx: 0, vy: 50, life: 3, grav: 400, col: Q.B.id === 'volcano' ? '#ff9a2a' : (Q.B.id === 'frost' ? '#bfeaff' : '#b8bfd0'), type: 'fall', boss: false, big: true }); } }
          else { t.cd -= dt; if (t.cd <= 0) t.st = 'idle'; }
          break;
        }
      }
    }
  }
  function turretSpr(style) {
    const k = 'turret' + (style || 'wood');
    if (!_cache[k]) {
      const C = { wood: ['n', 'N', 'y'], sand: ['E', 'S', 'r'], dark: ['d', 'D', 'm'] }[style || 'wood'];
      _cache[k] = paint(14, 18, P => { P.rect(1, 2, 12, 16, C[0]); P.rect(0, 0, 14, 3, C[1]); P.rect(1, 16, 12, 2, C[1]); P.rect(3, 6, 3, 3, 'k'); P.rect(8, 6, 3, 3, 'k'); P.px(4, 7, C[2]); P.px(9, 7, C[2]); P.rect(4, 12, 6, 3, 'k'); P.px(5, 12, 'w'); P.px(8, 12, 'w'); });
    }
    return _cache[k];
  }
  function drawTraps(camX, camY) {
    const B = Q.B, ts = Q.ts;
    for (const t of Q.traps) {
      const x = Math.round(t.x - camX), y = Math.round(t.y - camY);
      if (x < -40 || x > VW + 40 + (t.type === 'saw' ? t.len * 16 : 0)) continue;
      switch (t.type) {
        case 'spiketrap': {
          const x0 = Math.round(t.x - t.w * 8 - camX);
          g.fillStyle = '#1b1626'; g.fillRect(x0, y - 2, t.w * 16, 2);
          g.fillStyle = B.plat[1]; g.fillRect(x0 + 1, y - 2, t.w * 16 - 2, 1);
          for (let i = 0; i < t.w; i++) {
            if (t.up) g.drawImage(ts.spike, x0 + i * 16, y - 16);
            else if (t.warn && Math.floor(t.t * 20) % 2 === 0) g.drawImage(ts.spike, 0, 13, 16, 3, x0 + i * 16, y - 3, 16, 3);
          }
          break;
        }
        case 'jets': {
          g.fillStyle = '#1b1626'; g.fillRect(x - 7, y - 3, 14, 3); g.fillStyle = t.up || t.warn ? '#f08a2b' : '#4a3f44'; g.fillRect(x - 5, y - 3, 10, 1);
          if (t.warn) { g.fillStyle = Math.floor(t.t * 16) % 2 ? '#ffd34e' : '#f08a2b'; g.fillRect(x - 2, y - 7, 4, 4); }
          if (t.up) { for (let i = 0; i < 10; i++) { const w = 10 - Math.floor(i / 2) * 2 + (Math.random() < 0.4 ? 2 : 0); g.fillStyle = i < 3 ? '#fff6c0' : (i < 6 ? '#ffd34e' : '#f08a2b'); g.fillRect(x - Math.floor(w / 2), y - 4 - i * 4, w, 4); } }
          break;
        }
        case 'saw': {
          const rx = Math.round(t.x0 - camX) + 8, ry = y - 8;
          g.fillStyle = '#434d6e'; g.fillRect(rx, ry, t.len * 16 - 16, 1); g.fillStyle = '#1b1626'; g.fillRect(rx - 1, ry - 2, 3, 5); g.fillRect(rx + t.len * 16 - 17, ry - 2, 3, 5);
          const sx = Math.round((t.sx === undefined ? t.x0 : t.sx) - camX) + 8;
          disc(g, sx, ry, 8, '#1b1626'); disc(g, sx, ry, 7, '#b8bfd0'); disc(g, sx, ry, 4, '#6a7090');
          for (let k = 0; k < 8; k++) { const a = t.ph * 10 + k * Math.PI / 4; g.fillStyle = k % 2 ? '#fff' : '#8d9bbd'; g.fillRect(Math.round(sx + Math.cos(a) * 7), Math.round(ry + Math.sin(a) * 7), 2, 2); }
          g.fillStyle = '#1b1626'; g.fillRect(sx - 1, ry - 1, 3, 3);
          break;
        }
        case 'turret': {
          const sp = turretSpr(B.trapStyle);
          drawSpr(g, sp, x, y, t.dir > 0, t.warn && Math.floor(t.t * 24) % 2 === 0);
          break;
        }
        case 'rockfall': {
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 3, y - 1, 6, 1);
          if (t.st === 'warn') { const bl = Math.floor(t.t * 14) % 2; g.fillStyle = bl ? '#e0453a' : '#ffd34e'; g.fillRect(x - 1, y - 12, 2, 6); g.fillRect(x - 1, y - 4, 2, 2); g.fillStyle = 'rgba(224,69,58,.5)'; g.fillRect(x - 6, y - 1, 12, 1); }
          break;
        }
      }
    }
  }

  function updateItems(dt) {
    const P = Q.P;
    Q.nearNpc = null;
""")

rep("      } else if (it.kind === 'cp') {\n        if (!it.lit",
    "      } else if (it.kind === 'npc') {\n        if (Math.abs(it.x - pc.x) < 26 && Math.abs(it.y - pc.y) < 30) Q.nearNpc = it;\n      } else if (it.kind === 'cp') {\n        if (!it.lit")

# updatePlay branches
rep("    if (st === 'dead') {\n      updateParticles(dt);",
    "    if (st === 'talk') { updateTalk(dt); updateParticles(dt); return; }\n    if (st === 'shop') { updateShop(); return; }\n    if (st === 'dead') {\n      updateParticles(dt);")
rep("    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }",
    "    if (act.pauseP && st === 'play') { Q.state = 'pause'; Q.menu = 0; return; }\n    if (st === 'play' && Q.nearNpc && act.talkP) { startTalk(Q.nearNpc); return; }")
rep("updateEnemies(dt); updateBoss(dt); updateBossDeath(dt); updateProjs(dt);", "updateEnemies(dt); updateBoss(dt); updateBossDeath(dt); updateTraps(dt); updateProjs(dt);")

# projectile big rocks
rep("      const hb = p.type === 'wave' ? { x: p.x - 6, y: p.y - 6, w: 12, h: 12 } : { x: p.x - 2, y: p.y - 2, w: 4, h: 4 };",
    "      const hb = p.type === 'wave' ? { x: p.x - 6, y: p.y - 6, w: 12, h: 12 } : (p.big ? { x: p.x - 4, y: p.y - 4, w: 8, h: 8 } : { x: p.x - 2, y: p.y - 2, w: 4, h: 4 });")
rep("      else { g.fillStyle = p.col; g.fillRect(px - 3, py - 2, 6, 4);",
    "      else if (p.big) { g.fillStyle = '#1b1626'; g.fillRect(px - 5, py - 5, 10, 10); g.fillStyle = p.col; g.fillRect(px - 4, py - 4, 8, 8); g.fillStyle = '#fff'; g.fillRect(px - 3, py - 3, 3, 2); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(px, py, 4, 4); }\n      else { g.fillStyle = p.col; g.fillRect(px - 3, py - 2, 6, 4);")

# draw: traps before enemies, npc items
rep("    drawItems(camX, camY);\n    for (const e of Q.ents)", "    drawItems(camX, camY);\n    drawTraps(camX, camY);\n    for (const e of Q.ents)")
rep("      } else if (it.kind === 'cp') {\n        g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 22, 4, 22);",
    """      } else if (it.kind === 'npc') {
        const n = NPCS[it.who], sp = getSprite(n.spr), bob = Math.round(Math.sin(it.ph * 2) * 0.5 + 0.5);
        drawSpr(g, sp, x, y - bob, Q.P.x + 4 < it.x);
        const by = y - sp.h - 4 - bob;
        if (Q.nearNpc === it) { txt(T('talk'), x, by - 4, { al: 'center', size: 6, col: '#ffd34e' }); }
        else { g.fillStyle = '#1b1626'; g.fillRect(x - 4, by - 5, 9, 7); g.fillStyle = '#fff'; g.fillRect(x - 3, by - 4, 7, 5); g.fillStyle = '#1b1626'; g.fillRect(x - 2, by - 2, 1, 1); g.fillRect(x, by - 2, 1, 1); g.fillRect(x + 2, by - 2, 1, 1); }
      } else if (it.kind === 'cp') {
        g.fillStyle = '#1b1626'; g.fillRect(x - 2, y - 22, 4, 22);""")

# lighting
rep("else if (it.kind === 'frag') addL(it.x, it.y, 80, 1);", "else if (it.kind === 'frag') addL(it.x, it.y, 80, 1); else if (it.kind === 'npc') addL(it.x, it.y - 10, 36, 0.8);")

# overlays: dialogue + shop
rep("    } else if (st === 'dead') {\n      const a = Math.min(1, Q.stateT / 0.8);",
    u"""    } else if (st === 'talk') {
      const tk = Q.talk, sp = getSprite(tk.npc.spr);
      g.fillStyle = 'rgba(8,6,20,.93)'; g.fillRect(8, 148, VW - 16, 62);
      g.fillStyle = '#ffd34e'; g.fillRect(8, 148, VW - 16, 1); g.fillRect(8, 209, VW - 16, 1); g.fillRect(8, 148, 1, 62); g.fillRect(VW - 9, 148, 1, 62);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(14, 154, 44, 50);
      drawSpr(g, sp, 36, 204, false, false, 2, 2);
      txt(LN(tk.npc.name), 66, 158, { size: 8, col: '#ffd34e', bold: true });
      const line = tk.lines[tk.i][save.lang], n = Math.floor(tk.t * 45);
      wrapText(line.substr(0, n), 62).forEach((l, i) => txt(l, 66, 173 + i * 11, { size: 7 }));
      if (n >= line.length) txt('>', VW - 18, 200, { size: 8, col: '#ffd34e', alpha: 0.5 + 0.5 * Math.sin(Q.stateT * 8 + Q.t * 8) });
    } else if (st === 'shop') {
      g.fillStyle = 'rgba(8,6,20,.94)'; g.fillRect(40, 60, VW - 80, 100);
      g.fillStyle = '#ffd34e'; g.fillRect(40, 60, VW - 80, 1); g.fillRect(40, 159, VW - 80, 1); g.fillRect(40, 60, 1, 100); g.fillRect(VW - 41, 60, 1, 100);
      txt(LN(NPCS.gob.name), VW / 2, 72, { al: 'center', size: 8, col: '#ffd34e', bold: true });
      txt(T('wallet') + ': ' + save.coins, VW / 2, 86, { al: 'center', size: 7, col: '#cfd6e6' });
      ['shop1', 'shop2', 'shop3'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 106 + i * 14, { al: 'center', size: 7, col: Q.menu === i ? '#ffd34e' : '#e8eaf5' }));
      if (Q.shopMsg) txt(Q.shopMsg, VW / 2, 150, { al: 'center', size: 6, col: '#a4e86b' });
      if (Q.P.shield) txt('Shield ON', 50, 72, { size: 6, col: '#6ee7f2' });
    } else if (st === 'dead') {
      const a = Math.min(1, Q.stateT / 0.8);""")

# HUD: shield indicator
rep("    txt('x' + Q.coinsRun, 16, 23, { size: 7 });", "    txt('x' + Q.coinsRun + '   (' + save.coins + ')', 16, 23, { size: 7 });\n    if (P.shield) { g.fillStyle = '#6ee7f2'; g.fillRect(12 + 3 * 11 + 6, 38, 6, 7); g.fillStyle = '#fff'; g.fillRect(12 + 3 * 11 + 8, 40, 2, 3); }")

io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
