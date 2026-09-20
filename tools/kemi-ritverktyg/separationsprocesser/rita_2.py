# -*- coding: utf-8 -*-
"""Bilder till milstolpe 5–8: sedimentering, filtrering, magnet, centrifug, indunstning, destillation,
kromatografi, fällning, reningsverk, legering."""
import math, random
from svglib import *


def sedimentering():
    W, H = 960, 350
    s = Svg(W, H, "Sedimentering och dekantering",
            "Tre steg. 1: en bägare med grumligt vatten där korn virvlar runt. 2: bägaren har fått stå och kornen har sjunkit till botten så att vattnet ovanför är klart. 3: det klara vattnet hälls försiktigt över i en ny bägare medan kornen blir kvar.")
    bw, bh = 130, 140
    # steg 1
    x = 40
    ly, bot = s.beaker(x, 80, bw, bh, liquid=0.72, color=WATER)
    s.dots((x + 8, ly + 6, x + bw - 8, bot - 6), 20, r=4, fill=BROWN_L, stroke=BROWN, seed=3, mind=14)
    s.num_badge(x + 6, 58, 1)
    s.text(x + bw / 2, 260, "Omrört", 17, "middle", "700")
    s.text(x + bw / 2, 280, "grumligt, kornen virvlar", 13, "middle", "400", MUTED)
    s.arrow(x + bw + 20, 160, x + bw + 66, 160, stroke=LINE, sw=3)
    s.text(x + bw + 43, 148, "vänta", 13, "middle", "700")
    # steg 2
    x = 260
    ly, bot = s.beaker(x, 80, bw, bh, liquid=0.72, color=WATER)
    s.dots((x + 8, bot - 24, x + bw - 8, bot - 4), 18, r=4, fill=BROWN_L, stroke=BROWN, seed=8, mind=9)
    s.arrow(x + bw + 60, 190, x + bw - 14, bot - 14, stroke=INK, sw=2, head=8)
    s.text(x + bw + 64, 186, "sediment", 14, "start", "700")
    s.text(x + bw + 64, 203, "(bottensats)", 13, "start", "400", MUTED)
    s.num_badge(x + 6, 58, 2)
    s.text(x + bw / 2, 260, "Får stå stilla", 17, "middle", "700")
    s.text(x + bw / 2, 280, "kornen sjunker – sedimentering", 13, "middle", "400", MUTED)
    # steg 3: dekantering. Mottagande bägare till vänster, hällande bägare vinklas åt vänster
    s.num_badge(548, 58, 3)
    ly2, bot2 = s.beaker(548, 180, 120, 110, liquid=0.3, color=WATER, spout=False)
    px, py = 750, 150       # pip (spout) på den vinklade bägaren
    ang = -40
    s.tilted_beaker(px, py, 120, 130, ang, surface_y=py + 2, color=WATER, pivot=(px, py))
    # kornen blir kvar i botten av den vinklade bägaren
    s.add(f'<g transform="rotate({ang} {px} {py})">')
    rnd = random.Random(7)
    for i in range(14):
        cx = px + 14 + rnd.uniform(0, 92)
        cy = py + 130 - 8 - rnd.uniform(0, 12)
        s.circle(cx, cy, 4, fill=BROWN_L, stroke=BROWN, sw=1)
    s.add('</g>')
    # ström från pipen ned i mottagaren
    s.path(f"M{px - 4},{py + 4} C{px - 40},{py + 6} {px - 84},{py + 30} {px - 104},{py + 76}", stroke=WATER_D, sw=6)
    s.path(f"M{px - 4},{py + 4} C{px - 40},{py + 6} {px - 84},{py + 30} {px - 104},{py + 76}", stroke="#64748b", sw=1)
    s.text(690, 322, "Häll försiktigt – dekantering", 17, "middle", "700")
    s.text(690, 342, "det klara vattnet rinner över, kornen blir kvar", 13, "middle", "400", MUTED)
    return s


