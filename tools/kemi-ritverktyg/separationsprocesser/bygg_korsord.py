# -*- coding: utf-8 -*-
"""Genererar korsord.html för Separationsprocesser (mall: elektrokemi/korsord.html). Ord ur BEGREPP, egna ledtrådar."""
import json, os, random, re, sys
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/separationsprocesser"

CLUES = {
"Plasma": "Den fjärde formen av materia: en gas så het att elektroner slitits loss från atomerna. Finns i blixtar och i solen.",
"Smältning": "Övergången från fast form till flytande när ämnet värms upp, till exempel när is blir vatten.",
"Stelning": "Övergången från flytande form till fast form när ämnet kyls, till exempel när vatten fryser.",
"Smältpunkt": "Den temperatur då ett rent ämne övergår från fast till flytande form. För vatten är den 0 °C.",
"Avdunstning": "När partiklar lämnar ytan på en vätska och blir gas. Sker vid alla temperaturer, snabbast när det är varmt och blåsigt.",
"Kokning": "När en vätska blir gas i hela vätskan så att bubblor bildas.",
"Kokpunkt": "Den temperatur då en vätska bubblar och blir gas. För vatten är den 100 °C vid normalt lufttryck.",
"Kondensering": "Övergången från gas till vätska, till exempel när vattenånga blir droppar på ett kallt glas.",
"Sublimering": "Övergången direkt från fast form till gas utan att ämnet blir flytande, till exempel torris.",
"Densitet": "Massa per volym, ρ = m / V. Ofta i g/cm³.",
"Blandning": "Två eller flera ämnen som ligger tillsammans utan att ha reagerat med varandra.",
"Lösning": "Ser likadan ut överallt: ett ämne är utspritt som mycket små partiklar i ett annat, till exempel salt i vatten.",
"Slamning": "Fasta korn svävar i en vätska, till exempel lera i vatten. Kornen sjunker med tiden.",
"Emulsion": "Små droppar av en vätska svävar i en annan vätska som de inte löser sig i, till exempel mjölk.",
"Legering": "Metaller som smälts ihop, till exempel brons, mässing och stål.",
"Löslighet": "Hur mycket av ett ämne som går att få upp i vätskan vid en viss temperatur.",
"Silning": "Att hälla en blandning genom hål av en viss storlek så att små delar går igenom och stora blir kvar.",
"Sediment": "Bottensatsen: de korn som har sjunkit till botten när en grumlig vätska fått stå.",
"Dekantering": "Att försiktigt hälla av vätskan från bottensatsen så att den blir kvar.",
"Filtrering": "Att hälla en blandning genom papper med mycket små hål. Vätskan går igenom, de olösta kornen blir kvar.",
"Filtrat": "Vätskan som har gått igenom pappret med de små hålen.",
"Indunstning": "Att låta vätskan försvinna som gas så att det som var löst blir kvar som fast ämne, till exempel salt ur saltvatten.",
"Destillat": "Vätskan som samlas upp i kylaren när ångan har kylts och blivit vätska igen.",
"Extraktion": "Att lösa ut det man vill åt ur något fast med hjälp av en vätska, till exempel smak ur teblad.",
"Kromatografi": "Metod där ämnena i en blandning vandrar olika snabbt, till exempel på filterpapper. Används för att skilja färger.",
"Fällning": "Nytt, olösligt fast ämne som bildas och sjunker till botten när två lösningar blandas.",
"Analys": "Att ta reda på vad ett prov innehåller och hur mycket.",
"Indikator": "Ämne som ändrar färg beroende på om lösningen är sur eller basisk, till exempel pH-papper.",
"Hypotes": "En gissning som bygger på det man redan vet och som går att pröva.",
"Variabel": "Något som kan ändras eller mätas i en undersökning.",
"Felkälla": "Något som kan ha gjort ett mätresultat mindre pålitligt.",
"Reningsverk": "Anläggning som renar avloppsvatten i flera steg innan vattnet släpps ut.",
"Sedimentering": "Att låta en grumlig vätska stå stilla så att de tyngre kornen sjunker och samlas på botten.",
"Centrifugering": "Att snurra en blandning mycket snabbt så att de tyngre delarna pressas utåt och hamnar längst ned i röret.",
"Destillation": "Att värma en vätskeblandning så att den del som blir ånga först kyls och samlas upp i en kylare.",
"Lösningsmedel": "Ämnet som löser upp något annat, till exempel vattnet i saltvatten.",
"Separationsmetod": "Ett sätt att dela upp en blandning i sina delar.",
}
MAXS = int(os.environ.get('MAXS','19'))
MAXLEN = int(os.environ.get('MAXLEN','14'))

