import numpy as np

TET = np.radians(109.5)
PHI = np.radians(35.25)  # halva (180-109.5), ger korrekt zigzag-vinkel

BOND_CH = 1.09
BOND_CC = 1.54
BOND_CO_SINGLE = 1.43     # C-O (alkohol/eter)
BOND_CO_ESTER  = 1.36     # C-O (estersyre, konjugerad, nagot kortare)
BOND_C_ODOUBLE = 1.20     # C=O
BOND_OH = 0.96

def write_molblock(atoms, bonds, title="mol"):
    lines = [title, "  Claude3D", ""]
    lines.append(f"{len(atoms):3d}{len(bonds):3d}  0  0  0  0  0  0  0  0999 V2000")
    for el,x,y,z in atoms:
        lines.append(f"{x:10.4f}{y:10.4f}{z:10.4f} {el:<3}0  0  0  0  0  0  0  0  0  0  0  0")
    for i,j,o in bonds:
        lines.append(f"{i:3d}{j:3d}{o:3d}  0")
    lines.append("M  END")
    return "\n".join(lines)

def perp_pair(axis, ref=np.array([0,0,1])):
    a = axis/np.linalg.norm(axis)
    p1 = np.cross(a, ref)
    if np.linalg.norm(p1) < 1e-6:
        p1 = np.cross(a, np.array([1,0,0]))
    p1 = p1/np.linalg.norm(p1)
    p2 = np.cross(a,p1)
    return p1,p2

def two_tetra_complements(u1, u2):
    """Givet tva befintliga bindningsriktningar (enhetsvektorer) fran ett
    centrum, ge de tva ovriga tetraedriska (109.5 grader) riktningarna."""
    u1 = u1/np.linalg.norm(u1); u2 = u2/np.linalg.norm(u2)
    s = u1+u2
    b = -s/np.linalg.norm(s)
    n = np.cross(u1,u2); n = n/np.linalg.norm(n)
    half = TET/2
    u3 = b*np.cos(half) + n*np.sin(half)
    u4 = b*np.cos(half) - n*np.sin(half)
    return u3, u4

def extend_chain_inplane(prev, curr, bond_length, prev2=None):
    """Fortsatt en zigzag-kedja (i xy-planet, z=0) fran curr, med 109.5 graders
    vinkel vid curr (mellan prev-curr och curr-nasta). De tva speglade
    losningarna ligger pa exakt samma avstand fran 'prev' (det ger ingen
    ledtrad), men olika avstand fran 'prev2' (atomen ETT STEG FORE prev) -
    den som fortsatter kedjan framat hamnar langst bort fran prev2, medan den
    som viker tillbaka hamnar nara den. Ges inget prev2 (forsta lanken i en
    kedja) finns ingen tidigare riktning att utga fran - da valjs cand_a,
    vilket bara ar ett godtyckligt men konsekvent vagval (spegelvant handelse,
    kemiskt likvardigt)."""
    axis = (prev-curr)/np.linalg.norm(prev-curr)  # riktning curr -> prev
    perp = np.array([-axis[1], axis[0], 0.0])
    perp = perp/np.linalg.norm(perp)
    d_a = axis*np.cos(TET) + perp*np.sin(TET)
    d_b = axis*np.cos(TET) - perp*np.sin(TET)
    cand_a = curr + bond_length*d_a/np.linalg.norm(d_a)
    cand_b = curr + bond_length*d_b/np.linalg.norm(d_b)
    if prev2 is None:
        return cand_a
    return cand_a if np.linalg.norm(cand_a-prev2) > np.linalg.norm(cand_b-prev2) else cand_b

def sp2_planar_substituents(existing_dir):
    """Givet en befintlig bindningsriktning (enhetsvektor, i xy-planet) fran
    ett sp2-centrum, ge de tva ovriga riktningarna i samma plan (120 grader,
    plant). Returnerar (dir_pos, dir_neg) dar dir_pos har positiv y-komponent
    (om mojligt) - anvands for att konsekvent valja =O / -OH-sida."""
    axis = existing_dir/np.linalg.norm(existing_dir)
    perp = np.array([-axis[1], axis[0], 0.0])
    perp = perp/np.linalg.norm(perp)
    ang = np.radians(120)
    d_pos = axis*np.cos(ang) + perp*np.sin(ang)
    d_neg = axis*np.cos(ang) - perp*np.sin(ang)
    return d_pos, d_neg

