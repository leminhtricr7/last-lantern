'use strict';
// ============ PROCEDURAL AUDIO (8-bit sfx + generated music) ============
const Snd = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf, duck, bassBus, chordBus, leadBus;
  let vol = 0.6, mVol = 1, sVol = 1, ambBase = 0.9, muted = false, lastT = {}, timer = null, cur = null, step = 0, nextT = 0, curKey = '';
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.16;
    master.connect(comp); comp.connect(ac.destination);
    musicG = ac.createGain(); musicG.gain.value = 0.32; musicG.connect(master);
    sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
    ambG = ac.createGain(); ambG.gain.value = 0.9; ambG.connect(master);
    // sidechain-ducked buses (kick pumps the bass, chords and arps)
    duck = ac.createGain(); duck.connect(musicG);
    const lp = (f, q) => { const n = ac.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = f; n.Q.value = q || 0.7; n.connect(duck); return n; };
    bassBus = lp(420, 2); chordBus = lp(3600, 0.8); leadBus = lp(7000, 0.5);
    applyVol();
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (cur) { const c = cur; cur = null; curKey = ''; music(c.key, c.def); }
    if (ambKind) ambience(ambKind);
  }
  function applyVol() { if (master) master.gain.value = muted ? 0 : vol; if (musicG) musicG.gain.value = 0.32 * mVol; if (sfxG) sfxG.gain.value = 0.55 * sVol; if (ambG) ambG.gain.value = ambBase * sVol; }
  function setVol(v) { vol = Math.max(0, Math.min(1, v)); applyVol(); }
  function setMusicVol(v) { mVol = Math.max(0, Math.min(1, v)); applyVol(); }   // music bus (0..1)
  function setSfxVol(v) { sVol = Math.max(0, Math.min(1, v)); applyVol(); }     // effects + ambience (0..1)
  function setMuted(b) { muted = !!b; applyVol(); }
  function toggleMute() { muted = !muted; applyVol(); return muted; }

  function tone(f, dur, type, v, slide, when, dest) {
    if (!ac) return;
    const t = when || ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + dur);
    g.gain.setValueAtTime(v || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, v, hp, when, dest) {
    if (!ac) return;
    const t = when || ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 800;
    const g = ac.createGain(); g.gain.setValueAtTime(v || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxG); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  const sfx = {
    jump() { tone(300, 0.14, 'square', 0.12, 380); },
    djump() { tone(450, 0.16, 'square', 0.12, 500); },
    slash() { noise(0.12, 0.18, 1800); tone(500, 0.08, 'sawtooth', 0.06, -250); },
    hit() { noise(0.1, 0.25, 600); tone(180, 0.1, 'square', 0.15, -100); },
    hurt() { tone(220, 0.35, 'sawtooth', 0.2, -170); noise(0.2, 0.2, 400); },
    coin() { tone(988, 0.07, 'square', 0.1); tone(1319, 0.14, 'square', 0.1, 0, ac && ac.currentTime + 0.06); },
    heart() { [523, 659, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.18, 0, ac && ac.currentTime + i * 0.08)); },
    shard() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.25, 'square', 0.12, 0, ac && ac.currentTime + i * 0.07)); },
    dash() { noise(0.18, 0.2, 500); tone(200, 0.18, 'triangle', 0.15, 300); },
    shoot() { tone(600, 0.15, 'square', 0.08, -350); },
    boom() { noise(0.6, 0.5, 100); tone(90, 0.5, 'sawtooth', 0.3, -60); },
    land() { noise(0.05, 0.08, 300); },
    checkpoint() { [392, 523, 659, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.18, 0, ac && ac.currentTime + i * 0.09)); },
    select() { tone(660, 0.06, 'square', 0.08); },
    ok() { tone(880, 0.08, 'square', 0.1); tone(1175, 0.12, 'square', 0.1, 0, ac && ac.currentTime + 0.07); },
    die() { [330, 262, 196, 130].forEach((f, i) => tone(f, 0.3, 'triangle', 0.2, 0, ac && ac.currentTime + i * 0.15)); },
    win() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'square', 0.12, 0, ac && ac.currentTime + i * 0.12)); },
    crumble() { noise(0.25, 0.12, 300); },
    bossroar() { tone(80, 0.8, 'sawtooth', 0.3, -30); noise(0.7, 0.3, 80); }
  };
  Object.assign(sfx, {
    lever() { tone(180, 0.08, 'square', 0.15, -60); noise(0.08, 0.15, 900); tone(120, 0.15, 'triangle', 0.15, 0, ac && ac.currentTime + 0.08); },
    gate() { noise(0.9, 0.22, 120); tone(70, 0.9, 'sawtooth', 0.18, -25); },
    torch() { noise(0.25, 0.15, 1200); tone(300, 0.25, 'triangle', 0.1, 400); },
    key() { [1047, 1319, 1568].forEach((f, i) => tone(f, 0.12, 'square', 0.1, 0, ac && ac.currentTime + i * 0.06)); },
    rune() { tone(660, 0.18, 'sine', 0.15, 220); tone(990, 0.22, 'triangle', 0.08, 0, ac && ac.currentTime + 0.05); },
    zap() { noise(0.25, 0.25, 2000); tone(150, 0.3, 'sawtooth', 0.15, -100); },
    throw() { noise(0.1, 0.12, 1500); tone(400, 0.1, 'triangle', 0.06, -150); },
    explode() { noise(0.7, 0.55, 80); tone(70, 0.6, 'sawtooth', 0.35, -45); tone(140, 0.3, 'square', 0.15, -90); },
    pickup() { tone(784, 0.08, 'square', 0.1); tone(1047, 0.1, 'square', 0.1, 0, ac && ac.currentTime + 0.05); },
    relic() { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.35, 'triangle', 0.16, 0, ac && ac.currentTime + i * 0.1)); [262, 330, 392].forEach(f => tone(f, 1.2, 'sine', 0.1, 0, ac && ac.currentTime + 0.3)); },
    buy() { tone(1319, 0.06, 'square', 0.1); tone(1760, 0.14, 'square', 0.1, 0, ac && ac.currentTime + 0.06); },
    thunder() { noise(1.4, 0.55, 50); tone(46, 1.2, 'sawtooth', 0.3, -20); noise(0.5, 0.4, 3000); },
    poof() { noise(0.28, 0.2, 1800); tone(500, 0.25, 'sine', 0.1, 600); },
    clang() { tone(1500, 0.08, 'square', 0.12, -400); tone(2200, 0.1, 'triangle', 0.08, -800); noise(0.05, 0.12, 4000); },
    whoosh() { noise(0.3, 0.16, 600); tone(200, 0.3, 'triangle', 0.08, 300); },
    flap() { noise(0.22, 0.14, 180); tone(70, 0.22, 'sine', 0.12, -30); },
    breath() { noise(1.5, 0.3, 250); tone(110, 1.4, 'sawtooth', 0.12, -40); noise(0.6, 0.2, 2500); },
    gun() { noise(0.06, 0.28, 1800); tone(240, 0.07, 'square', 0.16, -170); },
    gunheavy() { noise(0.18, 0.4, 500); tone(120, 0.2, 'sawtooth', 0.28, -80); tone(60, 0.25, 'sine', 0.3, -30); },
    shotgun() { noise(0.3, 0.5, 350); tone(90, 0.24, 'sawtooth', 0.3, -60); tone(160, 0.1, 'square', 0.12, -90); },
    rail() { tone(1500, 0.35, 'sawtooth', 0.14, -1300); noise(0.22, 0.2, 2500); tone(90, 0.3, 'sine', 0.26, -40); },
    laser() { tone(1900, 0.13, 'square', 0.09, -1400); tone(950, 0.11, 'sine', 0.07, -600); },
    reload() { tone(600, 0.04, 'square', 0.1); tone(420, 0.05, 'square', 0.1, 0, ac.currentTime + 0.1); },
    click() { tone(1300, 0.03, 'square', 0.08); tone(800, 0.04, 'square', 0.07, 0, ac.currentTime + 0.05); },
    bstep() { noise(0.13, 0.32, 70); tone(68, 0.16, 'sine', 0.28, -34); },
    rumble() { noise(0.8, 0.26, 55); tone(48, 0.8, 'sawtooth', 0.16, -14); },
    windy() { noise(0.9, 0.2, 450); tone(260, 0.9, 'triangle', 0.04, 220); },
    chime() { tone(880, 0.5, 'sine', 0.1); tone(1320, 0.5, 'sine', 0.06); },
    splash() { noise(0.4, 0.26, 700); tone(320, 0.22, 'sine', 0.1, -220); },
    bubbles() { for (let i = 0; i < 4; i++) tone(300 + Math.random() * 300, 0.07, 'sine', 0.05, 400, ac.currentTime + i * 0.05); },
    flame() { noise(0.4, 0.2, 700); tone(220, 0.4, 'sawtooth', 0.08, 120); }
  });
  function play(n) { if (!ac || !sfx[n]) return; const now = ac.currentTime; if (now - (lastT[n] || -1) < 0.03) return; lastT[n] = now; sfx[n](); }

  // ---------- voices: creature growls, hero grunts, NPC speech blips ----------
  function voice(o) {
    if (!ac) return;
    const t = ac.currentTime + (o.delay || 0), dur = o.dur || 0.3;
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'sawtooth';
    osc.frequency.setValueAtTime(o.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, o.f1 || o.f0), t + dur);
    if (o.wob) {
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = o.wobHz || 12; lg.gain.value = o.wob; lfo.connect(lg); lg.connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + Math.min(0.04, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    let out = g;
    if (o.lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.lp; g.connect(f); out = f; }
    osc.connect(g); out.connect(sfxG); osc.start(t); osc.stop(t + dur + 0.05);
    if (o.noise) noise(dur, o.noise, o.nHP || 600, t);
  }
  // base voice per creature: f = pitch, s = end pitch ratio, type, wob(depth, Hz), noise, dur, burst = rattles
  const CV = {
    slime: { f: 170, s: 0.6, type: 'sawtooth', wob: 40, wobHz: 18, noise: 0.05, dur: 0.38, vol: 0.14, lp: 700 },
    lavaslime: { f: 120, s: 0.6, type: 'sawtooth', wob: 35, wobHz: 14, noise: 0.08, dur: 0.4, vol: 0.14, lp: 600 },
    bat: { f: 1500, s: 0.6, type: 'square', wob: 120, wobHz: 32, dur: 0.22, vol: 0.07 },
    bee: { f: 230, s: 1, type: 'sawtooth', wob: 25, wobHz: 70, dur: 0.3, vol: 0.07 },
    vulture: { f: 800, s: 0.5, type: 'sawtooth', wob: 60, wobHz: 20, noise: 0.1, nHP: 1500, dur: 0.4, vol: 0.09 },
    spider: { f: 400, s: 0.7, type: 'sawtooth', noise: 0.22, nHP: 3200, dur: 0.38, vol: 0.04 },
    skel: { f: 130, s: 0.7, type: 'square', wob: 14, wobHz: 24, noise: 0.1, nHP: 2500, dur: 0.35, vol: 0.09, burst: 3 },
    scorp: { f: 900, s: 0.8, type: 'square', dur: 0.05, vol: 0.07, burst: 4 },
    snow: { f: 520, s: 0.8, type: 'triangle', wob: 110, wobHz: 14, dur: 0.45, vol: 0.12 },
    fire: { f: 210, s: 1.3, type: 'sawtooth', noise: 0.2, nHP: 1500, dur: 0.35, vol: 0.07 },
    ghost: { f: 430, s: 0.55, type: 'sine', wob: 70, wobHz: 6, dur: 0.85, vol: 0.14 },
    knight: { f: 95, s: 0.75, type: 'sawtooth', wob: 28, wobHz: 20, noise: 0.1, dur: 0.5, vol: 0.14, lp: 900 },
    beetle: { f: 4500, s: 1, type: 'square', dur: 0.04, vol: 0.03, burst: 4, noise: 0.15, nHP: 5000 },
    wisp: { f: 1300, s: 1.4, type: 'sine', dur: 0.35, vol: 0.07, wob: 40, wobHz: 12 },
    imp: { f: 650, s: 1, type: 'square', wob: 220, wobHz: 24, dur: 0.5, vol: 0.07 },
    shroom: { f: 240, s: 0.5, type: 'sine', noise: 0.15, nHP: 400, dur: 0.2, vol: 0.14 },
    zombie: { f: 105, s: 0.65, type: 'sawtooth', wob: 18, wobHz: 5, noise: 0.07, dur: 0.85, vol: 0.14, lp: 800 },
    blob: { f: 140, s: 2.2, type: 'sine', dur: 0.22, vol: 0.14 },
    b0: { f: 70, s: 0.6, type: 'sawtooth', wob: 30, wobHz: 12, noise: 0.15, dur: 1.0, vol: 0.22, lp: 500 },
    b1: { f: 500, s: 0.4, type: 'sawtooth', wob: 90, wobHz: 18, noise: 0.25, nHP: 2500, dur: 1.0, vol: 0.13 },
    b2: { f: 55, s: 0.8, type: 'square', wob: 12, wobHz: 10, noise: 0.35, nHP: 150, dur: 1.1, vol: 0.2, lp: 400 },
    b3: { f: 115, s: 0.65, type: 'sawtooth', wob: 40, wobHz: 7, noise: 0.12, dur: 1.1, vol: 0.2, lp: 700 },
    b4: { f: 170, s: 0.5, type: 'sawtooth', wob: 45, wobHz: 8, noise: 0.35, nHP: 800, dur: 1.2, vol: 0.18 },
    b5: { f: 60, s: 0.55, type: 'sawtooth', wob: 30, wobHz: 25, noise: 0.4, nHP: 100, dur: 1.2, vol: 0.24, lp: 450 },
    bdragon: { f: 52, s: 0.5, type: 'sawtooth', wob: 45, wobHz: 7, noise: 0.5, nHP: 90, dur: 1.6, vol: 0.34, lp: 460 },
    b7: { f: 48, s: 0.55, type: 'sawtooth', wob: 38, wobHz: 9, noise: 0.45, nHP: 90, dur: 1.5, vol: 0.3, lp: 420 },
    b6: { f: 75, s: 0.5, type: 'sawtooth', wob: 55, wobHz: 6, noise: 0.3, nHP: 300, dur: 1.5, vol: 0.24, lp: 650 }
  };
  const CMAP = { slime: 'slime', iceslime: 'slime', shadeslime: 'slime', lavaslime: 'lavaslime', bat: 'bat', icebat: 'bat', firebat: 'bat', bee: 'bee', vulture: 'vulture', spider: 'spider', cavespider: 'spider', mummy: 'skel', burnt: 'skel', shadowskel: 'skel', skeleton: 'skel', scorpion: 'scorp', snowman: 'snow', fire: 'fire', ghost: 'ghost', knight: 'knight', beetle: 'beetle', sandbeetle: 'beetle', wisp: 'wisp', shadewisp: 'wisp', imp: 'imp', shadeimp: 'imp', shroom: 'shroom', zombie: 'zombie', lavablob: 'blob' };
  const lastV = {};
  // evt: idle | alert | hurt | die | attack
  function creature(kind, evt, boss, volf, pit) {
    if (!ac) return;
    if (boss && (kind === 7 || kind === 8 || kind === 9)) { monster(kind, evt, volf); return; }
    const key = boss ? 'b' + kind : CMAP[kind];
    const b = CV[key]; if (!b) return;
    const now = ac.currentTime, lk = key + (evt === 'idle' ? 'i' : '');
    if (lastV[lk] && now - lastV[lk] < (evt === 'hurt' ? 0.12 : 0.35)) return;
    lastV[lk] = now;
    let f0 = b.f * (0.93 + Math.random() * 0.14) * (pit || 1), f1 = f0 * b.s, dur = b.dur, vol = b.vol * (volf === undefined ? 1 : volf) * 1.25;
    if (evt === 'hurt') { f0 *= 1.35; f1 = f0 * 0.7; dur *= 0.55; vol *= 1.1; }
    else if (evt === 'die') { f0 *= 0.95; f1 = f0 * 0.4; dur *= 1.7; vol *= 1.15; }
    else if (evt === 'alert') { f0 *= 1.1; dur *= 1.15; vol *= 1.15; }
    else if (evt === 'attack') { f0 *= 1.2; f1 = f0 * 0.8; dur *= 0.9; vol *= 1.1; }
    else if (evt === 'idle') { vol *= 0.9; dur *= 0.9; }
    if (b.burst) {
      const n = b.burst + (evt === 'die' ? 3 : 0);
      for (let i = 0; i < n; i++) voice({ f0: f0 * (1 + i * 0.03), f1: f0 * 0.9, type: b.type, dur: Math.max(0.04, dur / (b.dur < 0.1 ? 1 : n)), vol, noise: b.noise, nHP: b.nHP, delay: i * (b.dur < 0.1 ? 0.07 : 0.09), wob: b.wob, wobHz: b.wobHz });
      if (b.dur >= 0.1) voice({ f0: f0, f1: f1, type: 'sawtooth', dur: dur, vol: vol * 0.7, wob: b.wob, wobHz: b.wobHz, lp: 700 });
    } else voice({ f0, f1, type: b.type, dur, vol, wob: b.wob, wobHz: b.wobHz, noise: b.noise, nHP: b.nHP, lp: b.lp });
    if (boss && (evt === 'attack' || evt === 'alert')) voice({ f0: f0 * 0.5, f1: f1 * 0.5, type: 'square', dur: dur * 0.9, vol: vol * 0.6, lp: 300 });
  }
  const HV = {
    jump: () => voice({ f0: 330, f1: 520, type: 'triangle', dur: 0.1, vol: 0.09 }),
    djump: () => voice({ f0: 420, f1: 700, type: 'triangle', dur: 0.12, vol: 0.09 }),
    attack: () => { voice({ f0: 420, f1: 260, type: 'sawtooth', dur: 0.14, vol: 0.07, lp: 1500 }); noise(0.1, 0.1, 1500); },
    hurt: () => { voice({ f0: 360, f1: 170, type: 'sawtooth', dur: 0.26, vol: 0.14, wob: 18, wobHz: 22, lp: 1800 }); },
    die: () => { voice({ f0: 330, f1: 90, type: 'sawtooth', dur: 0.9, vol: 0.15, wob: 15, wobHz: 6, lp: 1200 }); },
    dash: () => { voice({ f0: 260, f1: 520, type: 'triangle', dur: 0.12, vol: 0.08 }); },
    cheer: () => { voice({ f0: 400, f1: 700, type: 'triangle', dur: 0.2, vol: 0.1 }); voice({ f0: 500, f1: 900, type: 'triangle', dur: 0.25, vol: 0.1, delay: 0.15 }); }
  };
  function whisper() {
    if (!ac) return;
    const t = ac.currentTime, src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 9;
    bp.frequency.setValueAtTime(500 + Math.random() * 500, t); bp.frequency.linearRampToValueAtTime(900 + Math.random() * 1100, t + 1.5);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.55); g.gain.exponentialRampToValueAtTime(0.001, t + 1.7);
    src.connect(bp); bp.connect(g); g.connect(sfxG); src.start(t, Math.random() * 0.5); src.stop(t + 1.8);
    voice({ f0: 105, f1: 66, type: 'sawtooth', dur: 1.6, vol: 0.05, wob: 18, wobHz: 5, lp: 380 });
  }
  function sting() { voice({ f0: 1900, f1: 520, type: 'square', dur: 0.28, vol: 0.05, wob: 160, wobHz: 38 }); voice({ f0: 300, f1: 120, type: 'sawtooth', dur: 0.4, vol: 0.08, lp: 600 }); }
  function hero(evt) { if (HV[evt]) HV[evt](); }
  // ---- Quoc the Devil: layered, distorted, echoing demon voice ----
  const devilFxs = new Map();   // one distortion chain per output bus (bosses get their own, so their loudness can be set after it)
  function getDevilFx() {
    if (devilFxs.has(sfxG)) return devilFxs.get(sfxG);
    const ws = ac.createWaveShaper(), n = 1024, cv = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; cv[i] = Math.tanh(x * 7) * 0.85; }
    ws.curve = cv; ws.oversample = '2x';
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 3;
    const dl = ac.createDelay(1); dl.delayTime.value = 0.21; const fb = ac.createGain(); fb.gain.value = 0.38; const wet = ac.createGain(); wet.gain.value = 0.5;
    const dry = ac.createGain(); dry.gain.value = 1;
    ws.connect(lp); lp.connect(dry); dry.connect(sfxG); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(sfxG);
    devilFxs.set(sfxG, ws); return ws;
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
  // horror voices for the deep bosses: 7 Morvella (wet hiss + gurgle), 8 Oktavor (abyssal growl + bubbles), 9 Vorgrub (grinding rumble + screech)
  function monster(kind, evt, volf) {
    if (!ac) return; const t = ac.currentTime, v = volf === undefined ? 1 : volf, long = evt === 'alert' || evt === 'roar', ws = getDevilFx();
    const dur = long ? 1.6 : (evt === 'attack' ? 0.7 : (evt === 'hurt' ? 0.22 : 0.5));
    const osc = (type, f0, f1, vol, wob, wobHz, d, dest, delay) => { const st = t + (delay || 0), o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, st); o.frequency.exponentialRampToValueAtTime(Math.max(18, f1), st + (d || dur));
      if (wob) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = wobHz; lg.gain.value = wob; l.connect(lg); lg.connect(o.frequency); l.start(st); l.stop(st + (d || dur) + 0.05); }
      g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(vol * v, st + Math.min(0.12, (d || dur) * 0.3)); g.gain.exponentialRampToValueAtTime(0.001, st + (d || dur));
      o.connect(g); g.connect(dest || ws); o.start(st); o.stop(st + (d || dur) + 0.05); };
    const bubbles = (n, f) => { for (let i = 0; i < n; i++) osc('sine', f * (0.8 + Math.random() * 0.8), f * 2.2, 0.05, 0, 0, 0.06, sfxG, i * (dur / n) + Math.random() * 0.05); };
    if (kind === 7) { noise(dur, 0.16 * v, 2500, t, sfxG); osc('sawtooth', 96, 60, 0.35, 9, 7); osc('triangle', 190, 140, 0.18, 30, 11); if (long || evt === 'attack') bubbles(long ? 14 : 6, 180); }
    else if (kind === 8) { osc('sawtooth', 44, 28, 0.55, 5, 4); osc('square', 88, 50, 0.3, 8, 6); osc('sine', 150, 70, 0.28, 0, 0, dur * 1.1, sfxG); noise(dur, 0.08 * v, 180, t, sfxG); bubbles(long ? 20 : 8, 120); }
    else { osc('sawtooth', 52, 34, 0.5, 22, 18); noise(dur, 0.2 * v, 90, t, sfxG); if (long || evt === 'attack') osc('sawtooth', 1100, 420, 0.12, 60, 23, dur * 0.7, ws, dur * 0.15); }
  }
  function devilRoar(power) {
    if (!ac) return; const p = power === undefined ? 1 : power;
    devilVoice(0.9 + p * 0.7, 0.8, 1.3); devilVoice(0.7 + p * 0.5, 1.15, 0.8);
    tone(70, 1.1, 'sine', 0.5 * p, -45, ac.currentTime, sfxG); whisper();
  }
  const NV = { ember: ['triangle', 420, 540, 0.05], sy: ['sawtooth', 150, 230, 0.06], hoang: ['square', 200, 290, 0.05], duong: ['triangle', 130, 190, 0.07], santree: ['sine', 300, 430, 0.07], dragon: ['sawtooth', 58, 96, 0.1], lyra: ['triangle', 1100, 1700, 0.07], shorty: ['square', 340, 470, 0.05], quan: ['triangle', 380, 500, 0.06], quoc: ['sawtooth', 62, 105, 0.1], lila: ['sine', 720, 980, 0.07], bram: ['square', 130, 190, 0.06], gob: ['sawtooth', 380, 620, 0.06], angel: ['sine', 880, 1320, 0.07], smith: ['square', 95, 135, 0.07], wizard: ['triangle', 280, 520, 0.09], fairy: ['sine', 1500, 2200, 0.05] };
  function blip(who) {
    if (!ac) return;
    if (who && who.indexOf('h_') === 0) who = 'ember';
    if (who === 'dragon_young') who = 'dragon';   // the young dragon on the meadow speaks with the dragon's voice
    if (who === 'quoc') { devilVoice(0.15, 0.85 + Math.random() * 0.5, 0.55); return; }
    const v = NV[who] || NV.lila, f = v[1] + Math.random() * (v[2] - v[1]);
    voice({ f0: f, f1: f * (0.92 + Math.random() * 0.2), type: v[0], dur: 0.07, vol: v[3], wob: who === 'wizard' ? 30 : 0, wobHz: 14, noise: who === 'gob' ? 0.04 : 0, nHP: 2000 });
    if (who === 'angel') voice({ f0: f * 1.5, f1: f * 1.5, type: 'sine', dur: 0.09, vol: 0.04 });
  }

  // ---------- music: chiptune EDM (4-on-the-floor, sidechain pump, build + drop) ----------
  function music(key, def) {
    if (!def) return;
    if (cin) cine(null, 0.8);   // a game track ends the film score
    if (key === curKey) return;
    cur = { key, def }; curKey = key;
    if (!ac) return;
    if (timer) clearInterval(timer);
    const r = mulberry32(def.seed || 1);
    // two 16-step lead phrases (A/B) for the drop
    cur.lead = [[], []]; const top = def.scale.length * 2 - 1;
    for (let ph = 0; ph < 2; ph++) {
      let deg = 3;
      for (let i = 0; i < 16; i++) {
        const on = i % 4 === 0 ? r() < 0.85 : r() < (def.density || 0.55) * 0.8;
        if (on) { deg = Math.max(0, Math.min(top, deg + Math.floor(r() * 5) - 2)); cur.lead[ph].push(deg); } else cur.lead[ph].push(null);
      }
    }
    const b0 = def.bpm;
    cur.bpm = b0 < 70 ? b0 + 32 : Math.max(124, Math.min(150, b0 + 28));
    cur.minor = !(def.scale.indexOf(4) >= 0 && def.scale.indexOf(3) < 0);
    step = 0; nextT = ac.currentTime + 0.1;
    timer = setInterval(sched, 50);
  }
  // ---------- ambience: a living soundscape for every land ----------
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
  function ambVol(v) { ambBase = v; if (ambG && ac) ambG.gain.setTargetAtTime(v * sVol, ac.currentTime, 0.5); }
  // footsteps that sound like the ground you run on
  function foot(kind) {
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
  function stop() { if (timer) clearInterval(timer); timer = null; curKey = ''; cur = null; }
  // phase 5 (D): footsteps by the surface under your feet, at the same level as the per-map steps above
  const SURF = {
    grass(r) { noise(0.06, 0.07 + r * 0.03, 1100, 0, sfxG); tone(110 + r * 30, 0.05, 'sine', 0.05, -30); },
    dirt(r) { noise(0.07, 0.075, 600, 0, sfxG); tone(90 + r * 20, 0.05, 'sine', 0.055, -25); },
    mud(r) { noise(0.09, 0.07, 450, 0, sfxG); tone(130 + r * 30, 0.07, 'sine', 0.05, -50); if (r < 0.3) tone(300 + r * 300, 0.05, 'sine', 0.02, 300); },
    stone(r) { tone(280 + r * 90, 0.035, 'square', 0.04, -80); noise(0.05, 0.06, 2400, 0, sfxG); },
    wood(r) { tone(190 + r * 30, 0.06, 'triangle', 0.08, -60); tone(380 + r * 40, 0.03, 'square', 0.02, -100); noise(0.03, 0.04, 1500, 0, sfxG); },
    metal(r) { tone(620 + r * 80, 0.07, 'square', 0.02, -150); tone(1240 + r * 100, 0.12, 'sine', 0.025); noise(0.03, 0.045, 3000, 0, sfxG); },
    sand(r) { noise(0.1, 0.055 + r * 0.01, 650, 0, sfxG); },
    snow() { noise(0.08, 0.1, 1800, 0, sfxG); noise(0.05, 0.06, 3600, ac.currentTime + 0.03, sfxG); },
    ice(r) { tone(1600 + r * 400, 0.03, 'sine', 0.03, -600); noise(0.04, 0.05, 3500, 0, sfxG); tone(220, 0.03, 'square', 0.025, -60); },
    water(r) { noise(0.12, 0.075, 700, 0, sfxG); tone(300 + r * 100, 0.08, 'sine', 0.035, 250); }
  };
  function surf(kind) { if (!ac) return; const f = SURF[kind]; if (f) f(Math.random()); }
  // small sounds near things in the world (played on the ambience bus): a torch, bubbling lava, wind up high
  function near(kind) {
    if (!ac || !ambG) return; const t = ac.currentTime;
    if (kind === 'torch') { for (let i = 0; i < 3; i++) noise(0.03, 0.03 + Math.random() * 0.02, 2600, t + Math.random() * 0.3, ambG); noise(0.4, 0.02, 500, t, ambG); }
    else if (kind === 'lava') { tone(120 + Math.random() * 80, 0.14, 'sine', 0.05, -60, t, ambG); noise(0.2, 0.04, 200, t + 0.05, ambG); }
    else if (kind === 'wind') { const s2 = ac.createBufferSource(); s2.buffer = noiseBuf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2; bp.frequency.setValueAtTime(300, t); bp.frequency.linearRampToValueAtTime(700, t + 1.2); bp.frequency.linearRampToValueAtTime(350, t + 2.4);
      const g2 = ac.createGain(); g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.07, t + 1); g2.gain.exponentialRampToValueAtTime(0.001, t + 2.5); s2.connect(bp); bp.connect(g2); g2.connect(ambG); s2.start(t, Math.random() * 0.4); s2.stop(t + 2.6); }
  }
  // ---------- cinematic score (intro / outro films): pads, piano, strings, taiko and brass instead of the EDM engine ----------
  let cin = null;
  const CINE = {   // chords as MIDI notes; bpm; layers
    sad: { bpm: 66, ch: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], pad: 0.05, piano: 0.5 },
    build: { bpm: 84, ch: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], pad: 0.06, piano: 0.35, str: 1, taiko: 1 },
    epic: { bpm: 96, ch: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]], pad: 0.07, str: 1, taiko: 2, brass: 1, choir: 1 },
    calm: { bpm: 70, ch: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]], pad: 0.05, bell: 1 }
  };
  function cineBus() {
    const g = ac.createGain(); g.gain.value = 0; g.connect(master);
    const dl = ac.createDelay(1), fb = ac.createGain(), wet = ac.createGain(), lp = ac.createBiquadFilter();   // a little room (feedback delay)
    dl.delayTime.value = 0.23; fb.gain.value = 0.38; wet.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2400;
    const inp = ac.createGain(); inp.connect(g); inp.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(wet); wet.connect(g);
    return { g, inp };
  }
  function padNote(f, t, dur, v, type, dest, att) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), gg = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = o2.type = type || 'triangle'; o.frequency.value = f; o2.frequency.value = f * 1.004; lp.type = 'lowpass'; lp.frequency.value = type === 'sawtooth' ? 1300 : 2600;
    const a = att || 0.6; gg.gain.setValueAtTime(0.0001, t); gg.gain.linearRampToValueAtTime(v, t + a); gg.gain.setValueAtTime(v, t + Math.max(a, dur - 0.5)); gg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
    o.connect(lp); o2.connect(lp); lp.connect(gg); gg.connect(dest); o.start(t); o2.start(t); o.stop(t + dur + 0.7); o2.stop(t + dur + 0.7);
  }
  function taiko(t, v, dest) { const o = ac.createOscillator(), gg = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.35); gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.001, t + 0.6); o.connect(gg); gg.connect(dest); o.start(t); o.stop(t + 0.65); noise(0.08, v * 0.25, 400, t, dest); }
  function cineStep() {
    if (!ac || !cin) return; const d = CINE[cin.mode];
    while (cin.next < ac.currentTime + 0.3) {
      const t = cin.next, st = cin.step, spb = 60 / d.bpm / 2, bar = Math.floor(st / 8), s = st % 8, ch = d.ch[bar % d.ch.length], D = cin.inp;
      if (s === 0) { for (const n of ch) padNote(mtof(n - 12), t, spb * 8, d.pad, 'triangle', D); padNote(mtof(ch[0] - 24), t, spb * 8, d.pad * 1.3, 'sine', D); }
      if (d.choir && s === 0) for (const n of ch) padNote(mtof(n), t, spb * 8, 0.025, 'sine', D, 0.3);
      if (d.piano && (s === 0 || s === 3 || s === 5 || (s === 6 && bar % 2))) { const n = ch[(s + bar) % 3] + (s === 5 ? 12 : 0); tone(mtof(n), 1.6, 'sine', 0.09 * d.piano, 0, t, D); tone(mtof(n) * 2, 0.6, 'sine', 0.02 * d.piano, 0, t, D); }
      if (d.str) { const n = ch[0] - 12; tone(mtof(n), spb * 0.9, 'sawtooth', 0.05, 0, t, D); if (d.str && s % 2) tone(mtof(n + 12), spb * 0.8, 'sawtooth', 0.03, 0, t, D); }
      if (d.taiko && (s === 0 || (d.taiko > 1 && s === 4) || (bar % 2 === 1 && (s === 6 || s === 7)))) taiko(t, s === 0 ? 0.55 : 0.35, D);
      if (d.brass && (s === 0 || s === 4)) for (const n of ch) padNote(mtof(n), t, spb * 3.6, 0.04, 'sawtooth', D, 0.08);
      if (d.brass && s === 0) noise(1.2, 0.12, 5000, t, D);
      if (d.bell && (s === 0 || s === 4 || (s === 6 && bar % 2 === 0))) { const n = ch[(bar + s) % 3] + 12; tone(mtof(n), 2.4, 'sine', 0.06, 0, t, D); tone(mtof(n) * 2.01, 1.2, 'sine', 0.018, 0, t, D); }
      cin.next += spb; cin.step++;
    }
  }
  // cine('sad' | 'build' | 'epic' | 'calm') switches the film score; cine(null) fades it out (silence)
  function cine(mode, fadeS) {
    if (!ac) init(); if (!ac) return;
    if (cin && cin.mode === mode) return;
    const f = fadeS === undefined ? 1.2 : fadeS, now = ac.currentTime;
    if (cin) { const o = cin; clearInterval(o.timer); o.g.gain.cancelScheduledValues(now); o.g.gain.setValueAtTime(o.g.gain.value, now); o.g.gain.linearRampToValueAtTime(0, now + Math.max(0.05, f)); setTimeout(() => { try { o.g.disconnect(); } catch (e) { } }, f * 1000 + 3000); cin = null; }
    if (!mode) return;
    stop(); const b = cineBus(); b.g.gain.linearRampToValueAtTime(0.9, now + Math.max(0.05, f));
    cin = { mode, g: b.g, inp: b.inp, step: 0, next: now + 0.05, timer: setInterval(cineStep, 50) }; cineStep();
  }
  // one-shot film hits: taiko, the parry ring, the bass drop
  function cineHit(k) {
    if (!ac) return; const t = ac.currentTime;
    if (k === 'taiko') taiko(t, 0.8, sfxG);
    if (k === 'parry') { tone(1800, 0.9, 'triangle', 0.18, -200, t); tone(2700, 0.6, 'sine', 0.1, 0, t); tone(950, 1.2, 'square', 0.05, -100, t); noise(0.15, 0.4, 3000, t, sfxG); }
    if (k === 'drop') { tone(80, 2.6, 'sine', 0.95, -50, t); tone(40, 3, 'sine', 0.7, -10, t); noise(0.6, 0.3, 60, t, sfxG); }
    if (k === 'roar') { tone(110, 1.4, 'sawtooth', 0.25, -60, t); tone(73, 1.6, 'sawtooth', 0.22, -30, t); noise(1.2, 0.25, 300, t, sfxG); }
    if (k === 'rise') { tone(220, 2.4, 'sawtooth', 0.06, 660, t); noise(2.4, 0.08, 2000, t, sfxG); }
    if (k === 'shimmer') for (let i = 0; i < 8; i++) tone(1200 + i * 220, 0.5, 'sine', 0.04, 0, t + i * 0.07);
  }
  // signature layers for the boss themes (phase 4): one instrument that gives each fight its own colour
  const SIG = {
    bubbles(s, sec, b, r, t, spb) { if (s % 8 === 3) { tone(300 + (b % 4) * 40, 0.08, 'sine', 0.08, 400, t, musicG); tone(420, 0.06, 'sine', 0.05, 300, t + spb, musicG); } },
    whisper(s, sec, b, r, t) { if (s === 10 && b % 2 === 0) noise(0.5, 0.05, 1800, t, musicG); },
    glass(s, sec, b, r, t, spb) { if (s % 8 === 0) bell(mtof(r + 24 + (s === 8 ? 7 : 0)), spb * 10, 0.05, t, musicG); },
    jingle(s, sec, b, r, t) { if (s % 4 === 3) { tone(2600, 0.05, 'square', 0.015, 0, t, musicG); tone(3100, 0.05, 'square', 0.012, 0, t + 0.03, musicG); } },
    musicbox(s, sec, b, r, t, spb, drop, intro) { const n = [0, 7, 12, 15, 19, 15, 12, 7]; if (s % 2 === 0) bell(mtof(r + 24 + n[(s / 2 + b) % 8]), spb * 4, intro ? 0.035 : 0.025, t, musicG); },
    anvil(s, sec, b, r, t) { if (s === 4 || s === 12) clang(880, 0.05, t, musicG); },
    choir(s, sec, b, r, t, spb) { if (s === 0) for (const iv of [0, 3, 7]) pad(mtof(r + 12 + iv), spb * 15, 0.05, spb * 4, 'triangle', t, musicG); },
    lullaby(s, sec, b, r, t, spb) { const m = [7, 3, 0, 3, 5, 3, 2, 0]; if (s % 4 === 0) pad(mtof(r + 24 + m[(s / 4 + b * 4) % 8]), spb * 4, 0.06, 0.05, 'sine', t, musicG); },
    sonar(s, sec, b, r, t) { if (s === 0 && b % 2 === 0) { tone(1100, 0.6, 'sine', 0.05, 0, t, musicG); tone(1100, 0.5, 'sine', 0.02, 0, t + 0.4, musicG); } },
    taiko(s, sec, b, r, t) { if (s === 0 || s === 6 || s === 10) taiko(t, s === 0 ? 0.5 : 0.35, musicG); },
    waltz(s, sec, b, r, t, spb) { if (s % 6 === 0) tone(mtof(r - 12), spb * 2, 'triangle', 0.12, 0, t, musicG); else if (s % 6 === 2 || s % 6 === 4) tone(mtof(r + 7), spb, 'square', 0.03, 0, t, musicG); },
    lab(s, sec, b, r, t, spb) { if (s % 8 === 4) { bell(mtof(r + 26), spb * 6, 0.03, t, musicG); bell(mtof(r + 32), spb * 6, 0.02, t + spb, musicG); } },
    brass(s, sec, b, r, t, spb, drop) { if (drop && (s === 0 || s === 10)) for (const iv of [0, 7, 12]) pad(mtof(r + iv), spb * 3, 0.05, 0.03, 'sawtooth', t, musicG); },
    chains(s, sec, b, r, t) { if (s === 14) for (let i = 0; i < 3; i++) tone(1300 + i * 220, 0.06, 'square', 0.015, -200, t + i * 0.03, musicG); },
    heart(s, sec, b, r, t, spb) { if (s === 0 || s === 8) { tone(62, 0.18, 'sine', 0.4, -20, t, musicG); tone(55, 0.22, 'sine', 0.3, -18, t + spb, musicG); } },
    flames(s, sec, b, r, t) { if (s % 4 === 1) noise(0.15, 0.04, 900, t, musicG); }
  };
  function sched() {
    if (!ac || !cur) return;
    const spb = 60 / cur.bpm / 4;
    while (nextT < ac.currentTime + 0.25) { playStep(step, nextT, spb); nextT += spb; step++; }
  }
  function kick(t, spb) {
    tone(165, 0.16, 'sine', 0.95, -125, t, musicG); tone(60, 0.22, 'sine', 0.8, -20, t, musicG); noise(0.02, 0.12, 3000, t, musicG);
    const g = duck.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.28, t); g.linearRampToValueAtTime(1, t + spb * 3.2);
  }
  function playStep(st, t, spb) {
    const d = cur.def, s = st % 16, barN = Math.floor(st / 16), bar = barN % d.prog.length, sec = barN % 16;
    const root = d.root + d.prog[bar], sc = d.scale;
    const drop = sec >= 8, build = sec >= 4 && sec < 8, intro = sec < 4;
    const third = cur.minor ? 3 : 4;
    const lastBar = sec === 7;
    // ---- drums ---- (a theme can drop them: Quoc's lonely form)
    if (!d.nodrums) {
    const noKick = lastBar && s >= 12;
    if (s % 4 === 0 && !noKick) kick(t, spb);
    if (lastBar && s >= 8 && s % 2 === 0) kick(t, spb);               // pre-drop kick roll
    if (!intro && (s === 4 || s === 12)) { noise(0.16, 0.26, 1400, t, musicG); tone(190, 0.08, 'square', 0.08, -80, t, musicG); }
    if (s % 4 === 2) noise(0.07, drop ? 0.2 : 0.14, 7000, t, musicG);  // off-beat hat
    if (drop && s % 2 === 1) noise(0.025, 0.07, 9000, t, musicG);       // 16th hats
    if (lastBar && s >= 8) { const k = 1 + (s - 8) / 8; noise(0.06, 0.1 * k, 2200 - 0, t, musicG); } // snare roll
    if (sec === 8 && s === 0) { noise(1.1, 0.35, 3500, t, musicG); tone(70, 0.6, 'sine', 0.9, -30, t, musicG); } // crash
    if (sec === 0 && s === 0 && barN > 0) noise(0.8, 0.2, 4500, t, musicG);
    }
    // ---- bass: off-beat saw pumps + sub on the beat ----
    if (s % 4 === 2) tone(mtof(root - 24), spb * 3, 'sawtooth', drop ? 0.55 : 0.4, 0, t, bassBus);
    if (s % 4 === 0 && drop) tone(mtof(root - 36), spb * 2, 'sine', 0.55, 0, t, bassBus);
    if (!drop && s % 8 === 0) tone(mtof(root - 36), spb * 5, 'sine', 0.5, 0, t, bassBus);
    // ---- arp (16ths) ----
    if (!intro || sec >= 2) {
      const notes = [0, third, 7, 12, 7, third];
      tone(mtof(root + 12 + notes[(s + bar) % notes.length] + (s % 8 >= 4 ? 12 : 0)), spb * 1.4, 'square', build ? 0.07 : 0.055, 0, t, leadBus);
    }
    // ---- supersaw chord stabs in drop, soft pad in build ----
    if (drop && [0, 3, 6, 10, 12].indexOf(s) >= 0) {
      for (const iv of [0, third, 7, 12]) tone(mtof(root + iv), spb * 2.4, 'sawtooth', 0.075, 0, t, chordBus);
      for (const iv of [0, third, 7]) { const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = mtof(root + iv) * 1.006; gn.gain.setValueAtTime(0.06, t); gn.gain.exponentialRampToValueAtTime(0.001, t + spb * 2.4); o.connect(gn); gn.connect(chordBus); o.start(t); o.stop(t + spb * 2.5); }
    } else if (build && s === 0) {
      for (const iv of [0, third, 7]) tone(mtof(root + iv), spb * 14, 'triangle', 0.12, 0, t, chordBus);
    }
    // ---- lead melody ----
    if (drop || sec >= 6) {
      const ph = cur.lead[(sec >= 12 ? 1 : 0)], ld = ph[s];
      if (ld !== null && ld !== undefined) {
        const oct = Math.floor(ld / sc.length), n = root + 12 + sc[ld % sc.length] + oct * 12;
        tone(mtof(n), spb * 2.2, d.wave === 'triangle' ? 'square' : (d.wave || 'square'), drop ? 0.12 : 0.07, 0, t, leadBus);
        if (drop) tone(mtof(n) * 1.005, spb * 2.2, 'square', 0.05, 0, t, leadBus);
      }
    }
    if (d.sig) for (const k of [].concat(d.sig)) if (SIG[k]) SIG[k](s, sec, barN, root, t, spb, drop, intro);
    // ---- riser in the last two bars of the build ----
    if (sec === 7 && s === 0) { const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(2400, t + spb * 16); gn.gain.setValueAtTime(0.02, t); gn.gain.linearRampToValueAtTime(0.12, t + spb * 16); o.connect(gn); gn.connect(leadBus); o.start(t); o.stop(t + spb * 16 + 0.05); }
  }

  // ---------- phase 4: a sound identity for every boss, boss form, dragon and summon ----------
  // Each boss id (b0-b9 main bosses, quoc0-7, shorty0-1, sy0-1) has a material that colours its voice, its footsteps
  // and every skill (on top of the shared skill sound). Everything of one id goes through its own gain bus, so the
  // loudness of each boss is balanced in one place (BAL, measured with meter()).
  // gains measured with meter() on 2026-10-21: every boss's roar peaks at about -14 dBFS on the effects bus (Quoc's last form -12.7)
  const BAL = { b0: 1.77, b1: 2.36, b2: 4.41, b3: 2.09, b4: 1.61, b5: 1.39, b6: 1, b7: 0.59, b8: 0.49, b9: 0.54, quoc0: 0.52, quoc1: 0.51, quoc2: 0.49, quoc3: 0.51, quoc4: 2.76, quoc5: 0.49, quoc6: 0.51, quoc7: 0.48,
    shorty0: 7.61, shorty1: 3, sy0: 2.79, sy1: 3.84, dragon0: 1.08, dragon1: 0.9, dragon2: 1.07, dragon3: 0.91, sum: 2.0 };   // summons sit about 12 dB under a boss's roar
  const busC = {};
  // skill layers and footsteps have their own gain per role (KG), so a quiet material and a loud one sit at the same level:
  // skills about 7 dB under the shared skill sound, footsteps lower still
  const KG = {   // measured with meter() on 2026-10-21 (3 passes): skills about -24 dBFS, footsteps about -30
    b0: { hit: 0.44, cast: 0.95, area: 0.8, vanish: 0.92, guard: 0.83, call: 0.83, step: 1.29 },
    b1: { hit: 4.91, cast: 1.41, area: 4.88, vanish: 3.83, guard: 4.9, call: 4.86, step: 2.76 },
    b2: { hit: 0.3, cast: 0.31, area: 0.3, vanish: 0.31, guard: 0.3, call: 0.3, step: 0.56 },
    b3: { hit: 3.23, cast: 0.96, area: 3.28, vanish: 3.15, guard: 3.27, call: 3.66, step: 0.89 },
    b4: { hit: 1.39, cast: 4.41, area: 4.46, vanish: 4.24, guard: 4.05, call: 4.19, step: 1.07 },
    b5: { hit: 0.44, cast: 1.16, area: 1.13, vanish: 1.65, guard: 1.64, call: 1.64, step: 1.01 },
    b7: { hit: 5.49, cast: 5.4, area: 6.29, vanish: 5.48, guard: 5.34, call: 5.54, step: 5.79 },
    b8: { hit: 3.29, cast: 2.92, area: 2.87, vanish: 3.13, guard: 3.15, call: 2.94, step: 2.75 },
    b9: { hit: 2.68, cast: 2.91, area: 2.88, vanish: 2.63, guard: 2.64, call: 2.93, step: 1.19 },
    quoc0: { hit: 10.65, cast: 6.67, area: 6.86, vanish: 6.21, guard: 6.22, call: 6.22, step: 7.34 },
    quoc1: { hit: 3.64, cast: 3.19, area: 3.64, vanish: 3.19, guard: 3.64, call: 3.19, step: 12 },
    quoc2: { hit: 5.8, cast: 5.89, area: 5.96, vanish: 5.97, guard: 6, call: 5.19, step: 5.98 },
    quoc3: { hit: 2.74, cast: 12, area: 12, vanish: 12, guard: 12, call: 12, step: 1.67 },
    quoc4: { hit: 1.08, cast: 1.08, area: 2.84, vanish: 2.32, guard: 2.39, call: 2.32, step: 1.58 },
    quoc5: { hit: 10.07, cast: 12, area: 9.94, vanish: 9.81, guard: 9.89, call: 9.88, step: 1.42 },
    quoc6: { hit: 7.41, cast: 5.45, area: 7.19, vanish: 4.86, guard: 5.49, call: 4.87, step: 3.85 },
    quoc7: { hit: 2.57, cast: 2.57, area: 3.38, vanish: 2.57, guard: 2.57, call: 2.57, step: 2.02 },
    shorty0: { hit: 2.26, cast: 1.64, area: 1.64, vanish: 1.64, guard: 1.98, call: 2.26, step: 0.87 },
    shorty1: { hit: 1.68, cast: 5.44, area: 5.44, vanish: 5.44, guard: 6.98, call: 5.44, step: 0.26 },
    sy0: { hit: 0.64, cast: 0.74, area: 0.74, vanish: 0.64, guard: 0.64, call: 0.76, step: 0.26 },
    sy1: { hit: 1.43, cast: 1.59, area: 1.31, vanish: 1.45, guard: 1.53, call: 1.39, step: 2.5 }
  };
  const busGain = key => { const [id, r] = key.split(':'); return (BAL[id] || 1) * (r ? ((KG[id] || {})[r] || 1) : 1); };
  function bus(key) { if (!busC[key]) { const g = ac.createGain(); g.gain.value = busGain(key); g.connect(sfxG); busC[key] = g; } return busC[key]; }
  function into(id, fn) { if (!ac) return; const b = bus(id), keep = sfxG; sfxG = b; try { fn(); } finally { sfxG = keep; } }   // tone/noise/voice read sfxG when they run
  const now = () => ac.currentTime;
  function pad(f, dur, v, att, type, when, dest) {   // a note that swells in (choirs, drones)
    const t = when || now(), o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (att || 0.2)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + dur + 0.05);
  }
  function bell(f, dur, v, when, dest) { tone(f, dur, 'sine', v, 0, when, dest); tone(f * 2.76, dur * 0.6, 'sine', v * 0.4, 0, when, dest); tone(f * 5.4, dur * 0.3, 'sine', v * 0.18, 0, when, dest); }
  function clang(f, v, when, dest) { tone(f, 0.5, 'square', v * 0.35, -f * 0.05, when, dest); bell(f * 1.5, 0.7, v * 0.6, when, dest); noise(0.04, v * 0.7, 4000, when, dest); }
  function crackle(n, v, dur, when) { const t = when || now(); for (let i = 0; i < n; i++) noise(0.02, v * (0.5 + Math.random() * 0.5), 3000, t + Math.random() * dur); }
  function bubbles(n, f, v, when) { const t = when || now(); for (let i = 0; i < n; i++) tone(f * (0.8 + Math.random() * 0.8), 0.07, 'sine', v, f * 1.4, t + i * 0.06 + Math.random() * 0.03); }
  function hissB(dur, v, f, when) {   // band-passed noise that swells and fades: sand, whispers, snakes, steel
    const t = when || now(), s = ac.createBufferSource(); s.buffer = noiseBuf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f || 3000; bp.Q.value = 1.5;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.08, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(sfxG); s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.05);
  }
  function rise(dur, v, f0, f1, when) {   // a whoosh whose pitch sweeps from f0 to f1
    const t = when || now(), s = ac.createBufferSource(); s.buffer = noiseBuf; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 4; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(sfxG); s.start(t); s.stop(t + dur + 0.05);
  }
  function heartbeat(v, when) { const t = when || now(); tone(62, 0.18, 'sine', v, -20, t); tone(55, 0.22, 'sine', v * 0.8, -18, t + 0.24); }
  function choir(root, dur, v) { for (const [iv, d] of [[0, 1], [3, 1.004], [7, 0.996], [12, 1.002]]) pad(mtof(root + iv) * d, dur, v, dur * 0.3, 'triangle'); }
  function growl(f, dur, v, wob) { voice({ f0: f, f1: f * 0.7, type: 'sawtooth', dur, vol: v, wob: wob || 25, wobHz: 18, lp: 900, noise: v * 0.4, nHP: 300 }); }
  function wet(v) { noise(0.3, v, 700); tone(320, 0.22, 'sine', v * 0.5, -200); bubbles(3, 260, v * 0.25); }

  // material layers: role = hit | cast | area | vanish | guard | call | step | alert | attack | hurt | die
  const MAT = {
    slime(r, v) {
      if (r === 'step') { noise(0.08, 0.1 * v, 900); tone(140, 0.08, 'sine', 0.09 * v, -60); }
      else if (r === 'hit') { wet(0.22 * v); tone(90, 0.3, 'sine', 0.3 * v, -40); }
      else if (r === 'die') { noise(1.4, 0.12 * v, 1200); bubbles(10, 200, 0.06 * v); }
      else { wet(0.16 * v); bubbles(r === 'alert' ? 8 : 4, 220, 0.06 * v); }
    },
    silk(r, v) {
      if (r === 'step') { for (let i = 0; i < 3; i++) tone(2400 + Math.random() * 600, 0.02, 'square', 0.025 * v, 0, now() + i * 0.04); }
      else if (r === 'cast') { tone(900, 0.25, 'triangle', 0.08 * v, 900); noise(0.15, 0.08 * v, 2500); }
      else if (r === 'vanish' || r === 'alert' || r === 'die') { hissB(r === 'alert' ? 1.2 : 0.7, 0.14 * v, 900 + Math.random() * 700); hissB(0.6, 0.1 * v, 1800, now() + 0.2); }
      else { for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 900, 0.025, 'square', 0.03 * v, 0, now() + i * 0.035); }
    },
    glass(r, v) {   // Prismor has no mouth: it rings instead of roaring
      const f = 520 + Math.random() * 300;
      if (r === 'step') { noise(0.08, 0.12 * v, 90); tone(1800, 0.12, 'sine', 0.03 * v); }
      else if (r === 'hurt' || r === 'hit') { noise(0.18, 0.16 * v, 3500); bell(f * 1.3, 0.6, 0.1 * v); }
      else if (r === 'die') { for (let i = 0; i < 6; i++) { noise(0.12, 0.12 * v, 3000, now() + i * 0.09); bell(400 + Math.random() * 900, 1.0, 0.06 * v, now() + i * 0.09); } }
      else { bell(f, 1.4, 0.12 * v); bell(f * 1.5, 1.2, 0.07 * v, now() + 0.08); if (r === 'cast') tone(140, 0.6, 'sawtooth', 0.05 * v, 0); }
    },
    sand(r, v) {
      if (r === 'step') noise(0.14, 0.07 * v, 600);
      else if (r === 'alert' || r === 'die') { voice({ f0: 140, f1: 90, type: 'triangle', dur: r === 'die' ? 2.2 : 1.1, vol: 0.12 * v, wob: 6, wobHz: 3, noise: 0.06 * v, nHP: 2000 }); hissB(r === 'die' ? 2.4 : 1.2, 0.08 * v, 2600); }
      else if (r === 'cast') { tone(85, 0.6, 'sine', 0.1 * v); hissB(0.6, 0.1 * v, 3200); voice({ f0: 260, f1: 240, type: 'square', dur: 0.4, vol: 0.03 * v, wob: 40, wobHz: 60 }); }
      else hissB(0.7, 0.12 * v, 2200);
    },
    ice(r, v) {
      if (r === 'step') { noise(0.07, 0.1 * v, 1800); noise(0.04, 0.06 * v, 3800, now() + 0.03); }
      else if (r === 'hit' || r === 'hurt') { noise(0.14, 0.14 * v, 3500); tone(2400, 0.2, 'sine', 0.05 * v, -1800); }
      else if (r === 'alert' || r === 'die') { voice({ f0: 95, f1: 70, type: 'sawtooth', dur: 1.2, vol: 0.06 * v, lp: 600, wob: 4, wobHz: 4 }); voice({ f0: 95, f1: 70, type: 'sawtooth', dur: 1.2, vol: 0.03 * v, lp: 600, delay: 0.25 }); for (let i = 0; i < 5; i++) tone(1800 + Math.random() * 1600, 0.6, 'sine', 0.02 * v, 0, now() + i * 0.1); }
      else { rise(0.7, 0.12 * v, 500, 2600); for (let i = 0; i < 4; i++) tone(2000 + Math.random() * 1500, 0.4, 'sine', 0.025 * v, 0, now() + 0.1 + i * 0.08); }
    },
    forge(r, v) {
      if (r === 'step') { noise(0.1, 0.14 * v, 70); clang(620, 0.05 * v); }
      else if (r === 'hit') clang(440, 0.22 * v);
      else if (r === 'alert' || r === 'die') { noise(0.5, 0.2 * v, 150); noise(0.5, 0.18 * v, 180, now() + 0.55); clang(330, 0.15 * v, now() + 0.2); if (r === 'die') hissB(1.8, 0.14 * v, 4000, now() + 0.5); }
      else if (r === 'area' || r === 'cast') { noise(0.6, 0.14 * v, 300); tone(110, 0.5, 'sawtooth', 0.08 * v, 60); bubbles(4, 120, 0.05 * v); }
      else clang(520, 0.1 * v);
    },
    spore(r, v) {
      if (r === 'step') bubbles(2, 180, 0.04 * v);
      else if (r === 'alert') [0, 3, 7, 3].forEach((iv, i) => pad(mtof(64 + iv), 0.7, 0.06 * v, 0.1, 'sine', now() + i * 0.35));   // her lullaby
      else { noise(0.25, 0.08 * v, 800); bubbles(3, 300, 0.04 * v); }
    },
    water(r, v) {
      if (r === 'step') { noise(0.3, 0.06 * v, 120); tone(70, 0.3, 'sine', 0.05 * v, -15); }
      else if (r === 'alert') { tone(1100, 0.6, 'sine', 0.04 * v); bubbles(8, 140, 0.05 * v); }
      else { noise(0.45, 0.14 * v, 500); tone(260, 0.3, 'sine', 0.08 * v, -180); bubbles(4, 160, 0.05 * v); }
    },
    earth(r, v) {
      if (r === 'step') { noise(0.25, 0.12 * v, 55); tone(48, 0.25, 'sine', 0.1 * v, -10); }
      else { noise(0.7, 0.16 * v, 60); for (let i = 0; i < 5; i++) noise(0.05, 0.08 * v, 600 + Math.random() * 900, now() + 0.1 + i * 0.07); }
    },
    steel(r, v) {
      if (r === 'step') { noise(0.06, 0.1 * v, 120); tone(260, 0.04, 'square', 0.03 * v, -60); }
      else if (r === 'hit' || r === 'cast') { hissB(0.25, 0.12 * v, 5200); tone(1600, 0.3, 'sawtooth', 0.04 * v, -900); }
      else if (r === 'alert') voice({ f0: 160, f1: 110, type: 'sawtooth', dur: 0.4, vol: 0.08 * v, lp: 900 });
      else if (r === 'die') { for (let i = 0; i < 3; i++) clang(900 - i * 150, 0.07 * v, now() + i * 0.18); }
      else clang(800, 0.07 * v);
    },
    shadow(r, v) {
      if (r === 'step') rise(0.25, 0.05 * v, 300, 900);
      else if (r === 'alert' || r === 'hurt' || r === 'die') { const d = r === 'die' ? 1.6 : 0.8; for (let i = 0; i < 3; i++) voice({ f0: 760 - i * 40, f1: 520, type: 'sine', dur: d / 3, vol: 0.06 * v, wob: 50, wobHz: 7, delay: i * d / 3, lp: 1800 }); }   // a muffled sob
      else { rise(0.5, 0.12 * v, 200, 1400); tone(80, 0.5, 'sine', 0.12 * v, -30); }
    },
    hound(r, v) {
      if (r === 'step') { noise(0.04, 0.08 * v, 800); noise(0.04, 0.06 * v, 800, now() + 0.07); tone(1800 + Math.random() * 400, 0.04, 'triangle', 0.02 * v, 0, now() + 0.03); }
      else if (r === 'alert') { growl(120, 0.6, 0.14 * v); voice({ f0: 420, f1: 620, type: 'sawtooth', dur: 0.9, vol: 0.07 * v, lp: 1400, wob: 12, wobHz: 6, delay: 0.55 }); }
      else if (r === 'hurt') voice({ f0: 900, f1: 500, type: 'sawtooth', dur: 0.25, vol: 0.08 * v, lp: 1600 });
      else { growl(140, 0.35, 0.12 * v); noise(0.05, 0.12 * v, 2500, now() + 0.2); }
    },
    chain(r, v) {
      const rat = n => { for (let i = 0; i < n; i++) tone(1100 + Math.random() * 900, 0.08, 'square', 0.03 * v, -200, now() + i * 0.05 + Math.random() * 0.02); };
      if (r === 'step') { noise(0.14, 0.16 * v, 65); rat(3); }
      else if (r === 'alert') { growl(80, 0.9, 0.16 * v, 15); rat(8); }
      else { rat(6); if (r === 'hit') noise(0.3, 0.2 * v, 70); }
    },
    hollow(r, v) {   // an empty suit of armour: wind instead of a voice
      const wind = d => rise(d, 0.35 * v, 300, 900);
      if (r === 'step') { tone(330, 0.05, 'square', 0.03 * v, -80); tone(250, 0.05, 'square', 0.03 * v, -60, now() + 0.06); }
      else if (r === 'alert' || r === 'die' || r === 'hurt') { wind(r === 'hurt' ? 0.4 : 1.4); rise(1.2, 0.5 * v, 200, 600, now() + 0.15); bell(180, 1.2, 0.2 * v); }
      else if (r === 'hit' || r === 'cast') { tone(1300, 0.9, 'sine', 0.06 * v); hissB(0.3, 0.1 * v, 5000); }
      else wind(0.8);
    },
    wings(r, v) {
      if (r === 'step') { noise(0.2, 0.12 * v, 180); tone(70, 0.2, 'sine', 0.1 * v, -30); }
      else if (r === 'alert' || r === 'hurt') { growl(150, 0.5, 0.12 * v); voice({ f0: 300, f1: 200, type: 'sawtooth', dur: 0.3, vol: 0.05 * v, lp: 1000, noise: 0.05, delay: 0.45 }); }
      else { rise(0.4, 0.12 * v, 400, 3000); noise(0.3, 0.06 * v, 3000, now() + 0.1); }
    },
    ash(r, v) {
      if (r === 'step') { noise(0.12, 0.1 * v, 200); crackle(3, 0.04 * v, 0.2); }
      else if (r === 'area' || r === 'hit') { for (let i = 0; i < 9; i++) noise(0.18, 0.08 * v, 600, now() + i * 0.08); crackle(10, 0.05 * v, 0.9); }
      else { crackle(8, 0.05 * v, 0.7); noise(0.4, 0.1 * v, 500); }
    },
    eclipse(r, v) {
      if (r === 'step') tone(45, 0.4, 'sine', 0.08 * v, -5);
      else if (r === 'alert' || r === 'die') { choir(r === 'die' ? 45 : 50, 2.2, 0.035 * v); heartbeat(0.25 * v, now() + 0.2); }
      else { heartbeat(0.22 * v); rise(0.5, 0.08 * v, 150, 900, now() + 0.35); }
    },
    butler(r, v) {
      if (r === 'step') { tone(950, 0.03, 'square', 0.03 * v); tone(700, 0.03, 'square', 0.025 * v, 0, now() + 0.09); }
      else if (r === 'alert' || r === 'hurt') { for (let i = 0; i < 5; i++) voice({ f0: 820 + i * 30, f1: 700, type: 'square', dur: 0.06, vol: 0.16 * v, delay: i * 0.08 }); }   // a polite giggle
      else if (r === 'die') voice({ f0: 500, f1: 120, type: 'square', dur: 1.2, vol: 0.06 * v, wob: 30, wobHz: 9 });
      else { rise(0.3, 0.1 * v, 600, 2500); tone(1200, 0.05, 'triangle', 0.04 * v); }
    },
    fiend(r, v) {
      if (r === 'step') { noise(0.12, 0.14 * v, 80); tone(80, 0.12, 'sine', 0.1 * v, -30); }
      else if (r === 'alert') { for (let i = 0; i < 4; i++) voice({ f0: 560 - i * 60, f1: 380, type: 'square', dur: 0.08, vol: 0.12 * v, delay: i * 0.09 }); growl(110, 0.8, 0.3 * v); }
      else if (r === 'hit') { noise(0.06, 0.14 * v, 3000); tone(700, 0.08, 'square', 0.06 * v, -400); }
      else rise(0.35, 0.12 * v, 300, 1800);
    },
    bottle(r, v) {
      const clink = w => bell(1700 + Math.random() * 600, 0.25, 0.12 * v, w);
      if (r === 'step') { tone(500, 0.03, 'square', 0.02 * v); clink(now() + 0.02); }
      else if (r === 'alert') { voice({ f0: 190, f1: 170, type: 'triangle', dur: 0.5, vol: 0.3 * v, wob: 10, wobHz: 5 }); clink(now() + 0.5); clink(now() + 0.62); }
      else if (r === 'cast' || r === 'area') { noise(0.1, 0.12 * v, 4000); clink(); hissB(0.8, 0.08 * v, 3500, now() + 0.08); bubbles(4, 400, 0.04 * v, now() + 0.1); }
      else { clink(); hissB(0.4, 0.06 * v, 3000); }
    },
    snake(r, v) {
      if (r === 'step') hissB(0.3, 0.04 * v, 2400);
      else if (r === 'alert' || r === 'die') { hissB(r === 'die' ? 2 : 1.3, 0.45 * v, 3800); voice({ f0: 120, f1: 80, type: 'sawtooth', dur: 1, vol: 0.12 * v, lp: 500, wob: 20, wobHz: 9 }); bubbles(6, 260, 0.04 * v, now() + 0.3); }
      else hissB(0.6, 0.13 * v, 3400);
    }
  };
  const BMAT = { b0: 'slime', b1: 'silk', b2: 'glass', b3: 'sand', b4: 'ice', b5: 'forge', b6: 'eclipse', b7: 'spore', b8: 'water', b9: 'earth', quoc0: 'steel', quoc1: 'shadow', quoc2: 'hound', quoc3: 'chain', quoc4: 'hollow', quoc5: 'wings', quoc6: 'ash', quoc7: 'eclipse', shorty0: 'butler', shorty1: 'fiend', sy0: 'bottle', sy1: 'snake' };
  const ROLE = { jump: 'hit', stomp: 'hit', slam: 'hit', bounce3: 'hit', charge: 'hit', rush: 'hit', burrow: 'hit', shoot: 'cast', fan: 'cast', spit: 'cast', lobs: 'cast', curse: 'cast', web: 'cast', goo: 'cast', beam: 'cast', crossBeam: 'cast',
    meteor: 'area', rain: 'area', erupt: 'area', lavaCols: 'area', sweep: 'area', breath: 'area', tornado: 'area', blizzard: 'area', spin: 'area', tentacles: 'area', teleport: 'vanish', cloak: 'vanish', ambush: 'vanish', clone: 'vanish', dark: 'vanish',
    shield: 'guard', guard: 'guard', wall: 'guard', summon: 'call', splitslime: 'call' };
  const QPM = [1.25, 1.7, 1.0, 0.72, 0, 0.92, 0.85, 0.7];   // the devil voice's pitch for each of Quoc's eight forms (form 5, the empty armour, has none)
  // voice of the current boss: evt alert | attack | hurt | die | idle
  function boss(id, evt, volf) {
    if (!ac) return; const v = volf === undefined ? 1 : volf, m = BMAT[id], lk = 'B' + id + evt;
    if (now() - (lastV[lk] || -9) < (evt === 'hurt' ? 0.15 : 0.4)) return; lastV[lk] = now();
    into(id, () => {
      if (id[0] === 'b') { const n = +id.slice(1); if (n !== 2) creature(n, evt, true, v); }
      else if (id.indexOf('quoc') === 0) { const pm = QPM[+id.slice(4)]; if (pm) devilVoice(evt === 'alert' ? 0.9 : (evt === 'die' ? 1.6 : (evt === 'hurt' ? 0.25 : 0.5)), pm, (evt === 'idle' ? 0.5 : 0.9) * v); }
      if (MAT[m] && evt !== 'idle') MAT[m](evt, v);
      if (id === 'quoc7' && evt === 'alert') devilRoar(1);
    });
  }
  // every skill: the material's layer for the skill's role, plus the signature sounds named in the proposal
  function bossSkill(id, sk) {
    if (!ac) return; const m = BMAT[id], r = ROLE[sk]; if (!MAT[m] || !r) return;
    into(id + ':' + r, () => {
      MAT[m](r, 1);
      if (id === 'b0' && sk === 'goo') { noise(0.2, 0.14, 1200); tone(180, 0.2, 'sine', 0.1, 300); }
      if (id === 'b1' && sk === 'web') tone(1400, 0.35, 'triangle', 0.07, -900);
      if (id === 'b2' && sk === 'beam') { tone(160, 0.8, 'sawtooth', 0.06, 40); noise(0.4, 0.1, 3000, now() + 0.5); }
      if (id === 'b5' && sk === 'slam') clang(300, 0.3);
      if (id === 'b5' && sk === 'meteor') tone(2600, 0.9, 'sine', 0.05, -2200);
      if (id === 'quoc0' && (sk === 'shoot' || sk === 'fan')) bell(1400 + Math.random() * 400, 0.4, 0.05);
      if (id === 'quoc6' && sk === 'lavaCols') for (let i = 0; i < 9; i++) noise(0.22, 0.09, 500, now() + i * 0.09);   // nine flames
    });
  }
  function bossStep(id, big) { if (!ac) return; const m = BMAT[id]; if (MAT[m]) into(id + ':step', () => MAT[m]('step', big ? 1.3 : 1)); }
  // dragons: Ignar (form 0) high and young; Ignarok (1) deep; Three Furies (2) three voices; Duskflame (3) echo and choir
  function dragon(form, evt, volf) {
    if (!ac) return; const id = 'dragon' + form, v = volf === undefined ? 1 : volf, lk = 'D' + form + evt;
    if (now() - (lastV[lk] || -9) < (evt === 'hurt' ? 0.15 : 0.4)) return; lastV[lk] = now();
    into(id, () => {
      if (form === 0) creature('dragon', evt, true, v * 0.8, 1.7);
      else if (form === 2) { creature('dragon', evt, true, v * 0.7, 1.0); voice({ f0: 43, f1: 30, type: 'sawtooth', dur: 1.2, vol: 0.12 * v, wob: 40, wobHz: 6, lp: 450, delay: 0.12 }); voice({ f0: 68, f1: 50, type: 'sawtooth', dur: 1.0, vol: 0.1 * v, wob: 50, wobHz: 8, lp: 600, delay: 0.24 }); }
      else { creature('dragon', evt, true, v, form === 3 ? 0.9 : 1.0); if (form === 3) { creature('dragon', evt, true, v * 0.35, 0.9); if (evt === 'alert' || evt === 'die') choir(41, 2, 0.03 * v); } }
    });
  }
  // summons: a voice when they arrive / evolve, a sound for each attack, small footsteps (never more than two at a time)
  const SUMV = {
    titan: ['earth', () => voice({ f0: 70, f1: 55, type: 'sawtooth', dur: 0.8, vol: 0.12, lp: 400 })],
    golems: ['earth', () => { voice({ f0: 80, f1: 60, type: 'sawtooth', dur: 0.5, vol: 0.09, lp: 400 }); voice({ f0: 95, f1: 70, type: 'sawtooth', dur: 0.5, vol: 0.08, lp: 400, delay: 0.15 }); }],
    cobble: ['earth', () => { for (let i = 0; i < 6; i++) noise(0.05, 0.08, 700 + Math.random() * 600, now() + i * 0.06); }],
    stormgod: ['storm', () => { voice({ f0: 120, f1: 100, type: 'sawtooth', dur: 0.7, vol: 0.09, lp: 900 }); noise(1.2, 0.12, 50, now() + 0.2); }],
    seagoddess: ['water', () => [0, 4, 7].forEach((iv, i) => pad(mtof(76 + iv), 0.8, 0.05, 0.08, 'sine', now() + i * 0.12))],
    moongoddess: ['moon', () => [0, 7, 12].forEach((iv, i) => pad(mtof(81 + iv), 1, 0.04, 0.15, 'sine', now() + i * 0.15))],
    frostgiant: ['ice', () => voice({ f0: 75, f1: 55, type: 'sawtooth', dur: 0.9, vol: 0.12, lp: 500, wob: 5, wobHz: 4 })],
    sunemperor: ['sun', () => { voice({ f0: 140, f1: 120, type: 'sawtooth', dur: 0.6, vol: 0.08, lp: 1100 }); bell(880, 1, 0.05, now() + 0.3); }],
    shogun: ['steel', () => { noise(0.4, 0.08, 1500); voice({ f0: 180, f1: 140, type: 'sawtooth', dur: 0.15, vol: 0.07, lp: 900, delay: 0.3 }); }],
    treant: ['wood', () => { voice({ f0: 90, f1: 70, type: 'square', dur: 0.9, vol: 0.06, wob: 10, wobHz: 3, lp: 500 }); noise(0.8, 0.05, 2000); }],
    aegis: ['metal', () => voice({ f0: 200, f1: 170, type: 'sawtooth', dur: 0.2, vol: 0.08, lp: 1000 })],
    valkyrie: ['star', () => voice({ f0: 520, f1: 600, type: 'triangle', dur: 0.25, vol: 0.08 })],
    angel: ['star', () => [0, 4, 7, 12].forEach(iv => pad(mtof(72 + iv), 1, 0.035, 0.1, 'sine'))],
    phoenix: ['fire', () => voice({ f0: 1400, f1: 2200, type: 'square', dur: 0.4, vol: 0.05, wob: 60, wobHz: 14 })],
    dragonking: ['fire', () => { voice({ f0: 50, f1: 30, type: 'sawtooth', dur: 1.3, vol: 0.14, wob: 40, wobHz: 7, lp: 460 }); noise(1, 0.06, 90); bell(660, 1.2, 0.03, now() + 0.3); }],
    dragonform: ['fire', () => { voice({ f0: 60, f1: 36, type: 'sawtooth', dur: 1.1, vol: 0.14, wob: 45, wobHz: 8, lp: 500 }); noise(0.9, 0.06, 90); crackle(8, 0.06, 0.8); }],
    thunderkirin: ['storm', () => { voice({ f0: 700, f1: 400, type: 'sawtooth', dur: 0.35, vol: 0.06, wob: 40, wobHz: 20 }); noise(0.15, 0.1, 3000); }],
    skywhale: ['water', () => { pad(160, 2.2, 0.07, 0.4, 'sine'); pad(210, 1.8, 0.04, 0.4, 'sine', now() + 0.4); }],
    ninetail: ['fox', () => voice({ f0: 900, f1: 600, type: 'triangle', dur: 0.3, vol: 0.07, wob: 30, wobHz: 10 })],
    clones: ['shadow', () => { hissB(0.8, 0.25, 900); hissB(0.8, 0.2, 1400, now() + 0.1); hissB(0.8, 0.16, 1900, now() + 0.2); }]
  };
  const SUMA = {   // attack layers by material
    earth: () => { noise(0.25, 0.12, 60); tone(55, 0.25, 'sine', 0.12, -15); }, storm: () => { noise(0.2, 0.12, 2500); tone(160, 0.2, 'sawtooth', 0.06, -80); },
    water: () => { noise(0.3, 0.1, 600); tone(300, 0.2, 'sine', 0.06, -180); }, moon: () => { tone(1300, 0.25, 'triangle', 0.05, -700); bell(1700, 0.4, 0.03); },
    ice: () => { noise(0.12, 0.12, 3200); tone(2200, 0.18, 'sine', 0.04, -1500); }, sun: () => { noise(0.3, 0.1, 700); bell(1050, 0.6, 0.04); },
    steel: () => { hissB(0.2, 0.1, 5200); tone(1500, 0.2, 'sawtooth', 0.04, -800); }, wood: () => { tone(150, 0.12, 'square', 0.06, -60); noise(0.25, 0.06, 2200); },
    metal: () => clang(700, 0.08), star: () => { hissB(0.2, 0.08, 4500); bell(1900, 0.3, 0.03); }, fire: () => { noise(0.3, 0.1, 700); tone(220, 0.3, 'sawtooth', 0.05, 120); },
    fox: () => { tone(500, 0.2, 'sine', 0.06, 300); noise(0.15, 0.05, 2000); }, shadow: () => rise(0.25, 0.3, 300, 1500)
  };
  let stepTs = [];
  function summon(kind, evt, stage) {
    if (!ac) return; const e = SUMV[kind]; if (!e) return; const big = stage === 2 ? 1.4 : 1;
    if (evt === 'step') {
      const t = now(); stepTs = stepTs.filter(x => t - x < 0.28); if (stepTs.length >= 2) return; stepTs.push(t);
      into('sum', () => { const m = e[0]; if (m === 'earth' || m === 'ice') { noise(0.1, 0.06 * big, 70); tone(60, 0.1, 'sine', 0.05 * big, -20); } else if (m === 'wood') { tone(110, 0.08, 'square', 0.025, -40); noise(0.08, 0.025, 1500); } else if (m === 'metal' || m === 'steel') tone(300 + Math.random() * 60, 0.03, 'square', 0.02, -60); else noise(0.05, 0.03, 1200); });
      return;
    }
    const lk = 'S' + kind + evt; if (now() - (lastV[lk] || -9) < (evt === 'attack' ? 0.45 : 0.3)) return; lastV[lk] = now();
    into('sum', () => {
      if (evt === 'spawn') e[1]();
      else if (evt === 'evo') { e[1](); voice({ f0: 60, f1: 40, type: 'sawtooth', dur: 1.2, vol: 0.1, lp: 300, delay: 0.1 }); bell(523, 1.6, 0.06, now() + 0.2); bell(784, 1.6, 0.05, now() + 0.35); }
      else if (evt === 'attack' && SUMA[e[0]]) SUMA[e[0]]();
    });
  }
  // loudness meter (debug only): the loudest RMS window of what plays on the effects bus in the next `ms`, in dBFS
  function meter(fn, ms) {
    return new Promise(res => {
      if (!ac) return res(null); const an = ac.createAnalyser(); an.fftSize = 2048; sfxG.connect(an); const buf = new Float32Array(an.fftSize); let peak = 0;
      fn(); const t0 = performance.now();
      const iv = setInterval(() => { an.getFloatTimeDomainData(buf); let s = 0; for (const x of buf) s += x * x; peak = Math.max(peak, Math.sqrt(s / buf.length)); if (performance.now() - t0 > (ms || 1800)) { clearInterval(iv); sfxG.disconnect(an); res(peak > 0 ? 20 * Math.log10(peak) : -120); } }, 40);
    });
  }
  function setBal(id, g, role) { if (role) (KG[id] = KG[id] || {})[role] = g; else BAL[id] = g; for (const k in busC) if (k === id || k.indexOf(id + ':') === 0) busC[k].gain.value = busGain(k); }
  return { init, play, surf, near, boss, bossSkill, bossStep, dragon, summon, meter, setBal, BAL, KG, creature, monster, ambience, ambVol, step: foot, devilRoar, devilVoice, hero, blip, whisper, sting, music, stop, cine, cineHit, setVol, setMusicVol, setSfxVol, setMuted, get mVol() { return mVol; }, get sVol() { return sVol; }, toggleMute, get vol() { return vol; }, get muted() { return muted; } };
})();
