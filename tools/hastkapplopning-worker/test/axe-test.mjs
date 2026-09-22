/* axe-core på index, lärare och elev i flera lägen (lokalt läge, BroadcastChannel).
   Kör:  HK_MODULES=/tmp/sc/hk-test/ HK_BASE=http://localhost:8801 node axe-test.mjs
   Rapporterar alla överträdelser (wcag2a/aa, wcag21a/aa, wcag22aa, best-practice) och avslutar
   med kod 1 om något är serious/critical. */
import { createRequire } from "node:module";
import fs from "node:fs";
const MOD = process.env.HK_MODULES || process.cwd() + "/";
const req = createRequire(MOD + "x.js");
const { chromium } = req("playwright");
const axeKalla = fs.readFileSync(req.resolve("axe-core/axe.min.js"), "utf8");
const BAS = process.env.HK_BASE || "http://localhost:8801";
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, locale: "sv-SE" });
const resultat = [];
let allvarliga = 0;

async function axe(sida, namn) {
  await sida.evaluate(axeKalla);
  const r = await sida.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] }, resultTypes: ["violations", "incomplete"] });
    const f = (x) => ({ id: x.id, impact: x.impact, hjalp: x.help, noder: x.nodes.slice(0, 4).map((n) => n.target.join(" ") + " :: " + (n.any[0] ? n.any[0].message : n.failureSummary || "").slice(0, 140)) });
    return { viol: res.violations.map(f), inkl: res.incomplete.map(f), pass: res.passes.length };
  });
  const s = r.viol.filter((v) => v.impact === "serious" || v.impact === "critical").length;
  allvarliga += s;
  resultat.push({ namn, viol: r.viol.length, allvarliga: s, inkl: r.inkl.length, pass: r.pass });
  console.log(namn.padEnd(38), "överträdelser:", r.viol.length, "(serious/critical:", s + ")", "ofullständiga:", r.inkl.length, "godkända regler:", r.pass);
  for (const v of r.viol) console.log("   -", v.impact, v.id, "|", v.hjalp, "\n       ", v.noder.join("\n        "));
  for (const v of r.inkl) if (v.id !== "color-contrast") console.log("   ? ofullständig:", v.id, v.noder[0] || "");
  return r;
}

// ---- index ----
const idx = await ctx.newPage();
await idx.goto(BAS + "/spel/hastkapplopning/");
await sov(600);
await axe(idx, "index.html");
await idx.setViewportSize({ width: 390, height: 844 });
await axe(idx, "index.html (390 px)");
await idx.setViewportSize({ width: 1920, height: 1080 });

// ---- lärare ----
const lar = await ctx.newPage();
await lar.goto(BAS + "/spel/hastkapplopning/larare.html?lage=lokal&u=mineraler-och-vitaminer");
await lar.waitForFunction(() => window.__hk && window.__hk.vy);
const KOD = await lar.evaluate(() => window.__hk.kod);
await axe(lar, "larare: lobby (tom)");

// ---- elever ----
const elever = [];
const DEF = [["Anna", "Häst"], ["Bo", "Zebra"], ["Cia", "Tiger"]];
for (const [namn] of DEF) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(BAS + "/spel/hastkapplopning/elev.html?rum=" + KOD + "&lage=lokal");
  await p.waitForSelector("#namnIn");
  elever.push(p);
}
for (let i = 0; i < DEF.length; i++) {
  const [namn, lag] = DEF[i];
  const p = elever[i];
  if (namn === "Anna") await axe(p, "elev: gå med (namn)");
  await p.fill("#namnIn", namn);
  await p.click("button[type=submit]");
  await p.waitForSelector(".lagrutnat");
  if (namn === "Anna") await axe(p, "elev: välj lag");
  await p.click('.lagkort:has(.namn:text-is("' + lag + '")) button');
  await p.waitForFunction(() => window.__hkElev.vy.jag.lag !== null, null);
}
await sov(400);
await axe(elever[0], "elev: lobby");
await axe(lar, "larare: lobby (3 lag)");
// elev utan rumskod
const kodsida = await ctx.newPage();
await kodsida.setViewportSize({ width: 390, height: 844 });
await kodsida.goto(BAS + "/spel/hastkapplopning/elev.html");
await sov(400);
await axe(kodsida, "elev: ange rumskod");
await kodsida.close();

