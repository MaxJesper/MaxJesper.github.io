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

**Teknisk lärdom (natten 23–24 sep 2026):** `device_commit_files` kan svara "written" utan att filen faktiskt uppdateras på disk (sett en gång på en textfil, `CLAUDE.md` – md5 stämde inte efter en snabb andra skrivning till samma `stagedPath`-mönster; fixades genom att skriva om från en NY `stagedPath` och köra igen). Lita alltså inte bara på verktygets svar – kontrollera ALLTID md5 med `device_bash` efter en commit, särskilt om flera skrivningar till samma fil sker i snabb följd, och skriv om (gärna med ny `stagedPath`) om md5 inte stämmer.

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
- **Kartläggning 23 sep 2026 (Jespers uppdrag "bred marginal överallt"):** av 15 studieguider har 6 redan layouten (atomer, kemi-som-amne, kol-och-kolföreningar, matens-kemi, separationsprocesser, syror-och-baser). 9 saknar den – och alla 9 saknar OCKSÅ ett byggskript (`tools/kemi-ritverktyg/` har bara skript för atomer/kemi-som-amne/matens-kemi/separationsprocesser/syror-och-baser): `biologi/genetik`, `biologi/liv-och-cellen`, `fysik/arbete-energi-effekt`, `fysik/elektricitet`, `fysik/kraft-och-rörelse`, `fysik/magnetism-induktion`, `fysik/universum`, `kemi/elektrokemi`, `kemi/periodiska-systemet` – handredigering av 20–75 KB HTML per område, ingen "bygg om"-säkerhet. **Undantag:** `fysik/elektricitet` är bara ett oskrivet skelett (`class="milestone stub"`, platshållartext i alla 12 milstolpar) – inte en kandidat för marginal/bildarbete förrän texten är skriven.
- **Pilot på en handskriven, icke-kemi-sida (23 sep 2026): `biologi/liv-och-cellen`.** Aktiverad (`studieguide-bildkolumn.css` + `guide-wide` + egna `--guide-accent`-variabler i grönt, `#0b7a5c`/`#eafaf4`/`#b6ead9`). Bara milstolpe 4 (som redan hade ett foto + två filmer) fick sina rader omgjorda till `m-row`/`m-lead`/`m-side` – de andra fem milstolparna saknar ännu bilder och lämnades i normalbredd (`m-row--plain` inte tillagt i onödan, se ovan "sidor med få bilder behåller normalbredd"). Se separat bildförslags-checklista (Claude Docs) för vilka nya bilder som föreslås till de fem tomma milstolparna. Testat: Playwright 1280/390 px, axe-core 0 NYA överträdelser (samma kända `nested-interactive` + en redan befintlig `link-in-text-block` i källförteckningen/M3, ingen av dem orsakad av denna ändring).

### STÅENDE REGEL – bildinnehåll: inga AI-genererade illustrationer/ikoner utan uttryckligt godkännande i förväg (23 sep 2026)

Jesper, om mitt förslag på en ikonrad (kollagevärde, se checklistan för liv-och-cellen M2): **"Inga ikoner, eller jag måste i så fall godkänna innan de görs! Vissa elever reagerar direkt negativt på det då AI ofta gör ikoner, så de kan tänka, aha, ingen människa har gått igenom detta, det kan vara fel/irrelevant eller så blir de känslomässigt låsta då många är oroliga inför AI-utvecklingen i framtiden."** Gäller alla nya bildidéer på hela plattformen, inte bara detta område: en synbart AI-genererad illustration/ikon (stil som avslöjar att den är AI-gjord) får ALDRIG läggas in utan att Jesper sett och godkänt den specifika bilden först – han vill inte bara godkänna idén/beskrivningen, utan den faktiska bilden. Skiljer sig från de kod-genererade, exakta diagrammen (molekylmodeller, mitokondrie-/kloroplaststruktur m.m., se nedan) som byggs med skript efter verklig fakta – de är inte vad Jesper syftar på här, men ritstilen ska ändå vara saklig/schematisk, inte "AI-look".

### Bildförslag som väntar på Jespers egna foton (23 sep 2026, liv-och-cellen)

Mönster när en bild kräver ett foto Jesper själv måste ta (mikroskop, egna preparat) eller redan har: bygg en tom `.side-fig--placeholder`-ruta (streckad kant, diagonalt randmönster, samma visuella språk som `fysik/elektricitet`s `.image-placeholder`) med en PRELIMINÄR bildtext/etikett på plats i studieguiden nu (så vi minns var bilden ska sitta), och vänta med själva `<img>`-källan tills Jesper skickat filen. **Byggt (23 sep 2026) i `biologi/liv-och-cellen/studieguide.html`, verifierat med Playwright+axe (0 nya överträdelser) – väntar bara på de riktiga fotona, inte på mer kod:**
- **M4, Laboration 1:** platshållare för kindcellsfoto (egen, färgad – cellmembran/cytoplasma/cellkärna utpekade), i en ny `m-row` med `m-side`.
- **M4, ny sektion "Den befruktade äggcellens första delningar"** (ersätter lökens rotspets som bildidé – roten är kvar som laboration, men mitosfas-bilderna dit hör i stället flyttas till genetikavsnittet, se nedan): ny text + fyra platshållare (1/2/4/8 celler) i en `m-row--full` + `.fig-row` (fullbredd, inte bara marginalen – samma mönster ska användas för bakterie/virus-kollaget i M5 när det byggs). Pedagogisk poäng skriven i texten: cellerna blir mindre för varje delning eftersom delningen går snabbare än cellerna hinner bygga nytt cellmaterial.
- **M6:** ny `m-row` med två staplade platshållare i `m-side` – porträtt av Linné (väntar på Claudes bildresearch, se nedan) och foto från Linnés födelsehem Råshult (väntar på Jespers eget foto).
Lökens rotspets (celldelning, olika mitosfaser: anafas m.m.) hör i stället hemma i **`biologi/genetik`** när det området får sin bildkolumn – flaggat för framtida arbete, inte bytt ännu.

### Uppföljning 23 sep 2026 – bildernas estetik, och vem som ritar vad

