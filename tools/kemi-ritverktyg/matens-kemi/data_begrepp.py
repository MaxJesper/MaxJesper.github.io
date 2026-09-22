# -*- coding: utf-8 -*-
"""Begrepp (kärnbegrepp), termer (övriga fetmarkerade ord) och checklista för Matens kemi.
Körs av bygg_data.py. Svenska definitioner är originalformulerade (se OVERLAMNING.md, "Originalitet").

Översättningarna till am/ar/bs/en/es/fa/pl/ps/rw/so/ur är AI-genererade och INTE korrekturlästa av
modersmålstalare (samma mönster/konfidensnivå som övriga kapitel, se CLAUDE.md). Engelska, spanska,
polska och bosniska definitioner är fullständiga; övriga språks definitioner är medvetet kortare
(en mening) för att hålla översättningsarbetet hanterbart men ändå ge riktig, användbar information –
inte platshållartext. Namnen (namn_native) är översatta för alla begrepp/termer i alla 11 språk.
"""

LANGS = ['am', 'ar', 'bs', 'en', 'es', 'fa', 'pl', 'ps', 'rw', 'so', 'ur']

# ----------------------------------------------------------------------------------------------
# KÄRNBEGREPP: namn (svenska) -> {"m": milstolpe, "def": svensk definition, "i18n": {lang: (namn, definition)}}
# ----------------------------------------------------------------------------------------------
BEGREPP = {
 "Fotosyntes": {"m": "m1",
   "def": "Processen där gröna växter bygger druvsocker (glukos) av koldioxid och vatten med hjälp av "
          "ljusenergi. Syrgas bildas som en biprodukt. Ordekvation: koldioxid + vatten + ljusenergi → "
          "druvsocker + syrgas.",
   "i18n": {
    "en": ("Photosynthesis", "The process where green plants build glucose from carbon dioxide and water using light energy, releasing oxygen gas."),
    "es": ("Fotosíntesis", "El proceso por el que las plantas verdes fabrican glucosa a partir de dióxido de carbono y agua usando energía luminosa, liberando oxígeno."),
    "pl": ("Fotosynteza", "Proces, w którym rośliny zielone budują glukozę z dwutlenku węgla i wody, wykorzystując energię światła, uwalniając przy tym tlen."),
    "bs": ("Fotosinteza", "Proces u kojem zelene biljke grade glukozu od ugljik-dioksida i vode uz pomoć svjetlosne energije, pri čemu se oslobađa kisik."),
    "ar": ("التمثيل الضوئي", "العملية التي تبني بها النباتات الخضراء الجلوكوز من ثاني أكسيد الكربون والماء باستخدام طاقة الضوء، مع إطلاق الأكسجين."),
    "fa": ("فتوسنتز", "فرآیندی که در آن گیاهان سبز با استفاده از انرژی نور، گلوکز را از دی‌اکسید کربن و آب می‌سازند و اکسیژن آزاد می‌شود."),
    "ur": ("فوٹو سنتھیسز", "وہ عمل جس میں سبز پودے روشنی کی توانائی سے کاربن ڈائی آکسائیڈ اور پانی سے گلوکوز بناتے ہیں اور آکسیجن خارج ہوتی ہے۔"),
    "ps": ("رڼا لخوا جوړونه (فوتوسنتیز)", "هغه پروسه چې ژېړ ونې د رڼا انرژي په مرسته د کاربن ډای اکساید او اوبو څخه glukos جوړوي او آکسیجن خوشې کوي."),
    "so": ("Iftiin-dhaliska", "Habka geedaha cagaaran ku dhisaan sonkorta (glucose) oo ka kooban kaarbon laba ogsaydh iyo biyo, iyagoo isticmaalaya tamarta iftiinka, oo soo saara ogsijiin."),
    "am": ("ፎቶሲንተሲስ", "አረንጓዴ ተክሎች የፀሐይ ብርሃን ኃይል ተጠቅመው ካርቦን ዳይኦክሳይድና ውሃን ግሉኮስ የሚሠሩበት ሂደት ሲሆን ኦክስጅን ያመነጫል።"),
    "rw": ("Fotosentezi", "Inzira ibimera bibisi byubakiramo isukari (glucose) bivuye muri gaze ya karubone n'amazi, bakoresheje imbaraga z'urumuri, bikavamo ogisijeni."),
   }},
 "Cellandning": {"m": "m1",
   "def": "Processen där celler bryter ner druvsocker med hjälp av syrgas för att frigöra energi som "
          "kroppen kan använda. Koldioxid och vatten bildas. Ordekvation: druvsocker + syrgas → "
          "koldioxid + vatten + energi. Cellandningen är alltså fotosyntesens motsats.",
   "i18n": {
    "en": ("Cellular respiration", "The process where cells break down glucose using oxygen to release usable energy, forming carbon dioxide and water — the reverse of photosynthesis."),
    "es": ("Respiración celular", "El proceso por el que las células descomponen la glucosa con oxígeno para liberar energía utilizable, formando dióxido de carbono y agua; lo contrario de la fotosíntesis."),
    "pl": ("Oddychanie komórkowe", "Proces, w którym komórki rozkładają glukozę przy użyciu tlenu, uwalniając energię oraz dwutlenek węgla i wodę – odwrotność fotosyntezy."),
    "bs": ("Stanično disanje", "Proces u kojem stanice razgrađuju glukozu uz pomoć kisika kako bi oslobodile energiju, pri čemu nastaju ugljik-dioksid i voda – suprotno fotosintezi."),
    "ar": ("التنفس الخلوي", "العملية التي تفكك بها الخلايا الجلوكوز باستخدام الأكسجين لإطلاق الطاقة، وينتج عنها ثاني أكسيد الكربون والماء – عكس التمثيل الضوئي."),
    "fa": ("تنفس سلولی", "فرآیندی که در آن سلول‌ها گلوکز را با اکسیژن تجزیه می‌کنند تا انرژی آزاد شود؛ دی‌اکسید کربن و آب تولید می‌شود، برعکس فتوسنتز."),
    "ur": ("خلوی تنفس", "وہ عمل جس میں خلیے آکسیجن کی مدد سے گلوکوز کو توڑ کر توانائی حاصل کرتے ہیں، کاربن ڈائی آکسائیڈ اور پانی بنتا ہے — فوٹو سنتھیسز کا الٹ۔"),
    "ps": ("د حجرو تنفس", "هغه پروسه چې حجرې د اکسیجن په مرسته glukos ماتوي ترڅو انرژي خوشې کړي؛ کاربن ډای اکساید او اوبه جوړېږي، دا د فوتوسنتیز برعکس دی."),
    "so": ("Neefsashada unugyada", "Habka unugyadu ku burburiyaan sonkorta iyagoo isticmaalaya ogsijiinta si ay u soo saaraan tamar, waxaana soo baxa kaarbon laba ogsaydh iyo biyo – ka soo horjeeda iftiin-dhaliska."),
    "am": ("የሕዋስ ትንፋሽ", "ሕዋሳት ኦክስጅንን ተጠቅመው ግሉኮስን ሰብረው ጉልበት የሚያመነጩበት ሂደት ሲሆን ካርቦን ዳይኦክሳይድና ውሃ ይፈጠራል – የፎቶሲንተሲስ ተቃራኒ።"),
    "rw": ("Kuboneza umwuka mu ngirabuzimafatizo", "Inzira ingirabuzimafatizo zisenyeramo isukari zikoresheje ogisijeni kugira ngo zibone imbaraga, hakavamo gaze ya karubone n'amazi – ni ikinyuranyo cya fotosentezi."),
   }},
 "Kolhydrat": {"m": "m2",
   "def": "Ett näringsämne uppbyggt av kol, väte och syre, byggt av en eller flera sockerenheter. "
          "Kolhydrater är kroppens viktigaste energikälla och delas in i monosackarider, disackarider "
          "och polysackarider.",
   "i18n": {
    "en": ("Carbohydrate", "A nutrient built from carbon, hydrogen and oxygen, made of one or more sugar units; the body's main energy source."),
    "es": ("Carbohidrato", "Un nutriente formado por carbono, hidrógeno y oxígeno, hecho de una o más unidades de azúcar; la principal fuente de energía del cuerpo."),
    "pl": ("Węglowodan", "Składnik odżywczy zbudowany z węgla, wodoru i tlenu, złożony z jednej lub więcej jednostek cukru; główne źródło energii organizmu."),
    "bs": ("Ugljikohidrat", "Hranjiva tvar građena od ugljika, vodika i kisika, sastavljena od jedne ili više šećernih jedinica; glavni izvor energije za tijelo."),
    "ar": ("كربوهيدرات", "مغذٍّ مكوّن من الكربون والهيدروجين والأكسجين، ويتألف من وحدة سكر واحدة أو أكثر؛ المصدر الرئيسي للطاقة في الجسم."),
    "fa": ("کربوهیدرات", "یک ماده مغذی ساخته‌شده از کربن، هیدروژن و اکسیژن که از یک یا چند واحد قند تشکیل شده و منبع اصلی انرژی بدن است."),
    "ur": ("کاربوہائیڈریٹ", "کاربن، ہائیڈروجن اور آکسیجن سے بنی ایک غذائیت جو ایک یا زیادہ شکر کی اکائیوں پر مشتمل ہے؛ جسم کا بنیادی توانائی کا ذریعہ۔"),
    "ps": ("کاربوهایدریټ", "یو غذایي ماده چې د کاربن، هایدروجن او اکسیجن څخه جوړه ده او د یوې یا څو شکرو واحدونو څخه جوړه ده؛ د بدن اصلي انرژي سرچینه."),
    "so": ("Kaarbohaydreyt", "Nafaqo ka kooban kaarboon, haydarojiin iyo ogsijiin, oo ka samaysan hal ama in ka badan oo unug sonkor ah; halka ugu weyn ee tamarta jidhka."),
    "am": ("ካርቦሃይድሬት", "ከካርቦን፣ ሃይድሮጅንና ኦክስጅን የተሠራ ንጥረ ነገር ሲሆን ከአንድ ወይም ከበርካታ ስኳር ክፍሎች የተገነባ ነው፤ የሰውነት ዋና የኃይል ምንጭ።"),
    "rw": ("Karubohidarati", "Intungamubiri igizwe na karubone, hidrogene na ogisijeni, igizwe n'agace kamwe cyangwa menshi k'isukari; ni yo soko nyamukuru y'imbaraga mu mubiri."),
   }},
 "Monosackarid": {"m": "m2",
   "def": "Den enklaste sortens kolhydrat – en enda sockerenhet som inte kan delas upp i mindre "
          "sockerdelar. Glukos, fruktos och galaktos är exempel, och alla tre har samma molekylformel "
          "C6H12O6 men olika uppbyggnad.",
   "i18n": {
    "en": ("Monosaccharide", "The simplest kind of carbohydrate — a single sugar unit that cannot be split into smaller sugars, e.g. glucose, fructose and galactose (all C6H12O6, but structured differently)."),
    "es": ("Monosacárido", "El tipo más simple de carbohidrato: una sola unidad de azúcar que no puede dividirse en azúcares más pequeños, como la glucosa, la fructosa y la galactosa (todas C6H12O6, pero con estructura distinta)."),
    "pl": ("Monosacharyd", "Najprostszy rodzaj węglowodanu – pojedyncza jednostka cukru, której nie można podzielić na mniejsze cukry, np. glukoza, fruktoza i galaktoza (wszystkie C6H12O6, lecz o różnej budowie)."),
    "bs": ("Monosaharid", "Najjednostavnija vrsta ugljikohidrata – jedna šećerna jedinica koja se ne može podijeliti na manje šećere, npr. glukoza, fruktoza i galaktoza (sve C6H12O6, ali različite građe)."),
    "ar": ("سكر أحادي", "أبسط أنواع الكربوهيدرات – وحدة سكر واحدة لا يمكن تقسيمها إلى سكريات أصغر، مثل الجلوكوز والفركتوز والغالاكتوز (جميعها C6H12O6 لكن ببنية مختلفة)."),
    "fa": ("مونوساکارید", "ساده‌ترین نوع کربوهیدرات، یک واحد قند که به قندهای کوچک‌تر تقسیم نمی‌شود؛ مانند گلوکز، فروکتوز و گالاکتوز (همه C6H12O6 اما با ساختار متفاوت)."),
    "ur": ("مونوسیکرائیڈ", "کاربوہائیڈریٹ کی سب سے سادہ قسم — ایک شکر کی اکائی جسے مزید نہیں توڑا جا سکتا، جیسے گلوکوز، فرکٹوز اور گلیکٹوز (سب C6H12O6 مگر مختلف ساخت)۔"),
    "ps": ("مونوسکارایډ", "د کاربوهایدریټ ترټولو ساده ډول — یوه واحده شکره چې نور نه شي ویشل کیدی، لکه glukos، fruktos او galaktos (ټول C6H12O6 خو جوړښت یې بېل دی)."),
    "so": ("Monosakarid", "Nooca ugu fudud ee kaarbohaydreytka – hal unug sonkor oo aan la kala qaybin karin, sida glukoosa, fraktoosa iyo galaktoosa (dhammaantood C6H12O6, laakiin qaab kala duwan)."),
    "am": ("ሞኖሳካራይድ", "ቀላሉ የካርቦሃይድሬት ዓይነት – ወደ ትንሽ ስኳር መከፋፈል የማይችል አንድ የስኳር ክፍል፣ ለምሳሌ ግሉኮስ፣ ፍሩክቶስ እና ጋላክቶስ (ሁሉም C6H12O6 ግን የተለየ አገነባብ)።"),
    "rw": ("Monosakaridi", "Ubwoko bworoshye bw'isukari — agace kamwe k'isukari kadashobora kongera kugabanywamo; urugero glucose, fructose na galactose (byose C6H12O6, ariko byubatswe ukundi)."),
   }},
 "Disackarid": {"m": "m2",
   "def": "En kolhydrat uppbyggd av två monosackarider som sitter ihop. Sackaros (druvsocker + "
          "fruktsocker), maltos (druvsocker + druvsocker) och laktos (druvsocker + galaktos) är exempel, "
          "med molekylformeln C12H22O11.",
   "i18n": {
    "en": ("Disaccharide", "A carbohydrate made of two linked monosaccharides, e.g. sucrose (glucose+fructose), maltose (glucose+glucose) and lactose (glucose+galactose), formula C12H22O11."),
    "es": ("Disacárido", "Un carbohidrato formado por dos monosacáridos unidos, como la sacarosa (glucosa+fructosa), la maltosa (glucosa+glucosa) y la lactosa (glucosa+galactosa), fórmula C12H22O11."),
    "pl": ("Disacharyd", "Węglowodan zbudowany z dwóch połączonych monosacharydów, np. sacharoza (glukoza+fruktoza), maltoza (glukoza+glukoza) i laktoza (glukoza+galaktoza), wzór C12H22O11."),
    "bs": ("Disaharid", "Ugljikohidrat sastavljen od dva povezana monosaharida, npr. saharoza (glukoza+fruktoza), maltoza (glukoza+glukoza) i laktoza (glukoza+galaktoza), formula C12H22O11."),
    "ar": ("سكر ثنائي", "كربوهيدرات مكوّنة من سكرين أحاديين متصلين، مثل السكروز (جلوكوز+فركتوز)، والمالتوز (جلوكوز+جلوكوز)، واللاكتوز (جلوكوز+جالاكتوز)، الصيغة C12H22O11."),
    "fa": ("دی‌ساکارید", "کربوهیدراتی متشکل از دو مونوساکارید متصل، مانند ساکارز (گلوکز+فروکتوز)، مالتوز (گلوکز+گلوکز) و لاکتوز (گلوکز+گالاکتوز)، فرمول C12H22O11."),
    "ur": ("ڈائی سیکرائیڈ", "دو جڑی ہوئی مونوسیکرائیڈز پر مشتمل کاربوہائیڈریٹ، جیسے سوکروز (گلوکوز+فرکٹوز)، مالٹوز (گلوکوز+گلوکوز) اور لیکٹوز (گلوکوز+گلیکٹوز)، فارمولا C12H22O11۔"),
    "ps": ("دوه‌ییز شکره (دايساکارايډ)", "کاربوهایدریټ چې له دوه یوځای شویو مونوسکارایډونو څخه جوړ دی، لکه sackaros (glukos+fruktos)، maltos (glukos+glukos) او laktos (glukos+galaktos)، فورمول C12H22O11."),
    "so": ("Disakarid", "Kaarbohaydreyt ka kooban laba monosakarid oo isku xidhan, sida sukrose (glukoosa+fraktoosa), maltoosa (glukoosa+glukoosa) iyo laktoosa (glukoosa+galaktoosa), qaabka C12H22O11."),
    "am": ("ዲሳካራይድ", "ሁለት የተያያዙ ሞኖሳካራይዶች የተሠራ ካርቦሃይድሬት፣ ለምሳሌ ሳክሮስ (ግሉኮስ+ፍሩክቶስ)፣ ማልቶስ (ግሉኮስ+ግሉኮስ) እና ላክቶስ (ግሉኮስ+ጋላክቶስ)፣ ቀመር C12H22O11።"),
    "rw": ("Disakaridi", "Isukari igizwe n'utuce tubiri tw'isukari twegeranye, urugero sucrose (glucose+fructose), maltose (glucose+glucose) na lactose (glucose+galactose), formula C12H22O11."),
   }},
 "Polysackarid": {"m": "m2",
   "def": "En kolhydrat uppbyggd av mycket många (hundratals till tusentals) sockerenheter som sitter "
          "ihop i en lång kedja. Stärkelse, cellulosa och glykogen är alla polysackarider byggda av "
          "glukos, men bindningarna mellan enheterna skiljer sig åt.",
   "i18n": {
    "en": ("Polysaccharide", "A carbohydrate made of very many (hundreds to thousands) sugar units in a long chain. Starch, cellulose and glycogen are all glucose polysaccharides, but the links between units differ."),
    "es": ("Polisacárido", "Un carbohidrato formado por muchísimas (cientos a miles) unidades de azúcar en una cadena larga. El almidón, la celulosa y el glucógeno son polisacáridos de glucosa, pero los enlaces entre unidades difieren."),
    "pl": ("Polisacharyd", "Węglowodan złożony z bardzo wielu (setek do tysięcy) jednostek cukru w długim łańcuchu. Skrobia, celuloza i glikogen to polisacharydy glukozy, ale wiązania między jednostkami są różne."),
    "bs": ("Polisaharid", "Ugljikohidrat sastavljen od vrlo mnogo (stotine do hiljade) šećernih jedinica u dugom lancu. Škrob, celuloza i glikogen su polisaharidi glukoze, ali su veze između jedinica različite."),
    "ar": ("سكر عديد", "كربوهيدرات مكوّنة من عدد كبير جدًا (مئات إلى آلاف) من وحدات السكر في سلسلة طويلة. النشا والسليلوز والغليكوجين جميعها عديدات سكاريد من الجلوكوز، لكن الروابط بين الوحدات مختلفة."),
    "fa": ("پلی‌ساکارید", "کربوهیدراتی متشکل از تعداد بسیار زیادی (صدها تا هزاران) واحد قند در یک زنجیره بلند. نشاسته، سلولز و گلیکوژن همگی پلی‌ساکاریدهای گلوکز هستند اما نوع پیوند بین واحدها متفاوت است."),
    "ur": ("پولی سیکرائیڈ", "بہت سی (سینکڑوں سے ہزاروں) شکر کی اکائیوں پر مشتمل لمبی زنجیر والی کاربوہائیڈریٹ۔ نشاستہ، سیلولوز اور گلائیکوجن سب گلوکوز کے پولی سیکرائیڈز ہیں مگر اکائیوں کے درمیان جوڑ مختلف ہیں۔"),
    "ps": ("ډېری‌ییزه شکره (پولي سکارایډ)", "کاربوهایدریټ چې له ډېرو (سلګونو تر زرګونو) شکرو واحدونو څخه په اوږده زنځیر کې جوړ دی. stärkelse، cellulosa او glykogen ټول د glukos پولي سکارایډونه دي، خو د واحدونو تر منځ تړاوونه توپیر لري."),
    "so": ("Polisakarid", "Kaarbohaydreyt ka kooban tiro aad u badan (boqolaal ilaa kumanaan) oo unugyo sonkor ah oo silsilad dheer ku xidhan. Istaarij, cellulose iyo glycogen dhammaantood waa polisakarido glukoosa ah, laakiin xidhiidhka u dhexeeya unugyada way kala duwan yihiin."),
    "am": ("ፖሊሳካራይድ", "በጣም ብዙ (በመቶዎች እስከ በሺዎች) የስኳር ክፍሎች በረዥም ሰንሰለት የተያያዙበት ካርቦሃይድሬት። ስታርች፣ ሴሉሎስ እና ግላይኮጅን ሁሉም የግሉኮስ ፖሊሳካራይዶች ናቸው፤ ነገር ግን በክፍሎቹ መካከል ያለው ትስስር ይለያያል።"),
    "rw": ("Polisakaridi", "Isukari igizwe n'utuce twinshi cyane (amagana kugeza ibihumbi) tw'isukari biri ku rurenda rurerure. Ibirebana n'ubuki (stärkelse), fibre (cellulosa) na glycogène byose ni polisakaridi za glucose, ariko uburyo utuce dufatanye butandukanye."),
   }},
 "Stärkelse": {"m": "m2",
   "def": "En polysackarid byggd av jättemånga glukosmolekyler länkade med alfa-1,4-bindningar. Det gör "
          "att kedjan böjer sig och gärna bildar en spiralform. Stärkelse är växters sätt att lagra "
          "energi och finns rikligt i potatis, ris, pasta och bröd.",
   "i18n": {
    "en": ("Starch", "A polysaccharide of many glucose molecules linked by alpha-1,4 bonds, which makes the chain bend into a spiral. Starch is how plants store energy; rich in potatoes, rice, pasta and bread."),
    "es": ("Almidón", "Un polisacárido de muchas moléculas de glucosa unidas por enlaces alfa-1,4, lo que hace que la cadena se doble en espiral. Es la forma en que las plantas almacenan energía; abunda en patatas, arroz, pasta y pan."),
    "pl": ("Skrobia", "Polisacharyd złożony z wielu cząsteczek glukozy połączonych wiązaniami alfa-1,4, co sprawia, że łańcuch zwija się spiralnie. Tak rośliny magazynują energię; dużo jej w ziemniakach, ryżu, makaronie i pieczywie."),
    "bs": ("Škrob", "Polisaharid od mnogo molekula glukoze povezanih alfa-1,4 vezama, zbog čega se lanac savija u spiralu. Tako biljke skladište energiju; ima ga puno u krompiru, pirinču, tjestenini i hljebu."),
    "ar": ("النشا", "عديد سكاريد من جزيئات جلوكوز عديدة مرتبطة بروابط ألفا-1,4، مما يجعل السلسلة تنحني وتميل لتكوين شكل حلزوني. هكذا تخزّن النباتات الطاقة؛ يوجد بكثرة في البطاطس والأرز والمعكرونة والخبز."),
    "fa": ("نشاسته", "پلی‌ساکاریدی از مولکول‌های زیاد گلوکز با پیوندهای آلفا-۱،۴ که باعث می‌شود زنجیره به شکل مارپیچ خم شود. روش ذخیره انرژی گیاهان است؛ در سیب‌زمینی، برنج، پاستا و نان فراوان است."),
    "ur": ("نشاستہ", "الفا-1,4 روابط سے جڑی بہت سی گلوکوز مالیکیولز پر مشتمل پولی سیکرائیڈ، جو زنجیر کو مڑنے اور سرپل شکل بنانے دیتی ہے۔ یہ پودوں کے توانائی ذخیرہ کرنے کا طریقہ ہے؛ آلو، چاول، پاستا اور روٹی میں بکثرت۔"),
    "ps": ("نشایسته (stärkelse)", "پولي سکارایډ چې له ډېرو glukos مالیکولونو څخه د alfa-1,4 تړاوونو له لارې جوړ دی، دا زنځیر خم کوي او مارپیچ بڼه جوړوي. ژېړ ونې په دې طریقه انرژي زیرمه کوي؛ په کچالو، وريجو، پاستا او ډوډۍ کې ډېره ده."),
    "so": ("Istaarij", "Polisakarid ka kooban molekuulo glukoosa oo badan oo isku xidhan xidhiidhyo alfa-1,4 ah, taasoo silsiladda u leexisa qaab wareegsan. Waa habka geedaha ku kaydiyaan tamarta; wuxuu badan yahay baradho, bariis, baasto iyo rooti."),
    "am": ("ስታርች", "በበርካታ ግሉኮስ ሞለኪውሎች በአልፋ-1,4 ትስስር የተገነባ ፖሊሳካራይድ፣ ይህም ሰንሰለቱ እንዲታጠፍ እና ወደ ጠመዝማዛ ቅርጽ እንዲያዘነብል ያደርጋል። ተክሎች ኃይል የሚያከማቹበት መንገድ ሲሆን በድንች፣ ሩዝ፣ ፓስታ እና ዳቦ ውስጥ በብዛት ይገኛል።"),
    "rw": ("Umuti w'ibirebana", "Polisakaridi igizwe na molekile nyinshi za glucose zifatanye n'imigozi alfa-1,4, bigatuma urunyereza rugoramuka rukagira imiterere y'agahenge. Ni uburyo ibimera bibika imbaraga; iboneka cyane mu bikoro, umuceri, pasita n'umugati."),
   }},
 "Cellulosa": {"m": "m2",
   "def": "En polysackarid byggd av jättemånga glukosmolekyler länkade med beta-1,4-bindningar, vilket "
          "ger raka, utsträckta kedjor som packar tätt ihop och bygger upp växters cellväggar. Människan "
          "saknar rätt enzym för att bryta ner beta-1,4-bindningen och kan därför inte ta upp energin "
          "i cellulosa – den fungerar i stället som kostfiber.",
   "i18n": {
    "en": ("Cellulose", "A polysaccharide of glucose molecules linked by beta-1,4 bonds, giving straight, extended chains that pack tightly and build plant cell walls. Humans lack the enzyme to break the beta-1,4 bond, so cellulose passes through as dietary fibre."),
    "es": ("Celulosa", "Un polisacárido de moléculas de glucosa unidas por enlaces beta-1,4, que forma cadenas rectas y extendidas que se compactan y construyen las paredes celulares de las plantas. Los humanos carecen de la enzima para romper el enlace beta-1,4, así que actúa como fibra dietética."),
    "pl": ("Celuloza", "Polisacharyd cząsteczek glukozy połączonych wiązaniami beta-1,4, dający proste, rozciągnięte łańcuchy, które ściśle się pakują i budują ściany komórkowe roślin. Ludzie nie mają enzymu rozkładającego wiązanie beta-1,4, więc celuloza działa jako błonnik pokarmowy."),
    "bs": ("Celuloza", "Polisaharid molekula glukoze povezanih beta-1,4 vezama, koji daje ravne, ispružene lance koji se čvrsto slažu i grade stanične zidove biljaka. Ljudi nemaju enzim za razgradnju beta-1,4 veze, pa celuloza djeluje kao dijetalna vlakna."),
    "ar": ("السليلوز", "عديد سكاريد من جزيئات جلوكوز مرتبطة بروابط بيتا-1,4، ما يعطي سلاسل مستقيمة وممتدة تتراص بإحكام وتبني جدران خلايا النباتات. يفتقر جسم الإنسان إلى الإنزيم اللازم لكسر رابطة بيتا-1,4، فيعمل السليلوز كألياف غذائية."),
    "fa": ("سلولز", "پلی‌ساکاریدی از مولکول‌های گلوکز با پیوندهای بتا-۱،۴ که زنجیره‌هایی صاف و کشیده می‌سازد و دیواره سلولی گیاهان را تشکیل می‌دهد. بدن انسان آنزیم لازم برای شکستن پیوند بتا-۱،۴ را ندارد، پس سلولز به‌صورت فیبر غذایی عمل می‌کند."),
    "ur": ("سیلولوز", "بیٹا-1,4 روابط سے جڑی گلوکوز مالیکیولز پر مشتمل پولی سیکرائیڈ، جو سیدھی، پھیلی ہوئی زنجیریں بناتی ہے جو پودوں کی خلیاتی دیواریں بناتی ہیں۔ انسانی جسم میں بیٹا-1,4 بانڈ توڑنے والا خامرہ نہیں ہوتا، اس لیے یہ غذائی ریشہ کا کام کرتا ہے۔"),
    "ps": ("سېلولوز", "پولي سکارایډ چې د glukos مالیکولونو څخه د beta-1,4 تړاوونو له لارې جوړ دی، سیده اوږده زنځیرونه جوړوي چې کلک یوځای کیږي او د نباتاتو حجروي دیوالونه جوړوي. انسان د beta-1,4 تړون ماتولو انزایم نلري، نو سېلولوز د غذایي فایبر په توګه کار کوي."),
    "so": ("Cellulose", "Polisakarid ka kooban molekuulo glukoosa oo isku xidhan xidhiidhyo beta-1,4 ah, taasoo keenta silsilado toosan oo la kala fidiyo oo si adag isugu duuban ee dhisa daaraha unugyada geedaha. Bini-aadamku ma leh enzaymka jebiya xidhiidhka beta-1,4, sidaas darteed cellulose waxay u shaqeysaa sida fiber cuntada."),
    "am": ("ሴሉሎስ", "በቤታ-1,4 ትስስር የተያያዙ የግሉኮስ ሞለኪውሎች ፖሊሳካራይድ ሲሆን ቀጥ ያሉ፣ የተዘረጉ ሰንሰለቶችን ይፈጥራል፤ እነዚህም ተጣብቀው የተክሎችን ሕዋስ ግድግዳ ይገነባሉ። የሰው አካል ቤታ-1,4 ትስስርን የሚሰብር ኢንዛይም ስለሌለው ሴሉሎስ እንደ ምግብ ፋይበር ያገለግላል።"),
    "rw": ("Herufi", "Polisakaridi igizwe na molekile za glucose zifatanye n'imigozi beta-1,4, ikaremwa uduce turerure twose, tugatuza tugafatana bigatuma ari byo bubaka uruzitiro rw'akagari k'ibimera. Umubiri w'umuntu ntufite enzyme ishobora gutandukanya umugozi beta-1,4, ku bw'ibyo herufi ikora nk'ibiyunguro fibre."),
   }},
 "Glykogen": {"m": "m5",
   "def": "En polysackarid byggd av glukos, uppbyggd på liknande sätt som stärkelse men ännu mer "
          "förgrenad. Glykogen är djurens (och människans) sätt att lagra energi kortsiktigt, framför "
          "allt i lever och muskler.",
   "i18n": {
    "en": ("Glycogen", "A glucose polysaccharide, built like starch but even more branched. Glycogen is how animals (and humans) store energy short-term, mainly in the liver and muscles."),
    "es": ("Glucógeno", "Un polisacárido de glucosa, construido como el almidón pero aún más ramificado. Es la forma en que los animales (y los humanos) almacenan energía a corto plazo, sobre todo en el hígado y los músculos."),
    "pl": ("Glikogen", "Polisacharyd glukozy zbudowany podobnie jak skrobia, lecz jeszcze bardziej rozgałęziony. Tak zwierzęta (i ludzie) magazynują energię krótkoterminowo, głównie w wątrobie i mięśniach."),
    "bs": ("Glikogen", "Polisaharid glukoze, građen slično škrobu ali još razgranatije. Tako životinje (i ljudi) kratkoročno skladište energiju, uglavnom u jetri i mišićima."),
    "ar": ("الجليكوجين", "عديد سكاريد من الجلوكوز، مبني كالنشا لكنه أكثر تفرعًا. هكذا تخزّن الحيوانات (والإنسان) الطاقة على المدى القصير، خصوصًا في الكبد والعضلات."),
    "fa": ("گلیکوژن", "پلی‌ساکاریدی از گلوکز، شبیه نشاسته اما با انشعاب بیشتر. روش ذخیره کوتاه‌مدت انرژی در جانوران (و انسان) است، عمدتاً در کبد و عضلات."),
    "ur": ("گلائیکوجن", "گلوکوز کی پولی سیکرائیڈ جو نشاستے کی طرح مگر زیادہ شاخوں والی بنتی ہے۔ یہ جانوروں (اور انسانوں) کے مختصر مدتی توانائی ذخیرہ کرنے کا طریقہ ہے، خاص طور پر جگر اور پٹھوں میں۔"),
    "ps": ("ګلایکوجن", "د glukos پولي سکارایډ چې لکه stärkelse جوړ شوی خو لا ډېر څانګی. دا د حیواناتو (او انسان) د لنډمهاله انرژي زیرمه کولو طریقه ده، ډېر په ځیګر او غړو کې."),
    "so": ("Glycogen", "Polisakarid glukoosa ah, oo loo dhisay sida istaarijka laakiin si ka badan u laamaysan. Waa habka xayawaanku (iyo bini-aadamku) ay ugu kaydiyaan tamar mudo gaaban, gaar ahaan beerka iyo murqaha."),
    "am": ("ግላይኮጅን", "እንደ ስታርች የተገነባ ግን የበለጠ ቅርንጫፍ ያለው የግሉኮስ ፖሊሳካራይድ። እንስሳት (እና ሰዎች) በአጭር ጊዜ ኃይል የሚያከማቹበት መንገድ ሲሆን በተለይ በጉበትና በጡንቻ ውስጥ ይገኛል።"),
    "rw": ("Glikogene", "Polisakaridi ya glucose, yubatswe nk'umuti w'ibirebana ariko ifite amashami menshi kurushaho. Ni uburyo inyamaswa (n'abantu) babikamo imbaraga mu gihe gito, cyane cyane mu mwijima no mu mikaya."),
   }},
 "Fettsyra": {"m": "m3",
   "def": "Byggstenen i fett: en lång kolkedja med en syragrupp (COOH) i ena änden. Fettsyror binds med "
          "en esterbindning till glycerol och bildar tillsammans en fettmolekyl (triglycerid).",
   "i18n": {
    "en": ("Fatty acid", "The building block of fat: a long carbon chain with an acid group (COOH) at one end. Fatty acids bond to glycerol via ester bonds to form a fat molecule (triglyceride)."),
    "es": ("Ácido graso", "El componente básico de la grasa: una cadena larga de carbono con un grupo ácido (COOH) en un extremo. Los ácidos grasos se unen al glicerol mediante enlaces éster para formar una molécula de grasa (triglicérido)."),
    "pl": ("Kwas tłuszczowy", "Podstawowy element tłuszczu: długi łańcuch węglowy z grupą kwasową (COOH) na jednym końcu. Kwasy tłuszczowe łączą się z glicerolem wiązaniami estrowymi, tworząc cząsteczkę tłuszczu (trójglicerydu)."),
    "bs": ("Masna kiselina", "Gradivni element masti: dug lanac ugljika s kiselinskom grupom (COOH) na jednom kraju. Masne kiseline se vežu na glicerol esterskim vezama i grade molekulu masti (trigliceride)."),
    "ar": ("حمض دهني", "اللبنة الأساسية للدهون: سلسلة كربونية طويلة تحمل مجموعة حمضية (COOH) في أحد طرفيها. ترتبط الأحماض الدهنية بالغليسرول عبر روابط إستر لتكوّن جزيء دهن (ثلاثي الغليسريد)."),
    "fa": ("اسید چرب", "واحد سازنده چربی: یک زنجیره کربنی بلند با گروه اسیدی (COOH) در یک انتها. اسیدهای چرب با پیوند استری به گلیسرول متصل می‌شوند و مولکول چربی (تری‌گلیسرید) می‌سازند."),
    "ur": ("فیٹی ایسڈ", "چربی کا بنیادی جزو: ایک لمبی کاربن زنجیر جس کے ایک سرے پر تیزابی گروپ (COOH) ہوتا ہے۔ فیٹی ایسڈز ایسٹر بانڈ کے ذریعے گلیسرول سے جڑ کر چربی کا مالیکیول (ٹرائی گلیسرائیڈ) بناتے ہیں۔"),
    "ps": ("غوړ اسید (فټي اسید)", "د غوړ اصلي برخه: یو اوږد کاربن زنځیر چې په یوه سر کې د اسید ګروپ (COOH) لري. غوړ اسیدونه د ester تړون له لارې له glycerol سره یوځای کیږي او د غوړ مالیکول (triglycerid) جوړوي."),
    "so": ("Aashito dufan", "Qaybta dhismaha dufanka: silsilad kaarboon oo dheer oo leh koox aashito (COOH) ah dhamaadka hal geesood. Aashitada dufanku waxay ku xidhmaan glycerol iyagoo adeegsanaya xidhiidh ester ah si ay u sameeyaan molekuul dufan ah (triglyceride)."),
    "am": ("ፋቲ አሲድ", "የስብ መሠረታዊ ክፍል፣ በአንድ ጫፍ ላይ የአሲድ ቡድን (COOH) ያለው ረዥም የካርቦን ሰንሰለት። ፋቲ አሲዶች በኤስተር ትስስር ከግሊሰሮል ጋር ተያይዘው የስብ ሞለኪውል (ትራይግሊሰራይድ) ይፈጥራሉ።"),
    "rw": ("Aside y'amavuta", "Ikintu gishingiye ku mavuta: urunyereza rurerure rwa karubone rufite itsinda ry'aside (COOH) ku mpera imwe. Aside z'amavuta zifatanya na glycerol binyuze mu mugozi wa ester, bigakora molekile y'amavuta (triglyceride)."),
   }},
 "Mättat fett": {"m": "m3",
   "def": "Fett vars fettsyror bara har enkelbindningar mellan kolatomerna. Fettsyrakedjan blir då helt "
          "rak. Mättat fett är oftast fast i rumstemperatur och finns rikligt i smör och feta "
          "köttprodukter.",
   "i18n": {
    "en": ("Saturated fat", "Fat whose fatty acids have only single bonds between carbon atoms, giving a straight chain. Usually solid at room temperature; found in butter and fatty meat."),
    "es": ("Grasa saturada", "Grasa cuyos ácidos grasos solo tienen enlaces simples entre átomos de carbono, dando una cadena recta. Suele ser sólida a temperatura ambiente; se encuentra en la mantequilla y las carnes grasas."),
    "pl": ("Tłuszcz nasycony", "Tłuszcz, którego kwasy tłuszczowe mają tylko wiązania pojedyncze między atomami węgla, przez co łańcuch jest prosty. Zwykle stały w temperaturze pokojowej; obecny w maśle i tłustym mięsie."),
    "bs": ("Zasićena mast", "Mast čije masne kiseline imaju samo jednostruke veze između atoma ugljika, pa je lanac ravan. Obično je čvrsta na sobnoj temperaturi; ima je u maslacu i masnom mesu."),
    "ar": ("دهون مشبعة", "دهون تحتوي أحماضها الدهنية على روابط أحادية فقط بين ذرات الكربون، فتكون السلسلة مستقيمة. عادة صلبة في درجة حرارة الغرفة؛ توجد في الزبدة واللحوم الدهنية."),
    "fa": ("چربی اشباع‌شده", "چربی‌ای که اسیدهای چرب آن فقط پیوندهای یگانه بین اتم‌های کربن دارند و زنجیره کاملاً صاف است. معمولاً در دمای اتاق جامد است؛ در کره و گوشت چرب یافت می‌شود."),
    "ur": ("سیر شدہ چربی", "چربی جس کے فیٹی ایسڈز میں کاربن ایٹمز کے درمیان صرف سنگل بانڈز ہوتے ہیں، جس سے زنجیر سیدھی بنتی ہے۔ عام طور پر کمرے کے درجہ حرارت پر ٹھوس ہوتی ہے؛ مکھن اور چکنائی والے گوشت میں پائی جاتی ہے۔"),
    "ps": ("زیات شوی (مشبوع) غوړ", "غوړ چې د هغه غوړ اسیدونه یوازې د کاربن اتومونو تر منځ یوازینی تړاووونه لري، نو زنځیر سیده وي. معمولا د خونې تودوخې کې کلک وي؛ په کوچ او غوړ ناکه غوښه کې ډېر دی."),
    "so": ("Dufan dhammaystiran (saturated)", "Dufan aashitooyinkiisu ay leeyihiin oo kaliya xidhiidh keliya oo u dhexeeya atomiyada kaarboonka, taasoo silsiladda ka dhigaysa mid toosan. Badanaa waa adag heerkulka qolka; wuxuu badan yahay subag iyo hilib dufan leh."),
    "am": ("የተመሉ ስብ", "የካርቦን አቶሞች መካከል ነጠላ ትስስር ብቻ ያላቸው ፋቲ አሲዶች ያሉት ስብ፣ ይህም ሰንሰለቱን ቀጥ ያደርገዋል። አብዛኛውን ጊዜ በክፍል ሙቀት ጠጣር ነው፤ በቅቤና በስብ ስጋ ውስጥ ይገኛል።"),
    "rw": ("Amavuta yuzuye", "Amavuta afite aside z'amavuta zifite gusa imigozi imwe hagati y'udufu twa karubone, bigatuma urunyereza rugororoka. Akenshi aba akomeye ku bushyuhe bwo mu nzu; aboneka mu buta no mu nyama zifite amavuta menshi."),
   }},
 "Omättat fett": {"m": "m3",
   "def": "Fett vars fettsyror har en eller flera dubbelbindningar mellan kolatomerna. Varje "
          "dubbelbindning ger en cis-knäck i kedjan, vilket gör att omättat fett oftast är flytande i "
          "rumstemperatur. Har man flera dubbelbindningar kallas fettet fleromättat.",
   "i18n": {
    "en": ("Unsaturated fat", "Fat whose fatty acids have one or more double bonds between carbon atoms. Each double bond gives a cis kink, so unsaturated fat is usually liquid at room temperature."),
    "es": ("Grasa insaturada", "Grasa cuyos ácidos grasos tienen uno o más enlaces dobles entre átomos de carbono. Cada doble enlace produce un pliegue cis, por lo que suele ser líquida a temperatura ambiente."),
    "pl": ("Tłuszcz nienasycony", "Tłuszcz, którego kwasy tłuszczowe mają jedno lub więcej wiązań podwójnych między atomami węgla. Każde wiązanie podwójne daje zagięcie cis, dlatego zwykle jest ciekły w temperaturze pokojowej."),
    "bs": ("Nezasićena mast", "Mast čije masne kiseline imaju jednu ili više dvostrukih veza između atoma ugljika. Svaka dvostruka veza daje cis-pregib, pa je obično tečna na sobnoj temperaturi."),
    "ar": ("دهون غير مشبعة", "دهون تحتوي أحماضها الدهنية على رابطة مزدوجة واحدة أو أكثر بين ذرات الكربون. كل رابطة مزدوجة تُحدث انحناءً (cis)، لذا تكون سائلة عادة في درجة حرارة الغرفة."),
    "fa": ("چربی غیراشباع", "چربی‌ای که اسیدهای چرب آن یک یا چند پیوند دوگانه بین اتم‌های کربن دارند. هر پیوند دوگانه یک خمیدگی سیس ایجاد می‌کند، پس معمولاً در دمای اتاق مایع است."),
    "ur": ("غیر سیر شدہ چربی", "چربی جس کے فیٹی ایسڈز میں کاربن ایٹمز کے درمیان ایک یا زیادہ ڈبل بانڈز ہوتے ہیں۔ ہر ڈبل بانڈ ایک سِس موڑ پیدا کرتا ہے، اس لیے عام طور پر کمرے کے درجہ حرارت پر مائع ہوتی ہے۔"),
    "ps": ("نامشبوع غوړ", "غوړ چې د هغه غوړ اسیدونه د کاربن اتومونو تر منځ یو یا څو دوه ګونی تړاووونه لري. هر دوه ګونی تړون یو cis خمیدګی رامنځته کوي، نو معمولا د خونې تودوخې کې مایع وي."),
    "so": ("Dufan aan dhammaystirnayn", "Dufan aashitooyinkiisu ay leeyihiin hal ama in ka badan oo xidhiidh labanlaab ah oo u dhexeeya atomiyada kaarboonka. Xidhiidh kasta oo labanlaab ah wuxuu keenaa laab cis ah, sidaas darteed badanaa waa dareere heerkulka qolka."),
    "am": ("ያልተመሉ ስብ", "የካርቦን አቶሞች መካከል አንድ ወይም ከዚያ በላይ ድርብ ትስስር ያላቸው ፋቲ አሲዶች ያሉት ስብ። እያንዳንዱ ድርብ ትስስር ሲስ መታጠፊያ ይፈጥራል፤ ስለዚህ ያልተመሉ ስብ በክፍል ሙቀት ውስጥ ብዙውን ጊዜ ፈሳሽ ነው።"),
    "rw": ("Amavuta adakwiye kwuzura", "Amavuta afite aside z'amavuta zifite umugozi umwe cyangwa myinshi ibiri hagati y'udufu twa karubone. Buri mugozi ubiri utanga agahenge (cis), bigatuma amavuta akenshi aba amazi ku bushyuhe bwo mu nzu."),
   }},
 "Protein": {"m": "m4",
   "def": "Ett näringsämne byggt av aminosyror kopplade i kedjor. Proteiner fungerar som kroppens "
          "byggnadsmaterial (muskler, hud, hår) och som enzymer, hormoner och antikroppar. Kroppen kan "
          "inte bygga protein enbart av kolhydrater och fett – den behöver aminosyror från maten.",
   "i18n": {
    "en": ("Protein", "A nutrient built from amino acids linked in chains. Proteins are the body's building material (muscle, skin, hair) and act as enzymes, hormones and antibodies. The body needs amino acids from food to build protein."),
    "es": ("Proteína", "Un nutriente formado por aminoácidos unidos en cadenas. Las proteínas son el material de construcción del cuerpo (músculo, piel, cabello) y actúan como enzimas, hormonas y anticuerpos."),
    "pl": ("Białko", "Składnik odżywczy zbudowany z aminokwasów połączonych w łańcuchy. Białka są materiałem budulcowym organizmu (mięśnie, skóra, włosy) i pełnią funkcję enzymów, hormonów i przeciwciał."),
    "bs": ("Protein", "Hranjiva tvar građena od aminokiselina povezanih u lance. Proteini su građevni materijal tijela (mišići, koža, kosa) i djeluju kao enzimi, hormoni i antitijela."),
    "ar": ("بروتين", "مغذٍّ مكوّن من أحماض أمينية مرتبطة في سلاسل. البروتينات هي مواد بناء الجسم (العضلات والجلد والشعر) وتعمل كإنزيمات وهرمونات وأجسام مضادة."),
    "fa": ("پروتئین", "ماده مغذی ساخته‌شده از اسیدهای آمینه متصل در زنجیره‌ها. پروتئین‌ها مصالح ساختمانی بدن (عضله، پوست، مو) هستند و به‌عنوان آنزیم، هورمون و آنتی‌بادی عمل می‌کنند."),
    "ur": ("پروٹین", "امینو ایسڈز کی زنجیروں سے بنی غذائیت۔ پروٹین جسم کا تعمیری مواد (پٹھے، جلد، بال) ہیں اور خامرے، ہارمونز اور اینٹی باڈیز کا کام کرتے ہیں۔"),
    "ps": ("پروټین", "یو غذایي ماده چې د امینو اسیدونو له زنځیرونو څخه جوړه ده. پروټینونه د بدن جوړښتي مواد دي (غړي، پوستکی، ویښتان) او د انزایمونو، هورمونونو او انټي بایډیو په توګه کار کوي."),
    "so": ("Borotiin", "Nafaqo ka kooban aashitooyin amino ah oo isku xidhan silsilado. Borotiinku waa maadada dhismaha jidhka (murqaha, maqaarka, timaha) waxayna u shaqeeyaan sida enzymes, hormones iyo antibodies."),
    "am": ("ፕሮቲን", "በሰንሰለት የተያያዙ አሚኖ አሲዶች የተሠራ ንጥረ ነገር። ፕሮቲኖች የሰውነት የግንባታ ቁሳቁስ (ጡንቻ፣ ቆዳ፣ ፀጉር) ሲሆኑ እንደ ኢንዛይም፣ ሆርሞንና ፀረ አካል ሆነው ያገለግላሉ።"),
    "rw": ("Poroteyine", "Intungamubiri igizwe na aside amine zifatanye ku rurenda. Poroteyine ni ibikoresho by'ubwubatsi bw'umubiri (imikaya, uruhu, umusatsi) kandi zikora nk'enzyme, imisemburo (hormone) na antibody."),
   }},
 "Aminosyra": {"m": "m4",
   "def": "Byggstenen i protein: en liten molekyl med en aminogrupp, en karboxylgrupp (syragrupp) och "
          "en sidokedja (R) som skiljer sig mellan de 20 olika aminosyrorna. De flesta innehåller kol, "
          "väte, syre och kväve – ett fåtal, till exempel cystein, innehåller även svavel.",
   "i18n": {
    "en": ("Amino acid", "The building block of protein: a small molecule with an amino group, a carboxyl (acid) group, and a side chain (R) that differs between the 20 amino acids. Most contain carbon, hydrogen, oxygen and nitrogen; a few, like cysteine, also contain sulfur."),
    "es": ("Aminoácido", "El componente básico de la proteína: una molécula pequeña con un grupo amino, un grupo carboxilo (ácido) y una cadena lateral (R) que difiere entre los 20 aminoácidos. La mayoría contiene carbono, hidrógeno, oxígeno y nitrógeno; unos pocos, como la cisteína, también contienen azufre."),
    "pl": ("Aminokwas", "Podstawowy element białka: mała cząsteczka z grupą aminową, grupą karboksylową (kwasową) i łańcuchem bocznym (R), który różni się między 20 aminokwasami. Większość zawiera węgiel, wodór, tlen i azot; nieliczne, jak cysteina, zawierają też siarkę."),
    "bs": ("Aminokiselina", "Gradivni element proteina: mali molekul s amino grupom, karboksilnom (kiselinskom) grupom i bočnim lancem (R) koji se razlikuje među 20 aminokiselina. Većina sadrži ugljik, vodik, kisik i dušik; nekoliko, poput cisteina, sadrži i sumpor."),
    "ar": ("حمض أميني", "اللبنة الأساسية للبروتين: جزيء صغير يحتوي على مجموعة أمين، ومجموعة كربوكسيل (حمضية)، وسلسلة جانبية (R) تختلف بين الأحماض الأمينية العشرين. تحتوي معظمها على الكربون والهيدروجين والأكسجين والنيتروجين؛ وقليل منها، مثل السيستين، يحتوي أيضًا على الكبريت."),
    "fa": ("اسید آمینه", "واحد سازنده پروتئین: مولکولی کوچک با یک گروه آمین، یک گروه کربوکسیل (اسیدی) و یک زنجیره جانبی (R) که در ۲۰ اسید آمینه متفاوت است. اغلب آن‌ها کربن، هیدروژن، اکسیژن و نیتروژن دارند؛ چند مورد مانند سیستئین گوگرد نیز دارند."),
    "ur": ("امینو ایسڈ", "پروٹین کا بنیادی جزو: ایک چھوٹا مالیکیول جس میں امینو گروپ، کاربوکسل (تیزابی) گروپ اور سائیڈ چین (R) ہوتی ہے جو 20 امینو ایسڈز میں مختلف ہوتی ہے۔ زیادہ تر میں کاربن، ہائیڈروجن، آکسیجن اور نائٹروجن ہوتی ہے؛ چند، جیسے سسٹین، میں سلفر بھی ہوتا ہے۔"),
    "ps": ("امینو اسید", "د پروټین اصلي برخه: یو کوچنی مالیکول چې امینو ګروپ، کاربوکسیل (اسید) ګروپ او یوه څنګیزه زنځیره (R) لري چې د 20 امینو اسیدونو تر منځ توپیر کوي. ډېری یې کاربن، هایدروجن، اکسیجن او نایتروجن لري؛ لږ شمېر، لکه cystein، سلفر هم لري."),
    "so": ("Aashito amino ah", "Qaybta dhismaha borotiinka: molekuul yar oo leh koox amino ah, koox karboksil ah (aashito), iyo silsilad dhinac ah (R) oo ka duwan tan 20-ka aashitooyinka amino ah. Badankood waxay ka kooban yihiin kaarboon, haydarojiin, ogsijiin iyo nitrojiin; tiro yar, sida cysteine, waxay sidoo kale ka kooban yihiin sulfur."),
    "am": ("አሚኖ አሲድ", "የፕሮቲን መሠረታዊ ክፍል፦ አሚኖ ቡድን፣ ካርቦክሲል (አሲድ) ቡድን እና በ20ዎቹ አሚኖ አሲዶች መካከል የሚለያይ የጎን ሰንሰለት (R) ያለው ትንሽ ሞለኪውል። አብዛኞቹ ካርቦን፣ ሃይድሮጅን፣ ኦክስጅንና ናይትሮጅን ይይዛሉ፤ ጥቂቶቹ፣ እንደ ሲስቴይን፣ ሰልፈርንም ይይዛሉ።"),
    "rw": ("Aside amine", "Ikintu gishingiye ku poroteyine: molekile ntoya ifite itsinda rya amine, itsinda rya karuboksile (aside), n'urunyereza ruhira (R) rutandukanye hagati ya aside amine 20. Nyinshi zirimo karubone, hidrogene, ogisijeni na azote; nke, nka cysteine, zirimo na sulfure."),
   }},
 "Essentiell aminosyra": {"m": "m4",
   "def": "En aminosyra som kroppen inte kan tillverka själv, utan måste få via maten. Det finns nio "
          "essentiella aminosyror hos människan.",
   "i18n": {
    "en": ("Essential amino acid", "An amino acid the body cannot make itself and must get from food. Humans have nine essential amino acids."),
    "es": ("Aminoácido esencial", "Un aminoácido que el cuerpo no puede fabricar por sí mismo y debe obtener de los alimentos. Los humanos tienen nueve aminoácidos esenciales."),
    "pl": ("Aminokwas egzogenny", "Aminokwas, którego organizm nie potrafi sam wytworzyć i musi otrzymać z pożywieniem. Człowiek ma dziewięć aminokwasów egzogennych."),
    "bs": ("Esencijalna aminokiselina", "Aminokiselina koju tijelo ne može samo proizvesti, već je mora dobiti hranom. Ljudi imaju devet esencijalnih aminokiselina."),
    "ar": ("حمض أميني أساسي", "حمض أميني لا يستطيع الجسم تصنيعه بنفسه، بل يجب الحصول عليه من الطعام. لدى الإنسان تسعة أحماض أمينية أساسية."),
    "fa": ("اسید آمینه ضروری", "اسید آمینه‌ای که بدن نمی‌تواند خودش بسازد و باید از غذا دریافت شود. انسان نُه اسید آمینه ضروری دارد."),
    "ur": ("لازمی امینو ایسڈ", "ایسا امینو ایسڈ جسے جسم خود نہیں بنا سکتا اور غذا سے حاصل کرنا پڑتا ہے۔ انسان میں نو لازمی امینو ایسڈز ہوتے ہیں۔"),
    "ps": ("اړین (اسانشیل) امینو اسید", "امینو اسید چې بدن یې پخپله نشي جوړولی، باید له خواړو څخه ترلاسه شي. انسان نهه اړین امینو اسیدونه لري."),
    "so": ("Aashito amino ah oo lagama maarmaan ah", "Aashito amino ah oo jidhku uusan samayn karin, ee laga helo cuntada. Bini-aadamku wuxuu leeyahay sagaal aashito amino ah oo lagama maarmaan ah."),
    "am": ("አስፈላጊ አሚኖ አሲድ", "ሰውነት ራሱ ማምረት የማይችል፣ ከምግብ ማግኘት ያለበት አሚኖ አሲድ። ሰው ዘጠኝ አስፈላጊ አሚኖ አሲዶች አሉት።"),
    "rw": ("Aside amine ngombwa", "Aside amine umubiri utabasha kwikorera, ugomba kuyibona mu biryo. Abantu bafite aside amine icyenda ngombwa."),
   }},
}

