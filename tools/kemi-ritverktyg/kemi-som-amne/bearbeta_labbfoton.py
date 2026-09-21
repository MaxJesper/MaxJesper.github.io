#!/usr/bin/env python3
"""Bearbetar Jespers foton på laboratorieutrustning till spelbilder.

Indata: fotografier (JPEG) av föremål på vitt A3-papper, nedskalade till 1800 px (EXIF borttagen, rotation tillämpad).
Metod (inga nedladdningar, ingen AI-modell):
  1. Bakgrunden (papperet) uppskattas med en robust tredjegradspolynom-anpassning och bilden divideras med den
     ("flat-field"). Papperet blir jämnt vitt medan glasets skuggor och reflexer bevaras. Glas och blank metall
     behåller alltså sin bakgrund i stället för att frilägga dem, vilket ger fel kanter.
  2. Beskärning runt föremålet (proportion 3:4 till 4:3) och skalning till 900 px längsta sida.
  3. Undantag: 8277 (grått golv) beskärs utan flat-field, 8283 (trä) behålls, 8286 (trä) friläggs med GrabCut.
Kör:  python3 bearbeta_labbfoton.py <mapp med IMG_XXXX.jpg> <utmapp>
"""
import os, sys, numpy as np, cv2
from PIL import Image

# (id, [foton], undantag)
FOTON = [
 ("glasskal",[8255]),("urglas",[8256]),("bagare",[8257]),("matglas",[8260]),("degeltang",[8261]),
 ("provrorshallare",[8262]),("porslinstriangel",[8263]),("tradnat",[8264]),("trefot",[8265]),
 ("spatel",[8266,8267]),("molekylmodell",[8268]),("tratt",[8269]),("erlenmeyerkolv",[8270]),
 ("mortel",[8271]),("provrorsstall",[8272]),("provror",[8273]),("skyddsglasogon",[8274]),
 ("provrorsborste",[8276]),("stativ",[8277]),("muff",[8278]),("klamma",[8279]),("droppflaska",[8280]),
 ("glasstav",[8281]),("pipett",[8283]),("smaltskopa",[8284]),("porslinsskepp",[8285]),
 ("spanningskalla",[8286]),("sprutflaska",[8287]),("degel",[8288]),("rundkolv",[8289]),("bunsenbrannare",[8290]),
]
PAINT = {8268: [(0,0,1350,45)], 8274: [(0,0,1350,45)]}   # papperskant (bord) längst upp i bild
RAW_CROP = {8277}      # grått golv: beskär, ingen flat-field
RAW_FULL = {8283}      # trä: behåll hela bilden
GRABCUT = {8286}       # trä: frilägg