Jesper om de fem tecknade utkasten (mitokondrie, kloroplast, cell→vävnad→organ, häst+åsna=mula, storleksskala virus–bakterie–cell): **"Bilderna är inte jättebra... Vi får jobba med bilderna om vi ska ha dem så att de blir lite mer estetiskt tilltalande också, inte bara funktionella, människor är känsliga för det som är fult. Om det skulle vara så att chatgpt är bättre än du på bilder nu, så är det bättre att du gör annat, det finns ju mängder av arbetsuppgifter."** Tylakoidmembranen i kloroplast-bilden lyftes som det som faktiskt var bra, men för litet återgivet. Bedömning: bildgenereringsmodeller (ChatGPT m.fl.) slår sannolikt Claudes hand-kodade SVG på ren estetik/konstnärlighet för organisk-formade illustrationer (organeller, djur); SVG-metoden passar bättre för rent schematisk/informativ grafik (t.ex. storleksskalan, som är mer diagram än illustration). **Beslut väntar fortfarande på Jespers svar per bild** (vilka ska göras om via bildgenerator, vilka (om några) är okej som schematisk grafik). Utkasten ligger kvar, oanvända, i `images/biologi/liv-och-cellen/diagram/` – INTE inkopplade i studieguiden. Tills vidare: Claude lägger inte mer tid på att försöka polera dessa specifika bilder estetiskt, och arbetar med annat under tiden.

**Uppdatering 24 sep 2026:** häst+åsna=mula-utkastet (`Downloads/4-hast-asna-mula.png`) har samma sakfel som texten hade innan dagens rättelse – bildtexten säger "Mula: ... (kan inte få egna ungar)", vilket är för kategoriskt (jämför M6-rättelsen i `biologi/liv-och-cellen/studieguide.html`: mulor är NÄSTAN ALLTID sterila, inte utan undantag). Bilden är fortfarande oanvänd/oinkopplad, så inget akut att göra – men om den bilden någon gång ritas om (Claude eller ChatGPT) ska bildtexten skrivas om till "nästan alltid sterila" och INTE "kan inte få egna ungar".

**Uppdatering samma dag – första ChatGPT-bilden godkänd och inkopplad (M3, liv-och-cellen):** Jesper skapade själv en märkt djurcell/växtcell-bild med ChatGPT (`Downloads/ChatGPT Image 23 sep. 2026 22_18…png`) för jämförelse. Claude flaggade två sakfel (vakuol felaktigt "endast växtcell" – djurceller kan ha små vakuoler; lysosom felaktigt "i båda" – växtceller saknar oftast tydliga lysosomer och sköter det via vakuolen), Jesper lät ChatGPT rätta bilden (`…22_48_01.png`), och den nya versionen stämmer. **Bilden är nu inkopplad i M3** (`biologi/liv-och-cellen/studieguide.html`), som en `m-row--full` direkt efter organell-paragraferna och före `.compare-table`. Mönster värt att återanvända för framtida ChatGPT-bilder med inbränd förklarande text:
- Bilden beskärs (Pillow) så att bara själva illustrationen (de två cellerna + numrerade cirklar) är kvar – textrutorna med sifferförklaringar längst ner klipps bort.
- Sifferförklaringarna skrivs av för hand som RIKTIG HTML-text i en ny liten komponent, `.organelle-legend`/`.ol-item` (skalbar textstorlek, läsbar för skärmläsare) – INTE kvar som inbränd bildtext, av samma skäl som WCAG-regeln redan kräver på hela plattformen (kontrast, storlek, ingen mening som bara går att förstå via en bild). Detta gjordes proaktivt av Claude, INTE på uttrycklig begäran denna gång – Jesper ifrågasatte det ("Varför skrev du om bildtexten?"), fick förklaringen, och godkände upplägget i efterhand.
- Färgerna i `.ol-item`/`.ol-num` matchar den ORIGINALA bildens ljusblå rutor (`#eaf4fa`/`#bfe0ef`/ring `#1f6f96`) i stället för kapitlets gröna `--guide-accent`-tema, efter Jespers uttryckliga önskan ("kan du behålla färgerna utan att bryta mot WCAG?") – kontrastkontrollerat (rubrik 15:1, brödtext 7,7:1, ring 5,6:1 mot vitt, alla ≥ 4.5:1). Bilden själv sparad som `images/biologi/liv-och-cellen/djur-vaxtcell-organeller.jpg` (beskuren, ~350 KB).
- Alt-text beskriver bara VAD bilden visar ("Genomskuren djurcell och växtcell sida vid sida, med elva numrerade organeller markerade i varje cell") – detaljerna finns i den riktiga legend-texten intill, inte i alt-attributet.
Testat: Playwright 1280 px + 390 px (mobil, en kolumn), axe-core 0 NYA överträdelser.

### Ny rutin (23 sep 2026, kväll) – vetenskaplig bildgranskning skild från teknisk filmetadata

Jesper frågade ChatGPT om AI-genererade bildfiler behöver innehålla teknisk metadata om vilket verktyg/arbetsflöde som skapat dem. ChatGPTs svar (relaterat av Jesper) – vi är överens om upplägget:

- Vetenskaplig spårbarhet och teknisk filmetadata är två skilda saker. Bildfilen (PNG/WebP/JPG) behöver INTE bära metadata om vilket AI-system som skapat den – Claude fortsätter som vanligt optimera/exportera/rensa bildfiler tekniskt (filformat, storlek, WCAG, responsiv presentation).
- Den vetenskapliga granskningen redovisas i stället öppet i TEXT bredvid bilden eller i källförteckningen: en kort "Vetenskaplig bildgranskning"-notering som säger vad bilden är en pedagogisk förenkling av (t.ex. "återger inte organellernas relativa storlek, antal eller exakta placering") och att det biologiska innehållet är kontrollerat mot angivna källor. Starkare än att bara påstå att en bild är "vetenskapligt korrekt", eftersom förenklingarna anges öppet.
- Rutin framåt: innan Jesper (med ChatGPT eller annat bildverktyg) lämnar en bild som "färdig" gör han en bildfaktagranskning och anger vid behov vilka källor granskningen bygger på. Claude lägger sedan till en kort granskningsnotering i studieguidens källförteckning (eller direkt vid bilden), i samma stil som övriga källor, varje gång en AI-genererad illustration används. Ett tillägg till, inte en ersättning för, den sakfelskontroll Claude redan gjorde för djur-/växtcellsbilden i M3 (se ovan) – skillnaden är att granskningsresultatet nu ska synas i sidans text, inte bara i chatten.
- Ännu inte tillämpat i praktiken (ingen ny bild har lagts in sedan detta beslutades 23 sep kväll) – gäller nästa gång en AI-genererad illustration ska in i en studieguide.

