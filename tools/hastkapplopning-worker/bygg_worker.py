#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bygger worker.js (EN fil) av
  1) spel/hastkapplopning/js/engine.js   (spelmotorn, delas med webbläsaren)
  2) tools/hastkapplopning-worker/src/worker-del.js  (router + Durable Object-klassen Rum)

Användning (från repots rot eller härifrån):
    python3 tools/hastkapplopning-worker/bygg_worker.py
Kontrollera bara att worker.js är uppdaterad (ändrar inget):
    python3 tools/hastkapplopning-worker/bygg_worker.py --kontrollera

worker.js ska ALDRIG ändras för hand. Ändra källfilerna ovan och bygg om.
Utdata är deterministisk (inga tidsstämplar): samma indata ger identisk fil.
"""
import hashlib
import os
import re
import subprocess
import sys

HAR = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HAR, "..", ".."))
ENGINE = os.path.join(REPO, "spel", "hastkapplopning", "js", "engine.js")
DEL = os.path.join(HAR, "src", "worker-del.js")
UT = os.path.join(HAR, "worker.js")


def las(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def bygg():
    engine = las(ENGINE)
    del_ = las(DEL)
    if re.search(r"^\s*import\s", engine, re.M):
        sys.exit("engine.js får inte innehålla import (den måste vara fristående).")
    if re.search(r"^export\s+default", engine, re.M) or re.search(r"^export\s*\{", engine, re.M):
        sys.exit("engine.js får bara använda 'export function' och 'export const'.")
    # Ta bort 'export ' i början av rad (function/const). Andra exportformer avvisas ovan.
    engine_utan = re.sub(r"^export\s+(function|const|let|class)\s", r"\1 ", engine, flags=re.M)
    if re.search(r"^\s*export\s", engine_utan, re.M):
        sys.exit("engine.js innehåller en export som byggskriptet inte förstår.")
    h1 = hashlib.sha256(engine.encode("utf-8")).hexdigest()[:12]
    h2 = hashlib.sha256(del_.encode("utf-8")).hexdigest()[:12]
    huvud = (
        "/* =====================================================================\n"
        "   GENERERAD FIL – ÄNDRA ALDRIG DEN FÖR HAND.\n"
        "   Byggd av tools/hastkapplopning-worker/bygg_worker.py ur\n"
        "     spel/hastkapplopning/js/engine.js        (sha256 %s)\n"
        "     tools/hastkapplopning-worker/src/worker-del.js (sha256 %s)\n"
        "   Driftsätt med:  npx wrangler deploy   (kör i mappen tools/hastkapplopning-worker)\n"
        "   ===================================================================== */\n"
        'import { DurableObject } from "cloudflare:workers";\n\n'
        "/* ------------------------- engine.js (spelmotorn) ------------------------- */\n"
    ) % (h1, h2)
    mitt = "\n/* ---------------- worker-del.js (router + Durable Object) ---------------- */\n"
    return huvud + engine_utan.rstrip() + "\n" + mitt + del_.rstrip() + "\n"


def main():
    ny = bygg()
    if "--kontrollera" in sys.argv:
        gammal = las(UT) if os.path.exists(UT) else ""
        if gammal != ny:
            print("worker.js är INTE uppdaterad – kör bygg_worker.py.")
            sys.exit(1)
        print("worker.js är uppdaterad.")
        return
    with open(UT, "w", encoding="utf-8", newline="\n") as f:
        f.write(ny)
    print("Skrev %s (%d rader, %d tecken)" % (UT, ny.count("\n"), len(ny)))
    # Syntaxkontroll som ES-modul om Node finns.
    try:
        tmp = UT + ".kontroll.mjs"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(ny)
        r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
        os.remove(tmp)
        if r.returncode != 0:
            print(r.stderr)
            sys.exit("Syntaxfel i genererad worker.js")
        print("Syntaxkontroll (node --check) OK.")
    except FileNotFoundError:
        print("Node hittades inte – syntaxkontrollen hoppades över.")


if __name__ == "__main__":
    main()
