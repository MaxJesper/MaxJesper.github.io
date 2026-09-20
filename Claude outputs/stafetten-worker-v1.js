/**
 * STAFETTEN – Cloudflare Worker (första utkast)
 *
 * Eget spel, egen worker, egen KV-nyckelrymd (prefix "stafetten:") – rör inte
 * begreppsbingons rum eller data även om de råkar dela samma KV-namespace.
 *
 * Kräver samma sorts KV-bindning som bingo-workern, men bunden till variabeln
 * STAFETTEN_KV (Settings -> Variables -> KV Namespace Bindings, bindningsnamnet
 * måste vara exakt "STAFETTEN_KV" – eller byt namnet nedan om du hellre återanvänder
 * BINGO_KV, det finns inget som kräver separata namespace).
 *
 * ============================== VIKTIGASTE DESIGNVALET ==============================
 * Bingo-workern läser hela rumstillståndet, ändrar det i minnet och skriver tillbaka
 * (hämta-ändra-spara). Det fungerar bra när det bara är EN elev i taget som rapporterar
 * något, men i Stafetten svarar alla lag på samma fråga nästan samtidigt – om två lags
 * klienter båda läser det gemensamma tillståndet innan någon hunnit spara, kan den ena
 * skrivningen tyst skriva över den andra (inte en krasch, men en poängändring som
 * försvinner spårlöst).
 *
 * Lösningen här: varje lags svar skrivs till sin EGEN unika nyckel
 * (stafetten:{kod}:q{fragaId}:svar:{lag}) – två lag kan aldrig krocka med varandra
 * eftersom de aldrig skriver till samma plats. Själva poängräkningen (vem var
 * snabbast, ev. stöld, nya lagtotaler) görs sedan i EN enda "sammanställ"-operation
 * som bara händer en gång per fråga (triggas av läraren eller av att alla lag svarat),
 * och den operationen är därför den enda som någonsin skriver till den delade
 * poängtavlan – ingen samtidighet, ingen krockrisk. sammanstalld-flaggan gör steget
 * säkert att anropa flera gånger av misstag (t.ex. om både "alla har svarat" och
 * lärarens klick skulle trigga det nästan samtidigt).
 *
 * Om exakt samma svarstidpunkt (millisekund) skulle inträffa mellan två lag avgörs
 * den enda riktiga kollisionen med slumpen – lagen får aldrig veta att det var oavgjort.
 * ======================================================================================
 *
 * Endpoints:
 *   POST /rum                              -> {kod}
 *   GET  /rum/:kod                         -> hela rumstillståndet
 *   POST /rum/:kod/gaMed                   -> {lag, namn} elev går med i (eller skapar) ett lag
 *   POST /rum/:kod/startaFraga             -> {fragaId, typ, rattSvar, poangRatt?, stoldBelopp?,
 *                                              stoldBeloppReducerat?} lärare startar en ny fråga.
 *                                              typ: "vanlig" | "stold" | "forstRatt"
 *                                              rattSvar: array med index (även vid enval, då [i])
 *   POST /rum/:kod/svara                   -> {lag, svar:[index,...]} ett lag lämnar sitt svar
 *                                              (skriver till en egen nyckel, se ovan)
 *   GET  /rum/:kod/svarsantal/:fragaId     -> {antal} hur många lag som hunnit svara (för
 *                                              lärarskärmens "X av Y" under svarstiden – räknas
 *                                              via KV:s list(), rör aldrig delat tillstånd)
 *   POST /rum/:kod/sammanstall             -> {fragaId} räknar ut resultatet för frågan (se
 *                                              designvalet ovan). Idempotent.
 *   POST /rum/:kod/stjalBeslut             -> {lag, mal, spara} laget som vann stöldrätten
 *                                              väljer mål, eller sparar poängen till senare
 *   POST /rum/:kod/spenderaSparat          -> {lag, mal} laget slår till med sina sparade
 *                                              stöldpoäng mot ett självvalt lag, när de vill
 *   POST /rum/:kod/visaResultat            -> lärarens klick: flaggar frågan som avslöjad för
 *                                              hela klassen (projektorklienten ska själv låta
 *                                              bli att rita poängtavlan förrän denna är satt –
 *                                              samma "klientstyrda" princip som redan används
 *                                              för brickval i begreppsbingo)
 *
 * OBS, medvetna första-utkast-tolkningar att stämma av med Jesper:
 *  - Stöldfråga ger fortfarande vanlig poäng (poangRatt) till ALLA lag som svarar rätt,
 *    utöver att det snabbaste laget även får stjäla. ("Först rätt tar täten" är däremot
 *    exklusiv – bara det snabbaste laget får något alls, enligt regeldokumentet.)
 *  - "Spara stöldpoäng" läggs i en fri, alltid-tillgänglig pott (sparatStold) som laget
 *    kan spendera mot valfritt lag när helst de vill via /spenderaSparat – inte bara nästa
 *    gång de råkar vinna en ny stöldrätt.
 */

