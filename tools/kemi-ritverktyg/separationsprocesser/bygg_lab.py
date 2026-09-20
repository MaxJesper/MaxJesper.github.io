#!/usr/bin/env python3
"""Genererar kemi/separationsprocesser/laborationer.html från labdata.py (utskrivbara protokoll som HTML-sida)."""
import os, sys, html
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
from labdata import LABS

def li(items): return "".join("<li>%s</li>" % i for i in items)

def lab_html(n, L):
    steps = ""
    cnt = 1
    for title, lst in L["steg"]:
        if title: steps += '<p class="steg-del">%s</p>' % title
        steps += '<ol class="steg" start="%d">%s</ol>' % (cnt, li(lst)); cnt += len(lst)
    cols = "".join("<th>%s</th>" % c for c in L["resultat"]["cols"])
    ncol = len(L["resultat"]["cols"])
    if L["id"] == "lab-7":  # två kolumngrupper av tid/temp
        rows = "".join("<tr>%s</tr>" % ("<td>%s</td><td></td><td></td><td>%d</td><td></td><td></td>" % (r, int(r) + 180)) for r in L["resultat"]["rows"])
    else:
        rows = "".join("<tr><td>%s</td>%s</tr>" % (r, "<td></td>" * (ncol - 1)) for r in L["resultat"]["rows"])
    frag = "".join('<li>%s<span class="svarslinje"></span><span class="svarslinje"></span></li>' % f for f in L["fragor"])
    plan = ""
    if L.get("planering"):
        plan = '''<h3>Din plan</h3>
      <div class="plan-box"><strong>Frågeställning:</strong><span class="svarslinje"></span></div>
      <div class="plan-box"><strong>Hypotes (och varför du tror det):</strong><span class="svarslinje"></span><span class="svarslinje"></span></div>
      <table class="resultat-table"><thead><tr><th>Jag ändrar (oberoende)</th><th>Jag mäter (beroende)</th><th>Jag håller lika (konstant)</th></tr></thead>
      <tbody><tr><td class="hoog"></td><td class="hoog"></td><td class="hoog"></td></tr></tbody></table>
      <div class="plan-box"><strong>Så mäter jag:</strong><span class="svarslinje"></span></div>'''
    if L["id"] == "lab-2":
        plan = '''<h3>Din plan</h3>
      <div class="plan-box"><strong>Vilken egenskap skiljer varje ämne? I vilken ordning ska metoderna användas, och varför?</strong><span class="svarslinje"></span><span class="svarslinje"></span><span class="svarslinje"></span></div>'''
    graph = ""
    if L["id"] in ("lab-7", "lab-6"):
        graph = '<h3>Graf</h3><div class="grafruta" role="img" aria-label="Utrymme för graf"></div>'
    if L["id"] == "lab-3":
        graph = '<h3>Så här såg mina kromatogram ut</h3><div class="grafruta" role="img" aria-label="Utrymme för att rita"></div>'
    return f'''
  <section class="lab-sheet" id="{L["id"]}" data-lab="{L["id"]}">
    <div class="lab-top no-print">
      <span class="lab-tag">Laboration {n} · {L["milstolpe"]} · {L["tid"]} · nivå {L["niva"]}</span>
      <button type="button" class="subject-btn print-green" data-print-lab="{L["id"]}">🖨️ Skriv ut den här laborationen</button>
    </div>
    <div class="meta-row"><span>Namn:</span><span>Klass:</span><span>Datum:</span></div>
    <h2 class="lab-title">Laboration {n}: {L["title"]}</h2>
    <div class="lab-body">
      <h3>Syfte</h3><p>{L["syfte"]}</p>
      <div class="risk-box"><div class="risk-title">⚠️ Risker vid laborationen</div><ul>{li(L["risker"])}</ul></div>
      <h3>Material</h3><ul class="mat">{li(L["material"])}</ul>
      {plan}
      <h3>Genomförande</h3>{steps}
      <h3>Resultat</h3>
      <table class="resultat-table"><thead><tr>{cols}</tr></thead><tbody>{rows}</tbody></table>
      {graph}
      <h3>Frågor och slutsats</h3>
      <div class="fragor"><ol>{frag}</ol></div>
      <details class="lararnotis no-print"><summary>Notering till läraren</summary><p>{L["lararnotis"]}</p></details>
    </div>
  </section>'''

