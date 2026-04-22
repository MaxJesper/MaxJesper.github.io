# STIL.md – Riktlinjer för MaxJesper.github.io

Denna fil beskriver de konventioner och designbeslut som styr sajten MaxJesper.github.io, ett läromedel för högstadiets fysik, kemi och biologi. Läs den vid början av varje ny Cowork-session så att stilen hålls konsekvent.

Författare och lärare: Jesper Tordsson.

Sajten är ett privat verk av Jesper Tordsson och knyts **inte** till någon skola eller arbetsgivare, varken i texten, headers eller footers. Detta är ett medvetet beslut för att hålla upphovsrätten entydig hos en enskild privatperson och inte öppna för att en kommun eller arbetsgivare hävdar rätt till materialet.

---

## 1. Övergripande princip – TEFY-anda

Sajten bygger på samma pedagogiska rakhet som TEFY-serien (Studentlitteratur, 1980–90-tal). Konkret betyder det:

- **Sak först, vardag sen.** Definiera begreppet först, ge exempel därefter. Undvik "har du känt hur solen värmer din hud?"-inledningar.
- **Täta korta meningar, inget luftigt.** Hellre en precis mening än två svepande.
- **Fetstil i löpande text** på nyckelbegrepp när de introduceras. Begreppen ska återkomma i checklistan och i en sammanfattning.
- **Funktionella bilder, aldrig dekorativa.** Varje bild ska göra ett pedagogiskt jobb (schema, experiment, mönster).
- **Svenska, svensk stavning, gemen stil på rubriker efter första versal.**

Motexempel att undvika: nyare läromedel (t.ex. Gleerups) där varje nytt begrepp inleds med flera retoriska meningar och tar sidor att komma fram till en definition.

---

## 2. Mappstruktur

```
/
├── fysik/
│   ├── elektricitet/                (ström, spänning, Ohms lag, kopplingar, elsäkerhet)
│   │   ├── index.html               (områdets startsida)
│   │   ├── studieguide.html         (milstolpsbaserad lärobok light)
│   │   ├── checklista.html
│   │   ├── larande-spel.html        (Ohms-lag-spelet + cross-länkar)
│   │   ├── ohms-lag-spel.html       (själva spelet bor här – ett enda ställe)
│   │   └── data/
│   ├── magnetism-induktion/         (magneter, elektromagneter, induktion, transformator)
│   │   ├── index.html
│   │   ├── studieguide.html
│   │   ├── checklista.html
│   │   ├── instuderingsfragor.html
│   │   ├── ovningsprov.html
│   │   ├── facit.html
│   │   ├── larande-spel.html        (begreppskort, korsord, cross-länk till elektricitets spel)
│   │   ├── laborationer.html        (listsida, kort till 6 labbar)
│   │   ├── laborationshandledningar.html  (alla 6 labbar för utskrift)
│   │   └── data/
│   └── arbete-energi-effekt/        (kommande område)
├── biologi/
├── kemi/
├── images/
│   └── fysik/magnetism-induktion/
├── css/
│   └── style.css
├── js/
│   └── menu.js
└── STIL.md  (denna fil)
```

Bilder för ett område ligger alltid under `/images/<ämne>/<område>/`.

### Områdesordning i fysik

Ordningen i menyn och cross-links mellan områden:
`elektricitet` → `magnetism-induktion` → `arbete-energi-effekt` → `atomfysik`.
Elektricitet kommer alltid före magnetism-induktion eftersom magnetism/induktion bygger på begreppen ström, spänning och Ohms lag.

### Lärande spel – ett ställe per spel, cross-länkning mellan områden

Varje spelfil (t.ex. `ohms-lag-spel.html`) bor i **ett** område – det område spelet logiskt hör till. Inga duplicerade spel-HTML-filer i andra områden. Andra områden länkar till spelet via absolut sökväg (`/fysik/elektricitet/ohms-lag-spel.html`). Varje områdes `larande-spel.html` har dessutom en sektion "Spel i närliggande områden" med länkar till andra områdens palett, så eleven kan använda spel som underhållning/repetition även när det inte är områdets eget spel.

Studieguidens "Träna"-länk per milstolpe går **direkt** till rätt spel, inte till palett-sidan, när en milstolpe har ett specifikt spel. Det sparar ett klick och håller studieguidens flöde stramt.

---

## 3. Områdets startsida (`index.html`)

Strukturen är två kort, **För elever** och **För lektioner/läraren**. Studieguiden är den mest framträdande länken i elevkortet.

### Rolltoggel: Elev / Lärare

