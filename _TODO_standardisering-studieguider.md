# Åtgärdslista – Standardisering av studieguide-områden

> **Syfte:** Göra att alla områden med `studieguide.html` har samma bra grunduppsättning
> av funktioner. Detta dokument är skrivet för att en kommande Claude-session ska kunna
> plocka upp arbetet direkt. Bocka av (`[x]`) allt eftersom.
>
> **Senast uppdaterad:** 2026-06-03 (kartläggning av Opus). Läs även `CLAUDE.md` för projektregler.

---

## Viktig regel: utskrifter

Utskriftsvyer ska **inte** ligga som egna länkar direkt under "För läraren" på index-sidan.
De ska **endast** nås inifrån det öppna dokumentet, via en knapp i själva dokumentet,
t.ex. "🖨 Skriv ut övningsprov" inuti `ovningsprov.html`.

- Ta bort separata utskriftslänkar (`*-print-*.html`, `*-elevutskrift.html`,
  `*-lararutskrift.html`) från index-sidornas lärarmeny.
- Lägg in en utskriftsknapp i moderdokumentet (`ovningsprov.html`, `instuderingsfragor.html`,
  `facit.html`) som öppnar/utlöser respektive utskriftsvy.
- Detta gäller alla områden.

---

## Nuläge – funktionsmatris (per 2026-06-03)

Områden med studieguide: **elektricitet, kraft-och-rorelse, magnetism-induktion,
universum, periodiska-systemet, syror-och-baser.**

Alla sex har: studieguide, index med begrepps-popup (kopplad), checklista.

| Komponent | elektr. | kraft | magnet. | univ. | period. | syror |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Instuderingsfrågor (fullst.) | ✗ fragment | ✓ | ✓ | ✓ | ✓ | ✓ |
| Övningsprov + facit | ✗ | ✓ (44) | ✓ (14) | ✓ (15) | ✓ (13) | ✓ (22) |
| Begreppskort | ✗ | ✓ | ✓ | ✓ | ⚠ data utan sida | ✓ |
| Lärande-spel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ämnesspecifikt spel/sim | ✓ | ✓✓ | ✓ | ✓ | ✓ | ✓ |
| Korsord | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Laborationer | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Audio (lyssna) | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Filmer | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Grupparbete | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Bildstöd | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Flerspråkigt stöd | ✗ | ✗ | ✗ | ✗ | ✓ (6 språk) | ✗ |
| Träna med AI | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

---

## A. Akut – elektricitet är ofärdigt (högsta prioritet)

- [ ] Sammanställ instuderingsfrågorna: slå ihop `data/instuderingsfragor-fragment.json`
      (75 rader) + `data/likstrom-vaxelstrom-fragment.json` (13 rader) till en färdig
      `data/instuderingsfragor.json` enligt formatet i andra områden.
- [ ] Bygg `instuderingsfragor.html` (kopiera struktur från syror-och-baser).
- [ ] Skapa övningsprov: `data/ovningsprov.json` + `ovningsprov.html` + `facit.html`.
- [ ] Skapa `begreppskort.html` + `data/begreppskort.json`.
- [ ] (Överväg) `korsord.html`.

## B. Städning (snabba, riskfria)

- [ ] `fysik/magnetism-induktion/larande-spel.html.bak` – ta bort.
- [ ] `kemi/periodiska-systemet/Old/` – ta bort eller arkivera utanför repot.
- [ ] `kemi/periodiska-systemet/begrepp.json` (i roten) – dubblett av `data/begrepp.json`,
      ta bort den i roten och säkerställ att inget länkar till den.
- [ ] `kemi/periodiska-systemet`: `data/begreppskort.json` finns men ingen `begreppskort.html`
      – bygg sidan eller ta bort datafilen.

## C. Enhetlig namnstandard för utskrifter

Idag blandas `*-print-elev/larare.html` och `*-elevutskrift/lararutskrift.html`.

- [ ] Bestäm EN standard (förslag: `*-print-elev.html` / `*-print-larare.html`).
- [ ] universum: har BÅDA varianterna (`instuderingsfragor-elevutskrift.html`
      OCH `instuderingsfragor-print-elev.html`) – ta bort dubletten.