### STÅENDE REGEL (24 sep 2026) – webbsökning som en del av bildgranskningen för komplexa bilder

Jesper: "Finns det ingen möjlighet för dig att lägga in bildjämförelser, dvs. att du går ut på nätet och söker på motsvarande bilder för att få en hint om vad som kan ha gått fel i en bild, eller ännu hellre innan du gör en bild och har planen för den... Om detta är möjligt för dig så är det viktigare än att det spar några sekunder att inte göra den kontrollen. Är det möjligt vill jag ha det som regel för bildskapande som är komplext."

**Regel:** för alla bilder som räknas som "komplexa" (anatomiska bilder med flera namngivna delar – hjärta, öga, öra, neuron, matspjälkningskanal, cellstrukturer m.m.; INTE enkla/symboliska bilder som kännetecken-collaget) ska Claude göra en webbsökning (WebSearch/WebFetch mot t.ex. NE, review-artiklar eller välkällad Wikipedia) i två steg:
1. **Innan bildspecen skrivs:** slå upp korrekt antal/ordning/namn på delarna (t.ex. hjärtats fyra kammare och klaffar, örats delar i rätt ordning) och skriv in det i prompten/planen som skickas till Jesper/ChatGPT – för att minska risken för fel redan i första försöket.
2. **Efter att bilden kommit tillbaka:** slå upp samma fakta igen (färskt, inte bara ur minnet) och jämför uttryckligen mot det bilden visar, precis som gjordes för djur-/växtcellsbilden (vakuol/lysosom) och för mula/liger-sterilitetstexten.

**Viktig begränsning att vara ärlig om:** detta är EN FAKTAKONTROLL av strukturen (antal delar, namn, ordning, vanliga AI-bildfel) mot en textkälla – INTE en bildbaserad omvänd bildsökning eller pixeljämförelse mot en referensbild. Claude kan inte "se" en bild och söka fram visuellt liknande bilder på nätet för jämförelse; det som går att göra är att slå upp och läsa auktoritativa beskrivningar och jämföra dem mot det Claude ser i den faktiska bilden (som Claude läser direkt med sina bildverktyg). Detta ska ändå fånga de vanligaste felen (fel antal, fel placering, sammanblandade delar), vilket var poängen.

**Uppföljning samma dag:** Jesper har gett ChatGPT en motsvarande stående instruktion på sin sida – att ChatGPT själv, redan i PLANERINGSSTADIET innan den skapar en bild, ska jämföra sin plan mot existerande bilder på nätet för att leta fel i förväg (inte bara vid granskning efteråt). ChatGPT bedömer att detta minskar felrisken betydligt, men påpekar samtidigt (rimligt) att det för en högstadieläromedelsbild alltid finns en avvägning mellan vad som är pedagogiskt bäst och vad som är bildmässigt mest verklighetstroget – en bild ska inte offra det pedagogiska syftet bara för att bli mer "korrekt" i detalj. Referens att spara, angiven av Jesper: Nature (2023), *"Scientific illustration: striking the balance between creativity and accuracy"*, PMID 37978277, <a href="https://www.nature.com/articles/d41586-023-03391-x" target="_blank" rel="noopener">nature.com/articles/d41586-023-03391-x</a> (fullständig text ej läst av Claude – WebFetch var tillfälligt blockerat av org:ets utgiftsgräns denna kväll, återställs 27 sep; titel/källa bekräftad via sökning).

**USP-status:** "vetenskapligt granskade bilder" är nu en egen rad i USP-matrisen i `_CHECKLISTA_omraden.md` (bredvid källförteckningar) – dvs. både källor OCH bilder är nu delar av plattformens medvetna kvalitetsprofil, inte bara text.

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

## Källförteckningar per kapitel — kartläggning 23 sep 2026

Jesper vill att varje kapitel ska ha en numrerad källförteckning sist i studieguiden, med klickbara `[N]`-siffror i löptexten (upphöjda, `<a href="#ref-N" class="cite">[N]</a>`) som hoppar till rätt post i en `<ol>` (`<li id="ref-N">`) i en `<section class="references" id="kallor">`. Skälet: kunskapskravet i kemi åk 7–9 kräver att eleven kan bedöma källors trovärdighet, och läromedel saknar ofta källor helt. Mönstret fanns redan (upptäckt vid kartläggning, inte uppfunnet denna dag) och behöver INGEN ny komponent – bara användas konsekvent. Elever ska INTE bedöma källorna själva i studieguiden; det blir en separat övning om/när den byggs. Källkvalitet enligt Jesper: NE är en godtagbar referens, vetenskapliga (helst översiktliga review-) artiklar är bra, Skolverket är han tveksam till som sakkälla ("för politiska") – **undantag**: att citera Skolverkets kursplan för påståendet "detta följer kursplanen" är en annan (administrativ) användning, inte en sakkälla, se `kemi/atomer` ref-1 som redan gör precis detta. **Uppdatering 24 sep 2026:** Wikipedia godkänt som källa av Jesper ("Engelsk wikipedia är säkrare... om wikipedia har många bra referenser anser jag att sidan är bra nog. Väldigt många människor granskar idag wikipedia, det är nästan alltid en säker källa." + uppföljning: "Vanligen är även svenska wikipedia bra nog.") – engelska Wikipedia är förstahandsvalet ("säkrare"), men svenska Wikipedia är också godkänt i normalfallet. Första användningen: `biologi/liv-och-cellen` ref-9 (ligerfertilitet, engelska Wikipedia).

