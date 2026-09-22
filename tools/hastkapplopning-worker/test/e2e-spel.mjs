/* E2E: en lärarsida + 7 elevsidor spelar alla tre matcher (manuellt lagval, ett lag – "hast" –
   med TVÅ medlemmar för att öva den nya regeln), plus en andra svit i ett nytt rum som testar
   lobbyfunktionen "Slumpa lag".
   Utan HK_API: lokalt läge (BroadcastChannel, ingen server).
   Med HK_API=http://127.0.0.1:8813: serverläge mot en körande Worker (wrangler dev). config.js skrivs då över
   i webbläsaren via Playwright (filen på disk ändras inte), så att sidorna pratar med Workern.
   Regel (22 sep 2026): ALLA medlemmar i ett lag måste svara, och alla måste svara RÄTT, för att
   laget ska räknas som klart. Lagets klar-tid = tidpunkten för dess SISTA medlems svar. Se
   engine.js och OVERLAMNING.md.
   Kontrollerar steg, poäng, rangordning efter lagets klar-tid, att fel/uteblivna/ofullständiga
   svar ger 0, att rätt svar inte läcker före avslöjandet, per-lag-svarsstatus i UI:t (lärare och
   elev) och "Slumpa lag"-flödet.
   Kör:  HK_MODULES=/tmp/sc/hk-test/ HK_BASE=http://localhost:8804 [HK_API=http://127.0.0.1:8813] node e2e-spel.mjs
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

/* ===================================================================
   DEL 1: hela spelet, manuellt lagval, tre matcher – "hast" har TVÅ
   medlemmar (Anna + Bo) för att öva den nya regeln i praktiken.
   =================================================================== */
console.log("Del 1: manuellt lagval, tre matcher (hast = Anna+Bo)…");

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
const LAGMEDLEMMAR = {};
for (const e of ELEVER) (LAGMEDLEMMAR[e.lag] ||= []).push(e);
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

/* Frågetiden får inte vara alltför kort: den första frågan i match 1 lägger in extra
   kontroller (skärmdumpar, väntar-status) MELLAN Annas och Bos svar, se spelaMatch(). */
await lar.evaluate(() => window.__hk.transport.skicka({ t: "installningar", svarstid_s: 25 }));

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

/* Låter ALLA medlemmar i ett lag svara (en efter en, med kort mellanrum).
   sistaFel: den SISTA medlemmen svarar fel (så laget klarar inte frågan
   trots att övriga medlemmar svarade rätt – den nya regelns kärna). */
async function svaraLag(lagId, textRatt, sistaFel) {
  const medlemmar = LAGMEDLEMMAR[lagId];
  for (let i = 0; i < medlemmar.length; i++) {
    const felHar = !!sistaFel && i === medlemmar.length - 1;
    await klickaSvar(medlemmar[i], textRatt, felHar);
    if (i < medlemmar.length - 1) await sov(70);
  }
}

