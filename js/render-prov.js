function renderProv({ jsonPath, mountId, mode = "exam" }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  const storageKeyBase = `examAnswers::${jsonPath}`;

  mount.innerHTML = `<p>Laddar…</p>`;

  fetch(jsonPath, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`Kunde inte hämta JSON (${r.status})`);
      return r.json();
    })
    .then(data => {
      const sections = Array.isArray(data.sections) ? data.sections : [];
      if (sections.length === 0) {
        mount.innerHTML = `<p>Inget prov hittades.</p>`;
        return;
      }

      let globalQuestionNumber = 0;

      mount.innerHTML = sections
        .map((section, si) => {
          const qs = Array.isArray(section.questions) ? section.questions : [];

          const questionsHtml = qs.map((qObj, qi) => {
            globalQuestionNumber += 1;
            return renderQuestion({
              qObj,
              si,
              qi,
              qNumber: globalQuestionNumber,
              mode,
              storageKeyBase
            });
          }).join("");

          return `
            <section class="prov-section" data-section-index="${si}">
              <h2 class="prov-title">${escapeHtml(section.title || "")}</h2>
              ${questionsHtml}
            </section>
          `;
        })
        .join("");

      if (mode === "exam") {
        hydrateAndAutosaveTextareas(mount);
        enableKemiInput(mount);
        hydrateAndAutosaveMatchInputs(mount);
      }
    })
    .catch(err => {
      console.error(err);
      mount.innerHTML = `<p>Det gick inte att ladda provet.</p>`;
    });
}

/* =========================================================
   Render en fråga (vanlig eller matchning)
   ========================================================= */
function renderQuestion({ qObj, si, qi, qNumber, mode, storageKeyBase }) {
  // ----------------------
  // MATCH-FRÅGA
  // ----------------------
  if (qObj.type === "match") {
    const title = qObj.title || "Para ihop begrepp med rätt förklaring.";
    const left = Array.isArray(qObj.left) ? qObj.left : [];
    const right = Array.isArray(qObj.right) ? qObj.right : [];
    const facit = qObj.a || "";

    if (mode === "facit" || mode === "print-facit") {
      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(title)}</p>
          <div class="prov-facit">${escapeHtml(facit)}</div>
        </div>
      `;
    }

    if (mode === "exam") {
      const leftHtml = left
        .map((item, li) => {
          const id = `s${si}-q${qi}-m${li}`;
          const key = `${storageKeyBase}::${id}`;
          return `
            <div class="match-row">
              <input class="match-input" type="text" inputmode="text" maxlength="1"
                     aria-label="Svara för ${escapeHtml(item)}"
                     data-storage-key="${escapeHtml(key)}" />
              <span>${escapeHtml(item)}</span>
            </div>
          `;
        })
        .join("");

      const rightHtml = right.map(item => `<div>${escapeHtml(item)}</div>`).join("");

      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(title)}</p>
          <div class="match-grid">
            <div class="match-left">
              ${leftHtml}
            </div>
            <div class="match-right">
              ${rightHtml}
            </div>
          </div>
        </div>
      `;
    }

    if (mode === "print-exam") {
      const leftHtml = left
        .map((item, li) => {
          const id = `s${si}-q${qi}-m${li}`;
          const key = `${storageKeyBase}::${id}`;
          const saved = getStored(key);
          const boxContent = saved && saved.trim().length ? escapeHtml(saved.trim()) : "&nbsp;";
          return `
            <div class="match-row">
              <span class="match-box">${boxContent}</span>
              <span>${escapeHtml(item)}</span>
            </div>
          `;
        })
        .join("");

      const rightHtml = right.map(item => `<div>${escapeHtml(item)}</div>`).join("");

      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(title)}</p>
          <div class="match-grid">
            <div class="match-left">
              ${leftHtml}
            </div>
            <div class="match-right">
              ${rightHtml}
            </div>
          </div>
        </div>
      `;
    }

    return "";
  }

  // ----------------------
  // VANLIG FRÅGA
  // ----------------------
  const q = qObj.q || "";
  const a = qObj.a || "";
  const lines = clampInt(qObj.lines ?? 4, 2, 12);
  const qid = `s${si}-q${qi}`;
  const key = `${storageKeyBase}::${qid}`;

  if (mode === "facit" || mode === "print-facit") {
    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(q)}</p>
        <div class="prov-facit">${escapeHtml(a)}</div>
      </div>
    `;
  }

  if (mode === "exam") {
    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(q)}</p>
        <textarea class="prov-answer"
          rows="${lines}"
          data-storage-key="${escapeHtml(key)}"
          placeholder="Skriv ditt svar här..."></textarea>
        ${Number(qObj.draw) > 0 ? `<p class="prov-draw-hint">✏️ Ritar du delen av svaret gör du det på papper – skriv här bara det som ska skrivas.</p>` : ""}
      </div>
    `;
  }

  if (mode === "print-exam") {
    const saved = getStored(key);
    const drawMm0 = Number(qObj.draw);
    if (!(drawMm0 > 0) && saved && saved.trim().length > 0) {
      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(q)}</p>
          <div class="prov-student-answer">${escapeHtml(saved).replaceAll("\n", "<br>")}</div>
        </div>
      `;
    }

    // Ritfrågor ("draw": <höjd i mm>): inga skrivlinjer, i stället ett fritt utrymme att rita i.
    const drawMm = Number(qObj.draw);
    if (drawMm > 0) {
      const h = Math.min(Math.max(drawMm, 20), 160);
      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(q)}</p>
          ${saved && saved.trim().length > 0 ? `<div class="prov-student-answer">${escapeHtml(saved).replaceAll("\n", "<br>")}</div>` : ""}
          <div class="prov-draw" style="height:${h}mm" role="img" aria-label="Utrymme för att rita"></div>
        </div>
      `;
    }

    const lineHtml = Array.from({ length: lines })
      .map(() => `<div class="prov-line"></div>`)
      .join("");

    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qNumber}.</strong> ${escapeHtml(q)}</p>
        <div class="prov-lines">${lineHtml}</div>
      </div>
    `;
  }

  return "";
}

