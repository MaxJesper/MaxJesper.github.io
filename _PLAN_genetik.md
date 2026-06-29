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
2. ▶️ **Övningsprov + facit** – eget prov, samma teknik. Ersätter 🚧-skal. *(näst på tur)*
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

## Förslag: vad vi tar härnäst

**Fas A, punkt 1 – instuderingsfrågorna.** Störst effekt, inget blockerar, och den gör
genetik nästan komplett på elevsidan. Säg bara till så börjar jag.
