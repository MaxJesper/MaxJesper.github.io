/* E2E: en lärarsida + 7 elevsidor spelar alla tre matcher.
   Utan HK_API: lokalt läge (BroadcastChannel, ingen server).
   Med HK_API=http://127.0.0.1:8811: serverläge mot en körande Worker (wrangler dev). config.js skrivs då över
   i webbläsaren via Playwright (filen på disk ändras inte), så att sidorna pratar med Workern.
   Kontrollerar steg, poäng, rangordning efter svarstid, att fel/uteblivna svar ger 0,
   att rätt svar inte läcker före avslöjandet och att elevvyerna visar rätt text.
   Kör:  HK_MODULES=/tmp/sc/hk-test/ HK_BASE=http://localhost:8801 [HK_API=http://127.0.0.1:8811] node e2e-spel.mjs
   Skärmdumpar sparas i HK_SKARM (standard ./skarm). */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const req = createRequire((process.env.HK_MODULES || process.cwd() + "/") + "x.js");
const { chromium } = req("playwright");

const BAS = process.env.HK_BASE || "http://localhost:8801";
const SKARM = process.env.HK_SKARM || "skarm";
const SNABBT = process.env.HK_SNABBT === "1"; // hoppa över alla animationer
const API = process.env.HK_API || "";
const LAGE = API ? "server" : "lokal";
fs.mkdirSync(SKARM, { recursive: true });
const DATA = JSON.parse(fs.readFileSync(new URL("../../../spel/hastkapplopning/data/mineraler-och-vitaminer.json", import.meta.url), "utf8"));

let ok = 0;
const fel = [];
function kolla(villkor, text) {
  if (villkor) ok++;
  else {
    fel.push(text);
    console.log("  MISSLYCKADES: " + text);
  }
}
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "sv-SE" });
if (API) {
  await ctx.route("**/spel/hastkapplopning/js/config.js", async (route) => {
    const r = await route.fetch();
    let t = await r.text();
    t = t.replace(/export const HASTRACE_API = "[^"]*";/, 'export const HASTRACE_API = "' + API + '";');
    await route.fulfill({ response: r, body: t, headers: { ...r.headers(), "content-type": "text/javascript" } });
  });
}
const konsol = [];
function bevaka(sida, namn) {
  sida.on("console", (m) => {
    if ((m.type() === "error" || m.type() === "warning") && !/favicon|404/.test(m.text())) konsol.push(namn + " [" + m.type() + "] " + m.text());
  });
  sida.on("pageerror", (e) => konsol.push(namn + " PAGEERROR " + e.message));
  if (process.env.HK_DEBUG) {
    const t0 = Date.now();
    sida.on("websocket", (ws) => {
      console.log(((Date.now() - t0) / 1000).toFixed(1), namn, "WS öppnad");
      ws.on("close", () => console.log(((Date.now() - t0) / 1000).toFixed(1), namn, "WS stängd"));
    });
    sida.on("console", (m) => console.log(namn, m.type(), m.text().slice(0, 160)));
  }
}

/* ---------- lärare ---------- */
const lar = await ctx.newPage();
await lar.setViewportSize({ width: 1920, height: 1080 });
bevaka(lar, "lärare");
await lar.goto(BAS + "/spel/hastkapplopning/larare.html?lage=" + LAGE + "&u=mineraler-och-vitaminer");
await lar.waitForFunction(() => window.__hk && window.__hk.vy);
const KOD = await lar.evaluate(() => window.__hk.kod);
console.log("Rumskod", KOD);

