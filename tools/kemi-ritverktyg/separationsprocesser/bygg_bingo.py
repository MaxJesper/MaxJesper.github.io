# -*- coding: utf-8 -*-
"""Genererar data/begreppsbingo.json och begrepp-bingo.html för Separationsprocesser (mall: elektrokemi)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from data_begrepp import BEGREPP

ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/separationsprocesser"

# Definitioner som inte avslöjar begreppet (bingot läser upp definitionen, eleven hittar termen)
OVERRIDE = {
 "Partikelmodellen": "En modell där ämnen ritas som små kulor som alltid rör sig, och som rör sig snabbare ju högre temperatur det är.",
 "Plasma": "Den fjärde formen av materia: en gas så het att elektroner slitits loss från atomerna. Finns i blixtar, norrsken och solen.",
 "Fysikalisk förändring": "En förändring där inga nya ämnen bildas. Ämnet är detsamma efteråt, bara i en annan form eller blandat med något annat.",
 "Rent ämne": "Innehåller bara en sorts partiklar, antingen ett grundämne eller en kemisk förening. Har bestämda smält- och kokpunkter.",
 "Densitet": "Hur mycket massa något har per volym, ρ = m / V, ofta i g/cm³. Det som har högre värde än vätskan sjunker i den.",
 "Homogen blandning": "Ser likadan ut överallt, så att man inte kan urskilja de olika delarna, till exempel saltvatten och luft.",
 "Heterogen blandning": "Man kan se att den består av olika delar, till exempel sand i vatten eller granit.",
 "Lösningsmedel": "Ämnet som löser upp något annat, till exempel vattnet i saltvatten.",
 "Löst ämne": "Ämnet som har lösts upp i en lösning, till exempel saltet i saltvatten.",
 "Mättad lösning": "Kan inte lösa mer av ämnet. Tillsätter man mer ligger det kvar på botten.",
 "Destillat": "Vätskan som samlas upp när ångan har kylts och blivit vätska igen i kylaren.",
 "Rf-värde": "Sträckan ett ämne har vandrat delat med sträckan lösningsmedlet har vandrat i kromatografi. Ligger mellan 0 och 1.",
 "Fällning": "Nytt, olösligt fast ämne som bildas och sjunker till botten när två lösningar blandas.",
 "Variabel": "Något som kan ändras eller mätas i en undersökning. Den man ändrar kallas oberoende, den man mäter kallas beroende.",
 "Slamning": "En blandning där fasta korn svävar i en vätska, till exempel lera i vatten. Kornen sjunker med tiden.",
}
# För få ledtrådar för bingot om begreppet är nästan bara ett ord i sin egen definition:
UTAN = set()  # inga uteslutna

def bygg_json():
    lst = []
    for t, d in BEGREPP.items():
        if t in UTAN: continue
        lst.append({"term": t, "def": OVERRIDE.get(t, d)})
    out = {"title": "Begreppsbingo – Separationsprocesser", "begrepp": lst}
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
    rep("<title>Begreppsbingo – Elektrokemi</title>", "<title>Begreppsbingo – Separationsprocesser – Kemi</title>")
    rep("--gron:#1d4ed8; --gron-m:#597fe9; --gron-l:#ecf0fb;", "--gron:#155e75; --gron-m:#0e7490; --gron-l:#ecfeff;")
    # markerade rutor: brunorange + bock i stället för grönt (rödgrön färgblindhet)
    rep("--ratt:#2e9e5b; --ratt-l:#e4f6ea;", "--ratt:#7c2d12; --ratt-l:#ffedd5;")
    rep("--fel:#d64545; --fel-l:#fce8e8;", "--fel:#9a3412; --fel-l:#ffedd5;")
    rep("linear-gradient(160deg,var(--ratt-l),#bdeecb)", "linear-gradient(160deg,var(--ratt-l),#fdba74)")
    rep("rgba(46,158,91,.28)", "rgba(194,65,12,.30)"); rep("rgba(46,158,91,.22)", "rgba(194,65,12,.22)")
    rep("#d7f2e6", "#cffafe"); rep("linear-gradient(160deg,#eef6f2,#dcefe6)", "linear-gradient(160deg,#ecfeff,#cffafe)")
    rep('"#2e8b6f","#3b7dd8","#f0a500","#d64545"', '"#0e7490","#3b7dd8","#f0a500","#9a3412"')
    rep("  #bingo .cell.darrar{", "  #bingo .cell.markerad::after{content:\"✓\";position:absolute;top:4px;right:8px;font-size:1rem;font-weight:900;color:var(--ratt)}\n  #bingo .cell.markerad.fri::after{content:\"\"}\n  #bingo .cell.darrar{")
    rep('<body>\n', '<body class="area-separation">\n')
    rep("<h1>Elektrokemi</h1>\n  <p>Begreppsbingo</p>", "<h1>Begreppsbingo</h1>\n  <p>Separationsprocesser</p>")
    rep('<button class="hamburger" onclick="toggleMenu()">', '<button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">')
    rep('<p>\n    <a href="./larande-spel.html" class="subject-btn">← Tillbaka till lärande spel</a>\n  </p>',
        '<div class="page-actions no-print">\n    <a href="./larande-spel.html" class="subject-btn">← Tillbaka till lärande spel</a>\n  </div>')
    h = h.replace("om elektrokemi istället för siffror", "om separationsprocesser i stället för siffror")
    h = h.replace("om elektrokemi", "om separationsprocesser")
    h = h.replace("istället", "i stället")
    if "lektrokemi" in h: print("VARNING: elektrokemi kvar:", [m.start() for m in re.finditer("lektrokemi", h)])
    open(f"{DST}/begrepp-bingo.html", "w", encoding="utf-8").write(h)

if __name__ == "__main__":
    l = bygg_json(); print(len(l), "begrepp"); bygg_html()
