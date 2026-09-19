#!/usr/bin/env python3
"""Bygger allt bild- och modellmaterial till kemi/atomer (Atomer & molekyler).

Kör (från repots rot eller var som helst):
    python3 tools/kemi-ritverktyg/atomer/bygg_atomer.py            # allt
    python3 tools/kemi-ritverktyg/atomer/bygg_atomer.py data       # bara kemi/atomer/js/molmodeller.js + SVG:er
    python3 tools/kemi-ritverktyg/atomer/bygg_atomer.py png        # bara kulmodell-PNG:erna (kräver playwright + pillow + chromium)

Skriver:
  kemi/atomer/js/molmodeller.js                 window.MOLDATA (molblock, dubbel-/trippelbindningar, vyer, texter)
                                                 – läses av den delade komponenten js/molviewer.js
  images/kemi/atomer/strukturformler/<nyckel>.svg   2D-strukturformler i husstilen (samma som kol-kapitlet)
  images/kemi/atomer/atommodeller/*.svg             förenklade atommodeller (väte, helium, kol) + atomnyckel
  images/kemi/atomer/kulmodeller/<nyckel>.png       statiska kulmodeller (reserv utan JavaScript + dra-och-släpp-övningar)

Ny molekyl: lägg en rad i MOLS nedan (atomer i Å, bindningar som (i, j, ordning), 1-indexerat), kör skriptet,
läs utskriften från check_geometry (bindningslängder/vinklar ska stämma med kända värden), titta på PNG:en.
Dubbel-/trippelbindningar (ordning >= 2) skrivs INTE in i molblocket – de ritas av molviewer.js som utåtböjda
bågar (se regel 9 i kulmodeller3d.py). Valfri `rot` (grader) vrider bågarnas plan runt bindningsaxeln.
"""
import json, math, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))                          # chembuilder.py
sys.path.insert(0, str(HERE.parent / 'statiska-kulmodeller'))  # _server.py
from chembuilder import write_molblock, check_geometry         # noqa: E402

IMG = REPO / 'images/kemi/atomer'
JS_OUT = REPO / 'kemi/atomer/js/molmodeller.js'

# --------------------------------------------------------------------------------------------------
# 1. Molekyler: geometri (Å, gasfas-värden ur NIST/CRC) – atomer, bindningar, vy, 2D-ritning, texter
# --------------------------------------------------------------------------------------------------
def diatom(a, b, d):
    return [(a, -d / 2, 0.0, 0.0), (b, d / 2, 0.0, 0.0)]

def water():
    d, ang = 0.9572, math.radians(104.52) / 2
    return [('O', 0.0, 0.0, 0.0), ('H', d * math.sin(ang), -d * math.cos(ang), 0.0), ('H', -d * math.sin(ang), -d * math.cos(ang), 0.0)]

def ammonia():
    d, hnh = 1.012, math.radians(106.7)
    cb2 = (math.cos(hnh) + 0.5) / 1.5                          # cos^2(beta), beta = vinkeln mellan N-H och C3-axeln
    beta = math.acos(math.sqrt(cb2))
    atoms = [('N', 0.0, 0.0, 0.0)]
    for k in range(3):
        phi = math.radians(90 + 120 * k)
        atoms.append(('H', d * math.sin(beta) * math.cos(phi), -d * math.cos(beta), d * math.sin(beta) * math.sin(phi)))
    return atoms

def methane():
    d = 1.087 / math.sqrt(3)
    return [('C', 0, 0, 0), ('H', d, d, d), ('H', d, -d, -d), ('H', -d, d, -d), ('H', -d, -d, d)]

def co2():
    return [('C', 0.0, 0.0, 0.0), ('O', 1.162, 0.0, 0.0), ('O', -1.162, 0.0, 0.0)]