# ----------------------------------------------------------------------------------------------
# TERMER: övriga fetmarkerade ord – bara namn_native, ingen definition, inte med i checklistan.
# ----------------------------------------------------------------------------------------------
TERMER = {
 "druvsocker": {"en": "glucose (grape sugar)", "es": "glucosa (azúcar de uva)", "pl": "glukoza (cukier gronowy)",
   "bs": "grožđani šećer (glukoza)", "ar": "سكر العنب (الجلوكوز)", "fa": "قند انگور (گلوکز)",
   "ur": "انگور کی شکر (گلوکوز)", "ps": "د انګور شکره (glukos)", "so": "sonkorta canabka (glukoosa)",
   "am": "የወይን ስኳር (ግሉኮስ)", "rw": "isukari y'inzabibu (glucose)"},
 "fruktsocker": {"en": "fructose (fruit sugar)", "es": "fructosa (azúcar de fruta)", "pl": "fruktoza (cukier owocowy)",
   "bs": "voćni šećer (fruktoza)", "ar": "سكر الفاكهة (الفركتوز)", "fa": "قند میوه (فروکتوز)",
   "ur": "پھلوں کی شکر (فرکٹوز)", "ps": "د میوو شکره (fruktos)", "so": "sonkorta khudradda (fraktoosa)",
   "am": "የፍራፍሬ ስኳር (ፍሩክቶስ)", "rw": "isukari y'imbuto (fructose)"},
 "galaktos": {"en": "galactose", "es": "galactosa", "pl": "galaktoza", "bs": "galaktoza", "ar": "الجالاكتوز",
   "fa": "گالاکتوز", "ur": "گلیکٹوز", "ps": "galaktos", "so": "galaktoosa", "am": "ጋላክቶስ", "rw": "galactose"},
 "sackaros": {"en": "sucrose (table sugar)", "es": "sacarosa (azúcar de mesa)", "pl": "sacharoza (cukier stołowy)",
   "bs": "saharoza (kuhinjski šećer)", "ar": "السكروز (سكر المائدة)", "fa": "ساکارز (شکر معمولی)",
   "ur": "سوکروز (عام چینی)", "ps": "sackaros (د دسترخوان شکره)", "so": "sukrose (sonkorta guud)",
   "am": "ሳክሮስ (የጠረጴዛ ስኳር)", "rw": "sucrose (isukari isanzwe)"},
 "maltos": {"en": "maltose", "es": "maltosa", "pl": "maltoza", "bs": "maltoza", "ar": "المالتوز", "fa": "مالتوز",
   "ur": "مالٹوز", "ps": "maltos", "so": "maltoosa", "am": "ማልቶስ", "rw": "maltose"},
 "laktos": {"en": "lactose", "es": "lactosa", "pl": "laktoza", "bs": "laktoza", "ar": "اللاكتوز", "fa": "لاکتوز",
   "ur": "لیکٹوز", "ps": "laktos", "so": "laktoosa", "am": "ላክቶስ", "rw": "lactose"},
 "glykosidbindning": {"en": "glycosidic bond", "es": "enlace glucosídico", "pl": "wiązanie glikozydowe",
   "bs": "glikozidna veza", "ar": "رابطة جليكوسيدية", "fa": "پیوند گلیکوزیدی", "ur": "گلائیکوسیڈک بانڈ",
   "ps": "ګلایکوسیډیک تړون", "so": "xidhiidh glycosidic ah", "am": "ግላይኮሳይዲክ ትስስር", "rw": "umugozi glycosidique"},
 "esterbindning": {"en": "ester bond", "es": "enlace éster", "pl": "wiązanie estrowe", "bs": "esterska veza",
   "ar": "رابطة إستر", "fa": "پیوند استری", "ur": "ایسٹر بانڈ", "ps": "ester تړون", "so": "xidhiidh ester ah",
   "am": "ኤስተር ትስስር", "rw": "umugozi wa ester"},
 "härdat fett": {"en": "hydrogenated fat", "es": "grasa hidrogenada", "pl": "tłuszcz utwardzony",
   "bs": "hidrogenizirana mast", "ar": "دهون مهدرجة", "fa": "چربی هیدروژنه", "ur": "ہائیڈروجنیٹڈ چربی",
   "ps": "سختول شوی غوړ", "so": "dufan la adkeeyay (hydrogenated)", "am": "የተጠነከረ ስብ", "rw": "amavuta akomeretse (hydrogéné)"},
 "aminogrupp": {"en": "amino group", "es": "grupo amino", "pl": "grupa aminowa", "bs": "amino grupa",
   "ar": "مجموعة أمين", "fa": "گروه آمین", "ur": "امینو گروپ", "ps": "امینو ګروپ", "so": "koox amino ah",
   "am": "አሚኖ ቡድን", "rw": "itsinda rya amine"},
 "peptidbindning": {"en": "peptide bond", "es": "enlace peptídico", "pl": "wiązanie peptydowe", "bs": "peptidna veza",
   "ar": "رابطة ببتيدية", "fa": "پیوند پپتیدی", "ur": "پیپٹائیڈ بانڈ", "ps": "پیپټایډ تړون", "so": "xidhiidh peptide ah",
   "am": "ፔፕታይድ ትስስር", "rw": "umugozi wa peptide"},
 "enzym": {"en": "enzyme", "es": "enzima", "pl": "enzym", "bs": "enzim", "ar": "إنزيم", "fa": "آنزیم",
   "ur": "خامرہ (اینزائم)", "ps": "انزایم", "so": "enzaym", "am": "ኢንዛይም", "rw": "enzyme"},
 "denaturering": {"en": "denaturation", "es": "desnaturalización", "pl": "denaturacja", "bs": "denaturacija",
   "ar": "تمسخ (denaturation)", "fa": "دناتوراسیون", "ur": "ڈی نیچریشن", "ps": "denaturation", "so": "denaturation",
   "am": "ዲናቹሬሽን", "rw": "denatarasiyo"},
}

