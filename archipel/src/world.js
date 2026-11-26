import * as THREE from 'three';
import {THEMES,ANALYSIS,PARTS,SORT_ITEMS,SORT_ZONES,NODES,LINKS,INSTRUMENTS} from './themes.js';
import {groundAt,moveWithCollisions,movement,distance} from './navigation.js';

const C={grass:'#6dd6a2',rock:'#738fb1',wood:'#dcb58a',ink:'#183759',white:'#fffdf6',sea:'#70b9de'};
const UP=new THREE.Vector3(0,1,0);
export class ArchipelWorld{
 constructor(container,callbacks,{rendererFactory=options=>new THREE.WebGLRenderer(options)}={}){
  this.container=container;this.callbacks=callbacks;this.state=null;this.started=false;this.paused=true;this.keys={};this.velocity=0;this.onGround=true;this.yaw=-.48;this.zoom=15;this.time=0;this.last=0;this.carry=null;this.targets=[];this.colliders=[];this.rotators=[];this.bobs=[];this.beams=[];this.builtLinks=new Set();this.sortMeshes={};this.instrumentLabels={};this.phaseLabels=[];this._destroyed=false;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#c9e8fc');this.scene.fog=new THREE.Fog('#c9e8fc',105,210);
  this.camera=new THREE.PerspectiveCamera(46,window.innerWidth/window.innerHeight,.1,280);
  this.renderer=rendererFactory({antialias:true,alpha:false,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));this.renderer.setSize(window.innerWidth,window.innerHeight);
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
  this.renderer.domElement.setAttribute('aria-label','Univers 3D de l’Archipel des ingénieurs');this.renderer.domElement.tabIndex=0;
  container.append(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight('#e3f6ff','#88b2a1',2.4));
  const sun=new THREE.DirectionalLight('#fff4db',3.2);sun.position.set(-35,60,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:150});sun.shadow.normalBias=.04;this.scene.add(sun);
  this.sun=sun;
  this.makeLandscape();this.makeHub();this.makeAnalysis();this.makeOtherIslands();
  this.player=this.avatar('#2d75e8');this.player.position.set(0,0,6);this.scene.add(this.player);this.checkpoint={x:0,z:6};
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,20),new THREE.MeshBasicMaterial({color:'#193b65',transparent:true,opacity:.14,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;this.scene.add(shadow);this.playerShadow=shadow;
  this.camera.position.set(52,63,78);this.camera.lookAt(0,0,-10);
  this.bindInputs();this.resize=()=>{this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(window.innerWidth,window.innerHeight);};window.addEventListener('resize',this.resize);
  this.frame=this.frame.bind(this);this.frameId=requestAnimationFrame(this.frame);
 }
 mat(color,opts={}){return new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:true,...opts});}
 box(w,h,d,color,x=0,y=0,z=0,parent=this.scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?this.mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 cyl(r,h,color,x=0,y=0,z=0,parent=this.scene,sides=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,sides),typeof color==='string'?this.mat(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 sphere(r,color,x,y,z,parent=this.scene){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),this.mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
 label(text,color='#21456b',width=5.3){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=144;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,768,144);ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.roundRect(8,8,752,120,27);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=5;ctx.stroke();let size=50;ctx.font=`700 ${size}px Arial`;while(ctx.measureText(text).width>690&&size>22){size-=2;ctx.font=`700 ${size}px Arial`;}ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,69);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));sprite.scale.set(width,width*144/768,1);sprite.userData.canvas=canvas;return sprite;
 }
 island(x,z,r,color){
  const g=new THREE.Group();g.position.set(x,0,z);this.scene.add(g);
  const rock=new THREE.Mesh(new THREE.CylinderGeometry(r*.98,r*.58,6.8,12),this.mat(C.rock));rock.position.y=-3.6;rock.castShadow=true;g.add(rock);
  this.cyl(r,.55,color,0,-.27,0,g,24);this.cyl(r*.97,.12,C.grass,0,.02,0,g,24);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r-.2,.14,4,36),this.mat('#b5edd1'));ring.rotation.x=Math.PI/2;ring.position.y=.03;g.add(ring);return g;
 }
 tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);this.scene.add(g);this.colliders.push({x,z,w:.45*scale,d:.45*scale,height:1.2*scale});this.cyl(.18,1.2,'#ae7d5f',0,.6,0,g,5);for(let i=0;i<2;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(1.15-i*.2,1.8,6),this.mat(i?'#40ad8e':'#3c967d'));m.position.y=1.9+i*.7;m.castShadow=true;g.add(m);}return g;}
 makeLandscape(){
  const sea=new THREE.Mesh(new THREE.CircleGeometry(230,80),this.mat(C.sea,{roughness:.55}));sea.rotation.x=-Math.PI/2;sea.position.y=-8;this.scene.add(sea);
  this.island(0,0,15,'#c1e6c8');
  for(const t of THEMES){this.island(t.x,t.z,t.radius,'#c1e9d5');const a=new THREE.Vector3(Math.cos(t.angle)*13.7,-.08,Math.sin(t.angle)*13.7),b=new THREE.Vector3(t.x-Math.cos(t.angle)*(t.radius-1),-.08,t.z-Math.sin(t.angle)*(t.radius-1));const middle=a.clone().add(b).multiplyScalar(.5),length=a.distanceTo(b),bridge=this.box(4.6,.35,length,C.wood,middle.x,-.12,middle.z);bridge.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);for(let i=0;i<Math.ceil(length/2);i++){const f=(i+.5)/Math.ceil(length/2),p=a.clone().lerp(b,f);const plank=this.box(4.5,.08,.13,'#ba9574',p.x,.1,p.z);plank.rotation.y=bridge.rotation.y;}
   for(const sign of [-1,1]){const rail=this.box(.11,.11,length,'#eae5d0',middle.x+Math.cos(bridge.rotation.y)*2.15*sign,1.05,middle.z-Math.sin(bridge.rotation.y)*2.15*sign);rail.rotation.y=bridge.rotation.y;}
   for(let i=0;i<5;i++){const angle=t.angle+.6+i*1.1,rr=t.radius-3;const x=t.x+Math.cos(angle)*rr,z=t.z+Math.sin(angle)*rr;if(t.id==='analyse'&&z<-42&&x>-16&&x<16)continue;this.tree(x,z,.65+(i%3)*.15);}
  }
  for(let i=0;i<7;i++){const a=i*.87;this.tree(Math.cos(a)*11,Math.sin(a)*11,.6);}
  const clouds=new THREE.Group();this.scene.add(clouds);for(let i=0;i<12;i++){const g=new THREE.Group();g.position.set(Math.cos(i*.7)*95,27+(i%3)*5,Math.sin(i*.7)*95);for(let k=0;k<3;k++){const m=this.sphere(3+k%2,'#f8fdff',k*3,0,0,g);m.scale.set(1.5,.7,1);}clouds.add(g);}this.clouds=clouds;
  for(let i=0;i<22;i++){const a=i*2.4,r=85+i%4*9;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(2+(i%3)),this.mat('#90abc3'));rock.position.set(Math.cos(a)*r,-6,Math.sin(a)*r);this.scene.add(rock);}
 }
 makeHub(){
  this.cyl(5.8,.2,'#f6f0d8',0,.13,0,this.scene,24);this.cyl(2.5,.4,'#456a9a',0,.4,0);const monument=this.box(1.3,2.2,1.3,'#54cbd2',0,1.7,0);monument.rotation.y=Math.PI/4;
  const title=this.label('L’ARCHIPEL DES INGÉNIEURS','#174785',11);title.position.set(0,5,0);this.scene.add(title);
  for(const t of THEMES){const x=Math.cos(t.angle)*11.5,z=Math.sin(t.angle)*11.5;const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-t.angle+Math.PI/2;this.scene.add(g);this.box(3.5,.2,1.7,'#dbe5e8',0,.1,0,g);this.box(.38,3.8,.42,t.color,-1.35,2,0,g);this.box(.38,3.8,.42,t.color,1.35,2,0,g);this.box(3.05,.38,.42,t.color,0,3.8,0,g);const pane=this.box(2.3,3.1,.08,this.mat(t.color,{transparent:true,opacity:.22,emissive:t.color,emissiveIntensity:.3}),0,1.9,0,g);const l=this.label(t.short,t.color,5);l.position.set(0,4.6,0);g.add(l);this.bobs.push({obj:pane,base:1.9,amount:.08});this.targets.push({id:'portal-'+t.id,type:'portal',theme:t.id,name:t.title,x,z,reach:3.2});}
  const guide=this.avatar('#344e8a',true);guide.position.set(4,0,3);guide.rotation.y=-1;this.scene.add(guide);const guideLabel=this.label('Monsieur Hage','#244b85',5.7);guideLabel.position.set(4,3,3);this.scene.add(guideLabel);this.targets.push({id:'guide',type:'guide',name:'Monsieur Hage',x:4,z:3,reach:3.3});
 }
 avatar(color,npc=false){
  const g=new THREE.Group();const body=this.box(.83,.95,.43,color,0,1.2,0,g);this.box(.58,.12,.05,'#d9fbfb',0,1.4,.24,g);const head=this.box(.64,.64,.6,'#f4c99e',0,2,0,g);this.box(.69,.18,.64,npc?'#745346':'#253c5e',0,2.34,0,g);
  for(const x of [-.14,.14])this.box(.075,.09,.035,'#17304a',x,2.06,.315,g);this.box(.17,.035,.035,'#b07463',0,1.88,.315,g);
  const limbs={};for(const sign of [-1,1]){const arm=new THREE.Group();arm.position.set(sign*.59,1.54,0);g.add(arm);this.box(.28,.72,.32,color,0,-.28,0,arm);this.box(.26,.2,.29,'#f4c99e',0,-.72,0,arm);const leg=new THREE.Group();leg.position.set(sign*.23,.76,0);g.add(leg);this.box(.32,.64,.37,'#334b69',0,-.28,0,leg);this.box(.36,.18,.53,'#f3f8fc',0,-.62,.06,leg);limbs[sign<0?'leftArm':'rightArm']=arm;limbs[sign<0?'leftLeg':'rightLeg']=leg;}
  this.box(.58,.65,.25,npc?'#d8e3ee':'#31bbc4',0,1.25,-.31,g);g.userData={body,head,...limbs};return g;
 }
 pedestal(x,z,color='#d6e4f0',w=2){const g=new THREE.Group();g.position.set(x,0,z);this.scene.add(g);this.box(w,1.1,1.35,color,0,.55,0,g);this.box(w+.12,.13,1.5,C.white,0,1.17,0,g);this.colliders.push({x,z,w:w+.08,d:1.4,height:1.3});return g;}
 lamp(parent,scale=1){
  const g=new THREE.Group();g.scale.setScalar(scale);parent.add(g);const base=this.box(2.8,.22,1.35,'#405a76',0,.12,0,g);const arch=new THREE.Mesh(new THREE.TorusGeometry(1.45,.15,6,24),this.mat('#49c4cd'));arch.scale.y=1.2;arch.position.y=1.9;arch.castShadow=true;g.add(arch);this.cyl(.68,.25,'#4d667e',0,3.35,0,g);const light=this.cyl(.6,.04,this.mat('#fff5bd',{emissive:'#ffd778',emissiveIntensity:.2}),0,3.2,0,g);g.userData={base,light};return g;
 }
 component(id,parent){
  const g=new THREE.Group();g.position.y=1.45;parent.add(g);
  if(id==='led'){this.cyl(.53,.2,'#6e8296',0,.1,0,g);this.cyl(.48,.04,this.mat('#fff2ae',{emissive:'#ffe79b',emissiveIntensity:.45}),0,.22,0,g);}
  if(id==='portail'){const a=new THREE.Mesh(new THREE.TorusGeometry(.6,.1,5,16),this.mat('#47bcc7'));a.scale.y=1.25;a.position.y=.75;g.add(a);}
  if(id==='socle'){this.box(1.1,.2,.7,'#415b76',0,.1,0,g);}
  if(id==='commande'){this.box(.4,.85,.22,'#f5f6fa',0,.42,0,g);for(let k=0;k<3;k++)this.box(.19,.1,.03,'#6cb3d0',0,.2+k*.22,.13,g);}
  if(id==='cordon'){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.5,.1,0),new THREE.Vector3(-.5,.3,.4),new THREE.Vector3(.4,.3,.5),new THREE.Vector3(.45,.1,0)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,16,.055,5,false),this.mat('#6e8ab2')));this.box(.3,.15,.2,'#b9cde0',-.5,.1,-.1,g);}
  this.rotators.push(g);return g;
 }
 makeAnalysis(){
  const t=ANALYSIS;this.cyl(13,.08,'#b0dacb',0,.12,-55,this.scene,24);
  for(const x of [-13,13]){this.box(.55,4.5,.55,'#6c96ac',x,2.25,-64);this.colliders.push({x,z:-64,w:.7,d:.7,height:5});}
  this.box(27,.6,.65,'#427ca6',0,4.65,-64);const sign=this.label('ATELIER D’ANALYSE','#245eae',13);sign.position.set(0,5.65,-65);this.scene.add(sign);
  const camille=this.avatar('#ee9c63',true);camille.position.set(-5,0,-44);camille.rotation.y=.8;this.scene.add(camille);const name=this.label('Camille','#a06435',4.6);name.position.set(-5,3.2,-44);this.scene.add(name);this.targets.push({id:'camille',type:'camille',name:'Parler à Camille',x:-5,z:-44,reach:3.4});
  const display=this.pedestal(0,-55,'#ccddd9',3.5);this.mainLamp=this.lamp(display,.74);this.mainLamp.position.y=1.25;
  for(const p of PARTS){const stand=this.pedestal(p.x,p.z,'#dce8ee',1.65);this.component(p.id,stand);const l=this.label(p.name,'#294c78',4);l.position.set(p.x,3.2,p.z);this.scene.add(l);this.phaseLabels.push({obj:l,phase:1});this.targets.push({id:'part-'+p.id,type:'part',part:p.id,name:p.name,x:p.x,z:p.z,reach:3.4});}
  for(const zone of SORT_ZONES){const ring=new THREE.Mesh(new THREE.RingGeometry(zone.radius-.25,zone.radius,32),new THREE.MeshBasicMaterial({color:zone.inside?'#2a9fda':'#e8a547',side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(zone.x,.22,zone.z);this.scene.add(ring);const fill=this.cyl(zone.radius,.08,zone.inside?'#a4cfe6':'#e7d6ad',zone.x,.17,zone.z);const l=this.label(zone.name,zone.inside?'#2879a8':'#a46a28',5);l.position.set(zone.x,2.2,zone.z);this.scene.add(l);this.phaseLabels.push({obj:l,phase:2});}
  for(const item of SORT_ITEMS){const g=new THREE.Group();g.position.set(item.x,.8,item.z);this.scene.add(g);this.box(.8,.8,.8,item.color,0,0,0,g);const l=this.label(item.name,'#345477',3.7);l.position.y=1.15;g.add(l);this.phaseLabels.push({obj:l,phase:2});this.sortMeshes[item.id]=g;this.bobs.push({obj:g,base:.8,amount:.09,sortId:item.id});this.targets.push({id:'sort-'+item.id,type:'sort',item:item.id,name:'Transporter : '+item.name,x:item.x,z:item.z,reach:2.3});}
  for(const [id,n] of Object.entries(NODES)){if(['arch','head'].includes(id))continue;const g=new THREE.Group();g.position.set(n.x,0,n.z);this.scene.add(g);this.cyl(.52,.6,'#7395b0',0,.3,0,g);this.cyl(.4,.1,'#f7dfa1',0,.68,0,g);const l=this.label(n.name,'#526aa1',3.7);l.position.set(n.x,1.7,n.z);this.scene.add(l);this.phaseLabels.push({obj:l,phase:3});}
  for(const link of LINKS){const n=NODES[link.from];this.targets.push({id:'flow-'+link.id,type:'flow',link:link.id,name:link.label,x:n.x,z:n.z,reach:3});}
  for(const i of INSTRUMENTS){const g=this.pedestal(i.x,i.z,'#d7e7e9',1.9);
   if(i.id==='hauteur'){this.box(.25,2.1,.2,'#f0c254',0,2.2,0,g);for(let n=0;n<8;n++)this.box(.2,.04,.03,'#745a2e',.05,1.3+n*.25,.13,g);}
   if(i.id==='masse'){this.box(1.3,.19,.9,'#437b9a',0,1.4,0,g);this.cyl(.45,.12,'#c5d4db',0,1.58,0,g);}
   if(i.id==='duree'){const clock=this.cyl(.5,.14,'#ecf2fa',0,1.8,0,g);clock.rotation.x=Math.PI/2;this.box(.04,.36,.06,'#3b6c99',0,1.93,.12,g);this.box(.3,.04,.06,'#3b6c99',.13,1.78,.12,g);}
   const label=this.label(i.name,'#216c7f',3.8);label.position.set(i.x,3.2,i.z);this.scene.add(label);this.phaseLabels.push({obj:label,phase:4});this.targets.push({id:'instrument-'+i.id,type:'instrument',instrument:i.id,name:'Mesurer : '+i.criterion,x:i.x,z:i.z,reach:3.1});
  }
  const work=this.pedestal(0,-60,'#b0cee1',2.8);this.box(1.4,.16,.9,'#4d6f8a',0,1.4,0,work);const wl=this.label('Établi des améliorations','#3c6c9c',5.5);wl.position.set(0,2.8,-60);this.scene.add(wl);this.phaseLabels.push({obj:wl,phase:4});this.targets.push({id:'repair',type:'repair',name:'Améliorer le prototype',x:0,z:-60,reach:3.3});
 }
 makeOtherIslands(){
  for(const t of THEMES.slice(1)){const g=new THREE.Group();g.position.set(t.x,0,t.z);this.scene.add(g);this.cyl(5,.15,'#deeadf',0,.18,0,g,16);let rotating;
   if(t.prop==='turbine'){this.cyl(.3,6,'#e6f4f8',0,3,0,g);rotating=new THREE.Group();rotating.position.set(0,6,0);g.add(rotating);this.sphere(.45,'#538fb2',0,0,0,rotating);for(let i=0;i<3;i++){const blade=this.box(.3,2.5,.18,'#f5fcff',0,1.4,0,rotating);const pivot=new THREE.Group();pivot.rotation.z=i*Math.PI*2/3;rotating.remove(blade);pivot.add(blade);rotating.add(pivot);}rotating.userData.spinAxis='z';this.rotators.push(rotating);}
   if(t.prop==='circuit'){for(const x of [-2,2])this.cyl(.6,2,t.color,x,1,0,g);this.box(5,.15,.3,'#f5d25d',0,2,0,g);this.box(1,1,1,'#e9f4f7',0,2.6,0,g);}
   if(t.prop==='radar'){this.cyl(.4,3,'#548898',0,1.5,0,g);const dish=this.cyl(1.8,.3,t.color,0,3.2,0,g);dish.rotation.z=.7;const hoop=new THREE.Mesh(new THREE.TorusGeometry(2.3,.1,5,24),this.mat('#a7e9e5'));hoop.position.y=3;g.add(hoop);}
   if(t.prop==='model'){this.box(3,.3,3,'#6d629d',0,.5,0,g);for(let i=0;i<3;i++){const b=this.box(1.2,1.2,1.2,['#af9ee9','#d2c5fc','#9375da'][i],(i-1)*1.15,1.4+i*.6,0,g);b.rotation.y=.3;}}
   if(t.prop==='robot'){const robot=this.avatar('#65b684',true);robot.scale.setScalar(1.35);g.add(robot);for(const x of [-2,2])this.cyl(.8,.15,'#aad9c0',x,.3,2,g);}
   if(t.prop==='design'){this.box(4,.5,2.5,'#dbb2cf',0,1.2,0,g);this.sphere(.9,'#f7a6ca',-1,2.2,0,g);this.box(1,1.5,1,t.color,1,2.2,0,g);}
   if(t.prop==='exhibition'){this.box(5,2,.3,'#f5e7d0',0,2,0,g);this.box(2,.2,1.2,'#bb9473',0,1.1,1,g);for(const x of [-1.4,1.4])this.box(.9,.9,.08,t.color,x,2.3,.2,g);}
   const l=this.label(t.short,t.color,7);l.position.set(t.x,6.3,t.z);this.scene.add(l);this.targets.push({id:'theme-'+t.id,type:'theme',theme:t.id,name:'Découvrir : '+t.title,x:t.x,z:t.z+3.7,reach:4});
   this.colliders.push({x:t.x,z:t.z,w:4,d:2.5,height:3});
  }
 }
 setState(state){
  this.state=state;for(const l of this.phaseLabels)l.obj.visible=state.mission===l.phase;for(const beam of [...this.beams])if(!state.linked.includes(beam.id)){this.scene.remove(beam.mesh,beam.pulse);beam.mesh.geometry.dispose();this.beams.splice(this.beams.indexOf(beam),1);this.builtLinks.delete(beam.id);}this.player.userData.body.material.color.set(state.avatar);this.player.userData.leftArm.children[0].material.color.set(state.avatar);this.player.userData.rightArm.children[0].material.color.set(state.avatar);
  this.renderer.setPixelRatio(state.quality==='eco'?1:Math.min(window.devicePixelRatio||1,1.5));this.renderer.shadowMap.enabled=state.quality!=='eco';
  for(const item of SORT_ITEMS){const mesh=this.sortMeshes[item.id];if(state.sorted.includes(item.id)){const zone=SORT_ZONES.find(z=>z.inside===item.inside),idx=SORT_ITEMS.filter(p=>p.inside===item.inside).findIndex(p=>p.id===item.id),a=idx*Math.PI*2/3;mesh.position.set(zone.x+Math.cos(a)*1.25,.65,zone.z+Math.sin(a)*1.25);mesh.rotation.y=0;}else if(this.carry?.kind!=='item'||this.carry.id!==item.id){mesh.position.set(item.x,.8,item.z);}mesh.visible=state.mission===2&&(this.carry?.kind!=='item'||this.carry.id!==item.id);}
  for(const link of LINKS)if(state.linked.includes(link.id)&&!this.builtLinks.has(link.id)){this.addBeam(link);this.builtLinks.add(link.id);}
  this.mainLamp.userData.light.material.emissiveIntensity=state.linked.includes('usb')?1.1:.2;
  if(state.repaired&&!this.mainLamp.userData.repaired){const g=this.mainLamp;g.userData.base.visible=false;g.userData.hollow=[];for(const z of [-.56,.56])g.userData.hollow.push(this.box(2.8,.22,.2,'#405a76',0,.12,z,g));for(const x of [-1.3,1.3])g.userData.hollow.push(this.box(.2,.22,1.1,'#405a76',x,.12,0,g));g.userData.repaired=true;}if(!state.repaired&&this.mainLamp.userData.repaired){this.mainLamp.userData.base.visible=true;for(const part of this.mainLamp.userData.hollow||[])this.mainLamp.remove(part);this.mainLamp.userData.repaired=false;}
 }
 addBeam(link){const a=NODES[link.from],b=NODES[link.to],color={energie:'#f4c857',information:'#4cc7ed',materiel:'#b88af1'}[link.kind];const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(a.x,1.05,a.z),new THREE.Vector3((a.x+b.x)/2,2.8,(a.z+b.z)/2),new THREE.Vector3(b.x,1.05,b.z));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.06,4,false),this.mat(color,{emissive:color,emissiveIntensity:.35}));this.scene.add(m);const pulse=this.sphere(.14,'#fff5d1',0,0,0);pulse.position.copy(curve.getPoint(.5));this.beams.push({curve,pulse,mesh:m,id:link.id});}
 setPaused(v){this.paused=v;this.keys={};}
 play(){this.started=true;this.paused=false;}
 teleportTheme(id){const t=THEMES.find(t=>t.id===id);if(!t)return;this.teleport(t.x-Math.cos(t.angle)*(t.radius-5),t.z-Math.sin(t.angle)*(t.radius-5));this.callbacks.onRegion?.(t);}
 teleport(x,z){this.player.position.set(x,0,z);this.velocity=0;this.onGround=true;this.checkpoint={x,z};this.keys={};this.carry&&this.updateCarry();}
 goHub(){this.teleport(0,6);this.callbacks.onRegion?.(null);}
 gotoTarget(id){const t=this.targets.find(t=>t.id===id);if(t)this.teleport(t.x,t.z+Math.min(2,(t.reach||3)*.66));}
 respawn(){this.teleport(this.checkpoint.x,this.checkpoint.z);this.callbacks.onMessage?.('Retour au dernier repère. Votre progression est conservée.');}
 setCarry(value){if(this.carryMesh){this.player.remove(this.carryMesh);this.carryMesh=null;}this.carry=value;if(value){const color=value.kind==='item'?SORT_ITEMS.find(p=>p.id===value.id).color:{energie:'#f4c857',information:'#4cc7ed',materiel:'#b88af1'}[value.link.kind];const g=new THREE.Group();this.box(.55,.55,.55,this.mat(color,{emissive:color,emissiveIntensity:.25}),0,0,0,g);g.position.set(.7,1.4,.65);this.player.add(g);this.carryMesh=g;}if(this.state)this.setState(this.state);}
 updateCarry(){if(this.carryMesh)this.carryMesh.rotation.y=this.time*.6;}
 activeTargets(){
  if(!this.state)return [];
  if(this.carry?.kind==='item')return SORT_ZONES.map(z=>({...z,type:'drop',reach:z.radius+.4}));
  if(this.carry?.kind==='link'){const n=NODES[this.carry.link.to];return [{...n,id:'destination',type:'destination',reach:3,name:'Relier : '+n.name}];}
  return this.targets.filter(t=>{
   if(['portal','guide','theme'].includes(t.type))return true;
   if(t.type==='camille')return this.state.mission===0||this.state.mission===5;
   if(t.type==='part')return this.state.mission===1&&!this.state.identified.includes(t.part);
   if(t.type==='sort')return this.state.mission===2&&!this.state.sorted.includes(t.item);
   if(t.type==='flow')return this.state.mission===3&&!this.state.linked.includes(t.link);
   if(['instrument','repair'].includes(t.type))return this.state.mission===4;
   return false;
  });
 }
 nearest(){let best=null,dist=Infinity;for(const t of this.activeTargets()){const d=distance(this.player.position,t);if(d<(t.reach||3)&&d<dist){best=t;dist=d;}}return best;}
 interact(){if(this.paused)return;const t=this.nearest();if(t)this.callbacks.onInteract?.(t);else this.callbacks.onMessage?.('Approchez-vous d’un personnage, d’un objet ou d’un portail. Le bouton Repère peut vous guider.');}
 bindInputs(){
  this.keydown=e=>{if(this.paused||e.target.closest('input,textarea,select,dialog,button'))return;const map={KeyW:'forward',KeyZ:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',KeyQ:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run'};if(map[e.code]){e.preventDefault();this.keys[map[e.code]]=true;}if(e.code==='Space'){e.preventDefault();this.jump();}if(e.code==='KeyE'&&!e.repeat){e.preventDefault();this.interact();}};
  this.keyup=e=>{const map={KeyW:'forward',KeyZ:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',KeyQ:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run'};if(map[e.code])this.keys[map[e.code]]=false;};window.addEventListener('keydown',this.keydown);window.addEventListener('keyup',this.keyup);window.addEventListener('blur',()=>this.keys={});
  const c=this.renderer.domElement;let dragging=false,lastX=0;c.addEventListener('contextmenu',e=>e.preventDefault());c.addEventListener('pointerdown',e=>{c.focus({preventScroll:true});if(e.button===2||e.pointerType==='touch'){dragging=true;lastX=e.clientX;c.setPointerCapture(e.pointerId);}});c.addEventListener('pointermove',e=>{if(dragging&&!this.paused){this.yaw-=(e.clientX-lastX)*.006;lastX=e.clientX;}});c.addEventListener('pointerup',()=>dragging=false);c.addEventListener('pointercancel',()=>dragging=false);c.addEventListener('wheel',e=>{e.preventDefault();this.zoom=THREE.MathUtils.clamp(this.zoom+e.deltaY*.01,9,24);},{passive:false});
 }
 jump(){if(this.onGround&&!this.paused){this.velocity=7.7;this.onGround=false;}}
 frame(now){
  if(this._destroyed)return;const dt=Math.min((now-(this.last||now))/1000,.04);this.last=now;this.time+=dt;
  if(!this.started){this.camera.position.set(Math.sin(this.time*.035)*10+47,64,Math.cos(this.time*.035)*8+72);this.camera.lookAt(0,0,-12);}
  else{
   let moving=false;
   if(!this.paused){const v=movement(this.keys,this.yaw,dt),next=moveWithCollisions(this.player.position,v.x,v.z,this.colliders);moving=Math.abs(next.x-this.player.position.x)+Math.abs(next.z-this.player.position.z)>.001;this.player.position.x=next.x;this.player.position.z=next.z;if(moving)this.player.rotation.y=Math.atan2(v.x,v.z);
    const previousY=this.player.position.y;this.velocity-=19*dt;this.player.position.y+=this.velocity*dt;let ground=groundAt(this.player.position.x,this.player.position.z);for(const c of this.colliders)if(this.velocity<=0&&previousY>=c.height-.02&&this.player.position.y<=c.height&&Math.abs(this.player.position.x-c.x)<c.w/2+.15&&Math.abs(this.player.position.z-c.z)<c.d/2+.15)ground=Math.max(ground??-Infinity,c.height);if(ground!==null&&this.player.position.y<=ground){this.player.position.y=ground;this.velocity=0;this.onGround=true;}else this.onGround=false;if(this.player.position.y<-12)this.respawn();
    const nearest=this.nearest();this.callbacks.onPrompt?.(nearest);this.updateCarry();
   }
   const u=this.player.userData,wave=moving?Math.sin(this.time*10)*.65:0;u.leftLeg.rotation.x=wave;u.rightLeg.rotation.x=-wave;u.leftArm.rotation.x=-wave*.7;u.rightArm.rotation.x=this.carry?-1.0:wave*.7;
   const p=this.player.position;const desired=new THREE.Vector3(p.x-Math.sin(this.yaw)*this.zoom,p.y+this.zoom*.78,p.z+Math.cos(this.yaw)*this.zoom);this.camera.position.lerp(desired,1-Math.exp(-5*dt));this.camera.lookAt(p.x,p.y+1.1,p.z);
  }
  this.playerShadow.position.set(this.player.position.x,.23,this.player.position.z);this.playerShadow.visible=this.player.position.y<3&&groundAt(this.player.position.x,this.player.position.z)!==null;
  const animate=!this.state?.motion;
  if(animate){for(const o of this.rotators)o.rotation[o.userData.spinAxis||'y']+=dt*.22;for(const b of this.bobs){if(b.sortId&&(this.state?.sorted.includes(b.sortId)||this.carry?.id===b.sortId))continue;b.obj.position.y=b.base+Math.sin(this.time*1.6+b.base)*b.amount;}for(const b of this.beams)b.pulse.position.copy(b.curve.getPoint((this.time*.22)%1));}
  this.renderer.render(this.scene,this.camera);this.frameId=requestAnimationFrame(this.frame);
 }
 destroy(){this._destroyed=true;cancelAnimationFrame(this.frameId);window.removeEventListener('resize',this.resize);window.removeEventListener('keydown',this.keydown);window.removeEventListener('keyup',this.keyup);this.renderer.dispose();}
}
