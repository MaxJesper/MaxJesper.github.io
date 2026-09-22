/* =====================================================================
   slumpa-lag.js – "Slumpa lag": en lobbyfunktion (inspirerad av Socrative)
   som delar upp anslutna elever i slumpade lag om 2–3 personer och ger
   varje lag en slumpad, ledig avatar.
   ---------------------------------------------------------------------
   Ren logik – inget DOM, inget nätverk, ingen påverkan på spelmotorns
   poängregler (de gäller lika oavsett hur laget bildades). Används av
   lobbyn i larare.js OCH av bots.js (för att simulera flerpersonslag i
   Demoläget). Testas direkt i test/engine.test.mjs.
   ===================================================================== */

/* Fisher–Yates-blandning. `slump` är injicerbar (0 ≤ slump() < 1) för
   deterministiska tester; standard är Math.random. */
export function blanda(lista, slump) {
  const rnd = slump || Math.random;
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/* Delar upp `n` personer i gruppstorlekar om 2–3. Undviker en ensam
   sista person när det går (bara n===1 ger en grupp om 1 – det finns
   ingen att para ihop den personen med). Aldrig fler än 3 per grupp.
   T.ex. fordelaGruppstorlekar(10) → [2,3,3,2] (summa 10). */
export function fordelaGruppstorlekar(n) {
  if (n <= 0) return [];
  if (n <= 3) return [n];
  if (n === 4) return [2, 2];
  const grupper = [];
  let kvar = n;
  while (kvar > 3) {
    if (kvar % 3 === 1) {
      grupper.push(2);
      kvar -= 2;
    } else {
      grupper.push(3);
      kvar -= 3;
    }
  }
  if (kvar > 0) grupper.push(kvar);
  return grupper;
}

/* Bygger slumpade lag av `elever` ([{id, namn}, …]) och tilldelar varje
   lag en slumpad, ledig avatar ur `lediga` (lista av avatar-id).
   Returnerar [{avatar, medlemmar:[{id,namn}, …]}, …], en rad per nytt lag,
   i den ordning de skapas (används t.ex. som visningsordning på
   lärarskärmen). Om det finns fler grupper än lediga avatarer (en mycket
   stor klass) slås de sista grupperna ihop så att alla får plats i ett
   lag – det kan då bli fler än 3 medlemmar i de sista lagen. */
export function skapaSlumpadeLag(elever, lediga, slump) {
  const rnd = slump || Math.random;
  const ordning = blanda(elever, rnd);
  const storlekar = fordelaGruppstorlekar(ordning.length);
  while (storlekar.length > lediga.length && storlekar.length > 1) {
    const sista = storlekar.pop();
    storlekar[storlekar.length - 1] += sista;
  }
  const avatarer = blanda(lediga, rnd).slice(0, storlekar.length);
  const grupper = [];
  let i = 0;
  for (let g = 0; g < storlekar.length; g++) {
    const n = storlekar[g];
    grupper.push({ avatar: avatarer[g], medlemmar: ordning.slice(i, i + n) });
    i += n;
  }
  return grupper;
}
