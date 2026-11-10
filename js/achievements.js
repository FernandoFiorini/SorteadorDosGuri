/* =====================================================
   CONQUISTAS

   Calculadas na hora a partir das partidas (mesma fonte das
   estatísticas). Nada novo é gravado no Firebase.

   - TÍTULOS: só o(s) jogador(es) com o maior valor leva(m).
   - MEDALHAS: cada jogador desbloqueia ao bater a meta.

   Para criar uma conquista nova, basta adicionar um item em
   ACHIEVEMENT_TITLES ou ACHIEVEMENT_BADGES.
   Partidas "Não deu jogo" ficam de fora, como nas estatísticas.
===================================================== */

/* Junta, por jogador, tudo que as conquistas precisam */
function computePlayerProfiles(src) {

    const profiles = {};

    const matches = Object.values(src.partidas || {})
        .filter(m => m && m.resultado !== "anulada"
            && Object.values(m.entries || {}).length > 0)
        .sort((a, b) => (a.time || 0) - (b.time || 0));

    matches.forEach(match => {

        const won = match.resultado === "vitoria";
        const lost = match.resultado === "derrota";

        Object.values(match.entries || {}).forEach(entry => {

            if (!entry || !entry.champion) return;

            const key = playerKey(entry.player);

            if (!key) return;

            const p = profiles[key] || (profiles[key] = {
                key: key, name: "?", spellings: {},
                games: 0, wins: 0, losses: 0,
                lanes: {}, champs: {},
                streak: 0, bestWinStreak: 0, worstLossStreak: 0,
                riot: emptyRiotTotals()
            });

            const riotData = riotStatsOf(src.riot, match, key);

            if (riotData) addRiotTotals(p.riot, riotData.stats, riotData.seconds);

            const spelled = normalizePlayerName(entry.player);
            p.spellings[spelled] = (p.spellings[spelled] || 0) + 1;

            p.games++;
            p.lanes[entry.lane] = (p.lanes[entry.lane] || 0) + 1;
            p.champs[entry.champion] = (p.champs[entry.champion] || 0) + 1;

            /* Sequências (só partidas com resultado marcado contam).
               streak > 0 = vitórias seguidas, < 0 = derrotas seguidas */
            if (won) {
                p.wins++;
                p.streak = p.streak > 0 ? p.streak + 1 : 1;
                p.bestWinStreak = Math.max(p.bestWinStreak, p.streak);
            } else if (lost) {
                p.losses++;
                p.streak = p.streak < 0 ? p.streak - 1 : -1;
                p.worstLossStreak = Math.max(p.worstLossStreak, -p.streak);
            }

        });

    });

    return Object.values(profiles).map(p => {

        const favorite = topKey(p.champs);

        return Object.assign(p, {
            /* Exibe a grafia mais usada do nome */
            name: topKey(p.spellings) || "?",
            decided: p.wins + p.losses,
            winrate: ratio(p.wins, p.losses),
            uniqueChamps: Object.keys(p.champs).length,
            uniqueLanes: Object.keys(p.lanes).length,
            favorite: favorite,
            favoriteCount: favorite ? p.champs[favorite] : 0,
            lane: name => p.lanes[name] || 0
        });

    });

}

/* ---------- TÍTULOS (um dono por título; empate divide) ---------- */

/* Categorias, na ordem em que aparecem na tela */
const TITLE_CATEGORIES = [
    { key: "combate", head: "⚔️ Combate" },
    { key: "visao", head: "👁️ Visão e time" },
    { key: "objetivos", head: "🏰 Objetivos, ouro e farm" },
    { key: "rotina", head: "🎲 Rotina dos guri" }
];

/* Média por partida de um campo da Riot (null sem dados) */
const perGame = (p, field) => p.riot.games > 0 ? p.riot[field] / p.riot.games : null;
const minRiotGames = p => p.riot.games >= 5;
const plural = (v, one, many) => v + " " + (v === 1 ? one : many);
const clock = s => Math.floor(s / 60) + ":" + String(Math.round(s % 60)).padStart(2, "0");

const ACHIEVEMENT_TITLES = [

    /* ----- Combate ----- */
    {
        cat: "combate", icon: "🖐️", name: "Eu sou o milior",
        desc: "Mais pentakills",
        value: p => p.riot.pentaKills,
        show: v => plural(v, "penta", "pentas")
    },
    {
        cat: "combate", icon: "🎯", name: "Mata mais que a fome",
        desc: "Maior KDA (mín. 5 partidas)",
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).kda,
        show: v => formatNumber(v, 2)
    },
    {
        cat: "combate", icon: "🩸", name: "Sou muito bom com esse boneco",
        desc: "Mais first bloods",
        value: p => p.riot.firstBloods,
        show: v => plural(v, "first blood", "first bloods")
    },
    {
        cat: "combate", icon: "🗡️", name: "Aqui é valdemá",
        desc: "Mais abates solo",
        value: p => p.riot.soloKills,
        show: v => plural(v, "solo kill", "solo kills")
    },
    {
        cat: "combate", icon: "💥", name: "Aqui é matador",
        desc: "Recorde de abates numa partida só",
        value: p => p.riot.bestKills,
        show: v => plural(v, "abate", "abates")
    },
    {
        cat: "combate", icon: "🔥", name: "Mata & Mata",
        desc: "Maior sequência de abates sem morrer",
        value: p => p.riot.bestSpree,
        show: v => plural(v, "abate seguido", "abates seguidos")
    },
    {
        cat: "combate", icon: "⚔️", name: "7 tipo de matança",
        desc: "Mais triple e quadra kills somados",
        value: p => p.riot.tripleKills + p.riot.quadraKills,
        show: v => plural(v, "multikill", "multikills")
    },
    {
        cat: "combate", icon: "🎒", name: "Carregamento extensivo",
        desc: "Maior fatia média do dano do time (mín. 5 partidas)",
        eligible: minRiotGames,
        value: p => perGame(p, "damageShare"),
        show: v => formatNumber(v * 100, 0) + "% do dano"
    },
    {
        cat: "combate", icon: "🥊", name: "Gordão supremo",
        desc: "Mais dano recebido somando todas as partidas",
        value: p => p.riot.damageTaken,
        show: v => v.toLocaleString("pt-BR") + " de dano"
    },
    {
        cat: "combate", icon: "🔒", name: "Paradinho",
        desc: "Mais tempo prendendo inimigos com controle (CC)",
        value: p => p.riot.ccTime,
        show: v => clock(v) + " de CC"
    },
    {
        cat: "combate", icon: "🏹", name: "Eu jogo muito, não tem jeito",
        desc: "Mais skillshots acertadas",
        value: p => p.riot.skillshotsHit,
        show: v => v.toLocaleString("pt-BR") + " acertos"
    },
    {
        cat: "combate", icon: "🌀", name: "Esquivo, esquivo, leo tus derechos",
        desc: "Mais skillshots inimigas desviadas",
        value: p => p.riot.skillshotsDodged,
        show: v => v.toLocaleString("pt-BR") + " desviadas"
    },
    {
        cat: "combate", icon: "⏳", name: "Não morre nunca",
        desc: "Recorde de tempo vivo sem morrer numa partida",
        value: p => p.riot.bestAlive,
        show: v => clock(v) + " vivo"
    },

    /* ----- Visão e time ----- */
    {
        cat: "visao", icon: "🕯️", name: "Quer visão então toma?",
        desc: "Mais wards colocadas somando todas as partidas",
        value: p => p.riot.wardsPlaced,
        show: v => plural(v, "ward", "wards")
    },
    {
        cat: "visao", icon: "🧹", name: "Limpa ward teleguiado",
        desc: "Mais wards inimigas destruídas",
        value: p => p.riot.wardsKilled,
        show: v => plural(v, "ward destruída", "wards destruídas")
    },
    {
        cat: "visao", icon: "🔭", name: "E a gurizada abrindo o mapa",
        desc: "Maior placar de visão por partida (mín. 5 partidas)",
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).visionPerGame,
        show: v => formatNumber(v, 1) + " por partida"
    },
    {
        cat: "visao", icon: "❓", name: "Pinga ne mim?",
        desc: "Mais pings de inimigo sumido",
        value: p => p.riot.missingPings,
        show: v => v + " pings"
    },
    {
        cat: "visao", icon: "💚", name: "Aqui cura nao adianta",
        desc: "Mais cura e escudo em aliados",
        value: p => p.riot.allySupport,
        show: v => v.toLocaleString("pt-BR")
    },

    /* ----- Objetivos, ouro e farm ----- */
    {
        cat: "objetivos", icon: "💰", name: "Filho do vorcaro",
        desc: "Mais ouro acumulado somando todas as partidas",
        value: p => p.riot.gold,
        show: v => v.toLocaleString("pt-BR") + " de ouro"
    },
    {
        cat: "objetivos", icon: "🚜", name: "O agro é top",
        desc: "Maior farm por minuto (mín. 5 partidas)",
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).csPerMin,
        show: v => formatNumber(v, 1) + " por minuto"
    },
    {
        cat: "objetivos", icon: "🏰", name: "Alex muralha",
        desc: "Mais torres destruídas (abates e assistências)",
        value: p => p.riot.turrets,
        show: v => plural(v, "torre", "torres")
    },
    {
        cat: "objetivos", icon: "🦹", name: "Filho do lula",
        desc: "Mais objetivos roubados (dragão, Barão, Arauto e afins)",
        value: p => p.riot.objectivesStolen,
        show: v => plural(v, "roubo", "roubos")
    },

    /* ----- Rotina ----- */
    {
        cat: "rotina", icon: "😎", name: "Tu me conhece né valde",
        desc: "Maior número de vitórias",
        value: p => p.wins,
        show: v => plural(v, "vitória", "vitórias")
    },
    {
        cat: "rotina", icon: "📈", name: "Joguinho sossegado",
        desc: "Mais vitórias seguidas",
        value: p => p.bestWinStreak,
        show: v => plural(v, "seguida", "seguidas")
    },
    {
        cat: "rotina", icon: "🌲", name: "Que isso paixão, pode relaxar",
        desc: "Mais vezes que caiu na Jungle",
        value: p => p.lane("Jungle"),
        show: v => v + "x"
    },
    {
        cat: "rotina", icon: "🎠", name: "Pitty carrosilha",
        desc: "Mais vezes que caiu de Support",
        value: p => p.lane("Support"),
        show: v => v + "x"
    },
    {
        cat: "rotina", icon: "🎲", name: "O cara sabe jogar com tudo, não adianta",
        desc: "Mais campeões diferentes jogados",
        value: p => p.uniqueChamps,
        show: v => plural(v, "campeão", "campeões")
    },

    /* ----- Negativos (aba Vergonha, em vermelho) ----- */
    {
        cat: "combate", icon: "💀", name: "Só não morre mais porque tem que esperar renascer",
        desc: "Mais mortes somando todas as partidas",
        negative: true,
        value: p => p.riot.deaths,
        show: v => plural(v, "morte", "mortes")
    },
    {
        cat: "combate", icon: "⚰️", name: "Mais morto que isso só no the walking dead",
        desc: "Mais tempo morto somando todas as partidas",
        negative: true,
        value: p => p.riot.timeDead,
        show: v => Math.round(v / 60) + " min"
    },
    {
        cat: "combate", icon: "🧸", name: "Mais ruim que isso, so 2 disso",
        desc: "Menor KDA (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).kda,
        show: v => formatNumber(v, 2)
    },
    {
        cat: "combate", icon: "🪶", name: "Dano é psicologico",
        desc: "Menor dano a campeões por minuto (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).damagePerMin,
        show: v => formatNumber(v, 0) + " por minuto"
    },
    {
        cat: "combate", icon: "👻", name: "O jogador, vamo começar a jogar ou não?",
        desc: "Menor participação nos abates do time (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => perGame(p, "killParticipation"),
        show: v => formatNumber(v * 100, 0) + "%"
    },
    {
        cat: "visao", icon: "🙈", name: "Mais cego que não sei o que",
        desc: "Menor placar de visão por partida (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).visionPerGame,
        show: v => formatNumber(v, 1) + " por partida"
    },
    {
        cat: "visao", icon: "🚫", name: "Ward é item de luxo",
        desc: "Menos wards colocadas por partida (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => perGame(p, "wardsPlaced"),
        show: v => formatNumber(v, 1) + " por partida"
    },
    {
        cat: "objetivos", icon: "🪙", name: "Tem que solicitar bolsa família",
        desc: "Menor ouro por minuto (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).goldPerMin,
        show: v => formatNumber(v, 0) + " por minuto"
    },
    {
        cat: "objetivos", icon: "🌾", name: "Não ta jogando age né?",
        desc: "Menor farm por minuto (mín. 5 partidas)",
        lowest: true, negative: true,
        eligible: minRiotGames,
        value: p => riotAverages(p.riot).csPerMin,
        show: v => formatNumber(v, 1) + " por minuto"
    },
    {
        cat: "rotina", icon: "⚡", name: "Mamu gastou flash",
        desc: "Maior número de derrotas",
        negative: true,
        value: p => p.losses,
        show: v => plural(v, "derrota", "derrotas")
    },
    {
        cat: "rotina", icon: "📉", name: "Joguinhos de lambari",
        desc: "Mais derrotas seguidas",
        negative: true,
        value: p => p.worstLossStreak,
        show: v => plural(v, "seguida", "seguidas")
    }
];

