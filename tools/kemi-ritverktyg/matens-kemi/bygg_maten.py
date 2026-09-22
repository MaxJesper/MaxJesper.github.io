#!/usr/bin/env python3
"""Bygger bild- och modellmaterial till kemi/matens-kemi (Matens kemi).

Kör (från repots rot eller var som helst):
    python3 tools/kemi-ritverktyg/matens-kemi/bygg_maten.py            # allt (data, SVG och PNG-reserver)
    python3 tools/kemi-ritverktyg/matens-kemi/bygg_maten.py data       # bara js/molmodeller.js + SVG:er
    python3 tools/kemi-ritverktyg/matens-kemi/bygg_maten.py png [nyckel…]   # bara kulmodell-PNG:erna
    python3 tools/kemi-ritverktyg/matens-kemi/bygg_maten.py kort <nyckel>   # skriver ut kortets HTML

Skriver:
  kemi/matens-kemi/js/molmodeller.js                    window.MOLDATA för js/molviewer.js
  images/kemi/matens-kemi/strukturformler/*.svg         2D-strukturformler i husstilen
  images/kemi/matens-kemi/kulmodeller/*.png              statiska kulmodeller (reserv utan JavaScript)

GEOMETRI: molekylerna är för stora/komplexa för handbyggd trigonometri (särskilt ringar och kedjor),
så 3D-geometrin kommer från RDKit (chembuilder.build_rdkit: ETKDG-konformerer + MMFF94-optimering,
mest utsträckta lågenergikonformer väljs och roteras till huvudaxeln, se chembuilder.py). SMILES är
hämtade/härledda från PubChem/Chemicalbook (se OVERLAMNING.md för källor och en not om cellobios,
vars SMILES är härledd från en verifierad maltos-SMILES genom att invertera exakt den stereocentrum
som skiljer alfa-1,4- från beta-1,4-bindningen).

2D-STRUKTURFORMLER: de flesta av dessa molekyler är för stora för atom-för-atom-rutnätsstilen som
används i atomer/syror-och-baser (jämför citronsyra i bygg_syror.py, som av samma skäl fick en
halvutvecklad formel). Här används i stället två återanvändbara ritfunktioner:
  * group_svg(...)   – kondenserad/halvutvecklad formel (textetiketter för grupper, kopplade med
                        linjer), för fruktos, glycerol, aminosyror, dipeptid och triglycerid.
  * ring_svg(...)     – schematisk sexring (glukopyranos) för glukos, samt två ihopkopplade ringar
                        för stärkelse-/cellulosafragmenten, där bryggans VINKEL gör att fragmenten
                        ser tydligt olika ut (böjd/spiralbenägen kedja för alfa-1,4 kontra rak,
                        utsträckt kedja för beta-1,4) – det är själva poängen provfrågan testar.
Kulfärger (3D) kommer från 3Dmol.js standardfärger (samma som övriga kapitel; kol grå/svart
override:as i molviewer.js/render-kulmodeller.html, övriga grundämnen får 3Dmols Jmol-liknande
standardfärger – svavel blir gult, precis som i syror-och-baser).
"""
import html, json, math, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(HERE.parent))                          # chembuilder.py
sys.path.insert(0, str(HERE.parent / 'statiska-kulmodeller'))  # _server.py
sys.path.insert(0, str(HERE.parent / 'atomer'))                # bygg_atomer.py (grid-struct_svg, VALENS)
from chembuilder import write_molblock, check_geometry, build_rdkit   # noqa: E402
import bygg_atomer as A                                        # noqa: E402

IMG = REPO / 'images/kemi/matens-kemi'
JS_OUT = REPO / 'kemi/matens-kemi/js/molmodeller.js'
A.VALENS.update({'S': 2})   # tiolsvavel (cystein): 2 enkelbindningar

# --------------------------------------------------------------------------------------------------
# 1. SMILES (källor: se OVERLAMNING.md) och vy-hjälpare
# --------------------------------------------------------------------------------------------------
SMILES = {
    # Beta-D-glukopyranos – Chemicalbook (CAS 492-61-5), samma ringform som i kroppens lösningar.
    'glukos':        'OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O',
    # D-fruktos, öppen kedja – Chemicalbook (CAS 57-48-7). Öppen kedja valdes pedagogiskt: den visar
    # ketongruppen (C=O på C2) tydligt, vilket är den kemiska skillnaden mot glukos som eleven ska
    # känna igen (båda C6H12O6, men olika uppbyggnad -> olika sötma).
    'fruktos':       'OC[C@@H](O)[C@@H](O)[C@H](O)C(=O)CO',
    # Maltos (alfa-1,4, "stärkelsefragment") – Chemicalbook (CAS 69-79-4).
    'maltos':        'OC[C@H]1O[C@H](O[C@H]2[C@H](O)[C@@H](O)C(O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O',
    # Cellobios (beta-1,4, "cellulosafragment") – HÄRLEDD ur maltos-SMILES ovan genom att invertera
    # exakt den ena stereocentrum (glykosidbindningens anomera kol) som skiljer alfa- från
    # beta-bindningen; alla övriga stereocentrum är identiska (etablerad organisk-kemisk relation
    # mellan maltos och cellobios). Se OVERLAMNING.md.
    'cellobios':     'OC[C@H]1O[C@@H](O[C@H]2[C@H](O)[C@@H](O)C(O)O[C@@H]2CO)[C@H](O)[C@@H](O)[C@@H]1O',
    # Palmitinsyra (16:0, mättad fettsyra) – välkänd SMILES, rak mättad C16-kedja.
    'palmitinsyra':  'CCCCCCCCCCCCCCCC(=O)O',
    # Oljesyra (18:1 cis-9, enkelomättad fettsyra) – cis-dubbelbindningen ger den karakteristiska "knäcken".
    'oljesyra':      'CCCCCCCC/C=C\\CCCCCCCC(=O)O',
    'glycerol':      'OCC(O)CO',
    # Förenklad triglycerid: glycerol + en mättad (butanoyl, 4 C) och två omättade (cis-hex-3-enoyl,
    # 6 C) acylkedjor. Riktiga fettsyror i kroppens fetter är mycket längre (12-18 kol) - kedjorna är
    # förkortade här för att RDKit-geometrin och 3D-rutan ska bli tydliga (se OVERLAMNING.md).
    'triglycerid':   'CCCC(=O)OCC(OC(=O)C/C=C\\CC)COC(=O)C/C=C\\CC',
    'glycin':        'NCC(=O)O',
    'alanin':        'CC(N)C(=O)O',
    'cystein':       'NC(CS)C(=O)O',
    # Dipeptid glycylalanin (Gly-Ala): visar peptidbindningen (amidbindningen) konkret.
    'dipeptid':      'NCC(=O)NC(C)C(=O)O',
    # ── Fördjupning: öppen kedja/ringform, samt ribos/deoxiribos (tillagda vid ombyggnaden 22 sep 2026) ──
    # Aldehydo-D-glukos (öppen kedja) – ChEBI CHEBI:42758 (samma stereokemi som PubChem CID 107526,
    # verifierat mot IUPAC-namnet (2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal via RDKit CIP-analys).
    'glukos_oppen':  'C(=O)[C@H](O)[C@@H](O)[C@H](O)[C@H](O)CO',
    # D-ribos (öppen kedja) – Chemicalbook (CAS 50-69-1). Verifierad mot RDKit CIP-analys:
    # (2R,3R,4R)-2,3,4,5-tetrahydroxypentanal, den etablerade konfigurationen för aldehydo-D-ribos.
    'ribos':         'OC[C@@H](O)[C@@H](O)[C@@H](O)C=O',
    # 2-deoxi-D-ribos (öppen kedja) – Chemicalbook (CAS 533-67-5). Verifierad mot RDKit CIP-analys:
    # (3S,4R)-3,4,5-trihydroxypentanal, den etablerade konfigurationen. Saknar OH på C2 jämfört med ribos.
    'deoxiribos':    'OC[C@@H](O)[C@@H](O)CC=O',
}

