#!/usr/bin/env python3
"""Bygger bild- och modellmaterial till kemi/syror-och-baser (Syror och baser).

Kör (från repots rot eller var som helst):
    python3 tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py            # allt (data, SVG och PNG-reserver)
    python3 tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py data       # bara js/molmodeller.js + SVG:er
    python3 tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py png [nyckel…]   # bara kulmodell-PNG:erna (playwright + pillow + chromium)
    python3 tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py kort <nyckel>   # skriver ut kortets HTML (klistra in i studieguiden)

Skriver:
  kemi/syror-och-baser/js/molmodeller.js               window.MOLDATA (molblock, dubbelbindningar, vyer, texter) för js/molviewer.js
  images/kemi/syror-och-baser/strukturformler/*.svg    2D-strukturformler i husstilen (samma stil som atomer och kol)
  images/kemi/syror-och-baser/jonkort/*.svg            jonrader för jonföreningar (NaOH, Ca(OH)2, Na2CO3)
  images/kemi/syror-och-baser/kulmodeller/*.png        statiska kulmodeller (reserv utan JavaScript)
  images/kemi/syror-och-baser/ph-skala.svg             pH-skalan (siffror + form + text, aldrig bara färg)

Molekyler som redan finns i Atomer och molekyler (HCl, Cl2, H2O, NH3, CO2) hämtas ur tools/kemi-ritverktyg/atomer/bygg_atomer.py
och återanvänder atomer-kapitlets bilder. Etansyra byggs med chembuilder.build_acid(2) (samma som kolkapitlet).

REGLER (beslut Jesper 21 sep 2026):
  * Jonföreningar (NaOH, Ca(OH)2, Na2CO3) är INTE molekyler: de får jonkort (jonrad), aldrig kulmodell och aldrig "molekylformel".
  * Joner med delokaliserade bindningar (sulfat, nitrat) ritas som lika långa pinnar utan dubbelbågar; laddningen sitter på hela jonen.
  * Salpetersyra skrivs med formella laddningar (N+, O−) i 2D; det förklaras i en fördjupningsruta i studieguiden.
  * Geometrin är handbyggd med värden ur NIST/CRC (gasfas); check_geometry skrivs ut vid varje körning.
"""
import io, json, math, sys
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))                          # chembuilder.py
sys.path.insert(0, str(HERE.parent / 'statiska-kulmodeller'))  # _server.py
sys.path.insert(0, str(HERE.parent / 'atomer'))                # bygg_atomer.py
from chembuilder import write_molblock, check_geometry, build_acid   # noqa: E402
import bygg_atomer as A                                        # noqa: E402

IMG = REPO / 'images/kemi/syror-och-baser'
JS_OUT = REPO / 'kemi/syror-och-baser/js/molmodeller.js'
A.VALENS.update({'S': 6, 'S4': 4, 'N+': 4, 'O-': 1})           # S: 6 bindningar i H2SO4/SO3, 4 i SO2 (etiketten 'S4'); formella laddningar N+/O-
DISPLAY = {'S4': 'S', 'N+': 'N', 'O-': 'O'}

# --------------------------------------------------------------------------------------------------
# 1. Geometri (Å, grader) – handbyggda molekyler
# --------------------------------------------------------------------------------------------------
def unit(v):
    v = np.array(v, float)
    return v / np.linalg.norm(v)

def place_h(o, partner, ref, d=0.96, ang=108.5):
    """H på syret o (bundet till partner). Azimut väljs med ref: H hamnar på ref-sidan av O–partner-axeln."""
    o, partner = np.array(o, float), np.array(partner, float)
    u = unit(partner - o)
    r = np.array(ref, float) - np.dot(ref, u) * u
    r = unit(r)
    a = math.radians(ang)
    return tuple(o + d * (math.cos(a) * u + math.sin(a) * r))

def rot2(v, deg):
    a = math.radians(deg)
    return np.array([v[0] * math.cos(a) - v[1] * math.sin(a), v[0] * math.sin(a) + v[1] * math.cos(a), 0.0])

