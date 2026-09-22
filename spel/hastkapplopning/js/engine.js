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

export const MOTORVERSION = 2;

/* Djuren som lagen väljer mellan. id = ASCII (används i sprite-symbolen
   #hk-<id> i img/avatarer.svg). Ordningen = visningsordning. */
export const AVATARER = [
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

export const GRANSER = {
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

export const STANDARD = {
  svarstid_s: 20,
  banlangd: 16,
  autoFordrojning_s: 6,
  auto: false,
  visaAlternativ: false,
  slumpLage: false, // lobbyläget "Slumpa lag": elever skriver bara namn, ingen avatarväljning
};

export const OMFANG = {
  svarstid_s: [10, 60],
  banlangd: [10, 30],
  autoFordrojning_s: [2, 20],
};

export const MATCHPOANG = [3, 2, 1];
export const STEG_PER_RANG = [3, 2, 1];
export const RUMSKOD_TECKEN = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // utan 0 O 1 I L
export const INAKTIVITET_MS = 8 * 60 * 60 * 1000;

/* ---------- Hjälpare ---------- */

export function slumpText(n, tecken) {
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

export function slumpRumskod() {
  return slumpText(4, RUMSKOD_TECKEN);
}

export function arGiltigRumskod(kod) {
  return typeof kod === "string" && /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/.test(kod);
}

function avatar(id) {
  for (const a of AVATARER) if (a.id === id) return a;
  return null;
}

export function avatarNamn(id) {
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
export function renText(s, max, tillatTom) {
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
export function renNamn(s) {
  const t = renText(s, GRANSER.namnMax);
  if (t === null) return null;
  if (!NAMN_RE.test(t)) return null;
  return t;
}

/* ---------- Rum ---------- */

export function nyttRum(kod, lararnyckel, now) {
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

export function antalSpelare(rum) {
  return Object.keys(rum.spelare).length;
}

function lagHarAktiv(rum, lagId) {
  const l = rum.lag[lagId];
  if (!l) return false;
  return l.medlemmar.some((sid) => rum.spelare[sid] && rum.spelare[sid].ansluten);
}

export function aktivaLag(rum) {
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

export function markeraAnsluten(rum, spelarId, ansluten) {
  const p = rum.spelare[spelarId];
  if (p) p.ansluten = !!ansluten;
}

export function markeraLarare(rum, ansluten) {
  rum.lararAnsluten = !!ansluten;
}

/* ---------- Validering av inkommande meddelanden ---------- */

const ROLLER_LARARE = ["larare"];
const ROLLER_ELEV = ["elev"];

/* Returnerar {ok:true, msg} med rensade fält eller {ok:false, fel}. */
export function validera(aktor, msg) {
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
export function nastaTidpunkt(rum) {
  const m = rum.match;
  if (m && m.steg === "fraga" && m.fraga && !m.pausad) return m.fraga.slut;
  return null;
}

/* Stänger frågan om tiden gått ut. Returnerar true om något ändrades. */
export function tick(rum, now) {
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
export function hantera(rum, aktor, msg, now) {
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
export function rangordnaMatch(rum) {
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

export function rangordnaSlut(rum) {
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
export function vyFor(rum, aktor, now) {
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

export function nyTakbegransare(max, fonsterMs) {
  return { max: max || 30, fonsterMs: fonsterMs || 10000, tider: [] };
}

/* true = släpp igenom. */
export function tillat(tb, now) {
  const grans = now - tb.fonsterMs;
  while (tb.tider.length && tb.tider[0] < grans) tb.tider.shift();
  if (tb.tider.length >= tb.max) return false;
  tb.tider.push(now);
  return true;
}
