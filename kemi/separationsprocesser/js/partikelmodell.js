/*!
 * partikelmodell.js – "Partikelmodellen": drag i temperaturreglaget och se hur partiklarna beter sig.
 * ---------------------------------------------------------------------------------------------
 * Mountas på varje element med attributet [data-partikel]. Valfria attribut:
 *   data-amne="vatten|etanol|jarn"   (startämne, standard vatten)
 *   data-kompakt                      (mindre canvas, används inne i studieguiden)
 * Tillgänglighet: reglaget är en <input type="range"> med aria-label och aria-valuetext; en statusrad
 * (aria-live="polite") beskriver tillståndet med ord. Canvas är dekoration (aria-hidden) – all information
 * finns även som text. Färg bär aldrig information ensam. Med "minska rörelse" (prefers-reduced-motion)
 * startar animationen pausad och ritas om bara när reglaget flyttas.
 */
(function () {
  'use strict';

  var AMNEN = {
    vatten: { namn: 'Vatten', formel: 'H₂O', mp: 0, bp: 100, min: -40, max: 160, start: 20, steg: 1,
      fast: 'is', vats: 'flytande vatten', gas: 'vattenånga' },
    etanol: { namn: 'Etanol (sprit)', formel: 'C₂H₅OH', mp: -114, bp: 78, min: -150, max: 120, start: 20, steg: 1,
      fast: 'fast etanol', vats: 'flytande etanol', gas: 'etanolånga' },
    jarn: { namn: 'Järn', formel: 'Fe', mp: 1538, bp: 2862, min: 0, max: 3200, start: 20, steg: 10,
      fast: 'fast järn', vats: 'smält järn', gas: 'järnånga' }
  };

  var N = 42;                 // antal partiklar
  var stylesAdded = false;

  function addStyles() {
    if (stylesAdded) return;
    stylesAdded = true;
    var css = '' +
      '.pk{border:1px solid var(--area-border,#a5f3fc);border-radius:12px;background:#fff;padding:0.9rem 1rem 1rem;margin:0.9rem 0;}' +
      '.pk h3{margin:0 0 0.15rem;font-size:1.05rem;color:var(--area-strong,#155e75);}' +
      '.pk-intro{margin:0 0 0.6rem;font-size:0.92rem;color:#334155;}' +
      '.pk-row{display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-start;}' +
      '.pk-cv{flex:0 0 auto;border:2px solid #334155;border-radius:8px;background:#f8fafc;max-width:100%;height:auto;touch-action:manipulation;}' +
      '.pk-side{flex:1 1 210px;min-width:200px;}' +
      '.pk-temp{font-size:1.9rem;font-weight:800;color:#1f2937;line-height:1.1;}' +
      '.pk-temp small{font-size:0.95rem;font-weight:600;color:#475569;margin-left:0.35rem;}' +
      '.pk-state{display:inline-block;margin:0.35rem 0 0.2rem;padding:0.2rem 0.7rem;border:2px solid #155e75;border-radius:999px;font-weight:800;color:#155e75;background:#ecfeff;}' +
      '.pk-desc{margin:0.3rem 0 0.6rem;font-size:0.95rem;line-height:1.45;color:#1f2937;}' +
      '.pk label{display:block;font-weight:700;font-size:0.9rem;margin:0.4rem 0 0.15rem;color:#1f2937;}' +
      '.pk input[type=range]{width:100%;min-height:32px;accent-color:#155e75;}' +
      '.pk select{font:inherit;padding:0.35rem 0.5rem;border:2px solid #94a3b8;border-radius:8px;background:#fff;color:#1f2937;min-height:40px;}' +
      '.pk-btns{display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.5rem;}' +
      '.pk-btns button{font:inherit;font-weight:600;font-size:0.9rem;padding:0.4rem 0.8rem;min-height:40px;border:2px solid #155e75;border-radius:999px;background:#fff;color:#155e75;cursor:pointer;}' +
      '.pk-btns button:hover{background:#ecfeff;}' +
      '.pk-btns button[aria-pressed=true]{background:#155e75;color:#fff;}' +
      '.pk select:focus-visible,.pk input:focus-visible,.pk-btns button:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px;}' +
      '.pk-note{font-size:0.82rem;color:#475569;margin:0.6rem 0 0;}' +
      '.pk-kv{display:flex;justify-content:space-between;font-size:0.8rem;color:#475569;margin-top:-0.1rem;}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function create(root) {
    addStyles();
    var compact = root.hasAttribute('data-kompakt');
    var key = root.getAttribute('data-amne') || 'vatten';
    var A = AMNEN[key] || AMNEN.vatten;
    var T = A.start;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paused = reduce;
    var W = compact ? 300 : 340, H = compact ? 230 : 260;
    var R = 8;                                   // partikelradie
    var uid = 'pk' + Math.floor(Math.random() * 1e6);

    root.classList.add('pk');
    root.innerHTML =
      '<h3>Partikelmodellen – dra i temperaturen</h3>' +
      '<p class="pk-intro">Varje kula är en partikel (en molekyl eller atom). Ändra temperaturen och se hur rörelsen och avstånden förändras.</p>' +
      '<div class="pk-row">' +
      '<canvas class="pk-cv" width="' + W + '" height="' + H + '" aria-hidden="true"></canvas>' +
      '<div class="pk-side">' +
      '<div class="pk-temp"><span class="pk-t"></span><small class="pk-k"></small></div>' +
      '<div class="pk-state" role="status" aria-live="polite"></div>' +
      '<p class="pk-desc"></p>' +
      '<label for="' + uid + '-r">Temperatur</label>' +
      '<input type="range" id="' + uid + '-r" />' +
      '<div class="pk-kv"><span class="pk-lo"></span><span class="pk-hi"></span></div>' +
      '<label for="' + uid + '-s">Ämne</label>' +
      '<select id="' + uid + '-s"><option value="vatten">Vatten (H₂O)</option><option value="etanol">Etanol (C₂H₅OH)</option><option value="jarn">Järn (Fe)</option></select>' +
      '<div class="pk-btns">' +
      '<button type="button" data-set="fast">Fast</button>' +
      '<button type="button" data-set="vats">Flytande</button>' +
      '<button type="button" data-set="gas">Gas</button>' +
      '<button type="button" class="pk-pause" aria-pressed="' + (paused ? 'true' : 'false') + '">' + (paused ? 'Starta rörelsen' : 'Pausa') + '</button>' +
      '</div>' +
      '</div></div>' +
      '<p class="pk-note">Modellen är förenklad: ämnets partiklar ritas som kulor och verkliga avstånd och hastigheter är inte skalenliga.</p>';

    var cv = root.querySelector('canvas'), ctx = cv.getContext('2d');
    var rng = root.querySelector('input[type=range]'), sel = root.querySelector('select');
    var tEl = root.querySelector('.pk-t'), kEl = root.querySelector('.pk-k');
    var stEl = root.querySelector('.pk-state'), dEl = root.querySelector('.pk-desc');
    var pauseBtn = root.querySelector('.pk-pause');
    sel.value = key;

    // Hemma-positioner: kristallgitter längst ned (försänkt i rutan)
    var cols = compact ? 11 : 12, rows = Math.ceil(N / cols);
    var liqSurf = H - 12 - rows * (2 * R + 1) * 1.45;
    var gx = 2 * R + 3, gy = 2 * R + 1;
    var lx0 = (W - cols * gx) / 2 + R + 1.5, ly0 = H - 10 - rows * gy + R;
    var P = [];
    for (var i = 0; i < N; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      P.push({ hx: lx0 + c * gx + (r % 2 ? gx / 2 - 2 : 0), hy: ly0 + r * gy, x: 0, y: 0, vx: 0, vy: 0, ph: rnd(0, 6.28), ph2: rnd(0, 6.28) });
      P[i].x = P[i].hx; P[i].y = P[i].hy;
    }

    function state() {
      var band = A.key === 'jarn' ? 12 : 1.6;
      if (Math.abs(T - A.mp) <= band) return 'smalt';
      if (Math.abs(T - A.bp) <= band) return 'kok';
      if (T < A.mp) return 'fast';
      if (T < A.bp) return 'vats';
      return 'gas';
    }
    A.key = key;

    function txt() {
      var s = state(), t = A;
      var name = { fast: 'FAST', vats: 'FLYTANDE', gas: 'GAS', smalt: 'SMÄLTNING', kok: 'KOKNING' }[s];
      var desc = {
        fast: 'Partiklarna sitter på bestämda platser och vibrerar. Ju varmare, desto större vibrationer.',
        vats: 'Partiklarna ligger tätt men glider förbi varandra. Ju varmare, desto snabbare rörelse.',
        gas: 'Partiklarna far runt med stora avstånd och fyller hela utrymmet. Ju varmare, desto snabbare.',
        smalt: 'Vid smältpunkten är det både fast och flytande. Värmen går åt till att lösgöra partiklarna, så temperaturen står still tills allt har smält.',
        kok: 'Vid kokpunkten bildas gas i hela vätskan. Värmen går åt till att slita loss partiklarna, så temperaturen står still tills allt har kokat.'
      }[s];
      var ordet = { fast: t.fast, vats: t.vats, gas: t.gas, smalt: t.fast + ' + ' + t.vats, kok: t.vats + ' + ' + t.gas }[s];
      return { name: name + ' (' + ordet + ')', desc: desc };
    }

    function update() {
      var o = txt();
      tEl.textContent = (Math.round(T * 10) / 10).toString().replace('.', ',') + ' °C';
      kEl.textContent = '= ' + (Math.round((T + 273.15) * 10) / 10).toString().replace('.', ',') + ' K';
      stEl.textContent = o.name;
      dEl.textContent = o.desc + ' (' + A.namn + ': smältpunkt ' + A.mp + ' °C, kokpunkt ' + A.bp + ' °C.)';
      rng.min = A.min; rng.max = A.max; rng.step = A.steg; rng.value = T;
      rng.setAttribute('aria-valuetext', tEl.textContent + ', ' + o.name.toLowerCase());
      root.querySelector('.pk-lo').textContent = A.min + ' °C';
      root.querySelector('.pk-hi').textContent = A.max + ' °C';
      if (paused) draw();
    }

    // fraktion inom fasen 0..1 (styr hastighet/vibration)
    function frac() {
      var s = state();
      if (s === 'fast' || s === 'smalt') return Math.max(0, Math.min(1, (T - A.min) / (A.mp - A.min || 1)));
      if (s === 'vats' || s === 'kok') return Math.max(0, Math.min(1, (T - A.mp) / (A.bp - A.mp || 1)));
      return Math.max(0, Math.min(1, (T - A.bp) / (A.max - A.bp || 1)));
    }

    var t0 = 0;
    function step(dt) {
      var s = state(), f = frac();
      t0 += dt;
      var nSolid = N, nLiq = 0, nGas = 0;
      if (s === 'smalt') { var h = 0.5; nSolid = Math.round(N * h); nLiq = N - nSolid; }
      if (s === 'vats') { nSolid = 0; nLiq = N; }
      if (s === 'kok') { nSolid = 0; nLiq = Math.round(N * 0.55); nGas = N - nLiq; }
      if (s === 'gas') { nSolid = 0; nLiq = 0; nGas = N; }
      var vsol = 0.5 + 2.6 * f, vliq = 0.9 + 1.5 * f, vgas = 2.0 + 3.2 * f;
      for (var i = 0; i < N; i++) {
        var p = P[i], mode = i < nSolid ? 'S' : (i < nSolid + nLiq ? 'L' : 'G');
        if (mode === 'S') {
          p.x += (p.hx + Math.sin(t0 * 6 + p.ph) * vsol - p.x) * 0.35;
          p.y += (p.hy + Math.cos(t0 * 6.7 + p.ph2) * vsol - p.y) * 0.35;
          p.vx = rnd(-1, 1); p.vy = rnd(-1, 1);
        } else {
          var v = mode === 'L' ? vliq : vgas;
          // håll farten nära v med slumpmässig kurs
          var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 0.001;
          if (sp < v * 0.6 || sp > v * 1.6 || Math.random() < 0.03) {
            var a = rnd(0, 6.283); p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
          } else { p.vx *= v / sp * 0.35 + 0.65; p.vy *= v / sp * 0.35 + 0.65; }
          p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
          var top = mode === 'L' ? liqSurf : R + 2;
          if (p.x < R + 2) { p.x = R + 2; p.vx = Math.abs(p.vx); }
          if (p.x > W - R - 2) { p.x = W - R - 2; p.vx = -Math.abs(p.vx); }
          if (p.y < top + R) { p.y = top + R; p.vy = Math.abs(p.vy); }
          if (p.y > H - R - 2) { p.y = H - R - 2; p.vy = -Math.abs(p.vy); }
        }
      }
      // enkel avstötning så att kulorna inte lägger sig ovanpå varandra
      if (nSolid < N) {
        for (var a2 = 0; a2 < N; a2++) for (var b2 = a2 + 1; b2 < N; b2++) {
          var A1 = P[a2], B1 = P[b2];
          var dx = B1.x - A1.x, dy = B1.y - A1.y, d2 = dx * dx + dy * dy, m = 2 * R - 1;
          if (d2 < m * m && d2 > 0.01) {
            var d = Math.sqrt(d2), o = (m - d) / 2, ux = dx / d, uy = dy / d;
            var ma = a2 < nSolid, mb = b2 < nSolid;
            if (!ma) { A1.x -= ux * o * (mb ? 2 : 1); A1.y -= uy * o * (mb ? 2 : 1); }
            if (!mb) { B1.x += ux * o * (ma ? 2 : 1); B1.y += uy * o * (ma ? 2 : 1); }
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = state();
      // vätskeyta (visas när det finns vätska)
      if (s === 'vats' || s === 'smalt' || s === 'kok') {
        var top = s === 'smalt' ? H - 12 - rows * (2 * R + 1) * 1.15 : liqSurf;
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(2, top, W - 4, H);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(2, top); ctx.lineTo(W - 2, top); ctx.stroke();
      }
      for (var i = 0; i < N; i++) {
        var p = P[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, R, 0, 6.2832);
        ctx.fillStyle = '#93c5fd';
        ctx.fill();
        ctx.lineWidth = 1.6; ctx.strokeStyle = '#1d4ed8';
        ctx.stroke();
      }
    }

    var last = 0, raf = 0;
    function loop(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      if (!paused) { step(dt); draw(); }
      raf = requestAnimationFrame(loop);
    }

    function setT(v) { T = +v; update(); }
    rng.addEventListener('input', function () { setT(rng.value); });
    sel.addEventListener('change', function () {
      key = sel.value; A = AMNEN[key]; A.key = key; T = A.start; last = 0;
      // återställ till gitter
      for (var i = 0; i < N; i++) { P[i].x = P[i].hx; P[i].y = P[i].hy; }
      update();
    });
    root.querySelectorAll('button[data-set]').forEach(function (b) {
      b.addEventListener('click', function () {
        var w = b.getAttribute('data-set');
        var v = w === 'fast' ? (A.min + A.mp) / 2 : (w === 'vats' ? (A.mp + A.bp) / 2 : (A.bp + A.max) / 2);
        if (A.steg >= 10) v = Math.round(v / 10) * 10;
        setT(Math.round(v));
      });
    });
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      pauseBtn.textContent = paused ? 'Starta rörelsen' : 'Pausa';
      if (paused) draw();
    });

    update();
    // synlighetsstyrd animation (spar batteri): kör bara när rutan syns
    if ('IntersectionObserver' in window) {
      var vis = true;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !vis) { vis = true; last = 0; if (!raf) raf = requestAnimationFrame(loop); }
          if (!e.isIntersecting && vis) { vis = false; cancelAnimationFrame(raf); raf = 0; }
        });
      }).observe(root);
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-partikel]'), create);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.Partikelmodell = { init: init };
})();
