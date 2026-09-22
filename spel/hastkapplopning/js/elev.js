/* =====================================================================
   elev.js – elevvyn (mobil först, 360–430 px, även Chromebook)
   ===================================================================== */
import { HASTRACE_API } from "./config.js";
import { AVATARER, avatarNamn } from "./engine.js";
import { avatarSvg } from "./avatars.js";
import { skapaTransport, rumFinns } from "./transport.js";
import { el, tom, param, lagra, lasa, sek, meddela, statusText } from "./ui.js";

const $ = (id) => document.getElementById(id);
const BOKSTAV = ["A", "B", "C", "D"];
const FORM = ["▲", "●", "■", "◆"];
const MEDALJ = { 1: "🥇", 2: "🥈", 3: "🥉" };

const S = {
  kod: null,
  lage: "server",
  transport: null,
  vy: null,
  offset: 0,
  nyckel: null,
  typ: null,
  harHaftJag: false,
  visaLagval: false,
  autoHej: false,
  namn: null,
  timer: null,
  valSkickat: null,
  status: "ansluter",
};
window.__hkElev = S;

function fel(text) {
  const f = $("fel");
  f.textContent = text || "";
  f.hidden = !text;
  clearTimeout(fel.t);
  if (text) fel.t = setTimeout(() => (f.hidden = true), 7000);
}

function statusUppdatera(s) {
  S.status = s;
  const c = $("statusChip");
  c.dataset.s = s;
  $("statusText").textContent = statusText(s);
}

function meddelandeVy(rubrik, ...barn) {
  const inn = tom($("innehall"));
  inn.append(el("h2", { tabindex: "-1", id: "vyRubrik" }, rubrik), ...barn);
  return inn;
}

async function start() {
  const kod = (param("rum") || "").toUpperCase();
  S.lage = param("lage") === "lokal" ? "lokal" : "server";
  if (!/^[A-Z0-9]{4}$/.test(kod)) {
    visaKodfraga();
    return;
  }
  S.kod = kod;
  document.title = "Hästkapplöpning – elev – rum " + kod;
  if (S.lage === "server") {
    if (!HASTRACE_API) {
      statusUppdatera("stangd");
      meddelandeVy(
        "Servern är inte påslagen ännu",
        el("p", null, "Spelservern har inte kopplats in på den här sidan än, så det går inte att ansluta från din enhet. Be läraren om hjälp."),
        el("p", { klass: "liten" }, "Om läraren kör Lokalt läge eller Demoläge i samma webbläsare kan du prova så här:"),
        el("a", { klass: "kbtn", href: "elev.html?rum=" + encodeURIComponent(kod) + "&lage=lokal" }, "Anslut i lokalt läge")
      );
      return;
    }
    try {
      const finns = await rumFinns(HASTRACE_API, kod);
      if (!finns) {
        statusUppdatera("rum_saknas");
        meddelandeVy("Rummet finns inte", el("p", null, "Rumskoden " + kod + " finns inte, eller så har rummet stängts. Kontrollera koden på lärarens skärm."), el("a", { klass: "kbtn primar", href: "./" }, "Ange en annan kod"));
        return;
      }
    } catch (e) {
      statusUppdatera("stangd");
      meddelandeVy("Kunde inte nå servern", el("p", null, "Kontrollera nätverket och försök igen."), el("button", { type: "button", klass: "kbtn primar", onclick: () => location.reload() }, "Försök igen"));
      return;
    }
  }
  const sparad = lasa("hk-elev-" + kod);
  if (sparad && sparad.spelarId) {
    S.namn = sparad.namn;
    S.spelarId = sparad.spelarId;
  }
  S.transport = skapaTransport({ lage: S.lage, roll: "elev", kod, api: HASTRACE_API, spelarId: S.spelarId });
  S.transport.onstatus = (s) => {
    statusUppdatera(s);
    if (s === "rum_saknas") {
      meddelandeVy("Rummet finns inte längre", el("p", null, "Läraren har stängt rummet, eller så har det gått ut."), el("a", { klass: "kbtn primar", href: "./" }, "Till startsidan"));
    }
  };
  S.transport.onvy = nyVy;
  S.transport.onfel = (f) => {
    fel(f.text || f.fel);
    S.valSkickat = null;
    if (S.vy) rendera();
  };
  S.transport.onvalkommen = (m) => {
    S.spelarId = m.spelarId;
    if (S.namn) lagra("hk-elev-" + kod, { spelarId: m.spelarId, namn: S.namn });
  };
  S.transport.starta();
  if (S.lage === "lokal") {
    $("rubrik").textContent = "Hästkapplöpning (lokalt läge)";
  }
}

