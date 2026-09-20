/**
 * render-checklista.js – renderar checklistor från data/checklista.json.
 *
 * Stöd för två JSON-format (normaliseras till samma struktur):
 *   { sections: [{ id?, title, note?, items: ["text", …] }] }
 *   { groups:   [{ heading, items: [{ text }, …] }] }        (Universum)
 *
 * Översättning (arabiska, amhariska, kinyarwanda): när eleven valt språk i den gemensamma
 * språkväljaren (js/concept-lang-selector.js, localStorage 'site.concept-lang') hämtas
 * data/checklista.<ar|am|rw>.json (samma struktur som originalet) och visas TILLSAMMANS med
 * den svenska texten – svenskan ligger kvar, översättningen visas under varje punkt.
 * Översättningen läggs in i befintliga rader, så ikryssade rutor och uppfällda avsnitt
 * påverkas inte när språket byts.
 *
 * För att lägga till ett språk: lägg till en rad i CHECKLIST_LANGS + UI-texter nedan och
 * lägg filen checklista.<prefix>.json bredvid checklista.json i varje område.
 */

// Språkväljarens kod -> filprefix, textriktning och gränssnittstexter (redigeras här).
// OBS: översättningarna är AI-genererade och ännu inte korrekturlästa (se aiNote).
const CHECKLIST_LANGS = {
  "ar-SA": {
    prefix: "ar", lang: "ar", dir: "rtl",
    expandAll: "إظهار الكل", collapseAll: "طيّ الكل", reflection: "التأمّل",
    hint: "ضع علامة على ما أنت متأكد منه. اضغط على عنوان لفتح القسم.",
    aiNote: "ترجمة آلية (بالذكاء الاصطناعي) لم تُراجَع بعد؛ النص السويدي هو المرجع."
  },
  "am-ET": {
    prefix: "am", lang: "am", dir: "ltr",
    expandAll: "ሁሉንም ክፈት", collapseAll: "ሁሉንም ዝጋ", reflection: "ማሰላሰል",
    hint: "እርግጠኛ የሆናችሁበትን ነገር ምልክት አድርጉ። ክፍሉን ለመክፈት ርዕሱን ጠቅ አድርጉ።",
    aiNote: "ይህ በአርቴፊሻል ኢንተሊጀንስ የተተረጎመ ሲሆን እስካሁን በሰው አልተገመገመም፤ ዋቢው የስዊድንኛው ጽሑፍ ነው።"
  },
  "rw": {
    prefix: "rw", lang: "rw", dir: "ltr",
    expandAll: "Fungura byose", collapseAll: "Funga byose", reflection: "Kwitekerezaho",
    hint: "Shyiraho ikimenyetso ku byo wumva ufitiye icyizere. Kanda ku mutwe kugira ngo ufungure igice.",
    aiNote: "Ubu buhinduzi bwakozwe na AI kandi ntiburagenzurwa n'umuntu; ihame ni inyandiko y'Igisuwedi."
  }
};
const CHECKLIST_LANG_KEY = "site.concept-lang";
const CHECKLIST_AI_NOTE_SV = "Översättningen är gjord av AI och inte korrekturläst – den svenska texten gäller.";

// Gör om båda JSON-formaten till { sections: [{ id, title, note, items: [str] }] }
function normalizeChecklist(data) {
  const raw = Array.isArray(data && data.sections) ? data.sections
    : Array.isArray(data && data.groups) ? data.groups : [];
  return raw.map((sec, si) => ({
    id: sec.id || `section-${si}`,
    title: sec.title || sec.heading || "",
    note: sec.note || "",
    items: (Array.isArray(sec.items) ? sec.items : [])
      .map(it => (typeof it === "string" ? it : (it && it.text) || ""))
  }));
}

