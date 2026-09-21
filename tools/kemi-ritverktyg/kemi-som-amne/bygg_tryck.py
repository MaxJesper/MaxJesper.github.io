# -*- coding: utf-8 -*-
"""Genererar utskrivbara ark: sakerhetsintyg.html och rapportmall.html (kemi/kemi-som-amne/)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "kemi-som-amne")
from bygg_lab import CSS as LABCSS, wrap_tables

EXTRA = '''
    .ark { background:#fff; border:1px solid #d8d8d8; border-left:5px solid var(--area); border-radius:12px; padding:1.2rem 1.5rem 1.5rem; margin-bottom:1.6rem; box-shadow:0 2px 8px rgba(0,0,0,.04); }
    .ark h2 { margin:.2rem 0 .6rem; color:var(--area-strong); font-size:1.35rem; }
    .ark h3 { color:var(--area-strong); border-bottom:2px solid var(--area-border); padding-bottom:.2rem; margin:1.1rem 0 .4rem; font-size:1.05rem; }
    .ark p { margin:.3rem 0 .5rem; }
    .kryss { list-style:none; margin:.3rem 0 .8rem; padding:0; }
    .kryss li { display:flex; gap:.7rem; align-items:flex-start; margin:0 0 .55rem; line-height:1.45; }
    .kryss .ruta { flex:0 0 1.15rem; height:1.15rem; border:2px solid #222; border-radius:3px; margin-top:.2rem; background:#fff; }
    .fyll { display:grid; grid-template-columns:minmax(9rem,14rem) 1fr; gap:.2rem .8rem; align-items:end; margin:.3rem 0 .8rem; }
    .fyll .lbl { font-weight:600; }
    .fyll .lin { border-bottom:1px solid #777; min-height:1.7rem; }
    .signa { display:grid; grid-template-columns:1fr 1fr; gap:1.4rem; margin-top:1.4rem; }
    .signa div { border-top:1px solid #222; padding-top:.25rem; font-size:.92rem; }
    .nodruta { border:3px solid #1e3a8a; border-radius:8px; padding:.6rem 1rem; margin:.6rem 0; background:#eff6ff; }
    .nodruta strong.t { display:block; font-weight:800; color:#1e3a8a; margin-bottom:.25rem; }
    .not { font-size:.9rem; color:#334155; }
    .ledtext { font-size:.9rem; color:#475569; margin:.1rem 0 .2rem; }
    .delbox { margin:.5rem 0 .9rem; }
    .delbox .rubrik { font-weight:700; }
    .quiz fieldset { border:1px solid #c7d2fe; border-radius:10px; margin:0 0 .9rem; padding:.6rem .9rem .8rem; background:#fff; }
    .quiz legend { font-weight:700; padding:0 .4rem; color:#1a1a2e; }
    .quiz label { display:flex; gap:.6rem; align-items:flex-start; padding:.35rem .3rem; min-height:44px; cursor:pointer; border-radius:6px; }
    .quiz label:hover { background:#eef2ff; }
    .quiz input[type=radio] { width:1.2rem; height:1.2rem; margin-top:.2rem; flex:0 0 auto; }
    .quiz .fb { margin:.4rem 0 0; padding:.45rem .7rem; border-radius:6px; font-weight:600; display:none; }
    .quiz .fb.ratt { display:block; background:#dbeafe; border:2px solid #1d4ed8; color:#1e3a8a; }
    .quiz .fb.fel { display:block; background:#ffedd5; border:2px dashed #9a3412; color:#7c2d12; }
    .quiz .res { font-weight:800; font-size:1.1rem; margin:.6rem 0; }
    .quiz button.kolla { min-height:44px; padding:.5rem 1.1rem; font-size:1rem; font-weight:700; border:2px solid #3730a3; background:#3730a3; color:#fff; border-radius:8px; cursor:pointer; }
    .quiz button.kolla:focus-visible, .quiz input:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    @media (max-width: 640px) { .fyll { grid-template-columns:1fr; } .signa { grid-template-columns:1fr; } }
    @media print {
      .ark { border:none; border-radius:0; box-shadow:none; padding:0; margin:0; }
      .ark h2 { font-size:15pt; }
      .nodruta { background:#fff !important; border:2.5pt solid #1e3a8a; }
      .quiz { display:none !important; }
      .kryss li, .delbox, .signa { break-inside:avoid; }
      .ark h3 { break-after:avoid; }
      .ark .ny-sida { break-before:page; margin-top:0; }
    }
'''


QUIZ_HTML = """    <section class="ark quiz no-print" id="kontroll" aria-labelledby="kontroll-h">
      <h2 id="kontroll-h">Kontrollfrågor innan du skriver ut intyget</h2>
      <p>Svara på frågorna. Du får besked och en förklaring direkt, och du kan svara igen. Skriv sedan ut intyget nedanför och skriv under.</p>
      <form id="quiz-form" novalidate></form>
      <button type="button" class="kolla" id="quiz-kolla">Rätta mina svar</button>
      <p class="res" id="quiz-res" role="status" aria-live="polite"></p>
    </section>"""

QUIZ_JS = """
  <script>
  (function () {
    var Q = [
      ["Något spills eller ett glas går sönder. Vad gör du först?", ["Torkar upp det själv så fort jag kan", "Säger till läraren direkt", "Väntar och ser om det går över"], 1, "Säg alltid till läraren direkt. Rör inte skärvor eller okända kemikalier med händerna."],
      ["Du får en kemikalie i ögat. Hur länge ska du skölja med ljummet vatten?", ["Minst 15 minuter", "Några sekunder", "Tills det har slutat svida"], 0, "Skölj i minst 15 minuter och säg till läraren direkt. Tiden räknas."],
      ["Ämnet i burken ser ut som socker. Får du smaka på det?", ["Ja, om det ser ofarligt ut", "Nej, aldrig i kemisalen", "Ja, om läraren inte ser"], 1, "Ät, drick och smaka aldrig i kemisalen. Man kan aldrig veta säkert vad som finns i ett kärl."],
      ["När tänder du tändstickan när du ska tända bunsenbrännaren?", ["Innan jag öppnar gaskranen", "Efter att jag har öppnat gaskranen", "Det spelar ingen roll"], 0, "Tänd tändstickan först. Annars kan gas hinna strömma ut utan att brinna."],
      ["Hur förbereder du dig innan du börjar arbeta?", ["Jag sätter på skyddsglasögon och sätter upp håret", "Jag tar på glasögonen först när det är farligt", "Jag behöver inte förbereda något"], 0, "Skyddsglasögon på och håret uppsatt innan du hämtar något. Ta också av halsdukar och lösa smycken."],
      ["Du bränner dig på en het bägare. Vad gör du?", ["Spolar med svalt vatten, högst 15 minuter", "Lägger på is", "Väntar utan att göra något"], 0, "Spola med svalt vatten och säg till. Använd aldrig is eller snö."],
      ["Vad är det som visar vilken sorts fara ett faropiktogram gäller?", ["Bara färgen", "Symbolens form", "Hur stort det är"], 1, "Det är symbolens form som berättar faran, så det fungerar även om du inte kan skilja på färger."],
      ["Får du gå ifrån en tänd låga en liten stund?", ["Ja, om lågan är blå", "Nej, aldrig", "Ja, om en kompis är kvar i rummet"], 1, "En tänd låga ska aldrig lämnas. Släck den och stäng gaskranen när du inte värmer."],
      ["En bägare har stått nära lågan. Hur vet du att den är för het att ta i?", ["Det syns på glaset", "Det går inte att se, så jag väntar", "Den ryker alltid"], 1, "Varm och kall utrustning ser likadan ut. Vänta med att ta i den, och känn gärna med handen en bit ovanför."],
      ["Varför läser du etiketten på en kemikalie innan du använder den?", ["Den visar farorna och hur ämnet ska hanteras", "För att se vad den kostade", "Det behöver bara läraren göra"], 0, "Etiketten har piktogram, signalord och faro- och skyddsangivelser som du behöver känna till."]
    ];
    var form = document.getElementById('quiz-form');
    Q.forEach(function (q, i) {
      var fs = document.createElement('fieldset'), lg = document.createElement('legend');
      lg.textContent = (i + 1) + '. ' + q[0]; fs.appendChild(lg);
      q[1].forEach(function (opt, j) {
        var l = document.createElement('label'), r = document.createElement('input');
        r.type = 'radio'; r.name = 'q' + i; r.value = j;
        l.appendChild(r); l.appendChild(document.createTextNode(' ' + opt)); fs.appendChild(l);
      });
      var fb = document.createElement('div'); fb.className = 'fb'; fb.id = 'fb' + i; fb.setAttribute('role', 'status'); fs.appendChild(fb);
      form.appendChild(fs);
    });
    document.getElementById('quiz-kolla').addEventListener('click', function () {
      var ratt = 0, obesvarade = 0;
      Q.forEach(function (q, i) {
        var val = form.querySelector('input[name=q' + i + ']:checked'), fb = document.getElementById('fb' + i);
        if (!val) { obesvarade++; fb.className = 'fb'; fb.textContent = ''; return; }
        if (+val.value === q[2]) { ratt++; fb.className = 'fb ratt'; fb.textContent = '✓ Rätt. ' + q[3]; }
        else { fb.className = 'fb fel'; fb.textContent = '✕ Inte riktigt. Rätt svar: ' + q[1][q[2]] + '. ' + q[3]; }
      });
      var res = document.getElementById('quiz-res');
      res.textContent = obesvarade ? ('Du har inte svarat på ' + obesvarade + (obesvarade > 1 ? ' frågor' : ' fråga') + ' än. Rätt hittills: ' + ratt + ' av ' + Q.length + '.')
        : (ratt === Q.length ? 'Alla ' + Q.length + ' rätt. Skriv ut intyget nedanför och skriv under.' : ratt + ' av ' + Q.length + ' rätt. Läs förklaringarna, ändra dina svar och rätta igen.');
    });
  })();
  </script>"""

def page(fil, titel, rubrik, body, intro, extra_js=""):
    html = f'''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{titel} – Kemi som ämne</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>{LABCSS}{EXTRA}  </style>
</head>
<body class="area-amne">
  <header class="kemi-header">
    <h1>{rubrik}</h1>
    <p>Kemi som ämne</p>
  </header>

  <button class="hamburger no-print" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu" class="no-print"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
      <button type="button" class="subject-btn print-green" onclick="window.print()">🖨️ Skriv ut</button>
    </div>
    <section class="intro-card no-print"><p>{intro}</p></section>
{wrap_tables(body)}
  </main>

  <script src="/js/menu.js"></script>{extra_js}
</body>
</html>
'''
    open(os.path.join(OUT, fil), "w", encoding="utf-8").write(html); print("skrev", fil, len(html))

def kryss(lst): return '<ul class="kryss">' + "".join('<li><span class="ruta" aria-hidden="true"></span><span>%s</span></li>' % t for t in lst) + "</ul>"

INTYG = f'''    <section class="ark">
      <h2>Säkerhetsintyg för kemisalen</h2>
      <div class="fyll"><span class="lbl">Namn</span><span class="lin"></span><span class="lbl">Klass</span><span class="lin"></span><span class="lbl">Datum</span><span class="lin"></span></div>
      <p>Gå igenom listan tillsammans med din lärare. Sätt en bock i rutan när du har läst och förstått varje punkt. Fråga om något är oklart.</p>

      <h3>Så arbetar jag i kemisalen</h3>
      {kryss([
        "Jag tar på <strong>skyddsglasögon</strong> innan jag hämtar något och har dem på hela tiden.",
        "Jag sätter upp långt hår, tar av halsdukar och lösa smycken och har slutna skor.",
        "Jag läser hela instruktionen och etiketterna på kemikalierna <strong>innan</strong> jag börjar.",
        "Jag <strong>äter, dricker och smakar aldrig</strong> i kemisalen, inte ens på salt eller socker.",
        "Jag luktar bara om läraren säger det, och då genom att fläkta lite luft mot näsan.",
        "Jag blandar inga kemikalier på eget initiativ och gör bara det instruktionen säger.",
        "Jag <strong>lämnar aldrig</strong> en tänd låga, och jag tänder tändstickan innan jag öppnar gasen.",
        "Jag värmer aldrig en stängd behållare och riktar aldrig ett provrör mot någon.",
        "Jag väntar med att ta i utrustning som har varit nära värmen, för varm och kall utrustning ser likadan ut.",
        "Jag kastar kemikalierester i rätt kärl, släcker lågan, stänger gaskranen, rengör bänken och tvättar händerna.",
      ])}

      <h3>Om något händer</h3>
      <div class="nodruta"><strong class="t">Jag säger alltid till läraren direkt.</strong>Det är aldrig pinsamt, och tiden räknas, särskilt om jag har fått något i ögonen.</div>
      {kryss([
        "<strong>Kemikalie i ögat:</strong> jag sköljer ögat i minst 15 minuter med ljummet vatten och säger till.",
        "<strong>Kemikalie på huden:</strong> jag sköljer direkt med svalt vatten, försiktigt och länge.",
        "<strong>Brännskada:</strong> jag spolar med svalt vatten, högst 15 minuter. Jag använder aldrig is eller snö.",
        "<strong>Glas som gått sönder eller spill:</strong> jag rör inte skärvorna eller okända kemikalier med händerna utan säger till.",
        "<strong>Brand:</strong> jag säger till direkt och följer lärarens instruktioner.",
        "Vid akut förgiftning finns Giftinformationscentralen på telefon 010-456 6700. Vid livshotande tillstånd ringer man 112.",
      ])}

      <h3 class="ny-sida">Här finns det i min kemisal (fylls i tillsammans med läraren)</h3>
      <div class="fyll">
        <span class="lbl">Brandfilt</span><span class="lin"></span>
        <span class="lbl">Brandsläckare</span><span class="lin"></span>
        <span class="lbl">Ögonspolning</span><span class="lin"></span>
        <span class="lbl">Nöddusch</span><span class="lin"></span>
        <span class="lbl">Gasens nödstopp</span><span class="lin"></span>
        <span class="lbl">Utgångar</span><span class="lin"></span>
        <span class="lbl">Första hjälpen</span><span class="lin"></span>
      </div>

      <h3>Intyg</h3>
      <p>Jag har gått igenom reglerna ovan och förstått dem. Jag kommer att följa dem och fråga läraren när jag är osäker.</p>
      <div class="signa"><div>Elevens underskrift</div><div>Lärarens underskrift</div></div>
      <p class="not">Kontrollera med din lärare vilka ytterligare regler som gäller i just din kemisal.</p>
    </section>'''

MALL = f'''    <section class="ark">
      <h2>Laborationsrapport</h2>
      <div class="meta-row"><span>Namn:</span><span>Klass:</span><span>Datum:</span></div>
      <div class="fyll"><span class="lbl">Rubrik (titel)</span><span class="lin"></span></div>

      <h3>1. Syfte och frågeställning</h3>
      <p class="ledtext">Vad vill du ta reda på? Frågan ska gå att besvara med mätningar eller observationer.</p>
      <span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>2. Hypotes</h3>
      <p class="ledtext">Vad tror du kommer att hända, och varför? Skriv gärna ”Om … så … eftersom …”.</p>
      <span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>3. Material</h3>
      <span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>4. Risker</h3>
      <p class="ledtext">Vad kan gå fel, och hur minskar du risken?</p>
      <table class="resultat-table"><thead><tr><th>Vad kan gå fel?</th><th>Så minskar jag risken</th></tr></thead>
      <tbody><tr><td class="hoog"></td><td class="hoog"></td></tr><tr><td class="hoog"></td><td class="hoog"></td></tr></tbody></table>

      <h3 class="ny-sida">5. Genomförande</h3>
      <p class="ledtext">Beskriv i dåtid vad du gjorde, steg för steg, så noga att någon annan kan upprepa det.</p>
      <table class="resultat-table"><thead><tr><th>Jag ändrade (oberoende variabel)</th><th>Jag mätte (beroende variabel)</th><th>Jag höll lika (kontrollvariabler)</th></tr></thead>
      <tbody><tr><td class="hoog"></td><td class="hoog"></td><td class="hoog"></td></tr></tbody></table>
      <span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>6. Resultat</h3>
      <p class="ledtext">Bara det du mätte och såg, inga förklaringar. Tabellen ska ha rubrik, kolumnnamn och enheter. Diagrammet ska ha namn och enhet på båda axlarna.</p>
      <table class="resultat-table"><thead><tr><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th></tr></thead>
      <tbody><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></tbody></table>
      <div class="grafruta" role="img" aria-label="Utrymme för diagram"></div>

      <h3 class="ny-sida">7. Slutsats och diskussion</h3>
      <p class="ledtext">Svara på frågan. Stämde din hypotes? Förklara varför med kemins begrepp. Vilka felkällor fanns? Hur säkra är resultaten? Hur kan undersökningen förbättras? Vilken ny fråga väcker den?</p>
      <span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>8. Källor</h3>
      <p class="ledtext">Om du har hämtat fakta någonstans ifrån: skriv var.</p>
      <span class="svarslinje"></span><span class="svarslinje"></span>

      <h3>Kontrollera innan du lämnar in</h3>
      {kryss([
        "Frågeställningen går att besvara med mätningar eller observationer.",
        "Jag har skrivit vad jag ändrade, mätte och höll lika.",
        "Genomförandet är i dåtid och så noggrant att någon annan kan upprepa det.",
        "Alla tal har enhet, och tabellen och diagrammet har rubrik och namn på axlarna.",
        "Resultatdelen innehåller bara det jag mätte och såg.",
        "Slutsatsen svarar på frågan, förklarar med kemins begrepp och tar upp felkällor.",
      ])}
    </section>'''

if __name__ == "__main__":
    page("sakerhetsintyg.html", "Säkerhetsintyg", "Säkerhetsintyg",
         QUIZ_HTML + "\n" + INTYG, "Gör så här: 1. Läs reglerna i milstolpe 4 och i intyget. 2. Svara på kontrollfrågorna. 3. Skriv ut intyget, gå igenom det med din lärare och skriv under.",
         extra_js=QUIZ_JS)
    page("rapportmall.html", "Mall för laborationsrapport", "Mall för laborationsrapport",
         MALL, "Skriv ut mallen och fyll i den när du gör en laboration. Delarna följer milstolpe 7 i studieguiden.")