# key: dict(namn, formel (html), atoms, bonds, rot{(i,j):grader}, view(rotX, rotY), struct(2D), form (text), alt3d, alt2d)
MOLS = {
    'h2': dict(namn='Vätgas', formel='H<sub>2</sub>', atoms=diatom('H', 'H', 0.741), bonds=[(1, 2, 1)], view=(-25, 0),
               form='rak', bindning='enkelbindning',
               alt3d='Kulmodell av vätgas: två små vita väteatomer (H) som sitter ihop med en enkel bindning.',
               alt2d='Strukturformel för vätgas: H–H, två väteatomer med ett enkelt streck emellan.'),
    'cl2': dict(namn='Klorgas', formel='Cl<sub>2</sub>', atoms=diatom('Cl', 'Cl', 1.988), bonds=[(1, 2, 1)], view=(-25, 0),
                form='rak', bindning='enkelbindning',
                alt3d='Kulmodell av klorgas: två gröna kloratomer (Cl) som sitter ihop med en enkel bindning.',
                alt2d='Strukturformel för klorgas: Cl–Cl, två kloratomer med ett enkelt streck emellan.'),
    'o2': dict(namn='Syrgas', formel='O<sub>2</sub>', atoms=diatom('O', 'O', 1.208), bonds=[(1, 2, 2)], view=(-25, 0),
               form='rak', bindning='dubbelbindning',
               alt3d='Kulmodell av syrgas: två röda syreatomer (O) som sitter ihop med en dubbelbindning, ritad som två utåtböjda pinnar.',
               alt2d='Strukturformel för syrgas: O=O, två syreatomer med ett dubbelt streck emellan.'),
    'n2': dict(namn='Kvävgas', formel='N<sub>2</sub>', atoms=diatom('N', 'N', 1.098), bonds=[(1, 2, 3)], view=(-25, 0),
               form='rak', bindning='trippelbindning',
               alt3d='Kulmodell av kvävgas: två blå kväveatomer (N) som sitter ihop med en trippelbindning, ritad som tre utåtböjda pinnar.',
               alt2d='Strukturformel för kvävgas: N≡N, två kväveatomer med ett tredubbelt streck emellan.'),
    'hcl': dict(namn='Väteklorid', formel='HCl', atoms=diatom('H', 'Cl', 1.275), bonds=[(1, 2, 1)], view=(-25, 0),
                form='rak', bindning='enkelbindning',
                alt3d='Kulmodell av väteklorid: en liten vit väteatom (H) och en stor grön kloratom (Cl) med en enkel bindning.',
                alt2d='Strukturformel för väteklorid: H–Cl.'),
    'h2o': dict(namn='Vatten', formel='H<sub>2</sub>O', atoms=water(), bonds=[(1, 2, 1), (1, 3, 1)], view=(-20, 0),
                form='vinklad', bindning='två enkelbindningar',
                alt3d='Kulmodell av vatten: en röd syreatom (O) med två vita väteatomer (H) i en vinkel på ungefär 105 grader.',
                alt2d='Strukturformel för vatten: en syreatom med två väteatomer, ritad vinklad som ett V.'),
    'co2': dict(namn='Koldioxid', formel='CO<sub>2</sub>', atoms=co2(), bonds=[(1, 2, 2), (1, 3, 2)], rot={(1, 3): 90}, view=(-20, 35),
                form='rak', bindning='två dubbelbindningar',
                alt3d='Kulmodell av koldioxid: en svart kolatom (C) i mitten med en röd syreatom (O) på varje sida i en rak linje, med dubbelbindningar åt båda håll.',
                alt2d='Strukturformel för koldioxid: O=C=O, kolatomen i mitten med dubbla streck åt varje syreatom.'),
    'nh3': dict(namn='Ammoniak', formel='NH<sub>3</sub>', atoms=ammonia(), bonds=[(1, 2, 1), (1, 3, 1), (1, 4, 1)], view=(-35, 20),
                form='pyramid', bindning='tre enkelbindningar',
                alt3d='Kulmodell av ammoniak: en blå kväveatom (N) med tre vita väteatomer (H) under sig, som en låg pyramid.',
                alt2d='Strukturformel för ammoniak: en kväveatom med tre väteatomer.'),
    'ch4': dict(namn='Metan', formel='CH<sub>4</sub>', atoms=methane(), bonds=[(1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1)], view=(-25, 0),
                form='tetraeder', bindning='fyra enkelbindningar',
                alt3d='Kulmodell av metan: en svart kolatom (C) med fyra vita väteatomer (H) jämnt fördelade i rymden.',
                alt2d='Strukturformel för metan: en kolatom med fyra väteatomer, en åt varje håll.'),
}