Ovanför korten ligger en diskret toggel (`.role-toggle`) med två knappar: *Elev* (standard) och *Lärare*. Väljer användaren *Lärare* sätts `data-role="larare"` på `<body>`, vilket via CSS flyttar lärarkortet överst med `order: -1`. Valet sparas i `localStorage` under nyckeln `mj.role` så att nästa besök kommer rätt. Toggeln finns på varje områdes index-sida och hålls ovillkorligen lättåtkomlig – en lärare ska kunna gå direkt till sina resurser utan att scrolla förbi elevmaterialet.

### Lärarkortets innehåll

Lärarkortet ska innehålla snabbåtkomst till allt tryckbart och facit. För magnetism-induktion: laborationshandledningar, facit, facit-print, övningsprov-elevutskrift, instuderingsfrågor-elevutskrift, instuderingsfrågor-lärarutskrift (med facit). Samma lista gäller som utgångspunkt för nya områden.

### Ingen skolkoppling i headern

Headers och footers får **inte** innehålla "Fäladsgården" eller namn på någon annan skola/arbetsgivare. Detta tillämpas genomgående; sajten är ett privat verk (se avsnitt 0 ovan).

---

## 4. Studieguide – struktur

Studieguiden är områdets "lärobok light". Den är milstolpsbaserad, inte veckobaserad, så den är tidlös och lärarneutral.

### Milstolpar

Varje område delas in i 8–15 milstolpar i ämneslogisk ordning.

**Elektricitet och Ohms lag** (12 milstolpar, område `elektricitet/`):

1. Elektrisk ström – vad rör sig i en ledare
2. Spänning – drivkraften i kretsen
3. Ledare och isolatorer
4. Resistans och enheten ohm
5. Ohms lag (U = R · I)
6. Serie- och parallellkoppling av lampor
7. Serie- och parallellkoppling av batterier
8. Kopplingsscheman
9. Effekt och energi i elektriska apparater
10. Elsäkerhet – säkring och jordfelsbrytare
11. Risker och regler i hemmet
12. Elektricitet i samhället *(Skolverks-koppling)*

**Magnetism och induktion** (15 milstolpar, område `magnetism-induktion/`):

1. Permanenta magneter
2. Magnetfält och fältlinjer
3. Jorden som magnet och kompassen
4. Magnetfält kring en elektrisk ledare
5. Spolar
6. Elektromagneter
7. Ledare i magnetfält – kraften
8. Elektriska motorer
9. Induktion
10. Generator och växelström
11. Likström och växelström
12. Transformatorn
13. Elektrisk energi och effekt
14. Från kraftverk till elapparat
15. Magnetism och induktion i samhället *(miljö/samhälle/individ, Skolverks-koppling)*

**OBS:** Elektricitetens grunder (ström, spänning, resistans, Ohms lag, kopplingar, elsäkerhet) behandlas **uteslutande** i området Elektricitet. Magnetism-induktion förutsätter dessa begrepp och får inte definiera om dem – istället länkas det förutsättande området. Atomens delar (atomkärna, elektroner) behandlas i området Atomfysik och repeteras inte i Elektricitet.

### Innehåll per milstolpe, i ordning

1. **Brödtext** – ca 150–350 ord i TEFY-stil. Fetstilsord för nyckelbegrepp.
2. **Funktionell bild** – schema, experimentfoto eller fältmönster. Ingen dekoration.
3. **Faktaruta** (blå, `.fact-box`) – *en* definition eller sammanfattning som eleven ska kunna citera. Aldrig "kul att veta"-innehåll.
4. **Nästa steg** (`.next-steps`) – två till tre länkar med etikett *Kontrollera / Träna / Öva / Laborera / Testa*. **Ligger alltid före fördjupningen** så elever som hoppar över fördjupning inte missar dem.

   Etikettkonvention:
   - **Kontrollera** – checklistan. Används i milstolpar där eleven kan stämma av om hen har greppat begreppet.
   - **Träna** – lärande spel (begreppskort, korsord, Ohms-spel). Används särskilt i begreppstunga tidiga milstolpar.
   - **Öva** – instuderingsfrågor. Passar i nästan alla milstolpar.
   - **Laborera** – laboration med anchor `#lab-N`. Används när en laboration hör till milstolpen.
   - **Testa** – övningsprov. Används från och med milstolpe 12 eller senare, när eleven har läst tillräckligt brett.
   - *Facit* till övningsprovet ligger **inte** i milstolparnas nästa steg – det hör till lärarmaterialet på områdets startsida.

   Ordet "Kolla" undviks – för talspråkligt. "Kontrollera" är det neutrala ordet.