**Läget per 23 sep 2026 (15 studieguider):**
- **Klara** (källförteckning + alla poster länkade från texten): `biologi/genetik`, `fysik/universum`, `kemi/atomer`, `kemi/kemi-som-amne`, `kemi/separationsprocesser`, `biologi/liv-och-cellen` (se nedan).
- **Fixat natten 23–24 sep 2026 (autonomt arbete, ingen approval krävdes – mekaniskt länkningsarbete i redan skrivna, redan källförtecknade kapitel):**
  - `fysik/arbete-energi-effekt` – 3 källor, nu 10 `[N]`-länkar i texten (`ref-1` NE × 7, `ref-2` Energimyndigheten × 1, `ref-3` hästkraft/kWh-definitioner × 2).
  - `kemi/elektrokemi` – 6 källor, nu 10 `[N]`-länkar (`ref-1` Atkins & de Paula × 2, `ref-2` Chang & Goldsby × 2, `ref-3` NE × 2, `ref-4` PULS Kemi 7–9 × 1, `ref-5` IUPAC Gold Book × 2, `ref-6` Skolverket, administrativt i guide-intro × 1). **Flaggat för Jesper:** `ref-4` är en KONKURRERANDE lärobok (Tullgren m.fl., Natur & Kultur) – citerad en gång vid salmiakbatteri-stycket i M4. Inte uppenbart fel att ha den med som allmän referens, men värt ett medvetet beslut av Jesper (byta ut, ta bort, eller låta stå) eftersom plattformens USP är att vara bättre källförtecknad än just den typen av lärobok.
  - Testat: Playwright 1280 px + 390 px, axe-core – 0 NYA överträdelser (samma två kända: `nested-interactive`, `link-in-text-block`).
- **Tidigare fixat 23 sep 2026 (dagtid):** `biologi/liv-och-cellen` hade en färdig källförteckning (4 poster, sedan 6) men NOLL länkar från texten – nu inkopplat. `ref-1` (Hooke, *Micrographia*, ordet "cells" ursprung) är fortfarande oanvänt – texten nämner inte historien om ordets ursprung, och Claude har inte lagt till ny text för att koppla in den utan att fråga först.
- **Nästan klara** (någon post i listan oanvänd i texten): `kemi/kol-och-kolforeningar` (10 källor, 7 länkade – 3 oanvända, inte kontrollerat varför).
- **Färdig text och källförteckning, men GENERERAS av byggskript – kräver att redigera Python-källan (`tools/kemi-ritverktyg/matens-kemi/bygg_studieguide.py`) och köra om `bygg_alla.py`, inte handredigering av HTML:** `kemi/matens-kemi` (6 källor, 0 länkar) – medvetet HOPPAT ÖVER i nattens autonoma arbete, sparat till ett tillfälle där Jesper kan se resultatet innan ombyggnaden körs.
- **Saknar källförteckning helt:** `fysik/kraft-och-rorelse`, `fysik/magnetism-induktion`, `kemi/periodiska-systemet`, `kemi/syror-och-baser` – kräver att först hitta/välja källor, sedan bygga listan och länka in den.
- **Inte en kandidat än:** `fysik/elektricitet` (oskrivet skelett, se ovan).

Prioritetsordning inte beslutad av Jesper än – väntar på hans besked innan nästa kapitel görs.

---

## Ingen hänvisning till "skolan"/specifik skola som källa/ägare — STÅENDE REGEL, sep 2026

Anledning (Jesper, sep 2026): (1) Text som kopplar material, foton eller arbete till "skolan"/arbetstid på skolan riskerar att stödja ett framtida kommunalt anspråk på ägarskap av plattformen. (2) Plattformen riktar sig brett – alla skolor/elever i Sverige, Finlands svenskspråkiga elever, och på sikt (efter engelsköversättning) engelsktalande länder som USA (bland annat hemundervisningsmarknaden där) – en lokal "vår skola"-koppling passar inte den målgruppen.

**Regel: gäller HELA NO-plattformen, alla ämnen och områden — inte bara där det först upptäcktes.** Nämn aldrig "skolan", "vår skola", "min skola" eller liknande som källa/ägare till material, foton, riskbedömningar eller specifikt undervisningsinnehåll, i något område. Håll ursprunget generiskt ("en samling uppstoppade fåglar", "riktiga foton", "egen riskbedömning", osv). Personlig kreditering (Jesper Tordsson, familjemedlemmar) är okej och ska vara kvar – det är institutionskopplingen som ska bort, inte den personliga krediteringen. Kontrollera nya sidor mot detta innan de räknas som klara, precis som med WCAG-regeln ovan.

**Åtgärdat sep 2026:** fågeltävlingen (`biologi/ekologi/faglar-tavling.html`, `larande-spel.html`, `data/faglar.json`) hade flera "skolans"-omnämnanden (rubrik, introtext, fotokreditering) – borttagna. `kemi/kol-och-kolforeningar/esterlab.html` och `alkoholdemo.html` hade källhänvisningar till "skolans egen riskbedömning" – ändrat till "egen riskbedömning".

**Fågeltävlingen – egna fältfoton (21 sep 2026):** Jespers tre fältfoton från den 21 sep (häger, gräsand hane+hona, gråkråka) har ersatt de gamla bilderna av gräsand och gråkråka (`bilder-faglar/grasand-1.jpg`, `grakraka-1.jpg`, samma filnamn) och lagt till arten **Häger** (`hager-1.jpg`). Senare samma dag kom fler äldre foton: **gräsand hona med ungar** (`grasand-2.jpg`, gräsand har nu två bilder) och arten **Salskrake** (`salskrake-1.jpg`, hane; fakta från fageln.se och djurfakta.com) – 31 arter. Ett foto av en rörhöna (IMG_2971.HEIC) låg med i samma leverans men var inte beställt och är därför inte inlagt. Bilderna är beskurna till 3:4, 600×800 px, utan EXIF/GPS (originalen hade GPS – publicera aldrig originalen). Tävlingen visar nu **både uppstoppade och levande fåglar**, så "uppstoppade" är struket i rubrik, introtext (`data/faglar.json`) och kortet i `larande-spel.html`. Artfakta för Häger bygger på Fågelkartan (fagelkartan.se/art/grahager, 90–100 cm, vingspann 175–195 cm, jakt, kolonihäckning i träd); Naturhistoriska riksmuseet kallar arten "Gråhäger (häger)" (sidan gick inte att hämta, robots.txt). Namnet i tävlingen är "Häger" enligt Jespers önskemål.

**Råka – foto utbytt (22 sep 2026):** arten **Råka** (`id: raka`) fanns redan bland de 31 arterna men hade en bild av en uppstoppad råka (monterad på träkloss). Jespers nya eget fältfoto av en levande råka har ersatt den, samma filnamn (`bilder-faglar/raka-1.jpg`, beskuret 3:4 600×800, EXIF/GPS borttaget – originalet hade GPS, publicera aldrig originalet). Fortfarande 31 arter, samma mönster som häger/gräsand/gråkråka tidigare samma dag. Artfaktan uppdaterad och mer precis: bygger på Fågelkartan (fagelkartan.se/art/raka: 44–46 cm, vingspann 81–94 cm, bar gråvit hud vid näbbroten hos vuxna, kolonihäckare, äter mest daggmask) och Fågelkartans jämförelseartikel kaja/kråka/råka (näbbrot, "byxade" lår, brantare panna).

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