const RUM_TTL_SEKUNDER = 4 * 60 * 60; // 4 timmar, som bingo-workern
const KV = "STAFETTEN_KV"; // byt till "BINGO_KV" i env-anropen nedan om ni vill dela namespace

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
function json(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...corsHeaders() } });
}
function nyKod() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
async function lasBody(request) {
  try { return await request.json(); } catch { return null; }
}

function nyttRumState() {
  return {
    skapad: Date.now(),
    installningar: { poangRatt: 10, stoldBelopp: 40, stoldBeloppReducerat: 10 },
    lag: {},          // lagnamn -> {poang, sparatStold, senasteResultat}
    aktuellFraga: null,
    historik: [],      // avslutade frågor, kortfattat (för ev. felsökning/genomgång)
  };
}
function nyttLag() {
  return { poang: 0, sparatStold: 0, senasteResultat: null };
}

async function hamtaRum(env, kod) {
  const rad = await env[KV].get(`stafetten:${kod}`);
  return rad ? JSON.parse(rad) : null;
}
async function sparaRum(env, kod, state) {
  await env[KV].put(`stafetten:${kod}`, JSON.stringify(state), { expirationTtl: RUM_TTL_SEKUNDER });
}
function svarsNyckel(kod, fragaId, lag) {
  return `stafetten:${kod}:q${fragaId}:svar:${lag}`;
}

