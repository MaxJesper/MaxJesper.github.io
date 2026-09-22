// Enhetstester för spelmotorn. Kör: node --test tools/hastkapplopning-worker/test/
import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../../../spel/hastkapplopning/js/engine.js";

const L = { roll: "larare" };
let T0 = 1_000_000;

function fraga(ratt = 1, nr = 1) {
  return { t: "nasta_fraga", fraga: "Fråga " + nr + "?", alternativ: ["a", "b", "c", "d"], ratt, forklaring: "Därför.", kalla: "Test" };
}

/* Skapar rum med n lag (ett lag per spelare) i lobbyn. Returnerar {rum, ids:{lagId:spelarId}}. */
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

function start(rum, nr = 0, ord = 8, tot = 12) {
  const r = E.hantera(rum, L, { t: "starta_match", nr, namn: "Match " + (nr + 1), antalMatcher: 3, antalOrdinarie: ord, antalTotal: tot }, T0);
  assert.ok(r.ok, JSON.stringify(r));
}

/* Ställer en fråga och låter lagen svara: svar = [[spelarIndex, val, msEfterStart], …] */
let klocka = T0;
function kor(rum, spel, ratt, svar, extra = {}) {
  klocka += 1000;
  const t0 = klocka;
  const r = E.hantera(rum, L, fraga(ratt, rum.match.fragaNr + 1), t0);
  assert.ok(r.ok, JSON.stringify(r));
  for (const [i, val, ms] of svar) {
    const s = E.hantera(rum, spel[i], { t: "svara", val }, t0 + ms);
    assert.ok(s.ok, JSON.stringify(s));
  }
  if (rum.match.steg === "fraga") assert.ok(E.hantera(rum, L, { t: "visa_svar" }, t0 + (extra.visaEfter || 5000)).ok);
  klocka = t0 + 6000;
  return rum.match.resultat;
}

test("rumskod: 4 tecken utan förväxlingsbara tecken", () => {
  for (let i = 0; i < 500; i++) {
    const k = E.slumpRumskod();
    assert.match(k, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/);
    assert.ok(!/[01OIL]/.test(k));
  }
  assert.ok(!E.arGiltigRumskod("AB0D"));
  assert.ok(E.arGiltigRumskod("A2C4"));
});

test("poäng: 1:a får 3, 2:a får 2, övriga rätt får 1, fel och uteblivet får 0", () => {
  const { rum, spel } = bygg(5);
  start(rum);
  // lag 0..4; rätt = 1. Lag0 fel, lag1 rätt sist, lag2 rätt först, lag3 rätt tvåa, lag4 uteblir
  const res = kor(rum, spel, 1, [[0, 2, 500], [1, 1, 4000], [2, 1, 1000], [3, 1, 2000]]);
  const l = (i) => res.lag[E.AVATARER[i].id];
  assert.equal(l(2).steg, 3);
  assert.equal(l(2).rang, 1);
  assert.equal(l(3).steg, 2);
  assert.equal(l(1).steg, 1);
  assert.equal(l(0).steg, 0);
  assert.equal(l(0).ratt, false);
  assert.equal(l(4).steg, 0);
  assert.equal(l(4).svarade, false);
  assert.deepEqual(rum.match.pos, { hast: 0, zebra: 1, tiger: 3, elefant: 2, kamel: 0 });
  // ordning på förflyttningarna: 3-stegaren, 2-stegaren, därefter 1-stegarna tillsammans
  assert.deepEqual(res.rorelser.map((r) => [r.steg, r.gnagg, r.lag.length]), [[3, "stor", 1], [2, "liten", 1], [1, null, 1]]);
  assert.equal(res.rorelser[0].lag[0], E.AVATARER[2].id);
  assert.equal(rum.match.tre.tiger, 1);
});

test("ensam rätt får 3 steg; alla fel ger 0 och ingen rörelse", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  let res = kor(rum, spel, 0, [[0, 3, 100], [1, 0, 200], [2, 2, 300]]);
  assert.deepEqual(rum.match.pos, { hast: 0, zebra: 3, tiger: 0 });
  assert.equal(res.rorelser.length, 1);
  res = kor(rum, spel, 0, [[0, 3, 100], [1, 1, 200], [2, 2, 300]]);
  assert.deepEqual(res.rorelser, []);
  assert.deepEqual(rum.match.pos, { hast: 0, zebra: 3, tiger: 0 });
});