def fit_bg(img):
    h, w = img.shape[:2]; s = 8
    sm = cv2.resize(img, (w//s, h//s), interpolation=cv2.INTER_AREA)
    hh, ww = sm.shape[:2]
    yy, xx = np.mgrid[0:hh, 0:ww]; x = (xx/ww-.5)*2; y = (yy/hh-.5)*2
    A = np.stack([np.ones_like(x), x, y, x*x, x*y, y*y, x**3, x*x*y, x*y*y, y**3], -1).reshape(-1, 10)
    lum = sm.mean(-1).reshape(-1); keep = np.ones(lum.shape, bool)
    for _ in range(8):
        coef, *_ = np.linalg.lstsq(A[keep], lum[keep], rcond=None)
        res = lum - A @ coef; sd = np.std(res[keep]) + 1e-4
        keep = np.abs(res) < max(2.0*sd, 0.012)
    bg = np.zeros_like(sm)
    for c in range(3):
        cf, *_ = np.linalg.lstsq(A[keep], sm[..., c].reshape(-1)[keep], rcond=None)
        bg[..., c] = (A @ cf).reshape(hh, ww)
    return np.clip(cv2.resize(bg, (w, h), interpolation=cv2.INTER_CUBIC), 0.2, 1.5)

def bbox(norm, thr):
    m = ((1-norm).max(-1) > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m); h, w = m.shape
    good = [k for k in range(1, n) if st[k, 4] > 0.0015*h*w] or list(range(1, n))
    return (min(st[k, 0] for k in good), min(st[k, 1] for k in good),
            max(st[k, 0]+st[k, 2] for k in good), max(st[k, 1]+st[k, 3] for k in good))

def crop_canvas(src, box, pad=0.07, maxasp=1.333, fill=1.0, clamp=False):
    h, w = src.shape[:2]; x0, y0, x1, y1 = box
    cx, cy = (x0+x1)/2, (y0+y1)/2; bw, bh = x1-x0, y1-y0
    asp = min(max(bw/bh, 1/maxasp), maxasp)
    W, H = bw*(1+2*pad), bh*(1+2*pad)
    if W/H < asp: W = H*asp
    else: H = W/asp
    W, H = max(W, 200), max(H, 200/asp)
    X0, Y0, CW, CH = int(round(cx-W/2)), int(round(cy-H/2)), int(round(W)), int(round(H))
    if clamp:
        X0 = min(max(X0, 0), max(w-CW, 0)); Y0 = min(max(Y0, 0), max(h-CH, 0)); CW = min(CW, w); CH = min(CH, h)
    canvas = np.full((CH, CW, 3), fill, np.float32)
    sx0, sy0, sx1, sy1 = max(X0, 0), max(Y0, 0), min(X0+CW, w), min(Y0+CH, h)
    canvas[sy0-Y0:sy1-Y0, sx0-X0:sx1-X0] = src[sy0:sy1, sx0:sx1]
    return canvas

def to_img(canvas, out):
    a = (np.clip(canvas, 0, 1)*255+0.5).astype(np.uint8)
    sc = out/max(a.shape[:2])
    return Image.fromarray(a).resize((max(1, round(a.shape[1]*sc)), max(1, round(a.shape[0]*sc))), Image.LANCZOS)

def grabcut_cut(im8):
    h, w = im8.shape[:2]
    small = cv2.resize(im8, (w//2, h//2)); m2 = np.zeros(small.shape[:2], np.uint8)
    rect = tuple(v//2 for v in (int(.03*w), int(.08*h), int(.94*w), int(.90*h)))
    cv2.grabCut(small, m2, rect, np.zeros((1, 65)), np.zeros((1, 65)), 8, cv2.GC_INIT_WITH_RECT)
    fg = cv2.resize(((m2 == 1) | (m2 == 3)).astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
    fg = (lab == 1+np.argmax(st[1:, 4])).astype(np.uint8)
    cnts, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    fg = np.zeros_like(fg); cv2.drawContours(fg, cnts, -1, 1, -1)
    soft = cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.5)[..., None]
    rgb = im8.astype(np.float32)/255
    ys, xs = np.where(fg > 0)
    return rgb*soft + (1-soft), (xs.min(), ys.min(), xs.max(), ys.max())

def process(path, num, out=900):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.float32)/255
    if num in RAW_FULL:
        return to_img(im, out)
    if num in GRABCUT:
        comp, box = grabcut_cut((im*255).astype(np.uint8))
        return to_img(crop_canvas(comp, box, pad=0.07), out)
    bg = fit_bg(im); norm = np.clip(im/bg, 0, 1)
    for (a, b, c, d) in PAINT.get(num, []): norm[b:d, a:c] = 1
    if num in RAW_CROP:
        return to_img(crop_canvas(im, bbox(norm, 0.20), pad=0.07, clamp=True), out)
    return to_img(crop_canvas(np.clip(norm/0.95, 0, 1), bbox(norm, 0.075)), out)

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for slug, nums in FOTON:
        for k, num in enumerate(nums, 1):
            img = process(os.path.join(src, "IMG_%d.jpg" % num), num)
            name = "%s-%d" % (slug, k)
            img.save(os.path.join(dst, name + ".jpg"), quality=86, optimize=True)
            t = img.copy(); t.thumbnail((360, 360)); t.save(os.path.join(dst, name + "-t.jpg"), quality=82, optimize=True)
            print(name, img.size)
