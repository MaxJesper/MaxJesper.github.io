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
css += r'''
    /* ---------- Kemikartan ---------- */
    .sr-only { position:absolute; width:1px; height:1px; margin:-1px; padding:0; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
    .kemikarta { container-type:inline-size; margin:0; min-width:0; }
    .karta { container-type:inline-size; position:relative; width:100%; max-width:780px; margin:0 auto; aspect-ratio:780/600; background:var(--area-soft); border:1px solid var(--area-border); border-radius:18px; }
    .karta-mitt { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:24%; aspect-ratio:1; border-radius:50%; background:var(--area-strong); color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:1rem; box-shadow:0 6px 20px rgba(55,48,163,.35); }
    .karta-mitt strong { font-size:clamp(1.1rem,2.6vw,1.9rem); line-height:1.1; }
    .karta-mitt span { font-size:clamp(.72rem,1.2vw,.92rem); margin-top:.4rem; }
    .karta ol { list-style:none; margin:0; padding:0; }
    .karta .st { position:absolute; width:max(112px, 15cqw); transform:translate(-50%,-50%); text-align:center; margin:0; }
    .karta .st a { display:block; text-decoration:none; color:#1a1a2e; border-radius:12px; }
    .karta .st a:focus-visible { outline:3px solid #1d4ed8; outline-offset:4px; }
    .karta .disc { position:relative; display:flex; align-items:center; justify-content:center; width:clamp(76px, 11cqw, 100px); height:clamp(76px, 11cqw, 100px); margin:0 auto; border-radius:50%; background:#fff; border:4px solid var(--area); }
    .karta .g2 .disc { border-style:double; border-width:7px; }
    .karta .g3 .disc { border-style:dashed; }
    .karta .g4 .disc { border-style:dotted; }
    .karta .in { display:flex; align-items:center; justify-content:center; width:100%; height:100%; border-radius:50%; overflow:hidden; }
    .karta .in img { max-width:78%; max-height:78%; mix-blend-mode:multiply; }
    .karta .in svg.ic { width:64%; height:64%; stroke:var(--area-strong); fill:none; stroke-width:3.2; stroke-linecap:round; stroke-linejoin:round; }
    .karta .pikto4 { display:grid; grid-template-columns:1fr 1fr; gap:1px; width:78%; }
    .karta .pikto4 img { width:100%; max-width:none; max-height:none; mix-blend-mode:normal; }
    .karta .num { position:absolute; left:-8px; top:-8px; width:clamp(26px, 3.1cqw, 32px); height:clamp(26px, 3.1cqw, 32px); border-radius:50%; background:var(--area-strong); color:#fff; font-weight:800; font-size:1rem; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
    .karta .ttl { display:block; margin-top:.35rem; font-weight:700; font-size:clamp(.88rem, 1.8cqw, .98rem); line-height:1.2; color:var(--area-strong); }
    .karta .hook { display:none; font-size:.9rem; color:#333a4a; }
    .karta .st a:hover .ttl { text-decoration:underline; }
    .karta .st a:hover .disc { background:var(--area-hover); }
    .karta .grp { display:none; }
    .karta-legend { font-size:.9rem; color:#333a4a; margin:.6rem 0 0; text-align:center; }
    /* Kartan ligger först i DOM (samma ordning som på smal skärm); på bred skärm hamnar materialkolumnen till vänster och kartan till höger, uppe i höjd med kolumnen */
    @media (min-width: 960px) {
      .area-layout { grid-template-areas: "main map" "main begr"; grid-template-rows: auto 1fr; }
      .area-layout > .kemikarta { grid-area: map; }
      .area-layout > .area-main { grid-area: main; }
      .area-layout > .area-right { grid-area: begr; }
    }
    /* Lodrät stig när kartans kolumn är smal (container query på .kemikarta) och vid utskrift */
    @container (max-width: 759px) {
      .karta { aspect-ratio:auto; background:transparent; border:0; border-radius:0; }
      .karta-mitt { position:static; transform:none; width:auto; aspect-ratio:auto; border-radius:16px; margin:0 0 1rem; padding:.8rem; }
      .karta .st { position:relative; left:auto !important; width:auto !important; top:auto !important; transform:none; width:auto; text-align:left; margin:0 0 .5rem; break-inside:avoid; }
      .karta .st a { display:flex; gap:.8rem; align-items:center; background:#fff; border:1px solid var(--area-border); border-radius:14px; padding:.5rem .7rem .5rem .5rem; position:relative; }
      .karta .disc { width:72px; height:72px; margin:0; flex:0 0 72px; border-width:4px; }
      .karta .g2 .disc { border-width:6px; }
      .karta .num { width:28px; height:28px; font-size:.9rem; }
      .karta .ttl { font-size:1.05rem; }
      .karta .ttl { margin:0; font-size:1.05rem; }
      .karta .hook { display:block; }
      .karta .grp { display:block; width:fit-content; position:relative; background:#fff; padding:.1rem .5rem .1rem 0; margin:1rem 0 .3rem; font-size:.8rem; letter-spacing:.06em; text-transform:uppercase; font-weight:800; color:var(--area-strong); break-after:avoid; }
    }
    @media print {
      .karta { aspect-ratio:auto; background:transparent; border:0; border-radius:0; }
      .karta-mitt { position:static; transform:none; width:auto; aspect-ratio:auto; border-radius:16px; margin:0 0 1rem; padding:.8rem; }
      .karta .st { position:relative; left:auto !important; width:auto !important; top:auto !important; transform:none; width:auto; text-align:left; margin:0 0 .5rem; break-inside:avoid; }
      .karta .st a { display:flex; gap:.8rem; align-items:center; background:#fff; border:1px solid var(--area-border); border-radius:14px; padding:.5rem .7rem .5rem .5rem; position:relative; }
      .karta .disc { width:72px; height:72px; margin:0; flex:0 0 72px; border-width:4px; }
      .karta .g2 .disc { border-width:6px; }
      .karta .num { width:28px; height:28px; font-size:.9rem; }
      .karta .ttl { font-size:1.05rem; }
      .karta .ttl { margin:0; font-size:1.05rem; }
      .karta .hook { display:block; }
      .karta .grp { display:block; width:fit-content; position:relative; background:#fff; padding:.1rem .5rem .1rem 0; margin:1rem 0 .3rem; font-size:.8rem; letter-spacing:.06em; text-transform:uppercase; font-weight:800; color:var(--area-strong); break-after:avoid; }
    }
    @media print { .kemikarta { display:block; }
    .karta-mitt { background:#fff; color:#000; border:2px solid #000; box-shadow:none; } }
'''
assert "area-amne" in css

