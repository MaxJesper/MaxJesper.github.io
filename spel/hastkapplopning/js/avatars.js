/* avatars.js – hjälpare för djuravatarerna (sprite: img/avatarer.svg) */
import { AVATARER, avatarNamn } from "./engine.js";

export { AVATARER, avatarNamn };

const SPRITE = new URL("../img/avatarer.svg", import.meta.url).href;
const SVGNS = "http://www.w3.org/2000/svg";

/* Skapar ett <svg> med djuret. dekor=true: döljs för hjälpmedel (används när
   djurets namn redan står i text bredvid). Annars får svg:en role="img" med djurets namn. */
export function avatarSvg(id, opts) {
  const o = opts || {};
  const namn = avatarNamn(id);
  const svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", "0 0 120 80");
  svg.setAttribute("class", "avatar" + (o.klass ? " " + o.klass : ""));
  svg.setAttribute("focusable", "false");
  if (o.dekor) {
    svg.setAttribute("aria-hidden", "true");
  } else {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", namn);
    const t = document.createElementNS(SVGNS, "title");
    t.textContent = namn;
    svg.appendChild(t);
  }
  const u = document.createElementNS(SVGNS, "use");
  u.setAttribute("href", SPRITE + "#hk-" + id);
  svg.appendChild(u);
  return svg;
}
