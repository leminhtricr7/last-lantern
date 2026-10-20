# Draws the singer hero (test build) in the same style as the team's fan-hero sheet: flat colours, dark outline, ~46 px tall.
# Usage: python tools/make_miku.py  -> assets/fanheroes/miku.png
from PIL import Image

W, H = 38, 48
px = [[None] * W for _ in range(H)]
T, t, L = (57, 197, 187), (31, 143, 147), (143, 245, 234)      # hair
S, s = (255, 230, 216), (240, 196, 176)                        # skin
G, g = (207, 210, 220), (154, 158, 174)                        # grey top
B, b = (42, 46, 64), (20, 22, 31)                              # black
P, E, Wh = (255, 143, 191), (42, 183, 176), (255, 255, 255)

def put(x, y, c):
    if 0 <= x < W and 0 <= y < H: px[y][x] = c
def rect(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): put(x, y, c)
def ell(cx, cy, rx, ry, c):
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            if ((x - cx) / (rx + 0.5)) ** 2 + ((y - cy) / (ry + 0.5)) ** 2 <= 1: put(x, y, c)

# twin tails: long, flaring out, behind everything
for side in (-1, 1):
    for y in range(8, 45):
        k = (y - 8) / 36
        cx = 19 + side * (11 + int(k * 5))
        w = 3 + int(2.5 * (1 - abs(k - 0.45) * 1.6))
        for x in range(cx - w // 2, cx + w // 2 + 1): put(x, y, T)
        put(cx + side * (w // 2), y, t)
        if y % 7 == 3: put(cx - side, y, L)
# hair (back), head and face
ell(19, 11, 10, 9, T)
ell(19, 15, 7, 6, S)
rect(13, 13, 25, 17, S)
# bangs: spikes over the forehead
for i, x in enumerate(range(11, 28)):
    depth = [3, 5, 4, 6, 3, 5, 7, 4, 6, 4, 7, 5, 3, 6, 4, 5, 3][i]
    for y in range(4, 5 + max(1, depth - 2)): put(x, y, T)
for x in (13, 17, 21, 25): put(x, 8, L)
for x in range(11, 28): put(x, 3, T)
rect(10, 6, 11, 16, T); rect(27, 6, 28, 16, T)
# hair ties and the headset
rect(7, 7, 9, 9, P); rect(29, 7, 31, 9, P)
rect(10, 13, 11, 15, g); put(10, 14, b)
# eyes, cheeks, mouth
for ex in (14, 22):
    rect(ex, 13, ex + 2, 13, b); rect(ex, 14, ex + 2, 16, E); put(ex, 14, Wh); put(ex + 2, 16, t)
put(13, 18, P); put(25, 18, P)
put(18, 19, (200, 80, 110)); put(19, 19, (200, 80, 110))
# neck, grey sleeveless top and the teal tie
rect(17, 21, 21, 22, s)
rect(13, 23, 25, 30, G); rect(13, 29, 25, 30, g); rect(13, 23, 13, 30, g)
rect(18, 23, 20, 23, T); rect(18, 24, 20, 28, T); put(19, 29, t); put(18, 28, t); put(20, 28, t)
# arms: bare shoulders, long black sleeves with a teal band, hands
for side in (-1, 1):
    ax = 19 + side * 9
    rect(ax - 1, 23, ax + 1, 24, S)
    rect(ax - 1, 25, ax + 1, 31, B); rect(ax - 1, 27, ax + 1, 27, T)
    rect(ax - 1, 32, ax + 1, 33, S)
# black skirt with a teal stripe
rect(12, 31, 26, 35, B); rect(11, 34, 27, 35, B); rect(11, 35, 27, 35, T)
# legs and thigh-high boots
for lx in (14, 21):
    rect(lx, 36, lx + 3, 38, S)
    rect(lx, 39, lx + 3, 45, B); rect(lx, 39, lx + 3, 39, T)
    rect(lx - 1, 46, lx + 3, 47, b)

# dark outline around everything, like the rest of the sheet
out = (26, 28, 44)
img = Image.new('RGBA', (W + 2, H + 2), (0, 0, 0, 0))
for y in range(H):
    for x in range(W):
        if px[y][x]: img.putpixel((x + 1, y + 1), px[y][x] + (255,))
for y in range(H + 2):
    for x in range(W + 2):
        if img.getpixel((x, y))[3]: continue
        near = any(0 <= x + dx < W + 2 and 0 <= y + dy < H + 2 and img.getpixel((x + dx, y + dy))[3] == 255 and img.getpixel((x + dx, y + dy))[:3] != out for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        if near: img.putpixel((x, y), out + (255,))
img.crop(img.getbbox()).save('assets/fanheroes/miku.png')
img.resize(((W + 2) * 8, (H + 2) * 8), Image.NEAREST).save('docs/miku_fan_preview.png')
print('ok', img.getbbox())
