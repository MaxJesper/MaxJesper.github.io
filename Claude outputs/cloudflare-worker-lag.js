/**
 * Delad "svarta tavlan" för begreppsbingo – en liten Cloudflare Worker som håller
 * reda på ett rum per pågående upprop: vilka begrepp läraren har ropat upp, vilka
 * bricknummer eleverna valt, deras poäng och (när spelet är slut) topplistan.
 *
 * Kräver en KV-namespace bunden till variabeln BINGO_KV (Settings -> Variables ->
 * KV Namespace Bindings i Workern, namnet på bindningen måste vara exakt "BINGO_KV").
 *
 * Endpoints:
 *   POST /rum                      -> skapar ett nytt rum, svarar {kod:"1234"}
 *   GET  /rum/:kod                 -> hämtar rummets state, 404 om det inte finns
 *   POST /rum/:kod/ropa            -> {term:"..."} lägger till ett uppropat begrepp
 *   POST /rum/:kod/valjBricka      -> {bricknummer:N, namn:"..."} försöker låsa ett
 *                                       bricknummer åt en namngiven spelare
 *                                       -> 200 + hela state om det gick
 *                                       -> 409 + upptagnaBrickor om numret redan var taget
 *   POST /rum/:kod/ratt            -> {bricknummer:N, term:"..."} rapporterar att den
 *                                       eleven klickat rätt på ett uppropat begrepp.
 *                                       Poäng ges efter tur (den som är snabbast per
 *                                       begrepp får mest) och läggs till elevens totalpoäng.
 *   POST /rum/:kod/avsluta         -> {bricknummer:N} rapporterar att den eleven fick
 *                                       hel bricka. Låser spelet (avslutad:true), ger en
 *                                       bonus till vinnaren och räknar fram en topplista
 *                                       över de tre bästa.
 *   POST /rum/:kod/rad             -> {bricknummer:N, antalRader:N} rapporterar att den
 *                                       eleven precis klarat sin N:e rad (N räknas per
 *                                       elev). De tre första eleverna i rummet som når
 *                                       rad 1, rad 2 respektive rad 3 får en poängbonus
 *                                       (60/40/20) och en händelse loggas så att alla kan
 *                                       få en kort "Bingo för X!"-notis.
 *
 * Tillägg för LAGLÄGET (begrepp-bingo-lag.html) – additiva, ändrar inget av ovanstående:
 *   POST /rum/:kod/valjBricka      -> tar nu även emot ett valfritt fält medlemmar:[...]
 *                                       (upp till fyra namn) som sparas på laget och visas
 *                                       för alla i "Ställning".
 *   POST /rum/:kod/lagMilstolpe    -> {bricknummer:N, antalRader:N} rapporterar att LAGET
 *                                       nått en milstolpe. Endast N=1, 2 eller 4 räknas. De
 *                                       TVÅ första lagen som når en given milstolpe blir
 *                                       "kvalificerade" (data.kvalificerad, data.plats 0/1)
 *                                       och får då välja att ta/ge poäng (se nästa rad) –
 *                                       inga poäng delas ut automatiskt här.
 *   POST /rum/:kod/lagPoangbyte    -> {tarBricknummer:N, gerBricknummer:N, poang:N,
 *                                       etikett:"..."} flyttar poang poäng från laget
 *                                       gerBricknummer till laget tarBricknummer (kan aldrig
 *                                       göra det givande laget negativt). Loggar en händelse
 *                                       så att alla ser vem som tog/gav poäng till vem.
 */

const RUM_TTL_SEKUNDER = 4 * 60 * 60; // 4 timmar – gott om marginal för en lektion
const ANTAL_BRICKOR = 32; // hur många valbara bingobrickor ett rum erbjuder (måste matcha klienten)

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function nyKod() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// version är valfri: spel med flera frågenivåer (t.ex. kol-och-kolföreningars Version
// 1/Version 2/Överkurs) skickar med vilken nivå läraren valde, så att elever som
// ansluter senare kan läsa av samma nivå och bygga sin bricka från samma begreppspool.
// Spel utan flera nivåer skickar ingen version och den sparas som null.
async function skapaRum(env, version) {
  let kod;
  let forsok = 0;
  do {
    kod = nyKod();
    forsok++;
  } while ((await env.BINGO_KV.get(`rum:${kod}`)) !== null && forsok < 20);

  const state = nyttRumState(version);
  await env.BINGO_KV.put(`rum:${kod}`, JSON.stringify(state), {
    expirationTtl: RUM_TTL_SEKUNDER,
  });
  return kod;
}

