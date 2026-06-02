/**
 * concepts-popup.js
 * Delade begreppspopups för alla områden.
 *
 * Användning i index.html:
 *   <script src="/js/concepts-popup.js" data-begrepp="/fysik/universum/data/begrepp.json"></script>
 *
 * Begrepp i listan markeras med data-concept="BegreppNamn":
 *   <li><button class="concept-btn" data-concept="Magnetfält">Magnetfält</button></li>
 */

(function () {
  // ── Modal-HTML ──────────────────────────────────────────────────────────────
  const MODAL_ID = 'concept-modal';

  function createModal() {
    const el = document.createElement('div');
    el.id = MODAL_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'concept-modal-title');
    el.hidden = true;
    el.innerHTML = `
      <div class="cm-backdrop"></div>
      <div class="cm-card">
        <button class="cm-close" aria-label="Stäng">&times;</button>
        <h3 class="cm-title" id="concept-modal-title"></h3>
        <p class="cm-definition"></p>
        <a class="cm-link" href="#" target="_self">Läs mer i Studieguiden →</a>
      </div>`;
    document.body.appendChild(el);
    return el;
  }

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const STYLE = `
#concept-modal { position: fixed; inset: 0; z-index: 9000; }
#concept-modal[hidden] { display: none; }
.cm-backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  animation: cm-fade-in 0.15s ease;
}
.cm-card {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 14px;
  padding: 1.4rem 1.5rem 1.2rem;
  max-width: 380px;
  width: calc(100% - 2rem);
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  animation: cm-pop-in 0.17s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cm-close {
  position: absolute; top: 0.7rem; right: 0.9rem;
  background: none; border: none;
  font-size: 1.5rem; line-height: 1;
  cursor: pointer; color: #666;
  padding: 0.1rem 0.3rem;
}
.cm-close:hover { color: #111; }
.cm-title {
  margin: 0 2rem 0.6rem 0;
  font-size: 1.1rem;
  color: var(--area-strong, #1e3466);
}
.cm-definition {
  margin: 0 0 0.9rem 0;
  font-size: 0.97rem;
  line-height: 1.6;
  color: #1f2937;
}
.cm-link {
  display: inline-block;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--area-strong, #1e3466);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cm-link[hidden] { display: none; }
.concept-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: left;
  text-decoration: none;
}
.concept-btn:hover {
  text-decoration: underline;
  color: var(--area-strong, #1e3466);
}
@keyframes cm-fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes cm-pop-in   { from { opacity: 0; transform: translate(-50%,-48%) scale(0.94) }
                         to   { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
`;

  function injectStyle() {
    const s = document.createElement('style');
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  // ── Kärna ───────────────────────────────────────────────────────────────────
  let concepts = {};   // { "BegreppNamn": { definition, anchor } }
  let modal, backdrop, card, titleEl, defEl, linkEl;
  let prevFocus = null;

  function openModal(name) {
    const data = concepts[name] || concepts[name.toLowerCase()];
    if (!data) return;

    titleEl.textContent = name;
    defEl.textContent = data.definition;

    if (data.anchor) {
      linkEl.href = data.anchor;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }

    prevFocus = document.activeElement;
    modal.hidden = false;
    card.querySelector('.cm-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    if (prevFocus) prevFocus.focus();
  }

  function initModal() {
    modal    = document.getElementById(MODAL_ID) || createModal();
    backdrop = modal.querySelector('.cm-backdrop');
    card     = modal.querySelector('.cm-card');
    titleEl  = modal.querySelector('.cm-title');
    defEl    = modal.querySelector('.cm-definition');
    linkEl   = modal.querySelector('.cm-link');

    backdrop.addEventListener('click', closeModal);
    modal.querySelector('.cm-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function attachButtons() {
    document.querySelectorAll('[data-concept]').forEach((el) => {
      // Konvertera <a> till <button> om det behövs (bakåtkompatibilitet)
      if (el.tagName === 'A') {
        const btn = document.createElement('button');
        btn.className = 'concept-btn';
        btn.dataset.concept = el.dataset.concept;
        btn.textContent = el.textContent;
        el.replaceWith(btn);
      } else {
        el.classList.add('concept-btn');
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-concept]');
      if (btn) {
        e.preventDefault();
        openModal(btn.dataset.concept);
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    const script = document.currentScript ||
      document.querySelector('script[data-begrepp]');
    const jsonUrl = script && script.dataset.begrepp;
    if (!jsonUrl) return;

    injectStyle();
    initModal();
    attachButtons();

    fetch(jsonUrl)
      .then((r) => r.json())
      .then((data) => {
        // Stöd både array [{namn, definition, anchor}] och objekt {namn: {…}}
        if (Array.isArray(data)) {
          data.forEach((item) => {
            concepts[item.namn] = { definition: item.definition, anchor: item.anchor || null };
            // Även lowercase-nyckel för robusthet
            concepts[item.namn.toLowerCase()] = concepts[item.namn];
          });
        } else {
          concepts = data;
        }
      })
      .catch((err) => console.warn('concepts-popup: kunde inte ladda', jsonUrl, err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
