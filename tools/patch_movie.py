import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, 'MISSING: ' + a[:90]
    return s.replace(a, b, 1)

def art(s):
    return rep(s, "function npcSpr(name) {\n  if (!NPC_PAINT[name]) return getSprite(name);", "function npcSpr(name) {\n  if (name && name.indexOf('boss:') === 0) return bossSprite(+name.slice(5));\n  if (!NPC_PAINT[name]) return getSprite(name);")
edit('src/art.js', art)

SCENES = """  // the worlds Quoc drags you into (one per form)
  function drawFormScene(fi) {
    const t = Q.t, grad = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); };
    if (fi === 1) { // shadow void: drifting smoke and blinking eyes
      grad('#05040a', '#1a0f2e');
      for (let i = 0; i < 14; i++) { const x = (i * 61 + t * (6 + i % 4)) % (VW + 60) - 30, y = 30 + (i * 37) % 140; g.globalAlpha = 0.14; disc(g, Math.round(x), y, 18 + (i % 3) * 8, '#5a2d8f'); }
      g.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { if (Math.sin(t * 0.7 + i * 2.1) < -0.6) continue; const x = (i * 97) % VW, y = 24 + (i * 53) % 110; g.fillStyle = '#ff3a5a'; g.fillRect(x, y, 2, 1); g.fillRect(x + 5, y, 2, 1); }
    } else if (fi === 2) { // hellfire plains
      grad('#2a0500', '#a02a0a');
      for (let i = 0; i < 26; i++) { const x = i * 16 - 8, h = 22 + Math.sin(t * 6 + i * 1.7) * 6 + (i % 3) * 8; g.fillStyle = i % 2 ? '#ff6a1a' : '#ffb02a'; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + 8, 150 - h); g.lineTo(x + 16, 150); g.fill(); }
      g.fillStyle = '#2a0802'; g.fillRect(0, 148, VW, VH);
      for (let i = 0; i < 30; i++) { const x = (i * 47) % VW, y = VH - ((t * (20 + i % 7 * 6) + i * 31) % VH); g.fillStyle = i % 2 ? '#ffd34e' : '#ff7a2a'; g.fillRect(x, Math.round(y), 1, 2); }
    } else if (fi === 3) { // chain dungeon
      grad('#0e0c14', '#24202e');
      g.fillStyle = '#1a1722'; for (let y = 0; y < 150; y += 10) for (let x = ((y / 10) % 2) * 12; x < VW; x += 24) g.fillRect(x, y, 22, 8);
      g.fillStyle = '#5a5a6a'; for (let i = 0; i < 8; i++) { const cx = 20 + i * 50, sw = Math.sin(t * 1.5 + i) * 6; for (let k = 0; k < 14; k++) g.fillRect(Math.round(cx + sw * k / 14), k * 7, 3, 5); }
      for (const x of [60, 200, 330]) { g.globalAlpha = 0.25 + Math.sin(t * 9 + x) * 0.08; disc(g, x, 60, 18, '#ff7a2a'); g.globalAlpha = 1; g.fillStyle = '#ffd34e'; g.fillRect(x - 1, 56, 3, 6); }
    } else if (fi === 4) { // iron fortress
      grad('#3a3f50', '#1a1c26');
      g.fillStyle = '#14161e'; g.fillRect(0, 96, VW, 60); for (let x = 0; x < VW; x += 20) g.fillRect(x, 88, 12, 8);
      for (const x of [40, 180, 320]) { g.fillRect(x, 50, 34, 60); for (let k = 0; k < 4; k++) g.fillRect(x + k * 10, 42, 6, 8); g.fillStyle = '#a02a2a'; g.fillRect(x + 16, 20 + Math.sin(t * 3 + x) * 1, 1, 30); g.beginPath(); g.moveTo(x + 17, 20); g.lineTo(x + 30 + Math.sin(t * 4 + x) * 3, 26); g.lineTo(x + 17, 32); g.fill(); g.fillStyle = '#14161e'; }
      g.fillStyle = '#ffb02a'; for (let i = 0; i < 10; i++) g.fillRect(50 + i * 33, 110, 2, 3);
    } else if (fi === 5) { // storm above the clouds
      grad('#0a0e24', '#2a2e52');
      for (let i = 0; i < 12; i++) { const x = (i * 71 - t * 14) % (VW + 80); g.globalAlpha = 0.5; disc(g, Math.round(x < -40 ? x + VW + 80 : x), 40 + (i % 4) * 22, 26, '#1a1c3a'); } g.globalAlpha = 1;
      g.fillStyle = '#6a6e9a'; for (let i = 0; i < 18; i++) disc(g, i * 24, 150 + (i % 2) * 4, 14, '#3a3e66');
      if (Math.sin(t * 1.9) > 0.93) { g.globalAlpha = 0.35; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); const bx = 60 + (Math.floor(t) * 113) % 260; g.moveTo(bx, 0); for (let k = 1; k < 7; k++) g.lineTo(bx + ((k * 29) % 22) - 11, k * 22); g.stroke(); }
      g.fillStyle = 'rgba(170,190,255,.45)'; for (let i = 0; i < 50; i++) g.fillRect((i * 43 + t * 40) % VW, (i * 31 + t * 260) % VH, 1, 5);
    } else if (fi === 6) { // ashen wasteland
      grad('#1a0606', '#5a1a0a');
      for (const [x, h] of [[30, 70], [150, 100], [290, 80], [380, 60]]) { g.fillStyle = '#1a0a08'; g.beginPath(); g.moveTo(x - h, 150); g.lineTo(x, 150 - h); g.lineTo(x + h, 150); g.fill(); g.globalAlpha = 0.5 + Math.sin(t * 4 + x) * 0.2; disc(g, x, 150 - h, 6, '#ff6a1a'); g.globalAlpha = 1; }
      g.fillStyle = 'rgba(200,190,190,.55)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37 + Math.sin(t + i) * 8) % VW, (i * 23 + t * 18) % VH, 1, 1);
    } else if (fi === 7) { // eclipse void
      grad('#020108', '#0e0620');
      for (let i = 0; i < 70; i++) { g.fillStyle = i % 5 ? '#6a5a9a' : '#fff'; g.fillRect((i * 97) % VW, (i * 53) % 150, 1, 1); }
      const cx = VW * 0.68, cy = 62;
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + t * 0.3; g.strokeStyle = i % 2 ? '#d58bff' : '#ffffff'; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); g.lineTo(cx + Math.cos(a) * (60 + (i % 3) * 8), cy + Math.sin(a) * (60 + (i % 3) * 8)); g.stroke(); }
      g.globalAlpha = 1; disc(g, cx, cy, 44, '#b88aff'); disc(g, cx, cy, 40, '#050309');
    }
  }
  function bossPre() {
    const cam = SY_CAMEO[Q.li], ar = Q.L.arena, bl = BOSS_LINES[Q.li]; let lines = [];
    if (cam) { Q.syFig = { x: (ar.x0 + 9) * TS, y: (ar.gy - 3) * TS }; emit(Q.syFig.x, Q.syFig.y - 12, 24, { col: ['#7ed957', '#fff'], sp0: 20, sp1: 90 }); Snd.play('poof'); lines = cam.pre.map(l => Object.assign({ w: 'sy' }, l)); }
    if (bl && bl.pre) lines = lines.concat(bl.pre.map(l => Object.assign({ w: 'boss' + Q.li }, l)));
    if (lines.length) startScripted('boss' + Q.li, lines, () => { Q.state = 'bossintro'; Q.stateT = 0; });
  }
  function bossPost() {
    const cam = SY_CAMEO[Q.li], bl = BOSS_LINES[Q.li];
    let lines = bl && bl.post ? bl.post.map(l => Object.assign({ w: 'boss' + Q.li }, l)) : [];
    if (cam && Q.syFig) lines = lines.concat(cam.post.map(l => Object.assign({ w: 'sy' }, l)));
    if (!lines.length) return;
    later(1.6, () => { if (Q.state === 'play') startScripted(lines[0].w, lines, () => syPoof()); else syPoof(); });
  }
"""