PIKTO = {p["kod"]: p for p in json.load(open(f"{ROOT}/kemi/data/faropiktogram.json", encoding="utf-8"))["piktogram"]}

# ---------- Kemikartan: tio stationer på en ellips, samma ordning som studieguiden ----------
LABB = "/images/kemi/kemi-som-amne/labb/"
def foto(namn):
    return f'<img src="{LABB}{namn}-1-t.jpg" alt="" loading="lazy" />'
def ikon(paths):
    return f'<svg class="ic" viewBox="0 0 64 64" aria-hidden="true" focusable="false">{paths}</svg>'
IK = {
    "bok": ikon('<path d="M32 16c-6-4-14-5-22-4v36c8-1 16 0 22 4 6-4 14-5 22-4V12c-8-1-16 0-22 4z"/><path d="M32 16v36"/>'),
    "lupp": ikon('<circle cx="27" cy="27" r="14"/><path d="M38 38l16 16"/><path d="M21 27h12M27 21v12"/>'),
    "glasogon": ikon('<rect x="5" y="22" width="22" height="18" rx="8"/><rect x="37" y="22" width="22" height="18" rx="8"/><path d="M27 30h10M5 30H1M59 30h4"/>'),
    "rapport": ikon('<path d="M16 8h26l8 8v40H16z"/><path d="M42 8v8h8"/><path d="M23 28h20M23 36h20M23 44h13"/>'),
    "timglas": ikon('<path d="M18 8h28M18 56h28"/><path d="M20 8c0 14 12 16 12 24S20 42 20 56M44 8c0 14-12 16-12 24s12 10 12 24"/>'),
    "medalj": ikon('<circle cx="32" cy="38" r="15"/><path d="M22 8l10 18 10-18"/><path d="M32 30v16M26 38h12"/>'),
}
# Piktogrammen används oförändrade (officiella SVG:er), utan text – bara vid station 5 där de betyder något.
pikto4 = "".join(f'<img src="/images/kemi/faropiktogram/{PIKTO[k]["bild"]}" alt="" loading="lazy" />' for k in ("GHS02", "GHS05", "GHS06", "GHS09"))
IK["pikto"] = f'<span class="pikto4">{pikto4}</span>'

