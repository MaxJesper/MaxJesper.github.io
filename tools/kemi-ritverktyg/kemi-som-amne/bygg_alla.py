# -*- coding: utf-8 -*-
"""Bygger om HELA området kemi/kemi-som-amne från källorna i den här mappen.
Kör:  cd tools/kemi-ritverktyg/kemi-som-amne && python3 bygg_alla.py
Kräver: python3, beautifulsoup4. Skriver bara i kemi/kemi-som-amne/ och images/kemi/kemi-som-amne/.
Ordningen spelar roll: bygg_labbspel först (lägger fotogalleriet i studieguidens källa), bygg_data läser ankare ur den byggda
studieguiden, sidorna läser data."""
import os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
STEG = ["rita_alla.py", "bygg_labbspel.py", "bygg_studieguide.py", "bygg_data.py", "bygg_sidor.py", "bygg_verktyg.py",
        "bygg_lab.py", "bygg_tryck.py", "bygg_bingo.py", "bygg_korsord.py", "bygg_index.py"]
for s in STEG:
    print("==>", s, flush=True)
    r = subprocess.run([sys.executable, s], cwd=HERE)
    if r.returncode:
        sys.exit("Misslyckades: " + s)
print("Klart. Översättningarna (data/begrepp.<språk>.json, data/termer.<språk>.json) byggs INTE om – de är AI-genererade och ännu inte korrekturlästa av modersmålstalare, och skrivs inte över.")
