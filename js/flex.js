/* =====================================================
   FLEX DOS GURI (página escondida flex.html)

   Estatísticas das partidas de Ranked Flex do Fer e do Rony.
   Os dados vêm do Worker (GET /flex), que lê privado/flex no
   Firebase. O botão "Atualizar" chama POST /flex/atualizar.

   Para testar com um arquivo local: flex.html?fonte=arquivo.json
===================================================== */

const FLEX_NAMES = { fer: "Fer", rony: "Rony" };

const FLEX_LANES = {
    TOP: { name: "Topo", icon: "🛡️" },
    JUNGLE: { name: "Selva", icon: "🌲" },
    MIDDLE: { name: "Meio", icon: "✨" },
    BOTTOM: { name: "Atirador", icon: "🏹" },
    UTILITY: { name: "Suporte", icon: "💚" }
};

/* Referências aproximadas por lane (elo médio), só para comparação */
const FLEX_TARGETS = {
    TOP: { csMin: 7, visionMin: 0.8, wards: 1 },
    JUNGLE: { csMin: 5.5, visionMin: 1.1, wards: 2 },
    MIDDLE: { csMin: 7.5, visionMin: 0.8, wards: 1 },
    BOTTOM: { csMin: 8, visionMin: 0.7, wards: 1 },
    UTILITY: { csMin: null, visionMin: 2.2, wards: 3 }
};

/* Mínimo de partidas para falar de um campeão ou lane */
const FLEX_MIN_SAMPLE = 3;

let flexGames = [];
let flexMeta = null;
let flexTab = "fer";

/* Nome bonito do campeão ("MonkeyKing" -> "Wukong"), vindo do Data Dragon */
let champNames = {};

/* Classes, atributos e alcance de cada campeão (para a sugestão de pick) */
let champData = {};
const champName = id => champNames[id] || id;

/* -------------------- Utilidades -------------------- */

const fmt = (value, digits = 1) => Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits, maximumFractionDigits: digits
});

const pct = value => Math.round((value || 0) * 100) + "%";

const avg = (list, fn) => list.length ? list.reduce((s, x) => s + (fn(x) || 0), 0) / list.length : 0;

const laneName = pos => (FLEX_LANES[pos] || { name: pos || "?" }).name;
const laneIcon = pos => (FLEX_LANES[pos] || { icon: "❔" }).icon;

function kdaValue(k, d, a) {
    return (k + a) / Math.max(1, d);
}

