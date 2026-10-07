#!/usr/bin/env python3
"""Genererar kemi/matens-kemi/kortspel.html (kör: python3 tools/kemi-ritverktyg/matens-kemi/bygg_kortspel.py)
 – begreppskortspel för Matens kemi (24 par).
Bilder: egna vektorikoner (ritade här) + plattformens verifierade kulmodell-PNG:er."""
import html, math

INK = '#3b0d44'      # mörk lila linje
AREA = '#86198f'
GOLD = '#b7791f'
SOFT = '#fdf4ff'
KM = '/images/kemi/matens-kemi/kulmodeller/'

# ---------------------------------------------------------------- ikoner (viewBox 0 0 200 110)
def svg(body, vb='0 0 200 110'):
    return f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">{body}</svg>'

def hexring(cx, cy, r=16, o_at=1, fill='#fff', sw=3):
    """Sexring (pyranos) med syreatom 'O' i ett hörn (o_at = hörnindex 0..5, 0 = upp)."""
    pts = [(cx + r * math.sin(math.radians(60 * k)), cy - r * math.cos(math.radians(60 * k))) for k in range(6)]
    poly = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    ox, oy = pts[o_at]
    return (f'<polygon points="{poly}" fill="{fill}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round"/>'
            f'<circle cx="{ox:.1f}" cy="{oy:.1f}" r="6.5" fill="#fff"/>'
            f'<text x="{ox:.1f}" y="{oy+3.6:.1f}" font-size="11" font-weight="700" text-anchor="middle" fill="#b91c1c" font-family="Arial">O</text>'), pts

def pentring(cx, cy, r=15, fill='#fff'):
    pts = [(cx + r * math.sin(math.radians(72 * k)), cy - r * math.cos(math.radians(72 * k))) for k in range(5)]
    poly = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    ox, oy = pts[0]
    return (f'<polygon points="{poly}" fill="{fill}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
            f'<circle cx="{ox:.1f}" cy="{oy:.1f}" r="6.5" fill="#fff"/>'
            f'<text x="{ox:.1f}" y="{oy+3.6:.1f}" font-size="11" font-weight="700" text-anchor="middle" fill="#b91c1c" font-family="Arial">O</text>'), pts

def bridge(x1, y1, x2, y2):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + 6
    return (f'<polyline points="{x1:.1f},{y1:.1f} {mx:.1f},{my:.1f} {x2:.1f},{y2:.1f}" fill="none" stroke="{INK}" stroke-width="3"/>'
            f'<circle cx="{mx:.1f}" cy="{my:.1f}" r="6.5" fill="#fff"/>'
            f'<text x="{mx:.1f}" y="{my+3.6:.1f}" font-size="11" font-weight="700" text-anchor="middle" fill="#b91c1c" font-family="Arial">O</text>')

def label(x, y, t, size=12):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle" fill="{INK}" font-family="Arial" font-weight="700">{t}</text>'

def chain(n, x0, y0, step=30, r=12, bend=0.0, alt=False):
    """Kedja av sexringar. bend>0 böjer kedjan (stärkelse), alt=True vänder varannan ring (cellulosa)."""
    out, prev = [], None
    for i in range(n):
        x = x0 + i * step
        y = y0 + bend * (i - (n - 1) / 2) ** 2
        ring, pts = hexring(x, y, r, o_at=(1 if (not alt or i % 2 == 0) else 4), sw=2.5)
        if prev is not None:
            out.append(f'<line x1="{prev[0]:.1f}" y1="{prev[1]:.1f}" x2="{x - r*0.87:.1f}" y2="{y:.1f}" stroke="{INK}" stroke-width="2.5"/>')
        out.append(ring)
        prev = (x + r * 0.87, y)
    return ''.join(out)

def zigzag(x0, y0, n, dx=14, dy=8, kinks=(), double=(), ang0=0.0, kink=0.75):
    """Kolkedja i sicksack. kinks = index där kedjan viker (cis-dubbelbindning), double = index för C=C."""
    pts, x, y, d, ang = [(x0, y0)], x0, y0, 1, ang0
    for i in range(n):
        if i in kinks: ang += kink
        ux, uy = math.cos(ang), math.sin(ang)
        px, py = -uy, ux
        x += dx * ux + d * dy * px
        y += dx * uy + d * dy * py
        d = -d
        pts.append((x, y))
    s = f'<polyline points="{" ".join(f"{a:.1f},{b:.1f}" for a, b in pts)}" fill="none" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>'
    for i in double:
        (a, b), (c, e) = pts[i], pts[i + 1]
        L = math.hypot(c - a, e - b); nx, ny = -(e - b) / L * 4.5, (c - a) / L * 4.5
        s += f'<line x1="{a+nx+(c-a)*0.15:.1f}" y1="{b+ny+(e-b)*0.15:.1f}" x2="{c+nx-(c-a)*0.15:.1f}" y2="{e+ny-(e-b)*0.15:.1f}" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>'
    return s

