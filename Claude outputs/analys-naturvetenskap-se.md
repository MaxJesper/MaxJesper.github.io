# Analys av naturvetenskap.se – vad kan NO-plattformen lära sig?

Jag har läst igenom naturvetenskap.se brett: startsidan, kemidelen (högstadiet, gymnasium, universitet), fysik, biologi, laborationsteknik och om-oss-sidan. Här är vad jag hittade och vad jag tror är relevant för ditt eget arbete.

## Vilka de är

Sidan drivs av Matias Ekstrand (läkare och legitimerad apotekare) och Oskar Henriksson (doktorand i matematik) via handelsbolaget Naturvetenskap Sverige. Den startades 2008 av två Göteborgsstudenter som tyckte det saknades bra svenskspråkigt material på nätet – alltså ett projekt som började smått och växt organiskt under nästan 20 år. Det är värt att ha i bakhuvudet: det är precis den typ av långsiktiga, gradvisa uppbyggnad du redan håller på med.

## Affärsmodellen – relevant för din egen "dröm"

Du har tidigare nämnt en framtidsvision om en freemium-modell för NO-plattformen. Naturvetenskap.se har redan byggt exakt det, och det är kanske det mest konkret användbara jag hittade:

- All löptext (förklaringar, exempel, bilder) är helt fri och öppen för alla.
- Man tjänar pengar på dels annonser (tydligt avskilda från innehållet), dels betalkonton för skolor och privatpersoner. Det betalkontona ger är **fördjupade övningsuppgifter** – alltså inte grundförståelsen, utan extra räkne- och resonemangsuppgifter (jag hittade exempelvis en hel avdelning "Fördjupade övningsuppgifter" i gymnasiekemin, med problemlösning i beräkningar och resonemang).
- De erbjuder skolor gratis provperioder för att sänka tröskeln till att köpa konto.

Om du någon gång vill gå vidare med din egen freemium-idé är det här en beprövad modell värd att kopiera rakt av: **förklaringen är alltid gratis, det som kostar är extra övning/fördjupning**. Det matchar dessutom din pedagogiska grundsyn – eleverna motiveras av att förstå, inte av dekoration – eftersom det är just förståelsen som förblir fri.

## Bredd kontra djup – den stora skillnaden

Naturvetenskap.se täcker matematik, fysik, kemi och biologi från mellanstadiet till universitetsnivå, plus medicin och farmakologi. Det är alltså betydligt bredare än din plattform. Men i gengäld är det ofta tunt: jag tittade på deras sida om syror och baser (högstadienivå) och den var i praktiken bara en innehållsförteckning med två artikellänkar och ingen egen text. Biologidelen på högstadienivå är också ganska sparsam – fyra rubriker utan den täckning du redan har i **Liv och cellen** (6 milstolpar, 24 begrepp, spel, komplett studieguide).

Din styrka är alltså den omvända: du bygger smalare men mycket djupare per område, med en fast standard (studieguide, checklista, instuderingsfrågor, övningsprov+facit) som de inte har. Det är inte en svaghet att du är smalare än dem – det är ett medvetet val som ger ett vassare material där du väl har byggt klart.

## En sak de gör som du inte gör: inline-facit direkt i löptexten

I deras artiklar (t.ex. sidan om alkaner) ligger korta övningsuppgifter direkt i löptexten, med ett klicka-för-att-visa-svar-fält precis under frågan – inget behov av att lämna sidan eller öppna ett facit-dokument. Det är ett enkelt, lågtröskel-sätt att låta eleven kontrollera sig själv medan hen läser, som komplement till dina mer formella instuderingsfrågor/övningsprov (som ni redan har och som fortsatt fyller en annan funktion – summativ kontroll snarare än läsflyt). Skulle vara enkelt att lägga till som en liten JS-komponent (`<details>` med "Visa svar", i samma stil som era befintliga `deepen`-rutor) direkt i studieguidens milstolpar, till exempel en fråga i taget efter varje delavsnitt.

## Ett innehållsmässigt hål värt att fylla: halogenkolväten

Deras organiska kemi tar upp **halogenkolväten** (t.ex. triklormetan/kloroform, och framför allt CFC/freoner kopplat till ozonlagret) – ett område ni inte har i kol-och-kolföreningar just nu. Det knyter fint an till miljöperspektivet och skulle kunna bli en kort fördjupningsruta i alkan- eller alken-milstolpen (samma mönster som ringformiga/aromatiska kolväten), eller sparas till det framtida Hållbar utveckling-området – ozonlagret är en klassisk och pedagogiskt tacksam koppling mellan kemi och miljö.

## Bekräftelse: plast/polymerer saknas helt hos dem

Värt att notera rakt av: naturvetenskap.se har **ingen sida om plast eller polymerer** i sin organiska kemi, varken på högstadie- eller gymnasienivå. Det ni just byggt in i studieguiden fyller alltså en riktig lucka – inte bara hos er, utan i det svenska fritt tillgängliga materialet överlag.

## Saker ni redan har som de saknar helt

Några saker värda att känna till rakt av, inte som förslag utan som bekräftelse på var ni redan ligger före:

- **Flerspråkstöd med TTS** (er språkväljare, nu även urdu) – naturvetenskap.se är enbart på svenska, ingen språkväljare alls.
- **Interaktiva, roterbara 3D-molekylmodeller** (3Dmol.js/WebGL) – de har bara statiska bilder av kulmodeller.
- **Lärande-spel** (som kol-spelet) – inget liknande hos dem.
- **Fullständiga utskriftsbara laborationsprotokoll, checklistor och övningsprov+facit per område**, i en konsekvent husstil – deras material är i praktiken bara löpande artikeltext plus enstaka klicka-för-svar-uppgifter.

## Sammanfattning – vad jag skulle prioritera

1. **Inline klicka-för-svar-frågor** i studieguidens löptext – enkelt att bygga, höjer läsflytet, kräver ingen ny infrastruktur.
2. **Halogenkolväten/ozonlagret** som ny kort fördjupning i kol-och-kolföreningar, eller sparas till Hållbar utveckling-området.
3. **Freemium-modellen** – inget att göra nu, men bra att ha naturvetenskap.se som konkret referensmodell den dag ni faktiskt tar tag i det (fri grundförklaring, betala för fördjupad övning).

Allt annat jag såg pekar mot att ni redan bygger något smalare men avsevärt djupare, mer genomarbetat och tekniskt mer avancerat än vad som finns fritt tillgängligt på svenska idag.
