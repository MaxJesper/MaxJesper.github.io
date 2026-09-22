/* =====================================================================
   sound.js – syntetiserade ljud med Web Audio API (inga externa filer)
   ---------------------------------------------------------------------
   Alla ljud byggs av oscillatorer och filtrerat brus. Varje syntfunktion
   tar (ctx, dest, t0, …) så att exakt samma kod kan köras i en vanlig
   AudioContext (spelet) och i en OfflineAudioContext (testet som mäter
   nivå, längd, grundton och transienter utan att någon behöver lyssna).

   Valfria riktiga ljudfiler: fyll SOUND_FILES i config.js, t.ex.
     { gnagg_stor: "ljud/gnagg.mp3", hovar: "ljud/hovar.mp3" }
   – då används filen i stället för det syntetiserade ljudet.
   ===================================================================== */

export const LJUD = [
  ["gnagg_stor", "Gnägg (3 steg)"],
  ["gnagg_liten", "Gnägg (2 steg)"],
  ["hovar", "Hovar (1 steg)"],
  ["tick", "Tick (nedräkning)"],
  ["last", "Svar låst"],
  ["ratt", "Rätt svar (stigande)"],
  ["fel", "Fel svar (fallande)"],
  ["mal", "Målfanfar"],
  ["pall", "Prispallsfanfar"],
];

const brusCache = new WeakMap();
function brus(ctx) {
  let b = brusCache.get(ctx);
  if (!b) {
    const len = Math.floor(ctx.sampleRate * 2);
    b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0);
    let s = 12345; // deterministiskt brus (samma resultat vid varje rendering)
    for (let i = 0; i < len; i++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      d[i] = (s / 4294967296) * 2 - 1;
    }
    brusCache.set(ctx, b);
  }
  return b;
}

/* Kedja: master-volym → mjuk begränsare → utgång. Returnerar ingången. */
export function byggKedja(ctx, volym) {
  const g = ctx.createGain();
  g.gain.value = volym === undefined ? 0.9 : volym;
  const k = ctx.createDynamicsCompressor();
  k.threshold.value = -8;
  k.knee.value = 6;
  k.ratio.value = 12;
  k.attack.value = 0.003;
  k.release.value = 0.1;
  g.connect(k);
  k.connect(ctx.destination);
  return g;
}

function adsr(param, t0, a, dur, r, topp) {
  param.setValueAtTime(0.0001, t0);
  param.linearRampToValueAtTime(topp, t0 + a);
  param.setValueAtTime(topp, t0 + Math.max(a, dur));
  param.exponentialRampToValueAtTime(0.0001, t0 + dur + r);
}

/* ---------- Gnägg ---------- */
/* Grundtonen glider upp (~520→880 Hz), håller med vibrato och faller sedan
   (→ ~330 Hz) med en skrovlig "skratt"-modulering mot slutet. Två varianter:
   stor (3 steg, ca 1,0 s) och liten (2 steg, ca 0,75 s). */
export function syntGnagg(ctx, dest, t0, stor) {
  const dur = stor ? 1.05 : 0.82;
  const f = stor ? { start: 520, topp: 880, lag: 330 } : { start: 470, topp: 760, lag: 360 };
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(f.start, t0);
  osc.frequency.exponentialRampToValueAtTime(f.topp, t0 + dur * 0.16);
  osc.frequency.exponentialRampToValueAtTime(f.topp * 0.94, t0 + dur * 0.42);
  osc.frequency.exponentialRampToValueAtTime(f.lag, t0 + dur);
  const vib = ctx.createOscillator();
  vib.frequency.value = 7;
  const vibG = ctx.createGain();
  vibG.gain.value = 16;
  vib.connect(vibG);
  vibG.connect(osc.frequency);
  // Skrovlig amplitudmodulering som ökar under andra halvan
  const am = ctx.createGain();
  am.gain.value = 0.7;
  const amLfo = ctx.createOscillator();
  amLfo.frequency.setValueAtTime(9, t0);
  amLfo.frequency.linearRampToValueAtTime(24, t0 + dur);
  const amDjup = ctx.createGain();
  amDjup.gain.setValueAtTime(0, t0);
  amDjup.gain.setValueAtTime(0, t0 + dur * 0.3);
  amDjup.gain.linearRampToValueAtTime(0.32, t0 + dur * 0.7);
  amLfo.connect(amDjup);
  amDjup.connect(am.gain);
  osc.connect(am);
  const ut = ctx.createGain();
  adsr(ut.gain, t0, 0.04, dur * 0.85, dur * 0.15 + 0.05, 0.42);
  // Direkt (mjukt lågpass) + två vokalformanter
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 3200;
  am.connect(lp);
  lp.connect(ut);
  for (const [fq, q, gain] of [[1100, 4, 0.55], [2500, 5, 0.35]]) {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = fq;
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    am.connect(bp);
    bp.connect(g);
    g.connect(ut);
  }
  // Andningsbrus
  const n = ctx.createBufferSource();
  n.buffer = brus(ctx);
  const nbp = ctx.createBiquadFilter();
  nbp.type = "bandpass";
  nbp.frequency.value = 3400;
  nbp.Q.value = 0.8;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t0);
  ng.gain.linearRampToValueAtTime(0.09, t0 + 0.05);
  ng.gain.linearRampToValueAtTime(0.03, t0 + dur * 0.5);
  ng.gain.linearRampToValueAtTime(0.08, t0 + dur * 0.95);
  ng.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.1);
  n.connect(nbp);
  nbp.connect(ng);
  ng.connect(ut);
  ut.connect(dest);
  const slut = t0 + dur + 0.25;
  for (const o of [osc, vib, amLfo]) {
    o.start(t0);
    o.stop(slut);
  }
  n.start(t0);
  n.stop(slut);
  return dur + 0.25;
}