def filtrering():
    W, H = 470, 370
    s = Svg(W, H, "Filtrering med tratt och filterpapper",
            "En tratt med ett filterpapper hålls uppe av ett stativ. Blandningen hälls i. Olösta korn blir kvar på filtret som återstod, och den klara vätskan, filtratet, droppar ned i en bägare under.")
    # stativ
    s.rect(60, 348, 150, 10, fill=GREY, stroke=LINE, sw=1.5, rx=2)
    s.rect(70, 40, 9, 310, fill=GREY_L, stroke=LINE, sw=1.5)
    s.rect(70, 150, 90, 8, fill=GREY_L, stroke=LINE, sw=1.5)      # ring
    # tratt
    s.path("M115,120 L205,120 L172,205 L152,205 Z", fill="#ffffff", stroke=GLASS, sw=2.5)
    s.path("M162,205 L162,240", stroke=GLASS, sw=4)
    # filterkon (streckad) + innehåll
    s.path("M122,124 L198,124 L163,196 Z", fill="#f8fafc", stroke=LINE, sw=1.5, dash="5 3")
    # vätska i filtret
    s.path("M131,140 L189,140 L163,194 L160,194 Z", fill=WATER, stroke="none")
    s.dots((146, 156, 176, 190), 6, r=3.2, fill=BROWN_L, stroke=BROWN, seed=2, mind=8, sw=1)
    # droppar
    s.circle(162, 252, 3, fill=BLUE_L, stroke=BLUE, sw=1)
    s.circle(162, 268, 3, fill=BLUE_L, stroke=BLUE, sw=1)
    # bägare under
    ly, bot = s.beaker(105, 260, 115, 88, liquid=0.35, color=WATER)
    # etiketter
    s.arrow(275, 66, 205, 106, stroke=LINE, sw=2, head=8)
    s.text(280, 56, "Blandningen hälls i", 14, "start", "700")
    s.arrow(285, 138, 208, 150, stroke=LINE, sw=2, head=8)
    s.text(290, 134, "Filterpapper", 14, "start", "700")
    s.arrow(280, 182, 185, 176, stroke=LINE, sw=2, head=8)
    s.text(285, 186, "Återstod", 14, "start", "700")
    s.text(285, 203, "(olösta korn)", 13, "start", "400", MUTED)
    s.arrow(275, 320, 205, 320, stroke=LINE, sw=2, head=8)
    s.text(282, 316, "Filtrat", 14, "start", "700")
    s.text(282, 333, "(klar vätska)", 13, "start", "400", MUTED)
    return s


def magnet():
    W, H = 420, 280
    s = Svg(W, H, "Magnetseparation",
            "En magnet hålls över en blandning av sand och järnfilspån. Järnspånen dras upp mot magneten medan sanden ligger kvar i skålen.")
    # skål
    s.path("M60,200 L60,225 Q210,250 360,225 L360,200", fill="#f1f5f9", stroke=LINE, sw=2.5)
    s.path("M50,200 L370,200", stroke=LINE, sw=2.5)
    s.dots((70, 204, 350, 220), 40, r=3, fill=SAND, stroke="#a16207", seed=5, mind=8, sw=0.8)
    # magnet (hästsko, nedåtvänd) med N/S
    s.path("M170,60 L170,110 Q170,125 185,125 L235,125 Q250,125 250,110 L250,60", stroke=GREY, sw=1, fill="none")
    s.rect(160, 50, 30, 72, fill=GREY_L, stroke=LINE, sw=2.5, rx=3)
    s.rect(230, 50, 30, 72, fill=GREY_L, stroke=LINE, sw=2.5, rx=3)
    s.path("M160,50 L260,50 L260,72 L160,72 Z", fill="#cbd5e1", stroke=LINE, sw=2.5)
    s.text(175, 108, "N", 16, "middle", "800")
    s.text(245, 108, "S", 16, "middle", "800")
    # järnfilspån som dras upp
    rnd = random.Random(9)
    for i in range(18):
        cx = rnd.choice([175, 245]) + rnd.uniform(-14, 14)
        cy = rnd.uniform(126, 190)
        a = rnd.uniform(-20, 20)
        s.add(f'<rect x="{cx - 5:.1f}" y="{cy - 1.5:.1f}" width="10" height="3" fill="{INK}" transform="rotate({a + 90:.0f} {cx:.1f} {cy:.1f})"/>')
    for i in range(10):
        cx = rnd.uniform(90, 330)
        cy = rnd.uniform(203, 218)
        s.add(f'<rect x="{cx - 4:.1f}" y="{cy - 1.2:.1f}" width="8" height="2.4" fill="{INK}" transform="rotate({rnd.uniform(0, 180):.0f} {cx:.1f} {cy:.1f})"/>')
    s.arrow(320, 120, 262, 92, stroke=LINE, sw=2, head=8)
    s.text(324, 118, "Magnet", 14, "start", "700")
    s.arrow(320, 165, 262, 168, stroke=LINE, sw=2, head=8)
    s.text(324, 165, "Järnfilspån", 14, "start", "700")
    s.text(324, 182, "dras upp", 13, "start", "400", MUTED)
    s.text(210, 270, "Sand", 14, "middle", "700")
    s.text(210, 262, "", 1)
    return s


