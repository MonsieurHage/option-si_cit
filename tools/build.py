from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'dist'
if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir()
for item in ['index.html', 'assets', 'apprendre']:
    source = ROOT / item
    if source.is_dir():
        shutil.copytree(source, DEST / item)
    else:
        shutil.copy2(source, DEST / item)
print('Version de validation prête dans', DEST)
