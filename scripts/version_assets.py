"""Stamp local CSS/JS URLs by content so Pages updates cannot mix versions."""
from pathlib import Path
import hashlib,re
root=Path(__file__).resolve().parents[1];dist=root/'dist'
p=dist/'index.html';html=p.read_text()
for asset in ['style.css','js/engine.js','js/ui.js','js/renderer.js','js/app.js']:
 stamp=hashlib.sha256((dist/asset).read_bytes()).hexdigest()[:12]
 html=re.sub(r'((?:src|href)=")'+re.escape(asset)+r'(?:\?[^"\s]*)?("\s*)',lambda m:m[1]+asset+'?v='+stamp+m[2],html)
p.write_text(html)
