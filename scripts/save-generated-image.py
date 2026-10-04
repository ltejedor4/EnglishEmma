import sys, json, re
from pathlib import Path
from PIL import Image
root = Path(r'D:\Proyectos\EmmaIngles')
name, source_text, prompt = sys.argv[1:4]
if not re.fullmatch(r'(word-[a-z-]+|balloon-[a-z]+|topic-[a-z]+|sticker-[a-z]+|card-back)', name):
    raise ValueError('Invalid asset name')
source = Path(source_text).resolve()
allowed = Path(r'C:\Users\Asus-PC\.codex\generated_images').resolve()
if not source.is_relative_to(allowed) or source.suffix.lower() != '.png':
    raise ValueError('Source must be an imagegen PNG')
out = root / 'assets' / 'images-src'
out.mkdir(exist_ok=True)
journal = out / 'IMAGENES-2-generadas.json'
data = json.loads(journal.read_text(encoding='utf-8')) if journal.exists() else {'generator':'built-in imagegen','images':[]}
file = name+'.png'
dst = out/file
existing = next((x for x in data['images'] if x['file']==file), None)
if dst.exists() and existing is None:
    raise FileExistsError(str(dst))
size = (1024,1536) if name.startswith('balloon-') else (512,512) if name.startswith('sticker-') else (1024,1024)
transparent = name != 'card-back'
with Image.open(source) as im:
    im.load()
    if transparent:
        assert 'A' in im.getbands() and im.getchannel('A').getextrema()[0]==0, 'Missing transparency'
    if im.size != size:
        im=im.resize(size,Image.Resampling.LANCZOS)
    im.save(dst,format='PNG')
entry = {'file':file,'source':str(source),'size':list(size),'transparent':transparent,'prompt':prompt}
data['images']=[x for x in data['images'] if x['file']!=file]+[entry]
journal.write_text(json.dumps(data,indent=2,ensure_ascii=False),encoding='utf-8')
with Image.open(dst) as check:
    check.load()
    assert check.size==size
    if transparent:
        assert check.getchannel('A').getextrema()[0]==0
print(file, size, 'verified', 'total',len(data['images']))

