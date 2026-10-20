# 1) sharper picture (device-pixel canvas, summons drawn at screen resolution), rarity colour effects on items
# 2) T replaced by skills 1-4 (slot 1, slot 2, armor, pet) charged by landing hits
# 3) pet transformation (3 s), grand summon entrances, the 3-step rule (aware -> wind-up -> move), per-character gaits
#    and engage moves (leap, teleport, shadow ambush, dash, dive); bosses shrug off summon damage and sweep summons away
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:90]
    s = s.replace(a, b)

# ================= 1) sharper picture =================
rep("""  let scale = 3, offX = 0, offY = 0;""", """  let scale = 3, offX = 0, offY = 0, DPR = 1;""")
rep("""    const w = innerWidth, h = innerHeight;
    rotated = IS_TOUCH && h > w;
    if (rotated) {
      cv.width = h; cv.height = w;""", """    const w = innerWidth, h = innerHeight;
    DPR = Math.min(3, window.devicePixelRatio || 1);   // a canvas as sharp as the screen (4K / retina): every game pixel is an exact block of screen pixels
    rotated = IS_TOUCH && h > w;
    if (rotated) {
      cv.width = Math.round(h * DPR); cv.height = Math.round(w * DPR);""")
rep("""    } else { cv.width = w; cv.height = h; cv.style.cssText = ''; }""", """    } else { cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR); cv.style.cssText = ''; }""")
rep("""    else if (rotated) touch.ptr.set(e.pointerId, { x: e.clientY, y: innerWidth - e.clientX });""", """    else if (rotated) touch.ptr.set(e.pointerId, { x: e.clientY * DPR, y: (innerWidth - e.clientX) * DPR });""")
# summons' painted art: queued and drawn at full screen resolution after the pixel buffer
rep("""  function drawSumArt(s, x, y, a) {""", """  const HIQ = []; let hiOn = false, hiClip = null;
  function hiImg(im, a0, a1, a2, a3, a4, a5, a6, a7) {
    if (!hiOn) { g.drawImage(im, a0, a1, a2, a3, a4, a5, a6, a7); return; }
    HIQ.push({ im, a: [a0, a1, a2, a3, a4, a5, a6, a7], m: g.getTransform(), al: g.globalAlpha, f: g.filter, clip: hiClip });
  }
  function drawHiQ() {
    for (const r of HIQ) {
      ctx.save();
      if (r.clip) { ctx.setTransform(scale, 0, 0, scale, offX, offY); const c = r.clip.m; ctx.transform(c.a, c.b, c.c, c.d, c.e, c.f); ctx.beginPath(); ctx.rect(r.clip.r[0], r.clip.r[1], r.clip.r[2], r.clip.r[3]); ctx.clip(); }
      ctx.setTransform(scale, 0, 0, scale, offX, offY); const m = r.m; ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      ctx.globalAlpha = r.al; ctx.filter = r.f || 'none'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(r.im, r.a[0], r.a[1], r.a[2], r.a[3], r.a[4], r.a[5], r.a[6], r.a[7]); ctx.restore();
    }
    HIQ.length = 0;
  }
  function drawSumArt(s, x, y, a) {""")
rep("""    const copies = s.kind === 'golems' ? [-24, 24] : s.kind === 'clones' ? [-22, 0, 22] : [0];
    copies.forEach((d, i) => {
      g.save(); g.imageSmoothingEnabled = true; g.globalAlpha = a * (s.kind === 'clones' ? 0.82 : 1);
      g.translate(x + d + f * ox, by + oy); g.rotate(rot * f); g.scale(f * sx, sy);""", """    const copies = s.kind === 'golems' ? [-24, 24] : s.kind === 'clones' ? [-22, 0, 22] : [0];
    const AX = s.ax || 0, AY = s.ay || 0, ASX = s.asx || 1, ASY = s.asy || 1, AR = s.arot || 0, AA = s.aal === undefined ? 1 : s.aal, SK = s.sink || 0;
    if (SK > 0) { g.save(); g.beginPath(); g.rect(x - 400, y - 800, 800, 800); g.clip(); hiClip = { m: g.getTransform(), r: [x - 400, y - 800, 800, 800] }; }
    copies.forEach((d, i) => {
      g.save(); g.imageSmoothingEnabled = true; g.globalAlpha = a * AA * (s.kind === 'clones' ? 0.82 : 1);
      g.translate(x + d + f * ox + AX, by + oy + AY + SK); g.rotate(rot * f + AR); g.scale(f * sx * ASX, sy * ASY);""")
rep("""      g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      if (red) { g.globalAlpha = 0.75 * a; g.filter = 'brightness(0.75) sepia(1) saturate(9) hue-rotate(-45deg)'; g.drawImage(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc); g.filter = 'none'; }
      g.restore();
    });""", """      hiImg(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc);
      if (red) { g.globalAlpha = 0.75 * a; g.filter = 'brightness(0.75) sepia(1) saturate(9) hue-rotate(-45deg)'; hiImg(im, fj * fw, 0, fw, fh, -fw * sc / 2, -fh * sc, fw * sc, fh * sc); g.filter = 'none'; }
      g.restore();
    });
    if (SK > 0) { g.restore(); hiClip = null; }""")
rep("""    if (scene === 'play' && Q) drawPlay();
    else if (scene === 'title') drawTitle();""", """    hiOn = scene === 'play' && !!Q && Q.state === 'play' && !fadeTo && scale >= 2; HIQ.length = 0;
    if (scene === 'play' && Q) drawPlay();
    else if (scene === 'title') drawTitle();""")
rep("""    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
""", """    ctx.drawImage(buf, offX, offY, VW * scale, VH * scale);
    if (HIQ.length) drawHiQ();
""")

