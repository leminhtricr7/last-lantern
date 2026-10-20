'use strict';
// ============ PROCEDURAL AUDIO (8-bit sfx + generated music) ============
const Snd = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf, duck, bassBus, chordBus, leadBus;
  let vol = 0.6, muted = false, timer = null, cur = null, step = 0, nextT = 0, curKey = '';
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
  function applyVol() { if (master) master.gain.value = muted ? 0 : vol; }
  function setVol(v) { vol = Math.max(0, Math.min(1, v)); applyVol(); }
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
  function play(n) { if (ac && sfx[n]) sfx[n](); }

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
  // horror voices for the deep bosses: 7 Spore Queen (wet hiss + gurgle), 8 Kraken (abyssal growl + bubbles), 9 Gravemaw (grinding rumble + screech)
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
  function ambVol(v) { if (ambG && ac) ambG.gain.setTargetAtTime(v, ac.currentTime, 0.5); }
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
    // ---- drums ----
    const noKick = lastBar && s >= 12;
    if (s % 4 === 0 && !noKick) kick(t, spb);
    if (lastBar && s >= 8 && s % 2 === 0) kick(t, spb);               // pre-drop kick roll
    if (!intro && (s === 4 || s === 12)) { noise(0.16, 0.26, 1400, t, musicG); tone(190, 0.08, 'square', 0.08, -80, t, musicG); }
    if (s % 4 === 2) noise(0.07, drop ? 0.2 : 0.14, 7000, t, musicG);  // off-beat hat
    if (drop && s % 2 === 1) noise(0.025, 0.07, 9000, t, musicG);       // 16th hats
    if (lastBar && s >= 8) { const k = 1 + (s - 8) / 8; noise(0.06, 0.1 * k, 2200 - 0, t, musicG); } // snare roll
    if (sec === 8 && s === 0) { noise(1.1, 0.35, 3500, t, musicG); tone(70, 0.6, 'sine', 0.9, -30, t, musicG); } // crash
    if (sec === 0 && s === 0 && barN > 0) noise(0.8, 0.2, 4500, t, musicG);
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
    // ---- riser in the last two bars of the build ----
    if (sec === 7 && s === 0) { const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(2400, t + spb * 16); gn.gain.setValueAtTime(0.02, t); gn.gain.linearRampToValueAtTime(0.12, t + spb * 16); o.connect(gn); gn.connect(leadBus); o.start(t); o.stop(t + spb * 16 + 0.05); }
  }
  return { init, play, creature, monster, ambience, ambVol, step: foot, devilRoar, devilVoice, hero, blip, whisper, sting, music, stop, cine, cineHit, setVol, toggleMute, get vol() { return vol; }, get muted() { return muted; } };
})();
