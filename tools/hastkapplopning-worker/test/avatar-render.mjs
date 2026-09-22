/* Renderar de 10 djuren (img/avatarer.svg) till PNG: ett kontaktblad samt en fil per djur med transparent bakgrund.
   Kör: HK_MODULES=/tmp/sc/hk-test/ node avatar-render.mjs <utmapp>
   Sedan: python3 avatar-cvd.py <utmapp>  (simulerar rödgrön färgblindhet och mäter skillnader) */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const req = createRequire((process.env.HK_MODULES || process.cwd() + "/") + "x.js");
const { chromium } = req("playwright");
const ut = process.argv[2] || "avatarer";
fs.mkdirSync(ut, { recursive: true });
const svg = fs.readFileSync(new URL("../../../spel/hastkapplopning/img/avatarer.svg", import.meta.url), "utf8");
const ids = ["hast", "zebra", "tiger", "elefant", "kamel", "alg", "snigel", "kanin", "giraff", "skoldpadda"];
const namn = ["Häst", "Zebra", "Tiger", "Elefant", "Kamel", "Älg", "Snigel", "Kanin", "Giraff", "Sköldpadda"];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: 1400, height: 700 } });
const skala = 3;
await p.setContent(`<!doctype html><meta charset=utf-8><body style="margin:0;background:#f0e7d0;font:16px sans-serif">${svg}
<div id="g" style="display:grid;grid-template-columns:repeat(5,${120 * skala + 20}px);gap:6px;padding:10px">
${ids.map((id, i) => `<div style="text-align:center"><svg id="s-${id}" width="${120 * skala}" height="${80 * skala}" viewBox="0 0 120 80" style="overflow:visible"><use href="#hk-${id}"/></svg><div>${namn[i]}</div></div>`).join("")}</div>`);
await p.screenshot({ path: path.join(ut, "kontaktblad.png"), fullPage: true });
// en PNG per djur, transparent bakgrund, 240x160
await p.setContent(`<!doctype html><meta charset=utf-8><body style="margin:0;background:transparent">${svg}<svg id="e" width="240" height="160" viewBox="0 0 120 80"><use id="u" href="#hk-hast"/></svg>`);
for (const id of ids) {
  await p.evaluate((i) => document.getElementById("u").setAttribute("href", "#hk-" + i), id);
  const e = await p.$("#e");
  await e.screenshot({ path: path.join(ut, "djur-" + id + ".png"), omitBackground: true });
}
await b.close();
console.log("klart:", ut);