def img(src, w=180, h=100):
    return f'<img src="{KM}{src}" alt="" class="km">'

def butter(x, y):
    return (f'<path d="M{x},{y+14} l14,-10 h40 l-14,10 z" fill="#fde68a" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
            f'<path d="M{x},{y+14} h40 v18 h-40 z" fill="#fcd34d" stroke="{INK}" stroke-width="2.5"/>'
            f'<path d="M{x+40},{y+14} l14,-10 v18 l-14,10 z" fill="#fbbf24" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>')

def bottle(x, y):
    return (f'<path d="M{x+8},{y} h10 v10 c10,6 12,12 12,22 v22 h-34 v-22 c0,-10 2,-16 12,-22 z" fill="#fef3c7" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>'
            f'<path d="M{x-3},{y+34} h32 v19 h-32 z" fill="#facc15" opacity="0.85"/>'
            f'<rect x="{x+7}" y="{y-6}" width="12" height="7" rx="2" fill="{AREA}"/>')

def beads(points, colors=('#7c3aed', '#0ea5e9', '#f59e0b', '#db2777', '#10b981', '#64748b')):
    s = f'<polyline points="{" ".join(f"{a},{b}" for a, b in points)}" fill="none" stroke="{INK}" stroke-width="2.2"/>'
    for i, (a, b) in enumerate(points):
        s += f'<circle cx="{a}" cy="{b}" r="6.2" fill="{colors[i % len(colors)]}" stroke="{INK}" stroke-width="1.6"/>'
    return s

ICON = {}
r1, _ = hexring(100, 55, 38)
ICON['monosackarid'] = svg(r1)
a, pa = hexring(56, 55, 32); b, pb = hexring(144, 55, 32)
ICON['disackarid'] = svg(a + b + bridge(pa[2][0], pa[2][1], pb[4][0], pb[4][1]))
a, pa = hexring(58, 44, 22); b, pb = hexring(140, 44, 22)
ICON['laktos'] = svg(a + b + bridge(pa[2][0], pa[2][1], pb[4][0], pb[4][1]) + label(58, 98, 'galaktos', 13) + label(140, 98, 'glukos', 13))
a, pa = hexring(58, 44, 22); b, pb = pentring(142, 46, 21)
ICON['sackaros'] = svg(a + b + bridge(pa[2][0], pa[2][1], pb[4][0], pb[4][1]) + label(58, 98, 'glukos', 13) + label(142, 98, 'fruktos', 13))
ICON['polysackarid'] = svg(chain(5, 30, 55, step=35, r=14) + label(8, 61, '…', 22) + label(192, 61, '…', 22))
ICON['cellulosa'] = svg(chain(5, 22, 50, step=39, r=16, alt=True))
ICON['stärkelse'] = svg(chain(5, 26, 24, step=37, r=14, bend=4.5)
    + f'<ellipse cx="100" cy="92" rx="26" ry="14" fill="#e7c69a" stroke="{INK}" stroke-width="2.5"/>'
    + '<circle cx="90" cy="90" r="1.8" fill="#7c5a2f"/><circle cx="106" cy="95" r="1.8" fill="#7c5a2f"/><circle cx="112" cy="87" r="1.6" fill="#7c5a2f"/>')
