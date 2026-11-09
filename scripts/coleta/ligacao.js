/* =====================================================
   LIGAÇÃO SORTEIO x PARTIDA DA RIOT

   Regra compartilhada entre o script local (coletar.js) e o
   Worker do botão do site (worker/src/index.js).
===================================================== */

const QUEUE_SWIFTPLAY = 480;

/* Cooldown global: vale para o botão do site e para o script */
const COOLDOWN_MS = 60 * 1000;

/* Janela entre o sorteio e o início da partida, em minutos */
const WINDOW_BEFORE_MIN = 2;
const WINDOW_AFTER_MIN = 45;

/* Parte mínima dos campeões sorteados que precisa aparecer na partida.
   Abaixo disso, provavelmente é outra partida dos mesmos jogadores. */
const MIN_CHAMPION_MATCH = 0.5;

const PLAYERS = {
    fer: ["Bálsamo Alemão", "void"],
    nardi: ["Naardii", "br1"],
    ber: ["bnrz", "007"],
    valde: ["Brahma latinha", "br1"],
    rony: ["RonYy APenas", "br1"],
    pitty: ["IIPittyII", "br1"]
};

/* Lê PLAYER_ALIASES do texto de js/config.js, para não manter duas listas */
function parseAliases(configSource) {

    const block = configSource.match(/const PLAYER_ALIASES = \{([\s\S]*?)\};/);

    if (!block) throw new Error("PLAYER_ALIASES não encontrado em js/config.js");

    const aliases = {};

    for (const pair of block[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
        aliases[pair[1]] = pair[2];
    }

    return aliases;

}

function makePlayerKey(aliases) {
    return name => {
        const key = String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
        return aliases[key] || key;
    };
}

function sameChampion(a, b) {
    return String(a).toLowerCase() === String(b).toLowerCase();
}

function toGame(id, info, puuids) {

    const owners = {};
    Object.keys(puuids).forEach(key => { owners[puuids[key]] = key; });

    const players = {};

    info.participants.forEach(p => {
        if (owners[p.puuid]) players[owners[p.puuid]] = p;
    });

    return { id, info, start: info.gameStartTimestamp || info.gameCreation, players };

}

/* Candidatos válidos de um sorteio, com a pontuação de cada um */
function candidatesFor(match, games, playerKey) {

    const keys = [...new Set(match.entries.map(e => playerKey(e.player)))];
    const found = [];

    games.forEach(game => {

        const delayMin = (game.start - match.time) / 60000;

        if (delayMin < -WINDOW_BEFORE_MIN || delayMin > WINDOW_AFTER_MIN) return;
        if (!keys.every(k => game.players[k])) return;

        /* Todos os sorteados precisam estar no mesmo time */
        if (new Set(keys.map(k => game.players[k].teamId)).size !== 1) return;

        const drawn = match.entries.map(e => e.champion);
        const played = entry => game.players[playerKey(entry.player)].championName;

        const exact = match.entries.filter(e => sameChampion(played(e), e.champion)).length;

        /* Campeão sorteado por outro jogador do grupo conta como troca */
        const present = match.entries.filter(e => drawn.some(c => sameChampion(played(e), c))).length;

        if (present / match.entries.length < MIN_CHAMPION_MATCH) return;

        const win = game.players[keys[0]].win;
        const agrees = match.resultado ? (match.resultado === "vitoria") === win : null;

        found.push({
            match, game, exact, present, win, agrees, delayMin,
            score: 10 * exact / match.entries.length
                + 5 * present / match.entries.length
                + (agrees === true ? 3 : agrees === false ? -3 : 0)
                - delayMin / 20
        });

    });

    return found;

}

/* Melhores pares primeiro; cada sorteio e cada partida só podem ser usados uma vez */
function pairUp(matches, games, playerKey) {

    const all = matches
        .flatMap(m => candidatesFor(m, games, playerKey))
        .sort((a, b) => b.score - a.score);

    const usedMatches = new Set();
    const usedGames = new Set();
    const pairs = [];

    all.forEach(pair => {

        if (usedMatches.has(pair.match.id) || usedGames.has(pair.game.id)) return;

        usedMatches.add(pair.match.id);
        usedGames.add(pair.game.id);
        pairs.push(pair);

    });

    return pairs.sort((a, b) => a.match.time - b.match.time);

}

function playerStats(p) {

    const c = p.challenges || {};
    const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

    return {
        champion: p.championName,
        position: p.teamPosition || p.individualPosition || "",
        win: !!p.win,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        assists: p.assists || 0,
        level: p.champLevel || 0,
        gold: p.goldEarned || 0,
        goldPerMin: round(c.goldPerMinute),
        cs: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
        damage: p.totalDamageDealtToChampions || 0,
        damagePerMin: round(c.damagePerMinute),
        damageShare: round(c.teamDamagePercentage, 4),
        damageTaken: p.totalDamageTaken || 0,
        killParticipation: round(c.killParticipation, 4),
        soloKills: c.soloKills || 0,
        doubleKills: p.doubleKills || 0,
        tripleKills: p.tripleKills || 0,
        quadraKills: p.quadraKills || 0,
        pentaKills: p.pentaKills || 0,
        largestSpree: p.largestKillingSpree || 0,
        firstBlood: !!p.firstBloodKill,
        vision: p.visionScore || 0,
        wardsPlaced: p.wardsPlaced || 0,
        wardsKilled: p.wardsKilled || 0,
        turrets: p.turretTakedowns || 0,
        dragons: p.dragonKills || 0,
        barons: p.baronKills || 0,
        objectivesStolen: p.objectivesStolen || 0,
        healOnAllies: p.totalHealsOnTeammates || 0,
        shieldOnAllies: p.totalDamageShieldedOnTeammates || 0,
        ccTime: p.timeCCingOthers || 0,
        timeDead: p.totalTimeSpentDead || 0,
        longestAlive: p.longestTimeSpentLiving || 0,
        skillshotsHit: c.skillshotsHit || 0,
        skillshotsDodged: c.skillshotsDodged || 0,
        missingPings: p.enemyMissingPings || 0,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map(i => i || 0)
    };

}

function gameRecord(game, sorteioId) {

    const players = {};

    Object.keys(game.players).forEach(key => {
        players[key] = playerStats(game.players[key]);
    });

    return {
        sorteioId,
        start: game.start,
        duration: game.info.gameDuration || 0,
        version: game.info.gameVersion || "",
        players
    };

}

module.exports = {
    QUEUE_SWIFTPLAY,
    COOLDOWN_MS,
    PLAYERS,
    parseAliases,
    makePlayerKey,
    toGame,
    pairUp,
    gameRecord
};