def auto_view(atoms, bonds):
    """Samma algoritm som i bygg_syror.py: väljer (rotX, rotY) så att inga atomer skymmer varandra."""
    import numpy as np
    P = np.array([[x, y, z] for _, x, y, z in atoms])
    P = P - P.mean(axis=0)
    bonded = {(min(i, j) - 1, max(i, j) - 1) for i, j, _ in bonds}
    best, best_v = -1e9, (-25, 0)
    for a in range(-60, 61, 10):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        for b in range(-70, 71, 10):
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

def rot(smi):
    atoms, bonds = build_rdkit(smi, n_confs=100, seed=7)
    return atoms, bonds

# --------------------------------------------------------------------------------------------------
# 2. Bygg alla molekyler (3D-geometri via RDKit)
# --------------------------------------------------------------------------------------------------
def build_mols():
    M = {}
    for key, smi in SMILES.items():
        atoms, bonds = rot(smi)
        M[key] = dict(atoms=atoms, bonds=bonds)
    return M

MOLGEOM = build_mols()

TEXTS = {
    'glukos': dict(namn='Glukos (druvsocker)', formel='C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>',
        form='sexring (pyranosring)', bindning='enkelbindningar i ringen och till OH-grupperna',
        alt3d='Kulmodell av glukos: en sexring byggd av fem svarta kolatomer och en röd syreatom, med en '
              'gren av kol, syre och väte (CH2OH) och flera röda OH-grupper runt ringen.',
        alt2d='Schematisk ritning av glukosringen: en sexhörning med "O" i ett hörn (ringens syre), en '
              'gren uppåt till CH2OH och grenar till OH vid tre andra hörn.'),
    'fruktos': dict(namn='Fruktos (fruktsocker)', formel='C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>',
        form='öppen kedja med en ketongrupp', bindning='enkelbindningar i kedjan, en dubbelbindning (C=O) på C2',
        alt3d='Kulmodell av fruktos: en öppen kedja av sex svarta kolatomer med röda syreatomer, bland '
              'annat en dubbelbunden syreatom (ketongrupp) på den andra kolatomen.',
        alt2d='Kondenserad formel för fruktos, uppifrån och ned: CH2OH, C med dubbelbunden O (ketongrupp), '
              'sedan tre CHOH-grupper och sist CH2OH.'),
    'maltos': dict(namn='Stärkelsefragment (maltos, α-1,4-bindning)', formel='C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>',
        form='två glukosringar kopplade i en böjd vinkel', bindning='en α-1,4-glykosidbindning (enkelbindningar)',
        alt3d='Kulmodell av ett stärkelsefragment: två sexringar av kol- och syreatomer kopplade med en '
              'syrebrygga i en vinkel som gör att kedjan böjer sig, vilket är typiskt för stärkelsens '
              'spiralform.',
        alt2d='Schematisk ritning av två glukosringar kopplade med en syrebrygga som pekar snett nedåt, '
              'så att den andra ringen hamnar lägre – en böjd, spiralbenägen kedja. Detta är en α-1,4-bindning.',
        note='Förenklad modell: två av glukosenheterna i en mycket lång kedja (riktig stärkelse har tusentals).'),
    'cellobios': dict(namn='Cellulosafragment (cellobios, β-1,4-bindning)', formel='C<sub>12</sub>H<sub>22</sub>O<sub>11</sub>',
        form='två glukosringar kopplade i en rak linje', bindning='en β-1,4-glykosidbindning (enkelbindningar)',
        alt3d='Kulmodell av ett cellulosafragment: två sexringar av kol- och syreatomer kopplade med en '
              'syrebrygga i stort sett rakt fram, vilket är typiskt för cellulosans raka, utsträckta kedjor.',
        alt2d='Schematisk ritning av två glukosringar kopplade med en syrebrygga som går rakt åt sidan, så '
              'att båda ringarna hamnar i samma höjd – en rak, utsträckt kedja. Detta är en β-1,4-bindning.',
        note='Förenklad modell: två av glukosenheterna i en mycket lång kedja (riktig cellulosa har tusentals).'),
    'palmitinsyra': dict(namn='Palmitinsyra (mättad fettsyra, 16:0)', formel='C<sub>16</sub>H<sub>32</sub>O<sub>2</sub>',
        form='rak, mättad kolkedja', bindning='enbart enkelbindningar mellan kolatomerna, en dubbelbindning (C=O) i syragruppen',
        alt3d='Kulmodell av palmitinsyra: en lång, rak sicksackkedja av sexton svarta kolatomer med vita '
              'väteatomer, och en syragrupp med röda syreatomer i ena änden. Kedjan har inga knäckar.',
        alt2d='Sicksackformel för palmitinsyra: en helt rak sicksacklinje av kolkedjan från "CH3" till '
              'syragruppen "COOH" – inga dubbelbindningar i kedjan, alltså inga knäckar.'),
    'oljesyra': dict(namn='Oljesyra (omättad fettsyra, 18:1)', formel='C<sub>18</sub>H<sub>34</sub>O<sub>2</sub>',
        form='kolkedja med en cis-dubbelbindning ("knäck")', bindning='en dubbelbindning (C=C) mitt i kedjan, en dubbelbindning (C=O) i syragruppen',
        alt3d='Kulmodell av oljesyra: en lång kolkedja som är rak i båda ändarna men har en tydlig knäck '
              'ungefär i mitten, där en dubbelbindning mellan två kolatomer gör att kedjan viker av.',
        alt2d='Sicksackformel för oljesyra: kolkedjan från "CH3" till syragruppen "COOH" är rak utom vid '
              'en tydlig knäck i mitten, märkt med dubbelt streck (C=C) och texten cis – det är själva '
              'dubbelbindningen som böjer kedjan.'),
    'glycerol': dict(namn='Glycerol', formel='C<sub>3</sub>H<sub>8</sub>O<sub>3</sub>',
        form='kort kolkedja med tre OH-grupper', bindning='enbart enkelbindningar',
        alt3d='Kulmodell av glycerol: tre svarta kolatomer i en kort kedja, var och en med en röd '
              'syreatom (OH-grupp), och vita väteatomer runt om.',
        alt2d='Kondenserad formel för glycerol: HOCH2–CH(OH)–CH2OH, tre kolatomer i rad med en OH-grupp '
              'på varje.'),
    'triglycerid': dict(namn='Triglycerid (förenklad modell)', formel='glycerol + 3 fettsyror (esterbindningar)',
        form='glycerol med tre kedjor kopplade via syre', bindning='tre esterbindningar (C(=O)–O–C), en mättad och två omättade kedjor',
        alt3d='Kulmodell av en triglycerid: en kort glycerolstomme i mitten med tre kedjor kopplade via '
              'syreatomer, en rak mättad kedja och två kedjor med var sin knäck (omättade).',
        alt2d='Schematisk formel för en triglycerid: glycerolstommen (tre kolatomer) med tre grenar, var '
              'och en kopplad via "–O–C(=O)–" till en fettsyrakedja – en rak (mättad) och två med "CH=CH" '
              'i kedjan (omättade).',
        note='Förenklad modell: de riktiga fettsyrorna i kroppens fetter är mycket längre (12–18 kol) – '
             'kedjorna här är förkortade för tydlighetens skull. Esterbindningarna och blandningen '
             'mättat/omättat stämmer.'),
    'glycin': dict(namn='Glycin (aminosyra)', formel='C<sub>2</sub>H<sub>5</sub>NO<sub>2</sub>',
        form='kort kedja: aminogrupp – kol – karboxylgrupp', bindning='enkelbindningar, en dubbelbindning (C=O) i karboxylgruppen',
        alt3d='Kulmodell av glycin: en blå kväveatom (aminogrupp) kopplad till en svart kolatom som i sin '
              'tur är kopplad till en karboxylgrupp med röda syreatomer. Glycin har inte någon sidokedja.',
        alt2d='Strukturformel för glycin: H2N–CH2–COOH, en aminogrupp och en karboxylgrupp på var sin sida '
              'om en kolatom utan sidokedja.'),
    'alanin': dict(namn='Alanin (aminosyra)', formel='C<sub>3</sub>H<sub>7</sub>NO<sub>2</sub>',
        form='kort kedja med en metyl-sidokedja (R)', bindning='enkelbindningar, en dubbelbindning (C=O) i karboxylgruppen',
        alt3d='Kulmodell av alanin: en blå kväveatom kopplad till en svart kolatom med en karboxylgrupp åt '
              'ena hållet och en liten kolkedja (metylgrupp, sidokedjan R) åt det andra.',
        alt2d='Strukturformel för alanin: H2N–CH(CH3)–COOH, samma bas som glycin men med en metylgrupp '
              '(CH3) som sidokedja R.'),
    'cystein': dict(namn='Cystein (svavelhaltig aminosyra)', formel='C<sub>3</sub>H<sub>7</sub>NO<sub>2</sub>S',
        form='kort kedja med en svavelhaltig sidokedja (R)', bindning='enkelbindningar, en dubbelbindning (C=O) i karboxylgruppen',
        alt3d='Kulmodell av cystein: samma bas som alanin och glycin, men sidokedjan har en gul '
              'svavelatom längst ut (en tiolgrupp, –SH).',
        alt2d='Strukturformel för cystein: H2N–CH(CH2SH)–COOH – sidokedjan R innehåller svavel, till '
              'skillnad från de flesta andra aminosyrors sidokedjor.'),
    'dipeptid': dict(namn='Dipeptid (glycylalanin)', formel='C<sub>5</sub>H<sub>10</sub>N<sub>2</sub>O<sub>3</sub>',
        form='två aminosyror kopplade med en peptidbindning', bindning='en peptidbindning (amidbindning, –CO–NH–) mellan de två aminosyrorna',
        alt3d='Kulmodell av en dipeptid: två aminosyra-enheter (glycin och alanin) kopplade i en kedja, '
              'där karboxylgruppen på den ena är bunden till aminogruppen på den andra.',
        alt2d='Schematisk formel för dipeptiden glycylalanin: H2N–CH2–CO–NH–CH(CH3)–COOH. Bindningen '
              '–CO–NH– i mitten är peptidbindningen (amidbindningen) som håller ihop proteiner.'),
    'glukos_oppen': dict(namn='Glukos i öppen kedja (aldehydform)', formel='C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>',
        form='öppen sexkolskedja med en aldehydgrupp', bindning='enkelbindningar i kedjan, en dubbelbindning (C=O) på C1',
        alt3d='Kulmodell av glukos i öppen kedja: sex svarta kolatomer i en rak kedja med röda syreatomer, '
              'bland annat en dubbelbunden syreatom (aldehydgrupp) i ena änden.',
        alt2d='Kondenserad formel för glukos i öppen kedja, uppifrån och ned: CHO (aldehydgrupp), sedan '
              'fyra CHOH-grupper och sist CH2OH.',
        note='I vattenlösning bildar nästan all glukos (över 99%) i stället en sexring genom att aldehydgruppen '
             'reagerar med en OH-grupp längre ner i kedjan – se fördjupningen om ring/kedja-formen.'),
    'ribos': dict(namn='Ribos', formel='C<sub>5</sub>H<sub>10</sub>O<sub>5</sub>',
        form='öppen femkolskedja med en aldehydgrupp', bindning='enkelbindningar i kedjan, en dubbelbindning (C=O) på C1',
        alt3d='Kulmodell av ribos: fem svarta kolatomer i en rak kedja med röda syreatomer på varje kolatom, '
              'bland annat en dubbelbunden syreatom (aldehydgrupp) i ena änden.',
        alt2d='Kondenserad formel för ribos, uppifrån och ned: CHO (aldehydgrupp), sedan tre CHOH-grupper '
              'och sist CH2OH. Fem kolatomer totalt, en OH-grupp på varje kolatom utom den första.',
        note='Ribos ingår, tillsammans med fosfat, i ryggraden av RNA-molekylen.'),
    'deoxiribos': dict(namn='Deoxiribos', formel='C<sub>5</sub>H<sub>10</sub>O<sub>4</sub>',
        form='öppen femkolskedja med en aldehydgrupp, saknar en OH-grupp jämfört med ribos', bindning='enkelbindningar i kedjan, en dubbelbindning (C=O) på C1',
        alt3d='Kulmodell av deoxiribos: samma som ribos, men den andra kolatomen saknar en röd syreatom (OH-grupp) '
              'och har bara vita väteatomer i stället.',
        alt2d='Kondenserad formel för deoxiribos, uppifrån och ned: CHO, sedan CH2 (ingen OH-grupp – detta är '
              '"deoxi", saknar syre här), sedan två CHOH-grupper och sist CH2OH.',
        note='Deoxiribos ingår, tillsammans med fosfat, i ryggraden av DNA-molekylen. Namnet betyder "ribos '
             'utan en syreatom" – jämför med ribos ovan.'),
}