/* ---------- elever ---------- */
const ELEVER = [
  { namn: "Anna", lag: "hast", vp: { width: 390, height: 844 } },
  { namn: "Bo", lag: "hast", vp: { width: 360, height: 640 } },
  { namn: "Cia", lag: "zebra", vp: { width: 1366, height: 768 } },
  { namn: "Dan", lag: "tiger", vp: { width: 390, height: 844 } },
  { namn: "Eva", lag: "elefant", vp: { width: 390, height: 844 } },
  { namn: "Fia", lag: "kamel", vp: { width: 390, height: 844 } },
  { namn: "Gus", lag: "alg", vp: { width: 390, height: 844 } },
];
const LAGNAMN = { hast: "Häst", zebra: "Zebra", tiger: "Tiger", elefant: "Elefant", kamel: "Kamel", alg: "Älg" };
for (const e of ELEVER) {
  e.sida = await ctx.newPage();
  await e.sida.setViewportSize(e.vp);
  bevaka(e.sida, e.namn);
  await e.sida.goto(BAS + "/spel/hastkapplopning/elev.html?rum=" + KOD + (API ? "" : "&lage=lokal"));
  await e.sida.waitForSelector("#namnIn");
}
await ELEVER[0].sida.screenshot({ path: SKARM + "/e-1-gamed.png" });
for (const e of ELEVER) {
  await e.sida.fill("#namnIn", e.namn);
  await e.sida.click("button[type=submit]");
  await e.sida.waitForSelector(".lagrutnat");
  if (e === ELEVER[0]) await e.sida.screenshot({ path: SKARM + "/e-2-valjlag.png", fullPage: true });
  await e.sida.click('.lagkort:has(.namn:text-is("' + LAGNAMN[e.lag] + '")) button');
  await e.sida.waitForFunction((l) => window.__hkElev.vy && window.__hkElev.vy.jag && window.__hkElev.vy.jag.lag === l, e.lag);
}
await sov(500);
await ELEVER[0].sida.screenshot({ path: SKARM + "/e-3-lobby.png" });
await lar.screenshot({ path: SKARM + "/e2e-l-1-lobby.png" });
const lobbyLag = await lar.evaluate(() => window.__hk.vy.lag.map((l) => [l.id, l.medlemmar.length]));
kolla(lobbyLag.length === 6 && lobbyLag.find((x) => x[0] === "hast")[1] === 2, "lobby: 6 lag, häst har 2 medlemmar (" + JSON.stringify(lobbyLag) + ")");

/* korta frågetiden så testet går snabbt */
await lar.evaluate(() => window.__hk.transport.skicka({ t: "installningar", svarstid_s: 10 }));

/* ---------- spelmodell ---------- */
const LAG = ["hast", "zebra", "tiger", "elefant", "kamel", "alg"];
const totPoang = Object.fromEntries(LAG.map((l) => [l, 0]));
const totSteg = Object.fromEntries(LAG.map((l) => [l, 0]));
const BASORDNING = ["hast", "zebra", "alg", "kamel"];

async function klickaSvar(e, textRatt, fel_) {
  const s = e.sida;
  await s.waitForSelector("button.alt:not([disabled])", { timeout: 8000 });
  const alt = await s.$$eval("button.alt", (b) => b.map((x) => x.querySelector(".atext").textContent));
  let i = alt.indexOf(textRatt);
  if (i < 0) throw new Error("rätt alternativ hittades inte i elevvyn: " + textRatt);
  if (fel_) i = (i + 1) % 4;
  await s.click('button.alt[data-i="' + i + '"]');
}

