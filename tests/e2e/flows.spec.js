import { test, expect } from '@playwright/test';
test('jornada completa, repetição sem duplicar, caderno local e apagar', async ({page}) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/'); await page.getByRole('button',{name:'Explorar missão'}).click();
  await page.getByRole('button',{name:'Vamos nessa'}).click();
  await page.getByRole('button',{name:'Iniciar tempo'}).click();
  await expect(page.getByRole('button',{name:'Pausar tempo'})).toBeVisible();
  await page.getByRole('button',{name:'Pausar tempo'}).click();
  await page.getByRole('button',{name:'Próxima etapa'}).click();
  await expect(page.getByText('AGORA, LONGE DA TELA')).toBeVisible();
  await page.getByRole('button',{name:'Próxima etapa'}).click();
  await page.getByRole('button',{name:'Registrar descoberta'}).click();
  await page.getByLabel('Minha descoberta (opcional)').fill('Descobri que preciso investigar a origem da água.');
  await page.getByRole('button',{name:'Plantar essa descoberta'}).click();
  await expect(page.locator('#progress-count')).toHaveText('1/5');
  await page.getByRole('button',{name:'Meu caderno'}).click();
  await expect(page.getByText('Descobri que preciso investigar a origem da água.')).toBeVisible();
  await page.getByLabel('Guardar meu caderno neste navegador').check();
  await page.reload(); await expect(page.locator('#progress-count')).toHaveText('1/5');
  await page.getByRole('button',{name:'1. De onde vem essa gota?, explorada',exact:true}).click();
  await page.getByRole('button',{name:'Vamos nessa'}).click();
  await page.getByRole('button',{name:'Próxima etapa'}).click();await page.getByRole('button',{name:'Próxima etapa'}).click();
  await page.getByRole('button',{name:'Registrar descoberta'}).click();await page.getByRole('button',{name:'Plantar essa descoberta'}).click();
  await expect(page.locator('#progress-count')).toHaveText('1/5');
  await page.getByRole('button',{name:'Meu caderno'}).click();
  await page.getByRole('button',{name:'Apagar meu progresso'}).click();await page.getByRole('button',{name:'Apagar agora'}).click();
  await expect(page.getByText('Seu caderno começa com curiosidade.')).toBeVisible();
  await page.reload(); await expect(page.locator('#progress-count')).toHaveText('0/5');
  expect(errors).toEqual([]);
});
test('sem consentimento o progresso não persiste e Escape devolve foco', async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Explorar missão'}).click();await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Explorar missão'})).toBeFocused();
  expect(await page.evaluate(()=>localStorage.getItem('quintal-caderno-v1'))).toBeNull();
});
test('oficina, revisão obrigatória, edição e importação real do arquivo', async({page})=>{
  await page.goto('http://127.0.0.1:4318');await page.getByRole('button',{name:'Usar missão pronta, sem IA'}).click();
  await expect(page.locator('#source')).toHaveText('Missão pronta • sem IA');
  await page.getByLabel('Nome da missão').fill('Missão revisada da nossa turma');
  await page.locator('#reviewed').check();
  await page.getByLabel('Nome da missão').fill('Missão revisada do quintal');await expect(page.locator('#reviewed')).not.toBeChecked();
  await page.locator('#reviewed').check();
  const downloaded = page.waitForEvent('download');await page.getByRole('button',{name:'Baixar missão revisada'}).click();
  const file = await downloaded; const path = await file.path();
  await page.goto('/');await page.getByRole('button',{name:'Missões da minha turma'}).click();
  await page.locator('#pack-file').setInputFiles(path);
  await expect(page.locator('#map-title')).toHaveText('Missão revisada do quintal');await expect(page.locator('#progress-count')).toHaveText('0/1');
});
test('arquivo inválido é rejeitado e impressão contém roteiro e alternativa em papel',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:'Missões da minha turma'}).click();
  await page.locator('#pack-file').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1}')});
  await expect(page.locator('#import-message')).toContainText('não é uma expedição válida');
  await page.evaluate(()=>{window.print=()=>{window.printCalled=true;};});
  await page.getByRole('button',{name:'Imprimir expedição atual'}).click();
  expect(await page.evaluate(()=>window.printCalled)).toBe(true);
  await expect(page.locator('.print-only article')).toHaveCount(5);
  await page.emulateMedia({media:'print'});await expect(page.locator('.print-only')).toBeVisible();
});
test('sem internet o jogo recarrega e abre missões sem chamadas externas',async({page,context})=>{
  const outside=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4317'))outside.push(r.url());});
  await page.goto('/');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.reload();await context.setOffline(true);await page.reload();
  await page.getByRole('button',{name:'Explorar missão'}).click();await expect(page.locator('#dialog-title')).toHaveText('De onde vem essa gota?');
  expect(outside).toEqual([]);await context.setOffline(false);
});
test('mobile sem overflow, lista acessível e todos os cinco personagens',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Ver em lista'}).click();await expect(page.locator('.world')).toHaveClass(/list-mode/);
  await expect(page.locator('.map-node')).toHaveCount(5);
  await page.getByRole('button',{name:'A turma',exact:true}).click();await expect(page.locator('.crew-card')).toHaveCount(5);
});
test('servidores separam jogo e IA, negam segredos e acesso não autenticado',async({request})=>{
  expect((await request.get('/.env')).status()).toBe(404);
  expect((await request.post('/api/mission',{data:{}})).status()).toBe(405);
  expect((await request.post('http://127.0.0.1:4318/api/mission',{data:{}})).status()).toBe(401);
  expect((await request.post('http://127.0.0.1:4318/api/mission',{headers:{Origin:'https://untrusted.example'},data:{}})).status()).toBe(403);
  expect((await request.get('http://127.0.0.1:4318',{headers:{Host:'untrusted.example'}})).status()).toBe(403);
});

