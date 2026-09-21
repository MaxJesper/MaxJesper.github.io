#!/usr/bin/env python3
"""Ritar de nio faropiktogrammen (CLP/GHS01–GHS09) som SVG.

Formen (röd ruta på spetsen, vit botten, svart symbol) följer EU:s CLP-förordning (EG) 1272/2008 och FN:s GHS.
Själva teckningarna är egna, ritade i kod för NO-sidan – inga kopior av någon tryckt bild.
Symbolerna ritas i ett rutnät 0–100 (centrum 50,50) och skalas in i rutan.

Körning:  python3 rita.py [utmapp]      (standard: ../../../images/kemi/faropiktogram)
Reproducerbart: samma indata ger identiska SVG-filer.
"""
import math, os, sys

ROD = "#E2001A"
SVART = "#111111"

def stjarna(cx, cy, ro, ri, n, rot=-90):
    pts = []
    for i in range(2 * n):
        r = ro if i % 2 == 0 else ri
        a = math.radians(rot + i * 180 / n)
        pts.append(f"{cx + r * math.cos(a):.1f},{cy + r * math.sin(a):.1f}")
    return " ".join(pts)

# Låga (fylld). Ritas i egen ruta 0–100 och kan skalas/flyttas.
LAGA = "M50 8 C53 24 72 34 70 58 C69 74 60 86 48 86 C36 86 28 76 29 62 C29 52 34 46 38 38 C40 46 45 49 48 46 C49 34 45 22 50 8 Z"
LAGA_INNE = "M50 52 C56 60 60 66 58 73 C57 78 53 80 49 80 C44 80 41 76 42 71 C43 66 47 62 50 52 Z"

def piktogram_explosiv():
    return f'''
  <circle cx="38" cy="66" r="19" fill="{SVART}"/>
  <path d="M30 56 A12 12 0 0 1 40 50" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <rect x="42" y="42" width="10" height="9" rx="1.5" transform="rotate(40 47 46)" fill="{SVART}"/>
  <path d="M52 44 C56 38 60 36 64 34" fill="none" stroke="{SVART}" stroke-width="3.2" stroke-linecap="round"/>
  <polygon points="{stjarna(70, 28, 24, 10.5, 9, -80)}" fill="{SVART}"/>
  <polygon points="{stjarna(70, 28, 12, 5, 9, -80)}" fill="#fff"/>
'''

def piktogram_brandfarlig():
    return f'''
  <path d="{LAGA}" fill="{SVART}"/>
  <path d="{LAGA_INNE}" fill="#fff"/>
'''

def piktogram_oxiderande():
    return f'''
  <g transform="translate(19 -4) scale(0.62)"><path d="{LAGA}" fill="{SVART}"/><path d="{LAGA_INNE}" fill="#fff"/></g>
  <circle cx="50" cy="72" r="19" fill="none" stroke="{SVART}" stroke-width="7.5"/>
  <rect x="28" y="48" width="44" height="5.5" fill="{SVART}"/>
'''

def piktogram_gas():
    return f'''
  <rect x="43" y="6" width="14" height="8" rx="2" fill="{SVART}"/>
  <rect x="47" y="12" width="6" height="12" fill="{SVART}"/>
  <path d="M30 42 C30 30 38 24 50 24 C62 24 70 30 70 42 L70 92 L30 92 Z" fill="{SVART}"/>
  <rect x="30" y="47" width="40" height="4.5" fill="#fff"/>
  <rect x="36" y="60" width="28" height="18" rx="2" fill="none" stroke="#fff" stroke-width="3"/>
'''