def centrifug():
    W, H = 880, 320
    s = Svg(W, H, "Centrifugering",
            "Tre delar. Till vänster ett rör med en grumlig blandning. I mitten en centrifug sedd uppifrån där rören snurrar runt i cirkel. Till höger samma rör efteråt, där de tunga delarna har samlats längst ned och vätskan ovanför är klar.")
    # före
    s.tube(60, 60, 44, 170, liquid=0.8, color="#f5f5f4")
    s.dots((64, 110, 100, 218), 22, r=3.2, fill=BROWN_L, stroke=BROWN, seed=5, mind=11, sw=0.8)
    s.text(82, 254, "Före", 17, "middle", "700")
    s.text(82, 272, "blandat", 13, "middle", "400", MUTED)
    s.arrow(130, 150, 205, 150, stroke=LINE, sw=3)
    # centrifug uppifrån
    cx, cy, R = 330, 150, 105
    s.circle(cx, cy, R, fill="#f1f5f9", stroke=LINE, sw=2.5)
    s.circle(cx, cy, 10, fill=GREY, stroke=LINE, sw=2)
    for ang in (0, 90, 180, 270):
        a = math.radians(ang)
        x1, y1 = cx + 14 * math.cos(a), cy + 14 * math.sin(a)
        x2, y2 = cx + 92 * math.cos(a), cy + 92 * math.sin(a)
        s.line(x1, y1, x2, y2, stroke=GREY, sw=3)
        s.circle(x2, y2, 12, fill="#ffffff", stroke=GLASS, sw=3)
    # rotationspil
    s.path("M255,90 A105,105 0 0 1 395,66", stroke=ORANGE, sw=3.5)
    s.poly([(402, 70), (388, 58), (386, 76)], fill=ORANGE, stroke=ORANGE, sw=1)
    s.text(cx, cy + 140, "Under", 17, "middle", "700")
    s.text(cx, cy + 158, "snurrar mycket snabbt", 13, "middle", "400", MUTED)
    # bort-pilar (tyngre delar åt ytterkanten)
    s.arrow(cx + 100, cy - 4, cx + 150, cy - 4, stroke=INK, sw=2, head=8)
    s.text(cx + 152, cy - 8, "tunga delar", 12, "start", "700")
    s.text(cx + 152, cy + 7, "pressas utåt", 12, "start", "400", MUTED)
    # efter
    s.tube(640, 60, 44, 170, liquid=0.8, color="#f5f5f4")
    s.dots((644, 190, 680, 224), 14, r=3.2, fill=BROWN_L, stroke=BROWN, seed=15, mind=8, sw=0.8)
    s.arrow(720, 206, 690, 206, stroke=INK, sw=2, head=8)
    s.text(724, 196, "bottensats", 13, "start", "700")
    s.arrow(720, 120, 690, 120, stroke=INK, sw=2, head=8)
    s.text(724, 116, "klar vätska", 13, "start", "700")
    s.text(662, 254, "Efter", 17, "middle", "700")
    s.text(662, 272, "delat i skikt", 13, "middle", "400", MUTED)
    return s