function visaKodfraga() {
  statusUppdatera("stangd");
  const inn = meddelandeVy("Ange rumskod");
  const inp = el("input", { type: "text", id: "kodIn", maxlength: "4", size: "6", autocomplete: "off", autocapitalize: "characters", stil: "text-transform:uppercase;letter-spacing:0.2em;font-weight:800" });
  inn.append(
    el(
      "form",
      {
        onsubmit: (e) => {
          e.preventDefault();
          const k = inp.value.trim().toUpperCase();
          if (/^[A-Z0-9]{4}$/.test(k)) location.href = "elev.html?rum=" + encodeURIComponent(k) + (S.lage === "lokal" ? "&lage=lokal" : "");
          else fel("Skriv rumskoden med fyra tecken.");
        },
      },
      el("label", { klass: "falt", for: "kodIn" }, "Rumskod (står på lärarens skärm)"),
      el("div", { klass: "rad" }, inp, el("button", { type: "submit", klass: "kbtn primar" }, "Gå med"))
    )
  );
}

function nyVy(vy) {
  S.vy = vy;
  S.offset = vy.nu - Date.now();
  if (vy.jag) S.harHaftJag = true;
  if (!vy.jag && S.namn && !S.harHaftJag && !S.autoHej) {
    // Återanslutning där servern inte känner igen id:t (t.ex. nytt rum): gå med igen med sparat namn
    S.autoHej = true;
    S.transport.skicka({ t: "hej", namn: S.namn });
  }
  rendera();
}

/* ---------- lagremsa ---------- */
function byggLagremsa(vy) {
  const r = tom($("lagremsa"));
  if (!vy.jag || !vy.jag.lag) return;
  const l = vy.lag.find((x) => x.id === vy.jag.lag);
  if (!l) return;
  const namn = l.medlemmar.map((m) => m.namn + (m.jag ? " (du)" : "") + (m.ansluten ? "" : " (frånkopplad)"));
  r.append(
    el(
      "div",
      { klass: "lagremsa" },
      avatarSvg(l.id, { dekor: true }),
      el("div", null, el("div", { klass: "lagnamn" }, "Lag " + l.namn), el("div", { klass: "medlemmar" }, namn.join(", ")))
    )
  );
}

/* ---------- rendering ---------- */
function vyTyp(vy) {
  if (!vy.jag) return "gaMed";
  if (vy.fas === "slut") return "slut";
  if (!vy.jag.lag || S.visaLagval) return "valjLag";
  if (vy.fas === "lobby") return "lobby";
  const m = vy.match;
  if (!m) return "lobby";
  return "match-" + m.steg + "-" + (m.fraga ? m.fraga.nr : 0) + "-" + (m.mittSvar ? m.mittSvar.val : "x") + "-" + (m.pausad ? "p" : "");
}

function rendera() {
  const vy = S.vy;
  if (!vy) return;
  byggLagremsa(vy);
  const typ = vyTyp(vy);
  const medl = JSON.stringify(vy.lag.map((l) => [l.id, l.medlemmar.map((m) => m.namn + (m.jag ? "*" : "") + (m.ansluten ? "" : "-"))]));
  const nyckel = typ + (typ === "valjLag" || typ === "lobby" || typ === "slut" || typ === "gaMed" ? "|" + medl + "|" + (vy.matchNr + "" + vy.fas) : "") + (vy.match && vy.match.pall ? "P" : "");
  if (nyckel === S.nyckel) {
    uppdateraLatt(vy);
    return;
  }
  const typByte = typ !== S.typ;
  S.nyckel = nyckel;
  S.typ = typ;
  clearInterval(S.timer);
  S.timer = null;
  if (typ === "gaMed") byggGaMed(vy);
  else if (typ === "valjLag") byggValjLag(vy);
  else if (typ === "lobby") byggLobby(vy);
  else if (typ === "slut") byggSlut(vy);
  else byggMatch(vy);
  if (typByte && typ !== "gaMed") {
    const h = $("vyRubrik");
    if (h) h.focus({ preventScroll: true });
  }
}