async function spelaMatch(mi, opts) {
  const match = DATA.matcher[mi];
  const L = await lar.evaluate(() => window.__hk.vy.match ? window.__hk.vy.match.banlangd : null);
  const pos = Object.fromEntries(LAG.map((l) => [l, 0]));
  const mpoang = { tre: Object.fromEntries(LAG.map((l) => [l, 0])) };
  let vinnare = null;
  const fs_ = [];
  for (let q = 0; q < match.fragor.length && !vinnare; q++) {
    // vänta tills läraren kan starta nästa fråga
    await lar.waitForFunction(() => {
      const t = document.getElementById("btnHuvud").textContent;
      return /Nästa fråga/.test(t);
    }, null, { timeout: 30000 });
    await lar.click("#btnHuvud");
    await lar.waitForFunction(() => window.__hk.vy.match.steg === "fraga", null, { timeout: 5000 });
    const fraga = await lar.evaluate(() => window.__hk.vy.match.fraga);
    kolla(fraga.ratt === undefined && fraga.forklaring === undefined, "M" + (mi + 1) + " F" + (q + 1) + ": läraren ser inte facit före avslöjandet");
    const ursprung = match.fragor[q];
    kolla(fraga.text === ursprung.fraga, "M" + (mi + 1) + " F" + (q + 1) + ": frågetexten är den förväntade i ordning");
    const textRatt = ursprung.alternativ[ursprung.ratt];
    // elevernas vyer: ingen läcka
    for (const e of ELEVER) await e.sida.waitForFunction((n) => window.__hkElev.vy.match && window.__hkElev.vy.match.steg === "fraga" && window.__hkElev.vy.match.fraga.nr === n, q + 1);
    const lack = await ELEVER[2].sida.evaluate(() => JSON.stringify(window.__hkElev.vy));
    kolla(!/"ratt":\d/.test(lack.replace(/"lag":\{[^}]*\}/g, "")) && !/forklaring/.test(lack), "M" + (mi + 1) + " F" + (q + 1) + ": elevvyn saknar rätt svar och förklaring före avslöjandet");
    if (mi === 0 && q === 0) {
      await lar.screenshot({ path: SKARM + "/e2e-l-2-fraga.png" });
      await ELEVER[0].sida.screenshot({ path: SKARM + "/e-4-fraga.png" });
      await ELEVER[1].sida.screenshot({ path: SKARM + "/e-4-fraga-360x640.png" });
      await ELEVER[2].sida.screenshot({ path: SKARM + "/e-4-fraga-1366x768.png" });
      await lar.click("#btnAlt");
      await sov(300);
      await lar.screenshot({ path: SKARM + "/e2e-l-3-fraga-alt.png" });
    }
    // ordning: rotera BASORDNING med q; älg svarar fel på jämna frågor
    const rot = BASORDNING.map((_, i) => BASORDNING[(i + q) % 4]);
    const rattaOrdning = rot.filter((l) => !(l === "alg" && q % 2 === 1));
    for (const l of rot) {
      const e = ELEVER.find((x) => x.lag === l);
      await klickaSvar(e, textRatt, l === "alg" && q % 2 === 1);
      await sov(180);
    }
    // tiger svarar alltid fel
    await klickaSvar(ELEVER.find((x) => x.lag === "tiger"), textRatt, true);
    await sov(180);
    // Bo (häst) försöker efter Anna: ska vara låst
    if (q === 0) {
      const bo = ELEVER[1].sida;
      const last = await bo.$eval("#lastStatus", (n) => n.textContent);
      kolla(/Svar låst/.test(last) && /Anna/.test(last), "M" + (mi + 1) + ": Bo ser att Anna låste lagets svar (" + last + ")");
      const dis = await bo.$$eval("button.alt", (b) => b.every((x) => x.disabled));
      kolla(dis, "M" + (mi + 1) + ": Bos knappar är låsta");
      if (mi === 0) await bo.screenshot({ path: SKARM + "/e-5-last-360x640.png" });
      if (mi === 0) await ELEVER[0].sida.screenshot({ path: SKARM + "/e-5-last.png" });
    }
    // elefant svarar inte. Första frågan i varje match: vänta på tidsgränsen, annars visa svar nu.
    if (q === 0) {
      await lar.waitForFunction(() => window.__hk.vy.match.steg === "avslojad", null, { timeout: 15000 });
      kolla(true, "M" + (mi + 1) + ": frågan stängdes av tidsgränsen");
    } else {
      await lar.click("#btnHuvud");
      await lar.waitForFunction(() => window.__hk.vy.match.steg === "avslojad", null, { timeout: 5000 });
    }
    const vy = await lar.evaluate(() => JSON.parse(JSON.stringify(window.__hk.vy)));
    const res = vy.match.resultat;
    // modell
    const forv = Object.fromEntries(LAG.map((l) => [l, 0]));
    rattaOrdning.forEach((l, i) => (forv[l] = i === 0 ? 3 : i === 1 ? 2 : 1));
    let vinnFore = null;
    const gammal = { ...pos };
    for (const l of rattaOrdning) {
      pos[l] = Math.min(L, pos[l] + forv[l]);
      if (!vinnFore && pos[l] >= L) vinnFore = l;
    }
    if (rattaOrdning.length && forv[rattaOrdning[0]] === 3) mpoang.tre[rattaOrdning[0]]++;
    const p = "M" + (mi + 1) + " F" + (q + 1);
    for (const l of LAG) {
      const r = res.lag[l];
      const fSteg = pos[l] - gammal[l];
      kolla(r.steg === fSteg, p + ": " + l + " steg " + r.steg + " (väntat " + fSteg + ")");
      kolla(vy.match.pos[l] === pos[l], p + ": " + l + " position " + vy.match.pos[l] + " (väntat " + pos[l] + ")");
      const arRatt = rattaOrdning.includes(l);
      kolla(!!r.ratt === arRatt, p + ": " + l + " rätt=" + r.ratt + " (väntat " + arRatt + ")");
      if (l === "tiger") kolla(r.svarade && !r.ratt && r.steg === 0, p + ": tiger fel svar ger 0");
      if (l === "elefant") kolla(!r.svarade && r.steg === 0, p + ": elefant uteblivet svar ger 0");
    }
    kolla((vy.match.vinnare || null) === vinnFore, p + ": vinnare " + vy.match.vinnare + " (väntat " + vinnFore + ")");
    // elevernas texter
    for (const e of ELEVER) {
      await e.sida.waitForSelector(".resultat");
      const t = await e.sida.$eval(".resultat", (n) => n.textContent);
      const l = e.lag;
      if (l === "tiger") kolla(/✗ Fel/.test(t) && /0 steg/.test(t), p + ": " + e.namn + " ser Fel/0 steg (" + t + ")");
      else if (l === "elefant") kolla(/Inget svar/.test(t) && /0 steg/.test(t), p + ": " + e.namn + " ser Inget svar (" + t + ")");
      else if (rattaOrdning.includes(l)) {
        const i = rattaOrdning.indexOf(l);
        const re = i === 0 ? /nr 1 → \+3/ : i === 1 ? /nr 2 → \+2/ : new RegExp(i + " lag var snabbare → \\+1");
        kolla(/Rätt/.test(t) && re.test(t), p + ": " + e.namn + " (" + l + ", plats " + (i + 1) + ") ser: " + t);
      } else kolla(/✗ Fel/.test(t), p + ": " + e.namn + " (älg fel) ser: " + t);
      const lackFore = await e.sida.$$eval("button.alt[data-val='ratt']", (b) => b.length);
      kolla(lackFore === 1, p + ": " + e.namn + " ser exakt ett rätt-markerat alternativ");
    }
    if (mi === 0 && q === 0) {
      await sov(1100);
      await lar.screenshot({ path: SKARM + "/e2e-l-4-mitt-i.png" });
      await ELEVER[0].sida.screenshot({ path: SKARM + "/e-6-ratt-nr1.png" });
      await ELEVER[3].sida.screenshot({ path: SKARM + "/e-6-fel.png" });
      await ELEVER[4].sida.screenshot({ path: SKARM + "/e-6-inget.png" });
      await ELEVER[5].sida.screenshot({ path: SKARM + "/e-6-ratt-nr4.png", fullPage: true });
      await ELEVER[2].sida.screenshot({ path: SKARM + "/e-6-ratt-1366x768.png" });
      await ELEVER[1].sida.screenshot({ path: SKARM + "/e-6-ratt-360x640.png", fullPage: true });
    }
    // animation: låt den gå eller hoppa över
    if (opts.animera && q < 2) {
      await lar.waitForFunction(() => !window.__hk.animerar, null, { timeout: 30000 });
      if (mi === 1 && q === 0) await lar.screenshot({ path: SKARM + "/e2e-l-5-efter-anim.png" });
    } else {
      const txt = await lar.$eval("#btnHuvud", (b) => b.textContent);
      if (/Hoppa över/.test(txt)) await lar.click("#btnHuvud");
      await lar.waitForFunction(() => !window.__hk.animerar, null, { timeout: 5000 });
    }
    if (vinnFore) {
      vinnare = vinnFore;
      fs_.push(q + 1);
    }
  }
  kolla(!!vinnare, "M" + (mi + 1) + ": matchen fick en vinnare");
  // Prispall
  await lar.waitForFunction(() => /Visa prispallen/.test(document.getElementById("btnHuvud").textContent), null, { timeout: 10000 });
  await lar.click("#btnHuvud");
  await lar.waitForFunction(() => window.__hk.vy.match.steg === "pall", null, { timeout: 5000 });
  const vy = await lar.evaluate(() => JSON.parse(JSON.stringify(window.__hk.vy)));
  const pall = vy.match.pall;
  // förväntad ordning: vinnare, steg, antal treor (tid som sista utslag – kontrolleras bara om entydigt)
  const nyckel = (l) => [l === vinnare ? 1 : 0, pos[l], mpoang.tre[l]];
  const sorterad = LAG.slice().sort((a, b) => { const x = nyckel(a), y = nyckel(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i]; return 0; });
  kolla(pall[0].lag === vinnare, "M" + (mi + 1) + ": prispallens etta är vinnaren (" + pall[0].lag + ")");
  for (let i = 0; i < 3; i++) {
    const a = sorterad[i], b = sorterad[i + 1];
    const entydig = JSON.stringify(nyckel(a)) !== JSON.stringify(nyckel(b)) && (i === 0 || JSON.stringify(nyckel(sorterad[i - 1])) !== JSON.stringify(nyckel(a)));
    if (entydig) kolla(pall[i].lag === a, "M" + (mi + 1) + ": plats " + (i + 1) + " = " + pall[i].lag + " (väntat " + a + ")");
  }
  kolla(pall[0].poang === 3 && pall[1].poang === 2 && pall[2].poang === 1 && (pall[3] ? pall[3].poang === 0 : true), "M" + (mi + 1) + ": matchpoäng 3/2/1/0");
  for (const r of pall) {
    totPoang[r.lag] += r.poang;
    totSteg[r.lag] += r.steg;
    kolla(r.steg === pos[r.lag], "M" + (mi + 1) + ": pall-steg " + r.lag + " " + r.steg + " = modell " + pos[r.lag]);
  }
  await sov(2500);
  await lar.screenshot({ path: SKARM + "/e2e-l-6-pall-m" + (mi + 1) + ".png" });
  await ELEVER[0].sida.screenshot({ path: SKARM + "/e-7-pall-m" + (mi + 1) + ".png", fullPage: true });
  console.log("Match " + (mi + 1) + ": klar efter " + (fs_[0]) + " frågor, vinnare " + vinnare + ", pall " + pall.map((r) => r.lag + "(" + r.steg + ")").join(" > "));
}

