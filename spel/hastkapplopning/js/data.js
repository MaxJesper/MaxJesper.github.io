/* data.js – laddar frågeset och blandar svarsalternativen (Fisher–Yates) */

export async function laddaUppsattningar(bas) {
  const r = await fetch(new URL("../data/uppsattningar.json", bas || import.meta.url));
  if (!r.ok) throw new Error("Kunde inte läsa uppsattningar.json");
  return (await r.json()).uppsattningar;
}

export async function laddaFragor(fil) {
  const r = await fetch(new URL("../data/" + fil, import.meta.url));
  if (!r.ok) throw new Error("Kunde inte läsa frågeset " + fil);
  const d = await r.json();
  if (!d.matcher || !d.matcher.length) throw new Error("Frågesetet saknar matcher");
  return d;
}

/* Fisher–Yates. slump kan bytas ut i test (returnerar tal i [0,1)). */
export function blanda(lista, slump) {
  const s = slump || Math.random;
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(s() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Gör om en fråga ur datafilen till ett `nasta_fraga`-meddelande med blandade alternativ. */
export function tillFragameddelande(f, slump) {
  const idx = blanda([0, 1, 2, 3], slump);
  return {
    t: "nasta_fraga",
    fraga: f.fraga,
    alternativ: idx.map((i) => f.alternativ[i]),
    ratt: idx.indexOf(f.ratt),
    forklaring: f.forklaring || "",
    kalla: f.kalla || "",
  };
}
