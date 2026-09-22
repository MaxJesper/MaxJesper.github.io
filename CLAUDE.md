# Projektregler – Studieguide-webbplatsen

## Git och deployment

Pushes görs alltid av användaren via deras egen terminal. Efter varje avslutad förändring avslutar Claude alltid med att ge push-kommandona:

```bash
cd ~/Documents/github
git add <ändrade filer>
git commit -m "Beskrivande commit-meddelande"
git push
```

Claude ska **aldrig** försöka köra `git push` eller `git commit` själv — det blockerar användarens terminal och orsakar låsningsproblem.

## Viktiga begrepp – standard för alla områden med studieguide

Varje område som har en `studieguide.html` ska ha en **"Viktiga begrepp"-sektion** på sin `index.html`.

### Layout

Begreppen placeras i `div.area-right` tillsammans med hero-bilden – **under** bilden, inte utanför grid-layouten:

```html
<section class="area-layout">
  <div class="area-main">
    <!-- Material för elever / läraren -->
  </div>

  <div class="area-right">
    <figure class="area-hero-image">
      <!-- bild eller inspirationstext -->
    </figure>

    <section class="concept-section" aria-label="Viktiga begrepp">
      <h2>Viktiga begrepp att lära sig</h2>
      <ul class="concept-list">
        <li><button class="concept-btn" data-concept="BegreppNamn">BegreppNamn</button></li>
        <!-- fler begrepp -->
      </ul>
      <!-- valfritt: -->
      <p class="concept-note">Förkunskaper: ...</p>
    </section>
  </div>
</section>
```

### CSS (kopieras till varje index.html, i `<style>`-blocket)

```css
.area-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.concept-section {
  background: var(--area-soft);
  border: 1px solid var(--area-border);
  border-radius: 12px;
  padding: 1rem 1rem 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.concept-section h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  color: var(--area-strong);
}

.concept-list {
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2;
  column-gap: 1rem;
}

@media (min-width: 600px) { .concept-list { columns: 3; } }
@media (min-width: 900px) { .concept-list { columns: 4; } }

.concept-list li {
  font-size: 0.95rem;
  color: #1f2937;
  line-height: 1.35;
  padding: 0.22rem 0;
  break-inside: avoid;
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.concept-list li::before {
  content: "→";
  color: var(--area);
  font-size: 0.78rem;
  flex-shrink: 0;
}

.concept-note {
  margin: 0.8rem 0 0 0;
  font-size: 0.82rem;
  color: #555;
  font-style: italic;
}

.concept-note a {
  color: var(--area-strong);
  font-weight: 600;
}
```

### Script (lägg före `</body>`)

```html
<script src="/js/concepts-popup.js" data-begrepp="./data/begrepp.json"></script>
```

### Data – `data/begrepp.json`

```json
[
  {
    "namn": "Begreppets namn (exakt som data-concept i HTML)",
    "definition": "Kortfattad förklaring på 2–3 meningar.",
    "anchor": "./studieguide.html#m3"
  }
]
```

- `namn` måste matcha exakt med `data-concept`-attributet i HTML
- `anchor` pekar på milstolpen i studieguiden (`#m1`, `#m2` osv.)
- Välj ca 12–16 begrepp per område – de allra viktigaste

### Popup-beteende

Klick på ett begrepp öppnar ett modalkort med:
- Begreppets namn
- Definitionen
- Länk "Läs mer i Studieguiden →" (om `anchor` är angivet)

Stängs med Escape, klick utanför eller ✕-knappen.

### Bakgrundsfärg

Använd `var(--area-soft)` som bakgrund — den ljusa färgtonen per område.  
Det är colorblind-säkert och hänger ihop visuellt med hero-bildkortet ovanför.  
**Ingen** tung vänstersidebård behövs på concept-section.

---

## Layout-standard för index.html (område)

Alla `index.html` för ett område följer samma tvåkolumnslayout på desktop.

### Struktur

```
area-layout (grid)
├── area-main (300px på desktop)      ← material-boxarna
│   ├── resource-grid (flex-column)
│   │   ├── "Material för elever"
│   │   └── "Material för läraren"
│   └── study-tips / milestone-map (under)
└── area-right (1fr på desktop)       ← bild + begrepp
    ├── area-hero-image
    └── concept-section
```

### Regler

- **resource-grid** använder alltid `display: flex; flex-direction: column;` — de två boxarna ("Material för elever" och "Material för läraren") är **alltid staplade ovanpå varandra**, aldrig bredvid varandra.
- **area-layout** på desktop: `grid-template-columns: 300px 1fr` — area-main till vänster (smal), area-right till höger (bred).
- **area-right** innehåller alltid: (1) hero-bild/-infogram, (2) concept-section **under** bilden.
- **resource-box** har `border-left: 4px solid var(--area)` för färgkodning.

### Två godkända bildvarianter i area-right

1. **Universum-stil** – ett riktigt foto med bildtext och CC-uppgift i `<figcaption>`. Bilden och texten kan ligga bredvid varandra på desktop (flex-row).
2. **Magnetism-stil** – ett infogram (SVG eller PNG) med en pedagogisk `<figcaption>` under (ingen CC-uppgift behövs om bilden är egenhändigt skapad). Ingen horisontell layout.

Välj Universum-stil när ett bra licensierat foto finns. Välj Magnetism-stil för egenskapade infogram och illustrationer.

---

## Bred studieguide med bildkolumn — STÅENDE REGEL för bildrika studieguider, sep 2026

Inspirerat av Enkel NO (bara idén med förklarande bilder **bredvid** texten – egen text och egna bilder, aldrig kopierat). Text till vänster, förklarande bilder i en kolumn till höger, placerade vid just den text de hör till. Pilot: `kemi/kol-och-kolforeningar/studieguide.html`. Används i alla studieguider som har många förklarande bilder (kemi: strukturformler/kulmodeller; biologi: cell-, DNA- och organbilder; fysik: kretsschema, kraftdiagram m.m.). Ordinarie studieguider utan `.guide-wide` påverkas inte.

### Aktivering (opt-in per sida)

1. Länka den delade komponenten efter `style.css`: `<link rel="stylesheet" href="/css/studieguide-bildkolumn.css" />`
2. Sätt klassen på huvudelementet: `<main class="guide-wide">` (max-bredd 1180 px i stället för normalbredden; sidokolumnen är 370 px).
3. Bygg varje milstolpes `.m-body` av **rader**. En rad = en textbit + bilderna till den:

```html
<div class="m-row">
  <div class="m-lead"> …den text bilderna hör till… </div>
  <div class="m-side"> <figure class="side-fig">…</figure> <figure class="side-fig">…</figure> </div>
  <div class="m-rest"> …fortsättning (tabell, fördjupning, mer text) som får stå bredvid bildkolumnen… </div>
</div>
```

- `m-rest` är valfri. Bilderna i `m-side` ligger i höjd med `m-lead` och fortsätter ned bredvid `m-rest`. **Passa ihop höjderna** (flytta block mellan lead och rest) så att det inte blir stora tomrum bredvid långa tabeller.
- Rad utan bilder: `<div class="m-row m-row--plain"><div class="m-lead">…</div></div>` (samma textbredd som övriga rader).
- Rad som ska ha **hela bredden**: `m-row--full`. Används när bilden behöver plats i sidled, t.ex. en **reaktionsformel** (karboxylsyra + alkohol → ester + vatten). Reaktioner och andra breda bilder ska ALLTID ligga i löptexten i full bredd, inte i sidokolumnen.
- Bild i löpande text/fördjupning (t.ex. inne i en `<details class="deepen">`): `<div class="fig-row"><figure><img …><figcaption>…</figcaption></figure>…</div>`.
- Smalare än 900 px staplas allt: lead, bilder direkt efter, rest. Bilderna hamnar alltså alltid i närheten av sin text – testa 1440, 1024, 768 och 390 px.

### Molekylkort (kemi)

Varje molekyl i texten får ett `.mol-card` i sidokolumnen: **namn + molekylformel** (rubrikrad, siffror som `<sub>`), **strukturformel** (2D-SVG, skala 0,88) och **kulmodell** (statisk PNG), plus länken `Rotera i 3D →` (`href="#km-<stem>"`) till samma molekyl i galleriet "Utforska i 3D" (M10). Flera kort i samma `.side-fig` delar en `<figcaption>` (bildtext + `.km-legend` med färgförklaring – bara text/prick, aldrig enbart färg). Kort utan molekylformel (t.ex. kolets former) använder `.mc-desc` i stället.

### Statiska bilder bredvid texten – rotation bara i M10 (gäller långa kapitel; kort kapitel: se "Live-3D i korta kemikapitel" nedan)

