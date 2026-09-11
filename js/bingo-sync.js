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
const BINGO_SYNC_API = "https://BYT-UT-MOT-DIN-WORKER-URL.workers.dev";

async function bingoSkapaRum(){
  const res = await fetch(`${BINGO_SYNC_API}/rum`, { method: "POST" });
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

// Försöker låsa ett bricknummer åt eleven i det här rummet. Om numret redan är taget
// (någon annan hann före) svarar servern med ok:false och den aktuella listan över
// upptagna brickor, så att gränssnittet kan uppdateras och eleven kan välja en annan.
async function bingoValjBricka(kod, bricknummer){
  try{
    const res = await fetch(`${BINGO_SYNC_API}/rum/${encodeURIComponent(kod)}/valjBricka`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({bricknummer})
    });
    let data = null;
    try{ data = await res.json(); } catch(e){}
    return { ok: res.ok, data };
  } catch(e){
    console.warn("Kunde inte välja bricka:", e);
    return { ok:false, data:null };
  }
}
