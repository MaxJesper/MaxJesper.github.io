/* =========================================================
   Delad synk-klient för begreppsbingo (lärare <-> elever).
   Använder en liten Cloudflare Worker + KV som delad "svarta tavlan":
   läraren skriver dit varje nytt uppropat begrepp, eleverna läser av det
   med jämna mellanrum så att deras brickor känner till samma begrepp.

   VIKTIGT: byt ut adressen nedan mot din egen Worker-URL efter att du har
   driftsatt den i Cloudflare (se instruktionerna du fått för hur du gör).
   Denna fil delas av alla begreppsbingo-sidor, så du behöver bara ändra
   adressen på ETT ställe.
   ========================================================= */
const BINGO_SYNC_API = "https://bingo-sync.jesper-tordsson.workers.dev";

// version är valfri: används av spel som erbjuder flera frågenivåer (t.ex. kol-och-
// kolföreningars Version 1/Version 2/Överkurs) så att servern kommer ihåg vilken nivå
// rummet hör till – elever som ansluter kan då bygga sin bricka från samma begreppspool.
// Spel utan flera nivåer struntar bara i parametern.
async function bingoSkapaRum(version){
  const res = await fetch(`${BINGO_SYNC_API}/rum`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(version ? {version} : {})
  });
  if(!res.ok) throw new Error("Kunde inte skapa rum (status " + res.status + ")");
  const data = await res.json();
  if(!data || !data.kod) throw new Error("Oväntat svar vid skapande av rum");
  return data.kod;
}

async function bingoRopaBegrepp(kod, term){
  try{
    await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/ropa`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({term})
    });
  } catch(e){
    console.warn("Kunde inte synka uppropat begrepp:", e);
  }
}

async function bingoHamtaRum(kod){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}`);
    if(!res.ok) return null;
    return await res.json();
  } catch(e){
    console.warn("Kunde inte hämta rumsstatus:", e);
    return null;
  }
}

// Försöker låsa ett bricknummer åt eleven i det här rummet, med det namn eleven skrev
// in vid inloggningen (visas i topplistan). Om numret redan är taget (någon annan hann
// före) svarar servern med ok:false och den aktuella listan över upptagna brickor, så
// att gränssnittet kan uppdateras och eleven kan välja en annan.
async function bingoValjBricka(kod, bricknummer, namn){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/valjBricka`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({bricknummer, namn})
    });
    let data = null;
    try{ data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  } catch(e){
    console.warn("Kunde inte välja bricka:", e);
    return { ok:false, data:null };
  }
}

// Rapporterar att eleven klickat rätt på ett uppropat begrepp. Servern delar ut poäng
// efter hur snabbt eleven var (mest poäng till den första som svarar rätt på just det
// begreppet) och skickar tillbaka det uppdaterade rumsläget.
async function bingoRapporteraRatt(kod, bricknummer, term){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/ratt`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({bricknummer, term})
    });
    let data = null;
    try{ data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  } catch(e){
    console.warn("Kunde inte rapportera rätt svar:", e);
    return { ok:false, data:null };
  }
}

// Rapporterar att eleven precis klarat sin antalRader:e rad (räknat per elev). De tre
// första i hela rummet som når rad 1, 2 respektive 3 får en poängbonus, och servern
// skickar tillbaka det uppdaterade rumsläget (inklusive händelseloggen för notiser).
async function bingoRapporteraRad(kod, bricknummer, antalRader){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/rad`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({bricknummer, antalRader})
    });
    let data = null;
    try{ data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  } catch(e){
    console.warn("Kunde inte rapportera klar rad:", e);
    return { ok:false, data:null };
  }
}

// Rapporterar att eleven fick hel bricka. Servern låser spelet för alla (avslutad:true)
// och räknar fram topplistan över de tre bästa spelarna.
async function bingoAvslutaSpel(kod, bricknummer){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/avsluta`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({bricknummer})
    });
    let data = null;
    try{ data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  } catch(e){
    console.warn("Kunde inte avsluta spelet:", e);
    return { ok:false, data:null };
  }
}