def sulfuric_acid():
    a, b = math.radians(119.0 / 2), math.radians(101.0 / 2)      # O=S=O 119°, HO–S–OH 101° (gasfas)
    S = np.zeros(3)
    o1 = 1.422 * np.array([math.sin(a), 0, math.cos(a)])
    o2 = 1.422 * np.array([-math.sin(a), 0, math.cos(a)])
    oh1 = 1.574 * np.array([0, math.sin(b), -math.cos(b)])
    oh2 = 1.574 * np.array([0, -math.sin(b), -math.cos(b)])
    h1 = place_h(oh1, S, (1, 0, 0), 0.97, 108.5)
    h2 = place_h(oh2, S, (-1, 0, 0), 0.97, 108.5)
    return [('S', *S), ('O', *o1), ('O', *o2), ('O', *oh1), ('O', *oh2), ('H', *h1), ('H', *h2)]

def nitric_acid():
    N = np.zeros(3)
    o_h = np.array([0, -1.406, 0])                                  # N–OH 1,406
    d1 = rot2(np.array([0, -1.0, 0]), -114.0)                       # O–N–OH ≈ 114–116°
    d2 = rot2(np.array([0, -1.0, 0]), 114.0)
    o_a, o_b = 1.199 * d1, 1.211 * d2                               # N=O 1,199 / 1,211
    h = place_h(o_h, N, o_a, 0.96, 102.0)                           # H syn mot ena N–O
    return [('N', *N), ('O', *o_h), ('O', *o_a), ('O', *o_b), ('H', *h)]

def carbonic_acid():
    C = np.zeros(3)
    o_d = np.array([0, 1.207, 0])                                   # C=O
    dl, dr = rot2(np.array([0, 1.0, 0]), 125.0), rot2(np.array([0, 1.0, 0]), -125.0)
    o_l, o_r = 1.351 * dl, 1.351 * dr                                # C–OH
    h_l = place_h(o_l, C, (-1, -0.2, 0), 0.97, 107.0)
    h_r = place_h(o_r, C, (1, -0.2, 0), 0.97, 107.0)
    return [('C', *C), ('O', *o_d), ('O', *o_l), ('O', *o_r), ('H', *h_l), ('H', *h_r)]

def sulfur_dioxide():
    a = math.radians(119.3 / 2)
    return [('S', 0.0, 0.0, 0.0), ('O', 1.431 * math.sin(a), -1.431 * math.cos(a), 0.0), ('O', -1.431 * math.sin(a), -1.431 * math.cos(a), 0.0)]

def sulfur_trioxide():
    return [('S', 0.0, 0.0, 0.0)] + [('O', *(1.418 * rot2(np.array([0, 1.0, 0]), k * 120.0))) for k in range(3)]

def sulfate():
    d = 1.49 / math.sqrt(3)                                          # tetraeder, S–O 1,49
    return [('S', 0.0, 0.0, 0.0), ('O', d, d, d), ('O', d, -d, -d), ('O', -d, d, -d), ('O', -d, -d, d)]

def nitrate():
    return [('N', 0.0, 0.0, 0.0)] + [('O', *(1.25 * rot2(np.array([0, 1.0, 0]), k * 120.0))) for k in range(3)]

def hydroxide():
    return [('O', 0.0, 0.0, 0.0), ('H', 0.964, 0.0, 0.0)]

def ethanoic():
    atoms, bonds = build_acid(2)
    return atoms, bonds


def auto_view(atoms, bonds):
    """Väljer vy (rotX, rotY) så att inga atomer skymmer varandra och inga bindningar förkortas för mycket.
    3Dmols rotate(a,'x') följt av rotate(b,'y'): y' = y·cos a − z·sin a, z' = y·sin a + z·cos a, x'' = x·cos b + z'·sin b (kalibrerat mot 3Dmol)."""
    P = np.array([[x, y, z] for _, x, y, z in atoms])
    P = P - P.mean(axis=0)
    bonded = {(min(i, j) - 1, max(i, j) - 1) for i, j, _ in bonds}
    best, best_v = -1e9, (-25, 0)
    for a in range(-60, 61, 5):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        for b in range(-70, 71, 5):
            cb, sb = math.cos(math.radians(b)), math.sin(math.radians(b))
            y1 = P[:, 1] * ca - P[:, 2] * sa
            z1 = P[:, 1] * sa + P[:, 2] * ca
            X = P[:, 0] * cb + z1 * sb
            Y = y1
            nb_min, b_min = 9.0, 9.0
            for i in range(len(P)):
                for j in range(i + 1, len(P)):
                    d = math.hypot(X[i] - X[j], Y[i] - Y[j])
                    if (i, j) in bonded:
                        b_min = min(b_min, d / max(np.linalg.norm(P[i] - P[j]), 1e-6))
                    else:
                        nb_min = min(nb_min, d)
            score = min(nb_min / 1.5, 1.0) + min(b_min / 0.65, 1.0) - 0.004 * abs(a + 25)
            if score > best:
                best, best_v = score, (a, b)
    return best_v

