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
