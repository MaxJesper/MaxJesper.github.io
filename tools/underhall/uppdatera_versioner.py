#!/usr/bin/env python3
"""Cache-busting: ger alla länkar till sajtens egna .css- och .js-filer ett versionsnummer (?v=XXXXXXXX)
som räknas fram ur filens INNEHÅLL. Ändras en fil får den ett nytt nummer, så webbläsare och telefoner hämtar
den nya filen direkt i stället för att använda en sparad gammal kopia (Jesper 5 okt 2026: lyssna.js tog
~20 min att slå igenom på iPhone).

Kör från var som helst:   python3 tools/underhall/uppdatera_versioner.py
- Idempotent: körs den igen utan att något ändrats blir inga filer omskrivna.
- Kör den EFTER varje ändring i en gemensam css/js-fil och EFTER varje ombyggnad med bygg_*.py
  (byggskripten skriver länkar utan versionsnummer).
"""
import hashlib, os, re, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SKIP_DIRS = {'.git', '_to_delete', 'node_modules'}
REF = re.compile(r'''((?:src|href)\s*=\s*["'])([^"'?#]+\.(?:css|js))(\?v=[0-9a-f]+)?(["'])''')
_hash_cache = {}

def file_hash(path):
    if path not in _hash_cache:
        with open(path, 'rb') as f:
            _hash_cache[path] = hashlib.md5(f.read()).hexdigest()[:8]
    return _hash_cache[path]

def resolve(html_path, ref):
    if ref.startswith(('http:', 'https:', '//', 'data:')):
        return None
    if ref.startswith('/'):
        p = os.path.join(REPO, ref.lstrip('/'))
    else:
        p = os.path.normpath(os.path.join(os.path.dirname(html_path), ref))
    return p if os.path.isfile(p) else None

IMPORT = re.compile(r'''(@import\s+url\(\s*["']?)([^"')?#]+\.css)(\?v=[0-9a-f]+)?(["']?\s*\))''')

def update_css_imports():
    """@import i css-filer (t.ex. style.css -> knappar.css) får också versionsnummer. Det gör att style.css
    själv byter innehåll – och därmed hash – när en importerad fil ändras. Körs FÖRE html-filerna."""
    n = 0
    for root, dirs, files in os.walk(os.path.join(REPO, 'css')):
        for name in files:
            if not name.endswith('.css'):
                continue
            path = os.path.join(root, name)
            text = open(path, encoding='utf-8').read()
            def sub(m):
                target = resolve(path, m.group(2))
                return f'{m.group(1)}{m.group(2)}?v={file_hash(target)}{m.group(4)}' if target else m.group(0)
            out = IMPORT.sub(sub, text)
            if out != text:
                open(path, 'w', encoding='utf-8').write(out); n += 1
    _hash_cache.clear()
    return n

JSREF = re.compile(r'''(["'])(/js/[A-Za-z0-9_\-./]+\.js)(\?v=[0-9a-f]+)?(["'])''')

def update_js_refs():
    """Skript som laddas dynamiskt från ett annat skript (t.ex. render-instudering.js laddar
    "/js/kemi-inmatning.js") får också versionsnummer. Körs FÖRE html-filerna, så att det anropande
    skriptets egen hash följer med när det laddade skriptet ändras. (Jesper 8 okt 2026)"""
    n = 0
    for root, dirs, files in os.walk(os.path.join(REPO, 'js')):
        for name in files:
            if not name.endswith('.js'):
                continue
            path = os.path.join(root, name)
            text = open(path, encoding='utf-8').read()
            def sub(m):
                target = resolve(path, m.group(2))
                if not target or os.path.abspath(target) == os.path.abspath(path):
                    return m.group(0)
                return f'{m.group(1)}{m.group(2)}?v={file_hash(target)}{m.group(4)}'
            out = JSREF.sub(sub, text)
            if out != text:
                open(path, 'w', encoding='utf-8').write(out); n += 1
    _hash_cache.clear()
    return n

def main():
    print(f'css-filer med uppdaterade @import: {update_css_imports()}')
    print(f'js-filer med uppdaterade skriptreferenser: {update_js_refs()}')
    changed_files, changed_refs = 0, 0
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            if not name.endswith('.html'):
                continue
            path = os.path.join(root, name)
            with open(path, encoding='utf-8') as f:
                text = f.read()
            n = [0]
            def sub(m):
                target = resolve(path, m.group(2))
                if not target:
                    return m.group(0)
                new = f'{m.group(1)}{m.group(2)}?v={file_hash(target)}{m.group(4)}'
                if new != m.group(0):
                    n[0] += 1
                return new
            out = REF.sub(sub, text)
            if out != text:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(out)
                changed_files += 1
                changed_refs += n[0]
    print(f'uppdaterade {changed_refs} länkar i {changed_files} html-filer')

if __name__ == '__main__':
    main()
