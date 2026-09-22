#!/usr/bin/env python3
"""Genererar kemi/matens-kemi/laborationer.html (två säkra, egna laborationsprotokoll).
Mönster: kemi/separationsprocesser/laborationer.html (lab-sheet/risk-box/resultat-table/lararnotis).
Körs: python3 bygg_lab.py"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "matens-kemi", "laborationer.html")

AREA = "body.area-matens-kemi { --area:#c2410c; --area-strong:#9a3412; --area-soft:#fff7ed; --area-border:#fed7aa; --area-hover:#ffedd5; }"

HTML = """<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laborationer – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    main { max-width: 900px; margin: 0 auto; font-size: 1.05em; }
    .intro-card { background: var(--area-soft); border: 1px solid var(--area-border); border-left: 4px solid var(--area-strong); border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 1.2rem; }
    .intro-card ul { margin: 0.4rem 0 0 1.2rem; padding: 0; }
    .intro-card li { margin: 0.25rem 0; }
    .intro-card a { color: var(--area-strong); }
    .lab-sheet { background: #fff; border: 1px solid #d8d8d8; border-left: 5px solid var(--area); border-radius: 12px; padding: 1.2rem 1.5rem 1.5rem; margin-bottom: 1.6rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); scroll-margin-top: 0.75rem; }
    .lab-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
    .lab-tag { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.5px; color: var(--area-strong); text-transform: uppercase; }
    .lab-top .subject-btn { margin: 0; }
    .meta-row { display: flex; border: 1px solid #aaa; border-radius: 4px; margin: 0.4rem 0 0.7rem; overflow: hidden; }
    .meta-row span { flex: 1; padding: 0.35rem 0.6rem; border-right: 1px solid #aaa; font-size: 0.92rem; min-height: 1.9rem; }
    .meta-row span:last-child { border-right: none; }
    .lab-title { margin: 0.2rem 0 0.6rem; color: var(--area-strong); font-size: 1.35rem; }
    .lab-body h3 { color: var(--area-strong); border-bottom: 2px solid var(--area-border); padding-bottom: 0.2rem; margin: 1.1rem 0 0.4rem; font-size: 1.05rem; }
    .lab-body p { margin: 0.3rem 0 0.5rem; }
    .lab-body ul.mat, .lab-body ol.steg { margin: 0.2rem 0 0.6rem 1.4rem; padding: 0; }
    .lab-body li { margin-bottom: 0.3rem; line-height: 1.45; }
    .risk-box { background: #fef2f2; border: 3px solid #b91c1c; border-radius: 8px; padding: 0.7rem 1rem; margin: 0.6rem 0 0.4rem; }
    .risk-title { font-weight: 800; color: #991b1b; margin-bottom: 0.3rem; }
    .risk-box ul { margin: 0 0 0 1.2rem; padding: 0; }
    .risk-box li { margin-bottom: 0.25rem; color: #222; }
    .resultat-table { width: 100%; border-collapse: collapse; margin: 0.4rem 0 0.8rem; font-size: 0.93rem; }
    .resultat-table th { background: var(--area-strong); color: #fff; padding: 0.4rem 0.55rem; text-align: left; font-weight: 600; }
    .resultat-table td { padding: 0.4rem 0.55rem; border: 1px solid #b5b5b5; height: 2.2rem; vertical-align: top; }
    @media (max-width: 640px) { .resultat-table { display: block; overflow-x: auto; } }
    .fragor ol { margin: 0.2rem 0 0 1.4rem; padding: 0; }
    .fragor li { margin-bottom: 0.9rem; }
    .svarslinje { display: block; width: 100%; height: 1.7rem; border-bottom: 1px solid #999; }
    .lararnotis { margin-top: 1rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.93rem; }
    .lararnotis summary { cursor: pointer; font-weight: 700; color: #334155; }

    @page { size: A4; margin: 13mm 14mm; }
    @media print {
      header, nav, .hamburger, .no-print, .intro-card { display: none !important; }
      body { background: #fff !important; font-size: 10.5pt; }
      main { max-width: none; margin: 0; padding: 0; font-size: 10.5pt; }
      .lab-sheet { border: none; border-radius: 0; box-shadow: none; padding: 0; margin: 0; page-break-after: always; break-after: page; }
      .lab-sheet:last-of-type { page-break-after: auto; break-after: auto; }
      .lab-title { font-size: 15pt; }
      .resultat-table th { background: #333 !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .risk-box { border: 2.5pt solid #b91c1c; background: #fff !important; }
      .lab-body h3 { break-after: avoid; }
      .resultat-table, .risk-box, .fragor li { break-inside: avoid; }
      body[data-print] .lab-sheet:not(.lab-active) { display: none !important; }
    }
  </style>
</head>
<body class="area-matens-kemi">
  <header class="kemi-header">
    <h1>Laborationer</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger no-print" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu" class="no-print"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
      <button type="button" class="subject-btn print-green" id="print-all">🖨️ Skriv ut alla laborationer</button>
    </div>

    <section class="intro-card no-print">
      <p><strong>Utskrivbara laborationsprotokoll.</strong> Varje laboration har syfte, risker, material, genomförande, resultattabell och frågor. Läs riskerna innan ni börjar och använd skyddsglasögon.</p>
      <ul>
        <li><a href="#lab-1">Laboration 1: Jodtest – vilka livsmedel innehåller stärkelse?</a> <span style="color:#475569">(M2, 30–40 min)</span></li>
        <li><a href="#lab-2">Laboration 2: Fettfläcktest – vilka livsmedel innehåller fett?</a> <span style="color:#475569">(M3, 25–35 min)</span></li>
      </ul>
    </section>

    <section class="lab-sheet" id="lab-1" data-lab="lab-1">
      <div class="lab-top no-print">
        <span class="lab-tag">Laboration 1 · M2 · 30–40 min · nivå E–C</span>
        <button type="button" class="subject-btn print-green" data-print-lab="lab-1">🖨️ Skriv ut den här laborationen</button>
      </div>
      <div class="meta-row"><span>Namn:</span><span>Klass:</span><span>Datum:</span></div>
      <h2 class="lab-title">Laboration 1: Jodtest – vilka livsmedel innehåller stärkelse?</h2>
      <div class="lab-body">
        <h3>Syfte</h3>
        <p>Att undersöka vilka vanliga livsmedel som innehåller stärkelse, med hjälp av jod-kaliumjodidlösning (jodlösning) som indikator.</p>
        <div class="risk-box">
          <div class="risk-title">⚠️ Risker vid laborationen</div>
          <ul>
            <li>Bär skyddsglasögon och gärna handskar – jodlösning färgar hud och kläder brunt/svart, och fläckarna är svåra att få bort.</li>
            <li>Jodlösning kan vara irriterande vid hudkontakt eller om den kommer i ögonen. Skölj genast med rikligt vatten vid stänk.</li>
            <li>Smaka aldrig på något i laborationen. Livsmedlen som används i testet ska inte ätas efteråt.</li>
          </ul>
        </div>
        <h3>Material</h3>
        <ul class="mat">
          <li>Jod-kaliumjodidlösning (jodlösning) i droppflaska</li>
          <li>Små bitar/provmängder av olika livsmedel: bröd, potatis (kokt), ris (kokt), äpple, mjölk, sockerbit, pasta (kokt)</li>
          <li>Vit porslinsplatta, urglas eller små bägare (ett per livsmedel)</li>
          <li>Pipett eller droppflaska, skyddsglasögon</li>
        </ul>
        <h3>Genomförande</h3>
        <ol class="steg" start="1">
          <li>Sätt på skyddsglasögonen. Lägg en liten bit av varje livsmedel i ett eget fack på porslinsplattan (eller i en egen bägare).</li>
          <li>Droppa 2–3 droppar jodlösning på varje livsmedelsprov.</li>
          <li>Vänta någon minut och observera färgen. Jodlösning är normalt gulbrun. Blir provet <strong>blåsvart/mörklila</strong> innehåller det stärkelse.</li>
          <li>Skriv resultatet i tabellen: blev det blåsvart (+) eller ingen färgändring (−)?</li>
          <li>Häll ut/kasta proverna enligt lärarens anvisning. Skölj plattan.</li>
        </ol>
        <h3>Resultat</h3>
        <table class="resultat-table">
          <thead><tr><th>Livsmedel</th><th>Färg efter jod</th><th>Stärkelse? (+/−)</th></tr></thead>
          <tbody>
            <tr><td>Bröd</td><td></td><td></td></tr>
            <tr><td>Potatis (kokt)</td><td></td><td></td></tr>
            <tr><td>Ris (kokt)</td><td></td><td></td></tr>
            <tr><td>Äpple</td><td></td><td></td></tr>
            <tr><td>Mjölk</td><td></td><td></td></tr>
            <tr><td>Sockerbit</td><td></td><td></td></tr>
            <tr><td>Pasta (kokt)</td><td></td><td></td></tr>
          </tbody>
        </table>
        <h3>Frågor och slutsats</h3>
        <div class="fragor">
          <ol>
            <li>Vilka livsmedel innehöll stärkelse? Vad har de gemensamt (växtdel/ursprung)?<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Sockerbiten är också en kolhydrat, men gav troligen ingen blåsvart färg. Förklara varför, med hjälp av begreppen monosackarid/disackarid/polysackarid.<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Varför tror du jodlösningen används just för att visa stärkelse och inte socker i allmänhet?<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Vad skulle hända om du testade rent druvsocker (glukos)? Motivera ditt svar.<span class="svarslinje"></span><span class="svarslinje"></span></li>
          </ol>
        </div>
        <details class="lararnotis no-print">
          <summary>Notering till läraren</summary>
          <p>Jodlösningens färgomslag med stärkelse (blåsvart/mörklila) beror på att jodmolekyler binder inuti stärkelsens spiralformade struktur (amylos). Cellulosa (t.ex. i äppelskal) ger inte samma färgomslag, vilket kan nämnas som en kort koppling till M2 om vill man fördjupa. Kokt potatis/ris/pasta ger tydligast resultat; rått mjöl fungerar också. Jodlösning finns som apoteksvara (jodsprit/Lugols lösning, spädd) – kontrollera skolans rutiner för inköp och kassering.</p>
        </details>
      </div>
    </section>

    <section class="lab-sheet" id="lab-2" data-lab="lab-2">
      <div class="lab-top no-print">
        <span class="lab-tag">Laboration 2 · M3 · 25–35 min · nivå E–C</span>
        <button type="button" class="subject-btn print-green" data-print-lab="lab-2">🖨️ Skriv ut den här laborationen</button>
      </div>
      <div class="meta-row"><span>Namn:</span><span>Klass:</span><span>Datum:</span></div>
      <h2 class="lab-title">Laboration 2: Fettfläcktest – vilka livsmedel innehåller fett?</h2>
      <div class="lab-body">
        <h3>Syfte</h3>
        <p>Att undersöka vilka livsmedel som innehåller fett med hjälp av ett enkelt fläcktest på papper, och att jämföra med förpackningarnas innehållsförteckning.</p>
        <div class="risk-box">
          <div class="risk-title">⚠️ Risker vid laborationen</div>
          <ul>
            <li>Låg risk. Tvätta händerna innan och efter, och smaka inte på testproverna efteråt (de har legat på papper som andra rört vid).</li>
            <li>Var försiktig med vassa redskap om livsmedel behöver delas.</li>
          </ul>
        </div>
        <h3>Material</h3>
        <ul class="mat">
          <li>Vanligt skrivarpapper (inte blankt), klippt i lika stora bitar (en per livsmedel)</li>
          <li>Små provmängder av olika livsmedel: matolja (referens), chips, choklad, ost, äpple, gurka, skinka, jordnötter</li>
          <li>Penna för att märka pappersbitarna</li>
          <li>En lampa eller fönster att hålla papperet mot ljuset</li>
        </ul>
        <h3>Genomförande</h3>
        <ol class="steg" start="1">
          <li>Märk en pappersbit per livsmedel med namn. Gör även en referensfläck med en droppe matolja.</li>
          <li>Gnid eller pressa lite av varje livsmedel mot sin pappersbit i ungefär 20 sekunder. Ta bort livsmedelsresterna.</li>
          <li>Låt papperet torka i några minuter (vattenfläckar från t.ex. gurka eller äpple torkar bort, fettfläckar gör det inte).</li>
          <li>Håll varje pappersbit mot ljuset. En genomskinlig, "oljig" fläck som inte försvinner betyder att livsmedlet innehåller fett.</li>
          <li>Jämför med referensfläcken av matolja. Skriv resultatet i tabellen.</li>
        </ol>
        <h3>Resultat</h3>
        <table class="resultat-table">
          <thead><tr><th>Livsmedel</th><th>Genomskinlig fläck kvar efter torkning?</th><th>Fett? (+/−)</th></tr></thead>
          <tbody>
            <tr><td>Matolja (referens)</td><td></td><td>+</td></tr>
            <tr><td>Chips</td><td></td><td></td></tr>
            <tr><td>Choklad</td><td></td><td></td></tr>
            <tr><td>Ost</td><td></td><td></td></tr>
            <tr><td>Äpple</td><td></td><td></td></tr>
            <tr><td>Gurka</td><td></td><td></td></tr>
            <tr><td>Skinka</td><td></td><td></td></tr>
            <tr><td>Jordnötter</td><td></td><td></td></tr>
          </tbody>
        </table>
        <h3>Frågor och slutsats</h3>
        <div class="fragor">
          <ol>
            <li>Vilka livsmedel gav en tydlig, genomskinlig fettfläck?<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Hur skiljer du en vattenfläck från en fettfläck i det här testet?<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Jämför två livsmedel som båda gav fettfläck. Läs på förpackningen (eller slå upp) om det är mest mättat eller omättat fett i respektive livsmedel.<span class="svarslinje"></span><span class="svarslinje"></span></li>
            <li>Var testet oväntat för något livsmedel? Resonera kring varför.<span class="svarslinje"></span><span class="svarslinje"></span></li>
          </ol>
        </div>
        <details class="lararnotis no-print">
          <summary>Notering till läraren</summary>
          <p>Klassiskt, väl dokumenterat lågrisktest: fett gör papper mer genomskinligt eftersom det fyller ut luftfickorna mellan pappersfibrerna, medan vatten avdunstar. Jordnötter och choklad ger ofta det tydligaste resultatet, gurka/äpple fungerar bra som "negativa" kontroller. Går utmärkt att komplettera med att läsa innehållsförteckningar och jämföra fettmängd (g fett/100 g) mellan produkterna, som en koppling till energitäthet (M3).</p>
        </details>
      </div>
    </section>
  </main>

  <script src="/js/menu.js"></script>
  <script>
    (function () {
      function printLab(id) {
        var sheet = document.getElementById(id);
        if (!sheet) return;
        document.body.setAttribute('data-print', id);
        sheet.classList.add('lab-active');
        function done() {
          document.body.removeAttribute('data-print');
          sheet.classList.remove('lab-active');
          window.removeEventListener('afterprint', done);
        }
        window.addEventListener('afterprint', done);
        window.print();
      }
      document.querySelectorAll('[data-print-lab]').forEach(function (b) {
        b.addEventListener('click', function () { printLab(b.getAttribute('data-print-lab')); });
      });
      document.getElementById('print-all').addEventListener('click', function () { window.print(); });
    })();
  </script>
</body>
</html>
"""


def main():
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(HTML.replace("__AREA__", AREA))
    print("skrev", OUT, len(HTML))


if __name__ == "__main__":
    main()
