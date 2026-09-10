/**
 * concept-lang-selector.js – Begreppsöversättning vid läsning
 *
 * Fristående språkväljare för begreppspopupar i löptexten (klickbara ord med
 * class="concept-inline" data-concept="..."). HELT OBEROENDE av
 * language-selector.js / "site.tts-lang" – styr bara vilket språk
 * begreppspopupen visas på, aldrig uppläsningsrösten. Så kan en elev läsa
 * (och ev. lyssna på) den svenska texten men ändå få enskilda begrepp
 * översatta + förklarade på sitt eget språk vid klick, utan att lämna sidan
 * eller byta bort den svenska uppläsningen.
 *
 * Kräver att js/concepts-popup.js och js/language-selector.js redan är
 * inlästa FÖRE denna fil (återanvänder window.BEGREPPPopup respektive
 * window.LangSelector.loadBegreppForLang för hämtning/cache av begrepp-JSON).
 *
 * Montering (i studieguide.html, bredvid den vanliga lang-selector-mount):
 *   <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp"></div>
 */
(function () {
  var STORAGE_KEY = 'site.concept-lang';

  var LANGUAGES = [
    { code: 'sv-SE', label: '🇸🇪 Svenska (ingen översättning)' },
    { code: 'ar-SA', label: '🇸🇦 Arabiska (عربية)' },
    { code: 'so',    label: '🇸🇴 Somaliska (Soomaali)' },
    { code: 'fa',    label: '🇮🇷 Persiska/Dari (فارسی)' },
    { code: 'am-ET', label: '🇪🇹 Amhariska (አማርኛ)' },
    { code: 'ps-AF', label: '🇦🇫 Pashto (پښتو)' },
    { code: 'pl-PL', label: '🇵🇱 Polska (Polski)' },
    { code: 'en-GB', label: '🇬🇧 Engelska (English)' },
    { code: 'bs',    label: '🇧🇦 Bosniska (Bosanski)' },
    { code: 'es-ES', label: '🇪🇸 Spanska (Español)' },
    { code: 'ur-PK', label: '🇵🇰 Urdu (اردو)' }
  ];

  var CSS = [
    '.concept-lang-wrap{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;',
    'padding:0.35rem 0.75rem;background:#f5f3ff;border:1px solid #ded9f7;',
    'border-radius:999px;width:fit-content;font-size:0.88rem;margin:0.3rem 0 0.6rem;}',
    '.concept-lang-label{color:#555;font-weight:600;white-space:nowrap;}',
    '.concept-lang-select{border:none;background:transparent;font-family:inherit;',
    'font-size:0.88rem;cursor:pointer;color:#1a1a2e;max-width:220px;}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('concept-lang-style')) return;
    var style = document.createElement('style');
    style.id = 'concept-lang-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY) || 'sv-SE'; } catch (e) { return 'sv-SE'; }
  }

  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  function apply(code, begreppBase) {
    if (!begreppBase) return;
    if (!window.LangSelector || !window.LangSelector.loadBegreppForLang) {
      console.warn('[concept-lang] language-selector.js måste laddas före concept-lang-selector.js.');
      return;
    }
    window.LangSelector.loadBegreppForLang(code, begreppBase);
  }

  function render() {
    injectCSS();
    var mounts = document.querySelectorAll('.concept-lang-selector-mount');
    if (!mounts.length) return;
    var saved = getSaved();

    mounts.forEach(function (mount) {
      if (mount.dataset.rendered) return;
      mount.dataset.rendered = '1';

      var begreppBase = mount.dataset.begreppBase;

      var wrap = document.createElement('div');
      wrap.className = 'concept-lang-wrap';

      var uid = 'concept-lang-' + Math.random().toString(36).slice(2, 7);

      var label = document.createElement('label');
      label.textContent = '📖 Begrepp översätts till:';
      label.className = 'concept-lang-label';
      label.htmlFor = uid;

      var sel = document.createElement('select');
      sel.className = 'concept-lang-select';
      sel.id = uid;

      LANGUAGES.forEach(function (lang) {
        var opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = lang.label;
        if (lang.code === saved) opt.selected = true;
        sel.appendChild(opt);
      });

      sel.addEventListener('change', function () {
        save(sel.value);
        apply(sel.value, begreppBase);
      });

      wrap.appendChild(label);
      wrap.appendChild(sel);
      mount.appendChild(wrap);

      // Applicera direkt vid sidladdning om ett annat språk än svenska är sparat sedan tidigare
      if (saved !== 'sv-SE') apply(saved, begreppBase);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