def methyl_hydrogens(center, neighbor, phase=0.0):
    axis = (neighbor-center)/np.linalg.norm(neighbor-center)
    p1,p2 = perp_pair(axis)
    Hs = []
    for k in range(3):
        theta = 2*np.pi*k/3 + phase
        d = axis*np.cos(TET) + (p1*np.cos(theta)+p2*np.sin(theta))*np.sin(TET)
        Hs.append(center + BOND_CH*d/np.linalg.norm(d))
    return Hs

def pick_methyl_phase(center, neighbor, want_sign):
    """Valj fas (0 eller pi) for en terminal metylgrupp sa att de tva
    'dominanta' vateatomerna hamnar at ratt hall (want_sign: +1 = uppat,
    -1 = nedat) i zigzag-bilden, istallet for att gissa/harkoda per molekyl."""
    best_phase, best_score = 0.0, None
    for phase in (0.0, np.pi):
        Hs = methyl_hydrogens(center, neighbor, phase)
        score = sum(np.sign(h[1]-center[1]) for h in Hs) * want_sign
        if best_score is None or score > best_score:
            best_score, best_phase = score, phase
    return best_phase

def ch2_hydrogens(center, nb1, nb2):
    u1 = (nb1-center)/np.linalg.norm(nb1-center)
    u2 = (nb2-center)/np.linalg.norm(nb2-center)
    d3,d4 = two_tetra_complements(u1,u2)
    return [center+BOND_CH*d3, center+BOND_CH*d4]

def oh_hydrogen(o_pos, c_pos, syn_ref=None):
    """Vate pa en OH-syre, vinkel 109.5 fran O-C-axeln, i samma plan (z=0).
    Om syn_ref ges (t.ex. karbonylsyret), valjs den av de tva speglade
    losningarna som hamnar narmast syn_ref (den vanliga, mest stabila
    konformationen for karboxylsyror/estrar)."""
    axisO = (c_pos-o_pos)/np.linalg.norm(c_pos-o_pos)
    perp = np.array([-axisO[1], axisO[0], 0.0])
    perp = perp/np.linalg.norm(perp)
    d_a = axisO*np.cos(TET) + perp*np.sin(TET)
    d_b = axisO*np.cos(TET) - perp*np.sin(TET)
    H_a = o_pos + BOND_OH*d_a/np.linalg.norm(d_a)
    H_b = o_pos + BOND_OH*d_b/np.linalg.norm(d_b)
    if syn_ref is None:
        return H_a
    return H_a if np.linalg.norm(H_a-syn_ref) < np.linalg.norm(H_b-syn_ref) else H_b

def build_zigzag_chain(n, bond_length=BOND_CC):
    """Bygg n atompositioner i zigzag (xy-planet), 109.5 grader hela vagen."""
    pts = [np.array([0.0,0,0])]
    pts.append(pts[0] + bond_length*np.array([np.cos(PHI), np.sin(PHI), 0.0]))
    for i in range(2, n):
        prev2 = pts[i-3] if i-3 >= 0 else None
        pts.append(extend_chain_inplane(pts[i-2], pts[i-1], bond_length, prev2=prev2))
    return pts

def angle(pos, p,q,r):
    v1=pos[p]-pos[q]; v2=pos[r]-pos[q]
    return np.degrees(np.arccos(np.dot(v1,v2)/np.linalg.norm(v1)/np.linalg.norm(v2)))

def dist(pos, p,q):
    return np.linalg.norm(pos[p]-pos[q])

def extend_chain_choose(prev, curr, bond_length, prefer="up"):
    """Som extend_chain_inplane, men for den FORSTA knycken efter en
    sp2-grupp (dar det inte finns nagot 'prev2' att utga fran, t.ex. direkt
    efter esterbryggans syre) - da valjer vi explicit uppat/nedat istallet.
    Efterföljande steg ska sedan anvanda den vanliga extend_chain_inplane
    (med prev2 = denna funktions 'curr') for att fortsatta korrekt utan att
    vika tillbaka."""
    axis = (prev-curr)/np.linalg.norm(prev-curr)
    perp = np.array([-axis[1], axis[0], 0.0])
    perp = perp/np.linalg.norm(perp)
    d_a = axis*np.cos(TET) + perp*np.sin(TET)
    d_b = axis*np.cos(TET) - perp*np.sin(TET)
    cand_a = curr + bond_length*d_a/np.linalg.norm(d_a)
    cand_b = curr + bond_length*d_b/np.linalg.norm(d_b)
    if prefer == "up":
        return cand_a if cand_a[1] > cand_b[1] else cand_b
    elif prefer == "down":
        return cand_a if cand_a[1] < cand_b[1] else cand_b
    raise ValueError(prefer)


