/* =====================================================
   LIKE / DISLIKE (espectadores votam na sala)
===================================================== */

function getVotes(matchId, champion) {
    const byMatch = statsData.votos[matchId];
    return (byMatch && byMatch[champion]) || {};
}

async function castVote(matchId, champion, value) {

    if (!IS_VIEWER || !db || !myUid || !matchId) return;

    const current = getVotes(matchId, champion)[myUid] || 0;

    /* Clicar de novo no mesmo voto remove (null) */
    const newValue = current === value ? null : value;

    const suffix = "/votos/" + matchId + "/" + champion + "/" + myUid;

    const updates = {};

    updates["salas/" + roomCode + suffix] = newValue;
    updates["global" + suffix] = newValue;

    try {
        await db.ref().update(updates);
    } catch (error) {
        console.error(error);
        alert("Não foi possível registrar o voto (" + (error.code || error.message) + ").");
    }

}

function createVoteBar(matchId, champion) {

    const bar = document.createElement("div");
    bar.className = "vote-bar";
    bar.dataset.match = matchId;
    bar.dataset.champion = champion;

    [["like", 1], ["dislike", -1]].forEach(([kind, value]) => {

        const button = document.createElement("button");
        button.type = "button";
        button.className = "vote-btn " + kind;
        button.dataset.kind = kind;
        button.onclick = () => castVote(matchId, champion, value);

        bar.appendChild(button);

    });

    return bar;

}

function refreshVoteBars() {

    document.querySelectorAll(".vote-bar").forEach(bar => {

        const votes = getVotes(bar.dataset.match, bar.dataset.champion);

        let likes = 0;
        let dislikes = 0;

        Object.values(votes).forEach(v => {
            if (v === 1) likes++;
            else if (v === -1) dislikes++;
        });

        const mine = myUid ? votes[myUid] || 0 : 0;

        const likeBtn = bar.querySelector(".like");
        const dislikeBtn = bar.querySelector(".dislike");

        likeBtn.textContent = "👍 " + likes;
        dislikeBtn.textContent = "👎 " + dislikes;

        likeBtn.classList.toggle("on", mine === 1);
        dislikeBtn.classList.toggle("on", mine === -1);

        /* Só espectador logado vota; o host só enxerga os números */
        const canVote = IS_VIEWER && !!myUid;

        likeBtn.disabled = !canVote;
        dislikeBtn.disabled = !canVote;

    });

}

/* Adiciona a barra de votos num card (quando há partida e Firebase) */
function appendVoteBar(card, matchId, champion) {

    if (!matchId || !db) return;

    card.appendChild(createVoteBar(matchId, champion));

    refreshVoteBars();

}

