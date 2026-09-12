export const SUBJECTS = ['Ciências', 'Língua Portuguesa', 'Matemática', 'História', 'Geografia'];
export const TOPICS = {
  'Ciências': ['Água e consumo consciente', 'Biodiversidade no entorno'],
  'Língua Portuguesa': ['Fato, opinião e fonte', 'Narrativas coletivas'],
  'Matemática': ['Frações no cotidiano', 'Estimativas e medidas'],
  'História': ['Memória e fontes históricas', 'Mudanças no cotidiano'],
  'Geografia': ['Mapas e pontos de referência', 'Paisagens e transformações']
};
export const CHARACTERS = ['cat', 'dog', 'hen', 'rooster', 'chick'];
const clean = (s, min = 3, max = 600) => typeof s === 'string' && s.trim().length >= min && s.length <= max && !/[<>\u0000-\u0008]/.test(s);
export function validateMission(m) {
  return !!m && clean(m.id, 1, 50) && /^[a-z0-9-]+$/.test(m.id) && !['constructor','prototype','__proto__'].includes(m.id) && clean(m.title, 3, 80) && clean(m.objective) && clean(m.offline) && clean(m.reflection) && clean(m.materials) && CHARACTERS.includes(m.character) && Number.isInteger(m.minutes) && m.minutes >= 3 && m.minutes <= 30 && Array.isArray(m.steps) && m.steps.length === 3 && m.steps.every((s,i) => !!s && clean(s.title, 3, 80) && clean(s.text) && s.mode === ['screen', 'away', 'together'][i]);
}
export function validatePack(p) {
  return !!p && p.version === 1 && p.reviewed === true && clean(p.title, 3, 80) && Array.isArray(p.missions) && p.missions.length >= 1 && p.missions.length <= 5 && p.missions.every(validateMission) && new Set(p.missions.map(m => m.id)).size === p.missions.length;
}
