/**
 * concepts-popup.js
 * Begreppspopup för alla områden.
 *
 * Kräver att begreppsdatan är definierad INNAN detta script laddas:
 *   <script>
 *   window.BEGREPP = [
 *     { namn: "Magnetfält", definition: "...", anchor: "./studieguide.html#m2" }
 *   ];
 *   </script>
 *   <script src="/js/concepts-popup.js"></script>
 *
 * Begrepp i HTML markeras med data-concept="Exakt namn som i BEGREPP":
 *   <button class="concept-btn" data-concept="Magnetfält">Magnetfält</button>
 *
 * Flerspråkigt stöd via window.BEGREPPPopup.update(data):
 *   Anropas av language-selector.js när användaren byter språk.
 *   Fältet "namn" ska matcha det svenska data-concept-attributet.
 *   Fältet "namn_native" (valfritt) visas som översättning av begreppet.
 *   Fältet "definition" ska vara på det valda språket.
 */

(function () {
  // conceptsCore = de riktiga begreppen (data/begrepp.json, i checklistan).
  // conceptsTerms = lättviktiga "termer" (fetmarkerade ord som INTE är begrepp) –
  // bara namn + ev. namn_native (översättning), ingen definition/ankare.
  // Se concept-lang-selector.js och CLAUDE.md ("Fetmarkerade termer utan egen definition").
  var conceptsCore = {};
  var conceptsTerms = {};

  function buildIndex(arr) {
    var idx = {};
    (arr || []).forEach(function (item) {
      idx[item.namn] = item;
    });
    return idx;
  }

  function lookup(name) {
    return conceptsCore[name] || conceptsTerms[name];
  }

  // Initiera med svenska data
  conceptsCore = buildIndex(window.BEGREPP);

  // Publik API – anropas av language-selector.js/concept-lang-selector.js vid språkbyte
  window.BEGREPPPopup = {
    update: function (arr) { conceptsCore = buildIndex(arr); },
    updateTermer: function (arr) { conceptsTerms = buildIndex(arr); }
  };

  // ── CSS ────────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#concept-modal{position:fixed;inset:0;z-index:9000;display:none}',
    '#concept-modal.open{display:block}',
    '.cm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}',
    '.cm-card{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    'background:#fff;border-radius:14px;padding:1.4rem 1.5rem 1.2rem;',
    'max-width:400px;width:calc(100% - 2rem);',
    'box-shadow:0 8px 32px rgba(0,0,0,.22)}',
    '.cm-close{position:absolute;top:.7rem;right:.9rem;background:none;border:none;',
    'font-size:1.5rem;line-height:1;cursor:pointer;color:#666;padding:.1rem .3rem}',
    '.cm-close:hover{color:#111}',
    '.cm-title{margin:0 2rem .15rem 0;font-size:1.1rem;color:var(--area-strong,#1e3466)}',
    '.cm-title-native{margin:0 0 .6rem;font-size:.9rem;color:#666;font-style:italic;}',
    '.cm-title-native:empty{display:none}',
    '.cm-definition{margin:0 0 .9rem;font-size:.97rem;line-height:1.6;color:#1f2937}',
    '.cm-definition:empty{display:none}',
    '.cm-link{display:inline-block;font-size:.88rem;font-weight:600;',
    'color:var(--area-strong,#1e3466);text-decoration:underline;text-underline-offset:2px}',
    '.cm-link.hidden{display:none}',
    '.concept-btn{background:none;border:none;padding:0;cursor:pointer;font:inherit;',
    'color:inherit;text-align:left}',
    '.concept-btn:hover{text-decoration:underline;color:var(--area-strong,#1e3466)}',
    '.concept-inline{cursor:pointer;border-bottom:1px dotted currentColor;}',
    '.concept-inline:hover{color:var(--area-strong,#1e3466);border-bottom-style:solid}'
  ].join('');
  document.head.appendChild(style);

  // ── Modal ──────────────────────────────────────────────────────────────────
  var modal = document.createElement('div');
  modal.id = 'concept-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML =
    '<div class="cm-backdrop"></div>' +
    '<div class="cm-card">' +
    '<button class="cm-close" aria-label="Stäng">&times;</button>' +
    '<h3 class="cm-title"></h3>' +
    '<p class="cm-title-native"></p>' +
    '<p class="cm-definition"></p>' +
    '<a class="cm-link" href="#" target="_self">Läs mer i Studieguiden →</a>' +
    '</div>';
  document.body.appendChild(modal);

  var titleEl    = modal.querySelector('.cm-title');
  var titleNatEl = modal.querySelector('.cm-title-native');
  var defEl      = modal.querySelector('.cm-definition');
  var linkEl     = modal.querySelector('.cm-link');
  var prevFocus;

  // ── Kemiska formler med nedsänkta siffror (29 sep 2026) ────────────────────
  // Definitionerna i data/begrepp*.json är ren text ("C2H5OH", "CnH2n+2"). Här byggs
  // texten om till DOM-noder där atomantalen blir <sub>. Ingen innerHTML används,
  // så texten från JSON kan aldrig tolkas som HTML.
  // Ett ord räknas som formel bara om det ENBART består av riktiga grundämnessymboler
  // med siffror och har minst två grundämnen (C2H2, NH2, H2SO4 …). Ord med ett enda grundämne
  // (t.ex. "B12", "A4", "U235") lämnas orörda, utom en kort lista vanliga molekyler (O2, N2 …).
  var CHEM_EL = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn ' +
    'Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm ' +
    'Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu').split(' ');
  var CHEM_SINGLE = ['O2', 'N2', 'H2', 'Cl2', 'O3', 'F2', 'Br2', 'I2', 'S8', 'C60'];
  var CHEM_RE = /CnH2n(?:[+−-]2)?|(?:[A-Z][a-z]?\d*)+/g;
  var CHEM_PART = /([A-Z][a-z]?)(\d*)/g;

  function chemParts(tok) {
    // Allmän formel för kolväteserier: CnH2n, CnH2n+2, CnH2n-2
    if (tok.indexOf('CnH2n') === 0) {
      return [['C', 'n'], ['H', tok.slice(3)]];
    }
    if (!/\d/.test(tok)) return null;
    var parts = [], m;
    CHEM_PART.lastIndex = 0;
    while ((m = CHEM_PART.exec(tok))) {
      if (CHEM_EL.indexOf(m[1]) === -1) return null;
      parts.push([m[1], m[2]]);
    }
    if (parts.length === 1 && CHEM_SINGLE.indexOf(tok) === -1) return null;
    return parts;
  }

  function setChemText(el, text) {
    el.textContent = '';
    text = text || '';
    var last = 0, m;
    CHEM_RE.lastIndex = 0;
    while ((m = CHEM_RE.exec(text))) {
      var tok = m[0], start = m.index, end = start + tok.length;
      var before = start > 0 ? text.charAt(start - 1) : '';
      var after = text.charAt(end);
      if (/[A-Za-z0-9]/.test(before) || /[A-Za-z0-9]/.test(after)) continue;
      var parts = chemParts(tok);
      if (!parts) continue;
      if (start > last) el.appendChild(document.createTextNode(text.slice(last, start)));
      parts.forEach(function (p) {
        el.appendChild(document.createTextNode(p[0]));
        if (p[1]) {
          var sub = document.createElement('sub');
          sub.textContent = p[1];
          el.appendChild(sub);
        }
      });
      last = end;
    }
    if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
  }

  function openModal(name) {
    var item = lookup(name);
    if (!item) return;
    setChemText(titleEl, name);
    setChemText(titleNatEl, item.namn_native || '');
    setChemText(defEl, item.definition || '');
    if (item.anchor) {
      linkEl.href = item.anchor;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.classList.add('hidden');
    }
    prevFocus = document.activeElement;
    modal.classList.add('open');
    modal.querySelector('.cm-close').focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    if (prevFocus) prevFocus.focus();
  }

  // ── Händelselyssnare ───────────────────────────────────────────────────────
  modal.querySelector('.cm-backdrop').addEventListener('click', closeModal);
  modal.querySelector('.cm-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-concept]');
    if (btn) { e.preventDefault(); openModal(btn.dataset.concept); }
  });
})();
