/* =====================================================
   HISTÓRICO DAS ÚLTIMAS PARTIDAS
===================================================== */

const HISTORY_KEY = "matchHistory";
const HISTORY_LIMIT = 20;

function loadMatchHistory() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function addMatchToHistory(results, matchId) {

    const history = loadMatchHistory();

    history.unshift({
        id: matchId || null,
        time: Date.now(),
        entries: results.map(r => ({
            player: r.player,
            lane: r.lane,
            champion: r.champion
        }))
    });

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history.slice(0, HISTORY_LIMIT))
    );

    renderMatchHistory();

}

function renderMatchHistory() {

    /* Durante a animação do sorteio, espera para não mostrar o resultado
       antes da hora (js/reveal.js atualiza no fim) */
    if (typeof drawRevealing === "function" && drawRevealing()) {
        statsHeldDuringReveal = true;
        return;
    }

    const container = document.getElementById("matchHistory");

    const history = loadMatchHistory();

    container.innerHTML = "";

    if (history.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Nenhuma partida sorteada ainda.";
        container.appendChild(empty);
        return;
    }

    history.forEach(match => {

        const item = document.createElement("div");
        item.className = "history-item";

        const when = document.createElement("div");
        when.className = "when";
        when.textContent = new Date(match.time).toLocaleString("pt-BR");

        /* Resultado (vem do Firebase, quando a partida está registrada) */
        const saved = match.id ? statsData.partidas[match.id] : null;
        const savedGlobal = match.id ? globalData.partidas[match.id] : null;

        /* O botão da Riot atualiza o global; partidas antigas não têm a cópia da sala */
        const res = (savedGlobal && savedGlobal.resultado) || (saved && saved.resultado) || null;

        if (res) {
            const tag = document.createElement("span");
            tag.className = "result-tag " + res;
            tag.textContent = res === "vitoria" ? "✅ Vitória"
                : res === "derrota" ? "❌ Derrota" : "🚫 Não deu jogo";
            when.appendChild(tag);
        }

        item.appendChild(when);

        match.entries.forEach(entry => {

            const span = document.createElement("span");
            span.className = "entry";

            const lane = document.createElement("span");
            lane.className = "l";
            lane.textContent = entry.lane + ": ";

            const player = document.createElement("strong");
            player.textContent = entry.player;

            const champion = document.createElement("span");
            champion.className = "c";
            champion.textContent =
                " (" + (championNames[entry.champion] || entry.champion) + ")";

            span.appendChild(lane);
            span.appendChild(player);
            span.appendChild(champion);

            /* Como foi de verdade, se a partida está ligada à Riot */
            const riotData = riotStatsOf(globalData.riot, savedGlobal, playerKey(entry.player));

            if (riotData) {

                const s = riotData.stats;
                const played = riotChampionId(s.champion);

                const line = document.createElement("span");
                line.className = "r";
                line.textContent = " "
                    + (played !== entry.champion ? "→ " + (championNames[played] || played) + " " : "")
                    + s.kills + "/" + s.deaths + "/" + s.assists
                    + " · " + s.gold.toLocaleString("pt-BR") + " gold"
                    + " · " + s.damage.toLocaleString("pt-BR") + " dano"
                    + " · " + s.cs + " farm";

                span.appendChild(line);

            }

            item.appendChild(span);

        });

        /* O resultado vem sozinho ao atualizar as partidas: o histórico só mostra */
        container.appendChild(item);

    });

}

function updateLatestHistory(results) {

    const history = loadMatchHistory();

    if (history.length === 0) return;

    history[0].entries = results.map(r => ({
        player: r.player,
        lane: r.lane,
        champion: r.champion
    }));

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    renderMatchHistory();

}

