# Bilder i atomfysikens studieguide

`bilder.py` lägger in bilderna (sidokolumn eller full bredd) i `fysik/atomfysik/studieguide.html` enligt `bildconf.py` (bildtexter, alt-texter och placering per avsnittsrubrik).

Körs på textversionen utan bilder, aldrig på en sida som redan har bildrader:

    cd ~/Documents/github/fysik/atomfysik
    cp ../../tools/atomfysik-bilder/studieguide-utan-bilder.html studieguide.html
    python3 ../../tools/atomfysik-bilder/bilder.py ../../tools/atomfysik-bilder/bildconf.py

**Viktigt:** `studieguide-utan-bilder.html` är en ögonblicksbild från 17 okt 2026. Om texten i studieguiden ändras efter det gäller den nya sidan – redigera då bildraderna direkt i `studieguide.html` i stället för att köra skriptet.
