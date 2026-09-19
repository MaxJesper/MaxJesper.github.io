/*!
 * molviewer.js – delad komponent för roterbara 3D-kulmodeller (bygger på 3Dmol.js)
 * ---------------------------------------------------------------------------------------------
 * Används av studieguider/övningar som visar få molekyler direkt i texten (t.ex. kemi/atomer).
 * (Kol-kapitlet har sin egen, äldre inbäddade kopia av samma kod och rörs inte.)
 *
 * Användning
 *   1. <script src="/js/3Dmol-min.js"></script>                       (delad fil, ~540 kB)
 *   2. <script src="/kemi/<område>/js/molmodeller.js"></script>       (window.MOLDATA – byggs av
 *                                                                     tools/kemi-ritverktyg/<område>/bygg_*.py)
 *   3. <script src="/js/molviewer.js"></script>
 *   4. Markup: <div class="km-viewerbox mc-viewer" data-mol="h2o" role="group" tabindex="0"
 *                   aria-label="…beskrivning… Piltangenter roterar, plus och minus zoomar."></div>
 *      (+ ev. <noscript><img …png…></noscript> i rutan, och <div class="km-hint">…</div> under den.)
 *
 * window.MOLDATA = { mols:{nyckel: molblock}, multi:{nyckel:[{a,b,order,rot?}]}, style:{nyckel:{sphere,stick}},
 *                    view:{nyckel:[rotX,rotY]}, info:{…} }
 *
 * Beteende
 *   • Rutorna skapas LATA (IntersectionObserver) och släpps när de rullas ur bild – webbläsare tillåter bara
 *     ~16 samtidiga WebGL-kontexter.
 *   • Dra = rotera. Zoom med mushjul KRÄVER att rutan har fokus (klicka i den) eller att man nyper på
 *     styrplattan (ctrlKey) – annars scrollar sidan vanligt förbi (hjulet fångas alltså inte i onödan).
 *   • Tangentbord (WCAG 2.1.1): rutan är fokuserbar; ←→↑↓ roterar 15°, + och − zoomar, 0/Home nollställer vyn.
 *   • Dubbel-/trippelbindningar ritas som utåtböjda bågar (se regel 9 i tools/kemi-ritverktyg/kulmodeller3d.py).
 *     Bindningar med ordning ≥ 2 ska INTE finnas i molblocket, bara i multi. Valfri spec.rot (grader) vrider
 *     bågarnas plan runt bindningsaxeln (koldioxidens två C=O-bindningar ligger vridna 90° mot varandra).
 *   • addMultiBond är samma funktion som i tools/kemi-ritverktyg/statiska-kulmodeller/render-kulmodeller.html
 *     (som renderar PNG-reserverna) – ändras den ena ska den andra ändras.
 */
