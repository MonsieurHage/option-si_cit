const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../apprendre/analyse-systeme/logic.js');
const D=require('../apprendre/analyse-systeme/content.js');

test('aucun acquis ni point ne sont accordés avant une activité',()=>{
  assert.equal(L.experience(L.initial()),0);
  assert.deepEqual(L.initial().completed,[]);
  assert.equal(L.initial().finalBest,null);
});
test('une reprise ne multiplie pas les XP et les six missions valent 250 points',()=>{
  assert.equal(L.experience({completed:['cours','cours','inconnu']}),50);
  assert.equal(L.experience({completed:Object.keys(L.XP)}),250);
});
test('une limite maximale autorise l’égalité mais un seuil strict la refuse',()=>{
  assert.equal(L.compliance(200,200),'conforme');
  assert.equal(L.compliance(215,200),'nonconforme');
  assert.equal(L.compliance(60,60,true),'nonconforme');
  assert.equal(L.compliance(48,60,true),'conforme');
});
test('une valeur absente, non numérique ou négative ne prouve pas une conformité',()=>{
  for(const v of [null,'','abc',-1,NaN,Infinity])assert.equal(L.compliance(v,200),'inconnu');
});
test('les trois conclusions simulées restent distinctes',()=>{
  assert.deepEqual([L.compliance(240,250),L.compliance(215,200),L.compliance(48,60,true)],['conforme','nonconforme','conforme']);
});
test('la vérification d’une exigence tient compte de l’instrument et de la grandeur',()=>{
  assert.equal(L.requirement('masse',200,'regle').valid,false);
  assert.equal(L.requirement('masse',200,'balance').valid,true);
  assert.equal(L.requirement('hauteur',250,'regle').valid,true);
  assert.equal(L.requirement('duree',60,'chrono').valid,true);
  for(const v of ['abc','',0,-1])assert.equal(L.requirement('masse',v,'balance').valid,false);
  assert.match(L.requirement('duree',60,'chrono').message,/inférieure à 60 s/);
});
test('une réponse vide ou erronée ne rapporte pas de point au QCM',()=>{
  assert.equal(L.score(D.diagnostic,[]),0);
  assert.equal(L.score(D.diagnostic,D.diagnostic.map(q=>q.correct)),6);
  assert.equal(L.score(D.finalQuiz,D.finalQuiz.map(q=>q.correct)),10);
  assert.equal(L.score(D.finalQuiz,D.finalQuiz.map(q=>(q.correct+1)%4)),0);
});
test('les 22 questions du diagnostic, du cours et du bilan ont quatre choix et une clé valide',()=>{
  const all=[...D.diagnostic,...D.lessons.map(l=>l.check),...D.finalQuiz];
  assert.equal(all.length,22);
  for(const q of all){
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
    assert.ok(q.why.length>30);
  }
});
test('les réponses correctes ne restent pas toujours à la même position',()=>{
  for(const quiz of [D.diagnostic,D.finalQuiz]){
    assert.equal(new Set(quiz.map(q=>q.correct)).size,4);
    assert.ok(quiz.every((q,i)=>i===0||quiz[i-1].correct!==q.correct));
  }
});
test('la frontière annoncée distingue bien l’utilisateur de la lampe',()=>{
  assert.equal(D.boundary.find(x=>x.name==='Utilisateur').inside,false);
  assert.equal(D.boundary.find(x=>x.name==='Source USB').inside,false);
  assert.equal(D.boundary.find(x=>x.name==='Commande et cordon').inside,true);
});
test('l’information, la lumière et une liaison physique ne sont pas confondues',()=>{
  assert.equal(D.flows.find(f=>f.from==='Utilisateur').type,'information');
  assert.equal(D.flows.find(f=>f.to==='Page du livre').type,'energie');
  assert.equal(D.flows.find(f=>f.from==='Portail').type,'materiel');
});
test('des données sauvegardées invalides ne cassent pas une reprise',()=>{
  assert.deepEqual(L.sanitize(null),L.initial());
  assert.deepEqual(L.sanitize({version:99}),L.initial());
  const s=L.sanitize({version:1,completed:['cours','cours','unknown'],finalBest:25,diagnostic:-3,journal:{besoin:'Lire',admin:'test'},finalAnswers:[9,1]});
  assert.deepEqual(s.completed,['cours']);
  assert.equal(s.finalBest,10);
  assert.equal(s.diagnostic,0);
  assert.deepEqual(s.journal,{besoin:'Lire'});
  assert.deepEqual(s.finalAnswers,[null,1]);
});
test('les six notions, dix cartes et cinq échanges sont présents et reliés aux catégories',()=>{
  assert.equal(D.lessons.length,6);assert.equal(D.sortCards.length,10);assert.equal(D.flows.length,5);
  for(const c of D.sortCards)assert.ok(Object.hasOwn(L.categories,c.type));
  assert.equal(new Set(D.parts.map(p=>p.id)).size,5);
});
