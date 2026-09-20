# -*- coding: utf-8 -*-
"""Genererar kemi/separationsprocesser/index.html (område-startsidan), mall: kemi/atomer/index.html."""
import json, os, re, sys, html
sys.path.insert(0, os.path.dirname(__file__))
from labdata import LABS
ROOT = os.environ.get("SITE", os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")))
DST = f"{ROOT}/kemi/separationsprocesser"
esc = html.escape

begr = json.load(open(f"{DST}/data/begrepp.json", encoding="utf-8"))
tpl = open(f"{ROOT}/kemi/atomer/index.html", encoding="utf-8").read()
css = re.search(r"<style>(.*?)</style>", tpl, re.S).group(1)
css = css.replace("body.area-atomer", "body.area-separation").replace("--area: #be185d;", "--area: #0e7490;") \
    .replace("--area-strong: #9d174d;", "--area-strong: #155e75;").replace("--area-soft: #fdf2f8;", "--area-soft: #ecfeff;") \
    .replace("--area-border: #fbcfe8;", "--area-border: #a5f3fc;").replace("--area-hover: #fce7f3;", "--area-hover: #cffafe;")
css = css.replace(".overview-card--pad { width: calc((100% - 1.4rem) / 3); min-width: 150px; }",
                  ".overview-card--pad { width: calc((100% - 1.4rem) / 3); min-width: 150px; }\n    .overview-stage img { max-width: 140px; max-height: 84px; }")
css += "\n    .study-tips a { text-decoration: underline; }\n"
assert "area-separation" in css

METODER = [
 ("icon-filtrering.svg", "Filtrering", "olösta korn", "Ikon: kolv, trattar och filter"),
 ("icon-centrifug.svg", "Centrifugering", "tyngd (densitet)", "Ikon: centrifug"),
 ("icon-magnet.svg", "Magnet", "magnetism", "Ikon: magnet"),
 ("icon-destillation.svg", "Destillation", "kokpunkt", "Ikon: destillation"),
 ("icon-indunstning.svg", "Indunstning", "avdunstning", "Ikon: indunstning"),
 ("icon-kromatografi.svg", "Kromatografi", "hur fort ämnena vandrar", "Ikon: kromatografi"),
]
cards = ""
for f, namn, egen, alt in METODER:
    cards += f'''
            <div class="overview-card overview-card--pad">
              <div class="overview-kat">Separationsmetod</div>
              <div class="overview-stage"><img src="/images/kemi/separationsprocesser/{f}" width="140" height="84" alt="{esc(alt)}" loading="lazy" /></div>
              <div class="overview-namn">{esc(namn)}</div>
              <div class="overview-formler">utnyttjar: {esc(egen)}</div>
            </div>'''

btns = "\n".join(f'            <li><button class="concept-btn" data-concept="{esc(b["namn"])}">{esc(b["namn"])}</button></li>' for b in begr)

MILSTOLPAR = ["Materiens tre former", "Fasövergångar – när ämnen byter form", "Rena ämnen och blandningar", "Lösningar och löslighet",
              "Att dela upp blandningar med olösta delar", "Att få loss lösta ämnen", "Fällning och analys", "Separation i samhället", "Undersök systematiskt"]
chips = "\n".join(f'            <li><a href="./studieguide.html#m{i}"><span class="m-num-chip">{i}</span>{esc(t)}</a></li>' for i, t in enumerate(MILSTOLPAR, 1))

labs = "\n".join(f'              <li><a href="./laborationer.html#{l["id"]}">{esc(l["title"])}</a></li>' for l in LABS)

body = f'''<body class="area-separation">

  <header class="kemi-header">
    <h1>Separationsprocesser</h1>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
      <a href="/kemi/index.html" class="subject-btn">← Tillbaka till Kemi</a>
      <a href="/kemi/syror-och-baser/index.html" class="subject-btn">Nästa område →</a>
    </div>

    <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>

    <section class="area-layout">
      <div class="area-main">
        <section class="resource-grid">
          <article class="resource-box">
            <h2>Material för elever</h2>
            <ul>
              <li><a href="./studieguide.html"><strong>Studieguide</strong></a> – nio milstolpar med bilder och partikelmodeller</li>
              <li><a href="./checklista.html"><strong>Checklista</strong></a></li>
              <li><a href="./instuderingsfragor.html"><strong>Instuderingsfrågor</strong></a></li>
              <li><a href="./ovningsprov.html"><strong>Övningsprov</strong></a></li>
              <li><a href="./partiklar.html"><strong>Partikelsimulatorn</strong></a> – värm och kyl vatten, etanol och järn och se partiklarna röra sig</li>
              <li><a href="./valj-metod.html"><strong>Välj rätt metod</strong></a> – vilken separationsmetod passar blandningen?</li>
              <li><a href="./ovningsverktyg.html"><strong>Övningar</strong></a> – dra och släpp och sortera</li>
              <li><a href="./laborationer.html"><strong>Laborationer</strong></a> – sju laborationsinstruktioner att skriva ut</li>
              <li><a href="./larande-spel.html"><strong>Lärande spel</strong></a> – begreppskort, bingo och korsord</li>
            </ul>
          </article>
          <article class="resource-box">
            <h2>Material för läraren</h2>
            <ul>
              <li><a href="./begreppslista.html"><strong>Begreppslista</strong></a></li>
              <li><a href="./facit.html"><strong>Facit till övningsprovet</strong></a></li>
              <li><a href="./instuderingsfragor-print-larare.html"><strong>Instuderingsfrågor med svar</strong></a> – utskrift för läraren</li>
              <li><a href="./laborationer.html"><strong>Laborationer med lärarnotiser</strong></a> – risker, material och tips för de sju laborationerna</li>
            </ul>
          </article>
        </section>

        <section class="study-tips">
          <details>
            <summary>Inläsningstips</summary>
            <ul>
              <li>Lär dig först de tre formerna – fast, flytande och gas – och vad partiklarna gör i var och en.</li>
              <li>Skilj på <strong>rent ämne</strong> och <strong>blandning</strong>. Ett rent ämne har en bestämd smältpunkt och kokpunkt.</li>
              <li>Skilj på <strong>lösning</strong> (ser likadan ut överallt), <strong>slamning</strong> (korn i vätska) och <strong>emulsion</strong> (droppar i vätska).</li>
              <li>Varje separationsmetod utnyttjar <strong>en egenskap</strong> som ämnena skiljer sig åt i, till exempel storlek, tyngd eller kokpunkt. Fråga dig alltid: vad är olika här?</li>
              <li>Träna på att välja metod för en blandning i <a href="./valj-metod.html">Välj rätt metod</a> och motivera med rätt egenskap.</li>
              <li>Vid en undersökning: ändra <strong>en</strong> sak i taget och håll allt annat lika.</li>
            </ul>
          </details>
        </section>
      </div>

      <div class="area-right">
        <figure class="area-hero-image">
          <p class="overview-intro">Metoderna du kommer att studera i det här området!</p>
          <div class="overview-grid">{cards}
          </div>
        </figure>

        <section class="concept-section" aria-label="Viktiga begrepp">
          <h2>Viktiga begrepp att lära sig</h2>
          <ul class="concept-list">
{btns}
          </ul>
          <p class="concept-note">Grundämnen, kemiska föreningar och blandningar förklaras även i <a href="/kemi/atomer/index.html">Atomer och molekyler</a>. Salter som fälls ut i vatten hör ihop med <a href="/kemi/jonforeningar/index.html">Jonföreningar</a>, och pH-värde och indikatorer med <a href="/kemi/syror-och-baser/index.html">Syror och baser</a>. Destillation av råolja tas upp i <a href="/kemi/kol-och-kolforeningar/index.html">Kol och kolföreningar</a>.</p>
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
  <title>Separationsprocesser – Kemi</title>
  <link rel="stylesheet" href="/css/style.css" />

  <style>{css}</style>
</head>
'''
open(f"{DST}/index.html", "w", encoding="utf-8").write(head + body)
print("index.html", len(head + body))
