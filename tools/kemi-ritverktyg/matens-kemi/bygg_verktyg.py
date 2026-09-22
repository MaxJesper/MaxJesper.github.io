#!/usr/bin/env python3
"""Genererar ovningsverktyg.html (dra-och-släpp, sortering) och larande-spel.html (spelhubb)
för kemi/matens-kemi/. Mönster: tools/kemi-ritverktyg/separationsprocesser/bygg_verktyg.py.
Körs: python3 bygg_verktyg.py"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "matens-kemi")

AREA = "body.area-matens-kemi { --area:#c2410c; --area-strong:#9a3412; --area-soft:#fff7ed; --area-border:#fed7aa; --area-hover:#ffedd5; }"


def write(n, t):
    with open(os.path.join(OUT, n), "w", encoding="utf-8") as f:
        f.write(t)
    print("skrev", n, len(t))


OVN = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sortera molekylerna – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/dra-och-slapp.css" />
  <style>
    __AREA__
    main { max-width: 960px; margin: 0 auto; }
    .intro-box { background:#fff7ed; border:1px solid #fed7aa; border-left:4px solid #9a3412; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    #prog { font-weight:700; color:#9a3412; }
    .jump { display:flex; flex-wrap:wrap; gap:0.4rem; margin:0.6rem 0 0; padding:0; list-style:none; }
    .jump a { display:inline-block; padding:0.35rem 0.8rem; min-height:36px; border:1px solid #fdba74; border-radius:999px; background:#fff; color:#9a3412; text-decoration:none; font-size:0.9rem; }
    .jump a:hover { background:#ffedd5; }
    .jump a:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .tier { margin:2rem 0 0.4rem; padding-bottom:0.3rem; border-bottom:2px solid #fed7aa; font-size:1.4rem; color:#9a3412; }
    .tier small { font-size:0.9rem; color:#333a4a; font-weight:400; }
    .act { scroll-margin-top:0.75rem; }
    .next-steps { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.6rem; margin-top:1.5rem; }
    .next-steps a { display:block; padding:0.7rem 0.9rem; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; text-decoration:none; color:#1a1a2e; font-size:0.95rem; }
    .next-steps a:hover { background:#ffedd5; }
    .next-steps a:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .next-steps a .n-label { display:block; font-size:0.72rem; letter-spacing:1.4px; text-transform:uppercase; color:#9a3412; font-weight:700; margin-bottom:0.2rem; }
  </style>
</head>
<body class="area-matens-kemi">
  <header class="kemi-header">
    <h1>Sortera molekylerna</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
      <a href="./larande-spel.html" class="subject-btn">🎮 Lärande spel</a>
    </div>

    <section class="intro-box">
      <p><strong>Så här gör du:</strong> i varje övning <strong>drar du varje bricka till rätt ruta</strong>. Du kan också klicka på brickan och sedan på rutan, eller använda tangentbordet (Tab, Enter). Du får direkt besked med en förklaring. Poängen räknar bara de brickor som blev rätt på första försöket, så du kan köra om övningen.</p>
      <p>Övningarna är i två nivåer: <strong>Grund</strong> är det du behöver kunna, <strong>Lär mer</strong> är för dig som vill utmana dig själv.</p>
      <p id="prog" role="status" aria-live="polite">Klara övningar: 0 av …</p>
      <nav aria-label="Hoppa till övning"><ul class="jump" id="jump"></ul></nav>
    </section>

    <div id="acts"><p>Övningarna laddas …</p></div>

    <div class="next-steps">
      <a href="./studieguide.html"><span class="n-label">Läs</span>Studieguiden</a>
      <a href="./begreppskort.html"><span class="n-label">Spela</span>Begreppskort</a>
      <a href="./korsord.html"><span class="n-label">Öva</span>Korsord</a>
      <a href="./checklista.html"><span class="n-label">Kontrollera</span>Checklistan</a>
    </div>
  </main>

  <script src="/js/menu.js"></script>
  <script src="/js/dra-och-slapp.js"></script>
  <script>
  (function () {
    var done = {}, TOTAL = 0;
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function progress() {
      var n = Object.keys(done).length;
      document.getElementById('prog').textContent = 'Klara övningar: ' + n + ' av ' + TOTAL + (n === TOTAL ? ' – alla klara!' : '');
    }
    function tierHead(container, name, sub) {
      var h = document.createElement('h2'); h.className = 'tier'; h.id = 'niva-' + name.toLowerCase().replace(/\\s+/g, '-').replace('ä', 'a');
      h.innerHTML = name + ' <small>' + sub + '</small>'; container.appendChild(h);
    }
    function addJump(id, text) {
      var li = document.createElement('li'), a = document.createElement('a'); a.href = '#' + id; a.textContent = text; li.appendChild(a); document.getElementById('jump').appendChild(li);
    }
    fetch('data/ovningar.json').then(function (r) { return r.json(); }).then(function (data) {
      var acts = document.getElementById('acts'); acts.innerHTML = '';
      var sort = data.sortering; TOTAL = sort.length;
      ['Grund', 'Lär mer'].forEach(function (tier) {
        tierHead(acts, tier, tier === 'Grund' ? 'Det här ska alla kunna' : 'För dig som vill utmana dig själv');
        sort.filter(function (a) { return a.tier === tier; }).forEach(function (a) {
          var sec = document.createElement('section'); sec.className = 'act'; sec.id = 'ov-' + a.id;
          var box = document.createElement('div'); sec.appendChild(box); acts.appendChild(sec);
          DraOchSlapp.create(box, {
            title: a.title, intro: a.intro, cap: {},
            zones: a.zones.map(function (z) { return { id: z.id, html: esc(z.t), label: z.t }; }),
            items: a.items.map(function (it) { return { id: it.id, html: esc(it.t), label: it.t, zone: it.zone, why: it.why, hint: it.hint }; })
          });
          box.addEventListener('dd:done', function () { done[a.id] = 1; progress(); });
          addJump(sec.id, a.title.replace(/:.*$/, '').replace(/\\?.*$/, ''));
        });
      });
      progress();
      if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    }).catch(function () {
      document.getElementById('acts').innerHTML = '<p>Övningarna kunde inte laddas. Ladda om sidan.</p>';
    });
  })();
  </script>
</body>
</html>
'''

LARANDE = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lärande spel – Matens kemi – Kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    .page-intro { margin-bottom: 1.5rem; }
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .resource-box { background: #fff; border: 1px solid #d8d8d8; border-left: 4px solid var(--area); border-radius: 14px; padding: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; gap: 0.8rem; transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .resource-box:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); }
    .resource-thumb-link { display: block; text-decoration: none; }
    .resource-thumb { width: 100%; aspect-ratio: 16 / 10; border: 1px solid var(--area-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; text-align: center; padding: 0.5rem; box-sizing: border-box; background: linear-gradient(135deg, #fff7ed, #fed7aa); color: var(--area-strong); }
    .resource-title-link { text-decoration: none; color: inherit; }
    .resource-title-link h2 { margin: 0; font-size: 1.15rem; color: #1a1a2e; }
    .resource-title-link:hover h2 { text-decoration: underline; }
    .resource-box p { margin: 0; color: #444; line-height: 1.35; }
    .resource-box ul { list-style: none; padding-left: 0; margin: 0; }
    .resource-box ul a { display: inline-block; text-decoration: none; font-weight: 600; color: var(--area-strong); }
    .study-tips { margin-top: 1.5rem; background: var(--area-soft); border: 1px solid var(--area-border); border-radius: 12px; padding: 1rem; }
    .study-tips summary { cursor: pointer; font-weight: 700; margin-bottom: 0.5rem; }
    .study-tips a { color: var(--area-strong); text-decoration: underline; }
    .study-tips ul { margin: 0.75rem 0 0 1.2rem; }
    .study-tips li { margin-bottom: 0.45rem; }
  </style>
</head>
<body class="area-matens-kemi">

  <header class="kemi-header">
    <h1>Lärande spel</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
    </div>

    <section class="page-intro">
      <p>Här hittar du övningarna för matens kemi: sortera molekylerna, träna begreppen med kort, bingo och korsord.</p>
    </section>

    <section class="resource-grid">
__CARDS__
    </section>

    <section class="study-tips">
      <details>
        <summary>Tips</summary>
        <ul>
          <li>Börja med <a href="./ovningsverktyg.html">Sortera molekylerna</a> för att repetera grunderna.</li>
          <li>Begreppskorten är i två nivåer. Börja med nivå 1 och gå vidare till nivå 2.</li>
          <li>Vill du testa i verkligheten? Se <a href="./laborationer.html">laborationerna</a>.</li>
          <li>Vill du lära dig mer om vitaminer och mineraler? Testa <a href="/spel/hastkapplopning/">Hästkapplöpning</a>.</li>
        </ul>
      </details>
    </section>
  </main>

  <script src="/js/menu.js"></script>
</body>
</html>
'''


def cards():
    return [
        ("./ovningsverktyg.html", "Sortera", "Sortera molekylerna", "Tre sorteringsövningar: kolhydrat/fett/protein, mättat eller omättat fett, och mono-/di-/polysackarider. Direkt besked med förklaring.", "Öppna övningarna"),
        ("./begreppskort.html", "Begreppskort", "Begreppskort", "Para ihop begrepp och förklaringar i två nivåer. Nivå 2 låses upp när du klarat nivå 1.", "Öppna begreppskorten"),
        ("./begrepp-bingo.html", "Bingo", "Begreppsbingo", "Spela bingo med begreppen. Klicka Dra för att slumpa fram en förklaring, markera rätt begrepp på din bricka.", "Öppna bingot"),
        ("./korsord.html", "Korsord", "Korsord", "Lös korsordet med matens kemis begrepp. Ledtrådarna är förklaringar.", "Öppna korsordet"),
    ]


def card_html():
    out = []
    for href, thumb, title, text, link in cards():
        out.append(f'''      <article class="resource-box">
        <a class="resource-thumb-link" href="{href}" tabindex="-1" aria-hidden="true">
          <div class="resource-thumb">{thumb}</div>
        </a>
        <a class="resource-title-link" href="{href}">
          <h2>{title}</h2>
        </a>
        <p>{text}</p>
        <ul>
          <li><a href="{href}">{link}</a></li>
        </ul>
      </article>''')
    return "\n\n".join(out)


if __name__ == "__main__":
    write("ovningsverktyg.html", OVN.replace("__AREA__", AREA))
    write("larande-spel.html", LARANDE.replace("__AREA__", AREA).replace("__CARDS__", card_html()))
