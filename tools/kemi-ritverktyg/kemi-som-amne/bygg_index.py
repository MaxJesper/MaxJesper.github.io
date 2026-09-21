# -*- coding: utf-8 -*-
"""Genererar kemi/kemi-som-amne/index.html (område-startsidan), mall: kemi/atomer/index.html."""
import json, os, re, sys, html
sys.path.insert(0, os.path.dirname(__file__))
from labdata import LABS
ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/kemi-som-amne"
esc = html.escape

begr = json.load(open(f"{DST}/data/begrepp.json", encoding="utf-8"))
tpl = open(f"{ROOT}/kemi/atomer/index.html", encoding="utf-8").read()
css = re.search(r"<style>(.*?)</style>", tpl, re.S).group(1)
css = css.replace("body.area-atomer", "body.area-amne").replace("--area: #be185d;", "--area: #4338ca;") \
    .replace("--area-strong: #9d174d;", "--area-strong: #3730a3;").replace("--area-soft: #fdf2f8;", "--area-soft: #eef2ff;") \
    .replace("--area-border: #fbcfe8;", "--area-border: #c7d2fe;").replace("--area-hover: #fce7f3;", "--area-hover: #e0e7ff;")
css = css.replace(".overview-card--pad { width: calc((100% - 1.4rem) / 3); min-width: 150px; }",
                  ".overview-card--pad { width: calc((100% - 1.4rem) / 3); min-width: 150px; }\n    .overview-stage img { max-width: 140px; max-height: 84px; }")
css += "\n    .study-tips a { text-decoration: underline; }\n"
assert "area-amne" in css

PIKTO = json.load(open(f"{ROOT}/kemi/data/faropiktogram.json", encoding="utf-8"))["piktogram"]
cards = ""
for p in PIKTO:
    cards += f'''
            <div class="overview-card overview-card--pad">
              <div class="overview-kat">{esc(p["kod"])}</div>
              <div class="overview-stage"><img src="/images/kemi/faropiktogram/{p["bild"]}" width="84" height="84" alt="{esc(p["alt"])}" loading="lazy" /></div>
              <div class="overview-namn">{esc(p["namn"])}</div>
              <div class="overview-formler">{esc(p["betyder"])}</div>
            </div>'''

btns = "\n".join(f'            <li><button class="concept-btn" data-concept="{esc(b["namn"])}">{esc(b["namn"])}</button></li>' for b in begr)

MILSTOLPAR = ["Vad är kemi – och varför ska du läsa det?", "Så lär du dig kemi", "Att arbeta naturvetenskapligt", "Säkerhet i kemisalen",
              "Faropiktogram och etiketter", "Laboratorieutrustning och att mäta", "Laborationsrapporten", "Ämnens egenskaper",
              "Kemins historia", "Nobelpris och forskning idag"]
chips = "\n".join(f'            <li><a href="./studieguide.html#m{i}"><span class="m-num-chip">{i}</span>{esc(t)}</a></li>' for i, t in enumerate(MILSTOLPAR, 1))

labs = "\n".join(f'              <li><a href="./laborationer.html#{l["id"]}">{esc(l["title"])}</a></li>' for l in LABS)