/* ---------- MEDALHAS (cada jogador desbloqueia a sua) ----------

   Dois tipos:
   - Medalhas com nível (ACHIEVEMENT_BADGES): 🥉 Bronze, 🥈 Prata e 🥇 Ouro.
     Mudam a cor/efeito do nick; quanto maior o nível, mais forte o efeito.
     Com 2 no Ouro o nick pega fogo; com as 3 no Ouro vira ouro maciço.
   - Emblemas (EMBLEM_BADGES): permanentes, aparecem como um ícone
     pequeno do lado do nick e não mexem na cor.

   "current" é o progresso do jogador; "tiers" são as metas de cada nível. */

const BADGE_TIERS = [
    { tier: 1, name: "Bronze", medal: "🥉" },
    { tier: 2, name: "Prata", medal: "🥈" },
    { tier: 3, name: "Ouro", medal: "🥇" }
];

const ACHIEVEMENT_BADGES = [
    {
        icon: "👑", name: "Lenda dos guri", verb: "Jogar",
        nick: "nick-lenda", current: p => p.games, unit: "partidas",
        goals: [25, 50, 100],
        effects: ["nick dourado", "nick em degradê dourado", "nick dourado e brilhando"]
    },
    {
        icon: "🏆", name: "Bafeador supremo", verb: "Ganhar",
        nick: "nick-bafeador", current: p => p.wins, unit: "vitórias",
        goals: [25, 50, 100],
        effects: ["nick verde", "nick verde com brilho", "nick verde e pulsando"]
    },
    {
        icon: "🫏", name: "Mais burro já registrado", verb: "Perder",
        nick: "nick-burro", current: p => p.losses, unit: "derrotas",
        goals: [25, 50, 100],
        effects: ["nick vermelho", "nick de palhaço trocando de cor", "nick de palhaço, trocando de cor e balançando"]
    }
];

/* Um objeto por nível de cada medalha, com tudo que a tela precisa */
ACHIEVEMENT_BADGES.forEach(badge => {
    badge.levels = BADGE_TIERS.map((t, i) => ({
        line: badge,
        tier: t.tier,
        tierName: t.name,
        medal: t.medal,
        icon: badge.icon,
        name: badge.name,
        nick: badge.nick,
        goal: badge.goals[i],
        desc: badge.verb + " " + badge.goals[i] + " " + badge.unit,
        effect: badge.effects[i]
    }));
});

/* Nível atual de uma medalha (null se ainda não chegou no Bronze) */
function badgeLevel(badge, profile) {
    const value = badge.current(profile);
    return badge.levels.filter(l => value >= l.goal).pop() || null;
}

/* Emblemas permanentes (ícone ao lado do nick) */
const EMBLEM_BADGES = [
    {
        id: "mapa", icon: "🌍", name: "Rodou o mapa",
        desc: "Jogar 10 partidas em cada lane",
        effect: "emblema 🌍 do lado do nick",
        goal: 50, unit: "(10 em cada lane)",
        /* Conta no máximo 10 por lane: só completa com as 5 lanes */
        current: p => laneOrder.reduce((sum, lane) => sum + Math.min(10, p.lane(lane)), 0),
        detail: p => laneOrder.map(lane => lane + " " + Math.min(10, p.lane(lane)) + "/10").join(", ")
    },
    {
        id: "pool", icon: "🎲", name: "Pool infinita",
        desc: "Jogar com 50 campeões diferentes",
        effect: "emblema 🎲 do lado do nick",
        goal: 50, unit: "campeões",
        current: p => p.uniqueChamps
    },
    {
        id: "penta", icon: "🖐️", name: "Pentakill",
        desc: "Fazer um pentakill",
        effect: "emblema 🖐️ do lado do nick, para sempre",
        goal: 1, unit: "penta",
        current: p => p.riot.pentaKills
    }
];

EMBLEM_BADGES.forEach(badge => {
    badge.test = p => badge.current(p) >= badge.goal;
});

/* PRÉVIA: true ignora as metas e dá a cada jogador uma combinação fixa,
   só para ver os efeitos. "levels" = [índice da medalha, nível 1-3];
   "emblems" = ids de EMBLEM_BADGES. false volta a valer a meta. */
const BADGE_PREVIEW = false;

const BADGE_PREVIEW_COMBOS = {
    ber: { levels: [[0, 3], [1, 3], [2, 3]], emblems: ["mapa", "pool", "penta"] },
    valde: { levels: [[0, 3], [1, 3]], emblems: ["penta"] },
    fer: { levels: [[0, 2], [2, 1]], emblems: ["pool"] },
    nardi: { levels: [[2, 3]], emblems: [] },
    pitty: { levels: [[0, 1]], emblems: ["mapa"] },
    rony: { levels: [[1, 2]], emblems: [] }
};

/* Efeitos de quem junta medalhas no Ouro */
const BADGE_COMBO_EFFECTS = {
    2: { nick: "nick-duo", icon: "🔥", effect: "nick em chamas no site" },
    3: { nick: "nick-trio", icon: "✨", effect: "nick de ouro maciço, com reflexo, halo e estrelas douradas no site" }
};

/* Medalhas de um jogador: { badges: níveis atuais, emblems } */
function earnedBadges(profile) {

    if (BADGE_PREVIEW) {
        const combo = BADGE_PREVIEW_COMBOS[profile.key] || { levels: [], emblems: [] };
        return {
            badges: combo.levels.map(([i, tier]) => ACHIEVEMENT_BADGES[i].levels[tier - 1]),
            emblems: EMBLEM_BADGES.filter(e => combo.emblems.includes(e.id))
        };
    }

    return {
        badges: ACHIEVEMENT_BADGES.map(b => badgeLevel(b, profile)).filter(Boolean),
        emblems: EMBLEM_BADGES.filter(e => e.test(profile))
    };

}

/* ---------- RECORDES DE UMA PARTIDA (medalhas que trocam de dono) ----------

   Cada partida ligada à Riot ganha uma nota de 0 a 10 para cada jogador,
   comparando com todas as partidas já registradas do grupo:
   KDA, mortes, ouro/min, dano/min, participação em abates e visão/min.
   A maior nota da história é o Paulinho Molina; a menor, o Feedamento.
   Quando alguém faz uma partida melhor (ou pior), a medalha muda de dono. */

const GAME_RECORDS = [
    {
        id: "paulinho", best: true,
        icon: "🐐", name: "Melhor Paulinho Molina já registrado",
        desc: "Maior nota numa partida só (KDA, ouro, dano, participação e visão)",
        nick: "rec-paulinho", effect: "borda azul pulsando em volta do nick, enquanto ninguém fizer uma partida melhor"
    },
    {
        id: "feed", best: false,
        icon: "🍼", name: "Maior feedamento já registrado",
        desc: "Menor nota numa partida só (KDA, ouro, dano, participação e visão)",
        nick: "rec-feed", effect: "borda verde pulsando em volta do nick, até alguém feedar mais"
    }
];

/* Partidas muito curtas (remake, surrender cedo) não contam */
const RECORD_MIN_SECONDS = 15 * 60;

/* Peso de cada número na nota (sinal negativo = quanto menos, melhor) */
const RECORD_METRICS = [
    { weight: 1.5, value: g => Math.log1p((g.kills + g.assists) / Math.max(1, g.deaths)) },
    { weight: 1, value: g => -g.deaths },
    { weight: 1, value: g => g.goldPerMin },
    { weight: 1, value: g => g.damagePerMin },
    { weight: 1, value: g => g.killParticipation },
    { weight: 0.5, value: g => g.visionPerMin }
];