def build_data():
    mols, multi, view, info = {}, {}, {}, {}
    for key, geo in MOLGEOM.items():
        atoms, bonds = geo['atoms'], geo['bonds']
        lengths, angles = check_geometry(atoms, bonds)
        bad = [k for k, (a, b) in lengths.items() if b - a > 0.35]
        print(f'{key:14s} atomer={len(atoms):3d} bindningar={len(bonds):3d}'
              + (f'  MISSTÄNKT AVSTÅND: {bad}' if bad else ''))
        single = [(i, j, o) for i, j, o in bonds if o == 1]
        mols[key] = write_molblock(atoms, single, title=TEXTS[key]['namn'])
        specs = []
        for i, j, o in bonds:
            if o >= 2:
                specs.append({'a': [round(float(v), 4) for v in atoms[i - 1][1:]],
                              'b': [round(float(v), 4) for v in atoms[j - 1][1:]], 'order': o})
        if specs: multi[key] = specs
        view[key] = list(auto_view(atoms, bonds))
        info[key] = {k: TEXTS[key][k] for k in ('namn', 'formel', 'form', 'bindning', 'alt3d', 'alt2d')}
        if 'note' in TEXTS[key]:
            info[key]['note'] = TEXTS[key]['note']
    return {'mols': mols, 'multi': multi, 'style': {}, 'view': view, 'info': info}

