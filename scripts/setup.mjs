import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const path = new URL('../.env',import.meta.url);
let value;
try { value = await readFile(path,'utf8'); } catch { value = await readFile(new URL('../.env.example',import.meta.url),'utf8'); }
if(!/^TEACHER_TOKEN=.{20,}$/m.test(value)) value=value.replace(/^TEACHER_TOKEN=.*$/m,`TEACHER_TOKEN=${randomBytes(24).toString('hex')}`);
await writeFile(path,value,{mode:0o600});
console.log('Configuração local pronta. Abra .env para configurar GEMINI_API_KEY e consultar a senha TEACHER_TOKEN. Nenhum segredo foi exibido.');
