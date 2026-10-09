# 🎲 LoL Randomizer — Sorteador dos Guri

### O matchmaking falhou. A amizade também.

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

### 🔊 Efeitos sonoros personalizados

Cada lane tem seu próprio efeito sonoro.

* **TOP:** - oloko.
* **JUNGLE:** - cade o cachorro?.
* **MID:** a luquís.
* **ADC:** risada intensa.
* **SUPPORT:** ta assistindo?.

### 📡 Sorteio ao vivo

Quer fazer o sorteio com todo mundo acompanhando, sem compartilhar a tela do Discord (BRASIL BRASIL) e sem ouvir o clássico "eu não vou com isso ai, sorteia de novo"?

* Criação de salas com códigos aleatórios.
* Compartilhamento de link para espectadores.
* Atualização dos resultados em tempo real.
* Animação dos resultados também para quem está assistindo.

Agora todos podem testemunhar a loucura acontecendo.

### 🕒 Histórico das partidas

Consulte os últimos 20 sorteios, com jogadores, lanes, campeões e horário.

Para documentar a rotação de campeões da equipe.

Ou para provar que o Pitty caiu de Suporte sete vezes e continua reclamando.

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
| Firebase Realtime Database | Sincronização dos sorteios ao vivo             |
| Data Dragon                | Imagens dos campeões do League of Legends      |
| LocalStorage               | Preferências, exclusões, rotação e histórico   |

É abrir o navegador e aceitar seu destino.

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

### 2. Entre na pasta

```bash
cd SEU-REPOSITORIO
```

### 3. Abra o projeto

Abra o arquivo HTML principal diretamente no navegador.

Pronto! Configure os jogadores, escolha as lanes e clique em **Sortear**.

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

* [ ] Estatísticas de vitórias e derrotas por jogador.
* [ ] Ranking oficial de quem mais entrega a partida.
* [ ] Histórico de campeões mais sorteados.
* [ ] Modo desafio: campeões aleatórios com builds aleatórias.
* [ ] Sistema de punições para quem reclamar do resultado.
* [ ] Integração com Discord para anunciar os sorteios.
* [ ] Detector automático de desculpas esfarrapadas.

*As funcionalidades acima são ideias futuras, não recursos já implementados.*

---

## ⚠️ Aviso legal

Este projeto é uma ferramenta de entretenimento criada para partidas personalizadas entre amigos.

Não possui vínculo oficial com a Riot Games.

Apenas alguns neurônios perdidos durante as partidas.

---

*Feito para os guri, porque aparentemente jogar League of Legends normalmente já não era sofrimento suficiente.*