5. **Fördjupning** (gul, `.deepen`, prefix "★ Fördjupning") – valfritt. 300–600 ord tillåtet. Självbärande: introducera själv alla begrepp som används, även om de finns i senare milstolpar. Gymnasienivå är tillåtet så länge texten räcker för att förstå utan kringläsning.

### Ton och språk

Tilltal: "du" till eleven, sällan "man". "Vi" används när Jesper som lärare visar något gemensamt ("Vi ser att…").

Formler är tillåtna men sparsamma. När en formel används ska den skrivas ut i text också: *"Effektförlusten växer med strömmen i kvadrat (P = R · I²)"*.

**VIKTIGT:** All text som hamnar på sidan är *läromedel för elever*, inte dialog med Jesper. När Jesper i chatten föreslår, gissar eller frågar om något ska det aldrig framgå av texten på sidan. Formuleringar som "Din intuition om…", "Det du undrade över…", "Det stämmer inte riktigt att…" får inte förekomma i studieguiden eller handledningarna. Texten ska vara neutralt informerande. Om ett missförstånd är vanligt bland elever kan det bemötas allmänt ("En vanlig missuppfattning är…"), men aldrig adresseras till Jesper personligen.

---

## 5. Skolverkskoppling

De nationella proven (särskilt delprov A2) har stort samhälls- och miljöfokus. Studieguiden möter detta på tre sätt:

- **Milstolpe 15** per område: "X i samhället" – grundtext för alla + fördjupning(ar) på gymnasienivå.
- **Resonera-ruta** (grön, `.resonera`) – diskret insprängd i några utvalda milstolpar. Korta uppgifter i skolverksformat: "Resonera i två led om…". Inte obligatoriskt.
- **Värderingsuppgifter** lämpade för övningsprovet.

Hållning: bekräfta att delar av skolverksformatet ligger långt från TEFY-stil (särskilt politik/etik-tunga uppgifter på A2), men träna eleven på formatet ändå. Fördjupningar och Resonera-rutor får inte drivas av politik – de ska alltid förankras i fysikaliska samband.

---

## 6. Laborationshandledningar

### Upplägg per handledning
- Rubrik: **Laboration N · Tema**
- Fält: **Syfte · Utrustning · Genomförande · Observationer · Slutsats**
- Frontsida (A4): protokoll med plats för egna anteckningar.
- Baksida (A4): relevant bild + slutsatsfält. Duplex-utskrift: en laboration = ett A4-ark.

### Hypotes – frivillig, inte rutin
"Vad tror du?"-rutor används *endast* i labbar där förhandstanken väcker nyfikenhet (t.ex. *Spolen med 600 varv eller spolen med 12 000 varv – vilken tänder lysdioden?*). I labbar där eleven inte har rimliga förutsättningar att gissa (t.ex. stavmagnet in i spole med galvanometer) är hypotes-rutan uttryckligen frånvarande, eftersom tvångshypotes är pedagogiskt dåligt.

### Utskrift
`laborationer.html` är listsidan med länkar till individuella laborationer via `#lab-1` t.o.m. `#lab-6`.
`laborationshandledningar.html` innehåller alla sex laborationer + baksidor. En fixerad utskriftsknapp överst till vänster (`.print-fab`).

Två sätt att trigga utskrift:

- **URL med `?print=1`** → auto-print av alla sex laborationer. Används från "Skriv ut alla handledningar"-knappen på listsidan.
- **URL med `#lab-N`** (N = 1..6) → endast den laborationen syns vid utskrift. Filtreringen görs via `body[data-print-only]` som sätts av JS på basis av hash, och CSS-regler i `@media print` som döljer alla andra labbar. Utskriftsknappens text uppdateras automatiskt till "Skriv ut laboration N".

Båda mekanismerna kan kombineras: `#lab-3?print=1` triggar auto-print av bara lab 3.

---

## 7. CSS och designval

Sajtens färger och typografi ligger i `/css/style.css`. Regler per komponent:

