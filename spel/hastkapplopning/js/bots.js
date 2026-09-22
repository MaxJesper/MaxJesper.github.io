/* =====================================================================
   bots.js – simulerade lag för Demoläget (?demo=1) och test.
   Varje bot är en riktig "elev" som ansluter via LokalElevTransport, väljer
   ett lag och svarar med slumpad svarstid och träffsäkerhet. Boten får facit
   via `orakel` (bara möjligt när boten körs i samma sida som den lokala
   servern) – aldrig från vyn, som inte innehåller facit före avslöjandet.
   ===================================================================== */
import { LokalElevTransport } from "./transport.js";
import { AVATARER } from "./engine.js";

export class Bot {
  constructor(o) {
    this.kod = o.kod;
    this.namn = o.namn;
    this.avatar = o.avatar;
    this.traffsakerhet = o.traffsakerhet === undefined ? 0.7 : o.traffsakerhet;
    this.tempo = o.tempo === undefined ? 1 : o.tempo; // lägre = snabbare
    this.orakel = o.orakel; // () => rätt alternativindex för pågående fråga
    this.slump = o.slump || Math.random;
    this.svaradeNr = -1;
    this.hejSkickad = false;
    this.timer = null;
    this.transport = new LokalElevTransport({ kod: o.kod });
    this.transport.onvy = (vy) => this.vy(vy);
  }

  starta() {
    this.transport.starta();
  }

  stang() {
    clearTimeout(this.timer);
    this.transport.stang();
  }

  vy(vy) {
    if (!vy.jag) {
      if (!this.hejSkickad) {
        this.hejSkickad = true;
        this.transport.skicka({ t: "hej", namn: this.namn });
      }
      return; // en bot som tas bort av läraren går inte med igen
    }
    if (!vy.jag.lag) {
      if (vy.fas === "lobby") this.transport.skicka({ t: "valj_lag", lag: this.avatar });
      return;
    }
    const m = vy.match;
    if (m && m.steg === "fraga" && m.fraga && !m.mittSvar && this.svaradeNr !== m.fraga.nr) {
      this.svaradeNr = m.fraga.nr;
      const svarstid = m.fraga.svarstidMs;
      const vantan = Math.min(svarstid * 0.9, (1200 + this.slump() * this.slump() * svarstid * 0.6) * this.tempo);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        let val;
        const ratt = this.orakel ? this.orakel() : null;
        if (ratt !== null && ratt !== undefined && this.slump() < this.traffsakerhet) val = ratt;
        else {
          val = Math.floor(this.slump() * 4);
          if (val === ratt) val = (val + 1) % 4;
        }
        this.transport.skicka({ t: "svara", val });
      }, vantan);
    }
  }
}

const NAMN = ["Bot Alva", "Bot Ben", "Bot Cleo", "Bot Dino", "Bot Elsa", "Bot Figge", "Bot Gunn", "Bot Hugo", "Bot Iris", "Bot Jack", "Bot Kaj", "Bot Lo"];

/* Startar n botlag (djur i AVATARER-ordning). server = LokalServer i samma sida. */
export function startaBotar(server, n) {
  const orakel = () => (server.rum.match && server.rum.match.fraga ? server.rum.match.fraga.ratt : null);
  const bots = [];
  const antal = Math.max(2, Math.min(n, AVATARER.length));
  for (let i = 0; i < antal; i++) {
    const b = new Bot({
      kod: server.kod,
      namn: NAMN[i % NAMN.length],
      avatar: AVATARER[i].id,
      traffsakerhet: 0.92 - i * 0.08,
      tempo: 0.55 + ((i * 37) % 10) / 10,
      orakel,
    });
    b.starta();
    bots.push(b);
  }
  return bots;
}
