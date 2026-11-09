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

const ACHIEVEMENT_TITLES = [
    {
        icon: "😎", name: "Tu me conhece né valde",
        desc: "Maior número de vitórias",
        value: p => p.wins,
        show: v => v + " vitórias"
    },
    {
        icon: "🌲", name: "Que isso paixão, pode relaxar",
        desc: "Mais vezes que caiu na Jungle",
        value: p => p.lane("Jungle"),
        show: v => v + "x"
    },
    {
        icon: "🎠", name: "Pitty carrosilha",
        desc: "Mais vezes que caiu de Support",
        value: p => p.lane("Support"),
        show: v => v + "x"
    },
    {
        icon: "🖐️", name: "Eu sou o milior",
        desc: "Mais pentakills",
        value: p => p.riot.pentaKills,
        show: v => v + (v === 1 ? " penta" : " pentas")
    },
    {
        icon: "❓", name: "Pinga ne mim?",
        desc: "Mais pings de inimigo sumido",
        value: p => p.riot.missingPings,
        show: v => v + " pings"
    },
    {
        icon: "🎯", name: "Mata mais que a fome",
        desc: "Maior KDA",
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).kda,
        show: v => formatNumber(v, 2)
    },
    {
        icon: "💰", name: "Filho do vorcaro",
        desc: "Mais ouro acumulado somando todas as partidas",
        value: p => p.riot.gold,
        show: v => v.toLocaleString("pt-BR") + " de ouro"
    },
    {
        icon: "🏰", name: "Split push é estilo de vida",
        desc: "Mais torres destruídas (abates e assistências)",
        value: p => p.riot.turrets,
        show: v => v + (v === 1 ? " torre" : " torres")
    },
    {
        icon: "🦹", name: "Filho do lula",
        desc: "Mais objetivos roubados (dragão, Barão, Arauto e afins)",
        value: p => p.riot.objectivesStolen,
        show: v => v + (v === 1 ? " roubo" : " roubos")
    },
    {
        icon: "🩸", name: "Sou muito bom com esse boneco",
        desc: "Mais first bloods",
        value: p => p.riot.firstBloods,
        show: v => v + " first blood" + (v === 1 ? "" : "s")
    },
    {
        icon: "🗡️", name: "Aqui é valdemá",
        desc: "Mais abates solo",
        value: p => p.riot.soloKills,
        show: v => v + " solo kill" + (v === 1 ? "" : "s")
    },
    {
        icon: "🥊", name: "Gordão supremo",
        desc: "Mais dano recebido somando todas as partidas",
        value: p => p.riot.damageTaken,
        show: v => v.toLocaleString("pt-BR") + " de dano"
    },
    {
        icon: "💚", name: "Aqui cura nao adianta",
        desc: "Mais cura e escudo em aliados",
        value: p => p.riot.allySupport,
        show: v => v.toLocaleString("pt-BR")
    },

    /* ----- Negativos (aparecem em vermelho, numa seção separada) ----- */
    {
        icon: "⚡", name: "Mamu gastou flash",
        desc: "Maior número de derrotas",
        negative: true,
        value: p => p.losses,
        show: v => v + " derrotas"
    },
    {
        icon: "⚰️", name: "Assinante da tela cinza",
        desc: "Mais tempo morto somando todas as partidas",
        negative: true,
        value: p => p.riot.timeDead,
        show: v => Math.round(v / 60) + " min"
    },
    {
        negative: true,
        icon: "💀", name: "Só não morre mais porque tem que esperar renascer",
        desc: "Mais mortes somando todas as partidas",
        value: p => p.riot.deaths,
        show: v => v + " mortes"
    },
    {
        icon: "🙈", name: "Mais cego que não sei o que",
        desc: "Menor placar de visão por partida",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).visionPerGame,
        show: v => formatNumber(v, 1) + " por partida"
    },
    {
        icon: "🪙", name: "Tem que solicitar bolsa família",
        desc: "Menor ouro por minuto",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).goldPerMin,
        show: v => formatNumber(v, 0) + " por minuto"
    },
    {
        icon: "🧸", name: "Mais ruim que isso, so 2 disso",
        desc: "Menor KDA",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).kda,
        show: v => formatNumber(v, 2)
    },
    {
        icon: "🪶", name: "Dano é psicologico",
        desc: "Menor dano a campeões por minuto",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).damagePerMin,
        show: v => formatNumber(v, 0) + " por minuto"
    },
    {
        icon: "🌾", name: "Não ta jogando age né?",
        desc: "Menor farm por minuto",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => riotAverages(p.riot).csPerMin,
        show: v => formatNumber(v, 1) + " por minuto"
    },
    {
        icon: "👻", name: "O jogador, vamo começar a jogar ou não?",
        desc: "Menor média de participação nos abates do time",
        lowest: true, negative: true,
        eligible: p => p.riot.games >= 5,
        value: p => p.riot.games > 0 ? p.riot.killParticipation / p.riot.games : null,
        show: v => formatNumber(v * 100, 0) + "%"
    },
    {
        icon: "📉", name: "Joguinhos de lambari",
        desc: "Mais derrotas seguidas",
        negative: true,
        value: p => p.worstLossStreak,
        show: v => v + " seguidas"
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

        let best = null;
        let holders = [];

        /* Nos de menor valor, compara com o sinal trocado */
        const sign = title.lowest ? -1 : 1;

        profiles.forEach(p => {

            if (title.eligible && !title.eligible(p)) return;

            const v = title.value(p);

            if (v === null || v === undefined || (!title.lowest && v <= 0)) return;

            if (best === null || sign * v > sign * best + 1e-9) {
                best = v;
                holders = [p];
            } else if (Math.abs(v - best) <= 1e-9) {
                holders.push(p);
            }

        });

        return { title: title, holders: holders, best: best };

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

function achievementCard(icon, name, desc, holderText, valueText, locked, negative) {

    const card = document.createElement("div");
    card.className = "ach-card" + (negative ? " negative" : "") + (locked ? " locked" : "");

    const i = document.createElement("div");
    i.className = "ach-icon";
    i.textContent = icon;

    const info = document.createElement("div");
    info.className = "ach-info";

    const n = document.createElement("div");
    n.className = "ach-name";
    n.textContent = name;

    const h = document.createElement("div");
    h.className = "ach-holder";

    /* Texto simples ou lista de nicks (já com o efeito da medalha) */
    if (Array.isArray(holderText)) {
        holderText.forEach((nick, i) => {
            if (i > 0) h.appendChild(document.createTextNode(" & "));
            h.appendChild(nick);
        });
    } else {
        h.textContent = holderText;
    }

    const d = document.createElement("div");
    d.className = "ach-desc";
    d.textContent = desc + (valueText ? " — " + valueText : "");

    info.appendChild(n);
    info.appendChild(h);
    info.appendChild(d);

    card.appendChild(i);
    card.appendChild(info);

    return card;

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

    [
        { head: "👑 Títulos da casa", negative: false },
        { head: "💀 Títulos da vergonha", negative: true }
    ].forEach(section => {

        const titlesHead = document.createElement("h3");
        titlesHead.className = "ach-section" + (section.negative ? " negative" : "");
        titlesHead.textContent = section.head;
        box.appendChild(titlesHead);

        const titlesGrid = document.createElement("div");
        titlesGrid.className = "ach-grid";

        titles
            .filter(({ title }) => !!title.negative === section.negative)
            .forEach(({ title, holders, best }) => {

                const vacant = holders.length === 0;

                titlesGrid.appendChild(achievementCard(
                    title.icon,
                    title.name,
                    title.desc,
                    vacant ? "Vago" : holders.map(h => decoratedNick(h.name, nicks[h.key])),
                    vacant ? "" : title.show(best, holders),
                    vacant,
                    !!title.negative
                ));

            });

        box.appendChild(titlesGrid);

    });

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
