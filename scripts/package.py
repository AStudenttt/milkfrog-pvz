from pathlib import Path
import base64,json,mimetypes,re,zipfile,runpy
root=Path(__file__).resolve().parents[1];d=root/'dist'
runpy.run_path(str(root/'scripts/version_assets.py'))
urls={}
for p in (d/'assets').rglob('*'):
 if p.is_file() and p.suffix!='.json':
  mime=mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
  urls[str(p.relative_to(d/'assets'))]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
html=(d/'index.html').read_text()
css=re.sub(r"url\(['\"]?assets/([^)'\"]+)['\"]?\)",lambda m:'url(\"'+urls[m[1]]+'\")',(d/'style.css').read_text())
html=re.sub(r'<link rel="stylesheet" href="style\.css(?:\?[^"]*)?">',lambda m:'<style>'+css+'</style>',html)
html=re.sub(r'src="assets/([^"]+)"',lambda m:'src="'+urls.get(m[1],'')+'"',html)
manifest=json.loads((d/'assets/manifest.json').read_text())
setup='<script>window.__ASSET_URLS__='+json.dumps(urls)+';window.__ASSET_MANIFEST__='+json.dumps(manifest)+';</script>'
html=re.sub(r'(?=<script src="js/engine\.js(?:\?[^"]*)?"></script>)',lambda m:setup,html,count=1)
for name in ['engine','ui','renderer','app']:
 html=re.sub(r'<script src="js/'+name+r'\.js(?:\?[^"]*)?"></script>',lambda m:'<script>'+(d/f'js/{name}.js').read_text()+'</script>',html)
html=re.sub(r'<footer>.*?</footer>','',html,flags=re.S)
(d/'game-offline.html').write_text(html)
with zipfile.ZipFile(d/'game-source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in ['dist','tests','scripts','.github']:
  for p in (root/folder).rglob('*'):
   if p.is_file() and p.name not in ['game-source.zip','game-offline.html','milk-garden-source.zip','milk-garden-offline.html','art.js']:z.write(p,p.relative_to(root))
 z.write(root/'README.md','README.md')
 z.write(root/'.gitignore','.gitignore')
print('Offline HTML:',(d/'game-offline.html').stat().st_size,'bytes; source ZIP:',(d/'game-source.zip').stat().st_size,'bytes')
