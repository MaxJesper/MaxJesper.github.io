#!/usr/bin/env python3
"""Numerisk kontroll av att djuren går att skilja åt vid rödgrön färgblindhet.
Indata: mappen från avatar-render.mjs. Skriver kontaktblad-deut.png / kontaktblad-prot.png.
Mått 1: silhuettskillnad (1 - IoU) mellan alla par. Mått 2: färgskillnad (CIE76 dE i Lab) för medelfärgen
efter simulering (Machado 2009, full svårighetsgrad). Ett par är "riskpar" om silhuetterna är lika (IoU > 0.80)
OCH färgerna är lika (dE < 12) under simuleringen. Djurets namn står alltid bredvid bilden i spelet."""
import sys, itertools, os
import numpy as np
from PIL import Image
ut = sys.argv[1] if len(sys.argv) > 1 else "avatarer"
IDS = ["hast","zebra","tiger","elefant","kamel","alg","snigel","kanin","giraff","skoldpadda"]
M = {
 "deut": np.array([[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]]),
 "prot": np.array([[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]),
}
def lin(a): return np.where(a<=0.04045, a/12.92, ((a+0.055)/1.055)**2.4)
def enc(l): return np.where(l<=0.0031308, l*12.92, 1.055*np.clip(l,0,1)**(1/2.4)-0.055)
def sim(rgb, kind):
    return np.clip(enc(np.clip(lin(rgb) @ M[kind].T, 0, 1)), 0, 1)
def lab(rgb):
    l = lin(rgb)
    xyz = l @ np.array([[0.4124,0.3576,0.1805],[0.2126,0.7152,0.0722],[0.0193,0.1192,0.9505]]).T
    xyz = xyz / np.array([0.95047,1.0,1.08883])
    f = np.where(xyz>0.008856, np.cbrt(xyz), 7.787*xyz+16/116)
    return np.stack([116*f[...,1]-16, 500*(f[...,0]-f[...,1]), 200*(f[...,1]-f[...,2])], -1)
img = {i: np.asarray(Image.open(os.path.join(ut, f"djur-{i}.png")).convert("RGBA")).astype(float)/255 for i in IDS}
mask = {i: img[i][...,3] > 0.5 for i in IDS}
def medel(i, kind):
    px = img[i][mask[i]][:, :3]
    px = px if kind is None else sim(px, kind)
    return lab(px.mean(0))
def iou(a, b): return (mask[a] & mask[b]).sum() / max(1, (mask[a] | mask[b]).sum())
rader = []
for a, b in itertools.combinations(IDS, 2):
    j = iou(a, b)
    for kind in (None, "deut", "prot"):
        pass
    de = {k: float(np.linalg.norm(medel(a,k) - medel(b,k))) for k in (None, "deut", "prot")}
    rader.append((a, b, j, de))
print(f"{'par':22s} {'IoU':>5s}  dE normal  dE deut  dE prot")
for a, b, j, de in sorted(rader, key=lambda r: -r[2])[:8]:
    print(f"{a+'/'+b:22s} {j:5.2f}  {de[None]:9.1f} {de['deut']:8.1f} {de['prot']:8.1f}")
risk = [(a, b, j, de) for a, b, j, de in rader if j > 0.80 and min(de["deut"], de["prot"]) < 12]
print(f"\nHögsta silhuett-IoU: {max(r[2] for r in rader):.2f}; lägsta medelfärgs-dE (deut/prot) bland par med IoU>0.5: "
      f"{min((min(r[3]['deut'], r[3]['prot']) for r in rader if r[2] > 0.5), default=float('nan')):.1f}")
print(f"Riskpar (lika form OCH lika färg vid rödgrön färgblindhet): {len(risk)}")
for a, b, j, de in risk: print("  ", a, b, f"IoU={j:.2f}", f"dE deut={de['deut']:.1f} prot={de['prot']:.1f}")
# kontaktblad med simulering
sheet = Image.open(os.path.join(ut, "kontaktblad.png")).convert("RGB")
for k in ("deut", "prot"):
    a = np.asarray(sheet).astype(float)/255
    Image.fromarray((sim(a, k)*255+0.5).astype(np.uint8)).save(os.path.join(ut, f"kontaktblad-{k}.png"))
sys.exit(1 if risk else 0)
