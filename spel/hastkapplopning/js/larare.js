/* =====================================================================
   larare.js – lärarvyn (projektorskärmen) för Hästkapplöpning
   ===================================================================== */
import { HASTRACE_API, TIDER, SOUND_FILES, STANDARD_UPPSATTNING } from "./config.js";
import { AVATARER, avatarNamn, slumpRumskod } from "./engine.js";
import { avatarSvg } from "./avatars.js";
import { skapaTransport, skapaServerRum } from "./transport.js";
import { LokalServer } from "./lokalserver.js";
import { startaBotar } from "./bots.js";
import { Ljud, LJUD } from "./sound.js";
import { laddaUppsattningar, laddaFragor, tillFragameddelande } from "./data.js";
import { skapaSlumpadeLag } from "./slumpa-lag.js";
import { el, tom, param, lagra, lasa, radera, elevAdress, ingenRorelse, sov, sek, meddela, statusText } from "./ui.js";

const $ = (id) => document.getElementById(id);
const BOKSTAV = ["A", "B", "C", "D"];
const FORM = ["▲", "●", "■", "◆"];
const MEDALJ = { 1: "🥇", 2: "🥈", 3: "🥉" };

/* ---------- tillstånd ---------- */
const S = {
  lage: "server", // 'server' | 'lokal'
  demo: false,
  kod: null,
  nyckel: null,
  transport: null,
  server: null, // LokalServer (lokalt läge/demo)
  data: null, // valt frågeset
  vy: null,
  prev: null,
  offset: 0, // servertid − lokal tid
  status: "ansluter",
  ljud: new Ljud(SOUND_FILES),
  animerar: false,
  animToken: 0,
  visadPos: {},
  bonus: {}, // lagId → {g, steg}
  sistAnimerad: null,
  autoTimer: null,
  banaNyckel: "",
  lobbyPending: null,
  senastSek: null,
  senastSvarat: 0,
  senastPallLjud: null,
  bots: [],
};
window.__hk = S; // för test och felsökning (innehåller inga elevuppgifter utöver det läraren redan ser)

function visaFel(text) {
  const f = $("fel");
  f.textContent = text;
  f.hidden = !text;
  $("laddar").hidden = true;
}

/* ---------- start ---------- */
async function start() {
  const p = new URLSearchParams(location.search);
  S.demo = p.get("demo") === "1";
  S.lage = S.demo || p.get("lage") === "lokal" ? "lokal" : "server";
  let kod = (p.get("rum") || "").toUpperCase();
  const uppsId = p.get("u") || STANDARD_UPPSATTNING;

  try {
    const lista = await laddaUppsattningar();
    const u = lista.find((x) => x.id === uppsId) || lista[0];
    S.data = await laddaFragor(u.fil);
  } catch (e) {
    visaFel("Kunde inte läsa frågorna: " + e.message);
    return;
  }

  if (S.lage === "server") {
    if (!HASTRACE_API) {
      visaFel("Servern är inte påslagen ännu (ingen adress i js/config.js). Gå tillbaka och välj Lokalt läge eller Demoläge.");
      return;
    }
    const lagrad = kod ? lasa("hk-larare-" + kod) : null;
    if (kod && lagrad && lagrad.nyckel) {
      S.nyckel = lagrad.nyckel;
    } else if (kod) {
      visaFel("Rum " + kod + " kan inte tas över i den här webbläsaren (lärarnyckeln saknas). Skapa ett nytt rum från startsidan.");
      return;
    } else {
      try {
        const r = await skapaServerRum(HASTRACE_API);
        kod = r.kod;
        S.nyckel = r.lararnyckel;
        lagra("hk-larare-" + kod, { nyckel: r.lararnyckel, skapad: Date.now() });
        history.replaceState(null, "", "?lage=server&rum=" + kod + (p.get("u") ? "&u=" + encodeURIComponent(p.get("u")) : ""));
      } catch (e) {
        visaFel("Kunde inte skapa rum: " + e.message);
        return;
      }
    }
  } else {
    if (!kod) {
      kod = slumpRumskod();
      history.replaceState(null, "", "?" + (S.demo ? "demo=1&" : "lage=lokal&") + "rum=" + kod + (p.get("u") ? "&u=" + encodeURIComponent(p.get("u")) : "") + (p.get("bots") ? "&bots=" + encodeURIComponent(p.get("bots")) : ""));
    }
    S.server = new LokalServer(kod);
  }
  S.kod = kod;

  S.transport = skapaTransport({ lage: S.lage, roll: "larare", kod, nyckel: S.nyckel, api: HASTRACE_API, server: S.server });
  S.transport.onvy = (vy) => nyVy(vy);
  S.transport.onstatus = (s) => {
    S.status = s;
    uppdateraStatusrad();
  };
  S.transport.onfel = (f) => {
    meddela("live", f.text || f.fel);
    const l = $("ljudEtikett");
    if (l) l.textContent = "";
    visaTillfalligtFel(f.text || f.fel);
  };
  bindKontroller();
  S.transport.starta();
  $("laddar").hidden = true;
  $("kontroller").hidden = false;

  if (S.demo) {
    const n = parseInt(p.get("bots") || "6", 10) || 6;
    // Skicka in tidsinställningar från config (bara om de avviker från standard).
    S.transport.skicka({ t: "installningar", svarstid_s: TIDER.svarstid_s, banlangd: TIDER.banlangd, autoFordrojning_s: TIDER.autoFordrojning_s });
    S.bots = startaBotar(S.server, n);
  } else if (S.lage === "server" || S.lage === "lokal") {
    S.transport.skicka({ t: "installningar", svarstid_s: TIDER.svarstid_s, banlangd: TIDER.banlangd, autoFordrojning_s: TIDER.autoFordrojning_s });
  }
  setInterval(tickTimer, 100);
}