def indunstning():
    W, H = 780, 310
    s = Svg(W, H, "Indunstning av saltlösning",
            "Två delar. Före: en skål med saltlösning värms. Efter: vattnet har blivit vattenånga och lämnat skålen, och saltkristaller ligger kvar på botten.")
    for k, x0 in enumerate((60, 450)):
        cx = x0 + 150
        # bänk och trefot
        s.rect(x0 + 40, 262, 220, 8, fill=GREY, stroke=LINE, sw=1.5, rx=2)
        s.line(x0 + 78, 205, x0 + 70, 262, sw=3)
        s.line(x0 + 222, 205, x0 + 230, 262, sw=3)
        s.line(x0 + 70, 205, x0 + 230, 205, sw=4)
        # låga under skålen
        for dx in (-34, 0, 34):
            s.flame(cx + dx, 258, 0.85)
        # skål
        s.path(f"M{cx - 92},150 A92,52 0 0 0 {cx + 92},150 Z", fill="#ffffff", stroke=LINE, sw=3)
        s.line(cx - 100, 150, cx + 100, 150, stroke=LINE, sw=3)
        if k == 0:
            s.path(f"M{cx - 84},158 A84,44 0 0 0 {cx + 84},158 Z", fill=WATER, stroke="none")
            s.dots((cx - 64, 164, cx + 64, 184), 9, r=3, fill=VIOLET, seed=3, mind=12)
            s.text(cx, 296, "Före: saltlösning värms", 16, "middle", "700")
        else:
            rnd = random.Random(3)
            for i in range(14):
                px = cx + rnd.uniform(-66, 66)
                py = 188 - rnd.uniform(0, 6) - abs(px - cx) * 0.03
                s.rect(px - 4, py - 4, 8, 8, fill="#ffffff", stroke=VIOLET, sw=1.6)
            s.text(cx, 296, "Efter: vattnet borta, saltet kvar", 16, "middle", "700")
        for dx in (-45, 0, 45):
            s.path(f"M{cx + dx},136 C{cx + dx - 12},116 {cx + dx + 12},98 {cx + dx},78 C{cx + dx - 10},60 {cx + dx + 10},44 {cx + dx},26",
                   stroke=GLASS if k == 0 else "#cbd5e1", sw=3, dash="" if k == 0 else "3 7")
        if k == 0:
            s.text(cx + 62, 56, "vattenånga", 13, "start", "700")
    s.arrow(372, 140, 440, 140, stroke=LINE, sw=3)
    s.text(406, 128, "tid", 13, "middle", "700")
    return s


def destillation():
    W, H = 840, 440
    s = Svg(W, H, "Destillation",
            "En kolv med vätska värms över en låga. Ångan går genom ett rör till en kylare där den kyls och blir flytande. Den kondenserade vätskan, destillatet, droppar ned i en bägare. Kylvatten går in nedtill och ut upptill i kylaren.")
    # stativ
    s.rect(28, 418, 200, 10, fill=GREY, stroke=LINE, sw=1.5, rx=2)
    s.rect(46, 100, 9, 320, fill=GREY_L, stroke=LINE, sw=1.5)
    s.rect(46, 196, 90, 7, fill=GREY_L, stroke=LINE, sw=1.5)
    s.burner(150, 418)
    # rundkolv
    fx, fy, fr = 150, 330, 58
    s.circle(fx, fy, fr, fill="#ffffff", stroke=GLASS, sw=3)
    s.path(f"M{fx - 49},{fy + 6} A{fr - 3},{fr - 3} 0 0 0 {fx + 49},{fy + 6} Z", fill="#ede9fe", stroke="none")
    s.line(fx - 49, fy + 6, fx + 49, fy + 6, stroke="#64748b", sw=1.2)
    s.dots((fx - 40, fy + 12, fx + 40, fy + 48), 6, r=3.5, fill=VIOLET, seed=1, mind=14)
    # hals, propp, termometer
    s.rect(fx - 14, 220, 28, 60, fill="#ffffff", stroke=GLASS, sw=3)
    s.rect(fx - 20, 214, 40, 10, fill="#cbd5e1", stroke=LINE, sw=1.5, rx=2)
    s.rect(fx - 4, 130, 8, 130, fill="#ffffff", stroke=LINE, sw=1.8, rx=3)
    s.rect(fx - 1.5, 190, 3, 68, fill=ORANGE, stroke="none")
    s.circle(fx, 262, 6, fill=ORANGE, stroke=LINE, sw=1.5)
    # sidoarm + kylare (roterad grupp)
    ang = 13
    x0, y0 = 172, 222
    L = 400
    s.add(f'<g transform="rotate({ang} {x0} {y0})">')
    s.rect(x0, y0 - 6, 90, 12, fill="#ffffff", stroke=GLASS, sw=2.5)
    s.rect(x0 + 80, y0 - 22, L - 80, 44, fill="#e0f2fe", stroke=GLASS, sw=3, rx=4)
    s.rect(x0 + 80, y0 - 7, L + 20, 14, fill="#ffffff", stroke=LINE, sw=2.5)
    for i in range(4):
        px = x0 + 340 - i * 70          # vattnet strömmar mot vänster (in nedtill, ut upptill)
        s.path(f"M{px},{y0 + 14} l-16,0 m6,-4 l-6,4 l6,4", stroke=TEAL, sw=2)
    s.add("</g>")

    def rot(px, py):
        a = math.radians(ang)
        return (x0 + (px - x0) * math.cos(a) - (py - y0) * math.sin(a), y0 + (px - x0) * math.sin(a) + (py - y0) * math.cos(a))
    # kylvatten IN vid det låga (högra) änden, UT vid det höga (vänstra) änden
    inx, iny = rot(x0 + 300, y0 + 22)
    s.path(f"M{inx:.1f},{iny:.1f} L{inx + 4:.1f},{iny + 44:.1f}", stroke=TEAL, sw=6)
    s.arrow(inx + 4, iny + 78, inx + 4, iny + 50, stroke=TEAL, sw=2.2, head=9)
    s.text(inx - 8, iny + 74, "kylvatten in", 14, "end", "700", TEAL)
    outx, outy = rot(x0 + 130, y0 - 22)
    s.path(f"M{outx:.1f},{outy:.1f} L{outx - 4:.1f},{outy - 40:.1f}", stroke=TEAL, sw=6)
    s.arrow(outx - 4, outy - 34, outx - 4, outy - 66, stroke=TEAL, sw=2.2, head=9)
    s.text(outx + 8, outy - 62, "kylvatten ut", 14, "start", "700", TEAL)
    # mottagarbägare under rörets slut
    ex, ey = rot(x0 + L + 20, y0)
    s.beaker(ex - 62, ey + 26, 100, 88, liquid=0.3, color=WATER)
    s.circle(ex - 2, ey + 16, 3, fill=BLUE_L, stroke=BLUE, sw=1)
    # stegbrickor
    s.num_badge(fx - 46, fy + 44, 1)
    s.num_badge(fx + 40, 186, 2)
    kx, ky = rot(x0 + 250, y0 - 22)
    s.num_badge(kx, ky - 20, 3)
    s.num_badge(ex + 44, ey + 44, 4)
    # förklaringar uppe till höger (fri yta)
    lx = 380
    s.text(lx, 40, "1  Vätskan värms tills den kokar.", 15, "start", "700")
    s.text(lx, 64, "2  Ångan stiger och leds in i röret.", 15, "start", "700")
    s.text(lx, 88, "3  I kylaren kyls ångan och blir flytande igen.", 15, "start", "700")
    s.text(lx, 112, "4  Destillatet droppar ned i bägaren.", 15, "start", "700")
    s.text(20, 62, "Termometern visar ångans", 13, "start", "600", MUTED)
    s.text(20, 78, "temperatur (= kokpunkten)", 13, "start", "600", MUTED)
    return s


