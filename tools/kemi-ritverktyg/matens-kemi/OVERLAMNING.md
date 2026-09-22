# Överlämning – Matens kemi

Nytt kapitel, byggt medan Jesper sov, utifrån hans instruktioner och två gamla prov (innehåll sammanfattat i uppdraget, inte kopierat). Fokus enligt Jesper: makromolekylerna (stärkelse, cellulosa, fett, protein) – inte Gleerups fulla omfång.

## Filträd (det jag skapat/ändrat)

- `tools/kemi-ritverktyg/matens-kemi/` – alla byggskript (11 st) + `kallor.json` + denna fil.
  `bygg_maten.py` (molekyler/SVG/PNG), `bygg_studieguide.py`, `bygg_index.py`, `bygg_data.py`,
  `bygg_sidor.py` (checklista/begreppslista/instudering/prov/facit), `bygg_verktyg.py`
  (sorteringsövning + spelhubb), `bygg_kort_bingo.py`, `bygg_korsord.py`, `bygg_lab.py`,
  `bygg_alla.py` (orkestrerar allt i rätt ordning), `data_begrepp.py`, `data_fragor.py`, `data_ovningar.py`.
- `kemi/matens-kemi/` – 15 HTML-sidor (index, studieguide, begreppslista, begreppskort,
  begrepp-bingo, checklista, instuderingsfragor ×3, ovningsprov ×2, facit ×2, korsord,
  laborationer, larande-spel, ovningsverktyg) + `js/molmodeller.js` + `data/` (28 JSON-filer:
  begrepp/termer ×11 språk, begreppskort, checklista, instuderingsfragor, ovningsprov, ovningar).
- `images/kemi/matens-kemi/` – 12 strukturformel-SVG:er + 12 kulmodell-PNG:er (reserv utan JS).

**Allt är genererat av Python-skripten ovan** – ingen HTML är handredigerad. `bygg_alla.py` kör
hela kedjan; testat felfritt end-to-end (se Test nedan).

## Innehåll (5 milstolpar i studieguiden)

1. Fotosyntes/cellandning (ord- och formelekvationer, varandras motsatser).
2. Kolhydrater: mono-/di-/polysackarider, stärkelse vs cellulosa (glukos, INTE fruktos – vanlig
   missuppfattning, rättad i gul ruta).
3. Fetter: glycerol + 3 fettsyror, mättat/omättat = antal dubbelbindningar, energitäthet, härdning.
4. Proteiner: aminosyrans grundstruktur, peptidbindning, enzymer är proteiner, denaturering.
5. Kort sammanfattning: stärkelse (växt) vs glykogen (djur), pekar vidare till Hästkapplöpning
   för vitaminer/mineraler (djupare innehåll ligger avsiktligt inte här).

## Molekyler och pedagogiska/tekniska beslut

12 molekyler byggda med RDKit (`chembuilder.build_rdkit`, samma bibliotek som övriga kapitel) –
för komplexa för handbyggd trigonometri. Alla 2D-strukturformler är egna, procedurellt genererade
SVG:er i husstilen (två återanvändbara ritfunktioner: `group_svg` för kondenserade formler,
`ring_svg`-familjen för sexringarna).

**Nyckelbild (kärnan i provfrågan):** `maltos` (stärkelsefragment, α-1,4) och `cellobios`
(cellulosafragment, β-1,4) är ritade så att bindningsvinkeln gör kedjan tydligt **böjd** respektive
**rak** – både i 2D-schemat och i 3D-kulmodellen. Verifierat visuellt vid test.

**Dokumenterade förenklingar** (kemin – bindningstyper, funktionella grupper – stämmer, men
molekylerna är kortade för tydlighet, precis som `citronsyra` i syror-och-baser-kapitlet):
- `maltos`/`cellobios`: visar bara 2 av de tusentals glukosenheterna i riktig stärkelse/cellulosa.
  Text i kortet säger detta explicit ("Förenklad modell: …").
- `triglycerid`: fettsyrekedjorna är förkortade (riktiga är 12–18 kol); esterbindningarna och
  blandningen mättat/omättat stämmer. Noterat i kortets text.
- `cellobios`-SMILES är **härledd**, inte hämtad direkt: jag hittade ingen ring-formad
  cellobios-SMILES i sökbara källor, så jag utgick från en verifierad maltos-SMILES
  (chemicalbook.com) och inverterade exakt den stereocentrum som skiljer en α-1,4- från en
  β-1,4-glykosidbindning. Kemiskt motiverat (det är definitionen på skillnaden mellan de två
  bindningstyperna) men **inte cross-checkat mot en andra oberoende källa** – flaggas som
  lägre säkerhet.
- Fruktos ritas i öppen kedja (inte ringform) – vanligare pedagogisk framställning på den här nivån
  och enklare att visa ketongruppen som skiljer den från glukos.