/* Todas as atuações (jogador x partida) com nota */
function computeGameRecords(src) {

    const games = [];

    Object.entries(src.partidas || {}).forEach(([sorteioId, match]) => {

        if (!match || match.resultado === "anulada") return;

        const game = match.riotMatchId && (src.riot || {})[match.riotMatchId];

        if (!game || !game.players || (game.duration || 0) < RECORD_MIN_SECONDS) return;

        const minutes = game.duration / 60;

        Object.keys(game.players).forEach(key => {

            const s = game.players[key];

            if (!s) return;

            games.push({
                key: key,
                sorteioId: sorteioId,
                riotId: match.riotMatchId,
                time: game.start || match.time || 0,
                champion: s.champion,
                win: !!s.win,
                kills: s.kills || 0,
                deaths: s.deaths || 0,
                assists: s.assists || 0,
                goldPerMin: s.goldPerMin || (s.gold || 0) / minutes,
                damagePerMin: s.damagePerMin || (s.damage || 0) / minutes,
                killParticipation: s.killParticipation || 0,
                visionPerMin: (s.vision || 0) / minutes
            });

        });

    });

    if (games.length < 2) return { games: games, holders: {} };

    /* Nota = média ponderada de quantos desvios cada número está da média do grupo */
    const scale = RECORD_METRICS.map(m => {
        const values = games.map(m.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1;
        return { mean, sd };
    });

    const totalWeight = RECORD_METRICS.reduce((a, m) => a + m.weight, 0);

    games.forEach(g => {
        const z = RECORD_METRICS.reduce((sum, m, i) =>
            sum + m.weight * (m.value(g) - scale[i].mean) / scale[i].sd, 0) / totalWeight;
        g.score = Math.max(0, Math.min(10, 5 + 2.5 * z));
    });

    /* Empate fica com quem fez primeiro: o recorde só muda se for superado */
    const sorted = games.slice().sort((a, b) => b.score - a.score || a.time - b.time);
    const worst = games.slice().sort((a, b) => a.score - b.score || a.time - b.time);

    return {
        games: games,
        holders: { paulinho: sorted[0], feed: worst[0] }
    };

}

/* Texto curto de uma atuação: campeão, K/D/A, nota */
function recordLine(g) {

    const champ = championNames[riotChampionId(g.champion)] || g.champion;

    return champ + " · " + g.kills + "/" + g.deaths + "/" + g.assists
        + " · nota " + formatNumber(g.score, 1);

}

/* ---------- RANKING POR XP (elo) ----------

   Cada um soma XP pelo que está segurando agora: títulos, medalhas
   e emblemas. Perdeu um título, perdeu o XP dele, então dá para
   subir e cair de elo conforme as partidas acontecem.
   Título dividido (empate) vale metade para cada dono.
   Os recordes de uma partida (🐐 / 🍼) não contam XP: são só um
   indicativo na listagem de jogadores. */

const XP_RULES = {
    titleGlory: 10,     /* título de glória segurado sozinho */
    titleShame: -5,     /* título de vergonha segurado sozinho */
    sharedFactor: 0.5,  /* título dividido: metade do XP para cada dono */
    badgeTier: [5, 10, 20], /* medalha 🥉 / 🥈 / 🥇 */
    emblem: 10          /* cada emblema permanente */
};

/* Elos em ordem; "min" = XP mínimo para chegar nele.
   Desafiante é para poucos: precisa praticamente dominar a casa. */
const ELO_TIERS = [
    { id: "ferro", name: "Ferro", icon: "🔩", min: -Infinity },
    { id: "bronze", name: "Bronze", icon: "🟤", min: 10 },
    { id: "prata", name: "Prata", icon: "⚪", min: 25 },
    { id: "ouro", name: "Ouro", icon: "🟡", min: 45 },
    { id: "platina", name: "Platina", icon: "💠", min: 75 },
    { id: "diamante", name: "Diamante", icon: "💎", min: 110 },
    { id: "mestre", name: "Mestre", icon: "🔮", min: 160 },
    { id: "desafiante", name: "Desafiante", icon: "⚜️", min: 350 }
];

function eloFor(xp) {
    return ELO_TIERS.filter(t => xp >= t.min).pop();
}

/* XP pode ter meio ponto (título de vergonha dividido) */
function xpText(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

/* Ranking: [{ player, xp, elo, next, parts: [{label, xp}] }], do maior XP ao menor */
function computeRanking(src, profiles, titles) {

    profiles = profiles || computePlayerProfiles(src);
    titles = titles || resolveTitles(profiles);

    const plural = (n, one, many) => n + " " + (n === 1 ? one : many);

    return profiles.map(p => {

        const parts = [];
        const add = (label, xp) => { if (xp) parts.push({ label: label, xp: xp }); };

        const mine = titles.filter(t => t.holders.includes(p));
        const count = (negative, shared) => mine.filter(t =>
            !!t.title.negative === negative && (t.holders.length > 1) === shared).length;

        const glorySolo = count(false, false);
        const gloryShared = count(false, true);
        const shameSolo = count(true, false);
        const shameShared = count(true, true);

        add(plural(glorySolo, "título de glória", "títulos de glória"), glorySolo * XP_RULES.titleGlory);
        add(plural(gloryShared, "título de glória dividido (metade)", "títulos de glória divididos (metade)"),
            gloryShared * XP_RULES.titleGlory * XP_RULES.sharedFactor);
        add(plural(shameSolo, "título de vergonha", "títulos de vergonha"), shameSolo * XP_RULES.titleShame);
        add(plural(shameShared, "título de vergonha dividido (metade)", "títulos de vergonha divididos (metade)"),
            shameShared * XP_RULES.titleShame * XP_RULES.sharedFactor);

        const { badges, emblems } = earnedBadges(p);

        badges.forEach(b => add(b.icon + " " + b.name + " " + b.medal, XP_RULES.badgeTier[b.tier - 1]));
        emblems.forEach(e => add(e.icon + " " + e.name, XP_RULES.emblem));

        const xp = parts.reduce((sum, part) => sum + part.xp, 0);
        const elo = eloFor(xp);
        const next = ELO_TIERS[ELO_TIERS.indexOf(elo) + 1] || null;

        return { player: p, xp: xp, elo: elo, next: next, parts: parts };

    }).sort((a, b) => b.xp - a.xp || b.player.games - a.player.games);

}

/* Texto do balão do elo: elo, XP e de onde vem */
function eloTip(rank) {
    return rank.elo.icon + " " + rank.elo.name + " · " + xpText(rank.xp) + " XP"
        + (rank.next ? " (faltam " + xpText(rank.next.min - rank.xp) + " para " + rank.next.icon + " " + rank.next.name + ")" : " · elo máximo")
        + (rank.parts.length ? "\n" + rank.parts.map(part => (part.xp > 0 ? "+" : "") + xpText(part.xp) + " " + part.label).join("\n") : "");
}

/* playerKey -> { badges, emblems, records, rank } (para o efeito no nick) */
function nickClassMap(src) {

    const map = {};

    computePlayerProfiles(src).forEach(p => {
        const { badges, emblems } = earnedBadges(p);
        if (badges.length + emblems.length > 0) map[p.key] = { badges: badges, emblems: emblems, records: [] };
    });

    const { holders } = computeGameRecords(src);

    GAME_RECORDS.forEach(rec => {

        const g = holders[rec.id];

        if (!g) return;

        const entry = map[g.key] || (map[g.key] = { badges: [], emblems: [], records: [] });
        entry.records.push({ record: rec, game: g });

    });

    /* Elo de todo mundo (ícone do lado do nick) */
    computeRanking(src).forEach(rank => {
        const entry = map[rank.player.key] || (map[rank.player.key] = { badges: [], emblems: [], records: [] });
        entry.rank = rank;
    });

    return map;

}

/* Classe do efeito e texto do tooltip para um conjunto de medalhas */
/* "badges" são níveis (ACHIEVEMENT_BADGES[i].levels[n]).
   Combo só conta medalhas no Ouro; senão vale o maior nível. */
function nickStyle(badges) {

    if (!badges || badges.length === 0) return null;

    const names = badges.map(b => b.icon + " " + b.name + " " + b.medal + " " + b.tierName);
    const golds = badges.filter(b => b.tier === 3);

    if (golds.length >= 2) {

        const combo = BADGE_COMBO_EFFECTS[Math.min(golds.length, 3)];
        const label = golds.length >= ACHIEVEMENT_BADGES.length
            ? "Todas as medalhas no Ouro"
            : golds.length + " medalhas no Ouro";

        return {
            nick: combo.nick,
            frame: combo.nick.replace("nick-", ""),
            tier: 3,
            sparkle: golds.length >= 3,
            tip: combo.icon + " " + label + ": " + names.join(", ")
        };

    }

    /* Maior nível; empate fica com a ordem da lista */
    const best = badges.reduce((a, b) => b.tier > a.tier ? b : a);

    return {
        nick: best.nick + " tier-" + best.tier,
        frame: best.nick.replace("nick-", ""),
        tier: best.tier,
        tip: names.join(", ")
    };

}

/* Nome do jogador com o efeito das medalhas, emblemas e recordes.
   "info" é uma lista de níveis ou o { badges, emblems, records } de nickClassMap. */
function decoratedNick(name, info) {

    const badges = Array.isArray(info) ? info : (info && info.badges) || [];
    const emblems = (!Array.isArray(info) && info && info.emblems) || [];
    const records = (!Array.isArray(info) && info && info.records) || [];

    let nick = badgeNick(name, badges);

    /* Emblemas: ícones pequenos logo depois do nick */
    if (emblems.length > 0) {

        const wrap = document.createElement("span");
        wrap.className = "nick-with-emblems";

        const icons = document.createElement("span");
        icons.className = "nick-emblems";
        icons.textContent = emblems.map(e => e.icon).join("");
        icons.title = emblems.map(e => e.icon + " " + e.name + " (" + e.desc.toLowerCase() + ")").join("\n");

        wrap.appendChild(nick);
        wrap.appendChild(icons);
        nick = wrap;

    }

    /* Cada recorde embrulha o nick numa pílula com a borda pulsando */
    records.forEach(({ record, game }) => {

        const pill = document.createElement("span");
        pill.className = "nick-record " + record.nick;
        pill.title = record.icon + " " + record.name
            + (game && game.score !== undefined ? "\n" + recordLine(game) : "")
            + (nick.title ? "\n" + nick.title : "");

        pill.appendChild(nick);
        nick = pill;

    });

    /* Elo: ícone antes do nick, com o detalhe do XP no balão */
    const rank = !Array.isArray(info) && info && info.rank;

    if (rank) {

        const wrap = document.createElement("span");
        wrap.className = "nick-with-elo";

        const elo = document.createElement("span");
        elo.className = "nick-elo elo-" + rank.elo.id;
        elo.textContent = rank.elo.icon;
        elo.title = eloTip(rank);

        wrap.appendChild(elo);
        wrap.appendChild(nick);
        nick = wrap;

    }

    return nick;

}

function badgeNick(name, badges) {

    const style = nickStyle(badges);

    const span = document.createElement("span");
    span.textContent = name;

    if (!style) return span;

    span.className = "nick " + style.nick;

    if (!style.sparkle) {
        span.title = style.tip;
        return span;
    }

    /* Trio: brilhinhos em volta do nome */
    const wrap = document.createElement("span");
    wrap.className = "nick-trio-wrap";
    wrap.title = style.tip;

    const left = document.createElement("span");
    left.className = "nick-sparkle";
    left.textContent = "✦";

    const right = left.cloneNode(true);
    right.classList.add("late");

    wrap.appendChild(left);
    wrap.appendChild(span);
    wrap.appendChild(right);

    return wrap;

}

/* Dono(s) de cada título: maior valor (ou menor, com "lowest"),
   empates dividem. Valor nulo, ou 0 nos títulos de maior, não dá
   título para ninguém. */
function resolveTitles(profiles) {

    return ACHIEVEMENT_TITLES.map(title => {

        /* Nos de menor valor, compara com o sinal trocado */
        const sign = title.lowest ? -1 : 1;

        const ranking = [];

        profiles.forEach(p => {

            if (title.eligible && !title.eligible(p)) return;

            const v = title.value(p);

            if (v === null || v === undefined || isNaN(v) || (!title.lowest && v <= 0)) return;

            ranking.push({ player: p, value: v });

        });

        ranking.sort((a, b) => sign * (b.value - a.value) || a.player.name.localeCompare(b.player.name, "pt-BR"));

        /* Posição com empate: valores iguais dividem a mesma posição */
        ranking.forEach((r, i) => {
            const prev = ranking[i - 1];
            r.place = prev && Math.abs(prev.value - r.value) <= 1e-9 ? prev.place : i + 1;
        });

        const best = ranking.length > 0 ? ranking[0].value : null;
        const holders = ranking.filter(r => r.place === 1).map(r => r.player);

        return { title: title, holders: holders, best: best, ranking: ranking };

    });

}

/* Explica cada medalha: metas de cada nível e exemplo do efeito no nick */
function badgeGuide() {

    const guide = document.createElement("div");
    guide.className = "badge-guide";

    const intro = document.createElement("p");
    intro.className = "badge-guide-intro";
    intro.textContent = "Metas pessoais: cada um desbloqueia a sua. As medalhas têm 3 níveis (🥉 Bronze, 🥈 Prata, 🥇 Ouro) e mudam o efeito do seu nick em todo o site; quanto maior o nível, mais forte o efeito. Quem junta medalhas no Ouro ganha um efeito ainda melhor. Os emblemas são permanentes e aparecem como um ícone do lado do nick.";
    guide.appendChild(intro);

    const grid = document.createElement("div");
    grid.className = "badge-guide-grid";

    const item = (icon, name, rows) => {

        const card = document.createElement("div");
        card.className = "badge-guide-item";

        const top = document.createElement("div");
        top.className = "badge-guide-name";
        top.textContent = icon + " " + name;
        card.appendChild(top);

        /* Uma linha por nível: meta, exemplo do nick e efeito */
        rows.forEach(r => {

            const row = document.createElement("div");
            row.className = "badge-guide-level";

            const g = document.createElement("div");
            g.className = "badge-guide-goal";
            g.textContent = r.goal;

            const s = document.createElement("div");
            s.className = "badge-guide-sample";
            s.appendChild(r.sample);

            const e = document.createElement("div");
            e.className = "badge-guide-effect";
            e.textContent = r.effect;

            row.appendChild(g);
            row.appendChild(s);
            row.appendChild(e);
            card.appendChild(row);

        });

        return card;

    };

    ACHIEVEMENT_BADGES.forEach(badge => {
        grid.appendChild(item(badge.icon, badge.name, badge.levels.map(level => ({
            goal: level.medal + " " + level.tierName + ": " + level.desc.toLowerCase(),
            sample: decoratedNick("Seu nick", [level]),
            effect: level.effect
        }))));
    });

    const golds = ACHIEVEMENT_BADGES.map(b => b.levels[2]);

    grid.appendChild(item("🤝", "Combos", [
        {
            goal: BADGE_COMBO_EFFECTS[2].icon + " Ter 2 medalhas no Ouro",
            sample: decoratedNick("Seu nick", golds.slice(0, 2)),
            effect: BADGE_COMBO_EFFECTS[2].effect
        },
        {
            goal: BADGE_COMBO_EFFECTS[3].icon + " Ter as 3 medalhas no Ouro",
            sample: decoratedNick("Seu nick", golds),
            effect: BADGE_COMBO_EFFECTS[3].effect
        }
    ]));

    grid.appendChild(item("📌", "Emblemas permanentes", EMBLEM_BADGES.map(emblem => ({
        goal: emblem.icon + " " + emblem.name + ": " + emblem.desc.toLowerCase(),
        sample: decoratedNick("Seu nick", { badges: [], emblems: [emblem], records: [] }),
        effect: emblem.effect
    }))));

    guide.appendChild(grid);

    return guide;

}

/* Progresso de uma medalha com nível: meta do próximo nível e texto */
function levelProgress(badge, profile) {

    const value = badge.current(profile);
    const level = badgeLevel(badge, profile);
    const next = badge.levels.find(l => value < l.goal) || null;
    const prevGoal = level ? level.goal : 0;

    return {
        value: value,
        level: level,
        next: next,
        /* Barra cheia = meta final (100); marcações nos níveis do meio */
        pct: Math.min(100, Math.round(value / badge.goals[badge.goals.length - 1] * 100)),
        /* Anel = quanto falta para o próximo nível */
        ringPct: next ? Math.round((value - prevGoal) / (next.goal - prevGoal) * 100) : 100
    };

}

/* Anel compacto de progresso, com o ícone da medalha no meio e o
   nível atual (🥉🥈🥇) no cantinho */
function badgeRing(badge, profile) {

    const ring = document.createElement("span");

    const icon = document.createElement("span");
    icon.textContent = badge.icon;
    ring.appendChild(icon);

    /* Emblema: feito ou não */
    if (!badge.levels) {

        const value = badge.current(profile);
        const has = BADGE_PREVIEW
            ? earnedBadges(profile).emblems.includes(badge)
            : value >= badge.goal;

        ring.className = "badge-ring ring-emblem" + (has ? " done" : "");
        ring.style.setProperty("--p", Math.min(100, Math.round(value / badge.goal * 100)));
        ring.title = badge.icon + " " + badge.name + ": "
            + (has ? "conquistado ✔" : Math.min(value, badge.goal) + "/" + badge.goal + " " + badge.unit);

        return ring;

    }

    const pr = levelProgress(badge, profile);
    const level = BADGE_PREVIEW
        ? earnedBadges(profile).badges.find(l => l.line === badge) || null
        : pr.level;

    ring.className = "badge-ring ring-" + badge.nick.replace("nick-", "")
        + (level ? " done tier-" + level.tier : "");
    ring.style.setProperty("--p", BADGE_PREVIEW && level ? 100 : pr.ringPct);

    ring.title = badge.icon + " " + badge.name + ": "
        + (level ? level.medal + " " + level.tierName : "sem nível")
        + " · " + pr.value + " " + badge.unit
        + (pr.next ? " (faltam " + (pr.next.goal - pr.value) + " para " + pr.next.medal + " " + pr.next.tierName + ")" : " ✔ nível máximo");

    if (level) {
        const medal = document.createElement("i");
        medal.className = "badge-ring-tier";
        medal.textContent = level.medal;
        ring.appendChild(medal);
    }

    return ring;

}

/* Barra de progresso de uma medalha (ou emblema) para um jogador */
function badgeProgress(badge, profile) {

    const line = document.createElement("div");

    const label = document.createElement("span");
    label.className = "badge-progress-label";

    const bar = document.createElement("span");
    bar.className = "badge-progress-bar";

    const fill = document.createElement("span");
    bar.appendChild(fill);

    const count = document.createElement("span");
    count.className = "badge-progress-count";

    if (!badge.levels) {

        /* Emblema */
        const value = badge.current(profile);
        const has = value >= badge.goal;

        line.className = "badge-progress" + (has ? " done" : "");
        line.title = badge.name + ": " + badge.desc.toLowerCase()
            + (badge.detail ? "\n" + badge.detail(profile) : "")
            + "\nRecompensa: " + badge.effect;

        label.textContent = badge.icon + " " + badge.name;
        fill.className = "badge-progress-fill fill-emblem";
        fill.style.width = Math.min(100, Math.round(value / badge.goal * 100)) + "%";
        count.textContent = has
            ? "✔ conquistado"
            : Math.min(value, badge.goal) + "/" + badge.goal + " " + badge.unit;

    } else {

        const pr = levelProgress(badge, profile);

        line.className = "badge-progress" + (pr.level ? " done" : "");
        line.title = badge.levels.map(l => l.medal + " " + l.tierName + ": " + l.desc.toLowerCase()
            + " → " + l.effect + (pr.value >= l.goal ? " ✔" : "")).join("\n");

        label.textContent = badge.icon + " " + badge.name
            + (pr.level ? " " + pr.level.medal : "");

        fill.className = "badge-progress-fill fill-" + badge.nick.replace("nick-", "");
        fill.style.width = pr.pct + "%";

        /* Marcações dos níveis do meio (25 e 50) */
        badge.goals.slice(0, -1).forEach(goal => {
            const tick = document.createElement("i");
            tick.className = "badge-progress-tick";
            tick.style.left = (goal / badge.goals[badge.goals.length - 1] * 100) + "%";
            bar.appendChild(tick);
        });

        count.textContent = pr.next
            ? pr.value + "/" + pr.next.goal + " " + badge.unit + " → " + pr.next.medal
            : "✔ " + pr.level.medal + " " + pr.level.tierName;

    }

    line.appendChild(label);
    line.appendChild(bar);
    line.appendChild(count);

    return line;

}

/* ---------- HALL DOS TÍTULOS (parte de cima da aba) ---------- */

/* Aba aberta no hall: false = Glória, true = Vergonha.
   Fica guardada para não voltar à Glória a cada atualização. */
let hallShowNegative = false;

/* Categorias recolhidas ("gloria:combate", "vergonha:visao"...).
   Guardadas no navegador de cada um; se não der para ler, tudo abre. */
const HALL_COLLAPSED_KEY = "sorteador.hallRecolhidas";

const hallCollapsed = (() => {
    try {
        return new Set(JSON.parse(localStorage.getItem(HALL_COLLAPSED_KEY) || "[]"));
    } catch (e) {
        return new Set();
    }
})();

function saveHallCollapsed() {
    try {
        localStorage.setItem(HALL_COLLAPSED_KEY, JSON.stringify([...hallCollapsed]));
    } catch (e) { /* sem armazenamento: só não lembra */ }
}

/* Lista de nicks separados por " & " */
function nickList(players, nicks) {

    const wrap = document.createElement("span");

    players.forEach((p, i) => {
        if (i > 0) wrap.appendChild(document.createTextNode(" & "));
        wrap.appendChild(decoratedNick(p.name, nicks[p.key]));
    });

    return wrap;

}

/* Largura da barra de quem está atrás, em relação ao líder */
function rankBarWidth(title, value, best) {

    if (title.lowest) return value > 0 ? Math.max(4, best / value * 100) : 100;

    return best > 0 ? Math.max(4, value / best * 100) : 0;

}

/* Card de um título: dono em destaque e quem vem logo atrás */
function titleCard(result, nicks) {

    const { title, holders, best, ranking } = result;
    const vacant = holders.length === 0;

    const card = document.createElement("div");
    card.className = "tcard" + (title.negative ? " negative" : "") + (vacant ? " vacant" : "");

    /* Cabeçalho: ícone, nome e regra */
    const head = document.createElement("div");
    head.className = "tcard-head";

    const icon = document.createElement("span");
    icon.className = "tcard-icon";
    icon.textContent = title.icon;

    const text = document.createElement("div");
    text.className = "tcard-text";

    const name = document.createElement("div");
    name.className = "tcard-name";
    name.textContent = title.name;

    const desc = document.createElement("div");
    desc.className = "tcard-desc";
    desc.textContent = title.desc;

    text.appendChild(name);
    text.appendChild(desc);
    head.appendChild(icon);
    head.appendChild(text);
    card.appendChild(head);

    /* Dono atual */
    const owner = document.createElement("div");
    owner.className = "tcard-owner";

    if (vacant) {
        owner.textContent = "Vago: ninguém pontuou ainda";
        card.appendChild(owner);
        return card;
    }

    const crown = document.createElement("span");
    crown.className = "tcard-crown";
    crown.textContent = title.negative ? "🤡" : "👑";

    const who = document.createElement("span");
    who.className = "tcard-who";
    who.appendChild(nickList(holders, nicks));

    const value = document.createElement("span");
    value.className = "tcard-value";
    value.textContent = title.show(best);

    owner.appendChild(crown);
    owner.appendChild(who);
    owner.appendChild(value);
    card.appendChild(owner);

    /* Na cola: 2º e 3º lugares, com barra em relação ao dono */
    const chasers = ranking.filter(r => r.place > 1).slice(0, 2);

    if (chasers.length > 0) {

        const list = document.createElement("ol");
        list.className = "tcard-chasers";

        chasers.forEach(r => {

            const li = document.createElement("li");

            const pos = document.createElement("span");
            pos.className = "tcard-pos";
            pos.textContent = r.place + "º";

            const nick = document.createElement("span");
            nick.className = "tcard-chaser";
            nick.appendChild(decoratedNick(r.player.name, nicks[r.player.key]));

            const bar = document.createElement("span");
            bar.className = "tcard-bar";

            const fill = document.createElement("i");
            fill.style.width = rankBarWidth(title, r.value, best) + "%";
            bar.appendChild(fill);

            const val = document.createElement("span");
            val.className = "tcard-chaser-value";
            val.textContent = title.show(r.value);

            li.appendChild(pos);
            li.appendChild(nick);
            li.appendChild(bar);
            li.appendChild(val);
            list.appendChild(li);

        });

        card.appendChild(list);

    }

    return card;

}

/* Pódio: os 3 que mais têm títulos na aba aberta, numa linha só.
   Mostra só a contagem e uma prévia de alguns ícones. */
const PODIUM_PREVIEW_ICONS = 3;

function hallBoard(results, nicks, negative) {

    const counts = {};

    results.forEach(r => {
        r.holders.forEach(p => {
            const c = counts[p.key] || (counts[p.key] = { player: p, titles: [] });
            c.titles.push(r.title);
        });
    });

    const rows = Object.values(counts)
        .sort((a, b) => b.titles.length - a.titles.length
            || a.player.name.localeCompare(b.player.name, "pt-BR"));

    const board = document.createElement("div");
    board.className = "hall-board" + (negative ? " negative" : "");

    const label = document.createElement("div");
    label.className = "hall-board-label";
    label.textContent = negative ? "💀 Pódio da vergonha" : "👑 Quem manda na casa";
    board.appendChild(label);

    if (rows.length === 0) {
        const none = document.createElement("div");
        none.className = "hall-board-empty";
        none.textContent = "Ninguém tem título aqui ainda.";
        board.appendChild(none);
        return board;
    }

    /* Posição com empate (mesma quantidade = mesmo lugar) */
    let place = 0;
    let lastCount = null;

    rows.forEach((row, i) => {
        if (row.titles.length !== lastCount) place = i + 1;
        lastCount = row.titles.length;
        row.place = place;
    });

    const medals = negative ? ["🤡", "💩", "🙈"] : ["🥇", "🥈", "🥉"];

    const podium = document.createElement("div");
    podium.className = "podium";

    rows.filter(row => row.place <= 3).slice(0, 3).forEach(row => {

        const spot = document.createElement("div");
        spot.className = "podium-spot place-" + row.place;
        spot.title = row.titles.map(t => t.icon + " " + t.name).join("\n");

        const medal = document.createElement("span");
        medal.className = "podium-medal";
        medal.textContent = medals[row.place - 1];

        const name = document.createElement("strong");
        name.className = "podium-name";
        name.appendChild(decoratedNick(row.player.name, nicks[row.player.key]));

        const count = document.createElement("span");
        count.className = "podium-count";
        count.textContent = row.titles.length + (row.titles.length === 1 ? " título" : " títulos");

        /* Prévia: alguns ícones e "+N" do resto */
        const preview = document.createElement("span");
        preview.className = "podium-preview";
        preview.textContent = row.titles.slice(0, PODIUM_PREVIEW_ICONS).map(t => t.icon).join("")
            + (row.titles.length > PODIUM_PREVIEW_ICONS ? " +" + (row.titles.length - PODIUM_PREVIEW_ICONS) : "");

        spot.appendChild(medal);
        spot.appendChild(name);
        spot.appendChild(count);
        spot.appendChild(preview);
        podium.appendChild(spot);

    });

    board.appendChild(podium);

    return board;

}

/* Abas Glória/Vergonha, placar e títulos agrupados por categoria */
function renderHall(hall, titles, nicks) {

    hall.innerHTML = "";

    const tabs = document.createElement("div");
    tabs.className = "hall-tabs";
    tabs.setAttribute("role", "tablist");

    [
        { negative: false, label: "👑 Glória" },
        { negative: true, label: "💀 Vergonha" }
    ].forEach(tab => {

        const owned = titles.filter(t => !!t.title.negative === tab.negative);

        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", String(hallShowNegative === tab.negative));
        button.className = "hall-tab" + (tab.negative ? " negative" : "")
            + (hallShowNegative === tab.negative ? " active" : "");

        button.textContent = tab.label + " ";

        const count = document.createElement("span");
        count.className = "hall-tab-count";
        count.textContent = owned.length;
        button.appendChild(count);

        button.addEventListener("click", () => {
            if (hallShowNegative === tab.negative) return;
            hallShowNegative = tab.negative;
            renderHall(hall, titles, nicks);
        });

        tabs.appendChild(button);

    });

    hall.appendChild(tabs);

    const shown = titles.filter(t => !!t.title.negative === hallShowNegative);

    hall.appendChild(hallBoard(shown, nicks, hallShowNegative));

    TITLE_CATEGORIES.forEach(cat => {

        const inCat = shown.filter(t => t.title.cat === cat.key);

        if (inCat.length === 0) return;

        /* Categoria recolhível; lembra o que cada um deixou fechado */
        const stateKey = (hallShowNegative ? "vergonha:" : "gloria:") + cat.key;

        const section = document.createElement("details");
        section.className = "hall-section";
        section.open = !hallCollapsed.has(stateKey);

        const catHead = document.createElement("summary");
        catHead.className = "hall-cat" + (hallShowNegative ? " negative" : "");

        const catName = document.createElement("span");
        catName.textContent = cat.head;

        const catCount = document.createElement("span");
        catCount.className = "hall-cat-count";
        catCount.textContent = inCat.length;

        catHead.appendChild(catName);
        catHead.appendChild(catCount);
        section.appendChild(catHead);

        section.addEventListener("toggle", () => {
            if (section.open) hallCollapsed.delete(stateKey);
            else hallCollapsed.add(stateKey);
            saveHallCollapsed();
        });

        const grid = document.createElement("div");
        grid.className = "hall-grid";

        /* Vagos vão para o fim da categoria */
        inCat
            .slice()
            .sort((a, b) => (a.holders.length === 0) - (b.holders.length === 0))
            .forEach(result => grid.appendChild(titleCard(result, nicks)));

        section.appendChild(grid);
        hall.appendChild(section);

    });

}

/* Detalhes de uma atuação, em pedacinhos */
function recordStats(g) {

    const date = new Date(g.time).toLocaleDateString("pt-BR");

    return [
        g.kills + "/" + g.deaths + "/" + g.assists,
        formatNumber(g.goldPerMin, 0) + " ouro/min",
        formatNumber(g.damagePerMin, 0) + " dano/min",
        formatNumber(g.killParticipation * 100, 0) + "% part.",
        formatNumber(g.visionPerMin, 1) + " visão/min",
        (g.win ? "vitória" : "derrota") + " em " + date
    ];

}

/* Os dois recordes que trocam de dono */
function recordsSection(src, profiles, nicks) {

    const wrap = document.createElement("div");

    const head = document.createElement("h3");
    head.className = "ach-section";
    head.textContent = "🔄 Recordes de uma partida";
    wrap.appendChild(head);

    const intro = document.createElement("p");
    intro.className = "hall-intro";
    intro.textContent = "Cada atuação ganha uma nota de 0 a 10 comparando KDA, mortes, ouro, dano, participação nos abates e visão com todas as partidas do grupo (só partidas com dados completos e 15 min ou mais). A medalha troca de dono quando alguém faz uma partida melhor, ou pior, e muda o nick de quem está com ela.";
    wrap.appendChild(intro);

    const { games, holders } = computeGameRecords(src);
    const names = {};
    profiles.forEach(p => { names[p.key] = p.name; });

    const grid = document.createElement("div");
    grid.className = "record-grid";

    GAME_RECORDS.forEach(rec => {

        const card = document.createElement("div");
        card.className = "record-card " + rec.nick;

        const top = document.createElement("div");
        top.className = "record-top";

        const icon = document.createElement("span");
        icon.className = "record-icon";
        icon.textContent = rec.icon;

        const text = document.createElement("div");

        const name = document.createElement("div");
        name.className = "record-name";
        name.textContent = rec.name;

        const desc = document.createElement("div");
        desc.className = "record-desc";
        desc.textContent = rec.desc;

        text.appendChild(name);
        text.appendChild(desc);
        top.appendChild(icon);
        top.appendChild(text);
        card.appendChild(top);

        const g = holders[rec.id];

        if (!g) {
            const none = document.createElement("div");
            none.className = "record-empty";
            none.textContent = "Ainda não tem partidas com dados suficientes.";
            card.appendChild(none);
            grid.appendChild(card);
            return;
        }

        const owner = document.createElement("div");
        owner.className = "record-owner";

        const who = document.createElement("span");
        who.className = "record-who";
        who.appendChild(decoratedNick(names[g.key] || g.key, nicks[g.key]));

        const champ = document.createElement("span");
        champ.className = "record-champ";
        champ.textContent = "de " + (championNames[riotChampionId(g.champion)] || g.champion);

        const score = document.createElement("span");
        score.className = "record-score";
        score.textContent = formatNumber(g.score, 1);
        score.title = "Nota de 0 a 10";

        owner.appendChild(who);
        owner.appendChild(champ);
        owner.appendChild(score);
        card.appendChild(owner);

        const stats = document.createElement("div");
        stats.className = "record-stats";

        recordStats(g).forEach(t => {
            const s = document.createElement("span");
            s.textContent = t;
            stats.appendChild(s);
        });

        card.appendChild(stats);

        /* Quem chegou mais perto de tomar o recorde */
        const next = games
            .filter(x => x !== g)
            .sort((a, b) => rec.best ? b.score - a.score : a.score - b.score)
            .slice(0, 2);

        if (next.length > 0) {

            const list = document.createElement("ol");
            list.className = "tcard-chasers record-chasers";

            next.forEach((x, i) => {

                const li = document.createElement("li");

                const pos = document.createElement("span");
                pos.className = "tcard-pos";
                pos.textContent = (i + 2) + "º";

                const nick = document.createElement("span");
                nick.className = "tcard-chaser";
                nick.textContent = (names[x.key] || x.key) + " · "
                    + (championNames[riotChampionId(x.champion)] || x.champion)
                    + " " + x.kills + "/" + x.deaths + "/" + x.assists;

                const val = document.createElement("span");
                val.className = "tcard-chaser-value";
                val.textContent = "nota " + formatNumber(x.score, 1);

                li.appendChild(pos);
                li.appendChild(nick);
                li.appendChild(val);
                list.appendChild(li);

            });

            card.appendChild(list);

        }

        grid.appendChild(card);

    });

    wrap.appendChild(grid);

    return wrap;

}

/* Ranking por XP: posição, elo, XP, barra até o próximo elo e de onde vem */
function rankingSection(ranking) {

    const wrap = document.createElement("div");
    wrap.className = "ranking";

    const head = document.createElement("h3");
    head.className = "ach-section";
    head.textContent = "🎖️ Ranking dos guri";
    wrap.appendChild(head);

    const intro = document.createElement("p");
    intro.className = "hall-intro";
    intro.textContent = "Cada um ganha XP pelo que está segurando agora: título de glória +" + XP_RULES.titleGlory
        + ", medalhas 🥉🥈🥇 +" + XP_RULES.badgeTier.join("/+")
        + " e emblemas +" + XP_RULES.emblem
        + ". Título de vergonha tira " + (-XP_RULES.titleShame)
        + ". Perdeu o título, perdeu o XP: dá para subir e cair de elo.";
    wrap.appendChild(intro);

    /* Regra do título dividido, em destaque */
    const shared = document.createElement("p");
    shared.className = "ranking-rule";
    shared.textContent = "⚖️ Título dividido (empate) vale metade do XP para cada dono: +"
        + xpText(XP_RULES.titleGlory * XP_RULES.sharedFactor) + " na glória e "
        + xpText(XP_RULES.titleShame * XP_RULES.sharedFactor) + " na vergonha. "
        + "Os recordes 🐐 e 🍼 não valem XP.";
    wrap.appendChild(shared);

    /* Escala dos elos */
    const scale = document.createElement("div");
    scale.className = "elo-scale";

    ELO_TIERS.forEach(tier => {
        const step = document.createElement("span");
        step.className = "elo-step elo-" + tier.id;
        step.textContent = tier.icon + " " + tier.name;
        step.title = tier.min === -Infinity ? "Começo" : "A partir de " + tier.min + " XP";
        scale.appendChild(step);
    });

    wrap.appendChild(scale);

    const list = document.createElement("ol");
    list.className = "ranking-list";

    let place = 0;
    let lastXp = null;

    ranking.forEach((rank, i) => {

        if (rank.xp !== lastXp) place = i + 1;
        lastXp = rank.xp;

        const li = document.createElement("li");
        li.className = "ranking-row elo-" + rank.elo.id + (place === 1 ? " top" : "");
        li.title = eloTip(rank);

        const pos = document.createElement("span");
        pos.className = "ranking-pos";
        pos.textContent = place + "º";

        const badge = document.createElement("span");
        badge.className = "ranking-elo";

        const icon = document.createElement("span");
        icon.className = "ranking-elo-icon";
        icon.textContent = rank.elo.icon;

        const tierName = document.createElement("span");
        tierName.textContent = rank.elo.name;

        badge.appendChild(icon);
        badge.appendChild(tierName);

        const name = document.createElement("strong");
        name.className = "ranking-name";
        name.textContent = rank.player.name;

        /* Barra até o próximo elo */
        const progress = document.createElement("span");
        progress.className = "ranking-progress";

        const bar = document.createElement("span");
        bar.className = "ranking-bar";

        const fill = document.createElement("i");
        const floor = rank.elo.min === -Infinity ? Math.min(0, rank.xp) : rank.elo.min;
        fill.style.width = rank.next
            ? Math.max(0, Math.min(100, (rank.xp - floor) / (rank.next.min - floor) * 100)) + "%"
            : "100%";
        bar.appendChild(fill);

        const nextText = document.createElement("small");
        nextText.textContent = rank.next
            ? "faltam " + xpText(rank.next.min - rank.xp) + " para " + rank.next.icon + " " + rank.next.name
            : "elo máximo";

        progress.appendChild(bar);
        progress.appendChild(nextText);

        const xp = document.createElement("span");
        xp.className = "ranking-xp";
        xp.textContent = xpText(rank.xp) + " XP";

        li.appendChild(pos);
        li.appendChild(badge);
        li.appendChild(name);
        li.appendChild(progress);
        li.appendChild(xp);
        list.appendChild(li);

    });

    wrap.appendChild(list);

    return wrap;

}

function renderAchievements(src) {

    const box = document.getElementById("statsAchievements");

    box.innerHTML = "";

    const profiles = computePlayerProfiles(src);
    const nicks = nickClassMap(src);

    if (profiles.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Nenhuma partida válida ainda. Sorteie para começar a distribuir títulos.";
        box.appendChild(empty);
        return;
    }

    /* ----- Títulos ----- */

    const titles = resolveTitles(profiles);

    /* ----- Ranking por XP ----- */

    box.appendChild(rankingSection(computeRanking(src, profiles, titles)));

    const titlesHead = document.createElement("h3");
    titlesHead.className = "ach-section";
    titlesHead.textContent = "🏆 Títulos da casa";
    box.appendChild(titlesHead);

    const hallIntro = document.createElement("p");
    hallIntro.className = "hall-intro";
    hallIntro.textContent = "Cada título tem um dono só: quem tem o maior número leva (empate divide). Embaixo do dono aparece quem está na cola para roubar.";
    box.appendChild(hallIntro);

    const hall = document.createElement("div");
    hall.className = "hall";
    box.appendChild(hall);

    /* Nos títulos e recordes o nick vai sem efeito, para não poluir os cards.
       O efeito aparece só na listagem de jogadores. */
    const plainNicks = {};

    renderHall(hall, titles, plainNicks);

    /* ----- Recordes de uma partida ----- */

    box.appendChild(recordsSection(src, profiles, plainNicks));

    /* ----- Linha do tempo ----- */

    box.appendChild(timelineSection(src));

    /* ----- Medalhas por jogador ----- */

    const badgesHead = document.createElement("h3");
    badgesHead.className = "ach-section";
    badgesHead.textContent = "🎖️ Medalhas por jogador";
    box.appendChild(badgesHead);

    /* Guia recolhido: abre só para quem quiser ler */
    const guideBox = document.createElement("details");
    guideBox.className = "badge-guide-box";

    const guideSummary = document.createElement("summary");
    guideSummary.textContent = "ℹ️ Como ganhar medalhas e o que elas dão";

    guideBox.appendChild(guideSummary);
    guideBox.appendChild(badgeGuide());
    box.appendChild(guideBox);

    profiles
        .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name, "pt-BR"))
        .forEach(p => {

            /* Linha compacta; clicar abre os detalhes */
            const row = document.createElement("details");
            row.className = "ach-player";

            /* Títulos que este jogador detém agora */
            const ownTitles = titles.filter(t => t.holders.includes(p));

            const head = document.createElement("summary");
            head.className = "ach-player-head";

            const name = document.createElement("strong");
            name.className = "ach-player-name";
            name.appendChild(decoratedNick(p.name, nicks[p.key]));

            /* Um anel de progresso por medalha */
            const rings = document.createElement("span");
            rings.className = "badge-rings";

            ACHIEVEMENT_BADGES.concat(EMBLEM_BADGES).forEach(badge => {
                rings.appendChild(badgeRing(badge, p));
            });

            /* Títulos só como ícones (dourado ou vermelho) */
            const icons = document.createElement("span");
            icons.className = "title-icons";

            ownTitles.forEach(({ title, holders, best }) => {
                const icon = document.createElement("span");
                icon.className = "title-icon" + (title.negative ? " negative" : "");
                icon.textContent = title.icon;
                icon.title = title.name + "\n" + title.desc + " — " + title.show(best, holders)
                    + (holders.length > 1 ? " (dividido)" : "");
                icons.appendChild(icon);
            });

            /* Recordes de uma partida que estão com ele agora */
            ((nicks[p.key] && nicks[p.key].records) || []).forEach(({ record, game }) => {
                const icon = document.createElement("span");
                icon.className = "title-icon record " + record.nick;
                icon.textContent = record.icon;
                icon.title = record.name + "\n" + recordLine(game);
                icons.appendChild(icon);
            });

            head.appendChild(name);
            head.appendChild(rings);
            head.appendChild(icons);

            const chips = document.createElement("div");
            chips.className = "ach-chips";

            ownTitles.forEach(({ title, holders, best }) => {

                const chip = document.createElement("span");

                chip.className = "ach-chip title" + (title.negative ? " negative" : "");
                chip.textContent = title.icon + " " + title.name;
                chip.title = "Título: " + title.desc + " — " + title.show(best, holders)
                    + (holders.length > 1 ? " (dividido)" : "");

                chips.appendChild(chip);

            });

            /* Progresso de cada medalha */
            const progress = document.createElement("div");
            progress.className = "badge-progress-list";

            ACHIEVEMENT_BADGES.concat(EMBLEM_BADGES).forEach(badge => {
                progress.appendChild(badgeProgress(badge, p));
            });

            const body = document.createElement("div");
            body.className = "ach-player-body";

            if (chips.children.length > 0) body.appendChild(chips);
            body.appendChild(progress);

            row.appendChild(head);
            row.appendChild(body);

            box.appendChild(row);

        });

}