function nyttRumState(version) {
  return {
    roptaTermer: [],
    upptagnaBrickor: [],
    spelare: {},        // bricknummer (som textnyckel) -> {namn, poang}
    svarPerTerm: {},     // begrepp -> lista av bricknummer i den ordning de svarade rätt
    radBonusTagna: { "1": [], "2": [], "3": [] }, // per radantal: bricknummer i den ordning de nådde den raden (max 3)
    handelser: [],       // logg över bonushändelser (rad/bingo) – klienterna visar nya som en kort notis
    avslutad: false,
    vinnareBricknummer: null,
    topplista: null,     // sätts när spelet avslutas: [{bricknummer,namn,poang}, ...] topp 3
    version: (typeof version === "string" && version) ? version.slice(0, 40) : null,
    skapad: Date.now(),
  };
}

// Poäng till de tre första som når en viss rad-milstolpe (1:a, 2:a resp. 3:e klara raden).
const RAD_BONUS_PLATS = [60, 40, 20];
// Bonus till den elev som först får hel bricka (utöver de vanliga begreppspoängen).
const HELPLATTA_BONUS = 80;

function loggaHandelse(state, handelse) {
  state.handelser = state.handelser || [];
  state.handelser.push({ id: state.handelser.length, ...handelse });
  if (state.handelser.length > 30) state.handelser = state.handelser.slice(-30);
}

// Räknar fram topp 3 utifrån den just nu sparade poängställningen. Anropas på nytt varje
// gång någon hämtar ett avslutat rum (inte bara en gång vid avsluta-anropet), så att
// topplistan/pallen alltid stämmer med den senast sparade poängen även om ett par
// samtidiga poängrapporter (t.ex. flera snabba klick i slutet) skulle hinna komma in
// strax efter att spelet låstes.
function beraknaTopplista(state) {
  const alla = Object.entries(state.spelare || {}).map(([id, p]) => ({
    bricknummer: Number(id),
    namn: p.namn,
    poang: p.poang,
  }));
  alla.sort((a, b) => b.poang - a.poang);
  return alla.slice(0, 3);
}

async function hamtaRum(env, kod) {
  const rad = await env.BINGO_KV.get(`rum:${kod}`);
  return rad ? JSON.parse(rad) : null;
}

