# -*- coding: utf-8 -*-
"""Genererar korsord.html för Ämnet kemi (mall: elektrokemi/korsord.html). Ord ur BEGREPP, egna ledtrådar."""
import json, os, random, re, sys
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/kemi-som-amne"

CLUES = {
"Kemi": "Läran om ämnen och hur de förändras.",
"Materia": "Allt som har massa och tar plats.",
"Ämne": "Ett visst slags materia, till exempel vatten, järn eller syre.",
"Föremål": "En sak som är gjord av något material, till exempel en sked eller en bägare.",
"Kemikalie": "Ett annat ord för ett ämne. Vatten och salt är exempel.",
"Makronivå": "Nivån där du ser, känner och mäter.",
"Partikelnivå": "Nivån där du förklarar med atomer och molekyler som du föreställer dig.",
"Symbolnivå": "Nivån där du skriver formler och tecken, till exempel H₂O.",
"Frågeställning": "Frågan som en undersökning ska besvara.",
"Hypotes": "En gissning som bygger på det man redan vet och som går att pröva.",
"Medelvärde": "Summan av alla mätvärden delat med antalet mätvärden.",
"Felkälla": "Något som kan ha gjort ett mätresultat mindre pålitligt.",
"Variabel": "Något som kan ändras eller mätas i en undersökning.",
"Observation": "Det du faktiskt ser, mäter eller hör, utan att tolka.",
"Teori": "Förklaring som prövats av många forskare och stått emot granskning.",
"Modell": "Förenklad bild som hjälper oss att förstå, till exempel med små kulor.",
"Riskbedömning": "Att tänka efter innan man börjar: vad kan gå fel och hur minskar jag faran?",
"Faropiktogram": "Symbol i en romb med röd kant som visar vilken sorts fara en produkt har.",
"Signalord": "Fara eller Varning på etiketten.",
"Bunsenbrännare": "Gasbrännare i kemisalen med gul eller blå låga.",
"Egenskap": "Något du kan se, mäta eller pröva hos ett ämne, till exempel färg.",
"Densitet": "Massa per volym, ρ = m / V.",
"Alkemi": "Gammal blandning av experiment och filosofi som försökte göra guld av bly.",
"Nobelpris": "Pris som delas ut varje år sedan 1901 enligt en svensk uppfinnares testamente.",
"Meniskus": "Den böjda ytan hos vätskan i en mätcylinder. Läs av vid den nedersta punkten.",
"Trefot": "Ställ som bär upp kärlet över lågan.",
"Trådnät": "Läggs på trefoten och sprider värmen.",
"Stativ": "En stång på fot som håller övrig utrustning.",
"Bägare": "Kärl med ungefärlig skala för att blanda och värma vätskor.",
"Provrör": "Litet smalt glasrör för små mängder vid prov.",
"Mätglas": "Kärl med skala för att mäta volym noggrant.",
"Termometer": "Instrument som mäter temperatur.",
"Spatel": "Redskap för att ta upp fasta ämnen.",
"Slutsats": "Svaret på frågan efter att du har tolkat resultaten.",
"Resultat": "Det du mätte och såg i försöket, utan förklaringar.",
"Skyddsglasögon": "Ska sitta på innan du hämtar något i kemisalen.",
"Romb": "Fyrkant på spetsen. Faropiktogram har den formen.",
"Ättika": "Sur vätska som får bikarbonat att bubbla.",
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
    rep("<title>Korsord: Elektrokemi</title>", "<title>Korsord – Ämnet kemi – Kemi</title>")
    rep("<h1>Korsord: Elektrokemi</h1>", "<h1>Korsord: Ämnet kemi</h1>")
    rep("Facit – Korsord: Elektrokemi", "Facit – Korsord: Ämnet kemi")
    rep("background: #ede7f6;", "background: #eef2ff;")
    rep("grid-template-columns: repeat(17, var(--cell));", f"grid-template-columns: repeat({C}, var(--cell));")
    rep("--cell: 34px;", f"--cell: 34px;")
    rep('<body>\n', '<body class="area-amne">\n')
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
