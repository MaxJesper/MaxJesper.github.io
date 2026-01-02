// ================== DATA FÖR MENYN ==================
const menuData = {
  "Biologi": [
    "Vad är liv?",
    "Ekologi",
    "Sex & relationer",
    "Hjärta-blod-lungor",
    "Immunologi",
    "Matspjälkningen",
    "Nervsystemet",
    "Sinnena",
    "Genetik",
    "Evolution",
    "Infektionssjukdomar"
  ],
  "Kemi": [
    "Atomer & Molekyler",
    "Separationsprocesser",
    "Syror & Baser",
    "Kolföreningar",
    "Matens kemi",
    "Periodiska systemet",
    "Jonföreningar",
    "Elektrokemi"
  ],
  "Fysik": [
    "Materia",
    "Kraft & Rörelse",
    "Tryck",
    "Universum",
    "Ljud",
    "Ljus",
    "Magnetism-induktion",
    "Arbete-Energi-Effekt",
    "Atomfysik"
  ]
};

// ================== GENERERA MENY ==================
function generateMenu(data) {
  const menu = document.getElementById("side-menu");
  menu.innerHTML = ""; // töm menyn

  const ul = document.createElement("ul");
  ul.classList.add("menu-main");

  for (let subject in data) {
    const li = document.createElement("li");

    // Huvudämne
    const span = document.createElement("span");
    span.textContent = subject + " ➕";
    span.onclick = function() { toggleSubmenu(span); };

    // Undermeny
    const subUl = document.createElement("ul");
    subUl.classList.add("submenu");

    data[subject].forEach(area => {
      const subLi = document.createElement("li");
      const a = document.createElement("a");

      const folder = subject.toLowerCase();
      const file = area.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                      .replace(/ /g, "-").toLowerCase();
      a.href = `/${folder}/${file}/index.html`;

      a.textContent = area;
      subLi.appendChild(a);
      subUl.appendChild(subLi);
    });

    li.appendChild(span);
    li.appendChild(subUl);
    ul.appendChild(li);
  }

  menu.appendChild(ul);
}

// ================== HAMBURGER ==================
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  menu.classList.toggle("open");
}

// ================== ACCORDION ==================
function toggleSubmenu(el) {
  const submenu = el.nextElementSibling;
  if (!submenu) return;

  // Stäng alla andra undermenyer
  const allSubmenus = document.querySelectorAll(".submenu");
  allSubmenus.forEach(sub => {
    if (sub !== submenu) {
      sub.classList.remove("open");
      const parentSpan = sub.previousElementSibling;
      if (parentSpan) parentSpan.textContent = parentSpan.textContent.replace('➖','➕');
    }
  });

  // Öppna/stäng klickad huvudkategori
  submenu.classList.toggle("open");
  if (submenu.classList.contains("open")) {
    el.textContent = el.textContent.replace('➕','➖');
    // Scrolla menyn till synligt område
    submenu.scrollIntoView({behavior: "smooth", block: "nearest"});
  } else {
    el.textContent = el.textContent.replace('➖','➕');
  }
}

// ================== STÄNG MENY VID KLICK UTOMHUS ==================
document.addEventListener('click', function(e) {
  const menu = document.getElementById("side-menu");
  const hamburger = document.querySelector(".hamburger");
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove("open");

    const submenus = document.querySelectorAll(".submenu");
    submenus.forEach(sub => {
      sub.classList.remove("open");
      const parentSpan = sub.previousElementSibling;
      if (parentSpan) parentSpan.textContent = parentSpan.textContent.replace('➖','➕');
    });
  }
});

// ================== INIT VID SIDLADDNING ==================
window.onload = function() {
  generateMenu(menuData);
};
