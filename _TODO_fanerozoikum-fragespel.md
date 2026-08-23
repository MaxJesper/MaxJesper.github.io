# TODO: Porta fragespel-funktioner till Fanerozoikum

## Vad ska göras

Fanerozoikum-spelet (`biologi/evolution/Fanerozoikum.html` + `Fanerozoikum-fragor.json`) ska få samma funktioner som kraft/rörelse-frågespelet (`fysik/kraft-och-rorelse/fragespel.html`).

## Funktioner att porta från fragespel.html

### Spelmekanik
- **Chansa / Säkra** – spelaren väljer innan Q1 visas:
  - Säkra = 1 poäng om Q1 rätt
  - Chansa = 2 poäng om BÅDE Q1 och Q2 rätt, annars 0 poäng
- **Två frågor per kort** (Q1 + Q2) med faser: `intro → q1 → q1done → q2wait → q2 → q2done`
- **Q2 dold i q2wait-fasen** – eleverna ska inte kunna läsa Q2 innan timern startar
- **Auto-blandning** (Fisher-Yates shuffle) vid start
- **Kortförlust vid timeout** – buzzerljud + kort försvinner

### Timer
- Nedräkning synlig som stort nummer
- Buzzerljud (Web Audio API, sawtooth waves) när tiden tar slut
- Timer startar bara när man klickar Fortsätt (inte automatiskt)
- Timern kan slås av (läraren på projektor styr)

### Poängsystem
- localStorage per enhet (varje grupp på sin dator)
- Visuell poängvisning
- Segeröverlay med konfetti/ljud (triangle waves melody) när man når vinnarpoängen
- Dynamisk vinnartext som speglar inställd poäng

### Inställningar (lösenordsskyddade)
- Lösenord: **JTo** (dolt när man skriver, `type="password"`)
- Timer på/av
- Antal sekunder per fråga (default 20s)
- Vinnarpoäng (default 10p)
- Alla inställningsinputs `disabled` som standard, aktiveras efter lösenord
- CSS-klass `.locked` på inställningspanelen

### Tekniska detaljer
- `esc()`-funktion för HTML-escaping av allt användarinnehåll
- `disabled` HTML-attribut (inte bara CSS pointer-events) för att blocka tangentbordsinteraktion
- Victory overlay: `id="victoryText"` + `showVictory()` sätter `winScore + ' POÄNG!'` dynamiskt

## Referensfiler
- **Källkod att kopiera ifrån:** `fysik/kraft-och-rorelse/fragespel.html`
- **JSON-struktur att matcha:** `fysik/kraft-och-rorelse/fragespel-fragor.json`
- **Målfiler:** `biologi/evolution/Fanerozoikum.html` + `biologi/evolution/Fanerozoikum-fragor.json`

## JSON-kortstruktur (fragespel)
```json
{
  "id": 1,
  "subject": "Rörelse",
  "topic": "Hastighet",
  "intro": "Beskrivande text...",
  "q1": {
    "question": "Fråga 1?",
    "options": { "A": "...", "B": "...", "C": "..." },
    "correct": "A",
    "explanation": "Förklaring..."
  },
  "q2": {
    "question": "Fråga 2?",
    "options": { "A": "...", "B": "...", "C": "..." },
    "correct": "B",
    "explanation": "Förklaring..."
  }
}
```

## Viktigt att tänka på
- Fanerozoikum-korten har troligen annan struktur idag – jämför och migrera
- Behåll Fanerozoikums befintliga design/färgschema, byt bara ut spellogiken
- Starta ny session med ett fräscht kontextfönster för detta arbete
- Avsluta alltid med git push-kommandon

## Git-kommandon att köra när klart
```bash
cd ~/Documents/github
git add biologi/evolution/Fanerozoikum.html biologi/evolution/Fanerozoikum-fragor.json
git commit -m "Fanerozoikum: porta fragespel-funktioner (chansa/säkra, timer, poäng, lösenord, seger)"
git push
```
