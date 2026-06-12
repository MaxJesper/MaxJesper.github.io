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

## Utskriftsstandard

Alla utskriftsvyer följer namnmönstret `*-print-elev.html`, `*-print-larare.html`, `ovningsprov-print.html`, `facit-print.html`.

- Utskriftslänkarna **ska enbart** finnas som knappar inne i moderdokumentet (`instuderingsfragor.html`, `ovningsprov.html`, `facit.html`). **Inte** som separata länkar i lärarmenyns `index.html`.
- Utskriftssidor kör `window.print()` automatiskt vid laddning och stänger sig sedan.

---

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

## Originalitet – inga kopior av lärobokstext

När Claude skapar **studieguider**, **instuderingsfrågor** och **övningsprov** gäller att all text ska vara ny och självständigt formulerad. Det är inte tillåtet att kopiera eller nära citera text från läroböcker (t.ex. TEFY, Puls, Spektrum eller andra förlag).

- **Inspirationen** kan komma från läroböcker och PDF-material som Jesper delar.
- **Formuleringarna** ska alltid vara omskrivna – egna meningar, egna exempel, eget pedagogiskt grepp.
- Kemiska formler, reaktionslikningar och faktauppgifter (t.ex. atomnummer, kockpunkter) är offentlig faktakunskap och kan användas fritt.
- Varje studieguide ska avslutas med en **källförteckning** (`<section class="references" id="kallor">`) med numrerade referenser i APA-liknande format, i linje med universum/studieguide.html.

Syftet är att Jesper ska kunna publicera och använda materialet utan risk för anklagelse om upphovsrättsintrång.

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
