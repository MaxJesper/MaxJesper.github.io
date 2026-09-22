/* index.js – startsidan */
import { HASTRACE_API, STANDARD_UPPSATTNING } from "./config.js";
import { AVATARER } from "./engine.js";
import { avatarSvg } from "./avatars.js";
import { laddaUppsattningar } from "./data.js";
import { el, tom, lasa } from "./ui.js";

const $ = (id) => document.getElementById(id);

for (const a of AVATARER) $("djurLista").append(el("li", null, avatarSvg(a.id, { dekor: true }), a.namn));

const harServer = !!HASTRACE_API;
$("serverNotis").hidden = harServer;
if (!harServer) {
  const b = $("startaServer");
  b.setAttribute("aria-disabled", "true");
  b.classList.remove("primar");
  b.setAttribute("href", "#serverNotis");
  b.title = "Servern är inte påslagen (se js/config.js)";
  b.textContent = "Starta rum (Server) – inte påslagen";
  $("startaDemo").classList.add("primar");
}

let uppsatt = STANDARD_UPPSATTNING;
function uppdateraLankar() {
  const u = "&u=" + encodeURIComponent(uppsatt);
  if (harServer) $("startaServer").href = "larare.html?lage=server" + u;
  $("startaLokalt").href = "larare.html?lage=lokal" + u;
  $("startaDemo").href = "larare.html?demo=1" + u;
}

laddaUppsattningar()
  .then((lista) => {
    const sel = $("uppsattning");
    for (const u of lista) sel.append(el("option", { value: u.id }, u.titel));
    sel.value = lista.some((u) => u.id === STANDARD_UPPSATTNING) ? STANDARD_UPPSATTNING : lista[0].id;
    const visa = () => {
      uppsatt = sel.value;
      const u = lista.find((x) => x.id === sel.value);
      $("uppsHjalp").textContent = u ? u.beskrivning : "";
      uppdateraLankar();
    };
    sel.addEventListener("change", visa);
    visa();
  })
  .catch(() => {
    $("uppsHjalp").textContent = "Kunde inte läsa listan över frågeset.";
    uppdateraLankar();
  });

$("elevForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const kod = $("rumskod").value.trim().toUpperCase();
  const fel = $("elevFel");
  if (!/^[A-Z0-9]{4}$/.test(kod)) {
    fel.hidden = false;
    fel.textContent = "Skriv rumskoden med fyra tecken (bokstäver och siffror).";
    $("rumskod").focus();
    return;
  }
  const lokal = $("lokalKryss").checked || !harServer;
  if (!harServer && !$("lokalKryss").checked) {
    // ingen server: gå ändå vidare, elevsidan förklarar
  }
  location.href = "elev.html?rum=" + encodeURIComponent(kod) + (lokal ? "&lage=lokal" : "");
});

// Pågående rum (lärare) i den här webbläsaren
try {
  const ut = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("hk-larare-")) {
      const v = lasa(k);
      if (v && Date.now() - v.skapad < 8 * 3600 * 1000) ut.push({ kod: k.slice("hk-larare-".length), skapad: v.skapad });
    }
  }
  if (ut.length && harServer) {
    $("pagaende").hidden = false;
    const ul = $("pagaendeLista");
    tom(ul);
    for (const r of ut) ul.append(el("li", null, el("a", { href: "larare.html?lage=server&rum=" + r.kod }, "Fortsätt rum " + r.kod)));
  }
} catch (e) {
  /* ingen lagring – inga pågående rum visas */
}
