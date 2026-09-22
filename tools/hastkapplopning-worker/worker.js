/* =====================================================================
   GENERERAD FIL – ÄNDRA ALDRIG DEN FÖR HAND.
   Byggd av tools/hastkapplopning-worker/bygg_worker.py ur
     spel/hastkapplopning/js/engine.js        (sha256 e72786ca4d87)
     tools/hastkapplopning-worker/src/worker-del.js (sha256 1684326c863f)
   Driftsätt med:  npx wrangler deploy   (kör i mappen tools/hastkapplopning-worker)
   ===================================================================== */
import { DurableObject } from "cloudflare:workers";

/* ------------------------- engine.js (spelmotorn) ------------------------- */
/* =====================================================================
   engine.js – Hästkapplöpning: ren spelmotor (ingen DOM, inget nätverk)
   ---------------------------------------------------------------------
   Deterministisk tillståndsmaskin. Samma fil används av
     (a) Cloudflare Durable Object-servern (bundlas in i worker.js av
         tools/hastkapplopning-worker/bygg_worker.py), och
     (b) det lokala läget i webbläsaren (js/lokalserver.js).
   Alla tidpunkter tas som parametern `now` (millisekunder, SERVERNS klocka).
   Klientens klocka avgör aldrig snabbhetsordningen.

   VIKTIGT för byggskriptet: exportera bara med `export function` och
   `export const` (en per rad, i början av raden). Ingen `import`,
   ingen `export default`, ingen `export { … }`.

   Sammanfattning av flödet
     lobby → (starta_match) → match: vantar → fraga → avslojad → … → pall
     pall → (nasta_match) → lobby (nästa match) … efter sista matchen → slut
     slut → (ny_omgang) → lobby (lag och medlemmar består, poäng nollas)

   Poäng per fråga (regel från 22 sep 2026, se OVERLAMNING.md):
   VARJE medlem i ett lag måste svara, och ALLA måste svara RÄTT, för att
   laget ska räknas som "klart" på frågan. Ett lags "klar-tid" är
   tidpunkten (server-now) för dess SISTA medlems svar. Bland de lag som
   är klara (alla medlemmar svarade rätt) rangordnas klar-tiden: nr 1 = 3
   steg + gnägg, nr 2 = 2 steg + gnägg, övriga klara = 1 steg (hovljud).
   Ett lag där minst en medlem svarat fel, ELLER där inte alla medlemmar
   hunnit svara innan tiden gick ut/läraren avslöjade svaret, får 0 steg.
   Tie-break vid exakt samma klar-tid (millisekund): det globala
   svarsnumret (löpnummer, tilldelat i den ordning enskilda svar faktiskt
   togs emot av servern) för det AVGÖRANDE svaret (lagets sista) avgör –
   lägre nummer vinner. Ett lag med bara en medlem avgörs alltså direkt av
   den enda medlemmens svar, precis som tidigare.
   ===================================================================== */

const MOTORVERSION = 2;

/* Djuren som lagen väljer mellan. id = ASCII (används i sprite-symbolen
   #hk-<id> i img/avatarer.svg). Ordningen = visningsordning. */
const AVATARER = [
  { id: "hast", namn: "Häst" },
  { id: "zebra", namn: "Zebra" },
  { id: "tiger", namn: "Tiger" },
  { id: "elefant", namn: "Elefant" },
  { id: "kamel", namn: "Kamel" },
  { id: "alg", namn: "Älg" },
  { id: "snigel", namn: "Snigel" },
  { id: "kanin", namn: "Kanin" },
  { id: "giraff", namn: "Giraff" },
  { id: "skoldpadda", namn: "Sköldpadda" },
];

const GRANSER = {
  maxSpelare: 60,
  maxLag: 12, // begränsas i praktiken av antalet avatarer
  namnMax: 20,
  maxMeddelande: 4096, // tecken i ett inkommande meddelande
  fragaTextMax: 300,
  alternativMax: 120,
  forklaringMax: 300,
  kallaMax: 200,
  matchNamnMax: 60,
};

const STANDARD = {
  svarstid_s: 20,
  banlangd: 16,
  autoFordrojning_s: 6,
  auto: false,
  visaAlternativ: false,
  slumpLage: false, // lobbyläget "Slumpa lag": elever skriver bara namn, ingen avatarväljning
};

const OMFANG = {
  svarstid_s: [10, 60],
  banlangd: [10, 30],
  autoFordrojning_s: [2, 20],
};

const MATCHPOANG = [3, 2, 1];
const STEG_PER_RANG = [3, 2, 1];
const RUMSKOD_TECKEN = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // utan 0 O 1 I L
const INAKTIVITET_MS = 8 * 60 * 60 * 1000;

/* ---------- Hjälpare ---------- */

function slumpText(n, tecken) {
  const alfabet = tecken || "abcdefghijklmnopqrstuvwxyz0123456789";
  let ut = "";
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : null;
  if (c && c.getRandomValues) {
    const b = new Uint32Array(n);
    c.getRandomValues(b);
    for (let i = 0; i < n; i++) ut += alfabet[b[i] % alfabet.length];
  } else {
    for (let i = 0; i < n; i++) ut += alfabet[Math.floor(Math.random() * alfabet.length)];
  }
  return ut;
}

