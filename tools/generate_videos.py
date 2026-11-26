from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess, math, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'apprendre/analyse-systeme/assets/videos'
OUT.mkdir(parents=True,exist_ok=True)
SIZE=(1280,720)
FONTROOT=Path('/usr/share/fonts/truetype/dejavu')
def font(size,bold=False):return ImageFont.truetype(str(FONTROOT/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
WHITE='#ffffff'; NAVY='#112b51'; INK='#183c69'; PALE='#edf3fc'; BLUE='#2458ae'; TEAL='#067d8c'; ORANGE='#dc6b2d'

CAPSULES=[
 {'id':'besoin-fonction','title':'Du besoin à la solution','scenes':[
  ('BESOIN','Pouvoir lire au bureau,\nle soir.','Le besoin part de l’utilisateur et de sa situation.'),
  ('FONCTION','Éclairer une zone\nde lecture.','Un verbe d’action décrit le service attendu.'),
  ('SOLUTION','Un module LED,\nun pied ou une pince.','Les composants sont des moyens, pas le besoin.'),
  ('EXIGENCE','Hauteur maximale : 250 mm.\nTest : une mesure à la règle.','Une condition vérifiable associe une valeur et un test.')],
  'captions':[
   'Situation : lire le soir à son bureau. Le besoin porte sur l’usage de la personne.',
   'Fonction : éclairer une zone de travail. Un verbe à l’infinitif décrit le service rendu.',
   'Solutions : pied, pince ou arche. Plusieurs moyens peuvent réaliser une même fonction.',
   'Exigence : une hauteur maximale, mesurée avec une règle. Le test rend la condition vérifiable.']},
 {'id':'frontiere-flux','title':'La frontière et les échanges','scenes':[
  ('LE PÉRIMÈTRE','Que comprend\nnotre lampe ?','La frontière sépare le système de son environnement.'),
  ('LES ÉLÉMENTS EXTÉRIEURS','L’utilisateur, le bureau\net la source USB.','Un élément extérieur peut échanger avec le système.'),
  ('LES ENTRÉES','Énergie électrique\net consigne de réglage.','Alimenter et transmettre une consigne sont deux actions distinctes.'),
  ('LES SORTIES','De la lumière\net de la chaleur.','Toute l’énergie électrique ne se transforme pas en lumière.')],
  'captions':[
   'La frontière contient le module LED, le portail, le socle, le cordon et la commande.',
   'L’utilisateur, la source USB et le bureau sont extérieurs dans cette étude.',
   'La source fournit de l’énergie électrique ; l’utilisateur transmet une consigne.',
   'Le module émet de la lumière et de la chaleur. Chaque échange possède un nom et un sens.']},
 {'id':'exigence-preuve','title':'D’une exigence à une preuve','scenes':[
  ('DÉFINIR','Masse maximale\nattendue : 200 g.','Choisir un critère et une valeur à respecter.'),
  ('MESURER','Utiliser une balance\net décrire la pesée.','Un résultat doit être associé à une méthode.'),
  ('COMPARER','215 g > 200 g :\nnon conforme.','Données simulées : la limite de masse est dépassée.'),
  ('AMÉLIORER','Réduire la masse,\npuis refaire le test.','Recontrôler aussi les autres exigences concernées.')],
  'captions':[
   'Définir le critère : par exemple la masse totale. Fixer la limite maximale à 200 g.',
   'Choisir une balance et décrire les conditions de pesée.',
   'Comparer : une masse simulée de 215 g dépasse 200 g. Cette exigence est non satisfaite.',
   'Proposer une amélioration puis refaire le test. Un essai ne valide pas toutes les performances.']}
]

def center(draw,text,y,f,color=INK):
 b=draw.textbbox((0,0),text,font=f);draw.text(((SIZE[0]-(b[2]-b[0]))/2,y),text,font=f,fill=color)
def roundbox(draw,box,color,outline=None,radius=20,width=2):draw.rounded_rectangle(box,radius,fill=color,outline=outline,width=width)
def arrow(draw,start,end,color,width=5):
 draw.line([start,end],fill=color,width=width)
 ang=math.atan2(end[1]-start[1],end[0]-start[0]);r=13
 pts=[end,(end[0]-r*math.cos(ang-.5),end[1]-r*math.sin(ang-.5)),(end[0]-r*math.cos(ang+.5),end[1]-r*math.sin(ang+.5))]
 draw.polygon(pts,fill=color)
def wrapped(draw,text,y,maxwidth,f,color=INK,leading=44):
 words=text.split();lines=[];line=''
 for w in words:
  test=(line+' '+w).strip()
  if draw.textlength(test,font=f)>maxwidth and line:lines.append(line);line=w
  else:line=test
 if line:lines.append(line)
 for line in lines:center(draw,line,y,f,color);y+=leading
 return y

def frame(cap,t):
 idx=min(3,int(t//9));stage=cap['scenes'][idx];fraction=(t%9)/9
 im=Image.new('RGB',SIZE,'#f5f8fd');d=ImageDraw.Draw(im)
 d.rectangle((0,0,1280,107),fill=NAVY)
 d.text((48,34),'L’ATELIER SI',font=font(29,True),fill=WHITE)
 right='Saint Jean Douai · Monsieur Hage';rw=d.textlength(right,font=font(23));d.text((1232-rw,39),right,font=font(23),fill='#d6e6ff')
 d.text((50,140),cap['title'],font=font(31,True),fill=INK)
 d.text((50,198),stage[0],font=font(19,True),fill=TEAL)
 y=239
 for line in stage[1].split('\n'):d.text((50,y),line,font=font(42,True),fill=INK);y+=54
 if cap['id']=='besoin-fonction':
  labels=['Besoin','Fonction','Solution','Exigence']
  for i,label in enumerate(labels):
   x=52+i*300;active=i==idx
   if i<3:arrow(d,(x+252,443),(x+286,443),'#99b0cf',3)
   roundbox(d,(x,390,x+250,495),BLUE if active else WHITE,BLUE if active else '#c9d7e8')
   fw=d.textlength(label,font=font(28,True));d.text((x+(250-fw)/2,424),label,font=font(28,True),fill=WHITE if active else INK)
   if active:d.rounded_rectangle((x,507,x+int(250*fraction),513),3,fill=ORANGE)
 elif cap['id']=='frontiere-flux':
  roundbox(d,(345,355,935,548),WHITE,BLUE,18,3)
  d.text((366,367),'LAMPE : frontière de l’étude',font=font(22,True),fill=BLUE)
  for x,label in [(370,'Module LED'),(665,'Commande')]:
   roundbox(d,(x,420,x+244,491),PALE,'#c8d8ee',12)
   tw=d.textlength(label,font=font(23,True));d.text((x+(244-tw)/2,442),label,font=font(23,True),fill=INK)
  for x,label in [(40,'Source USB'),(1035,'Utilisateur')]:
   roundbox(d,(x,420,x+204,491),'#e7f4f2' if idx==1 else WHITE,'#b5cfca',12)
   tw=d.textlength(label,font=font(23,True));d.text((x+(204-tw)/2,442),label,font=font(23,True),fill=INK)
  arrow(d,(247,456),(363,456),ORANGE if idx>=2 else '#b8c4d5',5)
  arrow(d,(1031,456),(916,456),TEAL if idx>=2 else '#b8c4d5',5)
  if idx>=2:
   d.text((258,395),'Énergie',font=font(17,True),fill=ORANGE)
   d.text((942,395),'Consigne',font=font(17,True),fill=TEAL)
  if idx==3:
   arrow(d,(493,497),(493,575),ORANGE,5)
   d.text((556,546),'Lumière + chaleur',font=font(23,True),fill=ORANGE)
  else:d.text((371,514),'Socle · portail · cordon inclus',font=font(19),fill='#657b96')
 else:
  labels=['Critère','Mesure','Conclusion','Nouvel essai']
  for i,label in enumerate(labels):
   x=52+i*300;active=i==idx
   if i<3:arrow(d,(x+250,443),(x+285,443),'#99b0cf',3)
   roundbox(d,(x,390,x+250,508),BLUE if active else WHITE,BLUE if active else '#c9d7e8')
   tw=d.textlength(label,font=font(24,True));d.text((x+(250-tw)/2,408),label,font=font(24,True),fill=WHITE if active else INK)
   sub=['≤ 200 g','Balance','215 g > 200 g','Vérifier'][i]
   tw=d.textlength(sub,font=font(23));d.text((x+(250-tw)/2,456),sub,font=font(23),fill='#d9e7ff' if active else '#657b96')
  d.text((53,535),'Exemple d’étude : données simulées',font=font(19),fill='#657b96')
 roundbox(d,(40,605,1240,678),'#e7eef9',radius=13)
 wrapped(d,stage[2],621,1160,font(25),INK,30)
 d.rectangle((0,708,1280,720),fill='#d9e4f3');d.rectangle((0,708,max(1,int(1280*t/36)),720),fill=BLUE)
 return im

def main():
 manifest=[]
 for cap in CAPSULES:
  target=OUT/(cap['id']+'.mp4')
  cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','8','-i','-','-an','-c:v','libx264','-preset','fast','-crf','28','-pix_fmt','yuv420p','-movflags','+faststart','-threads','2',str(target)]
  process=subprocess.Popen(cmd,stdin=subprocess.PIPE)
  for i in range(288):process.stdin.write(frame(cap,i/8).tobytes())
  process.stdin.close();code=process.wait()
  if code:raise RuntimeError(f'FFmpeg a échoué : {code}')
  frame(cap,2).save(OUT/(cap['id']+'.jpg'),quality=88)
  lines=['WEBVTT','']
  for i,text in enumerate(cap['captions']):
   start=i*9;end=(i+1)*9
   lines.extend([f'00:00:{start:02d}.000 --> 00:00:{end:02d}.000',text,''])
  (OUT/(cap['id']+'.vtt')).write_text('\n'.join(lines),encoding='utf-8')
  manifest.append({'id':cap['id'],'seconds':36,'bytes':target.stat().st_size})
  print(json.dumps(manifest[-1]),flush=True)
 return manifest
if __name__=='__main__':main()
