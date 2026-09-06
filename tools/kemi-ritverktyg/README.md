# Kemi-ritverktyg – strukturformler och kulmodeller

Två fristående Node-skript som ritar kemiska bilder till NO-sajten i vår låsta husstil.
Ren JavaScript, inga beroenden (OpenChemLib behövs bara om vi vill validera/exportera .mol).

## strukturformler.js  (2D, skolboksstil)
Utvecklad strukturformel: alla atomer utskrivna, räta vinklar.
- INK #14213d, STEP 35 (bindningslängd), lucka 11, font 21, streck 1,25.
- Alla bindningar lika långa. Dubbel = 2 streck (offset ±3,5), trippel = 3 (±6), samma längd som enkel.
- Dubbelbindning i änden (t.ex. eten): ändkolets två väten i Y-form, ELEV = 45° från vågrätt.
- Envärda alkoholer: rita ut O–H med egen bindning. Flervärda (glykol, glycerol): -OH som grupp + xscale 1,25 (25 % bredare kolkedja så grupperna får luft).
- Summaformlernas siffror: sub 0,6em.
Kör: `node strukturformler.js`  → images/kemi/kol-och-kolforeningar/strukturformler/

## kulmodeller.js  (GAMMAL, ersatt sep 2026 - ligger kvar bara som referens)
Ritade statiska SVG-bilder av kulmodeller. ANVÄNDS INTE LÄNGRE.

## kulmodeller3d.py + chembuilder.py  (3D ball-and-stick, AKTUELL, sep 2026-)
BESLUT sep 2026: kulmodeller ska vara INTERAKTIVA, roterbara/zoombara 3D-modeller
inbäddade med 3Dmol.js (öppen källkod, WebGL, github.com/3dmol/3Dmol.js) direkt på
sidorna - inte färdigritade bilder. chembuilder.py är Python-motorn som räknar ut
3D-koordinater (VSEPR, se filens docstring för alla byggregler/konventioner -
zigzag-kedjor, metylgruppers vridning, karboxyl-/estergruppens plana 120°-vinkel,
mm). kulmodeller3d.py är dokumentationen/receptet i klartext.
Läs BÅDA filerna innan du ritar en ny förening - alla mönster (raka kedjor,
alkoholer, syror, estrar, alkener, alkyner) och färgkonventionerna (kol: sfär
#4d4d4d, pinne #777777 - INTE samma, annars ser kol-kol-bindningar svarta ut)
finns där. 3Dmol-min.js ligger som en delad statisk fil på /js/3Dmol-min.js
(ingen CDN, fungerar offline) och länkas in med en vanlig <script src>-tagg -
bäddas INTE in i varje enskild HTML-fil (det var bra för en fristående
mockup-sida, men på riktiga sajtsidor räcker en delad fil, ~540 kB).

sep 2026: alla 12 föreningarna metan, etan, propan, eten, propyn, metanol,
etanol, metansyra, etansyra, propansyra, metylpropanoat och etylpropanoat har
fått fulla "kort" (namn + molekylformel + 2D-strukturformel + interaktiv
3D-kulmodell) i en ny sektion ("Utforska i 3D") i
kemi/kol-och-kolforeningar/studieguide.html. De tre SVG:erna för
propansyra/metylpropanoat/etylpropanoat som saknades finns nu i
images/kemi/kol-och-kolforeningar/strukturformler/.

sep 2026 (uppföljning): kulmodellerna vävdes in "både och" i studieguiden -
hela galleriet ligger kvar sist, plus en liten .mini3d-box direkt bredvid
2D-formeln varje gång en förening redan nämns i löptexten. Tre buggar
rättade: (1) fristående karboxylsyrors (metansyra/etansyra/propansyra) =O/-OH
låg fel väg i chembuilder.py - rättat i carbonyl_group()/build_acid() så =O
pekar nedåt och -OH uppåt (samma skelett som etanol-"fyllehunden"; estrarnas
konvention opåverkad). (2) Dubbel-/trippelbindningar (eten/propyn) ritas nu
manuellt med tydligt större mellanrum mellan pinnarna (verifierat mot modern
forskning - bent bond-modellen är fortfarande vetenskapligt giltig). (3)
Pekplatte-/mushjulszoom dämpad kraftigt (var för känslig). Se kulmodeller3d.py
regel 9-11 för detaljer. Molekylformlernas siffror i galleriet är nu riktiga
<sub>-taggar. Alla kulmodell-boxar lat-laddas (IntersectionObserver) av
prestandaskäl eftersom sidan nu kan ha 20+ av dem samtidigt.

sep 2026 (andra rundan): zoom-riktningen var bakvänd (isärdragna fingrar
förminskade) - rättad och verifierad empiriskt (inte bara utläst ur koden).
Dubbel-/trippelbindnings-breddningen gäller nu ALLA sådana bindningar
(order>=2 detekteras automatiskt), inte bara C=C/C#C - alltså även C=O i
syror/estrar. Etyn fick en egen kulmodell (build_ethyne() i chembuilder.py).
Viktig lärdom: CSS som skalar en SVG efter en gemensam pixelhöjd skalar även
dess inbäddade font-size, så SVG:er med olika viewBox-höjd (även med samma
font-size i källkoden) kan se olika stora ut - fixat genom att ge etyn.svg,
propyn.svg, metansyra.svg och vatten.svg samma viewBox-höjd som sina
referensmolekyler (padding, inte omritning). M7 (syrorna) fick tabell-layout
(CSS grid) och M8:s reaktionsrad grupperar produkterna så de wrappar
tillsammans. Flerradiga bildtexter vänsterjusterades.

## Arbetsgång
1. Claude bestämmer innehållet (namn, summaformel, kondenserad, SMILES/bindningar) – kemin.
2. Skriptet ritar (geometrin). Aldrig frihands-SVG eller bild-AI för strukturer.
3. Jesper granskar snabbt. 4. Spara namn.svg. 5. Återanvänd i text, frågor, prov, facit och spel.

Uppdatera de här skripten (strukturformler.js, chembuilder.py, kulmodeller3d.py)
OCH minnet/skillen varje gång vi optimerar en ritfunktion - gäller oberoende av
vilken session/dator det görs ifrån.
