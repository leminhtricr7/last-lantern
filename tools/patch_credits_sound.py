import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b, n=1):
    assert a in s, 'MISSING: ' + a[:100]
    return s.replace(a, b, n)

# ====================================================================== audio.js
def audio(s):
    s = rep(s, "    flame() {", """    bstep() { noise(0.13, 0.32, 70); tone(68, 0.16, 'sine', 0.28, -34); },
    rumble() { noise(0.8, 0.26, 55); tone(48, 0.8, 'sawtooth', 0.16, -14); },
    windy() { noise(0.9, 0.2, 450); tone(260, 0.9, 'triangle', 0.04, 220); },
    chime() { tone(880, 0.5, 'sine', 0.1); tone(1320, 0.5, 'sine', 0.06); },
    splash() { noise(0.4, 0.26, 700); tone(320, 0.22, 'sine', 0.1, -220); },
    bubbles() { for (let i = 0; i < 4; i++) tone(300 + Math.random() * 300, 0.07, 'sine', 0.05, 400, ac.currentTime + i * 0.05); },
    flame() {""")
    s = rep(s, "  function stop() { if (timer) clearInterval(timer);", """  // ---------- ambience: a living soundscape for every land ----------
  let ambG = null, amb = null, ambKind = null;
  const AMB = {
    meadow: { bed: ['bandpass', 520, 0.5, 0.03, 0.12, 180], ev: [['bird', 0.35], ['cricket', 0.25], ['breeze', 0.06]] },
    forest: { bed: ['lowpass', 700, 0.7, 0.032, 0.08, 200], ev: [['owl', 0.07], ['cricket', 0.3], ['twig', 0.12], ['rustle', 0.2]] },
    caves: { bed: ['lowpass', 220, 1, 0.03, 0.05, 60], ev: [['drip', 0.55], ['rumble', 0.04], ['crystal', 0.1]] },
    desert: { bed: ['bandpass', 1400, 0.35, 0.055, 0.18, 500], ev: [['hawk', 0.05], ['sandhiss', 0.12], ['bone', 0.04]] },
    frost: { bed: ['bandpass', 800, 1.2, 0.06, 0.2, 400], ev: [['icecrack', 0.1], ['wolf', 0.03], ['crystal', 0.07]] },
    volcano: { bed: ['lowpass', 130, 1, 0.09, 0.07, 40], ev: [['lava', 0.6], ['rumble', 0.1], ['rockfall', 0.06]] },
    citadel: { bed: ['lowpass', 90, 2, 0.06, 0.04, 30], ev: [['bell', 0.07], ['ghost', 0.07], ['caw', 0.04], ['rumble', 0.04]], drone: true },
    swamp: { bed: ['lowpass', 420, 0.8, 0.032, 0.1, 140], ev: [['frog', 0.55], ['bubble', 0.3], ['cricket', 0.3], ['owl', 0.04]] },
    ocean: { bed: ['lowpass', 260, 0.8, 0.055, 0.06, 90], ev: [['bubble', 0.8], ['whale', 0.05], ['sonar', 0.04]] },
    tunnels: { bed: ['lowpass', 160, 1, 0.04, 0.05, 50], ev: [['drip', 0.35], ['creak', 0.09], ['rumble', 0.07], ['rockfall', 0.05]] }
  };
  const AV = {
    bird() { const f = 1700 + Math.random() * 900; tone(f, 0.09, 'sine', 0.035, -500, 0, ambG); tone(f * 0.85, 0.12, 'sine', 0.03, -300, ac.currentTime + 0.1, ambG); if (Math.random() < 0.5) tone(f * 1.1, 0.08, 'sine', 0.03, -200, ac.currentTime + 0.24, ambG); },
    cricket() { for (let i = 0; i < 4; i++) tone(4300 + Math.random() * 300, 0.03, 'square', 0.012, 0, ac.currentTime + i * 0.05, ambG); },
    breeze() { noise(1.4, 0.05, 900, 0, ambG); },
    owl() { tone(390, 0.35, 'sine', 0.06, -50, 0, ambG); tone(350, 0.5, 'sine', 0.05, -60, ac.currentTime + 0.5, ambG); },
    twig() { noise(0.05, 0.08, 2500, 0, ambG); tone(1200, 0.03, 'square', 0.02, -600, 0, ambG); },
    rustle() { noise(0.35, 0.04, 2000, 0, ambG); },
    drip() { const f = 800 + Math.random() * 500; for (let i = 0; i < 3; i++) tone(f, 0.09, 'sine', 0.07 / (i + 1), -450, ac.currentTime + i * 0.17, ambG); },
    rumble() { noise(1.6, 0.09, 45, 0, ambG); tone(42, 1.4, 'sawtooth', 0.05, -8, 0, ambG); },
    crystal() { const f = 1600 + Math.random() * 1400; tone(f, 0.6, 'sine', 0.035, 0, 0, ambG); tone(f * 1.5, 0.5, 'sine', 0.02, 0, ac.currentTime + 0.05, ambG); },
    hawk() { tone(1500, 0.5, 'sawtooth', 0.025, -900, 0, ambG); noise(0.3, 0.02, 2500, 0, ambG); },
    sandhiss() { noise(0.9, 0.05, 3000, 0, ambG); },
    bone() { tone(260, 0.05, 'square', 0.04, -80, 0, ambG); tone(210, 0.05, 'square', 0.04, -60, ac.currentTime + 0.07, ambG); },
    icecrack() { noise(0.15, 0.09, 3500, 0, ambG); tone(2400, 0.18, 'sine', 0.04, -1800, 0, ambG); },
    wolf() { tone(330, 1.4, 'sine', 0.045, 160, 0, ambG); tone(500, 1.2, 'sine', 0.02, -60, ac.currentTime + 0.3, ambG); },
    lava() { noise(0.25, 0.1, 150, 0, ambG); tone(210, 0.12, 'sine', 0.08, -140, 0, ambG); },
    rockfall() { for (let i = 0; i < 5; i++) { noise(0.06, 0.07, 500 + Math.random() * 800, ac.currentTime + i * 0.07, ambG); } },
    bell() { tone(392, 2.2, 'sine', 0.05, 0, 0, ambG); tone(784, 1.6, 'sine', 0.02, 0, 0, ambG); },
    ghost() { whisper(); },
    caw() { noise(0.18, 0.06, 1500, 0, ambG); tone(520, 0.22, 'sawtooth', 0.04, -260, 0, ambG); },
    frog() { for (let i = 0; i < 3; i++) tone(130 + Math.random() * 30, 0.09, 'square', 0.035, -40, ac.currentTime + i * 0.12, ambG); },
    bubble() { tone(250 + Math.random() * 200, 0.12, 'sine', 0.05, 500, 0, ambG); },
    whale() { tone(160, 2.6, 'sine', 0.06, -60, 0, ambG); tone(210, 2.2, 'sine', 0.035, -90, ac.currentTime + 0.4, ambG); },
    sonar() { tone(1100, 0.5, 'sine', 0.035, 0, 0, ambG); tone(1100, 0.5, 'sine', 0.012, 0, ac.currentTime + 0.35, ambG); },
    creak() { tone(95, 0.7, 'sawtooth', 0.04, -22, 0, ambG); noise(0.5, 0.025, 300, 0, ambG); }
  };
  function stopAmb() { if (!amb) return; clearInterval(amb.timer); for (const n of amb.nodes) try { n.stop(); } catch (e) { } try { amb.g.disconnect(); } catch (e) { } amb = null; }
  function ambience(kind) {
    ambKind = kind || null; if (!ac || !ambG) return; stopAmb(); const A = kind && AMB[kind]; if (!A) return;
    const t = ac.currentTime, src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = A.bed[0]; f.frequency.value = A.bed[1]; f.Q.value = A.bed[2];
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(A.bed[3], t + 2.5);
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = A.bed[4]; lg.gain.value = A.bed[5]; lfo.connect(lg); lg.connect(f.frequency);
    src.connect(f); f.connect(g); g.connect(ambG); src.start(); lfo.start(); const nodes = [src, lfo];
    if (A.drone) for (const fr of [55, 55.7, 82.4]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = fr; og.gain.value = 0.02; o.connect(og); og.connect(ambG); o.start(); nodes.push(o); }
    amb = { nodes, g, timer: setInterval(() => { for (const e of A.ev) if (Math.random() < e[1] * 0.4) AV[e[0]](); }, 400) };
  }
  function ambVol(v) { if (ambG && ac) ambG.gain.setTargetAtTime(v, ac.currentTime, 0.5); }
  // footsteps that sound like the ground you run on
  function step(kind) {
    if (!ac) return; const r = Math.random();
    switch (kind) {
      case 'meadow': case 'forest': case 'swamp': noise(0.06, 0.07 + r * 0.03, 1100, 0, sfxG); tone(110 + r * 30, 0.05, 'sine', 0.05, -30); break;
      case 'caves': case 'citadel': case 'tunnels': tone(280 + r * 90, 0.035, 'square', 0.04, -80); noise(0.05, 0.06, 2400, 0, sfxG); break;
      case 'desert': noise(0.1, 0.055, 650, 0, sfxG); break;
      case 'frost': noise(0.08, 0.1, 1800, 0, sfxG); noise(0.05, 0.06, 3600, ac.currentTime + 0.03, sfxG); break;
      case 'volcano': tone(170 + r * 40, 0.045, 'square', 0.04, -60); noise(0.06, 0.07, 800, 0, sfxG); break;
      case 'ocean': tone(380 + r * 200, 0.07, 'sine', 0.03, 300); break;
    }
  }
  function stop() { if (timer) clearInterval(timer);""")
    s = rep(s, "    sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);", "    sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);\n    ambG = ac.createGain(); ambG.gain.value = 0.9; ambG.connect(master);")
    s = rep(s, "    if (cur) { const c = cur; cur = null; curKey = ''; music(c.key, c.def); }", "    if (cur) { const c = cur; cur = null; curKey = ''; music(c.key, c.def); }\n    if (ambKind) ambience(ambKind);")
    s = rep(s, "return { init, play, creature, monster,", "return { init, play, creature, monster, ambience, ambVol, step,")
    return s
