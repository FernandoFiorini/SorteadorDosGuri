# 🧉 Sorteador dos Guri

### Quer perder neurônio, é aqui mesmo.

👉 **Acesse:** https://fernandofiorini.github.io/SorteadorDosGuri/

Cansou de jogar sempre com os mesmos campeões? Só escuta que teu amigo fala, jogo muito com esse boneco?

**Seus problemas acabaram. Agora a loucura vai reinar.**

Aqui, você sorteia os jogadores, as lanes e os campeões. Tudo aleatório, tudo caótico e, principalmente, tudo culpa do nardi.

---

## 🤡 Funcionalidades

### 🎰 Full Random

* Sorteie campeões e lanes automaticamente.
* Embaralhe os jogadores para acabar com aquela história de "eu sempre caio de suporte".
* Escolha manualmente as lanes se ainda tiver alguma esperança de controle sobre sua vida.
* Animações de sorteio para aumentar o suspense antes da tragédia.

### 🚫 Lista de banimentos pessoais

Tem um amigo que só joga de Teemo?

Yummi nem é campeão?

Exclua os campeões que você não quer ver no sorteio.

*Infelizmente, ainda não é possível desligar o pc dos amigos.*

### 🔄 Rotação de lanes

Ative a rotação para evitar que o mesmo jogador fique preso na mesma lane em partidas consecutivas.

Porque ninguém merece jogar cinco partidas seguidas de suporte (pitty).

O sistema registra as lanes já utilizadas e reinicia o ciclo quando necessário.

### 🚷 Sem campeões repetidos

Ative essa opção para impedir que o mesmo campeão apareça mais de uma vez no sorteio.

Cinco jogadores. Cinco campeões diferentes. Cinco novas maneiras de perder a partida.

Com **"Não repetir campeões já sorteados"**, a lista fica salva no navegador entre um sorteio e outro: ninguém pega o mesmo boneco até a lista ser resetada.

### 🧪 Listas temáticas (pools)

Marque uma ou mais listas prontas (Veneno, Sangramento, Fogo, Tankudini, Velocidade...) e o sorteio usa só os campeões delas.

Para criar uma lista nova, adicione um item em `championPools`, no arquivo `js/pools.js`.

### 🔁 Resortear e entrar no meio

* **🔄 Resortear**: troca só o campeão de uma lane, sem mexer no resto.
* **➕ Alguém quer entrar no time?**: sorteia só o jogador novo, numa lane livre, sem refazer o sorteio dos outros.

### 🔊 Efeitos sonoros personalizados

Cada lane sorteia também um áudio aleatório dentre os presentes no projeto

**VAI SER UMA LOUCURA**

Para adicionar um áudio: coloque o `.mp3` na pasta `sons/` e acrescente uma linha em `soundList`, no arquivo `js/sounds.js`. Para transformar um clipe de vídeo em MP3 sem instalar nada (usa o conversor do próprio Windows):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\audio\converter-mp3.ps1 `
    -InPath "C:\caminho\completo\clip.mp4" -OutPath "C:\caminho\do\projeto\sons\nome.mp3"
```

### 📡 Sorteio ao vivo

Quer fazer o sorteio com todo mundo acompanhando, sem compartilhar a tela do Discord (BRASIL BRASIL) e sem ouvir o clássico "eu não vou com isso ai, sorteia de novo"?

* Criação de salas com códigos aleatórios.
* Compartilhamento de link para espectadores.
* Atualização dos resultados em tempo real.
* Animação dos resultados também para quem está assistindo.
* **👍 / 👎** em cada campeão sorteado, para a galera votar se o boneco presta.
* **💬 Chat da sala** numa janelinha no canto inferior direito. Minimizado, mostra quantas mensagens não foram lidas (e o número aparece no título da aba).

Agora todos podem testemunhar a loucura acontecendo.

### 🕒 Histórico das partidas

Consulte os últimos 20 sorteios, com jogadores, lanes, campeões e horário.

Para documentar a rotação de campeões da equipe.

