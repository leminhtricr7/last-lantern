# 1) an iron cage for Princess Lyra (already applied to src/art.js)   2) teammates can talk to NPCs (Lyra...)   3) NPC rewards and Lyra's gifts reach everybody
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, 'COUNT %d: ' % s.count(old) + old[:90]
    s = s.replace(old, new)

# the cage is solid iron now, with a proper chain
rep("""        const sp = npcSpr('npc_lyra_leek'); drawSpr(g, sp, x, y - 1 + Math.round(Math.sin(Q.t * 2) * 0.6), false, false);
        g.globalAlpha = 0.5; drawSpr(g, npcSpr('cage'), x, y + 1, false); g.globalAlpha = 1;
        g.fillStyle = '#8892aa'; for (let cy = y - 54; cy > y - 130; cy -= 4) g.fillRect(x - 1 + ((cy >> 2) & 1), cy, 2, 3);
        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 48, 3, 7); g.fillRect(x - 1, y - 39, 3, 3); }""",
    """        const sp = npcSpr('npc_lyra_leek'), sway = Math.round(Math.sin(Q.t * 1.3) * 0.8), cg = npcSpr('cage');
        drawSpr(g, sp, x + sway, y - 4 + Math.round(Math.sin(Q.t * 2) * 0.6), false, false);          // Lyra sits inside, between the bars
        drawSpr(g, cg, x + sway, y + 1, false);                                                           // the iron cage in front of her
        for (let cy = y - 36; cy > y - 130; cy -= 5) { const k = ((cy / 5) | 0) & 1; g.fillStyle = '#2c2c38'; g.fillRect(x - 2 + sway * (1 - (y - cy) / 100), cy, k ? 4 : 2, k ? 2 : 4); g.fillStyle = '#8c8ca0'; g.fillRect(x - 1 + sway * (1 - (y - cy) / 100), cy, 1, k ? 2 : 4); }   // iron chain links
        if (Q.ents.some(e => !e.dead && e.grp === pz.grp)) { g.fillStyle = '#e0453a'; g.fillRect(x - 1, y - 60, 3, 7); g.fillRect(x - 1, y - 51, 3, 3); }""")

# ---- near helpers (used for any player) ----
rep("""  // a teammate near a lever, torch or cage sees "E: Use" and can use it too (not only the room's host)
  function guestInteract(P) {
    let near = null; const pc = { x: P.x + 4, y: P.y + 7 };
    for (const pz of Q.pz) {
      if (pz.type !== 'lever' && pz.type !== 'torch' && pz.type !== 'cage') continue;
      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit) || (pz.type === 'cage' && pz.open)) continue;
      if (Math.abs(pz.x - pc.x) < (pz.type === 'cage' ? 22 : 16) && Math.abs(pz.y - pc.y) < 26) near = pz;
    }
    P.nz = near ? Q.pz.indexOf(near) : -1;
    if (near && act.talkP && Q.state === 'play') usePz(near);
  }""", """  // what stands next to a player: a puzzle piece (lever, torch, cage) or a person to talk to
  function nearPzFor(P) {
    let near = null; const pc = { x: P.x + 4, y: P.y + 7 };
    for (const pz of Q.pz) {
      if (pz.type !== 'lever' && pz.type !== 'torch' && pz.type !== 'cage') continue;
      if ((pz.type === 'lever' && pz.on) || (pz.type === 'torch' && pz.lit) || (pz.type === 'cage' && pz.open)) continue;
      if (Math.abs(pz.x - pc.x) < (pz.type === 'cage' ? 22 : 16) && Math.abs(pz.y - pc.y) < 26) near = pz;
    }
    return near;
  }
  function nearNpcFor(P) { const pc = { x: P.x + 4, y: P.y + 7 }; let n = null; for (const it of Q.items) if (it.kind === 'npc' && Math.abs(it.x - pc.x) < 26 && Math.abs(it.y - pc.y) < 30) n = it; return n; }
  // teammates use levers, torches, the cage and can talk to people too (not only the room's host)
  function guestInteract(P) {
    if (!(act.talkP && Q.state === 'play')) return;
    const npc = nearNpcFor(P); if (npc) { startTalk(npc); return; }
    const pz = nearPzFor(P); if (pz) usePz(pz);
  }""")
