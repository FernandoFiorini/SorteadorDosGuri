/* =====================================================
   RANKED FLEX (Fer e Rony)

   Regra compartilhada entre o script local (flex.js) e o Worker
   (rotas /flex e /flex/atualizar). Os dados ficam em privado/flex,
   que o site não lê direto: só pela rota GET /flex do Worker.
===================================================== */

const QUEUE_FLEX = 440;

/* Só os dois jogam Flex juntos */
const FLEX_PLAYERS = ["fer", "rony"];

/* Início da temporada: o histórico do script local começa aqui */
const FLEX_SEASON_START = "2026-01-08";

/* Recriação não entra */
const FLEX_MIN_SECONDS = 5 * 60;

const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));

function laneStats(p) {

    const c = p.challenges || {};
    const minutes = Math.max(1, (p.timePlayed || 0) / 60);

    return {
        champion: p.championName,
        position: p.teamPosition || p.individualPosition || "",
        win: !!p.win,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        assists: p.assists || 0,
        level: p.champLevel || 0,
        gold: p.goldEarned || 0,
        cs: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
        damage: p.totalDamageDealtToChampions || 0,
        damageTaken: p.totalDamageTaken || 0,
        vision: p.visionScore || 0,
        minutes: round(minutes)
    };

}

function flexPlayer(p, info) {

    const c = p.challenges || {};
    const base = laneStats(p);

    /* Oponente de lane: mesma posição no time inimigo */
    const opp = base.position && info.participants.find(o =>
        o.teamId !== p.teamId && (o.teamPosition || o.individualPosition) === base.position);

    return Object.assign(base, {
        goldPerMin: round(c.goldPerMinute),
        damagePerMin: round(c.damagePerMinute),
        damageShare: round(c.teamDamagePercentage, 4),
        killParticipation: round(c.killParticipation, 4),
        visionPerMin: round(c.visionScorePerMinute),
        csAt10: (c.laneMinionsFirst10Minutes || 0) + (c.jungleCsBefore10Minutes || 0),
        laneAdvantage: round(c.laningPhaseGoldExpAdvantage, 4),
        maxCsAdvantage: round(c.maxCsAdvantageOnLaneOpponent),
        controlWards: c.controlWardsPlaced || p.detectorWardsPlaced || 0,
        wardsPlaced: p.wardsPlaced || 0,
        wardsKilled: p.wardsKilled || 0,
        soloKills: c.soloKills || 0,
        timeDead: p.totalTimeSpentDead || 0,
        firstBlood: !!(p.firstBloodKill || p.firstBloodAssist),
        turrets: p.turretTakedowns || 0,
        objectives: (p.dragonKills || 0) + (p.baronKills || 0) + (c.riftHeraldTakedowns || 0),
        multikill: p.pentaKills ? 5 : p.quadraKills ? 4 : p.tripleKills ? 3 : p.doubleKills ? 2 : 0,
        surrender: !!(p.gameEndedInSurrender),
        ccTime: p.timeCCingOthers || 0,
        healShield: (p.totalHealsOnTeammates || 0) + (p.totalDamageShieldedOnTeammates || 0),
        mitigated: p.damageSelfMitigated || 0,
        opp: opp ? laneStats(opp) : null
    });

}

/* Partida já resumida para guardar; null = não entra (recriação etc.) */
function flexRecord(id, info, puuids) {

    const duration = info.gameDuration || 0;

    if (duration < FLEX_MIN_SECONDS) return null;

    const owners = {};
    Object.keys(puuids).forEach(key => { owners[puuids[key]] = key; });

    const players = {};

    info.participants.forEach(p => {
        if (owners[p.puuid]) players[owners[p.puuid]] = flexPlayer(p, info);
    });

    if (Object.keys(players).length === 0) return null;

    return {
        start: info.gameStartTimestamp || info.gameCreation || 0,
        duration,
        version: (info.gameVersion || "").split(".").slice(0, 2).join("."),
        players
    };

}

module.exports = {
    QUEUE_FLEX,
    FLEX_PLAYERS,
    FLEX_SEASON_START,
    FLEX_MIN_SECONDS,
    flexRecord
};
