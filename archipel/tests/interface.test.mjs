import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {ArchipelApp} from '../src/app.js';
import {THEMES,PARTS,SORT_ITEMS,SORT_ZONES,LINKS,NODES,INSTRUMENTS} from '../src/themes.js';
import {FINAL_QUIZ,DIAGNOSTIC} from '../src/content.js';
import {PROFILE_KEY} from '../src/profile.js';

function setup(saved){
 const dom=new JSDOM(readFileSync(new URL('../index.html',import.meta.url),'utf8'),{url:'https://validation.example/archipel/',pretendToBeVisual:true});
 const w=dom.window;globalThis.window=w;globalThis.document=w.document;globalThis.localStorage=w.localStorage;globalThis.Blob=w.Blob;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};w.HTMLMediaElement.prototype.pause=function(){};w.print=()=>w.printCount=(w.printCount||0)+1;
 if(saved)w.localStorage.setItem(PROFILE_KEY,saved);
 const memory={};const world={paused:true,keys:{},renderer:{domElement:w.document.createElement('canvas')},setState:s=>memory.state=s,setPaused(v){this.paused=v;this.keys={};},play(){this.paused=false;},teleportTheme:id=>memory.theme=id,goHub:()=>memory.hub=true,teleport:(x,z)=>memory.position={x,z},gotoTarget:id=>memory.target=id,setCarry:v=>memory.carry=v,respawn(){},jump(){},interact(){}};
 const app=new ArchipelApp({worldFactory:()=>world});return {w,dom,app,memory,$:s=>w.document.querySelector(s),$$:s=>[...w.document.querySelectorAll(s)]};
}
test('l’interface affiche les huit zones, les deux logos et la signature',()=>{
 const a=setup();assert.equal(a.$$('.identity img').length,1);assert.match(a.$('.signature').textContent,/Monsieur Hage/);a.app.renderMap();assert.equal(a.$$('[data-theme]').length,8);assert.equal(a.$$('.tag.available').length,1);assert.equal(a.$('#panel').open,true);a.app.close();a.app.start();assert.equal(a.$('#welcome').hidden,true);assert.equal(a.memory.theme,'analyse');a.w.close();
});
test('le parcours complet manipule, vérifie, corrige et garde ses limites',()=>{
 const a=setup();const app=a.app;app.start();
 app.interact({type:'camille'});a.$('[data-choice="0"]').click();assert.equal(app.state.mission,0);assert.ok(a.$('.feedback.error'));a.$('#choice-next').click();a.$('[data-choice="2"]').click();assert.equal(app.state.mission,1);a.$('#choice-next').click();
 for(const p of PARTS){app.interact({type:'part',part:p.id});a.$(`[data-choice="${p.correct}"]`).click();a.$('#choice-next').click();}assert.equal(app.state.mission,2);
 for(const p of SORT_ITEMS){app.interact({type:'sort',item:p.id});assert.equal(a.memory.carry.id,p.id);if(p.id==='led'){app.waypoint();assert.equal(a.$('[data-sort-waypoint="inside"]').textContent,'Dans la lampe');assert.equal(app.state.sorted.length,0);a.$('[data-sort-waypoint="outside"]').click();app.interact({...SORT_ZONES[1],type:'drop'});assert.equal(app.state.sorted.length,0);assert.ok(app.carry);}app.interact({...SORT_ZONES.find(z=>z.inside===p.inside),type:'drop'});}assert.equal(app.state.mission,3);
 for(const l of LINKS){app.interact({type:'flow',link:l.id});a.$(`[data-choice="${['energie','information','materiel'].indexOf(l.kind)}"]`).click();assert.ok(app.carry);assert.equal(app.state.linked.includes(l.id),false);a.$('#choice-next').click();app.interact({type:'destination'});assert.equal(app.state.linked.includes(l.id),true);}assert.equal(app.state.mission,4);
 app.interact({type:'repair'});a.$('[data-choice="1"]').click();assert.ok(a.$('.feedback.error'));assert.equal(app.state.repaired,false);app.close();
 for(const i of INSTRUMENTS){app.interact({type:'instrument',instrument:i.id});a.$(`[data-verdict="${i.id}:${i.id==='masse'?'nonconforme':'conforme'}"]`).click();app.close();}
 app.interact({type:'repair'});a.$('[data-choice="1"]').click();assert.equal(app.state.repaired,true);assert.equal(app.state.measurements.masse,undefined);a.$('#choice-next').click();
 app.interact({type:'instrument',instrument:'masse'});assert.equal(app.state.measurements.masse,190);a.$('[data-verdict="masse:conforme"]').click();app.close();app.interact({type:'repair'});a.$('[data-choice="3"]').click();assert.equal(app.state.mission,5);assert.equal(a.$('#xp-count').textContent,'250 XP');a.$('#choice-next').click();assert.equal(a.$('#panel').dataset.kind,'victory');a.$('#victory-journal').click();assert.match(a.$('#panel-content').textContent,/stabilité/);a.$('#reflection').value='Les trois résultats ne valident pas toutes les performances.';a.$('#reflection').dispatchEvent(new a.w.Event('input'));const saved=a.w.localStorage.getItem(PROFILE_KEY);app.close();
 const b=setup(saved);assert.equal(b.app.state.mission,5);assert.match(b.app.state.reflection,/trois résultats/);assert.equal(b.$('#xp-count').textContent,'250 XP');b.w.close();a.w.close();
});
test('les QCM donnent un retour expliqué, conservent un diagnostic initial et le meilleur bilan',()=>{
 const a=setup();for(const [kind,data] of [['diagnostic',DIAGNOSTIC],['final',FINAL_QUIZ]]){a.app.startQuiz(kind);for(const q of data){a.$(`[data-quiz-answer="${q.correct}"]`).click();assert.ok(a.$('.feedback.success'));assert.ok(a.$$('[data-quiz-answer]').every(b=>b.disabled));a.$('#quiz-next').click();}assert.equal(a.$('#panel').dataset.kind,'quiz-result');}assert.equal(a.app.state.diagnostic,6);assert.equal(a.app.state.finalBest,10);assert.equal(a.$('#xp-count').textContent,'0 XP');a.w.close();
});
test('les ressources restent disponibles, le texte saisi est échappé et le redémarrage est explicite',()=>{
 const a=setup();a.app.renderCourse();assert.equal(a.$$('[data-lesson]').length,6);a.$('[data-lesson-answer="1"]').click();assert.ok(a.$('.feedback'));a.app.renderVideos();assert.equal(a.$$('video').length,3);assert.equal(a.$$('video track').length,3);a.app.state.reflection='<img src=x onerror="window.attack=true">';a.app.renderJournal();assert.equal(a.$$('#panel-content img[src=x]').length,0);a.app.renderSettings();a.$('#reset-open').click();assert.equal(a.$('#panel').dataset.kind,'reset');a.$('#reset-cancel').click();assert.equal(a.$('#panel').dataset.kind,'settings');a.w.close();
});
