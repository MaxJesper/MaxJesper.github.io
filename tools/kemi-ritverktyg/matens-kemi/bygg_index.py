#!/usr/bin/env python3
"""Genererar kemi/matens-kemi/index.html (områdets startsida).
Mönster hämtat från kemi/syror-och-baser/index.html (kort kemikapitel, samma struktur).
Körs: python3 bygg_index.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "matens-kemi", "index.html")

CONCEPTS = [
    "Kolhydrat", "Monosackarid", "Disackarid",
    "Polysackarid", "Stärkelse", "Cellulosa", "Glykogen", "Fettsyra",
    "Mättat fett", "Omättat fett", "Protein", "Aminosyra", "Essentiell aminosyra",
]

MILESTONES = [
    ("m1", "Kolhydrater – druvsocker till stärkelse"),
    ("m2", "Fetter – uppbyggnad och energi"),
    ("m3", "Proteiner – aminosyror och funktion"),
    ("m4", "Sammanfattning – energilager, vitaminer och mineraler"),
]

HTML = """<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Matens kemi – Kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    body.area-matens-kemi {{
      --area: #c2410c;
      --area-strong: #9a3412;
      --area-soft: #fff7ed;
      --area-border: #fed7aa;
      --area-hover: #ffedd5;
    }}

    main {{ font-size: 1.2em; }}

    .area-layout {{
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }}

    @media (min-width: 960px) {{
      .area-layout {{ grid-template-columns: 300px 1fr; align-items: start; }}
    }}

    .area-main {{ min-width: 0; }}
    .area-right {{ display: flex; flex-direction: column; gap: 1rem; min-width: 0; }}

    .area-hero-image {{
      background: var(--area-soft);
      border: 1px solid var(--area-border);
      border-radius: 16px;
      padding: 1rem 1rem 1.1rem;
      margin: 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }}
    .area-hero-image figcaption {{ margin: 0; font-size: 0.95rem; color: #374151; line-height: 1.6; }}

    .concept-section {{
      background: var(--area-soft);
      border: 1px solid var(--area-border);
      border-radius: 12px;
      padding: 1rem 1rem 1.25rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }}
    .concept-section h2 {{ margin: 0 0 0.75rem 0; font-size: 1.1rem; color: var(--area-strong); }}
    .concept-list {{ list-style: none; padding: 0; margin: 0; columns: 2; column-gap: 1rem; }}
    @media (min-width: 600px) {{ .concept-list {{ columns: 3; }} }}
    @media (min-width: 900px) {{ .concept-list {{ columns: 4; }} }}
    .concept-list li {{
      font-size: 0.95rem; color: #1f2937; line-height: 1.35; padding: 0.22rem 0;
      break-inside: avoid; display: flex; align-items: baseline; gap: 0.3rem;
    }}
    .concept-list li::before {{ content: "→"; color: var(--area); font-size: 0.78rem; flex-shrink: 0; }}
    .concept-note {{ margin: 0.8rem 0 0 0; font-size: 0.82rem; color: #555; font-style: italic; }}

    .resource-grid {{ display: flex; flex-direction: column; gap: 1rem; margin-top: 0; }}
    .resource-box {{
      background: #fff; border: 1px solid #d8d8d8; border-left: 4px solid var(--area);
      border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }}
    .resource-box h2 {{ margin: 0 0 0.75rem; font-size: 1.1rem; color: var(--area-strong); }}
    .resource-box p {{ margin: 0 0 0.5rem; color: #444; font-size: 0.95rem; }}
    .resource-box ul {{ list-style: none; padding: 0; margin: 0; }}
    .resource-box li {{ margin-bottom: 0.7rem; }}
    .resource-box a {{ text-decoration: none; font-weight: 600; color: var(--area-strong); }}
    .resource-box a:hover {{ text-decoration: underline; }}

    .milestone-map {{
      margin-top: 1.5rem; background: #fff; border: 1px solid #d8d8d8; border-left: 4px solid var(--area);
      border-radius: 12px; padding: 1rem 1rem 1.25rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }}
    .milestone-map h2 {{ margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--area-strong); }}
    .milestone-map p.map-intro {{ margin: 0 0 0.9rem 0; font-size: 0.95rem; color: #555; }}
    .milestone-map-list {{ display: flex; flex-wrap: wrap; gap: 0.6rem; list-style: none; padding: 0; margin: 0; }}
    .milestone-map-list li {{ margin: 0; }}
    .milestone-map-list a {{
      display: flex; align-items: center; gap: 0.55rem; background: var(--area-soft); color: var(--area-strong);
      border: 1px solid var(--area-border); border-radius: 999px; padding: 0.4rem 0.9rem 0.4rem 0.45rem;
      text-decoration: none; font-size: 0.93rem; font-weight: 500; transition: background 0.15s ease, transform 0.15s ease;
    }}
    .milestone-map-list a:hover {{ background: var(--area-hover); transform: translateY(-1px); }}
    .m-num-chip {{
      display: inline-flex; align-items: center; justify-content: center; width: 1.7rem; height: 1.7rem;
      background: var(--area); color: #fff; border-radius: 50%; font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
    }}

    .study-tips {{ margin-top: 1.5rem; background: #f8f9fb; border: 1px solid #d8e0ea; border-radius: 12px; padding: 1rem; }}
    .study-tips summary {{ cursor: pointer; font-weight: 700; margin-bottom: 0.5rem; }}
    .study-tips ul {{ margin: 0.75rem 0 0 1.2rem; }}
    .study-tips li {{ margin-bottom: 0.45rem; }}
  </style>
</head>
<body class="area-matens-kemi">

<header class="kemi-header">
  <h1>Matens kemi</h1>
</header>

<button class="hamburger" onclick="toggleMenu()">☰</button>
<nav id="side-menu"></nav>

<main>
  <p style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
    <a href="/kemi/index.html" class="subject-btn">← Tillbaka till Kemi</a>
  </p>
  <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp"></div>

  <section class="area-layout">
    <div class="area-main">
      <section class="resource-grid">
        <article class="resource-box">
          <h2>Material för elever</h2>
          <ul>
            <li><a href="./studieguide.html"><strong>Studieguide</strong></a></li>
            <li><a href="./checklista.html">Checklista</a></li>
            <li><a href="./instuderingsfragor.html">Instuderingsfrågor</a></li>
            <li><a href="./ovningsprov.html">Övningsprov</a></li>
            <li><a href="./laborationer.html">Laborationer</a></li>
            <li><a href="./larande-spel.html">Lärande spel</a></li>
            <li><a href="./ovningsverktyg.html">Sortera molekylerna (övningsverktyg)</a></li>
          </ul>
        </article>
        <article class="resource-box">
          <h2>Material för läraren</h2>
          <ul>
            <li><a href="./facit.html">Facit till övningsprovet</a></li>
            <li><a href="./begreppslista.html">Begreppslista</a></li>
          </ul>
        </article>
      </section>
    </div>

    <div class="area-right">
      <figure class="area-hero-image">
        <figcaption>
          All mat är uppbyggd av kemiska ämnen. De tre stora <strong>makromolekylerna</strong> – kolhydrater, fetter och proteiner – byggs av små byggstenar (druvsocker, glycerol och fettsyror, aminosyror) som kopplas ihop till långa kedjor.
        </figcaption>
      </figure>

      <section class="concept-section" aria-label="Viktiga begrepp">
        <h2>Viktiga begrepp att lära sig</h2>
        <ul class="concept-list">
{concept_items}
        </ul>
      </section>
    </div>
  </section>

  <section class="milestone-map" aria-label="Snabbnavigation till studieguidens milstolpar">
    <h2>Studieguidens milstolpar</h2>
    <p class="map-intro">Hoppa direkt till en milstolpe i studieguiden:</p>
    <ul class="milestone-map-list">
{milestone_items}
    </ul>
  </section>

  <section class="study-tips">
    <details>
      <summary>Inläsningstips</summary>
      <ul>
        <li>Kunna skilja mono-, di- och polysackarider åt, och veta att både stärkelse och cellulosa är uppbyggda av <strong>glukos</strong> (inte fruktos).</li>
        <li>Kunna rita/beskriva ett fetts uppbyggnad: glycerol + tre fettsyror. Fettets alkohol är alltid glycerol, aldrig butanol.</li>
        <li>Veta att mättat/omättat fett avgörs av antalet dubbelbindningar i fettsyrans kolkedja.</li>
        <li>Kunna beskriva en aminosyras grundstruktur och vad som gör en aminosyra essentiell.</li>
        <li>Koppla ihop innehållet: enzymer är proteiner, stärkelse är växters energilager och glykogen är djurs/människans.</li>
      </ul>
    </details>
  </section>
</main>

<script src="/js/menu.js"></script>
  <script>
  window.BEGREPP = {begrepp_js};
  </script>
  <script src="/js/concepts-popup.js"></script>
  <script src="/js/language-selector.js"></script>
  <script src="/js/concept-lang-selector.js"></script>
  <script>
    /* ENDA KÄLLA: hämta begreppen från data/begrepp.json. Inbäddad window.BEGREPP är reserv. */
    fetch("./data/begrepp.json", {{ cache: "no-store" }})
      .then(function (r) {{ return r.ok ? r.json() : null; }})
      .then(function (data) {{
        if (data && data.length) {{
          window.BEGREPP = data;
          if (window.BEGREPPPopup) window.BEGREPPPopup.update(data);
          window.dispatchEvent(new CustomEvent("begreppLangUpdate", {{ detail: {{ data: data, lang: "sv-SE" }} }}));
        }}
      }})
      .catch(function (e) {{ console.warn("Kunde inte hämta begrepp.json – använder inbäddad reserv.", e); }});
  </script>

</body>
</html>
"""


def main():
    import sys, json
    sys.path.insert(0, HERE)
    import data_begrepp as D

    concept_items = "\n".join(
        f'            <li><button class="concept-btn" data-concept="{c}">{c}</button></li>' for c in CONCEPTS
    )
    milestone_items = "\n".join(
        f'      <li><a href="./studieguide.html#{anchor}"><span class="m-num-chip">{i}</span>{title}</a></li>'
        for i, (anchor, title) in enumerate(MILESTONES, 1)
    )
    begrepp_js = json.dumps(
        [{"namn": k, "definition": v["def"], "anchor": f"./studieguide.html#{v['m']}"} for k, v in D.BEGREPP.items()],
        ensure_ascii=False, indent=2,
    )
    out = HTML.format(concept_items=concept_items, milestone_items=milestone_items, begrepp_js=begrepp_js)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)
    print("skrev", OUT, len(out))


if __name__ == "__main__":
    main()
