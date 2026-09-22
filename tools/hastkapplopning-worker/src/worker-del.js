/* =====================================================================
   Hästkapplöpning – Cloudflare Worker + Durable Object (klassen Rum)
   ---------------------------------------------------------------------
   Detta är den HANDSKRIVNA delen av worker.js. Spelmotorn (engine.js) läggs
   framför av bygg_worker.py. Redigera aldrig worker.js för hand – ändra här
   eller i spel/hastkapplopning/js/engine.js och kör bygg_worker.py igen.

   Rutter
     GET  /                      → {tjanst, ok} (enkel hälsokontroll)
     POST /rum                   → skapar rum, svarar {kod, lararnyckel}
     GET  /rum/{kod}             → {finns:true|false}
     GET  /rum/{kod}/ws?roll=larare&nyckel=…      (WebSocket, läraren)
     GET  /rum/{kod}/ws?roll=elev[&id=…]          (WebSocket, elev)

   Ett Durable Object per rum (idFromName(kod)). WebSocket Hibernation API:
   ingen körtid debiteras medan rummet är stilla.
   ===================================================================== */

/* ---- Inställningar som är lätta att ändra ---- */

// Tillåtna Origin för CORS (POST /rum) och WebSocket-uppgraderingen.
// Lägg till din egen adress här om sajten flyttas.
const TILLATNA_ORIGIN = [
  "https://maxjesper.github.io",
  "http://localhost:8801",
  "http://localhost:8765",
  "http://127.0.0.1:8801",
];

const MAX_ROMSKAPANDE_PER_MIN = 20; // per IP-adress och Worker-instans
const MAX_UPPGRADERINGAR_PER_MIN = 120; // per IP-adress och Worker-instans
const TAK_MEDDELANDEN = 30; // max antal meddelanden per anslutning ...
const TAK_FONSTER_MS = 10000; // ... inom så här lång tid

/* ---- Hjälpare ---- */

function corsHuvuden(origin) {
  if (!origin || !TILLATNA_ORIGIN.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, corsHuvuden(origin)),
  });
}

