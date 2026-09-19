/*!
 * bygg-molekyl.js – "Bygg en molekyl": eleven lägger till atomer och knyter bindningar mellan dem.
 * Regel: varje atom har ett bestämt antal armar (H 1, Cl 1, O 2, N 3, C 4). En färdig molekyl har inga lediga armar och
 * alla atomer hänger ihop. Färdiga molekyler känns igen (namn, formel, strukturformel, roterbar 3D om vi har en modell).
 * Beroenden: js/formelvisare.js (KemiFormel), kemi/atomer/js/molmodeller.js (MOLDATA), js/molviewer.js (MolViewer, valfri 3D).
 */
(function () {
  'use strict';
  var KF = window.KemiFormel, ST = KF.style;
  var VAL = { H: 1, Cl: 1, O: 2, N: 3, C: 4 };
  var NAMN = { H: 'väte', C: 'kol', N: 'kväve', O: 'syre', Cl: 'klor' };
  var MAXATOMS = 10, W = 640, H = 360;

  // Kända molekyler: atomer + bindningar (index-index:ordning). key = nyckel i MOLDATA (3D) om det finns en modell.
  var KNOWN = [
    { id: 'h2', namn: 'vätgas', f: 'H2', a: 'H,H', b: '0-1:1', key: 'h2' },
    { id: 'cl2', namn: 'klorgas', f: 'Cl2', a: 'Cl,Cl', b: '0-1:1', key: 'cl2' },
    { id: 'o2', namn: 'syrgas', f: 'O2', a: 'O,O', b: '0-1:2', key: 'o2' },
    { id: 'n2', namn: 'kvävgas', f: 'N2', a: 'N,N', b: '0-1:3', key: 'n2' },
    { id: 'hcl', namn: 'väteklorid', f: 'HCl', a: 'H,Cl', b: '0-1:1', key: 'hcl' },
    { id: 'h2o', namn: 'vatten', f: 'H2O', a: 'O,H,H', b: '0-1:1,0-2:1', key: 'h2o' },
    { id: 'co2', namn: 'koldioxid', f: 'CO2', a: 'C,O,O', b: '0-1:2,0-2:2', key: 'co2' },
    { id: 'nh3', namn: 'ammoniak', f: 'NH3', a: 'N,H,H,H', b: '0-1:1,0-2:1,0-3:1', key: 'nh3' },
    { id: 'ch4', namn: 'metan', f: 'CH4', a: 'C,H,H,H,H', b: '0-1:1,0-2:1,0-3:1,0-4:1', key: 'ch4' },
    { id: 'h2o2', namn: 'väteperoxid', f: 'H2O2', a: 'H,O,O,H', b: '0-1:1,1-2:1,2-3:1' },
    { id: 'c2h6', namn: 'etan', f: 'C2H6', a: 'C,C,H,H,H,H,H,H', b: '0-1:1,0-2:1,0-3:1,0-4:1,1-5:1,1-6:1,1-7:1' },
    { id: 'c2h4', namn: 'eten', f: 'C2H4', a: 'C,C,H,H,H,H', b: '0-1:2,0-2:1,0-3:1,1-4:1,1-5:1' },
    { id: 'c2h2', namn: 'etyn', f: 'C2H2', a: 'C,C,H,H', b: '0-1:3,0-2:1,1-3:1' },
    { id: 'ch3cl', namn: 'klormetan', f: 'CH3Cl', a: 'C,H,H,H,Cl', b: '0-1:1,0-2:1,0-3:1,0-4:1' }
  ];
  var UPPGIFTER = ['h2o', 'co2', 'nh3', 'ch4', 'n2', 'o2', 'hcl', 'h2'];

  function parseRef(k) {
    var els = k.a.split(','), bonds = k.b.split(',').map(function (s) { var m = /^(\d+)-(\d+):(\d)$/.exec(s); return { a: +m[1], b: +m[2], order: +m[3] }; });
    return { atoms: els.map(function (e, i) { return { id: i, el: e }; }), bonds: bonds };
  }

  // Grafsignatur (Weisfeiler-Lehman): tillräckligt för de små molekylerna här.
  function signature(atoms, bonds) {
    var lab = {}, nb = {};
    atoms.forEach(function (a) { lab[a.id] = a.el; nb[a.id] = []; });
    bonds.forEach(function (b) { nb[b.a].push([b.b, b.order]); nb[b.b].push([b.a, b.order]); });
    for (var it = 0; it < 4; it++) {
      var nl = {};
      atoms.forEach(function (a) {
        nl[a.id] = lab[a.id] + '(' + nb[a.id].map(function (p) { return p[1] + ':' + lab[p[0]]; }).sort().join(',') + ')';
      });
      lab = nl;
    }
    return atoms.map(function (a) { return lab[a.id]; }).sort().join('|');
  }
  KNOWN.forEach(function (k) { var g = parseRef(k); k.sig = signature(g.atoms, g.bonds); });

  function hill(atoms) {
    var c = {}; atoms.forEach(function (a) { c[a.el] = (c[a.el] || 0) + 1; });
    var order = c.C ? ['C', 'H'] : [], rest = Object.keys(c).filter(function (e) { return order.indexOf(e) < 0; }).sort();
    return order.concat(rest).filter(function (e) { return c[e]; }).map(function (e) { return e + (c[e] > 1 ? c[e] : ''); }).join('');
  }

  function init(root) {
    var st = { atoms: [], bonds: [], sel: [], next: 1, task: null, done: {} };
    var svgNS = 'http://www.w3.org/2000/svg';
    root.innerHTML =
      '<div class="bm-tasks"><span class="bm-lab" id="bm-tl">Uppgift</span>' +
        '<div role="group" aria-labelledby="bm-tl" class="bm-taskbtns"></div></div>' +
      '<div class="bm-goal" role="status" aria-live="polite"></div>' +
      '<div class="bm-palette"><span class="bm-lab" id="bm-pl">Lägg till atom</span><div role="group" aria-labelledby="bm-pl" class="bm-pbtns"></div></div>' +
      '<div class="bm-canvas-wrap"><svg class="bm-svg" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Byggyta. Atomerna är knappar: välj en atom, sedan en till, och knyt en bindning."></svg></div>' +
      '<div class="bm-actions"></div>' +
      '<p class="bm-status" role="status" aria-live="polite"></p>' +
      '<details class="bm-list"><summary>Lista över atomer och bindningar (text)</summary><div class="bm-list-body"></div></details>' +
      '<div class="bm-result" hidden></div>';
    var svg = root.querySelector('.bm-svg'), status = root.querySelector('.bm-status'), goal = root.querySelector('.bm-goal');
    var actions = root.querySelector('.bm-actions'), result = root.querySelector('.bm-result');

    // Uppgiftsknappar
    var tb = root.querySelector('.bm-taskbtns');
    function taskBtn(id, html, label) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bm-btn bm-task'; b.dataset.task = id; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', label);
      b.innerHTML = html; tb.appendChild(b); return b;
    }
    taskBtn('fri', 'Fritt bygge', 'Fritt bygge');
    UPPGIFTER.forEach(function (id) {
      var k = KNOWN.filter(function (x) { return x.id === id; })[0];
      taskBtn(id, KF.fmt(k.f) + ' ' + k.namn, 'Bygg ' + k.namn + ' ' + k.f);
    });
    tb.addEventListener('click', function (ev) {
      var b = ev.target.closest('.bm-task'); if (!b) return;
      setTask(b.dataset.task); clearAll(true);
    });
    function setTask(id) {
      st.task = id === 'fri' ? null : id;
      tb.querySelectorAll('.bm-task').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.task === (id || 'fri') ? 'true' : 'false'); });
      var k = st.task && KNOWN.filter(function (x) { return x.id === st.task; })[0];
      goal.innerHTML = k ? '<strong>Uppgift:</strong> bygg en molekyl av <strong>' + k.namn + '</strong>, ' + KF.fmt(k.f) + '. Tips: räkna atomernas armar.' :
        '<strong>Fritt bygge:</strong> bygg vad du vill. En färdig molekyl har inga lediga armar och alla atomer hänger ihop.';
    }

    // Palett
    var pb = root.querySelector('.bm-pbtns');
    ['H', 'C', 'N', 'O', 'Cl'].forEach(function (el) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bm-btn bm-add'; b.dataset.el = el;
      b.setAttribute('aria-label', 'Lägg till ' + NAMN[el] + 'atom (' + el + ', ' + VAL[el] + (VAL[el] === 1 ? ' arm' : ' armar') + ')');
      b.innerHTML = '<span class="bm-dot" style="background:' + ST[el].fill + ';border-color:' + ST[el].stroke + ';color:' + ST[el].ink + '" aria-hidden="true">' + el + '</span> ' + NAMN[el] + ' <small>(' + VAL[el] + ')</small>';
      pb.appendChild(b);
    });
    pb.addEventListener('click', function (ev) {
      var b = ev.target.closest('.bm-add'); if (!b) return;
      addAtom(b.dataset.el);
    });

    function atomById(id) { return st.atoms.filter(function (a) { return a.id === id; })[0]; }
    function used(a) { return st.bonds.reduce(function (s, b) { return s + ((b.a === a.id || b.b === a.id) ? b.order : 0); }, 0); }
    function free(a) { return VAL[a.el] - used(a); }
    function bondBetween(x, y) { return st.bonds.filter(function (b) { return (b.a === x && b.b === y) || (b.a === y && b.b === x); })[0]; }
    function say(t) { status.innerHTML = t; }

    function addAtom(el) {
      if (st.atoms.length >= MAXATOMS) { say('Det får plats högst ' + MAXATOMS + ' atomer. Ta bort någon först.'); return; }
      var n = st.atoms.length, x = 80 + (n % 5) * 120 + Math.random() * 20, y = 90 + Math.floor(n / 5) * 150 + Math.random() * 20;
      var a = { id: st.next++, el: el, x: x, y: y }; st.atoms.push(a);
      st.sel = [a.id]; changed('Lade till ' + NAMN[el] + 'atom. Den har ' + VAL[el] + (VAL[el] === 1 ? ' arm' : ' armar') + '.');
    }
    function clearAll(quiet) {
      st.atoms = []; st.bonds = []; st.sel = []; st.next = 1;
      changed(quiet ? 'Byggytan är tom. Lägg till atomer.' : 'Rensade byggytan.');
    }

    function layout() {
      var A = st.atoms, i, j, it;
      for (it = 0; it < 60; it++) {
        A.forEach(function (a) { a.fx = 0; a.fy = 0; });
        for (i = 0; i < A.length; i++) for (j = i + 1; j < A.length; j++) {
          var dx = A[i].x - A[j].x, dy = A[i].y - A[j].y, d = Math.max(8, Math.hypot(dx, dy)), f = 3600 / (d * d);
          A[i].fx += f * dx / d; A[i].fy += f * dy / d; A[j].fx -= f * dx / d; A[j].fy -= f * dy / d;
        }
        st.bonds.forEach(function (b) {
          var p = atomById(b.a), q = atomById(b.b), dx = q.x - p.x, dy = q.y - p.y, d = Math.max(1, Math.hypot(dx, dy)), f = (d - 78) * 0.05;
          p.fx += f * dx / d; p.fy += f * dy / d; q.fx -= f * dx / d; q.fy -= f * dy / d;
        });
        A.forEach(function (a) {
          a.fx += (W / 2 - a.x) * 0.004; a.fy += (H / 2 - a.y) * 0.004;
          a.x = Math.max(34, Math.min(W - 34, a.x + Math.max(-6, Math.min(6, a.fx))));
          a.y = Math.max(34, Math.min(H - 34, a.y + Math.max(-6, Math.min(6, a.fy))));
        });
      }
    }

    function names(a) { return NAMN[a.el] + 'atom ' + (st.atoms.indexOf(a) + 1); }

    function draw() {
      var h = '';
      st.bonds.forEach(function (b) {
        var p = atomById(b.a), q = atomById(b.b), dx = q.x - p.x, dy = q.y - p.y, d = Math.max(1, Math.hypot(dx, dy)), nx = -dy / d, ny = dx / d, offs = b.order === 1 ? [0] : b.order === 2 ? [-3.5, 3.5] : [-6, 0, 6];
        offs.forEach(function (o) { h += '<line x1="' + (p.x + nx * o).toFixed(1) + '" y1="' + (p.y + ny * o).toFixed(1) + '" x2="' + (q.x + nx * o).toFixed(1) + '" y2="' + (q.y + ny * o).toFixed(1) + '" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>'; });
      });
      st.atoms.forEach(function (a, i) {
        var s = ST[a.el], r = a.el === 'H' ? 20 : 25, fr = free(a), sel = st.sel.indexOf(a.id) >= 0;
        h += '<g class="bm-atom" data-id="' + a.id + '" tabindex="0" role="button" aria-pressed="' + sel + '" aria-label="' + names(a) + ', ' + fr + (fr === 1 ? ' ledig arm' : ' lediga armar') + (sel ? ', vald' : '') + '" transform="translate(' + a.x.toFixed(1) + ',' + a.y.toFixed(1) + ')">' +
          (sel ? '<circle r="' + (r + 7) + '" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-dasharray="6 3"/>' : '') +
          '<circle r="' + r + '" fill="' + s.fill + '" stroke="' + s.stroke + '" stroke-width="2"/>' +
          '<text text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="' + (a.el === 'Cl' ? 17 : 20) + '" fill="' + s.ink + '">' + a.el + '</text>' +
          '<g transform="translate(' + (r - 2) + ',' + (-r + 2) + ')" aria-hidden="true"><circle r="10" fill="' + (fr === 0 ? '#ecfdf5' : '#fff') + '" stroke="' + (fr === 0 ? '#15803d' : '#5b6478') + '" stroke-width="1.5"/>' +
          '<text text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#1a1a2e">' + (fr === 0 ? '✓' : fr) + '</text></g></g>';
      });
      if (!st.atoms.length) h += '<text x="' + W / 2 + '" y="' + H / 2 + '" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#333a4a">Lägg till atomer med knapparna ovanför.</text>';
      svg.innerHTML = h;
    }

    function renderActions() {
      var sel = st.sel.map(atomById).filter(Boolean), h = '';
      if (sel.length === 1) {
        h += '<span>Vald: <strong>' + names(sel[0]) + '</strong>. Välj en andra atom för att binda ihop dem, eller</span> ' +
          '<button type="button" class="bm-btn bm-small" data-act="del">Ta bort atomen</button> <button type="button" class="bm-btn bm-small" data-act="desel">Avmarkera</button>';
      } else if (sel.length === 2) {
        var bd = bondBetween(sel[0].id, sel[1].id), o = bd ? bd.order : 0;
        h += '<span>Valda: <strong>' + names(sel[0]) + '</strong> och <strong>' + names(sel[1]) + '</strong>. Bindning nu: <strong>' + (['ingen', 'enkel', 'dubbel', 'trippel'][o]) + '</strong>.</span> ' +
          '<button type="button" class="bm-btn bm-small" data-act="more"' + (o >= 3 || free(sel[0]) < 1 || free(sel[1]) < 1 ? ' disabled' : '') + '>Fler streck (+)</button> ' +
          '<button type="button" class="bm-btn bm-small" data-act="less"' + (o < 1 ? ' disabled' : '') + '>Färre streck (−)</button> ' +
          '<button type="button" class="bm-btn bm-small" data-act="desel">Avmarkera</button>';
      } else if (st.atoms.length) {
        h += '<span>Välj en atom (klicka eller Enter) för att börja knyta bindningar.</span>';
      }
      if (st.atoms.length) h += ' <button type="button" class="bm-btn bm-small bm-clear" data-act="clear">Rensa allt</button>';
      var had = actions.contains(document.activeElement) ? document.activeElement.getAttribute('data-act') : null;
      actions.innerHTML = h;
      if (had) {
        // Knappen som hade fokus finns kanske inte längre: flytta fokus till något ofarligt (aldrig till "Rensa allt")
        var nb = (had === 'more' || had === 'less') ? (actions.querySelector('[data-act="' + had + '"]:not([disabled])') || actions.querySelector('[data-act="more"]:not([disabled]),[data-act="less"]:not([disabled])')) : null;
        if (nb) nb.focus();
        else { var g0 = svg.querySelector('.bm-atom'); if (g0) g0.focus(); }
      }
    }

    function renderList() {
      var body = root.querySelector('.bm-list-body');
      if (!st.atoms.length) { body.innerHTML = '<p>Inga atomer ännu.</p>'; return; }
      body.innerHTML = '<ul>' + st.atoms.map(function (a) { return '<li>' + names(a) + ' (' + a.el + '): ' + free(a) + ' lediga armar av ' + VAL[a.el] + '.</li>'; }).join('') + '</ul>' +
        (st.bonds.length ? '<p>Bindningar:</p><ul>' + st.bonds.map(function (b) { var p = atomById(b.a), q = atomById(b.b); return '<li>' + names(p) + ' – ' + names(q) + ': ' + ['', 'enkelbindning', 'dubbelbindning', 'trippelbindning'][b.order] + '.</li>'; }).join('') + '</ul>' : '<p>Inga bindningar ännu.</p>');
    }

    function connected() {
      if (!st.atoms.length) return false;
      var seen = {}, stack = [st.atoms[0].id];
      while (stack.length) {
        var x = stack.pop(); if (seen[x]) continue; seen[x] = 1;
        st.bonds.forEach(function (b) { if (b.a === x && !seen[b.b]) stack.push(b.b); if (b.b === x && !seen[b.a]) stack.push(b.a); });
      }
      return Object.keys(seen).length === st.atoms.length;
    }

    function evaluate(msg) {
      result.hidden = true; result.innerHTML = '';
      if (window.MolViewer) root.querySelectorAll('.km-viewerbox').forEach(function (e) { MolViewer.destroy(e); });
      if (!st.atoms.length) return;
      var freeSum = st.atoms.reduce(function (s, a) { return s + free(a); }, 0), conn = connected();
      if (st.atoms.length === 1) return;
      if (freeSum === 0 && conn) {
        var sig = signature(st.atoms, st.bonds), k = KNOWN.filter(function (x) { return x.sig === sig; })[0], f = hill(st.atoms);
        var html = '<h3 class="bm-h">Färdig molekyl!</h3><p>Alla atomer hänger ihop och har inga lediga armar. Molekylformeln blir <strong>' + KF.fmt(f) + '</strong>.</p>';
        var success = false;
        if (k) {
          html += '<p>Du har byggt <strong>' + k.namn + '</strong>, ' + KF.fmt(k.f) + '.</p>';
          if (st.task) {
            if (k.id === st.task) { success = true; html += '<p class="bm-good">✓ Rätt – det var precis vad uppgiften bad om!</p>'; st.done[k.id] = 1; markDone(); }
            else { var t = KNOWN.filter(function (x) { return x.id === st.task; })[0]; html += '<p class="bm-bad">✗ Det är en giltig molekyl, men uppgiften var att bygga ' + t.namn + ' (' + KF.fmt(t.f) + '). Bygg om eller välj en ny uppgift.</p>'; }
          }
        } else {
          html += '<p>Det här är en giltig molekyl, men vi har ingen 3D-modell av den i det här kapitlet' + (st.task ? ' – och uppgiften var något annat.' : '.') + '</p>';
          if (st.task) html += '<p class="bm-bad">✗ Uppgiften var att bygga ' + KNOWN.filter(function (x) { return x.id === st.task; })[0].namn + '.</p>';
        }
        html += (k && KF.species[k.f] ? '<div class="bm-figrow">' + KF.figure(k.f, 1, { scale: 1.6, label: 'Kulbild av ' + k.namn + ' (' + k.f + ')' }) + '</div>' : '');
        if (k && k.key) {
          var info = (window.MOLDATA && MOLDATA.info[k.key]) || {};
          html += '<div class="bm-3d"><div class="km-viewerbox mc-viewer" data-mol="' + k.key + '" role="group" tabindex="0" aria-label="' + (info.alt3d || '3D-modell') + ' Piltangenter roterar, plus och minus zoomar." style="height:220px"></div><div class="km-hint">Dra för att rotera.</div></div>';
        }
        result.innerHTML = html; result.hidden = false;
        if (k && k.key && window.MolViewer) MolViewer.mount(result);
        say((msg ? msg + ' ' : '') + '<span class="bm-good">✓ Färdig molekyl.</span>');
        if (success) root.dispatchEvent(new CustomEvent('bm:klar', { bubbles: true, detail: { id: k.id } }));
      } else {
        var left = st.atoms.filter(function (a) { return free(a) > 0; });
        say((msg ? msg + ' ' : '') + (freeSum ? 'Lediga armar kvar: <strong>' + freeSum + '</strong> (' + left.map(function (a) { return names(a) + ': ' + free(a); }).join(', ') + '). ' : '') + (conn ? '' : 'Alla atomer hänger inte ihop än. ') + 'Formel hittills: ' + KF.fmt(hill(st.atoms)) + '.');
      }
    }
    function markDone() {
      var n = Object.keys(st.done).length;
      root.querySelectorAll('.bm-task').forEach(function (b) { if (st.done[b.dataset.task] && !/✓/.test(b.innerHTML)) b.insertAdjacentHTML('afterbegin', '<span aria-hidden="true">✓ </span>'); });
      var p = document.getElementById('bm-prog'); if (p) p.textContent = 'Uppgifter klara: ' + n + ' av ' + UPPGIFTER.length;
    }

    function changed(msg) {
      layout(); draw(); renderActions(); renderList();
      if (msg) say(msg);
      evaluate(msg);
    }

    // Klick / tangentbord på atomer
    svg.addEventListener('click', function (ev) {
      if (svg._dragged) { svg._dragged = false; return; }
      var g = ev.target.closest('.bm-atom'); if (!g) return; pick(+g.dataset.id);
    });
    svg.addEventListener('keydown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.bm-atom'); if (!g) return;
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(+g.dataset.id, true); }
    });
    function pick(id, refocus) {
      var i = st.sel.indexOf(id);
      if (i >= 0) st.sel.splice(i, 1);
      else if (st.sel.length >= 2) st.sel = [id];
      else st.sel.push(id);
      draw(); renderActions();
      if (refocus) { var g = svg.querySelector('.bm-atom[data-id="' + id + '"]'); if (g) g.focus(); }
      var a = atomById(id);
      say(st.sel.length === 2 ? 'Två atomer valda. Använd knapparna nedanför för att lägga till eller ta bort streck.' : (st.sel.length === 1 ? 'Valde ' + names(a) + ' (' + free(a) + ' lediga armar).' : 'Markeringen borttagen.'));
    }

    actions.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-act]'); if (!b) return;
      var act = b.dataset.act, sel = st.sel.map(atomById).filter(Boolean);
      if (act === 'clear') { clearAll(); return; }
      if (act === 'desel') { st.sel = []; draw(); renderActions(); say('Markeringen borttagen.'); return; }
      if (act === 'del' && sel.length === 1) {
        var id = sel[0].id; st.atoms = st.atoms.filter(function (a) { return a.id !== id; }); st.bonds = st.bonds.filter(function (x) { return x.a !== id && x.b !== id; }); st.sel = [];
        changed('Tog bort atomen.'); return;
      }
      if (sel.length !== 2) return;
      var bd = bondBetween(sel[0].id, sel[1].id);
      if (act === 'more') {
        if (free(sel[0]) < 1 || free(sel[1]) < 1) { var no = free(sel[0]) < 1 ? sel[0] : sel[1]; say('Nej – ' + names(no) + ' har inga lediga armar kvar.'); return; }
        if (bd) { if (bd.order >= 3) { say('Tre streck är max.'); return; } bd.order += 1; } else st.bonds.push({ a: sel[0].id, b: sel[1].id, order: 1 });
        changed('Bindningen är nu ' + ['', 'enkel', 'dubbel', 'trippel'][(bondBetween(sel[0].id, sel[1].id) || {}).order] + '.');
      } else if (act === 'less' && bd) {
        bd.order -= 1; if (bd.order < 1) st.bonds = st.bonds.filter(function (x) { return x !== bd; });
        changed(bd.order < 1 ? 'Bindningen är borttagen.' : 'Bindningen är nu ' + ['', 'enkel', 'dubbel', 'trippel'][bd.order] + '.');
      }
      var act2 = svg.querySelector('.bm-atom[data-id="' + sel[0].id + '"]'); if (act2 && document.activeElement === document.body) act2.focus();
    });

    // Flytta atomer med pekare (extra – inget krav för att lösa uppgiften)
    var drag = null;
    svg.addEventListener('pointerdown', function (ev) {
      var g = ev.target.closest('.bm-atom'); if (!g || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      drag = { id: +g.dataset.id, x: ev.clientX, y: ev.clientY, moved: false, pid: ev.pointerId };
    });
    window.addEventListener('pointermove', function (ev) {
      if (!drag || ev.pointerId !== drag.pid) return;
      if (!drag.moved && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 6) return;
      drag.moved = true; svg._dragged = true;
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      var a = atomById(drag.id); a.x = Math.max(30, Math.min(W - 30, p.x)); a.y = Math.max(30, Math.min(H - 30, p.y)); draw(); ev.preventDefault();
    }, { passive: false });
    window.addEventListener('pointerup', function () { drag = null; setTimeout(function () { svg._dragged = false; }, 0); });

    setTask('fri'); changed('Byggytan är tom. Lägg till atomer med knapparna ovanför.');
  }

  window.ByggMolekyl = { init: init, KNOWN: KNOWN };
})();
