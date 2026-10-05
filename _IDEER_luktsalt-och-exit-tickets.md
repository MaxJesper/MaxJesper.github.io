# Idéer att bygga så småningom: "Luktsalt" och Exit tickets
*Antecknat 5 okt 2026 efter önskemål från Jesper. Inget är byggt än. Målet är att båda ska finnas för alla områden.*

## 1. "Luktsalt" – väcka intresse när ett nytt område startar
- **Namnet är preliminärt.** "Luktsalt" är vad man säger på Jespers skola; vi bestämmer senare vad det ska heta på plattformen.
- **Syfte:** något läraren använder när ett nytt område startar och som väcker nyfikenhet. Det ska visa det förunderliga och intressanta med området *innan* undervisningen börjar.
- **Former som Jesper nämnt:**
  - en **artefakt** (ett föremål) med en fråga kopplad till den
  - något **historiskt** (en upptäckt, en person, en händelse)
  - en **kluring** som eleverna får i handen när de går in i klassrummet
- **Tankar inför bygget:**
  - Ett eller några förslag per område, med material att skriva ut (t.ex. kluringen som lapp).
  - Gärna ett "svar/upplösning" som läraren återkommer till i slutet av området.
  - Kopplas till studieguidens första milstolpe och till områdets `.wonder`-frågor där sådana finns.

## 2. Exit tickets – avslutande fråga eller quiz innan eleven går
- **Syfte:** en liten quiz, en enda fråga eller en uppgift som eleven löser innan hen får gå. Alla får förstås gå när lektionen är slut.
- **Flera exit tickets per område**, som **läraren låser upp** (t.ex. en per milstolpe eller lektion).
- **Lärarvy (önskemål):** läraren ser i realtid när en elev är klar och kan gå tidigare. Det kan kopplas till en **Cloudflare Worker**, och vi kan återanvända arkitekturen från lagspelet `spel/hastkapplopning/`: Worker + Durable Object, rum med kod, WebSocket, se CLAUDE.md.
- **Tankar inför bygget:**
  - **Integritet:** eleverna ska inte behöva logga in eller ange sitt fullständiga namn. Förnamn, initialer eller en kod räcker, och ingen data sparas efter lektionen. Ta ställning till detta tidigt, eftersom elever är minderåriga.
  - Frågorna kan byggas av befintligt material (instuderingsfrågor, checklistan) per milstolpe.
  - En enkel version utan Worker är möjlig först: eleven visar "Klar ✓" på skärmen för läraren.
  - Hör ihop med framtida tankar om lärarinloggning och vad som bara läraren ska komma åt.