let felTimer = null;
function visaTillfalligtFel(text) {
  const f = $("fel");
  f.textContent = text;
  f.hidden = false;
  clearTimeout(felTimer);
  felTimer = setTimeout(() => {
    f.hidden = true;
  }, 5000);
}

/* ---------- vy-uppdatering ---------- */
function nyVy(vy) {
  S.prev = S.vy;
  S.vy = vy;
  S.offset = vy.nu - Date.now();
  const prev = S.prev;
  const m = vy.match;

  // Ljud för ändringar
  if (prev) {
    if (m && prev.match && m.steg === "fraga" && prev.match.steg === "fraga" && m.fraga.nr === prev.match.fraga.nr && m.antalSvarat > (prev.match.antalSvarat || 0)) S.ljud.spela("last");
    if ((vy.fas === "match" && m && m.steg === "pall" && !(prev.match && prev.match.steg === "pall" && prev.match.nr === m.nr)) || (vy.fas === "slut" && prev.fas !== "slut")) {
      S.ljud.spela("pall");
    }
  }
  if (m && m.steg === "fraga") {
    S.bonus = {};
    S.senastSek = null;
  }

  // Ny avslöjning → spela upp förflyttningar
  const nyckel = m && m.resultat ? m.nr + "-" + m.resultat.fragaNr : null;
  const forstaLaddning = !prev;
  if (m && m.steg === "avslojad" && nyckel !== S.sistAnimerad) {
    S.sistAnimerad = nyckel;
    if (forstaLaddning || !prev.match || prev.match.steg !== "fraga") {
      // sidan laddades mitt i avslöjandet: visa slutläget utan animation
      S.visadPos = Object.assign({}, m.pos);
      markeraBonusUtanAnimation(m.resultat);
    } else {
      startaAnimation(vy);
    }
  } else if (m && m.steg !== "avslojad") {
    S.sistAnimerad = m && m.steg === "pall" ? S.sistAnimerad : null;
  }
  if (!S.animerar) S.visadPos = m ? Object.assign({}, m.pos) : {};

  rendera();
  planeraAuto();
}

function ljudTillGrupp(g) {
  return g.gnagg === "stor" ? "gnagg_stor" : g.gnagg === "liten" ? "gnagg_liten" : "hovar";
}

function markeraBonusUtanAnimation(res) {
  S.bonus = {};
  for (const g of res.rorelser) for (const id of g.lag) S.bonus[id] = { g: g.grupp, steg: g.steg };
}

async function startaAnimation(vy) {
  const token = ++S.animToken;
  S.animerar = true;
  const m = vy.match;
  const res = m.resultat;
  S.bonus = {};
  for (const id of Object.keys(res.lag)) S.visadPos[id] = res.lag[id].fran;
  rendera();
  const snabb = ingenRorelse();
  const nagon = Object.values(res.lag).some((x) => x.allaRatt);
  S.ljud.spela(nagon ? "ratt" : "fel");
  meddela("live", nagon ? "Rätt svar visas. Lag där alla svarade rätt flyttas fram." : "Inget lag fick alla rätt. Ingen flyttas fram.");
  await sov(snabb ? 500 : 900);
  for (const g of res.rorelser) {
    if (token !== S.animToken) return;
    const namn = g.lag.map(avatarNamn);
    const lista = namn.length > 1 ? namn.slice(0, -1).join(", ") + " och " + namn[namn.length - 1] : namn[0];
    S.ljud.spela(ljudTillGrupp(g));
    for (const id of g.lag) {
      S.bonus[id] = { g: g.grupp, steg: g.steg };
      S.visadPos[id] = res.lag[id].till;
    }
    rendera();
    setGungar(g.lag, true);
    meddela("live", lista + " går " + g.steg + (g.steg === 1 ? " steg" : " steg") + (namn.length > 1 ? " vardera" : ""));
    await sov(snabb ? 700 : 1500);
    setGungar(g.lag, false);
  }
  if (token !== S.animToken) return;
  if (res.malNadd) {
    S.ljud.spela("mal");
    meddela("live", avatarNamn(res.malNadd) + " är först i mål och vinner matchen!");
    await sov(snabb ? 500 : 1800);
    if (token !== S.animToken) return;
  }
  S.animerar = false;
  S.visadPos = Object.assign({}, S.vy.match.pos);
  rendera();
  planeraAuto();
}

function setGungar(lagIds, pa) {
  if (ingenRorelse()) return;
  for (const id of lagIds) {
    const a = document.querySelector('.bana-rad[data-lag="' + id + '"] .avatar');
    if (a) a.classList.toggle("gungar", pa);
  }
}

function hoppaOverAnimation() {
  if (!S.animerar) return false;
  S.animToken++;
  S.animerar = false;
  const m = S.vy.match;
  S.visadPos = Object.assign({}, m.pos);
  markeraBonusUtanAnimation(m.resultat);
  meddela("live", m.vinnare && m.klar ? avatarNamn(m.vinnare) + " vinner matchen." : "Alla förflyttningar visas.");
  rendera();
  planeraAuto();
  return true;
}

/* ---------- rendering ---------- */
function visaSektion(id) {
  for (const s of ["vy-lobby", "vy-match", "vy-pall"]) $(s).hidden = s !== id;
}