function slumpRumskod() {
  return slumpText(4, RUMSKOD_TECKEN);
}

function arGiltigRumskod(kod) {
  return typeof kod === "string" && /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/.test(kod);
}

function avatar(id) {
  for (const a of AVATARER) if (a.id === id) return a;
  return null;
}

function avatarNamn(id) {
  const a = avatar(id);
  return a ? a.namn : id;
}

function fel(kod, text) {
  return { ok: false, fel: kod, text: text || kod };
}

function ok(extra) {
  return Object.assign({ ok: true }, extra || {});
}

function heltal(v, min, max) {
  if (typeof v !== "number" || !Number.isInteger(v)) return null;
  if (v < min || v > max) return null;
  return v;
}

/* Rensar fritext: kontrolltecken bort, blanksteg normaliseras. Returnerar
   null om typen är fel eller texten är tom/för lång. Ingen HTML tolkas
   någonstans – klienterna ska ändå bara använda textContent. */
function renText(s, max, tillatTom) {
  if (typeof s !== "string") return null;
  // eslint-disable-next-line no-control-regex
  let t = s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  if (!t && !tillatTom) return null;
  if ([...t].length > max) return null;
  return t;
}

const NAMN_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._'’-]*$/u;

/* Förnamn/smeknamn: bokstäver, siffror, blank, punkt, understreck, apostrof,
   bindestreck. Max 20 tecken (kodpunkter). Inga <, >, &, citattecken. */
function renNamn(s) {
  const t = renText(s, GRANSER.namnMax);
  if (t === null) return null;
  if (!NAMN_RE.test(t)) return null;
  return t;
}

/* ---------- Rum ---------- */

function nyttRum(kod, lararnyckel, now) {
  return {
    v: MOTORVERSION,
    kod,
    lararnyckel,
    skapad: now,
    senast: now,
    inst: Object.assign({}, STANDARD),
    fas: "lobby",
    matchNr: 0,
    antalMatcher: 3,
    spelare: {},
    nastaSpelare: 1,
    lag: {},
    lagordning: [],
    poang: {},
    totalSteg: {},
    totalTid: {},
    historik: [],
    slutpall: null,
    match: null,
    lararAnsluten: false,
  };
}

function antalSpelare(rum) {
  return Object.keys(rum.spelare).length;
}

function lagHarAktiv(rum, lagId) {
  const l = rum.lag[lagId];
  if (!l) return false;
  return l.medlemmar.some((sid) => rum.spelare[sid] && rum.spelare[sid].ansluten);
}

function aktivaLag(rum) {
  return rum.lagordning.filter((id) => lagHarAktiv(rum, id));
}

/* Aktuella medlemmar (spelar-id) i ett lag, oavsett anslutningsstatus. */
function medlemmarAvLag(rum, lagId) {
  const l = rum.lag[lagId];
  return l ? l.medlemmar : [];
}

/* Har ALLA nuvarande medlemmar i laget svarat på den öppna frågan?
   Ett lag utan medlemmar räknas aldrig som klart. */
function lagArKlart(rum, mt, lagId) {
  const mm = medlemmarAvLag(rum, lagId);
  if (mm.length === 0) return false;
  return mm.every((sid) => !!mt.svar[sid]);
}

function taBortTommaLag(rum) {
  // Tomma lag rensas bara i lobbyn (mitt i en match behåller laget sin position).
  if (rum.fas !== "lobby") return;
  for (const id of rum.lagordning.slice()) {
    if (rum.lag[id].medlemmar.length === 0) {
      delete rum.lag[id];
      delete rum.poang[id];
      delete rum.totalSteg[id];
      delete rum.totalTid[id];
      rum.lagordning = rum.lagordning.filter((x) => x !== id);
    }
  }
}

function lasSpelareUrLag(rum, sid) {
  const p = rum.spelare[sid];
  if (!p || !p.lag) return;
  const l = rum.lag[p.lag];
  if (l) l.medlemmar = l.medlemmar.filter((x) => x !== sid);
  p.lag = null;
}

function laggSpelareILag(rum, sid, lagId) {
  const p = rum.spelare[sid];
  if (!rum.lag[lagId]) {
    rum.lag[lagId] = { id: lagId, medlemmar: [] };
    rum.lagordning.push(lagId);
    rum.poang[lagId] = 0;
    rum.totalSteg[lagId] = 0;
    rum.totalTid[lagId] = 0;
  }
  rum.lag[lagId].medlemmar.push(sid);
  p.lag = lagId;
}

function markeraAnsluten(rum, spelarId, ansluten) {
  const p = rum.spelare[spelarId];
  if (p) p.ansluten = !!ansluten;
}

function markeraLarare(rum, ansluten) {
  rum.lararAnsluten = !!ansluten;
}

/* ---------- Validering av inkommande meddelanden ---------- */

const ROLLER_LARARE = ["larare"];
const ROLLER_ELEV = ["elev"];

