# Hästkapplöpning – spelservern (Cloudflare Worker)

Den här mappen innehåller serverdelen till spelet **Hästkapplöpning** (`/spel/hastkapplopning/`).
Servern behövs för att elevernas egna mobiler och datorer ska kunna spela tillsammans med lärarens projektorbild.
Utan server fungerar bara **Demoläge** och **Lokalt läge** (alla flikar i samma webbläsare).

Servern är en Cloudflare Worker med ett **Durable Object per spelrum**. Ett rum tas bort automatiskt 8 timmar efter senaste aktivitet.
Inga elevuppgifter sparas längre än så (bara förnamn/smeknamn under spelets gång, inget mer).

> **Status:** Koden är byggd och testad lokalt mot den riktiga Worker-körtiden (`wrangler dev`), men den är **inte driftsatt**.
> Själva driftsättningen mot ditt Cloudflare-konto har jag inte kunnat göra eller prova. Stegen nedan är skrivna efter Cloudflares
> dokumentation och testade lokalt så långt det går – se avsnittet "Vad som inte är verifierat".

---

## Filer

| Fil | Vad den är |
|---|---|
| `worker.js` | **Den färdiga Worker-filen** (en enda fil). Genereras – ändra den aldrig för hand. |
| `wrangler.toml` | Konfiguration (namn `hastkapplopning`, Durable Object `Rum`, SQLite-migrering). |
| `src/worker-del.js` | Källkod: router, Origin-lista, gränser, Durable Object-klassen. |
| `bygg_worker.py` | Bygger `worker.js` av `spel/hastkapplopning/js/engine.js` + `src/worker-del.js`. |
| `test/` | Testerna (se `OVERLAMNING.md`). |

`worker.js` innehåller samma spelmotor (`engine.js`) som webbläsaren använder. Om du ändrar `engine.js` eller `src/worker-del.js` måste du köra
`python3 tools/hastkapplopning-worker/bygg_worker.py` och driftsätta om (se "Uppdatera senare").

---

## Driftsättning steg för steg (kommandoraden – rekommenderas)

Du behöver: ett Cloudflare-konto (du har redan ett, eftersom bingo-servern ligger på `jesper-tordsson.workers.dev`) och **Node.js version 22 eller senare**
(kontrollera med `node --version`; nyaste versionen av `wrangler` kräver 22+. Ladda ner "LTS" från nodejs.org om din är äldre).

1. **Öppna en terminal i den här mappen.**
   ```
   cd tools/hastkapplopning-worker
   ```
2. **Logga in på Cloudflare** (öppnar webbläsaren, klicka *Allow*):
   ```
   npx wrangler login
   ```
3. **Driftsätt:**
   ```
   npx wrangler deploy
   ```
   Första gången frågar `npx` om att få installera `wrangler` – svara `y`. Det tar en halv minut.
4. **Läs av adressen.** Sista raden i utskriften ser ut ungefär så här (din adress blir troligen den här, eftersom kontots underdomän är `jesper-tordsson`):
   ```
   https://hastkapplopning.jesper-tordsson.workers.dev
   ```
5. **Testa att servern svarar** (byt till din adress):
   ```
   curl https://hastkapplopning.jesper-tordsson.workers.dev/
   ```
   Förväntat svar: `{"tjanst":"hastkapplopning","ok":true,"motor":1}`

   Testa också att ett rum kan skapas. Servern kräver rätt `Origin`, därför måste den skickas med:
   ```
   curl -X POST -H "Origin: https://maxjesper.github.io" https://hastkapplopning.jesper-tordsson.workers.dev/rum
   ```
   Förväntat svar: `{"kod":"K7QH","lararnyckel":"…"}` (fyra tecken och en lång nyckel). Utan `-H "Origin: …"` får du `403 Otillåten origin` – det är meningen.
6. **Koppla in servern i spelet.** Öppna `spel/hastkapplopning/js/config.js` och klistra in adressen (utan avslutande snedstreck):
   ```js
   export const HASTRACE_API = "https://hastkapplopning.jesper-tordsson.workers.dev";
   ```
   Spara, committa och publicera sajten som vanligt. Nu är knappen **Starta rum (Server)** på startsidan aktiv (utan adress står det "inte påslagen" på knappen).
7. **Provkör** med två flikar/telefoner: lärarvy → skapa rum → gå med som elev på en telefon (Chromebook går lika bra).

### Uppdatera senare
Ändrar du `engine.js` eller `src/worker-del.js`: `python3 tools/hastkapplopning-worker/bygg_worker.py`, sedan `npx wrangler deploy` igen. Adressen ändras inte.
Pågående rum kan tappa anslutningen ett ögonblick vid uppdatering; elevsidorna återansluter själva.

### Om sajtens adress ändras
Servern släpper bara in webbsidor vars adress finns i listan `TILLATNA_ORIGIN` överst i `src/worker-del.js`
(nu `https://maxjesper.github.io` samt några `localhost`-adresser för test). Ny adress → lägg till den, bygg om, driftsätt om.

---