async function sparaRum(env, kod, state) {
  await env.BINGO_KV.put(`rum:${kod}`, JSON.stringify(state), {
    expirationTtl: RUM_TTL_SEKUNDER,
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const delar = url.pathname.split("/").filter(Boolean); // t.ex. ["rum","1234","ropa"]

    if (delar[0] !== "rum") {
      return json(404, { fel: "hittades inte" });
    }

    // POST /rum – skapa nytt rum. Kroppen är valfri: {version:"..."} för spel med flera
    // frågenivåer (se skapaRum/nyttRumState) – äldre klienter som inte skickar någon
    // kropp alls fungerar precis som förut.
    if (delar.length === 1 && request.method === "POST") {
      let body = null;
      try {
        body = await request.json();
      } catch {
        body = null;
      }
      const kod = await skapaRum(env, body && body.version);
      return json(200, { kod });
    }

    // GET /rum/:kod – hämta state. Om spelet är avslutat räknas topplistan om från den
    // senast sparade poängen varje gång (se beraknaTopplista), så att den alltid stämmer.
    if (delar.length === 2 && request.method === "GET") {
      const state = await hamtaRum(env, delar[1]);
      if (!state) return json(404, { fel: "rummet finns inte" });
      if (state.avslutad) state.topplista = beraknaTopplista(state);
      return json(200, state);
    }

    // POST /rum/:kod/ropa – lägg till ett uppropat begrepp
    if (delar.length === 3 && delar[2] === "ropa" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      if (!body || typeof body.term !== "string") {
        return json(400, { fel: "ogiltig begäran" });
      }
      const kod = delar[1];
      const state = (await hamtaRum(env, kod)) || nyttRumState();
      if (!state.roptaTermer.includes(body.term)) {
        state.roptaTermer.push(body.term);
      }
      await sparaRum(env, kod, state);
      return json(200, { ok: true });
    }

    // POST /rum/:kod/valjBricka – försök låsa ett bricknummer åt en namngiven elev
    if (delar.length === 3 && delar[2] === "valjBricka" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      if (!n || n < 1 || n > ANTAL_BRICKOR) {
        return json(400, { fel: "ogiltigt bricknummer" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      if (state.upptagnaBrickor.includes(n)) {
        return json(409, { fel: "redan tagen", upptagnaBrickor: state.upptagnaBrickor });
      }

      const namn = (body.namn && typeof body.namn === "string" && body.namn.trim())
        ? body.namn.trim().slice(0, 24)
        : `Elev ${n}`;
      // medlemmar är valfritt (lagläget): en lista med lagets medlemmars namn, upp till
      // fyra stycken. Skickas fältet inte alls (vanlig individuell bingo) sparas inget.
      let medlemmar;
      if (Array.isArray(body.medlemmar)) {
        medlemmar = body.medlemmar
          .filter((m) => typeof m === "string" && m.trim())
          .map((m) => m.trim().slice(0, 20))
          .slice(0, 4);
      }
      state.upptagnaBrickor.push(n);
      state.spelare = state.spelare || {};
      state.spelare[String(n)] = { namn, poang: 0, ...(medlemmar && medlemmar.length ? { medlemmar } : {}) };
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/ratt – eleven klickade rätt på ett uppropat begrepp. Ju tidigare en
    // elev rapporterar rätt svar på ett visst begrepp, desto fler poäng får den: poängen
    // trappas ner steg för steg efter svarsordning (100, 97, 94, ... ner till lägst 4)
    // utan något gemensamt "golv" som flera elever delar – det gör att den slutliga
    // topplistan/rangordningen blir exakt även i en stor klass, istället för att många
    // elever klumpas ihop på samma poäng för samma begrepp. Samma elev kan bara få poäng
    // en gång per begrepp.
    if (delar.length === 3 && delar[2] === "ratt" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      if (!n || n < 1 || n > ANTAL_BRICKOR || typeof body.term !== "string") {
        return json(400, { fel: "ogiltig begäran" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      state.svarPerTerm = state.svarPerTerm || {};
      const svarslista = (state.svarPerTerm[body.term] = state.svarPerTerm[body.term] || []);

      let poangTilldelade = 0;
      if (!svarslista.includes(n)) {
        const plats = svarslista.length; // 0 = snabbast
        // Trappa ner 3 poäng per placering (100, 97, 94, ...) – ger alla rätt svar
        // meningsfulla poäng samtidigt som varje placering blir unik för sig (inget
        // gemensamt golv delas av flera elever förrän långt bortom en vanlig klasstorlek).
        poangTilldelade = Math.max(4, 100 - plats * 3);
        svarslista.push(n);
        state.spelare = state.spelare || {};
        if (!state.spelare[String(n)]) state.spelare[String(n)] = { namn: `Elev ${n}`, poang: 0 };
        state.spelare[String(n)].poang += poangTilldelade;
        await sparaRum(env, kod, state);
      }
      return json(200, { ok: true, poangTilldelade, state });
    }

    // POST /rum/:kod/rad – eleven klarade precis sin antalRader:e rad (räknat per elev).
    // De tre första i hela rummet som når rad 1, rad 2 respektive rad 3 får en poängbonus
    // och en händelse loggas ("Bingo för X!") som alla klienter kan visa som en kort notis.
    if (delar.length === 3 && delar[2] === "rad" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      const antalRader = body && Number(body.antalRader);
      if (!n || n < 1 || n > ANTAL_BRICKOR || !antalRader || antalRader < 1) {
        return json(400, { fel: "ogiltig begäran" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      let poangTilldelade = 0;
      let text = null;
      state.radBonusTagna = state.radBonusTagna || { "1": [], "2": [], "3": [] };
      // Ingen radbonus sedan spelet redan är avslutat (t.ex. ett par sista klick som hann
      // avsändas precis när någon annan fick hel bricka) – då är poängställningen redan låst.
      if (!state.avslutad && antalRader >= 1 && antalRader <= 3) {
        const key = String(antalRader);
        const lista = (state.radBonusTagna[key] = state.radBonusTagna[key] || []);
        if (!lista.includes(n) && lista.length < RAD_BONUS_PLATS.length) {
          poangTilldelade = RAD_BONUS_PLATS[lista.length];
          lista.push(n);
          state.spelare = state.spelare || {};
          if (!state.spelare[String(n)]) state.spelare[String(n)] = { namn: `Elev ${n}`, poang: 0 };
          state.spelare[String(n)].poang += poangTilldelade;
          const namn = state.spelare[String(n)].namn;
          text = `🎉 Bingo för ${namn} – rad ${antalRader}! +${poangTilldelade} poäng`;
          loggaHandelse(state, { typ: "rad", namn, bricknummer: n, antalRader, poang: poangTilldelade, text });
          await sparaRum(env, kod, state);
        }
      }
      return json(200, { ok: true, poangTilldelade, text, state });
    }

    // POST /rum/:kod/lagMilstolpe – laget (bricknummer) rapporterar att det nått en
    // milstolpe på antingen 1, 2 eller 4 klara rader. De TVÅ första lagen i rummet som når
    // en given milstolpe blir "kvalificerade" och kan därefter själva välja att ta poäng
    // från eller ge poäng till ett annat lag via /lagPoangbyte – den här ändpunkten delar
    // aldrig ut poäng automatiskt, den bara låser vem som fick chansen och i vilken ordning.
    if (delar.length === 3 && delar[2] === "lagMilstolpe" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      const antalRader = body && Number(body.antalRader);
      const GILTIGA_MILSTOLPAR = [1, 2, 4];
      if (!n || n < 1 || n > ANTAL_BRICKOR || !GILTIGA_MILSTOLPAR.includes(antalRader)) {
        return json(400, { fel: "ogiltig begäran" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      let kvalificerad = false;
      let plats = -1;
      state.lagMilstolpar = state.lagMilstolpar || { "1": [], "2": [], "4": [] };
      const key = String(antalRader);
      const lista = (state.lagMilstolpar[key] = state.lagMilstolpar[key] || []);
      if (!state.avslutad && !lista.includes(n) && lista.length < 2) {
        plats = lista.length;
        lista.push(n);
        kvalificerad = true;
        state.spelare = state.spelare || {};
        if (!state.spelare[String(n)]) state.spelare[String(n)] = { namn: `Lag ${n}`, poang: 0 };
        const namn = state.spelare[String(n)].namn;
        const platsText = plats === 0 ? "första" : "andra";
        loggaHandelse(state, {
          typ: "milstolpe",
          namn,
          bricknummer: n,
          antalRader,
          plats,
          text: `🎯 ${namn} nådde rad ${antalRader} som ${platsText} lag – får ta eller ge poäng!`,
        });
        await sparaRum(env, kod, state);
      }
      return json(200, { ok: true, kvalificerad, plats, state });
    }

    // POST /rum/:kod/lagPoangbyte – flyttar poäng mellan två lag efter att ett lag valt att
    // ta ifrån eller ge till ett annat lag (se lagMilstolpe ovan). Det givande laget kan
    // aldrig hamna under 0 poäng (den faktiska överföringen kapas vid behov).
    if (delar.length === 3 && delar[2] === "lagPoangbyte" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const tarId = body && String(Number(body.tarBricknummer));
      const gerId = body && String(Number(body.gerBricknummer));
      const onskadPoang = body && Number(body.poang);
      if (
        !tarId || !gerId || tarId === "NaN" || gerId === "NaN" || tarId === gerId ||
        !onskadPoang || onskadPoang < 1
      ) {
        return json(400, { fel: "ogiltig begäran" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });
      state.spelare = state.spelare || {};
      if (!state.spelare[tarId] || !state.spelare[gerId]) {
        return json(404, { fel: "okänt lag" });
      }

      const poangCap = Math.min(200, onskadPoang);
      const faktiskPoang = Math.max(0, Math.min(poangCap, state.spelare[gerId].poang));
      state.spelare[gerId].poang -= faktiskPoang;
      state.spelare[tarId].poang += faktiskPoang;
      const etikett = (body.etikett && typeof body.etikett === "string") ? body.etikett.trim().slice(0, 40) : "";
      const tarNamn = state.spelare[tarId].namn;
      const gerNamn = state.spelare[gerId].namn;
      loggaHandelse(state, {
        typ: "poangbyte",
        namn: tarNamn,
        poang: faktiskPoang,
        text: `🔄 ${tarNamn} tog ${faktiskPoang} poäng från ${gerNamn}${etikett ? ` (${etikett})` : ""}`,
      });
      await sparaRum(env, kod, state);
      return json(200, { ok: true, poang: faktiskPoang, state });
    }

    // POST /rum/:kod/avsluta – eleven fick hel bricka. Låser spelet, ger vinnaren en
    // bonus och räknar fram topplistan (topp 3 efter poäng, bonusen inräknad). Om spelet
    // redan är avslutat returneras bara det befintliga resultatet, så att den som "vann"
    // i en kapplöpning inte skriver över.
    if (delar.length === 3 && delar[2] === "avsluta" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      if (!n || n < 1 || n > ANTAL_BRICKOR) {
        return json(400, { fel: "ogiltigt bricknummer" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      if (!state.avslutad) {
        state.avslutad = true;
        state.vinnareBricknummer = n;
        state.spelare = state.spelare || {};
        if (!state.spelare[String(n)]) state.spelare[String(n)] = { namn: `Elev ${n}`, poang: 0 };
        state.spelare[String(n)].poang += HELPLATTA_BONUS;
        const namn = state.spelare[String(n)].namn;
        loggaHandelse(state, {
          typ: "bingo",
          namn,
          bricknummer: n,
          poang: HELPLATTA_BONUS,
          text: `🏆 ${namn} fick hela plattan! +${HELPLATTA_BONUS} poäng`,
        });
        state.topplista = beraknaTopplista(state);
        await sparaRum(env, kod, state);
      }
      return json(200, state);
    }

    return json(404, { fel: "hittades inte" });
  },
};