def kromatografi():
    W, H = 900, 340
    s = Svg(W, H, "Papperskromatografi",
            "Tre steg. 1: en penna sätter en färgpunkt på ett filterpapper. 2: pappret hängs så att nederkanten står i lite vatten men färgpunkten är ovanför vattnet. 3: efteråt har vattnet vandrat uppåt och färgen delats i band på olika höjd.")
    # steg 1: papper med punkt + penna
    s.rect(90, 60, 60, 190, fill="#ffffff", stroke=LINE, sw=2.5)
    s.line(90, 200, 150, 200, stroke=GLASS, sw=1.5, dash="4 4")
    s.circle(120, 200, 6, fill="#1e293b", stroke="none")
    s.text(160, 204, "startlinje", 13, "start", "600", MUTED)
    s.path("M168,180 L194,144", stroke=LINE, sw=8)
    s.path("M168,180 L163,188", stroke="#1e293b", sw=3)
    s.num_badge(70, 50, 1)
    s.text(120, 282, "Färgpunkt på papperet", 15, "middle", "700")
    s.arrow(240, 150, 280, 150, stroke=LINE, sw=3)
    # steg 2: glas med papper
    gx = 320
    s.beaker(gx, 70, 120, 170, liquid=0.2, color=WATER, tick=False, spout=False)
    s.line(gx - 14, 66, gx + 134, 66, stroke=LINE, sw=6)   # pinne
    s.rect(gx + 40, 68, 40, 148, fill="#ffffff", stroke=LINE, sw=2)
    s.circle(gx + 60, 190, 5, fill="#1e293b", stroke="none")
    s.arrow(gx + 150, 214, gx + 128, 214, stroke=INK, sw=2, head=8)
    s.text(gx + 156, 210, "vattennivå", 13, "start", "700")
    s.text(gx + 156, 226, "under punkten", 13, "start", "400", MUTED)
    s.num_badge(gx - 6, 50, 2)
    s.text(gx + 60, 282, "Papperet hängs i vatten", 15, "middle", "700")
    s.arrow(gx + 262, 150, gx + 308, 150, stroke=LINE, sw=3)
    # steg 3: efter
    px = 690
    s.rect(px, 60, 60, 190, fill="#ffffff", stroke=LINE, sw=2.5)
    s.line(px, 200, px + 60, 200, stroke=GLASS, sw=1.5, dash="4 4")
    s.line(px, 84, px + 60, 84, stroke=GLASS, sw=1.5, dash="4 4")
    s.add(f'<ellipse cx="{px + 30}" cy="198" rx="13" ry="7" fill="#1e293b"/>')
    s.add(f'<ellipse cx="{px + 30}" cy="164" rx="15" ry="8" fill="{VIOLET}"/>')
    s.add(f'<ellipse cx="{px + 30}" cy="128" rx="15" ry="8" fill="#0e7490"/>')
    s.add(f'<ellipse cx="{px + 30}" cy="98" rx="15" ry="7" fill="#f59e0b"/>')
    s.text(px + 76, 202, "startlinje", 13, "start", "600", MUTED)
    s.text(px + 76, 88, "vattnets front", 13, "start", "600", MUTED)
    for yy, t in ((164, "A"), (128, "B"), (98, "C")):
        s.text(px - 12, yy + 5, t, 15, "end", "800")
    s.num_badge(px - 20, 50, 3)
    s.text(px + 30, 282, "Färgen delas i band", 15, "middle", "700")
    s.text(px + 30, 300, "A–C är olika färgämnen", 13, "middle", "400", MUTED)
    return s