function uppdateraLatt(vy) {
  /* inget behövs för nyckelstabila vyer utom tid, som sköts av timern */
}

/* --- gå med (namn) --- */
function byggGaMed(vy) {
  const inn = tom($("innehall"));
  const kickad = S.harHaftJag;
  inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, kickad ? "Du har tagits bort ur rummet" : "Gå med i rum " + vy.kod));
  if (kickad) inn.append(el("p", { klass: "notis varning" }, "Läraren har tagit bort dig ur rummet. Du kan gå med igen om det var ett misstag."));
  const inp = el("input", { type: "text", id: "namnIn", maxlength: "20", autocomplete: "off", autocapitalize: "words", spellcheck: "false", "aria-describedby": "namnHjalp", value: S.namn || "" });
  const form = el(
    "form",
    {
      onsubmit: (e) => {
        e.preventDefault();
        const namn = inp.value.trim().replace(/\s+/g, " ");
        if (!namn) {
          fel("Skriv ditt förnamn eller smeknamn.");
          inp.focus();
          return;
        }
        S.namn = namn;
        S.harHaftJag = false;
        S.autoHej = true;
        S.transport.skicka({ t: "hej", namn });
      },
    },
    el("label", { klass: "falt", for: "namnIn" }, "Ditt förnamn eller smeknamn"),
    inp,
    el("p", { id: "namnHjalp", klass: "liten", stil: "margin-top:6px" }, "Använd inte ditt fullständiga namn. Bara bokstäver och siffror, högst 20 tecken."),
    el("button", { type: "submit", klass: "kbtn primar", stil: "width:100%;margin-top:8px" }, "Gå med")
  );
  inn.append(form);
  if (vy.antalSpelare !== undefined) inn.append(el("p", { klass: "liten", stil: "margin-top:12px" }, vy.antalSpelare + " elever i rummet just nu."));
}

/* --- välj lag --- */
function byggValjLag(vy) {
  const inn = tom($("innehall"));
  const minLag = vy.jag.lag;
  inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, minLag ? "Byt lag" : "Välj lag"));
  inn.append(el("p", { klass: "liten" }, "Hej " + vy.jag.namn + "! " + (vy.fas === "lobby" ? "Starta ett ledigt lag eller gå med i ett lag som redan finns. Ni väljer varsitt djur, och varje djur kan bara vara ett lag." : "Matchen pågår. Du kan gå med i ett lag som redan finns.")));
  const lista = el("ul", { klass: "lagrutnat" });
  const kanStarta = vy.fas === "lobby" && vy.lag.length < vy.maxLag;
  const kanGaMed = vy.fas !== "slut";
  for (const a of AVATARER) {
    const l = vy.lag.find((x) => x.id === a.id);
    const upptagen = !!l;
    const mitt = minLag === a.id;
    const medl = upptagen ? l.medlemmar.map((m) => m.namn + (m.jag ? " (du)" : "")).join(", ") : "";
    let knapp = null;
    if (mitt) knapp = el("span", { klass: "stat" }, "✓ Ert lag");
    else if (upptagen && kanGaMed && (!minLag || vy.fas === "lobby")) knapp = el("button", { type: "button", klass: "kbtn primar", onclick: () => valjLag(a.id) }, "Gå med i laget " + a.namn);
    else if (!upptagen && kanStarta) knapp = el("button", { type: "button", klass: "kbtn", onclick: () => valjLag(a.id) }, "Starta lag " + a.namn);
    else knapp = el("span", { klass: "liten" }, upptagen ? "Inte möjligt just nu" : "Går inte att starta nu");
    lista.append(
      el(
        "li",
        { klass: "lagkort", "data-upptagen": upptagen ? "ja" : "nej", "data-mitt": mitt ? "ja" : "nej" },
        avatarSvg(a.id, { dekor: true }),
        el("span", { klass: "namn" }, a.namn),
        el("span", { klass: "stat" }, upptagen ? "Upptaget (" + l.medlemmar.length + ")" : "Ledigt"),
        el("span", { klass: "medl" }, upptagen ? medl : ""),
        knapp
      )
    );
  }
  inn.append(lista);
  if (minLag) inn.append(el("button", { type: "button", klass: "kbtn", onclick: () => { S.visaLagval = false; rendera(); } }, "← Tillbaka till mitt lag"));
}

