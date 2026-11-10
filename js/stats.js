/* =====================================================
   ESTATÍSTICAS
===================================================== */

const STATS_TABS = [
    { id: "players", label: "👥 Jogadores" },
    { id: "lanes", label: "⚔️ Lanes" },
    { id: "achievements", label: "🏆 Conquistas" },
    { id: "champions", label: "🛡️ Campeões" }
];

let statsTab = "players";

const statsSort = {
    champions: { key: "picks", dir: -1 },
    players: { key: "games", dir: -1 },
    lanes: { key: "games", dir: -1 }
};

function ratio(a, b) {
    return (a + b) > 0 ? a / (a + b) : null;
}

function pct(value) {
    return value === null ? "—" : Math.round(value * 100) + "%";
}

function topKey(counts) {

    let best = null;

    Object.keys(counts).forEach(key => {
        if (best === null || counts[key] > counts[best]) best = key;
    });

    return best;

}

function computeStats(src) {

    const champs = {};
    const players = {};
    const lanes = {};

    let total = 0;
    let wins = 0;
    let losses = 0;
    let likes = 0;
    let dislikes = 0;

    const champ = id => champs[id] || (champs[id] = {
        id: id,
        name: championNames[id] || id,
        picks: 0, likes: 0, dislikes: 0, rerolls: 0, wins: 0, losses: 0,
        riot: emptyRiotTotals()
    });

    Object.values(src.partidas || {}).forEach(match => {

        if (!match) return;

        const entries = Object.values(match.entries || {});

        if (entries.length === 0) return;

        /* "Não deu jogo": partida descartada, não entra em nenhuma estatística */
        if (match.resultado === "anulada") return;

        const won = match.resultado === "vitoria";
        const lost = match.resultado === "derrota";

        total++;
        if (won) wins++;
        if (lost) losses++;

        entries.forEach(entry => {

            if (!entry || !entry.champion) return;

            const c = champ(entry.champion);
            c.picks++;
            if (won) c.wins++;
            if (lost) c.losses++;

            const pkey = playerKey(entry.player);

            const p = players[pkey] || (players[pkey] = {
                name: "?", spellings: {},
                games: 0, wins: 0, losses: 0, champs: {}, lanes: {},
                riot: emptyRiotTotals()
            });

            const spelled = normalizePlayerName(entry.player) || "?";
            p.spellings[spelled] = (p.spellings[spelled] || 0) + 1;

            p.games++;
            if (won) p.wins++;
            if (lost) p.losses++;
            p.champs[entry.champion] = (p.champs[entry.champion] || 0) + 1;
            p.lanes[entry.lane] = (p.lanes[entry.lane] || 0) + 1;

            /* O KDA do campeão vale para quem foi jogado, mesmo se houve troca */
            const riotData = riotStatsOf(src.riot, match, pkey);

            if (riotData) {
                addRiotTotals(p.riot, riotData.stats, riotData.seconds);
                addRiotTotals(champ(riotChampionId(riotData.stats.champion)).riot, riotData.stats, riotData.seconds);
            }

            const l = lanes[entry.lane] || (lanes[entry.lane] = {
                name: entry.lane, games: 0, wins: 0, losses: 0
            });

            l.games++;
            if (won) l.wins++;
            if (lost) l.losses++;

        });

        Object.values(match.rerolls || {}).forEach(id => {
            champ(id).rerolls++;
        });

    });

    Object.keys(src.votos || {}).forEach(matchId => {

        /* Votos de partidas anuladas também ficam de fora */
        const voted = (src.partidas || {})[matchId];
        if (voted && voted.resultado === "anulada") return;

        const byChamp = src.votos[matchId] || {};

        Object.keys(byChamp).forEach(id => {

            const c = champ(id);

            Object.values(byChamp[id] || {}).forEach(v => {
                if (v === 1) { c.likes++; likes++; }
                else if (v === -1) { c.dislikes++; dislikes++; }
            });

        });

    });

    const championRows = Object.values(champs).map(c => Object.assign(c, {
        approval: ratio(c.likes, c.dislikes),
        winrate: ratio(c.wins, c.losses),
        kda: riotAverages(c.riot).kda
    }));

    const playerRows = Object.values(players).map(p => {

        const bestChamp = topKey(p.champs);
        const bestLane = topKey(p.lanes);

        return Object.assign(p, {
            /* Exibe a grafia mais usada do nome */
            name: topKey(p.spellings) || "?",
            winrate: ratio(p.wins, p.losses),
            ...riotAverages(p.riot),
            topChampion: bestChamp
                ? (championNames[bestChamp] || bestChamp) + " (" + p.champs[bestChamp] + "x)"
                : "—",
            topLane: bestLane ? bestLane + " (" + p.lanes[bestLane] + "x)" : "—"
        });

    });

    const laneRows = laneOrder
        .filter(name => lanes[name])
        .map(name => Object.assign(lanes[name], {
            winrate: ratio(lanes[name].wins, lanes[name].losses)
        }));

    return {
        total, wins, losses, likes, dislikes,
        championRows, playerRows, laneRows
    };

}

