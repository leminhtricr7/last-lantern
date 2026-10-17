import io
def edit(p, fn):
    s = io.open(p, encoding='utf-8').read(); s = fn(s); io.open(p, 'w', encoding='utf-8').write(s)
def rep(s, a, b):
    assert a in s, a[:70]
    return s.replace(a, b, 1)

# ------------- Quoc the Devil: new design -------------
def art(s):
    a = s.index("function devilSprite() {"); b = s.index("  return _cache.devil;\n}", a) + len("  return _cache.devil;\n}")
    new = '''function devilSprite() {
  if (_cache.devil) return _cache.devil;
  _cache.devil = paint(150, 128, P => {
    // hellfire halo behind everything
    for (let i = 0; i < 9; i++) { const x0 = 18 + i * 14; P.tri(x0, 74, x0 + 14, 74, x0 + 7, 10 + (i % 3) * 10 - Math.abs(4 - i) * 2, i % 2 ? 'o' : 'r'); P.tri(x0 + 3, 74, x0 + 11, 74, x0 + 7, 34 + (i % 3) * 8, 'y'); }
    // great bat wings
    P.both(() => {
      P.tri(48, 86, 2, 30, 8, 104, 'z'); P.tri(48, 86, 14, 50, 26, 112, 'i'); P.tri(44, 90, 4, 74, 18, 118, 'z');
      P.line(48, 86, 2, 30, 'k', 3); P.line(46, 88, 5, 72, 'k', 2); P.line(46, 90, 16, 112, 'k', 2); P.line(2, 30, 8, 104, 'R', 1);
    });
    // torso and spiked armour
    P.ell(75, 120, 54, 24, 'D'); P.ell(75, 116, 48, 18, 'q'); P.rect(50, 100, 50, 28, 'D'); P.rect(52, 102, 46, 24, 'q'); P.rect(52, 102, 46, 3, 'A');
    P.rect(69, 106, 12, 20, 'k'); P.rect(71, 108, 8, 16, 'f'); P.rect(73, 110, 4, 12, 'y'); P.px(75, 116, 'w');
    for (let i = 0; i < 4; i++) { P.rect(56 + i * 10, 104 + (i % 2) * 8, 3, 3, 'A'); P.rect(88 - i * 2, 114, 0, 0, 'A'); }
    P.both(() => {
      P.ell(26, 104, 18, 14, 'D'); P.ell(26, 101, 15, 10, 'q'); P.ell(24, 98, 8, 4, 'A');
      P.tri(14, 96, 24, 92, 8, 70, 'A'); P.tri(26, 92, 34, 90, 26, 66, 'a'); P.tri(34, 92, 40, 92, 40, 74, 'A');
      P.line(46, 112, 60, 126, 'D', 3); P.ell(12, 118, 6, 5, 'R'); P.tri(6, 120, 10, 114, 2, 108, 'e');
    });
    P.rect(60, 90, 30, 14, 'R'); P.ell(75, 96, 22, 10, 'R'); P.ell(75, 92, 16, 6, 'r');
    // curled ram horns
    P.both(() => {
      P.line(50, 46, 34, 30, 'k', 8); P.line(34, 30, 20, 30, 'k', 7); P.line(20, 30, 10, 40, 'k', 6); P.line(10, 40, 10, 54, 'k', 4);
      P.line(50, 44, 35, 29, 'D', 4); P.line(35, 28, 22, 28, 'D', 3); P.line(21, 29, 12, 38, 'q', 2); P.line(10, 46, 10, 56, 'y', 2); P.px(10, 58, 'w');
      P.tri(46, 56, 28, 54, 44, 72, 'r'); P.tri(44, 58, 32, 58, 44, 68, 'R'); P.px(30, 55, 'y'); P.px(33, 56, 'y');
    });
    // head: sharp jaw, scarred
    P.ell(75, 62, 32, 34, 'r'); P.ell(92, 66, 19, 28, 'R'); P.ell(75, 76, 27, 20, 'r'); P.rect(60, 82, 30, 14, 'R'); P.tri(62, 94, 88, 94, 75, 112, 'R'); P.tri(66, 94, 84, 94, 75, 106, 'k');
    P.both(() => { P.line(44, 40, 72, 53, 'k', 7); P.line(46, 38, 72, 50, 'R', 2); });
    P.both(() => { P.ell(60, 58, 10, 4, 'k'); P.ell(60, 58, 8, 3, 'y'); P.ell(60, 58, 5, 2, 'w'); P.rect(60, 55, 2, 7, 'k'); P.px(57, 58, 'f'); P.px(63, 58, 'f'); P.tri(48, 62, 52, 62, 50, 74, 'R'); P.line(46, 66, 54, 80, 'k', 1); });
    P.px(71, 70, 'k'); P.px(79, 70, 'k'); P.rect(72, 62, 3, 8, 'R');
    // snarling mouth full of fangs, ember glow inside
    P.rect(50, 80, 50, 15, 'k'); P.rect(53, 84, 44, 8, 'o'); P.rect(56, 86, 38, 4, 'y');
    for (let i = 0; i < 9; i++) { P.tri(52 + i * 5, 80, 57 + i * 5, 80, 55 + i * 5, 86 + (i % 3) * 2, 'w'); P.tri(53 + i * 5, 95, 58 + i * 5, 95, 56 + i * 5, 89 - (i % 3), 'e'); }
    P.both(() => { P.tri(50, 79, 60, 79, 54, 100, 'w'); P.tri(51, 81, 57, 81, 54, 94, 'a'); });
    // crown of flames between the horns
    for (let i = 0; i < 7; i++) P.tri(52 + i * 8, 30, 58 + i * 8, 30, 55 + i * 8, 10 - (i % 2) * 6 - (i === 3 ? 8 : 0), i % 2 ? 'y' : 'f');
    P.rect(50, 28, 52, 4, 'Y'); P.px(75, 29, 'r');
    // embers
    for (let i = 0; i < 18; i++) P.px((i * 37 + 9) % 140 + 4, (i * 23 + 5) % 100 + 6, i % 2 ? 'y' : 'o');
  }, '#1a0406');
  return _cache.devil;
}'''
    return s[:a] + new + s[b:]
