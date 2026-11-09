/* =====================================================
   DADOS DA RIOT

   Partidas ligadas têm riotMatchId, que aponta para
   global/riot/{riotMatchId}. Partidas antigas, sem ligação, continuam
   contando normalmente, só sem estes números.
===================================================== */

const RIOT_COOLDOWN_MS = 60 * 1000;

function emptyRiotTotals() {
    return {
        games: 0, kills: 0, deaths: 0, assists: 0, gold: 0, damage: 0,
        cs: 0, vision: 0, seconds: 0, pentaKills: 0, timeDead: 0, missingPings: 0,
        turrets: 0, dragons: 0, barons: 0, objectivesStolen: 0, soloKills: 0,
        firstBloods: 0, damageTaken: 0, allySupport: 0, killParticipation: 0,
        wardsPlaced: 0, wardsKilled: 0, ccTime: 0, skillshotsHit: 0, skillshotsDodged: 0,
        doubleKills: 0, tripleKills: 0, quadraKills: 0, damageShare: 0,
        /* Recordes de uma partida só (maior valor, não soma) */
        bestSpree: 0, bestAlive: 0, bestKills: 0
    };
}

function addRiotTotals(totals, stats, seconds) {

    totals.games++;
    totals.seconds += seconds || 0;

    ["kills", "deaths", "assists", "gold", "damage", "cs",
        "vision", "pentaKills", "timeDead", "missingPings",
        "turrets", "dragons", "barons", "objectivesStolen", "soloKills", "damageTaken", "killParticipation",
        "wardsPlaced", "wardsKilled", "ccTime", "skillshotsHit", "skillshotsDodged",
        "doubleKills", "tripleKills", "quadraKills", "damageShare"].forEach(field => {
            totals[field] += stats[field] || 0;
        });

    totals.bestSpree = Math.max(totals.bestSpree, stats.largestSpree || 0);
    totals.bestAlive = Math.max(totals.bestAlive, stats.longestAlive || 0);
    totals.bestKills = Math.max(totals.bestKills, stats.kills || 0);

    if (stats.firstBlood) totals.firstBloods++;

    totals.allySupport += (stats.healOnAllies || 0) + (stats.shieldOnAllies || 0);

}

/* Valores por minuto usam só as partidas com dados da Riot */
function riotAverages(totals) {

    if (!totals || totals.games === 0) {
        return { kda: null, goldPerMin: null, damagePerMin: null, csPerMin: null, visionPerGame: null };
    }

    const minutes = totals.seconds / 60;
    const perMinute = value => minutes > 0 ? value / minutes : null;

    return {
        kda: (totals.kills + totals.assists) / Math.max(1, totals.deaths),
        goldPerMin: perMinute(totals.gold),
        damagePerMin: perMinute(totals.damage),
        csPerMin: perMinute(totals.cs),
        visionPerGame: totals.vision / totals.games
    };

}

/* Dados de um jogador em uma partida, ou null se a partida não está ligada */
function riotStatsOf(riotGames, match, key) {

    if (!match || !match.riotMatchId) return null;

    const game = (riotGames || {})[match.riotMatchId];

    if (!game || !game.players || !game.players[key]) return null;

    return { stats: game.players[key], seconds: game.duration || 0 };

}

/* A Riot e o Data Dragon podem divergir em maiúsculas (ex.: FiddleSticks) */
function riotChampionId(name) {

    if (championNames[name]) return name;

    const lower = String(name).toLowerCase();

    return Object.keys(championNames).find(id => id.toLowerCase() === lower) || name;

}

function formatNumber(value, digits) {
    return value === null || value === undefined ? "—" : value.toFixed(digits).replace(".", ",");
}

/* ---------- Botão de atualização ---------- */

let riotColeta = null;
let riotBusy = false;
let riotMessage = "";
let riotTimer = null;

function riotCooldownLeft() {

    if (!riotColeta || !riotColeta.ultima) return 0;

    /* Relógio do visitante adiantado ou atrasado não trava o botão:
       quem decide de verdade é o Worker */
    const left = RIOT_COOLDOWN_MS - (Date.now() - riotColeta.ultima);

    return Math.max(0, Math.min(RIOT_COOLDOWN_MS, left));

}

function renderRiotBar() {

    const bar = document.getElementById("riotBar");

    if (!bar) return;

    if (!db) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "";

    const button = document.getElementById("riotUpdateBtn");
    const status = document.getElementById("riotStatus");
    const left = riotCooldownLeft();

    button.style.display = RIOT_WORKER_URL ? "" : "none";
    button.disabled = riotBusy || left > 0;
    button.textContent = riotBusy
        ? "Buscando na Riot..."
        : left > 0
            ? "Aguarde " + Math.ceil(left / 1000) + "s"
            : "🔄 Atualizar dados da Riot";

    let text = riotMessage;

    if (!text && riotColeta && riotColeta.status === "erro") {
        text = "Última busca falhou: " + (riotColeta.mensagem || "erro desconhecido");
    }

    if (!text && riotColeta && riotColeta.ultima) {
        text = "Última busca: " + new Date(riotColeta.ultima).toLocaleString("pt-BR");
    }

    status.textContent = text;

    /* O contador só roda enquanto o cooldown está ativo */
    if (left > 0 && !riotTimer) {
        riotTimer = setInterval(() => {
            if (riotCooldownLeft() === 0) {
                clearInterval(riotTimer);
                riotTimer = null;
            }
            renderRiotBar();
        }, 1000);
    }

}

async function updateRiotData() {

    if (!RIOT_WORKER_URL || riotBusy || riotCooldownLeft() > 0) return;

    riotBusy = true;
    riotMessage = "";
    renderRiotBar();

    try {

        const response = await fetch(RIOT_WORKER_URL.replace(/\/$/, "") + "/atualizar", { method: "POST" });
        const data = await response.json();

        if (data.status === "ok") {
            riotMessage = data.ligadas > 0
                ? data.ligadas + (data.ligadas === 1 ? " partida atualizada." : " partidas atualizadas.")
                : "Nenhuma partida nova. Se acabou de jogar, tente de novo em alguns minutos.";
        } else if (data.status === "cooldown") {
            riotMessage = "Alguém acabou de atualizar. Tente de novo em " + data.esperar + "s.";
        } else {
            riotMessage = "Falha ao atualizar: " + (data.mensagem || "erro desconhecido");
        }

    } catch (error) {

        console.error(error);
        riotMessage = "Não foi possível falar com o servidor de atualização.";

    }

    riotBusy = false;
    renderRiotBar();

}
