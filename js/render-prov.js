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

      mount.innerHTML = sections
        .map((section, si) => {
          const qs = Array.isArray(section.questions) ? section.questions : [];
          return `
            <section class="prov-section" data-section-index="${si}">
              <h2 class="prov-title">${escapeHtml(section.title || "")}</h2>
              ${qs
                .map((qObj, qi) =>
                  renderQuestion({ qObj, si, qi, mode, storageKeyBase })
                )
                .join("")}
            </section>
          `;
        })
        .join("");

      if (mode === "exam") {
        hydrateAndAutosaveTextareas(mount);
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
function renderQuestion({ qObj, si, qi, mode, storageKeyBase }) {
  // ----------------------
  // MATCH-FRÅGA
  // ----------------------
  if (qObj.type === "match") {
    const title = qObj.title || "Para ihop begrepp med rätt förklaring.";
    const left = Array.isArray(qObj.left) ? qObj.left : [];
    const right = Array.isArray(qObj.right) ? qObj.right : [];
    const facit = qObj.a || "";

    // Facit-läge: visa bara facittext (snyggt och kort)
    if (mode === "facit" || mode === "print-facit") {
      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(title)}</p>
          <div class="prov-facit">${escapeHtml(facit)}</div>
        </div>
      `;
    }

    // Digitalt prov: små inputs (1–8) framför begreppen
    if (mode === "exam") {
      const leftHtml = left
        .map((item, li) => {
          const id = `s${si}-q${qi}-m${li}`;
          const key = `${storageKeyBase}::${id}`;
          return `
            <div class="match-row">
              <input class="match-input" type="text" inputmode="numeric" maxlength="1"
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
          <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(title)}</p>
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

    // Utskrift: visa tomma rutor (eller elevens sparade siffror om de finns)
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
          <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(title)}</p>
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
  // VANLIG FRÅGA (qa)
  // ----------------------
  const q = qObj.q || "";
  const a = qObj.a || "";
  const lines = clampInt(qObj.lines ?? 4, 2, 12);
  const qid = `s${si}-q${qi}`;
  const key = `${storageKeyBase}::${qid}`;

  // FACIT
  if (mode === "facit" || mode === "print-facit") {
    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(q)}</p>
        <div class="prov-facit">${escapeHtml(a)}</div>
      </div>
    `;
  }

  // DIGITALT PROV (skrivbart)
  if (mode === "exam") {
    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(q)}</p>
        <textarea class="prov-answer"
          rows="${lines}"
          data-storage-key="${escapeHtml(key)}"
          placeholder="Skriv ditt svar här..."></textarea>
      </div>
    `;
  }

  // UTSKRIFT PROV: skriv ut elevens sparade svar om det finns, annars linjer
  if (mode === "print-exam") {
    const saved = getStored(key);
    if (saved && saved.trim().length > 0) {
      return `
        <div class="prov-item">
          <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(q)}</p>
          <div class="prov-student-answer">${escapeHtml(saved).replaceAll("\n", "<br>")}</div>
        </div>
      `;
    }

    const lineHtml = Array.from({ length: lines })
      .map(() => `<div class="prov-line"></div>`)
      .join("");

    return `
      <div class="prov-item">
        <p class="prov-q"><strong>${qi + 1}.</strong> ${escapeHtml(q)}</p>
        <div class="prov-lines">${lineHtml}</div>
      </div>
    `;
  }

  return "";
}

/* =========================================================
   Autosave: textareas
   ========================================================= */
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
      // Tillåt bara en siffra 1–8
      let v = inp.value.replace(/[^\d]/g, "");
      if (v.length > 1) v = v.slice(0, 1);
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