function konstantTid(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Enkel räknare per IP i Worker-instansens minne (räcker som skydd mot slarv, inte mot en avsiktlig attack).
const _ipRaknare = new Map();
function ipGrans(ip, namn, max, now) {
  const nyckel = namn + "|" + ip;
  let r = _ipRaknare.get(nyckel);
  if (!r || now - r.start > 60000) {
    r = { start: now, n: 0 };
    _ipRaknare.set(nyckel, r);
    if (_ipRaknare.size > 5000) _ipRaknare.clear();
  }
  r.n += 1;
  return r.n <= max;
}

/* ---- Worker (router) ---- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const ip = request.headers.get("CF-Connecting-IP") || "okand";
    const now = Date.now();
    const delar = url.pathname.split("/").filter(Boolean);

    if (request.method === "OPTIONS") {
      if (!origin || !TILLATNA_ORIGIN.includes(origin)) return new Response("Otillåten origin", { status: 403 });
      return new Response(null, { status: 204, headers: corsHuvuden(origin) });
    }

    if (delar.length === 0) {
      return json({ tjanst: "hastkapplopning", ok: true, motor: MOTORVERSION }, 200, origin);
    }

    if (delar[0] !== "rum") return json({ fel: "hittas_inte" }, 404, origin);

    // POST /rum – skapa rum
    if (delar.length === 1) {
      if (request.method !== "POST") return json({ fel: "metod" }, 405, origin);
      if (!origin || !TILLATNA_ORIGIN.includes(origin)) return json({ fel: "origin", text: "Otillåten origin." }, 403, origin);
      if (!ipGrans(ip, "skapa", MAX_ROMSKAPANDE_PER_MIN, now)) return json({ fel: "for_manga", text: "För många rum skapade. Vänta en stund." }, 429, origin);
      for (let f = 0; f < 12; f++) {
        const kod = slumpRumskod();
        const nyckel = slumpText(24);
        const stub = env.RUM.get(env.RUM.idFromName(kod));
        const svar = await stub.fetch("https://rum.intern/skapa", { method: "POST", body: JSON.stringify({ kod, nyckel }) });
        if (svar.status === 201) return json({ kod, lararnyckel: nyckel }, 201, origin);
        if (svar.status !== 409) return json({ fel: "intern", text: "Kunde inte skapa rum." }, 500, origin);
      }
      return json({ fel: "intern", text: "Kunde inte hitta en ledig rumskod." }, 503, origin);
    }

    const kod = delar[1].toUpperCase();
    if (!arGiltigRumskod(kod)) return json({ fel: "ogiltig_kod", text: "Ogiltig rumskod." }, 400, origin);
    const stub = env.RUM.get(env.RUM.idFromName(kod));

    // GET /rum/{kod} – finns rummet?
    if (delar.length === 2) {
      if (request.method !== "GET") return json({ fel: "metod" }, 405, origin);
      const svar = await stub.fetch("https://rum.intern/finns");
      const data = await svar.json();
      return json({ finns: !!data.finns }, 200, origin);
    }

    // GET /rum/{kod}/ws – WebSocket
    if (delar.length === 3 && delar[2] === "ws") {
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Förväntade WebSocket-uppgradering", { status: 426 });
      if (!origin || !TILLATNA_ORIGIN.includes(origin)) return new Response("Otillåten origin", { status: 403 });
      if (!ipGrans(ip, "ws", MAX_UPPGRADERINGAR_PER_MIN, now)) return new Response("För många anslutningsförsök", { status: 429 });
      return stub.fetch(request);
    }

    return json({ fel: "hittas_inte" }, 404, origin);
  },
};

/* ---- Durable Object: ett rum ---- */

export class Rum extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.rum = null;
    this.takbegransare = new Map(); // ws → begränsare (i minnet)
    this.senasteVy = new Map(); // ws → senast skickade vy (utan nu), för att slippa skicka dubletter
    this.varningar = new Map();
    // Hjärtslag: klienten skickar texten "ping" och får "pong" utan att rummet väcks.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    this.ctx.blockConcurrencyWhile(async () => {
      this.rum = (await this.ctx.storage.get("rum")) || null;
      if (this.rum) this.synkaAnslutna();
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "rum.intern") {
      if (url.pathname === "/skapa" && request.method === "POST") return this.skapa(request);
      if (url.pathname === "/finns") return new Response(JSON.stringify({ finns: !!this.rum }), { headers: { "Content-Type": "application/json" } });
      return new Response("Hittas inte", { status: 404 });
    }
    return this.uppgradera(request, url);
  }

  async skapa(request) {
    if (this.rum) return new Response("Finns redan", { status: 409 });
    let d;
    try {
      d = await request.json();
    } catch (e) {
      return new Response("Ogiltig begäran", { status: 400 });
    }
    if (!arGiltigRumskod(d.kod) || typeof d.nyckel !== "string" || d.nyckel.length < 16) return new Response("Ogiltig begäran", { status: 400 });
    this.rum = nyttRum(d.kod, d.nyckel, Date.now());
    await this.ctx.storage.put("rum", this.rum);
    await this.satLarm();
    return new Response("Skapat", { status: 201 });
  }

  async uppgradera(request, url) {
    if (!this.rum) return new Response("Rummet finns inte (eller har gått ut).", { status: 404 });
    const roll = url.searchParams.get("roll");
    const att = { roll: null, spelarId: null };
    if (roll === "larare") {
      if (!konstantTid(url.searchParams.get("nyckel") || "", this.rum.lararnyckel)) return new Response("Fel lärarnyckel", { status: 403 });
      att.roll = "larare";
    } else if (roll === "elev") {
      att.roll = "elev";
      const id = url.searchParams.get("id");
      if (id && /^[a-z0-9]{6,24}$/.test(id) && this.rum.spelare[id]) att.spelarId = id;
    } else {
      return new Response("Ogiltig roll", { status: 400 });
    }
    const par = new WebSocketPair();
    const [klient, server] = Object.values(par);
    if (att.roll === "larare") {
      // Nyaste lärarfliken gäller – äldre lärarfönster stängs.
      for (const ws of this.ctx.getWebSockets()) {
        const a = ws.deserializeAttachment();
        if (a && a.roll === "larare") {
          try {
            ws.close(4000, "Ersatt av en nyare lärarsession");
          } catch (e) {}
        }
      }
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(att);
    this.synkaAnslutna();
    const now = Date.now();
    this.skickaVy(server, now, true);
    this.sandTillAlla(now, server);
    return new Response(null, { status: 101, webSocket: klient });
  }

  /* Anslutningsflaggorna (ansluten/lararAnsluten) härleds alltid ur öppna sockets. */
  synkaAnslutna(uteslut) {
    if (!this.rum) return;
    const levande = new Set();
    let lararen = false;
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === uteslut) continue;
      const a = ws.deserializeAttachment();
      if (!a) continue;
      if (a.roll === "larare") lararen = true;
      else if (a.spelarId) levande.add(a.spelarId);
    }
    for (const id of Object.keys(this.rum.spelare)) markeraAnsluten(this.rum, id, levande.has(id));
    markeraLarare(this.rum, lararen);
  }

  aktorFor(att) {
    if (att && att.roll === "larare") return { roll: "larare" };
    if (att && att.roll === "elev" && att.spelarId && this.rum && this.rum.spelare[att.spelarId]) return { roll: "elev", spelarId: att.spelarId };
    return { roll: "gast" };
  }

  skickaVy(ws, now, tvinga) {
    if (!this.rum) return;
    const att = ws.deserializeAttachment();
    const vy = vyFor(this.rum, this.aktorFor(att), now);
    const { nu, ...utanTid } = vy;
    const nyckel = JSON.stringify(utanTid);
    if (!tvinga && this.senasteVy.get(ws) === nyckel) return;
    this.senasteVy.set(ws, nyckel);
    try {
      ws.send(JSON.stringify({ t: "vy", vy }));
    } catch (e) {}
  }

  sandTillAlla(now, hoppaOver) {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === hoppaOver) continue;
      this.skickaVy(ws, now, false);
    }
  }

  skickaFel(ws, fel, text) {
    try {
      ws.send(JSON.stringify({ t: "fel", fel, text }));
    } catch (e) {}
  }

  async webSocketMessage(ws, meddelande) {
    if (!this.rum) {
      ws.close(1001, "Rummet finns inte längre");
      return;
    }
    if (typeof meddelande !== "string") {
      ws.close(1003, "Bara text tillåts");
      return;
    }
    if (meddelande.length > GRANSER.maxMeddelande) {
      ws.close(1009, "För stort meddelande");
      return;
    }
    const now = Date.now();
    let tb = this.takbegransare.get(ws);
    if (!tb) {
      tb = nyTakbegransare(TAK_MEDDELANDEN, TAK_FONSTER_MS);
      this.takbegransare.set(ws, tb);
    }
    if (!tillat(tb, now)) {
      const n = (this.varningar.get(ws) || 0) + 1;
      this.varningar.set(ws, n);
      this.skickaFel(ws, "for_snabbt", "Du skickar för många meddelanden. Vänta lite.");
      if (n >= 5) ws.close(1008, "För många meddelanden");
      return;
    }
    let msg;
    try {
      msg = JSON.parse(meddelande);
    } catch (e) {
      this.skickaFel(ws, "ogiltigt", "Meddelandet kunde inte läsas.");
      return;
    }
    const att = ws.deserializeAttachment() || {};
    const aktor = this.aktorFor(att);
    const res = hantera(this.rum, aktor, msg, now);
    if (res.ok && msg && msg.t === "hej" && res.spelarId) {
      att.spelarId = res.spelarId;
      ws.serializeAttachment(att);
      try {
        ws.send(JSON.stringify({ t: "valkommen", spelarId: res.spelarId }));
      } catch (e) {}
    }
    if (!res.ok) this.skickaFel(ws, res.fel, res.text);
    await this.efterHantering(now, res.ok, ws);
  }

  /* Gemensamt efter varje meddelande/alarm: släpp borttagna spelares anslutningar,
     spara, sätt alarm och skicka nya vyer. */
  async efterHantering(now, andrat, ws) {
    if (!this.rum) return;
    for (const s of this.ctx.getWebSockets()) {
      const a = s.deserializeAttachment();
      if (a && a.roll === "elev" && a.spelarId && !this.rum.spelare[a.spelarId]) {
        a.spelarId = null; // borttagen av läraren: blir gäst
        s.serializeAttachment(a);
      }
    }
    this.synkaAnslutna();
    if (andrat) {
      await this.ctx.storage.put("rum", this.rum);
      await this.satLarm();
    }
    this.sandTillAlla(now);
    if (ws) this.skickaVy(ws, now, false);
  }

  async webSocketClose(ws, kod, orsak, renStangning) {
    try {
      ws.close(kod, orsak);
    } catch (e) {}
    this.stangd(ws);
  }

  async webSocketError(ws) {
    this.stangd(ws);
  }

  stangd(ws) {
    this.takbegransare.delete(ws);
    this.senasteVy.delete(ws);
    this.varningar.delete(ws);
    if (!this.rum) return;
    this.synkaAnslutna(ws);
    this.sandTillAlla(Date.now(), ws);
  }

  /* Ett enda alarm: frågans sluttid eller (annars) inaktivitetsgränsen på 8 timmar. */
  async satLarm() {
    if (!this.rum) return;
    const dl = nastaTidpunkt(this.rum);
    const inakt = this.rum.senast + INAKTIVITET_MS;
    const onskat = dl !== null ? Math.min(dl, inakt) : inakt;
    const nu = await this.ctx.storage.getAlarm();
    if (dl !== null) {
      if (nu !== onskat) await this.ctx.storage.setAlarm(onskat);
    } else if (nu === null || nu < Date.now() || nu > inakt) {
      await this.ctx.storage.setAlarm(inakt);
    }
  }

  async alarm() {
    if (!this.rum) return;
    const now = Date.now();
    if (now - this.rum.senast >= INAKTIVITET_MS) {
      for (const ws of this.ctx.getWebSockets()) {
        try {
          ws.close(1001, "Rummet har stängts efter 8 timmars inaktivitet");
        } catch (e) {}
      }
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.deleteAll();
      this.rum = null;
      return;
    }
    if (tick(this.rum, now)) {
      await this.ctx.storage.put("rum", this.rum);
      this.sandTillAlla(now);
    }
    await this.satLarm();
  }
}
