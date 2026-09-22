// Integrationstest mot en KÖRANDE Worker (t.ex. `npx wrangler dev --port 8811`).
// Kör:  HK_WORKER_URL=http://127.0.0.1:8811 node --test tools/hastkapplopning-worker/test/worker.integration.test.mjs
// Kräver npm-paketet "ws" (npm i ws). Pekas ut med HK_MODULES=/sökväg/till/mapp-med-node_modules/ om det inte hittas.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(process.env.HK_MODULES ? process.env.HK_MODULES.replace(/\/?$/, "/") + "x.js" : import.meta.url);
const WebSocket = require("ws");

const BAS = process.env.HK_WORKER_URL || "http://127.0.0.1:8811";
const WS_BAS = BAS.replace(/^http/, "ws");
const ORIGIN = "http://localhost:8801";
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

async function skapaRum(origin = ORIGIN) {
  const h = origin ? { Origin: origin, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  return fetch(BAS + "/rum", { method: "POST", headers: h, body: "{}" });
}

class Klient {
  constructor(url, origin = ORIGIN) {
    this.url = url;
    this.msgs = [];
    this.vy = null;
    this.stangd = null;
    this.spelarId = null;
    this.fel = [];
    this.ws = new WebSocket(url, origin === null ? {} : { origin });
    this.oppen = new Promise((res, rej) => {
      this.ws.on("open", res);
      this.ws.on("error", rej);
      this.ws.on("unexpected-response", (req, r) => rej(Object.assign(new Error("HTTP " + r.statusCode), { status: r.statusCode })));
    });
    this.ws.on("message", (d) => {
      const s = d.toString();
      if (s === "pong") return;
      const m = JSON.parse(s);
      this.msgs.push({ raw: s, m });
      if (m.t === "vy") this.vy = m.vy;
      if (m.t === "valkommen") this.spelarId = m.spelarId;
      if (m.t === "fel") this.fel.push(m);
    });
    this.ws.on("close", (kod, orsak) => {
      this.stangd = { kod, orsak: orsak.toString() };
    });
    this.ws.on("error", () => {});
  }
  skicka(o) {
    this.ws.send(typeof o === "string" ? o : JSON.stringify(o));
  }
  async vanta(pred, ms = 5000, beskrivning = "villkor") {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (this.vy && pred(this.vy)) return this.vy;
      await sov(15);
    }
    throw new Error("Tidsgräns: " + beskrivning + " (senaste vy: " + JSON.stringify(this.vy && { fas: this.vy.fas, steg: this.vy.match && this.vy.match.steg }) + ")");
  }
  stang() {
    try {
      this.ws.close();
    } catch (e) {}
  }
}

async function motAvvisad(url, origin) {
  const k = new Klient(url, origin);
  try {
    await k.oppen;
    k.stang();
    return null;
  } catch (e) {
    return e.status || e.message;
  }
}

function fraga(i, ratt) {
  return { t: "nasta_fraga", fraga: "Testfråga " + i + "?", alternativ: ["A", "B", "C", "D"], ratt, forklaring: "Facit-förklaring " + i, kalla: "Test" };
}

