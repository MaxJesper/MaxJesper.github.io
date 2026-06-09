/**
 * language-selector.js – TTS-språkväljare
 *
 * Renderar en kompakt språkväljare i alla element med class="lang-selector-mount".
 * Sparar valet i localStorage under nyckeln "site.tts-lang".
 * lyssna.js läser samma nyckel för att välja rätt TTS-röst.
 *
 * Visar automatiskt vilka röster som är tillgängliga på enheten.
 * Om en vald röst saknas visas ett tips om hur man installerar den.
 */
(function () {
  var STORAGE_KEY = 'site.tts-lang';

  var LANGUAGES = [
    { code: 'sv-SE', label: '🇸🇪 Svenska',                    prefix: 'sv' },
    { code: 'ar-SA', label: '🇸🇦 Arabiska (عربية)',           prefix: 'ar' },
    { code: 'so',    label: '🇸🇴 Somaliska (Soomaali)',       prefix: 'so' },
    { code: 'fa',    label: '🇮🇷 Persiska/Dari (فارسی)',      prefix: 'fa' },
    { code: 'am-ET', label: '🇪🇹 Amhariska (አማርኛ)',          prefix: 'am' },
    { code: 'ps-AF', label: '🇦🇫 Pashto (پښتو)',             prefix: 'ps' },
    { code: 'pl-PL', label: '🇵🇱 Polska (Polski)',            prefix: 'pl' },
    { code: 'en-GB', label: '🇬🇧 Engelska (English)',         prefix: 'en' },
    { code: 'bs',    label: '🇧🇦 Bosniska (Bosanski)',        prefix: 'bs' },
    { code: 'es-ES', label: '🇪🇸 Spanska (Español)',         prefix: 'es' }
  ];

  var CSS = [
    '.lang-selector-wrap{display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;',
    'padding:0.35rem 0.75rem;background:#f8f9fb;border:1px solid #d8e0ea;',
    'border-radius:999px;width:fit-content;font-size:0.88rem;margin:0.5rem 0;}',
    '.lang-selector-label{color:#555;font-weight:600;white-space:nowrap;}',
    '.lang-selector-select{border:none;background:transparent;font-family:inherit;',
    'font-size:0.88rem;cursor:pointer;color:#1a1a2e;max-width:180px;}',
    '.lang-selector-notice{font-size:0.8rem;color:#b45309;margin-top:0.3rem;',
    'padding:0.25rem 0.75rem;background:#fff8f0;border:1px solid #f0c080;',
    'border-radius:6px;width:100%;}'
  ].join('');

  var synth = window.speechSynthesis || null;

  // ── Begrepp-översättningar ────────────────────────────────────────────────
  // Mappar TTS-språkkod → filprefix för begrepp-JSON (t.ex. 'ar-SA' → 'ar')
  var LANG_PREFIX = {
    'sv-SE': 'sv', 'ar-SA': 'ar', 'so': 'so', 'fa': 'fa',
    'am-ET': 'am', 'ps-AF': 'ps', 'pl-PL': 'pl', 'en-GB': 'en', 'bs': 'bs', 'es-ES': 'es'
  };

  // Cache: {basePath+prefix → data[]}
  var begreppCache = {};

  function getLangPrefix(code) {
    return LANG_PREFIX[code] || code.split('-')[0];
  }

  // Hämta översatt begrepp-JSON och uppdatera popup + begreppslista
  function loadBegreppForLang(langCode, begreppBase) {
    if (!begreppBase) return;

    if (langCode === 'sv-SE') {
      if (window.BEGREPP && window.BEGREPP.length) {
        // index.html – använd inladdad data direkt
        if (window.BEGREPPPopup) window.BEGREPPPopup.update(window.BEGREPP);
        window.dispatchEvent(new CustomEvent('begreppLangUpdate', {
          detail: { data: window.BEGREPP, lang: 'sv-SE' }
        }));
      } else {
        // begreppslista.html – hämta svenska JSON-filen
        fetch(begreppBase + '.json')
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
            if (data && data.length) {
              window.dispatchEvent(new CustomEvent('begreppLangUpdate', {
                detail: { data: data, lang: 'sv-SE' }
              }));
            }
          })
          .catch(function (err) { console.warn('[begrepp] sv:', err); });
      }
      return;
    }

    var prefix = getLangPrefix(langCode);
    var url    = begreppBase + '.' + prefix + '.json';
    var cacheKey = url;

    if (begreppCache[cacheKey]) {
      applyTranslation(begreppCache[cacheKey], langCode);
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data && data.length) {
          begreppCache[cacheKey] = data;
          applyTranslation(data, langCode);
        } else {
          console.warn('[begrepp] Tom fil:', url);
        }
      })
      .catch(function (err) {
        console.warn('[begrepp] Kunde inte ladda ' + url + ':', err.message || err);
      });
  }

  function applyTranslation(data, langCode) {
    if (window.BEGREPPPopup) window.BEGREPPPopup.update(data);
    window.dispatchEvent(new CustomEvent('begreppLangUpdate', {
      detail: { data: data, lang: langCode }
    }));
  }

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

  function hasVoiceForLang(prefix) {
    if (!synth) return false;
    var voices = synth.getVoices();
    return voices.some(function (v) { return v.lang.startsWith(prefix); });
  }

  function updateOptions(sel, noticeEl) {
    var voices = synth ? synth.getVoices() : [];
    Array.from(sel.options).forEach(function (opt) {
      var lang = LANGUAGES.find(function (l) { return l.code === opt.value; });
      if (!lang) return;
      var available = voices.some(function (v) { return v.lang.startsWith(lang.prefix); });
      opt.textContent = lang.label + (available ? '' : ' ⚠️');
    });
    updateNotice(sel, noticeEl);
  }

  function updateNotice(sel, noticeEl) {
    if (!noticeEl) return;
    var lang = LANGUAGES.find(function (l) { return l.code === sel.value; });
    if (!lang) { noticeEl.hidden = true; return; }
    if (lang.prefix === 'sv') { noticeEl.hidden = true; return; }
    var available = hasVoiceForLang(lang.prefix);
    if (available) {
      noticeEl.hidden = true;
    } else {
      noticeEl.textContent = '⚠️ Röst för ' + lang.label + ' saknas på den här enheten. '
        + 'Installera språkstöd i enhetens inställningar för att höra rätt röst.';
      noticeEl.hidden = false;
    }
  }

  function syncAll(code) {
    document.querySelectorAll('.lang-selector-select').forEach(function (s) {
      s.value = code;
    });
    document.querySelectorAll('.lang-selector-notice').forEach(function (n) {
      var wrap = n.closest('.lang-selector-wrap');
      if (!wrap) return;
      var sel = wrap.querySelector('.lang-selector-select');
      if (sel) updateNotice(sel, n);
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

      var wrap = document.createElement('div');
      wrap.className = 'lang-selector-wrap';

      var uid = 'tts-lang-' + Math.random().toString(36).slice(2, 7);

      var label = document.createElement('label');
      label.textContent = '🌐 Språk:';
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

      var noticeEl = document.createElement('div');
      noticeEl.className = 'lang-selector-notice';
      noticeEl.hidden = true;
      noticeEl.setAttribute('role', 'status');

      sel.addEventListener('change', function () {
        save(sel.value);
        syncAll(sel.value);
        // Hämta och aktivera begrepp-översättning om bas-sökväg finns
        var begreppBase = mount.dataset.begreppBase;
        loadBegreppForLang(sel.value, begreppBase);
      });

      // Ladda direkt vid sidan start om ett icke-svenskt språk är sparat
      (function () {
        var saved = getSaved();
        if (saved !== 'sv-SE') {
          var base = mount.dataset.begreppBase;
          if (base) loadBegreppForLang(saved, base);
        }
      })();

      wrap.appendChild(label);
      wrap.appendChild(sel);
      wrap.appendChild(noticeEl);
      mount.appendChild(wrap);

      // Uppdatera när röster är laddade
      if (synth) {
        if (synth.getVoices().length > 0) {
          updateOptions(sel, noticeEl);
        } else {
          synth.addEventListener('voiceschanged', function () {
            updateOptions(sel, noticeEl);
          });
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
