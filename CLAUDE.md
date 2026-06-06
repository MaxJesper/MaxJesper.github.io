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

- **Lärarstöd för lektioner** – en sida per område med en strukturerad lista över saker att ta upp på lektionerna. Ska göras tillsammans med Jesper.

- **Gymnasiefördjupning** – en fördjupningssektion på kemi-hudsidan för natur/teknikprogrammet. Exempel: molräkning och balansering av kemiska formler. Ska göras tillsammans med Jesper.

- **Nationella provuppgifter** – gamla släppta nationella prov ska finnas som övningar i två varianter:
  1. Samlad övning per NO-ämne (biologi, kemi, fysik) – troligen på ämnets hudsida.
  2. Områdesspecifik övning – uppgifter kopplade till ett specifikt område (t.ex. elektrokemi) läggs direkt på den sidan. Båda varianterna kan finnas parallellt. Ska göras tillsammans med Jesper.
