"""Analyserar ljud.json från rendera.mjs. Skriver ljudrapport.json. Se OVERLAMNING.md för tolkning."""
import json, base64, numpy as np, sys
d = json.load(open("ljud.json"))
def las(n):
    o = d[n]; a = np.frombuffer(base64.b64decode(o["b64"]), dtype=np.float32).copy(); return o["sr"], a
def db(x): return 20*np.log10(max(x,1e-9))
rap = []
def pitch(a, sr, t0, t1, fmin=150, fmax=1400):
    seg = a[int(t0*sr):int(t1*sr)]
    if len(seg) < 512 or np.max(np.abs(seg)) < 1e-3: return None
    seg = seg*np.hanning(len(seg))
    n = 1<<15
    S = np.abs(np.fft.rfft(seg, n)); fr = np.fft.rfftfreq(n, 1/sr)
    m = (fr>=fmin)&(fr<=fmax)
    # välj lägsta kraftiga topp (grundton) – inte nödvändigtvis högsta övertonen
    Sm = S[m]; frm = fr[m]
    thr = Sm.max()*0.5
    idx = np.where((Sm>=thr) & (Sm>=np.roll(Sm,1)) & (Sm>=np.roll(Sm,-1)))[0]
    return float(frm[idx[0]]) if len(idx) else None
for n in d:
    sr, a = las(n)
    pk = float(np.max(np.abs(a))); rms = float(np.sqrt(np.mean(a**2)))
    klipp = float(np.mean(np.abs(a) >= 0.999))
    dc = float(np.mean(a))
    env = np.abs(a); win = int(0.01*sr)
    e = np.convolve(env, np.ones(win)/win, mode="same")
    ljud = np.where(e > pk*0.03)[0]   # över ca -30 dB relativt topp
    start = ljud[0]/sr if len(ljud) else 0; slut = ljud[-1]/sr if len(ljud) else 0
    dur = slut - start
    F = np.abs(np.fft.rfft(a[:sr*4])); fr = np.fft.rfftfreq(len(a[:sr*4]), 1/sr)
    cent = float((F*fr).sum()/max(F.sum(),1e-9))
    r = dict(namn=n, topp=round(pk,3), topp_dBFS=round(db(pk),1), rms_dBFS=round(db(rms),1), klippning=klipp, dc=round(dc,5), start=round(start,3), langd_s=round(dur,3), centroid_Hz=round(cent))
    if n.startswith("gnagg"):
        t0 = start
        toner = []
        step = 0.06
        t = t0
        while t < slut-0.03:
            toner.append(pitch(a, sr, t, t+0.05))
            t += step
        tt = [x for x in toner if x]
        r["grundton_min"] = round(min(tt)); r["grundton_max"] = round(max(tt))
        r["grundton_forlopp"] = [round(x) if x else None for x in toner]
        # glidande: monoton skillnad mellan start och topp och fall
        r["glidande"] = bool(max(tt) > tt[0]*1.2 and tt[-1] < max(tt)*0.7)
    if n == "hovar":
        # transienter: lokala toppar i kort-tids-energi
        w = int(0.004*sr); en = np.convolve(a**2, np.ones(w)/w, mode="same")
        thr = en.max()*0.08
        toppar = []
        last = -1
        for i in range(1, len(en)-1):
            if en[i]>thr and en[i]>=en[i-1] and en[i]>=en[i+1] and (last<0 or i-last>int(0.06*sr)):
                toppar.append(round(i/sr,3)); last = i
        r["transienter"] = len(toppar); r["transient_tider"] = toppar
    if n in ("ratt","fel"):
        h = len(a)
        p1 = pitch(a, sr, start+0.02, start+0.09, 100, 2000); p2 = pitch(a, sr, start+0.20 if n=="ratt" else start+0.24, start+0.28 if n=="ratt" else start+0.36, 100, 2000)
        r["ton1_Hz"] = round(p1) if p1 else None; r["ton2_Hz"] = round(p2) if p2 else None
        r["riktning"] = "upp" if (p1 and p2 and p2>p1) else "ned"
    rap.append(r)
for r in rap: print(json.dumps(r, ensure_ascii=False))
json.dump(rap, open("ljudrapport.json","w"), ensure_ascii=False, indent=1)
