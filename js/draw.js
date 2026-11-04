/* =====================================================
   RESORTEAR UM CAMPEÃO (só com "já sorteados" desligado)
===================================================== */

let currentResults = [];
let rerolling = false;

/* =====================================================
   ADICIONAR JOGADOR NO MEIO DA PARTIDA

   Sorteia só o novo jogador (lane livre + campeão), sem alterar
   os cards já sorteados. Funciona até completar 5 jogadores.
===================================================== */

let addingPlayer = false;

function freeLanesNow() {
    const used = currentResults.map(r => r.lane);
    return laneOrder.filter(lane => !used.includes(lane));
}

/* Mostra/esconde a barra e atualiza as lanes livres no seletor */
function refreshAddPlayerBar() {

    const bar = document.getElementById("addPlayerBar");

    if (!bar) return;

    const total = currentResults.length;

    if (IS_VIEWER || total === 0 || total >= laneOrder.length) {
        bar.classList.remove("show");
        return;
    }

    const select = document.getElementById("addPlayerLane");
    const previous = select.value;

    select.innerHTML = "";

    const random = document.createElement("option");
    random.value = "";
    random.textContent = "Lane aleatória";
    select.appendChild(random);

    freeLanesNow().forEach(lane => {
        const option = document.createElement("option");
        option.value = lane;
        option.textContent = lane;
        select.appendChild(option);
    });

    if ([...select.options].some(o => o.value === previous)) {
        select.value = previous;
    }

    bar.classList.add("show");

}

async function addPlayerToMatch() {

    if (rerolling || addingPlayer) return;

    const sortButton = document.getElementById("sortButton");

    /* Ainda sorteando a partida inteira */
    if (sortButton.disabled) return;

    if (currentResults.length === 0) return;

    if (currentResults.length >= laneOrder.length) {
        alert("O time já tem 5 jogadores.");
        return;
    }

    const nameInput = document.getElementById("addPlayerName");
    const name = nameInput.value.trim().slice(0, 20);

    if (!name) {
        nameInput.focus();
        return;
    }

    /* ---------- LANE ---------- */

    const freeLanes = freeLanesNow();
    const choice = document.getElementById("addPlayerLane").value;

    const lane = freeLanes.includes(choice) ? choice : randomItem(freeLanes);

    /* ---------- CAMPEÃO ---------- */

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    const inUse = currentResults.map(r => r.champion);

    const poolChampions = getPoolChampions();
    const poolMode = poolChampions.length > 0;
    const persist = persistActive();

    let pool;

    if (poolMode) {

        /* Pool ativa: só dentro da pool, sem repetir quem já está no time */
        pool = poolChampions.filter(champion => !inUse.includes(champion));

    } else {

        const drawn = persist ? loadDrawn() : [];

        const buildPool = ignoreDrawn => champions.filter(champion =>
            !excluded.includes(champion)
            && !inUse.includes(champion)
            && (ignoreDrawn || !drawn.includes(champion))
        );

        pool = buildPool(false);

        if (pool.length === 0 && persist) {

            const ok = confirm(
                "Não restam campeões ainda não sorteados para o novo jogador. " +
                "Resetar a lista de sorteados e continuar?"
            );

            if (!ok) return;

            resetDrawn(false);

            pool = buildPool(true);

        }

    }

    if (pool.length === 0) {
        alert("Não existem campeões disponíveis para o novo jogador.");
        return;
    }

    /* ---------- SORTEIA SÓ O NOVO ---------- */

    addingPlayer = true;
    sortButton.disabled = true;
    document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = true);
    document.getElementById("addPlayerBtn").disabled = true;

    try {

        const newResult = {
            player: name,
            lane: lane,
            champion: randomItem(pool),
            sound: pickSounds(1, currentResults.map(r => r.sound))[0]
        };

        /* Registra o campeão como já sorteado (mesma regra do sorteio) */
        if (persist && !poolMode) addDrawn([newResult.champion]);

        /* Rotação de lanes: guarda a lane do novo jogador no histórico */
        if (!poolMode && document.getElementById("noRepeatLanes").checked) {
            const state = loadRotation() || emptyRotation();
            if (!state.history[name]) state.history[name] = [];
            state.history[name].push(lane);
            saveRotation(state);
            updateRotationStatus();
        }

        currentResults.push(newResult);

        currentResults.sort(
            (a, b) => laneOrder.indexOf(a.lane) - laneOrder.indexOf(b.lane)
        );

        nameInput.value = "";

        /* Espectadores animam só o card novo */
        broadcastResults(currentResults, currentMatchId, null, lane);

        saveAddedPlayer(currentMatchId, currentResults);

        await animateAddedCard(newResult, currentMatchId);

        updateLatestHistory(currentResults);

    } finally {

        addingPlayer = false;
        sortButton.disabled = false;
        document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = false);
        document.getElementById("addPlayerBtn").disabled = false;

        refreshAddPlayerBar();

    }

}