function bestBy(rows, key, minValue) {

    let best = null;

    rows.forEach(row => {

        const value = row[key];

        if (value === null || value < minValue) return;

        if (!best || value > best[key]) best = row;

    });

    return best;

}

function statTile(label, value) {

    const tile = document.createElement("div");
    tile.className = "stat-tile";

    const v = document.createElement("div");
    v.className = "v";
    v.textContent = value;

    const k = document.createElement("div");
    k.className = "k";
    k.textContent = label;

    tile.appendChild(v);
    tile.appendChild(k);

    return tile;

}

function statHighlight(label, row, valueText) {

    const box = document.createElement("div");
    box.className = "stat-hl";

    const img = document.createElement("img");
    img.src = IMAGE_URL + row.id + ".png";
    img.onerror = () => { img.style.display = "none"; };

    const info = document.createElement("div");

    const l = document.createElement("div");
    l.className = "hl-label";
    l.textContent = label;

    const n = document.createElement("div");
    n.className = "hl-name";
    n.textContent = row.name;

    const v = document.createElement("div");
    v.className = "hl-value";
    v.textContent = valueText;

    info.appendChild(l);
    info.appendChild(n);
    info.appendChild(v);

    box.appendChild(img);
    box.appendChild(info);

    return box;

}

function championColumns() {
    return [
        {
            key: "name", label: "Campeão", type: "text",
            value: r => r.name,
            show: r => {
                const wrap = document.createElement("span");
                const img = document.createElement("img");
                img.src = IMAGE_URL + r.id + ".png";
                img.onerror = () => { img.style.display = "none"; };
                wrap.appendChild(img);
                wrap.appendChild(document.createTextNode(r.name));
                return wrap;
            }
        },
        { key: "picks", label: "Sorteios", type: "num", value: r => r.picks },
        { key: "likes", label: "👍", type: "num", value: r => r.likes },
        { key: "dislikes", label: "👎", type: "num", value: r => r.dislikes },
        { key: "approval", label: "Aprovação", type: "num", value: r => r.approval, show: r => pct(r.approval) },
        { key: "rerolls", label: "Resorteios", type: "num", value: r => r.rerolls },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) },
        { key: "played", label: "Jogado", type: "num", value: r => r.riot.games },
        { key: "kda", label: "KDA", type: "num", value: r => r.kda, show: r => formatNumber(r.kda, 2) }
    ];
}

/* Efeito de medalha no nick, recalculado ao abrir a aba Jogadores */
let statsNicks = {};

function playerColumns() {
    return [
        {
            key: "name", label: "Jogador", type: "text", value: r => r.name,
            show: r => decoratedNick(r.name, statsNicks[playerKey(r.name)])
        },
        { key: "games", label: "Partidas", type: "num", value: r => r.games },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) },
        { key: "kda", label: "KDA", type: "num", value: r => r.kda, show: r => formatNumber(r.kda, 2) },
        { key: "goldPerMin", label: "Gold/min", type: "num", value: r => r.goldPerMin, show: r => formatNumber(r.goldPerMin, 0) },
        { key: "damagePerMin", label: "Dano/min", type: "num", value: r => r.damagePerMin, show: r => formatNumber(r.damagePerMin, 0) },
        { key: "csPerMin", label: "Farm/min", type: "num", value: r => r.csPerMin, show: r => formatNumber(r.csPerMin, 1) },
        { key: "visionPerGame", label: "Visão/jogo", type: "num", value: r => r.visionPerGame, show: r => formatNumber(r.visionPerGame, 1) },
        { key: "topChampion", label: "Campeão mais sorteado", type: "text", value: r => r.topChampion },
        { key: "topLane", label: "Lane mais jogada", type: "text", value: r => r.topLane }
    ];
}

function laneColumns() {
    return [
        { key: "name", label: "Lane", type: "text", value: r => r.name },
        { key: "games", label: "Partidas", type: "num", value: r => r.games },
        { key: "wins", label: "V", type: "num", value: r => r.wins },
        { key: "losses", label: "D", type: "num", value: r => r.losses },
        { key: "winrate", label: "Win%", type: "num", value: r => r.winrate, show: r => pct(r.winrate) }
    ];
}

