// Persistenstest: ett rum ska överleva att Worker-processen dödas och startas om (Durable Object-lagringen).
// Startar EN egen `wrangler dev` (port 8821, inspektör 8822) med --persist-to i en tillfällig mapp, spelar en halv match,
// dödar processen hårt (SIGKILL), startar om och kontrollerar att rum, lag, ställning, poäng och lärarnyckel finns kvar
// och att spelet kan fortsätta.
// Kör:  HK_MODULES=/sökväg/till/mapp-med-node_modules/ node worker.persistens.mjs
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const MOD = (process.env.HK_MODULES || process.cwd() + "/").replace(/\/?$/, "/");
const require = createRequire(MOD + "x.js");
const WebSocket = require("ws");
const HAR = path.dirname(new URL(import.meta.url).pathname);
const WORKERMAPP = path.resolve(HAR, "..");
const ARB = fs.mkdtempSync(path.join(os.tmpdir(), "hk-persist-"));
fs.copyFileSync(path.join(WORKERMAPP, "worker.js"), path.join(ARB, "worker.js"));
fs.copyFileSync(path.join(WORKERMAPP, "wrangler.toml"), path.join(ARB, "wrangler.toml"));
const PORT = 8821;
const BAS = "http://127.0.0.1:" + PORT;
const ORIGIN = "http://localhost:8801";
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0;
const kolla = (v, t) => { assert.ok(v, t); ok++; };

