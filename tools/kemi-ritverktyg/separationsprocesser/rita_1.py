# -*- coding: utf-8 -*-
"""Bilder till milstolpe 1–4: materiens former, fasövergångar, värmekurva, blandningar, löslighet."""
import math, random
from svglib import *


def particles_solid(s, x0, y0, w, h, r=9, seed=1):
    """Regelbundet gitter med små vibrationsstreck."""
    rnd = random.Random(seed)
    cols, rows = int(w // (2 * r + 3)), int(h // (2 * r + 3))
    ox = x0 + (w - cols * (2 * r + 3) + 3) / 2 + r
    oy = y0 + (h - rows * (2 * r + 3) + 3) / 2 + r
    for i in range(cols):
        for j in range(rows):
            cx, cy = ox + i * (2 * r + 3), oy + j * (2 * r + 3)
            s.circle(cx, cy, r, fill=BLUE_L, stroke=BLUE, sw=1.5)


def particles_liquid(s, x0, y0, w, h, r=9, seed=3):
    rnd = random.Random(seed)
    # tätt men oregelbundet: förskjutna rader med lätt slump, hålls innanför rutan
    step = 2 * r + 1
    rows = int((h - 2 * r) // (2 * r - 1)) + 1
    for j in range(rows):
        off = r if j % 2 else 0
        i = 0
        while True:
            cx = x0 + r + 2 + i * step + off + rnd.uniform(-2.5, 2.5)
            cy = y0 + r + 1 + j * (2 * r - 1) + rnd.uniform(-2.5, 2.5)
            if cx > x0 + w - r - 1:
                break
            if cy <= y0 + h - r:
                s.circle(cx, cy, r, fill=BLUE_L, stroke=BLUE, sw=1.5)
            i += 1


def particles_gas(s, x0, y0, w, h, r=9, n=7, seed=5):
    pts = s.dots((x0, y0, x0 + w, y0 + h), n, r=r, fill=BLUE_L, stroke=BLUE, seed=seed, mind=r * 3.6, sw=1.5)
    for (px, py) in pts:
        ang = random.Random(int(px * 7 + py)).uniform(0, 6.28)
        ex, ey = px + 17 * math.cos(ang), py + 17 * math.sin(ang)
        s.arrow(px + 11 * math.cos(ang), py + 11 * math.sin(ang), ex + 8 * math.cos(ang), ey + 8 * math.sin(ang), stroke=LINE, sw=1.8, head=6)


def tre_former():
    s = Svg(400, 372, "Tre former: fast, flytande och gas i partikelmodellen",
            "Tre rutor. Fast form: partiklar i ett tätt, regelbundet mönster. Flytande form: tätt packade partiklar i oordning. Gasform: få partiklar långt från varandra med pilar som visar rörelse.")
    y = 6
    rows = [("Fast form", "Partiklarna sitter på bestämda platser och vibrerar."),
            ("Flytande form", "Partiklarna ligger tätt men glider förbi varandra."),
            ("Gasform", "Partiklarna far runt fritt med stora avstånd.")]
    for k, (t, d) in enumerate(rows):
        top = y + k * 122
        s.rect(6, top, 130, 112, fill="#ffffff", stroke=LINE, sw=2, rx=6)
        if k == 0:
            particles_solid(s, 10, top + 5, 122, 102, r=9)
        elif k == 1:
            particles_liquid(s, 10, top + 8, 122, 96, r=9)
        else:
            particles_gas(s, 12, top + 8, 118, 98, r=7, n=6, seed=11)
        s.text(150, top + 40, t, 18, "start", "700")
        # brytning av beskrivning i två rader
        words = d.split(" ")
        mid = len(words) // 2 + (1 if len(words) % 2 else 0)
        s.text(150, top + 66, " ".join(words[:mid]), 14, "start", "400", INK)
        s.text(150, top + 85, " ".join(words[mid:]), 14, "start", "400", INK)
    return s


def fasovergangar():
    s = Svg(760, 416, "Fasövergångar mellan fast, flytande och gas",
            "Tre rutor i rad: fast, flytande, gas. Pilar åt höger: smältning respektive avdunstning eller kokning. Pilar åt vänster: stelning respektive kondensering. En båge över toppen visar sublimering direkt från fast till gas, en under visar det omvända.")
    boxes = [(15, "FAST"), (305, "FLYTANDE"), (595, "GAS")]
    for k, (x, t) in enumerate(boxes):
        s.rect(x, 140, 150, 110, fill="#ffffff", stroke=LINE, sw=2.5, rx=8)
        if k == 0:
            particles_solid(s, x + 5, 146, 140, 98, r=8)
        elif k == 1:
            particles_liquid(s, x + 5, 150, 140, 92, r=8)
        else:
            particles_gas(s, x + 8, 150, 134, 92, r=6, n=6, seed=21)
        s.text(x + 75, 272, t, 17, "middle", "700")
    # fast <-> flytande
    s.text(235, 162, "smältning", 15, "middle", "700", ORANGE)
    s.arrow(173, 174, 297, 174, stroke=ORANGE, sw=3.5)
    s.arrow(297, 214, 173, 214, stroke=BLUE, sw=3.5)
    s.text(235, 240, "stelning", 15, "middle", "700", BLUE)
    # flytande <-> gas
    s.text(525, 142, "kokning eller", 14, "middle", "700", ORANGE)
    s.text(525, 158, "avdunstning", 14, "middle", "700", ORANGE)
    s.arrow(463, 174, 587, 174, stroke=ORANGE, sw=3.5)
    s.arrow(587, 214, 463, 214, stroke=BLUE, sw=3.5)
    s.text(525, 240, "kondensering", 15, "middle", "700", BLUE)
    # sublimering över toppen
    s.curved_arrow(90, 130, 380, 22, 670, 130, stroke=ORANGE, sw=3, dash="8 5")
    s.text(380, 32, "sublimering", 16, "middle", "700", ORANGE)
    s.text(380, 50, "(direkt från fast till gas)", 13, "middle", "400", INK)
    s.curved_arrow(670, 290, 380, 386, 90, 290, stroke=BLUE, sw=3, dash="8 5")
    s.text(380, 356, "sublimering åt andra hållet", 15, "middle", "700", BLUE)
    s.text(380, 376, "(rimfrost bildas direkt av vattenånga)", 13, "middle", "400", INK)
    s.text(380, 408, "Orange pilar: energi tillförs (värme in).  Blå pilar: energi lämnar ämnet.", 13, "middle", "600", MUTED)
    return s


def varmekurva():
    W, H = 640, 360
    s = Svg(W, H, "Värmekurva för vatten",
            "Diagram med tid på x-axeln och temperatur på y-axeln. Kurvan stiger från minus 20 grader till noll grader, planar ut vid noll grader medan isen smälter, stiger till hundra grader, planar ut vid hundra grader medan vattnet kokar och stiger sedan igen som vattenånga.")
    L, R, T, B = 80, 610, 30, 300
    # axlar
    s.line(L, B, R, B, sw=2.5)
    s.line(L, T, L, B, sw=2.5)
    s.text(R, B + 36, "tid (värmen tillförs jämnt)  →", 14, "end", "600")
    s.text(24, (T + B) / 2, "temperatur (°C)", 14, "middle", "600", extra=f'transform="rotate(-90 24 {(T + B) / 2})"')
    # temperaturskala: -20..120
    def ty(t):
        return B - (t + 30) / 160 * (B - T)
    for t in (0, 100):
        s.line(L - 6, ty(t), R, ty(t), stroke=GLASS, sw=1.2, dash="5 5")
        s.text(L - 10, ty(t) + 5, f"{t}", 14, "end", "700")
    s.text(L - 10, ty(-20) + 5, "−20", 13, "end", "400", MUTED)
    s.text(L - 10, ty(120) + 5, "120", 13, "end", "400", MUTED)
    pts = [(L, ty(-20)), (170, ty(0)), (270, ty(0)), (350, ty(100)), (500, ty(100)), (R - 5, ty(120) + 12)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    s.path(d, stroke=BLUE, sw=4)
    for (x, y) in [pts[1], pts[2], pts[3], pts[4]]:
        s.circle(x, y, 5, fill="#ffffff", stroke=BLUE, sw=3)
    # etiketter
    s.text(116, ty(-20) - 50, "Is", 16, "middle", "700")
    s.text(116, ty(-20) - 33, "värms", 13, "middle")
    s.text(220, ty(0) - 12, "Smältning", 15, "middle", "700", ORANGE)
    s.text(220, ty(0) + 26, "is + vatten", 13, "middle")
    s.text(220, ty(0) + 42, "temperaturen står still", 12, "middle", "400", MUTED)
    s.text(392, ty(50) + 20, "Vatten", 16, "middle", "700")
    s.text(392, ty(50) + 38, "värms", 13, "middle")
    s.text(425, ty(100) - 12, "Kokning", 15, "middle", "700", ORANGE)
    s.text(425, ty(100) + 26, "vatten + ånga", 13, "middle")
    s.text(425, ty(100) + 42, "temperaturen står still", 12, "middle", "400", MUTED)
    s.text(568, ty(110) + 28, "Ånga", 16, "middle", "700")
    s.text(568, ty(110) + 46, "värms", 13, "middle")
    return s


def blandningstyper():
    W, H = 760, 290
    s = Svg(W, H, "Tre sorters blandningar: slamning, emulsion och lösning",
            "Tre bägare. Slamning: fasta korn virvlar runt i vatten och en del har sjunkit. Emulsion: små droppar av en vätska svävar i en annan. Lösning: mycket små partiklar är jämnt fördelade och syns inte.")
    xs = [60, 300, 540]
    names = ["Slamning", "Emulsion", "Lösning"]
    sub = [("fasta korn som sjunker", "t.ex. lera i vatten"), ("droppar som flyter upp", "t.ex. olja i vatten"), ("jämnt fördelat, syns inte", "t.ex. socker i vatten")]
    for k, x in enumerate(xs):
        ly, bot = s.beaker(x, 50, 150, 150, liquid=0.72, color=WATER)
        if k == 0:
            s.dots((x + 8, ly + 6, x + 142, bot - 24), 16, r=4, fill=BROWN_L, stroke=BROWN, seed=4, mind=13, sw=1)
            # bottenfall
            s.dots((x + 8, bot - 20, x + 142, bot - 4), 12, r=4, fill=BROWN_L, stroke=BROWN, seed=8, mind=9, sw=1)
        elif k == 1:
            s.dots((x + 8, ly + 6, x + 142, bot - 6), 13, r=9, fill="#fde68a", stroke=ORANGE, seed=6, mind=22, sw=1.6)
        else:
            s.dots((x + 8, ly + 6, x + 142, bot - 6), 34, r=2.2, fill=VIOLET, seed=9, mind=15)
        s.text(x + 75, 234, names[k], 19, "middle", "700")
        s.text(x + 75, 254, sub[k][0], 14)
        s.text(x + 75, 272, sub[k][1], 13, "middle", "400", MUTED)
    # förstoringsindikatorer: liten text
    return s


def loslighet_tre():
    W, H = 860, 260
    s = Svg(W, H, "Utspädd, koncentrerad och mättad lösning",
            "Tre bägare med lösta partiklar. Utspädd lösning har få lösta partiklar. Koncentrerad har många. Mättad lösning har lika många som vätskan kan hålla och ett lager olöst ämne på botten.")
    xs = [50, 290, 530]
    n = [8, 28, 28]
    names = ["Utspädd", "Koncentrerad", "Mättad"]
    subs = ["lite löst ämne", "mycket löst ämne", "mer går inte att lösa"]
    for k, x in enumerate(xs):
        ly, bot = s.beaker(x, 30, 150, 150, liquid=0.72, color="#ede9fe" if k else "#f5f3ff")
        s.dots((x + 8, ly + 6, x + 142, bot - (26 if k == 2 else 6)), n[k], r=3.2, fill=VIOLET, seed=12 + k, mind=13)
        if k == 2:
            s.dots((x + 8, bot - 20, x + 142, bot - 4), 14, r=3.6, fill="#ffffff", stroke=VIOLET, seed=30, mind=9, sw=1.6)
            s.arrow(x + 200, bot - 12, x + 152, bot - 12, stroke=INK, sw=2, head=8)
            s.text(x + 206, bot - 16, "olöst ämne", 14, "start", "700")
            s.text(x + 206, bot + 2, "på botten", 14, "start", "700")
        s.text(x + 75, 214, names[k], 19, "middle", "700")
        s.text(x + 75, 236, subs[k], 14, "middle")
    return s


def loslighet_temp():
    W, H = 640, 340
    s = Svg(W, H, "Löslighet och temperatur",
            "Diagram med temperatur på x-axeln och hur mycket som går att lösa på y-axeln. En heldragen kurva för fasta ämnen stiger med temperaturen. En streckad kurva för gaser sjunker med temperaturen.")
    L, R, T, B = 80, 600, 30, 280
    s.line(L, B, R, B, sw=2.5)
    s.line(L, T, L, B, sw=2.5)
    s.text(R, B + 34, "temperatur  →", 14, "end", "600")
    s.text(28, (T + B) / 2, "hur mycket som går att lösa", 14, "middle", "600", extra=f'transform="rotate(-90 28 {(T + B) / 2})"')
    s.text(L + 4, B + 20, "kallt", 13, "start", "400", MUTED)
    s.text(R - 60, B + 20, "varmt", 13, "end", "400", MUTED)
    s.path(f"M{L + 20},{B - 40} Q{L + 220},{B - 70} {R - 20},{T + 40}", stroke=BLUE, sw=4)
    s.path(f"M{L + 20},{T + 40} Q{L + 200},{B - 100} {R - 20},{B - 40}", stroke=ORANGE, sw=4, dash="10 7")
    s.text(300, 78, "Fasta ämnen (t.ex. socker)", 14, "middle", "700", BLUE)
    s.text(300, 96, "heldragen linje: löser mer när det är varmt", 13, "middle", "400", INK)
    s.text(410, 236, "Gaser (t.ex. koldioxid)", 14, "middle", "700", ORANGE)
    s.text(410, 254, "streckad linje: löser mindre när det är varmt", 13, "middle", "400", INK)
    return s


if __name__ == "__main__":
    import os
    out = os.environ.get("OUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "images", "kemi", "separationsprocesser"))
    os.makedirs(out, exist_ok=True)
    for name, fn in [("tre-former", tre_former), ("fasovergangar", fasovergangar), ("varmekurva", varmekurva),
                     ("blandningstyper", blandningstyper), ("loslighet-tre", loslighet_tre), ("loslighet-temp", loslighet_temp)]:
        fn().save(f"{out}/{name}.svg")
        print("ok", name)