# key: dict(namn, formel, atoms, bonds, rot, view, form, bindning, alt3d, alt2d)
def _new():
    M = {}
    M['h2so4'] = dict(namn='Svavelsyra', formel='H<sub>2</sub>SO<sub>4</sub>', atoms=sulfuric_acid(),
                      bonds=[(1, 2, 2), (1, 3, 2), (1, 4, 1), (1, 5, 1), (4, 6, 1), (5, 7, 1)], view='auto',
                      form='tetraeder (förvriden)', bindning='två dubbelbindningar (S=O) och två enkelbindningar (S–OH)',
                      alt3d='Kulmodell av svavelsyra: en gul svavelatom (S) i mitten med två röda syreatomer (O) med dubbelbindningar och två syreatomer som var och en har en vit väteatom (H).',
                      alt2d='Strukturformel för svavelsyra: svavelatomen i mitten med dubbla streck upp och ned till varsin syreatom och enkla streck åt vänster och höger till varsin OH-grupp.')
    M['hno3'] = dict(namn='Salpetersyra', formel='HNO<sub>3</sub>', atoms=nitric_acid(),
                     bonds=[(1, 2, 1), (1, 3, 2), (1, 4, 1), (2, 5, 1)], rot={(1, 3): 90}, view=(-20, 30),
                     form='plan', bindning='en dubbelbindning och två enkelbindningar kring kvävet (N–OH, N=O, N–O⁻)',
                     alt3d='Kulmodell av salpetersyra: en blå kväveatom (N) i mitten av en platt figur med tre röda syreatomer (O), varav en har en vit väteatom (H).',
                     alt2d='Strukturformel för salpetersyra: kväveatomen med plustecken i mitten, en OH-grupp åt vänster, en dubbelbunden syreatom uppåt och en syreatom med minustecken nedåt.')
    M['h2co3'] = dict(namn='Kolsyra', formel='H<sub>2</sub>CO<sub>3</sub>', atoms=carbonic_acid(),
                      bonds=[(1, 2, 2), (1, 3, 1), (1, 4, 1), (3, 5, 1), (4, 6, 1)], rot={(1, 2): 90}, view=(-40, 0),
                      form='plan', bindning='en dubbelbindning (C=O) och två enkelbindningar (C–OH)',
                      alt3d='Kulmodell av kolsyra: en svart kolatom (C) i mitten av en platt figur med en dubbelbunden röd syreatom (O) och två syreatomer som var och en har en vit väteatom (H).',
                      alt2d='Strukturformel för kolsyra: kolatomen i mitten med en dubbelbunden syreatom uppåt och en OH-grupp åt vänster och en åt höger.')
    M['so2'] = dict(namn='Svaveldioxid', formel='SO<sub>2</sub>', atoms=sulfur_dioxide(),
                    bonds=[(1, 2, 2), (1, 3, 2)], rot={(1, 2): 90, (1, 3): 90}, view=(-30, 0),
                    form='vinklad', bindning='två dubbelbindningar',
                    alt3d='Kulmodell av svaveldioxid: en gul svavelatom (S) med två röda syreatomer (O) i en vinkel på ungefär 119 grader, med dubbelbindningar.',
                    alt2d='Strukturformel för svaveldioxid: en svavelatom med dubbla streck till två syreatomer, ritad vinklad som ett V.')
    M['so3'] = dict(namn='Svaveltrioxid', formel='SO<sub>3</sub>', atoms=sulfur_trioxide(),
                    bonds=[(1, 2, 2), (1, 3, 2), (1, 4, 2)], rot={(1, 2): 90, (1, 3): 90, (1, 4): 90}, view=(-45, 0),
                    form='plan triangel', bindning='tre dubbelbindningar',
                    alt3d='Kulmodell av svaveltrioxid: en gul svavelatom (S) i mitten av en platt figur med tre röda syreatomer (O) med 120 graders mellanrum, med dubbelbindningar.',
                    alt2d='Strukturformel för svaveltrioxid: en svavelatom med dubbla streck till tre syreatomer, jämnt fördelade i en triangel.')
    M['so4'] = dict(namn='Sulfatjon', formel='SO<sub>4</sub><sup>2−</sup>', atoms=sulfate(),
                    bonds=[(1, 2, 1), (1, 3, 1), (1, 4, 1), (1, 5, 1)], view='auto',
                    form='tetraeder', bindning='fyra lika bindningar',
                    alt3d='Kulmodell av sulfatjonen: en gul svavelatom (S) med fyra röda syreatomer (O) jämnt fördelade i rymden, som en tetraeder. Jonen har laddningen minus två.',
                    alt2d='')
    M['no3'] = dict(namn='Nitratjon', formel='NO<sub>3</sub><sup>−</sup>', atoms=nitrate(),
                    bonds=[(1, 2, 1), (1, 3, 1), (1, 4, 1)], view=(-45, 0),
                    form='plan triangel', bindning='tre lika bindningar',
                    alt3d='Kulmodell av nitratjonen: en blå kväveatom (N) i mitten av en platt figur med tre röda syreatomer (O) med 120 graders mellanrum. Jonen har laddningen minus ett.',
                    alt2d='')
    M['oh'] = dict(namn='Hydroxidjon', formel='OH<sup>−</sup>', atoms=hydroxide(),
                   bonds=[(1, 2, 1)], view=(-25, 0),
                   form='rak', bindning='enkelbindning',
                   alt3d='Kulmodell av hydroxidjonen: en röd syreatom (O) och en vit väteatom (H) med en enkel bindning. Jonen har laddningen minus ett.',
                   alt2d='')
    at, bo = ethanoic()
    M['etansyra'] = dict(namn='Ättiksyra (etansyra)', formel='CH<sub>3</sub>COOH', atoms=at, bonds=bo, view='auto',
                         form='kedja med karboxylgrupp', bindning='en dubbelbindning (C=O) och övriga enkelbindningar',
                         alt3d='Kulmodell av ättiksyra: två svarta kolatomer (C), tre vita väteatomer (H) på den ena kolatomen, samt en karboxylgrupp med en dubbelbunden röd syreatom (O) och en OH-grupp.',
                         alt2d='Strukturformel för ättiksyra: en CH3-grupp bunden till en kolatom som har en dubbelbunden syreatom och en OH-grupp.')
    return M

