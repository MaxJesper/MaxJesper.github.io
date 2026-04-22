document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("side-menu");

  // ====== Gör hamburgerknappen tydligare (ikon + "Meny"-text) ======
  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.setAttribute("aria-label", "Öppna meny");
    hamburger.setAttribute("aria-controls", "side-menu");
    hamburger.innerHTML =
      '<span class="hamburger-icon" aria-hidden="true">☰</span>' +
      '<span class="hamburger-label">Meny</span>';
  }

  // ====== Bygg menyinnehåll ======
  menu.innerHTML = `
    <ul class="menu-main">

      <!-- Hem -->
      <li class="menu-home">
        <a href="/">Hem</a>
      </li>

      <!-- Biologi -->
      <li class="menu-section">
        <button class="menu-toggle">Biologi</button>
        <ul class="submenu">
          <li><a href="/biologi/index.html">Ämnet biologi</a></li>
          <li><a href="/biologi/vad-ar-liv/">Vad är liv?</a></li>
          <li><a href="/biologi/ekologi/">Ekologi</a></li>
          <li><a href="/biologi/Sex-och-relationer/">Sex & relationer</a></li>
          <li><a href="/biologi/hjarta-blod-lungor/">Hjärta, blod & lungor</a></li>
          <li><a href="/biologi/immunologi/">Immunologi</a></li>
          <li><a href="/biologi/matspjalkningen/">Matspjälkningen</a></li>
          <li><a href="/biologi/nervsystemet/">Nervsystemet</a></li>
          <li><a href="/biologi/sinnena/">Sinnena</a></li>
          <li><a href="/biologi/genetik/">Genetik</a></li>
          <li><a href="/biologi/evolution/">Evolution</a></li>
          <li><a href="/biologi/infektionssjukdomar/">Infektionssjukdomar</a></li>
        </ul>
      </li>

      <!-- Kemi -->
      <li class="menu-section">
        <button class="menu-toggle">Kemi</button>
        <ul class="submenu">
          <li><a href="/kemi/index.html">Ämnet kemi</a></li>
          <li><a href="/kemi/atomer/">Atomer & Molekyler</a></li>
          <li><a href="/kemi/separationsprocesser/">Separationsprocesser</a></li>
          <li><a href="/kemi/syror-och-baser/">Syror & Baser</a></li>
          <li><a href="/kemi/kolforeningar/">Kolföreningar</a></li>
          <li><a href="/kemi/matens-kemi/">Matens kemi</a></li>
          <li><a href="/kemi/periodiska-systemet/">Periodiska systemet</a></li>
          <li><a href="/kemi/jonforeningar/">Jonföreningar</a></li>
          <li><a href="/kemi/elektrokemi/">Elektrokemi</a></li>
        </ul>
      </li>

      <!-- Fysik -->
      <li class="menu-section">
        <button class="menu-toggle">Fysik</button>
        <ul class="submenu">
          <li><a href="/fysik/index.html">Ämnet fysik</a></li>
          <li><a href="/fysik/materia/">Materia</a></li>
          <li><a href="/fysik/kraft-och-rorelse/">Kraft & Rörelse</a></li>
          <li><a href="/fysik/tryck/">Tryck</a></li>
          <li><a href="/fysik/universum/">Universum</a></li>
          <li><a href="/fysik/ljud/">Ljud</a></li>
          <li><a href="/fysik/ljus/">Ljus</a></li>
          <li><a href="/fysik/elektricitet/">El & Ohms lag</a></li>
          <li><a href="/fysik/magnetism-induktion/">Magnetism & induktion</a></li>
          <li><a href="/fysik/arbete-energi-effekt/">Arbete, Energi & Effekt</a></li>
          <li><a href="/fysik/atomfysik/">Atomfysik</a></li>
        </ul>
      </li>

    </ul>
  `;

  // ====== Bygg gemensam site-footer ======
  if (!document.querySelector("footer.site-footer")) {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = `
      <div class="footer-inner">
        <p>
          © 2026 Jesper Tordsson ·
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.sv"
             rel="license" target="_blank" title="Creative Commons – Erkännande-IckeKommersiell-DelaLika 4.0">
            Licens: CC BY-NC-SA 4.0
          </a>
        </p>
        <p class="footer-sub">
          Fri att använda och anpassa i undervisning. Ej tillåten för kommersiella syften.
        </p>
      </div>
    `;
    document.body.appendChild(footer);
  }

  // ====== Endast en undermeny öppen ======
  const toggles = document.querySelectorAll(".menu-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      // Stäng alla andra
      toggles.forEach(t => {
        if (t !== toggle) {
          t.classList.remove("active");
          t.nextElementSibling.style.display = "none";
        }
      });

      // Växla denna
      toggle.classList.toggle("active");
      const submenu = toggle.nextElementSibling;
      submenu.style.display =
        submenu.style.display === "block" ? "none" : "block";
    });
  });
});

// ====== Öppna / stäng hamburgermenyn ======
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  menu.classList.toggle("open");
}
