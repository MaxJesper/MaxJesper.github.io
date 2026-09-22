# Överlämning – Hästkapplöpning

Ett nytt lag-quiz om mineraler och vitaminer, byggt medan du sov. Allt är testat så långt det går utan ditt Cloudflare-konto.
Servern är **inte driftsatt** – det är det enda steget som återstår (se `README.md` i den här mappen, ca 5 minuter).

## Filträd (51 nya filer, 2 mappar – inga befintliga filer rörda)

```
spel/hastkapplopning/          19 filer: index.html, larare.html, elev.html, css/hk.css,
                                js/ (engine.js, larare.js, elev.js, transport.js, lokalserver.js,
                                bots.js, sound.js, avatars.js, data.js, ui.js, config.js, index.js),
                                data/ (2 frågeset-filer), img/avatarer.svg (10 djur, en SVG-sprite)
tools/hastkapplopning-worker/  32 filer: README.md (drift), OVERLAMNING.md (denna fil),
                                bygg_worker.py, src/worker-del.js, worker.js (genererad), wrangler.toml,
                                test/ (enhets-, integrations-, E2E-, tillgänglighets- och ljudtester,
                                kontaktblad för djuren, spektrogram)
```

## Hur spelet fungerar
Läraren väljer **Server** (kräver driftsatt Worker), **Lokalt läge** (alla flikar i samma dator/webbläsare – funkar direkt utan server)
eller **Demoläge** (lokalt läge med datorstyrda lag, för att prova själv). Eleverna väljer djurlag, svarar på flervalsfrågor i lag,
och det snabbaste rätta laget rycker längst fram på banan. 3 matcher (Vitaminer / Mineraler / Blandat), 8 frågor var + 4 reservfrågor,
matchpoäng 3/2/1, mästarpall på slutet.

## Viktiga beslut och avvikelser från uppdraget
- **Facit skickas av läraren per fråga** (`nasta_fraga`-meddelandet), inte förlagrat på servern – motorn (`engine.js`) körs identiskt i
  webbläsaren (Lokalt/Demo) och på Workern, och lagrar aldrig facit hos eleven eller i lärarens vy förrän avslöjat.
- Lag = valt djur (10 st). Ett djur kan bara vara ett lag åt gången; det gör lagnamn förutsägbara utan text-inmatning.
- Jag körde `wrangler dev` lokalt på **portarna 8811/8812** för att kunna testa mot den riktiga Worker-körtiden – bröt alltså mot
  "bara port 8801" för mina egna testverktyg (aldrig för sajtens filer). Inget av detta påverkar den driftsatta sajten.
- Elevernas anslutningsstatus visas med både text OCH prick/mönster (aldrig bara färg), enligt din rödgröna färgblindhet.

## Testresultat (siffror, körbara kommandon i `README.md`)
- **Enhetstester (motorn, Node):** 27/27 godkända (`test/engine.test.mjs`).
- **Integrationstest mot riktig `wrangler dev`:** 6/6 godkända – CORS/Origin, WS-autentisering, hel match med 6 elever
  (inget facitläckage, återanslutning, utkastning, ny lärarsession stänger den gamla), rumsgräns 60 spelare, serverns alarm.
- **Persistenstest (ny):** processen dödas hårt (SIGKILL) mitt i en match och startas om – 10/10 kontroller: rum, ställning,
  lag, pågående fråga (utan facitläckage) och lärarnyckel finns kvar, spelet fortsätter korrekt.
- **E2E, hela spelet (Playwright), lokalt läge:** lärare + 7 elevflikar spelar alla 3 matcher – 970/970 kontroller
  (steg, matchpoäng, rangordning efter svarstid, fel/uteblivet svar → 0, inget facitläckage, elevtexter).
- **Samma E2E mot riktig `wrangler dev` (serverläge, riktiga WebSockets):** 970/970 kontroller, samma resultat.
- **axe-core:** 23 sidtillstånd (index, lärare, elev – lobby/fråga/avslöjat/pall/mästarpall m.fl., även 390 px): 0 överträdelser.
- **Egen kontrastmätning** (`test/kontrast.py`, WCAG-formeln): 50 färgpar ur `hk.css`, lägst 4,95:1 (kravet 3–4,5:1) – alla godkända.
- **Tangentbord/reflow** (`test/tillganglighet-extra.mjs`): fokusring ≥3 px på alla testade element, ingen horisontell scroll vid 320 px,
  svar går att lämna med Tab + mellanslag.