async function rerollChampion(lane) {

    if (rerolling) return;

    const sortButton = document.getElementById("sortButton");

    /* Ainda sorteando a partida inteira */
    if (sortButton.disabled) return;

    const target = currentResults.find(r => r.lane === lane);

    if (!target) return;

    const excluded = JSON.parse(
        localStorage.getItem("excludedChampions") || "[]"
    );

    const inUse = currentResults
        .filter(r => r !== target)
        .map(r => r.champion);

    const poolChampions = getPoolChampions();

    /* Lista de "já sorteados" ativa (e sem pool): o novo campeão
       também não pode ser um que já saiu antes */
    const persist = persistActive();

    let pool;

    if (poolChampions.length > 0) {

        /* Pool ativa: resorteia só dentro da pool, sem repetir
           quem já está em outro card */
        pool = poolChampions.filter(champion =>
            champion !== target.champion && !inUse.includes(champion)
        );

    } else {

        const drawn = persist ? loadDrawn() : [];

        const buildPool = ignoreDrawn => champions.filter(champion =>
            !excluded.includes(champion)
            && champion !== target.champion
            && !inUse.includes(champion)
            && (ignoreDrawn || !drawn.includes(champion))
        );

        pool = buildPool(false);

        /* Acabaram os campeões não sorteados: oferece resetar a lista */
        if (pool.length === 0 && persist) {

            const ok = confirm(
                "Não restam campeões ainda não sorteados para resortear. " +
                "Resetar a lista de sorteados e continuar?"
            );

            if (!ok) return;

            resetDrawn(false);

            pool = buildPool(true);

        }

    }

    if (pool.length === 0) {
        alert("Não existem outros campeões disponíveis para resortear.");
        return;
    }

    rerolling = true;
    sortButton.disabled = true;
    document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = true);

    try {

        const oldChampion = target.champion;

        target.champion = randomItem(pool);

        /* Registra o novo campeão como já sorteado */
        if (persist && poolChampions.length === 0) addDrawn([target.champion]);

        target.sound = pickSounds(1, currentResults.filter(r => r !== target).map(r => r.sound))[0];

        broadcastResults(currentResults, currentMatchId, lane);

        saveReroll(currentMatchId, currentResults, oldChampion);

        await animateSingleCard(target, currentMatchId);

        updateLatestHistory(currentResults);

    } finally {

        rerolling = false;
        sortButton.disabled = false;
        document.querySelectorAll(".reroll-btn").forEach(b => b.disabled = false);

    }

}

/* =====================================================
   SORTEIO PRINCIPAL
===================================================== */