- [ ] magnetism: byt `-elevutskrift`/`-lararutskrift` till standarden.
- [ ] Koppla samman med utskriftsregeln ovan (knapp i moderdokumentet).

## D. Sprid bra funktioner till alla områden

### D1. Lyssna-funktion (audio) – finns bara i magnetism
- [ ] Generalisera audio-uppspelaren från `fysik/magnetism-induktion` till en
      återanvändbar komponent (helst ett gemensamt skript i `/js/`).
- [ ] Spela in/generera uppläsning per milstolpe (m1, m2, m3 + fördjupning) för:
      elektricitet, kraft-och-rorelse, universum, periodiska-systemet, syror-och-baser.

### D2. Bildstöd + flerspråkigt stöd – finns bara i periodiska-systemet
- [ ] Lyft ut bildstöds-mönstret (`bildstod.html` + `js/bildstod.js` + `data/bildstod.json`)
      till en återanvändbar mall.
- [ ] Lyft ut flerspråksstödet (`sprak/*.json`: ar, en, fa, prs, so, uk) till en mall.
- [ ] Rulla ut till resterande fem områden (prioritera de begrepp nyanlända möter först).

### D3. Korsord – saknas i elektricitet, universum, syror-baser
- [ ] Lägg till `korsord.html` i dessa tre.

### D4. Laborationer – finns bara i magnetism och universum
- [ ] Lägg till `laborationer.html` (+ ev. handledning) i övriga fyra där det är relevant.

### D5. "Träna med AI" – finns bara i periodiska-systemet
- [ ] Utvärdera och rulla ut `trana-med-ai.html` till fler områden.

## E. Större förbättringsidéer (backlog)

- [ ] Samlad **lärarhubb** per område (allt lärarmaterial på ett ställe).
- [ ] Enkel **framstegsmarkering** för eleven (vilka delar är klara) – t.ex. via
      checklistan, sparat lokalt.
- [ ] Fler provfrågor där det är tunt: magnetism (14), periodiska (13) bör närma sig
      nivån i kraft-och-rorelse (44) / syror-och-baser (22).

---

## Arbetssätt (påminnelse till Claude)

- Följ mönstren i `CLAUDE.md` (begrepps-popup, färger `var(--area-*)`, mm).
- Återanvänd befintliga områden som mall – kraft-och-rorelse och periodiska-systemet
  är de mest kompletta att kopiera från.
- **Kör aldrig** `git commit`/`git push` själv. Avsluta med push-kommandon till Jesper.


---

## Atomer och molekyler (kemi/atomer) – status sep 2026

**Klart:** studieguide (6 milstolpar, bred bildkolumn, roterbar 3D i molekylkorten), alla standardsidor (index, checklista, instuderingsfrågor + print, övningsprov + print, facit + print, begreppslista, begreppskort, larande-spel), `ovningsverktyg` (dra-och-släpp, balansering, Räknemaskinen), `bygg-molekyl`, `formelark` (utskrivbart, stor vs nedsänkt siffra), flashcards moderniserade.

- [ ] Översättningar: `data/begrepp.<prefix>.json` (en, es, ar, so, fa, am, ps, pl, bs, ur) + `data/termer.<prefix>.json` när inline-översättning införs.
- [ ] Inline-översättning (`concept-inline`, `concept-lang-selector`) i studieguiden – kärnbegrepp och termer.
- [ ] Lyssna: spela in mp3 om Jesper vill (TTS fungerar redan som reserv).
- [ ] Begreppsbingo (+ lag) enligt mönstret från liv-och-cellen/ekologi.
- [ ] Jesper granskar studieguidetext, prov och frågor (allt är nyskrivet, sep 2026).
- [ ] Migrera de äldre HTML5-DnD-spelen i andra områden till `js/dra-och-slapp.js` (touch + tangentbord).
- [ ] Delade WCAG-fel i `css/style.css` (`.subject-btn`/menyknapp vit på #007bff 3,97:1, `.print-green` 3,13:1, `.footer-sub` 4,25:1) – kräver Jespers OK, ändrar utseendet överallt.
- [ ] Nästa steg: dra in samma formelverktyg i jonföreningar/syror-och-baser när reaktionsformler behandlas där.
