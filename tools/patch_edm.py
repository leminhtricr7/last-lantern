import io
p='src/audio.js'
s=io.open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    assert a in s, a[:40]
    s=s.replace(a,b,1)
rep("let ac = null, master, musicG, sfxG, noiseBuf;","let ac = null, master, musicG, sfxG, noiseBuf, duck, bassBus, chordBus, leadBus;")
rep("master = ac.createGain(); master.connect(ac.destination);",
"""master = ac.createGain();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.16;
    master.connect(comp); comp.connect(ac.destination);""")
rep("sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);",
"""sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
    // sidechain-ducked buses (kick pumps the bass, chords and arps)
    duck = ac.createGain(); duck.connect(musicG);
    const lp = (f, q) => { const n = ac.createBiquadFilter(); n.type = 'lowpass'; n.frequency.value = f; n.Q.value = q || 0.7; n.connect(duck); return n; };
    bassBus = lp(420, 2); chordBus = lp(3600, 0.8); leadBus = lp(7000, 0.5);""")
a=s.index("  // ---------- music ----------")
b=s.index("  return { init, play, creature")
new='''  // ---------- music: chiptune EDM (4-on-the-floor, sidechain pump, build + drop) ----------
  function music(key, def) {
    if (!def) return;
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
  function stop() { if (timer) clearInterval(timer); timer = null; curKey = ''; cur = null; }
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
      for (const iv of [0, third, 7, 12]) { const f = mtof(root + iv); for (const det of [-9, 9]) tone(f, spb * 2.4, 'sawtooth', 0.075, 0, t, chordBus), void det; }
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
'''
s=s[:a]+new+s[b:]
io.open(p,'w',encoding='utf-8').write(s)
p='src/levels.js'
s=io.open(p,encoding='utf-8').read()
s=s.replace("drums: false };","drums: true };")
io.open(p,'w',encoding='utf-8').write(s)
