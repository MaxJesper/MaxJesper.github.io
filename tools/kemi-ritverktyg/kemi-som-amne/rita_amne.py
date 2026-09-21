# -*- coding: utf-8 -*-
"""Bilder till kemi/kemi-som-amne (egenritade, återanvänder svglib): tre nivåer, metodcykel, exempeldiagram,
densitet, mätcylinder med meniskus och bunsenbrännare med två lågor.
Färg används aldrig som enda bärare av information (formen och texten säger samma sak)."""
import math, random
from svglib import *


# ---------------------------------------------------------------- tre nivåer
def _water_molecule(s, cx, cy, ang=0.0, scale=1.0):
    """H2O: stor cirkel (O) och två små (H). Skillnaden syns i storlek och bokstav, inte i färg."""
    ro, rh = 9.5 * scale, 6 * scale
    for sgn in (-1, 1):
        a = math.radians(90 + sgn * 52 + ang)
        hx, hy = cx + (ro + rh - 3) * math.cos(a), cy + (ro + rh - 3) * math.sin(a)
        s.circle(hx, hy, rh, fill="#ffffff", stroke=LINE, sw=1.4)
        s.text(hx, hy + 3.6 * scale, "H", int(8.5 * scale), "middle", "700", INK)
    s.circle(cx, cy, ro, fill=BLUE_L, stroke=BLUE, sw=1.6)
    s.text(cx, cy + 4.2 * scale, "O", int(11 * scale), "middle", "700", INK)


def tre_nivaer():
    s = Svg(400, 430, "Tre nivåer i kemin: makro, partikel och symbol",
            "Tre rutor ovanför varandra. Överst vatten i en bägare, det man ser och mäter. I mitten vattenmolekyler ritade som cirklar med bokstäverna O och H, alltså partikelnivån. Nederst symbolen H2O(l) och formeln för densitet.")
    W = 388
    rows = [("1. Makronivå", "Det du ser, känner och mäter"),
            ("2. Partikelnivå", "Så ser det ut i modellen"),
            ("3. Symbolnivå", "Så skriver vi det")]
    y0 = 6
    H = 134
    for i, (t, sub) in enumerate(rows):
        y = y0 + i * (H + 8)
        s.rect(6, y, W, H, fill="#ffffff", stroke=LINE, sw=1.6, rx=10)
        s.text(18, y + 24, t, 17, "start", "700", INK)
        s.text(18, y + 44, sub, 14, "start", "400", MUTED)
    # 1 makro: bägare med vatten och termometer-likt mätstreck
    y = y0
    s.beaker(232, y + 20, 110, 100, liquid=0.7, color=WATER, tick=True)
    s.text(140, y + 92, "Vatten", 15, "middle", "600", INK)
    s.text(140, y + 112, "20 °C, 100 g", 14, "middle", "400", MUTED)
    # 2 partikel: förstorad bild av vattenmolekyler
    y = y0 + (H + 8)
    rnd = random.Random(4)
    pts = []
    tries = 0
    while len(pts) < 5 and tries < 5000:
        tries += 1
        px, py = rnd.uniform(222, 358), rnd.uniform(y + 34, y + H - 30)
        if all((px - a) ** 2 + (py - b) ** 2 > 52 ** 2 for a, b in pts):
            pts.append((px, py))
    for (px, py) in pts:
        _water_molecule(s, px, py, rnd.uniform(-80, 80), 1.35)
    s.text(102, y + 92, "Molekylerna", 14, "middle", "600", INK)
    s.text(102, y + 111, "rör sig hela tiden", 14, "middle", "400", MUTED)
    # 3 symbol
    y = y0 + 2 * (H + 8)
    s.text(196, y + 86, "H₂O(l)", 44, "middle", "700", INK)
    s.text(196, y + 118, "ρ = m / V", 22, "middle", "400", MUTED)
    return s


# ---------------------------------------------------------------- metodcykel
def _clip_rect(cx, cy, w, h, tx, ty):
    """Punkt där en stråle från (cx,cy) mot (tx,ty) lämnar rektangeln."""
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx, cy
    sx = (w / 2) / abs(dx) if dx else 1e9
    sy = (h / 2) / abs(dy) if dy else 1e9
    t = min(sx, sy)
    return cx + dx * t, cy + dy * t


