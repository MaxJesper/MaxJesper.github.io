#!/usr/bin/env python3
"""Genererar kemi/matens-kemi/studieguide.html ("kort kemikapitel" – bred studieguide med
bildkolumn, live-3D direkt i molekylkorten, se CLAUDE.md "Live-3D i korta kemikapitel").
Text och struktur är källan (den här filen) – studieguide.html byggs alltid om från den,
den ska aldrig handredigeras. Molekylkorten kommer från bygg_maten.card_html(), så bild och
kort hålls i synk automatiskt.
Körs: python3 bygg_studieguide.py
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
OUT = os.path.join(ROOT, "kemi", "matens-kemi", "studieguide.html")
sys.path.insert(0, HERE)

import bygg_maten as MOL  # noqa: E402


def card(key):
    return MOL.card_html(key)


def figrow(*keys):
    figs = "".join(f'<figure class="side-fig">{card(k)}</figure>' for k in keys)
    return f'<div class="m-row m-row--full"><div class="fig-row">{figs}</div></div>'


def viktigt(html):
    return (
        '<div class="viktigt" role="note"><svg class="viktigt-mark" viewBox="0 0 32 32" aria-hidden="true" '
        'focusable="false"><path d="M16 3 30 28H2z" fill="#7a5a00"/><path d="M16 12v8" stroke="#fff3b0" '
        'stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="24" r="1.8" fill="#fff3b0"/></svg>'
        f'<div class="viktigt-body"><strong class="viktigt-label">Viktigt!</strong><p>{html}</p></div></div>'
    )


def checkq(q, a):
    return f'<details class="check-q"><summary>{q}</summary><div class="svar"><strong>Svar:</strong> {a}</div></details>'


def fact(html):
    return f'<div class="fact-box"><strong>Kom ihåg</strong>{html}</div>'


def next_steps(*links):
    items = "".join(f'<a href="{href}"><span class="n-label">{label}</span>{text}</a>' for href, label, text in links)
    return f'<div class="next-steps">{items}</div>'


def plain(*parts):
    return '<div class="m-row m-row--plain"><div class="m-lead">' + "".join(parts) + "</div></div>"


def milestone(num, mid, title, body):
    return f"""
    <details class="milestone" id="{mid}">
      <summary>
        <span class="m-num">Milstolpe {num}</span>
        <span class="m-title">{title}</span>
      </summary>
      <div class="m-body">
{body}
      </div>
    </details>
