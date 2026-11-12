/* =====================================================
   MARCOS DO SITE (aba "🏛️ Marcos" na janela do Patch Notes)

   A história de uso do sorteador: primeiro sorteio, números gerais e
   marcos alcançados (10, 50, 100... sorteios). Não dá XP nem conta para
   conquistas: é só curiosidade. Usa os mesmos dados das estatísticas
   (globalData, do Firebase).

   Para criar um marco novo: um item em SITE_MILESTONES.
===================================================== */

/* Cada marco: contador ao longo do tempo + os degraus a alcançar */
const SITE_MILESTONES = [
    { id: "sorteios", icon: "🎲", nome: n => n + " sorteios", degraus: [10, 50, 100, 250, 500, 1000] },
    { id: "vitorias", icon: "🏆", nome: n => n + " vitórias", degraus: [10, 50, 100, 250, 500] },
    { id: "campeoes", icon: "🦸", nome: n => n >= 999 ? "Todos os campeões sorteados" : n + " campeões diferentes sorteados", degraus: [25, 50, 75, 100, 125, 150, 999] },
    { id: "horas", icon: "⏱️", nome: n => n + " horas de partida", degraus: [10, 25, 50, 100, 250] }
];

/* Ofensiva diária: dias seguidos com pelo menos um sorteio.
   O nome muda a cada 10 dias. */
const STREAK_TIERS = [
    { min: 0, icon: "💤", nome: "Sem ofensiva" },
    { min: 1, icon: "🔥", nome: "Começando" },
    { min: 10, icon: "🔥", nome: "Em chamas" },
    { min: 20, icon: "☄️", nome: "Imparável" },
    { min: 30, icon: "🌋", nome: "Lendária" },
    { min: 40, icon: "⚡", nome: "Sobrenatural" },
    { min: 50, icon: "👑", nome: "Divina" },
    { min: 60, icon: "🌌", nome: "Eterna" }
];

const streakTier = n => STREAK_TIERS.filter(t => n >= t.min).pop();

/* Dia no horário de Brasília (AAAA-MM-DD) */
const brDay = time => new Date(time - 3 * 3600000).toISOString().slice(0, 10);
const addDays = (day, n) => new Date(Date.parse(day + "T12:00:00Z") + n * 86400000).toISOString().slice(0, 10);

function computeStreak(dayList) {

    const days = new Set(dayList);
    const sorted = [...days].sort();
    const today = brDay(Date.now());

    /* Atual: conta para trás a partir de hoje (ou de ontem, se hoje ainda
       não teve sorteio: a ofensiva só quebra quando o dia acaba) */
    let start = days.has(today) ? today : addDays(today, -1);
    let current = 0;
    while (days.has(addDays(start, -current))) current++;

    /* Recorde e quando cada degrau de 10 foi alcançado */
    let best = 0, run = 0, prev = null;
    const reached = {};
    sorted.forEach(day => {
        run = prev && addDays(prev, 1) === day ? run + 1 : 1;
        prev = day;
        best = Math.max(best, run);
        for (let n = 10; n <= run; n += 10) if (!reached[n]) reached[n] = day;
    });

    return { current, best, playedToday: days.has(today), reached };

}

