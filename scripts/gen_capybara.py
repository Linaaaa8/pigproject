from PIL import Image, ImageDraw

SS = 5                 # supersample
SIZE = 240             # final canvas
C = SIZE * SS
OUT = r"D:\养猪小计划-小程序开发\miniprogram\assets\capybara.png"

# warm brown palette (matches the app's cozy style)
MAIN = (176, 122, 78, 255)      # body
DARK = (138, 90, 56, 255)       # ears / shading
NOSE = (107, 69, 40, 255)       # muzzle
NOSE_DK = (74, 46, 24, 255)     # nostrils
EYE = (43, 29, 18, 255)         # eyes
BLUSH = (232, 160, 152, 255)    # cheeks
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)

img = Image.new("RGBA", (C, C), CLEAR)
d = ImageDraw.Draw(img)


def S(*v):
    return [int(round(x * SS)) for x in v]


def ellipse(cx, cy, rx, ry, fill):
    d.ellipse(S(cx - rx, cy - ry, cx + rx, cy + ry), fill=fill)


# ears (two small round ears at top)
ellipse(78, 66, 30, 30, MAIN)
ellipse(162, 66, 30, 30, MAIN)
ellipse(78, 66, 14, 14, DARK)
ellipse(162, 66, 14, 14, DARK)

# face (big round head)
ellipse(120, 132, 82, 78, MAIN)

# cheeks
ellipse(66, 150, 16, 12, BLUSH)
ellipse(174, 150, 16, 12, BLUSH)

# eyes (small, high-placed, gentle)
ellipse(90, 112, 10, 12, EYE)
ellipse(150, 112, 10, 12, EYE)
ellipse(87, 108, 3, 4, WHITE)
ellipse(147, 108, 3, 4, WHITE)

# muzzle (wide capybara nose)
d.ellipse(S(92, 138, 148, 180), fill=NOSE)
# nostrils
d.ellipse(S(105, 158, 118, 170), fill=NOSE_DK)
d.ellipse(S(122, 158, 135, 170), fill=NOSE_DK)
# mouth (little arc under nose)
d.arc(S(108, 172, 132, 190), start=20, end=160, fill=NOSE_DK, width=int(3 * SS))

img = img.resize((SIZE, SIZE), Image.LANCZOS)
img.save(OUT)
print("saved", OUT)