await lar.evaluate(() => window.__hk.transport.skicka({ t: "installningar", svarstid_s: 10 }));
await lar.click("#btnHuvud");
await lar.waitForFunction(() => window.__hk.vy.fas === "match");
await sov(300);
await axe(elever[0], "elev: väntar på fråga");
await axe(lar, "larare: match, väntar");
await lar.click("#btnHuvud");
await lar.waitForFunction(() => window.__hk.vy.match.steg === "fraga");
for (const e of elever) await e.waitForSelector("button.alt");
await axe(lar, "larare: fråga (utan alternativ)");
await lar.click("#btnAlt");
await sov(300);
await axe(lar, "larare: fråga (med alternativ)");
await axe(elever[0], "elev: fråga");
// elev 1 svarar rätt-ish (bokstav A), elev 2 svarar B
await elever[0].click('button.alt[data-i="0"]');
await sov(300);
await axe(elever[0], "elev: svar låst");
await elever[1].click('button.alt[data-i="1"]');
await sov(200);
await lar.click("#btnHuvud"); // visa svar nu
await lar.waitForFunction(() => window.__hk.vy.match.steg === "avslojad");
await sov(200);
await axe(lar, "larare: avslöjat (animation pågår)");
await axe(elever[0], "elev: resultat");
await axe(elever[2], "elev: resultat (inget svar)");
await lar.waitForFunction(() => !window.__hk.animerar, null, { timeout: 30000 });
await axe(lar, "larare: avslöjat (klar)");
// inställningsdialog
await lar.click("#btnInst");
await sov(300);
await axe(lar, "larare: inställningsdialog");
await lar.click("#instStang");
// slutför match → pall
lar.once("dialog", (d) => d.accept());
await lar.click("#btnSlutfor");
await lar.waitForFunction(() => window.__hk.vy.match && window.__hk.vy.match.steg === "pall", null, { timeout: 5000 });
await sov(3500);
await axe(lar, "larare: prispall");
await axe(elever[0], "elev: prispall");
// mästarpall: gå igenom matcherna genom att slutföra dem
for (let m = 1; m < 3; m++) {
  await lar.click("#btnHuvud"); // nästa match
  await lar.waitForFunction((n) => window.__hk.vy.fas === "lobby" && window.__hk.vy.matchNr === n, m, { timeout: 5000 });
  await lar.click("#btnHuvud"); // starta
  await lar.waitForFunction(() => window.__hk.vy.fas === "match", null, { timeout: 5000 });
  await lar.click("#btnHuvud"); // nästa fråga
  await lar.waitForFunction(() => window.__hk.vy.match.steg === "fraga", null, { timeout: 5000 });
  for (const e of elever) await e.waitForSelector("button.alt:not([disabled])");
  await elever[0].click('button.alt[data-i="0"]');
  await lar.click("#btnHuvud");
  await lar.waitForFunction(() => window.__hk.vy.match.steg === "avslojad", null, { timeout: 5000 });
  await lar.waitForFunction(() => !window.__hk.animerar, null, { timeout: 30000 });
  lar.once("dialog", (d) => d.accept());
  await lar.click("#btnSlutfor");
  await lar.waitForFunction(() => window.__hk.vy.match.steg === "pall", null, { timeout: 5000 }); // Slutför match går direkt till prispallen
}
await lar.click("#btnHuvud"); // mästarpallen
await lar.waitForFunction(() => window.__hk.vy.fas === "slut", null, { timeout: 5000 });
await sov(4000);
await axe(lar, "larare: mästarpall");
await axe(elever[0], "elev: mästarpall");

console.log("\nSammanfattning:", resultat.length, "tillstånd,", allvarliga, "serious/critical, totalt", resultat.reduce((a, r) => a + r.viol, 0), "överträdelser");
await b.close();
process.exit(allvarliga ? 1 : 0);