def lager(orden, seed, maxs):
    rnd = random.Random(seed)
    ordn = sorted(orden, key=lambda w: (-len(w) + rnd.random()*4))
    g = {}      # (r,c) -> bokstav
    used = {}   # (r,c) -> {riktningar som redan går genom rutan}
    plac = []   # (ord, r, c, dir) dir 0=vågrätt 1=lodrätt

    def ok(w, r, c, d):
        dr, dc = (0, 1) if d == 0 else (1, 0)
        if (r-dr, c-dc) in g or (r+dr*len(w), c+dc*len(w)) in g: return None
        kors = 0
        for i, ch in enumerate(w):
            rr, cc = r+dr*i, c+dc*i
            if (rr, cc) in g:
                if g[(rr, cc)] != ch or d in used[(rr, cc)]: return None
                kors += 1
            elif (rr+dc, cc+dr) in g or (rr-dc, cc-dr) in g:
                return None
        if kors == 0 or kors == len(w): return None
        return kors

    def lagg(w, r, c, d):
        dr, dc = (0, 1) if d == 0 else (1, 0)
        for i, ch in enumerate(w):
            g[(r+dr*i, c+dc*i)] = ch
            used.setdefault((r+dr*i, c+dc*i), set()).add(d)
        plac.append((w, r, c, d))

    def bb(extra):
        pts = list(g.keys()) + extra
        rs = [p[0] for p in pts]; cs = [p[1] for p in pts]
        return max(rs)-min(rs)+1, max(cs)-min(cs)+1

    lagg(ordn[0], 0, 0, 0)
    kvar = ordn[1:]
    for _ in range(5):
        ny = []
        for w in kvar:
            kand = []
            for (r, c), ch in list(g.items()):
                for i, wc in enumerate(w):
                    if wc != ch: continue
                    for d in (0, 1):
                        rr, cc = (r, c-i) if d == 0 else (r-i, c)
                        k = ok(w, rr, cc, d)
                        if k is None: continue
                        dr, dc = (0, 1) if d == 0 else (1, 0)
                        h, bw = bb([(rr+dr*j, cc+dc*j) for j in range(len(w))])
                        if h > maxs or bw > maxs: continue
                        kand.append((k*2 - (h+bw)*0.12 + rnd.random()*1.5, rr, cc, d))
            if kand:
                kand.sort(reverse=True)
                _, rr, cc, d = kand[0]
                lagg(w, rr, cc, d)
            else:
                ny.append(w)
        if len(ny) == len(kvar): break
        kvar = ny
    return g, plac

def bygg():
    orden = {w.upper(): w for w in CLUES if len(w) <= MAXLEN}
    best = None
    for seed in range(int(os.environ.get('SEEDS','1500'))):
        g, plac = lager(list(orden.keys()), seed, MAXS)
        rs = [p[0] for p in g]; cs = [p[1] for p in g]
        area = (max(rs)-min(rs)+1) * (max(cs)-min(cs)+1)
        sc = len(plac)*100 - area*0.2
        if best is None or sc > best[0]: best = (sc, g, plac)
    _, g, plac = best
    r0 = min(p[0] for p in g); c0 = min(p[1] for p in g)
    R = max(p[0] for p in g)-r0+1; C = max(p[1] for p in g)-c0+1
    sol = [[g.get((r0+r, c0+c), "") for c in range(C)] for r in range(R)]
    black = [[0 if sol[r][c] else 1 for c in range(C)] for r in range(R)]
    # numrering enligt mallens regler
    def isb(r, c): return r < 0 or c < 0 or r >= R or c >= C or black[r][c] == 1
    numbers = [[0]*C for _ in range(R)]
    n = 0; across = {}; down = {}
    for r in range(R):
        for c in range(C):
            if black[r][c]: continue
            sa = isb(r, c-1) and not isb(r, c+1)
            sd = isb(r-1, c) and not isb(r+1, c)
            if sa or sd:
                n += 1; numbers[r][c] = n
                if sa:
                    w = ""; cc = c
                    while cc < C and not black[r][cc]: w += sol[r][cc]; cc += 1
                    across[n] = w
                if sd:
                    w = ""; rr = r
                    while rr < R and not black[rr][c]: w += sol[rr][c]; rr += 1
                    down[n] = w
    # kontroll: alla ord i rutnätet ska vara med i CLUES och alla utplacerade ord ska finnas
    funna = set(across.values()) | set(down.values())
    utplacerade = {p[0] for p in plac}
    assert funna == utplacerade, (funna ^ utplacerade)
    return R, C, sol, black, numbers, across, down, orden

