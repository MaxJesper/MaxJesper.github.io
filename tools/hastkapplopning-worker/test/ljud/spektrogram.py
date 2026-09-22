"""Ritar spektrogram för de viktigaste ljuden (ur ljud.json) till spektrogram.png – för att kontrollera formen med ögat."""
import json, base64, numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
d = json.load(open("ljud.json"))
namn = ["gnagg_stor", "gnagg_liten", "hovar", "ratt", "fel", "mal", "pall", "last"]
fig, ax = plt.subplots(2, 4, figsize=(16, 7))
for a, n in zip(ax.ravel(), namn):
    o = d[n]; x = np.frombuffer(base64.b64decode(o["b64"]), dtype=np.float32); sr = o["sr"]
    a.specgram(x, NFFT=1024, Fs=sr, noverlap=896, cmap="magma", vmin=-110, vmax=-30)
    a.set_ylim(0, 6000); a.set_title(n); a.set_xlabel("s"); a.set_ylabel("Hz")
plt.tight_layout(); plt.savefig("spektrogram.png", dpi=70)