let proc = null;
async function startaWrangler() {
  proc = spawn(process.execPath, [path.join(MOD, "node_modules", "wrangler", "bin", "wrangler.js"), "dev", "--port", String(PORT), "--inspector-port", "8822", "--ip", "127.0.0.1", "--local", "--persist-to", path.join(ARB, "persist")], {
    cwd: ARB,
    env: { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let ut = "";
  proc.stdout.on("data", (d) => (ut += d));
  proc.stderr.on("data", (d) => (ut += d));
  const t0 = Date.now();
  while (!/Ready on/.test(ut)) {
    if (Date.now() - t0 > 60000) throw new Error("wrangler startade inte:\n" + ut.slice(-800));
    await sov(200);
  }
}
async function dodaWrangler() {
  try { process.kill(-proc.pid, "SIGKILL"); } catch (e) {}
  await sov(1500);
}

class Klient {
  constructor(url) {
    this.vy = null;
    this.spelarId = null;
    this.ws = new WebSocket(url, { origin: ORIGIN });
    this.oppen = new Promise((res, rej) => { this.ws.on("open", res); this.ws.on("error", rej); });
    this.ws.on("message", (d) => {
      const s = d.toString();
      if (s === "pong") return;
      const m = JSON.parse(s);
      if (m.t === "vy") this.vy = m.vy;
      if (m.t === "valkommen") this.spelarId = m.spelarId;
    });
    this.ws.on("error", () => {});
  }
  skicka(o) { this.ws.send(JSON.stringify(o)); }
  async vanta(pred, ms = 5000, txt = "villkor") {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (this.vy && pred(this.vy)) return this.vy; await sov(20); }
    throw new Error("Tidsgräns: " + txt);
  }
}

try {
  await startaWrangler();
  const r = await fetch(BAS + "/rum", { method: "POST", headers: { Origin: ORIGIN } });
  const { kod, lararnyckel } = await r.json();
  const larare = new Klient(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=larare&nyckel=${lararnyckel}`);
  await larare.oppen;
  const maja = new Klient(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=elev`);
  const olle = new Klient(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=elev`);
  await maja.oppen; await olle.oppen;
  maja.skicka({ t: "hej", namn: "Maja" }); olle.skicka({ t: "hej", namn: "Olle" });
  await maja.vanta((v) => v.jag && v.jag.namn === "Maja"); await olle.vanta((v) => v.jag && v.jag.namn === "Olle");
  maja.skicka({ t: "valj_lag", lag: "hast" }); olle.skicka({ t: "valj_lag", lag: "zebra" });
  await larare.vanta((v) => v.lag.length === 2);
  larare.skicka({ t: "starta_match", nr: 0, namn: "Match 1 – Test", antalMatcher: 3, antalOrdinarie: 8, antalTotal: 12 });
  await larare.vanta((v) => v.fas === "match");
  larare.skicka({ t: "nasta_fraga", fraga: "Testfråga?", alternativ: ["A", "B", "C", "D"], ratt: 1, forklaring: "Förklaring", kalla: "Test" });
  await larare.vanta((v) => v.match && v.match.steg === "fraga");
  maja.skicka({ t: "svara", val: 1 });
  await sov(100);
  olle.skicka({ t: "svara", val: 2 });
  const fore = await larare.vanta((v) => v.match.steg === "avslojad", 5000, "avslöjad");
  const forePos = { ...fore.match.pos };
  kolla(forePos.hast === 3 && forePos.zebra === 0, "före omstart: häst 3 steg, zebra 0 (" + JSON.stringify(forePos) + ")");
  larare.skicka({ t: "nasta_fraga", fraga: "Fråga två?", alternativ: ["A", "B", "C", "D"], ratt: 0, forklaring: "F2", kalla: "Test" });
  await larare.vanta((v) => v.match.steg === "fraga" && v.match.fraga.nr === 2);
  maja.skicka({ t: "svara", val: 0 });
  await larare.vanta((v) => v.match.antalSvarat === 1, 3000, "första svaret registrerat");
  const majaId = maja.spelarId;
  console.log("Före omstart: rum", kod, "fråga 2 pågår, hast har svarat");

  // hård omstart
  for (const k of [larare, maja, olle]) try { k.ws.terminate(); } catch (e) {}
  await dodaWrangler();
  await startaWrangler();

  const finns = await (await fetch(`${BAS}/rum/${kod}`, { headers: { Origin: ORIGIN } })).json();
  kolla(finns.finns === true, "rummet finns efter omstart");
  const l2 = new Klient(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=larare&nyckel=${lararnyckel}`);
  await l2.oppen;
  const efter = await l2.vanta((v) => v.roll === "larare", 5000, "lärarvy efter omstart");
  kolla(efter.fas === "match" && efter.match.steg === "fraga" && efter.match.fraga.nr === 2, "fas/steg/frågenummer bevarade");
  kolla(efter.match.pos.hast === 3 && efter.match.pos.zebra === 0, "ställningen bevarad: " + JSON.stringify(efter.match.pos));
  kolla(efter.lag.length === 2 && efter.lag.every((l) => l.medlemmar.length === 1), "lag och medlemmar bevarade");
  kolla(efter.match.antalSvarat === 1, "det första svaret på fråga 2 bevarat");
  kolla(efter.match.fraga.ratt === undefined, "facit läcker inte efter omstart");
  const bad = await new Promise((res) => { const w = new WebSocket(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=larare&nyckel=fel`, { origin: ORIGIN }); w.on("unexpected-response", (rq, rs) => res(rs.statusCode)); w.on("open", () => res("öppnad")); w.on("error", () => {}); });
  kolla(bad === 401 || bad === 403, "fel lärarnyckel avvisas efter omstart (" + bad + ")");
  // eleven återansluter med sitt id och spelet kan fortsätta
  const m2 = new Klient(`ws://127.0.0.1:${PORT}/rum/${kod}/ws?roll=elev&id=${majaId}`);
  await m2.oppen;
  const mv = await m2.vanta((v) => v.jag && v.jag.lag === "hast", 5000, "Maja återansluten");
  kolla(mv.jag.namn === "Maja", "eleven känns igen efter omstart");
  l2.skicka({ t: "visa_svar" });
  const slut = await l2.vanta((v) => v.match.steg === "avslojad", 5000, "avslöja fråga 2");
  kolla(slut.match.pos.hast === 6 && slut.match.pos.zebra === 0, "spelet fortsätter efter omstart: häst 6 (" + JSON.stringify(slut.match.pos) + ")");
  console.log("Persistens: " + ok + " kontroller godkända");
} catch (e) {
  console.error("MISSLYCKADES:", e.message);
  process.exitCode = 1;
} finally {
  await dodaWrangler();
  fs.rmSync(ARB, { recursive: true, force: true });
  process.exit(process.exitCode || 0);
}