ICON['kolhydrater'] = svg(
    f'<path d="M20,90 v-34 c0,-16 50,-16 50,0 v34 z" fill="#f2c27b" stroke="{INK}" stroke-width="2.5"/>'
    f'<path d="M28,56 c4,-6 30,-6 34,0" fill="none" stroke="{INK}" stroke-width="1.8"/>'
    f'<ellipse cx="104" cy="74" rx="24" ry="17" fill="#e7c69a" stroke="{INK}" stroke-width="2.5"/>'
    '<circle cx="96" cy="70" r="1.8" fill="#7c5a2f"/><circle cx="112" cy="80" r="1.8" fill="#7c5a2f"/>'
    f'<path d="M142,92 c6,-12 10,-30 22,-40 M152,94 c6,-12 10,-30 22,-40 M162,96 c6,-12 10,-30 22,-40" fill="none" stroke="#d4a017" stroke-width="5" stroke-linecap="round"/>'
    f'<path d="M142,92 c6,-12 10,-30 22,-40 M152,94 c6,-12 10,-30 22,-40 M162,96 c6,-12 10,-30 22,-40" fill="none" stroke="{INK}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>')
ICON['fett'] = svg(
    f'<rect x="30" y="12" width="20" height="88" rx="5" fill="#5b6b8c"/>'
    f'<text x="40" y="61" font-size="15" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">G</text>'
    + ''.join(f'<line x1="50" y1="{y}" x2="62" y2="{y}" stroke="{INK}" stroke-width="3"/>' + zigzag(62, y, 9, dx=13, dy=6) for y in (24, 56, 88)))
ICON['fettsyra'] = img('palmitinsyra.png')
ICON['mättat fett'] = svg(zigzag(18, 30, 12, dx=13, dy=7) + butter(70, 62))
ICON['omättat fett'] = svg(zigzag(10, 30, 11, dx=13, dy=7, kinks=(5,), double=(4,), ang0=-0.2, kink=0.6) + bottle(160, 46))
ICON['fleromättat fett'] = svg(zigzag(14, 34, 14, dx=13, dy=6, kinks=(3, 7, 11), double=(2, 6, 10), ang0=-0.35, kink=0.32))
ICON['omega 3'] = svg(
    f'<path d="M30,56 C60,20 120,20 150,56 C120,92 60,92 30,56 Z" fill="#bae6fd" stroke="{INK}" stroke-width="2.8"/>'
    f'<path d="M150,56 L180,32 L176,56 L180,80 Z" fill="#7dd3fc" stroke="{INK}" stroke-width="2.8" stroke-linejoin="round"/>'
    f'<circle cx="58" cy="50" r="5" fill="{INK}"/><path d="M82,40 c8,10 8,22 0,32" fill="none" stroke="{INK}" stroke-width="2"/>'
    f'<text x="112" y="62" font-size="18" font-weight="800" fill="{INK}" text-anchor="middle" font-family="Georgia, serif">ω-3</text>')
ICON['glukos'] = '<img src="/images/kemi/matens-kemi/strukturformler/glukos-kort.svg" alt="" class="km">'
ICON['fruktos'] = '<img src="/images/kemi/matens-kemi/strukturformler/fruktos-kort.svg" alt="" class="km">'
ICON['glycerol'] = img('glycerol.png')
ICON['aminosyra'] = img('alanin.png')
ICON['proteiner'] = svg(beads([(30, 80), (44, 66), (36, 50), (50, 38), (68, 44), (78, 60), (94, 66), (104, 50), (98, 34), (114, 24), (132, 30), (140, 46), (128, 60), (140, 74), (158, 78), (172, 64)]))
ICON['denaturerad'] = svg(
    beads([(22, 60), (32, 46), (46, 40), (56, 52), (48, 66), (34, 74), (40, 88), (56, 86)])
    + f'<path d="M78,62 h34" stroke="{INK}" stroke-width="3"/><path d="M112,62 l-9,-6 v12 z" fill="{INK}"/>'
    + f'<path d="M95,48 c-6,-6 -2,-14 2,-18 c0,6 6,8 6,14 c0,4 -4,6 -8,4 z" fill="#f97316" stroke="{INK}" stroke-width="1.6"/>'
    + beads([(122, 40), (136, 52), (150, 44), (162, 58), (176, 50), (186, 64), (176, 78), (188, 90)]))
ICON['koagulera'] = svg(
    f'<path d="M48,58 C40,30 80,20 100,30 C124,16 162,30 156,56 C176,74 150,98 120,90 C100,104 60,100 58,84 C34,80 36,64 48,58 Z" fill="#fff" stroke="{INK}" stroke-width="2.8"/>'
    '<circle cx="104" cy="60" r="18" fill="#fbbf24" stroke="#b45309" stroke-width="2"/><circle cx="98" cy="54" r="5" fill="#fde68a"/>')
