const BILDSTOD_PATH = "/periodiska-systemet/data/bildstod.json";
const SPRAK_MAPP = "/periodiska-systemet/sprak";
const BILD_MAPP = "/periodiska-systemet/bildstod";

const bildgrid = document.getElementById("bildgrid");
const sprakkodInput = document.getElementById("sprakkod");
const uppdateraBtn = document.getElementById("uppdateraBtn");
const skrivUtBtn = document.getElementById("skrivUtBtn");

let bildposter = [];
let oversattningar = {};

init();

async function init() {
  uppdateraBtn.addEventListener("click", rendera);
  sprakkodInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") rendera();
  });
  skrivUtBtn.addEventListener("click", () => window.print());

  bildposter = await hamtaJson(BILDSTOD_PATH);
  await rendera();
}

async function rendera() {
  const kod = sprakkodInput.value.trim().toLowerCase();
  oversattningar = {};

  if (kod) {
    try {
      oversattningar = await hamtaJson(`${SPRAK_MAPP}/${kod}.json`);
    } catch (err) {
      console.warn(`Kunde inte ladda språkfil för ${kod}`, err);
      oversattningar = {};
    }
  }

  bildgrid.innerHTML = "";

  bildposter.forEach((post) => {
    const svenska = post.sv || "";
    const key = post.key || "";
    const bild = post.bild || "";
    const oversattning = kod ? (oversattningar[key] || "") : "";

    const kort = document.createElement("article");
    kort.className = "bildkort";
    if (!kod || !oversattning) {
      kort.classList.add("utan-andra");
    }

    const img = document.createElement("img");
    img.src = `${BILD_MAPP}/${bild}`;
    img.alt = svenska;
    img.loading = "lazy";

    const sv = document.createElement("div");
    sv.className = "ord-sv";
    sv.textContent = svenska;

    const andra = document.createElement("div");
    andra.className = "ord-andra";
    andra.textContent = oversattning;

    kort.appendChild(img);
    kort.appendChild(sv);
    kort.appendChild(andra);

    bildgrid.appendChild(kort);
  });
}

async function hamtaJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kunde inte ladda ${url}`);
  }
  return response.json();
}