async function sortear() {

    const button = document.getElementById("sortButton");

    /* Evita clicar duas vezes */
    button.disabled = true;

    try {

        /* ---------- JOGADORES ---------- */

        const players = [...document.querySelectorAll(".player-input")]
            .map(input => input.value.trim())
            .filter(name => name.length > 0);

        if (players.length === 0) {
            alert("Informe pelo menos um jogador.");
            return;
        }

        /* Sorteia a ordem dos nomes (ou mantém a digitada) */
        const shufflePlayers =
            document.getElementById("shufflePlayers").checked;

        const orderedPlayers =
            shufflePlayers ? shuffle(players) : players;

        /* ---------- LANES ---------- */

        const fullRandom = document.getElementById("fullRandom").checked;

        /* Pool ativa: ignora excluídos, "não repetir", "já sorteados" e rotação */
        const poolChampions = getPoolChampions();
        const poolMode = poolChampions.length > 0;

        const noRepeatLanes =
            !poolMode && document.getElementById("noRepeatLanes").checked;

        let selectedLanes = [];

        if (fullRandom) {

            /* Com rotação, todas as lanes entram no "pool" e o
               histórico decide quais cada jogador pode receber */
            selectedLanes = noRepeatLanes
                ? [...laneOrder]
                : shuffle(laneOrder).slice(0, players.length);

        } else {

            selectedLanes = [
                ...document.querySelectorAll("#laneContainer input:checked")
            ].map(input => input.value);

            if (selectedLanes.length !== players.length) {

                alert(
                    `Você informou ${players.length} jogador(es), ` +
                    `então deve selecionar exatamente ` +
                    `${players.length} lane(s).`
                );

                return;

            }

        }

        /* Sempre TOP → JUNGLE → MID → ADC → SUPPORT */
        selectedLanes.sort(
            (a, b) => laneOrder.indexOf(a) - laneOrder.indexOf(b)
        );

        /* ---------- CAMPEÕES EXCLUÍDOS / DISPONÍVEIS ---------- */

        const excluded = JSON.parse(
            localStorage.getItem("excludedChampions") || "[]"
        );

        /* Pool ativa: só os campeões das pools marcadas, sem filtro de excluídos */
        let available = poolMode
            ? [...poolChampions]
            : champions.filter(champion => !excluded.includes(champion));

        /* ---------- NÃO REPETIR ---------- */

        /* Lista persistente: consulta os já sorteados antes de sortear
           (ignorada quando há pool ativa) */
        const persist = !poolMode
            && document.getElementById("persistNoRepeat").checked;

        if (persist) {

            const drawn = loadDrawn();

            let pool = available.filter(champion => !drawn.includes(champion));

            if (pool.length < players.length) {

                const ok = confirm(
                    `Restam só ${pool.length} campeão(ões) ainda não sorteado(s), ` +
                    `e são necessários ${players.length}. ` +
                    `Resetar a lista de sorteados e continuar?`
                );

                if (!ok) return;

                resetDrawn(false);

                pool = [...available];

            }

            available = pool;

        }

        /* Regra fixa: nunca repete campeão dentro do mesmo sorteio */
        if (available.length === 0) {
            alert("Todos os campeões estão excluídos.");
            return;
        }

        if (available.length < players.length) {
            alert(
                poolMode
                    ? "As pools marcadas não têm campeões suficientes para todos os jogadores."
                    : "Não existem campeões suficientes disponíveis para esse sorteio."
            );
            return;
        }

        /* ---------- PARES JOGADOR + LANE ---------- */

        let pairs;

        hideRotationNotice();

        if (noRepeatLanes) {

            const rotation = assignLanesWithRotation(
                players,
                selectedLanes,
                shufflePlayers || fullRandom
            );

            pairs = rotation.pairs;

            if (rotation.wasReset) {
                showRotationNotice(
                    "⚠️ Todos já passaram por todas as lanes desta rotação. " +
                    "A rotação foi resetada e esta partida inicia um novo ciclo."
                );
            }

            updateRotationStatus();

        } else {

            pairs = selectedLanes.map((lane, index) => ({
                player: orderedPlayers[index],
                lane: lane
            }));

        }

        /* ---------- ASSOCIA PLAYER + LANE + CAMPEÃO ---------- */

        const results = [];

        pairs.forEach(({ player, lane }) => {

            /* Tira o sorteado da lista para não repetir */
            const randomIndex = Math.floor(Math.random() * available.length);

            const champion = available[randomIndex];

            available.splice(randomIndex, 1);

            results.push({
                player: player,
                lane: lane,
                champion: champion
            });

        });

        /* ---------- ORDENA RESULTADOS ---------- */

        const sounds = pickSounds(results.length);
        results.forEach((r, i) => { r.sound = sounds[i]; });

        results.sort(
            (a, b) => laneOrder.indexOf(a.lane) - laneOrder.indexOf(b.lane)
        );

        /* ---------- GRAVA OS SORTEADOS / GUARDA PARA RESORTEAR ---------- */

        if (persist) addDrawn(results.map(r => r.champion));

        currentResults = results.map(r => ({ ...r }));

        /* ---------- REGISTRA A PARTIDA (estatísticas) ---------- */

        currentMatchId = newMatchId();

        hideResultBar();

        refreshAddPlayerBar();

        saveMatch(currentMatchId, results);

        /* ---------- TRANSMITE AOS ESPECTADORES ---------- */

        broadcastResults(results, currentMatchId);

        /* ---------- ANIMAÇÃO ---------- */

        await animateResults(results, currentMatchId);

        addMatchToHistory(results, currentMatchId);

        /* Pergunta (opcional) como terminou; não bloqueia novos sorteios */
        showResultBar();

        /* Permite adicionar mais um jogador sem refazer o sorteio */
        refreshAddPlayerBar();

    } finally {

        button.disabled = false;

    }

}

