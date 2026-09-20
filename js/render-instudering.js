function renderStudySet({ jsonPath, mountId, mode = "interactive" }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const storageKeyBase = `studyAnswers::${jsonPath}`;

  mount.innerHTML = `<p>Laddar instuderingsfrågor…</p>`;

  fetch(jsonPath, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`Kunde inte hämta JSON (${r.status})`);
      return r.json();
    })
    .then(data => {
      const groups = Array.isArray(data.groups) ? data.groups : [];
      const figures = data.figures || {};

      if (groups.length === 0) {
        mount.innerHTML = `<p>Inget innehåll hittades.</p>`;
        return;
      }

      let globalQNum = 0;
      mount.innerHTML = groups.map((g, gi) => {
        const title = g.title || `Del ${gi + 1}`;
        const items = Array.isArray(g.items) ? g.items : [];

        const bodyHtml = items.map((it, ii) => {
          if (it.type === "figure") {
            const fig = figures[it.title] || null;
            const svg = fig?.svg || "";
            const caption = it.caption ? escapeHtml(it.caption) : "";
            return `
              <figure class="study-figure">
                <div class="study-figure-svg">${svg}</div>
                ${caption ? `<figcaption>${caption}</figcaption>` : ``}
              </figure>
            `;
          }

          const q = it.q || "";
          const a = it.a || "";
          const qNum = ++globalQNum;
          const qid = `q-${gi}-${ii}`; // stabil id i detta JSON
          const answerStorageKey = `${storageKeyBase}::${qid}`;

          if (mode === "interactive") {
            return `
              <div class="study-card">
                <button class="study-q" type="button" id="${qid}"
                        aria-expanded="false" aria-controls="${qid}-a">
                  <span class="study-q-label">Fråga ${qNum}</span>
                  <span class="study-q-text">${escapeHtml(q)}</span>
                </button>

                ${drawNoteHtml(it)}
                <div class="study-youranswer">
                  <div class="study-youranswer-label">Mitt svar</div>
                  <textarea class="study-youranswer-input"
                            rows="${clampInt(it.lines ?? defaultLinesForQuestion(q), 2, 8)}"
                            data-storage-key="${escapeHtml(answerStorageKey)}"
                            placeholder="Skriv ditt svar här..."></textarea>
                </div>

                <div class="study-a" id="${qid}-a" hidden>
                  <div class="study-a-inner">
                    <div class="study-a-label">Svar / Facit</div>
                    <div class="study-a-text">${escapeHtml(a)}</div>
                  </div>
                </div>
              </div>
            `;
          }

          if (mode === "print-teacher") {
            return `
              <div class="print-item">
                <div class="print-q"><span class="tag">Fråga ${qNum}:</span> ${escapeHtml(q)}</div>
                <div class="print-a"><span class="tag">Facit:</span> ${escapeHtml(a)}</div>
              </div>
            `;
          }

          // print-student: om elevens svar finns -> skriv ut det, annars linjer
          const saved = getStoredAnswer(answerStorageKey);
          if (saved && saved.trim().length > 0) {
            return `
              <div class="print-item">
                <div class="print-q"><span class="tag">Fråga ${qNum}:</span> ${escapeHtml(q)}</div>
                <div class="print-student-answer">
                  ${escapeHtml(saved).replaceAll("\n", "<br>")}
                </div>
                ${drawBoxHtml(it)}
              </div>
            `;
          } else {
            const lines = clampInt(it.lines ?? defaultLinesForQuestion(q), 2, 8);
            const linesHtml = Array.from({ length: lines }).map(() => `<div class="line"></div>`).join("");
            return `
              <div class="print-item">
                <div class="print-q"><span class="tag">Fråga ${qNum}:</span> ${escapeHtml(q)}</div>
                <div class="print-lines">${linesHtml}</div>
                ${drawBoxHtml(it)}
              </div>
            `;
          }
        }).join("");

        return `
          <section class="study-group">
            <h2 class="study-group-title">${escapeHtml(title)}</h2>
            ${bodyHtml}
          </section>
        `;
      }).join("");

      if (mode === "interactive") {
        wireInteractions(mount);
        hydrateAndAutosaveTextareas(mount);
        enableKemiInput(mount);
      }
    })
    .catch(err => {
      console.error(err);
      mount.innerHTML = `<p>Det gick inte att ladda instuderingsfrågorna. Kontrollera: <code>${escapeHtml(jsonPath)}</code></p>`;
    });
}

/* ===== Ritdelar och kemiska formler ===== */

