import test from 'node:test';
import assert from 'node:assert/strict';
import { starterPack } from '../public/data.js';
import { validatePack, validateMission } from '../public/schema.js';
import { generateMission, validateRequest } from '../src/gemini.js';
const input = { subject:'Ciências', topic:'Água e consumo consciente', grade:'6º ano', minutes:10, resources:'Um aparelho por grupo' };
test('todas as missões têm objetivo, alternativa em papel e etapa fora da tela', () => { assert.ok(validatePack(starterPack)); assert.equal(starterPack.missions.length,5); });
test('importação rejeita pacote sem revisão, IDs repetidos, HTML, excesso e etapas sem pausa de tela', () => {
  assert.equal(validatePack({...starterPack,reviewed:false}),false);
  assert.equal(validatePack({...starterPack,missions:[starterPack.missions[0],starterPack.missions[0]]}),false);
  assert.equal(validatePack({...starterPack,missions:Array(6).fill(starterPack.missions[0])}),false);
  assert.equal(validateMission({...starterPack.missions[0],title:'<script>alert(1)</script>'}),false);
  assert.equal(validateMission({...starterPack.missions[0],steps:starterPack.missions[0].steps.map(s=>({...s,mode:'screen'}))}),false);
  assert.equal(validateMission({...starterPack.missions[0],minutes:-1}),false);
});
test('gerador aceita somente combinações curriculares previstas', () => { assert.ok(validateRequest(input)); assert.equal(validateRequest({...input,topic:'texto livre com dados pessoais'}),false); assert.equal(validateRequest({...input,minutes:200}),false); });
test('Gemini envia somente opções permitidas e mantém credencial no cabeçalho', async () => {
  let called = 0;
  const result = await generateMission({...input, student:'Dado que não pode sair'}, { apiKey:'test-only-key', fetcher:async (url, options) => {
    called++; assert.ok(!url.includes('test-only-key')); assert.equal(options.headers['x-goog-api-key'],'test-only-key');
    const body = JSON.parse(options.body); assert.deepEqual(JSON.parse(body.contents[0].parts[0].text),input);
    assert.ok(!options.body.includes('Dado que não pode sair'));
    return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(starterPack.missions[0])}]}}]})};
  }});
  assert.equal(called,1); assert.equal(result.source,'gemini'); assert.equal(result.reviewed,false); assert.ok(validateMission(result.mission));
});
test('sem chave não inventa resposta', async () => { await assert.rejects(generateMission(input,{}),e=>e.status===503); });
test('quota, configuração, bloqueio, timeout e JSON inválido têm erros controlados', async () => {
  await assert.rejects(generateMission(input,{apiKey:'test',fetcher:async()=>({ok:false,status:429})}),e=>e.status===429);
  await assert.rejects(generateMission(input,{apiKey:'test',fetcher:async()=>({ok:false,status:403})}),e=>e.status===502&&!e.message.includes('test'));
  await assert.rejects(generateMission(input,{apiKey:'test',fetcher:async()=>({ok:true,json:async()=>({promptFeedback:{blockReason:'SAFETY'}})})}),e=>e.status===502);
  await assert.rejects(generateMission(input,{apiKey:'test',fetcher:async()=>{throw new Error('timeout')}}),e=>e.status===504);
  await assert.rejects(generateMission(input,{apiKey:'test',fetcher:async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'not json'}]}}]})})}),e=>e.status===502);
});
