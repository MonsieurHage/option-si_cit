import {THEMES} from './themes.js';
import {initialState,sanitize} from './state.js';
export const PROFILE_KEY='saintjean-archipel-profile-v1';
export function initialProfile(){return {version:1,activeTheme:'analyse',avatar:'#2d75e8',quality:'normal',motion:false,modules:Object.fromEntries(THEMES.map(t=>[t.id,t.id==='analyse'?initialState():{version:1,mission:0,journal:[],status:'preview'}]))};}
export function sanitizeProfile(raw){
 const p=initialProfile();if(!raw||raw.version!==1)return p;
 if(THEMES.some(t=>t.id===raw.activeTheme))p.activeTheme=raw.activeTheme;
 if(/^#[a-f0-9]{6}$/i.test(raw.avatar||''))p.avatar=raw.avatar;
 p.quality=raw.quality==='eco'?'eco':'normal';p.motion=raw.motion===true;
 p.modules.analyse=sanitize(raw.modules?.analyse);
 return p;
}
