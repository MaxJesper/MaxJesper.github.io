# Checklista – standardisering av NO-plattformens områden

*Autogenererad 2026-08-23 av Claude. Uppdateras löpande – be Claude regenerera när nya områden/funktioner tillkommit.*

## Arbetssätt

Mål: först bygga ut alla ~26–29 områden, sedan strömlinjeforma så att samma grunder och funktioner finns överallt. När en **ny funktion** införs i ett område ska den (a) läggas till i alla nya områden framåt och (b) bakåtfyllas i tidigare områden. Använd denna lista för att pricka av – och för korrekturläsning.

Legend: ✓ = finns, ✗ = saknas.

## Standardkomponenter (ska finnas i varje område)

**Kärn-HTML (13 st):** `index.html`, `ovningsprov-print.html`, `checklista.html`, `instuderingsfragor-print-larare.html`, `ovningsprov.html`, `instuderingsfragor.html`, `instuderingsfragor-print-elev.html`, `begreppslista.html`, `begreppskort.html`, `studieguide.html`, `facit-print.html`, `facit.html`, `larande-spel.html`.

**Rekommenderad extra:** `korsord.html` (finns i vissa områden).

**Data (5 st):** `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json`.

**Språk (begrepp-översättningar, 10 st):** en, es, ar, so, fa, am, ps, pl, bs, ur (utöver svenska basen `begrepp.json`).

**Genomgående funktioner:** språkväljare (`js/language-selector.js`, monteras på index + begreppslista, TTS-mount på studieguide), uppläsning (`js/lyssna.js`), begrepp-popup.

**Områdesspecifikt (bonus, ej krav):** interaktiva spel t.ex. `ohms-lag-spel.html`, `bygg-ett-batteri.html`, `syra-eller-bas.html`, laborationssidor.

## Statusöversikt

| Område | Kärn-HTML (13) | Data (5) | Språk (10) | Korsord | Områdesspecifikt |
|---|---|---|---|---|---|
| biologi/Sex-och-relationer | 2/13 | 0/5 | 0/10 | ✗ | `menstruationscykeln.html`, `sex-samtycke-kort.html` |
| biologi/ekologi | 2/13 | 0/5 | 0/10 | ✗ | `trad-och-blad.html` |
| biologi/evolution | 1/13 | 0/5 | 0/10 | ✗ | `Fanerozoikum-lar-mer.html`, `Fanerozoikum.html`, `nardada.html`, `nardada_regler.html` |
| biologi/genetik | 13/13 | 5/5 | 0/10 | ✗ | `backupfile.html`, `backupindex.html`, `flashcards.html`, `klona-genen.html`, `korsningsscheman.html`, `kromosomer-i-siffror.html`, `laxor.html`, `tankekarta.html` |
| biologi/hjarta-blod-lungor | 11/13 | 4/5 | 0/10 | ✓ | `blodets-vag.html`, `bygg-blodet.html` |
| biologi/immunologi | 1/13 | 0/5 | 0/10 | ✗ | – |
| biologi/infektionssjukdomar | 1/13 | 0/5 | 0/10 | ✗ | – |
| biologi/matspjalkningen | 1/13 | 0/5 | 0/10 | ✗ | – |
| biologi/nervsystemet | 1/13 | 0/5 | 0/10 | ✗ | `Flervalsfrågor.html`, `nervsystemet_flashcards.html` |
| biologi/sinnena | 1/13 | 0/5 | 0/10 | ✗ | – |
| biologi/vad-ar-liv | 1/13 | 0/5 | 0/10 | ✗ | – |
| fysik/arbete-energi-effekt | 1/13 | 0/5 | 0/10 | ✗ | – |
| fysik/atomfysik | 1/13 | 0/5 | 0/10 | ✗ | – |
| fysik/elektricitet | 13/13 | 5/5 | 10/10 | ✗ | `ohms-lag-spel.html` |
| fysik/kraft-och-rorelse | 13/13 | 5/5 | 10/10 | ✓ | `filmer.html`, `fragespel.html`, `gungbrada.html`, `pickup-simulering.html` |
| fysik/ljud | 1/13 | 0/5 | 0/10 | ✗ | `flashcards-ljud.html` |
| fysik/ljus | 1/13 | 0/5 | 0/10 | ✗ | `flashcards-ljus.html` |
| fysik/magnetism-induktion | 13/13 | 5/5 | 10/10 | ✓ | `laborationer.html`, `laborationshandledningar.html`, `ohms-lag-spel.html` |
| fysik/materia | 9/13 | 3/5 | 0/10 | ✗ | `memory.html` |
| fysik/tryck | 1/13 | 0/5 | 0/10 | ✗ | – |
| fysik/universum | 13/13 | 5/5 | 10/10 | ✗ | `grupparbete.html`, `laborationer.html`, `stjarnbilder-spel.html`, `stjarnbilder.html` |
| kemi/atomer | 1/13 | 0/5 | 0/10 | ✗ | `flashcards.html` |
| kemi/elektrokemi | 13/13 | 5/5 | 10/10 | ✓ | `adel-eller-oadel.html`, `bygg-ett-batteri.html` |
| kemi/jonforeningar | 1/13 | 0/5 | 0/10 | ✗ | `laborationer-print.html`, `laborationer.html` |
| kemi/kolforeningar | 1/13 | 0/5 | 0/10 | ✗ | – |
| kemi/matens-kemi | 1/13 | 0/5 | 0/10 | ✗ | – |
| kemi/periodiska-systemet | 13/13 | 5/5 | 10/10 | ✓ | `bildstod.html`, `memory.html`, `trana-med-ai.html` |
| kemi/separationsprocesser | 1/13 | 0/5 | 0/10 | ✗ | – |
| kemi/syror-och-baser | 13/13 | 5/5 | 10/10 | ✗ | `syra-eller-bas.html` |

## Luckor per område (vad som saknas mot standarden)

- **biologi/Sex-och-relationer** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/ekologi** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/evolution** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/genetik** — saknar → språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/hjarta-blod-lungor** — saknar → HTML: `begreppslista.html`, `studieguide.html` · data: `data/begrepp.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/immunologi** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/infektionssjukdomar** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/matspjalkningen** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/nervsystemet** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/sinnena** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **biologi/vad-ar-liv** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/arbete-energi-effekt** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/atomfysik** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/elektricitet** — ✓ komplett mot standarden (korsord saknas, valfritt)
- **fysik/kraft-och-rorelse** — ✓ komplett mot standarden
- **fysik/ljud** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/ljus** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/magnetism-induktion** — ✓ komplett mot standarden
- **fysik/materia** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `larande-spel.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/tryck** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **fysik/universum** — ✓ komplett mot standarden (korsord saknas, valfritt)
- **kemi/atomer** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **kemi/elektrokemi** — ✓ komplett mot standarden
- **kemi/jonforeningar** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **kemi/kolforeningar** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **kemi/matens-kemi** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **kemi/periodiska-systemet** — ✓ komplett mot standarden
- **kemi/separationsprocesser** — saknar → HTML: `begreppskort.html`, `begreppslista.html`, `checklista.html`, `facit-print.html`, `facit.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `instuderingsfragor.html`, `larande-spel.html`, `ovningsprov-print.html`, `ovningsprov.html`, `studieguide.html` · data: `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json` · språk (10): en, es, ar, so, fa, am, ps, pl, bs, ur
- **kemi/syror-och-baser** — ✓ komplett mot standarden (korsord saknas, valfritt)
