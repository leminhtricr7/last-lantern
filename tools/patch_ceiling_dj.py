# The top of the map is a ceiling for every hero (Kirby's many flutter jumps could carry him off the top of the map,
# past the arena walls), and every hero has the double jump from the very first map (it used to unlock on map 2).
import io
p = 'src/game.js'
s = io.open(p, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, 'COUNT %d: ' % s.count(a) + a[:110]
    s = s.replace(a, b)

# ---------- the ceiling ----------
rep("""    if (!P.vine) { unembed(P, P.face || 1); P.x = clamp(P.x, 0, Q.L.W * TS - P.w); }   // never inside a wall, never past the map's sides""",
    """    if (!P.vine) { unembed(P, P.face || 1); P.x = clamp(P.x, 0, Q.L.W * TS - P.w); if (P.y < 0) { P.y = 0; P.vy = Math.max(P.vy, 0); } }   // never inside a wall, never past the map's sides or its top""")
rep("""    P.riding = null;
    moveY(P, P.vy * dt);""", """    P.riding = null;
    moveY(P, P.vy * dt);
    if (P.y < 0) { P.y = 0; if (P.vy < 0) P.vy = 0; }   // the top of the map is a ceiling (no flying out over the walls)""")

# ---------- double jump for everyone, from map 1 ----------
rep("      dj: li >= 1 || save.cleared.indexOf(0) >= 0, dashAb:", "      dj: true, dashAb:")
rep("    if (li === 1) Q.msg = T('ab1'); else if (li === 3) Q.msg = T('ab3'); else if (li === 0) Q.msg = T('ctl');",
    "    if (li === 3) Q.msg = T('ab3'); else if (li === 0) Q.msg = T('ctl');")
rep("    ab1: { en: 'NEW: Double Jump — press jump in mid-air', vi: 'MỚI: Nhảy đôi — nhấn nhảy khi đang bay' },\n", "")
rep("ctl: { en: 'Move A/D  Jump Space  Attack", "ctl: { en: 'Move A/D  Jump Space (again in the air: double jump)  Attack")
rep("vi: 'Di chuyển A/D  Nhảy Space  Đánh", "vi: 'Di chuyển A/D  Nhảy Space (nhấn thêm trên không: nhảy đôi)  Đánh")
# the controls guide says so too
rep("    ['Jump', 'Nhảy', 'Space / W / ↑ / Z', 'A'],", "    ['Jump (press again in the air: double jump)', 'Nhảy (nhấn thêm trên không: nhảy đôi)', 'Space / W / ↑ / Z', 'A'],")
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
# (applied afterwards: the map-1 tip that listed every key ran far past the screen's edges; it now says how to double
# jump and where to find the controls guide)