/* =====================================================
   NICK E MOLDURA NOS CARDS DO SORTEIO

   Só visual: não muda nada no sorteio. Quem tem medalha ou
   recorde aparece com o nick decorado e uma moldura especial
   em volta da imagem do campeão.
===================================================== */

/* Efeitos atuais de cada jogador, calculados a partir do global */
let drawNicks = {};

/* Classe da moldura, conforme as medalhas do jogador */
function frameClass(info) {

    if (!info) return "";

    const style = nickStyle(info.badges || []);

    return style ? "frame-" + style.frame + " ftier-" + style.tier : "";

}

const FRAME_CLASSES = ["frame-lenda", "frame-bafeador", "frame-burro", "frame-duo", "frame-trio",
    "ftier-1", "ftier-2", "ftier-3"];

/* Aplica nick e moldura num card já revelado */
function decorateResultCard(card, playerName, info) {

    if (!card) return;

    if (playerName !== undefined) card.dataset.player = playerName;

    const name = card.dataset.player;
    const text = card.querySelector(".shuffle-text");

    if (!name || !text || card.querySelector(".dice:not([style*='none'])")) return;

    /* No sorteio fica limpo: só o nick com o efeito da medalha e a moldura.
       Nada de ícones (emblemas, elo, etiqueta); isso fica na listagem de jogadores. */
    const found = info !== undefined ? info : drawNicks[playerKey(name)];
    const effects = found ? { badges: found.badges || [], emblems: [], records: [] } : null;

    text.innerHTML = "";
    const strong = document.createElement("strong");
    strong.appendChild(decoratedNick(name, effects));
    text.appendChild(strong);

    FRAME_CLASSES.forEach(c => card.classList.remove(c));

    const frame = frameClass(effects);
    if (frame) frame.split(" ").forEach(c => card.classList.add(c));

}

