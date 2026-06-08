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
  var concepts = {};

  function buildIndex(arr) {
    concepts = {};
    (arr || []).forEach(function (item) {
      concepts[item.namn] = item;
    });
  }

  // Initiera med svenska data
  buildIndex(window.BEGREPP);

  // Publik API – anropas av language-selector.js vid språkbyte
  window.BEGREPPPopup = {
    update: function (arr) { buildIndex(arr); }
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
    '.cm-link{display:inline-block;font-size:.88rem;font-weight:600;',
    'color:var(--area-strong,#1e3466);text-decoration:underline;text-underline-offset:2px}',
    '.cm-link.hidden{display:none}',
    '.concept-btn{background:none;border:none;padding:0;cursor:pointer;font:inherit;',
    'color:inherit;text-align:left}',
    '.concept-btn:hover{text-decoration:underline;color:var(--area-strong,#1e3466)}'
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

  function openModal(name) {
    var item = concepts[name];
    if (!item) return;
    titleEl.textContent    = name;
    titleNatEl.textContent = item.namn_native || '';
    defEl.textContent      = item.definition;
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
