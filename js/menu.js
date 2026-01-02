document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("side-menu");

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
          <li><a href="/biologi/sex-och-relationer/">Sex & relationer</a></li>
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
          <li><a href="/kemi/atomer-och-molekyler/">Atomer & molekyler</a></li>
          <li><a href="/kemi/separationsprocesser/">Separationsprocesser</a></li>
          <li><a href="/kemi/syror-och-baser/">Syror & baser</a></li>
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
          <li><a href="/fysik/kraft-och-rorelse/">Kraft & rörelse</a></li>
          <li><a href="/fysik/tryck/">Tryck</a></li>
          <li><a href="/fysik/universum/">Universum</a></li>
          <li><a href="/fysik/ljud/">Ljud</a></li>
          <li><a href="/fysik/ljus/">Ljus</a></li>
          <li><a href="/fysik/magnetism-induktion/">Magnetism & induktion</a></li>
          <li><a href="/fysik/arbete-energi-effekt/">Arbete, energi & effekt</a></li>
          <li><a href="/fysik/atomfysik/">Atomfysik</a></li>
        </ul>
      </li>

    </ul>
  `;

  // Endast en meny öppen i taget
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