test("HTTP: hälsokontroll, rumsskapande och CORS/Origin", async () => {
  const h = await fetch(BAS + "/");
  assert.equal(h.status, 200);
  assert.equal((await h.json()).ok, true);
  assert.equal((await skapaRum(null)).status, 403, "utan Origin");
  assert.equal((await skapaRum("https://evil.example")).status, 403, "otillåten Origin");
  const pre = await fetch(BAS + "/rum", { method: "OPTIONS", headers: { Origin: "https://maxjesper.github.io", "Access-Control-Request-Method": "POST" } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get("access-control-allow-origin"), "https://maxjesper.github.io");
  const preNej = await fetch(BAS + "/rum", { method: "OPTIONS", headers: { Origin: "https://evil.example" } });
  assert.equal(preNej.status, 403);
  const r = await skapaRum("https://maxjesper.github.io");
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("access-control-allow-origin"), "https://maxjesper.github.io");
  const d = await r.json();
  assert.match(d.kod, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
  assert.ok(d.lararnyckel.length >= 16);
  const f = await (await fetch(BAS + "/rum/" + d.kod, { headers: { Origin: ORIGIN } })).json();
  assert.equal(f.finns, true);
  const g = await (await fetch(BAS + "/rum/ZZZZ", { headers: { Origin: ORIGIN } })).json();
  assert.equal(g.finns, false);
  assert.equal((await fetch(BAS + "/rum/0O1I")).status, 400);
});

test("WebSocket: origin, nyckel och roll kontrolleras vid uppgraderingen", async () => {
  const { kod, lararnyckel } = await (await skapaRum()).json();
  const u = (q) => `${WS_BAS}/rum/${kod}/ws?${q}`;
  assert.equal(await motAvvisad(u("roll=elev"), null), 403, "ingen origin");
  assert.equal(await motAvvisad(u("roll=elev"), "https://evil.example"), 403, "fel origin");
  assert.equal(await motAvvisad(u("roll=larare&nyckel=fel"), ORIGIN), 403, "fel nyckel");
  assert.equal(await motAvvisad(u("roll=larare"), ORIGIN), 403, "ingen nyckel");
  assert.equal(await motAvvisad(u("roll=admin"), ORIGIN), 400, "okänd roll");
  assert.equal(await motAvvisad(`${WS_BAS}/rum/ZZZZ/ws?roll=elev`, ORIGIN), 404, "rum saknas");
  assert.equal(await motAvvisad(u("roll=larare&nyckel=" + lararnyckel), "https://maxjesper.github.io"), null, "rätt nyckel + tillåten origin");
  const plain = await fetch(`${BAS}/rum/${kod}/ws?roll=elev`);
  assert.equal(plain.status, 426);
});

test("Helt spel: lärare + 6 elever spelar en hel match; facit läcker inte; återanslutning; utkastning", async () => {
  const { kod, lararnyckel } = await (await skapaRum()).json();
  const larare = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=larare&nyckel=${lararnyckel}`);
  await larare.oppen;
  await larare.vanta((v) => v.roll === "larare", 3000, "lärarvy");
  const djur = ["hast", "zebra", "tiger", "elefant", "kamel", "alg"];
  const elever = [];
  for (let i = 0; i < 6; i++) {
    const e = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
    await e.oppen;
    e.skicka({ t: "hej", namn: "Elev" + i });
    await e.vanta((v) => v.jag && v.jag.namn === "Elev" + i, 3000, "hej");
    assert.ok(e.spelarId && e.spelarId.length >= 6);
    e.skicka({ t: "valj_lag", lag: djur[i] });
    await e.vanta((v) => v.jag.lag === djur[i], 3000, "valj_lag");
    elever.push(e);
  }
  const lv = await larare.vanta((v) => v.lag.length === 6, 3000, "6 lag");
  assert.equal(lv.lag.every((l) => l.medlemmar.length === 1 && l.medlemmar[0].ansluten), true);
  // Elev får inte göra lärarens åtgärder
  elever[0].skicka({ t: "starta_match", nr: 0, namn: "X", antalMatcher: 3, antalOrdinarie: 8, antalTotal: 12 });
  await sov(150);
  assert.equal(elever[0].fel.at(-1).fel, "ej_behorig");
  // Lärare startar match med kort bana
  larare.skicka({ t: "installningar", banlangd: 10, svarstid_s: 10 });
  larare.skicka({ t: "starta_match", nr: 0, namn: "Match 1 – test", antalMatcher: 3, antalOrdinarie: 8, antalTotal: 12 });
  await larare.vanta((v) => v.match && v.match.steg === "vantar", 3000, "match startad");
  const skickadeUnderFraga = [];
  let q = 0;
  while (!larare.vy.match.klar && q < 12) {
    q++;
    const ratt = q % 4;
    const fore = elever.map((e) => e.msgs.length);
    larare.skicka(fraga(q, ratt));
    await Promise.all(elever.map((e) => e.vanta((v) => v.match && v.match.steg === "fraga" && v.match.fraga.nr === q, 3000, "fråga " + q)));
    // eleverna svarar i ordning 0..5: jämna lag rätt, udda fel; lag 5 svarar inte alls
    for (let i = 0; i < 5; i++) {
      elever[i].skicka({ t: "svara", val: i % 2 === 0 ? ratt : (ratt + 1) % 4 });
      await sov(25);
    }
    await elever[0].vanta((v) => v.match.mittSvar, 3000, "svar låst");
    // Dubbeltryck avvisas
    elever[0].skicka({ t: "svara", val: (ratt + 2) % 4 });
    await sov(100);
    assert.equal(elever[0].fel.at(-1).fel, "redan_svarat");
    // Facit får inte finnas i något som elever/lärare fått hittills under frågan
    for (let i = 0; i < 6; i++) {
      for (const { raw } of elever[i].msgs.slice(fore[i])) {
        assert.ok(!raw.includes("Facit-förklaring " + q), "förklaringen läckte före avslöjandet");
        assert.ok(!raw.includes('"ratt"'), 'fältet "ratt" läckte före avslöjandet');
      }
    }
    larare.skicka({ t: "visa_svar" });
    await Promise.all([larare, ...elever].map((c) => c.vanta((v) => v.match.steg === "avslojad", 3000, "avslöjad")));
    const ev = elever[0].vy;
    assert.equal(ev.match.fraga.ratt, ratt);
    assert.ok(ev.match.fraga.forklaring.includes("Facit-förklaring " + q));
    const res = larare.vy.match.resultat;
    assert.equal(res.lag.hast.allaRatt, true);
    assert.equal(res.lag.hast.rang, 1, "lag 0 svarade först och rätt (ensam medlem = laget)");
    assert.equal(res.lag.hast.steg, 3);
    assert.equal(res.lag.tiger.rang, 2);
    assert.equal(res.lag.tiger.steg, 2);
    assert.equal(res.lag.kamel.rang, 3);
    assert.equal(res.lag.kamel.steg, 1);
    assert.equal(res.lag.zebra.steg, 0);
    assert.equal(res.lag.alg.alltSvarat, false);
    skickadeUnderFraga.push(q);
    if (q === 2) {
      // Återanslutning: elev 2 (tiger) kopplar ner och tillbaka med samma id
      const id = elever[2].spelarId;
      elever[2].stang();
      await larare.vanta((v) => v.lag.find((l) => l.id === "tiger").medlemmar[0].ansluten === false, 3000, "tiger frånkopplad");
      const ny = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev&id=${id}`);
      await ny.oppen;
      const v = await ny.vanta((x) => x.jag && x.jag.lag === "tiger", 3000, "återansluten");
      assert.equal(v.jag.namn, "Elev2");
      assert.equal(v.match.pos.tiger, larare.vy.match.pos.tiger, "banläget bevarat");
      ny.spelarId = id;
      elever[2] = ny;
      await larare.vanta((v2) => v2.lag.find((l) => l.id === "tiger").medlemmar[0].ansluten === true, 3000, "tiger åter ansluten");
    }
  }
  assert.ok(larare.vy.match.klar, "matchen avgjordes inom 12 frågor (bana 10)");
  assert.ok(q >= 4 && q <= 12);
  assert.equal(larare.vy.match.vinnare, "hast", "lag 0 fick 3 steg varje fråga och vinner");
  larare.skicka({ t: "till_pall" });
  await larare.vanta((v) => v.match.steg === "pall", 3000, "pall");
  assert.deepEqual(larare.vy.match.pall.map((r) => r.poang), [3, 2, 1, 0, 0, 0]);
  assert.equal(larare.vy.match.pall[0].lag, "hast");
  larare.skicka({ t: "nasta_match" });
  await larare.vanta((v) => v.fas === "lobby" && v.matchNr === 1, 3000, "lobby för match 2");
  assert.equal(larare.vy.lag.length, 6, "lagen består");
  // Utkastning
  const offer = larare.vy.lag.find((l) => l.id === "alg").medlemmar[0];
  larare.skicka({ t: "ta_bort_spelare", spelarId: offer.id });
  await elever[5].vanta((v) => v.jag === null, 3000, "utkastad blir gäst");
  await larare.vanta((v) => v.lag.length === 5, 3000, "laget försvann");
  elever[5].skicka({ t: "svara", val: 0 });
  await sov(100);
  assert.equal(elever[5].fel.at(-1).fel, "ej_behorig");
  // Ny lärarsession stänger den gamla
  const larare2 = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=larare&nyckel=${lararnyckel}`);
  await larare2.oppen;
  await larare2.vanta((v) => v.roll === "larare", 3000);
  await sov(200);
  assert.equal(larare.stangd && larare.stangd.kod, 4000, "gammal lärarsession stängd");
  [larare2, ...elever].forEach((c) => c.stang());
});

test("Robusthet: för stort meddelande, skräp, hastighetsbegränsning, binärt", async () => {
  const { kod } = await (await skapaRum()).json();
  const e = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
  await e.oppen;
  e.skicka("{inte json");
  await sov(100);
  assert.equal(e.fel.at(-1).fel, "ogiltigt");
  e.skicka(JSON.stringify({ t: "hej", namn: "<img src=x onerror=alert(1)>" }));
  await sov(100);
  assert.equal(e.fel.at(-1).fel, "ogiltigt_namn");
  e.skicka(JSON.stringify({ t: "hej", namn: "Snabb" }));
  await e.vanta((v) => v.jag && v.jag.namn === "Snabb", 3000);
  // 5000 tecken → stängs med 1009
  e.skicka(JSON.stringify({ t: "hej", namn: "x".repeat(5000) }));
  await sov(300);
  assert.equal(e.stangd && e.stangd.kod, 1009);
  // hastighetsbegränsning
  const f = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
  await f.oppen;
  for (let i = 0; i < 80; i++) f.skicka({ t: "hej", namn: "Spam" + (i % 5) });
  await sov(500);
  assert.ok(f.fel.some((x) => x.fel === "for_snabbt"), "begränsaren slog till");
  await sov(200);
  assert.ok(f.stangd, "upprepad överträdelse stänger anslutningen");
  // binärt meddelande
  const g = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
  await g.oppen;
  g.ws.send(Buffer.from([1, 2, 3]));
  await sov(300);
  assert.equal(g.stangd && g.stangd.kod, 1003);
});

test("Rumsgräns: högst 60 spelare", async () => {
  const { kod } = await (await skapaRum()).json();
  const alla = [];
  for (let i = 0; i < 61; i++) {
    const c = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
    await c.oppen;
    c.skicka({ t: "hej", namn: "S" + i });
    alla.push(c);
    if (i % 10 === 9) await sov(400); // håll under hastighetsgränsen per IP (uppgraderingar)
  }
  await sov(800);
  const med = alla.filter((c) => c.spelarId).length;
  const fulla = alla.filter((c) => c.fel.some((x) => x.fel === "rum_fullt")).length;
  assert.equal(med, 60);
  assert.equal(fulla, 1);
  alla.forEach((c) => c.stang());
});

test("Alarm: frågan stängs av servern när tiden går ut (utan att någon trycker)", async () => {
  const { kod, lararnyckel } = await (await skapaRum()).json();
  const larare = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=larare&nyckel=${lararnyckel}`);
  await larare.oppen;
  const a = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
  const b = new Klient(`${WS_BAS}/rum/${kod}/ws?roll=elev`);
  await a.oppen;
  await b.oppen;
  a.skicka({ t: "hej", namn: "A" });
  b.skicka({ t: "hej", namn: "B" });
  await a.vanta((v) => v.jag, 3000);
  await b.vanta((v) => v.jag, 3000);
  a.skicka({ t: "valj_lag", lag: "hast" });
  b.skicka({ t: "valj_lag", lag: "zebra" });
  await b.vanta((v) => v.jag.lag === "zebra", 3000);
  larare.skicka({ t: "installningar", svarstid_s: 10 });
  larare.skicka({ t: "starta_match", nr: 0, namn: "M", antalMatcher: 3, antalOrdinarie: 8, antalTotal: 12 });
  await larare.vanta((v) => v.match, 3000);
  larare.skicka(fraga(1, 2));
  await a.vanta((v) => v.match && v.match.steg === "fraga", 3000);
  a.skicka({ t: "svara", val: 2 }); // ett av två lag svarar; frågan stängs inte i förtid
  const t0 = Date.now();
  await larare.vanta((v) => v.match.steg === "avslojad", 14000, "servern stänger frågan");
  const dt = Date.now() - t0;
  assert.ok(dt >= 8000 && dt <= 12500, "stängdes efter ca 10 s (var " + dt + " ms)");
  assert.equal(larare.vy.match.resultat.lag.hast.steg, 3);
  assert.equal(larare.vy.match.resultat.lag.zebra.alltSvarat, false);
  [larare, a, b].forEach((c) => c.stang());
});