# --------------------------------------------------------------------------------------------------
# 3. 2D-strukturformler: två återanvändbara ritfunktioner (grupp-formel och ring-schema)
# --------------------------------------------------------------------------------------------------
INK, FS = '#14213d', 20

def _tx(x, y, s, anchor='middle', size=FS, weight='400'):
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" dominant-baseline="central" font-family="Arial, sans-serif" font-size="{size}" font-weight="{weight}" fill="{INK}">{s}</text>'

def _line(x1, y1, x2, y2, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"{d}/>'

def _label_halfwidth(html, size=FS):
    """Grov uppskattning av textbreddens halva (px) utifrån antal synliga tecken, så att linjer till
    en etikett stannar precis vid textens kant i stället för att gå in i eller stanna långt före den."""
    import re
    plain = re.sub(r'<[^>]+>', '', html)
    return max(11.0, 0.32 * size * len(plain))

def group_svg(nodes, edges, branches, W=None, H=None, extra_labels=None):
    """nodes: {id: (x,y,label_html)}.  edges: [(id1,id2,order)] – huvudkedjans linjer (1 eller 2 streck).
    branches: [(from_id, x, y, label_html, order)] – en gren (t.ex. =O eller -OH) med egen linje.
    extra_labels: valfri lista fristående textrader (x,y,text,size) t.ex. bindningsnamn i figuren.
    W/H ignoreras (behålls för bakåtkompatibilitet) – bildens mått räknas ut från innehållet."""
    lines, texts = [], []
    for a, b, order in edges:
        (x1, y1, la), (x2, y2, lb) = nodes[a], nodes[b]
        dx, dy = x2 - x1, y2 - y1
        ln = math.hypot(dx, dy) or 1
        ux, uy = dx / ln, dy / ln
        ga, gb = _label_halfwidth(la) + 4, _label_halfwidth(lb) + 4
        xa, ya, xb, yb = x1 + ux * ga, y1 + uy * ga, x2 - ux * gb, y2 - uy * gb
        if order == 1:
            lines.append(_line(xa, ya, xb, yb))
        else:
            px, py = -uy * 3.5, ux * 3.5
            lines.append(_line(xa + px, ya + py, xb + px, yb + py))
            lines.append(_line(xa - px, ya - py, xb - px, yb - py))
    for frm, x2, y2, label, order in branches:
        x1, y1, la = nodes[frm]
        dx, dy = x2 - x1, y2 - y1
        ln = math.hypot(dx, dy) or 1
        ux, uy = dx / ln, dy / ln
        ga, gb = _label_halfwidth(la) + 4, _label_halfwidth(label) + 4
        xa, ya, xb, yb = x1 + ux * ga, y1 + uy * ga, x2 - ux * gb, y2 - uy * gb
        if order == 1:
            lines.append(_line(xa, ya, xb, yb))
        else:
            px, py = -uy * 3.5, ux * 3.5
            lines.append(_line(xa + px, ya + py, xb + px, yb + py))
            lines.append(_line(xa - px, ya - py, xb - px, yb - py))
        texts.append(_tx(x2, y2, label))
    for nid, (x, y, label) in nodes.items():
        if label:
            texts.append(_tx(x, y, label))
    if extra_labels:
        for x, y, s, size in extra_labels:
            texts.append(_tx(x, y, s, size=size))
    all_x, all_y = [], []
    for x, y, l in nodes.values():
        hw = _label_halfwidth(l) if l else 0
        all_x += [x - hw, x + hw]; all_y += [y - 14, y + 14]
    for _frm, x2, y2, label, _order in branches:
        hw = _label_halfwidth(label)
        all_x += [x2 - hw, x2 + hw]; all_y += [y2 - 14, y2 + 14]
    pad = 30
    minx, miny = min(all_x) - pad, min(all_y) - pad
    Wc, Hc = (max(all_x) - min(all_x)) + 2 * pad, (max(all_y) - min(all_y)) + 2 * pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {miny:.1f} {Wc:.1f} {Hc:.1f}" width="{Wc:.0f}" height="{Hc:.0f}">'
            f'<g stroke="{INK}" stroke-width="1.6" stroke-linecap="round">{"".join(lines)}</g>{"".join(texts)}</svg>')

def fatty_acid_svg(n_chain, kink_after=None):
    """Sicksackformel: n_chain kolatomer efter karboxylkolet (index 0), 'HOOC' i ena änden och 'CH3' i
    andra. kink_after: index (0-baserat bland de n_chain kedjekolen) där riktningen INTE viker av som
    vanligt – eftersom en cis-dubbelbindning låser de två kolen på samma sida blir resultatet en tydlig
    knäck i kedjan (den kemiskt korrekta anledningen till att cis-omättade fettsyror böjer av)."""
    dx, dy = 32, 24
    pts = [(60.0, 90.0)]
    direction = -1
    kink_dir = None
    for i in range(n_chain):
        x, y = pts[-1]
        pts.append((x + dx, y + direction * dy))
        if kink_after is not None and i == kink_after:
            kink_dir = direction
        else:
            direction *= -1
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    pad_l, pad_r, pad_v = 62, 56, 46
    minx, maxx = min(xs) - pad_l, max(xs) + pad_r
    miny, maxy = min(ys) - pad_v, max(ys) + pad_v
    W, H = maxx - minx, maxy - miny
    lines = []
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]; x2, y2 = pts[i + 1]
        if kink_after is not None and i == kink_after + 1:
            dxs, dys = x2 - x1, y2 - y1
            ln = math.hypot(dxs, dys) or 1
            px, py = -dys / ln * 3.4, dxs / ln * 3.4
            lines.append(_line(x1 + px, y1 + py, x2 + px, y2 + py))
            lines.append(_line(x1 - px, y1 - py, x2 - px, y2 - py))
        else:
            lines.append(_line(x1, y1, x2, y2))
    texts = [_tx(pts[0][0] - 22, pts[0][1], 'HOOC', anchor='end', size=19, weight='700'),
             _tx(pts[-1][0] + 22, pts[-1][1], 'CH<tspan dy="6" font-size="13">3</tspan>', anchor='start', size=19, weight='700')]
    if kink_after is not None:
        kx, ky = pts[kink_after + 1]
        texts.append(_tx(kx, ky + (34 if kink_dir < 0 else -34), 'cis-dubbelbindning', size=14))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {miny:.1f} {W:.1f} {H:.1f}" width="{W:.0f}" height="{H:.0f}">'
            f'<g stroke="{INK}" stroke-width="2.4" stroke-linecap="round">' + ''.join(lines) + '</g>' + ''.join(texts) + '</svg>')