MOLS = _new()
for _k, _m in MOLS.items():
    if _m['view'] == 'auto':
        _m['view'] = auto_view(_m['atoms'], _m['bonds'])
        print('auto_view', _k, _m['view'])
# återanvänd från atomer (samma nycklar, samma bilder)
for _k in ('hcl', 'cl2', 'h2o', 'nh3', 'co2'):
    MOLS[_k] = A.MOLS[_k]
FROM_ATOMER = ('hcl', 'cl2', 'h2o', 'nh3', 'co2')

# 2D-strukturformler (grid som i atomer): atomer (etikett, kol, rad), bindningar (i, j, ordning)
_v = 59.65 * math.pi / 180
STRUCT = {
    'h2so4': ([('S', 0, 0), ('O', 0, -1), ('O', 0, 1), ('O', -1, 0), ('O', 1, 0), ('H', -2, 0), ('H', 2, 0)],
              [(0, 1, 2), (0, 2, 2), (0, 3, 1), (0, 4, 1), (3, 5, 1), (4, 6, 1)]),
    'hno3': ([('N+', 1, 0), ('O', 0, 0), ('O', 1, -1), ('O-', 1, 1), ('H', -1, 0)],
             [(0, 1, 1), (0, 2, 2), (0, 3, 1), (1, 4, 1)]),
    'h2co3': ([('C', 0, 0), ('O', 0, -1), ('O', -1, 0), ('O', 1, 0), ('H', -2, 0), ('H', 2, 0)],
              [(0, 1, 2), (0, 2, 1), (0, 3, 1), (2, 4, 1), (3, 5, 1)]),
    'etansyra': ([('C', 0, 0), ('C', 1, 0), ('O', 1, -1), ('O', 2, 0), ('H', 3, 0), ('H', -1, 0), ('H', 0, -1), ('H', 0, 1)],
                 [(0, 1, 1), (1, 2, 2), (1, 3, 1), (3, 4, 1), (0, 5, 1), (0, 6, 1), (0, 7, 1)]),
    'so2': ([('S4', 0, 0), ('O', -math.sin(_v), math.cos(_v)), ('O', math.sin(_v), math.cos(_v))], [(0, 1, 2), (0, 2, 2)]),
    'so3': ([('S', 0, 0), ('O', 0, -1), ('O', -math.cos(math.radians(30)), 0.5), ('O', math.cos(math.radians(30)), 0.5)],
            [(0, 1, 2), (0, 2, 2), (0, 3, 2)]),
}
LABEL_CHARGE = {'N+': 'N<tspan dx="2" dy="-8" font-size="14">+</tspan>', 'O-': 'O<tspan dx="2" dy="-8" font-size="14">−</tspan>'}

