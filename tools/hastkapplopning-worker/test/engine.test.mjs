// Enhetstester för spelmotorn. Kör: node --test tools/hastkapplopning-worker/test/
//
// Regel (22 sep 2026): ALLA medlemmar i ett lag måste svara, och alla måste
// svara RÄTT, för att laget ska räknas som klart på frågan. Lagets klar-tid
// = tidpunkten för dess SISTA medlems svar. Bland de lag som är klara
// rangordnas klar-tiden (tie-break: globalt svarsnummer för det avgörande
// svaret). Se engine.js huvudkommentar och OVERLAMNING.md.
import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../../../spel/hastkapplopning/js/engine.js";
import { blanda, fordelaGruppstorlekar, skapaSlumpadeLag } from "../../../spel/hastkapplopning/js/slumpa-lag.js";

const L = { roll: "larare" };
let T0 = 1_000_000;

function fraga(ratt = 1, nr = 1) {
  return { t: "nasta_fraga", fraga: "Fråga " + nr + "?", alternativ: ["a", "b", "c", "d"], ratt, forklaring: "Därför.", kalla: "Test" };
}

/* Skapar rum med n lag (ett lag per spelare) i lobbyn. Returnerar {rum, spel, lag}. */
function bygg(n, opts = {}) {
  const rum = E.nyttRum("ABCD", "nyckel", T0);
  const spel = [];
  for (let i = 0; i < n; i++) {
    const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "Elev" + i }, T0);
    assert.ok(h.ok, JSON.stringify(h));
    const a = { roll: "elev", spelarId: h.spelarId };
    const v = E.hantera(rum, a, { t: "valj_lag", lag: E.AVATARER[i].id }, T0);
    assert.ok(v.ok, JSON.stringify(v));
    spel.push(a);
  }
  if (opts.inst) assert.ok(E.hantera(rum, L, Object.assign({ t: "installningar" }, opts.inst), T0).ok);
  return { rum, spel, lag: (i) => E.AVATARER[i].id };
}

/* Lägger till ytterligare en spelare i ett befintligt lag (samma avatar). */
function gaMedILag(rum, namn, lagId, now) {
  const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn }, now);
  assert.ok(h.ok, JSON.stringify(h));
  const a = { roll: "elev", spelarId: h.spelarId };
  const v = E.hantera(rum, a, { t: "valj_lag", lag: lagId }, now);
  assert.ok(v.ok, JSON.stringify(v));
  return a;
}

function start(rum, nr = 0, ord = 8, tot = 12) {
  const r = E.hantera(rum, L, { t: "starta_match", nr, namn: "Match " + (nr + 1), antalMatcher: 3, antalOrdinarie: ord, antalTotal: tot }, T0);
  assert.ok(r.ok, JSON.stringify(r));
}

/* Ställer en fråga och låter spelare svara: svar = [[aktor, val, msEfterStart], …] */
let klocka = T0;
function kor(rum, ratt, svar, extra = {}) {
  klocka += 1000;
  const t0 = klocka;
  const r = E.hantera(rum, L, fraga(ratt, rum.match.fragaNr + 1), t0);
  assert.ok(r.ok, JSON.stringify(r));
  for (const [aktor, val, ms] of svar) {
    const s = E.hantera(rum, aktor, { t: "svara", val }, t0 + ms);
    assert.ok(s.ok, JSON.stringify(s));
  }
  if (rum.match.steg === "fraga") assert.ok(E.hantera(rum, L, { t: "visa_svar" }, t0 + (extra.visaEfter || 5000)).ok);
  klocka = t0 + 6000;
  return rum.match.resultat;
}

/* ---------- poängregeln (nya regeln) ---------- */

test("ensam i laget: avgörs direkt av den enda medlemmens svar, precis som förut", () => {
  const { rum, spel } = bygg(5);
  start(rum);
  // lag 0..4; rätt = 1. Lag0 fel, lag1 rätt sist, lag2 rätt först, lag3 rätt tvåa, lag4 uteblir
  const res = kor(rum, 1, [
    [spel[0], 2, 500],
    [spel[1], 1, 4000],
    [spel[2], 1, 1000],
    [spel[3], 1, 2000],
  ]);
  const l = (i) => res.lag[E.AVATARER[i].id];
  assert.equal(l(2).steg, 3);
  assert.equal(l(2).rang, 1);
  assert.equal(l(3).steg, 2);
  assert.equal(l(1).steg, 1);
  assert.equal(l(0).steg, 0);
  assert.equal(l(0).allaRatt, false);
  assert.equal(l(0).alltSvarat, true);
  assert.equal(l(4).steg, 0);
  assert.equal(l(4).alltSvarat, false);
  assert.equal(l(4).antalSvarat, 0);
  assert.deepEqual(rum.match.pos, { hast: 0, zebra: 1, tiger: 3, elefant: 2, kamel: 0 });
  assert.deepEqual(res.rorelser.map((r) => [r.steg, r.gnagg, r.lag.length]), [
    [3, "stor", 1],
    [2, "liten", 1],
    [1, null, 1],
  ]);
  assert.equal(res.rorelser[0].lag[0], E.AVATARER[2].id);
  assert.equal(rum.match.tre.tiger, 1);
});

