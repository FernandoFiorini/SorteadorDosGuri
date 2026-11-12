/* =====================================================
   FUNCIONALIDADES ("✨ Funcionalidades" no topo)

   Lista de tudo que o site faz, separada por categoria. Cada uma tem
   "Experimentar": começa um tour que rola até a função, destaca ela
   e mostra um cartão com Anterior / Próxima para ver uma por uma.

   O Patch Notes (js/changelog.js) fica só como histórico.

   Para adicionar: um item em FEATURES com
     { titulo, desde: "AAAA-MM-DD", texto, alvo: "#idDoElemento" }  ou
     { titulo, desde: "AAAA-MM-DD", texto, tutorial: "Aphelios", aba?: "guia" }
   "desde" é o dia em que a função chegou: enquanto tiver uma mais nova
   do que a pessoa já viu, o link "✨ Funcionalidades" fica em destaque
   (guardado no navegador) e a função aparece com a etiqueta NOVO.
   Função que não está na tela naquela hora (ex.: chat fora da sala,
   cards só do host) é pulada no tour.
===================================================== */

const FEATURES = [
    {
        categoria: "🎲 Sorteio",
        itens: [
            { titulo: "👥 Jogadores", desde: "2026-10-02", texto: "Coloque o nome de até 5 jogadores. O sorteio distribui as lanes e um campeão para cada um.", alvo: ".card:has(#player1)" },
            { titulo: "⚔️ Lanes e Full Aleatório", desde: "2026-10-02", texto: "Escolha quais lanes entram no sorteio, ou marque Full Aleatório para sortear tudo.", alvo: ".card:has(#laneContainer)" },
            { titulo: "🔄 Rotação de lanes", desde: "2026-10-07", texto: "Nas configurações: ninguém repete a mesma lane em partidas seguidas.", alvo: ".card:has(#settingsDetails)" },
            { titulo: "🧪 Listas predeterminadas", desde: "2026-10-10", texto: "Sorteie só entre campeões de um tema: Veneno, Fogo, Tankudini e outras.", alvo: ".card:has(#poolsDetails)" },
            { titulo: "🚫 Campeões excluídos", desde: "2026-10-02", texto: "Marque os campeões que não podem cair no sorteio.", alvo: "#excludedCard" },
            { titulo: "🎯 Resultado", desde: "2026-10-02", texto: "Onde aparece o sorteio, com animação e som. Dá para resortear o campeão de uma lane só e dar 👍 / 👎.", alvo: ".card:has(#results)" },
            { titulo: "🔊 Som", desde: "2026-11-04", texto: "Liga e desliga os áudios do sorteio.", alvo: "#muteBtn" },
            { titulo: "🚫 Não deu jogo", desde: "2026-10-29", texto: "Se a partida não rolou, marque aqui: ela some de todas as estatísticas.", alvo: "#resultBar" }
        ]
    },
    {
        categoria: "📡 Ao vivo",
        itens: [
            { titulo: "📡 Transmissão ao vivo", desde: "2026-10-09", texto: "Crie uma sala e mande o link: todo mundo assiste o sorteio na hora, com animação.", alvo: ".card:has(#roomLink)" },
            { titulo: "💬 Chat da sala", desde: "2026-11-10", texto: "Janelinha no canto: converse com quem está na sala. Minimizado, mostra quantas mensagens não foram lidas.", alvo: "#chatCard" }
        ]
    },
    {
        categoria: "📖 Tutoriais",
        itens: [
            { titulo: "📖 Tutoriais dos campeões", desde: "2026-11-12", texto: "Vídeo de cada habilidade, combos, dicas, como jogar e build. Busque pelo nome do campeão.", alvo: "#tutorialsCard" },
            { titulo: "🎬 Habilidades e combos", desde: "2026-11-12", texto: "Clique em cada habilidade para ver o vídeo. Os combos mais difíceis tocam em câmera lenta.", tutorial: "Katarina" },
            { titulo: "📋 Como jogar", desde: "2026-11-12", texto: "Fases do jogo, pontos fortes e fracos, matchups e a dica de ouro.", tutorial: "Katarina", aba: "guia" },
            { titulo: "🛠️ Build", desde: "2026-11-12", texto: "Itens, runas e ordem das skills, com link para a build do momento.", tutorial: "Katarina", aba: "build" },
            { titulo: "🌙 Armas do Aphelios", desde: "2026-11-12", texto: "Painel no estilo do jogo: arma na mão, secundária, fila e o que cada par faz junto.", tutorial: "Aphelios" }
        ]
    },
    {
        categoria: "📊 Estatísticas",
        itens: [
            { titulo: "📊 Estatísticas", desde: "2026-10-17", texto: "Campeões, jogadores e lanes de todas as partidas, com KDA, ouro, dano, farm e visão. Também ficam aqui o ranking, os títulos e as medalhas.", alvo: "#statsCard" },
            { titulo: "🔄 Atualizar partidas", desde: "2026-11-09", texto: "Depois de jogar, clique aqui: o site acha a partida, marca vitória ou derrota e puxa os números de cada um.", alvo: "#riotUpdateBtn" },
            { titulo: "🕑 Histórico", desde: "2026-10-07", texto: "As últimas partidas, com quem jogou de quê e os números de cada um.", alvo: ".card:has(#matchHistory)" }
        ]
    },
    {
        categoria: "✨ Extras",
        itens: [
            { titulo: "🎬 Últimos clipes", desde: "2026-11-10", texto: "Os vídeos mais recentes dos canais da gurizada, com rolagem para o lado.", alvo: "#clipsCard" },
            { titulo: "📝 Patch Notes", desde: "2026-11-10", texto: "O histórico de tudo que mudou no site, por data.", alvo: "#changelogOpen" }
        ]
    }
];