# rarity colour effects: sparkles / glow around held weapons, armour and pets; shimmer on item icons
rep("""  // the player's animator:""", """  // ----- rarity effects: Rare+ sparkles, Epic+ glow, Legendary+ halo, Divine shifts through every colour -----
  const rarCol = (r, t) => r >= 6 ? 'hsl(' + (((t || Q.t) * 140) % 360 | 0) + ',100%,72%)' : (RARITY_COL[r] || '#ffffff');
  function rarFx(r, x, y, rad) {
    if (!(r >= 2)) return; const t = Q.t;
    if (Math.random() < 0.06 * r) emit(x + rr(-rad, rad), y + rr(-rad, rad), 1, { col: [rarCol(r, t + Math.random()), '#ffffff'], sp0: 2, sp1: 12, grav: -25, l0: 0.25, l1: 0.55 });
    if (r >= 4) { g.globalCompositeOperation = 'lighter'; const c = r >= 6 ? '#ff4af0' : RARITY_COL[r], gr = g.createRadialGradient(x, y, 0, x, y, rad * 2.2); gr.addColorStop(0, hexA(c, 0.22 + Math.sin(t * 5) * 0.06)); gr.addColorStop(1, hexA(c, 0)); g.fillStyle = gr; g.fillRect(x - rad * 2.2, y - rad * 2.2, rad * 4.4, rad * 4.4); g.globalCompositeOperation = 'source-over'; }
  }
  function rarAura(r, x, bot) {
    if (!(r >= 3)) return; const t = Q.t;
    if (Math.random() < 0.05 * r) emit(x + rr(-7, 7), bot - rr(0, 4), 1, { col: [rarCol(r, t + Math.random()), '#ffffff'], sp0: 2, sp1: 8, grav: -40, l0: 0.4, l1: 0.8 });
    if (r >= 5) { g.globalAlpha = 0.35 + Math.sin(t * 4) * 0.12; g.strokeStyle = r >= 6 ? rarCol(r, t) : RARITY_COL[r]; g.lineWidth = 1; g.beginPath(); g.ellipse(x, bot, 9, 2.2, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
  }
  function iconFx(x, y, w, h, r) {
    if (!(r >= 3)) return; const t = Q ? Q.t : sceneT, c = r >= 6 ? rarCol(r, t) : RARITY_COL[r];
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const sx = x - w + ((t * 40) % (w * 3));
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(sx, y + h); g.lineTo(sx + 4, y + h); g.lineTo(sx + 4 + h * 0.6, y); g.lineTo(sx + h * 0.6, y); g.fill(); g.restore();
    if (r >= 5) { g.globalAlpha = 0.5 + Math.sin(t * 5) * 0.3; g.fillStyle = c; g.fillRect(x, y, w, 1); g.fillRect(x, y + h - 1, w, 1); g.fillRect(x, y, 1, h); g.fillRect(x + w - 1, y, 1, h); g.globalAlpha = 1; }
    const k = Math.floor(t * 3 + x) % 4, px = k < 2 ? x + 2 : x + w - 3, py = k % 2 ? y + 2 : y + h - 3; g.fillStyle = c; g.globalAlpha = 0.6 + 0.4 * Math.sin(t * 9); g.fillRect(px - 1, py, 3, 1); g.fillRect(px, py - 1, 1, 3); g.globalAlpha = 1;
  }
  // the player's animator:""")
rep("""    if (av) drawArmorFront(av, ax, ab);
    if (hh && hh.hat) drawHat(hh, ax, ab, P.face);""", """    if (av) drawArmorFront(av, ax, ab);
    if (hh && hh.hat) drawHat(hh, ax, ab, P.face);
    { const wid = hk || (sw && sw.id), wit = wid && ITEM[wid], ait = save.inv.armor && ITEM[save.inv.armor]; if (wit) rarFx(wit.rar, ax + P.face * 9, ab - 13, 6); if (ait) rarAura(ait.rar, ax, ab); }""")
rep("""        const ic = itemIcon(it.id); g.drawImage(ic.c, bx, by);""", """        const ic = itemIcon(it.id); g.drawImage(ic.c, bx, by); iconFx(bx, by, 26, 26, it.rar);""")
rep("""        g.drawImage(itemIcon(it.id).c, x + 2, y + 2);""", """        g.drawImage(itemIcon(it.id).c, x + 2, y + 2); iconFx(x + 2, y + 2, 26, 26, it.rar);""")
rep("""        g.drawImage(itemIcon(it.id).c, 192, 34, 52, 52);""", """        g.drawImage(itemIcon(it.id).c, 192, 34, 52, 52); iconFx(192, 34, 52, 52, it.rar);""")
rep("""    g.drawImage(itemIcon(it.id).c, 34, 18, 52, 52);""", """    g.drawImage(itemIcon(it.id).c, 34, 18, 52, 52); iconFx(34, 18, 52, 52, it.rar);""")
rep("""    if (it) { g.drawImage(itemIcon(it.id).c, x, y); }""", """    if (it) { g.drawImage(itemIcon(it.id).c, x, y); iconFx(x, y, 26, 26, it.rar); }""")

# ================= 2) skills 1-4 =================
rep("""    act.sumP = any(pressed, ['KeyT']) || gpP('r3');""", """    act.sumP = any(pressed, ['Digit0']) || gpP('r3');   // touch star / gamepad R3: the first charged skill
    act.sk1P = any(pressed, ['Digit1', 'Numpad1']); act.sk2P = any(pressed, ['Digit2', 'Numpad2']); act.sk3P = any(pressed, ['Digit3', 'Numpad3']); act.sk4P = any(pressed, ['Digit4', 'Numpad4']);""")
rep("act.skillP = act.shopP = act.sumP = act.parryP = false; }", "act.skillP = act.shopP = act.sumP = act.parryP = act.sk1P = act.sk2P = act.sk3P = act.sk4P = false; }")
rep("'sumP', 'parryP'];", "'sumP', 'parryP', 'sk1P', 'sk2P', 'sk3P', 'sk4P'];")
rep("{ k: 'KeyF', x: w - s * 3.5, y: h - s * 2.4, r: r * 0.8, l: '◆' }", "{ k: 'KeyF', x: w - s * 3.5, y: h - s * 2.4, r: r * 0.8, l: '◆' }, { k: 'Digit0', x: w - s * 2.3, y: h - s * 2.9, r: r * 0.75, l: '★' }")
rep("Dash K  Parry F  Use E', vi:", "Dash K  Parry F  Skills 1-4  Use E', vi:")
rep("Lướt K  Đỡ đòn F  Dùng E' },", "Lướt K  Đỡ đòn F  Kỹ năng 1-4  Dùng E' },")
rep("""    if (act.sumP) castSummons();""", """    if (act.sk1P) useSk(0); if (act.sk2P) useSk(1); if (act.sk3P) useSk(2); if (act.sk4P) useSk(3);
    if (act.sumP) { const i = [0, 1, 2, 3].find(k => skIsReady(k)); useSk(i === undefined ? 0 : i); }""")
# charging: sword hits, thrown daggers and the player's own shots (not the summons')
rep("""        curHit = null;
        swordHitFx(e, st, sw.id, d);""", """        curHit = null; chargeHit();
        swordHitFx(e, st, sw.id, d);""")
