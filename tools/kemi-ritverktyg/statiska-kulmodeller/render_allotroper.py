#!/usr/bin/env python3
"""Renderar kulmodeller av kolets former (diamant, grafit, fulleren C60, grafen, nanorör) till statiska PNG:er.
Atomkoordinaterna genereras av allotroper.py (kända kristallstrukturer, bindningar efter avstånd).

  python3 render_allotroper.py

Resultat: images/kemi/kol-och-kolforeningar/kulmodeller/{diamant,grafit,fulleren,grafen,nanoror}.png
Nanoröret visas som HALVT rör (bara atomer med z > CUTZ) - annars täcker främre och bakre väggen varandra.
Bilderna är förenklade: alla bindningar ritas som enkla pinnar; diamanten är bara ett litet kluster.
"""
import os
from playwright.sync_api import sync_playwright
import _server as S
import chembuilder as cb
from allotroper import BUILD, to_atoms_bonds, report

CUTZ = -0.4
# (rotX, rotY, px per Å, sfärskala, pinnradie) – valda för god läsbarhet, inte samma atomstorlek rakt av
FINAL = {'diamant': (25, 35, 30, 0.22, 0.10), 'grafit': (-60, 10, 22, 0.25, 0.11), 'fulleren': (-25, 20, 34, 0.22, 0.10),
         'grafen': (-25, 0, 26, 0.28, 0.12), 'nanoror': (-15, 25, 26, 0.20, 0.09)}

if __name__ == '__main__':
    S.OUT_DIR.mkdir(parents=True, exist_ok=True)
    srv = S.start_server(8769)
    with sync_playwright() as p:
        b, pg = S.open_page(p, 8769)
        for name, build in BUILD.items():
            P, cut = build()
            if name == 'nanoror': P = P[P[:, 2] > CUTZ]
            print(report(name, P, cut))
            atoms, bonds = to_atoms_bonds(P, cut)
            rx, ry, ppa, sphere, stick = FINAL[name]
            im = S.render(pg, cb.write_molblock(atoms, bonds, name), (), (rx, ry), ppa, sphere, stick)
            im.save(S.OUT_DIR / f'{name}.png', optimize=True)
            print(f'   -> {name}.png {im.width}x{im.height}px  width="{round(im.width / 3)}" height="{round(im.height / 3)}"')
        b.close()
    srv.shutdown()