/* ---------- Novidades (localStorage) ---------- */

const FEATURES_SEEN_KEY = "funcionalidadesVistas";

function latestFeatureDate() {
    return FEATURES.flatMap(c => c.itens.map(f => f.desde || "")).sort().pop() || "";
}

function seenFeatureDate() {
    try { return localStorage.getItem(FEATURES_SEEN_KEY) || ""; } catch (e) { return ""; }
}

/* Novo = chegou depois da última vez que a pessoa abriu o menu.
   Quem nunca abriu vê como novo só o que é do último dia. */
function isNewFeature(f, seen) {
    if (!f.desde) return false;
    return seen ? f.desde > seen : f.desde === latestFeatureDate();
}

function refreshFeaturesBadge() {
    const link = document.getElementById("featuresOpen");
    if (!link) return;
    const hasNew = latestFeatureDate() > seenFeatureDate();
    link.classList.toggle("has-new", hasNew);
    link.title = hasNew ? "Tem funcionalidade nova!" : "";
}

function markFeaturesSeen() {
    try { localStorage.setItem(FEATURES_SEEN_KEY, latestFeatureDate()); } catch (e) { }
    refreshFeaturesBadge();
}

/* ---------- Disponível agora? ---------- */

function featureElement(f) {
    try { return f.alvo ? document.querySelector(f.alvo) : null; } catch (e) { return null; }
}

function featureAvailable(f) {
    if (f.tutorial) return typeof TUTORIALS !== "undefined" && !!TUTORIALS[f.tutorial];
    const el = featureElement(f);
    return !!el && el.getClientRects().length > 0;
}

/* ---------- Destaque ---------- */

function spotlight(el) {
    if (!el) return;
    el.classList.remove("spotlight");
    void el.offsetWidth; /* reinicia a animação */
    el.classList.add("spotlight");
    clearTimeout(el._spotlightTimer);
    el._spotlightTimer = setTimeout(() => el.classList.remove("spotlight"), 3600);
}

/* ---------- Tour: uma por uma ---------- */

let tourList = [];
let tourIndex = 0;

function allFeatures() {
    return FEATURES.flatMap(c => c.itens.map(f => Object.assign({ categoria: c.categoria }, f)));
}