/* Returnerar {ok:true, msg} med rensade fält eller {ok:false, fel}. */
function validera(aktor, msg) {
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) return fel("ogiltigt", "Ogiltigt meddelande.");
  const t = msg.t;
  if (typeof t !== "string" || t.length > 30) return fel("ogiltigt", "Ogiltigt meddelande.");
  const roll = aktor && aktor.roll;
  const ut = { t };
  switch (t) {
    case "hej": {
      if (roll !== "gast" && roll !== "elev") return fel("ej_behorig", "Åtgärden är inte tillåten.");
      if (msg.spelarId !== undefined) {
        if (typeof msg.spelarId !== "string" || !/^[a-z0-9]{6,24}$/.test(msg.spelarId)) return fel("ogiltigt", "Ogiltigt id.");
        ut.spelarId = msg.spelarId;
      }
      if (msg.namn !== undefined) {
        const n = renNamn(msg.namn);
        if (n === null) return fel("ogiltigt_namn", "Skriv ett förnamn eller smeknamn (högst 20 tecken, bara bokstäver och siffror).");
        ut.namn = n;
      }
      return ok({ msg: ut });
    }
    case "valj_lag":
      if (!ROLLER_ELEV.includes(roll)) return fel("ej_behorig", "Åtgärden är inte tillåten.");
      if (typeof msg.lag !== "string" || !avatar(msg.lag)) return fel("ogiltigt", "Okänt lag.");
      ut.lag = msg.lag;
      return ok({ msg: ut });
    case "lamna_lag":
      if (!ROLLER_ELEV.includes(roll)) return fel("ej_behorig", "Åtgärden är inte tillåten.");
      return ok({ msg: ut });
    case "svara": {
      if (!ROLLER_ELEV.includes(roll)) return fel("ej_behorig", "Åtgärden är inte tillåten.");
      const v = heltal(msg.val, 0, 3);
      if (v === null || typeof msg.val !== "number") return fel("ogiltigt", "Ogiltigt svar.");
      ut.val = v;
      return ok({ msg: ut });
    }
    /* ---- lärare ---- */
    case "installningar": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      for (const k of Object.keys(OMFANG)) {
        if (msg[k] !== undefined) {
          const v = heltal(msg[k], OMFANG[k][0], OMFANG[k][1]);
          if (v === null) return fel("ogiltigt", "Värdet för " + k + " är utanför tillåtet intervall.");
          ut[k] = v;
        }
      }
      for (const k of ["auto", "visaAlternativ", "slumpLage"]) {
        if (msg[k] !== undefined) {
          if (typeof msg[k] !== "boolean") return fel("ogiltigt", "Ogiltigt värde.");
          ut[k] = msg[k];
        }
      }
      return ok({ msg: ut });
    }
    case "starta_match": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      const nr = heltal(msg.nr, 0, 20);
      const am = heltal(msg.antalMatcher, 1, 20);
      const ao = heltal(msg.antalOrdinarie, 1, 40);
      const at = heltal(msg.antalTotal, 1, 40);
      const namn = renText(msg.namn, GRANSER.matchNamnMax);
      if (nr === null || am === null || ao === null || at === null || namn === null || ao > at)
        return fel("ogiltigt", "Ogiltiga matchuppgifter.");
      Object.assign(ut, { nr, antalMatcher: am, antalOrdinarie: ao, antalTotal: at, namn });
      return ok({ msg: ut });
    }
    case "nasta_fraga": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      const text = renText(msg.fraga, GRANSER.fragaTextMax);
      if (text === null) return fel("ogiltigt", "Frågetexten saknas eller är för lång.");
      if (!Array.isArray(msg.alternativ) || msg.alternativ.length !== 4) return fel("ogiltigt", "Det ska vara fyra alternativ.");
      const alt = msg.alternativ.map((a) => renText(a, GRANSER.alternativMax));
      if (alt.some((a) => a === null)) return fel("ogiltigt", "Ett alternativ saknas eller är för långt.");
      const ratt = heltal(msg.ratt, 0, 3);
      if (ratt === null) return fel("ogiltigt", "Rätt svar ska vara 0–3.");
      const forklaring = renText(msg.forklaring === undefined ? "" : msg.forklaring, GRANSER.forklaringMax, true);
      const kalla = renText(msg.kalla === undefined ? "" : msg.kalla, GRANSER.kallaMax, true);
      if (forklaring === null || kalla === null) return fel("ogiltigt", "Förklaring eller källa är ogiltig.");
      Object.assign(ut, { fraga: text, alternativ: alt, ratt, forklaring, kalla });
      return ok({ msg: ut });
    }
    case "visa_svar":
    case "pausa":
    case "fortsatt":
    case "till_pall":
    case "slutfor_match":
    case "avbryt_match":
    case "nasta_match":
    case "ny_omgang":
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      return ok({ msg: ut });
    case "flytta_spelare": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      if (typeof msg.spelarId !== "string" || !/^[a-z0-9]{6,24}$/.test(msg.spelarId)) return fel("ogiltigt", "Ogiltigt id.");
      ut.spelarId = msg.spelarId;
      if (msg.lag === null) ut.lag = null;
      else if (typeof msg.lag === "string" && avatar(msg.lag)) ut.lag = msg.lag;
      else return fel("ogiltigt", "Okänt lag.");
      return ok({ msg: ut });
    }
    case "ta_bort_spelare": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      if (typeof msg.spelarId !== "string" || !/^[a-z0-9]{6,24}$/.test(msg.spelarId)) return fel("ogiltigt", "Ogiltigt id.");
      ut.spelarId = msg.spelarId;
      return ok({ msg: ut });
    }
    case "ta_bort_lag": {
      if (!ROLLER_LARARE.includes(roll)) return fel("ej_behorig", "Bara läraren får göra det här.");
      if (typeof msg.lag !== "string" || !avatar(msg.lag)) return fel("ogiltigt", "Okänt lag.");
      ut.lag = msg.lag;
      return ok({ msg: ut });
    }
    default:
      return fel("okand_typ", "Okänd åtgärd.");
  }
}