/* ---------- match 1 ---------- */
await lar.click("#btnHuvud"); // starta match 1
await lar.waitForFunction(() => window.__hk.vy.fas === "match", null, { timeout: 5000 });
await sov(300);
await ELEVER[0].sida.screenshot({ path: SKARM + "/e-3b-vantar.png" });
await spelaMatch(0, { animera: !SNABBT });
await lar.click("#btnHuvud"); // Nästa match
await lar.waitForFunction(() => window.__hk.vy.fas === "lobby" && window.__hk.vy.matchNr === 1, null, { timeout: 5000 });
await lar.click("#btnHuvud"); // starta match 2
await lar.waitForFunction(() => window.__hk.vy.fas === "match", null, { timeout: 5000 });
await spelaMatch(1, { animera: !SNABBT });
await lar.click("#btnHuvud");
await lar.waitForFunction(() => window.__hk.vy.fas === "lobby" && window.__hk.vy.matchNr === 2, null, { timeout: 5000 });
await lar.click("#btnHuvud");
await lar.waitForFunction(() => window.__hk.vy.fas === "match", null, { timeout: 5000 });
await spelaMatch(2, { animera: false });
// till mästarpallen
await lar.waitForFunction(() => /mästarpallen/.test(document.getElementById("btnHuvud").textContent), null, { timeout: 5000 });
await lar.click("#btnHuvud");
await lar.waitForFunction(() => window.__hk.vy.fas === "slut", null, { timeout: 5000 });
await sov(4000);
await lar.screenshot({ path: SKARM + "/e2e-l-7-slut.png" });
await ELEVER[0].sida.screenshot({ path: SKARM + "/e-8-slut.png", fullPage: true });
await ELEVER[3].sida.screenshot({ path: SKARM + "/e-8-slut-tiger.png", fullPage: true });
const sp = await lar.evaluate(() => window.__hk.vy.slutpall);
for (const r of sp) {
  kolla(r.poang === totPoang[r.lag], "Slut: poäng " + r.lag + " " + r.poang + " = modell " + totPoang[r.lag]);
  kolla(r.steg === totSteg[r.lag], "Slut: steg " + r.lag + " " + r.steg + " = modell " + totSteg[r.lag]);
}
for (let i = 0; i + 1 < sp.length; i++) kolla(sp[i].poang >= sp[i + 1].poang, "Slut: sorterad efter poäng");
console.log("Slutställning:", sp.map((r) => r.lag + " " + r.poang + "p/" + r.steg + "s").join(" > "));

kolla(konsol.length === 0, "inga konsolfel/varningar: " + konsol.slice(0, 5).join(" | "));
console.log("\nE2E (" + LAGE + "): " + ok + " kontroller godkända, " + fel.length + " misslyckade");
await browser.close();
process.exit(fel.length ? 1 : 0);