- `.milestone` – vitt kort med mjuk skugga, rundade hörn (12 px). Expanderbar via `<details>/<summary>`.
- `.fact-box` – blå vänsterkant (#2e4a8a), ljusblå bakgrund (#eef4fa).
- `.deepen` – gul vänsterkant (#d4a017), ljusgul bakgrund (#fffbe7), prefix "★ Fördjupning".
- `.next-steps` – grid av knapplika länkar med liten label "KONTROLLERA / TRÄNA / ÖVA / LABORERA / TESTA" i kapitäler.
- `.site-footer` – gemensam footer som automatiskt injiceras av `/js/menu.js`. Innehåller © och licens-länk till CC BY-NC-SA 4.0. Döljs i `@media print`.
- `.role-toggle` – rundade knappar i övre högra hörnet av index-sidan (två alternativ: Elev/Lärare). Aktivt val får blå bakgrund.
- Maxbredd på studieguiden: 820 px centrerad.

Inga externa bibliotek i produktion. Vanilj-HTML + CSS + små JS-filer för meny, footer och rendering.

---

## 8. Upphovsrätt, licens och skydd mot AI-skrapning

### Licens

Hela sajten publiceras under **Creative Commons Erkännande-IckeKommersiell-DelaLika 4.0 (CC BY-NC-SA 4.0)**. Licenslänken finns i den gemensamma footern på varje sida. Ingen separat licens-sida krävs, men licensen får aldrig försvagas eller tas bort från enskilda sidor.

Formatet i footern är alltid:

> © 2026 Jesper Tordsson · Licens: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv)  
> Fri att använda och anpassa i undervisning. Ej tillåten för kommersiella syften.

Footern byggs automatiskt av `/js/menu.js` och kräver bara att sidan har `<script src="/js/menu.js"></script>` och CSS från `/css/style.css`. Nya sidor ärver detta gratis.

### robots.txt

`/robots.txt` blockerar kända AI-tränings-crawlers (GPTBot, ChatGPT-User, CCBot, Google-Extended, anthropic-ai, ClaudeBot, Claude-Web, PerplexityBot, Applebot-Extended, Bytespider, m.fl.) men tillåter vanliga sökmotorer (Googlebot, Bingbot, DuckDuckBot). Listan utökas vid behov när nya AI-bottar dyker upp.

### Omskrivning av externt material

Varje text på sajten ska vara skriven i Jespers egna ord. Befintliga checklistor, instuderingsfrågor och begreppskort som ursprungligen importerats från Gleerups (eller annat läromedel) måste skrivas om innan de publiceras. Riktmärken för omskrivning:

- Formulera varje punkt i eget språk, inte bara byt ordföljd.
- Använd nyckelorden från studieguiden (de fetstilade termerna) så att checklistan blir en naturlig följeslagare till guiden.
- Undvik ord och vändningar som är karaktäristiska för källan.
- Lägg till en fördjupningssektion (★) i checklistan som kopplar till fördjupningstexterna i studieguiden, så att guiden och checklistan speglar varandra även på den nivån.

### Lucka-analys vid omskrivning av checklistan

Varje gång en checklista skrivs om ska man kontrollera att inget i checklistan tar upp begrepp som helt saknas i studieguiden. Om en sådan lucka hittas ska Jesper informeras: antingen utökas studieguiden, eller så flaggas punkten som "förkunskap" i checklistan med ett fält `note` på sektionen.

`data/checklista.json` stödjer ett valfritt `note`-fält per sektion, som renderas som en liten kursiv förkunskaps-markering (`.checklist-section-note` i `/css/checklista.css`). Använd det för sektioner som ligger utanför studieguiden.

---

## 9. Git och deploy

- Remote: GitHub, `main`-gren deployeras automatiskt via GitHub Pages.
- `.gitignore` innehåller `.DS_Store` och `*.bak` (sed-backups).
- Commit-meddelanden är beskrivande svenska.
- Jesper kör själv alla git-operationer i sin terminal (`~/Documents/00- GitHub-Repo`). Claude/Cowork föreslår kommandona men exekverar dem inte.

---

## 10. Instruktioner för ny Cowork-session

1. Läs först denna fil (`STIL.md`) i sin helhet.
2. Läs sedan `/fysik/magnetism-induktion/studieguide.html` som referensimplementation (hela 15 milstolpar ifyllda i TEFY-stil).
3. Läs `/fysik/magnetism-induktion/data/checklista.json` som mall för hur en checklista ska skrivas.
4. Läs `/fysik/elektricitet/studieguide.html` för att se hur stubbar ser ut innan de fylls i.
5. Om användaren inte har nämnt specifikt område, anta att fortsatt arbete gäller att **fylla elektricitets-stubbarna** (det är området som står på tur) eller att bygga nästa fysikområde (arbete-energi-effekt).
6. Vid tvivel – fråga Jesper. Pedagogiska beslut ska alltid ligga hos honom.

---

## 11. Mall för nytt område

När ett nytt område ska byggas (t.ex. `arbete-energi-effekt`) följs denna ordning:

1. **Strukturera innehållet i 8–15 milstolpar** i ämneslogisk ordning. Sista milstolpen ska alltid vara "X i samhället" (Skolverks-koppling).
2. **Skriv studieguide.html** med alla milstolpar ifyllda i TEFY-stil: brödtext → bild → faktaruta → next-steps → valfri fördjupning. Inga stubbar ska lämnas i produktion.
3. **Skriv om checklistan i egna ord** och strukturera den så att den följer milstolparna. Gör lucka-analys mot studieguiden. Lägg till `★ Fördjupning`-sektion som speglar guidens fördjupningar.
4. **Skriv om instuderingsfrågor och begreppskort** i egna ord efter samma princip.
5. **Bygg områdesindexsida** enligt mallen: elevkort + lärarkort + rolltoggel + inläsningstips. "Fäladsgården" får inte förekomma någonstans.
6. **Laborationshandledningar** om laborationer ingår, enligt mönstret i avsnitt 6.
7. **Länka in området i hamburgermenyn** (`/js/menu.js`) om det inte redan finns där.
8. **Verifiera** att footer, rolltoggel och robots.txt fungerar på nya sidor.

---

## 12. Historiskt arbetskontext (vad som är byggt)

Per 2026-04-22 är följande klart:

### `fysik/magnetism-induktion/` – komplett

- Områdesindex med rolltoggel (elev/lärare) och utökat lärarkort. Rubriken är "Magnetism och induktion". URL behålls oförändrad.
- Studieguide med 15 fullt ifyllda milstolpar i TEFY-stil.
- 6 laborationshandledningar med duplex-utskrift och hash-filtrering (`#lab-N`).
- Checklista omskriven i egna ord, strukturerad efter milstolparna, med ★-fördjupning. Förkunskaps-sektionerna om ström/spänning/resistans/kopplingar är **flyttade** till elektricitet/-området.
- Lärande spel: begreppskort, korsord. `ohms-lag-spel.html` är inte längre en egen fil här – den är en redirect till `/fysik/elektricitet/ohms-lag-spel.html`.

### `fysik/elektricitet/` – skelett på plats, innehåll kvar att skriva

- Mappen hette tidigare `el-och-magnetism/` men är nu `elektricitet/` (omdöpt från den gamla mappen som bara hade Ohms-spelet).
- Områdesindex med rolltoggel, elevkort (studieguide, checklista, instuderingsfrågor, övningsprov, lärande spel, laborationer) och lärarkort med full uppsättning utskrifter och facit. Rubrik: "Elektricitet och Ohms lag" (kort i menyn: "El & Ohms lag").
- Studieguide med 12 milstolpe-**stubbar**. Varje milstolpe har rubrik, stubbtext (som `.milestone.stub`) och next-steps-länkar. Texterna ska skrivas om i TEFY-stil innan publicering.
- Checklista skriven i egna ord, matchar stubbarna milstolpe för milstolpe, med ★-fördjupning.
- Lärande spel: Ohms-lag-spelet bor här (flyttat från magnetism-induktion). `larande-spel.html` har cross-länk till magnetism-induktions palett.

### Globalt

- Gemensam `site-footer` med CC BY-NC-SA 4.0-licens på alla sidor som laddar `menu.js`.
- `/robots.txt` som blockerar AI-tränings-crawlers.
- Alla "Fäladsgården"-referenser borttagna från hela repot.
- Hamburgermenyn (`/js/menu.js`) och `fysik/index.html` listar båda områdena i rätt ordning: `El & Ohms lag` före `Magnetism & induktion`.

### Öppna designbeslut att ta senare

- **Verktygsrad på område-index** (AI-lärare, Läs upp, Översätt, Bildstöd, Lärarläge) som alternativ till att bädda in sidan i kommunens Google Site. Läs-upp-funktionen kan byggas med Web Speech API utan tredjepartsbibliotek. AI-lärare kopplas som utgående länk snarare än iframe för att behålla ägandet av sajten.
- **Fyll studieguidens milstolpar** i elektricitet/ med TEFY-brödtext, faktaruta och fördjupning enligt samma mönster som magnetism-induktion.
- **Instuderingsfrågor, övningsprov, facit och laborationer** för elektricitet behöver byggas på nytt i egna ord (inte kopieras från magnetism-induktion).

Övriga områden (andra fysikområden, biologi, kemi) har ännu inte genomgått samma upprustning. Deras checklistor, instuderingsfrågor och begreppskort är fortfarande i stort sett importerade från Gleerups och bör skrivas om i tur och ordning innan publicering.
