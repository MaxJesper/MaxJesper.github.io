import re,sys
from PIL import Image
IMG='/images/fysik/atomfysik/'
D='/'.join(__file__.split('/')[:-1])
def dims(n):
    import os
    w,h=Image.open(os.path.expanduser(f'~/mnt/github/images/fysik/atomfysik/{n}.png')).size; return w,h
def side(n,alt,cap):
    w,h=dims(n); return f'<figure class="side-fig"><img src="{IMG}{n}.png" width="{w//2}" height="{h//2}" alt="{alt}" loading="lazy"><figcaption>{cap}</figcaption></figure>'
def full(n,alt,cap):
    w,h=dims(n); return f'''        <div class="m-row m-row--full"><div class="fig-row"><figure class="wide-fig"><img src="{IMG}{n}.png" width="{w//2}" height="{h//2}" alt="{alt}" loading="lazy"><figcaption>{cap}</figcaption></figure></div></div>\n'''
exec(open(sys.argv[1]).read())   # defines F, SIDE, AFTER, MARKERS
s=open('studieguide.html').read()
for pat,key in MARKERS: s=re.sub(pat,f'@@FULL:{key}@@',s,flags=re.S)
def h3title(seg):
    m=re.match(r'\s*<h3>(.*?)</h3>',seg); return m.group(1) if m else None
def plain(seg): return f'        <div class="m-row m-row--plain"><div class="m-lead">\n{seg.strip()}\n        </div></div>\n'
def conv(body,mid=''):
    parts=re.split(r'(@@FULL:\w+@@)',body); segs=[]
    for p in parts:
        if p.startswith('@@FULL'): segs.append(('FULL',p[7:-2])); continue
        for x in re.split(r'(?=<h3>)',p):
            if x.strip(): segs.append(('TXT',x))
    out=''; i=0
    while i<len(segs):
        k,x=segs[i]
        if k=='FULL': out+=F[x]; i+=1; continue
        t=h3title(x) or f'intro:{mid}'
        if t in SIDE:
            key,ab=SIDE[t]; rest=''
            for j in range(ab):
                if i+1<len(segs) and segs[i+1][0]=='TXT': rest+=segs[i+1][1]; i+=1
            out+=f'        <div class="m-row">\n          <div class="m-lead">\n{x.strip()}\n          </div>\n          <div class="m-side">{F[key]}</div>\n'
            if rest: out+=f'          <div class="m-rest">\n{rest.strip()}\n          </div>\n'
            out+='        </div>\n'
        else:
            out+=plain(x)
            if t in AFTER: out+=F[AFTER[t]]
        i+=1
    return out
res=''; pos=0
for m in re.finditer(r'<div class="m-body">',s):
    start=m.end(); depth=1; j=start
    for t in re.finditer(r'<div\b|</div>',s[start:]):
        depth += 1 if t.group(0)=='<div' else -1
        if depth==0: end=start+t.start(); break
    mid=re.findall(r'id="(m\d+)"',s[:start])[-1]
    res+=s[pos:start]+'\n'+conv(s[start:end],mid)+'      '; pos=end
s=res+s[pos:]
if 'guide-wide' not in s:
    s=s.replace('<link rel="stylesheet" href="/css/milstolpe.css?v=f491bea5" />','<link rel="stylesheet" href="/css/milstolpe.css?v=f491bea5" />\n  <link rel="stylesheet" href="/css/studieguide-bildkolumn.css?v=3faf68c0" />\n  <link rel="stylesheet" href="/css/bildzoom.css" />',1)
    s=s.replace('body { --listen-color:#2e4a8a;','body { --guide-accent:#2e4a8a; --guide-soft:#eef2fb; --guide-border:#cdd9f0; --guide-dash:#cdd9f0; --listen-color:#2e4a8a;',1)
    s=s.replace('<main>','<main class="guide-wide">',1)
    s=s.replace('  </style>','''    .milestone .side-fig { background: none; border: none; padding: 0; }
    .wide-fig img { width: 100%; height: auto; display: block; }
    .wide-fig figcaption { font-size: 0.88rem; line-height: 1.4; color: #4a4a5a; margin-top: 0.5rem; text-align: left; }
    .fig-row .wide-fig { max-width: 1100px; }
  </style>''',1)
    s=s.replace('</body>','  <script src="/js/bildzoom.js"></script>\n</body>',1)
    s=s.replace('Formler och faktauppgifter är allmän faktakunskap.','Formler och faktauppgifter är allmän faktakunskap. <strong>Vetenskaplig bildgranskning:</strong> diagrammen är schematiska och inte skalenliga. Partikelantal, våglängder, sönderfallsserien och reaktorns uppbyggnad är kontrollerade mot källorna ovan.',1)
open('studieguide.html','w').write(s)