def straight_chain_sugar_svg(n, deoxy_positions=()):
    """Kondenserad vertikal formel för en öppen-kedjesocker: C1 = CHO (aldehyd, topp), C_n = CH2OH (botten),
    mellanliggande kol är CHOH om inte kolnumret (1-baserat) finns i deoxy_positions, då blir det CH2 (ingen OH)
    – används för deoxiribos (saknar OH på C2)."""
    labels = ['CHO']
    for i in range(2, n):
        labels.append('CH<tspan dy="6" font-size="13">2</tspan>' if i in deoxy_positions else 'CHOH')
    labels.append('CH<tspan dy="6" font-size="13">2</tspan>OH')
    x0, y0, step = 130, 40, 42
    nodes = {i: (x0, y0 + i * step, labels[i]) for i in range(n)}
    edges = [(i, i + 1, 1) for i in range(n - 1)]
    return group_svg(nodes, edges, [], 260, y0 + (n - 1) * step + 40)


def ring_glucose_detailed_svg():
    """Detaljerad glukosring: samma sexring som ring_glucose_svg, men med kolatomerna numrerade (C1-C5) och
    ALLA väteatomer på ringkolen utsatta som egna 'H'-grenar bredvid varje OH/CH2OH-gren (fördjupningsnivå,
    Jespers krav: 'alla kolatomer, väten och OH-grupper utsatta'). OH-grupperna själva anger sin egen väteatom."""
    cx, cy, r = 170, 165, 72
    P = hexagon(cx, cy, r, -90)
    v_o = P[0]
    lines = [_line(*P[i], *P[(i + 1) % 6]) for i in range(6)]
    texts = [_tx(*v_o, 'O', weight='700')]
    pts = list(P)
    subs = ['OH', 'OH', 'OH', 'OH', 'CH<tspan dy="6" font-size="13">2</tspan>OH']
    for k, i in enumerate(range(1, 6)):
        v = P[i]
        theta = math.atan2(v[1] - cy, v[0] - cx)
        for sign, label, length in ((-1, subs[k], 48), (1, 'H', 40)):
            ang = theta + sign * math.radians(27)
            bx, by = v[0] + length * math.cos(ang), v[1] + length * math.sin(ang)
            lines.append(_line(v[0], v[1], bx, by))
            texts.append(_tx(bx, by, label, size=17 if label == 'H' else FS))
            pts.append((bx, by))
        # Kolnumret, litet, strax innanför ringen vid varje hörn
        nx, ny = v[0] + (cx - v[0]) * 0.24, v[1] + (cy - v[1]) * 0.24
        texts.append(_tx(nx, ny, f'C<tspan dy="4" font-size="10">{i}</tspan>', size=12))
    return _ring_frame((lines, texts, pts), pad=46)


def fat_overview_svg():
    """Schematisk översikt av en triglycerid: en tjock, färgad 'E'-form (glycerol, tre armar) med tre
    färgade rektangulära block ihakade i armarna (fettsyror). En av fettsyrorna har en tydlig knäck (antyder
    en omättad fettsyra) – egen, ny bild i kod, inspirerad av principen 'E-form + block', inte kopierad från
    någon lärobok. Färgblindsäker: varje del har en textetikett, inte bara en färg."""
    W, H = 560, 380
    spine_x0, spine_x1 = 120, 156
    arm_y = [70, 200, 330]
    col_glycerol = '#5b6b8c'
    col_sat = '#a5570c'
    col_unsat = '#0f766e'
    parts = [f'<rect x="{spine_x0}" y="40" width="{spine_x1-spine_x0}" height="320" rx="10" fill="{col_glycerol}"/>']
    for y in arm_y:
        parts.append(f'<rect x="{spine_x1-4}" y="{y-16}" width="90" height="32" fill="{col_glycerol}"/>')
    parts.append(_tx(spine_x0 + (spine_x1 - spine_x0) / 2, 200, 'G', size=30, weight='800').replace(f'fill="{INK}"', 'fill="#fff"'))
    block_x = spine_x1 + 86
    labels = [('Fettsyra 1', '(mättad)'), ('Fettsyra 2', '(omättad – knäck)'), ('Fettsyra 3', '(mättad)')]
    colors = [col_sat, col_unsat, col_sat]
    for k, y in enumerate(arm_y):
        if k == 1:
            # omättad: rektangeln ritas i två segment med en vinkel emellan ("knäck")
            parts.append(f'<path d="M {block_x} {y-22} L {block_x+150} {y-22} L {block_x+185} {y} '
                          f'L {block_x+150} {y+22} L {block_x} {y+22} Z" fill="{colors[k]}"/>')
        else:
            parts.append(f'<rect x="{block_x}" y="{y-22}" width="185" height="44" rx="6" fill="{colors[k]}"/>')
        title, sub = labels[k]
        lab_x = block_x + (100 if k == 1 else 92)
        parts.append(_tx(lab_x, y - 8, title, size=15, weight='700').replace(f'fill="{INK}"', 'fill="#fff"'))
        parts.append(_tx(lab_x, y + 9, sub, size=12, weight='700').replace(f'fill="{INK}"', 'fill="#fff"'))
    legend = (f'<g font-family="Arial, sans-serif" font-size="14" fill="{INK}">'
              f'<rect x="20" y="{H-34}" width="16" height="16" fill="{col_glycerol}"/>'
              f'<text x="42" y="{H-22}">Glycerol (G) – tre armar, en per fettsyra</text></g>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img">{"".join(parts)}{legend}</svg>')


