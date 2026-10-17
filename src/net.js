// Online co-op transport: PeerJS (WebRTC data channels). The host's peer id is built from a 5-letter room code,
// so friends only need the code to join. Up to 4 guests (5 players in total).
const NET = (() => {
  const PREFIX = 'lastlantern-v1-', MAX_GUESTS = 4;
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let peer = null, conns = [], hostConn = null, role = null, code = null, ev = {};
  const on = (name, fn) => { ev[name] = fn; };
  const fire = (name, a, b) => { if (ev[name]) try { ev[name](a, b); } catch (e) { console.error(e); } };
  const makeCode = () => { let s = ''; for (let i = 0; i < 5; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; };
  function close() {
    for (const c of conns) try { c.close(); } catch (e) {}
    if (hostConn) try { hostConn.close(); } catch (e) {}
    if (peer) try { peer.destroy(); } catch (e) {}
    peer = null; conns = []; hostConn = null; role = null; code = null;
  }
  function host(tries) {
    if (typeof Peer === 'undefined') { fire('error', 'nolib'); return; }
    close(); role = 'host'; code = makeCode();
    peer = new Peer(PREFIX + code, { debug: 0 });
    peer.on('open', () => fire('ready', code));
    peer.on('error', e => { if (e && e.type === 'unavailable-id' && (tries || 0) < 4) { host((tries || 0) + 1); return; } fire('error', e && e.type || 'net'); });
    peer.on('connection', c => {
      if (conns.length >= MAX_GUESTS) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 300); }); return; }
      c.on('open', () => { conns.push(c); fire('join', c.peer); });
      c.on('data', d => fire('msg', d, c.peer));
      const gone = () => { const i = conns.indexOf(c); if (i >= 0) { conns.splice(i, 1); fire('leave', c.peer); } };
      c.on('close', gone); c.on('error', gone);
    });
  }
  function join(roomCode) {
    if (typeof Peer === 'undefined') { fire('error', 'nolib'); return; }
    close(); role = 'client'; code = roomCode.toUpperCase();
    peer = new Peer(undefined, { debug: 0 });
    peer.on('open', () => {
      const c = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
      hostConn = c;
      c.on('open', () => fire('connected', code));
      c.on('data', d => fire('msg', d, 'host'));
      c.on('close', () => fire('lost'));
      c.on('error', () => fire('lost'));
    });
    peer.on('error', e => fire('error', e && e.type || 'net'));
  }
  function send(d, to) {
    if (role === 'client') { if (hostConn && hostConn.open) hostConn.send(d); return; }
    for (const c of conns) if (c.open && (!to || c.peer === to)) c.send(d);
  }
  return { host, join, send, on, close, get role() { return role; }, get code() { return code; }, get guests() { return conns.map(c => c.peer); } };
})();
