# P2 sound: every boss gets a fight track of its own (built from its map's key and scale, faster from map to map),
# Shorty and Sy get their own, and every hero's R skill opens with a sound that fits its effect.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/levels.js', [
    ("const DEVIL_MUSIC = {", """// a fight track for each boss, built from its map's music: same key, a minor scale, its own melody, faster later on
const BOSS_TRACK = (li, tag) => {
  const m = BIOMES[li].music, p = LPOS(li), minor = m.scale.indexOf(3) >= 0 || m.scale.indexOf(1) >= 0, k = tag === 'shorty' ? 1 : (tag === 'sy' ? 2 : 0);
  return { root: (m.root % 12) + 48 - (li === 6 && !k ? 2 : 0) + (k ? 3 * k : 0), scale: minor ? m.scale : [0, 2, 3, 5, 7, 8, 10], bpm: 100 + p * 2.4 + k * 3,
    wave: (li === 6 && !k) || m.wave === 'triangle' ? 'sawtooth' : 'square', prog: [[0, 1, 3, 1], [0, -2, -4, -5], [0, 3, 5, 3], [0, 1, 0, -2], [0, -4, -2, -5]][(p + k) % 5],
    seed: 700 + li * 13 + k * 101, density: 0.62 + p * 0.03 };
};
const DEVIL_MUSIC = {"""),
])
patch('src/game.js', [
    ("    Snd.creature(Q.li, 'alert', true); Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6);",
     "    Snd.creature(Q.li, 'alert', true); Snd.music('boss' + Q.li, BOSS_TRACK(Q.li)); setEmo('angry', 2.6);"),
    ("    Q.state = 'bossintro'; Q.stateT = 0; Snd.music('boss', BOSS_MUSIC); setEmo('angry', 2.6); Snd.creature(Q.li, 'alert', true); Q.shake = 0.6;",
     "    Q.state = 'bossintro'; Q.stateT = 0; Snd.music('mini' + m.who, BOSS_TRACK(Q.li, m.who)); setEmo('angry', 2.6); Snd.creature(Q.li, 'alert', true); Q.shake = 0.6;"),
    # R: the opening sound follows the hero's effect style
    ("    P.skCd = s.cd; Snd.play('relic'); pop(cx, cy - 18, LN(s.n), s.col);",
     "    P.skCd = s.cd; Snd.play(R_SFX[(HERO_FX[h.id] || { r: [] }).r[0]] || 'relic'); pop(cx, cy - 18, LN(s.n), s.col);"),
    ("  // the R skill: every hero has a look of their own", """  const R_SFX = { pillar: 'relic', notes: 'chime', runes: 'rune', xslash: 'slash', bats: 'flap', leaves: 'windy', frost: 'zap', flames: 'flame', bolts: 'thunder', spiral: 'windy', spikes: 'crumble', quakering: 'boom',
    stars: 'chime', petals: 'whoosh', hearts: 'heart', beamh: 'laser', souls: 'poof', sunburst: 'explode', sparks: 'clang', bubbles: 'splash', waves: 'splash', cross: 'relic', burst: 'boom', clock: 'click' };
  // the R skill: every hero has a look of their own"""),
])
print('ok')
