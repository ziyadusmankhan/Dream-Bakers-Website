"""Regenerate derivative assets; originals remain untouched. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
output = ROOT / 'assets/cakes/optimized'
output.mkdir(parents=True, exist_ok=True)
report = []
for source in sorted((ROOT / 'assets/cakes/birthday').glob('*.jpeg')):
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        derivatives = {}
        for width in (400, 640, 1000):
            resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
            target = output / f'{source.stem}-{width}.webp'
            resized.save(target, 'WEBP', quality=86, method=6)
            derivatives[str(width)] = target.stat().st_size
        report.append({'image': source.name, 'originalBytes': source.stat().st_size, 'webpBytes': derivatives})
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
