/* ============================================================
   kodontabell.js – återanvändbar, klickbar genetisk kodtabell
   ------------------------------------------------------------
   Användning: lägg ett element med klassen "kodontabell-mount"
   där tabellen ska visas, och inkludera detta skript:

     <div class="kodontabell-mount"></div>
     <script src="/js/kodontabell.js"></script>

   Valfria data-attribut på mount-elementet:
     data-default="sv|three|one"   (startläge, standard "sv")
     data-legend="false"           (dölj förklaringsraden)

   Skriptet exponerar även window.Kodontabell.CODE och .AA så att
   övningar (t.ex. mRNA→protein, mutationer) kan återanvända datan.
   ============================================================ */
(function () {
  var AA = {
    Phe:['F','Fenylalanin'], Leu:['L','Leucin'], Ile:['I','Isoleucin'], Met:['M','Metionin'],
    Val:['V','Valin'], Ser:['S','Serin'], Pro:['P','Prolin'], Thr:['T','Treonin'],
    Ala:['A','Alanin'], Tyr:['Y','Tyrosin'], His:['H','Histidin'], Gln:['Q','Glutamin'],
    Asn:['N','Asparagin'], Lys:['K','Lysin'], Asp:['D','Asparaginsyra'], Glu:['E','Glutaminsyra'],
    Cys:['C','Cystein'], Trp:['W','Tryptofan'], Arg:['R','Arginin'], Gly:['G','Glycin'],
    STOP:['*','Stopp']
  };
  var CODE = {
    UUU:'Phe',UUC:'Phe',UUA:'Leu',UUG:'Leu', UCU:'Ser',UCC:'Ser',UCA:'Ser',UCG:'Ser',
    UAU:'Tyr',UAC:'Tyr',UAA:'STOP',UAG:'STOP', UGU:'Cys',UGC:'Cys',UGA:'STOP',UGG:'Trp',
    CUU:'Leu',CUC:'Leu',CUA:'Leu',CUG:'Leu', CCU:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
    CAU:'His',CAC:'His',CAA:'Gln',CAG:'Gln', CGU:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
    AUU:'Ile',AUC:'Ile',AUA:'Ile',AUG:'Met', ACU:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',
    AAU:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys', AGU:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',
    GUU:'Val',GUC:'Val',GUA:'Val',GUG:'Val', GCU:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
    GAU:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu', GGU:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly'
  };
  var B = ['U','C','A','G'];

  // en unik bakgrundsfärg per aminosyra (samma aminosyra = samma färg)
  var order = [];
  for (var ck in CODE) { var a0 = CODE[ck]; if (a0 !== 'STOP' && order.indexOf(a0) < 0) order.push(a0); }
  var aaColor = {};
  order.forEach(function (a, i) { aaColor[a] = 'hsl(' + Math.round(i * 360 / order.length) + ',60%,87%)'; });
  aaColor['STOP'] = '#fde2e2';

  // injicera CSS en gång
  var STYLE_ID = 'kodontabell-style';
  if (!document.getElementById(STYLE_ID)) {
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = [
      '.ktbl-wrap{font-size:0.92rem;}',
      '.ktbl-btns{display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.4rem 0 0.7rem;}',
      '.ktbl-btns button{padding:0.35rem 0.8rem;border:1px solid #86efac;background:#f0fdf4;color:#15803d;border-radius:999px;font:inherit;font-size:0.85rem;font-weight:600;cursor:pointer;}',
      '.ktbl-btns button.active{background:#15803d;color:#fff;border-color:#15803d;}',
      '.ktbl-scroll{overflow-x:auto;}',
      'table.ktbl{border-collapse:collapse;margin:0 auto;background:#fff;}',
      'table.ktbl th,table.ktbl td{border:1px solid #cbd5d0;padding:0.22rem 0.4rem;}',
      'table.ktbl thead th{background:#dcfce7;color:#166534;font-size:0.82rem;text-align:center;}',
      'table.ktbl .pos{background:#bbf7d0;color:#14532d;font-size:1.4rem;font-weight:800;width:1.4rem;text-align:center;}',
      'table.ktbl .pos3{background:#ecfdf3;color:#15803d;font-weight:700;width:1.2rem;text-align:center;}',
      'table.ktbl td.cell{white-space:nowrap;text-align:left;}',
      'table.ktbl td.cell .aa{font-weight:600;color:#1f2937;}',
      'table.ktbl td.cell .cdn{font-size:0.66rem;color:#64748b;letter-spacing:0.5px;margin-left:0.4rem;}',
      'table.ktbl td.start{outline:2px solid #15803d;outline-offset:-2px;}',
      'table.ktbl td.stop .aa{color:#dc2626;font-weight:700;}',
      'table.ktbl td.be,table.ktbl .pos.be{border-bottom:3px solid #15803d;}',
      '.ktbl-legend{font-size:0.82rem;color:#555;margin-top:0.5rem;}'
    ].join('\n');
    document.head.appendChild(st);
  }

  function label(aa, mode) {
    if (mode === 'one') return AA[aa][0];
    if (mode === 'three') return aa === 'STOP' ? 'STOP' : aa;
    return AA[aa][1];
  }

  function buildTable(mode) {
    var h = '<table class="ktbl"><thead><tr><th rowspan="2">1:a</th><th colspan="4">2:a basen</th><th rowspan="2">3:e</th></tr><tr><th>U</th><th>C</th><th>A</th><th>G</th></tr></thead><tbody>';
    for (var i = 0; i < 4; i++) {
      for (var k = 0; k < 4; k++) {
        var be = (k === 3) ? ' be' : '';
        h += '<tr>';
        if (k === 0) h += '<td class="pos be" rowspan="4">' + B[i] + '</td>';
        for (var j = 0; j < 4; j++) {
          var c = B[i] + B[j] + B[k];
          var aa = CODE[c];
          var cls = 'cell' + be + (c === 'AUG' ? ' start' : '') + (aa === 'STOP' ? ' stop' : '');
          h += '<td class="' + cls + '" style="background:' + aaColor[aa] + '"><span class="aa">' + label(aa, mode) + '</span><span class="cdn">' + c + '</span></td>';
        }
        h += '<td class="pos3' + be + '">' + B[k] + '</td></tr>';
      }
    }
    return h + '</tbody></table>';
  }

  function mount(el) {
    var mode = el.getAttribute('data-default') || 'sv';
    var showLegend = el.getAttribute('data-legend') !== 'false';
    var wrap = document.createElement('div');
    wrap.className = 'ktbl-wrap';
    wrap.innerHTML =
      '<div class="ktbl-btns">' +
        '<button data-mode="sv">Svenskt namn</button>' +
        '<button data-mode="three">Trebokstav</button>' +
        '<button data-mode="one">Enbokstav</button>' +
      '</div>' +
      '<div class="ktbl-scroll"></div>' +
      (showLegend ? '<p class="ktbl-legend"><span style="color:#15803d;font-weight:700;">Grön ram</span> = startkodon AUG (metionin) · <span style="color:#dc2626;font-weight:700;">röd</span> = stoppkodon · samma färg = samma aminosyra.</p>' : '');
    el.appendChild(wrap);

    var btns = wrap.querySelector('.ktbl-btns');
    var holder = wrap.querySelector('.ktbl-scroll');
    function render() {
      holder.innerHTML = buildTable(mode);
      Array.prototype.forEach.call(btns.children, function (b) {
        b.classList.toggle('active', b.getAttribute('data-mode') === mode);
      });
    }
    btns.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      mode = b.getAttribute('data-mode');
      render();
    });
    render();
  }

  function init() {
    var mounts = document.querySelectorAll('.kodontabell-mount');
    Array.prototype.forEach.call(mounts, function (el) {
      if (!el.getAttribute('data-ktbl-done')) { el.setAttribute('data-ktbl-done', '1'); mount(el); }
    });
  }

  // exponera datan för övningar (mRNA→protein, mutationer m.m.)
  window.Kodontabell = { CODE: CODE, AA: AA, aaColor: aaColor, init: init };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