def protein_bead_chain_svg():
    """Schematisk bild: aminosyror som färgade kulor i en kedja (vänster) som veckas till en kompakt form
    (höger). Medvetet abstrakt/schematisk – ingen riktig aminosyrakemi, bara principen 'kedja -> veckad form'.
    Färgblindsäker: varje kula har både en egen färg OCH en bokstav."""
    beads = [('A', '#b45309'), ('B', '#0f766e'), ('C', '#7c3aed'), ('D', '#be123c'),
             ('E', '#1d4ed8'), ('F', '#15803d'), ('G', '#c026d3'), ('H', '#0369a1')]
    r = 16
    W, H = 820, 330
    parts = []
    # Vänster: rak kedja
    x0, y0, step = 40, 90, 60
    chain_pts = [(x0 + i * step, y0) for i in range(len(beads))]
    for i in range(len(chain_pts) - 1):
        parts.append(_line(*chain_pts[i], *chain_pts[i + 1]))
    for (x, y), (lab, col) in zip(chain_pts, beads):
        parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{col}" stroke="{INK}" stroke-width="1.2"/>')
        parts.append(f'<text x="{x}" y="{y+1}" text-anchor="middle" dominant-baseline="central" '
                      f'font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">{lab}</text>')
    parts.append(_tx(x0 + 3.5 * step, y0 + 44, 'Kedja av aminosyror', size=15, weight='700'))
    # Pil
    ax0, ay = x0 + 7 * step + 30, y0
    parts.append(f'<path d="M {ax0} {ay} l 50 0 l -13 -11 m 13 11 l -13 11" fill="none" stroke="{INK}" '
                 f'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>')
    # Höger: veckad/kompakt kedja (samma kulor, hopvecklade i en tät "orm"-bana utan att linjerna korsar varandra)
    bx, by, dx, dy = ax0 + 150, y0 - 40, 56, 52
    grid = [(0, 0), (1, 0), (1, 1), (0, 1), (0, 2), (1, 2), (1, 3), (0, 3)]
    coil_pts = [(bx + col * dx, by + row * dy) for col, row in grid]
    for i in range(len(coil_pts) - 1):
        parts.append(_line(*coil_pts[i], *coil_pts[i + 1]))
    for (x, y), (lab, col) in zip(coil_pts, beads):
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{col}" stroke="{INK}" stroke-width="1.2"/>')
        parts.append(f'<text x="{x:.1f}" y="{y+1:.1f}" text-anchor="middle" dominant-baseline="central" '
                      f'font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#fff">{lab}</text>')
    parts.append(_tx(bx + dx / 2, by + 3 * dy + 44, 'Veckad till sin form', size=15, weight='700'))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img">'
            f'<g stroke="{INK}" stroke-width="1.6" stroke-linecap="round">{"".join(parts)}</g></svg>')


def hexagon(cx, cy, r, rot_deg):
    pts = []
    for k in range(6):
        a = math.radians(rot_deg + k * 60)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def _ring_frame(pts_and_lines_and_texts, pad=36):
    lines, texts, pts = pts_and_lines_and_texts
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    minx, miny = min(xs) - pad, min(ys) - pad
    W, H = (max(xs) - min(xs)) + 2 * pad, (max(ys) - min(ys)) + 2 * pad
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {miny:.1f} {W:.1f} {H:.1f}" width="{W:.0f}" height="{H:.0f}">'
            f'<g stroke="{INK}" stroke-width="2" stroke-linecap="round" fill="none">' + ''.join(lines) + '</g>'
            + ''.join(texts) + '</svg>')

def ring_glucose_svg():
    """Enkel glukosring: sexhörning, O i ett hörn, CH2OH-gren uppåt, OH-grenar vid tre hörn."""
    cx, cy, r = 150, 140, 62
    P = hexagon(cx, cy, r, -90)  # v0 topp
    v_o, v_c1, v_c2, v_c3, v_c4, v_c5 = P
    lines = [_line(*P[i], *P[(i + 1) % 6]) for i in range(6)]
    ch2 = (v_c5[0] - 20, v_c5[1] - 62)
    lines.append(_line(v_c5[0], v_c5[1], ch2[0], ch2[1]))
    oh1 = (v_c1[0] + 68, v_c1[1] - 6)
    oh2 = (v_c2[0] + 68, v_c2[1] + 12)
    oh3 = (v_c3[0], v_c3[1] + 62)
    oh4 = (v_c4[0] - 68, v_c4[1] + 12)
    for (vx, vy), (ox, oy) in [(v_c1, oh1), (v_c2, oh2), (v_c3, oh3), (v_c4, oh4)]:
        lines.append(_line(vx, vy, ox, oy))
    texts = [_tx(*v_o, 'O', weight='700'),
             _tx(*ch2, 'CH<tspan dy="6" font-size="13">2</tspan>OH'),
             _tx(*oh1, 'OH'), _tx(*oh2, 'OH'), _tx(*oh3, 'OH'), _tx(*oh4, 'OH')]
    pts = P + [ch2, oh1, oh2, oh3, oh4]
    return _ring_frame((lines, texts, pts))

def ring_pair_svg(bent):
    """Två glukosringar kopplade med en syrebrygga. bent=True -> alfa-1,4 (böjd, stärkelse),
    bent=False -> beta-1,4 (rak, cellulosa). Skillnaden ligger i ring B:s position/vinkel."""
    r = 56
    c1 = (150, 150)
    c2 = (150 + 300, 150 + 130) if bent else (150 + 320, 150)
    P1 = hexagon(*c1, r, -90)
    P2 = hexagon(*c2, r, -90 if bent else -30)
    v_o1, v_c1_1, v_c2_1, v_c3_1, v_c4_1, v_c5_1 = P1
    v_o2, v_c1_2, v_c2_2, v_c3_2, v_c4_2, v_c5_2 = P2
    lines = [_line(*P1[i], *P1[(i + 1) % 6]) for i in range(6)]
    lines += [_line(*P2[i], *P2[(i + 1) % 6]) for i in range(6)]
    # bryggan: ring1 C1 -> O (mitt emellan) -> ring2 C4
    bx, by = (v_c1_1[0] + v_c4_2[0]) / 2, (v_c1_1[1] + v_c4_2[1]) / 2
    lines.append(_line(*v_c1_1, bx, by))
    lines.append(_line(bx, by, *v_c4_2))
    # ring1 (icke-reducerande): CH2OH-gren uppåt, OH-grenar på C2 och C3 (motsatt håll mot bryggan)
    ch2_1 = (v_c5_1[0] - 16, v_c5_1[1] - 66)
    oh_c2_1 = (v_c2_1[0], v_c2_1[1] + 66)
    oh_c3_1 = (v_c3_1[0] - 66, v_c3_1[1] + 30)
    # ring2 (reducerande): CH2OH-gren uppåt, fri OH på C1 (reducerande ände), OH på C2
    ch2_2 = (v_c5_2[0] - 10, v_c5_2[1] - 66)
    oh_c1_2 = (v_c1_2[0] + 66, v_c1_2[1] - 22)
    oh_c2_2 = (v_c2_2[0] + 66, v_c2_2[1] + 22)
    for (vx, vy), (ox, oy) in [(v_c5_1, ch2_1), (v_c2_1, oh_c2_1), (v_c3_1, oh_c3_1),
                               (v_c5_2, ch2_2), (v_c1_2, oh_c1_2), (v_c2_2, oh_c2_2)]:
        lines.append(_line(vx, vy, ox, oy))
    texts = [_tx(*v_o1, 'O', weight='700'), _tx(*v_o2, 'O', weight='700'), _tx(bx, by, 'O', weight='700'),
             _tx(*ch2_1, 'CH<tspan dy="6" font-size="13">2</tspan>OH'), _tx(*oh_c2_1, 'OH'), _tx(*oh_c3_1, 'OH'),
             _tx(*ch2_2, 'CH<tspan dy="6" font-size="13">2</tspan>OH'), _tx(*oh_c1_2, 'OH'), _tx(*oh_c2_2, 'OH')]
    label = 'α-1,4-bindning' if bent else 'β-1,4-bindning'
    ly = by - 54 if bent else by - 40
    texts.append(_tx(bx, ly, label, size=16, weight='700'))
    pts = P1 + P2 + [ch2_1, oh_c2_1, oh_c3_1, ch2_2, oh_c1_2, oh_c2_2, (bx, ly - 14)]
    return _ring_frame((lines, texts, pts), pad=40)

