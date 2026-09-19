/*!
 * dra-och-slapp.js – tillgänglig "dra till rätt ruta"-övning (sortera / para ihop)
 * ---------------------------------------------------------------------------------------------
 * Delad komponent. Ersätter de äldre HTML5-drag-and-drop-spelen, som inte går att använda med
 * tangentbord eller pekskärm. Tre sätt att svara (alla likvärdiga, WCAG 2.1.1 / 2.5.1 / 2.5.7):
 *   1. Dra brickan till rutan (mus, penna, finger – Pointer Events).
 *   2. Klicka/tryck på brickan (den markeras) och sedan på rutan eller rutans knapp "Placera här".
 *   3. Tangentbord: Tab till brickan, Enter/mellanslag markerar den, Tab till rutans knapp, Enter placerar.
 * Direkt återkoppling: rätt bricka låses i rutan med förklaring; fel bricka ligger kvar med ledtråd
 * (efter två missar visas facit). Poäng = antal brickor som blev rätt på FÖRSTA försöket.
 * Färg är aldrig ensam bärare: ✓/✗-tecken, streckad/hel ram och text i statusmeddelandet.
 *
 * Användning:
 *   DraOchSlapp.create(el, {
 *     title: 'Sortera…', intro: 'valfri text (HTML)',
 *     zones: [{ id:'a', html:'Proton', label:'Proton' }],          // html = det som visas i rutan (text eller SVG); label = ren text
 *     items: [{ id:'1', html:'positiv laddning', label:'positiv laddning', zone:'a', why:'Protonen är positiv.', hint:'Tänk på laddningen.' }],
 *     seed: 12345 (valfritt – fast blandning), cap: {a:1} (valfritt – max antal brickor per ruta, t.ex. 1 vid "para ihop")
 *   });
 * Händelse på elementet: 'dd:done' { detail: { score, total } }.
 */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  function mulberry(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var uid = 0;

  function create(root, spec) {
    uid += 1;
    var id = 'dd' + uid, state, cap = spec.cap || {};
    var zoneById = {}; spec.zones.forEach(function (z) { zoneById[z.id] = z; });

    function reset(reseed) {
      var rnd = spec.seed !== undefined && !reseed ? mulberry(spec.seed) : Math.random;
      state = { order: shuffle(spec.items.map(function (_, i) { return i; }), rnd), placed: {}, tries: {}, sel: null, first: 0, done: 0 };
      render();
    }

    function render() {
      root.classList.add('dd');
      var html = '';
      if (spec.title) html += '<h3 class="dd-title" id="' + id + '-t">' + spec.title + '</h3>';
      if (spec.intro) html += '<p class="dd-intro">' + spec.intro + '</p>';
      html += '<p class="dd-how">Dra en bricka till rätt ruta. Du kan också klicka på brickan och sedan på rutan (eller Enter på tangentbordet).</p>';
      html += '<div class="dd-pool" role="group" aria-label="Brickor att placera" id="' + id + '-pool"></div>';
      html += '<div class="dd-zones">' + spec.zones.map(function (z) {
        return '<div class="dd-zone" data-zone="' + esc(z.id) + '" role="group" aria-labelledby="' + id + '-zl-' + esc(z.id) + '">' +
          '<div class="dd-zone-h" id="' + id + '-zl-' + esc(z.id) + '">' + z.html + '</div>' +
          '<div class="dd-zone-items" aria-live="off"></div>' +
          '<button type="button" class="dd-place" data-zone="' + esc(z.id) + '" aria-label="Placera vald bricka i: ' + esc(z.label || plain(z.html)) + '">Placera här</button></div>';
      }).join('') + '</div>';
      html += '<p class="dd-msg" role="status" aria-live="polite" id="' + id + '-msg"></p>';
      html += '<div class="dd-result" id="' + id + '-res" hidden></div>';
      root.innerHTML = html;
      var pool = root.querySelector('.dd-pool');
      state.order.forEach(function (i) {
        var it = spec.items[i];
        pool.appendChild(makeChip(i, it));
      });
      // redan placerade (efter omritning finns inga – reset() tömmer)
      bind();
    }

    function makeChip(i, it) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dd-chip'; b.dataset.i = i; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = it.html;
      if (it.label) b.setAttribute('aria-label', it.label);
      return b;
    }

    var msg = function () { return root.querySelector('.dd-msg'); };
    function say(text, cls) { var m = msg(); m.className = 'dd-msg' + (cls ? ' ' + cls : ''); m.innerHTML = text; }

    function select(chip) {
      root.querySelectorAll('.dd-chip[aria-pressed="true"]').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      state.sel = null;
      if (chip) { chip.setAttribute('aria-pressed', 'true'); state.sel = +chip.dataset.i; }
      root.classList.toggle('dd-has-sel', chip != null);
      if (chip) say('Vald bricka: <strong>' + (spec.items[state.sel].label || plain(spec.items[state.sel].html)) + '</strong>. Klicka på rätt ruta, eller dra brickan dit.', 'dd-info');
    }

    function zoneCount(zid) { return Object.keys(state.placed).filter(function (k) { return state.placed[k] === zid; }).length; }

    function place(i, zid) {
      var it = spec.items[i], chip = root.querySelector('.dd-chip[data-i="' + i + '"]');
      if (!chip || chip.disabled) return;
      var zoneEl = root.querySelector('.dd-zone[data-zone="' + zid + '"]');
      var z = zoneById[zid], name = z.label || plain(z.html);
      var okZone = it.zone === zid;
      if (okZone && cap[zid] && zoneCount(zid) >= cap[zid]) { say('Den rutan är full. Prova en annan.', 'dd-bad'); return; }
      state.tries[i] = (state.tries[i] || 0) + (okZone ? 0 : 1);
      if (okZone) {
        state.placed[i] = zid; state.done += 1;
        if (!state.tries[i]) state.first += 1;
        chip.disabled = true; chip.classList.add('dd-ok'); chip.setAttribute('aria-pressed', 'false');
        chip.setAttribute('aria-label', (it.label || plain(it.html)) + ' – rätt, ligger i ' + name);
        chip.insertAdjacentHTML('afterbegin', '<span class="dd-mark" aria-hidden="true">✓ </span>');
        zoneEl.querySelector('.dd-zone-items').appendChild(chip);
        state.sel = null; root.classList.remove('dd-has-sel');
        say('<span class="dd-mark" aria-hidden="true">✓</span> <strong>Rätt!</strong> ' + (it.why || ''), 'dd-good');
        if (state.done === spec.items.length) finish(); else focusNext();
      } else {
        chip.classList.add('dd-wrong'); chip.setAttribute('aria-pressed', 'false');
        setTimeout(function () { chip.classList.remove('dd-wrong'); }, 1200);
        state.sel = null; root.classList.remove('dd-has-sel');
        var t = state.tries[i], txt;
        if (t >= 2) txt = '<strong>Facit:</strong> den hör hemma i <strong>' + esc(zoneById[it.zone].label || plain(zoneById[it.zone].html)) + '</strong>. ' + (it.why || '');
        else txt = 'Inte riktigt. ' + (it.hint || 'Tänk efter en gång till och prova en annan ruta.');
        say('<span class="dd-mark" aria-hidden="true">✗</span> ' + txt, 'dd-bad');
        chip.focus();
      }
    }

    function focusNext() {
      var n = root.querySelector('.dd-pool .dd-chip:not(:disabled)');
      if (n) n.focus();
    }

    function finish() {
      var total = spec.items.length, res = root.querySelector('.dd-result');
      res.hidden = false;
      res.innerHTML = '<p><strong>Klart!</strong> Du hade <strong>' + state.first + ' av ' + total + '</strong> rätt på första försöket.' +
        (state.first === total ? ' Alla rätt direkt – snyggt jobbat!' : ' Titta på förklaringarna för de som blev fel och försök igen.') + '</p>' +
        '<button type="button" class="dd-again">Blanda om och försök igen</button>';
      res.querySelector('.dd-again').addEventListener('click', function () { reset(true); var f = root.querySelector('.dd-chip'); if (f) f.focus(); });
      say('<span class="dd-mark" aria-hidden="true">✓</span> Alla brickor är på plats. ' + state.first + ' av ' + total + ' rätt på första försöket.', 'dd-good');
      root.dispatchEvent(new CustomEvent('dd:done', { bubbles: true, detail: { score: state.first, total: total } }));
    }

    // ---- bind händelser (delegering; en gång per render) ----
    var drag = null, suppressClick = false;
    function bind() {
      if (root._ddBound) return;
      root._ddBound = true;

      root.addEventListener('click', function (ev) {
        if (suppressClick) { suppressClick = false; ev.preventDefault(); return; }
        var chip = ev.target.closest('.dd-chip');
        if (chip && root.contains(chip) && !chip.disabled) {
          select(chip.getAttribute('aria-pressed') === 'true' ? null : chip);
          if (chip.getAttribute('aria-pressed') !== 'true') say('Markeringen borttagen.', 'dd-info');
          return;
        }
        var btn = ev.target.closest('.dd-place'), zoneEl = ev.target.closest('.dd-zone');
        var zid = btn ? btn.dataset.zone : (zoneEl && !ev.target.closest('.dd-chip') ? zoneEl.dataset.zone : null);
        if (zid == null || !root.contains(zoneEl || btn)) return;
        if (state.sel == null) { say('Välj först en bricka (klicka på den), och klicka sedan på rutan.', 'dd-info'); return; }
        place(state.sel, zid);
      });

      root.addEventListener('pointerdown', function (ev) {
        var chip = ev.target.closest('.dd-chip');
        if (!chip || !root.contains(chip) || chip.disabled || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        drag = { chip: chip, x: ev.clientX, y: ev.clientY, started: false, ghost: null, id: ev.pointerId };
      });
      document.addEventListener('pointermove', function (ev) {
        if (!drag || ev.pointerId !== drag.id) return;
        if (!drag.started) {
          if (Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 6) return;
          drag.started = true;
          var r = drag.chip.getBoundingClientRect();
          drag.ghost = drag.chip.cloneNode(true);
          drag.ghost.classList.add('dd-ghost'); drag.ghost.removeAttribute('id'); drag.ghost.setAttribute('aria-hidden', 'true');
          drag.ghost.style.width = r.width + 'px'; drag.ghost.style.left = '0px'; drag.ghost.style.top = '0px';
          drag.dx = ev.clientX - r.left; drag.dy = ev.clientY - r.top;
          document.body.appendChild(drag.ghost);
          drag.chip.classList.add('dd-dragging');
          select(null);
        }
        ev.preventDefault();
        drag.ghost.style.transform = 'translate(' + (ev.clientX - drag.dx) + 'px,' + (ev.clientY - drag.dy) + 'px)';
        var over = zoneAt(ev.clientX, ev.clientY);
        root.querySelectorAll('.dd-zone.dd-over').forEach(function (z) { if (z !== over) z.classList.remove('dd-over'); });
        if (over) over.classList.add('dd-over');
      }, { passive: false });
      function end(ev) {
        if (!drag || ev.pointerId !== drag.id) return;
        var d = drag; drag = null;
        if (!d.started) return;
        var over = zoneAt(ev.clientX, ev.clientY);
        if (d.ghost) d.ghost.remove();
        d.chip.classList.remove('dd-dragging');
        root.querySelectorAll('.dd-zone.dd-over').forEach(function (z) { z.classList.remove('dd-over'); });
        suppressClick = true; setTimeout(function () { suppressClick = false; }, 0);
        if (over && ev.type === 'pointerup') place(+d.chip.dataset.i, over.dataset.zone);
      }
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);
    }
    function zoneAt(x, y) {
      var el = document.elementFromPoint(x, y);
      var z = el && el.closest ? el.closest('.dd-zone') : null;
      return z && root.contains(z) ? z : null;
    }

    reset(false);
    return { reset: function () { reset(true); } };
  }

  window.DraOchSlapp = { create: create, mulberry: mulberry, shuffle: shuffle };
})();