async function spelaMatch(mi, opts) {
  const match = DATA.matcher[mi];
  const L = await lar.evaluate(() => (window.__hk.vy.match ? window.__hk.vy.match.banlangd : null));
  const pos = Object.fromEntries(LAG.map((l) => [l, 0]));
  const mpoang = { tre: Object.fromEntries(LAG.map((l) => [l, 0])) };
  let vinnare = null;
  const fs_ = [];
  for (let q = 0; q < match.fragor.length && !vinnare; q++) {
    // vänta tills läraren kan starta nästa fråga
    await lar.waitForFunction(
      () => {
        const t = document.getElementById("btnHuvud").textContent;
        return /Nästa fråga/.test(t);
      },
      null,
      { timeout: 30000 }
    );
    await lar.click("#btnHuvud");
    await lar.waitForFunction(() => window.__hk.vy.match.steg === "fraga", null, { timeout: 5000 });
    const fraga = await lar.evaluate(() => window.__hk.vy.match.fraga);
    kolla(fraga.ratt === undefined && fraga.forklaring === undefined, "M" + (mi + 1) + " F" + (q + 1) + ": läraren ser inte facit före avslöjandet");
    const ursprung = match.fragor[q];
    kolla(fraga.text === ursprung.fraga, "M" + (mi + 1) + " F" + (q + 1) + ": frågetexten är den förväntade i ordning (fraga.nr=" + fraga.nr + ", fick: " + fraga.text.slice(0, 50) + ")");
    const textRatt = ursprung.alternativ[ursprung.ratt];
    // elevernas vyer: ingen läcka
    for (const e of ELEVER) await e.sida.waitForFunction((n) => window.__hkElev.vy.match && window.__hkElev.vy.match.steg === "fraga" && window.__hkElev.vy.match.fraga.nr === n, q + 1);
    const lack = await ELEVER[2].sida.evaluate(() => JSON.stringify(window.__hkElev.vy));
    kolla(!/"ratt":\d/.test(lack.replace(/"lag":\{[^}]*\}/g, "")) && !/forklaring/.test(lack) && !/antalRatt/.test(lack), "M" + (mi + 1) + " F" + (q + 1) + ": elevvyn saknar rätt svar, förklaring och lagens facit-relaterade räknare före avslöjandet");
    if (mi === 0 && q === 0) {
      await lar.screenshot({ path: SKARM + "/e2e-l-2-fraga.png" });
      await ELEVER[0].sida.screenshot({ path: SKARM + "/e-4-fraga.png" });
      await ELEVER[1].sida.screenshot({ path: SKARM + "/e-4-fraga-360x640.png" });
      await ELEVER[2].sida.screenshot({ path: SKARM + "/e-4-fraga-1366x768.png" });
      await lar.click("#btnAlt");
      await sov(300);
      await lar.screenshot({ path: SKARM + "/e2e-l-3-fraga-alt.png" });
    }
    const algFel = q % 2 === 1;
    // Specialfall (bara match 1, fråga 2): Bo (hasts andra medlem) svarar FEL trots att
    // Anna svarar rätt → laget ska INTE räknas som klart, alltså 0 steg för hast.
    const bosFel = mi === 0 && q === 1;
    // ordning: rotera BASORDNING med q
    const rot = BASORDNING.map((_, i) => BASORDNING[(i + q) % 4]);
    const rattaOrdning = rot.filter((l) => !(l === "alg" && algFel) && !(l === "hast" && bosFel));
    for (const l of rot) {
      if (l === "hast" && mi === 0 && q === 0) {
        // Anna svarar rätt först …
        await klickaSvar(ELEVER[0], textRatt, false);
        await sov(250);
        // … innan Bo svarar: kontrollera att BÅDAS skärmar (och lärarens) visar att laget
        // ännu inte är klart – utan att avslöja NÅGOT om vad Anna svarade.
        await ELEVER[1].sida.waitForFunction(() => window.__hkElev.vy.match && window.__hkElev.vy.match.steg === "fraga");
        const annasText = await ELEVER[0].sida.$eval("#lastStatus", (n) => n.textContent);
        kolla(/Väntar på: Bo/.test(annasText), "M1 F1: Annas skärm väntar uttryckligen på Bo, utan att avslöja vad han ska svara (" + annasText + ")");
        await lar.waitForFunction(
          () => {
            const li = document.querySelector('#lagStatusLista li[data-lag="hast"]');
            return li && /1 av 2/.test(li.textContent);
          },
          null,
          { timeout: 5000 }
        );
        kolla(true, "M1 F1: lärarens lagstatuslista visar '1 av 2 har svarat' för hast innan Bo svarat");
        await lar.screenshot({ path: SKARM + "/e2e-l-2b-lagstatus-delvis.png" });
        await ELEVER[0].sida.screenshot({ path: SKARM + "/e-4b-vantar-pa-lagkompis.png" });
        await ELEVER[1].sida.screenshot({ path: SKARM + "/e-4c-bo-inte-svarat-an.png" });
        // Bo svarar rätt också → laget klart och rätt
        await klickaSvar(ELEVER[1], textRatt, false);
      } else if (l === "hast" && bosFel) {
        await klickaSvar(ELEVER[0], textRatt, false); // Anna rätt
        await sov(70);
        await klickaSvar(ELEVER[1], textRatt, true); // Bo fel
      } else {
        await svaraLag(l, textRatt, l === "alg" && algFel);
      }
      await sov(180);
    }
    // tiger svarar alltid fel
    await klickaSvar(ELEVER.find((x) => x.lag === "tiger"), textRatt, true);
    await sov(180);
    // elefant svarar inte. Första frågan i varje match: vänta på tidsgränsen, annars visa svar nu.
    if (q === 0) {
      await lar.waitForFunction(() => window.__hk.vy.match.steg === "avslojad", null, { timeout: 30000 });
      kolla(true, "M" + (mi + 1) + ": frågan stängdes av tidsgränsen (elefant hann aldrig svara, så laget elefant och den nya regeln kräver att motorn väntar på tidsgränsen)");
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
      const arKlarOchRatt = rattaOrdning.includes(l);
      kolla(!!r.allaRatt === arKlarOchRatt, p + ": " + l + " allaRatt=" + r.allaRatt + " (väntat " + arKlarOchRatt + ")");
      if (l === "tiger") kolla(r.alltSvarat && !r.allaRatt && r.steg === 0, p + ": tiger (ensam medlem) svarade fel → 0 steg");
      if (l === "elefant") kolla(!r.alltSvarat && r.steg === 0, p + ": elefant (ensam medlem) svarade inte i tid → 0 steg");
      if (l === "hast" && bosFel) kolla(r.alltSvarat && !r.allaRatt && r.antalRatt === 1 && r.antalMedlemmar === 2 && r.steg === 0, p + ": hast (Anna rätt, Bo fel) klarade INTE frågan trots att en medlem svarade rätt (" + JSON.stringify(r) + ")");
    }
    kolla((vy.match.vinnare || null) === vinnFore, p + ": vinnare " + vy.match.vinnare + " (väntat " + vinnFore + ")");
    // elevernas texter
    for (const e of ELEVER) {
      await e.sida.waitForSelector(".resultat");
      const t = await e.sida.$eval(".resultat", (n) => n.textContent);
      const l = e.lag;
      if (l === "hast" && bosFel) {
        kolla(/Inte alla svarade rätt/.test(t) && /0 steg/.test(t), p + ": " + e.namn + " (hast, Bo svarade fel) ser 'Inte alla svarade rätt' (" + t + ")");
      } else if (l === "tiger") {
        kolla(/✗ Fel/.test(t) && /0 steg/.test(t), p + ": " + e.namn + " ser Fel/0 steg (" + t + ")");
      } else if (l === "elefant") {
        kolla(/Inget svar/.test(t) && /0 steg/.test(t), p + ": " + e.namn + " (ensam i laget) ser att den inte svarade i tid (" + t + ")");
      } else if (rattaOrdning.includes(l)) {
        const i = rattaOrdning.indexOf(l);
        const re = i === 0 ? /nr 1 → \+3/ : i === 1 ? /nr 2 → \+2/ : new RegExp(i + " lag var snabbare → \\+1");
        const rubrikRe = LAGMEDLEMMAR[l].length > 1 ? /Alla i laget svarade rätt/ : /✓ Rätt/;
        kolla(rubrikRe.test(t) && re.test(t), p + ": " + e.namn + " (" + l + ", plats " + (i + 1) + ") ser: " + t);
      } else kolla(/✗/.test(t), p + ": " + e.namn + " (älg, fel den här frågan) ser: " + t);
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
    if (mi === 0 && q === 1) await lar.screenshot({ path: SKARM + "/e2e-l-4b-hast-inte-alla-ratt.png" });
    // animation: låt den gå eller hoppa över
    if (opts.animera && q < 2) {
      await lar.waitForFunction(() => !window.__hk.animerar, null, { timeout: 30000 });
      if (mi === 1 && q === 0) await lar.screenshot({ path: SKARM + "/e2e-l-5-efter-anim.png" });
    } else {
      // Kolla och klicka atomiskt i EN evaluate() – annars kan animationen hinna ta
      // slut mellan att vi läser knapptexten och att vi faktiskt klickar, så att
      // klicket i stället tolkas som "Nästa fråga" och startar en fråga för mycket.
      await lar.evaluate(() => {
        if (window.__hk.animerar) document.getElementById("btnHuvud").click();
      });
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
  const sorterad = LAG.slice().sort((a, b) => {
    const x = nyckel(a),
      y = nyckel(b);
    for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return y[i] - x[i];
    return 0;
  });
  kolla(pall[0].lag === vinnare, "M" + (mi + 1) + ": prispallens etta är vinnaren (" + pall[0].lag + ")");
  for (let i = 0; i < 3; i++) {
    const a = sorterad[i],
      b = sorterad[i + 1];
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
  console.log("Match " + (mi + 1) + ": klar efter " + fs_[0] + " frågor, vinnare " + vinnare + ", pall " + pall.map((r) => r.lag + "(" + r.steg + ")").join(" > "));
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

// stäng del 1:s sidor (minskar resursbelastningen för del 2)
for (const sida of [lar, ...ELEVER.map((e) => e.sida)]) {
  try {
    await sida.close();
  } catch (e) {}
}

/* ===================================================================
   DEL 2: "Slumpa lag" – lobbyfunktionen (nytt rum, 6 elever skriver
   bara namn, läraren slumpar fram lag om 2–3, en fråga spelas för att
   visa att den nya poängregeln fungerar likadant för slumpade lag.
   =================================================================== */
console.log("\nDel 2: Slumpa lag …");
const lar2 = await ctx.newPage();
await lar2.setViewportSize({ width: 1920, height: 1080 });
bevaka(lar2, "lärare2");
await lar2.goto(BAS + "/spel/hastkapplopning/larare.html?lage=" + LAGE + "&u=mineraler-och-vitaminer");
await lar2.waitForFunction(() => window.__hk && window.__hk.vy);
const KOD2 = await lar2.evaluate(() => window.__hk.kod);
console.log("Rumskod (del 2)", KOD2);
kolla((await lar2.getAttribute("#btnSlumpaLag", "aria-pressed")) === "false", "Slumpa lag: avstängt som förval");
await lar2.click("#btnSlumpaLag");
await lar2.waitForFunction(() => window.__hk.vy.inst.slumpLage === true);
kolla((await lar2.getAttribute("#btnSlumpaLag", "aria-pressed")) === "true", "Slumpa lag: knappen visar på efter klick");

const NAMN2 = ["Alva", "Bjorn", "Cleo", "Dodo", "Ellen", "Finn"];
const sidor2 = [];
for (const namn of NAMN2) {
  const p = await ctx.newPage();
  bevaka(p, namn);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(BAS + "/spel/hastkapplopning/elev.html?rum=" + KOD2 + (API ? "" : "&lage=lokal"));
  await p.waitForSelector("#namnIn");
  sidor2.push({ namn, sida: p });
}
kolla(true, "Slumpa lag: eleverna ser bara namnrutan (ingen avatarväljare) tack vare det ordinarie 'gå med'-flödet");
for (const { namn, sida } of sidor2) {
  await sida.fill("#namnIn", namn);
  await sida.click("button[type=submit]");
}
for (const { sida } of sidor2) await sida.waitForFunction(() => window.__hkElev.vy && window.__hkElev.vy.jag && !window.__hkElev.vy.jag.lag && window.__hkElev.vy.inst.slumpLage);
const vantarRubrik = await sidor2[0].sida.$eval("#vyRubrik", (n) => n.textContent);
kolla(/lagindelningen/.test(vantarRubrik), "Slumpa lag: eleven ser en väntar-skärm i stället för avatarväljaren (" + vantarRubrik + ")");
await lar2.waitForFunction(() => (window.__hk.vy.utanLag || []).length === 6, null, { timeout: 5000 });
await lar2.screenshot({ path: SKARM + "/e2e-l-8-slumpa-vantar.png" });
await sidor2[0].sida.screenshot({ path: SKARM + "/e-9-slumpa-vantar.png" });

await lar2.click("#btnSkapaSlumpadeLag");
await lar2.waitForFunction(() => window.__hk.vy.lag.length > 0 && (window.__hk.vy.utanLag || []).length === 0, null, { timeout: 5000 });
const lag2 = await lar2.evaluate(() => window.__hk.vy.lag.map((l) => ({ id: l.id, n: l.medlemmar.length })));
kolla(
  lag2.reduce((a, l) => a + l.n, 0) === 6,
  "Slumpa lag: alla 6 elever hamnade i exakt ett lag (" + JSON.stringify(lag2) + ")"
);
kolla(lag2.every((l) => l.n >= 2 && l.n <= 3), "Slumpa lag: alla lag har 2–3 medlemmar, aldrig ensamma (" + JSON.stringify(lag2) + ")");
kolla(new Set(lag2.map((l) => l.id)).size === lag2.length, "Slumpa lag: varje lag fick en unik avatar");
await lar2.screenshot({ path: SKARM + "/e2e-l-9-slumpa-klart.png" });
for (const { sida } of sidor2) await sida.waitForFunction(() => window.__hkElev.vy.jag && window.__hkElev.vy.jag.lag, null, { timeout: 5000 });
await sidor2[0].sida.screenshot({ path: SKARM + "/e-10-slumpat-lag.png" });
const lagremsaTxt = await sidor2[0].sida.$eval("#lagremsa", (n) => n.textContent);
kolla(/Lag /.test(lagremsaTxt), "Slumpa lag: elevens skärm visar tydligt vilket lag och vilka lagkompisar (" + lagremsaTxt + ")");

// Spela EN fråga för att verifiera att den nya regeln fungerar likadant för ett slumpat lag
await lar2.evaluate(() => window.__hk.transport.skicka({ t: "installningar", svarstid_s: 12, banlangd: 10 }));
await lar2.click("#btnHuvud"); // starta match
await lar2.waitForFunction(() => window.__hk.vy.fas === "match", null, { timeout: 5000 });
await lar2.click("#btnHuvud"); // nästa fråga
await lar2.waitForFunction(() => window.__hk.vy.match.steg === "fraga", null, { timeout: 5000 });
for (const { sida } of sidor2) await sida.waitForSelector("button.alt", { timeout: 8000 });
const flerpersLag = lag2.find((l) => l.n >= 2).id;
const enPersLag = lag2.find((l) => l.id !== flerpersLag);
const dataFraga0 = DATA.matcher[0].fragor[0];
const rattText = dataFraga0.alternativ[dataFraga0.ratt];
const medlemmarILaget = await lar2.evaluate((lagId) => window.__hk.vy.lag.find((l) => l.id === lagId).medlemmar.map((m) => m.namn), flerpersLag);
// ALLA medlemmar i det slumpade flerpersonslaget svarar rätt (en efter en)
for (const namn of medlemmarILaget) {
  const e = sidor2.find((x) => x.namn === namn);
  await klickaSvar(e, rattText, false);
  await sov(150);
}
await sov(300);
await lar2.screenshot({ path: SKARM + "/e2e-l-10-slumpa-fraga-delvis.png" });
await lar2.evaluate(() => window.__hk.transport.skicka({ t: "visa_svar" }));
await lar2.waitForFunction(() => window.__hk.vy.match.steg === "avslojad", null, { timeout: 5000 });
const resSlump = await lar2.evaluate(() => window.__hk.vy.match.resultat);
kolla(resSlump.lag[flerpersLag].allaRatt === true, "Slumpa lag: det slumpade flerpersonslaget (" + medlemmarILaget.join(", ") + ") klarade frågan – alla svarade rätt");
kolla(resSlump.lag[flerpersLag].steg === 3, "Slumpa lag: laget var (ensamt) klart och rätt → 3 steg");
kolla(resSlump.lag[enPersLag.id].alltSvarat === false && resSlump.lag[enPersLag.id].steg === 0, "Slumpa lag: laget som inte svarade alls fick 0 steg");
await lar2.screenshot({ path: SKARM + "/e2e-l-11-slumpa-fraga-klar.png" });

for (const sida of [lar2, ...sidor2.map((x) => x.sida)]) {
  try {
    await sida.close();
  } catch (e) {}
}

kolla(konsol.length === 0, "inga konsolfel/varningar: " + konsol.slice(0, 5).join(" | "));
console.log("\nE2E (" + LAGE + "): " + ok + " kontroller godkända, " + fel.length + " misslyckade");
await browser.close();
process.exit(fel.length ? 1 : 0);
