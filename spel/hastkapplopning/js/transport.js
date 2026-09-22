/* =====================================================================
   transport.js – två transporter bakom samma gränssnitt
   ---------------------------------------------------------------------
   Gränssnitt (både WsTransport och Lokal*Transport):
     t.onvy(vy)            ny vy från servern
     t.onstatus(status, detalj)   'ansluter' | 'ansluten' | 'ateransluter' | 'stangd' | 'rum_saknas' | 'ersatt'
     t.onvalkommen({spelarId})    (elever) servern har skapat/känt igen spelaren
     t.onfel({fel, text})         servern avvisade en åtgärd
     t.starta()   t.skicka(msg)   t.stang()
   ===================================================================== */
import { LokalServer } from "./lokalserver.js";

function slumpKlient() {
  return "k" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------- WebSocket mot Workern ---------- */
export class WsTransport {
  constructor(o) {
    this.api = o.api.replace(/\/+$/, "");
    this.kod = o.kod;
    this.roll = o.roll;
    this.nyckel = o.nyckel || null;
    this.spelarId = o.spelarId || null;
    this.ws = null;
    this.stangdAvOss = false;
    this.forsok = 0;
    this.misslyckade = 0;
    this.timer = null;
    this.pingTimer = null;
    this.senastHord = 0;
    this.onvy = this.onstatus = this.onvalkommen = this.onfel = () => {};
    this._vid = () => {
      if (document.visibilityState === "visible") this.paminn();
    };
  }

  url() {
    let u = this.api.replace(/^http/, "ws") + "/rum/" + encodeURIComponent(this.kod) + "/ws?roll=" + this.roll;
    if (this.roll === "larare") u += "&nyckel=" + encodeURIComponent(this.nyckel || "");
    else if (this.spelarId) u += "&id=" + encodeURIComponent(this.spelarId);
    return u;
  }

  starta() {
    this.stangdAvOss = false;
    document.addEventListener("visibilitychange", this._vid);
    window.addEventListener("online", this._vid);
    this.anslut(false);
  }

  anslut(igen) {
    this.onstatus(igen ? "ateransluter" : "ansluter");
    let oppnad = false;
    let ws;
    try {
      ws = new WebSocket(this.url());
    } catch (e) {
      this.planera();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      oppnad = true;
      this.forsok = 0;
      this.misslyckade = 0;
      this.senastHord = Date.now();
      this.onstatus("ansluten");
      this.startaPing();
    };
    ws.onmessage = (e) => {
      this.senastHord = Date.now();
      if (e.data === "pong") return;
      let m;
      try {
        m = JSON.parse(e.data);
      } catch (x) {
        return;
      }
      if (m.t === "vy") this.onvy(m.vy);
      else if (m.t === "valkommen") {
        this.spelarId = m.spelarId;
        this.onvalkommen(m);
      } else if (m.t === "fel") this.onfel(m);
    };
    ws.onclose = (e) => {
      this.stoppaPing();
      if (this.ws !== ws) return;
      if (this.stangdAvOss) return;
      if (e.code === 4000) {
        this.onstatus("ersatt");
        return;
      }
      if (e.code === 1001 && /Rummet (har stängts|finns inte)/.test(e.reason || "")) {
        this.onstatus("rum_saknas");
        return;
      }
      if (!oppnad) this.misslyckade += 1;
      this.planera();
    };
    ws.onerror = () => {};
  }

  startaPing() {
    this.stoppaPing();
    this.pingTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== 1) return;
      if (Date.now() - this.senastHord > 25000) {
        try {
          this.ws.close();
        } catch (e) {}
        return;
      }
      try {
        this.ws.send("ping");
      } catch (e) {}
    }, 10000);
  }

  stoppaPing() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  async planera() {
    if (this.stangdAvOss) return;
    this.onstatus("ateransluter");
    if (this.misslyckade >= 3) {
      // Är det rummet som saknas, eller bara nätverket?
      try {
        const r = await fetch(this.api + "/rum/" + encodeURIComponent(this.kod));
        if (r.ok && (await r.json()).finns === false) {
          this.onstatus("rum_saknas");
          return;
        }
      } catch (e) {
        /* nätverksfel: fortsätt försöka */
      }
    }
    const vantan = Math.min(8000, 500 * Math.pow(2, this.forsok)) + Math.random() * 400;
    this.forsok += 1;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.anslut(true), vantan);
  }

  paminn() {
    if (this.stangdAvOss) return;
    if (!this.ws || this.ws.readyState > 1) {
      clearTimeout(this.timer);
      this.anslut(true);
    }
  }

  skicka(msg) {
    if (this.ws && this.ws.readyState === 1) {
      try {
        this.ws.send(JSON.stringify(msg));
        return true;
      } catch (e) {}
    }
    return false;
  }

  stang() {
    this.stangdAvOss = true;
    clearTimeout(this.timer);
    this.stoppaPing();
    document.removeEventListener("visibilitychange", this._vid);
    window.removeEventListener("online", this._vid);
    try {
      if (this.ws) this.ws.close();
    } catch (e) {}
    this.onstatus("stangd");
  }
}