const fmtDate = time => new Date(time).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function computeSiteStats(src) {

    const partidas = Object.values(src.partidas || {})
        .filter(m => m && m.time)
        .sort((a, b) => a.time - b.time);

    if (!partidas.length) return null;

    const riot = src.riot || {};
    const totalChamps = (typeof champions !== "undefined" && champions.length) || 0;

    /* Linha do tempo de cada contador: quando ele chegou em cada valor */
    const timeline = { sorteios: [], vitorias: [], campeoes: [], horas: [] };
    const seenChamps = new Set();
    const players = new Set();
    const champCount = {};
    const days = {};
    let wins = 0, losses = 0, seconds = 0;
    let firstWin = null, firstStats = null;

    partidas.forEach((m, i) => {

        timeline.sorteios.push(m.time);

        const day = brDay(m.time);
        days[day] = (days[day] || 0) + 1;

        Object.values(m.entries || {}).forEach(e => {
            if (!e) return;
            players.add(playerKey(e.player));
            champCount[e.champion] = (champCount[e.champion] || 0) + 1;
            if (!seenChamps.has(e.champion)) {
                seenChamps.add(e.champion);
                timeline.campeoes.push(m.time);
            }
        });

        if (m.resultado === "vitoria") {
            wins++;
            timeline.vitorias.push(m.time);
            if (!firstWin) firstWin = m;
        }
        if (m.resultado === "derrota") losses++;

        const game = m.riotMatchId && riot[m.riotMatchId];
        if (game && m.resultado !== "anulada") {
            if (!firstStats) firstStats = m;
            const before = Math.floor(seconds / 3600);
            seconds += game.duration || 0;
            for (let h = before + 1; h <= Math.floor(seconds / 3600); h++) timeline.horas.push(m.time);
        }

    });

    /* "Todos os campeões" = degrau 999 vira o total real */
    const reached = (id, n) => {
        const target = id === "campeoes" && n === 999 ? totalChamps : n;
        return target && timeline[id].length >= target ? timeline[id][target - 1] : null;
    };

    const current = { sorteios: timeline.sorteios.length, vitorias: wins, campeoes: seenChamps.size, horas: Math.floor(seconds / 3600) };

    /* Marcos alcançados (com data) e o próximo de cada tipo (com progresso) */
    const done = [];
    const next = [];

    SITE_MILESTONES.forEach(ms => {
        let pending = null;
        ms.degraus.forEach(n => {
            const when = reached(ms.id, n);
            if (when) done.push({ icon: ms.icon, nome: ms.nome(n), time: when });
            else if (!pending) {
                const target = ms.id === "campeoes" && n === 999 ? totalChamps : n;
                if (target) pending = { icon: ms.icon, nome: ms.nome(n), atual: current[ms.id], alvo: target };
            }
        });
        if (pending) next.push(pending);
    });

    const first = partidas[0];
    done.push({
        icon: "🌱", nome: "Primeiro sorteio registrado", time: first.time,
        detalhe: Object.values(first.entries || {}).filter(Boolean).map(e => e.player + " de " + ((typeof championNames !== "undefined" && championNames[e.champion]) || e.champion)).join(", ")
    });
    if (firstWin) done.push({ icon: "🥇", nome: "Primeira vitória", time: firstWin.time });
    if (firstStats) done.push({ icon: "📊", nome: "Primeira partida com os números do jogo (KDA, dano...)", time: firstStats.time });

    done.sort((a, b) => b.time - a.time);

    const streak = computeStreak(Object.keys(days));

    Object.entries(streak.reached).forEach(([n, day]) => {
        done.push({ icon: streakTier(Number(n)).icon, nome: "Ofensiva de " + n + " dias (" + streakTier(Number(n)).nome + ")", time: Date.parse(day + "T15:00:00Z") });
    });
    done.sort((a, b) => b.time - a.time);

    /* Campeões que ainda não saíram em nenhum sorteio */
    const missing = (typeof champions !== "undefined" ? champions : []).filter(id => !seenChamps.has(id));

    const topDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0];
    const topChamp = Object.entries(champCount).sort((a, b) => b[1] - a[1])[0];

    return {
        streak,
        missing,
        tiles: [
            ["🎲", "Sorteios", String(current.sorteios), "desde " + fmtDate(first.time)],
            ["⚔️", "Partidas jogadas", String(wins + losses), wins + "V · " + losses + "D"],
            ["🦸", "Campeões já sorteados", String(seenChamps.size), totalChamps ? "de " + totalChamps : ""],
            ["⏱️", "Horas de partida", (seconds / 3600).toFixed(1).replace(".", ","), "nas partidas com números"],
            ["📅", "Dias de jogatina", String(Object.keys(days).length), ""],
            ["🔥", "Dia recorde", topDay ? topDay[0].split("-").reverse().slice(0, 2).join("/") : "—", topDay ? topDay[1] + " sorteios" : ""],
            ["👥", "Jogadores", String(players.size), ""],
            ["⭐", "Mais sorteado", topChamp ? ((typeof championNames !== "undefined" && championNames[topChamp[0]]) || topChamp[0]) : "—", topChamp ? topChamp[1] + " vezes" : ""]
        ],
        done,
        next
    };

}