# 2D-strukturformler: atomer som (grundämne, kolumn, rad) + bindningar (i, j, ordning), 0-indexerat
_h, _s = 52.25 * math.pi / 180, None
STRUCT = {
    'h2': ([('H', 0, 0), ('H', 1, 0)], [(0, 1, 1)]),
    'cl2': ([('Cl', 0, 0), ('Cl', 1, 0)], [(0, 1, 1)]),
    'o2': ([('O', 0, 0), ('O', 1, 0)], [(0, 1, 2)]),
    'n2': ([('N', 0, 0), ('N', 1, 0)], [(0, 1, 3)]),
    'hcl': ([('H', 0, 0), ('Cl', 1, 0)], [(0, 1, 1)]),
    'co2': ([('O', 0, 0), ('C', 1, 0), ('O', 2, 0)], [(0, 1, 2), (1, 2, 2)]),
    'h2o': ([('O', 0, 0), ('H', -math.sin(_h), math.cos(_h)), ('H', math.sin(_h), math.cos(_h))], [(0, 1, 1), (0, 2, 1)]),
    'nh3': ([('N', 0, 0), ('H', -1, 0), ('H', 1, 0), ('H', 0, 1)], [(0, 1, 1), (0, 2, 1), (0, 3, 1)]),
    'ch4': ([('C', 0, 0), ('H', 0, -1), ('H', 0, 1), ('H', -1, 0), ('H', 1, 0)], [(0, 1, 1), (0, 2, 1), (0, 3, 1), (0, 4, 1)]),
}
VALENS = {'H': 1, 'C': 4, 'N': 3, 'O': 2, 'Cl': 1}

# husstil (samma värden som tools/kemi-ritverktyg/strukturformler.js)
INK, STEP, G, FS, STROKE, PAD = '#14213d', 35, 11, 21, 1.25, 26

def struct_svg(atoms, bonds):
    cols = [a[1] for a in atoms]; rows = [a[2] for a in atoms]
    minc, maxc, minr, maxr = min(cols), max(cols), min(rows), max(rows)
    ox, oy = PAD - minc * STEP, PAD - minr * STEP
    X = lambda a: ox + a[1] * STEP
    Y = lambda a: oy + a[2] * STEP
    lines = []
    for i, j, order in bonds:
        a1, a2 = atoms[i], atoms[j]
        x1, y1, x2, y2 = X(a1), Y(a1), X(a2), Y(a2)
        dx, dy = x2 - x1, y2 - y1
        ln = math.hypot(dx, dy); ux, uy = dx / ln, dy / ln
        x1 += ux * G; y1 += uy * G; x2 -= ux * G; y2 -= uy * G
        px, py = -uy, ux
        offs = {1: [0], 2: [-3.5, 3.5], 3: [-6, 0, 6]}[order]
        for o in offs:
            lines.append(f'<line x1="{x1 + px * o:.1f}" y1="{y1 + py * o:.1f}" x2="{x2 + px * o:.1f}" y2="{y2 + py * o:.1f}"/>')
    txt = ''.join(f'<text x="{X(a):.1f}" y="{Y(a):.1f}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="{FS}" fill="{INK}">{a[0]}</text>' for a in atoms)
    w, h = (maxc - minc) * STEP + 2 * PAD, (maxr - minr) * STEP + 2 * PAD
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" width="{w:.1f}" height="{h:.1f}">'
            f'<g stroke="{INK}" stroke-width="{STROKE}" stroke-linecap="round">{"".join(lines)}</g>{txt}</svg>')

