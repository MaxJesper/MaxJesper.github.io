#!/usr/bin/env python3
"""Bygger kemi/separationsprocesser/studieguide.html av src/m*.html.

Makro i källfilerna:  [[Begrepp|visad text]]  ->  klickbart begrepp (concept-inline).
Körs:  python3 bygg_studieguide.py   (från valfri katalog; skriver relativt sajtroten)
"""
import re, json, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "separationsprocesser", "studieguide.html")
SRC = ["m1_m3.html", "m4_m6.html", "m7_m9.html"]
CSS_FILE = os.path.join(HERE, "studieguide.css")

REFS = json.load(open(os.path.join(HERE, "kallor.json"), encoding="utf-8"))

terms = []
def macro(m):
    term, text = m.group(1), m.group(2)
    if term not in terms:
        terms.append(term)
    return ('<strong class="term"><span class="concept-inline" data-concept="%s">%s</span></strong>'
            % (html.escape(term, quote=True), text))

body = ""
for f in SRC:
    body += open(os.path.join(HERE, "src", f), encoding="utf-8").read() + "\n"
body = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", macro, body)
# Milstolpe 1 öppen från början
body = body.replace('<details class="milestone" id="m1">', '<details class="milestone" id="m1" open>', 1)

# ---- Figurer med liten text i smala sidokolumnen flyttas till en bred bildrad ----
# (effektiv textstorlek i sidokolumnen skulle bli < 8 px; i bred rad visas de nära ursprungsstorlek)
from bs4 import BeautifulSoup
WIDE = {"blandningstyper": 760, "loslighet-tre": 780, "loslighet-temp": 640, "sedimentering": 820,
        "indunstning": 780, "kromatografi": 820, "legering": 640, "varmekurva": 640, "filtrering": 470, "centrifug": 820}
NAT = {}  # naturlig storlek (bredd, höjd) per figur, läses ur SVG:ns viewBox
import glob
for f in glob.glob(os.path.join(ROOT, "images", "kemi", "separationsprocesser", "*.svg")):
    vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', open(f, encoding="utf-8").read())
    NAT[os.path.basename(f)[:-4]] = (float(vb.group(1)), float(vb.group(2)))

def figname(fig):
    img = fig.find("img")
    m = re.search(r"/([\w-]+)\.svg", img["src"]) if img else None
    return m.group(1) if m else None

soup = BeautifulSoup(body, "html.parser")
for row in soup.select("div.m-row"):
    side = row.find("div", class_="m-side", recursive=False)
    if not side:
        continue
    figs = side.find_all("figure", recursive=False)
    if not any(figname(f) in WIDE for f in figs):
        continue
    lead = row.find("div", class_="m-lead", recursive=False)
    rest = row.find("div", class_="m-rest", recursive=False)
    def plain(inner):
        r = soup.new_tag("div", attrs={"class": "m-row m-row--plain"})
        inner["class"] = ["m-lead"]
        r.append(inner.extract())
        return r
    figrow = soup.new_tag("div", attrs={"class": "m-row m-row--full"})
    fr = soup.new_tag("div", attrs={"class": "fig-wide"})
    for f in figs:
        n = figname(f)
        w = WIDE.get(n) or NAT[n][0]
        img = f.find("img")
        W, H = NAT[n]
        img["width"] = str(int(w)); img["height"] = str(int(round(w * H / W)))
        img["style"] = "max-width:100%;height:auto;"
        f["style"] = "flex:0 1 %dpx;max-width:100%%;" % (int(w) + 40)
        f["style"] = f["style"].replace("%%", "%")
        fr.append(f.extract())
    figrow.append(fr)
    pieces = [plain(lead), figrow]
    if rest is not None:
        pieces.append(plain(rest))
    for pc in reversed(pieces):
        row.insert_after(pc)
    row.decompose()

# Termer: övriga fetmarkerade ord (inte kärnbegrepp) får bara en översättningspopup (data/termer.<språk>.json)
TERMER = ["fast form", "flytande form", "gasform", "partiklar", "torris", "absoluta nollpunkten", "kelvinskalan",
          "destillerat vatten", "aceton", "lacknafta", "utspädd", "koncentrerad", "kristaller", "magnet", "filterpapper",
          "återstod", "skiljetratt", "kylare", "fraktionerad destillation", "papperskromatografi", "bottenfall",
          "kalkvatten", "neutralt", "pH-papper", "pH-mätare", "avloppsvatten", "dricksvatten", "beroende variabel", "konstant"]
_tm = {t.lower(): t for t in TERMER}
_anv = set()
for st in soup.select("strong.term"):
    if st.find("span", class_="concept-inline"):
        continue
    key = st.get_text().strip().lower()
    if key in _tm:
        inner = "".join(str(c) for c in st.contents)
        st.clear()
        sp = soup.new_tag("span", attrs={"class": "concept-inline", "data-concept": _tm[key]})
        sp.string = "".join(str(c) for c in [key if False else inner])
        st.append(sp)
        _anv.add(_tm[key])
