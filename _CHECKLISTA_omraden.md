# Checklista & backlog – NO-plattformen

*Autogenererad 2026-08-23 av Claude. En sanningskälla: standarder, status per område och öppna punkter. Ersätter de gamla _TODO-filerna. Be Claude regenerera vid nya områden/funktioner.*

## Arbetssätt & mål

Först bygga ut alla ~29 områden, sedan strömlinjeforma. Ny funktion → in i alla nya områden framåt OCH bakåtfyllas i tidigare. Jesper slutgranskar all text själv och pushar alltid själv. Källa per område: Gleerups + TEFY (TEFY finns för kemi/fysik); Claude skriver EGEN text (kopierar aldrig), TEFY-stil. Helöversättning av studieguider är ett senare steg – svenska texten godkänns först.

## Standardkomponenter per område

**Kärn-HTML (13):** `index.html`, `studieguide.html`, `begreppslista.html`, `begreppskort.html`, `checklista.html`, `instuderingsfragor.html`, `instuderingsfragor-print-elev.html`, `instuderingsfragor-print-larare.html`, `ovningsprov.html`, `ovningsprov-print.html`, `facit.html`, `facit-print.html`, `larande-spel.html`. **Rekommenderad:** `korsord.html`. **Vid fysiska laborationer (nytt, sep 2026):** `laborationer.html` eller `<tema>lab.html` – utskrivbar HTML enligt "Laborationsprotokoll"-mönstret i CLAUDE.md (aldrig docx), länkad från studieguidens next-steps OCH index.html/"Material för läraren". **Kreativa/kognitiva utmaningsfrågor (nytt, sep 2026):** öppna, gärna tvärvetenskapliga frågor utan givet facit, för elever som snabbt når målen och behöver stimulans. Byggs som `<details class="wonder">` i studieguiden – klassen finns redan implementerad och stylad (etikett "» Fundera vidare:", teal ruta, ev. avslutande `<p class="frontier">` för en riktigt öppen forskningsfråga) i kemi/kol-och-kolforeningar/studieguide.html. Minst 1 per område, gärna en som kopplar till ett annat NO-ämne eller till verkliga konsekvenser, och avsluta med en uppmaning att själv ta reda på svaret.

**Data (5):** `data/begrepp.json`, `data/begreppskort.json`, `data/checklista.json`, `data/instuderingsfragor.json`, `data/ovningsprov.json`.

**Språk (10):** en, es, ar, so, fa, am, ps, pl, bs, ur.

**Regler (CLAUDE.md):** utskrift bara via knapp i moderdokument (ej index-länk); index tvåkolumn (area-main + area-right med hero + begrepp); begrepp 12–16+ (`data-concept` = `namn` exakt); begreppskort via larande-spel; lyssna per milstolpe; originalitet + källförteckning; mallar: kraft-och-rorelse, periodiska, genetik, liv-och-cellen.

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
| biologi/liv-och-cellen | 13/13 | 5/5 | 0/10 | ✗ | ✗ |
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
| kemi/atomer | 13/13 | 5/5 | 0/10 | ✗ | ✗ |
| kemi/elektrokemi | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| kemi/jonforeningar | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/kol-och-kolforeningar | 12/13 | 4/5 | 0/10 | ✗ | ✗ |
| kemi/kemi-som-amne (Ämnet kemi) | 15/15 (+sakerhetsintyg, rapportmall, laborationer) | 7/7 | 11 (begrepp+termer) + checklista ar/am/rw | ✓ | ✗ |
| kemi/matens-kemi | 1/13 | 0/5 | 0/10 | ✗ | ✗ |
| kemi/periodiska-systemet | 13/13 | 5/5 | 10/10 | ✓ | ✗ |
| kemi/separationsprocesser | 13/13 | 5/5 | 10/10 (+rw) | ✓ | ✗ |
| kemi/syror-och-baser | 13/13 | 5/5 | 10/10 | ✗ | ✗ |

## Öppna punkter (backlog)

### Klart

