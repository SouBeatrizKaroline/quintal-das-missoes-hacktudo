import { characters, starterPack } from './data.js';
import { validatePack } from './schema.js';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'quintal-caderno-v1';
let pack = structuredClone(starterPack), completed = {}, remember = false, current = null, step = -1;
let remaining = 0, deadline = null, timer = null;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved?.version === 1 && validatePack(saved.pack) && saved.completed && typeof saved.completed === 'object') {
    pack = saved.pack;
    completed = Object.fromEntries(Object.entries(saved.completed).filter(([id,v]) => pack.missions.some(m => m.id === id) && typeof v?.note === 'string' && v.note.length <= 1200 && typeof v?.title === 'string' && v.title.length <= 80));
    remember = true;
  }
} catch { /* Armazenamento indisponível: a aventura continua em memória. */ }
function save() {
  try { if (remember) localStorage.setItem(KEY, JSON.stringify({ version: 1, pack, completed })); else localStorage.removeItem(KEY); }
  catch { remember = false; $('#remember').checked = false; toast('O navegador não conseguiu guardar. Baixe o caderno para preservar suas descobertas.'); }
}
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toast.timeout); toast.timeout = setTimeout(() => $('#toast').classList.remove('visible'), 5500); }
function navigate(view) {
  document.querySelectorAll('.view').forEach(e => e.classList.toggle('hidden', e.id !== `${view}-view`));
  document.querySelectorAll('[data-view]').forEach(b => { b.classList.toggle('active', b.dataset.view === view); if (b.dataset.view === view) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  if (view === 'journal') renderJournal();
  if (view === 'crew') renderCrew();
  $('#main').focus();
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
function renderMap() {
  $('#map-title').textContent = pack.title;
  $('#map-nodes').innerHTML = pack.missions.map((m,i) => `<button class="map-node ${completed[m.id] ? 'done' : ''}" data-mission="${esc(m.id)}" aria-label="${i+1}. ${esc(m.title)}${completed[m.id] ? ', explorada' : ''}"><img class="node-art" src="/assets/${m.character}.svg" alt=""><span class="node-label"><span class="node-number">${completed[m.id] ? '✓' : i+1}</span>${esc(m.title)}</span></button>`).join('');
  document.querySelectorAll('[data-mission]').forEach(b => b.addEventListener('click', () => openMission(b.dataset.mission)));
  const count = pack.missions.filter(m => completed[m.id]).length;
  $('#progress-count').textContent = `${count}/${pack.missions.length}`;
  // Classes fixas mantêm a barra compatível com a política sem estilos inline.
  $('#progress-fill').replaceChildren();
  $('#progress-track').setAttribute('aria-valuenow', count); $('#progress-track').setAttribute('aria-valuemax', pack.missions.length);
  $('#progress-track').className = `progress-track progress-${Math.round(count / pack.missions.length * 100)}`;
  $('#progress-copy').textContent = count === pack.missions.length ? 'Quintal florido! Que ideia você leva daqui?' : count ? `${count} descoberta${count > 1 ? 's' : ''} para levar além da tela.` : 'Cada descoberta planta uma nova ideia.';
  const next = pack.missions.find(m => !completed[m.id]) || pack.missions[0];
  $('#featured-title').textContent = next.title;
  $('#featured-time').textContent = next.minutes;
  $('#featured-copy').textContent = next.objective;
  const char = characters.find(c => c.id === next.character);
  $('.guide-portrait img').src = `/assets/${char.id}.svg`; $('.guide-portrait img').alt = `${char.name}, ${char.kind}`;
  $('.adventure-panel>.eyebrow').textContent = `${char.name.toUpperCase()} TEM UMA MISSÃO`;
  $('#start-mission').onclick = () => openMission(next.id);
}
function stopTimer() { if (deadline) remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); deadline = null; clearInterval(timer); timer = null; }
function closeMission() { stopTimer(); current = null; }
$('#mission-dialog').addEventListener('close', closeMission);
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
function openMission(id) {
  stopTimer(); current = pack.missions.find(m => m.id === id) || starterPack.missions.find(m => m.id === id);
  if (!current) return;
  step = -1; renderMission(); $('#mission-dialog').showModal();
}
function renderMission() {
  const m = current, char = characters.find(c => c.id === m.character);
  if (step === -1) {
    $('#mission-body').innerHTML = `<img class="mission-intro-img" src="/assets/${m.character}.svg" alt="${char.name}"><h2 id="dialog-title">${esc(m.title)}</h2><p>${esc(m.objective)}</p><div class="tags"><span class="tag">${m.minutes} minutos sugeridos</span><span class="tag">Um aparelho por grupo</span><span class="tag">3 pequenas etapas</span></div><h3>Antes de partir</h3><p>Combinem com o educador o espaço e o momento da missão. Escolham quem lê, quem registra e quem cuida da vez de falar. Troquem os papéis na próxima parada.</p><p class="gentle-note">Materiais: ${esc(m.materials)}</p><details class="offline-box"><summary>Vamos fazer sem celular?</summary><p>${esc(m.offline)}</p></details><div class="dialog-actions"><button class="small-button" id="print-mission">Imprimir missão</button><button class="primary" id="begin">Vamos nessa <span>→</span></button></div>`;
    $('#begin').onclick = () => { step = 0; nextStep(); };
    $('#print-mission').onclick = () => printMissions([m]);
    return;
  }
  if (step < 3) {
    const s = m.steps[step], labels = { screen: 'CELULAR EM AÇÃO', away: 'AGORA, LONGE DA TELA', together: 'É HORA DE TROCAR IDEIAS' };
    $('#dialog-kicker').textContent = `${char.name.toUpperCase()} • ETAPA ${step+1} DE 3`;
    $('#mission-body').innerHTML = `<div class="steps-indicator" aria-hidden="true">${m.steps.map((_,i) => `<span class="${i<=step?'current':''}"></span>`).join('')}</div><div class="mode-label">${labels[s.mode]}</div><h2 id="dialog-title">${esc(s.title)}</h2><p class="step-content">${esc(s.text)}</p><div class="timer-box"><div><strong id="timer-value"></strong><small>Tempo sugerido, sem cobrança</small></div><button id="timer-toggle">Iniciar tempo</button></div><p class="gentle-note">Pode sair da tela, pausar ou avançar quando o grupo estiver pronto. O tempo não mede atenção e não vale pontos.</p><div class="dialog-actions"><button class="small-button" id="back-step">Voltar</button><button class="primary" id="next-step">${step === 2 ? 'Registrar descoberta' : 'Próxima etapa'} <span>→</span></button></div>`;
    updateTimer(); $('#timer-toggle').onclick = toggleTimer;
    $('#back-step').onclick = () => { stopTimer(); step--; if (step >= 0) nextStep(); else renderMission(); };
    $('#next-step').onclick = () => { stopTimer(); step++; if (step < 3) nextStep(); else renderMission(); };
  } else {
    $('#dialog-kicker').textContent = 'UMA IDEIA PARA LEVAR COM VOCÊ';
    $('#mission-body').innerHTML = `<img class="mission-intro-img" src="/assets/${m.character}.svg" alt=""><h2 id="dialog-title">O que brotou por aí?</h2><p>${esc(m.reflection)}</p><label class="field-label" for="reflection">Minha descoberta (opcional)</label><textarea id="reflection" maxlength="1200" placeholder="Uma pergunta, uma ideia ou algo que mudou...">${esc(completed[m.id]?.note || '')}</textarea><p class="gentle-note">Evite nomes e informações pessoais. A anotação fica neste aparelho e não é avaliada por IA.</p><div class="dialog-actions"><button class="small-button" id="back-reflection">Voltar</button><button class="primary" id="finish-mission">Plantar essa descoberta <span>❧</span></button></div>`;
    $('#back-reflection').onclick = () => { step = 2; nextStep(); };
    $('#finish-mission').onclick = () => {
      if (pack.missions.some(x => x.id === m.id)) { completed[m.id] = { title: m.title, note: $('#reflection').value.trim(), date: new Date().toLocaleDateString('pt-BR') }; save(); renderMap(); }
      $('#mission-dialog').close(); toast('Descoberta plantada. Que tal descansar a tela e compartilhar sua ideia?');
    };
  }
  $('#dialog-title').setAttribute('tabindex','-1'); $('#dialog-title').focus();
}
function nextStep() { remaining = Math.round(current.minutes * 60 * [0.2, 0.5, 0.3][step]); renderMission(); }
function updateTimer() {
  const target = $('#timer-value'); if (!target) return;
  if (deadline) remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  target.textContent = `${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  if (remaining <= 0 && deadline) { stopTimer(); $('#timer-toggle').textContent = 'Recomeçar tempo'; toast('O tempo sugerido terminou. Vocês escolhem quando seguir.'); }
}
function toggleTimer() {
  if (deadline) { stopTimer(); $('#timer-toggle').textContent = 'Continuar tempo'; }
  else { if (remaining <= 0) remaining = Math.round(current.minutes * 60 * [0.2,0.5,0.3][step]); deadline = Date.now() + remaining * 1000; $('#timer-toggle').textContent = 'Pausar tempo'; timer = setInterval(updateTimer, 500); updateTimer(); }
}
function renderJournal() {
  $('#remember').checked = remember;
  const entries = pack.missions.filter(m => completed[m.id]);
  $('#journal-content').innerHTML = entries.length ? entries.map(m => `<article class="journal-card"><small>❧ DESCOBERTA PLANTADA</small><h2>${esc(m.title)}</h2><p>${esc(completed[m.id].note || 'Explorei esta missão. Minha descoberta ficou na conversa com o grupo.')}</p></article>`).join('') : '<div class="empty-state"><img src="/assets/chick.svg" alt="Pipoca"><h2>Seu caderno começa com curiosidade.</h2><p>Explore uma parada do mapa e registre o que descobriu. Pode ser uma frase, uma dúvida ou uma nova ideia.</p><button class="primary" id="back-map">Ir para o mapa →</button></div>';
  $('#back-map')?.addEventListener('click', () => navigate('map'));
}
function renderCrew() { $('#crew-content').innerHTML = characters.map(c => `<article class="crew-card"><img src="/assets/${c.id}.svg" alt="${esc(c.name)}, ${esc(c.kind)}"><h2>${c.name}</h2><small>${c.kind}</small><br><span class="role">${c.role}</span><p>${c.phrase}</p></article>`).join(''); }
function showInfo(title, body) { $('#info-body').innerHTML = `<h2 id="info-title">${title}</h2>${body}`; $('#info-dialog').showModal(); }
$('#about-button').onclick = () => showInfo('O celular é só uma parte da aventura.', '<p>O Quintal é um RPG cooperativo de missões curtas, pensado para o 6º ao 9º ano, com mediação do educador.</p><ol><li><strong>Combinem.</strong> O educador define objetivo, momento e espaço. Um aparelho pode atender ao grupo.</li><li><strong>Escolham.</strong> Toda parada está aberta. Comecem pelo que faz sentido para a aula.</li><li><strong>Experimentem.</strong> Leiam na tela, criem fora dela e conversem. O relógio é um convite, nunca uma cobrança.</li><li><strong>Plantem.</strong> Registrem uma descoberta, se quiserem. Cada missão ganha uma marca, sem ranking ou sequência diária.</li></ol><p class="gentle-note">As missões prontas são exemplos de um protótipo. O educador deve revisar sua adequação antes de usar com uma turma.</p>');
$('#privacy-button').onclick = () => showInfo('Curiosidade sem vigilância.', '<h3>O que fica com você</h3><p>Progresso e anotações ficam na memória desta aba. Só são guardados no navegador se você ativar essa opção no caderno. Você pode baixar e apagar tudo quando quiser. Em um aparelho compartilhado, prefira não guardar.</p><h3>O que este jogo não coleta</h3><p>Sem cadastro, publicidade, análise de uso, câmera, microfone, localização ou leitura de outros aplicativos. O relógio não verifica atenção. Não há envio de respostas ao Gemini nem painel de comportamento.</p><h3>Como a IA participa</h3><p>Uma oficina independente, exclusiva do educador adulto, pode preparar rascunhos com Gemini. O educador revisa, edita e exporta o arquivo. O jogo só importa a atividade aprovada, sem conexão com a oficina.</p><h3>Por trás das escolhas</h3><p><a href="https://www.unesco.org/en/articles/smartphones-school-only-when-they-clearly-support-learning" target="_blank" rel="noreferrer">UNESCO: tecnologia quando apoia a aprendizagem</a><br><a href="https://www.gov.br/mec/pt-br/celular-escola" target="_blank" rel="noreferrer">MEC: celulares na escola</a><br><a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Google: termos da API Gemini</a></p><p class="gentle-note">Não medimos nem comprovamos ganhos de aprendizagem neste protótipo. As fontes orientam o desenho, não validam o produto. O servidor recebe dados técnicos necessários à conexão; este código não mantém logs de acesso. A hospedagem escolhida pode ter seus próprios registros.</p>');
$('#pause-button').onclick = () => openMission('respiro');
$('#about-footer').onclick = () => $('#about-button').click();
$('#list-toggle').onclick = () => { const on = $('#world').classList.toggle('list-mode'); $('#list-toggle').setAttribute('aria-pressed', on); $('#list-toggle').textContent = on ? '⌘ Ver no mapa' : '☷ Ver em lista'; };
$('#remember').onchange = e => { remember = e.target.checked; save(); toast(remember ? 'Caderno guardado só neste navegador.' : 'O caderno não será guardado ao fechar ou recarregar.'); };
function download(name, text, type = 'text/plain') { const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([text], { type })); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('#export-journal').onclick = () => { const entries = pack.missions.filter(m => completed[m.id]); download('meu-caderno-quintal.txt', `MEU CADERNO DE DESCOBERTAS\n${pack.title}\n\n${entries.length ? entries.map(m => `${m.title}\n${completed[m.id].note || 'Descoberta compartilhada em conversa.'}`).join('\n\n') : 'Ainda não registrei descobertas.'}`); toast('Caderno preparado para baixar.'); };
$('#clear-journal').onclick = () => { showInfo('Apagar seu progresso neste aparelho?', '<p>As marcas e anotações serão removidas. Você pode baixar o caderno antes de continuar.</p><div class="dialog-actions"><button class="small-button" id="cancel-clear">Manter caderno</button><button class="primary" id="confirm-clear">Apagar agora</button></div>'); $('#cancel-clear').onclick = () => $('#info-dialog').close(); $('#confirm-clear').onclick = () => { completed = {}; remember = false; save(); renderMap(); renderJournal(); $('#info-dialog').close(); toast('Progresso apagado. O quintal está pronto para outra aventura.'); }; };
$('#class-button').onclick = () => {
  showInfo('O quintal da sua turma.', '<p>Recebeu um arquivo de missões revisadas pelo educador? Abra aqui. A leitura acontece neste aparelho, sem envio para um servidor.</p><p class="gentle-note">Trocar a expedição inicia um caderno vazio. Baixe o atual antes, se quiser preservá-lo.</p><label class="field-label" for="pack-file">Arquivo de missões (.json, até 40 KB)</label><input class="file-input" id="pack-file" type="file" accept=".json,application/json"><p id="import-message" role="status"></p><div class="dialog-actions"><button class="small-button" id="print-all">Imprimir expedição atual</button><button class="small-button" id="reset-pack">Voltar à expedição inicial</button></div>');
  $('#print-all').onclick = () => printMissions(pack.missions);
  $('#reset-pack').onclick = () => changePack(structuredClone(starterPack));
  $('#pack-file').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { if (file.size > 40000) throw new Error('large'); const parsed = JSON.parse(await file.text()); if (!validatePack(parsed)) throw new Error('schema'); changePack(parsed); }
    catch { $('#import-message').textContent = 'Este arquivo não é uma expedição válida. Peça ao educador um arquivo revisado, com até cinco missões e 40 KB.'; }
  };
};
function changePack(next) { pack = next; completed = {}; save(); renderMap(); $('#info-dialog').close(); toast('Expedição carregada. Escolham por onde começar.'); }
function printMissions(missions) {
  document.querySelector('.print-only')?.remove();
  const area = document.createElement('section'); area.className = 'print-only';
  area.innerHTML = missions.map(m => `<article><small>QUINTAL DAS MISSÕES • ATIVIDADE EM PAPEL</small><h1>${esc(m.title)}</h1><p><strong>Objetivo:</strong> ${esc(m.objective)}</p><p><strong>Tempo sugerido:</strong> ${m.minutes} minutos. <strong>Materiais:</strong> ${esc(m.materials)}</p><p>Combinem espaço e momento com o educador. Dividam e alternem os papéis de leitura, registro e apresentação.</p>${m.steps.map((s,i) => `<h3>${i+1}. ${esc(s.title)}</h3><p>${esc(s.text)}</p>`).join('')}<h3>Sem aparelho</h3><p>${esc(m.offline)}</p><h3>Para conversar e registrar</h3><p>${esc(m.reflection)}</p><div class="writing-lines"></div><p>Participar vale mais que correr. A pausa é livre. Não há ranking.</p></article>`).join('');
  document.body.append(area); window.print();
}
window.addEventListener('offline', () => { $('#connection-label').textContent = 'Sem internet. O quintal continua.'; toast('Você está sem internet. As missões carregadas continuam disponíveis.'); });
window.addEventListener('online', () => { $('#connection-label').textContent = 'Progresso só neste aparelho'; });
renderMap();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { /* A experiência online independe do cache offline. */ });