/* Dados mudaram: recalcula e refaz os cards que estão na tela */
function refreshDrawNicks() {

    if (typeof globalData === "undefined" || !globalData.partidas) return;

    drawNicks = nickClassMap(globalData);

    document.querySelectorAll("#results .result[data-player]").forEach(card => {
        decorateResultCard(card);
    });

    /* Aviso de troca de dono e resumo da partida (só leitura) */
    try {
        checkOwnerChanges(globalData);
        renderMatchSummary(globalData);
    } catch (e) {
        console.error(e);
    }

}

/* ---------- MEDALHAS QUE APARECEM NO SORTEIO (info) ----------
   Abaixo do resultado, recolhido por padrão: um card de exemplo de
   cada medalha, com a meta e o efeito, todos com o mesmo campeão.
   Não mexe no sorteio. Trocar para false some com a seção. */
const FRAME_PREVIEW = true;
const FRAME_PREVIEW_CHAMPION = "Ahri";

function renderFramePreview() {

    if (!FRAME_PREVIEW || document.getElementById("framePreview")) return;

    const results = document.getElementById("results");

    if (!results) return;

    /* Rótulo do card = meta para conquistar */
    const golds = ACHIEVEMENT_BADGES.map(b => b.levels[2]);
    const sampleNames = ["Lenda", "Bafeador", "Burro"];

    const samples = [];

    /* Cada medalha nos 3 níveis */
    ACHIEVEMENT_BADGES.forEach((badge, i) => {
        badge.levels.forEach(level => samples.push({
            label: level.medal + " " + level.desc,
            name: sampleNames[i],
            info: { badges: [level], emblems: [], records: [] }
        }));
    });

    samples.push(
        { label: "🔥 2 medalhas no Ouro", name: "Combo", info: { badges: golds.slice(0, 2), emblems: [], records: [] } },
        { label: "✨ 3 medalhas no Ouro", name: "Supremo", info: { badges: golds, emblems: [], records: [] } }
    );

    /* Fica recolhido: é só uma info de quem quiser ver o que dá para conquistar */
    const wrap = document.createElement("details");
    wrap.id = "framePreview";
    wrap.className = "frame-preview";

    const title = document.createElement("summary");
    title.className = "frame-preview-title";
    title.textContent = "🎖️ Medalhas que aparecem no sorteio (o que dá para conquistar)";
    wrap.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "results frame-preview-grid";

    samples.forEach(sample => {

        const card = document.createElement("div");
        card.className = "result";

        const lane = document.createElement("div");
        lane.className = "lane-name";
        lane.textContent = sample.label;

        const box = document.createElement("div");
        box.className = "shuffle-container";

        const image = document.createElement("img");
        image.src = IMAGE_URL + FRAME_PREVIEW_CHAMPION + ".png";

        const text = document.createElement("div");
        text.className = "shuffle-text";

        const champion = document.createElement("div");
        champion.className = "champion";
        champion.textContent = championNames[FRAME_PREVIEW_CHAMPION] || FRAME_PREVIEW_CHAMPION;

        box.appendChild(image);
        box.appendChild(text);
        box.appendChild(champion);
        card.appendChild(lane);
        card.appendChild(box);
        grid.appendChild(card);

        decorateResultCard(card, sample.name, sample.info);

    });

    wrap.appendChild(grid);
    results.insertAdjacentElement("afterend", wrap);

}

