/* =====================================================
   ANIMAÇÃO DOS RESULTADOS
===================================================== */

async function animateResults(results, matchId) {

    const container = document.getElementById("results");

    container.innerHTML = "";

    /* Cria os cards inicialmente */

    results.forEach(result => {

        const card = document.createElement("div");

        card.className = "result";

        card.dataset.lane = result.lane;

        card.dataset.match = matchId || "";

        card.innerHTML = shuffleCardHTML(result.lane);

        container.appendChild(card);

    });

    /* Revela um por um */

    for (let i = 0; i < results.length; i++) {
        await shuffleAnimation(container.children[i], results[i]);
    }

}

function shuffleCardHTML(lane) {
    return `
            <div class="lane-name">${lane}</div>

            <div class="shuffle-container">
                <div class="dice">🎲</div>

                <img class="shuffle-image"
                     src="${IMAGE_URL}${randomItem(champions)}.png">

                <div class="shuffle-text">Sorteando...</div>
            </div>
        `;
}

/* Insere e anima o card de um jogador adicionado depois do sorteio,
   na posição certa da ordem das lanes, sem mexer nos outros cards */
async function animateAddedCard(result, matchId) {

    const container = document.getElementById("results");

    /* Já existe (ex.: evento repetido): só refaz esse card */
    const existing = [...container.querySelectorAll(".result")]
        .find(c => c.dataset.lane === result.lane);

    if (existing) {
        await animateSingleCard(result, matchId);
        return;
    }

    const placeholder = container.querySelector(".empty");
    if (placeholder) placeholder.remove();

    const card = document.createElement("div");
    card.className = "result";
    card.dataset.lane = result.lane;
    card.dataset.match = matchId || "";
    card.innerHTML = shuffleCardHTML(result.lane);

    const order = laneOrder.indexOf(result.lane);

    const next = [...container.querySelectorAll(".result")]
        .find(c => laneOrder.indexOf(c.dataset.lane) > order);

    container.insertBefore(card, next || null);

    await shuffleAnimation(card, result);

}

/* Refaz a animação de um único card (resorteio) */
async function animateSingleCard(result, matchId) {

    const card = [...document.querySelectorAll("#results .result")]
        .find(c => c.dataset.lane === result.lane);

    if (!card) return;

    if (matchId) card.dataset.match = matchId;

    card.innerHTML = shuffleCardHTML(result.lane);

    await shuffleAnimation(card, result);

}

/* =====================================================
   ANIMAÇÃO INDIVIDUAL
===================================================== */

function shuffleAnimation(card, result) {

    return new Promise(resolve => {

        const image = card.querySelector(".shuffle-image");
        const text = card.querySelector(".shuffle-text");
        const dice = card.querySelector(".dice");

        /* Resorteio: tira a moldura do jogador anterior enquanto embaralha */
        FRAME_CLASSES.forEach(c => card.classList.remove(c));

        const duration = 3000;
        const intervalTime = 100;

        /* Troca as imagens rapidamente */
        const interval = setInterval(() => {
            image.src = IMAGE_URL + randomItem(champions) + ".png";
        }, intervalTime);

        /* Depois revela o campeão */
        setTimeout(() => {

            clearInterval(interval);

            image.src = IMAGE_URL + result.champion + ".png";

            playChampionSound(result.sound);

            image.classList.remove("shuffle-image");

            dice.style.display = "none";

            text.innerHTML = "";

            /* Nick com o efeito da medalha e moldura especial (só visual) */
            decorateResultCard(card, result.player);

            /* Adiciona nome do campeão */
            const championName = document.createElement("div");

            championName.className = "champion";

            championName.textContent =
                championNames[result.champion] || result.champion;

            card.querySelector(".shuffle-container").appendChild(championName);

            /* Like / dislike (espectadores votam; host vê os números) */
            appendVoteBar(card, card.dataset.match, result.champion);

            /* "📖 Como jogar", se o campeão tiver tutorial */
            appendTutorialButton(card, result.champion);

            /* Botão de resortear (só host; fica oculto via CSS quando
               "não repetir campeões já sorteados" está marcado) */
            if (!IS_VIEWER) {

                const rerollButton = document.createElement("button");

                rerollButton.type = "button";
                rerollButton.className = "reroll-btn";
                rerollButton.textContent = "🔄 Resortear";
                rerollButton.onclick = () => rerollChampion(result.lane);

                card.appendChild(rerollButton);

            }

            resolve();

        }, duration);

    });

}
