  // ===================== FILMS: the 60 s intro and the 60 s outro =====================
  // Cinematic pixel art: parallax scrolling (layers that move at different speeds), depth of field (far and near layers
  // pre-blurred), volumetric god rays, dynamic shadows, glow, particles. Every frame then goes through a post-processing
  // pass: bloom, colour grade, vignette, film grain, letterbox bars.
  let cn = null, cnBoot = true; const CNA = {};
  const CN_LEN = { intro: 60, outro: 60 }, CN_GY = 176, CN_BAR = 18;
  const CN_SUMS = ['dragonking', 'ninetail', 'titan', 'phoenix'];
  function startCine(kind, next, gate) { cn = { kind, t: 0, fired: {}, next: next || 'title', gate: !!gate }; CN_SUMS.forEach(k => sumArt(k)); Snd.ambience(null); if (!gate) cnBegin(); }
  function cnBegin() { cn.gate = false; Snd.init(); Snd.cine('sad', 2.5); }
  function cnEnd() { if (!cn || cn.done) return; cn.done = true; Snd.cine(null, 1); if (cn.kind === 'outro') { save.outroSeen = 1; writeSave(); } toScene(cn.next); }
  function updateCine(dt) {
    if (!cn) startCine('intro');
    if (cn.gate) { if (act.okP || act.atkP || act.backP || act.jumpP || Object.keys(pressed).length) cnBegin(); return; }
    if (cn.done) return;
    cn.t += dt; sceneT += dt; const t = cn.t;
    const at = (k, s, fn) => { if (t >= s && !cn.fired[k]) { cn.fired[k] = 1; fn(); } };
    if (cn.kind === 'intro') cnIntroCues(at); else cnOutroCues(at);
    if (t > 1 && (act.okP || act.backP || act.atkP)) { Snd.play('select'); cnEnd(); return; }
    if (t >= CN_LEN[cn.kind]) cnEnd();
  }
  function cnIntroCues(at) {
    for (let i = 0; i < 6; i++) at('w' + i, 0.3 + i * 2.5, () => Snd.play('windy'));
    at('th1', 5.6, () => Snd.play('thunder')); at('rb', 8, () => Snd.play('rumble')); at('th2', 11.2, () => Snd.play('thunder'));
    at('cut2', 15, () => { Snd.cine('build', 0.3); Snd.play('windy'); });
    [15.4, 15.95, 16.5, 17.05].forEach((s, i) => at('st' + i, s, () => Snd.play('bstep')));
    at('land', 17.6, () => Snd.cineHit('taiko')); at('w7', 19.5, () => Snd.play('windy')); at('w8', 23, () => Snd.play('windy'));
    at('eye', 26.4, () => Snd.cineHit('shimmer'));
    at('roar1', 30.2, () => { Snd.cineHit('roar'); Snd.play('rumble'); });
    at('dash', 31.6, () => Snd.play('dash')); at('swing', 33.6, () => Snd.play('whoosh'));
    at('parry', 34.0, () => { Snd.cineHit('parry'); Snd.play('clang'); });
    at('rise', 35.6, () => Snd.cineHit('rise'));
    at('boom', 37.2, () => { Snd.play('explode'); Snd.play('boom'); Snd.cine('epic', 0.1); });
    at('roar2', 39.2, () => { Snd.cineHit('roar'); Snd.cineHit('taiko'); });
    at('go', 45.2, () => Snd.play('dash')); at('go2', 46.6, () => Snd.play('whoosh'));
    at('frz', 48.5, () => { Snd.play('slash'); Snd.cineHit('taiko'); });
    at('sil', 49.9, () => Snd.cine(null, 0.12));
    at('drop', 50.8, () => Snd.cineHit('drop'));
    at('logo', 52.2, () => Snd.cineHit('shimmer')); at('logo2', 55.4, () => Snd.play('chime'));
  }
  function cnOutroCues(at) {
    at('roar', 1.2, () => Snd.cineHit('roar')); at('crk', 3.6, () => Snd.play('rumble'));
    at('dis', 5.5, () => { Snd.play('explode'); Snd.cineHit('rise'); });
    at('calm', 9.5, () => Snd.cine('calm', 3)); at('sun', 12.5, () => Snd.play('chime'));
    at('nod', 27.6, () => Snd.play('chime'));
    [30, 31.4, 32.8, 34.2].forEach((s, i) => at('up' + i, s, () => Snd.cineHit('shimmer')));
    at('sheath', 41.2, () => Snd.play('clang'));
    at('fade', 54, () => Snd.cine(null, 5));
  }

  // ---------- building blocks ----------
  function cnLayer(key, w, h, fn, blur) {   // a pre-rendered layer; blur > 0 = out of focus (depth of field)
    if (CNA[key]) return CNA[key];
    const [c, x] = mkCanvas(w, h); fn(x, w, h, mulberry32(key.length * 977 + w + h));
    if (!blur) return (CNA[key] = c);
    const [c2, x2] = mkCanvas(w, h); x2.filter = 'blur(' + blur + 'px)'; x2.drawImage(c, 0, 0); return (CNA[key] = c2);
  }
  // parallax: a wide layer that repeats sideways
  function cnWrap(img, off, y, a) { const w = img.width, ox = -(((off % w) + w) % w); if (a !== undefined) g.globalAlpha = a; g.drawImage(img, Math.round(ox), Math.round(y)); if (ox + w < VW) g.drawImage(img, Math.round(ox + w), Math.round(y)); g.globalAlpha = 1; }
  function cnSky(key, stops) { return cnLayer(key, 4, VH, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); stops.forEach(s => gr.addColorStop(s[0], s[1])); x.fillStyle = gr; x.fillRect(0, 0, w, h); }); }
  function cnGlow(x, y, r, rgb, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgb + a + ')'); gr.addColorStop(1, rgb + '0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  // volumetric light: soft beams fanning out from a point
  function cnRays(sx, sy, ang, n, rgb, a, t, len, spread) {
    if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const an = ang + (i - (n - 1) / 2) * (spread || 0.12) + Math.sin(t * 0.4 + i * 1.7) * 0.02, w = 0.025 + (i % 3) * 0.014, L = len || 320, al = a * (0.55 + 0.45 * Math.sin(t * 0.7 + i * 2.3));
      const gr = g.createLinearGradient(sx, sy, sx + Math.cos(an) * L, sy + Math.sin(an) * L); gr.addColorStop(0, rgb + al + ')'); gr.addColorStop(1, rgb + '0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(an - w) * L, sy + Math.sin(an - w) * L); g.lineTo(sx + Math.cos(an + w) * L, sy + Math.sin(an + w) * L); g.closePath(); g.fill();
    }
    g.restore();
  }
  // floating particles (ash, embers, star dust) that only depend on time
  function cnMotes(t, n, seed, cols, x0, y0, w, h, vx, vy, sz, a) {
    const q = mulberry32(seed);
    for (let i = 0; i < n; i++) {
      const r1 = q(), r2 = q(), r3 = q(), r4 = q(), r5 = q(), px = x0 + (((r1 * w + t * vx * (0.5 + r3)) % w) + w) % w, py = y0 + (((r2 * h - t * vy * (0.5 + r4)) % h) + h) % h;
      g.globalAlpha = a * (0.45 + 0.55 * Math.sin(t * (2 + r5 * 4) + i)); g.fillStyle = cols[i % cols.length]; const s = r5 < 0.25 ? sz * 2 : sz; g.fillRect(Math.round(px), Math.round(py), s, s);
    }
    g.globalAlpha = 1;
  }
  // dynamic shadow: stretched away from the light
  function cnShadow(x, y, w, a, skew) { g.save(); g.globalAlpha = a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x + (skew || 0) / 2, y, w / 2 + Math.abs(skew || 0) / 2, Math.max(1.5, w / 7), 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  function cnHeroSpr(pose, fr) { const h = HERO[myHero()] || HERO.ember; if (h.custom) return mikuSprite(pose === 'jump' ? 'air' : 'idle', fr & 1); return getSprite('hero_' + pose, h.sw, pose === 'run' ? fr % 4 : pose === 'idle' ? fr % 2 : 0); }
  function cnSword() { return swordSprite((save.inv && save.inv.w && save.inv.w[0]) || 'iron'); }
  // a summon in its Ancient form (bottom-centre pivot), with an optional glow aura
  function cnSum(kind, x, bot, h, flip, a, o) {
    const art = sumArt(kind); if (!art || !art.evo) return null; const im = art.evo, sc = h / im.height, w = im.width * sc; o = o || {};
    g.save(); g.translate(x, bot); if (o.rot) g.rotate(o.rot); g.scale(flip ? -1 : 1, o.sy || 1); g.imageSmoothingEnabled = true;
    if (o.glow > 0) { g.globalCompositeOperation = 'lighter'; g.filter = 'blur(6px) brightness(1.7)'; g.globalAlpha = a * o.glow; g.drawImage(im, -w / 2 - 6, -h - 6, w + 12, h + 12); g.filter = 'none'; g.globalCompositeOperation = 'source-over'; }
    g.globalAlpha = a; if (o.dark) g.filter = 'brightness(' + (1 - o.dark) + ')'; g.drawImage(im, -w / 2, -h, w, h); g.filter = 'none'; g.restore(); g.globalAlpha = 1;
    return { im, w, h };
  }
  // pixel dissolve: the picture breaks into small squares that drift up and fade (top first)
  function cnDissolve(im, x, bot, w, h, k, seed, tint) {
    if (k <= 0 || k >= 1.6) return; const cols = Math.max(4, Math.round(w / 3)), rows = Math.max(4, Math.round(h / 3)), cw = im.width / cols, ch = im.height / rows;
    g.save(); g.imageSmoothingEnabled = true;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const r = (((i * 73856093) ^ (j * 19349663) ^ seed) >>> 0) % 1000 / 1000, d = (j / rows) * 0.55 + r * 0.45, p = clamp((k * 1.5 - d) / 0.5, 0, 1);
      if (p >= 1) continue;
      const dx = x - w / 2 + i * w / cols + Math.sin(r * 20 + p * 6) * p * 16, dy = bot - h + j * h / rows - p * p * 160 - p * 18;
      g.globalAlpha = 1 - p; g.drawImage(im, i * cw, j * ch, cw, ch, dx, dy, w / cols + 0.6, h / rows + 0.6);
      if (p > 0 && r < 0.12) { g.globalCompositeOperation = 'lighter'; g.fillStyle = tint || '#ffe9a8'; g.fillRect(Math.round(dx), Math.round(dy), 2, 2); g.globalCompositeOperation = 'source-over'; }
    }
    g.restore(); g.globalAlpha = 1;
  }
  function cnSolid(im, x, bot, w, h, a) { g.save(); g.globalAlpha = a === undefined ? 1 : a; g.imageSmoothingEnabled = true; g.drawImage(im, x - w / 2, bot - h, w, h); g.restore(); }
  // a cloak blowing in the wind, hung from the hero's shoulders
  function cnCape(x, bot, S, f, t, sprH) {
    const sx = x - f * 1 * S, sy = bot - (sprH - 8) * S, L = 12 * S, N = 12, top = [], btm = [];
    for (let i = 0; i <= N; i++) { const p = i / N, wv = Math.sin(t * 8 - p * 5) * S * 1.4 * p + Math.sin(t * 13 - p * 9) * S * 0.5 * p, bx = sx - f * p * L, by = sy + p * L * 0.32 + wv; top.push([bx, by - S * 1.2 * (1 - p * 0.4)]); btm.push([bx + f * p * S * 1.5, by + S * (2 + 5 * p)]); }
    g.fillStyle = '#8a1e30'; g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = N; i >= 0; i--) g.lineTo(btm[i][0], btm[i][1]); g.closePath(); g.fill();
    g.fillStyle = '#c0304a'; g.beginPath(); top.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = N; i >= 0; i--) g.lineTo((top[i][0] + btm[i][0]) / 2, (top[i][1] + btm[i][1]) / 2 - S * 0.4); g.closePath(); g.fill();
  }
  function cnSub(s, t, a, b) { const k = Math.min(seg(t, a, a + 0.7), 1 - seg(t, b - 0.7, b)); if (k > 0) txt(s, VW / 2, VH - CN_BAR / 2, { al: 'center', size: 6.5, col: '#ece6f6', alpha: k, sh: false }); }

  // ---------- layers ----------
  const cnClouds = (key, c1, c2) => cnLayer(key, 768, 120, (x, w, h, q) => { for (let i = 0; i < 46; i++) { const cx = q() * w, cy = 20 + q() * 70, r = 14 + q() * 30; x.fillStyle = c1; x.beginPath(); x.ellipse(cx, cy, r * 1.8, r * 0.7, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = c2; x.beginPath(); x.ellipse(cx, cy - r * 0.25, r * 1.3, r * 0.35, 0, 0, Math.PI * 2); x.fill(); } }, 2.5);
  const cnFar = () => cnLayer('rfar', 768, 120, (x, w, h, q) => {
    x.fillStyle = '#2a1e2e'; for (let px = 0; px < w; px += 2) { const y = 96 + Math.sin(px * 0.011) * 7 + Math.sin(px * 0.037) * 3; x.fillRect(px, y, 2, h - y); }
    for (let i = 0; i < 9; i++) {
      const bx = i * 85 + q() * 30, tw = 10 + q() * 14, th = 34 + q() * 46, br = q();
      x.fillStyle = '#2a1e2e'; for (let k = 0; k < tw; k += 2) { const hh = th - (q() < 0.6 ? q() * 12 : 0) - (k > tw * 0.5 ? br * 16 : 0); x.fillRect(bx + k, 102 - hh, 2, hh); }
      const ww = 30 + q() * 30, wh = 12 + q() * 10; for (let k = 0; k < ww; k += 3) x.fillRect(bx + tw + k, 102 - wh - (k % 6 ? 0 : 3) - (q() < 0.2 ? -6 : 0), 3, wh + 3);
      for (let k = 0; k < 3; k++) { const lit = q() < 0.55; x.fillStyle = lit ? '#ff8a3a' : '#160f1a'; x.fillRect(bx + 3 + q() * (tw - 6), 102 - th + 8 + k * 9, 2, 3); }
    }
  }, 1.2);
  const cnMid = () => cnLayer('rmid', 1024, 150, (x, w, h, q) => {
    x.fillStyle = '#150f1b'; x.fillRect(0, 128, w, 22);
    for (let i = 0; i < 12; i++) {
      const bx = i * 86 + q() * 20, kind = q();
      if (kind < 0.45) { const cw = 10 + q() * 6, chh = 40 + q() * 70; x.fillStyle = '#150f1b'; x.fillRect(bx, 130 - chh, cw, chh); x.fillRect(bx - 3, 130 - chh, cw + 6, 5); x.fillStyle = '#3a2a3e'; x.fillRect(bx, 130 - chh, 1, chh); x.fillRect(bx - 3, 130 - chh, cw + 6, 1); for (let k = 0; k < cw; k += 2) { x.fillStyle = '#150f1b'; x.fillRect(bx + k, 130 - chh - 2 - q() * 6, 2, 8); } }
      else if (kind < 0.7) { x.strokeStyle = '#150f1b'; x.lineWidth = 7; x.beginPath(); x.arc(bx + 26, 96, 24, Math.PI, Math.PI * (1.55 + q() * 0.4)); x.stroke(); x.fillStyle = '#150f1b'; x.fillRect(bx, 96, 7, 34); x.fillRect(bx + 45, 96 + q() * 10, 7, 34); x.strokeStyle = '#3a2a3e'; x.lineWidth = 1; x.beginPath(); x.arc(bx + 26, 96, 27.5, Math.PI, Math.PI * 1.5); x.stroke(); }
      else { x.fillStyle = '#2a1a1e'; x.fillRect(bx + 10, 40, 2, 90); x.fillStyle = '#5a1820'; x.beginPath(); x.moveTo(bx + 12, 44); x.lineTo(bx + 30, 46); for (let k = 0; k <= 6; k++) x.lineTo(bx + 30 - k * 3, 90 + (k % 2 ? 8 : 0) + q() * 6); x.lineTo(bx + 12, 84); x.closePath(); x.fill(); x.fillStyle = '#c89a3a'; x.fillRect(bx + 18, 58, 5, 5); }
      x.fillStyle = '#150f1b'; x.fillRect(bx + 40, 122 - q() * 4, 20 + q() * 18, 10);
    }
  });
  const cnGround = () => cnLayer('rgnd', 1400, 50, (x, w, h, q) => {
    x.fillStyle = '#1c1318'; x.fillRect(0, 6, w, h); x.fillStyle = '#4a3238'; x.fillRect(0, 6, w, 1); x.fillStyle = '#2e1f26'; x.fillRect(0, 7, w, 2);
    x.fillStyle = '#0c080c'; for (let i = 0; i < 70; i++) { let cx = q() * w, cy = 10 + q() * 30; for (let k = 0; k < 6; k++) { x.fillRect(Math.round(cx), Math.round(cy), 2, 1); cx += 2 + q() * 3; cy += q() * 2 - 1; } }
    for (let i = 0; i < 26; i++) { const sx = q() * w, ang = (q() - 0.5) * 0.6, L = 12 + q() * 8; x.save(); x.translate(sx, 8); x.rotate(ang); x.fillStyle = '#8a8a98'; x.fillRect(-1, -L, 2, L); x.fillStyle = '#5a4030'; x.fillRect(-4, -L - 1, 8, 2); x.fillRect(-1, -L - 5, 2, 4); x.restore(); }
    for (let i = 0; i < 14; i++) { const sx = q() * w; x.fillStyle = '#3a3646'; x.beginPath(); x.ellipse(sx, 9, 6, 4, 0, Math.PI, 0); x.fill(); x.fillStyle = '#6a3a2a'; x.fillRect(sx - 1, 6, 2, 2); }
  });
  const cnFore = () => cnLayer('rfg', 1400, 80, (x, w, h, q) => { x.fillStyle = '#050307'; for (let i = 0; i < 16; i++) { const cx = q() * w, r = 18 + q() * 26; x.beginPath(); x.ellipse(cx, h, r * 1.4, r, 0, Math.PI, 0); x.fill(); } for (let i = 0; i < 90; i++) { const cx = q() * w, L = 10 + q() * 22; x.fillRect(cx, h - L, 2, L); } }, 2.5);
  const cnMtn = () => cnLayer('mtn2', 768, 150, (x, w, h, q) => { for (const [b, a, c] of [[60, 34, '#2a2440'], [90, 24, '#1c1830']]) { x.fillStyle = c; for (let px = 0; px < w; px++) { const y = b + Math.sin(px * 0.013 + a) * a * 0.6 + Math.abs(Math.sin(px * 0.041 + a)) * -a * 0.5; x.fillRect(px, y, 1, h - y); } } }, 3);
  const cnHills = (key, stops) => cnLayer(key, 768, 120, (x, w, h, q) => stops.forEach(([b, a, c], k) => { x.fillStyle = c; for (let px = 0; px < w; px++) { const y = b + Math.sin(px * (0.008 + k * 0.004) + k * 2) * a + Math.sin(px * 0.03 + k) * a * 0.3; x.fillRect(px, y, 1, h - y); } }), 0);
  const cnGrass = () => cnLayer('ograss', 1400, 50, (x, w, h, q) => { x.fillStyle = '#2e4a2a'; x.fillRect(0, 6, w, h); x.fillStyle = '#6aa04a'; x.fillRect(0, 6, w, 1); for (let i = 0; i < 400; i++) { const sx = q() * w, L = 2 + q() * 5; x.fillStyle = q() < 0.5 ? '#4a7a3a' : '#7ab85a'; x.fillRect(sx, 7 - L, 1, L); } for (let i = 0; i < 60; i++) { x.fillStyle = ['#ffd34e', '#ff8fbf', '#ffffff', '#9fe8ff'][i % 4]; x.fillRect(q() * w, 4 + q() * 3, 2, 2); } x.fillStyle = '#3a2a24'; for (let i = 0; i < 12; i++) { const sx = q() * w; x.fillRect(sx, 9, 3, 30); } });
  function cnLogo() {
    if (CNA.logo) return CNA.logo; const W = 320, H = 64, [c, x] = mkCanvas(W, H);
    x.font = 'bold 36px ' + FONT; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = '3px';
    x.lineWidth = 5; x.strokeStyle = '#2a0a10'; x.lineJoin = 'round'; x.strokeText('LAST LANTERN', W / 2, H / 2 + 1);
    const gr = x.createLinearGradient(0, 14, 0, 50); gr.addColorStop(0, '#fffbe0'); gr.addColorStop(0.5, '#ffd34e'); gr.addColorStop(1, '#e07a1a'); x.fillStyle = gr; x.fillText('LAST LANTERN', W / 2, H / 2);
    const d = x.getImageData(0, 0, W, H).data, blocks = [], q = mulberry32(4242);
    for (let by = 0; by < H; by += 3) for (let bx = 0; bx < W; bx += 3) { let on = false; for (let yy = 0; yy < 3 && !on; yy++) for (let xx = 0; xx < 3; xx++) if (d[((by + yy) * W + bx + xx) * 4 + 3] > 40) { on = true; break; } if (on) blocks.push({ x: bx, y: by, r: q() * 0.85 + (Math.abs(bx - W / 2) / W) * 0.15 }); }
    return (CNA.logo = { c, W, H, blocks });
  }

  // ---------- post-processing: bloom, colour grade, vignette, grain, letterbox ----------
  function cnPost(o) {
    const bw = VW >> 1, bh = VH >> 1;
    if (!CNA.bA) { CNA.bA = mkCanvas(bw, bh); CNA.bB = mkCanvas(bw, bh); CNA.full = mkCanvas(VW, VH); }
    if (o.desat) { const [fc, fx] = CNA.full; fx.clearRect(0, 0, VW, VH); fx.drawImage(g.canvas, 0, 0); g.save(); g.filter = 'grayscale(' + o.desat + ') contrast(1.5) brightness(1.08)'; g.drawImage(fc, 0, 0); g.restore(); }
    if (o.bloom > 0) {
      const [ac, ax] = CNA.bA, [bc, bx] = CNA.bB;
      ax.globalCompositeOperation = 'copy'; ax.imageSmoothingEnabled = true; ax.filter = 'brightness(' + (o.thr || 0.85) + ') contrast(2.6) saturate(1.3)'; ax.drawImage(g.canvas, 0, 0, bw, bh); ax.filter = 'none';
      bx.globalCompositeOperation = 'copy'; bx.filter = 'blur(4px)'; bx.drawImage(ac, 0, 0); bx.filter = 'none';
      g.save(); g.imageSmoothingEnabled = true; g.globalCompositeOperation = 'lighter'; g.globalAlpha = o.bloom; g.drawImage(bc, 0, 0, VW, VH); g.globalAlpha = o.bloom * 0.5; g.filter = 'blur(6px)'; g.drawImage(bc, 0, 0, VW, VH); g.restore();
    }
    if (o.grade) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = o.grade; g.fillRect(0, 0, VW, VH); g.restore(); }
    if (!CNA.vig) { const [vc, vx] = mkCanvas(VW, VH), gr = vx.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); vx.fillStyle = gr; vx.fillRect(0, 0, VW, VH); CNA.vig = vc; }
    g.globalAlpha = o.vig === undefined ? 0.6 : o.vig; g.drawImage(CNA.vig, 0, 0); g.globalAlpha = 1;
    if (o.grain !== 0) { g.fillStyle = '#ffffff'; for (let i = 0; i < 160; i++) { g.globalAlpha = Math.random() * 0.06; g.fillRect((Math.random() * VW) | 0, (Math.random() * VH) | 0, 1, 1); } g.globalAlpha = 1; }
    if (o.black > 0) { g.globalAlpha = Math.min(1, o.black); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    if (o.white > 0) { g.globalAlpha = Math.min(1, o.white); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, CN_BAR); g.fillRect(0, VH - CN_BAR, VW, CN_BAR);
  }

  // ---------- INTRO ----------
  function cnIntro1(t) {   // 0-15 s  despair: a wide, slow pan over the fallen kingdom
    const cam = ez(seg(t, 0, 15)) * 560 + t * 4;
    g.drawImage(cnSky('sky1', [[0, '#07060e'], [0.45, '#1c1424'], [0.75, '#3a1e22'], [1, '#5a2a1e']]), 0, 0, VW, VH);
    cnGlow(VW * 0.75 - cam * 0.05, 120, 170, 'rgba(255,90,40,', 0.22);
    for (const [s0, sd] of [[5.6, 3], [11.2, 9]]) { const age = t - s0; if (age > 0 && age < 0.5) { const r = mulberry32(sd); let px = 80 + r() * 220, py = 0; g.globalAlpha = 1 - age * 2; g.strokeStyle = '#e8e0ff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px, py); for (let i = 0; i < 6; i++) { px += (r() - 0.5) * 26; py += 14; g.lineTo(px, py); } g.stroke(); g.globalAlpha = 0.25 * (1 - age * 2); g.fillStyle = '#c8c0ff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; } }
    cnWrap(cnClouds('cl1', '#241c30', '#3a2e48'), cam * 0.08 + t * 7, 0, 0.9);
    cnWrap(cnFar(), cam * 0.18, 66);
    for (let i = 0; i < 5; i++) { const sx = ((i * 157 - cam * 0.18) % 768 + 768) % 768 - 40; for (let k = 0; k < 8; k++) { const p = ((t * 0.12 + k / 8 + i * 0.13) % 1); g.globalAlpha = 0.18 * (1 - p); g.fillStyle = '#2e2632'; const r = 6 + p * 22; g.beginPath(); g.arc(sx + Math.sin(p * 4 + i) * 8 + p * 30, 150 - p * 120, r, 0, Math.PI * 2); g.fill(); } } g.globalAlpha = 1;
    cnRays(40, -30, 1.15, 5, 'rgba(170,160,220,', 0.06, t, 300, 0.14);
    cnWrap(cnMid(), cam * 0.45, CN_GY - 128);
    cnWrap(cnGround(), cam, CN_GY - 6);
    cnMotes(t, 70, 11, ['#ff8a3a', '#ffd34e', '#ffb070'], 0, 20, VW, VH - 20, 6, 14, 1, 0.8);
    cnMotes(t, 60, 12, ['#7a7088', '#9a90a8'], 0, 0, VW, VH, 18, -8, 1, 0.5);
    cnWrap(cnFore(), cam * 1.6, VH - 80);
    cnSub(sv('The kingdom of Aurelia has fallen...', 'Vương quốc Aurelia đã sụp đổ...'), t, 2.5, 7.5);
    cnSub(sv('The Sun is shattered. Darkness swallows everything.', 'Mặt Trời vỡ tan. Bóng tối nuốt chửng mọi thứ.'), t, 8.3, 13.8);
    return { bloom: 0.45, grade: 'rgba(70,60,140,.35)', vig: 0.7, black: 1 - seg(t, 0, 2.5) + seg(t, 14.6, 15) };
  }
  function cnIntro2(t) {   // 15-30 s  a glimmer of light: extreme close-up, the camera climbs from the boots to the eyes
    const u = t - 15, S = 16, walk = u < 2.4, spr = cnHeroSpr(walk ? 'run' : 'idle', walk ? Math.floor(u * 7) : Math.floor(u * 2.2)), sh = spr.h;
    const eyeOff = (sh - 7) * S, tiltMax = Math.max(0, eyeOff + 82 - (VH - 34)), tilt = ez(seg(u, 3.4, 10.5)) * tiltMax, bot = VH - 34 + tilt;
    g.drawImage(cnSky('sky2', [[0, '#0b0a18'], [0.55, '#2a2040'], [1, '#6a3446']]), 0, 0, VW, VH);
    cnRays(VW * 0.85, -20, 2.05, 5, 'rgba(210,200,255,', 0.08 + seg(u, 8, 12) * 0.08, t, 320, 0.13);
    cnWrap(cnMtn(), u * 5, 60 + tilt * 0.22);
    cnWrap(cnClouds('cl2', '#2c2440', '#463a5c'), u * 46, -10 + tilt * 0.12, 0.75);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; for (let i = 0; i < 14; i++) { const y = ((i * 37) % 180) + 20, x = ((u * 520 + i * 97) % (VW + 120)) - 60; g.beginPath(); g.moveTo(VW - x, y); g.lineTo(VW - x + 30 + (i % 3) * 10, y + 2); g.stroke(); }
    // the rock he climbs on
    g.fillStyle = '#231e2c'; g.beginPath(); g.moveTo(-10, VH + 40); g.lineTo(-10, bot + 26); g.lineTo(60, bot + 4); g.lineTo(110, bot); g.lineTo(300, bot); g.lineTo(340, bot + 12); g.lineTo(VW + 10, bot + 40); g.lineTo(VW + 10, VH + 300); g.closePath(); g.fill();
    g.fillStyle = '#6a5a7e'; g.fillRect(110, Math.round(bot), 190, 2); g.fillStyle = '#3a3048'; g.fillRect(110, Math.round(bot) + 2, 190, 3);
    g.fillStyle = '#14101a'; for (let i = 0; i < 8; i++) g.fillRect(120 + i * 23, Math.round(bot) + 8 + (i % 3) * 7, 14, 2);
    const hx = walk ? -60 + 230 * ez(u / 2.4) : 170;
    cnShadow(hx + 10, bot + 1, 7 * S, 0.45, 40);
    cnCape(hx, bot, S, 1, t, sh);
    drawSpr(g, spr, Math.round(hx), Math.round(bot), false, false, S, S);
    if (walk && Math.floor(u * 7) % 2 === 0) cnMotes(t, 10, 7, ['#8a7a9a'], hx - 40, bot - 12, 80, 10, 0, 20, 2, 0.5);
    // the hand closes on the sword; light runs along the blade
    if (u > 9.5) { const sw = cnSword(), k = ez(seg(u, 9.5, 10.6)), hxH = hx + 5 * S, hyH = bot - 8 * S; g.save(); g.translate(hxH, hyH + (1 - k) * 60); g.rotate(-Math.PI / 2 + 0.18); drawSpr(g, sw, sw.w * S * 0.45 / 2, sw.h * S * 0.45 / 2, false, false, S * 0.45, S * 0.45); g.restore(); const gp = seg(u, 12.2, 13.4); if (gp > 0 && gp < 1) cnGlow(hxH + 4, hyH - gp * sw.w * S * 0.45, 26, 'rgba(255,255,230,', 0.9); }
    const ep = seg(u, 11.2, 12.4); if (ep > 0 && ep < 1) { const ex = hx + 3 * S, ey = bot - eyeOff, a = Math.sin(ep * Math.PI); cnGlow(ex, ey, 40, 'rgba(255,230,160,', a); g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(ex - 30 * a, ey, 60 * a, 1); g.fillRect(ex, ey - 10 * a, 1, 20 * a); }
    cnMotes(t, 40, 21, ['#ffe9a8', '#ffffff'], 0, 0, VW, VH, -60, 4, 1, 0.35 + seg(u, 8, 14) * 0.4);
    cnSub(sv('But one last lantern still burns...', 'Nhưng vẫn còn một ngọn đèn cuối cùng đang cháy...'), t, 26.2, 29.8);
    return { bloom: 0.28 + seg(u, 8, 14) * 0.14, thr: 0.75, grade: 'rgba(120,90,160,.3)', vig: 0.65 };
  }
  function cnIntro3(t, four) {   // 30-45 s  the summoning; four = the final charge (45-50 s) reuses this stage
    const u = four ? 15 : t - 30, v = four ? Math.min(t - 45, 3.5) : 0, low = ez(seg(u, 7.0, 8.2)), blaze = seg(u, 5.6, 7.2) * (1 - seg(u, 7.2, 9));
    g.drawImage(cnSky('sky3', [[0, '#120814'], [0.5, '#3a1424'], [0.8, '#8a3a24'], [1, '#c86a2a']]), 0, 0, VW, VH);
    if (blaze > 0 || u >= 7.2) { g.globalAlpha = Math.min(1, blaze * 0.8 + (u >= 7.2 ? 0.45 : 0)); g.drawImage(cnSky('sky3g', [[0, '#3a2a10'], [0.6, '#c88a2a'], [1, '#ffe08a']]), 0, 0, VW, VH); g.globalAlpha = 1; }
    let shx = 0, shy = 0; const shk = (u > 0.4 && u < 2.4 ? 2 : 0) + (u > 4 && u < 4.5 ? 4 : 0) + (u > 7.2 && u < 8 ? 5 : 0) + (u > 9.2 && u < 10.4 ? 3 : 0) + (four && v > 3.3 ? 0 : 0);
    if (shk) { shx = (Math.random() - 0.5) * shk * 2; shy = (Math.random() - 0.5) * shk * 2; }
    const pan = four ? ez(seg(v, 0, 3.5)) * -70 : 0, z = 1 + low * 0.16 + (four ? ez(seg(v, 0, 3.5)) * 0.12 : 0);
    g.save(); g.translate(VW / 2 + shx, VH - 24 + shy); g.scale(z, z * (1 + low * 0.07)); g.translate(-VW / 2 - pan, -(VH - 24) + low * 10);
    cnWrap(cnClouds('cl3', '#3a1a2a', '#6a2a2a'), t * 9, -6, 0.85);
    cnWrap(cnFar(), 300 + t * 2, 66); cnWrap(cnMid(), 520 + t * 5, CN_GY - 128); cnWrap(cnGround(), 900, CN_GY - 6);
    // the boss
    const B = bossSprite(5), bs = 3.1;
    let bx = u < 2.4 ? 470 - 320 * Math.pow(seg(u, 0, 2.4), 2) : 150, bflip = u >= 2.9;
    if (u >= 3.0 && u < 4.0) bx = 150 + 80 * ez(seg(u, 3.0, 3.6)); if (u >= 4.0) bx = 230 - 110 * ez(seg(u, 4.35, 5.3));
    if (four) bx = 120 - ez(seg(v, 2.6, 3.5)) * 8;
    const cower = u > 9.2 ? 0.08 : 0, bdark = u > 7.2 ? 0.45 : 0;
    cnShadow(bx, CN_GY + 1, B.w * bs * 0.8, 0.5, 30);
    g.save(); g.translate(bx, CN_GY); g.scale(1, 1 - cower); if (bdark) g.filter = 'brightness(' + (1 - bdark) + ')'; drawSpr(g, B, 0, 0, bflip, u > 4 && u < 4.2, bs, bs); g.filter = 'none'; g.restore();
    if (u < 2.4 && u > 0.3) cnMotes(t, 26, 31, ['#6a5040', '#8a7060'], bx, CN_GY - 26, 120, 26, -90, 30, 2, 0.8);
    // its great axe: raised, swung, then knocked away by the parry
    const axe = (x, y, a, s) => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = '#4a3020'; g.fillRect(-2, -40, 4, 52); g.fillStyle = '#9aa0b0'; g.beginPath(); g.moveTo(2, -40); g.quadraticCurveTo(26, -30, 18, -12); g.lineTo(2, -18); g.closePath(); g.fill(); g.fillStyle = '#e0e6f0'; g.fillRect(16, -30, 2, 14); g.restore(); };
    const hand = [bx + (bflip ? 34 : -34), CN_GY - 92];
    if (u < 4.0 && !four) axe(hand[0], hand[1], u < 3.6 ? (bflip ? -0.6 : 0.6) : (bflip ? -0.6 + 1.9 * seg(u, 3.6, 4.0) : 0.6), 1.6);
    else if (!four && u < 7) { const k = seg(u, 4.35, 6.2); axe(hand[0] - k * 200, hand[1] - Math.sin(k * Math.PI) * 120 + k * 40, (bflip ? 1.3 : 0) + k * 14, 1.6); }
    // the summon: the Golden Dragon comes down from a blazing sky
    const dragonOn = u >= 7.2, dk = ez(seg(u, 7.2, 9.0));
    if (dragonOn) {
      const dx = four ? 230 - ez(seg(v, 0.4, 3.3)) * 70 : 232, dbot = (four ? CN_GY - 4 - ez(seg(v, 0.4, 3.3)) * 24 : CN_GY + 8) - (1 - dk) * 300, dh = 176 * (four ? 1 + ez(seg(v, 0, 3.5)) * 0.1 : 1), pulse = 0.5 + 0.2 * Math.sin(t * 4);
      cnRays(dx, dbot - dh * 0.55, -Math.PI / 2, 14, 'rgba(255,220,120,', 0.16 * dk, t, 300, 0.42);
      cnGlow(dx, dbot - dh * 0.5, 170, 'rgba(255,200,90,', 0.45 * dk);
      cnSum('dragonking', dx, dbot, dh, true, 1, { glow: pulse * dk, sy: u > 9.2 && u < 10 ? 1.03 : 1 });
      if (u > 9.2 && u < 11) { const rk = seg(u, 9.2, 11); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,230,150,' + (1 - rk) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(dx - 60, dbot - dh * 0.75, rk * 260, 0, Math.PI * 2); g.stroke(); g.restore(); }
      cnMotes(t, 60, 41, ['#ffe08a', '#ffffff', '#ffb040'], dx - 160, dbot - dh, 320, dh, 8, 26, 1, 0.9 * dk);
    }
    // the hero
    let hx = 170, hf = 1, pose = 'idle', hy = 0;
    if (u >= 1.6 && u < 2.1) { hx = 170 + 160 * ez(seg(u, 1.6, 2.1)); pose = 'run'; } else if (u >= 2.1) { hx = 330; hf = -1; }
    if (u >= 5.6 && !four) { pose = 'jump'; hy = -4 * ez(seg(u, 5.6, 6)); hf = -1; }
    if (four) { hx = 330 - 190 * ez(seg(v, 0.2, 3.2)); pose = v < 3.3 ? 'run' : 'jump'; hf = -1; }
    const HS = 2.4, spr = cnHeroSpr(pose, Math.floor(t * 12));
    if (u >= 1.6 && u < 2.3 && !four) for (let i = 1; i <= 5; i++) { const ghost = 170 + 160 * ez(seg(u - i * 0.04, 1.6, 2.1)); g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, ghost, CN_GY, false, true, HS, HS, 0.4 - i * 0.06); g.globalCompositeOperation = 'source-over'; }
    if (four) for (let i = 1; i <= 4; i++) { g.globalCompositeOperation = 'lighter'; drawSpr(g, spr, hx + i * 9, CN_GY, true, true, HS, HS, 0.3 - i * 0.06); g.globalCompositeOperation = 'source-over'; }
    cnShadow(hx, CN_GY + 1, 18, 0.5, dragonOn ? -16 : 10);
    if (pose === 'jump' && !four) { const sw = cnSword(); g.save(); g.translate(hx + 2, CN_GY - spr.h * HS + 2 + hy); g.rotate(-Math.PI / 2); drawSpr(g, sw, sw.w * 0.8, sw.h * 0.6, false, false, 1.6, 1.6); g.restore(); }
    drawSpr(g, spr, Math.round(hx), Math.round(CN_GY + hy), hf < 0, false, HS, HS);
    // parry: a ring of white light where the axe hits the guard
    if (!four && u > 3.85 && u < 4.6) { const k = seg(u, 3.85, 4.6), px = hx - 12, py = CN_GY - 26; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(159,232,255,' + (1 - k) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 10 + k * 70, 0, Math.PI * 2); g.stroke(); g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(px + 6, py, 14, Math.PI - 1.1, Math.PI + 1.1); g.stroke(); g.restore(); cnGlow(px, py, 60, 'rgba(200,240,255,', 1 - k); for (let i = 0; i < 16; i++) { const a = i * 0.39, r = 8 + k * 90; g.fillStyle = i % 2 ? '#ffffff' : '#ffd34e'; g.fillRect(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.7, 2, 2); } }
    // a pillar of light and the cracking ground as the summon is called
    if (!four && u > 5.8 && u < 8.4) { const k = seg(u, 5.8, 7.2), f = 1 - seg(u, 7.6, 8.4); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(hx - 16, 0, hx + 16, 0); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(0.5, 'rgba(255,240,190,' + (0.8 * k * f) + ')'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.fillRect(hx - 16 - k * 10, -40, 32 + k * 20, CN_GY + 40); g.restore();
      g.strokeStyle = 'rgba(255,200,90,' + (0.9 * f) + ')'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { const d = i % 2 ? 1 : -1, L = k * (40 + i * 18); let px = hx, py = CN_GY + 2; g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 5; s++) { px += d * L / 5; py += ((i * 7 + s * 3) % 5 - 2) * 0.8 + 0.4; g.lineTo(px, py); } g.stroke(); } }
    // the charge: speed lines
    if (four && v < 3.5) { g.strokeStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 22; i++) { const y = 20 + (i * 47) % 170, x = ((t * 900 + i * 131) % (VW + 200)) - 100 + pan; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40 + (i % 4) * 14, y); g.stroke(); } }
    cnMotes(t, 50, 51, ['#ff8a3a', '#ffd34e'], pan, 20, VW, VH - 20, 10, 30, 1, 0.7);
    g.restore();
    const flash = (u > 4 && u < 4.25 ? 0.85 * (1 - seg(u, 4, 4.25)) : 0) + (u > 7.2 && u < 7.8 ? 1 - seg(u, 7.2, 7.8) : 0);
    return { bloom: 0.6 + blaze * 0.4 + (u >= 7.2 ? 0.25 : 0), thr: 0.9, grade: u >= 7.2 ? 'rgba(255,170,60,.3)' : 'rgba(255,90,60,.25)', vig: 0.6, white: flash };
  }
  function cnIntro4(t) {   // 45-60 s  the charge, freeze frame, black, the logo
    if (t < 50.8) {
      const v = t - 45, o = cnIntro3(t, true);
      if (v >= 3.5) { o.desat = 0.85; o.white = Math.max(o.white || 0, v < 3.7 ? 0.9 * (1 - seg(v, 3.5, 3.7)) : 0); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 2; for (let i = 0; i < 28; i++) { const a = i * 0.224, r0 = 70 + (i % 3) * 12; g.beginPath(); g.moveTo(VW / 2 + Math.cos(a) * r0, VH / 2 + Math.sin(a) * r0 * 0.6); g.lineTo(VW / 2 + Math.cos(a) * 320, VH / 2 + Math.sin(a) * 200); g.stroke(); } }
      o.black = seg(v, 4.9, 5.7);
      return o;
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    const L = cnLogo(), k = seg(t, 52.2, 55.6), ox = Math.round(VW / 2 - L.W / 2), oy = 64;
    for (const b of L.blocks) { if (b.r > k) continue; const fresh = k - b.r < 0.05; g.drawImage(L.c, b.x, b.y, 3, 3, ox + b.x, oy + b.y, 3, 3); if (fresh) { g.fillStyle = '#ffffff'; g.fillRect(ox + b.x, oy + b.y, 3, 3); } }
    const q = mulberry32(77); for (let i = 0; i < 26; i++) { const b = L.blocks[Math.floor(q() * L.blocks.length)], ph = q() * 6, s = Math.max(0, Math.sin(t * 3 + ph)); if (!b || b.r > k || s < 0.6) { q(); continue; } const sx = ox + b.x + 1, sy = oy + b.y + 1, r = 2 + q() * 3 * s; g.fillStyle = '#fffbe0'; g.fillRect(sx - r, sy, r * 2 + 1, 1); g.fillRect(sx, sy - r, 1, r * 2 + 1); }
    cnMotes(t, 50, 61, ['#ffd34e', '#ffe9a8'], 40, 50, VW - 80, 110, 0, 10, 1, 0.4 * k);
    const sk = seg(t, 55.4, 56.6); if (sk > 0) txt(sv('THE SHATTERED SUN', 'NGỌN ĐÈN CUỐI CÙNG'), VW / 2, oy + L.H + 8, { al: 'center', size: 8, bold: true, col: '#ffe9b8', ls: 3, alpha: sk, sh: false });
    if (t > 57.2) txt(sv('Press any key', 'Nhấn phím bất kỳ'), VW / 2, VH - CN_BAR - 10, { al: 'center', size: 6, col: '#8a7fa8', alpha: 0.5 + 0.5 * Math.sin(t * 4) });
    return { bloom: 0.9, thr: 0.95, vig: 0.4 };
  }

  // ---------- OUTRO ----------
  const cnQuoc = () => (typeof QUOC_IMG !== 'undefined' && QUOC_IMG.form7 && QUOC_IMG.form7.ready && QUOC_IMG.form7.frames[0]) || bossSprite(6);
  function cnOutro1(t) {   // 0-20 s  the last boss falls and turns to light; the clouds open
    const a = ez(seg(t, 8.5, 18)), sunY = 150 - 46 * a;
    g.drawImage(cnSky('osky1', [[0, '#0a0814'], [0.6, '#22182e'], [1, '#3a2030']]), 0, 0, VW, VH);
    if (a > 0) { g.globalAlpha = a; g.drawImage(cnSky('osky2', [[0, '#3a5a9a'], [0.55, '#e8a070'], [1, '#ffe0a0']]), 0, 0, VW, VH); g.globalAlpha = 1; }
    cnGlow(VW / 2, sunY, 120, 'rgba(255,220,140,', 0.75 * a); if (a > 0) { g.fillStyle = 'rgba(255,248,220,' + a + ')'; g.beginPath(); g.arc(VW / 2, sunY, 16, 0, Math.PI * 2); g.fill(); }
    const cl = cnClouds('ocl', '#1e1828', '#30283e');
    for (const side of [-1, 1]) { g.save(); g.beginPath(); g.rect(side < 0 ? 0 : VW / 2, 0, VW / 2, VH); g.clip(); g.translate(side * a * 250, 0); cnWrap(cl, t * 4, -4, 1 - a * 0.5); cnWrap(cl, t * 7 + 300, 30, 1 - a * 0.6); g.restore(); }
    cnRays(VW / 2, -30, Math.PI / 2, 11, 'rgba(255,225,160,', 0.2 * a, t, 330, 0.17);
    cnWrap(cnFar(), 200, 66, 1); g.globalAlpha = a * 0.5; g.fillStyle = '#ffb070'; g.globalCompositeOperation = 'soft-light'; g.fillRect(0, 60, VW, 120); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    cnWrap(cnMid(), 400, CN_GY - 128); cnWrap(cnGround(), 700, CN_GY - 6);
    // Quoc staggers, cracks fill with light, then he breaks into rising pixels
    const Qs = cnQuoc(), qh = 150, qw = Qs.w * qh / Qs.h, qx = 250 + Math.sin(t * 7) * (t < 5.5 ? 1.5 : 0), dk = seg(t, 5.5, 12.5);
    cnShadow(qx, CN_GY + 1, qw * 0.7 * (1 - dk), 0.5, -20);
    if (dk <= 0) { cnSolid(Qs.c, qx, CN_GY, qw, qh); const ck = seg(t, 2, 5.5); if (ck > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,240,200,' + ck + ')'; g.lineWidth = 1; for (let i = 0; i < 8; i++) { let px = qx - qw * 0.25 + i * qw * 0.06, py = CN_GY - qh * (0.2 + (i % 4) * 0.17); g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 4; s++) { px += ((i * 5 + s * 3) % 7 - 3) * 2.5 * ck; py -= 6 * ck; g.lineTo(px, py); } g.stroke(); } g.restore(); cnGlow(qx, CN_GY - qh * 0.5, 90, 'rgba(255,230,180,', ck * 0.4); } }
    else cnDissolve(Qs.c, qx, CN_GY, qw, qh, dk, 99, '#ffe9a8');
    if (dk > 0) cnMotes(t, 80, 71, ['#ffe9a8', '#ffffff', '#d58bff'], qx - 120, 0, 240, CN_GY, 6, 40, 1, 0.9 * (1 - seg(t, 13, 19)));
    const spr = cnHeroSpr('idle', Math.floor(t * 2.2)); cnShadow(104, CN_GY + 1, 18, 0.5, a > 0 ? -24 * a : 10); drawSpr(g, spr, 104, CN_GY, false, false, 2.4, 2.4);
    cnMotes(t, 40, 72, ['#ffe9a8'], 0, 30, VW, 150, 4, 8, 1, 0.5 * a);
    cnSub(sv('The darkness breaks. The Sun returns.', 'Bóng tối tan đi. Mặt Trời đã trở lại.'), t, 13, 19);
    return { bloom: 0.5 + a * 0.35, grade: a > 0.3 ? 'rgba(255,170,90,.3)' : 'rgba(90,70,150,.3)', vig: 0.65 - a * 0.2, black: 1 - seg(t, 0, 1.5) + seg(t, 19.6, 20) };
  }
  function cnOutro2(t) {   // 20-40 s  farewell: the Ancient summons bow and fly back to the sky as light
    const u = t - 20, z = 1 + u * 0.005;
    g.drawImage(cnSky('osky2', [[0, '#3a5a9a'], [0.55, '#e8a070'], [1, '#ffe0a0']]), 0, 0, VW, VH);
    cnGlow(VW * 0.7, 40, 140, 'rgba(255,230,160,', 0.6); cnRays(VW * 0.7, -20, Math.PI * 0.62, 9, 'rgba(255,230,170,', 0.16, t, 330, 0.16);
    g.save(); g.translate(VW / 2, CN_GY); g.scale(z, z); g.translate(-VW / 2, -CN_GY);
    cnWrap(cnHills('oh1', [[60, 10, '#7a7aa8'], [78, 8, '#6a6a90']]), u * 2, 40, 1);
    cnWrap(cnLayer('oh1b', 768, 120, (x, w, h) => x.drawImage(cnHills('oh1x', [[70, 9, '#5a7a6a'], [84, 7, '#4a6a5a']]), 0, 0), 2), u * 5, 54, 1);
    cnWrap(cnGrass(), 300 + u * 8, CN_GY - 6);
    const S = [['dragonking', 92, CN_GY + 4, 132, false], ['titan', 300, CN_GY + 4, 120, true], ['ninetail', 252, CN_GY + 6, 70, true], ['phoenix', 150, CN_GY - 70, 78, false]];
    const auraK = 1 - ez(seg(u, 6, 10)) * 0.8;
    S.forEach(([k, x, bot, h, flip], i) => {
      const nod = seg(u, 7.4 + i * 0.3, 8.4 + i * 0.3), dip = Math.sin(nod * Math.PI) * 5, rot = Math.sin(nod * Math.PI) * 0.06 * (flip ? -1 : 1), dk = seg(u, 10 + i * 1.4, 12.4 + i * 1.4), fly = k === 'phoenix' ? Math.sin(t * 2) * 3 : 0;
      const art = sumArt(k); if (!art || !art.evo) return; const w = art.evo.width * h / art.evo.height;
      if (dk <= 0) { cnShadow(x, CN_GY + 2, w * 0.5, k === 'phoenix' ? 0.15 : 0.35, -18); cnSum(k, x, bot + dip + fly, h * (1 + Math.sin(t * 2 + i) * 0.006), flip, 1, { glow: 0.55 * auraK, rot }); }
      else { cnDissolve(art.evo, x, bot + fly, w, h, dk, 17 + i * 31, '#fff6c0'); if (dk > 0.5) { const sk = seg(dk, 0.5, 1.6), sy = bot - h * 0.6 - sk * 260; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x, sy, x, sy + 70); gr.addColorStop(0, 'rgba(255,250,220,' + (1 - sk * 0.6) + ')'); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(x - 1.5, sy, 3, 70); g.restore(); cnGlow(x, sy, 18, 'rgba(255,255,230,', 1 - sk * 0.5); } }
    });
    const look = u > 11, spr = cnHeroSpr(look ? 'jump' : 'idle', Math.floor(t * 2.2)); cnShadow(196, CN_GY + 1, 18, 0.45, -22); drawSpr(g, spr, 196, CN_GY, u > 6 && u < 11 ? true : false, false, 2.6, 2.6);
    cnMotes(t, 60, 81, ['#fff6c0', '#ffd34e', '#ffffff'], 0, 20, VW, VH - 40, 4, 16, 1, 0.6);
    g.restore();
    const fg = cnLayer('ofg', 1400, 60, (x, w, h, q) => { for (let i = 0; i < 70; i++) { const sx = q() * w, L = 14 + q() * 30; x.fillStyle = '#1e3a1e'; x.fillRect(sx, h - L, 3, L); x.fillStyle = ['#ff8fbf', '#ffd34e', '#ffffff'][i % 3]; x.fillRect(sx - 2, h - L - 3, 6, 5); } }, 2.5);
    cnWrap(fg, 100 + u * 14, VH - 60);
    cnSub(sv('The friends who fought beside you...', 'Những người bạn đã cùng bạn chiến đấu...'), t, 21, 27);
    cnSub(sv('return to the sky. But their light stays.', 'trở về với bầu trời. Nhưng ánh sáng của họ vẫn ở lại.'), t, 31, 38);
    return { bloom: 0.65, thr: 0.8, grade: 'rgba(255,190,120,.3)', vig: 0.5, black: 1 - seg(t, 20, 20.8) + seg(t, 39.4, 40) };
  }
  function cnOutro3(t) {   // 40-60 s  a new journey: he walks into the sunset, then the screen goes dark and the credits roll
    const u = t - 40;
    g.drawImage(cnSky('osky3', [[0, '#2a1a4a'], [0.4, '#8a3a6a'], [0.7, '#ff7a4a'], [1, '#ffd08a']]), 0, 0, VW, VH);
    const sx = VW / 2, sy = 124; cnGlow(sx, sy, 180, 'rgba(255,170,90,', 0.7); cnGlow(sx, sy, 60, 'rgba(255,240,200,', 0.55);
    g.fillStyle = '#fff2c8'; g.beginPath(); g.arc(sx, sy, 26, Math.PI, 0); g.fill();
    cnRays(sx, sy, -Math.PI / 2, 15, 'rgba(255,210,150,', 0.13, t, 260, 0.2);
    cnWrap(cnHills('os1', [[110, 6, '#6a3a6a']]), u * 1.5, 18, 1); cnWrap(cnHills('os2', [[118, 9, '#4a2448']]), u * 3, 22, 1); cnWrap(cnHills('os3', [[124, 6, '#2a1430']]), u * 5, 28, 1);
    // the road to the horizon
    g.fillStyle = '#1a0e1e'; g.fillRect(0, 150, VW, VH - 150); g.fillStyle = '#3a1e30'; g.beginPath(); g.moveTo(sx - 4, 150); g.lineTo(sx + 4, 150); g.lineTo(sx + 160, VH); g.lineTo(sx - 160, VH); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,190,120,.35)'; g.beginPath(); g.moveTo(sx - 1, 150); g.lineTo(sx + 1, 150); g.lineTo(sx + 30, VH); g.lineTo(sx - 30, VH); g.closePath(); g.fill();
    // he puts the sword away, turns and walks into the distance
    const p = ez(seg(u, 3, 15.5)), hy = VH - CN_BAR - 4 + (150 - (VH - CN_BAR - 4)) * p, hs = 4.2 - 3.5 * Math.pow(p, 0.7), walking = u > 3 && u < 15.5;
    const spr = cnHeroSpr(walking ? 'run' : 'idle', walking ? Math.floor(u * 6) : Math.floor(u * 2.2));
    g.save(); g.globalAlpha = 0.5; g.fillStyle = '#000'; g.beginPath(); g.moveTo(sx - 4 * hs, hy); g.lineTo(sx + 4 * hs, hy); g.lineTo(sx + 9 * hs, hy + 30 * hs); g.lineTo(sx - 9 * hs, hy + 30 * hs); g.closePath(); g.fill(); g.restore();
    if (u < 2.2) { const sw = cnSword(), k = ez(seg(u, 0.8, 2)); g.save(); g.globalAlpha = 1 - k; g.translate(sx + 5 * hs, hy - 9 * hs - k * 4 * hs); g.rotate(-0.4 - k * 2.4); drawSpr(g, sw, 0, 0, false, false, hs * 0.5, hs * 0.5); g.restore(); }
    g.save(); g.filter = 'brightness(0.05)'; drawSpr(g, spr, Math.round(sx + Math.sin(u * 3) * (walking ? 0.5 : 0)), Math.round(hy), u < 1.5, false, hs, hs); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.1; g.filter = 'blur(3px) brightness(1.6) sepia(1)'; drawSpr(g, spr, Math.round(sx), Math.round(hy - 1), u < 1.5, false, hs, hs); g.restore();
    for (let i = 0; i < 4; i++) { const bx = ((u * 22 + i * 60) % (VW + 80)) - 40, by = 50 + i * 9 + Math.sin(u + i) * 4, wv = Math.sin(t * 8 + i) * 2; g.fillStyle = '#2a1430'; g.fillRect(bx - 3, by + wv, 3, 1); g.fillRect(bx, by, 1, 1); g.fillRect(bx + 1, by + wv, 3, 1); }
    cnMotes(t, 50, 91, ['#ffd08a', '#ffffff'], 0, 40, VW, 140, 3, 6, 1, 0.45);
    cnSub(sv('One journey ends... and a new one begins.', 'Một hành trình kết thúc... và một hành trình mới bắt đầu.'), t, 44, 50.5);
    const dark = seg(u, 13, 16.5);
    if (u > 16.6) { const k = seg(u, 16.6, 17.6) * (1 - seg(u, 19.2, 20)); txt(sv('Thank you for playing', 'Cảm ơn bạn đã chơi'), VW / 2, VH / 2 - 8, { al: 'center', size: 10, bold: true, col: '#ffe9b8', glow: 'rgba(255,190,90,.7)', alpha: k, sh: false }); txt('Lê Minh Trí  &  Đặng Anh Quân', VW / 2, VH / 2 + 8, { al: 'center', size: 6.5, col: '#c8b8e8', alpha: k, sh: false }); }
    return { bloom: 0.5, thr: 0.75, grade: 'rgba(255,140,90,.3)', vig: 0.55 + dark * 0.4, black: 1 - seg(t, 40, 40.8) + dark };
  }
  function drawCine() {
    if (!cn) startCine('intro');
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    if (cn.gate) {
      const q = mulberry32(3); for (let i = 0; i < 60; i++) { g.globalAlpha = 0.2 + 0.6 * Math.abs(Math.sin(sceneT * (1 + q() * 2) + i)); g.fillStyle = '#9a90c8'; g.fillRect((q() * VW) | 0, (q() * VH) | 0, 1, 1); } g.globalAlpha = 1; sceneT += 1 / 60;
      txt(sv('Press any key to begin', 'Nhấn phím bất kỳ để bắt đầu'), VW / 2, VH / 2, { al: 'center', size: 8, col: '#ffe9b8', alpha: 0.55 + 0.45 * Math.sin(sceneT * 3), sh: false });
      txt(sv('(headphones recommended)', '(nên đeo tai nghe)'), VW / 2, VH / 2 + 14, { al: 'center', size: 5.5, col: '#8a7fa8', sh: false });
      return;
    }
    const t = cn.t; let o;
    if (cn.kind === 'intro') o = t < 15 ? cnIntro1(t) : t < 30 ? cnIntro2(t) : t < 45 ? cnIntro3(t) : cnIntro4(t);
    else o = t < 20 ? cnOutro1(t) : t < 40 ? cnOutro2(t) : cnOutro3(t);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    cnPost(o);
  }
