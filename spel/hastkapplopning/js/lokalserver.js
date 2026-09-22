/* =====================================================================
   lokalserver.js – "servern" i lokalt läge. Lärarfliken kör spelmotorn
   (samma engine.js som Workern) och elevflikar/botar ansluter via
   BroadcastChannel (samma webbläsare och samma adress/origin).
   Lokalt läge är till för att prova spelet utan backend och för
   demo/test. För riktiga klassrum med elevernas egna enheter: använd Server.
   ===================================================================== */
import { nyttRum, hantera, tick, vyFor, markeraAnsluten, markeraLarare, INAKTIVITET_MS } from "./engine.js";

const KLIENT_TIMEOUT_MS = 9000;
const LAGRING = "hk-lokal-rum-";

function utanTid(vy) {
  const { nu, ...rest } = vy;
  return JSON.stringify(rest);
}

export class LokalServer {
  constructor(kod) {
    this.kod = kod;
    this.klienter = new Map(); // klientId → {spelarId, senast, sista}
    this.lyssnare = [];
    this.lararSista = null;
    this.rum = this.ateruppta() || nyttRum(kod, "lokal", Date.now());
    this.kanal = new BroadcastChannel("hk-" + kod);
    this.kanal.onmessage = (e) => this.motta(e.data);
    markeraLarare(this.rum, true);
    this.timer = setInterval(() => this.tack(), 400);
  }

  ateruppta() {
    try {
      const s = localStorage.getItem(LAGRING + this.kod);
      if (!s) return null;
      const rum = JSON.parse(s);
      if (!rum || rum.kod !== this.kod || Date.now() - rum.senast > INAKTIVITET_MS) return null;
      for (const id of Object.keys(rum.spelare)) rum.spelare[id].ansluten = false;
      return rum;
    } catch (e) {
      return null;
    }
  }

  spara() {
    try {
      localStorage.setItem(LAGRING + this.kod, JSON.stringify(this.rum));
    } catch (e) {
      /* lagring är bara en bekvämlighet */
    }
  }

  lyssna(fn) {
    this.lyssnare.push(fn);
    fn(this.lararVy());
  }

  lararVy() {
    return vyFor(this.rum, { roll: "larare" }, Date.now());
  }

  aktorFor(k) {
    if (k.spelarId && this.rum.spelare[k.spelarId]) return { roll: "elev", spelarId: k.spelarId };
    return { roll: "gast" };
  }

  till(klient, payload) {
    this.kanal.postMessage({ k: "s", till: klient, payload });
  }

  motta(m) {
    if (!m || typeof m !== "object" || typeof m.klient !== "string") return;
    const now = Date.now();
    let k = this.klienter.get(m.klient);
    if (m.k === "anslut") {
      k = { spelarId: typeof m.spelarId === "string" ? m.spelarId : null, senast: now, sista: null };
      if (k.spelarId && !this.rum.spelare[k.spelarId]) k.spelarId = null;
      this.klienter.set(m.klient, k);
      this.efter(true);
      return;
    }
    if (m.k === "ping") {
      if (!k) {
        this.till(m.klient, { t: "okand_klient" });
        return;
      }
      k.senast = now;
      if (this.rum.spelare[k.spelarId] && !this.rum.spelare[k.spelarId].ansluten) {
        markeraAnsluten(this.rum, k.spelarId, true);
        this.efter(false);
      }
      this.till(m.klient, { t: "pong" });
      return;
    }
    if (m.k === "stang") {
      if (k) {
        this.klienter.delete(m.klient);
        this.efter(false);
      }
      return;
    }
    if (m.k === "msg" && k) {
      k.senast = now;
      const res = hantera(this.rum, this.aktorFor(k), m.msg, now);
      if (res.ok && m.msg && m.msg.t === "hej" && res.spelarId) {
        k.spelarId = res.spelarId;
        this.till(m.klient, { t: "valkommen", spelarId: res.spelarId });
      }
      if (!res.ok) this.till(m.klient, { t: "fel", fel: res.fel, text: res.text });
      this.efter(res.ok);
    }
  }

  /* Lärarens åtgärder går direkt in i motorn. Returnerar motorns svar. */
  larareSkicka(msg) {
    const res = hantera(this.rum, { roll: "larare" }, msg, Date.now());
    this.efter(res.ok);
    return res;
  }

  tack() {
    const now = Date.now();
    let andrat = false;
    for (const [id, k] of this.klienter) {
      if (now - k.senast > KLIENT_TIMEOUT_MS) {
        this.klienter.delete(id);
        andrat = true;
      }
    }
    if (tick(this.rum, now)) andrat = true;
    if (andrat) this.efter(true);
  }

  efter(spara) {
    for (const k of this.klienter.values()) {
      if (k.spelarId && !this.rum.spelare[k.spelarId]) k.spelarId = null; // borttagen av läraren
    }
    const levande = new Set();
    for (const k of this.klienter.values()) if (k.spelarId) levande.add(k.spelarId);
    for (const id of Object.keys(this.rum.spelare)) markeraAnsluten(this.rum, id, levande.has(id));
    if (spara) this.spara();
    this.sand();
  }

  sand() {
    const now = Date.now();
    for (const [id, k] of this.klienter) {
      const vy = vyFor(this.rum, this.aktorFor(k), now);
      const nyckel = utanTid(vy);
      if (k.sista !== nyckel) {
        k.sista = nyckel;
        this.till(id, { t: "vy", vy });
      }
    }
    const lv = this.lararVy();
    const ln = utanTid(lv);
    if (this.lararSista !== ln) {
      this.lararSista = ln;
      for (const fn of this.lyssnare) fn(lv);
    }
  }

  stang() {
    clearInterval(this.timer);
    try {
      this.kanal.close();
    } catch (e) {}
  }
}