def piktogram_fratande():
    tub = lambda x, rot: f'''<g transform="rotate({rot} {x} 14)"><path d="M{x-7} 3 L{x+7} 3 L{x+7} 24 A7 7 0 0 1 {x-7} 24 Z" fill="{SVART}"/><rect x="{x-9}" y="0" width="18" height="5" rx="1.5" fill="{SVART}"/><path d="M{x-3} 12 L{x-3} 24" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>'''
    drop = lambda x, y: f'<path d="M{x} {y} C{x+5} {y+7} {x+6} {y+11} {x} {y+13} C{x-6} {y+11} {x-5} {y+7} {x} {y} Z" fill="{SVART}"/>'
    return f'''
  {tub(28, 32)}
  {tub(72, -32)}
  {drop(33, 32)}{drop(36, 46)}
  {drop(67, 32)}{drop(64, 46)}
  <path d="M4 68 L44 68 L44 90 L4 90 Z" fill="{SVART}"/>
  <path d="M4 68 L15 68 L21 76 L12 80 L4 76 Z" fill="#fff"/>
  <path d="M44 90 L38 86 L42 80 L36 77 L44 72 Z" fill="#fff"/>
  <circle cx="26" cy="83" r="3" fill="#fff"/><circle cx="32" cy="73" r="2.2" fill="#fff"/>
  <rect x="55" y="72" width="36" height="22" rx="8" fill="{SVART}"/>
  <rect x="56" y="62" width="7" height="20" rx="3.5" fill="{SVART}"/><rect x="65" y="58" width="7" height="24" rx="3.5" fill="{SVART}"/><rect x="74" y="60" width="7" height="22" rx="3.5" fill="{SVART}"/><rect x="83" y="64" width="7" height="18" rx="3.5" fill="{SVART}"/>
  <path d="M55 82 C48 80 46 74 50 70 C54 70 56 76 57 80 Z" fill="{SVART}"/>
  <circle cx="72" cy="86" r="3.2" fill="#fff"/><circle cx="82" cy="78" r="2.3" fill="#fff"/><circle cx="66" cy="76" r="2" fill="#fff"/><circle cx="87" cy="88" r="2" fill="#fff"/>
'''

def piktogram_giftig():
    ben = lambda x1, y1, x2, y2: f'''<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{SVART}" stroke-width="7.5" stroke-linecap="round"/>
  <circle cx="{x1-2 if x1<x2 else x1+2}" cy="{y1-3.5}" r="4.6" fill="{SVART}"/><circle cx="{x1-2 if x1<x2 else x1+2}" cy="{y1+3.5}" r="4.6" fill="{SVART}"/>
  <circle cx="{x2+2 if x1<x2 else x2-2}" cy="{y2-3.5}" r="4.6" fill="{SVART}"/><circle cx="{x2+2 if x1<x2 else x2-2}" cy="{y2+3.5}" r="4.6" fill="{SVART}"/>'''
    return f'''
  {ben(20, 62, 80, 94)}
  {ben(80, 62, 20, 94)}
  <path d="M50 8 C68 8 78 20 78 36 C78 46 73 52 68 55 L68 66 L32 66 L32 55 C27 52 22 46 22 36 C22 20 32 8 50 8 Z" fill="{SVART}"/>
  <ellipse cx="38.5" cy="37" rx="7.5" ry="8.5" fill="#fff"/><ellipse cx="61.5" cy="37" rx="7.5" ry="8.5" fill="#fff"/>
  <path d="M50 44 L44.5 55 L55.5 55 Z" fill="#fff"/>
  <line x1="41" y1="60" x2="41" y2="66" stroke="#fff" stroke-width="2.4"/><line x1="50" y1="60" x2="50" y2="66" stroke="#fff" stroke-width="2.4"/><line x1="59" y1="60" x2="59" y2="66" stroke="#fff" stroke-width="2.4"/>
'''

def piktogram_skadlig():
    return f'''
  <path d="M39 6 L61 6 L56 62 L44 62 Z" fill="{SVART}"/>
  <circle cx="50" cy="82" r="9.5" fill="{SVART}"/>
'''

def piktogram_halsofara():
    return f'''
  <circle cx="50" cy="20" r="14" fill="{SVART}"/>
  <path d="M16 96 C16 62 26 42 50 42 C74 42 84 62 84 96 Z" fill="{SVART}"/>
  <polygon points="{stjarna(50, 68, 16, 7.5, 6, -90)}" fill="#fff"/>
'''

