  // 7. Glowcap Swamp, turning into a dense jungle: a dark foggy canopy, distant ancient trees, tangled vines over glowing water, mossy ledges
  swamp: B => ({
    sky: bdSky(['#02080a', '#06161a', '#0e2e2a', '#1a4a40'], (x, r) => { for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(120,200,170,.06)'; x.fillRect(0, 70 + i * 24, VW, 9); } for (let i = 0; i < 50; i++) { x.fillStyle = r() < 0.5 ? '#a4ffc0' : '#4affe0'; x.fillRect((r() * VW) | 0, (40 + r() * 140) | 0, 1, 1); } }),
    layers: [
      bdLayer(150, 0.07, 0, (x, h) => {   // the jungle canopy: dark leaf masses and hanging lianas along the top
        const r = mulberry32(61); x.fillStyle = '#04120e'; x.fillRect(0, 0, BD_W, 14);
        for (let i = 0; i < 34; i++) { const cx = (r() * BD_W) | 0, cy = 4 + r() * 26, rad = 12 + ((r() * 18) | 0); bdWrap(o => { bdDisc(x, cx + o, cy, rad, '#06201a'); bdDisc(x, cx + o - 4, cy - 4, (rad * 0.6) | 0, '#0c3a2a'); bdDisc(x, cx + o - 6, cy - 6, (rad * 0.25) | 0, '#1a6a44'); }); }
        for (let i = 0; i < 46; i++) { const cx = (r() * BD_W) | 0, len = 18 + ((r() * 70) | 0); x.fillStyle = '#0a2e1e'; x.fillRect(cx, 22, 1, len); if (i % 3 === 0) { x.fillStyle = '#2a8a4a'; x.fillRect(cx - 1, 22 + len, 3, 2); } }
      }, 'top'),
      bdLayer(200, 0.1, 10, (x, h) => {   // distant massive ancient trees with buttress roots
        const r = mulberry32(62); for (let i = 0; i < 6; i++) { const cx = (i * 92 + r() * 30) | 0, w = 26 + r() * 14; bdWrap(o => { x.fillStyle = '#123a30'; x.fillRect(cx + o - w / 2, 0, w, h); x.fillStyle = '#1a5444'; x.fillRect(cx + o - w / 2, 0, 3, h); x.fillStyle = '#0a241e'; for (let k = 0; k < h; k += 9) x.fillRect(cx + o - w / 2 + 4 + ((k * 5) % (w - 8)), k, 2, 6);
          for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 26; k++) { x.fillStyle = '#123a30'; x.fillRect(cx + o + s * (w / 2 + k * 0.7) - (s < 0 ? 2 : 0), h - 26 + k, 3 + k * 0.05, 1); }
          for (let b = 0; b < 3; b++) { const by = 36 + b * 46, s = b % 2 ? -1 : 1, len = 24 + b * 8; x.fillStyle = '#123a30'; x.fillRect(s > 0 ? cx + o + w / 2 : cx + o - w / 2 - len, by, len, 7); } }); }
        bdHaze(x, h, '#1a4a40', 0.5, 0.25);
      }),
      bdLayer(170, 0.24, 50, (x, h) => {   // mid: thick tangled vines, giant glowing mushrooms, swamp water
        const ys = bdRidge(901, 124, 5); bdFill(x, ys, h, '#08241c'); const r = mulberry32(63);
        for (let i = 0; i < 5; i++) { const cx = (i * 108 + r() * 40) | 0, hh = 40 + r() * 36, rad = 22 + r() * 14, c = i % 2 ? '#2ab08a' : '#8e5ad0'; bdWrap(o => { x.fillStyle = '#bcb090'; x.fillRect(cx + o - 4, ys[cx] - hh, 8, hh + 2); bdGlow(x, cx + o, ys[cx] - hh, rad * 1.6, c, 0.35); bdEll(x, cx + o, ys[cx] - hh, rad, rad * 0.5, c); bdEll(x, cx + o - 3, ys[cx] - hh - 2, rad * 0.6, rad * 0.25, '#ffffff22'); for (let k = 0; k < 6; k++) { const sx = cx + o + (k - 2.5) * rad * 0.35; bdDisc(x, sx, ys[cx] - hh + 2, 1, '#e8ffe8'); } }); }
        for (let i = 0; i < 16; i++) { const cx = (r() * BD_W) | 0, top = 6 + r() * 20, len = 50 + r() * 60, ph = r() * 6; bdWrap(o => { for (let k = 0; k < len; k++) { const px = cx + o + Math.round(Math.sin(k / 10 + ph) * 3); x.fillStyle = k % 6 < 3 ? '#1a6a3a' : '#2a8a4a'; x.fillRect(px, top + k, 2, 1); if (k % 14 === 5) { x.fillStyle = '#4ac86a'; x.fillRect(px + 2, top + k, 4, 2); x.fillRect(px - 4, top + k + 4, 4, 2); } } }); }   // tangled hanging vines
        for (let k = 0; k < 40; k++) { const px = (r() * BD_W) | 0, py = ys[px] + 4 + ((r() * 36) | 0); x.fillStyle = r() < 0.5 ? 'rgba(74,184,160,.55)' : 'rgba(164,255,192,.3)'; x.fillRect(px, py, 6 + ((r() * 12) | 0), 1); }
        bdHaze(x, h, '#1a4a40', 0.2, 0.05);
      }),
      bdLayer(170, 0.42, 56, (x, h) => {   // near: mossy ledges, ferns and glowing mushrooms, a few swaying vines
        const ys = bdRidge(902, 130, 3); bdFill(x, ys, h, '#0c2e26', '#2a6a4a'); const r = mulberry32(64);
        for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0, len = 30 + r() * 40; bdWrap(o => { for (let k = 0; k < len; k++) { x.fillStyle = k % 5 < 3 ? '#14502e' : '#1e6a3a'; x.fillRect(cx + o + Math.round(Math.sin(k / 8 + i) * 2), 0 + k, 2, 1); } x.fillStyle = '#6aff8a'; x.fillRect(cx + o - 1, len, 3, 2); }); }
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, hh = 6 + r() * 12, c = r() < 0.5 ? '#7aff9a' : '#4affe0'; bdWrap(o => { x.fillStyle = '#d8ccb0'; x.fillRect(cx + o - 1, ys[cx] - hh, 2, hh + 2); bdGlow(x, cx + o, ys[cx] - hh, 12, c, 0.5); bdEll(x, cx + o, ys[cx] - hh, 5, 3, c); x.fillStyle = '#ffffff'; x.fillRect(cx + o - 2, ys[cx] - hh - 1, 1, 1); }); }
        for (let i = 0; i < 24; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { for (let k = -2; k <= 2; k++) { x.fillStyle = '#1e7a3e'; x.fillRect(cx + o + k * 2, ys[cx] - 6 + Math.abs(k), 1, 6 - Math.abs(k)); } }); }
      })
    ]
  }),
  // 8. Sunken Deep, a vertical descent: fading deep-blue water, giant sea creatures far away, steep underwater cliffs, coral ledges stepping down
  ocean: B => ({
    sky: bdSky(['#2a82c0', '#145e9c', '#0a3a74', '#02102c'], (x, r) => { for (let i = 0; i < 7; i++) { const cx = 20 + i * 56; x.fillStyle = 'rgba(180,235,255,.07)'; for (let k = 0; k < VH; k++) x.fillRect(cx + k * 0.35, k, 18 - k * 0.06, 1); } for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(200,240,255,.5)'; x.fillRect((r() * VW) | 0, (r() * VH) | 0, 1, 1); } }),
    layers: [
      bdLayer(160, 0.03, 4, (x, h) => {   // giant sea creatures, only silhouettes in the deep blue
        const r = mulberry32(71);
        const leviathan = (cx, cy, s, f) => { x.fillStyle = '#082450'; for (let k = 0; k < 10; k++) { const px = cx - f * k * 11 * s, py = cy + Math.sin(k * 0.7) * 6 * s, rad = (15 - k * 1.1) * s; if (rad > 1) bdEll(x, px, py, rad * 1.3, rad * 0.8, '#082450'); } bdEll(x, cx + f * 6 * s, cy, 20 * s, 9 * s, '#0a2c5a'); x.fillStyle = '#082450'; x.beginPath(); x.moveTo(cx - f * 110 * s, cy); x.lineTo(cx - f * 140 * s, cy - 16 * s); x.lineTo(cx - f * 132 * s, cy); x.lineTo(cx - f * 140 * s, cy + 14 * s); x.closePath(); x.fill(); for (let k = 0; k < 7; k++) bdDisc(x, cx - f * (10 + k * 13) * s, cy + 7 * s, 1, '#5ab0f0'); bdDisc(x, cx + f * 22 * s, cy - 3 * s, 1, '#ffd34e'); };
        bdWrap(o => { leviathan(110 + o, 60, 1.2, 1); leviathan(400 + o, 120, 0.7, -1); });
        for (let i = 0; i < 4; i++) { const cx = r() * BD_W, cy = 20 + r() * 110; bdWrap(o => { x.fillStyle = '#0a2c5a'; x.beginPath(); x.moveTo(cx + o - 14, cy); x.quadraticCurveTo(cx + o, cy - 10, cx + o + 14, cy); x.quadraticCurveTo(cx + o, cy + 4, cx + o - 14, cy); x.fill(); x.fillRect(cx + o, cy + 3, 1, 14); }); }   // manta rays
      }, 'top'),
      bdLayer(170, 0.12, 44, (x, h) => {   // steep underwater cliffs
        const ys = bdRidge(1001, 100, 18, [1, 2, 4]); bdFill(x, ys, h, '#0a2a54'); const r = mulberry32(72);
        for (let i = 0; i < 6; i++) { const cx = (i * 90 + r() * 30) | 0, w = 24 + r() * 20, hh = 40 + r() * 50; bdWrap(o => { for (let k = 0; k < hh; k++) { x.fillStyle = k % 8 < 4 ? '#0e3468' : '#0c2e5c'; x.fillRect(cx + o - w / 2 - (k < 6 ? 0 : 1), ys[cx] - hh + k, w + 2, 1); } x.fillStyle = '#1a4a84'; x.fillRect(cx + o - w / 2, ys[cx] - hh, w, 2); }); }
        bdHaze(x, h, '#02102c', 0.4, 0.2);
      }),
      bdLayer(190, 0.26, 28, (x, h) => {   // kelp forest and drifting glowing jellyfish
        const r = mulberry32(73); for (let i = 0; i < 24; i++) { const cx = (r() * BD_W) | 0, hh = 70 + r() * 100, ph = r() * 6; bdWrap(o => { for (let k = 0; k < hh; k++) { const px = cx + o + Math.round(Math.sin(k / 12 + ph) * 4); x.fillStyle = k % 8 < 4 ? '#14683e' : '#1d8450'; x.fillRect(px, h - k, 2, 1); if (k % 14 === 7) { x.fillStyle = '#34a864'; x.fillRect(px + (k % 28 ? 2 : -4), h - k, 4, 2); } } }); }
        for (let i = 0; i < 9; i++) { const cx = (r() * BD_W) | 0, cy = 20 + r() * 120, c = ['#ff8ae8', '#8affff', '#a08aff'][i % 3]; bdWrap(o => { bdGlow(x, cx + o, cy, 18, c, 0.4); bdEll(x, cx + o, cy, 6, 4, c); for (let k = -2; k <= 2; k++) { x.fillStyle = c; x.fillRect(cx + o + k * 2, cy + 3, 1, 6 + (k & 1) * 3); } }); }
        bdHaze(x, h, '#0a3a74', 0.2, 0.05);
      }),
      bdLayer(170, 0.44, 54, (x, h) => {   // near: coral ledges stepping down toward the abyss
        const ys = bdRidge(1003, 146, 4); bdFill(x, ys, h, '#b8a078', '#e0c898'); const r = mulberry32(74);
        for (let i = 0; i < 18; i++) { const cx = (r() * BD_W) | 0, col = ['#ff6a8a', '#ff9a4a', '#a06af0', '#ffd34e', '#4affe0'][i % 5]; bdWrap(o => { if (i % 3 === 0) { for (let b = -2; b <= 2; b++) { x.fillStyle = col; let px = cx + o, py = ys[cx]; for (let k = 0; k < 14; k++) { px += b * 0.4; py -= 1; x.fillRect(Math.round(px), py, 2, 1); } x.fillRect(Math.round(px) - 1, py - 1, 4, 2); } } else { bdDisc(x, cx + o, ys[cx] - 4, 6, col); bdDisc(x, cx + o - 5, ys[cx] - 8, 4, col); bdDisc(x, cx + o + 5, ys[cx] - 9, 3, col); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(cx + o - 2, ys[cx] - 8, 2, 1); } }); }
      })
    ]
  }),
  // 9. Deepdig Tunnels: an epic sinkhole. Dark rocky ceiling, distant glowing mining tunnels, giant cavern walls, ledges over a glowing pit
  tunnels: B => ({
    sky: bdSky(['#030201', '#0e0604', '#24100a', '#4a1e0e'], (x, r) => { bdGlow(x, 192, 220, 200, '#ff5a1a', 0.35); for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? '#ff9a2a' : '#6a3a28'; x.fillRect((r() * VW) | 0, (100 + r() * 116) | 0, 1, 1); } }),
    layers: [
      bdLayer(110, 0.16, 0, (x, h) => {   // the rocky ceiling with stalactites and hanging lamps
        x.fillStyle = '#100804'; x.fillRect(0, 0, BD_W, 16); const ys = bdRidge(1101, 20, 8); for (let px = 0; px < BD_W; px++) { x.fillStyle = '#100804'; x.fillRect(px, 0, 1, ys[px]); x.fillStyle = '#3a2416'; x.fillRect(px, ys[px], 1, 1); }
        const r = mulberry32(81); for (let i = 0; i < 20; i++) { const cx = (r() * BD_W) | 0, hh = 10 + r() * 40; bdWrap(o => { bdTriDown(x, cx + o, ys[cx], 6 + r() * 10, hh, '#100804'); bdTriDown(x, cx + o - 1, ys[cx], 2, hh * 0.7, '#2a1a10'); }); }
        for (let i = 0; i < 7; i++) { const cx = 30 + i * 72; bdWrap(o => { x.fillStyle = '#3a2a1a'; x.fillRect(cx + o, ys[cx], 1, 26); x.fillStyle = '#ffd34e'; x.fillRect(cx + o - 2, ys[cx] + 26, 5, 5); bdGlow(x, cx + o, ys[cx] + 28, 20, '#ffb040', 0.5); }); }
      }, 'top'),
      bdLayer(190, 0.08, 20, (x, h) => {   // distant glowing mining tunnels cut into the far wall of the pit
        x.fillStyle = '#1a0c08'; x.fillRect(0, 0, BD_W, h); const r = mulberry32(82);
        for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) { const cx = ((i * 86 + row * 31 + r() * 24) % BD_W) | 0, cy = 40 + row * 54; bdWrap(o => { bdGlow(x, cx + o, cy, 26, '#ff9a2a', 0.4); x.fillStyle = '#2a140c'; x.fillRect(cx + o - 11, cy - 12, 22, 24); x.fillStyle = '#080402'; bdEll(x, cx + o, cy - 6, 8, 8, '#080402'); x.fillRect(cx + o - 8, cy - 6, 16, 18); x.fillStyle = '#ff9a2a'; x.fillRect(cx + o - 1, cy + 2, 2, 3); x.fillStyle = '#5a3a28'; x.fillRect(cx + o - 12, cy + 12, 24, 2); }); }
        for (let i = 0; i < 4; i++) { const cx = 20 + i * 130; bdWrap(o => { x.fillStyle = '#4a2c18'; for (let k = 0; k < 150; k += 10) { x.fillRect(cx + o + (k % 20 ? 14 : 0), k, 3, 8); } x.fillRect(cx + o, 0, 2, 190); x.fillRect(cx + o + 14, 0, 2, 190); }); }   // ladders and rails climbing the wall
        bdHaze(x, h, '#4a1e0e', 0.3, 0.1);
      }),
      bdLayer(170, 0.24, 40, (x, h) => {   // giant cavern walls curving around the pit: strata, scaffolding spiralling down
        const r = mulberry32(83); const ys = bdRidge(1102, 70, 22, [1, 2, 3]); bdFill(x, ys, h, '#2a1408', '#5a2e18'); for (let k = 0; k < 14; k++) { const py = 30 + k * 11; for (let px = 0; px < BD_W; px += 2) if (ys[px] < py) { x.fillStyle = k % 2 ? '#3a1c0e' : '#2e160a'; x.fillRect(px, py, 2, 4); } }
        for (let i = 0; i < 6; i++) { const cx = (i * 86 + r() * 30) | 0; bdWrap(o => { const hh = 80 + r() * 60; x.fillStyle = '#4a2c18'; x.fillRect(cx + o, ys[cx], 4, hh); x.fillRect(cx + o + 22, ys[cx] + 14, 4, hh - 14); x.fillStyle = '#6a4424'; for (let k = 0; k < 4; k++) { x.fillRect(cx + o - 4, ys[cx] + 12 + k * 30, 34, 3); x.strokeStyle = '#3a2410'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx + o, ys[cx] + 12 + k * 30); x.lineTo(cx + o + 26, ys[cx] + 42 + k * 30); x.stroke(); } }); }
        for (let i = 0; i < 4; i++) { const cx = (r() * BD_W) | 0, cy = 90 + r() * 60; bdWrap(o => { bdGlow(x, cx + o, cy, 24, '#ff5a1a', 0.45); for (let k = 0; k < 24; k++) { x.fillStyle = k % 6 < 3 ? '#ffb040' : '#ff5a1a'; x.fillRect(cx + o - 2 + Math.round(Math.sin(k / 5) * 2), cy + k, 3, 1); } }); }   // lava seeping out of the wall
      }),
      bdLayer(170, 0.42, 56, (x, h) => {   // near: rocky ledges overlooking the glowing pit, minecart rails, crates
        const ys = bdRidge(1104, 140, 4); bdFill(x, ys, h, '#2a180c', '#5a3820'); const r = mulberry32(84);
        for (let px = 0; px < BD_W; px += 6) { x.fillStyle = '#5a3a1e'; x.fillRect(px, ys[px] - 3, 4, 2); } x.fillStyle = '#8a8a96'; for (let px = 0; px < BD_W; px++) { x.fillRect(px, ys[px] - 5, 1, 1); }
        for (let i = 0; i < 9; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { x.fillStyle = '#8a5a2a'; x.fillRect(cx + o, ys[cx] - 13, 12, 12); x.fillStyle = '#5a3a1a'; x.fillRect(cx + o, ys[cx] - 13, 12, 1); x.fillRect(cx + o, ys[cx] - 7, 12, 1); x.fillRect(cx + o + 5, ys[cx] - 13, 1, 12); }); }
        for (let i = 0; i < 12; i++) { const cx = (r() * BD_W) | 0; bdWrap(o => { bdGlow(x, cx + o, ys[cx] + 8, 14, '#ff7a1a', 0.35); }); }   // the heat of the pit below
      })
    ]
  }),
