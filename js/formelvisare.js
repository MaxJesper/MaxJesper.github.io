/*!
 * formelvisare.js – kulbilder av atomer/molekyler + interaktiva formelverktyg (kemi)
 * ---------------------------------------------------------------------------------------------
 * Delad komponent (kemi/atomer, senare fler områden). Ingen WebGL – ren SVG, så många figurer får plats på en sida.
 *
 *   KemiFormel.figure(f, n, opts)      SVG-sträng: n stycken f (t.ex. 'H2O') som kulor med bokstav i varje kula
 *   KemiFormel.sub('2 H_2O')           '_2' -> <sub>2</sub>  (formler i JSON/HTML skrivs H_2O)
 *   KemiFormel.count('C6H12O6')        {C:6,H:12,O:6}
 *   KemiFormel.species                 alla kända ämnen (nyckel -> {namn, atom?, …})
 *   KemiFormel.verkstad(el, opts)      "Formelverkstaden": välj ämne + antal, se kulbild och atomräkning
 *   KemiFormel.balance(el, spec)       "Balansera reaktionen": ställ in koefficienter, se atomräkning per grundämne
 *   KemiFormel.mulberry(seed)          liten slumpgenerator med frö (för ark som kan återskapas)
 *
 * Markup för verktygen i en studieguide (initieras automatiskt):
 *   <div data-fv="verkstad" data-species="O,O2,H2O,CO2,NH3,CH4"></div>
 *   <div data-fv="balance" data-reaction='{"left":["H2","O2"],"right":["H2O"],"solution":[2,1,2]}'></div>
 *
 * Tillgänglighet: varje kula har BOKSTAV (färg är aldrig ensam bärare av information); alla ändringar
 * meddelas i en aria-live-yta; steg-knapparna är riktiga <button> med etiketter.
 */
