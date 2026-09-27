# Färdplan – Genetik (pilotområdet)

Målet: göra **genetik till det första kompletta området** – elevdel + ett tunt ankare per
milstolpe – och därmed mallen för resten. Vi bygger en sak i taget (se `pedagogik.md`).
Claude håller ihop ordningen; Jesper levererar det bara han kan (foton, filmval, labbar).

Status-symboler: ✅ klart · ▶️ näst på tur · ⏳ kan göras nu · ⛔ väntar på Jesper

---

## Redan klart ✅

- Studieguide M1–M11 med begrepp i milstolpeordning, ankare rättade, haploid/diploid förklarat.
- Begreppslista + startsidans "Viktiga begrepp" synkade och kompletta (65 begrepp).
- Klickbar **tankekarta** som återanvändbar komponent (`/js/tankekarta.js`), inlagd överst i
  studieguiden. Fungerar även som lärarens lektionsnavigator senare.
- `klona-genen.html` (M11, restriktionsenzym) finns.

---

## Fas A – Gör elevdelen komplett (störst hävstång, inget blockerar) ⏳

Detta lyfter genetik från "påbörjad" till "komplett elevdel" i statusöversikten.

1. ✅ **Instuderingsfrågor** – KLART. 45 egna frågor + facit (M1–M11, 4 fördjupning),
   renderade via `render-instudering.js` + `data/instuderingsfragor.json`.
2. ✅ **Övningsprov + facit** – KLART. 18 egna frågor i tre nivåer (E/C/A, inkl. en
   matchningsfråga), `data/ovningsprov.json` + `facit.html`. Alla **utskriftssidor** klara
   (prov, facit, instudering elev/lärare) med knappar i moderdokumenten.

   ➡️ **Genetik är nu komplett på elevsidan.** Kvar för fullt V1: ett ankare per milstolpe.

   *Svårighetsnivå-utkast (för senare balansering):* provet är redan delat i E/C/A. För
   instuderingsfrågorna finns en lätt nivåmarkering ("Fördjupning:" på 4 frågor) – kan
   formaliseras till E/C/A-taggar på samma sätt när vi finjusterar.
   *Nivå:* E-kärnan separat, gymnasienära begrepp (locus, kodominans, antikodon, PCR m.fl.)
   som fördjupnings-/överkursfrågor.

## Fas B – Ankarövningar (interaktiva, byggda på kodontabellen) ⏳

3. **Idé 19 – DNA→mRNA→protein→funktion** (M5). Fyra steg med automaträttning.
4. **Idé 20 – Upptäck mutationen** (M7), med färgblindhets-exemplet.
5. **Snabbfix:** länka `klona-genen.html` från studieguidens M11; länka tankekartan från index.

## Fas C – Bilder jag kan rita nu ⏳

6. **M6 mitos/meios** – en enkel förklarande SVG (vad de leder till) + en detaljerad fasbild,
   inlagda i M6-texten. Den detaljerade kan sedan bli en fas-identifieringsövning.
7. **Idé 17 – helhetsbild kromosom→DNA→baspar→gen** (strukturell översikt), om vi vill.

## Fas D – Lärarlagret, skelett per milstolpe (tillväxtmotorn) ⏳/⛔

8. Bygg **lärarlager M1–M11** indexerat per milstolpe: syfte, vanliga missuppfattningar,
   och ankar-platser (film / laboration / övning) med kort lärartext (syfte + genomförande).
   Jag fyller det som är klart (missuppfattningar, länkar till övningarna ovan, mina bilder);
   film- och fotoplatser lämnas som tydliga "väntar på Jesper".

## Fas E – Drag-och-placera + repetition ⏳

9. **Idé 21 – "lägg kartan"-övning** ovanpå tankekartan (dra kort + förklaringar till rätt plats).
10. **Repetitionsavsnitt** i slutet som återanvänder tankekartan med M-numren fast inskrivna.