test("flerpersonslag: laget klarar frågan bara när ALLA medlemmar svarat rätt", () => {
  const { rum, spel } = bygg(2); // hast, zebra
  const bo = gaMedILag(rum, "Bo", "hast", T0); // hast får en till medlem
  assert.equal(rum.lag.hast.medlemmar.length, 2);
  start(rum);
  // Fråga 1: Anna (spel[0]) rätt, Bo rätt → laget klart. Zebra (spel[1]) också rätt (ensam).
  let res = kor(rum, 1, [
    [spel[0], 1, 300],
    [bo, 1, 900],
    [spel[1], 1, 200],
  ]);
  assert.equal(res.lag.hast.alltSvarat, true);
  assert.equal(res.lag.hast.allaRatt, true);
  assert.equal(res.lag.hast.antalRatt, 2);
  // zebra svarade snabbare (200ms) men hast (klar-tid = Bos svar, 900ms) var ändå snabbare än ingen … kolla rang
  // zebra klar-tid = 200 (ensam), hast klar-tid = 900 → zebra rang 1, hast rang 2
  assert.equal(res.lag.zebra.rang, 1);
  assert.equal(res.lag.hast.rang, 2);
  assert.equal(res.lag.zebra.steg, 3);
  assert.equal(res.lag.hast.steg, 2);

  // Fråga 2: Anna rätt, Bo FEL → laget klarar inte frågan trots att Anna svarade rätt.
  res = kor(rum, 1, [
    [spel[0], 1, 300],
    [bo, 2, 900],
    [spel[1], 1, 200],
  ]);
  assert.equal(res.lag.hast.alltSvarat, true);
  assert.equal(res.lag.hast.allaRatt, false);
  assert.equal(res.lag.hast.antalRatt, 1);
  assert.equal(res.lag.hast.steg, 0);
  assert.equal(res.lag.zebra.allaRatt, true);
});

test("flerpersonslag: om inte alla hinner svara innan tiden går ut räknas laget som ofullständigt → 0 steg", () => {
  const { rum, spel } = bygg(2);
  const bo = gaMedILag(rum, "Bo", "hast", T0);
  start(rum);
  klocka += 1000;
  const t0 = klocka;
  E.hantera(rum, L, fraga(1), t0);
  const slut = rum.match.fraga.slut;
  // Bara Anna svarar (rätt); Bo hinner inte. Zebra svarar också rätt (ensam).
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, t0 + 300);
  E.hantera(rum, spel[1], { t: "svara", val: 1 }, t0 + 300);
  assert.equal(rum.match.steg, "fraga", "frågan får inte stängas – hast är inte klart (Bo har inte svarat)");
  assert.equal(E.tick(rum, slut), true);
  assert.equal(rum.match.steg, "avslojad");
  const r = rum.match.resultat;
  assert.equal(r.lag.hast.alltSvarat, false);
  assert.equal(r.lag.hast.antalSvarat, 1);
  assert.equal(r.lag.hast.allaRatt, false);
  assert.equal(r.lag.hast.steg, 0);
  assert.equal(r.lag.zebra.allaRatt, true);
  assert.equal(r.lag.zebra.steg, 3);
  // Bos sena svar (efter stängning – frågan är redan avslöjad) avvisas
  const sent = E.hantera(rum, bo, { t: "svara", val: 1 }, slut + 5);
  assert.equal(sent.ok, false);
  assert.equal(sent.fel, "ingen_fraga");
});

test("lärarens avslöjande (visa_svar) innan alla svarat ger samma resultat som tidsgräns: ofullständigt → 0", () => {
  const { rum, spel } = bygg(2);
  const bo = gaMedILag(rum, "Bo", "hast", T0);
  start(rum);
  klocka += 1000;
  const t0 = klocka;
  E.hantera(rum, L, fraga(1), t0);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, t0 + 300); // Anna rätt
  E.hantera(rum, spel[1], { t: "svara", val: 1 }, t0 + 100); // zebra rätt (ensam, klar direkt)
  assert.equal(rum.match.steg, "fraga", "hast väntar fortfarande på Bo");
  assert.ok(E.hantera(rum, L, { t: "visa_svar" }, t0 + 2000).ok);
  assert.equal(rum.match.steg, "avslojad");
  const r = rum.match.resultat;
  assert.equal(r.lag.hast.alltSvarat, false);
  assert.equal(r.lag.hast.steg, 0);
  assert.equal(r.lag.zebra.steg, 3);
});

