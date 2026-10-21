# Boss hitboxes follow the new art: each boss's w / h is the visible body of its sheet (tools/pixel/hitbox.py),
# with three hand-tuned cases (the coiled wyrm, the octopus, the butler's thin frame). The art is drawn centred on the
# body (SHEET_OFF), so the hitbox and the picture line up. HP, skills and timings are unchanged.
import io, json, re, subprocess, sys
M = json.loads(subprocess.check_output([sys.executable, 'tools/pixel/hitbox.py']).decode())
M['sy_wyrm'] = [60, 70, 0]; M['oktavor'] = [110, 140, 0]; M['shorty'] = [24, 60, -1]
p = 'src/game.js'; s = io.open(p, encoding='utf-8').read()
BOSS_ORDER = ['gulgor', 'veylith', 'prismor', 'khepsar', 'rimvald', 'kaldrok', None, 'morvella', 'oktavor', 'vorgrub']
NAMES = {'gulgor': 'Gulgor', 'veylith': 'Veylith', 'prismor': 'Prismor', 'khepsar': 'Khepsar', 'rimvald': 'Rimvald', 'kaldrok': 'Kaldrok', 'morvella': 'Morvella', 'oktavor': 'Oktavor', 'vorgrub': 'Vorgrub'}
lines = s.split('\n'); done = []
for i, ln in enumerate(lines):
    key = None
    m = re.search(r"sheet: '([a-z_]+)'", ln)
    if m: key = m.group(1)
    else:
        for k, n in NAMES.items():
            if ln.strip().startswith("{ name: { en: '%s'" % n): key = k
    if not key or key not in M: continue
    w, h, off = M[key]
    new, c = re.subn(r"\bw: \d+, h: \d+", 'w: %d, h: %d' % (w, h), ln, count=1)
    assert c == 1, ln[:80]
    lines[i] = new; done.append(key)
s = '\n'.join(lines)
assert sorted(done) == sorted(M.keys()), set(M) - set(done)
offs = {k: v[2] for k, v in M.items() if v[2]}
a = "  const SHEET_SCALE = { oktavor: 1.5 };"
assert s.count(a) == 1
s = s.replace(a, a + "\n  const SHEET_OFF = %s;   // body centre minus feet anchor (px): the art is shifted so its body sits on the hitbox" % json.dumps(offs).replace('"', "'").replace(':', ': ').replace(',', ', '))
a = "  function drawSheetFrame(fr, x, bot, flip, flash, al, k) {\n"
assert s.count(a) == 1
s = s.replace(a, "  function drawSheetFrame(fr, x, bot, flip, flash, al, k, off) {\n    x -= (off || 0) * (flip ? -1 : 1) * (k || 1);\n")
a = "(b.flash > 0 && !SH.st.hurt), al, (SHEET_SCALE[b.cfg.sheet || BOSS_SHEET[Q.li]] || 1) * (b.morph ? P.sx : 1));"
assert s.count(a) == 1
s = s.replace(a, "(b.flash > 0 && !SH.st.hurt), al, (SHEET_SCALE[b.cfg.sheet || BOSS_SHEET[Q.li]] || 1) * (b.morph ? P.sx : 1), SHEET_OFF[b.cfg.sheet || BOSS_SHEET[Q.li]] / (SHEET_SCALE[b.cfg.sheet || BOSS_SHEET[Q.li]] || 1));")
io.open(p, 'w', encoding='utf-8').write(s); print(json.dumps(M))
