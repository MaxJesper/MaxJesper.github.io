async function renderChecklist({ jsonPath, mountId, expandAllBtnId, collapseAllBtnId }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `<p>Laddar checklistan…</p>`;

  try {
    const res = await fetch(jsonPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Kunde inte hämta JSON (${res.status})`);
    const data = await res.json();

    const sections = Array.isArray(data.sections) ? data.sections : [];

    if (sections.length === 0) {
      mount.innerHTML = `<p>Inget innehåll hittades i checklistan.</p>`;
      return;
    }

    const html = sections.map((sec, si) => {
      const sid = sec.id || `section-${si}`;
      const title = sec.title || `Avsnitt ${si + 1}`;
      const items = Array.isArray(sec.items) ? sec.items : [];

      const itemsHtml = items.map((text, ii) => {
        const cid = `${sid}-item-${ii}`;
        return `
          <label class="checklist-item" for="${cid}">
            <input type="checkbox" id="${cid}" />
            <span>${escapeHtml(text)}</span>
          </label>
        `;
      }).join("");

      return `
        <section class="checklist-section">
          <button class="checklist-section-header" type="button" aria-expanded="false" data-target="${sid}">
            <span class="checklist-section-title">${escapeHtml(title)}</span>
            <span class="checklist-section-toggle">+</span>
          </button>
          <div class="checklist-section-body" id="${sid}" hidden>
            ${itemsHtml}
          </div>
        </section>
      `;
    }).join("");

    mount.innerHTML = html;

    // Toggle-sektioner
    const headers = mount.querySelectorAll(".checklist-section-header");
    headers.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const body = document.getElementById(targetId);
        const expanded = btn.getAttribute("aria-expanded") === "true";

        btn.setAttribute("aria-expanded", String(!expanded));
        const toggleEl = btn.querySelector(".checklist-section-toggle");
        if (toggleEl) toggleEl.textContent = expanded ? "+" : "–";

        if (body) body.hidden = expanded;
      });
    });

    // Visa alla / Fäll ihop
    const expandBtn = document.getElementById(expandAllBtnId);
    const collapseBtn = document.getElementById(collapseAllBtnId);

    if (expandBtn) {
      expandBtn.addEventListener("click", () => setAllSections(mount, true));
    }
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => setAllSections(mount, false));
    }

  } catch (err) {
    console.error(err);
    mount.innerHTML = `<p>Det gick inte att ladda checklistan. Kontrollera att filen finns: <code>${jsonPath}</code></p>`;
  }
}

function setAllSections(mount, open) {
  const headers = mount.querySelectorAll(".checklist-section-header");
  headers.forEach(btn => {
    const targetId = btn.getAttribute("data-target");
    const body = document.getElementById(targetId);
    btn.setAttribute("aria-expanded", String(open));
    const toggleEl = btn.querySelector(".checklist-section-toggle");
    if (toggleEl) toggleEl.textContent = open ? "–" : "+";
    if (body) body.hidden = !open;
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
