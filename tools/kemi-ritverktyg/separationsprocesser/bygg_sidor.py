#!/usr/bin/env python3
"""Genererar standardsidorna i kemi/separationsprocesser/ utifrån mallarna i kemi/atomer/ (färg + text byts).
Körs: python3 bygg_sidor.py  (efter bygg_studieguide.py och bygg_data.py)."""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
A = os.path.join(ROOT, "kemi", "atomer"); OUT = os.path.join(ROOT, "kemi", "separationsprocesser")

# rosa (atomer) -> turkos (separationsprocesser)
COL = {"#be185d": "#0e7490", "#9d174d": "#155e75", "#fdf2f8": "#ecfeff", "#fbcfe8": "#a5f3fc",
       "#fce7f3": "#cffafe", "#f0abcb": "#67e8f9", "#fef7fb": "#f3fdff", "#fffafd": "#f8feff"}
# grönt/rött -> blått/orange (Jesper är rödgrön färgblind; informationen finns även som text)
COL2 = {"#dcfce7": "#dbeafe", "#86efac": "#93c5fd", "#166534": "#1e3a8a", "#15803d": "#1d4ed8",
        "#ecfdf5": "#eff6ff", "#fee2e2": "#ffedd5", "#fca5a5": "#fdba74", "#991b1b": "#9a3412",
        "rgba(34,197,94,.18)": "rgba(29,78,216,.18)", "rgba(34,197,94,.35)": "rgba(29,78,216,.35)"}

def read(n): return open(os.path.join(A, n), encoding="utf-8").read()
def write(n, t):
    open(os.path.join(OUT, n), "w", encoding="utf-8").write(t); print("skrev", n, len(t))

def base(t, colors2=False):
    t = t.replace("Atomer och molekyler", "Separationsprocesser").replace("area-atomer", "area-separation")
    for a, b in COL.items(): t = t.replace(a, b)
    if colors2:
        for a, b in COL2.items(): t = t.replace(a, b)
    return t

def move_actions_first(t, cls, before_cls):
    """Flyttar åtgärdsraden (class=cls) före rutan (class=before_cls) – navigering/utskrift först i <main>."""
    m = re.search(r'\n    <div class="%s">.*?\n    </div>\n' % cls, t, re.S)
    assert m, cls
    block = m.group(0); t = t.replace(block, "\n", 1)
    i = t.index('    <div class="%s"' % before_cls)
    return t[:i] + block.lstrip("\n") + "\n" + t[i:]

def main():
    # --- rena kopior med färg/text ---
    for n in ["checklista.html", "instuderingsfragor-print-elev.html", "instuderingsfragor-print-larare.html",
              "ovningsprov-print.html", "facit.html", "facit-print.html"]:
        write(n, base(read(n)))
    t = base(read("instuderingsfragor.html")); t = move_actions_first(t, "study-actions", "study-info")
    write("instuderingsfragor.html", t)
    t = base(read("ovningsprov.html")); t = move_actions_first(t, "prov-actions", "study-info")
    t = t.replace('<a href="./facit.html" class="subject-btn">✅ Facit</a>',
                  '<a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>\n      <a href="./facit.html" class="subject-btn">✅ Facit</a>')
    write("ovningsprov.html", t)
    # --- begreppskort: samma spel, ny data, utan onödig Tailwind-CDN, blå/orange i stället för grön/röd ---
    t = base(read("begreppskort.html"), colors2=True)
    t = t.replace('  <script src="https://cdn.tailwindcss.com"></script>\n', "")
    t = t.replace("    .layout{\n", "    /* ersätter Tailwind-preflight som mallen använde */\n    *, *::before, *::after{ box-sizing: border-box; }\n    .layout > *{ min-width: 0; }\n    .layout{\n", 1)
    write("begreppskort.html", t)
    # --- begreppslista ---
    t = base(read("begreppslista.html"))
    t = t.replace('''    <div class="print-bar no-print">
      <a href="./" class="subject-btn">← Tillbaka</a>
      <button onclick="window.print()" class="subject-btn" style="cursor:pointer;">🖨️ Skriv ut / Spara som PDF</button>
    </div>''', '''    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
      <button type="button" class="subject-btn print-green" onclick="window.print()">🖨️ Skriv ut / Spara som PDF</button>
    </div>''')
    t = t.replace("Alla viktiga begrepp inom atomer och molekyler med förklaringar.", "Alla viktiga begrepp inom separationsprocesser med förklaringar.")
    assert "page-actions" in t
    write("begreppslista.html", t)

if __name__ == "__main__":
    main()
