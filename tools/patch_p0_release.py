# P0: one RELEASE switch for the build you sell (off now, so the test build is unchanged).
# RELEASE = true turns off the fan heroes, renames Star Fox, and disables every testing shortcut in the link.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/heroes.js', [
    ("const H2 = (en, vi) => ({ en, vi });",
     "const H2 = (en, vi) => ({ en, vi });\n// THE BUILD YOU SELL: set RELEASE = true. It removes the fan heroes (other companies' characters), renames Star Fox,\n// and turns off the testing shortcuts in the link (?unlock ?debug ?level= ?boss= ?quoc= ?leekdemo).\nconst RELEASE = false;"),
    ("{ id: 'starfox', name: H2('Star Fox', 'Hồ Ly Sao'),", "{ id: 'starfox', name: H2(RELEASE ? 'Comet Fox' : 'Star Fox', 'Hồ Ly Sao'),"),
    ("const FAN_HEROES = true;", "const FAN_HEROES = !RELEASE;"),
])
s = io.open('src/game.js', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)
rep("  const DEMO = location.search.indexOf('leekdemo') >= 0;", "  const DEMO = !RELEASE && location.search.indexOf('leekdemo') >= 0;")
rep("  const UNLOCK_ALL = (() => {", "  const UNLOCK_ALL = !RELEASE && (() => {")
a0 = s.index("  // ?quoc=N jumps straight into the final fight")
a1 = s.index("  { const m = location.search.match(/room=")
s = s[:a0] + "  if (!RELEASE) {   // testing shortcuts in the link (off in the build you sell)\n" + s[a0:a1] + "  }\n" + s[a1:]
rep("  if (location.search.indexOf('debug') >= 0) window.LL = {", "  if (!RELEASE && location.search.indexOf('debug') >= 0) window.LL = {")
rep("save.castle = 0; save.ride = 0; save.seen = {};", "save.castle = 0; save.ride = 0; save.seen = {}; save.films = {};")
io.open('src/game.js', 'w', encoding='utf-8').write(s)
print('ok')
