from PIL import Image, ImageDraw

SS = 8           # supersample factor for smooth edges
SIZE = 81        # final icon size (official recommendation)
CANVAS = SIZE * SS
GRAY = (153, 153, 153, 255)
ORANGE = (238, 123, 84, 255)
CLEAR = (0, 0, 0, 0)
OUT = r"D:\养猪小计划-小程序开发\miniprogram\assets\tabbar"


def new_canvas():
    img = Image.new("RGBA", (CANVAS, CANVAS), CLEAR)
    return img, ImageDraw.Draw(img)


def flatten(x):
    if isinstance(x, (list, tuple)):
        for v in x:
            yield from flatten(v)
    else:
        yield x


def s(*vals):
    return [int(round(v * SS)) for v in flatten(vals)]


def save(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    img.save(rf"{OUT}\{name}.png")
    print("saved", name)


def draw_home(d, color):
    # roof
    d.polygon(s((40.5, 8), (7, 40), (74, 40)), fill=color)
    # body
    d.rectangle(s(17, 38, 64, 72), fill=color)
    # door (erase)
    d.rectangle(s(34, 52, 47, 72), fill=CLEAR)


def draw_calendar(d, color):
    # hanger tabs
    d.rounded_rectangle(s(22, 8, 31, 22), radius=3 * SS, fill=color)
    d.rounded_rectangle(s(50, 8, 59, 22), radius=3 * SS, fill=color)
    # body
    d.rounded_rectangle(s(10, 16, 71, 72), radius=7 * SS, fill=color)
    # hollow out below header
    d.rounded_rectangle(s(10, 27, 71, 72), radius=7 * SS, fill=CLEAR)
    # inner panel
    d.rounded_rectangle(s(16, 33, 65, 66), radius=4 * SS, fill=color)
    # grid dots (2 rows x 3 cols, erased)
    for r in range(2):
        for c in range(3):
            x = 22 + c * 14
            y = 41 + r * 13
            d.rectangle(s(x, y, x + 7, y + 7), fill=CLEAR)


def draw_chart(d, color):
    d.rounded_rectangle(s(13, 42, 27, 72), radius=4 * SS, fill=color)
    d.rounded_rectangle(s(33.5, 24, 47.5, 72), radius=4 * SS, fill=color)
    d.rounded_rectangle(s(54, 12, 68, 72), radius=4 * SS, fill=color)


for color, suffix in ((GRAY, "gray"), (ORANGE, "orange")):
    for name, drawer in (("home", draw_home), ("calendar", draw_calendar), ("chart", draw_chart)):
        img, d = new_canvas()
        drawer(d, color)
        save(img, f"{name}-{suffix}")