/* ---------- Tidsstyrning ---------- */

/* Nästa tidpunkt då motorn själv behöver agera (frågans slut), annars null. */
function nastaTidpunkt(rum) {
  const m = rum.match;
  if (m && m.steg === "fraga" && m.fraga && !m.pausad) return m.fraga.slut;
  return null;
}

/* Stänger frågan om tiden gått ut. Returnerar true om något ändrades. */
function tick(rum, now) {
  const m = rum.match;
  if (m && m.steg === "fraga" && !m.pausad && m.fraga && now >= m.fraga.slut) {
    avslutaFraga(rum, now);
    return true;
  }
  return false;
}

/* ---------- Huvudingång ---------- */

/* aktor: {roll:'larare'} | {roll:'elev', spelarId} | {roll:'gast'}
   Muterar `rum`. Returnerar {ok:true,...} eller {ok:false, fel, text}. */
function hantera(rum, aktor, msg, now) {
  tick(rum, now);
  const v = validera(aktor, msg);
  if (!v.ok) return v;
  const m = v.msg;
  rum.senast = now;
  const p = aktor.roll === "elev" ? rum.spelare[aktor.spelarId] : null;
  if (aktor.roll === "elev" && !p && m.t !== "hej") return fel("okand_spelare", "Du är inte med i rummet. Skriv ditt namn för att gå med.");
  switch (m.t) {
    case "hej":
      return hej(rum, m, now);
    case "valj_lag":
      return valjLag(rum, p, m);
    case "lamna_lag":
      if (rum.fas !== "lobby") return fel("lagbyte_last", "Man kan bara lämna laget i lobbyn.");
      lasSpelareUrLag(rum, p.id);
      taBortTommaLag(rum);
      return ok();
    case "svara":
      return svara(rum, p, m, now);
    case "installningar":
      return installningar(rum, m);
    case "starta_match":
      return startaMatch(rum, m, now);
    case "nasta_fraga":
      return nastaFraga(rum, m, now);
    case "visa_svar":
      if (!rum.match || rum.match.steg !== "fraga") return fel("ingen_fraga", "Ingen fråga pågår.");
      avslutaFraga(rum, now);
      return ok();
    case "pausa":
      return pausa(rum, now);
    case "fortsatt":
      return fortsatt(rum, now);
    case "till_pall":
      return tillPall(rum);
    case "slutfor_match":
      return slutforMatch(rum);
    case "avbryt_match":
      if (!rum.match || rum.fas !== "match" || rum.match.steg === "pall") return fel("ingen_match", "Ingen match pågår.");
      rum.match = null;
      rum.fas = "lobby";
      return ok();
    case "nasta_match":
      return nastaMatch(rum);
    case "ny_omgang":
      return nyOmgang(rum);
    case "flytta_spelare":
      return flyttaSpelare(rum, m);
    case "ta_bort_spelare": {
      if (!rum.spelare[m.spelarId]) return fel("okand_spelare", "Spelaren finns inte.");
      lasSpelareUrLag(rum, m.spelarId);
      delete rum.spelare[m.spelarId];
      taBortTommaLag(rum);
      return ok();
    }
    case "ta_bort_lag":
      if (rum.fas !== "lobby") return fel("bara_lobby", "Lag kan bara tas bort i lobbyn.");
      if (!rum.lag[m.lag]) return fel("okant_lag", "Laget finns inte.");
      for (const sid of rum.lag[m.lag].medlemmar.slice()) lasSpelareUrLag(rum, sid);
      taBortTommaLag(rum);
      return ok();
    default:
      return fel("okand_typ", "Okänd åtgärd.");
  }
}

function hej(rum, m, now) {
  if (m.spelarId && rum.spelare[m.spelarId]) {
    rum.spelare[m.spelarId].ansluten = true;
    return ok({ spelarId: m.spelarId, aterAnsluten: true });
  }
  if (!m.namn) return fel("ogiltigt_namn", "Skriv ett förnamn eller smeknamn.");
  if (antalSpelare(rum) >= GRANSER.maxSpelare) return fel("rum_fullt", "Rummet är fullt (högst " + GRANSER.maxSpelare + " spelare).");
  let id;
  do id = "p" + slumpText(11);
  while (rum.spelare[id]);
  rum.spelare[id] = { id, namn: m.namn, lag: null, ansluten: true, nr: rum.nastaSpelare++ };
  return ok({ spelarId: id, ny: true });
}

