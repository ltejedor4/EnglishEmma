import base64, struct, sys, json
from pathlib import Path
from PIL import Image
raw = base64.b64decode(sys.argv[1])
codes = struct.unpack('<'+'H'*(len(raw)//2),raw)
dictionary = {i:chr(i) for i in range(256)}
previous = dictionary[codes[0]]
parts = [previous]
next_code = 256
for code in codes[1:]:
    entry = dictionary[code] if code in dictionary else previous+previous[0]
    parts.append(entry)
    dictionary[next_code] = previous+entry[0]
    next_code += 1
    previous = entry
data = json.loads(''.join(parts))
root = Path(r'D:\Proyectos\EmmaIngles\assets\images-src')
root.mkdir(exist_ok=True)
for item in data['images']:
    dst = root / item['file']
    if dst.exists():
        raise FileExistsError(str(dst))
for item in data['images']:
    dst = root / item['file']
    with Image.open(item['source']) as im:
        im.load()
        size = tuple(item['targetSize'])
        if im.size != size:
            im = im.resize(size, Image.Resampling.LANCZOS)
        im.save(dst, format='PNG')
    with Image.open(dst) as check:
        check.load()
        assert check.size == size
        if item['transparent']:
            assert 'A' in check.getbands(), item['file']
            assert check.getchannel('A').getextrema()[0] == 0, item['file']
        print(item['file'], check.size, check.mode)
(root / 'generation-manifest.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
lines = ['# Imágenes de Emma English', '', '20 imágenes generadas con imagegen. La referencia existente de Buddy se conserva.', '']
for item in data['images']:
    lines += ['## '+item['file'], '', '!['+item['name']+']('+item['file']+')', '']
(root / 'GALERIA.md').write_text('\n'.join(lines), encoding='utf-8')
print('Exported and verified', len(data['images']), 'images.')

