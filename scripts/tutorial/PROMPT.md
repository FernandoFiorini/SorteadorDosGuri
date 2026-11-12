# Tutorial de campeão: prompt e passo a passo

Mesma lógica do roteiro do canal (`Canal youtube dark/roteiros`), adaptada ao
"📖 Como jogar" do sorteador: em vez de narração contínua, cada vídeo curto tem
um texto embaixo, e o resto vira as abas **Como jogar** e **Build**.

## Passo a passo

1. Peça aqui no Claude: **"roteiro de gravação do <campeão> <rota>"**. Sai um checklist
   `scripts/tutorial/roteiros/<campeao>-<rota>.html` (fora do Git): abra no navegador, marque
   Pendente / Gravado / Refazer em cada clipe, preencha build, runas e matchups e use
   **Copiar resumo** para colar aqui depois. Modelo: `scripts/tutorial/modelo-gravacao.html`.
   (Ou use o prompt abaixo em outra IA.)
2. Grave os clipes na Ferramenta de Treino e numa partida, salvando em
   `D:\Tutoriais LOL\<Campeão>\` (o nome do arquivo pode ser livre, tipo
   `Basic combo q + e.mp4`; na hora de subir eles são renomeados).
3. Peça aqui no Claude: **"tutorial do <campeão>"**. Ele comprime os vídeos para
   `tutoriais/<campeao>/`, monta a entrada em `js/tutorials.js` e confere os
   nomes de itens e runas com a lista oficial.
4. Revise os textos no site (Ctrl+F5) e ajuste o que quiser em `js/tutorials.js`.

## Prompt

```
Monte o tutorial do campeão <CAMPEÃO> (League of Legends, rota <ROTA>) para o
"Como jogar" de um site de sorteio de campeões entre amigos.
Português do Brasil, tom descontraído e direto, para iniciantes. Frases curtas.

Entregue em 2 partes:

PARTE 1 — LISTA DE GRAVAÇÃO
Clipes curtos (3 a 12 s cada), com o nome de arquivo sugerido:
- passiva.mp4, q.mp4, w.mp4, e.mp4, r.mp4 — cada skill sozinha, em boneco de treino
- 2 combos básicos: combo-<teclas>.mp4 (ex.: combo-q-e.mp4)
- 1 ou 2 combos avançados: combo-<teclas>.mp4 (vão tocar em câmera lenta 0,75x)
- 1 ou 2 dicas mecânicas do campeão: dica-<assunto>.mp4
- jogada.mp4 — um lance de partida juntando tudo (o momento mais impressionante)
Para cada clipe: o que fazer na gravação e onde (Ferramenta de Treino ou partida).

PARTE 2 — BLOCO PARA O SITE (objeto JavaScript, pronto para colar em TUTORIALS)
- habilidades P, Q, W, E, R: 1 a 2 frases cada, explicando o que faz e para que serve
- extras: os combos (grupo "Combos", com teclas ["Q","E"] etc. e velocidade: 0.75
  nos avançados), as dicas (grupo "Dicas") e a jogada (grupo "Na partida")
- guia:
  - fases: "Fase de rotas", "Nível 6", "Lutas em equipe" (1 a 2 frases cada)
  - fortes: 2 pontos fortes / fracos: 2 pontos fracos
  - dificeis: 3 matchups difíceis e faceis: 3 fáceis, com o ID do campeão
    (como no Data Dragon: "Yasuo", "MonkeyKing") e o motivo em 1 frase
  - dicaDeOuro: 1 frase
- builds: 1 build padrão do patch atual com inicial, core (em ordem), situacional,
  runas { principal (a primeira é a principal), secundaria } e skills (ordem de upar),
  usando os NOMES EXATOS em português do jogo, e um texto curto de quando trocar itens

Siga o formato do campeão Katarina já existente em js/tutorials.js.
```

## Formato da entrada (resumo)

```js
<IdDoCampeao>: {
    pasta: "tutoriais/<campeao>/",
    builds: [{ titulo, inicial: [], core: [], situacional: [], runas: { principal: [], secundaria: [] }, skills: [], texto }],
    guia: { fases: [{ titulo, texto }], fortes: [], fracos: [], dificeis: [{ campeao, motivo }], faceis: [], dicaDeOuro },
    habilidades: { P: { video, texto }, Q: {...}, W: {...}, E: {...}, R: {...} },
    // skill com mais de um vídeo (ex.: E normal + E resetando):
    // E: { video, tituloPrincipal, texto, variacoes: [{ titulo, video, texto }] },
    extras: [{ grupo, titulo, teclas: [], video, velocidade?, texto }]
}
```

Tudo é opcional menos `pasta` e `habilidades`: aba sem dados não aparece.
