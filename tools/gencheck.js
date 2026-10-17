// node tools/gencheck.js  -> prints spawn stats per level without a browser
const fs = require('fs'), vm = require('vm');
const ctx = { console, Math };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/art.js', 'utf8').split('const _cache')[0].replace(/const ART = \{[\s\S]*$/, '').replace(/^'use strict';/, '') , ctx);
vm.runInContext("function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};", ctx);
vm.runInContext(fs.readFileSync('src/levels.js', 'utf8') + ';this.genLevel=genLevel;this.BIOMES=BIOMES;', ctx);
for (let i = 0; i < 7; i++) {
  const L = ctx.genLevel(i), c = {};
  L.spawns.forEach(q => c[q.type] = (c[q.type] || 0) + 1);
  console.log(i, 'W', L.arena.x0, JSON.stringify(c));
}