function renderSiteStats() {

    const panel = document.getElementById("siteStatsPanel");
    panel.innerHTML = "";

    const data = typeof globalData !== "undefined" ? computeSiteStats(globalData) : null;

    if (!data) {
        const p = document.createElement("p");
        p.className = "site-stats-empty";
        p.textContent = "Os marcos aparecem quando o site está conectado (no site publicado, depois que as estatísticas carregam).";
        panel.appendChild(p);
        return;
    }

    /* 🔥 Ofensiva diária */
    const st = data.streak;
    const tier = streakTier(st.current);
    const nextTier = STREAK_TIERS.find(t => t.min > st.current);
    const streakBox = document.createElement("div");
    streakBox.className = "site-streak" + (st.current ? "" : " off");
    streakBox.innerHTML = "<span class=\"site-streak-icon\"></span><div><strong></strong><span></span><small></small></div>";
    streakBox.children[0].textContent = tier.icon;
    streakBox.querySelector("strong").textContent = "Ofensiva: " + st.current + (st.current === 1 ? " dia" : " dias") + " · " + tier.nome;
    streakBox.querySelector("span:not(.site-streak-icon)").textContent = st.current && !st.playedToday
        ? "Ainda não teve sorteio hoje: sorteie para não perder a ofensiva!"
        : st.current ? "Sorteie pelo menos uma vez por dia para manter." : "Sorteie hoje para começar uma nova ofensiva.";
    streakBox.querySelector("small").textContent = "Recorde: " + st.best + (st.best === 1 ? " dia" : " dias")
        + (nextTier ? " · próximo nome em " + nextTier.min + " dias: " + nextTier.icon + " " + nextTier.nome : "");
    panel.appendChild(streakBox);

    const tiles = document.createElement("div");
    tiles.className = "site-stats-tiles";
    data.tiles.forEach(([icon, label, value, sub]) => {
        const t = document.createElement("div");
        t.className = "site-stats-tile";
        t.innerHTML = "<span class=\"site-stats-icon\"></span><strong></strong><span class=\"site-stats-label\"></span><small></small>";
        t.children[0].textContent = icon;
        t.children[1].textContent = value;
        t.children[2].textContent = label;
        t.children[3].textContent = sub;
        tiles.appendChild(t);
    });
    panel.appendChild(tiles);

    if (data.next.length) {
        const h = document.createElement("h4");
        h.className = "site-stats-h";
        h.textContent = "🎯 Próximos marcos";
        panel.appendChild(h);
        data.next.forEach(n => {
            const row = document.createElement("div");
            row.className = "site-stats-next";
            const pct = Math.min(100, Math.round(n.atual / n.alvo * 100));
            row.innerHTML = "<span></span><div class=\"site-stats-bar\"><i></i></div><small></small>";
            row.children[0].textContent = n.icon + " " + n.nome;
            row.querySelector("i").style.width = pct + "%";
            row.children[2].textContent = n.atual + " de " + n.alvo;
            panel.appendChild(row);
        });
    }

    const h2 = document.createElement("h4");
    h2.className = "site-stats-h";
    h2.textContent = "🏛️ Marcos alcançados";
    panel.appendChild(h2);

    const list = document.createElement("ul");
    list.className = "site-stats-done";
    data.done.forEach(d => {
        const li = document.createElement("li");
        li.innerHTML = "<span class=\"site-stats-date\"></span><span class=\"site-stats-icon\"></span><div><strong></strong><small></small></div>";
        li.children[0].textContent = fmtDate(d.time);
        li.children[1].textContent = d.icon;
        li.querySelector("strong").textContent = d.nome;
        li.querySelector("small").textContent = d.detalhe || "";
        list.appendChild(li);
    });
    panel.appendChild(list);

    /* Campeões que faltam para "todos sorteados" */
    if (data.missing.length) {
        const h3 = document.createElement("h4");
        h3.className = "site-stats-h";
        h3.textContent = "🦸 Ainda não saíram no sorteio (" + data.missing.length + ")";
        panel.appendChild(h3);
        const grid = document.createElement("div");
        grid.className = "site-stats-missing";
        data.missing
            .map(id => [id, (typeof championNames !== "undefined" && championNames[id]) || id])
            .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
            .forEach(([id, name]) => {
                const img = document.createElement("img");
                img.src = IMAGE_URL + id + ".png";
                img.alt = name;
                img.title = name;
                img.loading = "lazy";
                grid.appendChild(img);
            });
        panel.appendChild(grid);
    }

}

/* ---------- Abas da janela: Atualizações | Marcos ---------- */

function setChangelogTab(tab) {
    document.querySelectorAll("#changelogTabs [data-tab]").forEach(b => {
        const on = b.dataset.tab === tab;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.getElementById("changelogList").hidden = tab !== "log";
    document.getElementById("siteStatsPanel").hidden = tab !== "marcos";
    if (tab === "marcos") renderSiteStats();
}

document.addEventListener("DOMContentLoaded", () => {

    const tabs = document.getElementById("changelogTabs");
    if (!tabs) return;

    tabs.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => setChangelogTab(b.dataset.tab)));

    /* Abrir pelo link do topo sempre começa nas atualizações */
    document.getElementById("changelogOpen").addEventListener("click", () => setChangelogTab("log"));

});