- Bilderna i bildkolumnen är **statiska PNG** (`images/kemi/<område>/kulmodeller/<stem>.png`, transparent, 3x upplösning, `width`/`height` = PNG-storlek/3, `loading="lazy"`, beskrivande `alt`). Inga live-3Dmol-rutor i löptexten: de tar WebGL-kontexter (max ca 16 per sida) och gör sidan seg.
- **Möjligheten att rotera finns i det befintliga bladet "Utforska i 3D" (M10)** – och som ENDA undantag direkt i milstolpen när själva 3D-strukturen är poängen (kolets former i M2: diamant, grafit, fulleren, grafen, nanorör; klass `.mc-viewer` + `class="km-viewerbox"` + `data-mol`, samma lata skapande/släpp som galleriet, `noscript`-reserv med PNG, marginaler på mobil så att man kan scrolla förbi). Molekylerna i övrigt är statiska PNG i löptexten. Kortens länk `#km-<stem>` öppnar M10 och lyfter fram rätt kort (`.km-flash`). Nya molekyler ska in i BÅDE bildkolumnen och galleriet (`MOLS`/`MULTI` i sidans script är källan för båda).
- Galleriets 3Dmol-boxar skapas lat (IntersectionObserver) och **släpps igen när de rullas ur bild** (`destroyViewerIn`, WEBGL_lose_context) – nödvändigt när galleriet har fler än ~16 molekyler.
- **Dubbel-/trippelbindningar** ritas som utåtböjda bågar med tunnare pinnar (visar att elektronmolnen stöter bort varandra, och gör bindningarna lätta att se) – gäller både galleriet och PNG:erna; alla bindningar med ordning ≥2 ska ligga i `MULTI`, inte i molblocket (se `kulmodeller3d.py`, regel 9).
- Alla kulmodeller har **samma atomstorlek** (fast px/Å, standard 34) så att storleksskillnader mellan molekyler är verkliga. Färger: kol svart (sfär #4d4d4d, pinne #777), väte vitt, syre rött, kväve blått (#3050f8).
- Rendering: `tools/kemi-ritverktyg/statiska-kulmodeller/` (`render_kulmodeller.py`, `render_allotroper.py`, se README där). Geometrin kommer från `chembuilder.py` (för molekyler utan handbyggt mönster: `build_rdkit(smiles)` + `check_geometry`). Ritas alltid med skript – aldrig frihand.

### Övrigt

- `lyssna.js` läser `.m-body`-texten: rubrikraden (`.mc-head`), `Rotera i 3D`-länken, färgförklaringen (`.km-legend`) och 3D-instruktionen (`.km-hint`) är uteslutna, bildtexterna läses.
- Egna bilder och egen text bara – Enkel NO, läroböcker m.fl. är inspiration, aldrig förlaga (se Originalitet).
- WCAG 2.2 AA: alla bilder har `alt`, färgförklaring som text, kontrast ≥ 4.5:1 på bildtexter, inget som bara går att förstå via färg.
- Nästa sida som kan få layouten: välj ut milstolpar med många molekyl-/organ-/kretsbilder först; sidor med få bilder behåller normalbredd.

---

## Live-3D i korta kemikapitel + delade komponenter för formler och övningar — sep 2026

Pilot: `kemi/atomer/` (Atomer och molekyler, 6 milstolpar, 9 molekyler). Bygger på samma breda studieguide med bildkolumn (se ovan), men med ett **medvetet undantag** från regeln "inga live-3Dmol-rutor i löptexten": när ett kapitel har få molekyler (≲ 10) ligger **roterbara 3D-kulmodeller direkt i molekylkorten** i studieguiden, eftersom det inte är lika pedagogiskt att samla alla på ett galleri-ark som i kolkapitlet. Långa kapitel (kol, framtida organisk kemi) behåller statiska PNG + galleri.

**Molekylkort i atomer-kapitlet:** namn + molekylformel (`.mc-head--lab`, `.mc-flab`/`.mc-lab`), 2D-strukturformel (`.mc-struct`, SVG i `images/kemi/atomer/strukturformler/`), roterbar kulmodell (`.mc-viewer`, lat start via IntersectionObserver, släpps när den lämnar bild) och en rad text "Bindning: … · Form: …". Ingen information enbart via färg: knappen "Bokstäver på kulorna" (`#lbl-btn`) lägger atombokstäver på 3D-kulorna för färgblinda elever, och färgförklaring finns som text.

### Delade komponenter (återanvänds i alla kemikapitel)

| Fil | Vad |
|---|---|
| `js/molviewer.js` + `css/molviewer.css` | 3Dmol-baserad viewer: `MolViewer.create/destroy/observe/mount/register/setLabels/addMultiBond`. Lat init, släpper WebGL-kontext (max ~16 per sida), tangentbordsstyrning, hjulzoom bara med fokus/ctrl-nyp. Molekyldata per kapitel i `<område>/js/molmodeller.js` (`window.MOLDATA = {mols, multi, style, view, info}`), byggs av `tools/kemi-ritverktyg/atomer/bygg_atomer.py`. |
| `js/formelvisare.js` + `css/formelvisare.css` (`window.KemiFormel`) | Kulbilder som SVG med bokstäver, formelformatering (`fmt('2 H2O')` → stor siffra `.coef` + nedsänkt `sub.idx`), och widgets via `data-fv="verkstad|figure|reaction|balance|raknare"`: Formelverkstaden, balanserings-övning, Räknemaskinen (stor/nedsänkt siffra). `lyssna.js` hoppar över `.fv-widget`/`.no-listen`. |
| `js/dra-och-slapp.js` + `css/dra-och-slapp.css` (`window.DraOchSlapp`) | Tillgänglig sorteringsövning: dra med pekare **eller** klicka bricka + ruta **eller** tangentbord; direkt besked med förklaring, poäng på första försöket, händelsen `dd:done`. Använder `--area-strong/--area-soft/--area-border`. **De äldre HTML5-DnD-spelen i andra områden ska migreras hit** (HTML5-DnD fungerar inte med touch och tangentbord). |
| `css/studieguide-bildkolumn.css` | Har nu temavariablerna `--guide-accent/--guide-soft/--guide-border/--guide-dash` (fallback lila = kol). Sätt egna på `<main class="guide-wide">` för områdesfärg. Atomer = rosa (`#9d174d` stark, `#fdf2f8` mjuk, `#fbcfe8` ram). |
| `css/viktigt.css` | Gul **"Viktigt!"-ruta** (byggd 21 sep 2026, Jespers önskemål: "gula rutor med sådant som behöver betonas extra, t.ex. SIV"). `<div class="viktigt" role="note">` + varningstriangel-SVG + valfri officiell piktogram-`<img class="viktigt-pikto">` + `.viktigt-body` med `<strong class="viktigt-label">Viktigt!</strong>`. Färgblindsäker (brun ram + triangel + ordet bär betydelsen, aldrig bara gult), kontrast ≈ 15:1, tål utskrift/forced-colors. **Max 1–2 per milstolpe**, annars tappar rutan sin betydelse. Införd i syror-och-baser; **ska bakåtfyllas** i övriga kemikapitel (matrisrad i `_CHECKLISTA_omraden.md`). |

### Formel-tecken: nedsänkt siffra (index) vs stor siffra (koefficient)

Skillnaden mellan `H₂O` (index = antal atomer i molekylen) och `2 H₂O` (koefficient = antal molekyler) är det elever oftast blandar ihop. Den tränas på fem sätt i atomer: (1) förklaring + bildexempel i M5, (2) Formelverkstaden, (3) Räknemaskinen, (4) dra-och-släpp/balansering i `ovningsverktyg.html`, (5) utskrivbart **arbetsblad** `formelark.html` (elever skriver formeln under varje kulbild; slumpat blad med frö i adressen `#…`, facit på eget blad, ryms på en A4-sida). Ska in även i periodiska systemet/jonföreningar/syror-baser när de får reaktionsformler.

### Standardsidor i atomer (mall för resterande kemiområden)

`index` (area-layout + hero med kulmodeller + begrepp + milstolpsnavigering), `studieguide`, `checklista`, `instuderingsfragor` (+print-elev/-larare), `ovningsprov` (+print), `facit` (+print), `begreppslista`, `begreppskort`, `larande-spel`, `ovningsverktyg` (dra-och-släpp), `bygg-molekyl`, `formelark`, `flashcards` (äldre). Färgtema per område via `body.area-<namn>` (atomer: `--area:#be185d; --area-strong:#9d174d; --area-soft:#fdf2f8; --area-border:#fbcfe8; --area-hover:#fce7f3`).

### Syror och baser – optimerad för den bredare studieguiden (21 sep 2026)

`kemi/syror-och-baser/studieguide.html` är nu en **bred studieguide med bildkolumn** (`<main class="guide-wide">`, teal `--guide-accent:#0f766e`) enligt Jespers beslut om den bredare studieguiden: viktiga föreningars **namn, molekylformel, 2D-strukturformel och roterbar 3D-kulmodell**, gula "Viktigt!"-rutor och bildtexter (`<figcaption>`) under bilderna.

- **Byggverktyg:** `tools/kemi-ritverktyg/syror-och-baser/bygg_syror.py` (`all | data | png [nycklar] | kort <nyckel>…`). Skriver `kemi/syror-och-baser/js/molmodeller.js`, `images/kemi/syror-och-baser/{strukturformler,jonkort,kulmodeller}/*` och `ph-skala.svg`. Geometrin är hämtad från NIST/CRC (svavelsyra S=O 1,422 Å, S–OH 1,574 Å; sulfat 1,49 Å tetraeder; nitrat 1,25 Å osv.) och kontrolleras med `check_geometry`. Vyn för varje modell väljs av `auto_view` så att inga atomer skymmer varandra (HNO₃ har fast vy). Återanvänder atomer-kapitlets modeller för HCl, Cl₂, H₂O, NH₃ och CO₂.
- **Ämneskort (`mol-card`)** = namn + formel + 2D + live-3D + stödtext. **Jonföreningar (NaOH, Ca(OH)₂, Na₂CO₃) får jonkort, inte molekylmodell** – de består av joner, inte molekyler, så kortet är märkt "Formel" och visar katjon (blå cirkel) och anjon (orange streckad rundad ruta), aldrig färg ensam. Joner (SO₄²⁻, NO₃⁻, OH⁻) ritas med lika långa streck; **laddningen hör till hela jonen** (egen Viktigt-ruta i M6). HNO₃ ritas med formella laddningar (N⁺/O⁻); att bindningarna i sulfat och nitrat i verkligheten är lika starka (delokalisering) står i en **fördjupningsruta**, inte i löptexten.
- **Färgkonvention (OBS, avviker från övriga kapitel):** i detta kapitel betyder **gult = "Viktigt!"** och `.deepen` (fördjupning) är omfärgad till skiffergrå/slate. I atomer m.fl. betyder gult (#fffbe7, ★) fortfarande fördjupning. Ska samordnas vid standardiseringen av studieguiderna (`_TODO_standardisering-studieguider.md`) – förslag: gult = Viktigt överallt, fördjupning = slate.
- **Gula rutor:** M1 (väte ≠ syra), M2 (svag ≠ ofarlig), M3 (HCl gas/lösning), **M4 SIV** (med det officiella GHS05-piktogrammet oförändrat, plus "Skyddsglasögon ska alltid användas"), M5 (nitrösa gaser, mörka flaskor), M6 (laddning), M7 (lut på huden), M10 (tiofaldig skillnad).
- **pH-skalan (M10, `ph-skala.svg`)** är en färgblindsäker infogram: 15 rutor, sur sida streckad, basisk sida prickad, siffror och zonetiketter SUR/NEUTRAL/BASISK. **Värdena är ungefärliga** (Helmenstine 2026, *The pH Scale of Common Chemicals*, Science Notes; Sydvatten, *Surt, basiskt eller neutralt?*). Surt regn anges som ≈ 5 (ej det ej verifierade 5,6).
- **Textkorrigeringar:** felaktigt räkneexempel i M10 ersatt (för att höja pH från 4 till 5 räcker ingen "lite vatten" – man behöver ca 100 L pH 8 per liter pH 4; **Jesper bör läsa M10**); "syrsdroppar" → "syradroppar". Indikatortabell (M11) tillagd som tabell med `ind-tabell no-listen`.
- **Flaskfoton kvarstår:** Jesper tar bilder på flaskor (saltsyra, svavelsyra, salpetersyra): stängd flaska mot vitt A3, etiketten vänd mot kameran, inget skolnamn/inventarienummer/rumsnummer i bild; bearbetas med fototjänsten (bakgrund bort, EXIF bort) och läggs in i respektive milstolpes bildkolumn med `<figcaption>`.
- **Testat:** 375/768/1000/1280 px – ingen sidscroll, inga konsolfel, max 3 samtidiga WebGL-kontexter, axe endast de redan kända delade träffarna (`nested-interactive`, `target-size` för Lyssna i `<summary>`).

### WCAG-notering (delade problem – åtgärdade 20 sep 2026)

`.subject-btn`, menyknappen, `.print-green`, `.footer-sub`, länkfärgen i `main a` och lyssna-knappens fördjupningsfärg är nu rättade i delad CSS (se "Knappar, navigering och utskrift" nedan). **Kvarstår:** Lyssna-knappen ligger inuti `<summary>` (interaktivt element i interaktivt element, axe `nested-interactive`, ca 200 träffar på 12 studieguider). Att lösa det kräver att knappen flyttas ut ur `<summary>` (t.ex. wrapper runt `<details>`), vilket ändrar layouten – gör tillsammans med Jesper.

---

## Knappar, navigering och utskrift – STÅENDE REGEL, sep 2026

Jesper (20 sep 2026): **navigeringsknappar (← Tillbaka …) och utskriftsknappar ska ALLTID ligga överst på sidan** och se likadana ut överallt, och alla färger ska klara WCAG 2.2 AA.

**Placering.** Första elementet i `<main>` är en åtgärdsrad: navigering först, utskrift sist. Fristående sidor (spel, laborationsprotokoll) har raden överst i sidan (eller fast i övre vänstra hörnet, `.print-fab`).

```html
<div class="page-actions no-print">
  <a href="./" class="subject-btn">← Tillbaka till området</a>
  <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>          <!-- valfria fler navigeringsknappar -->
  <button type="button" class="subject-btn print-green" onclick="window.print()">🖨️ Skriv ut</button>
</div>
```

- En extra upprepning av "Tillbaka" längst ned är tillåten, men den övre är obligatorisk.
- Utskriftsknappen ska ha skrivarikonen 🖨️ + text (inte enbart färg). Länkar till en utskriftssida (`facit-print.html` m.fl.) har samma klasser med `target="_blank"`.
- Knappar som är en del av själva övningen (Nästa, Föregående, Byt roll, Visa facit, Visa alla/Fäll ihop) är inte navigering/utskrift och styrs av sidans egen design.
- `.page-actions`, `.no-print` döljs vid utskrift (regeln finns i `css/knappar.css`). Behållarna `.prov-actions`, `.study-actions`, `.checklist-actions` har samma flex-layout.

**Utseende – en enda källa: `css/knappar.css`** (importeras överst i `css/style.css`; fristående sidor utan style.css länkar `<link rel="stylesheet" href="/css/knappar.css" />`). Ändra färger BARA där.

| Knapp | Klass | Utseende | Kontrast |
|---|---|---|---|
| Navigering | `subject-btn` | fylld blå `#0b5cad`, vit text, hover `#084a8c` | 6,9:1 / 8,9:1 |
| Utskrift | `subject-btn print-green` | kantad mörkgrön `#14532d` på vit, hover fylld | 9,1:1 |
| Menyknapp (hamburger) | `.hamburger` | samma blå som navigering (`--btn-nav`) | 6,9:1 |
| Fokus | – | 3 px mörkblå ring `#0b3d75`, 3 px avstånd | – |

Utskrift skiljs alltså från navigering på form (kantad vs fylld) och ikon, inte bara färg (Jesper är rödgrön färgblind). Länkar i löptext: `main a` = `#0b5cad`. Sidfotens undertext `#595959`. Använd aldrig `.print-green`-klassen med egen färg i sidans `<style>`.

**Kontrastmätning hela siten (20 sep 2026):** axe-core `color-contrast` över alla 279 sidor: 1 437 träffar före, ca 140 efter (rester: Lyssna-knappen i `<summary>` och enstaka sidspecifika färger). Gråa textfärger `#777/#888` → `#595959`, `#64748b` → `#475569`, grön `#16a34a` → `#15803d`, gul `#a37a00` → `#7a5c00`. **Nya sidor:** kör axe (color-contrast) innan de räknas som klara.

---

## Utskriftsstandard

Alla utskriftsvyer följer namnmönstret `*-print-elev.html`, `*-print-larare.html`, `ovningsprov-print.html`, `facit-print.html`.

- Utskriftslänkarna **ska enbart** finnas som knappar inne i moderdokumentet (`instuderingsfragor.html`, `ovningsprov.html`, `facit.html`). **Inte** som separata länkar i lärarmenyns `index.html`.
- Utskriftssidor kör `window.print()` automatiskt vid laddning och stänger sig sedan.

### Laborationsprotokoll – standardkomponent (från sep 2026)

Varje område som har fysiska laborationer ska ha ett utskrivbart laborationsprotokoll som HTML-sida på hemsidan, ALDRIG som en Word/docx-fil (lärare saknar ofta Word, och Jesper vill inte att materialet enkelt kan kopieras/spridas av vem som helst i redigerbart format). Standardnamn: `laborationer.html` (flera labbar) eller `<tema>lab.html` (en enskild labb, t.ex. `esterlab.html`).

Mönster (referens: `fysik/magnetism-induktion/laborationshandledningar.html`, samt `kemi/kol-och-kolforeningar/esterlab.html` som enklare enskild-labb-variant):

- Flytande "🖨️ Skriv ut"-knapp (`.print-fab`, `class="no-print"`) längst upp till vänster, `onclick="window.print()"`, plus en "← Tillbaka"-länk till studieguiden.
- `@page { size: A4; margin: ...}` och en `@media print`-block som döljer `.no-print` och nollar padding/marginaler för utskrift – INTE samma auto-print-och-stäng-mekanik som `*-print.html`-sidorna för prov/instuderingsfrågor (den passar quiz-data, inte fria labbtexter).
- Innehåll minst: Bakgrund/syfte, Material, Genomförande (numrerad lista), en tydlig **röd** "Risker vid laborationen"-ruta, ev. en referens-/facit-tabell, och en tom resultattabell eleverna fyller i.
- Om en lärare ska tillsätta något riskfyllt (t.ex. koncentrerad syra) i dragskåp: skriv ut det explicit i både Genomförande och Risker.
- Länka protokollet från TVÅ ställen: (1) studieguidens relevanta milstolpe (`next-steps`-rutan), och (2) områdets `index.html` under "Material för läraren".
- Lägg till `laborationer.html`/`<tema>lab.html` som standardkomponent i `_CHECKLISTA_omraden.md` när ett område får sin första laboration.

---

## Ritfrågor i övningsprov + utskrivbara arbetsblad – regler, sep 2026

- **Ritfrågor i övningsprov (Jesper, 20 sep 2026):** frågor där eleven ska RITA (strukturformel, atom, skiss) får INGA skrivlinjer vid utskrift – i stället ett fritt utrymme. I `data/ovningsprov.json` läggs `"draw": <höjd i mm>` på frågan (t.ex. 50 för en liten strukturformel, 65 för formel + förklaring, 80–90 för atom/hjärta). `js/render-prov.js` (`print-exam`) ritar då en streckad ruta (`.prov-draw`, `css/prov.css`) i stället för linjer. `lines` behålls (styr textrutans höjd på skärmen). Gäller alla nya prov med ritfrågor.
- **Utskrivbara arbetsblad ska också gå att fylla i på skärmen** (namn, datum, svarsfält som riktiga `<input>` med `aria-label`, utskrift visar det som skrivits). Exempel: `kemi/atomer/formelark.html` – där blir siffror efter en bokstav automatiskt nedsänkta (H2O → H₂O). Uppgifter som kräver ritning hänvisas till papper.
- **Arknummer** i slumpade ark = frö för slumpen: samma nummer ger alltid samma ark + facit (kan skrivas ut i efterhand, olika nummer till olika grupper, står på arket). Ska förklaras med en hjälptext vid fältet.
- **Formler skrivna digitalt (Jesper, 20 sep 2026):** i kemi-övningsprov (`/kemi/…/ovningsprov.html`) ska eleven skriva formeln SJÄLV (avskriva och sätta dit rätt siffror – det är det pedagogiska), men tangentbordet saknar nedsänkta tecken och pil. `js/kemi-inmatning.js` (laddas av `render-prov.js` automatiskt i kemi-mappar) omvandlar medan eleven skriver: siffra direkt efter atombokstav/parentes blir nedsänkt (H2O → H₂O), siffra efter mellanslag/+ förblir stor siffra, `->`/`=>` blir →, laddning skrivs `^3+` → ³⁺. Under textrutan finns knappar för → ⁺ ⁻ ² ³ (surfplatta). Ingen kopieringsknapp för formeln – eleven ska skriva av den. Nya kemi-prov med textrutor får detta gratis; i andra ämnen ingen omvandling.
- **Ritfrågor i instuderingsfrågor (Jesper, 20 sep 2026):** en fråga där något ska ritas (strukturformel, atom) får `"draw": <mm>` och `"drawNote": "…"` i `data/instuderingsfragor.json`. På skärmen visas noteringen "✏️ Rita … på papper eller i ditt skrivhäfte – skriv här bara …" ovanför svarsrutan; vid utskrift (elevversionen) får eleven ett fritt ritutrymme utöver skrivlinjerna. Textrutorna i kemiområden har samma formelhjälp som proven (`js/kemi-inmatning.js`; verktygsfältet visas bara för den ruta man skriver i).
- **Formulera frågor entydigt:** en fråga som ska ge ett svar om något specifikt (t.ex. molekylens tredimensionella form) ska säga det uttryckligen – inte "beskriv formen". Läs varje ny fråga som en elev som inte har facit framför sig.
- **Bläddra med piltangenterna (instuderingsfrågor, Jesper 20 sep 2026):** ↑/↓ mellan frågorna ska hålla den nya frågan på exakt samma plats på skärmen som den förra (sidan rullar automatiskt) så att eleven slipper pekplattan. Görs i `focusButton()` i `js/render-instudering.js` (fokus med `preventScroll` + `scrollBy`). Står den förra frågan långt ner placeras den nya ca 20 % från överkanten. Gäller alla listor/steg som navigeras med piltangenter – återanvänd samma mönster.
- **Kontrollera ALLTID utskriften** (Playwright `emulate_media('print')` + `page.pdf`) för alla storlekar/varianter av ett arbetsblad – 15 uppgifter på formelarket gav bilder med höjd 0 tills raderna fick fast höjd (`.grid.rows5`).

## Begreppskort – placering

`begreppskort.html` ska vara tillgänglig via `larande-spel.html` (länkkort i spelnätet), inte direkt från index.

Datafilen heter `data/begreppskort.json` med formatet:

```json
{
  "title": "Begreppskort – Område",
  "levels": {
    "1": [ { "term": "...", "def": "..." } ],
    "2": [ { "term": "...", "def": "..." } ]
  }
}
```

- Nivå 1: ~12 grundtermer (2 omgångar × 6 par)
- Nivå 2: ~12 fördjupningstermer, låses upp efter godkänd nivå 1

---

## Begreppsöversättning vid läsning (inline i löptexten) — STÅENDE REGEL för ALLA studieguider, sep 2026

### Ett gemensamt språkval (beslut 20 sep 2026)
- Det finns EN språkväljare på hela siten: "📖 Begrepp översätts till:" (`js/concept-lang-selector.js`, `<div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp">` + `data-termer-base="./data/termer"` i studieguiden). Valet sparas i `localStorage` `site.concept-lang` och gäller överallt: översikt (index), Begreppslista, checklistor och klickbara ord i studieguiden.
- Den gamla "Språk"-väljaren (TTS, `lang-selector-mount`, `site.tts-lang`) är BORTTAGEN från alla 35 sidor: den styrde bara uppläsningsrösten och gav svensk text med utländsk röst. `js/language-selector.js` finns kvar eftersom den exponerar `loadBegreppForLang`, men renderar ingen väljare. `js/lyssna.js` läser alltid upp på svenska.
- **Etiketter i rullistan (Jesper, 20 sep 2026):** slutmålet är "🇸🇪 Svenska" och "🇬🇧 English" utan tillägg (engelska = HELA siten på engelska) samt övriga språk som "🇸🇦 Arabiska (begrepp och checklistor) – العربية (المفاهيم وقوائم التحقق)". **Just nu** står det "(begrepp och checklistor)" efter arabiska, amhariska och kinyarwanda (checklistor översatta, AI-gjorda, ej korrekturlästa – se "Checklistöversättning") och "(begrepp)" efter övriga språk inklusive engelska. Etiketterna byggs i `js/concept-lang-selector.js` av två flaggor. **ATT GÖRA – kom ihåg att ändra:** (1) lägg fler språk i `CHECKLISTA_SPRAK` när deras checklistor är översatta (väljaren ligger redan på checklistesidorna), och `STOD = 'begrepp+checklistor'` först när ALLA språk har checklistor; (2) `ENGELSK_HELA = true` FÖRST när hela siten är översatt till engelska och godkänd. Etiketten ska alltid spegla det som faktiskt finns. Väljarens etikett: "🌐 Språk / Language:". Översättningarna av "begrepp"/"begrepp och checklistor" i etiketterna är AI-genererade – låt modersmålstalare titta på dem.
- **Framtid:** när engelsk helText finns (först efter Jespers korrektur) blir "🇬🇧 English" i SAMMA rullista valet för hela siten på engelska (ingen separat flagg-växel; växlar textspråk + uppläsningsröst, `getPreferredLang()` i `lyssna.js` ska då returnera `en-GB` för engelsk text). Övriga språk förblir begrepps-/checklistestöd, inte helöversättning.
- **Omfattning av översättning (rekommendation):** (1) begrepp + termer – klart för 11 språk; (2) checklistor – nästa steg, korta meningar, bra nytta; (3) studieguidens fulltext ENDAST engelska (Jesper kan korrekturläsa, sajten riktar sig även mot engelsktalande); ev. mellanting: korta milstolpesammanfattningar på andra språk om modersmålstalare kan granska. Instuderingsfrågor och prov översätts inte.

**REGEL (Jesper, 20 sep 2026):** Varje studieguide – befintlig och NY – ska ha begreppsöversättning vid läsning. En elev med annat modersmål som förstår en del svenska ska kunna välja språk överst i studieguiden ("📖 Begrepp översätts till:") och sedan klicka på fetmarkerade nyckelord i löptexten och få (a) full popup med översättning + förklaring + länk om ordet är ett kärnbegrepp i `data/begrepp.<prefix>.json`, eller (b) bara den översatta termen om det är en övrig fetmarkerad term (`data/termer.<prefix>.json`). Motivering: helöversättning av alla texter till många språk är orealistiskt – detta ger ändå läsestöd begrepp för begrepp.

**Krav för varje ny studieguide (bocka av innan området är "klart"):**
1. `<div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>` överst i studieguiden. Det finns INGEN separat TTS-"Språk"-väljare längre (se "Ett gemensamt språkval" nedan).
2. Scripten `concepts-popup.js`, `language-selector.js`, `concept-lang-selector.js` inlästa (i den ordningen) + begrepp.json-fetch-snutten (se nedan).
3. ALLA kärnbegrepp får `<span class="concept-inline" data-concept="…">` vid sin första fetmarkering; ALLA övriga `<strong class="term">`-ord som är riktiga vokabulärord (inte beskrivande fraser) wrapas likadant.
4. `data/begrepp.<prefix>.json` OCH `data/termer.<prefix>.json` för alla **11 språk**: am, ar, bs, en, es, fa, pl, ps, rw, so, ur. Nya begrepp/termer i ett befintligt område ska översättas till alla 11 språk samma session.
5. Testa med Playwright: klicka på varje `.concept-inline` med ett annat språk valt – popupen ska öppnas och visa `namn_native` (sätt `localStorage['site.concept-lang']` före sidladdning, loopa över `.concept-inline`, kontrollera `#concept-modal.open`).
6. Uppdatera raden i `_CHECKLISTA_omraden.md`.

**Status 20 sep 2026:** utrullat i ALLA 12 studieguider (atomer, magnetism-induktion, elektricitet, kraft-och-rorelse, universum, arbete-energi-effekt, elektrokemi, periodiska-systemet, syror-och-baser, kol-och-kolforeningar, genetik, liv-och-cellen), 11 språk vardera, testat i 6 språk (alla `.concept-inline` öppnar popup). Översättningarna är AI-genererade – lägre konfidens för amhariska, pashto, somaliska och kinyarwanda; stickprov av modersmålstalare önskas. Några kärnbegrepp saknar fetmarkerad förekomst i texten (atomer: "Fysikalisk förändring"; genetik: "AB0-systemet", "Crossing-over", "Dihybrid korsning") – de kommer med i begreppslistan men har ingen klickbar plats i löptexten förrän texten kompletteras.

**Prototyphistorik:**

Ny, fristående funktion utöver den vanliga begrepp-popupen (som nås via knappar i concept-section på `index.html`/`begreppslista.html`): enskilda ord *inne i studieguidens löptext* går att klicka på och ger en popup, utan att eleven lämnar sidan. Två nivåer, med olika djup, se nästa avsnitt för den lättviktiga nivån:

1. **Kärnbegrepp** (de ~15 i områdets begreppslista/checklista) – full popup: översättning + förklaring + länk. Bygger på samma data (`data/begrepp.<prefix>.json`) och samma popup-komponent (`concepts-popup.js`) som redan fanns – ingen ny datakälla för dessa.
2. **Termer** (övriga fetmarkerade ord, `<strong class="term">`, som INTE är kärnbegrepp) – lättviktig popup: BARA översättning, ingen förklaring, inte med i checklistan. Se separat avsnitt nedan.

**Status (kärnbegrepp):** pilotbyggd i `fysik/magnetism-induktion/studieguide.html` – alla 15 begrepp i området har en klickbar förekomst VID SIN FÖRSTA FETMARKERADE nämning i respektive milstolpe (dvs. samma ställe där `<strong class="term">` redan introducerar begreppet). Jesper testade och beslutade den slutgiltiga regeln (sep 2026): kärnbegreppen förblir som de är (fortsätter poppa upp, full förklaring). Övriga fetmarkerade ord ska visa BARA en översättning vid klick, utan att läggas till i begreppslistan – se "Termer"-avsnittet nedan för hur det är löst. Jesper har beslutat (sep 2026) att funktionen (både kärnbegrepp- och termer-nivån) ska spridas till alla färdiga och framtida områden – se _CHECKLISTA_omraden.md, avsnitt "Sprid funktioner", för status per område. Motivering: viktig USP (se om-plattformen.html) – ett digitalt läromedel kan möta varje elev på sitt eget språk begrepp för begrepp, vilket väger tungt för elever med annat modersmål än svenska, även om den pedagogiska trenden i övrigt talar för tryckta läromedel.

**Historik (ersatt 20 sep 2026, se "Ett gemensamt språkval"):** tidigare fanns en HELT EGEN språkväljare bredvid, separat från den vanliga TTS-språkväljaren (`lang-selector-mount` / `site.tts-lang`). Annars skulle en elev som vill lyssna på/läsa svensk text tvingas byta hela sidans språk bara för att få begreppen översatta – och TTS:en skulle då försöka läsa (ännu oöversatt) svensk text med fel röst.

**Filer:**
- `js/concept-lang-selector.js` – ny, oberoende väljare. Egen `localStorage`-nyckel `site.concept-lang`. Återanvänder `window.LangSelector.loadBegreppForLang(lang, begreppBase)` (exponerad från `language-selector.js`) för hämtning/cache av kärnbegrepps-JSON, men har DESSUTOM sin egen separata fetch/cache för termer-JSON (se nedan) – påverkar ALDRIG TTS-rösten.
- `js/language-selector.js` – oförändrad i sak, bara exponerar `window.LangSelector.loadBegreppForLang` så den nya väljaren kan återanvända hämtningslogiken. Medvetet INTE utökad med termer-logik, för att undvika regressionsrisk i den redan fungerande TTS-språkväljaren.
- `js/concepts-popup.js` – ny CSS-klass `.concept-inline` (klickbart understruket ord, samma hover-färg som `.concept-btn`). Internt två separata index: `conceptsCore` (kärnbegrepp) och `conceptsTerms` (termer), en `lookup(name)`-hjälpfunktion som kollar båda. Om ett ord inte finns i någotdera (t.ex. en termer-popup innan ett språk är valt) gör klicket inget – ingen krasch.

**Markup per område (i `studieguide.html`):**
```html
<div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>
```
och i själva löptexten, ordagrant matchande `namn`-fältet i respektive JSON (attributvärdet, inte den synliga ordformen – böjda/gemena former i texten är okej):
```html
<span class="concept-inline" data-concept="Exakt namn som i begrepp.json eller termer.json">ordet i texten</span>
```
Dessutom krävs, sist i `<body>` (EFTER `language-selector.js`, annars finns inte `window.LangSelector` än):
```html
<script src="/js/concepts-popup.js"></script>
<script src="/js/concept-lang-selector.js"></script>
<script>
  fetch("./data/begrepp.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.length) return;
      window.BEGREPP = data;
      var savedConceptLang = 'sv-SE';
      try { savedConceptLang = localStorage.getItem('site.concept-lang') || 'sv-SE'; } catch (e) {}
      if (savedConceptLang === 'sv-SE' && window.BEGREPPPopup) window.BEGREPPPopup.update(data);
    })
    .catch(function (e) { console.warn('Kunde inte hämta begrepp.json', e); });
</script>
```
Kapplöpnings-skyddet i sista scriptet (kolla `site.concept-lang` innan `BEGREPPPopup.update` anropas) är avsiktligt – annars kan den svenska bas-hämtningen skriva över ett redan valt annat begrepp-språk beroende på vilket `fetch`-anrop som svarar sist. Ingen motsvarande svensk bas-fetch behövs för termer (se nedan – på svenska ska termer-klick inte göra något).

**Spridning:** klar för alla nuvarande studieguider (20 sep 2026) – gäller som regel för alla nya, se kravlistan överst i detta avsnitt.

### Fetmarkerade termer utan egen definition ("termer")

Jespers slutgiltiga beslut (sep 2026), ordagrant: "de begrepp som är viktiga för förståelsen (de vi redan valt ut) ska vara kvar och de poppar också upp i texten. De fetstilta ord som inte tillhör dessa vill jag ska översättas vid popupen, men behöver inte ha en tillhörande förklaring i övrigt och behöver inte vara med i begreppsordlistan." Alltså: fetstil ska konsekvent betyda "viktigt, klickbart" – men bara kärnbegreppen får full förklaring; övriga fetmarkerade ord får bara en översättning.

**Datastruktur:** `data/termer.json` (svensk bas – finns INTE som fil, behövs inte eftersom svenska aldrig visar någon termer-popup, se nedan) + `data/termer.<prefix>.json` per språk (samma 11 prefix som begrepp: am/ar/bs/en/es/fa/pl/ps/rw/so/ur), format:
```json
[{ "namn": "rotor", "namn_native": "rotor" }, ...]
```
Bara `namn` (måste matcha `data-concept`-attributets värde exakt) och `namn_native` – ingen `definition`, ingen `anchor`.

**Beteende på svenska (`sv-SE`, dvs. inget språk valt):** klick på en termer-markerad ord gör INGET (ingen popup) – `conceptsTerms` är tom tills ett språk väljs. Detta är ett medvetet, godkänt beteende (inte en bugg) eftersom en term per definition inte har någon svensk "översättning" att visa.

**Hur `concept-lang-selector.js` hanterar termer:** helt separat kod från kärnbegreppen (rör INTE `language-selector.js`). Vid språkbyte: om `data-termer-base` finns på mount-diven, hämtas (och cachas per språk) `{termerBase}.{prefix}.json`, och `window.BEGREPPPopup.updateTermer(data)` anropas. Samma kapplöpningsskydd som för kärnbegrepp (kollar att valt språk fortfarande är detsamma innan datan appliceras).

**Pilot:** `fysik/magnetism-induktion/studieguide.html`, 22 termer identifierade genom att gå igenom samtliga `<strong class="term">`-förekomster och plocka bort generiska/beskrivande fraser (t.ex. "lika poler stöter bort varandra") som inte är egna vokabulärord: magnetiserat, keramiska magneter, neodymmagneter, högerhandsregeln, Lorentzkraften, nordände, sydände, antalet varv, kommutator, rotor, stator, induktionsspänning, inducerad ström, likström, primärspolen, sekundärspolen, uppstegringstransformator, stamnätet, nedstegringstransformatorer, fas, nolla, skyddsjord. Dessutom länkades en extra bar förekomst av "nordpol" (i Kompassen-avsnittet, M3) till det BEFINTLIGA kärnbegreppet `data-concept="Nordpol och sydpol"` istället för att bli en egen termer-post. Översättningarna (särskilt amhariska, pashto och somaliska) är AI-genererade utan inbyggd verifiering – lägre konfidens än för kärnbegreppens redan etablerade begrepp.<prefix>.json-filer; värt att stämma av med modersmålstalare vid tillfälle, men inget som blockerar utrullning eftersom termer-popupen bara är ett litet extra stöd, inte huvudförklaringen.

**Spridning:** klar för alla nuvarande studieguider (20 sep 2026). Mönster för nya områden: identifiera icke-kärnbegrepp `.term`-ord, skapa `data/termer.<prefix>.json` för alla 11 språk, wrapa i löptexten.

---

## Lyssna-funktion (studieguide)

Alla `studieguide.html` ska ha en lyssna-funktion som lägger till en "🔈 Lyssna"-knapp i varje milstolpe och fördjupning.

### Aktivering (lägg före `</body>`)

```html
<script src="/js/lyssna.js" data-audio-base="/fysik/elektricitet/audio/"></script>
```

- `data-audio-base` pekar på mappen med mp3-filer för området.
- Skriptet försöker spela `{audio-base}{milestone-id}.mp3` (t.ex. `m1.mp3`) och `{milestone-id}-fordj.mp3` för fördjupning.
- Om mp3 saknas faller det automatiskt tillbaka på Web Speech API (TTS, svenska).

### CSS-färger

CSS-reglerna för `.listen-btn` finns i `/css/style.css` och använder variablerna `--listen-color`, `--listen-border`, `--listen-hover-bg`. Standard är fysik-blå (`#2e4a8a`). Kemi-sidor sätter egna värden i sidans `<style>`-block:

```css
/* Exempel: syror-och-baser */
:root {
  --listen-color: #0f766e;
  --listen-border: #99f6e4;
  --listen-hover-bg: #f0fdfa;
}
```

| Område | `--listen-color` |
|---|---|
| Alla fysik-sidor | `#2e4a8a` (standard, ingen override behövs) |
| periodiska-systemet | `#166534` |
| syror-och-baser | `#0f766e` |

### mp3-filer

Lägg inspelade filer i `audio/`-mappen i resp. område:
- `m1.mp3`, `m2.mp3`, … (en per milstolpe)
- `m1-fordj.mp3`, … (fördjupningsavsnitt, valfria)

Tills filer finns används syntetisk röst (TTS) som standard.

---

## Helöversättning av studieguidetexter + flerspråkig uppläsning (PLANERAD, EJ PÅBÖRJAD)

**Jespers riktning (20 sep 2026):** helöversättning av alla texter till många språk är orealistiskt – språkstödet för de flesta språk är därför begreppsöversättningen vid läsning (se ovan). För **engelska** ska däremot HELA texten översättas när eleven trycker på språkknappen. Själva helöversättningen görs FÖRST när allt är korrekturläst och godkänt av Jesper – inte innan.

I dag täcker flerspråksstödet bara begreppen (`data/begrepp.<prefix>.json`). Själva löptexten i studieguiden finns bara på svenska, och `lyssna.js` läser bara upp svensk text (inspelad mp3 eller annars Web Speech API på `sv-SE`). Detta är en medveten SENARE fas: påbörjas först när ett områdes svenska text är helt slutgranskad och godkänd av Jesper (se `pedagogik.md`). Det här avsnittet dokumenterar HUR det ska göras när den fasen inleds, så inget går förlorat mellan sessioner.

**Steg 1 – datastruktur för översatt löptext.** Ny datafil per område och språk, t.ex. `data/studieguide.<prefix>.json`, som speglar milstolpestrukturen (`m1`, `m2`, …) och innehåller den ÖVERSATTA brödtexten milstolpe för milstolpe (inte bara begrepp). Varje textblock som ska kunna bytas ut behöver ett stabilt attribut att hänga översättningen på, t.ex. `data-i18n-block="m3-text"` på respektive `<div>`/`<p>`-grupp i studieguiden.

**Steg 2 – generering av översättningen.** Automatöversättning (AI) av den redan godkända svenska texten, milstolpe för milstolpe. Jesper förväntas INTE läsa igenom hela textmassan i alla språk ord för ord, men bör göra stickprov – särskilt av facktermer. Viktigast: facktermerna i den översatta löptexten måste matcha EXAKT de redan godkända översättningarna i `data/begrepp.<prefix>.json` (annars får eleven två olika ord för samma begrepp – ett i löptexten, ett i begreppspopupen).

**Steg 3 – rendering.** Klientsidesväxling, samma mönster som begreppen redan använder: vid språkbyte (flagg-växel, se "Ett gemensamt språkval") hämtas `data/studieguide.<prefix>.json` och byter ut brödtexten i varje märkt textblock. Enklare (men tyngre DOM) alternativ: rendera båda språkversionerna i HTML från start och toggla synlighet med CSS/JS. Föredra klientsidesväxling via fetch – konsekvent med hur begreppen redan hanteras.

**Steg 4 – TTS-koppling.** `lyssna.js` måste uppdateras så att när ett annat språk än svenska är valt OCH en översatt textfil finns för området, läses den ÖVERSATTA texten upp med en röst som matchar språkkoden (samma `LANG_PREFIX`-mappning som redan finns i `language-selector.js`). Saknas översatt text eller röst: falla tillbaka till nuvarande beteende (svensk röst läser svensk text) – aldrig fel röst på fel språk.

**Prioritering:** börja med språk som redan har begrepp-översättningar och tydlig efterfrågan i klassen (t.ex. arabiska, somaliska, urdu), inte alla ~11 språk samtidigt.

**Relaterat, redan byggt:** se "Begreppsöversättning vid läsning" ovan – den funktionen löser ett näraliggande men mindre problem (enskilda begreppsord) och kräver INTE denna helöversättning. De två funktionerna är oberoende av varandra och kan användas var för sig.

---

## Videoruta – klicka-för-att-ladda YouTube (GDPR-vänligt)

Återanvändbar komponent för att bädda in YouTube-klipp utan att kontakta Google innan eleven klickar på play. Ingen spårning och inga cookies förrän filmen startas (använder `youtube-nocookie.com`).

- Filer: `/js/videoruta.js` + `/css/videoruta.css`.
- Länka båda i `<head>`/före `</body>` och lägg en tom div där klippet ska visas:

```html
<div class="videoruta"
     data-yt="9gUdDM6LZGo"
     data-start="2738"
     data-titel="Energiprincipen förklarad"
     data-text="Kort beskrivning under rubriken."
     data-flagga="🇸🇪"></div>
```

Attribut: `data-yt` (krävs, video-id), `data-start` (starttid i sek), `data-titel`, `data-text`, `data-flagga` (språk-emoji). Första användning: `fysik/arbete-energi-effekt/for-lararen.html`.

## För läraren-sidor

Sidor med lärarstöd (t.ex. videoklipp för genomgångar) heter `for-lararen.html` i områdesmappen. De **länkas inte från elevernas meny** utan bara från en egen "För läraren"-ruta på områdets index, och har `<meta name="robots" content="noindex, nofollow">`. Detta är i nuläget bara en mjuk spärr – eleverna kan nå sidan om de har länken. När vi lägger upp material som inte bör spridas fritt får vi lägga på ett riktigt kodord/lösenord (t.ex. via Cloudflare Access). Första sidan: `fysik/arbete-energi-effekt/for-lararen.html`.

## Checklistöversättning (ar, am, rw – sep 2026)

Jesper (20 sep 2026): språkbehovet för checklistor är just nu **arabiska, amhariska och kinyarwanda**. Alla 15 checklistor har `data/checklista.ar.json`, `checklista.am.json`, `checklista.rw.json` (samma struktur som `checklista.json`, samma antal avsnitt och punkter; `id` oförändrade).

- **Visning:** `js/render-checklista.js` renderar alltid den svenska texten och lägger översättningen som ett eget block under varje punkt/rubrik/not (`.checklist-tr`, `lang`+`dir` satta, arabiska = `rtl`; skillnaden mot svenskan bärs av indrag + vänsterlinje, inte bara färg). Vid språkbyte fylls befintliga rader – ikryssade rutor och uppfällda avsnitt påverkas inte. Knapparna "Visa alla/Fäll ihop alla", "Reflektion" och en hjälptext får tvåspråkig text; ovanför listan visas en AI-märkning (på språket + svenska): översättningen är AI-gjord och inte korrekturläst. Utskrift visar båda språken.
- **Val av språk:** den gemensamma väljaren (`concept-lang-selector.js`, `site.concept-lang`) ligger nu även på alla `checklista.html` (`<div class="concept-lang-selector-mount no-print">`). Väljaren skickar `conceptLangChange` på `window`; renderaren lyssnar på den (och på `storage`, och läser sparat val vid laddning).
- **Andra språk:** har eleven valt t.ex. somaliska visas checklistan bara på svenska (ingen översättning finns). Nytt språk = lägg till en post i `CHECKLIST_LANGS` (prefix, dir, UI-texter, AI-not) i `js/render-checklista.js`, språkkoden i `CHECKLISTA_SPRAK` i `js/concept-lang-selector.js`, och `checklista.<prefix>.json` i varje område.
- **Etikett i rullistan:** ar-SA, am-ET och rw visas som "(begrepp och checklistor)"; övriga språk och engelska som "(begrepp)". Avvikelse från Jespers tidigare regel ("ändra först när ALLA checklistor är översatta och korrekturlästa"): etiketten speglar nu det som faktiskt finns, per språk. Vill Jesper ha "(begrepp)" tills korrekturläst: sätt `VISA_CHECKLISTETIKETT = false` i `concept-lang-selector.js` (en flagga).
- **Nya checklistor:** ta med i översättningen (en subagent per språk, strukturidentiskt resultat, validera maskinellt: struktur, antal, skrift, siffror/enheter/milstolpekoder, inga svenska rester) och lägg raden i `_CHECKLISTA_omraden.md`.
- **Fix samtidigt:** `fysik/universum/checklista.html` visade "Inget innehåll hittades" (JSON använder `groups/heading/items[{text}]`); renderaren normaliserar nu båda formaten. Utskriftens rubrik (vit text utan bakgrundsbild) är nu mörk i `css/checklista.css`.

## Övningsprov + facit + instuderingsfrågor + checklista (tunna mallar)

Dessa fyra sidtyper är tunna HTML-mallar som renderar JSON via delad JS. Klona från en färdig area (fysik: `fysik/kraft-och-rorelse/`; biologi: `biologi/genetik/`) och byt bara ut områdesnamnet i `<title>` och `<header><p>`.

- `checklista.html` → `js/render-checklista.js`, data `{sections:[{id?, title, note?, items:[]}]}` (Universum använder `{groups:[{heading, items:[{text}]}]}` – renderaren normaliserar båda). Översatta checklistor: se "Checklistöversättning" nedan.
- `instuderingsfragor.html` (+ `-print-elev`, `-print-larare`) → `js/render-instudering.js`, data `{groups:[{title, items:[{q,a,lines?}]}]}`.
- `ovningsprov.html` (+ `-print`), `facit.html` (+ `-print`) → `js/render-prov.js`, data `{sections:[{title, questions:[]}]}`. Frågetyper: vanlig `{q,a,lines}` eller `{type:"match", title, left:[], right:[], a}`. OBS: render-prov escapar HTML och gör inte radbrytningar i facit – skriv räknefacit på en rad med `·` och `→`.
- Prov-sidorna kan ha ett `formelblad` (statisk `<section class="formelblad">` före `#prov-container`), som även skrivs ut.

Ett övningsprov ska träna **samma förmågor** som ett riktigt prov i området, men med **egna uppgifter och siffror** (aldrig kopiera). Facit i räkneexempel-format (formel → insättning med enheter → svar med enhet).

## Originalitet – inga kopior av lärobokstext

När Claude skapar **studieguider**, **instuderingsfrågor** och **övningsprov** gäller att all text ska vara ny och självständigt formulerad. Det är inte tillåtet att kopiera eller nära citera text från läroböcker (t.ex. TEFY, Puls, Spektrum eller andra förlag).

- **Inspirationen** kan komma från läroböcker och PDF-material som Jesper delar.
- **Formuleringarna** ska alltid vara omskrivna – egna meningar, egna exempel, eget pedagogiskt grepp.
- Kemiska formler, reaktionslikningar och faktauppgifter (t.ex. atomnummer, kockpunkter) är offentlig faktakunskap och kan användas fritt.
- Varje studieguide ska avslutas med en **källförteckning** (`<section class="references" id="kallor">`) med numrerade referenser i APA-liknande format, i linje med universum/studieguide.html.

Syftet är att Jesper ska kunna publicera och använda materialet utan risk för anklagelse om upphovsrättsintrång.

---

## Räkneexempel – standardformat

Alla räkneexempel (studieguider, räknekort, prov) skrivs i tre steg, och enheterna räknas med hela vägen:

1. **Formeln först** (i symboler).
2. **Insättning av mätetal med enheter.**
3. **Svar med enhet** (på egen "Svar:"-rad).

Exempel:

```
F = m · g = 20 kg · 10 N/kg = 200 N   (g = 10 N/kg)
W = F · s = 200 N · 1,5 m = 300 Nm = 300 J
Svar: Arbetet blir 300 J.
```

Tyngdfaktorn skrivs g = 10 N/kg. I studieguider introduceras formatet med en tydlig "Minnesregel"-ruta vid det första räkneexemplet.

---

## Kontrollfrågor med klicka-för-svar (inline i löptexten) — STÅENDE REGEL, sep 2026

Idé hämtad från en konkurrentanalys av naturvetenskap.se (sep 2026): de har korta övningsfrågor direkt i löptexten med ett dolt facit man klickar fram, som ett lågtröskel-sätt att kontrollera sig själv utan att lämna sidan. Detta ska föras in som ett KOMPLEMENT (inte ersättning) till de befintliga instuderingsfrågorna/övningsproven, specifikt i områden där beräkningar/formler ingår och där en snabb kontrollfråga direkt efter ett räkneexempel ökar förståelsen.

**Bekräftade kandidatområden (Jespers egna, sep 2026):** fysik/arbete-energi-effekt, fysik/kraft-och-rorelse, fysik/tryck. Fler områden kan tillkomma — bedöm område för område (samma princip som undantaget för räknekort ovan: inför inte överallt per automatik).

**Mönster:** ett `<details class="check-q">`-block direkt efter ett räkneexempel eller ett nyckelresonemang i studieguidens löptext, med frågan som `<summary>` och facit dolt i en `<div class="svar">` som visas vid klick.

CSS (samma `<style>`-block som övriga komponenter, egen färg — blå, skild från gula `.deepen` och orange `.fact-box` så de tre inte blandas ihop):
```css
.check-q { background:#eff6ff; border-left:4px solid #2563eb; border-radius:6px; padding:0.7rem 0.95rem; margin:0.9rem 0; }
.check-q > summary { cursor:pointer; font-weight:600; color:#1e3a8a; list-style:none; }
.check-q > summary::-webkit-details-marker { display:none; }
.check-q > summary::before { content: "✓ Kontrollera dig själv: "; }
.check-q > summary::after { content: " (visa svar)"; font-weight:400; color:#64748b; }
.check-q[open] > summary::after { content: " (dölj svar)"; }
.check-q .svar { margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed #bfdbfe; }
```

HTML:
```html
<details class="check-q">
  <summary>Hur stort blir arbetet om en kraft på 50 N flyttar en låda 3 m?</summary>
  <div class="svar"><strong>Svar:</strong> W = F · s = 50 N · 3 m = 150 J</div>
</details>
```

Inte gjort ännu i något område — detta är påminnelseregeln som ska följas nästa gång vi bygger/reviderar arbete-energi-effekt, kraft-och-rorelse eller tryck (och andra beräkningstunga områden vi stöter på).

---

## WCAG 2.2 AA-granskning — STÅENDE REGEL, sep 2026

Allt nytt arbete framöver ska kontrolleras mot WCAG 2.2 nivå AA innan det räknas som klart, och befintligt material ska granskas successivt bakåt (område för område, inte allt på en gång – prioritera inte om Jesper inte ber om det).

**Konkreta kontrollpunkter (checka dessa, inte bara "kändes okej"):**
- **Kontrast:** brödtext mot bakgrund ≥ 4,5:1, stor rubriktext/UI-komponenter (knappar, ramar) ≥ 3:1. Mät faktiskt (t.ex. med ett litet skript som räknar ut kontrastkvoten från CSS-variablerna), lita inte på ögonmått – extra viktigt eftersom Jesper själv är rödgrön färgblind.
- **Inte bara färg:** information (rätt/fel, aktiv nivå, vald flik) ska alltid ha ett andra kännetecken utöver färgen (ikon, text, mönster) – redan delvis gjort (orange istället för rött i tävlingsspelen, blå "Fortsätt"-knapp).
- **Alt-texter:** varje `<img>` ska ha en alt-text som beskriver vad bilden visar, inte filnamnet eller "bild".
- **Tangentbordsnavigering:** alla klickbara ytor (svarsknappar, "Fortsätt", menyer, `<details>`-rutor) ska nås med Tabb och aktiveras med Enter/mellanslag, med en synlig fokusram. Helst riktiga `<button>`/`<a>`-element, inte `<div onclick>`.
- **Rubrikstruktur:** logisk H1 → H2 → H3 utan hopp på varje sida.
- **Formulär:** textfält (t.ex. bokstavsrutorna i matchningsfrågor) ska ha en kopplad `<label>` eller `aria-label`.
- **Skalbarhet:** sidan ska gå att zooma till minst 200 % utan att layouten går sönder.

**Pilotgranskning (sep 2026):** kol-och-kolföreningar (studieguide.html + ovningsprov.html) är först ut som test för att se hur mycket som redan uppfylls och vad som typiskt behöver justeras, innan vi bestämmer omfattning för resten av plattformen.

Referens: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

---

## Spridning av funktioner/USP:ar till alla områden — STÅENDE REGEL, sep 2026

Risk Jesper lyfte (sep 2026): ju fler generella förbättringar vi kommer på under arbetets gång, desto större risk att de bara införs där de först uppfanns och glöms bort på övriga områden — vilket ger en spretig, "irriterande heterogen" slutprodukt för eleven. Att bara nämna en spridningsavsikt i chatten eller lita på Claudes minne räcker inte — det har redan hänt att `_CHECKLISTA_omraden.md` legat ouppdaterad med flera nya funktioner (3D-kulmodeller, begreppsöversättning vid läsning, kontrollfrågor, begreppsbingo m.m. saknades) innan detta uppmärksammades.

**Den faktiska säkringen:** `_CHECKLISTA_omraden.md`, avsnittet "Sprid funktioner – USP/funktionsmatris", är sanningskällan — inte minnet, inte chatthistoriken. Regler:

1. Så fort Jesper eller Claude beslutar att en ny funktion/USP ska gälla brett (fler än ett område), läggs den till som en NY RAD i matrisen **samma session**, med status per område Utfärdad (✓/✗/–/?) — även om den bara är byggd i ett pilotområde än.
2. Innan ett område förklaras "klart" ska dess kolumn i matrisen gås igenom rad för rad.
3. Ett `?` i matrisen betyder okontrollerat, inte "antas OK" — verifiera mot faktiska filer (grep) innan det ändras till ✓ eller ✗, gissa aldrig.
4. Minnesfilen (Claudes minne, `/areas/no-plattform.md`) får gärna innehålla den narrativa historien (varför ett beslut togs), men ska INTE vara det enda stället där ett spridningsbeslut finns – det hör till repo-filen så Jesper också kan läsa den direkt, utan att fråga Claude.

---

## Ingen hänvisning till "skolan"/specifik skola som källa/ägare — STÅENDE REGEL, sep 2026

Anledning (Jesper, sep 2026): (1) Text som kopplar material, foton eller arbete till "skolan"/arbetstid på skolan riskerar att stödja ett framtida kommunalt anspråk på ägarskap av plattformen. (2) Plattformen riktar sig brett – alla skolor/elever i Sverige, Finlands svenskspråkiga elever, och på sikt (efter engelsköversättning) engelsktalande länder som USA (bland annat hemundervisningsmarknaden där) – en lokal "vår skola"-koppling passar inte den målgruppen.

**Regel: gäller HELA NO-plattformen, alla ämnen och områden — inte bara där det först upptäcktes.** Nämn aldrig "skolan", "vår skola", "min skola" eller liknande som källa/ägare till material, foton, riskbedömningar eller specifikt undervisningsinnehåll, i något område. Håll ursprunget generiskt ("en samling uppstoppade fåglar", "riktiga foton", "egen riskbedömning", osv). Personlig kreditering (Jesper Tordsson, familjemedlemmar) är okej och ska vara kvar – det är institutionskopplingen som ska bort, inte den personliga krediteringen. Kontrollera nya sidor mot detta innan de räknas som klara, precis som med WCAG-regeln ovan.

**Åtgärdat sep 2026:** fågeltävlingen (`biologi/ekologi/faglar-tavling.html`, `larande-spel.html`, `data/faglar.json`) hade flera "skolans"-omnämnanden (rubrik, introtext, fotokreditering) – borttagna. `kemi/kol-och-kolforeningar/esterlab.html` och `alkoholdemo.html` hade källhänvisningar till "skolans egen riskbedömning" – ändrat till "egen riskbedömning".

**Fågeltävlingen – egna fältfoton (21 sep 2026):** Jespers tre fältfoton från den 21 sep (häger, gräsand hane+hona, gråkråka) har ersatt de gamla bilderna av gräsand och gråkråka (`bilder-faglar/grasand-1.jpg`, `grakraka-1.jpg`, samma filnamn) och lagt till arten **Häger** (`hager-1.jpg`). Senare samma dag kom fler äldre foton: **gräsand hona med ungar** (`grasand-2.jpg`, gräsand har nu två bilder) och arten **Salskrake** (`salskrake-1.jpg`, hane; fakta från fageln.se och djurfakta.com) – 31 arter. Ett foto av en rörhöna (IMG_2971.HEIC) låg med i samma leverans men var inte beställt och är därför inte inlagt. Bilderna är beskurna till 3:4, 600×800 px, utan EXIF/GPS (originalen hade GPS – publicera aldrig originalen). Tävlingen visar nu **både uppstoppade och levande fåglar**, så "uppstoppade" är struket i rubrik, introtext (`data/faglar.json`) och kortet i `larande-spel.html`. Artfakta för Häger bygger på Fågelkartan (fagelkartan.se/art/grahager, 90–100 cm, vingspann 175–195 cm, jakt, kolonihäckning i träd); Naturhistoriska riksmuseet kallar arten "Gråhäger (häger)" (sidan gick inte att hämta, robots.txt). Namnet i tävlingen är "Häger" enligt Jespers önskemål.

## Separationsprocesser – byggt 20 sep 2026 (verktyg, standarder, återanvändning)

Området `kemi/separationsprocesser/` är byggt som ett komplett kemikapitel (alla 13 standardsidor + specialverktyg). Allt genereras från källor i `tools/kemi-ritverktyg/separationsprocesser/`; **redigera källorna, inte de genererade HTML/JSON-filerna**, och kör sedan `python3 bygg_alla.py` (kräver python3 + beautifulsoup4; skriver bara i `kemi/separationsprocesser/` och `images/kemi/separationsprocesser/`). Ordning: `rita_alla` → `bygg_studieguide` → `bygg_data` → `bygg_sidor` → `bygg_verktyg` → `bygg_lab` → `bygg_bingo` → `bygg_korsord` → `bygg_index`. Ombyggnad ger bit-identiska filer (verifierat).

**Källor:** `src/m1_m3.html`, `m4_m6.html`, `m7_m9.html` (studieguidens nio milstolpar; makro `[[Begrepp|visad text]]` = klickbart kärnbegrepp), `studieguide.css`, `kallor.json` (12 verifierade källor), `data_begrepp.py` (49 begrepp, begreppskort, checklista), `data_fragor.py` (instuderingsfrågor + övningsprov), `data_ovningar.py` (11 dra-och-släpp-övningar), `data_valj.py` (metoder + 14 scenarier), `labdata.py` (7 laborationer), `svglib.py` + `rita_1.py`/`rita_2.py` (22 SVG-bilder, ritade i kod; teal palett, färgblindsäkra: form + text, aldrig bara rött/grönt).

**Studieguide:** bred layout (`css/studieguide-bildkolumn.css`) där bilderna ligger i egna fullbredds-rader (`m-row--full > .fig-wide`) eftersom sidokolumnens bilder blev oläsliga. Fetmarkerade *kärnbegrepp* (`data/begrepp.json`) och *termer* (29 övriga fetmarkerade ord, listade i `bygg_studieguide.py` → `TERMER`, sparas i `termer_i_text.json`) är klickbara enligt "Begreppsöversättning vid läsning". Nytt ord i texten: lägg det i BEGREPP (`data_begrepp.py`) eller TERMER, bygg om, och översätt till 11 språk. Bygget stoppar om ett klickbart begrepp saknar definition.

**Partikelsimulatorn** (`partiklar.html`, `js/partikelmodell.js`): live-modell av fast/flytande/gas med temperaturreglage för vatten, etanol och järn (smält- och kokpunkter från källorna); `<div data-partikel data-amne="vatten|etanol|jarn" data-kompakt>` kan bäddas in i studieguiden. Reglaget är en vanlig `range`-input (går att styra med tangentbord), en statusrad läser upp tillståndet i ord för skärmläsare, och `prefers-reduced-motion` respekteras.

**Övningar lyfta från Atomer:** `grundamne-forening` och `fysikalisk-kemisk` fanns i Atomer och hör även hemma här. De är *anpassade med egna påståenden* i Separationsprocessers `ovningsverktyg.html`, med länk tillbaka till Atomer. Ingenting är borttaget i Atomer. Övriga övningar är nya. Samma delade komponent `js/dra-och-slapp.js` används överallt.

**Specialverktyg:** `valj-metod.html` (bygg en plan av metoder i rätt ordning för 14 scenarier), `begrepp-bingo.html` (mall: elektrokemi; markerade rutor är brunorange med ✓, inte grönt), `korsord.html` (`bygg_korsord.py` genererar rutnätet: 20 ord i 19×19; `MAXS`, `MAXLEN`, `SEEDS` styr; fel ruta = mörk orange + ✕), `begreppskort.html` (Tailwind-CDN borttagen och ersatt av `box-sizing`-regel), `laborationer.html` (7 utskrivbara protokoll med röd "Risker"-ruta och lärarnotiser).

**Översättning:** `data/begrepp.<språk>.json` + `data/termer.<språk>.json` för alla 11 språk (am, ar, bs, en, es, fa, pl, ps, rw, so, ur) är **AI-genererade** (en subagent per språk, med områdenas befintliga ordlistor som glossar) och validerade maskinellt (struktur, siffror/enheter, skript) men **ej korrekturlästa av modersmålstalare**. Checklistan är översatt till ar/am/rw (AI-gjort, ej korrekturläst; se "Checklistöversättning"). Kända osäkra termer att låta någon granska: slamning/suspension, fällning/bottenfall, dekantering, indunstning, lacknafta, omvänd osmos; bosniska följer den kroatiskinfluerade befintliga ordlistan (tvar, plin, otopina).

**Testat:** alla sidor vid 1280 och 390 px utan konsolfel; klick på alla 78 klickbara ord i alla 11 språk; alla 14 scenarier i Välj metod och alla 11 sorteringsövningar lösta via klick; axe (WCAG 2.2 AA) utan träffar utom det redan kända "Lyssna-knapp inuti `<summary>`" (delad `lyssna.js`, se WCAG-notering ovan); utskrift till PDF av protokoll, korsord, prov, instuderingsfrågor och facit.

**Kvarstår:** studieguidens lyssna-mp3 (inte inspelade), språkgranskning av checklistöversättningen (ar/am/rw) och övriga språk, klassrumstest av Välj metod och partikelsimulatorn, Jespers kontroll av bilder/text/källor mot hans egna Gleerups-/Enkel kemi-foton. Begreppskort-sidan har kvar den delade mallens engelska "Level 1/2" (även i Atomer); byt till "Nivå" i alla områden samtidigt.

---

## Ämnet kemi – byggt 21 sep 2026 (första kemikapitlet: säkerhet, arbetssätt, egenskaper, historia)

**NAMN OCH STRUKTUR (beslut Jesper 21 sep 2026):** kapitlet hette först "Kemi som ämne" men heter nu **Ämnet kemi** och ÄR ämnessidan för kemi. Mappen och URL:en är oförändrade (`kemi/kemi-som-amne/`, verktyg `tools/kemi-ritverktyg/kemi-som-amne/`; byt inte slug utan att först kunna radera gamla filer på datorn). Den gamla hudsidan `kemi/index.html` är nu en ren vidarebefordran (meta refresh + `location.replace`) till kapitlet, och områdeslänkarna och "Övningar"-rutan där är borta (områdena nås via menyn, faropiktogram och säkerhetsintyg via kapitlet). Menyn har en enda post "Ämnet kemi" (→ `/kemi/kemi-som-amne/`); posten "Övning: faropiktogram" är borttagen. Alla områdens "← Tillbaka till Kemi" pekar fortfarande på `/kemi/index.html` och hamnar därför via omdirigeringen i Ämnet kemi. `kemi/faropiktogram.html` har bakåtlänk till kapitlet. Kapitlets startsida har "← Tillbaka till startsidan". Ämnet fysik och Ämnet biologi är fortfarande vanliga hudsidor med områdeslistor.

Området `kemi/kemi-som-amne/` är kemins första kapitel (Jesper 20–21 sep 2026): varför kemi, hur man lär sig, naturvetenskapligt arbetssätt, kemisäkerhet, faropiktogram och etiketter, laboratorieutrustning, laborationsrapport, ämnens egenskaper (densitet), kemihistoria samt Nobelpris/forskning idag. Alla 13 standardsidor + specialverktyg. Genereras från `tools/kemi-ritverktyg/kemi-som-amne/` (samma pipeline som Separationsprocesser: `python3 bygg_alla.py`; ordning `rita_alla` → `bygg_studieguide` → `bygg_data` → `bygg_sidor` → `bygg_verktyg` → `bygg_lab` → `bygg_tryck` → `bygg_bingo` → `bygg_korsord` → `bygg_index`). **Redigera källorna, inte de genererade filerna.** Områdesfärg indigo (`body.area-amne`, `--area:#4338ca`).

**Källor:** `src/m1_m3.html`, `m4_m6.html`, `m7_m9.html`, `m10.html` (10 milstolpar), `studieguide.css`, `kallor.json` (32 verifierade källor: Skolverket, Dunlosky m.fl., Roediger & Karpicke, Cepeda m.fl., Johnstone, 1177, Giftinformationscentralen, Kemikalieinspektionen, ECHA, Engineering ToolBox, NIST, Britannica, SBL, SHI, Nobelprize.org m.fl.), `data_begrepp.py` (34 begrepp, begreppskort, checklista), `data_fragor.py` (74 instuderingsfrågor, 32 provfrågor med egna tal), `data_ovningar.py` (13 sorteringsövningar; ankare `ov-<id>`: amne-foremal, nivaer, sakerhet, olycka, etikett, utrustning, metodsteg, variabler, observation, flyter-sjunker, egenskap-typ, test-egenskap, historia), `labdata.py` (6 laborationer), `rita_amne.py` (6 SVG: tre nivåer, metodcykel, exempeldiagram, densitet, meniskus, bunsenbrännare; färgblindsäkra).

**Särskilt i detta område:**
- **Faropiktogrammen i studieguiden (M5)** genereras ur `kemi/data/faropiktogram.json` + de officiella SVG-filerna i `images/kemi/faropiktogram/` (`piktogramtabell()` i `bygg_studieguide.py`). **Rita aldrig piktogram själv.** Etikettexemplet är en HTML-mock-up av en *fiktiv* produkt och är märkt så.
- **Påhittade värden är alltid märkta som påhittade** (exempeldiagrammet i M3 och exempelrapporten i M7). Prov- och instuderingsfrågor har egna tal; ingen text eller bild är hämtad från Gleerups/Enkel kemi/TEFY (endast inspiration för vad kapitlet ska innehålla).
- **Kursplanen citeras allmänt** (Skolverkets kursplansida), inga sidnummer eller enskilda formuleringar utöver vad som verifierats.
- **`sakerhetsintyg.html`** (kontrollfrågor med direkt rättning ✓/✕ + utskrivbart intyg som skrivs under; ingen data sparas online) och **`rapportmall.html`** (utskrivbar laborationsrapport) genereras av `bygg_tryck.py`. Säkerhetsintyget länkas från Ämnet Kemi, Fysik och Biologi (Idé 24, punkt 4). Kontrollfrågorna är JS i sidan (`QUIZ` i `bygg_tryck.py`).
- **Laborationer:** `bygg_lab.py` är nu generell (flaggor `planering`, `plan_text`, `graf` i `labdata.py`), inga id-specifika undantag. Resultattabeller ligger i fokuserbar rullruta (`.tbl-scroll`, `tabindex="0"`) så att de klarar axe på smal skärm. Varje laboration ryms på två A4-sidor.
- **Översättning:** `data/begrepp.<språk>.json` och `termer.<språk>.json` för alla 11 språk samt `checklista.ar|am|rw.json` är **AI-genererade och ej korrekturlästa**; validerade maskinellt (`/tmp`-skript: struktur, tal/enheter, skript) och 38 klickbara ord × 11 språk testade. Osäkra termer att låta modersmålstalare granska: makro-/partikel-/symbolnivå, faropiktogram, signalord, H-/P-fras, meniskus, romb, alkemi, kontrollvariabel, tillförlitlighet, föremål (rw: "igikoresho" betyder verktyg).
- **Labbutrustningsspel (byggt 21 sep 2026):** `labbutrustning-spel.html` + `data/labbutrustning.json` (genereras av `bygg_labbspel.py` ur `data_labbutrustning.py`, 33 föremål i fem grupper) med Jespers foton, bearbetade av `bearbeta_labbfoton.py` till `images/kemi/kemi-som-amne/labb/<id>-<n>.jpg` (900 px) och `-t.jpg` (360 px). Mönster: `biologi/ekologi/faglar-tavling.html`, men med två lägen (foto→namn, beskrivning→namn, eller blandat), 10/20/alla frågor, förväxlingsbara distraktorer (`lik` + samma grupp), ✓/✕-symbol + text + heldragen/streckad kant (aldrig bara färg), tangentbord 1–4 + Enter, `aria-live`, ljud på/av, "träna bara på de missade", chips med foto + förklaring. Fotogalleriet i M6 skrivs in i `src/m4_m6.html` mellan markörerna `<!--LABBFOTO-->` av `bygg_labbspel.py` (körs FÖRE `bygg_studieguide.py` i `bygg_alla.py`). **Fotometod:** papperet (vitt A3) plattas ut med "flat-field" (robust polynomanpassning, ingen nedladdning, ingen AI-modell); glas och blank metall behåller alltså sin bakgrund i stället för att friläggas. Undantag: stativ (grått golv, bara beskuret), pipetter (trä, oförändrade), spänningskälla (trä, friläggs med GrabCut). **EXIF/GPS är borttaget** (Jespers originalfoton har GPS-data; publicera aldrig original). Originalfoton finns bara i Jespers Hämtade filer och ligger inte i repot. Nya foton: lägg till rad i `FOTON` (bearbeta_labbfoton.py) och i `FOREMAL` (data_labbutrustning.py), kör `bygg_labbspel.py`. **Osäkra:** glasstav (IMG_8281, kan vara glasrör/gummiskrapa), material i porslinsskeppet, stativ/klämma-namn. Glasskålen heter **Kristallisationsskål** (Jesper 21 sep 2026). Våg (IMG_8294, friläggs med GrabCut) och termometer (IMG_8295, vriden liggande) tillkom 21 sep 2026. Jespers raderade fotonummer (8258, 8259, 8275, 8282) är inte saknade foton.
- **Kemikartan (framsidan för Ämnet kemi, byggd 21 sep 2026, Jespers val: cirkulär framställning; komprimerad och flyttad 21 sep efter Jespers synpunkt):** `bygg_index.py` bygger en cirkulär innehållskarta med **Ämnet kemi** i mitten och de tio milstolparna som numrerade stationer på en ellips (positioner räknas i Python, i procent; ellips 780×600, RX 298/RY 218). Stationerna är en riktig `<ol>` med länkar till `studieguide.html#m1`–`#m10` (samma ordning som studieguiden); **Ingen bana/streck mellan stationerna** (Jesper: "endast siffrorna 1 och framåt") – ordningen bärs av siffrorna. Fyra delar skiljs med kantlinje, aldrig med färg: heldragen = Börja här (1–3), dubbel = Arbeta säkert (4–5), streckad = I labbet (6–8), prickad = Kemi i världen (9–10). Bilder: foton (molekylmodell, bunsenbrännare, våg) och egna linjeikoner (bok, lupp, skyddsglasögon, rapport, timglas, medalj). **Piktogram används bara vid station 5** (2×2: GHS02, 05, 06, 09, officiella SVG:er oförändrade, utan text) – dekorativ användning på andra stationer skulle lära eleven fel association. Storlekar skalar med `cqw` (container query); **kartan ligger i högerkolumnen** bredvid materialkolumnen (grid-areas `main`/`map`/`begr` i `.area-layout` från 960 px; kartan är först i DOM, så ordningen på smal skärm är karta → material → begrepp) så att vänsterkolumnen inte skjuts ned – Jesper reagerade på att den bredare, högre kartan gjorde det; max 780 px bred. Omställningen till lodrät stig (`.hook` visar en kort ledtråd per station) styrs av **kartans egen bredd** (`@container (max-width: 759px)` på `.kemikarta`, inte skärmbredden) och av utskrift; under ca 1290 px skärmbredd blir alltså kartan en stig i kolumnen. Cirkelläget är testat utan överlapp från 770 px kolumnbredd. Tillgänglighet: stationens namn läses som titel + "Milstolpe N av 10, del: …"; fokus = 3 px blå kontur; siffran är `aria-hidden`. Kartan ersatte piktogram-hero-kortet och chip-blocket "Studieguidens milstolpar" ("Viktiga begrepp" och materiallistan finns kvar; faropiktogram nås via station 5 och materiallistan). Mönstret kan återanvändas för andra kapitel om Jesper vill (en STATIONER-lista i bygg_index.py).
- **Testat:** 20 sidor × 1280/375 px utan konsolfel (utom bakgrundsbilden `images/chemistry.jpg` som saknas i molnarbetskopian) och utan sidscroll; axe WCAG 2.2 AA utan träffar utom det redan kända "Lyssna-knapp inuti `<summary>`" (`nested-interactive`, delad `lyssna.js`, samma i alla områden); alla interna länkar/ankare; utskrift till PDF (intyg 2 sidor, rapportmall 3, laborationer 2 per laboration).

**Kvarstår:** Jespers granskning av text/källor/bilder, språkgranskning, lyssna-mp3, klassrumstest. Fler labbfoton vid behov (t.ex. kolvställ, filterpapper, magnet).

---

## Matens kemi – byggt natten 21–22 sep 2026, medan Jesper sov

Jesper la in foton i Hämtade filer som visade sig vara HANS EGNA fotografier av sin bärbara dators skärm med Gleerups digitala bok "Ämnena i maten" kap. 7 – de har **inte öppnats/kopierats/publicerats**, bara nämnda som bakgrund; kapitlet bygger enbart på verifierad allmän kemi-/näringslärekunskap. Jespers uttryckliga önskan (citat): "Gleerups är onödigt utförlig… Fokus måste vara på att eleverna förstår de olika makromolekylerna, stärkelse, cellulosa, fett och protein." Omfånget kalibrerades mot hans EGNA två prov (`Prov - Ämnena i maten ht23.docx`, `251114 Test för åk 8 - kolhydrater-fetter-proteiner.docx`), inte mot Gleerups fulla bredd – alltså INGA vitaminer/mineraler här (de täcks redan av spelet Hästkapplöpning, se nedan) och ingen uttömmande biokemi.

Området `kemi/matens-kemi/` genereras från `tools/kemi-ritverktyg/matens-kemi/` (samma pipeline som övriga kapitel: `python3 bygg_alla.py`, ordning `bygg_maten` → `bygg_studieguide` → `bygg_data` → `bygg_sidor` → `bygg_verktyg` → `bygg_kort_bingo` → `bygg_korsord` → `bygg_lab` → `bygg_index`). **Redigera källorna, inte de genererade filerna.** 15 sidor, 12 milstolpe-nära molekylmodeller, 11 språk (begrepp+termer).

**5 milstolpar i studieguiden** (medvetet kort – Jespers ord: "vi hinner inte alls med så mycket i skolan"): M1 fotosyntes/cellandning (bara ord- och kemiska formler, ingen mekanism – hör till Biologi), M2 kolhydrater (mono-/di-/polysackarider; stärkelse vs cellulosa – båda glukospolymerer men olika bindningstyp, det är den återkommande missuppfattningen i Jespers prov), M3 fetter (glycerol+fettsyror, mättat/omättat = antal dubbelbindningar, energitäthet, härdning), M4 proteiner (aminosyrans struktur, peptidbindning, enzymer, essentiella aminosyror, denaturering vid värme), M5 kort sammanfattning (stärkelse hos växter vs glykogen hos djur) + pekar vidare till Hästkapplöpning för vitaminer/mineraler.

**Molekylmodeller (kärnan i kapitlet):** `tools/kemi-ritverktyg/matens-kemi/bygg_maten.py` använder **RDKit** (ny beroende, `pip install rdkit --break-system-packages`) för 3D-geometrin i stället för handbyggd trigonometri – molekylerna är för stora/komplexa (ringar, kedjor) för `bygg_syror.py`-metoden. 12 modeller: glukos (β-pyranosring), fruktos (öppen kedja), maltos (stärkelsefragment, α-1,4-bindning) och cellobios (cellulosafragment, β-1,4-bindning) – ritade så att kedjan är tydligt **böjd** (stärkelse) resp. **rak** (cellulosa), både i 2D och i 3D-kulmodellen, eftersom det är precis det provfrågorna testar; mättad fettsyra (palmitinsyra) och omättad (oljesyra, cis-dubbelbindningens "knäck" tydligt synlig); glycerol + triglycerid; glycin/alanin/cystein (aminosyror, cystein visar svavel) + en dipeptid (peptidbindningen konkret). Samma monokroma atompalett som `chembuilder.py`. **Dokumenterade förenklingar** (kemin – bindningstyp, funktionella grupper – stämmer, molekylerna är kortade för tydlighet, samma princip som `citronsyra` i syror-och-baser): maltos/cellobios visar bara 2 av de tusentals glukosenheterna i riktig stärkelse/cellulosa; triglyceridens fettsyrekedjor är förkortade. **Lägre säkerhet:** cellobios-SMILES är härledd (inverterat en stereocentrum i en verifierad maltos-SMILES från chemicalbook.com), inte hämtad direkt från en andra oberoende källa.

**Övningsverktyg:** `ovningsverktyg.html` (3 klick-baserade sorteringsövningar: kolhydrat/fett/protein, mättat/omättat, mono-/di-/polysackarid, `dra-och-slapp.js`), `larande-spel.html`, `begrepp-bingo.html` (**enspelarversion** – ingen Cloudflare Worker-synk återskapad här, avviker från mallen i andra områden), `begreppskort.html` (egen enklare implementation, två nivåer), `korsord.html`. `laborationer.html`: två säkra, egenformulerade protokoll (jodtest för stärkelse, fettfläcktest på papper) – egen riskbedömning, ingen "skolan"-referens.

**Översättning:** `data/begrepp.<prefix>.json` + `termer.<prefix>.json` för alla 11 språk klart (AI-genererat, ej korrekturläst, som övriga områden). **`checklista.json` finns ÄNNU BARA på svenska** – ar/am/rw-översättning gjordes INTE i natt, avviker alltså från kemi-som-amne/separationsprocesser tills vidare (se USP-matrisen i `_CHECKLISTA_omraden.md`).

**Testat:** `bygg_alla.py` felfritt end-to-end; Playwright 13 sidor × 1280/390 px, 0 konsolfel (bortsett från ett sajtgemensamt känt `images/chemistry.jpg`-404) och 0 horisontell overflow (två mobilbuggar hittade och fixade: tabellkolumn `white-space:nowrap`, bingots CSS-grid `1fr`→`minmax(0,1fr)`); axe-core 0 nya allvarliga/kritiska (samma kända `nested-interactive`-fel som alla andra studieguider); språkbyte testat på engelska/spanska/arabiska; 3D-visaren verifierad visuellt på alla 12 molekyler. Ingen mänsklig pedagogisk granskning (Jesper sov) – **läs igenom studieguidens 5 milstolpar innan eleverna använder den**, se `tools/kemi-ritverktyg/matens-kemi/OVERLAMNING.md` för full detalj, källor och osäkra punkter.

---

## Hästkapplöpning – nytt lagspel om mineraler och vitaminer, byggt natten 21–22 sep 2026

Realtids-lag-quiz (Jesper: "tänk ut ett nytt lagspel… hästkapplöpning… mineraler och vitaminer") i `spel/hastkapplopning/` + Cloudflare Worker-källkod i `tools/hastkapplopning-worker/`. **Servern är INTE driftsatt** – Jesper sa uttryckligen "vi får fixa med ny worker i morgon", så det återstår som enda steg (`tools/hastkapplopning-worker/README.md`, ca 5 minuter: `npx wrangler login` + `npx wrangler deploy`, klistra in URL:en i `spel/hastkapplopning/js/config.js`). Fram tills dess fungerar **Lokalt läge** (alla enheter i samma webbläsare, `BroadcastChannel`) och **Demoläge** (samma + datorstyrda bottlag) direkt utan konto – bra för Jesper att testa själv först.

**Spelregler** (byggda exakt efter Jespers beskrivning): lag väljer var sitt djur-avatar (10 st: häst, zebra, tiger, elefant, kamel, älg, snigel, kanin, giraff, sköldpadda – egna, originalritade SVG:er, skiljs åt på silhuett+mönster, inte bara färg; CVD-simulerat 0 riskpar). Lärarskärmen (projektor) visar frågan ovanför en kapplöpningsbana, kontroller för nästa fråga (manuellt eller auto), och antal lag som svarat (utan att avslöja vilka). Elevernas egna skärmar visar frågan + 4 svarsalternativ (A/B/C/D, var sin FORM ▲●■◆, inte bara färg) samt eget lag/lagkamrater. Första rätta laget → 3 steg + gnägg, näst snabbaste rätta → 2 steg + gnägg, övriga rätta → 1 steg (hovljud), fel/uteblivet → 0. 3 matcher (Vitaminer / Mineraler / Blandat), 8 ordinarie + 4 reservfrågor vardera, olika frågor per match, prispall efter varje match, mästarpall (summerad matchpoäng 3/2/1) på slutet.

**Arkitektur:** delad, deterministisk spelmotor `js/engine.js` (ingen DOM/nätverk, tid som parameter) återanvänds identiskt i (a) klientens Lokalt/Demo-läge och (b) Workerns Durable Object (`tools/hastkapplopning-worker/bygg_worker.py` bygger en enfils `worker.js` ur samma källa – redigera aldrig `worker.js` för hand). WebSocket Hibernation API (gratisplanens SQLite-baserade DO krävs, `new_sqlite_classes`-migration i `wrangler.toml`), rumstillstånd persisteras vid varje ändring, 8 h auto-radering. Facit skickas ALDRIG till eleven i förväg (läraren skickar det per fråga). Origin-vitlista överst i `worker.js` (byt vid behov). Elever anger bara förnamn/smeknamn, ingen persistens utöver rummets livstid.

**Ljud:** syntetiserade (Web Audio API), analyserade offline (spektrum/varaktighet) men **ALDRIG avlyssnade av en människa** – tryck "Ljudtest" i lärarvyns inställningar före första lektionen.

**Testat:** enhetstester motorn 27/27, integrationstest mot riktig `wrangler dev` 6/6 (CORS/origin, WS-auth, facitläckage-kontroll, rumsgräns, alarm), persistenstest (hård omstart mitt i match) 10/10, E2E Playwright hela 3-matcherspelet både i Lokalt läge och mot riktig Worker 970/970 kontroller vardera, axe-core 23 sidtillstånd 0 överträdelser, egen kontrastmätning 50 färgpar alla ≥4,95:1, tangentbord/reflow 320 px OK. **Osäkert/kvarstår:** själva `wrangler login`/`deploy` mot Jespers Cloudflare-konto är overifierat (allt annat testat mot riktig `workerd`-körtid lokalt); nätverksrättvisa vid skolans riktiga uppkoppling otestad (allt kört lokalt med mikrosekunders latens); fem frågor med lite svagare källor flaggade i `tools/hastkapplopning-worker/OVERLAMNING.md` (bl.a. M3 fråga 4 om kosttillskott, M2 fråga 3 källan bara "Läkartidningen") – läs igenom frågorna i `spel/hastkapplopning/data/mineraler-och-vitaminer.json` innan lektion.

---

## Idéer och påminnelser

### Pedagogisk bakgrund – spel och engagemang
Jesper har identifierat fyra faktorer från spelvärlden som driver starkt engagemang och som bör eftersträvas i webbplatsens aktiviteter:
1. Skapar starka känslor och engagemang
2. Är tydligt målstyrd
3. Skänker grupptillhörighet
4. Man arbetar för något som är större än en själv

Jesper har själv prövat ett projekt där elever skapade sånger, dikter eller berättelser med NO-begrepp, inspirerat av en egen skriven rap. Projektet skapade exceptionellt engagemang (elever vägrade lämna lektionen). Denna typ av kreativa uppdrag bör utforskas vidare.

Nuvarande lärande spel fångar inte alla fyra punkterna – grupptillhörighet och "större syfte" saknas framför allt.

### Bevaka: AI-coaching för elever
När ska AI-coaching kunna användas direkt på sajten? Förutsättningar som behöver vara uppfyllda:
- Tillräcklig hastighet i textsvar för att inte tappa lågmotiverade elever
- Bättre bildgenerering som ger korrekta diagram och formler
- Kommunen/skolhuvudmännen ger grönt ljus
- Kombinationsmöjlighet med bild, film och interaktivitet

Bevaka Anthropics modellreleaser och pedagogiska AI-projekt för tecken på att dessa trösklar passerats.

### Presentation hösten 2026 – Jespers arbete med AI och sajten
Jesper ska göra en PowerPoint under sommaren 2026 och presentera i höst om sitt arbete med Claude. Möjliga teman att lyfta:
- Hur AI användes som verktyg för att bygga ut en pedagogisk NO-sajt
- Effektiviteten: vad som tidigare tog dagar tar nu minuter
- Pedagogiska reflektioner: variationsprincipen, spelbaserat lärande, AI-coaching
- Etiska frågor: upphovsrätt, originalitet, kommunens restriktioner
- Framtidsperspektiv: när AI-coaching kan bli möjlig direkt på sajten
- Konkreta exempel: studieguider, begreppspopups, lyssna-funktion, instuderingsfrågor

### Idé 1 – Läxbank per område
Strukturerade läxor kopplade till checklistan, med progression: Läxa 1, Läxa 2 osv. Varje läxa är ett kort uppdrag: lär dig dessa begrepp, gör den här övningen, titta på den här filmen. Ska göras tillsammans med Jesper.

### Idé 2 – Laborationsbank (kemi-hudsidan)
En laborationsbank på kemi-hudsidan med:
- Beskrivningssida per laboration: lärandesyfte, koppling till kursplan
- Länk till laborationsbeskrivning
- Kategori: demonstration, "luktsalt" (väcker nyfikenhet vid nytt område) eller elevlaboration
Jesper har lärarhandledningar med laborationer som ska gås igenom och karakteriseras efter lärandemål och lämplig form. Ska göras tillsammans med Jesper.

### Idé 3 – Powerpoints till lärare
Färdiga presentationer per område som lärare kan använda direkt i undervisningen. Ska göras tillsammans med Jesper.

### Idé 4 – Områdesplanering till lärare
En strukturerad lektionsplanering per område: mål, progression, förslag på lektionsupplägg. Ska göras tillsammans med Jesper.

### Idé 5 – Bra länkar till lärare
Kurerade länksamlingar per område – filmer, simuleringar, externa resurser. Ska göras tillsammans med Jesper.

**Kandidatkällor för filmankare (att utvärdera).** Källor att vaska igenom när vi fyller ankaren med film, enligt principen om språkberoende filmruta (se `pedagogik.md` punkt 6):

- **Amoeba Sisters** (YouTube) – korta tecknade engelska biologi-/genetikanimationer, uppskattade av elever, fungerar bra med YouTube:s auto-textning/auto-dubbning. **Jesper ska titta igenom dem och välja ut vilka vi behåller** per milstolpe.
- **Khan Academy** – fritt, ~50 språk, har genetikinnehåll (ännu inte använt av Jesper).
- **PhET** – fria simuleringar, 90+ språk (Jesper använder redan).
- **Studi.se** – svensk källa, namnges (kräver skolinloggning); endast svenskt språkspår.
- **Egna filmer** – starkast av alla eftersom de är språkoberoende, fria och personliga.

**Påminnelse – filmen *Ett encelligt djurs dramatiska död* (Jespers egen):** hör till området **Vad är liv?**, inte genetik (även om filen ligger i `Desktop/Genetik`). Filmen (mp4) + en nedladdad text (*"Ett eukaryot encelligt djurs dramatiska död 400 x – Google Dokument"*) finns i `Desktop/Genetik`. Innehåll: encelligt eukaryot djur överhettas, tappar vattenbalansen, äter en bakterie ("cellens sista måltid", 35 s in), sväller och dör 2.26 min in när membranet brister. Bär: cellmembran, osmoreglering, storlek bakterie vs eukaryot, mitokondriernas endosymbios. Ska in som ankare i **Vad är liv?** när vi bygger det området.

### Idé 6 – Fördjupningsmaterial på gymnasienivå
Fördjupningssektion för elever som vill gå vidare mot gymnasienivå. Exempel för kemi: molräkning, balansering av kemiska formler, elektrokemisk cell-potentialberäkning. Ska göras tillsammans med Jesper.

### Idé 7 – Nationella provuppgifter per område
Gamla släppta nationella prov fördelade på respektive område (t.ex. elektrokemi-uppgifter direkt på elektrokemi-sidan). Även samlad övning per NO-ämne på hudsidan. Ska göras tillsammans med Jesper.

### Idé 8 – Språkstöd för de vanligaste invandrarspråken
Studieguiden och begreppen översatta/tillgängliga på de vanligaste invandrarspråken i Sverige (arabiska, somaliska, dari/persiska m.fl.). Ska utredas hur det tekniskt löses bäst.

### Idé 9 – Miniminivå-indikator per område ("Vad behöver jag för E?")
En tydlig funktion eller sektion som visar exakt vad eleven minst behöver kunna för betyget E på ett givet avsnitt. Kopplat till checklistan och studieguiden. Ska göras tillsammans med Jesper.

### Idé 10 – Pedagogiska tips från forskningen
"Punchlines" från pedagogisk forskning för lärare – gärna specifikt för NO-undervisning. Kortfattade, konkreta tips baserade på forskning om inlärning. Ska göras tillsammans med Jesper.

### Idé 11 – Screening av andra läromedel och NO-sajter
Genomgång av konkurrerande läromedel och nätsidor för NO för att identifiera vad sajten saknar eller kan göra bättre. Ska göras tillsammans med Jesper.

### Idé 12 – Filmer för flipped classroom
Jesper funderar på att spela in egna filmer per område som kan användas som läxor (flipped classroom). Filmerna länkas från läxbanken. Ska göras tillsammans med Jesper.

### Idé 13 – Kort lärarhandledning per område
En kortfattad handledning per område som lyfter fram: vilka övningar som finns, hur de används, förslag på lektionsupplägg. Ska göras tillsammans med Jesper.

### Idé 14 – Övningsbank (huvud-sidorna)
En övningsbank i samma stil som laborationsbanken, liggande på kemi-, fysik- och biologihudsidorna. Kategoriserade övningar per ämne och nivå. Ska göras tillsammans med Jesper.

### Idé 15 – Tankekarta per område
En visuell tankekarta som ger eleverna en överblick över allt som ingår i ett område innan studierna börjar. Kan vara interaktiv (klickbar) eller statisk. Ska göras tillsammans med Jesper.

### Idé 16 – Övningar i genteknik byggda på kodontabellen
Den klickbara genetiska kodtabellen finns nu som återanvändbar komponent (`/js/kodontabell.js`, monteras via `<div class="kodontabell-mount"></div>`). Komponenten exponerar `window.Kodontabell.CODE` och `.AA` så att övningar kan återanvända datan. När vi går igenom gentekniken tillsammans ska vi bygga interaktiva övningar på denna grund:

- **Översätt mRNA→protein:** eleven får en mRNA-sekvens (t.ex. AUG-UUU-CAU-UAA) och skriver proteinet; automaträttning mot facit.
- **Omvänd uppslagning:** "vilka kodon kan ge Leucin?" – tränar att läsa tabellen baklänges och förstå att flera kodon ger samma aminosyra.
- **Mutationsövning (kopplad till CRISPR/mutationer):** byt en bas i en sekvens och se effekten – tyst mutation (samma aminosyra), missense (ny aminosyra) eller nonsens (stoppkodon). Knyter an till m7 (mutationer) och m11 (genteknik).

Övningarna ska göras tillsammans med Jesper. Överväg samtidigt att länka kodontabellen från m11 (genteknik) och från övningsbanken.

### Idé 17 – Helhetsbild "från kromosom till baspar" (genetik)
En egen översiktsbild som binder samman den **strukturella** kedjan: cell → kromosom → DNA-dubbelhelix → baspar (A–T, G–C) → gen. Idén kom från "A Closer Look"-rutan på Human Genome Landmarks-postern, som visar just den helheten och brukar få polletten att trilla ner.

**Viktig avvägning (Jespers observation):** försök INTE tvinga in hela kedjan ända till protein i en enda bild. "A Closer Look" hoppar själv över mRNA och ribosomens proteinsyntes – och den delen har vi redan starka egna bilder för (`dna-mrna-protein.svg` och `ribosom.svg`). Låt alltså helhetsbilden fokusera på det strukturella (kromosom → DNA → baspar → gen) och låt proteinsyntesen ligga kvar i sina egna bilder. Ev. kan de två länkas visuellt med en liten "fortsättning: se proteinsyntesen".

- Återanvänd stilen/innehållet från `images/biologi/genetik/begreppshierarki.svg` (cell → kromosom → DNA → gen → baspar).
- Resultatet ska vara helt egenritat (fritt att publicera) och kunna ligga som en sammanfattande bild i studieguiden och/eller på startsidan.

### Idé 18 – Human Genome Landmarks-postern i Lektioner
Postern finns inlagd som krediterad fördjupning i studieguidens M2 (`images/biologi/genetik/genome-landmarks-poster.jpg` + `.pdf`). När vi bygger **Lektioner** ska den även knytas in där – t.ex. som "utforska din egen kromosom"-uppgift eller som koppling mellan gener och sjukdomar i en genteknik-lektion. Källa måste alltid anges: U.S. Department of Energy Genomic Science program, genomicscience.energy.gov.

### Idé 19 – Övning: hela kedjan DNA → mRNA → protein → funktion (M5) — BESLUTAD, SKA BYGGAS
Ankarövning till M5 (proteinsyntesen), tänkt att läraren först visar en film om proteinsyntes och sedan låter eleven göra övningen. Bygger på den klickbara kodontabellen (`/js/kodontabell.js`, se Idé 16). Eleven arbetar sig genom hela informationsflödet i fyra steg:

1. Eleven får en **DNA-mall-sträng** och skriver ned den **komplementära DNA-strängen** (A–T, G–C).
2. Utifrån den skriver eleven **mRNA-sekvensen** (T → U vid transkription).
3. Eleven **läser i kodontabellen** kodon för kodon och översätter mRNA → **aminosyrasekvens (protein)**.
4. Eleven **jämför sitt resultat med tre olika proteiner** (olika sekvens och olika funktion) och avgör **vilket protein** som byggts.

Poängen är att knyta ihop hela kedjan – från DNA via komplementaritet och transkription till translation – och avsluta med koppling till **funktion** (protein → uppgift i kroppen). Automaträttning i varje steg så att ett fel inte fortplantar sig osynligt. Ska göras tillsammans med Jesper.

### Idé 20 – Övning: upptäck mutationen (M7) — SKA BYGGAS
Upptäckarövning till M7 (mutationer), byggd på kodontabellen (Idé 16). Eleven får en kort bit av en **frisk gen** och en **muterad** variant av samma gen – cirka 7–10 tripletter vardera – och ska **själv lista ut var mutationen skett och vad den orsakat** (vilken aminosyraförändring, eller en frameshift). Först upptäckt, sedan genomgång.

Tanken är att täcka de olika mutationstyperna, var och en **kopplad till en känd sjukdom eller funktionsförlust** så att det känns konkret:

- **Punktmutation / missense** – en bas byts, en aminosyra ändras.
- **Tyst mutation** – en bas byts men aminosyran är densamma (visar kodens redundans).
- **Deletion / frameshift** – en bas (eller några) försvinner och hela läsramen förskjuts.

**Engagerande ankarexempel – färgblindhet:** "Här är en gen som sitter på X-kromosomen. Jämför den med samma gen hos en röd-grön färgblind person. Förklara vad som har hänt." Eleven jämför sekvenserna och beskriver förändringen; läraren går sedan igenom och sätter namn på den ("det här kallas en deletion"). Knyter ihop M7 (mutationer) med M8 (könsbundet arv/färgblindhet).

Automaträttning där det går; annars elevens egen förklaring + lärarens genomgång. Ska göras tillsammans med Jesper.

### Idé 21 – Övning: lägg kartan (områdesöversikt) — SKA BYGGAS
Bygger på **tankekartan/områdesöversikten** (jfr Idé 15 – "Tankekarta per område"; bekräfta med Jesper exakt vilken översikt som menas). Tänkt arbetsgång: läraren går först igenom översikten via projektorn, sedan ska eleverna **återskapa kartan i en digital övning**.

Övningen innehåller två sorters kort som ska placeras på rätt plats:
- **Kort med översiktens delar** (det som finns i kartan).
- **Kort med korta förklaringar** till var och en av delarna.

Eleven drar/placerar korten rätt. **Målet:** lära sig **ordningen på skeendena** och få en första överblick *innan* allt gås igenom grundligt senare. Låg tröskel, överblick före djup. Ska göras tillsammans med Jesper.

**Status:** en klickbar tankekarta finns nu (`biologi/genetik/tankekarta.html`) – de 11 milstolparna grupperade i fem teman, varje ruta länkar till rätt avsnitt i studieguiden. Ren som standard, med en **väljare** ("Visa var i studieguiden") som lägger på M1–M11-etiketter. Återstår: själva drag-och-placera-övningen, samt **att återkomma till samma bild i ett repetitionsavsnitt i slutet** där M-etiketterna är inskrivna fast (Jespers idé). Kartan behöver också länkas in från index/studieguiden.

### Idé 22 – M1: lärarmaterial + cellorgan-namnövning — SKA BYGGAS
**Till läraren (M1), bilder som Jesper tar:**
- Mikroskopbilder på olika celltyper: neuron, kindepitelcell, levercell.
- Översiktsbilder över växtcell, djurcell och bakteriecell med pilar och namn på cellorganellerna.

**Digital repetitionsövning – cellorganeller:** eleven skriver in rätt namn på rätt plats (på en cellbild). Gärna som **tävling på tid** (Seterra-stil). Den här typen av enkel namnövning är uppskattad just för att alla känner att de klarar den – en bra start för ett område med många namn. Har gjorts första gången i området **Vad är liv?** – återanvänd det greppet. Ska göras tillsammans med Jesper.

### Idé 23 – M6: lärarmaterial + mitos/meios-bilder + fasidentifiering — SKA BYGGAS
**Till läraren (M6, mitos):**
- **Laborationsprotokoll** för dem som vill göra egna rotspetspreparat.
- **Mikroskopbilder** (Jesper tar) på färdiga lök-rotspetspreparat, för dem som saknar mikroskop. Bilderna används också för en **övning där eleven identifierar tydliga faser i mitosen**.

**Bilder i M6-texten (ordningsföljd för läraren att gå igenom innan mikroskopet):**
1. En **enkel ritad bild** av mitos resp. meios – vad de leder till, utan alla delsteg i detalj. *Ska ligga i M6-texten.*
2. En **detaljerad bild** med alla faser.

Den detaljerade fasbilden kan även bli en **digital träningsövning**, kopplad till en **andra fördjupning i M6** (finns inte ännu – behöver skapas). Ska göras tillsammans med Jesper.

### Idé 24 – Kemi-hudsidan: uppstart, kemihistoria, faropiktogram, labbutrustning, säkerhetsintyg — DELVIS BYGGD (punkt 1 och 4 lyfta till kapitlet Ämnet kemi 21 sep 2026; punkt 2 och 3 klara; `kemi/index.html` är sedan 21 sep 2026 en vidarebefordran till kapitlet Ämnet kemi)
Jesper vill att `kemi/index.html` (ämnessidan Kemi) **inte längre bara är en sida med länkar till områdena** (områdeslänkarna kan tas bort; områdena nås redan via menyn). I stället ska sidan innehålla:

1. **Uppstart och lite kemihistoria** – en kort introduktion till ämnet.
2. **Övning 1: Faropiktogram** – samma spelidé/design som fågeltävlingen (`biologi/ekologi/faglar-tavling.html`, `larande-spel.html`, `data/faglar.json`): bild + val/namngivning, tid och poäng. **KLART 20 sep 2026** (Jesper: faropiktogram är standardsymboler, inga foton behövs): `kemi/faropiktogram.html` + `kemi/data/faropiktogram.json` + nio SVG i `images/kemi/faropiktogram/` – **OFFICIELLA symboler** (fria SVG-filer ur npm-paketet `@ghs-hazard-pictograms/assets`, MIT; filnamnen motsvarar Wikimedia Commons-serien `GHS-pictogram-*.svg`; licens: Jesper kontrollerade 21 sep 2026 på Commons – filen är "ineligible for copyright" = public domain (ingen egen skapandenivå); kontrollerad fil: minst en av serien, övriga åtta tillhör samma serie. **Jesper 21 sep 2026: piktogram måste vara exakt rätt – rita dem ALDRIG själv** (mina första, egenritade versioner ersattes; `tools/kemi-ritverktyg/faropiktogram/rita.py` är nu en stubb som vägrar köra och kan tas bort). Varje piktogram länkar till sin film i UR Play-serien "Vi förklarar kemi" (`film` i JSON; tillgänglig till 15 dec 2027). Två lägen: (1) bild → välj namn (9 frågor), (2) varning i text → välj rätt piktogram bland fyra bilder (18 frågor). Ovalerna på startsidan öppnar en ruta med bild, betydelse, exempel och "Så gör du"; samma ruta öppnas med "Läs om piktogrammet" efter varje svar. Rätt/fel visas med ✓/✕ + heldragen/streckad ram (aldrig bara färg). Länkad från `kemi/index.html` (ruta "Övningar") och menyn. Namn enligt Kemikalieinspektionen/Arbetsmiljöverket: Explosiv, Brandfarlig, Oxiderande, Gas under tryck, Frätande, Akut giftig, Skadlig (utropstecken), Allvarlig hälsofara, Miljöfarlig. Källor står på sidan. Giftinformationscentralens nummer (010-456 6700; 112 vid akut) är kontrollerat mot giftinformation.se. **Kvar att granska av Jesper:** exemplen per piktogram (t.ex. metanol i spolarvätska, lacknafta) och att bilderna stämmer mot Enkel NO/riktiga etiketter.
3. **Övning 2: Laboratorieutrustning** – samma spelidé; **Jesper tar foton** på utrustningen så fort han hinner. **KLART 21 sep 2026:** `kemi/kemi-som-amne/labbutrustning-spel.html` (33 föremål, se avsnittet Ämnet kemi ovan); länkad från kemi/index, larande-spel, studieguidens M6 och index.
4. **Säkerhetsintyg: säkerhetsbeteende och föreskrifter för att få laborera** – en övning eleven gör (läser reglerna, svarar på kontrollfrågor) och som **till slut skrivs ut och skrivs under av eleven**. Gäller alla NO-ämnen men är viktigast i kemi. **Bara en sida** (lämpligen på kemi-sidan) som **länkas från Ämnet Fysik och Ämnet Biologi**; den behöver bara skrivas ut en gång per elev. Följ utskriftsstandarden (egen utskriftsvy, inget sparas online) och ingen hänvisning till "skolan" (se stående regel). Faktakällor för faro- och labbregler ska anges i en källförteckning.

**Uppdatering 21 sep 2026:** Jesper beslutade att uppstart, kemisäkerhet, hur man lägger upp en undersökning, laborationsrapport, ämnens egenskaper, laboratorieutrustning och kemihistoria hör hemma i ett eget första kapitel, **Ämnet kemi** (`kemi/kemi-som-amne/`, se ovan) i stället för på hudsidan. Punkt 1 (uppstart + kemihistoria) täcks där (M1, M9–M10) och punkt 4 (säkerhetsintyg) är byggd som `sakerhetsintyg.html` med kontrollfrågor och utskrift, länkad från kemi-, fysik- och biologisidorna. Punkt 3 (labbutrustningsspel med Jespers foton) byggs efter kapitlet. `kemi/index.html` har fått en länk till kapitlet; själva hudsidan är i övrigt oförändrad.

Ursprungligt: Ska göras tillsammans med Jesper. Väntar på hans foton för punkt 2 och 3 (punkt 1 och 4 kan byggas utan foton).