test("lika ms: deterministisk ordning efter ankomst", () => {
  const { rum, spel } = bygg(4);
  start(rum);
  const res = kor(rum, spel, 2, [[3, 2, 1500], [1, 2, 1500], [0, 2, 1500], [2, 2, 1500]]);
  const rang = (i) => res.lag[E.AVATARER[i].id].rang;
  assert.deepEqual([rang(3), rang(1), rang(0), rang(2)], [1, 2, 3, 4]);
  assert.equal(res.lag[E.AVATARER[2].id].steg, 1);
});

test("ett svar per lag: andra tryckningen (även från annan medlem) avvisas och första gäller", () => {
  const { rum, spel } = bygg(2);
  const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "Kompis" }, T0);
  const kompis = { roll: "elev", spelarId: h.spelarId };
  assert.ok(E.hantera(rum, kompis, { t: "valj_lag", lag: "hast" }, T0).ok);
  assert.equal(rum.lag.hast.medlemmar.length, 2);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  assert.ok(E.hantera(rum, spel[0], { t: "svara", val: 2 }, T0 + 2000).ok);
  const igen = E.hantera(rum, kompis, { t: "svara", val: 1 }, T0 + 2100);
  assert.equal(igen.ok, false);
  assert.equal(igen.fel, "redan_svarat");
  assert.equal(rum.match.svar.hast.val, 2);
  assert.equal(rum.match.svar.hast.av, spel[0].spelarId);
});

test("frågan stängs när alla lag svarat", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  E.hantera(rum, spel[0], { t: "svara", val: 1 }, T0 + 1100);
  E.hantera(rum, spel[1], { t: "svara", val: 1 }, T0 + 1200);
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
  assert.equal(rum.match.resultat.lag.zebra.svarade, false);
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
  assert.equal(rum.match.svar.hast.tidMs, 5000); // 4 s före pausen + 1 s efter
});

test("målpassage: den som först passerar mållinjen i uppspelad ordning vinner; övriga förflyttningar spelas färdigt", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  start(rum);
  const id = (i) => E.AVATARER[i].id;
  // Sätt upp läget: hast 8, zebra 9, tiger 5, elefant 9 (direkt i tillståndet)
  Object.assign(rum.match.pos, { hast: 8, zebra: 9, tiger: 5, elefant: 9 });
  // Elefant snabbast (+3 → mål), hast tvåa (+2 → mål), zebra tredje (+1 → mål), tiger fjärde (+1)
  const res = kor(rum, spel, 3, [[3, 3, 500], [0, 3, 900], [1, 3, 1200], [2, 3, 1500]]);
  assert.equal(rum.match.vinnare, id(3));
  assert.equal(rum.match.vinnarTyp, "mal");
  assert.equal(res.malNadd, id(3));
  assert.equal(rum.match.pos.hast, 10);
  assert.equal(rum.match.pos.zebra, 10);
  assert.equal(rum.match.pos.tiger, 6);
  assert.equal(rum.match.pos.elefant, 10); // kapat vid mål
  assert.equal(rum.match.klar, true);
  assert.equal(rum.match.steg, "avslojad");
  // ingen ny fråga när matchen är avgjord
  assert.equal(E.hantera(rum, L, fraga(0), klocka + 10).fel, "match_klar");
});

test("mål: i 1-stegsgruppen avgör snabbhetsordningen vem som passerar först", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  start(rum);
  Object.assign(rum.match.pos, { hast: 0, zebra: 0, tiger: 9, elefant: 9 });
  // hast snabbast, zebra tvåa, elefant tredje (+1 → mål), tiger fjärde (+1 → mål)
  kor(rum, spel, 0, [[0, 0, 100], [1, 0, 200], [3, 0, 300], [2, 0, 400]]);
  assert.equal(rum.match.vinnare, "elefant");
});

