// HAMBURGER KNAPP: Öppna/stäng sidomeny
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  menu.classList.toggle("open");
}

// UNDERMENY: Öppna/fäll ihop + för varje ämne
function toggleSubmenu(el) {
  const submenu = el.nextElementSibling;
  if (submenu) {
    submenu.classList.toggle("open");
    // Ändra tecknet från + till - när öppen
    if (submenu.classList.contains("open")) {
      el.textContent = el.textContent.replace('➕', '➖');
    } else {
      el.textContent = el.textContent.replace('➖', '➕');
    }
  }
}

// Stäng menyn om man klickar utanför (valfritt)
document.addEventListener('click', function(e) {
  const menu = document.getElementById("side-menu");
  const hamburger = document.querySelector(".hamburger");
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove("open");
    // Stäng alla undermenyer
    const submenus = document.querySelectorAll(".submenu");
    submenus.forEach(sub => {
      sub.classList.remove("open");
      const parentSpan = sub.previousElementSibling;
      if (parentSpan) {
        parentSpan.textContent = parentSpan.textContent.replace('➖', '➕');
      }
    });
  }
});