test("elevbyte av lag mitt i match: gamla regeln gäller oförändrad (nekas), nykomling kan gå med i befintligt lag och räknas som medlem direkt", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "Sen" }, T0 + 1100);
  const sen = { roll: "elev", spelarId: h.spelarId };
  assert.equal(E.hantera(rum, sen, { t: "valj_lag", lag: "kanin" }, T0 + 1150).fel, "nytt_lag_last");
  assert.ok(E.hantera(rum, sen, { t: "valj_lag", lag: "zebra" }, T0 + 1200).ok);
  assert.equal(rum.lag.zebra.medlemmar.length, 2);
  // Zebra (spel[1]) svarar rätt men "Sen" måste också svara innan zebra räknas klart.
  assert.ok(E.hantera(rum, spel[1], { t: "svara", val: 1 }, T0 + 1300).ok);
  assert.equal(rum.match.steg, "fraga");
  assert.ok(E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 1400).ok); // hast
  assert.ok(E.hantera(rum, spel[2], { t: "svara", val: 1 }, T0 + 1500).ok); // tiger
  assert.equal(rum.match.steg, "fraga", "väntar fortfarande på Sen i zebra-laget");
  assert.ok(E.hantera(rum, sen, { t: "svara", val: 1 }, T0 + 1600).ok);
  assert.equal(rum.match.steg, "avslojad", "alla lag klara nu");
  assert.equal(rum.match.resultat.lag.zebra.allaRatt, true);
  // byte av lag under match nekas fortfarande (samma regel som förut)
  assert.equal(E.hantera(rum, sen, { t: "valj_lag", lag: "tiger" }, T0 + 3000).fel, "lagbyte_last");
  assert.equal(E.hantera(rum, sen, { t: "lamna_lag" }, T0 + 3000).fel, "lagbyte_last");
});

test("läraren tar bort en fastnad medlem mitt i matchen: laget kan sedan klara frågor igen med resterande medlemmar", () => {
  const { rum, spel } = bygg(2);
  const bo = gaMedILag(rum, "Bo", "hast", T0);
  start(rum);
  // Bo "fastnar" (svarar aldrig) några frågor, men läraren tar bort honom ur rummet.
  assert.ok(E.hantera(rum, L, { t: "ta_bort_spelare", spelarId: bo.spelarId }, klocka).ok);
  assert.equal(rum.lag.hast.medlemmar.length, 1);
  const res = kor(rum, 1, [
    [spel[0], 1, 300],
    [spel[1], 1, 200],
  ]);
  assert.equal(res.lag.hast.alltSvarat, true);
  assert.equal(res.lag.hast.allaRatt, true);
  assert.equal(res.lag.hast.antalMedlemmar, 1);
});

test("tomt lag (alla medlemmar borttagna mitt i matchen) räknas aldrig som klart", () => {
  const { rum, spel } = bygg(2);
  start(rum);
  assert.ok(E.hantera(rum, L, { t: "ta_bort_spelare", spelarId: spel[0].spelarId }, klocka).ok);
  assert.equal(rum.lag.hast.medlemmar.length, 0);
  const res = kor(rum, 1, [[spel[1], 1, 200]]);
  assert.equal(res.lag.hast.antalMedlemmar, 0);
  assert.equal(res.lag.hast.alltSvarat, false);
  assert.equal(res.lag.hast.steg, 0);
  assert.equal(res.lag.zebra.steg, 3);
});

test("tie-break vid exakt samma klar-tid (millisekund): globalt svarsnummer för det avgörande svaret avgör", () => {
  const { rum, spel } = bygg(4);
  const bo = gaMedILag(rum, "Bo", "hast", T0); // hast: Anna(spel0)+Bo, 2 medlemmar
  start(rum);
  klocka += 1000;
  const t0 = klocka;
  E.hantera(rum, L, fraga(2), t0);
  // hast klar-tid ska bli exakt samma millisekund som zebra (ensam), men hasts avgörande
  // svar (Bo, det andra) ska ha ett HÖGRE globalt svarsnummer eftersom det skickas efter.
  E.hantera(rum, spel[0], { t: "svara", val: 2 }, t0 + 500); // Anna (hast) – svarsnummer 1
  E.hantera(rum, spel[1], { t: "svara", val: 2 }, t0 + 500); // zebra (ensam, klar) – svarsnummer 2, klar-tid 500
  E.hantera(rum, bo, { t: "svara", val: 2 }, t0 + 500); // Bo (hast, avgörande) – svarsnummer 3, klar-tid 500
  E.hantera(rum, spel[2], { t: "svara", val: 2 }, t0 + 500); // tiger (ensam) – svarsnummer 4, klar-tid 500
  assert.ok(E.hantera(rum, L, { t: "visa_svar" }, t0 + 5000).ok);
  const r = rum.match.resultat;
  // Alla tre klar-tider är 500 ms. Avgörande svarsnummer: zebra=2, hast=3, tiger=4 → zebra < hast < tiger.
  assert.equal(r.lag.zebra.rang, 1);
  assert.equal(r.lag.hast.rang, 2);
  assert.equal(r.lag.tiger.rang, 3);
});

test("frågan stängs så snart alla AKTIVA lag är klara (alla medlemmar svarat, oavsett rätt/fel)", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 1100);
  E.hantera(rum, spel[1], { t: "svara", val: 2 }, T0 + 1200); // fel svar räcker för att laget ska räknas "klart" (men inte "rätt")
  assert.equal(rum.match.steg, "fraga");
  E.hantera(rum, spel[2], { t: "svara", val: 0 }, T0 + 1300);
  assert.equal(rum.match.steg, "avslojad");
});

test("tiden går ut: tick stänger frågan, sena svar avvisas (serverns tid avgör)", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  const slut = rum.match.fraga.slut;
  assert.equal(E.nastaTidpunkt(rum), slut);
  assert.equal(slut, T0 + 1000 + 20000);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, slut - 1);
  assert.equal(E.tick(rum, slut - 1), false);
  assert.equal(E.tick(rum, slut), true);
  assert.equal(rum.match.steg, "avslojad");
  const sent = E.hantera(rum, spel[1], { t: "svara", val: 1 }, slut + 5);
  assert.equal(sent.ok, false);
  assert.equal(rum.match.resultat.lag.hast.steg, 3);
  assert.equal(rum.match.resultat.lag.zebra.alltSvarat, false);
  assert.equal(rum.match.resultat.lag.zebra.antalSvarat, 0);
});