test("reservfrågor: matchen fortsätter efter ordinarie frågor om ingen är i mål; avgörs på ledning efter 12", () => {
  const { rum, spel } = bygg(3, { inst: { banlangd: 30 } });
  start(rum, 0, 8, 12);
  // Rotera rangordningen: varje lag får varje rang lika ofta. hast är alltid 10 ms snabbare inom sin rang.
  for (let q = 1; q <= 12; q++) {
    const ordning = [0, 1, 2].map((i) => (i + q) % 3); // vem som är 1:a, 2:a, 3:a
    kor(rum, spel, 0, ordning.map((lagIx, rang) => [lagIx, 0, 500 + rang * 400 + (lagIx === 0 ? 0 : 10)]));
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
  for (let q = 1; q <= 10; q++) kor(rum, spel, 0, [[0, 0, 500], [1, 0, 900]]);
  assert.equal(rum.match.klar, true);
  assert.equal(rum.match.vinnarTyp, "mal");
  assert.equal(rum.match.fragaNr, 10);
});

test("tie-break: steg → flest 3-poängare → lägst sammanlagd svarstid → lagets ordning", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 30 } });
  start(rum);
  const mt = rum.match;
  mt.klar = true;
  // Alla på 6 steg
  Object.assign(mt.pos, { hast: 6, zebra: 6, tiger: 6, elefant: 6 });
  Object.assign(mt.tre, { hast: 1, zebra: 2, tiger: 2, elefant: 2 });
  Object.assign(mt.tid, { hast: 1000, zebra: 9000, tiger: 8000, elefant: 8000 });
  // zebra/tiger/elefant lika på steg och 3-poängare; tiger & elefant har lägst tid; lika → lagordning (tiger före elefant)
  assert.deepEqual(E.rangordnaMatch(rum), ["tiger", "elefant", "zebra", "hast"]);
  // steg går först
  mt.pos.hast = 7;
  assert.equal(E.rangordnaMatch(rum)[0], "hast");
  // vinnare (först i mål) går före alla
  mt.vinnare = "zebra";
  assert.equal(E.rangordnaMatch(rum)[0], "zebra");
});

