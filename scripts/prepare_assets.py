"""Convert downloaded GIF animation frames to deterministic PNG atlases."""
from pathlib import Path
from PIL import Image,ImageSequence
import json, math, shutil, argparse
parser=argparse.ArgumentParser(description='Convert downloaded original GIFs to game animation atlases')
parser.add_argument('--input',type=Path,required=True,help='Folder containing downloaded source images')
raw=parser.parse_args().input
if not raw.is_dir():parser.error('Input folder does not exist')
out=Path(__file__).resolve().parents[1]/'dist/assets'
out.mkdir(parents=True,exist_ok=True)
manifest={}
for p in raw.glob('*.gif'):
 im=Image.open(p); frames=[];dur=[]
 for f in ImageSequence.Iterator(im):
  frames.append(f.convert('RGBA').copy());dur.append(max(20,f.info.get('duration',100)))
 w,h=im.size;cols=min(10,len(frames));rows=math.ceil(len(frames)/cols)
 atlas=Image.new('RGBA',(w*cols,h*rows))
 for i,f in enumerate(frames):atlas.paste(f,((i%cols)*w,(i//cols)*h))
 name=p.stem;atlas.save(out/(name+'.png'),optimize=True)
 manifest[name]={'file':name+'.png','w':w,'h':h,'cols':cols,'frames':len(frames),'durations':dur,'period':sum(dur)/1000}
for name in ['Peashooter','SunFlower','CherryBomb','SnowPea','Repeater','Jalapeno','TallNut']:
 shutil.copy(raw/(name+'.png'),out/('card-'+name+'.png'))
for name in ['WallNut','PotatoMine']:shutil.copy(raw/(name+'.png'),out/('card-'+name+'.png'))
shutil.copy(raw/'Background.jpg',out/'lawn.jpg')
shutil.copy(raw/'WallNutSprite_65x73.png',out/'WallNut.png')
shutil.copy(raw/'PotatoMineSprite_132x93.png',out/'PotatoMine.png')
for name in ['shovelIcon','shovelButton','SeedChooser_Background']:shutil.copy(raw/(name+'.png'),out/(name+'.png'))
for name,w,h in [('WallNut',65,73),('PotatoMine',132,93)]:
 im=Image.open(out/(name+'.png'));manifest[name]={'file':name+'.png','w':w,'h':h,'cols':im.width//w,'frames':(im.width//w)*(im.height//h),'durations':[], 'period':1.2}
(out/'manifest.json').write_text(json.dumps(manifest))
print('Prepared',len(manifest),'animation atlases;',sum(p.stat().st_size for p in out.glob('*'))//1024,'KB')
