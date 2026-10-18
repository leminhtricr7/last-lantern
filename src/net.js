// Online co-op transport: PeerJS (WebRTC data channels). The host's peer id is built from a 5-letter room code,
// so friends only need the code to join. Up to 4 guests (5 players in total).
const NET = (() => {
  const PREFIX = 'lastlantern-v1-', MAX_GUESTS = 4;
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // STUN finds each player's public address; TURN relays the data when a router or browser blocks direct connections
  const ICE = { iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: ['turn:global.relay.metered.ca:80', 'turn:global.relay.metered.ca:80?transport=tcp', 'turn:global.relay.metered.ca:443', 'turns:global.relay.metered.ca:443?transport=tcp'], username: '73c4ec1fe21924e878499df6', credential: 'j70bXxPYgxJme+j+' },
    { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turn:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' }
  ] };
  const OPTS = { debug: 0, config: ICE };
  let peer = null, conns = [], hostConn = null, role = null, code = null, ev = {}, joinTimer = null, tries = 0;
  const on = (name, fn) => { ev[name] = fn; };
  const fire = (name, a, b) => { if (ev[name]) try { ev[name](a, b); } catch (e) { console.error(e); } };
  const makeCode = () => { let s = ''; for (let i = 0; i < 5; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return s; };
  function close() {
    clearTimeout(joinTimer); joinTimer = null;
    for (const c of conns) try { c.close(); } catch (e) {}
    if (hostConn) try { hostConn.close(); } catch (e) {}
    if (peer) try { peer.destroy(); } catch (e) {}
    peer = null; conns = []; hostConn = null; role = null; code = null;
  }
  function watchIce(c, who) {
    const pc = c.peerConnection; if (!pc) return;
    pc.addEventListener('iceconnectionstatechange', () => fire('status', 'ice-' + pc.iceConnectionState, who));
  }
  function host(n) {
    if (typeof Peer === 'undefined') { fire('error', 'nolib'); return; }
    close(); role = 'host'; code = makeCode();
    peer = new Peer(PREFIX + code, OPTS);
    peer.on('open', () => fire('ready', code));
    peer.on('disconnected', () => { try { peer.reconnect(); } catch (e) {} });   // keep the room findable if the signalling socket drops
    peer.on('error', e => { if (e && e.type === 'unavailable-id' && (n || 0) < 4) { host((n || 0) + 1); return; } if (e && e.type === 'peer-unavailable') return; fire('error', e && e.type || 'net'); });
    peer.on('connection', c => {
      if (conns.length >= MAX_GUESTS) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 300); }); return; }
      fire('status', 'guest-connecting', c.peer);
      c.on('open', () => { conns.push(c); fire('join', c.peer); });
      c.on('data', d => fire('msg', d, c.peer));
      setTimeout(() => watchIce(c, c.peer), 0);
      const gone = () => { const i = conns.indexOf(c); if (i >= 0) { conns.splice(i, 1); fire('leave', c.peer); } };
      c.on('close', gone); c.on('error', gone);
    });
  }
  function call() {
    if (!peer) return;
    if (hostConn) try { hostConn.close(); } catch (e) {}
    const c = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
    hostConn = c; let opened = false;
    fire('status', tries ? 'retry' : 'calling');
    c.on('open', () => { opened = true; clearTimeout(joinTimer); fire('connected', code); });
    c.on('data', d => fire('msg', d, 'host'));
    c.on('close', () => { if (opened) fire('lost'); });
    c.on('error', () => { if (opened) fire('lost'); });
    setTimeout(() => watchIce(c, 'host'), 0);
    clearTimeout(joinTimer);
    joinTimer = setTimeout(() => { if (opened || hostConn !== c) return; if (tries < 2) { tries++; call(); } else fire('error', 'timeout'); }, 12000);
  }
  function join(roomCode) {
    if (typeof Peer === 'undefined') { fire('error', 'nolib'); return; }
    close(); role = 'client'; code = roomCode.toUpperCase(); tries = 0;
    peer = new Peer(undefined, OPTS);
    fire('status', 'server');
    peer.on('open', () => call());
    peer.on('error', e => fire('error', e && e.type || 'net'));
  }
  function send(d, to) {
    if (role === 'client') { if (hostConn && hostConn.open) hostConn.send(d); return; }
    for (const c of conns) if (c.open && (!to || c.peer === to)) c.send(d);
  }
  return { host, join, send, on, close, get role() { return role; }, get code() { return code; }, get guests() { return conns.map(c => c.peer); } };
})();
