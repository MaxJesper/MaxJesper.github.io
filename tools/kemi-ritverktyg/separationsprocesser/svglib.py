# -*- coding: utf-8 -*-
"""
Litet ritbibliotek för bilderna i kemi/separationsprocesser.
Alla bilder ritas med skript (aldrig frihand) så att de kan ändras och återskapas.

Färgregler (Jesper är rödgrön färgblind): inga röd/gröna par som bär information. Skillnader
visas med form, mönster (streckad/hel linje), storlek och text – färgen är bara komplement.
Paletten är blå, orange, violett, grå och brun.
"""
import random, math
from xml.sax.saxutils import escape

FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"

# palett (kontrast mot vit >= 4,5:1 för text)
INK = "#1f2937"       # text
MUTED = "#475569"
LINE = "#334155"      # linjer/ramar
GLASS = "#94a3b8"
WATER = "#dbeafe"     # vatten (ljusblått)
WATER_D = "#bfdbfe"
BLUE = "#1d4ed8"
BLUE_L = "#93c5fd"
ORANGE = "#c2410c"
ORANGE_L = "#fdba74"
VIOLET = "#6d28d9"
VIOLET_L = "#c4b5fd"
BROWN = "#78350f"
BROWN_L = "#a16207"
SAND = "#d6b98c"
GREY = "#6b7280"
GREY_L = "#e5e7eb"
YELLOW = "#fde68a"
TEAL = "#0e7490"
TEAL_L = "#a5f3fc"