function valjLag(id) {
  S.visaLagval = false;
  S.transport.skicka({ t: "valj_lag", lag: id });
  meddela("live", "Valde laget " + avatarNamn(id));
}

/* --- lobby --- */
function byggLobby(vy) {
  const inn = tom($("innehall"));
  inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, vy.matchNr === 0 ? "Väntar på att spelet ska starta" : "Väntar på match " + (vy.matchNr + 1)));
  inn.append(el("p", null, vy.matchNr === 0 ? "Läraren startar första matchen snart. Ni kan byta lag tills matchen har börjat." : "Nästa match börjar snart. Ni behåller laget."));
  if (vy.historik.length) inn.append(poangLista(vy));
  inn.append(el("button", { type: "button", klass: "kbtn", onclick: () => { S.visaLagval = true; rendera(); } }, "Byt lag"));
  if (vy.antalUtanLag > 0) inn.append(el("p", { klass: "liten", stil: "margin-top:10px" }, vy.antalUtanLag + " elever har inte valt lag än."));
}

function poangLista(vy) {
  const rader = vy.lag.slice().sort((a, b) => b.poang - a.poang || b.totalSteg - a.totalSteg);
  const ul = el("ul", { klass: "stallning", "aria-label": "Poängställning" });
  for (const l of rader) {
    ul.append(el("li", { "data-mitt": vy.jag.lag === l.id ? "ja" : "nej" }, avatarSvg(l.id, { dekor: true }), l.namn + (vy.jag.lag === l.id ? " (ni)" : ""), el("span", { klass: "steg" }, l.poang + " p")));
  }
  return ul;
}

function stallningsremsa(vy) {
  const m = vy.match;
  const rader = vy.lag.slice().sort((a, b) => (m.pos[b.id] || 0) - (m.pos[a.id] || 0));
  const ul = el("ul", { klass: "stallning", "aria-label": "Ställning på banan" });
  for (const l of rader) {
    ul.append(el("li", { "data-mitt": vy.jag.lag === l.id ? "ja" : "nej" }, avatarSvg(l.id, { dekor: true }), l.namn + (vy.jag.lag === l.id ? " (ni)" : ""), el("span", { klass: "steg" }, (m.pos[l.id] || 0) + " av " + m.banlangd)));
  }
  return ul;
}

/* --- match --- */
function alternativLista(vy, lage) {
  const m = vy.match;
  const f = m.fraga;
  const lista = el("ul", { klass: "alt-lista" });
  f.alternativ.forEach((text, i) => {
    let val = "";
    let markering = "";
    let arVald = m.mittSvar && m.mittSvar.val === i;
    if (lage === "avslojad") {
      const r = m.resultat;
      const mitt = r.lag[vy.jag.lag];
      arVald = mitt && mitt.svarade && mitt.val === i;
      if (f.ratt === i) {
        val = "ratt";
        markering = "✓ Rätt svar";
      } else if (arVald) {
        val = "fel";
        markering = "✗ Ert svar";
      }
    } else if (arVald) {
      val = "vald";
      markering = "🔒 Ert svar";
    }
    const b = el(
      "button",
      {
        type: "button",
        klass: "alt",
        "data-i": String(i),
        "data-val": val,
        disabled: lage !== "fraga" ? true : null,
        "aria-label": BOKSTAV[i] + ": " + text + (markering ? ". " + markering.replace(/^[^\wåäöÅÄÖ]+/, "") : ""),
        onclick: () => svara(i),
      },
      el("span", { klass: "form", "aria-hidden": "true" }, FORM[i]),
      el("span", { klass: "bokstav", "aria-hidden": "true" }, BOKSTAV[i]),
      el("span", { klass: "atextblock" }, el("span", { klass: "atext" }, text), markering ? el("span", { klass: "markering", "aria-hidden": "true" }, markering) : null)
    );
    lista.append(el("li", null, b));
  });
  return lista;
}

