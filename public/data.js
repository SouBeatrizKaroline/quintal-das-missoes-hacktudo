export const characters = [
  { id: 'cat', name: 'Mimo', kind: 'o gato curioso', role: 'Investigar', color: 'purple', phrase: 'Uma boa pergunta abre mais caminhos que uma resposta pronta.' },
  { id: 'dog', name: 'Bento', kind: 'o cão parceiro', role: 'Colaborar', color: 'orange', phrase: 'Eu cuido da vez de cada pessoa. Toda voz tem lugar aqui.' },
  { id: 'hen', name: 'Cora', kind: 'a galinha inventora', role: 'Criar', color: 'pink', phrase: 'E se a gente experimentasse de outro jeito?' },
  { id: 'rooster', name: 'Zeca', kind: 'o galo das ideias', role: 'Compartilhar', color: 'green', phrase: 'Uma ideia fica melhor quando a gente explica como chegou nela.' },
  { id: 'chick', name: 'Pipoca', kind: 'o pintinho do respiro', role: 'Cuidar', color: 'yellow', phrase: 'Seu ritmo também faz parte da aventura.' }
];
export const starterPack = {
  version: 1, reviewed: true, title: 'Guardiões da água',
  missions: [
    { id: 'pista', title: 'De onde vem essa gota?', character: 'cat', minutes: 10, objective: 'Levantar hipóteses sobre o caminho da água e distinguir o que sabemos do que precisamos investigar.', materials: 'Papel e lápis. Um celular para o grupo, se houver.', offline: 'O educador lê o desafio em voz alta. O grupo desenha o percurso em papel e marca suas dúvidas com um ponto de interrogação.', reflection: 'Qual parte do caminho vocês conhecem e qual ainda precisa de uma fonte confiável?', steps: [
      { title: 'Uma pista no quintal', mode: 'screen', text: 'Imaginem a água que chega à torneira da escola. Antes de abrir, por quais lugares ela passou? Leiam juntos e escolham quem desenha, quem pergunta e quem apresenta.' },
      { title: 'Desenhem o caminho', mode: 'away', text: 'Deixem o celular de lado. Em papel, desenhem o caminho que imaginam, da origem até a torneira. Marquem as incertezas. Não abram torneiras nem saiam do espaço combinado.' },
      { title: 'Uma pergunta que vale a viagem', mode: 'together', text: 'Cada pessoa acrescenta uma dúvida. Escolham uma para investigar com o educador e expliquem por que ela importa. Não é preciso acertar tudo agora.' }
    ] },
    { id: 'ponte', title: 'Toda gota pede parceria', character: 'dog', minutes: 10, objective: 'Propor uma ação coletiva viável para o consumo consciente de água.', materials: 'Papel, lápis e conversa em grupo.', offline: 'Copiem o cenário no quadro: uma torneira continua pingando. Organizem propostas e responsabilidades em papel.', reflection: 'Como a proposta de vocês inclui quem não tem celular?', steps: [
      { title: 'Um problema, várias vozes', mode: 'screen', text: 'Cenário fictício: uma torneira fica pingando depois do recreio. O que a turma pode fazer com segurança? Cada pessoa terá uma vez para contribuir.' },
      { title: 'Façam um acordo possível', mode: 'away', text: 'Guardem o aparelho. Em grupo, escolham uma ação e quem pode ajudar a realizá-la. Não façam consertos: comuniquem problemas a um adulto responsável.' },
      { title: 'Testem a ideia em conversa', mode: 'together', text: 'Uma pessoa apresenta a proposta, outra aponta uma dificuldade e uma terceira sugere um ajuste. Troquem os papéis na próxima missão.' }
    ] },
    { id: 'atelie', title: 'Uma ideia sai do ovo', character: 'hen', minutes: 15, objective: 'Criar uma mensagem clara que convide a comunidade a cuidar da água.', materials: 'Papel e lápis de cor, se disponíveis.', offline: 'Criem o cartaz inteiramente em papel. A leitura em voz alta substitui qualquer recurso digital.', reflection: 'A mensagem convida a agir sem culpar ou constranger alguém?', steps: [
      { title: 'O desafio da Cora', mode: 'screen', text: 'Criem um minicartaz com uma ação concreta para cuidar da água na escola. Ele precisa ser entendido em uma leitura rápida e não pode inventar números.' },
      { title: 'Mãos à obra', mode: 'away', text: 'Com o aparelho descansando, rascunhem um título, uma ilustração e uma ação. Prefiram letras grandes e bom contraste. Usem materiais que já estão disponíveis.' },
      { title: 'Teste com outro grupo', mode: 'together', text: 'Mostrem o rascunho a outra pessoa. Peçam que diga qual ação entendeu. Ajustem a mensagem se necessário. O educador decide se e onde o cartaz pode circular.' }
    ] },
    { id: 'praca', title: 'Cocoricó, tenho uma ideia!', character: 'rooster', minutes: 10, objective: 'Explicar uma proposta com razões e escutar uma contribuição diferente.', materials: 'O desenho ou cartaz da missão anterior, ou uma ideia contada oralmente.', offline: 'Façam uma roda de conversa. Cada grupo apresenta sua ideia usando a própria voz ou apontando para um desenho.', reflection: 'O que mudou na sua ideia depois de ouvir outra pessoa?', steps: [
      { title: 'Preparem a roda', mode: 'screen', text: 'Escolham uma ideia sobre o cuidado com a água. Organizem a apresentação: o que propomos, por que isso ajuda e de que apoio precisamos.' },
      { title: 'Ensaio sem tela', mode: 'away', text: 'Deixem o celular descansar e ensaiem uma apresentação curta. É possível falar, desenhar ou pedir que um colega leia. Ninguém precisa ser filmado.' },
      { title: 'Ideias em circulação', mode: 'together', text: 'Compartilhem com a turma. Quem escuta oferece uma pergunta ou sugestão respeitosa. Registrem uma melhoria possível, sem escolher um grupo vencedor.' }
    ] },
    { id: 'respiro', title: 'Pausa também é caminho', character: 'chick', minutes: 3, objective: 'Reconhecer o próprio ritmo e escolher uma estratégia simples de pausa.', materials: 'Um lugar confortável dentro do espaço combinado.', offline: 'O educador lê o convite. Cada pessoa escolhe descansar o olhar, alongar suavemente ou ficar em silêncio.', reflection: 'O que ajudou você a voltar para a atividade no seu ritmo?', steps: [
      { title: 'Um convite da Pipoca', mode: 'screen', text: 'Como está seu ritmo agora? Você pode fazer uma pausa, pedir ajuda ou continuar depois. Não precisa contar à turma como está se sentindo.' },
      { title: 'Olhe para além da tela', mode: 'away', text: 'Se for confortável, descanse o olhar em algo distante ou solte os ombros. Respire no seu ritmo, sem prender o ar. Você também pode apenas ficar em silêncio.' },
      { title: 'Escolha seu próximo passo', mode: 'together', text: 'Pense no que você precisa para seguir. Se quiser, peça apoio ao educador. A pausa pode terminar agora ou continuar um pouco mais, conforme o combinado da turma.' }
    ] }
  ]
};
