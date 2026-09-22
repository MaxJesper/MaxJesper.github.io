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

## Kvarstående/möjligt framtida arbete (från natten – delvis inaktuellt, se ombyggnaden nedan)

- ~~Jesper bör läsa igenom studieguidens 5 milstolpar innan eleverna använder den.~~ Gjort – se nedan.
- `nested-interactive`-frågan (lyssna-knapp i `<summary>`) är sajtgemensam och löses lämpligast
  över alla områden samtidigt, inte bara här. Gäller nu även `.deepen`-rutorna (se nedan).
- Om Jesper vill ha fler instuderingsfrågor/mer omfattande övningsprov går det att utöka
  `data_fragor.py` utan att röra något annat.

---

## Ombyggnad efter Jespers feedback (22 sep 2026)

Jesper läste igenom natten-versionen och gav detaljerad pedagogisk feedback (citerad i sin helhet i
uppdraget). Kärnan: Gleerups nivå är rätt, fotosyntes/cellandning tar för mycket plats, kolhydrat-
avsnittet är bra som det är, fett och protein behöver stegas i komplexitet (ord → schematisk bild →
strukturformel), och gula rutor ska vara sällsynta och bara ligga i högermarginalen. Nedan: exakt
vad som ändrades.

### Struktur: 5 → 4 milstolpar

- **Borttagen egen milstolpe:** "Fotosyntes och cellandning". Ersatt med EN mening i inledningen till
  nya M1: "Växter bygger druvsocker och stärkelse genom fotosyntesen, som du redan känner till från
  tidigare." Cellandning nämns inte alls längre i kapitlet (för mycket redan tjatat om, enligt Jesper).
- **Ny numrering:** M1 Kolhydrater (var M2), M2 Fetter (var M3), M3 Proteiner (var M4), M4
  Sammanfattning + vitaminer/mineraler + spelet (var M5, nu även med vitaminer/mineraler-text som
  tidigare bara nämndes i förbigående).
- Alla ankare (`#m1`–`#m4`), `data_begrepp.py` (`BEGREPP`s `"m"`-taggar, `CHECKLISTA`),
  `data_fragor.py` (`INSTUDERING`- och `PROV`-grupper) och `bygg_index.py` (startsidans
  milstolpe-lista och "Inläsningstips") uppdaterade i samma steg. Begreppen "Fotosyntes" och
  "Cellandning" TOGS BORT helt ur `BEGREPP`/`KORT`/korsordets `CLUES` (testas inte längre i det här
  kapitlet – de nämns bara i en mening utan att vara ett eget begrepp att lära sig här). De 2
  instuderingsfrågorna och 3 provfrågorna som testade fotosyntes/cellandnings-formler/samband är
  borttagna (innehållet testas inte längre).

### M1 Kolhydrater – ombyggd

- Ny **tabell** (`.sugar-table`, ny klass i `src/studieguide.css`) med förenklade formler för
  monosackarider (glukos, fruktos, galaktos) och disackarider (sackaros, maltos, laktos) – "lagom
  nivå" enligt Jesper, ingen bild krävdes för denna del.
- **Ny molekyl/bild:** detaljerad glukosstrukturformel (`ring_glucose_detailed_svg` i
  `bygg_maten.py`) med alla fem ringkolatomer numrerade och VARJE kolatoms H OCH OH-grupp utsatt för
  sig – ligger i `.m-side` bredvid tabellen, återanvänder samma 3D-kulmodell som den vanliga glukosen
  (`detailed_glucose_card_html()`, ny funktion). Detta är den "detaljerade + 3D för en av dem"-bilden
  Jesper bad om.