**Testat:** `bygg_alla.py` felfritt end-to-end; Playwright 13 sidor × 1280/390 px, 0 konsolfel (bortsett från ett sajtgemensamt känt `images/chemistry.jpg`-404) och 0 horisontell overflow (två mobilbuggar hittade och fixade: tabellkolumn `white-space:nowrap`, bingots CSS-grid `1fr`→`minmax(0,1fr)`); axe-core 0 nya allvarliga/kritiska (samma kända `nested-interactive`-fel som alla andra studieguider); språkbyte testat på engelska/spanska/arabiska; 3D-visaren verifierad visuellt på alla 12 molekyler. Ingen mänsklig pedagogisk granskning (Jesper sov) – se `tools/kemi-ritverktyg/matens-kemi/OVERLAMNING.md` för full detalj, källor och osäkra punkter.

**Ombyggnad efter Jespers pedagogiska granskning (22 sep 2026):** Jesper läste igenom och tyckte Gleerups kap. 7 landat på rätt nivå för högstadiet – huvudmålet är INTE exakta strukturformler utan komponenter/förekomst/egenskaper. Studieguiden byggdes om från 5 till **4 milstolpar** (M1 fotosyntes/cellandning borttagen som egen milstolpe – "tjatas det om tillräckligt", ersatt av en enda brygg-mening i M1 Kolhydrater). Genomgående princip: **tre förståelsenivåer** – ord → schematisk översiktsbild → strukturformel.
- **M1 Kolhydrater:** den förenklade sockertabellen (Gleerups nivå) behålls, men glukos får nu ÄVEN en detaljerad strukturformel (`glukos-detaljerad.svg`, alla C/H/OH utsatta) + 3D-kulmodell direkt i huvudtexten. Ring- vs öppen-kedjeform av glukos (`glukos_oppen`), samt **ribos och deoxiribos** (nya RDKit-molekyler, kopplas till att de tillsammans med fosfat är ryggraden i RNA/DNA) ligger i fällbara `.deepen`-fördjupningsrutor (samma komponent som redan finns i 3 andra kapitel, inte en ny klass).
- **M2 Fetter:** tre steg i tur och ordning – ord, en NY egen schematisk bild `fett-oversikt.svg` (glycerol som ett tjockt grått "E", tre färgade fettsyra-block, ett med en pilspets-"knäck" för omättnad – egen geometrisk tolkning, INTE kopierad från Gleerups, som medvetet inte konsulterades för denna bild), och en omdesignad symmetrisk `triglycerid.svg`-strukturformel med tydliga, LIKA esterbindningar (alla C=O uppåt) och glycerolryggrad lång nog att syrena inte krockar visuellt.
- **M3 Proteiner:** ord → funktionstyper med källbelagda exempel (byggnadsmaterial/kollagen-keratin, muskelkontraktion/aktin-myosin, enzym/amylas, hormon/insulin) → ny schematisk bild `protein-veckning.svg` (kulor i olika färger+bokstäver i en kedja, veckade till en form). Peptidbindningen (dipeptid med fullständiga strukturformler) flyttad till en `.deepen`-fördjupning – syns inte längre i huvudtexten.
- **M4:** kort sammanfattning (stärkelse/glykogen) + vitaminer/mineraler mycket kort (vad de är bra för + var man hittar dem) + tydlig länk till Hästkapplöpning.
- **Gula rutor:** nedbantade från fler till EXAKT 3 i hela kapitlet (bara det som "inte får missas": stärkelse≠fruktos, glycerol≠butanol/mättat-omättat-antal-dubbelbindningar, cellulosa saknar rätt enzym hos människan), och ALLA flyttade till `.m-side` (högermarginalen i den breda bildkolumnen) – en medveten AVVIKELSE från sajtens nuvarande stående regel att gula rutor kan ligga var som helst i löptexten. `css/viktigt.css` (delad fil) är OFÖRÄNDRAD; andra kapitel påverkas inte. Backlogpunkt: bakåtstäda övriga kapitel till samma marginal-mönster om Jesper vill ha det överallt (se _CHECKLISTA_omraden.md).
- **Testat om:** ny `bygg_alla.py`-körning felfri, nya skärmdumpar 1280/390 px (ingen horisontell scroll), axe-core 0 nya felkategorier, kontrastfix på fettsyrafärgen (mörkad till 5,3:1), `.deepen`-rutor verifierat tangentbordsoperabla och hopfällda som standard, alla ankare `#m1`–`#m4` verifierade i index/begrepp/checklista.
- **Tillägg 22 sep 2026 (kväll) – ölglasbild:** Jesper bad om en bild av ett ölglas (AI-genererad, från hans Hämtade filer) i högermarginalen intill maltsocker, med en given bildtext om ölbryggning. Beskuren/skalad till `images/kemi/matens-kemi/foton/olglas.jpg` (700×561, ny undermapp `foton/` för foton/AI-bilder, ingen EXIF), infogad med samma `illust()`-hjälpfunktion som fett-bilden, staplad i `.m-side` under glukoskortet i M1 (samma rad som sockertabellen, som listar Maltos). Omtestat: Playwright 1280/390 px ingen overflow, axe-core samma enda kända avvikelse som förut (`nested-interactive`, ingen ny).