def piktogram_miljo():
    gren = lambda pts: f'<polyline points="{pts}" fill="none" stroke="{SVART}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'''
  <rect x="4" y="80" width="38" height="5" rx="1" fill="{SVART}"/>
  <path d="M19 82 L20 30 L26 30 L27 82 Z" fill="{SVART}"/>
  {gren("22 62 12 52 6 44")}
  {gren("11 51 10 40")}
  {gren("23 48 35 38 38 30")}
  {gren("22 38 12 28 9 20")}
  {gren("23 30 30 20")}
  {gren("25 66 35 60")}
  <path d="M46 84 C51 79 55 89 60 84 C65 79 69 89 74 84 C79 79 83 89 88 84 C91 82 93 83 96 84" fill="none" stroke="{SVART}" stroke-width="4.2" stroke-linecap="round"/>
  <g transform="rotate(180 70 63)">
    <ellipse cx="68" cy="63" rx="17" ry="9.5" fill="{SVART}"/>
    <path d="M82 63 L96 52 L96 74 Z" fill="{SVART}"/>
    <path d="M62 55 L69 46 L76 56 Z" fill="{SVART}"/>
    <path d="M58 71 L62 77 L69 71 Z" fill="{SVART}"/>
    <path d="M55 59 L60.5 64.5 M60.5 59 L55 64.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
  </g>
'''

# kod, filnamn, namn, ritfunktion, alt-text
PIKTOGRAM = [
    ("GHS01", "ghs01-explosiv", "Explosiv", piktogram_explosiv, "Faropiktogram Explosiv: en svart bomb som exploderar med en stjärnformad smäll."),
    ("GHS02", "ghs02-brandfarlig", "Brandfarlig", piktogram_brandfarlig, "Faropiktogram Brandfarlig: en svart låga."),
    ("GHS03", "ghs03-oxiderande", "Oxiderande", piktogram_oxiderande, "Faropiktogram Oxiderande: en svart låga ovanför en cirkel."),
    ("GHS04", "ghs04-gas-under-tryck", "Gas under tryck", piktogram_gas, "Faropiktogram Gas under tryck: en svart gasflaska."),
    ("GHS05", "ghs05-fratande", "Frätande", piktogram_fratande, "Faropiktogram Frätande: två provrör som droppar på en metallbit och en hand så att de fräts sönder."),
    ("GHS06", "ghs06-akut-giftig", "Akut giftig", piktogram_giftig, "Faropiktogram Akut giftig: en dödskalle med två korsade ben."),
    ("GHS07", "ghs07-skadlig", "Skadlig", piktogram_skadlig, "Faropiktogram Skadlig: ett svart utropstecken."),
    ("GHS08", "ghs08-allvarlig-halsofara", "Allvarlig hälsofara", piktogram_halsofara, "Faropiktogram Allvarlig hälsofara: en människosiluett med en vit stjärna i bröstet."),
    ("GHS09", "ghs09-miljofarlig", "Miljöfarlig", piktogram_miljo, "Faropiktogram Miljöfarlig: ett dött träd och en död fisk som flyter på vattnet."),
]

# (skala, centrum x, centrum y) per symbol – flyttar teckningens mitt till rutans mitt
SKALA = {"GHS01": (1.08, 55, 46), "GHS02": (1.12, 50, 47), "GHS03": (1.1, 50, 50), "GHS04": (1.05, 50, 49),
         "GHS05": (1.0, 50, 50), "GHS06": (1.0, 50, 50), "GHS07": (1.1, 50, 49), "GHS08": (1.0, 50, 52), "GHS09": (1.0, 50, 52)}

def svg(kod, namn, alt, symbol):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-labelledby="t d">
  <title id="t">{kod} – {namn}</title>
  <desc id="d">{alt}</desc>
  <polygon points="100,7 193,100 100,193 7,100" fill="#ffffff" stroke="{ROD}" stroke-width="15" stroke-linejoin="miter"/>
  <g transform="translate({100 - SKALA[kod][1] * SKALA[kod][0]:.1f} {100 - SKALA[kod][2] * SKALA[kod][0]:.1f}) scale({SKALA[kod][0]})">{symbol}
  </g>
</svg>
'''

def main():
    ut = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "images", "kemi", "faropiktogram")
    os.makedirs(ut, exist_ok=True)
    for kod, fil, namn, fn, alt in PIKTOGRAM:
        with open(os.path.join(ut, fil + ".svg"), "w", encoding="utf-8") as f:
            f.write(svg(kod, namn, alt, fn()))
    print("Ritade", len(PIKTOGRAM), "piktogram i", os.path.normpath(ut))

if __name__ == "__main__":
    main()