CSS = '''
    body.area-separation { --area:#0e7490; --area-strong:#155e75; --area-soft:#ecfeff; --area-border:#a5f3fc; --area-hover:#cffafe; }
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
    .steg-del { font-weight: 700; margin: 0.6rem 0 0.2rem; color: var(--area-strong); }
    .risk-box { background: #fef2f2; border: 3px solid #b91c1c; border-radius: 8px; padding: 0.7rem 1rem; margin: 0.6rem 0 0.4rem; }
    .risk-title { font-weight: 800; color: #991b1b; margin-bottom: 0.3rem; }
    .risk-box ul { margin: 0 0 0 1.2rem; padding: 0; }
    .risk-box li { margin-bottom: 0.25rem; color: #222; }
    .resultat-table { width: 100%; border-collapse: collapse; margin: 0.4rem 0 0.8rem; font-size: 0.93rem; }
    .resultat-table th { background: var(--area-strong); color: #fff; padding: 0.4rem 0.55rem; text-align: left; font-weight: 600; }
    .resultat-table td { padding: 0.4rem 0.55rem; border: 1px solid #b5b5b5; height: 2.2rem; vertical-align: top; }
    .resultat-table td.hoog { height: 5.5rem; }
    @media (max-width: 640px) { .resultat-table { display: block; overflow-x: auto; } }
    .fragor ol { margin: 0.2rem 0 0 1.4rem; padding: 0; }
    .fragor li { margin-bottom: 0.9rem; }
    .svarslinje { display: block; width: 100%; height: 1.7rem; border-bottom: 1px solid #999; }
    .plan-box { margin: 0.5rem 0; }
    .grafruta { height: 75mm; border: 1.5px dashed #6b7280; border-radius: 4px; background-image: linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px); background-size: 5mm 5mm; }
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
      .resultat-table, .risk-box, .fragor li, .plan-box { break-inside: avoid; }
      body[data-print] .lab-sheet:not(.lab-active) { display: none !important; }
    }
'''

def build():
    sheets = "".join(lab_html(i + 1, L) for i, L in enumerate(LABS))
    toc = "".join('<li><a href="#%s">Laboration %d: %s</a> <span style="color:#475569">(%s, %s)</span></li>' % (L["id"], i + 1, L["title"], L["milstolpe"], L["tid"]) for i, L in enumerate(LABS))
    out = f'''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laborationer – Separationsprocesser</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>{CSS}  </style>
</head>
<body class="area-separation">
  <header class="kemi-header">
    <h1>Laborationer</h1>
    <p>Separationsprocesser</p>
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
      <p><strong>Utskrivbara laborationsprotokoll.</strong> Varje laboration har syfte, risker, material, genomförande, resultattabell och frågor, och skrivs ut på två A4-sidor. Använd knappen i varje protokoll för att skriva ut just den laborationen. Läs riskerna innan ni börjar och använd skyddsglasögon.</p>
      <ul>{toc}</ul>
    </section>
{sheets}
  </main>

  <script src="/js/menu.js"></script>
  <script>
    (function () {{
      function printLab(id) {{
        var sheet = document.getElementById(id);
        if (!sheet) return;
        document.body.setAttribute('data-print', id);
        sheet.classList.add('lab-active');
        function done() {{
          document.body.removeAttribute('data-print');
          sheet.classList.remove('lab-active');
          window.removeEventListener('afterprint', done);
        }}
        window.addEventListener('afterprint', done);
        window.print();
      }}
      document.querySelectorAll('[data-print-lab]').forEach(function (b) {{
        b.addEventListener('click', function () {{ printLab(b.getAttribute('data-print-lab')); }});
      }});
      document.getElementById('print-all').addEventListener('click', function () {{ window.print(); }});
    }})();
  </script>
</body>
</html>
'''
    open(os.path.join(ROOT, "kemi", "separationsprocesser", "laborationer.html"), "w", encoding="utf-8").write(out)
    print("laborationer.html", len(out))

build()
