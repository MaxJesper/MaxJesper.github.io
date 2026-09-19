#!/usr/bin/env python3
"""Renderar de STATISKA kulmodell-PNG:erna som ligger bredvid texten i studieguidens bildkolumn.

Källa: MOLS (molblock) och MULTI (extra cylindrar för dubbel-/trippelbindningar) i studieguidens inbäddade
JavaScript – samma data som det roterbara galleriet ("Utforska i 3D") använder, så bilderna och 3D-modellerna
alltid är samma geometri. Ny molekyl: bygg den med chembuilder.py, lägg in den i MOLS/MULTI, kör det här skriptet.

  python3 render_kulmodeller.py                    # alla molekyler
  python3 render_kulmodeller.py etanol butan       # bara vissa
  PPA=34 python3 render_kulmodeller.py             # px per ångström (standard 34 = samma atomstorlek i alla bilder)

Resultat: images/kemi/kol-och-kolforeningar/kulmodeller/<stem>.png (3x upplösning, transparent, autobeskuren).
I HTML: width/height = PNG-storleken / 3 (skrivs ut här), så att bilden visas skarp på retina-skärmar.
Kräver: pip install playwright pillow  +  Chromium (playwright install chromium).
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright
import _server as S
from allotroper import BUILD as ALLOTROPER      # kolets former renderas av render_allotroper.py (egen stil)

GUIDE = S.REPO / 'kemi/kol-och-kolforeningar/studieguide.html'
PPA = float(os.environ.get('PPA', 34))
DEFAULT_VIEW = (-25, 0)                                   # rotX, rotY: lätt uppifrån
# Sett från andra hållet, annars döljs OH-grupperna bakom kolkedjan:
VIEW = {'glykol': (25, 0), 'glycerol': (25, 0), 'propan12diol': (25, 0)}

def load_mols():
    html = GUIDE.read_text(encoding='utf-8')
    mols = json.loads(re.search(r'var MOLS = (\{.*?\});\s*\n', html, re.S).group(1))
    multi = json.loads(re.search(r'var MULTI = (\{.*?\});', html, re.S).group(1))
    return mols, multi

if __name__ == '__main__':
    mols, multi = load_mols()
    names = sys.argv[1:] or [n for n in mols if n not in ALLOTROPER]
    S.OUT_DIR.mkdir(parents=True, exist_ok=True)
    srv = S.start_server(8766)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8766)
        for n in names:
            im = S.render(pg, mols[n], multi.get(n, []), VIEW.get(n, DEFAULT_VIEW), PPA)
            im.save(S.OUT_DIR / f'{n}.png', optimize=True)
            print(f'{n:15s} {im.width}x{im.height}px  ->  width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()