def metodcykel():
    W, H = 800, 590
    s = Svg(W, H, "Naturvetenskapligt arbetssätt som en cirkel",
            "Sju steg i en cirkel med pilar: 1 Fråga, 2 Hypotes, 3 Planera, 4 Genomför, 5 Bearbeta, 6 Slutsats, 7 Värdera. Från Värdera går en pil tillbaka till Fråga eftersom svaren ofta leder till nya frågor.")
    steps = [("1", "Fråga", "Vad vill jag veta?"), ("2", "Hypotes", "Vad tror jag – varför?"),
             ("3", "Planera", "Variabler och risker"), ("4", "Genomför", "Mät och anteckna"),
             ("5", "Bearbeta", "Tabell och diagram"), ("6", "Slutsats", "Svara på frågan"),
             ("7", "Värdera", "Felkällor, nya frågor")]
    cx, cy, rx, ry = W / 2, H / 2 + 8, 292, 216
    bw, bh = 190, 62
    pos = []
    for i in range(7):
        a = math.radians(-90 + i * 360 / 7)
        pos.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    # pilar först (hamnar bakom rutorna)
    for i in range(7):
        x1, y1 = pos[i]
        x2, y2 = pos[(i + 1) % 7]
        a = _clip_rect(x1, y1, bw + 10, bh + 10, x2, y2)
        b = _clip_rect(x2, y2, bw + 10, bh + 10, x1, y1)
        s.arrow(a[0], a[1], b[0], b[1], stroke=LINE, sw=3, head=12)
    for (n, t, sub), (x, y) in zip(steps, pos):
        s.rect(x - bw / 2, y - bh / 2, bw, bh, fill="#eef2ff", stroke=TEAL, sw=2.2, rx=12)
        s.circle(x - bw / 2 + 4, y - bh / 2 + 4, 15, fill=INK, stroke="#ffffff", sw=2)
        s.text(x - bw / 2 + 4, y - bh / 2 + 10, n, 17, "middle", "700", "#ffffff")
        s.text(x + 6, y - 4, t, 22, "middle", "700", INK)
        s.text(x + 6, y + 20, sub, 15, "middle", "400", MUTED)
    s.text(cx, cy - 12, "Naturvetenskapligt", 21, "middle", "700", INK)
    s.text(cx, cy + 14, "arbetssätt", 21, "middle", "700", INK)
    s.text(cx, cy + 44, "svaren ger nya frågor", 15, "middle", "400", MUTED)
    return s


# ---------------------------------------------------------------- exempeldiagram
def exempeldiagram():
    W, H = 420, 320
    s = Svg(W, H, "Exempeldiagram: tid för att lösa socker mot temperatur",
            "Linjediagram med temperatur i grader Celsius på x-axeln och tid i sekunder på y-axeln. Fyra mätpunkter, 20 grader 62 sekunder, 40 grader 35 sekunder, 60 grader 19 sekunder och 80 grader 11 sekunder. Kurvan sjunker: ju varmare vatten, desto kortare tid.")
    x0, y0, x1, y1 = 66, 26, 396, 246   # ritområde (y1 = x-axel)
    for t in range(0, 71, 10):
        y = y1 - (y1 - y0) * t / 70
        s.line(x0, y, x1, y, stroke="#e2e8f0", sw=1)
        s.text(x0 - 8, y + 5, str(t), 14, "end", "400", MUTED)
    for T in (20, 40, 60, 80):
        x = x0 + (x1 - x0) * (T - 10) / 80
        s.line(x, y1, x, y1 + 6, stroke=LINE, sw=1.6)
        s.text(x, y1 + 24, str(T), 14, "middle", "400", MUTED)
    s.line(x0, y0 - 6, x0, y1, stroke=LINE, sw=2.2)
    s.line(x0, y1, x1 + 6, y1, stroke=LINE, sw=2.2)
    s.text((x0 + x1) / 2, H - 20, "Temperatur (°C)  –  det jag ändrar", 15, "middle", "700", INK)
    s.add(f'<text transform="translate(18 {(y0 + y1) / 2:.0f}) rotate(-90)" font-size="15" text-anchor="middle" font-weight="700" fill="{INK}">Tid (s)  –  det jag mäter</text>')
    data = [(20, 62), (40, 35), (60, 19), (80, 11)]
    pts = [(x0 + (x1 - x0) * (T - 10) / 80, y1 - (y1 - y0) * v / 70) for T, v in data]
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f} " + " ".join(f"L{px:.1f},{py:.1f}" for px, py in pts[1:])
    s.path(d, stroke=BLUE, sw=2.2, dash="7 5")
    for (T, v), (px, py) in zip(data, pts):
        s.rect(px - 6, py - 6, 12, 12, fill=BLUE, stroke="#ffffff", sw=1.5, rx=1)   # fyrkant = mätpunkt
        s.text(px + 10, py - 9, f"{v} s", 14, "start", "600", INK)
    return s