## Alternativ: webbeditorn i Cloudflares panel (ej verifierat)

Det här har jag **inte** kunnat prova. Så här tror jag att det går till, men det är en gissning efter dokumentationen:

1. dash.cloudflare.com → *Workers & Pages* → *Create* → *Start with Hello World* → *Deploy*.
2. *Edit code* → ersätt allt med innehållet i `worker.js` → *Deploy*.
3. *Settings → Bindings → Add → Durable Object*: variabelnamn `RUM`, klass `Rum`.

Osäkerheten: en **ny** Durable Object-klass kräver en migrering (`new_sqlite_classes = ["Rum"]`, se `wrangler.toml`), och jag vet inte om panelen kan skapa den.
Fungerar inte steg 3 – använd kommandoraden ovan. Den gör allt på en gång.

---

## Köra och testa lokalt (utan konto)

```
cd tools/hastkapplopning-worker
npx wrangler dev --local --port 8787
```
Starta sajten i en annan terminal (från repots rot), på en port som finns i Origin-listan:
```
python3 -m http.server 8801
```
Sätt tillfälligt `HASTRACE_API = "http://127.0.0.1:8787"` i `config.js` (ändra tillbaka till `""` eller den riktiga adressen efteråt) och öppna
`http://localhost:8801/spel/hastkapplopning/`.

Automatiska tester (kräver Node 22 och paketen `ws`, `playwright`, `axe-core`, `wrangler` – se `OVERLAMNING.md`):
```
node --test test/engine.test.mjs                                  # spelmotorn, ingen server
HK_MODULES=<mapp med node_modules>/ HK_WORKER_URL=http://127.0.0.1:8787 node --test test/worker.integration.test.mjs
```

---

## Kostnad

Gratisplanen räcker med god marginal för klassrumsbruk. Tumregler (kontrollera gärna aktuella gränser på Cloudflares sida *Workers & Pages → Pricing*, jag har inte kunnat slå upp dem i dag):
- Durable Objects på gratisplanen måste vara SQLite-baserade – det är de (`new_sqlite_classes`).
- Ett spel med 30 elever ger några hundra inkommande meddelanden. Meddelanden från webbläsaren räknas som en bråkdel av en förfrågan, och medan rummet är stilla debiteras ingen körtid (WebSocket Hibernation).
- Servern har egna spärrar: högst 60 spelare per rum, 30 meddelanden per 10 sekunder och anslutning, högst 20 nya rum per minut och IP-adress.

Kostnaden kan alltså aldrig löpa iväg av misstag, men om gränsen för gratisplanen ändå nås svarar servern med fel och spelet visar ett felmeddelande i stället för att ansluta.

---

## Felsökning

| Symptom | Trolig orsak och åtgärd |
|---|---|
| Startsidan säger "Servern är inte påslagen ännu" | `HASTRACE_API` i `config.js` är tom. Klistra in adressen (steg 6). |
| "Kunde inte skapa rum" / `403` i webbläsarens konsol | Sidans adress finns inte i `TILLATNA_ORIGIN`. Se "Om sajtens adress ändras". |
| Eleven får "Rummet finns inte" | Fel rumskod, eller rummet har passerat 8 timmar. Skapa nytt rum. |
| Eleverna ansluter inte, men läraren gör det | Elevernas nätverk kan blockera `wss://`-trafik till `workers.dev`. Prova med mobildata som jämförelse. Ingen enkel lösning finns då; Lokalt läge fungerar bara i en och samma webbläsare. |
| `npx wrangler deploy`: "Node.js version … not supported" | Installera Node 22 eller senare. |
| `wrangler deploy` klagar på migrering/`new_classes` | Du har kanske redan en Worker med namnet `hastkapplopning` utan SQLite-klassen. Ändra `name` i `wrangler.toml` (t.ex. `hastkapplopning2`) och driftsätt igen. Ny adress → uppdatera `config.js`. |
| Vill se vad servern gör i realtid | `npx wrangler tail` (i den här mappen). |
| Läraren stängde fliken mitt i spelet | Öppna adressen `larare.html?lage=server&rum=KOD` i **samma webbläsare** – lärarnyckeln ligger sparad där. Rummet lever i 8 timmar. |

---

## Ta bort servern helt

```
npx wrangler delete
```
(eller i panelen: *Workers & Pages → hastkapplopning → Settings → Delete*). Alla rum och all data försvinner. Sätt sedan `HASTRACE_API = ""` i `config.js`;
spelet visar då bara Demoläge/Lokalt läge.

---

## Vad som inte är verifierat

- **Själva driftsättningen** mot ett riktigt Cloudflare-konto (inloggning, `wrangler deploy`, panelens webbeditor). Lokalt har `worker.js` körts i `wrangler dev` (samma `workerd`-körtid som i molnet), men skillnader mellan lokal och riktig miljö kan finnas, t.ex. att den riktiga Cloudflare-nätverksfördröjningen påverkar vilket lag som hinner först.
- Gränserna för gratisplanen (se Kostnad).
- Beteende på klassrumsnätverk med webbfilter.
