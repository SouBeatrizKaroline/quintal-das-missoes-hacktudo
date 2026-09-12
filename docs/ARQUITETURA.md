# Arquitetura e operação

## Duas superfícies independentes

O jogo é servido por `server.js`, que expõe somente a pasta `public`. Não importa o módulo Gemini, não fornece endpoint de geração e não lê variáveis de API. O código do navegador mantém a atividade e o caderno localmente.

A oficina é servida por `teacher-server.js` em outro processo e porta. Escuta apenas `127.0.0.1`. A rota `POST /api/mission` exige uma senha Bearer com no mínimo 20 caracteres. O valor fica em `.env`, nunca no pacote do jogo. A senha não é armazenada pelo aplicativo no navegador. Ela protege chamadas, mas não substitui um sistema de identidade institucional.

## Geração

1. O educador escolhe cinco opções predefinidas: componente, tema, ano, duração e recurso.
2. O servidor verifica combinações e reconstrói o objeto permitido. Campos extras não são enviados ao Google.
3. O backend faz uma chamada HTTPS a `generativelanguage.googleapis.com`, com a chave em cabeçalho.
4. O modelo recebe instruções de segurança, inclusão e alternância de tela. A resposta usa esquema JSON.
5. O resultado é validado novamente no servidor. Respostas incompletas não viram missões utilizáveis.
6. O educador revisa textos e confirma a adequação. Qualquer edição desmarca a confirmação.
7. O arquivo exportado é aberto manualmente no jogo e validado. Não ocorre sincronização entre processos.

Há timeout de 25 segundos no provedor, limite de 4 KB na solicitação, uma geração simultânea e até cinco tentativas por minuto por processo. O limite fica somente em memória. Reiniciar o servidor o zera; não é controle de gastos para uma implantação pública.

O modelo padrão é `gemini-3.6-flash`, selecionado após uma resposta real do Google indicar indisponibilidade de 2.5 Flash para novos usuários desta chave. O endpoint `generateContent` permanece funcional no teste de 12/09/2026, mas está documentado como legado. A camada isolada em `src/gemini.js` facilita futura migração. Não há fallback silencioso entre modelos ou conteúdo inventado para encobrir falhas.

## Dados locais

O padrão é memória da aba. Recarregar perde progresso se a opção de guardar não estiver marcada. Quando ativada, `localStorage` contém apenas a expedição importada e as anotações opcionais, sob a chave `quintal-caderno-v1`. A opção de apagar remove esse registro. O navegador, seus backups ou um dispositivo compartilhado têm condições próprias de acesso; o caderno local não é criptografado.

O service worker armazena apenas arquivos estáticos conhecidos. Não faz cache de API, senhas, respostas do Gemini ou anotações. O primeiro acesso precisa concluir o carregamento. Offline requer HTTPS ou localhost e suporte do navegador. Não há garantia de preservação se o navegador limpar dados.

## Operação local

O jogo usa a porta 3000 e a oficina 3001 por padrão. Configure `PORT` e `TEACHER_PORT` em `.env` se houver conflito. A demonstração nesta máquina usa 4317 para evitar outro serviço já existente; os testes usam 4317 e 4318.

Para demonstrar em outro aparelho na mesma rede, é possível definir `GAME_HOST=0.0.0.0` apenas para o jogo. O cache offline não funciona normalmente por HTTP em IP de rede. Para uma distribuição escolar real, usar HTTPS e revisar a hospedagem. A oficina não possui opção de escutar em rede no protótipo.

O Dockerfile copia somente jogo e servidor estático, sem oficina, credencial ou dependência de desenvolvimento. A imagem não foi executada neste ambiente; há teste dos servidores Node, mas não validação de contêiner.

## Fora do escopo do MVP

Contas institucionais, salas sincronizadas, autenticação multifator, banco de dados, registros de auditoria institucional, painel analítico, integração ao diário escolar e implantação multiusuário. Uma versão futura deve justificar cada dado adicional e revisar termos do provedor antes de ampliar acesso. Não publicar a oficina local como um serviço para estudantes.