- **Ny molekyl:** `glukos_oppen` (öppen kedja, aldehydform) – SMILES från ChEBI (CHEBI:42758,
  aldehydo-D-glukos), verifierad med RDKit mot PubChem CID 107526:s IUPAC-namn
  (2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal (CIP-analys i RDKit gav exakt samma stereodeskriptorer).
- **Nya molekyler:** `ribos` och `deoxiribos` (öppen kedja) – SMILES från Chemicalbook (CAS 50-69-1
  respektive 533-67-5), verifierade med RDKit CIP-analys mot de etablerade konfigurationerna
  (2R,3R,4R)-2,3,4,5-tetrahydroxypentanal (ribos) och (3S,4R)-3,4,5-trihydroxypentanal (deoxiribos).
  Molekylformlerna stämmer (C5H10O5 respektive C5H10O4, en syreatom mindre på C2).
- **Två nya `.deepen`-rutor** (hopfällda som standard, se "Fördjupningsrutor" nedan):
  1. "Glukos kan vara både rak och ringformad" – flyttad från huvudtext, visar `glukos_oppen`-kortet.
  2. "Fler viktiga sockermolekyler i organismerna" – ribos/deoxiribos-korten + två meningar om att de
     tillsammans med fosfat är ryggraden i RNA/DNA.
- Stärkelse/cellulosa-jämförelsen (maltos/cellobios, byggd i natt) är OFÖRÄNDRAD i huvudtexten –
  Jesper pekade ut den som kärnan i provfrågan och redan på "lagom nivå".
- **Tillägg 22 sep 2026 (kväll):** Jesper bad om en bild av ett ölglas i högermarginalen intill
  maltsocker, med en given bildtext om ölbryggning (korn gror → torkas/rostas → vört lakas ur →
  kokas med humle → jäser, jästsvampen omvandlar maltsockret till etanol och koldioxid). Bilden
  (`Ölglas.png`, AI-genererad, Jespers Hämtade filer) beskuren och skalad till
  `images/kemi/matens-kemi/foton/olglas.jpg` (700×561, ny undermapp `foton/` för fotorealistiska
  bilder, jämför `strukturformler/` och `kulmodeller/`; ingen EXIF fanns i originalet, ingen i
  kopian). Ny `illust()`-anrop i `bygg_studieguide.py` (samma helper som redan användes för
  fett-översiktsbilden), staplad i `.m-side` direkt under glukoskortet i samma rad som
  sockertabellen (tabellen listar just "Maltos (mältsocker)"). Alt-text beskriver bilden
  (glas, skum, säd), figcaption är Jespers text ordagrant.

### M2 Fetter – helt ombyggd, tre steg i tur och ordning

1. **Ord:** kort text om vad fett är, var det finns (smör, olja, nötter, ost, fet fisk) och vad det
   används till i kroppen (energilager, isolering, cellmembran).
2. **Ny SCHEMATISK bild** (`fat_overview_svg()`, ny funktion i `bygg_maten.py`, ren SVG-kod, EGEN
   design – ingen bild har tittats på eller kopierats från Gleerups): en tjock blågrå "E"-form
   (glycerol, märkt "G") med tre armar, var arm har ett färgat rektangulärt block (fettsyra). Den
   mittersta har en tydlig pilspets-knäck i formen (antyder omättad) och en annan färg (turkos mot
   orange) – form OCH färg OCH textetikett ("Fettsyra 1/2/3", "(mättad)"/"(omättad – knäck)")
   särskiljer, färgblindsäkert. Ligger i `.m-side`.
3. **Strukturformel:** `triglyceride_svg()` i `bygg_maten.py` RITADES OM helt: glycerolstommen har nu
   generöst mellanrum (170 px/steg i stället för 60), och alla tre esterbindningarnas karbonylsyre
   (C=O) är ritade med EXAKT samma geometriska offset rakt uppåt från karbonylkolet – "lika" och lätta
   att jämföra, som Jesper bad om. Ingen textetikett för esterbindningen längre (som i natt-versionen)
   – den ritas nu som en riktig bindning (dubbel linje) precis som övriga bindningar i husstilen.
- Mättat/omättat-avsnittet kortades inte ner nämnvärt (var redan kort) men flyttades efter
  strukturformeln, som Jesper bad om (ord → bild → formel → detaljer).
- `viktigt()`-rutan om glycerol/butanol flyttades till `.m-side` (se nedan).

### M3 Proteiner – helt ombyggd

- **Ord:** vad protein är, i en kort mening.
- **Ny funktionslista** (`fn_list()`, ny `.fn-list`-klass): fyra funktionstyper med minst ett
  källbelagt exempel var – byggnadsmaterial (kollagen/keratin), muskelrörelse (aktin/myosin), enzym
  (amylas, kopplat tillbaka till stärkelseavsnittet i M1) och hormon (insulin). Källor: Livsmedelsverket
  (allmän fakta om funktionsproteiner) + Wikipedia (bakgrundskontroll av namnen) – se `kallor.json`
  och referenslistan i studieguiden.
- **Ny SCHEMATISK bild** (`protein_bead_chain_svg()`, ny funktion, ren SVG-kod, EGEN design): åtta
  färgade kulor (bokstav A–H på varje, färgblindsäkert) i en rak kedja till vänster, samma kulor
  hopvecklade i en tät, icke-korsande "orm"-bana (2×4-rutnät) till höger, med etiketterna "Kedja av
  aminosyror" → "Veckad till sin form". Medvetet abstrakt, ingen riktig aminosyrakemi i bilden.
- **Flyttat till en NY `.deepen`-ruta:** "Peptidbindningen – hur två aminosyror sätts ihop" –
  glycin/alanin/cystein-korten (byggda i natt, strukturformler med R-grupper) och dipeptid-kortet
  (med gulmarkerad peptidbindning) ligger nu HÄR, inte i huvudtexten. Huvudtexten nämner bara att
  aminosyror binds med en peptidbindning, i ord, utan strukturformel.
- Essentiella aminosyror och denaturering: kvar i huvudtext, kortade inte ytterligare (var redan korta).
- `viktigt()`-rutan "Enzymer ÄR proteiner" behölls (kopplad till enzym-exemplet i funktionslistan) och
  flyttades till `.m-side`.

### M4 Sammanfattning, vitaminer, mineraler

- Stärkelse (växt) vs glykogen (djur): oförändrad, redan kort.
- **Ny, mycket kort** vitamin-/mineraltext (2–3 meningar, inga doser, inga uttömmande listor): vad
  vitaminer/mineraler i stort är bra för och exempel på var man hittar dem (C-vitamin i frukt/grönt,
  D-vitamin i fet fisk/solljus, kalcium i mejeriprodukter, järn i kött/baljväxter).
- Ny, tydlig callout-ruta som länkar vidare till `/spel/hastkapplopning/` (byggs om parallellt av en
  annan agent – INTE testat här, bara länkat till).

### Gula `.viktigt`-rutor: från flera i löptexten till exakt 3, alla i `.m-side`

Gick igenom alla `.viktigt`-rutor från natten och behöll bara de som är "får inte missas":

1. **M1:** Stärkelse/cellulosa är uppbyggda av glukos, INTE fruktos (vanlig missuppfattning).
2. **M2:** Fettets alkohol är alltid glycerol, ALDRIG butanol (vanlig missuppfattning).
3. **M3:** Enzymer ÄR proteiner, inte en egen sorts ämne.

Alla tre ligger nu i en `.m-side`-kolumn (ny `row()`-hjälpfunktion i `bygg_studieguide.py` som bygger
en fullständig `.m-row` med `.m-lead` + `.m-side`), aldrig i löptextens `.m-lead`/`.m-rest`. Detta är
en medveten, dokumenterad AVVIKELSE från sajtens normala regel (gula rutor kan annars ligga var som
helst i löptexten) – gäller BARA det här kapitlet, `css/viktigt.css` (den delade filen) är oförändrad.
En liten breddjustering för `.viktigt` i den smala `.m-side`-kolumnen lades till i
`src/studieguide.css` (mindre padding/font-size), testad och ser bra ut ner till 390 px.

### Fördjupningsrutor: `.deepen`, INTE en ny `.fordjupning`-klass (avsiktlig avvikelse från uppdraget)

Uppdraget bad om en ny klass `.fordjupning`. Under research hittade jag att sajten REDAN har en
etablerad, delad komponent för exakt detta syfte: `.deepen` (används redan i
`kol-och-kolforeningar`, `kemi-som-amne` och `separationsprocesser`, med bas-CSS `<details
class="deepen"><summary>…</summary>…</details>`, `::before { content: "★ Fördjupning:" }` satt per
kapitel). Den skiljer sig från `.wonder` (öppna frågor utan facit) på exakt det sätt Jesper vill:
fällbar, extra innehåll MED förklaring/facit.

**Beslut:** återanvände `.deepen` i stället för att skapa en ny, parallell klass. Skäl:
- `.deepen` är redan kopplad till `js/lyssna.js` (`css/style.css` rad ~465–487): varje
  `<details class="deepen">` får AUTOMATISKT en "🔈 Lyssna"-knapp (text-till-tal) i sin `<summary>`,
  precis som milstolparna. En ny `.fordjupning`-klass hade INTE fått detta gratis.
- `.deepen` är redan tangentbords- och skärmläsartestad i tre andra kapitel (samma `<details>`-mönster
  som uppdraget bad om, bara med en annan klassnamn).
- Innehållet i `src/studieguide.css` (ny fil, läses in av `bygg_studieguide.py` och infogas som ett
  extra `<style>`-block) sätter en EGEN ikon/rubrik för just det här kapitlet: `🔍 Fördjupning:` (i
  stället för `★ Fördjupning:`), vilket täcker Jespers stilönskan utan att behöva en ny klass.
- Enda konsekvensen: `nested-interactive`-varningen (lyssna-knapp i `<summary>`, redan dokumenterad
  sajtgemensam avvikelse) syns nu på fler element (3 `.deepen` + 4 `.milestone` = upp till 7 möjliga
  noder, axe-core rapporterade 6 i test). Detta är SAMMA känd, redan accepterad begränsning som redan
  fanns för `.milestone`, bara fler instanser av den – ingen ny FELKATEGORI.

Om Jesper ändå vill ha en helt separat `.fordjupning`-klass (utan lyssna-knapp, utan att dela kod med
de andra kapitlens fördjupningar) går det att byta ut senare – bara att döpa om klassen i
`src/studieguide.css` och `bygg_studieguide.py`s `deepen()`-funktion.

Tre `.deepen`-rutor i kapitlet, alla hopfällda som standard (testat både via `d.open` på sidladdning
och via faktisk Tab+Enter-tangentbordsnavigering):
1. M1: "Glukos kan vara både rak och ringformad".
2. M1: "Fler viktiga sockermolekyler i organismerna" (ribos/deoxiribos).
3. M3: "Peptidbindningen – hur två aminosyror sätts ihop" (glycin/alanin/cystein/dipeptid).

### Nya källor (utöver `kallor.json`)

- ChEBI (EMBL-EBI), CHEBI:42758 – aldehydo-D-glukos SMILES, korsverifierad mot PubChem CID 107526.
- Chemicalbook, CAS 50-69-1 (D-ribos) och CAS 533-67-5 (2-deoxi-D-ribos) – SMILES.
- Livsmedelsverket + Wikipedia – bakgrund för proteinexemplen (kollagen, keratin, aktin, myosin,
  amylas, insulin) och för att ribos/deoxiribos är RNA/DNA:s ryggrad.

### Övriga fixar under ombyggnaden

- `bygg_korsord.py`: en redan existerande men sovande bugg i `CLUES` upptäcktes när ordurvalet
  ändrades (färre ord totalt efter att Fotosyntes/Cellandning togs bort) – tre ledtrådar råkade
  innehålla sitt eget svarsords 5-bokstavsstam (`fruktsocker`→"fruktos", `sackaros`→"disackarid",
  `aminogrupp`→"aminosyra"), vilket en `assert` i skriptet upptäcker och stoppar bygget på. Omskrivna
  utan att avslöja svaret; testat med tre separata slumpkörningar utan fel.
- `bygg_index.py`: startsidans "Inläsningstips" och bildtext nämnde fotosyntes/cellandning som om de
  fortfarande var egna avsnitt – uppdaterat i linje med den nya strukturen.

### Test efter ombyggnaden

- `bygg_alla.py`: felfritt, alla 9 steg.
- Playwright-skärmdumpar av HELA studieguiden vid 1280 px och 390 px, både med milstolpar och
  `.deepen`-rutor expanderade: bekräftat (a) M1 fotosyntes nedbantad till en mening, (b) glukos har
  både tabellform OCH detaljerad strukturformel+3D synliga i huvudtexten, (c) ring/rak-glukos och
  ribos/deoxiribos ligger i hopfällda `.deepen`-rutor, (d) fett-avsnittet visar ord → E+block-bild →
  symmetrisk triglycerid-strukturformel i rätt ordning, (e) protein-avsnittet visar
  funktionstyper+exempel + kul-kedja-bilden, peptidbindningen i en `.deepen`, (f) vitaminer/mineraler
  är korta och länkar till spelet, (g) exakt 3 gula rutor, alla i högerkolumnen.
- Ingen horisontell sidscroll vid 390 px eller 1280 px, även med allt expanderat (`document.
  documentElement.scrollWidth - window.innerWidth === 0` i båda fallen).
- axe-core (samma 12 sidor som i natt + startsidan): 0 NYA felkategorier. `studieguide.html` har
  fortfarande bara `nested-interactive` (samma dokumenterade, sajtgemensamma avvikelse som innan,
  bara fler noder – se ovan). `korsord.html` har fortfarande samma 2 `moderate`
  landmark-varningar från den delade mallen. Inga andra sidor har några träffar.
- Tangentbord: `.deepen` är riktiga `<details>`, testat att fokusera `<summary>` och trycka
  Enter/mellanslag för att öppna/stänga – fungerar, precis som `<details class="milestone">`.
- Kontrast: E+block-bildens tre färger och kul-kedja-bildens åtta kulfärger kontrollerade mot vit
  bakgrund (räknat med WCAG-formeln). Alla klarar ≥3:1 (grafik) och den vita texten ovanpå varje
  färgad yta klarar ≥4.5:1 – en första version av den orangea fettsyra-färgen (#c2680f, 3.98:1 med
  vit text) mörkades till #a5570c (5.3:1) för att klara textkontrastkravet.
- Interna ankare/länkar (`studieguide.html#m1`–`#m4`) verifierade i `index.html`, `begrepp.json`
  (concept-popupens "gå till avsnitt"-länk) och checklistan – alla stämmer med den nya numreringen.

### Osäkerheter / vad Jesper bör bedöma

- **Design-distinkthet mot Gleerups:** jag har INTE sett Gleerups bild (följde instruktionen att inte
  leta efter den). E+block-bilden är en egen tolkning: en enkel, geometrisk "E" byggd av rektanglar
  (ingen handritad/organisk linjeform), med en pilspets-formad kink på mittblocket och textetiketter
  inbäddade i själva blocken (inte som separata pratbubblor). Kul-kedja-bilden använder ett strikt
  2×4-rutnäts-"orm"-mönster för den veckade formen, inte en fri/organisk klump eller en helix – en
  ganska teknisk/schematisk stil snarare än biologiskt naturtrogen. Jag bedömer risken för
  förväxling som låg, men Jesper är bäst lämpad att avgöra om det känns tillräckligt eget.
- `.deepen`-återanvändningen (i stället för ny `.fordjupning`-klass) är en avvikelse från uppdraget,
  motiverad ovan – flagga om Jesper ändå vill ha en helt fristående klass.
- Ingen mänsklig granskning av den nya pedagogiska texten (proteinfunktionerna, vitamin-/mineraltexten)
  utöver mig själv och de källor som anges.