window.addEventListener("load", () => {
    /* Espera a versão do Data Dragon carregar para a imagem não quebrar */
    setTimeout(renderFramePreview, 1500);
});

/* =====================================================
   LINHA DO TEMPO DOS TÍTULOS E RECORDES

   Refaz a história partida a partida: depois de cada partida,
   calcula de novo quem tem cada título/recorde e anota as trocas.
   Só lê os dados que já existem; nada é gravado.
===================================================== */

/* Partidas válidas em ordem de horário, com o id de cada uma */
function orderedMatches(src) {
    return Object.entries(src.partidas || {})
        .filter(([, m]) => m && m.resultado !== "anulada" && Object.values(m.entries || {}).length > 0)
        .sort((a, b) => (a[1].time || 0) - (b[1].time || 0));
}

/* Quem tem cada título/recorde agora: id -> { item, keys, names } */
function holderSnapshot(src) {

    const profiles = computePlayerProfiles(src);
    const names = {};
    profiles.forEach(p => { names[p.key] = p.name; });

    const snap = {};

    resolveTitles(profiles).forEach(({ title, holders }) => {
        snap["t:" + title.name] = {
            kind: "title", icon: title.icon, label: title.name, negative: !!title.negative,
            keys: holders.map(h => h.key).sort()
        };
    });

    const { holders } = computeGameRecords(src);

    GAME_RECORDS.forEach(rec => {
        const g = holders[rec.id];
        snap["r:" + rec.id] = {
            kind: "record", icon: rec.icon, label: rec.name, negative: !rec.best,
            keys: g ? [g.key] : []
        };
    });

    Object.values(snap).forEach(s => { s.names = s.keys.map(k => names[k] || k); });

    return snap;

}

