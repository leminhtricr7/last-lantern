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
  function play(n) { if (ac && sfx[n]) sfx[n](); }

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
  return { init, play, music, stop, setVol, toggleMute, get vol() { return vol; }, get muted() { return muted; } };
})();