ICON['essentiell aminosyra'] = svg(
    f'<ellipse cx="54" cy="62" rx="40" ry="30" fill="#fff" stroke="{INK}" stroke-width="2.8"/><ellipse cx="54" cy="62" rx="27" ry="19" fill="none" stroke="{INK}" stroke-width="1.5"/>'
    '<ellipse cx="46" cy="58" rx="12" ry="8" fill="#fca5a5"/><circle cx="64" cy="66" r="7" fill="#86efac"/><circle cx="56" cy="70" r="5" fill="#fde68a"/>'
    f'<path d="M102,62 h30" stroke="{INK}" stroke-width="3"/><path d="M132,62 l-9,-6 v12 z" fill="{INK}"/>'
    + beads([(146, 74), (156, 60), (170, 66), (180, 52)]))
ICON['fotosyntesen'] = svg(
    '<circle cx="30" cy="28" r="13" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>'
    + ''.join(f'<line x1="{30+18*math.cos(t):.1f}" y1="{28+18*math.sin(t):.1f}" x2="{30+25*math.cos(t):.1f}" y2="{28+25*math.sin(t):.1f}" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/>' for t in [k * math.pi / 4 for k in range(8)])
    + f'<path d="M86,96 C80,60 110,38 150,36 C150,74 124,96 86,96 Z" fill="#86efac" stroke="{INK}" stroke-width="2.8"/>'
    f'<path d="M88,94 C104,74 120,58 146,40" fill="none" stroke="{INK}" stroke-width="2"/>'
    f'<text x="58" y="82" font-size="13" font-weight="700" fill="{INK}" font-family="Arial" text-anchor="middle">CO₂</text>'
    f'<text x="58" y="100" font-size="13" font-weight="700" fill="{INK}" font-family="Arial" text-anchor="middle">H₂O</text>'
    f'<text x="174" y="30" font-size="13" font-weight="700" fill="{INK}" font-family="Arial" text-anchor="middle">O₂</text>')
ICON['cellandning'] = svg(
    f'<ellipse cx="100" cy="56" rx="62" ry="40" fill="#f5f3ff" stroke="{INK}" stroke-width="2.8"/>'
    f'<ellipse cx="100" cy="56" rx="30" ry="15" fill="#fed7aa" stroke="{INK}" stroke-width="2.2"/>'
    f'<path d="M76,56 c6,-10 8,10 14,0 s8,10 14,0 s8,10 14,0" fill="none" stroke="{INK}" stroke-width="1.8"/>'
    f'<path d="M150,22 l-8,14 h8 l-8,14" fill="none" stroke="#b45309" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'
    f'<text x="20" y="28" font-size="12" font-weight="700" fill="{INK}" font-family="Arial">O₂</text>'
    f'<text x="176" y="100" font-size="12" font-weight="700" fill="{INK}" font-family="Arial" text-anchor="middle">CO₂</text>')