rep("""        if (p.t === 'dagger') { (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 2 + (hasRelic(1) ? 1 : 0)); Snd.play('hit'); p.dead = true; }""", """        if (p.t === 'dagger') { (hit.isBoss ? hurtBoss : hurtEnemy)(hit, 2 + (hasRelic(1) ? 1 : 0)); Snd.play('hit'); p.dead = true; chargeHit(); }""")
rep("""  function shootG(o) { Q.fps.push(Object.assign({ t: 'g', vx: 0, vy: 0, g: 0, life: 1.2, dmg: 1, hit: new Set(), shape: 'bolt', col: '#fff', sz: 2, f: 1, age: 0, arm: 0 }, o)); }""",
    """  let sumCtx = false;   // true while summons deal damage (bosses take less from them)
  function shootG(o) { Q.fps.push(Object.assign({ t: 'g', vx: 0, vy: 0, g: 0, life: 1.2, dmg: 1, hit: new Set(), shape: 'bolt', col: '#fff', sz: 2, f: 1, age: 0, arm: 0, sum: sumCtx, own: Q.P }, o)); }""")
rep("""      if (!p.expl) dmgFoe(e, p.dmg, !!p.pierce, !!p.quiet);""", """      if (!p.expl) { const sc0 = sumCtx; sumCtx = !!p.sum; dmgFoe(e, p.dmg, !!p.pierce, !!p.quiet); sumCtx = sc0; if (!p.sum && !p.skill) chargeHit(p.own); }""")
rep("""    b.lastHit = Q.t;
    if (b.shield > 0) {""", """    b.lastHit = Q.t;
    if (sumCtx) dmg *= 0.6;   // the boss is tough against summons: the hero has to fight too
    if (b.shield > 0) {""")
rep("""  function summonItems() {""", """  // ===== skills 1-4: landing hits charges what you wear; a full slot unleashes its power =====
  // 1 = weapon slot 1, 2 = weapon slot 2 (sword, gun or other weapon), 3 = armor, 4 = pet
  function slotId(i) { const v = save.inv; return i === 0 ? v.w[0] : i === 1 ? v.w[1] : i === 2 ? v.armor : v.pet; }
  const SK_SLOT = [['weapon 1', 'vũ khí 1'], ['weapon 2', 'vũ khí 2'], ['armor', 'giáp'], ['pet', 'pet']];
  function skNeed(it) { return it.st.summon || it.st.form ? 22 : it.type === 'armor' ? 16 : it.type === 'pet' ? 14 : 12; }
  function skName(it) {
    if (it.st.summon) return sv('Summon ', 'Triệu hồi ') + sumName(it.st.summon);
    if (it.st.form) return sv('Transform: ', 'Biến hình: ') + sumName(it.st.form);
    return LN({ sword: { en: 'Blade Wave', vi: 'Kiếm Khí' }, gun: { en: 'Bullet Storm', vi: 'Bão Đạn' }, armor: { en: 'Divine Shield', vi: 'Khiên Thần' }, pet: { en: 'Healing Bond', vi: 'Hồi Máu Đồng Hành' } }[it.type] || { en: 'Shockwave', vi: 'Sóng Chấn' });
  }
  const isMe = P => !coop || P === Q.me;
  function skIsReady(i) { const id = slotId(i), it = id && ITEM[id]; return !!it && ((Q.P.chg || [])[i] || 0) >= skNeed(it); }
  function chargeHit(p) {
    if (p && p !== Q.P && p.isPlayer) return asP(p, () => chargeHit());
    const P = Q.P; if (!P || !P.isPlayer) return; P.chg = P.chg || [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const id = slotId(i), it = id && ITEM[id]; if (!it) continue; const nd = skNeed(it); if (P.chg[i] >= nd) continue;
      P.chg[i] = Math.min(nd, P.chg[i] + 1);
      if (P.chg[i] >= nd && isMe(P)) { Q.msg = '[' + (i + 1) + '] ' + LN(it.name) + sv(' is charged! Press ' + (i + 1) + ': ', ' đã tích đầy! Nhấn ' + (i + 1) + ' để dùng: ') + skName(it); Q.msgT = 3.4; Snd.play('relic'); pop(P.x + 4, P.y - 18, '[' + (i + 1) + '] ' + sv('READY!', 'SẴN SÀNG!'), RARITY_COL[it.rar] || '#ffd34e'); }
    }
  }
  function useSk(i) {
    const P = Q.P, id = slotId(i), it = id && ITEM[id]; P.chg = P.chg || [0, 0, 0, 0];
    if (!it) { if (isMe(P)) { Q.msg = sv('Nothing equipped in slot ' + (i + 1) + ' (' + SK_SLOT[i][0] + ')', 'Chưa trang bị gì ở ô ' + (i + 1) + ' (' + SK_SLOT[i][1] + ')'); Q.msgT = 2; Snd.play('select'); } return; }
    const nd = skNeed(it);
    if (P.chg[i] < nd) { if (isMe(P)) { Q.msg = '[' + (i + 1) + '] ' + LN(it.name) + ': ' + P.chg[i] + '/' + nd + sv(' - land hits to charge it', ' - đánh trúng quái để tích nội tại'); Q.msgT = 2; Snd.play('select'); } return; }
    if (it.st.form && Q.G.morph) return;
    P.chg[i] = 0; const x = P.x + 4, y = P.y + 7, f = P.face, col = RARITY_COL[it.rar] || '#ffd34e', st = it.st;
    pop(x, P.y - 22, skName(it) + '!', col); addRing(x, y, col, 70, 0.5); Q.shake = Math.max(Q.shake, 0.3);
    if (st.summon) { spawnSummon(st.summon, 30, P, true); return; }
    if (st.form) { petMorph(P, st.form); return; }
    const d = baseDmg() + (st.dmg || 0) + 2;
    if (it.type === 'sword') { Snd.play('slash'); for (let k = -1; k <= 1; k++) shootG({ x: x + f * 8, y: y + k * 7, vx: f * 300, vy: k * 18, life: 0.9, dmg: d * 2, thru: true, pierceN: 99, shape: 'wind', col, sz: 10, f, skill: true }); }
    else if (it.type === 'gun') { Snd.play('explode'); for (let k = 0; k < 11; k++) { const a = (k - 5) * 0.07; shootG({ x: x + f * 8, y, vx: Math.cos(a) * f * 380, vy: Math.sin(a) * 380, life: 0.8, dmg: d, pierceN: 2, shape: 'bolt', col, sz: 3, f, skill: true }); } }
    else if (it.type === 'armor') { P.shield = true; P.inv = Math.max(P.inv, 1); nova(x, y, 80, d * 2); Snd.play('relic'); emit(x, y, 30, { col: [col, '#fff'], sp0: 30, sp1: 140 }); }
    else if (it.type === 'pet') { P.hp = Math.min(maxHP(), P.hp + 2); Snd.play('heart'); emit(x, y, 24, { col: ['#ff7fb0', '#fff', col], sp0: 20, sp1: 90 }); }
    else { nova(x, y, 90, d * 2); Snd.play('boom'); }
  }
  // the four skill slots, bottom centre: icon, charge filling up, a glowing frame when ready
  function drawSkBadges() {
    const P = Q.P, ch = P.chg || [0, 0, 0, 0], x0 = Math.round(VW / 2 - 51), y0 = VH - 31;
    for (let i = 0; i < 4; i++) {
      const id = slotId(i), it = id && ITEM[id], bx = x0 + i * 26, by = y0;
      g.fillStyle = 'rgba(20,18,31,.85)'; g.fillRect(bx, by, 24, 24);
      if (!it) { g.fillStyle = '#434d6e'; g.fillRect(bx, by, 24, 1); g.fillRect(bx, by + 23, 24, 1); g.fillRect(bx, by, 1, 24); g.fillRect(bx + 23, by, 1, 24); txt(String(i + 1), bx + 12, by + 12, { al: 'center', size: 7, col: '#434d6e' }); continue; }
      const nd = skNeed(it), k = clamp((ch[i] || 0) / nd, 0, 1), col = RARITY_COL[it.rar] || '#ffd34e', ready = k >= 1;
      g.drawImage(itemIcon(id).c, bx + 1, by + 1, 22, 22);
      g.fillStyle = 'rgba(10,8,20,.66)'; g.fillRect(bx + 1, by + 1, 22, Math.round(22 * (1 - k)));
      if (ready) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.22 + 0.14 * Math.sin(Q.t * 8); g.fillStyle = col; g.fillRect(bx - 2, by - 2, 28, 28); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
      g.globalAlpha = ready ? 0.65 + 0.35 * Math.sin(Q.t * 8) : 0.6; g.fillStyle = ready ? col : '#6a6f8a'; g.fillRect(bx, by, 24, 1); g.fillRect(bx, by + 23, 24, 1); g.fillRect(bx, by, 1, 24); g.fillRect(bx + 23, by, 1, 24); g.globalAlpha = 1;
      g.fillStyle = col; g.fillRect(bx + 1, by + 21, Math.round(22 * k), 2);
      txt(String(i + 1), bx + 4, by + 5, { size: 6.5, bold: true, col: ready ? '#ffffff' : '#cfd6e6', ol: '#14121f' });
    }
  }
  // ===== the pet's transformation: 3 seconds of light, then its Ancient form steps out =====
  function petMorph(P, kind) {
    const G = Q.G; G.morph = { t: 0, dur: 3, kind, owner: P }; Snd.play('relic'); Snd.cineHit && Snd.cineHit('rise');
    Q.msg = sv('Your pet is transforming...', 'Pet của bạn đang biến hình...'); Q.msgT = 3;
  }
  function updateMorph(dt) {
    const G = Q.G, m = G.morph; if (!m) return; m.t += dt; const pt = G.pet, x = pt ? pt.x : m.owner.x, y = pt ? pt.y - 8 : m.owner.y, k = m.t / m.dur;
    if (Math.random() < 0.9) { const a = m.t * 9 + Math.random() * 6, r = 26 * (1 - k) + 6; emit(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.6, 1, { col: [(GIANT[m.kind] || BEAST[m.kind]).glow, '#ffffff', '#ffd34e'], sp0: 4, sp1: 18, grav: -30, l0: 0.3, l1: 0.6 }); }
    if (Math.floor(m.t * 2) !== Math.floor((m.t - dt) * 2)) { addRing(x, y, (GIANT[m.kind] || BEAST[m.kind]).glow, 30 + k * 50, 0.4); Snd.play('chime'); }
    Q.shake = Math.max(Q.shake, 0.05 + k * 0.2);
    if (m.t >= m.dur) { G.morph = null; G.flash = Math.max(G.flash || 0, 0.35); Snd.play('explode'); addRing(x, y, '#ffffff', 120, 0.5); emit(x, y, 50, { col: [(GIANT[m.kind] || BEAST[m.kind]).glow, '#fff', '#ffd34e'], sp0: 40, sp1: 200 }); spawnSummon(m.kind, 30, m.owner, true, { x, y: pt ? pt.y : m.owner.y + m.owner.h }); }
  }
  function summonItems() {""")