edit('src/art.js', art)

# ------------- scarier Quoc voice -------------
def audio(s):
    s = rep(s, "  function hero(evt) { if (HV[evt]) HV[evt](); }", '''  function hero(evt) { if (HV[evt]) HV[evt](); }
  // ---- Quoc the Devil: layered, distorted, echoing demon voice ----
  let devilFx = null;
  function getDevilFx() {
    if (devilFx) return devilFx;
    const ws = ac.createWaveShaper(), n = 1024, cv = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * 7) * 0.85; }
    ws.curve = cv; ws.oversample = '2x';
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 3;
    const dl = ac.createDelay(1); dl.delayTime.value = 0.21; const fb = ac.createGain(); fb.gain.value = 0.38; const wet = ac.createGain(); wet.gain.value = 0.5;
    const dry = ac.createGain(); dry.gain.value = 1;
    ws.connect(lp); lp.connect(dry); dry.connect(sfxG); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(sfxG);
    return (devilFx = ws);
  }
  function devilVoice(dur, pm, vol) {
    if (!ac) return;
    const ws = getDevilFx(), t = ac.currentTime, f = 52 * (pm || 1) * (0.94 + Math.random() * 0.12);
    const mk = (type, f0, f1, v, wob, wobHz) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(25, f1), t + dur);
      if (wob) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = wobHz; lg.gain.value = wob; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * (vol || 1), t + Math.min(0.03, dur * 0.25)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(ws); o.start(t); o.stop(t + dur + 0.05);
    };
    mk('sawtooth', f, f * 0.72, 0.5, 6, 9); mk('sawtooth', f * 2.02, f * 1.5, 0.28, 14, 13); mk('square', f * 0.5, f * 0.38, 0.4, 0, 0);
    noise(dur, 0.1 * (vol || 1), 250, t, sfxG);
  }
  function devilRoar(power) {
    if (!ac) return; const p = power === undefined ? 1 : power;
    devilVoice(0.9 + p * 0.7, 0.8, 1.3); devilVoice(0.7 + p * 0.5, 1.15, 0.8);
    tone(70, 1.1, 'sine', 0.5 * p, -45, ac.currentTime, sfxG); whisper();
  }''')
    s = rep(s, "    if (who === 'angel') voice({ f0: f * 1.5, f1: f * 1.5, type: 'sine', dur: 0.09, vol: 0.04 });",
            "    if (who === 'angel') voice({ f0: f * 1.5, f1: f * 1.5, type: 'sine', dur: 0.09, vol: 0.04 });")
    s = rep(s, "  function blip(who) {\n    if (!ac) return;", "  function blip(who) {\n    if (!ac) return;\n    if (who === 'quoc') { devilVoice(0.15, 0.85 + Math.random() * 0.5, 0.55); return; }")
    s = rep(s, "return { init, play, creature,", "return { init, play, creature, devilRoar, devilVoice,")
    return s