# ---------------------------------------------------------------- korten (ordning som i originalet)
PAIRS = [
    ('cellulosa', 'Cellulosa', 'Det vanligaste organiska ämnet i naturen. Bygger upp växternas cellväggar och är en sorts kostfiber.'),
    ('disackarid', 'Disackarid', 'En sockerart som består av två sockerenheter.'),
    ('monosackarid', 'Monosackarid', 'En sockerart som består av en enda sockerenhet.'),
    ('fruktos', 'Fruktos', 'En monosackarid som finns i till exempel frukt och honung.'),
    ('glukos', 'Glukos (druvsocker)', 'En monosackarid som bildas vid fotosyntesen.'),
    ('kolhydrater', 'Kolhydrater', 'Samlingsnamn för sockerarter, stärkelse och kostfiber. Finns i många livsmedel, till exempel bröd, pasta och potatis.'),
    ('laktos', 'Laktos', 'En disackarid som finns i mjölk.'),
    ('polysackarid', 'Polysackarid', 'En kolhydrat som består av långa kedjor av sockerenheter.'),
    ('sackaros', 'Sackaros', 'En disackarid som består av glukos och fruktos. Vanligt strösocker.'),
    ('stärkelse', 'Stärkelse', 'Växternas energilager: tusentals glukosenheter i långa kedjor. Finns i potatis, ris och mjöl.'),
    ('fett', 'Fett', 'En ester av glycerol och tre fettsyror.'),
    ('glycerol', 'Glycerol', 'En alkohol med tre OH-grupper. Ingår i fett.'),
    ('fettsyra', 'Fettsyra', 'En lång kolkedja med en syragrupp i ena änden. Tre sådana och en glycerol bildar ett fett.'),
    ('fleromättat fett', 'Fleromättat fett', 'Ett fett där fettsyrorna har mer än en dubbelbindning.'),
    ('mättat fett', 'Mättat fett', 'Ett fett där fettsyrorna bara har enkelbindningar.'),
    ('omättat fett', 'Omättat fett', 'Ett fett där fettsyrorna har minst en dubbelbindning.'),
    ('omega 3', 'Omega-3', 'En sorts fleromättade fettsyror som bland annat finns i fet fisk.'),
    ('aminosyra', 'Aminosyra', 'Byggstenarna i proteiner. Innehåller förutom kol, väte och syre även kväve. Kroppens proteiner byggs av 20 olika aminosyror.'),
    ('denaturerad', 'Denaturerad', 'Ett protein vars form har förstörts, till exempel av värme, så att det inte längre fungerar.'),
    ('essentiell aminosyra', 'Essentiell aminosyra', 'En aminosyra som kroppen inte kan tillverka. Den måste finnas i maten vi äter.'),
    ('koagulera', 'Koagulera', 'När proteiner klumpar ihop sig och stelnar, till exempel när ett ägg steks.'),
    ('proteiner', 'Proteiner', 'Långa kedjor av aminosyror. Bygger upp kroppen och ingår i enzymer, hormoner och antikroppar.'),
    ('fotosyntesen', 'Fotosyntesen', 'Växternas tillverkning av glukos och syre med hjälp av koldioxid, vatten och ljusenergi.'),
    ('cellandning', 'Cellandning', 'Cellens förbränning av glukos med hjälp av syre. Ger energi, koldioxid och vatten.'),
]
assert len(PAIRS) == 24 and all(k in ICON for k, _, _ in PAIRS)

def fsize(t):  # textstorlek i cqw efter textlängd (korta texter = stor text, som i originalet)
    n = len(t)
    return 7.4 if n <= 50 else 6.6 if n <= 75 else 6.0 if n <= 100 else 5.5

FRAME = '''<svg class="frame" viewBox="0 0 900 540" preserveAspectRatio="none" aria-hidden="true" focusable="false"><use href="#ramDef"/></svg>'''
FRAME_TERM = FRAME.replace('#ramDef"', '#ramTerm"')

def term_card(k, name):
    ic = ICON[k]
    big = ' big' if k in ('glukos', 'fruktos') else ''
    return (f'<div class="card term{big}"><div class="cin">{FRAME_TERM}<div class="pic">{ic}</div>'
            f'<div class="word">{html.escape(name)}</div></div></div>')

def def_card(text):
    return (f'<div class="card def"><div class="cin">{FRAME}<div class="dtext" style="font-size:{fsize(text)}cqw">{html.escape(text)}</div></div></div>')

# Enkel, modern kortstil (Jesper/ChatGPT-feedback 7 okt 2026): en tunn lila ram, inget guld eller ornament.
# Begreppskortet har ett lila namnband nedtill (syns även utan färgseende) – förklaringskortet är bara text.
# Ramarna är SVG (inte CSS-bakgrund) så att de alltid skrivs ut, även med "bakgrundsgrafik" avstängt.
FRAME_DEFS = f'''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<g id="ramDef">
  <rect x="6" y="6" width="888" height="528" rx="36" fill="#fffdf8" stroke="{AREA}" stroke-width="6"/>
</g>
<g id="ramTerm">
  <rect x="6" y="6" width="888" height="528" rx="36" fill="#f6eefa" stroke="{AREA}" stroke-width="6"/>
  <path d="M6,404 H894 V498 a36,36 0 0 1 -36,36 H42 a36,36 0 0 1 -36,-36 Z" fill="{AREA}"/>
</g>
</defs></svg>'''

# ---------------------------------------------------------------- baksida (helark-SVG, 210 x 297 mm)
CW, CH = 90, 52          # kortets storlek i mm (arket 180 x 260 mm ryms inom alla webbläsares utskriftsmarginaler)
GW, GH = 2 * CW, 5 * CH

