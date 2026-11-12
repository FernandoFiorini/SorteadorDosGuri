/* ---------- ESPECTADOR (sorteio) ---------- */

function setViewerStatus(text, state) {
    const el = document.getElementById("viewerStatus");
    el.innerHTML = "";
    const dot = document.createElement("span");
    dot.className = "live-dot" + (state ? " " + state : "");
    el.appendChild(dot);
    el.appendChild(document.createTextNode(text));
}

function initViewer() {

    document.body.classList.add("viewer");

    document.getElementById("headerSubtitle").textContent =
        "Acompanhe o sorteio ao vivo";

    const overlay = document.getElementById("viewerOverlay");
    const joinButton = document.getElementById("joinButton");
    const joinName = document.getElementById("joinName");

    /* Reaproveita o nome usado antes, se houver */
    joinName.value = localStorage.getItem("chatName") || "";

    joinName.addEventListener("input", () => joinName.classList.remove("invalid"));

    joinName.addEventListener("keydown", event => {
        if (event.key === "Enter") joinButton.click();
    });

    /* Código inválido ou Firebase ausente */
    if (!/^[A-Z0-9]{4,12}$/.test(rawRoom)) {
        overlay.style.display = "flex";
        document.getElementById("overlayText").textContent =
            "Link de sala inválido.";
        joinButton.style.display = "none";
        document.getElementById("joinName").style.display = "none";
        return;
    }

    if (!initFirebase()) {
        overlay.style.display = "flex";
        document.getElementById("overlayText").textContent =
            "Este site ainda não está configurado para transmissão ao vivo.";
        joinButton.style.display = "none";
        document.getElementById("joinName").style.display = "none";
        return;
    }

    roomCode = rawRoom;

    overlay.style.display = "flex";

    joinButton.onclick = async () => {

        /* Nome obrigatório (pode ser qualquer um) */
        const chosenName = joinName.value.trim().slice(0, 20);

        if (!chosenName) {
            joinName.classList.add("invalid");
            joinName.focus();
            return;
        }

        localStorage.setItem("chatName", chosenName);
        document.getElementById("chatName").value = chosenName;

        unlockAudio();
        overlay.style.display = "none";
        startListening();
        startStats();

        /* Login anônimo do espectador (necessário para chat e votos) */
        try {
            const cred = await firebase.auth().signInAnonymously();
            myUid = cred.user.uid;
        } catch (error) {
            console.error("Falha no login anônimo:", error);
        }

        startChat();

        /* Tela compartilhada (só com &tv=1 na URL) */
        startScreenView();

        /* Agora que o uid existe, libera os botões de voto */
        refreshVoteBars();
    };

}

let viewerFirstSnapshot = true;
let viewerLastId = null;
let viewerQueue = Promise.resolve();

function startListening() {

    setViewerStatus("Conectando à sala " + roomCode + "...");

    db.ref(".info/connected").on("value", snap => {
        if (snap.val() === true) {
            setViewerStatus("Ao vivo — sala " + roomCode, "on");
        } else {
            setViewerStatus("Reconectando...", "off");
        }
    });

    db.ref("salas/" + roomCode + "/sorteio").on("value", snap => {

        const data = snap.val();

        /* Primeira leitura: mostra o último resultado sem animar */
        if (viewerFirstSnapshot) {
            viewerFirstSnapshot = false;

            if (data && data.results) {
                viewerLastId = data.id;
                renderStaticResults(Object.values(data.results), data.matchId);
            }

            return;
        }

        if (!data || !data.results || data.id === viewerLastId) return;

        viewerLastId = data.id;

        const results = Object.values(data.results);
        const matchId = data.matchId || null;

        /* Jogador novo adicionado à partida: anima só o card dele */
        if (data.add) {
            const added = results.find(r => r.lane === data.add);

            if (added) {
                viewerQueue = viewerQueue
                    .then(() => animateAddedCard(added, matchId))
                    .then(() => updateLatestHistory(results))
                    .catch(error => console.error(error));
            }

            return;
        }

        /* Resorteio de um card só */
        if (data.reroll) {
            const changed = results.find(r => r.lane === data.reroll);

            if (changed) {
                viewerQueue = viewerQueue
                    .then(() => animateSingleCard(changed, matchId))
                    .then(() => updateLatestHistory(results))
                    .catch(error => console.error(error));
            }

            return;
        }

        /* Enfileira para não sobrepor animações */
        viewerQueue = viewerQueue
            .then(() => animateResults(results, matchId))
            .then(() => addMatchToHistory(results, matchId))
            .catch(error => console.error(error));

    }, error => {
        console.error(error);
        setViewerStatus("Sem permissão para ler a sala (" + error.code + ")", "off");
    });

}

/* Mostra um resultado já pronto, sem animação (quem entra no meio) */
function renderStaticResults(results, matchId) {

    const container = document.getElementById("results");

    container.innerHTML = "";

    results.forEach(result => {

        const card = document.createElement("div");
        card.className = "result";
        card.dataset.lane = result.lane;
        card.dataset.match = matchId || "";

        const lane = document.createElement("div");
        lane.className = "lane-name";
        lane.textContent = result.lane;

        const box = document.createElement("div");
        box.className = "shuffle-container";

        const image = document.createElement("img");
        image.src = IMAGE_URL + result.champion + ".png";

        const text = document.createElement("div");
        text.className = "shuffle-text";
        const strong = document.createElement("strong");
        strong.textContent = result.player;
        text.appendChild(strong);

        const champion = document.createElement("div");
        champion.className = "champion";
        champion.textContent = championNames[result.champion] || result.champion;

        box.appendChild(image);
        box.appendChild(text);
        box.appendChild(champion);

        card.appendChild(lane);
        card.appendChild(box);

        appendVoteBar(card, matchId, result.champion);

        appendTutorialButton(card, result.champion);

        appendGuideRequestButton(card, result.champion);

        container.appendChild(card);

        /* Nick com o efeito da medalha e moldura especial (só visual) */
        decorateResultCard(card, result.player);

    });

}