edit('src/audio.js', audio)

# ====================================================================== game.js
CREDITS = """  // ===================== CREDITS =====================
  let cred = null;
  const CREDITS_LINES = () => [
    ['logo', 'LAST LANTERN'], ['sub', sv('THE SHATTERED SUN', 'NGỌN ĐÈN CUỐI CÙNG')], ['gap'],
    ['h', sv('MADE BY', 'ĐƯỢC THỰC HIỆN BỞI')], ['p', sv('A team of 2', 'Đội ngũ gồm 2 thành viên')], ['gap'],
    ['name', 'Lê Minh Trí', '(Lee San Tree)'], ['name', 'Đặng Anh Quân', '(David Quan)'], ['gap'],
    ['h', sv('IMPORTANT', 'ĐIỀU QUAN TRỌNG')],
    ['p', sv('Your progress is saved automatically at every checkpoint, on this device only.', 'Tiến trình được tự động lưu ở mỗi checkpoint, chỉ trên thiết bị này.')],
    ['p', sv('Co-op supports up to 5 players: share the room code with your friends.', 'Chơi co-op tối đa 5 người: hãy gửi mã phòng cho bạn bè.')],
    ['p', sv('The secret references hidden in the game are tributes only: no original names, logos or pictures are used.', 'Các chi tiết bí mật ẩn trong game chỉ là lời tri ân, không dùng tên, logo hay hình ảnh gốc của bất kỳ tác phẩm nào.')], ['gap'],
    ['h', sv('THANK YOU', 'CẢM ƠN')], ['p', sv('To everyone who tested, shared and played the game.', 'Gửi tới tất cả những ai đã chơi thử, chia sẻ và ủng hộ game.')],
    ['p', sv('Keep your lantern burning.', 'Hãy giữ ngọn đèn của bạn luôn cháy sáng.')], ['gap'],
    ['p', '© 2026 Lê Minh Trí & Đặng Anh Quân'], ['p', sv('All rights reserved.  Version 1.0', 'Bảo lưu mọi quyền.  Phiên bản 1.0')], ['gap'], ['gap'], ['end', sv('Press ENTER or click to go back', 'Nhấn ENTER hoặc bấm chuột để quay lại')]
  ];
  function updateCredits(dt) { if (!cred) cred = { t: 0 }; cred.t += dt; sceneT += dt; if ((act.okP || act.backP || act.atkP) && cred.t > 0.3) { Snd.play('select'); toScene('title'); } }
  function drawCredits() {
    if (!cred) cred = { t: 0 }; const t = cred.t, A = titleArt();
    g.drawImage(A.sky, 0, 0);
    for (const s of A.stars) { g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(sceneT * s.v + s.p)); g.fillStyle = s.c; g.fillRect(s.x, s.y, s.s, s.s); } g.globalAlpha = 1;
    for (const [im, f, y] of [[A.m1, 0.02, 84], [A.m2, 0.05, 106], [A.m3, 0.1, 128]]) { const ox = -((sceneT * 6 * f * 10) % 768); g.drawImage(im, Math.round(ox), y); g.drawImage(im, Math.round(ox) + 768, y); }
    g.fillStyle = 'rgba(4,2,12,.72)'; g.fillRect(0, 0, VW, VH);
    for (const f of A.flies) { const x = f.x + Math.sin(sceneT * f.sp + f.ph) * f.r, y = f.y - 60 + Math.cos(sceneT * f.sp * 1.3 + f.ph) * 6; g.globalAlpha = 0.3 + 0.5 * Math.max(0, Math.sin(sceneT * 2 + f.ph)); g.fillStyle = '#ffe066'; g.fillRect(Math.round(x), Math.round(y), 2, 2); } g.globalAlpha = 1;
    const L = CREDITS_LINES(), LH = { logo: 40, sub: 16, gap: 14, h: 18, p: 12, name: 30, end: 20 };
    let total = 0; for (const l of L) total += LH[l[0]]; const scroll = Math.min(t * 15, total - 160);
    let y = VH - 10 - scroll;
    for (const l of L) {
      const type = l[0], h = LH[type], cy = y + h / 2;
      if (cy > -10 && cy < VH + 10) {
        const fade = clamp(Math.min(cy / 28, (VH - cy) / 28), 0, 1);
        if (type === 'logo') txt(l[1], VW / 2, cy, { al: 'center', size: 22, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.8)', ls: 2, sh: false, alpha: fade });
        else if (type === 'sub') txt(l[1], VW / 2, cy, { al: 'center', size: 8, bold: true, col: '#ffe9b8', ls: 3, ol: '#1a0814', sh: false, alpha: fade });
        else if (type === 'h') { txt(l[1], VW / 2, cy, { al: 'center', size: 9, bold: true, col: '#ffd34e', ls: 3, ol: '#1a0814', glow: 'rgba(255,170,60,.6)', sh: false, alpha: fade }); g.globalAlpha = fade * 0.6; g.fillStyle = '#ffd34e'; g.fillRect(VW / 2 - 60, Math.round(cy + 8), 120, 1); g.globalAlpha = 1; }
        else if (type === 'p') wrapText(l[1], 62).forEach((ln, j) => txt(ln, VW / 2, cy + j * 9, { al: 'center', size: 7, col: '#e8eaf5', alpha: fade }));
        else if (type === 'name') { lanternIc(VW / 2 - 98, Math.round(cy), fade); lanternIc(VW / 2 + 98, Math.round(cy), fade); txt(l[1], VW / 2, cy - 4, { al: 'center', size: 12, bold: true, col: '#ffffff', ol: '#2a0a10', glow: 'rgba(255,200,100,.8)', sh: false, alpha: fade }); txt(l[2], VW / 2, cy + 8, { al: 'center', size: 7, col: '#ffd34e', alpha: fade }); }
        else if (type === 'end') txt(l[1], VW / 2, cy, { al: 'center', size: 6.5, col: '#b8a8d8', alpha: fade * (0.5 + 0.5 * Math.abs(Math.sin(sceneT * 3))) });
      }
      y += h;
    }
    g.drawImage(A.vig, 0, 0);
    txt(sv('ENTER / click: back', 'ENTER / bấm chuột: quay lại'), VW - 6, VH - 6, { al: 'right', size: 5, col: '#6a6a8a' });
  }
"""

