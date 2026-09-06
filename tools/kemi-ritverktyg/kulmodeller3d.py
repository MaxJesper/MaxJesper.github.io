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
   carbonyl_pos, kind) i chembuilder.py bygger hela gruppen och valjer
   AUTOMATISKT vilken av de tva riktningarna som blir =O (den med storst
   y-varde, dvs "uppat") enligt Jespers konvention - ingen manuell
   hardkodning av upp/ned behovs langre. kind="acid" ger (=O, -OH+H, med
   OH-vatet placerat via oh_hydrogen() i syn-konformation mot =O). kind=
   "ester" ger (=O, esterbryggans -O-, utan vate).
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
