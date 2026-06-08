/**
 * language-selector.js – TTS-språkväljare
 *
 * Renderar en kompakt språkväljare i alla element med class="lang-selector-mount".
 * Sparar valet i localStorage under nyckeln "site.tts-lang".
 * lyssna.js läser samma nyckel för att välja rätt TTS-röst.
 *
 * Användning i HTML (lägg var som helst på sidan):
 *   <div class="lang-selector-mount"></div>
 *   <script src="/js/language-selector.js"></script>
 */
(function () {
  var STORAGE_KEY = 'site.tts-lang';

  var LANGUAGES = [
    { code: 'sv-SE', label: '🇸🇪 Svenska' },
    { code: 'ar-SA', label: '🇸🇦 عربية' },
    { code: 'en-GB', label: '🇬🇧 English' },
    { code: 'fa',    label: '🇮🇷 فارسی‏/دری' },
    { code: 'so',    label: '🇸🇴 Soomaali' },
    { code: 'pl-PL', label: '🇵🇱 Polski' },
    { code: 'es-ES', label: '🇪🇸 Español' }
  ];

  var CSS = [
    '.lang-selector-wrap{display:flex;align-items:center;gap:0.5rem;',
    'padding:0.35rem 0.75rem;background:#f8f9fb;border:1px solid #d8e0ea;',
    'border-radius:999px;width:fit-content;font-size:0.88rem;margin:0.5rem 0;}',
    '.lang-selector-label{color:#555;font-weight:600;white-space:nowrap;}',
    '.lang-selector-select{border:none;background:transparent;font-family:inherit;',
    'font-size:0.88rem;cursor:pointer;color:#1a1a2e;max-width:160px;}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('lang-selector-style')) return;
    var style = document.createElement('style');
    style.id = 'lang-selector-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function getSaved() {
    try { return localStorage.getItem(STORAGE_KEY) || 'sv-SE'; } catch (e) { return 'sv-SE'; }
  }

  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
  }

  function syncAll(code) {
    document.querySelectorAll('.lang-selector-select').forEach(function (s) {
      s.value = code;
    });
  }

  function render() {
    injectCSS();
    var mounts = document.querySelectorAll('.lang-selector-mount');
    if (!mounts.length) return;
    var saved = getSaved();

    mounts.forEach(function (mount) {
      if (mount.dataset.rendered) return;
      mount.dataset.rendered = '1';

      var wrap  = document.createElement('div');
      wrap.className = 'lang-selector-wrap';

      var uid   = 'tts-lang-' + Math.random().toString(36).slice(2, 7);
      var label = document.createElement('label');
      label.textContent = '🔈 Läsröst:';
      label.className = 'lang-selector-label';
      label.htmlFor = uid;

      var sel = document.createElement('select');
      sel.className = 'lang-selector-select';
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
        syncAll(sel.value);
      });

      wrap.appendChild(label);
      wrap.appendChild(sel);
      mount.appendChild(wrap);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
