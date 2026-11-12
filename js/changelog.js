/* =====================================================
   PATCH NOTES (histórico de atualizações por data)

   Link ao lado do subtítulo do topo que abre uma janelinha com o que
   mudou em cada dia. Para registrar algo novo, adicione no
   TOPO da lista (ou no dia que já existe):
   { data: "AAAA-MM-DD", titulo: "Resumo do dia",
     itens: [["novo", "..."], ["melhoria", "..."], ["som", "..."]] }

   Subitens (detalhes da mesma função, adicionados no MESMO dia):
     ["novo", "Função principal", { sub: [["detalhe"], ["outro detalhe"]] }]

   Para levar a pessoa até uma função do site, use a lista
   "✨ Funcionalidades" (js/features.js), não o Patch Notes.
===================================================== */

/* Tipos: "novo", "melhoria", "som", "ajuste" (mudam a etiqueta colorida) */
const CHANGELOG = [
    {
        data: "2026-11-12",
        titulo: "Tutoriais dos campeões",
        itens: [
            ["novo", "📖 Tutoriais: vídeo curto de cada habilidade, combos, dicas e uma jogada, com uma explicação embaixo de cada vídeo. Fica logo abaixo do resultado, com busca por nome.", {
                sub: [
                    ["Primeiros guias: Katarina, Locke e Aphelios."],
                    ["Quando sai um campeão com tutorial no sorteio, o card ganha o botão \"📖 Como jogar\"."],
                    ["Abas 📋 Como jogar (fases do jogo, pontos fortes e fracos, matchups e dica de ouro) e 🛠️ Build (itens, runas e ordem das skills, com link para a build do momento no OP.GG e U.GG)."],
                    ["Combos mais difíceis tocam em câmera lenta 🐢 0,75x."],
                    ["🌙 Aphelios com painel próprio das armas, no estilo do jogo: arma na mão, secundária, fila e o que cada par faz junto."]
                ]
            }],
            ["novo", "✨ Funcionalidades: lista de tudo que o site faz, ao lado do Patch Notes. Em \"Experimentar\" começa um tour que mostra cada função no lugar dela, uma por uma."]
        ]
    },
    {
        data: "2026-11-10",
        titulo: "Ranking dos guri, medalhas com níveis, chat flutuante e clipes",
        itens: [
            ["novo", "🎖️ Ranking dos guri: XP pelos títulos, medalhas e emblemas, com elo de 🔩 Ferro a ⚜️ Desafiante. Título dividido vale metade do XP. O elo aparece do lado do nick e tem aviso quando alguém sobe ou cai."],
            ["novo", "💬 Chat numa janelinha no canto inferior direito. Minimizado, mostra quantas mensagens não foram lidas (também no título da aba)."],
            ["novo", "🎬 Últimos clipes: os 5 vídeos mais recentes de cada canal, com rolagem horizontal, e links dos canais no rodapé."],
            ["novo", "Medalhas com níveis 🥉 Bronze (25), 🥈 Prata (50) e 🥇 Ouro (100). Combos só valem com medalhas no Ouro."],
            ["novo", "Emblemas permanentes: 🌍 Rodou o mapa, 🎲 Pool infinita e 🖐️ Pentakill."],
            ["novo", "Recordes de uma partida: 🐐 Melhor Paulinho Molina e 🍼 Maior feedamento já registrado, com nota de 0 a 10."],
            ["novo", "No sorteio, quem tem medalha aparece com o nick especial e uma moldura no card (sem ícones, para não poluir)."],
            ["novo", "Resumo da partida (nota de cada um, MVP e pior), linha do tempo dos títulos e aviso quando um título troca de dono."],
            ["novo", "📝 Patch Notes: o histórico de atualizações do site."],
            ["melhoria", "Topo do site com o nome \"Sorteador dos guri\" e a cuia de chimarrão."],
            ["melhoria", "Categorias de títulos podem ser minimizadas."],
            ["melhoria", "Pódio com os 3 que mais têm títulos, na glória e na vergonha."],
            ["ajuste", "Vitória e derrota não são mais marcadas à mão: vêm sozinhas ao atualizar as partidas. Só o \"🚫 Não deu jogo\" continua manual."],
            ["melhoria", "🔔 Somzinho de notificação quando chega mensagem nova no chat (respeita o botão de som)."],
            ["melhoria", "🎬 Canal do Rony nos clipes e no rodapé."],
            ["ajuste", "Recriação (jogo com menos de 5 minutos) não conta em nada: vira \"🚫 Não deu jogo\" sozinha ao atualizar as partidas."],
            ["som", "Nardi grito louco, Vamo eu e tu com o mestre e Havan é do Brasil."]
        ]
    },
    {
        data: "2026-11-09",
        titulo: "Números reais das partidas e títulos novos",
        itens: [
            ["novo", "Botão \"🔄 Atualizar partidas\": liga o sorteio à partida jogada e marca vitória ou derrota sozinho."],
            ["novo", "Estatísticas com KDA, ouro, dano, farm e visão de cada jogador."],
            ["novo", "O histórico mostra K/D/A, ouro, dano e farm de cada um, e avisa se alguém jogou com outro campeão."],
            ["novo", "Vários títulos novos: wards, first blood, abates solo, torres, objetivos roubados, tempo morto e mais."],
            ["melhoria", "Títulos da casa reformulados: abas Glória e Vergonha, categorias, 2º e 3º lugar e placar de quem tem mais títulos."],
            ["melhoria", "Medalhas por jogador com anéis e barras de progresso."],
            ["ajuste", "A aba Jogadores abre primeiro nas estatísticas."]
        ]
    },
    {
        data: "2026-11-08",
        titulo: "Um jogador, vários apelidos",
        itens: [
            ["melhoria", "Nomes diferentes do mesmo jogador (ex.: \"pit\" e \"Pitty\") contam como uma pessoa só nas estatísticas."]
        ]
    },
    {
        data: "2026-11-06",
        titulo: "Pacote de áudios",
        itens: [
            ["som", "Me ajuda Valde, Cu do gueixo, Me ajuda Ber, Vamo fazer o drag e Risada louca nardi."]
        ]
    },
    {
        data: "2026-11-04",
        titulo: "Chegam as conquistas",
        itens: [
            ["novo", "🏆 Conquistas: os primeiros títulos (Tu me conhece né valde, Mamu gastou flash, Que isso paixão, Pitty carrosilha) e as medalhas de 100 partidas."],
            ["novo", "Botão para ligar e desligar o som."],
            ["melhoria", "Site reorganizado por dentro, para ficar mais fácil de evoluir."]
        ]
    },
    {
        data: "2026-10-29",
        titulo: "Entrar no meio e estatísticas globais",
        itens: [
            ["novo", "\"➕ Alguém quer entrar no time?\": sorteia só o jogador novo, sem refazer o sorteio dos outros."],
            ["novo", "\"🚫 Não deu jogo\": a partida descartada não entra em nenhuma estatística."],
            ["melhoria", "Estatísticas somam as partidas de todas as salas."]
        ]
    },
    {
        data: "2026-10-21",
        titulo: "Mais áudios",
        itens: [
            ["som", "Gritinho nardi e Paixão pode relaxar."]
        ]
    },
    {
        data: "2026-10-18",
        titulo: "Tela do host",
        itens: [
            ["novo", "🖥️ O host pode transmitir a tela para quem está assistindo o sorteio."]
        ]
    },
    {
        data: "2026-10-17",
        titulo: "Estatísticas e votação",
        itens: [
            ["novo", "📊 Estatísticas da sala: campeões, jogadores e lanes."],
            ["novo", "👍 / 👎 em cada campeão sorteado."],
            ["novo", "Marcar vitória ou derrota depois da partida."]
        ]
    },
    {
        data: "2026-10-16",
        titulo: "Chat da sala",
        itens: [
            ["novo", "💬 Chat para quem está na sala, com o nome escolhido ao entrar."]
        ]
    },
    {
        data: "2026-10-13",
        titulo: "Som em cada lane",
        itens: [
            ["melhoria", "Cada lane sorteada toca um áudio aleatório."],
            ["novo", "Ícone do site: a cuia de chimarrão."],
            ["som", "Ai cara, Deixa eu clicar, Deixa comigo aspira, Escutou o que falei?, Nando cala boca, Ninguém quer me ajudar e Queria reseta."]
        ]
    },
    {
        data: "2026-10-10",
        titulo: "Listas temáticas e resorteio",
        itens: [
            ["novo", "🧪 Listas predeterminadas (Veneno, Fogo, Tankudini...) para sortear só entre aqueles campeões."],
            ["novo", "🔄 Resortear o campeão de uma lane só."],
            ["novo", "Não repetir campeões já sorteados, com a lista salva entre um sorteio e outro."],
            ["melhoria", "Campeões sempre na versão mais recente do jogo."]
        ]
    },
    {
        data: "2026-10-09",
        titulo: "Sorteio ao vivo",
        itens: [
            ["novo", "📡 Transmissão ao vivo: o host cria a sala e manda o link, e todo mundo vê o sorteio na hora, com animação."],
            ["som", "Oloko, Aluqix e Tá assistindo."],
            ["ajuste", "Rodapé com os créditos e ajuste no tempo dos sons."]
        ]
    },
    {
        data: "2026-10-07",
        titulo: "Rotação e histórico",
        itens: [
            ["novo", "🔄 Rotação de lanes: ninguém repete a mesma lane em partidas seguidas."],
            ["novo", "🕑 Histórico das últimas partidas."]
        ]
    },
    {
        data: "2026-10-02",
        titulo: "Sorteio completo",
        itens: [
            ["novo", "Jogadores, lanes, modo Full Aleatório, campeões excluídos e animação de sorteio."],
            ["som", "Cachorro e Risada."]
        ]
    },
    {
        data: "2026-10-01",
        titulo: "Nasce o Sorteador dos guri",
        itens: [
            ["novo", "Primeira versão do site, já com som no sorteio."]
        ]
    }
];