function valjLag(rum, p, m) {
  if (rum.fas === "slut") return fel("spelet_slut", "Spelet är slut.");
  if (p.lag === m.lag) return ok();
  if (p.lag && rum.fas !== "lobby") return fel("lagbyte_last", "Man kan inte byta lag under en match.");
  const finns = !!rum.lag[m.lag];
  if (!finns) {
    if (rum.fas !== "lobby") return fel("nytt_lag_last", "Nya lag kan bara startas i lobbyn.");
    if (rum.lagordning.length >= Math.min(GRANSER.maxLag, AVATARER.length)) return fel("for_manga_lag", "Det finns inga fler lag att starta.");
  }
  lasSpelareUrLag(rum, p.id);
  laggSpelareILag(rum, p.id, m.lag);
  taBortTommaLag(rum);
  return ok({ lag: m.lag, nytt: !finns });
}

function svara(rum, p, m, now) {
  const mt = rum.match;
  if (!p.lag) return fel("inget_lag", "Du måste ha ett lag för att svara.");
  if (!mt || mt.steg !== "fraga" || !mt.fraga) return fel("ingen_fraga", "Det finns ingen öppen fråga.");
  if (mt.pausad) return fel("pausad", "Spelet är pausat.");
  if (now >= mt.fraga.slut) return fel("for_sent", "Tiden är slut.");
  if (mt.svar[p.id]) return fel("redan_svarat", "Du har redan svarat.");
  mt.svarSeq += 1;
  mt.svar[p.id] = { val: m.val, t: now, tidMs: Math.max(0, now - mt.fraga.start), ordning: mt.svarSeq };
  // Alla aktiva lag är klara (alla nuvarande medlemmar har svarat) → stäng direkt.
  const akt = aktivaLag(rum);
  if (akt.length > 0 && akt.every((id) => lagArKlart(rum, mt, id))) avslutaFraga(rum, now);
  return ok({ lag: p.lag });
}

function installningar(rum, m) {
  for (const k of Object.keys(m)) {
    if (k === "t") continue;
    if (k === "banlangd" && rum.fas !== "lobby") return fel("bara_lobby", "Banans längd kan bara ändras i lobbyn.");
    if (k === "slumpLage" && rum.fas !== "lobby") return fel("bara_lobby", "Slumpa lag kan bara användas i lobbyn.");
  }
  for (const k of Object.keys(m)) if (k !== "t") rum.inst[k] = m[k];
  return ok();
}

function startaMatch(rum, m, now) {
  if (rum.fas !== "lobby") return fel("fel_fas", "En match kan bara startas från lobbyn.");
  if (m.nr !== rum.matchNr) return fel("fel_matchnr", "Fel matchnummer (väntade " + (rum.matchNr + 1) + ").");
  const lagMedMedlem = rum.lagordning.filter((id) => rum.lag[id].medlemmar.length > 0);
  if (lagMedMedlem.length < 2) return fel("for_fa_lag", "Minst två lag behövs för att starta en match.");
  taBortTommaLag(rum);
  rum.antalMatcher = m.antalMatcher;
  const pos = {};
  const tre = {};
  const tid = {};
  for (const id of rum.lagordning) {
    pos[id] = 0;
    tre[id] = 0;
    tid[id] = 0;
  }
  rum.fas = "match";
  rum.match = {
    nr: m.nr,
    namn: m.namn,
    banlangd: rum.inst.banlangd,
    antalOrdinarie: m.antalOrdinarie,
    antalTotal: m.antalTotal,
    steg: "vantar",
    fragaNr: 0,
    fraga: null,
    svar: {},
    svarSeq: 0,
    pausad: false,
    pausTid: 0,
    pos,
    tre,
    tid,
    vinnare: null,
    vinnarTyp: null,
    klar: false,
    resultat: null,
    pall: null,
    startad: now,
  };
  return ok();
}

function nastaFraga(rum, m, now) {
  const mt = rum.match;
  if (!mt || rum.fas !== "match") return fel("ingen_match", "Ingen match pågår.");
  if (mt.steg !== "vantar" && mt.steg !== "avslojad") return fel("fel_steg", "Man kan inte starta en fråga just nu.");
  if (mt.klar) return fel("match_klar", "Matchen är avgjord – visa prispallen.");
  if (mt.fragaNr >= mt.antalTotal) return fel("slut_pa_fragor", "Frågorna är slut.");
  const svarstidMs = rum.inst.svarstid_s * 1000;
  mt.fraga = {
    nr: mt.fragaNr + 1,
    text: m.fraga,
    alternativ: m.alternativ,
    ratt: m.ratt,
    forklaring: m.forklaring,
    kalla: m.kalla,
    start: now,
    slut: now + svarstidMs,
    svarstidMs,
  };
  mt.svar = {};
  mt.svarSeq = 0;
  mt.pausad = false;
  mt.resultat = null;
  mt.steg = "fraga";
  return ok({ fragaNr: mt.fraga.nr });
}

function pausa(rum, now) {
  const mt = rum.match;
  if (!mt || mt.steg !== "fraga") return fel("ingen_fraga", "Ingen fråga pågår.");
  if (mt.pausad) return ok();
  mt.pausad = true;
  mt.pausTid = now;
  return ok();
}