/* ---------- Hovar ---------- */
function hov(ctx, dest, t, styrka) {
  const n = ctx.createBufferSource();
  n.buffer = brus(ctx);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1700 + 300 * styrka;
  bp.Q.value = 1.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.9 * styrka, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  n.connect(bp);
  bp.connect(g);
  g.connect(dest);
  n.start(t, (styrka * 7) % 1);
  n.stop(t + 0.1);
  // Dovt "tock" (hovens kropp)
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(190, t);
  o.frequency.exponentialRampToValueAtTime(80, t + 0.06);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.linearRampToValueAtTime(0.75 * styrka, t + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(og);
  og.connect(dest);
  o.start(t);
  o.stop(t + 0.12);
}

/* Galopp i fyra takter: tre slag och en paus, ungefär "ta-ta-tam – ta-ta-tam –". */
export function syntHovar(ctx, dest, t0, langd) {
  const steg = 0.15;
  const mon = [0, 1, 2, 4, 5, 6, 8, 9, 10];
  const styrkor = [0.8, 0.9, 1, 0.8, 0.9, 1, 0.8, 0.9, 1];
  const max = langd || 1.6;
  let sist = 0;
  mon.forEach((m, i) => {
    if (m * steg < max) {
      hov(ctx, dest, t0 + m * steg, styrkor[i]);
      sist = m * steg;
    }
  });
  return sist + 0.2;
}

/* ---------- Tick, låst, rätt, fel ---------- */
export function syntTick(ctx, dest, t0, sista) {
  const o = ctx.createOscillator();
  o.type = "square";
  o.frequency.value = sista ? 1800 : 1350;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 4000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.5, t0 + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
  o.connect(lp);
  lp.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + 0.08);
  return 0.1;
}

export function syntLast(ctx, dest, t0) {
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(700, t0);
  o.frequency.exponentialRampToValueAtTime(260, t0 + 0.11);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.6, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
  o.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + 0.2);
  return 0.2;
}

function ton(ctx, dest, t, f, d, typ, topp, lpHz) {
  const o = ctx.createOscillator();
  o.type = typ;
  o.frequency.value = f;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = lpHz || 5000;
  const g = ctx.createGain();
  adsr(g.gain, t, 0.01, d, 0.08, topp);
  o.connect(lp);
  lp.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + d + 0.12);
}

/* Rätt: två toner uppåt. */
export function syntRatt(ctx, dest, t0) {
  ton(ctx, dest, t0, 660, 0.11, "triangle", 0.5);
  ton(ctx, dest, t0 + 0.12, 990, 0.2, "triangle", 0.5);
  return 0.5;
}

/* Fel: två toner nedåt, mörkare klang. */
export function syntFel(ctx, dest, t0) {
  ton(ctx, dest, t0, 330, 0.16, "sawtooth", 0.3, 1100);
  ton(ctx, dest, t0 + 0.18, 208, 0.34, "sawtooth", 0.3, 800);
  return 0.7;
}

/* ---------- Fanfarer (blåsinstrument: två lätt förstämda sågtandsvågor genom lågpass) ---------- */
function brass(ctx, dest, t, f, d, topp) {
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 2;
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.linearRampToValueAtTime(2800, t + 0.06);
  lp.frequency.linearRampToValueAtTime(1800, t + d);
  const g = ctx.createGain();
  adsr(g.gain, t, 0.025, d, 0.12, topp);
  lp.connect(g);
  g.connect(dest);
  for (const cent of [-5, 5]) {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.detune.value = cent;
    o.connect(lp);
    o.start(t);
    o.stop(t + d + 0.2);
  }
}