def fallning():
    W, H = 800, 320
    s = Svg(W, H, "Fällning",
            "Två klara lösningar hälls ihop. Då bildas ett fast ämne som inte löser sig i vatten, en fällning. Blandningen blir grumlig och fällningen sjunker sedan till botten.")
    ly, bot = s.beaker(40, 70, 110, 130, liquid=0.7, color=WATER)
    s.dots((46, ly + 6, 144, bot - 6), 14, r=3.2, fill=BLUE, seed=1, mind=12)
    s.text(95, 226, "Lösning A", 16, "middle", "700")
    s.text(95, 244, "klar", 13, "middle", "400", MUTED)
    s.text(185, 140, "+", 34, "middle", "700")
    ly, bot = s.beaker(215, 70, 110, 130, liquid=0.7, color=WATER)
    s.dots((221, ly + 6, 319, bot - 6), 14, r=3.2, fill=ORANGE, seed=2, mind=12)
    s.text(270, 226, "Lösning B", 16, "middle", "700")
    s.text(270, 244, "klar", 13, "middle", "400", MUTED)
    s.arrow(350, 140, 415, 140, stroke=LINE, sw=3)
    ly, bot = s.beaker(440, 70, 130, 130, liquid=0.7, color="#f1f5f9")
    s.dots((446, ly + 6, 564, bot - 22), 16, r=3.6, fill="#ffffff", stroke=LINE, seed=4, mind=13, sw=1.4)
    s.dots((446, bot - 20, 564, bot - 4), 16, r=3.6, fill="#ffffff", stroke=LINE, seed=6, mind=8, sw=1.4)
    s.text(505, 226, "Grumligt, sedan sjunker", 16, "middle", "700")
    s.text(505, 244, "fällningen till botten", 16, "middle", "700")
    s.arrow(650, 190, 578, 190, stroke=INK, sw=2, head=8)
    s.text(660, 186, "fällning", 15, "start", "700")
    s.text(660, 204, "(fast ämne som", 13, "start", "400", MUTED)
    s.text(660, 220, "inte är lösligt)", 13, "start", "400", MUTED)
    s.text(400, 296, "Fällningen kan sedan skiljas från vätskan med filtrering.", 14, "middle", "600", MUTED)
    return s