test("en och samma spelare kan inte svara två gånger på samma fråga", () => {
  const { rum, spel } = bygg(2);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  assert.ok(E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 1100).ok);
  const igen = E.hantera(rum, spel[0], { t: "svara", val: 0 }, T0 + 1200);
  assert.equal(igen.ok, false);
  assert.equal(igen.fel, "redan_svarat");
});

test("pausa stoppar klockan och fortsätt flyttar sluttiden", () => {
  const { rum, spel } = bygg(2);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  assert.ok(E.hantera(rum, L, { t: "pausa" }, T0 + 5000).ok);
  assert.equal(E.nastaTidpunkt(rum), null);
  assert.equal(E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 6000).fel, "pausad");
  assert.equal(E.tick(rum, T0 + 100000), false);
  assert.ok(E.hantera(rum, L, { t: "fortsatt" }, T0 + 35000).ok);
  assert.equal(rum.match.fraga.slut, T0 + 1000 + 20000 + 30000);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 36000);
  assert.equal(rum.match.svar[spel[0].spelarId].tidMs, 5000); // 4 s före pausen + 1 s efter
});

test("målpassage: den som först passerar mållinjen i uppspelad ordning vinner; övriga förflyttningar spelas färdigt", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  start(rum);
  const id = (i) => E.AVATARER[i].id;
  Object.assign(rum.match.pos, { hast: 8, zebra: 9, tiger: 5, elefant: 9 });
  const res = kor(rum, 3, [
    [spel[3], 3, 500],
    [spel[0], 3, 900],
    [spel[1], 3, 1200],
    [spel[2], 3, 1500],
  ]);
  assert.equal(rum.match.vinnare, id(3));
  assert.equal(rum.match.vinnarTyp, "mal");
  assert.equal(res.malNadd, id(3));
  assert.equal(rum.match.pos.hast, 10);
  assert.equal(rum.match.pos.zebra, 10);
  assert.equal(rum.match.pos.tiger, 6);
  assert.equal(rum.match.pos.elefant, 10);
  assert.equal(rum.match.klar, true);
  assert.equal(rum.match.steg, "avslojad");
  assert.equal(E.hantera(rum, L, fraga(0), klocka + 10).fel, "match_klar");
});

test("mål: i 1-stegsgruppen avgör snabbhetsordningen vem som passerar först", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  start(rum);
  Object.assign(rum.match.pos, { hast: 0, zebra: 0, tiger: 9, elefant: 9 });
  kor(rum, 0, [
    [spel[0], 0, 100],
    [spel[1], 0, 200],
    [spel[3], 0, 300],
    [spel[2], 0, 400],
  ]);
  assert.equal(rum.match.vinnare, "elefant");
});

test("reservfrågor: matchen fortsätter efter ordinarie frågor om ingen är i mål; avgörs på ledning efter 12", () => {
  const { rum, spel } = bygg(3, { inst: { banlangd: 30 } });
  start(rum, 0, 8, 12);
  for (let q = 1; q <= 12; q++) {
    const ordning = [0, 1, 2].map((i) => (i + q) % 3);
    kor(rum, 0, ordning.map((lagIx, rang) => [spel[lagIx], 0, 500 + rang * 400 + (lagIx === 0 ? 0 : 10)]));
    if (q < 12) assert.equal(rum.match.klar, false, "ingen i mål efter fråga " + q);
    if (q === 8) assert.equal(E.vyFor(rum, L, klocka).match.reserv, true, "fråga 9–12 är reservfrågor");
  }
  assert.equal(rum.match.fragaNr, 12);
  assert.equal(rum.match.klar, true);
  assert.equal(rum.match.vinnarTyp, "ledning");
  assert.deepEqual(Object.values(rum.match.pos), [24, 24, 24]);
  assert.deepEqual(Object.values(rum.match.tre), [4, 4, 4]);
  assert.equal(rum.match.vinnare, "hast", "lika steg och lika 3-poängare → lägst sammanlagd svarstid");
  assert.equal(E.hantera(rum, L, fraga(0), klocka + 10).fel, "match_klar");
});

test("reservfrågor: mål nås redan efter 10 frågor → vinnare 'mal'", () => {
  const { rum, spel } = bygg(2, { inst: { banlangd: 30 } });
  start(rum, 0, 8, 12);
  for (let q = 1; q <= 10; q++)
    kor(rum, 0, [
      [spel[0], 0, 500],
      [spel[1], 0, 900],
    ]);
  assert.equal(rum.match.klar, true);
  assert.equal(rum.match.vinnarTyp, "mal");
  assert.equal(rum.match.fragaNr, 10);
});

