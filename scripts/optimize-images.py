"""Regenerate derivative assets; originals remain untouched. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageOps
import argparse, json

ROOT = Path(__file__).resolve().parents[1]
output = ROOT / 'assets/cakes/optimized'
output.mkdir(parents=True, exist_ok=True)
report = []
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--only-missing', action='store_true', help='Keep existing derivatives unchanged.')
args = parser.parse_args()
sources = ROOT / 'assets/cakes'
for source in sorted(p for p in sources.rglob('*') if p.suffix.lower() in ('.jpg', '.jpeg') and 'optimized' not in p.relative_to(sources).parts):
    # Retain legacy B1-B7 URLs; organize additional photos in named collections.
    relative = source.relative_to(sources)
    key = Path(source.stem) if source.stem in {f'B{i}' for i in range(1, 8)} else relative.with_suffix('')
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        derivatives = {}
        for width in (400, 640, 1000):
            target = output / f'{key.as_posix()}-{width}.webp'
            target.parent.mkdir(parents=True, exist_ok=True)
            if not (args.only_missing and target.exists()):
                resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                resized.save(target, 'WEBP', quality=86, method=6)
            derivatives[str(width)] = target.stat().st_size
        report.append({'image': relative.as_posix(), 'originalBytes': source.stat().st_size, 'webpBytes': derivatives})
if args.only_missing:
    (ROOT / 'docs/image-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'images': len(report), 'originalCakeBytes': sum(p['originalBytes'] for p in report), 'cake640Bytes': sum(p['webpBytes']['640'] for p in report)}, indent=2))
    raise SystemExit(0)
logo_source = next((ROOT / 'assets/logo').glob('*.jpeg'))
with Image.open(logo_source) as image:
    image = ImageOps.exif_transpose(image).convert('RGB')
    image.resize((320, 320), Image.Resampling.LANCZOS).save(ROOT / 'assets/logo/logo.webp', quality=90, method=6)
    image.resize((32, 32), Image.Resampling.LANCZOS).save(ROOT / 'assets/logo/favicon-32.png')
    image.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / 'assets/logo/apple-touch-icon.png')
    # Actual supplied cake image for sharing, without synthetic product imagery.
with Image.open(ROOT / 'assets/cakes/birthday/B2.jpeg') as image:
    ImageOps.fit(image.convert('RGB'), (1200, 630), centering=(.5, .55)).save(ROOT / 'assets/cakes/optimized/share.jpg', quality=88, optimize=True)
for name in ('DR 6', 'DR 9'):
    with Image.open(ROOT / f'assets/reviews/{name}.png') as image:
        image.convert('RGB').save(ROOT / f'assets/reviews/{name.replace(" ", "-").lower()}.webp', quality=90, method=6)
(ROOT / 'docs/image-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'originalCakeBytes': sum(p['originalBytes'] for p in report), 'cake640Bytes': sum(p['webpBytes']['640'] for p in report)}, indent=2))
