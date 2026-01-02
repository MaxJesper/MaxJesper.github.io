document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("side-menu");

  menu.innerHTML = `
    <ul class="menu-root">

      <li class="menu-home">
        <a href="/index.html">🏠 Hem</a>
      </li>

      ${createSubjectMenu(
        "Biologi",
        "biologi",
        [
          ["Vad är liv?", "vad-ar-liv"],
          ["Ekologi", "ekologi"],
          ["Sex & relationer", "sex-&-relationer"],
          ["Hjärta-blod-lungor", "hjarta-blod-lungor"],
          ["Immunologi", "immunologi"],
          ["Matspjälkningen", "matspjalkningen"],
          ["Nervsystemet", "nervsystemet"],
          ["Sinnena", "sinnena"],
          ["Genetik", "genetik"],
          ["Evolution", "evolution"],
          ["Infektionssjukdomar", "infektionssjukdomar"]
        ]
      )}

      ${createSubjectMenu(
        "Kemi",
        "kemi",
        [
          ["Atomer & molekyler", "atomer-&-molekyler"],
          ["Separationsprocesser", "separationsprocesser"],
          ["Syror & baser", "syror-&-baser"],
          ["Kolföreningar", "kolföreningar"],
          ["Matens kemi", "matens-kemi"],
          ["Periodiska systemet", "periodiska-systemet"],
          ["Jonföreningar", "jonforeningar"],
          ["Elektrokemi", "elektrokemi"]
        ]
      )}

      ${createSubjectMenu(
        "Fysik",
        "fysik",
        [
          ["Materia", "materia"],
          ["Kraft & rörelse", "kraft-&-rorelse"],
          ["Tryck", "tryck"],
          ["Universum", "universum"],
          ["Ljud", "ljud"],
          ["Ljus", "ljus"],
          ["Magnetism & induktion", "magnetism-induktion"],
          ["Arbete, energi & effekt", "arbete-energi-effekt"],
          ["Atomfysik", "atomfysik"]
        ]
      )}

    </ul>
  `;
});

/* ===== Hjälpfunktioner ===== */

function createSubjectMenu(title, folder, items) {
  return `
    <li class="menu-subject">
      <span class="menu-title" onclick="toggleSubmenu(this)">
        ${title}
      </span>
      <ul class="submenu">
        <li class="overview">
          <a href="/${folder}/index.html">Ämnet ${title}</a>
        </li>
        ${items
          .map(
            ([name, path]) =>
              `<li><a href="/${folder}/${path}/index.html">${name}</a></li>`
          )
          .join("")}
      </ul>
    </li>
  `;
}

function toggleMenu() {
  document.getElementById("side-menu").classList.toggle("open");
}

function toggleSubmenu(el) {
  document.querySelectorAll(".submenu").forEach(menu => {
    if (menu !== el.nextElementSibling) {
      menu.classList.remove("open");
    }
  });

  el.nextElementSibling.classList.toggle("open");
}
