#!/usr/bin/env python3
"""Mäter kontrasten (WCAG 2.x relativ luminans) för de färgpar som används i css/hk.css.
Text: minst 4,5:1 (stor text 3:1). Ikoner/kantlinjer/fokus: minst 3:1. Läser färgerna direkt ur hk.css (:root),
så att mätningen följer filen. Kör: python3 kontrast.py   -> avslutar med kod 1 om något par underskrider gränsen."""
import re, sys, pathlib
css = (pathlib.Path(__file__).resolve().parents[3] / "spel/hastkapplopning/css/hk.css").read_text(encoding="utf-8")
tok = dict(re.findall(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})", css))
def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16)/255 for i in (0, 2, 4))
def lum(c):
    f = lambda v: v/12.92 if v <= 0.04045 else ((v+0.055)/1.055)**2.4
    r, g, b = map(f, hexrgb(c)); return 0.2126*r + 0.7152*g + 0.0722*b
def kontrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True); return (la+0.05)/(lb+0.05)
def C(x): return tok[x] if x in tok else x
W = "#ffffff"
TEXT = [  # (förgrund, bakgrund, beskrivning, minimum)
 ("ink", "bg", "brödtext på sidbakgrund", 4.5), ("ink", "panel", "text på vit panel", 4.5), ("ink", "sand", "text på sand (banan, panel.mjuk)", 4.5),
 ("ink-2", "bg", "sekundär text på bakgrund", 4.5), ("ink-2", "sand", "sekundär text på sand", 4.5), ("ink-2", "panel", "sekundär text på vitt", 4.5),
 ("brand", "bg", "frågenummer (mörkblå) på bakgrund", 4.5), ("brand", W, "mörkblå text på vitt", 4.5),
 ("#0b5cad", "bg", "länkfärg på bakgrund", 4.5), ("#0b5cad", W, "länkfärg på vitt", 4.5),
 (W, "brand-2", "primärknapp (vit på blå)", 4.5), (W, "brand", "nedtryckt knapp (vit på mörkblå)", 4.5),
 ("brand", "#e8f0fa", "knapp i hover", 4.5),
 ("fel", "fel-bg", "varning/fel-text", 4.5), ("fel", W, "varningsknapp text på vitt", 4.5),
 ("ink", "a", "svarsalternativ A", 4.5), ("ink", "b", "svarsalternativ B", 4.5), ("ink", "c", "svarsalternativ C", 4.5), ("ink", "d", "svarsalternativ D", 4.5),
 ("ink", "ok-bg", "rätt-svar-ruta", 4.5), ("ink", "fel-bg", "fel-svar-ruta", 4.5), ("ink", "varning-bg", "varningsruta", 4.5),
 ("ink", "#ffe9a3", "guldpall/medaljetikett", 4.5), ("ink", "#e6ebf0", "silverpall", 4.5), ("ink", "#f1d3b3", "brons-pall", 4.5),
 ("ink", "#eaf1fa", "notis", 4.5), ("ink-2", "#ece9e1", "elev: inget svar-ruta", 4.5), ("ink", "#f2f0ea", "upptaget lagkort", 4.5),
 ("#4c5760", "#e9e6dd", "inaktiverad knapp (undantagen, men mäts)", 4.5), (W, "ink", "MÅL-rubrik (vit på svart)", 4.5),
]
NONTEXT = [
 ("line", "bg", "kantlinje på inmatning/knapp mot bakgrund", 3.0), ("line", W, "kantlinje mot vitt", 3.0), ("ink", "sand", "kant/avatarkontur mot banan", 3.0),
 ("brand", "bg", "fokusring (3 px) mot bakgrund", 3.0), ("brand", W, "fokusring mot vitt", 3.0), ("brand", "a", "fokusring mot alternativ A", 3.0),
 ("brand", "b", "fokusring mot alternativ B", 3.0), ("brand", "c", "fokusring mot alternativ C", 3.0), ("brand", "d", "fokusring mot alternativ D", 3.0),
 ("ok", "ok-bg", "kant på rätt-ruta", 3.0), ("fel", "fel-bg", "kant på fel-ruta", 3.0), ("ok", "a", "rätt-kant (blå) mot alternativ A", 3.0), ("ok", "b", "rätt-kant (blå) mot alternativ B", 3.0),
 ("ok", "c", "rätt-kant (blå) mot alternativ C", 3.0), ("ok", "d", "rätt-kant (blå) mot alternativ D", 3.0), ("ok", "sand", "rätt-kant mot sand", 3.0),
 ("brand-2", W, "tidsstapel (blå) mot vit ram", 3.0), ("fel", W, "tidsstapel sista 5 s (brun) mot vit", 3.0), ("ink", W, "kant på tidsstapel mot vitt", 3.0), ("#1b2733", "#ffffff", "avatarkontur mot vitt", 3.0),
]
ok = True
def rapport(titel, lista):
    global ok
    print(titel)
    for fg, bg, txt, mn in lista:
        v = kontrast(C(fg), C(bg))
        flagga = "OK " if v >= mn else "FEL"
        if v < mn: ok = False
        print(f"  {flagga} {v:5.2f}:1 (krav {mn}) {txt}  [{C(fg)} på {C(bg)}]")
rapport("Text", TEXT); rapport("Icke-text", NONTEXT)
tal = [kontrast(C(f), C(b)) for f, b, t, m in TEXT + NONTEXT]
print(f"\n{len(tal)} par mätta, lägsta {min(tal):.2f}:1. {'Alla uppfyller kraven.' if ok else 'NÅGRA UNDERSKRIDER KRAVEN.'}")
sys.exit(0 if ok else 1)