DELAR = {1: "Börja här", 2: "Arbeta säkert", 3: "I labbet", 4: "Kemi i världen"}
# (titel, del, bild, kort ledtråd som visas i mobilvyn)
STATIONER = [
    ("Vad är kemi?", 1, foto("molekylmodell"), "Och varför ska du läsa det?"),
    ("Så lär du dig", 1, IK["bok"], "Fakta, samband, räkna och laborera"),
    ("Arbeta som forskare", 1, IK["lupp"], "Fråga, gissa, testa, dra slutsats"),
    ("Säkerhet", 2, IK["glasogon"], "Regler för kemisalen"),
    ("Faropiktogram", 2, IK["pikto"], "De nio symbolerna"),
    ("Utrustning", 3, foto("bunsenbrannare"), "Känn igen och mät"),
    ("Rapporten", 3, IK["rapport"], "Så skriver du den"),
    ("Ämnens egenskaper", 3, foto("vag"), "Känn igen och beskriv"),
    ("Kemins historia", 4, IK["timglas"], "Från alkemi till modern kemi"),
    ("Nobelpris och forskning", 4, IK["medalj"], "Vad händer idag?"),
]
assert len(STATIONER) == 10
import math
CX, CY, RX, RY, VW, VH = 390, 300, 298, 218, 780, 600
kartpunkter, senaste = "", 0
for i, (titel, del_, bild, hook) in enumerate(STATIONER, 1):
    v = math.radians(-90 + (i - 1) * 36)
    x, y = CX + RX * math.cos(v), CY + RY * math.sin(v)
    if del_ != senaste:
        kartpunkter += f'\n            <li class="grp" aria-hidden="true">{esc(DELAR[del_])}</li>'
        senaste = del_
    kartpunkter += f'''
            <li class="st g{del_}" style="left:{x / VW * 100:.2f}%;top:{y / VH * 100:.2f}%">
              <a href="./studieguide.html#m{i}"><span class="disc"><span class="in">{bild}</span><span class="num" aria-hidden="true">{i}</span></span><span class="txt"><span class="ttl">{esc(titel)}</span><span class="hook">{esc(hook)}</span><span class="sr-only"> Milstolpe {i} av 10, del: {esc(DELAR[del_])}.</span></span></a>
            </li>'''

btns = "\n".join(f'            <li><button class="concept-btn" data-concept="{esc(b["namn"])}">{esc(b["namn"])}</button></li>' for b in begr)

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
    <section class="kemikarta" aria-labelledby="karta-h">
      <h2 id="karta-h" class="sr-only">Kemikartan: tio stationer i Ämnet kemi</h2>
      <div class="karta">
        <div class="karta-mitt"><strong>Ämnet kemi</strong><span>Börja på 1 och följ siffrorna</span></div>
        <ol>{kartpunkter}
        </ol>
      </div>
      <p class="karta-legend">Kantlinjen visar vilken del stationen hör till: heldragen = <strong>Börja här</strong>, dubbel = <strong>Arbeta säkert</strong>, streckad = <strong>I labbet</strong>, prickad = <strong>Kemi i världen</strong>. Klicka på en station för att komma till samma milstolpe i studieguiden.</p>
    </section>
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
        <section class="concept-section" aria-label="Viktiga begrepp">
          <h2>Viktiga begrepp att lära sig</h2>
          <ul class="concept-list">
{btns}
          </ul>
          <p class="concept-note">Här lägger vi grunden för alla kemiområden. Ämnens uppbyggnad från partiklar tas upp i <a href="/kemi/atomer/index.html">Atomer och molekyler</a>, och hur man delar upp blandningar och undersöker systematiskt i <a href="/kemi/separationsprocesser/index.html">Separationsprocesser</a>.</p>
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