- **Tillägg 22 sep 2026 (kväll) – glukosbilden bytt till Jespers egen referensbild:** Jesper bad först om att lära ritkonventionen för sockerringar (Haworth-projektion: H/OH som strikt VERTIKALA streck upp eller ner från varje ringkolatom, aldrig utåtriktade i sexhörningens egen vinkel – mönstret upp/ner kodar stereokemin/anomerform) från sin referensbild `Glukos.png` (Hämtade filer) och att den ritade `glukos-detaljerad.svg` skulle bytas ut. Första försöket: ritade om SVG:n med korrekt Haworth-geometri (upptäckte och fixade även att sexhörningen var fel roterad – "spetsig topp" i stället för "platt topp", vilket gjorde att de vertikala strecken vid syre/C5 pekade IN i ringen istället för utåt; verifierat med inzoomad skärmdump). Jesper underkände resultatet trots korrekt kemi: "Den strukturformel som nu ligger i Glukos - detaljerad formel, ser inte bra ut" och bad om ENTINGEN en exakt likadan bild som referensbilden ELLER referensbilden själv. **Löst genom att använda Jespers egen bild**, beskuren till `images/kemi/matens-kemi/strukturformler/glukos-detaljerad.png` (620×496, ingen EXIF) – bara bildtexten "α-D-glukos (Haworth-projektion)" beskuren bort, se nedan varför. Den handritade SVG-funktionen (`ring_glucose_detailed_svg`) och dess post i `FREESTANDING_SVG` är borttagna ur `bygg_maten.py`; `detailed_glucose_card_html()` refererar nu PNG:n direkt (egen PIL-baserad skalning /2, inte `_dims()`-hjälparen som antar /3-konventionen för kulmodellerna).
  **Kemifynd (flaggat, inte ändrat i Jespers bild):** referensbildens bildtext säger "α-D-glukos", men mönstret som är ritat (OH upp vid C1 och C3, OH ner vid C2 och C4, CH₂OH upp vid C5) är faktiskt kännetecknande för **β-D-glukopyranos** (den vanligaste formen i lösning, ca 64 %) – vid α skulle C1-OH peka NER (trans mot C6:ans CH₂OH). Löst genom att beskära bort just den (felmärkta) bildtextraden ur den inklippta bilden, så bara själva ritningen (utan påstående om alfa/beta) och den korrekta rubriken "Glukos / C₆H₁₂O₆" visas – informationen som riskerade att vara fel är helt enkelt inte med. Säg till om du vill att jag lägger till en korrekt bildtext (t.ex. "β-D-glukos, Haworth-projektion") istället för ingen alls.
  Omtestat: Playwright 1280/390 px, bilden får plats i `.m-side`-kortet utan overflow tillsammans med ölglasbilden, axe-core samma enda kända avvikelse som förut (ingen ny).

- **Tillägg 22 sep 2026 (kväll) – färgschema omgjort, mindre gult:** Jesper (efter att ha sett sidan): "Det är totalt för mycket gult på sidan! Den blir blek och tråkigt av det!" och undrade om någon annan färg (han gissade ljusgrönt) kunde läsas som gul för honom som röd-grönfärgblind. Utredning med en enkel CVD-simulering (protanopi/deuteranopi-matriser) visade att det INTE var grönt, utan att tre separata komponenter på sidan – `.viktigt` (gul, avsiktlig/sällan), den delade `.deepen`-fördjupningsrutan (gulbeige `#fffbe7`/`#b45309`, kapitlets EGEN kopia av den delade komponenten – se nedan) och kapitlets hela varumärkesfärg "AREA" (orange/persika `#9a3412`/`#fff7ed`, använd i praktiskt taget alla genererade sidor: studieguide, laborationer, begreppskort/bingo, korsord, övningsverktyg, index) – alla föll ihop till nästan samma olivbruna nyans vid simulerad deuteranopi. Alltså tre "gula" ytor staplade på varandra på en och samma sida.
  **Åtgärd:** `.viktigt` (sällan använd, sitewide, `css/viktigt.css`) och den blå `.check-q`-rutan (bara i detta kapitel) lämnade OFÖRÄNDRADE. Hela kapitlets AREA-varumärkesfärg bytt från orange till vinrött/fuchsia (`--area-strong: #86198f` m.fl., Tailwind-fuchsia-skala) – detta är en STÖRRE ändring än bara studieguide-sidan, eftersom AREA-färgen används i sju separata byggfiler (`bygg_lab.py`, `bygg_kort_bingo.py`, `bygg_verktyg.py`, `bygg_index.py`, `bygg_sidor.py`:s färgersättningskarta, `bygg_korsord.py`, `bygg_studieguide.py`) och alltså hela kapitlets grafiska identitet, inte bara en ruta. `.deepen`s färg (upptäcktes vara satt LOKALT per kapitel i `src/studieguide.css`, INTE delad trots att klassnamnet/JS-beteendet är delat – kemi-som-ämne och separationsprocesser har var sin nästan identiska gulbeige nyans i sina egna css-filer) bytt till neutral gråblå (slate) `#f1f5f9`/`#334155` – bara i matens-kemis egen `src/studieguide.css`, påverkar INTE andra kapitel. Nya färger valda genom att maximera CVD-simulerat avstånd mellan alla fyra kvarvarande "märkta" färgytor (gul/blå/fuchsia/grå) – lila uteslöts eftersom det visade sig ligga för nära den blå `.check-q`-färgen under simulerad färgblindhet. Upptäckte samtidigt att `.fact-box`/`.next-steps`-hjälpfunktionerna i `bygg_studieguide.py` saknar CSS helt för det här kapitlet – men de anropas aldrig i `bygg_maten.py`:s innehåll, så det är död kod utan effekt på sidan, inte en bugg som syns – lämnad orörd.
  Textsträngar som beskrev den gamla färgen med ord uppdaterade (t.ex. korsordets "En ruta blir mörkt orange" → "En ruta blir vinröd").
  Omtestat: Playwright-skärmdumpar av studieguide (1280/390 px) och alla övriga genererade sidor (begreppskort, bingo, övningsverktyg, korsord, laborationer, lärande spel), axe-core 0 nya överträdelser (samma `nested-interactive`-avvikelse som redan fanns i andra kapitel, t.ex. kemi-som-ämne – inte orsakad av denna ändring), ingen färgkontrast-överträdelse.