def reningsverk():
    W, H = 900, 400
    s = Svg(W, H, "Avloppsvatten renas i flera steg",
            "Ett flödesschema med sex steg: rensgaller, sandfång, försedimentering, biologisk rening, kemisk fällning och slutligen sedimentering med filter. Varje steg tar bort något som skiljer sig i storlek, densitet eller löslighet, och renat vatten lämnar verket.")
    steps = [
        ("1", "Rensgaller", ["stora föremål fastnar", "i gallret"], "storlek"),
        ("2", "Sandfång", ["sand och grus sjunker", "till botten"], "densitet"),
        ("3", "Försedimentering", ["slam sjunker till", "bassängens botten"], "densitet"),
        ("4", "Biologisk rening", ["bakterier bryter ned", "lösta ämnen"], "omvandling"),
        ("5", "Kemisk fällning", ["fosfor fälls ut som", "fast ämne (flingor)"], "löslighet"),
        ("6", "Sedimentering, filter", ["flingorna sjunker", "eller silas bort"], "densitet, storlek"),
    ]
    bw, bh = 260, 120
    pos = [(30, 60), (320, 60), (610, 60), (610, 230), (320, 230), (30, 230)]
    for (n, t, d, m), (x, y) in zip(steps, pos):
        s.rect(x, y, bw, bh, fill="#f8fafc", stroke=LINE, sw=2.5, rx=10)
        s.num_badge(x + 22, y + 26, n)
        s.text(x + 42, y + 32, t, 17, "start", "700")
        s.text(x + 16, y + 62, d[0], 14, "start", "400", INK)
        s.text(x + 16, y + 80, d[1], 14, "start", "400", INK)
        s.text(x + 16, y + 106, "skiljer på: " + m, 13.5, "start", "700", TEAL)
    s.arrow(294, 120, 314, 120, stroke=LINE, sw=3)
    s.arrow(584, 120, 604, 120, stroke=LINE, sw=3)
    s.arrow(740, 186, 740, 224, stroke=LINE, sw=3)
    s.arrow(604, 290, 584, 290, stroke=LINE, sw=3)
    s.arrow(314, 290, 294, 290, stroke=LINE, sw=3)
    s.text(30, 36, "Avloppsvatten in  →", 15, "start", "700", MUTED)
    s.arrow(160, 356, 160, 382, stroke=LINE, sw=3)
    s.text(176, 376, "Renat vatten ut", 15, "start", "700", MUTED)
    return s


def legering():
    W, H = 640, 260
    s = Svg(W, H, "Ren metall och legering",
            "Till vänster ett rent metallgitter där alla atomer är lika stora. Till höger en legering där två sorters atomer i olika storlek är blandade i samma gitter.")
    s.rect(30, 30, 270, 170, fill="#ffffff", stroke=LINE, sw=2, rx=6)
    s.rect(340, 30, 270, 170, fill="#ffffff", stroke=LINE, sw=2, rx=6)
    r = 15
    for i in range(7):
        for j in range(4):
            s.circle(56 + i * 34, 62 + j * 38, r, fill=ORANGE_L, stroke=ORANGE, sw=2)
    rnd = random.Random(4)
    for i in range(7):
        for j in range(4):
            if rnd.random() < 0.35:
                s.circle(366 + i * 34, 62 + j * 38, 10, fill=GREY_L, stroke=LINE, sw=2)
            else:
                s.circle(366 + i * 34, 62 + j * 38, r, fill=ORANGE_L, stroke=ORANGE, sw=2)
    s.text(165, 226, "Rent metall (t.ex. koppar)", 16, "middle", "700")
    s.text(165, 246, "alla atomer lika", 13, "middle", "400", MUTED)
    s.text(475, 226, "Legering (t.ex. brons)", 16, "middle", "700")
    s.text(475, 246, "två sorters atomer i samma gitter", 13, "middle", "400", MUTED)
    return s


# ---- små ikoner (150 x 90) till översikten på områdets startsida ----
def icon_filtrering():
    s = Svg(150, 90, "Ikon: filtrering", "Tratt med filterpapper över en bägare.")
    s.path("M45,8 L105,8 L84,50 L66,50 Z", fill="#ffffff", stroke=GLASS, sw=3)
    s.path("M52,12 L98,12 L76,44 Z", fill="#f8fafc", stroke=LINE, sw=1.5, dash="4 3")
    s.path("M75,50 L75,60", stroke=GLASS, sw=4)
    s.beaker(52, 58, 46, 28, liquid=0.35, color=WATER, tick=False, spout=False, sw=2.2)
    s.circle(75, 66, 2.2, fill=BLUE_L, stroke=BLUE, sw=1)
    return s


def icon_destillation():
    s = Svg(150, 90, "Ikon: destillation", "Kolv över en låga med ett kylarrör till en bägare.")
    s.circle(34, 58, 20, fill="#ffffff", stroke=GLASS, sw=3)
    s.path("M34,42 L34,26 L40,26", stroke=GLASS, sw=4)
    s.add('<g transform="rotate(16 44 26)">')
    s.rect(44, 18, 62, 16, fill="#e0f2fe", stroke=GLASS, sw=2.5, rx=3)
    s.add("</g>")
    s.beaker(108, 54, 34, 32, liquid=0.3, color=WATER, tick=False, spout=False, sw=2.2)
    s.flame(34, 86, 0.6)
    return s


