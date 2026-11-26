import {build} from 'esbuild';
import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({entryPoints:[path.join(root,'src/main.js')],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:path.join(root,'assets/game.js'),legalComments:'eof',logLevel:'info'});
await cp(path.join(root,'node_modules/three/LICENSE'),path.join(root,'assets/THREE_LICENSE.txt'));
await rm(path.join(root,'dist'),{recursive:true,force:true});await mkdir(path.join(root,'dist'),{recursive:true});
for(const file of ['index.html','styles.css','assets'])await cp(path.join(root,file),path.join(root,'dist',file),{recursive:true});
const assets={};
async function collect(dir){const {readdir}=await import('node:fs/promises');for(const ent of await readdir(dir,{withFileTypes:true})){const full=path.join(dir,ent.name);if(ent.isDirectory())await collect(full);else if(/\.(webp|jpg|mp4|vtt|svg)$/.test(ent.name)){const ext=path.extname(ent.name),mime={'.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.vtt':'text/vtt','.svg':'image/svg+xml'}[ext];assets[path.relative(root,full).split(path.sep).join('/')]='data:'+mime+';base64,'+(await readFile(full)).toString('base64');}}}
await collect(path.join(root,'assets'));
let html=await readFile(path.join(root,'index.html'),'utf8');
const css=await readFile(path.join(root,'styles.css'),'utf8');
// A replacement string interprets $&, $` and $' inside bundled code.
// A callback preserves the inserted source literally.
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>\n'+css+'\n</style>').replace('<script src="assets/game.js" defer></script>','');
for(const [name,data] of Object.entries(assets))html=html.replaceAll('src="'+name+'"','src="'+data+'"').replaceAll('href="'+name+'"','href="'+data+'"');
const js=(await readFile(path.join(root,'assets/game.js'),'utf8')).replaceAll('</script','<\\/script');
html=html.replace('</body>',()=>'<script>globalThis.ARCHIPEL_ASSETS='+JSON.stringify(assets)+';\n'+js+'\n</script></body>');
// Validate the exact script that will be delivered, after HTML assembly.
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))new Script(match[1],{filename:'Archipel_SI_Apercu.html'});
await mkdir(path.join(root,'validation'),{recursive:true});await writeFile(path.join(root,'validation/Archipel_SI_Apercu.html'),html);
console.log('Application statique et aperçu autonome prêts.');
