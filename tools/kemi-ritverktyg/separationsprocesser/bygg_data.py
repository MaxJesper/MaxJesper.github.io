#!/usr/bin/env python3
"""Skriver kemi/separationsprocesser/data/*.json från data_*.py. Kör efter bygg_studieguide.py."""
import os, re, json, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
D = os.path.join(ROOT, "kemi", "separationsprocesser", "data"); os.makedirs(D, exist_ok=True)
from data_begrepp import BEGREPP, KORT, CHECKLISTA
from data_fragor import INSTUDERING, PROV
from data_ovningar import SORTERING

def w(name, obj):
    with open(os.path.join(D, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1); f.write("\n")

# ankare: första milstolpen där begreppet förekommer som klickbart ord
html = open(os.path.join(ROOT, "kemi", "separationsprocesser", "studieguide.html"), encoding="utf-8").read()
first = {}
for m in re.finditer(r'<details class="milestone" id="(m\d+)"(.*?)(?=<details class="milestone"|<section class="references")', html, re.S):
    for t in re.findall(r'data-concept="([^"]+)"', m.group(2)):
        first.setdefault(t.replace("&amp;", "&"), m.group(1))
TERMER = json.load(open(os.path.join(HERE, "termer_i_text.json"), encoding="utf-8"))  # övriga fetmarkerade ord: bara översättning
for t in TERMER: first.pop(t, None)
missing = [t for t in first if t not in BEGREPP]
extra = [t for t in BEGREPP if t not in first]
if missing: sys.exit("Begrepp i texten utan definition: %s" % missing)
if extra: print("OBS: definierade men ej klickbara i texten:", extra)

order = list(first.keys()) + extra
begrepp = [{"namn": t, "definition": BEGREPP[t], "anchor": "./studieguide.html#" + first.get(t, "m1")} for t in order]
w("begrepp.json", begrepp)
w("begreppskort.json", {"title": "Begreppskort – Separationsprocesser",
                        "levels": {k: [{"term": a, "def": b} for a, b in v] for k, v in KORT.items()}})
w("checklista.json", CHECKLISTA)
w("instuderingsfragor.json", INSTUDERING)
w("ovningsprov.json", PROV)
w("ovningar.json", {"sortering": SORTERING, "balansering": []})
nq = sum(len(g["items"]) for g in INSTUDERING["groups"])
np_ = sum(len(s["questions"]) for s in PROV["sections"])
print("begrepp", len(begrepp), "| kort", {k: len(v) for k, v in KORT.items()}, "| instudering", nq, "| prov", np_, "| övningar", len(SORTERING))
for k in KORT:
    for a, _ in KORT[k]:
        if a not in BEGREPP: print("Begreppskort utan begrepp:", a)

from data_valj import METODER, SCENARIER
w("valjmetod.json", {"metoder": METODER, "scenarier": SCENARIER})
print("valjmetod: scenarier", len(SCENARIER))