export function syntMal(ctx, dest, t0) {
  const n = [
    [392, 0, 0.13],
    [523, 0.15, 0.13],
    [659, 0.3, 0.13],
    [784, 0.45, 0.42],
    [659, 0.95, 0.12],
    [784, 1.1, 0.75],
  ];
  for (const [f, t, d] of n) brass(ctx, dest, t0 + t, f, d, 0.22);
  for (const f of [523, 659, 1047]) brass(ctx, dest, t0 + 1.1, f, 0.75, 0.12);
  return 2.05;
}

export function syntPall(ctx, dest, t0) {
  const n = [
    [523, 0, 0.13],
    [523, 0.16, 0.13],
    [523, 0.32, 0.13],
    [659, 0.48, 0.3],
    [587, 0.85, 0.13],
    [659, 1.01, 0.13],
    [784, 1.17, 0.5],
    [880, 1.75, 0.13],
    [784, 1.91, 0.13],
    [1047, 2.07, 1.0],
  ];
  for (const [f, t, d] of n) brass(ctx, dest, t0 + t, f, d, 0.2);
  for (const f of [523, 659, 784]) brass(ctx, dest, t0 + 2.07, f, 1.0, 0.11);
  ton(ctx, dest, t0 + 2.07, 131, 1.0, "sine", 0.4);
  return 3.3;
}

export const SYNTAR = {
  gnagg_stor: (c, d, t) => syntGnagg(c, d, t, true),
  gnagg_liten: (c, d, t) => syntGnagg(c, d, t, false),
  hovar: (c, d, t) => syntHovar(c, d, t, 1.6),
  tick: (c, d, t) => syntTick(c, d, t, false),
  tick_sista: (c, d, t) => syntTick(c, d, t, true),
  last: syntLast,
  ratt: syntRatt,
  fel: syntFel,
  mal: syntMal,
  pall: syntPall,
};

/* Renderar ett ljud offline (används av ljudtestet). Returnerar {sr, data:Float32Array}. */
export async function renderaOffline(namn, volym) {
  const sr = 44100;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new OAC(1, sr * 4, sr);
  const kedja = byggKedja(ctx, volym);
  SYNTAR[namn](ctx, kedja, 0.05);
  const buf = await ctx.startRendering();
  return { sr, data: buf.getChannelData(0) };
}

/* ---------- Spelaren ---------- */

export class Ljud {
  constructor(filer) {
    this.filer = filer || {};
    this.ctx = null;
    this.kedja = null;
    this.pa = true;
    this.vol = 0.9;
    this.buffrar = {};
    this.senastStatus = "ej startad";
  }

  /* Ska anropas i en klickhändelse (webbläsare kräver en användargest). */
  lasUpp() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) {
          this.senastStatus = "Web Audio stöds inte";
          return false;
        }
        this.ctx = new AC();
        this.kedja = byggKedja(this.ctx, this.vol);
        this.laddaFiler();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.senastStatus = this.ctx.state;
      return true;
    } catch (e) {
      this.senastStatus = "fel: " + e.message;
      return false;
    }
  }

  get redo() {
    return !!this.ctx && this.ctx.state === "running";
  }

  laddaFiler() {
    for (const [namn, url] of Object.entries(this.filer)) {
      if (!url) continue;
      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => this.ctx.decodeAudioData(b))
        .then((buf) => {
          this.buffrar[namn] = buf;
        })
        .catch(() => {});
    }
  }

  satt(pa) {
    this.pa = !!pa;
  }

  volym(v) {
    this.vol = Math.max(0, Math.min(1, v));
    if (this.kedja) this.kedja.gain.value = this.vol;
  }

  /* Spelar ett ljud. Returnerar ungefärlig längd i sekunder (0 om inget spelades). */
  spela(namn, tvinga) {
    if (!this.pa && !tvinga) return 0;
    if (!this.lasUpp()) return 0;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.02;
    try {
      const buf = this.buffrar[namn];
      if (buf) {
        const s = ctx.createBufferSource();
        s.buffer = buf;
        s.connect(this.kedja);
        s.start(t0);
        return buf.duration;
      }
      const f = SYNTAR[namn];
      return f ? f(ctx, this.kedja, t0) : 0;
    } catch (e) {
      this.senastStatus = "fel: " + e.message;
      return 0;
    }
  }

  /* Ljudtest: spelar alla ljud i tur och ordning. etikett(text) får texten som visas. */
  async ljudtest(etikett) {
    this.lasUpp();
    for (const [namn, text] of LJUD) {
      if (etikett) etikett(text);
      const d = this.spela(namn, true);
      await new Promise((r) => setTimeout(r, Math.max(700, d * 1000 + 500)));
    }
    if (etikett) etikett("");
  }
}
