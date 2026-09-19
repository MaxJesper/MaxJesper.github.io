"""Delad hjälpmodul: liten lokal webbserver (repots rot) + headless Chromium via Playwright med mjukvaru-WebGL,
så att kulmodellerna kan renderas till PNG utan grafikkort. Gemensam för render_kulmodeller.py och render_allotroper.py."""
import base64, http.server, io, socketserver, sys, threading
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]                                   # tools/kemi-ritverktyg/statiska-kulmodeller -> repots rot
sys.path.insert(0, str(HERE.parent))                     # chembuilder.py
OUT_DIR = REPO / 'images/kemi/kol-och-kolforeningar/kulmodeller'
HARNESS = '/tools/kemi-ritverktyg/statiska-kulmodeller/render-kulmodeller.html'

class _Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(REPO), **k)
    def log_message(self, *a): pass

def start_server(port):
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', port), _Quiet)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def open_page(playwright, port, scale=3):
    b = playwright.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 560, 'height': 460}, device_scale_factor=scale)
    pg.goto(f'http://127.0.0.1:{port}{HARNESS}'); pg.wait_for_function('typeof $3Dmol !== "undefined"')
    return b, pg

def render(pg, sdf, multi=(), rot=(-25, 0), ppa=34, sphere=0.28, stick=0.12, pad=9):
    """Renderar en molekyl (SDF/molblock + ev. extra dubbel-/trippelbindningar) -> beskuren transparent PNG (PIL)."""
    r = pg.evaluate('([s,m,o])=>renderMol(s,m,o)', [sdf, list(multi), {'rotX': rot[0], 'rotY': rot[1], 'pxPerAng': ppa, 'sphere': sphere, 'stick': stick}])
    im = Image.open(io.BytesIO(base64.b64decode(r['png'].split(',')[1]))).convert('RGBA')
    bb = im.split()[-1].getbbox()
    return im.crop((max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, im.width), min(bb[3] + pad, im.height)))
