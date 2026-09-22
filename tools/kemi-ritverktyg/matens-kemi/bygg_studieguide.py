#!/usr/bin/env python3
"""Genererar kemi/matens-kemi/studieguide.html ("kort kemikapitel" – bred studieguide med
bildkolumn, live-3D direkt i molekylkorten, se CLAUDE.md "Live-3D i korta kemikapitel").
Text och struktur är källan (den här filen) – studieguide.html byggs alltid om från den,
den ska aldrig handredigeras. Molekylkorten kommer från bygg_maten.card_html(), så bild och
kort hålls i synk automatiskt.

OMBYGGD 22 sep 2026 efter Jespers pedagogiska feedback: 4 milstolpar (var 5), fördjupningsrutor
för det som är för avancerat för huvudtexten, gula rutor bara i högerkolumnen. Se OVERLAMNING.md,
avsnittet "Ombyggnad efter Jespers feedback (22 sep 2026)".

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


def sidefig(*card_htmls):
    """En eller flera .mol-card/figur-block staplade i höger sidokolumn (.m-side)."""
    return "".join(f'<figure class="side-fig">{c}</figure>' for c in card_htmls)


def illust(path, alt, caption, w, h):
    """Fristående illustration (ingen 3D, inget mol-card) i sidokolumnen eller i löptexten."""
    return (f'<figure class="side-fig"><img src="{path}" width="{w}" height="{h}" alt="{alt}" loading="lazy">'
            f'<figcaption>{caption}</figcaption></figure>')


def figrow(*keys):
    figs = "".join(f'<figure class="side-fig">{card(k)}</figure>' for k in keys)
    return f'<div class="m-row m-row--full"><div class="fig-row">{figs}</div></div>'


def figs_inline(*keys):
    """Som figrow(), men UTAN m-row-omslaget – för bilder inne i en <details class="deepen"> som
    inte är en rad i milstolpens bild-kolumn-rutnät."""
    figs = "".join(f'<figure class="side-fig">{card(k)}</figure>' for k in keys)
    return f'<div class="fig-row">{figs}</div>'


def row(lead, side="", rest=""):
    """En rad i bild-kolumn-rutnätet: text till vänster (lead), bilder/rutor till höger (side),
    valfri fortsättningstext under lead (rest). Se CLAUDE.md "Bred studieguide med bildkolumn"."""
    out = f'<div class="m-row"><div class="m-lead">{lead}</div>'
    if side:
        out += f'<div class="m-side">{side}</div>'
    if rest:
        out += f'<div class="m-rest">{rest}</div>'
    out += "</div>"
    return out


def viktigt(html):
    return (
        '<div class="viktigt" role="note"><svg class="viktigt-mark" viewBox="0 0 32 32" aria-hidden="true" '
        'focusable="false"><path d="M16 3 30 28H2z" fill="#7a5a00"/><path d="M16 12v8" stroke="#fff3b0" '
        'stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="24" r="1.8" fill="#fff3b0"/></svg>'
        f'<div class="viktigt-body"><strong class="viktigt-label">Viktigt!</strong><p>{html}</p></div></div>'
    )


def deepen(summary, *parts):
    """Fällbar fördjupningsruta (klass .deepen, se src/studieguide.css + OVERLAMNING.md för varför
    den delade .deepen-komponenten återanvänds i stället för en ny .fordjupning-klass). Hopfälld som
    standard – <summary> säger vad den handlar om."""
    return f'<details class="deepen"><summary>{summary}</summary>{"".join(parts)}</details>'


def checkq(q, a):
    return f'<details class="check-q"><summary>{q}</summary><div class="svar"><strong>Svar:</strong> {a}</div></details>'


def fact(html):
    return f'<div class="fact-box"><strong>Kom ihåg</strong>{html}</div>'


def next_steps(*links):
    items = "".join(f'<a href="{href}"><span class="n-label">{label}</span>{text}</a>' for href, label, text in links)
    return f'<div class="next-steps">{items}</div>'


def plain(*parts):
    return '<div class="m-row m-row--plain"><div class="m-lead">' + "".join(parts) + "</div></div>"


def sugar_table():
    """Förenklad tabell över de vanligaste mono- och disackariderna (Jespers krav: 'lagom nivå',
    kondenserade formler i en tabell – detaljerad strukturformel + 3D visas i stället bredvid, bara
    för glukos, se m-side)."""
    rows_mono = [
        ("Glukos", "druvsocker", "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "sexring", "frukt, honung, blodsocker"),
        ("Fruktos", "fruktsocker", "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "öppen kedja, ketongrupp", "frukt, honung"),
        ("Galaktos", "", "C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "sexring", "ingår i laktos (mjölksocker)"),
    ]
    rows_di = [
        ("Sackaros", "vanligt hushållssocker", "glukos + fruktos"),
        ("Maltos", "mältsocker", "glukos + glukos"),
        ("Laktos", "mjölksocker", "glukos + galaktos"),
    ]
    mono_html = "".join(
        f'<tr><td>{namn}{f" ({vardag})" if vardag else ""}</td><td class="sf">{formel}</td><td>{form}</td><td>{finns}</td></tr>'
        for namn, vardag, formel, form, finns in rows_mono
    )
    di_html = "".join(
        f'<tr><td>{namn} ({vardag})</td><td class="sf" colspan="3">{bestar}</td></tr>'
        for namn, vardag, bestar in rows_di
    )
    return (
        '<div class="tbl-scroll"><table class="sugar-table">'
        '<caption>Förenklad översikt – detaljerad strukturformel och 3D-modell för glukos finns i bildkolumnen.</caption>'
        '<thead><tr><th colspan="4">Monosackarider (en sockerenhet)</th></tr>'
        '<tr><th>Namn</th><th>Formel</th><th>Form</th><th>Finns i</th></tr></thead>'
        f'<tbody>{mono_html}</tbody>'
        '<thead><tr><th colspan="4">Disackarider (två sockerenheter)</th></tr></thead>'
        f'<tbody>{di_html}</tbody>'
        '</table></div>'
    )


def fn_list():
    """Fyra funktionstyper för proteiner, med minst ett källbelagt exempel var (se kallor.json:
    Livsmedelsverket/NE-artiklar om kollagen, aktin/myosin, amylas, insulin)."""
    items = [
        ("Byggnadsmaterial", "Kollagen bygger upp hud, senor och brosk. Keratin bygger upp hår och naglar."),
        ("Muskelrörelse", "Aktin och myosin är två proteiner som glider mot varandra och gör att muskler kan dra ihop sig."),
        ("Enzym", "Amylas i saliv och tunntarm klyver stärkelse till mindre sockermolekyler (samma stärkelse som i milstolpe 1)."),
        ("Hormon", "Insulin är ett protein-hormon som styr hur celler tar upp druvsocker ur blodet."),
    ]
    lis = "".join(f'<li><strong class="fn-typ">{typ}:</strong>{ex}</li>' for typ, ex in items)
    return f'<ul class="fn-list">{lis}</ul>'


# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 1 – Kolhydrater
# ═══════════════════════════════════════════════════════════════════
M1 = (
    plain(
        '<p>Växter bygger druvsocker och stärkelse genom fotosyntesen, som du redan känner till från '
        'tidigare. Det druvsockret är utgångspunkten för allt i det här kapitlet.</p>'
        '<p><strong class="term"><span class="concept-inline" data-concept="Kolhydrat">Kolhydrater</span></strong> '
        'byggs av kol, väte och syre. De är kroppens och cellernas viktigaste och snabbaste energikälla. Man delar in '
        'kolhydrater i tre grupper beroende på hur många sockerenheter de är byggda av: '
        '<strong class="term"><span class="concept-inline" data-concept="Monosackarid">monosackarider</span></strong> '
        '(en enda sockerenhet), <strong class="term"><span class="concept-inline" data-concept="Disackarid">disackarider</span></strong> '
        '(två sockerenheter bundna till varandra) och '
        '<strong class="term"><span class="concept-inline" data-concept="Polysackarid">polysackarider</span></strong> '
        '(många, ofta tusentals, sockerenheter i en lång kedja).</p>'
    )
    + row(
        '<p>Tabellen visar de vanligaste enskilda sockerarterna som förenklade formler. Lägg märke till att '
        'glukos, fruktos och galaktos alla har samma molekylformel (C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>) men '
        'olika uppbyggnad – de är inte samma ämne.</p>'
        + sugar_table()
        + '<p>När två monosackarider binds ihop med en <strong class="term"><span class="concept-inline" '
        'data-concept="glykosidbindning">glykosidbindning</span></strong> bildas en disackarid, som i exemplen i '
        'tabellen ovan.</p>',
        sidefig(MOL.detailed_glucose_card_html())
    )
    + deepen(
        "Glukos kan vara både rak och ringformad",
        '<p>Glukosmolekylen som visas ovan är ritad som en ring (den formen den nästan alltid har i '
        'vattenlösning – över 99%). Men samma molekyl kan också skrivas som en öppen, rak kedja med en '
        'aldehydgrupp i änden. De två formerna omvandlas ständigt fram och tillbaka till varandra.</p>'
        + figs_inline("glukos_oppen")
        + '<p>Det är den öppna kedjans aldehydgrupp som gör att druvsocker kan påvisas med vissa kemiska '
          'tester (t.ex. Fehlings prov, om ni gjort det i labb).</p>'
    )
    + deepen(
        "Fler viktiga sockermolekyler i organismerna",
        '<p>Glukos, fruktos och galaktos är inte de enda viktiga monosackariderna. Ribos och deoxiribos är '
        'femkolssockrar (C<sub>5</sub>) som inte används som energikälla, utan som byggstenar.</p>'
        + figs_inline("ribos", "deoxiribos")
        + '<p>Ribos och deoxiribos utgör, tillsammans med fosfatgrupper, själva ryggraden i de långa '
          'molekylerna RNA respektive DNA – cellernas arvsmassa och "instruktionsböcker".</p>'
    )
    + plain(
        '<p>De stora energilagren och byggmaterialen i naturen är polysackarider: '
        '<strong class="term"><span class="concept-inline" data-concept="Stärkelse">stärkelse</span></strong> (i potatis, '
        'spannmål och andra växter), <strong class="term"><span class="concept-inline" data-concept="Cellulosa">cellulosa</span></strong> '
        '(i växters cellväggar) och <strong class="term"><span class="concept-inline" data-concept="Glykogen">glykogen</span></strong> '
        '(energilager hos djur och människor, i lever och muskler). Stärkelse, cellulosa och glykogen är alla '
        'uppbyggda av upprepade <strong>glukos</strong>-enheter, inte fruktos.</p>'
    )
    + row(
        '<p>Stärkelse och cellulosa är alltså båda glukoskedjor, men de ser helt olika ut och fungerar helt olika. '
        'Skillnaden ligger i <em>hur</em> glukosenheterna är bundna till varandra (glykosidbindningens vinkel). I '
        'stärkelse (α-1,4-bindning) böjer sig kedjan och bildar en spiral, vilket gör att människans matspjälkningsenzymer '
        'kan klyva den – vi kan äta potatis och bröd som energikälla. I cellulosa (β-1,4-bindning) blir kedjan i stället '
        'rak och utsträckt, vilket ger starka, stabila fibrer – men våra enzymer kan inte bryta ner den bindningstypen, '
        'så cellulosa fungerar som kostfiber i stället för energikälla.</p>'
        '<p>Bilderna nedan visar två glukosenheter ur var sin sorts kedja, för att tydligt visa skillnaden i form. I '
        'verkligheten är stärkelse- och cellulosakedjorna mycket längre (tusentals glukosenheter).</p>',
        viktigt(
            "Stärkelse och cellulosa är båda uppbyggda av <strong>glukos</strong> – inte fruktos! Det är lätt att blanda "
            "ihop de två sockerarterna eftersom de har samma molekylformel (C₆H₁₂O₆), men de har olika struktur."
        )
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
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 1"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 1"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 2 – Fetter
# ═══════════════════════════════════════════════════════════════════
FETT_SVG = "/images/kemi/matens-kemi/strukturformler/fett-oversikt.svg"
_fw, _fh = MOL._svg_dims(MOL.IMG / "strukturformler" / "fett-oversikt.svg")

M2 = (
    row(
        '<p>Fett finns i till exempel smör, olja, nötter, ost och fet fisk. I kroppen används fett som '
        'energilager (kroppens mest energitäta förråd), som isolering mot kyla och som byggmaterial i alla '
        'cellers membran.</p>'
        '<p>Ett fett (en <strong class="term"><span class="concept-inline" data-concept="Fettsyra">triglycerid</span></strong>) '
        'är uppbyggt av två sorters byggstenar: en alkoholdel och tre fettsyror. Alkoholdelen är alltid samma '
        'molekyl: <strong>glycerol</strong>, som har tre OH-grupper.</p>',
        viktigt("Fettets alkoholdel är alltid <strong>glycerol</strong> – aldrig butanol, trots att det är en vanlig missuppfattning.")
    )
    + row(
        '<p>Varje OH-grupp på glycerol binder en '
        '<strong class="term"><span class="concept-inline" data-concept="Fettsyra">fettsyra</span></strong> med en '
        '<strong class="term"><span class="concept-inline" data-concept="esterbindning">esterbindning</span></strong>, '
        'så att ett fett blir glycerol + tre fettsyror. Bilden till höger visar principen: glycerol som en tjock '
        '"E"-form med tre armar, och en fettsyra kopplad till varje arm.</p>',
        illust(FETT_SVG,
               'Schematisk bild av en triglycerid: en tjock, blågrå "E"-formad figur (glycerol, märkt "G") har tre '
               'armar. I änden av varje arm sitter ett rektangulärt block (en fettsyra). Två block är orange och '
               'märkta "Fettsyra 1 (mättad)" och "Fettsyra 3 (mättad)". Det mittersta blocket är turkost, har en '
               'tydlig pilspets-liknande knäck i formen, och är märkt "Fettsyra 2 (omättad – knäck)".',
               'Principskiss: glycerol (G) med tre armar, en fettsyra kopplad till varje arm. Den mittersta fettsyran '
               'har medvetet en annan form (knäck) för att senare kunna kopplas till omättat fett.',
               round(_fw / 1.4), round(_fh / 1.4))
    )
    + plain('<p>Ritad som strukturformel, med esterbindningarna (–O–C(=O)–) och glycerolstommen tydligt utsatta, ser samma molekyl ut så här:</p>')
    + figrow("triglycerid")
    + plain(
        '<p>En fettsyra är en lång kolkedja med en syragrupp (–COOH) i ena änden. Om det bara finns enkelbindningar '
        'mellan kolatomerna i kedjan är fettsyran <strong class="term"><span class="concept-inline" data-concept="Mättat fett">mättad</span></strong>. '
        'Om kedjan har en eller flera dubbelbindningar är fettsyran '
        '<strong class="term"><span class="concept-inline" data-concept="Omättat fett">omättad</span></strong>. Det är '
        '<strong>antalet dubbelbindningar</strong> som avgör om ett fett räknas som mättat eller omättat – inget annat.</p>'
        '<p>Mättade, raka fettsyrekedjor packas tätt intill varandra, vilket ger starkare bindningar mellan '
        'molekylerna – sådana fetter (t.ex. smör, fett kött) är oftast fasta i rumstemperatur. En dubbelbindning '
        'ger i stället en "knäck" i kedjan, så att molekylerna inte kan packas lika tätt. Sådana fetter (t.ex. '
        'olivolja, rapsolja) är oftast flytande i rumstemperatur.</p>'
    )
    + figrow("palmitinsyra", "oljesyra")
    + plain(
        checkq(
            "Varför är omättade fetter, som olivolja, oftast flytande vid rumstemperatur medan mättade fetter, som smör, oftast är fasta?",
            "Omättade fettsyrors dubbelbindningar ger en knäck i kedjan, så molekylerna packas glesare. Mättade "
            "fettsyrors raka kedjor packas tätt, vilket ger starkare bindningar mellan molekylerna och ett fast ämne.",
        )
        + "<p>Fett innehåller ungefär <strong>dubbelt så mycket energi per gram</strong> som kolhydrater eller protein – "
        "kroppens mest energitäta näringsämne.</p>"
        + '<p>Genom att tillsätta väte till ett omättat fetts dubbelbindningar kan man <strong class="term">'
        '<span class="concept-inline" data-concept="härdat fett">härda</span></strong> fettet (hydrogenering), så att '
        "det blir mer mättat och stelnar – till exempel vid tillverkning av margarin.</p>"
        + fact(
            "Fett = glycerol + tre fettsyror, bundna med esterbindningar. Mättat/omättat avgörs av antalet "
            "dubbelbindningar i fettsyrans kolkedja. Fett innehåller ungefär dubbelt så mycket energi per gram som "
            "kolhydrater."
        )
        + next_steps(
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 2"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 2"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 3 – Proteiner
# ═══════════════════════════════════════════════════════════════════
PROT_SVG = "/images/kemi/matens-kemi/strukturformler/protein-veckning.svg"
_pw, _ph = MOL._svg_dims(MOL.IMG / "strukturformler" / "protein-veckning.svg")

M3 = (
    plain(
        '<p><strong class="term"><span class="concept-inline" data-concept="Protein">Protein</span></strong> är '
        'långa kedjor av <strong class="term"><span class="concept-inline" data-concept="Aminosyra">aminosyror</span></strong> '
        '– kroppens byggstenar för allt från muskler till hormoner. Det finns cirka 20 olika aminosyror, och '
        'ordningen de sitter i bestämmer vilket protein det blir.</p>'
    )
    + row(
        '<p>Proteiner har många olika uppgifter i kroppen. Här är fyra typer av funktion, med exempel:</p>'
        + fn_list(),
        viktigt("Enzymer ÄR proteiner – de är inte en egen, separat sorts ämne.")
    )
    + row(
        '<p>Aminosyrorna i kedjan binds ihop med en <strong class="term"><span class="concept-inline" '
        'data-concept="peptidbindning">peptidbindning</span></strong> mellan varje par. Men den färdiga kedjan '
        'ligger inte rak – den veckas ihop till en unik tredimensionell form, och det är just den formen som '
        'avgör vad proteinet kan göra.</p>',
        illust(PROT_SVG,
               'Schematisk bild i två delar. Till vänster: åtta olika färgade kulor (märkta A till H) i en rak rad, '
               'kopplade med linjer, med texten "Kedja av aminosyror". En pil pekar till höger. Till höger: samma '
               'åtta färgade kulor, hopvecklade i en tät, orm-liknande bana i två kolumner och fyra rader, med '
               'texten "Veckad till sin form".',
               'Principskiss: aminosyror (färgade kulor, en bokstav var) i en rak kedja veckas till en kompakt, '
               'unik 3D-form.',
               round(_pw / 1.5), round(_ph / 1.5))
    )
    + plain(
        '<p>Ungefär nio av de 20 aminosyrorna kallas <strong class="term"><span class="concept-inline" '
        'data-concept="Essentiell aminosyra">essentiella aminosyror</span></strong> – kroppen kan inte tillverka '
        'dem själv, utan de måste komma från maten.</p>'
        '<p>Ett proteins funktion beror på dess exakta form. Värme, stark syra eller stark bas kan få proteinet '
        'att veckla ut sig och förlora sin form – det kallas <strong class="term"><span class="concept-inline" '
        'data-concept="denaturering">denaturering</span></strong>, och det går oftast inte att återställa. Ett '
        'vardagligt exempel är när man steker ett ägg: äggvitans protein denatureras av värmen och blir vitt och '
        'ogenomskinligt i stället för klart och rinnande.</p>'
        + checkq(
            "Vad händer med ett protein när det denatureras, och kan det oftast återgå till sin ursprungliga form?",
            "Proteinets tredimensionella form vecklas ut eller ändras, till exempel av värme, och det förlorar sin "
            "funktion. Det kan oftast INTE återgå till sin ursprungliga form.",
        )
    )
    + deepen(
        "Peptidbindningen – hur två aminosyror sätts ihop",
        '<p>Varje aminosyra har en aminogrupp (–NH₂) och en karboxylgrupp (–COOH) på samma kolatom, plus en '
        'sidokedja (R-gruppen) som skiljer sig åt mellan olika aminosyror. Nedan ser du tre exempel: glycin (ingen '
        'sidokedja), alanin (en liten kolkedja) och cystein (svavel i sidokedjan).</p>'
        + figs_inline("glycin", "alanin", "cystein")
        + '<p>När karboxylgruppen på en aminosyra reagerar med aminogruppen på nästa bildas en peptidbindning '
          '(en amidbindning, –CO–NH–), samtidigt som en vattenmolekyl frigörs. Nedan ser du glycin och alanin '
          'sammansatta till en dipeptid – lägg märke till den gulmarkerade peptidbindningen i mitten.</p>'
        + figs_inline("dipeptid")
        + '<p>Upprepas detta många gånger, med olika aminosyror i olika ordning, bildas en lång proteinkedja.</p>'
    )
    + plain(
        fact(
            "Protein = kedjor av aminosyror bundna med peptidbindningar, veckade till en unik 3D-form. Proteiner "
            "kan vara byggnadsmaterial, driva muskelrörelse, fungera som enzymer eller som hormoner. Denaturering "
            "förstör proteinets form och funktion, oftast permanent."
        )
        + next_steps(
            ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 3"),
            ("./instuderingsfragor.html", "Öva", "Instuderingsfrågor milstolpe 3"),
        )
    )
)

# ═══════════════════════════════════════════════════════════════════
# MILSTOLPE 4 – Sammanfattning, vitaminer och mineraler
# ═══════════════════════════════════════════════════════════════════
M4 = plain(
    '<p>Växter lagrar sin energi som <strong class="term"><span class="concept-inline" '
    'data-concept="Stärkelse">stärkelse</span></strong>. Djur och människor lagrar i stället sin energi som '
    '<strong class="term"><span class="concept-inline" data-concept="Glykogen">glykogen</span></strong>, i lever '
    'och muskler. Båda är polysackarider uppbyggda av glukosenheter och fungerar som energilager – skillnaden är '
    'vilken organism som bygger dem, och hur kedjorna är förgrenade.</p>'
    '<p>Kroppen kan bryta ner mat till byggstenar (glukos, glycerol och fettsyror, aminosyror) och energi, och '
    'sedan använda dem för att bygga sina egna molekyler – till exempel egna proteiner, med hjälp av kväve och '
    'andra ämnen från maten.</p>'
    + fact(
        "Växter lagrar energi som stärkelse. Djur och människor lagrar energi som glykogen. Båda är "
        "glukospolysackarider – precis som kolhydrater, fett och protein i det här kapitlet i grunden bygger "
        "vidare på druvsocker."
    )
    + '<p>Maten innehåller förstås mer än kolhydrater, fett och protein – även vitaminer och mineraler behövs, i '
    'ganska små mängder. Vitaminer är organiska ämnen som bland annat hjälper celler att fungera och skyddar '
    'kroppen (t.ex. C-vitamin i frukt och grönt, D-vitamin i fet fisk och solljus). Mineraler är grundämnen som '
    'bland annat bygger skelett och behövs i blodet (t.ex. kalcium i mejeriprodukter, järn i kött och baljväxter). '
    'Olika vitaminer och mineraler finns i olika typer av mat, vilket är en av anledningarna till att en varierad '
    'kost är viktig.</p>'
    '<p style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:0.8rem 1rem;">'
    'Vill du lära dig mer om vilka vitaminer och mineraler som finns var, och vad de gör? Testa lagspelet '
    '<a href="/spel/hastkapplopning/"><strong>Hästkapplöpning</strong></a> – där tävlar ni i lag om att svara '
    'rätt på frågor om vitaminer och mineraler i maten.</p>'
    + next_steps(
        ("./checklista.html", "Kontrollera", "Checklistan – milstolpe 4"),
        ("./ovningsprov.html", "Öva", "Hela övningsprovet"),
    )
)

MILESTONES = [
    (1, "m1", "Kolhydrater – druvsocker till stärkelse", M1),
    (2, "m2", "Fetter – uppbyggnad och energi", M2),
    (3, "m3", "Proteiner – aminosyror och funktion", M3),
    (4, "m4", "Sammanfattning – energilager, vitaminer och mineraler", M4),
]


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


CSS_PATH = os.path.join(HERE, "src", "studieguide.css")
AREA_CSS = open(CSS_PATH, encoding="utf-8").read() if os.path.exists(CSS_PATH) else ""

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
      --listen-deepen-color: #7a4a06;
      --listen-deepen-border: #d4b870;
      --listen-deepen-hover-bg: #fffbe7;
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
    .tbl-scroll { overflow-x: auto; }
    .tbl-scroll:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }

    .references { margin-top:2rem; padding-top:1rem; border-top:1px solid #d8d8d8; font-size:0.9rem; line-height:1.65; }
    .references h2 { font-size:1rem; color:#9a3412; margin:0 0 0.6rem; }
    .references ol { margin:0 0 0 1.3rem; }
    .references li { margin-bottom:0.4rem; }
    .references a { color:#9a3412; text-decoration:underline; }

    details.milestone { scroll-margin-top: 0.75rem; }
    @media (max-width: 520px) { main { font-size: 1.05em; } .milestone .m-title { font-size: 1rem; } }
  </style>
  <style>
""" + AREA_CSS + """
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
      <p><strong>4 milstolpar</strong> – matens tre stora makromolekyler: kolhydrater, fetter och protein, plus en kort sammanfattning.</p>
      <p>Expandera en milstolpe genom att klicka på den. Gå igenom dem i ordning första gången.</p>
      <p>Rutor med gul bakgrund och en varningstriangel är märkta <strong>Viktigt!</strong> – där står det du särskilt måste komma ihåg. Rutor med 🔍 är <strong>fördjupningar</strong> – extra innehåll som inte krävs, men som kan vara kul eller nyttigt att klicka upp.</p>
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
        <li id="ref-1">Livsmedelsverket. <em>Kolhydrater, fett och protein</em> (allmän fakta om näringsämnen, samt exempel på funktionsproteiner/enzymer). <a href="https://www.livsmedelsverket.se/" target="_blank" rel="noopener">livsmedelsverket.se</a></li>
        <li id="ref-2">1177 Vårdguiden. <em>Kost och näring</em>, samt allmän fakta om vitaminer och mineraler. <a href="https://www.1177.se/" target="_blank" rel="noopener">1177.se</a></li>
        <li id="ref-3">Nordiska ministerrådet. <em>Nordic Nutrition Recommendations 2023 (NNR2023)</em> (energitäthet, kcal/g för fett/kolhydrat/protein). <a href="https://www.norden.org/" target="_blank" rel="noopener">norden.org</a></li>
        <li id="ref-4">Chemicalbook. Databas för kemiska ämnen (SMILES/struktur för glukos, fruktos, maltos, ribos, deoxiribos). <a href="https://www.chemicalbook.com/" target="_blank" rel="noopener">chemicalbook.com</a></li>
        <li id="ref-5">PubChem/ChEBI, National Library of Medicine / EMBL-EBI. Molekylformler, stereokemi och allmän kemisk fakta (bland annat aldehydo-D-glukos, CHEBI:42758). <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener">pubchem.ncbi.nlm.nih.gov</a>, <a href="https://www.ebi.ac.uk/chebi/" target="_blank" rel="noopener">ebi.ac.uk/chebi</a></li>
        <li id="ref-6">Wikipedia (svenska/engelska). Bakgrundskontroll av allmänt kända fakta om enskilda ämnen och proteiner (t.ex. kollagen, aktin/myosin, amylas, insulin, ribos/deoxiribos i RNA/DNA). <a href="https://sv.wikipedia.org/" target="_blank" rel="noopener">sv.wikipedia.org</a></li>
      </ol>
      <p style="font-size:0.82rem;color:#4a4a4a;font-style:italic;margin-top:0.6rem;">Texten i studieguiden är självständigt formulerad utifrån allmän kemi-/näringslärekunskap. Ingen text är kopierad från någon lärobok. Alla bilder (strukturformler, 3D-kulmodeller och de schematiska översiktsbilderna för fett och protein) är genererade för den här sajten i kod – se OVERLAMNING.md för metod, källor för de nya molekylerna (glukos öppen kedja, ribos, deoxiribos) och en not om en tidigare härledd struktur (cellobios).</p>
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