function svara(i) {
  if (S.valSkickat !== null) return;
  S.valSkickat = i;
  document.querySelectorAll("button.alt").forEach((b) => b.setAttribute("disabled", ""));
  S.transport.skicka({ t: "svara", val: i });
  const st = $("lastStatus");
  if (st) st.textContent = "Skickar svar …";
}

function tidsrad(vy) {
  const f = vy.match.fraga;
  const t = el("div", { klass: "tid", id: "tidrad", "data-lag": "nej" }, el("span", { id: "tidText" }, ""), el("div", { klass: "stapel", "aria-hidden": "true" }, el("span", { id: "tidFyll" })));
  const uppdatera = () => {
    const vy2 = S.vy;
    if (!vy2 || !vy2.match || vy2.match.steg !== "fraga") return;
    if (vy2.match.pausad) {
      $("tidText").textContent = "Pausad";
      return;
    }
    const kvar = f.slut - (Date.now() + S.offset);
    $("tidText").textContent = "Tid kvar: " + sek(kvar) + " s";
    $("tidFyll").style.width = Math.max(0, Math.min(100, (kvar / f.svarstidMs) * 100)) + "%";
    $("tidrad").dataset.lag = kvar <= 5000 ? "ja" : "nej";
    if (kvar <= 0) {
      const st = $("lastStatus");
      if (st && !vy2.match.mittSvar) st.textContent = "Tiden är slut – väntar på resultatet …";
    }
  };
  S.timer = setInterval(uppdatera, 200);
  setTimeout(uppdatera, 0);
  return t;
}