/* Texto de uma troca: "Fer tomou X de Nardi", "Fer empatou com Nardi em X" */
function changeText(item, before, after) {

    const list = arr => arr.join(" & ");
    const kept = after.keys.filter(k => before.keys.includes(k));
    const newNames = after.names.filter((_, i) => !before.keys.includes(after.keys[i]));

    if (kept.length > 0 && newNames.length > 0) {
        return list(newNames) + " empatou com " + list(before.names) + " em " + item.icon + " " + item.label;
    }

    const verb = item.negative ? " herdou " : " tomou ";

    return list(after.names) + verb + item.icon + " " + item.label + " de " + list(before.names);

}

let timelineCache = { partidas: null, riot: null, value: null };

/* { events: [{time, id, item, text}], reigns: {id: {since, item}} } */
function computeTimeline(src) {

    if (timelineCache.partidas === src.partidas && timelineCache.riot === src.riot) {
        return timelineCache.value;
    }

    const matches = orderedMatches(src);
    const events = [];
    const reigns = {};
    let prev = null;
    const partial = {};

    matches.forEach(([id, match]) => {

        partial[id] = match;

        const snap = holderSnapshot({ partidas: partial, riot: src.riot });
        const time = match.time || 0;

        Object.keys(snap).forEach(key => {

            const now = snap[key];
            const before = prev && prev[key];
            const same = before && before.keys.join("|") === now.keys.join("|");

            if (same) return;

            if (now.keys.length > 0) reigns[key] = { since: time, item: now };
            else delete reigns[key];

            /* Só conta como troca quando já tinha dono e alguém novo entrou */
            const someoneNew = before && now.keys.some(k => !before.keys.includes(k));

            if (before && before.keys.length > 0 && now.keys.length > 0 && someoneNew) {
                events.push({ time: time, id: key, item: now, before: before, text: changeText(now, before, now) });
            }

        });

        prev = snap;

    });

    /* Dados finais do reinado com os nomes atuais */
    if (prev) Object.keys(reigns).forEach(key => { reigns[key].item = prev[key]; });

    const value = { events: events.reverse(), reigns: reigns };
    timelineCache = { partidas: src.partidas, riot: src.riot, value: value };

    return value;

}

function daysSince(time) {
    const days = Math.floor((Date.now() - time) / 86400000);
    return days <= 0 ? "desde hoje" : days === 1 ? "há 1 dia" : "há " + days + " dias";
}

