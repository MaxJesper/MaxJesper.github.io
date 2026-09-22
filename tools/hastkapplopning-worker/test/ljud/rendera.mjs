// Renderar de syntetiserade ljuden i js/sound.js offline (OfflineAudioContext i riktig Chromium) till ljud.json.
// Kör: HK_MODULES=/sökväg/till/mapp-med-node_modules/ HK_BASE=http://localhost:8801 node rendera.mjs
// Analysera sedan med:  python3 analysera.py   (topp, RMS, klippning, längd, grundtonsförlopp, hovslag, tonriktning)
// OBS: analysen visar bara att ljuden är tekniskt rimliga. De har INTE lyssnats igenom av en människa.
import { createRequire } from "node:module";
const req = createRequire((process.env.HK_MODULES || process.cwd() + "/") + "x.js");
const { chromium } = req("playwright");
const BAS = process.env.HK_BASE || "http://localhost:8801";
import fs from "fs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage();
await p.route(BAS + "/__t.html", (r) => r.fulfill({ contentType: "text/html", body: "<!doctype html><title>t</title>" }));
await p.goto(BAS + "/__t.html");
const namn = ["gnagg_stor","gnagg_liten","hovar","tick","tick_sista","last","ratt","fel","mal","pall"];
const ut = {};
for (const n of namn) {
  const r = await p.evaluate(async ([n, BAS]) => {
    const m = await import(BAS + "/spel/hastkapplopning/js/sound.js");
    const { sr, data } = await m.renderaOffline(n, 0.9);
    // Float32 → base64
    const u8 = new Uint8Array(data.buffer.slice(0));
    let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return { sr, b64: btoa(s) };
  }, [n, BAS]);
  ut[n] = r;
}
fs.writeFileSync("ljud.json", JSON.stringify(ut));
// Sanity: kontrollera att Ljud-klassen kan skapas och ljudtestets lista finns
const info = await p.evaluate(async (BAS) => { const m = await import(BAS + "/spel/hastkapplopning/js/sound.js"); return { antal: m.LJUD.length, namn: m.LJUD.map(x=>x[0]) }; }, BAS);
console.log(JSON.stringify(info));
await b.close();
