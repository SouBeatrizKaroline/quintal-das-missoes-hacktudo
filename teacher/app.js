import { SUBJECTS, TOPICS, validateMission } from '/schema.js';
import { starterPack } from '/data.js';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let draft = null;
$('#subject').innerHTML = SUBJECTS.map(s => `<option>${s}</option>`).join('');
function topics() { $('#topic').innerHTML = TOPICS[$('#subject').value].map(s => `<option>${s}</option>`).join(''); }
$('#subject').onchange = topics; topics();
$('#generator').onsubmit = async e => {
  e.preventDefault();
  const button = $('#generate'); button.disabled = true; button.textContent = 'Preparando uma ideia...';
  $('#status').textContent = 'O Gemini está criando um rascunho. Isso pode levar alguns segundos.';
  try {
    const response = await fetch('/api/mission', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${$('#token').value}` }, body: JSON.stringify({ subject: $('#subject').value, topic: $('#topic').value, grade: $('#grade').value, minutes: Number($('#minutes').value), resources: $('#resources').value }), signal: AbortSignal.timeout(30000) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Não foi possível gerar.');
    loadDraft(result.mission, `Gemini • ${result.model}`);
    $('#status').textContent = 'Rascunho recebido. Revise e ajuste cada etapa antes de exportar.';
  } catch (err) { $('#status').textContent = err.name === 'TimeoutError' ? 'O tempo de espera terminou. Tente de novo ou use a missão pronta.' : err.message === 'Failed to fetch' ? 'Sem conexão com a oficina. Use a missão pronta.' : err.message; }
  finally { button.disabled = false; button.textContent = '✦ Criar rascunho com Gemini'; }
};
$('#load-example').onclick = () => { loadDraft(structuredClone(starterPack.missions[0]), 'Missão pronta • sem IA'); $('#status').textContent = 'Exemplo local aberto. Nenhuma chamada ao Gemini foi feita.'; };
function field(key, label, value, max=600, multiline=true) { return `<label for="${key}">${label}</label>${multiline ? `<textarea id="${key}" required minlength="3" maxlength="${max}">${esc(value)}</textarea>` : `<input id="${key}" required minlength="3" maxlength="${max}" value="${esc(value)}">`}`; }
function loadDraft(m, source) {
  draft = m; $('#empty').hidden = true; $('#review-form').hidden = false; $('#source').textContent = source; $('#reviewed').checked = false; $('#review-status').textContent = '';
  $('#fields').innerHTML = field('title','Nome da missão',m.title,80,false) + field('objective','Objetivo de aprendizagem',m.objective) + field('materials','Materiais disponíveis',m.materials) + m.steps.map((s,i) => `<h3 class="step-heading">Etapa ${i+1}: ${s.mode === 'screen' ? 'com o aparelho' : s.mode === 'away' ? 'fora da tela' : 'em conversa'}</h3>${field(`step-title-${i}`,'Título da etapa',s.title,80,false)}${field(`step-text-${i}`,'Orientação para o grupo',s.text)}`).join('') + field('offline','Alternativa equivalente em papel',m.offline) + field('reflection','Pergunta para reflexão',m.reflection);
  $('#fields').querySelectorAll('input,textarea').forEach(el => el.addEventListener('input', () => { $('#reviewed').checked = false; $('#review-status').textContent = ''; }));
}
$('#review-form').onsubmit = e => {
  e.preventDefault();
  if (!draft || !$('#reviewed').checked) return;
  const m = { ...draft };
  for (const key of ['title','objective','materials','offline','reflection']) m[key] = $(`#${key}`).value.trim();
  m.steps = draft.steps.map((s,i) => ({ ...s, title: $(`#step-title-${i}`).value.trim(), text: $(`#step-text-${i}`).value.trim() }));
  if (!validateMission(m)) { $('#review-status').textContent = 'Revise os campos. Use textos completos, sem sinais de código, com uma etapa fora da tela.'; return; }
  const pack = { version:1, reviewed:true, title:m.title, missions:[m] };
  const url = URL.createObjectURL(new Blob([JSON.stringify(pack,null,2)], { type:'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'quintal-missao-revisada.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  $('#review-status').textContent = 'Arquivo preparado. Leve para o jogo e abra em “Missões da minha turma”.';
};
