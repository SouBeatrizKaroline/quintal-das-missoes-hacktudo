# Cuidando do quintal

Antes de alterar uma experiência, pergunte se ela ajuda alguém a aprender, participar ou mediar. Uma nova tela, métrica ou coleta precisa de uma justificativa pedagógica clara.

## Desenvolvimento

Use Node.js 22 ou superior. Execute `npm ci`, `npm run check`, `npm test` e `npm run test:e2e` após mudanças funcionais. Para instalar o navegador de testes: `npx playwright install chromium`. As dependências de execução continuam vazias; Playwright é apenas desenvolvimento.

Mantenha a oficina separada do jogo. Nunca adicione uma chamada Gemini ao frontend de estudantes. Não inclua dados pessoais em fixtures, prompts ou commits.

## Conteúdo e interface

- Escreva em português brasileiro, com frases concretas e sem travessão.
- Preserve avanço livre, pausas e alternativas em papel.
- Não transforme participação autodeclarada em nota ou medida de atenção.
- Não acrescente ranking, sequência diária obrigatória, punição ou recompensa aleatória.
- Teste teclado, telas pequenas, contraste, texto longo e ausência de internet.
- Identifique exemplos, hipóteses e limitações. Não invente fontes, métricas ou resultados.

Os SVGs são gerados por `scripts/make-art.mjs`. Edite a fonte e execute o script para manter a arte reproduzível. Capturas de documentação devem mostrar a interface real e nunca incluir credenciais.

## Revisão de mudanças

Explique o problema, o comportamento resultante e o que foi verificado. Mostre capturas quando alterar a interface. Respeite a licença privada do projeto e as licenças das fontes e ferramentas.
