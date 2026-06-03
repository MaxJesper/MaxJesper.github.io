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

  function getSwedishVoice() {
    if (!synth) return null;
    var voices = synth.getVoices();
    return voices.find(function (v) { return v.lang.startsWith('sv'); }) || null;
  }

  function extractText(root, removeSelectors) {
    var clone = root.cloneNode(true);
    removeSelectors.forEach(function (sel) {
      clone.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    });
    return (clone.innerText || clone.textContent).replace(/\s+/g, ' ').trim();
  }

  function getMilestoneText(milestone) {
    return extractText(milestone.querySelector('.m-body'), ['.next-steps', '.deepen', '.listen-btn', '.m-num-chip']);
  }

  function getDeepenText(deepen) {
    return extractText(deepen, ['.listen-btn']);
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
    if (synth) synth.cancel();
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

  function playWithTTS(text, btn) {
    if (!synth) { onDone(btn); return; }
    var utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'sv-SE';
    utt.rate = 0.92;
    var voice = getSwedishVoice();
    if (voice) utt.voice = voice;
    utt.onend = function () { onDone(btn); };
    synth.speak(utt);
  }

  function startPlayback(path, getText, btn) {
    btn.classList.add('playing');
    btn.innerHTML = '&#9646;&#9646; Stoppa';
    currentBtn = btn;

    if (!path) {
      // Ingen mp3-bas konfigurerad – gå direkt till TTS
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

  // Röster kan laddas asynkront i vissa webbläsare
  if (synth && synth.getVoices().length === 0) {
    synth.addEventListener('voiceschanged', addListenButtons);
  } else {
    addListenButtons();
  }

  window.addEventListener('beforeunload', stopAll);
})();
