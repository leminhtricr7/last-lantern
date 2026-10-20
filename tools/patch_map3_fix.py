# map 3 film: a proper great crystal, and the memory figure fades from gold to grey with two palettes (sprite palettes need hex colours)
import io
for p in ['src/game.js', 'tools/mfilm3.js']:
    s = io.open(p, encoding='utf-8').read()
    a0 = s.index("          mfCrystal(gx, gy + 2, 96, '#6ee7f2', '#e8fbff', 0.2 + 0.8 * k, 7);")
    a1 = s.index("            if (t > 18.6) opBurst(gx - 1, gy - 22, 18.6, t, 10, 4, 18, 1.4, ['#cfd6e6', '#8a8a9a'], -12);")
    a1 = s.index("\n", a1) + 1
    a2 = s.index("          }\n", a1) + len("          }\n")
    new = """          const pts = [[gx - 26, gy + 2], [gx - 32, gy - 48], [gx - 8, gy - 98], [gx + 14, gy - 88], [gx + 32, gy - 44], [gx + 24, gy + 2]];
          const path = () => { g.beginPath(); pts.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };
          mfGlow(gx, gy - 48, 100, 0.12 + 0.3 * k, '#6ee7f2');
          g.save(); path(); g.fillStyle = '#0a1e38'; g.fill(); g.clip();
          if (k > 0) {   // the memory inside: young Quoc lighting a tower, his colour slowly fading to grey
            g.globalAlpha = k; opTower(gx + 12, gy - 6, 40, t > 15 ? Math.min(1, (t - 15) / 0.8) : 0, t, 3);
            const fade = ez(seg(t, 17.2, 20.6)), down = t > 18.6, fr = down ? 2 : 0, sp = down ? 'hero_hurt' : 'hero_idle';
            const GOLD = { a: '#ffe9b8', A: '#e0b060', q: '#8a6a30', b: '#fff6c0', r: '#ffd34e' }, GREY = { a: '#9a9aa8', A: '#6a6a78', q: '#3a3a46', b: '#b0b0bc', r: '#7a7a88' };
            g.globalAlpha = k * (1 - fade); drawSpr(g, getSprite(sp, GOLD, fr), gx - 8, gy - 4, false, false, 1.4, 1.4);
            g.globalAlpha = k * fade; drawSpr(g, getSprite(sp, GREY, fr), gx - 8, gy - 4, false, false, 1.4, 1.4); g.globalAlpha = 1;
            opLantern(gx + 2, gy - 26 + (down ? 9 : 0), 0.9, (1 - 0.8 * fade) * k, 0);
          }
          g.restore();
          g.globalCompositeOperation = 'lighter'; path(); g.fillStyle = hexA('#6ee7f2', 0.1 + 0.15 * k); g.fill();
          g.strokeStyle = hexA('#bfefff', 0.35 + 0.5 * k); g.lineWidth = 1; g.stroke();
          g.beginPath(); g.moveTo(gx - 8, gy - 98); g.lineTo(gx - 4, gy + 2); g.moveTo(gx - 32, gy - 48); g.lineTo(gx + 6, gy - 30); g.lineTo(gx + 32, gy - 44); g.moveTo(gx + 14, gy - 88); g.lineTo(gx + 6, gy - 30); g.strokeStyle = hexA('#e8fbff', 0.2 + 0.3 * k); g.stroke();
          g.fillStyle = hexA('#ffffff', 0.25 * k); g.fillRect(gx - 22, gy - 52, 2, 18); g.fillRect(gx - 18, gy - 64, 2, 8); g.globalCompositeOperation = 'source-over';
          if (t > 18.6) opBurst(gx, gy - 22, 18.6, t, 12, 4, 20, 1.4, ['#cfd6e6', '#8a8a9a'], -12);   // his warmth drifts away as grey sparks
"""
    s = s[:a0] + new + s[a2:]
    io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