def fructose_svg():
    """Kondenserad vertikal formel: CH2OH - C=O - CHOH - CHOH - CHOH - CH2OH."""
    labels = ['CH<tspan dy="6" font-size="13">2</tspan>OH', 'C', 'CHOH', 'CHOH', 'CHOH',
              'CH<tspan dy="6" font-size="13">2</tspan>OH']
    x0, y0, step = 120, 40, 42
    nodes = {i: (x0, y0 + i * step, labels[i]) for i in range(6)}
    edges = [(i, i + 1, 1) for i in range(5)]
    branches = [(1, x0 + 70, y0 + 1 * step, 'O', 2)]
    return group_svg(nodes, edges, branches, 260, y0 + 5 * step + 40)

def glycerol_svg():
    labels = ['HOCH<tspan dy="6" font-size="13">2</tspan>', 'CH', 'CH<tspan dy="6" font-size="13">2</tspan>OH']
    x0, y0, step = 40, 70, 110
    nodes = {i: (x0 + i * step, y0, labels[i]) for i in range(3)}
    edges = [(0, 1, 1), (1, 2, 1)]
    branches = [(1, x0 + step, y0 + 55, 'OH', 1)]
    return group_svg(nodes, edges, branches, x0 + 2 * step + 60, y0 + 90)

def amino_acid_svg(r_label, r_branch=True):
    """H2N-CH(R)-COOH. r_label: etikett för sidokedjan (t.ex. 'H', 'CH3', 'CH2SH')."""
    x0, y0, step = 46, 75, 90
    nodes = {0: (x0, y0, 'H<tspan dy="6" font-size="13">2</tspan>N'),
             1: (x0 + step, y0, 'CH'),
             2: (x0 + 2 * step, y0, 'COOH')}
    edges = [(0, 1, 1), (1, 2, 1)]
    branches = [(1, x0 + step, y0 + 55, r_label, 1)]
    return group_svg(nodes, edges, branches, x0 + 3 * step, y0 + 95)

def dipeptide_svg():
    labels = ['H<tspan dy="6" font-size="13">2</tspan>N', 'CH<tspan dy="6" font-size="13">2</tspan>', 'CO',
              'NH', 'CH', 'COOH']
    x0, y0, step = 40, 90, 76
    nodes = {i: (x0 + i * step, y0, labels[i]) for i in range(6)}
    edges = [(0, 1, 1), (1, 2, 1), (2, 3, 1), (3, 4, 1), (4, 5, 1)]
    branches = [(2, x0 + 2 * step, y0 - 45, 'O', 2), (4, x0 + 4 * step, y0 + 50, 'CH<tspan dy="6" font-size="13">3</tspan>', 1)]
    svg = group_svg(nodes, edges, branches, x0 + 5 * step + 40, y0 + 100)
    # markera peptidbindningen (CO-NH) med en mjuk bakgrundsrektangel
    x1, _, _ = nodes[2]; x2, _, _ = nodes[3]
    hl = f'<rect x="{x1-30:.1f}" y="{y0-30}" width="{x2-x1+60:.1f}" height="60" rx="14" fill="#fef3c7" opacity="0.6"/>'
    return svg.replace('<g stroke=', hl + '<g stroke=', 1)

def triglyceride_svg():
    """Schematisk formel: glycerolstomme (3 C, generöst mellanrum) med tre ESTERBINDNINGAR (-O-C(=O)-)
    ritade som riktiga bindningar (inte textetiketter), där karbonylsyrets dubbelbindning alltid pekar
    RAKT UPPÅT från kolet – samma riktning för alla tre, så esterbindningarna är lätta att jämföra och
    ser lika ut. Glycerolstommen är lång nog (steg=170px) att syreatomerna på de tre armarna aldrig
    hamnar nära varandra. En mättad (butanoyl) och två omättade (hex-3-enoyl, dubbelbindning=dubbel linje
    i kedjan) fettsyror, som i molekylens SMILES/3D-modell ovan."""
    nodes, edges, branches = {}, [], []
    x0, y0, step = 90, 190, 170
    gly_labels = ['CH<tspan dy="6" font-size="13">2</tspan>', 'CH', 'CH<tspan dy="6" font-size="13">2</tspan>']
    for i in range(3):
        nodes[f'g{i}'] = (x0, y0 + (i - 1) * step, gly_labels[i])
    edges += [('g0', 'g1', 1), ('g1', 'g2', 1)]
    chain_specs = ['sat', 'unsat', 'unsat']  # matchar SMILES: övre armen mättad, mitten+nedre omättade
    for i, spec in enumerate(chain_specs):
        gx, gy = nodes[f'g{i}'][0], nodes[f'g{i}'][1]
        ox, oy = gx + 88, gy
        cx_, cy_ = ox + 56, gy
        nodes[f'o{i}'] = (ox, oy, 'O')
        nodes[f'c{i}'] = (cx_, cy_, 'C')
        edges.append((f'g{i}', f'o{i}', 1))
        edges.append((f'o{i}', f'c{i}', 1))
        branches.append((f'c{i}', cx_, cy_ - 52, 'O', 2))  # karbonylsyre: alltid rakt upp, samma för alla tre
        if spec == 'sat':
            seq = [('CH<tspan dy="6" font-size="13">2</tspan>', 1), ('CH<tspan dy="6" font-size="13">2</tspan>', 1),
                   ('CH<tspan dy="6" font-size="13">3</tspan>', 1)]
        else:
            seq = [('CH<tspan dy="6" font-size="13">2</tspan>', 1), ('CH', 1), ('CH', 2),
                   ('CH<tspan dy="6" font-size="13">2</tspan>', 1), ('CH<tspan dy="6" font-size="13">3</tspan>', 1)]
        prev, px = f'c{i}', cx_
        for j, (lab, ordr) in enumerate(seq):
            nid = f'{prev}_{j}'
            px += 44
            py = cy_ + (14 if j % 2 == 0 else -14)
            nodes[nid] = (px, py, lab)
            edges.append((prev, nid, ordr))
            prev = nid
    return group_svg(nodes, edges, branches)