Alt-texter är beskrivande text (aldrig bara "se bild"), eftersom Jesper är rödgrön färgblind –
samma segrar som övriga kapitel: bokstavsknapp på 3D-kulorna, färgförklaring som text.

## Övningsverktyg – dokumenterade förenklingar

- **Begrepp-bingo** är en **enspelarversion** (ingen Cloudflare Worker-backend som originalet i
  andra områden använder för flerspelarsynk – kunde inte återskapas här). Fungerar: drar en
  slumpad förklaring, markerar rätt ruta, vinner vid fyra i rad.
- **Begreppskort**: egen, enklare implementation (ingen Tailwind-CDN), två nivåer, nivå 2 låses
  upp efter nivå 1 – testat fungerande.
- **Sortera molekylerna** (`ovningsverktyg.html`): tre `dra-och-slapp.js`-övningar (kolhydrat/
  fett/protein, mättat/omättat, mono-/di-/polysackarid).
- **Laborationer**: två säkra, egenformulerade protokoll (jodtest för stärkelse, fettfläcktest på
  papper) – båda vedertagna, lågriskmetoder, egen riskbedömning (ingen "skolan"-referens).

## Källor

Se `kallor.json`: Livsmedelsverket, 1177, NNR2023 (energitäthet), chemicalbook/PubChem
(molekylstruktur), Wikipedia (bakgrundskontroll). Ingen Gleerups-referens någonstans.

## Test (kört, se `/tmp/sc/maten-test/`)

- `bygg_alla.py`: felfritt, alla 9 steg (körning loggad).
- Playwright, alla 13 huvudsidor × 1280px + 390px: **0 konsolfel** (bortsett från ett
  sajtgemensamt, redan existerande `images/chemistry.jpg`-404 i `css/style.css`, oberoende av
  detta kapitel) och **0 horisontell overflow** efter två fixar (se nedan).
- axe-core, samma 13 sidor: **0 nya allvarliga/kritiska träffar.** Studieguiden har 5×
  `nested-interactive` (lyssna-knapp i `<summary>`) – dokumenterad, sajtgemensam, avsiktligt
  uppskjuten begränsning i CLAUDE.md ("görs tillsammans med Jesper"), samma mönster som i alla
  12 andra studieguider. Korsordet har 2 moderate landmark-varningar ärvda från den delade
  `elektrokemi/korsord.html`-mallen.
- Två egna buggar hittade och fixade under test: (1) `begreppslista.html`s tabellkolumn hade
  `white-space:nowrap` som fick "Essentiell aminosyra" att svämma över på mobil – fixat med en
  `@media`-regel i `bygg_sidor.py`. (2) Bingots CSS-grid (`1fr`-kolumner) kunde svämma över på
  mobil pga CSS Grids min-content-standard – fixat med `minmax(0,1fr)` + `min-width:0`.
- Även en tidigare bugg i `bygg_maten.py`: alt-texter med literala citattecken (t.ex. `"CH3"`)
  bröt sönder `alt="…"`-attributen i HTML:en. Fixat med `html.escape()` i `card_html()`.
- 3D-visaren testad visuellt (skärmdumpar av flera molekylkort): roterbar, korrekt färgade atomer,
  ingen konsolfel. Stärkelse/cellulosa-kontrasten och fettsyrans "knäck" är tydliga.
- Språkbyte testat på engelska, spanska och arabiska: kärnbegrepp visar `namn_native` +
  översatt definition, sekundära termer visar bara översättning (som avsett – inget klick-svar
  på svenska).
- Kontrast: nya färgerna `--area-strong: #9a3412` (7.3:1 på vitt) och `--area: #c2410c` (5.2:1 på
  vitt) uppfyller AA (≥4.5:1). Ingen sajtkonflikt: bläddrat igenom alla områdens `--area`/
  `--listen-color` och valt en ny, orange/brun ton (mat-tema) som inte finns någon annanstans.
- PNG-reserver: alla 12 genererade, inga tomma filer.

**Ej gjort/ej verifierat:** ingen mänsklig granskning av pedagogiskt innehåll (Jesper sov). Inga
skärmläsartester med faktisk skärmläsare (bara axe-core, automatiserad). `cellobios`-SMILES
(se ovan) är en rimlig men inte dubbelkontrollerad härledning.

## Kvarstående/möjligt framtida arbete

- Jesper bör läsa igenom studieguidens 5 milstolpar innan eleverna använder den.
- `nested-interactive`-frågan (lyssna-knapp i `<summary>`) är sajtgemensam och löses lämpligast
  över alla områden samtidigt, inte bara här.
- Om Jesper vill ha fler instuderingsfrågor/mer omfattande övningsprov går det att utöka
  `data_fragor.py` utan att röra något annat.