def struct_svg(key):
    atoms, bonds = STRUCT[key]
    A.valence_check(key, atoms, bonds)
    svg = A.struct_svg([(DISPLAY.get(a[0], a[0]), a[1], a[2]) for a in atoms], bonds)
    # ersätt etiketterna för laddade atomer (N+, O−) med text med upphöjt tecken
    for i, a in enumerate(atoms):
        if a[0] in LABEL_CHARGE:
            parts = svg.split('<text')
            seg = parts[i + 1]
            head, rest = seg.split('>', 1)
            body, tail = rest.split('</text>', 1)
            parts[i + 1] = head + '>' + LABEL_CHARGE[a[0]] + '</text>' + tail
            svg = '<text'.join(parts)
    return svg

# citronsyra: bara strukturformel (för stor för en bra kulmodell) – halvutvecklad, grupper som i kolkapitlets glykol/glycerol
def citric_svg():
    INK, FS = '#14213d', 21
    W, H = 420, 250
    y0 = 105
    def txt(x, y, s):
        return f'<text x="{x}" y="{y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="{FS}" fill="{INK}">{s}</text>'
    ch2 = 'CH<tspan dy="6" font-size="14">2</tspan>'
    body = (txt(40, y0, 'HOOC') + txt(120, y0, ch2) + txt(200, y0, 'C') + txt(280, y0, ch2) + txt(368, y0, 'COOH')
            + txt(200, y0 - 60, 'OH') + txt(200, y0 + 60, 'COOH'))
    segs = [(76, y0, 96, y0), (144, y0, 190, y0), (211, y0, 256, y0), (304, y0, 332, y0), (200, y0 - 12, 200, y0 - 60 + 14), (200, y0 + 12, 200, y0 + 60 - 16)]
    lines = ''.join(f'<line x1="{a}" y1="{b}" x2="{c}" y2="{d}"/>' for a, b, c, d in segs)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<g stroke="{INK}" stroke-width="1.25" stroke-linecap="round">{lines}</g>{body}</svg>')

# --------------------------------------------------------------------------------------------------
# 2. Jonkort (jonföreningar är inte molekyler): jonrad med form + tecken + text
# --------------------------------------------------------------------------------------------------
def _tsp(markup):
    """'CO|3|2−' -> tspan med index respektive upphöjt (markup: lista av (text, läge))."""
    out = ''
    for t, mode in markup:
        if mode == 'sub': out += f'<tspan dy="6" font-size="13">{t}</tspan><tspan dy="-6"></tspan>'
        elif mode == 'sup': out += f'<tspan dy="-9" font-size="14">{t}</tspan><tspan dy="9"></tspan>'
        else: out += t
    return out

def jon_svg(ions, desc):
    """ions: lista av (markup, positiv?, bredd). Katjon = cirkel (blå ton), anjon = rundad ruta (orange ton) – form och tecken bär informationen."""
    INK = '#14213d'
    gap, r = 6, 32
    total = sum(w for _, _, w in ions) + gap * (len(ions) - 1)
    W, H = total + 24, 2 * r + 24
    x = 12
    parts = []
    for markup, pos, w in ions:
        cxp, cyp = x + w / 2, 12 + r
        if pos:
            parts.append(f'<circle cx="{cxp}" cy="{cyp}" r="{r}" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5"/>')
        else:
            parts.append(f'<rect x="{x}" y="{cyp - r}" width="{w}" height="{2 * r}" rx="14" fill="#ffedd5" stroke="#9a3412" stroke-width="2.5" stroke-dasharray="7 4"/>')
        parts.append(f'<text x="{cxp}" y="{cyp}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="{INK}">{_tsp(markup)}</text>')
        x += w + gap
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{desc}">'
            + ''.join(parts) + '</svg>')

