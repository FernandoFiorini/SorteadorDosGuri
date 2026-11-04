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
                name: "?", spellings: {},
                games: 0, wins: 0, losses: 0,
                lanes: {}, champs: {},
                streak: 0, bestWinStreak: 0, worstLossStreak: 0
            });

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
        icon: "⚡", name: "Mamu gastou flash",
        desc: "Maior número de derrotas",
        value: p => p.losses,
        show: v => v + " derrotas"
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
    }
];

/* ---------- MEDALHAS (cada jogador desbloqueia a sua) ---------- */

const ACHIEVEMENT_BADGES = [
    { icon: "👑", name: "Lenda dos guri", desc: "Jogou mais de 100 partidas", test: p => p.games > 100 },
    { icon: "🏆", name: "Bafeador supremo", desc: "Ganhou mais de 100 partidas", test: p => p.wins > 100 },
    { icon: "🫏", name: "Mais burro já registrado", desc: "Perdeu mais de 100 partidas", test: p => p.losses > 100 }
];

/* Dono(s) de cada título: maior valor, empates dividem.
   Valor 0 ou nulo não dá título para ninguém. */
function resolveTitles(profiles) {

    return ACHIEVEMENT_TITLES.map(title => {

        let best = null;
        let holders = [];

        profiles.forEach(p => {

            if (title.eligible && !title.eligible(p)) return;

            const v = title.value(p);

            if (v === null || v === undefined || v <= 0) return;

            if (best === null || v > best + 1e-9) {
                best = v;
                holders = [p];
            } else if (Math.abs(v - best) <= 1e-9) {
                holders.push(p);
            }

        });

        return { title: title, holders: holders, best: best };

    });

}

function achievementCard(icon, name, desc, holderText, valueText, locked) {

    const card = document.createElement("div");
    card.className = "ach-card" + (locked ? " locked" : "");

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
    h.textContent = holderText;

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

    if (profiles.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Nenhuma partida válida ainda. Sorteie para começar a distribuir títulos.";
        box.appendChild(empty);
        return;
    }

    /* ----- Títulos ----- */

    const titlesHead = document.createElement("h3");
    titlesHead.className = "ach-section";
    titlesHead.textContent = "👑 Títulos da casa";
    box.appendChild(titlesHead);

    const titlesGrid = document.createElement("div");
    titlesGrid.className = "ach-grid";

    const titles = resolveTitles(profiles);

    titles.forEach(({ title, holders, best }) => {

        const vacant = holders.length === 0;

        titlesGrid.appendChild(achievementCard(
            title.icon,
            title.name,
            title.desc,
            vacant ? "Vago" : holders.map(h => h.name).join(" & "),
            vacant ? "" : title.show(best, holders),
            vacant
        ));

    });

    box.appendChild(titlesGrid);

    /* ----- Medalhas por jogador ----- */

    const badgesHead = document.createElement("h3");
    badgesHead.className = "ach-section";
    badgesHead.textContent = "🎖️ Medalhas por jogador";
    box.appendChild(badgesHead);

    profiles
        .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name, "pt-BR"))
        .forEach(p => {

            const row = document.createElement("div");
            row.className = "ach-player";

            const earned = ACHIEVEMENT_BADGES.filter(b => b.test(p));

            /* Títulos que este jogador detém agora */
            const ownTitles = titles.filter(t => t.holders.includes(p));

            const head = document.createElement("div");
            head.className = "ach-player-head";

            const name = document.createElement("strong");
            name.textContent = p.name;

            const count = document.createElement("span");
            count.textContent =
                (ownTitles.length > 0
                    ? ownTitles.length + (ownTitles.length === 1 ? " título · " : " títulos · ")
                    : "")
                + earned.length + "/" + ACHIEVEMENT_BADGES.length + " medalhas";

            head.appendChild(name);
            head.appendChild(count);

            const chips = document.createElement("div");
            chips.className = "ach-chips";

            ownTitles.forEach(({ title, holders, best }) => {

                const chip = document.createElement("span");

                chip.className = "ach-chip title";
                chip.textContent = title.icon + " " + title.name;
                chip.title = "Título: " + title.desc + " — " + title.show(best, holders)
                    + (holders.length > 1 ? " (dividido)" : "");

                chips.appendChild(chip);

            });

            /* Conquistadas primeiro, bloqueadas no fim */
            [...ACHIEVEMENT_BADGES]
                .sort((a, b) => earned.includes(b) - earned.includes(a))
                .forEach(badge => {

                    const chip = document.createElement("span");
                    const has = earned.includes(badge);

                    chip.className = "ach-chip" + (has ? "" : " locked");
                    chip.textContent = badge.icon + " " + badge.name;
                    chip.title = badge.desc + (has ? " ✔" : " (bloqueada)");

                    chips.appendChild(chip);

                });

            row.appendChild(head);
            row.appendChild(chips);

            box.appendChild(row);

        });

}
