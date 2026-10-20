# P1 sound: the hero speaks with the hero voice (not Lila's), separate music / effects volume in the pause menu,
# master volume steps on the title screen, mute and volumes are saved, and one sound cannot stack many times at once.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/audio.js', [
    ("  let vol = 0.6, muted = false,", "  let vol = 0.6, mVol = 1, sVol = 1, ambBase = 0.9, muted = false, lastT = {},"),
    ("  function applyVol() { if (master) master.gain.value = muted ? 0 : vol; }\n  function setVol(v) { vol = Math.max(0, Math.min(1, v)); applyVol(); }\n  function toggleMute() { muted = !muted; applyVol(); return muted; }",
     "  function applyVol() { if (master) master.gain.value = muted ? 0 : vol; if (musicG) musicG.gain.value = 0.32 * mVol; if (sfxG) sfxG.gain.value = 0.55 * sVol; if (ambG) ambG.gain.value = ambBase * sVol; }\n"
     "  function setVol(v) { vol = Math.max(0, Math.min(1, v)); applyVol(); }\n"
     "  function setMusicVol(v) { mVol = Math.max(0, Math.min(1, v)); applyVol(); }   // music bus (0..1)\n"
     "  function setSfxVol(v) { sVol = Math.max(0, Math.min(1, v)); applyVol(); }     // effects + ambience (0..1)\n"
     "  function setMuted(b) { muted = !!b; applyVol(); }\n"
     "  function toggleMute() { muted = !muted; applyVol(); return muted; }"),
    # the same sound at most once every 30 ms (ten hits in one frame used to play ten times on top of each other)
    ("  function ambVol(v) { if (ambG && ac) ambG.gain.setTargetAtTime(v, ac.currentTime, 0.5); }",
     "  function ambVol(v) { ambBase = v; if (ambG && ac) ambG.gain.setTargetAtTime(v * sVol, ac.currentTime, 0.5); }"),
    ("  function play(n) { if (ac && sfx[n]) sfx[n](); }",
     "  function play(n) { if (!ac || !sfx[n]) return; const now = ac.currentTime; if (now - (lastT[n] || -1) < 0.03) return; lastT[n] = now; sfx[n](); }"),
    # every hero speaks with the hero voice ('h_kirby' etc. used to fall back to Lila's)
    ("  function blip(who) {\n    if (!ac) return;", "  function blip(who) {\n    if (!ac) return;\n    if (who && who.indexOf('h_') === 0) who = 'ember';"),
])
s = io.open('src/audio.js', encoding='utf-8').read()
a = "setVol, toggleMute,"
assert s.count(a) == 1
s = s.replace(a, "setVol, setMusicVol, setSfxVol, setMuted, get mVol() { return mVol; }, get sVol() { return sVol; }, toggleMute,")
io.open('src/audio.js', 'w', encoding='utf-8').write(s)

patch('src/game.js', [
    # load the saved volumes and mute
    ("  Snd.setVol(save.vol);", "  if (typeof save.vol !== 'number') save.vol = 0.6; if (typeof save.mvol !== 'number') save.mvol = 1; if (typeof save.svol !== 'number') save.svol = 1;\n"
     "  Snd.setVol(save.vol); Snd.setMusicVol(save.mvol); Snd.setSfxVol(save.svol); Snd.setMuted(!!save.muted);"),
    # M remembers the choice
    ("    if (act.muteP) Snd.toggleMute();", "    if (act.muteP) { save.muted = Snd.toggleMute(); writeSave(); }"),
    # the title's sound button steps through the master volume
    ("    it.push({ k: 'sound', fn: () => { Snd.toggleMute(); } });",
     "    it.push({ k: 'sound', fn: () => { const st = [1, 0.8, 0.6, 0.4, 0.2, 0]; if (Snd.muted) { Snd.setMuted(false); save.muted = false; save.vol = 1; } else { const i = st.findIndex(v => v <= save.vol + 0.001); save.vol = st[(i + 1) % st.length]; } Snd.setVol(save.vol); writeSave(); } });"),
    ("    if (it.k === 'sound') return sv('Sound: ', 'Âm thanh: ') + (Snd.muted ? sv('Off', 'Tắt') : sv('On', 'Bật'));",
     "    if (it.k === 'sound') return sv('Sound: ', 'Âm thanh: ') + (Snd.muted || save.vol <= 0 ? sv('Off', 'Tắt') : Math.round(save.vol * 100) + '%');"),
    # pause menu: two more rows, music and effects volume (left / right or Enter to change)
    ("      if (act.upP) { Q.menu = (Q.menu + 3) % 4; Snd.play('select'); } if (act.downP) { Q.menu = (Q.menu + 1) % 4; Snd.play('select'); }",
     "      if (act.upP) { Q.menu = (Q.menu + 5) % 6; Snd.play('select'); } if (act.downP) { Q.menu = (Q.menu + 1) % 6; Snd.play('select'); }\n"
     "      if (Q.menu >= 4 && (act.leftP || act.rightP || act.okP)) {   // volume rows: 0 % ... 100 % in steps of 10\n"
     "        const key = Q.menu === 4 ? 'mvol' : 'svol', d = act.leftP ? -0.1 : 0.1; let v = Math.round(((save[key] === undefined ? 1 : save[key]) + d) * 10) / 10; if (act.okP && v > 1) v = 0; save[key] = clamp(v, 0, 1);\n"
     "        if (key === 'mvol') Snd.setMusicVol(save.mvol); else Snd.setSfxVol(save.svol); Snd.play('select'); writeSave(); return;\n"
     "      }"),
    ("      ['resume', 'restart', 'tomap', 'totitle'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 88 + i * 18, { al: 'center', size: 10, col: Q.menu === i ? '#ffd34e' : '#cfd6e6' }));",
     "      ['resume', 'restart', 'tomap', 'totitle'].forEach((k, i) => txt((Q.menu === i ? '> ' : '  ') + T(k), VW / 2, 76 + i * 14, { al: 'center', size: 9, col: Q.menu === i ? '#ffd34e' : '#cfd6e6' }));\n"
     "      [[sv('Music', 'Nhạc'), save.mvol], [sv('Effects', 'Hiệu ứng'), save.svol]].forEach(([n, v], j) => { const i = 4 + j, on = Q.menu === i; txt((on ? '< ' : '  ') + n + ': ' + Math.round((v === undefined ? 1 : v) * 100) + '%' + (on ? ' >' : '  '), VW / 2, 76 + i * 14, { al: 'center', size: 8, col: on ? '#ffd34e' : '#a8b0d0' }); });"),
    ("if (st === 'pause') { const i = menuHit(gx, gy, 4, VW / 2, 88, 18, 80);", "if (st === 'pause') { const i = menuHit(gx, gy, 6, VW / 2, 76, 14, 80);"),
])
print('ok')
