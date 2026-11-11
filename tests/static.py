"""Dependency-free source/link and SEO activation checks. Run with Python 3."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib, json, re, shutil, subprocess, tempfile
ROOT = Path(__file__).resolve().parents[1]
PAGES = ['index', 'catalog', 'order', 'about', 'contact', '404']
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.attrs=[]; self.text=[]
    def handle_starttag(self, tag, attrs): self.attrs.append((tag, dict(attrs)))
    def handle_data(self, data): self.text.append(data)
titles=[]
checked=0
for name in PAGES:
    source=(ROOT/f'{name}.html').read_text(encoding='utf-8')
    doc=Document(); doc.feed(source)
    assert sum(tag=='h1' for tag,attrs in doc.attrs)==1, name
    title=re.search(r'<title>(.*?)</title>',source).group(1)
    assert 'Dream Bakerz' in title and title not in titles; titles.append(title)
    assert not re.search(r'Dream\s+Bakers\b',' '.join(doc.text),re.I), name
    assert sum(tag=='meta' and attrs.get('name')=='description' for tag,attrs in doc.attrs)==1
    schema=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',source).group(1))
    assert schema['name']=='Dream Bakerz' and schema['telephone']=='+923477268670'
    assert 'aggregateRating' not in schema and 'openingHours' not in schema
    for tag,attrs in doc.attrs:
        for key in ['href','src']:
            link=attrs.get(key,'')
            if not link or not link.startswith('/'): continue
            target=ROOT/unquote(urlsplit(link).path).lstrip('/')
            assert target.is_file(), f'{name}: broken {key}: {link}'
            checked+=1
for file in (ROOT/'css').glob('*.css'):
    for url in re.findall(r'url\([\'"]?([^\)\'\"]+)',file.read_text()):
        if url.startswith('#'):
            assert all(f'id="{url[1:]}"' in (ROOT/f'{page}.html').read_text(encoding='utf-8') for page in PAGES)
            continue
        assert (ROOT/url.lstrip('/')).is_file(), str(file)+' '+url
for file in (ROOT/'js').glob('*.js'):
    subprocess.run(['node','--check',str(file)],check=True,capture_output=True)
before={page:hashlib.sha256((ROOT/f'{page}.html').read_bytes()).hexdigest() for page in PAGES}
subprocess.run(['node',str(ROOT/'scripts/build.mjs')],check=True,capture_output=True)
assert before=={page:hashlib.sha256((ROOT/f'{page}.html').read_bytes()).hexdigest() for page in PAGES}, 'Build must be idempotent'
with tempfile.TemporaryDirectory(prefix='dream-bakerz-seo-') as folder:
    fixture=Path(folder); (fixture/'scripts').mkdir()
    for page in PAGES: shutil.copyfile(ROOT/f'{page}.html',fixture/f'{page}.html')
    shutil.copyfile(ROOT/'scripts/configure-seo.mjs',fixture/'scripts/configure-seo.mjs')
    blocked=subprocess.run(['node',str(fixture/'scripts/configure-seo.mjs')],capture_output=True)
    assert blocked.returncode!=0, 'SEO activation requires explicit verification flag'
    subprocess.run(['node',str(fixture/'scripts/configure-seo.mjs'),'--origin=https://dreambakerz.com','--routing-verified'],check=True,capture_output=True)
    assert (fixture/'sitemap.xml').read_text().count('<loc>')==5
    assert 'Sitemap: https://dreambakerz.com/sitemap.xml' in (fixture/'robots.txt').read_text()
    for page in PAGES[:-1]:
        html=(fixture/f'{page}.html').read_text(encoding='utf-8')
        assert '<link rel="canonical" href="https://dreambakerz.com/' in html
        assert '<meta property="og:image" content="https://dreambakerz.com/' in html
report={'result':'PASS','pages':len(PAGES),'internalReferencesChecked':checked,'jsSyntax':'PASS','sharedBuildIdempotent':'PASS','seoActivationInIsolatedFixture':'PASS','productionFilesActivated':False}
(ROOT/'docs/verification/static-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
