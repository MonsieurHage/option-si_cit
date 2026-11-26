import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {JSDOM,VirtualConsole} from 'jsdom';

const html=readFileSync(new URL('../validation/Archipel_SI_Apercu.html',import.meta.url),'utf8');

test('le fichier livré contient le moteur intact et un programme exécutable',()=>{
 const dom=new JSDOM(html);
 const scripts=[...dom.window.document.scripts];
 assert.equal(scripts.length,1);
 assert.doesNotThrow(()=>new Script(scripts[0].textContent));
 const engine=readFileSync(new URL('../assets/game.js',import.meta.url),'utf8').replaceAll('</script','<\\/script');
 assert.ok(scripts[0].textContent.endsWith(engine+'\n'),'Le moteur compilé doit être conservé à l’identique dans le HTML.');
 dom.window.close();
});

test('le fichier autonome inclut ses médias sans dépendre du dossier du dépôt',()=>{
 const dom=new JSDOM(html);
 const d=dom.window.document;
 assert.equal(d.querySelectorAll('script[src],link[rel=stylesheet]').length,0);
 for(const el of d.querySelectorAll('img[src],link[rel=icon]'))assert.match(el.getAttribute('src')||el.getAttribute('href'),/^data:/);
 const script=d.scripts[0].textContent;
 const declaration=script.slice(0,script.indexOf(';\n'));
 const json=declaration.slice('globalThis.ARCHIPEL_ASSETS='.length);
 const assets=JSON.parse(json);
 assert.equal(Object.keys(assets).filter(k=>k.endsWith('.mp4')).length,3);
 for(const value of Object.values(assets))assert.match(value,/^data:/);
 dom.window.close();
});

test('le HTML livré démarre et ouvre les cours et les vidéos sans WebGL',async()=>{
 const errors=[];
 const console=new VirtualConsole();
 console.on('jsdomError',e=>{if(e.type!=='not-implemented')errors.push(e);});
 const dom=new JSDOM(html,{
  url:'file:///Archipel_SI_Apercu.html',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console,
  beforeParse(w){
   w.HTMLCanvasElement.prototype.getContext=()=>null;
   w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
   w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
   w.HTMLMediaElement.prototype.pause=function(){};
  }
 });
 try{
  await new Promise(resolve=>dom.window.document.readyState==='complete'?resolve():dom.window.addEventListener('load',resolve,{once:true}));
  const d=dom.window.document;
  assert.equal(errors.length,0,errors.map(e=>e.message).join('\n'));
  assert.equal(d.getElementById('boot-message').hidden,true);
  assert.equal(d.body.classList.contains('reading-mode'),true);
  assert.match(d.getElementById('graphics-message').textContent,/3D ne peut pas/);
  d.querySelector('[data-open=course]').click();
  assert.equal(d.getElementById('panel').open,true);
  assert.equal(d.querySelectorAll('[data-lesson]').length,6);
  d.getElementById('panel-close').click();
  d.querySelector('[data-open=videos]').click();
  assert.equal(d.querySelectorAll('video').length,3);
  for(const v of d.querySelectorAll('video'))assert.match(v.getAttribute('src')||v.querySelector('source')?.getAttribute('src'),/^data:video\/mp4;base64,/);
 }finally{dom.window.close();}
});