## Fas F – Mall för nästa område

11. När genetik är komplett (elevdel + ankare + lärarlager): destillera mönstret och rulla ut
    på nästa område.

---

## ⛔ Väntar på dig, Jesper (gör när du hinner – parallellt)

Dessa låser upp specifika övningar/material. Inget av Fas A–C hänger på dem.

- **Mikroskopfoton M1:** neuron, kindepitelcell, levercell → låser upp cellorgan-namnövningen
  (Idé 22, Seterra-stil).
- **Cellöversikter M1:** växtcell / djurcell / bakteriecell med pilar och organellnamn
  (dina foton – eller säg till så ritar jag schematiska SVG istället).
- **Mikroskopfoton M6:** färdiga lök-rotspetspreparat → låser upp fas-identifieringsövningen
  (Idé 23) för dem utan mikroskop.
- **Laborationsprotokoll M6:** rotspetspreparat – du har lärarhandledningar; bekräfta eller
  komplettera så formar jag dem.
- **Filmval:** titta igenom Amoeba Sisters (och ev. Khan Academy) och välj en film per
  milstolpe → fyller ankarens filmruta. (Idé 5-listan.)
- **"En cells sista måltid":** din egen film – ge mig fil/länk så lägger jag den som
  M1-ankare (språkoberoende, starkast av alla).

---

## Underlag insamlat i förväg – kloning + framtida bilder (27 sep 2026)

Bakgrund: Jesper har tagit bilder på spermier (tjur) och funderar på att ta en ny bildserie
av en befruktad äggcells första delningar (1 cell → 2 → 4 → 8), som skulle kunna användas i
BÅDE "Vad är liv?"-kapitlet OCH här i genetik, med olika vinklar och gärna en länk mellan
kapitlen. Inget av detta är byggt än – det här är research/underlag inför bygget.

**1. Bildserie äggcellsdelning – platshållare finns redan.** I
`biologi/liv-och-cellen/studieguide.html` (M2) finns redan en färdig platshållare (4 bilder:
"1 cell", "2 celler", "4 celler", "8 celler") som väntar på just dessa foton. Vinkel där: att
allt liv börjar som en enda cell som delar sig till miljarder celler med samma DNA. Vinkel
här i genetik (samma bilder, annat fokus): koppling till cellkärnans DNA och kloning nedan.

**2. Spermier (tjur).** Finns redan i `Mikroskopbilder.pptx` ("Spermier från tjur", slide 8,
image10.png) – går att använda direkt eller ersätta med nya foton. Passar in vid
befruktning/gameter när vi bygger den milstolpen.

**3. Kloning (Dolly/SCNT) – faktakoll klar.** Metoden kallas somatisk cellkärnöverföring
(Somatic Cell Nuclear Transfer, SCNT):
1. En vanlig kroppscell tas från djuret som ska klonas (hos Dolly: en cell från
   juvret/mjölkkörteln – INTE en kindcell).
2. En obefruktad äggcell tas från ett annat djur och äggcellens egen cellkärna avlägsnas
   (enukleering).
3. Cellkärnan från kroppscellen förs in i den tomma äggcellen.
4. En elektrisk stöt får den nya cellen att börja dela sig, som om den blivit befruktad.
5. Embryot (blastocysten) placeras i en surrogatmammas livmoder och föds fram normalt.

Effektivitet: av 277 försök överlevde bara Dolly till vuxen ålder – bra kontext för eleverna
om hur svårt/ineffektivt det fortfarande är.

Viktigt att vara ärlig om i bildtexten: Dolly gjordes specifikt av en juvercell, inte en
kindcell. Men principen stämmer – cellkärnan i praktiskt taget vilken kroppscell som helst
(inklusive vanliga epitelceller, som kindceller) kan användas som donator. Det är bekräftat i
senare forskning: fibroblaster, juverceller, epitelceller, gonadceller m.fl. har alla
fungerat som donatorceller vid SCNT i olika djurarter. Alltså vetenskapligt korrekt att säga
till eleverna: "en cellkärna från en cell som liknar er egen kindcell skulle i princip kunna
användas på samma sätt."

