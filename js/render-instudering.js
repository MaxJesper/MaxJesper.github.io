function renderStudySet({ jsonPath, mountId, mode = "interactive" }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

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
          const id = `q-${gi}-${ii}`;

          if (mode === "interactive") {
            return `
              <div class="study-card">
                <button class="study-q" type="button" id="${id}" aria-expanded="false" aria-controls="${id}-a">
                  <span class="study-q-label">Fråga</span>
                  <span class="study-q-text">${escapeHtml(q)}</span>
                </button>
                <div class="study-a" id="${id}-a" hidden>
                  <div class="study-a-inner">
                    <div class="study-a-label">Svar</div>
                    <div class="study-a-text">${escapeHtml(a)}</div>
                  </div>
                </div>
              </div>
            `;
          }

          if (mode === "print-teacher") {
            return `
              <div class="print-item">
                <div class="print-q"><span class="tag">Fråga:</span> ${escapeHtml(q)}</div>
                <div class="print-a"><span class="tag">Facit:</span> ${escapeHtml(a)}</div>
              </div>
            `;
          }

          // print-student: olika antal rader
          const lines = clampInt(it.lines ?? defaultLinesForQuestion(q), 2, 8);
          const linesHtml = Array.from({ length: lines }).map(() => `<div class="line"></div>`).join("");

          return `
            <div class="print-item">
              <div class="print-q"><span class="tag">Fråga:</span> ${escapeHtml(q)}</div>
              <div class="print-lines">
                ${linesHtml}
              </div>
            </div>
          `;
        }).join("");

        return `
          <section class="study-group">
            <h2 class="study-group-title">${escapeHtml(title)}</h2>
            ${bodyHtml}
          </section>
        `;
      }).join("");

      if (mode === "interactive") wireInteractions(mount);
    })
    .catch(err => {
      console.error(err);
      mount.innerHTML = `<p>Det gick inte att ladda instuderingsfrågorna. Kontrollera: <code>${escapeHtml(jsonPath)}</code></p>`;
    });
}

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
        focusButton(buttons, idx + 1);
      } else if (k === "ArrowUp" || k === "Up") {
        e.preventDefault();
        focusButton(buttons, idx - 1);
      } else if (k === "Home") {
        e.preventDefault();
        focusButton(buttons, 0);
      } else if (k === "End") {
        e.preventDefault();
        focusButton(buttons, buttons.length - 1);
      } else if (k === " " || k === "Spacebar" || k === "Enter") {
        e.preventDefault();
        toggleAnswer(btn);
      }
    });
  });
}

function focusButton(buttons, newIndex) {
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= buttons.length) newIndex = buttons.length - 1;

  buttons.forEach(b => b.tabIndex = -1);
  const target = buttons[newIndex];
  target.tabIndex = 0;
  target.focus();
}

function toggleAnswer(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const newState = !expanded;
  btn.setAttribute("aria-expanded", String(newState));

  const answerId = btn.getAttribute("aria-controls");
  const answer = answerId ? document.getElementById(answerId) : null;
  if (answer) answer.hidden = !newState;
}

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
