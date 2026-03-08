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
let aktivSprakdata = null;
let aktivTerms = {};

init();

async function init() {
  kopplaHandelser();
  await laddaBildposter();
  renderaBildstod();
}

function kopplaHandelser() {
  uppdateraKnapp.addEventListener("click", uppdateraSprakFranInput);

  rensaKnapp.addEventListener("click", () => {
    sprakkodInput.value = "";
    aktivSprakkod = "";
    aktivSprakdata = null;
    aktivTerms = {};
    visaStatus("Visar bara svenska ord.");
    renderaBildstod();
  });

  skrivUtKnapp.addEventListener("click", () => {
    window.print();
  });

  sprakkodInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      uppdateraSprakFranInput();
    }
  });
}

async function laddaBildposter() {
  try {
    visaStatus("Laddar bildstöd ...");
    const data = await hamtaJson(BILDSTOD_JSON);

    if (!Array.isArray(data)) {
      throw new Error("bildstod.json måste innehålla en array.");
    }

    bildposter = data.filter((post) => post && post.sv && post.bild);

    if (bildposter.length === 0) {
      visaFel("Inga bildposter hittades i bildstod.json.");
      return;
    }

    visaStatus(`${bildposter.length} bildkort laddade.`);
  } catch (error) {
    console.error("Fel vid laddning av bildstod.json:", error);
    visaFel(`Det gick inte att ladda ${BILDSTOD_JSON}.`);
  }
}

async function uppdateraSprakFranInput() {
  const inmatning = String(sprakkodInput.value || "").trim();
  const kod = tolkaSprakKod(inmatning);

  aktivSprakkod = kod;
  aktivSprakdata = null;
  aktivTerms = {};

  if (!kod) {
    visaStatus("Visar bara svenska ord.");
    renderaBildstod();
    return;
  }

  const sprakUrl = `${SPRAK_MAPP}/${kod}.json`;

  try {
    visaStatus(`Laddar språkfil: ${sprakUrl} ...`);
    const data = await hamtaJson(sprakUrl);

    console.log("Språkfil laddad:", sprakUrl, data);

    aktivSprakdata = data;
    aktivTerms = data && typeof data === "object" && data.terms ? data.terms : {};

    const antalTermer = Object.keys(aktivTerms).length;
    const sprakNamn =
      data.language_name_sv ||
      data.language_name_native ||
      kod;

    visaStatus(`Språk laddat: ${sprakNamn}. Hittade ${antalTermer} termer.`);
  } catch (error) {
    console.error(`Fel vid laddning av ${sprakUrl}:`, error);
    visaFel(`Kunde inte ladda ${sprakUrl}. Visar bara svenska.`);
    aktivSprakdata = null;
    aktivTerms = {};
  }

  renderaBildstod();
}

function renderaBildstod() {
  if (!Array.isArray(bildposter) || bildposter.length === 0) {
    bildgrid.innerHTML = `<div class="tomt-resultat">Inga bildkort att visa.</div>`;
    return;
  }

  bildgrid.innerHTML = bildposter.map(skapaKortHtml).join("");
}

function skapaKortHtml(post) {
  const svenska = String(post.sv || "").trim();
  const bild = String(post.bild || "").trim();
  const oversattning = hamtaOversattning(post);
  const harOversattning = Boolean(aktivSprakkod && oversattning);

  return `
    <article class="bildkort ${harOversattning ? "" : "utan-oversattning"}">
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

function hamtaOversattning(post) {
  if (!aktivSprakkod || !aktivTerms || typeof aktivTerms !== "object") {
    return "";
  }

  if (Array.isArray(post.parts) && post.parts.length > 0) {
    const delar = post.parts
      .map((key) => hamtaTermForKey(key))
      .filter(Boolean);

    return delar.join(" / ");
  }

  const kandidater = [];

  if (post.key) kandidater.push(String(post.key));
  if (post.sv) kandidater.push(slugga(post.sv));
  if (post.sv) kandidater.push(String(post.sv).trim());
  if (post.alternativaNycklar && Array.isArray(post.alternativaNycklar)) {
    kandidater.push(...post.alternativaNycklar.map(String));
  }

  for (const kandidat of kandidater) {
    const term = hamtaTermForKey(kandidat);
    if (term) return term;
  }

  return "";
}

function hamtaTermForKey(key) {
  if (!key || !aktivTerms[key]) return "";

  const post = aktivTerms[key];

  if (typeof post === "string") {
    return post.trim();
  }

  if (post && typeof post === "object") {
    if (typeof post.term === "string") return post.term.trim();
    if (typeof post.word === "string") return post.word.trim();
    if (typeof post.text === "string") return post.text.trim();
    if (typeof post.value === "string") return post.value.trim();
  }

  return "";
}

function tolkaSprakKod(text) {
  const normaliserad = String(text || "").trim().toLowerCase();

  const karta = {
    en: "en",
    engelska: "en",
    english: "en",
    ar: "ar",
    arabiska: "ar",
    arabic: "ar",
    fa: "fa",
    persiska: "fa",
    persian: "fa",
    farsi: "fa",
    prs: "prs",
    dari: "prs",
    so: "so",
    somaliska: "so",
    somali: "so",
    uk: "uk",
    ukrainska: "uk",
    ukrainian: "uk"
  };

  return karta[normaliserad] || normaliserad.replace(/[^a-z]/g, "");
}

function slugga(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/\//g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
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
