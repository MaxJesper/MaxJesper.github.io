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

      mount.innerHTML = sections.map((section, si) => {
        const qs = Array.isArray(section.questions) ? section.questions : [];
        return `
          <section class="prov-section">
            <h2 class="prov-title">${escapeHtml(section.title || "")}</h2>
            ${qs.map((qObj, qi) => renderQuestion({ qObj, si, qi, mode, storageKeyBase })).join("")}
          </section>
        `;
      }).join("");

      if (mode === "exam") {
        hydrateAndAutosave(mount);
      }
    })
    .catch(err => {
      console.error(err);
      mount.innerHTML = `<p>Det gick inte att ladda provet.</p>`;
    });
}

function renderQuestion({ qObj, si, qi, mode, storageKeyBase }) {
  const q = qObj.q || "";
  const a = qObj.a || "";
  const lines = clampInt(qObj.lines ?? 4, 2, 10);
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

function hydrateAndAutosave(root) {
  const areas = Array.from(root.querySelectorAll(".prov-answer"));
  areas.forEach(area => {
    const key = area.getAttribute("data-storage-key");
    if (!key) return;

    const saved = getStored(key);
    if (saved != null) area.value = saved;

    area.addEventListener("input", () => {
      try { localStorage.setItem(key, area.value); } catch {}
    });
  });
}

function getStored(key) {
  try { return localStorage.getItem(key); } catch { return null; }
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
