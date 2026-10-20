"""Pixel-art fan tributes: Kayn, Tom, Jerry, Luffy, Sonic, Kirby, Jotaro, Dio.
Each character is drawn on a 48x48 canvas with hard (non anti-aliased) shapes, then a 1px dark outline is added.
Output: assets/pixel/<name>.png (48x48), <name>_x8.png (384x384), sheet.png (all in one)."""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'pixel')
os.makedirs(OUT, exist_ok=True)
N = 48
OL = (20, 18, 31, 255)


def hx(c):
    c = c.lstrip('#')
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


class C:
    def __init__(s):
        s.im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.im)

    def px(s, x, y, c): s.d.point((x, y), hx(c))
    def rect(s, x, y, w, h, c): s.d.rectangle((x, y, x + w - 1, y + h - 1), hx(c))
    def ell(s, cx, cy, rx, ry, c): s.d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), hx(c))
    def poly(s, pts, c): s.d.polygon(pts, hx(c))
    def line(s, a, b, c, w=1): s.d.line((a, b), hx(c), w)

    def outline(s, inner=False):
        src = s.im.copy(); p = src.load(); o = s.im.load()
        for y in range(N):
            for x in range(N):
                if p[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        xx, yy = x + dx, y + dy
                        if 0 <= xx < N and 0 <= yy < N and p[xx, yy][3] > 0:
                            o[x, y] = OL; break
        return s.im


# ---------------------------------------------------------------- Kayn (Shadow Assassin, Rhaast scythe)
def kayn():
    c = C()
    # scythe (Rhaast): long dark haft, huge crimson blade curving over his head
    c.line((38, 6), (38, 45), '#3a2a3a', 2)
    c.poly([(38, 2), (45, 4), (47, 12), (47, 19), (43, 11), (38, 8)], '#2a1a22')
    c.poly([(38, 3), (44, 5), (46, 11), (46, 16), (43, 10), (38, 7)], '#c0283a')
    c.line((39, 4), (44, 7), '#ff6a7a'); c.px(46, 15, '#ff6a7a')
    # cloak behind
    c.poly([(15, 19), (33, 19), (36, 44), (11, 44)], '#1c1c3a')
    c.poly([(15, 19), (20, 19), (16, 44), (11, 44)], '#12122a')
    # legs / boots
    c.rect(18, 33, 5, 9, '#26264a'); c.rect(25, 33, 5, 9, '#26264a')
    c.rect(17, 41, 7, 4, '#14121f'); c.rect(25, 41, 7, 4, '#14121f')
    c.rect(17, 41, 7, 1, '#5a4ab0'); c.rect(25, 41, 7, 1, '#5a4ab0')
    # torso (dark armour with violet trim)
    c.rect(17, 19, 14, 15, '#2c2c58')
    c.rect(17, 19, 14, 2, '#6a5ad0')
    c.rect(23, 21, 2, 12, '#6a5ad0'); c.rect(17, 31, 14, 2, '#6a5ad0')
    c.px(24, 26, '#9be0ff'); c.px(24, 27, '#9be0ff')
    # pauldrons
    c.ell(15, 20, 4, 3, '#4a3a90'); c.ell(33, 20, 4, 3, '#4a3a90')
    c.ell(15, 19, 2, 1, '#8a7af0'); c.ell(33, 19, 2, 1, '#8a7af0')
    # arms; right hand holds the haft
    c.rect(12, 21, 4, 10, '#2c2c58'); c.rect(11, 30, 5, 3, '#14121f')
    c.rect(32, 21, 4, 6, '#2c2c58'); c.rect(36, 25, 4, 3, '#e8c8b0'); c.rect(36, 28, 4, 2, '#14121f')
    # head: Kayn (LoL): spiky black-navy hair swept back, red glowing eyes, violet scarf over the lower face
    c.ell(24, 13, 5, 6, '#e0bca0')
    c.poly([(18, 13), (15, 4), (20, 7), (20, 0), (25, 5), (29, 0), (30, 6), (34, 3), (31, 13), (29, 8), (20, 8)], '#14142a')
    c.poly([(16, 9), (11, 11), (17, 14)], '#14142a'); c.poly([(17, 6), (12, 2), (19, 7)], '#14142a')
    c.px(22, 3, '#3a3a7a'); c.px(26, 2, '#3a3a7a'); c.px(19, 6, '#3a3a7a')
    c.rect(19, 11, 4, 2, '#14121f'); c.rect(26, 11, 4, 2, '#14121f')
    c.rect(20, 12, 2, 1, '#ff3a4a'); c.rect(27, 12, 2, 1, '#ff3a4a')
    c.rect(19, 16, 12, 5, '#5a3ab0'); c.rect(19, 16, 12, 1, '#8a6af0'); c.rect(21, 20, 8, 1, '#3a2a80')
    c.poly([(30, 17), (36, 22), (34, 27), (30, 21)], '#5a3ab0')
    return c.outline()


# ---------------------------------------------------------------- Tom
def tom():
    c = C()
    G, GD, W, P = '#7c93b8', '#566a92', '#f4f6ff', '#ff9fb0'
    # tail
    c.line((31, 40), (38, 36), GD, 3); c.line((38, 36), (41, 29), GD, 3); c.line((41, 29), (39, 25), '#2a2a3a', 3)
    # legs + feet
    c.rect(18, 37, 5, 6, G); c.rect(26, 37, 5, 6, G)
    c.ell(19, 44, 4, 2, W); c.ell(29, 44, 4, 2, W)
    # body
    c.ell(24, 32, 8, 9, G); c.ell(24, 34, 5, 6, W)
    c.rect(18, 37, 12, 1, GD)
    # arms (white gloves)
    c.line((17, 28), (11, 34), G, 3); c.ell(10, 35, 3, 3, W)
    c.line((31, 28), (37, 33), G, 3); c.ell(38, 34, 3, 3, W)
    # ears
    c.poly([(13, 11), (11, 1), (21, 6)], G); c.poly([(14, 10), (13, 4), (19, 7)], P)
    c.poly([(35, 11), (37, 1), (27, 6)], G); c.poly([(34, 10), (35, 4), (29, 7)], P)
    # head
    c.ell(24, 14, 11, 9, G)
    c.rect(14, 8, 3, 1, GD); c.rect(31, 8, 3, 1, GD)
    c.ell(24, 19, 8, 5, W)
    # eyes
    c.ell(20, 12, 4, 4, '#fffbe0'); c.ell(28, 12, 4, 4, '#fffbe0')
    c.ell(21, 13, 2, 2, '#14121f'); c.ell(29, 13, 2, 2, '#14121f')
    c.px(20, 12, '#ffffff'); c.px(28, 12, '#ffffff')
    c.rect(16, 7, 8, 2, '#14121f'); c.rect(24, 7, 8, 2, '#14121f')  # heavy brows
    c.px(24, 8, GD)
    # nose & mouth
    c.ell(24, 16, 3, 2, '#ff6a8a'); c.px(23, 15, '#ffffff')
    c.rect(20, 21, 9, 1, '#14121f'); c.px(19, 20, '#14121f'); c.px(29, 20, '#14121f')
    # whiskers
    c.line((13, 18), (8, 17), '#14121f'); c.line((13, 20), (8, 21), '#14121f')
    c.line((35, 18), (40, 17), '#14121f'); c.line((35, 20), (40, 21), '#14121f')
    return c.outline()


# ---------------------------------------------------------------- Jerry
def jerry():
    c = C()
    B, BD, T, P = '#b06a30', '#80481e', '#f0c890', '#ffa8b8'
    # tail
    c.line((29, 41), (36, 43), P, 2); c.line((36, 43), (41, 38), P, 2); c.px(41, 37, P)
    # feet
    c.ell(19, 44, 4, 2, T); c.ell(29, 44, 4, 2, T)
    # body
    c.ell(24, 36, 8, 8, B); c.ell(24, 38, 5, 5, T)
    # arms
    c.line((17, 33), (12, 38), B, 3); c.ell(12, 39, 2, 2, T)
    c.line((31, 33), (36, 38), B, 3); c.ell(36, 39, 2, 2, T)
    # huge round ears
    c.ell(10, 13, 8, 9, B); c.ell(10, 13, 6, 7, P)
    c.ell(38, 13, 8, 9, B); c.ell(38, 13, 6, 7, P)
    # head
    c.ell(24, 20, 11, 9, B)
    c.ell(24, 24, 8, 6, T)
    # eyes
    c.ell(20, 17, 3, 4, '#ffffff'); c.ell(28, 17, 3, 4, '#ffffff')
    c.ell(21, 18, 1, 2, '#14121f'); c.ell(29, 18, 1, 2, '#14121f')
    c.px(20, 16, '#ffffff'); c.px(28, 16, '#ffffff')
    # nose, mouth, buck teeth
    c.ell(24, 21, 2, 1, '#e0457a'); c.px(23, 20, '#ffffff')
    c.rect(19, 25, 11, 1, '#14121f')
    c.rect(23, 26, 2, 2, '#ffffff'); c.rect(24, 26, 1, 2, '#e8e8e8')
    c.line((16, 22), (13, 21), '#14121f'); c.line((32, 22), (35, 21), '#14121f')
    return c.outline()


# ---------------------------------------------------------------- Luffy (Gum-Gum Pistol)
def luffy():
    c = C()
    S = '#f2c8a0'
    # stretched right arm and fist
    c.line((29, 26), (43, 24), S, 3); c.ell(45, 24, 3, 3, S)
    c.line((44, 22), (44, 26), '#d49870')
    # legs, shorts, sandals
    c.rect(18, 34, 5, 8, S); c.rect(26, 34, 5, 8, S)
    c.rect(17, 41, 7, 3, '#8a5a2a'); c.rect(25, 41, 7, 3, '#8a5a2a'); c.rect(17, 44, 7, 1, '#5a3a1a'); c.rect(25, 44, 7, 1, '#5a3a1a')
    c.rect(17, 30, 15, 6, '#3a64d0'); c.rect(23, 33, 3, 3, '#2a4aa0')
    c.rect(17, 30, 15, 1, '#e8d890')  # sash
    # torso: red open vest over bare chest with X scar
    c.rect(18, 20, 13, 11, S)
    c.rect(16, 19, 5, 12, '#e0302a'); c.rect(28, 19, 5, 12, '#e0302a')
    c.line((22, 22), (27, 27), '#c87c58'); c.line((27, 22), (22, 27), '#c87c58')
    c.rect(18, 29, 13, 2, '#e8d890')
    # left arm on hip
    c.line((16, 22), (12, 28), S, 3); c.rect(12, 28, 5, 3, S); c.px(12, 30, S)
    # head
    c.ell(24, 13, 6, 7, S)
    c.poly([(18, 12), (18, 6), (30, 6), (30, 12), (28, 9), (20, 9)], '#14121f')
    c.px(18, 14, '#14121f'); c.px(30, 14, '#14121f')
    # eyes, scar, grin
    c.rect(21, 13, 2, 2, '#14121f'); c.rect(27, 13, 2, 2, '#14121f')
    c.px(21, 16, '#c0504a'); c.px(22, 17, '#c0504a')  # scar
    c.rect(20, 17, 10, 3, '#14121f'); c.rect(21, 17, 8, 1, '#ffffff')
    c.rect(22, 19, 6, 1, '#e0453a')
    # straw hat
    c.ell(24, 7, 15, 3, '#f5d462'); c.ell(24, 7, 14, 2, '#ffe488')
    c.ell(24, 4, 8, 5, '#f5d462'); c.rect(16, 4, 17, 3, '#d82a2a')
    c.rect(16, 3, 17, 1, '#f5d462')
    c.line((18, 9), (30, 9), '#c9a73a')
    c.ell(21, 2, 3, 1, '#ffe488')
    return c.outline()


# ---------------------------------------------------------------- Sonic
def sonic():
    c = C()
    B, BD, BL, PE = '#2a68e0', '#1a46a8', '#5a92ff', '#f6d0a0'
    # back quills
    c.poly([(16, 12), (3, 10), (14, 16)], B); c.poly([(14, 17), (1, 20), (14, 23)], B)
    c.poly([(15, 22), (3, 31), (17, 28)], B); c.poly([(16, 12), (3, 10), (9, 12)], BD)
    # legs + shoes
    c.rect(18, 35, 4, 6, B); c.rect(27, 35, 4, 6, B)
    c.ell(18, 43, 6, 3, '#e0302a'); c.ell(29, 43, 6, 3, '#e0302a')
    c.rect(16, 45, 14, 1, '#ffffff'); c.rect(12, 42, 3, 1, '#e0302a')
    c.rect(17, 40, 4, 1, '#ffffff'); c.rect(27, 40, 4, 1, '#ffffff')
    c.px(19, 41, '#ffd34e'); c.px(28, 41, '#ffd34e')
    # body, belly
    c.ell(24, 31, 8, 8, B); c.ell(26, 33, 5, 5, PE)
    # arms with white gloves
    c.line((16, 29), (13, 36), B, 3); c.ell(13, 37, 3, 3, '#ffffff'); c.rect(11, 34, 5, 1, '#e8e8f0')
    c.line((32, 29), (35, 35), B, 3); c.ell(36, 36, 3, 3, '#ffffff'); c.rect(34, 33, 5, 1, '#e8e8f0')
    # head
    c.poly([(16, 14), (12, 3), (20, 8), (22, 0), (27, 8)], B)  # top quills
    c.ell(24, 15, 10, 9, B)
    c.poly([(30, 9), (35, 1), (35, 10)], B); c.poly([(18, 8), (22, 1), (24, 8)], B)
    c.px(14, 12, BD)
    # muzzle
    c.ell(30, 20, 6, 4, PE); c.ell(29, 19, 5, 3, PE)
    # eyes: two tall ovals touching, green iris
    c.ell(24, 13, 4, 5, '#ffffff'); c.ell(31, 13, 4, 5, '#ffffff')
    c.ell(26, 14, 2, 3, '#3ea04a'); c.ell(32, 14, 2, 3, '#3ea04a')
    c.rect(26, 13, 2, 2, '#14121f'); c.rect(32, 13, 2, 2, '#14121f'); c.px(25, 11, '#ffffff'); c.px(31, 11, '#ffffff')
    c.rect(21, 8, 6, 1, '#14121f')
    # nose, smirk
    c.ell(35, 18, 2, 1, '#14121f'); c.px(34, 17, '#aaaaaa')
    c.line((27, 22), (33, 22), '#7a3a2a'); c.px(34, 21, '#7a3a2a')
    return c.outline()


# ---------------------------------------------------------------- Kirby
def kirby():
    c = C()
    K, KD, KL = '#ffa8c8', '#f070a0', '#ffd0e0'
    # feet
    c.ell(13, 41, 8, 4, '#d8283a'); c.ell(35, 41, 8, 4, '#d8283a')
    c.ell(12, 40, 4, 1, '#ff6a78'); c.ell(34, 40, 4, 1, '#ff6a78')
    # arms
    c.ell(7, 27, 4, 4, K); c.ell(41, 27, 4, 4, K)
    # body
    c.ell(24, 26, 17, 16, K)
    c.ell(24, 36, 14, 5, KD)
    c.ell(24, 25, 16, 14, K)
    c.ell(16, 15, 5, 2, KL); c.ell(14, 18, 2, 2, KL)
    # eyes: tall blue ovals with white highlight
    for ex in (19, 29):
        c.ell(ex, 22, 3, 5, '#14121f')
        c.ell(ex, 23, 2, 4, '#2a4ad8'); c.ell(ex, 25, 2, 2, '#58b8ff')
        c.rect(ex - 1, 19, 2, 3, '#ffffff')
    # cheeks and mouth
    c.ell(11, 30, 3, 2, '#ff5a8a'); c.ell(37, 30, 3, 2, '#ff5a8a')
    c.ell(24, 31, 2, 1, '#c0102a'); c.px(24, 32, '#ff6a7a')
    return c.outline()


# ---------------------------------------------------------------- Jotaro
def jotaro():
    c = C()
    CT, CTD, SK = '#232a52', '#161a38', '#f0c8a0'
    # coat tails and legs
    c.poly([(13, 22), (35, 22), (38, 44), (10, 44)], CT)
    c.poly([(13, 22), (18, 22), (15, 44), (10, 44)], CTD)
    c.rect(22, 30, 4, 14, CTD)
    c.rect(18, 40, 5, 5, '#0c0e1e'); c.rect(26, 40, 5, 5, '#0c0e1e')
    # chest: open coat, dark shirt, gold chain
    c.rect(17, 14, 15, 10, CT)
    c.rect(22, 15, 5, 9, '#101426')
    c.line((20, 16), (24, 24), '#ffd34e'); c.line((28, 16), (24, 24), '#ffd34e')
    for y in (25, 29, 33): c.px(22, y, '#ffd34e'); c.px(26, y, '#ffd34e')
    c.rect(22, 24, 5, 1, '#ffd34e')
    # shoulders & raised right arm (pointing)
    c.ell(16, 16, 4, 3, CT); c.ell(33, 16, 4, 3, CT)
    c.line((33, 18), (42, 20), CT, 5); c.rect(41, 18, 5, 4, SK); c.rect(45, 19, 2, 2, SK)
    c.line((16, 18), (13, 30), CT, 5); c.rect(11, 29, 5, 4, SK)
    # head
    c.ell(24, 8, 5, 6, SK)
    c.rect(21, 7, 3, 2, '#2a8f6a'); c.rect(26, 7, 3, 2, '#2a8f6a')
    c.rect(20, 5, 5, 1, '#14121f'); c.rect(26, 5, 4, 1, '#14121f')
    c.rect(23, 12, 4, 1, '#a06a50')
    # cap + hair
    c.poly([(18, 8), (19, 1), (31, 1), (32, 8), (29, 4), (21, 4)], CTD)
    c.rect(19, 0, 12, 4, CT)
    c.rect(18, 3, 16, 2, CTD)
    c.rect(14, 4, 6, 2, CTD)  # brim hint
    c.rect(24, 2, 3, 2, '#ffd34e')  # pin
    c.poly([(18, 8), (17, 14), (20, 11)], '#14121f')
    return c.outline()


# ---------------------------------------------------------------- Dio
def dio():
    c = C()
    Y, YD, SK, GR = '#f6d030', '#c8a018', '#f2d4b0', '#2a9a50'
    # legs: dark tights with green hearts, yellow boots
    c.rect(17, 30, 6, 12, '#1a1a2a'); c.rect(26, 30, 6, 12, '#1a1a2a')
    c.px(19, 34, GR); c.px(20, 35, GR); c.px(28, 34, GR); c.px(29, 35, GR)
    c.rect(16, 41, 8, 4, Y); c.rect(25, 41, 8, 4, Y); c.rect(16, 44, 8, 1, YD); c.rect(25, 44, 8, 1, YD)
    # torso: yellow jacket with green trim
    c.rect(16, 15, 17, 16, Y); c.rect(16, 29, 17, 2, YD)
    c.rect(22, 15, 5, 14, '#14121f'); c.rect(23, 18, 3, 1, SK)
    c.rect(21, 15, 1, 14, GR); c.rect(27, 15, 1, 14, GR)
    # green heart ornaments on shoulders
    for hx_, hy in ((13, 14), (36, 14)):
        c.ell(hx_ - 1, hy, 2, 2, GR); c.ell(hx_ + 1, hy, 2, 2, GR); c.poly([(hx_ - 3, hy + 1), (hx_ + 3, hy + 1), (hx_, hy + 5)], GR)
    # arms: right raised in a pose, left bent
    c.line((33, 17), (40, 8), Y, 5); c.rect(39, 3, 5, 5, SK); c.px(39, 3, '#14121f')
    c.px(43, 4, SK); c.px(44, 5, SK)
    c.line((16, 17), (11, 26), Y, 5); c.rect(9, 25, 5, 4, SK)
    c.rect(10, 22, 4, 1, GR)
    # head
    c.ell(24, 9, 5, 6, SK)
    c.rect(20, 8, 4, 2, '#d82a3a'); c.rect(26, 8, 4, 2, '#d82a3a')
    c.px(21, 8, '#ffffff'); c.px(27, 8, '#ffffff')
    c.rect(20, 6, 5, 1, '#9a7a18'); c.rect(26, 6, 5, 1, '#9a7a18')
    c.rect(22, 12, 6, 1, '#c0504a'); c.rect(22, 13, 5, 1, '#8a2a30')
    c.px(24, 11, '#c89878')
    # blond hair swept up, green-heart headband
    c.poly([(18, 8), (17, 2), (21, 4), (23, -1), (27, 3), (31, 0), (32, 3), (31, 8), (29, 5), (20, 5)], '#ffe85a')
    c.poly([(18, 8), (17, 14), (20, 10)], '#ffe85a'); c.poly([(31, 8), (32, 14), (29, 10)], '#ffe85a')
    c.rect(19, 4, 12, 1, GR)
    c.px(24, 4, '#ffffff')
    return c.outline()


CHARS = [('kayn', kayn), ('tom', tom), ('jerry', jerry), ('luffy', luffy), ('sonic', sonic), ('kirby', kirby), ('jotaro', jotaro), ('dio', dio)]

if __name__ == '__main__':
    S = 8
    sheet = Image.new('RGBA', (4 * N * S, 2 * N * S), (60, 70, 100, 255))
    sd = ImageDraw.Draw(sheet)
    for y in range(0, sheet.height, S * 2):
        for x in range(0, sheet.width, S * 2):
            if (x // (S * 2) + y // (S * 2)) % 2: sd.rectangle((x, y, x + S * 2 - 1, y + S * 2 - 1), (66, 77, 110, 255))
    for i, (name, fn) in enumerate(CHARS):
        im = fn()
        im.save(os.path.join(OUT, name + '.png'))
        big = im.resize((N * S, N * S), Image.NEAREST)
        big.save(os.path.join(OUT, name + '_x8.png'))
        sheet.alpha_composite(big, ((i % 4) * N * S, (i // 4) * N * S))
    sheet.save(os.path.join(OUT, 'sheet.png'))
    print('ok', len(CHARS))