test("tie-break i matchen: steg → flest 3-poängare → lägst sammanlagd svarstid → lagets ordning", () => {
  const { rum } = bygg(4, { inst: { banlangd: 30 } });
  start(rum);
  const mt = rum.match;
  mt.klar = true;
  Object.assign(mt.pos, { hast: 6, zebra: 6, tiger: 6, elefant: 6 });
  Object.assign(mt.tre, { hast: 1, zebra: 2, tiger: 2, elefant: 2 });
  Object.assign(mt.tid, { hast: 1000, zebra: 9000, tiger: 8000, elefant: 8000 });
  assert.deepEqual(E.rangordnaMatch(rum), ["tiger", "elefant", "zebra", "hast"]);
  mt.pos.hast = 7;
  assert.equal(E.rangordnaMatch(rum)[0], "hast");
  mt.vinnare = "zebra";
  assert.equal(E.rangordnaMatch(rum)[0], "zebra");
});

test("prispall, matchpoäng, lag och medlemmar består, slutpall efter match 3", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  const kandaMedlemmar = JSON.stringify(rum.lag);
  const vinnare = [0, 2, 0];
  for (let m = 0; m < 3; m++) {
    start(rum, m, 8, 12);
    const v = vinnare[m];
    let guard = 0;
    while (!rum.match.klar && guard++ < 12) {
      const svar = [[spel[v], 0, 300]];
      const andra = [0, 1, 2, 3].filter((x) => x !== v);
      svar.push([spel[andra[0]], 0, 800]);
      svar.push([spel[andra[1]], 1, 900]);
      kor(rum, 0, svar);
    }
    assert.equal(rum.match.vinnare, E.AVATARER[v].id);
    assert.ok(E.hantera(rum, L, { t: "till_pall" }, klocka).ok);
    const pall = rum.match.pall;
    assert.equal(pall[0].lag, E.AVATARER[v].id);
    assert.deepEqual(pall.map((r) => r.poang), [3, 2, 1, 0]);
    assert.deepEqual(pall.map((r) => r.plats), [1, 2, 3, 4]);
    assert.ok(E.hantera(rum, L, { t: "nasta_match" }, klocka).ok);
    assert.equal(rum.match, null);
    if (m < 2) {
      assert.equal(rum.fas, "lobby");
      assert.equal(rum.matchNr, m + 1);
      assert.equal(JSON.stringify(rum.lag), kandaMedlemmar, "lag och medlemmar består");
    }
  }
  assert.equal(rum.fas, "slut");
  assert.equal(rum.historik.length, 3);
  const summa = Object.values(rum.poang).reduce((a, b) => a + b, 0);
  assert.equal(summa, 3 * (3 + 2 + 1));
  const sp = rum.slutpall;
  assert.equal(sp.length, 4);
  assert.ok(sp[0].poang >= sp[1].poang && sp[1].poang >= sp[2].poang);
  assert.equal(sp[0].lag, "hast");
  const r = E.hantera(rum, L, { t: "ny_omgang" }, klocka);
  assert.ok(r.ok);
  assert.equal(rum.fas, "lobby");
  assert.equal(rum.matchNr, 0);
  assert.equal(JSON.stringify(rum.lag), kandaMedlemmar);
  assert.ok(Object.values(rum.poang).every((x) => x === 0));
  start(rum, 0);
  assert.ok(Object.values(rum.match.pos).every((x) => x === 0));
});

test("slutpall: tie-break på totala steg", () => {
  const rum = E.nyttRum("ABCD", "k", T0);
  rum.lagordning = ["hast", "zebra", "tiger"];
  rum.poang = { hast: 5, zebra: 5, tiger: 4 };
  rum.totalSteg = { hast: 20, zebra: 30, tiger: 40 };
  rum.totalTid = { hast: 1, zebra: 1, tiger: 1 };
  assert.deepEqual(E.rangordnaSlut(rum), ["zebra", "hast", "tiger"]);
});

test("slutför match: avgörs på ledning; avbryt match ger inga poäng", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  kor(rum, 0, [
    [spel[1], 0, 100],
    [spel[0], 0, 300],
  ]);
  assert.ok(E.hantera(rum, L, { t: "slutfor_match" }, klocka).ok);
  assert.equal(rum.match.steg, "pall");
  assert.equal(rum.match.pall[0].lag, "zebra");
  assert.equal(rum.poang.zebra, 3);
  const { rum: r2 } = bygg(3);
  start(r2);
  assert.ok(E.hantera(r2, L, { t: "avbryt_match" }, klocka).ok);
  assert.equal(r2.fas, "lobby");
  assert.ok(Object.values(r2.poang).every((x) => x === 0));
});

test("återanslutning: samma spelarId tar tillbaka platsen; okänt id skapar ny spelare", () => {
  const { rum, spel } = bygg(2);
  const id = spel[0].spelarId;
  E.markeraAnsluten(rum, id, false);
  assert.equal(rum.spelare[id].ansluten, false);
  const r = E.hantera(rum, { roll: "gast" }, { t: "hej", spelarId: id }, T0 + 5);
  assert.ok(r.ok && r.aterAnsluten);
  assert.equal(r.spelarId, id);
  assert.equal(rum.spelare[id].ansluten, true);
  assert.equal(rum.spelare[id].lag, "hast");
  const okand = E.hantera(rum, { roll: "gast" }, { t: "hej", spelarId: "abcdefghijk", namn: "Nytt" }, T0 + 6);
  assert.ok(okand.ok && okand.ny);
  assert.notEqual(okand.spelarId, "abcdefghijk");
  const utanNamn = E.hantera(rum, { roll: "gast" }, { t: "hej", spelarId: "abcdefghijk" }, T0 + 7);
  assert.equal(utanNamn.ok, false);
});

