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

## statiska-kulmodeller/  (PNG-bilder till studieguidens bildkolumn, sep 2026)
BESLUT sep 2026 (tredje rundan): studieguiden fick en bred layout med bildkolumn bredvid texten
(se CLAUDE.md, "Bred studieguide med bildkolumn"). Där ligger varje molekyl som ett kort med namn +
molekylformel + 2D-strukturformel + kulmodell som STATISK PNG. De små live-3D-rutorna (.mini3d)
är borta ur löptexten (de åt WebGL-kontexter) - rotation finns BARA i galleriet "Utforska i 3D" (M10),
dit varje kort länkar (`#km-<stem>`). Galleriet växte från 12 till 21 modeller och släpper WebGL-kontexter
för boxar som rullats ur bild.
- `render_kulmodeller.py` - renderar alla (eller angivna) molekyler i MOLS/MULTI i studieguiden till
  images/kemi/kol-och-kolforeningar/kulmodeller/<stem>.png. Fast skala 34 px/Å (PPA=...), rotX -25;
  diolerna/glycerol ses från andra hållet (rotX +25) så att OH-grupperna inte döljs. Resultatet är
  bit-för-bit reproducerbart. HTML-attribut: width/height = PNG-storlek / 3 (skrivs ut av skriptet).
- `render_allotroper.py` + `allotroper.py` - kolets former (diamant, grafit, fulleren C60, grafen,
  nanorör) genereras som atomlistor ur kända kristallstrukturer (bindningar efter avstånd, kontrollerade
  mot grannantal och bindningslängd) och renderas med samma metod. Egna sfär-/pinnstorlekar per bild för
  läsbarhet (diamant/fulleren/nanorör lättare); nanoröret visas som halvt rör (CUTZ), annars täcker
  väggarna varandra. Bilderna är förenklade (alla bindningar som enkla pinnar).
- `render-kulmodeller.html` + `_server.py` - renderhjälpen: 3Dmol.js (ortografisk projektion, samma
  stilregler som galleriet, `modelToScreen` sätter exakt px/Å) i headless Chromium via Playwright
  (mjukvaru-WebGL, inget grafikkort behövs). Kräver `pip install playwright pillow` + `playwright install chromium`.
- chembuilder.py fick `build_rdkit(smiles)` (RDKit ETKDG + MMFF94, mest utsträckta lågenergikonformer,
  orienterad längs axlarna) för föreningar utan handbyggt mönster: glykol, propan-1,2-diol, glycerol,
  glycin, 2-metylbutan - samt `check_geometry(atoms, bonds)` som skriver ut bindningslängder/vinklar
  att kontrollera mot förväntat innan bilden godkänns. Kräver `pip install rdkit`.
Ny molekyl: 1) bygg med chembuilder (build_alkane/acid/ester/... eller build_rdkit), 2) `check_geometry`,
3) `write_molblock` -> lägg i MOLS (+ MULTI för dubbel-/trippelbindningar) i studieguiden, 4) rita 2D-SVG med
strukturformler.js, 5) kör render_kulmodeller.py <stem>, 6) lägg kortet i bildkolumnen och galleriet.

sep 2026 (fjärde rundan, Jespers önskemål efter första granskningen):
1) Dubbel-/trippelbindningar ritas som UTÅTBÖJDA BÅGAR och med tunnare pinnar (radie 0,06/0,05 mot
   enkelbindningens 0,12) - se regel 9 i kulmodeller3d.py. Funktionen addMultiBond finns i studieguidens
   script OCH i render-kulmodeller.html och ska hållas identisk. Alla PNG:er för molekyler med
   dubbel-/trippelbindning renderades om (och img-storlekarna i HTML uppdaterades, eftersom bågarna ändrar
   bildens bounding box). Rättade en bugg: glycin, butansyra och etylbutanoat hade C=O kvar i molblocket.
2) Kolets former är nu ROTERBARA 3Dmol-vyer direkt i M2 (`.mc-viewer`, skapas lat och släpps när de
   lämnar bild) - undantaget från "statiska PNG i löptexten", eftersom just den tredimensionella
   strukturen är poängen. Små kulor (allotroper.STIL = sfärskala 0,14 / pinnradie 0,062) så att man ser
   igenom strukturen; diamanten är ett kluster på 87 atomer (35 med fyra grannar). Modellerna ligger i
   MOLS (skapade med `allotroper.molblocks()`), startvyer/stil i STYLE/VIEW i sidans script. PNG:erna
   från render_allotroper.py är bara reserv (noscript). render_kulmodeller.py hoppar över kolformerna.

## atomer/bygg_atomer.py  (Atomer och molekyler, sep 2026)
Bygger ALLT bild- och modellmaterial till `kemi/atomer/`: `kemi/atomer/js/molmodeller.js` (`window.MOLDATA`
med molblock, dubbel-/trippelbindningar, vyer och texter – läses av `js/molviewer.js`), 2D-strukturformler
(`images/kemi/atomer/strukturformler/*.svg`), förenklade atommodeller (väte, helium, kol + atomnyckel) och
statiska kulmodell-PNG:er (`kulmodeller/`, reserv utan JavaScript och miniatyrer i dra-och-släpp/index).
Kör `python3 tools/kemi-ritverktyg/atomer/bygg_atomer.py` (allt), `… data` (bara JS + SVG) eller `… png`
(kräver playwright + pillow + chromium). Ny molekyl: lägg en rad i MOLS (atomer i Å, bindningar som (i, j, ordning)),
kör, läs `check_geometry`-utskriften och titta på PNG:en. Ordning >= 2 skrivs inte in i molblocket – `molviewer.js`
ritar utåtböjda bågar (regel 9 i kulmodeller3d.py); valfri `rot` (grader) vrider bågarnas plan runt bindningsaxeln
(används i `render-kulmodeller.html` som `spec.rot`, så att PNG och live-3D ser likadana ut).
Skillnad mot kolkapitlet: här ligger live-3D direkt i studieguiden (få molekyler); se CLAUDE.md, "Live-3D i korta kemikapitel".

## Arbetsgång
1. Claude bestämmer innehållet (namn, summaformel, kondenserad, SMILES/bindningar) – kemin.
2. Skriptet ritar (geometrin). Aldrig frihands-SVG eller bild-AI för strukturer.
3. Jesper granskar snabbt. 4. Spara namn.svg. 5. Återanvänd i text, frågor, prov, facit och spel.

Uppdatera de här skripten (strukturformler.js, chembuilder.py, kulmodeller3d.py)
OCH minnet/skillen varje gång vi optimerar en ritfunktion - gäller oberoende av
vilken session/dator det görs ifrån.