# ============================================================
# Tillagg sep 2026: alkener (plan sp2) och alkyner (linjar sp)
# ============================================================
"""Tillägg till chembuilder.py: alkener (plan sp2) och alkyner (linjär sp).
Se kulmodeller3d.py i repot för fullständig dokumentation av konventionerna."""
BOND_CC_DOUBLE = 1.33
BOND_CC_TRIPLE = 1.20
BOND_CH_SP2 = 1.09
BOND_CH_SP = 1.06
BOND_CC_SP_SINGLE = 1.46   # sp-sp3 enkelbindning (nagot kortare an vanlig C-C)

def build_ethene():
    """Eten, C2H4. Plant (alla 6 atomer i xy-planet, z=0) - kemiskt korrekt:
    C=C-dubbelbindningen later inte kolen rotera i forhallande till varandra."""
    C1 = np.array([0.0, 0.0, 0.0])
    C2 = C1 + np.array([BOND_CC_DOUBLE, 0.0, 0.0])
    ax1 = (C2 - C1); ax2 = (C1 - C2)
    d1a, d1b = sp2_planar_substituents(ax1)
    d2a, d2b = sp2_planar_substituents(ax2)
    H1 = C1 + BOND_CH_SP2 * d1a / np.linalg.norm(d1a)
    H2 = C1 + BOND_CH_SP2 * d1b / np.linalg.norm(d1b)
    H3 = C2 + BOND_CH_SP2 * d2a / np.linalg.norm(d2a)
    H4 = C2 + BOND_CH_SP2 * d2b / np.linalg.norm(d2b)
    atoms = [('C',*C1),('C',*C2),('H',*H1),('H',*H2),('H',*H3),('H',*H4)]
    bonds = [(1,2,2),(1,3,1),(1,4,1),(2,5,1),(2,6,1)]
    return atoms, bonds

def build_propyne():
    """Propyn, HC=C-CH3 (trippelbindning). C1,C2 sp (linjara, 180 grader),
    C3 vanlig sp3-metylgrupp fast pa C2."""
    C1 = np.array([0.0, 0.0, 0.0])
    C2 = C1 + np.array([BOND_CC_TRIPLE, 0.0, 0.0])
    C3 = C2 + np.array([BOND_CC_SP_SINGLE, 0.0, 0.0])
    H1 = C1 + np.array([-BOND_CH_SP, 0.0, 0.0])
    Hs = methyl_hydrogens(C3, C2, phase=0.0)
    atoms = [('C',*C1),('C',*C2),('C',*C3),('H',*H1)] + [('H',*h) for h in Hs]
    bonds = [(1,2,3),(2,3,1),(1,4,1),(3,5,1),(3,6,1),(3,7,1)]
    return atoms, bonds

def build_alkane(n):
    """Rak alkankedja, n kolatomer (metan hanteras separat pga tetraedrisk
    symmetri utan zigzag), etan/propan/butan etc via build_zigzag_chain."""
    if n == 1:
        C = np.array([0.0,0,0])
        # tetraedriska riktningar for metan
        dirs = [np.array([1,1,1]),np.array([1,-1,-1]),np.array([-1,1,-1]),np.array([-1,-1,1])]
        Hs = [C+BOND_CH*d/np.linalg.norm(d) for d in dirs]
        atoms=[('C',*C)]+[('H',*h) for h in Hs]
        bonds=[(1,2,1),(1,3,1),(1,4,1),(1,5,1)]
        return atoms,bonds
    pts = build_zigzag_chain(n)
    atoms = [('C',*p) for p in pts]
    bonds = []
    idx = n+1
    Hlist = []
    for i in range(n):
        if i == 0:
            neighbor = pts[1]
            want = -1 if pts[0][1] < pts[1][1] else 1
            # valj fas sa att metylens tva "dominanta" vaten pekar bort fran kedjans stigning
            phase = pick_methyl_phase(pts[0], pts[1], want_sign=-np.sign(pts[1][1]-pts[0][1]) if pts[1][1]!=pts[0][1] else -1)
            Hs = methyl_hydrogens(pts[0], pts[1], phase)
            for h in Hs:
                atoms.append(('H',*h)); bonds.append((1,idx,1)); idx+=1
        elif i == n-1:
            phase = pick_methyl_phase(pts[i], pts[i-1], want_sign=-np.sign(pts[i-1][1]-pts[i][1]) if pts[i-1][1]!=pts[i][1] else -1)
            Hs = methyl_hydrogens(pts[i], pts[i-1], phase)
            for h in Hs:
                atoms.append(('H',*h)); bonds.append((i+1,idx,1)); idx+=1
        else:
            Hs = ch2_hydrogens(pts[i], pts[i-1], pts[i+1])
            for h in Hs:
                atoms.append(('H',*h)); bonds.append((i+1,idx,1)); idx+=1
        if i < n-1:
            bonds.append((i+1,i+2,1))
    return atoms, bonds


