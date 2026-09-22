#!/usr/bin/env python3
"""Skriver kemi/matens-kemi/data/*.json från data_begrepp.py och data_fragor.py.
Körs: python3 bygg_data.py  (kan köras när som helst, oberoende av studieguide.html –
begreppens ankare (milstolpe) anges explicit i data_begrepp.BEGREPP, inte auto-detekterat)."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
D = os.path.join(ROOT, "kemi", "matens-kemi", "data")
os.makedirs(D, exist_ok=True)

from data_begrepp import LANGS, BEGREPP, TERMER, KORT, CHECKLISTA
from data_fragor import INSTUDERING, PROV
from data_ovningar import SORTERING


def w(name, obj):
    with open(os.path.join(D, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("skrev", name, len(obj) if isinstance(obj, list) else "")


def main():
    # --- svenska begrepp (bas) ---
    order = list(BEGREPP.keys())
    begrepp = [{"namn": t, "definition": BEGREPP[t]["def"], "anchor": "./studieguide.html#" + BEGREPP[t]["m"]} for t in order]
    w("begrepp.json", begrepp)

    # --- begrepp på andra språk ---
    for lang in LANGS:
        rows = []
        for t in order:
            i18n = BEGREPP[t]["i18n"].get(lang)
            if not i18n:
                continue
            namn_native, definition = i18n
            rows.append({"namn": t, "namn_native": namn_native, "definition": definition,
                         "anchor": "./studieguide.html#" + BEGREPP[t]["m"]})
        w(f"begrepp.{lang}.json", rows)

    # --- termer (sekundära, fetmarkerade ord utan egen popup-definition) ---
    for lang in LANGS:
        rows = []
        for t, tr in TERMER.items():
            if lang in tr:
                rows.append({"namn": t, "namn_native": tr[lang]})
        w(f"termer.{lang}.json", rows)

    # --- begreppskort ---
    w("begreppskort.json", {"title": "Begreppskort – Matens kemi",
                            "levels": {k: [{"term": a, "def": b} for a, b in v] for k, v in KORT.items()}})

    # --- checklista, instudering, prov ---
    w("checklista.json", CHECKLISTA)
    w("instuderingsfragor.json", INSTUDERING)
    w("ovningsprov.json", PROV)
    w("ovningar.json", {"sortering": SORTERING})

    nq = sum(len(g["items"]) for g in INSTUDERING["groups"])
    npv = sum(len(s["questions"]) for s in PROV["sections"])
    print("begrepp", len(begrepp), "| termer", len(TERMER), "| kort", {k: len(v) for k, v in KORT.items()},
          "| instudering", nq, "| prov", npv, "| språk", len(LANGS))

    # --- info: begreppskort har egna (term, def)-par och är avsiktligt bredare än BEGREPP (15 kärnbegrepp) ---
    wider = [a for lvl in KORT.values() for a, _ in lvl if a not in BEGREPP]
    if wider:
        print("info: begreppskort täcker även termer utanför kärnbegreppen (egen def i KORT, OK):", wider)


if __name__ == "__main__":
    main()