def valence_check(key, atoms, bonds):
    s = [0] * len(atoms)
    for i, j, o in bonds:
        s[i] += o; s[j] += o
    for k, (el, *_r) in enumerate(atoms):
        if s[k] != VALENS[el]:
            raise SystemExit(f'VALENS {key}: {el} (atom {k}) har {s[k]} bindningar, ska ha {VALENS[el]}')

# --------------------------------------------------------------------------------------------------
# 2. Atommodeller (förenklade "kärna + elektroner"-bilder) och atomnyckel (bollar med bokstav)
# --------------------------------------------------------------------------------------------------
BALL = {  # fyllning, kant, bokstavsfärg  (bokstav + färg: aldrig bara färg; kontrast bokstav/fyllning >= 4,5:1)
    'H': ('#ffffff', '#444444', '#111111', 'Väte'),
    'C': ('#4d4d4d', '#222222', '#ffffff', 'Kol'),
    'O': ('#e01010', '#8a0a0a', '#ffffff', 'Syre'),
    'N': ('#3050f8', '#1a2fa8', '#ffffff', 'Kväve'),
    'Cl': ('#22b422', '#137013', '#111111', 'Klor'),
}

def atom_svg(protons, neutrons, shells, label):
    """Förenklad atommodell: kärna med protoner (+) och neutroner (n), elektroner (−) på skal. Ej skalenlig."""
    n = protons + neutrons
    rmax_nuc = 7.4 * math.sqrt(max(n - 1, 0)) + 7
    shell_r = [rmax_nuc + 26 + 26 * k for k in range(len(shells))]
    R = shell_r[-1] + 14
    size = 2 * R
    cx = cy = R
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size:.0f} {size:.0f}" width="{size * 1.5:.0f}" height="{size * 1.5:.0f}" role="img" aria-label="{label}">']
    for r in shell_r:
        out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="#777" stroke-width="1" stroke-dasharray="3 3"/>')
    # kärna: solrosspiral, protoner och neutroner omväxlande så att de blandas
    kinds = ['p'] * protons + ['n'] * neutrons
    order = []
    ip, in_ = 0, 0
    while ip < protons or in_ < neutrons:
        if ip < protons: order.append('p'); ip += 1
        if in_ < neutrons: order.append('n'); in_ += 1
    for k, kind in enumerate(order):
        r = 7.4 * math.sqrt(k); a = k * 2.399963
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        if kind == 'p':
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6.6" fill="#ffffff" stroke="#14213d" stroke-width="1.4"/>'
                       f'<path d="M{x-3:.1f} {y:.1f}h6M{x:.1f} {y-3:.1f}v6" stroke="#14213d" stroke-width="1.4" stroke-linecap="round"/>')
        else:
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6.6" fill="#c9ccd6" stroke="#14213d" stroke-width="1.4"/>'
                       f'<text x="{x:.1f}" y="{y+0.5:.1f}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="9" font-weight="700" fill="#14213d">n</text>')
    # elektroner
    for r, cnt in zip(shell_r, shells):
        for k in range(cnt):
            a = -math.pi / 2 + 2 * math.pi * k / cnt + (0.6 if r != shell_r[0] else 0.3)
            x, y = cx + r * math.cos(a), cy + r * math.sin(a)
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6" fill="#14213d"/><path d="M{x-3:.1f} {y:.1f}h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>')
    out.append('</svg>')
    return ''.join(out)

ATOMS = {
    'atom-vate': (1, 0, [1], 'Atommodell av väte: en proton i kärnan och en elektron på det inre skalet.'),
    'atom-helium': (2, 2, [2], 'Atommodell av helium: två protoner och två neutroner i kärnan och två elektroner på det inre skalet.'),
    'atom-kol': (6, 6, [2, 4], 'Atommodell av kol: sex protoner och sex neutroner i kärnan, två elektroner på inre skalet och fyra på yttre skalet.'),
}