JONKORT = {
    'naoh': dict(namn='Natriumhydroxid', formel='NaOH', ratio='1 Na⁺ : 1 OH⁻',
                 ions=[([('Na', None), ('+', 'sup')], True, 64), ([('OH', None), ('−', 'sup')], False, 82)],
                 alt='Natriumhydroxid består av en natriumjon Na plus, ritad som en blå cirkel, och en hydroxidjon OH minus, ritad som en orange streckad ruta.'),
    'caoh2': dict(namn='Kalciumhydroxid', formel='Ca(OH)<sub>2</sub>', ratio='1 Ca²⁺ : 2 OH⁻',
                  ions=[([('OH', None), ('−', 'sup')], False, 82), ([('Ca', None), ('2+', 'sup')], True, 70), ([('OH', None), ('−', 'sup')], False, 82)],
                  alt='Kalciumhydroxid består av en kalciumjon Ca två plus, ritad som en blå cirkel, och två hydroxidjoner OH minus, ritade som orange streckade rutor.'),
    'na2co3': dict(namn='Natriumkarbonat (soda)', formel='Na<sub>2</sub>CO<sub>3</sub>', ratio='2 Na⁺ : 1 CO₃²⁻',
                   ions=[([('Na', None), ('+', 'sup')], True, 64), ([('CO', None), ('3', 'sub'), ('2−', 'sup')], False, 96), ([('Na', None), ('+', 'sup')], True, 64)],
                   alt='Natriumkarbonat består av två natriumjoner Na plus, ritade som blå cirklar, och en karbonatjon CO tre två minus, ritad som en orange streckad ruta.'),
}

# --------------------------------------------------------------------------------------------------
# 3. pH-skalan: infogram med siffror, form och text (aldrig bara färg; orange–blå-skala som är säker vid rödgrön färgblindhet)
# --------------------------------------------------------------------------------------------------
def ph_svg():
    W, H = 900, 350
    x0, cw = 40, 820 / 15                                       # 15 rutor (pH 0–14)
    ybar, hbar = 140, 46
    INK = '#14213d'
    # orange (surt) -> ljust (neutralt) -> blått (basiskt)
    acid = ['#9a3412', '#c2410c', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa']
    base = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
    fills = acid + ['#f3f4f6'] + base
    inks = ['#ffffff'] * 4 + [INK] * 8 + ['#ffffff'] * 3
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 65 {W} 235" role="img" aria-label="pH-skalan från 0 till 14. Under 7 är lösningen sur, 7 är neutralt och över 7 är lösningen basisk. Exempel: saltsyra ungefär 0, magsaft 1 till 2, citron ungefär 2, cola och läsk 2,5 till 3, surt regn ungefär 5, rent vatten 7, bakpulver 8 till 9, hushållsammoniak ungefär 11 och natronlut ungefär 14.">',
         '<defs>'
         '<pattern id="ph-str" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/></pattern>'
         '<pattern id="ph-pri" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.5" fill="#ffffff" fill-opacity="0.45"/></pattern>'
         '</defs>']
    for i in range(15):
        x = x0 + i * cw
        o.append(f'<rect x="{x:.1f}" y="{ybar}" width="{cw:.1f}" height="{hbar}" fill="{fills[i]}" stroke="#ffffff" stroke-width="1.5"/>')
        if i < 7: o.append(f'<rect x="{x:.1f}" y="{ybar}" width="{cw:.1f}" height="{hbar}" fill="url(#ph-str)"/>')
        if i > 7: o.append(f'<rect x="{x:.1f}" y="{ybar}" width="{cw:.1f}" height="{hbar}" fill="url(#ph-pri)"/>')
        o.append(f'<text x="{x + cw / 2:.1f}" y="{ybar + hbar / 2 + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="{inks[i]}">{i}</text>')
    o.append(f'<rect x="{x0}" y="{ybar}" width="{15 * cw:.1f}" height="{hbar}" fill="none" stroke="{INK}" stroke-width="2"/>')
    # exempel: (pH-position, text, rad) – positiva rader ovanför skalan, negativa nedanför; värden är ungefärliga
    def px(v): return x0 + (v + 0.5) * cw
    above = [(0, 'saltsyra ≈ 0', 1), (1.5, 'magsaft 1–2', 2), (2.75, 'cola/läsk 2,5–3', 1), (5, 'surt regn ≈ 5', 2), (11, 'hushållsammoniak ≈ 11', 2), (14, 'natronlut ≈ 14', 1)]
    below = [(2.3, 'citron ≈ 2', 1), (7, 'rent vatten = 7', 1), (8.5, 'bakpulver 8–9', 2)]
    for v, t, row in above:
        y = ybar - 16 - (row - 1) * 30
        x = px(v)
        anchor = 'middle'
        if v >= 13.5: anchor = 'end'
        if v <= 0: anchor = 'start'
        tx = x + (12 if anchor == 'end' else -12 if anchor == 'start' else 0)
        o.append(f'<line x1="{x:.1f}" y1="{y + 4}" x2="{x:.1f}" y2="{ybar}" stroke="{INK}" stroke-width="1.5"/>')
        o.append(f'<circle cx="{x:.1f}" cy="{ybar}" r="3.5" fill="{INK}"/>')
        o.append(f'<text x="{tx:.1f}" y="{y}" text-anchor="{anchor}" font-family="Arial, sans-serif" font-size="17" fill="{INK}">{t}</text>')
    for v, t, row in below:
        y = ybar + hbar + 26 + (row - 1) * 28
        x = px(v)
        o.append(f'<line x1="{x:.1f}" y1="{ybar + hbar}" x2="{x:.1f}" y2="{y - 15}" stroke="{INK}" stroke-width="1.5" stroke-dasharray="3 3"/>')
        o.append(f'<text x="{x:.1f}" y="{y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="{INK}">{t}</text>')
    # zonrubriker längst ned (text + pilar: aldrig bara färg)
    ylab = ybar + hbar + 26 + 28 + 40
    o.append(f'<text x="{x0 + 3.5 * cw:.1f}" y="{ylab}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="{INK}">◀ SUR (pH under 7)</text>')
    o.append(f'<text x="{x0 + 7.5 * cw:.1f}" y="{ylab}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="{INK}">NEUTRAL</text>')
    o.append(f'<text x="{x0 + 11.5 * cw:.1f}" y="{ylab}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="{INK}">BASISK (pH över 7) ▶</text>')
    o.append('</svg>')
    return ''.join(o)

