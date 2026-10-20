# Adds the 60 s intro and outro films (tools/cine_block.js) to src/game.js and wires them in.
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

block = io.open('tools/cine_block.js', encoding='utf-8').read()
rep("  // ===================== CREDITS =====================", block + "  // ===================== CREDITS =====================")
# scenes
rep("    if (s === 'opening') startOpening();", "    if (s === 'opening') startOpening();\n    if (s === 'intro' || s === 'outro') { startCine(s, s === 'intro' ? 'title' : 'credits', s === 'intro' && cnBoot); cnBoot = false; }")
rep("        else if (scene === 'opening') updateOpening(sub);", "        else if (scene === 'opening') updateOpening(sub);\n        else if (scene === 'intro' || scene === 'outro') updateCine(sub);")
rep("    else if (scene === 'opening') drawOpening();", "    else if (scene === 'opening') drawOpening();\n    else if (scene === 'intro' || scene === 'outro') drawCine();")
# the intro plays when the game starts (any ?query = test start, straight to the title)
rep("  let fadeIn = 0;\n  enterScene('title');", "  let fadeIn = 0;\n  enterScene(location.search.length > 1 ? 'title' : 'intro');")
# the ending story flows into the outro film, which ends on the credits
rep("else if (storyList === ENDING) { toScene('title'); }", "else if (storyList === ENDING) { toScene('outro'); }")
# skip button / clicks
rep("|| scene === 'ride' || scene === 'opening';", "|| scene === 'ride' || scene === 'opening' || ((scene === 'intro' || scene === 'outro') && cn && !cn.gate);")
rep("    else if (scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'credits') pressed.Enter = true;",
    "    else if (scene === 'story' || scene === 'ending' || scene === 'opening' || scene === 'credits') pressed.Enter = true;\n    else if ((scene === 'intro' || scene === 'outro') && cn && cn.gate) pressed.Enter = true;")
# title menu: replay the intro film
rep("    it.push({ k: 'credits', fn: () => toScene('credits') });", "    it.push({ k: 'movie', fn: () => toScene('intro') });\n    it.push({ k: 'credits', fn: () => toScene('credits') });")
rep("credits: ['Credits', 'Thực hiện bởi'],", "credits: ['Credits', 'Thực hiện bởi'], movie: ['Intro film', 'Phim mở đầu'],")
# debug hooks
rep("castSummons, spawnSummon,", "castSummons, startCine, get cn() { return cn; }, drawCine, spawnSummon,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
