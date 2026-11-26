import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {ArchipelWorld} from '../src/world.js';
import {initialState} from '../src/state.js';
import {THEMES,PARTS,SORT_ITEMS,LINKS} from '../src/themes.js';
import {groundAt} from '../src/navigation.js';

function scene(){
 const dom=new JSDOM('<div id="world"></div>',{pretendToBeVisual:true});globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
 dom.window.HTMLCanvasElement.prototype.getContext=function(){return {clearRect(){},beginPath(){},roundRect(){},fill(){},stroke(){},fillText(){},measureText(s){return {width:s.length*27};}};};
 dom.window.HTMLElement.prototype.setPointerCapture=function(){};
 const renderer={domElement:document.createElement('canvas'),shadowMap:{},setPixelRatio(){},setSize(){},render(){},dispose(){}};
 const world=new ArchipelWorld(document.getElementById('world'),{}, {rendererFactory:()=>renderer});const state=initialState();world.setState(state);return {dom,world,state};
}
test('la scène 3D contient huit portails, des îles, un avatar et les objets de la mission',()=>{const {world,dom}=scene();assert.equal(world.targets.filter(t=>t.type==='portal').length,8);assert.equal(world.targets.filter(t=>t.type==='part').length,5);assert.equal(world.targets.filter(t=>t.type==='sort').length,6);assert.equal(world.targets.filter(t=>t.type==='instrument').length,3);let meshes=0;world.scene.traverse(o=>{if(o.isMesh)meshes++;});assert.ok(meshes>350);assert.ok(world.player.userData.leftLeg);for(const t of THEMES){world.teleportTheme(t.id);assert.equal(groundAt(world.player.position.x,world.player.position.z),0);}world.destroy();dom.window.close();});
test('les repères rendent les objets accessibles sans résoudre leur question',()=>{const {world,state,dom}=scene();for(const [mission,targets] of [[1,PARTS.map(p=>'part-'+p.id)],[2,SORT_ITEMS.map(p=>'sort-'+p.id)],[4,['instrument-hauteur','instrument-masse','instrument-duree','repair']]]){state.mission=mission;world.setState(state);for(const id of targets){world.gotoTarget(id);const target=world.nearest();assert.ok(target,id);assert.equal(target.id,id);}}assert.equal(state.identified.length,0);assert.equal(state.sorted.length,0);world.destroy();dom.window.close();});
test('porter un objet limite les interactions aux zones ou au destinataire',()=>{const {world,state,dom}=scene();state.mission=2;world.setState(state);world.setCarry({kind:'item',id:'led'});assert.deepEqual(world.activeTargets().map(t=>t.type),['drop','drop']);assert.equal(world.sortMeshes.led.visible,false);world.setCarry({kind:'link',link:LINKS[0]});assert.equal(world.activeTargets().length,1);assert.equal(world.activeTargets()[0].type,'destination');world.destroy();dom.window.close();});
test('une réinitialisation retire les échanges et restaure le socle initial',()=>{const {world,state,dom}=scene();state.mission=4;state.linked=LINKS.map(l=>l.id);state.repaired=true;world.setState(state);assert.equal(world.beams.length,5);assert.equal(world.mainLamp.userData.base.visible,false);const fresh=initialState();world.setState(fresh);assert.equal(world.beams.length,0);assert.equal(world.builtLinks.size,0);assert.equal(world.mainLamp.userData.base.visible,true);assert.equal(world.phaseLabels.filter(l=>l.obj.visible).length,0);world.destroy();dom.window.close();});
test('la chute retourne au repère et le sol ne traverse pas les plateformes',()=>{const {world,state,dom}=scene();world.started=true;world.paused=false;world.state=state;world.teleport(0,6);world.player.position.set(100,-13,100);world.frame(1000);assert.equal(world.player.position.x,0);assert.equal(world.player.position.z,6);world.teleport(4,-47);world.player.position.y=2;world.velocity=-3;world.last=1000;for(let i=1;i<30;i++)world.frame(1000+i*16);assert.ok(world.player.position.y>=1.29);world.destroy();dom.window.close();});
