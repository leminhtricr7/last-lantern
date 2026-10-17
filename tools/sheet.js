// Debug: render sprites on a zoomed sheet. Usage (with ?debug page): sheet(['hero_idle:0','npc_lila:0',...], zoom)
window.sheet = function (names, zoom, swaps) {
  zoom = zoom || 6;
  let c = document.getElementById('__sheet'); if (c) c.remove();
  c = document.createElement('canvas'); c.id = '__sheet';
  c.width = 1000; c.height = 640;
  c.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#6b7fb0;width:1000px;height:640px';
  document.body.appendChild(c);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  let px = 8, py = 8, rowH = 0;
  names.forEach(n => {
    const p = n.split(':'), sw = (swaps && swaps[n]) || {};
    const s = getSprite(p[0], sw, +p[1] || 0, sw.__out);
    const w = s.w * zoom, h = s.h * zoom;
    if (px + w > 990) { px = 8; py += rowH + 8; rowH = 0; }
    x.drawImage(s.c, px, py, w, h); px += w + 8; rowH = Math.max(rowH, h);
  });
  return 'ok';
};
