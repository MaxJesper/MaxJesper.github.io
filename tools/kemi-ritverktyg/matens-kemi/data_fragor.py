# -*- coding: utf-8 -*-
"""Instuderingsfrågor och övningsprov för Matens kemi.
Frågorna är egna, nyskrivna frågor som täcker samma kunskapskrav som Jespers två gamla prov
(se OVERLAMNING.md) - ingen text är kopierad från proven eller från någon lärobok."""


def Q(q, a, lines=None, draw=None, note=None):
    d = {"q": q, "a": a}
    if lines: d["lines"] = lines
    if draw: d["draw"] = draw
    if note: d["drawNote"] = note
    return d


def M(title, left, right, a):
    return {"type": "match", "title": title, "left": left, "right": right, "a": a}


INSTUDERING = {"groups": [
 {"title": "Milstolpe 1 – Fotosyntes och cellandning", "items": [
  Q("Skriv ordekvationen för fotosyntesen.",
    "Koldioxid + vatten (+ ljusenergi) → druvsocker + syrgas.", 2),
  Q("Skriv den kemiska formelekvationen för fotosyntesen, med reaktionsvillkor.",
    "6 CO₂ + 6 H₂O --(ljusenergi, klorofyll)--> C₆H₁₂O₆ + 6 O₂", 2),
  Q("Skriv ordekvationen för cellandningen.",
    "Druvsocker + syrgas → koldioxid + vatten (+ energi).", 2),
  Q("Skriv den kemiska formelekvationen för cellandningen.",
    "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O (+ energi)", 2),
  Q("Vad är sambandet mellan fotosyntes och cellandning? Jämför ämnena på vänster och höger sida i de två ekvationerna.",
    "De är varandras motsatser (omvända reaktioner). Det fotosyntesen bygger upp (druvsocker + syre av koldioxid + vatten) bryter cellandningen ner igen (till koldioxid + vatten), och energi frigörs.", 3),
  Q("Var i en växt sker fotosyntesen, och vilka celler i kroppen utför cellandning?",
    "Fotosyntesen sker i gröna växtdelar (bladen, i kloroplaster). Cellandning sker i i stort sett alla levande celler, både i växter, djur och människor.", 3),
 ]},
 {"title": "Milstolpe 2 – Kolhydrater", "items": [
  Q("Vilka tre grundämnen bygger upp kolhydrater?",
    "Kol (C), väte (H) och syre (O).", 1),
  Q("Förklara skillnaden mellan monosackarid, disackarid och polysackarid.",
    "Monosackarid: en enda sockerenhet (minsta byggstenen), t.ex. glukos. Disackarid: två monosackarider bundna till varandra, t.ex. sackaros. Polysackarid: många (ofta tusentals) monosackarider bundna i en lång kedja, t.ex. stärkelse.", 4),
  Q("Stämmer det att alla monosackarider har formeln C₆H₁₂O₆? Motivera.",
    "Nej. C₆H₁₂O₆ gäller för sexkolsockrar som glukos och fruktos, men det finns även monosackarider med andra antal kolatomer, till exempel femkolsockret ribos (C₅H₁₀O₅).", 2),
  Q("Ge tre exempel på disackarider och vilka monosackarider de består av.",
    "Sackaros (vanligt bordssocker): glukos + fruktos. Maltos (mältsocker): glukos + glukos. Laktos (mjölksocker): glukos + galaktos.", 3),
  Q("Vilken monosackarid är stärkelse, cellulosa och glykogen uppbyggda av? Varför är det en vanlig missuppfattning att svara fel här?",
    "Alla tre är uppbyggda av glukos (druvsocker), inte fruktos. Det är en vanlig missuppfattning eftersom man ofta blandar ihop de två vanligaste sexkolsockrarna.", 2),
  Q("Stärkelse och cellulosa är båda uppbyggda av samma sockerart men ser helt olika ut och fungerar olika. Förklara varför.",
    "Skillnaden är hur glukosenheterna är bundna till varandra (bindningstypen/vinkeln): stärkelsens bindning gör att kedjan böjer sig och bildar en spiral, medan cellulosans bindning gör att kedjan blir rak och utsträckt. Det gör att stärkelse kan brytas ner av människans matspjälkningsenzymer, medan cellulosa inte kan det (kostfiber).", 4),
  Q("Var i kroppen/naturen hittar man stärkelse, cellulosa respektive glykogen, och vilken funktion har varje ämne?",
    "Stärkelse: i växter (t.ex. potatis, spannmål), energilager. Cellulosa: i växters cellväggar, stödjevävnad/struktur. Glykogen: i lever och muskler hos djur och människor, energilager.", 3),
 ]},
 {"title": "Milstolpe 3 – Fetter", "items": [
  Q("Vilka två sorters byggstenar bygger upp ett fett (en triglycerid)?",
    "En glycerolmolekyl och tre fettsyror, bundna till glycerolen med esterbindningar.", 2),
  Q("En elev skriver att fettets alkohol är butanol. Är det rätt? Motivera.",
    "Nej. Fettets alkohol är alltid glycerol (en alkohol med tre OH-grupper), aldrig butanol.", 2),
  Q("Vad avgör om en fettsyra räknas som mättad eller omättad?",
    "Antalet dubbelbindningar mellan kolatomerna i fettsyrans kolkedja. Inga dubbelbindningar = mättad. En eller flera dubbelbindningar = omättad.", 2),
  Q("Förklara på molekylnivå varför mättat fett ofta är fast i rumstemperatur medan omättat fett ofta är flytande (olja).",
    "Mättade fettsyror har raka kedjor som kan packas tätt intill varandra, vilket ger starkare bindningar mellan molekylerna och ett fast ämne. Omättade fettsyrors dubbelbindningar ger kedjan en knäck (böj), så molekylerna packas glesare, vilket gör ämnet flytande.", 4),
  Q("Ungefär hur mycket mer energi per gram innehåller fett jämfört med kolhydrater?",
    "Fett innehåller ungefär dubbelt så mycket energi per gram som kolhydrater (och protein).", 2),
  Q("Vad innebär det att härda ett fett (hydrogenering), och varför gör man det?",
    "Väte tillsätts till de omättade fettsyrornas dubbelbindningar, så att fettet blir mer mättat och stelnar vid rumstemperatur. Det gör flytande oljor till fasta fetter, till exempel vid tillverkning av margarin.", 3),
 ]},
 {"title": "Milstolpe 4 – Proteiner", "items": [
  Q("Vilka grundämnen ingår alltid i en aminosyra, och vilket grundämne finns bara i vissa aminosyror?",
    "Kol (C), väte (H), syre (O) och kväve (N) ingår alltid. Svavel (S) finns bara i vissa aminosyror, t.ex. cystein.", 2),
  Q("Beskriv en aminosyras grundstruktur.",
    "En aminogrupp (–NH₂) och en karboxylgrupp (–COOH) sitter på samma kolatom, som också bär en sidokedja (R-grupp) som är olika för varje aminosyra.", 3),
  Q("Vad är en essentiell aminosyra?",
    "En aminosyra som kroppen inte kan tillverka själv, utan som måste komma från maten.", 2),
  Q("Vad är en peptidbindning, och hur bildas den?",
    "Bindningen mellan aminosyror i ett protein. Den bildas mellan karboxylgruppen på en aminosyra och aminogruppen på nästa, samtidigt som en vattenmolekyl frigörs.", 3),
  Q("Ge tre exempel på vad proteiner används till i kroppen.",
    "Till exempel byggmaterial (muskler, hud, hår), enzymer som påskyndar kemiska reaktioner, transportproteiner (t.ex. hemoglobin), hormoner eller antikroppar i immunförsvaret.", 3),
  Q("Vad är ett enzym, uppbyggnadsmässigt?",
    "Ett protein. Enzymer påskyndar kemiska reaktioner i kroppen utan att själva förbrukas.", 2),
  Q("Vad menas med att ett protein denatureras? Ge ett exempel från vardagen.",
    "Proteinets form vecklas ut/ändras (av t.ex. värme, stark syra eller bas) så att det förlorar sin funktion, och det går oftast inte att återställa. Exempel: äggvitan i ett stekt ägg stelnar och blir vit och ogenomskinlig – det är denaturerat protein.", 3),
 ]},
 {"title": "Milstolpe 5 – Sammanfattning: energilager i naturen", "items": [
  Q("Vilken polysackarid lagrar växter energi som, och vilken lagrar djur och människor energi som?",
    "Växter lagrar energi som stärkelse. Djur och människor lagrar energi som glykogen (i lever och muskler).", 2),
  Q("Vad har stärkelse och glykogen gemensamt, och vad skiljer dem åt?",
    "Båda är polysackarider uppbyggda av glukosenheter och fungerar som energilager. De skiljer sig åt genom vilken organism som bildar dem (växt respektive djur) och något i kedjornas exakta förgrening/uppbyggnad.", 3),
  Q("Beskriv med egna ord hur glukos från fotosyntesen till sist kan bli en del av ett muskelprotein hos ett djur som äter växten.",
    "Växten bygger glukos genom fotosyntesen. Djuret äter växten och bryter ner kolhydraterna genom matspjälkningen. Kroppen kan använda byggstenarna och energin därifrån, bland annat för att bygga upp egna molekyler som proteiner (med hjälp av kväve och andra ämnen från maten).", 4),
 ]},
]}


