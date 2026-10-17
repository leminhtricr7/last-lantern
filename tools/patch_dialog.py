import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, 'MISSING: ' + a[:90]
    return s.replace(a, b, 1)

# ---------------- bigger final arena with platforms on several floors ----------------
def levels(s):
    s = rep(s, "const H = 15, W = B.len + 70;", "const H = 15, W = B.len + 100;")
    a = s.index("  const ax0 = x;\n  L.arena = { x0: ax0, x1: ax0 + 30, gy: 10 };"); b = s.index("  L.endX = (ax0 + 30) * TS;") + len("  L.endX = (ax0 + 30) * TS;")
    s = s[:a] + """  const ax0 = x, AW = li === 6 ? 48 : 30;   // the final arena is much wider, with platforms on three floors
  L.arena = { x0: ax0, x1: ax0 + AW, gy: 10 };
  for (let i = 0; i < AW; i++) col(ax0 + i, 10);
  for (let i = 0; i < AW; i++) solidCol(ax0 + i, 10);
  for (let y = 0; y < H; y++) { set(ax0 + AW, y, '#'); set(ax0 + AW + 1, y, '#'); }
  if (li === 6) {
    [[7, 5, 9], [7, 17, 21], [7, 29, 33], [7, 40, 44], [5, 11, 15], [5, 23, 27], [5, 34, 38], [3, 19, 23], [3, 30, 33]].forEach(p => { for (let xx = p[1]; xx <= p[2]; xx++) set(ax0 + xx, p[0], '='); });
  } else for (let i = 0; i < 4; i++) { set(ax0 + 7 + i, 7, '='); set(ax0 + 19 + i, 7, '='); }
  L.checkpoints.push({ x: (ax0 - 4) * TS, y: 10 * TS, id: L.id++ });
  L.spawns.push({ id: L.id++, type: 'boss', x: (ax0 + AW - 7) * TS, y: 10 * TS });
  L.endX = (ax0 + AW) * TS;""" + s[b:]
    return s
edit('src/levels.js', levels)

DIALOG = """    } else if (st === 'talk') {
      const tk = Q.talk, ln0 = tk.lines[tk.i] || {}, who = ln0.w || tk.it.who, cur = (ln0.w && NPCS[ln0.w]) || tk.npc, sp = cur.spr ? npcSpr(cur.spr) : null;
      const col = who.indexOf('boss') === 0 ? '#ff7a7a' : (SPEAKER_COL[who] || '#ffd34e');
      if (tk.cine) { const k = Math.min(1, Q.stateT * 3); g.fillStyle = '#000'; g.fillRect(0, 0, VW, Math.round(20 * k)); g.fillRect(0, VH - Math.round(5 * k), VW, 5); }
      const X = 6, Y = 145, W = VW - 12, H = 64, box = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); };
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(X + 3, Y + 3, W, H);
      { const gr = g.createLinearGradient(0, Y, 0, Y + H); gr.addColorStop(0, 'rgba(30,24,54,.97)'); gr.addColorStop(1, 'rgba(10,8,22,.97)'); g.fillStyle = gr; g.fillRect(X, Y, W, H); }
      g.fillStyle = hexA(col, 0.08); g.fillRect(X + 2, Y + 2, W - 4, 10);
      box(X, Y, W, H, '#c89a1c'); box(X + 2, Y + 2, W - 4, H - 4, hexA(col, 0.55));
      for (const [cx, cy] of [[X, Y], [X + W - 1, Y], [X, Y + H - 1], [X + W - 1, Y + H - 1]]) { g.fillStyle = '#ffd34e'; g.fillRect(cx - 1, cy, 3, 1); g.fillRect(cx, cy - 1, 1, 3); }
      let tx = X + 12;
      if (sp) {
        const PX = X + 6, PY = Y + 6, PW = 48, PH = H - 12;
        g.fillStyle = '#120e22'; g.fillRect(PX, PY, PW, PH);
        { const gr = g.createRadialGradient(PX + PW / 2, PY + PH * 0.6, 2, PX + PW / 2, PY + PH * 0.6, 34); gr.addColorStop(0, hexA(col, 0.35)); gr.addColorStop(1, hexA(col, 0)); g.fillStyle = gr; g.fillRect(PX, PY, PW, PH); }
        g.save(); g.beginPath(); g.rect(PX, PY, PW, PH); g.clip();
        const sc = Math.min(2.5, (PH - 4) / sp.h, (PW - 4) / sp.w); drawSpr(g, sp, PX + PW / 2, PY + PH - 1, false, false, sc, sc);
        g.restore();
        box(PX - 1, PY - 1, PW + 2, PH + 2, col); box(PX - 2, PY - 2, PW + 4, PH + 4, '#5a4210');
        tx = PX + PW + 10;
      }
      { const name = LN(cur.name), nw = Math.round(name.length * 4.4) + 14; g.fillStyle = '#120e22'; g.fillRect(tx - 6, Y - 7, nw, 12); box(tx - 6, Y - 7, nw, 12, col); txt(name, tx, Y - 1, { size: 7, col, bold: true }); }
      const line = ln0[save.lang] || '', n = Math.floor(tk.t * 45);
      wrapText(line.substr(0, n), sp ? 56 : 70).forEach((l, i) => txt(l, tx, Y + 15 + i * 11, { size: 7, col: who === 'narr' ? '#d8dcf0' : '#fff' }));
      if (n >= line.length) { const bob = Math.round(Math.sin(Q.stateT * 8 + Q.t * 8) * 1.5); g.fillStyle = col; g.beginPath(); g.moveTo(X + W - 16, Y + H - 12 + bob); g.lineTo(X + W - 8, Y + H - 12 + bob); g.lineTo(X + W - 12, Y + H - 7 + bob); g.fill(); }
      if (tk.lines.length > 1) txt((tk.i + 1) + '/' + tk.lines.length, X + W - 22, Y + 6, { size: 5, col: '#8892aa', al: 'right' });
    } else if (st === 'shop') {"""