function byggMatch(vy) {
  const m = vy.match;
  const inn = tom($("innehall"));
  S.valSkickat = null;
  if (m.steg === "vantar") {
    inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, "Match " + (m.nr + 1) + ": " + m.namn.replace(/^Match \d+ – /, "")));
    inn.append(el("p", null, "Nästa fråga kommer snart. Gör er redo!"));
    inn.append(stallningsremsa(vy));
    return;
  }
  const f = m.fraga;
  if (m.steg === "fraga") {
    const reserv = f.nr > m.antalOrdinarie;
    inn.append(
      el(
        "div",
        { klass: "fragakort" },
        el("p", { klass: "fraganr" }, "Match " + (m.nr + 1) + " · fråga " + f.nr + " av " + (reserv ? m.antalTotal : m.antalOrdinarie) + (reserv ? " (reserv)" : "")),
        el("h2", { klass: "fragetext", id: "vyRubrik", tabindex: "-1" }, f.text)
      )
    );
    inn.append(tidsrad(vy));
    inn.append(alternativLista(vy, m.mittSvar ? "last" : "fraga"));
    if (m.mittSvar) {
      const b = BOKSTAV[m.mittSvar.val];
      inn.append(el("p", { klass: "last", id: "lastStatus", role: "status" }, "🔒 Svar låst: " + b + (m.mittSvar.jag ? "" : " (av " + m.mittSvar.av + ")") + " – väntar på de andra …"));
    } else {
      inn.append(el("p", { klass: "liten", id: "lastStatus", role: "status" }, "Första svaret från någon i laget gäller för hela laget."));
    }
    if (m.pausad) inn.append(el("p", { klass: "notis" }, "Spelet är pausat av läraren."));
    return;
  }
  if (m.steg === "avslojad") {
    const r = m.resultat;
    const mitt = r.lag[vy.jag.lag] || { svarade: false, ratt: false, steg: 0 };
    let klass, rubrik, rad;
    if (mitt.ratt) {
      klass = "ratt";
      rubrik = "✓ Rätt!";
      rad = mitt.rang === 1 ? "Ni blev nr 1 → +3 steg 🥇" : mitt.rang === 2 ? "Ni blev nr 2 → +2 steg 🥈" : "Ni svarade rätt, men " + (mitt.rang - 1) + " lag var snabbare → +1 steg 🥉";
      try {
        if (navigator.vibrate) navigator.vibrate(80);
      } catch (e) {}
    } else if (mitt.svarade) {
      klass = "fel";
      rubrik = "✗ Fel";
      rad = "Ert svar var " + BOKSTAV[mitt.val] + ". 0 steg.";
    } else {
      klass = "inget";
      rubrik = "– Inget svar";
      rad = "Ni hann inte svara. 0 steg.";
    }
    inn.append(el("h2", { id: "vyRubrik", tabindex: "-1", klass: "sr-only" }, "Resultat för fråga " + f.nr));
    inn.append(el("div", { klass: "fragakort" }, el("p", { klass: "fraganr" }, "Fråga " + f.nr), el("p", { klass: "fragetext", stil: "font-size:1.1rem" }, f.text)));
    inn.append(el("div", { klass: "resultat " + klass, role: "status" }, el("p", { klass: "stor" }, rubrik), el("p", { stil: "margin:0;font-weight:700" }, rad)));
    inn.append(el("p", { klass: "forklaring" }, el("strong", null, "Rätt svar: " + BOKSTAV[f.ratt] + ". "), f.forklaring || ""));
    inn.append(alternativLista(vy, "avslojad"));
    if (f.kalla) inn.append(el("p", { klass: "kalla" }, "Källa: " + f.kalla));
    if (m.klar) inn.append(el("p", { klass: "notis" }, m.vinnare ? "Matchen är avgjord! " + avatarNamn(m.vinnare) + " vann. Prispallen visas snart." : "Matchen är avgjord."));
    inn.append(el("h3", null, "Ställning"));
    inn.append(stallningsremsa(vy));
    return;
  }
  if (m.steg === "pall") {
    inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, "Prispall – " + m.namn.replace(/^Match \d+ – /, "")));
    const mittRad = m.pall.find((r) => r.lag === vy.jag.lag);
    if (mittRad) inn.append(el("p", { klass: "notis" }, "Ni kom på plats " + mittRad.plats + " och får " + mittRad.poang + " poäng."));
    const ol = el("ol", { klass: "pallista" });
    for (const r of m.pall) {
      ol.append(
        el(
          "li",
          { "data-mitt": r.lag === vy.jag.lag ? "ja" : "nej" },
          el("span", { klass: "medalj", "aria-hidden": "true" }, MEDALJ[r.plats] || String(r.plats)),
          avatarSvg(r.lag, { dekor: true }),
          el("span", { klass: "info" }, el("strong", null, r.plats + ". " + avatarNamn(r.lag) + (r.lag === vy.jag.lag ? " (ni)" : "")), el("small", null, r.steg + " av " + m.banlangd + " steg · +" + r.poang + " poäng"))
        )
      );
    }
    inn.append(ol);
    inn.append(el("p", { klass: "liten" }, "Väntar på att läraren går vidare …"));
  }
}

/* --- slut --- */
function byggSlut(vy) {
  const inn = tom($("innehall"));
  inn.append(el("h2", { id: "vyRubrik", tabindex: "-1" }, "Mästarpall – slutresultat"));
  const sp = vy.slutpall || [];
  const mitt = vy.jag.lag ? sp.find((r) => r.lag === vy.jag.lag) : null;
  if (mitt) inn.append(el("p", { klass: "notis" }, "Ni slutade på plats " + mitt.plats + " med " + mitt.poang + " poäng."));
  const ol = el("ol", { klass: "pallista" });
  for (const r of sp) {
    ol.append(
      el(
        "li",
        { "data-mitt": r.lag === vy.jag.lag ? "ja" : "nej" },
        el("span", { klass: "medalj", "aria-hidden": "true" }, MEDALJ[r.plats] || String(r.plats)),
        avatarSvg(r.lag, { dekor: true }),
        el("span", { klass: "info" }, el("strong", null, r.plats + ". " + avatarNamn(r.lag) + (r.lag === vy.jag.lag ? " (ni)" : "")), el("small", null, r.poang + " poäng · " + r.steg + " steg totalt"))
      )
    );
  }
  inn.append(ol);
  inn.append(el("p", null, "Tack för spelet!"));
}

start();