# ---------------------------------------------------------------- densitet
def densitet():
    W, H = 400, 330
    s = Svg(W, H, "Densitet: olja flyter på vatten, aluminium sjunker",
            "En bägare med ett lager matolja ovanpå vatten. En kork flyter på oljan. En aluminiumbit ligger på botten. Siffrorna visar densiteten i gram per kubikcentimeter: kork mindre än 0,9, olja 0,91, vatten 1,00 och aluminium 2,7.")
    x, y, w, h = 70, 40, 170, 230
    liq, wat = 0.80, 0.52
    ly, bot = s.beaker(x, y, w, h, liquid=liq, color="#fde68a", tick=False, spout=False)
    yw = bot - (h - 4) * wat
    s.path(f"M{x + 1:.1f},{yw:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot - 1:.1f} {x + 10:.1f},{bot - 1:.1f} L{x + w - 10:.1f},{bot - 1:.1f} "
           f"Q{x + w - 3:.1f},{bot - 1:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w - 1:.1f},{yw:.1f} Z", fill=WATER)
    s.line(x + 1, yw, x + w - 1, yw, stroke="#64748b", sw=1.4)
    s.line(x + 1, ly, x + w - 1, ly, stroke="#64748b", sw=1.2)
    s.path(f"M{x:.1f},{y:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot:.1f} {x + 10:.1f},{bot:.1f} L{x + w - 10:.1f},{bot:.1f} "
           f"Q{x + w - 3:.1f},{bot:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w:.1f},{y:.1f}", stroke=GLASS, sw=2.5)
    # kork (flyter i ytan av oljan)
    s.rect(x + 66, ly - 16, 40, 24, fill=BROWN_L, stroke=BROWN, sw=1.8, rx=3)
    for (dx, dy) in [(10, 8), (24, 15), (31, 6), (16, 17)]:
        s.circle(x + 66 + dx, ly - 16 + dy, 1.8, fill=BROWN)
    # aluminiumbit på botten
    s.rect(x + 60, bot - 32, 46, 26, fill=GREY_L, stroke=LINE, sw=2, rx=3)
    s.line(x + 66, bot - 26, x + 100, bot - 26, stroke=GREY, sw=1.2)
    # etiketter med ledlinjer till höger
    def lab(py, txt1, txt2, tx, ty):
        s.line(tx, ty, x + w + 14, py, stroke=LINE, sw=1.4)
        s.circle(tx, ty, 3.2, fill=LINE)
        s.text(x + w + 20, py - 2, txt1, 15, "start", "700", INK)
        s.text(x + w + 20, py + 15, txt2, 13.5, "start", "400", MUTED)
    lab(ly - 24, "Kork", "0,2 – 0,9*", x + 106, ly - 6)
    lab(ly + 26, "Olja", "0,91 g/cm³", x + 130, ly + 26)
    lab(yw + 40, "Vatten", "1,00 g/cm³", x + 132, yw + 40)
    lab(bot - 38, "Aluminium", "2,7 g/cm³", x + 106, bot - 19)
    s.text(W / 2, H - 24, "Lägst densitet ligger överst.", 16, "middle", "700", INK)
    s.text(W / 2, H - 6, "*ungefär – olika korkar skiljer sig", 12.5, "middle", "400", MUTED)
    return s


# ---------------------------------------------------------------- mätcylinder
def _eye(s, x, y):
    s.path(f"M{x - 26:.1f},{y:.1f} Q{x:.1f},{y - 22:.1f} {x + 26:.1f},{y:.1f} Q{x:.1f},{y + 22:.1f} {x - 26:.1f},{y:.1f} Z", fill="#ffffff", stroke=LINE, sw=2.2)
    s.circle(x + 6, y, 9, fill=INK)
    s.circle(x + 9, y - 3, 2.6, fill="#ffffff")