# ============================================================
# Tillagg sep 2026: generella byggare for karboxylsyror, estrar
# och alkoholer (metanol/etanol), sammanstallda for hela kapitlet
# ============================================================
def carbonyl_group(prev_carbon, carbonyl_pos, kind, ester_bond=BOND_CO_ESTER):
    """kind: 'acid' -> (=O, -OH+H)   'ester' -> (=O, -O- bridge, no H)
    Estrar: dubbelbundna syret placeras at det hall som ger storst y (uppat),
    enligt Jespers ursprungliga konvention (bekraftad korrekt for estrar).
    Fristaende karboxylsyror (kind='acid'): dubbelbundna syret placeras
    istallet NEDAT och enkelbundna -OH UPPAT, sa att molekylen ser ut som
    'fyllehunden' (samma skelett som etanol-hunden): karbonylkolets
    dubbelbundna syre pekar rakt ned mitt mellan 'bakbenen', och -OH pekar
    upp som 'huvud' med sitt vate nedat som 'nos' (Jespers rattelse sep 2026,
    galler bara syror - estrarnas uppat-konvention andras INTE)."""
    existing = prev_carbon - carbonyl_pos
    d_pos, d_neg = sp2_planar_substituents(existing)
    dir_up, dir_down = (d_pos, d_neg) if d_pos[1] >= d_neg[1] else (d_neg, d_pos)
    if kind == 'acid':
        O_double = carbonyl_pos + BOND_C_ODOUBLE * dir_down / np.linalg.norm(dir_down)
        O_single = carbonyl_pos + BOND_CO_SINGLE * dir_up / np.linalg.norm(dir_up)
        H_oh = oh_hydrogen(O_single, carbonyl_pos, syn_ref=O_double)
        return O_double, O_single, H_oh
    else:
        O_double = carbonyl_pos + BOND_C_ODOUBLE * dir_up / np.linalg.norm(dir_up)
        O_bridge = carbonyl_pos + ester_bond * dir_down / np.linalg.norm(dir_down)
        return O_double, O_bridge