rep("nz: p.nz, form: p.form,", "form: p.form,")
rep("""      if ((Q.nearPz === pz || (coop && Q.me && Q.me.nz >= 0 && Q.pz[Q.me.nz] === pz && !(pz.on || pz.lit || pz.open))) && Q.state === 'play') txt(""", """      if ((Q.nearPz === pz || (coop && Q.me && Q.me !== Q.P && nearPzFor(Q.me) === pz)) && Q.state === 'play') txt(""")
rep("""        if (Q.nearNpc === it && Q.state === 'play') { txt(T('talk')""", """        if ((Q.nearNpc === it || (coop && Q.me && Q.me !== Q.P && nearNpcFor(Q.me) === it)) && Q.state === 'play') { txt(T('talk')""")
rep("""        else if (Q.nearNpc !== it) { g.fillStyle = '#1b1626'; g.fillRect(x - 4, by - 5, 9, 7);""", """        else if (Q.nearNpc !== it && !(coop && Q.me && Q.me !== Q.P && nearNpcFor(Q.me) === it)) { g.fillStyle = '#1b1626'; g.fillRect(x - 4, by - 5, 9, 7);""")

# ---- the NPC's blessing and supplies reach every player ----
rep("""    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      if (Q.P.hp < maxHP()) { Q.P.hp = maxHP(); Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; emit(Q.P.x + 4, Q.P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
      if (n.gift) giveGift(n.gift);
    }""", """    Q.state = 'play';
    if (!it.blessed) {
      it.blessed = true;
      for (const pl of (coop && Q.players && Q.players.length ? Q.players : [Q.P])) asP(pl, () => {   // everybody gets the heal and the supplies, not only the host
        const P = Q.P; if (P.hp < maxHP()) { P.hp = maxHP(); if (isMe(P)) { Snd.play('heart'); Q.msg = T('healed'); Q.msgT = 3; } emit(P.x + 4, P.y + 7, 14, { col: ['#e0453a', '#ff7fb0', '#fff'], sp0: 10, sp1: 60 }); }
        if (n.gift) giveGift(n.gift, isMe(P));
      });
    }""")
rep("""  function giveGift(gf) {
    for (const k in gf) Q.P.ammo[k] += gf[k];
    Snd.play('pickup'); Q.msg = T('gift')""", """  function giveGift(gf, show) {
    for (const k in gf) Q.P.ammo[k] += gf[k];
    if (show === false) return;
    Snd.play('pickup'); Q.msg = T('gift')""")

# ---- Lyra's rewards: the host also fills every teammate's bag (own list, sword, armor, pet), and the client reports them back in full ----
rep("""grantLeek(); grantLyraGifts(); writeSave(); if (coop && coop.role === 'host') NET.send({ t: 'gift' });""", """grantLeek(); grantLyraGifts(); writeSave(); if (coop && coop.role === 'host') { for (const pl of Q.players || []) if (pl !== Q.me && pl.bag) grantToBag(pl.bag); NET.send({ t: 'gift' }); }""")
rep("""  function grantLyraGifts() {""", """  // the same gifts for a teammate's bag as seen by the host
  function grantToBag(b) {
    for (const id of ['leek', 'leekarmor', 'leekpet']) if ((b.own = b.own || []).indexOf(id) < 0) b.own.push(id);
    b.w = b.w || ['iron', null];
    if (b.w.indexOf('leek') < 0) { if (b.w[0] && ITEM[b.w[0]] && ITEM[b.w[0]].type === 'sword') b.w[0] = 'leek'; else b.w[1] = 'leek'; }
    if (!b.armor) b.armor = 'leekarmor'; if (!b.pet) b.pet = 'leekpet';
  }
  function grantLyraGifts() {""")
rep("""NET.send({ t: 'inv', inv: { w: save.inv.w.slice(), armor: save.inv.armor } });""", """NET.send({ t: 'inv', inv: { w: save.inv.w.slice(), armor: save.inv.armor, pet: save.inv.pet, own: save.inv.own.slice() } });""", 2)
rep("""p.pl.bag = { w, armor: ITEM[d.inv.armor] ? d.inv.armor : null, pet: null, own: w.filter(Boolean) }; p.pl.sw = null;""", """p.pl.bag = { w, armor: ITEM[d.inv.armor] ? d.inv.armor : null, pet: ITEM[d.inv.pet] ? d.inv.pet : null, own: (Array.isArray(d.inv.own) ? d.inv.own.filter(i => ITEM[i]) : w.filter(Boolean)) }; p.pl.sw = null;""")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