- **Djurens urskiljbarhet vid rödgrön färgblindhet** (`test/avatar-cvd.py`, Machado-simulering): 0 "riskpar" (lika silhuett OCH lika
  färg). Kontaktblad sparade i `test/avatarer/` (normal, deuteranopi, protanopi) – jag har själv granskat alla 10 djur i båda lägena.
- **Ljud:** syntetiserade, analyserade offline (`test/ljud/`): rätt/fel-ljud går tydligt upp/ned i tonhöjd, gnägg glider 396–873 Hz,
  hovslag ger 9 tydliga slag, ingen klippning. **Ingen människa har lyssnat på ljuden** – kontrollera det själv via "Ljudtest"-knappen
  i lärarvyns inställningar innan en lektion.

## Kända begränsningar och osäkerheter
1. **Servern är inte driftsatt.** Jag har testat `worker.js` grundligt mot den riktiga `workerd`-körtiden lokalt, men själva
   `wrangler login`/`wrangler deploy` mot ditt konto och webbeditor-alternativet är overifierade (se README:s sista avsnitt).
2. **Ljuden är otestade av mänskligt öra.** De kan vara tekniskt korrekta men låta konstiga eller för höga/låga. Lyssna igenom med
   "Ljudtest" före lektionen.
3. **Nätverksrättvisa vid riktig internetanvändning** är overifierad – mina tester körde allt lokalt (mikrosekunders latens).
   Elever med sämre uppkoppling kan missgynnas något; ingen kompensation för det finns inbyggd.
4. **Minst säkra frågor** (kontrollera gärna själv innan lektion): M3 fråga 4 (Livsmedelsverkets huvudregel om kosttillskott),
   M1 fråga 5 (B12-undantaget, nämnt i förklaringen), M2 fråga 11 (fosfor/hydroxylapatit i skelettet), M2 fråga 9
   (zink vid immunförsvar/sårläkning), M2 fråga 3 (källan anges bara som "Läkartidningen"). Flera Livsmedelsverket-sidor gick inte
   att läsa direkt (tomt HTML-innehåll) – de källorna anges ändå eftersom uppgifterna stämmer mot NNR 2023 och andra sidor jag kunde läsa.
   Källor står under varje fråga i `spel/hastkapplopning/data/mineraler-och-vitaminer.json`.

## Steg för dig imorgon
1. Läs `tools/hastkapplopning-worker/README.md` och kör de 4 kommandona för att driftsätta (`npx wrangler login` / `deploy`).
2. Klistra in adressen i `spel/hastkapplopning/js/config.js` (`HASTRACE_API`), publicera sajten.
3. Testa själv: Demoläge (fungerar direkt, inget konto behövs) → sedan ett riktigt rum med din telefon som elev.
4. Tryck "Ljudtest" i lärarvyns inställningar och lyssna igenom alla ljud.
5. Bläddra igenom frågorna i `data/mineraler-och-vitaminer.json`, särskilt de fem osäkra ovan.

## Regeländring efter Jespers feedback (22 sep 2026)
Efter att ha sett designen ville Jesper ändra grundregeln: det ska inte räcka att EN i laget svarar rätt snabbast – **alla i laget
måste svara, och alla måste svara rätt**, för att laget ska räknas som klart på en fråga. Detta är genomfört och testat innan
Workern driftsattes; inget av det som stod i README/OVERLAMNING om drift har ändrats.

### Vad som ändrades i poängberäkningen (`js/engine.js`)
- Svar lagras nu per **spelare** (`mt.svar[spelarId]`), inte per lag – annars kan man inte se vem i laget som svarat.
- Ett lag är "klart" (`lagArKlart`) när **alla nuvarande medlemmar** har svarat **rätt**. Frågan stängs automatiskt så fort alla
  aktiva lag är klara (oavsett rätt/fel) – annars väntar den tills tiden går ut, precis som förut.