function renderStatsTable(columns, rows) {

    const table = document.getElementById("statsTable");

    table.innerHTML = "";

    const sort = statsSort[statsTab];
    const sortCol = columns.find(c => c.key === sort.key) || columns[0];

    const sorted = [...rows].sort((a, b) => {

        const va = sortCol.value(a);
        const vb = sortCol.value(b);

        let result;

        if (sortCol.type === "text") {
            result = String(va).localeCompare(String(vb), "pt-BR");
        } else {
            result = (va === null ? -1 : va) - (vb === null ? -1 : vb);
        }

        if (result !== 0) return result * sort.dir;

        return String(a.name).localeCompare(String(b.name), "pt-BR");

    });

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    columns.forEach(col => {

        const th = document.createElement("th");

        th.textContent = col.label +
            (col.key === sortCol.key ? (sort.dir === 1 ? " ▲" : " ▼") : "");

        th.onclick = () => {

            if (sort.key === col.key) {
                sort.dir = -sort.dir;
            } else {
                sort.key = col.key;
                sort.dir = col.type === "text" ? 1 : -1;
            }

            renderStats();

        };

        headRow.appendChild(th);

    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    sorted.forEach(row => {

        const tr = document.createElement("tr");

        columns.forEach(col => {

            const td = document.createElement("td");

            const content = col.show ? col.show(row) : col.value(row);

            if (content instanceof Node) {
                td.appendChild(content);
            } else {
                td.textContent = content === null ? "—" : String(content);
            }

            tr.appendChild(td);

        });

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

}

function renderStats() {

    const body = document.getElementById("statsBody");
    const empty = document.getElementById("statsEmpty");

    const isGlobal = true;

    document.getElementById("statsInfo").textContent =
        "Soma de todos os sorteios já feitos. Partidas marcadas como \"Não deu jogo\" não entram. KDA, gold, dano, farm e visão vêm da Riot e só consideram partidas ligadas. Clique no título de uma coluna para ordenar.";

    if (!db) {
        empty.textContent =
            IS_LOCAL
                ? "Estatísticas indisponíveis em modo local (Firebase desligado)."
                : "Estatísticas indisponíveis: o Firebase não está configurado.";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    if (isGlobal && !(globalLoaded.partidas && globalLoaded.votos)) {
        empty.textContent = "Carregando estatísticas globais...";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    const stats = computeStats(isGlobal ? globalData : statsData);

    if (stats.total === 0 && stats.likes + stats.dislikes === 0) {
        empty.textContent = isGlobal
            ? "Nenhuma partida global registrada ainda (ou sem permissão de leitura nas regras do Firebase)."
            : "Nenhuma partida registrada ainda. Faça um sorteio para começar.";
        empty.style.display = "block";
        body.style.display = "none";
        return;
    }

    empty.style.display = "none";
    body.style.display = "block";

    /* Resumo */
    const summary = document.getElementById("statsSummary");
    summary.innerHTML = "";

    summary.appendChild(statTile("Partidas", stats.total));
    summary.appendChild(statTile("Vitórias", stats.wins));
    summary.appendChild(statTile("Derrotas", stats.losses));
    summary.appendChild(statTile("Winrate", pct(ratio(stats.wins, stats.losses))));
    summary.appendChild(statTile("👍 Likes", stats.likes));
    summary.appendChild(statTile("👎 Dislikes", stats.dislikes));

    /* Destaques */
    const highlights = document.getElementById("statsHighlights");
    highlights.innerHTML = "";

    const rows = stats.championRows;

    const mostPicked = bestBy(rows, "picks", 1);
    const mostLoved = bestBy(rows, "likes", 1);
    const mostHated = bestBy(rows, "dislikes", 1);
    const mostRerolled = bestBy(rows, "rerolls", 1);
    const bestWinrate = bestBy(
        rows.filter(r => r.wins + r.losses >= 2), "winrate", 0
    );

    if (mostPicked) highlights.appendChild(
        statHighlight("Mais sorteado", mostPicked, mostPicked.picks + "x"));

    if (mostLoved) highlights.appendChild(
        statHighlight("Mais amado", mostLoved, "👍 " + mostLoved.likes));

    if (mostHated) highlights.appendChild(
        statHighlight("Mais odiado", mostHated, "👎 " + mostHated.dislikes));

    if (mostRerolled) highlights.appendChild(
        statHighlight("Mais resorteado", mostRerolled, mostRerolled.rerolls + "x"));

    if (bestWinrate) highlights.appendChild(
        statHighlight(
            "Melhor winrate", bestWinrate,
            pct(bestWinrate.winrate) + " (" + bestWinrate.wins + "V " + bestWinrate.losses + "D)"
        ));

    /* Abas */
    const tabs = document.getElementById("statsTabs");
    tabs.innerHTML = "";

    STATS_TABS.forEach(tab => {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mini-btn" + (tab.id === statsTab ? " active" : "");
        button.textContent = tab.label;
        button.onclick = () => {
            statsTab = tab.id;
            renderStats();
        };

        tabs.appendChild(button);

    });

    /* Conquistas usam cards no lugar da tabela */
    const onAchievements = statsTab === "achievements";

    document.getElementById("statsTableWrap").style.display = onAchievements ? "none" : "";
    document.getElementById("statsAchievements").style.display = onAchievements ? "" : "none";

    if (onAchievements) {
        document.getElementById("statsInfo").textContent =
            "Títulos vão para quem lidera cada categoria (empate divide). Medalhas são metas pessoais: veja acima como ganhar cada uma e quanto falta para cada jogador.";
        renderAchievements(isGlobal ? globalData : statsData);
        return;
    }

    /* Tabela da aba atual */
    if (statsTab === "champions") {
        renderStatsTable(championColumns(), stats.championRows);
    } else if (statsTab === "players") {
        statsNicks = nickClassMap(isGlobal ? globalData : statsData);
        renderStatsTable(playerColumns(), stats.playerRows);
    } else {
        renderStatsTable(laneColumns(), stats.laneRows);
    }

}

