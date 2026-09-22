/* ui.js – små DOM-hjälpare. Användardata skrivs ALDRIG med innerHTML, bara som text. */

export function el(tag, props, ...barn) {
  const e = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "klass") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
      else if (k === "dataset") Object.assign(e.dataset, v);
      else if (k === "stil") e.setAttribute("style", v);
      else e.setAttribute(k, v === true ? "" : String(v));
    }
  }
  for (const b of barn.flat()) {
    if (b === null || b === undefined || b === false) continue;
    e.append(b.nodeType ? b : document.createTextNode(String(b)));
  }
  return e;
}

export function tom(nod) {
  while (nod.firstChild) nod.removeChild(nod.firstChild);
  return nod;
}

export function param(namn) {
  try {
    return new URLSearchParams(location.search).get(namn);
  } catch (e) {
    return null;
  }
}

/* localStorage är bara en bekvämlighet – allt måste fungera utan. */
export function lagra(nyckel, varde) {
  try {
    localStorage.setItem(nyckel, JSON.stringify(varde));
  } catch (e) {}
}
export function lasa(nyckel) {
  try {
    const s = localStorage.getItem(nyckel);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}
export function radera(nyckel) {
  try {
    localStorage.removeItem(nyckel);
  } catch (e) {}
}

export function sida(namn) {
  return new URL(namn, location.href).href;
}

export function elevAdress(kod, lage) {
  const u = new URL("elev.html", location.href);
  u.search = "";
  u.hash = "";
  u.searchParams.set("rum", kod);
  if (lage === "lokal") u.searchParams.set("lage", "lokal");
  return u.href;
}

export function ingenRorelse() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    return false;
  }
}

export const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export function sek(ms) {
  return Math.max(0, Math.ceil(ms / 1000));
}

/* Skärmläsartext (aria-live) */
export function meddela(regionId, text) {
  const r = document.getElementById(regionId);
  if (!r) return;
  r.textContent = "";
  // liten fördröjning gör att skärmläsare uppfattar ändringen även när texten upprepas
  setTimeout(() => {
    r.textContent = text;
  }, 30);
}

export function statusText(s) {
  switch (s) {
    case "ansluten":
      return "Ansluten";
    case "ansluter":
      return "Ansluter …";
    case "ateransluter":
      return "Återansluter …";
    case "rum_saknas":
      return "Rummet finns inte längre";
    case "ersatt":
      return "Ersatt av en nyare lärarsession";
    case "stangd":
      return "Frånkopplad";
    default:
      return String(s);
  }
}