(function () {
  'use strict';

  // ---------- data ----------
  var STYLE = {          // radie (px), fyllning, kant, bokstavsfärg (kontrast bokstav/fyllning >= 4,5:1)
    H:  { r: 13,   fill: '#ffffff', stroke: '#444444', ink: '#111111', namn: 'väte' },
    C:  { r: 19,   fill: '#4d4d4d', stroke: '#222222', ink: '#ffffff', namn: 'kol' },
    N:  { r: 18.5, fill: '#3050f8', stroke: '#1a2fa8', ink: '#ffffff', namn: 'kväve' },
    O:  { r: 18,   fill: '#e01010', stroke: '#8a0a0a', ink: '#ffffff', namn: 'syre' },
    Cl: { r: 22,   fill: '#22b422', stroke: '#137013', ink: '#111111', namn: 'klor' }
  };
  var ATOM_NAME = { H: ['väteatom', 'väteatomer'], C: ['kolatom', 'kolatomer'], N: ['kväveatom', 'kväveatomer'], O: ['syreatom', 'syreatomer'], Cl: ['kloratom', 'kloratomer'] };

  // form: chain (rad), bent (central atom + två i vinkel), star (central atom + n runtom)
  var SPECIES = {
    H:   { namn: 'väteatom', atom: true },
    C:   { namn: 'kolatom', atom: true },
    N:   { namn: 'kväveatom', atom: true },
    O:   { namn: 'syreatom', atom: true },
    Cl:  { namn: 'kloratom', atom: true },
    H2:  { namn: 'vätgas', molekyl: 'vätemolekyl', form: 'chain', a: ['H', 'H'] },
    O2:  { namn: 'syrgas', molekyl: 'syremolekyl', form: 'chain', a: ['O', 'O'] },
    N2:  { namn: 'kvävgas', molekyl: 'kvävemolekyl', form: 'chain', a: ['N', 'N'] },
    Cl2: { namn: 'klorgas', molekyl: 'klormolekyl', form: 'chain', a: ['Cl', 'Cl'] },
    HCl: { namn: 'väteklorid', molekyl: 'väteklorid-molekyl', form: 'chain', a: ['H', 'Cl'] },
    CO:  { namn: 'kolmonoxid', molekyl: 'kolmonoxid-molekyl', form: 'chain', a: ['C', 'O'] },
    CO2: { namn: 'koldioxid', molekyl: 'koldioxid-molekyl', form: 'chain', a: ['O', 'C', 'O'] },
    O3:  { namn: 'ozon', molekyl: 'ozonmolekyl', form: 'bent', c: 'O', l: ['O', 'O'] },
    H2O: { namn: 'vatten', molekyl: 'vattenmolekyl', form: 'bent', c: 'O', l: ['H', 'H'] },
    NH3: { namn: 'ammoniak', molekyl: 'ammoniakmolekyl', form: 'star', c: 'N', l: ['H', 'H', 'H'], ang: [150, 30, 270] },
    CH4: { namn: 'metan', molekyl: 'metanmolekyl', form: 'star', c: 'C', l: ['H', 'H', 'H', 'H'], ang: [45, 135, 225, 315] }
  };
  Object.keys(SPECIES).forEach(function (k) { SPECIES[k].f = k; });

  // ---------- hjälpfunktioner ----------
  function sub(s) { return String(s).replace(/_(\d+)/g, '<sub>$1</sub>'); }
  function formulaHtml(f) { return String(f).replace(/(\d+)/g, '<sub>$1</sub>'); }
  function uni(f) { return String(f).replace(/\d/g, function (d) { return '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089'.charAt(+d); }); }
  function fsub(f) { return String(f).replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>'); }
  function count(f) {
    var out = {}, re = /([A-Z][a-z]?)(\d*)/g, m;
    while ((m = re.exec(f))) out[m[1]] = (out[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
    return out;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var uid = 0;
  function nextId(p) { uid += 1; return p + uid; }

  // ---------- kulbilder ----------
  function bondDist(a, b) { return 0.85 * (STYLE[a].r + STYLE[b].r); }

  function layout(f) {
    var sp = SPECIES[f], atoms = [], i;
    if (sp.atom) return [{ el: f, x: 0, y: 0 }];
    if (sp.form === 'chain') {
      var x = 0;
      for (i = 0; i < sp.a.length; i++) {
        if (i > 0) x += bondDist(sp.a[i - 1], sp.a[i]);
        atoms.push({ el: sp.a[i], x: x, y: 0 });
      }
    } else if (sp.form === 'bent') {
      atoms.push({ el: sp.c, x: 0, y: 0 });
      var half = 52.25 * Math.PI / 180;
      [-1, 1].forEach(function (s, k) {
        var d = bondDist(sp.c, sp.l[k]);
        atoms.push({ el: sp.l[k], x: s * d * Math.sin(half), y: d * Math.cos(half) });
      });
    } else {
      atoms.push({ el: sp.c, x: 0, y: 0 });
      sp.l.forEach(function (el, k) {
        var d = bondDist(sp.c, el), a = sp.ang[k] * Math.PI / 180;
        atoms.push({ el: el, x: d * Math.cos(a), y: d * Math.sin(a) });
      });
    }
    return atoms;
  }

  function bbox(atoms) {
    var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    atoms.forEach(function (a) {
      var r = STYLE[a.el].r;
      b.x0 = Math.min(b.x0, a.x - r); b.x1 = Math.max(b.x1, a.x + r);
      b.y0 = Math.min(b.y0, a.y - r); b.y1 = Math.max(b.y1, a.y + r);
    });
    return b;
  }

  function ballSvg(a, ox, oy) {
    var st = STYLE[a.el], x = ox + a.x, y = oy + a.y;
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + st.r + '" fill="' + st.fill + '" stroke="' + st.stroke + '" stroke-width="1.6"/>' +
      '<circle cx="' + (x - st.r * 0.32).toFixed(1) + '" cy="' + (y - st.r * 0.36).toFixed(1) + '" r="' + (st.r * 0.28).toFixed(1) + '" fill="#fff" opacity="0.28"/>' +
      '<text x="' + x.toFixed(1) + '" y="' + (y + 0.5).toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="' +
      (a.el === 'Cl' ? st.r * 0.95 : st.r * 1.05).toFixed(1) + '" fill="' + st.ink + '">' + a.el + '</text>';
  }

  function describe(f, n) {
    var sp = SPECIES[f], c = count(f), parts = [];
    Object.keys(c).forEach(function (el) {
      var t = c[el] * n;
      parts.push(t + ' ' + ATOM_NAME[el][t === 1 ? 0 : 1]);
    });
    var enhet;
    if (sp.atom) enhet = n === 1 ? 'en ' + sp.namn : n + ' ' + ATOM_NAME[f][1];
    else enhet = n === 1 ? 'en ' + sp.molekyl : n + ' ' + sp.molekyl.replace(/molekyl$/, 'molekyler').replace(/-molekyl$/, '-molekyler');
    return 'Kulbild: ' + enhet + (sp.atom ? '' : ' (' + parts.join(', ') + ')') + '.';
  }

  /** SVG med n stycken f som kulor. opts: {maxWidth, scale, label} */
  function figure(f, n, opts) {
    opts = opts || {};
    var sp = SPECIES[f];
    if (!sp) return '';
    var atoms = layout(f), b = bbox(atoms);
    var w = b.x1 - b.x0, h = b.y1 - b.y0, gap = 16, pad = 4;
    var maxW = opts.maxWidth || 300;
    var cols = Math.max(1, Math.min(n, Math.floor((maxW - 2 * pad + gap) / (w + gap))));
    if (opts.maxHeight) {                       // välj antal kolumner som ger störst bild inom både maxWidth och maxHeight
      var best = 0, bc = cols, c, W0, H0, s0;
      for (c = 1; c <= n; c++) {
        W0 = c * w + (c - 1) * gap + 2 * pad; H0 = Math.ceil(n / c) * h + (Math.ceil(n / c) - 1) * gap + 2 * pad;
        s0 = Math.min(maxW / W0, opts.maxHeight / H0);
        if (s0 > best + 1e-9) { best = s0; bc = c; }
      }
      cols = bc;
    }
    var rows = Math.ceil(n / cols);
    var W = cols * w + (cols - 1) * gap + 2 * pad, H = rows * h + (rows - 1) * gap + 2 * pad, out = [], i;
    var order = atoms.slice().sort(function (p, q) { return STYLE[q.el].r - STYLE[p.el].r; });   // stora kulor bakom, små framför
    for (i = 0; i < n; i++) {
      var col = i % cols, row = Math.floor(i / cols);
      var rowCount = (row === rows - 1) ? (n - row * cols) : cols;
      var shift = (cols - rowCount) * (w + gap) / 2;                      // centrera sista raden
      var ox = pad + shift + col * (w + gap) - b.x0, oy = pad + row * (h + gap) - b.y0;
      out.push('<g>' + order.map(function (a) { return ballSvg(a, ox, oy); }).join('') + '</g>');
    }
    var sc = opts.scale || 1;
    if (opts.maxHeight) sc = Math.min(sc, opts.maxHeight / H, maxW / W);
    var label = opts.label || describe(f, n);
    return '<svg class="fv-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1) + '" width="' + (W * sc).toFixed(0) + '" height="' + (H * sc).toFixed(0) +
      '" role="img" aria-label="' + esc(label) + '">' + out.join('') + '</svg>';
  }

  // ---------- Formelverkstaden ----------
  function verkstad(root, opts) {
    opts = opts || {};
    var keys = (opts.species || 'O,O2,H2O,CO2,NH3,CH4').split(',').map(function (s) { return s.trim(); }).filter(function (k) { return SPECIES[k]; });
    var id = nextId('fv'), state = { f: opts.start || keys[0], n: opts.n || 2 };
    root.classList.add('fv-widget');
    root.innerHTML =
      '<div class="fv-controls">' +
        '<label class="fv-field"><span>Ämne</span><select id="' + id + '-sel">' +
          keys.map(function (k) { return '<option value="' + k + '">' + esc(uni(SPECIES[k].f)) + ' – ' + esc(SPECIES[k].namn) + '</option>'; }).join('') +
        '</select></label>' +
        '<div class="fv-field"><span id="' + id + '-lbl">Antal (stora siffran framför)</span>' +
          '<div class="fv-stepper" role="group" aria-labelledby="' + id + '-lbl">' +
            '<button type="button" class="fv-minus" aria-label="Minska antalet">−</button>' +
            '<output class="fv-n" id="' + id + '-n">2</output>' +
            '<button type="button" class="fv-plus" aria-label="Öka antalet">+</button>' +
          '</div></div>' +
      '</div>' +
      '<div class="fv-formula" aria-hidden="true"></div>' +
      '<div class="fv-figure"></div>' +
      '<div class="fv-count"></div>' +
      '<p class="fv-text" role="status" aria-live="polite"></p>';
    var sel = root.querySelector('select'), out = root.querySelector('.fv-n');
    sel.value = state.f;

    function render(announce) {
      var f = state.f, n = state.n, sp = SPECIES[f], c = count(f);
      out.textContent = n;
      var fhtml = f.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub class="fv-idx">$2</sub>');
      root.querySelector('.fv-formula').innerHTML =
        (n > 1 ? '<span class="fv-coef">' + n + '</span> ' : '') + '<span class="fv-f">' + fhtml + '</span>' +
        '<div class="fv-legend">' + (n > 1 ? '<span><b class="fv-coef">' + n + '</b> = antal ' + (sp.atom ? 'atomer' : 'molekyler') + '</span>' : '') +
        (/\d/.test(f) ? '<span><b class="fv-idx-b">liten nedsänkt siffra</b> = antal atomer av den sorten i <em>en</em> molekyl</span>' : '') + '</div>';
      root.querySelector('.fv-figure').innerHTML = figure(f, n, { maxWidth: opts.maxWidth || 320 });
      var total = 0, rows = '';
      Object.keys(c).forEach(function (el) {
        var t = c[el] * n; total += t;
        rows += '<tr><th scope="row">' + el + ' (' + STYLE[el].namn + ')</th><td>' + (sp.atom ? '' : c[el] + ' × ') + n + ' = <strong>' + t + '</strong></td></tr>';
      });
      root.querySelector('.fv-count').innerHTML =
        '<table><caption class="fv-sr">Antal atomer</caption><thead><tr><th scope="col">Atomsort</th><th scope="col">' + (sp.atom ? 'Antal atomer' : 'Atomer per molekyl × antal molekyler') + '</th></tr></thead><tbody>' + rows +
        '<tr class="fv-total"><th scope="row">Totalt</th><td><strong>' + total + '</strong> ' + (total === 1 ? 'atom' : 'atomer') + '</td></tr></tbody></table>';
      var txt, fh = f.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');
      if (sp.atom) txt = (n === 1 ? fh + ' är en enda ' + sp.namn + '.' : n + ' ' + fh + ' är ' + n + ' separata ' + ATOM_NAME[f][1] + ' som inte sitter ihop.');
      else {
        var per = Object.keys(c).map(function (el) { return c[el] + ' ' + el; }).join(' och ');
        txt = (n === 1 ? fh + ' är en ' + sp.molekyl + ' med ' + per + '.' :
          n + ' ' + fh + ' är ' + n + ' ' + sp.molekyl.replace(/molekyl$/, 'molekyler') + '. Varje molekyl har ' + per + ', så tillsammans är det ' + total + ' atomer.');
      }
      root.querySelector('.fv-text').innerHTML = txt;
      root.querySelector('.fv-minus').disabled = n <= 1;
      root.querySelector('.fv-plus').disabled = n >= 6;
    }
    root.querySelector('.fv-minus').addEventListener('click', function () { if (state.n > 1) { state.n--; render(); } });
    root.querySelector('.fv-plus').addEventListener('click', function () { if (state.n < 6) { state.n++; render(); } });
    sel.addEventListener('change', function () { state.f = sel.value; render(); });
    render(false);
  }

  // ---------- Balansera reaktionen ----------
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  function balance(root, spec) {
    var id = nextId('bal');
    var left = spec.left, right = spec.right, sol = spec.solution;
    var all = left.concat(right);
    var coefs = (spec.start || all.map(function () { return 1; })).slice();
    root.classList.add('fv-widget', 'fv-balance');
    function part(f, i) {
      return '<div class="fv-term">' +
        '<div class="fv-stepper" role="group" aria-label="Antal ' + esc(f) + '">' +
          '<button type="button" data-i="' + i + '" data-d="-1" aria-label="Minska antalet ' + esc(f) + '">−</button>' +
          '<output id="' + id + '-c' + i + '">1</output>' +
          '<button type="button" data-i="' + i + '" data-d="1" aria-label="Öka antalet ' + esc(f) + '">+</button>' +
        '</div>' +
        '<div class="fv-tf" aria-hidden="true">' + f.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>') + '</div>' +
        '<div class="fv-tfig" id="' + id + '-f' + i + '"></div>' +
      '</div>';
    }
    var html = '<div class="fv-reaction">';
    left.forEach(function (f, i) { html += (i ? '<span class="fv-op" aria-hidden="true">+</span>' : '') + part(f, i); });
    html += '<span class="fv-arrow" aria-label="ger" role="img">→</span>';
    right.forEach(function (f, j) { html += (j ? '<span class="fv-op" aria-hidden="true">+</span>' : '') + part(f, left.length + j); });
    html += '</div><div class="fv-balcount"></div><p class="fv-text fv-status" role="status" aria-live="polite"></p>';
    if (spec.tip) html += '<details class="fv-tip"><summary>Tips</summary><p>' + sub(spec.tip) + '</p></details>';
    root.innerHTML = html;

    function totals(list, off) {
      var t = {};
      list.forEach(function (f, i) {
        var c = count(f);
        Object.keys(c).forEach(function (el) { t[el] = (t[el] || 0) + c[el] * coefs[off + i]; });
      });
      return t;
    }
    function render() {
      all.forEach(function (f, i) {
        root.querySelector('#' + id + '-c' + i).textContent = coefs[i];
        root.querySelector('#' + id + '-f' + i).innerHTML = figure(f, coefs[i], { maxWidth: 150, scale: 0.85 });
      });
      var L = totals(left, 0), R = totals(right, left.length), els = Object.keys(L).concat(Object.keys(R).filter(function (e) { return !(e in L); }));
      var ok = true, rows = '', msgs = [];
      els.forEach(function (el) {
        var l = L[el] || 0, r = R[el] || 0, same = l === r;
        if (!same) { ok = false; msgs.push(el + ': ' + l + ' till vänster, ' + r + ' till höger'); }
        rows += '<tr><th scope="row">' + el + ' (' + STYLE[el].namn + ')</th><td>' + l + '</td><td>' + r + '</td><td class="' + (same ? 'fv-ok' : 'fv-bad') + '"><span aria-hidden="true">' + (same ? '✓' : '✗') + '</span> ' + (same ? 'lika' : 'olika') + '</td></tr>';
      });
      root.querySelector('.fv-balcount').innerHTML = '<table><caption class="fv-sr">Atomer före och efter reaktionen</caption><thead><tr><th scope="col">Atomsort</th><th scope="col">Före (vänster)</th><th scope="col">Efter (höger)</th><th scope="col">Stämmer?</th></tr></thead><tbody>' + rows + '</tbody></table>';
      var g = coefs.reduce(gcd, 0), st = root.querySelector('.fv-status');
      st.className = 'fv-text fv-status';
      if (ok && g === 1) { st.textContent = '✓ Balanserad! Lika många atomer av varje sort före och efter – och siffrorna är de minsta möjliga.'; st.classList.add('fv-good'); root.dispatchEvent(new CustomEvent('fv:solved', { bubbles: true, detail: { coefs: coefs.slice() } })); }
      else if (ok) { st.textContent = '✓ Balanserad – men alla siffror kan delas med ' + g + '. Skriv reaktionen med de minsta hela talen.'; st.classList.add('fv-almost'); }
      else { st.textContent = '✗ Inte balanserad än – ' + msgs.join('; ') + '.'; }
    }
    root.addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('button[data-i]');
      if (!b || !root.contains(b)) return;
      var i = +b.dataset.i, d = +b.dataset.d;
      coefs[i] = Math.max(1, Math.min(9, coefs[i] + d));
      render();
    });
    render();
    root._fvSolution = sol;
  }

  // ---------- Statisk reaktionsbild ----------
  /** reaktion: {left:[[2,'H2'],[1,'O2']], right:[[2,'H2O']]} -> pil-bild med kulor + atomräkning (ingen interaktion) */
  function reaction(root, spec) {
    root.classList.add('fv-widget', 'fv-balance');
    function side(list, off) {
      return list.map(function (t, i) {
        var n = t[0], f = t[1];
        return (i ? '<span class="fv-op" aria-hidden="true">+</span>' : '') +
          '<div class="fv-term"><div class="fv-tf">' + (n > 1 ? '<span class="fv-coefw">' + n + '</span> ' : '') + fsub(f) + '</div><div class="fv-tfig">' + figure(f, n, { maxWidth: 190, scale: 0.85 }) + '</div></div>';
      }).join('');
    }
    function tot(list) { var t = {}; list.forEach(function (x) { var c = count(x[1]); Object.keys(c).forEach(function (e) { t[e] = (t[e] || 0) + c[e] * x[0]; }); }); return t; }
    var L = tot(spec.left), R = tot(spec.right), rows = '';
    Object.keys(L).forEach(function (e) {
      rows += '<tr><th scope="row">' + e + ' (' + STYLE[e].namn + ')</th><td>' + L[e] + '</td><td>' + (R[e] || 0) + '</td><td class="fv-ok"><span aria-hidden="true">✓</span> lika</td></tr>';
    });
    root.innerHTML = '<div class="fv-reaction">' + side(spec.left) + '<span class="fv-arrow" role="img" aria-label="ger">→</span>' + side(spec.right) + '</div>' +
      '<div class="fv-balcount"><table><caption class="fv-sr">Atomer före och efter reaktionen</caption><thead><tr><th scope="col">Atomsort</th><th scope="col">Före</th><th scope="col">Efter</th><th scope="col">Stämmer?</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }


  // ---------- Formel med stor siffra (koefficient) och index i löpande text ----------
  /** fmt('2 H2O') -> <span class="fx"><b class="coef">2</b>&nbsp;H<sub class="idx">2</sub>O</span> (klass .fx i formelvisare.css) */
  function fmt(s) {
    var m = /^(\d+)\s+(.+)$/.exec(String(s)), coef = m ? m[1] : null, body = m ? m[2] : String(s);
    body = body.replace(/([A-Za-z)])(\d+)/g, '$1<sub class="idx">$2</sub>');
    return '<span class="fx">' + (coef && coef !== '1' ? '<b class="coef">' + coef + '</b>&nbsp;' : '') + body + '</span>';
  }

  // ---------- Räknemaskinen: slumpade räkneuppgifter om stor siffra och index ----------
  /** raknare(el, {antal:10, arter:'H2,O2,…'}) – frågor om hur många atomer/molekyler; direkt återkoppling med förklaring. */
  function raknare(root, opts) {
    opts = opts || {};
    var arter = (opts.arter || 'H2,O2,N2,Cl2,H2O,CO2,NH3,CH4,HCl').split(',').filter(function (k) { return SPECIES[k] && !SPECIES[k].atom; });
    var total = opts.antal || 10, id = nextId('rk'), q, st;
    root.classList.add('fv-widget', 'fv-raknare');
    function rnd(n) { return Math.floor(Math.random() * n); }
    function pick(a) { return a[rnd(a.length)]; }
    function makeQ() {
      var f = pick(arter), n = 2 + rnd(3), c = count(f), els = Object.keys(c), type = pick(['atomsort', 'atomsort', 'totalt', 'koef', 'index']);
      var multi = els.filter(function (e) { return c[e] > 1; });
      if (type === 'index' && !multi.length) type = 'totalt';
      var el = type === 'index' ? pick(multi) : pick(els);
      if (type === 'atomsort') return { type: type, f: f, n: n, el: el, ans: c[el] * n, fig: false,
        q: 'Hur många ' + ATOM_NAME[el][1] + ' (' + el + ') finns det tillsammans i ' + fmt(n + ' ' + f) + '?',
        why: 'Multiplicera: ' + n + ' molekyler × ' + c[el] + ' ' + el + ' per molekyl = ' + (c[el] * n) + ' ' + el + '.' };
      if (type === 'totalt') { var per = els.reduce(function (a, e) { return a + c[e]; }, 0);
        return { type: type, f: f, n: n, ans: per * n, q: 'Hur många atomer finns det <em>totalt</em> i ' + fmt(n + ' ' + f) + '?',
          why: 'En molekyl ' + fmt(f) + ' har ' + per + ' atomer. ' + n + ' × ' + per + ' = ' + (per * n) + '.' }; }
      if (type === 'koef') return { type: type, f: f, n: n, ans: n, fig: true, q: 'Bilden visar molekyler av ' + fmt(f) + '. Vilken <strong>stora siffra</strong> ska stå framför formeln?',
        why: 'Räkna molekylerna (grupperna av kulor): det är ' + n + ' stycken, så ' + fmt(n + ' ' + f) + '.' };
      return { type: type, f: f, n: 1, el: el, ans: c[el], fig: true, q: 'Bilden visar en molekyl av ' + fmt(f) + '. Vilken <strong>nedsänkt siffra</strong> ska stå efter ' + el + ' i formeln?',
        why: 'Räkna ' + el + '-kulorna i en molekyl: ' + c[el] + '. Det är den nedsänkta siffran.' };
    }
    function next(noFocus) {
      if (st.i >= total) return end();
      q = makeQ(); st.answered = false;
      var figN = q.type === 'koef' ? q.n : (q.type === 'index' ? 1 : 0);
      root.innerHTML = '<div class="fv-rk-head"><span>Fråga ' + (st.i + 1) + ' av ' + total + '</span><span>Rätt på första försöket: <strong>' + st.right + '</strong></span></div>' +
        '<p class="fv-rk-q" id="' + id + '-q">' + q.q + '</p>' +
        (q.fig ? '<div class="fv-figure">' + figure(q.f, figN, { maxWidth: 340, scale: 1.4, label: 'Kulbild för frågan' }) + '</div>' : '') +
        '<form class="fv-rk-form" novalidate><label for="' + id + '-a" class="fv-sr">Ditt svar (ett heltal)</label>' +
        '<input id="' + id + '-a" type="number" inputmode="numeric" min="0" max="99" aria-describedby="' + id + '-q"> ' +
        '<button type="submit" class="fv-btn">Kolla svaret</button></form>' +
        '<p class="fv-text" role="status" aria-live="polite"></p><div class="fv-rk-next"></div>';
      var form = root.querySelector('form'), inp = root.querySelector('input'), msg = root.querySelector('.fv-text');
      if (!noFocus) inp.focus();
      var tries = 0;
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (st.answered) return;
        if (inp.value === '') { msg.className = 'fv-text'; msg.textContent = 'Skriv ett tal först.'; return; }
        var v = parseInt(inp.value, 10);
        if (v === q.ans) {
          st.answered = true; if (!tries) st.right += 1;
          msg.className = 'fv-text fv-good'; msg.innerHTML = '✓ Rätt! ' + q.why;
          var nb = document.createElement('button'); nb.type = 'button'; nb.className = 'fv-btn'; nb.textContent = st.i + 1 >= total ? 'Se resultat' : 'Nästa fråga';
          nb.addEventListener('click', function () { st.i += 1; next(); });
          root.querySelector('.fv-rk-next').appendChild(nb); nb.focus();
          inp.readOnly = true; form.querySelector('button').disabled = true;
        } else {
          tries += 1;
          msg.className = 'fv-text fv-bad';
          msg.innerHTML = tries >= 2 ? '✗ Inte riktigt. ' + q.why + ' Skriv det rätta svaret (' + q.ans + ') för att gå vidare.' : '✗ Inte riktigt – försök en gång till. ' + (q.type === 'index' || q.type === 'koef' ? 'Titta på bilden igen.' : 'Multiplicera stor siffra med index.');
          inp.select();
        }
      });
    }
    function end() {
      root.innerHTML = '<p class="fv-rk-q"><strong>Klart!</strong> Du hade <strong>' + st.right + ' av ' + total + '</strong> rätt på första försöket.</p><button type="button" class="fv-btn">Kör en ny omgång</button>';
      root.querySelector('button').addEventListener('click', start);
      root.querySelector('button').focus();
      root.dispatchEvent(new CustomEvent('fv:raknare-klar', { bubbles: true, detail: { score: st.right, total: total } }));
    }
    function start(ev) { st = { i: 0, right: 0 }; next(!ev); }
    start();
  }

  // ---------- auto-init ----------
  function init() {
    document.querySelectorAll('[data-fv="verkstad"]').forEach(function (el) {
      if (!el._fvInit) { el._fvInit = 1; verkstad(el, { species: el.dataset.species, start: el.dataset.start, n: el.dataset.n ? +el.dataset.n : undefined }); }
    });
    document.querySelectorAll('[data-fv="figure"]').forEach(function (el) {
      if (el._fvInit) return; el._fvInit = 1;
      el.innerHTML = figure(el.dataset.f, +(el.dataset.n || 1), { maxWidth: +(el.dataset.maxw || 300), scale: +(el.dataset.scale || 1) });
    });
    document.querySelectorAll('[data-fv="reaction"]').forEach(function (el) {
      if (el._fvInit) return; el._fvInit = 1;
      try { reaction(el, JSON.parse(el.dataset.reaction)); } catch (e) { /* ignore */ }
    });
    document.querySelectorAll('[data-fv="raknare"]').forEach(function (el) {
      if (!el._fvInit) { el._fvInit = 1; raknare(el, { antal: el.dataset.antal ? +el.dataset.antal : undefined, arter: el.dataset.arter }); }
    });
    document.querySelectorAll('[data-fv="balance"]').forEach(function (el) {
      if (el._fvInit) return;
      el._fvInit = 1;
      var spec;
      try { spec = JSON.parse(el.dataset.reaction); } catch (e) { return; }
      if (el.dataset.tip) spec.tip = el.dataset.tip;
      if (el.dataset.start) spec.start = JSON.parse(el.dataset.start);
      balance(el, spec);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.KemiFormel = { fmt: fmt, raknare: raknare, figure: figure, sub: sub, formulaHtml: formulaHtml, count: count, species: SPECIES, style: STYLE, atomName: ATOM_NAME, verkstad: verkstad, balance: balance, reaction: reaction, fsub: fsub, uni: uni, mulberry: mulberry, describe: describe, esc: esc, init: init };
})();
