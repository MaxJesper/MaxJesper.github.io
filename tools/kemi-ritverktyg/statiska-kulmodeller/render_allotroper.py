#!/usr/bin/env python3
"""Renderar kulmodeller av kolets former (diamant, grafit, fulleren C60, grafen, nanorör) till PNG.
Atomkoordinaterna genereras av allotroper.py (kända kristallstrukturer, bindningar efter avstånd).

  python3 render_allotroper.py

Resultat: images/kemi/kol-och-kolforeningar/kulmodeller/{diamant,grafit,fulleren,grafen,nanoror}.png
PNG-bilderna är reserv (noscript/utskrift): i studieguiden är kolformerna ROTERBARA 3Dmol-vyer direkt i
milstolpen (samma modeller ligger i MOLS i sidans script, skapade med allotroper.molblocks()).
Små kulor (allotroper.STIL) så att man ser igenom strukturen och kan följa hur atomerna sitter ihop.
Bilderna är förenklade: alla bindningar ritas som enkla pinnar; diamanten är ett kluster på 87 atomer.
"""
from playwright.sync_api import sync_playwright
import _server as S
import chembuilder as cb
from allotroper import BUILD, STIL, VY, to_atoms_bonds, report

PPA = {'diamant': 24, 'grafit': 22, 'fulleren': 34, 'grafen': 26, 'nanoror': 26}   # px per Å

if __name__ == '__main__':
    S.OUT_DIR.mkdir(parents=True, exist_ok=True)
    srv = S.start_server(8769)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8769)
        for name, build in BUILD.items():
            P, cut = build()
            print(report(name, P, cut))
            atoms, bonds = to_atoms_bonds(P, cut)
            im = S.render(pg, cb.write_molblock(atoms, bonds, name), (), VY[name], PPA[name], STIL[0], STIL[1])
            im.save(S.OUT_DIR / f'{name}.png', optimize=True)
            print(f'   -> {name}.png {im.width}x{im.height}px  width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()