# ----------------------------------------------------------------------------------------------
# Begreppskort (memory): två nivåer
# ----------------------------------------------------------------------------------------------
KORT = {
 "1": [
  ("Fotosyntes", "Växter bygger druvsocker av koldioxid, vatten och ljusenergi. Syrgas bildas."),
  ("Cellandning", "Celler bryter ner druvsocker med syrgas och frigör energi."),
  ("Kolhydrat", "Näringsämne av kol, väte och syre, byggt av sockerenheter."),
  ("Monosackarid", "En enda sockerenhet, t.ex. glukos, fruktos eller galaktos."),
  ("Disackarid", "Två ihopsatta sockerenheter, t.ex. sackaros eller laktos."),
  ("Polysackarid", "Jättemånga sockerenheter i en lång kedja, t.ex. stärkelse."),
  ("Stärkelse", "Växters energilager, glukosenheter i alfa-1,4-bindningar, böjd kedja."),
  ("Cellulosa", "Byggmaterial i växters cellväggar, glukos i beta-1,4-bindningar, rak kedja."),
  ("Fettsyra", "Lång kolkedja med en syragrupp, byggstenen i fett."),
  ("Mättat fett", "Fettsyror med bara enkelbindningar, rak kedja, ofta fast."),
  ("Omättat fett", "Fettsyror med minst en dubbelbindning, en knäck i kedjan."),
  ("Protein", "Byggs av aminosyror, kroppens byggnadsmaterial och enzymer."),
 ],
 "2": [
  ("Aminosyra", "Byggstenen i protein: aminogrupp, karboxylgrupp och sidokedja R."),
  ("Essentiell aminosyra", "En aminosyra kroppen inte kan tillverka själv."),
  ("Glykogen", "Djurens energilager, liknar stärkelse men mer förgrenat."),
  ("Peptidbindning", "Bindningen som håller ihop aminosyror i ett protein."),
  ("Enzym", "Ett protein som snabbar på kemiska reaktioner i kroppen."),
  ("Denaturering", "När ett protein förlorar sin form, t.ex. av hög värme."),
  ("Glycerol", "Molekylen som fettsyrorna binds till i ett fett."),
  ("Esterbindning", "Bindningen mellan glycerol och en fettsyra."),
  ("Sackaros", "Vanligt hushållssocker: glukos + fruktos."),
  ("Laktos", "Mjölksocker: glukos + galaktos."),
  ("Maltos", "Maltsocker: glukos + glukos."),
  ("Härdat fett", "Omättat fett som fått väte tillsatt och blivit hårdare."),
 ],
}

