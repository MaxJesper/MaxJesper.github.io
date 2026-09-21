# -*- coding: utf-8 -*-
"""Genererar data/begreppsbingo.json och begrepp-bingo.html för Kemi som ämne (mall: elektrokemi)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from data_begrepp import BEGREPP

ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/kemi-som-amne"

# Definitioner som inte avslöjar begreppet (bingot läser upp definitionen, eleven hittar termen)
OVERRIDE = {
 "Materia": "Allt som har massa och tar plats: fast form, vätska och gas. Allt du kan ta på består av det.",
 "Ämne": "Ett visst slags material, till exempel vatten, järn, socker eller syre. Har bestämda egenskaper.",
 "Föremål": "En sak som är gjord av något material. En sked är ett exempel, och stålet den är gjord av är ämnet.",
 "Kemikalie": "Ett annat ord för ett ämne, särskilt ett som tillverkas eller används i produkter. Vatten och salt är exempel.",
 "Kontrollvariabel": "Något som hålls lika i alla försök så att jämförelsen blir rättvis.",
 "Fysikalisk egenskap": "Något du kan iaktta eller mäta utan att ämnet blir ett annat, till exempel färg, densitet och smältpunkt.",
 "Kemisk egenskap": "Beskriver hur ett ämne reagerar med andra ämnen och bildar nya, till exempel att det brinner eller rostar.",
 "Densitet": "Hur mycket massa något har per volym, ρ = m / V, ofta i g/cm³. Det som har lägre värde än en vätska flyter i den.",
 "Nobelpris": "Ett pris som delas ut varje år sedan 1901 enligt en svensk uppfinnares testamente, bland annat i kemi.",
 "Oberoende variabel": "Det du ändrar med avsikt i en undersökning. Bara en sak ska ändras åt gången.",
 "Beroende variabel": "Det du mäter i en undersökning, och som du tror påverkas av det du ändrar.",
 "Variabel": "Något som kan ändras eller mätas i en undersökning.",
}
# För få ledtrådar för bingot om begreppet är nästan bara ett ord i sin egen definition:
UTAN = set()  # inga uteslutna

def bygg_json():
    lst = []
    for t, d in BEGREPP.items():
        if t in UTAN: continue
        lst.append({"term": t, "def": OVERRIDE.get(t, d)})
    out = {"title": "Begreppsbingo – Kemi som ämne", "begrepp": lst}
    with open(f"{DST}/data/begreppsbingo.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    return lst

def bygg_html():
    src = open(f"{ROOT}/kemi/elektrokemi/begrepp-bingo.html", encoding="utf-8").read()
    h = src
    def rep(a, b, n=None):
        nonlocal h
        if a not in h: raise SystemExit("saknas i mallen: " + a[:60])
        h = h.replace(a, b) if n is None else h.replace(a, b, n)
    rep("<title>Begreppsbingo – Elektrokemi</title>", "<title>Begreppsbingo – Kemi som ämne – Kemi</title>")
    rep("--gron:#1d4ed8; --gron-m:#597fe9; --gron-l:#ecf0fb;", "--gron:#3730a3; --gron-m:#4338ca; --gron-l:#eef2ff;")
    # markerade rutor: brunorange + bock i stället för grönt (rödgrön färgblindhet)
    rep("--ratt:#2e9e5b; --ratt-l:#e4f6ea;", "--ratt:#7c2d12; --ratt-l:#ffedd5;")
    rep("--fel:#d64545; --fel-l:#fce8e8;", "--fel:#9a3412; --fel-l:#ffedd5;")
    rep("linear-gradient(160deg,var(--ratt-l),#bdeecb)", "linear-gradient(160deg,var(--ratt-l),#fdba74)")
    rep("rgba(46,158,91,.28)", "rgba(194,65,12,.30)"); rep("rgba(46,158,91,.22)", "rgba(194,65,12,.22)")
    rep("#d7f2e6", "#e0e7ff"); rep("linear-gradient(160deg,#eef6f2,#dcefe6)", "linear-gradient(160deg,#eef2ff,#e0e7ff)")
    rep('"#2e8b6f","#3b7dd8","#f0a500","#d64545"', '"#4338ca","#3b7dd8","#f0a500","#9a3412"')
    rep("  #bingo .cell.darrar{", "  #bingo .cell.markerad::after{content:\"✓\";position:absolute;top:4px;right:8px;font-size:1rem;font-weight:900;color:var(--ratt)}\n  #bingo .cell.markerad.fri::after{content:\"\"}\n  #bingo .cell.darrar{")
    rep('<body>\n', '<body class="area-amne">\n')
    rep("<h1>Elektrokemi</h1>\n  <p>Begreppsbingo</p>", "<h1>Begreppsbingo</h1>\n  <p>Kemi som ämne</p>")
    rep('<button class="hamburger" onclick="toggleMenu()">', '<button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">')
    rep('<p>\n    <a href="./larande-spel.html" class="subject-btn">← Tillbaka till lärande spel</a>\n  </p>',
        '<div class="page-actions no-print">\n    <a href="./larande-spel.html" class="subject-btn">← Tillbaka till lärande spel</a>\n  </div>')
    h = h.replace("om elektrokemi istället för siffror", "om kemi som ämne i stället för siffror")
    h = h.replace("om elektrokemi", "om kemi som ämne")
    h = h.replace("istället", "i stället")
    if "lektrokemi" in h: print("VARNING: elektrokemi kvar:", [m.start() for m in re.finditer("lektrokemi", h)])
    open(f"{DST}/begrepp-bingo.html", "w", encoding="utf-8").write(h)

if __name__ == "__main__":
    l = bygg_json(); print(len(l), "begrepp"); bygg_html()
