import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
const skip=new Set(['node_modules','.git','work','test-results','playwright-report']);
const errors=[];
async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){if(skip.has(f.name)||f.name.startsWith('.env')&&f.name!=='.env.example')continue;const p=resolve(dir,f.name);if(f.isDirectory())await walk(p);else if(/\.(js|mjs|html|css|md|json|yml)$/.test(p)){const s=await readFile(p,'utf8');if(/[\u2014\u2013]/.test(s))errors.push(`${relative(root,p)} contém travessão.`);if(/AIza[\w-]{25,}|AQ\.[\w-]{30,}|gh[pousr]_[\w]{30,}/.test(s))errors.push(`${relative(root,p)} contém possível segredo.`);if(/\.(js|mjs)$/.test(p)){try{execFileSync(process.execPath,['--check',p],{stdio:'pipe'});}catch{errors.push(`${relative(root,p)}: sintaxe inválida.`);}}}}}
await walk(root);
for(const f of ['assets/map.svg','assets/cat.svg','assets/dog.svg','assets/hen.svg','assets/rooster.svg','assets/chick.svg','assets/favicon.svg','assets/nunito-regular.ttf','assets/nunito-extrabold.ttf']){try{await readFile(resolve(root,'public',f));}catch{errors.push(`Asset ausente: ${f}`);}}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log('Sintaxe, assets, texto sem travessão e verificação de segredos: OK.');
