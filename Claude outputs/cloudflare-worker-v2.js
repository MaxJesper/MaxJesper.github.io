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
 *                                       hel bricka. Låser spelet (avslutad:true) och
 *                                       räknar fram en topplista över de tre bästa.
 */

const RUM_TTL_SEKUNDER = 4 * 60 * 60; // 4 timmar – gott om marginal för en lektion

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

async function skapaRum(env) {
  let kod;
  let forsok = 0;
  do {
    kod = nyKod();
    forsok++;
  } while ((await env.BINGO_KV.get(`rum:${kod}`)) !== null && forsok < 20);

  const state = nyttRumState();
  await env.BINGO_KV.put(`rum:${kod}`, JSON.stringify(state), {
    expirationTtl: RUM_TTL_SEKUNDER,
  });
  return kod;
}

function nyttRumState() {
  return {
    roptaTermer: [],
    upptagnaBrickor: [],
    spelare: {},        // bricknummer (som textnyckel) -> {namn, poang}
    svarPerTerm: {},     // begrepp -> lista av bricknummer i den ordning de svarade rätt
    avslutad: false,
    vinnareBricknummer: null,
    topplista: null,     // sätts när spelet avslutas: [{bricknummer,namn,poang}, ...] topp 3
    skapad: Date.now(),
  };
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

    // POST /rum – skapa nytt rum
    if (delar.length === 1 && request.method === "POST") {
      const kod = await skapaRum(env);
      return json(200, { kod });
    }

    // GET /rum/:kod – hämta state
    if (delar.length === 2 && request.method === "GET") {
      const state = await hamtaRum(env, delar[1]);
      if (!state) return json(404, { fel: "rummet finns inte" });
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
      if (!n || n < 1 || n > 23) {
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
      state.upptagnaBrickor.push(n);
      state.spelare = state.spelare || {};
      state.spelare[String(n)] = { namn, poang: 0 };
      await sparaRum(env, kod, state);
      return json(200, state);
    }

    // POST /rum/:kod/ratt – eleven klickade rätt på ett uppropat begrepp. Ju tidigare
    // en elev rapporterar rätt svar på ett visst begrepp, desto fler poäng får den
    // (100, 80, 60, 40, sedan alltid 20). Samma elev kan bara få poäng en gång per begrepp.
    if (delar.length === 3 && delar[2] === "ratt" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      if (!n || n < 1 || n > 23 || typeof body.term !== "string") {
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
        poangTilldelade = Math.max(20, 100 - plats * 20);
        svarslista.push(n);
        state.spelare = state.spelare || {};
        if (!state.spelare[String(n)]) state.spelare[String(n)] = { namn: `Elev ${n}`, poang: 0 };
        state.spelare[String(n)].poang += poangTilldelade;
        await sparaRum(env, kod, state);
      }
      return json(200, { ok: true, poangTilldelade, state });
    }

    // POST /rum/:kod/avsluta – eleven fick hel bricka. Låser spelet och räknar fram
    // topplistan (topp 3 efter poäng). Om spelet redan är avslutat returneras bara
    // det befintliga resultatet, så att den som "vann" i en kapplöpning inte skriver över.
    if (delar.length === 3 && delar[2] === "avsluta" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json(400, { fel: "ogiltig json" });
      }
      const n = body && Number(body.bricknummer);
      if (!n || n < 1 || n > 23) {
        return json(400, { fel: "ogiltigt bricknummer" });
      }
      const kod = delar[1];
      const state = await hamtaRum(env, kod);
      if (!state) return json(404, { fel: "rummet finns inte" });

      if (!state.avslutad) {
        state.avslutad = true;
        state.vinnareBricknummer = n;
        const alla = Object.entries(state.spelare || {}).map(([id, p]) => ({
          bricknummer: Number(id),
          namn: p.namn,
          poang: p.poang,
        }));
        alla.sort((a, b) => b.poang - a.poang);
        state.topplista = alla.slice(0, 3);
        await sparaRum(env, kod, state);
      }
      return json(200, state);
    }

    return json(404, { fel: "hittades inte" });
  },
};
