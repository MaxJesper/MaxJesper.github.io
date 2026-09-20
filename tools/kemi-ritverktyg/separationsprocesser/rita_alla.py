# -*- coding: utf-8 -*-
"""Ritar alla bilder till kemi/separationsprocesser. Körs från denna mapp:
   OUT=../../../images/kemi/separationsprocesser python3 rita_alla.py"""
import os, runpy
out = os.environ.get("OUT", "../../../images/kemi/separationsprocesser")
os.makedirs(out, exist_ok=True)
import rita_1, rita_2
for name, fn in [("tre-former", rita_1.tre_former), ("fasovergangar", rita_1.fasovergangar), ("varmekurva", rita_1.varmekurva),
                 ("blandningstyper", rita_1.blandningstyper), ("loslighet-tre", rita_1.loslighet_tre), ("loslighet-temp", rita_1.loslighet_temp)] + rita_2.ALL:
    fn().save(os.path.join(out, name + ".svg"))
print("klart:", len(os.listdir(out)), "filer i", out)