const CHANGELOG_TAGS = {
    novo: "Novo",
    melhoria: "Melhoria",
    ajuste: "Ajuste",
    som: "Som"
};

function renderChangelog() {

    const list = document.getElementById("changelogList");

    list.innerHTML = "";

    CHANGELOG.forEach((entry, i) => {

        const day = document.createElement("section");
        day.className = "changelog-day" + (i === 0 ? " latest" : "");

        const head = document.createElement("div");
        head.className = "changelog-day-head";

        const date = document.createElement("span");
        date.className = "changelog-date";
        const [y, m, d] = entry.data.split("-");
        date.textContent = d + "/" + m + "/" + y;

        const title = document.createElement("h4");
        title.textContent = entry.titulo;

        head.appendChild(date);
        head.appendChild(title);

        const items = document.createElement("ul");

        entry.itens.forEach(([type, text, go]) => {

            const li = document.createElement("li");

            const tag = document.createElement("span");
            tag.className = "changelog-tag " + type;
            tag.textContent = CHANGELOG_TAGS[type] || type;

            const span = document.createElement("span");
            span.textContent = text;

            li.appendChild(tag);
            li.appendChild(span);

            items.appendChild(li);

            /* Detalhes da mesma função, recuados embaixo dela */
            if (go && go.sub && go.sub.length) {
                const subList = document.createElement("ul");
                subList.className = "changelog-sub";
                go.sub.forEach(([subText]) => {
                    const subLi = document.createElement("li");
                    const subSpan = document.createElement("span");
                    subSpan.textContent = subText;
                    subLi.appendChild(subSpan);
                    subList.appendChild(subLi);
                });
                items.appendChild(subList);
            }

        });

        day.appendChild(head);
        day.appendChild(items);
        list.appendChild(day);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const dialog = document.getElementById("changelogDialog");

    if (!dialog) return;

    document.getElementById("changelogOpen").addEventListener("click", event => {
        event.preventDefault();
        renderChangelog();
        dialog.showModal();
    });

    document.getElementById("changelogClose").addEventListener("click", () => dialog.close());

    /* Clicar fora da janelinha fecha */
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });

});