def atomnyckel_svg():
    keys = ['H', 'C', 'O', 'N', 'Cl']
    w = 62 * len(keys)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} 92" width="{w}" height="92" role="img" aria-label="Atomnyckel: väte (H, vit), kol (C, svart), syre (O, röd), kväve (N, blå) och klor (Cl, grön).">']
    for k, el in enumerate(keys):
        fill, stroke, ink, namn = BALL[el]
        cx = 31 + 62 * k
        out.append(f'<circle cx="{cx}" cy="30" r="24" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
        out.append(f'<text x="{cx}" y="31" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="{ink}">{el}</text>')
        out.append(f'<text x="{cx}" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#14213d">{namn.lower()}</text>')
    out.append('</svg>')
    return ''.join(out)

# --------------------------------------------------------------------------------------------------
# 3. Skriv ut allt
# --------------------------------------------------------------------------------------------------
def build_data():
    mols, multi, view, info = {}, {}, {}, {}
    for key, m in MOLS.items():
        atoms, bonds = m['atoms'], m['bonds']
        lengths, angles = check_geometry(atoms, bonds)
        print(f'{key:5s} längder {{{", ".join(f"{k}: {a:.3f}" for k, (a, b) in lengths.items())}}}'
              f'  vinklar {{{", ".join(f"{k}: {a:.1f}" for k, (a, b) in angles.items())}}}')
        single = [(i, j, o) for i, j, o in bonds if o == 1]
        mols[key] = write_molblock(atoms, single, title=m['namn'])
        specs = []
        for i, j, o in bonds:
            if o >= 2:
                spec = {'a': [round(float(v), 4) for v in atoms[i - 1][1:]], 'b': [round(float(v), 4) for v in atoms[j - 1][1:]], 'order': o}
                rot = m.get('rot', {}).get((i, j))
                if rot: spec['rot'] = rot
                specs.append(spec)
        if specs: multi[key] = specs
        view[key] = list(m['view'])
        info[key] = {k: m[k] for k in ('namn', 'formel', 'form', 'bindning', 'alt3d', 'alt2d')}
    return {'mols': mols, 'multi': multi, 'style': {}, 'view': view, 'info': info}

def write_all():
    (IMG / 'strukturformler').mkdir(parents=True, exist_ok=True)
    (IMG / 'atommodeller').mkdir(parents=True, exist_ok=True)
    for key, (atoms, bonds) in STRUCT.items():
        valence_check(key, atoms, bonds)
        (IMG / 'strukturformler' / f'{key}.svg').write_text(struct_svg(atoms, bonds), encoding='utf-8')
    for key, (p, n, sh, label) in ATOMS.items():
        (IMG / 'atommodeller' / f'{key}.svg').write_text(atom_svg(p, n, sh, label), encoding='utf-8')
    (IMG / 'atommodeller' / 'atomnyckel.svg').write_text(atomnyckel_svg(), encoding='utf-8')
    data = build_data()
    JS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_OUT.write_text('/* Auto-genererad av tools/kemi-ritverktyg/atomer/bygg_atomer.py – redigera inte för hand (kör skriptet igen). */\n'
                      'window.MOLDATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('skrev', JS_OUT.relative_to(REPO), 'och', len(STRUCT), 'strukturformler +', len(ATOMS) + 1, 'atombilder')
    return data

def write_png(data, only=None):
    from playwright.sync_api import sync_playwright
    import _server as S
    out = IMG / 'kulmodeller'
    out.mkdir(parents=True, exist_ok=True)
    ppa = 40
    srv = S.start_server(8767)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8767)
        for key in only or data['mols']:
            im = S.render(pg, data['mols'][key], data['multi'].get(key, []), tuple(data['view'][key]), ppa)
            im.save(out / f'{key}.png', optimize=True)
            print(f'{key:5s} {im.width}x{im.height}px -> width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()

if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    d = write_all()
    if what in ('all', 'png'):
        write_png(d, sys.argv[2:] or None)
