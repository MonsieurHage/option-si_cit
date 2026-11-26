"""Fabrique une copie de validation autonome, sans hébergement ni dépendance réseau."""
from pathlib import Path
import base64, mimetypes, json, re

ROOT=Path(__file__).resolve().parents[1]
APP=ROOT/'apprendre/analyse-systeme'
OUT=ROOT/'validation/SI_CIT_Analyse_Apercu.html'
OUT.parent.mkdir(exist_ok=True)
assets={}
for file in sorted((APP/'assets').rglob('*')):
    if file.is_file():
        mime=mimetypes.guess_type(file.name)[0] or 'application/octet-stream'
        assets[file.relative_to(APP).as_posix()]='data:'+mime+';base64,'+base64.b64encode(file.read_bytes()).decode('ascii')
text=(APP/'index.html').read_text()
text=text.replace('<title>', '<meta name="robots" content="noindex"><title>Version à valider - ',1)
text=text.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(APP/'styles.css').read_text()+'\n</style>')
text=re.sub(r'\s*<script src="(?:content|logic|app)\.js" defer></script>','',text)
for src,data in assets.items():
    text=text.replace('src="'+src+'"','src="'+data+'"').replace('href="'+src+'"','href="'+data+'"')
text=text.replace('href="../../index.html"','href="#accueil"')
scripts='globalThis.SIAssets='+json.dumps(assets,separators=(',',':'))+';\n'
scripts+='\n'.join((APP/file).read_text() for file in ['content.js','logic.js','app.js'])
text=text.replace('</body>','<script>\n'+scripts+'\n</script>\n</body>')
OUT.write_text(text)
print(str(OUT))
print('Taille :',OUT.stat().st_size,'octets')