def game(s):
    a = s.index("    } else if (st === 'talk') {\n      const tk = Q.talk, cur ="); b = s.index("    } else if (st === 'shop') {", a) + len("    } else if (st === 'shop') {")
    s = s[:a] + DIALOG + s[b:]
    s = rep(s, "  const bpc = () =>", "  const SPEAKER_COL = { quoc: '#ff5a4a', sy: '#7ed957', ember: '#ff9a4a', lyra: '#6ee7f2', shorty: '#ffd34e', quan: '#a98bff', hoang: '#e0453a', duong: '#c0304a', santree: '#5fcf5a', narr: '#a8b0d0', dragon: '#ff8a2a', lila: '#a4e86b', bram: '#cfd6e6', angel: '#fff6c0', wizard: '#a98bff', fairy: '#ff9fd0', gob: '#9be564', smith: '#ff9a4a' };\n  const bpc = () =>")
    s = rep(s, "    drawHUD();\n", "    if (Q.state !== 'talk') drawHUD();\n")
    # allies + drops
    a = s.index("  function spawnAllies() {"); b = s.index("  // ===================== throwables =====================")
    s = s[:a] + io.open('tools/ally2_block.txt', encoding='utf-8').read() + s[b:]
    s = rep(s, "    updateAllies(dt);\n", "    updateAllies(dt); updateBossDrops(dt);\n    if (G.powerT > 0) G.powerT -= dt;\n")
    s = rep(s, "      for (const a of Q.G.allies || []) { a.x = P.x - 10; a.y = P.y + P.h; }", "      for (const a of Q.G.allies || []) { a.x = P.x - 12 - a.i * 6; a.y = P.y; a.vx = a.vy = 0; }")
    s = rep(s, "  const baseDmg = () => 1 + Math.floor(totalShards() / 7)", "  const baseDmg = () => (Q && Q.G && Q.G.powerT > 0 ? 2 : 0) + 1 + Math.floor(totalShards() / 7)")
    # buff pickups
    s = rep(s, "      } else if (it.kind === 'key') {", """      } else if (it.kind === 'buff') {
        if (d < 12) { it.dead = true; Snd.play('relic'); emit(it.x, it.y, 16, { col: it.what === 'shield' ? ['#6ee7f2', '#fff'] : ['#ff5a3a', '#ffd34e'], sp0: 20, sp1: 80 });
          if (it.what === 'shield') { P.shield = true; Q.msg = save.lang === 'vi' ? 'Nhận khiên bảo vệ!' : 'Shield!'; } else { Q.G.powerT = 10; Q.msg = save.lang === 'vi' ? 'Sức mạnh x2 trong 10 giây!' : 'Power up for 10 seconds!'; } Q.msgT = 2.5; }
      } else if (it.kind === 'key') {""")
    s = rep(s, "      } else if (it.kind === 'shard') {\n        const s = getSprite('shard');", """      } else if (it.kind === 'buff') {
        const c = it.what === 'shield' ? '#6ee7f2' : '#ff5a3a', by = y + Math.round(Math.sin(it.ph * 3) * 1.5);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; disc(g, x, by, 9, c); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
        disc(g, x, by, 5, '#14121f'); disc(g, x, by, 4, c);
        g.fillStyle = '#fff'; if (it.what === 'shield') { g.fillRect(x - 2, by - 2, 5, 3); g.fillRect(x - 1, by + 1, 3, 1); g.fillRect(x, by + 2, 1, 1); } else { g.fillRect(x, by - 3, 1, 6); g.fillRect(x - 2, by + 1, 5, 1); }
      } else if (it.kind === 'shard') {
        const s = getSprite('shard');""")
    s = rep(s, "      if (G.dr) chip((save.lang === 'vi' ? 'RỒNG ' : 'DRAGON ') + G.dr.life.toFixed(1), '#ff9a2a'); }", "      if (G.dr) chip((save.lang === 'vi' ? 'RỒNG ' : 'DRAGON ') + G.dr.life.toFixed(1), '#ff9a2a');\n      if (G.powerT > 0) chip((save.lang === 'vi' ? 'SỨC MẠNH ' : 'POWER ') + G.powerT.toFixed(1), '#ff5a3a'); }")
    return s
edit('src/game.js', game)
print('ok')
