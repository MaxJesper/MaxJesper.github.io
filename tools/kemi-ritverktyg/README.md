# Kemi-ritverktyg – strukturformler och kulmodeller

Två fristående Node-skript som ritar kemiska bilder till NO-sajten i vår låsta husstil.
Ren JavaScript, inga beroenden (OpenChemLib behövs bara om vi vill validera/exportera .mol).

## strukturformler.js  (2D, skolboksstil)
Utvecklad strukturformel: alla atomer utskrivna, räta vinklar.
- INK #14213d, STEP 35 (bindningslängd), lucka 11, font 21, streck 1,25.
- Alla bindningar lika långa. Dubbel = 2 streck (offset ±3,5), trippel = 3 (±6), samma längd som enkel.
- Dubbelbindning i änden (t.ex. eten): ändkolets två väten i Y-form, ELEV = 45° från vågrätt.
- Envärda alkoholer: rita ut O–H med egen bindning. Flervärda (glykol, glycerol): -OH som grupp + xscale 1,25 (25 % bredare kolkedja så grupperna får luft).
- Summaformlernas siffror: sub 0,6em.
Kör: `node strukturformler.js`  → images/kemi/kol-och-kolforeningar/strukturformler/

## kulmodeller.js  (3D ball-and-stick)
Kol = mörka kulor, väte = ljusa, mörka pinnar emellan.
- Äkta geometri: metan tetraedrisk (109,5°), eten plan, etyn linjär.
- 3D via rotation + perspektiv (DCAM 7): kulor bakåt ritas mindre, pinnar smalnar av på djupet.
- SCALE 70, kol-radie 27, väte-radie 19, pinne 11.
Kör: `node kulmodeller.js`  → images/kemi/kol-och-kolforeningar/kulmodeller/

## Arbetsgång
1. Claude bestämmer innehållet (namn, summaformel, kondenserad, SMILES/bindningar) – kemin.
2. Skriptet ritar (geometrin). Aldrig frihands-SVG eller bild-AI för strukturer.
3. Jesper granskar snabbt. 4. Spara namn.svg. 5. Återanvänd i text, frågor, prov, facit och spel.

Uppdatera de här skripten OCH skill:en varje gång vi optimerar ritfunktionen.