# --------------------------------------------------------------------------------------------------
# 4. Data till js/molviewer.js
# --------------------------------------------------------------------------------------------------
def build_data():
    mols, multi, view, info = {}, {}, {}, {}
    for key, m in MOLS.items():
        atoms, bonds = m['atoms'], m['bonds']
        lengths, angles = check_geometry(atoms, bonds)
        print(f'{key:8s} längder {{{", ".join(f"{k}: {a:.3f}–{b:.3f}" for k, (a, b) in lengths.items())}}}'
              f'  vinklar {{{", ".join(f"{k}: {a:.1f}–{b:.1f}" for k, (a, b) in angles.items())}}}')
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
    (IMG / 'jonkort').mkdir(parents=True, exist_ok=True)
    for key in STRUCT:
        (IMG / 'strukturformler' / f'{key}.svg').write_text(struct_svg(key), encoding='utf-8')
    (IMG / 'strukturformler' / 'citronsyra.svg').write_text(citric_svg(), encoding='utf-8')
    for key, j in JONKORT.items():
        (IMG / 'jonkort' / f'{key}.svg').write_text(jon_svg(j['ions'], j['alt']), encoding='utf-8')
    (IMG / 'ph-skala.svg').write_text(ph_svg(), encoding='utf-8')
    data = build_data()
    JS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_OUT.write_text('/* Auto-genererad av tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py – redigera inte för hand (kör skriptet igen). */\n'
                      'window.MOLDATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('skrev', JS_OUT.relative_to(REPO), '+', len(STRUCT) + 1, 'strukturformler,', len(JONKORT), 'jonkort, pH-skala')
    return data

def write_png(data, only=None):
    from playwright.sync_api import sync_playwright
    import _server as S
    out = IMG / 'kulmodeller'
    out.mkdir(parents=True, exist_ok=True)
    srv = S.start_server(8768)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8768)
        for key in only or [k for k in data['mols'] if k not in FROM_ATOMER]:
            im = S.render(pg, data['mols'][key], data['multi'].get(key, []), tuple(data['view'][key]), 40)
            im.save(out / f'{key}.png', optimize=True)
            print(f'{key:8s} {im.width}x{im.height}px -> width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()

# --------------------------------------------------------------------------------------------------
# 5. Kort-HTML (klistras in i studieguiden; kortet är hand-redigerbar källa efteråt)
# --------------------------------------------------------------------------------------------------
def _dims(path):
    from PIL import Image
    im = Image.open(path)
    return round(im.width / 3), round(im.height / 3)

def _svg_dims(path):
    import re
    s = Path(path).read_text(encoding='utf-8')
    m = re.search(r'width="([\d.]+)" height="([\d.]+)"', s)
    return round(float(m.group(1))), round(float(m.group(2)))

def card_html(key):
    """Kort för en molekyl/jon i sidokolumnen (samma markup som Atomer och molekyler)."""
    m = MOLS[key]
    is_ion = key in ('so4', 'no3', 'oh')
    src_dir = '/images/kemi/atomer' if key in FROM_ATOMER else '/images/kemi/syror-och-baser'
    disk = REPO / src_dir.lstrip('/')
    png = disk / 'kulmodeller' / f'{key}.png'
    if not png.exists():
        raise SystemExit(f'saknar {png} – kör "png" först')
    pw, ph = _dims(png)
    flab = 'Formel' if is_ion else 'Molekylformel'
    struct = ''
    pair_open = '<div class="mc-pair">'
    if not is_ion and m['alt2d']:
        sp = f'{src_dir}/strukturformler/{key}.svg'
        sw, sh = _svg_dims(REPO / sp.lstrip('/'))
        struct = (f'<div><span class="mc-lab">Strukturformel</span><div class="mc-struct"><img src="{sp}" width="{sw}" height="{sh}" '
                  f'alt="{m["alt2d"]}" loading="lazy"></div></div>')
    else:
        pair_open = '<div class="mc-single">'
    viewer = (f'<div><span class="mc-lab">Kulmodell (3D)</span><div class="km-viewerbox mc-viewer" data-mol="{key}" role="group" tabindex="0" '
              f'style="height:190px" aria-label="{m["alt3d"]} Piltangenter roterar, plus och minus zoomar."><noscript><img class="mc-3d" '
              f'src="{src_dir}/kulmodeller/{key}.png" width="{pw}" height="{ph}" alt="{m["alt3d"]}"></noscript></div><div class="km-hint">Dra för att rotera.</div></div>')
    bond = f'<p class="mc-bond">Bindning: {m["bindning"]} · Form: {m["form"]}</p>'
    return (f'<div class="mol-card" id="km-{key}"><div class="mc-head mc-head--lab"><span class="mc-name">{m["namn"]}</span>'
            f'<span><span class="mc-flab">{flab}</span><span class="mc-formula">{m["formel"]}</span></span></div>'
            f'{pair_open}{struct}{viewer}</div>{bond}</div>')

def card2d_html(key, namn, formel, svg, alt, note):
    """Kort med bara strukturformel (t.ex. citronsyra: för stor för en bra kulmodell)."""
    w, h = _svg_dims(REPO / svg.lstrip('/'))
    return (f'<div class="mol-card" id="km-{key}"><div class="mc-head mc-head--lab"><span class="mc-name">{namn}</span>'
            f'<span><span class="mc-flab">Molekylformel</span><span class="mc-formula">{formel}</span></span></div>'
            f'<span class="mc-lab">Strukturformel</span><div class="mc-struct"><img src="{svg}" width="{w}" height="{h}" alt="{alt}" loading="lazy"></div>'
            f'<p class="mc-bond">{note}</p></div>')

def jonkort_html(key):
    j = JONKORT[key]
    w, h = _svg_dims(IMG / 'jonkort' / f'{key}.svg')
    return (f'<div class="mol-card jon-card" id="jk-{key}"><div class="mc-head mc-head--lab"><span class="mc-name">{j["namn"]}</span>'
            f'<span><span class="mc-flab">Formel</span><span class="mc-formula">{j["formel"]}</span></span></div>'
            f'<div class="mc-struct"><img src="/images/kemi/syror-och-baser/jonkort/{key}.svg" width="{w}" height="{h}" alt="{j["alt"]}" loading="lazy"></div>'
            f'<p class="mc-bond">Jonförening: {j["ratio"]}</p></div>')

if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if what == 'kort':
        for k in sys.argv[2:]:
            print(jonkort_html(k) if k in JONKORT else card_html(k))
        sys.exit(0)
    d = write_all()
    if what in ('all', 'png'):
        write_png(d, sys.argv[2:] or None)