def li(n, w, orden):
    t = CLUES[orden[w]]
    stam = orden[w].lower()[:5]
    assert stam not in t.lower(), (w, t)
    return f'<li value="{n}">{t} <span class="len">({len(w)})</span></li>'

def html():
    R, C, sol, black, numbers, across, down, orden = bygg()
    src = open(f"{ROOT}/kemi/elektrokemi/korsord.html", encoding="utf-8").read()
    h = src
    def rep(a, b):
        nonlocal h
        if a not in h: raise SystemExit("saknas i mallen: " + a[:70])
        h = h.replace(a, b)
    h = re.sub(r"const DATA = \{.*?\};\n", lambda m: "const DATA = " + json.dumps({"rows": R, "cols": C, "black": black, "solution": sol, "numbers": numbers}, ensure_ascii=False) + ";\n", h, count=1, flags=re.S)
    # ledtrådslistor
    a_html = "\n            ".join(li(n, w, orden) for n, w in sorted(across.items()))
    d_html = "\n            ".join(li(n, w, orden) for n, w in sorted(down.items()))
    h = re.sub(r'(<h2>Vågrätt</h2>\s*<ol>).*?(</ol>)', lambda m: m.group(1) + "\n            " + a_html + "\n          " + m.group(2), h, count=1, flags=re.S)
    h = re.sub(r'(<h2 style="margin-top:10px;">Lodrätt</h2>\s*<ol>).*?(</ol>)', lambda m: m.group(1) + "\n            " + d_html + "\n          " + m.group(2), h, count=1, flags=re.S)
    rep("<title>Korsord: Elektrokemi</title>", "<title>Korsord – Separationsprocesser – Kemi</title>")
    rep("<h1>Korsord: Elektrokemi</h1>", "<h1>Korsord: Separationsprocesser</h1>")
    rep("Facit – Korsord: Elektrokemi", "Facit – Korsord: Separationsprocesser")
    rep("background: #ede7f6;", "background: #ecfeff;")
    rep("grid-template-columns: repeat(17, var(--cell));", f"grid-template-columns: repeat({C}, var(--cell));")
    rep("--cell: 34px;", f"--cell: 34px;")
    rep('<body>\n', '<body class="area-separation">\n')
    rep('<button class="hamburger" onclick="toggleMenu()">', '<button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">')
    rep("Fyll i rutorna. En ruta blir röd direkt om bokstaven är fel.",
        "Fyll i rutorna med begreppen. Siffran i parentes visar hur många bokstäver ordet har. Å, Ä och Ö har egna rutor. En ruta blir mörkt orange med ✕ direkt om bokstaven är fel.")
    rep('<div class="top-actions">', '<div class="top-actions page-actions no-print">')
    rep('background: #D32F2F !important;\n    outline: 3px solid #7f0000;', 'background: #9a3412 !important;\n    outline: 3px solid #431407;')
    # ledtrådslängd i grått och mobil
    rep("    body { margin: 0; }\n", "    body { margin: 0; background: #fff !important; }\n    .clue-box:not(.print-clues) { display: none !important; }\n    .print-clues h2 { break-after: avoid; break-inside: avoid; }\n")
    rep("  .num {", f"  .len {{ color:#475569; white-space:nowrap; }}\n  @media (max-width: 700px) {{ body {{ margin: 12px; }} .grid {{ --cell: max(26px, calc((100vw - 40px) / {C})); }} .cell input {{ font-size: 15px; }} .grid-wrap {{ order: -1; justify-content: start; }} }}\n  .num {{")
    open(f"{DST}/korsord.html", "w", encoding="utf-8").write(h)
    print("rutnät", R, "x", C, "| vågrätt", len(across), "lodrätt", len(down), "ord totalt", len(across)+len(down))
    print("utan plats:", sorted(set(orden) - set(across.values()) - set(down.values())))

if __name__ == "__main__":
    html()