_saknas = [t for t in TERMER if t not in _anv]
if _saknas:
    print("VARNING: termer utan förekomst:", _saknas)
json.dump(TERMER, open(os.path.join(HERE, "termer_i_text.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
body = soup.decode(formatter="minimal")

# Kontroll: alla hänvisningar [n] finns i källistan
used = sorted(set(int(x) for x in re.findall(r'href="#ref-(\d+)"', body)))
missing = [n for n in used if str(n) not in REFS]
if missing:
    sys.exit("Saknar källor: %s" % missing)

css = open(CSS_FILE, encoding="utf-8").read()

ref_items = []
for n in sorted(int(k) for k in REFS):
    ref_items.append('        <li id="ref-%d">%s</li>' % (n, REFS[str(n)]))

head = """<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studieguide – Separationsprocesser</title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/studieguide-bildkolumn.css" />
  <style>
%s
  </style>
</head>
<body class="area-separation">

  <header class="kemi-header">
    <h1>Studieguide</h1>
    <p>Separationsprocesser</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main class="guide-wide">
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./checklista.html" class="subject-btn">✅ Checklistan</a>
      <button type="button" id="toggle-all-btn" class="pill-btn" onclick="toggleAllMilestones()">Öppna alla</button>
    </div>

    <section class="guide-intro">
      <p><strong>Så här använder du studieguiden:</strong> arbeta dig igenom milstolparna i ordning. Du börjar med materiens former och blandningar, går vidare till hur man delar upp blandningar och slutar med hur man undersöker systematiskt. Innehållet följer det centrala innehållet i kursplanen i kemi för åk 7–9.<a class="cite" href="#ref-1">[1]</a></p>
      <p><em>Nyckelord</em> står i fetstil och återkommer i checklistan och begreppslistan. De gula rutorna är fördjupning, de turkosa är frågor att fundera vidare på och de blåa är snabba kontrollfrågor.</p>
      <p>Partikelmodellen kan du <strong>utforska själv</strong> i <a href="./partiklar.html">partikelsimulatorn</a>. Där ser du vad som händer med partiklarna när du värmer eller kyler ett ämne.</p>
      <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>
    </section>
""" % css

tail = """
    <section class="references" id="kallor">
      <h2>Källor</h2>
      <ol>
%s
      </ol>
      <p style="font-size:0.82rem;color:#4a4a4a;font-style:italic;margin-top:0.6rem;">Texten i studieguiden är självständigt formulerad. Kemiska formler och faktauppgifter är allmän faktakunskap; ingen lärobokstext har kopierats. Alla bilder är egenritade för den här sajten.</p>
    </section>

  </main>

  <script src="/js/menu.js"></script>
  <script src="/js/lyssna.js"></script>
  <script>
    function toggleAllMilestones() {
      var milestones = document.querySelectorAll('details.milestone');
      var btn = document.getElementById('toggle-all-btn');
      var anyOpen = Array.from(milestones).some(function(m) { return m.open; });
      milestones.forEach(function(m) { m.open = !anyOpen; });
      btn.textContent = anyOpen ? 'Öppna alla' : 'Stäng alla';
    }
    (function () {
      function openFromHash() {
        var match = window.location.hash.match(/^#m([0-9]+)$/);
        if (!match) return;
        var target = document.getElementById("m" + match[1]);
        if (!target) return;
        if (!target.open) target.open = true;
        setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", openFromHash);
      else openFromHash();
      window.addEventListener("hashchange", openFromHash);
    })();
  </script>
  <script src="/kemi/separationsprocesser/js/partikelmodell.js"></script>
  <script src="/js/language-selector.js"></script>
  <script src="/js/concepts-popup.js"></script>
  <script src="/js/concept-lang-selector.js"></script>
  <script>
    /* Bas: hämta svenska begrepp för begreppspopupen i löptexten (klickbara ord). */
    fetch("./data/begrepp.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.length) return;
        window.BEGREPP = data;
        var savedConceptLang = 'sv-SE';
        try { savedConceptLang = localStorage.getItem('site.concept-lang') || 'sv-SE'; } catch (e) {}
        /* Skriv inte över ett redan valt annat begrepp-språk (undviker kapplöpning mot concept-lang-selector.js). */
        if (savedConceptLang === 'sv-SE' && window.BEGREPPPopup) window.BEGREPPPopup.update(data);
      })
      .catch(function (e) { console.warn('Kunde inte hämta begrepp.json', e); });
  </script>
</body>
</html>
""" % "\n".join(ref_items)

open(OUT, "w", encoding="utf-8").write(head + body + tail)
json.dump(terms, open(os.path.join(HERE, "begrepp_i_text.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("Skrev", OUT, len(head + body + tail), "byte;", len(terms), "begrepp i löptext;", "källor:", len(REFS))
