import {THEMES} from './themes.js';
export const HUB_RADIUS=15;
export function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
export function segmentDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;if(!len)return distance(p,a);const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/len));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);}
export function groundAt(x,z){
 if(Math.hypot(x,z)<=HUB_RADIUS-.2)return 0;
 for(const t of THEMES){if(Math.hypot(x-t.x,z-t.z)<=t.radius-.2)return 0;const start={x:Math.cos(t.angle)*14,z:Math.sin(t.angle)*14},end={x:t.x-Math.cos(t.angle)*(t.radius-1),z:t.z-Math.sin(t.angle)*(t.radius-1)};if(segmentDistance({x,z},start,end)<=2.15)return 0;}
 return null;
}
export function moveWithCollisions(position,dx,dz,colliders=[],radius=.38){
 const blocked=(x,z)=>colliders.some(c=>position.y<(c.height||1.5)&&x+radius>c.x-c.w/2&&x-radius<c.x+c.w/2&&z+radius>c.z-c.d/2&&z-radius<c.z+c.d/2);
 let x=position.x,z=position.z;if(!blocked(x+dx,z))x+=dx;if(!blocked(x,z+dz))z+=dz;return {x,z};
}
export function movement(keys,yaw,dt){
 const forward=Number(keys.forward||false)-Number(keys.back||false),right=Number(keys.right||false)-Number(keys.left||false),len=Math.hypot(forward,right);
 if(!len)return {x:0,z:0};const speed=keys.run?10:6.7;const scale=speed*Math.min(dt,.05)/len;
 return {x:(Math.sin(yaw)*forward+Math.cos(yaw)*right)*scale,z:(-Math.cos(yaw)*forward+Math.sin(yaw)*right)*scale};
}
