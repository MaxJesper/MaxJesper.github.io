/* ==========================================================================
   Bildzoom – klicka på en bild för att se den i fullstorlek.
   Görs generellt: alla bilder inuti .side-fig, .fig-row figure, .fig-pair,
   .milestone figure, .area-hero-image och .hero-banner blir klickbara,
   OM de inte redan ligger i en <a>-länk (t.ex. en bild som länkar till en PDF)
   eller har data-no-zoom.
   Se CLAUDE.md, avsnittet "Bildzoom (klicka för att förstora)".
   ========================================================================== */
(function () {
  function initBildzoom() {
    var overlay = document.createElement("div");
    overlay.className = "bildzoom-overlay";
    overlay.innerHTML =
      '<button type="button" class="bildzoom-close" aria-label="Stäng förstorad bild">&times;</button>' +
      '<figure><img alt="" /><figcaption></figcaption></figure>';
    document.body.appendChild(overlay);

    var imgEl = overlay.querySelector("img");
    var capEl = overlay.querySelector("figcaption");
    var closeBtn = overlay.querySelector(".bildzoom-close");
    var lastFocused = null;

    function close() {
      overlay.classList.remove("open");
      document.body.classList.remove("bildzoom-lock");
      if (lastFocused) lastFocused.focus();
    }
    function open(trigger) {
      var fullSrc = trigger.getAttribute("data-full") || trigger.src;
      imgEl.src = fullSrc;
      imgEl.alt = trigger.alt || "";
      var fig = trigger.closest("figure");
      var captionEl = fig ? fig.querySelector("figcaption") : null;
      if (captionEl) {
        capEl.innerHTML = captionEl.innerHTML;
        capEl.style.display = "";
      } else {
        capEl.innerHTML = "";
        capEl.style.display = "none";
      }
      lastFocused = trigger;
      overlay.classList.add("open");
      document.body.classList.add("bildzoom-lock");
      closeBtn.focus();
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    var selector =
      ".side-fig img, .fig-row figure img, .fig-pair img, .milestone figure img, .area-hero-image img, .hero-banner img";
    var candidates = document.querySelectorAll(selector);
    candidates.forEach(function (img) {
      if (img.closest("a")) return; // bilden är redan en länk (t.ex. till en PDF) – rör inte den
      if (img.hasAttribute("data-no-zoom")) return;
      img.classList.add("bildzoom-trigger");
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      var zoomLabel = img.alt ? img.alt + " – klicka för att förstora" : "Klicka för att förstora bilden";
      img.setAttribute("aria-label", zoomLabel);
      function trigger() { open(img); }
      img.addEventListener("click", trigger);
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBildzoom);
  } else {
    initBildzoom();
  }
})();
