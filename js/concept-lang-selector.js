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
 * Hanterar TVÅ separata datakällor, båda valfria men begrepp-base krävs:
 *  - data-begrepp-base: de riktiga begreppen (i checklistan), rik popup
 *    (namn + översättning + definition + länk). Delad kod med den vanliga
 *    TTS-språkväljaren via window.LangSelector.loadBegreppForLang.
 *  - data-termer-base: fetmarkerade ord i löptexten som INTE är begrepp
 *    (t.ex. "Rotor", "Högerhandsregeln") – lättviktig popup med BARA namn +
 *    översättning, ingen definition, inte med i begreppslistan/checklistan.
 *    Filformat: [{ "namn": "Rotor", "namn_native": "Rotor" }, ...] – samma
 *    fält som begrepp.json men utan definition/anchor.
 *
 * Montering (i studieguide.html, bredvid den vanliga lang-selector-mount):
 *   <div class="concept-lang-selector-mount"
 *        data-begrepp-base="./data/begrepp"
 *        data-termer-base="./data/termer"></div>
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

  // Samma prefix-mappning som language-selector.js använder för begrepp.<prefix>.json –
  // duplicerad här (inte importerad) så att denna fil kan hämta termer.<prefix>.json
  // helt oberoende, utan att röra language-selector.js.
  var LANG_PREFIX = {
    'am-ET': 'am',
    'ar-SA': 'ar',
    'bs':    'bs',
    'en-GB': 'en',
    'es-ES': 'es',
    'fa':    'fa',
    'pl-PL': 'pl',
    'ps-AF': 'ps',
    'so':    'so',
    'ur-PK': 'ur'
  };

  // Cache: termerCache["<termerBase>|<prefix>"] = redan hämtad JSON-array
  var termerCache = {};

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

  function applyTermer(code, termerBase) {
    if (!termerBase) return;
    if (!window.BEGREPPPopup || !window.BEGREPPPopup.updateTermer) return;

    if (code === 'sv-SE') {
      // Ingen översättning valt – töm termer-bucketen (klick på fetmarkerade
      // icke-begrepp gör då inget, vilket är okej).
      window.BEGREPPPopup.updateTermer([]);
      return;
    }

    var prefix = LANG_PREFIX[code];
    if (!prefix) return;

    var cacheKey = termerBase + '|' + prefix;
    if (termerCache[cacheKey]) {
      if (getSaved() === code) window.BEGREPPPopup.updateTermer(termerCache[cacheKey]);
      return;
    }

    fetch(termerBase + '.' + prefix + '.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        termerCache[cacheKey] = data;
        // Skydd mot race: applicera bara om eleven fortfarande har detta språk valt
        // (kan ha hunnit byta språk igen medan hämtningen pågick).
        if (getSaved() === code) window.BEGREPPPopup.updateTermer(data);
      })
      .catch(function () { /* tyst – termer är ett tillägg, inte kritiskt */ });
  }

  function apply(code, begreppBase, termerBase) {
    if (begreppBase) {
      if (!window.LangSelector || !window.LangSelector.loadBegreppForLang) {
        console.warn('[concept-lang] language-selector.js måste laddas före concept-lang-selector.js.');
      } else {
        window.LangSelector.loadBegreppForLang(code, begreppBase);
      }
    }
    applyTermer(code, termerBase);
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
      var termerBase = mount.dataset.termerBase;

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
        apply(sel.value, begreppBase, termerBase);
      });

      wrap.appendChild(label);
      wrap.appendChild(sel);
      mount.appendChild(wrap);

      // Applicera direkt vid sidladdning om ett annat språk än svenska är sparat sedan tidigare
      if (saved !== 'sv-SE') apply(saved, begreppBase, termerBase);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
