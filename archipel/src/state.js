import {THEMES,MISSIONS,PARTS,SORT_ITEMS,LINKS,INSTRUMENTS} from './themes.js';
export const STORAGE_KEY='saint-jean-archipel-si-v1';
export function initialState(){return {version:1,started:false,theme:'analyse',mission:0,identified:[],sorted:[],linked:[],measurements:{},verdicts:{},repaired:false,limitChecked:false,avatar:'#2d75e8',quality:'normal',motion:false,reflection:'',diagnostic:null,finalBest:null,journal:[]};}
export function sanitize(raw){
 const s=initialState();if(!raw||raw.version!==1)return s;
 s.started=raw.started===true;
 if(THEMES.some(t=>t.id===raw.theme))s.theme=raw.theme;
 for(const [field,list] of [['identified',PARTS],['sorted',SORT_ITEMS],['linked',LINKS]])if(Array.isArray(raw[field]))s[field]=[...new Set(raw[field].filter(id=>list.some(x=>x.id===id)))];
 for(const spec of INSTRUMENTS){const v=raw.measurements?.[spec.id];if(Number.isFinite(v)&&v>=0&&v<=10000)s.measurements[spec.id]=v;const c=raw.verdicts?.[spec.id];if(c==='conforme'||c==='nonconforme')s.verdicts[spec.id]=c;}
 s.repaired=raw.repaired===true;s.limitChecked=raw.limitChecked===true;
 if(Number.isInteger(raw.mission))s.mission=Math.max(0,Math.min(MISSIONS.length,raw.mission));
 if(/^#[a-f0-9]{6}$/i.test(raw.avatar||''))s.avatar=raw.avatar;
 s.quality=raw.quality==='eco'?'eco':'normal';s.motion=raw.motion===true;
 if(typeof raw.reflection==='string')s.reflection=raw.reflection.slice(0,6000);
 for(const k of ['diagnostic','finalBest'])if(Number.isInteger(raw[k]))s[k]=Math.max(0,Math.min(k==='diagnostic'?6:10,raw[k]));
 if(Array.isArray(raw.journal))s.journal=raw.journal.filter(x=>typeof x==='string').slice(-60).map(x=>x.slice(0,1000));
 return s;
}
export function xp(s){return Math.max(0,Math.min(5,s.mission))*50;}
export function comparison(value,spec){if(!Number.isFinite(value))return null;return (spec.strict?value<spec.limit:value<=spec.limit)?'conforme':'nonconforme';}
export function phaseObjective(s){
 const m=MISSIONS[s.mission];if(!m)return 'Présentez vos preuves et réalisez le QCM de bilan.';
 if(s.mission===1)return `${s.identified.length} / 5 composants identifiés`;
 if(s.mission===2)return `${s.sorted.length} / 6 éléments placés`;
 if(s.mission===3)return `${s.linked.length} / 5 échanges reliés`;
 if(s.mission===4){if(!s.repaired)return `${Object.keys(s.measurements).length} / 3 mesures · prototype à améliorer`;return s.measurements.masse===190?'Nouvelle masse mesurée : interprétez et concluez.':'Retournez à la balance pour contrôler la nouvelle masse.';}
 return m.goal;
}
function advance(s,text){s.journal.push(text);s.mission++;return {ok:true,advanced:true,message:s.mission===5?'Mission accomplie : l’atelier peut être présenté avec ses preuves.':`Étape réussie · +50 XP. ${MISSIONS[s.mission].title}`};}
export function applyEvent(s,event){
 if(!event||typeof event.type!=='string')return {ok:false,message:'Action inconnue.'};
 if(event.type==='NEED'){
  if(s.mission!==0)return {ok:false,message:'Cette étape est déjà terminée.'};
  if(event.choice!==2)return {ok:false,message:'Le besoin concerne la lecture des plans au crépuscule. Le composant et la forme seront choisis ensuite.'};
  return advance(s,'Besoin : permettre à Camille de lire ses plans dans une zone mal éclairée. Fonction : éclairer la zone de lecture.');
 }
 if(event.type==='PART'){
  const p=PARTS.find(p=>p.id===event.id);if(s.mission!==1||!p)return {ok:false,message:'Inspectez les composants pendant leur mission.'};
  if(event.choice!==p.correct)return {ok:false,message:p.why};
  if(!s.identified.includes(p.id))s.identified.push(p.id);
  return s.identified.length===5?advance(s,'Structure identifiée : LED, portail, socle, commande et cordon. Chaque composant est relié à son rôle.'): {ok:true,message:p.why};
 }
 if(event.type==='SORT'){
  const p=SORT_ITEMS.find(x=>x.id===event.id);if(s.mission!==2||!p)return {ok:false,message:'Cette manipulation appartient à l’étape de la frontière.'};
  if(event.inside!==p.inside)return {ok:false,message:`${p.name} ${p.inside?'appartient à la lampe dans notre périmètre.':'appartient à l’environnement dans notre périmètre.'} Changez de zone avec ce jeton.`};
  if(!s.sorted.includes(p.id))s.sorted.push(p.id);
  return s.sorted.length===6?advance(s,'Frontière explicitée : lampe, cordon et commande à l’intérieur ; utilisateur, bureau et source USB à l’extérieur.'):{ok:true,message:`${p.name} est placé dans la bonne zone.`};
 }
 if(event.type==='LINK'){
  const link=LINKS.find(l=>l.id===event.id);if(s.mission!==3||!link||event.kind!==link.kind)return {ok:false,message:'Vérifiez la nature et la destination du lien.'};
  if(!s.linked.includes(link.id))s.linked.push(link.id);
  return s.linked.length===5?advance(s,'Échanges identifiés : énergie électrique, consigne de réglage, lumière, chaleur et lien matériel de maintien.'):{ok:true,message:link.why};
 }
 if(event.type==='MEASURE'){
  const spec=INSTRUMENTS.find(i=>i.id===event.id);if(s.mission!==4||!spec)return {ok:false,message:'Les instruments sont utilisés pendant le contrôle des exigences.'};
  s.measurements[spec.id]=s.repaired&&spec.id==='masse'?spec.repairedValue:spec.value;
  delete s.verdicts[spec.id];
  return {ok:true,message:`Mesure simulée : ${spec.criterion.toLowerCase()} = ${s.measurements[spec.id]} ${spec.unit}.`};
 }
 if(event.type==='VERDICT'){
  const spec=INSTRUMENTS.find(i=>i.id===event.id);if(s.mission!==4||!spec||!Number.isFinite(s.measurements[spec.id]))return {ok:false,message:'Réalisez d’abord la mesure avec l’instrument.'};
  const expected=comparison(s.measurements[spec.id],spec);
  if(event.choice!==expected)return {ok:false,message:`Comparez ${s.measurements[spec.id]} ${spec.unit} à ${spec.strict?'moins de':'au maximum'} ${spec.limit} ${spec.unit}.`};
  s.verdicts[spec.id]=expected;
  return {ok:true,message:expected==='conforme'?'Cette exigence est satisfaite par la valeur simulée.':'Cette exigence n’est pas satisfaite : une amélioration est nécessaire.'};
 }
 if(event.type==='REPAIR'){
  if(s.mission!==4||s.repaired)return {ok:false,message:'Le prototype a déjà été modifié.'};
  if(!INSTRUMENTS.every(i=>s.verdicts[i.id]===comparison(s.measurements[i.id],i)&&comparison(s.measurements[i.id],i)!==null))return {ok:false,message:'Mesurez et interprétez les trois grandeurs avant de modifier le prototype.'};
  if(event.choice!==1)return {ok:false,message:'Réduire la masse doit préserver les fonctions et être suivi de nouveaux essais. Changer uniquement la couleur ne corrige pas le dépassement.'};
  s.repaired=true;delete s.measurements.masse;delete s.verdicts.masse;
  s.journal.push('Données simulées initiales : hauteur 240 mm ≤ 250 mm ; masse 215 g > 200 g ; remplacement 48 s < 60 s. Choix : alléger le socle puis refaire la pesée.');
  return {ok:true,message:'Socle allégé. Retournez à la balance : l’ancien résultat de masse ne prouve plus la conformité du prototype modifié.'};
 }
 if(event.type==='LIMIT'){
  if(s.mission!==4||!s.repaired||!INSTRUMENTS.every(i=>s.verdicts[i.id]==='conforme'))return {ok:false,message:'Vérifiez les résultats du prototype modifié avant de conclure.'};
  if(event.choice!==3)return {ok:false,message:'La masse, la hauteur et la durée ne suffisent pas à conclure sur la stabilité ou toutes les performances du produit.'};
  s.limitChecked=true;
  return advance(s,'Nouvelle masse simulée : 190 g ≤ 200 g. Limite : refaire notamment un essai de stabilité ; les trois vérifications ne constituent pas une validation complète du produit.');
 }
 return {ok:false,message:'Cette action ne correspond pas à la mission en cours.'};
}
export function notebook(s){return ['L’ARCHIPEL DES INGÉNIEURS','Institution Saint Jean Douai - Monsieur Hage','Thème : analyse des systèmes',`Missions réalisées : ${s.mission} / 5 - ${xp(s)} XP`,'',...s.journal.map((v,i)=>`${i+1}. ${v}`),'','MA RÉFLEXION',s.reflection||'(à compléter)',`Diagnostic : ${s.diagnostic===null?'non réalisé':s.diagnostic+' / 6'}`,`Bilan : ${s.finalBest===null?'non réalisé':s.finalBest+' / 10'}`,'','Les mesures et améliorations du jeu sont simulées. Les XP ne constituent pas une note scolaire. Les réponses ouvertes sont à discuter avec l’enseignant.'].join('\n');}
