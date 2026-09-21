# -*- coding: utf-8 -*-
"""Ritar alla bilder till kemi/kemi-som-amne. Körs från denna mapp:
   OUT=../../../images/kemi/kemi-som-amne python3 rita_alla.py"""
import os
out = os.environ.get("OUT", "../../../images/kemi/kemi-som-amne")
os.makedirs(out, exist_ok=True)
import rita_amne
for name, fn in rita_amne.ALL:
    fn().save(os.path.join(out, name + ".svg"))
print("klart:", len(os.listdir(out)), "filer i", out)