- **Tillägg 23 sep 2026 – ny `.wonder`-ruta (fundera vidare) i milstolpe 1:** Lade till kapitlets första öppna, funderande fråga (klass `.wonder`/`.frontier`, samma komponent som t.ex. kol-och-kolföreningar använder) i `bygg_studieguide.py` (ny hjälpfunktion `wonder(summary, *parts, frontier=…)`, samma mönster som `deepen()`/`checkq()`) samt CSS i `src/studieguide.css`. **Färgvalet krävde en ny CVD-simulering:** kol-och-kolföreningars vanliga `.wonder`-färg (teal, `#115e59`) kolliderar med matens-kemis NYA `.deepen`-slate (`#334155`) vid simulerad färgblindhet (avstånd bara ~14-18). Sökte systematiskt över hela hue/lightness/saturation-rymden mot alla fem redan låsta färgytor på sidan (gul `.viktigt`, blå `.check-q`, fuchsia AREA, slate `.deepen`, plus deras respektive summary-/label-nyanser) – gröna nyanser (skogsgrönt, hue ~108-118°) gav bäst avstånd (~38-40+ mot samtliga, kontrast 6-7:1 mot vitt) utan att återinföra gult/gulbrunt eller bli "bara ännu en blå" (vilket cyan/blåa alternativ runt hue 200° riskerade). Ny lokal palett bara för matens-kemis `.wonder`: bakgrund `#f0fdf4`, kant `#00ad0e`, summary-text `#126302`, frontier-text `#107410`, frontier-kant `#bbf7d0` – dokumenterat med motivering direkt i `src/studieguide.css`. Frågan kopplar cellulosa/stärkelse-kemin (redan etablerad i checkq/fact ovanför) till biologi (idisslares tarmbakterier/cellulas-enzym) och till verklig forskningsfront (cellulasenzymer för biodrivmedel, forskning om tarmbakterier) – avslutas med en öppen fråga utan givet svar, ingen upprepning av checkq:ns redan givna facit.
  Omtestat: Playwright-skärmdump av den expanderade rutan, axe-core 0 NYA överträdelser (samma redan kända `nested-interactive` på `.milestone`/`.deepen`-summaries, `.wonder` berörs inte eftersom `js/lyssna.js` aldrig lägger en Lyssna-knapp i `.wonder`-rutor, varken här eller i kol-och-kolföreningar – sitewide-konvention, inte ett förbiseende).

---

## Ekologi – studieguide och standardpaket byggt 25–26 sep 2026

Källor för innehållet: Gleerups Titano biologi 7–9 kap. 3 "Ekologi och miljö" (Jespers 68 foton av skärmen, IMG_8481–8549 i Hämtade filer – bara läst, aldrig kopierat eller publicerat) och Enkel NO Biologi del 3 Ekologi (PDF). Jespers styrning under bygget: **fokus på grundbegrepp och övningar, inte för mycket miljöfrågor** (klimat/växthuseffekt/globala mål/ozon/metan medvetet utelämnade – sparas till det framtida området Hållbar utveckling); **även mark kan försuras** (med i M7); **använd Östersjön som exempel** (genomgående: näringskedjan i M3, näringspyramiden, hela M9, miljögifterna i M11).

**Studieguide (11 milstolpar, bred layout med bildkolumn, grön ekologifärg `#2f5228`/`#f1f6ed`/`#cadcbf`):** M1 ekologi/ekosystem (individ → population → samhälle → ekosystem → biom → biosfär), M2 fotosyntes + cellandning, M3 näringskedja/-väv/-pyramid (tiondelsregeln), M4 nedbrytare + tre kretslopp, M5 nisch, konkurrens, symbios, biologisk mångfald, M6 marken (berggrund, jordart, morän, förna, jordmån, växtområden), M7 skogen, M8 sjön (+ fördjupning sjön och årstiderna), M9 havet – exemplet Östersjön (+ `.wonder`), M10 ängen (inte med hos Gleerups – egen milstolpe), M11 människan (ekosystemtjänster, miljögifter/anrikning – havsörn, gråsäl). 11 `.check-q`, 1 Viktigt-ruta (bergart ≠ jordart), 14 källor, alla länkade.

**Filer:** alla 13 kärnsidor + `ovningsverktyg.html` (10 sorteringsövningar i `data/ovningar.json` via `dra-och-slapp.js`, stöd för `cap` per ruta – används för att bygga näringskedjor med en bricka per nivå) + befintliga spel. 28 kärnbegrepp och 46 termer, 11 språk (AI-översatt, ej korrekturläst), checklista ar/am/rw. Egna SVG-diagram (kod, inte AI): `images/biologi/ekologi/naringspyramid.svg`, `salthalt.svg`. **OBS:** `device_commit_files` lade in ett C2PA-metadatablock i SVG-filerna – ofarligt, syns inte.

**Bilder:** 16 platshållare (`data-bild="B1"`–`"B16"`) väntar på bilder. Faktakontrollerade ChatGPT-promptar i `_BILDLISTA_ekologi.md`. När en bild kommer: faktakontroll → beskär bort inbränd text → bildtext som HTML → granskningsnotering i källförteckningen.

**Upptäckt men EJ åtgärdat (i liv-och-cellen, rör inte ekologi):** `biologi/liv-och-cellen/begreppskort.html` har bakåtlänk till genetik + Mendel-bild, `begreppslista.html` säger "inom genetik", och begreppskort-sidan laddar Tailwind från CDN. Rättat i ekologis kopior.

---

## Hästkapplöpning – nytt lagspel om mineraler och vitaminer, byggt natten 21–22 sep 2026

Realtids-lag-quiz (Jesper: "tänk ut ett nytt lagspel… hästkapplöpning… mineraler och vitaminer") i `spel/hastkapplopning/` + Cloudflare Worker-källkod i `tools/hastkapplopning-worker/`. **Servern är INTE driftsatt** – Jesper sa uttryckligen "vi får fixa med ny worker i morgon", så det återstår som enda steg (`tools/hastkapplopning-worker/README.md`, ca 5 minuter: `npx wrangler login` + `npx wrangler deploy`, klistra in URL:en i `spel/hastkapplopning/js/config.js`). Fram tills dess fungerar **Lokalt läge** (alla enheter i samma webbläsare, `BroadcastChannel`) och **Demoläge** (samma + datorstyrda bottlag) direkt utan konto – bra för Jesper att testa själv först.

**Spelregler** (byggda exakt efter Jespers beskrivning): lag väljer var sitt djur-avatar (10 st: häst, zebra, tiger, elefant, kamel, älg, snigel, kanin, giraff, sköldpadda – egna, originalritade SVG:er, skiljs åt på silhuett+mönster, inte bara färg; CVD-simulerat 0 riskpar), ELLER (nytt, valbart) "Slumpa lag" – se nedan. Lärarskärmen (projektor) visar frågan ovanför en kapplöpningsbana, kontroller för nästa fråga (manuellt eller auto), och antal lag som svarat (utan att avslöja vilka). Elevernas egna skärmar visar frågan + 4 svarsalternativ (A/B/C/D, var sin FORM ▲●■◆, inte bara färg) samt eget lag/lagkamrater. **Lagkonsensus-regel (uppdaterad 22 sep 2026, efter Jespers feedback):** ett lag räknas bara som "helt rätt" om ALLA lagmedlemmar svarat rätt; laget blir "klart" när dess SISTA medlem svarat. Lagen rankas efter denna klart-tidpunkt: snabbaste helt-rätta lag → 3 steg + gnägg, näst snabbaste helt-rätta → 2 steg + gnägg, övriga helt-rätta lag → 1 steg (hovljud), lag med minst ett fel eller obesvarat svar när tiden går ut → 0 steg. Ensam-medlemslag (om sådana uppstår) fungerar som tidigare – ett svar avgör direkt. 3 matcher (Vitaminer / Mineraler / Blandat), 8 ordinarie + 4 reservfrågor vardera, olika frågor per match, prispall efter varje match, mästarpall (summerad matchpoäng 3/2/1) på slutet.

