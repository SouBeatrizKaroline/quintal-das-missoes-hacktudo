# Privacidade e segurança

## Credenciais

- Configure `GEMINI_API_KEY` somente no ambiente do servidor da oficina.
- Use `TEACHER_TOKEN` separado, gerado por `npm run setup`, com pelo menos 20 caracteres.
- Nunca use prefixos de exposição ao frontend, como `VITE_` ou `NEXT_PUBLIC_`, para a chave.
- `.env` e variantes estão no `.gitignore` e no `.dockerignore`. Revise `git diff --cached` antes de publicar.
- Chaves compartilhadas em mensagens ou outros canais devem ser substituídas antes de uso real. Não basta excluir o texto de um commit caso uma chave já tenha entrado no histórico.
- Não coloque credenciais em capturas de tela, issues, URLs ou arquivos JSON de missão.

## Superfícies

O jogo serve apenas `public/`. Caminhos ocultos, travessia de diretórios e métodos de escrita não são disponibilizados. A oficina aceita somente host e origem locais previstos, exige autenticação na geração e limita tamanho, concorrência e frequência das solicitações.

Os servidores enviam Content Security Policy restrita à própria origem, proteção contra enquadramento e políticas que negam câmera, microfone e localização. A renderização escapa textos e a importação rejeita marcação HTML. Links de fontes são fixos e só são acessados por escolha do usuário.

## Dados e terceiros

O jogo não faz analytics, não cria cadastro e não envia o caderno ao servidor. Requisições HTTP ainda expõem dados técnicos de conexão ao servidor ou a uma futura hospedagem. Este código não mantém logs de acesso. Não há garantia sobre provedores de hospedagem externos.

A oficina envia somente opções curriculares predefinidas ao Google. O valor dos campos extras é descartado. As edições livres feitas na revisão não são reenviadas à IA. Nos serviços gratuitos, os termos do Google permitem usos dos dados para desenvolvimento de produtos. Por isso não há campo para nomes, relatos, diagnósticos ou produções identificáveis de estudantes.

## Limites da proteção

A senha local não identifica institucionalmente um educador nem comprova idade. A oficina deve funcionar em equipamento controlado por um adulto autorizado e não ser publicada para estudantes. A marca `reviewed` é autodeclarada. O protótipo não oferece criptografia de caderno, proteção contra alguém com acesso ao navegador nem gerenciamento de usuários.

Antes de um piloto real, a instituição precisa avaliar o desenho e os termos vigentes. Não há promessa de conformidade automática com legislação ou política escolar.

## Reportar problema

Use um canal privado com a titular deste repositório. Descreva o comportamento e um exemplo sem dados reais. Não publique chaves, senhas, anotações de estudante ou dados pessoais em issues.