function fortsatt(rum, now) {
  const mt = rum.match;
  if (!mt || mt.steg !== "fraga" || !mt.pausad) return fel("inte_pausad", "Spelet är inte pausat.");
  const d = now - mt.pausTid;
  mt.fraga.start += d;
  mt.fraga.slut += d;
  mt.pausad = false;
  return ok();
}

/* Sätter poäng och förflyttningar. Anropas när frågan stängs.
   Ett lag är "klart och rätt" när ALLA dess nuvarande medlemmar har svarat
   och alla svarade rätt. Lagets klar-tid = tidpunkten för dess SISTA
   medlems svar. Rangordning bland de klara lagen: klar-tid, sedan
   (vid exakt samma millisekund) det globala svarsnumret för det
   avgörande svaret – se filens huvudkommentar. */
function avslutaFraga(rum, now) {
  const mt = rum.match;
  const f = mt.fraga;
  const L = mt.banlangd;
  const res = { fragaNr: f.nr, ratt: f.ratt, forklaring: f.forklaring, kalla: f.kalla, lag: {}, rorelser: [], malNadd: null };
  const klaraLag = []; // {id, klarTid, klarOrdning} – alla medlemmar svarade, alla rätt
  for (const id of rum.lagordning) {
    const mm = medlemmarAvLag(rum, id);
    const svarslista = mm.map((sid) => mt.svar[sid]).filter(Boolean);
    const antalSvarat = svarslista.length;
    const alltSvarat = mm.length > 0 && antalSvarat === mm.length;
    const antalRatt = svarslista.filter((s) => s.val === f.ratt).length;
    const allaRatt = alltSvarat && antalRatt === mm.length;
    let klarTid = null;
    let klarOrdning = null;
    if (alltSvarat) {
      for (const s of svarslista) {
        if (klarTid === null || s.t > klarTid || (s.t === klarTid && s.ordning > klarOrdning)) {
          klarTid = s.t;
          klarOrdning = s.ordning;
        }
      }
    }
    res.lag[id] = {
      antalMedlemmar: mm.length,
      antalSvarat,
      antalRatt,
      alltSvarat,
      allaRatt,
      rang: null,
      steg: 0,
      fran: mt.pos[id],
      till: mt.pos[id],
    };
    if (allaRatt) klaraLag.push({ id, klarTid, klarOrdning });
  }
  // Snabbhetsordning bland de klara lagen: klar-tid, därefter det globala
  // svarsnumret för det avgörande (sista) svaret (deterministisk tie-break).
  klaraLag.sort((a, b) => a.klarTid - b.klarTid || a.klarOrdning - b.klarOrdning);
  klaraLag.forEach((x, i) => {
    res.lag[x.id].rang = i + 1;
    res.lag[x.id].steg = i < STEG_PER_RANG.length ? STEG_PER_RANG[i] : 1;
  });
  const ordnade = klaraLag.map((x) => x.id);
  const grupper = [];
  if (ordnade[0]) grupper.push({ grupp: 1, steg: 3, gnagg: "stor", hovar: false, lag: [ordnade[0]] });
  if (ordnade[1]) grupper.push({ grupp: 2, steg: 2, gnagg: "liten", hovar: false, lag: [ordnade[1]] });
  if (ordnade.length > 2) grupper.push({ grupp: 3, steg: 1, gnagg: null, hovar: true, lag: ordnade.slice(2) });
  for (const g of grupper) {
    for (const id of g.lag) {
      const r = res.lag[id];
      r.fran = mt.pos[id];
      r.till = Math.min(L, r.fran + r.steg);
      mt.pos[id] = r.till;
      if (r.fran < L && r.till >= L && !mt.vinnare) {
        mt.vinnare = id;
        mt.vinnarTyp = "mal";
        res.malNadd = id;
      }
    }
    res.rorelser.push({ grupp: g.grupp, steg: g.steg, gnagg: g.gnagg, hovar: g.hovar, lag: g.lag.slice() });
  }
  if (ordnade[0]) mt.tre[ordnade[0]] += 1;
  for (const id of rum.lagordning) {
    const klar = klaraLag.find((x) => x.id === id);
    // Klara lag: tiden till lagets sista svar. Övriga (fel eller ofullständigt): full straff-tid, som förut.
    mt.tid[id] += klar ? Math.max(0, klar.klarTid - f.start) : f.svarstidMs;
  }
  mt.fragaNr += 1;
  mt.resultat = res;
  mt.steg = "avslojad";
  mt.pausad = false;
  if (mt.vinnare) {
    mt.klar = true;
  } else if (mt.fragaNr >= mt.antalTotal) {
    mt.klar = true;
    mt.vinnare = rangordnaMatch(rum)[0];
    mt.vinnarTyp = "ledning";
  }
}

/* Rangordning i en match: vinnare först, därefter steg, flest 3-poängare,
   lägst sammanlagd svarstid, sist lagets ordning (skapandeordning). */