test("lagbyte i lobbyn: tomt lag försvinner; ett lag per avatar; lag utan medlem tas bort", () => {
  const { rum, spel } = bygg(2);
  assert.ok(E.hantera(rum, spel[0], { t: "valj_lag", lag: "zebra" }, T0).ok);
  assert.equal(rum.lag.hast, undefined);
  assert.deepEqual(rum.lagordning, ["zebra"]);
  assert.equal(rum.lag.zebra.medlemmar.length, 2);
  assert.ok(E.hantera(rum, spel[0], { t: "lamna_lag" }, T0).ok);
  assert.equal(rum.spelare[spel[0].spelarId].lag, null);
  assert.equal(E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0).fel, "inget_lag");
});

test("för få lag: matchen startar inte", () => {
  const { rum } = bygg(1);
  const r = E.hantera(rum, L, { t: "starta_match", nr: 0, namn: "M", antalMatcher: 3, antalOrdinarie: 8, antalTotal: 12 }, T0);
  assert.equal(r.fel, "for_fa_lag");
});

test("lärarens ingripanden: flytta, ta bort spelare, ta bort lag – bara i lobbyn (spelare kan tas bort alltid)", () => {
  const { rum, spel } = bygg(3);
  const sid = spel[0].spelarId;
  assert.ok(E.hantera(rum, L, { t: "flytta_spelare", spelarId: sid, lag: "tiger" }, T0).ok);
  assert.equal(rum.lag.hast, undefined);
  assert.equal(rum.lag.tiger.medlemmar.length, 2);
  assert.ok(E.hantera(rum, L, { t: "flytta_spelare", spelarId: sid, lag: null }, T0).ok);
  assert.equal(rum.spelare[sid].lag, null);
  assert.ok(E.hantera(rum, L, { t: "ta_bort_lag", lag: "tiger" }, T0).ok);
  assert.equal(rum.lag.tiger, undefined);
  assert.ok(E.hantera(rum, L, { t: "ta_bort_spelare", spelarId: sid }, T0).ok);
  assert.equal(rum.spelare[sid], undefined);
  assert.equal(E.hantera(rum, spel[0], { t: "valj_lag", lag: "kanin" }, T0).fel, "okand_spelare");
  const b = bygg(3);
  start(b.rum);
  assert.equal(E.hantera(b.rum, L, { t: "flytta_spelare", spelarId: b.spel[0].spelarId, lag: null }, T0).fel, "bara_lobby");
  assert.equal(E.hantera(b.rum, L, { t: "ta_bort_lag", lag: "hast" }, T0).fel, "bara_lobby");
  assert.ok(E.hantera(b.rum, L, { t: "ta_bort_spelare", spelarId: b.spel[0].spelarId }, T0).ok);
  assert.ok(b.rum.lag.hast, "laget behåller sin plats i matchen även om det blir tomt");
  assert.equal(b.rum.lag.hast.medlemmar.length, 0);
});

test("behörighet: elever kan inte utföra lärarens åtgärder, gäster kan inget utom hej", () => {
  const { rum, spel } = bygg(2);
  for (const t of ["starta_match", "nasta_fraga", "visa_svar", "pausa", "nasta_match", "ny_omgang", "installningar", "slutfor_match", "ta_bort_spelare"]) {
    const r = E.hantera(rum, spel[0], { t, nr: 0 }, T0);
    assert.equal(r.ok, false, t);
    assert.equal(r.fel, "ej_behorig", t);
  }
  const g = E.hantera(rum, { roll: "gast" }, { t: "svara", val: 1 }, T0);
  assert.equal(g.ok, false);
  assert.equal(E.hantera(rum, L, { t: "hej", namn: "X" }, T0).fel, "ej_behorig");
});

