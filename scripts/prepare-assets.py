"""Extract supplied pixels, without regenerating the brand or artwork."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\New User\.codex\codex-remote-attachments\01a0a652-df98-7fd2-824a-cac4104073bf\23535AB4-F955-4268-9BB8-BD70B18B1A9A')
OUT = ROOT / 'assets' / 'brand'
OUT.mkdir(parents=True, exist_ok=True)
logo = Image.open(SOURCE / '1-Photo-1.jpg').convert('RGB')
logo.crop((100, 411, 1168, 887)).save(OUT / 'wd-logo.png')
icon = Image.new('RGB', (1024, 1024), 'white')
mark = logo.crop((100, 411, 1168, 887))
mark.thumbnail((850, 600), Image.Resampling.LANCZOS)
icon.paste(mark, ((1024-mark.width)//2, (1024-mark.height)//2))
icon.save(OUT / 'app-icon.png')
blue = [p for p in logo.getdata() if p[2] > 120 and p[0] < 35 and p[1] > 65 and p[1] < 150]
rgb = tuple(sorted(p[i] for p in blue)[len(blue)//2] for i in range(3))
print('Logo blue:', '#%02X%02X%02X' % rgb)
(OUT / 'sources.json').write_text(json.dumps({
    'logo': 'Photo 1.jpg supplied by the user; original pixels cropped to the mark bounds.',
    'artwork': 'No album artwork from the UI reference is packaged in production assets. Runtime artwork requires a separately authorized provider source.',
    'blue': '#%02X%02X%02X' % rgb,
}, indent=2))
