/* =====================================================================
   config.js – ENDA konfigurationsfilen för Hästkapplöpning
   ---------------------------------------------------------------------
   Efter att Workern är driftsatt (se tools/hastkapplopning-worker/README.md):
   klistra in Worker-adressen mellan citattecknen nedan och spara. Klart.

   Tom sträng = servern är inte påslagen. Sidorna visar då ett vänligt
   meddelande och erbjuder bara Demoläge och Lokalt läge (samma webbläsare).
   ===================================================================== */

// Exempel: "https://hastkapplopning.jesper-tordsson.workers.dev"   (ingen avslutande snedstreck)
export const HASTRACE_API = "";

/* Tidsinställningar (läraren kan ändra dem i lärarvyn; detta är startvärden). */
export const TIDER = {
  svarstid_s: 20, // sekunder per fråga (10–60)
  banlangd: 16, // antal steg till mål (10–30)
  autoFordrojning_s: 6, // väntan mellan fråga och nästa i automatiskt läge (2–20)
};

/* Valfria riktiga ljudfiler. Lämna tomt så används de syntetiserade ljuden.
   Tillåtna nycklar: gnagg_stor, gnagg_liten, hovar, tick, last, ratt, fel, mal, pall.
   Exempel: { gnagg_stor: "ljud/gnagg.mp3", hovar: "ljud/hovar.mp3" }
   (sökvägar räknas från mappen spel/hastkapplopning/) */
export const SOUND_FILES = {};

/* Frågeset som finns (definieras i data/uppsattningar.json). */
export const STANDARD_UPPSATTNING = "mineraler-och-vitaminer";