- Fullständiga områden: elektricitet, kraft-och-rorelse, magnetism-induktion, universum, elektrokemi, periodiska-systemet, syror-och-baser, genetik, liv-och-cellen, **kemi/kemi-som-amne (nytt 21 sep 2026: 15 sidor inkl. säkerhetsintyg med 10 kontrollfrågor, rapportmall, 6 laborationer, 13 dra-och-släpp-övningar, bingo, korsord, 11 språk + checklista ar/am/rw – AI-översatt, ej korrekturläst; labbutrustnings-fotospel med 33 föremål klart)**, **separationsprocesser (nytt 20 sep 2026: 13 standardsidor, studieguide med 9 milstolpar, partikelsimulator, Välj metod, bingo, korsord, 7 laborationer, 11 språk – översättningarna AI-genererade, ej korrekturlästa)**.

- Flerspråk (10 språk inkl. urdu) i 7 fysik/kemi-områden. Namnstandard utskrifter enhetlig.

### Nya grunder byggda (behöver kompletteras)

- **kemi/atomer (åk7, sep 2026):** komplett standarduppsättning (13/13 HTML, 5/5 data) + `ovningsverktyg` (11 dra-och-släpp-sorteringar, 7 balanseringar, Räknemaskinen), `bygg-molekyl` (8 uppgifter), `formelark` (utskrivbart arbetsblad med facit: stor vs nedsänkt siffra), studieguide med 6 milstolpar, bred bildkolumn och roterbar 3D i molekylkorten. Inspirerat av (aldrig kopierat från) Gleerups Titano kemi och Enkel NO. Översättningar av begreppslistan (11 språk, `data/begrepp.<prefix>.json`) och inline-översättning (`concept-inline`, termer) klara 20 sep 2026. Återstår: begreppsbingo, ev. korsord, lyssna-ljudfiler (TTS används), mp3.

- **kemi/kol-och-kolforeningar (åk8):** studieguide (9 milstolpar, uppdaterad med valensregel/nanorör-grafen/metanolförgiftning), begrepp (28), index (med översiktsbilder), lärande spel, checklista, instuderingsfrågor (+print elev/lärare), övningsprov+facit (+print), begreppslista klara. Återstår: begreppskort (görs ev. via lärande-spelet istället för egen sida, se mönster i CLAUDE.md), översättningar. Källa: TEFY + Gleerups + Enkel Kemi (uppladdade PDF:er).

- **liv-och-cellen:** komplett struktur klar. Filmerna inlagda (komprimerade 250x + 400x i `film/`). Återstår: översättningar (`begrepp.<språk>.json`) + toffeldjursbild (`images/biologi/liv-och-cellen/toffeldjur.jpg`).

### Städning kvar

- `kemi/periodiska-systemet/begrepp.json` (rot-dubblett) + gammal `sprak/`-mapp. `biologi/genetik/backupfile.html`/`backupindex.html`.

### Sprid funktioner – USP/funktionsmatris (sanningskälla, sep 2026)

**REGEL:** Så fort en ny funktion eller USP beslutas gälla brett (inte bara ett enskilt område) ska den läggas till som en NY RAD i matrisen nedan samma session den beslutas — inte bara nämnas i chatten eller i Claudes minne. Det är den här matrisen, inte minnet, som är den faktiska säkringen mot att kvaliteten blir spretig mellan områden. Innan ett område räknas som "klart" ska dess kolumn stämmas av mot matrisen.

Tecken: ✓ = klart · ✗ = saknas, ska in · – = inte tillämpligt för området · ? = okontrollerat (behöver verifieras mot faktiska filer, gissa inte)