function uppdateraStatusrad() {
  const r = $("statusrad");
  if (!r) return;
  tom(r);
  const vy = S.vy;
  if (S.kod) r.append(el("span", { klass: "chip" }, "Rum ", el("span", { klass: "kod" }, S.kod)));
  const lage = S.demo ? "Demoläge" : S.lage === "lokal" ? "Lokalt läge" : "Server";
  r.append(el("span", { klass: "chip" }, lage));
  r.append(el("span", { klass: "chip", "data-s": S.status }, (S.status === "ansluten" ? "● " : "○ ") + statusText(S.status)));
  if (vy) {
    const aktiva = vy.lag.reduce((a, l) => a + l.medlemmar.length, 0) + (vy.utanLag ? vy.utanLag.length : 0);
    r.append(el("span", { klass: "chip" }, aktiva + " elever i " + vy.lag.length + " lag"));
    if (vy.match) {
      const m = vy.match;
      r.append(el("span", { klass: "chip" }, "Match " + (m.nr + 1) + " av " + vy.antalMatcher + " – " + m.namn.replace(/^Match \d+ – /, "")));
    } else if (vy.fas === "lobby") {
      r.append(el("span", { klass: "chip" }, "Nästa: match " + (vy.matchNr + 1) + " av " + vy.antalMatcher));
    }
  }
}

function rendera() {
  const vy = S.vy;
  if (!vy) return;
  uppdateraStatusrad();
  if (vy.fas === "lobby") {
    visaSektion("vy-lobby");
    byggLobby(vy);
  } else if (vy.fas === "slut") {
    visaSektion("vy-pall");
    byggSlutpall(vy);
  } else if (vy.match && vy.match.steg === "pall") {
    visaSektion("vy-pall");
    byggMatchpall(vy);
  } else {
    visaSektion("vy-match");
    byggMatch(vy);
  }
  uppdateraKontroller();
}

