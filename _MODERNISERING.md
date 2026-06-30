# Moderniseringsskuld – kartläggning och status

Uppdaterad 2026-07-01. Visar hur väl de redan byggda områdena följer de *nyaste*
konventionerna (genetik är referens). Se regeln i `STIL.md` → "Modernisering av äldre
områden": ett område i taget, mellan det framåtriktade bygget.

Endast områden som har en begreppslista tas med (övriga är inte skuld – de är obyggda).

## Status per konvention

Teckenförklaring: ✓ uppfyllt · ✗ behöver åtgärd · — saknas (ej byggt än)

| Område | Begrepp i milstolpeordning | Hämtar begrepp.json (en källa) | Tankekarta |
|---|---|---|---|
| genetik (referens) | ✓ | ✓ | ✓ |
| kraft-och-rorelse | ✓ | ✓ | ✗ |
| magnetism-induktion | ✓ | ✓ | ✗ |
| elektricitet | ✓ | ✓ | ✗ |
| universum | ✓ | ✓ | ✗ |
| elektrokemi | ✓ | ✓ | ✗ |
| periodiska-systemet | ✓ | ✓ | ✗ |
| syror-och-baser | ✓ | ✓ | ✗ |

## Avbetat 2026-07-01

**1. ✅ Begrepp i milstolpeordning – KLART för alla 8 områden.** `data/begrepp.json`, den
inbäddade `window.BEGREPP` och "Viktiga begrepp"-knapparna omordnade efter milstolpe i de
fem som var oordnade (universum, elektrokemi, periodiska-systemet, syror-och-baser,
elektricitet). Verifierat: alla tre listorna monotont stigande, inga knappar utan data.

**2. ✅ En-källa-hämtning av begrepp.json – KLART för alla 8 områden.** Startsidans popup
hämtar nu `begrepp.json` (med inbäddad lista som lokal reserv) i samtliga områden, precis
som genetik. Live = en källa, ingen drift möjlig.

## Kvarstående skuld

**3. Tankekarta – 7 områden saknar.** Detta är riktig bygguppgift per område (varje karta är
egen, milstolparna grupperade i teman), inte städning. Tas som egna bygg när de prioriteras,
helst tillsammans med Jesper. Inget gjort ännu.

## Nästa möjliga pass

Tankekartor, ett område i taget. Övriga städkonventioner är i fas. Fungerar redan överallt:
lyssna-funktionen, och inbäddad lista ⇄ begrepp.json i synk.