def back_sheet():
    # Diskret mönster av sexringar (molekylmotiv) + per kort: tunn ram, glycin i en vit cirkel och "MATENS KEMI".
    hx = ' '.join(f'{4 + 2.6 * math.sin(math.radians(60 * k)):.2f},{4.5 - 2.6 * math.cos(math.radians(60 * k)):.2f}' for k in range(6))
    pat = f'''<pattern id="sexring" width="8" height="9" patternUnits="userSpaceOnUse">
      <rect width="8" height="9" fill="#f6effa"/><polygon points="{hx}" fill="none" stroke="#e2d1ee" stroke-width="0.35"/></pattern>'''
    cards = []
    for r in range(5):
        for c in range(2):
            x, y = c * CW, r * CH
            cards.append(f'''<g transform="translate({x},{y})">
              <circle cx="{CW/2}" cy="{CH/2 - 4}" r="14.5" fill="#fff" stroke="{AREA}" stroke-width="0.6"/>
              <image href="{KM}glycin.png" x="{CW/2 - 11.5}" y="{CH/2 - 14}" width="23" height="19.8"/>
              <text x="{CW/2}" y="{CH - 7.5}" font-size="4.6" text-anchor="middle" fill="{AREA}" font-family="-apple-system, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="800" letter-spacing="1.2">MATENS KEMI</text>
            </g>''')
    return f'''<svg class="backsvg" viewBox="0 0 {GW} {GH}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>{pat}</defs><rect width="{GW}" height="{GH}" fill="url(#sexring)"/>{''.join(cards)}</svg>'''

BACK_FRAME_DEF = ''

# ---------------------------------------------------------------- sidan
screen_pairs = '\n'.join(f'<div class="pair">{term_card(k, n)}{def_card(t)}</div>' for k, n, t in PAIRS)

front_sheets = []
for p in range(0, 24, 5):
    chunk = PAIRS[p:p + 5]
    cells = ''.join(term_card(k, n) + def_card(t) for k, n, t in chunk)
    cells += '<div class="card empty"></div>' * (2 * (5 - len(chunk)))
    front_sheets.append(cells)
sheets_html = ''
for i, cells in enumerate(front_sheets):
    sheets_html += f'<section class="sheet front"><div class="grid">{cells}</div></section>\n'
    sheets_html += f'<section class="sheet back">{back_sheet()}</section>\n'