def build_acid(n_carbon):
    """Karboxylsyra med n_carbon kolatomer totalt (metansyra n=1 ... propansyra n=3)."""
    atoms = []
    bonds = []
    if n_carbon == 1:
        # metansyra HCOOH: karbonylkolet bar H direkt (ingen alkylkedja)
        Ccarb = np.array([0.0,0,0])
        Hdir = np.array([-1.0, -0.3, 0.0]); Hdir/=np.linalg.norm(Hdir)
        # sp2: tre riktningar 120 grader runt Ccarb. Utgangsriktning = H
        d_pos, d_neg = sp2_planar_substituents(Hdir)
        dir_up, dir_down = (d_pos, d_neg) if d_pos[1] >= d_neg[1] else (d_neg, d_pos)
        Hpos = Ccarb + BOND_CH*Hdir
        # Fristaende syra (se carbonyl_group): =O nedat, -OH uppat ("fyllehunden")
        O_double = Ccarb + BOND_C_ODOUBLE*dir_down/np.linalg.norm(dir_down)
        O_single = Ccarb + BOND_CO_SINGLE*dir_up/np.linalg.norm(dir_up)
        H_oh = oh_hydrogen(O_single, Ccarb, syn_ref=O_double)
        atoms = [('C',*Ccarb), ('O',*O_double), ('O',*O_single), ('H',*Hpos), ('H',*H_oh)]
        bonds = [(1,2,2),(1,3,1),(1,4,1),(3,5,1)]
        return atoms, bonds
    nchain = n_carbon - 1  # antal sp3-kol i alkylkedjan
    pts = build_zigzag_chain(max(nchain,2))[:nchain] if nchain>=2 else None
    if nchain == 1:
        pts = [np.array([0.0,0,0])]
        # placera karbonylkolet i en godtycklig men konsekvent riktning
        Ccarb = pts[0] + BOND_CC*np.array([np.cos(PHI), np.sin(PHI), 0.0])
    else:
        prev2 = pts[-3] if len(pts)>=3 else None
        Ccarb = extend_chain_inplane(pts[-2], pts[-1], BOND_CC, prev2=prev2)
    O_double, O_single, H_oh = carbonyl_group(pts[-1], Ccarb, 'acid')
    idx = 1
    atoms = []
    Cidx = {}
    for i,p in enumerate(pts):
        atoms.append(('C',*p)); Cidx[i]=len(atoms)
    atoms.append(('C',*Ccarb)); Cidx['carb']=len(atoms)
    atoms.append(('O',*O_double)); Oi_double=len(atoms)
    atoms.append(('O',*O_single)); Oi_single=len(atoms)
    bonds.append((Cidx['carb'], Oi_double, 2))
    bonds.append((Cidx['carb'], Oi_single, 1))
    bonds.append((Cidx[nchain-1], Cidx['carb'], 1))
    for i in range(nchain-1):
        bonds.append((Cidx[i], Cidx[i+1], 1))
    # vateatomer pa alkylkedjan
    for i in range(nchain):
        if nchain == 1:
            phase = pick_methyl_phase(pts[i], Ccarb, want_sign=-1)
            Hs = methyl_hydrogens(pts[i], Ccarb, phase)
        elif i == 0:
            phase = pick_methyl_phase(pts[0], pts[1], want_sign=-np.sign(pts[1][1]-pts[0][1]) or -1)
            Hs = methyl_hydrogens(pts[0], pts[1], phase)
        else:
            Hs = ch2_hydrogens(pts[i], pts[i-1], Ccarb if i==nchain-1 else pts[i+1])
        for h in Hs:
            atoms.append(('H',*h)); bonds.append((Cidx[i], len(atoms), 1))
    atoms.append(('H',*H_oh)); bonds.append((Oi_single, len(atoms), 1))
    return atoms, bonds

def build_ester(n_acyl, n_alkyl):
    """n_acyl = antal kol i syradelen (inkl. karbonylkolet), t.ex. propanoat -> 3.
    n_alkyl = antal kol i alkoholdelen (metyl=1, etyl=2)."""
    n_pre = n_acyl - 1  # sp3-kol fore karbonylkolet
    if n_pre == 1:
        pts = [np.array([0.0,0,0])]
        Ccarb = pts[0] + BOND_CC*np.array([np.cos(PHI), np.sin(PHI), 0.0])
        prev_for_carbonyl = pts[0]
    else:
        pts = build_zigzag_chain(n_pre)
        prev2 = pts[-3] if len(pts)>=3 else None
        Ccarb = extend_chain_inplane(pts[-2], pts[-1], BOND_CC, prev2=prev2)
        prev_for_carbonyl = pts[-1]
    O_double, O_bridge = carbonyl_group(prev_for_carbonyl, Ccarb, 'ester')
    # Hela ryggraden (inkl. karbonylkol och esterbryggans syre) byggs som EN
    # obruten zigzag-kedja med extend_chain_inplane + prev2 (regel 1/5) -
    # bara forsta steget efter O_bridge behover prev2 = atomen fore Ccarb.
    chain = [prev_for_carbonyl, Ccarb, O_bridge]
    for i in range(n_alkyl):
        prev2 = chain[len(chain)-3]
        chain.append(extend_chain_inplane(chain[-2], chain[-1], BOND_CC, prev2=prev2))
    alk_pts = chain[2:]  # alk_pts[0]=O_bridge, alk_pts[1..n_alkyl]=alkylkolen
    atoms = []
    bonds = []
    Cidx = {}
    for i,p in enumerate(pts):
        atoms.append(('C',*p)); Cidx[('pre',i)] = len(atoms)
    atoms.append(('C',*Ccarb)); Cidx['carb'] = len(atoms)
    atoms.append(('O',*O_double)); Oi_double = len(atoms)
    atoms.append(('O',*O_bridge)); Oi_bridge = len(atoms)
    for i in range(1, n_alkyl+1):
        atoms.append(('C',*alk_pts[i])); Cidx[('alk',i)] = len(atoms)
    bonds.append((Cidx['carb'], Oi_double, 2))
    bonds.append((Cidx['carb'], Oi_bridge, 1))
    bonds.append((Cidx[('pre', n_pre-1)], Cidx['carb'], 1))
    for i in range(n_pre-1):
        bonds.append((Cidx[('pre',i)], Cidx[('pre',i+1)], 1))
    bonds.append((Oi_bridge, Cidx[('alk',1)], 1))
    for i in range(1, n_alkyl):
        bonds.append((Cidx[('alk',i)], Cidx[('alk',i+1)], 1))
    # vaten pa syradelens alkylkedja (pre)
    for i in range(n_pre):
        if n_pre == 1:
            Hs = methyl_hydrogens(pts[i], Ccarb, pick_methyl_phase(pts[i], Ccarb, want_sign=-1))
        elif i == 0:
            ws = -np.sign(pts[1][1]-pts[0][1]) or -1
            Hs = methyl_hydrogens(pts[0], pts[1], pick_methyl_phase(pts[0], pts[1], want_sign=ws))
        else:
            nb2 = Ccarb if i==n_pre-1 else pts[i+1]
            Hs = ch2_hydrogens(pts[i], pts[i-1], nb2)
        for h in Hs:
            atoms.append(('H',*h)); bonds.append((Cidx[('pre',i)], len(atoms), 1))
    # vaten pa alkoholdelen
    full_alk = [Ccarb] + alk_pts  # Ccarb, O_bridge, alk1, alk2...
    for i in range(1, n_alkyl+1):
        center = alk_pts[i]
        prevpt = full_alk[i]  # atom before this one in the O-C-C.. chain
        cidx_here = Cidx[('alk',i)]
        if i == n_alkyl:
            nb_prev = alk_pts[i-1] if i-1>=1 else O_bridge
            ws = -np.sign(nb_prev[1]-center[1]) or -1
            Hs = methyl_hydrogens(center, nb_prev, pick_methyl_phase(center, nb_prev, want_sign=ws))
        else:
            nb1 = alk_pts[i-1] if i-1>=1 else O_bridge
            nb2 = alk_pts[i+1]
            Hs = ch2_hydrogens(center, nb1, nb2)
        for h in Hs:
            atoms.append(('H',*h)); bonds.append((cidx_here, len(atoms), 1))
    return atoms, bonds

