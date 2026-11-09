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

/* ---------- MEDALHAS (cada jogador desbloqueia a sua) ---------- */

/* "nick" é o efeito no nome de quem tem só essa medalha.
   Com 2 medalhas o nick ganha o efeito de dupla; com todas, o de trio. */
/* "current" é o progresso do jogador e "goal" a meta para desbloquear */
const ACHIEVEMENT_BADGES = [
    {
        icon: "👑", name: "Lenda dos guri", desc: "Jogar 100 partidas",
        nick: "nick-lenda", effect: "nick dourado e brilhando no site",
        current: p => p.games, goal: 100, unit: "partidas"
    },
    {
        icon: "🏆", name: "Bafeador supremo", desc: "Ganhar 100 partidas",
        nick: "nick-bafeador", effect: "nick verde e pulsando no site",
        current: p => p.wins, goal: 100, unit: "vitórias"
    },
    {
        icon: "🫏", name: "Mais burro já registrado", desc: "Perder 100 partidas",
        nick: "nick-burro", effect: "nick de palhaço, trocando de cor e balançando no site",
        current: p => p.losses, goal: 100, unit: "derrotas"
    }
];

ACHIEVEMENT_BADGES.forEach(badge => {
    badge.test = p => badge.current(p) >= badge.goal;
});

/* PRÉVIA: true ignora as metas e dá a cada jogador uma combinação fixa
   de medalhas (índices de ACHIEVEMENT_BADGES), só para ver os efeitos.
   Trocar para false volta a valer a meta de cada medalha. */
const BADGE_PREVIEW = false;

const BADGE_PREVIEW_COMBOS = {
    ber: [0, 1, 2],   /* trio */
    valde: [0, 1, 2], /* trio */
    fer: [0, 1],      /* dupla */
    nardi: [1, 2],    /* dupla */
    pitty: [0],       /* só Lenda */
    rony: [2]         /* só Burro */
};

/* Efeitos de quem junta medalhas */
const BADGE_COMBO_EFFECTS = {
    2: { nick: "nick-duo", icon: "🔥", effect: "nick em chamas no site" },
    3: { nick: "nick-trio", icon: "✨", effect: "nick de ouro maciço, com reflexo, halo e estrelas douradas no site" }
};

/* Medalhas de um jogador */
function earnedBadges(profile) {

    if (BADGE_PREVIEW) {
        const combo = BADGE_PREVIEW_COMBOS[profile.key] || [1];
        return combo.map(i => ACHIEVEMENT_BADGES[i]);
    }

    return ACHIEVEMENT_BADGES.filter(b => b.test(profile));

}

/* playerKey -> medalhas do jogador (para o efeito no nick) */
function nickClassMap(src) {

    const map = {};

    computePlayerProfiles(src).forEach(p => {
        const badges = earnedBadges(p);
        if (badges.length > 0) map[p.key] = badges;
    });

    return map;

}

/* Classe do efeito e texto do tooltip para um conjunto de medalhas */
function nickStyle(badges) {

    if (!badges || badges.length === 0) return null;

    const names = badges.map(b => b.icon + " " + b.name);

    if (badges.length === 1) {
        return { nick: badges[0].nick, tip: names[0] + " (" + badges[0].desc.toLowerCase() + ")" };
    }

    const combo = BADGE_COMBO_EFFECTS[Math.min(badges.length, 3)];
    const label = badges.length >= ACHIEVEMENT_BADGES.length
        ? "Todas as medalhas"
        : badges.length + " medalhas";

    return {
        nick: combo.nick,
        sparkle: badges.length >= 3,
        tip: combo.icon + " " + label + ": " + names.join(", ")
    };

}

/* Nome do jogador com o efeito das medalhas, se tiver.
   O tooltip explica de onde vem o efeito. */