def meniskus():
    W, H = 440, 330
    s = Svg(W, H, "Så avläser du volymen i en mätcylinder",
            "En mätcylinder med vätska. Ett öga står i höjd med vätskeytan och en streckad linje går till den lägsta punkten av den böjda ytan, meniskus. En förstoring visar att man läser av vid den nedersta punkten.")
    cx0, cy0, cw, chh = 170, 20, 56, 268
    # cylinder
    s.rect(cx0, cy0, cw, chh, fill="#ffffff", stroke="none")
    ly = 118
    s.rect(cx0 + 1.5, ly, cw - 3, cy0 + chh - ly - 4, fill=WATER)
    s.path(f"M{cx0 + 1.5:.1f},{ly - 5:.1f} Q{cx0 + cw / 2:.1f},{ly + 12:.1f} {cx0 + cw - 1.5:.1f},{ly - 5:.1f}", stroke="#64748b", sw=1.8)
    s.path(f"M{cx0:.1f},{cy0:.1f} L{cx0:.1f},{cy0 + chh:.1f} L{cx0 + cw:.1f},{cy0 + chh:.1f} L{cx0 + cw:.1f},{cy0:.1f}", stroke=GLASS, sw=2.6)
    s.rect(cx0 - 20, cy0 + chh, cw + 40, 10, fill=GREY_L, stroke=GLASS, sw=2, rx=3)
    for i in range(0, 11):
        yy = cy0 + chh - 12 - i * 22
        long = i % 5 == 0
        s.line(cx0 + cw - (16 if long else 9), yy, cx0 + cw - 1, yy, stroke=LINE, sw=1.6)
        if long:
            s.text(cx0 + cw + 8, yy + 5, str(i * 10), 13.5, "start", "600", INK)
    # ögat + sikt-linje
    _eye(s, 60, ly + 4)
    s.line(88, ly + 4, cx0 + cw / 2, ly + 4, stroke=BLUE, sw=2.2, dash="7 5")
    s.text(60, ly + 40, "Ögonen i", 14, "middle", "600", INK)
    s.text(60, ly + 57, "höjd med ytan", 14, "middle", "600", INK)
    s.text(cx0 + cw + 8, cy0 + 6, "ml", 13.5, "start", "400", MUTED)
    # förstoring
    zx, zy, zr = 368, 118, 50
    s.circle(zx, zy, zr, fill="#ffffff", stroke=LINE, sw=2.4)
    s.rect(zx - zr + 6, zy + 6, 2 * zr - 12, zr - 8, fill=WATER)
    s.path(f"M{zx - zr + 6:.1f},{zy - 20:.1f} Q{zx:.1f},{zy + 20:.1f} {zx + zr - 6:.1f},{zy - 20:.1f} L{zx + zr - 6:.1f},{zy + zr - 8:.1f} L{zx - zr + 6:.1f},{zy + zr - 8:.1f} Z",
           fill=WATER, stroke="none")
    s.path(f"M{zx - zr + 6:.1f},{zy - 20:.1f} Q{zx:.1f},{zy + 20:.1f} {zx + zr - 6:.1f},{zy - 20:.1f}", stroke="#64748b", sw=2.4)
    s.line(zx - zr + 2, zy, zx + zr - 2, zy, stroke=BLUE, sw=2.2, dash="7 5")
    s.circle(zx, zy, 4.2, fill=BLUE)
    s.text(zx, zy + zr + 24, "Läs av vid den", 14.5, "middle", "700", INK)
    s.text(zx, zy + zr + 43, "nedersta punkten", 14.5, "middle", "700", INK)
    s.text(zx, zy + zr + 62, "(meniskus)", 14, "middle", "400", MUTED)
    s.line(cx0 + cw + 2, ly + 4, zx - zr + 8, zy, stroke=GREY, sw=1.2, dash="3 4")
    return s


# ---------------------------------------------------------------- bunsenbrännare
def _burner(s, x, base_y, air_open, label_flame):
    """Bunsenbrännare (x = mitt). Luftringen syns som ett band med hål när den är öppen."""
    # fot
    s.path(f"M{x - 44:.1f},{base_y:.1f} L{x - 40:.1f},{base_y - 14:.1f} Q{x:.1f},{base_y - 24:.1f} {x + 40:.1f},{base_y - 14:.1f} L{x + 44:.1f},{base_y:.1f} Z", fill=GREY_L, stroke=LINE, sw=2)
    # rör
    top = base_y - 150
    s.rect(x - 11, top, 22, base_y - 150 + 150 - 34 - top + 34 - 34, fill="#ffffff", stroke="none")
    s.rect(x - 11, top, 22, 118, fill=GREY_L, stroke=LINE, sw=2)
    # luftring
    ry = base_y - 58
    s.rect(x - 15, ry, 30, 22, fill="#cbd5e1", stroke=LINE, sw=2, rx=3)
    if air_open:
        for dx in (-7, 0, 7):
            s.circle(x + dx, ry + 11, 3.4, fill=INK)
    else:
        s.line(x - 15, ry + 11, x + 15, ry + 11, stroke=LINE, sw=1.4)
    # gasintag
    s.rect(x + 44 - 6, base_y - 28, 20, 12, fill="#94a3b8", stroke=LINE, sw=1.8, rx=3)
    return top


