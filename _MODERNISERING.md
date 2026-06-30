# Moderniseringsskuld – kartläggning

Ögonblicksbild 2026-07-01. Visar hur väl de redan byggda områdena följer de *nyaste*
konventionerna (genetik är referens). Se regeln i `STIL.md` → "Modernisering av äldre
områden": ett område i taget, mellan det framåtriktade bygget.

Endast områden som har en begreppslista tas med (övriga är inte skuld – de är obyggda).

## Status per konvention

Teckenförklaring: ✓ uppfyllt · ✗ behöver åtgärd · — saknas (ej byggt än)

| Område | Begrepp i milstolpeordning | Hämtar begrepp.json (en källa) | Tankekarta |
|---|---|---|---|
| genetik (referens) | ✓ | ✓ | ✓ |
| kraft-och-rorelse | ✓ | ✗ | ✗ |
| magnetism-induktion | ✓ | ✗ | ✗ |
| elektricitet | ✗ | ✗ | ✗ |
| universum | ✗ | ✗ | ✗ |
| elektrokemi | ✗ | ✗ | ✗ |
| periodiska-systemet | ✗ | ✗ | ✗ |
| syror-och-baser | ✗ | ✗ | ✗ |

Fungerar redan överallt: lyssna-funktionen (alla 8 har den) och inbäddad lista ⇄ begrepp.json
är i synk i alla områden (ingen drift just nu).

## Skuld, prioriterad

**1. Begrepp i milstolpeordning – 5 områden.** Konkret och skriptbart, matchar Jespers
exempel. Olika allvarligt:
- *Mest oordnade:* universum (1,8,2,3,4,4,4,6,7,7,7,6,9,3) och elektrokemi (3,3,2,2,2,7,7,7,10,10,6,6,5,9,9,10).
- *Lätt oordnade (några få hopp):* periodiska-systemet, syror-och-baser, elektricitet.
- Åtgärd per område: ordna `data/begrepp.json` + inbäddad `window.BEGREPP` + "Viktiga begrepp"-knapparna efter milstolpe.

**2. En-källa-hämtning av begrepp.json – 7 områden.** Alla utom genetik använder den äldre
inbäddade-listan-som-källa. Låg risk och *inte brådskande* (listorna är i synk i dag), men
en enkel konsekvens-uppgradering: lägg in samma fetch som genetik har.

**3. Tankekarta – 7 områden saknar.** Detta är riktig bygguppgift per område (varje karta
är egen), inte en snabbfix. Schemaläggs som funktionsparitet, inte städning.

## Förslag på ordning

Lättast värde först: ta **begreppsordningen** ett område i taget (börja med de mest oordnade,
universum och elektrokemi). En-källa-fixen kan följa med i samma pass per område. Tankekartor
tas separat som egna bygg när de prioriteras. Inget rörs förrän Jesper säger till – detta är
bara kartan.