Källor: [Dolly (sheep) – Wikipedia](https://en.wikipedia.org/wiki/Dolly_(sheep)) ·
[Somatic cell nuclear transfer – Britannica](https://www.britannica.com/science/somatic-cell-nuclear-transfer) ·
[SCNT-donatorceller – ScienceDirect Topics](https://www.sciencedirect.com/topics/engineering/somatic-cell-nuclear-transfer)

**4. Kindcellsbild + bildtextutkast, sparat för kloningsavsnittet.** Föreslagen bild:
`kindcell-utan-bakterier.jpg` (redan i repot, används i M4 i "Vad är liv?") – vald för att den
visar en tydlig, ostörd cellkärna utan bakteriefläckarna som finns på den andra kindcellsbilden.

Bildtextutkast (fri att justera vid bygget):
> Cellkärnan i en av dina egna kindceller (samma bild som i "Vad är liv?") innehåller allt
> DNA som behövs för att bygga en hel människa. Om man tar ut kärnan ur en sådan cell och
> sätter in den i en äggcell (utan sin egen kärna) som sedan placeras i en livmoder, går det
> i princip att skapa en klon – en genetisk kopia. Det är just så fåret Dolly skapades 1996,
> fast då användes en cellkärna från en juvercell, inte en kindcell.

**5. Bild på Dolly (fri licens) – KLAR, VALD av Jesper (27 sep 2026).**

**Vald bild:** [File:Dolly the Sheep National Museum of Scotland.jpg](https://commons.wikimedia.org/wiki/File:Dolly_the_Sheep_National_Museum_of_Scotland.jpg) –
4592×3064 px, tagen 25 april 2019 av **Sgerbic**. Licens: **Creative Commons
Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.
Attributionstext (enligt vår källkvalitetsmall): *"Dolly the Sheep National Museum of
Scotland" av Sgerbic, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0),
via Wikimedia Commons.*

Lågupplöst förhandsversion (1280 px bred) sparad i `/tmp/dolly/dolly_1280.jpg` i den här
sessionens molnmiljö – finns bara kvar i sessionen, inte i repot ännu. Vid bygget:
1. hämta originalet i full upplösning från
   `https://upload.wikimedia.org/wikipedia/commons/0/07/Dolly_the_Sheep_National_Museum_of_Scotland.jpg`
   (använd en beskrivande User-Agent och vänta några sekunder mellan försök – originalfilen
   gav 429 "too many requests" vid direkthämtning, en thumb-storlek gick dock bra),
2. beskär/skala till lagom storlek för bildkolumnen,
3. döp filen (t.ex. `dolly-klonat-far.jpg`),
4. lägg in bildtextutkastet nedan (inkl. attributionstexten) i figcaption/källförteckningen.

Bildtextutkast (fri att justera vid bygget):
> **Fåret Dolly (1996–2003) – det första klonade däggdjuret.** Hon skapades med metoden
> beskriven ovan (SCNT), från en cellkärna ur en juvercell. Idag finns hennes uppstoppade
> kropp utställd på **National Museum of Scotland i Edinburgh** – dit du faktiskt kan gå för
> att se henne på riktigt.
> *Foto: Sgerbic, licens [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)
> (Creative Commons Erkännande-DelaLika 4.0), via Wikimedia Commons.*

(Alternativet med Genis foto från 2016 – se historik – valdes bort till förmån för denna.)

---

## Förslag: vad vi tar härnäst

**Fas A, punkt 1 – instuderingsfrågorna.** Störst effekt, inget blockerar, och den gör
genetik nästan komplett på elevsidan. Säg bara till så börjar jag.
