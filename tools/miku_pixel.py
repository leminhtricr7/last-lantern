"""Draws a pixel-art chibi Miku (fan art, non-commercial) -> art/miku_pixel.png (+ x1 sprite)."""
from PIL import Image
import math

W, H, S = 48, 64, 12
T = (0, 0, 0, 0)
def c(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) + (255,)
OUT = c('#14171f'); HAIR = c('#39c5bb'); HAIR_D = c('#1d8d89'); HAIR_L = c('#8ff5ea')
SKIN = c('#ffe6d4'); SKIN_D = c('#f0b9a2'); EYE = c('#1fa8a0'); EYE_D = c('#0e5f66')
WHITE = c('#ffffff'); GREY = c('#4b5063'); GREY_D = c('#2c3040'); GREY_L = c('#6a7087')
RED = c('#ff4f6d'); BLUSH = c('#ffb3b3')

g = [[T] * W for _ in range(H)]
def px(x, y, col):
    if 0 <= x < W and 0 <= y < H: g[y][x] = col
def rect(x0, y0, x1, y1, col):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): px(x, y, col)
def ell(cx, cy, rx, ry, col):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: px(x, y, col)

# ---- twin tails (drawn first, behind everything) ----
def tail(side):
    # side -1 left, +1 right. wavy ribbon of hair from the head down to the shins
    for y in range(12, 62):
        t = (y - 12) / 50
        cx = 24 + side * (14 + 5 * math.sin(t * 5.2) * (0.4 + t) + 3 * t)
        hw = 4.2 - 2.6 * t * t if y < 54 else max(0.6, 4.2 - 2.6 * t * t)
        for x in range(int(cx - hw - 1), int(cx + hw + 2)):
            if abs(x + 0.5 - cx) <= hw:
                col = HAIR
                if side * (x + 0.5 - cx) > hw * 0.3: col = HAIR_D
                px(x, y, col)
        if t > 0.55:  # tip curls a bit lighter
            pass
tail(-1); tail(1)
# highlight streaks on tails
for side in (-1, 1):
    for y in range(18, 52, 6):
        t = (y - 12) / 50
        cx = 24 + side * (14 + 5 * math.sin(t * 5.2) * (0.4 + t) + 3 * t)
        px(int(cx - side * 1.5), y, HAIR_L); px(int(cx - side * 1.5), y + 1, HAIR_L)

# ---- legs / boots ----
for lx in (18, 26):
    rect(lx, 46, lx + 3, 53, SKIN)
    rect(lx, 46, lx, 53, SKIN_D)
    rect(lx - 1, 52, lx + 4, 61, GREY_D)      # thigh boots
    rect(lx - 1, 52, lx + 4, 53, HAIR)       # teal band
    rect(lx - 2, 60, lx + 5, 62, OUT)         # sole
    rect(lx - 1, 60, lx + 4, 61, GREY)
# ---- skirt ----
for y in range(40, 49):
    ex = 9 + (y - 40) // 2
    rect(24 - ex, y, 23 + ex, y, GREY_D if y < 47 else HAIR)
rect(16, 42, 31, 42, GREY)
# ---- torso (white blouse + tie) ----
rect(18, 31, 29, 40, WHITE); rect(18, 31, 18, 40, c('#c9e9ea')); rect(29, 31, 29, 40, c('#c9e9ea'))
rect(18, 31, 29, 32, GREY)                 # collar/shoulder band
rect(23, 32, 24, 39, HAIR); rect(23, 39, 24, 40, HAIR_D)   # tie
rect(19, 40, 28, 41, GREY_D)               # belt
# ---- arms: detached teal sleeves ----
for sx, d in ((-1, 0), (1, 0)):
    ax = 15 if sx < 0 else 30
    rect(ax, 32, ax + 2, 38, SKIN)
    rect(ax - 1, 33, ax + 3, 41, GREY_D)  # sleeve
    rect(ax - 1, 39, ax + 3, 41, HAIR)    # teal cuff
    rect(ax, 42, ax + 2, 44, SKIN)        # hand
# ---- neck ----
rect(22, 28, 25, 31, SKIN_D)
# ---- head ----
ell(24, 19, 11, 10.5, SKIN)
for y in range(22, 30):                    # chin taper
    pass
rect(14, 24, 33, 26, SKIN)
# ---- hair top + bangs ----
ell(24, 12, 13, 8, HAIR)
rect(11, 12, 36, 14, HAIR)
bang = {13: 16, 15: 18, 17: 17, 19: 19, 21: 17, 23: 20, 25: 19, 27: 17, 29: 19, 31: 17, 33: 16, 35: 14}
for x, yb in bang.items():
    for xx in (x, x + 1):
        for y in range(13, yb + 1): px(xx, y, HAIR)
# hair shading / shine
for x in range(14, 34): px(x, 8 + (1 if x % 7 == 0 else 0), HAIR_L) if 17 < x < 31 else None
for x in range(16, 32, 4): px(x, 11, HAIR_D); px(x + 1, 11, HAIR_D)
# side locks framing the face
rect(11, 14, 13, 25, HAIR); rect(34, 14, 36, 25, HAIR)
rect(11, 22, 12, 25, HAIR_D); rect(35, 22, 36, 25, HAIR_D)
# hair ties (black ribbon) where tails start
rect(10, 11, 13, 13, OUT); rect(34, 11, 37, 13, OUT)
rect(10, 12, 11, 12, RED); rect(36, 12, 37, 12, RED)
# ---- headset ----
rect(11, 18, 13, 22, GREY_D); rect(11, 18, 11, 22, OUT)
rect(34, 18, 36, 22, GREY_D); rect(36, 18, 36, 22, OUT)
rect(12, 19, 12, 21, HAIR_L); rect(35, 19, 35, 21, HAIR_L)
# ---- eyes ----
for ex in (17, 28):
    rect(ex, 19, ex + 3, 25, EYE)
    rect(ex, 19, ex + 3, 19, OUT)          # lash line
    rect(ex, 18, ex + (0 if ex < 20 else 3), 18, OUT)
    rect(ex, 24, ex + 3, 25, EYE_D)
    rect(ex + 1, 21, ex + 2, 22, c('#0b3f47'))  # pupil
    px(ex + 1, 20, WHITE); px(ex + 2, 20, WHITE); px(ex + 2, 23, c('#bff7f2'))
# ---- nose / mouth / blush ----
px(24, 25, SKIN_D)
rect(23, 27, 24, 27, c('#d96a7a'))
rect(15, 25, 17, 25, BLUSH); rect(30, 25, 32, 25, BLUSH)

# ---- outline pass ----
out = [[T] * W for _ in range(H)]
for y in range(H):
    for x in range(W):
        if g[y][x] != T: out[y][x] = g[y][x]
        else:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and g[ny][nx] != T:
                    out[y][x] = OUT; break

img = Image.new('RGBA', (W, H), T)
for y in range(H):
    for x in range(W): img.putpixel((x, y), out[y][x])
import os
os.makedirs('art', exist_ok=True)
img.save('art/miku_pixel_small.png')
big = img.resize((W * S, H * S), Image.NEAREST)
bg = Image.new('RGBA', big.size, c('#1b2236'))
bg.alpha_composite(big)
bg.save('art/miku_pixel.png')
print('ok')
