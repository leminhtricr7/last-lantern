# P0 crash guards: time never runs backwards, a failing frame resets the canvas instead of freezing the game,
# no negative radii / frame indexes, and a damaged save no longer stops the game from starting.
import io
def patch(p, pairs):
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        assert s.count(a) == 1, p + ' COUNT %d: ' % s.count(a) + a[:90]
        s = s.replace(a, b)
    io.open(p, 'w', encoding='utf-8').write(s)

patch('src/game.js', [
    # 1) a frame step can never get a negative time (the co-op worker and the browser's frames can interleave)
    ("    let dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;",
     "    let dt = clamp((now - (frame.last || now)) / 1000, 0, 0.05); frame.last = Math.max(frame.last || 0, now);"),
    # 2) an error inside one frame: log it once, reset the canvases and the queues, carry on (back to the title if it keeps failing)
    ("  function frame(now) {\n    requestAnimationFrame(frame);\n    step(now);\n  }",
     """  function frame(now) {
    requestAnimationFrame(frame);
    safeStep(now);
  }
  let stepFails = 0; const stepSeen = new Set();
  function safeStep(now) {
    try { step(now); stepFails = 0; }
    catch (e) {
      stepFails++; const msg = String(e && e.message); if (!stepSeen.has(msg)) { stepSeen.add(msg); console.error('[Last Lantern] frame error:', e); }
      for (const c of [g, ctx]) { try { if (c.reset) c.reset(); else { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; } } catch (e2) {} }
      texts = []; uiCov = []; HIQ.length = 0; clearPressed();
      if (stepFails > 90 && !coop && scene !== 'title') { stepFails = 0; try { enterScene('title'); } catch (e3) {} }
    }
  }"""),
    ("    wk.onmessage = () => { if (document.hidden && coop) step(performance.now()); };",
     "    wk.onmessage = () => { if (document.hidden && coop) safeStep(performance.now()); };"),
    # 3) a meteor summon's ground shadow never gets a negative size
    ("g.beginPath(); g.ellipse(x, y, 10 + k * 20, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }",
     "g.beginPath(); g.ellipse(x, y, Math.max(1, 10 + k * 20), 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }"),
    # 4) a damaged save: keep a copy of it, then start from whatever can be read
    ("  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVEKEY) || '{}')); } catch (e) { }",
     """  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVEKEY) || '{}')); } catch (e) { try { localStorage.setItem(SAVEKEY + '_broken', localStorage.getItem(SAVEKEY) || ''); } catch (e2) { } }
  if (!Array.isArray(save.cleared)) save.cleared = []; save.cleared = save.cleared.filter(n => Number.isInteger(n));
  if (!save.shards || typeof save.shards !== 'object' || Array.isArray(save.shards)) save.shards = {};
  for (const k in save.shards) if (!Array.isArray(save.shards[k])) delete save.shards[k];
  for (const k of ['seen', 'films']) if (save[k] && typeof save[k] !== 'object') save[k] = {};
  if (typeof save.coins !== 'number' || !isFinite(save.coins)) save.coins = 0;
  save.v = 2;   // save format version"""),
])
patch('src/art.js', [
    # 5) a sprite frame index can never be negative or missing
    ("  const frames = ART[name] || [DECOR[name]];\n  const rows = frames[frame % frames.length];",
     "  const frames = ART[name] || [DECOR[name]], fi = Number.isFinite(frame) ? Math.floor(frame) : 0;\n  const rows = frames[((fi % frames.length) + frames.length) % frames.length] || frames[0] || [' '];"),
])
print('ok')