test("ogiltig indata avvisas (typ, längd, tecken, intervall)", () => {
  const { rum, spel } = bygg(2);
  const g = { roll: "gast" };
  for (const namn of ["", "   ", "<b>x</b>", "a".repeat(21), 5, null, "Anna & Bo", 'Ann"a', "x\u0000y<script>"]) {
    const r = E.hantera(rum, g, { t: "hej", namn }, T0);
    assert.equal(r.ok, false, JSON.stringify(namn));
  }
  for (const namn of ["Åsa", "Jean-Luc", "O'Neil", "Anna 2", "Maja_K", "Zoë"]) assert.ok(E.hantera(rum, g, { t: "hej", namn }, T0).ok, namn);
  assert.equal(E.hantera(rum, g, { t: "hej", namn: "  Anna   Lisa  " }, T0).ok, true);
  assert.ok(Object.values(rum.spelare).some((s) => s.namn === "Anna Lisa"), "blanksteg normaliseras");
  assert.equal(E.hantera(rum, spel[0], { t: "valj_lag", lag: "drake" }, T0).ok, false);
  assert.equal(E.hantera(rum, spel[0], { t: "valj_lag", lag: 3 }, T0).ok, false);
  assert.equal(E.hantera(rum, spel[0], "text", T0).ok, false);
  assert.equal(E.hantera(rum, spel[0], null, T0).ok, false);
  assert.equal(E.hantera(rum, spel[0], [], T0).ok, false);
  assert.equal(E.hantera(rum, spel[0], { t: "okand" }, T0).fel, "okand_typ");
  assert.equal(E.hantera(rum, spel[0], { t: 7 }, T0).ok, false);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1);
  for (const val of [-1, 4, 1.5, "1", null, NaN, Infinity]) assert.equal(E.hantera(rum, spel[0], { t: "svara", val }, T0 + 5).ok, false, String(val));
  const bra = fraga(1);
  const dålig = [
    Object.assign({}, bra, { alternativ: ["a", "b", "c"] }),
    Object.assign({}, bra, { alternativ: ["a", "b", "c", 4] }),
    Object.assign({}, bra, { ratt: 4 }),
    Object.assign({}, bra, { ratt: "1" }),
    Object.assign({}, bra, { fraga: "x".repeat(301) }),
    Object.assign({}, bra, { alternativ: ["a", "b", "c", "d".repeat(121)] }),
    Object.assign({}, bra, { fraga: "" }),
  ];
  const b = bygg(2);
  start(b.rum);
  for (const q of dålig) assert.equal(E.hantera(b.rum, L, q, T0).ok, false, JSON.stringify(q).slice(0, 60));
  assert.equal(E.hantera(rum, L, { t: "installningar", svarstid_s: 5 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", svarstid_s: 61 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", banlangd: 31 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", auto: "ja" }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", slumpLage: "ja" }, T0).ok, false);
  assert.ok(E.hantera(rum, L, { t: "installningar", svarstid_s: 30, auto: true, visaAlternativ: true }, T0).ok);
  assert.equal(rum.inst.svarstid_s, 30);
  assert.equal(E.hantera(rum, L, { t: "installningar", banlangd: 20 }, T0).fel, "bara_lobby");
});

test("rumsgränser: 60 spelare och högst så många lag som djur", () => {
  const rum = E.nyttRum("ABCD", "k", T0);
  const spelare = [];
  for (let i = 0; i < 60; i++) {
    const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "S" + i }, T0);
    assert.ok(h.ok);
    spelare.push({ roll: "elev", spelarId: h.spelarId });
  }
  assert.equal(E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "En för mycket" }, T0).fel, "rum_fullt");
  spelare.forEach((s, i) => E.hantera(rum, s, { t: "valj_lag", lag: E.AVATARER[i % 10].id }, T0));
  assert.equal(rum.lagordning.length, 10);
  assert.ok(rum.lagordning.length <= 12);
});

test("vyer: rätt svar och förklaring läcker aldrig före avslöjandet; elever får inte andras id; lagStatus visar bara antal", () => {
  const { rum, spel } = bygg(3);
  const bo = gaMedILag(rum, "Bo", "hast", T0);
  start(rum);
  E.hantera(rum, L, fraga(2), T0 + 1000);
  E.hantera(rum, spel[0], { t: "svara", val: 3 }, T0 + 2000);
  for (const aktor of [L, spel[0], spel[1], { roll: "gast" }]) {
    const s = JSON.stringify(E.vyFor(rum, aktor, T0 + 3000));
    assert.ok(!s.includes('"ratt"'), "ratt får inte finnas i vyn under frågan");
    assert.ok(!s.includes("Därför"), "förklaringen får inte finnas i vyn under frågan");
    assert.ok(!s.includes("nyckel"), "lärarnyckeln läcker aldrig");
    assert.ok(!s.includes("antalRatt"), "antalRatt (per lag) får inte finnas förrän avslöjat – det skvallrar om facit");
  }
  const ev = E.vyFor(rum, spel[0], T0 + 3000);
  assert.deepEqual(ev.match.mittSvar, { val: 3 });
  assert.equal(E.vyFor(rum, spel[1], T0 + 3000).match.mittSvar, undefined);
  const sEv = JSON.stringify(ev);
  for (const s of spel) assert.ok(!sEv.includes(s.spelarId), "elevvyn innehåller inga spelar-id");
  assert.ok(!sEv.includes(bo.spelarId));
  // Anna (spel[0], i laget hast) ser att Bo (lagkompis) inte svarat än – men bara OM, aldrig VAD.
  const hastLag = ev.lag.find((l) => l.id === "hast");
  const boEntry = hastLag.medlemmar.find((m) => !m.jag);
  assert.equal(boEntry.svarat, false);
  // Anna ser INTE svarsstatusen för ett annat lag (zebra) i detalj.
  const zebraLag = ev.lag.find((l) => l.id === "zebra");
  assert.equal(zebraLag.medlemmar[0].svarat, undefined);
  // lagStatus (antal, för alla lag) är säkert att visa – inget facit
  assert.ok(Array.isArray(ev.match.lagStatus));
  const hastStatus = ev.match.lagStatus.find((x) => x.lag === "hast");
  assert.equal(hastStatus.antalSvarat, 1);
  assert.equal(hastStatus.antalMedlemmar, 2);
  const lv = E.vyFor(rum, L, T0 + 3000);
  assert.equal(lv.match.antalLag, 3);
  assert.equal(lv.match.resultat, undefined);
  // läraren ser svarsstatus för ALLA lags medlemmar (bara om, aldrig vad)
  const lvHast = lv.lag.find((l) => l.id === "hast");
  assert.equal(lvHast.medlemmar.find((m) => m.id === bo.spelarId).svarat, false);
  E.hantera(rum, bo, { t: "svara", val: 1 }, T0 + 3500);
  E.hantera(rum, spel[1], { t: "svara", val: 2 }, T0 + 3600);
  E.hantera(rum, spel[2], { t: "svara", val: 2 }, T0 + 3700);
  const efter = E.vyFor(rum, spel[0], T0 + 5000);
  assert.equal(efter.match.fraga.ratt, 2);
  assert.equal(efter.match.fraga.forklaring, "Därför.");
  assert.equal(efter.match.resultat.lag.hast.allaRatt, false, "Bo svarade fel (1 ≠ 2)");
  assert.equal(JSON.stringify(efter.match.resultat.lag).includes("zebra"), false, "eleven får bara sitt eget lags detaljer");
  assert.deepEqual(JSON.parse(JSON.stringify(efter)), efter);
});

