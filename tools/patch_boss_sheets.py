# Phase 3B: bosses read pixel-art sprite sheets (assets/sprites/<name>/<name>.json + one PNG strip per state).
# The frame is chosen from the boss state: idle / walk / tele / slam (stomps, slams, jumps, charges) / cast (shots and
# spells) / hurt / death / rage (from the second phase on). The sheet's anchor (feet, bottom centre) is put on the
# bottom centre of the hitbox; flipping mirrors around the anchor. Until a sheet has loaded, the old drawing is used.
# Hitboxes, HP and skills are unchanged.
import io
def edit(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, (p, s.count(a), a[:100])
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

# ---------- the loader (next to the other picture loaders) ----------
edit('src/quocimg.js', [("// Morvella, Oktavor and Vorgrub from the artist's sheet", """// pixel-art sprite sheets made with tools/pixel: assets/sprites/<name>/<name>.json lists the states; each state is one
// horizontal strip of equal cells facing right. Every frame keeps its anchor (feet, bottom centre) as ax / ay.
const SHEETS = {};
function loadSheet(name) {
  if (SHEETS[name]) return SHEETS[name];
  const S = SHEETS[name] = { ready: false, st: {} };
  fetch('assets/sprites/' + name + '/' + name + '.json').then(r => r.json()).then(m => {
    S.m = m; let left = Object.keys(m.states).length;
    for (const st in m.states) {
      const info = m.states[st], img = new Image();
      img.onload = () => {
        const fr = [];
        for (let i = 0; i < info.frames; i++) { const s = imgSprite(img, i * m.cell[0], 0, m.cell[0], m.cell[1]); s.ax = m.anchor[0]; s.ay = m.anchor[1]; fr.push(s); }
        S.st[st] = { fr, fps: info.fps, loop: info.loop };
        if (--left === 0) S.ready = true;
      };
      img.src = 'assets/sprites/' + name + '/' + info.file;
    }
  }).catch(() => { S.failed = true; });
  return S;
}
// Morvella, Oktavor and Vorgrub from the artist's sheet""")])

# ---------- drawing a boss from its sheet ----------
edit('src/game.js', [
 ("  function drawBoss(camX, camY) {\n    const b = Q.boss; if (b.dead && Q.t % 0.1 > 0.05) return;",
  """  // which boss uses which sprite sheet (by map); null = the old drawing
  const BOSS_SHEET = ['gulgor', 'veylith', 'prismor', 'khepsar', 'rimvald', 'kaldrok', null, 'morvella', 'oktavor', 'vorgrub'];
  function bossSheet(b) {
    const name = b.cfg === BOSS[Q.li] ? BOSS_SHEET[Q.li] : null; if (!name || typeof loadSheet === 'undefined') return null;
    const S = loadSheet(name); return S.ready && S.st.idle ? S : null;
  }
  // the frame for the boss's state; one-shot states start from their first frame when the state begins
  function sheetFrame(b, S) {
    let st;
    if (b.dead) st = 'death';
    else if (b.flash > 0 && S.st.hurt) st = 'hurt';
    else if (b.st === 'tele') st = 'tele';
    else if (b.st === 'act') st = (SLAM_L.indexOf(b.sk) >= 0 || b.sk === 'charge' || b.sk === 'rush' || b.sk === 'stomp') ? 'slam' : 'cast';
    else if (b.moveT > 0 || b.st === 'evade') st = 'walk';
    else st = (b.phase >= 1 && S.st.rage) ? 'rage' : 'idle';
    if (!S.st[st]) st = 'idle';
    if (b.anSt !== st) { b.anSt = st; b.anT0 = Q.t; }
    const A = S.st[st], n = A.fr.length, el = st === 'death' ? (Q.bossDeadT || 0) : Q.t - b.anT0;
    let i;
    if (st === 'death') i = Math.min(n - 1, Math.floor(el / 1.4 * n));
    else if (st === 'tele') { const tot = (BS[b.atkSk] ? BS[b.atkSk].tele : 0.6) / (b.fury || 1); i = Math.min(n - 1, Math.floor(el / Math.max(0.1, tot) * n)); }
    else if (A.loop) i = Math.floor(el * A.fps) % n;
    else { i = Math.floor(el * A.fps); if (i >= n) i = st === 'hurt' ? n - 1 : n - 3 + ((i - n) % 3); }   // long skills keep looping their last three frames
    return A.fr[Math.max(0, Math.min(n - 1, i))];
  }
  function drawSheetFrame(fr, x, bot, flip, flash, al) {
    const img = flash ? (flip ? fr.fw : fr.cw) : (flip ? fr.f : fr.c), ax = flip ? fr.w - 1 - fr.ax : fr.ax;
    if (al < 1) g.globalAlpha = Math.max(0, al);
    g.drawImage(img, Math.round(x - ax), Math.round(bot - fr.ay)); g.globalAlpha = 1;
  }
  function drawBoss(camX, camY) {
    const b = Q.boss, SH = bossSheet(b); if (b.dead && !SH && Q.t % 0.1 > 0.05) return;"""),
 ("    if (typeof BOSS_IMG !== 'undefined' && BOSS_IMG[Q.li] && b.cfg === BOSS[Q.li]) b.spr = BOSS_IMG[Q.li];",
  "    if (!SH && typeof BOSS_IMG !== 'undefined' && BOSS_IMG[Q.li] && b.cfg === BOSS[Q.li]) b.spr = BOSS_IMG[Q.li];\n    const SF = SH ? sheetFrame(b, SH) : null; if (SF) b.spr = SF;"),
 ("""    { const walker = (bst === 'walk' || bst === 'run') && b.onGround && !c.fly && !c.eclipse && !c.swim && !c.art, img = BA.red ? redOf(b.spr) : b.spr, fl = (b.flash > 0 && !BA.red) || tele || b.revT > 0;""",
  """    if (SF) drawSheetFrame(SF, x + P.ox, bot + bob, b.dir < 0, (tele && b.st !== 'tele') || b.revT > 0 || (b.flash > 0 && !SH.st.hurt), al);   // the sheet has its own hurt flash and wind-up frames
    else { const walker = (bst === 'walk' || bst === 'run') && b.onGround && !c.fly && !c.eclipse && !c.swim && !c.art, img = BA.red ? redOf(b.spr) : b.spr, fl = (b.flash > 0 && !BA.red) || tele || b.revT > 0;"""),
])
# preload every boss sheet when a level starts, so the first frame of the fight already has its art
edit('src/game.js', [("  function makeBoss(s) {\n", "  function makeBoss(s) {\n    if (BOSS_SHEET[Q.li] && typeof loadSheet !== 'undefined') loadSheet(BOSS_SHEET[Q.li]);\n")])
print('ok')