function rangordnaMatch(rum) {
  const mt = rum.match;
  const ix = (id) => rum.lagordning.indexOf(id);
  return rum.lagordning.slice().sort((a, b) => {
    if (mt.vinnare) {
      if (a === mt.vinnare && b !== mt.vinnare) return -1;
      if (b === mt.vinnare && a !== mt.vinnare) return 1;
    }
    return mt.pos[b] - mt.pos[a] || mt.tre[b] - mt.tre[a] || mt.tid[a] - mt.tid[b] || ix(a) - ix(b);
  });
}

function byggPall(rum) {
  const mt = rum.match;
  const rang = rangordnaMatch(rum);
  if (!mt.vinnare) {
    mt.vinnare = rang[0];
    mt.vinnarTyp = "ledning";
  }
  mt.pall = rang.map((id, i) => ({
    lag: id,
    plats: i + 1,
    steg: mt.pos[id],
    tre: mt.tre[id],
    tidMs: mt.tid[id],
    poang: MATCHPOANG[i] || 0,
  }));
  for (const rad of mt.pall) {
    rum.poang[rad.lag] = (rum.poang[rad.lag] || 0) + rad.poang;
    rum.totalSteg[rad.lag] = (rum.totalSteg[rad.lag] || 0) + rad.steg;
    rum.totalTid[rad.lag] = (rum.totalTid[rad.lag] || 0) + rad.tidMs;
  }
  rum.historik.push({ nr: mt.nr, namn: mt.namn, vinnare: mt.vinnare, vinnarTyp: mt.vinnarTyp, pall: mt.pall.map((r) => Object.assign({}, r)) });
  mt.steg = "pall";
}

function tillPall(rum) {
  const mt = rum.match;
  if (!mt || mt.steg !== "avslojad" || !mt.klar) return fel("inte_klar", "Matchen är inte avgjord ännu.");
  byggPall(rum);
  return ok();
}

function slutforMatch(rum) {
  const mt = rum.match;
  if (!mt || rum.fas !== "match" || mt.steg === "pall") return fel("ingen_match", "Ingen match pågår.");
  if (mt.steg === "fraga") {
    mt.fraga = null;
    mt.svar = {};
    mt.pausad = false;
  }
  mt.klar = true;
  byggPall(rum);
  return ok();
}

function rangordnaSlut(rum) {
  const ix = (id) => rum.lagordning.indexOf(id);
  return rum.lagordning
    .slice()
    .sort((a, b) => (rum.poang[b] || 0) - (rum.poang[a] || 0) || (rum.totalSteg[b] || 0) - (rum.totalSteg[a] || 0) || (rum.totalTid[a] || 0) - (rum.totalTid[b] || 0) || ix(a) - ix(b));
}

function nastaMatch(rum) {
  const mt = rum.match;
  if (!mt || mt.steg !== "pall") return fel("ingen_pall", "Prispallen visas inte.");
  rum.matchNr += 1;
  rum.match = null;
  if (rum.matchNr >= rum.antalMatcher) {
    rum.fas = "slut";
    rum.slutpall = rangordnaSlut(rum).map((id, i) => ({
      lag: id,
      plats: i + 1,
      poang: rum.poang[id] || 0,
      steg: rum.totalSteg[id] || 0,
      tidMs: rum.totalTid[id] || 0,
    }));
  } else {
    rum.fas = "lobby";
  }
  return ok();
}

function nyOmgang(rum) {
  rum.fas = "lobby";
  rum.matchNr = 0;
  rum.match = null;
  rum.historik = [];
  rum.slutpall = null;
  for (const id of rum.lagordning) {
    rum.poang[id] = 0;
    rum.totalSteg[id] = 0;
    rum.totalTid[id] = 0;
  }
  return ok();
}

function flyttaSpelare(rum, m) {
  if (rum.fas !== "lobby") return fel("bara_lobby", "Spelare kan bara flyttas i lobbyn.");
  const p = rum.spelare[m.spelarId];
  if (!p) return fel("okand_spelare", "Spelaren finns inte.");
  if (m.lag === null) {
    lasSpelareUrLag(rum, p.id);
    taBortTommaLag(rum);
    return ok();
  }
  if (p.lag === m.lag) return ok();
  if (!rum.lag[m.lag] && rum.lagordning.length >= Math.min(GRANSER.maxLag, AVATARER.length)) return fel("for_manga_lag", "Det finns inga fler lag att starta.");
  lasSpelareUrLag(rum, p.id);
  laggSpelareILag(rum, p.id, m.lag);
  taBortTommaLag(rum);
  return ok();
}

/* ---------- Vyer (vad respektive roll får se) ---------- */

/* Bygger en JSON-vänlig vy. Rätt svar (`ratt`) och förklaring lämnas ALDRIG ut
   före avslöjandet – varken till elever eller till läraren. */