test("tillståndet är ren JSON och kan återställas (Durable Object-evakuering)", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 1500);
  const kopia = JSON.parse(JSON.stringify(rum));
  E.hantera(kopia, spel[1], { t: "svara", val: 1 }, T0 + 1800);
  E.hantera(kopia, spel[2], { t: "svara", val: 0 }, T0 + 1900);
  assert.equal(kopia.match.steg, "avslojad");
  assert.equal(kopia.match.pos.hast, 3);
  assert.equal(kopia.match.pos.zebra, 2);
});

test("hastighetsbegränsare släpper igenom ett visst antal per tidsfönster", () => {
  const tb = E.nyTakbegransare(5, 1000);
  let ok = 0;
  for (let i = 0; i < 10; i++) if (E.tillat(tb, 100 + i)) ok++;
  assert.equal(ok, 5);
  assert.equal(E.tillat(tb, 2000), true);
});

test("rumskod: 4 tecken utan förväxlingsbara tecken", () => {
  for (let i = 0; i < 500; i++) {
    const k = E.slumpRumskod();
    assert.match(k, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
    assert.ok(!/[01OIL]/.test(k));
  }
  assert.ok(!E.arGiltigRumskod("AB0D"));
  assert.ok(E.arGiltigRumskod("A2C4"));
});

/* ---------- Slumpa lag (js/slumpa-lag.js) ---------- */

test("slumpa-lag: fördelar gruppstorlekar 2–3, undviker ensamma (utom n=1)", () => {
  for (let n = 2; n <= 40; n++) {
    const g = fordelaGruppstorlekar(n);
    assert.equal(g.reduce((a, b) => a + b, 0), n, "summan ska bli n=" + n);
    for (const storlek of g) assert.ok(storlek >= 2 && storlek <= 3, "n=" + n + ": grupp om " + storlek);
  }
  assert.deepEqual(fordelaGruppstorlekar(1), [1]);
  assert.deepEqual(fordelaGruppstorlekar(0), []);
});

test("slumpa-lag: blanda är en permutation (samma element, injicerbar slump)", () => {
  const a = [1, 2, 3, 4, 5, 6, 7, 8];
  let i = 0;
  const seq = [0.9, 0.1, 0.5, 0.3, 0.7, 0.2, 0.4, 0.6];
  const slump = () => seq[i++ % seq.length];
  const b = blanda(a, slump);
  assert.deepEqual(b.slice().sort((x, y) => x - y), a);
  assert.notDeepEqual(b, a, "en verklig omblandning (med den givna slumpsekvensen)");
});

test("slumpa-lag: skapaSlumpadeLag ger alla elever exakt ett lag, en avatar per lag, aldrig fler än 3 (om nog avatarer finns)", () => {
  const elever = Array.from({ length: 10 }, (_, i) => ({ id: "e" + i, namn: "Elev " + i }));
  const lediga = ["hast", "zebra", "tiger", "elefant", "kamel", "alg", "snigel", "kanin", "giraff", "skoldpadda"];
  const grupper = skapaSlumpadeLag(elever, lediga, Math.random);
  const settElever = new Set();
  const settAvatarer = new Set();
  for (const g of grupper) {
    assert.ok(g.medlemmar.length >= 2 && g.medlemmar.length <= 3);
    assert.ok(!settAvatarer.has(g.avatar), "avatar återanvänds inte");
    settAvatarer.add(g.avatar);
    for (const m of g.medlemmar) {
      assert.ok(!settElever.has(m.id), "eleven hamnar bara i ett lag");
      settElever.add(m.id);
    }
  }
  assert.equal(settElever.size, 10);
});

test("slumpa-lag: fler grupper än lediga avatarer → grupperna slås ihop så alla får plats", () => {
  const elever = Array.from({ length: 8 }, (_, i) => ({ id: "e" + i, namn: "Elev " + i }));
  const lediga = ["hast"]; // bara EN ledig avatar
  const grupper = skapaSlumpadeLag(elever, lediga, Math.random);
  assert.equal(grupper.length, 1);
  assert.equal(grupper[0].medlemmar.length, 8);
  assert.equal(grupper[0].avatar, "hast");
});