async function renderChecklist({ jsonPath, mountId, expandAllBtnId, collapseAllBtnId }) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  mount.innerHTML = `<p>Laddar checklistan…</p>`;

  try {
    const res = await fetch(jsonPath, { cache: "no-store" });
    if (!res.ok) throw new Error(`Kunde inte hämta JSON (${res.status})`);
    const sections = normalizeChecklist(await res.json());

    if (sections.length === 0) {
      mount.innerHTML = `<p>Inget innehåll hittades i checklistan.</p>`;
      return;
    }

    const html = sections.map((sec, si) => {
      const sid = "cl-" + sec.id;
      const title = sec.title || `Avsnitt ${si + 1}`;

      const itemsHtml = sec.items.map((text, ii) => {
        const cid = `${sid}-item-${ii}`;
        return `
          <label class="checklist-item" for="${cid}">
            <input type="checkbox" id="${cid}" />
            <span><span class="checklist-sv">${escapeHtml(text)}</span><span class="checklist-tr" data-tr="i" data-s="${si}" data-i="${ii}"></span></span>
          </label>
        `;
      }).join("");

      const noteHtml = sec.note
        ? `<p class="checklist-section-note"><span class="checklist-sv">${escapeHtml(sec.note)}</span><span class="checklist-tr" data-tr="n" data-s="${si}"></span></p>`
        : "";

      return `
        <section class="checklist-section">
          <button class="checklist-section-header" type="button" aria-expanded="false" data-target="${sid}">
            <span class="checklist-section-title"><span class="checklist-sv">${escapeHtml(title)}</span><span class="checklist-tr" data-tr="t" data-s="${si}"></span></span>
            <span class="checklist-section-toggle" aria-hidden="true">+</span>
          </button>
          <div class="checklist-section-body" id="${sid}" hidden>
            ${noteHtml}
            ${itemsHtml}
          </div>
        </section>
      `;
    }).join("");

    mount.innerHTML = html;

    // Toggle-sektioner
    mount.querySelectorAll(".checklist-section-header").forEach(btn => {
      btn.addEventListener("click", () => {
        const body = document.getElementById(btn.getAttribute("data-target"));
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

    if (expandBtn) expandBtn.addEventListener("click", () => setAllSections(mount, true));
    if (collapseBtn) collapseBtn.addEventListener("click", () => setAllSections(mount, false));

    setupChecklistTranslation({ jsonPath, mount, sections, expandBtn, collapseBtn });

  } catch (err) {
    console.error(err);
    mount.innerHTML = `<p>Det gick inte att ladda checklistan. Kontrollera att filen finns: <code>${escapeHtml(jsonPath)}</code></p>`;
  }
}

// ── Översättningslager ───────────────────────────────────────────────────────
function setupChecklistTranslation({ jsonPath, mount, sections, expandBtn, collapseBtn }) {
  const cache = {};       // prefix -> normaliserad översättning | null
  let token = 0;          // skydd mot race när språk byts snabbt
  const reflectionH2 = document.querySelector(".checklist-reflection h2");
  const baseText = new Map();
  [expandBtn, collapseBtn, reflectionH2].forEach(el => { if (el) baseText.set(el, el.textContent.trim()); });
  let infoBox = null;

  function savedCode() {
    try { return localStorage.getItem(CHECKLIST_LANG_KEY) || "sv-SE"; } catch (e) { return "sv-SE"; }
  }

  async function loadTranslation(cfg) {
    if (cfg.prefix in cache) return cache[cfg.prefix];
    let result = null;
    try {
      const url = jsonPath.replace(/\.json(\?.*)?$/, "." + cfg.prefix + ".json");
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) result = normalizeChecklist(await res.json());
    } catch (e) { /* ingen översättning tillgänglig */ }
    cache[cfg.prefix] = result;
    return result;
  }

  function setBilingual(el, sv, cfg) {
    if (!el) return;
    el.textContent = sv;
    if (cfg) {
      el.appendChild(document.createTextNode(" · "));
      const s = document.createElement("span");
      s.className = "checklist-tr-inline";
      s.lang = cfg.lang;
      s.dir = cfg.dir;
      s.textContent = cfg.text;
      el.appendChild(s);
    }
  }

  function clearAll() {
    mount.querySelectorAll(".checklist-tr").forEach(el => {
      el.textContent = "";
      el.removeAttribute("lang");
      el.removeAttribute("dir");
    });
    baseText.forEach((sv, el) => setBilingual(el, sv, null));
    if (infoBox) { infoBox.remove(); infoBox = null; }
  }

  function fill(cfg, tr) {
    const put = (el, text) => {
      if (!el) return;
      el.textContent = text || "";
      if (text) { el.lang = cfg.lang; el.dir = cfg.dir; }
    };
    mount.querySelectorAll(".checklist-tr").forEach(el => {
      const s = +el.dataset.s;
      const sec = tr[s];
      if (!sec || sec.items.length !== sections[s].items.length) { put(el, ""); return; }
      if (el.dataset.tr === "t") put(el, sec.title);
      else if (el.dataset.tr === "n") put(el, sec.note);
      else put(el, sec.items[+el.dataset.i]);
    });

    const ui = { expandAll: expandBtn, collapseAll: collapseBtn, reflection: reflectionH2 };
    Object.keys(ui).forEach(k => {
      const el = ui[k];
      if (el) setBilingual(el, baseText.get(el), { lang: cfg.lang, dir: cfg.dir, text: cfg[k] });
    });

    // Hjälptext + AI-märkning ovanför checklistan
    if (!infoBox) {
      infoBox = document.createElement("div");
      infoBox.className = "checklist-tr-info";
      infoBox.setAttribute("role", "note");
      const anchor = (expandBtn && expandBtn.parentElement) || mount;
      anchor.parentElement.insertBefore(infoBox, anchor);
    }
    infoBox.textContent = "";
    const hint = document.createElement("p");
    hint.lang = cfg.lang; hint.dir = cfg.dir; hint.textContent = cfg.hint;
    const ai = document.createElement("p");
    ai.className = "checklist-tr-ai";
    ai.lang = cfg.lang; ai.dir = cfg.dir; ai.textContent = cfg.aiNote;
    const aiSv = document.createElement("p");
    aiSv.className = "checklist-tr-ai";
    aiSv.lang = "sv"; aiSv.textContent = CHECKLIST_AI_NOTE_SV;
    infoBox.append(hint, ai, aiSv);
  }

  async function applyLang(code) {
    const my = ++token;
    const cfg = CHECKLIST_LANGS[code];
    if (!cfg) { clearAll(); return; }
    const tr = await loadTranslation(cfg);
    if (my !== token) return;              // annat språk hann väljas
    if (!tr || tr.length !== sections.length) {
      console.warn("[checklista] Ingen användbar översättning för", code);
      clearAll();
      return;
    }
    fill(cfg, tr);
  }

  window.addEventListener("conceptLangChange", e => applyLang((e.detail && e.detail.code) || savedCode()));
  window.addEventListener("storage", e => { if (e.key === CHECKLIST_LANG_KEY) applyLang(e.newValue || "sv-SE"); });
  applyLang(savedCode());
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