| Funktion / USP | elektricitet | kraft-o-rorelse | magnetism-ind | universum | elektrokemi | periodiska | syror-baser | genetik | liv-o-cellen | kol-o-kolfor | atomer | ekologi | arb-energi-eff | Ämnet kemi (kemi-som-amne) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TTS-uppläsning + begreppsöversättning (begrepp.<prefix>.json, 11 språk) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ (TTS ✓, översättning ✗) | ✗ | ? | ✓ |
| Begreppsöversättning VID LÄSNING (klickbara ord inline, +termer-nivå, 11 språk; STÅENDE REGEL för alla nya studieguider) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – (ingen studieguide än) | ✓ | ✓ |
| Knappar: navigering + utskrift ÖVERST (`.page-actions`, `css/knappar.css`) + AA-kontrast (sajtövergripande, genomgånget 20 sep 2026) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kemikartan: cirkulär innehållskarta som områdets framsida (valfritt mönster, byggt 21 sep 2026) | – | – | – | – | – | – | – | – | – | – | – | – | – | ✓ |
| Kontrollfrågor klicka-för-svar (.check-q, beräkningstunga områden) | – | ✗ (beslutad kandidat) | – | – | – | – | – | – | – | – | ✓ (.check-q i alla sex milstolpar) | – | ✗ (beslutad kandidat) | ✓ (.check-q i studieguiden + 10 kontrollfrågor i säkerhetsintyget) |
| Interaktiva 3D-molekylmodeller (3Dmol.js) | – | – | – | – | ? | – | ? | – | – | ✓ | ✓ (live i molekylkorten) | – | – | – |
| Räknekort (formel → uträkning → svar) | ✓ (Ohms lag) | ? | ✓ (transformator) | – | – | – | – | – | – | – | – | – | ✓ | ✓ (densitet, calc-box) |
| Eget lärande-spel (minst ett) | ? | ✓ | ? | ? | ? | ? | ? | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (storheter) | ✓ |
| Begreppsbingo (+ ev. lagläge) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (+lag) | ✗ | ✗ | ✓ (+lag) | ✗ | ✓ |
| WCAG 2.2 AA-granskad | ? | ? | ? | ? | ? | ? | ? | ? | ? | ✓ (pilot sep 2026) | ✓ (axe + kontrast sep 2026; delade fel kvar, se CLAUDE.md) | ✗ | ? | ✓ (axe + kontrast sep 2026; delade fel kvar, se CLAUDE.md) |
| Källförteckning i studieguiden | ? | ? | ? | ✓ (mall) | ? | ? | ? | ? | ? | ✓ | ✓ | – (ingen studieguide än) | ? | ✓ |
| Kreativa/kognitiva utmaningsfrågor (`.wonder`, öppna/tvärvetenskapliga, minst 1/område) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (2 st) | ✓ (.wonder/.frontier i M1, M3, M4, M6) | ✗ | ✗ | ✓ (.wonder/.frontier i flera milstolpar) |
| Live-3D i studieguiden (molviewer; korta kapitel) | – | – | – | – | – | – | – | – | – | – | ✓ | – | – | – |
| Dra-och-släpp-övningar (`dra-och-slapp.js`, tillgänglig; gamla HTML5-DnD-spel ska migrera) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ (13 övningar) |
| Formelverktyg (`formelvisare.js`: verkstad, balansera, Räknemaskinen) | – | – | – | – | – | – | – | – | – | – | ✓ | – | – | – |
| Utskrivbart formelark: stor vs nedsänkt siffra (`formelark.html`) | – | – | – | – | – | – | – | – | – | – | ✓ | – | – | – |
| Checklista översatt till arabiska, amhariska, kinyarwanda (`data/checklista.<ar\|am\|rw>.json`; visas under svenskan när språket valts i språkväljaren; AI-översatt, ej korrekturläst; STÅENDE REGEL: ny checklista → nya språkfiler + `concept-lang-selector.js`-etikett) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – (ingen checklista än) | ✓ | ✓ |
| Säkerhetsintyg med interaktiva kontrollfrågor + utskrivbart intyg (`kemi/kemi-som-amne/sakerhetsintyg.html`; länkas från fysik- och biologi-hudsidorna) | – (gemensamt, ligger i kemi-som-amne) |
| Rapportmall för laborationsrapport (utskrivbar, `rapportmall.html`; bygger på vetenskaplig metod, gäller alla NO-ämnen) | – (gemensamt, ligger i kemi-som-amne) |
| Labbutrustnings-fotospel (`kemi/kemi-som-amne/labbutrustning-spel.html`; fågeltävlingens mönster, Jespers egna foton, två lägen: foto→namn och beskrivning→namn; symbol+text, tangentbord 1–4) | ✓ (kemi/kemi-som-amne, 33 föremål inkl. våg och termometer, byggt 21 sep 2026; fotogalleri i M6; kan utökas med fler foton) |

**Checklistöversättning (20 sep 2026):** gäller alla 15 checklistor (även hjarta-blod-lungor, materia och separationsprocesser som saknar egen kolumn). Övriga åtta språk (so, fa, ps, pl, bs, es, ur, en) saknar ännu checklistöversättning – Jesper har bara efterfrågat ar, am, rw tills vidare.