body = f'''<body class="area-amne">

  <header class="kemi-header">
    <h1>Ämnet kemi</h1>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
      <a href="/index.html" class="subject-btn">← Tillbaka till startsidan</a>
      <a href="/kemi/atomer/index.html" class="subject-btn">Nästa område →</a>
    </div>

    <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>

    <section class="area-layout">
      <div class="area-main">
        <section class="resource-grid">
          <article class="resource-box">
            <h2>Material för elever</h2>
            <ul>
              <li><a href="./studieguide.html"><strong>Studieguide</strong></a> – tio milstolpar: säkerhet, arbetssätt, rapport, egenskaper och historia</li>
              <li><a href="./checklista.html"><strong>Checklista</strong></a></li>
              <li><a href="./instuderingsfragor.html"><strong>Instuderingsfrågor</strong></a></li>
              <li><a href="./ovningsprov.html"><strong>Övningsprov</strong></a></li>
              <li><a href="/kemi/faropiktogram.html"><strong>Faropiktogram</strong></a> – lär dig känna igen de nio symbolerna</li>
              <li><a href="./ovningsverktyg.html"><strong>Övningar</strong></a> – dra och släpp och sortera</li>
              <li><a href="./laborationer.html"><strong>Laborationer</strong></a> – {len(LABS)} laborationsinstruktioner att skriva ut</li>
              <li><a href="./sakerhetsintyg.html"><strong>Säkerhetsintyg</strong></a> – skrivs ut och undertecknas</li>
              <li><a href="./rapportmall.html"><strong>Mall för laborationsrapport</strong></a> – skrivs ut</li>
              <li><a href="./labbutrustning-spel.html"><strong>Labbutrustning</strong></a> – känn igen föremålen på foto</li>
              <li><a href="./larande-spel.html"><strong>Lärande spel</strong></a> – begreppskort, bingo och korsord</li>
            </ul>
          </article>
          <article class="resource-box">
            <h2>Material för läraren</h2>
            <ul>
              <li><a href="./begreppslista.html"><strong>Begreppslista</strong></a></li>
              <li><a href="./facit.html"><strong>Facit till övningsprovet</strong></a></li>
              <li><a href="./instuderingsfragor-print-larare.html"><strong>Instuderingsfrågor med svar</strong></a> – utskrift för läraren</li>
              <li><a href="./laborationer.html"><strong>Laborationer med lärarnotiser</strong></a> – risker, material och tips för de {len(LABS)} laborationerna</li>
            </ul>
          </article>
        </section>

        <section class="study-tips">
          <details>
            <summary>Inläsningstips</summary>
            <ul>
              <li>Börja med <strong>säkerheten</strong> och faropiktogrammen. De är det viktigaste innan du går in i kemisalen.</li>
              <li>Skilj på <strong>ämne</strong> (vad något är gjort av) och <strong>föremål</strong> (själva saken).</li>
              <li>Kom ihåg de tre nivåerna: du <strong>ser</strong> (makro), du <strong>föreställer dig</strong> partiklar och du <strong>skriver</strong> symboler.</li>
              <li>Vid en undersökning: ändra <strong>en</strong> sak i taget, håll allt annat lika och upprepa försöket.</li>
              <li>Skilj på <strong>observation</strong> (det du ser) och <strong>tolkning</strong> (det du tror).</li>
              <li>Densitet är massa delat med volym: skriv <strong>formeln först</strong>, sätt in värden med enheter och skriv svaret med enhet.</li>
              <li>Testa dig själv i stället för att läsa om: begreppskort, instuderingsfrågor och övningsprov.</li>
            </ul>
          </details>
        </section>
      </div>

      <div class="area-right">
        <figure class="area-hero-image">
          <p class="overview-intro">De nio faropiktogrammen som du lär dig känna igen!</p>
          <div class="overview-grid">{cards}
          </div>
        </figure>

        <section class="concept-section" aria-label="Viktiga begrepp">
          <h2>Viktiga begrepp att lära sig</h2>
          <ul class="concept-list">
{btns}
          </ul>
          <p class="concept-note">Här lägger vi grunden för alla kemiområden. Ämnens uppbyggnad från partiklar tas upp i <a href="/kemi/atomer/index.html">Atomer och molekyler</a>, och hur man delar upp blandningar och undersöker systematiskt i <a href="/kemi/separationsprocesser/index.html">Separationsprocesser</a>.</p>
        </section>

        <section class="milestone-map" aria-label="Snabbnavigation till studieguidens milstolpar">
          <h2>Studieguidens milstolpar</h2>
          <p class="map-intro">Hoppa direkt till en milstolpe i studieguiden:</p>
          <ul class="milestone-map-list">
{chips}
          </ul>
        </section>
      </div>
    </section>
  </main>

  <script src="/js/menu.js"></script>
  <script>
  window.BEGREPP = {json.dumps(begr, ensure_ascii=False)};
  </script>
  <script src="/js/concepts-popup.js"></script>
  <script src="/js/language-selector.js"></script>
  <script src="/js/concept-lang-selector.js"></script>
  <script>
    fetch("./data/begrepp.json", {{ cache: "no-store" }})
      .then(function (r) {{ return r.ok ? r.json() : null; }})
      .then(function (data) {{
        if (data && data.length) {{
          window.BEGREPP = data;
          var saved = "sv-SE";
          try {{ saved = localStorage.getItem("site.concept-lang") || "sv-SE"; }} catch (e) {{}}
          /* Skriv inte över ett redan valt annat begreppsspråk (undviker kapplöpning mot concept-lang-selector.js). */
          if (saved === "sv-SE") {{
            if (window.BEGREPPPopup) window.BEGREPPPopup.update(data);
            window.dispatchEvent(new CustomEvent("begreppLangUpdate", {{ detail: {{ data: data, lang: "sv-SE" }} }}));
          }}
        }}
      }})
      .catch(function (e) {{ console.warn("Kunde inte hämta begrepp.json – använder inbäddad reservlista.", e); }});
  </script>
</body>
</html>
'''
head = f'''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ämnet kemi – Kemi</title>
  <link rel="stylesheet" href="/css/style.css" />

  <style>{css}</style>
</head>
'''
open(f"{DST}/index.html", "w", encoding="utf-8").write(head + body)
print("index.html", len(head + body))
