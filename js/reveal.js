/* =====================================================
   SEM SPOILER DURANTE O SORTEIO + PROGRESSO DE MEDALHA

   O sorteio é salvo no banco na hora do clique, mas os cards são
   revelados aos poucos. Para ninguém descobrir o resultado antes
   (ex.: ver a contagem de jungle subir nas estatísticas), enquanto a
   animação roda as estatísticas, medalhas, histórico, conquistas e
   avisos ficam segurados. Quando o último card aparece, tudo atualiza
   de uma vez e cada jogador recebe um aviso com o progresso das
   medalhas que avançaram.
===================================================== */

let revealDepth = 0;
let statsHeldDuringReveal = false;

/* Progresso que a tela está mostrando agora, por jogador */
let shownProgress = null;

function drawRevealing() {
    return revealDepth > 0;
}

function beginReveal() {
    revealDepth++;
}

function endReveal() {

    revealDepth = Math.max(0, revealDepth - 1);

    if (revealDepth > 0) return;

    if (statsHeldDuringReveal) {
        statsHeldDuringReveal = false;
        /* Atualiza tudo que ficou segurado e avisa o progresso */
        if (typeof onStatsChanged === "function") onStatsChanged(true);
    }

}

/* Envolve as animações do sorteio (todas passam por aqui) */
["animateResults", "animateAddedCard", "animateSingleCard"].forEach(name => {

    const original = window[name];

    if (typeof original !== "function") return;

    window[name] = async function (...args) {
        beginReveal();
        try {
            return await original.apply(this, args);
        } finally {
            endReveal();
        }
    };

});

/* ---------- Progresso de medalha ---------- */

function progressSnapshot(src) {

    const snap = {};

    computePlayerProfiles(src).forEach(p => {
        snap[p.key] = {
            name: p.name,
            badges: ACHIEVEMENT_BADGES.map(b => b.current(p)),
            emblems: EMBLEM_BADGES.map(b => b.current(p))
        };
    });

    return snap;

}

/* Compara com o que a tela mostrava e avisa quem avançou.
   announce = false só atualiza a referência (ex.: ao abrir o site). */
function checkMedalProgress(src, announce) {

    if (!src || !src.partidas) return;

    let now;
    try { now = progressSnapshot(src); } catch (e) { console.error(e); return; }

    if (announce && shownProgress) {

        Object.keys(now).forEach(key => {

            const before = shownProgress[key];
            const after = now[key];
            if (!before) return;

            const lines = [];
            const levelUps = [];

            ACHIEVEMENT_BADGES.forEach((badge, i) => {
                const a = before.badges[i], b = after.badges[i];
                if (b <= a) return;
                const oldLevel = badge.levels.filter(l => a >= l.goal).pop();
                const newLevel = badge.levels.filter(l => b >= l.goal).pop();
                if (newLevel && newLevel !== oldLevel) {
                    levelUps.push(newLevel.medal + " " + newLevel.tierName + " em " + badge.icon + " " + badge.name);
                }
                const next = badge.levels.find(l => b < l.goal);
                lines.push(badge.icon + " " + badge.name + " " + b + (next ? "/" + next.goal + " " + next.medal : " (máximo)"));
            });

            EMBLEM_BADGES.forEach((badge, i) => {
                const a = before.emblems[i], b = after.emblems[i];
                if (b <= a) return;
                if (b >= badge.goal && a < badge.goal) levelUps.push("emblema " + badge.icon + " " + badge.name);
                else if (b < badge.goal) lines.push(badge.icon + " " + badge.name + " " + b + "/" + badge.goal);
            });

            if (levelUps.length) {
                showAnnouncement(after.name + " conquistou " + levelUps.join(" e ") + "!", false, lines.join(" · "), "🎉 Medalha nova!");
            } else if (lines.length) {
                showAnnouncement(after.name + ": " + lines.join(" · "), false, null, "📈 Progresso de medalha");
            }

        });

    }

    shownProgress = now;

}