function shortDate(time) {
    return new Date(time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function champIcon(champion) {
    const img = el("img", "flex-champ-icon");
    img.src = IMAGE_URL + champion + ".png";
    img.alt = champName(champion);
    img.title = champName(champion);
    img.loading = "lazy";
    img.onerror = () => { img.style.visibility = "hidden"; };
    return img;
}

function card(title, extraClass) {
    const box = el("section", "card flex-card" + (extraClass ? " " + extraClass : ""));
    if (title) box.appendChild(el("h2", "flex-h", title));
    return box;
}

/* -------------------- Dados por jogador -------------------- */

/* Partidas de um jogador, da mais nova para a mais antiga */
function gamesOf(key) {

    const other = key === "fer" ? "rony" : "fer";

    return flexGames
        .filter(g => g.players[key])
        .map(g => {
            const s = g.players[key];
            const minutes = Math.max(1, s.minutes || g.duration / 60);
            return Object.assign({}, s, {
                id: g.id,
                start: g.start,
                duration: g.duration,
                together: !!g.players[other],
                csMin: s.cs / minutes,
                goldMin: s.gold / minutes,
                dmgMin: s.damage / minutes,
                visionMin: s.vision / minutes,
                /* Campos usados pela nota (js/flex-score.js) */
                kp: s.killParticipation || 0,
                wardsMin: (s.wardsPlaced || 0) / minutes,
                healShieldMin: (s.healShield || 0) / minutes,
                ccMin: (s.ccTime || 0) / minutes,
                takenMin: (s.damageTaken || 0) / minutes
            });
        });

}

function summarize(list) {

    const wins = list.filter(g => g.win).length;
    const sum = f => list.reduce((s, g) => s + g[f], 0);

    return {
        games: list.length,
        wins,
        losses: list.length - wins,
        wr: list.length ? wins / list.length : 0,
        kills: avg(list, g => g.kills),
        deaths: avg(list, g => g.deaths),
        assists: avg(list, g => g.assists),
        kda: kdaValue(sum("kills"), sum("deaths"), sum("assists")),
        csMin: avg(list, g => g.csMin),
        goldMin: avg(list, g => g.goldMin),
        dmgMin: avg(list, g => g.dmgMin),
        visionMin: avg(list, g => g.visionMin),
        kp: avg(list, g => g.killParticipation),
        dmgShare: avg(list, g => g.damageShare),
        wards: avg(list, g => g.controlWards),
        csAt10: avg(list, g => g.csAt10)
    };

}

/* Nota de 0 a 10 de cada partida, comparando com as outras partidas do
   mesmo jogador na mesma lane (a conta fica em js/flex-score.js) */
function scoreGames(list) {
    scorePerformances(list, 2.2);
    list.forEach(markTeamContext);
}

/* ---------- Derrota "de tabela" e vitória "carregado" ----------

   Olha se a pessoa fez a parte dela, independente do resultado:
   1. lane: não perdeu a lane para o oponente direto (ouro e mortes);
   2. time: KDA melhor que o resto do time e não morreu mais que eles;
   3. nota: nota da partida boa (5,5 ou mais).
   Derrota com 2 dos 3 = "de tabela": não pesa contra o campeão.
   Vitória com 0 dos 3 = "carregado": não conta como mérito. */

const median = values => {
    const v = values.slice().sort((a, b) => a - b);
    return v.length ? (v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2) : 0;
};

function markTeamContext(g) {

    g.tabela = false;
    g.carried = false;
    g.contextWhy = [];

    const team = g.team;

    if (!team || !team.allies || team.allies.length === 0) return;

    const myKda = kdaValue(g.kills, g.deaths, g.assists);
    const allyKda = median(team.allies.map(a => kdaValue(a.k, a.d, a.a)));
    const allyDeaths = avg(team.allies, a => a.d);

    const laneOk = g.opp ? (g.gold - g.opp.gold >= -500 && g.deaths <= g.opp.deaths + 1) : null;
    const teamOk = myKda >= allyKda && g.deaths <= allyDeaths + 0.5;
    const scoreOk = g.score >= 5.5;

    const checks = [laneOk, teamOk, scoreOk].filter(x => x !== null);
    const passed = checks.filter(Boolean).length;

    if (!g.win && passed >= 2) {

        g.tabela = true;

        if (laneOk) g.contextWhy.push("ganhou ou empatou a lane contra " + champName(g.opp.champion));
        if (teamOk) g.contextWhy.push("KDA " + fmt(myKda, 1) + " contra " + fmt(allyKda, 1) + " do resto do time");
        if (scoreOk) g.contextWhy.push("nota " + fmt(g.score, 1));

        /* Quem afundou: aliado com muitas mortes e KDA ruim */
        const sunk = team.allies
            .filter(a => a.d >= 7 && kdaValue(a.k, a.d, a.a) < 1.5)
            .sort((a, b) => b.d - a.d)[0];

        if (sunk) g.contextWhy.push(champName(sunk.c) + " foi " + sunk.k + "/" + sunk.d + "/" + sunk.a);

    } else if (g.win && passed === 0) {

        g.carried = true;
        if (laneOk === false) g.contextWhy.push("perdeu a lane para " + champName(g.opp.champion));
        g.contextWhy.push("KDA " + fmt(myKda, 1) + " contra " + fmt(allyKda, 1) + " do resto do time");
        g.contextWhy.push("nota " + fmt(g.score, 1));

    }

}

function groupBy(list, keyFn) {
    const groups = {};
    list.forEach(g => { (groups[keyFn(g)] = groups[keyFn(g)] || []).push(g); });
    return groups;
}

/* -------------------- Pontos fortes e o que melhorar -------------------- */

/* Diferença relativa; "lower" = quanto menos, melhor */
function relDiff(mine, theirs, lower) {
    const d = (mine - theirs) / Math.max(Math.abs(theirs), 0.01);
    return lower ? -d : d;
}

function insights(list) {

    const good = [];
    const bad = [];
    const push = (diff, item) => (diff >= 0 ? good : bad).push(Object.assign({ weight: Math.abs(diff) }, item));

    /* 1. Contra o oponente direto de lane */
    const laned = list.filter(g => g.opp && g.opp.position === g.position);

    if (laned.length >= FLEX_MIN_SAMPLE) {

        const oppMin = g => Math.max(1, g.opp.minutes || g.duration / 60);

        const VS = [
            { label: "CS por minuto", mine: g => g.csMin, theirs: g => g.opp.cs / oppMin(g), skipSupport: true },
            { label: "Ouro por minuto", mine: g => g.goldMin, theirs: g => g.opp.gold / oppMin(g), digits: 0 },
            { label: "Dano por minuto", mine: g => g.dmgMin, theirs: g => g.opp.damage / oppMin(g), digits: 0 },
            { label: "Visão por minuto", mine: g => g.visionMin, theirs: g => g.opp.vision / oppMin(g), digits: 2 },
            { label: "Mortes por partida", mine: g => g.deaths, theirs: g => g.opp.deaths, lower: true }
        ];

        VS.forEach(m => {

            const games = m.skipSupport ? laned.filter(g => g.position !== "UTILITY") : laned;

            if (games.length < FLEX_MIN_SAMPLE) return;

            const mine = avg(games, m.mine);
            const theirs = avg(games, m.theirs);
            const diff = relDiff(mine, theirs, m.lower);

            if (Math.abs(diff) < 0.08) return;

            const gap = Math.round(Math.abs(mine - theirs) / Math.max(Math.abs(theirs), 0.01) * 100);

            push(diff, {
                icon: "⚔️",
                title: m.label + " contra o oponente de lane",
                text: fmt(mine, m.digits) + " contra " + fmt(theirs, m.digits)
                    + " do adversário direto (" + gap + "% " + (mine > theirs ? "a mais" : "a menos") + ", em " + games.length + " partidas)"
            });

        });

    }

    /* 2. Referência da lane mais jogada */
    const lanes = groupBy(list, g => g.position);
    const main = Object.keys(lanes).sort((a, b) => lanes[b].length - lanes[a].length)[0];
    const target = FLEX_TARGETS[main];

    if (target && lanes[main].length >= FLEX_MIN_SAMPLE) {

        const games = lanes[main];
        const where = " de " + laneName(main);

        if (target.csMin) {
            const cs = avg(games, g => g.csMin);
            const diff = relDiff(cs, target.csMin);
            if (Math.abs(diff) >= 0.1) push(diff, {
                icon: "🌾", title: "Farm" + where,
                text: fmt(cs) + " CS por minuto (referência: ~" + fmt(target.csMin) + ")"
            });
        }

        const vision = avg(games, g => g.visionMin);
        const visionDiff = relDiff(vision, target.visionMin);
        if (Math.abs(visionDiff) >= 0.15) push(visionDiff, {
            icon: "👁️", title: "Visão" + where,
            text: fmt(vision, 2) + " de placar de visão por minuto (referência: ~" + fmt(target.visionMin, 1) + ")"
        });

        const wards = avg(games, g => g.controlWards);
        const wardsDiff = relDiff(wards, target.wards);
        if (Math.abs(wardsDiff) >= 0.25) push(wardsDiff * 0.6, {
            icon: "🔴", title: "Sentinelas de controle",
            text: fmt(wards) + " por partida (referência" + where + ": ~" + target.wards + ")"
        });

    }

    /* 3. Gerais */
    const s = summarize(list);

    if (s.deaths >= 6) push(-(s.deaths - 5) / 5, {
        icon: "💀", title: "Mortes", text: fmt(s.deaths) + " mortes por partida em média"
    });
    else if (s.deaths <= 3.5) push((5 - s.deaths) / 5, {
        icon: "🧱", title: "Morre pouco", text: fmt(s.deaths) + " mortes por partida em média"
    });

    if (s.kp >= 0.6) push(s.kp - 0.5, {
        icon: "🤝", title: "Participação em abates", text: pct(s.kp) + " dos abates do time têm você no meio"
    });
    else if (s.kp < 0.42) push(s.kp - 0.5, {
        icon: "🤝", title: "Participação em abates", text: "só " + pct(s.kp) + " dos abates do time têm você no meio"
    });

    /* 4. Campeões e lanes que mais ajudam ou atrapalham */
    const champs = groupBy(list, g => g.champion);

    Object.keys(champs).forEach(c => {
        const games = champs[c];
        if (games.length < FLEX_MIN_SAMPLE) return;
        const wr = games.filter(g => g.win).length / games.length;
        if (wr >= 0.65 || wr <= 0.35) push((wr - 0.5) * 1.2, {
            icon: wr >= 0.5 ? "⭐" : "🚩", title: champName(c),
            text: pct(wr) + " de vitórias em " + games.length + " partidas"
                + (wr >= 0.5 ? "" : ": vale repensar o pick")
        });
    });

    Object.keys(lanes).forEach(pos => {
        const games = lanes[pos];
        if (games.length < FLEX_MIN_SAMPLE || !FLEX_LANES[pos]) return;
        const wr = games.filter(g => g.win).length / games.length;
        if (wr >= 0.65 || wr <= 0.35) push((wr - 0.5), {
            icon: laneIcon(pos), title: "Jogando de " + laneName(pos),
            text: pct(wr) + " de vitórias em " + games.length + " partidas"
        });
    });

    const sort = arr => arr.sort((a, b) => b.weight - a.weight).slice(0, 5);

    return { good: sort(good), bad: sort(bad) };

}

/* O que mais muda entre vitória e derrota */
function decisive(list) {

    const wins = list.filter(g => g.win);
    const losses = list.filter(g => !g.win);

    if (wins.length < FLEX_MIN_SAMPLE || losses.length < FLEX_MIN_SAMPLE) return [];

    const METRICS = [
        { label: "mortes", value: g => g.deaths, digits: 1, minAbs: 1 },
        { label: "de participação em abates", value: g => g.killParticipation, percent: true, minAbs: 0.05 },
        { label: "do dano do time", value: g => g.damageShare, percent: true, minAbs: 0.03 },
        { label: "de visão por minuto", value: g => g.visionMin, digits: 2, minAbs: 0.1 },
        { label: "CS por minuto", value: g => g.csMin, digits: 1, minAbs: 0.5 },
        { label: "CS aos 10 minutos", value: g => g.csAt10, digits: 0, minAbs: 5 },
        { label: "sentinelas de controle", value: g => g.controlWards, digits: 1, minAbs: 0.5 }
    ];

    return METRICS
        .map(m => {
            const w = avg(wins, m.value);
            const l = avg(losses, m.value);
            return Object.assign({ w, l, gap: Math.abs(w - l) / Math.max(Math.abs(w), Math.abs(l), 0.01) }, m);
        })
        .filter(m => m.gap >= 0.15 && Math.abs(m.w - m.l) >= m.minAbs)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 3)
        .map(m => {
            const show = v => m.percent ? pct(v) : fmt(v, m.digits);
            return "Nas vitórias: " + show(m.w) + " " + m.label + ". Nas derrotas: " + show(m.l) + ".";
        });

}

/* -------------------- Telas -------------------- */

function statTile(label, value, sub) {
    const tile = el("div", "flex-tile");
    tile.appendChild(el("span", "flex-tile-value", value));
    tile.appendChild(el("span", "flex-tile-label", label));
    if (sub) tile.appendChild(el("span", "flex-tile-sub", sub));
    return tile;
}

function summaryCard(list) {

    const s = summarize(list);
    const box = card("📊 Resumo");

    const tiles = el("div", "flex-tiles");
    tiles.appendChild(statTile("Partidas", String(s.games), s.wins + "V · " + s.losses + "D"));
    tiles.appendChild(statTile("Vitórias", pct(s.wr)));
    tiles.appendChild(statTile("KDA", fmt(s.kda, 2), fmt(s.kills) + " / " + fmt(s.deaths) + " / " + fmt(s.assists)));
    tiles.appendChild(statTile("Part. em abates", pct(s.kp)));
    tiles.appendChild(statTile("Dano do time", pct(s.dmgShare), fmt(s.dmgMin, 0) + " por min"));
    tiles.appendChild(statTile("CS por min", fmt(s.csMin), fmt(s.csAt10, 0) + " aos 10 min"));
    tiles.appendChild(statTile("Ouro por min", fmt(s.goldMin, 0)));
    tiles.appendChild(statTile("Visão por min", fmt(s.visionMin, 2), fmt(s.wards) + " sentinelas de controle"));

    const losses = list.filter(g => !g.win);
    const tabela = losses.filter(g => g.tabela).length;
    const carried = list.filter(g => g.carried).length;

    if (losses.length) {
        tiles.appendChild(statTile("Derrotas de tabela", tabela + " de " + losses.length,
            "fez a parte e o time não" + (carried ? " · " + carried + (carried > 1 ? " vitórias carregadas" : " vitória carregada") : "")));
    }
    box.appendChild(tiles);

    /* Forma recente */
    const recent = list.slice(0, 15);
    const form = el("div", "flex-form");
    form.appendChild(el("span", "flex-form-label", "Últimas " + recent.length + ":"));

    recent.slice().reverse().forEach(g => {
        const dot = el("span", "flex-dot " + (g.win ? "win" : "loss"), g.win ? "V" : "D");
        dot.title = shortDate(g.start) + " · " + champName(g.champion) + " · " + g.kills + "/" + g.deaths + "/" + g.assists;
        form.appendChild(dot);
    });

    let streak = 0;
    while (streak < list.length && list[streak].win === list[0].win) streak++;

    if (list.length) {
        form.appendChild(el("span", "flex-streak " + (list[0].win ? "win" : "loss"),
            (list[0].win ? "🔥 " : "🥶 ") + streak + (list[0].win ? " vitória" : " derrota") + (streak > 1 ? "s" : "") + " seguida" + (streak > 1 ? "s" : "")));
    }

    box.appendChild(form);

    return box;

}

function insightsCard(list) {

    const { good, bad } = insights(list);
    const box = card("🧭 Análise");

    const cols = el("div", "flex-insights");

    [["💪 Pontos fortes", good, "good"], ["🛠️ O que melhorar", bad, "bad"]].forEach(([title, items, kind]) => {

        const col = el("div", "flex-insight-col " + kind);
        col.appendChild(el("h3", null, title));

        if (items.length === 0) col.appendChild(el("p", "flex-muted", "Nada que se destaque ainda."));

        items.forEach(item => {
            const row = el("div", "flex-insight");
            row.appendChild(el("span", "flex-insight-icon", item.icon));
            const body = el("div");
            body.appendChild(el("strong", null, item.title));
            body.appendChild(el("span", null, item.text));
            row.appendChild(body);
            col.appendChild(row);
        });

        cols.appendChild(col);

    });

    box.appendChild(cols);

    const keys = decisive(list);

    if (keys.length) {
        const dec = el("div", "flex-decisive");
        dec.appendChild(el("h3", null, "🎯 O que mais muda entre vitória e derrota"));
        const ul = el("ul");
        keys.forEach(text => ul.appendChild(el("li", null, text)));
        dec.appendChild(ul);
        box.appendChild(dec);
    }

    box.appendChild(el("p", "flex-note",
        "Referências de farm e visão são aproximadas, só para ter um norte. Comparação com oponente usa quem jogou na mesma lane do outro time."));

    return box;

}

function table(headers, rows) {

    const wrap = el("div", "flex-table-wrap");
    const t = el("table", "flex-table");
    const head = el("tr");
    headers.forEach(h => head.appendChild(el("th", null, h)));
    t.appendChild(el("thead")).appendChild(head);
    const body = el("tbody");
    rows.forEach(cells => {
        const tr = el("tr");
        cells.forEach(c => {
            const td = el("td");
            if (c instanceof Node) td.appendChild(c); else td.textContent = c;
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
    t.appendChild(body);
    wrap.appendChild(t);
    return wrap;

}

function wrCell(s) {
    const span = el("span", "flex-wr " + (s.wr >= 0.55 ? "good" : s.wr <= 0.45 ? "bad" : ""), pct(s.wr));
    span.title = s.wins + "V · " + s.losses + "D";
    return span;
}

function laneCard(list) {

    const lanes = groupBy(list, g => g.position);
    const box = card("🗺️ Por lane");

    const rows = Object.keys(lanes)
        .sort((a, b) => lanes[b].length - lanes[a].length)
        .map(pos => {
            const games = lanes[pos];
            const s = summarize(games);
            const laned = games.filter(g => g.opp);
            const goldDiff = avg(laned, g => g.gold - g.opp.gold);
            const diff = el("span", "flex-diff " + (goldDiff >= 0 ? "good" : "bad"),
                laned.length ? (goldDiff >= 0 ? "+" : "") + fmt(goldDiff, 0) : "—");
            return [laneIcon(pos) + " " + laneName(pos), String(s.games), wrCell(s), fmt(s.kda, 2),
                pos === "UTILITY" ? "—" : fmt(s.csMin), fmt(s.visionMin, 2), pct(s.dmgShare), diff];
        });

    box.appendChild(table(["Lane", "Jogos", "Vitórias", "KDA", "CS/min", "Visão/min", "Dano", "Ouro vs oponente"], rows));

    return box;

}

function champCard(list) {

    const champs = groupBy(list, g => g.champion);
    const box = card("🦸 Por campeão");

    const rows = Object.keys(champs)
        .sort((a, b) => champs[b].length - champs[a].length || summarize(champs[b]).wr - summarize(champs[a]).wr)
        .map(c => {
            const s = summarize(champs[c]);
            const name = el("span", "flex-champ");
            name.appendChild(champIcon(c));
            name.appendChild(document.createTextNode(champName(c)));
            return [name, String(s.games), wrCell(s), fmt(s.kda, 2),
                fmt(s.kills) + "/" + fmt(s.deaths) + "/" + fmt(s.assists), fmt(s.csMin), pct(s.dmgShare)];
        });

    box.appendChild(table(["Campeão", "Jogos", "Vitórias", "KDA", "K/D/A", "CS/min", "Dano"], rows));

    return box;

}

function gameLine(g, extra) {

    const row = el("div", "flex-game " + (g.win ? "win" : "loss"));
    row.appendChild(champIcon(g.champion));

    const info = el("div", "flex-game-info");
    info.appendChild(el("strong", null, champName(g.champion) + " · " + laneName(g.position)));
    info.appendChild(el("span", null,
        g.kills + "/" + g.deaths + "/" + g.assists + " · " + g.cs + " CS · " + pct(g.damageShare) + " do dano · "
        + shortDate(g.start) + " · " + Math.round(g.duration / 60) + " min"
        + (g.opp ? " · contra " + champName(g.opp.champion) : "")));
    row.appendChild(info);

    const score = el("span", "flex-score", fmt(g.score, 1));
    score.title = "Nota da partida (comparada com as suas outras na mesma lane)";
    row.appendChild(score);

    if (g.tabela || g.carried) {
        const tag = el("span", "flex-game-tag " + (g.tabela ? "tabela" : "carried"), g.tabela ? "🧱 de tabela" : "🎒 carregado");
        tag.title = g.contextWhy.join(" · ");
        row.appendChild(tag);
    }

    if (extra) row.appendChild(el("span", "flex-game-tag", extra));

    return row;

}

function bestWorstCard(list) {

    const box = card("🏅 Melhores e piores partidas");
    const sorted = list.slice().sort((a, b) => b.score - a.score);
    const cols = el("div", "flex-insights");

    [["🐐 Melhores", sorted.slice(0, 3), "good"], ["🍼 Piores", sorted.slice(-3).reverse(), "bad"]].forEach(([title, games, kind]) => {
        const col = el("div", "flex-insight-col " + kind);
        col.appendChild(el("h3", null, title));
        games.forEach(g => col.appendChild(gameLine(g)));
        cols.appendChild(col);
    });

    box.appendChild(cols);

    /* Recordes pessoais */
    const RECORDS = [
        ["🗡️ Mais abates", g => g.kills, g => g.kills + " abates"],
        ["💥 Mais dano", g => g.damage, g => g.damage.toLocaleString("pt-BR") + " de dano"],
        ["🌾 Mais CS por min", g => g.csMin, g => fmt(g.csMin) + " CS/min"],
        ["👁️ Mais visão", g => g.vision, g => g.vision + " de visão"],
        ["🤝 Mais assistências", g => g.assists, g => g.assists + " assistências"],
        ["💀 Mais mortes", g => g.deaths, g => g.deaths + " mortes"]
    ];

    const recs = el("div", "flex-records");

    RECORDS.forEach(([label, value, text]) => {
        const g = list.reduce((best, x) => !best || value(x) > value(best) ? x : best, null);
        if (!g) return;
        const r = el("div", "flex-record");
        r.appendChild(el("span", "flex-record-label", label));
        const v = el("span", "flex-record-value");
        v.appendChild(champIcon(g.champion));
        v.appendChild(document.createTextNode(text(g)));
        r.appendChild(v);
        r.appendChild(el("span", "flex-muted", shortDate(g.start) + (g.win ? " · vitória" : " · derrota")));
        recs.appendChild(r);
    });

    box.appendChild(el("h3", "flex-sub-h", "📌 Recordes pessoais"));
    box.appendChild(recs);

    return box;

}

function historyCard(list) {

    const box = card(null);
    const details = el("details", "flex-history");
    details.appendChild(el("summary", null, "🕑 Todas as partidas (" + list.length + ")"));
    list.forEach(g => details.appendChild(gameLine(g, g.together ? null : "solo")));
    box.appendChild(details);
    return box;

}

function renderPlayer(key) {

    const list = gamesOf(key);
    const content = document.getElementById("flexContent");

    scoreGames(list);

    if (list.length === 0) {
        content.appendChild(el("div", "card flex-empty", "Nenhuma partida de Flex do " + FLEX_NAMES[key] + " ainda."));
        return;
    }

    content.appendChild(summaryCard(list));
    content.appendChild(insightsCard(list));
    content.appendChild(picksCard(list));
    content.appendChild(laneCard(list));
    content.appendChild(champCard(list));
    content.appendChild(bestWorstCard(list));
    content.appendChild(historyCard(list));

}

/* -------------------- Dupla -------------------- */

function renderDuo() {

    const content = document.getElementById("flexContent");
    const fer = gamesOf("fer");
    const rony = gamesOf("rony");

    scoreGames(fer);
    scoreGames(rony);

    const ronyById = {};
    rony.forEach(g => { ronyById[g.id] = g; });

    const pairs = fer.filter(g => ronyById[g.id]).map(g => ({ fer: g, rony: ronyById[g.id] }));

    if (pairs.length === 0) {
        content.appendChild(el("div", "card flex-empty", "Nenhuma partida juntos ainda."));
        return;
    }

    /* Resumo da dupla */
    const wins = pairs.filter(p => p.fer.win).length;
    const box = card("👬 Fer + Rony");
    const tiles = el("div", "flex-tiles");
    tiles.appendChild(statTile("Partidas juntos", String(pairs.length), wins + "V · " + (pairs.length - wins) + "D"));
    tiles.appendChild(statTile("Vitórias juntos", pct(wins / pairs.length)));

    [["fer", fer], ["rony", rony]].forEach(([key, list]) => {
        const solo = list.filter(g => !g.together);
        if (solo.length) {
            const s = summarize(solo);
            tiles.appendChild(statTile(FLEX_NAMES[key] + " sem o outro", pct(s.wr), s.games + " partida" + (s.games > 1 ? "s" : "")));
        }
    });

    /* Quem foi melhor em cada partida, pela nota */
    const ferBetter = pairs.filter(p => p.fer.score > p.rony.score).length;
    tiles.appendChild(statTile("Melhor nota na partida", "Fer " + ferBetter + " × " + (pairs.length - ferBetter) + " Rony"));

    box.appendChild(tiles);
    content.appendChild(box);

    /* Lado a lado */
    const side = card("⚖️ Lado a lado (partidas juntos)");
    const sf = summarize(pairs.map(p => p.fer));
    const sr = summarize(pairs.map(p => p.rony));

    const COMPARE = [
        ["KDA", s => s.kda, v => fmt(v, 2)],
        ["Mortes por partida", s => s.deaths, v => fmt(v), true],
        ["Participação em abates", s => s.kp, pct],
        ["Dano do time", s => s.dmgShare, pct],
        ["Ouro por min", s => s.goldMin, v => fmt(v, 0)],
        ["Visão por min", s => s.visionMin, v => fmt(v, 2)],
        ["Sentinelas de controle", s => s.wards, v => fmt(v)]
    ];

    side.appendChild(table(["", "Fer", "Rony"], COMPARE.map(([label, get, show, lower]) => {
        const a = get(sf);
        const b = get(sr);
        const better = lower ? (a < b ? "fer" : "rony") : (a > b ? "fer" : "rony");
        return [label,
            el("span", better === "fer" ? "flex-better" : "", show(a)),
            el("span", better === "rony" ? "flex-better" : "", show(b))];
    })));

    content.appendChild(side);

    /* Combinações de lane */
    const combos = groupBy(pairs, p => p.fer.position + "|" + p.rony.position);
    const comboCard = card("🗺️ Combinações de lane");

    comboCard.appendChild(table(["Fer", "Rony", "Jogos", "Vitórias"],
        Object.keys(combos)
            .sort((a, b) => combos[b].length - combos[a].length)
            .map(k => {
                const [pf, pr] = k.split("|");
                const games = combos[k];
                const s = { wins: games.filter(p => p.fer.win).length, games: games.length };
                s.losses = s.games - s.wins;
                s.wr = s.wins / s.games;
                return [laneIcon(pf) + " " + laneName(pf), laneIcon(pr) + " " + laneName(pr), String(s.games), wrCell(s)];
            })));

    content.appendChild(comboCard);
    content.appendChild(duoPicksCard(pairs));

    /* Duplas de campeões */
    const champPairs = groupBy(pairs, p => p.fer.champion + "|" + p.rony.champion);
    const champCardBox = card("🦸 Duplas de campeões");

    champCardBox.appendChild(table(["Fer", "Rony", "Jogos", "Vitórias"],
        Object.keys(champPairs)
            .sort((a, b) => champPairs[b].length - champPairs[a].length)
            .slice(0, 12)
            .map(k => {
                const [cf, cr] = k.split("|");
                const games = champPairs[k];
                const s = { wins: games.filter(p => p.fer.win).length, games: games.length };
                s.losses = s.games - s.wins;
                s.wr = s.wins / s.games;
                const a = el("span", "flex-champ"); a.appendChild(champIcon(cf)); a.appendChild(document.createTextNode(champName(cf)));
                const b = el("span", "flex-champ"); b.appendChild(champIcon(cr)); b.appendChild(document.createTextNode(champName(cr)));
                return [a, b, String(s.games), wrCell(s)];
            })));

    content.appendChild(champCardBox);

}

/* -------------------- Sugestão de pick -------------------- */

/* Classes do Data Dragon */
const CLASS_INFO = {
    Assassin: { name: "Assassino", icon: "🗡️" },
    Fighter: { name: "Lutador", icon: "🪓" },
    Mage: { name: "Mago", icon: "🔮" },
    Marksman: { name: "Atirador", icon: "🏹" },
    Support: { name: "Suporte", icon: "💚" },
    Tank: { name: "Tanque", icon: "🛡️" }
};

/* Classes que fazem sentido em cada lane (classe principal do campeão) */
const LANE_CLASSES = {
    TOP: ["Fighter", "Tank"],
    JUNGLE: ["Fighter", "Assassin", "Tank"],
    MIDDLE: ["Mage", "Assassin"],
    BOTTOM: ["Marksman"],
    UTILITY: ["Support", "Tank", "Mage"]
};

/* Quanto uma partida "deu certo": metade vitória, metade nota */
const gameRating = g => 0.5 * (g.tabela || g.carried ? 0.5 : g.win ? 1 : 0) + 0.5 * (g.score / 10);

/* Média puxada para 0,5 quando há poucas partidas (1 jogo não vira certeza) */
function smoothRating(games, weight = 3) {
    return (games.reduce((s, g) => s + gameRating(g), 0) + 0.5 * weight) / (games.length + weight);
}

const className = tag => (CLASS_INFO[tag] || { name: tag }).name;
const classIcon = tag => (CLASS_INFO[tag] || { icon: "❔" }).icon;
const mainClass = id => champData[id] && champData[id].tags[0];

/* "Perfil" do campeão: classes, atributos e se é de longe ou de perto */
function champVector(id) {
    const d = champData[id];
    if (!d) return null;
    const v = {};
    d.tags.forEach((t, i) => { v["t" + t] = i === 0 ? 1 : 0.5; });
    v.atk = (d.info.attack || 0) / 10 * 0.6;
    v.def = (d.info.defense || 0) / 10 * 0.6;
    v.mag = (d.info.magic || 0) / 10 * 0.6;
    v.rng = d.ranged ? 0.7 : 0;
    return v;
}

function similarity(a, b) {
    const va = champVector(a);
    const vb = champVector(b);
    if (!va || !vb) return 0;
    const keys = new Set(Object.keys(va).concat(Object.keys(vb)));
    let dot = 0, na = 0, nb = 0;
    keys.forEach(k => {
        const x = va[k] || 0, y = vb[k] || 0;
        dot += x * y; na += x * x; nb += y * y;
    });
    return dot / Math.sqrt(na * nb || 1);
}

/* A classe da Riot não diz quem é da selva (Riven e Kayn são "lutador").
   Então a selva tem lista própria, e esses não são sugeridos nas lanes. */
const JUNGLERS = new Set([
    "Amumu", "Belveth", "Briar", "Diana", "Ekko", "Elise", "Evelynn", "Fiddlesticks",
    "Gragas", "Graves", "Hecarim", "Ivern", "JarvanIV", "Jax", "Karthus", "Kayn",
    "Khazix", "Kindred", "LeeSin", "Lillia", "MasterYi", "MonkeyKing", "Nidalee",
    "Nocturne", "Nunu", "Poppy", "Rammus", "RekSai", "Rengar", "Sejuani", "Shaco",
    "Shyvana", "Skarner", "Talon", "Taliyah", "Trundle", "Udyr", "Vi", "Viego",
    "Volibear", "Warwick", "XinZhao", "Zac"
]);

const JUNGLE_ONLY = new Set([
    "Belveth", "Briar", "Elise", "Evelynn", "Hecarim", "Ivern", "JarvanIV", "Kayn",
    "Khazix", "Kindred", "LeeSin", "Lillia", "MasterYi", "Nidalee", "Nocturne",
    "Nunu", "Rammus", "RekSai", "Rengar", "Sejuani", "Shaco", "Shyvana", "Skarner",
    "Udyr", "Vi", "Viego", "Warwick", "XinZhao", "Zac"
]);

function fitsLane(id, lane) {
    if (lane === "JUNGLE") return JUNGLERS.has(id);
    const tag = mainClass(id);
    return !!tag && !JUNGLE_ONLY.has(id) && (LANE_CLASSES[lane] || []).includes(tag);
}

/* O que os dois campeões têm em comum, para explicar a sugestão */
function similarityReason(id, seed) {
    const a = champData[id], b = champData[seed];
    if (!a || !b) return "";
    const shared = a.tags.filter(t => b.tags.includes(t)).map(t => className(t).toLowerCase());
    const range = a.ranged === b.ranged ? (a.ranged ? "de longe" : "corpo a corpo") : null;
    return [shared.join(" e "), range].filter(Boolean).join(", ");
}

function pickSuggestions(list) {

    const lanes = groupBy(list.filter(g => FLEX_LANES[g.position]), g => g.position);

    const laneRank = Object.keys(lanes)
        .map(pos => ({ pos, games: lanes[pos], rating: smoothRating(lanes[pos]) }))
        /* Lanes com poucas partidas vão para o fim, mesmo com bom resultado */
        .sort((a, b) => (b.games.length >= FLEX_MIN_SAMPLE) - (a.games.length >= FLEX_MIN_SAMPLE) || b.rating - a.rating);

    const byClass = groupBy(list.filter(g => mainClass(g.champion)), g => mainClass(g.champion));

    const classRank = Object.keys(byClass)
        .map(tag => ({ tag, games: byClass[tag], rating: smoothRating(byClass[tag]) }))
        .sort((a, b) => b.rating - a.rating);

    const classRating = {};
    classRank.forEach(c => { classRating[c.tag] = c.rating; });

    const byChamp = groupBy(list, g => g.champion);

    const champRank = Object.keys(byChamp)
        .map(id => {
            const games = byChamp[id];
            const pos = groupBy(games, g => g.position);
            return {
                id, games,
                rating: smoothRating(games, 2),
                lane: Object.keys(pos).sort((a, b) => pos[b].length - pos[a].length)[0]
            };
        })
        .sort((a, b) => b.rating - a.rating);

    const comfort = champRank.filter(c => c.rating >= 0.55).slice(0, 5);
    /* Só manda evitar com pelo menos 2 derrotas que foram culpa sua (não de tabela) */
    const avoid = champRank.filter(c => c.games.filter(g => !g.win && !g.tabela).length >= 2 && c.rating < 0.45).slice(-3).reverse();

    /* Campeões novos parecidos com o que deu certo, nas melhores lanes */
    /* Só lanes com partidas suficientes viram recomendação */
    const solidLanes = laneRank.filter(l => l.games.length >= FLEX_MIN_SAMPLE);

    const tryNew = solidLanes.slice(0, 2).map(lane => {

        const seeds = champRank.filter(c => c.games.some(g => g.position === lane.pos) && c.rating >= 0.52);

        /* Sem nada que deu certo nessa lane: usa o que deu certo em geral */
        const base = seeds.length ? seeds : champRank.filter(c => c.rating >= 0.52);

        const picks = Object.keys(champData)
            .filter(id => fitsLane(id, lane.pos) && !byChamp[id])
            .map(id => {
                let best = null;
                base.forEach(seed => {
                    if (seed.id === id) return;
                    const value = similarity(id, seed.id) * (0.5 + seed.rating);
                    if (!best || value > best.value) best = { value, seed: seed.id };
                });
                const bonus = 0.15 * ((classRating[mainClass(id)] || 0.5) - 0.5);
                return best && { id, seed: best.seed, value: best.value + bonus };
            })
            .filter(Boolean)
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        return { lane, picks };

    }).filter(x => x.picks.length);

    return { laneRank, classRank, comfort, avoid, tryNew, bestLane: solidLanes[0] && solidLanes[0].pos };

}

function chip(content, sub, kind) {
    const c = el("div", "flex-chip" + (kind ? " " + kind : ""));
    if (typeof content === "string") c.appendChild(el("strong", null, content));
    else c.appendChild(content);
    if (sub) c.appendChild(el("span", null, sub));
    return c;
}

function champChip(id, sub, kind) {
    const head = el("strong", "flex-champ");
    head.appendChild(champIcon(id));
    head.appendChild(document.createTextNode(champName(id)));
    return chip(head, sub, kind);
}

function tabelaText(games) {
    const n = games.filter(g => g.tabela).length;
    return n ? " · " + n + " de tabela" : "";
}

function wrText(games) {
    const wins = games.filter(g => g.win).length;
    return pct(wins / games.length) + " em " + games.length + " jogo" + (games.length > 1 ? "s" : "");
}

function picksCard(list) {

    const box = card("🎯 Sugestão de pick");

    if (Object.keys(champData).length === 0) {
        box.appendChild(el("p", "flex-muted", "Não deu para carregar a lista de campeões agora. Tente recarregar a página."));
        return box;
    }

    const s = pickSuggestions(list);

    const section = (title, chips) => {
        if (!chips.length) return;
        box.appendChild(el("h3", "flex-pick-h", title));
        const row = el("div", "flex-chips");
        chips.forEach(c => row.appendChild(c));
        box.appendChild(row);
    };

    section("🗺️ Lanes", s.laneRank.map((l, i) =>
        chip(laneIcon(l.pos) + " " + laneName(l.pos), wrText(l.games), l.pos === s.bestLane ? "best" : l.rating < 0.45 ? "weak" : "")));

    section("🧬 Classes que funcionam", s.classRank.map((c, i) =>
        chip(classIcon(c.tag) + " " + className(c.tag), wrText(c.games), i === 0 ? "best" : c.rating < 0.45 ? "weak" : "")));

    section("✅ Continue jogando", s.comfort.map(c =>
        champChip(c.id, laneName(c.lane) + " · " + wrText(c.games), "best")));

    s.tryNew.forEach(t => section("🆕 Experimente de " + laneName(t.lane.pos),
        t.picks.map(p => {
            const why = similarityReason(p.id, p.seed);
            return champChip(p.id, "parecido com " + champName(p.seed) + (why ? " (" + why + ")" : ""));
        })));

    section("⚠️ Melhor evitar por enquanto", s.avoid.map(c =>
        champChip(c.id, laneName(c.lane) + " · " + wrText(c.games) + tabelaText(c.games), "weak")));

    box.appendChild(el("p", "flex-note",
        "Cada partida vale metade pela vitória e metade pela nota. Derrota de tabela (você fez sua parte e o time não) e vitória carregada contam como neutras. Com poucas partidas o resultado é puxado para o meio, então 1 vitória sozinha não vira certeza. Os parecidos saem da classe, dos atributos e do alcance do campeão."));

    return box;

}

/* Sugestão para a dupla: combinações de lane e de classe */
function duoPicksCard(pairs) {

    const box = card("🎯 Sugestão para a dupla");

    const rate = list => smoothRating(list.map(p => ({ win: p.fer.win, score: (p.fer.score + p.rony.score) / 2 })));

    const section = (title, groups, label) => {
        const ranked = Object.keys(groups)
            .map(k => ({ k, games: groups[k], rating: rate(groups[k]) }))
            /* Combinação jogada uma vez só não vira sugestão */
            .filter(r => r.games.length >= 2)
            .sort((a, b) => b.rating - a.rating);
        if (!ranked.length) return;
        box.appendChild(el("h3", "flex-pick-h", title));
        const row = el("div", "flex-chips");
        ranked.slice(0, 4).forEach((r, i) => row.appendChild(
            chip(label(r.k), wrText(r.games.map(p => p.fer)), i === 0 ? "best" : r.rating < 0.45 ? "weak" : "")));
        box.appendChild(row);
    };

    section("🗺️ Lanes", groupBy(pairs, p => p.fer.position + "|" + p.rony.position), k => {
        const [a, b] = k.split("|");
        return "Fer " + laneIcon(a) + " " + laneName(a) + " + Rony " + laneIcon(b) + " " + laneName(b);
    });

    if (Object.keys(champData).length) {
        section("🧬 Classes", groupBy(pairs.filter(p => mainClass(p.fer.champion) && mainClass(p.rony.champion)),
            p => mainClass(p.fer.champion) + "|" + mainClass(p.rony.champion)), k => {
            const [a, b] = k.split("|");
            return "Fer " + classIcon(a) + " " + className(a) + " + Rony " + classIcon(b) + " " + className(b);
        });
    }

    return box;

}

/* -------------------- Montagem -------------------- */

function renderTabs() {

    const tabs = document.getElementById("flexTabs");
    tabs.innerHTML = "";

    [["fer", "Fer"], ["rony", "Rony"], ["duo", "👬 Dupla"]].forEach(([id, label]) => {
        const b = el("button", "flex-tab" + (flexTab === id ? " active" : ""), label);
        b.type = "button";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", flexTab === id ? "true" : "false");
        b.onclick = () => {
            flexTab = id;
            try { localStorage.setItem("flexAba", id); } catch (e) { }
            render();
        };
        tabs.appendChild(b);
    });

}

function render() {

    renderTabs();

    const content = document.getElementById("flexContent");
    content.innerHTML = "";

    if (flexTab === "duo") renderDuo(); else renderPlayer(flexTab);

}

function renderSubtitle() {

    const sub = document.getElementById("flexSubtitle");
    const last = flexMeta && flexMeta.fim;

    sub.textContent = "Ranked Flex · " + flexGames.length + " partidas"
        + (last ? " · atualizado em " + new Date(last).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

}

function dataUrl() {
    const custom = new URLSearchParams(location.search).get("fonte");
    if (custom) return custom;
    return RIOT_WORKER_URL.replace(/\/$/, "") + "/flex?t=" + Date.now();
}

async function loadFlex() {

    try {

        const response = await fetch(dataUrl());
        const data = await response.json();

        if (data.status !== "ok") throw new Error(data.mensagem || "Resposta inválida");

        flexMeta = data.coleta || null;
        flexGames = Object.entries(data.partidas || {})
            .map(([id, g]) => Object.assign({ id }, g))
            .sort((a, b) => b.start - a.start);

        renderSubtitle();
        render();

    } catch (error) {

        console.error(error);
        document.getElementById("flexSubtitle").textContent = "Não foi possível carregar as partidas.";
        document.getElementById("flexContent").innerHTML = "";
        document.getElementById("flexContent").appendChild(el("div", "card flex-empty", "Erro ao carregar: " + error.message));

    }

}

async function updateFlex() {

    const button = document.getElementById("flexUpdate");
    const status = document.getElementById("flexUpdateStatus");

    button.disabled = true;
    status.textContent = "Buscando partidas novas...";

    try {

        const response = await fetch(RIOT_WORKER_URL.replace(/\/$/, "") + "/flex/atualizar", { method: "POST" });
        const data = await response.json();

        if (data.status === "cooldown") status.textContent = "Aguarde " + data.esperar + "s para atualizar de novo.";
        else if (data.status !== "ok") status.textContent = data.mensagem || "Erro ao atualizar.";
        else {
            status.textContent = data.novas
                ? data.novas + " partida" + (data.novas > 1 ? "s" : "") + " nova" + (data.novas > 1 ? "s" : "")
                    + (data.faltam ? " (faltam " + data.faltam + ", clique de novo)" : "")
                : "Nenhuma partida nova.";
            await loadFlex();
        }

    } catch (error) {
        status.textContent = "Erro ao atualizar.";
    }

    button.disabled = false;

}

/* Versão mais recente dos ícones de campeão */
async function loadDdragonVersion() {
    try {
        const versions = await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json();
        IMAGE_URL = "https://ddragon.leagueoflegends.com/cdn/" + versions[0] + "/img/champion/";
        const champs = await (await fetch("https://ddragon.leagueoflegends.com/cdn/" + versions[0] + "/data/pt_BR/champion.json")).json();
        Object.keys(champs.data).forEach(id => {
            const c = champs.data[id];
            champNames[id] = c.name;
            champData[id] = { tags: c.tags || [], info: c.info || {}, ranged: (c.stats && c.stats.attackrange) > 300 };
        });
    } catch (e) { }
}

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const saved = localStorage.getItem("flexAba");
        if (saved && (saved === "duo" || FLEX_NAMES[saved])) flexTab = saved;
    } catch (e) { }

    document.getElementById("flexUpdate").addEventListener("click", updateFlex);

    await loadDdragonVersion();
    loadFlex();

});