# HUD: badges instead of the T chips
rep("""      for (const id of summonItems()) { const cd = (G.sumCd && G.sumCd[id + ':' + (Q.P.slot || 0)]) || 0, k = ITEM[id].st.summon; chip('T ' + sumName(k) + ' (' + LN(ITEM[id].name) + ')' + (cd > 0 ? ' ' + Math.ceil(cd) + 's' : sv(' READY', ' SẴN SÀNG')), cd > 0 ? '#8892aa' : '#ff4af0'); }
""", "")
rep("""      { const pe = petIt(); if (pe && pe.st.form) { const k = pe.st.form; chip(sumName(k) + ' ' + (G.petForm > 0 ? G.petForm.toFixed(1) : Math.max(0, Math.ceil(G.formCd === undefined ? 25 : G.formCd)) + 's'), G.petForm > 0 ? '#ff9a2a' : '#8892aa'); } } }""", """    }
    drawSkBadges();""")
# the pet glows and grows while transforming; hidden while its Ancient form is out
rep("""const pvx = (pt.x - (pt.lx === undefined ? pt.x : pt.lx)) * 60; pt.lx = pt.x; const PA = animPose(""", """const pvx = (pt.x - (pt.lx === undefined ? pt.x : pt.lx)) * 60; pt.lx = pt.x; const mo = G.morph, PA = animPose(""")
rep("""      drawSprT(g, sp, Math.round(pt.x - camX + off + PA.ox), Math.round(pt.y - camY + (fly ? hop : 0) + PA.oy), pt.f < 0, false, PA.sx, PA.sy, PA.rot, pt.id === 'ghostie' ? 0.75 : 1); }""",
    """      if (mo) { const k = mo.t / mo.dur, gw = 1 + k * 0.9 + Math.sin(mo.t * 30) * 0.08 * k; PA.sx *= gw; PA.sy *= gw; PA.rot += Math.sin(mo.t * 12) * 0.2 * k; drawAura(Math.round(pt.x - camX), Math.round(pt.y - camY - 8), 18 + k * 30, (GIANT[mo.kind] || BEAST[mo.kind]).glow, 0.4 + k * 0.4); }
      { const pit = ITEM[pt.id]; if (pit && pit.rar >= 3 && !mo) rarFx(pit.rar, pt.x - camX, pt.y - camY - 6, 5); }
      drawSprT(g, sp, Math.round(pt.x - camX + off + PA.ox), Math.round(pt.y - camY + (fly ? hop : 0) + PA.oy), pt.f < 0, !!mo && Math.floor(mo.t * (6 + mo.t * 6)) % 2 === 0, PA.sx, PA.sy, PA.rot, pt.id === 'ghostie' ? 0.75 : 1); }""")
