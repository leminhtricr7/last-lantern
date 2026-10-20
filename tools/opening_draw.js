  // ---------- the new film's pieces: a wide panorama of the land with ten towers, the sky, the moon, a tower, the town, the stone, the lantern, the hero ----------
  function opPano() {
    if (UIC.opp) return UIC.opp;
    const PW = Math.round(VW * 2.4), [c, x] = mkCanvas(PW, VH), q = mulberry32(1717), T = [];
    const ridge = (base, amp, col, rim, sd, f) => { const r = mulberry32(sd), p = [r() * 6, r() * 6, r() * 6], ys = []; for (let px = 0; px < PW; px++) { const y = Math.round(base + Math.sin(px * 0.011 * f + p[0]) * amp + Math.sin(px * 0.037 * f + p[1]) * amp * 0.4 + Math.sin(px * 0.11 + p[2]) * 1.5); ys.push(y); x.fillStyle = col; x.fillRect(px, y, 1, VH - y); x.fillStyle = rim; x.fillRect(px, y, 1, 1); } return ys; };
    ridge(VH * 0.6, 16, '#141a3e', '#2e3a78', 3, 1);
    const mid = ridge(VH * 0.71, 12, '#0e1230', '#26306a', 5, 1.3);
    for (let i = 0; i < 10; i++) { const tx = Math.round(PW * (0.06 + i * 0.098)); T.push({ x: tx, by: mid[clamp(tx, 0, PW - 1)] + 2, h: 30 + Math.round(q() * 18) }); }
    const near = ridge(VH * 0.85, 6, '#080a1e', '#1a2050', 9, 0.8);
    for (let i = 0; i < 80; i++) { const px = (q() * PW) | 0, y = near[px], hg = 5 + ((q() * 9) | 0); x.fillStyle = '#060818'; for (let k = 0; k < hg; k++) { const hw = Math.round((1 - k / hg) * 3); x.fillRect(px - hw, y - k, hw * 2 + 1, 1); } }
    // the meadow village on the near ridge, at the left edge (where the story starts)
    for (let i = 0; i < 7; i++) { const hx = 8 + i * 15, y = near[hx + 6] - 9, w = 12; x.fillStyle = '#0a0a20'; x.fillRect(hx, y, w, 10); for (let k = 0; k < 6; k++) x.fillRect(hx + 6 - (6 - k), y - k, (6 - k) * 2, 1); x.fillStyle = '#ffd070'; x.fillRect(hx + 4, y + 4, 2, 2); }
    return (UIC.opp = { c, T, PW });
  }
  function opSky(ecl) {   // 0 = a calm blue night, 1 = the red-black Eclipse
    const gr = g.createLinearGradient(0, 0, 0, VH);
    gr.addColorStop(0, lerpColor('#040820', '#0a0208', ecl)); gr.addColorStop(0.5, lerpColor('#14205a', '#2a0820', ecl)); gr.addColorStop(1, lerpColor('#3a3470', '#5a1424', ecl));
    g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  }
  function opMoon(x, y, ecl, t) {   // the black disc slides over the moon; a red corona burns round it
    x = Math.round(x); y = Math.round(y);
    g.globalCompositeOperation = 'lighter'; const mg = g.createRadialGradient(x, y, 8, x, y, 60); mg.addColorStop(0, ecl > 0.8 ? 'rgba(255,60,50,' + (0.45 + Math.sin(t * 4) * 0.1) * ecl + ')' : 'rgba(220,230,255,' + 0.35 * (1 - ecl) + ')'); mg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = mg; g.fillRect(x - 60, y - 60, 120, 120); g.globalCompositeOperation = 'source-over';
    disc(g, x, y, 15, ecl > 0.8 ? '#ff5a3a' : '#e8e4c8'); disc(g, x, y, 14, '#f4f0d8');
    disc(g, x + Math.round((1 - ecl) * 30), y - Math.round((1 - ecl) * 6), 14, '#05020a');
  }
  function opTower(x, by, h, lit, t, i) {
    x = Math.round(x); by = Math.round(by);
    g.fillStyle = '#0a0818'; for (let y = 0; y < h; y++) { const w = Math.round(4 - (y / h) * 1.6); g.fillRect(x - w, by - y, w * 2 + 1, 1); }
    g.fillStyle = '#05040e'; g.fillRect(x - 5, by - h - 1, 11, 2); g.fillRect(x - 3, by - h - 9, 1, 8); g.fillRect(x + 3, by - h - 9, 1, 8); g.fillRect(x - 4, by - h - 11, 9, 2); g.fillRect(x, by - h - 15, 1, 4);
    for (let k = 1; k <= 3; k++) { g.fillStyle = lit > 0.3 ? '#ffd070' : '#1c1830'; g.fillRect(x, by - Math.round(h * k / 4), 1, 2); }
    const fy = by - h - 5;
    if (lit > 0) {
      g.globalCompositeOperation = 'lighter'; const r = 10 + 16 * lit + Math.sin(t * 6 + i) * 1.5, gr = g.createRadialGradient(x, fy, 0, x, fy, r * 2); gr.addColorStop(0, 'rgba(255,210,120,' + 0.75 * lit + ')'); gr.addColorStop(0.4, 'rgba(255,150,60,' + 0.25 * lit + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(x - r * 2, fy - r * 2, r * 4, r * 4); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = lit; g.fillStyle = '#ffd34e'; g.fillRect(x - 2, fy - 2, 5, 5); g.fillStyle = '#fff6c0'; g.fillRect(x - 1, fy - 3 - (Math.floor(t * 8 + i) % 2), 3, 4); g.globalAlpha = 1;
    }
    if (lit < 1) { for (let k = 0; k < 4; k++) { const u = (t * 0.4 + k / 4 + i * 0.13) % 1; g.globalAlpha = (1 - lit) * (1 - u) * 0.35; g.fillStyle = '#6a6488'; g.fillRect(Math.round(x + Math.sin(u * 5 + i) * 3 * u), Math.round(fy - u * 22), 2 + Math.round(u * 2), 2); } g.globalAlpha = 1; }
  }
  // the land seen from far away: sky, moon, ridges, the river of light between the towers and the towers themselves
  function opLand(t, camX, ecl, litOf, O) {
    opSky(ecl);
    for (const s of O.stars) { g.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * s.v + s.p))) * (1 - ecl * 0.8) * 0.8; g.fillStyle = '#fff'; g.fillRect(s.x, Math.round(s.y * 0.5), 1, 1); } g.globalAlpha = 1;
    opMoon(VW * 0.74, 38, ecl, t);
    const P2 = opPano(); g.drawImage(P2.c, -Math.round(camX), 0);
    for (let i = 0; i < 9; i++) {
      const a = P2.T[i], b = P2.T[i + 1], k = Math.min(litOf(i), litOf(i + 1)); if (k <= 0) continue;
      const ax = a.x - camX, bx = b.x - camX; if (Math.max(ax, bx) < -40 || Math.min(ax, bx) > VW + 40) continue;
      const ay = a.by - a.h - 6, by2 = b.by - b.h - 6, mx = (ax + bx) / 2, my = Math.min(ay, by2) - 34;
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,200,110,' + 0.35 * k + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx, my, bx, by2); g.stroke();
      g.strokeStyle = 'rgba(255,240,200,' + 0.5 * k + ')'; g.lineWidth = 0.8; g.stroke(); g.lineWidth = 1;
      for (let d = 0; d < 5; d++) { const s = (t * 0.35 + d / 5) % 1, px = (1 - s) * (1 - s) * ax + 2 * (1 - s) * s * mx + s * s * bx, py = (1 - s) * (1 - s) * ay + 2 * (1 - s) * s * my + s * s * by2; g.fillStyle = 'rgba(255,240,190,' + k + ')'; g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 2, 2); }
      g.globalCompositeOperation = 'source-over';
    }
    for (let i = 0; i < 10; i++) { const T2 = P2.T[i], sx = T2.x - camX; if (sx < -30 || sx > VW + 30) continue; opTower(sx, T2.by, T2.h, litOf(i), t, i); }
  }
  // the festival town (lit = how much of its warm light is left, people = the villagers are out)
  function opTown(t, camY, lit, people, O) {
    g.drawImage(O.world, 0, -Math.round(camY));
    for (const s of O.stars) { g.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t * s.v + s.p))) * lit; g.fillStyle = '#fff'; g.fillRect(s.x, s.y - Math.round(camY), 1, 1); } g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (const w of O.glows) { const wy = w.y - camY; if (wy < -20 || wy > VH + 20) continue; const r = w.big ? 22 : 9, fl = 0.85 + Math.sin(t * 7 + w.x) * 0.15; const gr = g.createRadialGradient(w.x, wy, 0, w.x, wy, r); gr.addColorStop(0, 'rgba(255,200,100,' + 0.4 * lit * fl + ')'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(w.x - r, wy - r, r * 2, r * 2); }
    for (const b of O.bulbs) { const wy = b.y - camY; if (wy < -4 || wy > VH + 4) continue; g.globalAlpha = (0.5 + 0.5 * Math.sin(t * 4 + b.x)) * lit; g.fillStyle = b.col; g.fillRect(Math.round(b.x) - 2, Math.round(wy) - 2, 5, 5); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 7; i++) { const u = ((t * 0.25 + i / 7) % 1); g.globalAlpha = (1 - u) * 0.18; g.fillStyle = '#9aa0c8'; g.fillRect(Math.round(40 + i * 52 + Math.sin(u * 6 + i) * 4), Math.round(380 - camY - u * 40), 4, 3); } g.globalAlpha = 1;
    for (const f of O.flies) { const fx = f.x + Math.sin(t * 0.8 + f.p) * f.r, fy = f.y - camY + Math.cos(t * 1.1 + f.p) * 5; if (fy < 0 || fy > VH) continue; g.globalAlpha = (0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + f.p))) * lit; g.fillStyle = '#ffe066'; g.fillRect(Math.round(fx), Math.round(fy), 2, 2); } g.globalAlpha = 1;
    const by = 480 - camY;
    if (people && by < VH + 30) {
      O.kids.forEach((k, i) => { const px = k.x + Math.sin(t * k.v + k.p) * k.r * 0.6, vx = Math.cos(t * k.v + k.p); drawSpr(g, getSprite('hero_run', k.sw, Math.floor(t * 11 + i) % 4), Math.round(px), Math.round(by + 1), vx < 0, false, 0.78, 0.78); });
      drawSpr(g, npcSpr('npc_lila'), 112, Math.round(by + 1), false); drawSpr(g, npcSpr('npc_bram'), 130, Math.round(by + 1), true); drawSpr(g, npcSpr('npc_gob'), 232, Math.round(by + 1), true);
    }
    return by;
  }
  function opStone(x, by, sc) {   // the stone the old lantern rests on
    g.save(); g.translate(Math.round(x), Math.round(by)); g.scale(sc, sc);
    g.fillStyle = '#2a2640'; g.fillRect(-9, -4, 18, 4); g.fillStyle = '#3a3654'; g.fillRect(-6, -14, 12, 10); g.fillStyle = '#4a4668'; g.fillRect(-8, -17, 16, 3);
    g.fillStyle = '#5e5a80'; g.fillRect(-8, -17, 16, 1); g.fillRect(-6, -14, 1, 10); g.fillStyle = '#1e1a30'; g.fillRect(5, -14, 1, 10);
    g.fillStyle = '#c89a1c'; g.fillRect(-2, -10, 4, 1); g.fillRect(-1, -11, 2, 3);   // a carved lantern sign
    g.restore();
  }
  function opLantern(x, y, sc, glow, rot) {   // y = the middle of the lantern; glow 0 = cold, 1 = burning
    g.save(); g.translate(Math.round(x), Math.round(y)); if (rot) g.rotate(rot); g.scale(sc, sc);
    g.fillStyle = '#2a1a10'; g.fillRect(-1, -7, 3, 1); g.fillRect(-3, -6, 7, 2); g.fillStyle = '#c89a1c'; g.fillRect(-3, -5, 7, 1);
    g.fillStyle = '#2a1a10'; g.fillRect(-3, -4, 1, 7); g.fillRect(3, -4, 1, 7);
    g.fillStyle = lerpColor('#3a2a22', '#ffd34e', glow); g.fillRect(-2, -4, 5, 7); g.fillStyle = lerpColor('#4a3a30', '#fff6c0', glow); g.fillRect(-1, -3, 3, 4);
    if (glow > 0.5) { g.fillStyle = '#ffffff'; g.fillRect(0, -2, 1, 2); }
    g.fillStyle = '#c89a1c'; g.fillRect(-3, 3, 7, 1); g.fillStyle = '#2a1a10'; g.fillRect(-2, 4, 5, 1);
    g.restore();
    if (glow > 0) { g.globalCompositeOperation = 'lighter'; const r = 14 * sc * (0.5 + glow), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,200,100,' + 0.55 * glow + ')'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; }
  }
  function opHero(x, bot, sc, flip, run, t) {   // the hero the player picked
    const h = HERO[myHero()] || HERO.ember, n = run ? 4 : 2, fr = Math.floor(t * (run ? 14 : 2.5)) % n;
    g.save(); g.translate(Math.round(x), Math.round(bot)); g.scale(sc, sc);
    if (h.custom) { const sp = custSpr(h, run ? 'run' : 'idle', fr), k = h.custom === 'fan' ? 16 / (sp.h || 16) : 1; g.imageSmoothingEnabled = h.custom === 'fan'; drawSpr(g, sp, 0, run ? -Math.abs(Math.round(Math.sin(t * 14))) : 0, flip, false, k, k); g.imageSmoothingEnabled = false; }
    else { drawSpr(g, getSprite(run ? 'hero_run' : 'hero_idle', h.sw, fr), 0, 0, flip); if (h.hat) drawHat(h, 0, 0, flip ? -1 : 1); }
    g.restore();
  }
  function drawOpening() {
    if (!op) startOpening(); const t = op.t, O = openArt(); let shake = 0;
    g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH);
    const P2 = opPano(), far = P2.PW - VW;
    if (t < 10.4) {
      // ---------- 1. ten towers and the river of light ----------
      opLand(t, far * 0.75 * ez(t / 10.4), 0, () => 1, O);
      if (t < 1.6) { g.globalAlpha = 1 - ez(t / 1.6); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t > 9.6) { g.globalAlpha = ez((t - 9.6) / 0.8); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 20.5) {
      // ---------- 2. the Lantern Festival: the town, the stone, the child ----------
      const camY = t < 11.2 ? 0 : 304 * ez((t - 11.2) / 5);
      const by = opTown(t, camY, 1, true, O);
      if (by < VH + 30) {
        opStone(300, by + 1, 1); opLantern(300, by - 22 + Math.sin(t * 2) * 0.6, 1, 0.55 + Math.sin(t * 3) * 0.1, 0);
        opHero(276, by + 1, 1, false, false, t);
        if (t > 16.5) { const k = ez(seg(t, 16.5, 18)); g.globalAlpha = k * (0.6 + Math.sin(t * 5) * 0.3); g.fillStyle = '#fff6c0'; g.fillRect(279, Math.round(by - 24), 1, 3); g.fillRect(278, Math.round(by - 23), 3, 1); g.globalAlpha = 1; }
      }
      if (t < 11.0) { g.globalAlpha = 1 - ez((t - 10.4) / 0.6); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t > 19.8) { g.globalAlpha = ez((t - 19.8) / 0.7); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 32.2) {
      // ---------- 3. the Eclipse: the towers die from the farthest to the nearest, Quoc in the black moon ----------
      const ecl = ez(seg(t, 20.6, 23)), camX = far * (1 - ez(seg(t, 21.2, 29.4)));
      opLand(t, camX, ecl, i => 1 - ez(seg(t, opOutT(i), opOutT(i) + 0.5)), O);
      for (let i = 0; i < 10; i++) { const T2 = P2.T[i], ot = opOutT(i); opBurst(T2.x - camX, T2.by - T2.h - 5, ot, t, 10, i, 30, 0.8, ['#6a6488', '#ffd070', '#3a3454'], -20); }
      g.globalAlpha = 0.35 * ecl; g.fillStyle = '#10062a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      if (t > 24.4) {   // Quoc's face inside the black moon
        const k = ez(seg(t, 24.4, 26)), roar = t > 28.4, qi = typeof QUOC_IMG !== 'undefined' && (roar ? QUOC_IMG.portrait_roar : QUOC_IMG.portrait_smirk), mx = VW * 0.74, my = 38;
        g.globalAlpha = k * 0.85; if (qi) { const sc = 70 / qi.h, w = qi.w * sc, hh = qi.h * sc, sx = roar ? Math.round(Math.sin(t * 60) * 1.5) : 0; g.drawImage(qi.c, Math.round(mx - w / 2) + sx, Math.round(my - hh / 2 + 10), Math.round(w), Math.round(hh)); } g.globalAlpha = 1;
        g.globalCompositeOperation = 'lighter'; const eg = g.createRadialGradient(mx, my, 0, mx, my, 90); eg.addColorStop(0, 'rgba(255,40,60,' + 0.25 * k + ')'); eg.addColorStop(1, 'rgba(255,40,60,0)'); g.fillStyle = eg; g.fillRect(mx - 90, my - 90, 180, 180); g.globalCompositeOperation = 'source-over'; if (roar) shake = 1;
      }
      opLightning(t, 20.6, 3); opLightning(t, 26.0, 41); opLightning(t, 29.2, 67);
      if (t > 31.5) { g.globalAlpha = ez((t - 31.5) / 0.7); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 42.2) {
      // ---------- 4. Lyra dragged away by chains of shadow ----------
      const by = opTown(t, 304, 0.15, false, O);
      g.globalAlpha = 0.55; g.fillStyle = '#0a0418'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      const px = VW / 2, py = 12;   // the shadow portal
      for (let r = 4; r >= 0; r--) { g.globalAlpha = 0.5 + r * 0.1; g.fillStyle = r % 2 ? '#2a0a2a' : '#05020a'; g.beginPath(); g.ellipse(px, py, 60 - r * 9 + Math.sin(t * 3 + r) * 2, 14 - r * 2, 0, 0, 7); g.fill(); } g.globalAlpha = 1;
      g.strokeStyle = 'rgba(255,60,80,.6)'; g.beginPath(); g.ellipse(px, py, 60, 14, 0, 0, 7); g.stroke();
      const lift = ez(seg(t, 34.4, 41)), lx = px + Math.sin(t * 2) * 4 * lift, ly = by + 1 - (by - 30) * lift;
      for (let k = -1; k <= 1; k++) {   // three chains from the portal to Lyra
        const ax = px + k * 34, ay = py + 6; g.strokeStyle = '#14101e'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay);
        for (let s = 1; s <= 8; s++) { const u = s / 8; g.lineTo(ax + (lx + k * 3 - ax) * u + Math.sin(t * 6 + s + k) * 2 * (1 - u), ay + (ly - 18 - ay) * u); } g.stroke();
        g.strokeStyle = 'rgba(160,80,200,.6)'; g.lineWidth = 1; g.stroke();
      }
      drawSpr(g, npcSpr('npc_lyra'), Math.round(lx), Math.round(ly), false, false, 2, 2);
      for (let i = 0; i < 6; i++) { const u = ((t * 0.5 + i / 6) % 1); if (t < 34.4) continue; g.globalAlpha = 1 - u; g.fillStyle = i % 2 ? '#ff9fd0' : '#6ee7f2'; const nx = lx + Math.sin(i * 2.3 + t) * 16, ny = ly - 20 + u * (by - ly + 10); g.fillRect(Math.round(nx), Math.round(ny), 2, 3); g.fillRect(Math.round(nx) + 2, Math.round(ny) - 2, 1, 4); } g.globalAlpha = 1;   // her song falls like notes
      drawSpr(g, npcSpr('npc_shorty'), 84, Math.round(by + 1 - Math.abs(Math.sin(t * 6)) * 3), false, false, 1.4, 1.4);   // Shorty Phong laughs
      const hx = 316 - 40 * ez(seg(t, 38.5, 40.5)); opHero(hx, by + 1, 1.4, true, t > 38.5 && t < 40.5, t);
      if (t > 38.2) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(hx) - 1, Math.round(by - 34), 2, 4); g.fillRect(Math.round(hx) - 1, Math.round(by - 29), 2, 1); }
      if (t < 32.8) { g.globalAlpha = 1 - ez((t - 32.2) / 0.6); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t > 41.5) { g.globalAlpha = ez((t - 41.5) / 0.7); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < 52) {
      // ---------- 5. the lantern falls, rolls to the child's feet and chooses them ----------
      g.save(); g.translate(VW / 2, VH / 2); g.scale(2, 2); g.translate(-300, -(480 - 304) + 10); g.drawImage(O.world, 0, -304); g.restore();
      g.globalAlpha = 0.86; g.fillStyle = '#030208'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      const gy = 176, sx0 = 150, hx = 282, top = gy - 36;
      opStone(sx0, gy, 2.4);
      let lx = sx0, ly = top - 10, rot = 0, glow = 0.25;
      if (t < 43.6) { const k = seg(t, 42.2, 43.6); lx += Math.round(Math.sin(t * 40) * 2 * k); rot = Math.sin(t * 30) * 0.1 * k; }
      else if (t < 44.3) { const k = seg(t, 43.6, 44.3); lx = sx0 + 16 * k; ly = top - 10 + (gy - 12 - (top - 10)) * k * k; rot = k * 1.2; }
      else if (t < 46.3) { const k = ez(seg(t, 44.3, 46.3)); lx = sx0 + 16 + (hx - 26 - sx0 - 16) * k; ly = gy - 12; rot = 1.2 + k * 9.4; glow = 0.25 - 0.15 * k; }
      else if (t < 47.4) { lx = hx - 26; ly = gy - 12; rot = 10.6; glow = 0.1 + (Math.sin(t * 9) > 0.7 ? 0.15 : 0); }
      else { const k = ez(seg(t, 48.4, 49.4)); lx = hx - 26 + 14 * k; ly = gy - 12 - 30 * k - Math.sin(k * 3.14) * 14; rot = 10.6 * (1 - k); glow = Math.min(1, 0.2 + seg(t, 47.4, 48.2) * 0.8); }
      if (t >= 47.4) {   // the flare: the light pushes the dark back
        const k = ez(seg(t, 47.4, 48.8)); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(lx, ly, 0, lx, ly, 30 + 160 * k); lg.addColorStop(0, 'rgba(255,210,120,' + 0.8 * k + ')'); lg.addColorStop(0.5, 'rgba(255,150,60,' + 0.3 * k + ')'); lg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = lg; g.fillRect(0, 0, VW, VH); g.globalCompositeOperation = 'source-over';
        opBurst(lx, ly, 47.4, t, 40, 5, 120, 1.6, ['#fff6c0', '#ffd34e', '#ff9a2a', '#ffffff'], -10);
      }
      opHero(hx, gy, 2.5, true, false, t);
      opLantern(lx, ly, 2.4, glow, rot);
      if (t > 47.4 && t < 47.75) { g.globalAlpha = 0.9 * (1 - (t - 47.4) / 0.35); g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t < 42.8) { g.globalAlpha = 1 - ez((t - 42.2) / 0.6); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t > 51.4) { g.globalAlpha = ez((t - 51.4) / 0.6); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    } else if (t < OP_END) {
      // ---------- 6. the road: the child runs into the dark meadow, the first tower cold on the hill ----------
      const rt = t - 52, gy = drawBgOnly(0, rt * 120, t);
      g.globalAlpha = 0.62; g.fillStyle = '#05061a'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
      opMoon(VW * 0.82, 30, 1, t);
      const tx = VW - 64 - rt * 4; g.fillStyle = '#060818'; g.beginPath(); g.ellipse(tx, gy + 4, 70, 30, 0, Math.PI, 0); g.fill(); opTower(tx, gy - 24, 52, 0, t, 0);
      const hx = 110, hb = gy + 2;
      opHero(hx, hb, 1.9, false, true, t);
      opLantern(hx + 12, hb - 20 + Math.sin(t * 14) * 1, 1.3, 1, Math.sin(t * 7) * 0.2);
      g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(hx + 8, hb - 18, 0, hx + 8, hb - 18, 70); lg.addColorStop(0, 'rgba(255,190,90,.35)'); lg.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = lg; g.fillRect(hx - 62, hb - 88, 140, 140); g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 7; i++) { const yy = 30 + i * 17 + (rt * 90 + i * 17) % 11, xx = VW - ((rt * 420 + i * 91) % (VW + 60)); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 22, yy); g.stroke(); }
      if (rt < 0.6) { g.globalAlpha = 1 - rt / 0.6; g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
      if (t > 59.2) { g.globalAlpha = ez((t - 59.2) / 0.8); g.fillStyle = '#000'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    }
    if (t >= OP_END) {
      // ---------- the title card ----------
      const et = t - OP_END, k = ez(et / 1.2);
      const sg = g.createLinearGradient(0, 0, 0, VH); sg.addColorStop(0, '#0a0418'); sg.addColorStop(0.55, '#2a0e40'); sg.addColorStop(0.85, '#5a1c40'); sg.addColorStop(1, '#a04a3a'); g.fillStyle = sg; g.fillRect(0, 0, VW, VH);
      opMoon(VW / 2, 60, 1, t);
      for (let px = 0; px < VW; px++) { const y = Math.round(150 + Math.sin(px * 0.02) * 10 + Math.sin(px * 0.06) * 4); g.fillStyle = '#12081e'; g.fillRect(px, y, 1, VH - y); }
      for (let i = 0; i < 10; i++) opTower(30 + i * ((VW - 60) / 9), 152 + Math.round(Math.sin((30 + i * 36) * 0.02) * 6), 18 + (i % 3) * 6, i === 0 ? 0.25 + 0.15 * Math.sin(t * 3) : 0, t, i);
      g.fillStyle = '#05020c'; g.fillRect(0, 168, VW, VH - 168);
      g.globalCompositeOperation = 'lighter'; const hg = g.createRadialGradient(110, 160, 0, 110, 160, 70); hg.addColorStop(0, 'rgba(255,190,90,' + 0.5 * (0.7 + Math.sin(t * 9) * 0.1) + ')'); hg.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = hg; g.fillRect(30, 90, 160, 100); g.globalCompositeOperation = 'source-over';
      opHero(110, 172, 2, false, false, t); opLantern(124, 152, 1.4, 1, 0);
      txt('LAST LANTERN', VW / 2, 30 + (1 - k) * -8, { al: 'center', size: 24, bold: true, col: '#ffd34e', grad: ['#fffbe0', '#ffd34e', '#e08a1a'], ol: '#2a0a10', glow: 'rgba(255,160,50,.9)', ls: 2, sh: false, alpha: k });
      txt(sv('TEN TOWERS ARE WAITING', 'MƯỜI THÁP ĐÈN ĐANG CHỜ'), VW / 2, 50, { al: 'center', size: 7, bold: true, col: '#ffe9b8', ls: 2, ol: '#1a0814', sh: false, alpha: k });
      if (et > 1.0) { g.fillStyle = 'rgba(8,3,18,.7)'; g.fillRect(VW / 2 - 130, 186, 260, 22); g.fillStyle = 'rgba(255,200,100,.5)'; g.fillRect(VW / 2 - 130, 186, 260, 1); g.fillRect(VW / 2 - 130, 207, 260, 1);
        txt(sv('TAP THE SCREEN OR PRESS ENTER TO PLAY', 'CHẠM VÀO MÀN HÌNH HOẶC NHẤN ENTER ĐỂ CHƠI'), VW / 2, 197, { al: 'center', size: 7.5, bold: true, col: '#ffffff', glow: 'rgba(255,170,70,' + (0.4 + 0.5 * Math.abs(Math.sin(t * 3))) + ')', alpha: 0.55 + 0.45 * Math.abs(Math.sin(t * 3)) }); }
      if (et < 0.8) { g.globalAlpha = 1 - et / 0.8; g.fillStyle = '#fff'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }
    }
    if (shake) { const sx = Math.round((Math.random() - 0.5) * 4 * shake), sy = Math.round((Math.random() - 0.5) * 4 * shake); g.drawImage(buf, sx, sy); }
    if (t < OP_END) { opBars(); g.drawImage(titleArt().vig, 0, 0); }
    // captions
    const hn = LN((HERO[myHero()] || HERO.ember).name).toUpperCase();
    if (t < OP_END) for (let i = 0; i < OPC.length; i++) {
      const c = OPC[i]; if (t < c[0] || t > c[1] + 0.5) continue;
      const line = sv(c[3], c[4]), n = Math.floor((t - c[0]) * (c[2] === 'n' ? 26 : 32)), a = Math.min(1, (c[1] + 0.5 - t) / 0.5);
      const who = c[2] === 'q' ? sv('QUOC', 'QUỐC') : (c[2] === 'l' ? 'LYRA' : (c[2] === 'e' ? hn : null)), col = c[2] === 'q' ? '#ff7a7a' : (c[2] === 'l' ? '#6ee7f2' : (c[2] === 'e' ? '#ffd34e' : '#e8eaf5'));
      const wl = wrapText(line.slice(0, n), 78), yb = VH - 17;
      wl.forEach((l, j) => txt((j === 0 && who ? who + ': ' : '') + l, VW / 2, yb + j * 8 - (wl.length - 1) * 4, { al: 'center', size: c[2] === 'q' ? 7.5 : 7, bold: c[2] !== 'n', col, alpha: a }));
    }
    if (t < OP_END - 1) txt(sv('ENTER: skip', 'ENTER: bỏ qua'), VW - 6, VH - 6, { al: 'right', size: 5, col: '#6a6a8a' });
  }
