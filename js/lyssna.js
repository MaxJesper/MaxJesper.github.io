/**
 * lyssna.js – generell lyssna-funktion för studieguider
 *
 * Lägg till i studieguide.html (före </body>):
 *   <script src="/js/lyssna.js" data-audio-base="/fysik/elektricitet/audio/"></script>
 *
 * Beteende:
 *   - Lägger till en "🔈 Lyssna"-knapp i varje details.milestone och details.deepen.
 *   - Försöker spela mp3 från data-audio-base + milstolpe-id + ".mp3"
 *     (t.ex. /fysik/elektricitet/audio/m1.mp3).
 *   - Filen data-audio-base + milstolpe-id + "-fordj.mp3" används för fördjupning.
 *   - Om mp3 saknas eller inte kan spelas faller skriptet tillbaka på
 *     Web Speech API (TTS) med svenska som språk.
 *
 * CSS-färger styrs via CSS-variablerna --listen-color, --listen-border,
 * --listen-hover-bg (definierade i /css/style.css med fysik-blå som standard).
 * Kemi-sidor sätter --listen-color i sidans egna <style>-block.
 */
(function () {
  // Läs audio-base från script-taggens data-attribut
  var scriptEl = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  var AUDIO_BASE = (scriptEl && scriptEl.dataset && scriptEl.dataset.audioBase)
    ? scriptEl.dataset.audioBase
    : '';

  var currentBtn   = null;
  var currentAudio = null;
  var synth        = window.speechSynthesis || null;

  // ── Hjälpfunktioner ──────────────────────────────────────────────────────

  function getPreferredLang() {
    // Uppläsningsspråket = språket på den TEXT som läses (nu alltid svenska). Tidigare styrdes det av en egen Språk-väljare,
    // vilket gav svensk text med utländsk röst. När engelska helTexter finns ska detta returnera 'en-GB' när engelsk text visas.
    return 'sv-SE';
  }

  function getVoiceForLang(lang) {
    if (!synth) return null;
    var voices = synth.getVoices();
    // Exakt träff
    var v = voices.find(function (v) { return v.lang === lang; });
    if (v) return v;
    // Prefixträff (t.ex. 'ar' matchar 'ar-SA')
    var prefix = lang.split('-')[0];
    return voices.find(function (v) { return v.lang.startsWith(prefix); }) || null;
  }

  function getSwedishVoice() {
    return getVoiceForLang('sv-SE');
  }

  function extractText(root, removeSelectors) {
    var clone = root.cloneNode(true);
    removeSelectors.forEach(function (sel) {
      clone.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    });
    return (clone.innerText || clone.textContent).replace(/\s+/g, ' ').trim();
  }

  function getMilestoneText(milestone) {
    // .mc-head/.mc-rotate/.km-legend: molekylkortens rubrikrad, "Rotera i 3D"-länk och färgförklaring
    // i bildkolumnen (studieguide-bildkolumn.css) ska inte läsas upp; bildtexterna läses.
    // .fv-widget (js/formelvisare.js: verkstad/balansera) och .no-listen (t.ex. periodiska systemets tabell) är interaktiva/tabellartade och läses inte upp.
    return extractText(milestone.querySelector('.m-body'), ['.next-steps', '.deepen', '.listen-btn', '.m-num-chip', '.mc-head', '.mc-rotate', '.km-legend', '.km-hint', '.fv-widget', '.no-listen']);
  }

  function getDeepenText(deepen) {
    return extractText(deepen, ['.listen-btn', '.km-legend', '.km-hint', '.fv-widget', '.no-listen']);
  }

  // Returnerar mp3-sökväg för en milstolpe eller fördjupning
  function audioPath(details, isDeepen) {
    if (!AUDIO_BASE) return null;
    var milestoneEl = isDeepen ? details.closest('details.milestone') : details;
    if (!milestoneEl) return null;
    var id = milestoneEl.id; // "m1", "m2" …
    if (!id) return null;
    return AUDIO_BASE + id + (isDeepen ? '-fordj' : '') + '.mp3';
  }

  // ── Stoppa allt som spelas ───────────────────────────────────────────────

  function stopAll() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
    if (currentBtn) {
      currentBtn.classList.remove('playing');
      currentBtn.innerHTML = '&#128264; Lyssna';
      currentBtn = null;
    }
  }

  // ── Uppspelning ──────────────────────────────────────────────────────────

  function onDone(btn) {
    btn.classList.remove('playing');
    btn.innerHTML = '&#128264; Lyssna';
    if (currentBtn === btn) { currentBtn = null; currentAudio = null; }
  }

  // Mobilwebbläsare (iOS Safari, Chrome på Android) klarar inte långa uppläsningar i ett stycke – de tystnar
  // eller vägrar. Texten delas därför i meningar, grupperade till högst ~220 tecken, som köas efter varandra.
  function splitText(text) {
    var parts = text.match(/[^.!?…]+[.!?…]+[\])"'»”]*\s*|[^.!?…]+$/g) || [text];
    var chunks = [], cur = '';
    parts.forEach(function (p) {
      p = p.trim(); if (!p) return;
      if ((cur + ' ' + p).length > 220 && cur) { chunks.push(cur); cur = p; }
      else cur = cur ? cur + ' ' + p : p;
      while (cur.length > 300) {               // en extremt lång mening: dela vid kommatecken/mellanslag
        var cut = cur.lastIndexOf(', ', 220); if (cut < 80) cut = cur.lastIndexOf(' ', 220); if (cut < 80) cut = 220;
        chunks.push(cur.slice(0, cut + 1).trim()); cur = cur.slice(cut + 1).trim();
      }
    });
    if (cur) chunks.push(cur);
    return chunks;
  }

  function playWithTTS(text, btn) {
    if (!synth) { onDone(btn); return; }
    var lang = getPreferredLang();
    var voice = getVoiceForLang(lang);
    var chunks = splitText(text);
    if (!chunks.length) { onDone(btn); return; }
    // speak() måste anropas direkt i klicket (iOS) – alla bitar köas på en gång.
    chunks.forEach(function (chunk, i) {
      var utt = new SpeechSynthesisUtterance(chunk);
      utt.lang = lang;
      utt.rate = 0.92;
      if (voice) utt.voice = voice;
      if (i === chunks.length - 1) utt.onend = function () { onDone(btn); };
      utt.onerror = function (e) { if (e && e.error !== 'interrupted' && e.error !== 'canceled') onDone(btn); };
      synth.speak(utt);
    });
    if (synth.paused) synth.resume();
  }

  function startPlayback(path, getText, btn) {
    btn.classList.add('playing');
    btn.innerHTML = '&#9646;&#9646; Stoppa';
    currentBtn = btn;

    if (!path || AUDIO_OK[path] !== true) {
      // Ingen ljudfil (eller ännu okänt) – läs upp med talsyntes DIREKT i klicket. Förut provades mp3 först och
      // talsyntesen startades i efterhand när filen saknades, vilket mobilwebbläsare blockerar (inget "användarklick").
      playWithTTS(getText(), btn);
      return;
    }

    var audio = new Audio(path);
    currentAudio = audio;
    audio.onended = function () { onDone(btn); };

    // play() måste anropas direkt i klick-händelsen (iOS-krav).
    var p = audio.play();
    if (p !== undefined) {
      p.catch(function (err) {
        currentAudio = null;
        if (currentBtn !== btn) return;
        // AbortError = vi stoppade manuellt, inget fel
        if (err.name === 'AbortError') { onDone(btn); return; }
        // Filen saknas eller kan inte spelas – fall tillbaka på TTS
        playWithTTS(getText(), btn);
      });
    } else {
      // Äldre webbläsare utan Promise-stöd
      audio.onerror = function () {
        currentAudio = null;
        if (currentBtn === btn) playWithTTS(getText(), btn);
      };
    }
  }

  // ── Skapa knappar ────────────────────────────────────────────────────────

  function makeListenButton(details, isDeepen, getText) {
    var summary = details.querySelector(':scope > summary');
    if (!summary) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'listen-btn';
    btn.innerHTML = '&#128264; Lyssna';
    btn.title = 'Lyssna på texten';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!details.open) details.open = true;
      if (currentBtn === btn) { stopAll(); return; }
      stopAll();
      startPlayback(audioPath(details, isDeepen), getText, btn);
    });
    summary.appendChild(btn);
  }

  function addListenButtons() {
    document.querySelectorAll('details.milestone').forEach(function (m) {
      makeListenButton(m, false, function () { return getMilestoneText(m); });
    });
    document.querySelectorAll('details.deepen').forEach(function (d) {
      makeListenButton(d, true, function () { return getDeepenText(d); });
    });
  }

  // Vilka mp3-filer finns? Kontrolleras i förväg så att klicket kan välja ljudfil eller talsyntes direkt.
  var AUDIO_OK = {};
  function checkAudioFiles() {
    if (!AUDIO_BASE || !window.fetch) return;
    var paths = {};
    document.querySelectorAll('details.milestone').forEach(function (m) { var p = audioPath(m, false); if (p) paths[p] = 1; });
    document.querySelectorAll('details.deepen').forEach(function (d) { var p = audioPath(d, true); if (p) paths[p] = 1; });
    Object.keys(paths).forEach(function (p) {
      fetch(p, { method: 'HEAD' }).then(function (r) {
        var t = r.headers.get('content-type') || '';
        AUDIO_OK[p] = r.ok && t.indexOf('html') === -1;
      }).catch(function () { AUDIO_OK[p] = false; });
    });
  }

  // Knapparna skapas direkt. Rösterna hämtas först när man trycker (förut väntade skriptet på
  // 'voiceschanged', som aldrig kommer på vissa telefoner – och som kan komma flera gånger och ge dubbla knappar).
  if (!document.querySelector('.listen-btn')) addListenButtons();
  checkAudioFiles();
  if (synth && synth.getVoices) synth.getVoices();

  window.addEventListener('beforeunload', stopAll);
})();