rep("""    if (pet && pet.st.form) { G.formCd = (G.formCd === undefined ? 25 : G.formCd) - dt; if (G.formCd <= 0 && (nearestFoe(P.x, P.y, 240) || (Q.boss && Q.arenaSealed))) { G.formCd = 60; G.petForm = 7; spawnSummon(pet.st.form, 7, P); } }
    if (G.petForm > 0) G.petForm -= dt;""", """    updateMorph(dt); G.petForm = G.sums.some(s => s.fromPet && s.life > 0) ? 1 : 0;
    sumCtx = true;""")
rep("""    G.sums = G.sums.filter(s => s.life > 0 && (s.hp > 0 || s.dying > 0));""", """    G.sums = G.sums.filter(s => s.life > 0 && (s.hp > 0 || s.dying > 0));
    sumCtx = false;
    // the boss is no pushover: when summons crowd it, it sweeps them away
    const B = Q.boss; if (B && !B.dead && !B.hide && Q.arenaSealed && G.sums.length) {
      G.bSweep = (G.bSweep === undefined ? 4 : G.bSweep) - dt;
      const near = G.sums.filter(s => s.ph === 'fight' && Math.abs(s.x - (B.x + B.w / 2)) < B.w / 2 + 90);
      if (G.bSweep <= 0 && near.length) { G.bSweep = 3.6; const bx = B.x + B.w / 2, by = B.y + B.h / 2; addRing(bx, by, bpc(), B.w / 2 + 90, 0.5); Snd.play('boom'); Q.shake = Math.max(Q.shake, 0.4); hitSums({ x: B.x - 90, y: B.y - 30, w: B.w + 180, h: B.h + 40 }, true); hitSums({ x: B.x - 90, y: B.y - 30, w: B.w + 180, h: B.h + 40 }, true); pop(bx, B.y - 16, sv('SWEEP!', 'QUÉT!'), '#ff7a7a'); }
    }""")
rep("sel: p.sel, parryT:", "sel: p.sel, chg: p.chg || null, parryT:")

