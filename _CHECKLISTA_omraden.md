# Checklista & backlog – NO-plattformen

*Autogenererad 2026-08-23 av Claude. En sanningskälla: standarder, status per område och öppna punkter. Ersätter de tidigare `_TODO_standardisering-studieguider.md` och `_TODO_fanerozoikum-fragespel.md` (kan tas bort när du vill). Be Claude regenerera när nya områden/funktioner tillkommit.*

## Arbetssätt & mål

Först bygga ut alla ~29 områden, sedan strömlinjeforma så samma grunder/funktioner finns överallt. När en NY funktion införs ska den (a) med i alla nya områden framåt och (b) bakåtfyllas i tidigare. Jesper slutgranskar all text själv. Översättning av hela texter (studieguider) är ett SENARE steg – svenska texten ska vara godkänd först. Git: Jesper pushar alltid själv.

## Standardkomponenter per område

**Kärn-HTML (13):** `index.html`, `studieguide.html`, `begreppslista.html`, `begreppskort.html`, `checklista.html`, `instuderingsfragor.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `ovningsprov.html`, `ovningsprov-print.html`, `facit.html`, `facit-print.html`, `larande-spel.html`. **Rekommenderad:** `korsord.html`.

**Data (5):** `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json`.

**Språk (10):** en, es, ar, so, fa, am, ps, pl, bs, ur (`begrepp.<språk>.json`, utöver svenska basen).

**Genomgående funktioner:** språkväljare (`js/language-selector.js`), uppläsning (`js/lyssna.js`, `data-audio-base`), begreppspopup (`js/concepts-popup.js` + `data-concept`).

## Fasta regler (från CLAUDE.md)

- **Utskrifter:** `*-print-elev/-larare.html`, `ovningsprov-print.html`, `facit-print.html`. Utskriftslänkar finns BARA som knapp inne i moderdokumentet – aldrig som egna länkar i index-lärarmenyn. Print-sidor kör `window.print()` automatiskt.

- **Index-layout:** tvåkolumn `area-layout` (300px + 1fr); `area-main` med `resource-grid` (staplade boxar Elever/Läraren, `border-left:4px var(--area)`); `area-right` med hero-bild + `concept-section`.

- **Begrepp:** 12–16(+) viktigaste per område i `data/begrepp.json` (`namn`/`definition`/`anchor` → `#m`), `data-concept` måste matcha `namn` exakt.

- **Begreppskort:** nås via `larande-spel.html`, data i `data/begreppskort.json` (nivå 1 + nivå 2).

- **Lyssna:** varje `studieguide.html` har lyssna-knapp per milstolpe; mp3 i `audio/` annars TTS-fallback.

- **Originalitet:** studieguider/frågor/prov ska vara EGET formulerade – aldrig kopiera lärobokstext (Gleerups, TEFY, Puls, Spektrum …). Varje studieguide avslutas med källförteckning.

- **Stil (TEFY, inte Gleerups):** effektiva texter rakt på förklaringar; bygg förståelse först; bilder ska ÖKA förståelse, inte vara dekoration.

- **Mallar att kopiera från:** kraft-och-rorelse, periodiska-systemet, genetik (mest kompletta).

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
| biologi/liv-och-cellen | 3/13 | 1/5 | 0/10 | ✗ | ✗ |
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
| kemi/kolforeningar | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/matens-kemi | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/periodiska-systemet | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| kemi/separationsprocesser | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/syror-och-baser | 13/13 | 5/5 | 10/10 | ✗ | ✗ |

## Öppna punkter (backlog)

### Klart sedan juni 2026

- elektricitet färdigt (instud., prov, facit, begreppskort). Utskriftsnamn enhetliga. Flerspråk ombyggt + utbyggt till 7 områden × 10 språk (inkl. urdu). `larande-spel.html.bak` och `periodiska/Old/` borttagna.

### Städning kvar

- `kemi/periodiska-systemet/begrepp.json` i roten – dubblett av `data/begrepp.json`, ta bort (säkerställ inga länkar).

- `kemi/periodiska-systemet/sprak/` (prs, uk, en, fa, ar, so) – gammalt språksystem, ersatt av `data/begrepp.*.json`. Ta bort när inget länkar dit (t.ex. bildstod).

- `biologi/genetik/`: gamla `backupfile.html` / `backupindex.html` kan rensas.

### Sprid funktioner till fler områden

- **Audio/lyssna:** finns bara i magnetism-induktion – generalisera + spela in per milstolpe i övriga.

- **Korsord:** saknas i elektricitet, universum, syror-och-baser.

- **Laborationer, 'träna med AI', bildstöd:** rulla ut från de områden som har dem.

### Konkreta byggen

- **Fanerozoikum-frågespel** (`biologi/evolution/Fanerozoikum.html`): porta chansa/säkra, timer+buzzer, poäng (localStorage), segeröverlay, lösenordsskyddad inställningspanel (lösen 'JTo') från `fysik/kraft-och-rorelse/fragespel.html`.

- **Provfrågor:** prov-formatet har ändrats sedan juni – räkna om antal frågor per nytt format och fyll på där det är tunt (magnetism, periodiska).

### Liv och cellen (åk 7) – NYTT, grund byggd aug 2026

- Klart: område omdöpt (vad-ar-liv → liv-och-cellen), studieguide (6 milstolpar, egen text), `data/begrepp.json` (24 begrepp), index i standardlayout, spelet Livet och cellen kvar.

- Återstår: checklista, instuderingsfrågor, övningsprov + facit, begreppslista, begreppskort, print-sidor, ev. korsord; översättningar (`begrepp.<språk>.json`).

- Lägg till filer: filmen `biologi/liv-och-cellen/film/encelligt-djurs-dramatiska-dod.mp4` och bilden `images/biologi/liv-och-cellen/toffeldjur.jpg` (ankare finns redan i studieguidens M4).


*Större idéer/backlog (läxbank, laborationsbank, PPT till lärare, AI-coaching, nationella prov m.m.) ligger kvar i `CLAUDE.md` under 'Idéer och påminnelser'.*

