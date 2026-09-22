# -*- coding: utf-8 -*-
"""Dra-och-släpp-övningar (sortering) för Matens kemi."""


def act(id, tier, title, intro, zones, items):
    """zones: [(id, text)], items: [(zone, text, why[, hint])]"""
    out = {"id": id, "tier": tier, "title": title, "intro": intro,
           "zones": [{"id": z, "t": t} for z, t in zones], "items": []}
    for i, it in enumerate(items, 1):
        d = {"id": str(i), "zone": it[0], "t": it[1], "why": it[2]}
        if len(it) > 3:
            d["hint"] = it[3]
        out["items"].append(d)
    return out


SORTERING = [
 act("naringsamne", "Grund", "Kolhydrat, fett eller protein?",
     "Sortera varje ord eller uttryck till rätt näringsämne.",
     [("k", "Kolhydrat"), ("f", "Fett"), ("p", "Protein")],
     [("k", "Glukos (druvsocker)", "Glukos är en monosackarid – den enklaste sortens kolhydrat."),
      ("k", "Stärkelse", "Stärkelse är en polysackarid uppbyggd av glukosenheter."),
      ("k", "Cellulosa", "Cellulosa är en polysackarid av glukos, kostfiber i växters cellväggar."),
      ("k", "Sackaros (bordssocker)", "Sackaros är en disackarid: glukos + fruktos."),
      ("f", "Glycerol", "Glycerol är alkoholdelen i alla fetter."),
      ("f", "Palmitinsyra", "Palmitinsyra är en mättad fettsyra."),
      ("f", "Triglycerid", "En triglycerid är glycerol + tre fettsyror – ett fett."),
      ("f", "Omättad fettsyra", "En fettsyra med minst en dubbelbindning i kolkedjan."),
      ("p", "Aminosyra", "Aminosyror är byggstenarna i protein."),
      ("p", "Enzym", "Enzymer är proteiner som påskyndar kemiska reaktioner."),
      ("p", "Kollagen", "Kollagen är ett strukturprotein i till exempel hud och senor."),
      ("p", "Peptidbindning", "Peptidbindningen är bindningen mellan aminosyror i ett protein.")]),

 act("mattat-omattat", "Grund", "Mättat eller omättat fett?",
     "Sortera varje beskrivning eller exempel efter om det handlar om mättat eller omättat fett.",
     [("m", "Mättat fett"), ("o", "Omättat fett")],
     [("m", "Fettsyran har bara enkelbindningar mellan kolatomerna", "Inga dubbelbindningar = mättad fettsyra."),
      ("m", "Fettsyrans kolkedja är helt rak", "Utan dubbelbindningar blir kedjan rak och packas tätt."),
      ("m", "Ofta fast i rumstemperatur, t.ex. smör", "Mättade fetter packas tätt och är oftare fasta."),
      ("m", "Palmitinsyra (16:0)", "Palmitinsyra saknar dubbelbindningar – en mättad fettsyra."),
      ("o", "Fettsyran har minst en dubbelbindning i kedjan", "En eller flera dubbelbindningar = omättad fettsyra."),
      ("o", "Kedjan har en tydlig knäck (cis-bindning)", "Dubbelbindningen böjer kedjan."),
      ("o", "Ofta flytande i rumstemperatur, t.ex. olivolja", "Omättade fetter packas glesare och är oftare flytande."),
      ("o", "Oljesyra (18:1)", "Oljesyra har en dubbelbindning – en omättad fettsyra."),
      ("o", "Blir mer mättad om man härdar (hydrogenerar) den", "Härdning tillsätter väte till dubbelbindningarna.")]),

 act("sackarider", "Lär mer", "Mono-, di- eller polysackarid?",
     "Sortera sockerarterna efter hur många sockerenheter de är uppbyggda av.",
     [("mono", "Monosackarid"), ("di", "Disackarid"), ("poly", "Polysackarid")],
     [("mono", "Glukos", "En enda sockerenhet: monosackarid."),
      ("mono", "Fruktos", "En enda sockerenhet: monosackarid."),
      ("mono", "Galaktos", "En enda sockerenhet: monosackarid."),
      ("di", "Sackaros (glukos + fruktos)", "Två sockerenheter bundna: disackarid."),
      ("di", "Maltos (glukos + glukos)", "Två sockerenheter bundna: disackarid."),
      ("di", "Laktos (glukos + galaktos)", "Två sockerenheter bundna: disackarid."),
      ("poly", "Stärkelse", "Tusentals glukosenheter i kedja: polysackarid."),
      ("poly", "Cellulosa", "Tusentals glukosenheter i kedja: polysackarid."),
      ("poly", "Glykogen", "Tusentals glukosenheter i en förgrenad kedja: polysackarid, djurens energilager.")]),
]
