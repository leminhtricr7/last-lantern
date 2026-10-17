'use strict';
// ============ PROCEDURAL AUDIO (8-bit sfx + generated music) ============
const Snd = (() => {
  let ac = null, master, musicG, sfxG, noiseBuf;
  let vol = 0.6, muted = false, timer = null, cur = null, step = 0, nextT = 0, curKey = '';
  const mtof = n => 440 * Math.pow(2, (n - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.connect(ac.destination);
    musicG = ac.createGain(); musicG.gain.value = 0.32; musicG.connect(master);
    sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
    applyVol();
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (cur) { const c = cur; cur = null; curKey = ''; music(c.key, c.def); }
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
    b6: { f: 75, s: 0.5, type: 'sawtooth', wob: 55, wobHz: 6, noise: 0.3, nHP: 300, dur: 1.5, vol: 0.24, lp: 650 }
  };
  const CMAP = { slime: 'slime', iceslime: 'slime', shadeslime: 'slime', lavaslime: 'lavaslime', bat: 'bat', icebat: 'bat', firebat: 'bat', bee: 'bee', vulture: 'vulture', spider: 'spider', cavespider: 'spider', mummy: 'skel', burnt: 'skel', shadowskel: 'skel', skeleton: 'skel', scorpion: 'scorp', snowman: 'snow', fire: 'fire', ghost: 'ghost', knight: 'knight', beetle: 'beetle', sandbeetle: 'beetle', wisp: 'wisp', shadewisp: 'wisp', imp: 'imp', shadeimp: 'imp', shroom: 'shroom', zombie: 'zombie', lavablob: 'blob' };
  const lastV = {};
  // evt: idle | alert | hurt | die | attack
  function creature(kind, evt, boss) {
    if (!ac) return;
    const key = boss ? 'b' + kind : CMAP[kind];
    const b = CV[key]; if (!b) return;
    const now = ac.currentTime, lk = key + (evt === 'idle' ? 'i' : '');
    if (lastV[lk] && now - lastV[lk] < (evt === 'hurt' ? 0.12 : 0.35)) return;
    lastV[lk] = now;
    let f0 = b.f * (0.93 + Math.random() * 0.14), f1 = f0 * b.s, dur = b.dur, vol = b.vol;
    if (evt === 'hurt') { f0 *= 1.35; f1 = f0 * 0.7; dur *= 0.55; vol *= 1.1; }
    else if (evt === 'die') { f0 *= 0.95; f1 = f0 * 0.4; dur *= 1.7; vol *= 1.15; }
    else if (evt === 'alert') { f0 *= 1.1; dur *= 1.15; vol *= 1.15; }
    else if (evt === 'attack') { f0 *= 1.2; f1 = f0 * 0.8; dur *= 0.9; vol *= 1.1; }
    else if (evt === 'idle') { vol *= 0.6; dur *= 0.9; }
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
  function hero(evt) { if (HV[evt]) HV[evt](); }
  const NV = { lila: ['sine', 720, 980, 0.07], bram: ['square', 130, 190, 0.06], gob: ['sawtooth', 380, 620, 0.06], angel: ['sine', 880, 1320, 0.07], smith: ['square', 95, 135, 0.07], wizard: ['triangle', 280, 520, 0.09], fairy: ['sine', 1500, 2200, 0.05] };
  function blip(who) {
    if (!ac) return;
    const v = NV[who] || NV.lila, f = v[1] + Math.random() * (v[2] - v[1]);
    voice({ f0: f, f1: f * (0.92 + Math.random() * 0.2), type: v[0], dur: 0.07, vol: v[3], wob: who === 'wizard' ? 30 : 0, wobHz: 14, noise: who === 'gob' ? 0.04 : 0, nHP: 2000 });
    if (who === 'angel') voice({ f0: f * 1.5, f1: f * 1.5, type: 'sine', dur: 0.09, vol: 0.04 });
  }

  // ---------- music ----------
  function music(key, def) {
    if (!def) return;
    if (key === curKey) return;
    cur = { key, def }; curKey = key;
    if (!ac) return;
    if (timer) clearInterval(timer);
    const r = mulberry32(def.seed || 1);
    // generate a 16-step lead pattern and bass pattern
    cur.lead = []; let deg = 2;
    for (let i = 0; i < 16; i++) {
      if (r() < (def.density || 0.55)) { deg = Math.max(0, Math.min(def.scale.length * 2 - 1, deg + Math.floor(r() * 5) - 2)); cur.lead.push(deg); } else cur.lead.push(null);
    }
    step = 0; nextT = ac.currentTime + 0.1;
    timer = setInterval(sched, 50);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; curKey = ''; cur = null; }
  function sched() {
    if (!ac || !cur) return;
    const spb = 60 / cur.def.bpm / 2;
    while (nextT < ac.currentTime + 0.25) { playStep(step, nextT); nextT += spb; step++; }
  }
  function playStep(st, t) {
    const d = cur.def, s = st % 16, bar = Math.floor(st / 16) % d.prog.length;
    const root = d.root + d.prog[bar];
    if (s % 4 === 0 || s % 8 === 6) tone(mtof(root - 12), 0.22, 'triangle', 0.5, 0, t, musicG);
    const ld = cur.lead[(s + bar * 5) % 16];
    if (ld !== null) {
      const sc = d.scale, oct = Math.floor(ld / sc.length);
      tone(mtof(root + 12 + sc[ld % sc.length] + oct * 12), 0.2, d.wave || 'square', 0.17, 0, t, musicG);
    }
    if (s % 2 === 0) { const sc = d.scale; tone(mtof(root + sc[(s / 2 + bar) % sc.length]), 0.12, 'square', 0.06, 0, t, musicG); }
    if (d.drums !== false) {
      if (s % 8 === 0) tone(120, 0.15, 'sine', 0.6, -90, t, musicG);
      if (s % 8 === 4) noise(0.1, 0.18, 1500, t, musicG);
      if (s % 2 === 1) noise(0.03, 0.05, 6000, t, musicG);
    }
  }
  return { init, play, creature, hero, blip, music, stop, setVol, toggleMute, get vol() { return vol; }, get muted() { return muted; } };
})();
