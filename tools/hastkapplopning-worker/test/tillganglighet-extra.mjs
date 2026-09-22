/* Kompletterar axe: (1) ingen horisontell scroll vid 320 px bredd (WCAG 1.4.10 Reflow),
   (2) synlig fokusmarkering (>= 3 px) på alla tabbbara element, (3) tabbordning når startknappen,
   (4) Space/Enter fungerar på elevens svarsknappar via tangentbord.  Kör: HK_MODULES=/tmp/sc/hk-test/ node tillganglighet-extra.mjs */
import { createRequire } from "node:module";
const req = createRequire((process.env.HK_MODULES || process.cwd() + "/") + "x.js");
const { chromium } = req("playwright");
const BAS = process.env.HK_BASE || "http://localhost:8801";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 320, height: 640 }, locale: "sv-SE" });
let ok = 0, fel = 0;
const kolla = (v, t) => { if (v) ok++; else { fel++; console.log("  MISSLYCKADES:", t); } };
const bred = (p) => p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);

const lar = await ctx.newPage();
await lar.setViewportSize({ width: 1280, height: 720 });
await lar.goto(BAS + "/spel/hastkapplopning/larare.html?lage=lokal");
await lar.waitForFunction(() => window.__hk && window.__hk.vy);
const KOD = await lar.evaluate(() => window.__hk.kod);

const idx = await ctx.newPage();
await idx.goto(BAS + "/spel/hastkapplopning/");
let [sw, cw] = await bred(idx);
kolla(sw <= cw, `index vid 320 px: scrollWidth ${sw} <= ${cw}`);

const e = await ctx.newPage();
await e.goto(BAS + "/spel/hastkapplopning/elev.html?rum=" + KOD + "&lage=lokal");
await e.waitForSelector("#namnIn");
[sw, cw] = await bred(e); kolla(sw <= cw, `elev (gå med) vid 320 px: ${sw} <= ${cw}`);
await e.fill("#namnIn", "Tor");
await e.keyboard.press("Enter");
await e.waitForSelector(".lagrutnat");
[sw, cw] = await bred(e); kolla(sw <= cw, `elev (välj lag) vid 320 px: ${sw} <= ${cw}`);
// tangentbord: tabba till första "Starta lag"-knappen och tryck Enter
let namn = "";
for (let i = 0; i < 12 && !/Starta lag/.test(namn); i++) { await e.keyboard.press("Tab"); namn = await e.evaluate(() => document.activeElement.textContent || ""); }
kolla(/Starta lag/.test(namn), "tangentbord når 'Starta lag' (" + namn.trim() + ")");
const fokus = await e.evaluate(() => { const s = getComputedStyle(document.activeElement); return [s.outlineStyle, parseFloat(s.outlineWidth)]; });
kolla(fokus[0] !== "none" && fokus[1] >= 3, "fokusmarkering på knapp >= 3 px: " + fokus.join(" "));
await e.keyboard.press("Enter");
await e.waitForFunction(() => window.__hkElev.vy.jag.lag);
[sw, cw] = await bred(e); kolla(sw <= cw, `elev (lobby) vid 320 px: ${sw} <= ${cw}`);

// match med tangentbord: demoläge (3 botlag) + en elev som svarar med Tab + mellanslag
const l2 = await ctx.newPage();
await l2.setViewportSize({ width: 1280, height: 720 });
await l2.goto(BAS + "/spel/hastkapplopning/larare.html?demo=1&bots=3");
await l2.waitForFunction(() => window.__hk && window.__hk.vy);
const KOD2 = await l2.evaluate(() => window.__hk.kod);
const s2 = await ctx.newPage();
await s2.goto(BAS + "/spel/hastkapplopning/elev.html?rum=" + KOD2 + "&lage=lokal");
await s2.evaluate(() => localStorage.clear());
await s2.reload();
await s2.waitForSelector("#namnIn");
await s2.fill("#namnIn", "Kim");
await s2.keyboard.press("Enter");
await s2.waitForSelector(".lagrutnat");
let n2 = "";
for (let i = 0; i < 15 && !/Starta lag/.test(n2); i++) { await s2.keyboard.press("Tab"); n2 = await s2.evaluate(() => document.activeElement.textContent || ""); }
await s2.keyboard.press("Enter");
await s2.waitForFunction(() => window.__hkElev.vy.jag.lag);
await l2.evaluate(() => window.__hk.transport.skicka({ t: "installningar", svarstid_s: 10 }));
await l2.click("#btnHuvud");
await l2.waitForFunction(() => window.__hk.vy.fas === "match");
await l2.click("#btnHuvud");
await s2.waitForSelector("button.alt:not([disabled])");
let ant = 0, fokAlt = false;
for (let i = 0; i < 12 && !fokAlt; i++) { await s2.keyboard.press("Tab"); ant++; fokAlt = await s2.evaluate(() => document.activeElement.classList.contains("alt")); }
kolla(fokAlt, "tangentbord når ett svarsalternativ efter " + ant + " tabbar");
await s2.keyboard.press("Space");
await s2.waitForFunction(() => window.__hkElev.vy.match.mittSvar, null, { timeout: 5000 }).then(() => kolla(true, "svar via tangentbord (Space) registreras"), () => kolla(false, "svar via tangentbord registrerades inte"));
[sw, cw] = await bred(s2); kolla(sw <= cw, `elev (svar låst) vid 320 px: ${sw} <= ${cw}`);

for (const [namn2, sida] of [["index", idx], ["elev", e]]) {
  const antal = await sida.evaluate(() => { const els = [...document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")].filter((x) => !x.disabled && x.offsetParent !== null); return els.length; });
  const utan = [];
  await sida.evaluate(() => document.activeElement.blur());
  for (let i = 0; i < Math.min(antal, 40); i++) {
    await sida.keyboard.press("Tab");
    const r = await sida.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const s = getComputedStyle(a); return { t: (a.textContent || a.id || a.tagName).trim().slice(0, 30), st: s.outlineStyle, w: parseFloat(s.outlineWidth), bs: s.boxShadow }; });
    if (r && !(r.st !== "none" && r.w >= 3) && r.bs === "none") utan.push(r.t);
  }
  kolla(utan.length === 0, `${namn2}: alla tabbade element har fokusmarkering (saknas: ${utan.join(", ")})`);
}
console.log(`\nTillgänglighet extra: ${ok} godkända, ${fel} misslyckade`);
await b.close();
process.exit(fel ? 1 : 0);
