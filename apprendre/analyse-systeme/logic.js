(function(root){
  'use strict';
  const KEY='saintjean-sicit-analyse-v1';
  const XP={diagnostic:20,cours:50,explorer:30,jeux:50,atelier:50,bilan:50};
  const categories={besoin:'Besoin',fonction:'Fonction',solution:'Solution',exigence:'Exigence'};
  function initial(){return {version:1,completed:[],lessonChecks:[],discovered:[],boundary:false,sortBest:null,sortDone:false,flows:[],labChecks:false,diagnostic:null,finalBest:null,finalAnswers:[],journal:{},motion:false,lastRoute:'accueil'};}
  function sanitize(value){
    const state=initial();
    if(!value||value.version!==1)return state;
    for(const key of ['completed','lessonChecks','discovered','flows'])if(Array.isArray(value[key]))state[key]=[...new Set(value[key].filter(v=>typeof v==='string'))];
    state.completed=state.completed.filter(k=>Object.hasOwn(XP,k));
    for(const key of ['boundary','sortDone','labChecks','motion'])state[key]=value[key]===true;
    for(const key of ['sortBest','diagnostic','finalBest'])if(Number.isInteger(value[key]))state[key]=Math.max(0,Math.min(key==='diagnostic'?6:10,value[key]));
    if(value.journal&&typeof value.journal==='object')for(const [key,text] of Object.entries(value.journal))if(typeof text==='string'&&['besoin','fonction','exigence','test','preuve','limite'].includes(key))state.journal[key]=text.slice(0,6000);
    if(Array.isArray(value.finalAnswers))state.finalAnswers=value.finalAnswers.slice(0,10).map(v=>Number.isInteger(v)&&v>=0&&v<4?v:null);
    if(typeof value.lastRoute==='string')state.lastRoute=value.lastRoute;
    return state;
  }
  function experience(state){return [...new Set(state.completed)].reduce((sum,key)=>sum+(XP[key]||0),0);}
  function score(questions,answers){return questions.reduce((sum,q,i)=>sum+(answers[i]===q.correct?1:0),0);}
  function compliance(value,limit,strict=false){if(value===null||value===''||!Number.isFinite(Number(value))||Number(value)<0)return 'inconnu';return (strict?Number(value)<limit:Number(value)<=limit)?'conforme':'nonconforme';}
  function requirement(criterion,limit,test){
    const specs={hauteur:{unit:'mm',test:'regle',label:'Hauteur totale'},masse:{unit:'g',test:'balance',label:'Masse totale'},duree:{unit:'s',test:'chrono',label:'Durée de remplacement'}};
    const spec=specs[criterion];
    if(!spec||!Number.isFinite(Number(limit))||Number(limit)<=0)return {valid:false,message:'Indiquez une valeur positive pour le critère choisi.'};
    if(test!==spec.test)return {valid:false,message:'Choisissez un instrument adapté à la grandeur : règle pour une longueur, balance pour une masse, chronomètre pour une durée.'};
    return {valid:true,message:`${spec.label} ${criterion==='duree'?'inférieure à':'inférieure ou égale à'} ${Number(limit)} ${spec.unit}. Test : ${test==='regle'?'mesure à la règle':test==='balance'?'pesée avec une balance':'mesure au chronomètre'}.`};
  }
  function mastery(state){return state.finalBest===null?'À découvrir':state.finalBest>=8?'Acquis à consolider par la pratique':state.finalBest>=5?'En cours d’acquisition':'Reprendre les notions et réessayer';}
  root.SILogic={KEY,XP,categories,initial,sanitize,experience,score,compliance,requirement,mastery};
  if(typeof module!=='undefined')module.exports=root.SILogic;
})(globalThis);
