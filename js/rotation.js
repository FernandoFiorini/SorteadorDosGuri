/* =====================================================
   ROTAÇÃO DE LANES (não repetir lane entre partidas)

   Guarda, para cada jogador, as lanes que ele já jogou
   no ciclo atual. A cada sorteio, cada um recebe uma lane
   que ainda não jogou. Quando não for mais possível
   (ex.: 3 jogadores, 4ª partida), avisa e reinicia o ciclo.
===================================================== */

const ROTATION_KEY = "laneRotation";

function emptyRotation() {
    return { count: 0, history: {} };
}

function loadRotation() {
    try {
        const saved = JSON.parse(localStorage.getItem(ROTATION_KEY));
        if (saved && saved.history) return saved;
    } catch (e) { /* ignora */ }
    return null;
}

function saveRotation(state) {
    localStorage.setItem(ROTATION_KEY, JSON.stringify(state));
}

function getCurrentPlayers() {
    return [...document.querySelectorAll(".player-input")]
        .map(input => input.value.trim())
        .filter(name => name.length > 0);
}

/* Tenta dar a cada jogador uma lane diferente que ele ainda não jogou
   (backtracking; com no máximo 5 jogadores é instantâneo).
   Retorna a lista de pares ou null se for impossível. */
function findRotationMatch(players, pool, history, randomize) {

    const pairs = [];
    const used = new Set();

    function assign(i) {

        if (i === players.length) return true;

        const played = history[players[i]] || [];

        const candidates = (randomize ? shuffle(pool) : pool)
            .filter(lane => !played.includes(lane) && !used.has(lane));

        for (const lane of candidates) {

            used.add(lane);
            pairs.push({ player: players[i], lane: lane });

            if (assign(i + 1)) return true;

            pairs.pop();
            used.delete(lane);

        }

        return false;

    }

    return assign(0) ? pairs : null;

}

function assignLanesWithRotation(players, pool, randomize) {

    /* O histórico fica salvo no navegador e só é limpo quando o
       ciclo completa ou quando o usuário clica em "Resetar rotação" */
    let state = loadRotation() || emptyRotation();

    let wasReset = false;

    let pairs = findRotationMatch(players, pool, state.history, randomize);

    /* Não há mais como evitar repetição -> reseta o ciclo */
    if (!pairs) {
        wasReset = state.count > 0;
        state = emptyRotation();
        pairs = findRotationMatch(players, pool, state.history, randomize);
    }

    /* Registra as lanes desta partida */
    pairs.forEach(({ player, lane }) => {
        if (!state.history[player]) state.history[player] = [];
        state.history[player].push(lane);
    });

    state.count++;

    saveRotation(state);

    return { pairs: pairs, wasReset: wasReset, count: state.count };

}

function resetRotation(manual) {

    localStorage.removeItem(ROTATION_KEY);

    hideRotationNotice();
    updateRotationStatus();

    if (manual) {
        showRotationNotice("↺ Rotação resetada. A próxima partida começa um novo ciclo.");
    }

}

function showRotationNotice(message) {
    const notice = document.getElementById("rotationNotice");
    notice.textContent = message;
    notice.style.display = "block";
}

function hideRotationNotice() {
    const notice = document.getElementById("rotationNotice");
    notice.style.display = "none";
    notice.textContent = "";
}

function updateRotationStatus() {

    const status = document.getElementById("rotationStatus");
    const button = document.getElementById("resetRotationBtn");
    const enabled = document.getElementById("noRepeatLanes").checked;

    status.style.display = button.style.display = enabled ? "" : "none";

    if (!enabled) return;

    const players = getCurrentPlayers();
    const state = loadRotation();

    if (!state || state.count === 0) {
        status.textContent = "Rotação nova: nenhuma partida registrada ainda.";
        return;
    }

    const fullRandom = document.getElementById("fullRandom").checked;

    /* No modo manual o ciclo tem exatamente "nº de jogadores" partidas */
    if (!fullRandom && state.count >= players.length) {
        status.textContent =
            `Rotação completa (${state.count} partidas). ` +
            `O próximo sorteio vai resetar o ciclo.`;
    } else if (!fullRandom) {
        status.textContent =
            `Partidas no ciclo: ${state.count} de ${players.length}.`;
    } else {
        status.textContent = `Partidas no ciclo: ${state.count}.`;
    }

}

function onRotationToggle() {
    localStorage.setItem(
        "noRepeatLanes",
        document.getElementById("noRepeatLanes").checked
    );
    updateRotationStatus();
}

function loadRotationSettings() {
    document.getElementById("noRepeatLanes").checked =
        localStorage.getItem("noRepeatLanes") === "true";
    updateRotationStatus();
}