// Är 'lag' ensam eller delad etta just nu (utifrån state.lag som det ser ut NÄR anropet görs)?
function arLedande(state, lag) {
  const mitt = state.lag[lag] ? state.lag[lag].poang : 0;
  return Object.values(state.lag).every(l => l.poang <= mitt);
}
// Jämför två svarsuppsättningar (arrayer av index) utan hänsyn till ordning.
function sammaSvar(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const sa = [...a].sort(), sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

    const url = new URL(request.url);
    const delar = url.pathname.split("/").filter(Boolean); // ["rum","1234","svara"] osv.
    if (delar[0] !== "rum") return json(404, { fel: "hittades inte" });
    const kod = delar[1];

    // POST /rum – nytt rum
    if (delar.length === 1 && request.method === "POST") {
      let kodNy, forsok = 0;
      do { kodNy = nyKod(); forsok++; } while ((await env[KV].get(`stafetten:${kodNy}`)) !== null && forsok < 20);
      await sparaRum(env, kodNy, nyttRumState());
      return json(200, { kod: kodNy });
    }

    if (!kod) return json(404, { fel: "hittades inte" });

    // GET /rum/:kod – hela tillståndet
    if (delar.length === 2 && request.method === "GET") {
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });
      return json(200, state);
    }

    // POST /rum/:kod/gaMed – gå med i (eller skapa) ett lag
    if (delar.length === 3 && delar[2] === "gaMed" && request.method === "POST") {
      const body = await lasBody(request);
      if (!body || typeof body.lag !== "string" || !body.lag.trim()) return json(400, { fel: "ogiltigt lagnamn" });
      const lag = body.lag.trim().slice(0, 24);
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });
      if (!state.lag[lag]) {
        state.lag[lag] = nyttLag();
        await sparaRum(env, kod, state);
      }
      return json(200, state);
    }

    // POST /rum/:kod/startaFraga – läraren startar en ny fråga
    if (delar.length === 3 && delar[2] === "startaFraga" && request.method === "POST") {
      const body = await lasBody(request);
      if (!body || body.fragaId === undefined || !Array.isArray(body.rattSvar) ||
          !["vanlig", "stold", "forstRatt"].includes(body.typ)) {
        return json(400, { fel: "ogiltig fråga" });
      }
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });
      if (body.poangRatt !== undefined) state.installningar.poangRatt = Number(body.poangRatt);
      if (body.stoldBelopp !== undefined) state.installningar.stoldBelopp = Number(body.stoldBelopp);
      if (body.stoldBeloppReducerat !== undefined) state.installningar.stoldBeloppReducerat = Number(body.stoldBeloppReducerat);
      state.aktuellFraga = {
        id: body.fragaId,
        typ: body.typ,
        rattSvar: body.rattSvar,
        startad: Date.now(),
        sammanstalld: false,
        avslojadForKlassen: false,
        stoldPending: null,   // {lag} när typ==="stold" och ett lag väntar på att välja mål
        resultat: null,       // sätts av /sammanstall – offentlig sammanfattning
      };
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/svara – ett lag lämnar sitt svar (egen nyckel, krockar aldrig)
    if (delar.length === 3 && delar[2] === "svara" && request.method === "POST") {
      const body = await lasBody(request);
      if (!body || typeof body.lag !== "string" || !Array.isArray(body.svar)) return json(400, { fel: "ogiltigt svar" });
      const state = await hamtaRum(env, kod);
      if (!state || !state.aktuellFraga) return json(404, { fel: "ingen aktiv fråga" });
      if (!state.lag[body.svar === undefined ? "" : body.lag]) return json(400, { fel: "okänt lag" });
      const fragaId = state.aktuellFraga.id;
      const nyckel = svarsNyckel(kod, fragaId, body.lag);
      // Skriver bara till lagets EGEN nyckel – kan aldrig krocka med ett annat lags svar.
      await env[KV].put(nyckel, JSON.stringify({ svar: body.svar, tid: Date.now() }), { expirationTtl: RUM_TTL_SEKUNDER });
      return json(200, { ok: true });
    }

    // GET /rum/:kod/svarsantal/:fragaId – hur många lag har svarat hittills (för lärarskärmen)
    if (delar.length === 4 && delar[2] === "svarsantal" && request.method === "GET") {
      const fragaId = delar[3];
      const lista = await env[KV].list({ prefix: `stafetten:${kod}:q${fragaId}:svar:` });
      return json(200, { antal: lista.keys.length });
    }

    // POST /rum/:kod/sammanstall – räkna ut resultatet för frågan (idempotent, EN skrivning)
    if (delar.length === 3 && delar[2] === "sammanstall" && request.method === "POST") {
      const body = await lasBody(request);
      const state = await hamtaRum(env, kod);
      if (!state || !state.aktuellFraga) return json(404, { fel: "ingen aktiv fråga" });
      if (body && body.fragaId !== undefined && body.fragaId !== state.aktuellFraga.id) {
        return json(409, { fel: "fel fråga, redan nästa" });
      }
      if (state.aktuellFraga.sammanstalld) return json(200, state); // redan gjort – no-op

      const fraga = state.aktuellFraga;
      const lista = await env[KV].list({ prefix: `stafetten:${kod}:q${fraga.id}:svar:` });
      const svar = [];
      for (const k of lista.keys) {
        const rad = await env[KV].get(k.name);
        if (!rad) continue;
        const lag = k.name.split(":svar:")[1];
        const { svar: svarLag, tid } = JSON.parse(rad);
        const ratt = sammaSvar(svarLag, fraga.rattSvar);
        svar.push({ lag, tid, ratt, slump: Math.random() }); // slump = tie-break, se nedan
      }
      // Snabbast rätt-svar först. Exakt samma "tid" avgörs av slumpen (osynligt för lagen).
      const rattaSorted = svar.filter(s => s.ratt).sort((a, b) => (a.tid - b.tid) || (a.slump - b.slump));

      const resultat = { typ: fraga.typ, rattaLag: rattaSorted.map(s => s.lag), poangandringar: {} };
      const addPoang = (lag, delta) => {
        state.lag[lag].poang += delta;
        resultat.poangandringar[lag] = (resultat.poangandringar[lag] || 0) + delta;
      };

      if (fraga.typ === "vanlig") {
        rattaSorted.forEach(s => addPoang(s.lag, state.installningar.poangRatt));
      } else if (fraga.typ === "stold") {
        // Vanlig poäng till alla som svarade rätt (se kommentar högst upp om tolkningen) …
        rattaSorted.forEach(s => addPoang(s.lag, state.installningar.poangRatt));
        // … plus stöldrätt till det snabbaste laget, som väntar på deras beslut.
        if (rattaSorted.length > 0) {
          fraga.stoldPending = { lag: rattaSorted[0].lag };
        }
      } else if (fraga.typ === "forstRatt") {
        if (rattaSorted.length > 0) {
          const vinnare = rattaSorted[0].lag;
          if (arLedande(state, vinnare)) {
            addPoang(vinnare, state.installningar.stoldBeloppReducerat);
          } else {
            const hogsta = Math.max(...Object.values(state.lag).map(l => l.poang));
            addPoang(vinnare, Math.max(0, hogsta - state.lag[vinnare].poang));
          }
        }
      }

      // Privat resultat per lag (för steg 1 – varje lag ser sitt eget direkt)
      for (const lag of Object.keys(state.lag)) {
        state.lag[lag].senasteResultat = { fragaId: fraga.id, poangandring: resultat.poangandringar[lag] || 0 };
      }

      fraga.sammanstalld = true;
      fraga.resultat = resultat;
      state.historik.push({ fragaId: fraga.id, typ: fraga.typ, resultat });
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/stjalBeslut – laget som vann stöldrätten väljer mål, eller sparar
    if (delar.length === 3 && delar[2] === "stjalBeslut" && request.method === "POST") {
      const body = await lasBody(request);
      const state = await hamtaRum(env, kod);
      if (!state || !state.aktuellFraga || !state.aktuellFraga.stoldPending) return json(404, { fel: "ingen väntande stöldrätt" });
      const pending = state.aktuellFraga.stoldPending;
      if (pending.beslutat) return json(200, state); // redan avgjort – no-op (idempotent)
      if (!body || body.lag !== pending.lag) return json(403, { fel: "det är inte ditt lags stöldrätt" });

      pending.beslutat = true;
      if (body.spara) {
        const belopp = arLedande(state, pending.lag) ? state.installningar.stoldBeloppReducerat : state.installningar.stoldBelopp;
        state.lag[pending.lag].sparatStold += belopp;
      } else {
        if (!body.mal || !state.lag[body.mal] || body.mal === pending.lag) return json(400, { fel: "ogiltigt mål" });
        const ledande = arLedande(state, pending.lag);
        const vinst = ledande ? state.installningar.stoldBeloppReducerat : state.installningar.stoldBelopp;
        state.lag[body.mal].poang -= state.installningar.stoldBelopp; // offret förlorar alltid hela summan
        state.lag[pending.lag].poang += vinst;
        state.lag[pending.lag].senasteResultat = { fragaId: state.aktuellFraga.id, stoldFran: body.mal, poangandring: vinst };
        state.lag[body.mal].senasteResultat = { fragaId: state.aktuellFraga.id, stoldAv: pending.lag, poangandring: -state.installningar.stoldBelopp };
      }
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/spenderaSparat – slå till med sparade stöldpoäng mot valfritt lag, när som helst
    if (delar.length === 3 && delar[2] === "spenderaSparat" && request.method === "POST") {
      const body = await lasBody(request);
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });
      if (!body || !state.lag[body.lag] || !state.lag[body.mal] || body.mal === body.lag) return json(400, { fel: "ogiltig begäran" });
      const belopp = state.lag[body.lag].sparatStold;
      if (belopp <= 0) return json(400, { fel: "inga sparade stöldpoäng" });
      state.lag[body.lag].sparatStold = 0;
      state.lag[body.mal].poang -= belopp;
      state.lag[body.lag].poang += belopp; // sparade poäng är redan ev. reducerade vid intjänandet, rakt byte här
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/visaResultat – lärarens klick: flagga frågan som avslöjad för klassen
    if (delar.length === 3 && delar[2] === "visaResultat" && request.method === "POST") {
      const state = await hamtaRum(env, kod);
      if (!state || !state.aktuellFraga) return json(404, { fel: "ingen aktiv fråga" });
      state.aktuellFraga.avslojadForKlassen = true;
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    return json(404, { fel: "hittades inte" });
  },
};
