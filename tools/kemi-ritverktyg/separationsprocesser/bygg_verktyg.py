#!/usr/bin/env python3
"""Genererar särskilda verktygssidor: ovningsverktyg.html, larande-spel.html (mall i denna fil)."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "separationsprocesser")

def write(n, t):
    open(os.path.join(OUT, n), "w", encoding="utf-8").write(t); print("skrev", n, len(t))

AREA = "body.area-separation { --area:#0e7490; --area-strong:#155e75; --area-soft:#ecfeff; --area-border:#a5f3fc; --area-hover:#cffafe; }"

OVN = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Övningar – Separationsprocesser</title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/dra-och-slapp.css" />
  <style>
    __AREA__
    main { max-width: 960px; margin: 0 auto; }
    .intro-box { background:#ecfeff; border:1px solid #a5f3fc; border-left:4px solid #155e75; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    #prog { font-weight:700; color:#1e3a8a; }
    .jump { display:flex; flex-wrap:wrap; gap:0.4rem; margin:0.6rem 0 0; padding:0; list-style:none; }
    .jump a { display:inline-block; padding:0.35rem 0.8rem; min-height:36px; border:1px solid #67e8f9; border-radius:999px; background:#fff; color:#155e75; text-decoration:none; font-size:0.9rem; }
    .jump a:hover { background:#cffafe; }
    .jump a:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .tier { margin:2rem 0 0.4rem; padding-bottom:0.3rem; border-bottom:2px solid #a5f3fc; font-size:1.4rem; color:#155e75; }
    .tier small { font-size:0.9rem; color:#333a4a; font-weight:400; }
    .act { scroll-margin-top:0.75rem; }
    .next-steps { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.6rem; margin-top:1.5rem; }
    .next-steps a { display:block; padding:0.7rem 0.9rem; background:#ecfeff; border:1px solid #a5f3fc; border-radius:8px; text-decoration:none; color:#1a1a2e; font-size:0.95rem; }
    .next-steps a:hover { background:#cffafe; }
    .next-steps a:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .next-steps a .n-label { display:block; font-size:0.72rem; letter-spacing:1.4px; text-transform:uppercase; color:#155e75; font-weight:700; margin-bottom:0.2rem; }
    .lyft { font-size:0.95rem; margin:0.4rem 0 0; }
    .lyft a { text-decoration: underline; }
  </style>
</head>
<body class="area-separation">
  <header class="kemi-header">
    <h1>Övningar</h1>
    <p>Separationsprocesser</p>
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
      <p><strong>Så här gör du:</strong> i sorteringsövningarna <strong>drar du varje bricka till rätt ruta</strong>. Du kan också klicka på brickan och sedan på rutan, eller använda tangentbordet (Tab, Enter). Du får direkt besked med en förklaring. Poängen räknar bara de brickor som blev rätt på första försöket, så du kan köra om övningen.</p>
      <p>Övningarna är i två nivåer: <strong>Grund</strong> är det du behöver kunna, <strong>Lär mer</strong> är för dig som vill utmana dig själv.</p>
      <p id="prog" role="status" aria-live="polite">Klara övningar: 0 av …</p>
      <nav aria-label="Hoppa till övning"><ul class="jump" id="jump"></ul></nav>
    </section>

    <div id="acts"><p>Övningarna laddas …</p></div>

    <div class="next-steps">
      <a href="./valj-metod.html"><span class="n-label">Öva</span>Välj rätt metod (scenarier)</a>
      <a href="./partiklar.html"><span class="n-label">Utforska</span>Partikelsimulatorn</a>
      <a href="./begreppskort.html"><span class="n-label">Spela</span>Begreppskort</a>
      <a href="./checklista.html"><span class="n-label">Kontrollera</span>Checklistan</a>
    </div>
    <p class="lyft">Övningen om grundämnen, kemiska föreningar och blandningar finns i en version för atomer och molekyler i <a href="/kemi/atomer/ovningsverktyg.html#ov-grundamne-forening">Atomer och molekyler</a>.</p>
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
      var h = document.createElement('h2'); h.className = 'tier'; h.id = 'nivå-' + name.toLowerCase().replace(/\\s+/g, '-').replace('ä', 'a');
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

def cards():
    return [
     ("./partiklar.html", "Partiklar", "Partikelsimulatorn", "Dra i temperaturreglaget och se hur partiklarna i vatten, etanol eller järn rör sig. Fast form, flytande form eller gas? Se smältpunkt och kokpunkt i verkligheten.", "Öppna simulatorn"),
     ("./valj-metod.html", "Välj metod", "Välj rätt metod", "Du får ett problem, till exempel salt ur havsvatten eller järnspån i sand. Välj rätt separationsmetod och ordning, och få förklaringen direkt.", "Öppna scenarierna"),
     ("./ovningsverktyg.html", "Dra och släpp", "Dra och släpp, sortera", "Elva sorteringsövningar: former, fasövergångar, rent ämne eller blandning, vilken metod passar med mera. Direkt besked med förklaring.", "Öppna övningarna"),
     ("./begreppskort.html", "Begreppskort", "Begreppskort", "Para ihop begrepp och förklaringar i två nivåer. Nivå 2 låses upp när du klarat nivå 1.", "Öppna begreppskorten"),
     ("./begrepp-bingo.html", "Bingo", "Begreppsbingo", "Spela bingo med begreppen. Läraren läser förklaringar, du markerar begreppet på din bricka.", "Öppna bingot"),
     ("./korsord.html", "Korsord", "Korsord", "Lös korsordet med separationsprocessernas begrepp. Ledtrådarna är förklaringar.", "Öppna korsordet"),
    ]

LARANDE = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lärande spel – Separationsprocesser – Kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    .page-intro { margin-bottom: 1.5rem; }
    .resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .resource-box { background: #fff; border: 1px solid #d8d8d8; border-left: 4px solid var(--area); border-radius: 14px; padding: 1rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); display: flex; flex-direction: column; gap: 0.8rem; transition: transform 0.15s ease, box-shadow 0.15s ease; }
    .resource-box:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08); }
    .resource-thumb-link { display: block; text-decoration: none; }
    .resource-thumb { width: 100%; aspect-ratio: 16 / 10; border: 1px solid var(--area-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; text-align: center; padding: 0.5rem; box-sizing: border-box; background: linear-gradient(135deg, #ecfeff, #a5f3fc); color: var(--area-strong); }
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
<body class="area-separation">

  <header class="kemi-header">
    <h1>Lärande spel</h1>
    <p>Separationsprocesser</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
    </div>

    <section class="page-intro">
      <p>Här hittar du övningarna för separationsprocesser: utforska partiklarna, välj rätt separationsmetod, sortera och träna begreppen med kort, bingo och korsord.</p>
    </section>

    <section class="resource-grid">
__CARDS__
    </section>

    <section class="study-tips">
      <details>
        <summary>Tips</summary>
        <ul>
          <li>Börja med <a href="./partiklar.html">partikelsimulatorn</a> om du är osäker på fast form, flytande form och gas.</li>
          <li>Sorteringsövningarna är i två nivåer. Börja med Grund och gå vidare till Lär mer när du känner dig säker.</li>
          <li>Kom ihåg att fråga dig <em>vad som skiljer ämnena åt</em> när du ska välja separationsmetod.</li>
          <li>Vill du testa i verkligheten? Se <a href="./laborationer.html">laborationerna</a>.</li>
        </ul>
      </details>
    </section>
  </main>

  <script src="/js/menu.js"></script>
</body>
</html>
'''

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

VALJ = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Välj rätt metod – Separationsprocesser</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    main { max-width: 900px; margin: 0 auto; font-size: 1.05em; }
    .intro-box { background:#ecfeff; border:1px solid #a5f3fc; border-left:4px solid #155e75; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    #prog { font-weight:700; color:#1e3a8a; }
    .jump { display:flex; flex-wrap:wrap; gap:0.4rem; margin:0.6rem 0 0; padding:0; list-style:none; }
    .jump button { font:inherit; font-size:0.9rem; padding:0.3rem 0.8rem; min-height:36px; border:2px solid #67e8f9; border-radius:999px; background:#fff; color:#155e75; cursor:pointer; }
    .jump button[aria-current=true] { background:#155e75; color:#fff; border-color:#155e75; }
    .jump button.klar::after { content:" ✓"; }
    .jump button:focus-visible, .chip:focus-visible, .btn:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .card { background:#fff; border:1px solid #d8d8d8; border-left:5px solid var(--area); border-radius:12px; padding:1.1rem 1.3rem; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
    .card h2 { margin:0 0 0.2rem; color:var(--area-strong); font-size:1.25rem; }
    .tierlabel { font-size:0.75rem; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:#155e75; }
    .sec-label { font-weight:700; margin:1rem 0 0.3rem; }
    .chips { display:flex; flex-wrap:wrap; gap:0.5rem; }
    .chip { font:inherit; font-weight:600; padding:0.5rem 0.9rem; min-height:44px; border:2px solid #155e75; border-radius:10px; background:#fff; color:#155e75; cursor:pointer; }
    .chip:hover { background:#ecfeff; }
    .seq { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0.4rem; min-height:2.6rem; }
    .seq li { display:flex; align-items:center; gap:0.6rem; background:#f8fafc; border:2px solid #94a3b8; border-radius:10px; padding:0.35rem 0.6rem; }
    .seq .num { font-weight:800; background:#155e75; color:#fff; border-radius:50%; width:1.7rem; height:1.7rem; display:inline-flex; align-items:center; justify-content:center; flex:0 0 auto; }
    .seq .namn { flex:1; font-weight:600; }
    .seq .rm { font:inherit; border:2px solid #475569; background:#fff; color:#1f2937; border-radius:8px; padding:0.2rem 0.6rem; min-height:36px; cursor:pointer; }
    .seq li.ratt { border-color:#1d4ed8; background:#eff6ff; }
    .seq li.fel { border-color:#9a3412; background:#fff7ed; border-style:dashed; }
    .seq .mark { font-weight:800; }
    .empty { color:#475569; font-style:italic; }
    .actions { display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.9rem; }
    .btn { font:inherit; font-weight:700; padding:0.55rem 1.1rem; min-height:44px; border-radius:10px; cursor:pointer; border:2px solid #155e75; background:#155e75; color:#fff; }
    .btn.sek { background:#fff; color:#155e75; }
    .btn[disabled] { opacity:0.5; cursor:not-allowed; }
    .fb { margin-top:0.9rem; padding:0.8rem 1rem; border-radius:10px; border:2px solid #94a3b8; background:#f8fafc; }
    .fb.ok { border-color:#1d4ed8; background:#eff6ff; }
    .fb.no { border-color:#9a3412; background:#fff7ed; }
    .fb strong.h { display:block; margin-bottom:0.2rem; }
    .fb p { margin:0.25rem 0; }
    .hint { margin-top:0.5rem; font-size:0.95rem; color:#334155; }
    .navrow { display:flex; justify-content:space-between; gap:0.5rem; margin-top:1rem; flex-wrap:wrap; }
  </style>
</head>
<body class="area-separation">
  <header class="kemi-header">
    <h1>Välj rätt metod</h1>
    <p>Separationsprocesser</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html#m5" class="subject-btn">📖 Studieguiden</a>
      <a href="./larande-spel.html" class="subject-btn">🎮 Lärande spel</a>
    </div>

    <section class="intro-box">
      <p><strong>Så här gör du:</strong> läs problemet och klicka på metoderna i den ordning du vill använda dem. Ofta behövs mer än en metod, och ordningen spelar roll. Klicka på <em>Kontrollera</em> för att få besked och en förklaring. Fråga dig alltid: <em>vad skiljer ämnena åt?</em></p>
      <p id="prog" role="status" aria-live="polite">Rätt på första försöket: 0 av …</p>
      <div role="group" aria-label="Välj scenario"><ul class="jump" id="jump"></ul></div>
    </section>

    <section class="card" id="kort"></section>
  </main>

  <script src="/js/menu.js"></script>
  <script>
  (function () {
    var DATA, cur = 0, seq = [], fel = 0, klar = {}, forsta = {};
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function met(id) { return DATA.metoder.filter(function (m) { return m.id === id; })[0]; }
    function eq(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
    function godkant(sc, s) { return eq(s, sc.svar) || (sc.alt || []).some(function (a) { return eq(s, a); }); }

    function renderJump() {
      var ul = document.getElementById('jump'); ul.innerHTML = '';
      DATA.scenarier.forEach(function (sc, i) {
        var li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.textContent = (i + 1) + '. ' + sc.titel;
        if (i === cur) b.setAttribute('aria-current', 'true');
        if (klar[sc.id]) b.className = 'klar';
        b.addEventListener('click', function () { go(i); });
        li.appendChild(b); ul.appendChild(li);
      });
      var n = Object.keys(forsta).filter(function (k) { return forsta[k]; }).length;
      document.getElementById('prog').textContent = 'Rätt på första försöket: ' + n + ' av ' + DATA.scenarier.length + ' · Klara: ' + Object.keys(klar).length;
    }
    function go(i) { cur = i; seq = []; fel = 0; render(); renderJump(); }

    function render(fbHtml, fbCls, marks) {
      var sc = DATA.scenarier[cur], root = document.getElementById('kort');
      var h = '<div class="tierlabel">' + esc(sc.tier) + ' · Scenario ' + (cur + 1) + ' av ' + DATA.scenarier.length + '</div>';
      h += '<h2>' + esc(sc.titel) + '</h2><p>' + esc(sc.beskrivning) + '</p>';
      h += '<div class="sec-label" id="lbl-m">Metoder (klicka för att lägga till i din plan):</div><div class="chips" role="group" aria-labelledby="lbl-m">';
      DATA.metoder.forEach(function (m) { h += '<button type="button" class="chip" data-id="' + m.id + '">' + esc(m.namn) + '</button>'; });
      h += '</div><div class="sec-label" id="lbl-s">Din plan, steg för steg:</div>';
      if (!seq.length) h += '<p class="empty">Ingen metod vald ännu.</p>';
      else {
        h += '<ol class="seq" aria-labelledby="lbl-s">';
        seq.forEach(function (id, i) {
          var cls = marks ? (marks[i] ? 'ratt' : 'fel') : '';
          var mk = marks ? (marks[i] ? '<span class="mark"> ✔ rätt plats</span>' : '<span class="mark"> ✖ fel</span>') : '';
          h += '<li class="' + cls + '"><span class="num" aria-hidden="true">' + (i + 1) + '</span><span class="namn">' + esc(met(id).namn) + mk + '</span><button type="button" class="rm" data-rm="' + i + '" aria-label="Ta bort steg ' + (i + 1) + '">Ta bort</button></li>';
        });
        h += '</ol>';
      }
      h += '<div class="actions"><button type="button" class="btn" id="chk"' + (seq.length ? '' : ' disabled') + '>Kontrollera</button>';
      h += '<button type="button" class="btn sek" id="clr"' + (seq.length ? '' : ' disabled') + '>Töm planen</button>';
      h += '<button type="button" class="btn sek" id="hint">Ledtråd</button>';
      if (fel >= 2 && !klar[sc.id]) h += '<button type="button" class="btn sek" id="show">Visa svaret</button>';
      h += '</div><div id="hintbox" class="hint" aria-live="polite"></div>';
      if (fbHtml) h += '<div class="fb ' + fbCls + '" role="status">' + fbHtml + '</div>';
      h += '<div class="navrow"><button type="button" class="btn sek" id="prev"' + (cur === 0 ? ' disabled' : '') + '>← Föregående</button><button type="button" class="btn sek" id="next"' + (cur === DATA.scenarier.length - 1 ? ' disabled' : '') + '>Nästa →</button></div>';
      root.innerHTML = h;
      root.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-id'); seq.push(id); render(); var nb = document.querySelector('.chip[data-id="' + id + '"]'); if (nb) nb.focus(); }); });
      root.querySelectorAll('.rm').forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-rm'); seq.splice(i, 1); render(); var n = document.querySelectorAll('.seq .rm'); var f = n[Math.min(i, n.length - 1)] || document.querySelector('.chip'); if (f) f.focus(); }); });
      var c = document.getElementById('chk'); if (c) c.addEventListener('click', check);
      var cl = document.getElementById('clr'); if (cl) cl.addEventListener('click', function () { seq = []; render(); });
      document.getElementById('hint').addEventListener('click', function () {
        var egs = []; sc.svar.forEach(function (id) { var e = met(id).egenskap; if (egs.indexOf(e) < 0) egs.push(e); });
        document.getElementById('hintbox').textContent = 'Ledtråd: du behöver ' + sc.svar.length + ' steg. Egenskaper som skiljer ämnena åt här: ' + egs.join(', ') + '.';
      });
      var sh = document.getElementById('show'); if (sh) sh.addEventListener('click', function () { seq = sc.svar.slice(); klar[sc.id] = 1; render('<strong class="h">Så här kan man göra:</strong><p>' + esc(sc.varfor) + '</p>', 'ok'); renderJump(); });
      document.getElementById('prev').addEventListener('click', function () { go(cur - 1); });
      document.getElementById('next').addEventListener('click', function () { go(cur + 1); });
    }

    function check() {
      var sc = DATA.scenarier[cur];
      if (godkant(sc, seq)) {
        if (!klar[sc.id]) forsta[sc.id] = (fel === 0);
        klar[sc.id] = 1;
        render('<strong class="h">✔ Rätt!</strong><p>' + esc(sc.varfor) + '</p>', 'ok', seq.map(function () { return true; }));
        renderJump(); return;
      }
      fel++;
      var marks = seq.map(function (id, i) { return sc.svar[i] === id; });
      var missing = sc.svar.filter(function (id) { return seq.indexOf(id) < 0; });
      var extra = seq.filter(function (id) { return sc.svar.indexOf(id) < 0; });
      var msg = '<strong class="h">✖ Inte riktigt än.</strong>';
      if (!missing.length && !extra.length && seq.length === sc.svar.length) msg += '<p>Du har rätt metoder men i fel ordning. Tänk på vad som måste göras först.</p>';
      else {
        if (extra.length) msg += '<p>Metoder som inte passar här: ' + extra.map(function (id) { return esc(met(id).namn); }).join(', ') + '. Fråga dig vad som skiljer ämnena åt.</p>';
        if (missing.length) msg += '<p>Något saknas i din plan (' + missing.length + ' steg till).</p>';
        if (seq.length > sc.svar.length && !extra.length) msg += '<p>Du har med fler steg än som behövs.</p>';
      }
      render(msg, 'no', marks);
    }

    fetch('data/valjmetod.json').then(function (r) { return r.json(); }).then(function (d) { DATA = d; render(); renderJump(); })
      .catch(function () { document.getElementById('kort').innerHTML = '<p>Scenarierna kunde inte laddas. Ladda om sidan.</p>'; });
  })();
  </script>
</body>
</html>
'''
write("valj-metod.html", VALJ.replace("__AREA__", AREA))

PART = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Partikelsimulatorn – Separationsprocesser</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    main { max-width: 1000px; margin: 0 auto; font-size: 1.05em; }
    .intro-box { background:#ecfeff; border:1px solid #a5f3fc; border-left:4px solid #155e75; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    .tasks { background:#fff; border:1px solid #d8d8d8; border-left:5px solid var(--area); border-radius:12px; padding:1rem 1.3rem; margin:1.2rem 0; }
    .tasks h2 { margin:0 0 0.4rem; font-size:1.2rem; color:var(--area-strong); }
    .tasks ol { margin:0.3rem 0 0 1.3rem; padding:0; }
    .tasks li { margin:0.55rem 0; line-height:1.5; }
    details.svar { margin:0.3rem 0 0; background:#eff6ff; border-left:4px solid #2563eb; border-radius:6px; padding:0.4rem 0.8rem; }
    details.svar summary { cursor:pointer; font-weight:600; color:#1e3a8a; }
    details.svar summary:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .grid2 { display:grid; grid-template-columns:repeat(auto-fit, minmax(440px, 1fr)); gap:1rem; }
    @media (max-width: 520px) { .grid2 { grid-template-columns:1fr; } }
    .next-steps { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.6rem; margin-top:1.2rem; }
    .next-steps a { display:block; padding:0.7rem 0.9rem; background:#ecfeff; border:1px solid #a5f3fc; border-radius:8px; text-decoration:none; color:#1a1a2e; font-size:0.95rem; }
    .next-steps a:hover { background:#cffafe; }
    .next-steps a .n-label { display:block; font-size:0.72rem; letter-spacing:1.4px; text-transform:uppercase; color:#155e75; font-weight:700; margin-bottom:0.2rem; }
  </style>
</head>
<body class="area-separation">
  <header class="kemi-header">
    <h1>Partikelsimulatorn</h1>
    <p>Separationsprocesser</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./" class="subject-btn">← Tillbaka till området</a>
      <a href="./studieguide.html#m1" class="subject-btn">📖 Studieguiden</a>
      <a href="./larande-spel.html" class="subject-btn">🎮 Lärande spel</a>
    </div>

    <section class="intro-box">
      <p><strong>Så här använder du simulatorn:</strong> varje kula är en partikel (en molekyl eller en atom). Dra i temperaturreglaget, eller använd piltangenterna när reglaget är valt. Du kan också klicka på <em>Fast</em>, <em>Flytande</em> eller <em>Gas</em> för att hoppa till en temperatur i det området. Under simulatorn står vilken form ämnet har, med ord, så du behöver aldrig gissa utifrån färgen.</p>
      <p>Modellen är förenklad: partiklarna ritas som kulor och avstånd och hastigheter är inte skalenliga.</p>
    </section>

    <div data-partikel data-amne="vatten"></div>

    <section class="tasks">
      <h2>Uppgifter att prova</h2>
      <ol>
        <li>Sätt vatten på −20 °C och värm sakta. Vid vilken temperatur börjar isen smälta? Vad händer med partiklarna?
          <details class="svar"><summary>Visa svar</summary><p>Vid 0 °C. Partiklarna får så mycket rörelse att de lossnar från sina platser och börjar glida förbi varandra.</p></details></li>
        <li>Fortsätt värma. Vid vilken temperatur börjar vattnet koka, och vad har partiklarna hunnit göra vid 130 °C?
          <details class="svar"><summary>Visa svar</summary><p>Vid 100 °C. Vid 130 °C har partiklarna lämnat vätskan och far runt med stora avstånd, alltså vattenånga.</p></details></li>
        <li>Byt ämne till etanol och sätt temperaturen på 20 °C. Vilken form har etanol? Jämför med vatten.
          <details class="svar"><summary>Visa svar</summary><p>Flytande. Etanol kokar vid 78 °C, alltså redan innan vatten. Därför kan man skilja dem med destillation.</p></details></li>
        <li>Byt ämne till järn och sätt temperaturen på 20 °C. Vilken form har järn, och hur långt måste man värma för att smälta det?
          <details class="svar"><summary>Visa svar</summary><p>Fast. Järn smälter först vid 1 538 °C och kokar vid 2 862 °C.</p></details></li>
        <li>Förklara med partikelmodellen varför en gas kan pressas ihop lätt men inte en vätska.
          <details class="svar"><summary>Visa svar</summary><p>I en gas är det stora avstånd mellan partiklarna, så de kan komma närmare. I en vätska ligger de redan tätt.</p></details></li>
      </ol>
    </section>

    <div class="next-steps">
      <a href="./studieguide.html#m2"><span class="n-label">Läs</span>Fasövergångar i studieguiden</a>
      <a href="./ovningsverktyg.html#ov-former"><span class="n-label">Öva</span>Fast, flytande eller gas?</a>
      <a href="./laborationer.html#lab-7"><span class="n-label">Laborera</span>Värmekurva för is</a>
      <a href="./checklista.html"><span class="n-label">Kontrollera</span>Checklistan</a>
    </div>
  </main>

  <script src="/js/menu.js"></script>
  <script src="/kemi/separationsprocesser/js/partikelmodell.js"></script>
</body>
</html>
'''
write("partiklar.html", PART.replace("__AREA__", AREA))