def build_methanol():
    C = np.array([0.0,0,0])
    O = C + BOND_CO_SINGLE*np.array([np.cos(PHI), np.sin(PHI), 0.0])
    Hs = methyl_hydrogens(C, O, pick_methyl_phase(C, O, want_sign=-1))
    H_oh = oh_hydrogen(O, C, syn_ref=None)
    # forward (bort fran kolet) - anvand storst-x variant konsekvent med etanol
    axisO = (C-O)/np.linalg.norm(C-O)
    perp = np.array([-axisO[1], axisO[0], 0.0])
    d_a = axisO*np.cos(TET) + perp*np.sin(TET)
    d_b = axisO*np.cos(TET) - perp*np.sin(TET)
    Ha = O + BOND_OH*d_a/np.linalg.norm(d_a); Hb = O + BOND_OH*d_b/np.linalg.norm(d_b)
    H_oh = Ha if Ha[0] > Hb[0] else Hb
    atoms = [('C',*C), ('O',*O)] + [('H',*h) for h in Hs] + [('H',*H_oh)]
    bonds = [(1,2,1),(1,3,1),(1,4,1),(1,5,1),(2,6,1)]
    return atoms, bonds

def build_ethanol():
    C1, C2 = build_zigzag_chain(2)
    O = extend_chain_choose(C1, C2, BOND_CO_SINGLE, prefer="up")
    axisO = (C2-O)/np.linalg.norm(C2-O)
    perp = np.array([-axisO[1], axisO[0], 0.0])
    d_a = axisO*np.cos(TET) + perp*np.sin(TET)
    d_b = axisO*np.cos(TET) - perp*np.sin(TET)
    Ha = O + BOND_OH*d_a/np.linalg.norm(d_a); Hb = O + BOND_OH*d_b/np.linalg.norm(d_b)
    H_oh = Ha if Ha[0] > Hb[0] else Hb   # "framat", bort fran kedjan
    H_c2 = ch2_hydrogens(C2, C1, O)
    phase1 = pick_methyl_phase(C1, C2, want_sign=-1)
    H_c1 = methyl_hydrogens(C1, C2, phase1)
    atoms = [('C',*C1),('C',*C2),('O',*O)]
    atoms += [('H',*h) for h in H_c1] + [('H',*h) for h in H_c2] + [('H',*H_oh)]
    bonds = [(1,2,1),(2,3,1),(1,4,1),(1,5,1),(1,6,1),(2,7,1),(2,8,1),(3,9,1)]
    return atoms, bonds