class Svg:
    def __init__(self, w, h, title, desc=""):
        self.w, self.h = w, h
        self.title, self.desc = title, desc
        self.parts = []
        self.defs = []

    # ---- grundformer ----
    def add(self, s):
        self.parts.append(s)

    def rect(self, x, y, w, h, fill="none", stroke="none", sw=1.5, rx=0, extra=""):
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def circle(self, x, y, r, fill="none", stroke="none", sw=1.5, extra=""):
        self.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def line(self, x1, y1, x2, y2, stroke=LINE, sw=2, dash="", cap="round", extra=""):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"{d} {extra}/>')

    def path(self, d, fill="none", stroke=LINE, sw=2, dash="", extra=""):
        da = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"{da} {extra}/>')

    def poly(self, pts, fill="none", stroke=LINE, sw=2, extra=""):
        p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')

    def text(self, x, y, s, size=14, anchor="middle", weight="400", fill=INK, extra=""):
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" font-weight="{weight}" fill="{fill}" {extra}>{escape(s)}</text>')

    def lines_text(self, x, y, lines, size=14, anchor="middle", weight="400", fill=INK, lh=1.25):
        for i, s in enumerate(lines):
            self.text(x, y + i * size * lh, s, size, anchor, weight, fill)

    def arrow(self, x1, y1, x2, y2, stroke=LINE, sw=2.5, head=9, dash=""):
        ang = math.atan2(y2 - y1, x2 - x1)
        hx, hy = x2 - head * math.cos(ang), y2 - head * math.sin(ang)
        self.line(x1, y1, hx, hy, stroke, sw, dash)
        p1 = (x2, y2)
        p2 = (hx + head * 0.55 * math.cos(ang + math.pi / 2), hy + head * 0.55 * math.sin(ang + math.pi / 2))
        p3 = (hx + head * 0.55 * math.cos(ang - math.pi / 2), hy + head * 0.55 * math.sin(ang - math.pi / 2))
        self.poly([p1, p2, p3], fill=stroke, stroke=stroke, sw=1)

    def curved_arrow(self, x1, y1, cx, cy, x2, y2, stroke=LINE, sw=2.5, head=9, dash=""):
        """Kvadratisk bezier med pilspets vid slutet."""
        ang = math.atan2(y2 - cy, x2 - cx)
        hx, hy = x2 - head * math.cos(ang), y2 - head * math.sin(ang)
        self.path(f"M{x1:.1f},{y1:.1f} Q{cx:.1f},{cy:.1f} {hx:.1f},{hy:.1f}", stroke=stroke, sw=sw, dash=dash)
        p2 = (hx + head * 0.55 * math.cos(ang + math.pi / 2), hy + head * 0.55 * math.sin(ang + math.pi / 2))
        p3 = (hx + head * 0.55 * math.cos(ang - math.pi / 2), hy + head * 0.55 * math.sin(ang - math.pi / 2))
        self.poly([(x2, y2), p2, p3], fill=stroke, stroke=stroke, sw=1)

    def label_box(self, x, y, s, size=13, pad=6, fill="#ffffff", stroke=LINE, weight="600", fg=INK):
        w = len(s) * size * 0.56 + 2 * pad
        self.rect(x - w / 2, y - size, w, size + 2 * pad - 2, fill=fill, stroke=stroke, sw=1.2, rx=6)
        self.text(x, y + 1, s, size, "middle", weight, fg)

    def num_badge(self, x, y, n, r=11):
        self.circle(x, y, r, fill=INK, stroke="#fff", sw=1.5)
        self.text(x, y + 4.5, str(n), 13, "middle", "700", "#ffffff")

    # ---- kemiglas ----
    def beaker(self, x, y, w, h, liquid=0.6, color=WATER, tick=True, spout=True, stroke=GLASS, sw=2.5):
        """Bägare med öppning upptill. (x,y)=övre vänstra hörnet. Returnerar vätskeyta y och botten y."""
        # glasyta (utfylld svagt)
        top, bot = y, y + h
        self.path(f"M{x:.1f},{top:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot:.1f} {x + 10:.1f},{bot:.1f} L{x + w - 10:.1f},{bot:.1f} "
                  f"Q{x + w - 3:.1f},{bot:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w:.1f},{top:.1f}", fill="#ffffff", stroke="none")
        ly = bot - (h - 4) * liquid
        if liquid > 0:
            self.path(f"M{x + 1:.1f},{ly:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot - 1:.1f} {x + 10:.1f},{bot - 1:.1f} L{x + w - 10:.1f},{bot - 1:.1f} "
                      f"Q{x + w - 3:.1f},{bot - 1:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w - 1:.1f},{ly:.1f} Z", fill=color, stroke="none")
            self.line(x + 1, ly, x + w - 1, ly, stroke="#64748b", sw=1.2)
        self.path(f"M{x:.1f},{top:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot:.1f} {x + 10:.1f},{bot:.1f} L{x + w - 10:.1f},{bot:.1f} "
                  f"Q{x + w - 3:.1f},{bot:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w:.1f},{top:.1f}", stroke=stroke, sw=sw)
        if spout:
            self.path(f"M{x:.1f},{top:.1f} L{x - 6:.1f},{top - 3:.1f}", stroke=stroke, sw=sw)
        if tick:
            for i in range(1, 4):
                ty = bot - (h - 4) * i / 4.5
                self.line(x + w - 14, ty, x + w - 4, ty, stroke=GLASS, sw=1.5)
        return ly, bot

    def tube(self, x, y, w, h, liquid=0.6, color=WATER, stroke=GLASS, sw=2.5):
        """Provrör (rundad botten)."""
        r = w / 2
        bot = y + h
        ly = bot - (h - r) * liquid - r * 0.6
        if liquid > 0:
            self.path(f"M{x + 1:.1f},{ly:.1f} L{x + 1:.1f},{bot - r:.1f} A{r - 1:.1f},{r - 1:.1f} 0 0 0 {x + w - 1:.1f},{bot - r:.1f} L{x + w - 1:.1f},{ly:.1f} Z", fill=color)
            self.line(x + 1, ly, x + w - 1, ly, stroke="#64748b", sw=1.2)
        self.path(f"M{x:.1f},{y:.1f} L{x:.1f},{bot - r:.1f} A{r:.1f},{r:.1f} 0 0 0 {x + w:.1f},{bot - r:.1f} L{x + w:.1f},{y:.1f}", stroke=stroke, sw=sw)
        return ly, bot

    def dots(self, region, n, r=3, fill=BLUE, stroke="none", seed=1, mind=None, sw=1):
        x0, y0, x1, y1 = region
        rnd = random.Random(seed)
        mind = mind if mind is not None else r * 2.6
        pts = []
        tries = 0
        while len(pts) < n and tries < 6000:
            tries += 1
            px, py = rnd.uniform(x0 + r, x1 - r), rnd.uniform(y0 + r, y1 - r)
            if all((px - qx) ** 2 + (py - qy) ** 2 >= mind ** 2 for qx, qy in pts):
                pts.append((px, py))
        for px, py in pts:
            self.circle(px, py, r, fill=fill, stroke=stroke, sw=sw)
        return pts

    def flame(self, x, y, s=1.0):
        self.path(f"M{x:.1f},{y:.1f} C{x - 9 * s:.1f},{y - 12 * s:.1f} {x - 4 * s:.1f},{y - 22 * s:.1f} {x:.1f},{y - 34 * s:.1f} "
                  f"C{x + 4 * s:.1f},{y - 22 * s:.1f} {x + 9 * s:.1f},{y - 12 * s:.1f} {x:.1f},{y:.1f} Z", fill="#fdba74", stroke=ORANGE, sw=1.6)
        self.path(f"M{x:.1f},{y - 1:.1f} C{x - 4 * s:.1f},{y - 6 * s:.1f} {x - 2 * s:.1f},{y - 11 * s:.1f} {x:.1f},{y - 16 * s:.1f} "
                  f"C{x + 2 * s:.1f},{y - 11 * s:.1f} {x + 4 * s:.1f},{y - 6 * s:.1f} {x:.1f},{y - 1:.1f} Z", fill="#fde68a", stroke="none")

    def burner(self, x, y, flame=True):
        """Bunsenbrännare (x = mitt, y = underkant)."""
        self.rect(x - 24, y - 6, 48, 6, fill=GREY, stroke=LINE, sw=1.5, rx=2)
        self.rect(x - 5, y - 44, 10, 38, fill=GREY_L, stroke=LINE, sw=1.5)
        if flame:
            self.flame(x, y - 46, 1.0)

    def stand_base(self, x, y, w=120):
        self.rect(x, y, w, 8, fill=GREY, stroke=LINE, sw=1.5, rx=2)

    def clip_id(self):
        self._cid = getattr(self, "_cid", 0) + 1
        return f"c{self._cid}"

    def tilted_beaker(self, x, y, w, h, angle, surface_y, color=WATER, pivot=None, stroke=GLASS, sw=2.5):
        """Vinklad bägare (roterad `angle` grader kring pivot). Vätskeytan hålls vågrät (surface_y i bildens koordinater)."""
        px, py = pivot if pivot else (x + w / 2, y + h / 2)
        top, bot = y, y + h
        d = (f"M{x:.1f},{top:.1f} L{x + 2:.1f},{bot - 6:.1f} Q{x + 3:.1f},{bot:.1f} {x + 10:.1f},{bot:.1f} L{x + w - 10:.1f},{bot:.1f} "
             f"Q{x + w - 3:.1f},{bot:.1f} {x + w - 2:.1f},{bot - 6:.1f} L{x + w:.1f},{top:.1f}")
        tr = f'transform="rotate({angle} {px:.1f} {py:.1f})"'
        cid = self.clip_id()
        self.defs.append(f'<clipPath id="{cid}"><path d="{d} Z" {tr}/></clipPath>')
        self.add(f'<path d="{d} Z" fill="#ffffff" stroke="none" {tr}/>')
        self.add(f'<rect x="{x - 200:.1f}" y="{surface_y:.1f}" width="{w + 400:.1f}" height="400" fill="{color}" clip-path="url(#{cid})"/>')
        self.add(f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {tr}/>')

    # ---- utdata ----
    def render(self):
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}" '
                f'role="img" aria-labelledby="t d" font-family="{FONT}">\n')
        head += f'<title id="t">{escape(self.title)}</title>\n<desc id="d">{escape(self.desc)}</desc>\n'
        if self.defs:
            head += "<defs>" + "".join(self.defs) + "</defs>\n"
        return head + "\n".join(self.parts) + "\n</svg>\n"

    def save(self, path):
        with open(path, "w", encoding="utf-8") as f:
            f.write(self.render())
