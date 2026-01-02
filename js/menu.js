document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("side-menu");

  // ====== Bygg menyinnehåll ======
  menu.innerHTML = `
    <ul class="menu-main">

      <li class="menu-home">
        <a href="/">Hem</a>
      </li>

      <li class="menu-section">
        <button class="menu-toggle">Biologi</button>
        <ul class="submenu">
          <li><a href="/biologi/index.html">Ämnet biologi</a></li>
          <li><a href="/biologi/vad-ar-liv/">Vad är liv?</a></li>
          <li><a href="/biologi/ekologi/">Ekologi</a></li>
          <li><a href="/biologi/genetik/">Genetik</a></li>
          <li><a href="/biologi/evolution/">Evolution</a></li>
        </ul>
      </li>

      <li class="menu-section">
        <button class="menu-toggle">Kemi</button>
        <ul class="submenu">
          <li><a href="/kemi/index.html">Ämnet kemi</a></li>
          <li><a href="/kemi/periodiska-systemet/">Periodiska systemet</a></li>
        </ul>
      </li>

      <li class="menu-section">
        <button class="menu-toggle">Fysik</button>
        <ul class="submenu">
          <li><a href="/fysik/index.html">Ämnet fysik</a></li>
          <li><a href="/fysik/kraft-och-rorelse/">Kraft & rörelse</a></li>
        </ul>
      </li>

    </ul>
  `;

  // ====== Endast en undermeny öppen ======
  const toggles = document.querySelectorAll(".menu-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      toggles.forEach(t => {
        if (t !== toggle) {
          t.classList.remove("active");
          t.nextElementSibling.style.display = "none";
        }
      });

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
