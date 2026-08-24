# Checklista & backlog – NO-plattformen

*Autogenererad 2026-08-23 av Claude. En sanningskälla: standarder, status per område och öppna punkter. Ersätter de gamla _TODO-filerna. Be Claude regenerera vid nya områden/funktioner.*

## Arbetssätt & mål

Först bygga ut alla ~29 områden, sedan strömlinjeforma. Ny funktion → in i alla nya områden framåt OCH bakåtfyllas i tidigare. Jesper slutgranskar all text själv och pushar alltid själv. Källa per område: Gleerups + TEFY (TEFY finns för kemi/fysik); Claude skriver EGEN text (kopierar aldrig), TEFY-stil. Helöversättning av studieguider är ett senare steg – svenska texten godkänns först.

## Standardkomponenter per område

**Kärn-HTML (13):** `index.html`, `studieguide.html`, `begreppslista.html`, `begreppskort.html`, `checklista.html`, `instuderingsfragor.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `ovningsprov.html`, `ovningsprov-print.html`, `facit.html`, `facit-print.html`, `larande-spel.html`. **Rekommenderad:** `korsord.html`.

**Data (5):** `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json`.

**Språk (10):** en, es, ar, so, fa, am, ps, pl, bs, ur.

**Regler (CLAUDE.md):** utskrift bara via knapp i moderdokument (ej index-länk); index tvåkolumn (area-main + area-right med hero + begrepp); begrepp 12–16+ (`data-concept` = `namn` exakt); begreppskort via larande-spel; lyssna per milstolpe; originalitet + källförteckning; mallar: kraft-och-rorelse, periodiska, genetik, liv-och-cellen.

## Statusöversikt

| Område | Kärn-HTML (13) | Data (5) | Språk (10) | Korsord | Audio |
|---|---|---|---|---|---|
| biologi/Sex-och-relationer | 2/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/ekologi | 2/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/evolution | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/genetik | 13/13 | 5/5 | 0/10 | ✗ | ✓ |
| biologi/hjarta-blod-lungor | 11/13 | 4/5 | 0/10 | ✓ | ✗ |
| biologi/immunologi | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/infektionssjukdomar | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/liv-och-cellen | 13/13 | 5/5 | 0/10 | ✗ | ✗ |
| biologi/matspjalkningen | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/nervsystemet | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| biologi/sinnena | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/arbete-energi-effekt | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/atomfysik | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/elektricitet | 13/13 | 5/5 | 10/10 | ✗ | ✗ |
| fysik/kraft-och-rorelse | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| fysik/ljud | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/ljus | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/magnetism-induktion | 13/13 | 5/5 | 10/10 | ✓ | ✓ |
| fysik/materia | 9/13 | 3/5 | 0/10 | ✗ | ✗ |
| fysik/tryck | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| fysik/universum | 13/13 | 5/5 | 10/10 | ✗ | ✗ |
| kemi/atomer | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/elektrokemi | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| kemi/jonforeningar | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/kol-och-kolforeningar | 2/13 | 1/5 | 0/10 | ✗ | ✗ |
| kemi/matens-kemi | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/periodiska-systemet | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| kemi/separationsprocesser | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/syror-och-baser | 13/13 | 5/5 | 10/10 | ✗ | ✗ |

## Öppna punkter (backlog)

### Klart

- Fullständiga områden: elektricitet, kraft-och-rorelse, magnetism-induktion, universum, elektrokemi, periodiska-systemet, syror-och-baser, genetik, **liv-och-cellen (nytt, åk7)**.

- Flerspråk (10 språk inkl. urdu) i 7 fysik/kemi-områden. Namnstandard utskrifter enhetlig.

### Nya grunder byggda (behöver kompletteras)

- **kemi/kol-och-kolforeningar (åk8):** studieguide (9 milstolpar), begrepp (28), index klara. Återstår: checklista, instuderingsfrågor, övningsprov+facit, begreppslista, begreppskort, print-sidor, lärande spel; översättningar. Källa: TEFY (uppladdad PDF).

- **liv-och-cellen:** komplett struktur klar. Återstår: översättningar (`begrepp.<språk>.json`); lägg till film-mp4 (`biologi/liv-och-cellen/film/encelligt-djurs-dramatiska-dod.mp4`) + toffeldjursbild (`images/biologi/liv-och-cellen/toffeldjur.jpg`).

### Städning kvar

- `kemi/periodiska-systemet/begrepp.json` (rot-dubblett) + gammal `sprak/`-mapp. `biologi/genetik/backupfile.html`/`backupindex.html`.

### Sprid funktioner

- Audio/lyssna (bara magnetism); korsord (saknas elektricitet, universum, syror); laborationer; träna-med-ai; bildstöd.

### Konkreta byggen

- Fanerozoikum-frågespel (biologi/evolution): porta från kraft-och-rorelse/fragespel.html (chansa/säkra, timer, poäng, lösen 'JTo').

- Provfrågor: räkna om per nytt format; fyll där tunt.


*Större idéer (läxbank, laborationsbank, PPT, AI-coaching, nationella prov m.m.) ligger i `CLAUDE.md` under 'Idéer och påminnelser'.*

