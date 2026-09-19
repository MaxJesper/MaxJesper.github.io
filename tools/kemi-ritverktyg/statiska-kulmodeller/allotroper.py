"""Genererar kolmodifikationerna (diamant, grafit, fulleren C60, grafen, nanorör) som atomlistor.
Bindningar bestäms av avstånd (1,42-1,55 Å) = kemin; geometrin är kända kristallstrukturer."""
import numpy as np, itertools

def neighbors(P, cutoff):
    n = len(P); nb = [[] for _ in range(n)]
    for i in range(n):
        d = np.linalg.norm(P - P[i], axis=1)
        for j in np.where((d > 0.1) & (d < cutoff))[0]:
            nb[i].append(int(j))
    return nb

def prune(P, cutoff, min_nb=2):
    P = np.array(P)
    while True:
        nb = neighbors(P, cutoff)
        keep = [i for i in range(len(P)) if len(nb[i]) >= min_nb]
        if len(keep) == len(P): return P
        P = P[keep]

def to_atoms_bonds(P, cutoff):
    nb = neighbors(P, cutoff)
    atoms = [('C', *map(float, p)) for p in P]
    bonds = sorted({(min(i, j) + 1, max(i, j) + 1, 1) for i in range(len(P)) for j in nb[i]})
    return atoms, bonds

def diamond(radius=5.0):
    """Diamantgitter (kubisk, a = 3,567 Å). Klustret = alla atomer inom `radius` Å från en central
    atom. Med 5,0 Å blir det 87 atomer varav 35 har alla fyra grannar (de inre) - så att man ser att
    varje kolatom i diamant binder fyra andra, i ett tredimensionellt nät."""
    a = 3.567
    fcc = np.array([[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]])
    pts = []
    for i, j, k in itertools.product(range(4), repeat=3):
        for b in fcc:
            for sh in ([0,0,0], [.25,.25,.25]):
                pts.append((np.array([i, j, k]) + b + np.array(sh)) * a)
    L = np.unique(np.round(np.array(pts), 4), axis=0)
    c = L[np.argmin(np.linalg.norm(L - L.mean(axis=0), axis=1))]
    C = prune(L[np.linalg.norm(L - c, axis=1) <= radius], 1.6, min_nb=1)
    return C - C.mean(axis=0), 1.6

def graphene_patch(ni, nj, z=0.0):
    a = 2.46
    a1, a2 = np.array([a, 0.0]), np.array([a/2, a*np.sqrt(3)/2])
    A, B = np.array([0.0, 0.0]), np.array([a/2, a/(2*np.sqrt(3))])
    pts = []
    for i in range(ni):
        for j in range(nj):
            o = i*a1 + j*a2
            pts += [o + A, o + B]
    P2 = np.array(pts)
    return np.column_stack([P2, np.full(len(P2), z)])

def graphite(layers=3, ni=4, nj=3):
    a = 2.46; shift = np.array([a/2, a/(2*np.sqrt(3)), 0.0])
    Ls = []
    for l in range(layers):
        L = graphene_patch(ni, nj, z=l*3.35)
        if l % 2 == 1: L = L + shift
        Ls.append(L)
    # prune per lager (bindningar bara inom lager), sedan slå ihop
    out = []
    for L in Ls:
        out.append(prune(L, 1.6, min_nb=2))
    P = np.vstack(out)
    return P - P.mean(axis=0), 1.6

def graphene(ni=5, nj=4):
    P = prune(graphene_patch(ni, nj), 1.6, min_nb=2)
    return P - P.mean(axis=0), 1.6

def fullerene():
    phi = (1 + 5 ** .5) / 2
    base = [(0, 1, 3*phi), (1, 2 + phi, 2*phi), (phi, 2, 2*phi + 1)]
    pts = set()
    for v in base:
        for sg in itertools.product([1, -1], repeat=3):
            q = tuple(s * c for s, c in zip(sg, v))
            for r in range(3):
                pts.add(tuple(round(x, 6) for x in (q[-r:] + q[:-r] if r else q)))
    P = np.array(sorted(pts)); assert len(P) == 60, len(P)
    P = P * (1.43 / 2.0)     # kantlängd 2 -> 1,43 Å
    return P, 1.6

def nanotube(n=6, m=6, cells=5):
    a = 2.46
    a1, a2 = np.array([a, 0.0]), np.array([a/2, a*np.sqrt(3)/2])
    basis = [np.array([0.0, 0.0]), np.array([a/2, a/(2*np.sqrt(3))])]
    Ch = n*a1 + m*a2; Cl = np.linalg.norm(Ch); ch = Ch / Cl
    from math import gcd
    d = gcd(2*m + n, 2*n + m)
    T = ((2*m + n)*a1 - (2*n + m)*a2) / d; Tl = np.linalg.norm(T); t = T / Tl
    R = Cl / (2*np.pi)
    pts = []
    for i in range(-40, 41):
        for j in range(-40, 41):
            for b in basis:
                p = i*a1 + j*a2 + b
                u = np.dot(p, ch) / Cl; v = np.dot(p, t)
                if -1e-6 <= u < 1 - 1e-6 and -1e-6 <= v < cells*Tl - 1e-6:
                    th = 2*np.pi*u
                    pts.append([v, R*np.cos(th), R*np.sin(th)])       # rörets axel längs x
    P = np.unique(np.round(np.array(pts), 4), axis=0)
    return P - P.mean(axis=0), 1.6

# Utseende i 3D-vyerna: SMÅ kulor i förhållande till bindningarna, så att man ser igenom strukturen
# och kan följa hur atomerna sitter ihop (sfärskala, pinnradie i 3Dmol-enheter) samt startvy (rotX, rotY).
STIL = (0.14, 0.062)
VY = {'diamant': (25, 35), 'grafit': (-60, 10), 'fulleren': (-25, 20), 'grafen': (-25, 0), 'nanoror': (-15, 25)}

BUILD = {'diamant': diamond, 'grafit': graphite, 'fulleren': fullerene, 'grafen': graphene, 'nanoror': nanotube}

def report(name, P, cutoff):
    nb = neighbors(P, cutoff); c = np.bincount([len(x) for x in nb])
    L = [np.linalg.norm(P[i] - P[j]) for i in range(len(P)) for j in nb[i] if j > i]
    return f'{name:9s} atomer={len(P):3d} bindn={len(L):3d} längd {min(L):.3f}-{max(L):.3f} Å  grannar-histogram={dict(enumerate(map(int, c)))}'

def molblocks():
    """Molblock (MOL V2000) för alla former - läggs i MOLS i studieguidens script (alla kolformer roterbara)."""
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import chembuilder as cb
    out = {}
    for k, f in BUILD.items():
        P, cut = f(); atoms, bonds = to_atoms_bonds(P, cut); out[k] = cb.write_molblock(atoms, bonds, k)
    return out

if __name__ == '__main__':
    for k, f in BUILD.items():
        P, cut = f(); print(report(k, P, cut))