/* Seção da aba Conquistas: reinados atuais e últimas trocas */
function timelineSection(src) {

    const { events, reigns } = computeTimeline(src);

    const wrap = document.createElement("details");
    wrap.className = "timeline-box";

    const summary = document.createElement("summary");
    summary.className = "ach-section timeline-head";
    summary.textContent = "📜 Linha do tempo";
    wrap.appendChild(summary);

    const intro = document.createElement("p");
    intro.className = "hall-intro";
    intro.textContent = "Quem está segurando cada título há mais tempo e as últimas vezes que um título ou recorde trocou de dono.";
    wrap.appendChild(intro);

    const cols = document.createElement("div");
    cols.className = "timeline-cols";

    /* Reinados mais longos */
    const reignBox = document.createElement("div");
    reignBox.className = "timeline-col";

    const reignTitle = document.createElement("h4");
    reignTitle.className = "timeline-col-title";
    reignTitle.textContent = "👑 Reinados mais longos";
    reignBox.appendChild(reignTitle);

    const reignList = document.createElement("ol");
    reignList.className = "timeline-list";

    Object.values(reigns)
        .sort((a, b) => a.since - b.since)
        .slice(0, 10)
        .forEach(r => {
            const li = document.createElement("li");
            li.className = r.item.negative ? "negative" : "";

            const who = document.createElement("strong");
            who.textContent = r.item.names.join(" & ");

            const what = document.createElement("span");
            what.textContent = " é " + r.item.icon + " " + r.item.label;

            const when = document.createElement("small");
            when.textContent = daysSince(r.since);

            li.appendChild(who);
            li.appendChild(what);
            li.appendChild(when);
            reignList.appendChild(li);
        });

    reignBox.appendChild(reignList);

    /* Últimas trocas */
    const eventBox = document.createElement("div");
    eventBox.className = "timeline-col";

    const eventTitle = document.createElement("h4");
    eventTitle.className = "timeline-col-title";
    eventTitle.textContent = "🔁 Últimas trocas de dono";
    eventBox.appendChild(eventTitle);

    const eventList = document.createElement("ol");
    eventList.className = "timeline-list events";

    if (events.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nenhuma troca ainda.";
        eventList.appendChild(li);
    }

    events.slice(0, 20).forEach(e => {
        const li = document.createElement("li");
        li.className = e.item.negative ? "negative" : "";

        const date = document.createElement("small");
        date.className = "timeline-date";
        date.textContent = new Date(e.time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

        const text = document.createElement("span");
        text.textContent = e.text;

        li.appendChild(date);
        li.appendChild(text);
        eventList.appendChild(li);
    });

    eventBox.appendChild(eventList);

    cols.appendChild(reignBox);
    cols.appendChild(eventBox);
    wrap.appendChild(cols);

    return wrap;

}

/* =====================================================
   ANÚNCIO DE TROCA DE DONO

   Quem está com o site aberto vê um aviso quando, com os dados
   novos, um título ou recorde muda de mão.
===================================================== */

/* PRÉVIA: true mostra, ao carregar, a última troca registrada como
   exemplo do aviso. false = só avisa trocas que acontecerem ao vivo. */
const ANNOUNCE_PREVIEW = false;

let lastHolderSnap = null;
let announcePreviewShown = false;

function showAnnouncement(text, negative, note, heading) {

    let stack = document.getElementById("announceStack");

    if (!stack) {
        stack = document.createElement("div");
        stack.id = "announceStack";
        stack.className = "announce-stack";
        stack.setAttribute("aria-live", "polite");
        document.body.appendChild(stack);
    }

    const toast = document.createElement("div");
    toast.className = "announce" + (negative ? " negative" : "");

    const icon = document.createElement("span");
    icon.className = "announce-icon";
    icon.textContent = "🚨";

    const body = document.createElement("div");

    const head = document.createElement("strong");
    head.textContent = heading || "Troca de dono!";
    body.appendChild(head);

    const msg = document.createElement("div");
    msg.textContent = text;
    body.appendChild(msg);

    if (note) {
        const small = document.createElement("small");
        small.textContent = note;
        body.appendChild(small);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "announce-close";
    close.setAttribute("aria-label", "Fechar aviso");
    close.textContent = "✕";

    const remove = () => {
        toast.classList.add("leaving");
        setTimeout(() => toast.remove(), 300);
    };

    close.onclick = remove;
    setTimeout(remove, 10000);

    toast.appendChild(icon);
    toast.appendChild(body);
    toast.appendChild(close);
    stack.appendChild(toast);

}

/* Compara com o que estava antes e avisa cada troca */
function checkOwnerChanges(src) {

    if (!src || !src.partidas || Object.keys(src.partidas).length === 0) return;

    const snap = holderSnapshot(src);

    if (lastHolderSnap) {

        Object.keys(snap).forEach(key => {

            const now = snap[key];
            const before = lastHolderSnap[key];

            if (!before || before.keys.length === 0 || now.keys.length === 0) return;
            if (!now.keys.some(k => !before.keys.includes(k))) return;

            showAnnouncement(changeText(now, before, now), now.negative);

        });

    } else if (ANNOUNCE_PREVIEW && !announcePreviewShown) {

        announcePreviewShown = true;

        const last = computeTimeline(src).events[0];

        if (last) {
            showAnnouncement(last.text, last.item.negative,
                "Exemplo: última troca, em " + new Date(last.time).toLocaleDateString("pt-BR"));
        }

    }

    lastHolderSnap = snap;

    checkEloChanges(src);

}

/* Avisa quem subiu ou caiu de elo. O último elo visto fica salvo no
   navegador, então cada subida/queda aparece uma vez só (e não a cada
   vez que o site abre). Espera os dados pararem de chegar antes de
   comparar, para não avisar com dados pela metade. */
const ELO_SEEN_KEY = "sorteador.eloVisto";
let eloCheckTimer = null;

function readEloSeen() {
    try { return JSON.parse(localStorage.getItem(ELO_SEEN_KEY) || "null"); } catch (e) { return null; }
}

function saveEloSeen(map) {
    try { localStorage.setItem(ELO_SEEN_KEY, JSON.stringify(map)); } catch (e) { }
}

function checkEloChanges(src) {
    clearTimeout(eloCheckTimer);
    eloCheckTimer = setTimeout(() => compareElo(src), 3000);
}

function compareElo(src) {

    const seen = readEloSeen();
    const now = {};

    computeRanking(src).forEach(rank => {
        now[rank.player.key] = rank.elo.id;
    });

    /* Primeira visita neste navegador: só guarda, sem avisar */
    if (seen) {

        computeRanking(src).forEach(rank => {

            const beforeId = seen[rank.player.key];
            if (!beforeId || beforeId === rank.elo.id) return;

            const before = ELO_TIERS.find(t => t.id === beforeId);
            if (!before) return;

            const up = ELO_TIERS.indexOf(rank.elo) > ELO_TIERS.indexOf(before);

            showAnnouncement(
                rank.player.name + (up ? " subiu para " : " caiu para ") + rank.elo.icon + " " + rank.elo.name
                    + " (era " + before.icon + " " + before.name + ")",
                !up, null, up ? "📈 Subiu de elo!" : "📉 Caiu de elo!"
            );

        });

    }

    saveEloSeen(Object.assign({}, seen || {}, now));

}

/* =====================================================
   CARD DE FIM DE PARTIDA

   Quando a partida do sorteio é ligada à Riot, aparece abaixo do
   resultado um resumo: nota de cada um, MVP e pior da partida.
===================================================== */

/* PRÉVIA: true mostra sempre o resumo da última partida ligada à Riot,
   mesmo sem sorteio na tela. false = só da partida sorteada agora. */
const MATCH_SUMMARY_PREVIEW = false;

function renderMatchSummary(src) {

    const results = document.getElementById("results");

    if (!results || !src || !src.partidas) return;

    const { games, holders } = computeGameRecords(src);

    /* Partida sorteada agora, se já foi ligada; senão a última ligada (prévia) */
    let sorteioId = typeof currentMatchId !== "undefined" ? currentMatchId : null;
    let preview = false;

    if (!sorteioId || !games.some(g => g.sorteioId === sorteioId)) {

        sorteioId = null;

        if (MATCH_SUMMARY_PREVIEW && games.length > 0) {
            sorteioId = games.reduce((a, b) => b.time > a.time ? b : a).sorteioId;
            preview = true;
        }

    }

    let box = document.getElementById("matchSummary");

    if (!sorteioId) {
        if (box) box.remove();
        return;
    }

    if (!box) {
        box = document.createElement("div");
        box.id = "matchSummary";
        box.className = "match-summary";
        results.insertAdjacentElement("afterend", box);
    }

    box.innerHTML = "";

    const rows = games.filter(g => g.sorteioId === sorteioId).sort((a, b) => b.score - a.score);
    const match = src.partidas[sorteioId];
    const game = (src.riot || {})[match.riotMatchId] || {};

    const names = {};
    computePlayerProfiles(src).forEach(p => { names[p.key] = p.name; });

    const head = document.createElement("div");
    head.className = "match-summary-head";

    const title = document.createElement("strong");
    title.textContent = "🏁 Resumo da partida";

    const meta = document.createElement("span");
    meta.className = "match-summary-meta";
    const won = rows.length > 0 && rows[0].win;
    meta.textContent = (won ? "✅ Vitória" : "❌ Derrota")
        + " · " + Math.round((game.duration || 0) / 60) + " min"
        + " · " + new Date(rows[0] ? rows[0].time : match.time).toLocaleDateString("pt-BR");

    head.appendChild(title);
    head.appendChild(meta);
    box.appendChild(head);

    if (preview) {
        const note = document.createElement("div");
        note.className = "match-summary-note";
        note.textContent = "Exemplo com a última partida atualizada.";
        box.appendChild(note);
    }

    const list = document.createElement("div");
    list.className = "match-summary-list";

    rows.forEach((g, i) => {

        const isMvp = i === 0 && rows.length > 1;
        const isWorst = i === rows.length - 1 && rows.length > 1;

        const row = document.createElement("div");
        row.className = "match-row" + (isMvp ? " mvp" : "") + (isWorst ? " worst" : "");

        const img = document.createElement("img");
        img.src = IMAGE_URL + riotChampionId(g.champion) + ".png";
        img.alt = "";

        const who = document.createElement("div");
        who.className = "match-row-who";

        const name = document.createElement("strong");
        name.textContent = names[g.key] || g.key;

        const champ = document.createElement("small");
        champ.textContent = (championNames[riotChampionId(g.champion)] || g.champion)
            + " · " + g.kills + "/" + g.deaths + "/" + g.assists;

        who.appendChild(name);
        who.appendChild(champ);

        const tag = document.createElement("span");
        tag.className = "match-row-tag";
        tag.textContent = isMvp ? "🐐 MVP" : isWorst ? "🍼 Pior" : "";

        /* Recorde histórico batido nesta partida */
        if (holders.paulinho === g) tag.textContent = "🐐 MVP · recorde!";
        if (holders.feed === g) tag.textContent = "🍼 Pior · recorde!";

        const stats = document.createElement("small");
        stats.className = "match-row-stats";
        stats.textContent = formatNumber(g.damagePerMin, 0) + " dano/min · "
            + formatNumber(g.goldPerMin, 0) + " ouro/min · "
            + formatNumber(g.killParticipation * 100, 0) + "% part.";

        const score = document.createElement("div");
        score.className = "match-row-score";

        const bar = document.createElement("span");
        bar.className = "match-row-bar";
        const fill = document.createElement("i");
        fill.style.width = (g.score * 10) + "%";
        bar.appendChild(fill);

        const value = document.createElement("strong");
        value.textContent = formatNumber(g.score, 1);

        score.appendChild(bar);
        score.appendChild(value);

        row.appendChild(img);
        row.appendChild(who);
        row.appendChild(tag);
        row.appendChild(stats);
        row.appendChild(score);
        list.appendChild(row);

    });

    box.appendChild(list);

}