function vyFor(rum, aktor, now) {
  const roll = aktor.roll;
  const arLarare = roll === "larare";
  const p = roll === "elev" ? rum.spelare[aktor.spelarId] : null;
  const mt = rum.match;
  const vy = {
    v: MOTORVERSION,
    nu: now,
    kod: rum.kod,
    roll: p || arLarare ? roll : "gast",
    fas: rum.fas,
    matchNr: rum.matchNr,
    antalMatcher: rum.antalMatcher,
    inst: Object.assign({}, rum.inst),
    antalSpelare: antalSpelare(rum),
    jag: p ? { namn: p.namn, lag: p.lag } : null,
    lararAnsluten: !!rum.lararAnsluten,
    historik: rum.historik,
    slutpall: rum.slutpall,
    maxLag: Math.min(GRANSER.maxLag, AVATARER.length),
  };
  vy.lag = rum.lagordning.map((id) => {
    const l = rum.lag[id];
    // "svarat" (har svarat på den öppna/senast avslöjade frågan – ALDRIG vad):
    // läraren ser det för alla lag, eleven bara för sitt eget lag (så att
    // lagkompisars svarsval aldrig avslöjas, bara om de har svarat).
    const visaSvarat = mt && mt.fraga && (arLarare || (p && p.lag === id));
    return {
      id,
      namn: avatarNamn(id),
      pos: mt ? mt.pos[id] : 0,
      poang: rum.poang[id] || 0,
      totalSteg: rum.totalSteg[id] || 0,
      medlemmar: l.medlemmar.map((sid) => {
        const s = rum.spelare[sid];
        const bas = arLarare ? { id: sid, namn: s.namn, ansluten: s.ansluten } : { namn: s.namn, ansluten: s.ansluten, jag: sid === aktor.spelarId };
        if (visaSvarat) bas.svarat = !!mt.svar[sid];
        return bas;
      }),
    };
  });
  const utanLag = Object.values(rum.spelare).filter((s) => !s.lag);
  if (arLarare) vy.utanLag = utanLag.map((s) => ({ id: s.id, namn: s.namn, ansluten: s.ansluten }));
  else vy.antalUtanLag = utanLag.length;

  if (mt) {
    const mv = {
      nr: mt.nr,
      namn: mt.namn,
      banlangd: mt.banlangd,
      antalOrdinarie: mt.antalOrdinarie,
      antalTotal: mt.antalTotal,
      steg: mt.steg,
      fragaNr: mt.fragaNr,
      reserv: mt.fragaNr >= mt.antalOrdinarie,
      klar: mt.klar,
      vinnare: mt.klar || mt.steg === "pall" ? mt.vinnare : null,
      vinnarTyp: mt.klar || mt.steg === "pall" ? mt.vinnarTyp : null,
      pausad: mt.pausad,
      pos: Object.assign({}, mt.pos),
      pall: mt.pall,
    };
    if (mt.fraga) {
      const avslojad = mt.steg !== "fraga";
      mv.fraga = {
        nr: mt.fraga.nr,
        text: mt.fraga.text,
        alternativ: mt.fraga.alternativ,
        start: mt.fraga.start,
        slut: mt.fraga.slut,
        svarstidMs: mt.fraga.svarstidMs,
      };
      if (avslojad) {
        mv.fraga.ratt = mt.fraga.ratt;
        mv.fraga.forklaring = mt.fraga.forklaring;
        mv.fraga.kalla = mt.fraga.kalla;
      }
    }
    if (mt.fraga) {
      // Lagstatus (bara ANTAL, aldrig vad eller om rätt, förrän avslöjat) – säkert
      // att visa för alla lag, till både lärare och elever, under och efter frågan.
      mv.lagStatus = rum.lagordning.map((id) => {
        const mm = medlemmarAvLag(rum, id);
        const antalSvarat = mm.filter((sid) => mt.svar[sid]).length;
        return { lag: id, antalMedlemmar: mm.length, antalSvarat, klart: mm.length > 0 && antalSvarat === mm.length };
      });
      // Mitt EGET svar (bara mitt, aldrig lagkompisarnas) – finns kvar under avslöjandet också.
      if (p && mt.svar[p.id]) mv.mittSvar = { val: mt.svar[p.id].val };
    }
    if (mt.steg === "fraga") {
      const akt = aktivaLag(rum);
      mv.antalLag = rum.lagordning.length;
      mv.antalAktiva = akt.length;
      mv.antalSvarat = mv.lagStatus.filter((x) => x.klart).length;
    }
    if (mt.resultat) {
      const r = mt.resultat;
      if (arLarare) mv.resultat = r;
      else {
        mv.resultat = { fragaNr: r.fragaNr, ratt: r.ratt, forklaring: r.forklaring, kalla: r.kalla, rorelser: r.rorelser, malNadd: r.malNadd, lag: {} };
        if (p && p.lag && r.lag[p.lag]) mv.resultat.lag[p.lag] = r.lag[p.lag];
        mv.resultat.antalRatta = Object.values(r.lag).filter((x) => x.allaRatt).length;
      }
    }
    vy.match = mv;
  } else {
    vy.match = null;
  }
  return vy;
}

/* ---------- Enkel hastighetsbegränsning (används av båda värdarna) ---------- */

function nyTakbegransare(max, fonsterMs) {
  return { max: max || 30, fonsterMs: fonsterMs || 10000, tider: [] };
}

/* true = släpp igenom. */
function tillat(tb, now) {
  const grans = now - tb.fonsterMs;
  while (tb.tider.length && tb.tider[0] < grans) tb.tider.shift();
  if (tb.tider.length >= tb.max) return false;
  tb.tider.push(now);
  return true;
}

/* ---------------- worker-del.js (router + Durable Object) ---------------- */
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