edit('src/audio.js', audio)

# ------------- game: leek nerf, ride scene, devil roar -------------
def game(s):
    # leek nerf
    s = rep(s, "if (G.leekHeal <= 0 && P.hp < maxHP()) { P.hp++; G.leekHeal = 5;", "if (G.leekHeal <= 0 && P.hp < maxHP()) { P.hp++; G.leekHeal = 9;")
    s = rep(s, "if (mx && e.hp > 0 && e.hp / mx <= 0.2) {", "if (mx && e.hp > 0 && e.hp / mx <= (e.isBoss ? 0.08 : 0.15)) {")
    s = rep(s, "e.stunT = 3; e.stunCd = e.isBoss ? 10 : 5;", "e.stunT = e.isBoss ? 1.5 : 2.5; e.stunCd = e.isBoss ? 20 : 9;")
    s = rep(s, "dmg: Math.max(1, Math.round((baseDmg() + st.dmg) * 0.5)), thru: true, pierceN: 2, shape: 'beam', col: '#a4ffc0'", "dmg: Math.max(1, Math.round((baseDmg() + st.dmg) * 0.3)), thru: true, pierceN: 1, shape: 'beam', col: '#a4ffc0'")
    # ride scene plumbing
    blk = io.open('tools/ride_block.txt', encoding='utf-8').read()
    s = rep(s, "  // ============================== CASTLE CUTSCENE", blk + "\n  // ============================== CASTLE CUTSCENE")
    s = rep(s, "else if (Q.li === 1 && !save.castle) toScene('castle');", "else if (Q.li === 0 && !save.ride) toScene('ride'); else if (Q.li === 1 && !save.castle) toScene('castle');")
    s = rep(s, "    if (s === 'castle') startCastle();\n", "    if (s === 'castle') startCastle();\n    if (s === 'ride') startRide();\n")
    s = rep(s, "        else if (scene === 'castle') updateCastle(sub);", "        else if (scene === 'castle') updateCastle(sub);\n        else if (scene === 'ride') updateRide(sub);")
    s = rep(s, "    else if (scene === 'castle' && castle) drawCastle();", "    else if (scene === 'castle' && castle) drawCastle();\n    else if (scene === 'ride' && ride) drawRide();")
    s = rep(s, "it.push({ k: 'newgame', fn: () => { save.castle = 0;", "it.push({ k: 'newgame', fn: () => { save.castle = 0; save.ride = 0;")
    # devil roar at the start of each of his lines
    s = rep(s, "if (ln.w === 'quoc') Snd.creature(7, 'attack', true);", "if (ln.w === 'quoc') Snd.devilRoar(ln.shout ? 1 : 0.55);")
    return s
edit('src/game.js', game)
print('ok')