"""


# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 1 – Fotosyntes och cellandning
# ═══════════════════════════════════════════════════════════════════
M1 = plain(
    '<p>All mat vi äter innehåller kemisk energi som en gång kom från solen. Växter fångar solens '
    'energi genom <strong class="term"><span class="concept-inline" data-concept="Fotosyntes">fotosyntesen</span></strong>: '
    'de bygger druvsocker av koldioxid och vatten, med hjälp av ljusenergi. Som ordekvation:</p>'
    '<p class="equation">koldioxid&nbsp;+&nbsp;vatten <span class="eq-arrow">→</span> druvsocker&nbsp;+&nbsp;syrgas '
    '<span class="eq-note">(ljusenergi tillförs)</span></p>'
    '<p>Som balanserad formelekvation:</p>'
    '<p class="equation">6 CO<sub>2</sub> + 6 H<sub>2</sub>O <span class="eq-arrow">→</span> '
    'C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub></p>'
    '<p>Alla levande celler – i växter, djur och människor – gör sedan i princip tvärtom: de bryter ner '
    'druvsocker för att frigöra energin igen. Det kallas '
    '<strong class="term"><span class="concept-inline" data-concept="Cellandning">cellandning</span></strong> och sker '
    'i praktiskt taget alla kroppens celler, hela tiden.</p>'
    '<p class="equation">druvsocker&nbsp;+&nbsp;syrgas <span class="eq-arrow">→</span> koldioxid&nbsp;+&nbsp;vatten '
    '<span class="eq-note">(energi frigörs)</span></p>'
    '<p class="equation">C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6 O<sub>2</sub> <span class="eq-arrow">→</span> '
    '6 CO<sub>2</sub> + 6 H<sub>2</sub>O</p>'
    '<p>Lägg märke till att fotosyntes och cellandning är varandras motsatser: det som byggs upp i den ena '
    'bryts ner i den andra, och ämnena på vänster och höger sida byter plats. Allt kolhydrat, fett och protein '
    'du äter kan i grunden spåras tillbaka till druvsocker som en växt en gång byggde med hjälp av solljus.</p>'
    + viktigt(
        "Cellandning är INTE samma sak som andning (in- och utandning av luft genom lungorna). Cellandning är "
        "en kemisk process inuti cellerna som frigör energi ur maten – den pågår hela tiden i nästan alla celler."
    )
    + checkq(
        "Vilka ämnen bildas när druvsocker reagerar med syrgas vid cellandning?",
        "Koldioxid och vatten, samtidigt som energi frigörs.",
    )
    + fact(
        "Fotosyntes bygger upp druvsocker av koldioxid, vatten och ljusenergi. Cellandning bryter ner druvsocker "
        "med syrgas och frigör energi – den omvända reaktionen."
    )
    + next_steps(
        ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 1"),
        ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 1"),
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 2 – Kolhydrater
# ═══════════════════════════════════════════════════════════════════
M2 = (
    plain(
        '<p><strong class="term"><span class="concept-inline" data-concept="Kolhydrat">Kolhydrater</span></strong> '
        'byggs av kol, väte och syre. De är kroppens och cellernas viktigaste och snabbaste energikälla. Man delar in '
        'kolhydrater i tre grupper beroende på hur många sockerenheter de är byggda av: '
        '<strong class="term"><span class="concept-inline" data-concept="Monosackarid">monosackarider</span></strong> '
        '(en enda sockerenhet), <strong class="term"><span class="concept-inline" data-concept="Disackarid">disackarider</span></strong> '
        '(två sockerenheter bundna till varandra) och '
        '<strong class="term"><span class="concept-inline" data-concept="Polysackarid">polysackarider</span></strong> '
        '(många, ofta tusentals, sockerenheter i en lång kedja).</p>'
        '<p>De två vanligaste monosackariderna är <strong class="term"><span class="concept-inline" data-concept="druvsocker">druvsocker</span></strong> '
        '(glukos) och <strong class="term"><span class="concept-inline" data-concept="fruktsocker">fruktsocker</span></strong> (fruktos). '
        'Båda har samma molekylformel, C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> – men de är inte samma ämne. De har olika '
        'struktur (glukos bildar en sexring, fruktos har en annan uppbyggnad kring en ketongrupp), och kroppen behandlar '
        'dem delvis olika. En tredje monosackarid är <strong class="term"><span class="concept-inline" data-concept="galaktos">galaktos</span></strong>.</p>'
    )
    + figrow("glukos", "fruktos")
    + plain(
        '<p>Inte alla monosackarider har formeln C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> – det gäller bara sexkolsockrar. '
        'Det finns till exempel monosackarider med fem kolatomer (formeln C<sub>5</sub>H<sub>10</sub>O<sub>5</sub>), som '
        'ingår i cellernas arvsmassa.</p>'
        '<p>När två monosackarider binds ihop med en <strong class="term"><span class="concept-inline" data-concept="glykosidbindning">glykosidbindning</span></strong> '
        'bildas en disackarid. Vanligt hushållssocker, <strong class="term"><span class="concept-inline" data-concept="sackaros">sackaros</span></strong>, '
        'är druvsocker + fruktsocker. <strong class="term"><span class="concept-inline" data-concept="maltos">Maltos</span></strong> '
        '(mältsocker) är druvsocker + druvsocker, och <strong class="term"><span class="concept-inline" data-concept="laktos">laktos</span></strong> '
        '(mjölksocker) är druvsocker + galaktos.</p>'
        '<p>De stora energilagren och byggmaterialen i naturen är dock polysackarider: '
        '<strong class="term"><span class="concept-inline" data-concept="Stärkelse">stärkelse</span></strong> (i potatis, '
        'spannmål och andra växter), <strong class="term"><span class="concept-inline" data-concept="Cellulosa">cellulosa</span></strong> '
        '(i växters cellväggar) och <strong class="term"><span class="concept-inline" data-concept="Glykogen">glykogen</span></strong> '
        '(energilager hos djur och människor, i lever och muskler).</p>'
    )
    + viktigt(
        "Stärkelse och cellulosa är båda uppbyggda av <strong>glukos</strong> – inte fruktos! Det är lätt att blanda "
        "ihop de två sockerarterna eftersom de har samma molekylformel (C₆H₁₂O₆), men de har olika struktur."
    )
    + plain(
        "<p>Stärkelse och cellulosa är alltså båda glukoskedjor, men de ser helt olika ut och fungerar helt olika. "
        "Skillnaden ligger i <em>hur</em> glukosenheterna är bundna till varandra (glykosidbindningens vinkel). I "
        "stärkelse (α-1,4-bindning) böjer sig kedjan och bildar en spiral, vilket gör att människans matspjälkningsenzymer "
        "kan klyva den – vi kan äta potatis och bröd som energikälla. I cellulosa (β-1,4-bindning) blir kedjan i stället "
        "rak och utsträckt, vilket ger starka, stabila fibrer – men våra enzymer kan inte bryta ner den bindningstypen, "
        "så cellulosa fungerar som kostfiber i stället för energikälla.</p>"
        "<p>Bilderna nedan visar två glukosenheter ur var sin sorts kedja, för att tydligt visa skillnaden i form. I "
        "verkligheten är stärkelse- och cellulosakedjorna mycket längre (tusentals glukosenheter).</p>"
    )
    + figrow("maltos", "cellobios")
    + plain(
        checkq(
            "Vad är den viktigaste skillnaden mellan stärkelse och cellulosa, trots att båda är uppbyggda av glukos?",
            "Glukosenheterna är bundna med olika sorters glykosidbindning. Det gör att stärkelse bildar en böjd, "
            "spiralbenägen kedja som vi kan bryta ner, medan cellulosa bildar en rak, utsträckt kedja som vi inte kan "
            "bryta ner (kostfiber).",
        )
        + fact(
            "Monosackarid = en sockerenhet. Disackarid = två sockerenheter. Polysackarid = många sockerenheter i kedja. "
            "Stärkelse, cellulosa och glykogen är alla uppbyggda av glukos – bindningstypen avgör form och funktion."
        )
        + next_steps(
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 2"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 2"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 3 – Fetter
# ═══════════════════════════════════════════════════════════════════
M3 = (
    plain(
        "<p>Fetter (triglycerider) är uppbyggda av två sorters byggstenar: en "
        '<strong class="term"><span class="concept-inline" data-concept="Fettsyra">fettsyra</span></strong>-del och en '
        "alkoholdel. Alkoholdelen är alltid samma molekyl: glycerol, som har tre OH-grupper. Varje OH-grupp binder en "
        'fettsyra med en <strong class="term"><span class="concept-inline" data-concept="esterbindning">esterbindning</span></strong>, '
        "så att ett fett blir glycerol + tre fettsyror.</p>"
    )
    + figrow("glycerol")
    + viktigt("Fettets alkoholdel är alltid <strong>glycerol</strong> – aldrig butanol, trots att det är en vanlig missuppfattning.")
    + plain(
        '<p>En fettsyra är en lång kolkedja med en syragrupp (–COOH) i ena änden. Om det bara finns enkelbindningar '
        'mellan kolatomerna i kedjan är fettsyran <strong class="term"><span class="concept-inline" data-concept="Mättat fett">mättad</span></strong>. '
        'Om kedjan har en eller flera dubbelbindningar är fettsyran '
        '<strong class="term"><span class="concept-inline" data-concept="Omättat fett">omättad</span></strong>. Det är alltså '
        "<strong>antalet dubbelbindningar</strong> som avgör om ett fett räknas som mättat eller omättat – inget annat.</p>"
        "<p>Mättade, raka fettsyrekedjor kan packas tätt intill varandra, vilket ger starkare bindningar mellan "
        "molekylerna – sådana fetter (t.ex. i smör och fett kött) är oftast fasta i rumstemperatur. En dubbelbindning "
        "ger däremot en fast vinkel – en \"knäck\" – i kedjan, så att molekylerna inte kan packas lika tätt. Sådana "
        "fetter (t.ex. olivolja, rapsolja) är oftast flytande i rumstemperatur.</p>"
    )
    + figrow("palmitinsyra", "oljesyra")
    + plain(
        checkq(
            "Varför är omättade fetter, som olivolja, oftast flytande vid rumstemperatur medan mättade fetter, som smör, oftast är fasta?",
            "Omättade fettsyrors dubbelbindningar ger en knäck i kedjan, så molekylerna packas glesare. Mättade "
            "fettsyrors raka kedjor packas tätt, vilket ger starkare bindningar mellan molekylerna och ett fast ämne.",
        )
        + "<p>Fett innehåller ungefär <strong>dubbelt så mycket energi per gram</strong> som kolhydrater eller protein. "
        "Det gör fett till kroppens mest energitäta näringsämne, men också det som lättast bidrar till ett energiöverskott "
        "om man äter för mycket av det.</p>"
        + '<p>Genom att tillsätta väte till ett omättat fetts dubbelbindningar kan man göra fettet mer mättat – det '
        'kallas att <strong class="term"><span class="concept-inline" data-concept="härdat fett">härda</span></strong> '
        "fettet (hydrogenering). Härdning gör att flytande vegetabiliska oljor kan göras om till fastare fetter, till "
        "exempel vid tillverkning av margarin.</p>"
        "<p>Ett riktigt fett (en triglycerid) har oftast en blandning av mättade och omättade fettsyror bundna till "
        "samma glycerolmolekyl:</p>"
    )
    + figrow("triglycerid")
    + plain(
        fact(
            "Fett = glycerol + tre fettsyror, bundna med esterbindningar. Mättat/omättat avgörs av antalet "
            "dubbelbindningar i fettsyrans kolkedja. Fett innehåller ungefär dubbelt så mycket energi per gram som "
            "kolhydrater."
        )
        + next_steps(
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 3"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 3"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 4 – Proteiner
# ═══════════════════════════════════════════════════════════════════
M4 = (
    plain(
        '<p><strong class="term"><span class="concept-inline" data-concept="Protein">Protein</span></strong> byggs av '
        'långa kedjor av <strong class="term"><span class="concept-inline" data-concept="Aminosyra">aminosyror</span></strong>. '
        'Varje aminosyra har en <strong class="term"><span class="concept-inline" data-concept="aminogrupp">aminogrupp</span></strong> '
        "(–NH₂) och en karboxylgrupp (–COOH) på samma kolatom, plus en sidokedja (kallad R-gruppen) som skiljer sig åt "
        "mellan olika aminosyror. Alla aminosyror innehåller kol, väte, syre och kväve – kväve är det som skiljer "
        "aminosyror (och protein) från kolhydrater och fett. Några aminosyror har dessutom svavel i sidokedjan.</p>"
    )
    + figrow("glycin", "alanin", "cystein")
    + plain(
        "<p>Glycin har ingen sidokedja alls (bara väte), alanin har en liten kolkedja (metylgrupp) som sidokedja, och "
        "cystein har svavel i sin sidokedja – jämför bilderna ovan.</p>"
        "<p>Det finns cirka 20 vanliga aminosyror i kroppen. Ungefär nio av dem kallas "
        '<strong class="term"><span class="concept-inline" data-concept="Essentiell aminosyra">essentiella aminosyror</span></strong> '
        "– kroppen kan inte tillverka dem själv, utan de måste komma från maten.</p>"
        '<p>När två aminosyror binds ihop bildas en <strong class="term"><span class="concept-inline" data-concept="peptidbindning">peptidbindning</span></strong> '
        "mellan karboxylgruppen på den ena och aminogruppen på den andra, samtidigt som en vattenmolekyl frigörs. "
        "Upprepas det många gånger bildas en lång proteinkedja.</p>"
    )
    + figrow("dipeptid")
    + plain(
        "<p>Proteiner har många olika uppgifter i kroppen: de är byggmaterial (muskler, hud, hår), de transporterar "
        "ämnen (t.ex. syre i blodets hemoglobin), de fungerar som hormoner och som antikroppar i immunförsvaret. En av "
        "de viktigaste uppgifterna är att fungera som "
        '<strong class="term"><span class="concept-inline" data-concept="enzym">enzymer</span></strong> – proteiner som '
        "påskyndar kemiska reaktioner i kroppen utan att själva förbrukas.</p>"
    )
    + viktigt("Enzymer ÄR proteiner – de är inte en egen, separat sorts ämne.")
    + plain(
        '<p>Ett proteins funktion beror på dess exakta tredimensionella form. Värme, stark syra eller stark bas kan få '
        'proteinet att veckla ut sig och förlora sin form – det kallas '
        '<strong class="term"><span class="concept-inline" data-concept="denaturering">denaturering</span></strong>, och '
        "det går oftast inte att återställa. Ett vardagligt exempel är när man steker ett ägg: äggvitans protein "
        "denatureras av värmen, blir vitt och ogenomskinligt i stället för klart och rinnande, och kan inte återgå till "
        "sitt ursprungliga tillstånd.</p>"
        + checkq(
            "Vad händer med ett protein när det denatureras, och kan det oftast återgå till sin ursprungliga form?",
            "Proteinets tredimensionella form vecklas ut eller ändras, till exempel av värme, och det förlorar sin "
            "funktion. Det kan oftast INTE återgå till sin ursprungliga form.",
        )
        + fact(
            "Protein = kedjor av aminosyror bundna med peptidbindningar. Aminosyror innehåller alltid C, H, O och N "
            "(några även S). Enzymer är proteiner. Denaturering förstör proteinets form och funktion, oftast permanent."
        )
        + next_steps(
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 4"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 4"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 5 – Sammanfattning: energilager i naturen
# ═══════════════════════════════════════════════════════════════════
M5 = plain(
    '<p>Allt hänger ihop: växter fångar solens energi genom <strong class="term"><span class="concept-inline" '
    'data-concept="Fotosyntes">fotosyntesen</span></strong> och bygger druvsocker. Det druvsockret kan användas direkt '
    'som energi genom <strong class="term"><span class="concept-inline" data-concept="Cellandning">cellandning</span></strong>, '
    "eller lagras för senare bruk.</p>"
    '<p>Växter lagrar sin energi som <strong class="term"><span class="concept-inline" data-concept="Stärkelse">stärkelse</span></strong>. '
    'Djur och människor lagrar i stället sin energi som <strong class="term"><span class="concept-inline" '
    'data-concept="Glykogen">glykogen</span></strong>, i lever och muskler. Båda är polysackarider uppbyggda av '
    "glukosenheter och fungerar som energilager – skillnaden är vilken organism som bygger dem, och hur kedjorna är "
    "förgrenade.</p>"
    "<p>När ett djur äter en växt kan kroppen bryta ner växtens kolhydrater, fetter och proteiner till byggstenar "
    "(glukos, glycerol och fettsyror, aminosyror) och energi, och sedan använda dem för att bygga sina egna molekyler "
    "– till exempel egna proteiner, med hjälp av kväve och andra ämnen från maten.</p>"
    + fact(
        "Växter lagrar energi som stärkelse. Djur och människor lagrar energi som glykogen. Båda är "
        "glukospolysackarider – precis som allt i det här kapitlet bygger vidare på druvsockret från fotosyntesen i "
        "milstolpe 1."
    )
    + "<p>Maten innehåller förstås mer än kolhydrater, fett och protein – även vitaminer och mineraler behövs. Det "
    'tar den här studieguiden inte upp i detalj. Vill du lära dig mer om vitaminer och mineraler i maten? Testa '
    'lagspelet <a href="/spel/hastkapplopning/">Hästkapplöpning</a>.</p>'
    + next_steps(
        ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 5"),
        ("./ovningsprov.html", "Öva", "Hela övningsprovet"),
    )
)

MILESTONES = [
    (1, "m1", "Fotosyntes och cellandning", M1),
    (2, "m2", "Kolhydrater – druvsocker till stärkelse", M2),
    (3, "m3", "Fetter – uppbyggnad och energi", M3),
    (4, "m4", "Proteiner – aminosyror och enzymer", M4),
    (5, "m5", "Sammanfattning – energilager i naturen", M5),
]

HEAD = """<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studieguide – Matens kemi</title>
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/studieguide-bildkolumn.css" />
  <link rel="stylesheet" href="/css/molviewer.css" />
  <link rel="stylesheet" href="/css/viktigt.css" />

  <style>
    :root {
      --guide-accent: #9a3412; --guide-soft: #fff7ed; --guide-border: #fed7aa; --guide-dash: #fed7aa;
      --listen-color: #9a3412;
      --listen-border: #fed7aa;
      --listen-hover-bg: #fff7ed;
    }

    main { font-size: 1.1em; max-width: 820px; margin: 0 auto; }

    .guide-intro {
      background: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #9a3412;
      border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 1.25rem;
    }
    .guide-intro p { margin: 0.35rem 0; }

    .milestone {
      background: #fff; border: 1px solid #d8d8d8; border-radius: 12px; margin-bottom: 0.9rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;
    }
    .milestone > summary {
      list-style: none; cursor: pointer; padding: 1rem 1.1rem; display: flex; align-items: center;
      gap: 0.75rem; font-weight: 600; color: #1a1a2e;
    }
    .milestone > summary::-webkit-details-marker { display: none; }
    .milestone > summary::before { content: "▸"; color: #9a3412; transition: transform 0.15s ease; flex-shrink: 0; }
    .milestone[open] > summary::before { transform: rotate(90deg); }
    .m-num {
      background: #9a3412; color: #fff; font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem;
      border-radius: 999px; flex-shrink: 0;
    }
    .m-title { flex: 1; }

    .equation {
      text-align: center; font-size: 1.12em; background: #fafafa; border: 1px solid #e2e2e2;
      border-radius: 8px; padding: 0.55rem 0.8rem; margin: 0.5rem 0;
    }
    .eq-arrow { color: #9a3412; font-weight: 700; padding: 0 0.35rem; }
    .eq-note { font-size: 0.82em; color: #666; }

    .pill-btn { background:#fff7ed; border:1px solid #fed7aa; border-radius:999px; padding:0.4rem 1rem; font-size:0.95rem; font-weight:600; color:#9a3412; cursor:pointer; min-height:44px; font-family:inherit; }
    .pill-btn:hover { background:#ffedd5; }
    .pill-btn[aria-pressed="true"] { background:#9a3412; color:#fff; border-color:#9a3412; }
    .pill-btn:focus-visible { outline:3px solid #1d4ed8; outline-offset:2px; }

    .check-q { background:#eff6ff; border-left:4px solid #2563eb; border-radius:6px; padding:0.7rem 0.95rem; margin:0.9rem 0; }
    .check-q > summary { cursor:pointer; font-weight:600; color:#1e3a8a; list-style:none; }
    .check-q > summary::-webkit-details-marker { display:none; }
    .check-q > summary::before { content: "✓ Kontrollera dig själv: "; }
    .check-q > summary::after { content: " (visa svar)"; font-weight:400; color:#64748b; }
    .check-q[open] > summary::after { content: " (dölj svar)"; }
    .check-q .svar { margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed #bfdbfe; }

    .m-body a:not(.cite):not(.n-label) { color: #9a3412; }

    .references { margin-top:2rem; padding-top:1rem; border-top:1px solid #d8d8d8; font-size:0.9rem; line-height:1.65; }
    .references h2 { font-size:1rem; color:#9a3412; margin:0 0 0.6rem; }
    .references ol { margin:0 0 0 1.3rem; }
    .references li { margin-bottom:0.4rem; }
    .references a { color:#9a3412; text-decoration:underline; }

    details.milestone { scroll-margin-top: 0.75rem; }
    @media (max-width: 520px) { main { font-size: 1.05em; } .milestone .m-title { font-size: 1rem; } }
  </style>
</head>
<body class="area-matens-kemi">

  <header class="kemi-header">
    <h1>Studieguide – Matens kemi</h1>
  </header>

  <button class="hamburger" onclick="toggleMenu()">☰</button>
  <nav id="side-menu"></nav>

  <main class="guide-wide">
    <p style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
      <a href="/kemi/matens-kemi/" class="subject-btn">← Tillbaka till Matens kemi</a>
    </p>

    <div class="guide-intro">
      <p><strong>5 milstolpar</strong> – från fotosyntesen till matens tre stora makromolekyler: kolhydrater, fetter och protein.</p>
      <p>Expandera en milstolpe genom att klicka på den. Gå igenom dem i ordning första gången.</p>
      <p>Rutor med gul bakgrund och en varningstriangel är märkta <strong>Viktigt!</strong> – där står det du särskilt måste komma ihåg.</p>
      <p>Kulmodellerna kan du <strong>rotera med musen eller fingret</strong>. Har du svårt att skilja färger kan du slå på atombokstäver på kulorna:</p>
      <p><button type="button" id="lbl-btn" class="pill-btn" aria-pressed="false">Bokstäver på kulorna i 3D-modellerna: <span id="lbl-state" aria-hidden="true">av</span></button></p>
      <p style="margin-top:0.5rem;">
        <button onclick="toggleAllMilestones(true)"
          style="margin-right:0.5rem; padding:0.3rem 0.8rem; border:1px solid #ccc; border-radius:6px; background:#f4f6fa; cursor:pointer; font-family:inherit;">
          Expandera alla
        </button>
        <button onclick="toggleAllMilestones(false)"
          style="padding:0.3rem 0.8rem; border:1px solid #ccc; border-radius:6px; background:#f4f6fa; cursor:pointer; font-family:inherit;">
          Kollapsa alla
        </button>
      </p>
      <div class="concept-lang-selector-mount" data-begrepp-base="./data/begrepp" data-termer-base="./data/termer"></div>
    </div>
"""

TAIL = """
    <section class="references" id="kallor">
      <h2>Källor</h2>
      <ol>
        <li id="ref-1">Livsmedelsverket. <em>Kolhydrater, fett och protein</em> (allmän fakta om näringsämnen). <a href="https://www.livsmedelsverket.se/" target="_blank" rel="noopener">livsmedelsverket.se</a></li>
        <li id="ref-2">1177 Vårdguiden. <em>Kost och näring</em>. <a href="https://www.1177.se/" target="_blank" rel="noopener">1177.se</a></li>
        <li id="ref-3">Nordiska ministerrådet. <em>Nordic Nutrition Recommendations 2023 (NNR2023)</em> (energitäthet, kcal/g för fett/kolhydrat/protein). <a href="https://www.norden.org/" target="_blank" rel="noopener">norden.org</a></li>
        <li id="ref-4">Chemicalbook. Databas för kemiska ämnen (SMILES/struktur för glukos, fruktos, maltos). <a href="https://www.chemicalbook.com/" target="_blank" rel="noopener">chemicalbook.com</a></li>
        <li id="ref-5">PubChem, National Library of Medicine. Molekylformler och allmän kemisk fakta. <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener">pubchem.ncbi.nlm.nih.gov</a></li>
        <li id="ref-6">Wikipedia (svenska/engelska). Bakgrundskontroll av allmänt kända fakta om enskilda ämnen (glukos, fruktos, glykogen, cellulosa, fettsyror, aminosyror). <a href="https://sv.wikipedia.org/" target="_blank" rel="noopener">sv.wikipedia.org</a></li>
      </ol>
      <p style="font-size:0.82rem;color:#4a4a4a;font-style:italic;margin-top:0.6rem;">Texten i studieguiden är självständigt formulerad utifrån allmän kemi-/näringslärekunskap. Ingen text är kopierad från någon lärobok. Alla bilder (strukturformler och 3D-kulmodeller) är genererade för den här sajten från molekylernas kemiska formler – se OVERLAMNING.md för metod och en not om en härledd struktur (cellobios).</p>
    </section>

  </main>

  <script src="/js/menu.js"></script>
  <script src="/js/lyssna.js" data-audio-base="/kemi/matens-kemi/audio/"></script>
  <script>
    function toggleAllMilestones(open) {
      document.querySelectorAll('details.milestone').forEach(function(d) { d.open = open; });
    }
    (function () {
      function openHash() {
        var h = window.location.hash;
        if (!h) return;
        var el = document.querySelector('details.milestone' + h);
        if (el) {
          el.open = true;
          setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
        }
      }
      openHash();
      window.addEventListener('hashchange', openHash);
    })();
  </script>
  <script>
    (function () {
      var btn = document.getElementById('lbl-btn'), st = document.getElementById('lbl-state');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        st.textContent = on ? 'på' : 'av';
        if (window.MolViewer) MolViewer.setLabels(on);
      });
    })();
  </script>
  <script src="/js/3Dmol-min.js"></script>
  <script src="/kemi/matens-kemi/js/molmodeller.js"></script>
  <script src="/js/molviewer.js"></script>
  <script src="/js/language-selector.js"></script>
  <script src="/js/concepts-popup.js"></script>
  <script src="/js/concept-lang-selector.js"></script>
  <script>
    fetch("./data/begrepp.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.length) return;
        window.BEGREPP = data;
        var savedConceptLang = 'sv-SE';
        try { savedConceptLang = localStorage.getItem('site.concept-lang') || 'sv-SE'; } catch (e) {}
        if (savedConceptLang === 'sv-SE' && window.BEGREPPPopup) window.BEGREPPPopup.update(data);
      })
      .catch(function (e) { console.warn('Kunde inte hämta begrepp.json', e); });
  </script>
</body>
</html>
"""


def main():
    body = "".join(milestone(n, mid, title, txt) for (n, mid, title, txt) in MILESTONES)
    # Milstolpe 1 öppen från början, som i syror-och-baser
    body = body.replace('<details class="milestone" id="m1">', '<details class="milestone" id="m1" open>', 1)
    out = HEAD + body + TAIL
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)
    print("skrev", OUT, len(out), "tecken")


if __name__ == "__main__":
    main()