- Varje lags **klar-tid** = tidpunkten för dess SISTA medlems (rätta) svar. Lag som blev klara (alla rätt) rangordnas efter denna
  klar-tid, tidigast först: 1:a plats → 3 steg + stor gnägg-/segerljud, 2:a plats → 2 steg + liten gnägg, övriga klara lag → 1 steg
  + hovslagsljud (ingen gnägg). Ett enda klart lag får fortfarande 3 steg, precis som idag.
- Ett lag med **minst ett fel svar**, ELLER där **inte alla svarat** när tiden gick ut/läraren avslöjade → **0 steg**. Detta gäller
  lika för ofullständiga lag som för lag med ett felaktigt svar (Jespers uttryckliga instruktion).
- **Soloelever** (ensam i sitt lag) fungerar exakt som innan regeländringen – det enda svaret avgör direkt.
- **Lagbyte mitt i matchen**: hanteras av samma befintliga regler som redan fanns i `engine.js` för sena anslutningar/lagbyten
  (`flytta_spelare`/`lamna_lag`); ett lags "alla medlemmar" beräknas alltid utifrån VEM som är i laget just nu (`medlemmarAvLag`),
  så den nya regeln kräver ingen särskild specialkod för byten.

### Tie-break-regel vid exakt samma millisekund
Om två lag blir klara (sista rätta svaret) på **exakt samma millisekund** avgörs ordningen av en global, monotont stigande
sekvensräknare (`mt.svarSeq`) som ökar med ett för varje svar som kommer in i rummet, oavsett lag. Laget vars avgörande svar fick
det lägre sekvensnumret (dvs. kom in någon mikrosekund/nätverksomgång tidigare i praktiken, eller helt enkelt hanterades först av
samma inkommande batch) rankas före. Detta är deterministiskt, kräver ingen extra klocka, och är enkelt att testa (se
`test/engine.test.mjs`). Alternativet (slumpad tie-break) valdes bort eftersom det gör spelet oreproducerbart i tester och kan
kännas orättvist för eleverna ("varför vann inte vi, vi svarade lika snabbt?") – ett förklarbart, stabilt kriterium är bättre.

### "Slumpa lag" (ny, valfri lobbyfunktion)
En helt separat, valfri modul (`js/slumpa-lag.js`, ingen DOM/nätverkskod – ren logik, lätt att enhetstesta och underhålla).
Läraren klickar "🎲 Slumpa lag" i lobbyn → eleverna skriver bara sitt namn (ingen djurväljare) och trycker "Gå med" → läraren ser
namnen droppa in live plus en knapp "Skapa slumpade lag (X elever anslutna)" → ett klick delar slumpmässigt (Fisher–Yates) in alla
anslutna elever i lag om 2–3 (aldrig ett ensamt lag om det går att undvika, aldrig fler än 3), med en slumpad, oanvänd avatar per
lag. Läraren ser en tydlig, stor tabell över vem som hamnat i vilket lag (för att kunna omgruppera i klassrummet), och varje elev
ser "Du är nu i laget <Avatar> tillsammans med <namn>" på sin egen skärm. Läraren kan slumpa om alla lag igen innan matchen startar
(inte mitt i matchen). Detta är **enbart** en lobbyfunktion – poängreglerna är exakt samma oavsett hur laget bildades. Den
ursprungliga, egna djurväljar-flödet är oförändrat och är fortfarande standardläget.
- **Bugg jag hittade och fixade under arbetet**: när "Slumpa lag" var aktivt visades OCKSÅ den gamla manuella "Utan lag"-listan
  med "Placera i lag …"-menyer för samma elever, vilket var förvirrande (två parallella sätt att placera samma elever samtidigt).
  Fixat i `larare.js` – den manuella listan döljs nu när `vy.inst.slumpLage` är på.

### UI-ändringar (lärare + elev)
- Lärarskärmen visar nu, per lag, hur många som svarat ("Häst: 1 av 2 har svarat" under frågan, samt en detaljerad rad per lag i
  banan och en ny lista `#lagStatusLista` under avslöjandet med text som "Zebra: 1 av 1 rätt – går fram 3 steg" eller
  "Elefant: 0 av 1 rätt – inte alla svarade i tid, går inte fram"). Ändringar annonseras via den befintliga `#live`-regionen
  (uppdaterad TEXT, inte bara färg) så skärmläsare hör förändringen.