# ================= 3) summon entrances, the 3-step rule, gaits and engage moves =================
rep("""  function spawnSummon(kind, life, owner, evo) {
    const o = owner || Q.P, G = Q.G; if (!G.sums) G.sums = [];
    G.sums.push({ evo: !!evo, stage: 1, hp: sumHp(1), hpMax: sumHp(1), inv: 0, kind, life: life || 7, max: life || 7, t: 0, x: o.x + 4 - o.face * 30, y: o.y + o.h, f: o.face, cd: 0.6, n: 0, owner: o });
    Snd.play('relic'); Snd.play('boom'); Q.shake = Math.max(Q.shake, 0.45); G.flash = Math.max(G.flash || 0, 0.18);
    addRing(o.x + 4, o.y + 7, (GIANT[kind] || BEAST[kind]).glow, 80, 0.6); emit(o.x + 4, o.y + 4, 40, { col: [(GIANT[kind] || BEAST[kind]).glow, '#fff'], sp0: 30, sp1: 160 });
    pop(o.x + 4, o.y - 26, sumName(kind) + '!', (GIANT[kind] || BEAST[kind]).glow);
  }""", """  // how each summon arrives, then moves: entrance -> 1) 0.5 s freeze and head turn to lock the target -> 2) wind-up -> 3) its own gait
  // (no attacks while it walks in) -> an engage move when the target is close -> the fight
  const SUM_ENT = { clones: 'shadow', ninetail: 'shadow', shogun: 'smoke', titan: 'meteor', golems: 'meteor', frostgiant: 'meteor', stormgod: 'bolt', thunderkirin: 'bolt', valkyrie: 'bolt', moongoddess: 'beam', angel: 'beam', sunemperor: 'beam', aegis: 'beam', seagoddess: 'geyser', treant: 'roots', phoenix: 'swoop', dragonking: 'swoop', dragonform: 'swoop', skywhale: 'swoop' };
  const ENT_T = { shadow: 1.9, smoke: 1.1, meteor: 1.0, bolt: 0.9, beam: 1.5, geyser: 1.3, roots: 1.7, swoop: 1.3 };
  const SUM_GAIT = { titan: 'heavy', golems: 'heavy', frostgiant: 'heavy', treant: 'heavy', clones: 'stalk', ninetail: 'stalk', shogun: 'stalk', seagoddess: 'glide', moongoddess: 'glide', angel: 'glide', valkyrie: 'glide', stormgod: 'glide', sunemperor: 'swagger', aegis: 'swagger', thunderkirin: 'gallop' };
  const GAIT_SP = { heavy: 26, stalk: 30, glide: 38, swagger: 30, gallop: 64, soar: 52 };
  const SUM_ENG = { titan: 'leap', golems: 'leap', frostgiant: 'leap', treant: 'leap', valkyrie: 'leap', stormgod: 'tele', moongoddess: 'tele', angel: 'tele', sunemperor: 'tele', seagoddess: 'tele', clones: 'shadow', ninetail: 'shadow', shogun: 'shadow', thunderkirin: 'dash', aegis: 'dash', phoenix: 'dive', dragonking: 'dive', dragonform: 'dive', skywhale: 'dive' };
  const SUM_EVO = { clones: 14, ninetail: 14, shogun: 15, titan: 18, golems: 16, frostgiant: 18, treant: 18, stormgod: 15, thunderkirin: 14, valkyrie: 15, moongoddess: 16, angel: 16, sunemperor: 18, aegis: 16, seagoddess: 16, phoenix: 15, dragonking: 17, dragonform: 15, skywhale: 16 };
  function spawnSummon(kind, life, owner, evo, from) {
    const o = owner || Q.P, G = Q.G; if (!G.sums) G.sums = [];
    const B = Q.boss, tg = B && Q.arenaSealed && !B.dead && !B.hide ? B : nearestFoe(o.x + 4, o.y, 600), dir = tg ? (tg.x + tg.w / 2 < o.x + 4 ? -1 : 1) : o.face;
    const ent = SUM_ENT[kind] || 'beam', fly = !!SUM_FLY[kind], glow = (GIANT[kind] || BEAST[kind]).glow;
    let x = from ? from.x : (ent === 'shadow' ? o.x + 4 : o.x + 4 + dir * (ent === 'meteor' ? 74 : 56)); if (Q.arenaSealed) x = arenaClamp(x);
    const gy = sumGround(x, from ? from.y : o.y + o.h), y = fly ? gy - 60 : gy, L = (life || 7) + (ENT_T[ent] || 1) + 1.6;
    const sm = { evo: !!evo, stage: 1, hp: sumHp(1), hpMax: sumHp(1), inv: 9, kind, life: L, max: L, t: 0, x, y, f: dir, cd: 0.6, n: 0, owner: o, ph: 'enter', pt: 0, ent, ex: x, ey: y, fromPet: !!from };
    if (ent === 'swoop') { sm.x = sm.sx0 = x - dir * 220; sm.y = sm.sy0 = y - 120; }
    G.sums.push(sm);
    Snd.play('relic'); if (ent === 'shadow') { addRing(o.x + 4, o.y + o.h, '#5a2a8a', 40, 0.6); } else { G.flash = Math.max(G.flash || 0, 0.12); }
    pop(o.x + 4, o.y - 26, sumName(kind) + '!', glow);
  }
  function sumIntro(s, o, dt) {
    s.pt += dt; const k = s.pt, H = SUM_H[s.kind] || 50, glow = (GIANT[s.kind] || BEAST[s.kind]).glow, tg = sumTarget(s), fly = !!SUM_FLY[s.kind];
    s.ax = s.ay = s.arot = s.sink = 0; s.asx = s.asy = s.aal = 1; s.mv = 0; s.atkT = 0; s.look = 0;
    const once = (key, fn) => { if (!s['_' + key]) { s['_' + key] = 1; fn(); } };
    const dmg = n => Math.round((n + baseDmg()) * 1.5);
    if (s.ph === 'enter') {
      const T = ENT_T[s.ent] || 1, u = clamp(k / T, 0, 1);
      switch (s.ent) {
        case 'shadow':   // rises out of the hero's shadow: crouched, one hand on the ground, then the head comes up and it stands
          s.sink = (1 - ez(seg(u, 0.12, 0.62))) * H; s.asy = u < 0.72 ? 0.66 : 0.66 + 0.34 * ez(seg(u, 0.72, 1)); s.arot = s.f * 0.35 * (1 - ez(seg(u, 0.5, 1))); s.look = u > 0.5 ? 1 : 0;
          once('a', () => Snd.play('poof')); if (Math.random() < 0.6) emit(s.x + rr(-16, 16), s.y, 1, { col: ['#5a2a8a', '#14121f', '#a15be0'], sp0: 4, sp1: 20, grav: -40, l0: 0.4, l1: 0.8 }); break;
        case 'smoke':
          once('a', () => { Snd.play('poof'); emit(s.x, s.y - 20, 40, { col: ['#3a3a4a', '#6a6a7a', '#14121f'], sp0: 20, sp1: 90, grav: -20, l0: 0.5, l1: 1 }); });
          s.asy = u < 0.6 ? 0.7 : 0.7 + 0.3 * ez(seg(u, 0.6, 1)); s.aal = ez(seg(u, 0, 0.35)); break;
        case 'meteor': {   // crashes down from the sky
          const f = clamp(k / 0.75, 0, 1);
          if (f < 1) { s.ay = -(1 - f * f) * 260; s.arot = (1 - f) * 0.4 * s.f; emit(s.x + rr(-8, 8), s.y + s.ay - H * 0.5, 2, { col: ['#ff7a2a', '#ffd34e', '#8a6a44'], sp0: 10, sp1: 40, grav: -30, l0: 0.2, l1: 0.5 }); }
          else {
            once('land', () => { Q.shake = Math.max(Q.shake, 0.9); Snd.play('boom'); Snd.play('explode'); addRing(s.x, s.y, glow, 140, 0.6); for (let i = -6; i <= 6; i++) emit(s.x + i * 12, s.y, 3, { col: ['#8a6a44', '#c8a070', '#fff'], sp0: 20, sp1: 90, vy: -90 }); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - s.x) < 70 && Math.abs(e.y + e.h - s.y) < 40) dmgFoe(e, dmg(6), true, true); });
            const l = seg(k, 0.75, 1); s.asy = 1 - 0.3 * Math.sin(l * Math.PI); s.asx = 1 + 0.2 * Math.sin(l * Math.PI);
          }
          break; }
        case 'bolt':
          once('a', () => { Snd.play('thunder'); Q.G.flash = Math.max(Q.G.flash || 0, 0.25); zap(s.x, Q.cam.y - 6, s.x, s.y); Q.shake = Math.max(Q.shake, 0.4); });
          s.aal = ez(seg(u, 0.3, 0.55)); if (k > 0.3 && Math.random() < 0.6) emit(s.x + rr(-16, 16), s.y - rr(0, H), 1, { col: ['#ffe44e', '#9fe8ff', '#fff'], sp0: 10, sp1: 50, l0: 0.15, l1: 0.3 }); break;
        case 'beam': s.ay = -(1 - ez(u)) * 140; s.aal = ez(seg(u, 0, 0.4)); once('a', () => Snd.play('chime')); break;
        case 'geyser':
          s.ay = -Math.sin(u * Math.PI) * 30; s.sink = (1 - ez(seg(u, 0, 0.45))) * H; once('a', () => Snd.play('splash'));
          emit(s.x + rr(-10, 10), s.y, 2, { col: ['#6ee7f2', '#bfeaff', '#fff'], sp0: 20, sp1: 80, vy: -160, grav: 300, l0: 0.4, l1: 0.8 }); break;
        case 'roots':
          s.sink = (1 - ez(seg(u, 0.1, 0.9))) * H; once('a', () => Snd.play('rumble')); Q.shake = Math.max(Q.shake, 0.08);
          if (Math.random() < 0.6) emit(s.x + rr(-20, 20), s.y, 1, { col: ['#5fcf5a', '#8a6a44', '#2b8a3e'], sp0: 10, sp1: 40, vy: -40, l0: 0.4, l1: 0.8 }); break;
        case 'swoop': { const e2 = ez(u); s.x = s.sx0 + (s.ex - s.sx0) * e2; s.y = s.sy0 + (s.ey - s.sy0) * e2 - Math.sin(u * Math.PI) * 30; s.mv = 1; s.arot = (1 - u) * 0.25 * s.f; once('a', () => Snd.play('whoosh')); break; }
      }
      if (k >= T) { s.ph = 'aware'; s.pt = 0; s.inv = 0.4; }
      return;
    }
    if (s.ph === 'aware') {   // 1) stand still, then turn the head and lock the target
      if (k > 0.25 && tg) s.f = tg.x + tg.w / 2 < s.x ? -1 : 1;
      s.look = k > 0.25 ? 1 : 0; if (fly) s.ay = Math.sin(s.t * 2) * 3;
      if (k >= 0.5) { s.ph = 'ready'; s.pt = 0; }
      return;
    }
    if (s.ph === 'ready') {   // 2) gather strength: dip, rise, roll the shoulders
      const u = k / 0.6; s.asy = 1 - 0.1 * Math.sin(Math.min(1, u / 0.5) * Math.PI) + 0.06 * Math.sin(seg(u, 0.5, 1) * Math.PI); s.asx = 2 - s.asy; s.look = 1;
      if (fly) s.ay = -6 * Math.sin(u * Math.PI);
      once('r', () => { if (SUM_GAIT[s.kind] === 'heavy') Snd.play('rumble'); });
      if (k >= 0.6) { s.ph = 'march'; s.pt = 0; }
      return;
    }
    if (s.ph === 'march') {   // 3) walk in like a person would, each in its own way; no attacks yet
      const gait = fly ? 'soar' : (SUM_GAIT[s.kind] || 'heavy'), eg = SUM_ENG[s.kind] || 'dash', ENR = eg === 'tele' ? 220 : eg === 'dive' ? 200 : eg === 'leap' ? 170 : 140;
      let sp = GAIT_SP[gait]; const dx = tg ? tg.x + tg.w / 2 - s.x : 0, ad = Math.abs(dx); if (tg) s.f = dx < 0 ? -1 : 1;
      if (gait === 'heavy') { const n = Math.floor(k * 2.2); if (n !== s.stepN) { s.stepN = n; Q.shake = Math.max(Q.shake, 0.22); Snd.play('bstep'); emit(s.x, s.y, 6, { col: ['#8a7a6a', '#cfd6e6'], sp0: 10, sp1: 40, vy: -20, l0: 0.2, l1: 0.4 }); } const ph = Math.abs(Math.sin(k * 2.2 * Math.PI)); sp *= 0.5 + 0.5 * ph; s.ay = -ph * 1.5; s.asy = 1 - 0.03 * ph; }
      else if (gait === 'stalk') { s.arot = s.f * 0.16; sp *= 0.3 + 0.7 * Math.abs(Math.sin(k * 2.4)); s.ax = Math.sin(k * 1.7) * 6; s.ay = -Math.abs(Math.sin(k * 4.8)) * 1.2; if (Math.random() < 0.5) emit(s.x - s.f * 12, s.y - 1, 1, { col: ['#a15be0', '#ffd34e', '#5a2a8a'], sp0: 5, sp1: 30, vy: -10, grav: 60, l0: 0.2, l1: 0.5 }); }
      else if (gait === 'glide') { s.ay = -8 + Math.sin(k * 2.5) * 3; s.arot = s.f * 0.06; }
      else if (gait === 'swagger') { s.arot = Math.sin(k * 4) * 0.09; s.ay = -Math.abs(Math.sin(k * 4)) * 1.5; }
      else if (gait === 'soar') { s.ay = Math.sin(k * 2) * 4; }
      if (!tg) { if (k < 5) { s.x += s.f * sp * 0.5 * dt; s.mv = 1; } }
      else if (ad > ENR) { s.x += s.f * Math.min(sp * dt, ad - ENR); s.mv = 1; if (fly) s.y += clamp(tg.y - 60 - s.y, -40 * dt, 40 * dt); }
      else { s.ph = 'engage'; s.pt = 0; s.eg = eg; s.tg = tg; s.ex0 = s.x; s.ey0 = s.y; }
      if (Q.arenaSealed) s.x = arenaClamp(s.x);
      if (!fly) { const gy = sumGround(s.x, s.y); s.y = gy < s.y ? gy : Math.min(gy, s.y + 420 * dt); }
      return;
    }
    if (s.ph === 'engage') {   // the opening strike
      const t2 = s.tg && !s.tg.dead ? s.tg : tg; if (!t2) { s.ph = 'fight'; return; }
      const tx = t2.x + t2.w / 2;
      if (s.eg === 'leap') {   // jumps high and slams down
        const u = clamp(k / 0.9, 0, 1); s.x = s.ex0 + (tx - s.f * 18 - s.ex0) * ez(u); s.ay = -Math.sin(u * Math.PI) * 110; s.asy = u < 0.15 ? 0.85 : 1.08; s.asx = 2 - s.asy; s.arot = s.f * (u - 0.5) * 0.5;
        once('j', () => Snd.play('jump'));
        if (u >= 1) { once('slam', () => { Q.shake = Math.max(Q.shake, 0.8); Snd.play('boom'); addRing(s.x, s.y, glow, 120, 0.5); for (let i = -5; i <= 5; i++) emit(s.x + i * 12, s.y, 3, { col: ['#8a6a44', '#c8a070', '#fff'], sp0: 20, sp1: 80, vy: -80 }); for (const e of foes()) if (Math.abs(e.x + e.w / 2 - s.x) < 80 && Math.abs(e.y + e.h - s.y) < 70) { dmgFoe(e, dmg(8), true, true); if (!e.isBoss) e.stunT = Math.max(e.stunT || 0, 1); } }); s.ph = 'fight'; }
      } else if (s.eg === 'tele') {   // vanishes, reappears in the sky above the target and casts from there
        if (k < 0.3) { s.aal = 1 - k / 0.3; once('v', () => { Snd.play('zap'); emit(s.x, s.y - H / 2, 20, { col: [glow, '#fff'], sp0: 20, sp1: 90 }); }); }
        else { once('p', () => { s.x = tx - s.f * 40; s.air = true; s.y = t2.y - 50; emit(s.x, s.y - H / 2, 26, { col: [glow, '#fff'], sp0: 20, sp1: 120 }); addRing(s.x, s.y - H / 2, glow, 90, 0.4); Snd.play('chime'); }); s.aal = ez(seg(k, 0.3, 0.6)); }
        if (k >= 0.8) { s.ph = 'fight'; s.cd = 0; }
      } else if (s.eg === 'shadow') {   // sinks into its shadow, slides under the target and bursts out behind it
        if (k < 0.3) s.sink = ez(k / 0.3) * H;
        else if (k < 0.6) { s.sink = H; s.x = s.ex0 + (tx + s.f * 26 - s.ex0) * ez((k - 0.3) / 0.3); s.y = sumGround(s.x, t2.y + t2.h); if (Math.random() < 0.7) emit(s.x + rr(-10, 10), s.y, 1, { col: ['#5a2a8a', '#14121f'], sp0: 4, sp1: 16, grav: -30, l0: 0.3, l1: 0.6 }); }
        else { once('b', () => { s.f = tx < s.x ? -1 : 1; Snd.play('slash'); dmgFoe(t2, dmg(12), true, true); emit(tx, t2.y + t2.h / 2, 18, { col: ['#a15be0', '#fff', '#14121f'], sp0: 30, sp1: 140 }); Q.shake = Math.max(Q.shake, 0.4); }); s.sink = (1 - ez(seg(k, 0.6, 0.8))) * H; s.atkT = 0.35; }
        if (k >= 1) s.ph = 'fight';
      } else if (s.eg === 'dash') {   // a sudden, very fast dash
        const u = clamp(k / 0.35, 0, 1); s.x = s.ex0 + (tx - s.f * 22 - s.ex0) * ez(u); s.mv = 1; s.arot = s.f * 0.15;
        emit(s.x - s.f * 10, s.y - H / 2, 2, { col: [glow, '#fff'], sp0: 5, sp1: 20, l0: 0.15, l1: 0.3 });
        if (u >= 1) { once('h', () => { dmgFoe(t2, dmg(8), true, true); Snd.play('slash'); Q.shake = Math.max(Q.shake, 0.3); }); s.ph = 'fight'; }
      } else {   // flyers: climb, then dive
        const u = clamp(k / 0.9, 0, 1); s.mv = 1;
        if (u < 0.4) s.y = s.ey0 - ez(u / 0.4) * 50; else { const v = (u - 0.4) / 0.6; s.x = s.ex0 + (tx - s.ex0) * ez(v); s.y = (s.ey0 - 50) + (t2.y - (s.ey0 - 50)) * v * v; s.arot = s.f * 0.5; }
        if (u >= 1) { once('h', () => { dmgFoe(t2, dmg(8), true, true); Snd.play('explode'); addRing(tx, t2.y, glow, 90, 0.4); }); s.ph = 'fight'; s.y = t2.y - 60; }
      }
      if (Q.arenaSealed && !s.air) s.x = arenaClamp(s.x);
    }
  }""")