CHECKLISTA = {
 "title": "Checklista – Matens kemi",
 "subject": "Kemi",
 "area": "Matens kemi",
 "intro": "Checklistan följer studieguidens fem milstolpar. Bocka av det du känner dig trygg med.",
 "sections": [
  {"title": "1. Fotosyntes och cellandning (M1)", "items": [
   "Jag kan skriva fotosyntesens ordekvation.",
   "Jag kan skriva cellandningens ordekvation.",
   "Jag vet att cellandningen är fotosyntesens motsats.",
   "Jag vet att växter bygger druvsocker och stärkelse som djur sedan kan äta."]},
  {"title": "2. Kolhydrater (M2)", "items": [
   "Jag kan ge tre exempel på kolhydrater.",
   "Jag vet vilka grundämnen kolhydrater byggs av.",
   "Jag kan förklara skillnaden mellan monosackarid, disackarid och polysackarid.",
   "Jag vet att glukos, fruktos och galaktos alla har formeln C6H12O6 men olika uppbyggnad.",
   "Jag vet att sackaros är det kemiska namnet för vanligt socker, och vad den är uppbyggd av.",
   "Jag kan förklara likheter och skillnader mellan stärkelse och cellulosa.",
   "Jag vet varför människan inte kan ta upp energin i cellulosa.",
   "Jag kan ge exempel på stärkelserik mat."]},
  {"title": "3. Fetter (M3)", "items": [
   "Jag kan rita/beskriva hur en fettmolekyl är uppbyggd (glycerol + tre fettsyror).",
   "Jag vet vad fett används till i kroppen.",
   "Jag vet vilken alkohol som alltid ingår i fett (glycerol).",
   "Jag kan förklara skillnaden mellan mättat och omättat fett med antal dubbelbindningar.",
   "Jag vet att fett innehåller mer än dubbelt så mycket energi per gram som kolhydrat.",
   "Jag vet vad härdat fett är."]},
  {"title": "4. Proteiner (M4)", "items": [
   "Jag vet vad protein används till i kroppen.",
   "Jag kan ge exempel på proteinrik mat.",
   "Jag vet att proteinets byggstenar heter aminosyror.",
   "Jag vet vilka grundämnen som oftast ingår i en aminosyra.",
   "Jag vet att kroppen inte kan bygga alla proteiner enbart av kolhydrater och fett.",
   "Jag kan förklara vad en essentiell aminosyra är.",
   "Jag vet att enzymer är proteiner.",
   "Jag kan förklara vad som händer när protein denatureras, t.ex. av värme.",
   "Jag kan resonera kring hur 20 aminosyror kan ge oerhört många olika proteiner."]},
  {"title": "5. Energilagring och sammanfattning (M5)", "items": [
   "Jag kan förklara hur växter (stärkelse) och djur (glykogen) lagrar energi.",
   "Jag kan förklara hur kroppen använder kolhydrater, fett och protein tillsammans."]},
 ]}
