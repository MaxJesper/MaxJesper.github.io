#!/usr/bin/env python3
"""Genererar begreppskort.html och begrepp-bingo.html för kemi/matens-kemi/.
FÖRENKLING (dokumenterad, se OVERLAMNING.md): originalens begrepp-bingo.html i andra områden
använder en Cloudflare Worker-backend (js/bingo-sync.js) för att flera elever ska kunna spela
mot samma "dragna" begrepp i realtid. Den bakomliggande workern kan inte återskapas här, så
den här versionen är en enspelarversion (en elev drar slumpade förklaringar själv och markerar
sin egen bricka) – ingen serverdel, ingen Tailwind-CDN, bara vanilla JS mot befintlig data.
Körs: python3 bygg_kort_bingo.py  (efter bygg_data.py, kräver data/begreppskort.json)"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "matens-kemi")

AREA = "body.area-matens-kemi { --area:#a21caf; --area-strong:#86198f; --area-soft:#fdf4ff; --area-border:#f5d0fe; --area-hover:#fae8ff; }"


def write(n, t):
    with open(os.path.join(OUT, n), "w", encoding="utf-8") as f:
        f.write(t)
    print("skrev", n, len(t))


KORT = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Begreppskort – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    main { max-width: 720px; margin: 0 auto; }
    .intro-box { background:#fdf4ff; border:1px solid #f5d0fe; border-left:4px solid #86198f; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    .levelbar { display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; }
    .levelbtn { font:inherit; font-weight:700; padding:0.5rem 1rem; min-height:44px; border-radius:999px; border:2px solid #86198f; background:#fff; color:#86198f; cursor:pointer; }
    .levelbtn[aria-pressed="true"] { background:#86198f; color:#fff; }
    .levelbtn[disabled] { opacity:0.45; cursor:not-allowed; }
    #prog { font-weight:700; color:#86198f; margin-bottom:0.8rem; }
    .card { background:#fff; border:2px solid #f5d0fe; border-radius:16px; padding:2rem 1.5rem; min-height:200px; display:flex; align-items:center; justify-content:center; text-align:center; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
    .card:focus-visible { outline:3px solid #1d4ed8; outline-offset:3px; }
    .card .term { font-size:1.6rem; font-weight:800; color:#86198f; }
    .card .def { font-size:1.1rem; color:#1f2937; line-height:1.5; }
    .card .hint { display:block; margin-top:0.8rem; font-size:0.85rem; color:#9a6a4a; font-weight:400; }
    .actions { display:flex; gap:0.6rem; justify-content:center; margin-top:1.2rem; flex-wrap:wrap; }
    .btn { font:inherit; font-weight:700; padding:0.6rem 1.2rem; min-height:44px; border-radius:10px; cursor:pointer; border:2px solid #86198f; }
    .btn.ja { background:#166534; border-color:#166534; color:#fff; }
    .btn.nej { background:#fff; color:#86198f; }
    .btn:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .done-msg { text-align:center; padding:2rem 1rem; background:#f0fdf4; border:2px solid #86efac; border-radius:14px; }
  </style>
</head>
<body class="area-matens-kemi">
  <header class="kemi-header">
    <h1>Begreppskort</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./larande-spel.html" class="subject-btn">← Tillbaka till spelen</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
    </div>

    <section class="intro-box">
      <p><strong>Så här gör du:</strong> klicka på kortet för att vända det och se förklaringen. Klicka sedan <em>Kan detta</em> eller <em>Öva mer</em>. Nivå 2 låses upp när du klarat alla kort i nivå 1.</p>
    </section>

    <div class="levelbar" role="group" aria-label="Välj nivå">
      <button type="button" class="levelbtn" id="lvl1" aria-pressed="true">Nivå 1</button>
      <button type="button" class="levelbtn" id="lvl2" disabled>Nivå 2 🔒</button>
    </div>
    <p id="prog" role="status" aria-live="polite"></p>

    <div id="stage"></div>
  </main>

  <script src="/js/menu.js"></script>
  <script>
  (function () {
    var DATA, level = '1', idx = 0, order = [], flipped = false, kan = { '1': {}, '2': {} };

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function startLevel(lv) {
      level = lv; idx = 0; flipped = false;
      order = shuffle(DATA.levels[lv].map(function (_, i) { return i; }));
      document.getElementById('lvl1').setAttribute('aria-pressed', lv === '1' ? 'true' : 'false');
      document.getElementById('lvl2').setAttribute('aria-pressed', lv === '2' ? 'true' : 'false');
      render();
    }

    function progress() {
      var total = DATA.levels[level].length;
      var n = Object.keys(kan[level]).length;
      document.getElementById('prog').textContent = 'Nivå ' + level + ': ' + n + ' av ' + total + ' kort klara';
      if (level === '1' && n === total) {
        var b2 = document.getElementById('lvl2');
        b2.disabled = false; b2.textContent = 'Nivå 2';
      }
    }

    function render() {
      progress();
      var stage = document.getElementById('stage');
      var total = order.length;
      if (idx >= total) {
        stage.innerHTML = '<div class="done-msg"><p><strong>Bra jobbat!</strong> Du har gått igenom alla kort i nivå ' + level + '.</p></div>' +
          '<div class="actions"><button type="button" class="btn nej" id="again">Kör igen</button></div>';
        document.getElementById('again').addEventListener('click', function () { startLevel(level); });
        return;
      }
      var item = DATA.levels[level][order[idx]];
      var html = '<div class="card" id="card" tabindex="0" role="button" aria-label="Klicka för att vända kortet">';
      html += flipped
        ? '<div class="def">' + esc(item.def) + '</div>'
        : '<div><div class="term">' + esc(item.term) + '</div><span class="hint">Klicka för att se förklaringen</span></div>';
      html += '</div>';
      if (flipped) {
        html += '<div class="actions"><button type="button" class="btn ja" id="ja">✓ Kan detta</button><button type="button" class="btn nej" id="nej">Öva mer</button></div>';
      }
      html += '<p style="text-align:center;color:#6b7280;font-size:0.9rem;margin-top:0.8rem;">Kort ' + (idx + 1) + ' av ' + total + '</p>';
      stage.innerHTML = html;
      var card = document.getElementById('card');
      card.addEventListener('click', function () { flipped = !flipped; render(); });
      card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipped = !flipped; render(); } });
      var ja = document.getElementById('ja');
      if (ja) ja.addEventListener('click', function (e) { e.stopPropagation(); kan[level][order[idx]] = 1; idx++; flipped = false; render(); });
      var nej = document.getElementById('nej');
      if (nej) nej.addEventListener('click', function (e) { e.stopPropagation(); idx++; flipped = false; render(); });
    }

    document.getElementById('lvl1').addEventListener('click', function () { startLevel('1'); });
    document.getElementById('lvl2').addEventListener('click', function () { if (!this.disabled) startLevel('2'); });

    fetch('./data/begreppskort.json').then(function (r) { return r.json(); }).then(function (d) {
      DATA = d; startLevel('1');
    }).catch(function () {
      document.getElementById('stage').innerHTML = '<p>Korten kunde inte laddas. Ladda om sidan.</p>';
    });
  })();
  </script>
</body>
</html>
'''

BINGO = '''<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Begreppsbingo – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <style>
    __AREA__
    main { max-width: 640px; margin: 0 auto; }
    .intro-box { background:#fdf4ff; border:1px solid #f5d0fe; border-left:4px solid #86198f; border-radius:10px; padding:1rem 1.1rem; margin-bottom:1.25rem; }
    .intro-box p { margin:0.35rem 0; }
    .drawbox { background:#fff; border:2px solid #f5d0fe; border-radius:12px; padding:1rem 1.2rem; margin-bottom:1rem; min-height:70px; display:flex; align-items:center; }
    .drawbox p { margin:0; font-size:1.05rem; }
    .actions { display:flex; gap:0.6rem; flex-wrap:wrap; margin-bottom:1.2rem; }
    .btn { font:inherit; font-weight:700; padding:0.6rem 1.2rem; min-height:44px; border-radius:10px; cursor:pointer; border:2px solid #86198f; background:#86198f; color:#fff; }
    .btn.sek { background:#fff; color:#86198f; }
    .btn[disabled] { opacity:0.5; cursor:not-allowed; }
    .btn:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:0.4rem; }
    .cell { aspect-ratio:1; min-width:0; overflow-wrap:break-word; border:2px solid #f0abfc; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; text-align:center; font-size:0.82rem; font-weight:600; color:#1f2937; padding:0.3rem; cursor:pointer; }
    .cell:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }
    .cell.marked { background:#86198f; color:#fff; border-color:#86198f; }
    .cell.win { background:#166534; border-color:#166534; color:#fff; }
    .status { margin-top:1rem; font-weight:700; color:#166534; min-height:1.4rem; }
    @media (max-width: 420px) { .cell { font-size:0.72rem; } }
  </style>
</head>
<body class="area-matens-kemi">
  <header class="kemi-header">
    <h1>Begreppsbingo</h1>
    <p>Matens kemi</p>
  </header>

  <button class="hamburger" onclick="toggleMenu()" aria-label="Öppna menyn">☰</button>
  <nav id="side-menu"></nav>

  <main>
    <div class="page-actions no-print">
      <a href="./larande-spel.html" class="subject-btn">← Tillbaka till spelen</a>
      <a href="./studieguide.html" class="subject-btn">📖 Studieguiden</a>
    </div>

    <section class="intro-box">
      <p><strong>Så här gör du:</strong> klicka <em>Dra en förklaring</em>. Hitta begreppet på din bricka som förklaringen passar och klicka på rutan för att markera den. Få fyra i rad (vågrätt, lodrätt eller diagonalt) för att vinna! Enspelarversion – spela själv eller turas om i klassen med en gemensam skärm.</p>
    </section>

    <div class="drawbox" role="status" aria-live="polite"><p id="draw">Klicka på "Dra en förklaring" för att börja.</p></div>
    <div class="actions">
      <button type="button" class="btn" id="drawbtn">🎲 Dra en förklaring</button>
      <button type="button" class="btn sek" id="newgame">Ny bricka</button>
    </div>

    <div class="grid" id="grid" role="group" aria-label="Bingobricka"></div>
    <p class="status" id="status" role="status" aria-live="polite"></p>
  </main>

  <script src="/js/menu.js"></script>
  <script>
  (function () {
    var ALL = [], board = [], marked = [], drawn = [], remaining = [], won = false;

    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function newGame() {
      board = shuffle(ALL).slice(0, 16);
      marked = board.map(function () { return false; });
      remaining = board.map(function (_, i) { return i; });
      drawn = []; won = false;
      document.getElementById('draw').textContent = 'Klicka på "Dra en förklaring" för att börja.';
      document.getElementById('status').textContent = '';
      renderGrid();
    }

    function renderGrid() {
      var grid = document.getElementById('grid');
      grid.innerHTML = '';
      board.forEach(function (item, i) {
        var d = document.createElement('div');
        d.className = 'cell' + (marked[i] ? ' marked' : '');
        d.textContent = item.term;
        d.tabIndex = 0;
        d.setAttribute('role', 'button');
        d.setAttribute('aria-pressed', marked[i] ? 'true' : 'false');
        d.addEventListener('click', function () { toggle(i); });
        d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } });
        grid.appendChild(d);
      });
    }

    function toggle(i) {
      if (won) return;
      marked[i] = !marked[i];
      renderGrid();
      checkWin();
    }

    function checkWin() {
      for (var r = 0; r < 4; r++) { if ([0, 1, 2, 3].every(function (c) { return marked[r * 4 + c]; })) return win();
      }
      for (var c = 0; c < 4; c++) { if ([0, 1, 2, 3].every(function (r) { return marked[r * 4 + c]; })) return win();
      }
      if ([0, 5, 10, 15].every(function (i) { return marked[i]; })) return win();
      if ([3, 6, 9, 12].every(function (i) { return marked[i]; })) return win();
    }

    function win() {
      won = true;
      document.getElementById('status').textContent = '🎉 Bingo! Klicka "Ny bricka" för att spela igen.';
    }

    document.getElementById('drawbtn').addEventListener('click', function () {
      if (!remaining.length) { document.getElementById('draw').textContent = 'Alla förklaringar är dragna.'; return; }
      var pick = remaining.splice(Math.floor(Math.random() * remaining.length), 1)[0];
      drawn.push(pick);
      document.getElementById('draw').innerHTML = '<strong>Förklaring ' + drawn.length + ':</strong> ' + esc(board[pick].def);
    });
    document.getElementById('newgame').addEventListener('click', newGame);

    fetch('./data/begreppskort.json').then(function (r) { return r.json(); }).then(function (d) {
      ALL = d.levels['1'].concat(d.levels['2'] || []);
      newGame();
    }).catch(function () {
      document.getElementById('grid').innerHTML = '<p>Begreppen kunde inte laddas. Ladda om sidan.</p>';
    });
  })();
  </script>
</body>
</html>
'''

if __name__ == "__main__":
    write("begreppskort.html", KORT.replace("__AREA__", AREA))
    write("begrepp-bingo.html", BINGO.replace("__AREA__", AREA))
