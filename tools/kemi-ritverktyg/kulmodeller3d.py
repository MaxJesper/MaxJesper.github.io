"""
kulmodeller3d.py -- generell motor for interaktiva 3D-kulmodeller (3Dmol.js)
till NO-plattformen. Ersatter det gamla kulmodeller.js (statiska SVG-bilder)
enligt beslut sep 2026: kulmodeller ska nu vara riktiga, roterbara/zoombara
3D-modeller inbaddade med 3Dmol.js, inte fardigritade bilder.

Denna fil racker for att aterskapa hela byggmotorn i en ny session -
lasa den innan nagon ny forening ritas. All byggkod finns i chembuilder.py
i samma mapp.

== GEOMETRI (VSEPR, idealiserad) ==
  TET (sp3-vinkel)      = 109.5 grader
  sp2-vinkel (karbonyl/alken) = 120 grader, plant (z=0)
  sp-vinkel (alkyn)     = 180 grader, linjart
  BOND_CH               = 1.09 A   (sp3 C-H)
  BOND_CH_SP2           = 1.09 A   (alken C-H)
  BOND_CH_SP            = 1.06 A   (terminal alkyn C-H)
  BOND_CC               = 1.54 A   (sp3-sp3 enkelbindning)
  BOND_CC_DOUBLE        = 1.33 A   (C=C, alken)
  BOND_CC_TRIPLE        = 1.20 A   (C#C, alkyn)
  BOND_CC_SP_SINGLE     = 1.46 A   (sp-sp3 enkelbindning, t.ex. alkyn->metyl)
  BOND_CO_SINGLE        = 1.43 A   (alkohol/eter-syre)
  BOND_CO_ESTER         = 1.36 A   (estersyrets brygg-syre till karbonylkolet)
  BOND_C_ODOUBLE        = 1.20 A   (C=O)
  BOND_OH               = 0.96 A

  Validering: PubChems riktiga 3D-sdf-data for etanol (CID 702 - OBS: filen
  Jesper laddade ner och kallade "Metanol.sdf" ar i sjalva verket ETANOL,
  identifierat via atomantalet C2H6O och CID:t) gav uppmatta varden C-O
  1.42 A, O-H 0.97 A, C-C 1.51 A, alla vinklar 106-111 grader - allt inom
  någon procent av de idealiserade varden ovan. De idealiserade vardena ar
  saledes tillrackligt noggranna for undervisningssyfte.

== BYGGREGLER ==
1. Raka kolkedjor byggs som zigzag i xy-planet (z=0) med build_zigzag_chain()
   / build_alkane(n). Vinkel 109.5 grader hela vagen. build_zigzag_chain/
   extend_chain_inplane anvander atomen TVA STEG BAKAT (prev2) for att avgora
   vilken av de tva mojliga speglingarna som fortsatter kedjan FRAMAT utan
   att vika tillbaka - att jamfora avstand till bara narmast foregaende atom
   (prev) fungerar INTE, eftersom bada speglingarna da alltid ligger exakt
   lika langt bort (det var en bugg vi rakade ut for och loste sep 2026).

2. Terminala metylgrupper (CH3): methyl_hydrogens(center, granne, fas) ger 3
   vateatomer i kon runt bindningsaxeln. Vilken fas som ger "ratt" visuell
   uppat/nedat-riktning beror pa geometrin och kan INTE gissas/harkodas -
   anvand pick_methyl_phase(center, granne, want_sign) som provar bada
   faserna (0 och pi) och valjer den som ger flest vateatomer at ratt hall.

3. Interna CH2-grupper: ch2_hydrogens(center, granne1, granne2) fyller ut
   tetraedern givet de tva befintliga bindningarna (fungerar for VILKEN
   vinkel de tva grannbindningarna an har, sa lange molekylen ar en enkel
   kedja).

4. Karboxylsyror (-COOH) och estrar (-COO-): karbonylkolet ar sp2, plant.
   sp2_planar_substituents(existing_dir) ger de tva ovriga riktningarna i
   SAMMA PLAN (z=0) vid 120 grader. carbonyl_group(prev_carbon,
   carbonyl_pos, kind) i chembuilder.py bygger hela gruppen. OBS - RATTAD
   sep 2026 (Jesper paptalade att fristaende syror sag fel ut, "stod med
   frambenen pa en boll"): estrar (kind="ester") behaller den ursprungliga
   konventionen dar =O far den riktning som ger storst y ("uppat"). Men
   fristaende karboxylsyror (kind="acid") far numera OMVAND riktning: =O
   pekar NEDAT och -OH UPPAT, sa att syran far EXAKT samma skelett som
   "etanol-hunden" (regel 6 nedan) - karbonylkolets =O hamnar dar den
   "framatriktade" tail-vatet skulle sitta (nedat, "mellan bakbenen"), och
   -OH blir "huvudet" upptill med sitt eget vate nedat som "nos". Detta
   galler ALLA fristaende syror (metansyra, etansyra, propansyra) - bade
   build_acid()s specialfall for n_carbon=1 och det generella fallet via
   carbonyl_group() andrades. Estrarnas uppat-konvention paverkas INTE.
   kind="acid" ger (=O, -OH+H, med OH-vatet placerat via oh_hydrogen() i
   syn-konformation mot =O). kind="ester" ger (=O, esterbryggans -O-, utan
   vate).
   build_acid(n_carbon) bygger en hel karboxylsyra (n_carbon=1 -> metansyra/
   myrsyra som specialfall utan alkylkedja, n_carbon=2 -> etansyra, osv).
   build_ester(n_acyl, n_alkyl) bygger en hel ester (n_acyl = antal kol i
   syradelen inkl. karbonylkolet, n_alkyl = antal kol i alkoholdelen,
   metyl=1, etyl=2).

5. Estrar: esterbryggans syre (-O-, ingen vate) fortsatter kedjan in i
   alkoholdelen precis som vilken annan lank som helst - hela ryggraden
   (alkylkedja -> karbonylkol -> bryggsyre -> alkoholkedja) byggs som EN
   obruten zigzag-kedja med extend_chain_inplane + prev2 (regel 1). Enda
   specialfallet ar forsta steget efter bryggsyret (dar prev2 annars saknas)
   - dar anvands atomen FORE karbonylkolet som prev2, vilket ger en obruten,
   icke-vikande fortsattning helt automatiskt (bekraftat pa propylbutanoat
   sep 2026 - ingen manuell upp/ned-styrning behovdes).

6. Alkoholer (metanol, etanol - "etanol-hunden"): den terminala -OH-
   syreatomen laggs till som NASTA zigzag-lank med extend_chain_choose
   (prefer="up") eftersom den (liksom karbonylkolet i regel 5) saknar
   prev2 vid forsta placeringen. Dess vate placeras med samma tvasidiga
   109.5-gradersformel som oh_hydrogen anvander, och den "framatriktade"
   (storst x) losningen valjs sa att vatet pekar bort fran kedjan - det ger
   automatiskt (utan nagon extra kod) att foregaende CH2-grupps tva vateatomer
   hamnar at "ned"-hallet, vilket ar precis Jespers "fyllehund"-konvention:
   C, 2H ned, 1H upp, C, 2H ned, syre upp, vate ned/framat (se build_ethanol()
   i chembuilder.py for exakt implementation).

7. Alkener (eten): HELT PLANA (z=0 for alla atomer) - kemiskt korrekt,
   eftersom C=C-pi-bindningen forhindrar rotation mellan kolen. Bygg med
   build_ethene(): varje sp2-kol far sina tva vateatomer via
   sp2_planar_substituents() runt C=C-axeln, 120 grader mellan alla
   bindningar. (Jespers ursprungsforslag om 90 graders fasforskjutning var
   en missuppfattning - han bekraftade sep 2026 att kemiskt korrekt/plant
   ska galla istallet.)

8. Alkyner (propyn): de tva sp-kolen i trippelbindningen ar HELT LINJARA
   (180 grader) - bygg med build_propyne(): H-C#C-CH3 laggs ut langs en
   rak linje (x-axeln), och den avslutande metylgruppen ar en vanlig sp3-
   grupp (methyl_hydrogens) fast pa den sista sp-kolatomen.

9. Visuell separation mellan flerdubbla bindningar (ALLA dubbel-/trippel-
   bindningar - eten C=C, etyn/propyn C#C, OCH karbonylens C=O i syror/
   estrar - utokat sep 2026 fran att bara galla C=C/C#C): pa Jespers begaran
   ritas dessa INTE med 3Dmol.js:s inbyggda, ganska smala dubbel-/
   trippelstreck. Istallet detekteras ALLA bindningar med order>=2 i
   bond-listan automatiskt (se gen_molblocks4.py-monstret: `[bd for bd in
   bonds if bd[2]>=2]`) och stryks ur MOL-blocket som skickas till 3Dmol,
   och alla 2 (dubbel)
   eller 3 (trippel) pinnar ritas manuellt i JS med viewer.addCylinder(),
   forskjutna vinkelratt mot bindningsaxeln med ett gap (0.17 A) som ar
   klart storre an 3Dmol:s standardavstand. For trippelbindningen ligger de
   tre pinnarna symmetriskt fasforskjutna 120 grader runt axeln (samma
   3-faldiga symmetri som "banan-bindnings"-bilden av en trippelbindning -
   se forskningsnoteringen nedan). Detta ar en ren RENDERINGS-atgard, INTE
   en andring av den underliggande geometrin/bindningsvinklarna.
   Forskningskoll (WebSearch sep 2026, pa Jespers begaran, innan
   implementation): den bojda bindnings-modellen ("bent bond"/"banana
   bond") - dar en dubbel- eller trippelbindning beskrivs som tva/tre
   bagformade elektrontathetsomraden som buktar utat fran varandra istallet
   for en rak sigma- + en eller tva raka pi-bindningar - ar INTE en
   foraldrad eller motbevisad modell. Den ar matematiskt EKVIVALENT med den
   vanligare sigma/pi-molekylorbitalbilden (samma totala elektrontathet,
   bara en annan bas av orbitaler), och forblir en giltig alternativ
   beskrivning i modern kvantkemi - sigma/pi-bilden har bara blivit
   vanligare i laroböcker. Jespers ursprungliga "elektronerna vill vara sa
   langt ifran varandra som mojligt"-intuition ar darmed en rimlig,
   fortfarande vetenskapligt forsvarbar bild for undervisningssyfte, aven
   om den inte ar den enda ratta. (Kalla: Wikipedia "Bent bond", som bl.a.
   citerar Kenneth B. Wibergs slutsats att sigma/pi- och bent bond-
   beskrivningarna av eten kan betraktas som ekvivalenta.)
   VIKTIGT ATT VETA OM 3D-RENDERINGEN: eftersom kamerans standardvinkel i
   3Dmol.js:s zoomTo() ofta rakar titta nastan rakt langs en av
   forskjutningsriktningarna kan tva av de tre trippelbindnings-pinnarna
   se ut att smalta ihop till en fran vissa vinklar - detta forsvinner nar
   man roterar molekylen for hand (vilket ocksa ar hela poangen med att
   den ar interaktiv). Dubbelbindningen i eten syns tydligt separerad fran
   praktiskt taget alla vinklar eftersom molekylen ar helt plan.

10. Zoom-kanslighet OCH -riktning (pekplatta/mushjul): 3Dmol.js:s inbyggda
    scroll/pinch-zoom ar for kanslig for elever att styra (Jespers
    rattelse sep 2026). Losning: en egen "wheel"-lyssnare laggs pa
    YTTRE .km-viewerbox-elementet med {capture:true, passive:false} -
    eftersom den kors i CAPTURE-fasen pa en FORALDER till 3Dmol.js:s egen
    canvas hinner den fore, och ev.stopPropagation() forhindrar sedan att
    3Dmol.js:s egen (kansligare) hantering nagonsin nas. Var egen hanterare
    dampar deltaY kraftigt (klipper till +-25, mycket lag känslighetsfaktor,
    annu lagre nar ev.ctrlKey ar sant - sa rapporterar webblasare
    tva-fingers-nyp pa styrplattan) och anropar viewer.zoom(factor, 0) med
    en klampad faktor (0.94-1.06 per handelse) istallet.
    RIKTNING - RATTAD sep 2026 (var bakvand forst): `factor = 1 +
    clamped*sensitivity` (INTE `1 - ...`) - Jesper testade och bekraftade
    att detta tecken ger "dra isar tva fingrar = forstora", som pa alla
    andra sajter/kartor. Testa alltid empiriskt (t.ex. med ett syntetiskt
    WheelEvent {deltaY:-20, ctrlKey:true} i Playwright, upprepat manga
    ganger, och jamfor skarmdump fore/efter) - den teoretiska harledningen
    fran 3Dmol-kallkodens zoom()-funktion (som visar att factor>1 ZOOMAR IN
    rent matematiskt) racker INTE for att sjalv gissa vilket tecken pa
    deltaY som motsvarar "dra isar" i webblasarens ctrl+wheel-emulering av
    pekplatte-nyp - den kan skilja mellan plattformar/webblasare.

11. Prestanda vid manga kulmodeller pa samma sida: sedan kulmodellerna nu
    bade ligger i galleriet ("Utforska i 3D") OCH vavs in bredvid 2D-
    strukturformlerna i loptexten (se nedan) kan en enda sida innehalla
    20+ separata 3Dmol-viewers. For att inte skapa alla WebGL-kontexter
    samtidigt pa sidladdning (dyrt, och onodigt for det som anda inte
    syns an) skapas varje viewer FORST nar dess .km-viewerbox rullas in i
    vy, via en IntersectionObserver (rootMargin 200px) som lyssnar pa alla
    element med data-mol-attributet. Varje .km-viewerbox har darfor ett
    data-mol="nyckel"-attribut (istallet for att bara nycklarna i MOLS-
    objektet styr vilket element som fylls) - det gor att SAMMA molekyl kan
    visas i flera olika boxar pa sidan (t.ex. metan bade i M1 och i
    galleriet) utan att molblocket eller byggkoden dupliceras.

12. VIKTIG 2D-SVG-LARDOM (upptackt sep 2026): CSS-regeln
    `.mol-fig img { height:108px; width:auto }` (och motsvarande for
    `.rxn .mol img { height:96px }`) skalar HELA SVG:n - inklusive dess
    inbaddade font-size - efter en enda gemensam pixel-hojd. Tva SVG:er kan
    ha EXAKT samma `font-size="21"` i kallkoden och anda se olika stora ut
    pa sidan, om deras `viewBox`-HOJD skiljer sig - en kortare/plattare
    viewBox (t.ex. etyn utan nagra atomer over/under huvudraden) skalas UPP
    mer av CSS:en och far darfor STORRE synlig text an en molekyl med en
    hogre viewBox (t.ex. propyn med bade en topp- och en bottenvate).
    LARDOM: for att flera strukturformler ska se lika stora ut i SAMMA rad/
    figur maste deras `viewBox`/`width`/`height`-HOJD vara IDENTISK, oavsett
    om molekylen faktiskt "anvander" hela den hojden eller inte - fyll ut
    med osynlig marginal (padding) runt den ritade molekylen istallet for
    att beskara viewBox tatt runt konturerna. Vid rattelse: hall
    huvudradens y-koordinat (oftast y=61 i STEP=35-konventionen, eller
    y=50.75 for de "plana"/kortare figurerna som eten) OFORANDRAD och lagg
    till/ta bort lika mycket marginal upptill och nedtill (skift alla
    y-koordinater med samma delta = (ny_hojd - gammal_hojd)/2) - rita INTE
    om molekylen fran grunden bara for att andra en marginal.
    Konkreta rattelser sep 2026: etyn.svg och propyn.svg (i M4, med eten
    som referens) fick bada sin viewBox-hojd andrad till 101.5 (etens hojd)
    - etyn (var 52) skiftades +24.75, propyn (var 122) skiftades -10.25.
    metansyra.svg (i M7, med etansyra/butansyra som referens) fick sin
    viewBox-hojd andrad fran 87 till 122 UTAN nagon koordinatskiftning,
    eftersom dess huvudrad redan lag pa y=61 - exakt samma som i etansyra/
    butansyra. vatten.svg (i M8:s esterreaktion, med etanol/butansyra/
    etylbutanoat som referens) fick sin viewBox-hojd andrad fran 73.4 till
    122, skiftad +24.3 for att centrera huvudraden pa y=61.

13. Bildtexter (figcaption) som blir mer an en rad ska INTE centreras
    (text-align:center gor att varje rad far olika vansterkant, vilket ser
    sladdrigt/oplanerat ut) - `.mol-fig figcaption` byttes sep 2026 till
    `text-align:left` (med en max-bredd och auto-marginaler for att
    fortfarande centrera BLOCKET som helhet i figuren) sa att rad 2, 3 osv
    alltid borjar i sidled pa samma stalle som rad 1.

14. Tabell-layout for flera foreningar i en figur (M7-monster, sep 2026):
    nar Jesper vill se flera foreningars 2D-formel + 3D-modell som en
    "tabell" (formlerna i en vanster-justerad kolumn, kulmodellerna i en
    hogerjusterad kolumn) racker INTE flexbox-`.mol-row` (som centrerar och
    kan hamna i olika bredd per rad nar molekylerna har olika kedjelangd).
    Anvand istallet CSS GRID: `.mol-table { display:grid;
    grid-template-columns:max-content max-content; ... }` och lagg varje
    molekyls tva `.mol`-divar (2D-bild, 3D-box) direkt som grid-barn i
    ordning, rad for rad - grid-motorn justerar da automatiskt bada
    kolumnerna konsekvent oavsett att bredderna varierar. En molekyl utan
    3D-modell (t.ex. butansyra i M7, som inte ar en av de 12 galleri-
    foreningarna) behover en tom `<div class="mol mini3d-placeholder">`
    som platshallare sa att grid-radernas tva-kolumns-monster inte
    forskjuts.

15. Reaktionsrad som inte far plats pa en rad (M8-monster, sep 2026): i
    `.rxn`-raden (reaktant + reaktant → produkt + produkt) ska PRODUKTERNA
    (ester + vatten) alltid halla ihop och hamna TILLSAMMANS pa en ny rad
    om allt inte far plats, ISTALLET for att bara det sista elementet
    (vattnet) tappar av for sig sjalvt (standard flex-wrap-beteende).
    Losning: gruppera produkterna i en egen `.rxn-products`-div
    (`display:flex; flex-wrap:nowrap`) inuti den yttre `.rxn`-flexboxen -
    da wrappar HELA gruppen som en enhet. En `margin-left` pa
    `.rxn-products` flyttar dessutom gruppen at hoger nar den hamnar pa sin
    egen rad, sa att den visuellt fortsatter "efter pilen" istallet for att
    ligga langst till vanster.

16. Etyn/acetylen (HC#CH) - ny KOMPLETTERANDE "bonus"-modell, sep 2026:
    `build_ethyne()` i chembuilder.py, samma monster som build_propyne()
    men med ett vate istallet for en metylgrupp pa C2. Anvands BARA som en
    liten kulmodell i M4 (dar etyn redan namns i loptexten) - INTE en av de
    12 fasta gallerimolekylerna i "Utforska i 3D".

== VILKA FORENINGAR FAR 3D + FULLT "KORT" I STUDIEGUIDEN (beslut sep 2026) ==
  Alkaner:     metan, etan, propan
  Alkener/-yner: eten (plant), propyn (linjar trippelbindning)
  Alkoholer:   metanol, etanol
  Syror:       metansyra, etansyra, propansyra
  Estrar:      metylpropanoat, etylpropanoat (tva olika fruktiga dofter)
  Ett kort = namn + molekylformel + 2D-strukturformel (befintlig SVG) +
  interaktiv roterbar 3D-kulmodell, sida vid sida. Implementerat som en
  ny sektion ("Utforska i 3D") i studieguide.html, byggd av build_all.py
  (se nedan) och verifierad med Playwright-screenshot innan publicering.

  BADE OCH (beslut sep 2026): Jesper ville ha kulmodellerna pa TVA stallen
  samtidigt, inte antingen eller. (1) Hela galleriet med alla 12 foreningar
  ligger kvar oforandrat langst ner i sektionen "Utforska i 3D" (id="m10").
  (2) DESSUTOM vavs en liten kulmodell-box (klass .mini3d, 150x140 px, se
  CSS) in DIREKT bredvid 2D-strukturformeln varje gang en av dessa
  foreningar redan namns i loptexten: metan (M1+M3), etan (M3), eten (M4),
  propyn (M4), metanol+etanol (M5), metansyra+etansyra (M7), etansyra
  (aterigen i M9:s aminosyra-fordjupning). Propan, propansyra,
  metylpropanoat och etylpropanoat namns INTE i loptexten (bara i
  galleriet) eftersom de inte forekommer i den befintliga, redan
  godkanda brodtexten - lagg till en .mini3d-box dar om/nar de nagonsin
  namns i framtiden. M1-figurens bildtext lankar dessutom till hela
  galleriet ("Utforska i 3D - rotera molekylerna sjalv") via <a href="#m10">.
  Introduktionsstycket i "Utforska i 3D"-sektionen har en instruktionsrad
  om hur man forstorar (skrolla/tva-fingersdra) och roterar (dra med ett
  finger/mus).

  MOLEKYLFORMLERNAS SIFFROR (sep 2026): i galleriets .km-formula-rader
  skrivs formlerna nu med riktiga <sub>-taggar (CH<sub>4</sub> osv, precis
  som i studieguidens loptext, t.ex. C<sub>n</sub>H<sub>2n+2</sub>) istallet
  for ren text (CH4). Ingen extra CSS behovdes for storlek/sankning -
  sidan har ALDRIG haft nagon egen sub{}-regel nagonstans (varken i
  studieguide.html:s <style> eller i /css/style.css), utan formlitar sig
  helt pa webblasarens inbyggda standardrendering av <sub>, vilket racker
  fint och ar exakt samma losning som redan anvands i loptexten.

== ARBETSFLODE FOR EN NY FORENING ==
  1. Anvand ratt byggfunktion i chembuilder.py: build_alkane(n),
     build_ethene(), build_propyne(), build_acid(n_carbon),
     build_ester(n_acyl, n_alkyl), build_methanol(), build_ethanol().
  2. Verifiera ALLTID numeriskt fore rendering: rakna ut alla vinklar
     (angle()) och bindningslangder (dist()) och kontrollera att de
     stammer (109.5 for sp3, 120 for sp2, 180 for sp) INNAN du bygger
     HTML/3Dmol-visningen. Detta har fangat flera buggar tidigare
     (spegelvanda riktningar, fel fasval, felindexerade atomer i
     verifieringskoden sjalv).
  3. write_molblock(atoms, bonds, title) -> MOL V2000-strang, laddas i
     3Dmol.js med viewer.addModel(mol, "sdf") (INTE "mol" - ger en
     formatgissningsvarning).
  4. Bygg HTML-kortet: se "Kortlayout i studieguiden" nedan.

== KORTLAYOUT I STUDIEGUIDEN ==
  Varje molekyl far ett .km-card med .km-formula, en .km-row som
  innehaller .km-2d (img mot befintlig SVG i
  /images/kemi/kol-och-kolforeningar/strukturformler/) och en
  .km-viewerbox (tom div dar 3Dmol.js skapar sin canvas).
  VIKTIG CSS-BUGG ATT UNDVIKA: .km-viewerbox MASTE ha
  "position:relative; overflow:hidden" - annars kan 3Dmol.js WebGL-
  canvasen rendera "flytande" uppe i vanstra hornet av HELA sidan
  istallet for inuti sin egen box (upptackt och atgardad sep 2026).
  Skapa ocksa 3Dmol-viewers inuti ett
  window.addEventListener("load", function(){...}) block, inte
  omedelbart i sidladdningen.
  3Dmol.js-biblioteket ligger sjalvhostat pa /js/3Dmol-min.js (INGEN
  CDN - cdnjs ar blockerat i molnmiljon) och laddas med en vanlig
  <script src="/js/3Dmol-min.js"></script>-tagg, delad av alla sidor
  som behover den (istallet for att baddas in helt i varje enskild
  HTML-fil, vilket var det ursprungliga forslaget for en fristaende
  mockup-sida - for den riktiga studieguiden ar en delad statisk fil
  battre eftersom biblioteket ar ~540 kB).

== FARGER (3Dmol.js, sep 2026) ==
  Kol:  sfar  #4d4d4d (morkare grid an standard, pa Jespers begaran)
        pinne #777777 (ljusare gra - INTE samma som sfarfargen, annars blir
              kol-kol-bindningar nastan svarta. Kol-vate-bindningar blir
              automatiskt ljusare eftersom vatets halva av pinnen forblir
              vit/standard.)
  Vate: standard (vit)
  Syre: standard (rod)
  Kvave: standard (bla) - anvands i aminosyra-fordjupningen

  3Dmol-installation (per viewer):
    viewer.setStyle({}, {stick:{radius:0.12}, sphere:{scale:0.28}});
    viewer.setStyle({elem:"C"}, {stick:{radius:0.12, color:"#777777"},
                                  sphere:{scale:0.28, color:"#4d4d4d"}});

== FIL-FORMAT ==
  MOL V2000 (write_molblock), laddas i 3Dmol.js med addModel(mol, "sdf").

Se chembuilder.py i samma mapp for all korformad Python-kod (geometri-
motorn + de generella byggarna for alkaner/alkener/alkyner/syror/estrar/
alkoholer).
"""
