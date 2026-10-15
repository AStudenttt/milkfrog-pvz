"""Dependency-free validation before static deployment."""
from pathlib import Path
import json,re,struct
root=Path(__file__).resolve().parents[1];d=root/'dist'
manifest=json.loads((d/'assets/manifest.json').read_text())
for name,m in manifest.items():
 p=d/'assets'/m['file']
 assert p.is_file(),f'Missing asset: {name}'
 data=p.read_bytes()
 assert data[:8]==b'\x89PNG\r\n\x1a\n',str(p)
 w,h=struct.unpack('>II',data[16:24])
 assert w==m['w']*m['cols'],name
 assert h>=m['h']*((m['frames']+m['cols']-1)//m['cols']),name
 assert len(m.get('durations',[])) in (0,m['frames']),name
for path in re.findall(r'(?:src|href)="([^"#]+)"',(d/'index.html').read_text()):
 path=path.split('?')[0]
 if path.startswith(('https:','http:','data:')) or path in ('game-offline.html','game-source.zip'):continue
 assert not path.startswith('/'),f'Absolute URL breaks project Pages: {path}'
 assert (d/path).is_file(),f'Missing linked file: {path}'
assert not (root/'.openai').exists(),'Do not export Sites account configuration'
print(f'PASS {len(manifest)} animation atlases, local links and project-URL compatibility')

for path in re.findall(r"url\(['\"]?([^)'\"]+)['\"]?\)",(d/'style.css').read_text()):
 if not path.startswith(('data:','https:','http:')):
  assert (d/path).is_file(),f'Missing CSS bitmap: {path}'
print('PASS all original UI textures referenced by CSS')
