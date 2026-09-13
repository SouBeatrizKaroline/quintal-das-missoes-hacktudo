import { characters, starterPack } from './data.js';
import { validatePack } from './schema.js';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY = 'quintal-caderno-v1';
let pack = structuredClone(starterPack), completed = {}, remember = false, current = null, step = -1;
let remaining = 0, deadline = null, timer = null, lostProgressCount = 0;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved?.version === 1 && validatePack(saved.pack) && saved.completed && typeof saved.completed === 'object') {
    pack = saved.pack;
    // Separa validação de dados corrompidos (v inválido) de entradas sem missão correspondente (expedição trocada).
    const allSaved = Object.entries(saved.completed);
    const validData = allSaved.filter(([,v]) => typeof v?.note === 'string' && v.note.length <= 1200 && typeof v?.title === 'string' && v.title.length <= 80);
    const validEntries = validData.filter(([id]) => pack.missions.some(m => m.id === id));
    completed = Object.fromEntries(validEntries);
    lostProgressCount = validData.length - validEntries.length; // entradas válidas sem missão correspondente
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
  document.querySelectorAll('[data-mission]').forEach(b => {
    b.addEventListener('click', () => openMission(b.dataset.mission));
    // Hover preview: mostra personagem, título e tempo ao passar o mouse ou tocar na node.
    b.addEventListener('mouseenter', e => showMapPreview(b, e));
    b.addEventListener('mouseleave', hideMapPreview);
    b.addEventListener('touchstart', e => { e.preventDefault(); showMapPreview(b, e); }, { passive: false });
    b.addEventListener('touchend', hideMapPreview);
  });
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
// Hover preview do mapa.
let previewTimeout = null;
function showMapPreview(btn, e) {
  const id = btn.dataset.mission;
  const m = pack.missions.find(x => x.id === id); if (!m) return;
  let el = $('#map-preview');
  if (!el) { el = document.createElement('div'); el.id = 'map-preview'; el.className = 'map-preview'; document.body.appendChild(el); }
  const char = characters.find(c => c.id === m.character);
  el.innerHTML = `<img src="/assets/${m.character}.svg" alt=""><div><strong>${esc(m.title)}</strong><br><small>${char.name} · ${m.minutes} min</small></div>`;
  const r = btn.getBoundingClientRect();
  el.style.setProperty('--preview-top', `${Math.round(r.top + window.scrollY - 10)}px`);
  el.style.setProperty('--preview-left', `${Math.round(r.left + r.width / 2)}px`);
  el.classList.add('visible');
}
function hideMapPreview() { const el = $('#map-preview'); if (el) el.classList.remove('visible'); }
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
    $('#mission-dialog').className = ''; // limpa classe de modo ao voltar à intro
    return;
  }
  if (step < 3) {
    const s = m.steps[step], labels = { screen: 'CELULAR EM AÇÃO', away: 'AGORA, LONGE DA TELA', together: 'É HORA DE TROCAR IDEIAS' };
    $('#mission-dialog').className = `mode-${s.mode}`; // color coding por modo
    $('#dialog-kicker').textContent = `${char.name.toUpperCase()} • ETAPA ${step+1} DE 3`;
    // Personagem ativo: guia contextual com frase do personagem por etapa.
    const stepPhrases = {
      screen: `${char.name} diz: “${char.phrase}”`,
      away:   'Hora de guardar o celular e explorar o mundo.',
      together: 'Todas as vozes têm vez. Quem ainda não falou?'
    };
    // Modo Roda: no step together, um botão sorteia quem fala agora.
    const rodaRoles = characters.map(c => c.role);
    const rodaBtn = s.mode === 'together' ? `<button class="roda-btn" id="roda-btn" type="button">Girar a palavra 🎲</button><div class="roda-result" id="roda-result"></div>` : '';
    $('#mission-body').innerHTML = `<div class="step-guide"><img class="step-guide-avatar" src="/assets/${m.character}.svg" alt=""><span class="step-guide-phrase">${esc(stepPhrases[s.mode] || char.phrase)}</span></div><div class="steps-indicator" aria-hidden="true">${m.steps.map((_,i) => `<span class="${i<=step?'current':''}"></span>`).join('')}</div><div class="mode-label">${labels[s.mode]}</div><h2 id="dialog-title">${esc(s.title)}</h2><p class="step-content">${esc(s.text)}</p>${rodaBtn}<div class="timer-box"><div><strong id="timer-value"></strong><small>Tempo sugerido, sem cobrança</small></div><button id="timer-toggle">Iniciar tempo</button></div><p class="gentle-note">Pode sair da tela, pausar ou avançar quando o grupo estiver pronto. O tempo não mede atenção e não vale pontos.</p><div class="dialog-actions"><button class="small-button" id="back-step">Voltar</button><button class="primary" id="next-step">${step === 2 ? 'Registrar descoberta' : 'Próxima etapa'} <span>→</span></button></div>`;
    updateTimer(); $('#timer-toggle').onclick = toggleTimer;
    $('#back-step').onclick = () => { stopTimer(); step--; if (step >= 0) nextStep(); else renderMission(); };
    $('#next-step').onclick = () => { stopTimer(); step++; if (step < 3) nextStep(); else renderMission(); };
    // Modo Roda: inicializa o sorteio de papéis após o HTML estar no DOM.
    if (s.mode === 'together') {
      const rodaRoles = characters.map(c => c.role);
      let rodaIdx = -1;
      $('#roda-btn')?.addEventListener('click', () => {
        rodaIdx = (rodaIdx + 1 + Math.floor(Math.random() * (rodaRoles.length - 1))) % rodaRoles.length;
        const el = $('#roda-result');
        el.textContent = rodaRoles[rodaIdx];
        el.classList.remove('roda-pop'); void el.offsetWidth; el.classList.add('roda-pop');
      });
    }
  } else {
    $('#dialog-kicker').textContent = 'UMA IDEIA PARA LEVAR COM VOCÊ';
    $('#mission-dialog').className = ''; // reflexão não tem modo de tela
    // Mural do Grupo: vozes coletivas salvas na missão anterior, se houver.
    const existingNotes = completed[m.id]?.groupNotes || ['', '', ''];
    const groupLabels = ['Uma ideia do grupo', 'Outra perspectiva', 'Uma dúvida que ficou'];
    $('#mission-body').innerHTML = `<img class="mission-intro-img" src="/assets/${m.character}.svg" alt=""><h2 id="dialog-title">O que brotou por aí?</h2><p>${esc(m.reflection)}</p><div class="group-notes-area"><p class="group-notes-title">Vozes do grupo <span class="gentle-note">(opcional)</span></p>${groupLabels.map((label, i) => `<input class="group-note-input" id="group-note-${i}" type="text" maxlength="200" placeholder="${esc(label)}" value="${esc(existingNotes[i] || '')}">`).join('')}</div><label class="field-label" for="reflection">Minha descoberta (opcional)</label><textarea id="reflection" maxlength="1200" placeholder="Uma pergunta, uma ideia ou algo que mudou...">${esc(completed[m.id]?.note || '')}</textarea><p class="gentle-note">Evite nomes e informações pessoais. A anotação fica neste aparelho e não é avaliada por IA.</p><div class="dialog-actions"><button class="small-button" id="back-reflection">Voltar</button><button class="primary" id="finish-mission">Plantar essa descoberta <span>❧</span></button></div>`;
    $('#back-reflection').onclick = () => { step = 2; nextStep(); };
    // Mensagem de conclusão personalizada por personagem.
    const plantMessages = { cat: 'Mimo registrou sua descoberta. Que pergunta você leva desta missão?', dog: 'Bento guardou o acordo do grupo. Que voz do grupo você não quer esquecer?', hen: 'Cora plantou sua ideia. O que você criaria diferente na próxima vez?', rooster: 'Zeca anotou a explicação. Qual ideia do grupo foi mais surpreendente?', chick: 'Pipoca cuidou do ritmo. Como vocês estão se sentindo agora?' };
    $('#finish-mission').onclick = () => {
      if (pack.missions.some(x => x.id === m.id)) {
        const groupNotes = [0, 1, 2].map(i => ($(`#group-note-${i}`)?.value || '').trim().slice(0, 200));
        completed[m.id] = { title: m.title, note: $('#reflection').value.trim(), date: new Date().toLocaleDateString('pt-BR'), groupNotes };
        save(); renderMap();
        // Bloom: anima a node do mapa e o contador de progresso.
        const plantedNode = document.querySelector(`[data-mission="${m.id}"]`);
        if (plantedNode) { plantedNode.classList.add('just-planted'); plantedNode.addEventListener('animationend', () => plantedNode.classList.remove('just-planted'), { once: true }); }
        $('#progress-count').classList.remove('progress-pop'); void $('#progress-count').offsetWidth; $('#progress-count').classList.add('progress-pop');
      }
      $('#mission-dialog').close(); toast(plantMessages[m.character] || 'Descoberta plantada. Que tal compartilhar com o grupo?');
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
  // Mural do Grupo: exibe vozes coletivas salvas, além da descoberta individual.
  $('#journal-content').innerHTML = entries.length ? entries.map(m => `<article class="journal-card"><small>❧ DESCOBERTA PLANTADA${completed[m.id].date ? ` · ${completed[m.id].date}` : ''}</small><h2>${esc(m.title)}</h2><p>${esc(completed[m.id].note || 'Explorei esta missão. Minha descoberta ficou na conversa com o grupo.')}</p>${(completed[m.id].groupNotes || []).filter(n => n).map(n => `<blockquote class="group-note">${esc(n)}</blockquote>`).join('')}</article>`).join('') : '<div class="empty-state"><img src="/assets/chick.svg" alt="Pipoca"><h2>Seu caderno começa com curiosidade.</h2><p>Explore uma parada do mapa e registre o que descobriu. Pode ser uma frase, uma dúvida ou uma nova ideia.</p><button class="primary" id="back-map">Ir para o mapa →</button></div>';
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
// Caderno com identidade visual: gera HTML estilizado com tipografia e cores do produto.
$('#export-journal').onclick = () => {
  const entries = pack.missions.filter(m => completed[m.id]);
  const cards = entries.length
    ? entries.map(m => {
        const e = completed[m.id];
        const groupLines = (e.groupNotes || []).filter(n => n).map(n => `<blockquote style="margin:8px 0 0;padding:5px 10px;border-left:3px solid #c8d4b5;font-style:italic;color:#627060;font-size:13px">${esc(n)}</blockquote>`).join('');
        return `<article style="border:1px solid #e0e2d4;border-radius:18px;padding:24px;background:#fffdf7;break-inside:avoid"><small style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:#758667">❧ DESCOBERTA PLANTADA${e.date ? ` · ${e.date}` : ''}</small><h2 style="font-size:22px;margin:8px 0 12px;letter-spacing:-.04em">${esc(m.title)}</h2><p style="font-size:13px;white-space:pre-wrap;color:#283d31">${esc(e.note || 'Minha descoberta ficou na conversa com o grupo.')}</p>${groupLines}</article>`;
      }).join('')
    : `<p style="color:#677064">Nenhuma descoberta registrada ainda.</p>`;
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Meu Caderno de Descobertas</title><style>body{font-family:ui-rounded,'Trebuchet MS',sans-serif;background:#faf8f1;color:#283d31;max-width:720px;margin:40px auto;padding:0 24px}h1{font-size:30px;letter-spacing:-.05em;margin-bottom:4px}p.sub{font-size:12px;color:#677064;margin-bottom:32px}section{display:grid;gap:16px}</style></head><body><h1>Meu Caderno de Descobertas</h1><p class="sub">${esc(pack.title)} · ${entries.length} ${entries.length === 1 ? 'descoberta' : 'descobertas'}</p><section>${cards}</section></body></html>`;
  download('meu-caderno-quintal.html', html, 'text/html');
  toast('Caderno preparado. Abra o arquivo no navegador para ler ou imprimir.');
};
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
// Navbar sticky: adiciona sombra suave ao rolar.
const topbar = $('#topbar');
if (topbar) {
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
renderMap();
// QW6: avisa sobre progresso descartado ao trocar de expedição, em vez de perder silenciosamente.
if (lostProgressCount > 0) toast(`${lostProgressCount} descoberta${lostProgressCount > 1 ? 's anteriores não foram encontradas' : ' anterior não foi encontrada'} nesta expedição. Baixe o caderno antes de trocar de expedição para não perder suas anotações.`);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => { /* A experiência online independe do cache offline. */ });
