#!/usr/bin/env python3
"""Genererar standardsidorna i kemi/matens-kemi/ utifrån mallarna i kemi/syror-och-baser/
(ett annat kort kemikapitel med samma sidstruktur) – färg/text/area-klass byts.
Körs: python3 bygg_sidor.py  (efter bygg_data.py, oberoende av studieguide/index)."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SRC = os.path.join(ROOT, "kemi", "syror-och-baser")
OUT = os.path.join(ROOT, "kemi", "matens-kemi")

# amber (syror-och-baser) -> fuchsia/vinröd (matens-kemi, ändrat 22 sep 2026 från orange – se CLAUDE.md)
COL = {
    "#b45309": "#a21caf", "#92400e": "#86198f", "#fffbeb": "#fdf4ff",
    "#fde68a": "#f5d0fe", "#fef3c7": "#fae8ff",
}


def read(n):
    return open(os.path.join(SRC, n), encoding="utf-8").read()


def write(n, t):
    with open(os.path.join(OUT, n), "w", encoding="utf-8") as f:
        f.write(t)
    print("skrev", n, len(t))


def base(t):
    t = t.replace("Syror och baser", "Matens kemi").replace("area-syror-och-baser", "area-matens-kemi")
    for a, b in COL.items():
        t = t.replace(a, b)
    return t


def main():
    for n in [
        "checklista.html",
        "instuderingsfragor.html",
        "instuderingsfragor-print-elev.html",
        "instuderingsfragor-print-larare.html",
        "ovningsprov-print.html",
        "facit.html",
        "facit-print.html",
    ]:
        write(n, base(read(n)))

    # --- begreppslista: byt print-bar mot page-actions (aktuell standard, se CLAUDE.md "Knappar, navigering och utskrift") ---
    t = base(read("begreppslista.html"))
    t = t.replace(
        '''    <div class="print-bar no-print">
      <a href="./" class="subject-btn">← Tillbaka</a>
      <button onclick="window.print()" class="subject-btn" style="cursor:pointer;">🖨️ Skriv ut / Spara som PDF</button>
    </div>''',
        '''    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
      <button type="button" class="subject-btn print-green" onclick="window.print()">🖨️ Skriv ut / Spara som PDF</button>
    </div>''',
    )
    t = t.replace(
        "Alla viktiga begrepp inom syror och baser med förklaringar. Används som stöd vid genomgångar och repetition.",
        "Alla viktiga begrepp inom matens kemi med förklaringar. Används som stöd vid genomgångar och repetition.",
    )
    # matens-kemi har längre flerordsbegrepp (t.ex. "Essentiell aminosyra") som annars tvingar
    # tabellen bredare än skärmen på mobil, eftersom mallens första kolumn har white-space: nowrap.
    t = t.replace(
        ".begrepp-table td:first-child { font-weight: 700; white-space: nowrap; color: var(--area-strong); width: 30%; }",
        ".begrepp-table td:first-child { font-weight: 700; white-space: nowrap; color: var(--area-strong); width: 30%; }\n"
        "    @media (max-width: 480px) { .begrepp-table td:first-child { white-space: normal; } }",
    )
    assert "page-actions" in t
    write("begreppslista.html", t)

    # --- ovningsprov: lägg till länk tillbaka till studieguiden ---
    t = base(read("ovningsprov.html"))
    t = t.replace(
        '<a href="./facit.html" class="subject-btn print-green">✅ Visa facit</a>',
        '<a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>\n    <a href="./facit.html" class="subject-btn print-green">✅ Visa facit</a>',
    )
    write("ovningsprov.html", t)


if __name__ == "__main__":
    main()