Ou para provar que o Pitty caiu de Suporte sete vezes e continua reclamando.

### 📊 Estatísticas

Tudo que é sorteado vira prova contra você. As estatísticas juntam as partidas de todas as salas e se dividem em abas:

* **👥 Jogadores**: partidas, vitórias, derrotas, win%, KDA, ouro, dano, farm, visão, campeão mais sorteado e lane mais jogada.
* **⚔️ Lanes**: win% de cada lane, para descobrir qual delas é amaldiçoada.
* **🛡️ Campeões**: quantas vezes saiu, 👍/👎 da galera, resorteios e desempenho.
* **🏆 Conquistas**: títulos, recordes e medalhas (veja abaixo).

Vitória e derrota chegam sozinhas ao clicar em **🔄 Atualizar partidas**. Se a partida não rolou, marque **🚫 Não deu jogo**: ela some de todas as estatísticas. Recriação (jogo que acabou antes de 5 minutos) vira "Não deu jogo" automaticamente. Partida sem resultado conta no total, mas não em vitórias e derrotas.

Os números de KDA, ouro, dano, wards e afins vêm da Riot (veja [Dados da Riot](#6-dados-da-riot-opcional)). Depois de jogar, aperte **🔄 Atualizar partidas** nas estatísticas: a partida é ligada ao sorteio e o resultado é marcado sozinho.

### 🏆 Conquistas

#### 🎖️ Ranking dos guri (XP e elo)

Cada um soma XP pelo que está segurando **agora**. Perdeu o título, perdeu o XP: dá para subir e cair de elo conforme as partidas acontecem.

| Fonte | XP |
| ----- | -- |
| Título de glória | +10 |
| Medalha 🥉 / 🥈 / 🥇 | +5 / +10 / +20 |
| Emblema permanente | +10 |
| Título de vergonha | −5 |

⚖️ **Título dividido (empate) vale metade do XP para cada dono**: +5 na glória e −2,5 na vergonha. Os recordes 🐐 Paulinho Molina e 🍼 Feedamento **não valem XP**; são só um indicativo na listagem de jogadores.

| Elo | XP mínimo |
| --- | --------- |
| 🔩 Ferro | — |
| 🟤 Bronze | 10 |
| ⚪ Prata | 25 |
| 🟡 Ouro | 45 |
| 💠 Platina | 75 |
| 💎 Diamante | 110 |
| 🔮 Mestre | 160 |
| ⚜️ Desafiante | 350 (quase todos os títulos, medalhas e emblemas) |

O ícone do elo aparece do lado do nick (listagem de jogadores, tabela de estatísticas e sorteio), e quem está com o site aberto vê um aviso quando alguém sobe ou cai. Os valores ficam em `XP_RULES` e `ELO_TIERS`, no arquivo `js/achievements.js`.

#### 👑 Títulos da casa

Cada título tem um dono só: quem tem o maior número leva, e empate divide. O título troca de mão sozinho conforme as partidas acontecem.

* Duas abas: **👑 Glória** (Mata mais que a fome, Dono da lojinha de ward, Filho do vorcaro...) e **💀 Vergonha** (Assinante da tela cinza, Mais cego que não sei o que, Ward é item de luxo...).
* Títulos agrupados por categoria (Combate, Visão e time, Objetivos, Rotina), e cada categoria pode ser minimizada.
* Cada card mostra o dono e quem vem logo atrás, em 2º e 3º, para saber quem está na cola.
* No topo, um pódio com os 3 que mais têm títulos (e o pódio da vergonha na outra aba).
* Títulos por média (KDA, farm/min, visão por partida...) exigem pelo menos 5 partidas com dados da Riot.

#### 🔄 Recordes de uma partida

Duas medalhas que trocam de dono quando alguém faz uma partida melhor (ou pior) que a do recordista. Cada atuação ganha uma nota de 0 a 10 comparando KDA, mortes, ouro/min, dano/min, participação nos abates e visão/min com todas as partidas do grupo. Só contam partidas ligadas à Riot, com 15 minutos ou mais.

| Recorde | Quem leva | Efeito no nick |
| ------- | --------- | -------------- |
| 🐐 Melhor Paulinho Molina já registrado | Maior nota numa partida só | Borda azul pulsando em volta do nick |
| 🍼 Maior feedamento já registrado | Menor nota numa partida só | Borda verde pulsando em volta do nick |

#### 📜 Linha do tempo e avisos

* **Linha do tempo** (aba Conquistas): quem segura cada título há mais tempo e as últimas trocas de dono, refeitas partida a partida.
* **🚨 Aviso de troca de dono**: quem está com o site aberto vê um aviso no topo quando um título ou recorde muda de mão, tipo "Fer tomou 🏹 ... de Valde".
* **🏁 Resumo da partida**: quando a Riot liga a partida sorteada, aparece abaixo do resultado a nota de cada um, o 🐐 MVP e o 🍼 pior da partida.

#### 🎖️ Medalhas (badges)

Metas pessoais: cada um desbloqueia a sua, e a recompensa é um efeito no nick **em todo o site** (títulos, tabelas e listas).

As medalhas têm 3 níveis. Quanto maior o nível, mais forte o efeito:

| Medalha | 🥉 Bronze | 🥈 Prata | 🥇 Ouro |
| ------- | --------- | -------- | ------- |
| 👑 Lenda dos guri (jogar) | 25 partidas: nick dourado | 50: degradê dourado | 100: dourado brilhando |
| 🏆 Bafeador supremo (ganhar) | 25 vitórias: nick verde | 50: verde com brilho | 100: verde pulsando |
| 🫏 Mais burro já registrado (perder) | 25 derrotas: nick vermelho | 50: palhaço trocando de cor | 100: palhaço trocando de cor e balançando |

| Combo | Meta | Efeito no nick |
| ----- | ---- | -------------- |
| 🔥 Combo de 2 | 2 medalhas no Ouro | Nick em chamas |
| ✨ Combo supremo | As 3 medalhas no Ouro | Ouro maciço, com reflexo, halo e estrelas |

Se a pessoa tem mais de uma medalha (sem combo), vale o efeito da de maior nível.

**Emblemas permanentes**: não mudam a cor, aparecem como um ícone pequeno ao lado do nick.

| Emblema | Meta |
| ------- | ---- |
| 🌍 Rodou o mapa | Jogar 10 partidas em cada lane |
| 🎲 Pool infinita | Jogar com 50 campeões diferentes |
| 🖐️ Pentakill | Fazer um pentakill (fica para sempre) |

No sorteio, o card mostra só o nick com o efeito e uma moldura no nível da medalha, sem ícones. Elo, emblemas e recordes aparecem na listagem de jogadores.

Em **Medalhas por jogador**, cada um tem uma linha com o progresso de cada medalha (anéis), os títulos que tem agora e os recordes que está segurando. Clique na linha para ver os detalhes.

Os efeitos dos recordes ficam por fora do nick e combinam com os das medalhas: dá para ser Lenda dos guri e Maior feedamento ao mesmo tempo.

Para criar uma conquista nova, basta adicionar um item em `ACHIEVEMENT_TITLES`, `ACHIEVEMENT_BADGES` (com níveis) ou `EMBLEM_BADGES` (emblemas), no arquivo `js/achievements.js`. Os pesos da nota dos recordes ficam em `RECORD_METRICS`.

### 📖 Tutoriais dos campeões

Caiu um campeão que ninguém sabe jogar? Logo abaixo do resultado fica a seção **📖 Tutoriais**, com busca por nome, e o card de quem tem guia ganha o botão **📖 Como jogar** no sorteio. Cada tutorial abre uma janela com três abas:

* **🎬 Habilidades e combos:** um vídeo curto de cada skill (passiva, Q, W, E e R), com explicação embaixo. Skills com mais de um jeito de usar têm botões (forma normal e transformada, versão aprimorada, uso na parede...). Os combos vêm separados em **básicos** e **avançados**, e os avançados tocam em câmera lenta 🐢 0,75x. Tem ainda dicas e uma jogada de partida.
* **📋 Como jogar:** o que fazer na fase de rotas, no nível 6 e nas lutas, pontos fortes e fracos, matchups difíceis e fáceis (com o ícone de cada campeão) e a dica de ouro.
* **🛠️ Build:** itens à esquerda (inicial, principal em ordem, situacionais e último item, com escolhas do tipo "isso **ou** aquilo, quando...") e, à direita, feitiços, runas e a ordem de upar as skills. Embaixo, links para a build do momento no OP.GG e no U.GG.

O 🌙 **Aphelios** tem um painel próprio no estilo do jogo: arma na mão, secundária, fila de armas, troca com W e o que cada par de armas faz junto.

Guias prontos: Katarina, Locke, Aphelios, K'Sante, Evelynn, Draven, Thresh e Syndra.

Os vídeos só carregam quando alguém clica, então não pesam para abrir o site. Para montar um campeão novo:

1. Grave os clipes (3 a 12 segundos cada) e salve numa pasta com o nome do campeão.
2. Comprima cada um para `tutoriais/<campeao>/` (720p, sem som, ~1 MB) com o conversor do próprio Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\video\comprimir-video.ps1 `
    -InPath "C:\caminho\Q.mp4" -OutPath "C:\caminho\do\projeto\tutoriais\<campeao>\q.mp4"
```

3. Adicione a entrada do campeão em `TUTORIALS`, no arquivo `js/tutorials.js` (o formato completo e um prompt para gerar os textos estão em `scripts/tutorial/PROMPT.md`). Itens, runas e feitiços são escritos pelo nome em português do jogo; o ícone é achado sozinho.

Ferramentas de apoio, em `scripts/tutorial/`: o `modelo-gravacao.html` é um checklist do que gravar (com Pendente / Gravado / Refazer) e o `fila-tutoriais.html` é a fila de prioridade de quais campeões fazer primeiro, pela dificuldade e por quanto a turma perde com eles, com ordem ajustável à mão.

Os ícones redesenhados dos feitiços ficam em `tutoriais/feiticos/`; sem eles, o site usa os oficiais.

### ✨ Funcionalidades e 📝 Patch Notes

No topo da página ficam dois links:

* **✨ Funcionalidades:** lista de tudo que o site faz, por categoria. Em **Experimentar** começa um tour que rola até cada função, destaca ela e mostra um cartão com **Anterior / Próxima** para ver uma por uma. Quando entra uma funcionalidade nova, o link pisca com **NOVO** até a pessoa abrir o menu (fica salvo no navegador). As funções ficam em `FEATURES`, no arquivo `js/features.js`, cada uma com a data em que chegou.
* **📝 Patch Notes:** o histórico de atualizações por data, em `js/changelog.js`.

### 🎬 Clipes da gurizada

No fim da página aparecem os 5 últimos vídeos de cada canal do grupo, com thumb e rolagem horizontal, e o rodapé tem os links dos canais:

* [Canal do Fer](https://www.youtube.com/@fernandofiorini3240)
* [Canal do Valde](https://www.youtube.com/@magrexxx)
* [Canal do Rony](https://www.youtube.com/@ronnyplays6798)

A lista se atualiza sozinha (pode levar até 30 minutos para um vídeo novo aparecer). Para trocar ou adicionar canais, edite `YOUTUBE_CHANNELS` em `worker/src/index.js` e publique o Worker de novo.

### 💾 Configurações salvas

As preferências e o histórico ficam armazenados no navegador usando `localStorage`.

Feche o site, volte amanhã e continue sua jornada rumo a desgraça.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia                 | Utilização                                     |
| -------------------------- | ---------------------------------------------- |
| HTML5                      | Estrutura da aplicação                         |
| CSS3                       | Interface, layout responsivo e animações       |
| JavaScript                 | Lógica de sorteio e gerenciamento das partidas |
| Firebase Authentication    | Autenticação anônima para a transmissão        |
| Firebase Realtime Database | Sorteios ao vivo, partidas, votos e conquistas |
| Riot API + Cloudflare Worker | KDA, ouro, dano, wards e resultado das partidas |
| Feed do YouTube (via Worker) | Últimos clipes dos canais do grupo           |
| Data Dragon                | Imagens dos campeões do League of Legends      |
| LocalStorage               | Preferências, exclusões, rotação, histórico e chat |

É abrir o navegador e aceitar seu destino.

---

## 🚀 Como executar

Só quer jogar? Use o site publicado: https://fernandofiorini.github.io/SorteadorDosGuri/

### 1. Clone o repositório

```bash
git clone https://github.com/FernandoFiorini/SorteadorDosGuri.git
```

### 2. Entre na pasta

```bash
cd SorteadorDosGuri
```

### 3. Rode o site localmente

```bash
npx serve .
```

Abra `http://localhost:3000`. Pronto! Configure os jogadores, escolha as lanes e clique em **Sortear**.

Em `localhost` o Firebase fica desligado (o sorteio funciona, mas sem sala ao vivo, chat e estatísticas). Veja o passo 5 para testar com o banco.

### 4. Configure a transmissão ao vivo (opcional)

Para utilizar o modo ao vivo:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Registre uma aplicação Web.
3. Configure o Firebase Authentication para permitir autenticação anônima.
4. Habilite o Realtime Database e configure as regras de acesso adequadas.
5. Preencha o objeto `firebaseConfig` no código com os dados do seu projeto.
6. Hospede a aplicação em um endereço acessível aos demais jogadores.

**Importante:** as configurações de acesso do Firebase devem ser feitas com cuidado. A configuração Web não substitui regras de segurança; configure permissões para que os espectadores possam ler apenas os dados necessários e que somente usuários autorizados possam publicar resultados.

Para a transmissão, todos precisam acessar a mesma versão hospedada do site. Abrir o arquivo localmente não cria um endereço público para seus amigos.

### 5. Testar localmente sem mexer no banco real (opcional)

Precisa de Node e Java instalados.

```bash
# terminal 1: Firebase falso (banco + login) rodando só no seu PC
npx firebase-tools emulators:start --project demo-sorteador

# terminal 2: servidor do site
npx serve .
```

Abra `http://localhost:3000/?emulador=1`. O link da sala copiado já leva o `&emulador=1` para os espectadores (use uma aba anônima).
Os dados podem ser vistos em `http://127.0.0.1:4000` e somem ao fechar o emulador.

No `localhost` o Firebase fica desligado por padrão, para não gravar nada no banco real sem querer. Para ver as estatísticas e conquistas com os dados de verdade, abra `http://localhost:3000/?firebase=on`. Nesse modo você está no banco real: olhar não grava nada, mas evite sortear ou marcar resultados enquanto testa.

### 6. Dados da Riot (opcional)

Partidas de Swiftplay são ligadas aos sorteios para trazer KDA, gold, dano e outros números. Qualquer pessoa pode atualizar pelo botão nas estatísticas, com cooldown global de 1 minuto. As chaves ficam no Cloudflare Worker da pasta `worker/`, nunca no site.

Para publicar o Worker, rode no PowerShell, a partir de `worker/`:

```powershell
npm install
npx wrangler login
Get-Content ..\scripts\coleta\.secrets\riot.key | npx wrangler secret put RIOT_API_KEY
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path ..\scripts\coleta\.secrets\firebase-admin.json))) | npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
npx wrangler deploy
```

Depois, coloque o endereço do Worker em `RIOT_WORKER_URL`, no arquivo `js/config.js`, e publique o site.

O mesmo Worker também serve os últimos clipes do YouTube (rota `GET /videos`). Sempre que mudar algo em `worker/src/index.js`, rode `npx wrangler deploy` de novo. Para só trocar a chave da Riot, basta o `wrangler secret put RIOT_API_KEY` (não precisa de deploy).

Para buscar partidas mais antigas pelo seu PC, use `scripts/coleta`. Sem `--gravar`, ele só simula:

```bash
cd scripts/coleta
npm install
node coletar.js --desde=2026-10-19 --gravar
```

Os segredos ficam em `scripts/coleta/.secrets/` (`riot.key` e `firebase-admin.json`), ignorados pelo Git.

#### Ranked Flex (página escondida)

`flex.html` não tem link no site: abra direto pelo endereço (`/flex.html`). Mostra as partidas de Ranked Flex do Fer e do Rony: resumo, pontos fortes e o que melhorar, sugestão de pick (lanes e classes que funcionam, campeões para continuar, parecidos para experimentar e o que evitar), derrotas "de tabela" (você fez sua parte e o time não: ganhou a lane, KDA acima do time ou nota boa) que não pesam contra o campeão, por lane, por campeão, melhores e piores partidas e a aba da dupla.

Os dados ficam em `privado/flex` no Firebase, que o site não lê direto. A página pega pelo Worker (`GET /flex`), e o botão "🔄 Atualizar" dela chama `POST /flex/atualizar`, que busca até 20 partidas novas por clique. A nota de cada partida (`js/flex-score.js`) olha só o que aconteceu nela, comparando com o oponente direto de lane (suporte contra suporte, mid contra mid): KDA, mortes, participação nos abates, ouro, dano, farm e visão. O histórico não influencia. O suporte tem pesos próprios (visão, participação e o estilo em que se destacou: cura/escudo, tank ou dano). Os recordes do sorteador seguem com a nota simples, porque lá o campeão é sorteado.

Para puxar a temporada inteira pelo PC:

```bash
cd scripts/coleta
node flex.js --gravar
```

---

## 🎮 Como jogar

1. Adicione de 1 a 5 jogadores.
2. Escolha entre selecionar as lanes manualmente ou ativar o Full Random.
3. Decida se os nomes dos jogadores também serão embaralhados.
4. Ative as opções de não repetir campeões ou lanes, se desejar.
5. Exclua os campeões que não devem participar.
6. Clique em **Sortear**.
7. Aceite o resultado sem questionar a integridade do sistema.

### Regras oficiais da casa

* Se cair de suporte, é porque o universo está tentando lhe ensinar humildade.
* Se cair de jungle, mute todos antes que eles mutem você.
* Se cair de ADC, comece a escrever o pedido de desculpas antecipadamente.
* Se cair de Yasuo, você tem duas vidas: uma antes do 0/10 e outra depois.
* Se perder, o sorteio foi injusto.
* Se ganhar, você sempre soube que era melhor que os outros.

---

## 🗺️ Roadmap — Ideias para futuras torturas

* [x] Estatísticas de vitórias e derrotas por jogador.
* [x] Ranking oficial de quem mais entrega a partida (🍼 Maior feedamento já registrado).
* [x] Histórico de campeões mais sorteados.
* [ ] Modo desafio: campeões aleatórios com builds aleatórias.
* [ ] Sistema de punições para quem reclamar do resultado.
* [ ] Integração com Discord para anunciar os sorteios.
* [ ] Detector automático de desculpas esfarrapadas.

### Para abrir o site ao público

* [ ] **Contato com o dev:** um jeito de falar comigo pelo site (e-mail, formulário ou rede social no rodapé).
* [ ] **Sugestões de melhoria:** um canal para a galera mandar ideias e reportar bugs.
* [ ] **Monetizar o site:** anúncios, doação ou apoio, sem atrapalhar o sorteio.

*Os itens marcados já existem; os demais ainda são ideias futuras.*

---

## ⚠️ Aviso legal

Este projeto é uma ferramenta de entretenimento criada para partidas personalizadas entre amigos.

Não possui vínculo oficial com a Riot Games.

Apenas alguns neurônios perdidos durante as partidas.

---

*Feito para os guri, porque aparentemente jogar League of Legends normalmente já não era sofrimento suficiente.*
