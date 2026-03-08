const BILDSTOD_JSON = "./data/bildstod.json";
const SPRAK_MAPP = "./sprak";
const BILD_MAPP = "./bildstod";

const bildgrid = document.getElementById("bildgrid");
const statusrad = document.getElementById("statusrad");
const sprakkodInput = document.getElementById("sprakkod");
const uppdateraKnapp = document.getElementById("uppdatera-knapp");
const rensaKnapp = document.getElementById("rensa-knapp");
const skrivUtKnapp = document.getElementById("skriv-ut-knapp");

let bildposter = [];
let aktivSprakkod = "";
let aktivOversattning = {};

init();

async function init() {
  kopplaHandelser();
  await laddaBildposter();
  await renderaBildstod();
}

function kopplaHandelser() {
  uppdateraKnapp.addEventListener("click", async () => {
    await uppdateraSprakFranInput();
  });

  rensaKnapp.addEventListener("click", async () => {
    sprakkodInput.value = "";
    aktivSprakkod = "";
    aktivOversattning = {};
    await renderaBildstod();
  });

  skrivUtKnapp.addEventListener("click", () => {
    window.print();
  });

  sprakkodInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await uppdateraSprakFranInput();
    }
  });
}

async function laddaBildposter() {
  visaStatus("Laddar bildstöd ...");

  try {
    const data = await hamtaJson(BILDSTOD_JSON);

    if (!Array.isArray(data)) {
      throw new Error("bildstod.json måste innehålla en lista.");
    }

    bildposter = data.filter((post) => {
      return post && post.sv && post.bild;
    });

    if (bildposter.length === 0) {
      visaFel("Inga bildposter hittades i bildstod.json.");
      return;
    }

    visaStatus(`${bildposter.length} bildkort laddade.`);
  } catch (error) {
    console.error(error);
    visaFel(`Det gick inte att ladda ${BILDSTOD_JSON}.`);
  }
}

async function uppdateraSprakFranInput() {
  const kod = normaliseraSprakkod(sprakkodInput.value);

  aktivSprakkod = kod;
  aktivOversattning = {};

  if (!kod) {
    visaStatus("Visar bara svenska ord.");
    await renderaBildstod();
    return;
  }

  visaStatus(`Laddar språk: ${kod} ...`);

  try {
    aktivOversattning = await hamtaJson(`${SPRAK_MAPP}/${kod}.json`);
    visaStatus(`Visar svenska + ${kod}.`);
  } catch (error) {
    console.warn(error);
    aktivOversattning = {};
    visaStatus(`Kunde inte ladda språkfilen för "${kod}". Visar bara svenska.`);
  }

  await renderaBildstod();
}

async function renderaBildstod() {
  if (!Array.isArray(bildposter) || bildposter.length === 0) {
    bildgrid.innerHTML = `<div class="tomt-resultat">Inga bildkort att visa.</div>`;
    return;
  }

  const html = bildposter.map(skapaKortHtml).join("");
  bildgrid.innerHTML = html;
}

function skapaKortHtml(post) {
  const svenska = String(post.sv || "").trim();
  const bild = String(post.bild || "").trim();
  const nyckel = hamtaNycklar(post);
  const oversattning = hamtaOversattning(nyckel);
  const harOversattning = aktivSprakkod && oversattning;

  const klasser = ["bildkort"];
  if (!harOversattning) {
    klasser.push("utan-oversattning");
  }

  return `
    <article class="${klasser.join(" ")}">
      <div class="bildruta">
        <img
          src="${BILD_MAPP}/${escapeHtml(bild)}"
          alt="${escapeHtml(svenska)}"
          loading="lazy"
        />
      </div>
      <div class="ord-svenska">${escapeHtml(svenska)}</div>
      <div class="ord-oversattning">${escapeHtml(oversattning)}</div>
    </article>
  `;
}

function hamtaNycklar(post) {
  const nycklar = [];

  if (post.key) nycklar.push(String(post.key));
  if (post.id) nycklar.push(String(post.id));
  if (post.slug) nycklar.push(String(post.slug));
  if (post.sv) nycklar.push(slugga(post.sv));
  if (post.alternativaNycklar && Array.isArray(post.alternativaNycklar)) {
    post.alternativaNycklar.forEach((nyckel) => nycklar.push(String(nyckel)));
  }

  return nycklar.filter(Boolean);
}

function hamtaOversattning(nycklar) {
  if (!aktivSprakkod || !aktivOversattning) return "";

  for (const nyckel of nycklar) {
    if (Object.prototype.hasOwnProperty.call(aktivOversattning, nyckel)) {
      return String(aktivOversattning[nyckel] || "").trim();
    }
  }

  return "";
}

function normaliseraSprakkod(varde) {
  return String(varde || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function slugga(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function hamtaJson(url) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Kunde inte ladda ${url} (${response.status})`);
  }

  return response.json();
}

function visaStatus(text) {
  statusrad.textContent = text;
  statusrad.className = "statusrad";
}

function visaFel(text) {
  statusrad.textContent = text;
  statusrad.className = "statusrad felruta";
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
