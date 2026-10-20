# The old 60 s "intro" film (summons lined up in front of a huge blurred dragon) is retired: the title menu's
# "Intro film" now replays the new opening film (and returns to the title), and the very first screen at launch only
# waits for a key press (it unlocks the sound) and then shows the title.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:90]
    s = s.replace(a, b)
rep("it.push({ k: 'movie', fn: () => toScene('intro') });", "it.push({ k: 'movie', fn: () => { opReplay = true; toScene('opening'); } });")
rep("let op = null, opIntro = false;", "let op = null, opIntro = false, opReplay = false;")
rep("else if (t > OP_END + 0.6) { Snd.play('ok'); save.seen = { 0: 1 }; writeSave(); opIntro = true; startLevelFade(0); }",
    "else if (t > OP_END + 0.6) { Snd.play('ok'); if (opReplay) { opReplay = false; toScene('title'); } else { save.seen = { 0: 1 }; writeSave(); opIntro = true; startLevelFade(0); } }")
rep("function cnBegin() { cn.gate = false; Snd.init(); Snd.cine('sad', 2.5); }",
    "function cnBegin() { cn.gate = false; Snd.init(); if (cn.kind === 'intro') { cnEnd(); return; } Snd.cine('sad', 2.5); }   // (the launch screen only unlocks the sound, then the title)")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