rep("""      if (s.evo && s.stage === 1 && ((s.hits || 0) >= 10 || s.t >= 15)) evolveSummon(s);""", """      if (s.ph && s.ph !== 'fight') { sumIntro(s, s.owner || P, dt); if (s.ph !== 'fight') continue; s.ax = s.ay = s.arot = s.sink = 0; s.asx = s.asy = s.aal = 1; s.look = 0; }
      s.ft = (s.ft || 0) + dt;
      if (s.evo && s.stage === 1 && ((s.hits || 0) >= 10 || s.ft >= (SUM_EVO[s.kind] || 15))) evolveSummon(s);""")
rep("""      const o = s.owner || P, fly = !!SUM_FLY[s.kind];""", """      const o = s.owner || P, fly = !!SUM_FLY[s.kind] || !!s.air;""")
# entrance effects drawn around the summon (shadow pool, light pillar, water column, glowing eyes)
rep("""      { const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform', hh = drawSumArt(s, x, y, a);""", """      if (s.ph && s.ph !== 'fight') drawSumFx(s, x, y);
      { const fly = s.kind === 'phoenix' || s.kind === 'dragonking' || s.kind === 'dragonform', hh = drawSumArt(s, x, y, a);""")
rep("""  function drawSummons(camX, camY) {""", """  function drawSumFx(s, x, y) {
    const H = SUM_H[s.kind] || 50, glow = (GIANT[s.kind] || BEAST[s.kind]).glow, k = s.pt, T = ENT_T[s.ent] || 1;
    if ((s.ph === 'enter' && (s.ent === 'shadow' || s.ent === 'roots')) || (s.ph === 'engage' && s.eg === 'shadow')) { g.globalAlpha = 0.75; g.fillStyle = s.ent === 'roots' && s.ph === 'enter' ? '#1e3a1e' : '#1a0a2a'; g.beginPath(); g.ellipse(x, y, 22, 4, 0, 0, 7); g.fill(); g.globalAlpha = 0.5; g.fillStyle = s.ent === 'roots' && s.ph === 'enter' ? '#5fcf5a' : '#a15be0'; g.beginPath(); g.ellipse(x, y, 16 + Math.sin(Q.t * 8) * 2, 2.5, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (s.ph === 'enter' && s.ent === 'beam') { const a = 1 - seg(k, T * 0.8, T); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x - 14, 0, x + 14, 0); gr.addColorStop(0, hexA(glow, 0)); gr.addColorStop(0.5, hexA('#fff6c0', 0.55 * a)); gr.addColorStop(1, hexA(glow, 0)); g.fillStyle = gr; g.fillRect(x - 14, 0, 28, y); g.globalCompositeOperation = 'source-over'; }
    if (s.ph === 'enter' && s.ent === 'geyser') { const a = 1 - seg(k, T * 0.7, T); g.globalAlpha = 0.55 * a; g.fillStyle = '#6ee7f2'; g.fillRect(x - 8, y - H - 30, 16, H + 30); g.fillStyle = '#ffffff'; g.fillRect(x - 3, y - H - 30, 6, H + 30); g.globalAlpha = 1; }
    if (s.ph === 'enter' && s.ent === 'meteor' && k < 0.75) { g.globalCompositeOperation = 'lighter'; const yy = y + (s.ay || 0) - H / 2; const gr = g.createLinearGradient(x, yy - 70, x, yy); gr.addColorStop(0, 'rgba(255,120,40,0)'); gr.addColorStop(1, 'rgba(255,200,90,.6)'); g.fillStyle = gr; g.fillRect(x - 10, yy - 70, 20, 70); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.3; g.fillStyle = '#000'; g.beginPath(); g.ellipse(x, y, 10 + k * 20, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (s.look) { const hx = x + s.f * H * 0.12 + (s.ax || 0), hy = y + (s.ay || 0) + (s.sink || 0) - H * 0.86 * (s.asy || 1), c = s.kind === 'clones' || s.kind === 'shogun' ? '#c07bff' : glow; g.globalCompositeOperation = 'lighter'; g.fillStyle = c; g.globalAlpha = 0.6 + 0.4 * Math.sin(Q.t * 10); g.fillRect(Math.round(hx - 2), Math.round(hy), 2, 1); g.fillRect(Math.round(hx + 1), Math.round(hy), 2, 1); g.globalAlpha = 0.3; g.fillRect(Math.round(hx - 4), Math.round(hy), 9, 1); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }
  function drawSummons(camX, camY) {""")
# hitSums: no damage while arriving
rep("""      if (sm.life <= 0 || sm.hp <= 0 || sm.dying > 0 || sm.inv > 0 || sm.t < 0.6 || sm.kind === 'clones') continue;""", """      if (sm.life <= 0 || sm.hp <= 0 || sm.dying > 0 || sm.inv > 0 || sm.t < 0.6 || sm.kind === 'clones' || sm.ph === 'enter') continue;""")
# debug hooks
rep("castSummons, startCine,", "castSummons, useSk, chargeHit, slotId, skNeed, petMorph, startCine,")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