**Öppet, ej i matrisen än:** ekologi och arbete-energi-effekt saknar egna kolumner i statusöversikts-tabellen ovan trots att båda har betydligt mer byggt än "1/13" antyder (ekologi: tavling/fåglar/bingo-lag/trad-och-blad; arbete-energi-effekt: studieguide+räknekort) — hela statusöversikten ovan är från 2026-08-23 och bör regenereras mot faktiska filer i repot, inte bara mot minnet, innan den littas på fullt ut. Flaggat som backlog, inte gjort. **Nytt sep 2026:** Jesper efterlyste fler "wonder"-frågor (kreativ/kognitiv stimulans, t.ex. hans exempel om varför vattenmolekylen är vinklad jämfört med koldioxid, och konsekvenserna för livets utveckling) – detta visade sig redan finnas som ett färdigbyggt, stylat mönster (`.wonder`) i kol-och-kolforeningar men användes bara en gång och stod inte med i matrisen. Vattenexemplet är nu inlagt där som en andra `.wonder`-ruta. Kvarstår: bygg minst en `.wonder`-fråga i varje övrigt område.

### Konkreta byggen

- **Kursplanetäckning kemi åk 7–9 (analys 20 sep 2026):** se `_KURSPLAN_kemi_tackning_2026-09-20.md`. Största luckorna: ~~Separationsprocesser (tomt)~~ (BYGGT 20 sep 2026, se CLAUDE.md), Vatten och lösningar, Jonföreningar (bara lab), Matens kemi (kolhydrater saknas), Kemi i miljön (kolets kretslopp, växthuseffekt, vattenrening, miljögifter), Produkter och material (läkemedel, funktionsmaterial, livscykel) samt tvärgående: undersökningsmetodik, digitala verktyg, källkritik, kemihistoria, argumentation.

- **Byt språkväljarens etiketter (påminnelse, Jesper 20 sep 2026):** i `js/concept-lang-selector.js` ändras `STOD` till `'begrepp+checklistor'` när ALLA checklistor är översatta (11 språk) och korrekturlästa, samt `ENGELSK_HELA = true` när hela siten finns på engelska och är godkänd. Tills dess står "(begrepp)" efter språken. Checklistesidorna behöver då också få samma språkväljare (`concept-lang-selector-mount`).

- **Kemi-hudsidan (`kemi/index.html`) byggs om (Jespers önskemål 19 sep 2026, se CLAUDE.md Idé 24):** bort med ren länksida (**KLART 21 sep 2026:** `kemi/index.html` är en vidarebefordran till kapitlet Ämnet kemi, som nu ÄR kemis ämnessida); in med uppstart + kemihistoria, faropiktogram-spel (**KLART 20 sep 2026:** `kemi/faropiktogram.html`, ritade SVG, inga foton behövdes) och labbutrustnings-spel (fågelspelets design; **KLART 21 sep 2026 i kapitlet Ämnet kemi**) samt ett **säkerhetsintyg** (**KLART 21 sep 2026:** `kemi/kemi-som-amne/sakerhetsintyg.html`, 10 kontrollfrågor + utskrivbart intyg på 2 sidor; länkas från kemi/index, Ämnet Fysik och Ämnet Biologi).

- Fanerozoikum-frågespel (biologi/evolution): porta från kraft-och-rorelse/fragespel.html (chansa/säkra, timer, poäng, lösen 'JTo').

- **Seterra-liknande spel för anatomi/kroppsdelar** (ny idé, sep 2026): klicka/placera rätt punkt i en bild när en fråga visas, tid + poängräkning (samma princip som att lära sig städer på en karta i Seterra). Gäller hjärta-blod-lungor, nervsystemet (+hjärnan) och sinnena – **inte lågprioriterat**, tvärtom ett bra sätt att lära fackord lekfullt i just dessa läroplansbundna områden. Ej påbörjat. Behöver rättighetsfria anatomiska bilder med tydligt definierade klickytor (t.ex. Wikimedia Commons/public domain-anatomiatlas, undvik det upphovsrättsskyddade uppslagsverket – se separat resonemang i chatthistoriken).

- **Fler fototävlingar i ekologi** (blommor, däggdjur, fiskar, insekter, fågel/träd-formatet): lågprioriterat, byggs när lusten faller på, ingen artgrupp eller ordning bestämd än. Annan idé än Seterra-spelet ovan – blandas inte ihop.

- Provfrågor: räkna om per nytt format; fyll där tunt.


*Större idéer (läxbank, laborationsbank, PPT, AI-coaching, nationella prov m.m.) ligger i `CLAUDE.md` under 'Idéer och påminnelser'.*