PROV = {"sections": [
 {"title": "Del I – E-nivå (grundläggande)", "questions": [
  Q("Skriv ordekvationen för fotosyntesen.",
    "Koldioxid + vatten (+ ljusenergi) → druvsocker + syrgas.", 2),
  Q("Skriv formelekvationen för cellandningen.",
    "C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O (+ energi)", 2),
  M("Para ihop varje begrepp med rätt beskrivning.",
    ["Monosackarid", "Disackarid", "Polysackarid", "Glykosidbindning"],
    ["A. Bindning mellan två sockerenheter", "B. En enda sockerenhet", "C. Två sockerenheter bundna till varandra", "D. Många sockerenheter i en lång kedja"],
    "Monosackarid – B, Disackarid – C, Polysackarid – D, Glykosidbindning – A"),
  Q("Vilken monosackarid är stärkelse uppbyggd av?",
    "Glukos (druvsocker).", 1),
  Q("Vilka två sorters byggstenar bygger upp ett fett?",
    "Glycerol och fettsyror.", 1),
  Q("Vad avgör om en fettsyra är mättad eller omättad?",
    "Antalet dubbelbindningar i fettsyrans kolkedja.", 2),
  Q("Vilka fyra grundämnen kan ingå i en aminosyra?",
    "Kol (C), väte (H), syre (O) och kväve (N) – dessutom svavel (S) i vissa aminosyror.", 2),
  Q("Vad kallas bindningen mellan två aminosyror i ett protein?",
    "Peptidbindning.", 1),
  Q("Ge ett exempel på ett protein som är ett enzym och förklara kort vad ett enzym gör.",
    "Valfritt exempel på enzym, t.ex. amylas eller pepsin. Ett enzym påskyndar en kemisk reaktion i kroppen.", 2),
 ]},
 {"title": "Del II – C-nivå (förklara och tillämpa)", "questions": [
  Q("Förklara sambandet mellan fotosyntes och cellandning genom att jämföra vad som byggs upp respektive bryts ner i de två reaktionerna.",
    "Fotosyntesen bygger upp druvsocker och syre av koldioxid och vatten med hjälp av ljusenergi. Cellandningen är den omvända reaktionen: druvsocker och syre bryts ner till koldioxid och vatten, och energi frigörs. De är alltså varandras motsatser.", 4),
  Q("Förklara varför stärkelse och cellulosa ser och fungerar olika trots att båda är uppbyggda av glukos.",
    "Glukosenheterna är bundna på olika sätt (olika glykosidbindning/vinkel mellan enheterna). I stärkelse gör bindningen att kedjan böjer sig i en spiral, vilket gör att människans enzymer kan bryta ner den. I cellulosa gör bindningen att kedjan blir rak och utsträckt, vilket ger stabila fibrer som människans enzymer inte kan bryta ner.", 5),
  Q("Förklara på molekylnivå varför omättat fett (t.ex. olivolja) är flytande vid rumstemperatur medan mättat fett (t.ex. smör) är fast.",
    "Mättade fettsyrors raka kedjor kan packas tätt, vilket ger starkare bindningar mellan molekylerna och ett fast ämne. Omättade fettsyrors dubbelbindningar ger en knäck i kedjan som gör att molekylerna packas glesare, så ämnet blir flytande.", 5),
  Q("Beskriv hur ett protein byggs upp steg för steg, från enskilda aminosyror till en peptidkedja.",
    "Aminosyror har en aminogrupp, en karboxylgrupp och en sidokedja. Karboxylgruppen på en aminosyra binder till aminogruppen på nästa i en peptidbindning, och en vattenmolekyl frigörs vid varje bindning. Upprepas detta många gånger bildas en lång kedja – ett protein.", 5),
  Q("Förklara vad som händer när ett protein denatureras, och varför det förändrar proteinets funktion.",
    "Proteinets tredimensionella form vecklas ut eller förändras, till exempel av värme eller stark syra/bas. Eftersom proteinets funktion (t.ex. som enzym) beror på dess exakta form, slutar det fungera som det ska när formen förändras.", 4),
 ]},
 {"title": "Del III – A-nivå (resonera och dra slutsatser)", "questions": [
  Q("En elev påstår: \"Stärkelse är samma sak som fett fast i fast form, eftersom båda ger energi.\" Bedöm påståendet kemiskt och förklara vad som faktiskt skiljer de två ämnesgrupperna åt, både i uppbyggnad och i energiinnehåll.",
    "Påståendet stämmer inte kemiskt. Stärkelse är en polysackarid uppbyggd av glukosenheter (kol, väte, syre i ett fast förhållande). Fett är en triglycerid uppbyggd av glycerol och fettsyror, bundna med esterbindningar, och har en helt annan molekylstruktur. Fett innehåller dessutom ungefär dubbelt så mycket energi per gram som stärkelse (kolhydrater), vilket beror på att fettmolekylens många C–H- och C–C-bindningar frigör mer energi vid nedbrytning än kolhydraters mer syrerika struktur.", 6),
  Q("Förklara med hjälp av hydrogenering (härdning) varför flytande vegetabilisk olja kan göras om till ett margarin som är fast i kylskåpstemperatur, och koppla svaret till begreppen mättad/omättad fettsyra.",
    "Hydrogenering tillsätter väte till de omättade fettsyrornas dubbelbindningar, så att dubbelbindningarna försvinner (fettsyrorna blir mer mättade). Mättade, raka fettsyrekedjor packas tätare och ger ett fastare fett, vilket är varför härdat vegetabiliskt fett (margarin) kan vara fast trots att den ursprungliga oljan var flytande.", 5),
  Q("Ett enzym slutar fungera efter att ha värmts upp till 90 °C, men fungerar normalt igen efter avkylning om det bara värmdes till 45 °C. Förklara skillnaden med hjälp av begreppet denaturering.",
    "Vid 45 °C har proteinets form troligen inte förändrats permanent (eller bara delvis), så det kan återfå sin funktionella form vid avkylning. Vid 90 °C denatureras proteinet – dess tredimensionella struktur bryts ner så pass mycket att det inte kan vecklas tillbaka till sin ursprungliga, fungerande form, och enzymet förblir inaktivt även efter avkylning.", 5),
  Q("Resonera kring varför människan kan använda stärkelse som energikälla men inte cellulosa, trots att båda är uppbyggda av samma monosackarid. Vad hade krävts för att vi skulle kunna utnyttja cellulosa som energikälla, och vilka djur klarar detta?",
    "Skillnaden ligger i bindningstypen mellan glukosenheterna (α- respektive β-bindning), vilket ger olika molekylform. Människans matspjälkningsenzymer är anpassade för att bryta stärkelsens bindningstyp men inte cellulosans. För att utnyttja cellulosa hade vi behövt enzymer (cellulaser) som kan klyva den bindningstypen – något t.ex. idisslare som kor har tillgång till via mikroorganismer i vommen, som bryter ner cellulosa åt dem.", 6),
 ]},
]}
