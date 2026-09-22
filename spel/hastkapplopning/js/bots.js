/* =====================================================================
   bots.js – simulerade lag för Demoläget (?demo=1) och test.
   Varje bot är en riktig "elev" som ansluter via LokalElevTransport, väljer
   ett lag och svarar med slumpad svarstid och träffsäkerhet. Boten får facit
   via `orakel` (bara möjligt när boten körs i samma sida som den lokala
   servern) – aldrig från vyn, som inte innehåller facit före avslöjandet.
   ===================================================================== */
import { LokalElevTransport } from "./transport.js";
import { AVATARER } from "./engine.js";
import { fordelaGruppstorlekar } from "./slumpa-lag.js";

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

const NAMN = [
  "Bot Alva", "Bot Ben", "Bot Cleo", "Bot Dino", "Bot Elsa", "Bot Figge", "Bot Gunn", "Bot Hugo", "Bot Iris", "Bot Jack",
  "Bot Kaj", "Bot Lo", "Bot Mira", "Bot Noel", "Bot Otto", "Bot Pia", "Bot Quinn", "Bot Rut", "Bot Siv", "Bot Theo",
  "Bot Uno", "Bot Vera", "Bot Walle", "Bot Xen", "Bot Ylva", "Bot Zack",
];

/* Startar n bot-"elever" och slår ihop dem i slumpade lag (2–3 medlemmar
   per lag, precis som "Slumpa lag" i lobbyn – se slumpa-lag.js) i stället
   för ett lag per bot. Det gör att den nya regeln ("alla medlemmar måste
   svara rätt") går att öva på i Demoläget: varje medlem svarar för sig,
   med egen träffsäkerhet och eget tempo, så lag med flera medlemmar
   ibland missar poängen även när de flesta i laget svarade rätt.
   server = LokalServer i samma sida. */
export function startaBotar(server, n) {
  const orakel = () => (server.rum.match && server.rum.match.fraga ? server.rum.match.fraga.ratt : null);
  const antalBotar = Math.max(2, n);
  const grupper = fordelaGruppstorlekar(antalBotar).slice(0, AVATARER.length);
  const bots = [];
  let namnIx = 0;
  grupper.forEach((storlek, g) => {
    const avatar = AVATARER[g % AVATARER.length].id;
    for (let m = 0; m < storlek; m++) {
      const i = namnIx++;
      const b = new Bot({
        kod: server.kod,
        namn: NAMN[i % NAMN.length],
        avatar,
        // Träffsäkerhet/tempo varierar per LAG (så lagen skiljer sig åt i banan)
        // och lite per MEDLEM (så medlemmarna inte alltid svarar exakt samtidigt
        // och inte alltid har exakt samma träffsäkerhet – det är det som gör att
        // ett lag kan missa poängen fastän de flesta medlemmarna svarade rätt).
        traffsakerhet: Math.max(0.3, 0.92 - g * 0.08 - m * 0.1),
        tempo: 0.5 + ((g * 3 + m) % 5) / 4 + m * 0.15,
        orakel,
      });
      b.starta();
      bots.push(b);
    }
  });
  return bots;
}