/* --- lobby --- */
function byggLobby(vy) {
  const lista = $("lobbyLag");
  if (lista.contains(document.activeElement) || $("utanLagLista").contains(document.activeElement)) {
    S.lobbyPending = vy; // uppdatera när fokus lämnar listan
    return;
  }
  S.lobbyPending = null;
  $("lobbyKod").textContent = vy.kod;
  const adr = elevAdress(vy.kod, S.lage);
  $("lobbyAdress").textContent = adr.replace(/^https?:\/\//, "");
  $("btnNyFlik").hidden = S.lage !== "lokal";
  $("btnNyFlik").href = adr;
  const notis = $("lobbyLokalNotis");
  if (S.lage === "lokal") {
    notis.hidden = false;
    notis.textContent = "Lokalt läge: elevflikar måste öppnas i den här webbläsaren (samma adress). Använd Server för elevernas egna enheter.";
  } else notis.hidden = true;

  tom(lista);
  const tomtP = $("lobbyTomt");
  tomtP.hidden = vy.lag.length > 0;
  $("lobbyLagRubrik").textContent = "Lag (" + vy.lag.length + ")";
  const flyttaAlternativ = (sel, lagId) => {
    sel.append(el("option", { value: "" }, "Flytta till …"));
    sel.append(el("option", { value: "-" }, "Inget lag"));
    for (const a of AVATARER) if (a.id !== lagId) sel.append(el("option", { value: a.id }, a.namn));
  };
  for (const l of vy.lag) {
    const ul = el("ul", { klass: "medl" });
    for (const p of l.medlemmar) {
      const sel = el("select", { "aria-label": "Flytta " + p.namn + " till annat lag" });
      flyttaAlternativ(sel, l.id);
      sel.addEventListener("change", () => {
        if (!sel.value) return;
        S.transport.skicka({ t: "flytta_spelare", spelarId: p.id, lag: sel.value === "-" ? null : sel.value });
      });
      ul.append(
        el(
          "li",
          null,
          el("span", { klass: p.ansluten ? "" : "frånkopplad" }, p.namn + (p.ansluten ? "" : " (frånkopplad)")),
          sel,
          el("button", { type: "button", klass: "kbtn varning", "aria-label": "Ta bort " + p.namn + " ur rummet", onclick: () => S.transport.skicka({ t: "ta_bort_spelare", spelarId: p.id }) }, "Ta bort")
        )
      );
    }
    lista.append(
      el(
        "li",
        { "data-lag": l.id },
        avatarSvg(l.id, { dekor: true }),
        el("span", { klass: "namn" }, l.namn),
        ul,
        el("button", { type: "button", klass: "kbtn varning", onclick: () => S.transport.skicka({ t: "ta_bort_lag", lag: l.id }) }, "Ta bort laget " + l.namn)
      )
    );
  }
  const utan = $("utanLag");
  const ul = $("utanLagLista");
  tom(ul);
  // I "Slumpa lag"-läge visas väntande elever i den panelen istället – annars blir det
  // förvirrande med två parallella listor (manuell "Placera i lag …" + slumpa-lag-listan).
  utan.hidden = !vy.utanLag || vy.utanLag.length === 0 || vy.inst.slumpLage;
  for (const p of vy.utanLag || []) {
    const sel = el("select", { "aria-label": "Placera " + p.namn + " i lag" });
    sel.append(el("option", { value: "" }, "Placera i lag …"));
    for (const a of AVATARER) sel.append(el("option", { value: a.id }, a.namn));
    sel.addEventListener("change", () => {
      if (sel.value) S.transport.skicka({ t: "flytta_spelare", spelarId: p.id, lag: sel.value });
    });
    ul.append(
      el(
        "li",
        { stil: "display:flex;gap:8px;align-items:center;margin:2px 0" },
        p.namn + (p.ansluten ? "" : " (frånkopplad)"),
        sel,
        el("button", { type: "button", klass: "kbtn varning", "aria-label": "Ta bort " + p.namn, onclick: () => S.transport.skicka({ t: "ta_bort_spelare", spelarId: p.id }) }, "Ta bort")
      )
    );
  }
  // "Slumpa lag": knappen visar på/av; panelen visar väntande elever + knapp för att slumpa.
  const btnS = $("btnSlumpaLag");
  btnS.setAttribute("aria-pressed", String(!!vy.inst.slumpLage));
  btnS.textContent = "🎲 Slumpa lag: " + (vy.inst.slumpLage ? "på" : "av");
  const panel = $("slumpaLagPanel");
  panel.hidden = !vy.inst.slumpLage;
  if (vy.inst.slumpLage) {
    const vantande = vy.utanLag || [];
    $("slumpaLagAntal").textContent = vantande.length + " elev" + (vantande.length === 1 ? "" : "er") + " väntar på lag.";
    const vl = tom($("slumpaLagVantarLista"));
    for (const p of vantande) vl.append(el("li", null, p.namn + (p.ansluten ? "" : " (frånkopplad)")));
    const btnSkapa = $("btnSkapaSlumpadeLag");
    const totalt = vantande.length + vy.lag.reduce((a, l) => a + l.medlemmar.length, 0);
    btnSkapa.disabled = totalt < 2;
    btnSkapa.textContent = vy.lag.length > 0 ? "Slumpa om alla lag (" + totalt + " elever)" : "Skapa slumpade lag (" + vantande.length + " elever)";
  }
  // Ställning mellan matcher
  const st = $("lobbyStallning");
  tom(st);
  st.hidden = vy.historik.length === 0;
  if (vy.historik.length) {
    st.append(el("h3", null, "Ställning efter " + vy.historik.length + " av " + vy.antalMatcher + " matcher"));
    st.append(poangTabell(vy));
  }
  const f = document.getElementById("lobbyRubrik");
  f.textContent = "Lobby – match " + (vy.matchNr + 1) + " av " + vy.antalMatcher + (S.data.matcher[vy.matchNr] ? ": " + S.data.matcher[vy.matchNr].namn.replace(/^Match \d+ – /, "") : "");
}

document.addEventListener("focusout", () => {
  setTimeout(() => {
    if (S.lobbyPending && !$("lobbyLag").contains(document.activeElement) && !$("utanLagLista").contains(document.activeElement)) {
      S.lobbyPending = null;
      rendera();
    }
  }, 50);
});

function poangTabell(vy) {
  const rader = vy.lag.slice().sort((a, b) => b.poang - a.poang || b.totalSteg - a.totalSteg);
  const t = el("table", { klass: "pall-tabell" }, el("caption", { klass: "sr-only" }, "Poäng per lag"));
  t.append(el("thead", null, el("tr", null, el("th", null, "Lag"), el("th", { klass: "tal" }, "Matchpoäng"), el("th", { klass: "tal" }, "Steg totalt"))));
  const tb = el("tbody");
  for (const l of rader) tb.append(el("tr", null, el("td", null, l.namn), el("td", { klass: "tal" }, String(l.poang)), el("td", { klass: "tal" }, String(l.totalSteg))));
  t.append(tb);
  return t;
}

/* --- match --- */
function byggBana(vy) {
  const m = vy.match;
  const L = m.banlangd;
  const n = L + 1;
  const nyckel = vy.lag.map((l) => l.id).join(",") + "|" + L;
  const bana = $("bana");
  if (S.banaNyckel !== nyckel) {
    S.banaNyckel = nyckel;
    tom(bana);
    bana.style.setProperty("--n", String(n));
    bana.style.gridTemplateRows = "auto repeat(" + vy.lag.length + ", minmax(46px, 1fr))";
    const tal = el("div", { klass: "tal", "aria-hidden": "true" });
    for (let i = 0; i < n; i++) tal.append(el("span", { klass: i === L ? "mal" : "" }, i === 0 ? "Start" : i === L ? "MÅL" : String(i)));
    bana.append(el("div", { klass: "bana-linjal" }, el("div", { klass: "hornet" }, "Lag och steg"), tal));
    for (const l of vy.lag) {
      const spar = el("div", { klass: "bana-spar" }, avatarSvg(l.id, { dekor: true }), el("span", { klass: "bonus", hidden: true }));
      bana.append(
        el(
          "div",
          { klass: "bana-rad", role: "group", "data-lag": l.id },
          el(
            "div",
            { klass: "bana-etikett" },
            el("span", { klass: "bana-namn" }, l.namn),
            el("span", { klass: "bana-p", hidden: true }),
            el("span", { klass: "bana-steg" }, "0"),
            el("span", { klass: "bana-svarstatus", hidden: true })
          ),
          spar
        )
      );
    }
  }
  const status = m.lagStatus ? Object.fromEntries(m.lagStatus.map((x) => [x.lag, x])) : null;
  const resLag = m.resultat ? m.resultat.lag : null;
  for (const l of vy.lag) {
    const rad = bana.querySelector('.bana-rad[data-lag="' + l.id + '"]');
    if (!rad) continue;
    const pos = S.visadPos[l.id] !== undefined ? S.visadPos[l.id] : m.pos[l.id] || 0;
    const spar = rad.querySelector(".bana-spar");
    spar.style.setProperty("--pos", String(pos));
    rad.querySelector(".bana-steg").textContent = String(pos);
    rad.setAttribute("aria-label", l.namn + ": steg " + pos + " av " + L);
    const b = spar.querySelector(".bonus");
    const bo = S.bonus[l.id];
    if (bo) {
      b.hidden = false;
      b.dataset.g = String(Math.min(3, bo.g));
      b.textContent = MEDALJ[Math.min(3, bo.g)] + " +" + bo.steg;
    } else b.hidden = true;
    rad.dataset.vinnare = m.klar && m.vinnare === l.id && !S.animerar ? "ja" : "nej";
    // Svarsstatus per lag: under frågan bara ANTAL (aldrig om rätt); efter
    // avslöjandet visas hur många av lagets medlemmar som svarade rätt.
    const sv = rad.querySelector(".bana-svarstatus");
    if (m.steg === "fraga" && status && status[l.id]) {
      const st = status[l.id];
      sv.hidden = false;
      sv.textContent = st.antalSvarat + " av " + st.antalMedlemmar + " har svarat" + (st.klart ? " ✓" : "");
    } else if (m.steg === "avslojad" && resLag && resLag[l.id]) {
      const r = resLag[l.id];
      sv.hidden = false;
      sv.textContent = r.antalRatt + " av " + r.antalMedlemmar + " rätt" + (r.allaRatt ? " – alla rätt!" : !r.alltSvarat ? " (inte alla svarade)" : "");
    } else sv.hidden = true;
  }
}

function byggMatch(vy) {
  const m = vy.match;
  byggBana(vy);
  const f = m.fraga;
  const arFraga = m.steg === "fraga";
  const visaRatt = m.steg === "avslojad";
  $("vy-match").dataset.steg = m.steg;
  let nr;
  if (m.steg === "vantar") {
    nr = "Match " + (m.nr + 1) + ": " + m.namn.replace(/^Match \d+ – /, "") + " – tryck på Nästa fråga";
    $("fragaText").textContent = "Redo? Första frågan kommer när du trycker på Nästa fråga.";
  } else {
    const reserv = f.nr > m.antalOrdinarie;
    nr = "Fråga " + f.nr + " av " + (reserv ? m.antalTotal : m.antalOrdinarie) + (reserv ? " (reservfråga)" : "") + " · Match " + (m.nr + 1) + " av " + vy.antalMatcher;
    $("fragaText").textContent = f.text;
  }
  $("fragaNr").textContent = nr;
  // Alternativ på storbilden
  const alt = $("storAlt");
  const visaAlt = vy.inst.visaAlternativ && f && m.steg !== "vantar";
  alt.hidden = !visaAlt;
  if (visaAlt) {
    tom(alt);
    f.alternativ.forEach((a, i) => {
      alt.append(el("li", { "data-ratt": visaRatt && f.ratt === i ? "ja" : "nej" }, el("span", { klass: "form", "aria-hidden": "true" }, FORM[i]), el("span", { klass: "bokstav" }, BOKSTAV[i]), el("span", null, a)));
    });
  }
  // Avslöjande
  const av = $("avslojande");
  av.hidden = !visaRatt;
  if (visaRatt) {
    $("rattSvar").textContent = "✓ Rätt svar: " + BOKSTAV[f.ratt] + " – " + f.alternativ[f.ratt];
    $("forklaring").textContent = f.forklaring || "";
    $("kalla").textContent = f.kalla ? "Källa: " + f.kalla : "";
  }
  $("tidbox").hidden = m.steg === "vantar";
  if (arFraga) {
    $("svaratText").textContent = m.antalSvarat + " av " + m.antalAktiva + " lag klara (alla medlemmar svarat)";
    if (S.senastSvarat !== m.antalSvarat) {
      S.senastSvarat = m.antalSvarat;
      if (m.antalSvarat > 0) meddela("live", m.antalSvarat + " av " + m.antalAktiva + " lag har nu alla medlemmar svarat.");
    }
  } else if (visaRatt) {
    const r = m.resultat;
    const alltSvarat = Object.values(r.lag).filter((x) => x.alltSvarat).length;
    const allaRatt = Object.values(r.lag).filter((x) => x.allaRatt).length;
    $("svaratText").textContent = allaRatt + " av " + vy.lag.length + " lag fick alla rätt (" + alltSvarat + " lag svarade fullt ut)";
    $("tidText").textContent = "Klart";
    $("tidFyll").style.width = "0%";
  }
  byggLagStatusLista(vy);
  tickTimer();
}

/* Detaljerad, läsbar lista per lag (visas under frågekortet): hur många
   av lagets medlemmar som har svarat (under frågan) eller svarade rätt
   (efter avslöjandet). Aldrig facit-läckage – bara antal, aldrig VAD. */
function byggLagStatusLista(vy) {
  const list = $("lagStatusLista");
  if (!list) return;
  const m = vy.match;
  tom(list);
  if (m.steg !== "fraga" && m.steg !== "avslojad") {
    list.hidden = true;
    return;
  }
  list.hidden = false;
  const resLag = m.resultat ? m.resultat.lag : null;
  for (const l of vy.lag) {
    let text;
    if (m.steg === "avslojad" && resLag && resLag[l.id]) {
      const r = resLag[l.id];
      text = l.namn + ": " + r.antalRatt + " av " + r.antalMedlemmar + " rätt" + (r.allaRatt ? " – går fram " + r.steg + " steg" : r.alltSvarat ? " – går inte fram" : " – inte alla svarade i tid, går inte fram");
    } else {
      const st = (m.lagStatus || []).find((x) => x.lag === l.id);
      text = l.namn + ": " + (st ? st.antalSvarat + " av " + st.antalMedlemmar : "0 av 0") + " har svarat" + (st && st.klart ? " – klara, väntar på övriga lag" : "");
    }
    list.append(el("li", { "data-lag": l.id }, text));
  }
}

function tickTimer() {
  const vy = S.vy;
  if (!vy || !vy.match || vy.match.steg !== "fraga") return;
  const m = vy.match;
  const f = m.fraga;
  const box = $("tidbox");
  if (m.pausad) {
    $("tidText").textContent = "Pausad";
    return;
  }
  const kvar = f.slut - (Date.now() + S.offset);
  const s = sek(kvar);
  $("tidText").textContent = s + " s";
  $("tidFyll").style.width = Math.max(0, Math.min(100, (kvar / f.svarstidMs) * 100)) + "%";
  box.dataset.lag = kvar <= 5000 ? "ja" : "nej";
  if (s !== S.senastSek) {
    if (S.senastSek !== null && s <= 5 && s >= 1) S.ljud.spela("tick");
    S.senastSek = s;
  }
}

/* --- prispall --- */
function ms(t) {
  return (t / 1000).toFixed(1).replace(".", ",") + " s";
}

function byggPodium(rader, opts) {
  const pod = $("pallPodium");
  tom(pod);
  const topp = rader.slice(0, 3);
  // Visuell ordning: 2, 1, 3
  const ordning = [topp[1], topp[0], topp[2]].filter(Boolean);
  for (const r of ordning) {
    const namn = avatarNamn(r.lag);
    pod.append(
      el(
        "li",
        { klass: "pall-plats", "data-plats": String(r.plats) },
        avatarSvg(r.lag, { dekor: true }),
        el("span", { klass: "namn" }, namn),
        el("div", { klass: "pinne" }, el("span", { klass: "platsrad" }, el("span", { klass: "medalj", "aria-hidden": "true" }, MEDALJ[r.plats]), el("span", null, "Plats " + r.plats)), el("span", { klass: "poang" }, opts.poangText(r)))
      )
    );
  }
}

function byggMatchpall(vy) {
  const m = vy.match;
  $("pallRubrik").textContent = "Prispall – " + m.namn + (m.vinnarTyp === "mal" ? " (" + avatarNamn(m.vinnare) + " var först i mål)" : " (ingen kom i mål – längst fram vinner)");
  byggPodium(m.pall, { poangText: (r) => "+" + r.poang + " poäng" });
  const t = el("table", { klass: "pall-tabell" }, el("caption", null, "Alla lag i matchen"));
  t.append(el("thead", null, el("tr", null, el("th", null, "Plats"), el("th", null, "Lag"), el("th", { klass: "tal" }, "Steg"), el("th", { klass: "tal" }, "Matchpoäng"), el("th", { klass: "tal" }, "Totalt"))));
  const tb = el("tbody");
  for (const r of m.pall) {
    const lag = vy.lag.find((l) => l.id === r.lag);
    tb.append(el("tr", null, el("td", null, (MEDALJ[r.plats] || "") + " " + r.plats), el("td", null, avatarNamn(r.lag)), el("td", { klass: "tal" }, r.steg + " av " + m.banlangd), el("td", { klass: "tal" }, "+" + r.poang), el("td", { klass: "tal" }, String(lag ? lag.poang : 0))));
  }
  t.append(tb);
  tom($("pallTabell")).append(t);
}

function byggSlutpall(vy) {
  $("pallRubrik").textContent = "Mästarpall – slutresultat efter " + vy.antalMatcher + " matcher";
  const sp = vy.slutpall || [];
  byggPodium(sp, { poangText: (r) => r.poang + " poäng" });
  const t = el("table", { klass: "pall-tabell" }, el("caption", null, "Slutställning"));
  t.append(el("thead", null, el("tr", null, el("th", null, "Plats"), el("th", null, "Lag"), el("th", { klass: "tal" }, "Poäng"), el("th", { klass: "tal" }, "Steg totalt"))));
  const tb = el("tbody");
  for (const r of sp) tb.append(el("tr", null, el("td", null, (MEDALJ[r.plats] || "") + " " + r.plats), el("td", null, avatarNamn(r.lag)), el("td", { klass: "tal" }, String(r.poang)), el("td", { klass: "tal" }, String(r.steg))));
  t.append(tb);
  tom($("pallTabell")).append(t);
}

/* ---------- kontroller ---------- */
function huvudAtgard() {
  const vy = S.vy;
  if (!vy) return { text: "Väntar …", fn: null, disabled: true };
  if (vy.fas === "lobby") {
    const lagMedMedlem = vy.lag.filter((l) => l.medlemmar.length > 0).length;
    const nr = vy.matchNr + 1;
    return { text: "▶ Starta match " + nr, fn: startaMatch, disabled: lagMedMedlem < 2, tips: lagMedMedlem < 2 ? "Minst två lag behövs" : "" };
  }
  if (vy.fas === "slut") return { text: "↻ Ny omgång", fn: nyOmgang, disabled: false };
  const m = vy.match;
  if (m.steg === "vantar") return { text: "▶ Nästa fråga", fn: nastaFraga };
  if (m.steg === "fraga") return { text: "Visa svar nu", fn: () => S.transport.skicka({ t: "visa_svar" }) };
  if (m.steg === "avslojad") {
    if (S.animerar) return { text: "Hoppa över animation", fn: hoppaOverAnimation };
    if (m.klar) return { text: "🏆 Visa prispallen", fn: () => S.transport.skicka({ t: "till_pall" }) };
    return { text: "▶ Nästa fråga", fn: nastaFraga };
  }
  if (m.steg === "pall") {
    const sista = vy.matchNr + 1 >= vy.antalMatcher;
    return { text: sista ? "🏆 Visa mästarpallen" : "Nästa match →", fn: () => S.transport.skicka({ t: "nasta_match" }) };
  }
  return { text: "…", fn: null, disabled: true };
}

function startaMatch() {
  const vy = S.vy;
  const mm = S.data.matcher[vy.matchNr];
  if (!mm) {
    visaTillfalligtFel("Frågesetet har inga fler matcher.");
    return;
  }
  const n = mm.fragor.length;
  S.transport.skicka({ t: "starta_match", nr: vy.matchNr, namn: mm.namn, antalMatcher: S.data.matcher.length, antalOrdinarie: Math.min(8, n), antalTotal: n });
}

function nastaFraga() {
  const vy = S.vy;
  const mm = S.data.matcher[vy.match.nr];
  const f = mm && mm.fragor[vy.match.fragaNr];
  if (!f) {
    visaTillfalligtFel("Frågorna i matchen är slut. Avsluta matchen.");
    return;
  }
  S.transport.skicka(tillFragameddelande(f));
}

/* ---------- Slumpa lag (lobbyfunktion, se js/slumpa-lag.js) ---------- */
function vaxlaSlumpaLag() {
  S.transport.skicka({ t: "installningar", slumpLage: !S.vy.inst.slumpLage });
}

function skapaSlumpaLagKlick() {
  const vy = S.vy;
  const harBefintligaLag = vy.lag.length > 0;
  let omslumpa = false;
  if (harBefintligaLag) {
    omslumpa = confirm("Slumpa om ALLA lag? De nuvarande lagen försvinner och alla elever blandas om till nya, slumpade lag.");
    if (!omslumpa) return;
  }
  let alla;
  if (omslumpa) {
    alla = [];
    for (const l of vy.lag) for (const m of l.medlemmar) alla.push({ id: m.id, namn: m.namn });
    for (const p of vy.utanLag || []) alla.push({ id: p.id, namn: p.namn });
    for (const l of vy.lag) S.transport.skicka({ t: "ta_bort_lag", lag: l.id });
  } else {
    alla = (vy.utanLag || []).map((p) => ({ id: p.id, namn: p.namn }));
  }
  if (alla.length < 1) {
    visaTillfalligtFel("Inga elever att slumpa lag för än.");
    return;
  }
  const upptagna = omslumpa ? new Set() : new Set(vy.lag.map((l) => l.id));
  const lediga = AVATARER.map((a) => a.id).filter((id) => !upptagna.has(id));
  if (lediga.length === 0) {
    visaTillfalligtFel("Alla avatarer är redan upptagna av befintliga lag.");
    return;
  }
  const grupper = skapaSlumpadeLag(alla, lediga);
  for (const g of grupper) for (const m of g.medlemmar) S.transport.skicka({ t: "flytta_spelare", spelarId: m.id, lag: g.avatar });
  meddela("live", "Skapade " + grupper.length + " slumpade lag av " + alla.length + " elever.");
}

function nyOmgang() {
  if (S.vy.fas === "slut" || confirm("Starta en ny omgång? Poängen nollställs men lagen består.")) S.transport.skicka({ t: "ny_omgang" });
}

function huvudKlick() {
  S.ljud.lasUpp();
  const h = huvudAtgard();
  if (h.fn && !h.disabled) h.fn();
}

function uppdateraKontroller() {
  const vy = S.vy;
  if (!vy) return;
  const h = huvudAtgard();
  const b = $("btnHuvud");
  b.textContent = h.text;
  b.disabled = !!h.disabled;
  b.title = h.tips || "";
  const auto = $("btnAuto");
  auto.setAttribute("aria-pressed", String(vy.inst.auto));
  auto.textContent = "Auto: " + (vy.inst.auto ? "på" : "av");
  const alt = $("btnAlt");
  alt.setAttribute("aria-pressed", String(vy.inst.visaAlternativ));
  alt.textContent = (vy.inst.visaAlternativ ? "✓ " : "") + "Visa alternativ";
  const pa = $("btnPaus");
  const fragaPagar = vy.match && vy.match.steg === "fraga";
  pa.hidden = !fragaPagar;
  if (fragaPagar) {
    pa.setAttribute("aria-pressed", String(!!vy.match.pausad));
    pa.textContent = vy.match.pausad ? "Fortsätt" : "Pausa";
  }
  $("btnSlutfor").hidden = !(vy.fas === "match" && vy.match && vy.match.steg !== "pall");
  $("btnNyOmg").hidden = vy.fas === "slut";
  $("btnLjud").setAttribute("aria-pressed", String(S.ljud.pa));
  $("btnLjud").textContent = S.ljud.pa ? "🔊 Ljud på" : "🔇 Ljud av";
  // inställningsdialog
  const i = vy.inst;
  if (document.activeElement !== $("instSvarstid")) $("instSvarstid").value = i.svarstid_s;
  if (document.activeElement !== $("instBana")) $("instBana").value = i.banlangd;
  if (document.activeElement !== $("instAuto")) $("instAuto").value = i.autoFordrojning_s;
  $("instBana").disabled = vy.fas !== "lobby";
  $("instBanaNot").hidden = vy.fas === "lobby";
}

function planeraAuto() {
  clearTimeout(S.autoTimer);
  S.autoTimer = null;
  const vy = S.vy;
  if (!vy || !vy.inst.auto || vy.fas !== "match" || !vy.match) return;
  const m = vy.match;
  if (S.animerar) return;
  if (m.steg === "fraga" || m.steg === "pall") return;
  const dr = () => {
    if (!S.vy || !S.vy.inst.auto || S.animerar) return;
    const mm = S.vy.match;
    if (!mm) return;
    if (mm.steg === "vantar") nastaFraga();
    else if (mm.steg === "avslojad") {
      if (mm.klar) S.transport.skicka({ t: "till_pall" });
      else nastaFraga();
    }
  };
  S.autoTimer = setTimeout(dr, vy.inst.autoFordrojning_s * 1000);
}

function bindKontroller() {
  $("btnHuvud").addEventListener("click", huvudKlick);
  $("btnAuto").addEventListener("click", () => {
    S.ljud.lasUpp();
    S.transport.skicka({ t: "installningar", auto: !S.vy.inst.auto });
  });
  $("btnPaus").addEventListener("click", () => S.transport.skicka({ t: S.vy.match.pausad ? "fortsatt" : "pausa" }));
  $("btnAlt").addEventListener("click", () => S.transport.skicka({ t: "installningar", visaAlternativ: !S.vy.inst.visaAlternativ }));
  $("btnLjud").addEventListener("click", () => {
    S.ljud.lasUpp();
    S.ljud.satt(!S.ljud.pa);
    uppdateraKontroller();
  });
  $("ljudVol").addEventListener("input", (e) => {
    S.ljud.lasUpp();
    S.ljud.volym(Number(e.target.value) / 100);
  });
  $("btnLjudtest").addEventListener("click", async () => {
    const b = $("btnLjudtest");
    b.disabled = true;
    await S.ljud.ljudtest((t) => {
      $("ljudEtikett").textContent = t ? "Spelar: " + t : "";
    });
    b.disabled = false;
  });
  $("btnInst").addEventListener("click", () => {
    S.ljud.lasUpp();
    uppdateraKontroller();
    $("instDialog").showModal();
  });
  $("instStang").addEventListener("click", () => $("instDialog").close());
  const sparaTal = (id, falt) => {
    $(id).addEventListener("change", () => {
      const v = parseInt($(id).value, 10);
      if (Number.isFinite(v)) S.transport.skicka({ t: "installningar", [falt]: v });
    });
  };
  sparaTal("instSvarstid", "svarstid_s");
  sparaTal("instBana", "banlangd");
  sparaTal("instAuto", "autoFordrojning_s");
  $("btnFull").addEventListener("click", vaxlaFullskarm);
  $("btnSlutfor").addEventListener("click", () => {
    if (confirm("Avsluta matchen nu? Laget som ligger längst fram vinner.")) S.transport.skicka({ t: "slutfor_match" });
  });
  $("btnNyOmg").addEventListener("click", nyOmgang);
  $("btnSlumpaLag").addEventListener("click", vaxlaSlumpaLag);
  $("btnSkapaSlumpadeLag").addEventListener("click", skapaSlumpaLagKlick);
  $("btnDolj").addEventListener("click", () => visaKontroller(false));
  $("btnVisa").addEventListener("click", () => visaKontroller(true));
  $("btnKopiera").addEventListener("click", async () => {
    const adr = elevAdress(S.kod, S.lage);
    try {
      await navigator.clipboard.writeText(adr);
      meddela("live", "Elevlänken kopierades.");
      $("btnKopiera").textContent = "✓ Kopierad";
      setTimeout(() => ($("btnKopiera").textContent = "📋 Kopiera elevlänk"), 2000);
    } catch (e) {
      window.prompt("Kopiera elevlänken:", adr);
    }
  });
  document.addEventListener("keydown", tangent);
  if (window.ResizeObserver) new ResizeObserver(justeraKontrollHojd).observe($("kontroller"));
  window.addEventListener("resize", justeraKontrollHojd);
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && !arTextfalt(e.target)) e.preventDefault();
  });
  document.addEventListener("fullscreenchange", () => {
    $("btnFull").setAttribute("aria-pressed", String(!!document.fullscreenElement));
  });
}

