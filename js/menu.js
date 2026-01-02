function toggleMenu() {
  document.getElementById("side-menu").classList.toggle("open");
}

function toggleSubmenu(el) {
  el.nextElementSibling.classList.toggle("open");
}
