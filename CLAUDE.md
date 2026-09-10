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

## Begreppsöversättning vid läsning (inline i löptexten) — PROTOTYP, sep 2026

Ny, fristående funktion utöver den vanliga begrepp-popupen (som nås via knappar i concept-section på `index.html`/`begreppslista.html`): enskilda begreppsord *inne i studieguidens löptext* går att klicka på och ger samma popup (översättning + förklaring), utan att eleven lämnar sidan. Bygger vidare på samma data (`data/begrepp.<prefix>.json`) och samma popup-komponent (`concepts-popup.js`) som redan finns – ingen ny datakälla.

**Status:** pilotbyggd i `fysik/magnetism-induktion/studieguide.html` (11 begreppsord inlindade, ett urval, inte uttömmande). Väntar på Jespers godkännande av UX/känsla innan den sprids till fler områden eller kompletteras med fler ord i samma område.

**Viktigt designval:** en HELT EGEN språkväljare styr detta, separat från den vanliga TTS-språkväljaren (`lang-selector-mount` / `site.tts-lang`). Annars skulle en elev som vill lyssna på/läsa svensk text tvingas byta hela sidans språk bara för att få begreppen översatta – och TTS:en skulle då försöka läsa (ännu oöversatt) svensk text med fel röst.

**Filer:**
- `js/concept-lang-selector.js` – ny, oberoende väljare. Egen `localStorage`-nyckel `site.concept-lang`. Återanvänder `window.LangSelector.loadBegreppForLang(lang, begreppBase)` (exponerad från `language-selector.js`) för själva hämtningen/cachen av begrepp-JSON, men påverkar ALDRIG TTS-rösten.
- `js/language-selector.js` – oförändrad i sak, bara exponerar `window.LangSelector.loadBegreppForLang` så den nya väljaren kan återanvända hämtningslogiken.
- `js/concepts-popup.js` – ny CSS-klass `.concept-inline` (klickbart understruket ord, samma hover-färg som `.concept-btn`).

**Markup per område (i `studieguide.html`):**
```html
<div class="lang-selector-mount"></div>
<div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp"></div>
```
och i själva löptexten, ordagrant matchande `namn`-fältet i `data/begrepp.json` (attributvärdet, inte den synliga ordformen – böjda/gemena former i texten är okej):
```html
<span class="concept-inline" data-concept="Exakt namn som i begrepp.json">ordet i texten</span>
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
Kapplöpnings-skyddet i sista scriptet (kolla `site.concept-lang` innan `BEGREPPPopup.update` anropas) är avsiktligt – annars kan den svenska bas-hämtningen skriva över ett redan valt annat begrepp-språk beroende på vilket `fetch`-anrop som svarar sist.

**Kvarstående när Jesper godkänt piloten:** (1) sprid till fler områden (samma tre steg: mount-div, script-inklusion, wrapa begreppsord i löptexten), (2) överväg att wrapa ALLA förekomster av varje begrepp per område, inte bara ett urval, (3) lägg till som standardkomponent i `_CHECKLISTA_omraden.md` om den blir permanent.

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

I dag täcker flerspråksstödet bara begreppen (`data/begrepp.<prefix>.json`). Själva löptexten i studieguiden finns bara på svenska, och `lyssna.js` läser bara upp svensk text (inspelad mp3 eller annars Web Speech API på `sv-SE`). Detta är en medveten SENARE fas: påbörjas först när ett områdes svenska text är helt slutgranskad och godkänd av Jesper (se `pedagogik.md`). Det här avsnittet dokumenterar HUR det ska göras när den fasen inleds, så inget går förlorat mellan sessioner.

**Steg 1 – datastruktur för översatt löptext.** Ny datafil per område och språk, t.ex. `data/studieguide.<prefix>.json`, som speglar milstolpestrukturen (`m1`, `m2`, …) och innehåller den ÖVERSATTA brödtexten milstolpe för milstolpe (inte bara begrepp). Varje textblock som ska kunna bytas ut behöver ett stabilt attribut att hänga översättningen på, t.ex. `data-i18n-block="m3-text"` på respektive `<div>`/`<p>`-grupp i studieguiden.

**Steg 2 – generering av översättningen.** Automatöversättning (AI) av den redan godkända svenska texten, milstolpe för milstolpe. Jesper förväntas INTE läsa igenom hela textmassan i alla språk ord för ord, men bör göra stickprov – särskilt av facktermer. Viktigast: facktermerna i den översatta löptexten måste matcha EXAKT de redan godkända översättningarna i `data/begrepp.<prefix>.json` (annars får eleven två olika ord för samma begrepp – ett i löptexten, ett i begreppspopupen).

**Steg 3 – rendering.** Klientsidesväxling, samma mönster som begreppen redan använder: vid språkbyte i `lang-selector-mount` hämtas `data/studieguide.<prefix>.json` och byter ut brödtexten i varje märkt textblock. Enklare (men tyngre DOM) alternativ: rendera båda språkversionerna i HTML från start och toggla synlighet med CSS/JS. Föredra klientsidesväxling via fetch – konsekvent med hur begreppen redan hanteras.

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

## Övningsprov + facit + instuderingsfrågor + checklista (tunna mallar)

Dessa fyra sidtyper är tunna HTML-mallar som renderar JSON via delad JS. Klona från en färdig area (fysik: `fysik/kraft-och-rorelse/`; biologi: `biologi/genetik/`) och byt bara ut områdesnamnet i `<title>` och `<header><p>`.

- `checklista.html` → `js/render-checklista.js`, data `{sections:[{title, note?, items:[]}]}`.
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