function startTour(feature) {

    document.getElementById("featuresDialog").close();

    /* Só o que está na tela agora */
    tourList = allFeatures().filter(featureAvailable);
    tourIndex = Math.max(0, tourList.findIndex(f => f.titulo === feature.titulo));

    showTourStep();

}

function showTourStep() {

    const f = tourList[tourIndex];
    const card = document.getElementById("tourCard");

    if (!f) { endTour(); return; }

    document.getElementById("tourCategory").textContent = f.categoria;
    document.getElementById("tourTitle").textContent = f.titulo;
    document.getElementById("tourText").textContent = f.texto;
    document.getElementById("tourCount").textContent = (tourIndex + 1) + " de " + tourList.length;
    document.getElementById("tourPrev").disabled = tourIndex === 0;
    document.getElementById("tourNext").textContent = tourIndex === tourList.length - 1 ? "Concluir ✓" : "Próxima ›";

    card.hidden = false;

    /* Tutorial: abre a janelinha; o resto: rola até a parte do site */
    const dialog = document.getElementById("tutorialDialog");

    if (f.tutorial) {
        openTutorial(f.tutorial).then(() => {
            /* A janela do tutorial é modal: o cartão vai para dentro dela
               para continuar clicável por cima */
            dialog.appendChild(card);
            if (f.aba) setTutorialTab(f.aba);
            spotlight(document.querySelector("#tutorialDialog .tutorial-body"));
        });
        return;
    }

    document.body.appendChild(card);
    if (dialog && dialog.open) closeTutorial();

    const el = featureElement(f);
    if (!el) return;

    const details = el.closest("details") || el.querySelector("details.collapsible");
    if (details) details.open = true;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => spotlight(el), 450);

}

function endTour() {
    const card = document.getElementById("tourCard");
    card.hidden = true;
    document.body.appendChild(card);
    const dialog = document.getElementById("tutorialDialog");
    if (dialog && dialog.open) closeTutorial();
}

/* ---------- Janela da lista ---------- */

function renderFeatures() {

    const list = document.getElementById("featuresList");
    const seen = seenFeatureDate();
    list.innerHTML = "";

    FEATURES.forEach(cat => {

        const section = document.createElement("section");
        section.className = "features-cat";

        const h = document.createElement("h4");
        h.textContent = cat.categoria;
        section.appendChild(h);

        cat.itens.forEach(f => {

            const row = document.createElement("div");
            row.className = "features-item";

            const body = document.createElement("div");
            const t = document.createElement("strong");
            t.textContent = f.titulo;
            if (isNewFeature(f, seen)) {
                const tag = document.createElement("em");
                tag.className = "features-new";
                tag.textContent = "NOVO";
                t.appendChild(tag);
                row.classList.add("is-new");
            }
            const p = document.createElement("span");
            p.textContent = f.texto;
            body.appendChild(t);
            body.appendChild(p);
            row.appendChild(body);

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "features-try";

            if (featureAvailable(f)) {
                btn.textContent = "Experimentar →";
                btn.onclick = () => startTour(f);
            } else {
                btn.textContent = "Indisponível agora";
                btn.disabled = true;
                btn.title = "Essa parte não está na tela agora (ex.: só aparece numa sala ao vivo ou para o host)";
            }

            row.appendChild(btn);
            section.appendChild(row);

        });

        list.appendChild(section);

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const dialog = document.getElementById("featuresDialog");
    if (!dialog) return;

    refreshFeaturesBadge();

    document.getElementById("featuresOpen").addEventListener("click", event => {
        event.preventDefault();
        renderFeatures();
        dialog.showModal();
        markFeaturesSeen();
    });

    document.getElementById("featuresClose").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

    document.getElementById("tourPrev").addEventListener("click", () => { tourIndex--; showTourStep(); });
    document.getElementById("tourNext").addEventListener("click", () => {
        if (tourIndex >= tourList.length - 1) { endTour(); return; }
        tourIndex++;
        showTourStep();
    });
    document.getElementById("tourClose").addEventListener("click", endTour);
    document.getElementById("tourList").addEventListener("click", () => {
        endTour();
        renderFeatures();
        dialog.showModal();
    });

});