/* ---------- Lokalt läge: lärare (kör "servern" i sidan) ---------- */
export class LokalLarareTransport {
  constructor(o) {
    this.server = o.server || new LokalServer(o.kod);
    this.onvy = this.onstatus = this.onvalkommen = this.onfel = () => {};
  }
  starta() {
    this.onstatus("ansluten");
    this.server.lyssna((vy) => this.onvy(vy));
  }
  skicka(msg) {
    const res = this.server.larareSkicka(msg);
    if (!res.ok) this.onfel({ fel: res.fel, text: res.text });
    return res.ok;
  }
  stang() {
    this.server.stang();
    this.onstatus("stangd");
  }
}

/* ---------- Lokalt läge: elev/bot (BroadcastChannel) ---------- */
export class LokalElevTransport {
  constructor(o) {
    this.kod = o.kod;
    this.spelarId = o.spelarId || null;
    this.klient = slumpKlient();
    this.kanal = null;
    this.senast = 0;
    this.ping = null;
    this.onvy = this.onstatus = this.onvalkommen = this.onfel = () => {};
    this._hej = () => this.post({ k: "stang", klient: this.klient });
  }
  post(o) {
    try {
      this.kanal.postMessage(o);
    } catch (e) {}
  }
  starta() {
    this.onstatus("ansluter");
    this.kanal = new BroadcastChannel("hk-" + this.kod);
    this.senast = Date.now();
    this.kanal.onmessage = (e) => {
      const m = e.data;
      if (!m || m.k !== "s" || m.till !== this.klient) return;
      this.senast = Date.now();
      const p = m.payload;
      if (p.t === "vy") {
        if (this.status !== "ansluten") this.satt("ansluten");
        this.onvy(p.vy);
      } else if (p.t === "valkommen") {
        this.spelarId = p.spelarId;
        this.onvalkommen(p);
      } else if (p.t === "fel") this.onfel(p);
      else if (p.t === "pong") {
        if (this.status !== "ansluten") this.satt("ansluten");
      } else if (p.t === "okand_klient") this.anslut();
    };
    window.addEventListener("pagehide", this._hej);
    this.anslut();
    this.ping = setInterval(() => {
      if (Date.now() - this.senast > 9000) {
        this.satt("ateransluter");
        this.anslut();
      }
      this.post({ k: "ping", klient: this.klient });
    }, 3000);
  }
  satt(s) {
    this.status = s;
    this.onstatus(s);
  }
  anslut() {
    this.post({ k: "anslut", klient: this.klient, spelarId: this.spelarId });
  }
  skicka(msg) {
    this.post({ k: "msg", klient: this.klient, msg });
    return true;
  }
  stang() {
    clearInterval(this.ping);
    window.removeEventListener("pagehide", this._hej);
    this.post({ k: "stang", klient: this.klient });
    try {
      this.kanal.close();
    } catch (e) {}
    this.satt("stangd");
  }
}

/* Fabrik. lage: 'server' | 'lokal'. */
export function skapaTransport(o) {
  if (o.lage === "lokal") {
    return o.roll === "larare" ? new LokalLarareTransport(o) : new LokalElevTransport(o);
  }
  return new WsTransport(o);
}

/* Skapar ett rum på servern. Returnerar {kod, lararnyckel}. */
export async function skapaServerRum(api) {
  const r = await fetch(api.replace(/\/+$/, "") + "/rum", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) {
    let text = "Kunde inte skapa rum (status " + r.status + ").";
    try {
      const d = await r.json();
      if (d.text) text = d.text;
    } catch (e) {}
    throw new Error(text);
  }
  const d = await r.json();
  if (!d.kod || !d.lararnyckel) throw new Error("Oväntat svar från servern.");
  return d;
}

export async function rumFinns(api, kod) {
  const r = await fetch(api.replace(/\/+$/, "") + "/rum/" + encodeURIComponent(kod));
  if (!r.ok) throw new Error("status " + r.status);
  return (await r.json()).finns === true;
}