PAGE = f'''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kortspel: begrepp och förklaringar – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css?v=43b4cdef" />
  <style>
    body.area-matens-kemi {{ --area:#a21caf; --area-strong:#86198f; --area-soft:#fdf4ff; --area-border:#f5d0fe; }}
    main {{ max-width: 1000px; margin: 0 auto; font-size: 1.05em; }}
    .intro-card {{ background: var(--area-soft); border: 1px solid var(--area-border); border-left: 4px solid var(--area-strong); border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 1.2rem; }}
    .intro-card p {{ margin: 0.35rem 0; }}
    .intro-card ol {{ margin: 0.3rem 0 0.3rem 1.3rem; padding: 0; }}
    .intro-card li {{ margin-bottom: 0.25rem; }}
    .print-row {{ display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 0.7rem 0 0.2rem; }}
    .print-row .subject-btn {{ margin: 0; }}
    h2.facit-h {{ color: var(--area-strong); font-size: 1.2rem; margin: 1.2rem 0 0.6rem; }}

    /* ---- korten (skalar med kortets bredd via container-enheter) ---- */
    .card {{ container-type: inline-size; aspect-ratio: 90 / 52; position: relative; }}
    .cin {{ position: absolute; inset: 0; }}
    .frame {{ position: absolute; inset: 0; width: 100%; height: 100%; }}
    .pic {{ position: absolute; left: 10%; right: 10%; top: 8%; height: 62%; display: flex; align-items: center; justify-content: center; }}
    .pic svg {{ width: 100%; height: 100%; }}
    .pic img.km {{ width: 100%; height: 100%; object-fit: contain; display: block; }}
    .term.big .pic {{ top: 4.5%; height: 69%; }}
    .word {{ position: absolute; left: 4%; right: 4%; top: 75%; bottom: 1.5%; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: 700; font-size: 7.6cqw; color: #fff; line-height: 1.05; letter-spacing: 0.01em; }}
    .dtext {{ position: absolute; inset: 13% 10% 13% 10%; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.25; color: #1f1f2e; font-weight: 500; }}

    .pairs {{ display: grid; gap: 14px; }}
    .pair {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 760px; }}
    @media (max-width: 560px) {{ .pair {{ grid-template-columns: 1fr; max-width: 340px; margin: 0 auto 10px; }} }}

    .sheets {{ display: none; }}
    @page {{ size: A4; margin: 12mm 15mm; }}
    @media print {{
      header, nav, .hamburger, .no-print, .site-footer {{ display: none !important; }}
      body {{ background: #fff !important; margin: 0; padding: 0; }}
      main {{ max-width: none; margin: 0; padding: 0; }}
      .sheets {{ display: block; }}
      .sheet {{ width: {GW}mm; height: {GH}mm; margin: 0 auto; position: relative; overflow: hidden; break-after: page; page-break-after: always; break-inside: avoid; }}
      .sheet:last-child {{ break-after: auto; page-break-after: auto; }}
      .grid {{ position: absolute; left: 0; top: 0; width: {GW}mm; display: grid; grid-template-columns: {CW}mm {CW}mm; grid-auto-rows: {CH}mm; }}
      .grid .card {{ width: {CW}mm; height: {CH}mm; aspect-ratio: auto; outline: 0.2mm dashed #9ca3af; outline-offset: -0.1mm; }}
      .grid .card .cin {{ inset: 1.5mm; }}
      .backsvg {{ position: absolute; inset: 0; width: {GW}mm; height: {GH}mm; display: block; }}
      body.only-front .sheet.back {{ display: none !important; }}
      * {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
    }}
  </style>
</head>
<body class="area-matens-kemi">
  {FRAME_DEFS}
  {BACK_FRAME_DEF}
  <header class="kemi-header">
    <h1>Kortspel: begrepp och förklaringar</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger no-print" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu" class="no-print"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./lektion-stationer.html" class="subject-btn">← Till lektionsförslaget</a>
      <a href="./" class="subject-btn">Matens kemi</a>
    </div>

    <section class="intro-card no-print">
      <p><strong>24 kortpar: ett begreppskort och ett förklaringskort.</strong> Alla kort sprids ut med texten uppåt. Lagen letar par, och ett lag får bara ta ett par om alla andra lag godkänner det. Laget med flest par vinner. Spelet hör till station 2 i <a href="./lektion-stationer.html">stationslektionen</a>.</p>
      <p><strong>Så skriver du ut:</strong></p>
      <ol>
        <li>Välj <strong>dubbelsidig utskrift, vänd längs långsidan</strong>. Baksidorna (sexringsmönster, glycinmolekyl och ”Matens kemi”) hamnar då bakom korten. Alla baksidor är likadana, så det gör inget om de hamnar någon millimeter fel.</li>
        <li>Saknar skrivaren dubbelsidig utskrift: skriv ut <strong>bara framsidor</strong>. Spelet fungerar lika bra, eftersom korten ligger med texten uppåt.</li>
        <li>Välj skala 100 % (inte ”anpassa till sidan”) och slå på ”bakgrundsgrafik” om webbläsaren frågar.</li>
        <li>Klipp längs de streckade linjerna. Laminera gärna arken före klippningen, så håller korten i många år.</li>
      </ol>
      <div class="print-row">
        <button type="button" class="subject-btn print-green" id="print-duplex">🖨️ Skriv ut korten (dubbelsidigt, 10 sidor)</button>
        <button type="button" class="subject-btn print-green" id="print-front">🖨️ Skriv ut bara framsidor (5 sidor)</button>
      </div>
    </section>

    <h2 class="facit-h no-print">Alla par (facit)</h2>
    <div class="pairs no-print">
{screen_pairs}
    </div>

    <div class="sheets" aria-hidden="true">
{sheets_html}
    </div>
  </main>

  <script src="/js/menu.js?v=0fc3b4a7"></script>
  <script>
    (function () {{
      function doPrint(onlyFront) {{
        if (onlyFront) document.body.classList.add('only-front');
        function done() {{ document.body.classList.remove('only-front'); window.removeEventListener('afterprint', done); }}
        window.addEventListener('afterprint', done);
        window.print();
      }}
      document.getElementById('print-duplex').addEventListener('click', function () {{ doPrint(false); }});
      document.getElementById('print-front').addEventListener('click', function () {{ doPrint(true); }});
    }})();
  </script>
</body>
</html>
'''
import sys, os
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'kemi', 'matens-kemi', 'kortspel.html')
open(OUT, 'w', encoding='utf-8').write(PAGE)
print('ok', len(PAGE))
