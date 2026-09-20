/**
 * kemi-inmatning.js – skriva kemiska formler digitalt
 *
 * På papper skriver eleven själv hela formeln (nedsänkta siffror, pil, laddning).
 * Digitalt saknas de tecknen på tangentbordet. Den här filen låter eleven ändå skriva
 * ALLT själv – formeln avskriven, siffror satta där de ska stå – men hjälper till med tecknen:
 *
 *   H2O            → H₂O          siffra direkt efter en atombokstav eller ")" blir nedsänkt
 *   2 H2O          → 2 H₂O        siffra framför (efter mellanslag/+/början) förblir vanlig = stor siffra
 *   ->  =>  -->    → →            pil ("ger")
 *   ^2+  ^-  Fe^3+ → ²⁺  ⁻  Fe³⁺  laddning skrivs med ^ (annars kan "H2+" inte skiljas från "H₂ +")
 *
 * Eleven bestämmer alltså själv VAR siffran står (index eller koefficient) – det är den
 * pedagogiska poängen; tangentbordstricket ersätter bara det som handskriften gör med pennan.
 * Ett litet verktygsfält under rutan har knappar för → och upphöjda tecken (⁺ ⁻ ² ³) för
 * surfplattor där ^ är svårt att skriva.
 *
 * Använd: KemiInput.enhance(textareaEllerInput)   – lägger på omvandling (+ verktygsfält för textarea)
 *         KemiInput.fix(sträng)                   – ren omvandling, returnerar ny sträng
 */
(function () {
  var SUB = '₀₁₂₃₄₅₆₇₈₉';
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻' };
  var SUPDIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';

  function sup(str) { return str.replace(/[0-9+\-−]/g, function (c) { return SUP[c]; }); }

  function fix(v) {
    // 1. pilar
    v = v.replace(/(?:-->|->|=>)/g, '→');
    // 2. laddning med ^  (^2+, ^3, ^+, ^-)
    v = v.replace(/\^([0-9]*[+\-−]?)/g, function (m, rest) { return rest ? sup(rest) : m; });
    // upphöjd siffra följd av vanligt plus/minus (skrivet efter ^2) → upphöjt tecken
    v = v.replace(new RegExp('([' + SUPDIGITS + '])([+\\-\\u2212])', 'g'), function (m, d, s) { return d + SUP[s]; });
    // 3. nedsänkta siffror efter atombokstav eller parentes
    v = v.replace(/([A-Z][a-z]?|\))(\d+)/g, function (m, a, d) {
      return a + d.replace(/\d/g, function (c) { return SUB.charAt(+c); });
    });
    return v;
  }

  function apply(el) {
    var v = el.value, nv = fix(v);
    if (nv === v) return false;
    var pos = el.selectionStart, npos = pos == null ? null : fix(v.slice(0, pos)).length;
    el.value = nv;
    if (npos != null) { try { el.setSelectionRange(npos, npos); } catch (e) { /* ignore */ } }
    return true;
  }

  function insertAt(el, text) {
    var s = el.selectionStart == null ? el.value.length : el.selectionStart,
        e = el.selectionEnd == null ? s : el.selectionEnd;
    el.value = el.value.slice(0, s) + text + el.value.slice(e);
    var p = s + text.length;
    try { el.setSelectionRange(p, p); } catch (err) { /* ignore */ }
    el.focus();
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function injectCSS() {
    if (document.getElementById('kemi-inmatning-style')) return;
    var st = document.createElement('style');
    st.id = 'kemi-inmatning-style';
    st.textContent =
      '.kemi-tools{display:none;flex-wrap:wrap;align-items:center;gap:0.4rem;margin:0.35rem 0 0;font-size:0.85rem;color:#334155}' +
      '.kemi-tools.open{display:flex}' +
      '.kemi-tools button{font:inherit;font-size:1.3rem;line-height:1;font-weight:700;min-width:44px;min-height:44px;padding:0 0.6rem;background:#fff;color:#1e293b;border:2px solid #475569;border-radius:8px;cursor:pointer}' +
      '.kemi-tools button:hover{background:#f1f5f9}' +
      '.kemi-tools button:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}' +
      '.kemi-tools .kemi-hint{flex:1 1 16rem}' +
      '@media print{.kemi-tools{display:none!important}}';
    document.head.appendChild(st);
  }

  var BUTTONS = [
    ['→', 'Infoga pil (ger)'],
    ['⁺', 'Infoga upphöjt plus (positiv laddning)'],
    ['⁻', 'Infoga upphöjt minus (negativ laddning)'],
    ['²', 'Infoga upphöjd 2'],
    ['³', 'Infoga upphöjd 3']
  ];

  function enhance(el, opts) {
    if (!el || el.dataset.kemiInput) return;
    el.dataset.kemiInput = '1';
    // capture: körs före andra input-lyssnare (t.ex. autospar) så att det som sparas redan är omvandlat
    el.addEventListener('input', function () { apply(el); }, true);
    if (el.tagName === 'TEXTAREA' && !(opts && opts.noToolbar)) {
      injectCSS();
      var bar = document.createElement('div');
      bar.className = 'kemi-tools no-print';
      BUTTONS.forEach(function (b) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = b[0];
        btn.setAttribute('aria-label', b[1]);
        // pointerdown/mousedown: behåll fokus i textrutan så att verktygsfältet inte stängs innan klicket
        btn.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
        btn.addEventListener('pointerdown', function (ev) { ev.preventDefault(); });
        btn.addEventListener('click', function () { insertAt(el, b[0]); });
        bar.appendChild(btn);
      });
      var hint = document.createElement('span');
      hint.className = 'kemi-hint';
      hint.textContent = 'Skriv formeln själv: H2O blir H₂O (siffra efter bokstav = nedsänkt). Pil: skriv -> eller tryck →. Laddning: ^2+ eller knapparna.';
      bar.appendChild(hint);
      el.insertAdjacentElement('afterend', bar);
      // Verktygsfältet visas bara för den ruta som eleven skriver i (annars upprepas det under varje fråga)
      el.addEventListener('focus', function () { bar.classList.add('open'); });
      el.addEventListener('blur', function (ev) { if (!bar.contains(ev.relatedTarget)) bar.classList.remove('open'); });
      bar.addEventListener('focusout', function (ev) { if (ev.relatedTarget !== el && !bar.contains(ev.relatedTarget)) bar.classList.remove('open'); });
    }
  }

  window.KemiInput = { fix: fix, enhance: enhance };
})();