test("prispall, matchpoäng, lag och medlemmar består, slutpall efter match 3", () => {
  const { rum, spel } = bygg(4, { inst: { banlangd: 10 } });
  const kandaMedlemmar = JSON.stringify(rum.lag);
  const vinnare = [0, 2, 0]; // laget som vinner match 1, 2, 3
  for (let m = 0; m < 3; m++) {
    start(rum, m, 8, 12);
    const v = vinnare[m];
    // v snabbast, andra: i-1 nästa; låt varje fråga ge v +3
    let guard = 0;
    while (!rum.match.klar && guard++ < 12) {
      const svar = [[v, 0, 300]];
      const andra = [0, 1, 2, 3].filter((x) => x !== v);
      svar.push([andra[0], 0, 800]); // tvåa
      svar.push([andra[1], 1, 900]); // fel
      kor(rum, spel, 0, svar);
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
  // Summa poäng: hast vann 2 matcher (6) + andraplats i match 2? Kontrollera bara summorna är konsistenta
  const summa = Object.values(rum.poang).reduce((a, b) => a + b, 0);
  assert.equal(summa, 3 * (3 + 2 + 1));
  const sp = rum.slutpall;
  assert.equal(sp.length, 4);
  assert.ok(sp[0].poang >= sp[1].poang && sp[1].poang >= sp[2].poang);
  assert.equal(sp[0].lag, "hast");
  // banan nollställs i nästa match; ny omgång nollar poängen men behåller lag
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
  kor(rum, spel, 0, [[1, 0, 100], [0, 0, 300]]);
  assert.ok(E.hantera(rum, L, { t: "slutfor_match" }, klocka).ok);
  assert.equal(rum.match.steg, "pall");
  assert.equal(rum.match.pall[0].lag, "zebra");
  assert.equal(rum.poang.zebra, 3);
  // avbryt
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

test("sen ansökan: ny spelare kan gå med i befintligt lag mitt i matchen men inte byta eller starta nytt lag", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1000);
  const h = E.hantera(rum, { roll: "gast" }, { t: "hej", namn: "Sen" }, T0 + 2000);
  const sen = { roll: "elev", spelarId: h.spelarId };
  assert.equal(E.hantera(rum, sen, { t: "valj_lag", lag: "kanin" }, T0 + 2100).fel, "nytt_lag_last");
  assert.ok(E.hantera(rum, sen, { t: "valj_lag", lag: "zebra" }, T0 + 2200).ok);
  assert.equal(rum.lag.zebra.medlemmar.length, 2);
  // kan svara för laget
  assert.ok(E.hantera(rum, sen, { t: "svara", val: 1 }, T0 + 2300).ok);
  // byte av lag under match nekas
  assert.equal(E.hantera(rum, sen, { t: "valj_lag", lag: "tiger" }, T0 + 2400).fel, "lagbyte_last");
  assert.equal(E.hantera(rum, sen, { t: "lamna_lag" }, T0 + 2500).fel, "lagbyte_last");
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
  // efter borttagning får den borttagna spelaren inte agera
  assert.equal(E.hantera(rum, spel[0], { t: "valj_lag", lag: "kanin" }, T0).fel, "okand_spelare");
  // i match
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
  // svar utanför 0–3, fel typ
  start(rum);
  E.hantera(rum, L, fraga(1), T0 + 1);
  for (const val of [-1, 4, 1.5, "1", null, NaN, Infinity]) assert.equal(E.hantera(rum, spel[0], { t: "svara", val }, T0 + 5).ok, false, String(val));
  // frågedata
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
  // inställningar
  assert.equal(E.hantera(rum, L, { t: "installningar", svarstid_s: 5 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", svarstid_s: 61 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", banlangd: 31 }, T0).ok, false);
  assert.equal(E.hantera(rum, L, { t: "installningar", auto: "ja" }, T0).ok, false);
  assert.ok(E.hantera(rum, L, { t: "installningar", svarstid_s: 30, auto: true, visaAlternativ: true }, T0).ok);
  assert.equal(rum.inst.svarstid_s, 30);
  // banans längd kan inte ändras under match
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

test("vyer: rätt svar och förklaring läcker aldrig före avslöjandet; elever får inte andras id", () => {
  const { rum, spel } = bygg(3);
  start(rum);
  E.hantera(rum, L, fraga(2), T0 + 1000);
  E.hantera(rum, spel[0], { t: "svara", val: 3 }, T0 + 2000);
  for (const aktor of [L, spel[0], spel[1], { roll: "gast" }]) {
    const s = JSON.stringify(E.vyFor(rum, aktor, T0 + 3000));
    assert.ok(!s.includes('"ratt"'), "ratt får inte finnas i vyn under frågan");
    assert.ok(!s.includes("Därför"), "förklaringen får inte finnas i vyn under frågan");
    assert.ok(!s.includes("nyckel"), "lärarnyckeln läcker aldrig");
  }
  const ev = E.vyFor(rum, spel[0], T0 + 3000);
  assert.deepEqual(ev.match.mittSvar, { val: 3, av: "Elev0", jag: true });
  assert.equal(E.vyFor(rum, spel[1], T0 + 3000).match.mittSvar, undefined);
  const sEv = JSON.stringify(ev);
  for (const s of spel) assert.ok(!sEv.includes(s.spelarId), "elevvyn innehåller inga spelar-id");
  const lv = E.vyFor(rum, L, T0 + 3000);
  assert.equal(lv.match.antalSvarat, 1);
  assert.equal(lv.match.antalLag, 3);
  assert.equal(lv.match.resultat, undefined);
  E.hantera(rum, L, { t: "visa_svar" }, T0 + 4000);
  const efter = E.vyFor(rum, spel[0], T0 + 5000);
  assert.equal(efter.match.fraga.ratt, 2);
  assert.equal(efter.match.fraga.forklaring, "Därför.");
  assert.equal(efter.match.resultat.lag.hast.ratt, false);
  assert.equal(JSON.stringify(efter.match.resultat.lag).includes("zebra"), false, "eleven får bara sitt eget lags detaljer");
  // vyn är ren JSON
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
  const tb = E.nyttTakbegransare ? E.nyttTakbegransare(5, 1000) : E.nyTakbegransare(5, 1000);
  let ok = 0;
  for (let i = 0; i < 10; i++) if (E.tillat(tb, 100 + i)) ok++;
  assert.equal(ok, 5);
  assert.equal(E.tillat(tb, 2000), true);
});