// "draw": <höjd i mm> på en fråga = frågan innehåller något eleven ska RITA (strukturformel, atom …).
// På skärmen går det inte att rita: en tydlig notering visas. Vid utskrift får eleven ett fritt ritutrymme.
function drawNoteHtml(it) {
  if (!(Number(it.draw) > 0)) return "";
  const txt = it.drawNote || "Ritdelen gör du på papper eller i ditt skrivhäfte – skriv här bara det som ska skrivas.";
  return `<p class="study-drawnote">✏️ ${escapeHtml(txt)}</p>`;
}

function drawBoxHtml(it) {
  const mm = Number(it.draw);
  if (!(mm > 0)) return "";
  const h = Math.min(Math.max(mm, 20), 120);
  return `<div class="print-draw" style="height:${h}mm" role="img" aria-label="Utrymme för att rita"></div>`;
}

// Kemiområden: eleven ska kunna skriva formler digitalt (nedsänkta siffror, pil, laddning) – se js/kemi-inmatning.js
function enableKemiInput(root) {
  if (!/(^|\/)kemi\//.test(location.pathname)) return;
  const run = () => root.querySelectorAll(".study-youranswer-input").forEach(el => window.KemiInput.enhance(el));
  if (window.KemiInput) { run(); return; }
  const sc = document.createElement("script");
  sc.src = "/js/kemi-inmatning.js";
  sc.onload = run;
  document.head.appendChild(sc);
}

/* ===== Tangentbord + toggle ===== */

function wireInteractions(root) {
  const buttons = Array.from(root.querySelectorAll(".study-q"));
  if (buttons.length === 0) return;

  buttons.forEach((b, i) => b.tabIndex = i === 0 ? 0 : -1);

  buttons.forEach((btn, idx) => {
    btn.addEventListener("click", () => toggleAnswer(btn));

    btn.addEventListener("keydown", (e) => {
      const k = e.key;

      if (k === "ArrowDown" || k === "Down") {
        e.preventDefault();
        focusButton(buttons, idx + 1, btn);
      } else if (k === "ArrowUp" || k === "Up") {
        e.preventDefault();
        focusButton(buttons, idx - 1, btn);
      } else if (k === "Home") {
        e.preventDefault();
        focusButton(buttons, 0, btn);
      } else if (k === "End") {
        e.preventDefault();
        focusButton(buttons, buttons.length - 1, btn);
      } else if (k === " " || k === "Spacebar" || k === "Enter") {
        e.preventDefault();
        toggleAnswer(btn);
      }
    });
  });
}

// Flytta fokus till en annan fråga OCH rulla sidan så att den nya frågan hamnar exakt där den
// förra stod på skärmen. Då kan eleven bläddra med piltangenterna utan att röra pekplattan.
// Står den förra frågan långt ner (eller utanför skärmen) placeras den nya i stället ca 20 %
// från skärmens överkant, och därefter hålls positionen konstant.
function focusButton(buttons, newIndex, fromBtn) {
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= buttons.length) newIndex = buttons.length - 1;

  buttons.forEach(b => b.tabIndex = -1);
  const target = buttons[newIndex];
  target.tabIndex = 0;

  const vh = window.innerHeight || document.documentElement.clientHeight || 800;
  let anchor = fromBtn ? fromBtn.getBoundingClientRect().top : null;
  if (anchor === null || anchor < 16 || anchor > vh * 0.5) anchor = Math.round(vh * 0.2);

  target.focus({ preventScroll: true });
  const delta = target.getBoundingClientRect().top - anchor;
  if (Math.abs(delta) > 1) window.scrollBy(0, delta);
}

function toggleAnswer(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const newState = !expanded;
  btn.setAttribute("aria-expanded", String(newState));

  const answerId = btn.getAttribute("aria-controls");
  const answer = answerId ? document.getElementById(answerId) : null;
  if (answer) answer.hidden = !newState;
}

/* ===== Autosave elevsvar ===== */

function hydrateAndAutosaveTextareas(root) {
  const areas = Array.from(root.querySelectorAll(".study-youranswer-input"));
  areas.forEach(area => {
    const key = area.getAttribute("data-storage-key");
    if (!key) return;

    const saved = getStoredAnswer(key);
    if (saved != null) area.value = saved;

    area.addEventListener("input", () => {
      try {
        localStorage.setItem(key, area.value);
      } catch (e) {
        // Om localStorage är fullt eller blockerat
        console.warn("Kunde inte spara elevsvar i localStorage.", e);
      }
    });
  });
}

function getStoredAnswer(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/* ===== Helpers ===== */

function defaultLinesForQuestion(q) {
  const s = String(q).toLowerCase();
  if (s.startsWith("vad är") || s.startsWith("ge ") || s.includes("enhet")) return 2;
  if (s.includes("förklara") || s.includes("varför") || s.includes("hur kan")) return 4;
  if (s.includes("beräkna") || s.includes("räkna") || s.includes("vilken volym") || s.includes("vilken massa")) return 5;
  return 3;
}

function clampInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