def game(s):
    # --- credits scene + menu ---
    s = rep(s, "  function frame(now) {", CREDITS + "  function frame(now) {")
    s = rep(s, "    if (s === 'opening') startOpening();", "    if (s === 'opening') startOpening();\n    if (s === 'credits') { cred = { t: 0 }; Snd.music('title', TITLE_MUSIC); }\n    if (s !== 'play') Snd.ambience(null);")
    s = rep(s, "        else if (scene === 'opening') updateOpening(sub);", "        else if (scene === 'opening') updateOpening(sub);\n        else if (scene === 'credits') updateCredits(sub);")
    s = rep(s, "    else if (scene === 'opening') drawOpening();", "    else if (scene === 'opening') drawOpening();\n    else if (scene === 'credits') drawCredits();")
    s = rep(s, "scene === 'story' || scene === 'ending' || scene === 'opening') pressed.Enter = true;", "scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'credits') pressed.Enter = true;")
    s = rep(s, "    it.push({ k: 'quit', fn:", "    it.push({ k: 'credits', fn: () => toScene('credits') });\n    it.push({ k: 'quit', fn:")
    s = rep(s, "coopT: { en: 'Online Co-op (5 players)', vi: 'Co-op online (5 người)' },", "coopT: { en: 'Online Co-op (5 players)', vi: 'Co-op online (5 người)' }, credits: { en: 'Credits', vi: 'Thực hiện bởi' },")
    s = rep(s, "const items = titleItems(), n = items.length, MX0 = 214, MW = 158, MY = 92, DY = 12;", "const items = titleItems(), n = items.length, MX0 = 214, MW = 158, MY = 90, DY = 11;")
    s = s.replace("menuHit(gx, gy, titleItems().length, 293, 92, 12, 79)", "menuHit(gx, gy, titleItems().length, 293, 90, 11, 79)")
    # --- ambience for each land, quieter in boss fights ---
    s = rep(s, "    Snd.music('lvl' + li, L.B.music);", "    Snd.music('lvl' + li, L.B.music); Snd.ambience(L.B.id); Snd.ambVol(0.9);")
    s = rep(s, "    Q.arenaSealed = true;\n    if (coop) coopGather();", "    Q.arenaSealed = true; Snd.ambVol(0.35);\n    if (coop) coopGather();")
    s = rep(s, "Snd.play('win'); Snd.music('lvl' + Q.li, Q.B.music); }", "Snd.play('win'); Snd.music('lvl' + Q.li, Q.B.music); Snd.ambVol(0.9); }")
    s = rep(s, "    Snd.music('lvl' + Q.li, Q.B.music);\n  }\n  function seal() {", "    Snd.music('lvl' + Q.li, Q.B.music); Snd.ambVol(0.9);\n  }\n  function seal() {")
    # --- footsteps that match the ground, and the splash when you dive ---
    s = rep(s, "    // run dust\n", """    // footsteps that sound like the ground, and a splash when you dive in
    P.stepT = (P.stepT || 0) - dt;
    if (P.onGround && Math.abs(P.vx) > 45 && P.stepT <= 0 && !P.isGhostP) { P.stepT = 0.27; if (!wetP(P)) Snd.step(Q.B.id); }
    { const w = wetP(P); if (P.wasWet === false && w) { Snd.play('splash'); emit(P.x + 4, P.y + 6, 14, { col: ['#bfeaff', '#fff'], sp0: 30, sp1: 110, vy: -60 }); } P.wasWet = w; }
    // run dust
""")
    # --- boss sounds: each skill has its voice, and heavy bosses stomp ---
    s = rep(s, "      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; } break;", "      case 'tele': b.timer -= dt; b.dir = dxp < 0 ? -1 : 1; if (b.timer <= 0) { b.sk = b.atkSk; BS[b.sk].start(b); b.st = 'act'; bossSkillSnd(b.sk); } break;")
    s = rep(s, "        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * Math.max(c.sp, 45)", "        if (b.onGround && b.moveT > 0) { b.stepT = (b.stepT || 0) - dt; if (b.stepT <= 0) { b.stepT = clamp(0.62 - b.w / 400, 0.3, 0.6); if (b.w >= 30) { Snd.play('bstep'); Q.shake = Math.max(Q.shake, b.w >= 60 ? 0.12 : 0.05); } } }\n        if (Math.abs(dxp) > b.w / 2 + 36) { moveX(b, b.dir * Math.max(c.sp, 45)")
    s = rep(s, "  function endSkill(b) {", """  // every boss skill has a sound of its own (on top of the creature's voice)
  function bossSkillSnd(sk) {
    const G = { jump: 'whoosh', stomp: 'bstep', slam: 'boom', bounce3: 'whoosh', charge: 'rumble', rush: 'rumble', shoot: 'shoot', fan: 'shoot', spit: 'shoot', lobs: 'throw', rain: 'rumble', erupt: 'crumble', meteor: 'explode', lavaCols: 'flame', sweep: 'flame', beam: 'flame', crossBeam: 'flame', breath: 'flame', summon: 'poof', clone: 'poof', dark: 'poof', cloak: 'poof', teleport: 'poof', ambush: 'poof', shield: 'chime', guard: 'chime', tornado: 'windy', blizzard: 'windy', wall: 'crumble', curse: 'zap', web: 'throw', goo: 'splash', splitslime: 'splash', spin: 'whoosh', tentacles: 'rumble', burrow: 'crumble' };
    const n = G[sk]; if (n) Snd.play(n); if (sk === 'spin' || sk === 'bounce3') setTimeout(() => Snd.play('whoosh'), 250);
  }
  function endSkill(b) {""")
    return s
edit('src/game.js', game)
print('ok')