(function () {
  'use strict';

  var MB = { bulge: { 2: 0.48, 3: 0.54 }, radius: { 2: 0.06, 3: 0.05 }, end: 0.02 };
  var DEFAULT_STYLE = { sphere: 0.28, stick: 0.12 };

  function D() { return window.MOLDATA || { mols: {}, multi: {}, style: {}, view: {}, info: {} }; }

  function addMultiBond(viewer, spec) {
    var a = spec.a, b = spec.b, order = spec.order;
    var axis = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    var len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    axis = [axis[0] / len, axis[1] / len, axis[2] / len];
    var ref = Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
    function norm(u) { var l = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]); return [u[0] / l, u[1] / l, u[2] / l]; }
    var e1 = norm(cross(axis, ref));
    var e2 = norm(cross(axis, e1));
    if (spec.rot) {
      var ph = spec.rot * Math.PI / 180, cp = Math.cos(ph), sp = Math.sin(ph);
      var e1r = [e1[0] * cp + e2[0] * sp, e1[1] * cp + e2[1] * sp, e1[2] * cp + e2[2] * sp];
      var e2r = [-e1[0] * sp + e2[0] * cp, -e1[1] * sp + e2[1] * cp, -e1[2] * sp + e2[2] * cp];
      e1 = e1r; e2 = e2r;
    }
    var BULGE = MB.bulge[order] || MB.bulge[2], radius = MB.radius[order] || MB.radius[2], color = '#777777', N = 14;
    var dirs = [];
    if (order === 2) {
      dirs = [e1, [-e1[0], -e1[1], -e1[2]]];
    } else if (order === 3) {
      for (var k = 0; k < 3; k++) {
        var th = k * 2 * Math.PI / 3, c = Math.cos(th), s = Math.sin(th);
        dirs.push([e1[0] * c + e2[0] * s, e1[1] * c + e2[1] * s, e1[2] * c + e2[2] * s]);
      }
    } else {
      dirs = [[0, 0, 0]];
    }
    dirs.forEach(function (d) {
      var prev = null;
      for (var i = 0; i <= N; i++) {
        var t = i / N, off = MB.end + (BULGE - MB.end) * Math.sin(Math.PI * t);
        var p = { x: a[0] + t * (b[0] - a[0]) + d[0] * off, y: a[1] + t * (b[1] - a[1]) + d[1] * off, z: a[2] + t * (b[2] - a[2]) + d[2] * off };
        if (prev) viewer.addCylinder({ start: prev, end: p, radius: radius, color: color, fromCap: 2, toCap: 2 });
        prev = p;
      }
    });
  }

  // 3Dmols zoomTo() räknar aldrig med molekyler mindre än 5 Å – små molekyler (H2, H2O …) blir då pyttesmå i rutan.
  // Vi mäter därför själva hur stor molekylen är på skärmen (atomernas mittpunkter + marginal för kulornas radie
  // och de utåtböjda bindningarna) och zoomar så att den fyller ca 75 % av rutan.
  function fitFactor(viewer, el) {
    try {
      var at = viewer.getModel().selectedAtoms({});
      var pts = viewer.modelToScreen(at);
      var o = viewer.modelToScreen([{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }]);
      var s = (Math.hypot(o[1].x - o[0].x, o[1].y - o[0].y) + Math.hypot(o[2].x - o[0].x, o[2].y - o[0].y) +
               Math.hypot(o[3].x - o[0].x, o[3].y - o[0].y)) / 2;         // px per Å (de tre enhetsvektorerna spänner ~2/3 av sin längd)
      var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      pts.forEach(function (p) { minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); });
      var m = 0.62 * s, w = (maxx - minx) + 2 * m, h = (maxy - miny) + 2 * m;
      var f = 0.75 * Math.min(el.clientWidth / w, el.clientHeight / h);
      return Math.max(0.6, Math.min(4, f));
    } catch (e) { return 1.5; }
  }

  function applyView(viewer, key, el) {
    var v = D().view[key];
    viewer.zoomTo();
    if (v) { viewer.rotate(v[0], 'x'); viewer.rotate(v[1], 'y'); }
    viewer.render();
    viewer.zoom(D().style[key] ? 1.0 : fitFactor(viewer, el));
    viewer.render();
  }

  // Atombokstäver (H, O, C …) på kulorna – hjälper den som har svårt att skilja färger (t.ex. röd/svart/grön).
  var LABEL_INK = { H: '#111111', C: '#ffffff', O: '#ffffff', N: '#ffffff', Cl: '#111111' };
  var labelsOn = false;
  function applyLabels(viewer) {
    viewer.removeAllLabels();
    if (!labelsOn) { viewer.render(); return; }
    viewer.getModel().selectedAtoms({}).forEach(function (a) {
      viewer.addLabel(a.elem, { position: { x: a.x, y: a.y, z: a.z }, fontSize: a.elem === 'H' ? 12 : 15, fontColor: LABEL_INK[a.elem] || '#111111',
        showBackground: false, backgroundOpacity: 0, alignment: 'center', inFront: true, bold: true });
    });
    viewer.render();
  }
  function setLabels(on) {
    labelsOn = !!on;
    document.querySelectorAll('.km-viewerbox[data-mol]').forEach(function (el) { if (el._km3dViewer) applyLabels(el._km3dViewer); });
  }

  function create(el, key) {
    var data = D();
    if (!window.$3Dmol || !data.mols[key] || el.dataset.km3dReady) return;
    el.dataset.km3dReady = '1';
    var noscript = el.querySelector('noscript');
    var viewer = $3Dmol.createViewer(el, { backgroundColor: 'white' });
    viewer.addModel(data.mols[key], 'sdf');
    var st = data.style[key] || DEFAULT_STYLE;
    viewer.setStyle({}, { stick: { radius: st.stick }, sphere: { scale: st.sphere } });
    viewer.setStyle({ elem: 'C' }, { stick: { radius: st.stick, color: '#777777' }, sphere: { scale: st.sphere, color: '#4d4d4d' } });
    (data.multi[key] || []).forEach(function (spec) { addMultiBond(viewer, spec); });
    applyView(viewer, key, el);
    el._km3dViewer = viewer;
    if (labelsOn) applyLabels(viewer);

    // Mushjul/styrplatta: dämpad zoom, och bara när rutan har fokus (eller vid nyp med styrplattan).
    el._km3dWheel = function (ev) {
      ev.stopPropagation();                       // 3Dmols egen (för känsliga) hjullyssnare ska aldrig se händelsen
      if (!ev.ctrlKey && document.activeElement !== el) return;   // annars: låt sidan scrolla som vanligt
      ev.preventDefault();
      var clamped = Math.max(-25, Math.min(25, ev.deltaY));
      var factor = 1 + clamped * (ev.ctrlKey ? 0.0018 : 0.0035);
      factor = Math.max(0.94, Math.min(1.06, factor));
      viewer.zoom(factor, 0);
      viewer.render();
    };
    el.addEventListener('wheel', el._km3dWheel, { capture: true, passive: false });

    // Tangentbord
    el._km3dKey = function (ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var k = ev.key, done = true;
      if (k === 'ArrowLeft') viewer.rotate(-15, 'y');
      else if (k === 'ArrowRight') viewer.rotate(15, 'y');
      else if (k === 'ArrowUp') viewer.rotate(-15, 'x');
      else if (k === 'ArrowDown') viewer.rotate(15, 'x');
      else if (k === '+' || k === '=') viewer.zoom(1.15, 100);
      else if (k === '-' || k === '_') viewer.zoom(1 / 1.15, 100);
      else if (k === '0' || k === 'Home') { applyView(viewer, key, el); }
      else done = false;
      if (done) { ev.preventDefault(); viewer.render(); }
    };
    el.addEventListener('keydown', el._km3dKey);
    if (noscript) el.removeChild(noscript);
  }

  function destroy(el) {
    if (!el._km3dViewer) return;
    try {
      var cv = el.querySelector('canvas');
      var gl = cv && (cv.getContext('webgl2') || cv.getContext('webgl'));
      var ext = gl && gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      el._km3dViewer.clear();
    } catch (e) { /* ignore */ }
    el.removeEventListener('wheel', el._km3dWheel, { capture: true });
    el.removeEventListener('keydown', el._km3dKey);
    el.innerHTML = '';
    el._km3dViewer = null; el._km3dWheel = null; el._km3dKey = null;
    delete el.dataset.km3dReady;
  }

  var io = null;
  function observe(el) {
    if (!('IntersectionObserver' in window)) { create(el, el.dataset.mol); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) create(entry.target, entry.target.dataset.mol);
          else destroy(entry.target);
        });
      }, { rootMargin: '200px' });
    }
    io.observe(el);
  }

  /** Startar alla rutor med data-mol inom root (standard: hela dokumentet). */
  function mount(root) {
    (root || document).querySelectorAll('.km-viewerbox[data-mol]').forEach(observe);
  }

  /** Lägger till en molekyl i körande sida (t.ex. en som eleven byggt själv). */
  function register(key, def) {
    var d = D(); window.MOLDATA = d;
    d.mols[key] = def.mol; if (def.multi) d.multi[key] = def.multi;
    if (def.style) d.style[key] = def.style; if (def.view) d.view[key] = def.view;
  }

  window.MolViewer = { addMultiBond: addMultiBond, create: create, destroy: destroy, observe: observe, mount: mount, register: register, setLabels: setLabels };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
})();