**"Slumpa lag" (nytt, valbart, 22 sep 2026):** alternativ till manuellt avatar-val, inspirerad av Socrative "random groups". Eleverna skriver bara sitt namn i lobbyn (ingen avatar väljs). Läraren klickar "Skapa slumpade lag" → eleverna delas automatiskt in i lag om 2–3 med slumpade, ännu inte tagna avatarer. Lärarskärmen visar hela listan (namn → lag/avatar) så att eleverna kan flytta sig fysiskt till rätt grupp. Omslumpning tillåten bara innan matchen startar. Sena anmälningar hamnar i en "Utan lag"-pool (samma som tidigare manuella läge; dropdown för manuell placering döljs automatiskt när Slumpa-lag-läget är aktivt, så de två gränssnitten inte krockar).

**Arkitektur:** delad, deterministisk spelmotor `js/engine.js` (ingen DOM/nätverk, tid som parameter) återanvänds identiskt i (a) klientens Lokalt/Demo-läge och (b) Workerns Durable Object (`tools/hastkapplopning-worker/bygg_worker.py` bygger en enfils `worker.js` ur samma källa – redigera aldrig `worker.js` för hand). WebSocket Hibernation API (gratisplanens SQLite-baserade DO krävs, `new_sqlite_classes`-migration i `wrangler.toml`), rumstillstånd persisteras vid varje ändring, 8 h auto-radering. Facit skickas ALDRIG till eleven i förväg (läraren skickar det per fråga). Origin-vitlista överst i `worker.js` (byt vid behov). Elever anger bara förnamn/smeknamn, ingen persistens utöver rummets livstid.

**Ljud:** syntetiserade (Web Audio API), analyserade offline (spektrum/varaktighet) men **ALDRIG avlyssnade av en människa** – tryck "Ljudtest" i lärarvyns inställningar före första lektionen.

**Testat (ursprunglig version):** enhetstester motorn 27/27, integrationstest mot riktig `wrangler dev` 6/6 (CORS/origin, WS-auth, facitläckage-kontroll, rumsgräns, alarm), persistenstest (hård omstart mitt i match) 10/10, E2E Playwright hela 3-matcherspelet både i Lokalt läge och mot riktig Worker 970/970 kontroller vardera, axe-core 23 sidtillstånd 0 överträdelser, egen kontrastmätning 50 färgpar alla ≥4,95:1, tangentbord/reflow 320 px OK.

**Regeländring efter Jespers feedback (22 sep 2026):** bytte poängmodell från "första lag som svarar rätt" till lagkonsensus (se Spelregler ovan) – motorn (`js/engine.js`) omskriven, rankning sker på lagets "alla klara + alla rätt"-tidpunkt.

**Ny funktion – "Slumpa lag" (22 sep 2026):** ny modul `js/slumpa-lag.js` för automatisk lagindelning (se ovan).

**Jespers svar på de tre öppna frågorna (22 sep 2026):**
1. **Tie-break vid exakt samtida klart-tidpunkt:** "spelar ingen roll om det blir rättvist, bara inte fel uppstår i programmet eller att det blir uppenbart att något inte fungerar" – den deterministiska svars-sekvensräknaren i `engine.js` (inte slump) är alltså godkänd som den är, inget ändrat.
2. **Facit-sekretess/samarbete i laget medan man väntar på sista medlemmen:** inte ett problem – "det gör absolut inget om de samarbetar, det ökar snarare lusten … de får ju inga poäng om någon svarar fel, så de måste kolla av med varandra" – ingen spärr byggd, oförändrat.
3. **Sen anslutning mitt i en match:** "vore bra om det går, men strunta i det om det är svårt". Visade sig redan fungera i motorn (testat: `elevbyte av lag mitt i match …` i `engine.test.mjs`, rad ~179) – en spelare UTAN lag kan gå med i ett BEFINTLIGT lag när som helst utom i fasen "slut" (bara att starta ett NYTT lag är låst till lobbyn), och elevens egen skärm (`elev.js`, vyn "Välj lag") erbjuder redan detta med texten "Matchen pågår. Du kan gå med i ett lag som redan finns." – även i Slumpa-lag-läge (fallback till samma manuella vy om man ansluter efter att slumpningen redan gjorts). Enda gapet var att LÄRARSKÄRMEN inte visade något om väntande elever under en pågående match (bara i lobbyn) – litet tillägg gjort: en rad under lagstatuslistan ("N elever utan lag (ansluter sent): NAMN – de väljer själva ett lag på sin egen skärm"), `larare.html`/`larare.js`. Ingen ny lärarstyrd placeringsfunktion mitt i match behövdes.

**Osäkert/kvarstår (oförändrat sedan ursprungsbygget):** själva `wrangler login`/`deploy` mot Jespers Cloudflare-konto är overifierat (allt annat testat mot riktig `workerd`-körtid lokalt); nätverksrättvisa vid skolans riktiga uppkoppling otestad (allt kört lokalt med mikrosekunders latens); fem frågor med lite svagare källor flaggade i `tools/hastkapplopning-worker/OVERLAMNING.md` (bl.a. M3 fråga 4 om kosttillskott, M2 fråga 3 källan bara "Läkartidningen") – läs igenom frågorna i `spel/hastkapplopning/data/mineraler-och-vitaminer.json` innan lektion.

**Testat om (efter regeländringen och lärarnotisen för sena anslutningar):** enhetstester motorn 35/35, integrationstest mot riktig `wrangler dev` 6/6, persistenstest 10/10, E2E Playwright hela 3-matcherspelet (Lokalt läge, inkl. Slumpa-lag-flödet) 980/980 kontroller, axe-core 30 sidtillstånd 0 överträdelser.

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