def game(s):
    # story data
    s = rep(s, "  // ---------- caches ----------", io.open('tools/movie_block.txt', encoding='utf-8').read() + "\n  // ---------- caches ----------")
    s = rep(s, "  const bpc = () =>", "  // every boss can roar\n  [].concat(BOSS, FORMS.shorty, FORMS.sy, FORMS.quoc).forEach(c => { if (c.skills.indexOf('roar') < 0) c.skills.push('roar'); });\n  const bpc = () =>")
    s = rep(s, "    ember: { spr: 'hero_idle', name: { en: 'Ember', vi: 'Ember' } },", "    ember: { spr: 'hero_idle', name: { en: 'Ember', vi: 'Ember' } },\n    narr: { spr: null, name: { en: 'Story', vi: 'Kể chuyện' } },")
    # boss talk before / after every fight
    s = rep(s, "    else syCameoPre();\n  }", "    else bossPre();\n  }")
    s = rep(s, "      syCameoPost();", "      bossPost();")
    s = rep(s, "  // ===================== BOSS AI =====================", SCENES + "\n  // ===================== BOSS AI =====================")
    # cinematic talk: bars, portrait that fits, narrator without portrait, boss voices
    s = rep(s, "    Q.talk = { it: { who }, npc: NPCS[who], lines, i: 0, t: 0, after };", "    Q.talk = { it: { who }, npc: NPCS[who], lines, i: 0, t: 0, after, cine: true };")
    s = rep(s, "Snd.blip(tk.lines[tk.i].w || tk.it.who); }", "{ const sw = tk.lines[tk.i].w || tk.it.who; if (sw.indexOf('boss') === 0) Snd.creature(Q.li, 'idle', true, 0.7); else if (sw !== 'narr') Snd.blip(sw); } }")
    s = rep(s, "      const tk = Q.talk, cur = (tk.lines[tk.i] && tk.lines[tk.i].w && NPCS[tk.lines[tk.i].w]) || tk.npc, sp = npcSpr(cur.spr);",
            "      const tk = Q.talk, cur = (tk.lines[tk.i] && tk.lines[tk.i].w && NPCS[tk.lines[tk.i].w]) || tk.npc, sp = cur.spr ? npcSpr(cur.spr) : null;\n      if (tk.cine) { const k = Math.min(1, Q.stateT * 3); g.fillStyle = '#000'; g.fillRect(0, 0, VW, Math.round(20 * k)); g.fillRect(0, VH - Math.round(8 * k), VW, 8); }")
    s = rep(s, "      drawSpr(g, sp, 36, 204, false, false, 2, 2);", "      if (sp) { const sc = Math.min(2, 46 / sp.h, 42 / sp.w); drawSpr(g, sp, 36, 203, false, false, sc, sc); }")
    # mid-way story beat at the second lantern of each map
    s = rep(s, "Q.items.forEach(o => { if (o.kind === 'cp') o.lit = false; }); it.lit = true;", "Q.items.forEach(o => { if (o.kind === 'cp') o.lit = false; }); it.lit = true; Q.cpCount = (Q.cpCount || 0) + 1; if (Q.cpCount === 2 && MID_STORY[Q.li] && !Q.midDone) { Q.midDone = true; later(0.6, () => { if (Q.state === 'play') startScripted('ember', MID_STORY[Q.li], null); }); }")
    # roar: the boss stands still, the screen shakes, anyone close loses a little health
    a = s.index("    roar: { tele: 0.6, start(b) {"); b = s.index("\n", a)
    s = s[:a] + "    roar: { tele: 0.7, start(b) { b.skT = 1.5; b.rt = 0; b.hitDone = false; b.vx = 0; const c = bc(b); addRing(c.x, b.y + b.h, bpc(), 110, 0.8); if (b.id === 'quoc') Snd.devilRoar(1); else Snd.creature(Q.li, 'alert', true); Snd.play('boom'); }, upd(b, dt) { b.skT -= dt; b.rt -= dt; Q.shake = Math.max(Q.shake, 0.55); const c = bc(b), P = Q.P; if (b.rt <= 0 && b.skT > 0.2) { b.rt = 0.22; addRing(c.x, b.y + b.h * 0.5, bpc(), 60 + Math.random() * 40, 0.45); emit(c.x + rr(-b.w / 2, b.w / 2), b.y + rr(0, b.h * 0.5), 6, { col: ['#fff', bpc()], sp0: 30, sp1: 110 }); } if (!b.hitDone && b.skT < 1.2) { b.hitDone = true; if (Math.hypot(P.x + 4 - c.x, P.y + 7 - c.y) < b.w / 2 + 64) { hurtPlayer(1, c.x); P.vx = (P.x + 4 < c.x ? -1 : 1) * 190; P.vy = -150; } } return b.skT <= 0; } }," + s[b:]
    s = rep(s, "    if (b.cloak) al = 0.1 + 0.07 * Math.sin(t * 9);", "    if (b.cloak) al = 0.1 + 0.07 * Math.sin(t * 9);\n    if (b.st === 'act' && b.sk === 'roar') { sy *= 1.08; sx *= 1.06; ox += (Math.random() - 0.5) * 3; aura = [bpc(), 0.6]; }")
    # each Quoc form drags you into its own world
    s = rep(s, "    Q.msg = LN(c.name); Q.msgT = 3;\n  }", """    Q.msg = LN(c.name); Q.msgT = 3;
    if (b.id === 'quoc' && FORM_SCENES[idx]) {
      const P = Q.P, ar = Q.L.arena; P.x = (ar.x0 + 4) * TS; P.y = (ar.gy - 1) * TS - P.h; P.vx = P.vy = 0; P.inv = Math.max(P.inv, 1.5);
      Q.G.flash = 0.9; Snd.play('thunder'); Snd.whisper();
      for (const a of Q.G.allies || []) { a.x = P.x - 10; a.y = P.y + P.h; }
      Q.msg = (save.lang === 'vi' ? 'Quoc kéo bạn vào ' : 'Quoc drags you into ') + LN(FORM_SCENES[idx]) + '!'; Q.msgT = 4;
    }
  }""")
    s = rep(s, "    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + VW) / TS), ty0 = Math.floor(camY / TS), ty1 = Math.floor((camY + VH) / TS);",
            "    if (Q.li === 6 && Q.boss && Q.boss.id === 'quoc' && Q.arenaSealed && Q.boss.fi > 0) drawFormScene(Q.boss.fi);\n    const tx0 = Math.floor(camX / TS), tx1 = Math.floor((camX + VW) / TS), ty0 = Math.floor(camY / TS), ty1 = Math.floor((camY + VH) / TS);")
    return s
edit('src/game.js', game)
print('ok')
