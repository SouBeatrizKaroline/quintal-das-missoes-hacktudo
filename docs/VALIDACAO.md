# Registro de validação

Verificação local realizada em 12/09/2026, com Node.js 24.19.0 no Windows e Chromium controlado por Playwright. A automação do repositório usa Node.js 22 no Ubuntu.

## Resultados observados

| Verificação | Resultado |
| --- | --- |
| Testes de regras e integração simulada | 6 testes aprovados |
| Fluxos no navegador | 7 testes aprovados |
| Sintaxe, arquivos visuais e busca de possíveis segredos | Aprovados |
| Chamada real ao Google Gemini | Aprovada com `gemini-3.6-flash` |
| Resposta real | Missão “Investigadores do Consumo Invisível de Água”, três etapas, revisão pendente |
| Viewport móvel de 390 × 844 | Sem transbordamento horizontal; lista e personagens disponíveis |
| Cache offline | Recarregamento e abertura de missão aprovados sem conexão |
| Impressão | Cinco roteiros presentes na versão de impressão |
| Fontes e imagens | Arquivos locais carregados; capturas reais em `docs/images/` |

Os seis testes de regras abrangem missões válidas, importações inválidas, restrição dos campos enviados, chave no cabeçalho, ausência de chave e respostas de falha. Os sete testes de navegador exercitam jornada completa, persistência opcional, foco e Escape, oficina e exportação/importação, impressão, offline, mobile e separação dos servidores.

Foi corrigida uma ambiguidade no seletor do teste móvel, que confundia o botão “A turma” com “Missões da minha turma”. O layout já apresentava largura correta; a seleção exata do botão resolveu o teste. A versão final passou nos sete fluxos.

## O que este registro não demonstra

Não houve piloto com estudantes, avaliação de aprendizagem, medição de foco, teste formal de usabilidade com educadores ou auditoria independente de segurança e acessibilidade. Não foi executada a imagem Docker. Os tempos do jogo são sugestões de roteiro e não observações de comportamento.

O teste real da API usou apenas opções curriculares predefinidas, sem dados de estudantes. A chave ficou na configuração local ignorada pelo Git. A chamada confirma integração na data do teste, não disponibilidade futura do provedor.

Capturas do desktop e do celular estão no repositório. O estado do GitHub Actions pode ser acompanhado na aba Actions; seus testes não precisam de credenciais Gemini.
