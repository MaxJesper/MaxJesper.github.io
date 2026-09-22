#!/usr/bin/env python3
"""Kör hela byggkedjan för kemi/matens-kemi i rätt ordning.
Körs: python3 bygg_alla.py"""
import subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))

STEG = [
    "bygg_maten.py",        # molekyler: SVG + PNG + js/molmodeller.js (data + png)
    "bygg_studieguide.py",  # studieguide.html (använder card_html från bygg_maten)
    "bygg_index.py",        # index.html (använder data_begrepp)
    "bygg_data.py",         # data/*.json (begrepp/termer alla språk, checklista, frågor, övningar)
    "bygg_sidor.py",        # checklista/begreppslista/instudering/prov/facit
    "bygg_verktyg.py",      # ovningsverktyg.html + larande-spel.html
    "bygg_kort_bingo.py",   # begreppskort.html + begrepp-bingo.html
    "bygg_korsord.py",      # korsord.html
    "bygg_lab.py",          # laborationer.html
]


def main():
    for script in STEG:
        path = os.path.join(HERE, script)
        print(f"\n=== {script} ===")
        r = subprocess.run([sys.executable, path], cwd=HERE)
        if r.returncode != 0:
            sys.exit(f"AVBRÖT: {script} misslyckades (kod {r.returncode})")
    print("\nAllt byggt utan fel.")


if __name__ == "__main__":
    main()