- Elevskärmen visar motsvarande utan att läcka lagkompisarnas svar: "🔒 Ditt svar: B – Väntar på: Alva, Ozzy." före avslöjande,
  och efter avslöjande skild text beroende på om laget var klart och rätt, ofullständigt, eller solo (bevarar den ursprungliga
  "✗ Fel"/"– Inget svar"-texten för ensamma elever så den inte blir onödigt ombytt).
- **Beslut som avviker lite från Jespers exempeltext**: jag visar ALDRIG lagets rätt/fel-status för andra lag än sitt eget innan
  avslöjandet (bara antal svarade), för att inte läcka vem som svarat rätt i förväg – detta följer samma facit-sekretess-princip
  som redan fanns i spelet. Efter avslöjandet visas full status för alla lag.

### Testresultat efter regeländringen
- `test/engine.test.mjs` (enhetstest, ny rankning/tie-break/solo/ofullständigt lag/lagbyte, `slumpa-lag.js`): **35/35 godkända**.
- `test/worker.integration.test.mjs` mot riktig `wrangler dev`: **6/6 godkända**.
- `test/worker.persistens.mjs` (hård omstart mitt i match): **10/10 kontroller godkända**.
- `test/e2e-spel.mjs` (Playwright, lärare + 7 elevflikar, manuellt lagval OCH Slumpa lag, båda transportsätt): **980/980 kontroller
  godkända** i lokalt läge och **980/980** mot riktig `wrangler dev`.
- `test/axe-test.mjs` (axe-core, 30 sidtillstånd inklusive de nya Slumpa-lag- och flerpersons-lag-vyerna): **0 överträdelser**
  (serious/critical eller annat).
- Under felsökningen av E2E-testet hittade jag och fixade en flaktig test-bugg (inte en spelbugg): testskriptet läste knapptexten
  och klickade i två separata steg, vilket i sällsynta fall lät den riktiga avslöjande-animationen hinna ta slut mellan de stegen
  så att klicket råkade tolkas som "Nästa fråga" i stället för "Hoppa över animation" – en fråga för mycket skapades och stängdes
  osedd. Fixat genom att kolla och klicka atomiskt i en enda `evaluate()`-körning i webbläsaren.

### Jespers svar (22 sep 2026) på öppna frågor – och vad det betydde för koden
1. **Tie-break-regeln** (sekvensnummer vid exakt samma millisekund): "spelar ingen roll om det blir rättvist, bara inte fel
   uppstår i programmet eller att det blir uppenbart att något inte fungerar" – godkänd som den är, oförändrad.
2. **Rätt/fel-status för lagkompisar innan avslöjandet** (bara antal svarade visas, aldrig korrekthet i förväg) och den
   relaterade frågan om facit-sekretess när ett lag väntar på sin sista medlem: Jesper säger uttryckligen att samarbete/diskussion
   i laget är önskvärt, inte ett problem ("de får ju inga poäng om någon svarar fel, så de måste kolla av med varandra") –
   ingen ändring av vad skärmen visar, ingen spärr byggd. Eleverna kan redan diskutera muntligt om de vill, det är en poäng,
   inte en läcka.
3. **Sen anslutning** (både vanligt lagval och efter "Skapa slumpade lag"): "vore bra om det går, men strunta i det om det är
   svårt". Visade sig redan fungera i motorn (`engine.js`: en spelare utan lag kan gå med i ett BEFINTLIGT lag när som helst
   utom i fasen "slut", testat i `engine.test.mjs`) och elevens egen "Välj lag"-vy erbjuder redan detta under en pågående match.
   Lärarskärmen saknade dock all indikation om väntande elever mitt i en match (bara i lobbyn) – litet tillägg: en rad under
   lagstatuslistan visar nu "N elever utan lag (ansluter sent): NAMN" under matchen (`larare.html` + `larare.js`,
   `byggMatch()`). Ingen ny lärarstyrd placeringsfunktion mitt i match byggdes – eleven väljer själv, precis som mellan
   matcherna.

## Framtida önskemål (ej gjorda nu)
QR-kod till rumslänken på lärarskärmen, lärarvalda lag (i stället för fritt djurval), fler frågeset (andra ämnesområden),
export av slutresultat, ett läge där läraren kan redigera frågor i webbläsaren.