def icon_kromatografi():
    s = Svg(150, 90, "Ikon: kromatografi", "Filterpapper med färgband på olika höjd.")
    s.rect(58, 6, 34, 78, fill="#ffffff", stroke=LINE, sw=2.5)
    s.add('<ellipse cx="75" cy="74" rx="8" ry="4.5" fill="#1e293b"/>')
    s.add(f'<ellipse cx="75" cy="56" rx="9" ry="5" fill="{VIOLET}"/>')
    s.add('<ellipse cx="75" cy="38" rx="9" ry="5" fill="#0e7490"/>')
    s.add('<ellipse cx="75" cy="20" rx="9" ry="4.5" fill="#f59e0b"/>')
    return s


def icon_magnet():
    s = Svg(150, 90, "Ikon: magnetseparation", "En magnet drar upp järnspån ur sand.")
    s.rect(52, 6, 18, 36, fill=GREY_L, stroke=LINE, sw=2.5, rx=2)
    s.rect(80, 6, 18, 36, fill=GREY_L, stroke=LINE, sw=2.5, rx=2)
    s.rect(52, 6, 46, 14, fill="#cbd5e1", stroke=LINE, sw=2.5)
    s.path("M20,70 L20,80 Q75,90 130,80 L130,70", fill="#f1f5f9", stroke=LINE, sw=2.5)
    s.dots((28, 72, 122, 80), 12, r=2.4, fill=SAND, stroke="#a16207", seed=3, mind=7, sw=0.6)
    for (x, y, a) in ((58, 50, 80), (66, 56, 100), (88, 50, 95), (94, 58, 75), (76, 62, 90)):
        s.add(f'<rect x="{x - 4}" y="{y - 1.2}" width="8" height="2.4" fill="{INK}" transform="rotate({a} {x} {y})"/>')
    return s


def icon_indunstning():
    s = Svg(150, 90, "Ikon: indunstning", "Skål med salt över en låga och vattenånga som stiger.")
    s.path("M35,50 A40,26 0 0 0 115,50 Z", fill="#ffffff", stroke=LINE, sw=3)
    s.line(30, 50, 120, 50, stroke=LINE, sw=3)
    for x in (60, 75, 90):
        s.rect(x - 3, 54, 6, 6, fill="#ffffff", stroke=VIOLET, sw=1.5)
    s.flame(75, 86, 0.6)
    for dx in (-22, 0, 22):
        s.path(f"M{75 + dx},40 C{63 + dx},30 {87 + dx},20 {75 + dx},8", stroke=GLASS, sw=3)
    return s


def icon_centrifug():
    s = Svg(150, 90, "Ikon: centrifugering", "Centrifug sedd uppifrån med rör som snurrar.")
    cx, cy = 75, 46
    s.circle(cx, cy, 38, fill="#f1f5f9", stroke=LINE, sw=2.5)
    for a in (0, 90, 180, 270):
        r = math.radians(a)
        s.line(cx + 6 * math.cos(r), cy + 6 * math.sin(r), cx + 28 * math.cos(r), cy + 28 * math.sin(r), stroke=GREY, sw=3)
        s.circle(cx + 28 * math.cos(r), cy + 28 * math.sin(r), 6, fill="#ffffff", stroke=GLASS, sw=2.5)
    s.circle(cx, cy, 5, fill=GREY, stroke=LINE, sw=1.5)
    s.path("M22,30 A56,56 0 0 1 64,4", stroke=ORANGE, sw=3)
    return s


ALL = [("sedimentering", sedimentering), ("filtrering", filtrering), ("magnet", magnet), ("centrifug", centrifug),
       ("indunstning", indunstning), ("destillation", destillation), ("kromatografi", kromatografi),
       ("fallning", fallning), ("reningsverk", reningsverk), ("legering", legering),
       ("icon-filtrering", icon_filtrering), ("icon-destillation", icon_destillation), ("icon-kromatografi", icon_kromatografi),
       ("icon-magnet", icon_magnet), ("icon-indunstning", icon_indunstning), ("icon-centrifug", icon_centrifug)]

if __name__ == "__main__":
    import os
    out = os.environ.get("OUT", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "images", "kemi", "separationsprocesser"))
    os.makedirs(out, exist_ok=True)
    for name, fn in ALL:
        fn().save(f"{out}/{name}.svg")
        print("ok", name)