/* =========================================================
   Autosave: textareas
   ========================================================= */
// Kemiområden: eleven ska kunna skriva formler digitalt (nedsänkta siffror, pil, laddning) – se js/kemi-inmatning.js
function enableKemiInput(root) {
  if (!/(^|\/)kemi\//.test(location.pathname)) return;
  const run = () => root.querySelectorAll(".prov-answer").forEach(el => window.KemiInput.enhance(el));
  if (window.KemiInput) { run(); return; }
  const sc = document.createElement("script");
  sc.src = "/js/kemi-inmatning.js";
  sc.onload = run;
  document.head.appendChild(sc);
}

function hydrateAndAutosaveTextareas(root) {
  const areas = Array.from(root.querySelectorAll(".prov-answer"));
  areas.forEach(area => {
    const key = area.getAttribute("data-storage-key");
    if (!key) return;

    const saved = getStored(key);
    if (saved != null) area.value = saved;

    area.addEventListener("input", () => {
      try {
        localStorage.setItem(key, area.value);
      } catch (e) {
        console.warn("Kunde inte spara i localStorage.", e);
      }
    });
  });
}

/* =========================================================
   Autosave: match inputs
   ========================================================= */
function hydrateAndAutosaveMatchInputs(root) {
  const inputs = Array.from(root.querySelectorAll(".match-input"));
  inputs.forEach(inp => {
    const key = inp.getAttribute("data-storage-key");
    if (!key) return;

    const saved = getStored(key);
    if (saved != null) inp.value = saved;

    inp.addEventListener("input", () => {
      let v = inp.value.replace(/[^a-zA-ZåäöÅÄÖ0-9]/g, "");
      if (v.length > 1) v = v.slice(0, 1);
      v = v.toUpperCase();
      inp.value = v;

      try {
        localStorage.setItem(key, inp.value);
      } catch (e) {
        console.warn("Kunde inte spara i localStorage.", e);
      }
    });
  });
}

/* =========================================================
   Storage helpers
   ========================================================= */
function getStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/* =========================================================
   Utilities
   ========================================================= */
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