def _flame_yellow(s, x, y):
    s.path(f"M{x:.1f},{y:.1f} C{x - 20:.1f},{y - 26:.1f} {x - 14:.1f},{y - 62:.1f} {x:.1f},{y - 92:.1f} C{x + 14:.1f},{y - 62:.1f} {x + 20:.1f},{y - 26:.1f} {x:.1f},{y:.1f} Z",
           fill="#fde68a", stroke=ORANGE, sw=2.2)
    s.path(f"M{x:.1f},{y - 2:.1f} C{x - 8:.1f},{y - 14:.1f} {x - 5:.1f},{y - 28:.1f} {x:.1f},{y - 40:.1f} C{x + 5:.1f},{y - 28:.1f} {x + 8:.1f},{y - 14:.1f} {x:.1f},{y - 2:.1f} Z",
           fill="#fdba74", stroke="none")


def _flame_blue(s, x, y):
    s.path(f"M{x:.1f},{y:.1f} C{x - 13:.1f},{y - 12:.1f} {x - 10:.1f},{y - 34:.1f} {x:.1f},{y - 52:.1f} C{x + 10:.1f},{y - 34:.1f} {x + 13:.1f},{y - 12:.1f} {x:.1f},{y:.1f} Z",
           fill="#bfdbfe", stroke=BLUE, sw=2.2)
    s.path(f"M{x:.1f},{y - 1:.1f} C{x - 5:.1f},{y - 8:.1f} {x - 4:.1f},{y - 16:.1f} {x:.1f},{y - 24:.1f} C{x + 4:.1f},{y - 16:.1f} {x + 5:.1f},{y - 8:.1f} {x:.1f},{y - 1:.1f} Z",
           fill="#1d4ed8", stroke="none")


def bunsen():
    W, H = 400, 390
    s = Svg(W, H, "Bunsenbrännare med luftringen stängd och öppen",
            "Två bunsenbrännare. Till vänster är luftringen stängd och lågan är gul, lång och sotar. Till höger är luftringen öppen och lågan är blå, kortare och hetare. Delar som är utmärkta: rör, luftring, gasslang och fot.")
    base = 300
    for (x, opened, title, sub) in [(105, False, "Luftringen stängd", "gul låga, sotar, svalare"),
                                    (300, True, "Luftringen öppen", "blå låga, hetast")]:
        top = _burner(s, x, base, opened, "")
        if opened:
            _flame_blue(s, x, top + 2)
        else:
            _flame_yellow(s, x, top + 2)
        s.text(x, 26, title, 16, "middle", "700", INK)
        s.text(x, 46, sub, 14, "middle", "400", MUTED)
    # delnamn (vänster brännare)
    xL = 105
    s.line(xL + 11, base - 110, xL + 60, base - 110, stroke=LINE, sw=1.3); s.circle(xL + 11, base - 110, 2.8, fill=LINE)
    s.text(xL + 64, base - 105, "Rör", 14.5, "start", "700", INK)
    s.line(xL + 15, base - 47, xL + 60, base - 60, stroke=LINE, sw=1.3); s.circle(xL + 15, base - 47, 2.8, fill=LINE)
    s.text(xL + 64, base - 60, "Luftring", 14.5, "start", "700", INK)
    s.line(xL + 50, base - 22, xL + 62, base - 8, stroke=LINE, sw=1.3); s.circle(xL + 50, base - 22, 2.8, fill=LINE)
    s.text(xL + 66, base + 4, "Gasintag", 14.5, "start", "700", INK)
    s.line(xL - 30, base - 8, xL - 50, base + 6, stroke=LINE, sw=1.3)
    s.text(xL - 54, base + 22, "Fot", 14.5, "end", "700", INK)
    s.text(W / 2, H - 38, "Tänd med luftringen stängd.", 15.5, "middle", "700", INK)
    s.text(W / 2, H - 16, "Öppna luften när du ska värma.", 15.5, "middle", "700", INK)
    return s


ALL = [("tre-nivaer", tre_nivaer), ("metodcykel", metodcykel), ("exempeldiagram", exempeldiagram),
       ("densitet", densitet), ("meniskus", meniskus), ("bunsen", bunsen)]