function decoratedNick(name, badges) {

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

/* Explica cada medalha: meta e exemplo do efeito no nick */
function badgeGuide() {

    const guide = document.createElement("div");
    guide.className = "badge-guide";

    const intro = document.createElement("p");
    intro.className = "badge-guide-intro";
    intro.textContent = "Metas pessoais: cada um desbloqueia a sua, e a recompensa é um efeito no seu nick em todo o site. Quem junta medalhas ganha um efeito ainda melhor.";
    guide.appendChild(intro);

    const grid = document.createElement("div");
    grid.className = "badge-guide-grid";

    const item = (icon, name, goal, sample, effect) => {

        const card = document.createElement("div");
        card.className = "badge-guide-item";

        const top = document.createElement("div");
        top.className = "badge-guide-name";
        top.textContent = icon + " " + name;

        const g = document.createElement("div");
        g.className = "badge-guide-goal";
        g.textContent = goal;

        const s = document.createElement("div");
        s.className = "badge-guide-sample";
        s.appendChild(sample);

        const e = document.createElement("div");
        e.className = "badge-guide-effect";
        e.textContent = effect;

        card.appendChild(top);
        card.appendChild(g);
        card.appendChild(s);
        card.appendChild(e);

        return card;

    };

    ACHIEVEMENT_BADGES.forEach(badge => {
        grid.appendChild(item(
            badge.icon, badge.name, "Meta: " + badge.desc.toLowerCase(),
            decoratedNick("Seu nick", [badge]), badge.effect
        ));
    });

    grid.appendChild(item(
        BADGE_COMBO_EFFECTS[2].icon, "Combo de 2", "Ter 2 medalhas quaisquer",
        decoratedNick("Seu nick", ACHIEVEMENT_BADGES.slice(0, 2)), BADGE_COMBO_EFFECTS[2].effect
    ));

    grid.appendChild(item(
        BADGE_COMBO_EFFECTS[3].icon, "Combo supremo", "Ter as 3 medalhas",
        decoratedNick("Seu nick", ACHIEVEMENT_BADGES), BADGE_COMBO_EFFECTS[3].effect
    ));

    guide.appendChild(grid);

    return guide;

}

/* Anel compacto de progresso, com o ícone da medalha no meio */
function badgeRing(badge, profile, has) {

    const value = badge.current(profile);
    const pctDone = Math.min(100, Math.round(value / badge.goal * 100));

    const ring = document.createElement("span");
    ring.className = "badge-ring ring-" + badge.nick.replace("nick-", "") + (has ? " done" : "");
    ring.style.setProperty("--p", pctDone);
    ring.title = badge.icon + " " + badge.name + ": "
        + (has ? "desbloqueada ✔" : Math.min(value, badge.goal) + "/" + badge.goal + " " + badge.unit);

    const icon = document.createElement("span");
    icon.textContent = badge.icon;
    ring.appendChild(icon);

    return ring;

}

/* Barra de progresso de uma medalha para um jogador */
function badgeProgress(badge, profile, has) {

    const value = badge.current(profile);
    const pctDone = Math.min(100, Math.round(value / badge.goal * 100));

    const line = document.createElement("div");
    line.className = "badge-progress" + (has ? " done" : "");
    line.title = badge.name + ": " + badge.desc.toLowerCase()
        + (has ? " ✔ desbloqueada" : " (faltam " + (badge.goal - value) + ")")
        + "\nRecompensa: " + badge.effect;

    const label = document.createElement("span");
    label.className = "badge-progress-label";
    label.textContent = badge.icon + " " + badge.name;

    const bar = document.createElement("span");
    bar.className = "badge-progress-bar";

    const fill = document.createElement("span");
    fill.className = "badge-progress-fill fill-" + badge.nick.replace("nick-", "");
    fill.style.width = pctDone + "%";
    bar.appendChild(fill);

    const count = document.createElement("span");
    count.className = "badge-progress-count";
    count.textContent = has
        ? "✔ desbloqueada"
        : Math.min(value, badge.goal) + "/" + badge.goal + " " + badge.unit;

    line.appendChild(label);
    line.appendChild(bar);
    line.appendChild(count);

    return line;

}

/* ---------- HALL DOS TÍTULOS (parte de cima da aba) ---------- */

/* Aba aberta no hall: false = Glória, true = Vergonha.
   Fica guardada para não voltar à Glória a cada atualização. */
let hallShowNegative = false;

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

/* Placar: quantos títulos da aba aberta cada jogador tem */
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
    label.textContent = negative ? "Quem mais passa vergonha" : "Quem manda na casa";
    board.appendChild(label);

    if (rows.length === 0) {
        const none = document.createElement("div");
        none.className = "hall-board-empty";
        none.textContent = "Ninguém tem título aqui ainda.";
        board.appendChild(none);
        return board;
    }

    const list = document.createElement("div");
    list.className = "hall-board-list";

    let place = 0;
    let lastCount = null;

    rows.forEach((row, i) => {

        if (row.titles.length !== lastCount) place = i + 1;
        lastCount = row.titles.length;

        const item = document.createElement("div");
        item.className = "hall-board-item" + (place === 1 ? " top" : "");
        item.title = row.titles.map(t => t.icon + " " + t.name).join("\n");

        const pos = document.createElement("span");
        pos.className = "hall-board-pos";
        pos.textContent = place === 1 ? (negative ? "🤡" : "👑") : place + "º";

        const nick = document.createElement("span");
        nick.className = "hall-board-nick";
        nick.appendChild(decoratedNick(row.player.name, nicks[row.player.key]));

        const count = document.createElement("span");
        count.className = "hall-board-count";
        count.textContent = row.titles.length;

        const icons = document.createElement("span");
        icons.className = "hall-board-icons";
        icons.textContent = row.titles.map(t => t.icon).join(" ");

        item.appendChild(pos);
        item.appendChild(nick);
        item.appendChild(count);
        item.appendChild(icons);
        list.appendChild(item);

    });

    board.appendChild(list);

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

        const catHead = document.createElement("h4");
        catHead.className = "hall-cat" + (hallShowNegative ? " negative" : "");
        catHead.textContent = cat.head;
        hall.appendChild(catHead);

        const grid = document.createElement("div");
        grid.className = "hall-grid";

        /* Vagos vão para o fim da categoria */
        inCat
            .slice()
            .sort((a, b) => (a.holders.length === 0) - (b.holders.length === 0))
            .forEach(result => grid.appendChild(titleCard(result, nicks)));

        hall.appendChild(grid);

    });

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

    renderHall(hall, titles, nicks);

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

            const earned = earnedBadges(p);

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

            ACHIEVEMENT_BADGES.forEach(badge => {
                rings.appendChild(badgeRing(badge, p, earned.includes(badge)));
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

            ACHIEVEMENT_BADGES.forEach(badge => {
                progress.appendChild(badgeProgress(badge, p, earned.includes(badge)));
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