function arTextfalt(t) {
  return !!t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}

function justeraKontrollHojd() {
  const k = $("kontroller");
  const h = k.hidden ? 56 : Math.ceil(k.getBoundingClientRect().height) + 6;
  document.querySelector(".lar-wrap").style.setProperty("--kh", h + "px");
  document.querySelector(".lar-wrap").style.paddingBottom = window.matchMedia("(min-width: 900px) and (min-height: 640px)").matches ? "" : h + "px";
}

function visaKontroller(pa) {
  $("kontroller").hidden = !pa;
  $("btnVisa").hidden = pa;
  if (pa) $("btnHuvud").focus();
  justeraKontrollHojd();
}

function vaxlaFullskarm() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } catch (e) {}
}

function tangent(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (arTextfalt(e.target) || $("instDialog").open) return;
  const k = e.key.toLowerCase();
  if (e.code === "Space") {
    e.preventDefault();
    if (e.repeat) return;
    if (S.animerar) hoppaOverAnimation();
    else huvudKlick();
  } else if (k === "a") {
    S.ljud.lasUpp();
    S.transport.skicka({ t: "installningar", auto: !S.vy.inst.auto });
  } else if (k === "m") {
    S.ljud.lasUpp();
    S.ljud.satt(!S.ljud.pa);
    uppdateraKontroller();
  } else if (k === "p") {
    if (S.vy && S.vy.match && S.vy.match.steg === "fraga") S.transport.skicka({ t: S.vy.match.pausad ? "fortsatt" : "pausa" });
  } else if (k === "h") {
    visaKontroller($("kontroller").hidden);
  } else if (k === "f") {
    vaxlaFullskarm();
  }
}

start();