def struct_svg_all():
    out = {}
    out['glukos'] = ring_glucose_svg()
    out['fruktos'] = fructose_svg()
    out['maltos'] = ring_pair_svg(bent=True)
    out['cellobios'] = ring_pair_svg(bent=False)
    out['palmitinsyra'] = fatty_acid_svg(15, kink_after=None)
    out['oljesyra'] = fatty_acid_svg(17, kink_after=7)
    out['glycerol'] = glycerol_svg()
    out['glycin'] = amino_acid_svg('H')
    out['alanin'] = amino_acid_svg('CH<tspan dy="6" font-size="13">3</tspan>')
    out['cystein'] = amino_acid_svg('CH<tspan dy="6" font-size="13">2</tspan>SH')
    out['dipeptid'] = dipeptide_svg()
    out['triglycerid'] = triglyceride_svg()
    out['glukos_oppen'] = straight_chain_sugar_svg(6)
    out['ribos'] = straight_chain_sugar_svg(5)
    out['deoxiribos'] = straight_chain_sugar_svg(5, deoxy_positions=(2,))
    return out

# Fristående illustrationer (ingen 3D-modell, inget mol-card) – skrivs direkt till egna filer.
FREESTANDING_SVG = {
    'glukos-detaljerad': ring_glucose_detailed_svg,
    'fett-oversikt': fat_overview_svg,
    'protein-veckning': protein_bead_chain_svg,
}

# --------------------------------------------------------------------------------------------------
# 4. Skriv allt
# --------------------------------------------------------------------------------------------------
def write_all():
    (IMG / 'strukturformler').mkdir(parents=True, exist_ok=True)
    (IMG / 'kulmodeller').mkdir(parents=True, exist_ok=True)
    for key, svg in struct_svg_all().items():
        (IMG / 'strukturformler' / f'{key}.svg').write_text(svg, encoding='utf-8')
    for key, fn in FREESTANDING_SVG.items():
        (IMG / 'strukturformler' / f'{key}.svg').write_text(fn(), encoding='utf-8')
    data = build_data()
    JS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_OUT.write_text('/* Auto-genererad av tools/kemi-ritverktyg/matens-kemi/bygg_maten.py – redigera inte för hand (kör skriptet igen). */\n'
                       'window.MOLDATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
    print('skrev', JS_OUT.relative_to(REPO), 'och', len(SMILES), 'strukturformler')
    return data

def write_png(data, only=None):
    from playwright.sync_api import sync_playwright
    import _server as S
    out = IMG / 'kulmodeller'
    out.mkdir(parents=True, exist_ok=True)
    srv = S.start_server(8769)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8769)
        for key in only or list(data['mols'].keys()):
            im = S.render(pg, data['mols'][key], data['multi'].get(key, []), tuple(data['view'][key]), 34)
            im.save(out / f'{key}.png', optimize=True)
            print(f'{key:14s} {im.width}x{im.height}px -> width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()

# --------------------------------------------------------------------------------------------------
# 5. Kort-HTML (klistras in i studieguiden)
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
    m = TEXTS[key]
    png = IMG / 'kulmodeller' / f'{key}.png'
    if not png.exists():
        raise SystemExit(f'saknar {png} – kör "png" först')
    pw, ph = _dims(png)
    sp = f'/images/kemi/matens-kemi/strukturformler/{key}.svg'
    sw, sh = _svg_dims(IMG / 'strukturformler' / f'{key}.svg')
    alt2d = html.escape(m['alt2d'], quote=True)
    alt3d = html.escape(m['alt3d'], quote=True)
    struct = (f'<div><span class="mc-lab">Strukturformel</span><div class="mc-struct"><img src="{sp}" width="{sw}" height="{sh}" '
              f'alt="{alt2d}" loading="lazy"></div></div>')
    viewer = (f'<div><span class="mc-lab">Kulmodell (3D)</span><div class="km-viewerbox mc-viewer" data-mol="{key}" role="group" tabindex="0" '
              f'style="height:190px" aria-label="{alt3d} Piltangenter roterar, plus och minus zoomar."><noscript><img class="mc-3d" '
              f'src="/images/kemi/matens-kemi/kulmodeller/{key}.png" width="{pw}" height="{ph}" alt="{alt3d}"></noscript></div>'
              f'<div class="km-hint">Dra för att rotera.</div></div>')
    note = f' {m["note"]}' if 'note' in m else ''
    return (f'<div class="mol-card" id="km-{key}"><div class="mc-head mc-head--lab"><span class="mc-name">{m["namn"]}</span>'
            f'<span><span class="mc-flab">Formel</span><span class="mc-formula">{m["formel"]}</span></span></div>'
            f'<div class="mc-pair">{struct}{viewer}</div>'
            f'<p class="mc-bond">Bindning: {m["bindning"]} · Form: {m["form"]}{note}</p></div>')

DETALJERAD_ALT2D = ('Detaljerad strukturformel för glukosringen: alla fem ringkolatomer (C1–C5) och '
    'ringens syreatom är numrerade/markerade, och varje ringkolatom har både sin OH-grupp (eller CH2OH-gren på '
    'C5) OCH sin väteatom (H) utsatta som egna korta streck – inga atomer är dolda eller underförstådda.')

def detailed_glucose_card_html():
    """Mol-card för den DETALJERADE glukosformeln (alla C, H och OH utsatta) – återanvänder samma
    3D-kulmodell och PNG som den vanliga glukosen (samma molekyl, bara en mer detaljerad 2D-ritning)."""
    m = TEXTS['glukos']
    png = IMG / 'kulmodeller' / 'glukos.png'
    pw, ph = _dims(png)
    sw, sh = _svg_dims(IMG / 'strukturformler' / 'glukos-detaljerad.svg')
    alt2d = html.escape(DETALJERAD_ALT2D, quote=True)
    alt3d = html.escape(m['alt3d'], quote=True)
    struct = (f'<div><span class="mc-lab">Strukturformel (detaljerad)</span><div class="mc-struct">'
              f'<img src="/images/kemi/matens-kemi/strukturformler/glukos-detaljerad.svg" width="{sw}" height="{sh}" '
              f'alt="{alt2d}" loading="lazy"></div></div>')
    viewer = (f'<div><span class="mc-lab">Kulmodell (3D)</span><div class="km-viewerbox mc-viewer" data-mol="glukos" role="group" tabindex="0" '
              f'style="height:190px" aria-label="{alt3d} Piltangenter roterar, plus och minus zoomar."><noscript><img class="mc-3d" '
              f'src="/images/kemi/matens-kemi/kulmodeller/glukos.png" width="{pw}" height="{ph}" alt="{alt3d}"></noscript></div>'
              f'<div class="km-hint">Dra för att rotera.</div></div>')
    return (f'<div class="mol-card" id="km-glukos-detaljerad"><div class="mc-head mc-head--lab"><span class="mc-name">Glukos – detaljerad formel</span>'
            f'<span><span class="mc-flab">Formel</span><span class="mc-formula">{m["formel"]}</span></span></div>'
            f'<div class="mc-pair">{struct}{viewer}</div>'
            f'<p class="mc-bond">Samma molekyl som glukosringen till vänster – här är varje kolatom, väteatom och '
            f'OH-grupp i ringen ritad ut för sig.</p></div>')

if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if what == 'kort':
        for k in sys.argv[2:]:
            print(card_html(k))
        sys.exit(0)
    d = write_all()
    if what in ('all', 'png'):
        write_png(d, sys.argv[2:] or None)
